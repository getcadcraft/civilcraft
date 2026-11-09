/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-analysis.js — GIS analysis on feature layers (0.9 SU.1080): buffer, overlay, dissolve, spatial join, attribute queries,
 * measure and summary statistics. No DOM; the only import is gis-poly.js (same folder). Canonical in lib/gis/; byte-identical
 * copies by tools/gis/sync.mjs --to civilcraft. Plan view only: Z is dropped from results.
 *
 * A layer here is { name, geom: 'pt'|'ln'|'pg', fields: [{name, type: text|number|date|bool}], features: [{ g, p }] } with CivilCraft's
 * geometry (gis-geom.js: pt {t,c}, ln {t,c: parts}, pg {t,c: polygons}). Every function returns a NEW layer + `notes`
 * ([{ code, n? }] things the person should hear) and never changes its input. Errors: { error: { code, … } }.
 *
 *   bufferLayer(layer, dist, { quarter, dissolve, field }) → pg layer     dist > 0 (points, lines, polygons) or < 0 (polygons shrink)
 *   overlay(a, b, 'intersect'|'union'|'erase', opts)       → layer           a, b polygons (intersect also takes points/lines in a)
 *   dissolve(layer, field|null)                            → pg layer        one polygon set per value, COUNT and AREA added
 *   spatialJoin(target, source, { relation, distance, mode, fields, keep })  → layer (target geometry + source attributes)
 *   parseQuery(text, fields) → { test(feature), value(feature) } | { error }   attribute / geometry expressions; value() is the
 *     raw result (a number, text, true/false or null) for the field calculator (0.9 SU.1080 round 2); functions (no eval, a fixed
 *     table): abs round floor ceil sqrt pow min max upper lower trim len substr left right replace concat coalesce if str num year month day
 *   selectWhere(layer, text) → { indices } | { error }
 *   measureFeature(g) → { kind, area?, perimeter?, length?, length3d?, x?, y? }   · addMeasure(layer) → layer with AREA / PERIMETER / LENGTH
 *   statistics(layer, field, by?) → { rows: [{ key, count, sum, mean, min, max }], total }
 *   geomDistance(a, b) · geomIntersects(a, b) · geomWithin(a, b) · toMulti(g) · fromMulti(m)
 */

import * as P from './gis-poly.js';

export const MAX_PAIRS = 4e6;
export const MAX_VERTS = 200000;
const FIELD_TYPES = ['text', 'number', 'date', 'bool'];

// ---------------------------------------------------------------------------------------------------------- geometry helpers
export const toMulti = (g) => (g?.t === 'pg' ? g.c : []);
export const fromMulti = (m) => (m.length ? { t: 'pg', c: m } : null);
const props = () => Object.create(null);
const plain = (p) => { const o = props(); for (const k of Object.keys(p || {})) o[k] = p[k]; return o; };
const verts = (g) => (!g ? 0 : g.t === 'pt' ? 1 : g.t === 'ln' ? g.c.reduce((s, q) => s + q.length, 0) : g.c.reduce((s, poly) => s + poly.reduce((a, r) => a + r.length, 0), 0));

function bbox(g) {
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const add = (p) => { if (p[0] < b.minX) b.minX = p[0]; if (p[0] > b.maxX) b.maxX = p[0]; if (p[1] < b.minY) b.minY = p[1]; if (p[1] > b.maxY) b.maxY = p[1]; };
  if (!g) return b;
  if (g.t === 'pt') add(g.c); else for (const r of g.t === 'ln' ? g.c : g.c.flat()) r.forEach(add);
  return b;
}
const near = (a, b, d) => !(a.maxX + d < b.minX || b.maxX + d < a.minX || a.maxY + d < b.minY || b.maxY + d < a.minY);

/** All line segments of a geometry as [a, b] pairs (polygon rings included). */
function segments(g) {
  const out = [];
  if (!g || g.t === 'pt') return out;
  for (const r of g.t === 'ln' ? g.c : g.c.flat()) for (let i = 0; i + 1 < r.length; i++) out.push([r[i], r[i + 1]]);
  return out;
}
const points = (g) => (!g ? [] : g.t === 'pt' ? [g.c] : (g.t === 'ln' ? g.c : g.c.flat()).flat());

