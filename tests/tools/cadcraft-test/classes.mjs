#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * classes.mjs — CadCraft classes (0.8 SU.912, session sx-classes), in Node (no browser): the classes model (classes.js),
 * ByClass + resolveStyle, the walk.js / plot.js draw path, viewport class overrides (vpclass.js), the file round trip
 * (classes-file.js + each object's CADCRAFT_CLASS xdata) through DXF R12, DXF 2000 and DWG 2000–2018, and publishing a sheet
 * set to DWG (publish-set.js) when that module is there.
 *
 *   node tools/cadcraft-test/classes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const imp = (f) => import(pathToFileURL(APP + f).href);
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const section = (s) => console.log('\n== ' + s);

const en = JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8'));
const I18n = await imp('i18n.js');
I18n.init({ strings: en });
const { Doc } = await imp('doc.js');
const C = await imp('classes.js');
const V = await imp('vpclass.js');
const F = await imp('classes-file.js');
const { walk, frozenSet } = await imp('walk.js');
const { readDxf, writeDxf } = await imp('dxf.js');
const { writeDxf2000 } = await imp('dxf2000.js');
const { saveDwg } = await imp('dwg-save.js');
const { importDwg } = await imp('dwg-import.js');
const { readDwg } = await imp('dwg/read.js');
const Pl = await imp('plot.js');
const { builtinTable } = await imp('plotstyle.js');

const cls = (doc, e) => C.classOf(e);
const all = (doc) => [...doc.model.values()];

section('names');
ok(C.cleanName(' Lighting - Fixtures -Spot ') === 'Lighting-Fixtures-Spot', 'spaces round "-" go; levels kept');
ok(C.cleanName('none') === 'None' && C.cleanName('') === null && C.cleanName('A--B') === null && C.cleanName('A-') === null, 'none → None; empty levels refused');
ok(C.cleanName('Wände-Außen') === 'Wände-Außen', 'any language');
ok(C.parentOf('A-B-C') === 'A-B' && C.parentOf('A') === null && C.depth('A-B-C') === 2, 'parentOf / depth');
ok(C.isUnder('A-B-C', 'a-b') && C.isUnder('A-B', 'A-B') && !C.isUnder('A-BC', 'A-B'), 'isUnder: case-insensitive, whole levels only');

section('classes model: create, set class, rename (children follow), delete to None, undo');
const doc = new Doc();
doc.addLayer({ name: 'WALLS', color: 3, linetype: 'DASHED', lineweight: 0.35 });
let ids;
doc.change('seed', () => {
  ids = [
    doc.add({ type: 'line', layer: 'WALLS', x1: 0, y1: 0, x2: 10, y2: 0 }).id,
    doc.add({ type: 'line', layer: 'WALLS', x1: 0, y1: 5, x2: 10, y2: 5 }).id,
    doc.add({ type: 'circle', layer: 'WALLS', cx: 0, cy: 0, r: 2, color: 1 }).id,
    doc.add({ type: 'hatch', layer: 'WALLS', solid: true, loops: [[0, 0, 1, 0, 1, 1, 0, 1]] }).id,
    doc.add({ type: 'text', layer: 'WALLS', x: 0, y: 0, h: 2.5, s: 'Hi' }).id,
  ];
});
ok(C.classList(doc).length === 1 && C.classList(doc)[0].name === 'None', 'a new drawing has only None');
ok(all(doc).every((e) => C.classOf(e) === 'None' && !e.xd), 'objects start in None, with no xdata');
const u0 = doc.undoStack.length;
C.addClass(doc, { name: 'Lighting-Fixtures-Spot', color: 5 });
ok(C.classList(doc).map((c) => c.name).join('|') === 'None|Lighting|Lighting-Fixtures|Lighting-Fixtures-Spot', 'adding a class adds its parents, sorted, None first', C.classList(doc).map((c) => c.name).join('|'));
ok(doc.undoStack.length === u0 + 1, 'one undo step');
let threw = null; try { C.addClass(doc, 'lighting-fixtures-spot'); } catch (e) { threw = e.code; }
ok(threw === 'exists', 'a name already there (any case) is refused', threw);
C.addClass(doc, { name: 'Walls-Ext', color: '#AA0000', lt: 'CENTER', lw: 0.5, fill: 8, textStyle: 'Notes' });
ok(C.getClass(doc, 'walls-ext').color === '#aa0000' && C.getClass(doc, 'Walls-Ext').lw === 0.5, 'attributes kept, colour lower-cased');
const n1 = C.setClassOf(doc, [ids[0], ids[2], ids[3], ids[4]], 'Walls-Ext', { flags: C.BY_ALL, map: doc.model });
ok(n1 === 4 && C.classOf(doc.model.get(ids[0])) === 'Walls-Ext' && C.byClassOf(doc.model.get(ids[0])) === 31, 'Set class: 4 objects, every attribute ByClass');
ok(JSON.stringify(doc.model.get(ids[0]).xd) === '{"CADCRAFT_CLASS":[[1000,"Walls-Ext"],[1070,31]]}', 'kept as CADCRAFT_CLASS xdata: the name and the flags', JSON.stringify(doc.model.get(ids[0]).xd));
C.setClassOf(doc, [ids[1]], 'Lighting-Fixtures-Spot', { map: doc.model });
ok(C.byClassOf(doc.model.get(ids[1])) === 0, 'flags not given: the object keeps its own (none)');
// a block with an object in a class, and a sheet with a viewport overriding a class
doc.change('blk', () => {
  doc.defineBlock({ name: 'LAMP', base: { x: 0, y: 0 }, entities: [C.withClass({ type: 'circle', layer: '0', cx: 0, cy: 0, r: 1 }, 'Lighting-Fixtures', 0)] });
  doc.add({ type: 'insert', layer: 'WALLS', block: 'LAMP', x: 20, y: 0, sx: 1, sy: 1, rot: 0 });
  doc.setLayouts([{ name: 'A-101', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0 }, entities: new Map() }]);
});
const sheet = doc.layouts[0];
let vp;
doc.change('vp', () => { vp = doc.add({ type: 'viewport', x: 210, y: 150, w: 300, h: 200, cx: 5, cy: 0, s: 1 }, sheet.entities); });
V.setOverride(doc, vp.id, 'Lighting-Fixtures', { color: 2 }, { map: sheet.entities });
V.setOverride(doc, vp.id, 'Walls-Ext', { lw: 0.13 }, { map: sheet.entities });
ok(JSON.stringify(sheet.entities.get(vp.id).vpc) === '{"Lighting-Fixtures":{"color":2},"Walls-Ext":{"lw":0.13}}', 'viewport overrides on the viewport', JSON.stringify(sheet.entities.get(vp.id).vpc));
C.setActive(doc, 'Lighting-Fixtures-Spot');
const uses0 = C.classUses(doc);
ok(uses0.get('Walls-Ext') === 4 && uses0.get('Lighting-Fixtures-Spot') === 1 && uses0.get('Lighting-Fixtures') === 1, 'classUses counts model, sheets and block definitions', JSON.stringify([...uses0]));
const u1 = doc.undoStack.length;
const moved = C.renameClass(doc, 'Lighting-Fixtures', 'Light-Rig');
ok(C.classList(doc).map((c) => c.name).join('|') === 'None|Light|Light-Rig|Light-Rig-Spot|Lighting|Walls|Walls-Ext', 'rename: the child follows, the new parent is added, the old parent stays', C.classList(doc).map((c) => c.name).join('|'));
ok(moved === 3 && C.classOf(doc.model.get(ids[1])) === 'Light-Rig-Spot' && C.classOf(doc.blocks.get('LAMP').entities[0]) === 'Light-Rig', 'objects follow: the model, the block definition, and the viewport', String(moved));
ok(JSON.stringify(sheet.entities.get(vp.id).vpc) === '{"Light-Rig":{"color":2},"Walls-Ext":{"lw":0.13}}', 'the viewport override follows the rename');
ok(C.activeClass(doc) === 'Light-Rig-Spot', 'the active class follows');
ok(doc.undoStack.length === u1 + 1, 'rename is one undo step');
doc.undo();
ok(C.classOf(doc.model.get(ids[1])) === 'Lighting-Fixtures-Spot' && C.getClass(doc, 'Lighting-Fixtures') && !C.getClass(doc, 'Light-Rig') && C.classOf(doc.blocks.get('LAMP').entities[0]) === 'Lighting-Fixtures', 'undo puts table, objects and block back');
doc.redo();
ok(C.getClass(doc, 'Light-Rig-Spot') && C.classOf(doc.model.get(ids[1])) === 'Light-Rig-Spot', 'redo');
threw = null; try { C.renameClass(doc, 'Light-Rig', 'Walls'); } catch (e) { threw = e.code; } ok(threw === 'exists', 'rename onto another class refused');
threw = null; try { C.renameClass(doc, 'Light', 'Light-Rig-Spot-X'); } catch (e) { threw = e.code; } ok(threw === 'exists', 'rename under itself refused');
C.renameClass(doc, 'walls-ext', 'Walls-EXT');
ok(C.getClass(doc, 'Walls-EXT')?.name === 'Walls-EXT' && C.classOf(doc.model.get(ids[0])) === 'Walls-EXT', 'a rename that only changes the case is allowed');
C.renameClass(doc, 'Walls-EXT', 'Walls-Ext');
const delMoved = C.deleteClass(doc, 'Light');
ok(delMoved === 3 && C.classOf(doc.model.get(ids[1])) === 'None' && C.classOf(doc.blocks.get('LAMP').entities[0]) === 'None', 'delete: the class and its children go, their objects to None (2 objects + the viewport\'s override)', String(delMoved));
ok(!doc.model.get(ids[1]).xd, 'None with no flags = no xdata left');
ok(JSON.stringify(sheet.entities.get(vp.id).vpc) === '{"Walls-Ext":{"lw":0.13}}', 'a deleted class\'s viewport override goes');
ok(C.activeClass(doc) === 'None', 'the active class was deleted: back to None');
threw = null; try { C.deleteClass(doc, 'None'); } catch (e) { threw = e.code; } ok(threw === 'none', 'None cannot be deleted');
doc.undo();
ok(C.classOf(doc.model.get(ids[1])) === 'Light-Rig-Spot' && sheet.entities.get(vp.id).vpc['Light-Rig'], 'undo brings the class, its objects and override back');
C.addClass(doc, 'Keep');
C.deleteClass(doc, 'Light-Rig', { to: 'Keep' });
ok(C.classOf(doc.model.get(ids[1])) === 'Keep' && C.getClass(doc, 'Light') && !C.getClass(doc, 'Light-Rig'), 'delete with `to`: objects move to that class; the parent stays');
ok(!sheet.entities.get(vp.id).vpc['Keep'], 'the deleted class\'s override is dropped, not moved onto the other class');

