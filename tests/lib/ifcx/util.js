/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.js — shared helpers of cc-ifcx (SU.882, 0.9): errors, 4x4 matrices in the row-vector convention the format's
 * transform attribute uses (translation in the last row), and the GUID forms.
 */
export class IfcxError extends Error {
  constructor(code, vars = {}, message) {
    super(message || code);
    this.code = code;
    this.vars = vars;
  }
}
export const fail = (code, vars = {}, message) => { throw new IfcxError(code, vars, message); };
export const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

export const IDENT = () => [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
export function isMatrix(m) {
  return Array.isArray(m) && m.length === 4 && m.every((r) => Array.isArray(r) && r.length === 4 && r.every((x) => typeof x === 'number' && Number.isFinite(x)));
}
export function isIdent(m, eps = 1e-12) {
  return m.every((r, i) => r.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) <= eps));
}
/** a · b for row vectors: a point is moved by a first, then by b. */
export function mulRow(a, b) {
  const o = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) o[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j] + a[i][3] * b[3][j];
  return o;
}
export function movePoint(m, x, y, z) {
  return [x * m[0][0] + y * m[1][0] + z * m[2][0] + m[3][0], x * m[0][1] + y * m[1][1] + z * m[2][1] + m[3][1], x * m[0][2] + y * m[1][2] + z * m[2][2] + m[3][2]];
}
/** True while the matrix only turns and moves (orthonormal rows, last column 0 0 0 1): IFC placements can say that. */
export function isRigid(m, eps = 1e-6) {
  if (Math.abs(m[0][3]) > eps || Math.abs(m[1][3]) > eps || Math.abs(m[2][3]) > eps || Math.abs(m[3][3] - 1) > eps) return false;
  const d = (a, b) => m[a][0] * m[b][0] + m[a][1] * m[b][1] + m[a][2] * m[b][2];
  return [0, 1, 2].every((i) => Math.abs(d(i, i) - 1) < eps) && Math.abs(d(0, 1)) < eps && Math.abs(d(0, 2)) < eps && Math.abs(d(1, 2)) < eps;
}

const B64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s) => typeof s === 'string' && UUID.test(s);
/** A UUID as IFC's 22-character GlobalId (128 bits in IFC's base 64). */
export function uuidToGlobalId(uuid) {
  let n = BigInt('0x' + uuid.replace(/-/g, ''));
  let s = '';
  for (let i = 0; i < 22; i++) { s = B64[Number(n & 63n)] + s; n >>= 6n; }
  return s;
}
/** A 22-character GlobalId as a lower-case UUID, or null when it is not one (the first character holds only 2 bits). */
export function globalIdToUuid(g) {
  if (typeof g !== 'string' || g.length !== 22) return null;
  let n = 0n;
  for (const c of g) { const k = B64.indexOf(c); if (k < 0) return null; n = (n << 6n) | BigInt(k); }
  if (n >> 128n) return null;
  const h = n.toString(16).padStart(32, '0');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
/** A stable UUID-shaped id from any text (FNV-1a over four seeds): a path that is not a UUID still gets a GlobalId. */
export function uuidFromText(text) {
  const out = [];
  for (let s = 0; s < 4; s++) {
    let h = (0x811c9dc5 ^ (s * 0x9e3779b1)) >>> 0;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    out.push(h.toString(16).padStart(8, '0'));
  }
  const h = out.join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** The inverse of a 4x4 (Gauss-Jordan); null when it is singular. */
export function invRow(m) {
  const a = m.map((r, i) => [...r, ...[0, 1, 2, 3].map((j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < 4; c++) {
    let p = c;
    for (let r = c + 1; r < 4; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-14) return null;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c];
    for (let j = 0; j < 8; j++) a[c][j] /= d;
    for (let r = 0; r < 4; r++) if (r !== c) { const f = a[r][c]; if (f) for (let j = 0; j < 8; j++) a[r][j] -= f * a[c][j]; }
  }
  return a.map((r) => r.slice(4).map((x) => (Object.is(x, -0) ? 0 : x)));
}
