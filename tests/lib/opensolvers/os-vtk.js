/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-vtk.js — a reader (and a small writer, for tests and round trips) of legacy ASCII VTK files, and of the text force files a
 * flow solver's "forces" function object writes (lib/opensolvers; suggestion 1309). DOM-free, imports nothing.
 *
 * Format: "VTK File Formats" of The VTK User's Guide (Kitware), section "Simple Legacy Formats": line 1 `# vtk DataFile Version x.y`,
 * line 2 a title, line 3 ASCII | BINARY, line 4 `DATASET UNSTRUCTURED_GRID | POLYDATA`, then POINTS n type, CELLS n size (each cell:
 * count then point ids) or, from file version 5.1, CELLS with OFFSETS / CONNECTIVITY arrays, CELL_TYPES n, POLYGONS / TRIANGLE_STRIPS
 * (polydata), and POINT_DATA n / CELL_DATA n sections holding SCALARS name type [comps] + LOOKUP_TABLE, VECTORS, NORMALS, TENSORS
 * (nine numbers a tuple), TEXTURE_COORDINATES, COLOR_SCALARS and FIELD name count blocks (arrays `name comps tuples type`).
 * BINARY files are refused with a plain message (the converters are asked for ASCII in the README we write).
 *
 *   parseVtk(text) → { version, title, dataset, points: Float64Array, cells: Int32Array[] , cellTypes: Int32Array,
 *                      pointData: { name: { comps, data: Float64Array } }, cellData: { … }, fieldData: { … } }
 *   surfaceOf(vtk) → { positions, tris: Int32Array, triCell: Int32Array, skipped }   the outside faces as triangles
 *   fieldList(vtk) → [{ key, where: 'point' | 'cell', name, comps, derived? }]       plus derived magnitude / von Mises entries
 *   fieldValues(vtk, key) → { where, values: Float64Array }                         one number per point or per cell
 *   displacementOf(vtk) → Float64Array(3n) | null                                    the point vector whose name says displacement
 *   writeVtk({ title, points, cells, cellTypes, pointData, cellData }) → text
 *   parseForces(text) → { columns, rows: [[t, …]], last: { time, total, pressure, viscous } }
 */
const CELL = { VERTEX: 1, LINE: 3, TRIANGLE: 5, STRIP: 6, POLYGON: 7, PIXEL: 8, QUAD: 9, TETRA: 10, VOXEL: 11, HEXAHEDRON: 12, WEDGE: 13, PYRAMID: 14,
  QUADRATIC_TRIANGLE: 22, QUADRATIC_QUAD: 23, QUADRATIC_TETRA: 24, QUADRATIC_HEXAHEDRON: 25 };
export const CELL_TYPES = CELL;
// faces of the volume cells by local corner (VTK numbering, outward not guaranteed: the plot does not need it)
const FACES = {
  10: [[0, 1, 2], [0, 3, 1], [1, 3, 2], [2, 3, 0]],
  24: [[0, 1, 2], [0, 3, 1], [1, 3, 2], [2, 3, 0]],
  12: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]],
  25: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]],
  11: [[0, 2, 3, 1], [4, 5, 7, 6], [0, 1, 5, 4], [1, 3, 7, 5], [3, 2, 6, 7], [2, 0, 4, 6]],
  13: [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]],
  14: [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]],
};

function fail(msg) { throw new Error(msg); }