section('ByClass and resolveStyle: object → class → layer, then the viewport\'s overrides');
const d2 = new Doc();
d2.addLayer({ name: 'L', color: 3, linetype: 'DASHED', lineweight: 0.35 });
C.addClass(d2, { name: 'K', color: 5, lt: 'CENTER', lw: 0.7, fill: '#00ff00', textStyle: 'Notes' });
const E = (o) => ({ type: 'line', layer: 'L', x1: 0, y1: 0, x2: 1, y2: 0, color: null, ...o });
const plain = E({});
const inK = C.withClass(E({}), 'K', 0);
const byK = C.withClass(E({}), 'K', C.BY.color | C.BY.lw);
const ownK = C.withClass(E({ color: 1, lw: 0.18 }), 'K', 0);
const ownByK = C.withClass(E({ color: 1, lw: 0.18, lt: 'HIDDEN' }), 'K', C.BY_ALL);
let s = C.resolveStyle(plain, d2);
ok(s.color === 3 && s.lt === 'DASHED' && s.lw === 0.35 && s.src.color === 'layer' && s.cls === 'None', 'no class: the layer\'s', JSON.stringify(s));
s = C.resolveStyle(inK, d2);
ok(s.color === 3 && s.src.color === 'layer', 'in a class but not ByClass: still the layer\'s');
s = C.resolveStyle(byK, d2);
ok(s.color === 5 && s.lw === 0.7 && s.lt === 'DASHED' && s.src.color === 'class' && s.src.lw === 'class' && s.src.lt === 'layer', 'ByClass colour + lineweight from the class; linetype (not ByClass) from the layer', JSON.stringify(s));
s = C.resolveStyle(ownK, d2);
ok(s.color === 1 && s.lw === 0.18 && s.src.color === 'object', 'the object\'s own values win when not ByClass');
s = C.resolveStyle(ownByK, d2);
ok(s.color === 5 && s.lt === 'CENTER' && s.lw === 0.7, 'ByClass beats the object\'s stored values');
const hatch = C.withClass({ type: 'hatch', layer: 'L', solid: true, loops: [], color: null }, 'K', C.BY.fill);
ok(C.resolveStyle(hatch, d2).fill === '#00ff00' && C.resolveStyle(hatch, d2).src.fill === 'class', 'a hatch ByClass fill takes the class fill');
const txt = C.withClass({ type: 'text', layer: 'L', s: 'x', style: 'Standard' }, 'K', C.BY.textStyle);
ok(C.resolveStyle(txt, d2).textStyle === 'Notes' && C.resolveStyle({ ...txt, xd: undefined }, d2).textStyle === 'Standard', 'text style ByClass');
C.addClass(d2, { name: 'Missing-Attr' });
ok(C.resolveStyle(C.withClass(E({}), 'Missing-Attr', C.BY_ALL), d2).color === 3, 'ByClass on a class with no colour falls through to the layer');
ok(C.resolveStyle(C.withClass(E({}), 'Not-In-Table', C.BY_ALL), d2).color === 3, 'a class missing from the table: the layer\'s');
const ov = { K: { color: 6, lw: 0.13, fill: 4 } };
ok(C.resolveStyle(byK, d2, ov).color === 6 && C.resolveStyle(byK, d2, ov).src.color === 'override' && C.resolveStyle(byK, d2, ov).lw === 0.13, 'override on a ByClass object');
ok(C.resolveStyle(inK, d2, ov).color === 6, 'override on a ByLayer object in the class');
ok(C.resolveStyle(ownK, d2, ov).color === 1 && C.resolveStyle(ownK, d2, ov).lw === 0.18, 'an explicit object colour / lineweight is kept (sx-classes O3)');
ok(C.resolveStyle(hatch, d2, ov).fill === 4, 'override fill on a hatch');
C.updateClass(d2, 'K', { visible: false });
ok(!C.resolveStyle(byK, d2).visible && !C.isVisible(d2, 'K-Child'), 'a hidden class hides itself and every class under it');
C.updateClass(d2, 'K', { visible: true });
ok(!C.isVisible(d2, 'K', { k: { hidden: true } }) && C.isVisible(d2, 'K'), 'a hidden override (any case) hides only in that viewport');
C.updateClass(d2, 'K', { visible: false });
ok(!d2.visible(byK) && d2.visible(plain) && !d2.editable(byK), 'doc.visible / editable: an object in a hidden class cannot be picked or edited, like one on a layer turned off');
C.updateClass(d2, 'K', { visible: true });
ok(d2.visible(byK), 'shown again');

