#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-cad-fixtures.mjs — the drawings TakeoffCraft's CAD tests count (0.7 TD.6). Made once into fixtures/cad/ (public: all drawn by
 * us, nothing from a client), kept, and skipped when they exist (`--force` rebuilds). Every number the tests assert is a hand count:
 * it is the constant below that placed the objects, written beside the file in `kitchen-count.truth.json`.
 *
 *   kitchen-count.dwg (AutoCAD 2018) · -r2000.dwg · .dxf (DXF 2000)   a kitchen plan in inches, foodservice-style: a walk-in freezer with 22
 *       shelving units (block SHELF-18X48), prep tables (4 placed, 6 more inside block PREP-ZONE placed 3 times), lights, texts and
 *       tags, layer K-OLD frozen (3 more shelves that must not count), layer A-HIDDEN off (2 tables), and sheet K-101 at 1/2" = 1'-0"
 *   kitchen-count-k101.pdf                                           sheet K-101 plotted by CadCraft's plot code (the PDF auto-count's input)
 *   block-array.dxf · block-array.dwg                                MINSERT arrays: 4 × 5, 3 × 2 turned 30°, and one single INSERT
 *   no-units.dwg · no-units.dxf                                      INSUNITS 0: the sheet says "No scale"
 *   kitchen-count.truth.json
 *
 *   node tools/takeoffcraft-test/make-cad-fixtures.mjs [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'fixtures/cad');
const CAD = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const force = process.argv.includes('--force');
const load = (f) => import(pathToFileURL(path.join(CAD, f)).href);

/** What was placed (the hand count). */
/** What geometry-measure.* draws, in inches (TD.4): each is a hand calculation. */
export const GEOM = {
  line: 120, arcR: 50, arcDeg: 90, circleR: 30, squarePerimeter: 400, squareArea: 10000, slotLen: 100, slotH: 20,
  hatchOuter: 100, hatchHole: 20, ellipseA: 40, ellipseB: 20, openRun: 100 + 50 + 100,
};
export const TRUTH = {
  shelves: 22, shelvesFrozen: 3, tablesTop: 4, tablesNested: 6, tablesHidden: 2, prepZones: 3, sinks: 3,
  lights: 6, circlesLite: 12, textA3: 5, textB1: 2, tagA3: 3, tagC7: 2, scale: '1/2" = 1\'-0"',
};