export function parseVtk(text) {
  if (typeof text !== 'string') fail('VTK: text expected');
  let pos = 0;
  const line = () => { const e = text.indexOf('\n', pos); const s = text.slice(pos, e < 0 ? text.length : e); pos = e < 0 ? text.length : e + 1; return s.replace(/\r$/, ''); };
  const head = line();
  const m = /^#\s*vtk\s+DataFile\s+Version\s+(\d+)\.(\d+)/i.exec(head);
  if (!m) fail('This is not a legacy VTK file (the first line is not "# vtk DataFile Version").');
  const out = { version: +(m[1] + '.' + m[2]), title: line().trim(), dataset: '', points: new Float64Array(0), cells: [], cellTypes: new Int32Array(0), pointData: {}, cellData: {}, fieldData: {} };
  const kind = line().trim().toUpperCase();
  if (kind === 'BINARY') fail('This VTK file is binary. Ask the converter for ASCII (the README of the case gives the option).');
  if (kind !== 'ASCII') fail('VTK: the third line must be ASCII.');
  // token scanner (no giant arrays of strings)
  const n = text.length;
  const tok = () => {
    while (pos < n) { const c = text.charCodeAt(pos); if (c === 32 || c === 9 || c === 10 || c === 13) pos++; else break; }
    if (pos >= n) return null;
    const a = pos;
    while (pos < n) { const c = text.charCodeAt(pos); if (c === 32 || c === 9 || c === 10 || c === 13) break; pos++; }
    return text.slice(a, pos);
  };
  const peek = () => { const p = pos, t = tok(); pos = p; return t; };
  const int = (what) => { const t = tok(), v = Number(t); if (t === null || !Number.isInteger(v)) fail('VTK: a whole number was expected for ' + what + ', found "' + t + '"'); return v; };
  const nums = (count, what) => {
    const a = new Float64Array(count);
    for (let i = 0; i < count; i++) { const t = tok(); const v = Number(t); if (t === null || Number.isNaN(v)) fail('VTK: ' + what + ' ends early or holds "' + t + '" (number ' + (i + 1) + ' of ' + count + ')'); a[i] = v; }
    return a;
  };
  const restOfLine = () => { const s = line(); return s; };
  let section = null, sectionN = 0;   // 'point' | 'cell'
  const store = (name, comps, data) => { const tgt = section === 'point' ? out.pointData : section === 'cell' ? out.cellData : out.fieldData; tgt[name] = { comps, data }; };
  const cellsFromFlat = (count, flat) => {
    const cells = []; let p = 0;
    for (let c = 0; c < count; c++) { const k = flat[p++]; if (!(k >= 0) || p + k > flat.length) fail('VTK: the cell list is shorter than its header says'); cells.push(Int32Array.from(flat.subarray(p, p + k))); p += k; }
    if (p !== flat.length) fail('VTK: the cell list is longer than its cells');
    return cells;
  };
  const cellsBlock = (what) => {
    const a = int(what + ' count'), b = int(what + ' size');
    const nx = peek();
    if (nx && nx.toUpperCase() === 'OFFSETS') {   // version 5.1: a = offsets length (cells + 1), b = connectivity length
      tok(); tok(); const off = nums(a, 'OFFSETS');
      const c = tok(); if (!c || c.toUpperCase() !== 'CONNECTIVITY') fail('VTK: CONNECTIVITY expected after OFFSETS');
      tok(); const con = nums(b, 'CONNECTIVITY');
      const cells = [];
      for (let i = 0; i + 1 < a; i++) cells.push(Int32Array.from(con.subarray(off[i], off[i + 1])));
      return cells;
    }
    return cellsFromFlat(a, nums(b, what));
  };
  for (;;) {
    const t = tok();
    if (t === null) break;
    const K = t.toUpperCase();
    if (K === 'DATASET') { out.dataset = (tok() || '').toUpperCase(); if (out.dataset !== 'UNSTRUCTURED_GRID' && out.dataset !== 'POLYDATA') fail('VTK: only UNSTRUCTURED_GRID and POLYDATA files are read (this one is ' + out.dataset + ').'); }
    else if (K === 'POINTS') { const c = int('POINTS'); tok(); out.points = nums(3 * c, 'POINTS'); }
    else if (K === 'CELLS') out.cells = cellsBlock('CELLS');
    else if (K === 'CELL_TYPES') { const c = int('CELL_TYPES'); out.cellTypes = Int32Array.from(nums(c, 'CELL_TYPES')); }
    else if (K === 'POLYGONS') { const cells = cellsBlock('POLYGONS'); for (const c of cells) out.cells.push(c); const ty = new Int32Array(out.cells.length); ty.set(out.cellTypes); for (let i = out.cellTypes.length; i < ty.length; i++) ty[i] = out.cells[i].length === 3 ? 5 : out.cells[i].length === 4 ? 9 : 7; out.cellTypes = ty; }
    else if (K === 'TRIANGLE_STRIPS') { const cells = cellsBlock('TRIANGLE_STRIPS'); for (const c of cells) out.cells.push(c); const ty = new Int32Array(out.cells.length); ty.set(out.cellTypes); for (let i = out.cellTypes.length; i < ty.length; i++) ty[i] = 6; out.cellTypes = ty; }
    else if (K === 'VERTICES' || K === 'LINES') { const a = int(K), b = int(K); const nx = peek(); if (nx && nx.toUpperCase() === 'OFFSETS') { tok(); tok(); nums(a, K); tok(); tok(); nums(b, K); } else nums(b, K); }   // read and left out: nothing to draw
    else if (K === 'POINT_DATA') { section = 'point'; sectionN = int('POINT_DATA'); if (sectionN !== out.points.length / 3) fail('VTK: POINT_DATA says ' + sectionN + ' but the file has ' + out.points.length / 3 + ' points'); }
    else if (K === 'CELL_DATA') { section = 'cell'; sectionN = int('CELL_DATA'); if (out.cells.length && sectionN !== out.cells.length) fail('VTK: CELL_DATA says ' + sectionN + ' but the file has ' + out.cells.length + ' cells'); }
    else if (K === 'SCALARS') {
      const name = tok(); const rest = restOfLine().trim().split(/\s+/).filter(Boolean); const comps = rest.length > 1 ? Number(rest[1]) : 1;
      if (!(comps >= 1 && comps <= 9)) fail('VTK: SCALARS ' + name + ' has a bad component count');
      const p = peek(); if (p && p.toUpperCase() === 'LOOKUP_TABLE') { tok(); tok(); }
      store(name, comps, nums(comps * sectionN, 'SCALARS ' + name));
    }
    else if (K === 'COLOR_SCALARS') { const name = tok(), c = int('COLOR_SCALARS'); store(name, c, nums(c * sectionN, 'COLOR_SCALARS ' + name)); }
    else if (K === 'LOOKUP_TABLE') { tok(); const c = int('LOOKUP_TABLE'); nums(4 * c, 'LOOKUP_TABLE'); }
    else if (K === 'VECTORS' || K === 'NORMALS') { const name = tok(); restOfLine(); store(name, 3, nums(3 * sectionN, K + ' ' + name)); }
    else if (K === 'TEXTURE_COORDINATES') { const name = tok(), d = int('TEXTURE_COORDINATES'); restOfLine(); store(name, d, nums(d * sectionN, K)); }
    else if (K === 'TENSORS') { const name = tok(); restOfLine(); store(name, 9, nums(9 * sectionN, 'TENSORS ' + name)); }
    else if (K === 'TENSORS6') { const name = tok(); restOfLine(); store(name, 6, nums(6 * sectionN, 'TENSORS6 ' + name)); }
    else if (K === 'FIELD') {
      tok(); const count = int('FIELD');
      for (let i = 0; i < count; i++) {
        const name = tok(), comps = int('FIELD ' + name), tuples = int('FIELD ' + name), type = (tok() || '').toLowerCase();
        if (type === 'string') { for (let k = 0; k < comps * tuples; k++) line(); continue; }
        const data = nums(comps * tuples, 'FIELD ' + name);
        if (section && tuples === sectionN) store(name, comps, data); else out.fieldData[name] = { comps, data };
      }
    }
    else if (K === 'METADATA') { for (;;) { const s = line(); if (!s.trim()) break; if (pos >= n) break; } }
    else fail('VTK: the keyword "' + t + '" is not one this reader knows');
  }
  if (!out.dataset) fail('VTK: no DATASET line');
  if (out.dataset === 'UNSTRUCTURED_GRID' && out.cellTypes.length !== out.cells.length) fail('VTK: ' + out.cells.length + ' cells but ' + out.cellTypes.length + ' cell types');
  const np = out.points.length / 3;
  for (const c of out.cells) for (const v of c) if (!(v >= 0 && v < np)) fail('VTK: a cell names point ' + v + ' but the file has ' + np + ' points');
  return out;
}

