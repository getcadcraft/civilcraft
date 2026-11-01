/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pcf.js — PCF piping component files: the plain-text file that pipe-stress and isometric programs read and write (a keyword per
 * component at column 0, its END-POINT / CENTRE-POINT / BRANCH1-POINT / SKEY lines indented under it). DOM-free, import-free.
 * Written from the format as the tools document it (keywords, layout, units); no program's source was read.
 *
 *   model = { format: 'cadcraft-pcf', units: { coords, bore, weight }, header: [[key, value]], problems: [problem],
 *             pipelines: [{ ref, attrs: [[key, value]], components: [component] }] }
 *   component = { type ('PIPE' | 'ELBOW' | 'BEND' | 'TEE' | 'REDUCER-CONCENTRIC' | 'REDUCER-ECCENTRIC' | 'VALVE' | 'FLANGE' | 'OLET' | 'CAP' |
 *                 'SUPPORT' | …), ends: [{ x, y, z, bore, end }], centre: [x, y, z] | null, branch: { x, y, z, bore, end } | null,
 *                 at: [x, y, z] | null (CO-ORDS: a support), skey, angle (degrees) | null, attrs: [[key, value]], line }
 * Everything inside the model is millimetres (coordinates AND bores); the reader converts what the file says in UNITS-CO-ORDS /
 * UNITS-BORE, the writer says MM. Problems are plain data for the Problems store (kind 'import'): one per kind of loss.
 *
 *   readPcf(text) → model · writePcf(model, {header}) → text
 *   lengthOf(c) (mm) · connect(pipeline, tol) → { nodes, joins, open: [{c, end}] } · weightless; no solving here
 *   COMPONENTS (type → { ends, centre, branch }) · fmt(n)
 */

export const FORMAT = 'cadcraft-pcf';
export const LIMITS = { bytes: 32 * 1024 * 1024, lines: 400_000 };
const MM = { MM: 1, MILLIMETER: 1, MILLIMETERS: 1, METER: 1000, METERS: 1000, METRE: 1000, METRES: 1000, M: 1000, CM: 10, INCH: 25.4, INCHES: 25.4, IN: 25.4, FEET: 304.8, FOOT: 304.8, FT: 304.8 };
const KG = { KGS: 1, KG: 1, LBS: 0.45359237, LB: 0.45359237, POUNDS: 0.45359237, TONNES: 1000 };

/** What each component type must have (count of END-POINTs, CENTRE-POINT, BRANCH1-POINT). Unknown types are kept as they are. */
export const COMPONENTS = {
  PIPE: { ends: 2 }, ELBOW: { ends: 2, centre: true }, BEND: { ends: 2, centre: true }, TEE: { ends: 2, centre: true, branch: true }, CROSS: { ends: 2, centre: true, branch: true },
  'REDUCER-CONCENTRIC': { ends: 2 }, 'REDUCER-ECCENTRIC': { ends: 2 }, FLANGE: { ends: 2 }, 'FLANGE-BLIND': { ends: 1 }, VALVE: { ends: 2 }, 'VALVE-ANGLE': { ends: 2, centre: true },
  OLET: { ends: 1, centre: true, branch: true }, CAP: { ends: 1 }, COUPLING: { ends: 2 }, UNION: { ends: 2 }, GASKET: { ends: 2 }, FILTER: { ends: 2 }, INSTRUMENT: { ends: 2 },
  'PIPE-FIXED': { ends: 2 }, WELD: { ends: 0 }, SUPPORT: { ends: 0 }, 'MISC-COMPONENT': { ends: 2 },
};
const HEADER_KEYS = new Set(['ISOGEN-FILES', 'UNITS-BORE', 'UNITS-CO-ORDS', 'UNITS-WEIGHT', 'UNITS-BOLT-DIA', 'UNITS-BOLT-LENGTH', 'UNITS-WEIGHT-LENGTH', 'MESSAGE-SQUARE', 'PIPELINE-REFERENCE']);
const clean = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
const nums = (parts, n) => { const v = parts.slice(0, n).map(Number); return v.length === n && v.every(Number.isFinite) ? v : null; };

export function fmt(n) { return String(+Number(n).toFixed(4)); }

