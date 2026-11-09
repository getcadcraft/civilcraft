/* SPDX-License-Identifier: Apache-2.0 */
/**
 * behaviours.js — behaviours on the faces of imported CAD parts (0.9 TW.13). A part from a STEP file stays the person's geometry, untouched; a "behaviour" is data saved beside it that says what one of its
 * faces does in the twin: a CONVEYOR surface (the face moves loads in a direction at a speed), a JOINT (the part turns or slides on an axis between limits) or a SENSOR (a beam from a face, looking out, with a
 * range). The Sim reads the data, never the geometry's history. DOM-free, no imports but ./physics.js, deterministic. Metres, seconds, degrees for a turning joint. Z up. Part-local coordinates are the
 * mesh's own; a part's world matrix (16 numbers, column-major, ModelCraft's) puts it in the scene.
 *
 *   faceTable(soup, { scale })                 soup = { positions (m, part-local), tris (3 vertex indices each), group (a face id per triangle) } → [{ id, kind: 'plane'|'cylinder'|'other', area, c, n, d, axis, o, r, lo, hi, tris }]
 *   describeFace(face)                         the compact copy kept in the file (rounded)
 *   matchFace(desc, faces, { scale })          where a saved face is in the part now: { status: 'same'|'moved'|'changed'|'lost', face, why, note }
 *   cleanBehaviours(raw)                       untrusted file data → { list, dropped: [{ why, id }] }
 *   conveyorOf(b, face, M)                     → { ok, spec (for World.addStatic), dir, len, wid, pitch, yaw, start, end } | { ok: false, code }
 *   runConveyor / runJoint / senseBodies / runScene   the known-answer runs the panel and the tests use
 */
import { World, rot } from './physics.js';

const G = 9.81;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => { const l = len(a); return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0]; };
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const rv = (a) => a.map(r6);
const fin = (...xs) => xs.every((x) => Number.isFinite(x));
const finV = (a) => Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);
const pt = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const dir = (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2], m[1] * v[0] + m[5] * v[1] + m[9] * v[2], m[2] * v[0] + m[6] * v[1] + m[10] * v[2]];
const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
/** The scale a world matrix puts on lengths (uniform). */
const scaleOf = (m) => len([m[0], m[1], m[2]]) || 1;

export const KINDS = ['conveyor', 'joint', 'sensor'];
export const LIMITS = { behaviours: 200, speed: 5, range: 50 };

// ------------------------------------------------------------------------------------------------ the faces of a part
/** Eigen-decomposition of a symmetric 3x3 by Jacobi turns → { values (ascending), vectors (columns as arrays, same order) }. */
function eig3(A) {
  const a = A.map((r) => r.slice()), V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 30; sweep++) {
    let off = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) off += a[i][j] * a[i][j];
    if (off < 1e-30) break;
    for (let p = 0; p < 2; p++) for (let q = p + 1; q < 3; q++) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
  }
  const idx = [0, 1, 2].sort((x, y) => a[x][x] - a[y][y]);
  return { values: idx.map((i) => a[i][i]), vectors: idx.map((i) => [V[0][i], V[1][i], V[2][i]]) };
}

/**
 * The faces of a part from its triangles. `group` is the face each triangle came from (a STEP face, or the smooth region of an imported mesh). Planes are recognised by their normals agreeing, cylinders by
 * their normals lying in one plane and the points on one circle; everything else is 'other' (its centre, area and size are kept, and it can be told apart, but no behaviour uses its direction).
 */
