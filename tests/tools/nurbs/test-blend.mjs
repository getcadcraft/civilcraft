#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-blend.mjs — cc-nurbs 0.9 SU.747c (session nurbs-s3-09): fillets between faces of a NURBS solid (constant and variable radius,
 * convex and concave, round a closed edge), thickening a surface into a solid, a solid written to STEP as ONE closed shell and read back
 * (by our reader and by cc-step, lib/step, written by another session from the schemas), and the solids and Booleans as nodes.
 * Every number is checked against a closed form; the closed forms are derived in docs/0.9-sessions/nurbs-s3-09.md § Closed forms.
 *
 *   node tools/nurbs/test-blend.mjs [--verbose]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as N from '../../lib/nurbs/index.js';
import * as CS from '../../lib/step/read.js';
import { Session, argsFor } from '../../lib/nurbs-ui/session.js';
import { NURBS_KEYS } from './lang.mjs';
import { mount as nodesMount } from './nodes-mount.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, failN = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m + (x ? ' — ' + x : '')); } else { failN++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
const code = (f) => { try { f(); return null; } catch (e) { return e && e.code ? e.code : String(e); } };
const vars = (f) => { try { f(); return null; } catch (e) { return e && e.vars ? e.vars : null; } };
const section = (name) => console.log('== ' + name);
const log = (m) => console.log('  ' + m);
const f4 = (x) => (Math.round(x * 1e4) / 1e4).toString();

