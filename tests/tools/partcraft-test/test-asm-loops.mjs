#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-asm-loops.mjs — closed-loop assemblies (0.7 D7.40; assembly.js solveLoops / placeAll / applySolved / loopJoints) and the
 * big-sketch / big-assembly stress tests with timings.
 *   - a four-bar linkage (ground 100, crank 30, coupler 110, rocker 80; flat bars stacked so the loop is consistent in depth):
 *     the loop closes (every paired hole on its partner to 1e-6 mm), mobility 1 with nothing held (each joint "under"), 0 with
 *     the crank held (all "full"), the held crank angle kept exactly; applySolved then a second solve changes nothing; a motion
 *     check turning the crank all the way round keeps the loop closed at every step and the rocker end on both its circles
 *     (closed form: |B − C| = coupler, |B − O₂| = rocker);
 *   - a triangle of three bars (a structure: mobility 0, "full"); a triangle that cannot close (30 + 30 < 100): a conflict, its
 *     joints "over", a problem that says how far off; a limit on the rocker that the crank sweep runs into: those steps do not close;
 *   - solve: false is the old walk (the closing joint only measured); bridges are not loop joints (loopJoints);
 *   - stress: a 504-relation sketch (42 rectangles, every one dimensioned and placed) solves fully defined; one dimension changed
 *     solves again; a 50-part assembly (a ground bar, a coupler bar and 48 parallel cranks: 96 joints, 47 loops, 282 equations)
 *     closes with the first crank held and every crank at its angle. Timings printed with the machine load (VPS, capped: for the
 *     log only, never for copy).
 *   node tools/partcraft-test/test-asm-loops.mjs [--verbose]    (or runAsmLoopTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runAsmLoopTests({ ok, section, M = null }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const A = await import(DEV + 'assembly.js'), K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), V = await import(DEV + 'vec.js');
  const SV = await import(DEV + 'solver.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const now = () => performance.now();
  const load = () => os.loadavg()[0].toFixed(1);

  /** A flat bar 5 thick (z 0…5), holes Ø4 at x = each of `at` along y = 0, 8 of material beyond the end holes. */
  const bar = (name, at) => {
    const part = P.newPart(name);
    const lo = Math.min(...at) - 8, hi = Math.max(...at) + 8;
    const sk = S.newSketch(); S.addRect(sk, [lo, -8], [hi, 8]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 5 });
    const hk = S.newSketch(); for (const x of at) S.addPoint(hk, x, 0);
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: hk });
    const h = P.addFeature(part, 'hole', { sketch: s2.id, kind: 'simple', d: 4, depth: 5, through: true });
    return { part, e: e1.id, h: h.id };
  };
  const top = (b, inst, k) => ({ inst, plane: { kind: 'face', feature: b.e, face: 'end' }, axis: { feature: b.h, index: k } });
  const bottom = (b, inst, k) => ({ inst, plane: { kind: 'face', feature: b.e, face: 'start' }, axis: { feature: b.h, index: k } });
  const buildAll = (asm) => new Map(Object.entries(asm.parts).map(([pid, p]) => [pid, K.regenerate(p.part, M)]));
  /** World position of a bar's hole k (on the bar's top face). */
  const holeAt = (world, inst, build, k) => { const ax = build.holeAxes.get([...build.holeAxes.keys()][0])[k]; return V.applyMat(world.get(inst), [ax.o[0], ax.o[1], 5]); };
  const dist = (a, b) => V.len(V.sub(a, b));

  // ---- the four-bar
  const G = bar('Ground', [0, 100]), C = bar('Crank', [0, 30]), CP = bar('Coupler', [0, 110]), R = bar('Rocker', [0, 80]);
  const fourBar = () => {
    const asm = A.newAssembly('Four-bar');
    const ig = A.insertPart(asm, G.part), ic = A.insertPart(asm, C.part), icp = A.insertPart(asm, CP.part), ir = A.insertPart(asm, R.part);
    const j1 = A.addJoint(asm, 'revolute', top(G, ig.id, 0), bottom(C, ic.id, 0), { angle: 60 });
    const j2 = A.addJoint(asm, 'revolute', top(C, ic.id, 1), bottom(CP, icp.id, 0), { angle: -50 });
    const j3 = A.addJoint(asm, 'revolute', top(R, ir.id, 1), bottom(CP, icp.id, 1), { angle: 0 });
    const j4 = A.addJoint(asm, 'revolute', top(G, ig.id, 1), bottom(R, ir.id, 0), { angle: 90 });
    return { asm, ig, ic, icp, ir, j1, j2, j3, j4, builds: buildAll(asm) };
  };
  const check4 = (fb, world) => {
    const b = (inst) => fb.builds.get(fb.asm.instances.find((i) => i.id === inst).part);
    const O1 = holeAt(world, fb.ig.id, b(fb.ig.id), 0), O2 = holeAt(world, fb.ig.id, b(fb.ig.id), 1);
    const c0 = holeAt(world, fb.ic.id, b(fb.ic.id), 0), cE = holeAt(world, fb.ic.id, b(fb.ic.id), 1);
    const p0 = holeAt(world, fb.icp.id, b(fb.icp.id), 0), p1 = holeAt(world, fb.icp.id, b(fb.icp.id), 1);
    const r0 = holeAt(world, fb.ir.id, b(fb.ir.id), 0), r1 = holeAt(world, fb.ir.id, b(fb.ir.id), 1);
    // paired holes in plan (z differs by the stacking): their xy must meet
    const xy = (a, q) => Math.hypot(a[0] - q[0], a[1] - q[1]);
    return { gap: Math.max(xy(O1, c0), xy(cE, p0), xy(p1, r1), xy(O2, r0)), C: cE, B: p1, O2, crankDir: Math.atan2(cE[1] - O1[1], cE[0] - O1[0]) * 180 / Math.PI };
  };

  section('closed loops: a four-bar linkage');
  {
    const fb = fourBar();
    const old = A.placeAll(fb.asm, fb.builds, { solve: false });
    ok(old.problems.some((p) => p.joint === fb.j4.id && /off/.test(p.message)) && !old.loops, 'solve: false = the old walk: the joint that closes the loop is only measured ("… off")');
    const lj = A.loopJoints(fb.asm);
    ok(lj.onLoop.size === 4 && new Set(lj.group.values()).size === 1, 'all four joints are on one loop');
    const r = A.placeAll(fb.asm, fb.builds);
    const g = check4(fb, r.world);
    ok(r.loops.closed && g.gap < 1e-6 && !r.problems.length, `free: the loop closes (paired holes ${g.gap.toExponential(1)} mm apart, ${r.loops.iterations} steps, ${r.loops.ms.toFixed(1)} ms)`);
    ok(r.loops.status === 'under' && r.loops.mobility === 1 && [...r.loops.joints.values()].every((s) => s === 'under') && r.loops.unknowns === 4 && r.loops.equations === 6 && r.loops.redundant === 3,
      'nothing held: mobility 1 (the linkage can move), every joint "under"; 4 unknowns, 6 equations, 3 met twice over (a flat linkage)');
    const h = A.placeAll(fb.asm, fb.builds, { hold: new Set([fb.j1.id + '.angle']) });
    const gh = check4(fb, h.world);
    ok(h.loops.closed && gh.gap < 1e-6 && h.loops.status === 'full' && h.loops.mobility === 0 && [...h.loops.joints.values()].every((s) => s === 'full') && h.loops.values.get(fb.j1.id).angle === 60,
      'the crank held at 60°: closed, mobility 0, every joint "full", the crank angle kept exactly');
    ok([...h.loops.values.values()].every((o) => Math.abs(o.angle) <= 360), 'solved angles stay on the turn they started on (no 796° for 76°)');
    A.applySolved(fb.asm, h.loops);
    const again = A.placeAll(fb.asm, fb.builds);
    ok(again.loops.closed && again.loops.iterations === 0 && Math.abs(again.loops.values.get(fb.j3.id).angle - fb.asm.joints[2].angle) < 1e-9, 'applySolved writes the answer into the joints; solving again changes nothing (0 steps)');
    // the crank all the way round
    const crankAt = (d) => { const res = A.placeAll(fb.asm, fb.builds, { hold: new Set([fb.j1.id + '.angle']) }); return res; };
    void crankAt;
    let worst = 0, closedAll = true, sweepMs = 0, steps = 0, dir0 = 0, turnOff = 0;
    const lens = [];
    let start = null;
    for (let d = 0; d <= 360; d += 15) {
      fb.asm.joints[0].angle = 60 + d;
      const t0 = now();
      const res = A.placeAll(fb.asm, fb.builds, { hold: new Set([fb.j1.id + '.angle']), start });
      sweepMs += now() - t0; steps++;
      start = res.loops.values;
      const q = check4(fb, res.world);
      if (d === 0) dir0 = q.crankDir;
      turnOff = Math.max(turnOff, Math.abs(((q.crankDir - dir0 - d) % 360 + 540) % 360 - 180));   // the crank really turned by d
      closedAll = closedAll && res.loops.closed;
      worst = Math.max(worst, q.gap);
      lens.push([Math.hypot(q.B[0] - q.C[0], q.B[1] - q.C[1]), Math.hypot(q.B[0] - q.O2[0], q.B[1] - q.O2[1])]);
    }
    ok(closedAll && worst < 1e-6 && turnOff < 1e-6 && lens.every(([b, c]) => Math.abs(b - 110) < 1e-6 && Math.abs(c - 80) < 1e-6), `the crank turned round in 15° steps (each step its angle in the world, to ${turnOff.toExponential(1)}°): closed at all ${steps}, the rocker end on both circles (|B − C| = 110, |B − O₂| = 80), ${(sweepMs / steps).toFixed(1)} ms a step (load ${load()})`);
    const mc = A.motionCheck(fb.asm, fb.builds, M, fb.j1.id, 0, 360, 8);
    ok(mc.length === 9 && mc.every((s) => s.closed), 'motionCheck turns the crank with the loop following (closed at every step)');
    // a limit on the rocker the crank cannot respect all the way round
    fb.asm.joints[0].angle = 60;
    const solved = A.placeAll(fb.asm, fb.builds, { hold: new Set([fb.j1.id + '.angle']) });
    A.applySolved(fb.asm, solved.loops);
    const ra = fb.asm.joints[3].angle;
    fb.asm.joints[3].limits = { min: ra - 5, max: ra + 5 };
    const lim = A.motionCheck(fb.asm, fb.builds, M, fb.j1.id, 60, 420, 12);
    ok(lim[0].closed && lim.some((s) => !s.closed), `a ±5° limit on the rocker: the crank's sweep closes where the rocker can follow and not elsewhere (${lim.filter((s) => s.closed).length} of ${lim.length} steps)`);
  }

  section('closed loops: structures and conflicts');
  {
    const tri = (la, lb, lc) => {
      const B1 = bar('T1-' + la, [0, la]), B2 = bar('T2-' + lb, [0, lb]), B3 = bar('T3-' + lc, [0, lc]);
      const asm = A.newAssembly('Triangle');
      const i1 = A.insertPart(asm, B1.part), i2 = A.insertPart(asm, B2.part), i3 = A.insertPart(asm, B3.part);
      // stacked so the depths agree: B3 on B1 (5…10), B2 on B3 (10…15), and B2 on B1 lifted by the joint's offset (5)
      A.addJoint(asm, 'revolute', top(B1, i1.id, 0), bottom(B3, i3.id, 0), { angle: 60 });
      A.addJoint(asm, 'revolute', top(B3, i3.id, 1), bottom(B2, i2.id, 1), { angle: 0 });
      const jc = A.addJoint(asm, 'revolute', top(B1, i1.id, 1), bottom(B2, i2.id, 0), { angle: 120, offset: 5 });
      return { asm, jc, builds: buildAll(asm) };
    };
    const ok3 = tri(60, 50, 40);
    const r = A.placeAll(ok3.asm, ok3.builds);
    ok(r.loops.closed && r.loops.status === 'full' && r.loops.mobility === 0 && !r.problems.length, 'a triangle of bars (60, 50, 40): it closes and is a structure (mobility 0, "full")');
    const bad = tri(30, 30, 100);
    const rb = A.placeAll(bad.asm, bad.builds);
    ok(!rb.loops.closed && rb.loops.status === 'over' && rb.loops.conflicts.includes(bad.jc.id) && [...rb.loops.joints.values()].every((s) => s === 'over') && rb.problems.some((p) => p.joint === bad.jc.id && /off/.test(p.message)),
      'a triangle that cannot close (30 + 30 < 100): a conflict, every joint of the loop "over", the problem says how far off');
    // a bridge (a part hung from the triangle) is not a loop joint
    const B4 = bar('Hang', [0, 20]);
    const i4 = A.insertPart(ok3.asm, B4.part);
    ok3.builds.set(i4.part, K.regenerate(B4.part, M));
    const jh = A.addJoint(ok3.asm, 'revolute', top(bar('x', [0, 60]), ok3.asm.instances[0].id, 0), bottom(B4, i4.id, 0), { angle: 10 });
    jh.a.plane = { kind: 'face', feature: Object.values(ok3.asm.parts)[0].part.features[1].id, face: 'end' };
    jh.a.axis = { feature: Object.values(ok3.asm.parts)[0].part.features[3].id, index: 0 };
    const lj = A.loopJoints(ok3.asm);
    ok(lj.onLoop.size === 3 && !lj.onLoop.has(jh.id), 'a part hung from the triangle: its joint is a bridge, not a loop joint');
  }

  section('stress: a 504-relation sketch');
  {
    const sk = S.newSketch();
    let rels = 0;
    for (let i = 0; i < 42; i++) {
      const x = (i % 7) * 30, y = Math.floor(i / 7) * 20;
      const r = S.addRect(sk, [x + 1, y + 1.5], [x + 21, y + 12]);   // drawn a little off, the dimensions pull them true
      rels += r.constraints.length;
      const l0 = sk.entities.find((e) => e.id === r.lines[0]);
      S.addConstraint(sk, 'distance', [r.lines[0]], 20 + (i % 5));
      S.addConstraint(sk, 'distance', [r.lines[1]], 10 + (i % 3));
      S.addConstraint(sk, 'hdistance', ['O', l0.p1], x);
      S.addConstraint(sk, 'vdistance', ['O', l0.p1], y);
      rels += 4;
    }
    ok(rels === 504 && sk.constraints.length === 504, `504 relations on 168 lines (${sk.entities.length} entities)`);
    let t0 = now();
    const r1 = SV.solveSketch(sk);
    const ms1 = now() - t0;
    ok(r1.ok && r1.status === 'full' && r1.dof === 0 && !r1.conflicts.length && !r1.redundant.length, `solved fully defined (dof 0, no conflicts) in ${ms1.toFixed(0)} ms (load ${load()})`);
    const d = sk.constraints.find((c) => c.type === 'distance');
    d.value = 26;
    t0 = now();
    const r2 = SV.solveSketch(sk);
    const ms2 = now() - t0;
    const line = sk.entities.find((e) => e.id === d.refs[0]);
    const pa = sk.entities.find((e) => e.id === line.p1), pb = sk.entities.find((e) => e.id === line.p2);
    ok(r2.ok && r2.status === 'full' && Math.abs(Math.hypot(pb.x - pa.x, pb.y - pa.y) - 26) < 1e-6, `one dimension changed to 26: solved again in ${ms2.toFixed(0)} ms, the line is 26`);
    // one more relation that repeats another: redundant, said so; one that fights: a conflict
    const extra = S.addConstraint(sk, 'horizontal', [line.id]);
    const r3 = SV.solveSketch(sk);
    ok(r3.status === 'over' && r3.redundant.includes(extra.id), 'a repeated horizontal relation: "over", that relation named as redundant');
  }

  section('stress: a 50-part assembly with 47 loops');
  {
    const N = 48;
    const holes = Array.from({ length: N }, (_, i) => i * 25);
    const GB = bar('Ground rail', holes), CB = bar('Coupler rail', holes), CR = bar('Crank', [0, 30]);
    const asm = A.newAssembly('Parallel cranks');
    const ig = A.insertPart(asm, GB.part), icb = A.insertPart(asm, CB.part);
    const cranks = [];
    for (let i = 0; i < N; i++) cranks.push(A.insertPart(asm, CR.part, i ? { pid: asm.instances[2]?.part } : {}));
    const js = [];
    for (let i = 0; i < N; i++) js.push(A.addJoint(asm, 'revolute', top(GB, ig.id, i), bottom(CR, cranks[i].id, 0), { angle: 40 + (i % 3) }));
    for (let i = 0; i < N; i++) A.addJoint(asm, 'revolute', top(CR, cranks[i].id, 1), bottom(CB, icb.id, i), { angle: 0 });
    let t0 = now();
    const builds = buildAll(asm);
    const buildMs = now() - t0;
    ok(asm.instances.length === 50 && asm.joints.length === 96 && builds.size === 3, `50 parts (${builds.size} different), 96 joints (parts built in ${buildMs.toFixed(0)} ms)`);
    t0 = now();
    const r = A.placeAll(asm, builds, { hold: new Set([js[0].id + '.angle']) });
    const ms = now() - t0;
    const crankDir = (inst) => { const w = r.world.get(inst.id); return Math.atan2(w[1], w[0]) * 180 / Math.PI; };
    const d0 = crankDir(cranks[0]);
    const spread = Math.max(...cranks.map((c) => Math.abs(((crankDir(c) - d0 + 540) % 360) - 180)));
    ok(r.loops.closed && r.loops.equations === 282 && r.loops.unknowns === 95 && !r.problems.length, `closed: 47 loops, ${r.loops.equations} equations, ${r.loops.unknowns} unknowns, ${r.loops.iterations} steps, ${ms.toFixed(0)} ms (load ${load()})`);
    ok(spread < 1e-4 && r.loops.mobility === 0 && r.loops.status === 'full', `the first crank held: every crank turns with it (the most any is off: ${spread.toExponential(1)}°), mobility 0`);
    A.applySolved(asm, r.loops);
    t0 = now();
    const again = A.placeAll(asm, builds);
    ok(again.loops.closed && again.loops.iterations === 0, `opened again as solved: nothing to do (${(now() - t0).toFixed(0)} ms, the analysis only)`);
    console.log(`    timings (VPS, capped; load ${load()}): 504-relation sketch see above; 50-part solve ${ms.toFixed(0)} ms`);
  }
  K.clearCheckpoints();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runAsmLoopTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