export function faceTable(soup, { scale = null } = {}) {
  const P = soup.positions, T = soup.tris, grp = soup.group, nT = T.length / 3, by = new Map();
  for (let i = 0; i < nT; i++) { const g = grp ? grp[i] : 0; let a = by.get(g); if (!a) by.set(g, a = []); a.push(i); }
  const out = [];
  for (const [id, tris] of [...by].sort((a, b) => a[0] - b[0])) {
    let area = 0, cx = 0, cy = 0, cz = 0, nx = 0, ny = 0, nz = 0;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity], vs = new Set(), tn = [];
    for (const i of tris) {
      const a = T[i * 3] * 3, b = T[i * 3 + 1] * 3, c = T[i * 3 + 2] * 3;
      const u = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], v = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]], w = cross(u, v), ar = len(w) / 2;
      if (!(ar > 0)) continue;
      area += ar; cx += ((P[a] + P[b] + P[c]) / 3) * ar; cy += ((P[a + 1] + P[b + 1] + P[c + 1]) / 3) * ar; cz += ((P[a + 2] + P[b + 2] + P[c + 2]) / 3) * ar;
      nx += w[0] / 2; ny += w[1] / 2; nz += w[2] / 2; tn.push([w[0] / (2 * ar), w[1] / (2 * ar), w[2] / (2 * ar), ar]);
      for (const k of [a, b, c]) { vs.add(k); for (let d = 0; d < 3; d++) { if (P[k + d] < lo[d]) lo[d] = P[k + d]; if (P[k + d] > hi[d]) hi[d] = P[k + d]; } }
    }
    if (!(area > 0)) continue;
    const c = [cx / area, cy / area, cz / area];
    let n = unit([nx, ny, nz]), kind = 'other', axis = null, o = null, r = null;
    if (len([nx, ny, nz]) / area > 0.9995 && tn.every((q) => q[0] * n[0] + q[1] * n[1] + q[2] * n[2] > 0.9995)) kind = 'plane';
    else {
      // normals of a cylinder lie in one plane: the covariance of the normals has one (near) zero value, and the other two are alike
      const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; let tot = 0;
      for (const q of tn) { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] += q[i] * q[j] * q[3]; tot += q[3]; }
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] /= tot;
      const E = eig3(M);
      if (E.values[0] < 1e-4 && E.values[1] > 0.05) {
        const a = E.vectors[0], e1 = unit(cross(a, Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0])), e2 = cross(a, e1);
        // Kåsa circle fit of the face's points projected on the plane across the axis: x² + y² = 2ax + 2by + k
        let sxx = 0, sxy = 0, syy = 0, sx = 0, sy = 0, n2 = 0, bx = 0, by2 = 0, bz = 0, ax = 0;
        const pts = [...vs].map((k) => [P[k], P[k + 1], P[k + 2]]);
        for (const p of pts) { const x = dot(p, e1), y = dot(p, e2), z = x * x + y * y; sxx += x * x; sxy += x * y; syy += y * y; sx += x; sy += y; bx += x * z; by2 += y * z; bz += z; ax += dot(p, a); n2++; }
        const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n2]], B = [bx, by2, bz];
        const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
        const D = det(A);
        if (Math.abs(D) > 1e-30) {
          const rep = (col) => A.map((row, i) => row.map((v, j) => (j === col ? B[i] : v)));
          const ca = det(rep(0)) / D / 2, cb = det(rep(1)) / D / 2, kk = det(rep(2)) / D, rad = Math.sqrt(Math.max(0, kk + ca * ca + cb * cb));
          // every point must sit on the circle (a fillet that is only nearly round is not a hinge)
          let worst = 0; for (const p of pts) worst = Math.max(worst, Math.abs(Math.hypot(dot(p, e1) - ca, dot(p, e2) - cb) - rad));
          if (rad > 0 && worst <= Math.max(1e-6, rad * 0.002)) {
            kind = 'cylinder'; r = rad; axis = a[0] < -1e-9 || (Math.abs(a[0]) <= 1e-9 && (a[1] < -1e-9 || (Math.abs(a[1]) <= 1e-9 && a[2] < 0))) ? mul(a, -1) : a.slice();
            o = add(add(mul(e1, ca), mul(e2, cb)), mul(a, ax / n2));
            n = null;
          }
        }
      }
    }
    out.push({ id, kind, area, c, n: kind === 'plane' ? n : null, d: kind === 'plane' ? dot(n, c) : null, axis, o, r, lo, hi, tris, points: [...vs].map((k) => [P[k], P[k + 1], P[k + 2]]) });
  }
  void scale;
  return out;
}

