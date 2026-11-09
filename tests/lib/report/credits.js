/* SPDX-License-Identifier: Apache-2.0 */
/**
 * credits.js — the Library items a project uses and the credit each one carries. DOM-free; no app name in the logic: a host hands in what it has.
 *
 * Every placed Library item keeps its license and credit line in its own file (an IFC property set `CadCraft_LibraryItem`; CC-* block attributes in a
 * drawing), so credits need no network. Two ways in:
 *   - a file: fromFile(name, bytes) reads IFC and text DXF;
 *   - an open app: entries it reports itself (window.ccLibraryCreditSources, see gather), the only way to read a DWG.
 *
 *   entry   { uuid, version, name, license, attribution, url, sources: [file names] }
 *   gather({ members: [{ app, name, bytes }], live: [{ app, source, items: [entry] }] }) → { items: [entry], unchecked: [file name] }
 *   split(items) → { required, welcome }     welcome = CC0 or no license recorded; every other license keeps its credit with the work
 *   line(entry) → the credit as text
 *   creditRows(items, { wrap }) → [[license, credit text]], one row per wrapped line of each credit (a continuation row has '' for its license), required credits first
 *   creditsTable(head, rows, { h }) → { lines: [{ x1, y1, x2, y2 }], texts: [{ x, y, h, s }], width, height }   a table drawn downward from (0, 0), for a host with no table object
 */
export const LIBRARY_PSET = 'CadCraft_LibraryItem';
export const DXF_TAGS = { uuid: 'CC-ITEM-UUID', ver: 'CC-ITEM-VER', name: 'CC-ITEM-NAME', license: 'CC-LICENSE', attribution: 'CC-ATTRIB', url: 'CC-LICENSE-URL' };
/** Larger drawings are not scanned here (decoding them would stall the page); they are reported as not checked. */
export const MAX_SCAN_BYTES = 256 * 1024 * 1024;

const clean = (s, n = 1000) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const dec = new TextDecoder('utf-8', { fatal: false });
const extOf = n => { const m = /\.([A-Za-z0-9]{1,12})$/.exec(String(n || '')); return m ? m[1].toLowerCase() : ''; };

function entry(o, source) {
  const e = { uuid: clean(o.uuid, 80), version: parseInt(o.version, 10) || 0, name: clean(o.name, 300), license: clean(o.license, 80), attribution: clean(o.attribution), url: clean(o.url, 500), sources: [] };
  if (source) e.sources.push(clean(source, 160));
  return e.uuid || e.attribution ? e : null;
}

