#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-sheetset.mjs — the public sheet-set fixture (0.4 part 2, Z.10): three drawings with two sheets each and the set file,
 * drawn here by CadCraft's own modules, so it holds nothing but what this script says.
 *
 *   node tools/cadcraft-test/make-sheetset.mjs [--out <dir>] [--check]
 *
 * Writes (default tools/cadcraft-test/fixtures/sheetset/):
 *   Clinic.ccsheets          the set: project fields, subsets Architectural (Plans, Details) and Structural, six sheets
 *   plans/Level 1.dwg        DWG 2018: sheets "Plan 1" and "Ceiling 1" — title block tags SHEETNUMBER / SHEETTITLE / PROJECTNAME
 *   plans/Level 2.dxf        DXF 2000: sheets "Plan 2" and "Roof"      — the same block
 *   details/Details.dwg      DWG 2000: sheets "D1" and "S1"            — a title block with aliases (SHEET_NO, TITLE, PROJECT_NO);
 *                            it links ..\plans\Level 1.dwg as an external reference (not loaded)
 * Each sheet: an A3 paper, one viewport on the model, a title block in the lower right. --check: the files on disk are what
 * this script writes (byte for byte, apart from the DWG date stamps).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { attdef } = await load('attrs.js');
const { saveDwg } = await load('dwg-save.js');
const { writeDxf2000 } = await load('dxf2000.js');

const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const OUT = oi >= 0 ? path.resolve(args[oi + 1]) : path.join(ROOT, 'tools/cadcraft-test/fixtures/sheetset');
const CHECK = args.includes('--check');
const CREATED = new Date(Date.UTC(2026, 9, 13, 12, 0, 0));   // fixed, so the DWG bytes are the same every run

/** A drawing with a little model and two A3 sheets, each with a viewport and a title block reference. */
function drawing(sheets, { aliases = false } = {}) {
  const d = new Doc();
  d.meta.units = 'millimeters';
  const tags = aliases ? ['SHEET_NO', 'TITLE', 'PROJECT_NO'] : ['SHEETNUMBER', 'SHEETTITLE', 'PROJECTNAME'];
  d.change('fixture', () => {
    d.defineBlock({
      name: 'TITLEBLOCK', base: { x: 0, y: 0 },
      entities: [{ type: 'poly', layer: '0', color: 0, closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 180, y: 0, b: 0 }, { x: 180, y: 40, b: 0 }, { x: 0, y: 40, b: 0 }] },
        { type: 'line', layer: '0', color: 0, x1: 0, y1: 20, x2: 180, y2: 20 }],
      attdefs: [
        attdef({ x: 5, y: 26, h: 7 }, { tag: tags[0], prompt: 'Sheet number', def: '' }),
        attdef({ x: 60, y: 26, h: 5 }, { tag: tags[1], prompt: 'Sheet title', def: '' }),
        attdef({ x: 5, y: 6, h: 4 }, { tag: tags[2], prompt: 'Project', def: '' }),
      ],
    });
    d.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 20000, y: 0, b: 0 }, { x: 20000, y: 12000, b: 0 }, { x: 0, y: 12000, b: 0 }] });
    // the details drawing links the level 1 plan (an external reference by a relative path), for the archive (Z.7)
    if (aliases) { d.defineBlock({ name: 'Level 1', base: { x: 0, y: 0 }, entities: [], xref: { path: '..\\plans\\Level 1.dwg', loaded: false } }); d.add({ type: 'insert', layer: '0', block: 'Level 1', x: 0, y: 0, sx: 1, sy: 1, rot: 0 }); }
    d.add({ type: 'circle', layer: '0', cx: 10000, cy: 6000, r: 2000 });
  });
  d.layouts = sheets.map((name, i) => ({
    name, paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0, key: 'iso-a3' }, entities: new Map([
      ['v' + i, { id: 'v' + i, type: 'viewport', layer: '0', color: null, x: 200, y: 160, w: 360, h: 220, cx: 10000, cy: 6000, s: 1 / 100 }],
      ['t' + i, { id: 't' + i, type: 'insert', layer: '0', color: null, block: 'TITLEBLOCK', x: 230, y: 10, sx: 1, sy: 1, rot: 0, attrs: { [tags[0]]: '?', [tags[1]]: '?', [tags[2]]: '?' } }],
    ]),
  }));
  return d;
}

