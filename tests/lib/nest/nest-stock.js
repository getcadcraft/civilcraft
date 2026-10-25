/* SPDX-License-Identifier: Apache-2.0 */
/**
 * nest-stock.js — offcut stock for the nesting engine (0.7 SU.755, session `make-07`): after a nest, what is left of each plate
 * becomes a numbered remnant in a stock list; the next nest uses the remnants first, then full plates. DOM-free; imports only
 * nest.js. Canonical here (lib/nest); the copies in PartCraft (partcraft/dev/nest/) and the apparel add-on are written by
 * `node tools/nest/sync.mjs`.
 *
 * The stock list is plain data (`cadcraft-stock` v1), saved with the project file and exported as CSV:
 *   stock = { format, version, next, items: [{ id 'R-0007', number, material, thickness, w, h (the outline's bounding box),
 *             loops (outline first, then holes; local frame: the bounding box's lower left corner is 0,0), area, created
 *             'YYYY-MM-DD', source { job, sheet, parent? }, status 'available' | 'used' | 'scrap', usedIn, note }] }
 *   Units are the caller's (mm or inches), the same as the parts'. Only plates leave remnants (a roll has no leftover plate).
 *
 *   newStock() · cleanStock(untrusted) → stock (every number finite and in range, loops checked, areas recomputed, numbers unique)
 *   leftovers(placed, region, { spacing, minWidth, minArea, res }) → [{ loops, area, w, h, x0, y0, label: { x, y, h } }]
 *       the usable material left on a plate or inside a remnant: a conservative raster of what the parts occupy (grown by the
 *       spacing and one more cell), the free cells opened by minWidth (narrow strips are scrap), joined into regions, traced
 *       into outlines (holes kept) and simplified by half a cell. Outlines lie inside the true leftover (checkRemnants).
 *   nestWithStock(parts, stock, sheet, opts) → job: the parts laid on matching remnants first (smallest first, then the next),
 *       then on new plates of `sheet`; opts = nest()'s + { material, thickness, minWidth, minArea, useStock = true }.
 *       job = { placed, unplaced, sheets, sheetShapes, remnants (made by this job: placed on a sheet index), uses [{ id, placed, area,
 *       efficiency }], plates (new plates used), efficiency, ... } — a nest() result nestDxf() draws.
 *   applyJob(stock, job, { name, date, material, thickness, saveRemnants = true }) → { stock, added, used } — the used remnants become
 *       `used`, the job's leftovers are added with the next numbers (and numbered in the job's own `remnants`, in place, so nestDxf
 *       draws the numbers); the original stock is not touched.
 *   checkRemnants(job, sheet, { spacing }) → [problems]   the exact re-check: no remnant touches a placed part, each lies inside its plate
 *   stockCsv(stock) → CSV text · stockSummary(stock) → [{ material, thickness, count, area }] · jobReport(job, stock) → [{ kind, … }]
 */
import { nest, flatten, regionArea, loopArea, placeLoops, rasterize, checkNest } from './nest.js';

export const STOCK_FORMAT = 'cadcraft-stock';
export const STOCK_VERSION = 1;
export const STATUSES = ['available', 'used', 'scrap'];
const LIMITS = { items: 20000, loops: 40, points: 20000, text: 80 };

export const newStock = () => ({ format: STOCK_FORMAT, version: STOCK_VERSION, next: 1, items: [] });
export const stockId = (n) => 'R-' + String(n).padStart(4, '0');

// ------------------------------------------------------------------------------------------------ the stock list

const fin = (v, lo = -1e9, hi = 1e9) => { const n = Number(v); return typeof v !== 'boolean' && Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const txt = (s, max = LIMITS.text) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

function cleanLoop(l) {
  if (!Array.isArray(l) || l.length < 3 || l.length > LIMITS.points) return null;
  const out = [];
  for (const p of l) {
    const x = fin(p?.x), y = fin(p?.y);
    if (x === null || y === null) return null;
    const b = p?.b === undefined ? 0 : fin(p.b, -1e3, 1e3);
    if (b === null) return null;
    out.push(b ? { x, y, b } : { x, y });
  }
  return out;
}
const boxOf = (loops) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of flatten(loops[0], 1e-3)) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x0, y0, x1, y1 };
};

