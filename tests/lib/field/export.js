/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: file formats and developer messages; the labels a person reads come in through `words` (gen-ui.js passes the page's catalog) */
/**
 * export.js — engineering data out of a generated part (0.8 CE.7; DOM-free; the same bytes in Node and in a page, rule D2).
 *
 *   dataSheet({ name, generator, inputs, rows, problems, mesh, report, solver }) → a plain object (the data sheet)
 *   dataSheetJson(sheet) → text            dataSheetPdf(sheet, words) → Uint8Array (a one-page-or-more PDF, Helvetica, no dates)
 *   toVTI(grid, { box }) → text            VTK ImageData (.vti): the field as signed distance (negative inside) and an inside mask, on the
 *                                          node lattice, for ParaView and FEA / CFD tools
 *   toVTU(mesh, { name }) → text           VTK UnstructuredGrid (.vtu): the surface triangles with their area and normal
 *   threeMF(mesh, meta) → Uint8Array       3MF with the mesh in millimetres and `meta` (generator, inputs, regions …) as namespaced metadata
 * Nothing here reads the clock or the machine: the same part gives the same files.
 * Formats: VTK XML file formats (the public Kitware document "VTK File Formats", sections on ImageData and UnstructuredGrid, binary
 * appended inline as base64 with a UInt32 byte-count header); 3MF Core Specification 1.3 (the model part, content types and relationships,
 * custom metadata names carrying a declared namespace); PDF 1.4 (ISO 32000-1: a catalog, a page tree, content streams, the standard
 * Helvetica fonts with WinAnsi encoding, a cross-reference table).
 */
import { crc32 } from './zip.js';
import { INSIDE, BN, brickOf } from './grid.js';
import { fingerprint } from './grid.js';

// ---- base64 (deterministic, no btoa so a worker and Node agree) ---------------------------------------------------------------
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function base64(u8) {
  const out = [];
  let i = 0;
  for (; i + 2 < u8.length; i += 3) { const n = u8[i] << 16 | u8[i + 1] << 8 | u8[i + 2]; out.push(B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + B64[n & 63]); }
  if (i + 1 === u8.length) { const n = u8[i] << 16; out.push(B64[n >> 18 & 63] + B64[n >> 12 & 63] + '=='); }
  else if (i + 2 === u8.length) { const n = u8[i] << 16 | u8[i + 1] << 8; out.push(B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + '='); }
  return out.join('');
}
const le = (arr) => {                                   // a typed array's bytes, little-endian whatever the machine
  const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  if (new Uint8Array(new Uint16Array([1]).buffer)[0] === 1) return u8;
  const out = new Uint8Array(u8.length), w = arr.BYTES_PER_ELEMENT;
  for (let i = 0; i < u8.length; i += w) for (let k = 0; k < w; k++) out[i + k] = u8[i + w - 1 - k];
  return out;
};
const blob = (arr) => {                                 // VTK inline binary: UInt32 byte count, then the data, as one base64 text
  const data = le(arr), out = new Uint8Array(4 + data.length);
  new DataView(out.buffer).setUint32(0, data.length, true);
  out.set(data, 4);
  return base64(out);
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (x) => (Number.isFinite(x) ? String(+x.toPrecision(12)) : '0');

// ---- the data sheet ---------------------------------------------------------------------------------------------------------
export function dataSheet({ name = '', generator = null, inputs = {}, rows = [], problems = [], mesh = null, report = null, solver = null, notice = '' }) {
  const sorted = (o) => Object.fromEntries(Object.keys(o || {}).sort().map((k) => [k, o[k]]));
  return {
    format: 'cadcraft-datasheet', version: 1, part: String(name),
    generator: generator ? { id: generator.id || '', title: generator.title || '', hash: generator.hash || '' } : null,
    inputs: sorted(inputs),
    values: rows.map((r) => ({ name: r.name, value: r.value, ...(r.unit ? { unit: r.unit } : {}), ...(r.ref ? { source: r.ref } : {}), ...(r.note ? { note: r.note } : {}) })),
    problems: problems.map((p) => ({ code: p.code, severity: p.severity, ...(p.vars ? { numbers: sorted(p.vars) } : {}), ...(p.req ? { required: p.req } : {}), ...(p.found ? { found: p.found } : {}) })),
    mesh: mesh ? { triangles: mesh.triangles, vertices: mesh.vertices, hash: mesh.hash, closed: report ? report.closed === true : undefined } : null,
    ...(solver ? { solver: sorted(solver) } : {}),
    ...(notice ? { exportNotice: String(notice) } : {}),   // the footer every data sheet carries (Engineer's export-control notice, O3)
  };
}
export const dataSheetJson = (sheet) => JSON.stringify(sheet, null, 2) + '\n';

const WIN = (s) => { let o = ''; for (const ch of String(s)) { const c = ch.codePointAt(0); o += c < 256 ? ch : (ch === '–' || ch === '—' ? '-' : ch === '·' ? '.' : '?'); } return o; };
const pdfStr = (s) => '(' + WIN(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)') + ')';
const wrap = (s, n) => { const out = []; let line = ''; for (const w of String(s).split(/\s+/)) { if ((line + ' ' + w).trim().length > n && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out.length ? out : ['']; };

/** One or more A4 pages: title, the generator and its inputs, the values with units and sources, the checks. `words` holds the labels (English by default). */
export function dataSheetPdf(sheet, words = {}) {
  const W = { title: 'Data sheet', generator: 'Generator', inputs: 'Inputs', values: 'Values', name: 'Name', value: 'Value', unit: 'Unit', source: 'Source', checks: 'Checks', none: 'No problems found', body: 'Body', triangles: 'triangles', closed: 'closed solid', solver: 'Solver settings', hash: 'Mesh fingerprint', ...words };
  const lines = [];                                     // { x, size, bold, text }
  const add = (text, o = {}) => lines.push({ text, size: o.size || 9, bold: !!o.bold, x: o.x || 50, gap: o.gap || 0 });
  add(W.title + ': ' + sheet.part, { size: 16, bold: true, gap: 6 });
  if (sheet.generator) add(W.generator + ': ' + (sheet.generator.title || sheet.generator.id) + (sheet.generator.hash ? '  (' + sheet.generator.hash + ')' : ''), { gap: 4 });
  if (sheet.mesh) add(W.body + ': ' + sheet.mesh.triangles + ' ' + W.triangles + (sheet.mesh.closed ? ', ' + W.closed : '') + '.  ' + W.hash + ' ' + sheet.mesh.hash, { gap: 8 });
  add(W.inputs, { size: 11, bold: true, gap: 2 });
  for (const [k, v] of Object.entries(sheet.inputs)) add(k + ' = ' + v, { x: 60 });
  add('', { gap: 4 });
  add(W.values, { size: 11, bold: true, gap: 2 });
  add(W.name.padEnd(26) + W.value.padEnd(16) + W.unit.padEnd(10) + W.source, { bold: true, x: 50 });
  for (const r of sheet.values) {
    const val = typeof r.value === 'number' ? String(+r.value.toPrecision(6)) : String(r.value);
    const src = wrap(r.source || r.note || '', 62);
    lines.push({ text: r.name.replace(/_/g, ' ').slice(0, 25).padEnd(26) + val.slice(0, 15).padEnd(16) + (r.unit || '').slice(0, 9).padEnd(10) + src[0], size: 9, bold: false, x: 50, gap: 0 });
    for (const more of src.slice(1)) lines.push({ text: ''.padEnd(52) + more, size: 9, bold: false, x: 50, gap: 0 });
  }
  add('', { gap: 4 });
  add(W.checks, { size: 11, bold: true, gap: 2 });
  if (!sheet.problems.length) add(W.none, { x: 60 });
  for (const p of sheet.problems) add(p.severity + '  ' + p.code + (p.found ? '  found ' + p.found.value + ' ' + (p.found.unit || '') : '') + (p.required ? '  required ' + p.required.op + ' ' + p.required.value + ' ' + (p.required.unit || '') : ''), { x: 60 });
  if (sheet.solver) { add('', { gap: 4 }); add(W.solver, { size: 11, bold: true, gap: 2 }); for (const [k, v] of Object.entries(sheet.solver)) add(k + ' = ' + v, { x: 60 }); }
  // the footer of every page: the notice (when the sheet has one), small, above the page number
  const foot = sheet.exportNotice ? wrap(sheet.exportNotice, 120) : [];
  const bottom = foot.length ? 50 + foot.length * 7.5 + 6 : 50;
  // paginate: 760 high usable, a line is size * 1.35 + gap
  const pages = [[]];
  let y = 792;
  for (const l of lines) {
    const dy = l.size * 1.35 + l.gap;
    if (y - dy < bottom) { pages.push([]); y = 792; }
    y -= dy;
    pages[pages.length - 1].push({ ...l, y });
  }
  // objects: 1 catalog, 2 pages, 3 font regular, 4 font bold, then (page, content) pairs
  const objs = [];
  const kids = [];
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>';          // fixed pitch: the columns line up
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>';
  pages.forEach((pg, i) => {
    const content = pg.map((l) => `BT /F${l.bold ? 2 : 1} ${l.size} Tf ${l.x} ${l.y.toFixed(2)} Td ${pdfStr(l.text)} Tj ET`).join('\n') + foot.map((ln, k) => `\nBT /F1 6 Tf 50 ${(78 - k * 7.5).toFixed(2)} Td ${pdfStr(ln)} Tj ET`).join('') + `\nBT /F1 8 Tf 50 30 Td ${pdfStr('CadCraft Engineer   ' + (i + 1) + ' / ' + pages.length)} Tj ET`;
    const pageNo = 5 + 2 * i, contentNo = 6 + 2 * i;
    objs[pageNo] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNo} 0 R >>`;
    objs[contentNo] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    kids.push(`${pageNo} 0 R`);
  });
  objs[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  let out = '%PDF-1.4\n';
  const offsets = [];
  for (let n = 1; n < objs.length; n++) { offsets[n] = out.length; out += `${n} 0 obj\n${objs[n]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + offsets.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const u8 = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 255;                        // every character was reduced to Latin-1 by WIN()
  return u8;
}

// ---- VTK ---------------------------------------------------------------------------------------------------------------------
/** The field on the node lattice of `grid` over `box` [x0,y0,z0,x1,y1,z1] (default: every stored brick), distance clamped to ±band. */
export function toVTI(grid, { box = null, maxNodes = 6e7 } = {}) {
  const h = grid.h;
  let lo, hi;
  if (box) { lo = [0, 1, 2].map((a) => Math.floor(box[a] / h)); hi = [0, 1, 2].map((a) => Math.ceil(box[a + 3] / h)); }
  else { const e = grid.extent(); if (!e) throw Object.assign(new Error('export: the field is empty'), { code: 'empty' }); lo = e.lo.map((b) => b * 8); hi = e.hi.map((b) => b * 8 + 7); }
  const n = [hi[0] - lo[0] + 1, hi[1] - lo[1] + 1, hi[2] - lo[2] + 1], total = n[0] * n[1] * n[2];
  if (total > maxNodes) throw Object.assign(new Error('export: too many nodes'), { code: 'toobig', vars: { n: total } });
  const dist = new Float32Array(total), mask = new Uint8Array(total);
  for (let k = 0; k < n[2]; k++) for (let j = 0; j < n[1]; j++) for (let i = 0; i < n[0]; i++) {
    const v = grid.at(lo[0] + i, lo[1] + j, lo[2] + k), c = i + n[0] * (j + n[1] * k);
    dist[c] = v; mask[c] = v < 0 ? 1 : 0;
  }
  const ext = `0 ${n[0] - 1} 0 ${n[1] - 1} 0 ${n[2] - 1}`;
  return `<?xml version="1.0"?>\n<VTKFile type="ImageData" version="1.0" byte_order="LittleEndian" header_type="UInt32">\n` +
    `  <ImageData WholeExtent="${ext}" Origin="${num(lo[0] * h)} ${num(lo[1] * h)} ${num(lo[2] * h)}" Spacing="${num(h)} ${num(h)} ${num(h)}">\n    <Piece Extent="${ext}">\n` +
    `      <PointData Scalars="distance">\n        <DataArray type="Float32" Name="distance" format="binary">${blob(dist)}</DataArray>\n        <DataArray type="UInt8" Name="inside" format="binary">${blob(mask)}</DataArray>\n      </PointData>\n      <CellData/>\n    </Piece>\n  </ImageData>\n</VTKFile>\n`;
}

/** Surface triangles as an UnstructuredGrid: the points, triangle cells (VTK type 5), and per cell the area and the unit normal. */
export function toVTU({ positions, indices }, { name = 'surface' } = {}) {
  const nt = indices.length / 3, nv = positions.length / 3;
  const P = Float32Array.from(positions), conn = Int32Array.from(indices), off = new Int32Array(nt), types = new Uint8Array(nt).fill(5), area = new Float32Array(nt), nrm = new Float32Array(nt * 3);
  for (let t = 0; t < nt; t++) {
    off[t] = 3 * (t + 1);
    const a = indices[t * 3] * 3, b = indices[t * 3 + 1] * 3, c = indices[t * 3 + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx, l = Math.sqrt(x * x + y * y + z * z);
    area[t] = l / 2; if (l > 0) { nrm[t * 3] = x / l; nrm[t * 3 + 1] = y / l; nrm[t * 3 + 2] = z / l; }
  }
  return `<?xml version="1.0"?>\n<VTKFile type="UnstructuredGrid" version="1.0" byte_order="LittleEndian" header_type="UInt32">\n  <UnstructuredGrid>\n` +
    `    <Piece NumberOfPoints="${nv}" NumberOfCells="${nt}">\n      <Points>\n        <DataArray type="Float32" Name="${esc(name)}" NumberOfComponents="3" format="binary">${blob(P)}</DataArray>\n      </Points>\n` +
    `      <Cells>\n        <DataArray type="Int32" Name="connectivity" format="binary">${blob(conn)}</DataArray>\n        <DataArray type="Int32" Name="offsets" format="binary">${blob(off)}</DataArray>\n        <DataArray type="UInt8" Name="types" format="binary">${blob(types)}</DataArray>\n      </Cells>\n` +
    `      <CellData Normals="normal">\n        <DataArray type="Float32" Name="area" format="binary">${blob(area)}</DataArray>\n        <DataArray type="Float32" Name="normal" NumberOfComponents="3" format="binary">${blob(nrm)}</DataArray>\n      </CellData>\n    </Piece>\n  </UnstructuredGrid>\n</VTKFile>\n`;
}

// ---- 3MF ---------------------------------------------------------------------------------------------------------------------
const utf8 = (s) => new TextEncoder().encode(s);
function zipStored(files) {                             // a stored (uncompressed) zip: local headers, data, central directory
  const chunks = [], central = [];
  let off = 0;
  const u16 = (v) => [v & 255, v >> 8 & 255], u32 = (v) => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255];
  for (const f of files) {
    const nm = utf8(f.name), crc = crc32(f.data), head = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0x0021), ...u16(0x0021), ...u32(crc), ...u32(f.data.length), ...u32(f.data.length), ...u16(nm.length), ...u16(0)];
    chunks.push(Uint8Array.from(head), nm, f.data);
    central.push(Uint8Array.from([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0x0021), ...u16(0x0021), ...u32(crc), ...u32(f.data.length), ...u32(f.data.length), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nm);
    off += head.length + nm.length + f.data.length;
  }
  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const end = Uint8Array.from([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), ...u16(0)]);
  const all = [...chunks, ...central, end], out = new Uint8Array(all.reduce((s, c) => s + c.length, 0));
  let p = 0; for (const c of all) { out.set(c, p); p += c.length; }
  return out;
}
/** meta: { key: text } — written as <metadata name="cadcraft:key">. The mesh is in the generator's millimetres, z up, as 3MF expects. */
export function threeMF({ positions, indices }, meta = {}, { name = 'part' } = {}) {
  const v = [], t = [];
  for (let i = 0; i < positions.length; i += 3) v.push(`<vertex x="${num(positions[i])}" y="${num(positions[i + 1])}" z="${num(positions[i + 2])}"/>`);
  for (let i = 0; i < indices.length; i += 3) t.push(`<triangle v1="${indices[i]}" v2="${indices[i + 1]}" v3="${indices[i + 2]}"/>`);
  const md = [['Title', name], ['Application', 'CadCraft PartCraft'], ...Object.keys(meta).sort().map((k) => ['cadcraft:' + k, meta[k]])].map(([k, x]) => `  <metadata name="${esc(k)}">${esc(x)}</metadata>`).join('\n');
  const model = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:cadcraft="https://getcadcraft.com/3mf/2026">\n${md}\n  <resources>\n    <object id="1" type="model" name="${esc(name)}">\n      <mesh>\n        <vertices>\n${v.join('\n')}\n        </vertices>\n        <triangles>\n${t.join('\n')}\n        </triangles>\n      </mesh>\n    </object>\n  </resources>\n  <build>\n    <item objectid="1"/>\n  </build>\n</model>\n`;
  return zipStored([
    { name: '[Content_Types].xml', data: utf8('<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n</Types>\n') },
    { name: '_rels/.rels', data: utf8('<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n') },
    { name: '3D/3dmodel.model', data: utf8(model) },
  ]);
}
