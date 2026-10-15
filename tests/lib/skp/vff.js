/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vff.js — SketchUp 2021+ files ("VFF": the SketchUp header, then a ZIP archive) for cc-skp (docs/SKP-LIB-SPEC.md).
 * Format knowledge from OpenSKP (MIT, © 2024-2026 Ahsan Mehmood, see NOTICE: docs/BINARY_FORMAT.md, vff.ts,
 * geometry.ts, model.ts, index.ts), checked against the corpus; the code is ours. DOM-free, no dependencies.
 *
 *   await readVff(bytes, header, opts) → the cc-skp model (see read.js / the spec)
 *
 * What is in the archive:
 *   model.dat                    the model as nested records (below)
 *   materials/<folder>/material.xml (+ the texture image beside it)   one per material, and one "Layer_<name>" per tag
 *   meta/meta.dat                small records; 0x6400 > 0x6D00 = the display unit ("Millimeter")
 *   meta/model_thumbnail.png     the preview (meta/preview_thumbnail.png = the same with axes)
 *
 * model.dat records: tag (2 bytes, written here big-endian so 0xC409 reads like the bytes "C4 09"), length (u32 LE),
 * payload. Some tags hold more records ("containers"); we only descend through the ones listed in CONTAINERS, along
 * known paths, so a crafted file cannot make us recurse:
 *   F401 (whole file) > F701 > D430 > D530 > C832*      materials: DC05 > DE05 id, CC32 name
 *                     > F801 > 983A > 993A > 8C3C*      tags: DC05 id, 8D3C name, 8E3C hidden (1), 8F3C > C832 > CC32 "Layer_<name>"
 *                     > F901 > 7017 > 7117 > 7C15*      definitions: 8813 entities, 7D15 guid, 7E15 name, 8315 kind (0 component, 1 group, 2 image)
 *                     > F601 > 8813                     the model's own entities
 *                     > 0702 > 6D60 > 6D61 > 7148*      scenes (counted only)
 * An entity list (8813):
 *   D007 > DC05 > DE05 = the definition's id (what instances point at)
 *   8913 > C409*  vertex: D007-less; DC05 > DE05 id, C509 = 3 × f64
 *   8A13 > B80B*  edge: D007 {DC05 > DE05 id, D107 material, D207 tag, D307 flags}, B90B / BA0B vertex ids, BB0B curve
 *   8B13 > AC0D*  face: D007 {id, D107 front material, D207 tag, D307 flags, DC05 > DD05 … texture placement},
 *                 AD0D normal (3 × f64 + plane distance), AE0D > 9411* loops > 9511 > A00F* coedges {A10F edge id, A20F 0 = along the edge, 1 = against},
 *                 AF0D back material
 *   8C13 > 6419*            component instances
 *   8D13 > 4C1D > 6419      groups
 *   9013 > 401F > 6419      images
 *   instance 6419: D007 {DC05 > DE05 id, D107 material, D207 tag, D307 flags}, 6519 name, 6619 placement (13 × f64),
 *                  6719 definition id, 6819 guid
 *   9713/9613 curves (arcs: their segments are ordinary edges) · 9113 guide lines · 9213 guide points · 9913 dimensions and text
 *   8E13 / 9B13 / 9E13 / 9F13 / A013 bookkeeping (A013 = bounding box, 6 × f64)
 * Ids are little-endian unsigned integers of the record's length (1–6 bytes).
 * D307 display flags: base 0x06; +0x01 hidden, +0x08 soft, +0x10 smooth.
 *
 * Placement (6619): r00 r01 r02  r10 r11 r12  r20 r21 r22  tx ty tz  w — the first nine are the rotation/scale ROWS
 * (p' = R·p + t; checked on the corpus: with rows read as axes, rotated walls stop meeting their neighbours), w is the
 * homogeneous divisor (SketchUp writes 0.5 for "scale × 2"). We return column-major 4×4 (m[12..14] = translation).
 */
import { SkpError, LIMITS, okNum } from './util.js';
import { msg } from './messages.js';
import { openZip } from './zip.js';

const damaged = (key) => new SkpError('damaged', msg('ccskp.damaged', { reason: msg(key) }));

// Record tags (bytes as written in the file).
const T = {
  FILE: 0xf401, MATS: 0xf701, MATS2: 0xd430, MATS3: 0xd530, MAT: 0xc832, MAT_NAME: 0xcc32,
  LAYERS: 0xf801, LAYERS2: 0x983a, LAYERS3: 0x993a, LAYER: 0x8c3c, LAYER_NAME: 0x8d3c, LAYER_HIDDEN: 0x8e3c, LAYER_MAT: 0x8f3c,
  DEFS: 0xf901, DEFS2: 0x7017, DEFS3: 0x7117, DEF: 0x7c15, DEF_GUID: 0x7d15, DEF_NAME: 0x7e15, DEF_KIND: 0x8315,
  ROOT: 0xf601, ENTS: 0x8813, SCENES: 0x0702, SCENES2: 0x6d60, SCENES3: 0x6d61, SCENE: 0x7148,
  INFO: 0xd007, IDBOX: 0xdc05, ID: 0xde05, ATTRS: 0xdd05, MAT_REF: 0xd107, LAYER_REF: 0xd207, FLAGS: 0xd307,
  VERTS: 0x8913, VERT: 0xc409, XYZ: 0xc509,
  EDGES: 0x8a13, EDGE: 0xb80b, EDGE_A: 0xb90b, EDGE_B: 0xba0b,
  FACES: 0x8b13, FACE: 0xac0d, NORMAL: 0xad0d, LOOPS: 0xae0d, LOOP: 0x9411, COEDGES: 0x9511, COEDGE: 0xa00f,
  CO_EDGE: 0xa10f, CO_DIR: 0xa20f, BACK_MAT: 0xaf0d,
  COMPS: 0x8c13, GROUPS: 0x8d13, GROUP: 0x4c1d, IMAGES: 0x9013, IMAGE: 0x401f, INST: 0x6419,
  INST_NAME: 0x6519, INST_M: 0x6619, INST_DEF: 0x6719,
  CURVES: 0x9713, CURVES2: 0x9613, GUIDE_LINES: 0x9113, GUIDE_LINE: 0x6942, GUIDE_POINTS: 0x9213, GUIDE_POINT: 0x6c42,
  ANNOTATIONS: 0x9913,
};
// Entity-list children that are bookkeeping, not drawing elements.
const QUIET = new Set([T.INFO, 0x8e13, 0x9b13, 0x9e13, 0x9f13, 0xa013, T.CURVES, T.CURVES2]);
const FLAG_HIDDEN = 0x01, FLAG_SOFT = 0x08, FLAG_SMOOTH = 0x10;
const NEWEST_KNOWN = 26;

const tagHex = (t) => t.toString(16).toUpperCase().padStart(4, '0');

/** Model.dat walker: bounds-checked record access over one Uint8Array. */
class Tlv {
  constructor(b) {
    this.b = b;
    this.dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }
  /** Call fn(tag, start, end) for each record in [s, e). Strict: a record running past e = damaged. */
  each(s, e, fn) {
    const b = this.b;
    let p = s;
    while (p < e) {
      if (p + 6 > e) throw damaged('ccskp.damaged.record_header');
      const n = this.dv.getUint32(p + 2, true);
      if (p + 6 + n > e) throw damaged('ccskp.damaged.record_past');
      if (fn((b[p] << 8) | b[p + 1], p + 6, p + 6 + n) === false) return;
      p += 6 + n;
    }
  }
  /** Lenient walk for optional data (texture placement): stops quietly at the first record that does not fit. */
  eachLoose(s, e, fn) {
    const b = this.b;
    let p = s;
    while (p + 6 <= e) {
      const n = this.dv.getUint32(p + 2, true);
      if (p + 6 + n > e) return;
      if (fn((b[p] << 8) | b[p + 1], p + 6, p + 6 + n) === false) return;
      p += 6 + n;
    }
  }
  /** First child with this tag → [start, end] or null. */
  find(s, e, tag, loose = false) {
    let hit = null;
    (loose ? this.eachLoose : this.each).call(this, s, e, (t, a, z) => { if (t === tag) { hit = [a, z]; return false; } });
    return hit;
  }
  /** Little-endian unsigned id of 1–6 bytes. */
  uint(s, e) {
    const n = e - s;
    if (n < 1 || n > 6) throw damaged('ccskp.damaged.id_size');
    let v = 0;
    for (let i = n - 1; i >= 0; i--) v = v * 256 + this.b[s + i];
    return v;
  }
  f64(p) { return this.dv.getFloat64(p, true); }
  text(s, e) { return utf8(this.b.subarray(s, e)); }
  /** An entity's own id: DC05 > DE05 inside [s, e) (an INFO record or the entity itself). */
  idOf(s, e) {
    const box = this.find(s, e, T.IDBOX);
    if (!box) return null;
    const id = this.find(box[0], box[1], T.ID, true);
    return id ? this.uint(id[0], id[1]) : null;
  }
}

function utf8(bytes) {
  let s;
  try { s = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { s = ''; for (const c of bytes) s += String.fromCharCode(c); }
  return s.replace(/\0/g, '').trim();
}

function guidText(b) {
  if (b.length !== 16) return null;
  let h = '';
  for (const c of b) h += c.toString(16).padStart(2, '0');
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
}

/** Counter of skipped things → one plain-English note per kind. */
class Notes {
  constructor() { this.c = new Map(); }
  /** Count one more of `key` (a ccskp.note.* message; its fill n is the count), with any other fills. */
  add(key, n = 1, fills = null) {
    if (!(n > 0)) return;
    const id = fills ? key + '\0' + JSON.stringify(fills) : key;
    const e = this.c.get(id) || { key, fills, n: 0 };
    e.n += n;
    this.c.set(id, e);
  }
  list() { return [...this.c.values()].map((e) => msg(e.key, { ...e.fills, n: e.n })); }
}

// ---------------------------------------------------------------- material.xml

const XML_ENT = { lt: '<', gt: '>', amp: '&', apos: "'", quot: '"' };
const unxml = (s) => s.replace(/&(lt|gt|amp|apos|quot|#\d+|#x[0-9a-fA-F]+);/g, (w, k) => {
  if (k[0] !== '#') return XML_ENT[k];
  const cp = k[1] === 'x' || k[1] === 'X' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : w;
});

/** Attributes of the first <prefix:name …> element, or null. Attribute values are entity-decoded. */
function xmlElement(text, name) {
  const m = new RegExp('<(?:[A-Za-z0-9_]+:)?' + name + '\\b([^>]*)>').exec(text);
  if (!m) return null;
  const attrs = {};
  const re = /([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let a;
  while ((a = re.exec(m[1]))) attrs[a[1]] = unxml(a[2] ?? a[3]);
  return attrs;
}

function readMaterialXml(text) {
  const mat = xmlElement(text, 'material');
  if (!mat) return null;
  const int = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : null; };
  const r = int(mat.colorRed), g = int(mat.colorGreen), b = int(mat.colorBlue);
  let alpha = 1;
  if (mat.useTrans === '1') {
    const t = parseFloat(mat.trans);
    if (Number.isFinite(t)) alpha = Math.max(0, Math.min(1, 1 - t));
  }
  const tex = xmlElement(text, 'texture');
  const img = xmlElement(text, 'image');
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) && n > 0 && n < 1e9 ? n : null; };
  return {
    name: mat.name ?? null,
    color: r === null || g === null || b === null ? null : [r, g, b],
    alpha,
    texture: tex ? {
      file: tex.textureFilename || '',
      width: num(tex.xScale), height: num(tex.yScale),
      path: img ? (img.path || img.file_name || '') : '',
    } : null,
  };
}

function sniffMime(b, name = '') {
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
  if (b.length >= 4 && ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a) || (b[0] === 0x4d && b[1] === 0x4d && b[3] === 0x2a))) return 'image/tiff';
  if (b.length >= 12 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return /\.(png)$/i.test(name) ? 'image/png' : /\.(jpe?g)$/i.test(name) ? 'image/jpeg' : 'application/octet-stream';
}

