#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** test-constructability-3.mjs — EG.43, round 3 (detail_PART_3): weld access of all-round fillet welds.   node tools/detailcraft-test/test-constructability-3.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Model, starterState } = await load('model.js'), { build } = await load('build.js'), C = await load('constructability.js'), { sampleModel } = await load('sample.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const run = (m, o) => C.constructability(m.state, build(m.state), { rules: ['weldaccess'], ...o });
const frame = (beamProfile, custom = null) => {
  const m = new Model(starterState());
  if (custom) m.change('p', (tx) => tx.addProfile(custom));
  const col = m.change('c', (tx) => tx.addMember({ type: 'column', profile: 'W10x49', start: [0, 0, 0], end: [0, 0, 4000] }));
  const beam = m.change('b', (tx) => tx.addMember({ type: 'beam', profile: beamProfile, start: [0, 0, 3800], end: [6000, 0, 3800] }));
  m.change('j', (tx) => tx.addConnection({ type: 'endplate', beam, end: 'start', column: col, params: { weld: 6 } }));
  return m;
};
// 1. a standard beam: the pockets between the flanges are 67 mm wide, a 10 mm nozzle radius at 45° is clear
let r = run(frame('W16x26'));
ok(r.length === 0, 'a W16x26 end plate: the torch gets in all round', r.map((p) => p.msg.vars));
// 2. a section with a tight pocket: d 50, flanges 10 thick, so 30 mm of web between them (bf 200, tw 6). The torch's disc (radius 10) is cleared of the
//    flange only where the weld point is more than 10 mm from it; the samples 7.5 mm from a flange are blocked, the ones 22.5 mm from it (= 7.5 from the other) too
const narrow = { name: 'TIGHT', kind: 'I', d: 50, bf: 200, tw: 6, tf: 10, r: 0 };
r = run(frame('TIGHT', narrow));
ok(r.length === 1 && r[0].code === 'cons.weldaccess', 'a tight pocket: the weld is flagged', r.map((p) => p.code));
const v = r[0]?.msg.vars;
ok(v && Math.abs(v.free - (10 * Math.SQRT2 + 1)) < 0.1, 'it is blocked at the first step (hand: the nozzle clears the faces at radius × √2 + 1 = 15.14 mm)', v && v.free);
ok(v && v.pct > 5 && v.pct <= 100 && v.need === 30 && /^m\d+$/.test(v.part), 'it names the part (the beam\'s own flange), the share of the weld and the reach', v);
ok(r[0]?.about[0].kind === 'conn', 'it points at the connection');
// 3. the numbers can change: a thinner nozzle (5 mm radius, 7.5 mm to the flange) passes the same joint
ok(run(frame('TIGHT', narrow), { torchRadius: 5 }).length === 0, 'a 5 mm radius nozzle gets in');
ok(run(frame('TIGHT', narrow), { torchRadius: 20 }).length === 1, 'a 20 mm radius one does not');
// 4. the rule can be switched off
ok(C.constructability(frame('TIGHT', narrow).state, build(frame('TIGHT', narrow).state), { rules: ['access'] }).filter((p) => p.code === 'cons.weldaccess').length === 0, 'with the rule off there is no weld access problem');
// 5. the sample frame
const sm = sampleModel();
const sr = C.constructability(sm.state, build(sm.state), { rules: ['weldaccess'] });
console.log('  sample frame: ' + sr.length + ' weld access problems');
ok(sr.length < 4, 'the sample frame has at most a few', sr.length);
// 6. a weld that is not all round is not located (said, not guessed)
const tab = new Model(starterState());
const c1 = tab.change('c', (tx) => tx.addMember({ type: 'column', profile: 'W10x49', start: [0, 0, 0], end: [0, 0, 4000] }));
const b1 = tab.change('b', (tx) => tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 3800], end: [6000, 0, 3800] }));
tab.change('j', (tx) => tx.addConnection({ type: 'sheartab', beam: b1, end: 'start', column: c1 }));
ok(run(tab).length === 0, 'a shear tab (a weld along two edges) is not located: no guess');
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
