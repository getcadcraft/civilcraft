/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: report notes go through msg() (messages.js); what is left is internal checks and file-format text. */
/**
 * write.js — writeDwg(model, { version }) → { bytes, report } (cc-dwg, Apache-2.0).
 *
 * Turns the version-neutral model (docs/DWG-LIB-SPEC.md) into DWG objects and lays them out for
 * AC1015 (R2000), AC1018 (R2004), AC1021 (R2007), AC1024 (R2010), AC1027 (R2013) or AC1032 (R2018).
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1 (ch. 3–10, 20–27) and our own
 * CivilCraft/CadCraft R2000 writer; see objects-write.js and container-write.js for the details and the
 * "Spec gap:" notes.
 *
 * Handles are renumbered: every object gets a fresh handle in the order it is written (controls and tables,
 * then each block: header, BLOCK, contents, ENDBLK). report.handles maps the model's handles to the new ones.
 * What the writer cannot write yet is skipped and listed in report.notes (and counted in report.skipped).
 *
 * What goes in every file: the nine symbol tables (+ the viewport entity table for R2000), linetypes
 * ByBlock/ByLayer/Continuous, layer 0, text style Standard, app ACAD, dimension style Standard, multiline style
 * Standard, the named-object dictionary (ACAD_GROUP, ACAD_LAYOUT, ACAD_MLINESTYLE, ACAD_PLOTSTYLENAME), an
 * *Active viewport zoomed to the drawing, *Model_Space, *Paper_Space and the layouts. Text from R2007 on is
 * UTF-16; before that ANSI_1252 with \U+XXXX for anything outside it.
 */
import { msg } from './messages.js';
import { encode1252, atLeast, cleanText } from './bits-write.js';
import { encodeObject, encodeHeader, encodeClasses, CLASSED, julian } from './objects-write.js';
import * as CW from './container-write.js';
import { layoutR2000, layoutR2004, VERSION_INFO } from './container-write.js';
import { layoutR2007 } from './r2007-write.js';
import { extendWriter } from './nongraphic-write.js';
import { tableWriter } from './table-write.js';   // builder T: ACAD_TABLE, TABLESTYLE, FIELD
import { solidWriter } from './solid-write.js';   // builder S: REGION 3DSOLID BODY (ACIS, R2013+ data storage), LIGHT
import { surfaceWriter } from './surface-write.js';   // SURFACE family (ACIS + type fields; NURBSURFACE save-down)

export const VERSIONS = { AC1015: 'R2000', AC1018: 'R2004', AC1021: 'R2007', AC1024: 'R2010', AC1027: 'R2013', AC1032: 'R2018' };
const ALIASES = { R2000: 'AC1015', R2004: 'AC1018', R2007: 'AC1021', R2010: 'AC1024', R2013: 'AC1027', R2018: 'AC1032',
  2000: 'AC1015', 2004: 'AC1018', 2007: 'AC1021', 2010: 'AC1024', 2013: 'AC1027', 2018: 'AC1032' };

