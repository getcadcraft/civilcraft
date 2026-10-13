#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * convert.mjs — LibraryCraft's server-side converter (docs/LIBRARY-SPEC.md §2). Runs the same adapters the
 * apps run in the browser (public_html/assets/apps/bimcraft/dev/libitem.js, libitem-ifc.js).
 *
 *   node tools/library/convert.mjs <input-file> <out-dir> [--units in|mm|cm|m|ft|…] [--block <name>]… [--list]
 *
 * --list  prints {ok, kind, candidates:[{key, name, entities, attrs, has_body}], notes[]}
 * else    writes <out-dir>/<key>/item.json (no uuid/version/license/provenance: the server fills them) and
 *         <out-dir>/<key>/preview.svg, and prints {ok, items:[{key, path, preview}], notes[]} (absolute paths).
 * Exit 0 = ok; anything else = failure with {ok:false, error} on stdout. Reads only its input; writes only
 * inside <out-dir>. --block picks blocks (DWG/DXF) or candidate keys (any kind); default: every candidate.
 * Kind is sniffed from magic bytes first, then the extension: DWG "AC10", IFC "ISO-10303-21", glTF "glTF"/JSON,
 * RFA CFB D0CF11E0, binary STL (header count = size), DXF / OBJ / ASCII STL / CSV text, a format-1 library item (JSON with "format": "cadcraft-library-item";
 * kind "item": checked with validateItem({partial: true}) and passed through, minus uuid/version/license/provenance,
 * which the server fills). DWG: BimCraft's dwg/read.js (cc-dwg, our own reader); DXF: BimCraft's dxf-model.js.
 * --units: drawing/mesh units (overrides the file's for DWG/DXF; required knowledge for OBJ and STL, default mm).
 * --up y|z: the mesh's up axis (glTF/OBJ default y, STL default z).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const APP = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
const imp = (p) => import(pathToFileURL(p).href);

// Libraries write to the console; stdout must hold exactly one JSON object.
const realLog = console.log.bind(console);
console.log = console.info = console.warn = console.debug = () => {};
const say = (obj) => { realLog(JSON.stringify(obj)); };
const fail = (error, code = 1) => { say({ ok: false, error: String(error) }); process.exit(code); };

const args = process.argv.slice(2);
const pos = [], blocks = [];
let units = null, up = null, list = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--list') list = true;
  else if (a === '--units') units = args[++i] || '';
  else if (a === '--up') { up = args[++i] || ''; if (up !== 'y' && up !== 'z') fail('--up takes y or z.', 2); }
  else if (a === '--block') { const b = args[++i]; if (b) blocks.push(b); }
  else if (a.startsWith('--')) fail('Unknown option ' + a, 2);
  else pos.push(a);
}
if (pos.length !== 2) fail('Usage: convert.mjs <input-file> <out-dir> [--units in|mm|…] [--up y|z] [--block <name>]… [--list]', 2);
const input = path.resolve(pos[0]), outDir = path.resolve(pos[1]);

