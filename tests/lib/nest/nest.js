/* SPDX-License-Identifier: Apache-2.0 */
/**
 * nest.js — one nesting engine for sheet goods (0.6 LC.17, session `lc-make`). DOM-free and import-free.
 * Canonical here (lib/nest); the apparel add-on (cadcraft/dev/addons/apparel/lib/nest/) and PartCraft (partcraft/dev/nest/)
 * carry byte-identical copies: `node tools/nest/sync.mjs [--check]` after every change. Grown from the AP.10 spike
 * (tools/apparel-test/nest-spike.mjs, NESTING.md) with its go list: placements scored by the length they leave, several
 * piece orders, a raster that keeps concave shapes and holes, grain and small turns, mixed sizes, a real check.
 *
 * Shapes are loops of points `{x, y, b?}` (b = DXF-style bulge of the segment that starts there: tan(sweep/4), + = CCW); the
 * first loop of a part is its outline, the others its holes (any winding). Units are the caller's (mm or inches).
 *
 *   nest(parts, sheet, opts) → result
 *     parts  [{ id, name, loops, qty = 1, grain = null (the grain line's angle in the part's own frame, radians: it is laid
 *              along the sheet's length, x), turn = true (with grain: may lie the other way round too), mirror = false (may
 *              also be laid mirrored), mirrored = false (this copy is the mirrored one of a pair: always laid mirrored) }]
 *     sheet  { w (length along x; Infinity or null = a roll, as long as needed), h (width across, y), margin = 0 (kept
 *              clear at every edge), count = Infinity (plates available), obstacles = [loops] (already on sheet 0, sheet
 *              coordinates: pieces laid by hand stay where they are), obstacleGap = spacing (clearance kept round the
 *              obstacles; the offcut stock of nest-stock.js uses it for the edges of an irregular remnant) }
 *     opts   { spacing = 0 (between parts), step = 90 (degrees between the turns tried for parts without grain; 0 = as
 *              drawn), grainTol = 0 (degrees a part with grain may be turned off it), res (raster cell; default from the
 *              sheet and the smallest part), tries = 12 (piece orders), seed = 1, timeLimit = 4000 (ms), now = Date.now,
 *              onProgress(done, total) }
 *     result { placed: [{ part (index), id, name, copy, sheet, rot, mirror, x, y, loops (placed, with bulges), area }],
 *              unplaced: [{ part, id, name, copy, why: 'too_big'|'no_room' }], sheets: [{ used (length along x), area }],
 *              length (roll: used length), efficiency (parts' area ÷ sheet area used), area, res, tries, order, ms }
 *   Placement: q = (x, y) + R(rot)·M(p), M = (−x, y) when mirror. An insert {rot, sx: mirror ? −1 : 1, sy: 1, x, y} places
 *   the part the same way (CadCraft's insert transform).
 *
 *   checkNest(result, sheet, {spacing}) → [problems]   the exact re-check (polygon geometry, not the raster): no two parts
 *     overlap, no two closer than spacing, all inside the sheet's margins. [] = good.
 *   orientations(part, opts) → [{rot, mirror}] · placeLoops(loops, pl) · flatten(loop, sag) · loopArea(loop) · regionArea(loops)
 *   loopsFromSegs(segs, tol) → loops (PartCraft's flat pattern: line/arc/circle/poly pieces → closed loops with bulges)
 *   readOutlines(dxfText, {skipLayers}) → { parts: [{name, loops}], units: 'mm'|'in'|'', notes } (closed outlines of a DXF: LWPOLYLINE,
 *     POLYLINE, CIRCLE, ELLIPSE (as points), LINE + ARC chains; holes go with the outline round them)
 *   nestDxf(result, sheet, {units, labels = true, gap}) → DXF R12 text (layers SHEET, PARTS, LABELS; one sheet under the next).
 *     A result from nest-stock.js carries `sheetShapes` (each sheet's own size and outline: a remnant is not a rectangle) and
 *     `remnants` (the offcuts this job leaves: outlines on layer REMNANTS, their numbers on LABELS).
 *
 * How it nests: every part (each turn and mirror it may take) is drawn once on a raster of `res` cells. The raster is
 * conservative — every cell the part touches is set (edges by exact column slabs, the inside by a scan line through each
 * column's middle, so a concave part keeps its inside free and a hole stays open for small parts) — and what lies on the sheet
 * is grown by the spacing (in whole cells, Chebyshev, so no two parts can end up closer than the spacing). Parts are laid in
 * turn, each at the spot and turn that keeps the used length shortest, then nearest the start, then lowest; a part is slid
 * across the width in jumps past whatever it hits. Several piece orders are tried (largest area, longest, widest; the same
 * three with every part only as drawn — so allowing turns never loses —; then shuffles of the best) within the time limit,
 * and the best kept (fewest sheets, then shortest). Arcs are flattened with a
 * small sag that is added to the spacing, so the raster stays on the safe side of the true curve.
 */

const TAU = Math.PI * 2;

// ------------------------------------------------------------------------------------------------ geometry helpers

/** A loop with bulges → points along it (arcs as chords whose sag is at most `sag`). */
export function flatten(loop, sag = 0.05) {
  const out = [];
  const n = loop.length;
  for (let i = 0; i < n; i++) {
    const p = loop[i], q = loop[(i + 1) % n], b = p.b || 0;
    out.push({ x: p.x, y: p.y });
    if (!b || n < 2) continue;
    const th = 4 * Math.atan(b);                      // signed sweep
    const ch = Math.hypot(q.x - p.x, q.y - p.y);
    if (ch < 1e-12) continue;
    const r = ch / (2 * Math.sin(Math.abs(th) / 2));
    const steps = Math.max(1, Math.ceil(Math.abs(th) / (2 * Math.acos(Math.max(-1, Math.min(1, 1 - Math.min(sag, r) / r))))));
    // centre: from the chord's middle, along its normal (left for CCW)
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, ux = (q.x - p.x) / ch, uy = (q.y - p.y) / ch;
    const d = r * Math.cos(th / 2) * Math.sign(th);
    const cx = mx - uy * d, cy = my + ux * d;
    const a0 = Math.atan2(p.y - cy, p.x - cx);
    for (let k = 1; k < steps; k++) { const a = a0 + th * k / steps; out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); }
  }
  return out;
}

