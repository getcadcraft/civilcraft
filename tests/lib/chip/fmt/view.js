/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view.js — plan what a layout view draws, without a canvas (node-testable). Big layouts stay quick because:
 *   - every cell knows its bounding box (children included) and each shape's box; cells with many shapes get a grid index;
 *   - a placement whose box is outside the window is skipped, and an array is cut to the rows and columns the window shows;
 *   - a placement smaller than `minPx` on screen is drawn as its outline box (level of detail), and so is a whole array whose items are,
 *     a parent's small single placements together (one box), and a small cell whose shapes average under a pixel;
 *   - a cell drawn in full is drawn from its own cached outline at each placement (instanced: draw `{ cell, m, idx: null }`);
 *   - shapes smaller than `tinyPx` are counted, not drawn; a big flat cell whose shapes average under `densityPx` is drawn as its grid
 *     bins shaded by how many shapes each holds (a density view); and the plan stops at `maxShapes` / `maxDraws` with `truncated`.
 *
 *   buildIndex(lib) → index
 *   planView(index, top, { x0, y0, x1, y1, scale }, opts) → { draws: [{ cell, m, idx }], boxes: [{ cell, m, box }], density: [{ cell, m, bins: [[x0, y0, x1, y1, n]], max }], stats }
 *     view rectangle in database units; scale = pixels per database unit; m = [a, b, c, d, e, f] cell → top coordinates.
 */
import { cellBBoxes, refMatrix, mul, IDENT, invert, boxThrough, repCount } from './layout.js';

const GRID_FROM = 512; // shapes in a cell before it gets a grid
export function buildIndex(lib) {
  const bb = cellBBoxes(lib), cells = new Map();
  for (const n of lib.order) {
    const c = lib.cells[n], S = c.shapes, boxes = new Float64Array(S.n * 4), t = [0, 0, 0, 0];
    for (let i = 0; i < S.n; i++) { S.bbox(i, t); boxes.set(t, i * 4); }
    let sum = 0; for (let i = 0; i < S.n; i++) sum += Math.max(boxes[i * 4 + 2] - boxes[i * 4], boxes[i * 4 + 3] - boxes[i * 4 + 1]);
    const e = { name: n, cell: c, bbox: bb.get(n), boxes, grid: null, meanSize: S.n ? sum / S.n : 0 };
    if (S.n >= GRID_FROM && e.bbox) {
      const G = Math.min(160, Math.ceil(Math.sqrt(S.n / 8))), [x0, y0, x1, y1] = e.bbox, gw = (x1 - x0) / G || 1, gh = (y1 - y0) / G || 1;
      const count = new Uint32Array(G * G + 1), cellOf = (i) => { const cx = Math.min(G - 1, Math.max(0, Math.floor(((boxes[i * 4] + boxes[i * 4 + 2]) / 2 - x0) / gw))), cy = Math.min(G - 1, Math.max(0, Math.floor(((boxes[i * 4 + 1] + boxes[i * 4 + 3]) / 2 - y0) / gh))); return cy * G + cx; };
      // each shape goes in the bin of its centre; a query widens by the largest shape in the cell
      let maxW = 0, maxH = 0; for (let i = 0; i < S.n; i++) { maxW = Math.max(maxW, boxes[i * 4 + 2] - boxes[i * 4]); maxH = Math.max(maxH, boxes[i * 4 + 3] - boxes[i * 4 + 1]); }
      const bin = new Uint32Array(S.n); for (let i = 0; i < S.n; i++) { bin[i] = cellOf(i); count[bin[i] + 1]++; }
      for (let k = 1; k <= G * G; k++) count[k] += count[k - 1];
      const start = count.slice(), items = new Uint32Array(S.n); for (let i = 0; i < S.n; i++) items[start[bin[i]]++] = i;
      e.grid = { G, x0, y0, gw, gh, start: count, items, maxW, maxH };
    }
    cells.set(n, e);
  }
  // per cell: the largest single placement inside it and the box of all its placements (so a row of tiny cells is skipped in one step)
  for (const e of cells.values()) {
    let maxRef = 0, refBox = null;
    for (const r of e.cell.refs) { const cb = bb.get(r.cell); if (!cb) continue; const b = boxThrough(refMatrix(r), cb); maxRef = Math.max(maxRef, b[2] - b[0], b[3] - b[1]); const x = r.rep ? repBox(b, r.rep) : b; refBox = refBox ? [Math.min(refBox[0], x[0]), Math.min(refBox[1], x[1]), Math.max(refBox[2], x[2]), Math.max(refBox[3], x[3])] : x; }
    e.maxRef = maxRef; e.refBox = refBox;
  }
  return { lib, cells };
}

