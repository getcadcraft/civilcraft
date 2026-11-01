/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pv.js — solar PV arrays (0.8 EG.15, session `energy_PART_2`): the module table, the planes of roof faces found in the model, modules fitted inside a
 * face with a setback, ground rows with a no-shade row spacing. No DOM, no model: bin/test-bimcraft.mjs --pv runs it in Node. Lengths mm, angles degrees,
 * model axes Z up. The site's true north comes from IfcSite / TrueNorth (`site.north` = a unit vector in the model's plan, +Y when the model is north-up);
 * an azimuth is a compass bearing, degrees from true north, clockwise (south = 180).
 *
 *   STARTER_MODULE, STARTER_INVERTER      labelled generic values, never a maker's datasheet
 *   cleanModule(m) / cleanModules(list) / parseModulesCsv(text) / modulesCsv(list)     the open, editable module table
 *   frameOf(site) → { north, east }       planeNormal(tilt, az, site) → unit normal      tiltAzimuthOf(n, site) → { tilt, azimuth, flat }
 *   basisOf(tilt, az, site) → { n, u, v } u along the eave (to the right when facing the plane), v up the slope
 *   roofFaces(tris, site, opts) → faces [{ id, normal, tilt, azimuth, flat, areaM2, centroid, tris }]   upward planes from placed triangles (flat mm)
 *   fitFace(face, module, opts) → { modules: [{ c, row, col, corners }], count, kwp }   modules inside a face, `setback` mm from every edge
 *   winterPitch({ slantMm, tilt, azimuth, site, hours }) → { pitchMm, shadowMm, elevation, ... }    row spacing, no shade at the winter solstice
 *   groundLayout(opts) → { modules, tables, pitchMm, gcr, count, kwp }    rows of tables facing an azimuth
 *   arrayKwp(modules, module)
 * Roof-face maths: a triangle's unit normal n with n_z > cos 80° is upward; triangles within 0.5° and 30 mm of one plane are one face. The face
 * is projected on its own (u, v) axes and a module rectangle (grown by the setback) fits when nine sample points in it lie inside the union of the face's
 * triangles. The grid is tried at 4 × 4 offsets and the one with the most modules is kept.
 * Row spacing (the usual rule, e.g. Duffie & Beckman, Solar Engineering of Thermal Processes §1 and the SEIA/NREL design notes): a table of slant length
 * Ls tilted β has height h = Ls sin β; its shadow at sun elevation α is h / tan α along the sun's azimuth, so measured square to the rows it is
 * h / tan α · cos(Δaz); the lower edge of the next row is Ls cos β + that behind the lower edge of the front one. The sun is the winter-solstice sun
 * `hours` before or after solar noon (0 = noon, the simplest published rule).
 */
import { sunPosition } from './render/sun.js';
import { solarToClock, frameOf } from './pv-sun.js';
export { frameOf };

const RAD = Math.PI / 180;
const r2 = (v) => Math.round(v * 100) / 100;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// ------------------------------------------------------------------------------------------------ modules and inverters
/** A generic module. The numbers are typical of a ~400 Wp silicon module and are NOT from any maker's datasheet: type yours. */
export const STARTER_MODULE = Object.freeze({
  id: 'starter-400', name: 'Generic 400 Wp (starter values, not a maker\'s datasheet)', starter: true,
  wp: 400, voc: 49.5, vmp: 41.0, isc: 10.3, imp: 9.76,
  betaVoc: -0.0028, betaVmp: -0.003, gammaPmax: -0.0035, alphaIsc: 0.0005,   // per kelvin, as fractions (−0.28 %/K …)
  noct: 45, lengthMm: 1722, widthMm: 1134, thicknessMm: 30, iamB0: 0.05,
});
/** A generic string inverter. Starter values, not a maker's datasheet. */
export const STARTER_INVERTER = Object.freeze({
  id: 'starter-5k', name: 'Generic 5 kW inverter (starter values, not a maker\'s datasheet)', starter: true,
  pacKw: 5, vdcMax: 600, mpptMin: 120, mpptMax: 500, mppts: 2, idcMax: 13, iscMax: 18, eta: 0.97, vac: 240, phases: 1,
});

