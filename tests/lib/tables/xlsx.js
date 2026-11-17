/* SPDX-License-Identifier: Apache-2.0 */
/**
 * xlsx.js — THE Office Open XML workbook writer, and the zip it lives in (0.10 BK.39, session bk-r3-schedules-10). No library,
 * no imports, DOM-free. One copy for every host: canonical in lib/tables/, byte-identical in <app>/dev/tables/ by
 * `node tools/tables/sync.mjs`. It is TakeoffCraft's writer (0.4 K6) and BimCraft's COBie writer (0.7 LC.12) made one:
 * takeoffcraft/dev/xlsx.js and bimcraft/dev/assets-bim-xlsx.js now only hand their app's name and currency to this file.
 *
 *   const bytes = await writeXlsx([{ name, cols: [widths], rows: [[cell, …], …], freeze: 1 }], { title, creator, currency, created, stamp })
 *   cell = null | 'text' | 12.5 | { v, f (formula, no "="), s (style key) }
 *   creator   the program named in the file ('CadCraft' when none is given)
 *   currency  the symbol of the two money formats ('$' when none is given)
 *   created   the workbook's creation time (default now) · stamp: the date on the zip entries (default none: 1980-01-01, so two
 *             writes of the same workbook are the same bytes)
 *
 * Strings are inline (no shared-string table) and are never formulas: text that a spreadsheet would take for a formula if it
 * were typed (= + - @ first) is stored with quotePrefix when it has no style of its own, so it shows as the text it is and stays
 * text when the cell is edited. A formula is only ever what the caller gave as `f`; it carries its computed value so a reader
 * that does not recalculate still shows the right number. Styles: STYLE keys below.
 * The zip is deflated with CompressionStream('deflate-raw') when the runtime has it, else stored.
 */

const enc = new TextEncoder();

// ---- zip ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
export function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

async function deflateRaw(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const cs = new CompressionStream('deflate-raw');
    const out = new Response(new Blob([bytes]).stream().pipeThrough(cs)).arrayBuffer();
    return new Uint8Array(await out);
  } catch { return null; }
}

/** files: [{ name, data: Uint8Array | string }] → zip bytes. `date` null = 1980-01-01 00:00 on every entry (repeatable bytes). */
export async function zip(files, { compress = true, date = new Date() } = {}) {
  const dosTime = date ? ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF : 0;
  const dosDate = date ? (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF : 0x21;
  const chunks = [], central = [];
  let offset = 0;
  for (const f of files) {
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const name = enc.encode(f.name);
    const crc = crc32(data);
    let body = data, method = 0;
    if (compress) { const d = await deflateRaw(data); if (d && d.length < data.length) { body = d; method = 8; } }
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, method, true);
    lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, body.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    chunks.push(new Uint8Array(lh.buffer), name, body);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, method, true);
    ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true); ch.setUint32(20, body.length, true);
    ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + body.length;
  }
  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  const all = [...chunks, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((s, c) => s + c.length, 0));
  let p = 0;
  for (const c of all) { out.set(c, p); p += c.length; }
  return out;
}


// ---- workbook ----
/** Style keys → cellXfs index (order matches styles.xml below). `typed` / `typedHead`: text kept as typed (quotePrefix). */
export const STYLE = { none: 0, head: 1, qty: 2, pct: 3, rate: 4, money: 5, bold: 6, boldMoney: 7, text: 8, int: 9, typed: 10, typedHead: 11 };

