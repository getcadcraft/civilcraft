/* SPDX-License-Identifier: Apache-2.0 */
/**
 * photometry.js — luminaire files (IES LM-63, EULUMDAT) and point-by-point illuminance (0.8 round 2, EG.4; session `mep_PART_2`).
 * DOM-free, no IFC. Clean room (rule 32): the two file formats are read from their published layouts (IES LM-63-1991/1995/2002 text files;
 * EULUMDAT, Axel Stockmar 1990) and the maths is the inverse-square cosine law, E = I(γ, C) · cos θ / d² (the direct component,
 * what every lighting text calls point-by-point). Targets (lux, uniformity, W/m²) are values from a standard or a client brief:
 * the person types them; nothing here claims a standard's number.
 *
 * What the numbers are: DIRECT illuminance from the luminaires named, at the points given. No inter-reflection from walls and ceiling and no
 * blocking by furniture or walls — a lower bound for a room, a good figure for a site. `RESULT_NOTE` says so on every report.
 *
 *   parseIes(text) · parseLdt(text) · parsePhotometry(text, name) → { ok, photo } | { ok:false, key, line? }
 *     photo = { format, name, lumens, watts, type: 'C', vAngles, hAngles (0..360 full set), cd[h][v] (candela, absolute),
 *               sym, width, length, height (mm, luminous opening), maxCd, keywords }
 *   candela(photo, gamma, c) → cd (bilinear)
 *   frame(aim, rotDeg) → { n, r, s } — luminaire axes: n = nadir direction, r = the C0 direction
 *   illuminanceAt(luminaires, p, normal, llf) → lux
 *   gridPoints(polygon, { spacing, height, margin }) → [[x, y, z]] mm   ·   computeGrid(...) → { points, values, stats }
 */
export const RESULT_NOTE = 'Direct illuminance only: no inter-reflection from walls and ceiling, no blocking by furniture or walls. A lower bound for a room.';
export const DEFAULT_LLF = { value: 0.8, label: 'Default light loss factor 0.8 — set it from the maintenance plan' };
const rad = (d) => d * Math.PI / 180;

const nums = (text) => String(text).split(/[\s,]+/).filter(Boolean).map(Number);

