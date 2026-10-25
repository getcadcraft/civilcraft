#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-dyn-attrs.mjs — the public fixture fixtures/dwg/dyn-attrs-visibility.dwg (0.6.1 FIX-061-DYN-ATTRS): a dynamic block
 * whose visibility states show DIFFERENT attribute definitions, as Karol's electrical blocks do.
 *
 *   node tools/cadcraft-test/make-dyn-attrs.mjs [--out <file.dwg>]
 *
 * Ours from the first line: no AutoCAD sample goes into it. The dynamic-block objects are written from the layouts in
 * docs/DWG-DYNAMIC-BLOCKS.md (found by experiment; the ODA spec does not describe them): an ACAD_EVALUATION_GRAPH holding one
 * node — the BLOCKVISIBILITYPARAMETER (cc-dwg dynblock-write.js encodeVisibility) — under the block record's extension
 * dictionary (ACAD_ENHANCEDBLOCK). The graph's edges, a visibility grip and its expressions are left out: docs § DB.10 says
 * we can't write those, and cc-dwg does not need them to read the states. So this file is for CadCraft's (and cc-dwg's)
 * tests; whether AutoCAD or GstarCAD accept it is NOT known. Saved as AutoCAD 2007 (AC1021), the version the layouts were
 * found in, through CadCraft's own DWG save (dwg-save.js, which writes the references' copies and representation data).
 *
 * The block CC-SOCKET (mm): a frame, socket circles and a cover line; attribute definitions CIRCUIT and ROOM in every state,
 * RATING in Single and Double, GANG in Double only, IP in Outdoor only. States Single (the definition's), Double, Outdoor.
 * Three references, one per state, each carrying a value for EVERY tag (CIRCUIT L1-03 / L1-04 / L2-01, ROOM Łazienka /
 * Kuchnia / Taras, RATING 16A, GANG 2, IP IP44) — the hidden ones too, flagged invisible, as AutoCAD keeps them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(REPO, 'public_html/assets/apps/cadcraft/dev');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const OUT = oi >= 0 ? args[oi + 1] : path.join(REPO, 'fixtures/dwg/dyn-attrs-visibility.dwg');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);

const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { saveDwg } = await load('dwg-save.js');
const { setVisibility } = await load('dyn-blocks.js');
const { attdef } = await load('attrs.js');
const { encodeVisibility } = await load('dwg/dynblock-write.js');
const { BitWriter } = await load('dwg/bits-write.js');
const { b64 } = await load('dwg/bits-util.js');

// file handles of our own (cc-dwg maps every one to the handles it writes)
const REC = 'C000', XD = 'C010', GRAPH = 'C011', PARAM = 'C012';
const H = (i) => (0xc001 + i).toString(16).toUpperCase();

// ---- the block's file objects, in file order
const L = (x1, y1, x2, y2) => ({ type: 'line', layer: 'E-SOCKET', color: null, x1, y1, x2, y2 });
const ad = (tag, prompt, x, y) => attdef({ x, y, h: 2.5, rot: 0, ha: 'left', va: 'baseline', layer: 'E-TEXT' }, { tag, prompt, def: '' });
const objects = [
  { e: { type: 'poly', layer: 'E-SOCKET', color: null, closed: true, pts: [{ x: -6, y: -6, b: 0 }, { x: 6, y: -6, b: 0 }, { x: 6, y: 6, b: 0 }, { x: -6, y: 6, b: 0 }] } },   // 0 frame
  { e: { type: 'circle', layer: 'E-SOCKET', color: null, cx: 0, cy: 0, r: 4 } },                     // 1 socket
  { e: { type: 'circle', layer: 'E-SOCKET', color: null, cx: 0, cy: 0, r: 2 } },                     // 2 second socket (Double)
  { e: L(-6, 7, 6, 7) },                                                                              // 3 cover (Outdoor)
  { d: ad('CIRCUIT', 'Circuit', 8, 3) },                                                              // 4
  { d: ad('ROOM', 'Room', 8, -1) },                                                                   // 5
  { d: ad('RATING', 'Rating', 8, -5) },                                                               // 6
  { d: ad('GANG', 'Gang', 8, -9) },                                                                   // 7
  { d: ad('IP', 'Protection', 8, -5) },                                                               // 8
];
const STATES = [
  { name: 'Single', show: [0, 1, 4, 5, 6] },
  { name: 'Double', show: [0, 1, 2, 4, 5, 6, 7] },
  { name: 'Outdoor', show: [0, 1, 3, 4, 5, 8] },
];
const saved = new Set(STATES[0].show);   // the definition is saved in its first state
const all = objects.map((o) => (o.e ? [o.e] : []));
const shown = objects.map((_, i) => saved.has(i));
const adIdx = objects.map((o, i) => (o.d ? i : -1)).filter((i) => i >= 0);