const mod = await import(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await (mod.default || mod)(); M.setup();
const { solid: B, blend: BL } = N;
const Q = 1 - Math.PI / 4;   // the corner left by a quarter circle in a unit square: 1 − π/4

const boxDoc = () => { const r = B.box(N.doc.newDoc(), { corner: [0, 0, 0], size: [100, 60, 40] }); return { doc: r.doc, id: r.id, f: B.solid(r.doc, r.id).faces }; };
// box faces in solid.box order: z0, z1, y0, y1, x0, x1 — the edge between z1 (top) and y0 (front) runs along x, 100 mm long

// ------------------------------------------------------------------------------------------------ fillet, constant radius
section('fillet: box edge, constant radius');
let filleted = null;
{
  const { doc, id, f } = boxDoc();
  const t0 = Date.now();
  const r = BL.fillet(M, doc, id, f[1], f[2], { radius: 5 });
  filleted = r;
  const fr = r.report.fillet, exact = 240000 - Q * 25 * 100;
  ok(fr.convex === true && fr.closedEdge === false, 'the top/front edge of a box is convex and has two ends');
  ok(Math.abs(fr.length - 100) < 1e-9, 'edge length 100 mm', f4(fr.length));
  ok(fr.deviation < 1e-9, 'fillet surface vs the ideal rolling ball (straight edge, exact arcs): 0 within 1e-9 mm', String(fr.deviation));
  ok(fr.tangent < 1e-6, 'meets both faces tangentially (largest normal angle along the touch lines, degrees)', String(fr.tangent));
  ok(r.report.closedAgain, 'the result sews again from its exact faces into one closed solid');
  ok(fr.face.length === 1, 'one fillet face in the result');
  const ff = r.doc.items.find((i) => i.id === fr.face[0]);
  const area = N.trim.area(ff.surface, ff.trim || null, { tol: 0.0005 });
  ok(rel(area, Math.PI / 2 * 5 * 100) < 1e-4, 'fillet face area = (π/2)·r·L = 785.398 mm² within 0.01 % (its own tessellation at 0.0005 mm)', f4(area));
  const removed = 240000 - r.report.volume, removedExact = Q * 25 * 100;
  ok(rel(removed, removedExact) < 0.03, 'removed volume (1 − π/4)·r²·L = 536.50 mm³ within 3 % at tol 0.05 (the mesh Boolean\'s chords)', f4(removed) + ' vs ' + f4(removedExact));
  const r2 = BL.fillet(M, doc, id, f[1], f[2], { radius: 5, tol: 0.01 });
  const removed2 = 240000 - r2.report.volume;
  ok(Math.abs(removed2 - removedExact) < Math.abs(removed - removedExact) / 3, 'a 5× finer tolerance comes ≥ 3× closer to the closed form', f4(removed2));
  log('box r 5: volume ' + f4(r.report.volume) + ' (closed form ' + f4(exact) + '), removed ' + f4(removed) + ' vs ' + f4(removedExact) + ' (' + f4((removed / removedExact - 1) * 100) + ' %), at tol 0.01 ' + f4(removed2) + ' (' + f4((removed2 / removedExact - 1) * 100) + ' %); face area ' + f4(area) + '; deviation ' + fr.deviation.toExponential(2) + ' mm; Boolean deviation ' + f4(r.report.deviation) + ', residual ' + r.report.residual.toExponential(2) + '; ' + (Date.now() - t0) + ' ms');
}

section('fillet: refused in words');
{
  const { doc, id, f } = boxDoc();
  const v = vars(() => BL.fillet(M, doc, id, f[1], f[2], { radius: 45 }));
  ok(code(() => BL.fillet(M, doc, id, f[1], f[2], { radius: 45 })) === 'nurbs.err.fillet_radius' && v && (v.name === f[1] || v.name === f[2]), 'radius 45 on a 40 mm high face: refused, naming the face', JSON.stringify(v));
  ok(code(() => BL.fillet(M, doc, id, f[0], f[1], { radius: 5 })) === 'nurbs.err.fillet_edge', 'top and bottom do not meet: no edge to round');
  ok(code(() => BL.fillet(M, doc, id, f[1], 'nope', { radius: 5 })) === 'nurbs.err.fillet_face', 'a face that is not in the solid');
  ok(code(() => BL.fillet(M, doc, id, f[1], f[2], { radius: 0 })) === 'nurbs.err.fillet_size', 'radius 0');
  ok(N.doc.item(doc, f[1]) && B.solid(doc, id), 'a refusal leaves the patch set as it was');
}

// ------------------------------------------------------------------------------------------------ fillet, variable radius
section('fillet: variable radius');
{
  const { doc, id, f } = boxDoc();
  const r = BL.fillet(M, doc, id, f[1], f[2], { radius: 3, radius2: 8 });
  const fr = r.report.fillet, removedExact = Q * 100 * (9 + 24 + 64) / 3;   // ∫ (1 − π/4) r(x)² dx, r linear 3 → 8 over 100 mm
  const removed = 240000 - r.report.volume;
  ok(fr.radius === 3 && fr.radius2 === 8, 'radius 3 at the start, 8 at the end');
  ok(fr.deviation <= 0.05 / 4, 'lofted surface within tol/4 of the ideal rolling ball (measured half-way between sections)', fr.deviation.toExponential(3) + ' mm, ' + fr.stations + ' sections');
  ok(fr.tangent < 0.01, 'tangent to both faces (degrees)', String(fr.tangent));
  ok(r.report.closedAgain, 'closes again');
  ok(rel(removed, removedExact) < 0.03, 'removed (1 − π/4)·L·(r0² + r0·r1 + r1²)/3 = 693.94 mm³ within 3 %', f4(removed));
  // the radius really changes: the fillet face's ends are quarter circles of r 3 and r 8 (x = 0 and x = 100)
  const ff = r.doc.items.find((i) => i.id === fr.face[0]);
  const ends = [0, 100].map((x) => { const tri = N.trim.tessellate(ff.surface, ff.trim, { tol: 0.002 }); let lo = Infinity, hi = -Infinity; for (let i = 0; i < tri.positions.length; i += 3) if (Math.abs(tri.positions[i] - x) < 1e-6) { lo = Math.min(lo, tri.positions[i + 2]); hi = Math.max(hi, tri.positions[i + 2]); } return 40 - lo; });
  ok(Math.abs(ends[0] - 3) < 0.01 && Math.abs(ends[1] - 8) < 0.01, 'the face drops 3 mm at x = 0 and 8 mm at x = 100 (its touch line on the front)', ends.map(f4).join(', '));
  log('variable 3 → 8: removed ' + f4(removed) + ' vs ' + f4(removedExact) + ' (' + f4((removed / removedExact - 1) * 100) + ' %), ' + fr.stations + ' sections, deviation ' + fr.deviation.toExponential(2) + ' mm');
  ok(code(() => { const c = B.cylinder(N.doc.newDoc(), { radius: 20, height: 40 }); const cf = B.solid(c.doc, c.id).faces; BL.fillet(M, c.doc, c.id, cf[0], cf[2], { radius: 3, radius2: 5 }); }) === 'nurbs.err.fillet_closed_var', 'a changing radius round a closed edge: refused');
}

// ------------------------------------------------------------------------------------------------ fillet round a closed edge
section('fillet: the rim of a cylinder (closed edge, a torus section)');
{
  const R = 20, H = 40, r = 4;
  const c = B.cylinder(N.doc.newDoc(), { radius: R, height: H }); const cf = B.solid(c.doc, c.id).faces;
  const before = B.sew(B.facesOf(c.doc, c.id)).volume;
  const t0 = Date.now();
  const res = BL.fillet(M, c.doc, c.id, cf[0], cf[2], { radius: r });
  const fr = res.report.fillet;
  // Pappus: the corner (1 − π/4)·r² turned about the axis at the radius of its centroid, R − r + (r/6)/(1 − π/4)
  const removedExact = 2 * Math.PI * (R - r + (r / 6) / Q) * r * r * Q;
  const removed = before - res.report.volume;
  ok(fr.closedEdge && fr.convex, 'the top rim is one closed convex edge');
  ok(fr.deviation <= 0.05 / 4, 'within tol/4 of the rolling ball', fr.deviation.toExponential(3) + ' mm');
  ok(fr.tangent < 0.1, 'tangent to side and top (degrees)', String(fr.tangent));
  ok(res.report.closedAgain, 'closes again');
  ok(rel(removed, removedExact) < 0.05, 'removed volume by Pappus 412.24 mm³ within 5 %', f4(removed) + ' vs ' + f4(removedExact));
  const ff = res.doc.items.find((i) => i.id === fr.face[0]);
  const areaExact = 2 * Math.PI * r * (R - r) * Math.PI / 2 + 2 * Math.PI * r * r;   // Pappus on the quarter arc: length πr/2, centroid at R − r + 2r/π
  const area = N.trim.area(ff.surface, ff.trim || null, { tol: 0.002 });
  ok(rel(area, areaExact) < 2e-3, 'fillet face area by Pappus 2π·(R − r + 2r/π)·πr/2 = ' + f4(areaExact) + ' mm²', f4(area));
  log('cylinder R 20 rim r 4: removed ' + f4(removed) + ' vs ' + f4(removedExact) + ' (' + f4((removed / removedExact - 1) * 100) + ' %), face area ' + f4(area) + ' vs ' + f4(areaExact) + ', ' + fr.stations + ' sections, deviation ' + fr.deviation.toExponential(2) + ' mm, tangent ' + fr.tangent.toExponential(2) + '°, ' + (Date.now() - t0) + ' ms');
}

// ------------------------------------------------------------------------------------------------ concave
section('fillet: an inside corner (concave: material added)');
{
  let d = N.doc.newDoc();
  const a = B.box(d, { corner: [0, 0, 0], size: [100, 60, 20] }); d = a.doc;
  const b = B.box(d, { corner: [0, 0, 20], size: [100, 30, 30] }); d = b.doc;
  const u = B.boolean(M, d, a.id, b.id, 'union'); d = u.doc;
  const centre = (it) => { const t = N.trim.tessellate(it.surface, it.trim || null, { tol: 0.1 }); const c = [0, 0, 0], n = t.positions.length / 3; for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += t.positions[i * 3 + k] / n; return c; };
  const fs2 = B.facesOf(d, u.id).map((it) => [it.id, centre(it)]);
  const floor = fs2.find(([, c]) => Math.abs(c[2] - 20) < 1e-6 && c[1] > 30)[0], wall = fs2.find(([, c]) => Math.abs(c[1] - 30) < 1e-6 && c[2] > 20)[0];
  const res = BL.fillet(M, d, u.id, floor, wall, { radius: 5 });
  const fr = res.report.fillet, added = res.report.volume - 210000, addedExact = Q * 25 * 100;
  ok(fr.convex === false, 'the floor/wall edge of an L is concave');
  ok(res.report.closedAgain, 'closes again');
  ok(rel(added, addedExact) < 0.03, 'added (1 − π/4)·r²·L = 536.50 mm³ within 3 %', f4(added));
  const fine = B.sew(B.facesOf(res.doc, res.id), { tol: 0.002 });
  ok(fine.closed && rel(fine.volume - 210000, addedExact) < 2e-3, 'its exact faces sewn at 0.002 mm: added volume within 0.2 % (the ends are flush, so the faces close at any tolerance)', f4(fine.volume - 210000));
  log('L inside corner r 5: added ' + f4(added) + ' (engine), ' + f4(fine.volume - 210000) + ' (exact faces at 0.002 mm) vs ' + f4(addedExact));
}

// ------------------------------------------------------------------------------------------------ thicken
section('thicken');
{
  const plate = N.construct.planarPatch([[0, 0, 0], [100, 0, 0], [100, 60, 0], [0, 60, 0]]);
  let d = N.doc.newDoc(); const a = N.doc.add(d, 'surface', plate, { name: 'plate' }); d = a.doc;
  const r = BL.thicken(d, a.id, { thickness: 5 });
  ok(r.report.closed && Math.abs(r.report.volume - 30000) < 1e-6, 'a 100 × 60 plate 5 mm thick: 30 000 mm³', f4(r.report.volume));
  ok(!N.doc.item(r.doc, a.id) && B.solid(r.doc, r.id).faces.length === 6, 'the surface becomes the solid\'s first face (6 faces: two sides, four walls)');
  const r2 = BL.thicken(d, a.id, { thickness: 5, side: -1 });
  ok(Math.abs(r2.report.volume - 30000) < 1e-6, 'the other side: the same volume', f4(r2.report.volume));
  // with a hole: the hole's wall follows the trim
  let h = N.doc.newDoc(); const ha = N.doc.add(h, 'surface', plate); h = ha.doc;
  h = N.doc.setTrim(h, ha.id, N.trim.addLoop(plate, null, N.trim.circleLoop(plate, 0.5, 0.5, 0.2, 128), { hole: true }));
  const holeArea = N.trim.area(plate, N.doc.item(h, ha.id).trim, { tol: 0.001 });
  const rh = BL.thicken(h, ha.id, { thickness: 4 });
  ok(rh.report.closed && rel(rh.report.volume, holeArea * 4) < 1e-8, 'a trimmed plate (a hole) 4 mm thick: area × 4', f4(rh.report.volume) + ' vs ' + f4(holeArea * 4));
  ok(rh.report.faces === 7, 'faces: two sides, four outer walls, one hole wall', String(rh.report.faces));
  // a hemisphere: the shell between R and R + t (outward) or R − t (inward)
  const prof = N.curve.arc([0, 0, 0], [1, 0, 0], [0, 0, 1], 25, 0, Math.PI / 2);
  const hemi = N.construct.revolve(prof, [0, 0, 0], [0, 0, 1]).surface;
  let e = N.doc.newDoc(); const ea = N.doc.add(e, 'surface', hemi, { name: 'dome' }); e = ea.doc;
  const n0 = N.surface.normal(hemi, 0.5, 0.5), p0 = N.surface.point(hemi, 0.5, 0.5), out = n0[0] * p0[0] + n0[1] * p0[1] + n0[2] * p0[2] > 0 ? 1 : -1;
  for (const [side, R1, R2] of [[out, 28, 25], [-out, 25, 22]]) {
    const t0 = Date.now();
    const x = BL.thicken(e, ea.id, { thickness: 3, side });
    const exact = 2 * Math.PI / 3 * (R1 ** 3 - R2 ** 3);
    const fine = B.sew(B.facesOf(x.doc, x.id), { tol: 0.005 });
    ok(x.report.closed && fine.closed, 'hemisphere R 25 thickened 3 mm ' + (side === out ? 'outward' : 'inward') + ': closes (a seam and a pole need no wall)');
    ok(rel(fine.volume, exact) < 1e-3, 'volume (2π/3)(' + R1 + '³ − ' + R2 + '³) = ' + f4(exact) + ' mm³ within 0.1 % (faces sewn at 0.005 mm)', f4(fine.volume));
    ok(x.report.offset < 0.01, 'offset face at 3 mm from the dome within 0.01 mm where measured (between the fitting samples)', x.report.offset.toExponential(3));
    log('dome ' + (side === out ? 'out' : 'in') + ': volume ' + f4(fine.volume) + ' vs ' + f4(exact) + ' (' + ((fine.volume / exact - 1) * 100).toFixed(4) + ' %), offset fit ' + x.report.fit.toExponential(2) + ', measured ' + x.report.offset.toExponential(2) + ' mm, ' + (Date.now() - t0) + ' ms');
  }
  const fv = vars(() => BL.thicken(e, ea.id, { thickness: 30, side: -out }));
  ok(code(() => BL.thicken(e, ea.id, { thickness: 30, side: -out })) === 'nurbs.err.thicken_fold' && fv.name === 'dome' && Math.abs(fv.radius - 25) < 1e-6, 'inward by 30 on a radius-25 dome: refused, naming the surface and the radius it folds at', JSON.stringify(fv));
  // a spiral wall whose inner end runs about 6 mm from its start: no curve tighter than 20 mm, but 5 mm of thickness crosses the other part
  const sp = N.fit.interpolate([[0, 0, 0], [40, 0, 0], [75, 30, 0], [60, 70, 0], [20, 70, 0], [-10, 40, 0], [10, 9, 0], [45, 7, 0]], 3);
  let g = N.doc.newDoc(); const ga = N.doc.add(g, 'surface', N.construct.extrude(sp, [0, 0, 30]).surface, { name: 'spiral' }); g = ga.doc;
  const sv = vars(() => BL.thicken(g, ga.id, { thickness: 5 }));
  ok(code(() => BL.thicken(g, ga.id, { thickness: 5 })) === 'nurbs.err.thicken_self' && sv.name === 'spiral' && sv.gap < 5, 'a spiral thickened into its own inner turn: refused, naming the surface and the gap', JSON.stringify(sv));
  ok(code(() => BL.thicken(g, ga.id, { thickness: 2 })) === null, 'the same spiral 2 mm thick is fine');
}

// ------------------------------------------------------------------------------------------------ STEP: one closed shell
section('STEP: a solid as one closed shell');
const encode = (t) => new TextEncoder().encode(t);
const meshClosed = (pos, idx, q = 1e3) => {   // independent: weld cc-step's triangles by position, count each directed edge
  const id = new Map(), vid = [];
  for (let i = 0; i < pos.length / 3; i++) { const k = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]].map((x) => Math.round(x * q)).join(','); if (!id.has(k)) id.set(k, id.size); vid.push(id.get(k)); }
  const e = new Map(); let vol = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = [0, 1, 2].map((j) => vid[idx[t + j]]);
    for (let j = 0; j < 3; j++) { const k = a[j] + ',' + a[(j + 1) % 3]; e.set(k, (e.get(k) || 0) + 1); }
    const p = [0, 1, 2].map((j) => [pos[idx[t + j] * 3], pos[idx[t + j] * 3 + 1], pos[idx[t + j] * 3 + 2]]);
    vol += (p[0][0] * (p[1][1] * p[2][2] - p[1][2] * p[2][1]) - p[0][1] * (p[1][0] * p[2][2] - p[1][2] * p[2][0]) + p[0][2] * (p[1][0] * p[2][1] - p[1][1] * p[2][0])) / 6;
  }
  let bad = 0; for (const [k, n] of e) { const [x, y] = k.split(','); if (x === y) continue; if (n !== 1 || e.get(y + ',' + x) !== 1) bad++; }
  return { bad, vol };
};
const stepCases = [];
{
  const box = boxDoc();
  const cyl = B.cylinder(N.doc.newDoc(), { radius: 15, height: 60 });
  const sph = B.sphere(N.doc.newDoc(), { radius: 25 });
  let h = N.doc.newDoc(); const b2 = B.box(h, { corner: [0, 0, 0], size: [100, 60, 40] }); h = b2.doc; const c2 = B.cylinder(h, { base: [50, 30, -10], radius: 15, height: 60 }); h = c2.doc;
  const sub = B.boolean(M, h, b2.id, c2.id, 'subtract');
  const plate = N.construct.planarPatch([[0, 0, 0], [100, 0, 0], [100, 60, 0], [0, 60, 0]]);
  let t = N.doc.newDoc(); const ta = N.doc.add(t, 'surface', plate); t = ta.doc;
  t = N.doc.setTrim(t, ta.id, N.trim.addLoop(plate, null, N.trim.circleLoop(plate, 0.5, 0.5, 0.2, 128), { hole: true }));
  const thick = BL.thicken(t, ta.id, { thickness: 4 });
  stepCases.push(['box', box.doc, 2, 'cc'], ['cylinder', cyl.doc, 2, 'cc'], ['sphere', sph.doc, 2, 'own'], ['filleted box', filleted.doc, 2, 'cc'], ['box − cylinder (a through hole)', sub.doc, 0, 'cc'], ['plate with a hole, thickened', thick.doc, 0, 'cc']);
}
for (const [label, doc, euler, readers] of stepCases) {
  const t0 = Date.now();
  const rep = N.step.writeStepReport(doc, { name: 'test', time: '2026-11-06T00:00:00' });
  const s = rep.solids[0];
  ok(s && s.closed, label + ': written as one MANIFOLD_SOLID_BREP / CLOSED_SHELL', JSON.stringify(s));
  if (!s || !s.closed) continue;
  ok(s.euler === euler, label + ': V − E + F − (loops − F) = ' + euler + ' (genus ' + (2 - euler) / 2 + ')', s.vertices + ' − ' + s.edges + ' + ' + s.faces + ' − (' + s.loops + ' − ' + s.faces + ') = ' + s.euler);
  ok(/CLOSED_SHELL/.test(rep.text) && !/OPEN_SHELL/.test(rep.text) && /ADVANCED_BREP_SHAPE_REPRESENTATION/.test(rep.text), label + ': no open shells in the file');
  // in the file itself: each edge curve used by exactly two oriented edges, one each way
  const E = N.step.parseP21(rep.text), uses = new Map();
  for (const e of E.values()) if (e.type === 'ORIENTED_EDGE') { const k = e.params[3].ref, f = e.params[4].enum === 'T'; const u = uses.get(k) || [0, 0]; u[f ? 0 : 1]++; uses.set(k, u); }
  const edgeCurves = [...E.values()].filter((e) => e.type === 'EDGE_CURVE').length;
  ok(uses.size === edgeCurves && [...uses.values()].every(([a, b]) => a === 1 && b === 1), label + ': every one of the ' + edgeCurves + ' edge curves is used twice, once each way');
  // read back by our reader: a solid again, its faces close, the same volume
  const back = N.step.readStep(rep.text), bs = B.solids(back);
  const v0 = B.sew(B.facesOf(doc, B.solids(doc)[0].id)).volume, sw = bs.length ? B.sew(B.facesOf(back, bs[0].id)) : null;
  ok(bs.length === 1 && bs[0].faces.length === s.faces && sw.closed && rel(sw.volume, v0) < 1e-3, label + ': read back as one solid that closes, volume within 0.1 %', sw ? f4(sw.volume) + ' vs ' + f4(v0) : 'none');
  let cc = '';
  if (readers === 'cc') {
    // cc-step (lib/step, another session's reader written from the schemas): a B-rep solid, every face built, its triangles closed
    const r = CS.readStep(encode(rep.text), { tol: 0.05 }), so = r.solids[0], mc = so ? meshClosed(so.positions, so.indices) : null;
    ok(so && so.kind === 'brep' && so.faces === s.faces && so.failedFaces === 0, label + ': cc-step reads one B-rep solid, every face built', so ? so.kind + ' ' + so.faces + '/' + so.failedFaces : 'none');
    ok(mc && rel(mc.vol, v0) < 0.01, label + ': cc-step\'s triangles enclose the same volume within 1 %', mc ? f4(mc.vol) : '');
    cc = mc ? ', cc-step ' + so.faces + ' faces, ' + mc.bad + ' unpaired triangle edges, volume ' + f4(mc.vol) : '';
  }
  log(label + ': V ' + s.vertices + ', E ' + s.edges + ', F ' + s.faces + ', loops ' + s.loops + ', read back ' + f4(sw.volume) + ' vs ' + f4(v0) + cc + ', ' + rep.text.length + ' bytes, ' + (Date.now() - t0) + ' ms');
}
{
  // a patch set without solids is written exactly as before (open shells), and loose faces next to a solid stay open shells
  let d = N.doc.newDoc(); d = N.doc.add(d, 'surface', N.construct.planarPatch([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]])).doc;
  const t = N.step.writeStep(d, { time: '2026-11-06T00:00:00' });
  ok(/OPEN_SHELL/.test(t) && !/CLOSED_SHELL/.test(t), 'no solids: open shells as before');
  const both = { ...boxDoc().doc }; both.items = [...both.items, { id: 'loose', name: 'loose', kind: 'surface', surface: N.construct.planarPatch([[0, 0, 100], [10, 0, 100], [10, 10, 100], [0, 10, 100]]) }];
  const tb = N.step.writeStep(both, { time: '2026-11-06T00:00:00' });
  ok(/CLOSED_SHELL/.test(tb) && (tb.match(/OPEN_SHELL/g) || []).length === 1, 'a solid and a loose face: one closed shell, one open shell');
  const back = N.step.readStep(tb);
  ok(back.items.length === 7 && B.solids(back).length === 1 && !B.solidOf(back, back.items.find((i) => i.name === 'loose').id), 'read back: 7 faces, the loose one not in the solid');
}

