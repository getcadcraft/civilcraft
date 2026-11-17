#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-railline.mjs — CivilCraft CV.1 (2026-11-12): what a railway alignment gained beside the cant.
 *   rail-checks.js     grade, vertical curve radius and length, short arcs and straights, rate of change of cant deficiency, curvature along the line
 *   rail-turnouts.js   turnouts and crossovers placed on an alignment (project coordinates), their checks, plan items, 3D lines
 *   rail-clearance.js  the clearance envelope: tilt with the cant, curve throw, sweep, clashes, track spacing, platform edge
 *   project.js         railChecks / railTurnouts / railClearance / railWarnings, the file round trip
 *   landxml.js         <Cant> with CantStation out and in
 * Known answers are worked by hand in the comments beside each check.
 *   node bin/test-civilcraft-railline.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const AL = await mod('alignment.js'), PR = await mod('profile.js'), RL = await mod('rail.js'), RC = await mod('rail-checks.js'), RT = await mod('rail-turnouts.js');
const CL = await mod('rail-clearance.js'), TU = await mod('turnout.js'), PJ = await mod('project.js'), PB = await mod('problems-civilcraft.js'), LX = await mod('landxml.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const codes = (ws) => ws.map((w) => w.code);

// one curve: tangent east 0→(600,0), turning left toward (1000, 400); R 500, transitions 80
const curved = (o = {}) => AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 500, ls: 80, ...o }, { x: 1000, y: 400 }], start: 0 });

section('curvature along the line');
{
  const al = curved(), c = al.curves[0];
  ok(al.ok, 'alignment builds');
  near(RC.curvatureAt(al, c.ts - 5), 0, 1e-15, 'straight: 0');
  near(RC.curvatureAt(al, (c.sc + c.cs) / 2), 1 / 500, 1e-12, 'arc turning left: +1/R');
  near(RC.curvatureAt(al, c.ts + 40), 0.5 / 500, 1e-9, 'clothoid, half way in: half of 1/R');
  near(RC.curvatureAt(al, c.st - 20), 0.25 / 500, 1e-9, 'clothoid, a quarter from the end going out: a quarter of 1/R');
  const bl = curved({ tr: 'bloss' }), cb = bl.curves[0];
  near(RC.curvatureAt(bl, cb.ts + 20), (3 * 0.0625 - 2 * 0.015625) / 500, 1e-9, 'Bloss at u = 1/4: (3u² − 2u³)/R');
  const right = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 500 }, { x: 1000, y: -400 }], start: 0 });
  near(RC.curvatureAt(right, (right.curves[0].sc + right.curves[0].cs) / 2), -1 / 500, 1e-12, 'turning right: −1/R');
}

