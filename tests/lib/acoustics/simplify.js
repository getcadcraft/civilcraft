/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * simplify.js — the BIM → acoustic model step (0.11 XE.3 phase S2, session sound-11 second pass). DOM-free, no network; lib/acoustics is canonical
 * (hosts carry byte-identical copies from tools/acoustics/sync.mjs). Geometry only: no coefficient is typed here, every α comes from acoustics.js MATERIALS
 * (or the caller's own numbers).
 *
 * A room of a building model is a plan outline (the walls' inner faces), a floor and a ceiling height, the finish on each wall, and the doors and
 * windows in those walls. geo.js traceRoom needs a closed room of CONVEX planar polygons with an α per band. This file makes one:
 *
 *   roomModel(plan, opts) → { ok, surfaces, poly, volume_m3, area_m2, closure, spec, removed, notes } | { ok: false, reason, ... }
 *     plan = { poly: [[x, y], …] (m, either winding), z0?: 0, height (m),
 *              floor: key, ceiling: key, wall?: key (default for every edge), edges?: [key | null per edge of poly],
 *              openings?: [{ at: [x, y] (m, the opening's middle on plan), width, height, sill (m above z0), key }] }
 *     keys name acoustics.js MATERIALS (or opts.materials); a key may be an object { alpha: [6] } for a product's own data.
 *     opts = { tol: 0.05 (m), reach: 0.4 (m), scatter: 0.1 | { floor, ceiling, wall, opening }, materials }
 *
 *   Simplification (the "acoustic model" is coarser than the drawing): a vertex closer than `tol` to the line through its two neighbours is dropped, the
 *   smallest first, while the outline stays simple. That removes collinear points and jogs shallower than tol (a pilaster, a reveal), which a ray of
 *   sound at the wavelengths geometric acoustics is valid for does not see. The area this changes is reported in `removed`; tol = 0 keeps every vertex.
 *   An edge of the new outline keeps the finishes of the edges it replaced (pieces along it, by length). An opening goes on the nearest wall within
 *   `reach` (the room outline is the walls' inner face, an opening's middle is on the wall's axis), clipped to the wall.
 *
 *   surfaces: [{ name, part: 'floor'|'ceiling'|'wall'|'opening', key, pts: [[x, y, z]] (outward winding, convex, no three in a row), alpha: [6], scatter, area_m2 }]
 *   closure:  |Σ outward vector areas| / total area: 0 for a closed room (a check that no ray can leave through a gap)
 *   spec:     { volume_m3, surfaces: [{ name, key, area_m2, alpha }] } — the same room for acoustics.js reverb(), so the statistical and the traced answers
 *             come from one model
 *   notes:    [{ key: 'ac.geo.note.*', … }] e.g. an opening with no wall near it, an opening clipped, overlapping openings
 *
 *   insideRoom(model, p, margin = 0) → true when p = [x, y, z] is inside the room and at least `margin` from every surface (a source or a receiver sphere)
 *   modelArea(surfaces) · vectorArea(pts) · convexPieces(poly) are exported for the tests.
 *
 * Honest limits: one storey-high box over a plan outline (flat floor and ceiling; a sloped ceiling is not read); furniture and people stay statistical
 * (the `extra` sabins of acoustics-model.js), they are not surfaces here.
 */
import { MATERIALS } from './acoustics.js';

const EPS = 1e-9;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Signed area of a plan polygon (CCW > 0). */
export function signedArea(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
/** Newell's vector area of a planar 3-D polygon: its length is the area, its direction the normal of the winding. */
export function vectorArea(pts) {
  const n = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
  return n.map((v) => v / 2);
}
export const modelArea = (surfaces) => surfaces.reduce((s, f) => s + Math.hypot(...vectorArea(f.pts)), 0);

const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0; return { d: Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t), t }; };
const lineDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return l < EPS ? Math.hypot(p[0] - a[0], p[1] - a[1]) : Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / l; };
function segsCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return ((d1 > EPS && d2 < -EPS) || (d1 < -EPS && d2 > EPS)) && ((d3 > EPS && d4 < -EPS) || (d3 < -EPS && d4 > EPS));
}
/** Would replacing vertex i by the chord (i-1, i+1) cross another edge? */
function chordCrosses(p, i) {
  const n = p.length, a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
  for (let j = 0; j < n; j++) {
    const k = (j + 1) % n;
    if (j === i || k === i || j === (i - 1 + n) % n || k === (i + 1) % n) continue;
    if (segsCross(a, b, p[j], p[k])) return true;
  }
  return false;
}

/** Drop duplicate points, then vertices within tol of their neighbours' line (smallest first) while the outline stays simple. → { poly, removedArea, dropped } */
export function simplifyOutline(poly, tol = 0.05) {
  let p = [];
  for (const q of poly) { const v = [Number(q[0]), Number(q[1])]; if (!p.length || Math.hypot(v[0] - p[p.length - 1][0], v[1] - p[p.length - 1][1]) > 1e-6) p.push(v); }
  if (p.length > 1 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) <= 1e-6) p.pop();
  const a0 = Math.abs(signedArea(p));
  let dropped = 0;
  const lim = Math.max(tol, 1e-7);   // tol 0 still drops exactly collinear points (they change nothing)
  for (;;) {
    if (p.length <= 3) break;
    let best = -1, bd = Infinity;
    for (let i = 0; i < p.length; i++) { const d = lineDist(p[i], p[(i - 1 + p.length) % p.length], p[(i + 1) % p.length]); if (d < bd && d <= lim && !chordCrosses(p, i)) { bd = d; best = i; } }
    if (best < 0) break;
    p.splice(best, 1); dropped++;
  }
  if (signedArea(p) < 0) p.reverse();
  return { poly: p, removedArea: Math.abs(Math.abs(signedArea(p)) - a0), dropped };
}

/** Ear clipping of a simple CCW polygon → triangles as index triples. */
function triangulate(p) {
  const idx = p.map((_, i) => i), tris = [];
  const cr = (a, b, c) => (p[b][0] - p[a][0]) * (p[c][1] - p[a][1]) - (p[b][1] - p[a][1]) * (p[c][0] - p[a][0]);
  const inTri = (q, a, b, c) => { const s1 = (p[b][0] - p[a][0]) * (q[1] - p[a][1]) - (p[b][1] - p[a][1]) * (q[0] - p[a][0]), s2 = (p[c][0] - p[b][0]) * (q[1] - p[b][1]) - (p[c][1] - p[b][1]) * (q[0] - p[b][0]), s3 = (p[a][0] - p[c][0]) * (q[1] - p[c][1]) - (p[a][1] - p[c][1]) * (q[0] - p[c][0]); return s1 >= -EPS && s2 >= -EPS && s3 >= -EPS; };
  let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const a = idx[(k - 1 + idx.length) % idx.length], b = idx[k], c = idx[(k + 1) % idx.length];
      if (cr(a, b, c) <= EPS) continue;
      let ear = true;
      for (const j of idx) if (j !== a && j !== b && j !== c && inTri(p[j], a, b, c)) { ear = false; break; }
      if (!ear) continue;
      tris.push([a, b, c]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;   // degenerate input: what is left is not cut (the closure check will say so)
  }
  if (idx.length === 3) tris.push([idx[0], idx[1], idx[2]]);
  return tris;
}
const convex = (p, ring) => { for (let i = 0; i < ring.length; i++) { const a = p[ring[(i - 1 + ring.length) % ring.length]], b = p[ring[i]], c = p[ring[(i + 1) % ring.length]]; if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < -EPS) return false; } return true; };
/** Convex pieces of a simple CCW polygon (ear clipping, then Hertel–Mehlhorn: drop every diagonal whose removal keeps both sides convex). → [[ [x, y] … ]] */
export function convexPieces(poly) {
  const p = poly, pieces = triangulate(p).map((t) => t.slice());
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) {
      const A = pieces[i], B = pieces[j];
      for (let a = 0; a < A.length; a++) {
        const u = A[a], v = A[(a + 1) % A.length], b = B.findIndex((x, k) => x === v && B[(k + 1) % B.length] === u);
        if (b < 0) continue;
        // ring: A from v round to u, then B from u (exclusive) round to v (exclusive)
        const ring = [];
        for (let k = 0; k < A.length; k++) ring.push(A[(a + 1 + k) % A.length]);
        for (let k = 2; k < B.length; k++) ring.push(B[(b + k) % B.length]);
        if (!convex(p, ring)) continue;
        pieces[i] = ring; pieces.splice(j, 1); merged = true; break outer;
      }
    }
  }
  return pieces.map((ring) => clean2(ring.map((k) => p[k])));
}
/** Remove vertices in a straight line (traceRoom takes a polygon's normal from its first three points). */
function clean2(r) { let q = r.slice(), again = true; while (again && q.length > 3) { again = false; for (let i = 0; i < q.length; i++) { const a = q[(i - 1 + q.length) % q.length], b = q[i], c = q[(i + 1) % q.length]; if (Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) < 1e-12) { q.splice(i, 1); again = true; break; } } } return q; }

