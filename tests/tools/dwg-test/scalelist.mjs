#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scalelist.mjs — the drawing's scale list in DWG and DXF 2000 (0.7 D7.19, session cad-07): ACAD_SCALELIST + SCALE objects.
 *
 *   node tools/dwg-test/scalelist.mjs [--keep]
 *
 *   1. our own round trip: a model with `scales` written as AutoCAD 2000 … 2018 and read again (names, paper and drawing units,
 *      the unit-scale flag); a source file's own ACAD_SCALELIST is replaced, not copied twice
 *   2. (needs the ODA File Converter + xvfb) our DWG, and CadCraft's DXF 2000, → ODA → DXF 2018: the SCALE objects carry the same
 *      values as proper classes, the dictionary ACAD_SCALELIST is in the named object dictionary, audit clean
 * Files in tmp/scalelist-check/ (removed unless --keep).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, flag } from './lib/util.mjs';

const L = (f) => import(pathToFileURL(path.join(REPO, 'lib/dwg', f)).href);
const { readDwg } = await L('read.js');
const { writeDwg } = await L('write.js');
const KEEP = flag('--keep');
const ODA = path.join(REPO, 'tools/civilcraft-test/venv/dwg-readers/oda/AppRun');
const DIR = path.join(REPO, 'tmp/scalelist-check');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (c || !extra ? '' : '  — ' + extra)); return !!c; };
const VERSIONS = ['2000', '2004', '2007', '2010', '2013', '2018'];
const SCALES = [{ name: '1:1', paperUnits: 1, drawingUnits: 1, unitScale: true }, { name: '1:75', paperUnits: 1, drawingUnits: 75 }, { name: '1/4" = 1\'-0"', paperUnits: 0.25, drawingUnits: 12 }, { name: 'Site plan', paperUnits: 2, drawingUnits: 300 }];
const model = () => ({ header: { INSUNITS: 4 }, tables: { blockRecords: [{ handle: 'A1', name: '*Model_Space' }] }, scales: SCALES,
  blocks: [{ name: '*Model_Space', record: 'A1', entities: [{ type: 'LINE', layer: '0', start: { x: 0, y: 0, z: 0 }, end: { x: 9, y: 9, z: 0 } }] }] });
const key = (list) => JSON.stringify(list.map((s) => [s.name, s.paperUnits, s.drawingUnits, !!s.unitScale]));

console.log('\n== 1. our own round trip, AutoCAD 2000 … 2018');
for (const v of VERSIONS) {
  const out = writeDwg(model(), { version: v });
  const back = readDwg(out.bytes);
  const sc = back.objects.filter((o) => o.type === 'SCALE');
  ok(key(sc) === key(SCALES), v + ': four scales come back with their units and the unit-scale flag', key(sc));
  const nod = back.objects.find((o) => o.type === 'DICTIONARY' && o.entries?.ACAD_SCALELIST);
  const dict = nod && back.objects.find((o) => o.handle === nod.entries.ACAD_SCALELIST);
  ok(dict && Object.values(dict.entries).length === 4 && sc.every((s) => Object.values(dict.entries).includes(s.handle)), v + ': ACAD_SCALELIST (in the named object dictionary) holds them');
}
{
  // a list that came from a file is replaced by the model's, never doubled
  const once = readDwg(writeDwg(model(), { version: '2018' }).bytes);
  const next = { ...once, scales: SCALES.slice(0, 2) };
  const twice = readDwg(writeDwg(next, { version: '2018' }).bytes);
  ok(twice.objects.filter((o) => o.type === 'SCALE').length === 2, 'a list read from a file and written with 2 scales has 2 (not 6)', String(twice.objects.filter((o) => o.type === 'SCALE').length));
  const none = readDwg(writeDwg({ ...once, scales: undefined }, { version: '2018' }).bytes);
  ok(none.objects.filter((o) => o.type === 'SCALE').length === 4, 'without model.scales the source\'s list is still copied as before (other apps)');
}

