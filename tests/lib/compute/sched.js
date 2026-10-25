/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: error codes for the caller */
/**
 * sched.js — hands work to whichever device is free and fastest (0.7 CU.2; CU.6 hybrid and CU.7 LAN nodes build on it).
 * Work is a range of units (tiles, rows, sample passes, triangles…); devices pull chunks sized to their measured speed so each
 * chunk takes about `targetMs`, and chunks shrink near the end so every device finishes together. Results are keyed by
 * position, so the output never depends on which device ran what (determinism). A chunk that fails on a device goes back to
 * the queue (a LAN node leaving mid-render loses nothing); a device that fails `maxFailures` times in a row is dropped for
 * this run. DOM-free.
 *
 *   const s = createScheduler({ devices, targetMs })
 *     devices: [{ id, lanes = 1, minChunk = 1, maxChunk = Infinity, speed? (units/ms, a starting guess),
 *                 run(chunk, { signal }) → Promise<result> }]          chunk = { index, start, count }
 *     targetMs: how long a chunk should take on any device (default 120; live view uses less)
 *   await s.runRange(total, { signal, onChunk(chunk, result, deviceId), onProgress(doneUnits, total), maxFailures = 3 })
 *     → { chunks: [{ index, start, count, device, ms }], byDevice: { id: { units, ms, chunks, failures, dropped } } }
 *   s.speeds() → { id: units/ms }            measured (exponential average), carried from run to run
 *   splitByWeight(total, weights) → counts   whole units in proportion (largest remainder), sums to total
 *
 * Errors: the run rejects with code 'cancelled' (signal) or 'no_devices' (every device dropped with work left).
 */

function schedError(code, message) {
  const e = new Error(message || code);
  e.code = code;
  return e;
}
const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** Whole units in proportion to the weights (largest remainder; ties to the earlier one). Sums to total exactly. */
export function splitByWeight(total, weights) {
  const n = weights.length;
  const T = Math.max(0, Math.floor(total) || 0);
  if (!n) return [];
  const w = weights.map((x) => (Number.isFinite(x) && x > 0 ? x : 0));
  const sum = w.reduce((a, b) => a + b, 0);
  if (sum <= 0) { const out = new Array(n).fill(0); out[0] = T; return out; }
  const exact = w.map((x) => (T * x) / sum);
  const out = exact.map(Math.floor);
  let left = T - out.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left > 0; k = (k + 1) % n, left--) out[order[k][1]]++;
  return out;
}

export function createScheduler({ devices = [], targetMs = 120 } = {}) {
  const speed = new Map();   // id → units per ms
  for (const d of devices) if (Number.isFinite(d.speed) && d.speed > 0) speed.set(d.id, d.speed);

  function chunkFor(dev, remaining, lanesLeft) {
    const s = speed.get(dev.id);
    const min = Math.max(1, Math.floor(dev.minChunk || 1));
    const max = Math.max(min, Math.floor(dev.maxChunk || Infinity));
    // unmeasured: a small first chunk measures it
    let want = s ? Math.round(s * targetMs) : min;
    // near the end: no more than a fair share of what is left, so devices finish together (guided self-scheduling)
    const fair = Math.ceil(remaining / Math.max(1, lanesLeft));
    want = Math.min(want, Math.max(min, fair));
    return Math.max(1, Math.min(remaining, max, Math.max(min, want)));
  }

  async function runRange(total, { signal = null, onChunk = null, onProgress = null, maxFailures = 3 } = {}) {
    const T = Math.max(0, Math.floor(total) || 0);
    const live = devices.filter((d) => typeof d.run === 'function');
    const byDevice = Object.fromEntries(live.map((d) => [d.id, { units: 0, ms: 0, chunks: 0, failures: 0, dropped: false }]));
    const chunks = [];
    const retry = [];          // { start, count } handed back by a failed device
    let next = 0, done = 0, index = 0, finished = false;
    const dropped = new Set();
    const idle = new Map();    // device → lanes that ran out of work (woken again when a failed chunk comes back)

    return new Promise((resolve, reject) => {
      let active = 0;
      const fail = (err) => { if (!finished) { finished = true; reject(err); } };
      if (signal?.aborted) return fail(schedError('cancelled'));
      signal?.addEventListener('abort', () => fail(schedError('cancelled')), { once: true });

      const lanesLeft = () => live.filter((d) => !dropped.has(d.id)).reduce((a, d) => a + Math.max(1, d.lanes || 1), 0);
      const take = (dev) => {
        if (retry.length) {
          const r = retry.shift();
          // a retried piece is cut to this device's chunk size; the rest waits again
          const c = Math.min(r.count, chunkFor(dev, r.count, 1));
          if (c < r.count) retry.unshift({ start: r.start + c, count: r.count - c });
          return { start: r.start, count: c };
        }
        if (next >= T) return null;
        const c = chunkFor(dev, T - next, lanesLeft());
        const piece = { start: next, count: c };
        next += c;
        return piece;
      };
      const check = () => {
        if (finished) return;
        if (done >= T && active === 0) { finished = true; chunks.sort((a, b) => a.start - b.start); resolve({ chunks, byDevice }); return; }
        if (active === 0 && (next < T || retry.length) && live.every((d) => dropped.has(d.id))) fail(schedError('no_devices', 'every device failed'));
      };
      const lane = async (dev) => {
        while (!finished && !dropped.has(dev.id)) {
          const piece = take(dev);
          if (!piece) break;
          const chunk = { index: index++, start: piece.start, count: piece.count };
          active++;
          const t0 = clock();
          let result, ok = true;
          try { result = await dev.run(chunk, { signal }); } catch (e) { ok = false; if (e?.code === 'cancelled' || signal?.aborted) { active--; fail(schedError('cancelled')); return; } }
          active--;
          if (finished) return;
          const ms = Math.max(0.001, clock() - t0);
          const rec = byDevice[dev.id];
          if (!ok) {
            rec.failures++;
            retry.push({ start: piece.start, count: piece.count });
            retry.sort((a, b) => a.start - b.start);
            if (rec.failures >= maxFailures) { rec.dropped = true; dropped.add(dev.id); }
            // the others may be idle waiting for work: wake them
            for (const d of live) if (!dropped.has(d.id) && d !== dev && idle.get(d) > 0) { idle.set(d, idle.get(d) - 1); lane(d); }
            check();
            continue;
          }
          rec.failures = 0;
          rec.units += piece.count; rec.ms += ms; rec.chunks++;
          const s = piece.count / ms, old = speed.get(dev.id);
          speed.set(dev.id, old == null ? s : old * 0.6 + s * 0.4);
          chunks.push({ index: chunk.index, start: piece.start, count: piece.count, device: dev.id, ms });
          done += piece.count;
          try { onChunk?.(chunk, result, dev.id); } catch (e) { fail(e); return; }
          try { onProgress?.(done, T); } catch { /* progress is advisory */ }
        }
        idle.set(dev, (idle.get(dev) || 0) + 1);
        check();
      };
      if (!live.length) return T ? fail(schedError('no_devices', 'no device to run on')) : check();
      for (const d of live) for (let l = 0; l < Math.max(1, d.lanes || 1); l++) lane(d);
      check();
    });
  }

  return {
    runRange,
    speeds: () => Object.fromEntries(speed),
    setSpeed(id, unitsPerMs) { if (Number.isFinite(unitsPerMs) && unitsPerMs > 0) speed.set(id, unitsPerMs); },
  };
}