const POS = ['wp', 'voc', 'vmp', 'isc', 'imp', 'noct', 'lengthMm', 'widthMm'];
/** → { ok, module, errors: [key] } — a module row made safe: positive numbers, Vmp < Voc, Imp < Isc, coefficients in a sane range. */
export function cleanModule(m) {
  const errors = [];
  const o = { id: String(m?.id ?? '').trim().slice(0, 60), name: String(m?.name ?? m?.id ?? '').trim().slice(0, 120), starter: !!m?.starter };
  for (const k of POS) { const v = Number(m?.[k]); if (!(v > 0) || !Number.isFinite(v)) errors.push(k); o[k] = v; }
  o.thicknessMm = Number(m?.thicknessMm) > 0 ? Number(m.thicknessMm) : 30;
  const coef = (k, lo, hi, d) => { const raw = m?.[k]; const v = raw === undefined || raw === null || raw === '' ? d : Number(raw); if (!Number.isFinite(v) || v < lo || v > hi) errors.push(k); o[k] = v; };
  coef('betaVoc', -0.01, 0, -0.0028); coef('gammaPmax', -0.01, 0, -0.0035); coef('alphaIsc', 0, 0.01, 0.0005);
  coef('betaVmp', -0.01, 0, Number.isFinite(Number(m?.betaVoc)) && m?.betaVoc !== '' ? Number(m.betaVoc) : -0.0028);
  coef('iamB0', 0, 0.3, 0.05);
  if (!o.id) errors.push('id');
  if (o.vmp >= o.voc) errors.push('vmp');
  if (o.imp >= o.isc) errors.push('imp');
  return { ok: !errors.length, module: o, errors };
}
/** → { modules, errors: [{ index, id, keys }] } — rows that fail are left out and listed. */
export function cleanModules(list) {
  const modules = [], errors = [], seen = new Set();
  (Array.isArray(list) ? list : []).forEach((m, index) => {
    const c = cleanModule(m);
    if (c.ok && seen.has(c.module.id)) { errors.push({ index, id: c.module.id, keys: ['duplicate'] }); return; }
    if (c.ok) { seen.add(c.module.id); modules.push(c.module); } else errors.push({ index, id: c.module.id, keys: c.errors });
  });
  return { modules, errors };
}
const CSV_COLS = ['id', 'name', 'wp', 'voc', 'vmp', 'isc', 'imp', 'beta_voc_pct', 'beta_vmp_pct', 'gamma_pmax_pct', 'alpha_isc_pct', 'noct', 'length_mm', 'width_mm', 'thickness_mm'];
const csvCell = (s) => { let v = String(s ?? ''); if (/^[=+\-@\t\r]/.test(v) && !/^-?\d/.test(v)) v = "'" + v; return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
/** The table as CSV (coefficients in % per kelvin, as datasheets print them). */
export const modulesCsv = (list) => [CSV_COLS.join(',')].concat(list.map((m) => [m.id, m.name, m.wp, m.voc, m.vmp, m.isc, m.imp, m.betaVoc * 100, (m.betaVmp ?? m.betaVoc) * 100, m.gammaPmax * 100, m.alphaIsc * 100, m.noct, m.lengthMm, m.widthMm, m.thicknessMm].map(csvCell).join(','))).join('\n');
function csvLine(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur); return out;
}
/** → { modules, errors } from CSV text with the header of modulesCsv (at least id, wp, voc, vmp, isc, imp, length_mm, width_mm, noct). */
export function parseModulesCsv(text) {
  const lines = String(text ?? '').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { modules: [], errors: [{ index: 0, id: '', keys: ['columns'] }] };
  const head = csvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const need = ['id', 'wp', 'voc', 'vmp', 'isc', 'imp', 'length_mm', 'width_mm', 'noct'];
  if (need.some((k) => !head.includes(k))) return { modules: [], errors: [{ index: 0, id: '', keys: ['columns'] }] };
  const rows = lines.slice(1, 2001).map((l) => { const c = csvLine(l), g = (k) => { const i = head.indexOf(k); return i < 0 ? undefined : c[i]; }; const pct = (k) => (g(k) === undefined || g(k) === '' ? undefined : Number(g(k)) / 100);
    return { id: g('id'), name: g('name'), wp: g('wp'), voc: g('voc'), vmp: g('vmp'), isc: g('isc'), imp: g('imp'), betaVoc: pct('beta_voc_pct'), betaVmp: pct('beta_vmp_pct'), gammaPmax: pct('gamma_pmax_pct'), alphaIsc: pct('alpha_isc_pct'),
      noct: g('noct'), lengthMm: g('length_mm'), widthMm: g('width_mm'), thicknessMm: g('thickness_mm') }; });
  return cleanModules(rows);
}

