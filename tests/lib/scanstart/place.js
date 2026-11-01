/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — kinds and keys are read by code; hosts word them. */
/**
 * place.js — cc-scanstart: where a scanned sheet sits in a project (Super 0.1, "Start from a scan" in Layout). DOM-free; the
 * same file runs in every host and in Node (bin/test-scanstart.mjs). Canonical in lib/scanstart; hosts carry byte copies
 * (tools/scanstart/sync.mjs <host>). Plain arithmetic: no trained model, no network (the scan rule, docs/apps/scanned-drawings.md).
 *
 * Pixels are the scan's own: x right, y DOWN, (0, 0) the top-left corner of the top-left pixel. Project coordinates: x east, y north.
 * A placement is a GDAL geotransform gt = [x0, a, b, y0, d, e]: X = x0 + a·px + b·py, Y = y0 + d·px + e·py (gis map layers use it).
 *
 *   scaleFromTwo(p1, p2, dist)                     → units per pixel | null       two points on the scan and their true distance
 *   scaleFromStated({ dpi, per, ratio, unit })     → units per pixel | null       "1 in = per (unit)" or "1 : ratio" at the scan's dpi
 *   gtFromScale({ upp, h, origin, rotationDeg })   → gt                            the sheet's lower-left corner at origin, turned
 *   fitPoints(pairs, { mode })                     → { gt, mode, scale, rotationDeg, residuals[], rms, checked, worst | null } | null
 *        pairs [{ px, py, x, y }] — 2+ for 'similarity' (shift, turn, one scale: a sheet keeps its shape), 3+ for 'affine'
 *        (a scale per direction and shear: paper that stretched in the scanner). Least squares; residuals say how well
 *        the points agree, in project units, so a mistyped coordinate shows up before anything is made.
 *   apply(gt, px, py) → [X, Y] · invert(gt) → gt⁻¹ (project → pixel) · unitsPerPixel(gt) · rotationOf(gt)
 *   traceLayers(result, gt, { name, source, minLen }) → [GIS layer]   cc-raster trace() lines and arcs as one line layer in project
 *        coordinates ({ name, geom: 'ln', fields, hasZ: false, features: [{ g: { t: 'ln', c: [[[x, y], …]] }, p }], source })
 *   record({ file, page, pages, format, dpi, sha256, placed, rms, when, steps }) → flat fields kept with the picture (provenance)
 */

export const UNIT_M = { m: 1, ft: 0.3048, ftUS: 1200 / 3937, mm: 0.001, cm: 0.01, in: 0.0254, km: 1000, mi: 1609.344, yd: 0.9144 };
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function scaleFromTwo(p1, p2, dist) {
  const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (!(d > 0) || !fin(dist) || !(dist > 0)) return null;
  return dist / d;
}

/** At `dpi`, either 1 inch on paper = `per` project units (an engineer's scale, 1" = 50'), or 1 : `ratio` (paper → real) with the
 *  project in `unit`. */
export function scaleFromStated({ dpi, per = null, ratio = null, unit = 'ft' } = {}) {
  if (!fin(dpi) || !(dpi > 0)) return null;
  if (fin(per) && per > 0) return per / dpi;
  if (fin(ratio) && ratio > 0 && UNIT_M[unit]) return (ratio * UNIT_M.in / UNIT_M[unit]) / dpi;
  return null;
}

/** The sheet (h pixels tall) with its lower-left corner at origin, turned anticlockwise by rotationDeg, upp units per pixel. */
export function gtFromScale({ upp, h, origin = { x: 0, y: 0 }, rotationDeg = 0 }) {
  const th = rotationDeg * Math.PI / 180, c = upp * Math.cos(th), d = upp * Math.sin(th);
  // X = c·px + d·py + tx, Y = d·px − c·py + ty (y down on the sheet, up in the project); pixel (0, h) → origin
  return [origin.x - d * h, c, d, origin.y + c * h, d, -c];
}

export const apply = (gt, px, py) => [gt[0] + gt[1] * px + gt[2] * py, gt[3] + gt[4] * px + gt[5] * py];
export function invert(gt) {
  const det = gt[1] * gt[5] - gt[2] * gt[4];
  if (!det) return null;
  const a = gt[5] / det, b = -gt[2] / det, d = -gt[4] / det, e = gt[1] / det;
  return [-(a * gt[0] + b * gt[3]), a, b, -(d * gt[0] + e * gt[3]), d, e];
}
export const unitsPerPixel = (gt) => Math.sqrt(Math.abs(gt[1] * gt[5] - gt[2] * gt[4]));
export const rotationOf = (gt) => Math.atan2(gt[4], gt[1]) * 180 / Math.PI;

function solve3(A, b) {   // Gaussian elimination with pivoting; A 3×3, b 3 → x | null
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[3] / M[i][i]);
}

