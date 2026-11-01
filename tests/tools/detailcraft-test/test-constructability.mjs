#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-constructability.mjs — constructability checks in Problems (0.8 round 2, EG.43): a bolt a wrench cannot reach, bolts too close for the
 * socket, fillet weld sizes against AISC 360-16 Table J2.4 / J2.2b, hollow sections that hold water or need a vent; each rule on a made case and
 * on the sample frame, and that a normal end plate raises none of them.
 *   node tools/detailcraft-test/test-constructability.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Model, starterState } = await load('model.js'), { build } = await load('build.js'), C = await load('constructability.js'), { sampleModel } = await load('sample.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const run = (m, o) => C.constructability(m.state, build(m.state), o);
const by = (list, code) => list.filter((p) => p.code === 'cons.' + code);

// a column W10x49 at the origin with a W16x26 beam running +x at 4000, end plate on the column's flange? the beam meets the column's flange face
function frame(params = {}, conn = 'endplate', extra = null) {
  const m = new Model(starterState());
  const col = m.change('c', (tx) => tx.addMember({ type: 'column', profile: 'W10x49', start: [0, 0, 0], end: [0, 0, 4000] }));
  const beam = m.change('b', (tx) => tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 3800], end: [6000, 0, 3800] }));
  m.change('j', (tx) => tx.addConnection({ type: conn, beam, end: 'start', column: col, params }));
  if (extra) m.change('x', (tx) => extra(tx, { col, beam }));
  return m;
}
// 1. a plain end plate: nothing to say about access, bolts or welds of the right size
let r = run(frame({ weld: 4 }));
ok(by(r, 'access').length === 0 && by(r, 'bolts').length === 0 && by(r, 'weld').length === 0, 'a plain end plate (4 mm weld): no access, bolt or weld problem (' + r.map((p) => p.code).join() + ')');
// 2. bolts on the beam's web line: the socket over the head runs into the web
r = run(frame({ gauge: 10, weld: 4 }));
ok(by(r, 'access').some((p) => p.msg.vars.side === 'head') , 'gauge 10 mm: the heads sit at the web; the socket hits it');
const acc = by(r, 'access')[0];
ok(acc && acc.msg.vars.free < acc.msg.vars.need && acc.about[0].kind === 'conn', 'access: free length and the socket length are in the message');
// 3. a longer socket sees obstacles a short one does not
const short = run(frame({ weld: 4 }), { socketLength: 20 }), long = run(frame({ weld: 4 }), { socketLength: 300 });
ok(by(short, 'access').length <= by(long, 'access').length, 'a longer socket can only meet more');
// 4. bolts closer than the socket allows: 2 × 19.6 + 4 = 43.2 mm needed between 20 mm bolts
r = run(frame({ pitch: 30, weld: 4 }));
ok(by(r, 'bolts').length === 1 && by(r, 'bolts')[0].msg.vars.need === 43.2 && by(r, 'bolts')[0].msg.vars.spacing === 30, 'pitch 30 mm: bolts too close, 43.2 mm needed');
ok(by(run(frame({ pitch: 50, weld: 4 })), 'bolts').length === 0, 'pitch 50 mm is enough');
// 5. fillet welds: the beam web is 6.4 mm (tw of W16x26 = 6.35?), the plate 20 mm
const web = build(frame({ weld: 4 }).state).byId.get('m2').profile.tw;   // 6.35 mm: a quarter inch
r = run(frame({ weld: 8 }));
const wmax = by(r, 'weld');
ok(wmax.length === 1 && wmax[0].msg.vars.which === 'max' && Math.abs(wmax[0].msg.vars.limit - (web - 1.6)) < 0.11, 'weld 8 mm on a ' + web + ' mm web: over ' + (web - 1.6).toFixed(1) + ' mm (AISC 360-16 J2.2b)');
r = run(frame({ weld: 2 }));
ok(by(r, 'weld').length === 1 && by(r, 'weld')[0].msg.vars.which === 'min' && by(r, 'weld')[0].msg.vars.limit === (web <= 6.35 ? 3 : 5), 'weld 2 mm: under the Table J2.4 minimum (3 mm) for a 6.35 mm web');
ok(by(run(frame({ weld: 4 })), 'weld').length === 0, 'weld 4 mm is inside both limits (3 mm minimum, 4.75 mm maximum)');
// 6. water
const hss = new Model(starterState());
const hc = hss.change('c', (tx) => tx.addMember({ type: 'column', profile: 'HSS6x6x1/4', start: [0, 0, 0], end: [0, 0, 3000] }));
hss.change('j', (tx) => tx.addConnection({ type: 'baseplate', column: hc }));
r = run(hss);
ok(by(r, 'water').length === 1 && r.find((p) => p.code === 'cons.water').msg.vars.kind === 'open' && r.find((p) => p.code === 'cons.water').severity === 'note', 'an HSS column with a base plate and an open top: rain runs in (a note)');
const closedState = JSON.parse(JSON.stringify(hss.state)); closedState.connections.push({ id: 'jx', type: 'endplate', beam: hc, end: 'end', column: 'none', params: {} });
r = C.constructability(closedState, build(hss.state));
ok(by(r, 'water').length === 1 && by(r, 'water')[0].msg.vars.kind === 'closed', 'closed at both ends: needs a vent and a drain hole');
const lying = new Model(starterState());
lying.change('c', (tx) => tx.addMember({ type: 'beam', profile: 'HSS6x6x1/4', start: [0, 0, 3000], end: [5000, 0, 3000] }));
ok(by(run(lying), 'water').length === 0, 'a level tube with open ends collects nothing');
// 7. rules can be switched off
ok(run(frame({ weld: 8 }), { rules: ['access'] }).length === 0, 'rules: only the ones asked for');
// 8. shape of every problem
const sp = run(frame({ weld: 8, pitch: 30 }));
ok(sp.every((p) => p.id.startsWith('cons:') && p.source.name === 'detailcraft.constructability' && p.msg.key.startsWith('cons.prob.') && p.about.length > 0), 'every problem has an id, a source, a message key and what it is about');
ok(new Set(sp.map((p) => p.id)).size === sp.length, 'ids are unique');
// 9. the sample frame runs fast and finds the brace through a joint
const sm = sampleModel();
const t0 = Date.now(); const rs = C.constructability(sm.state, build(sm.state)); const ms = Date.now() - t0;
ok(ms < 1500, 'the sample frame (88 bolts) in ' + ms + ' ms');
ok(by(rs, 'access').some((p) => p.msg.vars.part === 'm11'), 'the sample: the brace m11 stands in front of the bolts at j13');
ok(by(rs, 'weld').length <= 2, 'the sample: welds are grouped, not one problem each (' + by(rs, 'weld').length + ')');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