// ------------------------------------------------------------------------------------------------ planes
/** Unit vector, in model axes, of a compass bearing `az` (degrees) along the ground. */
export function bearing(az, site) { const F = frameOf(site), a = az * RAD; return [F.north[0] * Math.cos(a) + F.east[0] * Math.sin(a), F.north[1] * Math.cos(a) + F.east[1] * Math.sin(a), 0]; }
/** The unit normal (out of the plane) of a plane tilted `tilt` degrees from horizontal and facing compass bearing `az`. */
export function planeNormal(tilt, az, site) { const h = bearing(az, site), s = Math.sin(tilt * RAD); return [h[0] * s, h[1] * s, Math.cos(tilt * RAD)]; }
/** → { tilt, azimuth (0–360, null for a flat plane), flat } of a unit normal. */
export function tiltAzimuthOf(n, site) {
  const F = frameOf(site), tilt = Math.acos(Math.max(-1, Math.min(1, n[2]))) / RAD;
  if (tilt < 0.5) return { tilt, azimuth: null, flat: true };
  const east = n[0] * F.east[0] + n[1] * F.east[1], north = n[0] * F.north[0] + n[1] * F.north[1];
  return { tilt, azimuth: (Math.atan2(east, north) / RAD + 360) % 360, flat: false };
}
/** The axes of a plane: n out of it, u along its horizontal edge (right when facing it), v up the slope. A flat plane has u east, v north. */
export function basisOf(tilt, az, site) {
  const F = frameOf(site);
  if (tilt < 0.5) return { n: [0, 0, 1], u: [F.east[0], F.east[1], 0], v: [F.north[0], F.north[1], 0] };
  const h = bearing(az, site), b = tilt * RAD;
  return { n: [h[0] * Math.sin(b), h[1] * Math.sin(b), Math.cos(b)], u: [-h[1], h[0], 0], v: [-h[0] * Math.cos(b), -h[1] * Math.cos(b), Math.sin(b)] };
}

/** basisOf from an exact unit normal (n × u gives the slope direction, v). */
export function basisOfNormal(n, site) {
  const F = frameOf(site), h = Math.hypot(n[0], n[1]);
  if (h < 0.0087) return { n: [0, 0, 1], u: [F.east[0], F.east[1], 0], v: [F.north[0], F.north[1], 0] };
  const u = [-n[1] / h, n[0] / h, 0];
  return { n, u, v: cross(n, u) };
}

// ------------------------------------------------------------------------------------------------ roof faces
/** Upward planes of placed triangles (flat [x0,y0,z0, x1,y1,z1, x2,y2,z2, …] in mm) → faces, biggest first. */
export function roofFaces(tris, site, { minAreaM2 = 0.5, maxTilt = 80, angleTol = 0.5, offsetTol = 30 } = {}) {
  const cosMax = Math.cos(maxTilt * RAD), cosTol = Math.cos(angleTol * RAD), clusters = [];
  for (let i = 0; i + 8 < tris.length; i += 9) {
    const A = [tris[i], tris[i + 1], tris[i + 2]], B = [tris[i + 3], tris[i + 4], tris[i + 5]], C = [tris[i + 6], tris[i + 7], tris[i + 8]];
    const c = cross(sub(B, A), sub(C, A)), l = len(c);
    if (l < 1e-6) continue;
    const n = [c[0] / l, c[1] / l, c[2] / l];
    if (n[2] < cosMax) continue;
    const mid = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3], d = dot(n, mid), area = l / 2;
    let k = null;
    for (const cl of clusters) if (dot(cl.n0, n) >= cosTol && Math.abs(dot(cl.n0, mid) - dot(cl.n0, cl.m0)) <= offsetTol) { k = cl; break; }
    if (!k) { k = { n0: n, m0: mid, nsum: [0, 0, 0], msum: [0, 0, 0], area: 0, tris: [] }; clusters.push(k); }
    k.nsum = add(k.nsum, n, area); k.msum = add(k.msum, mid, area); k.area += area; k.tris.push(...A, ...B, ...C);
    void d;
  }
  const faces = clusters.filter((k) => k.area / 1e6 >= minAreaM2).sort((a, b) => b.area - a.area).map((k, i) => {
    const normal = unit(k.nsum), ta = tiltAzimuthOf(normal, site);
    return { id: 'F' + (i + 1), normal, basis: basisOfNormal(normal, site), tilt: r2(ta.tilt), azimuth: ta.azimuth === null ? null : r2(ta.azimuth), flat: ta.flat, areaM2: r2(k.area / 1e6), centroid: [k.msum[0] / k.area, k.msum[1] / k.area, k.msum[2] / k.area], tris: k.tris };
  });
  return faces;
}