section('the draw path (walk.js): screen and plot');
const rec = () => { const r = { strokes: [], fills: [], texts: [] }; return { r, out: { stroke: (c, ps, lw) => r.strokes.push({ c, n: ps.length, lw }), fill: (c) => r.fills.push(c), text: (c) => r.texts.push(c), point() {}, viewport() {} } }; };
const d3 = new Doc();
d3.addLayer({ name: 'L', color: 3 });
C.addClass(d3, { name: 'Show', color: 1, lw: 0.5 });
C.addClass(d3, { name: 'Hide', color: 2 });
d3.change('s', () => {
  d3.add(C.withClass(E({}), 'Show', C.BY.color | C.BY.lw));
  d3.add(C.withClass(E({ y1: 2, y2: 2 }), 'Hide', C.BY.color));
  d3.add(E({ y1: 4, y2: 4 }));
  d3.defineBlock({ name: 'B', base: { x: 0, y: 0 }, entities: [C.withClass(E({ layer: '0' }), 'Hide', 0), E({ layer: '0' })] });
  d3.add({ type: 'insert', layer: 'L', block: 'B', x: 0, y: 10, sx: 1, sy: 1, rot: 0 });
});
let w = rec(); walk(d3, d3.model.values(), w.out);
ok(w.r.strokes.length === 5, 'every class shown: 5 strokes', String(w.r.strokes.length));
ok(w.r.strokes[0].c === '#ff0000' && w.r.strokes[0].lw === 0.5, 'ByClass colour (red) and lineweight reach the output', JSON.stringify(w.r.strokes[0]));
ok(w.r.strokes[2].c === '#00ff00', 'a ByLayer object keeps the layer colour (green)', w.r.strokes[2].c);
C.updateClass(d3, 'Hide', { visible: false });
w = rec(); walk(d3, d3.model.values(), w.out);
ok(w.r.strokes.length === 3, 'Hide turned off: its line and its line inside the block are gone (3 strokes)', String(w.r.strokes.length));
C.updateClass(d3, 'Hide', { visible: true });
const vpE = { type: 'viewport', x: 0, y: 0, w: 10, h: 10, cx: 0, cy: 0, s: 1, vpc: { Hide: { hidden: true }, None: { color: 4 } } };
const fs1 = frozenSet(vpE);
ok(fs1 && fs1.size === 0 && fs1.vpc === vpE.vpc, 'frozenSet carries the viewport\'s class overrides');
w = rec(); walk(d3, d3.model.values(), w.out, { frozen: fs1 });
ok(w.r.strokes.length === 3 && w.r.strokes.some((x) => x.c === '#00ffff'), 'in that viewport Hide is gone and None objects turn cyan', JSON.stringify(w.r.strokes.map((x) => x.c)));
w = rec(); walk(d3, d3.model.values(), w.out);
ok(w.r.strokes.length === 5 && !w.r.strokes.some((x) => x.c === '#00ffff'), 'the model itself is unchanged');
ok(C.classView(new Doc()) === null, 'no classes, no overrides: walk does no per-object class work');
// plot: a sheet with two viewports on the same model, one hiding a class
d3.change('sheet', () => d3.setLayouts([{ name: 'S', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0 }, entities: new Map() }]));
const S = d3.layouts[0];
d3.change('vps', () => { d3.add({ type: 'viewport', x: 100, y: 150, w: 150, h: 150, cx: 5, cy: 5, s: 5 }, S.entities); d3.add({ type: 'viewport', x: 300, y: 150, w: 150, h: 150, cx: 5, cy: 5, s: 5, vpc: { Hide: { hidden: true } } }, S.entities); });
const dl = Pl.displayList(d3, Pl.layoutSheet(d3, S), { style: builtinTable('colour') });
const segs = dl.views.map((v) => v.strokes.reduce((n, x) => n + x.prims.length, 0));
ok(segs[0] - segs[1] === 2, 'plot: the second viewport draws two segments fewer (Hide\'s line and its block line)', JSON.stringify(segs));
const pdf = await Pl.toPdfPages([dl], { title: 't' });
ok(pdf.bytes && pdf.bytes.length > 500, 'and it plots to PDF');