export function cleanStock(obj) {
  const out = newStock();
  if (!obj || typeof obj !== 'object' || obj.format !== STOCK_FORMAT) return out;
  const seen = new Set();
  let max = 0;
  for (const it of (Array.isArray(obj.items) ? obj.items : []).slice(0, LIMITS.items)) {
    const number = fin(it?.number, 1, 9999999);
    if (number === null || !Number.isInteger(number) || seen.has(number)) continue;
    const loops = (Array.isArray(it.loops) ? it.loops : []).slice(0, LIMITS.loops).map(cleanLoop);
    if (!loops.length || loops.some((l) => !l)) continue;
    const area = regionArea(loops);
    if (!(area > 0)) continue;
    const b = boxOf(loops);
    // local frame: the lower left corner of the bounding box is the origin
    const moved = b.x0 !== 0 || b.y0 !== 0 ? loops.map((l) => l.map((p) => ({ ...p, x: p.x - b.x0, y: p.y - b.y0 }))) : loops;
    seen.add(number);
    max = Math.max(max, number);
    const thickness = fin(it.thickness, 0, 1e4);
    out.items.push({
      id: stockId(number), number, kind: 'remnant', material: txt(it.material), thickness: thickness ?? 0,
      w: b.x1 - b.x0, h: b.y1 - b.y0, loops: moved, area,
      created: /^\d{4}-\d{2}-\d{2}$/.test(it.created) ? it.created : '',
      source: { job: txt(it.source?.job), sheet: Math.max(0, Math.floor(fin(it.source?.sheet, 0, 1e6) ?? 0)), ...(Number.isInteger(it.source?.parent) ? { parent: it.source.parent } : {}) },
      status: STATUSES.includes(it.status) ? it.status : 'available', usedIn: txt(it.usedIn), note: txt(it.note, 200),
    });
  }
  out.next = Math.max(max + 1, Math.floor(fin(obj.next, 1, 1e7) ?? 1));
  return out;
}

export const stockToJson = (stock) => JSON.stringify(stock);
export function stockFromJson(text) { try { return cleanStock(JSON.parse(text)); } catch { return newStock(); } }