try {
  const L = await imp(path.join(APP, 'libitem.js'));
  if (units !== null && units !== '' && !L.UNIT_MM[units]) fail('Unknown units "' + units + '". Use one of ' + Object.keys(L.UNIT_MM).join(', ') + '.', 2);
  if (units === '') units = null;
  let st;
  try { st = fs.statSync(input); } catch { fail('Input file not found.', 2); }
  if (!st.isFile()) fail('Input is not a file.', 2);
  if (st.size > 50 * 1024 * 1024) fail('Input is larger than 50 MB.', 2);
  const bytes = new Uint8Array(fs.readFileSync(input));
  const kind = sniff(bytes, path.extname(input).toLowerCase());
  if (!kind) fail('Not a file the library can read (DWG, DXF, IFC, glTF/GLB, OBJ, STL, RFA, CSV or a library item .json).');
  const fileName = path.basename(input);

  let r;
  if (kind === 'dwg' || kind === 'dxf') r = await fromDrawing(L, bytes, kind, fileName);
  else if (kind === 'ifc') r = await fromIfc(bytes);
  else if (kind === 'gltf' || kind === 'obj' || kind === 'stl') {
    const m = L.itemFromMesh(bytes, kind === 'gltf' ? (bytes[0] === 0x67 ? 'glb' : 'gltf') : kind, { units, upAxis: up, name: fileName.replace(/\.[^.]+$/, '') });
    m.items.forEach((it) => { it._key = 'mesh'; });
    r = { ...m, candidates: m.items.map((it) => cand(it)) };
  } else if (kind === 'rfa') {
    const { readRevit } = await imp(path.join(APP, 'rvt-reader.js'));
    const info = await readRevit(bytes, fileName);
    const m = L.itemFromRfa(info);
    m.items.forEach((it) => { it._key = 'family'; });
    r = { ...m, candidates: m.items.map((it) => cand(it)) };
  } else if (kind === 'item') {
    r = fromItemJson(L, bytes, fileName);
  } else if (kind === 'csv') {
    const m = L.itemsFromCsv(new TextDecoder().decode(bytes));
    const seen = new Set();
    m.items.forEach((it, i) => {
      let k = (it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'row').slice(0, 60), n = 2;
      while (seen.has(k)) k = k.replace(/-\d+$/, '') + '-' + n++;
      seen.add(k); it._key = k;
    });
    r = { ...m, candidates: m.items.map((it) => cand(it)) };
  }

  if (list) { say({ ok: true, kind, candidates: r.candidates.map(slim), notes: r.notes }); process.exit(0); }

  let items = r.items;
  if (blocks.length && kind !== 'dwg' && kind !== 'dxf') {
    const want = new Set(blocks.map((b) => b.toLowerCase()));
    items = items.filter((it) => want.has(it._key) || want.has(it.name.toLowerCase()));
  }
  if (!items.length) fail(r.notes.length ? 'No items: ' + r.notes.slice(0, 3).join(' ') : 'No items in this file.');
  fs.mkdirSync(outDir, { recursive: true });
  const real = fs.realpathSync(outDir);
  const out = [];
  for (const it of items) {
    const key = String(it._key).replace(/[^a-z0-9_-]/gi, '-').slice(0, 80) || 'item';
    const item = L.cleanItem(it);
    const v = L.validateItem(item, { partial: true });
    if (!v.ok) { r.notes.push(it.name + ': left out, ' + v.errors.slice(0, 3).join('; ')); continue; }
    const dir = path.join(real, key);
    if (path.dirname(dir) !== real) continue;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'item.json'), JSON.stringify(item));
    fs.writeFileSync(path.join(dir, 'preview.svg'), L.previewSvg(item));
    out.push({ key, path: path.join(dir, 'item.json'), preview: path.join(dir, 'preview.svg'), name: item.name });
  }
  if (!out.length) fail('No valid items: ' + r.notes.slice(-3).join(' '));
  say({ ok: true, kind, items: out, notes: r.notes });
  process.exit(0);
} catch (e) {
  fail(e && e.message ? e.message : e);
}

function cand(it) {
  return { key: it._key, name: it.name, entities: it.plan.entities.length, attrs: it.source_attrs || {}, has_body: !!it.body };
}
function slim(c) {
  return { key: c.key, name: c.name, entities: c.entities, attrs: c.attrs || {}, has_body: !!c.has_body };
}