/** The copy kept in the .modelcraft file: no triangles, rounded to a micrometre. */
export function describeFace(f) {
  const d = { id: f.id, kind: f.kind, area: r6(f.area), c: rv(f.c), lo: rv(f.lo), hi: rv(f.hi) };
  if (f.kind === 'plane') { d.n = rv(f.n); d.d = r6(f.d); }
  if (f.kind === 'cylinder') { d.axis = rv(f.axis); d.o = rv(f.o); d.r = r6(f.r); }
  return d;
}

const diag = (faces) => {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const f of faces) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], f.lo[i]); hi[i] = Math.max(hi[i], f.hi[i]); }
  return faces.length ? len(sub(hi, lo)) : 1;
};
const size = (f) => len(sub(f.hi, f.lo));

/** How alike a saved face and a face of the part now are: null (not the same face) or { level: 0 same | 1 changed, area ratio, shift }. */
function alike(desc, f, tol) {
  if (desc.kind !== f.kind || desc.kind === 'other') return desc.kind === 'other' && f.kind === 'other' ? looseAlike(desc, f, tol) : null;
  const shift = len(sub(desc.c, f.c)), own = Math.max(size(desc), 1e-6), ratio = f.area / desc.area;
  if (desc.kind === 'plane') {
    if (dot(desc.n, f.n) < 0.9995 || Math.abs(desc.d - f.d) > tol) return null;
  } else {
    if (Math.abs(dot(desc.axis, f.axis)) < 0.9995 || Math.abs(desc.r - f.r) > Math.max(tol, desc.r * 0.02)) return null;
    const w = sub(f.o, desc.o), perp = len(sub(w, mul(desc.axis, dot(w, desc.axis))));
    if (perp > tol) return null;
  }
  if (shift > Math.max(tol, own * 0.5) || ratio < 0.5 || ratio > 2) return null;
  return { level: shift <= tol && Math.abs(ratio - 1) <= 0.01 ? 0 : 1, ratio, shift };
}
function looseAlike(desc, f, tol) {
  const shift = len(sub(desc.c, f.c)), ratio = f.area / desc.area;
  if (shift > tol || ratio < 0.9 || ratio > 1.1) return null;
  return { level: shift <= tol * 0.1 && Math.abs(ratio - 1) <= 0.01 ? 0 : 1, ratio, shift };
}

/**
 * Where a saved face is in the part now. The face with the same id is taken when it is the same face (same plane or axis, place and size within a hair): 'same'. Ids change when a file is edited,
 * so otherwise the part's faces are searched for ONE that is the same plane or axis in the same place: 'moved' (the id changed, nothing else) or 'changed' (still there, but its size or outline differs:
 * said). No such face, or several that fit equally: 'lost', with the reason, and the behaviour stays in the file, switched off, until the person picks the face again. Nothing is guessed.
 */
export function matchFace(desc, faces, { scale = null } = {}) {
  const dg = scale || diag(faces), tol = Math.max(1e-5, dg * 0.002);
  const same = faces.find((f) => f.id === desc.id);
  if (same) { const a = alike(desc, same, tol); if (a && a.level === 0) return { status: 'same', face: same, ratio: a.ratio, shift: a.shift }; }
  const hits = [];
  for (const f of faces) { const a = alike(desc, f, tol); if (a) hits.push({ f, a }); }
  if (hits.length === 1) return { status: hits[0].a.level === 0 ? 'moved' : 'changed', face: hits[0].f, ratio: hits[0].a.ratio, shift: hits[0].a.shift };
  if (!hits.length) return { status: 'lost', face: null, why: 'no-face' };
  hits.sort((a, b) => a.a.shift - b.a.shift);
  if (hits[0].a.shift < hits[1].a.shift * 0.5 && hits[0].a.level === 0) return { status: 'moved', face: hits[0].f, ratio: hits[0].a.ratio, shift: hits[0].a.shift };
  return { status: 'lost', face: null, why: 'ambiguous', count: hits.length };
}