/** Signed area of a loop (bulges included exactly). */
export function loopArea(loop) {
  let a = 0;
  const n = loop.length;
  for (let i = 0; i < n; i++) {
    const p = loop[i], q = loop[(i + 1) % n];
    a += p.x * q.y - q.x * p.y;
    const b = p.b || 0;
    if (b) {
      const th = 4 * Math.atan(b), ch = Math.hypot(q.x - p.x, q.y - p.y);
      if (ch > 1e-12) { const r = ch / (2 * Math.sin(Math.abs(th) / 2)); a += Math.sign(th) * r * r * (Math.abs(th) - Math.sin(Math.abs(th))); }
    }
  }
  return a / 2;
}

/** A part's area: its outline less its holes. */
export const regionArea = (loops) => loops.reduce((s, l, i) => s + (i === 0 ? 1 : -1) * Math.abs(loopArea(l)), 0);

const grown = (b, d) => ({ x0: b.x0 - d, y0: b.y0 - d, x1: b.x1 + d, y1: b.y1 + d });

function bboxOf(polys) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pl of polys) for (const p of pl) { if (p.x < x0) x0 = p.x; if (p.y < y0) y0 = p.y; if (p.x > x1) x1 = p.x; if (p.y > y1) y1 = p.y; }
  return { x0, y0, x1, y1 };
}

/** Place loops: q = (x, y) + R(rot)·M(p). Mirroring flips the bulges. */
export function placeLoops(loops, { rot = 0, mirror = false, x = 0, y = 0 }) {
  const c = Math.cos(rot), s = Math.sin(rot), m = mirror ? -1 : 1;
  return loops.map((l) => {
    const out = l.map((p) => { const px = m * p.x; const q = { x: x + c * px - s * p.y, y: y + s * px + c * p.y }; if (p.b) q.b = m * p.b; return q; });
    return out;
  });
}

// ------------------------------------------------------------------------------------------------ orientations

/** The turns and mirrors a part may take. */
export function orientations(part, { step = 90, grainTol = 0 } = {}) {
  const out = [];
  const mirrors = part.mirrored ? [true] : part.mirror ? [false, true] : [false];
  for (const mirror of mirrors) {
    if (part.grain != null && Number.isFinite(part.grain)) {
      const g = mirror ? Math.PI - part.grain : part.grain;     // the grain's direction once mirrored
      const base = -g;
      const ends = part.turn === false ? [base] : [base, base + Math.PI];
      const tol = Math.max(0, Math.min(45, grainTol || 0)) * Math.PI / 180;
      const small = tol > 0 ? [0, -tol, tol, -tol / 2, tol / 2] : [0];
      for (const e of ends) for (const d of small) out.push({ rot: norm(e + d), mirror });
    } else {
      const st = Math.abs(step || 0);
      const n = st > 0 && st < 360 ? Math.max(1, Math.round(360 / st)) : 1;
      for (let k = 0; k < n; k++) out.push({ rot: norm(k * TAU / n), mirror });
    }
  }
  // drop repeats (a 180° turn of a part drawn symmetric is still tried: the raster decides)
  const seen = new Set();
  return out.filter((o) => { const k = o.mirror + ':' + o.rot.toFixed(9); if (seen.has(k)) return false; seen.add(k); return true; });
}
const norm = (a) => { let r = a % TAU; if (r < 0) r += TAU; if (TAU - r < 1e-12) r = 0; return r; };

// ------------------------------------------------------------------------------------------------ raster

/**
 * Every cell a region touches, as intervals per column. polys: flattened loops (even-odd region). The grid's cell (i, j)
 * covers [ox + i·res, ox + (i + 1)·res] × [oy + j·res, …]. → { cols, rows, iv: [Int32Array [a0, b0, a1, b1 …]] }
 */
export function rasterize(polys, ox, oy, cols, rows, res) {
  const grid = new Uint8Array(cols * rows);
  const set = (i, j0, j1) => {
    if (i < 0 || i >= cols) return;
    if (j0 > j1) { const t = j0; j0 = j1; j1 = t; }
    j0 = Math.max(0, j0); j1 = Math.min(rows - 1, j1);
    for (let j = j0; j <= j1; j++) grid[i * rows + j] = 1;
  };
  // the edges: for each column the segment crosses, the cells between its lowest and highest point in that column
  for (const pl of polys) {
    const n = pl.length;
    for (let k = 0; k < n; k++) {
      const p = pl[k], q = pl[(k + 1) % n];
      const ax = (p.x - ox) / res, ay = (p.y - oy) / res, bx = (q.x - ox) / res, by = (q.y - oy) / res;
      const i0 = Math.floor(Math.min(ax, bx)), i1 = Math.floor(Math.max(ax, bx));
      if (i0 === i1 || Math.abs(bx - ax) < 1e-12) { set(i0, Math.floor(Math.min(ay, by)), Math.floor(Math.max(ay, by))); if (Math.abs(bx - ax) < 1e-12 && Number.isInteger(ax)) set(ax - 1, Math.floor(Math.min(ay, by)), Math.floor(Math.max(ay, by))); continue; }
      const yAt = (x) => ay + (by - ay) * (x - ax) / (bx - ax);
      const lo = Math.min(ax, bx), hi = Math.max(ax, bx);
      for (let i = i0; i <= i1; i++) {
        const xa = Math.max(lo, i), xb = Math.min(hi, i + 1);
        const ya = yAt(xa), yb = yAt(xb);
        set(i, Math.floor(Math.min(ya, yb)), Math.floor(Math.max(ya, yb)));
        // a point exactly on a column line touches the column on its left too
        if (Number.isInteger(xa) && xa === i) set(i - 1, Math.floor(ya), Math.floor(ya));
      }
    }
  }
  // the inside: a scan line through each column's middle (even-odd)
  const xs = [];
  for (let i = 0; i < cols; i++) {
    const x = ox + (i + 0.5) * res;
    xs.length = 0;
    for (const pl of polys) {
      const n = pl.length;
      for (let k = 0; k < n; k++) {
        const p = pl[k], q = pl[(k + 1) % n];
        if ((p.x <= x) !== (q.x <= x)) xs.push(p.y + (q.y - p.y) * (x - p.x) / (q.x - p.x));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) set(i, Math.floor((xs[k] - oy) / res), Math.floor((xs[k + 1] - oy) / res));
  }
  const iv = new Array(cols);
  for (let i = 0; i < cols; i++) {
    const runs = [];
    let j = 0;
    while (j < rows) {
      if (!grid[i * rows + j]) { j++; continue; }
      const a = j;
      while (j < rows && grid[i * rows + j]) j++;
      runs.push(a, j - 1);
    }
    iv[i] = Int32Array.from(runs);
  }
  return { cols, rows, iv };
}

/** Grow a raster by k cells every way (Chebyshev). → { ox: −k, iv } with intervals that may run below 0. */
export function dilate(r, k) {
  if (k <= 0) return { ox: 0, iv: r.iv };
  const cols = r.cols + 2 * k;
  const iv = new Array(cols);
  for (let c = 0; c < cols; c++) {
    const runs = [];
    for (let i = c - 2 * k; i <= c; i++) { const src = r.iv[i]; if (!src) continue; for (let m = 0; m < src.length; m += 2) runs.push([src[m] - k, src[m + 1] + k]); }
    runs.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [a, b] of runs) { if (merged.length && a <= merged[merged.length - 1] + 1) merged[merged.length - 1] = Math.max(merged[merged.length - 1], b); else merged.push(a, b); }
    iv[c] = Int32Array.from(merged);
  }
  return { ox: -k, iv };
}

