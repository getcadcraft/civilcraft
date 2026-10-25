#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-assembly-tools.mjs — PartCraft's measuring (measure.js, measure-brep.js), bill of materials (bom.js),
 * exploded views (explode.js), joint limits / moving by hand / file v2 (assembly.js) and the assembly's
 * exports and drawing (asm-drawing.js), against closed forms and second readers (cadquery-ocp, trimesh, poppler).
 *   node tools/partcraft-test/test-assembly-tools.mjs [--verbose]   (or runAssemblyToolsTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');

export async function runAssemblyToolsTests({ ok, section, oc = null, skip = (m) => console.log('  skip ' + m) }) {
  // messages through t() (0.4) read as words with the English catalog
  (await import(DEV + 'i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const V = await import(DEV + 'vec.js');
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const A = await import(DEV + 'assembly.js');
  const ME = await import(DEV + 'measure.js');
  const MB = await import(DEV + 'measure-brep.js');
  const BOM = await import(DEV + 'bom.js');
  const EX = await import(DEV + 'explode.js');
  const AD = await import(DEV + 'asm-drawing.js');
  const { toPdf } = await import(DEV + 'drawing.js');
  const F = await import(path.join(REPO, 'tools/partcraft-test/fixtures.mjs'));
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const TMP = path.join(REPO, 'tmp/partcraft-assembly');
  fs.mkdirSync(TMP, { recursive: true });
  const PI = Math.PI;
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const xb = (part) => B.regenerateBrep(part, oc);
  const HAVE_PY = fs.existsSync(PY);
  const py = (code, ...args) => execFileSync(PY, ['-c', code, ...args], { encoding: 'utf8' });
  const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  // a 100 (X) × 20 (Y) × 50 (Z) box: top-plane sketch (sketch y → −Z) extruded up 20 → X 0…100, Y 0…20, Z −50…0
  const box = (name = 'Block') => {
    const part = P.newPart(name);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
    return part;
  };
  // a cylinder r 10, h 40 standing on the top plane
  const cyl = () => {
    const part = P.newPart('Pin');
    const sk = S.newSketch(); const c = S.addCircle(sk, [0, 0], 10);
    S.addConstraint(sk, 'coincident', [c.c, 'O']); S.addConstraint(sk, 'radius', [c.id], 10);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 40 });
    return part;
  };
  const boxPart = box(), boxB = xb(boxPart);
  const faceIdx = (r, pred) => r.faces.findIndex(pred);
  const top = faceIdx(boxB, (f) => f.type === 'plane' && f.n[1] > 0.999), bottom = faceIdx(boxB, (f) => f.type === 'plane' && f.n[1] < -0.999);
  const side = faceIdx(boxB, (f) => f.type === 'plane' && f.n[0] > 0.999);
  const fpick = (r, i, M = I4) => ({ kind: 'face', index: i, at: r.faces[i].at, matrix: M });

  section('measure: a box, exact');
  {
    ok(top >= 0 && bottom >= 0 && side >= 0, 'the box has its top, bottom and +X faces');
    const d = MB.distance(oc, { a: { part: boxPart, sub: ME.exactSub(fpick(boxB, top)) }, b: { part: boxPart, sub: ME.exactSub(fpick(boxB, bottom)) } });
    ok(rel(d.distance, 20, 1e-12) && d.exact, `top face to bottom face: OCCT minimum distance ${d.distance} = 20`);
    const ia = ME.info(boxB, fpick(boxB, top)), ib = ME.info(boxB, fpick(boxB, bottom)), is = ME.info(boxB, fpick(boxB, side));
    ok(rel(ia.area, 5000, 1e-9) && rel(is.area, 1000, 1e-9), 'face areas: top 100 × 50 = 5000, side 20 × 50 = 1000 (exact; the sketch solves to 1e-10)');
    const pr = ME.pair(fpick(boxB, top), fpick(boxB, bottom), ia, ib, d);
    ok(near(pr.planeGap, 20, 1e-12) && near(pr.angle, 180, 1e-9) && near(Math.abs(pr.delta[1]), 20, 1e-12), 'pair: gap between the planes 20, normals 180° apart, ΔY 20');
    const p2 = ME.pair(fpick(boxB, top), fpick(boxB, side), ia, is, null);
    ok(near(p2.angle, 90, 1e-12), 'angle between the top and a side face = 90°');
    // point to point: snap candidates hold the corners
    const cands = ME.snapCandidates(boxB);
    const has = (p) => cands.some((c) => c.kind === 'vertex' && V.len(V.sub(c.p, p)) < 1e-7);
    ok(cands.filter((c) => c.kind === 'vertex').length === 8 && has([0, 0, 0]) && has([100, 20, -50]) && cands.filter((c) => c.kind === 'midpoint').length === 12, 'snap candidates: the 8 corners and 12 edge midpoints');
    const v0 = { kind: 'vertex', local: [0, 0, 0], matrix: I4 }, v1 = { kind: 'vertex', local: [100, 20, -50], matrix: I4 };   // typed points
    const pp = ME.pair(v0, v1, ME.info(boxB, v0), ME.info(boxB, v1));
    ok(pp.method === 'exact' && near(pp.distance, Math.sqrt(100 * 100 + 400 + 2500), 1e-12) && near(pp.delta[0], 100) && near(pp.delta[1], 20) && near(pp.delta[2], -50), 'corner to corner: √(100² + 20² + 50²), ΔXYZ 100, 20, −50');
    // a projection (x, y) for screen-space snapping
    const proj = (p) => [p[0] * 2, -p[1] * 2];
    const sn = ME.snapAt(cands, proj, 201, -39, 10);
    ok(sn && sn.kind === 'vertex' && near(sn.p[0], 100, 1e-7) && near(sn.p[1], 20, 1e-7), 'snapAt: a pointer 1.4 px off the projected corner snaps to it');
    ok(ME.snapAt(cands, proj, 150, -10, 5) === null, 'snapAt: nothing within 5 px, no snap');
    const ei = ME.nearestEdge(boxB, proj, 100, -40.5, 6);
    const e = boxB.edges[ei];
    ok(ei >= 0 && e.type === 'line' && rel(e.len, 100, 1e-9), 'nearestEdge: the 100 long top edge under the pointer');
    const ie = ME.info(boxB, { kind: 'edge', index: ei, matrix: I4 });
    ok(rel(ie.length, 100, 1e-9) && Math.abs(Math.abs(ie.dir[0]) - 1) < 1e-12, 'edge facts: straight, length 100, along X');
    // tessellation fallback (planar faces: the facets are the faces)
    const ga = ME.geometryOf(boxB, fpick(boxB, top)), gb = ME.geometryOf(boxB, fpick(boxB, bottom));
    const pm = ME.pair({ ...fpick(boxB, top), geometry: ga }, { ...fpick(boxB, bottom), geometry: gb }, ia, ib, null);
    ok(pm.method === 'facets' && near(pm.distance, 20, 1e-5), `mesh fallback: ${pm.distance.toFixed(6)} (labelled as of the facets)`);
    ok(/approximate/.test(ME.pairRows(pm)[0][1]) && !/approximate/.test(ME.pairRows(pr)[0][1]), 'the panel row says "approximate" only for the fallback');
  }

  section('measure: the flange with Ø16 bolt holes');
  {
    const fl = F.flange({ holeD: 16 });
    const r = xb(fl.part);
    const walls = r.faces.map((f, i) => [f, i]).filter(([f]) => /wall/.test(f.name));
    const iw = ME.info(r, fpick(r, walls[0][1]));
    ok(iw.type === 'cylinder' && near(2 * iw.r, 16, 1e-12), `a hole wall picked: cylinder, diameter ${2 * iw.r} = 16`);
    const ce = r.edges.map((e, i) => [e, i]).filter(([e]) => e.type === 'circle' && /wall/.test(e.key));
    const ic = ME.info(r, { kind: 'edge', index: ce[0][1], matrix: I4 });
    ok(ic.full && near(2 * ic.r, 16, 1e-9) && near(Math.hypot(ic.centre[0], ic.centre[2]), 75, 1e-9) && near(ic.length, 16 * PI, 1e-9), `a hole's rim edge: full circle, diameter ${(2 * ic.r).toFixed(12)} = 16, centre on the Ø150 bolt circle, length 16π`);
    ok(ic.axis && Math.abs(Math.abs(ic.axis[1]) - 1) < 1e-9, 'its axis is vertical (from OCCT\'s polyline of the edge)');
    ok(ME.infoRows(ic).some(([k, v]) => k === 'Diameter' && v === '16 mm'), 'the panel shows "Diameter 16 mm"');
    // two neighbouring holes: wall to wall exact, axis to axis 2·75·sin(π/8)
    const byAng = walls.map(([f, i]) => [Math.atan2(f.at[2], f.at[0]), f, i]).sort((p, q) => p[0] - q[0]);
    const [, fa, ia_] = byAng[0], [, fb, ib_] = byAng[1];
    const d = MB.distance(oc, { a: { part: fl.part, sub: { kind: 'face', index: ia_, at: fa.at } }, b: { part: fl.part, sub: { kind: 'face', index: ib_, at: fb.at } } });
    const pitch = 2 * 75 * Math.sin(PI / 8);
    ok(rel(d.distance, pitch - 16, 1e-9), `neighbouring hole walls: OCCT ${d.distance.toFixed(10)} = 2·75·sin(π/8) − 16 = ${(pitch - 16).toFixed(10)}`);
    const pr = ME.pair(fpick(r, ia_), fpick(r, ib_), ME.info(r, fpick(r, ia_)), ME.info(r, fpick(r, ib_)), d);
    ok(rel(pr.axisGap, pitch, 1e-9) && near(pr.angle, 0, 1e-6), `axis to axis ${pr.axisGap.toFixed(10)} = 2·75·sin(π/8), axes parallel (0°)`);
    // a stale index is corrected by the face's point
    const d2 = MB.distance(oc, { a: { part: fl.part, sub: { kind: 'face', index: 0, at: fa.at } }, b: { part: fl.part, sub: { kind: 'face', index: ib_, at: fb.at } } });
    ok(rel(d2.distance, pitch - 16, 1e-9), 'a face index that no longer matches is found again by its point');
    ok(throws(() => MB.distance(oc, { a: { part: fl.part, sub: { kind: 'point', p: [0, NaN, 0] } }, b: { part: fl.part, sub: { kind: 'body' } } }), /bad/), 'a bad picked point is refused');
    // the same through the exact worker's op registry (brep-worker.js imports measure-brep.js)
    const { OPS } = await import(DEV + 'worker-ops.js');
    const wctx = { oc, progress() {}, transfer() {} };
    const dw = OPS.measureDistance({ a: { part: fl.part, sub: { kind: 'face', index: ia_, at: fa.at } }, b: { part: fl.part, sub: { kind: 'face', index: ib_, at: fb.at } } }, wctx);
    ok(['measureDistance', 'measureMass', 'asmStep', 'asmViews'].every((k) => typeof OPS[k] === 'function') && rel(dw.distance, pitch - 16, 1e-9), 'worker ops measureDistance, measureMass, asmStep, asmViews registered; measureDistance gives the same');
    const src = fs.readFileSync(path.join(DEV, 'brep-worker.js'), 'utf8');
    ok(src.includes("import './measure-brep.js';"), 'brep-worker.js imports measure-brep.js (single quotes, linked by exact-client.js)');
    // a point above the hub to the body: 200 − 80
    const d3 = MB.distance(oc, { a: { part: fl.part, sub: { kind: 'point', p: [0, 200, 37] } }, b: { part: fl.part, sub: { kind: 'body' } } });
    ok(rel(d3.distance, 200 - 80, 1e-9), 'a point 120 above the hub top to the body: 120');
  }

  section('mass properties against closed forms');
  {
    const m = MB.massProps(oc, { part: boxPart });
    const Vb = 100000, a = 100, b = 20, c = 50;
    const want = [Vb * (b * b + c * c) / 12, Vb * (a * a + c * c) / 12, Vb * (a * a + b * b) / 12];
    const offMax = Math.max(Math.abs(m.tensor[0][1]), Math.abs(m.tensor[1][2]), Math.abs(m.tensor[0][2]));
    ok(rel(m.volume, Vb, 1e-9) && rel(m.area, 2 * (a * b + b * c + a * c), 1e-9), 'box: volume 100000, area 2(ab + bc + ca) (exact)');
    ok(near(m.centre[0], 50, 1e-7) && near(m.centre[1], 10, 1e-9) && near(m.centre[2], -25, 1e-7), 'box: centre of mass (50, 10, −25)');
    ok(want.every((w, k) => rel(m.tensor[k][k], w, 1e-8)) && offMax < 1e-9 * want[0], `box: Ixx, Iyy, Izz = V(b² + c²)/12 … to 1e-8 (the sketch solves to 1e-10), products of inertia 0 (|max| ${offMax.toExponential(1)})`);
    const mm = ME.meshMass(boxB.mesh);
    ok(rel(mm.volume, Vb, 1e-6) && want.every((w, k) => rel(mm.tensor[k][k], w, 1e-6)) && near(mm.centre[2], -25, 1e-4), 'box from its triangles (divergence theorem): same volume, centre and tensor (float32 vertices: 1e-6)');
    const pin = cyl();
    const pm = MB.massProps(oc, { part: pin });
    const Vc = PI * 100 * 40;
    ok(rel(pm.volume, Vc, 1e-10) && near(pm.centre[1], 20, 1e-9) && rel(pm.tensor[1][1], Vc * 100 / 2, 1e-9) && rel(pm.tensor[0][0], Vc * (3 * 100 + 1600) / 12, 1e-9) && rel(pm.tensor[2][2], Vc * (3 * 100 + 1600) / 12, 1e-9), 'cylinder r 10 × 40: V = 4000π, Iaxis = Vr²/2, Iacross = V(3r² + h²)/12 (exact, to 1e-9)');
    const pmm = ME.meshMass(xb(pin).mesh);
    ok(Math.abs(pmm.volume - Vc) / Vc < 2e-3 && pmm.volume < Vc, `cylinder from its triangles: ${pmm.volume.toFixed(2)} just under 4000π (inscribed facets)`);
    // placed and combined: the box with density 7.85 and a copy turned 90° about Y, 200 along X
    const R = V.matMul(V.translation([200, 0, 0]), V.rotationAbout([0, 0, 0], [0, 1, 0], 90));
    const p1 = ME.placeMass(m, I4, 7.85), p2 = ME.placeMass(m, R, 7.85);
    const mass = 7.85 * Vb / 1000;
    ok(rel(p1.mass, mass, 1e-9) && rel(p2.tensor[0][0], mass * (b * b + a * a) / 12, 1e-8) && rel(p2.tensor[2][2], mass * (c * c + b * b) / 12, 1e-8), 'turned 90° about Y the box\'s Ixx and Izz swap their dimensions (×ρ, g·mm²)');
    const all = ME.combineMass([p1, p2]);
    const c1 = p1.centre, c2 = p2.centre, C = V.mul(V.add(c1, c2), 0.5);
    const par = (cc, i, j) => mass * ((i === j ? V.dot(V.sub(cc, C), V.sub(cc, C)) : 0) - V.sub(cc, C)[i] * V.sub(cc, C)[j]);
    const Ixx = mass * (b * b + c * c) / 12 + mass * (b * b + a * a) / 12 + par(c1, 0, 0) + par(c2, 0, 0);
    const Ixz = par(c1, 0, 2) + par(c2, 0, 2);
    ok(rel(all.mass, 2 * mass, 1e-9) && V.len(V.sub(all.centre, C)) < 1e-9 && rel(all.tensor[0][0], Ixx, 1e-8) && rel(all.tensor[0][2], Ixz, 1e-8), 'two boxes combined: mass 2m, centre between them, Ixx and Ixz by the parallel-axis theorem');
    const Q = V.rotationAbout([0, 0, 0], V.norm([1, 2, 3]), 37);
    const Rm = [[Q[0], Q[4], Q[8]], [Q[1], Q[5], Q[9]], [Q[2], Q[6], Q[10]]];
    const D = [5, 7, 11];
    const T = [0, 1, 2].map((i) => [0, 1, 2].map((j) => Rm[i][0] * D[0] * Rm[j][0] + Rm[i][1] * D[1] * Rm[j][1] + Rm[i][2] * D[2] * Rm[j][2]));
    const pr = ME.principal(T);
    ok(pr.moments.every((x, k) => near(x, D[k], 1e-12)) && Math.abs(Math.abs(V.dot(pr.axes[0], [Rm[0][0], Rm[1][0], Rm[2][0]])) - 1) < 1e-9, 'principal moments of a turned diag(5, 7, 11) tensor: 5, 7, 11 and the turned axes');
    ok(ME.massRows({ ...p1 }).some(([k, v]) => k === 'Mass' && v === '785 g'), 'the panel: Mass 785 g for the steel box');
  }

  section('assembly: part properties, BOM and CSV');
  const fl = F.flange();
  const flB = xb(fl.part);
  const asm = A.newAssembly('Flange stack');
  const i1 = A.insertPart(asm, fl.part);
  const i2 = A.insertPart(asm, fl.part, { pid: i1.part });
  const ib = A.insertPart(asm, boxPart, { place: V.translation([300, 0, 0]) });
  const builds = new Map([[i1.part, flB], [ib.part, boxB]]);
  Object.assign(asm.parts[i1.part], { number: 'FL-100', description: 'Weld-neck flange, "DN 65", 8 holes', material: { name: 'Steel (carbon)', density: 7.85 } });
  {
    let rows = BOM.bomRows(asm, builds);
    ok(rows.length === 2 && rows[0].qty === 2 && rows[1].qty === 1 && rows[0].item === 1, 'BOM: flange × 2, block × 1, items numbered in order');
    A.insertPart(asm, null, { pid: i1.part, place: V.translation([0, 0, 400]) });
    A.insertPart(asm, null, { pid: ib.part, place: V.translation([300, 0, 200]) });
    rows = BOM.bomRows(asm, builds);
    ok(rows[0].qty === 3 && rows[1].qty === 2, 'after adding a copy of each: 3 and 2');
    ok(rel(rows[0].massEach, 7.85 * 302160 * PI / 1000, 1e-9) && rel(rows[0].massTotal, 3 * 7.85 * 302160 * PI / 1000, 1e-9) && rows[1].massEach === null, 'mass each = ρ·302160π/1000 g (exact volume), total × 3; no material, no mass');
    const back = A.readAssembly(A.toJSON(asm));
    const bp = back.parts[i1.part];
    ok(back.version === 2 && bp.number === 'FL-100' && bp.material.density === 7.85 && /DN 65/.test(bp.description), 'properties saved in the assembly file (version 2) and read back');
    const tamper = (fn) => { const t = JSON.parse(A.toJSON(asm)); fn(t); return () => A.readAssembly(JSON.stringify(t)); };
    ok(throws(tamper((t) => { t.parts[i1.part].material.density = 0; }), /density/) && throws(tamper((t) => { t.parts[i1.part].material.density = 30; }), /density/) && throws(tamper((t) => { t.parts[i1.part].material.density = '7'; }), /density/), 'a density of 0, 30 or text is refused');
    const long = A.readAssembly(JSON.stringify((() => { const t = JSON.parse(A.toJSON(asm)); t.parts[i1.part].number = 'X'.repeat(500) + '\u0007'; return t; })()));
    ok(long.parts[i1.part].number.length === 40 && !/\u0007/.test(long.parts[i1.part].number), 'an overlong part number is cut to 40 characters, control characters dropped');
    const v1 = JSON.parse(A.toJSON(asm)); v1.version = 1; delete v1.views; for (const p of Object.values(v1.parts)) { delete p.number; delete p.material; delete p.description; }
    ok(A.readAssembly(JSON.stringify(v1)).instances.length === 5, 'a version 1 file still opens');
    // CSV: commas, quotes, a line break and a formula-looking name survive a strict parser
    asm.parts[ib.part].name = '=HYPERLINK("x"),\nblock';
    const csv = BOM.bomCsv(BOM.bomRows(asm, builds));
    const parse = (s) => {
      const out = [[]]; let f = '', q = false;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (q) { if (ch === '"' && s[i + 1] === '"') { f += '"'; i++; } else if (ch === '"') q = false; else f += ch; }
        else if (ch === '"') q = true; else if (ch === ',') { out[out.length - 1].push(f); f = ''; }
        else if (ch === '\r' && s[i + 1] === '\n') { out[out.length - 1].push(f); f = ''; out.push([]); i++; } else f += ch;
      }
      return out.filter((r) => r.length);
    };
    const t = parse(csv.replace(/^﻿/, ''));
    ok(csv.startsWith('﻿') && t.length === 4 && t.every((r) => r.length === 10), 'CSV: BOM mark, header + 2 rows + total, 10 columns each');
    ok(t[1][4] === 'Weld-neck flange, "DN 65", 8 holes' && t[2][3] === '\'=HYPERLINK("x"),\nblock', 'quotes, commas and a line break round-trip; a cell starting with = gets a leading \' (no formula)');
    ok(t[1][1] === '3' && t[2][1] === '2' && t[3][3] === 'Total' && t[3][1] === '5' && t[3][9] === '', 'quantities 3 and 2, total 5 parts, no total mass while a part has no material');
    if (HAVE_PY) {
      const f = path.join(TMP, 'bom.csv'); fs.writeFileSync(f, csv);
      const j = JSON.parse(py('import csv,sys,json; print(json.dumps(list(csv.reader(open(sys.argv[1], encoding="utf-8-sig", newline="")))))', f));
      ok(JSON.stringify(j) === JSON.stringify(t), 'Python\'s csv module reads the same cells');
    } else skip('venv missing: Python csv read skipped');
    asm.parts[ib.part].name = 'Block';
  }

  section('assembly: joint limits, moving by hand');
  const bottomRef = { kind: 'face', feature: fl.ids.revolve, face: 'side', entity: fl.lines[0] };
  const j = A.addJoint(asm, 'revolute', { inst: i1.id, plane: bottomRef }, { inst: i2.id, plane: bottomRef });
  {
    j.angle = 45;
    const w45 = A.placeAll(asm, builds).world.get(i2.id);
    j.angle = 90; j.limits = A.readLimits({ min: 0, max: 45 }, 'revolute');
    const w90 = A.placeAll(asm, builds).world.get(i2.id);
    ok(w90.every((v, k) => near(v, w45[k], 1e-12)) && A.jointValue(j) === 45, 'limits 0…45°: an angle of 90 is held at 45');
    ok(throws(() => A.readLimits({ min: 10, max: 10 }, 'revolute'), /minimum/) && throws(() => A.readLimits({ min: 0, max: 1e5 }, 'revolute'), /range/) && A.readLimits({ min: 0, max: 5 }, 'rigid') === null, 'limits: min = max refused, beyond ±3600° refused, none on a rigid joint');
    const back = A.readAssembly(A.toJSON(asm));
    ok(back.joints[0].limits.max === 45, 'limits saved and read back');
    const t = JSON.parse(A.toJSON(asm)); t.joints[0].limits = { min: 5, max: 1 };
    ok(throws(() => A.readAssembly(JSON.stringify(t)), /limits/), 'a file with min above max is refused');
    j.angle = 0; delete j.limits;
    // named faces (pattern copies) in joints now open
    const t2 = JSON.parse(A.toJSON(asm)); t2.joints[0].a.plane = { kind: 'face', feature: fl.ids.hole, face: 'named', name: `${fl.ids.hole}.floor@${fl.ids.pattern}#2` };
    ok(A.readAssembly(JSON.stringify(t2)).joints[0].a.plane.name === `${fl.ids.hole}.floor@${fl.ids.pattern}#2`, 'a joint on a named face (a pattern copy\'s) opens');
    // moving: the block is free; the flanges are not
    const free = A.freeIds(asm);
    ok(free.has(ib.id) && !free.has(i2.id) && !free.has(i1.id), 'free parts: the block (no joint), not the jointed flange or the grounded one');
    const before = A.placeAll(asm, builds).world.get(i2.id);
    const np = A.movePlace(ib.place, { move: [10, 0, -5], rotate: { axis: [0, 1, 0], angle: 90, about: [350, 10, -25] } });
    A.moveInstance(asm, ib.id, np);
    const c = V.applyMat(A.placeAll(asm, builds).world.get(ib.id), [50, 10, -25]);
    ok(near(c[0], 360, 1e-9) && near(c[1], 10, 1e-9) && near(c[2], -30, 1e-9), 'block turned 90° about its own centre then moved (10, 0, −5): centre (360, 10, −30)');
    const corner = V.applyMat(asm.instances.find((x) => x.id === ib.id).place, [0, 0, 0]);
    ok(near(corner[0], 385, 1e-9) && near(corner[2], 20, 1e-9), 'its corner swung round the centre as a 90° turn about Y does');
    ok(throws(() => A.moveInstance(asm, i2.id, np), /joints/) && throws(() => A.moveInstance(asm, i1.id, np), /grounded/), 'a jointed or grounded part cannot be moved by hand');
    ok(A.placeAll(asm, builds).world.get(i2.id).every((v, k) => v === before[k]), 'moving the block left the jointed flange where its joint puts it');
  }

  section('exploded views');
  let view;
  {
    const worldBefore = A.placeAll(asm, builds).world;
    view = EX.newView(asm, 'Stack apart');
    EX.addStep(asm, view, [i2.id], [2, 0, 0], 100);
    EX.addStep(asm, view, [i2.id, ib.id], [0, 1, 0], 50);
    let o = EX.offsets(view, 1);
    ok(near(o.get(i2.id)[0], 100) && near(o.get(i2.id)[1], 50) && near(o.get(ib.id)[1], 50) && near(o.get(ib.id)[0], 0) && !o.has(i1.id), 'fully exploded: flange 2 at (100, 50, 0), the block (0, 50, 0), the grounded flange still');
    o = EX.offsets(view, 0.5);
    ok(near(o.get(i2.id)[0], 100) && !o.has(ib.id), 'half way: step 1 done, step 2 not started');
    o = EX.offsets(view, 0.75);
    ok(near(o.get(i2.id)[1], 25) && near(o.get(ib.id)[1], 25), 'three quarters: step 2 half way (25)');
    ok(EX.offsets(view, 0).size === 0, 'collapsed: no offsets');
    const ex = EX.exploded(worldBefore, EX.offsets(view, 1));
    const cB = V.applyMat(worldBefore.get(i2.id), [0, 0, 0]), cE = V.applyMat(ex.get(i2.id), [0, 0, 0]);
    ok(near(cE[0] - cB[0], 100) && near(cE[1] - cB[1], 50), 'the exploded matrix is the placement moved by the offset');
    const tr = EX.trails(view, new Map([[i2.id, [0, 0, 0]], [ib.id, [1, 1, 1]], [i1.id, [5, 5, 5]]]), 1);
    ok(tr.length === 2 && tr.find((t) => t.inst === i2.id).pts.length === 3 && near(tr.find((t) => t.inst === i2.id).pts[2][1], 50), 'trails: rest → after step 1 → after step 2 for flange 2; none for the part that stays');
    const back = A.readAssembly(A.toJSON(asm));
    const wb = A.placeAll(back, builds).world;
    ok(back.views.length === 1 && back.views[0].steps.length === 2 && back.views[0].name === 'Stack apart', 'the view and its steps are saved in the assembly file');
    ok([...worldBefore].every(([id, m]) => m.every((v, k) => near(v, wb.get(id)[k], 1e-12))) && back.instances.every((i, n) => i.place.every((v, k) => v === asm.instances[n].place[k])), 'after save → open the real placement and every place are unchanged by exploding');
    const tamper = (fn) => { const t = JSON.parse(A.toJSON(asm)); fn(t); return () => A.readAssembly(JSON.stringify(t)); };
    ok(throws(tamper((t) => { t.views[0].steps[0].insts = ['i999']; }), /missing part/) && throws(tamper((t) => { t.views[0].steps[0].dir = [0, 0, 0]; }), /direction/) && throws(tamper((t) => { t.views[0].steps[0].dist = 'far'; }), /distance/) && throws(tamper((t) => { t.views[0].id = t.instances[0].id; }), /id/), 'bad steps (missing part, zero direction, text distance, a reused id) are refused');
    // auto: radial and along the joint tree
    const items = asm.instances.map((i) => {
      const bb = builds.get(i.part).stats.bbox, W = worldBefore.get(i.id);
      const pts = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => V.applyMat(W, [k & 1 ? bb.max[0] : bb.min[0], k & 2 ? bb.max[1] : bb.min[1], k & 4 ? bb.max[2] : bb.min[2]]));
      return { id: i.id, box: { min: [0, 1, 2].map((c) => Math.min(...pts.map((p) => p[c]))), max: [0, 1, 2].map((c) => Math.max(...pts.map((p) => p[c]))) } };
    });
    const rad = EX.autoSteps(items, 'radial');
    ok(rad.length === asm.instances.length - 1 && rad.every((s) => near(V.len(s.dir), 1, 1e-12) && s.dist > 0 && !s.insts.includes(i1.id)), 'auto radial: one step per part but the grounded one, unit directions, positive distances');
    const tree = A.jointTree(asm, builds, worldBefore);
    ok(tree.length === 1 && tree[0].parent === i1.id && tree[0].child === i2.id && near(tree[0].normal[1], -1, 1e-12), 'joint tree: flange 1 → flange 2 along the mate face\'s normal (−Y, out of the bottom face)');
    const js = EX.autoSteps(items, 'joints', { tree });
    ok(js.length === 1 && near(js[0].dir[1], -1, 1e-12) && js[0].insts[0] === i2.id && rel(js[0].dist, 1.25 * 80 + 0.05 * Math.max(...items.map((x) => V.len(V.sub(x.box.max, x.box.min)))), 1e-6), 'auto along joints: flange 2 moves down 1.25 × its 80 height + a gap');
  }

  section('assembly export: STEP, STL, 3MF');
  {
    const world = A.placeAll(asm, builds).world;
    const items = asm.instances.map((i) => ({ part: asm.parts[i.part].part, matrix: world.get(i.id) }));
    const t0 = performance.now();
    const st = MB.assemblyStep(oc, { name: asm.name, items });
    const Vtot = 3 * 302160 * PI + 2 * 100000;
    ok(st.solids === 5 && /^ISO-10303-21;/.test(st.text), `STEP of the whole assembly: one file, 5 solids (${Math.round(performance.now() - t0)} ms)`);
    const info = B.stepInfo(oc, st.text);
    ok(info.solids === 5 && rel(info.volume, Vtot, 1e-9), `our reader: 5 solids, total volume ${info.volume.toFixed(4)} = 3·302160π + 2·100000`);
    const fstep = path.join(TMP, 'assembly.step'); fs.writeFileSync(fstep, st.text);
    const hasOcp = HAVE_PY && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
    if (!hasOcp) skip('cadquery-ocp missing: native assembly STEP read skipped');
    else {
      const out = py(`
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.TopoDS import TopoDS
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
vols = []; cz = []
e = TopExp_Explorer(s, TopAbs_SOLID)
while e.More():
    so = TopoDS.Solid_s(e.Current()); g = GProp_GProps(); BRepGProp.VolumeProperties_s(so, g); vols.append(g.Mass()); c = g.CentreOfMass(); cz.append([c.X(), c.Y(), c.Z()]); e.Next()
print(json.dumps({'valid': BRepCheck_Analyzer(s).IsValid(), 'vols': vols, 'centres': cz}))
`, fstep);
      const jj = JSON.parse(out.trim().split('\n').pop());
      const tot = jj.vols.reduce((s, v) => s + v, 0);
      ok(jj.valid && jj.vols.length === 5 && rel(tot, Vtot, 1e-9), `native OpenCascade (cadquery-ocp) reads it: valid, 5 solids, total volume ${tot.toFixed(4)}`);
      // each placed where the assembly puts it (Z up in the file: model (x, y, z) → (x, −z, y))
      const want = asm.instances.map((i) => { const m = i.part === ib.part ? [50, 10, -25] : null; return m ? V.applyMat(world.get(i.id), m) : null; }).filter(Boolean).map(([x, y, z]) => [x, -z, y]);
      ok(want.every((w) => jj.centres.some((c) => V.len(V.sub(c, w)) < 1e-6)), 'the blocks\' centres in the file are where the assembly placed them (Z up)');
    }
    const meshItems = asm.instances.map((i) => ({ mesh: builds.get(i.part).mesh, matrix: world.get(i.id) }));
    const am = AD.assemblyMesh(meshItems);
    const sumT = meshItems.reduce((s, x) => s + x.mesh.indices.length / 3, 0);
    const sumV = meshItems.reduce((s, x) => s + ME.meshMass(x.mesh).volume, 0);
    ok(am.indices.length / 3 === sumT && rel(ME.meshMass(am).volume, sumV, 1e-6), 'STL mesh of the assembly: every instance\'s triangles, volume = the sum of the parts\' meshes');
    const parts = new Map(Object.entries(asm.parts).map(([pid, p]) => [pid, { name: p.name, mesh: builds.get(pid).mesh }]));
    const bytes = AD.assembly3mf(asm.name, parts, asm.instances.map((i) => ({ pid: i.part, name: i.name, matrix: world.get(i.id) })));
    const f3 = path.join(TMP, 'assembly.3mf'); fs.writeFileSync(f3, bytes);
    if (HAVE_PY) {
      const out = py(`
import sys, json, trimesh
s = trimesh.load(sys.argv[1], force='scene')
ms = s.dump()
print(json.dumps({'n': len(ms), 'vol': float(sum(m.volume for m in ms)), 'geoms': len(s.geometry), 'b': s.bounds.tolist()}))
`, f3);
      const jj = JSON.parse(out.trim().split('\n').pop());
      const bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
      for (let k = 0; k < am.positions.length; k += 3) { const [x, y, z] = [am.positions[k], -am.positions[k + 2], am.positions[k + 1]]; [x, y, z].forEach((v, c) => { bmin[c] = Math.min(bmin[c], v); bmax[c] = Math.max(bmax[c], v); }); }
      ok(jj.geoms === 2 && jj.n === 5 && rel(jj.vol, sumV, 1e-5), `trimesh reads the 3MF: 2 objects, 5 placed items, volume ${jj.vol.toFixed(1)} = the parts' meshes`);
      ok(jj.b[0].every((v, c) => Math.abs(v - bmin[c]) < 1e-3) && jj.b[1].every((v, c) => Math.abs(v - bmax[c]) < 1e-3), 'its bounds match the placed assembly turned Z up (item transforms right)');
    } else skip('venv missing: 3MF read skipped');
  }

  section('assembly drawing: isometric, balloons, BOM table');
  {
    const world = A.placeAll(asm, builds).world;
    const rows = BOM.bomRows(asm, builds);
    for (const [label, wmap, opts] of [['assembled', world, {}], ['exploded', EX.exploded(world, EX.offsets(view, 1)), { exploded: view.name }]]) {
      const items = asm.instances.map((i) => ({ part: asm.parts[i.part].part, matrix: wmap.get(i.id) }));
      const t0 = performance.now();
      const data = MB.assemblyViews(oc, { items, view: 'iso' });
      const ms = Math.round(performance.now() - t0);
      const balloons = AD.balloonsFor(rows, asm.instances, data.anchors);
      const trails = label === 'exploded' ? EX.trails(view, new Map(asm.instances.map((i) => [i.id, V.applyMat(world.get(i.id), builds.get(i.part).stats.bbox ? V.mul(V.add(builds.get(i.part).stats.bbox.min, builds.get(i.part).stats.bbox.max), 0.5) : [0, 0, 0])])), 1).map((t) => t.pts) : [];
      const sheet = AD.assemblySheet(data, rows, { name: asm.name, date: new Date('2026-10-11T12:00:00Z'), balloons, trails, ...opts });
      ok(data.view.visible.length > 100 && data.anchors.length === 5 && sheet.balloons.length === 2, `${label}: HLR iso view (${data.view.visible.length} segments, ${ms} ms), 5 anchors, a balloon per BOM row`);
      const inside = sheet.balloons.every((b) => b.x > 10 && b.x < 420 - 190 && b.y > 10 && b.y < 287);
      ok(inside && sheet.balloons.every((b) => b.anchor[0] >= sheet.view.x - 1 && b.anchor[0] <= sheet.view.x + sheet.view.w + 1), 'balloons stay on the sheet left of the table; their leaders end on the drawn parts');
      if (label === 'exploded') ok(sheet.strokes.find((s) => s.dash && s.dash.length === 4).segs.length === 3, 'exploded: chain-line trails (2 for flange 2, 1 for the block)');
      const { bytes, missing } = await toPdf(sheet);
      const fpdf = path.join(TMP, `assembly-${label}.pdf`); fs.writeFileSync(fpdf, bytes);
      ok(missing === 0, `${label}: every text encodes in WinAnsi`);
      if (spawnSync('which', ['pdftotext']).status === 0) {
        const txt = spawnSync('pdftotext', ['-layout', fpdf, '-'], { encoding: 'utf8' }).stdout;
        ok(['Item', 'Qty', 'Part number', 'FL-100', 'Flange', 'Block', 'Steel (carbon)', 'Flange stack', '2026-10-11', label === 'exploded' ? 'exploded: Stack apart' : 'Isometric (', 'Open CASCADE'].every((s) => txt.includes(s)), `${label}: pdftotext finds the BOM, part numbers, names, material, title, view label and the OCCT notice`);
      } else skip('poppler missing: assembly drawing text not read back');
    }
    const many = Array.from({ length: 60 }, (_, k) => ({ item: k + 1, qty: 1, number: '', name: 'P' + k, material: '', massEach: null }));
    const big = AD.assemblySheet({ view: { visible: [[0, 0, 10, 10]], hidden: [], box: { u0: 0, v0: 0, u1: 10, v1: 10 } }, anchors: [], exact: true }, many, {});
    ok(big.rows === 60 && big.listed < 60 && big.texts.some((t) => /and \d+ more parts/.test(t.text)), 'a BOM too long for the sheet lists what fits and says how many more are in the CSV');
  }
  MB.clearCache();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runAssemblyToolsTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
