#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout-test.mjs — TakeoffCraft's estimate and quantities by sheet in the office layout (booklet row BK.149; session
 * bk-r3-schedules-10): the same office standard (the Default Policies store and its four all.schedule.* policies) and the same
 * layout engine (tables/table.js) as BimCraft. DOM-free:
 *   node tools/takeoffcraft-test/layout-test.mjs
 * Expected values are worked out in the comments.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps'), TC = path.join(APPS, 'takeoffcraft/dev'), BC = path.join(APPS, 'bimcraft/dev');
(await import(path.join(TC, 'i18n.js'))).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(TC, 'lang/en.json'), 'utf8')) });
const M = await import(path.join(TC, 'model.js'));
const AG = await import(path.join(TC, 'agents.js'));
const X = await import(path.join(TC, 'export.js'));
const EL = await import(path.join(TC, 'estimate-layout.js'));
const DH = await import(path.join(TC, 'defaults-hook.js'));
const API = await import(path.join(TC, 'addons/takeoffcraft-api.js'));
const POL = await import(path.join(TC, 'addons/default-policies/lib/policies.js'));
const PROV = await import(path.join(TC, 'addons/default-policies/lib/provider.js'));
let pass = 0, fail = 0;
const ok = (c, name, detail) => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' ' + JSON.stringify(detail) : '')); } };
const same = (a, b) => fs.readFileSync(a).equals(fs.readFileSync(b));

console.log('== one engine, one store, one reading of the standard');
ok(same(path.join(ROOT, 'lib/tables/table.js'), path.join(TC, 'tables/table.js')) && same(path.join(TC, 'tables/table.js'), path.join(BC, 'tables/table.js')), 'TakeoffCraft and BimCraft carry the same layout engine, byte for byte (lib/tables/table.js)');
ok(same(path.join(ROOT, 'lib/defaults/defaults-hook.js'), path.join(TC, 'defaults-hook.js')) && same(path.join(TC, 'defaults-hook.js'), path.join(BC, 'defaults-hook.js')), 'and the same defaults hook');
for (const f of ['policies.js', 'store.js', 'provider.js', 'ui.js']) ok(same(path.join(ROOT, 'lib/defaults', f), path.join(TC, 'addons/default-policies/lib', f)), 'the add-on in TakeoffCraft carries lib/defaults/' + f + ' unchanged');
ok(/applyLayout|withStandard/.test(fs.readFileSync(path.join(TC, 'estimate-layout.js'), 'utf8')) && !/function applyLayout|localStorage/.test(fs.readFileSync(path.join(TC, 'estimate-layout.js'), 'utf8') + fs.readFileSync(path.join(TC, 'estimate-layout-ui.js'), 'utf8')), 'the adapter calls the shared engine; it has no layout engine and no store of its own');
const man = JSON.parse(fs.readFileSync(path.join(TC, 'addons/default-policies/addon.json'), 'utf8'));
ok(man.id === 'default-policies' && man.apps.join() === 'takeoffcraft' && man.default === 'off' && man.api === '1.1' && API.TAKEOFFCRAFT_API_VERSION === '1.1' && JSON.parse(fs.readFileSync(path.join(TC, 'addons/index.json'), 'utf8')).addons.includes('default-policies'), 'the Default Policies add-on is listed in TakeoffCraft, off until switched on, on add-on API 1.1');
ok(POL.policyList('*').filter((p) => p.id.startsWith('all.schedule.')).length === 4 && POL.policyList('takeoffcraft').length === 0, 'the four schedule policies are for every app; TakeoffCraft has none of its own');