// ------------------------------------------------------------------------------------------------ several edges at once, corners
section('fillet: several edges at once, corners (owner\'s order 2026-11-06)');
{
  const { doc, id, f } = boxDoc();   // faces z0, z1 (top), y0 (front), y1, x0, x1; 100 x 60 x 40
  const r = 5, q = Q * r * r;
  // the overlap of two fillets that run into each other at a corner whose third edge stays sharp: for the depth z below the top the first
  // removes y <= w(z), the second x <= w(z), w = r − √(2rz − z²): both → w² (a one-dimensional integral, evaluated here)
  let I = 0; const NI = 400000; for (let i = 0; i < NI; i++) { const z = (i + 0.5) / NI * r, w = r - Math.sqrt(2 * r * z - z * z); I += w * w * r / NI; }
  const rim = [[f[1], f[2]], [f[1], f[3]], [f[1], f[4]], [f[1], f[5]]].map(([a, b]) => ({ a, b }));
  const t0 = Date.now();
  const R = BL.filletEdges(M, doc, id, rim, { radius: r });
  const removed = 240000 - R.report.volume, exact = q * 320 - 4 * I;
  ok(R.report.edges === 4 && R.report.fillets.length === 4 && R.report.corners.length === 4 && R.report.corners.every((c) => c.kind === 'mitre' && c.edges === 2), 'the four top edges at once: four fillets, four corners where two fillets meet (mitred)', JSON.stringify(R.report.corners.map((c) => c.kind)));
  ok(R.report.closedAgain && B.solids(R.doc).length === 1, 'the result sews again into one closed solid', String(R.report.openAgain));
  ok(rel(removed, exact) < 0.03, 'removed volume = 2·(100 + 60)·(1 − π/4)r² − 4·∫w² dz = ' + f4(exact) + ' mm³ within 3 % (the mesh Boolean\'s chords)', f4(removed) + ' (' + f4((removed / exact - 1) * 100) + ' %)');
  ok(R.report.fillets.every((x) => x.deviation < 1e-9 && x.tangent < 1e-6), 'every fillet surface is the rolling ball and meets both faces tangentially', R.report.fillets.map((x) => x.deviation.toExponential(1)).join(' '));
  ok(R.doc.items.filter((i) => B.solid(R.doc, R.id).faces.includes(i.id)).length === 10, 'ten faces: the six sides (top and four sides trimmed) and four fillets');
  log('rim: removed ' + f4(removed) + ' vs ' + f4(exact) + ', ' + (Date.now() - t0) + ' ms');
  const R2 = BL.filletEdges(M, doc, id, rim.slice().reverse(), { radius: r });
  ok(Math.abs(R2.report.volume - R.report.volume) < 1e-6 * 240000, 'the order of the edges does not change the result', f4(R2.report.volume) + ' vs ' + f4(R.report.volume));
  const R3 = BL.filletEdges(M, doc, id, rim, { radius: r, tol: 0.01 });
  ok(rel(240000 - R3.report.volume, exact) < 0.01, 'at tolerance 0.01 the removed volume is within 1 % (the error goes with the tolerance)', f4((240000 - R3.report.volume) / exact * 100 - 100) + ' %');
  // two edges that do not touch, different radii
  const two = BL.filletEdges(M, doc, id, [{ a: f[1], b: f[2], radius: 5 }, { a: f[0], b: f[3], radius: 3 }]);
  const exact2 = Q * 25 * 100 + Q * 9 * 100;
  ok(rel(240000 - two.report.volume, exact2) < 0.03 && two.report.corners.length === 0 && two.report.closedAgain, 'two separate edges, radius 5 and 3: removed ' + f4(exact2) + ' mm³ within 3 %, no corners', f4(240000 - two.report.volume));
  // three edges of one corner: mitred (corners: false) and as a sphere patch
  const tri = [[f[1], f[2]], [f[1], f[5]], [f[2], f[5]]].map(([a, b]) => ({ a, b }));
  const mit = BL.filletEdges(M, doc, id, tri, { radius: r, corners: false });
  // the cell [0, r]³ at the corner: removed where any of the three cylinders' conditions holds (grid evaluation)
  let cell = 0; const G = 120;
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) for (let k = 0; k < G; k++) {
    const x = (i + 0.5) / G * r, y = (j + 0.5) / G * r, z = (k + 0.5) / G * r;
    if ((y - r) ** 2 + (z - r) ** 2 > r * r || (x - r) ** 2 + (z - r) ** 2 > r * r || (x - r) ** 2 + (y - r) ** 2 > r * r) cell += (r / G) ** 3;
  }
  const exactM = q * (95 + 55 + 35) + cell;
  ok(mit.report.corners.length === 1 && mit.report.corners[0].kind === 'mitre' && mit.report.corners[0].edges === 3 && mit.report.closedAgain, 'three edges of one corner, corners off: one mitred corner', JSON.stringify(mit.report.corners));
  ok(rel(240000 - mit.report.volume, exactM) < 0.03, 'mitred corner: removed Σ(1 − π/4)r²(L − r) + cell = ' + f4(exactM) + ' mm³ within 3 %', f4(240000 - mit.report.volume));
  const sph = BL.filletEdges(M, doc, id, tri, { radius: r });
  const exactS = q * (95 + 55 + 35) + r ** 3 * (1 - Math.PI / 6);
  ok(sph.report.corners.length === 1 && sph.report.corners[0].kind === 'sphere' && sph.report.closedAgain, 'three edges of one corner: a spherical corner', JSON.stringify(sph.report.corners));
  ok(rel(240000 - sph.report.volume, exactS) < 0.03, 'spherical corner: removed Σ(1 − π/4)r²(L − r) + r³(1 − π/6) = ' + f4(exactS) + ' mm³ within 3 %', f4(240000 - sph.report.volume) + ' (' + f4((240000 - sph.report.volume) / exactS * 100 - 100) + ' %)');
  const fs = sph.report.corners[0].face || [], sf = sph.doc.items.find((i) => i.id === fs[0]);
  const sa = sf ? N.trim.area(sf.surface, sf.trim || null, { tol: 0.0005 }) : 0;
  ok(fs.length === 1 && rel(sa, Math.PI * r * r / 2) < 0.01, 'the corner is ONE sphere patch, an octant: area (4π/8)r² = ' + f4(Math.PI * r * r / 2) + ' mm² within 1 %', f4(sa));
  // the sphere meets the three fillets tangentially: along each fillet face's outline the points that lie on the sphere (within 1e-6 mm) have
  // the fillet's normal equal to the sphere's (up to sign): the largest angle, degrees
  {
    let worst = 0, n = 0;
    for (const fid of B.solid(sph.doc, sph.id).faces) {
      const fi = sph.doc.items.find((i) => i.id === fid);
      if (!fi || !fi.trim || fi.id === sf.id) continue;
      for (const L of [fi.trim.outer, ...fi.trim.holes]) if (L) for (const [u, v] of L) {
        const p = N.surface.point(fi.surface, u, v), cp = N.surface.closestPoint(sf.surface, p);
        if (cp.d > 1e-6) continue;
        const a = N.surface.normal(fi.surface, u, v), b = N.surface.normal(sf.surface, cp.u, cp.v);
        const ang = Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * 180 / Math.PI;
        worst = Math.max(worst, ang); n++;
      }
    }
    ok(n >= 30 && worst < 0.5, 'the sphere patch is tangent to the three fillets: ' + n + ' outline points of the other faces on the sphere, largest normal angle ' + f4(worst) + '° (< 0.5°)');
  }
  // refusals
  ok(code(() => BL.filletEdges(M, doc, id, [], {})) === 'nurbs.err.fillet_none', 'no faces: refused in words');
  ok(code(() => BL.filletEdges(M, doc, id, [{ a: f[1], b: f[2] }, { a: f[2], b: f[1] }], {})) === 'nurbs.err.fillet_dup', 'the same edge twice: refused, nothing changed');
  ok(code(() => BL.filletEdges(M, doc, id, [{ a: f[1], b: f[0] }], {})) === 'nurbs.err.fillet_edge', 'two faces that do not meet: refused (not built: a free blend between them)');
  ok(code(() => BL.filletEdges(M, doc, id, tri, { radius: 25 })) !== null, 'radius 25 on a 40 mm edge at a sphere corner: refused in words', String(code(() => BL.filletEdges(M, doc, id, tri, { radius: 25 }))));
  // the panel's command and the session: pairs of faces picked in turn
  const S = new Session(N, { doc, onChange: () => {} }); S.env.manifold = M;
  S.start('solid.fillet_edges');
  const picked = [f[1], f[2], f[1], f[5]].map((x) => S.pick({ id: x }));
  ok(picked.every(Boolean) && S.picks.length === 4, 'a face may be in several pairs (the top face is in both)');
  ok(S.pick({ id: f[3] }) && !S.pick({ id: f[3] }) && (S.unpick(), true), 'but never twice in one pair');
  S.setOption('radius', '4');
  const out = S.run();
  ok(out.ok && S.doc.solids.length === 1 && S.doc.items.length === 8 && out.report.edges === 2, 'solid.fillet_edges runs from the session: two pairs of faces picked, one history step', out.ok ? S.doc.items.length + ' faces' : JSON.stringify(out.error));
  ok(S.canUndo && (S.undo(), S.doc.items.length === 6), 'Undo gives the plain box back');
}

