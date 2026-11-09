/* SPDX-License-Identifier: Apache-2.0 */
/**
 * relief.js — carving a depth map (a grey picture) into a relief (lib/carve). DOM-free. Millimetres, z ≤ 0 below the top of the stock.
 *   relief(image, opts) → { ops, stats, height }
 *     image = { w, h, data }   data[k] ∈ 0..1 per pixel, row 0 at the top of the picture (a decoded greyscale picture)
 *     opts  { width (mm, default 100), depth (mm, default 3), invert (false: white = the top, black = the deepest), tool, stepover, direction, tol,
 *             rough: { tool, stepdown, stepover, leave } | null }
 *     tool  { type: 'ball' | 'flat' | 'v', dia, angle }   (the finishing cutter; a V-bit uses angle)
 *     stepover   as a fraction of the tool's diameter between finishing lines (default 0.12 for a ball, 0.4 for flat, 0.2 for V)
 *   The cutter is dropped onto the surface ("drop cutter"): at every point its tip goes as low as it can without the tool's body touching the
 *   relief, so nothing is gouged. The roughing clears layers with a flat mill to `leave` mm above the finished relief.
 *   ops = [{ id: 'rough' | 'finish', tool, paths: [[[x, y, z]…]] }].  The picture is resampled to at most 1200 pixels on its long side.
 */
import { toolHeight } from './sim.js';
import { simplify } from './geom.js';

export const RELIEF_DEFAULTS = { width: 100, depth: 3, invert: false, tool: { type: 'ball', dia: 3 }, direction: 'x', tol: 0.01, maxPx: 1200, rough: { tool: { type: 'flat', dia: 6 }, stepdown: 1.5, stepover: 0.5, leave: 0.3 } };

/** The picture as a height field: { w, h, p (mm per cell), z: Float32Array (≤ 0), width, height } with row 0 at the BOTTOM (y up). */
export function heightField(image, { width = 100, depth = 3, invert = false, maxPx = 1200 } = {}) {
  if (!image || !(image.w > 1) || !(image.h > 1) || !image.data || image.data.length < image.w * image.h) throw Object.assign(new Error('carve.err.image'), { key: 'carve.err.image' });
  const k = Math.max(1, Math.ceil(Math.max(image.w, image.h) / maxPx));
  const w = Math.floor(image.w / k), h = Math.floor(image.h / k);
  const p = width / w, z = new Float32Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      let s = 0;
      for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) s += image.data[(j * k + b) * image.w + i * k + a];
      const g = Math.max(0, Math.min(1, s / (k * k)));
      z[(h - 1 - j) * w + i] = -depth * (invert ? g : 1 - g);   // picture row 0 is the top: y runs up
    }
  }
  return { w, h, p, z, width, height: h * p, depth };
}

/** The lowest the tip may go at cell (i, j): the highest, over the cells under the tool, of the surface less the tool's height there. */
function dropper(H, tool, reach) {
  const R = Math.min(reach, tool.type === 'v' ? H.depth * Math.tan((tool.angle * Math.PI) / 360) + H.p : tool.dia / 2);
  const Rg = R + 0.5 * H.p;   // a little more than the tool: a grid cell the tool only grazes counts, so the surface between cell centres is not gouged
  const n = Math.ceil(Rg / H.p), offs = [];
  for (let dj = -n; dj <= n; dj++) for (let di = -n; di <= n; di++) { const rho = Math.hypot(di, dj) * H.p; if (rho <= Rg + 1e-9) { const t = toolHeight(tool, Math.min(rho, R)); if (Number.isFinite(t)) offs.push([di, dj, t]); } }
  return (i, j) => {
    let best = -Infinity;
    for (const [di, dj, t] of offs) {
      const a = i + di, b = j + dj;
      const v = (a < 0 || b < 0 || a >= H.w || b >= H.h ? 0 : H.z[b * H.w + a]) - t;   // outside the picture the stock is untouched (z = 0)
      if (v > best) best = v;
    }
    return best;
  };
}

