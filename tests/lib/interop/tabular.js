/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tabular.js — read the spreadsheets other tools export: CSV (comma, semicolon or tab; quoted cells; BOM) and XLSX (our own zip reader
 * + the sheet XML; inline and shared strings, numbers, booleans; formulas are never evaluated — the cached value is what is read).
 * DOM-free; imports ./xml.js only. A file is untrusted: sizes, rows, columns and expansion are bounded, and a cell that starts with
 * = + - @ is kept as text and never run.
 *
 *   readCsv(text) → { rows: [[cell]], delimiter }                       (cells are strings)
 *   readXlsx(bytes) → Promise<{ sheets: [{ name, rows: [[cell]] }] }>   (cells are strings; numbers keep their stored text)
 *   readTable(bytes|string, name) → Promise<{ kind: 'csv'|'xlsx', sheets: [{ name, rows }] }>
 *   LIMITS
 */
import { parseXml, find, all, attr } from './xml.js';

export const LIMITS = { bytes: 64 * 1024 * 1024, inflated: 128 * 1024 * 1024, rows: 200_000, cols: 512, sheets: 64 };

export function readCsv(input) {
  let s = typeof input === 'string' ? input : new TextDecoder('utf-8').decode(input);
  if (s.length > LIMITS.bytes) throw Object.assign(new Error('The file is larger than the reader accepts'), { code: 'too_big' });
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  // delimiter: the one that appears most in the first lines outside quotes
  const head = s.slice(0, 8000);
  const count = (d) => { let n = 0, q = false; for (const ch of head) { if (ch === '"') q = !q; else if (!q && ch === d) n++; } return n; };
  const delimiter = [',', ';', '\t'].map((d) => [d, count(d)]).sort((a, b) => b[1] - a[1])[0][1] ? [',', ';', '\t'].map((d) => [d, count(d)]).sort((a, b) => b[1] - a[1])[0][0] : ',';
  const rows = [];
  let row = [], cell = '', q = false, i = 0;
  const n = s.length;
  const endCell = () => { row.push(cell); cell = ''; if (row.length > LIMITS.cols) throw Object.assign(new Error('A row has more columns than the reader accepts'), { code: 'too_wide' }); };
  const endRow = () => { endCell(); if (row.length > 1 || row[0] !== '') rows.push(row); row = []; if (rows.length > LIMITS.rows) throw Object.assign(new Error('The file has more rows than the reader accepts'), { code: 'too_long' }); };
  while (i < n) {
    const ch = s[i];
    if (q) {
      if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i += 2; continue; } q = false; i++; continue; }
      cell += ch; i++; continue;
    }
    if (ch === '"' && cell === '') { q = true; i++; continue; }
    if (ch === delimiter) { endCell(); i++; continue; }
    if (ch === '\r') { endRow(); i += s[i + 1] === '\n' ? 2 : 1; continue; }
    if (ch === '\n') { endRow(); i++; continue; }
    cell += ch; i++;
  }
  if (cell !== '' || row.length) endRow();
  return { rows, delimiter };
}

// ---------------------------------------------------------------------------------------------------- zip (reading)
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