// ------------------------------------------------------------------------------------------------ nodes
section('solids and Booleans as nodes');
{
  const NS = N.nodesSolid, by = Object.fromEntries(NS.SOLID_NODES.map((d) => [d.id, d]));
  ok(['solid_box', 'solid_cylinder', 'solid_sphere', 'solid_union', 'solid_subtract', 'solid_intersect', 'solid_fillet', 'solid_volume', 'solid_mesh'].every((k) => by[k]), 'nine solid nodes');
  NS.setEngine(null);
  const box = by.solid_box.run({ corner: Float64Array.of(0, 0, 0), size: Float64Array.of(100, 60, 40) });
  const cyl = by.solid_cylinder.run({ base: Float64Array.of(50, 30, -10), axis: Float64Array.of(0, 0, 1), radius: 15, height: 60 });
  ok(NS.isSolid(box) && NS.isSolid(cyl), 'box and cylinder nodes give solid values');
  ok(code(() => by.solid_subtract.run({ a: box, b: cyl, tolerance: 0.05 })) === 'nurbs.err.bool_engine', 'no engine handed over: the Boolean says so');
  NS.setEngine(M);
  const diff = by.solid_subtract.run({ a: box, b: cyl, tolerance: 0.05 });
  const vol = by.solid_volume.run({ solid: diff }), exact = 240000 - Math.PI * 225 * 40;
  ok(NS.isSolid(diff) && rel(vol, exact) < 2e-3, 'Subtract node: box − cylinder = 240 000 − π·15²·40 = ' + f4(exact) + ' mm³ within 0.2 %', f4(vol));
  const panelWay = B.boolean(M, (() => { const m = NS.merge(box, cyl); return m.doc; })(), box.solids[0].id, NS.merge(box, cyl).b, 'subtract');
  ok(Math.abs(B.mesh(panelWay.doc, panelWay.id).report.volume - vol) < 1e-9, 'the node and the Surfaces panel run the same Boolean (same volume to 1e-9)');
  const un = by.solid_union.run({ a: box, b: cyl, tolerance: 0.05 }), it = by.solid_intersect.run({ a: box, b: cyl, tolerance: 0.05 });
  const vu = by.solid_volume.run({ solid: un }), vi = by.solid_volume.run({ solid: it });
  ok(rel(vi, Math.PI * 225 * 40) < 3e-3 && rel(vu, 240000 + Math.PI * 225 * 20) < 3e-3, 'Union and Intersect nodes within 0.3 % of their closed forms', f4(vu) + ', ' + f4(vi));
  const m = by.solid_mesh.run({ solid: diff, tolerance: 0.05 });
  ok(m.positions instanceof Float64Array && m.indices instanceof Uint32Array && m.indices.length > 0, 'Solid to mesh gives the node editor\'s mesh value (Float64Array positions, Uint32Array indices)');
  const fil = by.solid_fillet.run({ solid: box, face_a: 2, face_b: 3, radius: 5, radius2: 0 });
  ok(rel(240000 - by.solid_volume.run({ solid: fil }), Q * 2500) < 0.03, 'Fillet node: faces 2 and 3 of the box (top, front), r 5: removes 536.5 mm³ within 3 %');
  // the node editor's own graph, with the mount applied to a scratch copy of lib/nodes (lib/nodes is not this session's folder)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nurbs-nodes-'));
  try {
    fs.mkdirSync(path.join(tmp, 'nodes'));
    for (const f of fs.readdirSync(path.join(ROOT, 'lib/nodes'))) fs.copyFileSync(path.join(ROOT, 'lib/nodes', f), path.join(tmp, 'nodes', f));
    fs.symlinkSync(path.join(ROOT, 'lib/nurbs'), path.join(tmp, 'nurbs'));
    const r = nodesMount(path.join(tmp, 'nodes'));
    ok(!r.missing.length && r.done.length + r.already.length === 3, 'the mount applies to a copy of lib/nodes as it is now', JSON.stringify(r));
    const G = await import(path.join(tmp, 'nodes/index.js'));
    const NS2 = await import(path.join(ROOT, 'lib/nurbs/nodes-solid.js'));   // the same module instance the copy imports (through the symlink)
    NS2.setEngine(M);
    const g = new G.Graph();
    const nb = g.add('solid_box'), nc = g.add('solid_cylinder', { params: { radius: 15, height: 60 } }), np = g.add('point', { params: { x: 50, y: 30, z: -10 } });
    const ns = g.add('solid_subtract'), nv = g.add('solid_volume', { show: true }), nm = g.add('solid_mesh', { show: true });
    const wires = [[{ node: np, port: 'out' }, { node: nc, port: 'base' }], [{ node: nb, port: 'out' }, { node: ns, port: 'a' }], [{ node: nc, port: 'out' }, { node: ns, port: 'b' }], [{ node: ns, port: 'out' }, { node: nv, port: 'solid' }], [{ node: ns, port: 'out' }, { node: nm, port: 'solid' }]];
    const bad = wires.map(([a, b]) => g.canConnect(a, b)).filter(Boolean);
    ok(!bad.length, 'solid ports wire up (a solid feeds a solid port)', JSON.stringify(bad));
    for (const [a, b] of wires) g.connect(a, b);
    ok(g.canConnect({ node: nb, port: 'out' }, { node: nv, port: 'solid' }) === null && g.canConnect({ node: np, port: 'out' }, { node: ns, port: 'a' }) !== null, 'a point never feeds a solid port');
    const res = new G.Evaluator(g).run();
    const v = res.values[nv] && res.values[nv].out;
    ok(!Object.keys(res.errors).length && rel(v, exact) < 2e-3, 'the graph Box − Cylinder → Solid volume evaluates to ' + f4(exact) + ' within 0.2 %', f4(v) + ' ' + JSON.stringify(res.errors));
    ok(G.typeOf(res.values[ns].out) === 'solid' && /^solid \d+ faces$/.test(G.brief(res.values[ns].out)), 'the read-out says what it is', G.brief(res.values[ns].out));
    const baked = G.bakeMeshes(N, res.shown, { tol: 0.05 });
    ok(baked.meshes.length === 1 && baked.triangles > 0, 'the shown Solid to mesh bakes like any mesh', baked.triangles + ' triangles');
    const words = G.words();
    ok(words['nodes.n.solid_subtract'] && words['nodes.cat.solid'] && words['nodes.p.solid'], 'the node editor\'s word table names the new nodes, their group and ports');
    const g2 = G.Graph.fromJSON(JSON.parse(JSON.stringify(g.toJSON())));
    ok(rel(new G.Evaluator(g2).run().values[nv].out, exact) < 2e-3, 'saved and opened again: the same volume');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  NS.setEngine(null);
}

// ------------------------------------------------------------------------------------------------ the commands and the panel's session
section('tools.run and the session');
{
  const { doc, f } = boxDoc();
  const r = N.tools.run(doc, 'solid.fillet', { a: f[1], b: f[2], radius: 5 }, { manifold: M });
  ok(r.report && r.report.fillet && B.solids(r.doc).length === 1, 'solid.fillet through tools.run');
  ok(code(() => N.tools.run(doc, 'solid.fillet', { a: f[1], b: 'zz', radius: 5 }, { manifold: M })) === 'nurbs.err.fillet_face', 'faces of two solids: refused');
  let d = N.doc.newDoc(); const a = N.doc.add(d, 'surface', N.construct.planarPatch([[0, 0, 0], [100, 0, 0], [100, 60, 0], [0, 60, 0]])); d = a.doc;
  const t = N.tools.run(d, 'solid.thicken', { surface: a.id, thickness: 2, flip: true });
  ok(Math.abs(t.report.volume - 12000) < 1e-6 && t.report.side === -1, 'solid.thicken through tools.run (flip: the other side)');
  ok(JSON.stringify(argsFor('solid.fillet', [{ id: 's2' }, { id: 's3' }], { radius: 5 })) === JSON.stringify({ radius: 5, a: 's2', b: 's3' }), 'session args for a fillet');
  const S = new Session(N, { doc });
  S.env.manifold = M;
  S.start('solid.fillet');
  ok(S.need().kind === 'surface' && S.pick({ id: f[1] }) && S.pick({ id: f[2] }) && !S.need(), 'the panel collects two faces');
  ok(S.fields().some((x) => x.name === 'radius2') && S.setOption('radius2', '8') === null && S.setOption('radius2', '-1') !== null, 'radius at the end is a field (0 or more)');
  const run = S.run('Fillet');
  ok(run.ok && run.report.fillet.radius2 === 8 && S.canUndo, 'runs as one history step, variable radius', run.error ? JSON.stringify(run.error) : '');
}

// ------------------------------------------------------------------------------------------------ words
section('words');
{
  const used = new Set();
  for (const f of ['blend.js', 'nodes-solid.js', 'step.js', 'tools.js', 'solid.js']) for (const m of fs.readFileSync(path.join(ROOT, 'lib/nurbs', f), 'utf8').matchAll(/'(nurbs\.(?:err|cmd)\.[a-z0-9_]+)'/g)) used.add(m[1]);
  const missing = [...used].filter((k) => !NURBS_KEYS[k]);
  ok(!missing.length, 'every nurbs.err / nurbs.cmd key the library uses has its English words', missing.join(', '));
  const W = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/nurbs-ui/words.json'), 'utf8'));
  const ui = [...fs.readFileSync(path.join(ROOT, 'lib/nurbs-ui/panel.js'), 'utf8').matchAll(/'(nurbs\.ui\.[a-z0-9_.]+)'/g)].map((m) => m[1]);
  const missUi = [...new Set(ui)].filter((k) => !W[k] && !/[._]$/.test(k));
  ok(!missUi.length, 'every nurbs.ui key the panel names directly has its words', missUi.join(', '));
  ok(['radius2', 'thickness', 'flip'].every((o) => W['nurbs.ui.opt.' + o]), 'the new option fields have labels');
}

console.log((failN ? 'FAILED — ' : '') + 'blend: ' + pass + ' passed, ' + failN + ' failed');
process.exit(failN ? 1 : 0);
