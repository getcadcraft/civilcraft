/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout-points.js — points for the field (0.6 LC.22): numbering, the point file a total station or a survey program reads
 * (CSV / TXT, PNEZD and its kin), reading one back, and comparing as-built points with the design. DOM-free and
 * import-free. The one copy that is edited is lib/layout/; `node tools/layout/sync.mjs` copies it into bimcraft/dev/layout/
 * and cadcraft/dev/layout/ (`--check` fails on drift).
 *
 * The file follows CivilCraft's point files (civilcraft/dev/points.js) and CadCraft's EXPORTPOINTS (ptexport.js, 0.6 DF.7),
 * whose writer this is — bin/test-layout.mjs checks that formatPoints here writes the same bytes as ptexport.js for the
 * same points: one point per line, CRLF, 3 decimals, an empty Z when there is none, a description in double quotes when
 * it holds the delimiter or a quote, columns P point, N northing (y), E easting (x), Z elevation, D description.
 * Reading takes what CivilCraft takes: comma, tab, semicolon or spaces; a header row naming its columns
 * (Point / Northing / Easting / Elevation / Description, X / Y / Z …) sets the order, else the column count (5 → PNEZD,
 * 4 → PNEZ when the first column is a whole number else NEZD, 3 → NEZ; `prefer: 'PENZD'` reads easting first); # ; //
 * comments; every row that cannot be read reported with its line and a code.
 *
 *   POINT_FORMATS, READ_FORMATS
 *   formatPoints(points, { format, delimiter, dec }) → text           points: [{ n, x, y, z, d }]
 *   parsePoints(text, { format, prefer }) → { points, format, formatFrom, delimiter, header, bad: [{ line, text, code, … }], duplicates }
 *   numberPoints(points, { start, prefix, step }) → the points with n = prefix + number, in their order
 *   planOrder(a, b)                                  sorts by kind, then by Y (rows), then X — a stable field order
 *   comparePoints(design, built, { tol, tolZ, match: 'number' | 'nearest', radius }) →
 *       { rows: [{ n, built (its n), status: ok | out | missing | extra, dx, dy, dz, dh, d3, design: {x,y,z}, asBuilt: {x,y,z}, d }],
 *         summary: { design, built, matched, ok, out, missing, extra, maxH, maxZ, rmsH } }
 *       dh = horizontal distance, d3 = with the height; out = dh > tol or |dz| > tolZ (tolZ defaults to tol; a point with no
 *       height on either side is judged on dh alone); `nearest` pairs each design point with the closest unused as-built
 *       point within `radius` (default 10 × tol), closest pairs first
 *   compareTable(cmp, words) → rows for a CSV / a table: [head, …rows] (words: { head: [...], status: {ok, out, missing, extra} })
 *   csv(rows) → CSV text (CRLF; cells starting = + - @ with a leading ')
 */
export const POINT_FORMATS = Object.freeze({ PNEZD: ['P', 'N', 'E', 'Z', 'D'], PENZD: ['P', 'E', 'N', 'Z', 'D'], XYZ: ['E', 'N', 'Z'] });
export const READ_FORMATS = ['PNEZD', 'PENZD', 'PNEZ', 'PENZ', 'NEZD', 'ENZD', 'NEZ', 'ENZ'];
const MAX_BAD = 200;

export function formatPoints(points, { format = 'PNEZD', delimiter = ',', dec = 3 } = {}) {
  const cols = POINT_FORMATS[format] || POINT_FORMATS.PNEZD;
  const q = (s) => (s.includes(delimiter) || /["\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
  const num = (v) => (Number.isFinite(v) ? (Math.abs(v) < 0.5 * 10 ** -dec ? 0 : v).toFixed(dec) : '');
  const cell = (p, c) => ({ P: q(p.n), N: num(p.y), E: num(p.x), Z: num(p.z), D: q(p.d || '') })[c];
  return points.map((p) => cols.map((c) => cell(p, c)).join(delimiter)).join('\r\n') + (points.length ? '\r\n' : '');
}

const isNum = (s) => typeof s === 'string' && /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s.trim());
const cleanText = (s) => String(s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200);

export function parsePoints(text, { format = 'auto', prefer = 'PNEZD' } = {}) {
  const raw = String(text ?? '').replace(/^﻿/, '').split(/\r\n|\r|\n/);
  const rows = [];
  raw.forEach((line, i) => { const s = line.trim(); if (s && !s.startsWith('#') && !s.startsWith(';') && !s.startsWith('//')) rows.push({ line: i + 1, text: line }); });
  const out = { points: [], format: null, formatFrom: '', delimiter: null, header: null, bad: [], badCount: 0, duplicates: 0 };
  if (!rows.length) return out;
  const delim = detectDelimiter(rows.slice(0, 20).map((r) => r.text));
  out.delimiter = delim;
  const split = (s) => splitRow(s, delim);
  let start = 0, fmt = null;
  const first = split(rows[0].text);
  if (first.filter((c) => isNum(c)).length < 2) {
    out.header = first; start = 1;
    fmt = formatFromHeader(first);
    if (fmt) out.formatFrom = 'header';
  }
  if (format !== 'auto' && READ_FORMATS.includes(format)) { fmt = format; out.formatFrom = 'chosen'; }
  if (!fmt) {
    const sample = rows.slice(start, start + 20).map((r) => split(r.text));
    const n = mode(sample.map((c) => c.length));
    fmt = n >= 5 ? 'PNEZD' : n === 4 ? (sample.every((c) => /^\d+$/.test(c[0]) && isNum(c[3] ?? '')) ? 'PNEZ' : 'NEZD') : 'NEZ';
    if (prefer === 'PENZD') fmt = { PNEZD: 'PENZD', PNEZ: 'PENZ', NEZD: 'ENZD', NEZ: 'ENZ' }[fmt];
    out.formatFrom = 'columns';
  }
  out.format = fmt;
  const cols = fmt.split('');
  const iP = cols.indexOf('P'), iN = cols.indexOf('N'), iE = cols.indexOf('E'), iZ = cols.indexOf('Z'), iD = cols.indexOf('D');
  const seen = new Set();
  let auto = 0;
  const bad = (r, code, extra = {}) => { out.badCount++; if (out.bad.length < MAX_BAD) out.bad.push({ line: r.line, text: r.text.slice(0, 160), code, ...extra }); };
  for (let k = start; k < rows.length; k++) {
    const r = rows[k];
    let c = split(r.text);
    if (iD === cols.length - 1 && c.length > cols.length) c = [...c.slice(0, iD), c.slice(iD).join(delim === ',' ? ',' : ' ')];
    if (c.length < cols.length - (iD >= 0 ? 1 : 0)) { bad(r, 'cols', { n: c.length, want: cols.length, format: fmt }); continue; }
    const N = c[iN], E = c[iE], Z = c[iZ];
    if (!isNum(N) || !isNum(E)) { bad(r, 'ne'); continue; }
    if (Z !== undefined && Z !== '' && !isNum(Z)) { bad(r, 'z'); continue; }
    let n = iP >= 0 ? String(c[iP] ?? '').trim() : '';
    if (iP >= 0 && !n) { bad(r, 'nonum'); continue; }
    if (iP < 0) { do n = String(++auto); while (seen.has(n)); }
    if (seen.has(n)) { out.duplicates++; bad(r, 'twice', { num: n }); continue; }
    seen.add(n);
    out.points.push({ n: cleanText(n), x: Number(E), y: Number(N), z: Z === undefined || Z === '' ? null : Number(Z), d: iD >= 0 ? cleanText(c[iD] ?? '') : '' });
  }
  return out;
}

function detectDelimiter(lines) {
  const score = (re) => lines.filter((l) => re.test(l)).length;
  if (score(/,/) >= Math.ceil(lines.length * 0.6)) return ',';
  if (score(/\t/) >= Math.ceil(lines.length * 0.6)) return '\t';
  if (score(/;/) >= Math.ceil(lines.length * 0.6)) return ';';
  return 'ws';
}
function splitRow(s, delim) {
  if (delim === 'ws') return s.trim().split(/\s+/);
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"' && cur.trim() === '') { q = true; cur = ''; }
    else if (ch === delim) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}
const HEAD = [
  ['P', /^(pt|pnt|point|pointno|pointnumber|number|no|id|name|pt#|point#|#)$/],
  ['N', /^(n|north|northing|y|ycoord)$/],
  ['E', /^(e|east|easting|x|xcoord)$/],
  ['Z', /^(z|elev|elevation|el|height|h|zcoord|rl)$/],
  ['D', /^(d|desc|description|code|rawdescription|fulldescription|note|notes|feature)$/],
];
function formatFromHeader(cells) {
  const letters = cells.map((c) => { const k = c.toLowerCase().replace(/[\s._()-]/g, ''); for (const [L, re] of HEAD) if (re.test(k)) return L; return null; });
  if (!letters.includes('N') || !letters.includes('E') || letters.some((l) => l === null)) return null;
  const f = letters.join('');
  return READ_FORMATS.includes(f) ? f : null;
}
function mode(arr) { const m = new Map(); for (const v of arr) m.set(v, (m.get(v) || 0) + 1); let best = 0, bv = 0; for (const [v, c] of m) if (c > best) { best = c; bv = v; } return bv; }

export function numberPoints(points, { start = 1, prefix = '', step = 1 } = {}) {
  let k = Number.isFinite(+start) ? Math.floor(+start) : 1;
  const st = Number.isFinite(+step) && +step >= 1 ? Math.floor(+step) : 1;
  return points.map((p) => { const n = String(prefix || '') + k; k += st; return { ...p, n }; });
}

/** A stable field order: by kind (as listed), then rows of Y (to 1 mm), then X. */
export function planOrder(kinds = []) {
  const rank = (k) => { const i = kinds.indexOf(k); return i < 0 ? kinds.length : i; };
  return (a, b) => rank(a.kind) - rank(b.kind) || Math.round(a.y) - Math.round(b.y) || a.x - b.x || (a.z ?? 0) - (b.z ?? 0);
}

export function comparePoints(design, built, { tol = 10, tolZ = null, match = 'number', radius = null } = {}) {
  const tz = tolZ ?? tol;
  const rows = [];
  const used = new Set();
  const pair = (d, b) => {
    const dx = b.x - d.x, dy = b.y - d.y;
    const dz = Number.isFinite(d.z) && Number.isFinite(b.z) && d.z !== null && b.z !== null ? b.z - d.z : null;
    const dh = Math.hypot(dx, dy), d3 = dz === null ? dh : Math.hypot(dh, dz);
    const status = dh > tol + 1e-9 || (dz !== null && Math.abs(dz) > tz + 1e-9) ? 'out' : 'ok';
    return { n: d.n, built: b.n, status, dx, dy, dz, dh, d3, design: { x: d.x, y: d.y, z: d.z ?? null }, asBuilt: { x: b.x, y: b.y, z: b.z ?? null }, d: d.d || b.d || '' };
  };
  if (match === 'nearest') {
    const R = radius ?? 10 * tol;
    const cand = [];
    design.forEach((d, i) => built.forEach((b, j) => { const h = Math.hypot(b.x - d.x, b.y - d.y); if (h <= R) cand.push([h, i, j]); }));
    cand.sort((a, b) => a[0] - b[0]);
    const got = new Map();
    for (const [, i, j] of cand) { if (got.has(i) || used.has(j)) continue; got.set(i, j); used.add(j); }
    design.forEach((d, i) => rows.push(got.has(i) ? pair(d, built[got.get(i)]) : missing(d)));
  } else {
    const byN = new Map(built.map((b, j) => [String(b.n), j]));
    for (const d of design) {
      const j = byN.get(String(d.n));
      if (j === undefined) { rows.push(missing(d)); continue; }
      used.add(j);
      rows.push(pair(d, built[j]));
    }
  }
  built.forEach((b, j) => { if (!used.has(j)) rows.push({ n: '', built: b.n, status: 'extra', dx: null, dy: null, dz: null, dh: null, d3: null, design: null, asBuilt: { x: b.x, y: b.y, z: b.z ?? null }, d: b.d || '' }); });
  const m = rows.filter((r) => r.status === 'ok' || r.status === 'out');
  const summary = {
    design: design.length, built: built.length, matched: m.length,
    ok: rows.filter((r) => r.status === 'ok').length, out: rows.filter((r) => r.status === 'out').length,
    missing: rows.filter((r) => r.status === 'missing').length, extra: rows.filter((r) => r.status === 'extra').length,
    maxH: m.reduce((a, r) => Math.max(a, r.dh), 0), maxZ: m.reduce((a, r) => Math.max(a, Math.abs(r.dz ?? 0)), 0),
    rmsH: m.length ? Math.sqrt(m.reduce((a, r) => a + r.dh * r.dh, 0) / m.length) : 0,
  };
  return { rows, summary, tol, tolZ: tz, match };
}
function missing(d) { return { n: d.n, built: '', status: 'missing', dx: null, dy: null, dz: null, dh: null, d3: null, design: { x: d.x, y: d.y, z: d.z ?? null }, asBuilt: null, d: d.d || '' }; }

export function compareTable(cmp, { head, status, dec = 3 }) {
  const f = (v) => (v === null || v === undefined || !Number.isFinite(v) ? '' : v.toFixed(dec));
  return [head, ...cmp.rows.map((r) => [r.n, r.built, status[r.status] || r.status, r.d,
    f(r.design?.y), f(r.design?.x), f(r.design?.z), f(r.asBuilt?.y), f(r.asBuilt?.x), f(r.asBuilt?.z), f(r.dx), f(r.dy), f(r.dz), f(r.dh)])];
}

export function csv(rows) {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}