/** Normalise a path inside the archive ("materials/x/./a.jpg", "../y/b.jpg"); null when it climbs out. */
function joinPath(folder, rel) {
  const parts = (folder ? folder.split('/') : []).concat(rel.replace(/\\/g, '/').split('/'));
  const out = [];
  for (const p of parts) {
    if (p === '' || p === '.') continue;
    if (p === '..') { if (!out.length) return null; out.pop(); } else out.push(p);
  }
  return out.join('/');
}

// ---------------------------------------------------------------- units (meta/meta.dat)

const UNIT_WORDS = [[/^inch/i, 'in'], [/^(feet|foot)/i, 'ft'], [/^milli/i, 'mm'], [/^centi/i, 'cm'], [/^met(er|re)/i, 'm']];

function readUnits(meta) {
  if (!meta) return null;
  const dv = new DataView(meta.buffer, meta.byteOffset, meta.byteLength);
  const walk = (s, e, depth) => {
    let p = s;
    while (p + 6 <= e) {
      const tag = (meta[p] << 8) | meta[p + 1];
      const n = dv.getUint32(p + 2, true);
      if (p + 6 + n > e) return null;
      if (tag === 0x6400 && depth === 0) return walk(p + 6, p + 6 + n, 1);
      if (tag === 0x6d00 && depth === 1) return utf8(meta.subarray(p + 6, p + 6 + n));
      p += 6 + n;
    }
    return null;
  };
  return walk(0, meta.length, 0);
}

