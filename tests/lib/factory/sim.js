/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — MTConnect element and value names; nothing here is shown as words. */
/**
 * sim.js — a seeded simulated machine shop that answers like an MTConnect agent (0.9 D8.13). It is what the factory panel reads when no
 * real machine is connected, and what the tests read: the same reader (mtconnect.js) parses its XML, so the whole path from the agent's
 * document to OEE is exercised. Same seed + same clock = the same history.
 *
 *   makeShop({ seed, machines: [{ id, name, cycleS, mtbfH, mttrMin, scrap, pauseEvery, pauseS }], start })
 *     .advance(ms)        run the shop's clock to ms (epoch milliseconds); events get sequence numbers like an agent's buffer
 *     .fetch(url)         a fetch() for http://sim.local/<id>/{probe,current,sample?from=&count=} → { ok, status, text() }
 *     .truth(id)          what the simulator did: { parts, good, bad, runMs, downMs, idleMs } (tests compare OEE to it)
 *     .instanceId, .bufferSize
 * A machine cycles: run one part (cycleS, ±5 %), sometimes a short wait (pauseEvery parts, pauseS), breaks down at random (exponential,
 * mean mtbfH hours of running) and is repaired (exponential, mean mttrMin). A part is bad with probability scrap.
 */
export const SIM_BASE = 'http://sim.local';

