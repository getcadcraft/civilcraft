/* SPDX-License-Identifier: Apache-2.0 */
/**
 * streamtable.js — recognise a stream table (the heat-and-material-balance table a process simulator or a datasheet exports as CSV or XLSX)
 * and read it into SI numbers. DOM-free, import-free.
 *
 * Two layouts are found by the labels, not by position: STREAMS IN COLUMNS (first column = property names, one column per stream — the
 * classic balance table) and STREAMS IN ROWS (one header row of property names, one row per stream). Units come from the label ("Temperature (°C)",
 * "Pressure [bar]", "Mass flow, kg/h"), a Unit(s) column or a unit row. A row that is not a known property and holds fractions is a component.
 *
 *   readStreamTable(rows) → { ok, orientation: 'columns' | 'rows', streams: [stream], components: [name], basis: 'mole' | 'mass' | 'volume', problems }
 *   stream = { name, T (K), P (Pa, absolute), mass (kg/s), mole (mol/s), vol (m3/s), vf (0–1), h (J/mol?), rho (kg/m3), mw (g/mol), phase, comp: { name: fraction }, raw: { key: { value, unit } } }
 *   feedOf(stream, {basis, ids}) → a feed spec for lib/process: { massFlows | flows, T, P }   (ids: component names → process component ids)
 *   toNumber(text) · convert(key, value, unit) → { si, ok, gauge }
 */

const PROPS = [
  ['T', /^(temp|temperature)\b/i], ['P', /^(press|pressure)\b/i], ['vf', /(vapou?r|gas).*(fraction|frac|mol|quality)|^vf\b|^vapou?r\b/i],
  ['mass', /(mass|weight).*(flow|rate)|^(mass|weight)\b.*\/\s*(h|s|min)|^(total )?(mass|weight) flow/i], ['mole', /(mol|molar|mole).*(flow|rate)|^(molar|mole) flow/i],
  ['vol', /(vol|volume|volumetric|actual).*(flow|rate)|^(vol|volume) flow/i], ['h', /enthalpy/i], ['rho', /density|rho\b/i], ['mw', /mol(ecular|e)?\.? ?(weight|wt|mass)|^mw\b|^m\.?w\.?$/i],
  ['phase', /^(phase|state)\b/i], ['name', /^(stream|stream no\.?|stream name|stream number|name|tag|id|line)\b/i],
];
const SECTION = /^(composition|components?|mole fractions?|mass fractions?|mol(e)? ?%|wt ?%|mass ?%|compositional)/i;

export function toNumber(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : null;
  let s = String(text ?? '').trim().replace(/[\s ]/g, '');
  if (!s || /^[-–—]+$/.test(s)) return null;
  const pct = s.endsWith('%'); if (pct) s = s.slice(0, -1);
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (s.includes(',')) s = /^[-+]?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? (pct ? v / 100 : v) : null;
}

