#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs: annotate by scale in CadCraft (0.10 BK.10, session bk-r3-scale-10): annotative text and dimensions sized on paper and
 * resized by ANNOSCALE; the flag and the scale in DXF and DWG there and back. The rule itself and BimCraft's side are checked by
 * `node bin/test-bimcraft.mjs --house`. Expected values are worked out by hand in the comments.
 *   node tools/annoscale/test.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d !== '' ? ' (' + d + ')' : '')); };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { Engine } = await load('commands.js');
const AC = await load('anno-scale-cad.js');
const HK = await load('defaults-hook.js');
const DP = await load('dwg-props.js');
const { writeDxf, readDxf } = await load('dxf.js');
const { saveDwg } = await load('dwg-save.js');
const { importDwg } = await load('dwg-import.js');
const { readDwg } = await load('dwg/read.js');
const { writeDxf2000 } = await load('dxf2000.js');
const Dm = await load('dims.js');

function harness() {
  const doc = new Doc(), log = [];
  const host = { cursor: { x: 0, y: 0 }, selection: new Set(), shift: false, print: (s) => log.push(s), prompt: () => {}, setSelection: (s) => { host.selection = new Set(s); }, preview: () => {}, pickAt: () => null, pickWindow: () => [], zoomExtents: () => {}, zoomWindow: () => {} };
  const eng = new Engine(doc, host);
  const type = async (...lines) => { for (const l of lines) { eng.text(l); await new Promise((r) => setTimeout(r, 0)); } };
  return { doc, log, type };
}
const texts = (doc) => [...doc.model.values()].filter((e) => e.type === 'text');
const dims = (doc) => [...doc.model.values()].filter((e) => e.type === 'dim');

console.log('== annotative text and dimensions follow the annotation scale');
const h = harness(), d = h.doc;
d.meta.units = 'millimeters';
let note, plain, dim, wrap;
d.change('draw', () => {
  note = d.add({ type: 'text', x: 0, y: 0, h: 2.5, s: 'ROOM' });
  plain = d.add({ type: 'text', x: 0, y: 10, h: 2.5, s: 'not annotative' });
  wrap = d.add({ type: 'text', x: 0, y: 20, h: 3.5, ww: 60, s: 'a paragraph' });
  dim = d.add({ type: 'dim', kind: 'linear', p1: { x: 0, y: 0 }, p2: { x: 5000, y: 0 }, loc: { x: 2500, y: -500 }, st: {} });
});
ok(AC.annoScaleOf(d) === 1 && AC.annotatives(d).length === 0, 'a new drawing: annotation scale 1:1, nothing annotative');
d.change('ann', () => { for (const e of [note, wrap, dim]) d.update(e.id, AC.withAnnotative(d, d.model.get(e.id), true), d.model); });
ok(AC.annotatives(d).length === 3 && near(AC.paperSizeOf(d, d.model.get(note.id)), 2.5) && near(AC.paperSizeOf(d, d.model.get(dim.id)), 2.5), 'made annotative at 1:1: the text and the dimension text are 2.5 mm on paper');
const steps = d.undoStack.length;
let r = AC.setAnnoScale(d, 100);
// by hand: 2.5 mm on paper at 1:100 = 250 in the model; the paragraph 3.5 → 350 tall, 60 → 6 000 wide; DIMSCALE 1 → 100
const N = () => d.model.get(note.id), W = () => d.model.get(wrap.id), D = () => d.model.get(dim.id), P = () => d.model.get(plain.id);
ok(r.ok && r.changed === 3 && r.from === 1 && N().h === 250 && W().h === 350 && W().ww === 6000 && D().st.scale === 100 && P().h === 2.5, '1:100: text 250 tall, the paragraph 350 tall and 6 000 wide, the dimension scale 100; text that is not annotative stays 2.5');
ok(d.undoStack.length === steps + 1 && AC.annoScaleOf(d) === 100 && N().as === 100, 'one undo step; the drawing and each object remember 1:100');
const g100 = Dm.dimGeometry(D()).find((x) => x.type === 'text');
ok(near(g100.h, 250), 'the dimension draws its text 250 tall (2.5 x 100)', g100?.h);
r = AC.setAnnoScale(d, 50);
ok(r.changed === 3 && N().h === 125 && W().ww === 3000 && D().st.scale === 50 && near(AC.paperSizeOf(d, N()), 2.5) && near(AC.paperSizeOf(d, D()), 2.5), '1:100 to 1:50: half the size in the model (125), still 2.5 mm on paper');
d.undo();
ok(N().h === 250 && D().st.scale === 100 && AC.annoScaleOf(d) === 100, 'Undo: back at 1:100');
d.redo();
ok(AC.setAnnoScale(d, 0).error === 'scale' && AC.setAnnoScale(d, NaN).error === 'scale' && N().h === 125, 'a scale of 0 or not a number is refused, nothing changes');
ok(AC.setAnnoScale(d, 50).changed === 0, 'the same scale again changes nothing');
d.change('off', () => d.update(note.id, AC.withAnnotative(d, N(), false), d.model));
ok(!N().ann && N().as === undefined && N().h === 125 && AC.paperSizeOf(d, N()) === null, 'switched off: it keeps its model size and no longer follows the scale');
AC.setAnnoScale(d, 20);
ok(N().h === 125 && W().h === 70, '1:20: the text that is no longer annotative stays 125; the paragraph is 3.5 x 20 = 70');

