/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — kinds and keys are read by code and by assistants; the words the person sees go through t() in the page. */
/**
 * photosketch.js — cc-photosketch: sketch photo to drawing (0.8 round 2, EG.36, written in CadCraft by cad_PART_2; made a shared library in
 * round 3 by model_PART_3, rule 39: lib/photosketch is canonical, each host carries a byte copy at ./photosketch/ beside its ./raster/ copy,
 * tools/photosketch/sync.mjs <host>). On lib/raster (docs/apps/scanned-drawings.md). A photo of a sheet of paper
 * with a hand sketch on it becomes lines and arcs at a stated scale, one layer per pen colour. Classic image processing in plain
 * JavaScript, on this computer: no trained model, no network, no worker (the owner's condition for the scan trace, rule 35).
 *
 *   findSheet(img, opts)        → { corners[TL,TR,BR,BL] (photo pixels), fill, area } | null        the paper in the photo
 *   solveHomography(src, dst)   → 9 numbers (row-major 3×3) taking each src[i] to dst[i]
 *   unwarpSheet(img, corners, { maxSide, ratio }) → { img, ratio, flip }   the sheet seen straight on
 *   inkClasses(img, opts)       → { classes: { black, red, blue, green → bitmap }, ink }
 *   sketchFromPhoto(img, opts)  → { entities[], layers[], corners, found, report }                  the whole job (async: image decoding stays with the caller)
 *
 * opts of sketchFromPhoto: paper (a sheets.js PAPERS key, or 'auto'), scale (n of 1:n, default 1 = the page's own millimetres),
 * units (millimeters …, the drawing's), colours (true: a layer for each pen colour), corners (4 photo points when the person gave them),
 * tolPx (trace tolerance in pixels of the straightened sheet), maxSide (size of the straightened sheet, default 1800), origin ({x, y}).
 * What cannot be told (a sheet not found, a photo with no ink) comes back as `found: false` / an empty list, never a guess.
 */
import { toGrey, threshold, despeckle, trace } from '../raster/index.js';
import { PAPERS, UNIT_MM, arcThrough } from './paper.js';

export const LAYERS = { black: { name: 'SKETCH-BLACK', color: 7 }, red: { name: 'SKETCH-RED', color: 1 }, blue: { name: 'SKETCH-BLUE', color: 5 }, green: { name: 'SKETCH-GREEN', color: 3 } };

// ---- finding the paper ---------------------------------------------------------------------------------------

function downsample(g, maxSide) {
  const k = Math.max(1, Math.ceil(Math.max(g.w, g.h) / maxSide));
  const w = Math.floor(g.w / k), h = Math.floor(g.h / k), d = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) s += g.data[(y * k + j) * g.w + x * k + i];
    d[y * w + x] = Math.round(s / (k * k));
  }
  return { w, h, data: d, k };
}
const otsuLevel = (d) => {
  const hist = new Float64Array(256); for (const v of d) hist[v]++;
  const total = d.length; let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let wB = 0, sB = 0, best = 0, lvl = 128;
  for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = total - wB; if (!wF) break; sB += i * hist[i]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; lvl = i; } }
  return lvl;
};

