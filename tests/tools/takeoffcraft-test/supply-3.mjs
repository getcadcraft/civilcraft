#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** supply-3.mjs — 0.8 EG.51 rest (session takeoff_PART_3): Excel supplier files and supplier prices into the price Library, without a browser.
 *  node tools/takeoffcraft-test/supply-3.mjs [--verbose] */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const S = await load('supply.js'), X = await load('xlsx.js'), R = await load('xlsx-read.js');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));

console.log('\nReading an Excel file');
const head = ['SKU', 'Description', 'In Stock', 'Lead Time', 'UOM', 'Unit Price', 'Vendor'];
const data = [['Supplier price list'], [], head,
  ['ST-248', '2x4 Stud, 8 ft', 300, '3 days', 'EA', 3.85, 'Acme & Sons <Lumber>'],
  ['DW-58', 'Drywall 5/8" 4x8', 1200, '', 'SF', 0.52, 'Acme'],
  ['RB-4', 'Rebar #4', 0, '3 weeks', 'LF', 0.91, 'Steel Co']];
for (const compress of [true, false]) {
  const bytes = await X.writeXlsx([{ name: 'Stock', rows: data }], { compress });
  const x = await R.readXlsxRows(bytes);
  ok(x.ok && x.sheet === 'Stock', 'our own writer reads back (' + (compress ? 'deflated' : 'stored') + ')', JSON.stringify(x).slice(0, 120));
  eq(x.rows[3], ['ST-248', '2x4 Stud, 8 ft', '300', '3 days', 'EA', '3.85', 'Acme & Sons <Lumber>'], 'cells: numbers as text, markup characters unescaped');
  eq(x.rows[1], [], 'an empty row stays a row (the header search skips it)');
  const r = S.readSupplyRows(x.rows);
  ok(r.ok && r.rows.length === 3, 'the supplier reader takes the sheet', JSON.stringify(r).slice(0, 120));
  eq([r.rows[0].price, r.rows[0].stock, r.rows[0].lead, r.rows[0].supplier, r.rows[2].lead], [38500, 300, 3, 'Acme & Sons <Lumber>', 21], 'price in 1/10000 $, stock, lead, vendor');
}
// a workbook as Excel writes it: a shared-strings table, a sheet reached through its relationship, a rich-text string, a gap in the columns, a bool
const wb = await X.zip([
  { name: 'xl/workbook.xml', data: '<workbook xmlns:r="x"><sheets><sheet name="Lager &amp; Co" sheetId="7" r:id="rId9"/><sheet name="Other" sheetId="8" r:id="rId10"/></sheets></workbook>' },
  { name: 'xl/_rels/workbook.xml.rels', data: '<Relationships><Relationship Id="rId10" Target="worksheets/sheet2.xml"/><Relationship Id="rId9" Type="x" Target="worksheets/sheet5.xml"/></Relationships>' },
  { name: 'xl/sharedStrings.xml', data: '<sst><si><t>Item</t></si><si><r><t>In </t></r><r><t>Stock</t></r></si><si><t xml:space="preserve">Lead time</t></si><si><t>Pipe 1&quot;</t></si><si><t>2 wks</t></si></sst>' },
  { name: 'xl/worksheets/sheet5.xml', data: '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="D1" t="s"><v>2</v></c></row><row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2"><v>40</v></c><c r="D2" t="s"><v>4</v></c></row></sheetData></worksheet>' },
  { name: 'xl/worksheets/sheet2.xml', data: '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>wrong sheet</t></is></c></row></sheetData></worksheet>' },
], { compress: true });
const w = await R.readXlsxRows(wb);
ok(w.ok && w.sheet === 'Lager & Co', 'the first sheet in the workbook order, found through its relationship', JSON.stringify(w));
eq(w.rows, [['Item', 'In Stock', '', 'Lead time'], ['Pipe 1"', '40', '', '2 wks']], 'shared strings, rich text, a gap in the columns');
const r2 = S.readSupplyRows(w.rows);
eq([r2.ok, r2.rows[0].name, r2.rows[0].stock, r2.rows[0].lead], [true, 'Pipe 1"', 40, 14], 'and the supplier reader gets stock and lead');

