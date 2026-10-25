/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — the records of tokens.js → bodies, lumps, shells, faces, loops, coedges, edges, vertices and the geometry
 * they sit on (cc-acis, docs/ACIS-READER.md § 4). No DOM.
 *
 *   decode(tok) → { bodies: [Body], records, version, why }   (tok = tokenize()'s result)
 *
 * Records are decoded when something points at them (a pointer to the wrong kind, a loop of pointers or a missing record
 * makes that one thing null; the caller counts it). Geometry comes back as plain objects:
 *   surfaces { type: 'plane', root, normal, udir, reverseV } · { type: 'cone', centre, normal, major, ratio, sin, cos,
 *   uScale, reverseU } · { type: 'sphere', centre, radius, origin, pole, reverseV } · { type: 'torus', centre, normal,
 *   major, minor, origin, reverseV } · { type: 'spline', reversed, bs: BS3 | null, subtype } · { type: 'other', name }
 *   curves { type: 'straight', root, dir } · { type: 'ellipse', centre, normal, major, ratio } · { type: 'intcurve',
 *   reversed, bs: BS3 | null, subtype } · { type: 'other', name }
 *   BS3 { rational, degU, degV?, closedU, closedV?, knotsU, knotsV?, ctrl: [[x, y, z, w]…] (u-major for surfaces), nu, nv }
 */

import { Ptr, isOpen, isClose } from './tokens.js';

/** a reader over one record's fields */
class Cur {
  constructor(f, at = 0) { this.f = f; this.i = at; this.bad = false; }
  get done() { return this.i >= this.f.length; }
  peek() { return this.f[this.i]; }
  next() { if (this.i >= this.f.length) { this.bad = true; return undefined; } return this.f[this.i++]; }
  ptr() { const v = this.next(); if (v instanceof Ptr) return v.i; this.bad = true; return -1; }
  isPtr() { return this.peek() instanceof Ptr; }
  isNum() { return typeof this.peek() === 'number'; }
  num() {
    const v = this.next();
    if (typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e12) return v;
    this.bad = true; return 0;
  }
  int() { const v = this.num(); if (!Number.isInteger(v)) this.bad = true; return v; }
  /** a SAB position / vector, or three numbers */
  vec() {
    const v = this.peek();
    if (Array.isArray(v)) { this.i++; if (!v.every((x) => Number.isFinite(x) && Math.abs(x) < 1e12)) this.bad = true; return v.slice(); }
    return [this.num(), this.num(), this.num()];
  }
  hasVec() { const v = this.peek(); return Array.isArray(v) || typeof v === 'number'; }
  word() { const v = this.next(); if (typeof v === 'string') return v; this.bad = true; return ''; }
  /** a logical: true for reversed / double / in / reverse_v / T / 1, false for the others (docs § 3) */
  logical() {
    const v = this.next();
    if (v === true || v === false) return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      if (TRUE.has(v)) return true;
      if (FALSE.has(v)) return false;
    }
    this.bad = true; return false;
  }
  /** an interval end: null when unbounded */
  end() {
    const v = this.next();
    if (v === 'I' || v === false) return null;
    if (v === 'F' || v === true) return this.num();
    if (typeof v === 'number') return v;   // old files: the number alone
    this.bad = true; return null;
  }
  interval() { return [this.end(), this.end()]; }
  /** a string a SAB stores tagged and a SAT as a word or @-string */
  str() { const v = this.next(); return typeof v === 'string' ? v : ''; }
}
const TRUE = new Set(['reversed', 'double', 'in', 'reverse_v', 'reverse_u', 'T', 'TRUE', 'true', 'rotate', 'reflect', 'shear']);
const FALSE = new Set(['forward', 'single', 'out', 'forward_v', 'forward_u', 'F', 'FALSE', 'false', 'no_rotate', 'no_reflect', 'no_shear']);

/** the leaf of a save identifier: 'plane-surface' → 'plane', 'body' → 'body' */
const kindOf = (name) => name.split('-');