// ------------------------------------------------------------------------------------------------ the sheet's occupancy

class Occupancy {
  constructor() { this.cols = []; }
  col(i) { return this.cols[i] || (this.cols[i] = []); }
  /** Add a (dilated) raster at cell (gx, gy). */
  add(d, gx, gy) {
    for (let c = 0; c < d.iv.length; c++) {
      const src = d.iv[c];
      if (!src.length) continue;
      const i = gx + d.ox + c;
      if (i < 0) continue;
      const list = this.col(i);
      for (let m = 0; m < src.length; m += 2) list.push(gy + src[m], gy + src[m + 1]);
      // keep sorted by start, merged
      const pairs = [];
      for (let m = 0; m < list.length; m += 2) pairs.push([list[m], list[m + 1]]);
      pairs.sort((a, b) => a[0] - b[0]);
      list.length = 0;
      for (const [a, b] of pairs) { if (list.length && a <= list[list.length - 1] + 1) list[list.length - 1] = Math.max(list[list.length - 1], b); else list.push(a, b); }
    }
  }
  /** The lowest gy ≥ 0 where raster r fits at column gx inside rows [0, H), or −1. */
  fit(r, gx, H) {
    let gy = 0;
    for (let guard = 0; guard < 100000; guard++) {
      if (gy + r.rows > H) return -1;
      let need = -1;
      for (let c = 0; c < r.cols; c++) {
        const occ = this.cols[gx + c];
        if (!occ || !occ.length) continue;
        const src = r.iv[c];
        for (let m = 0; m < src.length; m += 2) {
          const a = gy + src[m], b = gy + src[m + 1];
          // occupancy is sorted: skip what ends below a
          for (let k = 0; k < occ.length; k += 2) {
            if (occ[k + 1] < a) continue;
            if (occ[k] > b) break;
            need = Math.max(need, occ[k + 1] - src[m] + 1);
          }
        }
      }
      if (need < 0) return gy;
      gy = need;
    }
    return -1;
  }
}

// ------------------------------------------------------------------------------------------------ nest

const ORDERS = {
  area: (a, b) => b.area - a.area,
  long: (a, b) => b.long - a.long || b.area - a.area,
  wide: (a, b) => b.wide - a.wide || b.area - a.area,
};

function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

