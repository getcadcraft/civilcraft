/* SPDX-License-Identifier: Apache-2.0 */
/**
 * structure.mjs — a structural validator for the DWGs cc-dwg writes (0.9 FX, "Drawing file is not valid" in AutoCAD).
 *
 * The oracle readers (ODA File Converter, LibreDWG, libdxfrw) repair or ignore much that AutoCAD refuses, so this checks the
 * invariants a strict reader relies on, from the bytes alone (our reader is used only to cut the file into objects):
 *
 *   container   every checksum / CRC the reader checks (notes empty), R2004+ file header fields against the page map and
 *               the section map, every section's pages cover its size, section ids unique, auxiliary header layout
 *   objects     object map sorted + unique, each map entry points at an object with that handle, per-object CRC, objects
 *               packed with no gaps or overlap, HANDSEED above every handle
 *   handles     every handle an object or the header holds resolves (0 only where the field may be null), header handle
 *               variables point at objects of the right type, owner lists contain their children (tables, blocks, layouts)
 *   classes     numbers unique and >= 500, every class number used by an object is listed, instance counts match
 *   tables      names unique per table, no characters AutoCAD forbids, <= 255 long, the required entries exist
 *   values      no NaN / Infinity / absurd magnitude in any decoded number
 *
 *   validate(bytes, { label }) → { problems: string[], info: {...} }
 *   node tools/dwg-test/structure.mjs file.dwg…      prints the problems of each file
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(HERE, '../../lib/dwg');
const imp = (f) => import(pathToFileURL(path.join(LIB, f)).href);
const { readDwg } = await imp('read.js');
const { readContainer } = await imp('container-read.js');
const { R2004_MAGIC } = await imp('crc.js');
const { decompressR2004 } = await imp('lz-r2004.js');

const BAD_NAME = /[<>/\\":;?*|,=`\x00-\x1f]/;
const hex = (n) => Number(n).toString(16).toUpperCase();
const VERNUM = { AC1015: 15, AC1018: 18, AC1021: 21, AC1024: 24, AC1027: 27, AC1032: 32 };

/** Reference fields that may legitimately be null (0) in AutoCAD's own files. */
const NULLABLE = new Set(['owner', 'xrefBlock', 'plotstyle', 'material', 'unknown', 'background', 'visualStyle', 'sun', 'namedUcs', 'baseUcs', 'plotView',
  'shadePlot', 'clipBoundary', 'mtextApp', 'DIMLDRBLK', 'DIMBLK', 'DIMBLK1', 'DIMBLK2', 'DIMLTYPE', 'DIMLTEX1', 'DIMLTEX2', 'defaultEntry', 'layout', 'ltype']);