export function stockSummary(stock) {
  const map = new Map();
  for (const it of stock.items) {
    if (it.status !== 'available') continue;
    const k = it.material + '|' + it.thickness;
    const r = map.get(k) || { material: it.material, thickness: it.thickness, count: 0, area: 0 };
    r.count++; r.area += it.area;
    map.set(k, r);
  }
  return [...map.values()].sort((a, b) => a.material.localeCompare(b.material) || a.thickness - b.thickness);
}

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const num = (v, d = 2) => (Number.isFinite(v) ? String(Math.round(v * 10 ** d) / 10 ** d) : '');
/** The stock list as CSV (CRLF; cells that start = + - @ get a leading '): one row per remnant, in number order. */
export function stockCsv(stock, head = ['Number', 'Status', 'Material', 'Thickness', 'Width', 'Height', 'Area', 'Corners', 'Holes', 'Created', 'Source job', 'Used in', 'Note']) {
  const rows = stock.items.slice().sort((a, b) => a.number - b.number).map((it) => [it.id, it.status, it.material, num(it.thickness, 3), num(it.w), num(it.h), num(it.area, 1), it.loops[0].length, it.loops.length - 1, it.created, it.source.job, it.usedIn, it.note]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

// ------------------------------------------------------------------------------------------------ grid helpers

/** Where an axis-aligned box filter reaches: out[i] = 1 when any cell within k of i along the line is set (clipped to the grid). */
function dilateGrid(g, cols, rows, k) {
  if (k <= 0) return g.slice();
  const tmp = new Uint8Array(cols * rows), out = new Uint8Array(cols * rows);
  // along j for each column
  const pre = new Int32Array(Math.max(cols, rows) + 1);
  for (let i = 0; i < cols; i++) {
    const o = i * rows;
    pre[0] = 0;
    for (let j = 0; j < rows; j++) pre[j + 1] = pre[j] + g[o + j];
    for (let j = 0; j < rows; j++) tmp[o + j] = pre[Math.min(rows, j + k + 1)] - pre[Math.max(0, j - k)] > 0 ? 1 : 0;
  }
  // along i for each row
  for (let j = 0; j < rows; j++) {
    pre[0] = 0;
    for (let i = 0; i < cols; i++) pre[i + 1] = pre[i] + tmp[i * rows + j];
    for (let i = 0; i < cols; i++) out[i * rows + j] = pre[Math.min(cols, i + k + 1)] - pre[Math.max(0, i - k)] > 0 ? 1 : 0;
  }
  return out;
}
const invert = (g) => { const o = new Uint8Array(g.length); for (let i = 0; i < g.length; i++) o[i] = g[i] ? 0 : 1; return o; };

function paint(grid, cols, rows, polys, res) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pl of polys) for (const p of pl) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  if (!Number.isFinite(x0)) return;
  const gx0 = Math.max(0, Math.floor(x0 / res) - 1), gy0 = Math.max(0, Math.floor(y0 / res) - 1);
  const gx1 = Math.min(cols - 1, Math.floor(x1 / res) + 1), gy1 = Math.min(rows - 1, Math.floor(y1 / res) + 1);
  if (gx1 < gx0 || gy1 < gy0) return;
  const r = rasterize(polys, gx0 * res, gy0 * res, gx1 - gx0 + 1, gy1 - gy0 + 1, res);
  for (let c = 0; c < r.iv.length; c++) {
    const src = r.iv[c];
    for (let m = 0; m < src.length; m += 2) for (let j = src[m]; j <= src[m + 1]; j++) { const jj = gy0 + j; if (jj >= 0 && jj < rows) grid[(gx0 + c) * rows + jj] = 1; }
  }
}

/** The boundary loops of one connected region (cell mask), counter-clockwise outer, clockwise holes, as grid-corner points. */
function traceRegion(mask, cols, rows) {
  const edges = [];                                           // [x0, y0, x1, y1]
  const inM = (i, j) => i >= 0 && i < cols && j >= 0 && j < rows && mask(i, j);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if (!mask(i, j)) continue;
    if (!inM(i, j - 1)) edges.push([i, j, i + 1, j]);
    if (!inM(i + 1, j)) edges.push([i + 1, j, i + 1, j + 1]);
    if (!inM(i, j + 1)) edges.push([i + 1, j + 1, i, j + 1]);
    if (!inM(i - 1, j)) edges.push([i, j + 1, i, j]);
  }
  const key = (x, y) => x * (rows + 2) + y;
  const out = new Map();
  edges.forEach((e, k) => { const q = key(e[0], e[1]); if (!out.has(q)) out.set(q, []); out.get(q).push(k); });
  const used = new Uint8Array(edges.length);
  const loops = [];
  for (let k0 = 0; k0 < edges.length; k0++) {
    if (used[k0]) continue;
    const loop = [];
    let k = k0;
    for (let guard = 0; guard < edges.length + 2; guard++) {
      used[k] = 1;
      const e = edges[k];
      loop.push([e[0], e[1]]);
      const cand = (out.get(key(e[2], e[3])) || []).filter((q) => !used[q] || q === k0);
      if (!cand.length) break;
      let next = cand[0];
      if (cand.length > 1) {                                  // a corner where two cells touch: turn left, round the same cell
        const dx = e[2] - e[0], dy = e[3] - e[1];
        const left = (q) => { const f = edges[q], ex = f[2] - f[0], ey = f[3] - f[1]; return dx * ey - dy * ex; };   // > 0: a left turn
        next = cand.slice().sort((a, b) => left(b) - left(a))[0];
      }
      if (next === k0) break;
      k = next;
    }
    if (loop.length >= 4) loops.push(loop);
  }
  return loops;
}

const area2 = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };

function dropCollinear(pts) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) out.push(b);
  }
  return out;
}

