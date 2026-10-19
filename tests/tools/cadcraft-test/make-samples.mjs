#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-samples.mjs — CadCraft's sample drawings (0.6 DF.9; Steven P on Discord: sample drawings to learn from). Drawn here
 * with CadCraft's own modules, CC0, written ONCE: the script stops when the files exist (--force rebuilds; then tell whoever
 * uses the showcase files). DWG (AutoCAD 2018) by dwg-save.js and DXF 2000 by dxf2000.js.
 *
 *   node tools/cadcraft-test/make-samples.mjs [--force]
 *
 * → public_html/assets/apps/cadcraft/dev/samples/   sample-house.{dwg,dxf}, sample-asbuilt.{dwg,dxf}, index.json
 *   (File › Open a sample reads them from the build), and the same files in fixtures/showcase/ as cadcraft-*.{dwg,dxf}.
 *
 * sample-house: "Sample house", a small house in feet and inches: plan (walls, doors and windows as blocks, rooms, dimensions),
 *   front elevation, a section with earth hatch, a wall detail, and four ARCH D sheets (A-101 … A-501) each with a viewport at
 *   its scale and the title block "TB-ARCH-D" whose attributes hold the project, title, sheet, scale, date and drawn by.
 * sample-asbuilt: "Sample as-built", an office measured from a scan, in millimetres: a slice of scan points (POINTs) and the
 *   walls traced over them, a column, two revision clouds with their delta, dimensions in millimetres and the same ones in
 *   feet and inches (DIMLFAC), on an A3 sheet at 1:25 with the "TB-A3" title block.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const OUT = path.join(APP, 'samples');
const SHOW = path.join(ROOT, 'fixtures/showcase');
const FORCE = process.argv.includes('--force');
const files = ['sample-house.dwg', 'sample-house.dxf', 'sample-asbuilt.dwg', 'sample-asbuilt.dxf'];
if (!FORCE && files.every((f) => fs.existsSync(path.join(OUT, f)))) { console.log('samples exist (use --force to rebuild them)'); process.exit(0); }

const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { DIM_DEFAULTS } = await load('dims.js');
const { revcloud } = await load('geom.js');
const { saveDwg } = await load('dwg-save.js');
const { writeDxf2000 } = await load('dxf2000.js');
const { makePaper } = await load('sheets.js');

const P = (x, y) => ({ x, y, b: 0 });
const rect = (layer, x0, y0, x1, y1, extra = {}) => ({ type: 'poly', layer, closed: true, pts: [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], ...extra });
const line = (layer, x1, y1, x2, y2, extra = {}) => ({ type: 'line', layer, x1, y1, x2, y2, ...extra });
const text = (layer, x, y, h, s, extra = {}) => ({ type: 'text', layer, x, y, h, rot: 0, s, ha: 'left', va: 'baseline', wf: 1, ...extra });
const ad = (tag, prompt, def, x, y, h, extra = {}) => ({ tag, prompt, def, x, y, h, rot: 0, ha: 'left', va: 'baseline', wf: 1, layer: '0', color: null, ...extra });
const date = '2026-10-16';