export function decode(tok) {
  const recs = tok.records || [];
  const V = tok.version || 0;
  const cache = new Map();
  const busy = new Set();
  const out = { bodies: [], version: V, why: null };

  /** ENTITY data (docs § 4): attribute pointer; from 700 the id; from 700 one more pointer (not on attributes or transforms) */
  const ent = (r) => {
    const c = new Cur(r.f);
    c.ptr();
    if (V >= 700) { if (c.isNum()) c.int(); if (c.isPtr()) c.ptr(); }
    return c;
  };
  const get = (i, want) => {
    if (!Number.isInteger(i) || i < 0 || i >= recs.length) return null;
    const r = recs[i];
    if (!r || !r.name) return null;
    const parts = kindOf(r.name);
    const leaf = parts[parts.length - 1];
    if (want && !want.includes(leaf)) return null;
    const key = i;
    if (cache.has(key)) return cache.get(key);
    if (busy.has(key)) return null;
    busy.add(key);
    let v = null;
    try { v = make(i, r, parts, leaf); } catch { v = null; }
    busy.delete(key);
    cache.set(key, v);
    return v;
  };

  const make = (i, r, parts, leaf) => {
    switch (leaf) {
      case 'body': {
        const c = ent(r);
        const lump = c.ptr(), wire = c.ptr(), tr = c.ptr();
        return c.bad ? null : { kind: 'body', i, lump, wire, transform: tr };
      }
      case 'lump': { const c = ent(r); const next = c.ptr(), shell = c.ptr(); return c.bad ? null : { kind: 'lump', i, next, shell }; }
      case 'shell': {
        const c = ent(r);
        const next = c.ptr(), subshell = c.ptr(), face = c.ptr(), wire = c.isPtr() ? c.ptr() : -1;
        return c.bad ? null : { kind: 'shell', i, next, subshell, face, wire };
      }
      case 'subshell': {
        const c = ent(r);
        const parent = c.ptr(), sibling = c.ptr(), child = c.ptr(), face = c.ptr();
        return c.bad ? null : { kind: 'subshell', i, parent, sibling, child, face };
      }
      case 'face': {
        const c = ent(r);
        const next = c.ptr(), loop = c.ptr(), shell = c.ptr(), subshell = c.ptr(), surface = c.ptr();
        const reversed = c.logical();
        const double = c.done ? false : c.logical();
        return c.bad ? null : { kind: 'face', i, next, loop, shell, subshell, surface, reversed, double };
      }
      case 'loop': { const c = ent(r); const next = c.ptr(), coedge = c.ptr(), face = c.ptr(); return c.bad ? null : { kind: 'loop', i, next, coedge, face }; }
      case 'coedge': {
        const c = ent(r);
        const next = c.ptr(), prev = c.ptr(), partner = c.ptr(), edge = c.ptr();
        const reversed = c.logical();
        const owner = c.ptr();
        return c.bad ? null : { kind: 'coedge', i, next, prev, partner, edge, reversed, owner };
      }
      case 'edge': {
        const c = ent(r);
        const v0 = c.ptr();
        const t0 = c.isNum() ? c.num() : null;   // from 700 (spec gap)
        const v1 = c.ptr();
        const t1 = c.isNum() ? c.num() : null;
        const coedge = c.ptr(), curve = c.ptr();
        const reversed = c.done ? false : c.logical();
        return c.bad ? null : { kind: 'edge', i, v0, v1, t0, t1, coedge, curve, reversed };
      }
      case 'vertex': {
        const c = ent(r);
        const edge = c.ptr();
        if (c.isNum()) c.int();    // from 21200 (spec gap)
        const point = c.ptr();
        return c.bad ? null : { kind: 'vertex', i, edge, point };
      }
      case 'point': { const c = ent(r); const p = c.vec(); return c.bad ? null : { kind: 'point', i, p }; }
      case 'transform': {
        // attribute pointer, (700+: the id), then 12 reals (3 rows, translation) and the scale, then three words: the
        // numbers are counted, so the id is the one too many
        const c = new Cur(r.f);
        c.ptr();
        if (c.isPtr()) c.ptr();
        const nums = [];
        while (!c.done && (c.isNum() || Array.isArray(c.peek()))) { const v = c.next(); if (Array.isArray(v)) nums.push(...v); else nums.push(v); }
        if (V >= 700 && nums.length >= 14) nums.shift();
        if (nums.length < 12 || !nums.every((x) => Number.isFinite(x) && Math.abs(x) < 1e12)) return null;
        const s = nums.length >= 13 ? nums[12] : 1;
        if (!(Math.abs(s) > 1e-12)) return null;
        return { kind: 'transform', rows: [nums.slice(0, 3), nums.slice(3, 6), nums.slice(6, 9)], t: nums.slice(9, 12), s };
      }
      case 'surface': return surface(r, parts);
      case 'curve': return curve(r, parts);
      default: return { kind: leaf, i, name: r.name };
    }
  };

  const surface = (r, parts) => {
    const type = parts[0];
    const c = ent(r);
    switch (type) {
      case 'plane': {
        const root = c.vec(), normal = c.vec();
        const udir = c.hasVec() ? c.vec() : null;
        const reverseV = c.done ? false : c.logical();
        return c.bad ? null : { kind: 'surface', type: 'plane', root, normal, udir, reverseV };
      }
      case 'cone': {
        const centre = c.vec(), normal = c.vec(), major = c.vec(), ratio = c.num();
        c.interval();
        const sin = c.num(), cos = c.num();
        const uScale = c.isNum() ? c.num() : null;   // CONE_SCALING_VERSION 4.0 (absent in [SAT]'s own 4.0 example)
        const reverseU = c.done ? false : c.logical();
        return c.bad ? null : { kind: 'surface', type: 'cone', centre, normal, major, ratio, sin, cos, uScale, reverseU };
      }
      case 'sphere': {
        const centre = c.vec(), radius = c.num();
        let origin = null, pole = null;
        if (c.hasVec()) { origin = c.vec(); pole = c.vec(); }   // spec gap: uv origin and pole
        const reverseV = c.done ? false : c.logical();
        return c.bad ? null : { kind: 'surface', type: 'sphere', centre, radius, origin, pole, reverseV };
      }
      case 'torus': {
        const centre = c.vec(), normal = c.vec(), major = c.num(), minor = c.num();
        const origin = c.hasVec() ? c.vec() : null;   // spec gap
        const reverseV = c.done ? false : c.logical();
        return c.bad ? null : { kind: 'surface', type: 'torus', centre, normal, major, minor, origin, reverseV };
      }
      case 'spline': {
        const reversed = c.logical();
        const sub = subtype(c);
        if (c.bad) return null;
        return { kind: 'surface', type: 'spline', reversed, subtype: sub.name, bs: sub.name === 'exactsur' ? sub.bs : null };
      }
      default: return { kind: 'surface', type: 'other', name: r.name };
    }
  };

  const curve = (r, parts) => {
    const type = parts[0];
    const c = ent(r);
    switch (type) {
      case 'straight': { const root = c.vec(), dir = c.vec(); return c.bad ? null : { kind: 'curve', type: 'straight', root, dir }; }
      case 'ellipse': {
        const centre = c.vec(), normal = c.vec(), major = c.vec(), ratio = c.num();
        return c.bad ? null : { kind: 'curve', type: 'ellipse', centre, normal, major, ratio };
      }
      case 'intcurve': {
        const reversed = c.logical();
        const sub = subtype(c, true);
        if (c.bad) return null;
        return { kind: 'curve', type: 'intcurve', reversed, subtype: sub.name, bs: sub.bs };
      }
      default: return { kind: 'curve', type: 'other', name: r.name };
    }
  };

  /**
   * `{ name <B-spline> … }` or `{ ref n }` → { name, bs } (bs null when the data does not start with nubs/nurbs or does not
   * read). The cursor ends after the subtype's CLOSE.
   */
  const subtype = (c, isCurve, depth = 0) => {
    const o = c.next();
    if (!isOpen(o)) { c.bad = true; return { name: '', bs: null }; }
    const name = c.peek() === 'ref' ? (c.next(), 'ref') : c.word();
    let res = { name, bs: null };
    if (name === 'ref') {
      const n = c.int();
      const st = tok.subtypes[n];
      if (st && depth < 8 && st.rec >= 0 && recs[st.rec]) res = subtype(new Cur(recs[st.rec].f, st.at), isCurve, depth + 1);
    } else {
      const save = c.i;
      try { res.bs = readBs(c, isCurve); } catch { res.bs = null; }
      if (c.bad) { res.bs = null; c.bad = false; }
      c.i = save;
    }
    // to the matching CLOSE
    let d = 1;
    while (!c.done && d > 0) { const v = c.next(); if (isOpen(v)) d++; else if (isClose(v)) d--; }
    if (d) c.bad = true;
    return res;
  };

  // bodies: every record named body, in file order (top-level entities come first [SAT § Entity Records])
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i];
    if (r && r.name === 'body') { const b = get(i, ['body']); if (b) out.bodies.push(b); }
  }
  out.get = get;
  out.records = recs;
  return out;
}