/** DXF lineweights (1/100 mm) in the order of the DWG lineweight index. */
const LW_TABLE = [0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211];
export function lwIndex(lw) {
  if (lw === undefined || lw === null || lw === -1) return 29;
  if (lw === -2) return 30;
  if (lw === -3 || lw < 0) return 31;
  let best = 0;
  for (let i = 1; i < LW_TABLE.length; i++) if (Math.abs(LW_TABLE[i] - lw) < Math.abs(LW_TABLE[best] - lw)) best = i;
  return best;
}
const BAD_NAME = /[<>/\\":;?*|,=`\x00-\x1f]/g;
const BAD_NAME_NOBAR = /[<>/\\":;?*,=`\x00-\x1f]/;   // the same without "|" (an xref-dependent name keeps its one bar)
/** AutoCAD's hidden "*" system layers (parametric constraints, the system lights' glyphs), written as they are named. */
const SYSTEM_LAYERS = /^\*(LayerNameForDynamicConstraint|ADSK_CONSTRAINTS|ADSK_SYSTEM_LIGHTS)$/i;
const HARD_OWN_CODE = 3;
const fin = (...v) => v.every(Number.isFinite);
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const hexKey = (h) => (h === undefined || h === null ? null : String(typeof h === 'number' ? h.toString(16) : h).toUpperCase().replace(/^0+(?=.)/, ''));

/** Supported model entity types (others are skipped with a note). */
const DIM_TYPES = { 0: 'DIMENSION_LINEAR', 1: 'DIMENSION_ALIGNED', 2: 'DIMENSION_ANG2LN', 3: 'DIMENSION_DIAMETER', 4: 'DIMENSION_RADIUS', 5: 'DIMENSION_ANG3PT', 6: 'DIMENSION_ORDINATE' };

/** The AutoCAD colour index palette (the DXF reference's table, generated: 1–9 named, 10–249 hue × value × pastel, 250–255 greys). */
const ACI_RGB = (() => {
  const t = new Array(256).fill(null);
  [[255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255], [255, 255, 255], [128, 128, 128], [192, 192, 192]].forEach((c, i) => { t[i + 1] = c; });
  const V = [255, 204, 153, 127, 76];
  for (let i = 10; i < 250; i++) {
    const hue = Math.floor((i - 10) / 10) * 15, k = (i - 10) % 10, v = V[k >> 1], pastel = k & 1;
    const h6 = hue / 60, f = h6 - Math.floor(h6), lo = pastel ? v / 2 : 0;
    const q = v - (v - lo) * f, u = lo + (v - lo) * f;
    const rgb = [[v, u, lo], [q, v, lo], [lo, v, u], [lo, q, v], [u, lo, v], [v, lo, q]][Math.floor(h6) % 6];
    t[i] = rgb.map(Math.round);
  }
  [51, 91, 132, 173, 214, 255].forEach((g, i) => { t[250 + i] = [g, g, g]; });
  return t;
})();
export function aciFromRgb(rgb) {
  const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255;
  let best = 7, bd = Infinity;
  for (let i = 1; i < 256; i++) { const c = ACI_RGB[i]; const d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2; if (d < bd) { bd = d; best = i; } }
  return best;
}

export function writeDwg(model = {}, opts = {}) {
  const version = ALIASES[opts.version] || opts.version || model.version || 'AC1015';
  if (!VERSIONS[version]) throw new Error(`writeDwg: version ${version} is not supported (use one of ${Object.keys(VERSIONS).join(', ')})`);
  const r2004 = atLeast(version, 'AC1018'), r2007 = atLeast(version, 'AC1021');
  const report = { version, notes: [], counts: {}, skipped: {}, layers: [], handles: {}, renamed: { layers: {}, blocks: {}, layouts: {} }, objects: 0, entities: 0 };
  encode1252.lost = 0;
  let lostRgb = 0;                                 // true colours turned into indexes (R2000)
  const created = opts.created instanceof Date ? opts.created : model.created instanceof Date ? model.created : new Date();
  const hdrIn = { ...(model.header || {}) };

  // ---------------------------------------------------------------- handles
  let seed = 1;
  const next = () => seed++;
  const recs = [];                                 // every record, in handle order of allocation
  const push = (r) => { recs.push(r); return r; };
  const H = {};
  for (const k of ['blockCtl', 'layerCtl', 'styleCtl', 'ltypeCtl', 'viewCtl', 'ucsCtl', 'vportCtl', 'appidCtl', 'dimstyleCtl', 'vpentCtl',
    'nod', 'groupDict', 'mlsDict', 'layoutDict', 'plotStyleDict', 'plotStyleNormal', 'ltByBlock', 'ltByLayer', 'ltContinuous', 'layer0',
    'mlstyle', 'vport']) H[k] = next();
  if (!r2004) { /* the viewport entity table exists only up to R2000 */ }
  const srcMap = new Map();                        // model handle → new handle
  const mapSrc = (src, h) => { const k = hexKey(src); if (k) { srcMap.set(k, h); report.handles[k] = h.toString(16).toUpperCase(); } };

  // ---------------------------------------------------------------- names
  const usedNames = new Map();                     // table → Set(UPPER)
  const notes = { renamedLayers: 0, renamedBlocks: 0, renamedOther: 0, tables: 0 };
  const cleanName = (table, name, fallback) => {
    const used = usedNames.get(table) || usedNames.set(table, new Set()).get(table);
    let clean = String(name ?? '').replace(/\|/g, '$0$').replace(BAD_NAME, '_').trim().slice(0, 255) || fallback;
    let n = clean, k = 2;
    while (used.has(n.toUpperCase())) n = clean + '_' + k++;
    used.add(n.toUpperCase());
    return n;
  };
  const reserve = (table, name) => (usedNames.get(table) || usedNames.set(table, new Set()).get(table)).add(name.toUpperCase());

  // ---------------------------------------------------------------- linetypes
  const T = model.tables || {};
  const ltypes = [];
  const ltByName = new Map();
  reserve('ltype', 'ByBlock'); reserve('ltype', 'ByLayer'); reserve('ltype', 'Continuous');
  ltByName.set('BYBLOCK', H.ltByBlock); ltByName.set('BYLAYER', H.ltByLayer); ltByName.set('CONTINUOUS', H.ltContinuous);
  for (const lt of T.linetypes || []) {
    const up = String(lt.name || '').toUpperCase();
    if (ltByName.has(up)) { mapSrc(lt.handle, ltByName.get(up)); continue; }
    const name = cleanName('ltype', lt.name, 'Linetype');
    const h = next(); mapSrc(lt.handle, h);
    ltByName.set(up, h); ltByName.set(name.toUpperCase(), h);
    ltypes.push({ t: 'LTYPE', h, owner: H.ltypeCtl, name, description: lt.description || '', patternLength: lt.patternLength,
      elements: (lt.elements || []).map((e) => ({ length: num(e.length), shape: e.shape | 0, offset: e.offset, scale: e.scale, rotation: e.rotation, flags: 0 })) });
  }
  const ltypeRef = (name) => {
    if (name === undefined || name === null || /^bylayer$/i.test(name)) return { flag: 0 };
    if (/^byblock$/i.test(name)) return { flag: 1 };
    const h = ltByName.get(String(name).toUpperCase()) || srcMap.get(hexKey(name));
    return h ? { flag: 3, h } : { flag: 0 };
  };

  // ---------------------------------------------------------------- text styles
  const styles = [];
  const styleByName = new Map();
  const addStyle = (s) => {
    const up = String(s.name || 'Standard').toUpperCase();
    if (styleByName.has(up)) { mapSrc(s.handle, styleByName.get(up)); return styleByName.get(up); }
    const name = up === 'STANDARD' ? 'Standard' : cleanName('style', s.name, 'Style');
    if (up === 'STANDARD') reserve('style', 'Standard');
    const h = next(); mapSrc(s.handle, h);
    styleByName.set(up, h); styleByName.set(name.toUpperCase(), h);
    styles.push({ t: 'STYLE', h, owner: H.styleCtl, name, height: num(s.height), widthFactor: num(s.widthFactor, 1), oblique: num(s.oblique),
      generation: s.generation | 0, lastHeight: num(s.lastHeight, 0.2), font: s.font ?? 'txt', bigFont: s.bigFont ?? '', vertical: !!(s.flags & 4), shapeFile: !!(s.flags & 1) });
    return h;
  };
  addStyle((T.styles || []).find((s) => /^standard$/i.test(s.name)) || { name: 'Standard' });
  for (const s of T.styles || []) if (s.name) addStyle(s);
  const styleRef = (name) => styleByName.get(String(name ?? 'Standard').toUpperCase()) || srcMap.get(hexKey(name)) || styleByName.get('STANDARD');

  // ---------------------------------------------------------------- layers
  const xrefBlockNames = new Set((model.blocks || []).filter((b) => (b.flags & 4) && b.name).map((b) => String(b.name).toUpperCase()));   // links kept as links
  const layers = [];
  const layerByName = new Map();                   // original name → record
  const layerByNew = new Map();                    // written name → record
  const addLayer = (l) => {
    const orig = String(l.name ?? '0');
    if (layerByName.has(orig)) return layerByName.get(orig);
    // AutoCAD's hidden system layers keep their name ('*' is otherwise not allowed): it finds what lives on them by it
    // (dimensional constraints, the lights' glyphs). The names are those found in the corpus; the ODA File Converter
    // keeps them in every version.
    const keep = orig === '0' || SYSTEM_LAYERS.test(orig);
    // a linked drawing's own layer ("Plan|Walls") while the link stays a link (block flag 4): kept by that name, marked
    // xref-dependent and pointing at the link's block record (20.4.55: xdep bit, external reference handle), as AutoCAD
    // keeps them — so settings made on it survive saving and a reload (0.5 WL.15)
    const bar = orig.indexOf('|'), xrefOf = bar > 0 ? orig.slice(0, bar) : '';
    const dep = !!xrefOf && xrefBlockNames.has(xrefOf.toUpperCase()) && !BAD_NAME_NOBAR.test(orig);
    const name = keep || dep ? orig : cleanName('layer', orig === '' ? 'Unnamed' : orig, 'Unnamed');
    if (keep || dep) reserve('layer', orig);
    if (name !== orig) { notes.renamedLayers++; report.renamed.layers[orig] = name; }
    let color = l.color;
    if (typeof color === 'number') color = { index: color };
    if (!color || (color.rgb === undefined && !(Math.abs(color.index) >= 1 && Math.abs(color.index) <= 255))) color = { index: 7 };
    const off = l.off === true || l.on === false || (color.index !== undefined && color.index < 0);
    if (color.index < 0) color = { ...color, index: -color.index };
    if (color.rgb !== undefined && !r2004) { lostRgb++; color = { index: aciFromRgb(color.rgb) }; }
    const h = orig === '0' ? H.layer0 : next();
    mapSrc(l.handle, h);
    const rec = { t: 'LAYER', h, owner: H.layerCtl, name, color, off, frozen: !!l.frozen, locked: !!l.locked, plot: l.plot !== false, frozenNew: !!l.frozenInNewViewports, ...(dep ? { xdep: true, xrefOf } : {}),
      lwIndex: l.lineweight === undefined ? 31 : lwIndex(l.lineweight), ltype: ltypeRef(l.linetype).h || (srcMap.get(hexKey(l.linetype))) || H.ltContinuous,
      plotstyle: H.plotStyleNormal };
    layers.push(rec); layerByName.set(orig, rec); layerByNew.set(name, rec);
    report.layers.push({ name, color: color.rgb !== undefined ? color : color.index });
    return rec;
  };
  addLayer((T.layers || []).find((l) => l.name === '0') || { name: '0', color: { index: 7 } });
  for (const l of T.layers || []) addLayer(l);
  const layerRef = (name) => (layerByName.get(String(name ?? '0')) || addLayer({ name: String(name ?? '0') })).h;

  // ---------------------------------------------------------------- registered applications
  const appids = [];
  const appByName = new Map();
  const addApp = (name, src) => {
    const up = String(name).toUpperCase();
    if (appByName.has(up)) { mapSrc(src, appByName.get(up)); return appByName.get(up); }
    const clean = cleanName('appid', name, 'APP');
    const h = next(); mapSrc(src, h);
    appByName.set(up, h);
    appids.push({ t: 'APPID', h, owner: H.appidCtl, name: clean });
    return h;
  };
  addApp('ACAD');
  for (const a of T.appids || []) if (a.name) addApp(a.name, a.handle);

  // ---------------------------------------------------------------- dimension styles
  const dimstyles = [];
  const dimByName = new Map();
  const addDim = (d) => {
    const up = String(d.name || 'Standard').toUpperCase();
    if (dimByName.has(up)) { mapSrc(d.handle, dimByName.get(up)); return; }
    const name = up === 'STANDARD' ? 'Standard' : cleanName('dimstyle', d.name, 'Dimstyle');
    const h = next(); mapSrc(d.handle, h);
    dimByName.set(up, h); dimByName.set(name.toUpperCase(), h);
    const vars = { ...(d.vars || {}) };
    dimstyles.push({ t: 'DIMSTYLE', h, owner: H.dimstyleCtl, name, vars, txsty: styleRef(vars.DIMTXSTY) });
  };
  addDim((T.dimstyles || []).find((d) => /^standard$/i.test(d.name)) || { name: 'Standard' });
  for (const d of T.dimstyles || []) if (d.name) addDim(d);
  const dimRef = (name) => dimByName.get(String(name ?? 'Standard').toUpperCase()) || srcMap.get(hexKey(name)) || dimByName.get('STANDARD');

  // ---------------------------------------------------------------- named views (20.4.60); their extension dictionaries
  // (thumbnail and annotation-scale xrecords) are copied by nongraphic-write.js like any table entry's
  const views = [];
  for (const v of T.views || []) {
    if (!v || !v.name) continue;
    const h = next(); mapSrc(v.handle, h);
    views.push({ ...v, t: 'VIEW', h, owner: H.viewCtl, name: cleanName('view', v.name, 'View'), reactors: undefined, xdic: undefined, eed: undefined });
  }
  // named UCSs (20.4.62; 0.5 DR.8): name, origin, X and Y axes, elevation
  const ucsList = [];
  for (const u of T.ucs || []) {
    const p3 = (p) => (p && fin(p.x, p.y) ? { x: num(p.x), y: num(p.y), z: num(p.z) } : null);
    const o = p3(u?.origin), xa = p3(u?.xAxis), ya = p3(u?.yAxis);
    if (!u || !u.name || !o || !xa || !ya) continue;
    const h = next(); mapSrc(u.handle, h);
    ucsList.push({ t: 'UCS', h, owner: H.ucsCtl, name: cleanName('ucs', u.name, 'UCS'), origin: o, xAxis: xa, yAxis: ya, elevation: num(u.elevation) });
  }
  // the *Active viewports: a split screen (2–4 *Active records whose corners tile the window; the first is the current one)
  // is written as given, anything else as one *Active zoomed to the drawing (below)
  const corner = (p) => p && fin(p.x, p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1;
  const actIn = (T.vports || []).filter((v) => v && /^\*active$/i.test(v.name || '') && corner(v.lowerLeft) && corner(v.upperRight)
    && v.upperRight.x > v.lowerLeft.x && v.upperRight.y > v.lowerLeft.y);
  // (one record with its own view twist — a turned view, 0.5 DR.8 — is written as given too)
  const actives = actIn.length >= 2 && actIn.length <= 4 ? actIn.map((v, i) => ({ v, h: i ? next() : H.vport }))
    : actIn.length === 1 && num(actIn[0].twist) ? [{ v: actIn[0], h: H.vport }] : [{ v: null, h: H.vport }];

  // ---------------------------------------------------------------- blocks (records + their entities)
  const blocksIn = Array.isArray(model.blocks) ? model.blocks.slice() : [];
  const isMS = (b) => /^\*model_space$/i.test(b.name || '');
  const isPS = (b) => /^\*paper_space\d*$/i.test(b.name || '');
  if (!blocksIn.some(isMS)) blocksIn.unshift({ name: '*Model_Space', entities: [] });
  if (!blocksIn.some(isPS)) blocksIn.splice(1, 0, { name: '*Paper_Space', entities: [] });
  // order: *Model_Space, the paper spaces (first = the active one), then the rest as given
  const msB = blocksIn.find(isMS);
  const psBs = blocksIn.filter(isPS);
  psBs.sort((a, b) => (/^\*paper_space$/i.test(a.name) ? -1 : /^\*paper_space$/i.test(b.name) ? 1 : 0));
  const others = blocksIn.filter((b) => !isMS(b) && !isPS(b));
  const blockRecsByRecord = new Map((T.blockRecords || []).map((r) => [hexKey(r.handle), r]));
  const blocks = [];                               // {src, name, hdr, block, endblk, ents[], inserts[], kind}
  const blockByName = new Map();
  const addBlock = (src, kind, forcedName) => {
    let name;
    if (forcedName) { name = forcedName; reserve('block', name); }
    else if (String(src.name || '').startsWith('*')) {
      name = '*' + cleanName('anonymous', src.name.slice(1), 'U');
      if (name !== src.name) report.renamed.blocks[src.name] = name;
    } else {
      name = cleanName('block', src.name, 'Block');
      if (name !== src.name) { notes.renamedBlocks++; report.renamed.blocks[src.name] = name; }
    }
    const B = { src, name, kind, hdr: 0, block: 0, endblk: 0, ents: [], inserts: [], owned: [] };
    blocks.push(B);
    blockByName.set(String(src.name).toUpperCase(), B);
    blockByName.set(name.toUpperCase(), B);
    return B;
  };
  const MS = addBlock(msB, 'model', '*Model_Space');
  const PSs = psBs.map((b, i) => addBlock(b, i ? 'paper2' : 'paper', i ? '*Paper_Space' + (i - 1) : '*Paper_Space'));
  for (const b of others) if (!blockByName.has(String(b.name).toUpperCase())) addBlock(b, 'block');
  for (const B of blocks) {
    const rr = blockRecsByRecord.get(hexKey(B.src.record));
    if (rr) B.recSrc = rr;
  }

  // layouts: from the model, else Model + Layout1
  const layoutsIn = Array.isArray(model.layouts) ? model.layouts : [];
  const layouts = [];
  const blockForRecord = (rec) => { const k = hexKey(rec); return k ? PSs.find((B) => hexKey(B.src.record) === k) || null : null; };
  {
    const modelL = layoutsIn.find((l) => /^model$/i.test(l.name)) || { name: 'Model' };
    layouts.push({ src: modelL, name: 'Model', tab: 0, B: MS });
    const paperLs = layoutsIn.filter((l) => !/^model$/i.test(l.name));
    paperLs.sort((a, b) => num(a.tabOrder, 1) - num(b.tabOrder, 1));
    const usedB = new Set();
    paperLs.forEach((l, i) => {
      let B = blockForRecord(l.block);
      if (!B || usedB.has(B)) B = PSs.find((x) => !usedB.has(x)) || null;
      if (!B) { B = addBlock({ name: '*Paper_Space' + (PSs.length - 1), entities: [] }, 'paper2', '*Paper_Space' + (PSs.length - 1)); PSs.push(B); }
      usedB.add(B);
      const lname = cleanName('layout', l.name, 'Layout' + (i + 1));
      if (lname !== l.name) report.renamed.layouts[l.name] = lname;
      layouts.push({ src: l, name: lname, tab: i + 1, B });
    });
    if (layouts.length === 1) layouts.push({ src: { name: 'Layout1' }, name: 'Layout1', tab: 1, B: PSs[0] });
    // make sure the active paper space is the first paper layout's block
    const first = layouts[1].B;
    if (first !== PSs[0]) { const i = PSs.indexOf(first); [PSs[0], PSs[i]] = [PSs[i], PSs[0]]; }
    PSs.forEach((B, i) => { B.kind = i ? 'paper2' : 'paper'; B.name = i ? '*Paper_Space' + (i - 1) : '*Paper_Space'; });
    for (const L of layouts) L.h = next();
    // paper spaces with no layout get one, so every *Paper_Space block is reachable
    for (const B of PSs) if (!layouts.some((L) => L.B === B)) { const L = { src: { name: 'Layout' + layouts.length }, name: cleanName('layout', 'Layout' + layouts.length, 'Layout'), tab: layouts.length, B, h: next() }; layouts.push(L); }
  }

  // ---------------------------------------------------------------- entities → records
  const skipped = {};
  const skip = (type) => { skipped[type] = (skipped[type] || 0) + 1; };
  const count = (type) => { report.counts[type] = (report.counts[type] || 0) + 1; };
  const color = (c) => {
    c = c === undefined || c === null ? { index: 256 } : typeof c === 'number' ? { index: c } : c;
    if (c.rgb !== undefined && !r2004) { lostRgb++; return { index: aciFromRgb(c.rgb) }; }   // R2000 has no true colour
    return c;
  };
  const transparency = (t) => {
    if (t === undefined || t === null) return undefined;
    const v = t >>> 0;
    if ((v & 0xFF000000) >>> 0 === 0x02000000) return (0x03000000 | (v & 0xFF)) >>> 0;
    if (v === 0x01000000 || v === 0) return 0x01000000;
    return undefined;
  };
  const eedOf = (x) => {
    if (!x || typeof x !== 'object') return undefined;
    const out = [];
    for (const [app, items] of Object.entries(x)) if (Array.isArray(items) && items.length) out.push({ app: addApp(app), items });
    return out.length ? out : undefined;
  };
  /** Common entity fields of a record. */
  const common = (e, t, owner) => ({
    t, h: next(), owner, layer: layerRef(e.layer), ltype: ltypeRef(e.linetype), color: color(e.color), transparency: transparency(e.transparency),
    ltscale: num(e.ltscale, 1), lw: lwIndex(e.lineweight), invisible: !!e.invisible, eed: eedOf(e.xdata),
  });
  const P3 = (p) => (p ? { x: num(p.x), y: num(p.y), z: num(p.z) } : { x: 0, y: 0, z: 0 });
  const okP = (p) => p && fin(p.x, p.y);
  const textFields = (e) => ({
    insert: P3(e.insert), align: e.align ? P3(e.align) : null, height: num(e.height, 0.2), value: String(e.value ?? e.text ?? ''),
    rotation: num(e.rotation), widthFactor: num(e.widthFactor, 1), oblique: num(e.oblique), style: styleRef(e.style),
    hAlign: e.hAlign | 0, vAlign: e.vAlign | 0, generation: e.generation | 0, thickness: num(e.thickness), extrusion: e.extrusion,
  });
  // builder M (nongraphic-write.js): multileaders, raw/proxy entities, the source's non-graphical objects
  const X = extendWriter({ model, version, report, next, srcMap, mapSrc, hexKey, common, eedOf, layerRef, ltypeRef, styleRef, blockByName, blocks, H });
  const TBL = tableWriter({ model, version, report, next, srcMap, mapSrc, hexKey, styleRef, ltypeRef, blockByName, blocks });   // builder T (table-write.js)
  const SOL = solidWriter({ version, report, next, srcMap, hexKey, common, eedOf, aciFromRgb });   // builder S (solid-write.js)
  const SURF = surfaceWriter({ version, report, next, srcMap, hexKey, model, common }, SOL);   // surface-write.js

  /** One model entity → [records] (the first is the entity; sub-objects follow). Returns null to skip. */
  function convert(e, owner) {
    let type = String(e.type || '').toUpperCase();
    if (type === 'DIMENSION') type = DIM_TYPES[(e.dimType ?? 0) & 7] || 'DIMENSION_LINEAR';
    if (type === 'POLYLINE') type = e.flags & 64 ? 'POLYLINE_PFACE' : e.flags & 16 ? 'POLYLINE_MESH' : e.flags & 8 ? 'POLYLINE_3D' : 'POLYLINE_2D';
    const c = (t) => common(e, t, owner);
    const xr = X.convert(e, type, owner, c);
    if (xr !== undefined) return xr;
    if (type === 'ACAD_TABLE') return TBL.convert(e, owner, c);   // table-write.js: the table data and its *T block
    { const su = SURF.convert(e, type, owner, c); if (su !== undefined) return su; }   // surface-write.js
    { const sr = SOL.convert(e, type, owner, c); if (sr !== undefined) return sr; }   // solid-write.js
    switch (type) {
      case 'LINE':
        if (!okP(e.start) || !okP(e.end)) return null;
        return [{ ...c('LINE'), start: P3(e.start), end: P3(e.end), thickness: num(e.thickness), extrusion: e.extrusion }];
      case 'POINT':
        if (!okP(e.position)) return null;
        return [{ ...c('POINT'), position: P3(e.position), thickness: num(e.thickness), extrusion: e.extrusion, xAxisAngle: num(e.xAxisAngle) }];
      case 'CIRCLE':
        if (!okP(e.center) || !(e.radius > 0)) return null;
        return [{ ...c('CIRCLE'), center: P3(e.center), radius: e.radius, thickness: num(e.thickness), extrusion: e.extrusion }];
      case 'ARC':
        if (!okP(e.center) || !(e.radius > 0) || !fin(e.startAngle, e.endAngle)) return null;
        return [{ ...c('ARC'), center: P3(e.center), radius: e.radius, startAngle: e.startAngle, endAngle: e.endAngle, thickness: num(e.thickness), extrusion: e.extrusion }];
      case 'ELLIPSE': {
        if (!okP(e.center) || !okP(e.majorAxis) || !(e.ratio > 0)) return null;
        let { majorAxis: maj, ratio, startParam: s = 0, endParam: en = 2 * Math.PI } = e;
        if (ratio > 1) { maj = { x: -maj.y * ratio, y: maj.x * ratio, z: num(maj.z) * ratio }; ratio = 1 / ratio; s -= Math.PI / 2; en -= Math.PI / 2; }
        return [{ ...c('ELLIPSE'), center: P3(e.center), majorAxis: P3(maj), ratio, startParam: s, endParam: en, extrusion: e.extrusion }];
      }
      case 'RAY': case 'XLINE': {
        if (!okP(e.start) || !okP(e.direction)) return null;
        const d = P3(e.direction), n = Math.hypot(d.x, d.y, d.z);
        if (!(n > 0)) return null;
        return [{ ...c(type), start: P3(e.start), direction: { x: d.x / n, y: d.y / n, z: d.z / n } }];   // a unit vector, as DXF 11 is
      }
      case 'SOLID': case 'TRACE': case '3DFACE': {
        const pts = (e.points || []).filter(okP).map(P3);
        if (pts.length < 3) return null;
        while (pts.length < 4) pts.push(pts[pts.length - 1]);
        return [{ ...c(type), points: pts, thickness: num(e.thickness), extrusion: e.extrusion, invisibleEdges: e.invisibleEdges | 0, elevation: num(e.elevation, pts[0].z) }];
      }
      case 'LWPOLYLINE': {
        const v = (e.vertices || []).filter(okP);
        if (v.length < 2) return null;
        return [{ ...c('LWPOLYLINE'), vertices: v, closed: e.closed !== undefined ? !!e.closed : !!(e.flags & 512), constantWidth: num(e.constantWidth), elevation: num(e.elevation),
          thickness: num(e.thickness), extrusion: e.extrusion, plinegen: !!e.plinegen }];
      }
      case 'POLYLINE_2D': case 'POLYLINE_3D': {
        const v = (e.vertices || []).filter(okP);
        if (v.length < 2) return null;
        const is3d = type === 'POLYLINE_3D';
        const head = { ...c(type), closed: e.closed !== undefined ? !!e.closed : !!(e.flags & 1) };
        const vt = is3d ? 'VERTEX_3D' : 'VERTEX_2D';
        const verts = v.map((p) => ({ ...common(e, vt, head.h), mode: 0, point: P3(p), flags: is3d ? 32 : (p.flags | 0), bulge: num(p.bulge), startWidth: num(p.startWidth), endWidth: num(p.endWidth), id: p.id | 0, tangent: num(p.tangent) }));
        const seq = { ...common(e, 'SEQEND', head.h), mode: 0 };
        if (is3d) Object.assign(head, { splineFlags: (e.flags & 4) ? 1 : 0 });
        else Object.assign(head, { flags: (e.flags | 0) | (head.closed ? 1 : 0), curveType: e.curveType | 0, startWidth: num(e.startWidth), endWidth: num(e.endWidth), thickness: num(e.thickness), elevation: num(e.elevation), extrusion: e.extrusion });
        head.vertices = verts.map((x) => x.h); head.seqend = seq.h;
        return [head, ...verts, seq];
      }
      case 'POLYLINE_PFACE': {
        const v = (e.vertices || []).filter(okP), faces = e.faces || [];
        if (v.length < 3 || !faces.length) return null;
        const head = { ...c(type), numVerts: v.length, numFaces: faces.length };
        const verts = v.map((p) => ({ ...common(e, 'VERTEX_PFACE', head.h), mode: 0, point: P3(p), flags: 192 }));
        const fr = faces.map((f) => ({ ...common(e, 'VERTEX_PFACE_FACE', head.h), mode: 0, indices: (f.indices || f).slice(0, 4).concat([0, 0, 0, 0]).slice(0, 4) }));
        const seq = { ...common(e, 'SEQEND', head.h), mode: 0 };
        head.vertices = [...verts, ...fr].map((x) => x.h); head.seqend = seq.h;
        return [head, ...verts, ...fr, seq];
      }
      case 'POLYLINE_MESH': {
        const v = (e.vertices || []).filter(okP);
        const m = e.m | 0, n = e.n | 0;
        if (!m || !n || v.length !== m * n) return null;
        const head = { ...c(type), flags: (e.flags | 0) | 16, curveType: e.curveType | 0, m, n, mDensity: e.mDensity | 0, nDensity: e.nDensity | 0 };
        const verts = v.map((p) => ({ ...common(e, 'VERTEX_MESH', head.h), mode: 0, point: P3(p), flags: 64 }));
        const seq = { ...common(e, 'SEQEND', head.h), mode: 0 };
        head.vertices = verts.map((x) => x.h); head.seqend = seq.h;
        return [head, ...verts, seq];
      }
      case 'TEXT':
        if (!okP(e.insert) || !(e.height > 0)) return null;
        return [{ ...c('TEXT'), ...textFields(e) }];
      case 'ATTDEF':
        if (!okP(e.insert) || !(e.height > 0) || !e.tag) return null;
        return [{ ...c('ATTDEF'), ...textFields(e), tag: tagOf(e.tag), prompt: String(e.prompt ?? ''), flags: e.flags | 0, lockPosition: !!e.lockPosition }];
      case 'MTEXT':
        if (!okP(e.insert)) return null;
        return [{ ...c('MTEXT'), insert: P3(e.insert), xAxis: e.xAxis ? P3(e.xAxis) : null, rotation: num(e.rotation), width: num(e.width), height: num(e.height, 0.2),
          attach: e.attach | 0 || 1, direction: e.direction | 0 || 1, value: String(e.value ?? e.text ?? ''), style: styleRef(e.style), lineSpacing: num(e.lineSpacing, 1),
          lineSpacingStyle: e.lineSpacingStyle | 0 || 1, extWidth: num(e.extWidth), extHeight: num(e.extHeight), rectHeight: num(e.rectHeight), extrusion: e.extrusion,
          backgroundFlags: e.backgroundFlags | 0, backgroundScale: num(e.backgroundScale, 1.5), backgroundColor: e.backgroundColor, backgroundTransparency: e.backgroundTransparency | 0 }];
      case 'INSERT': case 'MINSERT': {
        const B = blockByName.get(String(e.block ?? '').toUpperCase()) || blocks.find((x) => hexKey(x.src.record) === hexKey(e.block));
        if (!B || B.kind !== 'block') return 'INSERT of a block the drawing does not define';
        if (!okP(e.insert)) return null;
        const head = { ...c(type), insert: P3(e.insert), scale: { x: num(e.scale?.x, 1), y: num(e.scale?.y, 1), z: num(e.scale?.z, 1) }, rotation: num(e.rotation),
          extrusion: e.extrusion, blockRef: B, cols: e.cols | 0 || 1, rows: e.rows | 0 || 1, colSpacing: num(e.colSpacing), rowSpacing: num(e.rowSpacing) };
        const atts = (e.attribs || []).filter((a) => okP(a.insert) && a.height > 0 && a.tag)
          .map((a) => ({ ...common({ ...e, ...a, layer: a.layer ?? e.layer, color: a.color ?? e.color }, 'ATTRIB', head.h), mode: 0, ...textFields(a), tag: tagOf(a.tag), flags: a.flags | 0, lockPosition: !!a.lockPosition }));
        const seq = atts.length ? { ...common(e, 'SEQEND', head.h), mode: 0 } : null;
        head.attribs = atts.map((x) => x.h); head.seqend = seq ? seq.h : 0;
        B.inserts.push(head.h);
        if (atts.length) report.counts.ATTRIB = (report.counts.ATTRIB || 0) + atts.length;
        return [head, ...atts, ...(seq ? [seq] : [])];
      }
      case 'DIMENSION_LINEAR': case 'DIMENSION_ALIGNED': case 'DIMENSION_ANG2LN': case 'DIMENSION_DIAMETER': case 'DIMENSION_RADIUS':
      case 'DIMENSION_ANG3PT': case 'DIMENSION_ORDINATE': case 'ARC_DIMENSION': case 'LARGE_RADIAL_DIMENSION': {
        const B = blockByName.get(String(e.block ?? '').toUpperCase()) || blocks.find((x) => hexKey(x.src.record) === hexKey(e.block));
        // a dimension whose source has no block (a null reference, as in civil_example-imperial.dwg) is written so too
        if ((!B || B.kind !== 'block') && e.block) return 'DIMENSION without its block';
        // DXF 70: the type in the low bits, 32 block used by this dimension only, 64 ordinate X, 128 user text position
        const f70 = e.flags ?? e.dimType ?? 0;
        // 10, 13, 14 and 15 keep their DXF meaning; the radius/diameter "chord point" is the 15 point (model: center)
        const chord = e.chordPoint ?? (type === 'DIMENSION_RADIUS' || type === 'DIMENSION_DIAMETER' ? e.center : e.xline1);
        return [{ ...c(type), blockRef: B, dimstyle: dimRef(e.style), defPoint: P3(e.defPoint), textMid: P3(e.textMid), insert: e.insert ? P3(e.insert) : null,
          xline1: P3(e.xline1), xline2: P3(e.xline2), center: P3(e.center ?? e.xline1End), arcPoint: P3(e.arcPoint), chordPoint: P3(chord),
          angle: num(e.angle), obliqueAngle: num(e.obliqueAngle), leaderLen: num(e.leaderLen), measurement: num(e.measurement), text: String(e.text ?? ''),
          attach: e.attach | 0 || 5, textRotation: num(e.textRotation ?? e.rotation), horizDir: num(e.horizDir), extrusion: e.extrusion,
          insScale: e.insScale, insRotation: num(e.insRotation), lineSpacing: num(e.lineSpacing, 1), lineSpacingStyle: e.lineSpacingStyle | 0 || 1,
          flipArrow1: !!e.flipArrow1, flipArrow2: !!e.flipArrow2,
          ordinateX: !!e.ordinateX || !!(f70 & 64), flags1: ((f70 & 128) ? 0 : 1) | ((f70 & 32) ? 2 : 0),
          isPartial: !!e.isPartial, arcStart: num(e.arcStart), arcEnd: num(e.arcEnd), hasLeader: !!e.hasLeader, leader1: P3(e.leader1), leader2: P3(e.leader2),
          overrideCenter: P3(e.overrideCenter), jogPoint: P3(e.jogPoint) }];
      }
      case 'LEADER': {
        const v = (e.vertices || []).filter(okP);
        if (v.length < 2) return null;
        return [{ ...c('LEADER'), vertices: v.map(P3), annotType: e.annotType ?? 3, pathType: e.pathType | 0, origin: e.origin ? P3(e.origin) : P3(v[0]),
          extrusion: e.extrusion, xDirection: e.xDirection, blockOffset: e.blockOffset, endPointProj: e.endPointProj, boxHeight: num(e.boxHeight), boxWidth: num(e.boxWidth),
          hookLineOnX: !!e.hookLineOnX, arrowhead: e.arrowhead !== false, annotationSrc: e.annotation, dimstyle: dimRef(e.style) }];
      }
      case 'IMAGE': case 'WIPEOUT': {
        if (!okP(e.insert) || !okP(e.u) || !okP(e.v)) return null;
        let def = 0, reactor = null;
        const head = { ...c(type), classVersion: e.classVersion | 0, insert: P3(e.insert), u: P3(e.u), v: P3(e.v), size: e.size, displayFlags: e.displayFlags ?? 7,
          clipping: !!e.clipping, brightness: e.brightness ?? 50, contrast: e.contrast ?? 50, fade: e.fade | 0, clipMode: !!e.clipMode, clipType: e.clipType, clip: e.clip || [] };
        if (type === 'IMAGE') {
          const src = imageDefs.get(hexKey(e.def));
          if (!src) return 'IMAGE whose image definition is not in the model';
          def = imageDef(src);
          reactor = { t: 'IMAGEDEF_REACTOR', h: next(), owner: head.h, classVersion: 2 };
          def.reactors.push(reactor.h);
        } else needWipeoutVars = true;
        head.def = def.h || 0; head.defReactor = reactor ? reactor.h : 0;
        return reactor ? [head, reactor] : [head];
      }
      case 'TOLERANCE':
        if (!okP(e.insert)) return null;
        return [{ ...c('TOLERANCE'), insert: P3(e.insert), xDirection: e.xDirection, extrusion: e.extrusion, text: String(e.text ?? ''), dimstyle: dimRef(e.style) }];
      case 'MLINE': {
        const v = (e.vertices || []).filter((x) => okP(x.point));
        if (v.length < 2) return null;
        // only the Standard multiline style (two elements) is written: a vertex must carry two element lines
        const lines = v[0].lines?.length ?? 2;
        if (lines !== 2 || v.some((x) => (x.lines?.length ?? 2) !== 2)) return 'MLINE (multiline style other than Standard)';
        return [{ ...c('MLINE'), scale: num(e.scale, 1), justification: e.justification | 0, base: P3(e.base ?? v[0].point), extrusion: e.extrusion, closed: !!e.closed,
          lines: 2, vertices: v.map((x) => ({ point: P3(x.point), direction: P3(x.direction), miter: P3(x.miter), lines: x.lines })), style: H.mlstyle }];
      }
      case 'SHAPE': {
        if (!okP(e.insert)) return null;
        const st = styleByName.get(String(e.style ?? '').toUpperCase()) || srcMap.get(hexKey(e.style));
        if (!st) return 'SHAPE (its shape file is not in the styles table)';
        return [{ ...c('SHAPE'), insert: P3(e.insert), scale: num(e.scale, 1), rotation: num(e.rotation), widthFactor: num(e.widthFactor, 1), oblique: num(e.oblique),
          thickness: num(e.thickness), shapeNumber: e.shapeNumber | 0, extrusion: e.extrusion, style: st }];
      }
      case 'HATCH': {
        const loops = (e.loops || []).map((l) => {
          if (l.polyline || l.vertices) { const pl = l.polyline || { vertices: l.vertices, closed: l.closed }; const v = (pl.vertices || []).filter(okP); return v.length >= 2 ? { flags: l.flags | 0, polyline: { vertices: v, closed: pl.closed !== false } } : null; }
          const edges = (l.edges || []).filter((x) => x && x.type);
          return edges.length ? { flags: l.flags | 0, edges } : null;
        }).filter(Boolean);
        if (!loops.length) return null;
        return [{ ...c('HATCH'), pattern: e.pattern || (e.solid ? 'SOLID' : 'ANSI31'), solid: !!e.solid, style: e.style | 0, patternType: e.patternType ?? 1,
          angle: num(e.angle), scale: num(e.scale, 1), double: !!e.double, lines: e.lines || e.patternLines || [], loops, seeds: (e.seeds || []).filter(okP), gradient: e.gradient,
          elevation: num(e.elevation), extrusion: e.extrusion }];
      }
      case 'SPLINE': {
        // A fit-point spline whose control points the reader computed is written back as fit data (as drawn).
        const fit = (e.fit || []).filter(okP), ctrl = e.controlComputed && fit.length >= 2 ? [] : (e.control || []).filter(okP);
        if (ctrl.length < 2 && fit.length < 2) return null;
        return [{ ...c('SPLINE'), degree: e.degree | 0 || 3, flags: e.flags | 0, knotParam: e.knotParam, knots: ctrl.length ? e.knots || [] : [], weights: e.weights, control: ctrl.map((p, i) => ({ ...P3(p), w: p.w ?? e.weights?.[i] })),
          fit: fit.map(P3), startTangent: e.startTangent, endTangent: e.endTangent, fitTolerance: num(e.tolerances?.fit ?? e.fitTolerance),
          knotTolerance: num(e.tolerances?.knot ?? e.knotTolerance, 1e-10), controlTolerance: num(e.tolerances?.control ?? e.controlTolerance, 1e-10) }];
      }
      case 'VIEWPORT':
        if (!okP(e.center)) return null;
        return [{ ...c('VIEWPORT'), center: P3(e.center), width: num(e.width, 1), height: num(e.height, 1), viewCenter: P3(e.viewCenter), viewTarget: P3(e.viewTarget),
          viewHeight: num(e.viewHeight, num(e.height, 1)), twist: num(e.twist), status: e.status ?? 0x8060, id: e.id | 0,
          frozenLayers: (e.frozenLayers || []).map((x) => srcMap.get(hexKey(x)) || layerByName.get(x)?.h).filter(Boolean) }];
      default:
        return type || '(no type)';   // unknown type → skipped and counted
    }
  }
  const tagOf = (t) => String(t).toUpperCase().replace(/\s+/g, '_').replace(/[\x00-\x1f]/g, '') || 'TAG';
  // raster image definitions (model.objects IMAGEDEF), written once each into ACAD_IMAGE_DICT
  const imageDefs = new Map((model.objects || []).filter((o) => o.type === 'IMAGEDEF').map((o) => [hexKey(o.handle), o]));
  const writtenDefs = new Map();                   // source handle → record
  const defNames = new Set();
  let needWipeoutVars = false;
  const imageDef = (src) => {
    const k = hexKey(src.handle);
    if (writtenDefs.has(k)) return writtenDefs.get(k);
    let base = String(src.fileName || 'image').split(/[\\/]/).pop().replace(/\.[^.]*$/, '').replace(BAD_NAME, '_') || 'image', n = base, i = 2;
    while (defNames.has(n.toUpperCase())) n = base + '_' + i++;
    defNames.add(n.toUpperCase());
    const rec = { t: 'IMAGEDEF', h: next(), name: n, classVersion: src.classVersion | 0, size: src.size, fileName: src.fileName || '', loaded: src.loaded !== false,
      resUnits: src.resUnits | 0, pixelSize: src.pixelSize, reactors: [], ownerCode: HARD_OWN_CODE };
    writtenDefs.set(k, rec);
    mapSrc(src.handle, rec.h);
    return rec;
  };

  // allocate block handles and convert their entities, block by block (header, BLOCK, contents, ENDBLK)
  let invalid = 0;
  for (const B of blocks) {
    B.hdr = next(); B.block = next();
    mapSrc(B.src.record, B.hdr); mapSrc(B.src.handle, B.block);
    const ownerFor = B.kind === 'model' || B.kind === 'paper' ? 0 : B.hdr;
    const mode = B.kind === 'model' ? 2 : B.kind === 'paper' ? 1 : 0;
    for (const e of B.src.entities || []) {
      const out = convert(e, ownerFor || B.hdr);
      if (out === null) { invalid++; continue; }
      if (typeof out === 'string') { skip(out); continue; }
      out[0].mode = mode;
      if (!mode) out[0].owner = B.hdr;
      mapSrc(e.handle, out[0].h);
      B.ents.push(out);
      count(out[0].t);
    }
    B.endblk = next();
    mapSrc(B.src.endHandle, B.endblk);
  }
  const notesOut = report.notes;
  if (invalid) notesOut.push(invalid + ' item' + (invalid === 1 ? ' was' : 's were') + ' left out (empty or not drawable).');
  for (const [t, n] of Object.entries(skipped)) notesOut.push(/ /.test(t) ? `${n} × ${t}: not written.` : `${n} ${t} ${n === 1 ? 'entity was' : 'entities were'} not written (not supported by the writer yet).`);
  report.skipped = skipped;
  if (notes.renamedLayers) notesOut.push(notes.renamedLayers + ' layer name' + (notes.renamedLayers === 1 ? ' was' : 's were') + ' changed to fit DWG naming rules (a linked drawing\'s "Xref|Layer" becomes "Xref$0$Layer", as when AutoCAD binds it).');
  if (notes.tables) notesOut.push(`${notes.tables} table${notes.tables === 1 ? ' was' : 's were'} written as a reference to the block that draws ${notes.tables === 1 ? 'it' : 'them'} (it looks the same; its cells are no longer editable as a table).`);
  if (notes.renamedBlocks) notesOut.push(notes.renamedBlocks + ' block name' + (notes.renamedBlocks === 1 ? ' was' : 's were') + ' changed to fit DWG naming rules.');
  const nObjects = (model.objects || []).length;
  if (nObjects && false) notesOut.push(`${nObjects} non-graphical object${nObjects === 1 ? '' : 's'} (dictionaries, xrecords, groups, …) from the source ${nObjects === 1 ? 'was' : 'were'} not copied; the writer makes its own.`);

  // ---------------------------------------------------------------- extents (model space)
  let ext = null;
  {
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    const g = (p, r = 0) => { if (!p || !fin(p.x, p.y)) return; const z = num(p.z); minX = Math.min(minX, p.x - r); maxX = Math.max(maxX, p.x + r); minY = Math.min(minY, p.y - r); maxY = Math.max(maxY, p.y + r); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); };
    const he = hdrIn.EXTMIN, hx = hdrIn.EXTMAX;
    if (he && hx && fin(he.x, he.y, hx.x, hx.y) && he.x <= hx.x && he.y <= hx.y && Math.abs(he.x) < 1e19) { g(he); g(hx); }
    else for (const list of MS.ents) {
      const r = list[0];
      switch (r.t) {
        case 'LINE': g(r.start); g(r.end); break;
        case 'CIRCLE': case 'ARC': g(r.center, r.radius); break;
        case 'ELLIPSE': g(r.center, Math.hypot(r.majorAxis.x, r.majorAxis.y)); break;
        case 'LWPOLYLINE': for (const p of r.vertices) g({ x: p.x, y: p.y, z: r.elevation }); break;
        case 'POLYLINE_2D': case 'POLYLINE_3D': case 'POLYLINE_PFACE': case 'POLYLINE_MESH': for (const v of list.slice(1)) if (v.point) g(v.point); break;
        case 'POINT': g(r.position); break;
        case 'TEXT': case 'MTEXT': case 'INSERT': case 'MINSERT': g(r.insert); break;
        case 'SOLID': case 'TRACE': case '3DFACE': for (const p of r.points) g(p); break;
        case 'HATCH': for (const l of r.loops) { if (l.polyline) for (const p of l.polyline.vertices) g(p); } break;
        case 'SPLINE': for (const p of r.control.length ? r.control : r.fit) g(p); break;
        default: if (r.defPoint) g(r.defPoint);
      }
    }
    if (Number.isFinite(minX)) ext = { min: { x: minX, y: minY, z: minZ }, max: { x: maxX, y: maxY, z: maxZ } };
  }

  // ---------------------------------------------------------------- records for the fixed objects
  const classes = [];
  const classNums = new Map();
  const classNum = (t) => {
    if (!classNums.has(t)) { const c = { ...CLASSED[t], num: 500 + classes.length, count: 0 }; classes.push(c); classNums.set(t, c.num); }
    const c = classes.find((x) => x.num === classNums.get(t)); c.count++;
    return classNums.get(t);
  };
  // fix block names now that paper spaces are settled
  for (const B of blocks) blockByName.set(B.name.toUpperCase(), B);
  const userBlocks = blocks.filter((B) => B.kind === 'block' || B.kind === 'paper2');
  push({ t: 'BLOCK_CONTROL', h: H.blockCtl, owner: 0, entries: userBlocks.map((B) => B.hdr), hardEntries: [MS.hdr, PSs[0].hdr] });
  push({ t: 'LAYER_CONTROL', h: H.layerCtl, owner: 0, entries: layers.map((L) => L.h) });
  push({ t: 'STYLE_CONTROL', h: H.styleCtl, owner: 0, entries: styles.map((s) => s.h) });
  push({ t: 'LTYPE_CONTROL', h: H.ltypeCtl, owner: 0, count: 1 + ltypes.length, entries: [H.ltContinuous, ...ltypes.map((l) => l.h)], hardEntries: [H.ltByLayer, H.ltByBlock] });
  push({ t: 'VIEW_CONTROL', h: H.viewCtl, owner: 0, entries: views.map((v) => v.h) });
  push({ t: 'UCS_CONTROL', h: H.ucsCtl, owner: 0, entries: ucsList.map((u) => u.h) });
  push({ t: 'VPORT_CONTROL', h: H.vportCtl, owner: 0, entries: actives.map((a) => a.h) });
  push({ t: 'APPID_CONTROL', h: H.appidCtl, owner: 0, entries: appids.map((a) => a.h) });
  push({ t: 'DIMSTYLE_CONTROL', h: H.dimstyleCtl, owner: 0, entries: dimstyles.map((d) => d.h) });
  if (!r2004) push({ t: 'VPENT_CONTROL', h: H.vpentCtl, owner: 0, entries: [] });
  // dictionaries
  const layoutItems = layouts.map((L) => [L.name, L.h]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const nodItems = [['ACAD_GROUP', H.groupDict], ['ACAD_LAYOUT', H.layoutDict], ['ACAD_MLINESTYLE', H.mlsDict], ['ACAD_PLOTSTYLENAME', H.plotStyleDict]];
  const extraObjects = [];
  if (writtenDefs.size) {
    const dictH = next(), varsH = next();
    nodItems.push(['ACAD_IMAGE_DICT', dictH], ['ACAD_IMAGE_VARS', varsH]);
    const defs = [...writtenDefs.values()];
    extraObjects.push({ t: 'DICTIONARY', h: dictH, owner: H.nod, reactors: [H.nod], items: defs.map((d) => [d.name, d.h]), hardOwner: true });
    extraObjects.push({ t: 'RASTERVARIABLES', h: varsH, owner: H.nod, reactors: [H.nod] });
    for (const d of defs) { d.owner = dictH; d.reactors.push(dictH); extraObjects.push(d); }
  }
  if (needWipeoutVars) {
    const h = next();
    nodItems.push(['ACAD_WIPEOUT_VARS', h]);
    extraObjects.push({ t: 'WIPEOUTVARIABLES', h, owner: H.nod, reactors: [H.nod] });
  }
  push({ t: 'DICTIONARY', h: H.nod, owner: 0, items: nodItems.sort((a, b) => (a[0] < b[0] ? -1 : 1)) });
  for (const o of extraObjects) push(o);
  push({ t: 'DICTIONARY', h: H.groupDict, owner: H.nod, reactors: [H.nod], items: [] });
  push({ t: 'DICTIONARY', h: H.layoutDict, owner: H.nod, reactors: [H.nod], items: layoutItems });
  push({ t: 'DICTIONARY', h: H.mlsDict, owner: H.nod, reactors: [H.nod], items: [['Standard', H.mlstyle]] });
  push({ t: 'DICTIONARYWDFLT', h: H.plotStyleDict, owner: H.nod, reactors: [H.nod], items: [['Normal', H.plotStyleNormal]], defaultEntry: H.plotStyleNormal });
  push({ t: 'PLACEHOLDER', h: H.plotStyleNormal, owner: H.plotStyleDict, reactors: [H.plotStyleDict] });
  push({ t: 'MLINESTYLE', h: H.mlstyle, owner: H.mlsDict, reactors: [H.mlsDict], name: 'Standard', ltByLayer: H.ltByLayer });
  // linetypes
  push({ t: 'LTYPE', h: H.ltByBlock, owner: H.ltypeCtl, name: 'ByBlock', elements: [] });
  push({ t: 'LTYPE', h: H.ltByLayer, owner: H.ltypeCtl, name: 'ByLayer', elements: [] });
  push({ t: 'LTYPE', h: H.ltContinuous, owner: H.ltypeCtl, name: 'Continuous', description: 'Solid line', elements: [] });
  for (const l of ltypes) push(l);
  for (const L of layers) { if (L.xdep) L.xrefBlock = blockByName.get(L.xrefOf.toUpperCase())?.hdr || 0; push(L); }
  for (const s of styles) push(s);
  for (const a of appids) push(a);
  for (const d of dimstyles) push(d);
  for (const v of views) push(v);
  for (const u of ucsList) push(u);
  // the *Active viewport
  {
    const e = ext || { min: { x: 0, y: 0 }, max: { x: 12, y: 9 } };
    const aspect = 1.5;
    const vh = Math.max(e.max.y - e.min.y, (e.max.x - e.min.x) / aspect, 1e-6) * 1.05 || 1;
    const c0 = { x: (e.min.x + e.max.x) / 2, y: (e.min.y + e.max.y) / 2 };
    for (const { v, h } of actives) {
      if (!v) { push({ t: 'VPORT', h, owner: H.vportCtl, name: '*Active', viewHeight: vh, aspect, center: c0 }); continue; }
      const c = v.center || v.viewCenter, hgt = v.viewHeight, asp = v.aspect ?? v.aspectRatio;
      push({ t: 'VPORT', h, owner: H.vportCtl, name: '*Active', viewHeight: num(hgt) > 0 ? hgt : vh, aspect: num(asp) > 0 ? asp : aspect,
        center: c && fin(c.x, c.y) ? { x: c.x, y: c.y } : c0, lowerLeft: v.lowerLeft, upperRight: v.upperRight, twist: num(v.twist), eed: eedOf(v.xdata) });
    }
  }
  // layouts
  for (const L of layouts) {
    const s = L.src || {};
    const paperVps = [];
    push({ t: 'LAYOUT', h: L.h, owner: H.layoutDict, reactors: [H.layoutDict], name: L.name, tab: L.tab, block: L.B.hdr, paper: s.paper,
      plotFlags: s.plotFlags, limits: s.limits, insbase: s.insbase, extents: L.tab === 0 ? (ext || null) : null, viewports: paperVps,
      lastViewport: L.tab === 0 ? H.vport : 0 });
    L.B.layout = L.h;
  }
  // blocks and their entities
  for (const B of blocks) {
    const top = B.ents.map((list) => list[0]);
    const kind = B.kind;
    const src = B.recSrc || {};
    const hasAttrs = top.some((r) => r.t === 'ATTDEF');
    push({ t: 'BLOCK_HEADER', h: B.hdr, owner: H.blockCtl, name: B.name, anonymous: B.name.startsWith('*') && kind === 'block', hasAttrs,
      // an external reference (DXF 70 flag 4; the path field alone is no xref: dynamic blocks' copies fill it too): the
      // record says so and names the file; it owns no entities
      isXref: kind === 'block' && !!(B.src.flags & 4), overlaid: kind === 'block' && !!(B.src.flags & 4) && !!(B.src.flags & 8),
      base: B.src.base, xrefPath: kind === 'block' && (B.src.flags & 4) ? String(B.src.xrefPath || '') : '', description: B.src.description || '', owned: top.map((r) => r.h), inserts: kind === 'block' ? B.inserts : [],
      block: B.block, endblk: B.endblk, layout: B.layout || 0, insertUnits: src.insertUnits | 0, explodable: src.explodable, scalable: src.scalable,
      eed: eedOf(src.xdata) });   // a dynamic block's anonymous copy keeps its name (AcDbDynamicBlockTrueName[2]) and DesignCenter data
    const blockMode = kind === 'model' ? 2 : kind === 'paper' ? 1 : 0;
    push({ t: 'BLOCK', h: B.block, mode: blockMode, owner: blockMode ? 0 : B.hdr, layer: H.layer0, ltype: { flag: 0 }, color: { index: 256 }, lw: 29, name: B.name,
      ...(r2004 ? {} : { prev: 0, next: 0 }) });
    top.forEach((r, i) => {
      if (!r2004) { r.prev = i ? top[i - 1].h : 0; r.next = i < top.length - 1 ? top[i + 1].h : 0; }
    });
    for (const list of B.ents) {
      const [head, ...subs] = list;
      if (head.blockRef) head.block = head.blockRef.hdr; else if ('blockRef' in head) head.block = 0;
      push(head);
      // sub-entities: vertices / attribs chain among themselves, SEQEND last
      const chain = subs.filter((s) => s.t !== 'SEQEND');
      chain.forEach((s, i) => { if (!r2004) { s.prev = i ? chain[i - 1].h : 0; s.next = i < chain.length - 1 ? chain[i + 1].h : 0; } push(s); });
      for (const s of subs) if (s.t === 'SEQEND') { if (!r2004) { s.prev = 0; s.next = 0; } push(s); }
    }
    push({ t: 'ENDBLK', h: B.endblk, mode: blockMode, owner: blockMode ? 0 : B.hdr, layer: H.layer0, ltype: { flag: 0 }, color: { index: 256 }, lw: 29,
      ...(r2004 ? {} : { prev: 0, next: 0 }) });
  }

  TBL.finish({ recs, H });   // table styles, their dictionary, cell fields (table-write.js)
  X.finish({ recs, H, layouts });   // copies the source's objects (nongraphic-write.js)
  SOL.finish();   // history handles of copied objects (solid-write.js)
  SURF.finish({ recs });   // NURBSURFACE round-trip entries (surface-write.js)
  const handseed = seed;
  // ---------------------------------------------------------------- encode
  const info = VERSION_INFO[version];
  const ctx = { version, classNum, metric: hdrIn.MEASUREMENT !== undefined ? !!hdrIn.MEASUREMENT : ![1, 2, 3, 8, 9, 10].includes(hdrIn.INSUNITS | 0) && (hdrIn.INSUNITS | 0) !== 0,
    created, handseed, extents: ext, guid, dwgVersion: info.code, maint: info.maint };
  for (const r of recs) if (r.t === 'LEADER' && r.annotationSrc) r.annotation = srcMap.get(hexKey(r.annotationSrc)) || 0;
  // xdata handle references (1005 objects, 1003 layers) point into the source drawing: map them to the written
  // handles. An application's block that refers to something not written (a MATERIAL, a GROUP …) is dropped:
  // readers interpret some of it (the ODA reader refuses ACAD "RTMaterial" with a dangling handle).
  let droppedEed = 0;
  for (const r of recs) {
    if (!r.eed) continue;
    r.eed = r.eed.filter((blk) => {
      const items = [];
      for (const [code, v] of blk.items) {
        if (code === 1005 || code === 1003) {
          if (hexKey(v) === '0') { items.push([code, '0']); continue; }   // a null reference stays null (AcDbBlockRepETag …)
          const n = srcMap.get(hexKey(v));
          if (!n) { droppedEed++; return false; }
          items.push([code, n.toString(16).toUpperCase()]);
        } else items.push([code, v]);
      }
      blk.items = items;
      return true;
    });
    if (!r.eed.length) delete r.eed;
  }
  if (droppedEed) report.notes.push(msg('ccdwg.write.eed_dropped', { n: droppedEed }));
  const objects = [];
  let entities = 0;
  for (const r of recs) {
    const data = encodeObject(r, ctx);
    if (!data) { report.notes.push(`internal: no encoder for ${r.t}`); continue; }
    objects.push({ handle: r.h, data });
    if (!/CONTROL|^LAYER$|^STYLE$|^LTYPE$|^APPID$|^DIMSTYLE$|^VPORT$|^VIEW$|DICTIONARY|PLACEHOLDER|MLINESTYLE|LAYOUT|BLOCK_HEADER/.test(r.t)) entities++;
  }
  objects.sort((a, b) => a.handle - b.handle);
  const hv = { ...hdrIn };
  if (hv.INSUNITS === undefined) hv.INSUNITS = 0;
  if (hv.LUPREC === undefined) hv.LUPREC = ctx.metric ? 3 : 2;
  const Hh = { ...H, ...X.headerHandles, msBlockHdr: MS.hdr, psBlockHdr: PSs[0].hdr,
    clayer: layerByName.get(String(hdrIn.CLAYER ?? '0'))?.h || srcMap.get(hexKey(hdrIn.CLAYER)) || layerByNew.get(String(hdrIn.CLAYER))?.h || H.layer0,
    textstyle: styleRef(hdrIn.TEXTSTYLE), celtype: ltypeRef(hdrIn.CELTYPE).h || H.ltByLayer, dimstyleCur: dimRef(hdrIn.DIMSTYLE), cmlstyle: H.mlstyle };
  const header = encodeHeader(Hh, hv, ctx);
  const headerBytes = finishStreams(header);
  const cls = encodeClasses(classes, ctx);
  const classBytes = finishStreams(cls);
  const jd = { created: julian(created), updated: julian(created) };
  const parts = { header: headerBytes, classes: classBytes, objects, measurement: ctx.metric, jd, handseed,
    keys: [handseed, H.blockCtl, H.layerCtl, H.styleCtl, H.ltypeCtl, H.viewCtl, H.ucsCtl, H.vportCtl, H.appidCtl, H.dimstyleCtl, H.vpentCtl, H.nod, H.mlsDict, H.groupDict] };
  parts.acds = SOL.dataStorage();   // R2013+: AcDb:AcDsPrototype_1b (solid-write.js / acds.js), null without ACIS entities
  let bytes;
  if (version === 'AC1015') bytes = layoutR2000(parts);
  else if (version === 'AC1021') bytes = layoutR2007(parts, CW);
  else bytes = layoutR2004(parts, version);

  if (lostRgb) report.notes.push(msg('ccdwg.write.true_colours', { n: lostRgb }));
  if (encode1252.lost) report.notes.push(msg('ccdwg.write.chars_lost', { n: encode1252.lost }));
  report.objects = objects.length;
  report.entities = entities;
  return { bytes, report };
}

/**
 * The header / classes data with their streams joined. R2007+: the RL bit size at the start (already patched)
 * and the handle stream after the string stream; earlier versions keep handles inline (see encodeHeader).
 */
function finishStreams({ w }) {
  if (w.r2007) w.append(w.hnd);
  return w.bytes();
}

function guid() {
  const r = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(r); else for (let i = 0; i < 16; i++) r[i] = Math.floor(Math.random() * 256);
  const h = [...r].map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  return '{' + h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) + '}';
}

export { cleanText };