section('track geometry checks');
{
  const rail = RL.cleanRail({ on: true }, 'm'), al = curved();
  ok(rail.limits.grade === 12.5 && rail.limits.vRadius === 0.35 && rail.limits.elementTime === 1.8 && rail.limits.defRate === 55, 'the new limits come with the defaults');
  // profile: 0 → 150 at +10 mm/m, then −5 mm/m; vertical curve L = 60 at the PVI: Rv = 60 / 0.015 = 4000 m
  const prof = PR.buildProfile([{ sta: 0, z: 100, L: 0 }, { sta: 150, z: 101.5, L: 60 }, { sta: al.end, z: 101.5 - (al.end - 150) * 0.005, L: 0 }]);
  const plan = RL.cantPlan(al, rail, { speed: 120, units: 'm', id: 'a1', name: 'Main' });
  const r = RC.trackChecks(al, prof, rail, { speed: 120, units: 'm', id: 'a1', name: 'Main', plan });
  near(r.vertical[0].radius, 4000, 1e-6, 'vertical curve radius = L / |g2 − g1| = 60 / 0.015');
  near(r.vertical[0].need, 0.35 * 120 * 120, 1e-9, 'needed Rv = k·V² = 0.35 × 120² = 5040 m');
  ok(codes(r.warnings).includes('rail.vert.radius'), '4000 m < 5040 m → rail.vert.radius');
  ok(!codes(r.warnings).includes('rail.vert.grade'), '10 mm/m is inside 12.5 mm/m');
  ok(!codes(r.warnings).includes('rail.vert.length'), '60 m is over the 20 m least length');
  near(r.grades[0].g, 10, 1e-9, 'first grade 10 mm/m'); near(r.grades[1].g, -5, 1e-9, 'second grade −5 mm/m');
  const w = r.warnings.find((x) => x.code === 'rail.vert.radius');
  ok(w.about.kind === 'alignment' && w.about.id === 'a1' && w.ref === 'a1' && w.hard === false && w.msg.key === 'rail.vert.radius' && w.limit === 5040 && Math.abs(w.value - 4000) < 1e-6 && w.unit === 'm', 'the warning carries the Problems shape with limit and value');
  ok(w.text.includes('Main') && !w.text.includes('{'), 'its sentence is filled: ' + w.text);
  // steeper: 15 mm/m
  const steep = PR.buildProfile([{ sta: 0, z: 100, L: 0 }, { sta: al.end, z: 100 + al.end * 0.015, L: 0 }]);
  const rs = RC.trackChecks(al, steep, rail, { speed: 120, units: 'm', id: 'a1', name: 'Main', plan });
  ok(codes(rs.warnings).includes('rail.vert.grade') && rs.warnings.find((x) => x.code === 'rail.vert.grade').value === 15, '15 mm/m > 12.5 → rail.vert.grade, value 15');
  // a short vertical curve
  const short = PR.buildProfile([{ sta: 0, z: 100, L: 0 }, { sta: 200, z: 100.2, L: 10 }, { sta: al.end, z: 100.2, L: 0 }]);
  ok(codes(RC.trackChecks(al, short, rail, { speed: 40, units: 'm', plan }).warnings).includes('rail.vert.length'), 'a 10 m vertical curve < 20 m → rail.vert.length');
  // no speed: no radius need; no profile: a note
  ok(RC.trackChecks(al, prof, rail, { units: 'm', plan }).vertical[0].need === null, 'no line speed: no vertical radius need');
  ok(codes(RC.trackChecks(al, null, rail, { speed: 120, units: 'm', plan }).warnings).filter((c2) => c2.startsWith('rail.vert.')).join() === 'rail.vert.none', 'no design profile: one vertical line, the note rail.vert.none');
  ok(RC.trackChecks(al, null, rail, { speed: 120, units: 'm' }).warnings.find((x) => x.code === 'rail.vert.none').severity === 'note', 'that one is a note');
  // a vertical curve on a transition
  const c = al.curves[0], onTr = PR.buildProfile([{ sta: 0, z: 100, L: 0 }, { sta: c.ts + 40, z: 101, L: 60 }, { sta: al.end, z: 101, L: 0 }]);
  const cp = RL.cantPlan(al, rail, { speed: 120, units: 'm' });
  ok(codes(RC.trackChecks(al, onTr, rail, { speed: 120, units: 'm', plan: cp }).warnings).includes('rail.vert.ontransition'), 'a vertical curve over a transition → the note rail.vert.ontransition');
  ok(!codes(r.warnings).includes('rail.vert.ontransition'), 'the first profile\'s vertical curve (stations 120–180) is clear of the transition');

  // ---- horizontal
  // shortest element at 120 km/h: v·t = 33.33 × 1.8 = 60 m (the familiar V/2)
  near(r.elements[0].need, 60, 1e-9, 'shortest element at 120 km/h and 1.8 s = 60 m (V/2)');
  ok(!codes(r.warnings).includes('rail.horiz.arc'), `this arc (${r.elements[0].len.toFixed(1)} m) is long enough`);
  const tight = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 500, ls: 30 }, { x: 1195, y: 80 }], start: 0 });   // a small turn: the arc left between the transitions is short
  ok(tight.ok, 'small-turn alignment builds');
  const rt = RC.trackChecks(tight, null, rail, { speed: 120, units: 'm' });
  const arcLen = tight.curves[0].cs - tight.curves[0].sc;
  ok(arcLen > 0 && arcLen < 60 && codes(rt.warnings).includes('rail.horiz.arc'), `a ${arcLen.toFixed(1)} m arc < 60 m → rail.horiz.arc`);
  // two curves with a short straight between
  const two = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 300, y: 0, r: 400 }, { x: 560, y: 150, r: 400 }, { x: 900, y: 150 }], start: 0 });
  ok(two.ok, 'two-curve alignment builds');
  const r2 = RC.trackChecks(two, null, rail, { speed: 120, units: 'm' }), st = r2.elements.find((e) => e.kind === 'straight');
  near(st.len, two.curves[1].ts - two.curves[0].st, 1e-9, 'the straight between = TS₂ − ST₁');
  ok((st.len < 60) === codes(r2.warnings).includes('rail.horiz.straight'), `at 120 km/h the straight (${st.len.toFixed(1)} m) is flagged exactly when under 60 m`);
  const fast = ((st.len + 10) / 1.8) * 3.6, r3 = RC.trackChecks(two, null, rail, { speed: fast, units: 'm' });
  ok(codes(r3.warnings).includes('rail.horiz.straight') && Math.abs(r3.warnings.find((x) => x.code === 'rail.horiz.straight').limit - (st.len + 10)) < 1e-9, 'at a speed that needs 10 m more than it has: rail.horiz.straight, limit = v × 1.8 s');
  ok(!codes(RC.trackChecks(two, null, rail, { speed: ((st.len - 10) / 1.8) * 3.6, units: 'm' }).warnings).includes('rail.horiz.straight'), 'at a speed that needs 10 m less: not flagged');
  // least radius
  const rr = RC.trackChecks(al, null, { ...rail, limits: { ...rail.limits, radius: 800 } }, { speed: 120, units: 'm' });
  ok(codes(rr.warnings).includes('rail.horiz.radius') && rr.warnings.find((x) => x.code === 'rail.horiz.radius').value === 500, 'R 500 under a least radius of 800 → rail.horiz.radius');
  ok(!codes(r.warnings).includes('rail.horiz.radius'), 'least radius 0 = not checked');
  // rate of change of cant deficiency: no applied cant, V 120, R 500: Eq = 1507 × 33.33² / (9.81 × 500) = 341.4 mm = the deficiency;
  // over an 80 m clothoid: D·v / L = 341.4 × 33.33 / 80 = 142.2 mm/s
  const base = RL.baseOf(rail), D = RL.equilibriumCant(120, 500, base);
  near(base, 1507, 1e-9, 'rail centres 1435 + 72'); near(D, (1507 * (120 / 3.6) ** 2) / (9.81 * 500), 1e-9, 'equilibrium cant by hand');
  const wd = r.warnings.find((x) => x.code === 'rail.cant.defrate');
  ok(!!wd, 'rail.cant.defrate raised'); near(wd.value, (D * (120 / 3.6)) / 80, 1e-6, 'deficiency rate = D·v / L');
  const bl = curved({ tr: 'bloss' }), pb = RL.cantPlan(bl, rail, { speed: 120, units: 'm' });
  near(RC.trackChecks(bl, null, rail, { speed: 120, units: 'm', plan: pb }).warnings.find((x) => x.code === 'rail.cant.defrate').value, (1.5 * D * (120 / 3.6)) / 80, 1e-6, 'on a Bloss transition the steepest rate is 1.5 × that');
  ok(!codes(RC.trackChecks(al, null, rail, { units: 'm', plan: RL.cantPlan(al, rail, { units: 'm' }) }).warnings).some((c2) => /defrate|horiz\.arc|horiz\.straight/.test(c2)), 'no speed: nothing that needs one is checked');
  // feet: the same line in feet gives the same answers in feet
  const k = 1200 / 3937, alf = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600 / k, y: 0, r: 500 / k, ls: 80 / k }, { x: 1000 / k, y: 400 / k }], start: 0 });
  const rf = RC.trackChecks(alf, null, RL.cleanRail({ on: true, rail: '60E1', limits: rail.limits }, 'ft'), { speed: 120, units: 'ft', plan: RL.cantPlan(alf, RL.cleanRail({ on: true, rail: '60E1', limits: rail.limits }, 'ft'), { speed: 120, units: 'ft' }) });
  near(rf.elements[0].need, 60 / k, 1e-6, 'feet: the shortest element is 60 m in feet');
  near(rf.warnings.find((x) => x.code === 'rail.cant.defrate').value, wd.value, 1e-6, 'feet: the same deficiency rate in mm/s');
  ok(RC.trackChecks(null, prof, rail).warnings.length === 0 && RC.trackChecks(al, prof, null).warnings.length === 0 && RC.trackChecks(al, prof, { on: false }).warnings.length === 0, 'no alignment / not a railway: nothing');
}

