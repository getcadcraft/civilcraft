/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-partlink: the link between a BIM element and a part (0.10 BK.179 / SU.1814, session bim-part-link-10). Host-free: no DOM, no three.js,
 * no app imports. BimCraft (and, later, SuperCad's window) sends an element; PartCraft (or ModelCraft) opens it as a part with the building
 * around it, read-only; saving there sends back an UPDATE that BimCraft shows as "changed" until the person accepts or rejects it.
 * docs/0.10-sessions/bim-part-link-10-spike.md says what the two kinds of model differ in and what the link carries.
 *
 * Frames. A package's geometry is in the ELEMENT'S OWN FRAME: millimetres, Z up, origin at the element's placement (its IfcLocalPlacement,
 * flattened to the world), so a part drawn there goes back to the same place whatever the building does around it. `source.placement` is that
 * frame in the file's world (a column-major 4 x 4 in mm, Z up) for a reader that wants the element where it stands.
 *
 *   makePackage({ link, source, mesh, context, now }) → package (JSON-safe; meshes as base64)      readPackage(raw) → package or throws PartLinkError
 *   makeUpdate({ link, rev, mesh, from, baseHash, now }) → update                                    readUpdate(raw) → update or throws
 *   toLocalMatrix(placementMm, sceneToFileMm?) → the 4 x 4 that takes world points to the element's frame
 *   localMesh(tris, M) → { positions: Float64Array, indices: Uint32Array }        welded; tris = world triangle corners (x y z …)
 *   contextMeshes(elements, targetBox, opts) → { meshes, omitted }                 the neighbours that fit a triangle budget, nearest first
 *   meshStats(mesh) → { triangles, vertices, box, volume, area, closed }           meshHash(mesh) → 16 hex (same shape, any vertex order)
 *   compareMeshes(a, b) → { same, volume, box, triangles }
 *   class LinkBook                                                                  the state of each link: sent → changed → accepted | rejected
 *   memoryStore() · idbStore(indexedDB, name) · openChannel(BroadcastChannel, name) where the package and the updates wait between the two pages
 *   psetRows(rec) → rows for the element's CadCraft_PartLink property set
 *   cleanPrism(p) · cleanSolid(s) · mapPrism(p, f)      (0.11 SU.1814, su-finish-11) a body as IFC's own solids: a prism (a profile extruded), or a
 *                                                     `csg` list (a base prism, then prisms added or cut in order). Untrusted; null when not usable.
 *   A package may carry `geometry.prism` (the element IS a straight prism); an update may carry `solid` (the part's history as prisms), so
 *   BimCraft can write extrusions and Boolean results instead of a mesh. The mesh always travels too: it is what is compared and the fallback.
 */

export const FORMAT = 'cadcraft-part-link';
export const UPDATE_FORMAT = 'cadcraft-part-link-update';
export const VERSION = 1;
export const STATES = ['sent', 'changed', 'accepted', 'rejected'];
export const LIMITS = { triangles: 600000, contextTriangles: 400000, contextMeshes: 400, text: 200, bytes: 64 * 1024 * 1024 };
export const PSET = 'CadCraft_PartLink';
export const QUERY = 'partlink';

export class PartLinkError extends Error {
  constructor(code, vars = {}) { super(code); this.code = code; this.vars = vars; }
}
const fail = (code, vars) => { throw new PartLinkError(code, vars); };

// ---------------------------------------------------------------- 4 x 4 (column-major)
export const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export function mmul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
export function minv(m) {
  const a = m, o = new Array(16);
  o[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
  o[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
  o[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
  o[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
  o[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
  o[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
  o[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
  o[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
  o[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
  o[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
  o[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
  o[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
  o[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
  o[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
  o[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
  o[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
  const det = a[0] * o[0] + a[1] * o[4] + a[2] * o[8] + a[3] * o[12];
  if (!det) return null;
  for (let i = 0; i < 16; i++) o[i] /= det;
  return o;
}
const isM = (m) => Array.isArray(m) && m.length === 16 && m.every(Number.isFinite);

/** The matrix that takes points to the element's frame: inverse(placement), after `pre` (viewer or other frame → the file's world, mm) when given. */
export function toLocalMatrix(placementMm, pre = null) {
  if (!isM(placementMm)) fail('partlink.err.placement');
  const inv = minv(placementMm);
  if (!inv) fail('partlink.err.placement');
  return pre ? mmul(inv, pre) : inv;
}
/** The matrix that takes the element's frame back to the same `pre` frame (the inverse of toLocalMatrix). */
export function fromLocalMatrix(placementMm, pre = null) {
  const m = toLocalMatrix(placementMm, pre);
  return minv(m);
}

// ---------------------------------------------------------------- meshes
/** Weld triangle corners (x y z … three corners per triangle, any frame) into an indexed mesh after mapping them through M (4 x 4 or null).
 *  Corners that fall within `tol` of each other share a vertex; a triangle that collapses is dropped. */
export function localMesh(tris, M = null, { tol = 0.001 } = {}) {
  const n = Math.floor(tris.length / 9);
  if (n * 9 !== tris.length) fail('partlink.err.mesh');
  if (n > LIMITS.triangles) fail('partlink.err.toobig', { n, max: LIMITS.triangles });
  const key = new Map(), pos = [], idx = [];
  const inv = 1 / tol;
  const at = (x, y, z) => {
    const k = Math.round(x * inv) + ',' + Math.round(y * inv) + ',' + Math.round(z * inv);
    let i = key.get(k);
    if (i === undefined) { i = pos.length / 3; key.set(k, i); pos.push(x, y, z); }
    return i;
  };
  for (let t = 0; t < n; t++) {
    const c = [];
    for (let k = 0; k < 3; k++) {
      let x = tris[t * 9 + k * 3], y = tris[t * 9 + k * 3 + 1], z = tris[t * 9 + k * 3 + 2];
      if (M) { const X = M[0] * x + M[4] * y + M[8] * z + M[12], Y = M[1] * x + M[5] * y + M[9] * z + M[13], Z = M[2] * x + M[6] * y + M[10] * z + M[14]; x = X; y = Y; z = Z; }
      if (!Number.isFinite(x + y + z)) fail('partlink.err.mesh');
      c.push(at(x, y, z));
    }
    if (c[0] !== c[1] && c[1] !== c[2] && c[0] !== c[2]) idx.push(c[0], c[1], c[2]);
  }
  return { positions: Float64Array.from(pos), indices: Uint32Array.from(idx) };
}

/** A mesh through a 4 x 4 (new arrays). */
export function mapMesh(mesh, M) {
  const p = new Float64Array(mesh.positions.length);
  for (let i = 0; i < p.length; i += 3) {
    const x = mesh.positions[i], y = mesh.positions[i + 1], z = mesh.positions[i + 2];
    p[i] = M[0] * x + M[4] * y + M[8] * z + M[12]; p[i + 1] = M[1] * x + M[5] * y + M[9] * z + M[13]; p[i + 2] = M[2] * x + M[6] * y + M[10] * z + M[14];
  }
  return { positions: p, indices: Uint32Array.from(mesh.indices) };
}

/** Counts, box (minx miny minz maxx maxy maxz), enclosed volume (signed, divergence theorem: positive for outward faces), area, and whether every edge is shared by exactly two triangles. */
export function meshStats(mesh) {
  const P = mesh.positions, I = mesh.indices, n = I.length / 3;
  const box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < box[k]) box[k] = P[i + k]; if (P[i + k] > box[k + 3]) box[k + 3] = P[i + k]; }
  let vol = 0, area = 0;
  const edges = new Map();
  for (let t = 0; t < n; t++) {
    const a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3;
    const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b], by = P[b + 1], bz = P[b + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
    area += 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
    for (const [p, q] of [[I[t * 3], I[t * 3 + 1]], [I[t * 3 + 1], I[t * 3 + 2]], [I[t * 3 + 2], I[t * 3]]]) {
      const k = p < q ? p + '_' + q : q + '_' + p;
      edges.set(k, (edges.get(k) || 0) + 1);
    }
  }
  let closed = n > 0;
  for (const c of edges.values()) if (c !== 2) { closed = false; break; }
  return { triangles: n, vertices: P.length / 3, box: n ? box : [0, 0, 0, 0, 0, 0], volume: vol, area, closed };
}

const FNV = (h, x) => { h ^= x; return Math.imul(h, 16777619) >>> 0; };
/** A hash of the SHAPE: the same triangles in any order, from any vertex, hash alike (corners quantised to 0.01 mm). 16 hex digits. */
export function meshHash(mesh, { q = 0.01 } = {}) {
  const P = mesh.positions, I = mesh.indices, inv = 1 / q;
  const vh = new Uint32Array(P.length / 3);
  for (let i = 0; i < vh.length; i++) {
    let h = 2166136261;
    for (let k = 0; k < 3; k++) { const v = Math.round(P[i * 3 + k] * inv) | 0; h = FNV(h, v & 0xffff); h = FNV(h, (v >>> 16) & 0xffff); }
    vh[i] = h;
  }
  let s1 = 0, s2 = 0, x1 = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = [vh[I[t]], vh[I[t + 1]], vh[I[t + 2]]].sort((p, r) => p - r);
    let h = 2166136261;
    for (const v of a) { h = FNV(h, v & 0xffff); h = FNV(h, v >>> 16); }
    s1 = (s1 + h) >>> 0; s2 = (s2 + Math.imul(h, 2654435761)) >>> 0; x1 ^= h;
  }
  const hex = (v) => (v >>> 0).toString(16).padStart(8, '0');
  return hex(s1) + hex((s2 ^ x1) >>> 0);
}

/** What changed between two meshes of the same element (frames equal). `same` = the same shape (hash and box). */
export function compareMeshes(a, b, { tol = 0.01 } = {}) {
  const A = meshStats(a), B = meshStats(b);
  const dBox = A.box.map((v, i) => B.box[i] - v);
  const same = meshHash(a) === meshHash(b) && dBox.every((d) => Math.abs(d) <= tol);
  const dims = (s) => [s.box[3] - s.box[0], s.box[4] - s.box[1], s.box[5] - s.box[2]];
  return {
    same,
    triangles: { before: A.triangles, after: B.triangles },
    volume: { before: A.volume, after: B.volume, change: B.volume - A.volume, pct: A.volume ? (B.volume - A.volume) / Math.abs(A.volume) * 100 : null },
    size: { before: dims(A), after: dims(B) },
    box: { before: A.box, after: B.box, moved: dBox },
    closed: { before: A.closed, after: B.closed },
  };
}

// ---------------------------------------------------------------- base64 meshes
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
    s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < bytes.length ? B64[n >> 6 & 63] : '=') + (i + 2 < bytes.length ? B64[n & 63] : '=');
  }
  return s;
}
const REV = new Map([...B64].map((c, i) => [c, i]));
function unb64(s) {
  if (typeof s !== 'string' || s.length % 4 || /[^A-Za-z0-9+/=]/.test(s)) fail('partlink.err.mesh');
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0, out = new Uint8Array(s.length / 4 * 3 - pad);
  let o = 0;
  for (let i = 0; i < s.length; i += 4) {
    const n = (REV.get(s[i]) << 18) | (REV.get(s[i + 1]) << 12) | ((REV.get(s[i + 2]) || 0) << 6) | (REV.get(s[i + 3]) || 0);
    if (o < out.length) out[o++] = n >> 16 & 255; if (o < out.length) out[o++] = n >> 8 & 255; if (o < out.length) out[o++] = n & 255;
  }
  return out;
}
/** { nv, nt, v: base64 of float64 (or float32 with { f32 }), i: base64 of uint32 } */
export function encodeMesh(mesh, { f32 = false } = {}) {
  const V = f32 ? Float32Array.from(mesh.positions) : Float64Array.from(mesh.positions), I = Uint32Array.from(mesh.indices);
  return { nv: mesh.positions.length / 3, nt: mesh.indices.length / 3, f: f32 ? 32 : 64, v: b64(new Uint8Array(V.buffer)), i: b64(new Uint8Array(I.buffer)) };
}
export function decodeMesh(m, { maxTriangles = LIMITS.triangles } = {}) {
  if (!m || typeof m !== 'object' || !Number.isInteger(m.nv) || !Number.isInteger(m.nt) || m.nv < 0 || m.nt < 0 || (m.f !== 32 && m.f !== 64)) fail('partlink.err.mesh');
  if (m.nt > maxTriangles) fail('partlink.err.toobig', { n: m.nt, max: maxTriangles });
  const vb = unb64(m.v), ib = unb64(m.i), w = m.f === 32 ? 4 : 8;
  if (vb.length !== m.nv * 3 * w || ib.length !== m.nt * 12) fail('partlink.err.mesh');
  const V = m.f === 32 ? new Float32Array(vb.buffer, vb.byteOffset, m.nv * 3) : new Float64Array(vb.buffer, vb.byteOffset, m.nv * 3);
  const I = new Uint32Array(ib.buffer, ib.byteOffset, m.nt * 3);
  for (const v of V) if (!Number.isFinite(v)) fail('partlink.err.mesh');
  for (const i of I) if (i >= m.nv) fail('partlink.err.mesh');
  return { positions: Float64Array.from(V), indices: Uint32Array.from(I) };
}

// ---------------------------------------------------------------- neighbours (the BIM context)
const boxGap = (a, b) => {
  const d = [0, 1, 2].map((k) => Math.max(a[k] - b[k + 3], b[k] - a[k + 3], 0));
  return Math.hypot(d[0], d[1], d[2]);
};
/**
 * The elements around the target, as read-only meshes in the target's frame. `elements` = [{ id, name, cls, box (same frame as targetBox,
 * world mm), tris? (world corners) | mesh? }]; `toLocal` maps world → the target's frame. Elements within `radius` mm of the target's box,
 * nearest first, until `budget` triangles are spent; the rest are counted in `omitted` (never silently dropped).
 */
export function contextMeshes(elements, targetBox, { radius = 3000, budget = LIMITS.contextTriangles, max = LIMITS.contextMeshes, toLocal = null, skip = null } = {}) {
  const near = [];
  for (const e of elements) {
    if (skip && skip(e)) continue;
    const d = boxGap(targetBox, e.box);
    if (d <= radius) near.push({ e, d });
  }
  near.sort((a, b) => a.d - b.d);
  const meshes = []; let spent = 0, omitted = 0;
  for (const { e } of near) {
    const nt = e.mesh ? e.mesh.indices.length / 3 : Math.floor(e.tris.length / 9);
    if (meshes.length >= max || spent + nt > budget) { omitted++; continue; }
    const m = e.mesh ? (toLocal ? mapMesh(e.mesh, toLocal) : e.mesh) : localMesh(e.tris, toLocal);
    if (!m.indices.length) continue;
    spent += m.indices.length / 3;
    meshes.push({ id: String(e.id ?? ''), name: String(e.name ?? '').slice(0, LIMITS.text), cls: String(e.cls ?? '').slice(0, 64), mesh: m });
  }
  return { meshes, omitted, outside: elements.length - near.length, triangles: spent };
}

// ---------------------------------------------------------------- solids (0.11 SU.1814, su-finish-11: a part's body back as IFC solids)
export const SOLID_LIMITS = { steps: 64, points: 4096, loops: 64, size: 1e7 };
export const SOLID_OPS = ['base', 'add', 'cut'];
const v3 = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
const vlen = (v) => Math.hypot(v[0], v[1], v[2]);
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const ring = (l, max) => Array.isArray(l) && l.length >= 3 && l.length <= max && l.every((q) => Array.isArray(q) && q.length === 2 && q.every((x) => Number.isFinite(x) && Math.abs(x) < SOLID_LIMITS.size));
const ringArea = (l) => { let a = 0; for (let i = 0; i < l.length; i++) { const p = l[i], q = l[(i + 1) % l.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
/**
 * A prism in the element's frame (mm, Z up): { origin, x, n (unit, x ⟂ n), y (= n × x, worked out here), depth > 0, and either outer: [[u, v]…]
 * (counter-clockwise) + holes: [[[u, v]…]] (clockwise), or circle: { c: [u, v], r > 0 } }. The profile is in the plane (origin; x, y), extruded
 * along n by depth: what an IfcExtrudedAreaSolid holds. → a clean copy or null.
 */
export function cleanPrism(p) {
  if (!p || typeof p !== 'object' || !v3(p.origin) || !v3(p.x) || !v3(p.n)) return null;
  const lx = vlen(p.x), ln = vlen(p.n);
  if (Math.abs(lx - 1) > 1e-6 || Math.abs(ln - 1) > 1e-6 || Math.abs(vdot(p.x, p.n)) > 1e-6) return null;
  if (!(Number.isFinite(p.depth) && p.depth > 1e-6 && p.depth < SOLID_LIMITS.size) || p.origin.some((v) => Math.abs(v) > SOLID_LIMITS.size)) return null;
  const x = p.x.map((v) => v / lx), n = p.n.map((v) => v / ln), y = vcross(n, x);
  const base = { origin: p.origin.map(Number), x, y, n, depth: Number(p.depth) };
  if (p.circle) {
    const c = p.circle;
    if (!c || !Array.isArray(c.c) || c.c.length !== 2 || !c.c.every(Number.isFinite) || !(Number.isFinite(c.r) && c.r > 1e-6 && c.r < SOLID_LIMITS.size)) return null;
    return { ...base, circle: { c: [Number(c.c[0]), Number(c.c[1])], r: Number(c.r) } };
  }
  const holes = Array.isArray(p.holes) ? p.holes : [];
  if (!ring(p.outer, SOLID_LIMITS.points) || holes.length > SOLID_LIMITS.loops || !holes.every((h) => ring(h, SOLID_LIMITS.points))) return null;
  if (p.outer.length + holes.reduce((s, h) => s + h.length, 0) > SOLID_LIMITS.points) return null;
  const ccw = (l, want) => { const q = l.map((pt) => [Number(pt[0]), Number(pt[1])]); return (ringArea(q) > 0) === want ? q : q.reverse(); };
  if (!(Math.abs(ringArea(p.outer)) > 1e-9)) return null;
  return { ...base, outer: ccw(p.outer, true), holes: holes.map((h) => ccw(h, false)) };
}
/** A prism through a rotation `f` (a function on 3-vectors: e.g. PartCraft's Y up → Z up). The profile is unchanged. */
export function mapPrism(p, f) {
  const out = { ...p, origin: f(p.origin), x: f(p.x), n: f(p.n) };
  delete out.y;
  return cleanPrism(out);
}
/** A body as IFC solids: { kind: 'csg', steps: [{ op: 'base' | 'add' | 'cut', ...prism }] }, the first step the base. → a clean copy or null. */
export function cleanSolid(s) {
  if (!s || typeof s !== 'object' || s.kind !== 'csg' || !Array.isArray(s.steps) || !s.steps.length || s.steps.length > SOLID_LIMITS.steps) return null;
  const steps = [];
  let pts = 0;
  for (let i = 0; i < s.steps.length; i++) {
    const st = s.steps[i];
    if (!st || (i === 0) !== (st.op === 'base') || !SOLID_OPS.includes(st.op)) return null;
    const p = cleanPrism(st);
    if (!p) return null;
    pts += p.circle ? 1 : p.outer.length + p.holes.reduce((a, h) => a + h.length, 0);
    if (pts > SOLID_LIMITS.points * 4) return null;
    steps.push({ op: st.op, ...p });
  }
  return { kind: 'csg', steps };
}

// ---------------------------------------------------------------- the package BimCraft sends
const text = (v, n = LIMITS.text) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const LINK_RE = /^[A-Za-z0-9_-]{8,64}$/;
export const isLinkId = (s) => typeof s === 'string' && LINK_RE.test(s);
/** A fresh link id (random bytes from `rand`, default crypto). */
export function newLinkId(rand = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n))) {
  return b64(rand(12)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * source: { app, file, globalId, ifcClass, name, typeName?, storey?, placement (4 x 4, mm, Z up, the element's frame in the file's world), unit? }
 * mesh: the element in its own frame (mm, Z up). context: contextMeshes().meshes (same frame), omitted?: count.
 */
export function makePackage({ link, source, mesh, context = [], omitted = 0, prism = null, rev = 0, now = new Date().toISOString() }) {
  if (!isLinkId(link)) fail('partlink.err.link');
  if (!source || typeof source !== 'object' || !text(source.globalId)) fail('partlink.err.source');
  if (!isM(source.placement)) fail('partlink.err.placement');
  const s = meshStats(mesh);
  if (!s.triangles) fail('partlink.err.empty');
  return {
    format: FORMAT, version: VERSION, link, sentAt: now,
    ...(Number.isInteger(rev) && rev > 0 ? { rev } : {}),   // 0.11: the last revision BimCraft took on this link, so a second send (or the other app) counts on from it
    source: {
      app: text(source.app || 'BimCraft', 40), file: text(source.file), globalId: text(source.globalId, 64), ifcClass: text(source.ifcClass, 64), name: text(source.name),
      typeName: text(source.typeName), storey: text(source.storey), placement: source.placement.map(Number), unit: 'mm',
    },
    geometry: { mesh: encodeMesh(mesh), hash: meshHash(mesh), volume: s.volume, closed: s.closed, box: s.box, ...(cleanPrism(prism) ? { prism: cleanPrism(prism) } : {}) },
    context: { omitted: Math.max(0, Math.round(omitted) || 0), meshes: context.slice(0, LIMITS.contextMeshes).map((c) => ({ id: text(c.id, 64), name: text(c.name), cls: text(c.cls, 64), mesh: encodeMesh(c.mesh, { f32: true }) })) },
  };
}

/** A package from the store or a file: untrusted. → { link, source, mesh, hash, volume, closed, box, context: [{ id, name, cls, mesh }], omitted, sentAt } */
export function readPackage(raw) {
  let j = raw;
  if (typeof raw === 'string') { if (raw.length > LIMITS.bytes) fail('partlink.err.toobig', { n: raw.length, max: LIMITS.bytes }); try { j = JSON.parse(raw); } catch { fail('partlink.err.format'); } }
  if (!j || j.format !== FORMAT) fail('partlink.err.format');
  if (!Number.isInteger(j.version) || j.version < 1 || j.version > VERSION) fail('partlink.err.version', { v: j.version });
  if (!isLinkId(j.link)) fail('partlink.err.link');
  const s = j.source;
  if (!s || typeof s !== 'object' || !text(s.globalId) || !isM(s.placement)) fail('partlink.err.source');
  const mesh = decodeMesh(j.geometry?.mesh);
  if (!mesh.indices.length) fail('partlink.err.empty');
  const ctx = Array.isArray(j.context?.meshes) ? j.context.meshes.slice(0, LIMITS.contextMeshes) : [];
  let spent = 0;
  const context = [];
  for (const c of ctx) {
    const m = decodeMesh(c?.mesh, { maxTriangles: LIMITS.contextTriangles });
    spent += m.indices.length / 3;
    if (spent > LIMITS.contextTriangles) break;
    context.push({ id: text(c.id, 64), name: text(c.name), cls: text(c.cls, 64), mesh: m });
  }
  return {
    link: j.link, sentAt: text(j.sentAt, 40), rev: Number.isInteger(j.rev) && j.rev > 0 ? j.rev : 0,
    source: { app: text(s.app, 40), file: text(s.file), globalId: text(s.globalId, 64), ifcClass: text(s.ifcClass, 64), name: text(s.name), typeName: text(s.typeName), storey: text(s.storey), placement: s.placement.map(Number), unit: 'mm' },
    mesh, hash: text(j.geometry.hash, 32), volume: Number(j.geometry.volume) || 0, closed: j.geometry.closed === true, box: Array.isArray(j.geometry.box) ? j.geometry.box.map(Number) : meshStats(mesh).box,
    context, omitted: Math.max(0, Math.round(j.context?.omitted) || 0),
    prism: cleanPrism(j.geometry.prism),   // 0.11: the element IS this prism (null: it is not one, or the sender did not say)
  };
}

// ---------------------------------------------------------------- the update PartCraft sends back
/** from: { app, part, file? }; baseHash = the package's geometry hash this update was made from (BimCraft knows if the element moved on since). */
export function makeUpdate({ link, rev, mesh, from = {}, baseHash = '', note = '', solid = null, now = new Date().toISOString() }) {
  if (!isLinkId(link)) fail('partlink.err.link');
  if (!Number.isInteger(rev) || rev < 1) fail('partlink.err.rev');
  const s = meshStats(mesh);
  if (!s.triangles) fail('partlink.err.empty');
  return {
    format: UPDATE_FORMAT, version: VERSION, link, rev, savedAt: now, baseHash: text(baseHash, 32), note: text(note, 400),
    from: { app: text(from.app || 'PartCraft', 40), part: text(from.part), file: text(from.file) },
    geometry: { mesh: encodeMesh(mesh), hash: meshHash(mesh), volume: s.volume, closed: s.closed, box: s.box },
    ...(cleanSolid(solid) ? { solid: cleanSolid(solid) } : {}),
  };
}
export function readUpdate(raw) {
  let j = raw;
  if (typeof raw === 'string') { if (raw.length > LIMITS.bytes) fail('partlink.err.toobig', { n: raw.length, max: LIMITS.bytes }); try { j = JSON.parse(raw); } catch { fail('partlink.err.format'); } }
  if (!j || j.format !== UPDATE_FORMAT) fail('partlink.err.format');
  if (!Number.isInteger(j.version) || j.version < 1 || j.version > VERSION) fail('partlink.err.version', { v: j.version });
  if (!isLinkId(j.link)) fail('partlink.err.link');
  if (!Number.isInteger(j.rev) || j.rev < 1) fail('partlink.err.rev');
  const mesh = decodeMesh(j.geometry?.mesh);
  if (!mesh.indices.length) fail('partlink.err.empty');
  return {
    link: j.link, rev: j.rev, savedAt: text(j.savedAt, 40), baseHash: text(j.baseHash, 32), note: text(j.note, 400),
    from: { app: text(j.from?.app, 40), part: text(j.from?.part), file: text(j.from?.file) },
    mesh, hash: text(j.geometry.hash, 32), volume: Number(j.geometry.volume) || 0, closed: j.geometry.closed === true, box: Array.isArray(j.geometry.box) ? j.geometry.box.map(Number) : meshStats(mesh).box,
    solid: cleanSolid(j.solid),   // 0.11: the body as IFC solids, or null (a damaged one is dropped; the mesh still stands)
  };
}

// ---------------------------------------------------------------- what a part file keeps of its link
/** The `bimLink` a part file carries (untrusted): { link, globalId, name, ifcClass, file, hash, rev } or null. The geometry and the building around it are NOT in the file: they wait in the store. */
export function readRef(raw) {
  if (!raw || typeof raw !== 'object' || !isLinkId(raw.link) || !text(raw.globalId, 64)) return null;
  const prism = cleanPrism(raw.prism);   // 0.11: the element as BimCraft sent it, when it was a straight prism (what a part's history builds on)
  return { link: raw.link, globalId: text(raw.globalId, 64), name: text(raw.name), ifcClass: text(raw.ifcClass, 64), file: text(raw.file), hash: text(raw.hash, 32), rev: Number.isInteger(raw.rev) && raw.rev >= 0 ? raw.rev : 0, ...(prism ? { prism } : {}) };
}
/** The ref for a package just opened as a part. */
export const refFromPackage = (pkg) => ({ link: pkg.link, globalId: pkg.source.globalId, name: pkg.source.name, ifcClass: pkg.source.ifcClass, file: pkg.source.file, hash: pkg.hash, rev: pkg.rev || 0, ...(pkg.prism ? { prism: pkg.prism } : {}) });
/** Z up (the element's frame) ↔ Y up (PartCraft's): (x, y, z) → (x, z, −y) and back. Flat arrays, new array. */
export function zUpToYUp(p) { const o = new Float64Array(p.length); for (let i = 0; i < p.length; i += 3) { o[i] = p[i]; o[i + 1] = p[i + 2]; o[i + 2] = -p[i + 1]; } return o; }
export function yUpToZUp(p) { const o = new Float64Array(p.length); for (let i = 0; i < p.length; i += 3) { o[i] = p[i]; o[i + 1] = -p[i + 2]; o[i + 2] = p[i + 1]; } return o; }

// ---------------------------------------------------------------- the state of each link (BimCraft's side)
/**
 * sent → changed (an update arrived: the element is marked) → accepted (the person took it; the model changed) | rejected (kept as it was).
 * A new update for a link that is still `changed` replaces the older one. An update whose baseHash is not the element's present hash is `stale`
 * (the element changed in the building after it was sent): it can still be accepted, and says so.
 */
export class LinkBook {
  constructor(rows = []) { this.map = new Map(); for (const r of rows) this.map.set(r.link, { ...r }); }
  get(link) { return this.map.get(link) || null; }
  list() { return [...this.map.values()].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')); }
  byElement(globalId) { return this.list().filter((r) => r.globalId === globalId); }
  changed() { return this.list().filter((r) => r.state === 'changed'); }
  /** An element went out. A second send of the same element reuses its link (one link per element). */
  sent({ link, globalId, name, ifcClass, model = '', hash, rev = 0, now = new Date().toISOString() }) {
    const had = this.byElement(globalId)[0];
    const rec = { link: had ? had.link : link, globalId, name: text(name), ifcClass: text(ifcClass, 64), model: text(model), state: 'sent', hash, rev: had ? had.rev : rev, sentAt: now, updatedAt: now, pending: null, stale: false, from: '' };
    this.map.set(rec.link, rec);
    return rec;
  }
  /** An update arrived. → the record, or null for an unknown link, an older revision or a copy already taken. */
  receive(update, { currentHash = null, now = new Date().toISOString() } = {}) {
    const r = this.map.get(update.link);
    if (!r || update.rev <= (r.rev || 0)) return null;
    if (r.pending && update.rev <= r.pending.rev) return null;
    r.pending = { rev: update.rev, hash: update.hash, volume: update.volume, savedAt: update.savedAt, note: update.note, from: update.from };
    r.state = 'changed'; r.updatedAt = now;
    r.stale = currentHash != null && update.baseHash !== '' && update.baseHash !== currentHash;
    return r;
  }
  accept(link, { hash = null, now = new Date().toISOString() } = {}) {
    const r = this.map.get(link);
    if (!r || r.state !== 'changed' || !r.pending) return null;
    r.rev = r.pending.rev; r.hash = hash || r.pending.hash; r.from = r.pending.from?.app || ''; r.pending = null; r.state = 'accepted'; r.stale = false; r.updatedAt = now;
    return r;
  }
  reject(link, { now = new Date().toISOString() } = {}) {
    const r = this.map.get(link);
    if (!r || r.state !== 'changed' || !r.pending) return null;
    r.rev = r.pending.rev;   // the revision is used up: the same update does not come back as a change
    r.pending = null; r.state = 'rejected'; r.stale = false; r.updatedAt = now;
    return r;
  }
  toJSON() { return this.list(); }
}

/** The rows of the element's CadCraft_PartLink property set (kept in the IFC; the pending update is not: it waits in the store). */
export function psetRows(rec) {
  return [['LinkId', rec.link], ['Status', rec.state], ['Revision', rec.rev || 0], ['Source', rec.from || 'BimCraft'], ['Hash', rec.hash || '']];
}

// ---------------------------------------------------------------- where it waits between the two pages
/** kinds: 'package' (link → package), 'update' (link → newest update, waiting), 'pending' (link → the update BimCraft took and shows as changed, until accepted or rejected), 'book' (name → rows). Values are plain JSON. */
export function memoryStore() {
  const m = { package: new Map(), update: new Map(), book: new Map(), pending: new Map() };
  return {
    async put(kind, key, value) { m[kind].set(key, JSON.parse(JSON.stringify(value))); },
    async get(kind, key) { return m[kind].has(key) ? JSON.parse(JSON.stringify(m[kind].get(key))) : null; },
    async delete(kind, key) { m[kind].delete(key); },
    async keys(kind) { return [...m[kind].keys()]; },
  };
}
/** The same in IndexedDB (both apps are pages of one origin). `idb` = the indexedDB factory; opened when first used. */
export function idbStore(idb, name = 'cadcraft-part-link') {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const rq = idb.open(name, 1);
    rq.onupgradeneeded = () => { for (const k of ['package', 'update', 'book', 'pending']) rq.result.createObjectStore(k); };
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => { dbp = null; rej(new PartLinkError('partlink.err.storage')); };
  }));
  const run = async (kind, mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(kind, mode), st = tx.objectStore(kind), rq = fn(st);
      tx.oncomplete = () => res(rq ? rq.result : undefined);
      tx.onerror = tx.onabort = () => rej(new PartLinkError('partlink.err.storage'));
    });
  };
  return {
    put: (kind, key, value) => run(kind, 'readwrite', (s) => s.put(value, key)),
    get: async (kind, key) => (await run(kind, 'readonly', (s) => s.get(key))) ?? null,
    delete: (kind, key) => run(kind, 'readwrite', (s) => s.delete(key)),
    keys: async (kind) => (await run(kind, 'readonly', (s) => s.getAllKeys())) || [],
  };
}
/** A tab-to-tab notice (BroadcastChannel): { kind: 'package' | 'update', link }. Returns { post, on, close }; a page without BroadcastChannel gets a quiet one (the receiver also looks when it opens and on focus). */
export function openChannel(BC = globalThis.BroadcastChannel, name = 'cadcraft-part-link') {
  if (!BC) return { post() {}, on() {}, close() {} };
  const ch = new BC(name);
  return { post: (msg) => ch.postMessage(msg), on: (fn) => { ch.onmessage = (e) => fn(e.data); }, close: () => ch.close() };
}
/** Take every update waiting for a link BimCraft knows, oldest revision first (the store keeps only the newest per link). */
export async function takeUpdates(store, book, { currentHash = () => null } = {}) {
  const out = [];
  for (const link of await store.keys('update')) {
    if (!book.get(link)) continue;
    let up = null;
    try { up = readUpdate(await store.get('update', link)); } catch { await store.delete('update', link); continue; }
    const r = book.receive(up, { currentHash: currentHash(book.get(link)) });
    if (r) { out.push(r); await store.put('pending', link, await store.get('update', link)); }
    await store.delete('update', link);
  }
  return out;
}