export function nest(parts, sheet = {}, opts = {}) {
  const now = opts.now || (() => Date.now());
  const t0 = now();
  const H0 = Number(sheet.h);
  if (!(H0 > 0)) throw new Error('nest: the sheet needs a width (h)');   // i18n-ignore: a caller's mistake, never shown
  const roll = !(Number(sheet.w) > 0) || !Number.isFinite(Number(sheet.w));
  const W0 = roll ? Infinity : Number(sheet.w);
  const margin = Math.max(0, Number(sheet.margin) || 0);
  const maxSheets = roll ? 1 : Math.max(1, Number.isFinite(sheet.count) ? Math.floor(sheet.count) : Infinity);
  const spacing = Math.max(0, Number(opts.spacing) || 0);
  const step = opts.step ?? 90, grainTol = opts.grainTol || 0;
  const tries = Math.max(1, Math.floor(opts.tries ?? 12));
  const timeLimit = opts.timeLimit ?? 4000;

  // the parts' shapes, flattened, and their sizes
  const kinds = parts.map((p, index) => {
    const loops = (p.loops || []).filter((l) => l && l.length >= 2);
    const area = loops.length ? regionArea(loops) : 0;
    const flat = loops.map((l) => flatten(l, 1e-3));
    const bb = bboxOf(flat.slice(0, 1));
    return { index, part: p, loops, area, long: Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0), wide: Math.min(bb.x1 - bb.x0, bb.y1 - bb.y0), dims: [bb.x1 - bb.x0, bb.y1 - bb.y0] };
  });
  const usable = kinds.filter((k) => k.loops.length && k.area > 0);
  const smallest = usable.reduce((m, k) => Math.min(m, k.wide || Infinity), Infinity);
  let res = Number(opts.res) > 0 ? Number(opts.res) : Math.max((H0 - 2 * margin) / 750, 1e-6);
  if (!(Number(opts.res) > 0) && Number.isFinite(smallest) && smallest > 0) res = Math.min(res, smallest / 4);
  const sag = Math.min(res / 8, 0.1);
  const grow = Math.ceil((spacing + 2 * sag) / res - 1e-9);   // cells of clearance round a placed part
  const growObs = sheet.obstacleGap != null ? Math.ceil((Math.max(0, Number(sheet.obstacleGap) || 0) + 2 * sag) / res - 1e-9) : grow;   // …and round an obstacle
  const H = Math.floor((H0 - 2 * margin) / res + 1e-9);
  const Wc = roll ? Infinity : Math.floor((W0 - 2 * margin) / res + 1e-9);

  // every turn of every part on the raster, once
  const shapes = new Map();   // `${index}|${o}` → { r, d, ox, oy (shape frame origin of cell (0,0)), orient }
  const shapeOf = (k, oi, orient) => {
    const key = k.index + '|' + oi;
    let s = shapes.get(key);
    if (s) return s;
    const placed = placeLoops(k.loops, orient);
    const polys = placed.map((l) => flatten(l, sag));
    const bb = grown(bboxOf(polys.slice(0, 1)), sag);   // chords cut inside arcs by up to the sag
    const cols = Math.floor((bb.x1 - bb.x0) / res) + 1, rows = Math.floor((bb.y1 - bb.y0) / res) + 1;
    const r = rasterize(polys, bb.x0, bb.y0, cols, rows, res);
    s = { r, d: dilate(r, grow), ox: bb.x0, oy: bb.y0, orient, oi };
    shapes.set(key, s);
    return s;
  };

  // the copies to lay
  const copies = [];
  for (const k of usable) {
    const q = Math.max(0, Math.floor(k.part.qty ?? 1));
    for (let c = 0; c < q; c++) copies.push({ k, copy: c });
  }
  const bad = kinds.filter((k) => !(k.loops.length && k.area > 0));

  // obstacles: rasterised on sheet 0 at their true place
  const obstacleRaster = () => {
    const out = [];
    for (const loops of sheet.obstacles || []) {
      const polys = loops.map((l) => flatten(l, sag));
      const bb = grown(bboxOf(polys), sag);
      // align to the sheet's grid (origin at the margin)
      const gx0 = Math.floor((bb.x0 - margin) / res), gy0 = Math.floor((bb.y0 - margin) / res);
      const ox = margin + gx0 * res, oy = margin + gy0 * res;
      const cols = Math.floor((bb.x1 - ox) / res) + 1, rows = Math.floor((bb.y1 - oy) / res) + 1;
      const r = rasterize(polys, ox, oy, cols, rows, res);
      out.push({ d: dilate(r, growObs), gx: gx0, gy: gy0 });
    }
    return out;
  };
  const obstacles = obstacleRaster();

  function run(order, plain) {
    const sheets = [];
    const open = () => { const o = new Occupancy(); if (!sheets.length) for (const ob of obstacles) o.add(ob.d, ob.gx, ob.gy); sheets.push({ occ: o, len: 0, from: new Map() }); return sheets[sheets.length - 1]; };
    open();
    const placed = [], unplaced = [];
    for (const cp of order) {
      const k = cp.k;
      const ors0 = orientations(k.part, { step, grainTol });
      const ors = plain ? ors0.slice(0, 1) : ors0;   // "as drawn": only each part's first turn (never worse than turning)
      let best = null;
      for (let si = 0; si < sheets.length && !best; si++) {
        const sh = sheets[si];
        for (let oi = 0; oi < ors.length; oi++) {
          const s = shapeOf(k, oi, ors[oi]);
          if (s.r.rows > H || s.r.cols > Wc) continue;
          const key = k.index + '|' + oi;
          const start = sh.from.get(key) || 0;
          for (let gx = start; gx + s.r.cols <= Wc; gx++) {
            if (best && best.sheet === si && gx + s.r.cols > best.right) break;   // can only be worse from here
            const gy = sh.occ.fit(s.r, gx, H);
            if (gy < 0) continue;
            sh.from.set(key, gx);
            const right = gx + s.r.cols, len = Math.max(sh.len, right);
            const cand = { sheet: si, s, gx, gy, right, len };
            if (!best || len < best.len || (len === best.len && (right < best.right || (right === best.right && gy < best.gy)))) best = cand;
            break;
          }
        }
      }
      if (!best && sheets.length < maxSheets) {
        // a fresh plate
        const fits = ors.some((o, oi) => { const s = shapeOf(k, oi, o); return s.r.rows <= H && s.r.cols <= Wc; });
        if (fits) {
          const sh = open(), si = sheets.length - 1;
          for (let oi = 0; oi < ors.length; oi++) {
            const s = shapeOf(k, oi, ors[oi]);
            if (s.r.rows > H || s.r.cols > Wc) continue;
            const gy = sh.occ.fit(s.r, 0, H);
            if (gy < 0) continue;
            const cand = { sheet: si, s, gx: 0, gy, right: s.r.cols, len: s.r.cols };
            if (!best || cand.right < best.right || (cand.right === best.right && gy < best.gy)) best = cand;
          }
        }
      }
      if (!best) {
        const tooBig = !ors.some((o, oi) => { const s = shapeOf(k, oi, o); return s.r.rows <= H && s.r.cols <= Wc; });
        unplaced.push({ part: k.index, id: k.part.id, name: k.part.name, copy: cp.copy, why: tooBig ? 'too_big' : 'no_room' });
        continue;
      }
      const sh = sheets[best.sheet];
      sh.occ.add(best.s.d, best.gx, best.gy);
      sh.len = Math.max(sh.len, best.right);
      placed.push({ cp, best });
    }
    // score: fewer unplaced, then fewer sheets, then the last sheet's (or the roll's) length
    const usedSheets = new Set(placed.map((p) => p.best.sheet)).size;
    const lastLen = placed.length ? Math.max(...placed.filter((p) => p.best.sheet === usedSheets - 1).map((p) => p.best.right)) : 0;
    return { placed, unplaced, sheets, score: [unplaced.length, usedSheets, lastLen] };
  }
  const better = (a, b) => { for (let i = 0; i < 3; i++) { if (a.score[i] !== b.score[i]) return a.score[i] < b.score[i]; } return false; };

  // the orders: the three sorts, then shuffles of the best one
  const rand = rng(opts.seed ?? 1);
  const sorted = (fn) => copies.slice().sort((a, b) => fn(a.k, b.k) || a.k.index - b.k.index || a.copy - b.copy);
  let best = null, bestOrder = null, bestPlain = false, triesDone = 0;
  const names = Object.keys(ORDERS);
  const turns = usable.some((k) => orientations(k.part, { step, grainTol }).length > 1);
  for (let i = 0; i < tries; i++) {
    if (i > 0 && now() - t0 > timeLimit) break;
    let order, label, plain = bestPlain;
    if (i < names.length) { order = sorted(ORDERS[names[i]]); label = names[i]; plain = false; } else if (turns && i < 2 * names.length) {
      const nm = names[i - names.length];
      order = sorted(ORDERS[nm]); label = nm + '+plain'; plain = true;
    } else {
      order = (bestOrder || sorted(ORDERS.area)).slice();
      const swaps = 1 + Math.floor(rand() * Math.max(1, order.length / 6));
      for (let s = 0; s < swaps && order.length > 1; s++) { const a = Math.floor(rand() * order.length), b = Math.min(order.length - 1, a + 1 + Math.floor(rand() * 3)); const tmp = order[a]; order[a] = order[b]; order[b] = tmp; }
      label = 'shuffle';
    }
    const r = run(order, plain);
    triesDone++;
    if (!best || better(r, best)) { best = r; bestOrder = order; bestPlain = plain; best.label = label; }
    opts.onProgress?.(i + 1, tries);
  }

  // into sheet coordinates
  const out = [];
  for (const { cp, best: b } of best.placed) {
    const s = b.s;
    // the shape's cell (0, 0) lands on the sheet's cell (gx, gy): shift = margin + g·res − shape origin
    const x = margin + b.gx * res - s.ox, y = margin + b.gy * res - s.oy;
    const pl = { rot: s.orient.rot, mirror: s.orient.mirror, x, y };
    out.push({ part: cp.k.index, id: cp.k.part.id, name: cp.k.part.name, copy: cp.copy, sheet: b.sheet, ...pl, loops: placeLoops(cp.k.loops, pl), area: cp.k.area });
  }
  const sheetsOut = [];
  const nSheets = out.length ? Math.max(...out.map((p) => p.sheet)) + 1 : 0;
  for (let i = 0; i < nSheets; i++) {
    const on = out.filter((p) => p.sheet === i);
    let used = 0;
    for (const p of on) for (const q of flatten(p.loops[0], 1e-3)) used = Math.max(used, q.x);
    sheetsOut.push({ used: Math.min(roll ? Infinity : W0, used + margin), area: on.reduce((s, p) => s + p.area, 0) });
  }
  const area = out.reduce((s, p) => s + p.area, 0);
  const sheetArea = roll ? (sheetsOut[0]?.used || 0) * H0 : nSheets * W0 * H0;
  const unplaced = best.unplaced.concat(bad.flatMap((k) => Array.from({ length: Math.max(1, Math.floor(k.part.qty ?? 1)) }, (_, c) => ({ part: k.index, id: k.part.id, name: k.part.name, copy: c, why: 'bad_shape' }))));
  return {
    placed: out, unplaced, sheets: sheetsOut, length: roll ? (sheetsOut[0]?.used || 0) : (sheetsOut.at(-1)?.used || 0),
    efficiency: sheetArea > 0 ? area / sheetArea : 0, area, res, tries: triesDone, order: best.label, roll, ms: now() - t0,
  };
}