// ------------------------------------------------------------------------------------------------------------- IES LM-63
export function parseIes(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  if (!/^IESNA/i.test((lines[0] || '').trim()) && !lines.some((l) => /^TILT\s*=/i.test(l.trim()))) return { ok: false, key: 'ies.nofile' };
  const keywords = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^TILT\s*=/i.test(l)) break;
    const m = /^\[([A-Za-z0-9_]+)\]\s*(.*)$/.exec(l);
    if (m) keywords[m[1].toUpperCase()] = (keywords[m[1].toUpperCase()] ? keywords[m[1].toUpperCase()] + ' ' : '') + m[2];
  }
  if (i >= lines.length) return { ok: false, key: 'ies.notilt' };
  const tilt = lines[i].trim().split('=')[1].trim().toUpperCase();
  i++;
  if (tilt === 'INCLUDE') {   // lamp-to-luminaire geometry, orientation, n pairs: read and discard
    const rest = nums(lines.slice(i).join(' '));
    const n = rest[1];
    if (!Number.isInteger(n) || n < 0 || n > 100) return { ok: false, key: 'ies.tilt' };
    const used = 2 + 2 * n;
    let eaten = 0, k = i;
    for (; k < lines.length && eaten < used; k++) eaten += nums(lines[k]).length;
    i = k;
  } else if (tilt !== 'NONE') return { ok: false, key: 'ies.tilt' };
  const v = nums(lines.slice(i).join(' '));
  if (v.length < 13 || v.some((x) => !Number.isFinite(x))) return { ok: false, key: 'ies.numbers' };
  const [nLamps, lumPerLamp, mult, nV, nH, ptype, units, w, l, h] = v;
  const [ballast, , inputW] = [v[10], v[11], v[12]];
  if (!Number.isInteger(nV) || !Number.isInteger(nH) || nV < 2 || nH < 1 || nV > 1000 || nH > 1000) return { ok: false, key: 'ies.counts' };
  if (ptype !== 1) return { ok: false, key: 'ies.type', vars: { type: ptype === 2 ? 'B' : ptype === 3 ? 'A' : String(ptype) } };
  const need = 13 + nV + nH + nV * nH;
  if (v.length < need) return { ok: false, key: 'ies.short' };
  const vA = v.slice(13, 13 + nV), hA = v.slice(13 + nV, 13 + nV + nH), flat = v.slice(13 + nV + nH, need);
  const k = units === 1 ? 304.8 : 1000;    // 1 = feet, 2 = metres
  if (vA.some((a, j) => j && a <= vA[j - 1]) || hA.some((a, j) => j && a <= hA[j - 1])) return { ok: false, key: 'ies.angles' };
  const cd = [];
  for (let a = 0; a < nH; a++) cd.push(flat.slice(a * nV, (a + 1) * nV).map((x) => x * (mult || 1) * (ballast || 1)));
  const full = expandIes(hA, cd);
  if (!full) return { ok: false, key: 'ies.hangles' };
  return finish({ format: 'ies', name: keywords.LUMINAIRE || keywords.LUMCAT || keywords.TEST || '', lumens: lumPerLamp > 0 ? nLamps * lumPerLamp : 0, watts: inputW, vAngles: vA, hAngles: full.h, cd: full.cd, sym: full.sym,
    width: Math.abs(w) * k, length: Math.abs(l) * k, height: Math.abs(h) * k, keywords });
}
/** LM-63 horizontal angle sets → the full 0..360 set (mirrored by the symmetry the angles announce). */
function expandIes(h, cd) {
  const last = h[h.length - 1], m = new Map();
  const put = (a, row) => { const k = Math.round((((a % 360) + 360) % 360) * 1e6) / 1e6; if (!m.has(k)) m.set(k, row); };
  let sym = 'none';
  if (h.length === 1) { if (h[0] !== 0) return null; put(0, cd[0]); sym = 'axial'; }
  else if (h[0] === 0 && last === 90) { h.forEach((a, i) => { put(a, cd[i]); put(180 - a, cd[i]); put(180 + a, cd[i]); put(360 - a, cd[i]); }); sym = 'quadrant'; }
  else if (h[0] === 0 && last === 180) { h.forEach((a, i) => { put(a, cd[i]); put(360 - a, cd[i]); }); sym = 'bilateral'; }
  else if (h[0] === 90 && last === 270) { h.forEach((a, i) => { put(a, cd[i]); put(540 - a, cd[i]); }); sym = 'bilateral'; }
  else if (h[0] === 0 && last === 360) { h.forEach((a, i) => put(a, cd[i])); }
  else if (h[0] === 0 && last < 360) { h.forEach((a, i) => put(a, cd[i])); }
  else return null;
  const keys = [...m.keys()].sort((x, y) => x - y);
  const H = keys.slice(), C = keys.map((k) => m.get(k));
  if (H[0] !== 0) return null;
  if (H[H.length - 1] !== 360) { H.push(360); C.push(C[0]); }
  if (H.length === 2) { /* axial: both ends equal */ }
  return { h: H, cd: C, sym };
}