export function relief(image, o = {}) {
  const opt = { ...RELIEF_DEFAULTS, ...o, tool: { ...RELIEF_DEFAULTS.tool, ...(o.tool || {}) } };
  const H = heightField(image, opt);
  const tool = opt.tool;
  if (tool.type !== 'v' && !(tool.dia > 0)) throw Object.assign(new Error('carve.err.tool'), { key: 'carve.err.tool' });
  const tanH = tool.type === 'v' ? Math.tan((tool.angle * Math.PI) / 360) : 0;
  // between two lines a V-bit leaves a ridge of (stepover / 2) / tan(half angle): the stepover is chosen from the ridge you accept (default 0.1 mm)
  const stepMm = Number(opt.stepover) > 0 ? Number(opt.stepover) * (tool.type === 'v' ? 1 : tool.dia) : tool.type === 'ball' ? 0.12 * tool.dia : tool.type === 'flat' ? 0.4 * tool.dia : Math.max(H.p, 2 * (Number(opt.ridge) > 0 ? Number(opt.ridge) : 0.1) * tanH);
  const dia = tool.type === 'v' ? 1 : tool.dia, frac = stepMm / dia;
  const rows = (stepMm, vertical) => {
    const n = vertical ? H.w : H.h, step = Math.max(1, Math.round(stepMm / H.p)), out = [];
    for (let r = 0; r < n; r += step) out.push(r);
    if (out[out.length - 1] !== n - 1) out.push(n - 1);
    return out;
  };
  const vertical = opt.direction === 'y';
  const line = (drop, r) => { const m = vertical ? H.h : H.w, pts = []; for (let q = 0; q < m; q++) { const i = vertical ? r : q, j = vertical ? q : r; pts.push([(i + 0.5) * H.p, (j + 0.5) * H.p, drop(i, j)]); } return pts; };
  const xy = (i, j) => [(i + 0.5) * H.p, (j + 0.5) * H.p];
  const ops = [];

  // roughing: layers of a flat mill, down to the finished surface less `leave`
  if (opt.rough) {
    const rt = { type: 'flat', ...(opt.rough.tool || {}) }, leave = Math.max(0, Number(opt.rough.leave) || 0), sd = Math.max(0.1, Number(opt.rough.stepdown) || 1.5);
    const drop = dropper(H, rt, rt.dia / 2);
    const rr = rows(rt.dia * Math.min(0.95, Math.max(0.1, Number(opt.rough.stepover) || 0.5)), vertical);
    const lines = rr.map((r) => { const m = vertical ? H.h : H.w, zr = new Float32Array(m); for (let q = 0; q < m; q++) zr[q] = Math.min(0, drop(vertical ? r : q, vertical ? q : r) + leave); return { r, zr }; });
    let minZ = 0;
    for (const l of lines) for (const v of l.zr) if (v < minZ) minZ = v;
    const paths = [];
    for (let L = -sd, flip = false; ; L -= sd) {
      const level = Math.max(L, minZ);
      const layer = [];
      for (const { r, zr } of lines) {
        const m = zr.length;
        let q = 0;
        const runs = [];
        while (q < m) {
          if (zr[q] < level - 1e-6 || (level === minZ && zr[q] <= level + 1e-6 && zr[q] < 0)) { const a = q; while (q < m && (zr[q] < level - 1e-6 || (level === minZ && zr[q] <= level + 1e-6 && zr[q] < 0))) q++; runs.push([a, q - 1]); } else q++;
        }
        for (const [a, b] of runs) {
          const [x0, y0] = vertical ? xy(r, a) : xy(a, r), [x1, y1] = vertical ? xy(r, b) : xy(b, r);
          layer.push(a === b ? [[x0, y0, level]] : [[x0, y0, level], [x1, y1, level]]);
        }
      }
      // zig-zag the passes: every other one runs the other way
      for (const p of layer) { if (flip && p.length === 2) p.reverse(); }
      flip = !flip;
      paths.push(...layer);
      if (level === minZ) break;
    }
    if (paths.length) ops.push({ id: 'rough', tool: rt, paths });
  }

  // finishing: lines across the whole picture, the tip dropped onto the surface
  const drop = dropper(H, tool, tool.type === 'v' ? 1e9 : tool.dia / 2);
  const fin = [];
  let flip = false;
  for (const r of rows(dia * frac, vertical)) {
    let pts = line(drop, r).map((q) => [q[0], q[1], Math.min(0, q[2])]);
    pts = simplify(pts, Math.max(0.002, opt.tol));
    if (flip) pts.reverse();
    flip = !flip;
    fin.push(pts);
  }
  ops.push({ id: 'finish', tool, paths: fin });
  let length = 0, deepest = 0;
  for (const op of ops) for (const p of op.paths) for (let k = 0; k < p.length; k++) { if (p[k][2] < deepest) deepest = p[k][2]; if (k) length += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1], p[k][2] - p[k - 1][2]); }
  // the scallop a ball leaves between lines: r - sqrt(r² - (stepover/2)²)
  const scallop = tool.type === 'ball' ? tool.dia / 2 - Math.sqrt(Math.max(0, (tool.dia / 2) ** 2 - (dia * frac / 2) ** 2)) : null;
  return { ops, height: H, stats: { width: H.width, height: H.height, depth: H.depth, cell: H.p, finishLines: fin.length, rough: !!opt.rough, length, deepest, scallop, stepover: dia * frac } };
}
