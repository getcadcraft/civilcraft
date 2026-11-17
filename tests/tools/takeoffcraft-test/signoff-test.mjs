#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * signoff-test.mjs — the estimate: missing rates flagged, signed off by a person and recorded in the file, cleared when a
 * figure changes; every line names the marks behind it (booklet rows BK.62, BK.142; session bk-r3-schedules-10). DOM-free:
 *   node tools/takeoffcraft-test/signoff-test.mjs
 * Expected values are worked out in the comments.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TC = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
(await import(path.join(TC, 'i18n.js'))).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(TC, 'lang/en.json'), 'utf8')) });
const M = await import(path.join(TC, 'model.js'));
const AG = await import(path.join(TC, 'agents.js'));
const X = await import(path.join(TC, 'export.js'));
let pass = 0, fail = 0;
const ok = (c, name, detail) => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' ' + JSON.stringify(detail) : '')); } };

const H = 'a'.repeat(64), S = H + ':0';
// three count items: Doors 4 at $250.00 material + $80.00 labor; Sinks 2 with no rate; Vanity 3 priced only through its component (1 top each at $120.00)
const project = () => ({
  format: 'takeoffcraft-project', version: 1, name: 'Sign-off', seq: 20,
  files: [{ hash: H, name: 'plans.pdf', size: 1000, pages: 1 }], sheets: {},
  items: [
    { id: 'i1', name: 'Doors', type: 'count', unit: 'EA', mat: 2500000, lab: 800000 },
    { id: 'i2', name: 'Sinks', type: 'count', unit: 'EA' },
    { id: 'i3', name: 'Vanity', type: 'count', unit: 'EA', components: [{ id: 'c1', name: 'Top', unit: 'EA', formula: 'N', mat: 1200000, lab: 0 }, { id: 'c2', name: 'Sealant', unit: 'EA', formula: 'N * 2', mat: 0, lab: 0 }] },
  ],
  marks: [
    ...[1, 2, 3, 4].map((n) => ({ id: 'm' + n, item: 'i1', sheet: S, kind: 'count', pts: [[10 * n, 10]] })),
    ...[5, 6].map((n) => ({ id: 'm' + n, item: 'i2', sheet: S, kind: 'count', pts: [[10 * n, 20]] })),
    ...[7, 8, 9].map((n) => ({ id: 'm' + n, item: 'i3', sheet: S, kind: 'count', pts: [[10 * n, 30]] })),
  ],
});
const model = new M.Takeoff();
ok(model.load(project()).ok, 'the takeoff loads');

console.log('== BK.62 missing rates');
let est = M.baseEstimate(model.state);
// Doors 4 x (250 + 80) = 1320.00; Vanity top 3 x 120 = 360.00; total 1680.00 = 168 000 cents
ok(est.total === 168000, 'total 4 x 330 + 3 x 120 = $1,680.00', est.total);
const flagged = est.rows.filter((r) => r.noRate).map((r) => r.name);
ok(est.noRate === 2 && flagged.join() === 'Sinks,Sealant', 'two lines have a quantity and no rate: Sinks (the item) and Sealant (a component)', flagged);
ok(!est.rows.find((r) => r.name === 'Vanity' && r.kind === 'item').noRate, 'Vanity has no rate of its own but is priced through its Top: not flagged');
let te = AG.takeoffEstimate(model.state);
ok(te.missingRateCount === 2 && te.missingRates.map((x) => x.name + ':' + x.kind + ':' + x.quantity).join() === 'Sinks:item:2,Sealant:component:6' && te.rows.find((r) => r.name === 'Sinks').missingRate === true && !te.rows.find((r) => r.name === 'Doors').missingRate, 'takeoff_estimate lists them (Sinks 2, Sealant 6) and marks the rows', te.missingRates);
ok(te.signoff.signedOff === false && /Only a person signs/.test(te.signoffNote), 'takeoff_estimate says the estimate is not signed off, and that only a person signs');
console.log('== BK.142 every line names its marks');
ok(te.rows.find((r) => r.name === 'Doors').marks.join() === 'm1,m2,m3,m4' && te.rows.find((r) => r.name === 'Top').marks.join() === 'm7,m8,m9' && te.rows.find((r) => r.name === 'Sinks').markCount === 2, 'the Doors line: its 4 marks; a component: its item\'s 3 marks');

