/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cut.js — finding a run under a point, cutting a symbol into it and healing the cut (lib/mep2d). DOM-free.
 *
 * Everything works on the drawing's real geometry (lines and polylines carrying a `mep` record, see runs.js), never on a
 * stored copy of the run, so a run that was moved, stretched or trimmed by hand is cut and healed where it is now.
 *
 *   hitRun(pieces, p, tol)        → { r, mep, c (point on the centreline), dir (unit), w (half width), piece, partner,
 *                                     a, b (the ends of the straight piece of centreline it is on), dist } | null
 *   cutInterval(e, A, B, tol)     → the entities that replace e once the stretch between A and B (projected onto e) is
 *                                     taken out ([] = all of it), or null when e does not pass through both
 *   cutIn(pieces, hit, gap)       → { ok, why ('short'), remove: [ids], add: [entities], A, B }
 *   healGap(pieces, A, B, opts)   → { remove: [ids], add: [entities] }      opts = { w, r (prefer this run), tol }
 *   openEdge(pieces, hit, side, half) → { remove, add }: the opening a branch makes in the near edge of a double-line run
 * `pieces` are entities with `id` and `mep`. New entities are copies of the one they replace (layer, linetype, data and
 * all) with new geometry and no id.
 */
import { P, sub, add, mul, dot, cross, unit, left, dist, along, project, straightSegs } from './geom.js';

const CUTTABLE = new Set(['cl', 'edge']);
const strip = (e) => { const c = { ...e }; delete c.id; delete c.key; return c; };
const relTol = (...pts) => 1e-9 * (1 + Math.max(...pts.map((p) => Math.abs(p.x) + Math.abs(p.y))));

export function hitRun(pieces, p, tol) {
  let best = null;
  for (const e of pieces) {
    if (!e?.mep || !CUTTABLE.has(e.mep.role) || e.mep.mode === 'flex') continue;
    const w = e.mep.role === 'edge' ? Number(e.mep.w) || 0 : 0;
    for (const s of straightSegs(e)) {
      const pr = project(s.a, s.b, p);
      if (pr.d > tol + 2 * w) continue;
      if (!best || pr.d < best.pr.d) best = { e, s, pr, w };
    }
  }
  if (!best) return null;
  const { e, s, pr, w } = best;
  const dir = unit(sub(s.b, s.a));
  if (e.mep.role === 'cl') {
    if (pr.d > tol) return null;
    return { r: e.mep.r, mep: e.mep, c: pr.q, dir, w: 0, piece: e, partner: null, a: s.a, b: s.b, dist: pr.d };
  }
  // an edge: the other edge is the parallel piece of the same run 2w away, beside this point
  let partner = null, pseg = null;
  for (const f of pieces) {
    if (f === e || !f?.mep || f.mep.role !== 'edge' || f.mep.r !== e.mep.r) continue;
    for (const t of straightSegs(f)) {
      const td = unit(sub(t.b, t.a));
      if (Math.abs(cross(dir, td)) > 1e-6) continue;
      const q = project(t.a, t.b, pr.q);
      if (Math.abs(q.off - 2 * w) > Math.max(1e-6, 0.02 * w) || q.t < -1e-9 || q.t > 1 + 1e-9) continue;
      partner = f; pseg = { t, foot: q.foot };
    }
  }
  let c, a = s.a, b = s.b;
  if (partner) {
    c = mul(add(pr.q, pseg.foot), 0.5);
    const off = sub(c, pr.q);
    // the stretch both edges cover, on the centreline
    const ua = dot(sub(pseg.t.a, s.a), dir), ub = dot(sub(pseg.t.b, s.a), dir);
    const t0 = Math.max(0, Math.min(ua, ub)), t1 = Math.min(dist(s.a, s.b), Math.max(ua, ub));
    a = add(along(s.a, dir, t0), off); b = add(along(s.a, dir, t1), off);
  } else {
    const o = Number(e.mep.o) || 1;
    c = add(pr.q, mul(left(dir), -o * w));
    a = add(s.a, mul(left(dir), -o * w)); b = add(s.b, mul(left(dir), -o * w));
  }
  const d = dist(p, project(a, b, p).q);
  if (d > tol + w) return null;
  return { r: e.mep.r, mep: e.mep, c, dir, w, piece: e, partner, a, b, dist: d };
}