export function rng(seed) {
  let a = (Number(seed) >>> 0) || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ID = /^[A-Za-z0-9_.-]{1,80}$/;

export function makeShop({ seed = 1, machines = [], start = Date.UTC(2026, 10, 3, 6, 0, 0), bufferSize = 8192 } = {}) {
  const r = rng(seed);
  const exp = (mean) => -Math.log(1 - r()) * mean;
  const instanceId = String(1000 + Math.floor(r() * 9000));
  let seq = 1; const buf = [];           // { seq, id, item, value, at }
  const M = new Map();
  const emit = (m, item, value, at) => { const e = { seq: seq++, id: m.id, item, value: String(value), at }; buf.push(e); if (buf.length > bufferSize) buf.shift(); m.last[item] = e; };
  for (const raw of machines) {
    const id = String(raw.id || ''); if (!ID.test(id) || M.has(id)) continue;
    const m = { id, name: String(raw.name || id).slice(0, 80), cycleS: Math.max(1, Number(raw.cycleS) || 30), mtbfS: Math.max(0, Number(raw.mtbfH) || 0) * 3600, mttrS: Math.max(1, Number(raw.mttrMin) || 15) * 60,
      scrap: Math.min(0.9, Math.max(0, Number(raw.scrap) || 0)), pauseEvery: Math.max(0, Math.floor(Number(raw.pauseEvery) || 0)), pauseS: Math.max(0, Number(raw.pauseS) || 0),
      t: start, phase: 'run', phaseEnd: 0, nextFail: Infinity, parts: 0, good: 0, bad: 0, runMs: 0, downMs: 0, idleMs: 0, last: {} };
    m.nextFail = m.mtbfS ? start + exp(m.mtbfS) * 1000 : Infinity;
    M.set(id, m);
    emit(m, 'avail', 'AVAILABLE', start); emit(m, 'mode', 'AUTOMATIC', start); emit(m, 'estop', 'ARMED', start);
    emit(m, 'program', 'O' + (1000 + Math.floor(r() * 9000)), start); emit(m, 'pc_all', 0, start); emit(m, 'pc_good', 0, start); emit(m, 'pc_bad', 0, start);
    emit(m, 'system', 'NORMAL', start);
    startCycle(m, start);
  }
  function startCycle(m, at) { m.phase = 'run'; m.phaseEnd = at + m.cycleS * (0.95 + 0.1 * r()) * 1000; emit(m, 'exec', 'ACTIVE', at); emit(m, 'speed', Math.round(8000 + 2000 * r()), at); emit(m, 'load', Math.round(40 + 30 * r()), at); }
  function step(m, to) {
    while (m.t < to) {
      const end = Math.min(to, m.phaseEnd, m.phase === 'run' ? m.nextFail : Infinity);
      const dt = end - m.t;
      if (m.phase === 'run') m.runMs += dt; else if (m.phase === 'down') m.downMs += dt; else m.idleMs += dt;
      m.t = end;
      if (m.t >= to && m.t < m.phaseEnd && !(m.phase === 'run' && m.t >= m.nextFail)) break;
      if (m.phase === 'run' && m.t >= m.nextFail) {
        m.phase = 'down'; m.phaseEnd = m.t + exp(m.mttrS) * 1000; m.nextFail = Infinity;
        emit(m, 'exec', 'STOPPED', m.t); emit(m, 'speed', 0, m.t); emit(m, 'load', 0, m.t); emit(m, 'system', 'FAULT', m.t);
      } else if (m.phase === 'run') {
        m.parts++; const bad = r() < m.scrap; if (bad) m.bad++; else m.good++;
        emit(m, 'pc_all', m.parts, m.t); emit(m, bad ? 'pc_bad' : 'pc_good', bad ? m.bad : m.good, m.t);
        if (m.pauseEvery && m.parts % m.pauseEvery === 0 && m.pauseS > 0) { m.phase = 'wait'; m.phaseEnd = m.t + m.pauseS * 1000; emit(m, 'exec', 'READY', m.t); emit(m, 'speed', 0, m.t); }
        else startCycle(m, m.t);
      } else if (m.phase === 'down') {
        emit(m, 'system', 'NORMAL', m.t); m.nextFail = m.mtbfS ? m.t + exp(m.mtbfS) * 1000 : Infinity; startCycle(m, m.t);
      } else startCycle(m, m.t);
    }
  }
  const ITEMS = [   // id suffix → [category group, element, attributes]
    ['avail', 'Events', 'Availability', ''], ['estop', 'Events', 'EmergencyStop', ''], ['mode', 'Events', 'ControllerMode', ''], ['exec', 'Events', 'Execution', ''],
    ['program', 'Events', 'Program', ''], ['pc_all', 'Events', 'PartCount', ' subType="ALL"'], ['pc_good', 'Events', 'PartCount', ' subType="GOOD"'], ['pc_bad', 'Events', 'PartCount', ' subType="BAD"'],
    ['speed', 'Samples', 'SpindleSpeed', ''], ['load', 'Samples', 'Load', ''], ['system', 'Condition', 'SYSTEM', ''],
  ];
  const NAMES = { speed: 'Sspeed', load: 'Sload', pc_all: 'partcount', pc_good: 'goodparts', pc_bad: 'badparts' };
  const iso = (ms) => new Date(ms).toISOString();
  const head = (now) => `<Header creationTime="${iso(now)}" sender="sim.local" instanceId="${instanceId}" version="2.0" bufferSize="${bufferSize}" firstSequence="${buf.length ? buf[0].seq : seq}" lastSequence="${seq - 1}" nextSequence="${seq}"/>`;
  function obsXml(e) {
    const it = ITEMS.find((x) => x[0] === e.item); const did = e.id + '_' + e.item; const nm = NAMES[e.item] ? ` name="${NAMES[e.item]}"` : '';
    if (it[1] === 'Condition') return e.value === 'FAULT' ? `<Fault dataItemId="${did}" timestamp="${iso(e.at)}" sequence="${e.seq}" type="SYSTEM" nativeCode="E101">Simulated breakdown</Fault>` : `<Normal dataItemId="${did}" timestamp="${iso(e.at)}" sequence="${e.seq}" type="SYSTEM"/>`;
    return `<${it[2]} dataItemId="${did}"${nm}${it[3]} timestamp="${iso(e.at)}" sequence="${e.seq}">${esc(e.value)}</${it[2]}>`;
  }
  function stream(m, events) {
    const g = { Samples: [], Events: [], Condition: [] };
    for (const e of events) { const it = ITEMS.find((x) => x[0] === e.item); g[it[1]].push(obsXml(e)); }
    const body = Object.entries(g).filter(([, v]) => v.length).map(([k, v]) => `<${k}>${v.join('')}</${k}>`).join('');
    return `<DeviceStream name="${esc(m.id)}" uuid="sim-${esc(m.id)}"><ComponentStream component="Controller" name="controller" componentId="${esc(m.id)}_c">${body}</ComponentStream></DeviceStream>`;
  }
  function probe(list, now) {
    const dev = (m) => `<Device id="${esc(m.id)}" name="${esc(m.id)}" uuid="sim-${esc(m.id)}"><Description>${esc(m.name)} (simulated)</Description><DataItems>` +
      ITEMS.map(([k, cat, el, sub]) => `<DataItem id="${esc(m.id)}_${k}"${NAMES[k] ? ` name="${NAMES[k]}"` : ''} category="${cat === 'Samples' ? 'SAMPLE' : cat === 'Events' ? 'EVENT' : 'CONDITION'}" type="${cat === 'Condition' ? el : el.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()}"${sub}/>`).join('') + '</DataItems></Device>';
    return `<?xml version="1.0" encoding="UTF-8"?><MTConnectDevices xmlns="urn:mtconnect.org:MTConnectDevices:2.0">${head(now)}<Devices>${list.map(dev).join('')}</Devices></MTConnectDevices>`;
  }
  const err = (code, text) => `<?xml version="1.0" encoding="UTF-8"?><MTConnectError xmlns="urn:mtconnect.org:MTConnectError:2.0">${head(now0())}<Errors><Error errorCode="${code}">${esc(text)}</Error></Errors></MTConnectError>`;
  let clock = start; const now0 = () => clock;
  const answer = (status, text) => ({ ok: status >= 200 && status < 300, status, text: async () => text });

  return {
    instanceId, bufferSize, machines: () => [...M.values()].map((m) => ({ id: m.id, name: m.name })),
    advance(to) { if (!(to > clock)) return; for (const m of M.values()) step(m, to); clock = to; },
    now: () => clock,
    truth(id) { const m = M.get(id); return m ? { parts: m.parts, good: m.good, bad: m.bad, runMs: m.runMs, downMs: m.downMs, idleMs: m.idleMs } : null; },
    async fetch(url) {
      let u; try { u = new URL(url); } catch { return answer(400, err('INVALID_REQUEST', 'bad url')); }
      if (u.origin !== SIM_BASE) return answer(404, err('INVALID_REQUEST', 'not the simulator'));
      const parts = u.pathname.split('/').filter(Boolean); const what = parts.pop() || ''; const dev = parts[0] || '';
      const list = dev ? [M.get(dev)].filter(Boolean) : [...M.values()];
      if (dev && !list.length) return answer(404, err('NO_DEVICE', 'No device ' + dev));
      if (what === 'probe') return answer(200, probe(list, clock));
      if (what === 'current') return answer(200, `<?xml version="1.0" encoding="UTF-8"?><MTConnectStreams xmlns="urn:mtconnect.org:MTConnectStreams:2.0">${head(clock)}<Streams>${list.map((m) => stream(m, Object.values(m.last).sort((a, b) => a.seq - b.seq))).join('')}</Streams></MTConnectStreams>`);
      if (what === 'sample') {
        const from = Number(u.searchParams.get('from') ?? (buf.length ? buf[0].seq : seq)), count = Math.min(10000, Number(u.searchParams.get('count') || 100));
        if (!Number.isFinite(from) || (buf.length && from < buf[0].seq) || from > seq) return answer(400, err('OUT_OF_RANGE', "'from' must be in the agent's buffer"));
        const ids = new Set(list.map((m) => m.id)); const picked = []; let last = from - 1;
        for (const e of buf) { if (e.seq < from) continue; if (picked.length >= count) break; last = e.seq; if (ids.has(e.id)) picked.push(e); }
        const xml = `<?xml version="1.0" encoding="UTF-8"?><MTConnectStreams xmlns="urn:mtconnect.org:MTConnectStreams:2.0">${head(clock).replace(/nextSequence="\d+"/, `nextSequence="${last + 1}"`)}<Streams>${list.map((m) => stream(m, picked.filter((e) => e.id === m.id))).join('')}</Streams></MTConnectStreams>`;
        return answer(200, xml);
      }
      return answer(400, err('INVALID_REQUEST', 'Unknown request ' + what));
    },
  };
}