/** The largest bright patch that fills most of its four-cornered outline: the paper. Photo pixels, TL TR BR BL (y down). */
export function findSheet(img, { minArea = 0.15, minFill = 0.82 } = {}) {
  const g = toGrey(img), s = downsample(g, 400), n = s.w * s.h;
  if (s.w < 8 || s.h < 8) return null;
  const lvl = otsuLevel(s.data);
  const seen = new Uint8Array(n), stack = new Int32Array(n);
  let best = null;
  for (let i0 = 0; i0 < n; i0++) {
    if (seen[i0] || s.data[i0] <= lvl) continue;
    let sp = 0, cnt = 0; stack[sp++] = i0; seen[i0] = 1;
    let tl = null, br = null, tr = null, bl = null, tlv = Infinity, brv = -Infinity, trv = -Infinity, blv = Infinity;
    while (sp) {
      const i = stack[--sp], x = i % s.w, y = (i - x) / s.w; cnt++;
      const a = x + y, b = x - y;
      if (a < tlv) { tlv = a; tl = [x, y]; } if (a > brv) { brv = a; br = [x, y]; } if (b > trv) { trv = b; tr = [x, y]; } if (b < blv) { blv = b; bl = [x, y]; }
      if (x > 0 && !seen[i - 1] && s.data[i - 1] > lvl) { seen[i - 1] = 1; stack[sp++] = i - 1; }
      if (x < s.w - 1 && !seen[i + 1] && s.data[i + 1] > lvl) { seen[i + 1] = 1; stack[sp++] = i + 1; }
      if (y > 0 && !seen[i - s.w] && s.data[i - s.w] > lvl) { seen[i - s.w] = 1; stack[sp++] = i - s.w; }
      if (y < s.h - 1 && !seen[i + s.w] && s.data[i + s.w] > lvl) { seen[i + s.w] = 1; stack[sp++] = i + s.w; }
    }
    if (!best || cnt > best.cnt) best = { cnt, tl, tr, br, bl };
  }
  if (!best || best.cnt < minArea * n) return null;
  const q = [best.tl, best.tr, best.br, best.bl];
  let a = 0; for (let i = 0; i < 4; i++) { const p = q[i], r = q[(i + 1) % 4]; a += p[0] * r[1] - r[0] * p[1]; }
  const quad = Math.abs(a) / 2, sign = a >= 0 ? 1 : -1;
  // ink that closes a figure cuts the paper in pieces: count every bright pixel inside the outline, not only the biggest piece
  let inside = 0;
  const x0 = Math.min(...q.map((p) => p[0])), x1 = Math.max(...q.map((p) => p[0])), y0 = Math.min(...q.map((p) => p[1])), y1 = Math.max(...q.map((p) => p[1]));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (s.data[y * s.w + x] <= lvl) continue;
    let in4 = true;
    for (let i = 0; i < 4 && in4; i++) { const p = q[i], r = q[(i + 1) % 4]; if (sign * ((r[0] - p[0]) * (y - p[1]) - (r[1] - p[1]) * (x - p[0])) < 0) in4 = false; }
    if (in4) inside++;
  }
  const fill = quad > 0 ? inside / quad : 0;
  if (fill < minFill || fill > 1.15) return null;
  return { corners: q.map(([x, y]) => ({ x: (x + 0.5) * s.k, y: (y + 0.5) * s.k })), fill: Math.min(1, fill), area: inside / n };
}

// ---- perspective ---------------------------------------------------------------------------------------------

/** 3×3 matrix (row-major, h33 = 1) with H·src[i] = dst[i] for four point pairs. */
export function solveHomography(src, dst) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i], { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u], [0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {   // Gauss–Jordan with partial pivoting
    let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-12) return null;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]; }
  }
  return [...Array.from({ length: 8 }, (_, i) => A[i][8] / A[i][i]), 1];
}
export const applyH = (H, x, y) => { const w = H[6] * x + H[7] * y + H[8]; return { x: (H[0] * x + H[1] * y + H[2]) / w, y: (H[3] * x + H[4] * y + H[5]) / w }; };

const RATIOS = PAPERS.map((p) => p.w / p.h);
/** The straight sheet's long/short ratio: the named paper's, else the nearest standard one within 8 %, else as measured. */
function sheetRatio(corners, paper) {
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const [tl, tr, br, bl] = corners;
  const w = (d(tl, tr) + d(bl, br)) / 2, h = (d(tl, bl) + d(tr, br)) / 2;
  const landscape = w >= h;
  let r = Math.max(w, h) / Math.min(w, h);
  const p = paper && paper !== 'auto' ? PAPERS.find((x) => x.key === paper) : null;
  if (p) r = p.w / p.h;
  else { const near = RATIOS.reduce((a, b) => (Math.abs(b - r) < Math.abs(a - r) ? b : a)); if (Math.abs(near - r) / near <= 0.08) r = near; }
  return { ratio: r, landscape };
}