section('a turnout on an alignment');
{
  const al = AL.buildAlignment({ pis: [{ x: 100, y: 50 }, { x: 100, y: 850 }], start: 1000 });   // due north, station 1000 at (100, 50)
  const t = { id: 'tu1', name: 'T1', n: 9, gauge: 1.435, side: 'L', switchLength: 6.1, switchAngle: 0.0143, station: 1200, spacing: 0, alignment: 'a1', show: 'yes' };
  const p = RT.placeTurnout(al, t, { units: 'm' }), T = TU.turnout({ n: 9, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143 });
  ok(p.ok, 'places');
  near(p.toe.x, 100, 1e-9, 'toe x on the line'); near(p.toe.y, 250, 1e-9, 'toe at station 1200 = 200 m up the line');
  near(p.lead, T.lead, 1e-12, 'lead as turnout.js'); near(p.frogSta, 1200 + T.lead, 1e-9, 'frog station = toe + lead');
  near(p.frog.y, 250 + T.lead, 1e-9, 'frog is the lead up the line');
  near(p.frog.x, 100 - 1.435, 1e-9, 'left-hand going north: the frog is the gauge to the WEST');
  const pr = RT.placeTurnout(al, { ...t, side: 'R' }, { units: 'm' });
  near(pr.frog.x, 100 + 1.435, 1e-9, 'right-hand: to the east');
  const last = p.centre[p.centre.length - 1], prev = p.centre[p.centre.length - 2];
  near(Math.atan2(last.y - prev.y, last.x - prev.x), Math.PI / 2 + T.theta, 1e-9, 'it leaves at the frog angle off the line');
  near(Math.hypot(p.rails[0][0].x - p.rails[1][0].x, p.rails[0][0].y - p.rails[1][0].y), 1.435, 1e-6, 'its two rails are the gauge apart at the toe');
  const fi = T.centre.length - 1;
  near(Math.hypot(p.rails[0][fi].x - p.rails[1][fi].x, p.rails[0][fi].y - p.rails[1][fi].y), 1.435, 1e-3, 'and at the frog');
  near(p.speed, Math.sqrt((T.R * 100) / (1500 / 127.12)), 1e-9, 'no railway settings: speed from the closure radius, deficiency 100 mm, rail centres 1500');
  const rail = RL.cleanRail({ on: true }, 'm');
  near(RT.placeTurnout(al, t, { units: 'm', rail }).speed, Math.sqrt((T.R * 130) / (1507 / 127.12)), 1e-9, 'a railway: its own deficiency limit (130) and rail centres (1507)');
  // the branch as an alignment: it ends tangent at the frog angle and passes through the frog
  const br = AL.buildAlignment({ pis: p.branch.pis, start: 0 });
  ok(br.ok, 'the diverging route builds as an alignment');
  const so = br.stationOffset(p.frog.x, p.frog.y);
  near(so.off, 0, 1e-6, 'the frog point lies on it'); near(br.curves[0].r, T.R, 1e-9, 'its curve is the closure radius');
  near(AL.normAng(br.pointAt(br.end).dir - Math.PI / 2), T.theta, 1e-9, 'and it runs on at the frog angle');
  // feet
  const k = 1200 / 3937, alf = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 3000, y: 0 }], start: 0 }), pf = RT.placeTurnout(alf, { ...t, station: 500 }, { units: 'ft' });
  near(pf.lead, T.lead / k, 1e-9, 'feet project: the lead in feet'); near(pf.frog.y, 1.435 / k, 1e-9, 'feet: the gauge in feet, to the left of east = north');
  near(pf.R, T.R / k, 1e-9, 'feet: the radius in feet');
  // a crossover to a parallel track 4.5 m to the left
  const x = RT.placeTurnout(al, { ...t, spacing: 4.5 }, { units: 'm' }), X = TU.crossover({ n: 9, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143, spacing: 4.5 });
  ok(x.ok && x.crossover, 'a crossover places');
  near(x.crossover.far.x, 100 - 4.5, 1e-9, 'its far toe is on the other track, 4.5 m west'); near(x.crossover.far.y, 250 + X.length, 1e-9, 'the crossover\'s length up the line');
  near(x.endSta, 1200 + X.length, 1e-9, 'it ends at its far toe');
  const fl = x.centre[x.centre.length - 1], fp = x.centre[x.centre.length - 2];
  near(fl.x, 100 - 4.5, 1e-9, 'the centreline ends on the other track');
  near(Math.abs(AL.normAng(Math.atan2(fl.y - fp.y, fl.x - fp.x) - Math.PI / 2)), T.beta, 0.02, 'arriving along the far switch (within the switch angle of the track)');
  const mid = x.centre[T.centre.length - 1], mid2 = x.centre[T.centre.length];
  near(Math.hypot(mid2.x - mid.x, mid2.y - mid.y), X.straight, 1e-9, 'the straight between the frogs = (c − 2g) / sin θ');
  ok(RT.placeTurnout(al, { ...t, spacing: 2 }, { units: 'm' }).problems.some((q) => q.code === 'tur.spacing'), 'tracks closer than two gauges: tur.spacing');
  ok(RT.placeTurnout(al, { ...t, switchAngle: 0.19, n: 30 }, { units: 'm' }).ok === false, 'a switch angle over the frog angle does not place');
  ok(RT.placeTurnout(null, t).ok === false, 'no alignment: not ok');
  ok(RT.placeAll(al, [t, { ...t, id: 'tu2', alignment: 'other' }, null], 'a1', { units: 'm' }).length === 1, 'placeAll takes this alignment\'s turnouts only');

  // ---- checks
  const run = (list, o = {}) => RT.turnoutChecks(o.al || al, o.prof || null, o.plan || null, list, { id: 'a1', name: 'Main', speed: o.speed || null });
  ok(run([p]).length === 0, 'on a straight with room: nothing');
  ok(codes(run([RT.placeTurnout(al, { ...t, station: 1790 }, { units: 'm' })])).join() === 'rail.turnout.range', 'running past the end: rail.turnout.range');
  ok(codes(run([RT.placeTurnout(al, { ...t, station: 900 }, { units: 'm' })])).join() === 'rail.turnout.range', 'a station before the start: rail.turnout.range');
  ok(codes(run([p, RT.placeTurnout(al, { ...t, id: 'tu2', name: 'T2', station: 1210 }, { units: 'm' })])).join() === 'rail.turnout.overlap', 'two inside each other\'s length: rail.turnout.overlap');
  ok(codes(run([{ ok: false, id: 'bad', name: 'Bad' }])).join() === 'rail.turnout.geometry', 'one that does not close: rail.turnout.geometry');
  const sp = run([p], { speed: 160 });
  ok(codes(sp).join() === 'rail.turnout.speed' && sp[0].severity === 'note' && sp[0].text.includes(String(Math.round(p.speed))), 'line speed above the diverging speed: a note with the speed');
  ok(run([p], { speed: 30 }).length === 0, 'line speed under it: no note');
  const cal = curved(), cc = cal.curves[0], rail2 = RL.cleanRail({ on: true }, 'm');
  ok(codes(run([RT.placeTurnout(cal, { ...t, station: (cc.sc + cc.cs) / 2 }, { units: 'm' })], { al: cal })).includes('rail.turnout.curve'), 'on the curve: rail.turnout.curve');
  ok(codes(run([RT.placeTurnout(cal, { ...t, station: cc.ts - 10 }, { units: 'm' })], { al: cal })).includes('rail.turnout.curve'), 'running into the transition: rail.turnout.curve');
  // cant ramping on the straight (no transition) reaches a turnout that is itself on the straight
  const noTr = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 500, cant: 100 }, { x: 1000, y: 400 }], start: 0 }), pl = RL.cantPlan(noTr, rail2, { speed: 100, units: 'm' });
  const rampFrom = pl.curves[0].rampIn.from, tOn = RT.placeTurnout(noTr, { ...t, station: rampFrom + 2 }, { units: 'm' });
  ok(tOn.endSta < noTr.curves[0].ts && codes(run([tOn], { al: noTr, plan: pl })).join() === 'rail.turnout.cant', 'on the straight but inside a cant ramp: rail.turnout.cant');
  const pv = PR.buildProfile([{ sta: 1000, z: 10, L: 0 }, { sta: 1210, z: 11, L: 40 }, { sta: 1800, z: 11, L: 0 }]);
  ok(codes(run([p], { prof: pv })).join() === 'rail.turnout.vertical', 'on a vertical curve: rail.turnout.vertical');

  // ---- plan items and 3D lines
  const items = RT.turnoutSceneItems([p, { ...pr, show: false }, { ok: false }], { unitPerMm: 0.5 });
  ok(items.every((i) => i.layer === 'C-RAIL-TURN'), 'everything on C-RAIL-TURN');
  ok(items.filter((i) => i.kind === 'poly').length === 5 && items.filter((i) => i.kind === 'text').length === 1 && items.find((i) => i.kind === 'text').text === '1:9', 'two rails, the centreline, two ticks and the label 1:9; hidden and failed ones left out');
  ok(items.find((i) => i.dashed).pts.length === p.centre.length, 'the dashed line is the centreline');
  const l3 = RT.turnoutLines3d([p], (s) => 100 + (s - 1200) * 0.01);
  ok(l3.length === 2 && l3[0].pts.length === p.rails[0].length, 'two 3D rail lines');
  near(l3[0].pts[0].z, 100, 1e-9, '3D: at the toe the main track\'s top of rail'); near(l3[0].pts[fi].z, 100 + T.lead * 0.01, 0.01, '3D: at the frog, the main track\'s level there');
  ok(RT.turnoutLines3d([p], () => null).length === 0, 'no level known: no 3D lines');
  ok((await mod('scene.js')).LAYERS.some((l) => l.name === 'C-RAIL-TURN' && l.label === 'Railway turnouts'), 'the layer is registered with a name');
}