section('active class: new objects join it (Doc.editHooks)');
const unhook = C.installClassHook(Doc);
const d4 = new Doc();
C.addClass(d4, { name: 'Auto', color: 1, auto: true });
C.addClass(d4, 'Plain');
C.setActive(d4, 'plain');
d4.change('a', () => d4.add(E({})));
const a1 = all(d4)[0];
ok(C.classOf(a1) === 'Plain' && C.byClassOf(a1) === 0, 'drawn in the active class', JSON.stringify(a1.xd));
ok(d4.undoStack.length === 3, 'in the same undo step as the drawing');
C.setActive(d4, 'Auto');
d4.change('b', () => d4.add(E({})));
ok(C.byClassOf(all(d4)[1]) === C.BY_ALL, 'a "use at creation" class: every attribute ByClass');
d4.change('c', () => d4.add(C.withClass(E({}), 'Plain', 0)));
ok(C.classOf(all(d4)[2]) === 'Plain', 'an object that already has a class (paste) keeps it');
C.setActive(d4, 'None');
d4.change('d', () => d4.add(E({})));
ok(!all(d4)[3].xd, 'active None: nothing added');
unhook();

section('file round trip: DXF R12, DXF 2000, DWG 2000–2018');
const d5 = new Doc();
d5.addLayer({ name: 'L', color: 3 });
C.addClass(d5, { name: 'Lighting-Fixtures-Spot', color: 5, lw: 0.5, auto: true });
C.addClass(d5, { name: 'Wände-Außen', color: '#123456', lt: 'DASHED', fill: 8, textStyle: 'Standard' });
C.updateClass(d5, 'None', { color: 9 });
C.updateClass(d5, 'Lighting', { visible: false });
d5.meta.designLayers = { L: { scale: 50, elev: 3000 } };
d5.change('s', () => {
  d5.add(C.withClass(E({}), 'Lighting-Fixtures-Spot', C.BY.color | C.BY.lw));
  d5.add(C.withClass(E({ y1: 1, y2: 1 }), 'Wände-Außen', 0));
  d5.add(E({ y1: 2, y2: 2 }));
  d5.setLayouts([{ name: 'A-101', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0 }, entities: new Map() }]);
});
d5.change('v', () => {
  d5.add({ type: 'viewport', x: 100, y: 150, w: 150, h: 100, cx: 0, cy: 0, s: 1 }, d5.layouts[0].entities);
  d5.add({ type: 'viewport', x: 300, y: 150, w: 150, h: 100, cx: 0, cy: 0, s: 2, vpc: { 'Wände-Außen': { hidden: true }, 'Lighting-Fixtures': { color: '#ff00ff', lw: 0.25 } } }, d5.layouts[0].entities);
});
const pts = F.classesPayload(d5);
ok(pts && pts.every((p) => p.length === 1 && /^CCCLS:\d+:/.test(p[0]) && p[0].length <= 245 && /^[\x20-\x7e]*$/.test(p[0])), 'payload: ASCII strings ≤ 245 characters', pts && pts.length + ' points');
const want = JSON.stringify(C.classList(d5));
const files = [['DXF R12', () => readDxf(writeDxf(d5).text)], ['DXF 2000', () => readDxf(writeDxf2000(d5).text)],
  ...['2000', '2004', '2007', '2010', '2013', '2018'].map((v) => ['DWG ' + v, () => importDwg(readDwg(saveDwg(d5, { version: v }).bytes), { versionTag: 'x' })])];
