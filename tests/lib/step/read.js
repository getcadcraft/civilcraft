/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-step is a standalone library; its errors are codes (the app words them). */
/**
 * read.js — cc-step: STEP AP203 / AP214 / AP242 files to triangles (0.7 D7.26, session part-08). Written from the published
 * long-form EXPRESS schemas (refs/step-spec/; ISO 10303-42 geometry and topology, -43 representations, -21 the file) and
 * nothing else: no STEP library's source read, OpenCascade only a black-box oracle in the tests. DOM-free; untrusted input
 * (sizes capped, every reference and count checked, a cut-off file reads what it can or says why).
 *
 *   readStep(bytes, { tol }) → {
 *     schema: 'AP203' | 'AP214' | 'AP242' | 'other', schemaName, unitMm (length unit in mm), angle (plane-angle unit in radians),
 *     solids: [{ name, kind: 'brep' | 'faceted' | 'tessellated' | 'surface', positions: Float64Array (mm), indices: Uint32Array,
 *               triFace: Uint32Array (each triangle's face, 0-based in the solid), faces, failedFaces, instance (how many times placed) }],
 *     notes: [{ key, vars }], counts: { entities, solids, instances, faces, failedFaces, triangles } }
 *   Every solid placed where the file's assembly structure puts it (representation relationships with transformation, mapped
 *   items), so an assembly comes in as all its parts in place. Errors: Error with `code` (step.err.*).
 *
 * B-rep faces are tessellated by tess.js (each edge once, shared by its two faces, so a closed shell stays closed); faceted
 * B-reps (poly loops) and AP242 tessellated faces are taken as they are.
 */
import { scanStep, parseParams, parseComplex } from '../ifc/step.js';
import * as G from './geom.js';
import { edgePoints, faceTriangles, earcut } from './tess.js';

export const MAX_BYTES = 300 * 1024 * 1024;
export const MAX_ENTITIES = 8000000;
export const MAX_TRIANGLES = 8000000;
export const MAX_FACES = 400000;

class StepReadError extends Error { constructor(code, vars = {}) { super(code); this.code = code; this.vars = vars; } }
const fail = (code, vars) => { throw new StepReadError(code, vars); };

const { sub, add, mul, dot, cross, len, norm } = G.V3;

/** Schema family from FILE_SCHEMA. */
export function schemaOf(name) {
  const s = (name || '').toUpperCase();
  if (/AP242|MANAGED_MODEL_BASED_3D_ENGINEERING/.test(s)) return 'AP242';
  if (/AUTOMOTIVE_DESIGN|AP214/.test(s)) return 'AP214';
  if (/CONFIG_CONTROL_DESIGN|AP203|CONFIGURATION_CONTROLLED_3D_DESIGN/.test(s)) return 'AP203';
  return 'other';
}