export function fitPoints(pairs, { mode = 'similarity' } = {}) {
  const P = (pairs || []).filter((q) => q && [q.px, q.py, q.x, q.y].every(fin));
  let gt = null;
  if (mode === 'affine') {
    if (P.length < 3) return null;
    // X = x0 + a·px + b·py; Y = y0 + d·px + e·py — normal equations, centred for conditioning
    const n = P.length, mx = P.reduce((s, q) => s + q.px, 0) / n, my = P.reduce((s, q) => s + q.py, 0) / n;
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
    for (const q of P) {
      const r = [1, q.px - mx, q.py - my];
      for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) A[i][j] += r[i] * r[j]; bx[i] += r[i] * q.x; by[i] += r[i] * q.y; }
    }
    const sx = solve3(A, bx), sy = solve3(A, by);
    if (!sx || !sy) return null;   // the points lie on one line
    gt = [sx[0] - sx[1] * mx - sx[2] * my, sx[1], sx[2], sy[0] - sy[1] * mx - sy[2] * my, sy[1], sy[2]];
  } else {
    if (P.length < 2) return null;
    // u = px, v = −py (y up); X = c·u − d·v + tx, Y = d·u + c·v + ty
    const n = P.length;
    const mu = P.reduce((s, q) => s + q.px, 0) / n, mv = P.reduce((s, q) => s - q.py, 0) / n;
    const mX = P.reduce((s, q) => s + q.x, 0) / n, mY = P.reduce((s, q) => s + q.y, 0) / n;
    let sxx = 0, sc = 0, sd = 0;
    for (const q of P) {
      const u = q.px - mu, v = -q.py - mv, X = q.x - mX, Y = q.y - mY;
      sxx += u * u + v * v; sc += u * X + v * Y; sd += u * Y - v * X;
    }
    if (!(sxx > 0)) return null;   // every scan point in one place
    const c = sc / sxx, d = sd / sxx;
    const tx = mX - (c * mu - d * mv), ty = mY - (d * mu + c * mv);
    gt = [tx, c, d, ty, d, -c];
  }
  const residuals = P.map((q) => { const [X, Y] = apply(gt, q.px, q.py); return Math.hypot(X - q.x, Y - q.y); });
  const rms = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length);
  // with exactly the minimum number of points every residual is 0: nothing checks the points (hosts say so); one more point shows
  // THAT they disagree but not which one is wrong (any one of them could be); from two more, the furthest off is named
  const min = mode === 'affine' ? 3 : 2, checked = P.length > min;
  const worst = P.length >= min + 2 ? residuals.reduce((w, r, i) => (r > residuals[w] ? i : w), 0) : null;
  return { gt, mode, scale: unitsPerPixel(gt), rotationDeg: rotationOf(gt), residuals, rms, worst, checked };
}

/** Arc (cc-raster trace(): y-down pixel angles, a0 < a1) → points every ≤ 5°. */
function arcPoints(a) {
  const span = a.a1 - a.a0, n = Math.max(2, Math.ceil(Math.abs(span) / (Math.PI / 36)));
  const out = [];
  for (let i = 0; i <= n; i++) { const t = a.a0 + span * i / n; out.push({ x: a.cx + a.r * Math.cos(t), y: a.cy + a.r * Math.sin(t) }); }
  return out;
}

export function traceLayers(result, gt, { name = 'SCAN-TRACE', source = null, minLen = 0 } = {}) {
  const features = [];
  const pt = (p) => apply(gt, p.x, p.y);
  for (const l of result?.lines || []) {
    const a = pt({ x: l.x1, y: l.y1 }), b = pt({ x: l.x2, y: l.y2 });
    if (![...a, ...b].every(fin) || Math.hypot(b[0] - a[0], b[1] - a[1]) <= minLen) continue;
    features.push({ g: { t: 'ln', c: [[a, b]] }, p: { KIND: 'line' } });
  }
  for (const r of result?.arcs || []) {
    const c = arcPoints(r).map(pt);
    if (c.length < 2 || !c.flat().every(fin)) continue;
    features.push({ g: { t: 'ln', c: [c] }, p: { KIND: 'arc' } });
  }
  if (!features.length) return [];
  return [{ name, geom: 'ln', hasZ: false, fields: [{ name: 'KIND', type: 'text' }], features, source }];
}

/** Flat fields (strings, numbers) a host keeps with the placed picture, so the project says where the sheet came from. */
export function record({ file = '', page = 0, pages = 1, format = '', dpi = null, sha256 = '', placed = '', rms = null, when = '', steps = [] } = {}) {
  return {
    scanFile: String(file).slice(0, 200), scanPage: (page | 0) + 1, scanPages: Math.max(1, pages | 0), scanFormat: String(format).slice(0, 20),
    scanDpi: fin(dpi) ? Math.round(dpi) : null, scanSha256: /^[0-9a-f]{64}$/.test(sha256) ? sha256 : '', scanPlaced: String(placed).slice(0, 20),
    scanRms: fin(rms) ? rms : null, scanWhen: String(when).slice(0, 40), scanSteps: steps.map(String).join(', ').slice(0, 200),
  };
}