// ---------------------------------------------------------------------------------------------------- the house (inches)
function house() {
  const layers = [
    { name: 'A-WALL', color: 7, lineweight: 0.5 }, { name: 'A-DOOR', color: 2 }, { name: 'A-GLAZ', color: 4 }, { name: 'A-ANNO-TEXT', color: 3 },
    { name: 'A-ANNO-DIMS', color: 1 }, { name: 'A-ELEV', color: 7 }, { name: 'A-SECT', color: 6, lineweight: 0.5 }, { name: 'A-DETL', color: 5 },
    { name: 'A-HATCH', color: 8 }, { name: 'G-TTLB', color: 7 }, { name: 'Viewports', color: 8, plot: false },
  ];
  const e = [];
  // plan: 40'-0" × 28'-0" outside, 6" exterior walls, 4" partitions
  e.push(rect('A-WALL', 0, 0, 480, 336), rect('A-WALL', 6, 6, 474, 330));
  e.push(rect('A-WALL', 6, 122, 240, 126), rect('A-WALL', 240, 6, 244, 330), rect('A-WALL', 244, 182, 474, 186), rect('A-WALL', 376, 6, 380, 182));
  // doors (block DOOR-32: leaf and swing) and windows (block WIN-48: three lines across the wall)
  const blocks = [
    { name: 'DOOR-32', base: { x: 0, y: 0 }, entities: [line('0', 0, 0, 0, 32), { type: 'arc', layer: '0', cx: 0, cy: 0, r: 32, a0: 0, a1: Math.PI / 2 }] },
    { name: 'WIN-48', base: { x: 0, y: 0 }, entities: [line('0', 0, 0, 48, 0), line('0', 0, 3, 48, 3), line('0', 0, 6, 48, 6), line('0', 0, 0, 0, 6), line('0', 48, 0, 48, 6)] },
  ];
  const ins = (layer, block, x, y, rot = 0, sx = 1) => ({ type: 'insert', layer, block, x, y, sx, sy: 1, rot });
  e.push(ins('A-DOOR', 'DOOR-32', 120, 0, 0), ins('A-DOOR', 'DOOR-32', 244, 230, 0), ins('A-DOOR', 'DOOR-32', 244, 120, 0), ins('A-DOOR', 'DOOR-32', 380, 140, 0), ins('A-DOOR', 'DOOR-32', 150, 126, 0, -1));
  e.push(ins('A-GLAZ', 'WIN-48', 40, 330), ins('A-GLAZ', 'WIN-48', 150, 330), ins('A-GLAZ', 'WIN-48', 330, 330), ins('A-GLAZ', 'WIN-48', 40, 0), ins('A-GLAZ', 'WIN-48', 300, 0), ins('A-GLAZ', 'WIN-48', 480, 230, Math.PI / 2));
  for (const [x, y, name, size] of [[60, 230, 'LIVING', '19\'-6" × 17\'-0"'], [60, 70, 'KITCHEN', '19\'-6" × 9\'-8"'], [300, 260, 'BEDROOM 1', '19\'-2" × 12\'-0"'], [270, 100, 'BEDROOM 2', '11\'-0" × 14\'-8"'], [395, 100, 'BATH', '7\'-10" × 14\'-8"']]) {
    e.push(text('A-ANNO-TEXT', x, y, 9, name), text('A-ANNO-TEXT', x, y - 14, 6, size));
  }
  const arch = { ...DIM_DEFAULTS, txt: 0.125, asz: 0.125, exe: 0.0625, exo: 0.0625, gap: 0.0625, dli: 0.375, scale: 48, lunit: 4, dec: 4 };
  const dim = (p1, p2, loc, rot) => ({ type: 'dim', layer: 'A-ANNO-DIMS', kind: 'linear', p1, p2, loc, rot, text: '', st: { ...arch } });
  e.push(dim({ x: 0, y: 0 }, { x: 480, y: 0 }, { x: 0, y: -42 }, 0), dim({ x: 0, y: 0 }, { x: 240, y: 0 }, { x: 0, y: -24 }, 0), dim({ x: 240, y: 0 }, { x: 480, y: 0 }, { x: 240, y: -24 }, 0),
    dim({ x: 480, y: 0 }, { x: 480, y: 336 }, { x: 522, y: 0 }, Math.PI / 2), dim({ x: 480, y: 0 }, { x: 480, y: 184 }, { x: 504, y: 0 }, Math.PI / 2));
  e.push(text('A-ANNO-TEXT', 0, -90, 12, 'FLOOR PLAN'), text('A-ANNO-TEXT', 0, -106, 6, 'SCALE: 1/4" = 1\'-0"'));
  // front elevation, below the plan
  const ey = -420;
  e.push(line('A-ELEV', -24, ey, 504, ey, { lw: 0.7 }), rect('A-ELEV', 0, ey, 480, ey + 108));
  e.push({ type: 'poly', layer: 'A-ELEV', closed: false, pts: [P(-12, ey + 108), P(240, ey + 108 + 126), P(492, ey + 108)] });
  for (const x of [40, 300]) e.push(rect('A-ELEV', x, ey + 36, x + 48, ey + 84));   // the plan's front windows; the door between
  e.push(rect('A-ELEV', 120, ey, 152, ey + 80));
  e.push(text('A-ANNO-TEXT', 0, ey - 48, 12, 'FRONT ELEVATION'), text('A-ANNO-TEXT', 0, ey - 64, 6, 'SCALE: 1/4" = 1\'-0"'));
  // section A-A, to the right
  const sx = 700;
  e.push(rect('A-SECT', sx, 0, sx + 336, 4), rect('A-SECT', sx, 4, sx + 6, 112), rect('A-SECT', sx + 330, 4, sx + 336, 112), rect('A-SECT', sx + 182, 4, sx + 186, 108));
  e.push({ type: 'poly', layer: 'A-SECT', closed: false, pts: [P(sx - 12, 112), P(sx + 168, 112 + 90), P(sx + 348, 112)] }, line('A-SECT', sx, 108, sx + 336, 108));
  e.push(rect('A-SECT', sx - 6, -24, sx + 12, 0), rect('A-SECT', sx + 324, -24, sx + 342, 0));
  e.push({ type: 'hatch', layer: 'A-HATCH', solid: false, pattern: 'EARTH', pscale: 12, loops: [[sx - 40, -48, sx + 376, -48, sx + 376, -24, sx - 40, -24, sx - 40, -48]] });
  e.push(text('A-ANNO-TEXT', sx, -90, 12, 'SECTION A-A'), text('A-ANNO-TEXT', sx, -106, 6, 'SCALE: 1/4" = 1\'-0"'));
  // wall detail, far right, larger
  const dx = 1300;
  e.push(rect('A-DETL', dx, 0, dx + 0.5, 96), rect('A-DETL', dx + 0.5, 0, dx + 4, 96), rect('A-DETL', dx + 4, 0, dx + 4.5, 96), rect('A-DETL', dx + 4.5, 0, dx + 5.25, 96));
  e.push({ type: 'hatch', layer: 'A-HATCH', solid: false, pattern: 'ANSI37', pscale: 1, loops: [[dx + 0.5, 0, dx + 4, 0, dx + 4, 96, dx + 0.5, 96, dx + 0.5, 0]] });
  e.push(rect('A-DETL', dx - 4, -12, dx + 12, 0));
  e.push({ type: 'hatch', layer: 'A-HATCH', solid: false, pattern: 'ANSI31', pscale: 0.5, loops: [[dx - 4, -12, dx + 12, -12, dx + 12, 0, dx - 4, 0, dx - 4, -12]] });
  for (const [y, s] of [[90, '1/2" GYPSUM BOARD'], [70, '2×4 STUDS @ 16" O.C., BATT INSULATION'], [50, '1/2" SHEATHING'], [30, 'LAP SIDING'], [-8, 'CONCRETE FOOTING']]) e.push(line('A-ANNO-TEXT', dx + 6, y, dx + 20, y + 4), text('A-ANNO-TEXT', dx + 21, y + 3, 1.5, s));
  e.push(text('A-ANNO-TEXT', dx, -24, 3, 'WALL DETAIL'), text('A-ANNO-TEXT', dx, -28, 1.5, 'SCALE: 1 1/2" = 1\'-0"'));
  // the title block, in paper inches (ARCH D, 36 × 24)
  blocks.push({ name: 'TB-ARCH-D', base: { x: 0, y: 0 }, entities: [
    rect('0', 0.5, 0.5, 35.5, 23.5), rect('0', 0.5, 0.5, 35.5, 2.5), line('0', 18, 0.5, 18, 2.5), line('0', 25, 0.5, 25, 2.5), line('0', 30, 0.5, 30, 2.5),
    text('0', 0.75, 2.1, 0.12, 'PROJECT'), text('0', 18.25, 2.1, 0.12, 'SCALE'), text('0', 18.25, 1.1, 0.12, 'DATE'), text('0', 25.25, 2.1, 0.12, 'DRAWN BY'), text('0', 30.25, 2.1, 0.12, 'SHEET'),
  ], attdefs: [ad('PROJECT', 'Project', 'SAMPLE HOUSE', 0.75, 1.55, 0.3), ad('TITLE', 'Drawing title', 'TITLE', 0.75, 0.8, 0.4), ad('SCALE', 'Scale', '1/4" = 1\'-0"', 18.25, 1.6, 0.18),
    ad('DATE', 'Date', date, 18.25, 0.65, 0.18), ad('DRAWN', 'Drawn by', 'CADCRAFT', 25.25, 1.1, 0.25), ad('SHEET', 'Sheet number', 'A-101', 30.25, 0.8, 0.8)] });
  // sheets: ARCH D, one viewport each, the title block with its values
  const sheet = (name, title, scaleLabel, s, cx, cy, w, h) => {   // the viewport w × h (paper inches), centred above the title strip
    const paper = makePaper('arch-d');
    return { name, paper, entities: [
      { type: 'viewport', layer: 'Viewports', x: 18, y: 13, w, h, cx, cy, s },
      { type: 'insert', layer: 'G-TTLB', block: 'TB-ARCH-D', x: 0, y: 0, sx: 1, sy: 1, rot: 0, attrs: { PROJECT: 'SAMPLE HOUSE', TITLE: title, SCALE: scaleLabel, DATE: date, DRAWN: 'CADCRAFT', SHEET: name.split(' ')[0] } },
    ] };
  };
  const layouts = [
    sheet('A-101 FLOOR PLAN', 'FLOOR PLAN', '1/4" = 1\'-0"', 1 / 48, 255, 115, 16, 13),
    sheet('A-201 ELEVATIONS', 'FRONT ELEVATION', '1/4" = 1\'-0"', 1 / 48, 240, ey + 80, 14, 9),
    sheet('A-301 SECTIONS', 'SECTION A-A', '1/4" = 1\'-0"', 1 / 48, sx + 168, 50, 12, 9),
    sheet('A-501 DETAILS', 'WALL DETAIL', '1 1/2" = 1\'-0"', 1 / 8, dx + 35, 35, 18, 19),
  ];
  return { name: 'Sample house', layers, blocks, entities: e, layouts, meta: { name: 'sample-house', units: 'inches', lunits: 4, luprec: 4 }, dimStyle: arch };
}