/** Shortest plan distance between two geometries (0 when they touch, cross or one holds the other). */
export function geomDistance(a, b) {
  if (!a || !b) return Infinity;
  if (a.t === 'pt' && b.t === 'pt') return Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]);
  if (a.t === 'pg' && inside(a, firstPoint(b))) return 0;
  if (b.t === 'pg' && inside(b, firstPoint(a))) return 0;
  if (a.t === 'pt') return minPtSeg(a.c, segments(b));
  if (b.t === 'pt') return minPtSeg(b.c, segments(a));
  const sa = segments(a), sb = segments(b);
  let best = Infinity;
  for (const [p, p2] of sa) for (const [q, q2] of sb) { const d = P.segDist(p, p2, q, q2); if (d < best) { best = d; if (!best) return 0; } }
  return best;
}
const firstPoint = (g) => (g.t === 'pt' ? g.c : points(g)[0]);
const inside = (pg, p) => !!p && P.pointIn(pg.c, p[0], p[1]);
const minPtSeg = (p, segs) => { let b = Infinity; for (const [x, y] of segs) { const d = P.ptSegDist(p, x, y); if (d < b) b = d; } return b; };
export const geomIntersects = (a, b) => geomDistance(a, b) <= 1e-9 * Math.max(1, Math.abs(firstPoint(a)?.[0] || 0) * 1e-3);

/** a lies inside b (b a polygon): points held; lines fully within; polygons with no area outside. */
export function geomWithin(a, b, tol = 1e-9) {
  if (!a || !b || b.t !== 'pg') return false;
  if (a.t === 'pt') return P.pointIn(b.c, a.c[0], a.c[1]) || P.onBoundary(b.c, a.c[0], a.c[1], 1e-9);
  if (a.t === 'ln') { const r = P.clipLine(a.c, b.c); const out = r.outside.reduce((s, q) => s + P.ringLen(q), 0), tot = a.c.reduce((s, q) => s + P.ringLen(q), 0); return tot > 0 && out <= tot * tol; }
  const ar = P.area(a.c);
  return ar > 0 && P.area(P.difference(a.c, b.c)) <= ar * tol;
}

// -------------------------------------------------------------------------------------------------------------------- measure
export function measureFeature(g) {
  if (!g) return { kind: 'none' };
  if (g.t === 'pt') return { kind: 'pt', x: g.c[0], y: g.c[1] };
  if (g.t === 'ln') {
    let len = 0, len3 = 0, z = true;
    for (const part of g.c) for (let i = 0; i + 1 < part.length; i++) {
      const dx = part[i + 1][0] - part[i][0], dy = part[i + 1][1] - part[i][1];
      len += Math.hypot(dx, dy);
      if (part[i].length > 2 && part[i + 1].length > 2) len3 += Math.hypot(dx, dy, part[i + 1][2] - part[i][2]); else { z = false; len3 += Math.hypot(dx, dy); }
    }
    return z ? { kind: 'ln', length: len, length3d: len3 } : { kind: 'ln', length: len };
  }
  return { kind: 'pg', area: P.area(g.c), perimeter: P.perimeter(g.c) };
}

function freshName(fields, base) {
  const have = new Set(fields.map((f) => f.name.toLowerCase()));
  if (!have.has(base.toLowerCase())) return base;
  for (let i = 2; ; i++) if (!have.has((base + '_' + i).toLowerCase())) return base + '_' + i;
}

/** The layer with AREA and PERIMETER (polygons), LENGTH (lines) or X and Y (points) added as number fields. */
export function addMeasure(layer) {
  const fields = layer.fields.map((f) => ({ ...f })), names = layer.geom === 'pg' ? ['AREA', 'PERIMETER'] : layer.geom === 'ln' ? ['LENGTH'] : ['X', 'Y'];
  const ours = names.map((n) => { const m = freshName(fields, n); fields.push({ name: m, type: 'number' }); return m; });
  const features = layer.features.map((f) => {
    const p = plain(f.p), m = measureFeature(f.g);
    if (layer.geom === 'pg') { p[ours[0]] = m.area ?? null; p[ours[1]] = m.perimeter ?? null; } else if (layer.geom === 'ln') p[ours[0]] = m.length ?? null; else { p[ours[0]] = m.x ?? null; p[ours[1]] = m.y ?? null; }
    return { g: f.g, p };
  });
  return { name: layer.name, geom: layer.geom, fields, features, notes: [] };
}

