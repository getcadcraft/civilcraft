#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-clash-filters.mjs — interference kinds and filters (0.5 WL.33; assembly.js interference / filterClashes, the thread
 * records' zone radii in kernel.js).
 *   - a 60 × 60 × 30 plate with a blind M10 tapped hole (20 deep, thread 12) and an M10 bolt (a Ø10 rod, 30 long, a cosmetic
 *     Thread): the bolt 10 mm in = a thread fit (the overlap = the annulus between the tap drill and the major diameter × 10,
 *     to the faceting), 16 mm in = a thread depth mismatch (it runs 4 mm past the hole's thread); a block through the plate's
 *     corner = an overlap (its volume to the closed form); a block resting on the plate = touching faces (only when asked);
 *   - filters: a kind hidden, a pair hidden, both kept in the file (version 4; none = the old version), undone by clearing,
 *     pairs of a removed instance dropped; tampered filters refused, pairs of unknown instances dropped on read; a motion
 *     check's pairs filtered the same way (by the caller).
 *   node tools/partcraft-test/test-clash-filters.mjs [--verbose]    (or runClashFilterTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runClashFilterTests({ ok, section, M = null }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), A = await import(DEV + 'assembly.js'), V = await import(DEV + 'vec.js'), S = await import(DEV + 'sketch.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re.test(e.message); } };

  // the plate (y 0…30, x 0…60, z −60…0) with a blind tapped M10 hole at x 30, z −30 from the top, 20 deep, thread 12
  const plate = P.newPart('Plate');
  const ps = P.addFeature(plate, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(60, 60).sk });
  const pe = P.addFeature(plate, 'extrude', { sketch: ps.id, depth: 30 });
  const hk = S.newSketch(); S.addPoint(hk, 30, 30);
  const hs = P.addFeature(plate, 'sketch', { plane: { kind: 'face', feature: pe.id, face: 'end' }, sketch: hk });
  P.addFeature(plate, 'hole', { sketch: hs.id, kind: 'tapped', size: 'M10', d: 10, depth: 20, through: false, threadDepth: 12, csinkD: 12, csinkAngle: 90 });
  // the bolt: a Ø10 rod 30 long along +y, threaded (cosmetic) all along
  const bolt = P.newPart('Bolt');
  const bk = S.newSketch(); S.addCircle(bk, [0, 0], 5);
  const bs = P.addFeature(bolt, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: bk });
  P.addFeature(bolt, 'extrude', { sketch: bs.id, depth: 30 });
  const bolt0 = K.regenerate(bolt, M);
  P.addFeature(bolt, 'thread', { faces: [{ name: bolt0.faces.find((f) => f.type === 'cylinder').name }] });
  const block = P.newPart('Block');
  const ks = P.addFeature(block, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(10, 10).sk });
  P.addFeature(block, 'extrude', { sketch: ks.id, depth: 10 });
  const builds = new Map();
  const asm = A.newAssembly('Bolted');
  const ip = A.insertPart(asm, plate);
  const ib = A.insertPart(asm, bolt, { place: V.translation([30, 20, -30]) });   // 10 in
  const ix = A.insertPart(asm, block, { place: V.translation([55, 25, 5]) });     // through the plate's corner: 5 × 5 × 5 inside
  const it = A.insertPart(asm, block, { pid: ix.part, place: V.translation([5, 30, -55]) });   // resting on the top
  for (const [pid, p] of Object.entries(asm.parts)) builds.set(pid, K.regenerate(P.readPart(p.part), M));
  const bt = builds.get(ib.part).threads, pt = builds.get(ip.part).threads;
  const tapR = 8.5 / 2, majR = 5;

  section('interference: kinds (0.5 WL.33)');
  {
    const z = [...bt.values()][0].list[0], h = [...pt.values()][0].list[0];
    ok(Math.abs(z.r0 - (10 - 1.082532 * 1.5) / 2) < 1e-6 && z.r1 === 5 && Math.abs(h.r0 - (10 - 1.082532 * 1.5) / 2) < 1e-6 && h.r1 === 5 && h.depth === 12 && h.d[1] === -1, 'thread records carry their zone (minor to major radius), the hole\'s pointing into the material');
    let world = A.placeAll(asm, builds).world;
    let res = A.interference(asm, builds, world, M);
    const kind = (a, b) => res.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
    const seg = plate.resolution, facet = (r) => 0.5 * seg * r * r * Math.sin(2 * Math.PI / seg);
    const fit = kind(ip.id, ib.id);
    ok(fit && fit.kind === 'thread' && rel(fit.volume, 10 * (facet(majR) - facet(tapR)), 0.01), `the bolt 10 mm into the tapped hole: a thread fit, ${fit?.volume.toFixed(3)} mm³ = (major − tap drill annulus) × 10`);
    const cl = kind(ip.id, ix.id);
    ok(cl && cl.kind === 'overlap' && rel(cl.volume, 125, 1e-9), 'a block through the plate\'s corner: an overlap of 5 × 5 × 5 = 125 mm³');
    ok(!kind(ip.id, it.id) && res.length === 2, 'the block resting on the top: nothing, unless touching faces are asked for');
    res = A.interference(asm, builds, world, M, { touch: true });
    const tc = res.find((c) => c.kind === 'touch');
    ok(tc && [tc.a, tc.b].sort().join() === [ip.id, it.id].sort().join() && tc.volume === 0 && res.length === 3, 'with touching faces: the resting block, volume 0');
    asm.instances.find((i) => i.id === ib.id).place = V.translation([30, 14, -30]);   // 16 in: 4 mm past the thread
    world = A.placeAll(asm, builds).world;
    res = A.interference(asm, builds, world, M);
    const deep = kind(ip.id, ib.id);
    ok(deep && deep.kind === 'thread-depth' && deep.volume > fit.volume * 1.5, `16 mm in, past the hole's 12 mm thread: a thread depth mismatch (${deep?.volume.toFixed(3)} mm³)`);
    // no threads at all (the cosmetic thread suppressed): the same overlap is a plain overlap
    const bolt2 = JSON.parse(JSON.stringify(bolt)); bolt2.features.at(-1).suppressed = true;
    const b2 = new Map(builds); b2.set(ib.part, K.regenerate(bolt2, M));
    const pl2 = JSON.parse(JSON.stringify(plate)); pl2.features.at(-1).kind = 'simple'; pl2.features.at(-1).d = 8.5;
    b2.set(ip.part, K.regenerate(pl2, M));
    const plain = A.interference(asm, b2, world, M).find((c) => c.kind !== 'overlap' || c.a === ip.id && c.b === ib.id || c.b === ip.id && c.a === ib.id);
    ok(plain && plain.kind === 'overlap', 'without threads on either part the same rod in a plain hole is an overlap');
    asm.instances.find((i) => i.id === ib.id).place = V.translation([30, 20, -30]);
  }

  section('interference: filters, kept with the assembly');
  {
    const world = A.placeAll(asm, builds).world;
    const res = A.interference(asm, builds, world, M, { touch: true });
    ok(A.filterClashes(asm, res).shown.length === 3 && !asm.clashFilter && A.fileVersion(asm) <= 3, 'no filters: everything shown, the file stays the old version');
    A.setKindHidden(asm, 'touch', true);
    A.setKindHidden(asm, 'thread', true);
    let f = A.filterClashes(asm, res);
    ok(f.shown.length === 1 && f.shown[0].kind === 'overlap' && f.hidden.length === 2 && asm.clashFilter.hide.join() === 'thread,touch', 'touching faces and thread fits hidden: only the overlap shows');
    A.setPairHidden(asm, ix.id, ip.id, true);
    f = A.filterClashes(asm, res);
    ok(f.shown.length === 0 && f.hidden.length === 3 && asm.clashFilter.pairs.length === 1, 'the plate × block pair hidden too (either order): nothing shows');
    ok(A.fileVersion(asm) === 4, 'an assembly with filters is version 4 (0.4 refuses it instead of dropping them)');
    const back = A.readAssembly(A.toJSON(asm));
    ok(back.version === 4 && JSON.stringify(back.clashFilter) === JSON.stringify(asm.clashFilter) && A.filterClashes(back, res).shown.length === 0, 'the filters are saved and read back');
    const bad = (mut) => { const j = JSON.parse(A.toJSON(asm)); mut(j); return () => A.readAssembly(JSON.stringify(j)); };
    ok(throws(bad((j) => { j.clashFilter.hide = ['bogus']; }), /filters are bad/) && throws(bad((j) => { j.clashFilter.pairs = [['i1', 'i1']]; }), /filters are bad/) && throws(bad((j) => { j.clashFilter = [1]; }), /filters are bad/) && throws(bad((j) => { j.clashFilter.pairs = [['x', 'i2']]; }), /filters are bad/),
      'tampered filters (an unknown kind, a pair with itself, not an object, a bad id) are refused');
    const gone = A.readAssembly(JSON.stringify((() => { const j = JSON.parse(A.toJSON(asm)); j.clashFilter.pairs.push(['i1', 'i99']); return j; })()));
    ok(gone.clashFilter.pairs.length === 1, 'a pair naming an instance the assembly lacks is dropped on read');
    const v3 = JSON.parse(A.toJSON(asm)); v3.version = A.VERSION + 1;   // 0.6 LC.18 made 5 a real version (stack-ups)
    ok(throws(() => A.readAssembly(JSON.stringify(v3)), /newer/), 'a newer version is refused, as before');
    A.removeInstance(asm, ix.id);
    ok(asm.clashFilter.pairs.length === 0 && asm.clashFilter.hide.length === 2, 'removing the block drops its hidden pair');
    A.setKindHidden(asm, 'touch', false); A.setKindHidden(asm, 'thread', false);
    ok(!asm.clashFilter && A.fileVersion(asm) <= 3, 'showing everything again removes the filters (and the version goes back)');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runClashFilterTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