section('the clearance envelope');
{
  const box = CL.OUTLINES.box;
  const flat = CL.envelopeOn({ outline: box });
  near(flat.left, 1.7, 1e-12, 'no cant, straight: 1.7 m each side'); near(flat.right, 1.7, 1e-12, 'right too'); near(flat.top, 4.3, 1e-12, 'top 4.3 m');
  // cant 150 mm, right rail high, rail centres 1500: tilt asin(0.1) about the LEFT rail (−0.75, 0)
  const a = Math.asin(0.1), e = CL.envelopeOn({ outline: box, hL: 0, hR: 150, base: 1500 });
  near(e.tilt, a, 1e-12, 'tilt = asin(150 / 1500)');
  // top-left corner (−1.7, 4.3): dx = −0.95 → o = −0.75 − 0.95·cos a − 4.3·sin a
  near(e.left, 0.75 + 0.95 * Math.cos(a) + 4.3 * Math.sin(a), 1e-12, 'the top leans to the low side: left reach by hand');
  // bottom-right corner (1.7, 0.2): dx = 2.45 → o = −0.75 + 2.45·cos a − 0.2·sin a
  near(e.right, -0.75 + 2.45 * Math.cos(a) - 0.2 * Math.sin(a), 1e-12, 'right reach by hand');
  // highest point: top-right (1.7, 4.3): z = 2.45·sin a + 4.3·cos a
  near(e.top, 2.45 * Math.sin(a) + 4.3 * Math.cos(a), 1e-12, 'the high side rises: top by hand');
  ok(e.poly.some((p) => Math.abs(p.o + 0.75) < 1e-9 && Math.abs(p.z) < 1e-9) === false, 'the box has no point on the rail');
  const piv = CL.envelopeOn({ outline: [{ o: -0.75, z: 0 }, { o: 0.75, z: 0 }, { o: 0, z: 1 }], hL: 0, hR: 150, base: 1500 }).poly;
  near(piv[0].o, -0.75, 1e-12, 'the low (left) rail does not move'); near(piv[0].z, 0, 1e-12, 'nor lift'); near(piv[1].z, 0.15, 1e-12, 'the high rail lifts by the cant: 150 mm');
  const mir = CL.envelopeOn({ outline: box, hL: 150, hR: 0, base: 1500 });
  near(mir.right, e.left, 1e-12, 'the left rail high: the mirror image'); near(mir.left, e.right, 1e-12, 'mirror, other side');
  // curve throw: R 300 turning LEFT, vehicle 20 m on 14 m bogies: inside 14²/2400 = 0.08167, outside (400 − 196)/2400 = 0.085
  const c = CL.envelopeOn({ outline: box, kappa: 1 / 300, length: 20, bogie: 14 });
  near(c.inside, 196 / 2400, 1e-12, 'inside throw b²/8R'); near(c.outside, 204 / 2400, 1e-12, 'outside throw (L² − b²)/8R');
  near(c.left, 1.7 + 196 / 2400, 1e-12, 'turning left: the inside is the left'); near(c.right, 1.7 + 204 / 2400, 1e-12, 'and the outside the right');
  const cr = CL.envelopeOn({ outline: box, kappa: -1 / 300, length: 20, bogie: 14 });
  near(cr.right, 1.7 + 196 / 2400, 1e-12, 'turning right: swapped'); near(cr.left, 1.7 + 204 / 2400, 1e-12, 'swapped, other side');
  near(CL.envelopeOn({ outline: box, kappa: 1 / 300 }).left, 1.7, 1e-12, 'no vehicle length: no throw');
  near(CL.envelopeOn({ outline: box, kappa: 1 / 300, length: 10, bogie: 14 }).outside, 0, 1e-12, 'bogie centres longer than the vehicle are held to its length');

  // settings from a file
  const d = CL.cleanClearance({ on: true });
  ok(d.on && d.outline === 'box' && d.length === 20 && d.bogie === 14 && d.platform.side === '', 'defaults');
  ok(CL.cleanClearance(null) === null && CL.cleanClearance('x') === null, 'nothing in: null');
  const j = CL.cleanClearance({ on: 'yes', outline: '<b>', points: [{ o: 1e9, z: 0 }, { o: 'a' }, null], length: -5, bogie: 1e9, platform: { side: 'up', offset: 99, height: -1 } });
  ok(j.on === false && j.outline === 'box' && j.points.length === 0 && j.length === 20 && j.bogie === 14 && j.platform.side === '' && j.platform.offset === 1.75 && j.platform.height === 0.76, 'junk is cleaned to the defaults');
  ok(CL.cleanClearance({ outline: 'custom', points: [{ o: 0, z: 0 }, { o: 1, z: 0 }] }).outline === 'box', 'a custom outline needs three points');
  const tri = [{ o: -1, z: 0 }, { o: 1, z: 0 }, { o: 0, z: 3 }];
  ok(CL.outlineOf(CL.cleanClearance({ outline: 'custom', points: tri })).length === 3 && CL.outlineOf({ outline: 'shaped' }) === CL.OUTLINES.shaped && CL.outlineOf(null) === box, 'outlineOf: custom, a placeholder, the default');
  ok(Object.values(CL.OUTLINES).every((o) => o.length >= 4 && Math.abs(o.reduce((s, p) => s + p.o, 0)) < 1e-9), 'the placeholder outlines are symmetric');

  // ---- the sweep along a line with a curve and cant
  const al = curved({ cant: 100 }), rail = RL.cleanRail({ on: true }, 'm'), plan = RL.cantPlan(al, rail, { speed: 100, units: 'm' });
  const rows = CL.sweep(al, d, { units: 'm', base: RL.baseOf(rail), cantAt: (s) => RL.cantAt(plan, s), curvatureAt: (s) => RC.curvatureAt(al, s) });
  ok(rows.length > 50 && rows[0].sta === al.start && rows[rows.length - 1].sta === al.end, `swept at ${rows.length} stations, end to end`);
  ok(al.keyStations().every((q) => rows.some((r) => Math.abs(r.sta - q.sta) < 1e-6)), 'every key station (TS, SC, CS, ST) is a row');
  ok(rows.every((r, i) => !i || r.sta > rows[i - 1].sta), 'in station order');
  near(rows[0].left, 1.7, 1e-9, 'on the straight: the plain outline');
  const mid = rows.find((r) => Math.abs(r.sta - al.curves[0].sc) < 1e-6), by = CL.envelopeOn({ outline: box, hL: 0, hR: 100, base: 1507, kappa: 1 / 500, length: 20, bogie: 14 });
  near(mid.left, by.left, 1e-9, 'at the SC: full cant (right rail high on a left curve) and full throw, as envelopeOn'); near(mid.right, by.right, 1e-9, 'right side too');
  ok(mid.left > rows[0].left && mid.top > rows[0].top, 'wider toward the inside and higher than on the straight');
  const half = CL.sweep(al, d, { units: 'm', base: 1507, cantAt: (s) => RL.cantAt(plan, s), curvatureAt: (s) => RC.curvatureAt(al, s), step: 1 }).find((r) => Math.abs(r.sta - (al.curves[0].ts + 40)) < 0.5);
  ok(half.left > rows[0].left && half.left < mid.left, 'half way along the transition: between the two');
  const ed = CL.envelopeEdges(rows);
  near(ed.left[0].y, 1.7, 1e-9, 'plan edge: heading east, the left edge is to the north'); near(ed.right[0].y, -1.7, 1e-9, 'the right edge to the south');
  ok(ed.left.length === rows.length, 'one edge point per station');
  // feet: the same in feet
  const k = 1200 / 3937, alf = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 2000, y: 0 }], start: 0 });
  near(CL.sweep(alf, d, { units: 'ft' })[0].left, 1.7 / k, 1e-9, 'feet project: the outline in feet');
  // two tracks 4 m apart
  const two = CL.sweep(al, d, { units: 'm', base: 1507, cantAt: (s) => RL.cantAt(plan, s), curvatureAt: (s) => RC.curvatureAt(al, s), tracks: [-2, 2] });
  near(two[0].left, 3.7, 1e-9, 'two tracks: reach from the alignment = half the centres + the outline'); ok(two[0].polys.length === 2, 'a polygon per track');

  // ---- what it meets
  const zAt = () => 100, chk = (o) => CL.check(al, rows, { zAt, units: 'm', id: 'a1', name: 'Main', ...o });
  const ob = (pts, kind = 'feature') => [{ id: 'f1', name: 'Wall', kind, pts }];
  ok(chk({ obstacles: ob([{ x: 100, y: 3, z: 101 }, { x: 200, y: 3, z: 101 }]) }).warnings.length === 0, 'a wall 3 m off the centre: clear');
  const hit = chk({ obstacles: ob([{ x: 100, y: 1.5, z: 101 }, { x: 200, y: 1.5, z: 101 }]) });
  ok(codes(hit.warnings).join() === 'rail.clear.hit' && hit.hits[0].kind === 'feature', 'a wall 1.5 m off, 1 m above the rail: rail.clear.hit');
  near(Math.abs(hit.hits[0].off), 1.5, 1e-6, 'at its offset'); ok(hit.warnings[0].text.includes('Wall'), 'the sentence names it');
  ok(chk({ obstacles: ob([{ x: 100, y: 1.5, z: 100.1 }]) }).warnings.length === 0, 'the same offset but 0.1 m above the rail: under the outline (it starts at 0.2), clear');
  ok(chk({ obstacles: ob([{ x: 100, y: 1.5, z: 104.5 }]) }).warnings.length === 0, 'and 4.5 m above: over it, clear');
  ok(codes(chk({ obstacles: ob([{ x: 100, y: 1.5, z: null }]) }).warnings).join() === 'rail.clear.hit' && chk({ obstacles: ob([{ x: 100, y: 1.5, z: null }]) }).hits[0].plan === true, 'no height known: judged in plan, and said so');
  ok(chk({ obstacles: ob([{ x: 100, y: 1.5, z: 101 }]), zAt: () => null }).hits[0].plan === true, 'no top of rail known (no profile): in plan too');
  ok(codes(chk({ obstacles: ob([{ x: 50, y: -20, z: 101 }, { x: 150, y: 20, z: 101 }]) }).warnings).join() === 'rail.clear.hit', 'a line crossing the track is caught between its points');
  ok(chk({ obstacles: ob([{ x: -50, y: 0, z: 101 }]) }).warnings.length === 0, 'something before the start of the line is not on it');
  // inside of the curve: 1.75 m off is clear on the straight (reach 1.7) but not at the SC where the envelope leans and throws in
  const scP = al.pointAt(al.curves[0].sc + 1), nx = -Math.sin(scP.dir), ny = Math.cos(scP.dir);
  ok(chk({ obstacles: ob([{ x: 100, y: 1.75, z: 103 }]) }).warnings.length === 0, '1.75 m off at 3 m high on the straight: clear');
  ok(codes(chk({ obstacles: ob([{ x: scP.x + nx * 1.75, y: scP.y + ny * 1.75, z: 103 }]) }).warnings).join() === 'rail.clear.hit', 'the same on the inside of the canted curve: hit');
  // another track: centre line 3.3 m away, its own reach 1.7 → needs 3.4
  const tk = (off) => CL.otherTrackObstacles([{ id: 'a2', name: 'Up main', reach: 1.7, pts: [{ x: 0, y: off }, { x: 300, y: off }] }]);   // beside the straight part only
  ok(tk(3.3)[0].kind === 'track' && tk(3.3)[0].pts[0].z === null, 'another track is an obstacle with a reach and no height');
  ok(codes(chk({ obstacles: tk(3.3) }).warnings).join() === 'rail.clear.track', 'another track 3.3 m away with 1.7 m envelopes: rail.clear.track');
  ok(chk({ obstacles: tk(3.5) }).warnings.length === 0, 'at 3.5 m: clear');
  // this line's own two tracks
  const sp = (centres) => { const rw = CL.sweep(al, d, { units: 'm', base: 1507, cantAt: (s) => RL.cantAt(plan, s), curvatureAt: (s) => RC.curvatureAt(al, s), tracks: [-centres / 2, centres / 2] }); return CL.check(al, rw, { centres, units: 'm', name: 'Main' }); };
  ok(codes(sp(3.3).warnings).join() === 'rail.clear.spacing', 'own tracks at 3.3 m centres: rail.clear.spacing');
  const need = sp(4.5).spacing.need;
  ok(sp(4.5).warnings.length === 0 && need > 3.4 && need < 4.2, `at 4.5 m: clear; the widest envelope is ${need.toFixed(3)} m (over 3.4 because of the cant and the curve)`);
  // two equal boxes tilted by a = asin(100/1507) nest: they touch at w / cos a between centres, plus the inside and outside throws (196 + 204) / 4000
  near(need, 3.4 / Math.cos(Math.asin(100 / 1507)) + 0.1, 1e-6, 'that need = w / cos(tilt) + inside throw + outside throw, by hand');
  ok(need < by.left + by.right, 'less than the sum of the two reaches: tilted outlines nest');
  ok(codes(sp(need - 0.02).warnings).join() === 'rail.clear.spacing' && sp(need + 0.02).warnings.length === 0, 'just under the need clashes, just over clears');
  // a platform on the right (the outside of this left curve), 0.76 m above the rail
  const pf = (offset, side = 'R') => chk({ platform: { side, offset, height: 0.76 } });
  // on the straight the reach at 0.76 m is 1.7; at the SC the outside throws out by 204/4000 = 0.051 and the tilt moves the low right side
  ok(pf(1.9).warnings.length === 0 && pf(1.9).platform.gap > 0, 'a platform edge 1.9 m from the centre: clear');
  ok(codes(pf(1.65).warnings).join() === 'rail.clear.platform' && pf(1.65).platform.gap < 0, 'at 1.65 m: rail.clear.platform');

  ok(pf(1.75, 'L').platform.gap < 1.75 - 1.7 + 1e-9 && pf(1.75, 'R').platform.gap < 1.75 - 1.7 + 1e-9, 'either side, the curve leaves less room than the straight');
  ok(chk({ platform: { side: '', offset: 1, height: 0.76 } }).platform === null, 'no platform side: not checked');
  ok(CL.check(null, rows).warnings.length === 0 && CL.check(al, []).warnings.length === 0, 'no line or no rows: nothing');
}