/** The outside of the cells as triangles: surface cells as they are, volume cells by the faces only one cell has. */
export function surfaceOf(vtk) {
  const tris = [], triCell = [], faces = new Map();
  let skipped = 0;
  const fan = (ids, cell) => { const u = []; for (const v of ids) if (!u.includes(v)) u.push(v); for (let k = 1; k + 1 < u.length; k++) { tris.push(u[0], u[k], u[k + 1]); triCell.push(cell); } };
  vtk.cells.forEach((c, i) => {
    const ty = vtk.cellTypes[i];
    if (ty === 5 || ty === 7 || ty === 9) fan(c, i);
    else if (ty === 8) fan([c[0], c[1], c[3], c[2]], i);
    else if (ty === 22) fan([c[0], c[1], c[2]], i);
    else if (ty === 23) fan([c[0], c[1], c[2], c[3]], i);
    else if (ty === 6) { for (let k = 0; k + 2 < c.length; k++) { if (k % 2) tris.push(c[k + 1], c[k], c[k + 2]); else tris.push(c[k], c[k + 1], c[k + 2]); triCell.push(i); } }
    else if (FACES[ty]) {
      for (const f of FACES[ty]) {
        const ids = []; for (const k of f) { const v = c[k]; if (v !== undefined && !ids.includes(v)) ids.push(v); }
        if (ids.length < 3) continue;   // a face that collapsed (a tetrahedron stored as a brick with repeated corners)
        const key = [...ids].sort((a, b) => a - b).join(',');
        if (faces.has(key)) faces.set(key, null); else faces.set(key, { ids, cell: i });
      }
    } else if (ty !== 1 && ty !== 3 && ty !== 2 && ty !== 4) skipped++;
  });
  for (const f of faces.values()) if (f) fan(f.ids, f.cell);
  return { positions: vtk.points, tris: Int32Array.from(tris), triCell: Int32Array.from(triCell), skipped };
}