/** The sheet straight on: an RGB (or grey) image of ratio × 1 at `maxSide` pixels along its long side. */
export function unwarpSheet(img, corners, { maxSide = 1800, paper = 'auto' } = {}) {
  const { ratio, landscape } = sheetRatio(corners, paper);
  const W = landscape ? maxSide : Math.round(maxSide / ratio), H = landscape ? Math.round(maxSide / ratio) : maxSide;
  const H2 = solveHomography([{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }], corners);   // sheet → photo
  if (!H2) return null;
  const ch = img.channels === 1 ? 1 : 3, out = new Uint8Array(W * H * ch);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = applyH(H2, x + 0.5, y + 0.5);
    const fx = Math.min(Math.max(p.x - 0.5, 0), img.w - 1.001), fy = Math.min(Math.max(p.y - 0.5, 0), img.h - 1.001);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
    for (let c = 0; c < ch; c++) {
      const i = (y0 * img.w + x0) * img.channels + c, j = i + img.channels, k = i + img.w * img.channels, l = k + img.channels;
      out[(y * W + x) * ch + c] = Math.round((img.data[i] * (1 - ax) + img.data[j] * ax) * (1 - ay) + (img.data[k] * (1 - ax) + img.data[l] * ax) * ay);
    }
  }
  return { img: { w: W, h: H, channels: ch, data: out }, ratio, landscape };
}

// ---- pen colours ---------------------------------------------------------------------------------------------

function classOf(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (mx === 0 || d / mx < 0.35 || d < 40) return 0;                     // black (or grey) ink
  let h;
  if (mx === r) h = ((g - b) / d + 6) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  h *= 60;
  if (h < 25 || h >= 330) return 1;                                      // red
  if (h >= 75 && h < 170) return 3;                                      // green
  if (h >= 180 && h < 270) return 2;                                     // blue
  return 0;
}
const CLASS_NAMES = ['black', 'red', 'blue', 'green'];

/** The ink of a straight sheet, split by pen colour: { classes: { name → bitmap }, ink } (bitmaps: 1 = ink, y down). */
export function inkClasses(img, { colours = true } = {}) {
  const bm = threshold(toGrey(img), { mode: 'auto' });
  const n = img.w * img.h, ink = bm.data.reduce((a, v) => a + v, 0);
  const out = { black: { w: img.w, h: img.h, data: new Uint8Array(n) } };
  if (!colours || img.channels === 1) { out.black.data.set(bm.data); return { classes: out, ink }; }
  const cls = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (bm.data[i]) cls[i] = classOf(img.data[i * 3], img.data[i * 3 + 1], img.data[i * 3 + 2]) + 1;
  // an edge of dark ink looks tinted after JPEG: each ink pixel takes the class most of its 5 × 5 neighbours have
  const fin = new Uint8Array(n), W = img.w, H = img.h;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!cls[i]) continue;
    const c = [0, 0, 0, 0, 0];
    for (let j = Math.max(0, y - 2); j <= Math.min(H - 1, y + 2); j++) for (let k = Math.max(0, x - 2); k <= Math.min(W - 1, x + 2); k++) c[cls[j * W + k]]++;
    let b = 1; for (let q = 2; q < 5; q++) if (c[q] > c[b]) b = q;
    fin[i] = b;
  }
  for (let q = 0; q < 4; q++) {
    const name = CLASS_NAMES[q], data = q === 0 ? out.black.data : new Uint8Array(n);
    let cnt = 0; for (let i = 0; i < n; i++) if (fin[i] === q + 1) { data[i] = 1; cnt++; }
    if (q > 0 && cnt >= Math.max(40, ink * 0.004)) out[name] = { w: W, h: H, data };
  }
  return { classes: out, ink };
}