/** Count, sum, mean, min, max of a number field (or just the count when field is null), grouped by a field when given. */
export function statistics(layer, field, by = null) {
  const fd = field ? layer.fields.find((f) => f.name === field) : null;
  if (field && !fd) return { error: { code: 'field', name: field } };
  if (by && !layer.fields.some((f) => f.name === by)) return { error: { code: 'field', name: by } };
  if (fd && fd.type !== 'number') return { error: { code: 'notnumber', name: field } };
  const groups = new Map();
  for (const f of layer.features) {
    const key = by ? (f.p[by] === null || f.p[by] === undefined || f.p[by] === '' ? '' : String(f.p[by])) : '';
    let s = groups.get(key); if (!s) groups.set(key, s = { key, count: 0, n: 0, sum: 0, min: Infinity, max: -Infinity });
    s.count++;
    const v = fd ? f.p[field] : null;
    if (typeof v === 'number' && Number.isFinite(v)) { s.n++; s.sum += v; if (v < s.min) s.min = v; if (v > s.max) s.max = v; }
  }
  const fin = (s) => ({ key: s.key, count: s.count, n: s.n, sum: fd ? s.sum : null, mean: fd && s.n ? s.sum / s.n : null, min: fd && s.n ? s.min : null, max: fd && s.n ? s.max : null });
  const rows = [...groups.values()].map(fin).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const all = { key: '', count: layer.features.length, n: 0, sum: 0, min: Infinity, max: -Infinity };
  for (const s of groups.values()) { all.n += s.n; all.sum += s.sum; if (s.min < all.min) all.min = s.min; if (s.max > all.max) all.max = s.max; }
  return { rows, total: fin(all) };
}

// ----------------------------------------------------------------------------------------------------------------- queries
/**
 * Expression language: fields by name (or "quoted name" / [bracketed name]); numbers, 'text', true, false, null; + - * / ( );
 * = == != <> < <= > >= · contains startswith endswith like ilike (like: % and _) · is [not] null · [not] in (a, b) · between x and y ·
 * and, or, not. Geometry values: $area $perimeter $length $x $y $vertices. Text tests ignore case; = on text is exact.
 */