export function validate(bytes, { label = '', strictClasses = true } = {}) {
  const P = [];
  const bad = (m) => P.push(m);
  const info = {};
  const m = readDwg(bytes, { raw: true });
  const ver = VERNUM[m.version];
  info.version = m.version;
  if (!ver) { bad('not a DWG version this validator knows: ' + m.version); return { problems: P, info }; }
  for (const n of m.report.notes) bad('reader note: ' + n);
  const c = readContainer(bytes);
  for (const n of c.notes) bad('container note: ' + n);
  const recs = m._records;
  if (!recs || !recs.size) { bad('no objects'); return { problems: P, info }; }
  info.objects = recs.size;

  // ---------------------------------------------------------------- R2004+ system structures
  if (ver >= 18 && ver !== 21) containerR2004(bytes, c, bad);
  if (ver === 21) { /* R2007: pages are Reed-Solomon coded; r2007-write.js is covered by the reader's own checks above */ }
  // auxiliary header: the first RS pair is the DWG version (spec 27); R2018 carries an RS 0 after each version pair
  {
    const a = c.sections['AcDb:AuxHeader'];
    if (a && ver >= 18) {
      const d = new DataView(a.buffer, a.byteOffset, a.byteLength);
      if (a[0] !== 0xFF || a[2] !== 0x01) bad('AuxHeader signature');
      // R2018 (spec 27 + AutoCAD 2018 / ODA files): every RS version / RS maintenance pair is followed by an RS 0
      const stride = ver >= 32 ? 6 : 4;
      if (d.getInt32(3 + stride, true) < 0) bad('AuxHeader number of saves negative');
      if (d.getInt32(3 + stride + 4, true) !== -1) bad('AuxHeader: the RL after the number of saves is not -1 (fields are shifted)');
      if (a.length !== (ver >= 32 ? 129 : 123)) bad('AuxHeader length ' + a.length);
    }
    const f = c.sections['AcDb:ObjFreeSpace'];
    if (f && ver >= 24 && f.length !== 89) bad('ObjFreeSpace is ' + f.length + ' bytes; R2010+ uses 64-bit counters (89 bytes in AutoCAD files)');
    if (f && ver >= 18 && ver < 24 && f.length !== 53) bad('ObjFreeSpace is ' + f.length + ' bytes, expected 53');
  }

  // ---------------------------------------------------------------- object map
  const map = [];
  {
    const h = c.sections['AcDb:Handles'];
    const rd = { i: 0 };
    const MC = (signed) => { let v = 0, s = 0; for (;;) { const x = h[rd.i++]; if (!(x & 0x80)) { v += (x & (signed ? 0x3f : 0x7f)) * 2 ** s; return signed && (x & 0x40) ? -v : v; } v += (x & 0x7f) * 2 ** s; s += 7; } };
    while (rd.i + 2 <= h.length) {
      const size = (h[rd.i] << 8) | h[rd.i + 1];
      if (size <= 2) break;
      const end = rd.i + size; rd.i += 2; let H = 0, L = 0;
      if (size > 2034) bad('object map page of ' + size + ' bytes (AutoCAD writes at most 2033)');
      while (rd.i < end) { H += MC(false); L += MC(true); map.push([H, L]); }
      rd.i = end + 2;
    }
  }
  if (map.length !== recs.size) bad(`object map has ${map.length} entries, ${recs.size} objects were read`);
  for (let i = 1; i < map.length; i++) if (map[i][0] <= map[i - 1][0]) { bad('object map not strictly ascending by handle at ' + hex(map[i][0])); break; }
  const byOff = map.slice().sort((a, b) => a[1] - b[1]);
  for (let i = 0; i < byOff.length; i++) {
    const [hd, off] = byOff[i], r = recs.get(hd);
    if (!r) { bad('map handle ' + hex(hd) + ' has no object'); continue; }
    if (r._crcBad) bad('object ' + hex(hd) + ' ' + r.type + ': CRC wrong');
    if (r._error) bad('object ' + hex(hd) + ' ' + r.type + ': ' + r._error);
    if (i + 1 < byOff.length) {
      const end = r._objEnd / 8 + 2;   // data end (bits → bytes, objects start byte aligned) + CRC
      const endAligned = Math.ceil(end);
      if (byOff[i + 1][1] !== (ver >= 18 ? endAligned : endAligned)) { bad(`object ${hex(hd)} ${r.type} ends at ${endAligned} but the next object starts at ${byOff[i + 1][1]} (gap or overlap)`); break; }
    }
  }
  let maxH = 0; for (const h of recs.keys()) if (h > maxH) maxH = h;
  const seed = parseInt(m.header.HANDSEED || '0', 16);
  if (!(seed > maxH)) bad('HANDSEED ' + hex(seed) + ' is not above the highest handle ' + hex(maxH));
  info.handseed = hex(seed);

  // ---------------------------------------------------------------- handle references
  const has = (h) => recs.has(h);
  const typeOf = (h) => recs.get(h)?.type;
  for (const [hd, r] of recs) {
    const hh = r._h; if (!hh) continue;
    for (const [k, v] of Object.entries(hh)) {
      const list = Array.isArray(v) ? v : [v];
      for (const x of list) {
        if (typeof x !== 'number') continue;
        if (x === 0) { if (['items', 'entities', 'reactors'].includes(k)) bad(`${r.type} ${hex(hd)}.${k} holds a null handle`); continue; }
        if (!has(x)) bad(`${r.type} ${hex(hd)}.${k} -> ${hex(x)} does not exist`);
      }
    }
    for (const e of r._eed || []) if (e.app && !has(e.app)) bad(`${r.type} ${hex(hd)}: xdata application handle ${hex(e.app)} does not exist`);
    for (const e of r._eed || []) if (e.app && has(e.app) && typeOf(e.app) !== 'APPID') bad(`${r.type} ${hex(hd)}: xdata application handle ${hex(e.app)} is a ${typeOf(e.app)}, not an APPID`);
  }
  // header handle variables
  const HH = {
    CLAYER: 'LAYER', TEXTSTYLE: 'STYLE', CELTYPE: 'LTYPE', DIMSTYLE: 'DIMSTYLE', CMLSTYLE: 'MLINESTYLE', DIMTXSTY: 'STYLE',
    BLOCK_CONTROL_OBJECT: 'BLOCK_CONTROL', LAYER_CONTROL_OBJECT: 'LAYER_CONTROL', STYLE_CONTROL_OBJECT: 'STYLE_CONTROL', LINETYPE_CONTROL_OBJECT: 'LTYPE_CONTROL',
    VIEW_CONTROL_OBJECT: 'VIEW_CONTROL', UCS_CONTROL_OBJECT: 'UCS_CONTROL', VPORT_CONTROL_OBJECT: 'VPORT_CONTROL', APPID_CONTROL_OBJECT: 'APPID_CONTROL',
    DIMSTYLE_CONTROL_OBJECT: 'DIMSTYLE_CONTROL', DICTIONARY_ACAD_GROUP: 'DICTIONARY', DICTIONARY_ACAD_MLINESTYLE: 'DICTIONARY', DICTIONARY_NAMED_OBJECTS: 'DICTIONARY',
    DICTIONARY_LAYOUTS: 'DICTIONARY', DICTIONARY_PLOTSTYLES: 'ACDBDICTIONARYWDFLT', BLOCK_RECORD_PAPER_SPACE: 'BLOCK_HEADER', BLOCK_RECORD_MODEL_SPACE: 'BLOCK_HEADER',
    LTYPE_BYLAYER: 'LTYPE', LTYPE_BYBLOCK: 'LTYPE', LTYPE_CONTINUOUS: 'LTYPE',
  };
  for (const [k, t] of Object.entries(HH)) {
    const v = m.header[k];
    if (v === undefined) { bad('header variable ' + k + ' missing'); continue; }
    const n = parseInt(v || '0', 16);
    if (!n) { bad('header handle ' + k + ' is null'); continue; }
    if (!has(n)) { bad('header handle ' + k + ' -> ' + v + ' does not exist'); continue; }
    if (typeOf(n) !== t) bad(`header handle ${k} -> ${v} is a ${typeOf(n)}, expected ${t}`);
  }
  {
    // the page setups dictionary: every AutoCAD file has it, the header names it, and the named object dictionary lists the same one
    const ps = parseInt(m.header.DICTIONARY_PLOTSETTINGS || '0', 16), nod = recs.get(parseInt(m.header.DICTIONARY_NAMED_OBJECTS || '0', 16));
    if (!ps) bad('header DICTIONARY_PLOTSETTINGS is null (ACAD_PLOTSETTINGS missing)');
    else if (nod) {
      const i = (nod.names || []).indexOf('ACAD_PLOTSETTINGS');
      if (i < 0 || nod._h.items[i] !== ps) bad('ACAD_PLOTSETTINGS in the named object dictionary is not the header\'s DICTIONARY_PLOTSETTINGS');
    }
    for (const k of ['DICTIONARY_MATERIALS', 'DICTIONARY_COLORS', 'DICTIONARY_VISUALSTYLE', 'CMATERIAL']) if (ver >= 21 && !parseInt(m.header[k] || '0', 16)) info['null_' + k] = true;   // AutoCAD files have these; not written yet (see the report)
  }

  // ---------------------------------------------------------------- ownership
  const ownerOK = (parent, child, list) => { const p = recs.get(parent); return p && (p._h[list] || []).includes(child); };
  for (const [hd, r] of recs) {
    const o = r._h?.owner;
    switch (r.type) {
      case 'LAYER': if (!ownerOK(o, hd, 'entries')) bad(`LAYER ${hex(hd)} is not in its control object's list`); break;
      case 'STYLE': if (!ownerOK(o, hd, 'entries')) bad(`STYLE ${hex(hd)} is not in the style control's list`); break;
      case 'APPID': if (!ownerOK(o, hd, 'entries')) bad(`APPID ${hex(hd)} not in list`); break;
      case 'DIMSTYLE': if (!ownerOK(o, hd, 'entries')) bad(`DIMSTYLE ${hex(hd)} not in list`); break;
      case 'VPORT': if (!ownerOK(o, hd, 'entries')) bad(`VPORT ${hex(hd)} not in list`); break;
      case 'VIEW': if (!ownerOK(o, hd, 'entries')) bad(`VIEW ${hex(hd)} not in list`); break;
      case 'UCS': if (!ownerOK(o, hd, 'entries')) bad(`UCS ${hex(hd)} not in list`); break;
      case 'LTYPE': if (!ownerOK(o, hd, 'entries') && !(recs.get(o)?._h.hard || []).includes(hd) && !(recs.get(o)?._h.hardEntries || []).includes(hd)) { const p = recs.get(o); if (!p || !(p._h.entries || []).concat(p._h.hardEntries || []).includes(hd)) bad(`LTYPE ${hex(hd)} not in list`); } break;
      case 'BLOCK_HEADER': {
        const nm = r.name || '';
        const listed = (recs.get(o)?._h.entries || []).includes(hd);
        if (!listed) bad(`BLOCK_HEADER ${hex(hd)} ${nm} is not in the block control's list`);
        for (const e of r._h.entities || []) {
          const er = recs.get(e);
          if (er && er._h.owner !== undefined && er._h.owner !== hd && er._entmode === 0) bad(`${er.type} ${hex(e)} is listed in ${nm} but owned by ${hex(er._h.owner)}`);
        }
        if (!has(r._h.block)) bad('BLOCK_HEADER ' + nm + ': BLOCK entity missing');
        if (!has(r._h.endblk)) bad('BLOCK_HEADER ' + nm + ': ENDBLK entity missing');
        if (/^\*(Model|Paper)_Space/i.test(nm) && !r._h.layout) bad('BLOCK_HEADER ' + nm + ' has no layout');
        break;
      }
      case 'LAYOUT': {
        const b = recs.get(r._h.block);
        if (!b || b.type !== 'BLOCK_HEADER') bad(`LAYOUT ${hex(hd)} ${r.name || ''}: block is not a BLOCK_HEADER`);
        else if (b._h.layout !== hd) bad(`LAYOUT ${hex(hd)} ${r.name || ''} -> block ${b.name} but that block points at layout ${hex(b._h.layout || 0)}`);
        if (!(recs.get(o)?._h.items || []).includes(hd)) bad(`LAYOUT ${hex(hd)} is not in the layout dictionary`);
        break;
      }
      default: break;
    }
  }

  // ---------------------------------------------------------------- classes
  {
    const seen = new Set(), dxf = new Set();
    for (const k of m.classes) {
      if (k.num < 500) bad('class number ' + k.num + ' below 500');
      if (seen.has(k.num)) bad('class number ' + k.num + ' twice'); seen.add(k.num);
      if (dxf.has(k.dxfName)) bad('class ' + k.dxfName + ' listed twice'); dxf.add(k.dxfName);
      const used = [...recs.values()].filter((r) => r.typeNum === k.num).length;
      if (strictClasses && ver >= 18 && used !== k.instanceCount) bad(`class ${k.dxfName}: instance count ${k.instanceCount}, ${used} objects`);
      if (strictClasses && !used) bad('class ' + k.dxfName + ' has no objects');
    }
    for (const r of recs.values()) if (r.typeNum >= 500 && !seen.has(r.typeNum)) { bad('object type ' + r.typeNum + ' has no class'); break; }
  }

  // ---------------------------------------------------------------- tables
  {
    const names = {};
    for (const r of recs.values()) {
      if (!['LAYER', 'STYLE', 'LTYPE', 'APPID', 'DIMSTYLE', 'VPORT', 'VIEW', 'UCS', 'BLOCK_HEADER'].includes(r.type)) continue;
      const nm = r.name ?? '';
      const set = names[r.type] || (names[r.type] = new Map());
      const up = nm.toUpperCase();
      if (r.type === 'VPORT') continue;
      { if (set.has(up)) bad(`${r.type} name "${nm}" is used twice`); set.set(up, r); }
      if (!nm) bad(`${r.type} ${r.handle.toString(16)} has an empty name`);
      if (nm.length > 255) bad(`${r.type} name longer than 255`);
      const body = nm.replace(/^\*/, '').replace(/\|/, '');
      if (BAD_NAME.test(r.type === 'BLOCK_HEADER' ? body : nm.replace('|', '')) && !/^\*(LayerNameForDynamicConstraint|ADSK_CONSTRAINTS|ADSK_SYSTEM_LIGHTS)$/i.test(nm)) bad(`${r.type} name "${nm}" has a forbidden character`);
      if (nm !== nm.trim()) bad(`${r.type} name "${nm}" has leading/trailing blanks`);
    }
    const need = [['LAYER', '0'], ['STYLE', 'STANDARD'], ['LTYPE', 'BYLAYER'], ['LTYPE', 'BYBLOCK'], ['LTYPE', 'CONTINUOUS'], ['APPID', 'ACAD'],       ['BLOCK_HEADER', '*MODEL_SPACE'], ['BLOCK_HEADER', '*PAPER_SPACE']];
    for (const [t, n] of need) if (!names[t]?.has(n)) bad(`required ${t} "${n}" is missing`);
    if (![...recs.values()].some((r) => r.type === 'VPORT' && r.name === '*Active')) bad('required VPORT *Active is missing');
    const lay = [...recs.values()].filter((r) => r.type === 'LAYOUT');
    if (!lay.some((l) => /^model$/i.test(l.name || ''))) bad('no Model layout');
    const tabs = lay.map((l) => l.tabOrder ?? l.tab);
    if (new Set(tabs).size !== tabs.length) bad('layout tab orders repeat: ' + tabs.join(','));
  }

  // ---------------------------------------------------------------- numbers
  {
    let n = 0;
    const walk = (v, path, rec) => {
      if (n > 5) return;
      if (typeof v === 'number') { if (!Number.isFinite(v)) { bad(`${rec.type} ${hex(rec.handle)}.${path} is ${v}`); n++; } else if (Math.abs(v) > 1e30 && !/EXT|extents|min|max/i.test(path)) { bad(`${rec.type} ${hex(rec.handle)}.${path} = ${v} (absurd magnitude)`); n++; } return; }
      if (!v || typeof v !== 'object' || v instanceof Uint8Array || ArrayBuffer.isView(v)) return;
      if (Array.isArray(v)) { v.forEach((x, i) => { if (i < 400) walk(x, path + '[' + i + ']', rec); }); return; }
      for (const [k, x] of Object.entries(v)) if (k[0] !== '_') walk(x, path ? path + '.' + k : k, rec);
    };
    for (const r of recs.values()) walk(r, '', r);
  }
  return { problems: P, info };
}

