/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout.js — the one in-memory layout model that the GDSII and OASIS readers fill and the writers read, plus hierarchy, bounding boxes,
 * statistics and the plan of a fast view (cell bounding boxes, level of detail, culling, instanced cells).
 *
 * lib  = { name, userPerDb, metersPerDb, cells: { name: Cell }, order: [names], props? }       coordinates: integer database units
 * Cell = { name, shapes: ShapeStore, refs: [Ref], texts: [Text], props? }
 * Ref  = { cell, x, y, flip, angle (degrees), mag, rep?, props? }   rep = { kind: 'lattice', nx, ny, ax: [dx, dy], ay: [dx, dy] } | { kind: 'list', d: [dx0, dy0, dx1, dy1, …] }
 * Text = { text, layer, texttype, x, y, flip?, angle?, mag?, pres?, width?, rep?, props? }
 * Shapes are kept column-wise (typed arrays) so a million of them stay small: kind 0 polygon (open ring, no repeated first point),
 * 1 path (centre line + width, pathtype, begin/end extensions), 2 box (GDSII BOX, 4 points). Per-shape extras (properties, repetitions,
 * path extensions) live in sparse maps.
 */
export const POLY = 0, PATH = 1, BOX = 2;
const KIND = ['poly', 'path', 'box'];

export class ShapeStore {
  constructor(cap = 64) { this.n = 0; this.kind = new Uint8Array(cap); this.layer = new Uint16Array(cap); this.dt = new Uint16Array(cap); this.width = new Int32Array(cap); this.off = new Uint32Array(cap + 1); this.xy = new Int32Array(cap * 8); this.nxy = 0; this.ext = new Map(); this.props = new Map(); this.rep = new Map(); }
  grow(nShapes, nInts) {
    if (nShapes > this.kind.length) { const c = Math.max(nShapes, this.kind.length * 2); for (const k of ['kind', 'layer', 'dt', 'width']) { const a = new this[k].constructor(c); a.set(this[k]); this[k] = a; } const o = new Uint32Array(c + 1); o.set(this.off); this.off = o; }
    if (nInts > this.xy.length) { const a = new Int32Array(Math.max(nInts, this.xy.length * 2)); a.set(this.xy.subarray(0, this.nxy)); this.xy = a; }
  }
  /** Start a shape; then push coordinates with pt(); end with end(). Returns the index. */
  begin(kind, layer, dt, width = 0) { const i = this.n; this.grow(i + 1, 0); this.kind[i] = kind; this.layer[i] = layer; this.dt[i] = dt; this.width[i] = width; this.off[i] = this.nxy; return i; }
  pt(x, y) { if (this.nxy + 2 > this.xy.length) this.grow(0, this.nxy + 2); this.xy[this.nxy++] = x; this.xy[this.nxy++] = y; }
  end() { this.n++; this.off[this.n] = this.nxy; return this.n - 1; }
  /** Add a shape from a flat coordinate list. */
  add(kind, layer, dt, xy, width = 0) { this.begin(kind, layer, dt, width); this.grow(0, this.nxy + xy.length); for (let k = 0; k < xy.length; k++) this.xy[this.nxy++] = xy[k]; return this.end(); }
  count(i) { return (this.off[i + 1] - this.off[i]) >> 1; }
  coords(i) { return this.xy.subarray(this.off[i], this.off[i + 1]); }
  /** One shape as a plain object (for tests and small tools; the readers and views use the arrays). */
  get(i) {
    const o = { kind: KIND[this.kind[i]], layer: this.layer[i], datatype: this.dt[i], xy: Array.from(this.coords(i)) };
    if (this.kind[i] === PATH) { o.width = this.width[i]; const e = this.ext.get(i); if (e) Object.assign(o, e); }
    if (this.props.has(i)) o.props = this.props.get(i); if (this.rep.has(i)) o.rep = this.rep.get(i); return o;
  }
  bbox(i, out = [0, 0, 0, 0]) {
    const a = this.off[i], b = this.off[i + 1], xy = this.xy; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let k = a; k < b; k += 2) { const x = xy[k], y = xy[k + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (this.kind[i] === PATH) { const e = this.ext.get(i), hw = Math.abs(this.width[i]) / 2 + Math.max(0, e?.bgnext || 0, e?.endext || 0, e?.pathtype === 2 || e?.pathtype === 1 ? Math.abs(this.width[i]) / 2 : 0); x0 -= hw; y0 -= hw; x1 += hw; y1 += hw; }
    const r = this.rep.get(i); if (r) { const e = repExtent(r); x0 += e[0]; y0 += e[1]; x1 += e[2]; y1 += e[3]; }
    out[0] = x0; out[1] = y0; out[2] = x1; out[3] = y1; return out;
  }
  /** Shrink the arrays to their content (after reading). */
  trim() { for (const k of ['kind', 'layer', 'dt', 'width']) this[k] = this[k].slice(0, this.n); this.off = this.off.slice(0, this.n + 1); this.xy = this.xy.slice(0, this.nxy); return this; }
}

export function newLib(name = 'lib', { userPerDb = 0.001, metersPerDb = 1e-9 } = {}) { return { name, userPerDb, metersPerDb, cells: {}, order: [] }; }
export function newCell(lib, name) { const c = { name, shapes: new ShapeStore(), refs: [], texts: [] }; if (!lib.cells[name]) lib.order.push(name); lib.cells[name] = c; return c; }

// ---------------------------------------------------------------- repetitions and transforms
export function repCount(r) { return !r ? 1 : r.kind === 'lattice' ? r.nx * r.ny : r.d.length >> 1; }
/** Every offset of a repetition (the first is [0, 0] for a lattice; a list gives its own). */
export function* repOffsets(r) {
  if (!r) { yield [0, 0]; return; }
  if (r.kind === 'lattice') { for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) yield [i * r.ax[0] + j * r.ay[0], i * r.ax[1] + j * r.ay[1]]; return; }
  for (let k = 0; k < r.d.length; k += 2) yield [r.d[k], r.d[k + 1]];
}
export function repExtent(r) { let x0 = 0, y0 = 0, x1 = 0, y1 = 0; if (r.kind === 'lattice') { for (const [i, j] of [[r.nx - 1, 0], [0, r.ny - 1], [r.nx - 1, r.ny - 1]]) { const x = i * r.ax[0] + j * r.ay[0], y = i * r.ax[1] + j * r.ay[1]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } } else for (let k = 0; k < r.d.length; k += 2) { x0 = Math.min(x0, r.d[k]); x1 = Math.max(x1, r.d[k]); y0 = Math.min(y0, r.d[k + 1]); y1 = Math.max(y1, r.d[k + 1]); } return [x0, y0, x1, y1]; }