/** Is (s, t) inside any of the 2-D triangles (flat [s0,t0,s1,t1,s2,t2, …])? `eps` mm of slack so a seam between two triangles is not a gap. */
function inUnion(T2, s, t, eps = 1) {
  for (let i = 0; i + 5 < T2.length; i += 6) {
    const ax = T2[i], ay = T2[i + 1], bx = T2[i + 2], by = T2[i + 3], cx = T2[i + 4], cy = T2[i + 5];
    const d = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(d) < 1e-9) continue;
    const l1 = ((s - ax) * (cy - ay) - (cx - ax) * (t - ay)) / d, l2 = ((bx - ax) * (t - ay) - (s - ax) * (by - ay)) / d, l3 = 1 - l1 - l2;
    const e = eps / Math.sqrt(Math.abs(d));
    if (l1 >= -e && l2 >= -e && l3 >= -e) return true;
  }
  return false;
}
const SAMPLE = [0, 0.5, 1];
/**
 * Modules inside a roof face. opts: { orient 'portrait' | 'landscape', setback mm (300), gap mm (20), max (count cap), exclude: [[s0,t0,s1,t1]…] none yet }.
 * → { modules: [{ c: [x,y,z] centre, row, col, corners: 4 × [x,y,z] }], count, kwp, u, v, n, setbackMm, across, along }.
 */
export function fitFace(face, module, { orient = 'portrait', setback = 300, gap = 20, max = 100000 } = {}) {
  const basis = face.basis;
  const p0 = face.centroid, T = face.tris, T2 = new Float64Array(T.length / 3 * 2);
  let smin = Infinity, smax = -Infinity, tmin = Infinity, tmax = -Infinity;
  for (let i = 0, j = 0; i < T.length; i += 3, j += 2) {
    const q = [T[i] - p0[0], T[i + 1] - p0[1], T[i + 2] - p0[2]], s = dot(q, basis.u), t = dot(q, basis.v);
    T2[j] = s; T2[j + 1] = t; smin = Math.min(smin, s); smax = Math.max(smax, s); tmin = Math.min(tmin, t); tmax = Math.max(tmax, t);
  }
  const across = orient === 'landscape' ? module.lengthMm : module.widthMm, along = orient === 'landscape' ? module.widthMm : module.lengthMm;
  const du = across + gap, dv = along + gap;
  let best = null;
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
    const s0 = smin + (a * du) / 4, t0 = tmin + (b * dv) / 4, list = [];
    for (let row = 0; t0 + row * dv + along <= tmax + 1; row++) for (let col = 0; s0 + col * du + across <= smax + 1; col++) {
      const sa = s0 + col * du, ta = t0 + row * dv;
      let ok = true;
      for (const fx of SAMPLE) { for (const fy of SAMPLE) { if (!inUnion(T2, sa - setback + fx * (across + 2 * setback), ta - setback + fy * (along + 2 * setback))) { ok = false; break; } } if (!ok) break; }
      if (ok) list.push([row, col, sa, ta]);
    }
    if (!best || list.length > best.length) best = list;
  }
  const modules = best.slice(0, max).map(([row, col, sa, ta]) => {
    const corner = (s, t) => add(add(p0, basis.u, s), basis.v, t);
    return { row, col, c: corner(sa + across / 2, ta + along / 2), corners: [corner(sa, ta), corner(sa + across, ta), corner(sa + across, ta + along), corner(sa, ta + along)] };
  });
  return { modules, count: modules.length, kwp: r2(modules.length * module.wp / 1000), u: basis.u, v: basis.v, n: basis.n, setbackMm: setback, across, along };
}