export function parseQuery(text, fields = []) {
  const src = String(text ?? '');
  const toks = [];
  const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)|'((?:[^']|'')*)'|"((?:[^"]|"")*)"|\[([^\]]*)\]|(\$?[A-Za-z_][A-Za-z0-9_.]*)|(<=|>=|<>|!=|==|[=<>+\-*/(),]))/y;
  let pos = 0;
  while (pos < src.length) {
    if (/^\s*$/.test(src.slice(pos))) break;
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) return { error: { code: 'syntax', pos: pos + (src.slice(pos).match(/^\s*/)[0].length) } };
    const at = m.index + m[0].length - m[0].trimStart().length;
    if (m[1] !== undefined) toks.push({ k: 'num', v: parseFloat(m[1]), at });
    else if (m[2] !== undefined) toks.push({ k: 'str', v: m[2].replace(/''/g, "'"), at });
    else if (m[3] !== undefined) toks.push({ k: 'id', v: m[3].replace(/""/g, '"'), at, quoted: true });
    else if (m[4] !== undefined) toks.push({ k: 'id', v: m[4], at, quoted: true });
    else if (m[5] !== undefined) toks.push({ k: 'word', v: m[5], at });
    else toks.push({ k: 'op', v: m[6], at });
    pos = re.lastIndex;
  }
  const names = new Map(fields.map((f) => [f.name.toLowerCase(), f]));
  let i = 0;
  const fail = (code, extra = {}) => { throw Object.assign(new Error(code), { q: { code, pos: toks[i]?.at ?? src.length, ...extra } }); };
  const peekWord = (w) => toks[i]?.k === 'word' && toks[i].v.toLowerCase() === w;
  const eatWord = (w) => { if (peekWord(w)) { i++; return true; } return false; };
  const peekOp = (o) => toks[i]?.k === 'op' && toks[i].v === o;
  const eatOp = (o) => { if (peekOp(o)) { i++; return true; } return false; };
  const WORDOPS = new Set(['contains', 'startswith', 'endswith', 'like', 'ilike', 'is', 'in', 'not', 'between', 'and', 'or']);

  let depth = 0;
  const deep = (fn) => { if (++depth > 60) fail('syntax'); try { return fn(); } finally { depth--; } };
  const orE = () => deep(() => { let a = andE(); while (eatWord('or')) { const l = a, r = andE(); a = (f) => truthy(l(f)) || truthy(r(f)); } return a; });
  const andE = () => { let a = notE(); while (eatWord('and')) { const l = a, r = notE(); a = (f) => truthy(l(f)) && truthy(r(f)); } return a; };
  const notE = () => { if (eatWord('not')) { const e = notE(); return (f) => !truthy(e(f)); } return cmpE(); };
  function cmpE() {
    const l = sumE();
    const t = toks[i];
    if (!t) return l;
    if (t.k === 'op' && ['=', '==', '!=', '<>', '<', '<=', '>', '>='].includes(t.v)) {
      i++; const r = sumE(), op = t.v;
      return (f) => compare(op, l(f), r(f));
    }
    if (t.k === 'word') {
      const w = t.v.toLowerCase();
      if (w === 'is') { i++; const neg = eatWord('not'); if (!eatWord('null')) fail('syntax'); return (f) => isNull(l(f)) !== neg; }
      let neg = false;
      if (w === 'not') { const nx = toks[i + 1]; if (nx?.k === 'word' && ['in', 'like', 'ilike', 'contains', 'between'].includes(nx.v.toLowerCase())) { i++; neg = true; } else return l; }
      const w2 = toks[i].v.toLowerCase();
      if (w2 === 'in') {
        i++; if (!eatOp('(')) fail('syntax');
        const list = [sumE()]; while (eatOp(',')) list.push(sumE());
        if (!eatOp(')')) fail('syntax');
        return (f) => { const v = l(f); if (isNull(v)) return false; return list.some((x) => compare('=', v, x(f))) !== neg; };
      }
      if (w2 === 'between') { i++; const a = sumE(); if (!eatWord('and')) fail('syntax'); const b = sumE(); return (f) => { const v = l(f); if (isNull(v)) return false; return (compare('>=', v, a(f)) && compare('<=', v, b(f))) !== neg; }; }
      if (['contains', 'startswith', 'endswith', 'like', 'ilike'].includes(w2)) {
        i++; const r = sumE();
        return (f) => {
          const a = l(f), b = r(f); if (isNull(a) || isNull(b)) return false;
          const s = String(a).toLowerCase(), q = String(b).toLowerCase();
          const ok = w2 === 'contains' ? s.includes(q) : w2 === 'startswith' ? s.startsWith(q) : w2 === 'endswith' ? s.endsWith(q)
            : new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 's').test(s);
          return ok !== neg;
        };
      }
    }
    return l;
  }
  function sumE() { let a = prodE(); for (;;) { if (eatOp('+')) { const l = a, r = prodE(); a = (f) => arith(l(f), r(f), (x, y) => x + y); } else if (eatOp('-')) { const l = a, r = prodE(); a = (f) => arith(l(f), r(f), (x, y) => x - y); } else return a; } }
  function prodE() { let a = unE(); for (;;) { if (eatOp('*')) { const l = a, r = unE(); a = (f) => arith(l(f), r(f), (x, y) => x * y); } else if (eatOp('/')) { const l = a, r = unE(); a = (f) => arith(l(f), r(f), (x, y) => (y === 0 ? null : x / y)); } else return a; } }
  function unE() { if (eatOp('-')) { const e = unE(); return (f) => arith(0, e(f), (x, y) => x - y); } return atom(); }
  function atom() {
    const t = toks[i];
    if (!t) fail('syntax');
    if (t.k === 'op' && t.v === '(') { i++; const e = orE(); if (!eatOp(')')) fail('syntax'); return e; }
    if (t.k === 'num') { i++; return () => t.v; }
    if (t.k === 'str') { i++; return () => t.v; }
    if (t.k === 'word') {
      const w = t.v.toLowerCase();
      if (w === 'true') { i++; return () => true; }
      if (w === 'false') { i++; return () => false; }
      if (w === 'null') { i++; return () => null; }
      if (w[0] === '$') {
        const key = w.slice(1);
        if (!['area', 'perimeter', 'length', 'x', 'y', 'vertices'].includes(key)) fail('geometry', { name: t.v });
        i++;
        return (f) => { if (key === 'vertices') return verts(f.g); const m = f.g ? (f.g.t === 'pg' ? { area: P.area(f.g.c), perimeter: P.perimeter(f.g.c) } : measureFeature(f.g)) : {}; return key === 'area' ? m.area ?? null : key === 'perimeter' ? m.perimeter ?? null : key === 'length' ? m.length ?? null : key === 'x' ? m.x ?? (f.g ? (bbox(f.g).minX + bbox(f.g).maxX) / 2 : null) : m.y ?? (f.g ? (bbox(f.g).minY + bbox(f.g).maxY) / 2 : null); };
      }
      if (WORDOPS.has(w) && !names.has(w)) fail('syntax');
    }
    if (t.k === 'word' && toks[i + 1]?.k === 'op' && toks[i + 1].v === '(' && Object.hasOwn(FUNCS, t.v.toLowerCase())) {
      const name = t.v.toLowerCase(), fn = FUNCS[name];
      i += 2;
      const args = [];
      if (!eatOp(')')) { args.push(orE()); while (eatOp(',')) args.push(orE()); if (!eatOp(')')) fail('syntax'); }
      if (args.length < fn.min || args.length > fn.max) fail('args', { name });
      return (f) => fn.run(...args.map((a) => a(f)));
    }
    if (t.k === 'id' || t.k === 'word') {
      const fd = names.get(t.v.toLowerCase());
      if (!fd) fail('field', { name: t.v });
      i++;
      const nm = fd.name;
      return (f) => { const v = f.p[nm]; return v === undefined ? null : v; };
    }
    fail('syntax');
  }
  try {
    if (!toks.length) return { error: { code: 'empty' } };
    const test = orE();
    if (i < toks.length) fail('syntax');
    return { test: (f) => truthy(test(f)), value: (f) => { const v = test(f); return v === undefined ? null : v; } };
  } catch (e) { if (e.q) return { error: e.q }; throw e; }
}
const isNull = (v) => v === null || v === undefined || v === '';
const truthy = (v) => (typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : !isNull(v));
const num = (v) => (typeof v === 'number' ? v : typeof v === 'boolean' || isNull(v) ? NaN : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN));
function arith(a, b, fn) { const x = num(a), y = num(b); if (!Number.isFinite(x) || !Number.isFinite(y)) return null; const r = fn(x, y); return Number.isFinite(r) ? r : null; }
const text = (v) => (isNull(v) ? '' : typeof v === 'number' ? String(+v.toFixed(10)) : String(v));
const n1 = (fn) => (a) => { const x = num(a); if (!Number.isFinite(x)) return null; const r = fn(x); return Number.isFinite(r) ? r : null; };
const str1 = (fn) => (a) => (isNull(a) ? null : fn(text(a)));
const MAXTEXT = 10000;
/** The field calculator's functions: a fixed table (nothing is evaluated as code). Null in → null out unless said. */
const FUNCS = {
  abs: { min: 1, max: 1, run: n1(Math.abs) },
  floor: { min: 1, max: 1, run: n1(Math.floor) },
  ceil: { min: 1, max: 1, run: n1(Math.ceil) },
  sqrt: { min: 1, max: 1, run: n1(Math.sqrt) },
  round: { min: 1, max: 2, run: (a, d = 0) => { const x = num(a), k = num(d); if (!Number.isFinite(x) || !Number.isFinite(k) || k < 0 || k > 12) return null; const m = 10 ** Math.trunc(k); return Math.round((x + Number.EPSILON * Math.sign(x)) * m) / m; } },
  pow: { min: 2, max: 2, run: (a, b) => arith(a, b, Math.pow) },
  min: { min: 1, max: 20, run: (...v) => { const n = v.map(num); return n.some((x) => !Number.isFinite(x)) ? null : Math.min(...n); } },
  max: { min: 1, max: 20, run: (...v) => { const n = v.map(num); return n.some((x) => !Number.isFinite(x)) ? null : Math.max(...n); } },
  upper: { min: 1, max: 1, run: str1((s) => s.toUpperCase()) },
  lower: { min: 1, max: 1, run: str1((s) => s.toLowerCase()) },
  trim: { min: 1, max: 1, run: str1((s) => s.trim()) },
  len: { min: 1, max: 1, run: (a) => (isNull(a) ? 0 : text(a).length) },
  substr: { min: 2, max: 3, run: (a, st, n) => { if (isNull(a)) return null; const s0 = num(st), k = n === undefined ? Infinity : num(n); if (!Number.isFinite(s0) || Number.isNaN(k) || k < 0) return null; const from = Math.max(0, Math.trunc(s0) - 1); return text(a).slice(from, Number.isFinite(k) ? from + Math.trunc(k) : undefined); } },   // 1-based start
  left: { min: 2, max: 2, run: (a, n) => { const k = num(n); return isNull(a) || !Number.isFinite(k) || k < 0 ? null : text(a).slice(0, Math.trunc(k)); } },
  right: { min: 2, max: 2, run: (a, n) => { const k = num(n); if (isNull(a) || !Number.isFinite(k) || k < 0) return null; const s = text(a); return k === 0 ? '' : s.slice(-Math.trunc(k)); } },
  replace: { min: 3, max: 3, run: (a, x, y) => (isNull(a) || isNull(x) ? null : text(a).split(text(x)).join(text(y)).slice(0, MAXTEXT)) },
  concat: { min: 1, max: 20, run: (...v) => v.map(text).join('').slice(0, MAXTEXT) },
  coalesce: { min: 1, max: 20, run: (...v) => { for (const x of v) if (!isNull(x)) return x; return null; } },
  if: { min: 3, max: 3, run: (c, a, b) => (truthy(c) ? a : b) },
  str: { min: 1, max: 1, run: str1((s) => s) },
  num: { min: 1, max: 1, run: (a) => { const x = num(a); return Number.isFinite(x) ? x : null; } },
  year: { min: 1, max: 1, run: (a) => datePart(a, 1) },
  month: { min: 1, max: 1, run: (a) => datePart(a, 2) },
  day: { min: 1, max: 1, run: (a) => datePart(a, 3) },
};
function datePart(a, k) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(a ?? '')); return m ? Number(m[k]) : null; }
function compare(op, a, b) {
  if (isNull(a) || isNull(b)) return op === '=' || op === '==' ? isNull(a) && isNull(b) : op === '!=' || op === '<>' ? !(isNull(a) && isNull(b)) : false;
  let c;
  const x = num(a), y = num(b);
  if (typeof a === 'boolean' || typeof b === 'boolean') c = Number(!!a) - Number(!!b);
  else if (Number.isFinite(x) && Number.isFinite(y)) c = x - y;
  else { const s = String(a), t2 = String(b); c = s < t2 ? -1 : s > t2 ? 1 : 0; }
  return op === '=' || op === '==' ? c === 0 : op === '!=' || op === '<>' ? c !== 0 : op === '<' ? c < 0 : op === '<=' ? c <= 0 : op === '>' ? c > 0 : c >= 0;
}