for (const [label, read] of files) {
  let b;
  try { b = new Doc(); b.load(read()); } catch (err) { ok(false, label + ': reads', err.stack); continue; }
  ok(JSON.stringify(C.classList(b)) === want, label + ': the class table comes back exactly (Unicode name, None changed, a hidden parent)', JSON.stringify(C.classList(b)));
  const got = all(b).map((e) => C.classOf(e) + '/' + C.byClassOf(e)).sort().join(' ');
  ok(got === 'Lighting-Fixtures-Spot/5 None/0 Wände-Außen/0', label + ': each object\'s class and ByClass flags', got);
  ok(JSON.stringify(b.meta.designLayers) === '{"L":{"scale":50,"elev":3000}}', label + ': design layer scale and elevation', JSON.stringify(b.meta.designLayers));
  const vps = b.layouts.flatMap((l) => [...l.entities.values()].filter((e) => e.type === 'viewport'));
  const withO = vps.filter((e) => e.vpc);
  ok(withO.length === 1 && JSON.stringify(withO[0].vpc) === JSON.stringify(V.cleanVpClass(d5.layouts[0].entities.get([...d5.layouts[0].entities.keys()][1]).vpc)) && withO[0].s === 2, label + ': the overrides come back on the right viewport', JSON.stringify(vps.map((e) => [e.s, e.vpc])));
  if (label === 'DWG 2018') {
    const r = b.layouts.find((l) => l.name === 'A-101');
    w = rec(); walk(b, b.model.values(), w.out, { frozen: frozenSet(withO[0]) });
    ok(w.r.strokes.length === 1 && w.r.strokes[0].c !== '#ff00ff', 'read back: that viewport hides Wände-Außen; Lighting stays hidden by the table', JSON.stringify(w.r.strokes));
    ok(!!r, 'the sheet keeps its name');
  }
}
// purged payload: another program dropped the unused block — every object still knows its class
const dxfText = writeDxf2000(d5).text;
const purged = dxfText.replace(/CADCRAFT_CLASSES/g, 'SOMETHING_ELSE_X');
const pb = new Doc(); pb.load(readDxf(purged));
ok(C.classList(pb).map((c) => c.name).join('|') === 'None|Lighting|Lighting-Fixtures|Lighting-Fixtures-Spot|Wände|Wände-Außen' && C.getClass(pb, 'Lighting').visible, 'block purged: the classes come back from the objects (attributes default)', C.classList(pb).map((c) => c.name).join('|'));
// a drawing with no classes writes no block
const plainDoc = new Doc(); plainDoc.change('p', () => plainDoc.add(E({})));
ok(F.classesPayload(plainDoc) === null && !writeDxf(plainDoc).text.includes('CADCRAFT_CLASSES'), 'no classes: no block, the file is as before');
// untrusted payloads
ok(F.classesFromPayload([{ cc: ['CCCLS:1:{"format":"cadcraft-classes","version":1,"classes":[{"name":"A--B"},{"name":"Ok","color":999,"lw":-1,"visible":"no"}],"vp":[{"layout":"X","i":-1,"ovr":{"Ok":{"hidden":true}}}]}'] }]).classes.map((c) => JSON.stringify(c)).join() === '{"name":"None","color":null,"lt":null,"lw":null,"fill":null,"textStyle":null,"visible":true,"auto":false},{"name":"Ok","color":null,"lt":null,"lw":null,"fill":null,"textStyle":null,"visible":true,"auto":false}', 'untrusted payload: bad names, colours, widths and viewport entries dropped');
ok(F.classesFromPayload([{ cc: ['CCCLS:1:{not json'] }]) === null && F.classesFromPayload([{ cc: ['CCCLS:1:{"format":"other","version":1}'] }]) === null, 'broken or foreign payload: ignored');
ok(V.cleanVpClass({ 'A--B': { hidden: true }, Good: { color: 300, lw: 9 }, Fine: { hidden: true, color: '#ABCDEF' } }) && JSON.stringify(V.cleanVpClass({ 'A--B': { hidden: true }, Good: { color: 300, lw: 9 }, Fine: { hidden: true, color: '#ABCDEF' } })) === '{"Fine":{"hidden":true,"color":"#abcdef"}}', 'cleanVpClass keeps only good names and values');
// viewport override edits: clear and undo
const d6 = new Doc();
d6.change('l', () => d6.setLayouts([{ name: 'S', paper: { w: 100, h: 100, unit: 'mm', x0: 0, y0: 0 }, entities: new Map() }]));
const map6 = d6.layouts[0].entities;
let v6; d6.change('v', () => { v6 = d6.add({ type: 'viewport', x: 50, y: 50, w: 50, h: 50, cx: 0, cy: 0, s: 1 }, map6); });
V.setOverride(d6, v6, 'A', { color: 3, hidden: true }, { map: map6 });
V.setOverride(d6, v6, 'a', { hidden: null }, { map: map6 });
ok(JSON.stringify(map6.get(v6.id).vpc) === '{"A":{"color":3}}', 'setOverride merges; null drops a key; names match in any case');
V.setOverride(d6, v6, 'A', null, { map: map6 });
ok(!map6.get(v6.id).vpc, 'clearing the last override removes vpc');
d6.undo();
ok(JSON.stringify(map6.get(v6.id).vpc) === '{"A":{"color":3}}', 'each override edit is one undo step');