const repBox = (b, r) => { if (r.kind !== 'lattice') { let x0 = 0, y0 = 0, x1 = 0, y1 = 0; for (let k = 0; k < r.d.length; k += 2) { x0 = Math.min(x0, r.d[k]); x1 = Math.max(x1, r.d[k]); y0 = Math.min(y0, r.d[k + 1]); y1 = Math.max(y1, r.d[k + 1]); } return [b[0] + x0, b[1] + y0, b[2] + x1, b[3] + y1]; } const xs = [0, (r.nx - 1) * r.ax[0], (r.ny - 1) * r.ay[0], (r.nx - 1) * r.ax[0] + (r.ny - 1) * r.ay[0]], ys = [0, (r.nx - 1) * r.ax[1], (r.ny - 1) * r.ay[1], (r.nx - 1) * r.ax[1] + (r.ny - 1) * r.ay[1]]; return [b[0] + Math.min(...xs), b[1] + Math.min(...ys), b[2] + Math.max(...xs), b[3] + Math.max(...ys)]; };
const inter = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
const inside = (a, b) => a[0] >= b[0] && a[2] <= b[2] && a[1] >= b[1] && a[3] <= b[3];

export function planView(index, top, vp, { minPx = 8, tinyPx = 0.5, densityPx = 2, maxShapes = 400000, maxDraws = 50000 } = {}) {
  const draws = [], boxes = [], density = [], st = { instances: 0, shapes: 0, tiny: 0, culled: 0, lod: 0, density: 0, arraysCut: 0, truncated: false };
  const view = [vp.x0, vp.y0, vp.x1, vp.y1], scale = vp.scale;
  const visit = (name, M, depth) => {
    if (st.truncated) return; const e = index.cells.get(name); if (!e || !e.bbox || depth > 64) return;
    const wb = boxThrough(M, e.bbox); if (!inter(wb, view)) { st.culled++; return; }
    const msc = Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2])) * scale; // pixels per cell unit
    if (depth > 0 && Math.max(wb[2] - wb[0], wb[3] - wb[1]) * scale < minPx) { boxes.push({ cell: name, m: M, box: e.bbox }); st.lod++; return; }
    st.instances++;
    const S = e.cell.shapes;
    if (S.n && !e.grid && depth > 0 && e.meanSize * msc < tinyPx * 2) { boxes.push({ cell: name, m: M, box: e.bbox }); st.lod += S.n; } // its shapes are mostly under a pixel: its outline says more
    else if (S.n && e.grid && e.meanSize * msc < densityPx) { // a big flat cell seen from far: its grid bins, shaded by how full they are
      const g = e.grid, local = boxThrough(invert(M), view), cx0 = Math.max(0, Math.floor((local[0] - g.x0) / g.gw)), cx1 = Math.min(g.G - 1, Math.floor((local[2] - g.x0) / g.gw)), cy0 = Math.max(0, Math.floor((local[1] - g.y0) / g.gh)), cy1 = Math.min(g.G - 1, Math.floor((local[3] - g.y0) / g.gh));
      let max = 0; const bins = []; for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { const k = cy * g.G + cx, n = g.start[k + 1] - g.start[k]; if (!n) continue; if (n > max) max = n; bins.push([g.x0 + cx * g.gw, g.y0 + cy * g.gh, g.x0 + (cx + 1) * g.gw, g.y0 + (cy + 1) * g.gh, n]); }
      density.push({ cell: name, m: M, bins, max }); st.density += bins.length; st.lod += S.n;
    } else if (S.n) {
      const local = boxThrough(invert(M), view), all = inside(e.bbox, local);
      let idx = null, n = S.n; // a cell wholly in the window is drawn whole, from its cached outline (instanced)
      if (!all) {
        const pick = [], bx = e.boxes;
        const test = (i) => { const o = i * 4; if (bx[o] > local[2] || bx[o + 2] < local[0] || bx[o + 1] > local[3] || bx[o + 3] < local[1]) return; if (Math.max(bx[o + 2] - bx[o], bx[o + 3] - bx[o + 1]) * msc < tinyPx) { st.tiny++; return; } pick.push(i); };
        if (e.grid) {
          const g = e.grid, cx0 = Math.max(0, Math.floor((local[0] - g.maxW / 2 - g.x0) / g.gw)), cx1 = Math.min(g.G - 1, Math.floor((local[2] + g.maxW / 2 - g.x0) / g.gw)), cy0 = Math.max(0, Math.floor((local[1] - g.maxH / 2 - g.y0) / g.gh)), cy1 = Math.min(g.G - 1, Math.floor((local[3] + g.maxH / 2 - g.y0) / g.gh));
          for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { const k = cy * g.G + cx; for (let p = g.start[k]; p < g.start[k + 1]; p++) test(g.items[p]); }
        } else for (let i = 0; i < S.n; i++) test(i);
        idx = Uint32Array.from(pick); n = idx.length;
      }
      if (n) { draws.push({ cell: name, m: M, idx }); st.shapes += n; }
      if (st.shapes > maxShapes || draws.length > maxDraws) { st.truncated = true; return; }
    }
    if (e.refBox && e.maxRef * msc < minPx) { boxes.push({ cell: name, m: M, box: e.refBox, group: e.cell.refs.length }); st.lod += e.cell.refs.length; return; } // every placement inside is too small to see
    let small = null, smallN = 0;
    for (const r of e.cell.refs) {
      const ce = index.cells.get(r.cell); if (!ce || !ce.bbox) continue;
      const R = refMatrix(r), MR = mul(M, R);
      if (!r.rep) { // small single placements are gathered into one outline box per parent (a row of 250 tiny cells = one box)
        const wb2 = boxThrough(MR, ce.bbox); if (!inter(wb2, view)) { st.culled++; continue; }
        if (Math.max(wb2[2] - wb2[0], wb2[3] - wb2[1]) * scale < minPx) { const lb = boxThrough(R, ce.bbox); small = small ? [Math.min(small[0], lb[0]), Math.min(small[1], lb[1]), Math.max(small[2], lb[2]), Math.max(small[3], lb[3])] : lb; smallN++; st.lod++; continue; }
        visit(r.cell, MR, depth + 1); continue;
      }
      // the whole array's box first
      const cb = boxThrough(R, ce.bbox), rep = r.rep;
      if (rep.kind === 'lattice') {
        const ext = [Math.min(0, (rep.nx - 1) * rep.ax[0]) + Math.min(0, (rep.ny - 1) * rep.ay[0]), Math.min(0, (rep.nx - 1) * rep.ax[1]) + Math.min(0, (rep.ny - 1) * rep.ay[1]), Math.max(0, (rep.nx - 1) * rep.ax[0]) + Math.max(0, (rep.ny - 1) * rep.ay[0]), Math.max(0, (rep.nx - 1) * rep.ax[1]) + Math.max(0, (rep.ny - 1) * rep.ay[1])];
        const arr = [cb[0] + ext[0], cb[1] + ext[1], cb[2] + ext[2], cb[3] + ext[3]], warr = boxThrough(M, arr);
        if (!inter(warr, view)) { st.culled += repCount(rep); continue; }
        const one = boxThrough(M, cb);
        if (Math.max(one[2] - one[0], one[3] - one[1]) * scale < minPx) { boxes.push({ cell: r.cell, m: M, box: arr, array: [rep.nx, rep.ny] }); st.lod += repCount(rep); continue; }
        let i0 = 0, i1 = rep.nx - 1, j0 = 0, j1 = rep.ny - 1;
        if (rep.ax[1] === 0 && rep.ay[0] === 0 && rep.ax[0] > 0 && rep.ay[1] > 0) { // axis-aligned lattice: only the visible rows and columns
          const lv = boxThrough(invert(M), view);
          i0 = Math.max(0, Math.ceil((lv[0] - cb[2]) / rep.ax[0])); i1 = Math.min(rep.nx - 1, Math.floor((lv[2] - cb[0]) / rep.ax[0]));
          j0 = Math.max(0, Math.ceil((lv[1] - cb[3]) / rep.ay[1])); j1 = Math.min(rep.ny - 1, Math.floor((lv[3] - cb[1]) / rep.ay[1]));
          const cut = rep.nx * rep.ny - Math.max(0, i1 - i0 + 1) * Math.max(0, j1 - j0 + 1); if (cut > 0) { st.culled += cut; st.arraysCut++; }
        }
        for (let j = j0; j <= j1 && !st.truncated; j++) for (let i = i0; i <= i1 && !st.truncated; i++) visit(r.cell, mul(M, refMatrix(r, i * rep.ax[0] + j * rep.ay[0], i * rep.ax[1] + j * rep.ay[1])), depth + 1);
      } else for (let k = 0; k < rep.d.length && !st.truncated; k += 2) visit(r.cell, mul(M, refMatrix(r, rep.d[k], rep.d[k + 1])), depth + 1);
    }
    if (small) boxes.push({ cell: name, m: M, box: small, group: smallN });
  };
  visit(top, IDENT, 0);
  return { draws, boxes, density, stats: st };
}

/** Window that shows a whole cell with a margin, for a canvas of w × h pixels. */
export function fitView(index, top, w, h, margin = 0.04) {
  const b = index.cells.get(top)?.bbox || [0, 0, 1, 1], bw = (b[2] - b[0]) || 1, bh = (b[3] - b[1]) || 1, scale = Math.min(w / (bw * (1 + 2 * margin)), h / (bh * (1 + 2 * margin)));
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; return { x0: cx - w / scale / 2, y0: cy - h / scale / 2, x1: cx + w / scale / 2, y1: cy + h / scale / 2, scale };
}
/** The window after zooming by `f` about a point (database units). */
export function zoomView(v, f, px, py) { const s = v.scale * f; return { x0: px - (px - v.x0) / f, y0: py - (py - v.y0) / f, x1: px + (v.x1 - px) / f, y1: py + (v.y1 - py) / f, scale: s }; }