// Walls 2 linear items, Doors count with a component, a typed item
const H = 'a'.repeat(64), S1 = H + ':0', S2 = H + ':1';
const project = {
  format: 'takeoffcraft-project', version: 1, name: 'Layout', seq: 30,
  files: [{ hash: H, name: 'plans.pdf', size: 1000, pages: 2 }], sheets: {},
  items: [
    { id: 'i1', name: 'Doors', type: 'count', unit: 'EA', mat: 2500000, lab: 800000, components: [{ id: 'c1', name: 'Hinges', unit: 'EA', formula: 'N * 3', mat: 50000, lab: 0 }] },
    { id: 'i2', name: 'Permit', type: 'fixed', unit: 'EA', qty: 1, mat: 5000000 },
    { id: 'i3', name: 'Sinks', type: 'count', unit: 'EA', mat: 900000 },
  ],
  marks: [
    ...[1, 2, 3, 4].map((n) => ({ id: 'm' + n, item: 'i1', sheet: n < 4 ? S1 : S2, kind: 'count', pts: [[10 * n, 10]] })),
    ...[5, 6].map((n) => ({ id: 'm' + n, item: 'i3', sheet: S2, kind: 'count', pts: [[10 * n, 20]] })),
  ],
};
const model = new M.Takeoff();
ok(model.load(project).ok, 'the takeoff loads');
const state = model.state, est = M.baseEstimate(state);
// Doors 4 x 330 = 1320.00 (mat 1000, lab 320); Hinges 12 x 5 = 60.00; Sinks 2 x 90 = 180.00; Permit 1 x 500 = 500.00 → 2060.00
ok(est.total === 206000 && est.rows.map((r) => r.name).join() === 'Doors,Hinges,Permit,Sinks', 'the estimate: Doors, Hinges, Permit, Sinks = $2,060.00', est.total);

console.log('== no standard: everything as it was');
DH.setDefaults(null);
const csv0 = X.estimateCsv(state);
let L = EL.estimateLayout(state, est);
ok(!L.active && L.plan.map((p) => p.kind + (p.index ?? '')).join() === 'row0,row1,row2,row3' && L.title === '', 'no office standard: the plan is the rows in order, nothing else');
ok(csv0.split('\r\n')[0].startsWith('Item,Type,Unit') && csv0.split('\r\n').length === 7 && !('layout' in AG.takeoffEstimate(state)), 'the CSV is headings + 4 rows + job total; takeoff_estimate has no layout block');

