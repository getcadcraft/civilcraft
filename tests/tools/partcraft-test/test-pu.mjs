#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-pu.mjs — the DOM-free side of the 0.6 PartCraft usability items (session part-usability, roadmap PU.1–PU.6).
 *   PU.6 groupConstraints: repeated relations of one kind become one group in the place of the first; dimensions and
 *        single relations stay rows; order kept; a rectangle's eight relations are three rows.
 *   PU.3 face-actions.js on the mesh kernel: a block's top face outline (with a hole in it) projected into a sketch on the
 *        face is one even-odd profile; Extrude from it adds area × depth, Cut into it (half the part's height) removes it,
 *        Hole here drills a hole at the clicked point; cutDepth along any normal.
 *   PU.2 handle-math.js: an Extrude's arrow (cut, reverse, both sides), the drag along its axis and its rounding; a Revolve's
 *        arc handle and the angle read from the pointer (unwrapped, 1–360).
 *   PU.5 treeValue: each feature type's row value ("25 mm", "Ø6.6 thru", "R2" …), none for sketches and mirrors, bad data safe.
 *   node tools/partcraft-test/test-pu.mjs [--verbose]    (or runPuTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runPuTests({ ok, section, M = null }) {
  const S = await import(DEV + 'sketch.js');
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });

  section('PU.6 group repeated relations (0.6)');
  {
    const sk = S.newSketch();
    S.addRect(sk, [0, 0], [40, 20]);
    const kinds = sk.constraints.map((c) => c.type);
    const g = S.groupConstraints(sk.constraints);
    const shape = g.map((x) => (x.c ? x.c.type : x.type + '×' + x.items.length));
    ok(sk.constraints.length >= 6 && g.length < sk.constraints.length && g.every((x) => x.c || x.items.length > 1), `a rectangle's ${kinds.length} relations are ${g.length} rows (${shape.join(', ')})`);
    ok(g.flatMap((x) => (x.c ? [x.c] : x.items)).length === sk.constraints.length, 'no relation lost or doubled');
    const line = S.addLine(sk, [0, 40], [30, 45]);
    S.addConstraint(sk, 'distance', [line.id], 30);
    S.addConstraint(sk, 'distance', [sk.entities.find((e) => e.type === 'line').id], 40);
    S.addConstraint(sk, 'parallel', [line.id, sk.entities.find((e) => e.type === 'line').id]);
    const g2 = S.groupConstraints(sk.constraints);
    ok(g2.filter((x) => x.c && x.c.type === 'distance').length === 2 && g2.some((x) => x.c && x.c.type === 'parallel'), 'dimensions stay one row each (they carry values); a single Parallel stays a row');
    const firstAt = (ty) => sk.constraints.findIndex((c) => c.type === ty);
    const order = g2.map((x) => (x.c ? sk.constraints.indexOf(x.c) : firstAt(x.type)));
    ok(order.every((v, i) => i === 0 || v > order[i - 1]), 'each row sits where its first relation was');
    ok(S.groupConstraints([]).length === 0 && S.groupConstraints([{ id: 'c1', type: 'nosuch', refs: [] }]).length === 1, 'an empty list, and an unknown kind stays a row');
  }

  section('PU.5 the main value in the history row (0.6)');
  {
    const { treeValue } = await import(DEV + 'tree-value.js');
    const P = await import(DEV + 'part.js');
    const p = P.newPart('T');
    const add = (type, props) => P.addFeature(p, type, props);
    const cases = [
      [add('extrude', { depth: 25 }), '25 mm'],
      [add('extrude', { end: 'through' }), 'through all'],
      [add('extrude', { end: 'mid', depth: 12.5 }), '12.5 mm, both sides'],
      [add('revolve', { angle: 270 }), '270°'],
      [add('hole', { d: 6.6, through: true }), 'Ø6.6 thru'],
      [add('hole', { d: 5, through: false, depth: 12 }), 'Ø5 × 12'],
      [add('lpattern', { count: 4, spacing: 20 }), '4 × 20 mm'],
      [add('cpattern', { count: 6, angle: 360 }), '6 over 360°'],
      [add('fillet', { r: 2 }), 'R2'],
      [add('chamfer', { d: 1.5 }), '1.5 mm'],
      [add('shell', { t: 2 }), '2 mm'],
      [add('draft', { angle: 3 }), '3°'],
      [add('plane', { mode: 'offset', d: 20 }), '20 mm'],
      [add('plane', { mode: '3pt' }), ''],
      [add('thread', { size: 'M8', length: 12 }), 'M8 × 12 mm'],
      [add('thread', { size: 'auto', length: null }), ''],
      [add('sketch', {}), ''],
      [add('mirror', {}), ''],
    ];
    const bad = cases.filter(([f, want]) => treeValue(f) !== want).map(([f, want]) => `${f.type}: "${treeValue(f)}" ≠ "${want}"`);
    ok(!bad.length, `each feature's row value (${cases.length} cases)` + (bad.length ? ': ' + bad.join('; ') : ''));
    ok(treeValue({ type: 'extrude', depth: 1 / 3 }, (v) => v.toFixed(3)) === '0.333 mm', 'numbers go through the format it is given');
    ok(treeValue(null) === '' && treeValue({ type: 'hole', d: NaN }) === '' && treeValue({ type: 'thread', size: 'M8'.repeat(20) }).length === 16, 'bad data gives no value, or a short one');
  }

  section('PU.3 more actions on a picked face (0.6, mesh kernel)');
  {
    if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
    const P = await import(DEV + 'part.js'), K = await import(DEV + 'kernel.js'), FA = await import(DEV + 'face-actions.js'), B = await import(DEV + 'brep.js');
    const rel = (a, b, r = 1e-6) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
    // a 40 × 20 × 10 block with a Ø6 hole through it, on the top plane
    const block = () => {
      const p = P.newPart('Block');
      const sk = S.newSketch();
      S.addRect(sk, [0, 0], [40, 20]);
      S.addCircle(sk, [20, 10], 3);
      const s = P.addFeature(p, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
      P.addFeature(p, 'extrude', { sketch: s.id, depth: 10 });
      return p;
    };
    const p0 = block(), r0 = K.regenerate(p0, M);
    const v0 = r0.stats.volume, holeArea = (40 * 20 * 10 - v0) / 10;
    const top = r0.faces.find((f) => f.name === 'f2.end');
    const ref = B.refForName(top.name), frame = K.planeFrame(ref, r0, p0);
    const sk = S.newSketch();
    const out = FA.faceOutline(sk, frame, r0.edges, top.name);
    const prof = S.profile(sk);
    ok(top && out.made >= 5 && out.skipped === 0 && !prof.error && prof.loops.length === 2, `the top face's outline: ${out.made} curves copied, two loops (the edge and the hole)`);
    const act = (kind) => {
      const p = block(), r = K.regenerate(p, M), fr = K.planeFrame(ref, r, p), s2 = S.newSketch();
      const bb = r.stats.bbox, mid = (i) => (bb.min[i] + bb.max[i]) / 2;   // the top face is +Y: click 10 right of the middle
      if (kind === 'hole') FA.pointAt(s2, fr, [mid(0) + 10, bb.max[1], mid(2)]); else FA.faceOutline(s2, fr, r.edges, top.name);
      const s = P.addFeature(p, 'sketch', { plane: ref, sketch: s2 });
      const depth = kind === 'cut' ? FA.cutDepth(r.stats.bbox, fr.n) : 4;
      const f = kind === 'hole' ? P.addFeature(p, 'hole', { sketch: s.id, through: true, d: 4 }) : P.addFeature(p, 'extrude', { sketch: s.id, op: kind === 'cut' ? 'cut' : 'add', depth });
      const r2 = K.regenerate(p, M);
      return { r: r2, res: r2.results.get(f.id), depth };
    };
    const ex = act('extrude');
    ok(ex.res.status === 'ok' && rel(ex.r.stats.volume, v0 + (40 * 20 - holeArea) * 4) && rel(ex.r.stats.bbox.max[1] - ex.r.stats.bbox.min[1], 14), `Extrude from it: + face area × 4, the hole carried up (${ex.r.stats.volume.toFixed(3)})`);
    const cu = act('cut');
    ok(cu.depth === 5 && cu.res.status === 'ok' && rel(cu.r.stats.volume, v0 / 2) && rel(cu.r.stats.bbox.max[1] - cu.r.stats.bbox.min[1], 5), `Cut into it: half the height (5), half the volume left (${cu.r.stats.volume.toFixed(3)})`);
    const ho = act('hole');
    const hd = ho.r.stats.volume - v0;
    ok(ho.res.status === 'ok' && hd < 0 && rel(-hd, Math.PI * 4 * 10, 0.02) && ho.r.stats.genus === 2, `Hole here: a Ø4 hole through where it was clicked (−${(-hd).toFixed(3)} ≈ 40π), two through holes`);
    const bb = { min: [0, 0, 0], max: [40, 20, 10] };
    ok(FA.cutDepth(bb, [0, 0, 1]) === 5 && FA.cutDepth(bb, [1, 0, 0]) === 20 && FA.cutDepth(bb, [0, 1, 0]) === 10 && FA.cutDepth({ min: [0, 0, 0], max: [0.1, 0.1, 0.1] }, [0, 0, 1]) === 0.1 && FA.cutDepth(null, [0, 0, 1]) === 1, 'cutDepth: half the extent along the normal, at least 0.1');
    const none = FA.faceOutline(S.newSketch(), frame, r0.edges, 'no-such-face');
    ok(none.made === 0 && none.skipped === 0, 'a face with no listed edges gives nothing (the page then opens an empty sketch)');
  }

  section('PU.2 drag handles: where they sit and what a drag does (0.6)');
  {
    const HM = await import(DEV + 'handle-math.js'), P = await import(DEV + 'part.js');
    const near3 = (a, b, e = 1e-9) => a && b && a.every((v, i) => Math.abs(v - b[i]) <= e);
    const frame = { o: [0, 0, 0], x: [1, 0, 0], y: [0, 0, -1], n: [0, 1, 0] };   // a plane facing +Y
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [40, 20]);
    const p = P.newPart('H'), f = P.addFeature(p, 'extrude', { depth: 10 });
    const h = HM.extrudeHandle(f, frame, sk);
    ok(near3(h.base, [20, 0, -10]) && near3(h.dir, [0, 1, 0]) && near3(HM.handleTip(h), [20, 10, -10]) && h.key === 'depth' && h.value === 10, 'an Extrude: the arrow starts in the middle of the profile and its tip is on the end face (depth 10 along the plane normal)');
    const hc = HM.extrudeHandle({ ...f, op: 'cut' }, frame, sk), hr = HM.extrudeHandle({ ...f, op: 'cut', reverse: true }, frame, sk), hm = HM.extrudeHandle({ ...f, end: 'mid' }, frame, sk);
    ok(near3(hc.dir, [0, -1, 0]) && near3(hr.dir, [0, 1, 0]) && hm.scale === 2 && near3(HM.handleTip(hm), [20, 5, -10]), 'a Cut points into the part, Reverse flips it, both sides puts the tip at half the depth');
    ok(HM.extrudeHandle({ ...f, end: 'through' }, frame, sk) === null && HM.extrudeHandle(f, frame, S.newSketch()) === null && HM.extrudeHandle(f, null, sk) === null, 'no handle for Through all, an empty sketch or a sketch with no plane');
    const t0 = HM.axisParam(h.base, h.dir, [25, 13, 100], [0, 0, -1]);
    ok(Math.abs(t0 - 13) < 1e-9 && HM.axisParam(h.base, h.dir, [0, 0, 0], [0, 1, 0]) === null, 'the pointer ray meets the axis at 13 along it; a ray along the axis reads nothing');
    ok(HM.dragExtrude(h, 10, 10, 15.3) === 15 && HM.dragExtrude(hm, 10, 5, 8) === 16 && HM.dragExtrude(h, 10, 10, -50) === 1 && HM.dragExtrude(h, 2.5, 0, 0.26) === 2.8, 'a drag adds what the pointer moved (× 2 for both sides), rounded to a tenth of the value\'s size, never below one step');
    ok(HM.niceStep(25) === 1 && HM.niceStep(3) === 0.1 && HM.niceStep(150) === 10 && HM.niceStep(0) === 0.01, 'niceStep: 25 → 1, 3 → 0.1, 150 → 10, at least 0.01');
    const rv = P.addFeature(p, 'revolve', { angle: 90 });
    const sq = S.newSketch(); S.addRect(sq, [8, -2], [12, 2]);   // a square centred 10 from the axis
    const rh = HM.revolveHandle(rv, { o: [0, 0, 0], d: [0, 0, 1] }, { o: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], n: [0, 0, 1] }, sq);
    ok(near3(rh.start, [10, 0, 0]) && near3(HM.handleTip(rh), [0, 10, 0]) && near3(HM.turn([10, 0, 5], rh.axis, 180), [-10, 0, 5]), 'a Revolve: the handle at the profile\'s middle turned 90° about the axis (right hand)');
    const down = (x, y) => [[x, y, 50], [0, 0, -1]];
    ok(HM.dragRevolve(rh, 90, ...down(0, 10)) === 90 && HM.dragRevolve(rh, 90, ...down(-10, 0)) === 180 && HM.dragRevolve(rh, 90, ...down(7, 7)) === 45, 'the angle where the pointer meets the plane it turns in: 90, 180, 45');
    ok(HM.dragRevolve(rh, 90, ...down(10, 0.5), 350) === 360 && HM.dragRevolve(rh, 90, ...down(10, -0.5), 10) === 1 && HM.dragRevolve(rh, 90, ...down(10, -0.5), 350) === 357, 'past 360° it stops at 360, below 0° at 1 (unwrapped from the last value)');
    ok(HM.dragRevolve(rh, 90, [5, 5, 0], [1, 0, 0], 90) === 90, 'looking along the plane it turns in: the angle stays');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runPuTests({ ok, section: (t) => console.log('\n== ' + t) });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