/** An ISO 10303-21 string body: '' is a quote; \X2\hhhh…\X0\ is UTF-16; \X\hh is one byte of Latin-1; \S\c is c + 128. */
export function stepString(s) {
  return String(s).replace(/''/g, "'")
    .replace(/\\X2\\((?:[0-9A-Fa-f]{4})+)\\X0\\/g, (_, h) => String.fromCharCode(...h.match(/.{4}/g).map(x => parseInt(x, 16))))
    .replace(/\\X\\([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\S\\(.)/g, (_, c) => String.fromCharCode(c.charCodeAt(0) + 128));
}

/** IFC (STEP text): one entry per CadCraft_LibraryItem property set. */
export function fromIfcText(text, source = '') {
  if (!text.includes(LIBRARY_PSET)) return [];
  const values = new Map(), sets = [];
  for (const raw of text.split(/;\s*\r?\n/)) {
    const line = raw.replace(/\r?\n/g, '').trim();
    let m = /^#(\d+)\s*=\s*IFCPROPERTYSINGLEVALUE\('([^']*)',(?:\$|'(?:[^']|'')*'),IFC[A-Z]+\((.*)\),(?:\$|#\d+)\)$/i.exec(line);
    if (m) { const v = m[3].trim(); values.set(m[1], [m[2], v.startsWith("'") ? stepString(v.slice(1, -1)) : v]); continue; }
    if (/^#\d+\s*=\s*IFCPROPERTYSET\(/i.test(line) && line.includes("'" + LIBRARY_PSET + "'")) {
      m = /\(([#\d,\s]+)\)\)$/.exec(line);
      if (m) sets.push(m[1].split(',').map(x => x.replace(/[#\s]/g, '')));
    }
  }
  const out = [];
  for (const ids of sets) {
    const p = {};
    for (const id of ids) { const v = values.get(id); if (v) p[v[0]] = v[1]; }
    const e = entry({ uuid: p.ItemUuid, version: p.ItemVersion, license: p.License, attribution: p.Attribution }, source);
    if (e) out.push(e);
  }
  return out;
}

/** DXF writes a character outside its code page as \\U+hhhh. */
export const dxfString = s => String(s).replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

/** Text DXF: the CC-* attributes of each INSERT. */
export function fromDxfText(text, source = '') {
  if (!text.includes(DXF_TAGS.uuid) && !text.includes(DXF_TAGS.attribution)) return [];
  const lines = text.split(/\r?\n/), out = [];
  let cur = null, val = '', tag = '', inAttrib = false;
  const endAttrib = () => { if (inAttrib && cur && tag) cur[tag] = dxfString(val); inAttrib = false; tag = ''; val = ''; };
  const endInsert = () => {
    if (!cur) return;
    const e = entry({ uuid: cur[DXF_TAGS.uuid], version: cur[DXF_TAGS.ver], name: cur[DXF_TAGS.name], license: cur[DXF_TAGS.license], attribution: cur[DXF_TAGS.attribution], url: cur[DXF_TAGS.url] }, source);
    if (e) out.push(e);
    cur = null;
  };
  for (let k = 0; k + 1 < lines.length; k += 2) {
    const code = lines[k].trim(), v = lines[k + 1];
    if (code === '0') {
      endAttrib();
      const type = v.trim();
      if (type === 'ATTRIB') inAttrib = true;
      else if (type === 'INSERT') { endInsert(); cur = {}; }
      else if (type !== 'SEQEND') endInsert();
    } else if (inAttrib) { if (code === '2') tag = v.trim(); else if (code === '1') val = v; else if (code === '3') val += v; }
  }
  endAttrib(); endInsert();
  return out;
}

/** What a file can tell. → { entries, checked }: checked is false for a kind that can hold placed items but cannot be read here. */
export function fromFile(name, bytes) {
  const x = extOf(name);
  if (x === 'dwg') return { entries: [], checked: false };
  if (x !== 'ifc' && x !== 'dxf') return { entries: [], checked: true };
  if (!bytes || bytes.length > MAX_SCAN_BYTES) return { entries: [], checked: false };
  if (x === 'dxf' && dec.decode(bytes.subarray(0, 22)).startsWith('AutoCAD Binary DXF')) return { entries: [], checked: false };
  const text = dec.decode(bytes);
  return { entries: x === 'ifc' ? fromIfcText(text, name) : fromDxfText(text, name), checked: true };
}

export function merge(lists) {
  const map = new Map();
  for (const list of lists) for (const raw of list || []) {
    const e = raw && raw.sources ? { ...raw } : entry(raw || {}, raw && raw.source);
    if (!e) continue;
    const key = e.uuid ? e.uuid + '@' + e.version : 'text:' + e.attribution;
    const had = map.get(key);
    if (!had) { map.set(key, { ...e, sources: [...new Set(e.sources)] }); continue; }
    for (const f of ['name', 'license', 'attribution', 'url']) if (!had[f] && e[f]) had[f] = e[f];
    had.sources = [...new Set([...had.sources, ...e.sources])];
  }
  return [...map.values()].sort((a, b) => line(a).localeCompare(line(b)));
}

/** The credit as text: the line the item carries, else what can be said from its name and license. */
export function line(e) {
  if (e.attribution) return e.attribution;
  const name = e.name || e.uuid || '';
  return name ? '“' + name + '”' + (e.license ? ', ' + e.license : '') : e.license;
}

export function split(items) {
  const free = e => !e.license || e.license === 'CC0-1.0';
  return { required: items.filter(e => !free(e)), welcome: items.filter(free) };
}

export function gather({ members = [], live = [] } = {}) {
  const liveApps = new Set(live.map(l => l.app)), lists = live.map(l => (l.items || []).map(i => ({ ...i, source: i.source || l.source }))), unchecked = [];
  for (const m of members) {
    const r = fromFile(m.name, m.bytes);
    lists.push(r.entries);
    if (!r.checked && !liveApps.has(m.app)) unchecked.push(m.name);
  }
  return { items: merge(lists), unchecked };
}

export function wrapText(s, width) {
  const out = []; let cur = '';
  for (let w of String(s).split(/\s+/).filter(Boolean)) {
    while (w.length > width) { if (cur) { out.push(cur); cur = ''; } out.push(w.slice(0, width)); w = w.slice(width); }   // a long address is cut, never lost
    if (cur && cur.length + 1 + w.length > width) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) out.push(cur);
  return out;
}
export function creditRows(items, { wrap = 62 } = {}) {
  const { required, welcome } = split(items), rows = [];
  for (const e of [...required, ...welcome]) wrapText(line(e), wrap).forEach((t, i) => rows.push([i ? '' : (e.license || '-'), t]));
  return rows;
}
export function creditsTable(head, rows, { h = 2.5 } = {}) {
  const pad = h * 0.6, rowH = h * 1.9, CH = 0.62;   // CH: a generous average character width, so text stays inside its column in any font
  const widths = head.map((c, j) => Math.max(String(c).length, ...rows.map(r => String(r[j] ?? '').length)) * h * CH + 2 * pad);
  const width = widths.reduce((a, b) => a + b, 0), height = (rows.length + 1) * rowH, lines = [], texts = [];
  const hline = y => lines.push({ x1: 0, y1: y, x2: width, y2: y });
  hline(0);
  [head, ...rows].forEach((r, i) => {
    const top = -i * rowH;
    if (i === 1 || (i > 1 && r[0] !== '')) hline(top);   // a continuation line stays in its credit's box
    let x = 0;
    r.forEach((c, j) => { if (String(c ?? '') !== '') texts.push({ x: x + pad, y: top - rowH + (rowH - h) / 2, h, s: String(c) }); x += widths[j]; });
  });
  hline(-height);
  let x = 0;
  for (let j = 0; j <= head.length; j++) { lines.push({ x1: x, y1: 0, x2: x, y2: -height }); x += widths[j] || 0; }
  return { lines, texts, width, height };
}