const stylesXml = (currency) => { const c = String(currency || '$').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="4"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="0.0#%"/><numFmt numFmtId="166" formatCode="&quot;${c}&quot;#,##0.00##"/><numFmt numFmtId="167" formatCode="&quot;${c}&quot;#,##0.00"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color auto="1"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="12">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="167" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="167" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>
<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" quotePrefix="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" quotePrefix="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`; };

/** XML text: escape, and drop characters XML 1.0 forbids (a name from a file could hold them). */
export function xmlText(s) {
  return String(s).replace(/[^\u0009\u000A\u000D -퟿-�\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function colName(i) { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
export const ref = (r, c) => colName(c) + (r + 1);
/** Text a spreadsheet would run as a formula if a person typed it. */
export const looksLikeFormula = (s) => /^[=+\-@\t\r]/.test(String(s));

/** Sheet names: ≤ 31 chars, none of []:*?/\ , unique. */
export function sheetName(name, used = new Set()) {
  let base = String(name).replace(/[[\]:*?/\\]/g, ' ').replace(/^'+|'+$/g, '').trim().slice(0, 31) || 'Sheet';
  let n = base, k = 2;
  while (used.has(n.toLowerCase())) n = base.slice(0, 31 - String(k).length - 1) + ' ' + k++;
  used.add(n.toLowerCase());
  return n;
}

const numStr = (n) => (Object.is(n, -0) ? '0' : String(n));
function cellXml(v, r, c) {
  if (v === null || v === undefined || v === '') return '';
  const cell = typeof v === 'object' ? v : { v };
  let s = STYLE[cell.s] ?? 0;
  if (cell.f) {
    const at = ' r="' + ref(r, c) + '"' + (s ? ' s="' + s + '"' : '');
    const val = typeof cell.v === 'number' && Number.isFinite(cell.v) ? '<v>' + numStr(cell.v) + '</v>' : '';
    return '<c' + at + '><f>' + xmlText(cell.f) + '</f>' + val + '</c>';
  }
  if (typeof cell.v === 'number') return Number.isFinite(cell.v) ? '<c r="' + ref(r, c) + '"' + (s ? ' s="' + s + '"' : '') + '><v>' + numStr(cell.v) + '</v></c>' : '';
  const text = String(cell.v);
  if (looksLikeFormula(text)) s = s === 0 ? STYLE.typed : s === 1 ? STYLE.typedHead : s;
  return '<c r="' + ref(r, c) + '"' + (s ? ' s="' + s + '"' : '') + ' t="inlineStr"><is><t xml:space="preserve">' + xmlText(text) + '</t></is></c>';
}

function sheetXml(sh) {
  const cols = (sh.cols || []).map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('');
  const rows = sh.rows.map((row, r) => '<row r="' + (r + 1) + '">' + (row || []).map((v, c) => cellXml(v, r, c)).join('') + '</row>').join('');
  const freeze = sh.freeze ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="' + sh.freeze + '" topLeftCell="A' + (sh.freeze + 1) + '" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' : '';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + freeze + (cols ? '<cols>' + cols + '</cols>' : '') + '<sheetData>' + rows + '</sheetData></worksheet>';
}

/** sheets: [{ name, rows, cols?, freeze? }] → .xlsx bytes. */
export async function writeXlsx(sheets, { title = '', creator = 'CadCraft', currency = '$', created = new Date(), stamp = null, compress = true } = {}) {
  const used = new Set();
  const named = sheets.map((s) => ({ ...s, name: sheetName(s.name, used) }));
  const formulas = named.some((s) => s.rows.some((row) => (row || []).some((v) => v && typeof v === 'object' && v.f)));
  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const files = [
    { name: '[Content_Types].xml', data: X + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
      + named.map((s, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')
      + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
      + '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
      + '</Types>' },
    { name: '_rels/.rels', data: X + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
      + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
      + '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
      + '</Relationships>' },
    { name: 'docProps/core.xml', data: X + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
      + '<dc:title>' + xmlText(title) + '</dc:title><dc:creator>' + xmlText(creator) + '</dc:creator>'
      + '<dcterms:created xsi:type="dcterms:W3CDTF">' + created.toISOString().replace(/\.\d+Z$/, 'Z') + '</dcterms:created></cp:coreProperties>' },
    { name: 'docProps/app.xml', data: X + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>' + xmlText(creator) + '</Application></Properties>' },
    { name: 'xl/workbook.xml', data: X + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
      + '<bookViews><workbookView/></bookViews><sheets>' + named.map((s, i) => '<sheet name="' + xmlText(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets>'
      + (formulas ? '<calcPr calcId="191029" fullCalcOnLoad="1"/>' : '') + '</workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', data: X + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + named.map((s, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('')
      + '<Relationship Id="rId' + (named.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
      + '</Relationships>' },
    { name: 'xl/styles.xml', data: stylesXml(currency) },
    ...named.map((s, i) => ({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: sheetXml(s) })),
  ];
  return zip(files, { compress, date: stamp });
}