// -------------------------------------------------------------------------------------------- the as-built (millimetres)
function asbuilt() {
  const layers = [
    { name: 'SCAN-SLICE', color: 8 }, { name: 'AB-WALL', color: 7, lineweight: 0.5 }, { name: 'AB-COLUMN', color: 4 }, { name: 'AB-DIMS-MM', color: 1 },
    { name: 'AB-DIMS-FTIN', color: 30 }, { name: 'AB-TEXT', color: 3 }, { name: 'REV-1', color: 1 }, { name: 'G-TTLB', color: 7 }, { name: 'Viewports', color: 8, plot: false },
  ];
  const e = [];
  // the room as measured: 6000 wide, 4500 deep, the east wall 35 mm out of square over its length
  const C = [{ x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 6035, y: 4500 }, { x: 0, y: 4500 }];
  let seed = 20261016;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 - 0.5; };
  for (let i = 0; i < 4; i++) {   // the slice: a point every ~40 mm along each wall face, ±6 mm of noise
    const a = C[i], b = C[(i + 1) % 4], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.round(L / 40);
    for (let k = 0; k < n; k++) { const t = k / n; e.push({ type: 'point', layer: 'SCAN-SLICE', x: a.x + (b.x - a.x) * t + rnd() * 12, y: a.y + (b.y - a.y) * t + rnd() * 12 }); }
  }
  e.push({ type: 'poly', layer: 'AB-WALL', closed: true, pts: C.map((p) => P(p.x, p.y)) });
  e.push({ type: 'poly', layer: 'AB-WALL', closed: true, pts: [P(-200, -200), P(6200, -200), P(6240, 4700), P(-200, 4700)] });
  e.push(rect('AB-COLUMN', 2900, 2150, 3200, 2450));
  e.push({ type: 'hatch', layer: 'AB-COLUMN', solid: false, pattern: 'ANSI31', pscale: 10, loops: [[2900, 2150, 3200, 2150, 3200, 2450, 2900, 2450, 2900, 2150]] });
  e.push({ type: 'poly', layer: 'AB-WALL', closed: false, pts: [P(800, 0), P(800, 900)] }, { type: 'arc', layer: 'AB-WALL', cx: 800, cy: 0, r: 900, a0: 0, a1: Math.PI / 2 });
  // revisions: what the survey found different from the design
  const c1 = revcloud([{ x: 5700, y: 3900 }, { x: 6400, y: 3900 }, { x: 6400, y: 4800 }, { x: 5700, y: 4800 }], true, 250);
  const c2 = revcloud([{ x: 2750, y: 2000 }, { x: 3350, y: 2000 }, { x: 3350, y: 2600 }, { x: 2750, y: 2600 }], true, 200);
  e.push({ ...c1, layer: 'REV-1' }, { ...c2, layer: 'REV-1' });
  for (const [x, y] of [[6450, 4850], [3400, 2650]]) e.push({ type: 'poly', layer: 'REV-1', closed: true, pts: [P(x, y), P(x + 300, y), P(x + 150, y + 260)] }, text('REV-1', x + 150, y + 70, 120, '1', { ha: 'center' }));
  e.push(text('AB-TEXT', 6500, 4300, 100, 'EAST WALL 35 OUT OF SQUARE'), text('AB-TEXT', 3450, 2300, 100, 'COLUMN 300 × 300 (DESIGN 250)'));
  e.push(text('AB-TEXT', 2200, 3000, 180, 'OFFICE'), text('AB-TEXT', 2200, 2780, 100, 'AS MEASURED 2026-10-16'));
  const mm = { ...DIM_DEFAULTS, txt: 2.5, asz: 2.5, exe: 1.25, exo: 0.625, gap: 0.625, scale: 25, lunit: 2, dec: 0 };
  const ftin = { ...mm, lunit: 4, dec: 4, lfac: 1 / 25.4 };
  const dim = (layer, st, p1, p2, loc, rot) => ({ type: 'dim', layer, kind: 'linear', p1, p2, loc, rot, text: '', st: { ...st } });
  e.push(dim('AB-DIMS-MM', mm, { x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 0, y: -600 }, 0), dim('AB-DIMS-MM', mm, { x: 6000, y: 0 }, { x: 6035, y: 4500 }, { x: 6700, y: 0 }, Math.PI / 2),
    dim('AB-DIMS-MM', mm, { x: 0, y: 2150 }, { x: 2900, y: 2150 }, { x: 0, y: 1700 }, 0));
  e.push(dim('AB-DIMS-FTIN', ftin, { x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 0, y: -1000 }, 0), dim('AB-DIMS-FTIN', ftin, { x: 6000, y: 0 }, { x: 6035, y: 4500 }, { x: 7100, y: 0 }, Math.PI / 2));
  e.push({ type: 'dim', layer: 'AB-DIMS-MM', kind: 'aligned', p1: { x: 6000, y: 0 }, p2: { x: 6035, y: 4500 }, loc: { x: 6300, y: 2250 }, text: '', st: { ...mm } });
  // A3 title block, millimetres
  const blocks = [{ name: 'TB-A3', base: { x: 0, y: 0 }, entities: [
    rect('0', 10, 10, 410, 287), rect('0', 230, 10, 410, 42), line('0', 230, 26, 410, 26), line('0', 350, 10, 350, 42), line('0', 290, 10, 290, 26),
    text('0', 232, 38, 1.8, 'PROJECT'), text('0', 232, 22, 1.8, 'TITLE'), text('0', 292, 22, 1.8, 'SCALE / DATE'), text('0', 352, 38, 1.8, 'SHEET'), text('0', 352, 22, 1.8, 'REVISION'),
  ], attdefs: [ad('PROJECT', 'Project', 'SAMPLE AS-BUILT', 232, 29, 4), ad('TITLE', 'Drawing title', 'AS-BUILT PLAN', 232, 13, 3.5), ad('SCALE', 'Scale', '1:25', 292, 17, 2.5),
    ad('DATE', 'Date', date, 292, 12, 2.5), ad('SHEET', 'Sheet number', 'AB-101', 352, 29, 5), ad('REV', 'Revision', '1', 352, 13, 4)] }];
  const paper = makePaper('iso-a3');
  const layouts = [{ name: 'AB-101 AS-BUILT PLAN', paper, entities: [
    { type: 'viewport', layer: 'Viewports', x: 205, y: 165, w: 370, h: 235, cx: 3750, cy: 2250, s: 1 / 25 },
    { type: 'insert', layer: 'G-TTLB', block: 'TB-A3', x: 0, y: 0, sx: 1, sy: 1, rot: 0, attrs: { PROJECT: 'SAMPLE AS-BUILT', TITLE: 'AS-BUILT PLAN', SCALE: '1:25', DATE: date, SHEET: 'AB-101', REV: '1' } },
  ] }];
  return { name: 'Sample as-built', layers, blocks, entities: e, layouts, meta: { name: 'sample-asbuilt', units: 'millimeters', lunits: 2, luprec: 0 }, dimStyle: mm };
}

