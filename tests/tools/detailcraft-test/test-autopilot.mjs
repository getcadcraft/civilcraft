#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-autopilot.mjs — connection autopilot (0.8 round 2, EG.73): which joint gets which connection, sizes by hand, the end shear's bolt
 * count (AISC 360-16 J3.6 numbers), the upgrade to an end plate, joints left for the person, one undo step, nothing added twice.
 *   node tools/detailcraft-test/test-autopilot.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Model, starterState } = await load('model.js'), { build } = await load('build.js'), A = await load('autopilot.js'), { sampleModel } = await load('sample.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;

// bolt strength by hand: 20 mm A325-N: 0.75 × 372 × 314.16 mm² = 87.65 kN
ok(near(A.boltShearKN(20, 'A325'), 87.65, 0.05), 'bolt: 20 mm A325 = 87.65 kN (' + A.boltShearKN(20) + ')');
ok(near(A.boltShearKN(20, 'A490'), 107.7, 0.1), 'bolt: 20 mm A490 = 107.7 kN');
ok(A.boltFor(200) === 16 && A.boltFor(300) === 20 && A.boltFor(600) === 22 && A.boltFor(900) === 24, 'bolt diameter by depth');

// a model made by hand: two columns, three beams (one into a column web, one skew), a brace
const m = new Model(starterState());
const col = (x, y) => m.change('c', (tx) => tx.addMember({ type: 'column', profile: 'W10x49', start: [x, y, 0], end: [x, y, 4000] }));
const c1 = col(0, 0), c2 = col(6000, 0);
const b1 = m.change('b', (tx) => tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 4000], end: [6000, 0, 4000] }));
const p0 = A.propose(m.state, {});
const types = p0.items.map((i) => i.conn.type).sort().join();
ok(p0.counts.baseplate === 2, 'a base plate under each column');
ok(p0.counts.sheartab === 2 && !p0.counts.endplate, 'both beam ends: shear tabs by default (' + types + ')');
ok(p0.items.every((i) => i.conn.params && i.rule), 'every item carries its parameters and its rule');
// moment beams → end plates
const p1 = A.propose(m.state, { moment: [b1] });
ok(p1.counts.endplate === 2 && !p1.counts.sheartab, 'a moment beam gets end plates at both ends');
// the base plate by hand: W10x49: d 253, bf 254 → 253+150=403 → 425; 254+150 → 425
const bp = p0.items.find((i) => i.conn.type === 'baseplate').conn.params;
ok(bp.length === 425 && bp.width === 425 && bp.tp === 25 && bp.sx === 325, 'base plate 425 × 425, rods 325 apart (' + bp.length + '×' + bp.width + ')');
// end shear sizes the tab: W16x26 d≈400; 200 kN → ceil(200/ (20mm bolt 87.65)) = 3 rows
const p2 = A.propose(m.state, { reactionKN: 200 });
const st = p2.items.find((i) => i.conn.type === 'sheartab').conn.params;
ok(st.boltD === 20 && st.rows === 3, '200 kN end shear: 3 bolts of 20 mm (' + st.rows + ')');
const p3 = A.propose(m.state, { uniformKNm: 40 });   // 40 × 6 / 2 = 120 kN → 2 bolts
ok(p3.items.find((i) => i.conn.type === 'sheartab').vars.kn === 120, 'uniform 40 kN/m on 6 m: 120 kN each end');
// too much shear: a flange-face joint upgrades to an end plate, else it is left
const p4 = A.propose(m.state, { reactionKN: 450 });
ok(p4.items.some((i) => i.rule === 'upgrade' && i.conn.type === 'endplate'), '450 kN does not fit in a W16 web: end plate chosen (' + p4.items.map((i) => i.rule).join() + ')');
const p5 = A.propose(m.state, { reactionKN: 5000 });
ok(p5.left.some((l) => l.code === 'no-fit') && p5.left.length === 2, '5000 kN: left for the person, both ends');
const pr = A.autopilotProblems(p5);
ok(pr.length === 2 && pr[0].severity === 'note' && pr[0].source.name === 'detailcraft.autopilot' && /bolts/.test(pr[0].text), 'left joints speak Problems');
// apply: one undo step, and nothing twice
const before = m.undoStack.length;
m.change('Autopilot', (tx) => A.apply(tx, p0));
ok(m.state.connections.length === 4 && m.undoStack.length === before + 1, 'applied: 4 connections in one undo step');
ok(build(m.state).problems.filter((p) => p.hard).length === 0, 'the built model has no hard problems');
ok(A.propose(m.state, {}).items.length === 0, 'run again: nothing left to add');
m.undo();
ok(m.state.connections.length === 0, 'one undo takes them all back');
// the sample frame
const sm = sampleModel();
const ps = A.propose(sm.state, {});
ok(ps.items.length >= 0 && ps.items.every((i) => ['sheartab', 'endplate', 'baseplate', 'splice', 'gusset', 'mitre'].includes(i.conn.type)), 'the sample frame: ' + ps.items.length + ' proposals');
const m2 = new Model(sm.state);
m2.change('auto', (tx) => A.apply(tx, A.propose(m2.state, {})));
ok(A.propose(m2.state, {}).items.length === 0, 'the sample frame, applied: nothing left');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
