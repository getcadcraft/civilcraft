/* SPDX-License-Identifier: Apache-2.0 */
/**
 * platform.js — house platforms on sloped sites (0.8 SU.914): the cut and fill map (shaded by depth, with spot levels), free
 * sections through the graded ground, and sloped pads (a plane, a driveway or ramp). No DOM, no strings (the UI words the
 * codes), no imports but terrain-section.js and sections.js. Tested by bin/test-civilcraft-platform.mjs.
 *
 * What was already there (0.7.1 71.22, sides.js + grading.js): a pad's side can be a retaining wall whose height is read from
 * the ground along it (wallRuns), corners can carry their own elevation, volumes by the grid method. This adds:
 *
 *   depthMap(ground, design, { cell, region, bounds, maxCells }) → { cell, cells: [{ x, y, dz }], cut, fill, maxCut, maxFill,
 *       minDz, maxDz }       the grid method's cells one by one (centre x, y; dz = design − ground, + = fill), so the map and the
 *       volumes are the same numbers (volume = Σ|dz|·cell²)
 *   depthClasses(map, { step }) → { step, levels: [lowest … highest] (cut negative), classOf(dz) → index, legend: [{ lo, hi, kind }] }
 *       equal steps of depth (a nice step is picked when none given), the zero band (|dz| < step/2·0.1... "level") apart
 *   spotLevels(ground, design, { spacing, region, bounds }) → [{ x, y, zg, zd, dz, kind: 'cut'|'fill'|'level', extreme }]
 *       on a grid of `spacing` (nodes inside the design's graded region), and the deepest cut / highest fill marked `extreme`
 *   planePad(pts, { at: {x, y}, z, dir (radians, the way it rises), grade (rise/run) }) → pts with z (the plane's)
 *   rampPad(a, b, za, zb, width) → { pts (4 corners with z), length, grade, ok } a strip along a→b, `width` wide, rising za→zb
 *   freeSection(ground, design, line, { regions, step }) → { length, ground: runs, design: runs, cut, fill, parts, marks }
 *       any polyline: ground and design cut exactly (terrain-section.js), the design counted only inside `regions` (as sections.js
 *       buildSections does), areas by sections.js cutFill. `marks` = the polyline's vertices { o, label? }
 *   freeSectionSvg(sec, { t, units, vexag (0 = fit the height, at most 10×) }) → SVG text of the section for a drawing
 *   freeSectionCsv(sec, { units }) → CSV (CRLF)
 */

import { cutSection, lineLength, locateOn } from './terrain-section.js';
import { cutFill, clipRuns } from './sections.js';

// ---------------------------------------------------------------------------
// Cut and fill map

export function depthMap(ground, design, { cell, region = null, bounds = null, maxCells = 4e6 } = {}) {
  const ba = ground.stats().bounds, bb = design.stats().bounds;
  let b = bounds || { minX: Math.max(ba.minX, bb.minX), minY: Math.max(ba.minY, bb.minY), maxX: Math.min(ba.maxX, bb.maxX), maxY: Math.min(ba.maxY, bb.maxY) };
  const regions = region ? (Array.isArray(region[0]) ? region : [region]).filter(Boolean) : null;
  if (regions?.length) {
    const r = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const poly of regions) for (const p of poly) { r.minX = Math.min(r.minX, p.x); r.minY = Math.min(r.minY, p.y); r.maxX = Math.max(r.maxX, p.x); r.maxY = Math.max(r.maxY, p.y); }
    b = { minX: Math.max(b.minX, r.minX), minY: Math.max(b.minY, r.minY), maxX: Math.min(b.maxX, r.maxX), maxY: Math.min(b.maxY, r.maxY) };
  }
  const W = b.maxX - b.minX, H = b.maxY - b.minY;
  const out = { cell: cell || 0, cells: [], cut: 0, fill: 0, maxCut: 0, maxFill: 0, minDz: 0, maxDz: 0 };
  if (!(W > 0 && H > 0)) return out;
  let c = cell > 0 ? cell : Math.sqrt((W * H) / 40000);
  while ((W / c) * (H / c) > maxCells) c *= 2;
  out.cell = c;
  const inPoly = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const p = poly[i], q = poly[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };
  const i0 = Math.floor(b.minX / c), i1 = Math.ceil(b.maxX / c), j0 = Math.floor(b.minY / c), j1 = Math.ceil(b.maxY / c), A = c * c;
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const x = (i + 0.5) * c, y = (j + 0.5) * c;
    if (regions && !regions.some((poly) => inPoly(poly, x, y))) continue;
    const z0 = ground.elevationAt(x, y), z1 = design.elevationAt(x, y);
    if (z0 === null || z1 === null) continue;
    const dz = z1 - z0;
    out.cells.push({ x, y, dz });
    if (dz > 0) { out.fill += dz * A; if (dz > out.maxFill) out.maxFill = dz; } else { out.cut -= dz * A; if (-dz > out.maxCut) out.maxCut = -dz; }
    if (dz < out.minDz) out.minDz = dz; if (dz > out.maxDz) out.maxDz = dz;
  }
  return out;
}

