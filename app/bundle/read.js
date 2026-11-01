// SPDX-License-Identifier: Apache-2.0
// cc-bundle read.js: Archicad project signatures and project bundles (0.6 DF.12, session `bim-interop`; shared library since 0.8 BIM-BUNDLE-OPEN,
// session ifc_PART_3, rule 39). Canonical copy: lib/bundle/. Apps carry byte-identical copies in dev/bundle/ written only by
// tools/bundle/sync.mjs. DOM-free; no app imports.
/* i18n-ignore-file: file-format code. Every string here is a manifest field path (views[3].scale), a zip error code or
   a file signature; what a person reads comes from bundle-view.js through t('bundle.*'). */
//
// (a) `archicadSignature(head)`: Archicad project files (.pln, .pla; PRONOM fmt/1913, versions 17 and later) start with
//     the eight bytes "ROF FDB " (52 4F 46 20 46 44 42 20). That says "an Archicad project" for certain, or spots a
//     renamed file. It does not tell .pln, .pla and .tpl apart, and nothing inside the file is read: there is no
//     published specification (docs/spikes/archicad-pln.md).

export const ARCHICAD_SIG = [0x52, 0x4f, 0x46, 0x20, 0x46, 0x44, 0x42, 0x20];   // "ROF FDB "
export const ARCHICAD_EXTS = ['pln', 'pla', 'tpl', 'bpn'];

/** True when the first bytes of a file are the Archicad project signature. */
export function archicadSignature(head) {
  if (!head || head.length < ARCHICAD_SIG.length) return false;
  for (let i = 0; i < ARCHICAD_SIG.length; i++) if (head[i] !== ARCHICAD_SIG[i]) return false;
  return true;
}

/**
 * What to say about a file named like an Archicad project (or carrying its signature).
 * → 'project' (signature found), 'renamed' (an Archicad extension without the signature), or null (neither).
 */
export function archicadVerdict(name, head) {
  const ext = String(name || '').split('.').pop().toLowerCase();
  if (archicadSignature(head)) return 'project';
  if (ARCHICAD_EXTS.includes(ext)) return 'renamed';
  return null;
}

// ---- (b) project bundles: a zip with manifest.json (format below, docs/spikes/archicad-bundle.md) ----

export const BUNDLE_FORMAT = 'cadcraft-project-bundle';
export const BUNDLE_VERSION = 1;
const MAX_MANIFEST = 32 * 1024 * 1024, MAX_ENTRIES = 20000, MAX_ROWS = 20000, MAX_VIEWS = 5000, MAX_DEPTH = 32;
const MAX_STR = 500, MAX_NAME = 255;

/** A byte source: a File/Blob (read by ranges) or a Uint8Array. → { size, read(start, end) → Promise<Uint8Array> } */
export function toSource(x) {
  if (x instanceof Uint8Array) return { size: x.length, read: async (a, b) => x.subarray(a, b) };
  if (x && typeof x.slice === 'function' && typeof x.size === 'number') return { size: x.size, read: async (a, b) => new Uint8Array(await x.slice(a, b).arrayBuffer()) };
  throw new Error('bundle: not a file');
}

async function inflateRaw(data) {
  const ds = new DecompressionStream('deflate-raw');
  return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());
}

/** A safe zip entry name: relative, '/'-separated, no '..', no drive letters. */
export function safeEntryName(n) {
  if (typeof n !== 'string' || !n || n.length > MAX_NAME) return false;
  if (n.startsWith('/') || /^[a-zA-Z]:/.test(n) || n.includes('\\') || n.includes('\0')) return false;
  return !n.split('/').some((p) => p === '..' || p === '.');
}