console.log('== the office standard, from the shared store, through the add-on\'s provider');
const store = POL.cleanDoc({ format: 'cc-default-policies', version: 1, office: 'Smith and Jones', policies: { 'all.schedule.group': 'type', 'all.schedule.totals': 'groups', 'all.schedule.title': '{schedule}: office layout', 'all.schedule.headings': 'upper' } }).doc;
const api = DH.hostDefaultsApi(null);
const off = api.provide(PROV.makeProvider({ doc: () => store, source: () => 'from your Default Policies' }));
ok(JSON.stringify(DH.scheduleStandard()) === JSON.stringify({ group: 'type', totals: 'groups', title: '{schedule}: office layout', headings: 'upper' }), 'scheduleStandard() reads the four policies the office set (the same call BimCraft makes)');
L = EL.estimateLayout(state, est);
// by item type in the order Linear, Area, Count, Typed: Count = Doors + Hinges + Sinks (1320 + 60 + 180 = 1560.00), Typed = Permit 500.00
ok(L.active && L.plan.map((p) => p.kind + (p.index ?? '')).join() === 'group,row0,row1,row3,subtotal,group,row2,subtotal' && L.plan[0].label === 'TYPE: Count' && Object.keys(L.from).sort().join() === 'groupBy,headings,title,totals', 'grouped by item type: Count (Doors, its Hinges, Sinks) then the typed Permit; a component stays under its item', L.plan);
ok(L.plan[4].sums.total === 156000 && L.plan[4].sums.mat === 124000 && L.plan[4].sums.lab === 32000 && L.plan[7].sums.total === 50000 && L.plan[4].label === 'Subtotal (3)', 'subtotals: Count $1,560.00 (material 1,240.00, labor 320.00), typed $500.00', L.plan[4]);
ok(L.title === 'Estimate: office layout' && L.caseOf('Item') === 'ITEM', 'the title pattern and the heading case come from the office');
const csv = X.estimateCsv(state).split('\r\n');
ok(csv[0].startsWith('ITEM,TYPE,UNIT') && csv[1] === 'TYPE: Count' && csv[2].startsWith('Doors,') && csv[3].startsWith('  Hinges,') && csv[4].startsWith('Sinks,') && /^Subtotal \(3\),.*,1240,320,1560,$/.test(csv[5]) && csv[6] === 'TYPE: Typed quantity' && /^Subtotal \(1\),.*,500,0,500,$/.test(csv[8]) && /^Job total,.*,2060,/.test(csv[9]), 'the CSV export: headings in capitals, group lines, subtotals 1560 and 500, the job total 2060 unchanged', csv.slice(0, 10));
const sheets = X.estimateSheets(state, (k) => k);
const rows = sheets[0].rows, sub = rows.find((r) => r[0]?.v === 'Subtotal (3)'), tot = rows.find((r) => r[0]?.v === 'Job total');
// rows: 1 headings, 2 group, 3 Doors, 4 Hinges, 5 Sinks, 6 subtotal → SUBTOTAL(9,K3:K5)
ok(rows[0][0].v === 'ITEM' && rows[1][0].v === 'TYPE: Count' && sub && sub[10].f === 'SUBTOTAL(9,K3:K5)' && sub[10].v === 1560 && tot[10].f.startsWith('SUBTOTAL(9,K2:K') && tot[10].v === 2060, 'the workbook: group rows, subtotals as SUBTOTAL(9, …) over their group, and a job total that does not count them twice', [sub?.[10], tot?.[10]]);
const te = AG.takeoffEstimate(state);
ok(te.layout && te.layout.groupedBy === 'type' && te.layout.fromOfficeStandard.sort().join() === 'grouping,headings,title,totals' && te.layout.lines.map((l) => l.kind + (l.row ?? '')).join() === 'group,row0,row1,row3,subtotal,group,row2,subtotal' && te.layout.lines[4].totalCents === 156000 && te.totalCents === 206000 && te.rows.length === 4, 'takeoff_estimate: the same rows, plus a layout block (groups, rows by index, subtotals in cents) and which parts the office set');
// quantities by sheet: the standard groups by type; that table has no type column → not grouped, headings and title still apply
const tq = AG.takeoffQuantities(state, (k) => (k === S1 ? 'A-101' : 'A-102'), { by: 'sheet' });
ok(tq.layout && tq.layout.groupedBy === null && tq.layout.fromOfficeStandard.includes('headings') && !tq.layout.fromOfficeStandard.includes('grouping') && tq.layout.lines.every((l) => l.kind === 'row'), 'quantities by sheet have no type column: not grouped (as in BimCraft), the rest of the standard applies');
store.policies['all.schedule.group'] = 'level';
const tq2 = AG.takeoffQuantities(state, (k) => (k === S1 ? 'A-101' : 'A-102'), { by: 'sheet' });
// A-101: Doors 3 marks; A-102: Doors 1 + Sinks 2 = 3 marks
ok(tq2.layout.groupedBy === 'sheet' && tq2.layout.lines.map((l) => l.kind).join() === 'group,row,subtotal,group,row,row,subtotal' && tq2.layout.lines[0].label === 'SHEET: A-101' && tq2.layout.lines[2].marks === 3 && tq2.layout.lines[6].marks === 3, 'the standard set to Level: quantities by sheet are grouped by sheet with the marks subtotalled (3 and 3)', tq2.layout.lines);
ok(!EL.estimateLayout(state, est).groupedBy && EL.estimateLayout(state, est).active, 'and the estimate, which has no level column, is not grouped; headings, title and totals still come from the office');
// a table that states its own grouping keeps it
store.policies['all.schedule.group'] = 'type';
const own = EL.layOut(EL.estimateTable(state, est), { groupBy: null, totals: 'none' });
ok(own.plan.every((p) => p.kind === 'row') && !own.from.groupBy && !own.from.totals && own.from.headings, 'a table that states its own grouping and totals keeps them; the standard fills the rest');
off();
ok(Object.keys(DH.scheduleStandard()).length === 0 && X.estimateCsv(state) === csv0 && !('layout' in AG.takeoffEstimate(state)), 'the add-on switched off: the export is byte for byte what it was, the tools answer as before');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
void zlib;