const xvfb = (() => { try { return execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim(); } catch { return ''; } })();
if (!fs.existsSync(ODA) || !xvfb) console.log('\n  note: the ODA File Converter (or xvfb-run) is not set up — section 2 is skipped');
else {
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.mkdirSync(DIR, { recursive: true });
  const oda = (inD, outD, ver, fmt, ext) => { fs.mkdirSync(outD, { recursive: true }); spawnSync(xvfb, ['-a', ODA, inD, outD, ver, fmt, '0', '1', '*.' + ext], { encoding: 'utf8', timeout: 600000 }); };
  const records = (txt) => {
    const a = txt.replace(/\r/g, '').split('\n'), out = []; let cur = null;
    for (let i = 0; i + 1 < a.length; i += 2) { const c = a[i].trim(), v = a[i + 1]; if (c === '0') { cur = { type: v.trim(), pairs: [] }; out.push(cur); } else if (cur) cur.pairs.push([c, v]); }
    return out;
  };
  const g = (r, c) => r.pairs.find(([k]) => k === c)?.[1];
  console.log('\n== 2. our DWG and CadCraft\'s DXF 2000 → ODA File Converter → DXF 2018');
  const inD = path.join(DIR, 'ours');
  fs.mkdirSync(inD, { recursive: true });
  for (const v of VERSIONS) fs.writeFileSync(path.join(inD, 'ours-' + v + '.dwg'), writeDwg(model(), { version: v }).bytes);
  // CadCraft's DXF 2000 for a drawing with the same list
  const A = path.join(REPO, 'public_html/assets/apps/cadcraft/dev/');
  const I18n = await import(pathToFileURL(A + 'i18n.js').href);
  I18n.init({ strings: JSON.parse(fs.readFileSync(A + 'lang/en.json', 'utf8')) });
  const { Doc } = await import(pathToFileURL(A + 'doc.js').href);
  const { writeDxf2000 } = await import(pathToFileURL(A + 'dxf2000.js').href);
  const d = new Doc(); d.meta.scales = SCALES.map((s) => ({ name: s.name, paper: s.paperUnits, drawing: s.drawingUnits, ...(s.unitScale ? { unit: true } : {}) }));
  d.change('x', () => d.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 9, y2: 9 }));
  fs.writeFileSync(path.join(inD, 'cc-dxf2000.dxf'), writeDxf2000(d).text);
  oda(inD, path.join(DIR, 'out'), 'ACAD2018', 'DXF', 'dwg');
  oda(inD, path.join(DIR, 'out'), 'ACAD2018', 'DXF', 'dxf');
  for (const name of [...VERSIONS.map((v) => 'ours-' + v), 'cc-dxf2000']) {
    const f = path.join(DIR, 'out', name + '.dxf');
    if (!ok(fs.existsSync(f), name + ': ODA opens it')) continue;
    ok(!fs.existsSync(f + '.err'), name + ': audit is clean', fs.existsSync(f + '.err') ? fs.readFileSync(f + '.err', 'utf8').slice(0, 200) : '');
    const recs = records(fs.readFileSync(f, 'latin1'));
    const sc = recs.filter((r) => r.type === 'SCALE');
    ok(sc.length >= 4 && SCALES.every((s) => sc.some((r) => g(r, '300') === s.name && Math.abs(parseFloat(g(r, '140')) - s.paperUnits) < 1e-9 && Math.abs(parseFloat(g(r, '141')) - s.drawingUnits) < 1e-9)), name + ': ODA finds the four SCALE objects with their names and units', sc.map((r) => g(r, '300')).join(' | '));
    ok(recs.some((r) => r.type === 'DICTIONARY' && r.pairs.some(([k, v]) => k === '3' && v.trim() === 'ACAD_SCALELIST')), name + ': ACAD_SCALELIST is in the named object dictionary');
  }
}
if (!KEEP) fs.rmSync(DIR, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
