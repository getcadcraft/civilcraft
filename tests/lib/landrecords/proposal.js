/* SPDX-License-Identifier: Apache-2.0 */
/**
 * proposal.js — changes to parcels as proposals (0.11 LR.5): cut one into lots, make adjoining ones one, move the line between two, or
 * change a designation. A proposal holds the lots it would make; nothing in the drawing changes until the person applies it. DOM-free.
 *
 * A LOT here is { id?, name, ring: [{ x, y }] (project units, arcs already chords), use, zone }.
 *
 *   subdivide(lot, how) → { ok, proposal } | { ok: false, why }
 *     how = { mode: 'line', p, q }                  cut by the line through two points
 *         | { mode: 'equal', dir, n }               n lots of equal area by parallel lines of direction dir (radians, 0 = east, counter-clockwise)
 *         | { mode: 'areas', dir, areas: [a, …] }   lots of the given areas (project units²) cut off in turn; what is left is the last lot
 *     why: 'miss' | 'along' | 'ring' | 'area' | 'pieces' (a cut leaves a lot in more than one piece) | 'count'
 *   consolidate(lots, tol) → { ok, proposal } | { ok: false, why: 'few' | 'overlap' | 'apart' | 'hole' | 'touch' }      adjoining lots made one
 *   moveBoundary(a, b, p, q, tol) → { ok, proposal } | { ok: false, why }       the two made one, then cut again by the line through p and q
 *   designate(lots, to, title) → { ok, proposal }                                the same outlines with another use or zone
 *   schedule(proposal, { unitM }) → { before: [{ name, areaM2, use, zone }], after: […], beforeM2, afterM2, balanceM2 }
 *       balanceM2 = after − before: the ground a proposal makes or loses, which should be nothing
 *   onLine(ring, a, b, eps) → length of the ring's outline that lies on the segment a–b (a lot's frontage on a street line)
 *   lotName(base, i)                             "Lot 7 A", "Lot 7 B", …
 */
import { area, cutByLine, cutToArea, merge } from './geo.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const lotName = (base, i) => base + ' ' + (i < 26 ? LETTERS[i] : LETTERS[Math.floor(i / 26) - 1] + LETTERS[i % 26]);
const copy = (r) => r.map((p) => ({ x: p.x, y: p.y }));
const make = (kind, parents, children, title, extra = {}) => ({
  id: null, kind, title, parents: parents.map((p) => p.id).filter(Boolean), parentNames: parents.map((p) => p.name), parentAreas: parents.map((p) => p.area ?? area(p.ring)),
  children, from: { use: parents[0]?.use || '', zone: parents[0]?.zone || '' }, to: { use: '', zone: '' }, reason: '', status: 'draft', made: 0, ...extra,
});

export function subdivide(lot, how) {
  if (!lot || !Array.isArray(lot.ring) || lot.ring.length < 3) return { ok: false, why: 'ring' };
  const child = (ring, i) => ({ name: lotName(lot.name, i), pts: copy(ring), use: lot.use || '', zone: lot.zone || '' });
  if (how.mode === 'line') {
    const c = cutByLine(lot.ring, how.p, how.q, Math.sqrt(area(lot.ring)) * 1e-9);
    if (!c.ok) return c;
    const parts = [...c.left, ...c.right];
    return { ok: true, proposal: make('subdivision', [lot], parts.map(child), lot.name) };
  }
  const total = area(lot.ring);
  let areas;
  if (how.mode === 'equal') { const n = Math.floor(how.n); if (!(n >= 2 && n <= 200)) return { ok: false, why: 'count' }; areas = Array.from({ length: n - 1 }, () => total / n); }
  else if (how.mode === 'areas') { areas = (how.areas || []).filter((a) => a > 0).slice(0, 199); if (!areas.length || areas.reduce((m, a) => m + a, 0) >= total) return { ok: false, why: 'area' }; }
  else return { ok: false, why: 'ring' };
  const out = []; let rest = lot.ring;
  for (const a of areas) {
    const c = cutToArea(rest, how.dir || 0, a);
    if (!c.ok) return c;
    if (c.left.length !== 1 || c.right.length !== 1) return { ok: false, why: 'pieces' };
    out.push(c.left[0]); rest = c.right[0];
  }
  out.push(rest);
  return { ok: true, proposal: make('subdivision', [lot], out.map(child), lot.name) };
}