export function cutInterval(e, A, B, tol = null) {
  for (const s of straightSegs(e)) {
    const pa = project(s.a, s.b, A), pb = project(s.a, s.b, B);
    const eps = tol ?? Math.max(relTol(s.a, s.b), 1e-7 * dist(s.a, s.b));
    const len = dist(s.a, s.b);
    let t0 = Math.min(pa.t, pb.t), t1 = Math.max(pa.t, pb.t);
    if (t1 * len < -eps || t0 * len > len + eps) continue;       // the stretch is off this piece
    if (t0 < 0 && t1 > 1) { t0 = 0; t1 = 1; }
    t0 = Math.max(0, t0); t1 = Math.min(1, t1);
    if ((t1 - t0) * len <= eps) continue;
    const q0 = along(s.a, sub(s.b, s.a), t0), q1 = along(s.a, sub(s.b, s.a), t1);
    const out = [];
    if (e.type === 'line') {
      if (t0 * len > eps) out.push({ ...strip(e), x1: s.a.x, y1: s.a.y, x2: q0.x, y2: q0.y });
      if ((1 - t1) * len > eps) out.push({ ...strip(e), x1: q1.x, y1: q1.y, x2: s.b.x, y2: s.b.y });
      return out;
    }
    if (e.closed) return null;
    const head = e.pts.slice(0, s.i + 1).map((q) => ({ ...q })), tail = e.pts.slice(s.i + 1).map((q) => ({ ...q }));
    if (t0 * len > eps) head.push({ x: q0.x, y: q0.y, b: 0 });
    if ((1 - t1) * len > eps) tail.unshift({ x: q1.x, y: q1.y, b: 0 });
    head[head.length - 1] = { ...head[head.length - 1], b: 0 };
    if (head.length >= 2) out.push({ ...strip(e), pts: head, closed: false });
    if (tail.length >= 2) out.push({ ...strip(e), pts: tail, closed: false });
    return out;
  }
  return null;
}

export function cutIn(pieces, hit, gap) {
  const g = gap / 2;
  if (!(gap > 0)) return { ok: true, remove: [], add: [], A: hit.c, B: hit.c };
  const ta = dot(sub(hit.c, hit.a), hit.dir), tb = dot(sub(hit.b, hit.c), hit.dir);
  if (ta < g - 1e-9 || tb < g - 1e-9) return { ok: false, why: 'short', remove: [], add: [] };
  const A = along(hit.c, hit.dir, -g), B = along(hit.c, hit.dir, g);
  const remove = [], out = [];
  for (const e of [hit.piece, hit.partner]) {
    if (!e) continue;
    const got = cutInterval(e, A, B);
    if (!got) continue;
    remove.push(e.id); out.push(...got);
  }
  return { ok: true, remove, add: out, A, B };
}