function alphaOf(key, mats) {
  if (key && typeof key === 'object' && Array.isArray(key.alpha) && key.alpha.length === 6 && key.alpha.every((v) => Number.isFinite(v) && v >= 0 && v <= 1)) return key.alpha.slice();
  const m = mats[key]; return m && Array.isArray(m.alpha) ? m.alpha.slice() : null;
}
const keyName = (key) => (key && typeof key === 'object' ? String(key.name || 'own') : String(key));

/** Pieces of the new outline's edge j from the original edges lying along it: [{ t0, t1, key }] covering [0, 1]. */
function edgePieces(a, b, orig, keys, tol) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), hits = [];
  for (let i = 0; i < orig.length; i++) {
    const p = orig[i], q = orig[(i + 1) % orig.length], sp = segDist(p, a, b), sq = segDist(q, a, b);
    if (sp.d > tol + 1e-6 || sq.d > tol + 1e-6) continue;
    const t0 = Math.min(sp.t, sq.t), t1 = Math.max(sp.t, sq.t);
    if ((t1 - t0) * L < 1e-6) continue;
    hits.push({ t0, t1, key: keys[i] });
  }
  if (!hits.length) return [{ t0: 0, t1: 1, key: null }];
  hits.sort((x, y) => x.t0 - y.t0);
  // make them meet: a gap or an overlap between two pieces splits at its middle; the first starts at 0 and the last ends at 1
  const out = hits.map((h) => ({ ...h }));
  out[0].t0 = 0; out[out.length - 1].t1 = 1;
  for (let k = 0; k + 1 < out.length; k++) { const m = (out[k].t1 + out[k + 1].t0) / 2; out[k].t1 = m; out[k + 1].t0 = m; }
  const merged = [];
  for (const h of out) { if (h.t1 - h.t0 <= 1e-9) continue; const last = merged[merged.length - 1]; if (last && keyName(last.key) === keyName(h.key)) last.t1 = h.t1; else merged.push(h); }
  return merged;
}