function sniff(b, ext) {
  const head = new TextDecoder('latin1').decode(b.subarray(0, 64));
  if (head.startsWith('AC10')) return 'dwg';
  if (head.startsWith('ISO-10303-21')) return 'ifc';
  if (head.startsWith('glTF')) return 'gltf';
  if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'rfa';
  if (b.length >= 84 && 84 + new DataView(b.buffer, b.byteOffset).getUint32(80, true) * 50 === b.length) return 'stl';
  const text = new TextDecoder('utf-8').decode(b.subarray(0, 4096)).replace(/^﻿/, '');
  if (/^\s*\{/.test(text) && /"format"\s*:\s*"cadcraft-library-item"/.test(text)) return 'item';
  if (/^\s*solid\b/.test(text) && /\bfacet\b|\bendsolid\b/.test(text)) return 'stl';
  if (/^\s*\{/.test(text) && /"asset"/.test(text)) return 'gltf';
  if (/^\s*0\s*\r?\n\s*(SECTION|\$)/.test(text) || (ext === '.dxf' && /SECTION/.test(text))) return 'dxf';
  if (/\b0\s*\r?\nSECTION/.test(text)) return 'dxf';
  if (/^(#.*\n|\s*\n)*\s*(v|o|g|mtllib|vn|vt)\s/m.test(text) && /^v\s+-?[\d.]/m.test(text) && (ext === '.obj' || !text.includes(','))) return 'obj';
  if (ext === '.csv' || (/^[^\n]*,/.test(text) && /^[\w\s"()-]*name/i.test(text))) return 'csv';
  return null;
}

/**
 * A finished format-1 item (makers' own tools, tools/library/seed-symbols.mjs). Published fields the server owns
 * (uuid, version, license, provenance) are dropped with a note; the rest must pass validateItem({partial: true}).
 * One candidate, keyed by the item's name.
 */
function fromItemJson(L, bytes, fileName) {
  if (bytes.length > L.LIMITS.bytes) throw new Error(fileName + ' is larger than 8 MB.');
  let obj;
  try { obj = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '')); }
  catch { throw new Error(fileName + ' is not valid JSON.'); }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error(fileName + ' is not a library item.');
  const notes = [];
  const owned = ['uuid', 'version', 'license', 'provenance'].filter((k) => k in obj);
  if (owned.length) notes.push('Left out ' + owned.join(', ') + ': the library sets these when the item is published.');
  const it = {};
  for (const [k, v] of Object.entries(obj)) if (!owned.includes(k)) it[k] = v;
  // JSON written by PHP turns an empty object into []: read it as {} where the format wants an object.
  const obj0 = (o, k) => { if (o && Array.isArray(o[k]) && !o[k].length) o[k] = {}; };
  obj0(it, 'params'); obj0(it, 'source_attrs'); obj0(it, 'ifc'); obj0(it.params, 'elec'); obj0(it.params, 'plumb');
  const v = L.validateItem(it, { partial: true });
  if (!v.ok) throw new Error('The item does not pass the format checks: ' + v.errors.slice(0, 5).join('; '));
  it._key = (String(it.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item').slice(0, 60);
  return { items: [it], notes, candidates: [cand(it)] };
}

async function fromDrawing(L, bytes, kind, fileName) {
  let db = null;
  try {
    if (kind === 'dxf') {   // dxf-model.js: every DXF version, R12 included
      const { readDxfModel } = await imp(path.join(APP, 'dxf-model.js'));
      let text = new TextDecoder('utf-8').decode(bytes);
      if (text.includes('\ufffd')) text = new TextDecoder('windows-1252').decode(bytes);
      db = readDxfModel(text);
    } else {
      const { readDwg } = await imp(path.join(APP, 'dwg/read.js'));
      db = readDwg(bytes);
    }
  } catch { db = null; }
  if (!db) throw new Error(fileName + ' could not be read. It may be damaged, or saved in a format the reader does not handle.');
  return L.itemsFromDwg(db, { units, blocks: list ? null : blocks, fileName, list });
}

async function fromIfc(bytes) {
  // cc-ifc, BimCraft's own IFC engine (0.4 I.11; was web-ifc). No manifold-3d here: library items need no openings cut.
  const W = await imp(path.join(APP, 'ifc/api.js'));
  const api = new W.IfcAPI();
  await api.Init({ manifold: false });
  const mid = api.OpenModel(bytes, { COORDINATE_TO_ORIGIN: false });
  if (mid < 0) throw new Error('This IFC file could not be read.');
  try {
    const { itemsFromIfc } = await imp(path.join(APP, 'libitem-ifc.js'));
    const r = itemsFromIfc(api, mid, { list, keys: !list && blocks.length ? blocks.map((b) => b.toLowerCase()) : null });
    if (!list && blocks.length) {
      // --block accepts names as well as keys
      const want = new Set(blocks.map((b) => b.toLowerCase()));
      const keys = r.candidates.filter((c) => want.has(c.key) || want.has(String(c.name).toLowerCase())).map((c) => c.key);
      if (keys.length && !r.items.length) return itemsFromIfc(api, mid, { keys });
    }
    return r;
  } finally { api.CloseModel(mid); }
}
