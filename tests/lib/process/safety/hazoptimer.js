/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hazoptimer.js — the facilitation timer of a HAZOP or What-If session (0.8 CH.14, chem-mount_PART_5). DOM-free and clock-free: the caller hands in `now()` (ms), so the same code runs
 * in the P&ID panel, in a worker and in a test. One node is on the clock at a time; the time each node used is kept, and the time left of the whole session follows.
 *
 *   plan(nodes, totalMinutes, { coverage? }) → [{ id, name, minutes }]    the session's minutes shared out by what each node still has to cover (guide word × parameter pairs left),
 *                                                                          at least `MIN_MINUTES` each; with no coverage, shared evenly. A starting suggestion the facilitator edits.
 *   createTimer({ nodes: [{ id, name, minutes }], now, sessionMinutes? }) → timer
 *     timer.start(id) · pause() · resume() · next()    next = the node after the current one that is not done (marks the current done)
 *     timer.markDone(id) · extend(id, minutes) · reset()
 *     timer.state() → { current, running, nodes: [{ id, name, plannedS, spentS, leftS, overS, done }], plannedS, spentS, leftS, overS, sessionLeftS }
 *     timer.snapshot() / restore(snap)    JSON, for the add-on's storage (a closed page keeps the numbers; a timer that was running keeps counting by the wall clock)
 *   toCsv(state) → text (node, planned min, used min, over min, done)
 * A study aid for the team: it records time, it does not decide that a node is finished.
 */
export const MIN_MINUTES = 5;

export function plan(nodes, totalMinutes, { coverage = null } = {}) {
  const list = (nodes || []).filter((n) => n && n.id);
  if (!list.length) return [];
  const total = Math.max(MIN_MINUTES * list.length, Number(totalMinutes) || 0);
  const weight = list.map((n) => { const c = coverage && coverage[n.id]; return c && Number.isFinite(c.total) ? Math.max(0, c.total - (c.covered || 0)) : 1; });
  const sum = weight.reduce((a, b) => a + b, 0) || list.length;
  const w = sum === 0 || weight.every((x) => x === 0) ? list.map(() => 1) : weight;
  const ws = w.reduce((a, b) => a + b, 0);
  return list.map((n, i) => ({ id: n.id, name: n.name || n.id, minutes: Math.max(MIN_MINUTES, Math.round(total * w[i] / ws / 5) * 5) }));
}

export function createTimer({ nodes = [], now = () => Date.now(), sessionMinutes = null } = {}) {
  let rows = nodes.filter((n) => n && n.id).map((n) => ({ id: String(n.id), name: String(n.name || n.id), plannedS: Math.max(60, Math.round((Number(n.minutes) || MIN_MINUTES) * 60)), spentMs: 0, done: false }));
  let current = null, since = null;            // since = wall-clock ms when the current node was last started or resumed; null = paused
  const byId = (id) => rows.find((r) => r.id === id);
  const bank = () => { if (current && since != null) { const r = byId(current); if (r) r.spentMs += Math.max(0, now() - since); since = null; } };
  const api = {
    start(id) { if (!byId(id)) throw new Error('No node ' + id + ' in this session.'); bank(); current = id; since = now(); return api.state(); },
    pause() { bank(); return api.state(); },
    resume() { if (current && since == null) since = now(); return api.state(); },
    markDone(id) { const r = byId(id); if (r) r.done = true; if (id === current) { bank(); } return api.state(); },
    next() {
      bank(); if (current) { const r = byId(current); if (r) r.done = true; }
      const i = rows.findIndex((r) => r.id === current), after = rows.slice(i + 1).concat(rows.slice(0, Math.max(i, 0))).find((r) => !r.done);
      if (!after) { current = null; return api.state(); }
      current = after.id; since = now(); return api.state();
    },
    extend(id, minutes) { const r = byId(id); if (!r) throw new Error('No node ' + id); r.plannedS += Math.round(Number(minutes) * 60) || 0; r.plannedS = Math.max(60, r.plannedS); return api.state(); },
    reset() { current = null; since = null; for (const r of rows) { r.spentMs = 0; r.done = false; } return api.state(); },
    state() {
      const t = now();
      const out = rows.map((r) => { const live = r.id === current && since != null ? Math.max(0, t - since) : 0, spentS = Math.round((r.spentMs + live) / 1000);
        return { id: r.id, name: r.name, plannedS: r.plannedS, spentS, leftS: Math.max(0, r.plannedS - spentS), overS: Math.max(0, spentS - r.plannedS), done: r.done }; });
      const plannedS = out.reduce((a, r) => a + r.plannedS, 0), spentS = out.reduce((a, r) => a + r.spentS, 0);
      const sessionS = sessionMinutes ? Math.round(sessionMinutes * 60) : plannedS;
      return { current, running: !!(current && since != null), nodes: out, plannedS, spentS, leftS: out.reduce((a, r) => a + r.leftS, 0), overS: out.reduce((a, r) => a + r.overS, 0), sessionLeftS: sessionS - spentS };
    },
    snapshot() { return { v: 1, current, since, sessionMinutes, rows: rows.map((r) => ({ ...r })) }; },
    restore(s) {
      if (!s || s.v !== 1 || !Array.isArray(s.rows)) return false;
      const known = new Map(rows.map((r) => [r.id, r]));
      rows = rows.map((r) => { const o = s.rows.find((x) => x.id === r.id); return o ? { ...r, plannedS: Number(o.plannedS) > 0 ? o.plannedS : r.plannedS, spentMs: Math.max(0, Number(o.spentMs) || 0), done: !!o.done } : r; });
      current = known.has(s.current) ? s.current : null; since = current && Number.isFinite(s.since) ? s.since : null;
      return true;
    },
    /** The nodes of the session changed (a node drawn or renamed): keep the time already used, add the new ones with `minutes`. */
    sync(next, minutes = 15) {
      const old = new Map(rows.map((r) => [r.id, r]));
      rows = next.filter((n) => n && n.id).map((n) => { const o = old.get(String(n.id)); return o ? { ...o, name: String(n.name || n.id) } : { id: String(n.id), name: String(n.name || n.id), plannedS: minutes * 60, spentMs: 0, done: false }; });
      if (current && !old.has(current)) { current = null; since = null; }
      return api.state();
    },
  };
  return api;
}

export function toCsv(state) {
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }, m = (s) => (s / 60).toFixed(1);
  return ['node,name,planned_min,used_min,over_min,done'].concat(state.nodes.map((n) => [n.id, esc(n.name), m(n.plannedS), m(n.spentS), m(n.overS), n.done ? 'yes' : 'no'].join(','))).join('\n') + '\n';
}
export const clock = (s) => { const a = Math.abs(Math.round(s)), h = Math.floor(a / 3600), m = Math.floor((a % 3600) / 60), x = a % 60, p = (n) => String(n).padStart(2, '0'); return (s < 0 ? '-' : '') + (h ? h + ':' + p(m) : m) + ':' + p(x); };