const niceStep = (v) => { if (!(v > 0)) return 1; const p = 10 ** Math.floor(Math.log10(v)), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };

export function depthClasses(map, { step = 0 } = {}) {
  const span = Math.max(map.maxCut, map.maxFill);
  const s = step > 0 ? step : niceStep(span / 5 || 1);
  const nCut = Math.max(1, Math.ceil(map.maxCut / s - 1e-9)), nFill = Math.max(1, Math.ceil(map.maxFill / s - 1e-9));
  const levels = [];
  for (let k = nCut; k >= 1; k--) levels.push(-k * s);
  levels.push(0);
  for (let k = 1; k <= nFill; k++) levels.push(k * s);
  // class index: 0 … nCut-1 cut (deepest first), nCut = level (|dz| < s/20), nCut+1 … fill (shallowest first)
  const eps = s / 20;
  const classOf = (dz) => {
    if (Math.abs(dz) < eps) return nCut;
    if (dz < 0) return Math.max(0, nCut - Math.ceil(-dz / s - 1e-9));
    return nCut + Math.min(nFill, Math.ceil(dz / s - 1e-9));
  };
  const legend = [];
  for (let k = nCut; k >= 1; k--) legend.push({ lo: -k * s, hi: -(k - 1) * s, kind: 'cut' });
  legend.push({ lo: -eps, hi: eps, kind: 'level' });
  for (let k = 1; k <= nFill; k++) legend.push({ lo: (k - 1) * s, hi: k * s, kind: 'fill' });
  return { step: s, levels, classOf, legend, nCut, nFill };
}

export function spotLevels(ground, design, { spacing, region = null, bounds = null } = {}) {
  if (!(spacing > 0)) return [];
  const m = depthMap(ground, design, { cell: spacing, region, bounds });
  const spots = m.cells.map((c) => {
    const zg = ground.elevationAt(c.x, c.y), zd = design.elevationAt(c.x, c.y);
    return { x: c.x, y: c.y, zg, zd, dz: c.dz, kind: Math.abs(c.dz) < spacing * 1e-3 ? 'level' : c.dz < 0 ? 'cut' : 'fill', extreme: false };
  });
  let lo = null, hi = null;
  for (const s of spots) { if (!lo || s.dz < lo.dz) lo = s; if (!hi || s.dz > hi.dz) hi = s; }
  if (lo && lo.dz < 0) lo.extreme = true;
  if (hi && hi.dz > 0) hi.extreme = true;
  return spots;
}

// ---------------------------------------------------------------------------
// Sloped pads

export function planePad(pts, { at, z, dir, grade }) {
  const ux = Math.cos(dir), uy = Math.sin(dir);
  return pts.map((p) => ({ ...p, z: z + grade * ((p.x - at.x) * ux + (p.y - at.y) * uy) }));
}

export function rampPad(a, b, za, zb, width) {
  const L = Math.hypot(b.x - a.x, b.y - a.y);
  if (!(L > 0) || !(width > 0)) return { pts: [], length: L, grade: 0, ok: false };
  const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, nx = -uy * width / 2, ny = ux * width / 2;
  return { pts: [{ x: a.x + nx, y: a.y + ny, z: za }, { x: b.x + nx, y: b.y + ny, z: zb }, { x: b.x - nx, y: b.y - ny, z: zb }, { x: a.x - nx, y: a.y - ny, z: za }], length: L, grade: (zb - za) / L, ok: true };
}

// ---------------------------------------------------------------------------
// Free sections

/** The saved free-section lines (0.8 SU.914 rest, civil_PART_3): [{ id 'sl<n>', name, line: [{x, y}] }] from a project file (untrusted: bounded, text cut). */
export function cleanSectionLines(list, id) {
  const fin = (v) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e9;
  return (Array.isArray(list) ? list : []).slice(0, 200).map((l) => {
    const line = (Array.isArray(l?.line) ? l.line : []).slice(0, 2000).filter((p) => p && fin(p.x) && fin(p.y)).map((p) => ({ x: p.x, y: p.y }));
    if (line.length < 2 || line.every((p) => p.x === line[0].x && p.y === line[0].y)) return null;
    return { id: id(l.id, 'sl'), name: String(l.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) || 'Section', line };
  }).filter(Boolean);
}

