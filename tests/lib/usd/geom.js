/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom.js — reading geometry off a composed stage (stage.js), from the published UsdGeom schema: transform ops,
 * values at a time, meshes with their primvars, the built-in shapes, visibility and purpose, and the stage's units and
 * up axis turned into metres, Z up. DOM-free, import-free but for sdf.js types.
 *
 * Matrices are 16 numbers in USD's flat row-major order with row vectors (translation in [12..14]); that is the same
 * array as a column-major matrix acting on column vectors, the layout ModelCraft's kernel and three.js use, so the
 * numbers pass straight through.
 *
 *   valueAt(prop, time) → Value | null               (held, or linear between numeric samples)
 *   localMatrix(prim, time) → { m, reset }          worldMatrix(prim, time) → m
 *   stageFrame(stage) → m                            stage units/up axis → metres, Z up
 *   meshOf(prim, time) → { points, counts, indices, holes, leftHanded, primvars: Map, subdivision, creases } | null
 *   shapeMesh(prim, time) → the same for Cube, Sphere, Cylinder, Cone, Capsule, Plane   | null
 *   visibleOf(prim, time) → bool (visibility inherits 'invisible') · purposeOf(prim) → 'default' | 'render' | 'proxy' | 'guide'
 *   mul(a, b) · invert(m) · IDENTITY · transformPoint(m, p)
 */