fs.mkdirSync(OUT, { recursive: true });
const index = [];
for (const [stem, make, about] of [['sample-house', house, 'samples.house'], ['sample-asbuilt', asbuilt, 'samples.asbuilt']]) {
  const data = make();
  const doc = new Doc();
  doc.load(data);
  const dwg = saveDwg(doc, { version: '2018' }).bytes, dxf = writeDxf2000(doc).text;
  fs.writeFileSync(path.join(OUT, stem + '.dwg'), dwg);
  fs.writeFileSync(path.join(OUT, stem + '.dxf'), dxf);
  fs.copyFileSync(path.join(OUT, stem + '.dwg'), path.join(SHOW, 'cadcraft-' + stem + '.dwg'));
  fs.copyFileSync(path.join(OUT, stem + '.dxf'), path.join(SHOW, 'cadcraft-' + stem + '.dxf'));
  index.push({ file: stem + '.dwg', dxf: stem + '.dxf', title: about + '.title', about: about + '.about', bytes: dwg.length });
  console.log(`${stem}: ${doc.model.size} objects, ${doc.layouts.length} sheets, DWG ${dwg.length} bytes, DXF ${dxf.length} bytes`);
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ format: 'cadcraft-samples', version: 1, license: 'CC0-1.0', samples: index }, null, 2) + '\n');
