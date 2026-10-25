/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: error codes for the caller */
/**
 * hybrid.js — one picture from several devices at once (0.7 CU.6): each pass's samples are split between the devices in
 * proportion to their measured speed (samples per second), each device renders ITS OWN sample indices of every pixel, and the
 * parts are added in device order. Every sample index is rendered exactly once, so the picture is the same estimator as one
 * device alone (statistically equal; not the same bytes, because the split follows the measured speed). A device that fails
 * mid-pass hands its samples to the others in the same pass; one that fails `maxFailures` times is dropped. DOM-free.
 *
 *   const h = createHybrid({ devices, W, H, maxFailures = 2 })
 *     devices: [{ id, kind: 'gpu'|'cpu'|'lan', speed? (samples/s guess), renderRange(s0, spp, { signal }) → Promise<Float32Array
 *               W·H·4 (Σr, Σg, Σb, n) of exactly those samples> }]     — cpu-render.js's renderRange is one; render's GPU
 *               tracer is the other once it renders a given sample range; a LAN node (CU.7) is a third.
 *   await h.run({ passes, spp, signal, onPass(accum, samples) }) → { samples, ms, stopped, byDevice: { id: { samples, ms, failures, dropped } } }
 *   h.accum · h.samples · h.split(spp) → [n per device] (what the next pass would give each) · h.speeds()
 *   worthIt(rows, { gain = 1.1 }) → bool   from bench rows: hybrid on by default only where it measured ≥ 10 % faster than the
 *                                          fastest single device (PART3 CU.6: "gain or it stays off by default")
 */
import { splitByWeight } from './sched.js';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function createHybrid({ devices, W, H, maxFailures = 2 }) {
  if (!Array.isArray(devices) || !devices.length) throw new Error('hybrid: no devices');
  const accum = new Float32Array(W * H * 4);
  const speed = new Map(devices.map((d) => [d.id, Number.isFinite(d.speed) && d.speed > 0 ? d.speed : null]));
  const stat = Object.fromEntries(devices.map((d) => [d.id, { samples: 0, ms: 0, failures: 0, dropped: false }]));
  let samples = 0;
  const live = () => devices.filter((d) => !stat[d.id].dropped);

  function split(spp, list = live()) {
    const known = list.map((d) => speed.get(d.id));
    // unmeasured devices get an equal share of the first pass (that is how they get measured)
    const avg = known.filter((x) => x).reduce((a, b) => a + b, 0) / Math.max(1, known.filter((x) => x).length) || 1;
    const out = splitByWeight(spp, known.map((x) => x || avg));
    // every live device gets at least one sample while it is unmeasured, so it is measured
    for (let i = 0; i < list.length; i++) if (!known[i] && !out[i] && spp >= list.length) { const j = out.indexOf(Math.max(...out)); out[j]--; out[i]++; }
    return out;
  }

  async function pass(spp, signal) {
    let todo = [{ s0: samples, n: spp }];
    const parts = [];   // [deviceIndex, s0, Float32Array]
    while (todo.length) {
      const list = live();
      if (!list.length) { const e = new Error('hybrid: every device failed'); e.code = 'no_devices'; throw e; }
      const next = [];
      // each range in todo is split among the live devices by speed
      const jobs = [];
      for (const r of todo) {
        const counts = split(r.n, list);
        let s0 = r.s0;
        list.forEach((d, i) => { if (counts[i] > 0) jobs.push({ d, s0, n: counts[i] }); s0 += counts[i]; });
      }
      await Promise.all(jobs.map(async (j) => {
        const t0 = now();
        try {
          const part = await j.d.renderRange(j.s0, j.n, { signal });
          const ms = Math.max(0.01, now() - t0), st = stat[j.d.id];
          st.samples += j.n; st.ms += ms; st.failures = 0;
          const sp = j.n / (ms / 1000), old = speed.get(j.d.id);
          speed.set(j.d.id, old == null ? sp : old * 0.6 + sp * 0.4);
          parts.push([devices.indexOf(j.d), j.s0, part]);
        } catch (e) {
          if (e?.code === 'cancelled' || signal?.aborted) throw Object.assign(new Error('cancelled'), { code: 'cancelled' });
          const st = stat[j.d.id];
          st.failures++;
          if (st.failures >= maxFailures) st.dropped = true;
          next.push({ s0: j.s0, n: j.n });   // redone by the others in this same pass
        }
      }));
      todo = next;
    }
    // add in a fixed order (by first sample index): independent of which device finished first
    parts.sort((a, b) => a[1] - b[1]);
    for (const [, , part] of parts) for (let i = 0; i < accum.length; i++) accum[i] += part[i];
    samples += spp;
  }

  return {
    accum, W, H,
    get samples() { return samples; },
    split: (spp) => split(spp),
    speeds: () => Object.fromEntries(speed),
    async run({ passes = 1, spp = devices.length, signal = null, onPass = null } = {}) {
      const t0 = now();
      let stopped = false;
      for (let p = 0; p < passes; p++) {
        if (signal?.aborted) { stopped = true; break; }
        try { await pass(spp, signal); } catch (e) { if (e?.code === 'cancelled') { stopped = true; break; } throw e; }
        try { onPass?.(accum, samples); } catch { /* advisory */ }
      }
      return { samples, ms: now() - t0, stopped, byDevice: JSON.parse(JSON.stringify(stat)) };
    },
  };
}

/** From bench rows (bench.js): is hybrid worth turning on by default on this machine? */
export function worthIt(rows, { gain = 1.1 } = {}) {
  const k = (rows || []).filter((r) => typeof r.test === 'string' && r.test.startsWith('kernel.') && r.value > 0);
  const hybrid = k.filter((r) => r.test === 'kernel.hybrid');
  const single = k.filter((r) => r.test !== 'kernel.hybrid');
  if (!hybrid.length || !single.length) return false;
  // per scene: hybrid samples/s ≥ gain × the best single device
  const scenes = [...new Set(hybrid.map((r) => r.scene))];
  return scenes.every((sc) => {
    const h = hybrid.find((r) => r.scene === sc)?.value || 0;
    const best = Math.max(0, ...single.filter((r) => r.scene === sc).map((r) => r.value));
    return best > 0 && h >= gain * best;
  });
}