export async function build() {
  const { Doc } = await load('doc.js');
  const Sh = await load('sheets.js');
  const d = new Doc();
  const L = (name, color, extra = {}) => d.addLayer({ name, color, ...extra });
  d.change('kitchen', () => {
    d.setMeta({ units: 'inches', name: 'Kitchen count' });
    L('A-WALL', 7); L('K-EQPM', 3); L('E-LITE', 2); L('A-ANNO', 7); L('K-OLD', 1, { frozen: true }); L('A-HIDDEN', 5, { on: false });
    const rect = (x, y, w, h, layer = '0') => ({ type: 'poly', layer, color: null, closed: true, pts: [{ x, y, b: 0 }, { x: x + w, y, b: 0 }, { x: x + w, y: y + h, b: 0 }, { x, y: y + h, b: 0 }] });
    const ln = (x1, y1, x2, y2, layer = '0') => ({ type: 'line', layer, color: null, x1, y1, x2, y2 });
    // blocks (drawn on layer 0: they take the layer of the insert)
    d.defineBlock({ name: 'SHELF-18X48', base: { x: 0, y: 0 }, entities: [rect(0, 0, 18, 48), ln(0, 0, 18, 48), ln(18, 0, 0, 48), ln(0, 24, 6, 24)] });
    d.defineBlock({ name: 'TABLE-30X60', base: { x: 0, y: 0 }, entities: [rect(0, 0, 60, 30), rect(3, 3, 54, 24)] });
    d.defineBlock({ name: 'SINK-3COMP', base: { x: 0, y: 0 }, entities: [rect(0, 0, 84, 30), rect(4, 4, 22, 22), rect(30, 4, 22, 22), rect(56, 4, 22, 22)] });
    d.defineBlock({ name: 'LIGHT', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', color: null, cx: 0, cy: 0, r: 5 }, ln(-5, 0, 5, 0), ln(0, -5, 0, 5)] });
    d.defineBlock({ name: 'PREP-ZONE', base: { x: 0, y: 0 }, entities: [
      { type: 'insert', layer: '0', color: null, block: 'TABLE-30X60', x: 0, y: 0, sx: 1, sy: 1, rot: 0 },
      { type: 'insert', layer: '0', color: null, block: 'TABLE-30X60', x: 0, y: 40, sx: 1, sy: 1, rot: 0 },
      { type: 'insert', layer: '0', color: null, block: 'SINK-3COMP', x: 70, y: 0, sx: 1, sy: 1, rot: 0 }] });
    d.defineBlock({ name: 'TAG-RECT', base: { x: 0, y: 0 }, entities: [rect(0, 0, 24, 10)],
      attdefs: [{ tag: 'ITEM', prompt: 'Item', def: '', x: 2, y: 2, h: 5, rot: 0, ha: 'left', va: 'baseline', wf: 1, invisible: false, constant: false, preset: false, layer: '0', color: null }] });
    // the freezer room and its 22 shelves: three rows, 8 + 7 + 7
    const W = 8 * 24 + 24, H = 3 * 66 + 24;
    d.add(rect(0, 0, W, H, 'A-WALL'));
    let n = 0;
    for (const [row, count] of [[0, 8], [1, 7], [2, 7]]) for (let i = 0; i < count; i++, n++)
      d.add({ type: 'insert', layer: 'K-EQPM', color: null, block: 'SHELF-18X48', x: 12 + i * 24, y: 12 + row * 66, sx: 1, sy: 1, rot: 0 });
    if (n !== TRUTH.shelves) throw new Error('shelf count');
    for (let i = 0; i < TRUTH.shelvesFrozen; i++) d.add({ type: 'insert', layer: 'K-OLD', color: null, block: 'SHELF-18X48', x: 300 + i * 24, y: 12, sx: 1, sy: 1, rot: 0 });
    // prep: 4 tables in a row, 3 prep zones, 2 hidden tables
    for (let i = 0; i < TRUTH.tablesTop; i++) d.add({ type: 'insert', layer: 'K-EQPM', color: null, block: 'TABLE-30X60', x: 260 + i * 70, y: 200, sx: 1, sy: 1, rot: 0 });
    for (let i = 0; i < TRUTH.prepZones; i++) d.add({ type: 'insert', layer: 'K-EQPM', color: null, block: 'PREP-ZONE', x: 260 + i * 160, y: 80, sx: 1, sy: 1, rot: 0 });
    for (let i = 0; i < TRUTH.tablesHidden; i++) d.add({ type: 'insert', layer: 'A-HIDDEN', color: null, block: 'TABLE-30X60', x: 260 + i * 70, y: 300, sx: 1, sy: 1, rot: 0 });
    // lights: 12 loose circles and 6 LIGHT blocks
    for (let i = 0; i < TRUTH.circlesLite; i++) d.add({ type: 'circle', layer: 'E-LITE', color: null, cx: 20 + i * 40, cy: 240, r: 3 });
    for (let i = 0; i < TRUTH.lights; i++) d.add({ type: 'insert', layer: 'E-LITE', color: null, block: 'LIGHT', x: 20 + i * 40, y: 270, sx: 1, sy: 1, rot: 0 });
    // texts and tags
    for (let i = 0; i < TRUTH.textA3; i++) d.add({ type: 'text', layer: 'A-ANNO', color: null, x: 20 + i * 50, y: 300, h: 6, rot: 0, s: 'A3', ha: 'left', va: 'baseline', wf: 1 });
    for (let i = 0; i < TRUTH.textB1; i++) d.add({ type: 'text', layer: 'A-ANNO', color: null, x: 20 + i * 50, y: 320, h: 6, rot: 0, s: 'B1', ha: 'left', va: 'baseline', wf: 1 });
    d.add({ type: 'text', layer: 'A-ANNO', color: null, x: 20, y: 340, h: 6, rot: 0, s: 'FREEZER ROOM', ha: 'left', va: 'baseline', wf: 1 });
    let ti = 0;
    for (const [v, c] of [['A3', TRUTH.tagA3], ['C7', TRUTH.tagC7]]) for (let i = 0; i < c; i++, ti++)
      d.add({ type: 'insert', layer: 'A-ANNO', color: null, block: 'TAG-RECT', x: 20 + ti * 40, y: 360, sx: 1, sy: 1, rot: 0, attrs: { ITEM: v } });
    // sheet K-101 at 1/2" = 1'-0" (1:24): a viewport on the model
    const paper = Sh.paperByKey('arch-d');
    const lay = { name: 'K-101', paper: { w: paper.w, h: paper.h, unit: paper.unit, x0: 0, y0: 0, key: paper.key }, entities: new Map() };
    d.setLayouts([lay]);
  });
  // sheet contents: border, title block, and the viewport at 1:24 aimed at the model's middle
  const layout = d.layouts[0];
  const sc = Sh.sheetContents(d, { w: layout.paper.w, h: layout.paper.h, unit: 'in', x0: 0, y0: 0 }, { title: 'KITCHEN COUNT', sheetNo: 1, date: new Date('2026-10-23T00:00:00Z') });
  const was = Sh.scaleLabel(d, 'in', sc.scale.s), now = Sh.scaleLabel(d, 'in', 1 / 24);
  d.change('sheet', () => {
    for (const l of sc.layers) d.addLayer(l);
    d.setSpace(layout);
    for (const e of sc.entities) {
      if (e.type === 'viewport') { e.s = 1 / 24; e.cx = 370; e.cy = 190; e.frz = []; }
      if (e.type === 'text' && e.s === was) e.s = now;                // the title block says the scale the viewport has
      d.add(e);
    }
    d.setSpace(null);
  });
  return { d, Sh };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const have = (f) => fs.existsSync(path.join(OUT, f));
  const all = ['kitchen-count.dwg', 'kitchen-count-r2000.dwg', 'kitchen-count.dxf', 'kitchen-count-k101.pdf', 'kitchen-count.truth.json', 'block-array.dxf', 'block-array.dwg', 'no-units.dwg', 'no-units.dxf', 'geometry-measure.dwg', 'geometry-measure.dxf'];
  if (!force && all.every(have)) { console.log('fixtures/cad: all present (use --force to rebuild)'); return; }
  const { saveDwg } = await load('dwg-save.js');
  const { writeDxf2000 } = await load('dxf2000.js');
  const Pl = await load('plot.js');
  const { d } = await build();
  const w = (f, data) => { fs.writeFileSync(path.join(OUT, f), data); console.log('wrote', f, data.length); };
  w('kitchen-count.dwg', saveDwg(d, { version: '2018' }).bytes);
  w('kitchen-count-r2000.dwg', saveDwg(d, { version: '2000' }).bytes);
  w('kitchen-count.dxf', Buffer.from(writeDxf2000(d).text, 'utf8'));
  // sheet K-101 as a PDF: CadCraft's plot code (monochrome, as a plotter prints it)
  const sheet = Pl.layoutSheet(d, d.layouts[0]);
  const pdf = await Pl.toPdf(Pl.displayList(d, sheet), { pen: 0.25 });
  w('kitchen-count-k101.pdf', Buffer.from(pdf.bytes));
  w('kitchen-count.truth.json', JSON.stringify({ note: 'hand counts: what make-cad-fixtures.mjs placed', ...TRUTH }, null, 1) + '\n');

  // no units: a drawing that never said what its unit is
  const u = new (await load('doc.js')).Doc();
  u.change('t', () => {
    u.setMeta({ units: '', name: 'No units' });
    u.defineBlock({ name: 'POST', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', color: null, cx: 0, cy: 0, r: 2 }] });
    for (let i = 0; i < 7; i++) u.add({ type: 'insert', layer: '0', color: null, block: 'POST', x: i * 10, y: 0, sx: 1, sy: 1, rot: 0 });
  });
  w('no-units.dwg', saveDwg(u, { version: '2018' }).bytes);
  w('no-units.dxf', Buffer.from(writeDxf2000(u).text, 'utf8'));

  // geometry to measure (TD.4): exact lengths and areas by hand (see GEOM)
  const g = new (await load('doc.js')).Doc();
  g.change('t', () => {
    g.setMeta({ units: 'inches', name: 'Geometry' });
    g.addLayer({ name: 'G-LINE', color: 3 }); g.addLayer({ name: 'G-HIDE', color: 1, on: false });
    const L = 'G-LINE';
    g.add({ type: 'line', layer: L, color: null, x1: 0, y1: 0, x2: GEOM.line, y2: 0 });
    g.add({ type: 'arc', layer: L, color: null, cx: 200, cy: 0, r: GEOM.arcR, a0: 0, a1: Math.PI / 2 });
    g.add({ type: 'circle', layer: L, color: null, cx: 400, cy: 0, r: GEOM.circleR });
    g.add({ type: 'poly', layer: L, color: null, closed: true, pts: [{ x: 0, y: 100, b: 0 }, { x: 100, y: 100, b: 0 }, { x: 100, y: 200, b: 0 }, { x: 0, y: 200, b: 0 }] });
    g.add({ type: 'poly', layer: L, color: null, closed: true, pts: [{ x: 200, y: 100, b: 0 }, { x: 300, y: 100, b: 1 }, { x: 300, y: 120, b: 0 }, { x: 200, y: 120, b: 1 }] });   // a slot: two outward half circles
    g.add({ type: 'hatch', layer: L, color: null, solid: true, loops: [[400, 100, 500, 100, 500, 200, 400, 200], [440, 140, 460, 140, 460, 160, 440, 160]] });
    g.add({ type: 'ellipse', layer: L, color: null, cx: 600, cy: 0, mx: GEOM.ellipseA, my: 0, ratio: GEOM.ellipseB / GEOM.ellipseA, t0: 0, t1: Math.PI * 2 });
    g.add({ type: 'poly', layer: L, color: null, closed: false, pts: [{ x: 0, y: 300, b: 0 }, { x: 100, y: 300, b: 0 }, { x: 100, y: 350, b: 0 }, { x: 200, y: 350, b: 0 }] });
    g.add({ type: 'line', layer: 'G-HIDE', color: null, x1: 0, y1: 400, x2: 50, y2: 400 });
    g.add({ type: 'text', layer: L, color: null, x: 0, y: 450, h: 6, rot: 0, s: 'NOT GEOMETRY', ha: 'left', va: 'baseline', wf: 1 });
  });
  w('geometry-measure.dwg', saveDwg(g, { version: '2018' }).bytes);
  w('geometry-measure.dxf', Buffer.from(writeDxf2000(g).text, 'utf8'));

  // block arrays: MINSERT. DXF by hand (the CadCraft writers expand arrays), DWG by turning a read INSERT into MINSERT
  const dxf = [
    '0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1015', '9', '$INSUNITS', '70', '1', '0', 'ENDSEC',
    '0', 'SECTION', '2', 'TABLES', '0', 'TABLE', '2', 'LAYER', '70', '2',
    '0', 'LAYER', '2', '0', '70', '0', '62', '7', '6', 'CONTINUOUS', '0', 'LAYER', '2', 'E-POST', '70', '0', '62', '3', '6', 'CONTINUOUS', '0', 'ENDTAB', '0', 'ENDSEC',
    '0', 'SECTION', '2', 'BLOCKS', '0', 'BLOCK', '8', '0', '2', 'POST', '70', '0', '10', '0.0', '20', '0.0', '30', '0.0', '3', 'POST',
    '0', 'CIRCLE', '8', '0', '10', '0.0', '20', '0.0', '30', '0.0', '40', '3.0', '0', 'ENDBLK', '8', '0', '0', 'ENDSEC',
    '0', 'SECTION', '2', 'ENTITIES',
    '0', 'INSERT', '8', 'E-POST', '2', 'POST', '10', '0.0', '20', '0.0', '30', '0.0', '70', '5', '71', '4', '44', '24.0', '45', '30.0',
    '0', 'INSERT', '8', 'E-POST', '2', 'POST', '10', '400.0', '20', '0.0', '30', '0.0', '50', '30.0', '70', '3', '71', '2', '44', '20.0', '45', '20.0',
    '0', 'INSERT', '8', 'E-POST', '2', 'POST', '10', '800.0', '20', '0.0', '30', '0.0',
    '0', 'ENDSEC', '0', 'EOF', '',
  ].join('\n');
  w('block-array.dxf', Buffer.from(dxf, 'utf8'));
  const { readDxfModel } = await import(pathToFileURL(path.join(CAD, 'dxf-model.js')).href);
  const { writeDwg } = await import(pathToFileURL(path.join(ROOT, 'lib/dwg/write.js')).href);
  const m = readDxfModel(dxf);
  const bytes = writeDwg(m, { version: 'AC1018' });
  w('block-array.dwg', Buffer.from(bytes.bytes || bytes));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