console.log('\nBad files');
const bad = async (b, code, name) => { const x = await R.readXlsxRows(b); ok(!x.ok && x.code === code, name, JSON.stringify(x).slice(0, 100)); };
await bad(new TextEncoder().encode('SKU,Name\n1,2'), 'zip', 'a CSV given as a workbook');
await bad(new Uint8Array(0), 'zip', 'no bytes');
await bad(await X.zip([{ name: 'readme.txt', data: 'hi' }]), 'zip', 'a zip that is not a workbook');
await bad(await X.zip([{ name: 'xl/workbook.xml', data: '<workbook><sheets><sheet name="A" r:id="rId1"/></sheets></workbook>' }]), 'sheet', 'a workbook with no worksheet');
await bad(await X.zip([{ name: 'xl/workbook.xml', data: '<workbook><sheets><sheet name="A" r:id="rId1"/></sheets></workbook>' }, { name: 'xl/worksheets/sheet1.xml', data: '<worksheet><sheetData></sheetData></worksheet>' }]), 'empty', 'an empty sheet');
const cut = (await X.writeXlsx([{ name: 'S', rows: data }])).slice(0, 200);
await bad(cut, 'zip', 'a cut-off file');
// a claimed size above the limit is refused before anything is inflated
const lie = await X.zip([{ name: 'xl/workbook.xml', data: '<workbook><sheets><sheet name="A"/></sheets></workbook>' }, { name: 'xl/worksheets/sheet1.xml', data: 'x'.repeat(100) }], { compress: false });
const dv = new DataView(lie.buffer, lie.byteOffset, lie.byteLength);
for (let i = 0; i + 46 < lie.length; i++) if (dv.getUint32(i, true) === 0x02014b50 && new TextDecoder().decode(lie.subarray(i + 46, i + 46 + 24)).startsWith('xl/worksheets')) dv.setUint32(i + 24, 90e6, true);
await bad(lie, 'big', 'an entry that says it is bigger than the limit');
// a formula is never run: the cached value is read
const f = await X.writeXlsx([{ name: 'F', rows: [['Item', 'Stock'], ['Pipe', { v: 12, f: 'SUM(A1:A2)' }]] }]);
eq((await R.readXlsxRows(f)).rows[1], ['Pipe', '12'], 'a formula cell gives its cached value');

console.log('\nSupplier prices into the price Library');
const supply = S.addSource(null, { name: 'acme.xlsx', at: '2026-10-28', rows: S.readSupplyRows((await R.readXlsxRows(await X.writeXlsx([{ name: 'S', rows: data }]))).rows).rows }, null).supply;
const lib = [
  { name: '2x4 stud, 8 ft', type: 'count', unit: 'ea', heightFt: 0, waste: 500, mat: 10000, lab: 2000, components: [] },
  { name: 'Drywall 5/8" 4x8', type: 'area', unit: 'sf', heightFt: 0, waste: 0, mat: 0, lab: 0, components: [] },
  { name: 'Rebar #4', type: 'linear', unit: 'm', heightFt: 0, waste: 0, mat: 5000, lab: 0, components: [] },
  { name: 'Hangers', type: 'count', unit: 'ea', heightFt: 0, waste: 0, mat: 1, lab: 0, components: [] },
];
const out = S.libraryPrices(lib, supply, { at: '2026-10-28' });
eq(out.updated.map((u) => [u.name, u.from, u.to]), [['2x4 stud, 8 ft', 10000, 38500], ['Drywall 5/8" 4x8', 0, 5200]], 'matching names take the supplier price (case ignored)');
eq(out.skipped, [{ name: 'Rebar #4', why: 'unit' }, { name: 'Hangers', why: 'noprice' }], 'a unit that differs (m vs LF) and a name the file does not have are left alone, and said');
eq([out.lib[0].lab, out.lib[0].waste, out.lib[3].mat], [2000, 500, 1], 'labour, waste and the others are not touched');
ok(/Material price from Acme/.test(out.lib[0].note) && /acme\.xlsx/.test(out.lib[0].note), 'the note says where the price came from', out.lib[0].note);
ok(lib[0].mat === 10000 && !lib[0].note, 'the input list is not changed');
const same = S.libraryPrices(out.lib, supply);
eq(same.updated, [], 'run again, nothing moves');
const noprice = S.libraryPrices(lib, S.addSource(null, { name: 'n.csv', rows: [{ name: '2x4 stud, 8 ft', sku: '', unit: 'EA', stock: 5, inStock: true, lead: 1, backorder: false, price: null, supplier: 'x', eta: '' }] }, null).supply);
eq(noprice.updated, [], 'a row with no price changes nothing');
const sim = S.libraryPrices([{ name: 'Stud', type: 'count', unit: 'ea', heightFt: 0, waste: 0, mat: 0, lab: 0, components: [] }], supply);
eq(sim.updated.length, 1, 'a name inside the supplier name matches (similar)');
eq(S.libraryPrices([{ name: 'Stud', type: 'count', unit: 'ea', heightFt: 0, waste: 0, mat: 0, lab: 0, components: [] }], supply, { only: 'exact' }).skipped, [{ name: 'Stud', why: 'similar' }], 'only: exact leaves it out');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