export function readPcf(input) {
  const text = typeof input === 'string' ? input : new TextDecoder('utf-8').decode(input);
  if (text.length > LIMITS.bytes) throw Object.assign(new Error('The file is larger than the reader accepts'), { code: 'too_big' });
  const model = { format: FORMAT, units: { coords: 'MM', bore: 'MM', weight: 'KGS' }, header: [], pipelines: [], problems: [] };
  const lost = { badNumbers: 0, unitUnknown: 0, shape: 0, elbowCentre: 0, zero: 0, bore: 0, noPipeline: 0 };
  const rawUnits = {};
  let pl = null, comp = null;
  const lines = text.replace(/^﻿/, '').split(/\r\n|\n|\r/);
  if (lines.length > LIMITS.lines) throw Object.assign(new Error('The file has more lines than the reader accepts'), { code: 'too_big' });
  const pending = [];   // components are scaled once the units are known (they come before the pipelines)
  const finishComp = () => { if (comp && pl) pl.components.push(comp); else if (comp) { lost.noPipeline++; pl = { ref: '', attrs: [], components: [comp] }; model.pipelines.push(pl); } comp = null; };
  for (let ln = 0; ln < lines.length; ln++) {
    const raw = lines[ln];
    if (!raw.trim()) continue;
    const indented = /^\s/.test(raw);
    const parts = raw.trim().split(/\s+/);
    const key = parts[0].toUpperCase();
    const rest = clean(raw.trim().slice(parts[0].length));
    if (!indented) {
      finishComp();
      if (key === 'PIPELINE-REFERENCE') { pl = { ref: rest, attrs: [], components: [] }; model.pipelines.push(pl); }
      else if (!pl && (HEADER_KEYS.has(key) || key.startsWith('UNITS-'))) { model.header.push([key, rest]); if (key.startsWith('UNITS-')) rawUnits[key] = rest.toUpperCase(); }
      else if (HEADER_KEYS.has(key) && !COMPONENTS[key]) { model.header.push([key, rest]); }
      else comp = { type: key, ends: [], centre: null, branch: null, at: null, skey: '', angle: null, attrs: [], line: ln + 1 };
      continue;
    }
    // indented: an attribute of the component (or of the pipeline before its first component)
    if (!comp) { if (pl) pl.attrs.push([key, rest]); continue; }
    if (key === 'END-POINT') { const v = nums(parts.slice(1), 3); const bore = Number(parts[4]); if (v && Number.isFinite(bore) !== false) comp.ends.push({ x: v[0], y: v[1], z: v[2], bore: Number.isFinite(bore) ? bore : 0, end: clean(parts[5] || '') }); else lost.badNumbers++; }
    else if (key === 'CENTRE-POINT' || key === 'CENTER-POINT') { const v = nums(parts.slice(1), 3); if (v) comp.centre = v; else lost.badNumbers++; }
    else if (key === 'BRANCH1-POINT') { const v = nums(parts.slice(1), 3); const bore = Number(parts[4]); if (v) comp.branch = { x: v[0], y: v[1], z: v[2], bore: Number.isFinite(bore) ? bore : 0, end: clean(parts[5] || '') }; else lost.badNumbers++; }
    else if (key === 'CO-ORDS') { const v = nums(parts.slice(1), 3); if (v) comp.at = v; else lost.badNumbers++; }
    else if (key === 'SKEY') comp.skey = clean(parts[1] || '');
    else if (key === 'ANGLE') { const a = Number(parts[1]); comp.angle = Number.isFinite(a) ? a / 100 : null; }   // PCF writes hundredths of a degree
    else comp.attrs.push([key, rest]);
  }
  finishComp();
  // ---- units → everything in millimetres
  const cu = rawUnits['UNITS-CO-ORDS'], bu = rawUnits['UNITS-BORE'], wu = rawUnits['UNITS-WEIGHT'];
  const kc = cu === undefined ? 1 : MM[cu], kb = bu === undefined ? 1 : MM[bu];
  if (kc === undefined || kb === undefined) { lost.unitUnknown++; }
  const fc = kc ?? 1, fb = kb ?? 1;
  if (wu && !(wu in KG)) lost.unitUnknown++;
  for (const p of model.pipelines) for (const c of p.components) {
    for (const e of c.ends) { e.x *= fc; e.y *= fc; e.z *= fc; e.bore *= fb; }
    if (c.centre) c.centre = c.centre.map((v) => v * fc);
    if (c.at) c.at = c.at.map((v) => v * fc);
    if (c.branch) { c.branch.x *= fc; c.branch.y *= fc; c.branch.z *= fc; c.branch.bore *= fb; }
  }
  // ---- checks (once per kind)
  const about = [];
  for (const p of model.pipelines) for (const c of p.components) {
    const rule = COMPONENTS[c.type];
    if (rule) {
      if (c.ends.length !== rule.ends || (rule.centre && !c.centre) || (rule.branch && !c.branch)) { lost.shape++; if (about.length < 8) about.push(c.type + ' (line ' + c.line + ')'); }
    }
    if (c.type === 'PIPE' && c.ends.length === 2) { const L = lengthOf(c); if (!(L > 0.01)) lost.zero++; }
    if ((c.type === 'ELBOW' || c.type === 'BEND') && c.centre && c.ends.length === 2) {
      const d = (e) => Math.hypot(e.x - c.centre[0], e.y - c.centre[1], e.z - c.centre[2]);
      if (Math.abs(d(c.ends[0]) - d(c.ends[1])) > 0.01 * Math.max(d(c.ends[0]), d(c.ends[1]), 1)) lost.elbowCentre++;
    }
    if ((c.type === 'PIPE' || c.type === 'FLANGE' || c.type === 'VALVE') && c.ends.length === 2 && Math.abs(c.ends[0].bore - c.ends[1].bore) > 0.01 && c.ends[0].bore > 0 && c.ends[1].bore > 0) lost.bore++;
  }
  const P = (code, severity, n, text) => n && model.problems.push({ code, severity, vars: { n }, text: n + ' ' + text });
  P('pcf.number.bad', 'warning', lost.badNumbers, 'coordinate line(s) did not hold three numbers and were left out.');
  P('pcf.units.unknown', 'warning', lost.unitUnknown, 'unit name(s) in the header are not known; millimetres were assumed.');
  P('pcf.component.shape', 'warning', lost.shape, 'component(s) lack end points, a centre point or a branch point their type needs' + (about.length ? ' (' + about.join(', ') + ').' : '.'));
  P('pcf.pipe.zero', 'warning', lost.zero, 'pipe(s) have no length.');
  P('pcf.elbow.centre', 'warning', lost.elbowCentre, 'elbow(s) or bend(s) have a centre point that is not the same distance from both ends.');
  P('pcf.bore.mismatch', 'note', lost.bore, 'straight part(s) change bore between their two ends.');
  P('pcf.pipeline.missing', 'note', lost.noPipeline, 'component(s) came before any PIPELINE-REFERENCE and were put in an unnamed line.');
  if (!model.pipelines.some((p) => p.components.some((c) => COMPONENTS[c.type]))) model.problems.push({ code: 'pcf.empty', severity: 'error', vars: {}, text: 'The file holds no piping components.' });
  return model;
}