/** R2004+ file header fields against the page map and the section map (spec 4.1, 4.4, 4.5). */
function containerR2004(b, c, bad) {
  const d = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const mg = R2004_MAGIC(0x6C), h = new Uint8Array(0x6C);
  for (let i = 0; i < 0x6C; i++) h[i] = b[0x80 + i] ^ mg[i];
  const hd = new DataView(h.buffer);
  const lastId = hd.getUint32(0x28, true), lastEnd = Number(hd.getBigUint64(0x2C, true)), second = Number(hd.getBigUint64(0x34, true));
  const amount = hd.getUint32(0x40, true), pmId = hd.getUint32(0x50, true), pmAt = Number(hd.getBigUint64(0x54, true)) + 0x100, smId = hd.getUint32(0x5C, true);
  const arr = hd.getUint32(0x60, true);
  const sys = (at, type) => {
    if (d.getUint32(at, true) !== type) { bad('system page type at ' + at.toString(16)); return null; }
    const usz = d.getUint32(at + 4, true), csz = d.getUint32(at + 8, true);
    return { data: decompressR2004(b, at + 0x14, at + 0x14 + csz, usz), end: at + 0x14 + csz + 0x14 };
  };
  const pm = sys(pmAt, 0x41630E3B); if (!pm) return;
  const pd = new DataView(pm.data.buffer, pm.data.byteOffset, pm.data.byteLength);
  const pages = new Map(); let addr = 0x100, n = 0, prev = 0;
  for (let i = 0; i + 8 <= pm.data.length; i += 8) {
    const id = pd.getInt32(i, true), size = pd.getUint32(i + 4, true);
    if (id <= prev && id > 0) bad('page map ids not ascending at ' + id);
    if (size % 0x20) bad('page ' + id + ' size ' + size.toString(16) + ' is not a multiple of 0x20');
    if (id > 0) { pages.set(id, { addr, size }); prev = id; n++; }
    addr += size;
  }
  if (pmId !== prev) bad('file header page map id ' + pmId + ' is not the last page id ' + prev);
  if (lastId !== prev) bad('file header last page id ' + lastId + ' != ' + prev);
  if (amount !== n) bad('file header page count ' + amount + ' != page map entries ' + n);
  if (arr !== prev) bad('file header page array size ' + arr + ' != ' + prev);
  if (pages.get(pmId)?.addr !== pmAt) bad('page map address in the header does not match the page map');
  if (lastEnd !== pmAt + pages.get(pmId).size - 0x100) bad('last section page end address ' + lastEnd.toString(16) + ' != ' + (pmAt + pages.get(pmId).size - 0x100).toString(16));
  if (second !== pmAt + pages.get(pmId).size && second !== pm.end) bad('second header address ' + second.toString(16) + ' is neither the page end nor the page map end');
  if (b.length !== second + 0x6C && b.length !== second + 0x6C + 0) bad('file length ' + b.length + ' != second header + 0x6C (' + (second + 0x6C) + ')');
  // the second copy of the header must equal the first
  let same = true; for (let i = 0; i < 0x6C; i++) if (b[second + i] !== b[0x80 + i]) same = false;
  if (!same) bad('second file header differs from the first');
  // page addresses are contiguous from 0x100 to the end of the page map
  if (pmAt + pages.get(pmId).size < second) bad('pages end before the second header');
  const sm = sys(pages.get(smId)?.addr ?? 0, 0x4163003B); if (!sm) { bad('section map page ' + smId + ' not found'); return; }
  const sd = new DataView(sm.data.buffer, sm.data.byteOffset, sm.data.byteLength);
  const cnt = sd.getUint32(0, true); let p = 0x14; const ids = new Set(), used = new Set();
  if (sd.getUint32(4, true) !== 2 || sd.getUint32(8, true) !== 0x7400) bad('section map header fields');
  for (let s = 0; s < cnt; s++) {
    let nm = ''; for (let i = 0; i < 64 && sm.data[p + 0x20 + i]; i++) nm += String.fromCharCode(sm.data[p + 0x20 + i]);
    const size = Number(sd.getBigUint64(p, true)), pc = sd.getUint32(p + 8, true), mx = sd.getUint32(p + 12, true), id = sd.getUint32(p + 0x18, true);
    if (ids.has(id)) bad('section id ' + id + ' used twice'); ids.add(id);
    p += 0x60; let cover = 0;
    for (let k = 0; k < pc; k++) {
      const num = sd.getUint32(p, true), start = Number(sd.getBigUint64(p + 8, true));
      if (!pages.has(num)) bad('section ' + nm + ' uses page ' + num + ' which is not in the page map');
      if (used.has(num)) bad('page ' + num + ' belongs to two sections'); used.add(num);
      if (start !== k * mx) bad(`section ${nm}: page ${k} starts at ${start}, expected ${k * mx}`);
      cover += mx; p += 16;
    }
    if (nm && cover < size) bad(`section ${nm}: pages cover ${cover} bytes of ${size}`);
  }
  for (const id of pages.keys()) if (id !== smId && id !== pmId && !used.has(id)) bad('page ' + id + ' belongs to no section');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let n = 0;
  for (const f of process.argv.slice(2)) {
    const { problems, info } = validate(new Uint8Array(fs.readFileSync(f)));
    console.log(path.basename(f), info.version, problems.length ? problems.length + ' problem(s)' : 'ok');
    for (const p of problems.slice(0, 25)) console.log('   - ' + p);
    n += problems.length;
  }
  process.exit(n ? 1 : 0);
}