/**
 * A bs3_surface / bs3_curve [SAT Table 2-1; R10]: nubs|nurbs, degree(s), closure(s), (surfaces: singularities), knot
 * count(s), knots with multiplicities, control points (+ weights), fit tolerance … → BS3, or null for "nullbs" / not a
 * B-spline. Spec gap: control points per direction = Σ multiplicities − degree + 1 (end knots stored with multiplicity
 * = degree); checked against the edges by the caller.
 */
function readBs(c, isCurve) {
  const kind = c.peek();
  if (kind !== 'nubs' && kind !== 'nurbs') return null;
  c.next();
  const rational = kind === 'nurbs';
  const MAXK = 100000, MAXC = 1000000;
  if (isCurve) {
    const deg = c.int();
    const closure = c.word();
    const nk = c.int();
    if (c.bad || deg < 1 || deg > 25 || nk < 2 || nk > MAXK) return null;
    const knots = readKnots(c, nk, deg);
    if (!knots) return null;
    const n = knots.length - deg - 1;
    if (n < deg + 1 || n > MAXC) return null;
    const ctrl = [];
    for (let i = 0; i < n; i++) { const p = c.vec(); p.push(rational ? c.num() : 1); ctrl.push(p); }
    if (c.bad) return null;
    return { rational, degU: deg, closedU: closure, knotsU: knots, ctrl, nu: n };
  }
  const du = c.int(), dv = c.int();
  const cu = c.word(), cv = c.word();
  c.word(); c.word();   // singularities
  const nku = c.int(), nkv = c.int();
  if (c.bad || du < 1 || dv < 1 || du > 25 || dv > 25 || nku < 2 || nkv < 2 || nku > MAXK || nkv > MAXK) return null;
  const ku = readKnots(c, nku, du), kv = readKnots(c, nkv, dv);
  if (!ku || !kv) return null;
  const nu = ku.length - du - 1, nv = kv.length - dv - 1;
  if (nu < du + 1 || nv < dv + 1 || nu * nv > MAXC) return null;
  const ctrl = [];
  for (let i = 0; i < nu * nv; i++) { const p = c.vec(); p.push(rational ? c.num() : 1); ctrl.push(p); }
  if (c.bad) return null;
  return { rational, degU: du, degV: dv, closedU: cu, closedV: cv, knotsU: ku, knotsV: kv, ctrl, nu, nv };
}

/** n (value, multiplicity) pairs → the full clamped knot vector (one more copy of each end knot: ACIS stores degree) */
function readKnots(c, n, deg) {
  const ks = [];
  for (let i = 0; i < n; i++) {
    const v = c.num(), m = c.int();
    if (c.bad || m < 1 || m > deg + 1) return null;
    if (ks.length && v < ks[ks.length - 1]) return null;
    for (let k = 0; k < m; k++) ks.push(v);
    if (ks.length > 2000000) return null;
  }
  // clamp: ends to multiplicity deg + 1
  let m0 = 0; while (m0 < ks.length && ks[m0] === ks[0]) m0++;
  let m1 = 0; while (m1 < ks.length && ks[ks.length - 1 - m1] === ks[ks.length - 1]) m1++;
  if (m0 === deg) ks.unshift(ks[0]);
  if (m1 === deg) ks.push(ks[ks.length - 1]);
  return ks;
}