// ---- the whole job ---------------------------------------------------------------------------------------------

/** → { found, corners, fill, size{w,h}, paperMm, unitsPerPx, layers[{ key, name, color, lines, arcs }], entities[], report } */
export function sketchFromPhoto(img, opts = {}) {
  const o = { paper: 'auto', scale: 1, units: 'millimeters', colours: true, tolPx: 1.6, maxSide: 1800, origin: { x: 0, y: 0 }, ...opts };
  let corners = Array.isArray(o.corners) && o.corners.length === 4 ? o.corners : null, fill = 1, found = !!corners;
  if (!corners) {
    const s = findSheet(img);
    if (s) { corners = s.corners; fill = s.fill; found = true; }
    else corners = [{ x: 0, y: 0 }, { x: img.w, y: 0 }, { x: img.w, y: img.h }, { x: 0, y: img.h }];   // no paper edge to find: the whole photo is the sheet
  }
  const flat = unwarpSheet(img, corners, { maxSide: o.maxSide, paper: o.paper });
  if (!flat) return { found: false, corners, entities: [], layers: [], report: { error: 'degenerate' } };
  const { classes, ink } = inkClasses(flat.img, { colours: o.colours });
  // size of the page in millimetres: the named paper's long side, else A4's 297 mm
  const p = o.paper !== 'auto' ? PAPERS.find((x) => x.key === o.paper) : null;
  const longMm = p ? Math.max(p.w, p.h) * (UNIT_MM[p.unit] || 1) : 297;
  const longPx = Math.max(flat.img.w, flat.img.h), mmPerPx = longMm / longPx;
  const unitMm = UNIT_MM[o.units] || 1, unitsPerPx = mmPerPx * o.scale / unitMm;
  const toDraw = (x, y) => ({ x: o.origin.x + x * unitsPerPx, y: o.origin.y + (flat.img.h - y) * unitsPerPx });
  const entities = [], layers = [], report = { ink, tolPx: o.tolPx, text: 0, hatch: 0 };
  for (const key of CLASS_NAMES) {
    const bm = classes[key]; if (!bm) continue;
    despeckle(bm, { maxArea: 12 });   // in place
    const res = trace(bm, { tol: o.tolPx });
    const L = LAYERS[key], made = [];
    for (const l of res.lines) { const a = toDraw(l.x1, l.y1), b = toDraw(l.x2, l.y2); made.push({ type: 'line', layer: L.name, color: null, x1: a.x, y1: a.y, x2: b.x, y2: b.y }); }
    for (const a of res.arcs) {
      const c = toDraw(a.cx, a.cy), r = a.r * unitsPerPx;
      if (a.a1 - a.a0 >= Math.PI * 2 - 1e-6) { made.push({ type: 'circle', layer: L.name, color: null, cx: c.x, cy: c.y, r }); continue; }
      const m = (a.a0 + a.a1) / 2, s = toDraw(a.sx, a.sy), e = toDraw(a.ex, a.ey), md = toDraw(a.cx + a.r * Math.cos(m), a.cy + a.r * Math.sin(m));
      const arc = arcThrough(s, md, e);
      if (arc) made.push({ type: 'arc', layer: L.name, color: null, cx: arc.cx, cy: arc.cy, r: arc.r, a0: arc.a0, a1: arc.a1 });
    }
    report.text += res.report.textPieces; report.hatch += res.report.hatchGroups;
    if (made.length) { entities.push(...made); layers.push({ key, name: L.name, color: L.color, lines: res.lines.length, arcs: res.arcs.length }); }
  }
  return { found, corners, fill, size: { w: flat.img.w, h: flat.img.h }, landscape: flat.landscape, paperMm: { long: longMm }, unitsPerPx, layers, entities, report };
}