// ---------------------------------------------------------------- geometry helpers

/** Newell normal (not normalised) of a loop of [x,y,z]. */
function newell(loop) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0, n = loop.length; i < n; i++) {
    const a = loop[i], b = loop[(i + 1) % n];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return [nx, ny, nz];
}

/** Texture coordinates of p on a face with normal n (SketchUp's default projection, or the face's placement matrix). */
function faceUv(p, n, place, tw, th) {
  // The face's plane axes: x = normalize(Z × n), y = n × x (vertical normals: x = X, y = ±Y).
  let xr, yr;
  const cl = Math.hypot(n[0], n[1]);
  if (cl < 1e-9) { xr = [1, 0, 0]; yr = [0, n[2] >= 0 ? 1 : -1, 0]; } else {
    xr = [-n[1] / cl, n[0] / cl, 0];
    yr = [n[1] * xr[2] - n[2] * xr[1], n[2] * xr[0] - n[0] * xr[2], n[0] * xr[1] - n[1] * xr[0]];
  }
  const px = p[0] * xr[0] + p[1] * xr[1] + p[2] * xr[2];
  const py = p[0] * yr[0] + p[1] * yr[1] + p[2] * yr[2];
  if (!place) return [px / tw, py / th];
  // place = 3×3 row-major, texture → face plane, row vectors: [u v 1]·M = [px py 1]; invert it.
  const [a, b, c, d, e, f, g, h, i] = place;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (!(Math.abs(det) > 1e-12)) return [px / tw, py / th];
  const k = 1 / det;
  const inv = [(e * i - f * h) * k, (c * h - b * i) * k, (b * f - c * e) * k,
    (f * g - d * i) * k, (a * i - c * g) * k, (c * d - a * f) * k,
    (d * h - e * g) * k, (b * g - a * h) * k, (a * e - b * d) * k];
  const u = px * inv[0] + py * inv[3] + inv[6];
  const v = px * inv[1] + py * inv[4] + inv[7];
  let q = px * inv[2] + py * inv[5] + inv[8];
  if (Math.abs(q) < 1e-12) q = 1;
  return [u / q / tw, v / q / th];
}