const norm = (u) => String(u || '').replace(/[\s ]/g, '').replace(/°|º|deg/gi, '').replace(/³/g, '3').replace(/²/g, '2').replace(/\*/g, '').toLowerCase();
const ATM = 101325;
const UNITS = {
  T: { c: [1, 273.15], f: null, k: [1, 0], r: [5 / 9, 0] },
  P: { pa: 1, kpa: 1e3, mpa: 1e6, bar: 1e5, mbar: 100, atm: ATM, psi: 6894.757293168, psia: 6894.757293168, kg_cm2: 98066.5, 'kg/cm2': 98066.5, mmhg: 133.322368, torr: 133.322368, inhg: 3386.389 },
  GAUGE: { barg: 1e5, psig: 6894.757293168, kpag: 1e3, mpag: 1e6, 'kg/cm2g': 98066.5, pag: 1 },
  mass: { 'kg/s': 1, 'kg/h': 1 / 3600, 'kg/hr': 1 / 3600, 'kg/min': 1 / 60, 't/h': 1000 / 3600, 'tonne/h': 1000 / 3600, 'mt/h': 1000 / 3600, 't/d': 1000 / 86400, 'g/s': 1e-3, 'lb/h': 0.45359237 / 3600, 'lb/hr': 0.45359237 / 3600, 'lb/s': 0.45359237, 'kg/d': 1 / 86400 },
  mole: { 'mol/s': 1, 'kmol/s': 1e3, 'kmol/h': 1e3 / 3600, 'kmol/hr': 1e3 / 3600, 'mol/h': 1 / 3600, 'mol/min': 1 / 60, 'lbmol/h': 453.59237 / 3600, 'lbmol/hr': 453.59237 / 3600, 'kmol/d': 1e3 / 86400 },
  vol: { 'm3/s': 1, 'm3/h': 1 / 3600, 'm3/hr': 1 / 3600, 'l/s': 1e-3, 'l/min': 1e-3 / 60, 'l/h': 1e-3 / 3600, 'm3/min': 1 / 60, 'ft3/h': 0.028316846592 / 3600, 'ft3/s': 0.028316846592, gpm: 6.30901964e-5, 'usgpm': 6.30901964e-5, 'bbl/d': 0.158987294928 / 86400 },
  rho: { 'kg/m3': 1, 'g/cm3': 1000, 'g/ml': 1000, 'lb/ft3': 16.01846337 },
  h: { 'j/mol': 1, 'kj/mol': 1e3, 'kj/kmol': 1, 'j/kmol': 1e-3 },
};

export function convert(key, value, unit) {
  const u = norm(unit);
  if (key === 'T') {
    if (!u || u === 'c') return { si: value + 273.15, ok: u === 'c' || !u, assumed: !u ? 'C' : null };
    if (u === 'f') return { si: ((value - 32) * 5) / 9 + 273.15, ok: true };
    if (u === 'k') return { si: value, ok: true };
    if (u === 'r') return { si: (value * 5) / 9, ok: true };
    return { si: value + 273.15, ok: false };
  }
  if (key === 'P') {
    if (UNITS.GAUGE[u] !== undefined) return { si: value * UNITS.GAUGE[u] + ATM, ok: true, gauge: true };
    if (UNITS.P[u] !== undefined) return { si: value * UNITS.P[u], ok: true };
    return { si: value * 1e5, ok: false, assumed: u ? null : 'bar' };
  }
  const tab = UNITS[key];
  if (tab && tab[u] !== undefined) return { si: value * tab[u], ok: true };
  if (['vf', 'mw', 'phase'].includes(key)) return { si: value, ok: true };
  return { si: value, ok: !u };
}

const unitIn = (label) => {
  const s = String(label || '');
  let m = /\(([^)]+)\)|\[([^\]]+)\]/.exec(s);
  if (m) return (m[1] || m[2]).trim();
  m = /,\s*([^,]+)$/.exec(s);
  if (m && /[\/°%]|^(bar|pa|kpa|mpa|psi|atm|k|c|f|gpm)\b/i.test(m[1].trim())) return m[1].trim();
  m = /\s((?:kg|t|lb|mol|kmol|lbmol|m3|l|g|ft3)\/\w+)$/i.exec(s);
  return m ? m[1] : '';
};
const labelOnly = (label) => String(label || '').replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/,\s*[^,]*\/[^,]*$/, '').trim();
const keyOf = (label) => { const l = labelOnly(label); for (const [k, re] of PROPS) if (re.test(l)) return k; return null; };