/** A placement's matrix [a, b, c, d, e, f] (x' = a·x + c·y + e, y' = b·x + d·y + f): mirror about x first, then magnify, rotate and move. */
export function refMatrix(r, dx = 0, dy = 0) {
  const t = (r.angle || 0) * Math.PI / 180, m = r.mag ?? 1, s = r.flip ? -1 : 1;
  let c = Math.cos(t), n = Math.sin(t); if (Math.abs(c) < 1e-15) c = 0; if (Math.abs(n) < 1e-15) n = 0; // exact quarter turns
  return [m * c, m * n, -m * n * s, m * c * s, r.x + dx, r.y + dy];
}
export const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
export const IDENT = [1, 0, 0, 1, 0, 0];
export function apply(M, x, y) { return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; }
export function invert(M) { const det = M[0] * M[3] - M[1] * M[2]; const a = M[3] / det, b = -M[1] / det, c = -M[2] / det, d = M[0] / det; return [a, b, c, d, -(a * M[4] + c * M[5]), -(b * M[4] + d * M[5])]; }
export function boxThrough(M, b) { const p = [apply(M, b[0], b[1]), apply(M, b[2], b[1]), apply(M, b[2], b[3]), apply(M, b[0], b[3])]; return [Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))]; }
const union = (a, b) => (!a ? b : !b ? a : [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);

// ---------------------------------------------------------------- hierarchy
/** Cells nobody places (the top cells), in file order. */
export function topCells(lib) { const used = new Set(); for (const n of lib.order) for (const r of lib.cells[n].refs) used.add(r.cell); return lib.order.filter((n) => !used.has(n)); }
/** Cells that place themselves through a chain: [[A, B, A], …]. */
export function findLoops(lib) {
  const out = [], state = new Map();
  const dfs = (n, path) => { state.set(n, 1); for (const r of lib.cells[n]?.refs || []) { if (!lib.cells[r.cell]) continue; const s = state.get(r.cell); if (s === 1) out.push([...path.slice(path.indexOf(r.cell)), r.cell]); else if (!s) dfs(r.cell, [...path, r.cell]); } state.set(n, 2); };
  for (const n of lib.order) if (!state.get(n)) dfs(n, [n]);
  return out;
}
/** Tree for the hierarchy panel: { name, placed (times inside its parent, repetitions counted), children } — children grouped by cell. */
export function hierarchyTree(lib, top, { maxDepth = 64 } = {}) {
  const walk = (name, placed, depth, stack) => {
    const node = { name, placed, missing: !lib.cells[name], children: [] }; const c = lib.cells[name]; if (!c) return node;
    if (depth >= maxDepth || stack.includes(name)) { node.loop = stack.includes(name); return node; }
    const by = new Map(); for (const r of c.refs) by.set(r.cell, (by.get(r.cell) || 0) + repCount(r.rep));
    for (const [k, v] of by) node.children.push(walk(k, v, depth + 1, [...stack, name]));
    return node;
  };
  return walk(top, 1, 0, []);
}
/** Bounding box of every cell in database units, children included (null for an empty cell). */
export function cellBBoxes(lib) {
  const out = new Map(), busy = new Set(), tmp = [0, 0, 0, 0];
  const bb = (name) => {
    if (out.has(name)) return out.get(name); const c = lib.cells[name]; if (!c || busy.has(name)) return null; busy.add(name);
    let b = null; const S = c.shapes;
    for (let i = 0; i < S.n; i++) { S.bbox(i, tmp); b = union(b, tmp.slice()); }
    for (const t of c.texts) { let tb = [t.x, t.y, t.x, t.y]; if (t.rep) { const e = repExtent(t.rep); tb = [t.x + e[0], t.y + e[1], t.x + e[2], t.y + e[3]]; } b = union(b, tb); }
    for (const r of c.refs) { const cb = bb(r.cell); if (!cb) continue; let rb = boxThrough(refMatrix(r), cb); if (r.rep) { const e = repExtent(r.rep); rb = [rb[0] + e[0], rb[1] + e[1], rb[2] + e[2], rb[3] + e[3]]; } b = union(b, rb); }
    busy.delete(name); out.set(name, b); return b;
  };
  for (const n of lib.order) bb(n);
  return out;
}
/** Counts: cells, placements, stored shapes, flat shapes (everything placed out), per layer/datatype. */
export function layoutStats(lib, top) {
  const memo = new Map();
  const flat = (name, stack = []) => { // Map 'layer/dt' → flat count
    if (memo.has(name)) return memo.get(name); const c = lib.cells[name], m = new Map(); if (!c || stack.includes(name)) return m;
    const S = c.shapes; for (let i = 0; i < S.n; i++) { const k = S.layer[i] + '/' + S.dt[i]; m.set(k, (m.get(k) || 0) + repCount(S.rep.get(i))); }
    for (const r of c.refs) { const n = repCount(r.rep); for (const [k, v] of flat(r.cell, [...stack, name])) m.set(k, (m.get(k) || 0) + v * n); }
    memo.set(name, m); return m;
  };
  let stored = 0, refs = 0, texts = 0; const storedBy = new Map();
  for (const n of lib.order) { const c = lib.cells[n]; stored += c.shapes.n; refs += c.refs.length; texts += c.texts.length; for (let i = 0; i < c.shapes.n; i++) { const k = c.shapes.layer[i] + '/' + c.shapes.dt[i]; storedBy.set(k, (storedBy.get(k) || 0) + 1); } }
  const f = top ? flat(top) : new Map(); let flatShapes = 0; for (const v of f.values()) flatShapes += v;
  const layers = [...new Set([...storedBy.keys(), ...f.keys()])].map((k) => { const [l, d] = k.split('/').map(Number); return { layer: l, datatype: d, stored: storedBy.get(k) || 0, flat: f.get(k) || 0 }; }).sort((a, b) => a.layer - b.layer || a.datatype - b.datatype);
  return { cells: lib.order.length, refs, texts, stored, flatShapes, layers };
}

/** Every shape of a cell placed out to polygons in user units (paths as outlines): [{ layer, datatype, poly: [[x, y], …] }]. For checks and small cells. */
export function flattenCell(lib, name, { max = 2e6 } = {}) {
  const out = [], k = lib.userPerDb, problems = [];
  const walk = (cn, M, stack) => {
    const c = lib.cells[cn]; if (!c) return; if (stack.includes(cn)) { problems.push('loop:' + cn); return; }
    const S = c.shapes;
    for (let i = 0; i < S.n; i++) for (const [dx, dy] of repOffsets(S.rep.get(i))) {
      if (out.length >= max) return;
      const p = S.kind[i] === PATH ? pathOutline(S.get(i)) : toPts(S.coords(i));
      out.push({ layer: S.layer[i], datatype: S.dt[i], poly: p.map(([x, y]) => { const q = apply(M, x + dx, y + dy); return [q[0] * k, q[1] * k]; }) });
    }
    for (const r of c.refs) for (const [dx, dy] of repOffsets(r.rep)) walk(r.cell, mul(M, refMatrix(r, dx, dy)), [...stack, cn]);
  };
  walk(name, IDENT, []); return { shapes: out, problems };
}
const toPts = (xy) => { const p = []; for (let i = 0; i < xy.length; i += 2) p.push([xy[i], xy[i + 1]]); return p; };
/** Outline of a path: flush ends (pathtype 0), half-width ends (2, and 1 = round, drawn square), or given extensions (4). */
export function pathOutline(e) {
  const pts = toPts(e.xy), hw = Math.abs(e.width) / 2; if (pts.length < 2 || !hw) return pts;
  const b = e.pathtype === 4 ? (e.bgnext || 0) : e.pathtype === 2 || e.pathtype === 1 ? hw : 0, en = e.pathtype === 4 ? (e.endext || 0) : e.pathtype === 2 || e.pathtype === 1 ? hw : 0;
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)]; let dx = c[0] - a[0], dy = c[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    let px = p[0], py = p[1]; if (i === 0) { px -= dx * b; py -= dy * b; } if (i === pts.length - 1) { px += dx * en; py += dy * en; }
    let nx = -dy, ny = dx;
    if (i > 0 && i < pts.length - 1) { const d1 = [p[0] - a[0], p[1] - a[1]], d2 = [c[0] - p[0], c[1] - p[1]], l1 = Math.hypot(...d1) || 1, l2 = Math.hypot(...d2) || 1, n1 = [-d1[1] / l1, d1[0] / l1], n2 = [-d2[1] / l2, d2[0] / l2], sx = n1[0] + n2[0], sy = n1[1] + n2[1], sl = Math.hypot(sx, sy) || 1, cs = (n1[0] * sx + n1[1] * sy) / sl; nx = sx / sl / Math.max(0.2, cs); ny = sy / sl / Math.max(0.2, cs); }
    L.push([px + nx * hw, py + ny * hw]); R.push([px - nx * hw, py - ny * hw]);
  }
  return [...L, ...R.reverse()];
}