// ------------------------------------------------------------------------------------------------ the exact check

const segDist = (a, b, c, d) => {
  // the shortest distance between segments ab and cd (0 when they cross)
  const cross = (o, p, q) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
  const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 0;
  const pt = (p, s, e) => { const dx = e.x - s.x, dy = e.y - s.y, L = dx * dx + dy * dy; let t = L ? ((p.x - s.x) * dx + (p.y - s.y) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(s.x + t * dx - p.x, s.y + t * dy - p.y); };
  return Math.min(pt(a, c, d), pt(b, c, d), pt(c, a, b), pt(d, a, b));
};
const inRegion = (p, polys) => {
  let inside = false;
  for (const pl of polys) for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) { const a = pl[i], b = pl[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside; }
  return inside;
};

/** The exact re-check of a result (see the header). */
export function checkNest(result, sheet = {}, { spacing = 0, eps = 1e-6 } = {}) {
  const problems = [];
  const margin = Math.max(0, Number(sheet.margin) || 0);
  const roll = !(Number(sheet.w) > 0) || !Number.isFinite(Number(sheet.w));
  const W = roll ? Infinity : Number(sheet.w), H = Number(sheet.h);
  const items = result.placed.map((p) => { const polys = p.loops.map((l) => flatten(l, 1e-3)); return { p, polys, bb: bboxOf(polys) }; });
  for (const it of items) {
    const { bb } = it;
    if (bb.x0 < margin - eps || bb.y0 < margin - eps || bb.y1 > H - margin + eps || bb.x1 > W - margin + eps) problems.push({ kind: 'outside', a: it.p });
  }
  const obstacles = (sheet.obstacles || []).map((loops) => { const polys = loops.map((l) => flatten(l, 1e-3)); return { p: { sheet: 0, obstacle: true }, polys, bb: bboxOf(polys) }; });
  const all = items.concat(obstacles);
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const A = items[i], B = all[j];
      if (A.p.sheet !== B.p.sheet) continue;
      const gap = B.p.obstacle && sheet.obstacleGap != null ? Number(sheet.obstacleGap) || 0 : spacing;
      if (A.bb.x1 + gap < B.bb.x0 - eps || B.bb.x1 + gap < A.bb.x0 - eps || A.bb.y1 + gap < B.bb.y0 - eps || B.bb.y1 + gap < A.bb.y0 - eps) continue;
      let dmin = Infinity;
      for (const pa of A.polys) for (let a = 0; a < pa.length && dmin > 0; a++) {
        const s = pa[a], e = pa[(a + 1) % pa.length];
        for (const pb of B.polys) for (let b = 0; b < pb.length; b++) { const d = segDist(s, e, pb[b], pb[(b + 1) % pb.length]); if (d < dmin) { dmin = d; if (!d) break; } }
      }
      // no edge closer than the spacing: still wrong when one lies inside the other's region
      const inside = inRegion(A.polys[0][0], B.polys) || inRegion(B.polys[0][0], A.polys);
      if (dmin <= eps || inside) problems.push({ kind: 'overlap', a: A.p, b: B.p });
      else if (dmin < gap - eps) problems.push({ kind: 'close', a: A.p, b: B.p, d: dmin });
    }
  }
  return problems;
}