// ------------------------------------------------------------------------------------------------------------- EULUMDAT
export function parseLdt(text) {
  const L = String(text || '').replace(/\r/g, '').split('\n').map((s) => s.trim());
  if (L.length < 30) return { ok: false, key: 'ldt.short' };
  const n = (k) => Number(String(L[k]).replace(',', '.'));
  const type = n(1), symm = n(2), Mc = n(3), Dc = n(4), Ng = n(5), Dg = n(6);
  if (![1, 2, 3].includes(type) || ![0, 1, 2, 3, 4].includes(symm) || !Number.isInteger(Mc) || !Number.isInteger(Ng) || Mc < 0 || Ng < 1 || Ng > 1000 || Mc > 1000) return { ok: false, key: 'ldt.header' };
  const name = L[8] || L[9] || '';
  const sizes = [12, 13, 14, 15, 16, 17, 18, 19, 20].map(n);                // mm: luminaire L, b, h; luminous area L, b, h C0, C90, C180, C270
  const lorl = n(22), cfac = n(23) || 1, nSets = n(25);
  if (!Number.isInteger(nSets) || nSets < 1 || nSets > 20) return { ok: false, key: 'ldt.lamps' };
  let k = 26, lumens = 0, watts = 0;
  for (let s = 0; s < nSets; s++) { const cnt = n(k), flux = n(k + 2), w = n(k + 5); lumens += Math.abs(cnt) * flux; watts += w; k += 6; }
  k += 10;                                    // direct ratios
  const cAng = [], gAng = [];
  const take = (arr, count) => { for (let j = 0; j < count; j++) { const v = n(k++); if (!Number.isFinite(v)) return false; arr.push(v); } return true; };
  const planes = symm === 0 ? Mc : symm === 1 ? 1 : symm === 4 ? Mc / 4 + 1 : Mc / 2 + 1;
  if (!Number.isInteger(planes) || planes < 1) return { ok: false, key: 'ldt.header' };
  if (!take(cAng, Mc) || !take(gAng, Ng)) return { ok: false, key: 'ldt.numbers' };
  const raw = [];
  for (let p = 0; p < planes; p++) { const row = []; if (!take(row, Ng)) return { ok: false, key: 'ldt.short' }; raw.push(row); }
  if (!cAng.length) cAng.push(0);
  const scale = (lumens || 1000) / 1000 * (lorl > 0 ? lorl / 100 : 1) * cfac;      // cd/klm → cd: lamp flux × light output ratio
  const full = (angle) => ({ angle, row: null });
  // plane angles of the stored planes
  const step = Dc > 0 ? Dc : (Mc ? 360 / Mc : 0);
  const stored = raw.map((row, i) => ({ c: symm === 1 ? 0 : (cAng[i] ?? i * step), row: row.map((x) => x * scale) }));
  const out = new Map();
  const put = (c, row) => { const key = Math.round((((c % 360) + 360) % 360) * 1e6) / 1e6; if (!out.has(key)) out.set(key, row); };
  for (const s of stored) {
    put(s.c, s.row);
    if (symm === 2 || symm === 4) put(360 - s.c, s.row);                  // about the C0–C180 plane
    if (symm === 3 || symm === 4) { put(180 - s.c, s.row); put(180 + s.c, s.row); }   // about the C90–C270 plane (4 mirrors both)
    if (symm === 3) put(360 - (180 - s.c), s.row);
  }
  if (symm === 1) { out.clear(); put(0, stored[0].row); }
  const keys = [...out.keys()].sort((a, b) => a - b);
  const h = keys, cd = keys.map((q) => out.get(q));
  if (h[0] !== 0) return { ok: false, key: 'ldt.planes' };
  if (h[h.length - 1] !== 360) { h.push(360); cd.push(cd[0]); }
  return finish({ format: 'ldt', name, lumens, watts, vAngles: gAng, hAngles: h, cd, sym: symm === 1 ? 'axial' : symm === 0 ? 'none' : symm === 4 ? 'quadrant' : 'bilateral',
    width: sizes[1], length: sizes[0], height: sizes[2], keywords: { TYPE: String(type) } });
}

function finish(p) {
  if (p.hAngles.length === 2 && p.sym === 'axial') { /* two columns copy the one plane */ }
  p.maxCd = Math.max(0, ...p.cd.flat());
  if (!(p.maxCd > 0) || p.cd.flat().some((x) => !Number.isFinite(x) || x < 0)) return { ok: false, key: 'photo.empty' };
  p.type = 'C';
  p.name = String(p.name || '').slice(0, 120);
  return { ok: true, photo: p };
}
export function parsePhotometry(text, fileName = '') {
  const s = String(text || '');
  if (/^\s*IESNA/i.test(s) || /^\s*TILT\s*=/im.test(s)) return parseIes(s);
  const ext = /\.([a-z0-9]+)$/i.exec(fileName)?.[1]?.toLowerCase();
  if (ext === 'ies') return parseIes(s);
  if (ext === 'ldt') return parseLdt(s);
  return parseLdt(s);
}

