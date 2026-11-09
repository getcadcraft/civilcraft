/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — CSV column names and state ids; the panel words them. */
/**
 * record.js — the factory's own history (0.9 D8.13): each machine's state as time intervals, its part counts, and its alarms as they come
 * and go, recorded from what was read. Simple OEE from that record:
 *
 *   availability = running time / planned time         planned time = the period − planned stops − time not seen (offline), see below
 *   performance  = ideal cycle time × parts made / running time       (shown as measured; the OEE uses it capped at 1)
 *   quality      = good parts / parts made
 *   OEE          = availability × performance × quality
 *
 * Offline time (the machine or its agent not answering) is left out of planned time by default and reported on its own, because nobody knows
 * what the machine did then; `offlineIsDown: true` counts it as lost time instead. Counters from the machine are cumulative: a counter that
 * goes down was reset at the machine, and the new value counts from zero.
 *
 *   makeRecorder({ maxSegments, maxAlarms }) → { observe(id, snap, atMs), plan(id, on, atMs), oee(id, { from, to, idealCycleS, offlineIsDown }), segments(id), alarms(),
 *                                               toJSON(), load(json), csvStates(), csvOee(rows), clear() }
 */
export const STATE_IDS = ['running', 'idle', 'stopped', 'setup', 'down', 'offline', 'planned'];
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

