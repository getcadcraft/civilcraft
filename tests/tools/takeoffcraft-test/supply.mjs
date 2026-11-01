#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** supply.mjs — 0.8 EG.51 (session takeoff_PART_2): supplier stock and lead-time files, without a browser. node tools/takeoffcraft-test/supply.mjs [--build dev] [--verbose] */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2), VERBOSE = args.includes('--verbose');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft', args.includes('--build') ? args[args.indexOf('--build') + 1] : 'dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const strings = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
(await load('i18n.js')).init({ strings });
const S = await load('supply.js'), M = await load('model.js');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));
const section = (s) => console.log('\n' + s);

section('Reading a file');
eq([S.parseStock('1,200'), S.parseStock('Out of stock'), S.parseStock('In stock'), S.parseStock(''), S.parseStock('250 ea'), S.parseStock('abc')],
  [{ stock: 1200, inStock: true }, { stock: 0, inStock: false }, { stock: null, inStock: true }, { stock: null, inStock: null }, { stock: 250, inStock: true }, { stock: null, inStock: null }], 'stock figures');
eq([S.parseLead('5 days').lead, S.parseLead('2 wks').lead, S.parseLead('2-3 weeks').lead, S.parseLead('3 months').lead, S.parseLead('same day').lead, S.parseLead('Backorder').backorder, S.parseLead('10', 'week').lead, S.parseLead('').lead], [5, 14, 21, 90, 0, true, 70, null], 'lead times');
const csv = [
  'Supplier price list,,,,,', '',
  'SKU,Description,In Stock,Lead Time,UOM,Unit Price,Vendor',
  'ST-248,"2x4 Stud, 8 ft",300,3 days,EA,$3.85,Acme Lumber',
  'DW-58,Drywall 5/8" 4x8,"1,200",,SF,$0.52,Acme Lumber',
  'RB-4,Rebar #4,0,3 weeks,LF,$0.91,Steel Co',
  'CT-1,Ceiling tile,,backorder,EA,$22,Acme Lumber',
  ',,,,,,', 'XX-1,Mystery,,,,,'].join('\n');
const r = S.readSupplyCsv(csv);
ok(r.ok && r.rows.length === 4, 'the header is found below a title row; blank rows and rows with nothing to say are left out', JSON.stringify(r.rows?.length) + ' ' + (r.error || ''));
eq([r.rows[0].sku, r.rows[0].stock, r.rows[0].lead, r.rows[0].price, r.rows[0].supplier], ['ST-248', 300, 3, 38500, 'Acme Lumber'], 'a row: SKU, stock, lead time, price in rate units, supplier');
eq([r.rows[3].backorder, r.rows[3].lead], [true, null], 'backorder has no date');
ok(!S.readSupplyCsv('Name,Colour\nA,red').ok, 'a file with no stock or lead-time column says so');
ok(!S.readSupplyCsv('').ok, 'an empty file says so');
ok(S.readSupplyCsv('Item;Stock;Lead (weeks)\nBolt;5;2').rows[0].lead === 14, 'semicolons and "weeks" in the header work');