export function lengthOf(c) {
  if (c.ends.length < 2) return 0;
  return Math.hypot(c.ends[1].x - c.ends[0].x, c.ends[1].y - c.ends[0].y, c.ends[1].z - c.ends[0].z);
}

/** Where components meet: every end point within `tol` mm of another joins them. → { joins: [[a, ea, b, eb]], open: [{ c, end }] } with component indices. */
export function connect(pipeline, tol = 0.5) {
  const pts = [];
  pipeline.components.forEach((c, i) => {
    c.ends.forEach((e, k) => pts.push({ i, k, x: e.x, y: e.y, z: e.z }));
    if (c.branch) pts.push({ i, k: 2, x: c.branch.x, y: c.branch.y, z: c.branch.z });
  });
  const joins = [], touched = new Set();
  const cell = (v) => Math.floor(v / Math.max(tol, 1e-6));
  const grid = new Map();
  for (const p of pts) { const key = cell(p.x) + ',' + cell(p.y) + ',' + cell(p.z); (grid.get(key) || grid.set(key, []).get(key)).push(p); }
  for (const p of pts) {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const q of grid.get((cell(p.x) + dx) + ',' + (cell(p.y) + dy) + ',' + (cell(p.z) + dz)) || []) {
        if (q.i <= p.i || Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) > tol) continue;
        joins.push([p.i, p.k, q.i, q.k]); touched.add(p.i + ':' + p.k); touched.add(q.i + ':' + q.k);
      }
    }
  }
  const open = pts.filter((p) => !touched.has(p.i + ':' + p.k)).map((p) => ({ c: p.i, end: p.k }));
  return { joins, open };
}

export function writePcf(model, { header = true } = {}) {
  const out = [];
  if (header) {
    out.push('ISOGEN-FILES ISOGEN.FLS', 'UNITS-BORE MM', 'UNITS-CO-ORDS MM', 'UNITS-WEIGHT KGS', 'UNITS-BOLT-DIA MM', 'UNITS-BOLT-LENGTH MM');
    for (const [k, v] of model.header || []) if (!k.startsWith('UNITS-') && k !== 'ISOGEN-FILES') out.push(k + (v ? ' ' + clean(v) : ''));
  }
  const pt = (k, x, y, z, bore, end) => '    ' + k + ' ' + [fmt(x), fmt(y), fmt(z), bore !== undefined && bore !== null ? fmt(bore) : '', end || ''].filter((s, i) => i < 3 || s !== '').join(' ');
  for (const p of model.pipelines) {
    out.push('PIPELINE-REFERENCE ' + clean(p.ref));
    for (const [k, v] of p.attrs || []) out.push('    ' + k + (v ? ' ' + clean(v) : ''));
    for (const c of p.components) {
      out.push(clean(c.type));
      for (const e of c.ends) out.push(pt('END-POINT', e.x, e.y, e.z, e.bore, e.end));
      if (c.centre) out.push('    CENTRE-POINT ' + c.centre.map(fmt).join(' '));
      if (c.branch) out.push(pt('BRANCH1-POINT', c.branch.x, c.branch.y, c.branch.z, c.branch.bore, c.branch.end));
      if (c.at) out.push('    CO-ORDS ' + c.at.map(fmt).join(' '));
      if (c.skey) out.push('    SKEY ' + clean(c.skey));
      if (c.angle !== null && c.angle !== undefined) out.push('    ANGLE ' + Math.round(c.angle * 100));
      for (const [k, v] of c.attrs || []) out.push('    ' + k + (v ? ' ' + clean(v) : ''));
    }
  }
  return out.join('\r\n') + '\r\n';
}