// ------------------------------------------------------------------------------------------------ loops from pieces

/** Pieces {a: [x, y], b: [x, y], bulge} (and whole circles) → closed loops with bulges, ends joined within tol. */
function chain(pieces, tol) {
  const loops = [], open = [];
  const key = (p) => Math.round(p[0] / tol) + ',' + Math.round(p[1] / tol);
  const left = pieces.slice();
  const ends = new Map();
  const index = () => { ends.clear(); left.forEach((s, i) => { for (const [p, end] of [[s.a, 0], [s.b, 1]]) { const k = key(p); if (!ends.has(k)) ends.set(k, []); ends.get(k).push([i, end]); } }); };
  const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= tol * 1.5;
  while (left.length) {
    index();
    const first = left.shift();
    const pts = [{ x: first.a[0], y: first.a[1], b: first.bulge || 0 }];
    let cur = first.b;
    const used = new Set();
    for (let guard = 0; guard < 100000; guard++) {
      if (near(cur, first.a)) break;
      // the next piece touching cur (search near keys too)
      let hit = -1, flip = false;
      for (let i = 0; i < left.length && hit < 0; i++) {
        if (used.has(i)) continue;
        if (near(left[i].a, cur)) { hit = i; flip = false; } else if (near(left[i].b, cur)) { hit = i; flip = true; }
      }
      if (hit < 0) break;
      used.add(hit);
      const s = left[hit];
      pts.push({ x: cur[0], y: cur[1], b: flip ? -(s.bulge || 0) : (s.bulge || 0) });
      cur = flip ? s.a : s.b;
    }
    for (const i of [...used].sort((a, b) => b - a)) left.splice(i, 1);
    if (near(cur, first.a) && pts.length >= 2) loops.push(pts); else open.push(pts);
  }
  return { loops, open };
}

const bulgeOfArc = (sweepDeg) => Math.tan((sweepDeg * Math.PI / 180) / 4);

/** PartCraft's flat pattern pieces → loops (see the header). */
export function loopsFromSegs(segs, tol = 1e-4) {
  const pieces = [], loops = [];
  for (const s of segs || []) {
    if (s.type === 'line') pieces.push({ a: s.a, b: s.b, bulge: 0 });
    else if (s.type === 'arc') {
      let sw = ((s.a1 - s.a0) % 360 + 360) % 360;
      if (sw < 1e-9) sw = 360;
      const P = (deg) => [s.c[0] + s.r * Math.cos(deg * Math.PI / 180), s.c[1] + s.r * Math.sin(deg * Math.PI / 180)];
      if (sw >= 360 - 1e-9) { loops.push(circleLoop(s.c, s.r)); continue; }
      pieces.push({ a: P(s.a0), b: P(s.a0 + sw), bulge: bulgeOfArc(sw) });
    } else if (s.type === 'circle') loops.push(circleLoop(s.c, s.r));
    else if (s.type === 'poly' && s.pts?.length >= 2) for (let i = 0; i + 1 < s.pts.length; i++) pieces.push({ a: s.pts[i], b: s.pts[i + 1], bulge: 0 });
  }
  const r = chain(pieces, tol);
  return { loops: loops.concat(r.loops), open: r.open.length };
}
const circleLoop = (c, r) => [{ x: c[0] + r, y: c[1], b: 1 }, { x: c[0] - r, y: c[1], b: 1 }];

/** Loops → parts: an outline and the holes directly inside it (even depth = an outline). */
export function partsFromLoops(loops) {
  const items = loops.map((l) => ({ l, poly: flatten(l, 1e-3), area: Math.abs(loopArea(l)) })).filter((x) => x.area > 1e-12);
  items.sort((a, b) => b.area - a.area);
  for (const it of items) {
    it.depth = 0; it.parent = null;
    for (const o of items) {
      if (o === it || o.area <= it.area) continue;
      if (inRegion(it.poly[0], [o.poly]) && inRegion(it.poly[Math.floor(it.poly.length / 2)], [o.poly])) { it.depth++; if (!it.parent || o.area < it.parent.area) it.parent = o; }
    }
  }
  const parts = [];
  for (const it of items) if (it.depth % 2 === 0) { it.part = { loops: [it.l] }; parts.push(it.part); }
  for (const it of items) if (it.depth % 2 === 1 && it.parent?.part) it.parent.part.loops.push(it.l);
  return parts;
}

// ------------------------------------------------------------------------------------------------ DXF in

function dxfPairs(text) {
  const lines = String(text).split(/\r\n|\r|\n/);
  const out = [];
  for (let i = 0; i + 1 < lines.length; i += 2) { const c = parseInt(lines[i].trim(), 10); if (!Number.isFinite(c)) return out; out.push([c, lines[i + 1].trim()]); }
  return out;
}