const sym6 = (d, i, comps) => (comps === 9
  ? [d[9 * i], d[9 * i + 4], d[9 * i + 8], (d[9 * i + 1] + d[9 * i + 3]) / 2, (d[9 * i + 5] + d[9 * i + 7]) / 2, (d[9 * i + 2] + d[9 * i + 6]) / 2]
  : [d[6 * i], d[6 * i + 1], d[6 * i + 2], d[6 * i + 3], d[6 * i + 4], d[6 * i + 5]]);
/** von Mises from the six components xx yy zz xy yz zx. */
export const vonMises = ([xx, yy, zz, xy, yz, zx]) => Math.sqrt(0.5 * ((xx - yy) ** 2 + (yy - zz) ** 2 + (zz - xx) ** 2) + 3 * (xy * xy + yz * yz + zx * zx));

export function fieldList(vtk) {
  const out = [];
  for (const [where, set] of [['point', vtk.pointData], ['cell', vtk.cellData]]) {
    for (const [name, f] of Object.entries(set)) {
      if (f.comps === 1) out.push({ key: where + ':' + name, where, name, comps: 1 });
      else if (f.comps === 3) { out.push({ key: where + ':' + name + ':mag', where, name, comps: 3, derived: 'mag' }); ['x', 'y', 'z'].forEach((a, k) => out.push({ key: where + ':' + name + ':' + k, where, name, comps: 3, derived: a })); }
      else if (f.comps === 9 || f.comps === 6) out.push({ key: where + ':' + name + ':vm', where, name, comps: f.comps, derived: 'vm' });
    }
  }
  return out;
}
export function fieldValues(vtk, key) {
  const parts = String(key).split(':'), where = parts[0], tail = parts.length > 2 && ['mag', 'vm', '0', '1', '2'].includes(parts[parts.length - 1]) ? parts.pop() : null, name = parts.slice(1).join(':');
  const f = (where === 'point' ? vtk.pointData : vtk.cellData)[name];
  if (!f) return null;
  const n = f.data.length / f.comps, v = new Float64Array(n);
  if (f.comps === 1) v.set(f.data);
  else if (f.comps === 3 && (tail === 'mag' || tail === null)) for (let i = 0; i < n; i++) v[i] = Math.hypot(f.data[3 * i], f.data[3 * i + 1], f.data[3 * i + 2]);
  else if (f.comps === 3) { const k = Number(tail); for (let i = 0; i < n; i++) v[i] = f.data[3 * i + k]; }
  else if (f.comps === 9 || f.comps === 6) for (let i = 0; i < n; i++) v[i] = vonMises(sym6(f.data, i, f.comps));
  else return null;
  return { where, values: v };
}
export function displacementOf(vtk) {
  for (const [name, f] of Object.entries(vtk.pointData)) if (f.comps === 3 && /disp|^DEPL$/i.test(name)) return f.data;
  return null;
}