// ------------------------------------------------------------------------------------------------ the data
/** In-plane axes of a planar face: the long way and the short way across it. */
export function faceAxes(desc) {
  const n = desc.n, e1 = unit(cross(n, Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0])), e2 = cross(n, e1);
  const ext = sub(desc.hi, desc.lo);
  // the extents of the face's box, measured on the two in-plane axes, tell which way is long: use the box's corners
  const cs = []; for (const x of [desc.lo[0], desc.hi[0]]) for (const y of [desc.lo[1], desc.hi[1]]) for (const z of [desc.lo[2], desc.hi[2]]) cs.push([x, y, z]);
  const span = (e) => { const v = cs.map((p) => dot(p, e)); return Math.max(...v) - Math.min(...v); };
  void ext;
  // turn the pair to the box's principal in-plane direction: try the world axes projected on the plane first (a belt face lies along X or Y more often than along a diagonal)
  let u = null;
  for (const a of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { const p = sub(a, mul(n, dot(a, n))); if (len(p) > 0.5 && (!u || span(unit(p)) > span(u) + 1e-9)) u = unit(p); }
  if (!u) u = e1;
  const v = unit(cross(n, u));
  void e2;
  return span(u) >= span(v) ? { long: u, cross: v } : { long: v, cross: u };
}

const num = (x, d) => (Number.isFinite(x) ? x : d);
/** Untrusted file data → { list, dropped }. A behaviour with a missing or impossible field is dropped with the reason, never repaired by a guess. */
export function cleanBehaviours(raw) {
  const list = [], dropped = [], seen = new Set();
  if (!Array.isArray(raw)) return { list, dropped };
  for (const b of raw.slice(0, LIMITS.behaviours)) {
    const bad = (why) => dropped.push({ why, id: b && typeof b.id === 'string' ? b.id : '' });
    if (!b || typeof b !== 'object') { bad('shape'); continue; }
    const id = typeof b.id === 'string' && /^[A-Za-z0-9._-]{1,40}$/.test(b.id) ? b.id : null;
    if (!id) { bad('id'); continue; }
    if (seen.has(id)) { bad('duplicate'); continue; }
    if (!KINDS.includes(b.kind)) { bad('kind'); continue; }
    if (typeof b.part !== 'string' || !b.part || b.part.length > 80) { bad('part'); continue; }
    const f = b.face;
    if (!f || typeof f !== 'object' || !['plane', 'cylinder', 'other'].includes(f.kind) || !finV(f.c) || !finV(f.lo) || !finV(f.hi) || !(f.area > 0)) { bad('face'); continue; }
    if (f.kind === 'plane' && (!finV(f.n) || !fin(f.d))) { bad('face'); continue; }
    if (f.kind === 'cylinder' && (!finV(f.axis) || !finV(f.o) || !(f.r > 0))) { bad('face'); continue; }
    const out = { id, kind: b.kind, part: b.part, name: typeof b.name === 'string' ? b.name.slice(0, 80) : '', partName: typeof b.partName === 'string' ? b.partName.slice(0, 120) : '', face: describeFace({ ...f, id: num(f.id, 0) }), on: b.on !== false };
    if (b.kind === 'conveyor') {
      if (f.kind !== 'plane') { bad('needs-plane'); continue; }
      if (!finV(b.dir) || len(b.dir) < 1e-9) { bad('dir'); continue; }
      const d = unit(b.dir), inPlane = Math.abs(dot(d, unit(f.n)));
      if (inPlane > 0.2) { bad('dir-off-plane'); continue; }
      if (!(b.speed > 0 && b.speed <= LIMITS.speed)) { bad('speed'); continue; }
      out.dir = rv(unit(sub(d, mul(unit(f.n), dot(d, unit(f.n)))))); out.speed = b.speed; out.dirName = typeof b.dirName === 'string' ? b.dirName.slice(0, 20) : '';
    } else if (b.kind === 'joint') {
      if (b.type !== 'turn' && b.type !== 'slide') { bad('type'); continue; }
      if (b.type === 'turn' && f.kind !== 'cylinder' && f.kind !== 'plane') { bad('needs-axis'); continue; }
      if (b.type === 'slide' && f.kind !== 'plane' && f.kind !== 'cylinder') { bad('needs-axis'); continue; }
      if (!fin(b.min, b.max, b.home, b.rate) || !(b.min < b.max) || b.home < b.min || b.home > b.max || !(b.rate > 0)) { bad('limits'); continue; }
      out.type = b.type; out.min = b.min; out.max = b.max; out.home = b.home; out.rate = b.rate;
    } else {
      if (f.kind !== 'plane') { bad('needs-plane'); continue; }
      if (!(b.range > 0 && b.range <= LIMITS.range)) { bad('range'); continue; }
      out.range = b.range; out.offset = num(b.offset, 0.002);
    }
    seen.add(id); list.push(out);
  }
  return { list, dropped };
}