// ---- the dynamic-block objects (docs/DWG-DYNAMIC-BLOCKS.md)
const VER = 21;   // AutoCAD 2007
const vis = encodeVisibility({
  ver: VER, id: -1, release: 27, maint: 1, tag: 0, name: 'Visibility State', b: [1, 0], pad: [256, 1, 0, 0], point: { x: 0, y: -8, z: 0 },
  z: [0, 0], grip: 0, label: 'Visibility', description: 'Socket type', f2: [1, 0],
  all: objects.map((_, i) => [4, H(i)]),
  states: STATES.map((s) => ({ name: s.name, entities: s.show.map((i) => [4, H(i)]), elements: [] })),
}, VER);
// the graph: BL a, BL b, BL node count, per node BL index into the handle list, BL flags (32), BL node id, BL ×4 edges (-1);
// no edges after (cc-dwg's graphNodes reads the nodes only); no strings: the R2007 string-stream flag bit 0
const g = new BitWriter('AC1021');
g.BL(1); g.BL(1); g.BL(1);
g.BL(0); g.BL(32); g.BL(1); g.BL(-1); g.BL(-1); g.BL(-1); g.BL(-1);
g.B(0);
const graph = { ver: VER, n: g.bit, data: b64(g.bytes()), h: [[3, PARAM]] };
const cls = (num, cppName, dxfName, maint = 55) => ({ num, proxyFlags: 1153, appName: 'ObjectDBX Classes', cppName, dxfName, wasZombie: false, isEntity: false, instanceCount: 1, dwgVersion: 25, maintVersion: maint });
const classes = [cls(500, 'AcDbEvalGraph', 'ACAD_EVALUATION_GRAPH'), cls(501, 'AcDbBlockVisibilityParameter', 'BLOCKVISIBILITYPARAMETER'), cls(502, 'AcDbBlockRepresentationData', 'ACDB_BLOCKREPRESENTATION_DATA', 58)];
const dynObjects = [
  { handle: XD, owner: REC, reactors: [REC], type: 'DICTIONARY', entries: { ACAD_ENHANCEDBLOCK: GRAPH }, hardOwner: 1, cloning: 1 },
  { handle: GRAPH, owner: XD, reactors: [XD], type: 'ACAD_EVALUATION_GRAPH', undecoded: true, typeNum: 500, className: 'AcDbEvalGraph', raw: graph },
  { handle: PARAM, owner: GRAPH, reactors: [GRAPH], type: 'BLOCKVISIBILITYPARAMETER', undecoded: true, typeNum: 501, className: 'AcDbBlockVisibilityParameter', raw: vis },
];

// ---- the drawing
const doc = new Doc();
const values = [
  { CIRCUIT: 'L1-03', ROOM: 'Łazienka', RATING: '16A', GANG: '2', IP: 'IP44' },
  { CIRCUIT: 'L1-04', ROOM: 'Kuchnia', RATING: '16A', GANG: '2', IP: 'IP44' },
  { CIRCUIT: 'L2-01', ROOM: 'Taras', RATING: '16A', GANG: '2', IP: 'IP44' },
];
doc.load({
  meta: { units: 'mm' },
  layers: [{ name: '0', color: 7 }, { name: 'E-SOCKET', color: 3 }, { name: 'E-TEXT', color: 7 }],
  blocks: [{
    name: 'CC-SOCKET', base: { x: 0, y: 0 }, entities: all.filter((_, i) => shown[i]).flat(), attdefs: adIdx.map((i) => objects[i].d),
    dyn: { src: REC, x: XD, h: objects.map((_, i) => H(i)), shown, all, ad: adIdx, def: true, params: [{ node: 1, kind: 'visibility', name: 'Visibility State' }],
      vis: { node: 1, name: 'Visibility State', label: 'Visibility', param: PARAM, point: { x: 0, y: -8 }, states: STATES.map((s) => ({ name: s.name, show: [...s.show] })) } },
  }],
  entities: values.map((v, k) => ({ type: 'insert', layer: '0', color: null, block: 'CC-SOCKET', x: k * 40, y: 0, sx: 1, sy: 1, rot: 0, attrs: { ...v },
    dyn: { state: 'Single', values: [{ node: 1, kind: 'visibility', state: 'Single', point: { x: 0, y: -8 } }], src: (0xc100 + k).toString(16).toUpperCase() } })),
  dynSrc: { version: 'AC1021', maintenance: 6, objects: dynObjects, classes, records: [REC] },
});
const refs = [...doc.model.values()];
for (const [k, st] of [[1, 'Double'], [2, 'Outdoor']]) {
  const r = setVisibility(doc, refs[k].id, st, doc.model);
  if (!r.ok) throw new Error('setVisibility ' + st + ': ' + JSON.stringify(r));
}
const out = saveDwg(doc, { version: '2007' });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.bytes);
console.log('wrote ' + path.relative(REPO, OUT) + ' (' + out.bytes.length + ' bytes; ' + (out.report.notes || []).join(' | ') + ')');