/** Douglas–Peucker on a closed loop, tolerance tol (it is split at the two vertices furthest apart). */
function simplifyClosed(pts, tol) {
  const n = pts.length;
  if (n <= 4) return pts;
  let a = 0, b = 0, best = -1;
  for (let i = 1; i < n; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > best) { best = d; b = i; } }
  const keep = new Uint8Array(n);
  keep[a] = keep[b] = 1;
  const seg = (lo, hi) => {                                   // lo < hi in the unrolled index, wrapped on read
    const stack = [[lo, hi]];
    while (stack.length) {
      const [s, e] = stack.pop();
      if (e - s < 2) continue;
      const p = pts[s % n], q = pts[e % n], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      let far = -1, fi = -1;
      for (let i = s + 1; i < e; i++) { const r = pts[i % n]; const d = Math.abs((r[0] - p[0]) * dy - (r[1] - p[1]) * dx) / L; if (d > far) { far = d; fi = i; } }
      if (far > tol) { keep[fi % n] = 1; stack.push([s, fi], [fi, e]); }
    }
  };
  seg(a, b); seg(b, a + n);
  return pts.filter((_, i) => keep[i]);
}

// ------------------------------------------------------------------------------------------------ leftovers

/**
 * The usable material left on a plate (or inside a remnant): see the header. `placed` = parts with `loops` in the plate's frame;
 * `region` = { w, h, obstacles?: [loops] } (obstacles = what is not material: the complement of a remnant, other cuts).
 */
export function leftovers(placed, region, { spacing = 0, minWidth, minArea, res: resIn } = {}) {
  const w = Number(region.w), h = Number(region.h);
  if (!(w > 0 && h > 0)) return [];
  const res = Number(resIn) > 0 ? Number(resIn) : Math.max(Math.min(w, h) / 600, 1e-6);
  const cols = Math.max(1, Math.ceil(w / res - 1e-9)), rows = Math.max(1, Math.ceil(h / res - 1e-9));
  const sag = Math.min(res / 8, 0.1);
  const occ = new Uint8Array(cols * rows);
  for (const p of placed) paint(occ, cols, rows, [flatten(p.loops[0], sag)], res);       // a part's holes are its own: the slug is not stock
  for (const loops of region.obstacles || []) paint(occ, cols, rows, loops.map((l) => flatten(l, sag)), res);
  const grow = Math.ceil((Math.max(0, spacing) + 2 * sag) / res - 1e-9) + 1;           // the spacing, the arc sag and one more cell
  const blocked = dilateGrid(occ, cols, rows, grow);
  let free = invert(blocked);
  const mw = minWidth ?? Math.min(w, h) / 20;
  const k = Math.max(0, Math.floor(mw / res / 2 - 1e-9));
  if (k > 0) free = dilateGrid(invert(dilateGrid(invert(free), cols, rows, k)), cols, rows, k);     // an opening: strips narrower than minWidth go
  for (let i = 0; i < free.length; i++) if (blocked[i]) free[i] = 0;
  // regions (4-connected)
  const label = new Int32Array(cols * rows);
  const comps = [];
  const stack = [];
  for (let s = 0; s < free.length; s++) {
    if (!free[s] || label[s]) continue;
    const id = comps.length + 1;
    let n = 0;
    label[s] = id; stack.push(s);
    while (stack.length) {
      const c = stack.pop(); n++;
      const i = Math.floor(c / rows), j = c - i * rows;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + di, b = j + dj;
        if (a < 0 || a >= cols || b < 0 || b >= rows) continue;
        const q = a * rows + b;
        if (free[q] && !label[q]) { label[q] = id; stack.push(q); }
      }
    }
    comps.push({ id, n });
  }
  const out = [];
  const minA = minArea ?? w * h * 0.02;
  for (const comp of comps) {
    if (comp.n * res * res < minA * 0.5) continue;                                     // the raster area is close to the outline's: skip the hopeless early
    const raw = traceRegion((i, j) => label[i * rows + j] === comp.id, cols, rows);
    const loops = [];
    for (const lp of raw) {
      const pts = dropCollinear(lp.map(([x, y]) => [x, y])).map(([x, y]) => [x * res, y * res]);
      if (pts.length < 3) continue;
      const simp = simplifyClosed(pts, res * 0.5);
      if (simp.length < 3) continue;
      loops.push(simp.map(([x, y]) => ({ x: Math.min(w, Math.max(0, x)), y: Math.min(h, Math.max(0, y)) })));
    }
    if (!loops.length) continue;
    loops.sort((a, b) => Math.abs(loopArea(b)) - Math.abs(loopArea(a)));
    const outline = loops[0], holes = loops.slice(1);
    const area = regionArea([outline, ...holes]);
    if (!(area >= minA)) continue;
    // where a label fits: the cell furthest from the edge of this region (a chamfer distance)
    const d = new Float32Array(cols * rows);
    const BIG = 1e9, at = (i, j) => (i < 0 || j < 0 || i >= cols || j >= rows ? 0 : d[i * rows + j]);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) d[i * rows + j] = label[i * rows + j] === comp.id ? BIG : 0;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { if (d[i * rows + j] === 0) continue; d[i * rows + j] = Math.min(d[i * rows + j], at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + 1.4142, at(i - 1, j + 1) + 1.4142); }
    let bi = 0, bj = 0, bd = -1;
    for (let i = cols - 1; i >= 0; i--) for (let j = rows - 1; j >= 0; j--) {
      if (d[i * rows + j] === 0) continue;
      d[i * rows + j] = Math.min(d[i * rows + j], at(i + 1, j) + 1, at(i, j + 1) + 1, at(i + 1, j + 1) + 1.4142, at(i + 1, j - 1) + 1.4142);
      if (d[i * rows + j] > bd) { bd = d[i * rows + j]; bi = i; bj = j; }
    }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of flatten(outline, 1e-3)) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    out.push({ loops: [outline, ...holes], area, w: x1 - x0, h: y1 - y0, x0, y0, label: { x: (bi + 0.5) * res, y: (bj + 0.5) * res, h: Math.max(res, Math.min(bd * res * 0.6, (y1 - y0) / 4)) } });
  }
  return out.sort((a, b) => b.area - a.area);
}