// ---------------------------------------------------------------- the reader

/**
 * Read a SketchUp 2021+ file. header = { version, major, bodyStart } from read.js.
 * opts: { onProgress({ stage, done, total }), signal }
 */
export async function readVff(bytes, header, opts = {}) {
  const { onProgress, signal } = opts;
  const progress = (stage, done, total) => { if (onProgress) try { onProgress({ stage, done, total }); } catch { /* the caller's problem */ } };
  const checkAbort = () => { if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError'); };

  // The ZIP starts at the first local header after the SketchUp header records.
  let zipAt = -1;
  for (let i = header.bodyStart, end = Math.min(bytes.length - 4, header.bodyStart + 4096); i <= end; i++) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 3 && bytes[i + 3] === 4) { zipAt = i; break; }
  }
  if (zipAt < 0) throw damaged('ccskp.damaged.no_archive');
  const zip = openZip(bytes, zipAt);
  const budget = { used: 0 };
  const modelName = zip.names.find((n) => n.toLowerCase() === 'model.dat');
  if (!modelName) throw damaged('ccskp.damaged.no_model_dat');
  progress('unzip', 0, 1);
  checkAbort();
  const md = await zip.read(modelName, budget);
  progress('unzip', 1, 1);
  checkAbort();

  const notes = new Notes();
  let model;
  try {
    model = readModelDat(md, notes, progress, checkAbort);
  } catch (e) {
    // A file newer than any we know that we cannot follow is "too new", not "damaged".
    if (e instanceof SkpError && e.code === 'damaged' && header.major > NEWEST_KNOWN) {
      throw new SkpError('too_new', msg('ccskp.too_new', { version: header.version, newest: '20' + NEWEST_KNOWN }));
    }
    throw e;
  }

  // Materials: the model's list (ids → names) joined to materials/*/material.xml by name, else by folder.
  const xmlByName = new Map(), xmlByFolder = new Map();
  for (const name of zip.names) {
    const m = /^materials\/([^/]+)\/material\.xml$/i.exec(name);
    if (!m) continue;
    let info = null;
    try { info = readMaterialXml(new TextDecoder('utf-8').decode(await zip.read(name, budget))); } catch (e) { if (e instanceof SkpError && e.code === 'too_big') throw e; }
    if (!info) { notes.add('ccskp.note.material_xml'); continue; }
    info.folder = 'materials/' + m[1];
    if (info.name) xmlByName.set(info.name, info);
    xmlByFolder.set(m[1], info);
  }
  const materials = [];
  for (const mat of model.materials) {
    const x = xmlByName.get(mat.name) || xmlByFolder.get(mat.name) || null;
    const out = { name: x?.name || mat.name, color: x ? x.color : null, alpha: x ? x.alpha : 1, texture: null };
    if (!x) notes.add('ccskp.note.material_no_xml');
    if (x?.texture) {
      const t = x.texture;
      const want = [];
      if (t.path) want.push(joinPath(x.folder, t.path));
      if (t.file) want.push(joinPath(x.folder, t.file.split(/[\\/]/).pop()));
      let entry = want.find((w) => w && zip.has(w));
      if (!entry) {
        entry = zip.names.find((n) => n.startsWith(x.folder + '/') && !/\.xml$/i.test(n) && !/\/thumbnail\.[a-z]+$/i.test(n));
      }
      if (!entry) notes.add('ccskp.note.texture_missing');
      else if (!t.width || !t.height) notes.add('ccskp.note.texture_no_size');
      else {
        const img = await zip.read(entry, budget);
        out.texture = { name: entry.split('/').pop(), mime: sniffMime(img, entry), bytes: img, width: t.width, height: t.height };
      }
    }
    materials.push(out);
  }

  // Tags: colour from their "Layer_<name>" material.xml.
  for (const l of model.layers) {
    const x = l.matName ? (xmlByName.get(l.matName) || null) : null;
    l.color = x ? x.color : null;
    delete l.matName;
  }

  // UVs for textured faces (front side), now the tile sizes are known.
  for (const d of model.defs) {
    for (const f of d.faces) {
      const tex = f.front !== null ? materials[f.front]?.texture : null;
      if (tex) f.uv = f.loops.map((loop) => loop.map((p) => faceUv(p, f._n, f._place, tex.width, tex.height)));
      delete f._n;
      delete f._place;
    }
  }

  // Thumbnail and units.
  let thumbnail = null;
  for (const n of ['meta/model_thumbnail.png', 'meta/preview_thumbnail.png']) {
    if (zip.has(n)) { const b = await zip.read(n, budget); thumbnail = { mime: sniffMime(b, n), bytes: b }; break; }
  }
  let units = { length: null };
  if (zip.has('meta/meta.dat')) {
    const word = readUnits(await zip.read('meta/meta.dat', budget));
    if (word) {
      const hit = UNIT_WORDS.find(([re]) => re.test(word));
      if (hit) units = { length: hit[1] }; else notes.add('ccskp.note.unit_unknown', 1, { unit: word });
    }
  }
  const styles = zip.names.filter((n) => /^styles\/[^/]+\/style\.xml$/i.test(n)).length;
  notes.add('ccskp.note.styles', styles);

  return {
    materials,
    layers: model.layers,
    defs: model.defs,
    root: model.root,
    thumbnail,
    units,
    notes: notes.list(),
  };
}