// ------------------------------------------------------------------------------------------------------------- lookup and maths
function bracket(a, x) {
  if (x <= a[0]) return [0, 0, 0];
  if (x >= a[a.length - 1]) return [a.length - 1, a.length - 1, 0];
  let lo = 0, hi = a.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] <= x) lo = m; else hi = m; }
  return [lo, hi, (x - a[lo]) / (a[hi] - a[lo])];
}
/** Candela at vertical angle gamma (0 = nadir … 180) and horizontal angle c (0…360): bilinear; zero beyond the last measured vertical angle when it is short of 180. */
export function candela(photo, gamma, c) {
  const cc = ((c % 360) + 360) % 360, g = Math.max(0, Math.min(180, gamma));
  const V = photo.vAngles, last = V[V.length - 1];
  if (g > last + 1e-9 && last < 179.99) return 0;
  const [h0, h1, fh] = bracket(photo.hAngles, cc), [v0, v1, fv] = bracket(V, g);
  const a = photo.cd[h0][v0] * (1 - fv) + photo.cd[h0][v1] * fv, b = photo.cd[h1][v0] * (1 - fv) + photo.cd[h1][v1] * fv;
  return a * (1 - fh) + b * fh;
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Luminaire axes: n = nadir (default straight down), r = the C0 direction (default +x, turned `rotDeg` about n), s = r turned 90° about n. */
export function frame(aim = [0, 0, -1], rotDeg = 0) {
  const n = unit(aim);
  let r0 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  r0 = unit([r0[0] - dot(r0, n) * n[0], r0[1] - dot(r0, n) * n[1], r0[2] - dot(r0, n) * n[2]]);
  const s0 = cross(n, r0), t = rad(rotDeg);
  const r = unit([r0[0] * Math.cos(t) + s0[0] * Math.sin(t), r0[1] * Math.cos(t) + s0[1] * Math.sin(t), r0[2] * Math.cos(t) + s0[2] * Math.sin(t)]);
  return { n, r, s: cross(n, r) };
}
/** Luminaire { photo, p: [x, y, z] mm, aim?, rot?, scale? (flux factor, 1) , f? (cached frame) }. Illuminance in lux on a surface with the given unit normal. */
export function illuminanceAt(luminaires, p, normal = [0, 0, 1], llf = DEFAULT_LLF.value) {
  let E = 0;
  for (const L of luminaires) {
    const f = L.f || (L.f = frame(L.aim, L.rot));
    const v = [(p[0] - L.p[0]) / 1000, (p[1] - L.p[1]) / 1000, (p[2] - L.p[2]) / 1000], d2 = dot(v, v);
    if (d2 < 1e-6) continue;
    const d = Math.sqrt(d2), u = [v[0] / d, v[1] / d, v[2] / d];
    const gamma = Math.acos(Math.max(-1, Math.min(1, dot(u, f.n)))) * 180 / Math.PI;
    const c = Math.atan2(dot(u, f.s), dot(u, f.r)) * 180 / Math.PI;
    const cosT = -dot(u, normal);               // the light arrives against the surface normal
    if (cosT <= 0) continue;
    E += (candela(L.photo, gamma, c) * (L.scale ?? 1)) * cosT / d2;
  }
  return E * llf;
}

function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
const distToEdge = (poly, x, y) => { let m = Infinity; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; const u = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0; m = Math.min(m, Math.hypot(x - a[0] - dx * u, y - a[1] - dy * u)); } return m; };
/** Cell-centre points inside the polygon [[x, y]] mm at `height` (workplane), spacing mm, none nearer than `margin` to the edge. At most 40 000 points. */
export function gridPoints(polygon, { spacing = 500, height = 800, margin = 0 } = {}) {
  const xs = polygon.map((p) => p[0]), ys = polygon.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const nx = Math.max(1, Math.round((x1 - x0) / spacing)), ny = Math.max(1, Math.round((y1 - y0) / spacing));
  if (nx * ny > 40000) return { points: [], tooMany: true };
  const dx = (x1 - x0) / nx, dy = (y1 - y0) / ny, pts = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = x0 + dx * (i + 0.5), y = y0 + dy * (j + 0.5);
    if (inside(polygon, x, y) && (!margin || distToEdge(polygon, x, y) >= margin)) pts.push([x, y, height]);
  }
  return { points: pts, nx, ny, tooMany: false };
}
export function stats(values) {
  if (!values.length) return { n: 0, min: 0, max: 0, avg: 0, minAvg: 0, minMax: 0 };
  let min = Infinity, max = -Infinity, sum = 0;
  for (const v of values) { if (v < min) min = v; if (v > max) max = v; sum += v; }
  const avg = sum / values.length;
  return { n: values.length, min, max, avg, minAvg: avg > 0 ? min / avg : 0, minMax: max > 0 ? min / max : 0 };
}
/** computeGrid({ luminaires, polygon, spacing, height, margin, normal, llf, areaM2? }) → { points, values, stats, tooMany, lumens, watts, lpd (W/m²) }. */
export function computeGrid({ luminaires, polygon, spacing = 500, height = 800, margin = 0, normal = [0, 0, 1], llf = DEFAULT_LLF.value }) {
  const g = gridPoints(polygon, { spacing, height, margin });
  if (g.tooMany) return { points: [], values: [], stats: stats([]), tooMany: true };
  const values = g.points.map((p) => illuminanceAt(luminaires, p, normal, llf));
  let area = 0; for (let i = 0; i < polygon.length; i++) { const a = polygon[i], b = polygon[(i + 1) % polygon.length]; area += a[0] * b[1] - b[0] * a[1]; }
  area = Math.abs(area) / 2e6;
  const lumens = luminaires.reduce((s, L) => s + (L.photo.lumens || 0) * (L.scale ?? 1), 0), watts = luminaires.reduce((s, L) => s + (L.photo.watts || 0) * (L.scale ?? 1), 0);
  return { points: g.points, values, spacing, stats: stats(values), tooMany: false, areaM2: area, lumens, watts, lpd: area > 0 ? watts / area : 0, nx: g.nx, ny: g.ny };
}
/** Checks against typed targets { avgLux, minLux, uniformity (min/avg), lpd (W/m² limit) } → [{ key, req, found, ok }]. */
export function checkTargets(res, targets = {}) {
  const out = [], s = res.stats;
  if (targets.avgLux > 0) out.push({ key: 'avg', op: '>=', req: targets.avgLux, found: s.avg, ok: s.avg >= targets.avgLux });
  if (targets.minLux > 0) out.push({ key: 'min', op: '>=', req: targets.minLux, found: s.min, ok: s.min >= targets.minLux });
  if (targets.uniformity > 0) out.push({ key: 'uniformity', op: '>=', req: targets.uniformity, found: s.minAvg, ok: s.minAvg >= targets.uniformity });
  if (targets.lpd > 0 && res.areaM2 > 0) out.push({ key: 'lpd', op: '<=', req: targets.lpd, found: res.lpd, ok: res.lpd <= targets.lpd });
  return out;
}
/** CSV of the grid (x, y, z mm, lux) and a header with the totals — for the report. */
export function gridCsv(res) { return 'x_mm,y_mm,z_mm,lux\n' + res.points.map((p, i) => p.map((x) => Math.round(x)).join(',') + ',' + res.values[i].toFixed(1)).join('\n') + '\n'; }