/** The central directory of a zip, read from its end; entries are read one at a time. Errors carry `code`. */
export class ZipIndex {
  static async open(input) {
    const src = toSource(input);
    const err = (code) => Object.assign(new Error('bundle.' + code), { code });
    if (src.size < 22) throw err('notzip');
    const tailLen = Math.min(src.size, 22 + 65535);
    const tail = await src.read(src.size - tailLen, src.size);
    const dv = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
    let e = -1;
    for (let i = tail.length - 22; i >= 0; i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw err('notzip');
    const count = dv.getUint16(e + 10, true), cdSize = dv.getUint32(e + 12, true), cdOff = dv.getUint32(e + 16, true);
    if (count === 0xffff || cdOff === 0xffffffff || cdSize === 0xffffffff) throw err('zip64');
    if (count > MAX_ENTRIES) throw err('toomany');
    if (cdOff + cdSize > src.size) throw err('broken');
    const cd = await src.read(cdOff, cdOff + cdSize);
    const cv = new DataView(cd.buffer, cd.byteOffset, cd.byteLength);
    const entries = new Map(), skipped = [];
    let p = 0;
    for (let k = 0; k < count; k++) {
      if (p + 46 > cd.length || cv.getUint32(p, true) !== 0x02014b50) throw err('broken');
      const flags = cv.getUint16(p + 8, true), method = cv.getUint16(p + 10, true);
      const csize = cv.getUint32(p + 20, true), usize = cv.getUint32(p + 24, true);
      const nlen = cv.getUint16(p + 28, true), xlen = cv.getUint16(p + 30, true), clen = cv.getUint16(p + 32, true);
      const lho = cv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(cd.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + xlen + clen;
      if (name.endsWith('/')) continue;
      if (!safeEntryName(name)) { skipped.push(name.slice(0, 80)); continue; }
      if (csize === 0xffffffff || usize === 0xffffffff || lho === 0xffffffff) throw err('zip64');
      entries.set(name, { name, method, flags, csize, usize, lho });
    }
    return new ZipIndex(src, entries, skipped);
  }
  constructor(src, entries, skipped) { this.src = src; this.entries = entries; this.skipped = skipped; }
  has(name) { return this.entries.has(name); }
  names() { return [...this.entries.keys()]; }
  size(name) { return this.entries.get(name)?.usize ?? 0; }
  /** The entry's bytes. `max` refuses anything larger (code 'toolarge'). */
  async read(name, { max = Infinity } = {}) {
    const e = this.entries.get(name);
    const err = (code) => Object.assign(new Error('bundle.' + code), { code, entry: name });
    if (!e) throw err('missing');
    if (e.flags & 1) throw err('encrypted');
    if (e.usize > max) throw err('toolarge');
    const lh = await this.src.read(e.lho, e.lho + 30);
    const lv = new DataView(lh.buffer, lh.byteOffset, lh.byteLength);
    if (lh.length < 30 || lv.getUint32(0, true) !== 0x04034b50) throw err('broken');
    const start = e.lho + 30 + lv.getUint16(26, true) + lv.getUint16(28, true);
    const raw = await this.src.read(start, start + e.csize);
    let data;
    if (e.method === 0) data = raw;
    else if (e.method === 8) data = await inflateRaw(raw);
    else throw err('method');
    if (data.length !== e.usize) throw err('broken');
    return data;
  }
  async text(name, opts) { return new TextDecoder().decode(await this.read(name, opts)); }
}

/** A zip is a bundle when it holds manifest.json at its root. */
export const isBundle = (index) => index.has('manifest.json');

// ---- manifest checking (untrusted) ----
const KINDS = ['plan', 'section', 'elevation', 'interior_elevation', 'detail', 'worksheet', '3d', 'document_3d', 'schedule', 'list', 'other'];
const PTYPES = ['string', 'integer', 'number', 'length', 'area', 'volume', 'angle', 'boolean', 'enum', 'list'];
const LT_KINDS = ['solid', 'dashed', 'symbol'];
const FILL_KINDS = ['vector', 'symbol', 'solid', 'empty', 'image', 'gradient', 'other'];
const PROJECT_KINDS = ['project', 'archive', 'template'];

function checker(notes) {
  const note = (where, what) => { if (notes.length < 200) notes.push({ where, what }); };
  const str = (v, where, max = MAX_STR) => {
    if (v === undefined || v === null) return undefined;
    if (typeof v === 'number' && Number.isFinite(v)) v = String(v);
    if (typeof v !== 'string') { note(where, 'text'); return undefined; }
    // eslint-disable-next-line no-control-regex
    return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max);
  };
  const num = (v, where, lo = -1e9, hi = 1e9) => {
    if (v === undefined || v === null) return undefined;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) { note(where, 'number'); return undefined; }
    return v;
  };
  const bool = (v, where) => { if (v === undefined || v === null) return undefined; if (typeof v !== 'boolean') { note(where, 'yesno'); return undefined; } return v; };
  const oneOf = (v, list, where, dflt) => { if (v === undefined || v === null) return dflt; if (!list.includes(v)) { note(where, 'kind'); return dflt; } return v; };
  const color = (v, where) => { if (v === undefined || v === null) return undefined; if (typeof v !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(v)) { note(where, 'color'); return undefined; } return v.toLowerCase(); };
  const path = (v, where) => { if (v === undefined || v === null) return undefined; if (typeof v !== 'string' || !safeEntryName(v)) { note(where, 'path'); return undefined; } return v; };
  const arr = (v, where, max = MAX_ROWS) => {
    if (v === undefined || v === null) return [];
    if (!Array.isArray(v)) { note(where, 'list'); return []; }
    if (v.length > max) { note(where, 'toolong'); return v.slice(0, max); }
    return v;
  };
  const obj = (v, where) => (v && typeof v === 'object' && !Array.isArray(v) ? v : (v === undefined || v === null ? null : (note(where, 'object'), null)));
  const strs = (v, where, max = 64) => arr(v, where, max).map((s, i) => str(s, `${where}[${i}]`, MAX_NAME)).filter((s) => s !== undefined);
  const size = (v, where) => { const o = obj(v, where); if (!o) return undefined; const w = num(o.w, where + '.w', 1, 10000), h = num(o.h, where + '.h', 1, 10000); return w && h ? { w, h } : undefined; };
  const clean = (o) => { for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k]; return o; };
  return { note, str, num, bool, oneOf, color, path, arr, obj, strs, size, clean };
}