const g = (v) => (Number.isInteger(v) ? String(v) : String(+v.toPrecision(12)));
export function writeVtk({ title = 'CadCraft', points, cells, cellTypes, pointData = {}, cellData = {} }) {
  const L = ['# vtk DataFile Version 3.0', title.replace(/[\r\n]/g, ' ').slice(0, 250), 'ASCII', 'DATASET UNSTRUCTURED_GRID', 'POINTS ' + points.length / 3 + ' double'];
  for (let i = 0; i < points.length; i += 3) L.push(g(points[i]) + ' ' + g(points[i + 1]) + ' ' + g(points[i + 2]));
  L.push('CELLS ' + cells.length + ' ' + cells.reduce((s, c) => s + c.length + 1, 0));
  for (const c of cells) L.push(c.length + ' ' + Array.from(c).join(' '));
  L.push('CELL_TYPES ' + cells.length); for (const t of cellTypes) L.push(String(t));
  const block = (label, count, set) => {
    if (!Object.keys(set).length) return;
    L.push(label + ' ' + count);
    for (const [name, f] of Object.entries(set)) {
      if (f.comps === 3) L.push('VECTORS ' + name + ' double'); else if (f.comps === 9) L.push('TENSORS ' + name + ' double'); else L.push('SCALARS ' + name + ' double ' + f.comps, 'LOOKUP_TABLE default');
      for (let i = 0; i < f.data.length; i += f.comps) L.push(Array.from(f.data.slice(i, i + f.comps), g).join(' '));
    }
  };
  block('POINT_DATA', points.length / 3, pointData); block('CELL_DATA', cells.length, cellData);
  return L.join('\n') + '\n';
}

/**
 * The text file of a "forces" function object. Lines starting with # are the header (the last one names the columns); a data line is the
 * time and numbers, with or without parentheses around vectors. Two layouts are understood:
 *   columns named total_x … pressure_x … viscous_x …  (one number a column)
 *   `Time forces(pressure viscous [porous]) moment(…)`  ((px py pz) (vx vy vz) [(…)]) ((…) …): total = pressure + viscous
 */
export function parseForces(text) {
  const rows = []; let header = '';
  for (const raw of String(text).split(/\r?\n/)) {
    const s = raw.trim();
    if (!s) continue;
    if (s.startsWith('#')) { header = s.replace(/^#\s*/, ''); continue; }
    const v = s.replace(/[()]/g, ' ').trim().split(/\s+/).map(Number);
    if (v.length >= 4 && v.every((x) => Number.isFinite(x))) rows.push(v);
  }
  if (!rows.length) throw new Error('No force rows were found in this file.');
  const cols = header.replace(/[()]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const r = rows[rows.length - 1], last = { time: r[0], total: null, pressure: null, viscous: null };
  const at = (name) => { const i = cols.indexOf(name); return i >= 0 && i + 2 < r.length ? [r[i], r[i + 1], r[i + 2]] : null; };
  if (cols.includes('total_x')) { last.total = at('total_x'); last.pressure = at('pressure_x'); last.viscous = at('viscous_x'); }
  else if (r.length >= 7) { last.pressure = [r[1], r[2], r[3]]; last.viscous = [r[4], r[5], r[6]]; last.total = last.pressure.map((p, k) => p + last.viscous[k]); }
  else last.total = [r[1], r[2], r[3]];
  return { columns: cols, rows, last };
}