export function makeRecorder({ maxSegments = 4000, maxAlarms = 500 } = {}) {
  let M = new Map();            // id → { seg: [{ s, from, to }], parts: [{ at, total, good, bad }], counters, open: Map(alarmId → alarm), planned }
  let alarms = [];              // { machine, id, level, text, code, from, to }
  const get = (id) => { let m = M.get(id); if (!m) { m = { seg: [], parts: [], counters: { total: null, good: null, bad: null }, open: new Map(), planned: false }; M.set(id, m); } return m; };
  function setState(m, s, at) {
    const last = m.seg[m.seg.length - 1];
    if (last && at < last.to) at = last.to;                    // never backwards
    if (last && last.s === s) { last.to = at; return; }
    if (last) last.to = at;
    m.seg.push({ s, from: at, to: at });
    if (m.seg.length > maxSegments) m.seg.splice(0, m.seg.length - maxSegments);
  }
  function delta(m, key, v) {
    if (!finite(v)) return 0;
    const prev = m.counters[key]; m.counters[key] = v;
    if (prev === null) return 0;                               // first reading: the baseline, not parts made now
    return v >= prev ? v - prev : v;                            // went down: reset at the machine
  }
  function observe(id, snap, at) {
    if (!snap || !finite(at)) return;
    const m = get(id);
    setState(m, m.planned ? 'planned' : (STATE_IDS.includes(snap.state) ? snap.state : 'offline'), at);
    const c = snap.counts || {};
    let dt = delta(m, 'total', c.total), dg = delta(m, 'good', c.good), db = delta(m, 'bad', c.bad);
    if (!finite(c.total) && (dg || db)) dt = dg + db;
    if (finite(c.total) && !finite(c.good) && !finite(c.bad)) dg = dt;
    if (finite(c.total) && finite(c.bad) && !finite(c.good)) dg = Math.max(0, dt - db);
    if (finite(c.total) && finite(c.good) && !finite(c.bad)) db = Math.max(0, dt - dg);
    if (dt || dg || db) m.parts.push({ at, total: dt, good: dg, bad: db });
    if (m.parts.length > maxSegments) m.parts.splice(0, m.parts.length - maxSegments);
    const now = new Set();
    for (const a of snap.alarms || []) {
      const key = String(a.id || a.text); now.add(key);
      if (!m.open.has(key)) { const row = { machine: id, id: key, level: a.level === 'fault' ? 'fault' : 'warning', text: String(a.text || '').slice(0, 200), code: String(a.code || '').slice(0, 40), from: at, to: null }; m.open.set(key, row); alarms.push(row); if (alarms.length > maxAlarms) alarms.splice(0, alarms.length - maxAlarms); }
    }
    for (const [key, row] of m.open) if (!now.has(key)) { row.to = at; m.open.delete(key); }
  }
  /** A planned stop (a break, a changeover the plan allows for): it is not lost time. */
  function plan(id, on, at) { const m = get(id); m.planned = !!on; const last = m.seg[m.seg.length - 1]; if (last) setState(m, on ? 'planned' : (last.s === 'planned' ? 'idle' : last.s), at); }
  function times(id, from, to) {
    const out = Object.fromEntries(STATE_IDS.map((s) => [s, 0])); const m = M.get(id); if (!m) return out;
    for (const g of m.seg) { const a = Math.max(from, g.from), b = Math.min(to, g.to); if (b > a) out[g.s] += b - a; }
    return out;
  }
  function oee(id, { from = -Infinity, to = Infinity, idealCycleS = null, offlineIsDown = false } = {}) {
    const m = M.get(id);
    if (!m || !m.seg.length) return { id, seen: false };
    const lo = Math.max(from, m.seg[0].from), hi = Math.min(to, m.seg[m.seg.length - 1].to);
    const t = times(id, lo, hi), periodMs = Math.max(0, hi - lo);
    const planned = periodMs - t.planned - (offlineIsDown ? 0 : t.offline);
    let total = 0, good = 0, bad = 0;
    for (const p of m.parts) if (p.at > lo && p.at <= hi) { total += p.total; good += p.good; bad += p.bad; }
    const availability = planned > 0 ? t.running / planned : null;
    const perfRaw = idealCycleS > 0 && t.running > 0 ? (idealCycleS * 1000 * total) / t.running : null;
    const performance = perfRaw === null ? null : Math.min(1, perfRaw);
    const quality = total > 0 ? good / total : null;
    const value = availability !== null && performance !== null && quality !== null ? availability * performance * quality : null;
    return { id, seen: true, from: lo, to: hi, periodS: periodMs / 1000, plannedS: planned / 1000, times: Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v / 1000])), total, good, bad, availability, performance, performanceMeasured: perfRaw, quality, oee: value };
  }
  return {
    observe, plan, oee, times,
    ids: () => [...M.keys()],
    segments: (id) => (M.get(id)?.seg || []).map((g) => ({ ...g })),
    alarms: () => alarms.map((a) => ({ ...a })),
    openAlarms: (id) => [...(M.get(id)?.open.values() || [])].map((a) => ({ ...a })),
    isPlanned: (id) => !!M.get(id)?.planned,
    clear() { M = new Map(); alarms = []; },
    toJSON() { return { format: 'cadcraft-factory-history', version: 1, machines: Object.fromEntries([...M].map(([id, m]) => [id, { seg: m.seg, parts: m.parts, counters: m.counters, planned: m.planned }])), alarms }; },
    load(j) {
      M = new Map(); alarms = [];
      if (!j || j.format !== 'cadcraft-factory-history' || typeof j.machines !== 'object') return false;
      for (const [id, x] of Object.entries(j.machines).slice(0, 500)) {
        const seg = (Array.isArray(x.seg) ? x.seg : []).filter((g) => STATE_IDS.includes(g.s) && finite(g.from) && finite(g.to) && g.to >= g.from).slice(-maxSegments);
        const parts = (Array.isArray(x.parts) ? x.parts : []).filter((p) => finite(p.at) && finite(p.total)).slice(-maxSegments);
        const c = x.counters || {};
        M.set(String(id).slice(0, 80), { seg, parts, counters: { total: finite(c.total) ? c.total : null, good: finite(c.good) ? c.good : null, bad: finite(c.bad) ? c.bad : null }, open: new Map(), planned: !!x.planned });
      }
      alarms = (Array.isArray(j.alarms) ? j.alarms : []).filter((a) => a && finite(a.from)).slice(-maxAlarms).map((a) => ({ machine: String(a.machine), id: String(a.id), level: a.level === 'fault' ? 'fault' : 'warning', text: String(a.text || ''), code: String(a.code || ''), from: a.from, to: finite(a.to) ? a.to : a.from }));
      return true;
    },
    csvStates() {
      const rows = ['machine,state,from,to,seconds'];
      for (const [id, m] of M) for (const g of m.seg) rows.push([csv(id), g.s, new Date(g.from).toISOString(), new Date(g.to).toISOString(), ((g.to - g.from) / 1000).toFixed(1)].join(','));
      return rows.join('\n') + '\n';
    },
  };
}

/** A CSV cell: quoted when needed; a cell that looks like a formula gets a leading quote. */
export function csv(v) { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
export function csvOee(rows) {
  const p = (v) => (v === null || v === undefined ? '' : (v * 100).toFixed(1));
  return ['machine,period_s,planned_s,running_s,parts,good,bad,availability_pct,performance_pct,quality_pct,oee_pct',
    ...rows.filter((r) => r.seen).map((r) => [csv(r.name || r.id), r.periodS.toFixed(0), r.plannedS.toFixed(0), r.times.running.toFixed(0), r.total, r.good, r.bad, p(r.availability), p(r.performance), p(r.quality), p(r.oee)].join(','))].join('\n') + '\n';
}