export function selectWhere(layer, text) {
  const q = parseQuery(text, layer.fields);
  if (q.error) return q;
  const indices = [];
  layer.features.forEach((f, i) => { if (q.test(f)) indices.push(i); });
  return { indices };
}

/** The layer holding only some features (by index). */
export function subset(layer, indices, name) {
  return { name: name || layer.name, geom: layer.geom, fields: layer.fields.map((f) => ({ ...f })), features: indices.map((i) => ({ g: layer.features[i].g, p: plain(layer.features[i].p) })), notes: [] };
}

// ------------------------------------------------------------------------------------------------------------------ buffer
export function bufferGeometry(g, dist, quarter = 8) {
  if (!g) return [];
  if (g.t === 'pt') return dist > 0 ? P.bufferPoint(g.c, dist, quarter) : [];
  if (g.t === 'ln') return dist > 0 ? P.bufferLine(g.c, dist, quarter) : [];
  return P.bufferMulti(g.c, dist, quarter);
}

export function bufferLayer(layer, dist, { quarter = 8, dissolve: diss = false, field = null } = {}) {
  const fd = field ? layer.fields.find((f) => f.name === field) : null;
  if (field && (!fd || fd.type !== 'number')) return { error: { code: 'distfield', name: field } };
  if (!field && !(Number.isFinite(dist) && dist !== 0)) return { error: { code: 'dist' } };
  if (!field && dist < 0 && layer.geom !== 'pg') return { error: { code: 'negative' } };
  const notes = [];
  let skipped = 0, empty = 0, outFeatures = [];
  const q = Math.max(1, Math.min(32, quarter | 0));
  for (const f of layer.features) {
    const d = field ? f.p[field] : dist;
    if (typeof d !== 'number' || !Number.isFinite(d) || d === 0 || (d < 0 && layer.geom !== 'pg')) { skipped++; continue; }
    if (verts(f.g) > MAX_VERTS) { skipped++; continue; }
    const m = bufferGeometry(f.g, d, q);
    if (!m.length) { empty++; continue; }
    const p = plain(f.p);
    outFeatures.push({ g: { t: 'pg', c: m }, p, d });
  }
  if (skipped) notes.push({ code: 'skipped', n: skipped });
  if (empty) notes.push({ code: 'vanished', n: empty });
  if (diss) {
    const m = P.unionAll(outFeatures.map((f) => f.g.c));
    const p = props(); p.COUNT = outFeatures.length;
    return { name: layer.name, geom: 'pg', fields: [{ name: 'COUNT', type: 'number' }], features: m.length ? [{ g: { t: 'pg', c: m }, p }] : [], notes };
  }
  const fields = layer.fields.map((f) => ({ ...f }));
  const dn = freshName(fields, 'BUFF_DIST');
  fields.push({ name: dn, type: 'number' });
  outFeatures = outFeatures.map((f) => { f.p[dn] = f.d; return { g: f.g, p: f.p }; });
  return { name: layer.name, geom: 'pg', fields, features: outFeatures, notes };
}