/** Parse model.dat → { materials (id order), layers, defs, root }. */
function readModelDat(md, notes, progress, checkAbort) {
  const tlv = new Tlv(md);
  let top = [0, md.length];
  // One F401 wraps the whole file.
  const only = [];
  tlv.each(0, md.length, (t, s, e) => { only.push([t, s, e]); });
  if (only.length === 1 && only[0][0] === T.FILE) top = [only[0][1], only[0][2]];

  const matIds = new Map();        // material id → index
  const materials = [];
  const layerIds = new Map();      // tag id → index
  const layers = [];
  const defRecords = [];           // [start, end] of each 7C15
  let rootRecord = null;
  let scenes = 0;

  tlv.each(top[0], top[1], (t, s, e) => {
    if (t === T.MATS) {
      const a = tlv.find(s, e, T.MATS2); const b = a && tlv.find(a[0], a[1], T.MATS3);
      if (b) tlv.each(b[0], b[1], (t2, s2, e2) => {
        if (t2 !== T.MAT) return;
        const id = tlv.idOf(s2, e2);
        const nm = tlv.find(s2, e2, T.MAT_NAME);
        if (id === null) { notes.add('ccskp.note.material_no_id'); return; }
        matIds.set(id, materials.length);
        materials.push({ name: nm ? tlv.text(nm[0], nm[1]) : '' });
      });
    } else if (t === T.LAYERS) {
      const a = tlv.find(s, e, T.LAYERS2); const b = a && tlv.find(a[0], a[1], T.LAYERS3);
      if (b) tlv.each(b[0], b[1], (t2, s2, e2) => {
        if (t2 !== T.LAYER) return;
        const id = tlv.idOf(s2, e2);
        const nm = tlv.find(s2, e2, T.LAYER_NAME);
        const hid = tlv.find(s2, e2, T.LAYER_HIDDEN);
        const lm = tlv.find(s2, e2, T.LAYER_MAT);
        let matName = null;
        if (lm) {
          const c = tlv.find(lm[0], lm[1], T.MAT, true);
          const cn = c && tlv.find(c[0], c[1], T.MAT_NAME, true);
          if (cn) matName = tlv.text(cn[0], cn[1]);
        }
        if (id === null) { notes.add('ccskp.note.tag_no_id'); return; }
        layerIds.set(id, layers.length);
        layers.push({ name: nm ? tlv.text(nm[0], nm[1]) : '', visible: !(hid && hid[1] > hid[0] && md[hid[0]] === 1), color: null, matName });
      });
    } else if (t === T.DEFS) {
      const a = tlv.find(s, e, T.DEFS2); const b = a && tlv.find(a[0], a[1], T.DEFS3);
      if (b) tlv.each(b[0], b[1], (t2, s2, e2) => { if (t2 === T.DEF) defRecords.push([s2, e2]); });
    } else if (t === T.ROOT) {
      rootRecord = tlv.find(s, e, T.ENTS);
    } else if (t === T.SCENES) {
      const a = tlv.find(s, e, T.SCENES2, true); const b = a && tlv.find(a[0], a[1], T.SCENES3, true);
      if (b) tlv.eachLoose(b[0], b[1], (t2) => { if (t2 === T.SCENE) scenes++; });
    }
  });
  if (!rootRecord) throw damaged('ccskp.damaged.no_geometry');
  notes.add('ccskp.note.scenes', scenes);

  // Tag 0 = Layer0 ("Untagged"), always first.
  let l0 = layers.findIndex((l) => l.name === 'Layer0');
  if (l0 < 0) { layers.unshift({ name: 'Layer0', visible: true, color: null, matName: 'Layer_Layer0' }); l0 = 0; for (const [k, v] of layerIds) layerIds.set(k, v + 1); }
  else if (l0 > 0) {
    const [l] = layers.splice(l0, 1); layers.unshift(l);
    for (const [k, v] of layerIds) layerIds.set(k, v === l0 ? 0 : v < l0 ? v + 1 : v);
  }

  // Definitions: index 0 = the model, then each 7C15 in file order.
  const ctx = { tlv, md, notes, matIds, layerIds, vertices: 0 };
  const defs = [];
  const defIdToIndex = new Map();
  const pending = [];           // [def, rawInstances]
  const root = { name: 'Model', kind: 'model', guid: null, faces: [], edges: [], soft: [], insts: [] };
  defs.push(root);
  pending.push([root, readEntities(ctx, rootRecord[0], rootRecord[1])]);
  for (let i = 0; i < defRecords.length; i++) {
    if (i % 64 === 0) { progress('read', i, defRecords.length); checkAbort(); }
    const [s, e] = defRecords[i];
    let name = '', guid = null, kind = 'component', ents = null;
    tlv.each(s, e, (t, a, z) => {
      if (t === T.ENTS) ents = [a, z];
      else if (t === T.DEF_NAME) name = tlv.text(a, z);
      else if (t === T.DEF_GUID) guid = guidText(md.subarray(a, z));
      else if (t === T.DEF_KIND && z > a) { const k = tlv.uint(a, Math.min(z, a + 4)); kind = k === 1 ? 'group' : k === 2 ? 'image' : 'component'; }
    });
    if (!ents) { notes.add('ccskp.note.def_no_geometry'); continue; }
    const info = tlv.find(ents[0], ents[1], T.INFO);
    const id = info ? tlv.idOf(info[0], info[1]) : null;
    if (id === null) { notes.add('ccskp.note.def_no_id'); continue; }
    if (defIdToIndex.has(id)) throw damaged('ccskp.damaged.def_id_twice');
    const def = { name, kind, guid, faces: [], edges: [], soft: [], insts: [] };
    defIdToIndex.set(id, defs.length);
    defs.push(def);
    pending.push([def, readEntities(ctx, ents[0], ents[1])]);
  }
  progress('read', defRecords.length, defRecords.length);

  // Instances point at definition ids; resolve them now every definition is known.
  for (const [def, got] of pending) {
    Object.assign(def, { faces: got.faces, edges: got.edges, soft: got.soft });
    for (const inst of got.insts) {
      const di = defIdToIndex.get(inst.defId);
      if (di === undefined) { notes.add('ccskp.note.inst_missing_def'); continue; }
      delete inst.defId;
      inst.def = di;
      def.insts.push(inst);
    }
  }
  checkNesting(defs);
  return { materials, layers, defs, root: 0 };
}

