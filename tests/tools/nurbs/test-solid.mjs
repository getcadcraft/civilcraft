#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-solid.mjs — cc-nurbs 0.9 DC.54 (session nurbs-09): IGES trimmed faces (144 / 142), solids bounded by NURBS faces, and Booleans on
 * them through the vendored manifold-3d. Numbers are checked against closed forms; every result is sewn again from its exact faces.
 *
 *   node tools/nurbs/test-solid.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as N from '../../lib/nurbs/index.js';
import { Session } from '../../lib/nurbs-ui/session.js';
import { NURBS_KEYS } from './lang.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m + (x ? ' — ' + x : '')); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
const code = (f) => { try { f(); return null; } catch (e) { return e && e.code ? e.code : String(e); } };
const section = (name) => console.log('== ' + name);

const mod = await import(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await (mod.default || mod)(); M.setup();
const { solid: B } = N;

// ------------------------------------------------------------------------------------------------ IGES trimmed faces
section('iges');
{
  const plate = N.construct.ruled(N.curve.line([0, 0, 0], [100, 0, 0]), N.curve.line([0, 60, 0], [100, 60, 0])).surface;
  let d = N.doc.newDoc();
  const r1 = N.doc.add(d, 'surface', plate, { name: 'hole' }); d = r1.doc;
  d = N.doc.setTrim(d, r1.id, N.trim.addLoop(plate, null, N.trim.circleLoop(plate, 0.5, 0.5, 0.2, 96), { hole: true }));
  const r2 = N.doc.add(d, 'surface', plate, { name: 'ring' }); d = r2.doc;
  let t2 = N.trim.addLoop(plate, null, N.trim.circleLoop(plate, 0.5, 0.5, 0.4, 128));
  t2 = N.trim.addLoop(plate, t2, N.trim.circleLoop(plate, 0.5, 0.5, 0.1, 64), { hole: true });
  d = N.doc.setTrim(d, r2.id, t2);
  d = N.doc.add(d, 'surface', plate, { name: 'plain' }).doc;
  d = N.doc.add(d, 'curve', N.curve.line([0, 0, 5], [10, 0, 5])).doc;
  const txt = N.iges.writeIges(d, { time: '2026-11-02T00:00:00' });
  ok(/^ {5}144 /m.test(txt) && /^ {5}142 /m.test(txt), 'trimmed surfaces are written as 144 with 142 bounds');
  ok((txt.match(/^ {5}144 /mg) || []).length === 4, 'one 144 per trimmed surface (two DE lines each)', String((txt.match(/^ {5}144 /mg) || []).length));
  const back = N.iges.readIges(txt);
  ok(back.items.length === 4, 'read back: 3 surfaces + 1 curve, no bound curve read as a curve of its own', back.items.map((i) => i.kind).join(','));
  const area = (it) => N.trim.area(it.surface, it.trim || null, { tol: 0.05 });
  for (const k of [0, 1, 2]) ok(rel(area(back.items[k]), area(d.items[k])) < 1e-9, 'area kept: ' + d.items[k].name, area(back.items[k]) + ' vs ' + area(d.items[k]));
  ok(back.items[0].trim && !back.items[0].trim.outer && back.items[0].trim.holes.length === 1, 'a hole only stays a hole only (144 N1 = 0)');
  ok(back.items[1].trim && back.items[1].trim.outer && back.items[1].trim.holes.length === 1, 'outer + hole read back');
  ok(!back.items[2].trim, 'the untrimmed surface stays untrimmed (128)');
  // a bound given only in model space (the 142's (u, v) pointer 0): projected onto the surface
  const P = txt.split('\n');
  const de142 = P.filter((l) => l[72] === 'D' && /^ {5}142 /.test(l));
  const first = +de142[0].slice(8, 16);
  const pl = P.findIndex((l) => l[72] === 'P' && +l.slice(73) === first);
  P[pl] = P[pl].replace(/^142,0,(\d+),(\d+),(\d+),1;/, (m, sp, bp, cp) => ('142,0,' + sp + ',0,' + cp + ',2;').padEnd(m.length, ' '));
  const back2 = N.iges.readIges(P.join('\n'));
  ok(rel(area(back2.items[0]), area(d.items[0])) < 1e-3, 'a bound with only its model-space curve is projected into (u, v)', area(back2.items[0]) + ' vs ' + area(d.items[0]));
  // an older file (126 / 128 only) reads as before
  const plainDoc = { ...d, items: d.items.filter((i) => !i.trim) };
  const old = N.iges.readIges(N.iges.writeIges(plainDoc));
  ok(old.items.length === 2 && !/ 144 /.test(N.iges.writeIges(plainDoc)), 'untrimmed patch sets are written and read as before');
  // corrupted copies: read or refused with a code, nothing else thrown
  let other = 0;
  for (let cut = 200; cut < txt.length; cut += Math.floor(txt.length / 40)) { const c = code(() => N.iges.readIges(txt.slice(0, cut))); if (c && !String(c).startsWith('nurbs.err.')) other++; }
  ok(other === 0, 'cut-off IGES copies: read or refused with a nurbs.err code', String(other));
}

// ------------------------------------------------------------------------------------------------ sewing and primitives
section('sew');
{
  let d = N.doc.newDoc();
  const bx = B.box(d, { corner: [0, 0, 0], size: [100, 60, 40] }); d = bx.doc;
  ok(bx.report.closed && Math.abs(bx.report.volume - 240000) < 1e-6 && Math.abs(bx.report.area - 2 * (6000 + 4000 + 2400)) < 1e-6, 'box: closed, volume and area exact', bx.report.volume + ' ' + bx.report.area);
  const cy = B.cylinder(d, { base: [50, 30, -10], radius: 15, height: 60 }); d = cy.doc;
  const vc = Math.PI * 225 * 60;
  ok(cy.report.closed && rel(cy.report.volume, vc) < 2e-3 && cy.report.volume < vc, 'cylinder: closed, volume within the chord tolerance (inscribed)', cy.report.volume + ' vs ' + vc);
  ok(cy.report.maxGap < 0.05, 'cylinder: caps meet the side within the tolerance', String(cy.report.maxGap));
  const sp = B.sphere(N.doc.newDoc(), { center: [1, 2, 3], radius: 25 });
  const vs = 4 / 3 * Math.PI * 25 ** 3;
  ok(sp.report.closed && rel(sp.report.volume, vs) < 5e-3, 'sphere (poles and a seam): closed', sp.report.volume + ' vs ' + vs);
  const fine = B.sew(N.solid.facesOf(sp.doc, sp.id), { tol: 0.005 });
  ok(fine.closed && rel(fine.volume, vs) < rel(sp.report.volume, vs) / 5, 'a finer tolerance comes closer to the exact volume', fine.volume + '');
  // one face left out: open, said in numbers
  const faces = N.solid.facesOf(d, bx.id).slice(1);
  const sw = B.sew(faces, { tol: 0.05 });
  ok(!sw.closed && sw.openEdges > 0, 'five box faces are open', String(sw.openEdges));
  const plain = { ...d, items: d.items.filter((i) => i.kind === 'surface'), solids: undefined };
  delete plain.solids;
  ok(code(() => B.addSolid(plain, faces.map((f) => f.id))) === 'nurbs.err.solid_open', 'a solid from five box faces is refused (solid_open)');
  ok(code(() => B.addSolid(d, [N.solid.facesOf(d, bx.id)[0].id])) === 'nurbs.err.solid_taken', 'a face already in a solid is refused (solid_taken)');
  ok(code(() => B.box(d, { size: [0, 1, 1] })) === 'nurbs.err.solid_size', 'a zero size is refused');
  // the bake mesh: closed, outward, its volume
  const m = B.mesh(d, cy.id);
  let v = 0;
  for (let i = 0; i < m.indices.length; i += 3) {
    const p = [0, 1, 2].map((k) => [m.positions[m.indices[i + k] * 3], m.positions[m.indices[i + k] * 3 + 1], m.positions[m.indices[i + k] * 3 + 2]]);
    v += (p[0][0] * (p[1][1] * p[2][2] - p[1][2] * p[2][1]) - p[0][1] * (p[1][0] * p[2][2] - p[1][2] * p[2][0]) + p[0][2] * (p[1][0] * p[2][1] - p[1][1] * p[2][0])) / 6;
  }
  ok(v > 0 && rel(v, cy.report.volume) < 1e-9, 'mesh(): outward triangles, the same volume', v + ' vs ' + cy.report.volume);
  // PartCraft's own mesh check (the bake's path) agrees that it is closed
  const MI = await import(path.join(ROOT, 'public_html/assets/apps/partcraft/dev/meshimport.js'));
  const rep = MI.repairMesh({ positions: m.positions, indices: m.indices }).report;
  ok(rep.closed && rep.openEdges === 0 && rep.flipped === 0, 'PartCraft repairMesh finds the bake mesh closed, nothing flipped', JSON.stringify({ c: rep.closed, o: rep.openEdges, f: rep.flipped, w: rep.welded }));
}

// ------------------------------------------------------------------------------------------------ Booleans
section('boolean');
const check = (lbl, r, want, { volTol }) => {
  const R = r.report;
  ok(R.closedAgain && R.openAgain === 0, lbl + ': the result faces close again from their exact surfaces');
  ok(rel(R.volume, want) < volTol, lbl + ': volume vs closed form within ' + (volTol * 100) + ' %', R.volume.toFixed(2) + ' vs ' + want.toFixed(2));
  ok(rel(R.volumeAgain, R.volume) < 1e-3, lbl + ': the re-sewn faces hold the engine\'s volume', R.volumeAgain.toFixed(2) + ' vs ' + R.volume.toFixed(2));
  ok(R.residual < 1e-5, lbl + ': intersection points lie on both exact surfaces', R.residual.toExponential(2) + ' mm');
  ok(R.deviation <= R.tol, lbl + ': the engine\'s points moved no more than the tolerance', R.deviation.toFixed(5) + ' mm');
};
{
  let d = N.doc.newDoc();
  d = B.box(d, { corner: [0, 0, 0], size: [100, 60, 40] }).doc;
  d = B.cylinder(d, { base: [50, 30, -10], radius: 15, height: 60 }).doc;
  const r = B.boolean(M, d, 'b1', 'b2', 'subtract');
  check('box − cylinder', r, 100 * 60 * 40 - Math.PI * 225 * 40, { volTol: 5e-4 });
  const faces = N.solid.facesOf(r.doc, r.id);
  ok(faces.length === 7, 'box − cylinder: 6 box faces + the inside of the hole', String(faces.length));
  ok(faces.filter((f) => f.trim && f.trim.holes.length === 1 && !f.trim.outer).length === 2, 'top and bottom get a round hole (no outer loop: they keep their edges)');
  ok(!N.solid.solid(r.doc, 'b1') && !N.solid.solid(r.doc, 'b2') && N.solid.solids(r.doc).length === 1, 'the two inputs are replaced by the result');
  const kept = B.boolean(M, d, 'b1', 'b2', 'subtract', { keep: true });
  ok(N.solid.solids(kept.doc).length === 3, 'keep: the inputs stay beside the result');
  // the result in STEP and back: the same faces and areas
  const st = N.step.readStep(N.step.writeStep(r.doc, { time: '2026-11-02T00:00:00' }));
  const A = (it) => N.trim.area(it.surface, it.trim || null, { tol: 0.05 });
  const a0 = faces.reduce((s, f) => s + A(f), 0), a1 = st.items.filter((i) => i.kind === 'surface').reduce((s, f) => s + A(f), 0);
  // STEP holds the bound in space (followed on the surface to 0.001 mm), so it reads back as a dense loop: the cut mesh differs a little
  ok(st.items.filter((i) => i.trim).length === 3 && rel(a1, a0) < 2e-4, 'STEP round trip keeps the result faces and their trims', a1 + ' vs ' + a0);
  const ig = N.iges.readIges(N.iges.writeIges(r.doc));
  // a solid is one 186 since nurbs-s3-09: its bounds are the shared edges' polylines (followed on the surface), like STEP
  ok(rel(ig.items.reduce((s, f) => s + A(f), 0), a0) < 2e-4 && N.solid.solids(ig).length === 1, 'IGES round trip keeps them too (as one solid, within 0.02 %)');
  // chained: then a sphere off a corner
  let d2 = B.sphere(r.doc, { center: [100, 60, 40], radius: 20 }).doc;
  const c2 = B.boolean(M, d2, r.id, N.solid.solids(d2).at(-1).id, 'subtract');
  check('chained (− a corner sphere)', c2, 100 * 60 * 40 - Math.PI * 225 * 40 - 4 / 3 * Math.PI * 8000 / 8, { volTol: 1e-3 });
}
{
  const R = 25, r = 10;
  const Vsc = 4 * Math.PI / 3 * (R ** 3 - (R * R - r * r) ** 1.5), Vs = 4 / 3 * Math.PI * R ** 3, Vc = Math.PI * r * r * 80;
  const want = { union: Vs + Vc - Vsc, subtract: Vs - Vsc, intersect: Vsc };
  for (const op of ['union', 'subtract', 'intersect']) {
    let d = B.sphere(N.doc.newDoc(), { center: [0, 0, 0], radius: R }).doc;
    d = B.cylinder(d, { base: [0, 0, -40], radius: r, height: 80 }).doc;
    const res = B.boolean(M, d, 'b1', 'b2', op);
    check('sphere ' + op + ' cylinder', res, want[op], { volTol: 5e-3 });
  }
  let d = B.box(N.doc.newDoc(), { corner: [0, 0, 0], size: [10, 10, 10] }).doc;
  d = B.box(d, { corner: [50, 0, 0], size: [10, 10, 10] }).doc;
  ok(code(() => B.boolean(M, d, 'b1', 'b2', 'intersect')) === 'nurbs.err.bool_empty', 'two boxes apart: intersect is refused as empty');
  const u = B.boolean(M, d, 'b1', 'b2', 'union');
  ok(u.report.closedAgain && Math.abs(u.report.volume - 2000) < 1e-3 && u.report.faces === 12, 'two boxes apart: union = one solid of both (12 faces)', u.report.volume + ' ' + u.report.faces);
  ok(code(() => B.boolean(M, d, 'b1', 'b1', 'union')) === 'nurbs.err.bool_same', 'the same solid twice is refused');
  ok(code(() => B.boolean(null, d, 'b1', 'b2', 'union')) === 'nurbs.err.bool_engine', 'no engine: refused in words');
  ok(code(() => B.boolean(M, d, 'b1', 'zz', 'union')) === 'nurbs.err.no_solid', 'an unknown solid is refused');
}

// ------------------------------------------------------------------------------------------------ the patch set
section('doc');
{
  let d = B.box(N.doc.newDoc(), { size: [10, 20, 30] }).doc;
  ok(N.doc.toJSON(N.doc.newDoc()).indexOf('solids') < 0, 'a patch set without solids is written exactly as before (no solids key)');
  const j = JSON.parse(N.doc.toJSON(d));
  const back = N.doc.fromJSON(JSON.stringify(j));
  ok(back.solids.length === 1 && back.solids[0].faces.length === 6, 'solids survive JSON');
  j.solids.push({ id: 'b9', faces: ['nope'] }, { id: 's1', faces: ['s2'] }, { id: 'b8', faces: [j.solids[0].faces[0]] }, 'junk', { id: '../x', faces: ['s3'] });
  const cl = N.doc.cleanDoc(j);
  ok(cl.solids.length === 1, 'untrusted solids: unknown faces, ids taken by items, a face in two solids, junk — left out', JSON.stringify(cl.solids.map((b) => b.id)));
  const rm = N.doc.remove(d, d.items[0].id);
  ok(!rm.solids, 'removing a face takes its solid group away (the rest are plain surfaces)');
  // an older reader ignores the key: the faces are still there as surfaces
  ok(N.doc.surfaces(back).length === 6, 'the faces are ordinary surfaces in the file');
  const ug = B.removeSolid(d, 'b1');
  ok(!ug.solids && ug.items.length === 6, 'ungroup keeps the faces');
  ok(B.removeSolid(d, 'b1', { faces: true }).items.length === 0, 'delete with faces removes them');
}

// ------------------------------------------------------------------------------------------------ commands and the panel session
section('tools');
{
  const s = new Session(N);
  s.start('solid.box'); ok(s.need() === null, 'Box solid needs nothing picked');
  ok(s.setOption('size', '100, 60, 40') === null && s.run('box').ok, 'Box solid runs from typed options');
  s.start('solid.cylinder');
  s.setOption('base', '50 30 -10'); s.setOption('radius', '15'); s.setOption('height', '60');
  ok(s.setOption('radius', '-1') && s.setOption('radius', '15') === null, 'a negative radius is refused in the field');
  ok(s.run('cyl').ok, 'Cylinder solid runs');
  s.start('solid.subtract');
  ok(s.need().kind === 'solid', 'Subtract asks for a solid');
  const boxFace = N.solid.solid(s.doc, 'b1').faces[2];
  ok(s.pick({ id: boxFace }) && s.picks[0].id === 'b1', 'a click on one of its faces picks the solid');
  ok(!s.pick({ id: 'b1' }), 'the same solid twice is not taken');
  ok(s.pick({ id: 'b2' }), 'a solid by its own id');
  const noEngine = s.run('sub');
  ok(!noEngine.ok && noEngine.error.key === 'nurbs.err.bool_engine', 'without the engine: refused, nothing changed');
  s.start('solid.subtract'); s.pick({ id: 'b1' }); s.pick({ id: 'b2' });
  s.env.manifold = M;
  const r = s.run('sub');
  ok(r.ok && r.report.op === 'subtract' && r.ids.length === 7, 'with the engine: the Boolean runs (one history step)', JSON.stringify(r.error || ''));
  ok(s.undo() && N.solid.solids(s.doc).length === 2, 'Undo brings the two solids back');
  ok(s.redo() && N.solid.solids(s.doc).length === 1, 'Redo');
  // solid.make: none picked = every shown surface not in a solid yet
  const s2 = new Session(N);
  s2.start('solid.box'); s2.run('box');
  s2.removeSolid('b1');
  s2.start('solid.make');
  ok(s2.need() === null && s2.extra() === 'surface', 'Solid from surfaces is ready at once and takes extra picks');
  const mk = s2.run('make');
  ok(mk.ok && N.solid.solids(s2.doc).length === 1, 'Solid from surfaces groups the six shown faces');
  // import keeps trims and solids
  const s3 = new Session(N);
  ok(s3.importDoc(s.doc).ok && N.solid.solids(s3.doc).length === 1 && s3.doc.items.some((i) => i.trim), 'import keeps trims and solids');
  ok(N.tools.panel(s.doc).solids.length === 1, 'panel() lists the solids');
}

// ------------------------------------------------------------------------------------------------ words
section('lang');
{
  const ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/nurbs-ui/words.json'), 'utf8'));
  const src = ['solid.js', 'iges.js', 'tools.js', 'trim.js'].map((f) => fs.readFileSync(path.join(ROOT, 'lib/nurbs', f), 'utf8')).join('\n');
  const codes = [...new Set(src.match(/nurbs\.err\.[a-z_0-9]+(?![\w*])/g))];
  const missing = codes.filter((c) => !NURBS_KEYS[c]);
  ok(!missing.length, 'every nurbs.err code the library throws has words', missing.join(', '));
  const cmds = Object.values(N.tools.COMMANDS).map((c) => c.label).filter((k) => !NURBS_KEYS[k]);
  ok(!cmds.length, 'every command has a name', cmds.join(', '));
  const panel = fs.readFileSync(path.join(ROOT, 'lib/nurbs-ui/panel.js'), 'utf8');
  const uiKeys = [...new Set(panel.match(/'nurbs\.ui\.solid\.[a-z_]+'|'nurbs\.ui\.g\.solids'|'nurbs\.ui\.solids'/g))].map((k) => k.slice(1, -1));
  const noWords = uiKeys.filter((k) => !ui[k]);
  ok(!noWords.length && ui['nurbs.ui.need.solid'] && ui['nurbs.ui.need.more_surface'], 'the panel\'s solid words are in words.json', noWords.join(', '));
  for (const k of ['corner', 'size', 'base', 'center', 'radius', 'height', 'keep', 'axis', 'tol']) ok(!!ui['nurbs.ui.opt.' + k], 'option label nurbs.ui.opt.' + k);
  const es = Object.entries(ui).filter(([k, v]) => k.includes('solid') && v[2] !== null && !(v[2] && v[2] !== v[0]));   // null: English only until the language round (0.9 rule 57)
  ok(!es.length, 'es-MX drafts for the solid words', es.map(([k]) => k).join(', '));
}

console.log('solid: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