section('Checking a takeoff');
const m = new M.Takeoff();
const stud = m.addItem({ name: '2x4 Stud, 8 ft', type: 'count' }), dw = m.addItem({ name: 'Drywall 5/8" 4x8', type: 'area', waste: 1000 }), rb = m.addItem({ name: 'Rebar #4', type: 'linear' }), ct = m.addItem({ name: 'Ceiling tile', type: 'count' }), ln = m.addItem({ name: 'Unmatched widget', type: 'count' });
m.addFile({ hash: 'a'.repeat(64), name: 'p.pdf', size: 1, pages: 1 });
const key = 'a'.repeat(64) + ':0';
m.setScale(key, { ftPerUnit: 1, label: '1:1', preset: null });
for (let i = 0; i < 4; i++) m.addMark({ item: stud, sheet: key, pts: [[i, 0]], kind: 'count' });
m.addMark({ item: ct, sheet: key, pts: [[0, 0]], kind: 'count' }); m.addMark({ item: ln, sheet: key, pts: [[5, 5]], kind: 'count' });
m.addMark({ item: dw, sheet: key, pts: [[0, 0], [100, 0], [100, 100], [0, 100]], kind: 'area' });
m.addMark({ item: rb, sheet: key, pts: [[0, 0], [50, 0]], kind: 'linear' });
let est = M.estimate(m.state);
const sup = S.addSource(null, { name: 'acme.csv', at: '2026-10-28T00:00:00Z', rows: r.rows }, est).supply;
const res = S.check(est, sup);
const by = Object.fromEntries(res.rows.map((x) => [x.name, x]));
if (VERBOSE) console.log('   ', JSON.stringify(res.rows.map((x) => [x.name, x.need, x.status, x.short, x.lead])));
ok(by['2x4 Stud, 8 ft'].status === 'ok' && by['2x4 Stud, 8 ft'].exact, 'the stud: 4 needed, 300 in stock → ok (matched by name; commas and case do not matter)');
ok(Math.abs(by['Drywall 5/8" 4x8'].need - 11000) < 1e-6, 'drywall: the need includes 10% waste (10,000 SF + 10% = 11,000 SF)');
eq([by['Rebar #4'].status, by['Rebar #4'].lead], ['short', 21], 'rebar: stock 0 → short, and the lead time is 21 days');
eq(by['Ceiling tile'].status, 'late', 'ceiling tile: no stock figure and on backorder → late');
ok(res.unmatched.some((n) => n.name === 'Unmatched widget'), 'an item with no row in the file is listed as unmatched');
eq(res.critical.name, 'Rebar #4', 'the longest wait that matters');
{   // short by the right amount
  const d = by['Drywall 5/8" 4x8'];
  ok(d.status === 'short' && Math.abs(d.short - (d.need - 1200)) < 1e-6, 'drywall: 11,000 SF needed vs 1,200 in stock → short by the difference', JSON.stringify([d.status, d.need, d.short]));
}
{   // unit differs
  const odd = S.addSource(null, { name: 'x', rows: [{ name: 'Rebar #4', sku: '', unit: 'TON', stock: 5, inStock: true, lead: 1, backorder: false, price: null, supplier: '', eta: '' }] }, est).supply;
  eq(S.check(est, odd).rows.find((x) => x.name === 'Rebar #4').status, 'unit', 'a supplier unit that is not the estimate\'s (TON vs LF) is reported, never compared');
  const ea = S.addSource(null, { name: 'x', rows: [{ name: '2x4 Stud 8 ft', sku: '', unit: 'pc', stock: 2, inStock: true, lead: 1, backorder: false, price: null, supplier: '', eta: '' }] }, est).supply;
  eq(S.check(est, ea).rows.find((x) => x.itemId === stud).status, 'short', 'pc is each: 4 needed, 2 in stock → short');
}
{   // the limit and the ignore list
  const long = { ...sup, leadDays: 30 };
  eq(S.check(est, long).rows.find((x) => x.name === 'Rebar #4').status, 'short', 'a short item stays short whatever the limit');
  const noStock = S.addSource(null, { name: 'y', rows: [{ name: 'Rebar #4', sku: '', unit: 'LF', stock: null, inStock: null, lead: 21, backorder: false, price: null, supplier: '', eta: '' }] }, est).supply;
  eq(S.check(est, noStock).rows.find((x) => x.name === 'Rebar #4').status, 'late', 'no stock figure and 21 days over the 14 wanted → late');
  eq(S.check(est, { ...noStock, leadDays: 30 }).rows.find((x) => x.name === 'Rebar #4').status, 'unknown', 'raise the limit to 30 → only "no stock figure"');
  ok(!S.check(est, { ...sup, ignore: [rb] }).rows.some((x) => x.itemId === rb), 'a need the person leaves out is not checked');
}
section('The shared problem shape (rule 29)');
{
  const t = (k, v) => k + JSON.stringify(v);
  const p = S.problemsOf(res, { t });
  const shorts = p.filter((x) => x.code === 'supply.short'), leads = p.filter((x) => x.code === 'supply.lead');
  ok(shorts.length === 2 && leads.length === 1, 'two shortages (warnings) and one long wait (note)', JSON.stringify(p.map((x) => x.code)));
  ok(shorts.every((x) => x.severity === 'warning' && x.id.startsWith('takeoffcraft:supply.short:') && x.about[0].kind === 'item' && x.msg.key === 'eg51.prob.short' && x.req.op === '>='), 'a shortage: severity, stable id, the item it is about, the message key and what was required');
  ok(leads[0].severity === 'note' && leads[0].msg.key === 'eg51.prob.back', 'a backorder is a note');
  eq(S.problemsOf(res, { t }).map((x) => x.id), p.map((x) => x.id), 'ids do not change between runs');
  ok(p.every((x) => strings[x.msg.key]), 'every message key is in the language file');
}
section('The project file');
{
  const back = S.readSupply(JSON.parse(JSON.stringify(sup)));
  eq(back, sup, 'the part kept in the project file reads back the same');
  const m2 = new M.Takeoff(); m2.state.supply = sup; m2.state.problems = { accepted: [{ id: 'takeoffcraft:supply.short:' + rb, by: 'x', reason: 'ordered', date: '2026-10-28' }] };
  const json = m2.toJSON(), re = M.readProject(JSON.parse(JSON.stringify(json)));
  ok(re.ok && re.state.supply && re.state.supply.sources[0].rows.length === sup.sources[0].rows.length && re.state.problems.accepted.length === 1, 'saved with the takeoff and read back, with the accepted problems');
  ok(M.readProject({ format: 'takeoffcraft-project', version: 1, files: [], items: [], marks: [] }).ok, 'a file without it still opens');
  ok(S.readSupply({ v: 2, sources: [] }) === null, 'a newer version is ignored, not misread');
  const evil = S.readSupply({ v: 1, leadDays: -5, sources: [{ name: 'a‮b', rows: [{ name: '<img onerror=x>', stock: -1, lead: 'soon', price: 1.5 }, { name: '' }] }], ignore: [1, 'ok'] });
  ok(evil && evil.leadDays === 14 && evil.sources[0].rows.length === 1 && evil.sources[0].rows[0].stock === null && evil.sources[0].rows[0].lead === null && evil.sources[0].rows[0].price === null && evil.ignore.length === 1, 'junk is cleaned: bad numbers become unknown, empty rows go');
  const many = S.addSource(null, { name: 'big', rows: Array.from({ length: 3000 }, (_, i) => ({ name: 'Item ' + i, sku: '', unit: 'EA', stock: 1, inStock: true, lead: 1, backorder: false, price: null, supplier: '', eta: '' })) }, est);
  ok(many.kept === 2000 && many.dropped === 1000, 'at most 2,000 rows are kept in the file');
  const first = S.addSource(null, { name: 'big', rows: [...Array.from({ length: 2500 }, (_, i) => ({ name: 'Zzz ' + i, sku: '', unit: 'EA', stock: 1, inStock: true, lead: 1, backorder: false, price: null, supplier: '', eta: '' })), { name: '2x4 stud 8 ft', sku: '', unit: 'EA', stock: 9, inStock: true, lead: 1, backorder: false, price: null, supplier: '', eta: '' }] }, est);
  ok(first.supply.sources[0].rows.some((q) => q.name === '2x4 stud 8 ft'), 'when there are too many rows, the ones that match the takeoff are kept first');
}
section('Rules 35, 36');
for (const f of ['supply.js', 'supply-ui.js']) {
  const src = fs.readFileSync(path.join(APP, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|onnx|tensorflow/i.test(src), f + ': no network call, no model');
}
ok(!/innerHTML|insertAdjacentHTML/.test(fs.readFileSync(path.join(APP, 'supply-ui.js'), 'utf8')), 'file text reaches the page only as text');
ok(!Object.entries(strings).some(([k, v]) => /^eg51\./.test(k) && /\bAI\b|machine learning|artificial/i.test(JSON.stringify(v))), 'the copy never says the app has AI built in');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