// ---------------------------------------------------------------------------------------------------------------- overlay
function indexOf(features) {
  const boxes = features.map((f) => bbox(f.g));
  return (b, pad = 0) => { const out = []; for (let i = 0; i < boxes.length; i++) if (near(boxes[i], b, pad)) out.push(i); return out; };
}
function merged(a, b) {
  const fields = a.fields.map((f) => ({ ...f }));
  const map = new Map();
  for (const f of b.fields) { const n = freshName(fields, f.name); fields.push({ name: n, type: f.type }); map.set(f.name, n); }
  return { fields, map };
}
const MINAREA = 1e-9;

export function overlay(a, b, op, { keepAll = true } = {}) {
  if (!['intersect', 'union', 'erase'].includes(op)) return { error: { code: 'op' } };
  if (b.geom !== 'pg') return { error: { code: 'needpoly', which: 'b' } };
  if (op !== 'intersect' && a.geom !== 'pg') return { error: { code: 'needpoly', which: 'a' } };
  if (a.features.length * b.features.length > MAX_PAIRS * 25) return { error: { code: 'toobig' } };
  const notes = [];
  const idx = indexOf(b.features), { fields: mf, map } = merged(a, b);
  const out = [];
  const aOnly = (f) => plain(f.p);
  const bProps = (bf, p) => { for (const [k, v] of Object.entries(bf.p)) p[map.get(k) ?? k] = v; return p; };
  const aProps = (af) => plain(af.p);
  let dropped = 0;
  for (const af of a.features) {
    if (!af.g) continue;
    const cand = idx(bbox(af.g));
    if (op === 'erase') {
      let m = toMulti(af.g);
      if (cand.length) m = P.difference(m, P.unionAll(cand.map((j) => toMulti(b.features[j].g))));
      if (!m.length || P.area(m) <= MINAREA) { dropped++; continue; }
      out.push({ g: { t: 'pg', c: m }, p: aOnly(af) });
      continue;
    }
    let restM = af.g.t === 'pg' ? af.g.c : null;
    for (const j of cand) {
      const bg = b.features[j].g;
      let piece = null;
      if (af.g.t === 'pg') { const m = P.intersect(af.g.c, bg.c); if (m.length && P.area(m) > MINAREA) piece = { t: 'pg', c: m }; }
      else if (af.g.t === 'pt') { if (geomWithin(af.g, bg)) piece = af.g; }
      else { const r = P.clipLine(af.g.c, bg.c).inside; if (r.length) piece = { t: 'ln', c: r }; }
      if (piece) out.push({ g: piece, p: bProps(b.features[j], aProps(af)) });
    }
    if (op === 'union' && restM) {
      const rest = cand.length ? P.difference(restM, P.unionAll(cand.map((j) => toMulti(b.features[j].g)))) : restM;
      if (rest.length && P.area(rest) > MINAREA) out.push({ g: { t: 'pg', c: rest }, p: aProps(af) });
    }
  }
  if (op === 'union') {
    const aIdx = indexOf(a.features);
    for (const bf of b.features) {
      if (!bf.g) continue;
      const cand = aIdx(bbox(bf.g));
      const rest = cand.length ? P.difference(bf.g.c, P.unionAll(cand.map((j) => toMulti(a.features[j].g)))) : bf.g.c;
      if (rest.length && P.area(rest) > MINAREA) { const p = props(); for (const f of mf) p[f.name] = null; out.push({ g: { t: 'pg', c: rest }, p: bProps(bf, p) }); }
    }
  }
  if (dropped) notes.push({ code: 'erased', n: dropped });
  const fields = op === 'erase' ? a.fields.map((f) => ({ ...f })) : mf;
  for (const f of out) if (op !== 'erase') for (const fd of fields) if (!(fd.name in f.p)) f.p[fd.name] = null;
  return { name: a.name, geom: op === 'intersect' ? a.geom : 'pg', fields, features: out, notes };
}