const endsOf = (e) => {
  if (e.type === 'line') return [{ p: P(e.x1, e.y1), at: 'start' }, { p: P(e.x2, e.y2), at: 'end' }];
  if (e.type === 'poly' && !e.closed && e.pts.length >= 2) return [{ p: P(e.pts[0].x, e.pts[0].y), at: 'start' }, { p: P(e.pts[e.pts.length - 1].x, e.pts[e.pts.length - 1].y), at: 'end' }];
  return [];
};
const ptsOf = (e) => (e.type === 'line' ? [{ x: e.x1, y: e.y1, b: 0 }, { x: e.x2, y: e.y2, b: 0 }] : e.pts.map((q) => ({ x: q.x, y: q.y, b: q.b || 0 })));
/** The points of a piece, turned so that it ends (`end`) or starts (`start`) at the end named. */
const oriented = (e, at, want) => {
  const pts = ptsOf(e);
  if (at === want) return pts;
  const r = pts.slice().reverse();   // a polyline's bulge belongs to the piece after its point: move and flip them
  for (let i = 0; i < r.length; i++) r[i] = { x: r[i].x, y: r[i].y, b: i < r.length - 1 ? -(pts[pts.length - 2 - i].b || 0) : 0 };
  return r;
};
const collinear = (a, b, c) => Math.abs(cross(sub(b, a), sub(c, b))) <= 1e-7 * (dist(a, b) * dist(b, c) + 1e-12) && dot(sub(b, a), sub(c, b)) > 0;
function tidy(pts) {
  const out = pts.slice();
  for (let i = out.length - 2; i >= 1; i--) if (!out[i - 1].b && !out[i].b && collinear(out[i - 1], out[i], out[i + 1])) out.splice(i, 1);
  return out;
}
function fromPts(like, pts, wasLines) {
  const t = tidy(pts);
  if (wasLines && t.length === 2) { const c = strip(like); delete c.pts; delete c.closed; return { ...c, type: 'line', x1: t[0].x, y1: t[0].y, x2: t[1].x, y2: t[1].y }; }
  const c = strip(like);
  delete c.x1; delete c.y1; delete c.x2; delete c.y2;
  return { ...c, type: 'poly', closed: false, pts: t };
}

export function healGap(pieces, A, B, opts = {}) {
  const w = Math.max(0, Number(opts.w) || 0);
  const gap = dist(A, B);
  if (!(gap > 0)) return { remove: [], add: [] };
  const dir = unit(sub(B, A)), nrm = left(dir);
  const tol = opts.tol ?? Math.max(gap * 1e-4, relTol(A, B) * 1e3);
  const role = w > 0 ? 'edge' : 'cl';
  const pool = pieces.filter((e) => e?.mep && e.mep.role === role && e.mep.mode !== 'flex');
  const remove = [], out = [], used = new Set();
  const find = (pt) => {
    let best = null;
    for (const e of pool) {
      if (used.has(e.id)) continue;
      for (const en of endsOf(e)) {
        const d = dist(en.p, pt);
        if (d > tol) continue;
        const score = d + (opts.r && e.mep.r !== opts.r ? tol : 0);
        if (!best || score < best.score) best = { e, at: en.at, score };
      }
    }
    return best;
  };
  for (const o of w > 0 ? [1, -1] : [0]) {
    const a = add(A, mul(nrm, o * w)), b = add(B, mul(nrm, o * w));
    const ha = find(a);
    if (ha) used.add(ha.e.id);
    const hb = find(b);
    if (hb) used.add(hb.e.id);
    if (ha && hb) {
      const pts = [...oriented(ha.e, ha.at, 'end'), ...oriented(hb.e, hb.at, 'start')];
      remove.push(ha.e.id, hb.e.id);
      out.push(fromPts(ha.e, pts, ha.e.type === 'line' && hb.e.type === 'line'));
    } else if (ha || hb) {
      const h = ha || hb, to = ha ? b : a;
      const pts = [...oriented(h.e, h.at, 'end'), { x: to.x, y: to.y, b: 0 }];
      remove.push(h.e.id);
      out.push(fromPts(h.e, pts, h.e.type === 'line'));
    }
  }
  return { remove, add: out };
}

/** A branch of half width `half` meeting a double-line run at hit.c from `side` (a point on the branch): open the near edge. */
export function openEdge(pieces, hit, side, half) {
  if (!(hit.w > 0) || !(half > 0)) return { remove: [], add: [], at: hit.c };
  const nrm = left(hit.dir), s = dot(sub(side, hit.c), nrm) >= 0 ? 1 : -1;
  const at = add(hit.c, mul(nrm, s * hit.w));
  const A = along(at, hit.dir, -half), B = along(at, hit.dir, half);
  for (const e of [hit.piece, hit.partner]) {
    if (!e) continue;
    const seg = straightSegs(e)[0];
    if (!seg || project(seg.a, seg.b, at).off > Math.max(1e-6, 0.02 * hit.w)) continue;
    const got = cutInterval(e, A, B);
    if (got) return { remove: [e.id], add: got, at };
  }
  return { remove: [], add: [], at };
}