/** Hand a layout to lib/pcb's flatten / layoutDrc (its model: elements with pts [[x, y]…], boundaries closed). */
export function toPcbLib(lib) {
  const cells = {};
  for (const n of lib.order) {
    const c = lib.cells[n], el = [], S = c.shapes;
    for (let i = 0; i < S.n; i++) for (const [dx, dy] of repOffsets(S.rep.get(i))) { const p = toPts(S.coords(i)).map(([x, y]) => [x + dx, y + dy]); const k = S.kind[i]; el.push({ type: k === PATH ? 'path' : k === BOX ? 'box' : 'boundary', layer: S.layer[i], datatype: S.dt[i], pts: k === POLY ? [...p, p[0]] : k === BOX ? [...p, p[0]] : p, width: S.width[i], pathtype: S.ext.get(i)?.pathtype || 0, strans: 0, mag: 1, angle: 0 }); }
    for (const r of c.refs) for (const [dx, dy] of repOffsets(r.rep)) el.push({ type: 'sref', ref: r.cell, pts: [[r.x + dx, r.y + dy]], layer: 0, datatype: 0, width: 0, pathtype: 0, strans: r.flip ? 0x8000 : 0, mag: r.mag ?? 1, angle: r.angle || 0 });
    for (const t of c.texts) el.push({ type: 'text', layer: t.layer, datatype: t.texttype, text: t.text, pts: [[t.x, t.y]], width: 0, pathtype: 0, strans: 0, mag: 1, angle: 0 });
    cells[n] = { name: n, elements: el };
  }
  return { name: lib.name, userPerDb: lib.userPerDb, metersPerDb: lib.metersPerDb, cells, order: [...lib.order] };
}