// ------------------------------------------------------------------------------------------------ a job on stock

const sameStock = (it, material, thickness) => it.status === 'available' && it.material === material && Math.abs(it.thickness - thickness) < 1e-6;

/** Loops of what is not material round a remnant: a big rectangle with the remnant's loops inside (even-odd). */
function complement(it, pad) {
  const r = [{ x: -pad, y: -pad }, { x: it.w + pad, y: -pad }, { x: it.w + pad, y: it.h + pad }, { x: -pad, y: it.h + pad }];
  return [r, ...it.loops];
}

export function nestWithStock(parts, stock, sheet = {}, opts = {}) {
  const now = opts.now || (() => Date.now());
  const t0 = now();
  const material = String(opts.material ?? ''), thickness = Number(opts.thickness) || 0;
  const roll = !(Number(sheet.w) > 0) || !Number.isFinite(Number(sheet.w));
  const margin = Math.max(0, Number(sheet.margin) || 0), spacing = Math.max(0, Number(opts.spacing) || 0);
  const qtyOf = (i) => Math.max(0, Math.floor(parts[i].qty ?? 1));
  const left = parts.map((_, i) => qtyOf(i));                               // copies still to lay, per part
  const placed = [], sheets = [], sheetShapes = [], uses = [], remnants = [];
  const lo = { spacing, minWidth: opts.minWidth, minArea: opts.minArea };
  const timeLimit = opts.timeLimit ?? 4000;
  const copiesLeft = () => left.reduce((s, n) => s + n, 0);
  const take = (result, mapIndex, sheetIndex) => {
    const counts = new Map();
    for (const pl of result.placed) {
      const gi = mapIndex[pl.part];
      counts.set(gi, (counts.get(gi) || 0) + 1);
      placed.push({ ...pl, part: gi, copy: qtyOf(gi) - left[gi] + (counts.get(gi) - 1), sheet: sheetIndex });
    }
    for (const [gi, n] of counts) left[gi] -= n;
  };

  const candidates = opts.useStock === false || roll ? [] : stock.items.filter((it) => sameStock(it, material, thickness)).sort((a, b) => a.area - b.area || a.number - b.number);
  const smallest = (ps) => ps.reduce((m, p) => Math.min(m, p.area), Infinity);
  const areas = parts.map((p) => (p.loops?.length ? regionArea(p.loops) : 0));
  for (const it of candidates) {
    if (!copiesLeft()) break;
    const idx = parts.map((_, i) => i).filter((i) => left[i] > 0 && areas[i] > 0 && areas[i] <= it.area);
    if (!idx.length) continue;
    const sub = idx.map((i) => ({ ...parts[i], qty: left[i] }));
    const share = Math.max(300, Math.floor(timeLimit / Math.max(1, candidates.length + 1)));
    const gap = Math.max(margin, spacing);
    const r = nest(sub, { w: it.w, h: it.h, margin: 0, count: 1, obstacles: [complement(it, Math.max(it.w, it.h) * 0.05 + gap)], obstacleGap: gap }, { ...opts, timeLimit: share, tries: Math.min(opts.tries ?? 12, 6) });
    if (!r.placed.length) continue;
    const si = sheets.length;
    sheets.push({ used: it.w, area: r.area });
    sheetShapes.push({ w: it.w, h: it.h, loops: it.loops, stock: it.id });
    take(r, idx, si);
    const own = placed.filter((p) => p.sheet === si);
    const area = own.reduce((s, p) => s + p.area, 0);
    uses.push({ id: it.id, number: it.number, sheet: si, placed: own.length, area, efficiency: area / it.area, w: it.w, h: it.h });
    for (const lf of leftovers(own, { w: it.w, h: it.h, obstacles: [complement(it, Math.max(it.w, it.h) * 0.05)] }, lo)) remnants.push({ sheet: si, parent: it.number, ...lf });
  }

  // what is left goes on new plates
  let unplaced = [];
  let plates = 0;
  if (copiesLeft()) {
    const idx = parts.map((_, i) => i).filter((i) => left[i] > 0 || areas[i] <= 0);
    const sub = idx.map((i) => ({ ...parts[i], qty: areas[i] > 0 ? left[i] : qtyOf(i) }));
    const r = nest(sub, sheet, { ...opts, timeLimit: Math.max(500, timeLimit - (now() - t0)) });
    const base = sheets.length;
    const mapIndex = idx;
    // sheet numbers: this nest's plates follow the remnants
    const shifted = { ...r, placed: r.placed.map((p) => ({ ...p, sheet: p.sheet + base })) };
    const asPlaced = shifted.placed.map((p) => ({ ...p, part: mapIndex[p.part], copy: p.copy + (qtyOf(mapIndex[p.part]) - left[mapIndex[p.part]]) }));
    for (const p of asPlaced) { left[p.part]--; placed.push(p); }
    plates = r.sheets.length;
    r.sheets.forEach((s, k) => { sheets.push(s); sheetShapes.push({ w: roll ? r.length : Number(sheet.w), h: Number(sheet.h), loops: null }); });
    unplaced = r.unplaced.map((u) => ({ ...u, part: mapIndex[u.part] }));
    if (!roll) {
      for (let k = 0; k < r.sheets.length; k++) {
        const own = asPlaced.filter((p) => p.sheet === base + k);
        for (const lf of leftovers(own, { w: Number(sheet.w), h: Number(sheet.h) }, lo)) remnants.push({ sheet: base + k, parent: null, ...lf });
      }
    }
  }
  const area = placed.reduce((s, p) => s + p.area, 0);
  const sheetArea = sheetShapes.reduce((s, sh, i) => s + (sh.stock ? stock.items.find((x) => x.id === sh.stock).area : sh.w * sh.h), 0);
  return {
    placed, unplaced, sheets, sheetShapes, remnants: remnants.map((r) => ({ ...r, text: '' })), uses, plates, roll,
    length: roll ? sheets[0]?.used || 0 : sheets.at(-1)?.used || 0, area, efficiency: sheetArea > 0 ? area / sheetArea : 0, res: 0, tries: 0, order: 'stock', ms: now() - t0,
  };
}