console.log('== the command and Properties');
const k = harness();
k.doc.meta.units = 'millimeters';
k.doc.change('draw', () => { k.doc.add({ type: 'text', x: 0, y: 0, h: 2.5, s: 'A', ann: true }); k.doc.add({ type: 'dim', kind: 'linear', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 }, loc: { x: 50, y: -10 }, st: {}, ann: true }); });
await k.type('ANNOSCALE', '1:100');
ok(texts(k.doc)[0].h === 250 && dims(k.doc)[0].st.scale === 100 && k.log.some((s) => /Annotation scale 1:100\. Resized 2 annotative objects/.test(s)), 'ANNOSCALE 1:100 resizes both and says so', k.log.join(' | '));
await k.type('CANNOSCALE', '50');
ok(texts(k.doc)[0].h === 125 && k.log.some((s) => /^Annotation scale 1:100\. Annotative objects in this drawing: 2\.$/.test(s)), 'the alias CANNOSCALE; a bare number is 1:n; it first says the scale in force');
await k.type('ANNOSCALE', 'nonsense');
ok(texts(k.doc)[0].h === 125 && k.log.some((s) => /That is not a scale/.test(s)), 'something that is not a scale is refused in words');
await k.type('ANNOSCALE', '2:1');
ok(texts(k.doc)[0].h === 1.25 && AC.annoScaleOf(k.doc) === 0.5, '2:1 (enlarged): 2.5 mm text is 1.25 in the model');
ok(I18n.t('props.annpaper.value', { mm: '2.5', scale: '1:50' }) === '2.5 mm at 1:50' && !/does not yet scale/.test(I18n.t('props.f.ann.title')), 'Properties: "Size on paper" reads "2.5 mm at 1:50"; the Annotative tip no longer says it is not scaled');

console.log('== the office\'s paper height for new text (Default Policies)');
ok(AC.annoTextHeight(d) === null, 'no add-on: no office height, the text height is left alone');
HK.setDefaults({ get: (id) => (id === 'all.anno.text' ? 3.5 : undefined), source: () => 'office' });
ok(AC.annoTextHeight(d) === 70, 'office text 3.5 mm at 1:20 in a millimetre drawing: 70', AC.annoTextHeight(d));
const m = harness(); m.doc.meta.units = 'meters';
await m.type('ANNOSCALE', '1:100');
ok(near(m.doc.current.textHeight, 0.35) && m.log.some((s) => /New text starts/.test(s)), 'a drawing in metres at 1:100: new text starts 0.35 tall (3.5 mm x 100 / 1000) and the command says so', m.doc.current.textHeight);
HK.setDefaults(null);

console.log('== the file: the flag and the scale there and back');
const x = DP.propsXdata({ type: 'text', ann: true, as: 50 });
ok(x.AcadAnnotative && x.CADCRAFT.some(([c, v]) => c === 1000 && v === 'CCAS:50') && DP.propsFromXdata(x).ann === true && DP.propsFromXdata(x).as === 50, 'xdata: AcadAnnotative for other programs + CCAS:50; read back as annotative at 1:50');
ok(!DP.propsXdata({ type: 'text', ann: true }).CADCRAFT && !DP.propsXdata({ type: 'text', as: 50 }).CADCRAFT && DP.propsFromXdata({ CADCRAFT: [[1000, 'CCAS:50']] }).as === undefined && DP.propsFromXdata({ AcadAnnotative: [[1000, 'AnnotativeData'], [1070, 1], [1070, 1]], CADCRAFT: [[1000, 'CCAS:-4']] }).as === undefined, 'a 1:1 object writes no CCAS; a scale without the flag, or a bad scale, is ignored');
const f = harness(); f.doc.meta.units = 'millimeters';
f.doc.change('draw', () => { f.doc.add({ type: 'text', x: 0, y: 0, h: 2.5, s: 'ROOM', ann: true }); f.doc.add({ type: 'text', x: 0, y: 9, h: 2.5, s: 'PLAIN' }); f.doc.add({ type: 'dim', kind: 'linear', p1: { x: 0, y: 0 }, p2: { x: 5000, y: 0 }, loc: { x: 2500, y: -500 }, st: {}, ann: true }); });
AC.setAnnoScale(f.doc, 50);
const files = [['DXF R12', () => readDxf(writeDxf(f.doc).text)], ['DXF 2000', () => readDxf(writeDxf2000(f.doc).text)], ...['2000', '2010', '2018'].map((v) => ['DWG ' + v, () => importDwg(readDwg(saveDwg(f.doc, { version: v }).bytes), { versionTag: 'x' })])];
for (const [name, there] of files) {
  try {
    const back = new Doc(); back.load(there());
    const t2 = texts(back).find((e) => e.s === 'ROOM'), p2 = texts(back).find((e) => e.s === 'PLAIN'), d2 = dims(back)[0];
    ok(t2?.ann === true && t2.as === 50 && near(t2.h, 125, 1e-6) && !p2.ann && near(p2.h, 2.5, 1e-6) && d2?.ann === true && d2.as === 50 && near({ ...Dm.DIM_DEFAULTS, ...d2.st }.scale, 50, 1e-6), name + ' there and back: the text 125 tall, annotative at 1:50; the dimension annotative at 1:50 with scale 50; plain text untouched', JSON.stringify([t2?.ann, t2?.as, t2?.h, p2?.ann, d2?.ann, d2?.as, d2?.st?.scale]));
    if (name === 'DXF 2000') {
      ok(AC.annoScaleOf(back) === 50, 'a drawing opened from a file reads its annotation scale from its annotative objects (1:50)');
      AC.setAnnoScale(back, 100);
      ok(near(texts(back).find((e) => e.s === 'ROOM').h, 250, 1e-6) && near(texts(back).find((e) => e.s === 'PLAIN').h, 2.5, 1e-6), 'and ANNOSCALE 1:100 on the opened drawing doubles it (250)');
    }
  } catch (e) { ok(false, name + ' there and back', e.stack || e); }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