/** Instances must not contain themselves; nesting ≤ LIMITS.depth. Iterative (no recursion a file can drive). */
function checkNesting(defs) {
  const depth = new Array(defs.length).fill(-1);   // -1 unknown, -2 on the stack
  for (let start = 0; start < defs.length; start++) {
    if (depth[start] >= 0) continue;
    const stack = [[start, 0]];
    depth[start] = -2;
    while (stack.length) {
      const top = stack[stack.length - 1];
      const [d, i] = top;
      const insts = defs[d].insts;
      if (i < insts.length) {
        top[1]++;
        const c = insts[i].def;
        if (depth[c] === -2) throw damaged('ccskp.damaged.self_nested');
        if (depth[c] === -1) {
          if (stack.length >= LIMITS.depth) throw new SkpError('too_big', msg('ccskp.too_big.nesting', { levels: LIMITS.depth }));
          depth[c] = -2;
          stack.push([c, 0]);
        }
      } else {
        let m = 0;
        for (const inst of insts) m = Math.max(m, depth[inst.def] + 1);
        if (m > LIMITS.depth) throw new SkpError('too_big', msg('ccskp.too_big.nesting', { levels: LIMITS.depth }));
        depth[d] = m;
        stack.pop();
      }
    }
  }
}

/** Read the D007 record of an entity → { id, mat, layer, flags }. */
function readInfo(ctx, s, e) {
  const { tlv, matIds, layerIds, notes } = ctx;
  const out = { id: null, mat: null, layer: 0, flags: 0, box: null };
  tlv.each(s, e, (t, a, z) => {
    if (t === T.IDBOX) {
      const id = tlv.find(a, z, T.ID, true);
      if (id) out.id = tlv.uint(id[0], id[1]);
      out.box = [a, z];
    } else if (t === T.MAT_REF && z > a) {
      const m = matIds.get(tlv.uint(a, z));
      if (m === undefined) notes.add('ccskp.note.material_ref'); else out.mat = m;
    } else if (t === T.LAYER_REF && z > a) {
      const l = layerIds.get(tlv.uint(a, z));
      if (l === undefined) { notes.add('ccskp.note.tag_ref'); out.layer = null; } else out.layer = l;
    } else if (t === T.FLAGS && z > a) out.flags = ctx.md[a];
  });
  return out;
}

/** The front texture placement of a face: DC05 > DD05 > B136 > B236 > 1027 > 1127 > 1327 > 1527 (9 × f64). */
function readPlacement(ctx, box) {
  const { tlv } = ctx;
  let r = box;
  for (const tag of [T.ATTRS, 0xb136, 0xb236, 0x1027, 0x1127, 0x1327, 0x1527]) {
    r = tlv.find(r[0], r[1], tag, true);
    if (!r) return null;
  }
  if (r[1] - r[0] !== 72) return null;
  const m = [];
  for (let i = 0; i < 9; i++) { const v = tlv.f64(r[0] + i * 8); if (!Number.isFinite(v)) return null; m.push(v); }
  return m;
}