/** Commit a job to the stock (see the header). */
export function applyJob(stock, job, { name = '', date = '', saveRemnants = true, material = '', thickness = 0 } = {}) {
  const next = cleanStock(JSON.parse(JSON.stringify(stock)));
  const used = [];
  const added = [];
  for (const u of job.uses) {
    const it = next.items.find((x) => x.id === u.id);
    if (it) { it.status = 'used'; it.usedIn = name; used.push(it.id); }
  }
  if (saveRemnants) {
    for (const r of job.remnants) {
      const number = next.next++;
      const b = { x0: r.x0, y0: r.y0 };
      const loops = r.loops.map((l) => l.map((p) => ({ ...p, x: p.x - b.x0, y: p.y - b.y0 })));
      const it = {
        id: stockId(number), number, kind: 'remnant', material, thickness, w: r.w, h: r.h, loops, area: r.area, created: date,
        source: { job: name, sheet: r.sheet, ...(r.parent ? { parent: r.parent } : {}) }, status: 'available', usedIn: '', note: '',
      };
      next.items.push(it);
      added.push(it);
      r.text = it.id;                                                                  // the number in the job's drawing
      r.at = { x: r.label.x, y: r.label.y };
      r.h = Math.min(r.label.h, r.h);
      r.id = it.id;
    }
  }
  return { stock: next, added, used };
}