export function dissolve(layer, field = null) {
  if (layer.geom !== 'pg') return { error: { code: 'needpoly', which: 'a' } };
  if (field && !layer.fields.some((f) => f.name === field)) return { error: { code: 'field', name: field } };
  const groups = new Map();
  for (const f of layer.features) {
    if (!f.g) continue;
    const key = field ? (isNull(f.p[field]) ? '' : f.p[field]) : '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f.g.c);
  }
  const fd = field ? layer.fields.find((f) => f.name === field) : null;
  const fields = [...(fd ? [{ ...fd }] : []), { name: 'COUNT', type: 'number' }, { name: 'AREA', type: 'number' }];
  const features = [];
  for (const [key, list] of groups) {
    const m = P.unionAll(list), p = props();
    if (fd) p[fd.name] = key === '' ? null : key;
    p.COUNT = list.length; p.AREA = P.area(m);
    features.push({ g: { t: 'pg', c: m }, p });
  }
  return { name: layer.name, geom: 'pg', fields, features, notes: [] };
}

// ----------------------------------------------------------------------------------------------------------------- joins
/**
 * relation: 'intersects' | 'within' (the target feature lies inside the source polygon) | 'contains' (it holds the source feature) |
 *           'nearest' (the closest source feature; with distance > 0 only within it) | 'within-distance' (every source feature within distance)
 * mode:     'first' (the first / nearest match's attributes) | 'summary' (COUNT and, per number field in `fields`, SUM / MEAN / MIN / MAX)
 * keep:     keep target features with no match (their joined fields empty; COUNT 0)
 */