export function consolidate(lots, tol = 1e-6) {
  if (!Array.isArray(lots) || lots.length < 2) return { ok: false, why: 'few' };
  let ring = lots[0].ring; const left = lots.slice(1);
  while (left.length) {   // any order: take the next lot that adjoins what has been joined so far
    let done = false, why = 'apart';
    for (let i = 0; i < left.length; i++) {
      const m = merge(ring, left[i].ring, tol);
      if (m.ok) { ring = m.ring; left.splice(i, 1); done = true; break; }
      if (m.why !== 'apart') why = m.why;
    }
    if (!done) return { ok: false, why };
  }
  const name = lots.map((l) => l.name).join(' + ').slice(0, 120);
  return { ok: true, proposal: make('consolidation', lots, [{ name, pts: copy(ring), use: lots[0].use || '', zone: lots[0].zone || '' }], name) };
}

export function moveBoundary(a, b, p, q, tol = 1e-6) {
  const m = merge(a.ring, b.ring, tol);
  if (!m.ok) return m;
  const c = cutByLine(m.ring, p, q, Math.sqrt(m.area) * 1e-9);
  if (!c.ok) return c;
  if (c.left.length !== 1 || c.right.length !== 1) return { ok: false, why: 'pieces' };
  // each new lot keeps the name of the old lot it shares most ground with
  const parts = [c.left[0], c.right[0]];
  const inA = parts.map((r) => { const cx = r.reduce((s, v) => s + v.x, 0) / r.length, cy = r.reduce((s, v) => s + v.y, 0) / r.length; return Math.hypot(cx - avg(a.ring).x, cy - avg(a.ring).y); });
  const first = inA[0] <= inA[1] ? 0 : 1;
  const children = [{ name: a.name, pts: copy(parts[first]), use: a.use || '', zone: a.zone || '' }, { name: b.name, pts: copy(parts[1 - first]), use: b.use || '', zone: b.zone || '' }];
  return { ok: true, proposal: make('boundary', [a, b], children, a.name + ' / ' + b.name) };
}
const avg = (r) => ({ x: r.reduce((s, v) => s + v.x, 0) / r.length, y: r.reduce((s, v) => s + v.y, 0) / r.length });

export function designate(lots, to, title = '') {
  if (!Array.isArray(lots) || !lots.length) return { ok: false, why: 'few' };
  const t = { use: String(to?.use || '').slice(0, 80), zone: String(to?.zone || '').slice(0, 80) };
  if (!t.use && !t.zone) return { ok: false, why: 'empty' };
  const children = lots.map((l) => ({ name: l.name, pts: copy(l.ring), use: t.use || l.use || '', zone: t.zone || l.zone || '' }));
  return { ok: true, proposal: make('designation', lots, children, title || lots.map((l) => l.name).join(', ').slice(0, 160), { to: t }) };
}

export function schedule(proposal, { unitM = 1, parents = null } = {}) {
  const k2 = unitM * unitM;
  const before = (parents || (proposal.parentNames || []).map((name, i) => ({ name, area: (proposal.parentAreas || [])[i] || 0, use: proposal.from.use, zone: proposal.from.zone })))
    .map((p) => ({ name: p.name, ref: p.ref || '', areaM2: (p.area ?? area(p.ring)) * k2, use: p.use || '', zone: p.zone || '' }));
  const after = proposal.children.map((c) => ({ name: c.name, areaM2: area(c.pts) * k2, use: c.use || '', zone: c.zone || '' }));
  const beforeM2 = before.reduce((m, r) => m + r.areaM2, 0), afterM2 = after.reduce((m, r) => m + r.areaM2, 0);
  return { before, after, beforeM2, afterM2, balanceM2: afterM2 - beforeM2 };
}

export function onLine(ring, a, b, eps = 1e-6) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy); if (!(len > 0)) return 0;
  let s = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const p = ring[i], q = ring[(i + 1) % n];
    if (Math.abs(dx * (p.y - a.y) - dy * (p.x - a.x)) / len > eps || Math.abs(dx * (q.y - a.y) - dy * (q.x - a.x)) / len > eps) continue;
    const tp = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (len * len), tq = ((q.x - a.x) * dx + (q.y - a.y) * dy) / (len * len);
    const lo = Math.max(0, Math.min(tp, tq)), hi = Math.min(1, Math.max(tp, tq));
    if (hi > lo) s += (hi - lo) * len;
  }
  return s;
}
