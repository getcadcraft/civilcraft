#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-erection.mjs — the erection plan behind the erection movie (0.8 round 2, EG.72): crane chart reading, picks and weights, the
 * erection order, radius / capacity / hook height by hand, two cranes working at once, the Problems, the movie data and the movie file.
 *   node tools/detailcraft-test/test-erection.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const Md = await load('model.js');
const { build } = await load('build.js');
const Mk = await load('marks.js');
const { sampleModel } = await load('sample.js');
const E = await load('erection.js');
const { erectionHtml, MOVIE_WORDS } = await load('erection-html.js');
import vm from 'node:vm';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const prep = (state) => { const b = build(state); return { b, mk: Mk.markParts(b, {}) }; };
const CHART = [{ radius: 6, kg: 8000 }, { radius: 10, kg: 5000 }, { radius: 14, kg: 3000 }, { radius: 20, kg: 1500 }];

console.log('chart');
ok(E.capacityAt(CHART, 5) === 8000 && E.capacityAt(CHART, 6) === 8000, 'inside and at the first row: the first capacity');
ok(E.capacityAt(CHART, 6.01) === 5000, 'between rows: the farther (lower) row, never interpolated up');
ok(E.capacityAt(CHART, 10) === 5000 && E.capacityAt(CHART, 14) === 3000 && E.capacityAt(CHART, 20) === 1500, 'on a row: that row');
ok(E.capacityAt(CHART, 20.01) === 0 && E.capacityAt([], 5) === 0, 'past the last row, or no chart: cannot lift');
const messy = E.cleanChart([{ radius: 12, kg: 4000 }, { radius: 6, kg: 3000 }, { radius: -1, kg: 5 }, { radius: 'x', kg: 1 }, null]);
ok(messy.length === 2 && messy[0].radius === 6 && messy[1].kg === 3000, 'cleanChart: sorted, junk dropped, capacity never rises with radius');

console.log('one column, by hand');
{
  const m = new Md.Model(Md.starterState('E'));
  m.change('c', (tx) => tx.addMember({ type: 'column', profile: 'W12x50', start: [0, 0, 0], end: [0, 0, 4000] }));
  const { b, mk } = prep(m.state);
  const w = b.parts[0].weight;
  near(w, b.parts[0].profile.mass * 4, 1e-9, 'the column weighs mass × length');
  const setup = { cranes: [{ id: 'a', at: [10000, 0], chart: CHART, hookHeight: 12000, deductKg: 100 }], laydown: [10000, 5000], riggingPct: 10, headroom: 1500, clearance: 500, limit: 0.5 };
  const pl = E.plan(m.state, b, mk, setup);
  const p = pl.picks[0];
  near(p.rPick, 5, 1e-9, 'pick-up radius 5 m'); near(p.rSet, 10, 1e-9, 'set radius 10 m'); near(p.radius, 10, 1e-9, 'the larger radius counts');
  ok(p.capacity === 5000, 'chart: 5000 kg at 10 m');
  near(p.load, w * 1.1 + 100, 1e-9, 'load = weight + 10 % rigging + deduction');
  near(p.util, (w * 1.1 + 100) / 5000, 1e-12, 'share of the chart');
  ok(p.status === 'ok', 'a light column at 10 m is fine');
  near(p.hookNeed, 4000 + 1500 + 500, 1e-9, 'hook height: top + headroom + clearance');
  const heavy = E.plan(m.state, b, mk, { ...setup, cranes: [{ ...setup.cranes[0], chart: [{ radius: 12, kg: 300 }] }] });
  ok(heavy.picks[0].status === 'over', 'over the chart: over');
  const far = E.plan(m.state, b, mk, { ...setup, cranes: [{ ...setup.cranes[0], at: [30000, 0] }], laydown: [30000, 5000] });
  ok(far.picks[0].status === 'out' && far.picks[0].capacity === 0, 'past the chart: out');
  const low = E.plan(m.state, b, mk, { ...setup, cranes: [{ ...setup.cranes[0], hookHeight: 5000 }] });
  ok(low.picks[0].status === 'hook', 'hook too low: hook');
  const hi = E.plan(m.state, b, mk, { ...setup, limit: 0.1, cranes: [{ ...setup.cranes[0], deductKg: 300 }] });
  ok(hi.picks[0].status === 'high' && E.erectionProblems(hi)[0].severity === 'warning', 'over the person\'s margin but under the chart: a warning');
  const none = E.plan(m.state, b, mk, E.emptySetup());
  ok(none.picks.length === 0 && E.erectionProblems(none)[0].code === 'erect.nocrane', 'no crane entered: no picks, one note');
}