export function spatialJoin(target, source, { relation = 'intersects', distance = 0, mode = 'first', fields: pick = null, keep = true } = {}) {
  if (!['intersects', 'within', 'contains', 'nearest', 'within-distance'].includes(relation)) return { error: { code: 'relation' } };
  if ((relation === 'within') && source.geom !== 'pg') return { error: { code: 'needpoly', which: 'b' } };
  if ((relation === 'contains') && target.geom !== 'pg') return { error: { code: 'needpoly', which: 'a' } };
  if ((relation === 'within-distance' || relation === 'nearest' && distance) && !(distance >= 0)) return { error: { code: 'dist' } };
  if (relation === 'within-distance' && !(distance > 0)) return { error: { code: 'dist' } };
  if (target.features.length * source.features.length > MAX_PAIRS) return { error: { code: 'toobig' } };
  const srcFields = pick ? source.fields.filter((f) => pick.includes(f.name)) : source.fields;
  const outFields = target.fields.map((f) => ({ ...f }));
  const notes = [];
  const idx = indexOf(source.features);
  const reach = relation === 'nearest' ? (distance || Infinity) : relation === 'within-distance' ? distance : 1e-9;
  const matches = target.features.map((tf) => {
    if (!tf.g) return [];
    const bb = bbox(tf.g);
    const cand = reach === Infinity ? source.features.map((_, i) => i) : idx(bb, reach);
    const hits = [];
    for (const j of cand) {
      const sg = source.features[j].g;
      if (!sg) continue;
      if (relation === 'intersects') { if (geomDistance(tf.g, sg) <= 1e-9) hits.push({ j, d: 0 }); }
      else if (relation === 'within') { if (geomWithin(tf.g, sg)) hits.push({ j, d: 0 }); }
      else if (relation === 'contains') { if (geomWithin(sg, tf.g)) hits.push({ j, d: 0 }); }
      else { const d = geomDistance(tf.g, sg); if (relation === 'nearest' ? d <= reach : d <= distance) hits.push({ j, d }); }
    }
    hits.sort((p, q) => p.d - q.d || p.j - q.j);
    return relation === 'nearest' ? hits.slice(0, 1) : hits;
  });
  let joined;
  if (mode === 'summary') {
    const cn = freshName(outFields, 'COUNT'); outFields.push({ name: cn, type: 'number' });
    const nums = srcFields.filter((f) => f.type === 'number');
    const stat = nums.map((f) => ['SUM', 'MEAN', 'MIN', 'MAX'].map((s) => { const n = freshName(outFields, s + '_' + f.name); outFields.push({ name: n, type: 'number' }); return n; }));
    if (relation === 'nearest') { const dn = freshName(outFields, 'DISTANCE'); outFields.push({ name: dn, type: 'number' }); }
    joined = (tf, hits, p) => {
      p[cn] = hits.length;
      nums.forEach((f, k) => {
        const vals = hits.map((h) => source.features[h.j].p[f.name]).filter((v) => typeof v === 'number' && Number.isFinite(v));
        const [sn, mn, lo, hi] = stat[k];
        p[sn] = vals.length ? vals.reduce((s, v) => s + v, 0) : null; p[mn] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
        p[lo] = vals.length ? Math.min(...vals) : null; p[hi] = vals.length ? Math.max(...vals) : null;
      });
      if (relation === 'nearest') p[outFields[outFields.length - 1].name] = hits.length ? hits[0].d : null;
    };
  } else {
    const map = new Map();
    for (const f of srcFields) { const n = freshName(outFields, f.name); outFields.push({ name: n, type: f.type }); map.set(f.name, n); }
    const dn = relation === 'nearest' ? freshName(outFields, 'DISTANCE') : null;
    if (dn) outFields.push({ name: dn, type: 'number' });
    const cn = freshName(outFields, 'JOIN_COUNT'); outFields.push({ name: cn, type: 'number' });
    joined = (tf, hits, p) => {
      for (const n of map.values()) p[n] = null;
      if (dn) p[dn] = null;
      p[cn] = hits.length;
      if (!hits.length) return;
      const s = source.features[hits[0].j];
      for (const [k, n] of map) p[n] = s.p[k] === undefined ? null : s.p[k];
      if (dn) p[dn] = hits[0].d;
    };
  }
  const features = [];
  let unmatched = 0;
  target.features.forEach((tf, i) => {
    if (!matches[i].length) unmatched++;
    if (!matches[i].length && !keep) return;
    const p = plain(tf.p);
    joined(tf, matches[i], p);
    features.push({ g: tf.g, p });
  });
  if (unmatched) notes.push({ code: keep ? 'unmatched' : 'dropped', n: unmatched });
  if (relation === 'nearest' && !distance && source.features.length === 0) notes.push({ code: 'emptysource' });
  return { name: target.name, geom: target.geom, fields: outFields, features, notes };
}

export { FIELD_TYPES };