// ------------------------------------------------------------------------------------------------ ground rows
/** The row spacing that leaves no shade at the winter-solstice sun `hours` from solar noon. → { pitchMm, shadowMm, heightMm, elevation, sunAzimuth, error? } */
export function winterPitch({ slantMm, tilt, azimuth, site, hours = 0 }) {
  const lat = site.lat, month = lat >= 0 ? 12 : 6, day = 21, tz = Number.isFinite(site.tz) ? site.tz : Math.round(site.lon / 15);
  const sunAt = (dt) => sunPosition({ month, day, hour: solarToClock(site, month, day, 12 + dt, tz), lat, lon: site.lon, tz });
  let worst = null;
  for (const dt of hours ? [-Math.abs(hours), Math.abs(hours)] : [0]) {
    const s = sunAt(dt);
    if (s.altitude <= 1) return { error: 'pv.err.polar' };
    const dAz = (s.azimuth - azimuth) * RAD, h = slantMm * Math.sin(tilt * RAD);
    const shadow = h / Math.tan(s.altitude * RAD) * Math.max(0, Math.cos(dAz));
    if (!worst || shadow > worst.shadowMm) worst = { shadowMm: shadow, heightMm: h, elevation: s.altitude, sunAzimuth: s.azimuth };
  }
  return { ...worst, pitchMm: slantMm * Math.cos(tilt * RAD) + worst.shadowMm };
}
/**
 * Rows of tables on the ground (or a flat roof). opts: { site, module, orient, perRow (modules across a table), stack (modules up the slope, 1),
 * rows, tilt, azimuth, origin [x,y,z] (mm: the middle of the first table's lower edge, on the ground), clearance (500 mm), gap (20),
 * pitchMm (null = from the winter rule), hours (0), contains(x, y) (a table is kept only when its four lower corners are inside) }.
 * → { modules, tables: [{ row, corners }], pitchMm, shadowMm, gcr (slant ÷ pitch), count, kwp, rule }.
 */
export function groundLayout(o) {
  const { site, module } = o, tilt = o.tilt ?? 30, azimuth = o.azimuth ?? (site.lat >= 0 ? 180 : 0), orient = o.orient || 'portrait';
  const perRow = Math.max(1, o.perRow | 0), stack = Math.max(1, o.stack | 0 || 1), rows = Math.max(1, o.rows | 0), gap = o.gap ?? 20, clearance = o.clearance ?? 500;
  const across = orient === 'landscape' ? module.lengthMm : module.widthMm, along = orient === 'landscape' ? module.widthMm : module.lengthMm;
  const tableAcross = perRow * across + (perRow - 1) * gap, slant = stack * along + (stack - 1) * gap;
  const B = basisOf(tilt, azimuth, site), nh = bearing(azimuth, site);
  const rule = o.pitchMm > 0 ? { pitchMm: o.pitchMm, shadowMm: o.pitchMm - slant * Math.cos(tilt * RAD), manual: true } : winterPitch({ slantMm: slant, tilt, azimuth, site, hours: o.hours || 0 });
  if (rule.error) return { error: rule.error };
  const pitch = rule.pitchMm, org = o.origin || [0, 0, 0], modules = [], tables = [];
  for (let r = 0; r < rows; r++) {
    const o0 = [org[0] - nh[0] * pitch * r, org[1] - nh[1] * pitch * r, org[2] + clearance];
    const P = (s, t) => add(add(o0, B.u, s), B.v, t);
    const corners = [P(-tableAcross / 2, 0), P(tableAcross / 2, 0), P(tableAcross / 2, slant), P(-tableAcross / 2, slant)];
    if (o.contains && !corners.slice(0, 2).concat([[o0[0], o0[1], 0]]).every((q) => o.contains(q[0], q[1]))) continue;
    tables.push({ row: r, corners });
    for (let k = 0; k < stack; k++) for (let c = 0; c < perRow; c++) {
      const s0 = -tableAcross / 2 + c * (across + gap), t0 = k * (along + gap);
      modules.push({ row: r * stack + k, col: c, table: r, c: P(s0 + across / 2, t0 + along / 2), corners: [P(s0, t0), P(s0 + across, t0), P(s0 + across, t0 + along), P(s0, t0 + along)] });
    }
  }
  return { modules, tables, pitchMm: r2(pitch), shadowMm: r2(rule.shadowMm), gcr: r2(slant * 1 / pitch), count: modules.length, kwp: r2(modules.length * module.wp / 1000), rule, u: B.u, v: B.v, n: B.n, across, along, tilt, azimuth };
}
export const arrayKwp = (modules, module) => r2(modules.length * module.wp / 1000);