/** Closed outlines in a DXF (ASCII; see the header). Blocks are not exploded: the outlines must be in model space. */
export function readOutlines(text, { skipLayers = [] } = {}) {
  const skip = new Set(skipLayers.map((l) => String(l).toUpperCase()));
  const pairs = dxfPairs(text);
  const notes = [];
  let units = '';
  // $INSUNITS
  for (let i = 0; i + 1 < pairs.length; i++) if (pairs[i][0] === 9 && pairs[i][1] === '$INSUNITS') { const u = +pairs[i + 1][1]; units = u === 1 ? 'in' : u === 4 ? 'mm' : u === 5 ? 'cm' : u === 6 ? 'm' : ''; }
  let i = pairs.findIndex((p, k) => p[0] === 2 && p[1] === 'ENTITIES' && pairs[k - 1]?.[1] === 'SECTION');
  if (i < 0) return { parts: [], units, notes: ['no_entities'] };
  i++;
  const ents = [];
  let cur = null;
  for (; i < pairs.length; i++) {
    const [c, v] = pairs[i];
    if (c === 0) { if (cur) ents.push(cur); if (v === 'ENDSEC') { cur = null; break; } cur = { type: v, g: [] }; continue; }
    if (cur) cur.g.push([c, v]);
  }
  const loops = [], pieces = [];
  const skipped = {};
  const num = (g, c, d = 0) => { const f = g.find((x) => x[0] === c); return f ? +f[1] : d; };
  const layerOf = (e) => String(e.g.find((x) => x[0] === 8)?.[1] ?? '0').toUpperCase();
  for (let k = 0; k < ents.length; k++) {
    const e = ents[k];
    if (skip.size && e.type !== 'VERTEX' && e.type !== 'SEQEND' && skip.has(layerOf(e))) {
      if (e.type === 'POLYLINE') while (ents[k + 1] && (ents[k + 1].type === 'VERTEX' || ents[k + 1].type === 'SEQEND')) k++;
      continue;
    }
    if (e.type === 'LWPOLYLINE') {
      const pts = [];
      for (const [c, v] of e.g) { if (c === 10) pts.push({ x: +v, y: 0, b: 0 }); else if (c === 20 && pts.length) pts[pts.length - 1].y = +v; else if (c === 42 && pts.length) pts[pts.length - 1].b = +v; }
      const closed = (num(e.g, 70) & 1) === 1;
      if (closed && pts.length >= 2) loops.push(pts); else for (let m = 0; m + 1 < pts.length; m++) pieces.push({ a: [pts[m].x, pts[m].y], b: [pts[m + 1].x, pts[m + 1].y], bulge: pts[m].b });
    } else if (e.type === 'POLYLINE') {
      const flags = num(e.g, 70);
      const pts = [];
      while (ents[k + 1] && ents[k + 1].type === 'VERTEX') { k++; const g = ents[k].g; if (num(g, 70) & 16) continue; pts.push({ x: num(g, 10), y: num(g, 20), b: num(g, 42) }); }
      if (ents[k + 1] && ents[k + 1].type === 'SEQEND') k++;
      if (flags & (16 | 64)) { skipped.POLYLINE = (skipped.POLYLINE || 0) + 1; continue; }   // meshes
      if ((flags & 1) && pts.length >= 2) loops.push(pts); else for (let m = 0; m + 1 < pts.length; m++) pieces.push({ a: [pts[m].x, pts[m].y], b: [pts[m + 1].x, pts[m + 1].y], bulge: pts[m].b });
    } else if (e.type === 'CIRCLE') loops.push(circleLoop([num(e.g, 10), num(e.g, 20)], num(e.g, 40)));
    else if (e.type === 'LINE') pieces.push({ a: [num(e.g, 10), num(e.g, 20)], b: [num(e.g, 11), num(e.g, 21)], bulge: 0 });
    else if (e.type === 'ARC') {
      const c = [num(e.g, 10), num(e.g, 20)], r = num(e.g, 40), a0 = num(e.g, 50), a1 = num(e.g, 51);
      let sw = ((a1 - a0) % 360 + 360) % 360; if (sw < 1e-9) sw = 360;
      const P = (deg) => [c[0] + r * Math.cos(deg * Math.PI / 180), c[1] + r * Math.sin(deg * Math.PI / 180)];
      if (sw >= 360 - 1e-9) loops.push(circleLoop(c, r)); else pieces.push({ a: P(a0), b: P(a0 + sw), bulge: bulgeOfArc(sw) });
    } else if (e.type === 'ELLIPSE') {
      const c = [num(e.g, 10), num(e.g, 20)], mx = num(e.g, 11), my = num(e.g, 21), ratio = num(e.g, 40, 1), s0 = num(e.g, 41, 0), s1 = num(e.g, 42, TAU);
      const L = Math.hypot(mx, my), ux = mx / (L || 1), uy = my / (L || 1);
      let sw = s1 - s0; if (sw <= 0) sw += TAU;
      const n = Math.max(8, Math.ceil(sw / (TAU / 96)));
      const pts = [];
      for (let m = 0; m <= n; m++) { const a = s0 + sw * m / n, ex = L * Math.cos(a), ey = L * ratio * Math.sin(a); pts.push([c[0] + ux * ex - uy * ey, c[1] + uy * ex + ux * ey]); }
      if (Math.abs(sw - TAU) < 1e-9) loops.push(pts.slice(0, -1).map(([x, y]) => ({ x, y, b: 0 }))); else for (let m = 0; m + 1 < pts.length; m++) pieces.push({ a: pts[m], b: pts[m + 1], bulge: 0 });
    } else if (e.type !== 'VERTEX' && e.type !== 'SEQEND') skipped[e.type] = (skipped[e.type] || 0) + 1;
  }
  // the chain tolerance from the drawing's size
  let ext = 0;
  for (const p of pieces) ext = Math.max(ext, Math.abs(p.a[0]), Math.abs(p.a[1]), Math.abs(p.b[0]), Math.abs(p.b[1]));
  const ch = chain(pieces, Math.max(1e-6, ext * 1e-7));
  if (ch.open.length) notes.push('open:' + ch.open.length);
  for (const [k, n] of Object.entries(skipped)) notes.push('skipped:' + k + ':' + n);
  const parts = partsFromLoops(loops.concat(ch.loops)).map((p, n) => ({ name: 'Part ' + (n + 1), loops: p.loops }));
  return { parts, units, notes };
}