export function freeSection(ground, design, line, { regions = null } = {}) {
  const length = lineLength(line);
  const g = cutSection(ground, line, { origin: 0 }), runsG = g.runs.map((r) => r.map((p) => ({ o: p.o, z: p.z })));
  let runsD = [];
  if (design) {
    runsD = cutSection(design, line, { origin: 0 }).runs.map((r) => r.map((p) => ({ o: p.o, z: p.z })));
    if (regions) runsD = clipRuns(runsD, polylineSpans(line, regions));
  }
  const cf = design ? cutFill(runsG, runsD) : { cut: 0, fill: 0, parts: [] };
  let acc = 0;
  const marks = line.map((p, i) => { if (i) acc += Math.hypot(p.x - line[i - 1].x, p.y - line[i - 1].y); return { o: acc, x: p.x, y: p.y }; });
  return { length, ground: runsG, design: runsD, cut: cf.cut, fill: cf.fill, parts: cf.parts, marks };
}

/** Distances along a polyline where it is inside any of the polygons (or on their outline). */
export function polylineSpans(line, regions) {
  const out = [];
  const inside = (x, y) => regions.some((r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i].y > y) !== (r[j].y > y) && x < ((r[j].x - r[i].x) * (y - r[i].y)) / (r[j].y - r[i].y) + r[i].x) c = !c; return c; });
  let acc = 0;
  for (let k = 1; k < line.length; k++) {
    const a = line[k - 1], b = line[k], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    if (!(L > 0)) continue;
    const ts = new Set([0, 1]);
    for (const r of regions) for (let i = 0; i < r.length; i++) {
      const p = r[i], q = r[(i + 1) % r.length], ex = q.x - p.x, ey = q.y - p.y, d = dx * ey - dy * ex;
      if (Math.abs(d) < 1e-14) continue;
      const tt = ((p.x - a.x) * ey - (p.y - a.y) * ex) / d, u = ((p.x - a.x) * dy - (p.y - a.y) * dx) / d;
      if (tt > 0 && tt < 1 && u >= 0 && u <= 1) ts.add(tt);
    }
    const xs = [...ts].sort((m, n) => m - n);
    for (let i = 1; i < xs.length; i++) {
      const tm = (xs[i - 1] + xs[i]) / 2;
      if (xs[i] - xs[i - 1] < 1e-12 || !inside(a.x + dx * tm, a.y + dy * tm)) continue;
      const o0 = acc + L * xs[i - 1], o1 = acc + L * xs[i], last = out[out.length - 1];
      if (last && Math.abs(last[1] - o0) < 1e-9) last[1] = o1; else out.push([o0, o1]);
    }
    acc += L;
  }
  return out;
}

const f2 = (v) => (Number.isFinite(v) ? (Math.round(v * 100) / 100).toString() : '');

export function freeSectionCsv(sec, { units = 'ft', t = (k, v) => k } = {}) {
  const rows = [[t('sx.su914.csv.dist', { unit: units }), t('sx.su914.csv.ground'), t('sx.su914.csv.design')]];
  const os = new Set();
  for (const r of [...sec.ground, ...sec.design]) for (const p of r) os.add(p.o);
  const zAt = (runs, o) => { for (const r of runs) { if (!r.length || o < r[0].o - 1e-9 || o > r[r.length - 1].o + 1e-9) continue; for (let i = 1; i < r.length; i++) if (o <= r[i].o + 1e-9) { const w = r[i].o - r[i - 1].o; return w > 0 ? r[i - 1].z + (r[i].z - r[i - 1].z) * (o - r[i - 1].o) / w : r[i].z; } return r[0].z; } return null; };
  for (const o of [...os].sort((a, b) => a - b)) { const g = zAt(sec.ground, o), d = zAt(sec.design, o); rows.push([f2(o), g === null ? '' : f2(g), d === null ? '' : f2(d)]); }
  rows.push([], [t('sx.su914.csv.cut', { unit: units + '²' }), f2(sec.cut)], [t('sx.su914.csv.fill', { unit: units + '²' }), f2(sec.fill)]);
  return rows.map((r) => r.join(',')).join('\r\n') + '\r\n';
}