export function readStep(input, { tol = null } = {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length > MAX_BYTES) fail('step.err.too_big', { mb: Math.round(MAX_BYTES / 1048576) });
  let ix;
  try { ix = scanStep(bytes); } catch (e) { fail(/ISO-10303-21/.test(e.message) ? 'step.err.not_step' : 'step.err.bad_file', { why: e.message }); }
  if (ix.count > MAX_ENTITIES) fail('step.err.too_many', { max: MAX_ENTITIES });
  const notes = [];
  const note = (key, vars = {}) => { const n = notes.find((x) => x.key === key); if (n) n.vars.n = (n.vars.n || 1) + 1; else notes.push({ key, vars: { n: 1, ...vars } }); };
  if (ix.errors && ix.errors.length) note('step.note.damaged', { n: ix.errors.length });
  const schemaName = ix.schema || '';
  const schema = schemaOf(schemaName);
  if (schema === 'other') note('step.note.schema', { schema: schemaName.slice(0, 80) });

  // ---- the instances, read on demand
  const rec = new Map();
  for (let i = 0; i < ix.count; i++) rec.set(ix.ids[i], i);
  const cache = new Map();
  /** { type, params } for a simple instance, { type: '', parts: [{ type, params }] } for a complex one, or null. */
  const get = (id) => {
    if (typeof id !== 'number') return null;
    let v = cache.get(id);
    if (v !== undefined) return v;
    const i = rec.get(id);
    if (i === undefined) { cache.set(id, null); return null; }
    const type = ix.names[ix.types[i]];
    try { v = type ? { type, params: parseParams(bytes, ix.starts[i], ix.ends[i]) } : { type: '', parts: parseComplex(bytes, ix.starts[i], ix.ends[i]) }; }
    catch { v = null; }
    cache.set(id, v);
    return v;
  };
  const ref = (x) => (x && typeof x === 'object' && typeof x.ref === 'number' ? x.ref : null);
  const part = (e, type) => (e && e.parts ? e.parts.find((p) => p.type === type) : e && e.type === type ? e : null);
  const has = (e, type) => !!part(e, type);
  const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : (x && typeof x === 'object' && 'value' in x && typeof x.value === 'number' ? x.value : NaN));
  const byType = (want) => { const out = []; for (let i = 0; i < ix.count; i++) { const t = ix.names[ix.types[i]]; if (want.has(t)) out.push(ix.ids[i]); } return out; };

  // ---- units (GLOBAL_UNIT_ASSIGNED_CONTEXT: a length unit and a plane-angle unit)
  let unitMm = 1, angle = 1;
  {
    const unitOf = (id, depth = 0) => {
      const e = get(id);
      if (!e || depth > 4) return null;
      const si = part(e, 'SI_UNIT');
      const pre = { EXA: 1e18, PETA: 1e15, TERA: 1e12, GIGA: 1e9, MEGA: 1e6, KILO: 1e3, HECTO: 100, DECA: 10, DECI: 0.1, CENTI: 0.01, MILLI: 1e-3, MICRO: 1e-6, NANO: 1e-9, PICO: 1e-12 };
      if (si) {
        const [prefix, name] = si.params;
        const f = prefix && prefix.enum ? pre[prefix.enum] ?? 1 : 1;
        if (name && name.enum === 'METRE') return { kind: 'length', mm: f * 1000 };
        if (name && name.enum === 'RADIAN') return { kind: 'angle', rad: f };
        return null;
      }
      const cb = part(e, 'CONVERSION_BASED_UNIT');
      if (cb) {
        const mwu = get(ref(cb.params[1]));
        if (!mwu) return null;
        const [val, base] = mwu.params || (part(mwu, 'MEASURE_WITH_UNIT') || {}).params || [];
        const v = num(val), b = unitOf(ref(base), depth + 1);
        if (!Number.isFinite(v) || !b) return null;
        if (b.kind === 'length') return { kind: 'length', mm: v * b.mm };
        if (b.kind === 'angle') return { kind: 'angle', rad: v * b.rad };
      }
      return null;
    };
    let seen = 0;
    for (let i = 0; i < ix.count && seen < 1; i++) {
      if (ix.names[ix.types[i]] !== '') continue;
      const e = get(ix.ids[i]);
      const g = part(e, 'GLOBAL_UNIT_ASSIGNED_CONTEXT');
      if (!g) continue;
      seen++;
      for (const u of g.params[0] || []) {
        const r = unitOf(ref(u));
        if (r && r.kind === 'length' && r.mm > 0) unitMm = r.mm;
        if (r && r.kind === 'angle' && r.rad > 0) angle = r.rad;
      }
    }
    if (!seen) note('step.note.no_units');
  }

  // ---- geometry
  const memo = new Map();
  const once = (id, fn) => { if (memo.has(id)) return memo.get(id); memo.set(id, null); const v = fn(); memo.set(id, v); return v; };   // (null while building: a reference cycle reads as missing)
  const point = (id) => once(id, () => {
    const e = get(id);
    if (!e || e.type !== 'CARTESIAN_POINT') return null;
    const c = e.params[1];
    if (!Array.isArray(c) || c.length < 2 || !c.every((x) => Number.isFinite(x))) return null;
    return [c[0] * unitMm, c[1] * unitMm, (c[2] || 0) * unitMm];
  });
  const dir = (id) => once('d' + id, () => {
    const e = get(id);
    if (!e || e.type !== 'DIRECTION') return null;
    const c = e.params[1];
    if (!Array.isArray(c) || c.length < 2 || !c.every((x) => Number.isFinite(x))) return null;
    const d = [c[0], c[1], c[2] || 0];
    return len(d) > 0 ? norm(d) : null;
  });
  const place3 = (id) => once('p' + id, () => {
    const e = get(id);
    if (!e) return null;
    if (e.type === 'AXIS2_PLACEMENT_3D') {
      const o = point(ref(e.params[1]));
      if (!o) return null;
      return G.frame(o, e.params[2] ? dir(ref(e.params[2])) : null, e.params[3] ? dir(ref(e.params[3])) : null);
    }
    if (e.type === 'AXIS2_PLACEMENT_2D') {
      const o = point(ref(e.params[1]));
      return o ? G.frame(o, null, e.params[2] ? dir(ref(e.params[2])) : null) : null;
    }
    return null;
  });
  const knotsOf = (p, n, params, kind) => {
    // the explicit knots, or those a uniform / quasi-uniform / Bézier form implies
    if (kind === 'with_knots') {
      const [mults, knots] = params;
      if (!Array.isArray(mults) || !Array.isArray(knots) || mults.length !== knots.length || !mults.every((m) => Number.isInteger(m) && m >= 0 && m <= p + 1) || !knots.every(Number.isFinite)) return null;
      return G.expandKnots(knots, mults);
    }
    const m = n + p + 2;
    if (kind === 'bezier') return [...Array(p + 1).fill(0), ...Array(m - p - 1).fill(1)];
    if (kind === 'quasi') { const out = []; for (let i = 0; i < m; i++) out.push(Math.min(Math.max(i - p, 0), n - p + 1)); return out; }
    return Array.from({ length: m }, (_, i) => i - p);
  };
  const curve = (id, depth = 0) => once('c' + id, () => {
    const e = get(id);
    if (!e || depth > 8) return null;
    switch (e.type) {
      case 'LINE': { const p = point(ref(e.params[1])), v = get(ref(e.params[2])); const d = v && v.type === 'VECTOR' ? dir(ref(v.params[1])) : null; return p && d ? G.line(p, d) : null; }
      case 'CIRCLE': { const F = place3(ref(e.params[1])), r = num(e.params[2]) * unitMm; return F && r > 0 ? G.circle(F, r) : null; }
      case 'ELLIPSE': { const F = place3(ref(e.params[1])), a = num(e.params[2]) * unitMm, b = num(e.params[3]) * unitMm; return F && a > 0 && b > 0 ? G.ellipse(F, a, b) : null; }
      case 'POLYLINE': { const pts = (e.params[1] || []).map((x) => point(ref(x))); return pts.length >= 2 && pts.every(Boolean) ? G.polyline(pts) : null; }
      case 'TRIMMED_CURVE': return curve(ref(e.params[1]), depth + 1);   // the edge's vertices trim it
      case 'SURFACE_CURVE': case 'SEAM_CURVE': case 'INTERSECTION_CURVE': case 'BOUNDED_SURFACE_CURVE': return curve(ref(e.params[1]), depth + 1);
      case 'B_SPLINE_CURVE_WITH_KNOTS': case 'BEZIER_CURVE': case 'UNIFORM_CURVE': case 'QUASI_UNIFORM_CURVE': {
        const [, p, list, , closed] = e.params;
        const P = (list || []).map((x) => point(ref(x)));
        if (!Number.isInteger(p) || p < 1 || p > 25 || P.length < 2 || !P.every(Boolean)) return null;
        const U = knotsOf(p, P.length - 1, e.params.slice(6), e.type === 'B_SPLINE_CURVE_WITH_KNOTS' ? 'with_knots' : e.type === 'BEZIER_CURVE' ? 'bezier' : e.type === 'QUASI_UNIFORM_CURVE' ? 'quasi' : 'uniform');
        try { return U ? G.bsplineCurve(p, P, U, null, closed && closed.enum === 'T') : null; } catch { return null; }
      }
      case '': {
        // a complex instance: a rational B-spline curve (B_SPLINE_CURVE + a knot form + RATIONAL_B_SPLINE_CURVE)
        const bs = part(e, 'B_SPLINE_CURVE');
        if (!bs) return null;
        const [p, list, , closed] = bs.params;
        const P = (list || []).map((x) => point(ref(x)));
        if (!Number.isInteger(p) || p < 1 || p > 25 || P.length < 2 || !P.every(Boolean)) return null;
        const wk = part(e, 'B_SPLINE_CURVE_WITH_KNOTS');
        const U = wk ? knotsOf(p, P.length - 1, wk.params, 'with_knots') : knotsOf(p, P.length - 1, [], has(e, 'BEZIER_CURVE') ? 'bezier' : has(e, 'QUASI_UNIFORM_CURVE') ? 'quasi' : 'uniform');
        const rat = part(e, 'RATIONAL_B_SPLINE_CURVE');
        const W = rat ? rat.params[0] : null;
        if (W && (!Array.isArray(W) || W.length !== P.length || !W.every((w) => Number.isFinite(w) && w > 0))) return null;
        try { return U ? G.bsplineCurve(p, P, U, W, closed && closed.enum === 'T') : null; } catch { return null; }
      }
      default: return null;
    }
  });
  const surface = (id, depth = 0) => once('s' + id, () => {
    const e = get(id);
    if (!e || depth > 6) return null;
    const F = () => place3(ref(e.params[1]));
    switch (e.type) {
      case 'PLANE': { const f = F(); return f ? G.plane(f) : null; }
      case 'CYLINDRICAL_SURFACE': { const f = F(), r = num(e.params[2]) * unitMm; return f && r > 0 ? G.cylinder(f, r) : null; }
      case 'CONICAL_SURFACE': { const f = F(), r = num(e.params[2]) * unitMm, a = num(e.params[3]) * angle; return f && Number.isFinite(r) && Math.abs(a) > 0 && Math.abs(a) < Math.PI / 2 ? G.cone(f, r, a) : null; }
      case 'SPHERICAL_SURFACE': { const f = F(), r = num(e.params[2]) * unitMm; return f && r > 0 ? G.sphere(f, r) : null; }
      case 'TOROIDAL_SURFACE': case 'DEGENERATE_TOROIDAL_SURFACE': { const f = F(), R = num(e.params[2]) * unitMm, r = num(e.params[3]) * unitMm; return f && R > 0 && r > 0 ? G.torus(f, R, r) : null; }
      case 'SURFACE_OF_REVOLUTION': {
        const c = curve(ref(e.params[1])), ax = get(ref(e.params[2]));
        if (!c || !ax || ax.type !== 'AXIS1_PLACEMENT') return null;
        const o = point(ref(ax.params[1])), z = ax.params[2] ? dir(ref(ax.params[2])) : [0, 0, 1];
        return o && z ? G.revolution(c, o, z) : null;
      }
      case 'SURFACE_OF_LINEAR_EXTRUSION': {
        const c = curve(ref(e.params[1])), v = get(ref(e.params[2]));
        if (!c || !v || v.type !== 'VECTOR') return null;
        const d = dir(ref(v.params[1])), m = num(v.params[2]) * unitMm;
        return d && Number.isFinite(m) ? G.extrusion(c, mul(d, m)) : null;
      }
      case 'OFFSET_SURFACE': { const b = surface(ref(e.params[1]), depth + 1), d = num(e.params[2]) * unitMm; return b && Number.isFinite(d) ? G.offset(b, d) : null; }
      case 'RECTANGULAR_TRIMMED_SURFACE': return surface(ref(e.params[1]), depth + 1);
      case 'B_SPLINE_SURFACE_WITH_KNOTS': case 'BEZIER_SURFACE': case 'UNIFORM_SURFACE': case 'QUASI_UNIFORM_SURFACE': return bsSurface(e, null);
      case '': { const bs = part(e, 'B_SPLINE_SURFACE'); return bs ? bsSurface(e, bs) : null; }
      default: return null;
    }
  });
  function bsSurface(e, bsPart) {
    const params = bsPart ? bsPart.params : e.params.slice(1);
    const [pu, pv, grid, , cu, cv] = params;
    if (!Number.isInteger(pu) || !Number.isInteger(pv) || pu < 1 || pv < 1 || pu > 25 || pv > 25 || !Array.isArray(grid) || grid.length < 2) return null;
    const P = grid.map((row) => (Array.isArray(row) ? row.map((x) => point(ref(x))) : []));
    if (P.some((row) => row.length < 2 || row.length !== P[0].length || !row.every(Boolean))) return null;
    let Uu, Uv;
    const wk = bsPart ? part(e, 'B_SPLINE_SURFACE_WITH_KNOTS') : e.type === 'B_SPLINE_SURFACE_WITH_KNOTS' ? { params: e.params.slice(8) } : null;
    if (wk) {
      const [mu, mv, ku, kv] = wk.params;
      Uu = knotsOf(pu, P.length - 1, [mu, ku], 'with_knots'); Uv = knotsOf(pv, P[0].length - 1, [mv, kv], 'with_knots');
    } else {
      const kind = has(e, 'BEZIER_SURFACE') || e.type === 'BEZIER_SURFACE' ? 'bezier' : has(e, 'QUASI_UNIFORM_SURFACE') || e.type === 'QUASI_UNIFORM_SURFACE' ? 'quasi' : 'uniform';
      Uu = knotsOf(pu, P.length - 1, [], kind); Uv = knotsOf(pv, P[0].length - 1, [], kind);
    }
    if (!Uu || !Uv) return null;
    const rat = part(e, 'RATIONAL_B_SPLINE_SURFACE');
    const W = rat ? rat.params[0] : null;
    if (W && (!Array.isArray(W) || W.length !== P.length || W.some((row, i) => !Array.isArray(row) || row.length !== P[i].length || !row.every((w) => Number.isFinite(w) && w > 0)))) return null;
    try { return G.bsplineSurface(pu, pv, P, Uu, Uv, W, cu && cu.enum === 'T', cv && cv.enum === 'T'); } catch { return null; }
  }

  // ---- topology → triangles
  const vertexPt = (id) => { const v = get(id); if (!v) return null; if (v.type === 'VERTEX_POINT') return point(ref(v.params[1])); return null; };
  // the model's size, from its vertices: the chord tolerance
  let size = 0;
  if (tol === null) {
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity], n = 0;
    // every point of the file (vertices, placements, control points): a whole sphere has one vertex, its centre is a placement
    for (const id of byType(new Set(['CARTESIAN_POINT']))) { const p = point(id); if (!p) continue; n++; for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); } }
    size = n > 1 ? Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) : 100;
    if (!(size > 0)) size = 100;
    tol = Math.max(size * 4e-4, 1e-4);
  }
  const edgeCache = new Map();
  const edgePts = (id) => {
    if (edgeCache.has(id)) return edgeCache.get(id);
    const e = get(id);
    let pts = null;
    if (e && e.type === 'EDGE_CURVE') {
      const a = vertexPt(ref(e.params[1])), b = vertexPt(ref(e.params[2])), c = curve(ref(e.params[3]));
      const same = !(e.params[4] && e.params[4].enum === 'F');
      if (a && b && c) { try { pts = edgePoints(c, a, b, same, tol); } catch { pts = null; } }
      else if (a && b) pts = [a, b];   // a curve we cannot read: its chord (said in the notes)
      if (a && b && !c) note('step.note.unknown_curve', { type: get(ref(e.params[3]))?.type || '?' });
    }
    edgeCache.set(id, pts);
    return pts;
  };
  const loopPts = (id) => {
    const l = get(id);
    if (!l) return null;
    if (l.type === 'POLY_LOOP') { const pts = (l.params[1] || []).map((x) => point(ref(x))); return pts.length >= 3 && pts.every(Boolean) ? pts : null; }
    if (l.type === 'VERTEX_LOOP') return null;   // a pole or apex: nothing to bound
    if (l.type !== 'EDGE_LOOP') return null;
    const out = [];
    const seen = new Set();
    let seam2 = -1;   // where an edge's second use in this loop starts (a seam: its second pass is one period over)
    for (const oe of l.params[1] || []) {
      const o = get(ref(oe));
      if (!o || o.type !== 'ORIENTED_EDGE') return null;
      const eid = ref(o.params[3]);
      let pts = edgePts(eid);
      if (!pts) return null;
      if (o.params[4] && o.params[4].enum === 'F') pts = pts.slice().reverse();
      if (seen.has(eid) && seam2 < 0) seam2 = Math.max(0, out.length - 1);
      seen.add(eid);
      for (let k = out.length ? 1 : 0; k < pts.length; k++) out.push(pts[k]);
    }
    if (out.length > 1 && len(sub(out[0], out[out.length - 1])) <= tol * 1e-2) out.pop();
    if (out.length < 2) return null;
    out.seam2 = seam2;
    return out;
  };
  const counts = { entities: ix.count, solids: 0, instances: 0, faces: 0, failedFaces: 0, triangles: 0 };
  /** Triangles of one face → appended to (pos, idx). */
  const addFace = (fid, pos, idx) => {
    const f = get(fid);
    if (!f) return false;
    counts.faces++;
    if (counts.faces > MAX_FACES) fail('step.err.too_many_faces', { max: MAX_FACES });
    const isSurf = f.type === 'ADVANCED_FACE' || f.type === 'FACE_SURFACE';
    if (f.type === 'TRIANGULATED_FACE' || f.type === 'COMPLEX_TRIANGULATED_FACE') return addTessFace(f, pos, idx);
    if (!isSurf && f.type !== 'FACE') return false;
    const bounds = (f.params[1] || []).map((b) => get(ref(b))).filter(Boolean);
    const loops = [];
    for (const b of bounds) {
      let pts = loopPts(ref(b.params[1]));
      if (!pts) { if (get(ref(b.params[1]))?.type === 'VERTEX_LOOP') continue; return false; }
      if (b.params[2] && b.params[2].enum === 'F') pts = pts.slice().reverse();
      let seam2 = pts.seam2 ?? -1;
      if (b.params[2] && b.params[2].enum === 'F' && seam2 >= 0) seam2 = pts.length - 1 - seam2;   // (the loop was turned round)
      loops.push({ pts, outer: b.type === 'FACE_OUTER_BOUND', dir: 1, seam2 });
    }
    let r;
    if (isSurf) {
      const S = surface(ref(f.params[2]));
      if (!S) { note('step.note.unknown_surface', { type: get(ref(f.params[2]))?.type || '?' }); return false; }
      const same = !(f.params[3] && f.params[3].enum === 'F');
      r = faceTriangles(S, loops, { sameSense: same, tol });
      for (const n of r.notes) note(n);
    } else {
      // FACE with poly loops (faceted B-rep): each loop in its own best plane
      r = flatFace(loops);
    }
    if (!r || !r.tris.length) return false;
    const base = pos.length / 3;
    for (const p of r.pos) pos.push(p[0], p[1], p[2]);
    for (const t of r.tris) idx.push(base + t[0], base + t[1], base + t[2]);
    counts.triangles += r.tris.length;
    if (counts.triangles > MAX_TRIANGLES) fail('step.err.too_many_triangles', { max: MAX_TRIANGLES });
    return true;
  };
  const flatFace = (loops) => {
    if (!loops.length) return null;
    const outer = loops.find((l) => l.outer) || loops.reduce((a, b) => (a.pts.length >= b.pts.length ? a : b));
    const n = [0, 0, 0];
    const op = outer.pts;
    for (let i = 0; i < op.length; i++) { const a = op[i], b = op[(i + 1) % op.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
    if (!(len(n) > 0)) return null;
    const F = G.frame(op[0], n, null);
    const pos = [], P2 = [];
    const ring = (l) => l.pts.map((p) => { pos.push(p); const d = sub(p, F.o); P2.push([dot(d, F.x), dot(d, F.y)]); return P2.length - 1; });
    const o = ring(outer), holes = loops.filter((l) => l !== outer).map(ring);
    const area = (r) => { let s = 0; for (let i = 0; i < r.length; i++) { const a = P2[r[i]], b = P2[r[(i + 1) % r.length]]; s += a[0] * b[1] - b[0] * a[1]; } return s; };
    if (area(o) < 0) o.reverse();
    for (const h of holes) if (area(h) > 0) h.reverse();
    // counter-clockwise in a frame whose z is the outer loop's own normal (outward, as the file runs it): no turn needed
    return { pos, tris: earcut(P2, o, holes), notes: [] };
  };
  // AP242 tessellated faces: TRIANGULATED_FACE(name, coordinates, pnmax, normals, geometric_link, pnindex, triangles)
  const addTessFace = (f, pos, idx) => {
    const cl = get(ref(f.params[1]));
    if (!cl || cl.type !== 'COORDINATES_LIST') return false;
    const pts = cl.params[2];
    if (!Array.isArray(pts) || pts.length > 4 * MAX_TRIANGLES) return false;
    const P = pts.map((c) => (Array.isArray(c) && c.length >= 3 && c.every(Number.isFinite) ? [c[0] * unitMm, c[1] * unitMm, c[2] * unitMm] : null));
    if (P.some((p) => !p)) return false;
    const pnindex = Array.isArray(f.params[5]) && f.params[5].length ? f.params[5] : null;
    const tris = f.type === 'TRIANGULATED_FACE' ? f.params[6] : null;
    if (!Array.isArray(tris)) { note('step.note.complex_tess'); return false; }
    const base = pos.length / 3;
    const map = (i) => { const k = pnindex ? pnindex[i - 1] : i; return Number.isInteger(k) && k >= 1 && k <= P.length ? k - 1 : -1; };
    const used = new Map();
    const vid = (i) => { const k = map(i); if (k < 0) return -1; let v = used.get(k); if (v === undefined) { v = base + used.size; used.set(k, v); pos.push(...P[k]); } return v; };
    let n = 0;
    for (const t of tris) {
      if (!Array.isArray(t) || t.length !== 3) continue;
      const a = vid(t[0]), b = vid(t[1]), c = vid(t[2]);
      if (a < 0 || b < 0 || c < 0) continue;
      idx.push(a, b, c); n++;
    }
    counts.triangles += n;
    return n > 0;
  };
  /** A solid item → { kind, pos, idx, faces, failed } in its representation's coordinates. */
  const solidMesh = (id) => once('m' + id, () => {
    const e = get(id);
    if (!e) return null;
    let shells = [], kind = 'brep';
    if (e.type === 'MANIFOLD_SOLID_BREP') shells = [ref(e.params[1])];
    else if (e.type === 'BREP_WITH_VOIDS') shells = [ref(e.params[1]), ...(e.params[2] || []).map((v) => { const o = get(ref(v)); return o && o.type === 'ORIENTED_CLOSED_SHELL' ? ref(o.params[2]) : ref(v); })];
    else if (e.type === 'FACETED_BREP') { shells = [ref(e.params[1])]; kind = 'faceted'; }
    else if (e.type === 'SHELL_BASED_SURFACE_MODEL') { shells = (e.params[1] || []).map(ref); kind = 'surface'; }
    else if (e.type === 'TESSELLATED_SOLID' || e.type === 'TESSELLATED_SHELL') { kind = 'tessellated'; }
    else return null;
    const pos = [], idx = [], tf = [];   // tf: the face each triangle came from (its place in the solid's face list)
    let faces = 0, failed = 0;
    const faceIds = [];
    if (kind === 'tessellated') for (const x of e.params[1] || []) faceIds.push(ref(x));
    for (const sid of shells) { const s = get(sid); if (!s) continue; for (const f of s.params[1] || []) faceIds.push(ref(f)); }
    for (const fid of faceIds) {
      faces++;
      let okF = false;
      const t0 = idx.length;
      try { okF = addFace(fid, pos, idx); } catch (err) { if (err instanceof StepReadError) throw err; okF = false; }
      if (!okF) failed++;
      for (let k = t0 / 3; k < idx.length / 3; k++) tf.push(faces - 1);
    }
    counts.failedFaces += failed;
    if (failed) note('step.note.faces_failed', { n: failed });
    return { kind, name: typeof e.params[0] === 'string' ? e.params[0] : '', pos, idx, tf, faces, failed };
  });

  // ---- where the solids are: representations, their links and placements (ISO 10303-43)
  const SOLID_TYPES = new Set(['MANIFOLD_SOLID_BREP', 'BREP_WITH_VOIDS', 'FACETED_BREP', 'SHELL_BASED_SURFACE_MODEL', 'TESSELLATED_SOLID', 'TESSELLATED_SHELL']);
  const REP_TYPES = new Set(['SHAPE_REPRESENTATION', 'ADVANCED_BREP_SHAPE_REPRESENTATION', 'MANIFOLD_SURFACE_SHAPE_REPRESENTATION', 'FACETED_BREP_SHAPE_REPRESENTATION', 'GEOMETRICALLY_BOUNDED_SURFACE_SHAPE_REPRESENTATION', 'TESSELLATED_SHAPE_REPRESENTATION', 'SHAPE_REPRESENTATION_WITH_PARAMETERS']);
  const M4 = (F) => [F.x[0], F.x[1], F.x[2], 0, F.y[0], F.y[1], F.y[2], 0, F.z[0], F.z[1], F.z[2], 0, F.o[0], F.o[1], F.o[2], 1];
  const mm = (a, b) => { const r = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 4; k++) r[c * 4 + rr] += a[k * 4 + rr] * b[c * 4 + k]; return r; };
  const inv = (m) => { const R = [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]], t = [m[12], m[13], m[14]]; return [R[0], R[1], R[2], 0, R[3], R[4], R[5], 0, R[6], R[7], R[8], 0, -(R[0] * t[0] + R[3] * t[1] + R[6] * t[2]), -(R[1] * t[0] + R[4] * t[1] + R[7] * t[2]), -(R[2] * t[0] + R[5] * t[1] + R[8] * t[2]), 1]; };
  const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const reps = new Map();   // rep id → items
  for (let i = 0; i < ix.count; i++) {
    const t = ix.names[ix.types[i]], id = ix.ids[i];
    if (REP_TYPES.has(t)) { const e = get(id); if (e) reps.set(id, (e.params[1] || []).map(ref).filter((x) => x !== null)); }
    else if (t === '') {
      const e = get(id);
      if (e && e.parts && e.parts.some((p) => REP_TYPES.has(p.type))) { const r = part(e, 'REPRESENTATION'); if (r) reps.set(id, (r.params[1] || []).map(ref).filter((x) => x !== null)); }
    }
  }
  // the same coordinates: plain shape representation relationships join two representations
  const grp = new Map([...reps.keys()].map((k) => [k, k]));
  const find = (x) => { while (grp.get(x) !== x) { grp.set(x, grp.get(grp.get(x))); x = grp.get(x); } return x; };
  const children = new Map();   // group → [{ child group, T (child → parent) }]
  const isChild = new Set();
  const link = (p, c, T) => { const l = children.get(p); if (l) l.push({ c, T }); else children.set(p, [{ c, T }]); isChild.add(c); };
  const plainLinks = [], transLinks = [];
  for (let i = 0; i < ix.count; i++) {
    const t = ix.names[ix.types[i]], id = ix.ids[i];
    if (t === 'SHAPE_REPRESENTATION_RELATIONSHIP' || t === 'REPRESENTATION_RELATIONSHIP') { const e = get(id); if (e) plainLinks.push([ref(e.params[2]), ref(e.params[3])]); }
    else if (t === '') {
      const e = get(id);
      const rr = part(e, 'REPRESENTATION_RELATIONSHIP'), rt = part(e, 'REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION');
      if (rr && rt) transLinks.push({ r1: ref(rr.params[2]), r2: ref(rr.params[3]), op: ref(rt.params[0]) });
      else if (rr) plainLinks.push([ref(rr.params[2]), ref(rr.params[3])]);
    }
  }
  for (const [a, b] of plainLinks) if (reps.has(a) && reps.has(b)) grp.set(find(a), find(b));
  for (const { r1, r2, op } of transLinks) {
    if (!reps.has(r1) || !reps.has(r2)) continue;
    const idt = get(op);
    let T = I4;
    if (idt && idt.type === 'ITEM_DEFINED_TRANSFORMATION') {
      const A1 = place3(ref(idt.params[2])), A2 = place3(ref(idt.params[3]));
      if (A1 && A2) T = mm(M4(A2), inv(M4(A1)));   // rep_1's contents (the component) into rep_2 (the assembly)
    } else note('step.note.transform');
    link(find(r2), find(r1), T);
  }
  const instances = [];   // { solid id, T }
  const visit = (g, T, depth) => {
    if (depth > 32) { note('step.note.deep'); return; }
    for (const [rid, items] of reps) {
      if (find(rid) !== g) continue;
      for (const it of items) {
        const e = get(it);
        if (!e) continue;
        if (SOLID_TYPES.has(e.type)) instances.push({ id: it, T });
        else if (e.type === 'MAPPED_ITEM') {
          const map = get(ref(e.params[1])), tgt = place3(ref(e.params[2]));
          if (!map || map.type !== 'REPRESENTATION_MAP') continue;
          const org = place3(ref(map.params[0])), sub2 = ref(map.params[1]);
          if (!reps.has(sub2)) continue;
          const Tm = org && tgt ? mm(M4(tgt), inv(M4(org))) : I4;
          visit(find(sub2), mm(T, Tm), depth + 1);
        }
      }
    }
    for (const { c, T: Tc } of children.get(g) || []) visit(c, mm(T, Tc), depth + 1);
    if (instances.length > 100000) fail('step.err.too_many_instances');
  };
  const groups = new Set([...reps.keys()].map(find));
  for (const g of groups) if (!isChild.has(g)) visit(g, I4, 0);
  // solids no representation names (a file with geometry only): placed as they are
  const placed = new Set(instances.map((x) => x.id));
  for (const id of byType(SOLID_TYPES)) if (!placed.has(id)) {
    // only top-level solids (not one that is part of another, which none of these is)
    instances.push({ id, T: I4 });
  }
  // a solid placed twice by the same path once (duplicate links) is kept once
  const seenKey = new Set();
  const solids = [];
  for (const { id, T } of instances) {
    const k = id + ':' + T.map((v) => v.toFixed(6)).join(',');
    if (seenKey.has(k)) continue;
    seenKey.add(k);
    const s = solidMesh(id);
    if (!s || !s.idx.length) continue;
    const pos = new Float64Array(s.pos.length);
    for (let i = 0; i < s.pos.length; i += 3) {
      const x = s.pos[i], y = s.pos[i + 1], z = s.pos[i + 2];
      pos[i] = T[0] * x + T[4] * y + T[8] * z + T[12]; pos[i + 1] = T[1] * x + T[5] * y + T[9] * z + T[13]; pos[i + 2] = T[2] * x + T[6] * y + T[10] * z + T[14];
    }
    solids.push({ name: s.name, kind: s.kind, positions: pos, indices: Uint32Array.from(s.idx), triFace: Uint32Array.from(s.tf), faces: s.faces, failedFaces: s.failed, solid: id });
  }
  counts.solids = new Set(solids.map((s) => s.solid)).size;
  counts.instances = solids.length;
  if (!solids.length) fail(counts.faces ? 'step.err.no_faces_built' : 'step.err.no_solids');
  return { schema, schemaName, unitMm, angle, tol, size, solids, notes, counts };
}

export { StepReadError };