console.log('== BK.62 a person signs; the file records who, when, what total');
ok(model.signOff({ by: ' ', at: '2026-11-11T10:00:00Z' }).error === 'name', 'no name: refused');
const before = model.undoStack.length;
const r = model.signOff({ by: 'Duncan Philips', role: 'Architect', at: '2026-11-11T10:00:00Z' });
ok(r.ok && model.signoff().by === 'Duncan Philips' && model.signoff().total === 168000 && model.signoff().at === '2026-11-11T10:00:00.000Z' && model.signoff().missing === 2 && model.signoff().lines === est.rows.length && model.undoStack.length === before + 1, 'signed: Duncan Philips, 2026-11-11 10:00, $1,680.00, 2 lines with no rate stated; one undo step', model.signoff());
ok(M.signoffHolds(model.state), 'it holds for the estimate as it stands');
const saved = JSON.parse(JSON.stringify(model.toJSON('2026-11-11T10:05:00Z')));
ok(saved.signoff && saved.signoff.by === 'Duncan Philips' && saved.signoff.total === 168000 && /^[0-9a-f]{16}$/.test(saved.signoff.print), 'the saved file carries the sign-off');
const again = new M.Takeoff();
const lr = again.load(saved);
ok(lr.ok && again.signoff()?.by === 'Duncan Philips' && lr.warnings.length === 0, 'opened again: still signed off');
te = AG.takeoffEstimate(again.state);
ok(te.signoff.signedOff && te.signoff.by === 'Duncan Philips' && te.signoff.totalCents === 168000 && te.signoff.role === 'Architect', 'takeoff_estimate reports who signed, when, what total');
const csv = X.estimateCsv(again.state);
ok(/No rate/.test(csv.split('\r\n').find((l) => l.startsWith('Sinks'))) && /Lines with a quantity and no rate: 2/.test(csv) && /Signed off by Duncan Philips, Architect on 2026-11-11: \$1,680\.00 \(2 lines had no rate when it was signed\)/.test(csv), 'the exported estimate says No rate on the line, counts them, and names the sign-off', csv.split('\r\n').slice(-4));

console.log('== BK.62 cleared when the estimate changes');
model.updateItem('i2', { name: 'Basins' });
ok(model.signoff()?.by === 'Duncan Philips', 'renaming a line is not a change of a figure: still signed');
model.updateItem('i2', { mat: 900000 });   // Sinks now $90.00 each: total 1680 + 180 = 1860
ok(model.signoff() === null && model.cleared?.by === 'Duncan Philips' && M.baseEstimate(model.state).total === 186000, 'a rate changed (total now $1,860.00): the sign-off is cleared, and the model says whose it was');
ok(!('signoff' in model.toJSON()), 'the file saved now carries no sign-off');
model.undo();
ok(model.signoff()?.by === 'Duncan Philips' && M.signoffHolds(model.state), 'undo brings back the estimate that was signed, and its sign-off');
model.addMark({ item: 'i1', sheet: S, pts: [{ x: 99, y: 99 }] });
ok(model.signoff() === null, 'one more door counted: cleared');
model.undo();
model.clearSignoff();
ok(model.signoff() === null && model.clearSignoff() === false, 'a person can remove the sign-off; removing none is no step');
// a file whose figures were changed outside the app after signing: the sign-off is not kept, and the person is told
const tampered = JSON.parse(JSON.stringify(saved)); tampered.items[0].mat = 2600000;
const t2 = new M.Takeoff(), lr2 = t2.load(tampered);
ok(lr2.ok && t2.signoff() === null && lr2.warnings.some((w) => /sign-off by Duncan Philips/.test(w)), 'a file edited after signing opens without the sign-off, with a warning', lr2.warnings);
const noSign = JSON.parse(JSON.stringify(saved)); noSign.signoff = { by: 'x' };
ok(new M.Takeoff().load(noSign).ok, 'a wrong sign-off record is ignored, the file opens');
// an estimate with every line priced and no sign-off exports exactly as before 0.10 (no extra lines)
const full = project(); full.items[1].mat = 100; full.items[2].components[1].mat = 100;
const t3 = new M.Takeoff(); t3.load(full);
ok(!/signed|No rate|no rate/i.test(X.estimateCsv(t3.state)) && M.baseEstimate(t3.state).noRate === 0, 'every line priced, not signed: the export has no sign-off or no-rate words at all');
// no tool signs
ok(!/signOff|sign_off|signoff_set/.test(fs.readFileSync(path.join(TC, 'agents.js'), 'utf8').replace(/signoffHolds|signoffNote|signoff:|state\.signoff|te\.signoff/g, '')), 'no assistant tool signs an estimate off');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
