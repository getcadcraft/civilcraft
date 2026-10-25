#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-joints.mjs — the assembly joints of 0.4 P19 (assembly.js): cylindrical, planar, ball and pin-slot, each with limits
 * on each of its values. Oracles that do not use jointMotion: the rigid joint (a cylindrical at angle a, offset o sits where
 * a rigid one at a, o does), the mate frames themselves (planar / pin-slot move the part's origin by exactly dx·x + dy·y or
 * s along the slot, in the first part's mate frame), and geometry (a ball keeps the joint's centre and tilts the mate normal
 * by exactly the tilt). Then limits per value, the motion check's chosen value, the file (version 2 kept when nothing new
 * is used; 3 otherwise; tampering refused). Two flanges from fixtures.mjs on the mesh kernel.
 *   node tools/partcraft-test/test-joints.mjs [--verbose]    (or runJointTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runJointTests({ ok, section, M }) {
  const A = await import(DEV + 'assembly.js');
  const K = await import(DEV + 'kernel.js');
  const V = await import(DEV + 'vec.js');
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const nearM = (a, b, t = 1e-9) => a.every((v, i) => Math.abs(v - b[i]) <= t);
  const throws = (fn, re) => { try { fn(); return ''; } catch (e) { return re.test(e.message) ? e.message : ''; } };

  const fl = F.flange();
  const setup = (type, values = {}) => {
    const asm = A.newAssembly('Joints');
    const i1 = A.insertPart(asm, fl.part);
    const i2 = A.insertPart(asm, fl.part, { pid: i1.part, place: V.translation([300, 0, 0]) });
    const builds = new Map([[i1.part, K.regenerate(asm.parts[i1.part].part, M)]]);
    const bottom = { kind: 'face', feature: fl.ids.revolve, face: 'side', entity: fl.lines[0] };
    const j = A.addJoint(asm, type, { inst: i1.id, plane: bottom }, { inst: i2.id, plane: bottom }, values);
    const place = () => { const r = A.placeAll(asm, builds); if (r.problems.length) throw new Error(r.problems[0].message); return r.world.get(i2.id); };
    const FA = A.mateFrame(j.a, builds.get(i1.part), asm.parts[i1.part].part);
    const ax = (c) => V.norm([FA[4 * c], FA[4 * c + 1], FA[4 * c + 2]]);   // A's mate frame axes in world (the first part is grounded at identity)
    return { asm, j, place, FA, x: ax(0), y: ax(1), z: ax(2), o: [FA[12], FA[13], FA[14]] };
  };

  section('joints: cylindrical, planar, ball, pin-slot (assembly.js)');
  {
    ok(Object.keys(A.JOINT_TYPES).join() === 'rigid,revolute,slider,cylindrical,planar,ball,pinslot' && A.JOINT_DOF.planar.join() === 'dx,dy,angle' && A.JOINT_DOF.ball.join() === 'angle,tiltX,tiltY' && A.JOINT_DOF.pinslot.join() === 'slide,angle', 'seven joint types; their moving values');
    // cylindrical = rigid at the same angle and offset
    const c = setup('cylindrical', { angle: 30, offset: 5 });
    const r = setup('rigid', { angle: 30, offset: 5 });
    ok(nearM(c.place(), r.place(), 1e-12), 'cylindrical at 30°, 5 mm sits exactly where a rigid joint at 30°, 5 mm holds it');
    // planar: the origin moves by dx·x + dy·y of A's mate frame, nothing along z
    const p = setup('planar', { angle: 40 });
    const W0 = p.place(), o0 = V.applyMat(W0, [0, 0, 0]);
    p.j.dx = 12; p.j.dy = -7;
    const W1 = p.place(), o1 = V.applyMat(W1, [0, 0, 0]);
    const d = V.sub(o1, o0);
    ok(near(V.dot(d, p.x), 12, 1e-9) && near(V.dot(d, p.y), -7, 1e-9) && near(V.dot(d, p.z), 0, 1e-9) && nearM(W1.slice(0, 11), W0.slice(0, 11), 1e-12), 'planar dx 12, dy −7: the part slides 12 along the face\'s X and −7 along its Y, not off the face, without turning');
    // ball: the joint centre stays put, the normal tilts by exactly the tilt
    const b = setup('ball');
    const nB = (W) => V.norm(V.applyDir(W, b.z));
    const Wb0 = b.place();
    b.j.tiltX = 30;
    const Wb1 = b.place();
    const tilt = Math.acos(Math.max(-1, Math.min(1, V.dot(nB(Wb0), nB(Wb1))))) * 180 / Math.PI;
    // the point of B that sat on the joint centre is still there
    const bCentre = V.applyMat(A.rigidInverse(Wb0), b.o);
    ok(near(V.len(V.sub(V.applyMat(Wb1, bCentre), b.o)), 0, 1e-9) && near(tilt, 30, 1e-9), `ball tilt about X 30°: the joint centre stays where it is, and the part tilts by ${tilt.toFixed(9)}°`);
    b.j.tiltX = 0; b.j.tiltY = -20; b.j.angle = 45;
    const Wb2 = b.place();
    ok(near(V.len(V.sub(V.applyMat(Wb2, bCentre), b.o)), 0, 1e-9) && near(Math.acos(V.dot(nB(Wb0), nB(Wb2))) * 180 / Math.PI, 20, 1e-9), 'ball spun 45° and tilted −20° about Y: centre kept, 20° off');
    // pin in slot: s along (cos d, sin d) of A's frame, then turned like a revolute
    const s = setup('pinslot', { slotDir: 30 });
    const S0 = s.place(), so0 = V.applyMat(S0, [0, 0, 0]);
    s.j.slide = 10;
    const S1 = s.place(), ds = V.sub(V.applyMat(S1, [0, 0, 0]), so0);
    ok(near(V.dot(ds, s.x), 10 * Math.cos(Math.PI / 6), 1e-9) && near(V.dot(ds, s.y), 10 * Math.sin(Math.PI / 6), 1e-9) && near(V.dot(ds, s.z), 0, 1e-9), 'pin in a slot at 30°: slide 10 moves it 10·cos 30° along X and 10·sin 30° along Y');
    s.j.slide = 0; s.j.angle = 90;
    const rv = setup('revolute', { angle: 90 });
    ok(nearM(s.place(), rv.place(), 1e-12), 'turning the pin 90° (slide 0) sits where a revolute at 90° does');
  }

  section('joints: limits on each value, the motion check');
  {
    const c = setup('cylindrical', { angle: 30, offset: 20 });
    c.j.limits = A.readLimits({ offset: { min: 0, max: 10 } }, 'cylindrical');
    const lim = c.place();
    const ref = setup('rigid', { angle: 30, offset: 10 });
    ok(nearM(lim, ref.place(), 1e-12) && A.jointValue(c.j, 'offset') === 10 && A.jointValue(c.j, 'angle') === 30, 'cylindrical with offset limited to 0…10: an offset of 20 is held at 10; the unlimited angle stays 30');
    c.j.limits.angle = { min: -10, max: 10 };
    ok(A.jointValue(c.j, 'angle') === 10 && A.limitOf(c.j, 'offset').max === 10, 'a second limit, on the angle: 30 is held at 10, the offset limit kept');
    const rv = setup('revolute', { angle: 120 });
    rv.j.limits = { min: -90, max: 90 };
    ok(A.jointValue(rv.j) === 90 && A.limitOf(rv.j, 'angle').max === 90 && A.limitOf(rv.j, 'offset') === null, 'the one-value shape { min, max } still limits a revolute\'s angle (and nothing else)');
    const sw = A.motionCheck(c.asm, new Map([[c.asm.instances[0].part, K.regenerate(c.asm.parts[c.asm.instances[0].part].part, M)]]), M, c.j.id, -50, 50, 4, 'offset');
    ok(sw.length === 5 && near(sw[0].value, 0) && near(sw[4].value, 10) && c.j.offset === 20, 'the motion check sweeps the value asked for (offset), inside its limits 0…10, and leaves the joint as it was');
    ok(throws(() => A.readLimits({ tiltX: { min: 0, max: 5 } }, 'cylindrical'), /name a value it does not have/) && throws(() => A.readLimits({ dx: { min: 5, max: 1 } }, 'planar'), /minimum must be below/) && throws(() => A.readLimits({ tiltX: { min: -4000, max: 0 } }, 'ball'), /out of range/), 'limits refused: a value the joint does not have, min above max, out of range');
    ok(A.readLimitsSafe({ min: 0, max: 5 }, 'rigid') === null && A.readLimitsSafe({ offset: { min: 0, max: 5 } }, 'revolute') === null, 'changing a joint\'s type drops limits that no longer fit it');
  }

  section('joints: the assembly file');
  {
    const r = setup('revolute', { angle: 10 });
    r.j.limits = { min: 0, max: 45 };
    ok(JSON.parse(A.toJSON(r.asm)).version === 2, 'only rigid / revolute / slider joints with one-value limits: still written as version 2');
    const p = setup('planar', { dx: 3, dy: 4, angle: 5 });
    p.j.limits = { dx: { min: -10, max: 10 } };
    const txt = A.toJSON(p.asm), back = A.readAssembly(txt), bj = back.joints[0];
    ok(JSON.parse(txt).version === 3 && bj.type === 'planar' && bj.dx === 3 && bj.dy === 4 && JSON.stringify(bj.limits) === JSON.stringify({ dx: { min: -10, max: 10 } }), 'a planar joint: version 3, its values and keyed limits read back');
    const s = setup('pinslot', { slotDir: 15, slide: 2 });
    ok(A.readAssembly(A.toJSON(s.asm)).joints[0].slotDir === 15, 'the slot direction is kept');
    const bad = (mut) => { const j = JSON.parse(txt); mut(j); try { A.readAssembly(JSON.stringify(j)); return ''; } catch (e) { return e.message; } };
    ok(/bad value/.test(bad((j) => { j.joints[0].dx = 'far'; })) && /name a value/.test(bad((j) => { j.joints[0].limits = { tiltX: { min: 0, max: 1 } }; })) && /unknown kind/.test(bad((j) => { j.joints[0].type = 'hinge'; })) && /newer PartCraft/.test(bad((j) => { j.version = A.VERSION + 1; })), 'tampered: a value that is not a number, a limit on a value the joint lacks, an unknown type, a newer version');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  await runJointTests({ ok, section, M });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