export function readStreamTable(rows) {
  const R = rows.map((r) => r.map((c) => (typeof c === 'string' ? c.trim() : c)));
  const problems = [];
  const P = (code, severity, n, text) => n && problems.push({ code, severity, vars: { n }, text: n + ' ' + text });
  // ---- orientation: where do the property labels sit?
  const inCol = R.slice(0, 80).filter((r) => r[0] && keyOf(r[0]) && keyOf(r[0]) !== 'name').length;
  let hdr = -1, inRow = 0;
  for (let i = 0; i < Math.min(R.length, 15); i++) { const n = new Set(R[i].filter((c) => c && keyOf(c) && keyOf(c) !== 'name').map(keyOf)).size; if (n > inRow) { inRow = n; hdr = i; } }
  const orientation = inRow > inCol || (inRow === inCol && inRow >= 2 && hdr >= 0 && R[hdr].slice(1).every((c) => keyOf(c))) ? 'rows' : 'columns';
  if (Math.max(inCol, inRow) < 2) return { ok: false, orientation: null, streams: [], components: [], basis: 'mole', problems: [{ code: 'streams.notfound', severity: 'error', vars: {}, text: 'No stream table was found: at least two property names (temperature, pressure, flow …) are needed.' }] };

  // cells of one property for one stream, as {value, unit, label}
  const streams = [];
  const comps = new Map();   // name → true
  let basis = 'mole', badNum = 0, unknownUnit = 0, gauge = 0, assumed = 0, noName = 0;
  const addRaw = (s, key, rawText, unit) => {
    if (rawText === '' || rawText === null || rawText === undefined) return;
    if (key === 'phase') { s.phase = String(rawText); return; }
    const v = toNumber(rawText);
    if (v === null) { badNum++; return; }
    const c = convert(key, v, unit);
    if (!c.ok) unknownUnit++;
    if (c.gauge) gauge++;
    if (c.assumed) assumed++;
    s.raw[key] = { value: v, unit };
    s[key] = c.si;
  };
  const sectionBasis = (label) => { const l = String(label).toLowerCase(); return /mass|wt|weight/.test(l) ? 'mass' : /vol/.test(l) ? 'volume' : 'mole'; };

  if (orientation === 'columns') {
    // header row: the row above/at the first property whose other cells are the stream names
    let first = R.findIndex((r) => r[0] && keyOf(r[0]) && keyOf(r[0]) !== 'name');
    let h = -1;
    for (let i = first - 1; i >= 0; i--) if (R[i].slice(1).some((c) => c !== '' && c !== undefined)) { h = i; break; }
    const nameRow = R.findIndex((r) => r[0] && keyOf(r[0]) === 'name');
    if (nameRow >= 0) h = nameRow;
    if (h < 0) h = Math.max(0, first - 1);
    const unitCol = R[h].findIndex((c, j) => j > 0 && /^units?$/i.test(String(c)));
    const firstData = unitCol === 1 ? 2 : 1;
    for (let j = firstData; j < R[h].length; j++) {
      if (j === unitCol) continue;
      const name = String(R[h][j] ?? '').trim();
      if (!name) { if (R.some((r, i) => i > h && r[j] !== '' && r[j] !== undefined)) noName++; continue; }
      streams.push({ name, col: j, comp: {}, raw: {} });
    }
    let sec = 'mole';
    for (let i = h + 1; i < R.length; i++) {
      const r = R[i];
      const label = r[0];
      if (!label) continue;
      const rest = r.slice(1).filter((c) => c !== '' && c !== undefined);
      if (!rest.length) { if (SECTION.test(label)) sec = sectionBasis(label); continue; }
      const key = keyOf(label);
      const unit = unitCol > 0 ? String(r[unitCol] || '') : unitIn(label);
      if (key && key !== 'name') { for (const s of streams) addRaw(s, key, r[s.col], unit); continue; }
      // a component row
      const nm = labelOnly(label);
      if (!nm || SECTION.test(nm)) { if (SECTION.test(nm)) sec = sectionBasis(nm); continue; }
      const pct = /%/.test(unit + label);
      basis = sec;
      let any = false;
      for (const s of streams) { const v = toNumber(r[s.col]); if (v !== null) { s.comp[nm] = pct && !String(r[s.col]).includes('%') ? v / 100 : v; any = true; } else if (r[s.col] !== '' && r[s.col] !== undefined) badNum++; }
      if (any) comps.set(nm, true);
    }
  } else {
    const head = R[hdr];
    const nameCol = Math.max(0, head.findIndex((c) => keyOf(c) === 'name'));
    const cols = head.map((c, j) => ({ j, label: c, key: j === nameCol ? 'name' : c ? keyOf(c) : null, unit: unitIn(c) }));
    let i0 = hdr + 1;
    // a unit row right under the header
    const ur = R[i0];
    if (ur && cols.some((c) => c.key && c.key !== 'name') && ur.filter((c) => c).length >= 2 && ur.filter((c) => toNumber(c) !== null).length === 0 && !ur[nameCol]) {
      cols.forEach((c) => { if (ur[c.j]) c.unit = String(ur[c.j]); });
      i0++;
    }
    const compCols = cols.filter((c) => c.j !== nameCol && !c.key && c.label);
    for (let i = i0; i < R.length; i++) {
      const r = R[i];
      const name = String(r[nameCol] ?? '').trim();
      if (!name) { if (r.some((c) => c !== '' && c !== undefined)) noName++; continue; }
      const s = { name, comp: {}, raw: {} };
      for (const c of cols) if (c.key && c.key !== 'name') addRaw(s, c.key, r[c.j], c.unit);
      for (const c of compCols) { const v = toNumber(r[c.j]); if (v !== null) { const nm = labelOnly(c.label); s.comp[nm] = /%/.test(c.label + c.unit) ? v / 100 : v; comps.set(nm, true); } }
      streams.push(s);
    }
    if (compCols.length) basis = /mass|wt|weight/i.test(compCols.map((c) => c.label).join(' ')) ? 'mass' : 'mole';
  }
  // per stream: fractions as given; flag fractions that do not sum to 1 (±1 %)
  let off = 0;
  for (const s of streams) { const t = Object.values(s.comp).reduce((a, b) => a + b, 0); if (Object.keys(s.comp).length && Math.abs(t - 1) > 0.01) off++; }
  P('streams.number.bad', 'warning', badNum, 'cell(s) are not numbers and were left out.');
  P('streams.unit.unknown', 'warning', unknownUnit, 'value(s) have a unit that is not known; they were read as they stand (K, Pa, kg/s, mol/s, m³/s).');
  P('streams.pressure.gauge', 'note', gauge, 'pressure(s) are gauge and were read as absolute by adding one atmosphere.');
  P('streams.unit.assumed', 'note', assumed, 'value(s) have no unit; temperature was read as °C and pressure as bar.');
  P('streams.fractions.sum', 'warning', off, 'stream(s) have composition fractions that do not add to 1 (within 1 %).');
  P('streams.name.missing', 'note', noName, 'column(s) or row(s) have values but no stream name and were left out.');
  if (!streams.length) problems.push({ code: 'streams.none', severity: 'error', vars: {}, text: 'The table has no streams.' });
  return { ok: streams.length > 0, orientation, streams, components: [...comps.keys()], basis, problems };
}

/** A feed for the process engine from a read stream. `ids` maps a table's component name → the engine's component id (names match case-insensitively when it is omitted). */
export function feedOf(stream, { basis = 'mole', ids = null, total = null } = {}) {
  const map = (n) => (ids ? ids[n] : n);
  const t = total ?? (basis === 'mass' ? stream.mass : stream.mole);
  const out = { T: stream.T, P: stream.P };
  const fr = Object.entries(stream.comp).filter(([n]) => map(n));
  if (t > 0 && fr.length) {
    const sum = fr.reduce((a, [, v]) => a + v, 0) || 1;
    const flows = {};
    for (const [n, v] of fr) flows[map(n)] = (t * v) / sum;
    out[basis === 'mass' ? 'massFlows' : 'flows'] = flows;
  }
  else out.missing = 'flow';   // no total flow on this basis, or no component the engine knows: the caller says so
  return out;
}