/** Colour of a lux value on a blue (0) to red (max) scale, as an hsl() string. */
export function heatColor(v, max) { const f = max > 0 ? Math.min(1, Math.max(0, v / max)) : 0; return 'hsl(' + Math.round(240 * (1 - f)) + ' 75% 50%)'; }
/**
 * The grid as a colour map: { cells: [{ left, top, w, h (percent of the map), lux, color }], aspect (width / height), max (lux at the red end) }, or null with no points.
 * Cells are the grid points' squares (spacing wide), so a room that is not a rectangle leaves its corners empty.
 */
export function heatCells(res) {
  if (!res || !res.points || !res.points.length || !(res.spacing > 0)) return null;
  const sp = res.spacing, xs = res.points.map((p) => p[0]), ys = res.points.map((p) => p[1]);
  const x0 = Math.min(...xs) - sp / 2, y1 = Math.max(...ys) + sp / 2, W = Math.max(...xs) + sp / 2 - x0, H = y1 - (Math.min(...ys) - sp / 2);
  const max = Math.max(...res.values, 1e-9);
  const cells = res.points.map((p, i) => ({ left: ((p[0] - sp / 2 - x0) / W) * 100, top: ((y1 - (p[1] + sp / 2)) / H) * 100, w: (sp / W) * 100, h: (sp / H) * 100, lux: res.values[i], color: heatColor(res.values[i], max) }));
  return { cells, aspect: W / H, max };
}
const q = (v) => { let x = String(v ?? ''); if (/^[=+\-@]/.test(x)) x = "'" + x; return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
/** The lighting report as CSV: one row per area (name, luminaires, area, lumens, watts, W/m², lowest, average, highest lux, uniformity, checks) and then every grid point. Formula-looking names are quoted. */
export function lightingReportCsv(areas) {
  const f = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '');
  const rows = [['area', 'luminaires', 'area_m2', 'lumens', 'watts', 'w_per_m2', 'min_lux', 'avg_lux', 'max_lux', 'min_over_avg', 'targets']];
  for (const a of areas) rows.push([a.name, a.luminaires, f(a.res.areaM2), f(a.res.lumens, 0), f(a.res.watts, 0), f(a.res.lpd, 2), f(a.res.stats.min), f(a.res.stats.avg), f(a.res.stats.max), f(a.res.stats.minAvg, 2),
    (a.checks || []).map((c) => c.key + (c.ok ? ' ok' : ' FAILS')).join('; ')]);
  rows.push([], ['area', 'x_mm', 'y_mm', 'z_mm', 'lux']);
  for (const a of areas) a.res.points.forEach((p, i) => rows.push([a.name, ...p.map((x) => Math.round(x)), f(a.res.values[i])]));
  return rows.map((r) => r.map(q).join(',')).join('\n') + '\n';
}