section('commands and Properties (classes-cmd.js)');
{
  const Cmd = await imp('classes-cmd.js');
  const { Engine } = await imp('commands.js');
  const Pd = await imp('propdefs.js');
  const Qs = await imp('qselect.js');
  Cmd.installClasses();
  const d = new Doc();
  const log = [];
  const host = { cursor: { x: 0, y: 0 }, selection: new Set(), shift: false, print: (s) => log.push(s), prompt: () => {}, setSelection: (s) => { host.selection = new Set(s); }, preview: () => {}, pickAt: () => null, pickWindow: () => [], zoomExtents: () => {}, zoomWindow: () => {} };
  const eng = new Engine(d, host);
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const type = async (...l) => { for (const x of l) { eng.text(x); await tick(); } };
  await type('CLASS', 'Furniture-Chairs');
  ok(C.activeClass(d) === 'Furniture-Chairs' && C.getClass(d, 'Furniture'), 'CLASS with nothing selected: a new name becomes the active class (parents added)');
  await type('LINE', '0,0', '10,0', '');
  const ln = all(d)[0];
  ok(ln && C.classOf(ln) === 'Furniture-Chairs', 'a line drawn next goes in the active class', JSON.stringify(ln?.xd));
  host.selection = new Set([ln.id]);
  await type('CLASS', 'Walls');
  ok(C.classOf(d.get(ln.id)) === 'Walls' && C.getClass(d, 'Walls'), 'CLASS with a selection: the selected objects move (a new class is made)');
  log.length = 0;
  await type('CLASS', '?');
  ok(log.some((s) => s.includes('Walls') && s.includes('1')), 'CLASS ? lists the classes with their counts', log.join(' / '));
  await type('CLASS', 'A--');
  ok(log.some((s) => s === I18n.t('sx.classes.err.name')), 'a bad name says so');
  C.setActive(d, 'None');
  // Properties › Class
  const ents = [d.get(ln.id)];
  const defs = Pd.defsFor('line', ents, { doc: d }).filter((x) => x.sec === 'classes');
  ok(defs.map((x) => x.key).join() === 'classes:cls,classes:by-color,classes:by-lt,classes:by-lw', 'Properties › Class: the class and three By class switches for a line', defs.map((x) => x.key).join());
  const dc = defs.find((x) => x.key === 'classes:cls');
  ok(Pd.valueOf(dc, ents, { doc: d }) === 'Walls' && dc.choices().some(([v]) => v === 'Furniture-Chairs'), 'shows the class; lists the drawing\'s classes');
  Pd.applyValue(d, dc, ents, 'Furniture', { doc: d });
  ok(C.classOf(d.get(ln.id)) === 'Furniture', 'choosing another class moves it (one undo step)');
  Pd.applyValue(d, defs.find((x) => x.key === 'classes:by-color'), [d.get(ln.id)], true, { doc: d });
  ok(C.byClassOf(d.get(ln.id)) === C.BY.color, 'Color by class switches the flag on');
  // QSELECT by class
  const sel = Qs.quickSelect(all(d), { type: 'any', prop: 'class', op: '=', value: 'furniture' }, d);
  ok(sel.size === 1 && sel.has(ln.id) && Qs.propsFor('any').includes('class') && Qs.valuesOf(all(d), 'any', 'class', d).includes('Furniture'), 'QSELECT: Class is a property (any type), values listed, matched in any case');
  host.selection = new Set();
  await type('QSELECT', 'Any', 'Class', '=', 'Furniture');
  ok(host.selection.size === 1 && host.selection.has(ln.id), 'the QSELECT command: Any › Class = Furniture selects the line', JSON.stringify([...host.selection]));
  ok(I18n.t('qs.prop.class') === 'Class' && I18n.t('sx.classes.title') === 'Classes', 'strings are there');
  Cmd.installClasses();   // a second call does nothing (no "name taken" errors)
}