/** One entity list (8813) → { faces, edges (loose), soft, insts (defId unresolved) }. */
function readEntities(ctx, s, e) {
  const { tlv, md, notes } = ctx;
  const verts = new Map();       // id → [x, y, z]
  const edges = new Map();       // id → { a, b, layer, flags }
  const rawFaces = [];
  const insts = [];
  const unknown = new Map();

  const instance = (a, z) => {
    let info = null, name = '', m13 = null, defId = null;
    tlv.each(a, z, (t, p, q) => {
      if (t === T.INFO) info = readInfo(ctx, p, q);
      else if (t === T.INST_NAME) name = tlv.text(p, q);
      else if (t === T.INST_M) {
        if (q - p < 104) throw damaged('ccskp.damaged.placement_short');
        m13 = [];
        for (let i = 0; i < 13; i++) m13.push(tlv.f64(p + i * 8));
      } else if (t === T.INST_DEF && q > p) defId = tlv.uint(p, q);
    });
    if (defId === null) { notes.add('ccskp.note.inst_no_def'); return; }
    let m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    if (m13) {
      const w = m13[12];
      if (!(Number.isFinite(w) && Math.abs(w) > 1e-12)) throw damaged('ccskp.damaged.placement_scale');
      const k = 1 / w;
      for (let i = 0; i < 12; i++) if (!okNum(m13[i] * k)) throw damaged('ccskp.damaged.placement_numbers');
      // rows r0 = m13[0..2], r1 = m13[3..5], r2 = m13[6..8]; column-major out: column j = (r0[j], r1[j], r2[j]).
      m = [m13[0] * k, m13[3] * k, m13[6] * k, 0,
        m13[1] * k, m13[4] * k, m13[7] * k, 0,
        m13[2] * k, m13[5] * k, m13[8] * k, 0,
        m13[9] * k, m13[10] * k, m13[11] * k, 1];
    } else notes.add('ccskp.note.inst_no_place');
    insts.push({ defId, m, name, layer: info ? info.layer : 0, hidden: !!(info && info.flags & FLAG_HIDDEN), material: info ? info.mat : null });
  };

  tlv.each(s, e, (t, a, z) => {
    if (t === T.VERTS) {
      tlv.each(a, z, (t2, p, q) => {
        if (t2 !== T.VERT) return;
        const id = tlv.idOf(p, q);
        const xyz = tlv.find(p, q, T.XYZ);
        if (id === null || !xyz || xyz[1] - xyz[0] < 24) throw damaged('ccskp.damaged.vertex_position');
        const v = [tlv.f64(xyz[0]), tlv.f64(xyz[0] + 8), tlv.f64(xyz[0] + 16)];
        if (!okNum(v[0]) || !okNum(v[1]) || !okNum(v[2])) throw damaged('ccskp.damaged.vertex_coords');
        if (++ctx.vertices > LIMITS.vertices) throw new SkpError('too_big', msg('ccskp.too_big.points', { max: LIMITS.vertices.toLocaleString('en-US') }));
        verts.set(id, v);
      });
    } else if (t === T.EDGES) {
      tlv.each(a, z, (t2, p, q) => {
        if (t2 !== T.EDGE) return;
        let info = null, va = null, vb = null;
        tlv.each(p, q, (t3, x, y) => {
          if (t3 === T.INFO) info = readInfo(ctx, x, y);
          else if (t3 === T.EDGE_A && y > x) va = tlv.uint(x, y);
          else if (t3 === T.EDGE_B && y > x) vb = tlv.uint(x, y);
        });
        if (!info || info.id === null || va === null || vb === null) { notes.add('ccskp.note.edge_no_ends'); return; }
        edges.set(info.id, { a: va, b: vb, layer: info.layer, flags: info.flags });
      });
    } else if (t === T.FACES) {
      tlv.each(a, z, (t2, p, q) => {
        if (t2 !== T.FACE) return;
        const face = { info: null, normal: null, loops: [], back: null };
        tlv.each(p, q, (t3, x, y) => {
          if (t3 === T.INFO) face.info = readInfo(ctx, x, y);
          else if (t3 === T.NORMAL && y - x >= 24) face.normal = [tlv.f64(x), tlv.f64(x + 8), tlv.f64(x + 16)];
          else if (t3 === T.BACK_MAT && y > x) {
            const m = ctx.matIds.get(tlv.uint(x, y));
            if (m === undefined) notes.add('ccskp.note.material_ref'); else face.back = m;
          } else if (t3 === T.LOOPS) {
            tlv.each(x, y, (t4, u, w) => {
              if (t4 !== T.LOOP) return;
              const co = [];
              tlv.each(u, w, (t5, u2, w2) => {
                if (t5 !== T.COEDGES) return;
                tlv.each(u2, w2, (t6, u3, w3) => {
                  if (t6 !== T.COEDGE) return;
                  let edge = null, rev = null;
                  tlv.each(u3, w3, (t7, u4, w4) => {
                    if (t7 === T.CO_EDGE && w4 > u4) edge = tlv.uint(u4, w4);
                    else if (t7 === T.CO_DIR && w4 > u4) rev = tlv.uint(u4, w4) !== 0;
                  });
                  if (edge === null || rev === null) throw damaged('ccskp.damaged.face_edge');
                  co.push(edge, rev ? 1 : 0);
                });
              });
              face.loops.push(co);
            });
          }
        });
        rawFaces.push(face);
      });
    } else if (t === T.COMPS) {
      tlv.each(a, z, (t2, p, q) => { if (t2 === T.INST) instance(p, q); });
    } else if (t === T.GROUPS) {
      tlv.each(a, z, (t2, p, q) => { if (t2 === T.GROUP) tlv.each(p, q, (t3, x, y) => { if (t3 === T.INST) instance(x, y); }); });
    } else if (t === T.IMAGES) {
      tlv.each(a, z, (t2, p, q) => { if (t2 === T.IMAGE) tlv.each(p, q, (t3, x, y) => { if (t3 === T.INST) instance(x, y); }); });
    } else if (t === T.GUIDE_LINES || t === T.GUIDE_POINTS) {
      let n = 0;
      tlv.eachLoose(a, z, () => { n++; });
      notes.add(t === T.GUIDE_LINES ? 'ccskp.note.guide_lines' : 'ccskp.note.guide_points', n);
    } else if (t === T.ANNOTATIONS) {
      let n = 0;
      tlv.eachLoose(a, z, () => { n++; });
      notes.add('ccskp.note.annotations', n);
    } else if (!QUIET.has(t)) unknown.set(t, (unknown.get(t) || 0) + 1);
  });
  for (const [t, n] of unknown) notes.add('ccskp.note.other_lists', n, { record: tagHex(t) });

  // Faces: coedges → vertex loops. A coedge runs from its edge's start (A20F 0) or end (1).
  const used = new Set();
  const faces = [];
  let broken = 0, flipped = 0;
  for (const f of rawFaces) {
    const loops = [];
    let ok = f.loops.length > 0;
    for (const co of f.loops) {
      const loop = [];
      let prevEnd = null;
      for (let i = 0; i < co.length && ok; i += 2) {
        const ed = edges.get(co[i]);
        if (!ed) { ok = false; break; }
        const from = co[i + 1] ? ed.b : ed.a, to = co[i + 1] ? ed.a : ed.b;
        if (prevEnd !== null && prevEnd !== from) { ok = false; break; }
        const v = verts.get(from);
        if (!v) { ok = false; break; }
        loop.push(v);
        prevEnd = to;
      }
      if (!ok) break;
      if (loop.length < 3 || prevEnd !== (co[1] ? edges.get(co[0]).b : edges.get(co[0]).a)) { ok = false; break; }
      loops.push(loop);
    }
    if (!ok) { broken++; continue; }
    for (const co of f.loops) for (let i = 0; i < co.length; i += 2) used.add(co[i]);
    // The outer loop is the largest; SketchUp writes it first (kept as a check). Front = counter-clockwise about the normal.
    const n = f.normal && Number.isFinite(f.normal[0] + f.normal[1] + f.normal[2]) ? f.normal : newell(loops[0]);
    const nl = Math.hypot(n[0], n[1], n[2]) || 1;
    const unit = [n[0] / nl, n[1] / nl, n[2] / nl];
    const area = (l) => { const w = newell(l); return (w[0] * unit[0] + w[1] * unit[1] + w[2] * unit[2]) / 2; };
    let outer = 0;
    for (let i = 1; i < loops.length; i++) if (Math.abs(area(loops[i])) > Math.abs(area(loops[outer]))) outer = i;
    if (outer !== 0) { const [o] = loops.splice(outer, 1); loops.unshift(o); }
    if (area(loops[0]) < 0) { for (const l of loops) l.reverse(); flipped++; }
    for (let i = 1; i < loops.length; i++) if (area(loops[i]) > 0) loops[i].reverse();
    const info = f.info || { mat: null, layer: 0, flags: 0, box: null };
    faces.push({
      loops,
      front: info.mat, back: f.back, layer: info.layer,
      uv: null, hidden: !!(info.flags & FLAG_HIDDEN),
      _n: unit, _place: info.box ? readPlacement(ctx, info.box) : null,
    });
  }
  if (broken) notes.add('ccskp.note.face_open', broken);
  if (flipped) notes.add('ccskp.note.face_turned', flipped);

  const loose = [];
  const soft = [];
  let missing = 0;
  for (const [id, ed] of edges) {
    const a = verts.get(ed.a), b = verts.get(ed.b);
    if (!a || !b) { missing++; continue; }
    if (used.has(id)) {
      if (ed.flags & (FLAG_SOFT | FLAG_SMOOTH)) soft.push([a, b]);
    } else {
      loose.push({ a, b, layer: ed.layer, soft: !!(ed.flags & FLAG_SOFT), smooth: !!(ed.flags & FLAG_SMOOTH), hidden: !!(ed.flags & FLAG_HIDDEN) });
    }
  }
  if (missing) notes.add('ccskp.note.edge_missing_end', missing);
  return { faces, edges: loose, soft, insts };
}