function depthOk(v, d = 0) {
  if (d > MAX_DEPTH) return false;
  if (Array.isArray(v)) return v.every((x) => depthOk(x, d + 1));
  if (v && typeof v === 'object') return Object.values(v).every((x) => depthOk(x, d + 1));
  return true;
}

/**
 * Check a manifest (text or parsed JSON). → { ok, manifest, notes [{where, what}], error? }. A bad row field is dropped
 * with a note; only a wrong format/version or a missing model refuses the bundle.
 */
export function readManifest(input) {
  let m = input;
  if (typeof input === 'string') {
    if (input.length > MAX_MANIFEST) return { ok: false, error: 'toolarge', notes: [] };
    try { m = JSON.parse(input); } catch (e) { return { ok: false, error: 'json', notes: [] }; }
  }
  if (!m || typeof m !== 'object' || Array.isArray(m)) return { ok: false, error: 'json', notes: [] };
  if (m.format !== BUNDLE_FORMAT) return { ok: false, error: 'format', notes: [] };
  if (m.version !== BUNDLE_VERSION) return { ok: false, error: 'version', notes: [] };
  if (!depthOk(m)) return { ok: false, error: 'depth', notes: [] };
  const notes = [];
  const c = checker(notes);
  const model = c.obj(m.model, 'model');
  const modelFile = model && c.path(model.file, 'model.file');
  if (!modelFile) return { ok: false, error: 'model', notes };
  const g = c.obj(m.generator, 'generator') || {};
  const host = c.obj(g.host, 'generator.host') || {};
  const pr = c.obj(m.project, 'project') || {};
  const out = {
    format: BUNDLE_FORMAT, version: BUNDLE_VERSION,
    generator: c.clean({ name: c.str(g.name, 'generator.name', MAX_NAME), version: c.str(g.version, 'generator.version', 40),
      host: c.clean({ program: c.str(host.program, 'generator.host.program', 80), version: c.str(host.version, 'generator.host.version', 40), build: c.str(host.build, 'generator.host.build', 40), language: c.str(host.language, 'generator.host.language', 20) }) }),
    project: c.clean({ name: c.str(pr.name, 'project.name', MAX_NAME), file: c.str(pr.file, 'project.file', MAX_NAME), kind: c.oneOf(pr.kind, PROJECT_KINDS, 'project.kind', undefined), exported_at: c.str(pr.exported_at, 'project.exported_at', 40) }),
    model: c.clean({ file: modelFile, schema: c.str(model.schema, 'model.schema', 40), translator: c.str(model.translator, 'model.translator', MAX_NAME), guids: c.str(model.guids, 'model.guids', 40) }),
  };
  out.stories = c.arr(m.stories, 'stories', 1000).map((s, i) => {
    const w = `stories[${i}]`; const o = c.obj(s, w); if (!o) return null;
    const index = c.num(o.index, w + '.index', -1000, 1000);
    if (index === undefined || !Number.isInteger(index)) { c.note(w + '.index', 'number'); return null; }
    return c.clean({ index, name: c.str(o.name, w + '.name', MAX_NAME) ?? '', elevation: c.num(o.elevation, w + '.elevation'), ifc: c.str(o.ifc, w + '.ifc', 64) });
  }).filter(Boolean);
  out.views = c.arr(m.views, 'views', MAX_VIEWS).map((v, i) => {
    const w = `views[${i}]`; const o = c.obj(v, w); if (!o) return null;
    const name = c.str(o.name, w + '.name', MAX_NAME);
    if (!name) { c.note(w + '.name', 'missing'); return null; }
    const z = c.obj(o.zoom, w + '.zoom');
    const zoom = z ? (() => { const r = ['x0', 'y0', 'x1', 'y1'].map((k) => c.num(z[k], `${w}.zoom.${k}`)); return r.every((x) => x !== undefined) ? { x0: r[0], y0: r[1], x1: r[2], y1: r[3] } : undefined; })() : undefined;
    const story = c.num(o.story, w + '.story', -1000, 1000);
    return c.clean({
      id: c.str(o.id, w + '.id', 64) ?? `view-${i + 1}`, name, path: c.strs(o.path, w + '.path'), kind: c.oneOf(o.kind, KINDS, w + '.kind', 'other'),
      story: Number.isInteger(story) ? story : undefined, scale: c.num(o.scale, w + '.scale', 0.0001, 1e6),
      layer_combination: c.str(o.layer_combination, w + '.layer_combination', MAX_NAME), model_view_options: c.str(o.model_view_options, w + '.model_view_options', MAX_NAME),
      pen_set: c.str(o.pen_set, w + '.pen_set', MAX_NAME), structure_display: c.str(o.structure_display, w + '.structure_display', MAX_NAME),
      dimension_style: c.str(o.dimension_style, w + '.dimension_style', MAX_NAME), renovation_filter: c.str(o.renovation_filter, w + '.renovation_filter', MAX_NAME),
      graphic_override: c.str(o.graphic_override, w + '.graphic_override', MAX_NAME), zoom, file: c.path(o.file, w + '.file'), _i: i,
    });
  }).filter(Boolean);
  out.layouts = c.arr(m.layouts, 'layouts', MAX_VIEWS).map((l, i) => {
    const w = `layouts[${i}]`; const o = c.obj(l, w); if (!o) return null;
    const name = c.str(o.name, w + '.name', MAX_NAME);
    if (!name) { c.note(w + '.name', 'missing'); return null; }
    const page = c.num(o.pdf_page, w + '.pdf_page', 1, 100000);
    return c.clean({
      id: c.str(o.id, w + '.id', 64) ?? `layout-${i + 1}`, name, number: c.str(o.number, w + '.number', 80), path: c.strs(o.path, w + '.path'),
      master: c.str(o.master, w + '.master', MAX_NAME), size: c.size(o.size, w + '.size'), pdf: c.path(o.pdf, w + '.pdf'),
      pdf_page: Number.isInteger(page) ? page : undefined, dwg: c.path(o.dwg, w + '.dwg'), _i: i,
      drawings: c.arr(o.drawings, w + '.drawings', 500).map((d, j) => {
        const wd = `${w}.drawings[${j}]`; const od = c.obj(d, wd); if (!od) return null;
        return c.clean({ name: c.str(od.name, wd + '.name', MAX_NAME) ?? '', view: c.str(od.view, wd + '.view', 64), scale: c.num(od.scale, wd + '.scale', 0.0001, 1e6),
          x: c.num(od.x, wd + '.x'), y: c.num(od.y, wd + '.y'), w: c.num(od.w, wd + '.w', 0), h: c.num(od.h, wd + '.h', 0) });
      }).filter(Boolean),
    });
  }).filter(Boolean);
  out.masters = c.arr(m.masters, 'masters', 1000).map((x, i) => {
    const w = `masters[${i}]`; const o = c.obj(x, w); if (!o) return null;
    const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
    return c.clean({ id: c.str(o.id, w + '.id', 64), name, size: c.size(o.size, w + '.size') });
  }).filter(Boolean);
  const nb = c.obj(m.numbering, 'numbering');
  if (nb) out.numbering = c.clean({ layouts: c.str(nb.layouts, 'numbering.layouts', 80), prefix: c.str(nb.prefix, 'numbering.prefix', 40) });
  const props = c.obj(m.properties, 'properties') || {};
  out.properties = {
    groups: c.arr(props.groups, 'properties.groups').map((x, i) => {
      const w = `properties.groups[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return { id: c.str(o.id, w + '.id', 64) ?? name, name };
    }).filter(Boolean),
    definitions: c.arr(props.definitions, 'properties.definitions').map((x, i) => {
      const w = `properties.definitions[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      const ifc = c.obj(o.ifc, w + '.ifc');
      const dflt = typeof o.default === 'number' ? c.num(o.default, w + '.default') : typeof o.default === 'boolean' ? o.default : c.str(o.default, w + '.default');
      return c.clean({ id: c.str(o.id, w + '.id', 64) ?? name, group: c.str(o.group, w + '.group', 64), name, type: c.oneOf(o.type, PTYPES, w + '.type', 'string'),
        unit: c.str(o.unit, w + '.unit', 40), values: c.strs(o.values, w + '.values', 1000), default: dflt, description: c.str(o.description, w + '.description'),
        classifications: c.strs(o.classifications, w + '.classifications', 5000),
        ifc: ifc ? c.clean({ pset: c.str(ifc.pset, w + '.ifc.pset', MAX_NAME), name: c.str(ifc.name, w + '.ifc.name', MAX_NAME) }) : undefined });
    }).filter(Boolean),
  };
  const items = (list, w, d = 0) => c.arr(list, w, 5000).map((x, i) => {
    const wi = `${w}[${i}]`; const o = c.obj(x, wi); if (!o || d > 12) return null;
    return c.clean({ id: c.str(o.id, wi + '.id', 64), code: c.str(o.code, wi + '.code', 120) ?? '', name: c.str(o.name, wi + '.name', MAX_NAME) ?? '', children: items(o.children, wi + '.children', d + 1) });
  }).filter(Boolean);
  out.classifications = c.arr(m.classifications, 'classifications', 100).map((x, i) => {
    const w = `classifications[${i}]`; const o = c.obj(x, w); if (!o) return null;
    const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
    return c.clean({ id: c.str(o.id, w + '.id', 64), name, version: c.str(o.version, w + '.version', 40), source: c.str(o.source, w + '.source'), items: items(o.items, w + '.items') });
  }).filter(Boolean);
  const st = c.obj(m.standards, 'standards') || {};
  const layerState = (o, w) => c.clean({ hidden: c.bool(o.hidden, w + '.hidden'), locked: c.bool(o.locked, w + '.locked'), wireframe: c.bool(o.wireframe, w + '.wireframe') });
  out.standards = {
    layers: c.arr(st.layers, 'standards.layers').map((x, i) => {
      const w = `standards.layers[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return c.clean({ name, ...layerState(o, w), group: c.num(o.group, w + '.group', 0, 1e6) });
    }).filter(Boolean),
    layer_combinations: c.arr(st.layer_combinations, 'standards.layer_combinations', 1000).map((x, i) => {
      const w = `standards.layer_combinations[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      const ls = c.obj(o.layers, w + '.layers') || {};
      const layers = {};
      for (const [k, v] of Object.entries(ls).slice(0, MAX_ROWS)) { const kk = c.str(k, w + '.layers', MAX_NAME); const ov = c.obj(v, `${w}.layers.${kk}`); if (kk && ov) layers[kk] = layerState(ov, `${w}.layers.${kk}`); }
      return { name, layers };
    }).filter(Boolean),
    pen_sets: c.arr(st.pen_sets, 'standards.pen_sets', 200).map((x, i) => {
      const w = `standards.pen_sets[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return { name, pens: c.arr(o.pens, w + '.pens', 255).map((p, j) => {
        const wp = `${w}.pens[${j}]`; const op = c.obj(p, wp); if (!op) return null;
        const index = c.num(op.index, wp + '.index', 1, 255); if (!Number.isInteger(index)) return null;
        return c.clean({ index, color: c.color(op.color, wp + '.color'), weight: c.num(op.weight, wp + '.weight', 0, 50) });
      }).filter(Boolean) };
    }).filter(Boolean),
    line_types: c.arr(st.line_types, 'standards.line_types', 2000).map((x, i) => {
      const w = `standards.line_types[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      const pattern = c.arr(o.pattern, w + '.pattern', 64).map((v, j) => c.num(v, `${w}.pattern[${j}]`, 0, 1000));
      return c.clean({ name, kind: c.oneOf(o.kind, LT_KINDS, w + '.kind', 'solid'), pattern: pattern.every((v) => v !== undefined) ? pattern : undefined });
    }).filter(Boolean),
    fills: c.arr(st.fills, 'standards.fills', 2000).map((x, i) => {
      const w = `standards.fills[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return { name, kind: c.oneOf(o.kind, FILL_KINDS, w + '.kind', 'other') };
    }).filter(Boolean),
    surfaces: c.arr(st.surfaces, 'standards.surfaces', 5000).map((x, i) => {
      const w = `standards.surfaces[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return c.clean({ name, color: c.color(o.color, w + '.color'), transparency: c.num(o.transparency, w + '.transparency', 0, 100) });
    }).filter(Boolean),
    composites: c.arr(st.composites, 'standards.composites', 5000).map((x, i) => {
      const w = `standards.composites[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return { name, skins: c.arr(o.skins, w + '.skins', 64).map((s, j) => {
        const ws = `${w}.skins[${j}]`; const os = c.obj(s, ws); if (!os) return null;
        return c.clean({ material: c.str(os.material, ws + '.material', MAX_NAME), thickness: c.num(os.thickness, ws + '.thickness', 0, 100), core: c.bool(os.core, ws + '.core') });
      }).filter(Boolean) };
    }).filter(Boolean),
    materials: c.arr(st.materials, 'standards.materials', 5000).map((x, i) => {
      const w = `standards.materials[${i}]`; const o = c.obj(x, w); if (!o) return null;
      const name = c.str(o.name, w + '.name', MAX_NAME); if (!name) return null;
      return c.clean({ name, fill: c.str(o.fill, w + '.fill', MAX_NAME), surface: c.str(o.surface, w + '.surface', MAX_NAME) });
    }).filter(Boolean),
  };
  out.notes = c.arr(m.notes, 'notes', 500).map((s, i) => c.str(s, `notes[${i}]`, 1000)).filter((s) => s !== undefined);
  // cross references
  const storyIx = new Set(out.stories.map((s) => s.index)), viewIds = new Set(out.views.map((v) => v.id));
  const lcNames = new Set(out.standards.layer_combinations.map((x) => x.name));
  for (const v of out.views) {
    if (v.story !== undefined && out.stories.length && !storyIx.has(v.story)) c.note(`views[${v._i}].story`, 'unknown');
    if (v.layer_combination && lcNames.size && !lcNames.has(v.layer_combination)) c.note(`views[${v._i}].layer_combination`, 'unknown');
    delete v._i;
  }
  for (const l of out.layouts) { for (const [j, d] of l.drawings.entries()) if (d.view && !viewIds.has(d.view)) c.note(`layouts[${l._i}].drawings[${j}].view`, 'unknown'); delete l._i; }
  return { ok: true, manifest: out, notes };
}

/**
 * Open a bundle (File/Blob/Uint8Array). → { index, manifest, notes, missing [paths the manifest names but the zip lacks] }.
 * Errors carry `code`: notzip, zip64, broken, toomany, nomanifest, json, format, version, depth, model, nomodel.
 */
export async function openBundle(input) {
  const index = await ZipIndex.open(input);
  if (!isBundle(index)) throw Object.assign(new Error('bundle.nomanifest'), { code: 'nomanifest' });
  const r = readManifest(await index.text('manifest.json', { max: MAX_MANIFEST }));
  if (!r.ok) throw Object.assign(new Error('bundle.' + r.error), { code: r.error });
  const m = r.manifest;
  if (!index.has(m.model.file)) throw Object.assign(new Error('bundle.nomodel'), { code: 'nomodel', entry: m.model.file });
  const missing = [];
  const want = (p) => { if (p && !index.has(p) && !missing.includes(p)) missing.push(p); };
  for (const v of m.views) want(v.file);
  for (const l of m.layouts) { want(l.pdf); want(l.dwg); }
  return { index, manifest: m, notes: r.notes, missing, skipped: index.skipped };
}