/** A copy of the layout with every shape repetition written out as separate shapes (what a GDSII file holds). */
export function expandShapeReps(lib) {
  const out = newLib(lib.name, lib); out.order = [...lib.order];
  for (const n of lib.order) {
    const c = lib.cells[n], S = c.shapes, T = new ShapeStore(S.n + 8);
    for (let i = 0; i < S.n; i++) for (const [dx, dy] of repOffsets(S.rep.get(i))) {
      const xy = S.coords(i), j = T.begin(S.kind[i], S.layer[i], S.dt[i], S.width[i]); T.grow(0, T.nxy + xy.length); for (let k = 0; k < xy.length; k += 2) { T.xy[T.nxy++] = xy[k] + dx; T.xy[T.nxy++] = xy[k + 1] + dy; } T.end();
      if (S.ext.has(i)) T.ext.set(j, S.ext.get(i)); if (S.props.has(i)) T.props.set(j, S.props.get(i));
    }
    out.cells[n] = { ...c, shapes: T.trim(), texts: c.texts.flatMap((t) => (t.rep ? [...repOffsets(t.rep)].map(([dx, dy]) => { const { rep, ...u } = t; return { ...u, x: t.x + dx, y: t.y + dy }; }) : [t])) };
  }
  return out;
}

/** The layout as plain data (for comparing two reads). */
export function plainLib(lib) {
  const cells = {};
  for (const n of lib.order) { const c = lib.cells[n], S = c.shapes, sh = []; for (let i = 0; i < S.n; i++) sh.push(S.get(i)); cells[n] = { shapes: sh, refs: c.refs, texts: c.texts, props: c.props }; }
  return { name: lib.name, userPerDb: lib.userPerDb, metersPerDb: lib.metersPerDb, order: lib.order, cells };
}