export const IDENTITY = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/** a·b in column-vector terms (apply b first): column-major arrays. */
export function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return o;
}
export function invert(m) {
  const a = m, inv = new Array(16);
  inv[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
  inv[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
  inv[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
  inv[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
  inv[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
  inv[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
  inv[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
  inv[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
  inv[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
  inv[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
  inv[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
  inv[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
  inv[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
  inv[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
  inv[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
  inv[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
  const det = a[0] * inv[0] + a[1] * inv[4] + a[2] * inv[8] + a[3] * inv[12];
  if (!det || !Number.isFinite(det)) return IDENTITY.slice();
  for (let i = 0; i < 16; i++) inv[i] /= det;
  return inv;
}
export function transformPoint(m, p) {
  const x = p[0], y = p[1], z = p[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w];
}
const translate = (t) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1];
const scale = (s) => [s[0], 0, 0, 0, 0, s[1], 0, 0, 0, 0, s[2], 0, 0, 0, 0, 1];
function rot(axis, deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  if (axis === 'X') return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  if (axis === 'Y') return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
/** [w, x, y, z] → rotation matrix (normalised). */
export function quatMatrix(q) {
  let [w, x, y, z] = q;
  const n = Math.hypot(w, x, y, z) || 1;
  w /= n; x /= n; y /= n; z /= n;
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y), 0,
    2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x), 0,
    2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ];
}

// ---------------------------------------------------------------- values at a time

/** An attribute's value at `time` (undefined time → the default, else the first sample). */
export function valueAt(prop, time) {
  if (!prop) return null;
  const ts = prop.timeSamples;
  if (!ts || !ts.length) return prop.value;
  if (time === undefined || time === null) return prop.value || ts[0][1];
  if (time <= ts[0][0]) return ts[0][1];
  if (time >= ts[ts.length - 1][0]) return ts[ts.length - 1][1];
  let i = 1;
  while (ts[i][0] < time) i++;
  const [t0, a] = ts[i - 1], [t1, b] = ts[i];
  if (!a || !b || a.t !== b.t || typeof a.v === 'string' || a.t.startsWith('quat') || a.t.includes('token') || a.t === 'bool') return a;
  const u = (time - t0) / (t1 - t0);
  if (typeof a.v === 'number') return { t: a.t, v: a.v + (b.v - a.v) * u };
  if (a.v && b.v && a.v.length === b.v.length) {
    const out = a.v instanceof Float32Array ? new Float32Array(a.v.length) : new Array(a.v.length);
    for (let k = 0; k < a.v.length; k++) out[k] = a.v[k] + (b.v[k] - a.v[k]) * u;
    return { t: a.t, v: out };
  }
  return a;
}
const num = (prim, name, time, dflt) => { const v = valueAt(prim.props.get(name), time); return v && typeof v.v === 'number' ? v.v : dflt; };
const tokenOf = (prim, name, dflt) => { const v = valueAt(prim.props.get(name)); return v && typeof v.v === 'string' ? v.v : dflt; };

// ---------------------------------------------------------------- transforms

const ROT3 = /^rotate(XYZ|XZY|YXZ|YZX|ZXY|ZYX)$/;
/** The prim's own transform from xformOpOrder. */
export function localMatrix(prim, time) {
  const orderV = valueAt(prim.props.get('xformOpOrder'));
  if (!orderV) return { m: IDENTITY.slice(), reset: false };
  let m = IDENTITY.slice();
  let reset = false;
  for (const raw of orderV.v) {
    if (raw === '!resetXformStack!') { reset = true; m = IDENTITY.slice(); continue; }
    const inverse = raw.startsWith('!invert!');
    const name = inverse ? raw.slice(8) : raw;
    const v = valueAt(prim.props.get(name), time);
    if (!v) continue;
    const kind = name.split(':')[1] || '';
    let op = null;
    const x = v.v;
    if (kind === 'translate') op = translate(x);
    else if (kind === 'scale') op = scale(x);
    else if (kind === 'transform') op = Array.from(x);
    else if (kind === 'orient') op = quatMatrix(x);
    else if (kind === 'rotateX' || kind === 'rotateY' || kind === 'rotateZ') op = rot(kind.slice(-1), x);
    else {
      const mm = ROT3.exec(kind);
      if (mm) {
        const axes = mm[1];
        const ang = { X: x[0], Y: x[1], Z: x[2] };
        // rotateABC: A first, then B, then C
        op = mul(rot(axes[2], ang[axes[2]]), mul(rot(axes[1], ang[axes[1]]), rot(axes[0], ang[axes[0]])));
      }
    }
    if (!op) continue;
    m = mul(m, inverse ? invert(op) : op);
  }
  return { m, reset };
}
export function worldMatrix(prim, time) {
  const chain = [];
  for (let p = prim; p && p.path !== '/'; p = p.parent) {
    const { m, reset } = localMatrix(p, time);
    chain.push(m);
    if (reset) break;
  }
  let w = IDENTITY.slice();
  for (let i = chain.length - 1; i >= 0; i--) w = mul(w, chain[i]);
  return w;
}
/** Stage space → metres, Z up. */
export function stageFrame(stage) {
  const s = stage.meta.metersPerUnit > 0 ? stage.meta.metersPerUnit : 0.01;
  const m = scale([s, s, s]);
  return stage.meta.upAxis === 'Y' ? mul(rot('X', 90), m) : m;
}

export function visibleOf(prim, time) {
  for (let p = prim; p && p.path !== '/'; p = p.parent) if (tokenOf(p, 'visibility', 'inherited') === 'invisible') return false;
  void time;
  return true;
}
export function purposeOf(prim) {
  for (let p = prim; p && p.path !== '/'; p = p.parent) { const v = tokenOf(p, 'purpose', 'default'); if (v !== 'default') return v; }
  return 'default';
}

// ---------------------------------------------------------------- meshes

/** A primvar (or normals) as { values, n, interp, indices, type }. */
function primvar(prim, name, time) {
  const p = prim.props.get(name);
  const v = valueAt(p, time);
  if (!v || !v.v) return null;
  const base = v.t.replace('[]', '');
  const n = /\d$/.test(base) && !base.startsWith('matrix') ? +base.slice(-1) : 1;
  const ix = valueAt(prim.props.get(name + ':indices'), time);
  const es = p.meta.get('elementSize')?.v || 1;
  return { values: v.v, n, interp: p.meta.get('interpolation')?.v || (name === 'normals' ? 'vertex' : 'constant'), indices: ix ? ix.v : null, type: p.typeName, elementSize: es };
}

export function meshOf(prim, time) {
  if (prim.typeName !== 'Mesh') {
    // a built-in shape: its own topology, and the prim's constant primvars (a display colour still applies)
    const m = shapeMesh(prim, time);
    if (m) for (const name of prim.props.keys()) {
      if (!name.startsWith('primvars:') || name.endsWith(':indices')) continue;
      const pv = primvar(prim, name, time);
      if (pv && pv.interp === 'constant') m.primvars.set(name.slice(9), pv);
    }
    return m;
  }
  const pts = valueAt(prim.props.get('points'), time);
  const counts = valueAt(prim.props.get('faceVertexCounts'), time);
  const idx = valueAt(prim.props.get('faceVertexIndices'), time);
  if (!pts || !counts || !idx) return null;
  const points = Float64Array.from(pts.v);
  const nPts = points.length / 3;
  const ci = Int32Array.from(counts.v), ii = Int32Array.from(idx.v);
  // drop a mesh whose faces don't add up or point outside its points (untrusted: never index past an array)
  let total = 0;
  for (const c of ci) { if (c < 0) return null; total += c; }
  if (total !== ii.length) return null;
  for (const k of ii) if (k < 0 || k >= nPts) return null;
  const primvars = new Map();
  for (const name of prim.props.keys()) {
    if (name.startsWith('primvars:') && !name.endsWith(':indices')) { const pv = primvar(prim, name, time); if (pv) primvars.set(name.slice(9), pv); }
  }
  const nrm = primvar(prim, 'normals', time);
  if (nrm && !primvars.has('normals')) primvars.set('normals', nrm);
  const holes = valueAt(prim.props.get('holeIndices'), time);
  const ci2 = valueAt(prim.props.get('creaseIndices'), time), cl = valueAt(prim.props.get('creaseLengths'), time), cs = valueAt(prim.props.get('creaseSharpnesses'), time);
  return {
    points, counts: ci, indices: ii, holes: holes ? Array.from(holes.v) : [],
    leftHanded: tokenOf(prim, 'orientation', 'rightHanded') === 'leftHanded',
    subdivision: tokenOf(prim, 'subdivisionScheme', 'catmullClark'),
    creases: ci2 && cl ? { indices: Array.from(ci2.v), lengths: Array.from(cl.v), sharpness: cs ? Array.from(cs.v) : [] } : null,
    doubleSided: valueAt(prim.props.get('doubleSided'))?.v === true,
    primvars,
  };
}

const SEG = 24;
/** The built-in shapes as meshes (fallback sizes from the schema). */
export function shapeMesh(prim, time) {
  const t = prim.typeName;
  const P = [], C = [], I = [];
  const quad = (a, b, c, d) => { C.push(4); I.push(a, b, c, d); };
  const tri = (a, b, c) => { C.push(3); I.push(a, b, c); };
  const v = (x, y, z) => { P.push(x, y, z); return P.length / 3 - 1; };
  if (t === 'Cube') {
    const s = num(prim, 'size', time, 2) / 2;
    for (const [x, y, z] of [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]) v(x * s, y * s, z * s);
    quad(0, 3, 2, 1); quad(4, 5, 6, 7); quad(0, 1, 5, 4); quad(1, 2, 6, 5); quad(2, 3, 7, 6); quad(3, 0, 4, 7);
    return out(P, C, I);
  }
  if (t === 'Sphere') {
    const r = num(prim, 'radius', time, 1), rings = SEG / 2;
    const top = v(0, 0, r), bot = v(0, 0, -r);
    const ring = [];
    for (let i = 1; i < rings; i++) {
      const ph = (Math.PI * i) / rings, row = [];
      for (let j = 0; j < SEG; j++) { const th = (2 * Math.PI * j) / SEG; row.push(v(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph))); }
      ring.push(row);
    }
    for (let j = 0; j < SEG; j++) {
      const k = (j + 1) % SEG;
      tri(top, ring[0][j], ring[0][k]);
      for (let i = 0; i < ring.length - 1; i++) quad(ring[i][j], ring[i + 1][j], ring[i + 1][k], ring[i][k]);
      tri(bot, ring[ring.length - 1][k], ring[ring.length - 1][j]);
    }
    return axisTurn(out(P, C, I), 'Z');
  }
  if (t === 'Cylinder' || t === 'Cone' || t === 'Capsule') {
    const h = num(prim, 'height', time, t === 'Capsule' ? 1 : 2), r = num(prim, 'radius', time, t === 'Capsule' ? 0.5 : 1);
    const axis = tokenOf(prim, 'axis', 'Z');
    const z0 = -h / 2, z1 = h / 2;
    const ringAt = (z, rr) => { const row = []; for (let j = 0; j < SEG; j++) { const th = (2 * Math.PI * j) / SEG; row.push(v(rr * Math.cos(th), rr * Math.sin(th), z)); } return row; };
    if (t === 'Cone') {
      const b = ringAt(z0, r), apex = v(0, 0, z1), c0 = v(0, 0, z0);
      for (let j = 0; j < SEG; j++) { const k = (j + 1) % SEG; tri(b[j], b[k], apex); tri(c0, b[k], b[j]); }
    } else if (t === 'Cylinder') {
      const b = ringAt(z0, r), a = ringAt(z1, r), c0 = v(0, 0, z0), c1 = v(0, 0, z1);
      for (let j = 0; j < SEG; j++) { const k = (j + 1) % SEG; quad(b[j], b[k], a[k], a[j]); tri(c0, b[k], b[j]); tri(c1, a[j], a[k]); }
    } else {
      const rings = [];
      const half = SEG / 4;
      for (let i = half; i >= 0; i--) { const ph = (Math.PI / 2) * (i / half); rings.push(ringAt(z0 - r * Math.sin(ph), r * Math.cos(ph))); }
      for (let i = 0; i <= half; i++) { const ph = (Math.PI / 2) * (i / half); rings.push(ringAt(z1 + r * Math.sin(ph), r * Math.cos(ph))); }
      for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < SEG; j++) { const k = (j + 1) % SEG; quad(rings[i][j], rings[i][k], rings[i + 1][k], rings[i + 1][j]); }
    }
    return axisTurn(out(P, C, I), axis);
  }
  if (t === 'Plane') {
    const w = num(prim, 'width', time, 2) / 2, l = num(prim, 'length', time, 2) / 2;
    v(-w, -l, 0); v(w, -l, 0); v(w, l, 0); v(-w, l, 0);
    quad(0, 1, 2, 3);
    return axisTurn(out(P, C, I), tokenOf(prim, 'axis', 'Z'));
  }
  return null;
}
function out(P, C, I) {
  return { points: Float64Array.from(P), counts: Int32Array.from(C), indices: Int32Array.from(I), holes: [], leftHanded: false, subdivision: 'none', creases: null, doubleSided: false, primvars: new Map(), shape: true };
}
/** A shape built along Z, turned so its axis lies along `axis`. */
function axisTurn(mesh, axis) {
  if (axis === 'Z') return mesh;
  const p = mesh.points;
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i], y = p[i + 1], z = p[i + 2];
    if (axis === 'X') { p[i] = z; p[i + 1] = x; p[i + 2] = y; } else { p[i] = y; p[i + 1] = z; p[i + 2] = x; }
  }
  return mesh;
}