export function roomModel(plan, opts = {}) {
  const tol = Number.isFinite(opts.tol) && opts.tol >= 0 ? opts.tol : 0.05, reach = Number.isFinite(opts.reach) && opts.reach >= 0 ? opts.reach : 0.4;
  const mats = opts.materials || MATERIALS, sc = opts.scatter ?? 0.1, scatterOf = (part) => { const v = typeof sc === 'object' ? sc[part] ?? 0.1 : sc; return Math.min(1, Math.max(0, Number(v) || 0)); };
  const notes = [];
  const H = Number(plan?.height), z0 = Number(plan?.z0) || 0, z1 = z0 + H;
  if (!Array.isArray(plan?.poly) || plan.poly.length < 3 || !(H > 0)) return { ok: false, reason: 'noroom', notes };
  // the original outline CCW, with its edge keys turned the same way
  let orig = plan.poly.map((q) => [Number(q[0]), Number(q[1])]), keys = plan.poly.map((_, i) => (plan.edges && plan.edges[i] != null ? plan.edges[i] : plan.wall ?? null));
  if (orig.some((q) => !Number.isFinite(q[0]) || !Number.isFinite(q[1]))) return { ok: false, reason: 'noroom', notes };
  if (signedArea(orig) < 0) { orig = orig.slice().reverse(); const n = keys.length; keys = keys.map((_, i) => keys[(n - 2 - i + n) % n]); }
  if (Math.abs(signedArea(orig)) < 1e-6) return { ok: false, reason: 'noroom', notes };
  const sim = simplifyOutline(orig, tol), poly = sim.poly;
  const need = (key, part) => { const a = alphaOf(key, mats); if (!a) throw Object.assign(new Error('nomaterial'), { key: keyName(key), part }); return a; };
  const surfaces = [], add = (name, part, key, pts) => { const area = Math.hypot(...vectorArea(pts)); if (area < 1e-9) return; surfaces.push({ name, part, key: keyName(key), pts, alpha: need(key, part), scatter: scatterOf(part), area_m2: area }); };
  try {
    // floor (outward = down: clockwise seen from above) and ceiling (up: counter-clockwise)
    const pieces = convexPieces(poly);
    pieces.forEach((pc, i) => {
      add('floor' + (pieces.length > 1 ? ':' + (i + 1) : ''), 'floor', plan.floor, pc.slice().reverse().map((q) => [q[0], q[1], z0]));
      add('ceiling' + (pieces.length > 1 ? ':' + (i + 1) : ''), 'ceiling', plan.ceiling, pc.map((q) => [q[0], q[1], z1]));
    });
    // openings onto their nearest edge
    const ops = [];
    for (const [k, o] of (Array.isArray(plan.openings) ? plan.openings : []).entries()) {
      const w = Number(o?.width), h = Number(o?.height), s = Number(o?.sill) || 0;
      if (!(w > 0 && h > 0) || !Array.isArray(o.at)) continue;
      let best = -1, bd = Infinity, bt = 0;
      for (let j = 0; j < poly.length; j++) { const r = segDist(o.at, poly[j], poly[(j + 1) % poly.length]); if (r.d < bd) { bd = r.d; best = j; bt = r.t; } }
      if (best < 0 || bd > reach) { notes.push({ key: 'ac.geo.note.nowall', n: k + 1 }); continue; }
      const a = poly[best], b = poly[(best + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), mid = bt * L;
      let u0 = mid - w / 2, u1 = mid + w / 2, v0 = s, v1 = s + h;
      if (u0 < 0 || u1 > L || v0 < 0 || v1 > H) notes.push({ key: 'ac.geo.note.clipped', n: k + 1 });
      u0 = Math.max(0, u0); u1 = Math.min(L, u1); v0 = Math.max(0, v0); v1 = Math.min(H, v1);
      if (u1 - u0 < 1e-6 || v1 - v0 < 1e-6) continue;
      if (ops.some((q) => q.edge === best && q.u0 < u1 - 1e-6 && u0 < q.u1 - 1e-6)) { notes.push({ key: 'ac.geo.note.overlap', n: k + 1 }); continue; }
      ops.push({ edge: best, u0, u1, v0, v1, key: o.key || 'door', n: k + 1 });
    }
    // walls: each edge in pieces of one finish, each piece in vertical strips cut at the openings' sides
    for (let j = 0; j < poly.length; j++) {
      const a = poly[j], b = poly[(j + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
      const P = (u, z) => [a[0] + ux * u, a[1] + uy * u, z0 + z];
      const rect = (name, part, key, u0, u1, v0, v1) => add(name, part, key, [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);   // outward for a CCW outline
      const mine = ops.filter((o) => o.edge === j).sort((x, y) => x.u0 - y.u0);
      for (const pc of edgePieces(a, b, orig, keys, tol)) {
        const s0 = pc.t0 * L, s1 = pc.t1 * L, key = pc.key ?? plan.wall, cuts = new Set([s0, s1]);
        for (const o of mine) { if (o.u0 > s0 && o.u0 < s1) cuts.add(o.u0); if (o.u1 > s0 && o.u1 < s1) cuts.add(o.u1); }
        const xs = [...cuts].sort((x, y) => x - y);
        for (let k = 0; k + 1 < xs.length; k++) {
          const x0 = xs[k], x1 = xs[k + 1], o = mine.find((q) => q.u0 <= x0 + 1e-9 && q.u1 >= x1 - 1e-9), nm = 'wall:' + (j + 1);
          if (!o) { rect(nm, 'wall', key, x0, x1, 0, H); continue; }
          if (o.v0 > 1e-9) rect(nm, 'wall', key, x0, x1, 0, o.v0);
          rect('opening:' + o.n, 'opening', o.key, x0, x1, o.v0, o.v1);
          if (o.v1 < H - 1e-9) rect(nm, 'wall', key, x0, x1, o.v1, H);
        }
      }
    }
  } catch (e) {
    if (e && e.message === 'nomaterial') return { ok: false, reason: 'nomaterial', key: e.key, part: e.part, notes };
    throw e;
  }
  // checks: the outward vector areas of a closed room sum to zero; the volume by the divergence theorem equals area × height
  const sum = [0, 0, 0]; let S = 0, V = 0;
  for (const f of surfaces) { const va = vectorArea(f.pts); sum[0] += va[0]; sum[1] += va[1]; sum[2] += va[2]; S += f.area_m2; V += dot(f.pts[0], va) / 3; }
  const closure = Math.hypot(...sum) / S;
  const byKey = new Map();
  for (const f of surfaces) { const k = f.part + '\u0000' + f.key; const e = byKey.get(k) || { name: f.part === 'wall' ? 'walls' : f.part === 'opening' ? 'openings' : f.part, key: f.key, part: f.part, area_m2: 0, alpha: f.alpha }; e.area_m2 += f.area_m2; byKey.set(k, e); }
  const spec = { volume_m3: V, surfaces: [...byKey.values()].map((e) => ({ name: e.name + (([...byKey.values()].filter((x) => x.name === e.name).length > 1) ? ':' + e.key : ''), key: e.key, area_m2: e.area_m2, alpha: e.alpha })) };
  if (sim.dropped) notes.push({ key: 'ac.geo.note.simplified', n: sim.dropped, area: Math.round(sim.removedArea * 1000) / 1000 });
  return { ok: closure < 1e-6, reason: closure < 1e-6 ? undefined : 'open', surfaces, poly, z0, z1, volume_m3: V, area_m2: S, closure, spec, removed: { vertices: sim.dropped, area_m2: sim.removedArea }, notes };
}

/** Is p inside the room's outline and between floor and ceiling, at least `margin` from every surface? */
export function insideRoom(model, p, margin = 0) {
  if (!model?.poly || !Array.isArray(p)) return false;
  const [x, y, z] = p, poly = model.poly;
  if (!(z >= model.z0 + margin && z <= model.z1 - margin)) return false;
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c; }
  if (!c) return false;
  for (let i = 0; i < poly.length; i++) if (segDist([x, y], poly[i], poly[(i + 1) % poly.length]).d < margin) return false;
  return true;
}
// referenced by the tests through the module namespace
export { sub as _sub, cross as _cross };