section('in the project');
{
  const p = new PJ.Project();
  p.change('units', (s) => { s.units = 'm'; });
  p.change('line', (s) => {
    s.alignments.push({ id: 'a1', name: 'Down main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 600, y: 0, r: 500, ls: 80, cant: 100 }, { x: 1000, y: 400, r: 0 }], pvis: [{ sta: 0, z: 100, L: 0 }, { sta: 300, z: 106, L: 40 }, { sta: 1100, z: 106, L: 0 }], design: { speed: 120, unit: 'km/h' }, sampling: null,
      rail: RL.cleanRail({ on: true, clearance: { on: true, platform: { side: 'R', offset: 1.6, height: 0.76 } } }, 'm') });
    s.geo = { turnouts: [{ id: 'tu1', name: 'T1', n: 9, gauge: 1.435, side: 'L', switchLength: 6.1, switchAngle: 0.0143, alignment: 'a1', station: 100, spacing: 0, show: 'yes' }] };
    s.features = [{ id: 'f1', name: 'Retaining wall', pts: [{ x: 150, y: 1.5, z: 104 }, { x: 250, y: 1.5, z: 106 }], closed: false, use: 'off' }];
  });
  const a = p.state.alignments[0];
  ok(a.rail.clearance?.on === true && a.rail.limits.grade === 12.5, 'the settings are kept on the alignment');
  const chk = p.railChecks(a);
  // 0 → 300 rises 6 m = 20 mm/m; vertical curve 40 m: Rv = 40 / 0.02 = 2000 m < 0.35 × 120² = 5040
  ok(codes(chk.warnings).includes('rail.vert.grade') && codes(chk.warnings).includes('rail.vert.radius'), 'railChecks: the 20 mm/m grade and the 2000 m vertical curve');
  const tu = p.railTurnouts(a);
  ok(tu.length === 1 && tu[0].ok && Math.abs(tu[0].toe.x - 100) < 1e-9, 'railTurnouts: the turnout placed at station 100');
  ok(p.allTurnouts().length === 1 && p.allTurnouts()[0].alignment.id === 'a1', 'allTurnouts lists it under its alignment');
  ok(codes(p.railTurnoutWarnings(a)).includes('rail.turnout.speed'), 'railTurnoutWarnings: the line speed is above its diverging speed');
  const cl = p.railClearance(a);
  ok(cl && cl.rows.length > 50, 'railClearance sweeps');
  ok(codes(cl.warnings).includes('rail.clear.hit') && cl.hits[0].id === 'f1' && cl.hits[0].plan === false, 'the wall 1.5 m off, 1 m over the rail, is hit (judged with its height against the profile)');
  ok(codes(cl.warnings).includes('rail.clear.platform'), 'the platform 1.6 m off is hit');
  const all = p.railWarnings()[0].warnings, cs = codes(all);
  ok(['rail.vert.grade', 'rail.turnout.speed', 'rail.clear.hit', 'rail.clear.platform'].every((c) => cs.includes(c)) && cs.some((c) => c.startsWith('rail.cant.')), 'railWarnings carries the cant, the checks, the turnouts and the clearance together');
  ok(all.every((w) => w.text && !/\{[a-z]+\}/.test(w.text) && !w.text.startsWith('rail.')), 'every warning has a filled English sentence');
  ok(new Set(all.map((w) => w.code + '|' + w.part)).size === all.length, 'code + part is unique per warning (Problems keys)');
  const probs = PB.civilProblems({ rail: p.railWarnings() }, { t: I18N.t, unit: 'm' });
  ok(probs.length === all.length && probs.some((q) => /clear/.test(JSON.stringify(q))), `Problems takes all ${all.length}`);
  // off switches
  p.change('off', (s) => { s.alignments[0].rail.clearance.on = false; });
  ok(p.railClearance(p.state.alignments[0]) === null && !codes(p.railWarnings()[0].warnings).some((c) => c.startsWith('rail.clear.')), 'the envelope off: no clearance warnings');
  p.undo();
  ok(p.railClearance(p.state.alignments[0]) !== null, 'undo brings it back');
  // a second railway alongside, 3 m away
  p.change('second', (s) => { s.alignments.push({ id: 'a2', name: 'Up main', start: 0, pis: [{ x: 0, y: 3, r: 0 }, { x: 300, y: 3, r: 0 }], pvis: [], sampling: null, rail: RL.cleanRail({ on: true }, 'm') }); });
  ok(codes(p.railClearance(p.state.alignments[0]).warnings).includes('rail.clear.track'), 'another railway alignment 3 m away: rail.clear.track');
  ok(p.railClearance(p.state.alignments[1]) === null, 'that one has no envelope of its own turned on');
  p.undo();
  // the file
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project, b = back.state.alignments[0];
  ok(JSON.stringify(b.rail) === JSON.stringify(p.state.alignments[0].rail), 'the file round trip keeps the limits and the clearance settings');
  ok(JSON.stringify(codes(back.railWarnings()[0].warnings)) === JSON.stringify(cs), 'and gives the same warnings');
  const old = PJ.Project.fromJSON({ format: 'civilcraft-project', version: 1, units: 'm', alignments: [{ id: 'a1', name: 'x', pis: [{ x: 0, y: 0 }, { x: 100, y: 0 }], pvis: [], rail: { on: true, limits: { cant: 150 } } }] }).project.state.alignments[0];
  ok(old.rail.limits.cant === 150 && old.rail.limits.grade === 12.5 && old.rail.clearance === undefined, 'an older file (no new limits, no clearance) gets the defaults and no envelope');
  const junk = PJ.Project.fromJSON({ format: 'civilcraft-project', version: 1, units: 'm', alignments: [{ id: 'a1', name: 'x', pis: [{ x: 0, y: 0 }, { x: 100, y: 0 }], pvis: [], rail: { on: true, limits: { grade: 'steep', vRadius: -1, elementTime: 1e9 }, clearance: { on: true, outline: 'custom', points: 'no', platform: 7 } } }] }).project.state.alignments[0];
  ok(junk.rail.limits.grade === 12.5 && junk.rail.limits.vRadius === 0.35 && junk.rail.limits.elementTime === 1.8 && junk.rail.clearance.outline === 'box' && junk.rail.clearance.platform.side === '', 'junk in the file is cleaned');
  // a road alignment may carry a turnout record but gets no railway warnings
  const q = new PJ.Project();
  q.change('road', (s) => { s.units = 'm'; s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 300, y: 0, r: 0 }], pvis: [], sampling: null }); });
  ok(q.railWarnings().length === 0 && q.railChecks(q.state.alignments[0]) === null && q.railClearance(q.state.alignments[0]) === null && q.railTurnouts(q.state.alignments[0]).length === 0, 'not a railway: nothing');
}