async function inflateRaw(data, max) {
  const ds = new DecompressionStream('deflate-raw');
  const w = ds.writable.getWriter();
  w.write(data).catch(() => {}); w.close().catch(() => {});
  const r = ds.readable.getReader();
  const parts = [];
  let total = 0;
  for (;;) {
    const { done, value } = await r.read();
    if (done) break;
    total += value.length;
    if (total > max) { try { await r.cancel(); } catch (e) { /* closed */ } throw Object.assign(new Error('A part of the workbook expands past the allowed size'), { code: 'bomb' }); }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

/** The entries of a zip: Map(name → () => Promise<Uint8Array>). Central directory only; no encryption, no zip64. */
export function zipEntries(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length > LIMITS.bytes) throw Object.assign(new Error('The file is larger than the reader accepts'), { code: 'too_big' });
  let e = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 65535); i--) if (u32(b, i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw Object.assign(new Error('This is not a zip / xlsx file'), { code: 'not_zip' });
  const count = u16(b, e + 10);
  let p = u32(b, e + 16);
  const map = new Map();
  let budget = LIMITS.inflated;
  for (let k = 0; k < count; k++) {
    if (u32(b, p) !== 0x02014b50) throw Object.assign(new Error('The zip directory is damaged'), { code: 'damaged' });
    const method = u16(b, p + 10), csize = u32(b, p + 20), usize = u32(b, p + 24), nl = u16(b, p + 28), xl = u16(b, p + 30), cl = u16(b, p + 32), lo = u32(b, p + 42);
    const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    if (u16(b, lo + 6) & 1) throw Object.assign(new Error('The workbook is password protected'), { code: 'encrypted' });
    map.set(name, async () => {
      if (usize > budget) throw Object.assign(new Error('The workbook expands past the allowed size'), { code: 'bomb' });
      budget -= usize;
      const start = lo + 30 + u16(b, lo + 26) + u16(b, lo + 28);
      const raw = b.subarray(start, start + csize);
      if (method === 0) return raw.slice();
      if (method === 8) return inflateRaw(raw, usize + 1024);
      throw Object.assign(new Error('A part of the workbook uses an unsupported compression'), { code: 'unsupported' });
    });
  }
  return map;
}

const colIndex = (ref) => { const m = /^([A-Z]+)/.exec(ref || ''); if (!m) return -1; let n = 0; for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
const textOf = (si) => {
  // <si><t>…</t></si> or rich text <r><t>…</t></r>…
  let s = '';
  const go = (n) => { for (const c of n.children) { if (c.tag === 't') s += c.text; else if (c.tag === 'r' || c.tag === 'is') go(c); } };
  go(si);
  return s;
};

export async function readXlsx(bytes) {
  const z = zipEntries(bytes);
  const get = async (name) => { const f = z.get(name); return f ? new TextDecoder().decode(await f()) : null; };
  const wbText = await get('xl/workbook.xml');
  if (!wbText) throw Object.assign(new Error('This zip is not an Excel workbook'), { code: 'not_xlsx' });
  const wb = parseXml(wbText);
  const rels = await get('xl/_rels/workbook.xml.rels');
  const relMap = new Map();
  if (rels) for (const r of all(parseXml(rels), 'Relationship')) relMap.set(attr(r, 'Id'), attr(r, 'Target'));
  const shared = [];
  const ss = await get('xl/sharedStrings.xml');
  if (ss) for (const si of all(parseXml(ss), 'si')) shared.push(textOf(si));
  const sheets = [];
  const list = all(find(wb, 'sheets'), 'sheet').slice(0, LIMITS.sheets);
  for (const sh of list) {
    const rid = attr(sh, 'r:id') || attr(sh, 'id');
    let target = relMap.get(rid) || 'worksheets/sheet' + (sheets.length + 1) + '.xml';
    target = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
    const xml = await get(target);
    if (!xml) continue;
    const root = parseXml(xml);
    const rows = [];
    for (const r of all(find(root, 'sheetData'), 'row')) {
      const ri = (parseInt(attr(r, 'r'), 10) || rows.length + 1) - 1;
      if (ri >= LIMITS.rows) throw Object.assign(new Error('The sheet has more rows than the reader accepts'), { code: 'too_long' });
      const out = [];
      for (const c of all(r, 'c')) {
        const ci = colIndex(attr(c, 'r')) >= 0 ? colIndex(attr(c, 'r')) : out.length;
        if (ci >= LIMITS.cols) continue;
        const t = attr(c, 't');
        let v = '';
        if (t === 's') v = shared[parseInt(find(c, 'v')?.text, 10)] ?? '';
        else if (t === 'inlineStr') v = textOf(find(c, 'is') || { children: [] });
        else if (t === 'b') v = find(c, 'v')?.text === '1' ? 'TRUE' : 'FALSE';
        else v = find(c, 'v')?.text ?? '';
        while (out.length < ci) out.push('');
        out[ci] = v;
      }
      while (rows.length < ri) rows.push([]);
      rows[ri] = out;
    }
    while (rows.length && !rows[rows.length - 1].some((c) => c !== '')) rows.pop();
    sheets.push({ name: attr(sh, 'name'), rows });
  }
  return { sheets };
}

export async function readTable(input, name = '') {
  const isZip = typeof input !== 'string' && input.length > 3 && input[0] === 0x50 && input[1] === 0x4b;
  if (isZip) return { kind: 'xlsx', ...(await readXlsx(input)) };
  const c = readCsv(input);
  return { kind: 'csv', sheets: [{ name: name || 'Sheet1', rows: c.rows }] };
}