// ------------------------------------------------------------------------------------------------ the conveyor surface
/**
 * A conveyor behaviour on a face of a part, put in the world by the part's matrix M: the spec World.addStatic takes (a thin box under the face, its top the face's bounding rectangle, a surface velocity
 * along the chosen direction), or why not. The face's outline is taken as its bounding rectangle along the direction; the help says so. A face that points down, or leans across the direction (a roll), is refused.
 */
export function conveyorOf(b, face, M = ident()) {
  if (!face || face.kind !== 'plane') return { ok: false, code: 'needs-plane' };
  const s = scaleOf(M), nW = unit(dir(M, face.n));
  if (nW[2] < 0.2) return { ok: false, code: 'face-down' };
  let dW = dir(M, b.dir); dW = unit(sub(dW, mul(nW, dot(dW, nW))));
  if (!(len(dW) > 0)) return { ok: false, code: 'dir' };
  const yaw = (Math.atan2(dW[1], dW[0]) * 180) / Math.PI, pitch = Math.atan2(dW[2], Math.hypot(dW[0], dW[1]));
  const side = unit(cross(nW, dW));   // across the belt
  // the face's points in the plane axes (u along, v across), from the triangle corners
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (const p of face.points || []) { const w = pt(M, p), u = dot(w, dW), v = dot(w, side); if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
  if (!(u1 > u0) || !(v1 > v0)) return { ok: false, code: 'no-points' };
  // the roll check: the face normal must be the turned Z of the yaw/pitch frame (no tilt across the belt)
  const expect = [-Math.sin(pitch) * Math.cos((yaw * Math.PI) / 180), -Math.sin(pitch) * Math.sin((yaw * Math.PI) / 180), Math.cos(pitch)];
  if (dot(expect, nW) < Math.cos((3 * Math.PI) / 180)) return { ok: false, code: 'leans' };
  const thick = 0.05, wc = pt(M, face.c), cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, du = cu - dot(wc, dW), dv = cv - dot(wc, side);
  const topC = add(add(wc, mul(dW, du)), mul(side, dv)), center = sub(topC, mul(nW, thick / 2));
  const along = u1 - u0, across = v1 - v0;
  return { ok: true, dir: dW, normal: nW, len: along, wid: across, pitch, yaw, thick, scale: s,
    start: sub(topC, mul(dW, along / 2)), end: add(topC, mul(dW, along / 2)),
    spec: { id: b.id, c: center, half: [along / 2, across / 2, thick / 2], yaw, pitch, surface: mul(dW, b.speed), mu: 1 } };
}

/**
 * Put a load on a conveyor behaviour and time it to the far end of the face. load = { l, w, h, mass, mu } (mu = the pair's friction, as in the ride check). → { outcome: 'arrived'|'stuck'|'fell'|'tipped',
 * t (the load's centre reaches the end), theory (closed form, or null), distance }. `v0` starts the load at the belt's speed (then it only travels).
 */
export function runConveyor(b, face, M, load, { v0 = false, maxS = 60, h = 1 / 240, from = 0.005 } = {}) {
  const C = conveyorOf(b, face, M);
  if (!C.ok) return { ok: false, code: C.code };
  const w = new World({ h }); w.addStatic(C.spec);
  const bodyMu = load.mu * load.mu, lift = load.h / 2 + 0.002;
  const x0 = add(add(C.start, mul(C.dir, from + load.l / 2)), mul(C.normal, lift));
  const B = w.addBody({ id: 'load', x: x0, half: [load.l / 2, load.w / 2, load.h / 2], mass: load.mass || 10, mu: bodyMu, yaw: C.yaw, v: v0 ? mul(C.dir, b.speed) : [0, 0, 0] });
  // pitch the load with the belt (World.addBody sets only the yaw)
  const th = C.pitch;
  B.q = pitchQ(C.yaw, th);
  const target = dot(C.end, C.dir), start = dot(x0, C.dir), D = target - start;
  let t = null, outcome = 'stuck', best = start, bestAt = 0;
  while (w.t < maxS) {
    w.step();
    const u = dot(B.x, C.dir);
    if (u > best + 0.01) { best = u; bestAt = w.t; }
    if (u >= target) { t = w.t; outcome = 'arrived'; break; }
    const up = rot(B.q, [0, 0, 1]);
    if (dot(up, C.normal) < Math.cos((50 * Math.PI) / 180)) { outcome = 'tipped'; break; }
    if (B.x[2] < Math.min(C.start[2], C.end[2]) - 0.5) { outcome = 'fell'; break; }
    if (w.t - bestAt > 10) break;
  }
  // closed form: friction accelerates the load at g(μ cosθ − sinθ) until it matches the belt, then it rides
  const a = G * (load.mu * Math.cos(C.pitch) - Math.sin(C.pitch)), v = b.speed;
  let theory = null;
  if (v0) theory = D / v;
  else if (a > 0) { const dAcc = (v * v) / (2 * a); theory = D <= dAcc ? Math.sqrt((2 * D) / a) : v / a + (D - dAcc) / v; }
  return { ok: true, outcome, t, theory, distance: D, speed: v, length: C.len, final: B.x.slice() };
}
function pitchQ(yawDeg, pitch) {
  const half = (ang, ax) => { const s = Math.sin(ang / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(ang / 2)]; };
  const m = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  return m(half((yawDeg * Math.PI) / 180, [0, 0, 1]), half(-pitch, [0, 1, 0]));
}

// ------------------------------------------------------------------------------------------------ the joint
/** The joint's axis in part-local coordinates: { o, d } (a cylinder's axis; a plane's normal through its centre). */
export function jointAxis(b, face) {
  if (!face) return null;
  if (face.kind === 'cylinder') return { o: face.o.slice(), d: face.axis.slice() };
  if (face.kind === 'plane') return { o: face.c.slice(), d: face.n.slice() };
  return null;
}
/** The 4x4 (column-major) a joint at `value` (degrees for 'turn', metres for 'slide') adds to the part, about its axis. */
export function jointMatrix(b, face, value) {
  const A = jointAxis(b, face); if (!A) return ident();
  const d = unit(A.d);
  if (b.type === 'slide') { const t = mul(d, value); return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1]; }
  const th = (value * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th), k = 1 - c, [x, y, z] = d;
  const R = [c + x * x * k, y * x * k + z * s, z * x * k - y * s, 0, x * y * k - z * s, c + y * y * k, z * y * k + x * s, 0, x * z * k + y * s, y * z * k - x * s, c + z * z * k, 0, 0, 0, 0, 1];
  const o = A.o, ro = [R[0] * o[0] + R[4] * o[1] + R[8] * o[2], R[1] * o[0] + R[5] * o[1] + R[9] * o[2], R[2] * o[0] + R[6] * o[1] + R[10] * o[2]];
  R[12] = o[0] - ro[0]; R[13] = o[1] - ro[1]; R[14] = o[2] - ro[2];
  return R;
}
/** Move a joint toward `target` at its rate, held inside its limits. → { value, t, limited: 'min'|'max'|null, reached, track: [{ t, value }] }. */
export function runJoint(b, target, { dt = 1 / 60, from = null } = {}) {
  let v = from === null ? b.home : from;
  const goal = Math.max(b.min, Math.min(b.max, target)), limited = target > b.max ? 'max' : target < b.min ? 'min' : null;
  const track = [{ t: 0, value: v }]; let t = 0, n = 0;
  while (Math.abs(goal - v) > 1e-12 && n++ < 1e6) {
    const step = Math.min(Math.abs(goal - v), b.rate * dt); v += Math.sign(goal - v) * step; t += step / b.rate; track.push({ t, value: v });
  }
  return { value: v, t, limited, reached: limited === null, track };
}