section('the showcase file (fixtures/showcase/cadcraft-classes.dwg, made once by make-classes-showcase.mjs)');
{
  const f = path.join(ROOT, 'fixtures/showcase/cadcraft-classes.dwg');
  if (!fs.existsSync(f)) ok(false, 'the showcase file is there');
  else {
    const b = new Uint8Array(fs.readFileSync(f));
    const d = new Doc(); d.load(importDwg(readDwg(b), { versionTag: new TextDecoder().decode(b.subarray(0, 6)) }));
    const u = C.classUses(d);
    ok(C.classList(d).length === 11 && u.get('Architecture-Walls') === 6 && u.get('Annotation-Dimensions') === 5, 'it opens with its 11 classes and their objects');
    const vp = [...d.layouts.find((l) => l.name === 'A-101 FLOOR PLAN').entities.values()].find((e) => e.type === 'viewport');
    ok(JSON.stringify(vp.vpc) === '{"Annotation-Dimensions":{"hidden":true},"Architecture-Walls":{"color":1,"lw":0.7}}', 'A-101\'s viewport hides the dimensions and draws the walls red', JSON.stringify(vp.vpc));
  }
}

// publish to DWG (step 6) when that module is there
if (fs.existsSync(APP + 'publish-set.js')) {
  const { default: run } = await import(pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'publish-set.mjs')).href);
  const r = await run({ ok, section, imp });
  void r;
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
