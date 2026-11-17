/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/layerjoin.js — layer priority at wall junctions (0.9 WT.5, wall tool spec section 8 step 4: "clean the junction by layer or
 * material priority"; session walls-join-10). Host-free: no DOM, no IFC, no app imports; plan millimetres. It is DISPLAY clean-up only:
 * a wall's body (its outline, as the join style gives it) and the join record never change here (spec section 9: "keep connection
 * separate from clean-up").
 *
 * The rule. Every layer of a wall has a priority, 0 to 999; the stronger layer cuts the weaker. Where a wall END meets the other wall
 * (a T's stem, the stopping wall of a butt or square corner, both walls at a mitre, both sides of a crossing wall), each of its layers
 * is carried on in its own direction into the other wall, through the other wall's layers for as long as they are WEAKER, and stops at
 * the first layer that is as strong or stronger (or at the other wall's far face). Equal priority never cuts: such layers stop against
 * each other. So a stem's core passes a host's finish and stops against the host's core ("cores join to cores"); a finish stops at the
 * host's finish; a line is drawn between two layers only where their materials differ.
 *
 *   LAYER_PRIORITY                    the defaults by layer function: structure 800, substrate 600, insulation 400, membrane 300,
 *                                     finish 200; a cavity (air) 100
 *   layerPriority(layer)              a layer's priority: its own `priority` when that is a whole number 0..999, else the default of its
 *                                     `kind` 'cavity' or its `function`; an unknown function counts as finish
 *   layerBands(layers, extSide)       layers [{ t, function, kind, priority, materialId | mat }] from the EXTERIOR side inward →
 *                                     bands [{ index, lo, hi, prio, mat }]: lo..hi = the layer's two offsets from the centre line, measured to the
 *                                     wall's LEFT (left of a→b), lo < hi, sorted by lo. extSide 'left' (default) | 'right' = where the
 *                                     exterior is. Layers of no thickness (membranes) get no band. `mat` is what decides "same material"
 *                                     (materialId, else mat; every cavity is one material).
 *   cleanJunction({ kind, walls: [W0, W1], through }) → { adds, cuts, lines }
 *       kind     'L' | 'T' | 'X'
 *       W        { key, a, b, bands, body, end, face }
 *                  key    the wall's id (comes back in the answer)
 *                  a, b   its centre line (straight walls only)
 *                  bands  layerBands(...) of the wall
 *                  body   its outline near the junction, a polygon [[x, y]…] (the whole joined outline is fine); used to keep what is
 *                         carried into this wall inside it, and to tell an inside edge from the outline. Optional (then its band range is used).
 *                  end    'a' | 'b' = the end that is at this junction; null for a wall met on its side (a T's through wall) or crossed (X)
 *                  face   for a wall with `end`: the two points where that end is cut, [onItsLeftFace, onItsRightFace] (the wall's own
 *                         left and right of a→b; joinstyle.js cornerEnds gives them, see its header for left / right at an end)
 *       through  X only: the key of the wall that is continuous (default W0); the other wall's layers are cut out where it crosses
 *     Answer (all polygons anticlockwise, plan mm):
 *       adds   [{ wall, band, mat, poly, into }]   a piece of `wall`'s layer `band` (the layer's index) carried into wall `into`
 *       cuts   [{ wall, poly }]                    a region taken OUT of every layer of `wall` (what `adds` now cover; at an X also where the
 *                                                  through wall crosses the other)
 *       lines  [[p, q]…]                           lines to draw: the sides and ends of the carried pieces, and the contact between two walls'
 *                                                  layers, only where the materials on the two sides differ and the edge is not the outline
 *     A host draws a wall's layers as before, then: takes `cuts` for that wall out of its layer polygons (subtractConvex) and out of its own
 *     layer boundary lines (segmentOutside), adds the `adds` polygons to the layer they name, and draws `lines`.
 *     Not handled (the junction comes back empty): a junction with a curved wall, walls within 5 degrees of one line, a node of three walls or
 *     more (a host passes two walls only).
 *   subtractConvex(poly, cut)         poly minus the convex polygon cut → polygons
 *   segmentOutside([p, q], cut)       the parts of the segment outside the convex polygon cut (its edge counts as inside) → segments
 */
export const LAYER_PRIORITY = { structure: 800, substrate: 600, insulation: 400, membrane: 300, finish: 200, cavity: 100 };
export const PRIORITY_MAX = 999;

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const left = (d) => [-d[1], d[0]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const EPS = 1e-7;
const NEAR_LINE = Math.sin(5 * Math.PI / 180);

export function layerPriority(layer) {
  const p = layer?.priority;
  if (Number.isInteger(p) && p >= 0 && p <= PRIORITY_MAX) return p;
  if (layer?.kind === 'cavity') return LAYER_PRIORITY.cavity;
  return LAYER_PRIORITY[layer?.function] ?? LAYER_PRIORITY.finish;
}

export function layerBands(layers, extSide = 'left') {
  const total = (layers || []).reduce((s, l) => s + (l.t || 0), 0), sign = extSide === 'right' ? -1 : 1;
  const out = [];
  let off = sign * total / 2;
  (layers || []).forEach((l, index) => {
    const end = off - sign * (l.t || 0);
    if (l.t > 0) out.push({ index, lo: Math.min(off, end), hi: Math.max(off, end), prio: layerPriority(l), mat: l.kind === 'cavity' ? '(cavity)' : String(l.materialId ?? l.mat ?? '') });
    off = end;
  });
  return out.sort((x, y) => x.lo - y.lo);
}

// ------------------------------------------------------------------------------------------------------------- polygons
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) s += cross(p[i], p[(i + 1) % p.length]); return s / 2; };
const tidy = (p) => {
  const out = [];
  for (const q of p) if (!out.length || dist(out[out.length - 1], q) > 1e-9) out.push(q);
  if (out.length > 1 && dist(out[0], out[out.length - 1]) <= 1e-9) out.pop();
  return out;
};
const ccw = (p) => (area(p) < 0 ? p.slice().reverse() : p);
/** The part of poly on the left (keep = 1) or right (keep = −1) of the line a→b. */
function clipHalf(poly, a, b, keep) {
  const d = sub(b, a), out = [];
  const side = (q) => keep * cross(d, sub(q, a));
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q);
    if (sp >= -1e-9) out.push(p);
    if ((sp > 1e-9 && sq < -1e-9) || (sp < -1e-9 && sq > 1e-9)) out.push(lerp(p, q, sp / (sp - sq)));
  }
  return tidy(out);
}
function clipConvex(poly, clip) {
  let p = poly;
  const c = ccw(clip);
  for (let i = 0; i < c.length && p.length >= 3; i++) p = clipHalf(p, c[i], c[(i + 1) % c.length], 1);
  return p.length >= 3 && Math.abs(area(p)) > 1e-6 ? p : [];
}
export function subtractConvex(poly, cut) {
  const c = ccw(cut), out = [];
  let rest = poly;
  for (let i = 0; i < c.length && rest.length >= 3; i++) {
    const a = c[i], b = c[(i + 1) % c.length];
    const outer = clipHalf(rest, a, b, -1);
    if (outer.length >= 3 && Math.abs(area(outer)) > 1e-6) out.push(outer);
    rest = clipHalf(rest, a, b, 1);
    if (Math.abs(area(rest)) <= 1e-6) rest = [];
  }
  return out;
}
export function segmentOutside(seg, cut) {
  const [p, q] = seg, c = ccw(cut), d = sub(q, p);
  let t0 = 0, t1 = 1;
  for (let i = 0; i < c.length; i++) {
    const a = c[i], e = sub(c[(i + 1) % c.length], a), L = Math.hypot(e[0], e[1]) || 1;
    const sp = cross(e, sub(p, a)) / L, sd = cross(e, d) / L;   // signed distance inside this edge: sp + t·sd ≥ −tol
    if (Math.abs(sd) < 1e-12) { if (sp < -1e-6) return [seg]; continue; }
    const t = (-1e-6 - sp) / sd;
    if (sd > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
    if (t0 >= t1) return [seg];
  }
  const out = [], len = Math.hypot(d[0], d[1]);
  if (t0 * len > 1e-6) out.push([p, lerp(p, q, t0)]);
  if ((1 - t1) * len > 1e-6) out.push([lerp(p, q, t1), q]);
  return out;
}
function inside(q, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

// ------------------------------------------------------------------------------------------------------------- the junction
const frame = (W) => {
  const L = dist(W.a, W.b) || 1, u = [(W.b[0] - W.a[0]) / L, (W.b[1] - W.a[1]) / L], n = left(u);
  return { ...W, u, n, lat: (q) => dot(sub(q, W.a), n), lo: W.bands.length ? W.bands[0].lo : 0, hi: W.bands.length ? W.bands[W.bands.length - 1].hi : 0 };
};
const bandAt = (W, v) => W.bands.find((k) => v >= k.lo && v <= k.hi) || null;

/**
 * Wall W's layers carried across `contact` (two points, on W's left and right face) along `dir` into wall V.
 * → pieces pushed to out.adds / out.cuts; out.regions keeps each piece with what is needed for its lines.
 */
function carry(W, V, contact, dir, shared, out, done = null) {
  const g = dot(dir, V.n);   // how fast the carried layer crosses V's layers
  if (Math.abs(g) < NEAR_LINE) return;
  const l0 = W.lat(contact[0]), l1 = W.lat(contact[1]);
  if (Math.abs(l1 - l0) < 1e-9) return;
  const at = (l) => lerp(contact[0], contact[1], (l - l0) / (l1 - l0));
  const nudge = EPS * Math.sign(g);
  for (const m of W.bands) {
    const lo = Math.max(m.lo, Math.min(l0, l1)), hi = Math.min(m.hi, Math.max(l0, l1));
    if (hi - lo < 1e-9) continue;
    const e0 = at(lo), e1 = at(hi), v0 = V.lat(e0), v1 = V.lat(e1);
    for (let i = 0; i < V.bands.length; i++) {
      const k = V.bands[i];
      // the stretch of this layer's end that faces V's layer k (an end that lies along V's layers faces the one just past it: nudge)
      let s0, s1;
      if (Math.abs(v1 - v0) < 1e-6) { const v = (v0 + v1) / 2 + nudge; if (!(v >= k.lo && v <= k.hi)) continue; s0 = e0; s1 = e1; }
      else {
        const from = Math.max(k.lo, Math.min(v0, v1)), to = Math.min(k.hi, Math.max(v0, v1));
        if (to - from < 1e-6) continue;
        s0 = lerp(e0, e1, (from - v0) / (v1 - v0)); s1 = lerp(e0, e1, (to - v0) / (v1 - v0));
      }
      if (dist(s0, s1) < 1e-9) continue;
      if (m.prio > k.prio) {
        if (done && done.has(m.index)) continue;   // an X: this layer already went right through from the other side
        // on through V's layers while they are weaker; stop at the first that is as strong (its near edge), else V's far face
        const step = g > 0 ? 1 : -1;
        let j = i;
        while (j >= 0 && j < V.bands.length && V.bands[j].prio < m.prio) j += step;
        const through = j < 0 || j >= V.bands.length;
        const stop = through ? (g > 0 ? V.hi : V.lo) : (g > 0 ? V.bands[j].lo : V.bands[j].hi);
        const f0 = add(s0, mul(dir, Math.max(0, (stop - V.lat(s0)) / g))), f1 = add(s1, mul(dir, Math.max(0, (stop - V.lat(s1)) / g)));
        let poly = tidy([s0, s1, f1, f0]);
        if (poly.length < 3 || Math.abs(area(poly)) <= 1e-6) continue;
        poly = ccw(poly);
        if (V.body && V.body.length >= 3) poly = clipConvex(poly, V.body);
        if (poly.length < 3) continue;
        out.adds.push({ wall: W.key, band: m.index, mat: m.mat, poly, into: V.key });
        out.cuts.push({ wall: V.key, poly });
        out.regions.push({ poly, mat: m.mat, V, contact });
        if (through && done) done.add(m.index);
      } else if (m.mat !== k.mat && (m.prio === k.prio || !shared)) out.contacts.push([s0, s1]);
    }
  }
}

const sameSeg = (s, t) => (dist(s[0], t[0]) < 1e-6 && dist(s[1], t[1]) < 1e-6) || (dist(s[0], t[1]) < 1e-6 && dist(s[1], t[0]) < 1e-6);
const onLine = (q, s) => { const d = sub(s[1], s[0]), L = Math.hypot(d[0], d[1]) || 1; return Math.abs(cross(d, sub(q, s[0])) / L) < 1e-6; };

/** The lines of the carried pieces: each edge (not the one it came in through), cut at V's layer edges, kept where the far side is another material. */
function regionLines(out) {
  const lines = [];
  const push = (s) => { if (dist(s[0], s[1]) > 1e-6 && !lines.some((x) => sameSeg(x, s))) lines.push(s); };
  for (const R of out.regions) {
    const p = R.poly, V = R.V;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      if (onLine(a, R.contact) && onLine(b, R.contact)) continue;
      // cut the edge where it crosses V's layer edges
      const va = V.lat(a), vb = V.lat(b), cuts = [0, 1];
      if (Math.abs(vb - va) > 1e-9) for (const k of V.bands) for (const v of [k.lo, k.hi]) { const t = (v - va) / (vb - va); if (t > 1e-9 && t < 1 - 1e-9) cuts.push(t); }
      cuts.sort((x, y) => x - y);
      const d = sub(b, a), L = Math.hypot(d[0], d[1]) || 1, outward = [d[1] / L, -d[0] / L];   // anticlockwise polygon: outside is on the right
      for (let c = 0; c < cuts.length - 1; c++) {
        if (cuts[c + 1] - cuts[c] < 1e-9) continue;
        const s = [lerp(a, b, cuts[c]), lerp(a, b, cuts[c + 1])], q = add(lerp(s[0], s[1], 0.5), mul(outward, 1e-4));
        const other = out.regions.find((x) => x !== R && inside(q, x.poly));
        let mat = null;
        if (other) mat = other.mat;
        else if (V.body && V.body.length >= 3 ? inside(q, V.body) : (V.lat(q) > V.lo && V.lat(q) < V.hi)) mat = bandAt(V, V.lat(q))?.mat ?? null;
        if (mat !== null && mat !== R.mat) push(s);
      }
    }
  }
  for (const s of out.contacts) push(s);
  return lines;
}

export function cleanJunction({ kind, walls, through = null } = {}) {
  const out = { adds: [], cuts: [], lines: [], regions: [], contacts: [] };
  const done = () => ({ adds: out.adds, cuts: out.cuts, lines: out.lines });
  if (!Array.isArray(walls) || walls.length !== 2 || walls.some((w) => !w || !w.bands?.length || !(dist(w.a, w.b) > 0))) return done();
  const [A, B] = walls.map(frame);
  if (Math.abs(cross(A.u, B.u)) < NEAR_LINE) return done();
  const outOf = (W) => (W.end === 'b' ? W.u : mul(W.u, -1));   // on past the wall's end
  if (kind === 'X') {
    const T = through !== null && B.key === through ? B : A, O = T === A ? B : A;
    // O's own layers stop where T crosses: the parallelogram of the two walls' thicknesses
    const corner = (to, tt) => { const p = add(T.a, mul(T.n, tt)), q = add(O.a, mul(O.n, to)), c = cross(T.u, O.u); return add(p, mul(T.u, cross(sub(q, p), O.u) / c)); };
    const slab = ccw(tidy([corner(O.hi, T.lo), corner(O.lo, T.lo), corner(O.lo, T.hi), corner(O.hi, T.hi)]));
    out.cuts.push({ wall: O.key, poly: slab });
    const up = dot(O.u, T.n) > 0 ? O.u : mul(O.u, -1), gone = new Set();   // up: O's direction that crosses T from its lo face to its hi face
    carry(O, T, [corner(O.hi, T.lo), corner(O.lo, T.lo)], up, false, out, gone);
    carry(O, T, [corner(O.hi, T.hi), corner(O.lo, T.hi)], mul(up, -1), false, out, gone);
  } else {
    const shared = !!(A.face && B.face && sameSeg(A.face, B.face));
    if (A.end && A.face) carry(A, B, A.face, outOf(A), shared, out);
    if (B.end && B.face) carry(B, A, B.face, outOf(B), shared, out);
  }
  out.lines = regionLines(out);
  return done();
}