/** A section drawing: ground (ink), design (blue), cut and fill shaded, distance and level ticks. `t(key, vars)` words it. */
export function freeSectionSvg(sec, { t = (k) => k, units = 'ft', vexag = 0, width = 900, height = 360 } = {}) {   // vexag 0 = fit the height (at most 10×)
  const pts = [...sec.ground.flat(), ...sec.design.flat()];
  if (!pts.length) return '';
  const m = { l: 56, r: 16, t: 30, b: 34 };
  const zmin = Math.min(...pts.map((p) => p.z)), zmax = Math.max(...pts.map((p) => p.z));
  const L = sec.length || 1, zs = Math.max(zmax - zmin, 1e-6);
  const kx = (width - m.l - m.r) / L, ky = vexag > 0 ? kx * vexag : Math.min((height - m.t - m.b) / (zs * 1.1), kx * 10);
  const X = (o) => m.l + o * kx, Y = (z) => height - m.b - (z - zmin) * ky - ((height - m.t - m.b) - zs * ky) / 2;
  const path = (runs) => runs.map((r) => r.map((p, i) => (i ? 'L' : 'M') + X(p.o).toFixed(1) + ' ' + Y(p.z).toFixed(1)).join('')).join('');
  // shaded cut/fill between the lines, piece by piece
  const zOn = (runs, o) => { for (const r of runs) { if (!r.length || o < r[0].o - 1e-9 || o > r[r.length - 1].o + 1e-9) continue; for (let i = 1; i < r.length; i++) if (o <= r[i].o + 1e-9) { const w = r[i].o - r[i - 1].o; return w > 0 ? r[i - 1].z + (r[i].z - r[i - 1].z) * (o - r[i - 1].o) / w : r[i].z; } return r[0].z; } return null; };
  const shade = sec.parts.map((p) => {
    const os = new Set([p.o0, p.o1]);
    for (const r of [...sec.ground, ...sec.design]) for (const q of r) if (q.o > p.o0 && q.o < p.o1) os.add(q.o);
    const xs = [...os].sort((a, b) => a - b);
    const top = xs.map((o) => [o, zOn(sec.ground, o)]), bot = xs.map((o) => [o, zOn(sec.design, o)]).reverse();
    const d = [...top, ...bot].map(([o, z], i) => (i ? 'L' : 'M') + X(o).toFixed(1) + ' ' + Y(z).toFixed(1)).join('') + 'Z';
    return `<path d="${d}" fill="${p.kind === 'cut' ? '#c0392b' : '#2e6fb0'}" fill-opacity="0.35" stroke="none" data-kind="${p.kind}"/>`;
  }).join('');
  const nice = niceStep(L / 6), ticks = [];
  for (let o = 0; o <= L + 1e-9; o += nice) ticks.push(`<line x1="${X(o).toFixed(1)}" y1="${height - m.b}" x2="${X(o).toFixed(1)}" y2="${height - m.b + 4}" stroke="currentColor"/><text x="${X(o).toFixed(1)}" y="${height - m.b + 16}" text-anchor="middle" font-size="11" fill="currentColor">${f2(o)}</text>`);
  const zt = niceStep(zs / 4), zticks = [];
  for (let z = Math.ceil(zmin / zt) * zt; z <= zmax + 1e-9; z += zt) zticks.push(`<line x1="${m.l - 4}" y1="${Y(z).toFixed(1)}" x2="${m.l}" y2="${Y(z).toFixed(1)}" stroke="currentColor"/><text x="${m.l - 7}" y="${(Y(z) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="currentColor">${f2(z)}</text>`);
  const title = t('sx.su914.sec.title', { len: f2(L), unit: units });
  const sub = t('sx.su914.sec.areas', { cut: f2(sec.cut), fill: f2(sec.fill), unit: units + '²' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto" font-family="sans-serif" color="#222" data-free-section><rect width="${width}" height="${height}" fill="#fff"/>` +
    `<text x="${m.l}" y="14" font-size="13" font-weight="600" fill="currentColor">${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text><text x="${m.l}" y="27" font-size="11" fill="currentColor">${sub.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>` +
    `<line x1="${m.l}" y1="${height - m.b}" x2="${width - m.r}" y2="${height - m.b}" stroke="currentColor"/><line x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${height - m.b}" stroke="currentColor"/>${ticks.join('')}${zticks.join('')}` +
    shade + `<path d="${path(sec.ground)}" fill="none" stroke="#222" stroke-width="1.6"/>` + (sec.design.length ? `<path d="${path(sec.design)}" fill="none" stroke="#2e6fb0" stroke-width="1.6" stroke-dasharray="6 3"/>` : '') +
    sec.marks.slice(1, -1).map((p) => `<line x1="${X(p.o).toFixed(1)}" y1="${m.t}" x2="${X(p.o).toFixed(1)}" y2="${height - m.b}" stroke="#999" stroke-dasharray="2 3"/>`).join('') + '</svg>';
}
export { lineLength, locateOn };
