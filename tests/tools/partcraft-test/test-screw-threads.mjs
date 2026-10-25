#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-screw-threads.mjs — threads on round faces and modelled threads (0.5 WL.29; threads.js, kernel.js, brep-thread.js).
 *   - the tables and basic profiles: ISO 68-1 (M10: D1 = 8.376, 60° flanks, crest P/8, root P/4) and ISO 2901 (Tr16×4:
 *     depth 2, 30° flanks, 0.366P flats); sizes found from a face's diameter;
 *   - the helical solid: its cross-section's area = (1/P)∫πr(u)²du (closed form per profile piece), its volume = area × height
 *     (a twist keeps the area), every vertex on the screw surface r = profile(z ∓ Pθ/2π) for both hands;
 *   - fits: a shaft's thread at clearance c lies inside a bore's cutter at c (they never interfere), at c = 0 they coincide;
 *   - parts on the mesh kernel: an M10 boss modelled (removed volume = the closed form to the faceting), the named thread
 *     face, one valid body; cosmetic (no geometry, the callout, the dashed circle at the minor diameter); a partial length
 *     from the free end and Flip; left hand; a Tr16×4 shaft found by size; a modelled M8 tapped hole through a plate
 *     (removed = the bolt's area × the plate) and its linear pattern; refusals in words (a flat face, no size fits);
 *   - the file: version 3, round trip, tampered fields refused; the drawing notes (threadNotes);
 *   - the exact kernel (when OpenCascade is here): the same thread is cosmetic and a modelled one says so.
 *   node tools/partcraft-test/test-screw-threads.mjs [--verbose]    (or runScrewThreadTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const OCCT = path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js');

export async function runScrewThreadTests({ ok, section, oc = null, M = null, skip = (m) => console.log('  skip ' + m) }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  const TH = await import(DEV + 'threads.js'), K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');
  const V = await import(DEV + 'vec.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
  const near = (a, b, t) => Math.abs(a - b) <= t;
  const why = (r) => [...r.results].filter(([, x]) => x.status !== 'ok').map(([k, x]) => `${k}: ${x.message}`).join('; ');
  const live = [], T = (m) => { live.push(m); return m; };
  const free = () => { for (const m of live.splice(0)) try { m.delete(); } catch { /* gone */ } };
  /** ∫₀ᴾ π r(u)² du / P for a piecewise-linear profile: π w (r0² + r0 r1 + r1²)/3 per piece. */
  const exactArea = (c) => { let a = 0; for (let k = 1; k < c.length; k++) { const w = c[k][0] - c[k - 1][0], r0 = c[k - 1][1], r1 = c[k][1]; a += Math.PI * w * (r0 * r0 + r0 * r1 + r1 * r1) / 3; } return a / c[c.length - 1][0]; };
  const polyArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length]; a += x0 * y1 - x1 * y0; } return a / 2; };

  section('threads: ISO and trapezoidal profiles, sizes (0.5 WL.29)');
  {
    const g = TH.threadDims('iso', 'M10');
    ok(near(g.d1, 10 - 1.082532 * 1.5, 1e-5) && near(g.d2, 10 - 0.649519 * 1.5, 1e-6) && g.p === 1.5, 'M10×1.5: D1 = D − 1.0825P = 8.376, D2 = D − 0.6495P (ISO 68-1)');
    const c = TH.profileCorners('iso', 'M10');
    const w = c.slice(1).map((q, k) => q[0] - c[k][0]);
    ok(near(w[0], 1.5 / 8, 1e-12) && near(w[2], 1.5 / 4, 1e-12) && near(w[1], w[3], 1e-12) && near(c[4][0], 1.5, 1e-12), 'ISO basic profile: crest P/8 at the major diameter, root P/4 at the minor, two equal flanks, one pitch');
    const half = Math.atan2(w[1], c[0][1] - c[2][1]) * 180 / Math.PI;
    ok(near(half, 30, 1e-9), `ISO flanks lean 30° from radial (60° thread): ${half.toFixed(9)}°`);
    const tr = TH.threadDims('tr', 'Tr16x4'), ct = TH.profileCorners('tr', 'Tr16x4');
    const wt = ct.slice(1).map((q, k) => q[0] - ct[k][0]);
    ok(tr.d === 16 && tr.p === 4 && near(tr.d1, 12, 1e-12) && near(wt[0], 0.366025 * 4, 1e-5) && near(wt[2], wt[0], 1e-12) && near(Math.atan2(wt[1], 2) * 180 / Math.PI, 15, 1e-9), 'Tr16×4: depth P/2, crest and root 0.366P, flanks 15° (30° thread) (ISO 2901)');
    ok(TH.sizeLabel('tr', 'Tr8x1_5') === 'Tr8×1.5' && TH.sizeLabel('iso', 'M10') === 'M10', 'sizes are written M10, Tr8×1.5');
    ok(TH.sizeFor('iso', 10, true) === 'M10' && TH.sizeFor('iso', 8.5, false) === 'M10' && TH.sizeFor('iso', 6.8, false) === 'M8' && TH.sizeFor('tr', 16, true) === 'Tr16x4' && TH.sizeFor('iso', 0.5, true) === null,
      'sizes found from a face: a Ø10 shaft = M10, a Ø8.5 bore (the tap drill) = M10, Ø6.8 = M8, a Ø16 shaft = Tr16×4, Ø0.5 = none');
    ok(TH.profileAt(c, 0.05) === 5 && near(TH.profileAt(c, 1.5 * 0.6), g.d1 / 2, 1e-12) && TH.profileAt(c, 1.5 + 0.05) === 5 && TH.profileAt(c, -1.45) === 5, 'the profile repeats every pitch, both ways');
    const sh = TH.profileCorners('iso', 'M10', -0.1);
    ok(near(sh[0][1], 4.9, 1e-12) && near(sh[2][1], g.d1 / 2 - 0.1, 1e-12), 'a clearance moves the whole profile radially');
  }

  section('threads: the helical solid');
  {
    for (const [form, size, hand] of [['iso', 'M10', 'right'], ['iso', 'M10', 'left'], ['tr', 'Tr16x4', 'right']]) {
      const c = TH.profileCorners(form, size);
      const poly = TH.boltSection(c, { hand, segments: 360 });
      const A = exactArea(c), a = polyArea(poly);
      ok(a > 0 && rel(a, A, 2e-4), `${size} ${hand}: the cross-section is CCW, area ${a.toFixed(5)} = (1/P)∫πr²du ${A.toFixed(5)} (chords, 360/turn)`);
      const h = 12;
      const m = TH.boltSolid(M, T, c, h, { hand, segments: 360 });
      ok(m.status() === 'NoError' && m.genus() === 0 && rel(m.volume(), a * h, 1e-5), `${size} ${hand}: one valid solid, volume ${m.volume().toFixed(4)} = area × height ${(a * h).toFixed(4)} (a twist keeps the area; 1e-5)`);
      // every vertex on the screw surface: r = profile(u), u = z − Pθ/2π (right) or z + Pθ/2π (left)
      const gm = m.getMesh(), pp = gm.vertProperties, np = gm.numProp, Pp = c[c.length - 1][0], s = hand === 'left' ? 1 : -1;
      let worst = 0;
      for (let i = 0; i < pp.length / np; i++) {
        const x = pp[i * np], y = pp[i * np + 1], z = pp[i * np + 2], r = Math.hypot(x, y);
        if (r < 1e-9) continue;
        worst = Math.max(worst, Math.abs(r - TH.profileAt(c, z + s * Pp * Math.atan2(y, x) / (2 * Math.PI))));
      }
      ok(worst < 2e-5, `${size} ${hand}: every vertex lies on the screw surface (worst ${worst.toExponential(2)} mm, float32)`);
    }
    // fits: a shaft's thread at clearance c inside a bore's cutter at c; at c = 0 they are the same solid
    for (const cl of [0, 0.1, 0.2]) {
      const ext = TH.boltSolid(M, T, TH.profileCorners('iso', 'M8', -cl), 8, { segments: 96 });
      const int = TH.boltSolid(M, T, TH.profileCorners('iso', 'M8', cl), 8, { segments: 96 });
      const clash = T(ext.subtract(int)).volume();
      ok(clash < 1e-6 * ext.volume(), `M8 at clearance ${cl}: the bolt's thread fits inside the nut's (interference ${clash.toExponential(1)} mm³)`);
    }
    const gap = T(TH.boltSolid(M, T, TH.profileCorners('iso', 'M8', 0.1), 8, { segments: 96 }).subtract(TH.boltSolid(M, T, TH.profileCorners('iso', 'M8', -0.1), 8, { segments: 96 }))).volume();
    ok(gap > 0.5, `clearance 0.1 each side leaves a real gap between them (${gap.toFixed(3)} mm³ over 8 mm)`);
    free();
  }

  // a 40 × 40 × 10 block with a Ø10 × 20 boss on its top (Y up)
  const boss = (thread = null, dia = 10) => {
    const part = P.newPart('Boss'); const b = F.blockSketch(40, 40);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk });
    const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
    const sk = S.newSketch(); S.addCircle(sk, [20, 20], dia / 2);
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s2.id, depth: 20 });
    const r0 = K.regenerate(part, M);
    const cyl = r0.faces.find((f) => f.type === 'cylinder');
    const th = thread ? P.addFeature(part, 'thread', { faces: [{ name: cyl.name, at: cyl.at }], ...thread }) : null;
    return { part, th, r0, cyl };
  };

  section('threads: a modelled M10 boss on the mesh kernel');
  {
    const { part, th, r0, cyl } = boss({ modelled: true, clearance: 0.1 });
    const r = K.regenerate(part, M);
    ok(r.results.get(th.id).status === 'ok' && r.stats.bodies === 1 && r.stats.genus === 0, 'it builds one valid body ' + why(r));
    // removed = the faceted Ø10 cylinder less the bolt's section (clearance 0.1), over 20 mm; the crest moved inside the facets
    const corners = TH.profileCorners('iso', 'M10', -0.1), seg = part.resolution;
    const facetA = 0.5 * seg * 25 * Math.sin(2 * Math.PI / seg);
    const want = 20 * (facetA - exactArea(corners)), got = r0.stats.volume - r.stats.volume;
    ok(rel(got, want, 0.01), `removed ${got.toFixed(2)} mm³ = 20 × (faceted circle − bolt section) ${want.toFixed(2)} (1 %)`);
    const tf = r.faces.filter((f) => f.type === 'thread'), names = r.faces.map((f) => f.name);
    ok(tf.length === 1 && tf[0].name === th.id + '.thread:0' && near(tf[0].r, 4.9, 1e-12) && !names.includes(cyl.name) && names.filter((n) => n.startsWith(th.id + '.tend')).length === 1,
      'one named thread face (crest radius 4.9) and one thread end at the shoulder; no slivers of the old cylinder');
    ok(r.mesh.triFace.every((x) => x >= 0) && r.mesh.edgeSegs, 'every triangle is on a named face, so the view draws the named edges');
    const rec = r.threads.get(th.id);
    ok(rec.modelled && rec.callout === 'M10×1.5 - 6g, thread 20 long (modelled)' && near(rec.list[0].depth, 20, 1e-6), `the callout: "${rec.callout}"`);
    // it starts at the free end: the thread record's origin is at the boss's top (y = 30), its direction down
    ok(near(rec.list[0].o[1], 30, 1e-4) && near(rec.list[0].d[1], -1, 1e-9), 'it starts at the open end (the top of the boss) and runs down');
    ok(TH.threadNotes(r.threads)[0].callout === rec.callout && TH.threadNotes(r.threads)[0].count === 1, 'the drawing gets its note');
  }

  section('threads: cosmetic, partial, flipped, left hand, trapezoidal');
  {
    const c = boss({});
    const r = K.regenerate(c.part, M);
    const rec = r.threads.get(c.th.id);
    ok(r.results.get(c.th.id).status === 'ok' && near(r.stats.volume, c.r0.stats.volume, 1e-9) && !rec.modelled && rec.callout === 'M10×1.5 - 6g, thread 20 long' && near(rec.list[0].r, TH.threadDims('iso', 'M10').d1 / 2, 1e-12),
      'cosmetic (the default): no geometry, "M10×1.5 - 6g, thread 20 long", the dashed circle at the minor diameter');
    const full = c.r0.stats.volume - K.regenerate(boss({ modelled: true, clearance: 0.1 }).part, M).stats.volume;
    const pp = boss({ modelled: true, clearance: 0.1, length: 8 });
    const rp = K.regenerate(pp.part, M);
    const got = pp.r0.stats.volume - rp.stats.volume, tfp = rp.faces.find((f) => f.type === 'thread');
    // 8 of 20 mm, starting one pitch past the free end (the groove there removes air): 8/20 of the full thread's material
    ok(rel(got, full * 8 / 20, 0.02) && tfp.at[1] > 20 + 4, `length 8 from the free end: ${got.toFixed(2)} ≈ 8/20 of ${full.toFixed(2)}, near the top`);
    const pf = boss({ modelled: true, clearance: 0.1, length: 8, flip: true });
    const rf = K.regenerate(pf.part, M), tff = rf.faces.find((f) => f.type === 'thread');
    ok(rf.results.get(pf.th.id).status === 'ok' && tff.at[1] < 20 && rel(pf.r0.stats.volume - rf.stats.volume, got, 0.02), 'Flip: the same 8 mm at the shoulder end');
    const pl = boss({ modelled: true, clearance: 0.1, hand: 'left' });
    const rl = K.regenerate(pl.part, M);
    ok(rl.results.get(pl.th.id).status === 'ok' && rel(pl.r0.stats.volume - rl.stats.volume, full, 1e-4), `left hand (the mirror image): the same material removed as right hand (${(pl.r0.stats.volume - rl.stats.volume).toFixed(3)} vs ${full.toFixed(3)})`);
    const plong = boss({ modelled: true, length: 50 });
    const rlong = K.regenerate(plong.part, M);
    ok(rlong.results.get(plong.th.id).status === 'ok' && /longer than the face/.test(rlong.results.get(plong.th.id).warning || ''), 'a length past the face runs the whole face, and says so');
    const ptr = boss({ form: 'tr', modelled: true, clearance: 0 }, 16);
    const rtr = K.regenerate(ptr.part, M);
    const rect = rtr.threads.get(ptr.th.id);
    ok(rtr.results.get(ptr.th.id).status === 'ok' && rect.callout === 'Tr16×4 - 7e, thread 20 long (modelled)' && rtr.stats.bodies === 1, `a Ø16 shaft gets Tr16×4 by itself: "${rect.callout}"`);
    const corners = TH.profileCorners('tr', 'Tr16x4'), seg = ptr.part.resolution;
    // at clearance 0 the crest (Ø16) sits on the facets, so it moves just inside them: compare with the faceted circle less the section
    const lo = 8 * Math.cos(Math.PI / seg) - 8e-4; corners[0][1] = corners[1][1] = corners[4][1] = lo;
    const facetA = 0.5 * seg * 64 * Math.sin(2 * Math.PI / seg);
    ok(rel(ptr.r0.stats.volume - rtr.stats.volume, 20 * (facetA - exactArea(corners)), 0.01), 'Tr16×4 removes the faceted circle less its section over 20 mm (1 %)');
    const pbig = boss({ size: 'M24', modelled: true });
    const rbig = K.regenerate(pbig.part, M);
    ok(rbig.results.get(pbig.th.id).status === 'ok' && /not M24's Ø24/.test(rbig.results.get(pbig.th.id).warning || ''), 'a size that does not fit the shaft is built and said: ' + (rbig.results.get(pbig.th.id).warning || ''));
    const pnone = boss({}, 0.6);
    const rnone = K.regenerate(pnone.part, M);
    ok(rnone.results.get(pnone.th.id).status === 'error' && /No standard size fits a round face of Ø0.6 mm/.test(rnone.results.get(pnone.th.id).message), 'no size for a Ø0.6 pin: refused in words');
    const pflat = boss({});
    pflat.th.faces = [{ name: pflat.r0.faces.find((f) => f.type === 'plane').name }];
    const rflat = K.regenerate(pflat.part, M);
    ok(rflat.results.get(pflat.th.id).status === 'error' && /round face/.test(rflat.results.get(pflat.th.id).message), 'a flat face is refused: ' + rflat.results.get(pflat.th.id).message);
    const pgone = boss({});
    pgone.th.faces = [{ name: 'f4.side:c99' }];
    ok(/is gone/.test(K.regenerate(pgone.part, M).results.get(pgone.th.id).message), 'a face that is gone is said');
  }

  section('threads: a modelled tapped hole');
  {
    const plate = (hole) => {
      const part = P.newPart('Plate'); const b = F.blockSketch(40, 30);
      const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk });
      const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
      const sk = S.newSketch(); S.addPoint(sk, 12, 15);
      const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk });
      const h = P.addFeature(part, 'hole', { sketch: s2.id, kind: 'tapped', d: 8, size: 'M8', threadDepth: null, through: true, csinkD: 12, csinkAngle: 90, ...hole });
      return { part, h };
    };
    const solid = K.regenerate((() => { const q = plate({}); q.part.features.pop(); q.part.features.pop(); return q.part; })(), M).stats.volume;
    const cos = plate({}), rc = K.regenerate(cos.part, M);
    const seg = cos.part.resolution, drillA = 0.5 * seg * 3.4 * 3.4 * Math.sin(2 * Math.PI / seg);
    ok(rel(solid - rc.stats.volume, 10 * drillA, 1e-6) && rc.threads.get(cos.h.id).callout === 'M8×1.25 - 6H, thread through' && !rc.threads.get(cos.h.id).modelled,
      'cosmetic tapped M8: drilled Ø6.8 only, its callout, and now its thread record on the mesh kernel too');
    const mod = plate({ modelled: true, clearance: 0.1 }), rm = K.regenerate(mod.part, M);
    const A = exactArea(TH.profileCorners('iso', 'M8', 0.1));
    ok(rm.results.get(mod.h.id).status === 'ok' && rm.stats.bodies === 1 && rel(solid - rm.stats.volume, 10 * A, 0.01), `modelled M8 through a 10 mm plate: removed ${(solid - rm.stats.volume).toFixed(2)} = the bolt's section × 10 = ${(10 * A).toFixed(2)} (1 %)`);
    ok(rm.faces.some((f) => f.type === 'thread' && f.name.startsWith(mod.h.id + '.thread:')) && rm.threads.get(mod.h.id).modelled, 'its thread face is named after the hole; no dashed circles for it');
    const blind = plate({ through: false, depth: 8, threadDepth: 5, modelled: true, clearance: 0.1 }), rb = K.regenerate(blind.part, M);
    const drill8 = 8 * drillA;
    ok(rb.results.get(blind.h.id).status === 'ok' && rel(solid - rb.stats.volume, drill8 + 5 * (A - drillA), 0.01), 'blind 8 deep, thread 5: the drill all the way, the thread for 5 mm');
    const pat = plate({ modelled: true, clearance: 0.1 });
    P.addFeature(pat.part, 'lpattern', { seeds: [pat.h.id], dir: { kind: 'world', axis: 'x' }, count: 2, spacing: 16 });
    const rpat = K.regenerate(pat.part, M);
    ok(rel(solid - rpat.stats.volume, 2 * (solid - rm.stats.volume), 0.005) && rpat.faces.filter((f) => f.type === 'thread').length === 2, 'a linear pattern of it copies the thread');
    // the file
    const back = P.readPart(P.toJSON(mod.part)).features.find((f) => f.type === 'hole');
    ok(back.modelled === true && back.clearance === 0.1 && P.fileVersion(mod.part) === 3, 'the modelled hole round-trips (version 3)');
    const plain = P.readPart(P.toJSON(cos.part)).features.find((f) => f.type === 'hole');
    ok(plain.modelled === undefined && plain.clearance === undefined, 'a cosmetic tapped hole writes no new fields');
  }

  section('threads: the file');
  {
    const { part, th } = boss({ form: 'iso', size: 'M10', length: 12, flip: true, modelled: true, clearance: 0.15, hand: 'left' });
    ok(P.fileVersion(part) === 3 && P.dependsOn(th).length === 1, 'a thread makes the file version 3 and depends on its face\'s feature');
    const back = P.readPart(P.toJSON(part)).features.find((f) => f.type === 'thread');
    ok(back.size === 'M10' && back.length === 12 && back.flip && back.modelled && back.clearance === 0.15 && back.hand === 'left' && back.faces[0].name === th.faces[0].name, 'the thread round-trips through the file');
    const bad = (mut) => { const j = JSON.parse(P.toJSON(part)); mut(j.features.find((f) => f.type === 'thread')); try { P.readPart(JSON.stringify(j)); return ''; } catch (e) { return e.message; } };
    const msgs = [bad((f) => { f.form = 'bsw'; }), bad((f) => { f.size = 'M99'; }), bad((f) => { f.size = 'Tr16x4'; }), bad((f) => { f.length = 0; }), bad((f) => { f.clearance = -1; }), bad((f) => { f.hand = 'up'; }), bad((f) => { f.faces = 'x'; }), bad((f) => { f.faces = [{ name: 'f99.side:c1' }]; })];
    ok(msgs.every(Boolean) && /thread form is bad/.test(msgs[0]) && /thread size/.test(msgs[1]) && /thread length is bad/.test(msgs[3]) && /clearance is bad/.test(msgs[4]) && /hand is bad/.test(msgs[5]),
      'tampered form, size, a size of the other form, length, clearance, hand, faces and a face of a missing feature are refused');
  }

  section('threads: the exact kernel (cosmetic)');
  if (!oc) skip('OpenCascade is not here: the exact kernel checks');
  else {
    const B = await import(DEV + 'brep.js');
    const { part, th } = boss({});
    const rb = B.regenerateBrep(part, oc);
    const cyl = rb.faces.find((f) => f.type === 'cylinder');
    th.faces = [{ name: cyl.name, at: cyl.at }];
    const r1 = B.regenerateBrep(part, oc), rec = r1.threads.get(th.id);
    ok(r1.results.get(th.id).status === 'ok' && rec?.callout === 'M10×1.5 - 6g, thread 20 long', 'the exact kernel: the same callout, cosmetic ' + why(r1) + ' ' + (rec?.callout ?? ''));
    th.modelled = true;
    const r2 = B.regenerateBrep(part, oc);
    ok(r2.results.get(th.id).status === 'ok' && /exact kernel shows this thread as cosmetic/.test(r2.results.get(th.id).warning || '') && near(r2.stats.volume, r1.stats.volume, 1e-6), 'modelled on the exact kernel: cosmetic, and says so');
  }
  free();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  let oc = null;
  if (fs.existsSync(OCCT)) { const { default: init } = await import(OCCT); oc = await init({ print: () => {}, printErr: () => {} }); }
  await runScrewThreadTests({ ok, section, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