// ------------------------------------------------------------------------------------------------ DXF out

/** The nest as DXF R12 for a cutter (see the header). Sheets are drawn one under the next, gap apart. */
export function nestDxf(result, sheet, { units = 'mm', labels = true, gap, textHeight } = {}) {
  const roll = result.roll ?? (!(Number(sheet.w) > 0) || !Number.isFinite(Number(sheet.w)));
  const nSheets = Math.max(1, result.sheets.length);
  const shapes = result.sheetShapes || null;
  const rem = result.remnants || [];
  const dims = Array.from({ length: nSheets }, (_, s) => (shapes?.[s] ? { W: Number(shapes[s].w), H: Number(shapes[s].h), loops: shapes[s].loops || null } : { W: roll ? Math.max(result.length || 0, 1e-6) : Number(sheet.w), H: Number(sheet.h), loops: null }));
  const H = Math.max(...dims.map((d) => d.H)), W = Math.max(...dims.map((d) => d.W));
  const g = gap ?? H * 0.1;
  const th = textHeight ?? Math.max(H / 150, units === 'in' ? 0.1 : 2.5);
  const offs = [];
  { let y = 0; for (let s = 0; s < nSheets; s++) { offs.push(y); y -= dims[s].H + g; } }
  const L = [];
  const put = (c, v) => { L.push(String(c), typeof v === 'number' ? fmt(v) : String(v)); };
  // header
  put(0, 'SECTION'); put(2, 'HEADER');
  put(9, '$ACADVER'); put(1, 'AC1009');
  put(9, '$INSBASE'); put(10, 0); put(20, 0); put(30, 0);
  put(9, '$EXTMIN'); put(10, 0); put(20, offs[nSheets - 1]); put(30, 0);
  put(9, '$EXTMAX'); put(10, W); put(20, dims[0].H); put(30, 0);
  put(9, '$MEASUREMENT'); put(70, units === 'in' ? 0 : 1);
  put(0, 'ENDSEC');
  // tables: the line type and the layers
  const layers = [['0', 7], ['SHEET', 8], ['PARTS', 7], ['LABELS', 3]];
  if (rem.length) layers.push(['REMNANTS', 5]);
  put(0, 'SECTION'); put(2, 'TABLES');
  put(0, 'TABLE'); put(2, 'LTYPE'); put(70, 1);
  put(0, 'LTYPE'); put(2, 'CONTINUOUS'); put(70, 0); put(3, 'Solid line');   // i18n-ignore: the DXF line type's own description put(72, 65); put(73, 0); put(40, 0);
  put(0, 'ENDTAB');
  put(0, 'TABLE'); put(2, 'LAYER'); put(70, layers.length);
  for (const [name, color] of layers) { put(0, 'LAYER'); put(2, name); put(70, 0); put(62, color); put(6, 'CONTINUOUS'); }
  put(0, 'ENDTAB');
  put(0, 'TABLE'); put(2, 'STYLE'); put(70, 1);
  put(0, 'STYLE'); put(2, 'STANDARD'); put(70, 0); put(40, 0); put(41, 1); put(50, 0); put(71, 0); put(42, th); put(3, 'txt'); put(4, '');
  put(0, 'ENDTAB');
  put(0, 'ENDSEC');
  put(0, 'SECTION'); put(2, 'BLOCKS'); put(0, 'ENDSEC');
  put(0, 'SECTION'); put(2, 'ENTITIES');
  const poly = (layer, pts, dy) => {
    put(0, 'POLYLINE'); put(8, layer); put(66, 1); put(10, 0); put(20, 0); put(30, 0); put(70, 1);
    for (const p of pts) { put(0, 'VERTEX'); put(8, layer); put(10, p.x); put(20, p.y + dy); put(30, 0); if (p.b) put(42, p.b); }
    put(0, 'SEQEND'); put(8, layer);
  };
  const text = (x, y, h, str) => { put(0, 'TEXT'); put(8, 'LABELS'); put(10, x); put(20, y); put(30, 0); put(40, h); put(1, dxfText(str)); put(72, 1); put(11, x); put(21, y); put(31, 0); put(73, 2); };
  for (let s = 0; s < nSheets; s++) {
    const dy = offs[s], len = dims[s].W, hh = dims[s].H;
    if (dims[s].loops) for (const l of dims[s].loops) poly('SHEET', l, dy);
    else poly('SHEET', [{ x: 0, y: 0 }, { x: len, y: 0 }, { x: len, y: hh }, { x: 0, y: hh }], dy);
    for (const p of result.placed.filter((q) => q.sheet === s)) {
      for (const l of p.loops) poly('PARTS', l, dy);
      if (labels) {
        const f = flatten(p.loops[0], th / 10);
        const c = f.reduce((a, q) => ({ x: a.x + q.x / f.length, y: a.y + q.y / f.length }), { x: 0, y: 0 });
        text(c.x, c.y + dy, th, String(p.name || p.id || 'Part'));
      }
    }
    for (const r of rem.filter((q) => q.sheet === s)) {
      for (const l of r.loops) poly('REMNANTS', l, dy);
      if (labels && r.text) text(r.at.x, r.at.y + dy, Math.min(th * 1.4, r.h || th * 1.4), r.text);
    }
  }
  put(0, 'ENDSEC'); put(0, 'EOF');
  return L.join('\n') + '\n';
}
const fmt = (v) => { if (!Number.isFinite(v)) return '0'; const s = (Math.abs(v) < 1e-12 ? 0 : v).toFixed(6); return s.replace(/\.?0+$/, '') || '0'; };
/** R12 text: one line, plain ASCII (others as ?), at most 250 characters. */
const dxfText = (s) => s.replace(/[\r\n]+/g, ' ').replace(/[^\x20-\x7e]/g, '?').slice(0, 250);
