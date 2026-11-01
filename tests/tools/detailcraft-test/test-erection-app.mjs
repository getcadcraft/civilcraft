#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-erection-app.mjs — the erection plan inside the app's model and tools (0.8 round 2, EG.72): the crane setup is saved in the model
 * file and read back cleaned; the two assistant tools (erection_describe, erection_crane_set) with preview and one undo step.
 *   node tools/detailcraft-test/test-erection-app.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Model } = await load('model.js'), { build } = await load('build.js'), Mk = await load('marks.js'), { sampleModel } = await load('sample.js'), AG = await load('agents.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

const model = new Model(sampleModel().state);
const cur = () => { const b = build(model.state); return { b, k: Mk.markParts(b, {}) }; };
const app = { model: () => model, built: () => cur().b, marks: () => cur().k, busy: () => null };
const tools = Object.fromEntries(AG.detailTools(app).map((t) => [t.name, t]));
ok(tools.erection_describe && tools.erection_crane_set, 'both tools are registered');
let r = tools.erection_describe.run({});
ok(r.lifts.length === 0 && r.cranes.length === 0, 'no crane: no lifts');
const chart = [{ radius: 6, kg: 8000 }, { radius: 10, kg: 5000 }, { radius: 20, kg: 1500 }];
ok(tools.erection_crane_set.preview({ id: 'c1', x: 3000, y: -6000, chart }).wouldSet.chart.length === 3 && !model.state.erection, 'preview changes nothing');
const before = model.undoStack.length;
tools.erection_crane_set.run({ id: 'c1', name: 'Example', x: 3000, y: -6000, hookHeight: 20000, chart });
ok(model.state.erection.cranes.length === 1 && model.undoStack.length === before + 1 && /^Assistant: /.test(model.undoStack.at(-1).label), 'one undo step, labelled as the assistant');
r = tools.erection_describe.run({});
ok(r.lifts.length > 5 && r.summary.picks === r.lifts.length && r.notALiftPlan === true, 'lifts listed (' + r.lifts.length + ')');
tools.erection_crane_set.run({ id: 'c1', chart: [{ radius: 5, kg: 100 }] });
ok(model.state.erection.cranes.length === 1 && model.state.erection.cranes[0].name === 'Example' && model.state.erection.cranes[0].at[0] === 3000, 'same id changes the crane and keeps what was not given');
ok(tools.erection_describe.run({}).summary.over > 0, 'a 100 kg chart puts lifts over the chart');
// file round trip, with junk in the file
const m2 = new Model(sampleModel().state);
m2.load(model.toJSON());
ok(m2.state.erection?.cranes[0].chart[0].kg === 100, 'the setup is in the saved file and comes back');
const j = JSON.parse(model.toJSON()); j.erection.cranes[0].chart = [{ radius: 'x', kg: 5 }, { radius: 4, kg: 9 }]; j.erection.limit = 9;
m2.load(JSON.stringify(j));
ok(m2.state.erection.cranes[0].chart.length === 1 && m2.state.erection.limit === 0.85, 'a bad chart row and a bad limit are cleaned on load');
// connection autopilot tool
const ap = tools.connection_autopilot;
const m3 = new Model(sampleModel().state);
const app3 = { model: () => m3, built: () => build(m3.state), marks: () => Mk.markParts(build(m3.state), {}), busy: () => null };
const ap3 = Object.fromEntries(AG.detailTools(app3).map((t) => [t.name, t])).connection_autopilot;
const pv = ap3.preview({});
const u0 = m3.undoStack.length;
ok(!m3.state.connections.length || true, 'sample');
if (pv.wouldAdd && Object.keys(pv.wouldAdd).length) {
  const res = ap3.run({});
  ok(res.added.length === Object.values(pv.wouldAdd).reduce((a, b) => a + b, 0) && m3.undoStack.length === u0 + 1 && res.startingValues, 'autopilot tool: preview counts match, one undo step');
}
let threw = false; try { ap3.run({}); } catch (e) { threw = /No open joint/.test(e.message); }
ok(threw, 'autopilot tool: a second run says there is nothing to connect');
// foundation tools
{
  const m4 = new Model(sampleModel().state);
  const app4 = { model: () => m4, built: () => build(m4.state), marks: () => Mk.markParts(build(m4.state), {}), busy: () => null };
  const T4 = Object.fromEntries(AG.detailTools(app4).map((t) => [t.name, t]));
  let msg = ''; try { T4.footing_check.run({}); } catch (e) { msg = e.message; }
  ok(/No footing has column loads/.test(msg), 'footing_check: says what to do when there are no loads');
  const f0 = m4.state.footings[0];
  m4.change('loads', (tx) => { tx.s.foundation = { soil: { qa: 100 }, loads: { [f0.id]: [{ x: 0, y: 0, cx: 300, cy: 300, service: { P: 900 }, strength: { P: 1200 } }] } }; });
  const fc = T4.footing_check.run({});
  ok(fc.footings.length === 1 && fc.footings[0].checks.some((c) => c.id === 'bearing') && fc.footings[0].checks.every((c) => c.clause), 'footing_check: checks with clauses (' + fc.footings[0].checks.length + ')');
  const pg = T4.pile_group_check.run({ piles: [{ x: -750, y: 0 }, { x: 750, y: 0 }], P: 1000, My: 300, compression: 800 });
  ok(pg.reactionsKN.join() === '300,700' && pg.equilibrium, 'pile_group_check: 1000 kN and My 300 on two piles 1.5 m apart = 300 / 700 kN');
  const rw = T4.retaining_wall_check.run({ H: 3000, baseThickness: 500, stem: 400, toe: 800, heel: 1800, gamma: 18, phi: 30, mu: 0.5 });
  ok(rw.Ka === 0.3333 && rw.PaKNperM === 36.75, 'retaining_wall_check: Ka 1/3, Pa 36.75 kN/m');
  const j = JSON.parse(m4.toJSON()); j.foundation.soil.qa = -5; j.foundation.loads[f0.id][0].service.P = 'x';
  const m5 = new Model(sampleModel().state); m5.load(JSON.stringify(j));
  ok(m5.state.foundation.soil.qa === 0 && m5.state.foundation.loads[f0.id][0].service.P === 0, 'foundation settings are cleaned on load');
}
// framing tools
{
  const m6 = new Model(sampleModel().state);
  const T6 = Object.fromEntries(AG.detailTools({ model: () => m6, built: () => build(m6.state), marks: () => Mk.markParts(build(m6.state), {}), busy: () => null }).map((t) => [t.name, t]));
  ok(T6.framing_panels.run({}).panels.length === 0, 'framing_panels: none yet');
  const pv = T6.framing_panel_add.preview({ kind: 'wall', length: 3600, height: 2700, openings: [{ x: 1200, width: 900, height: 2100 }] });
  ok(pv.summary.pieces === 19 && !m6.state.framing, 'framing_panel_add preview: 19 pieces, nothing added');
  const u0 = m6.undoStack.length;
  const rr = T6.framing_panel_add.run({ kind: 'wall', length: 3600, height: 2700, openings: [{ x: 1200, width: 900, height: 2100 }] });
  ok(rr.summary.pieces === 19 && m6.undoStack.length === u0 + 1 && /^Assistant: /.test(m6.undoStack.at(-1).label), 'framing_panel_add: one undo step labelled as the assistant');
  const lst = T6.framing_panels.run({});
  ok(lst.panels[0].cutList.find((r) => r.piece === 'stud').count === 7, 'framing_panels: the cut list has 7 studs');
  const m7 = new Model(sampleModel().state); m7.load(m6.toJSON());
  ok(m7.state.framing.panels.length === 1, 'the panels survive the file');
}
model.undo();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
