#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tables-readers.mjs — CadCraft tables saved as DWG, read back by other programs (1.0 ORS.1). Not part of bin/test-tables.mjs
 * (it starts the ODA File Converter under xvfb): run it by hand after changing how a table is written.
 *
 * Saves a drawing with three tables (formulas, a two-line cell, a merged cell, a turned table, a second style) in every DWG
 * version, reads each file with the readers of tools/civilcraft-test/setup-dwg-readers.sh, and checks: no reader problems
 * (ODA audit on), the ODA DXF has the tables as ACAD_TABLE with the cell texts, and CadCraft opens that DXF's tables as
 * editable tables again with the same cells.
 *   node tools/cadcraft-test/tables-readers.mjs [--keep]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const T = await load('tables.js');
const C = await load('tables-cad.js');
const { Doc } = await load('doc.js');
const { saveDwg } = await load('dwg-save.js');
const { readDxf } = await load('dxf.js');
const { availableReaders } = await import(pathToFileURL(path.join(ROOT, 'tools/civilcraft-test/dwg-readers.mjs')).href);
C.installTablesHook(Doc);

let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) pass++; else { fail++; console.log('FAIL', m, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400)); } };
const readers = availableReaders(path.join(ROOT, 'tools/civilcraft-test'));
if (!readers.length) { console.log('skipped: no DWG reader installed (tools/civilcraft-test/setup-dwg-readers.sh)'); process.exit(0); }

const d = new Doc();
let rec = T.tableFromRows([['Item', 'Qty', 'Price'], ['Door', '2', '10.5'], ['Window\nwide', '3', '20']], { title: 'Schedule', h: 2.5 });
rec = T.setCells(rec, 4, 0, [['Total', '=Sum(B3:B4)', '=B3*C3+B4*C4']], { grow: true });
rec = T.setCell(rec, 2, 0, null, { a: 'MR', h: 3 });
C.addTable(d, rec, { x: 10, y: 20 }, { rot: 0.3 });
C.addTable(d, T.newTable({ rows: 2, cols: 2, h: 5, style: T.cleanStyle({ name: 'Big', data: { h: 5 } }) }), { x: 200, y: 50 });
C.addTable(d, T.merge(T.tableFromRows([['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6']], { h: 2 }), 1, 0, 2, 1), { x: 0, y: -100 });
d.change('l', () => d.add({ type: 'line', x1: 0, y1: 0, x2: 10, y2: 10 }));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-tables-'));
const files = [];
for (const v of ['2000', '2004', '2007', '2010', '2013', '2018']) { const f = path.join(dir, 'tables-' + v + '.dwg'); fs.writeFileSync(f, saveDwg(d, { version: v }).bytes); files.push(f); }
for (const rd of readers) {
  const res = rd.run(files, dir);
  for (const [f, r] of res) {
    const name = rd.name.split(' ')[0] + ' ' + path.basename(f);
    ok(!r.problems.length, name + ': no problems reading it', r.problems);
    if (!fs.existsSync(r.dxf)) continue;
    const text = fs.readFileSync(r.dxf, 'utf8');
    if (!/^ODA/.test(rd.name)) { ok(/Window/.test(text), name + ': the table\'s words are in what it read'); continue; }
    ok((text.match(/\n\s*0\r?\nACAD_TABLE\r?\n/g) || []).length === 3, name + ': three tables, as table objects');
    const b = new Doc();
    b.load(readDxf(text));
    const ts = C.tablesOf(b);
    const shown = ts.map((x) => T.display(x.rec));
    ok(ts.length === 3 && shown.some((s) => s[4] && s[4].join() === 'Total,5,81' && s[3][0] === 'Window\nwide'), name + ': its DXF opens in CadCraft as three tables with the same cells', shown);
    ok(ts.some((x) => x.rec.merges.some((m) => m.join() === '1,0,2,1')) && ts.some((x) => Math.abs(x.ent.rot - 0.3) < 1e-6), name + ': the merged cell and the turned table come back');
  }
}
if (!process.argv.includes('--keep')) fs.rmSync(dir, { recursive: true, force: true }); else console.log('kept ' + dir);
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