if (typeof LX.cantXml === 'function') {
  section('LandXML: the cant');
  const al = curved({ cant: 100 }), rail = RL.cleanRail({ on: true, pivot: 'low' }, 'm'), plan = RL.cantPlan(al, rail, { speed: 120, units: 'm', name: 'Main' });
  const xml = LX.cantXml({ name: 'Main', plan, rail, units: 'm', speed: 120, alignment: al });
  ok(/^\s*<Cant name="Main" gauge="1\.435" rotationPoint="insideRail">/.test(xml), 'a <Cant> with the gauge in metres and the rotation point: ' + xml.split('\n')[0].trim());
  const st = [...xml.matchAll(/<CantStation ([^>]*)\/>/g)].map((m) => Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((x) => [x[1], x[2]])));
  ok(st.length >= 4, `${st.length} cant stations`);
  ok(st.every((s, i) => !i || Number(s.station) >= Number(st[i - 1].station)), 'in station order');
  ok(st.every((s) => s.appliedCant !== undefined && (s.curvature === 'ccw' || s.curvature === 'cw')), 'each has the required appliedCant and curvature');
  const c = al.curves[0], at = (sta) => st.find((s) => Math.abs(Number(s.station) - sta) < 1e-3);
  ok(Number(at(c.ts).appliedCant) === 0 && Number(at(c.sc).appliedCant) === 100 && Number(at(c.cs).appliedCant) === 100 && Number(at(c.st).appliedCant) === 0, '0 at the TS, 100 at the SC and CS, 0 at the ST');
  ok(at(c.sc).curvature === 'ccw' && at(c.sc).transitionType === 'clothoid', 'the left curve is ccw, the transition named');
  near(Number(at(c.sc).equilibriumCant), RL.equilibriumCant(120, 500, 1507), 0.01, 'equilibrium cant written'); near(Number(at(c.sc).cantDeficiency), RL.equilibriumCant(120, 500, 1507) - 100, 0.01, 'and the deficiency');
  ok(/<SpeedStation station="0(\.0+)?" speed="120(\.0+)?"\/>/.test(xml), 'the line speed as a SpeedStation at the start');
  ok(LX.cantXml({ name: 'x', plan: RL.cantPlan(curved(), rail, { units: 'm' }), rail, units: 'm', alignment: curved() }) === '', 'no cant anywhere: no element');
  ok(LX.cantXml({ name: 'A&B "x"', plan, rail, units: 'm', alignment: al }).includes('name="A&amp;B &quot;x&quot;"'), 'the name is escaped');
  // in the whole file, in the schema's place: after CoordGeom, before Profile; and back in
  const p = new PJ.Project();
  p.change('line', (s) => { s.units = 'm'; s.alignments.push({ id: 'a1', name: 'Down main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 600, y: 0, r: 500, ls: 80, cant: 100, tr: 'bloss' }, { x: 1000, y: 400, r: 0 }], pvis: [{ sta: 0, z: 100, L: 0 }, { sta: 1100, z: 101, L: 0 }], design: { speed: 120, unit: 'km/h' }, sampling: null, rail: RL.cleanRail({ on: true, pivot: 'centre' }, 'm') }); });
  const a = p.state.alignments[0], file = LX.writeLandXml({ name: 'T', units: 'm', alignments: [{ name: a.name, alignment: p.alignment(a), profile: { profile: p.designProfile(a) }, cant: { plan: p.railPlan(a), rail: a.rail, speed: 120 } }] });
  const iC = file.indexOf('</CoordGeom>'), iK = file.indexOf('<Cant '), iP = file.indexOf('<Profile ');
  ok(iC > 0 && iK > iC && iP > iK, 'the Cant sits after CoordGeom and before Profile (the schema\'s order)');
  ok(file.includes('rotationPoint="center"') && file.includes('transitionType="bloss"'), 'centre pivot → center; the Bloss ramp named');
  const rd = LX.readLandXml(file), ra = rd.alignments?.[0];
  ok(ra && ra.cant && ra.cant.gauge === 1435 && ra.cant.pivot === 'centre', 'read back: the gauge (mm) and the pivot');
  ok(ra.pis.find((q) => q.r > 0).cant === 100, 'read back: the curve\'s applied cant on its PI');
  ok(ra.cant.speed === 120, 'read back: the speed');
} else { section('LandXML: the cant'); ok(false, 'landxml.js has no cantXml yet'); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