// ------------------------------------------------------------------------------------------------ the sensor
/** The beam in the world: from the face's centre, a little off it, out along the face's normal. */
export function sensorRay(b, face, M = ident()) {
  if (!face || face.kind !== 'plane') return null;
  const n = unit(dir(M, face.n)), o = add(pt(M, face.c), mul(n, b.offset === undefined ? 0.002 : b.offset));
  return { o, d: n, range: b.range };
}
/** The nearest body (an oriented box: x, q, half) the ray meets within its range: { id, dist } | null. */
export function senseBodies(ray, bodies) {
  if (!ray) return null;
  let best = null;
  const inv = (q) => [-q[0], -q[1], -q[2], q[3]];
  for (const B of bodies) {
    const lo = rot(inv(B.q), sub(ray.o, B.x)), ld = rot(inv(B.q), ray.d);
    let t0 = 0, t1 = ray.range, hit = true;
    for (let i = 0; i < 3 && hit; i++) {
      if (Math.abs(ld[i]) < 1e-12) { if (Math.abs(lo[i]) > B.half[i]) hit = false; continue; }
      let a = (-B.half[i] - lo[i]) / ld[i], c = (B.half[i] - lo[i]) / ld[i]; if (a > c) [a, c] = [c, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) hit = false;
    }
    if (hit && (!best || t0 < best.dist)) best = { id: B.id, dist: t0 };
  }
  return best;
}

