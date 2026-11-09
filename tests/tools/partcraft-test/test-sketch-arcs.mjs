#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-sketch-arcs.mjs — PartCraft's Arc tool, the ten ways to draw an arc plus Continue (0.9 FX.137): arcs/arcs.js geometry
 * through sketch-arcs.js into centre + start + end entities, the solver keeping them, relations (shared points, tangent on Continue,
 * a radius dimension), trim on the result, and the byte-identical shared copy.
 *   node tools/partcraft-test/test-sketch-arcs.mjs     (or runSketchArcTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runSketchArcTests({ ok, section, near }) {
  const imp = (f) => import(pathToFileURL(DEV + f).href);
  const S = await imp('sketch.js'), SA = await imp('sketch-arcs.js'), A = await imp('arcs/arcs.js'), T = await imp('sketch-tools.js');
  const { solveSketch } = await imp('solver.js');
  const PI = Math.PI;
  const P = (x, y) => ({ x, y });
  const snap = (x, y, ref = null) => ({ xy: [x, y], ref, on: null });
  const arcOf = (sk, id) => { const e = S.byId(sk, id); const g = S.arcAngles(sk, e); return { cx: g.c[0], cy: g.c[1], r: g.r, a0: g.a0, sweep: g.sweep }; };
  const draw = (id, v, opt = {}) => { const sk = S.newSketch(); const r = A.solve(id, v, opt); const m = SA.addSolvedArc(sk, r.arc, v.filter((q) => q && typeof q === 'object').map((q) => snap(q.x, q.y)), opt); return { sk, r, m }; };
  const ends = (sk, m) => ({ c: S.pointXY(sk, m.c), s: S.pointXY(sk, m.s), e: S.pointXY(sk, m.e) });
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  section('sketch arcs: the shared copy and the method list');
  ok(fs.readFileSync(DEV + 'arcs/arcs.js').equals(fs.readFileSync(path.join(REPO, 'lib/arcs/arcs.js'))), 'dev/arcs/arcs.js is byte-identical to lib/arcs/arcs.js');
  ok(SA.METHOD_ORDER.length === 11 && SA.METHOD_ORDER.every((m) => A.METHODS[m]), 'the eleven methods (ten + Continue) are all arcs.js methods');
  ok(Object.keys(SA.CMD_METHOD).length === 11 && SA.CMD_METHOD['tool-arc-sed'] === 'SED', 'each has a tool-arc-<id> command');
  const lang = JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8'));
  ok(SA.METHOD_ORDER.every((m) => lang['ui.sketch.arc.method.' + m] && lang['ui.tb.sketchmenu.arc_' + m.toLowerCase()] && lang['input.cmd.sketch.arc-' + m.toLowerCase()]), 'lang/en.json names every method (menu, command, prompt)');
  ok(Object.keys(lang).filter((k) => k.startsWith('ui.sketch.arc.') || k.includes('sketchmenu.arc_') || k.startsWith('input.cmd.sketch.arc-')).every((k) => lang['@context'][k]), 'every new key has its @context note');

  section('sketch arcs: each method makes the arc arcs.js solves (centre, start, end)');
  // expected: centre (0,0), r 5, from 0 to 90 degrees CCW, except where the method's meaning differs
  const cases = [
    ['3P', [P(5, 0), P(Math.SQRT1_2 * 5, Math.SQRT1_2 * 5), P(0, 5)]],
    ['SCE', [P(5, 0), P(0, 0), P(0, 9)]],
    ['SCA', [P(5, 0), P(0, 0), PI / 2]],
    ['SCL', [P(5, 0), P(0, 0), 5 * Math.SQRT2]],
    ['SEA', [P(5, 0), P(0, 5), PI / 2]],
    ['SED', [P(5, 0), P(0, 5), -PI / 2]],   // heading straight down from the start, ends up at (0,5): the arc round (0,0)? checked below by the tangent
    ['SER', [P(5, 0), P(0, 5), 5]],
    ['CSE', [P(0, 0), P(5, 0), P(0, 9)]],
    ['CSA', [P(0, 0), P(5, 0), PI / 2]],
    ['CSL', [P(0, 0), P(5, 0), 5 * Math.SQRT2]],
  ];
  for (const [id, v] of cases) {
    const { sk, r, m } = draw(id, v);
    const e = ends(sk, m), g = arcOf(sk, m.id), want = r.arc;
    ok(r.arc, id + ': solved');
    ok(near(g.cx, want.cx, 1e-9) && near(g.cy, want.cy, 1e-9) && near(g.r, want.r, 1e-9), id + ': the entity is on arcs.js\'s circle');
    ok(near(g.sweep, (want.a1 - want.a0 + 4 * PI) % (2 * PI) || 2 * PI, 1e-9), id + ': same sweep, counter-clockwise');
    ok(near(Math.hypot(e.s[0] - want.cx, e.s[1] - want.cy), want.r, 1e-9) && near(Math.hypot(e.e[0] - want.cx, e.e[1] - want.cy), want.r, 1e-9), id + ': start and end lie on the circle');
    if (id !== 'SED') ok(near(g.r, 5, 1e-9) && d(e.c, [0, 0]) < 1e-9 && near(g.sweep, PI / 2, 1e-9), id + ': centre (0,0), r 5, a quarter turn');
    ok(sk.entities.filter((x) => x.type === 'arc').length === 1 && S.byId(sk, m.id).type === 'arc', id + ': one arc entity of centre + start + end points');
  }
  { // SED: tangent at the start points down; the arc from (5,0) to (0,5) leaving downwards is the three-quarter arc round (0,0)? no: centre sits left of travel
    const { sk, r, m } = draw('SED', [P(5, 0), P(0, 5), -PI / 2]);
    const g = arcOf(sk, m.id);
    ok(near(g.r, 5, 1e-9) && d([g.cx, g.cy], [0, 0]) < 1e-9 && near(g.sweep, 3 * PI / 2, 1e-9), 'SED: heading down from (5,0) to (0,5) is the three-quarter arc round the origin');
  }
  { // negative angle and negative chord: the clockwise arc, stored CCW between the same ends
    const { sk, m } = draw('SCA', [P(5, 0), P(0, 0), -PI / 2]);
    const e = ends(sk, m);
    ok(d(e.s, [0, -5]) < 1e-9 && d(e.e, [5, 0]) < 1e-9, 'a negative angle: the clockwise arc, stored with its ends swapped');
    const w = draw('SER', [P(5, 0), P(0, 5), -5]);
    ok(near(arcOf(w.sk, w.m.id).sweep, 3 * PI / 2, 1e-9), 'a negative radius is the longer way round');
  }
  ok(A.solve('3P', [P(0, 0), P(1, 1), P(2, 2)]).error === 'line' && A.solve('SER', [P(0, 0), P(10, 0), 1]).error === 'radius' && A.solve('SCL', [P(1, 0), P(0, 0), 3]).error === 'chord' && A.solve('SEA', [P(1, 1), P(1, 1), 1]).error === 'same', 'the errors the tool reports (line, radius, chord, same) come from arcs.js');

  section('sketch arcs: relations, solver, dimensions, trim');
  {
    // points that were clicked on existing points are shared, not duplicated
    const sk = S.newSketch();
    const l = S.addLine(sk, [0, 0], [10, 0]);
    const v = [P(10, 0), P(10, 5), P(5, 5)];   // SCE-ish: use SEA from the line's end
    const res = A.solve('SEA', [P(10, 0), P(15, 5), PI / 2]);
    const before = sk.entities.length;
    const m = SA.addSolvedArc(sk, res.arc, [snap(10, 0, l.p2), snap(15, 5)]);
    ok(sk.constraints.some((c) => c.type === 'coincident' && c.refs.includes(l.p2) && c.refs.includes(m.s)), 'a start clicked on an existing point is tied to it by a coincident relation');
    ok(sk.constraints.filter((c) => c.type === 'coincident').length === 1 && sk.entities.length === before + 4, 'and nothing else is tied: the arc, its centre, start and end');
    const r = solveSketch(sk);
    ok(r && !r.conflicts?.length, 'the solver accepts it with no conflicts');
    ok(d(S.pointXY(sk, m.c), [res.arc.cx, res.arc.cy]) < 1e-6, 'a solve leaves the centre where arcs.js put it');
    // a point on a curve (snap.on) gets a coincident relation
    const sk2 = S.newSketch(); const l2 = S.addLine(sk2, [0, 0], [10, 0]);
    const a2 = A.solve('3P', [P(5, 0), P(7, 2), P(9, 0)]);
    const m2 = SA.addSolvedArc(sk2, a2.arc, [{ xy: [5, 0], ref: null, on: l2.id }, snap(7, 2), snap(9, 0)]);
    ok(sk2.constraints.some((c) => c.type === 'coincident' && c.refs.includes(l2.id)), 'a point snapped onto a line gets a point-on-curve relation');
    const off = SA.addSolvedArc(S.newSketch(), a2.arc, [{ xy: [5, 0], ref: 'x', on: null }], { auto: false });
    ok(off.joined === 0, 'autoRelations off: nothing is joined');
  }
  {
    // typed radius becomes a driving dimension (Start, End, Radius)
    const sk = S.newSketch();
    const res = A.solve('SER', [P(0, 0), P(6, 0), 5]);
    const m = SA.addSolvedArc(sk, res.arc, [snap(0, 0), snap(6, 0)], { radius: 5 });
    ok(sk.constraints.some((c) => c.type === 'radius' && c.refs[0] === m.id && near(c.value, 5)), 'a typed radius is a radius dimension on the arc');
    const s = solveSketch(sk);
    ok(!s?.conflicts?.length, 'and the sketch still solves');
  }
  {
    // trim and extend keep working on a made arc
    const sk = S.newSketch();
    const res = A.solve('3P', [P(-5, 0), P(0, 5), P(5, 0)]);
    const m = SA.addSolvedArc(sk, res.arc, [snap(-5, 0), snap(0, 5), snap(5, 0)]);
    const cut = S.addLine(sk, [0, -1], [0, 8]);
    let ok2 = true; try { T.trim(sk, m.id, [-3, 4]); } catch (e) { ok2 = false; }
    ok(ok2 && sk.entities.some((e) => e.type === 'arc'), 'trim works on an arc the tool made (crossing line)');
  }

  section('sketch arcs: Continue');
  {
    const sk = S.newSketch();
    ok(SA.continueFrom(sk) === null, 'nothing to continue in an empty sketch');
    const l = S.addLine(sk, [0, 0], [10, 0]);
    const f = SA.continueFrom(sk);
    ok(f && near(f.x, 10) && near(f.y, 0) && near(f.dir, 0) && f.ref === l.p2 && f.entity === l.id, 'after a line: its end, its heading and its point');
    S.addLine(sk, [3, 3], [4, 4], { construction: true });
    ok(SA.continueFrom(sk).entity === l.id, 'construction lines are skipped');
    const res = A.solve('CON', [P(15, 5)], { from: f });
    ok(res.arc && near(res.arc.r, 5, 1e-9) && d([res.arc.cx, res.arc.cy], [10, 5]) < 1e-9, 'Continue from a line heading +x to (15,5): a quarter circle about (10,5)');
    const m = SA.addSolvedArc(sk, res.arc, [snap(f.x, f.y, f.ref), snap(15, 5)], { tangentTo: f.entity });
    ok(sk.constraints.some((c) => c.type === 'coincident' && c.refs.includes(l.p2) && c.refs.includes(m.s)), 'the new arc starts in the line\'s end point (coincident)');
    ok(sk.constraints.some((c) => c.type === 'tangent'), 'with a tangent relation to the line');
    const s = solveSketch(sk);
    ok(!s?.conflicts?.length, 'the solver holds it');
    const g = arcOf(sk, m.id);
    ok(d([g.cx, g.cy], [10, 5]) < 1e-6 && near(g.r, 5, 1e-6), 'and the arc did not move');
    // then continue from the arc
    const f2 = SA.continueFrom(sk);
    ok(f2.entity === m.id && near(f2.x, 15, 1e-6) && near(f2.y, 5, 1e-6) && near(f2.dir, PI / 2, 1e-6), 'then from the arc: its end, heading +y');
    const r2 = A.solve('CON', [P(20, 10)], { from: f2 });
    ok(r2.arc && near(r2.arc.r, 5, 1e-9) && d([r2.arc.cx, r2.arc.cy], [20, 5]) < 1e-9, 'a second Continue, from the arc: a quarter circle the other way round (20,5)');
    ok(A.solve('CON', [P(15, 15)], { from: f2 }).arc === undefined, 'a point straight ahead of the heading is no arc');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, n) => { if (c) pass++; else { fail++; console.log('FAIL ' + n); } };
  const section = (n) => console.log('\n== ' + n);
  const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;
  await runSketchArcTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