console.log('the sample frame');
const sm = sampleModel();
const { b: sb, mk: smk } = prep(sm.state);
const ps = E.sequence(sm.state, sb, smk);
ok(ps.length === new Set(smk.asmOf.values()).size, 'one pick per assembly (each mark\'s copies separately): ' + ps.length);
near(ps.reduce((t, k) => t + k.weight, 0), sb.parts.reduce((t, p) => t + p.weight, 0), 1e-6, 'the picks add up to every part');
const at = (id) => ps.findIndex((k) => k.id === id);
const cols = sm.state.members.filter((x) => x.type === 'column').map((x) => x.id);
let carried = true;
for (const c of sm.state.connections) if (c.type === 'endplate') for (const col of [c.column]) if (at(c.beam) < at(col)) carried = false;
ok(carried, 'every beam is set after the columns that carry it');
ok(Math.max(...cols.map(at)) < Math.min(...sm.state.members.filter((x) => x.type === 'beam').map((x) => at(x.id))), 'one tier: all columns, then the beams');
const bracePick = ps.find((k) => k.type === 'brace');
ok(bracePick && at(bracePick.id) > 0, 'the brace is picked');

console.log('two cranes');
{
  const one = { cranes: [{ id: 'a', at: [3000, -6000], chart: CHART, hookHeight: 20000 }], laydown: [3000, -2000] };
  const two = { ...one, cranes: [one.cranes[0], { id: 'b', at: [9000, 12000], chart: CHART, hookHeight: 20000 }] };
  const p1 = E.plan(sm.state, sb, smk, one), p2 = E.plan(sm.state, sb, smk, two);
  ok(p1.picks.length === p2.picks.length, 'same picks');
  ok(p1.summary.minutes > 0 && p1.picks.every((p) => p.crane === 'a'), 'one crane does every pick, one after the other');
  let seq = true;
  for (let i = 1; i < p1.picks.length; i++) if (p1.picks[i].start < p1.picks[i - 1].end - 1e-9) seq = false;
  ok(seq, 'a single crane never works two picks at once');
  ok(new Set(p2.picks.map((p) => p.crane)).size >= 1, 'a crane is assigned to every pick');
  const finish = new Map(p2.picks.map((p) => [p.id, p.end]));
  ok(p2.picks.every((p) => p.wait.every((d) => (finish.get(d) ?? 0) <= p.start + 1e-9)), 'no pick starts before what carries it is set');
  const probs = E.erectionProblems(p1);
  ok(probs.every((q) => q.id && q.code && q.severity && q.source.kind === 'engine' && Array.isArray(q.about)), 'problems have the shared shape');
  const again = E.erectionProblems(E.plan(sm.state, sb, smk, one));
  ok(JSON.stringify(probs.map((q) => q.id)) === JSON.stringify(again.map((q) => q.id)), 'problem ids are stable between runs');
}

console.log('movie data');
{
  const pl = E.plan(sm.state, sb, smk, { cranes: [{ id: 'a', at: [3000, -6000], chart: CHART, hookHeight: 20000 }] });
  const d = E.movieData(pl, { title: 'Sample frame' });
  ok(d.format === 'cadcraft-erection' && d.picks.length === pl.picks.length && d.members.length >= sb.parts.length, 'one box per part, one entry per pick');
  ok(JSON.parse(JSON.stringify(d)).picks[0].mark === pl.picks[0].mark, 'plain JSON');
}

console.log('movie file');
{
  const pl = E.plan(sm.state, sb, smk, { cranes: [{ id: 'a', at: [3000, -6000], chart: CHART, hookHeight: 20000 }] });
  const html = erectionHtml({ title: 'A <b>"model"</b>', data: E.movieData(pl, { title: 'x' }), words: {} });
  ok(/Content-Security-Policy[^>]*default-src 'none'/.test(html), 'a policy that forbids every request');
  ok(!/https?:\/\//.test(html), 'no address in the file');
  ok(!html.includes('<b>"model"</b>') && html.includes('&lt;b&gt;'), 'the title is escaped');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  ok(scripts.length === 1, 'one script'); let compiled = true; try { new vm.Script(scripts[0]); } catch (e) { compiled = false; console.log(e.message); }
  ok(compiled, 'the player script compiles');
  const data = JSON.parse(/id="data">([\s\S]*?)<\/script>/.exec(html)[1].replace(/\\u003c/g, '<'));
  ok(data.picks.length === pl.picks.length, 'the data in the file is the plan');
  ok(Object.keys(MOVIE_WORDS).every((k) => typeof MOVIE_WORDS[k] === 'string'), 'words are all strings');
  const sneaky = erectionHtml({ title: 't', data: { ...E.movieData(pl), title: '</script><script>alert(1)</script>' } });
  ok((sneaky.match(/<script/g) || []).length === 3, 'text in the data cannot close the script');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