// ------------------------------------------------------------------------------------------------ everything together
/**
 * Run the behaviours of a set of parts as one scene: every attached, switched-on conveyor becomes a surface in the physics world, one load starts on `onto` (the first conveyor when null), sensors are
 * read every step. `parts` = [{ key, M, faces, behaviours }] already attached (faces from faceTable). → { conveyors: [{ id, ok, code, arrivedAt }], sensors: [{ id, events: [{ t, on, dist }] }], joints: [{ id, ... }], t }.
 */
export function runScene({ conveyors = [], sensors = [], load, onto = null, v0 = false, maxS = 40, h = 1 / 240 }) {
  const w = new World({ h }), res = { conveyors: [], sensors: [], t: 0 };
  const infos = new Map();
  for (const c of conveyors) { const C = conveyorOf(c.b, c.face, c.M); if (!C.ok) { res.conveyors.push({ id: c.b.id, ok: false, code: C.code }); continue; } w.addStatic(C.spec); infos.set(c.b.id, { C, b: c.b }); res.conveyors.push({ id: c.b.id, ok: true, arrivedAt: null }); }
  const first = onto && infos.has(onto) ? infos.get(onto) : [...infos.values()][0];
  if (!first) return { ...res, error: 'no-conveyor' };
  const { C } = first;
  const x0 = add(add(C.start, mul(C.dir, 0.005 + load.l / 2)), mul(C.normal, load.h / 2 + 0.002));
  const B = w.addBody({ id: 'load', x: x0, half: [load.l / 2, load.w / 2, load.h / 2], mass: load.mass || 10, mu: load.mu * load.mu, yaw: C.yaw, v: v0 ? mul(C.dir, first.b.speed) : [0, 0, 0] });
  B.q = pitchQ(C.yaw, C.pitch);
  const rays = sensors.map((s) => ({ id: s.b.id, ray: sensorRay(s.b, s.face, s.M), on: false, events: [] }));
  const target = dot(C.end, C.dir);
  while (w.t < maxS) {
    w.step();
    for (const r of rays) { const hit = senseBodies(r.ray, w.bodies), on = !!hit; if (on !== r.on) { r.on = on; r.events.push({ t: w.t, on, dist: hit ? hit.dist : null }); } }
    for (const c of res.conveyors) if (c.ok && c.id === first.b.id && c.arrivedAt === null && dot(B.x, C.dir) >= target) c.arrivedAt = w.t;
    if (dot(B.x, C.dir) >= target + load.l + 0.2) break;
  }
  res.sensors = rays.map((r) => ({ id: r.id, events: r.events })); res.t = w.t; res.final = B.x.slice();
  return res;
}