/** The exact re-check of a job's remnants against its parts (polygons, not the raster). [] = good. */
export function checkRemnants(job, { spacing = 0, eps = 1e-6 } = {}) {
  const problems = [];
  const segD = (a, b, c, d) => {
    const cross = (o, p, q) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
    const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 0;
    const pt = (p, s, e) => { const dx = e.x - s.x, dy = e.y - s.y, L = dx * dx + dy * dy; let t = L ? ((p.x - s.x) * dx + (p.y - s.y) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(s.x + t * dx - p.x, s.y + t * dy - p.y); };
    return Math.min(pt(a, c, d), pt(b, c, d), pt(c, a, b), pt(d, a, b));
  };
  const inside = (p, polys) => { let o = false; for (const pl of polys) for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) { const a = pl[i], b = pl[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) o = !o; } return o; };
  for (const r of job.remnants) {
    const rp = r.loops.map((l) => flatten(l, 1e-3));
    const area = regionArea(r.loops);
    if (!(area > 0)) problems.push({ kind: 'empty', remnant: r });
    for (const p of job.placed.filter((q) => q.sheet === r.sheet)) {
      const pp = [flatten(p.loops[0], 1e-3)];
      let dmin = Infinity;
      for (const a of rp) for (let i = 0; i < a.length && dmin > 0; i++) for (const b of pp) for (let j = 0; j < b.length; j++) { const d = segD(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length]); if (d < dmin) { dmin = d; if (!d) break; } }
      const overlap = dmin <= eps || inside(rp[0][0], pp) || inside(pp[0][0], rp);
      if (overlap) problems.push({ kind: 'overlap', remnant: r, part: p });
      else if (dmin < spacing - eps) problems.push({ kind: 'close', remnant: r, part: p, d: dmin });
    }
  }
  return problems;
}

/** What the job used and left, for the job report: [{ kind: 'used' | 'plate' | 'left' | 'unplaced', … }]. */
export function jobReport(job) {
  const rows = [];
  for (const u of job.uses) rows.push({ kind: 'used', id: u.id, placed: u.placed, area: u.area, efficiency: u.efficiency });
  if (job.plates) rows.push({ kind: 'plate', plates: job.plates });
  for (const r of job.remnants) rows.push({ kind: 'left', id: r.id || '', w: r.w, h: r.h, area: r.area, parent: r.parent ?? null });
  for (const u of job.unplaced) rows.push({ kind: 'unplaced', name: u.name, why: u.why });
  return rows;
}

export { checkNest, placeLoops };
