#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-sheetmetal.mjs — PartCraft sheet metal (0.4 P15–P17) on the exact kernel (OpenCascade in Node): the bent profile
 * (sheetmetal.js) against hand geometry, base flanges (a plate; an open profile bent with radius r, thickness either
 * side), edge flanges (90° and 45°, flipped, offsets with bend reliefs), the K-factor flat length, refusals, the file
 * format and dependencies. Every volume is checked against a closed form worked out beside it.
 *   node tools/partcraft-test/test-sheetmetal.mjs [--verbose]    (or runSheetMetalTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const PI = Math.PI;

export async function runSheetMetalTests({ ok, section, oc, skip = (m) => console.log('  skip ' + m) }) {
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const SM = await import(DEV + 'sheetmetal.js');
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const xb = (part) => B.regenerateBrep(part, oc);
  const allOk = (r) => [...r.results.values()].every((x) => x.status === 'ok');
  const why = (r) => [...r.results].filter(([, x]) => x.status !== 'ok').map(([k, x]) => `${k}: ${x.message}`).join('; ');
  const front = { kind: 'base', name: 'front' };
  const sketchOn = (part, draw) => { const sk = S.newSketch(); draw(sk); return P.addFeature(part, 'sketch', { plane: front, sketch: sk }); };
  /** An open chain of lines through pts. */
  const chain = (sk, pts) => { let prev = null; for (let i = 0; i + 1 < pts.length; i++) prev = S.addLine(sk, prev ? prev.p2 : pts[i], pts[i + 1]); };
  const bbox = (r) => r.stats.bbox || r.stats.box;

  // ======================================================================================
  section('sheet metal: the bent profile (sheetmetal.js)');
  {
    const U = [[0, 30], [0, 0], [40, 0], [40, 30]];
    for (const [side, rPath, straight, label] of [[1, 4, [26, 32, 26], 'inside (toward the bends: the path is the outer face, bend radius r + t on it)'], [-1, 2, [28, 36, 28], 'outside (the path is the inner face, radius r)']]) {
      const bp = SM.bentProfile(U, { t: 2, r: 2, side });
      const S0 = bp.loop.segs;
      let gap = 0;
      for (let i = 0; i < S0.length; i++) { const a = S0[i].b, b = S0[(i + 1) % S0.length].a; gap = Math.max(gap, Math.hypot(a[0] - b[0], a[1] - b[1])); }
      let A = 0; const Q = bp.loop.poly; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; A += a[0] * b[1] - a[1] * b[0]; }
      // area = straights × t + two quarter annuli (π/4)((r+t)² − r²) = 3π each; the polygon of 16-step arcs is a little under
      const exact = straight.reduce((s, x) => s + x, 0) * 2 + 6 * PI;
      ok(S0.length === 12 && gap === 0 && bp.bends.every((b) => b.rPath === rPath) && bp.straights.every((s, i) => near(s, straight[i], 1e-12)) && rel(Math.abs(A / 2), exact, 2e-3), `U channel, thickness ${label}: 12 segments joined exactly, straights ${bp.straights.map((s) => +s.toFixed(6)).join(', ')}, area ≈ ${exact.toFixed(4)}`);
    }
    const bp = SM.bentProfile(U, { t: 2, r: 2, side: 1 });
    const fl = SM.flatOfProfile(bp, 2, 0.44);
    // flat = straights 84 + 2 bend allowances (π/2)(r + k t) = (π/2)(2 + 0.88)
    ok(rel(fl.length, 84 + 2 * (PI / 2) * 2.88, 1e-12) && fl.lines.length === 2 && near(fl.lines[0].at, 26 + (PI / 2) * 2.88 / 2, 1e-12) && near(fl.lines[0].angle, 90, 1e-9), `flat length with K 0.44: 84 + π·2.88 = ${fl.length.toFixed(6)}; bend lines at the middle of each bend (first at ${fl.lines[0].at.toFixed(4)})`);
    ok(rel(SM.bendAllowance(PI / 3, 1.5, 3, 0.33), (PI / 3) * (1.5 + 0.99), 1e-12), 'bend allowance θ(r + k t): 60°, r 1.5, t 3, K 0.33');
    const err = (pts, o) => { try { SM.bentProfile(pts, o); return ''; } catch (e) { return e.message; } };
    ok(/shorter than its bends need/.test(err([[0, 3], [0, 0], [40, 0]], { t: 2, r: 2, side: 1 })), `a leg shorter than its bend refused: "${err([[0, 3], [0, 0], [40, 0]], { t: 2, r: 2, side: 1 })}"`);
    ok(/straight on/.test(err([[0, 0], [10, 0], [20, 0]], { t: 1, r: 1 })) && /folds right back/.test(err([[0, 0], [10, 0], [0, 0.0000000001]], { t: 1, r: 1 })), 'two lines running straight on, and a 180° fold, are refused');
    const z = SM.bentProfile([[0, 20], [0, 0], [30, 0]], { t: 1, r: 0, side: 1 });
    ok(z.bends[0].rPath === 1 && z.bends[0].rIn === 0, 'radius 0: a sharp inside corner (the outside still turns about it with radius t)');
  }

  // ======================================================================================
  section('sheet metal: base flanges on the exact kernel');
  {
    // a plate: 100 × 60, t 2 → 12000
    let part = P.newPart('Plate');
    let sk = sketchOn(part, (s) => S.addRect(s, [0, 0], [100, 60]));
    let base = P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2 });
    let r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 12000), `plate from a closed profile: 100 × 60 × 2 = 12000 (${r.stats.volume.toFixed(6)})${allOk(r) ? '' : ' — ' + why(r)}`);
    base.reverse = true; r = xb(part);
    const bb = r.stats.bbox;
    ok(allOk(r) && rel(r.stats.volume, 12000) && (!bb || (near(bb.max[2], 0, 1e-6) && near(bb.min[2], -2, 1e-6))), 'reversed: the plate grows the other way (z −2…0)');

    // an open U: legs 30 / 40 / 30, t 2, r 2, depth 50
    for (const [reverse, straights] of [[false, 84], [true, 92]]) {
      part = P.newPart('Channel');
      sk = sketchOn(part, (s) => chain(s, [[0, 30], [0, 0], [40, 0], [40, 30]]));
      base = P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2, r: 2, k: 0.44, depth: 50, reverse });
      r = xb(part);
      // (straights × t + 2 × 3π) × 50
      const v = (straights * 2 + 6 * PI) * 50;
      ok(allOk(r) && rel(r.stats.volume, v, 1e-9), `bent U channel, thickness ${reverse ? 'outside' : 'inside'}: (${straights}·2 + 6π)·50 = ${v.toFixed(6)} (${r.stats.volume.toFixed(6)})${allOk(r) ? '' : ' — ' + why(r)}`);
    }
    // the same U drawn from its other end: still inside
    part = P.newPart('Channel2');
    sk = sketchOn(part, (s) => chain(s, [[40, 30], [40, 0], [0, 0], [0, 30]]));
    P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2, r: 2, depth: 50 });
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, (84 * 2 + 6 * PI) * 50, 1e-9), `the U drawn from its other end: the thickness is still inside the bends (${r.stats.volume.toFixed(6)})`);
    const names = [...(r.faceNames || [])];
    ok(P.EXACT_ONLY.has('sheetbase') && P.EXACT_ONLY.has('sheetflange'), 'sheet metal is exact-kernel only (the mesh kernel skips it, as with fillets)');

    // refusals: an open chain with an arc, two separate chains
    part = P.newPart('Bad');
    sk = sketchOn(part, (s) => { chain(s, [[0, 10], [0, 0], [20, 0]]); S.addLine(s, [30, 0], [40, 0]); });
    P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 1, r: 1 });
    r = xb(part);
    ok(!allOk(r) && /closed profile \(a plate\) or one open chain of lines/.test(why(r)), `two separate chains refused in words: "${why(r)}"`);
    part = P.newPart('Short');
    sk = sketchOn(part, (s) => chain(s, [[0, 3], [0, 0], [40, 0]]));
    P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2, r: 2 });
    r = xb(part);
    ok(!allOk(r) && /Line 1 of the profile is 3 long/.test(why(r)), `a leg too short for its bend refused on the kernel too: "${why(r)}"`);
    void names;
  }

  // ======================================================================================
  section('sheet metal: edge flanges');
  {
    /** A 100 × 60 plate t 2 (z 0…2) and the edge between its top face and the side at y 60. */
    const plate = () => {
      const part = P.newPart('Bracket');
      let top = null;
      const sk = sketchOn(part, (s) => { S.addRect(s, [0, 0], [100, 60]); top = s.entities.filter((e) => e.type === 'line')[2].id; });
      const base = P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2, r: 2, k: 0.44 });
      return { part, base, edge: { faces: [`${base.id}.end`, `${base.id}.side:${top}`], at: [50, 60, 2] } };
    };
    // 90°, 20 long: + 100 × ((π/4)(4² − 2²) + 20·2) = 100 (3π + 40)
    let { part, base, edge } = plate();
    let fl = P.addFeature(part, 'sheetflange', { edge, angle: 90, length: 20 });
    let r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 12000 + 100 * (3 * PI + 40), 1e-9), `edge flange 90°, length 20: 12000 + 100(3π + 40) = ${(12000 + 100 * (3 * PI + 40)).toFixed(6)} (${r.stats.volume.toFixed(6)})${allOk(r) ? '' : ' — ' + why(r)}`);
    let bb = r.stats.bbox;
    ok(!bb || (near(bb.max[1], 64, 1e-6) && near(bb.max[2], 24, 1e-6) && near(bb.min[2], 0, 1e-6)), 'it bends up from the top face: outside face at y 64 (60 + r + t), top at z 24 (2 + r + 20)');
    ok(P.dependsOn(fl).includes(base.id), 'the flange depends on the base flange (its edge)');
    ok(r.stats.solids === undefined || r.stats.solids === 1, 'one solid');
    fl.flip = true; r = xb(part); bb = r.stats.bbox;
    ok(allOk(r) && rel(r.stats.volume, 12000 + 100 * (3 * PI + 40), 1e-9) && (!bb || near(bb.min[2], -22, 1e-6)), `flipped: the same flange bends down from the bottom face (z down to −22) (${why(r) || 'ok'})`);
    fl.flip = false; fl.angle = 45; r = xb(part);
    // 45°: annulus sector (π/8)(16 − 4) = 1.5π
    ok(allOk(r) && rel(r.stats.volume, 12000 + 100 * (1.5 * PI + 40), 1e-9), `45°: 12000 + 100(1.5π + 40) (${r.stats.volume.toFixed(6)})`);
    // offsets 10 / 10 with 2-wide reliefs r + t = 4 deep through t 2: − 2 × 2·4·2; flange 80 long
    fl.angle = 90; fl.offsets = [10, 10]; r = xb(part);
    const vRel = 12000 - 2 * (2 * 4 * 2) + 80 * (3 * PI + 40);
    ok(allOk(r) && rel(r.stats.volume, vRel, 1e-9), `offsets 10 and 10: the flange is 80 long and two reliefs 2 × 4 × 2 are cut: ${vRel.toFixed(6)} (${r.stats.volume.toFixed(6)})${allOk(r) ? '' : ' — ' + why(r)}`);
    fl.relief = 'none'; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 12000 + 80 * (3 * PI + 40), 1e-9), 'relief none: no slots');
    fl.offsets = [60, 50]; r = xb(part);
    ok(!allOk(r) && /offsets leave nothing/.test(why(r)), `offsets longer than the edge refused: "${why(r)}"`);
    // no base flange before it
    const lone = P.newPart('Lone');
    const lsk = sketchOn(lone, (s) => S.addRect(s, [0, 0], [10, 10]));
    const ex = P.addFeature(lone, 'extrude', { sketch: lsk.id, depth: 2 });
    P.addFeature(lone, 'sheetflange', { edge: { faces: [`${ex.id}.end`, `${ex.id}.side:x`], at: [5, 10, 2] }, angle: 90, length: 5 });
    r = xb(lone);
    ok(!allOk(r) && /needs a base flange before it/.test(why(r)), `a flange with no base flange before it: "${why(r)}"`);
    // the edge of a curved face
    ({ part, base, edge } = plate());
    P.addFeature(part, 'sheetflange', { edge: { faces: [`${base.id}.end`, `${base.id}.side:nope`], at: [50, 60, 2] }, angle: 90, length: 5 });
    r = xb(part);
    ok(!allOk(r) && /edge it uses is gone/.test(why(r)), `a flange whose edge is gone says so: "${why(r)}"`);
  }

  // ======================================================================================
  section('sheet metal: the flat pattern (sheet-flat.js) and its DXF');
  {
    const FL = await import(DEV + 'sheet-flat.js');
    const EX = await import(DEV + 'export.js');
    const plate = () => {
      const part = P.newPart('Bracket');
      let top = null;
      const sk = sketchOn(part, (s) => { S.addRect(s, [0, 0], [100, 60]); top = s.entities.filter((e) => e.type === 'line')[2].id; });
      const base = P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2, r: 2, k: 0.44 });
      return { part, base, edge: { faces: [`${base.id}.end`, `${base.id}.side:${top}`], at: [50, 60, 2] } };
    };
    const BA = (deg) => (deg * PI / 180) * (2 + 0.44 * 2);
    const types = (fl) => fl.segs.reduce((m, s) => ({ ...m, [s.type]: (m[s.type] || 0) + 1 }), {});
    // a plate alone: itself
    let { part, base, edge } = plate();
    let fl = FL.sheetFlat(part, oc);
    ok(fl.kind === 'plate' && rel(fl.area, 6000) && types(fl).line === 4 && !fl.bends.length, 'a plate alone lays flat as itself: 100 × 60, four lines, no bends');
    // + a 90° flange 20 long: the strip is the bend allowance (π/2)(r + k t) + 20 wide
    let f = P.addFeature(part, 'sheetflange', { edge, angle: 90, length: 20 });
    fl = FL.sheetFlat(part, oc);
    let bl = fl.bends[0];
    ok(rel(fl.area, 100 * (60 + BA(90) + 20)) && types(fl).line === 4 && near(fl.box.y1, 80 + BA(90), 1e-9) && near(fl.box.x1, 100, 1e-9), `90° flange: one rectangle 100 × (60 + ${BA(90).toFixed(6)} + 20), the seams merged into four lines (area ${fl.area.toFixed(6)})`);
    ok(fl.bends.length === 1 && near(bl.a[1], 60 + BA(90) / 2, 1e-9) && near(bl.b[1], 60 + BA(90) / 2, 1e-9) && near(Math.abs(bl.a[0] - bl.b[0]), 100, 1e-9) && bl.up && bl.angle === 90 && bl.r === 2, 'its bend line runs the whole edge in the middle of the bend (y 60 + BA/2), UP 90° R2');
    // offsets 10 / 10 with reliefs 2 × (r + t)
    f.offsets = [10, 10];
    fl = FL.sheetFlat(part, oc); bl = fl.bends[0];
    ok(rel(fl.area, 6000 - 2 * 2 * 4 + 80 * (BA(90) + 20)) && types(fl).line === 12 && near(Math.min(bl.a[0], bl.b[0]), 10, 1e-9) && near(Math.max(bl.a[0], bl.b[0]), 90, 1e-9), `offsets 10 / 10: the strip is 80 wide, the two 2 × 4 reliefs are notches in the plate — 12 lines, area ${fl.area.toFixed(6)}; the bend line from x 10 to 90`);
    f.offsets = [0, 0]; f.flip = true;
    fl = FL.sheetFlat(part, oc);
    ok(rel(fl.area, 100 * (60 + BA(90) + 20)) && !fl.bends[0].up, 'flipped: the same flat, the bend marked DOWN');
    f.flip = false; f.angle = 45;
    fl = FL.sheetFlat(part, oc);
    ok(rel(fl.area, 100 * (60 + BA(45) + 20)) && near(fl.bends[0].a[1], 60 + BA(45) / 2, 1e-9), `45°: the allowance is (π/4)(2 + 0.88) = ${BA(45).toFixed(6)}`);
    f.angle = 90;
    // a hole through the plate and one through the flange's leg (Ø6 along Y at x 50, z 14: 10 up the leg, which starts at z 2 + r)
    const hs = sketchOn(part, (s) => S.addCircle(s, [30, 30], 5));
    P.addFeature(part, 'extrude', { sketch: hs.id, op: 'cut', end: 'mid', depth: 10 });
    const ls = (() => { const sk = S.newSketch(); S.addCircle(sk, [50, -14], 3); return P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); })();
    P.addFeature(part, 'extrude', { sketch: ls.id, op: 'cut', end: 'mid', depth: 200 });
    const rr = xb(part);
    ok(allOk(rr), 'two holes cut after the flange' + (allOk(rr) ? '' : ': ' + why(rr)));
    fl = FL.sheetFlat(part, oc);
    const circles = fl.segs.filter((s) => s.type === 'circle');
    const plateHole = circles.find((c) => near(c.r, 5, 1e-9)), legHole = circles.find((c) => near(c.r, 3, 1e-9));
    ok(circles.length === 2 && plateHole && near(plateHole.c[0], 30, 1e-6) && near(plateHole.c[1], 30, 1e-6), 'the plate\'s hole is a circle in the flat where it was drawn (30, 30) R5');
    ok(legHole && near(legHole.c[0], 50, 1e-6) && near(legHole.c[1], 60 + BA(90) + 10, 1e-6), `the leg's hole comes along unfolded: centre (50, 60 + BA + 10) = (50, ${legHole ? legHole.c[1].toFixed(6) : '?'}) R3`);
    ok(rel(fl.area, 100 * (60 + BA(90) + 20) - 25 * PI - 9 * PI, 1e-9), 'area less both holes');
    // the DXF, read back by ezdxf
    const dxf = EX.dxfFlat(fl);
    ok(dxf.counts.line === 4 && dxf.counts.circle === 2 && dxf.counts.bend === 1 && dxf.counts.text === 1, `DXF: 4 lines and 2 circles on OUTLINE, 1 bend line, 1 note (${JSON.stringify(dxf.counts)})`);
    const PY = path.join(HERE, 'venv/bin/python');
    if (fs.existsSync(PY)) {
      const f1 = path.join(REPO, 'tmp', 'partcraft-flat.dxf');
      fs.mkdirSync(path.dirname(f1), { recursive: true });
      fs.writeFileSync(f1, dxf.text);
      const { execFileSync } = await import('node:child_process');
      const out = JSON.parse(execFileSync(PY, ['-c', `import sys, json, ezdxf
d = ezdxf.readfile(sys.argv[1]); m = d.modelspace()
au = d.audit()
lines = [[list(e.dxf.start)[:2], list(e.dxf.end)[:2]] for e in m.query('LINE[layer=="OUTLINE"]')]
circ = [[list(e.dxf.center)[:2], e.dxf.radius] for e in m.query('CIRCLE')]
bend = [e for e in m.query('LINE[layer=="BEND"]')]
txt = [e.plain_text() for e in m.query('TEXT')]
print(json.dumps({'errors': len(au.errors), 'lines': lines, 'circles': circ, 'bends': len(bend), 'bendLt': d.layers.get('BEND').dxf.linetype, 'text': txt, 'units': d.header.get('$INSUNITS')}))`, f1], { encoding: 'utf8' }));
      const xs = out.lines.flat().map((p) => p[0]), ys = out.lines.flat().map((p) => p[1]);
      ok(out.errors === 0 && out.lines.length === 4 && near(Math.max(...ys), 80 + BA(90), 1e-9) && near(Math.max(...xs), 100, 1e-9) && out.circles.length === 2 && out.bends === 1 && out.bendLt === 'DASHED' && out.units === 4, `ezdxf reads the DXF with no audit errors: the outline 100 × ${(80 + BA(90)).toFixed(6)} mm, 2 circles, the bend line on dashed layer BEND, units mm`);
      ok(out.text.length === 1 && /^UP 90° R2$/.test(out.text[0]), `the bend note reads "${out.text[0]}"`);
    } else skip('ezdxf not installed (tools/partcraft-test/venv)');
    // a bent U base: the developed rectangle
    const u = P.newPart('Channel');
    const us = sketchOn(u, (s) => chain(s, [[0, 30], [0, 0], [40, 0], [40, 30]]));
    P.addFeature(u, 'sheetbase', { sketch: us.id, t: 2, r: 2, k: 0.44, depth: 50 });
    fl = FL.sheetFlat(u, oc);
    const L = 84 + 2 * (PI / 2) * 2.88;
    ok(fl.kind === 'bent' && rel(fl.area, L * 50) && fl.bends.length === 2 && near(fl.bends[0].a[0], 26 + (PI / 2) * 2.88 / 2, 1e-9) && fl.bends.every((b) => !b.up), `bent U channel: ${L.toFixed(6)} × 50 with two bend lines (first at ${fl.bends[0].a[0].toFixed(4)}); seen from the drawn (outside) face both bends go DOWN`);
    // flanges on a bent base: refused in words
    const err = (() => { try { FL.sheetFlat(u, oc); P.addFeature(u, 'sheetflange', { edge: { faces: ['f2.side:s0', 'f2.end'], at: [0, 15, 50] }, angle: 90, length: 5 }); FL.sheetFlat(u, oc); return ''; } catch (e) { return e.message; } })();
    ok(err === '' || /cannot be laid flat yet/.test(err), `an edge flange on a bent base flange: ${err ? '"' + err + '"' : 'the flange did not build, so the flat is the channel'}`);
    const none = (() => { try { FL.sheetFlat(P.newPart('Empty'), oc); return ''; } catch (e) { return e.message; } })();
    ok(/needs a base flange/.test(none), `no base flange: "${none}"`);
  }

  // ======================================================================================
  section('sheet metal: the file');
  {
    const part = P.newPart('File');
    let top = null;
    const sk = sketchOn(part, (s) => { S.addRect(s, [0, 0], [100, 60]); top = s.entities.filter((e) => e.type === 'line')[2].id; });
    const base = P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 1.5, r: 3, k: 0.4 });
    P.addFeature(part, 'sheetflange', { edge: { faces: [`${base.id}.end`, `${base.id}.side:${top}`], at: [50, 60, 1.5] }, angle: 120, length: 12, offsets: [5, 0], relief: 'rect', reliefWidth: 1.5 });
    ok(P.fileVersion(part) === 3, 'a part with sheet metal is file version 3');
    const back = P.readPart(JSON.stringify({ ...part, version: P.fileVersion(part) }));
    const b2 = back.features[1], f2 = back.features[2];
    ok(b2.type === 'sheetbase' && b2.t === 1.5 && b2.r === 3 && b2.k === 0.4 && f2.type === 'sheetflange' && f2.angle === 120 && f2.offsets[0] === 5 && f2.reliefWidth === 1.5 && f2.edge.faces[0] === `${base.id}.end`, 'base and edge flange round-trip through the file');
    const bad = (mut) => { const j = JSON.parse(JSON.stringify({ ...part, version: 3 })); mut(j); try { P.readPart(JSON.stringify(j)); return ''; } catch (e) { return e.message; } };
    ok(/thickness, radius, K-factor or depth is bad/.test(bad((j) => { j.features[1].k = 0.9; })) && /angle or length is bad/.test(bad((j) => { j.features[2].angle = 0; })) && /offsets is bad/.test(bad((j) => { j.features[2].offsets = [-1, 0]; })) && /relief is bad/.test(bad((j) => { j.features[2].relief = 'round'; })), 'tampered values refused: K 0.9, angle 0, a negative offset, an unknown relief');
    ok(bad((j) => { j.features[2].edge = { faces: ['f99.end', 'f2.side:x'] }; }) !== '', 'an edge naming a feature that is not in the file is refused');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  await runSheetMetalTests({ ok, section, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