const set = {
  format: 'cadcraft-sheetset', version: 1, name: 'Riverside Clinic',
  properties: { PROJECTNAME: 'Riverside Clinic', PROJECTNUMBER: '2026-014', CLIENT: 'Example Health Co.' },
  layoutNames: 'number-title',
  sheets: [],
  subsets: [
    { id: 'arch', name: 'Architectural', sheets: [], subsets: [
      { id: 'plans', name: 'Plans', sheets: [
        { id: 'p1', file: 'plans/Level 1.dwg', layout: 'Plan 1', number: 'A-101', title: 'Level 1 floor plan' },
        { id: 'p2', file: 'plans/Level 2.dxf', layout: 'Plan 2', number: 'A-102', title: 'Level 2 floor plan' },
        { id: 'c1', file: 'plans/Level 1.dwg', layout: 'Ceiling 1', number: 'A-201', title: 'Level 1 reflected ceiling' },
        { id: 'rf', file: 'plans/Level 2.dxf', layout: 'Roof', number: 'A-301', title: 'Roof plan' },
      ], subsets: [] },
      { id: 'det', name: 'Details', sheets: [
        { id: 'd1', file: 'details/Details.dwg', layout: 'D1', number: 'A-501', title: 'Wall details' },
      ], subsets: [] },
    ] },
    { id: 'str', name: 'Structural', sheets: [
      { id: 's1', file: 'details/Details.dwg', layout: 'S1', number: 'S-101', title: 'Foundation plan' },
    ], subsets: [] },
  ],
};

const files = {
  'Clinic.ccsheets': JSON.stringify(set, null, 2) + '\n',
  'plans/Level 1.dwg': saveDwg(drawing(['Plan 1', 'Ceiling 1']), { version: '2018', created: CREATED }).bytes,
  'plans/Level 2.dxf': writeDxf2000(drawing(['Plan 2', 'Roof'])).text,
  'details/Details.dwg': saveDwg(drawing(['D1', 'S1'], { aliases: true }), { version: '2000', created: CREATED }).bytes,
};

const { readDwg } = await load('dwg/read.js');
const { importDwg } = await load('dwg-import.js');
async function sameDrawing(a, b) {
  const sum = (bytes) => {
    const r = importDwg(readDwg(new Uint8Array(bytes)), { versionTag: new TextDecoder().decode(bytes.subarray(0, 6)) });
    return JSON.stringify({ v: r.meta.version, n: r.entities.length, layouts: r.layouts.map((l) => [l.name, l.entities.map((e) => [e.type, e.attrs || null])]), blocks: r.blocks.map((x) => [x.name, (x.attdefs || []).map((d) => d.tag)]) });
  };
  return sum(a) === sum(b);
}

let bad = 0;
for (const [rel, data] of Object.entries(files)) {
  const f = path.join(OUT, rel);
  const bytes = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);
  if (CHECK) {
    // a DWG carries a fresh GUID each time it is written: compare what it holds instead of its bytes
    const same = fs.existsSync(f) && (/\.dwg$/.test(rel) ? await sameDrawing(fs.readFileSync(f), bytes) : fs.readFileSync(f).equals(bytes));
    if (!same) { bad++; console.log('differs: ' + rel); }
    continue;
  }
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, bytes);
  console.log('wrote ' + path.relative(ROOT, f) + ' (' + bytes.length + ' bytes)');
}
if (CHECK) { console.log(bad ? bad + ' file(s) differ: run without --check' : 'the fixture is current'); process.exit(bad ? 1 : 0); }
