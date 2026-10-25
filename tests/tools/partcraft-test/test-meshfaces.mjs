#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-meshfaces.mjs — 0.4 part 2, K.2b: named faces and edges on the mesh kernel (meshfaces.js + kernel.js tool surfaces).
 *   - the face and edge tables of four parts (the flange; a block with counterbored and countersunk holes, a linear pattern,
 *     a slot cut and its mirror; a 270° revolve with a cone; a ball and a ring: a sphere and a torus) against the exact kernel's: the same face names, types and
 *     radii, the same edge keys and kinds, every triangle on a face;
 *   - a coincident-plane case (two counterbore floors in one plane keep their own names);
 *   - the workspaces on the mesh kernel: a voxel cantilever study (simJob resolves the face references; the tip deflection
 *     equals the exact kernel's) and the CAM block program (pocket floor loops snapped to exact corners and an exact circle,
 *     every cutting point at least r from the walls, the wall pass at exactly r).
 *   - fillets and chamfers on straight edges (K.4): closed-form volumes (one edge, equal / two distances / distance-angle
 *     chamfers, four meeting edges mitred and said so, a concave edge adding material) and the exact kernel's volume.
 *   - shell (K.5): exact on a box, a hole's tube, against the exact kernel; draft (K.5) on flat faces: the closed-form wedge,
 *     four sides, a mid-height neutral plane, the exact kernel's volumes.
 * OpenCascade is a test-only oracle here: without it the comparisons are skipped and the rest runs.
 *   node tools/partcraft-test/test-meshfaces.mjs   (or runMeshFacesTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const OCCT = path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js');

export async function runMeshFacesTests({ ok, section, near, oc = null, M = null, skip = (m) => console.log('  skip ' + m) }) {
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), ST = await import(DEV + 'sketch-tools.js');
  const B = await import(DEV + 'brep.js'), SIM = await import(DEV + 'sim.js'), FE = await import(DEV + 'fea.js');
  const C = await import(DEV + 'cam.js'), CP = await import(DEV + 'cam-paths.js'), CS = await import(DEV + 'cam-sim.js'), O = await import(DEV + 'cam-offset.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  if (!oc && fs.existsSync(OCCT)) { const { default: init } = await import(OCCT); oc = await init({ print: () => {}, printErr: () => {} }); }

  const parts = {};
  {
    const part = P.newPart('Holes'); const b = F.blockSketch(100, 50);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk });
    const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
    const sk = S.newSketch(); S.addPoint(sk, 20, 15); S.addPoint(sk, 20, 35);
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk });
    const h1 = P.addFeature(part, 'hole', { sketch: s2.id, kind: 'cbore', d: 6, cboreD: 11, cboreDepth: 5, through: true });
    const sk3 = S.newSketch(); S.addPoint(sk3, 50, 25);
    const s3 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk3 });
    P.addFeature(part, 'hole', { sketch: s3.id, kind: 'csink', d: 6, csinkD: 12, csinkAngle: 90, through: false, depth: 12 });
    P.addFeature(part, 'lpattern', { seeds: [h1.id], dir: { kind: 'world', axis: 'x' }, count: 2, spacing: 50 });
    const sk4 = S.newSketch(); ST.addSlot(sk4, [70, 10], [90, 10], 8);
    const s4 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk4 });
    const c4 = P.addFeature(part, 'extrude', { sketch: s4.id, op: 'cut', end: 'blind', depth: 6 });
    P.addFeature(part, 'mirror', { seeds: [c4.id], plane: { kind: 'base', name: 'front' } });
    parts.holes = part;
  }
  {
    const part = P.newPart('Revolve'); const sk = S.newSketch();
    const pts = [[0, 0], [20, 0], [30, 10], [30, 25], [0, 25]];
    for (let i = 0; i < pts.length; i++) S.addLine(sk, pts[i], pts[(i + 1) % pts.length]);
    S.addLine(sk, [0, -5], [0, 40], { construction: true });
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'revolve', { sketch: s1.id, angle: 270 });
    parts.revolve = part;
  }
  {
    // a ball (an arc about a centre on the axis) and a ring (a circle off the axis): a sphere and a torus
    const part = P.newPart('Round'); const sk = S.newSketch();
    S.addArc(sk, [0, 0], [0, -20], [0, 20]);
    S.addLine(sk, [0, 20], [0, -20]);
    S.addCircle(sk, [40, 0], 5);
    S.addLine(sk, [0, -40], [0, 40], { construction: true });
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'revolve', { sketch: s1.id, angle: 360 });
    parts.round = part;
  }
  parts.flange = F.flange().part;

  section('mesh kernel: named faces and edges (0.4 K.2b)');
  const sig = (f) => `${f.name} ${f.type}${f.r ? ' r' + f.r.toFixed(4) : ''}`;
  for (const [k, part] of Object.entries(parts)) {
    const t0 = performance.now();
    const m = K.regenerate(part, M);
    const ms = performance.now() - t0;
    const un = [...m.mesh.triFace].filter((v) => v < 0).length;
    ok(m.named && [...m.results.values()].every((r) => r.status === 'ok') && un === 0 && m.mesh.edgeSegs && m.stats.faces === m.faces.length,
      `${k}: every one of ${m.mesh.triFace.length} triangles lies on a named face (${m.faces.length} faces, ${m.edges.length} edges, ${ms.toFixed(0)} ms with the build)`);
    if (!oc) { skip(`${k}: OpenCascade (test-only oracle) missing: tables not compared with the exact kernel`); continue; }
    const x = B.regenerateBrep(part, oc);
    const mm = new Set(m.faces.map(sig)), xx = new Set(x.faces.map(sig));
    const missing = [...xx].filter((s) => !mm.has(s)), extra = [...mm].filter((s) => !xx.has(s));
    ok(!missing.length && !extra.length, `${k}: the same faces as the exact kernel by name, type and radius${missing.length + extra.length ? ` (missing ${missing.join(', ')}; extra ${extra.join(', ')})` : ''}`);
    // the exact kernel splits a face (and its arcs) where another feature crosses it: compare the set of edge kinds per face pair, seams aside
    const ek = (e) => `${e.key} ${e.type}`;
    const me = new Set(m.edges.map(ek)), xe = new Set(x.edges.filter((e) => e.faces[0] !== e.faces[1]).map(ek));
    const em = [...xe].filter((s) => !me.has(s)), ex = [...me].filter((s) => !xe.has(s));
    ok(!em.length && !ex.length, `${k}: the same edges by face pair and kind (line / circle / curve)${em.length + ex.length ? ` (missing ${em.join(', ')}; extra ${ex.join(', ')})` : ''}`);
    if (k === 'flange') {
      const walls = m.faces.filter((f) => /^f4\.wall:/.test(f.name));
      ok(walls.length === 8 && walls.every((f) => near(f.r, 7, 1e-9)) && new Set(walls.map((f) => f.name)).size === 8, 'flange: the 8 hole walls are cylinders r 7 (exactly, from the sketch), each named by its pattern copy');
      const top = m.faces.find((f) => f.type === 'plane' && f.n[1] > 0.999999 && near(f.o[1], 30, 1e-9));
      ok(top && /^f2\.side:/.test(top.name), `flange: the disc's top is a plane at y 30, named by the revolve's profile line (${top && top.name})`);
      const circ = m.edges.filter((e) => e.type === 'circle' && e.circ && near(e.circ.r, 7, 1e-9));
      ok(circ.length === 16, `flange: the bolt holes' rims are 16 exact circles r 7 (${circ.length})`);
    }
    if (k === 'round') {
      const sp = m.faces.find((f) => f.type === 'sphere'), to = m.faces.find((f) => f.type === 'torus');
      ok(sp && near(sp.surf.r, 20, 1e-9) && to && near(to.surf.R, 40, 1e-9) && near(to.surf.r, 5, 1e-9), 'round: the ball is a sphere r 20 and the ring a torus R 40 r 5, with exact surface records for the tet mesher');
    }
    if (k === 'holes') {
      const cf = m.faces.filter((f) => /\.cfloor:/.test(f.name));
      ok(cf.length === 4 && new Set(cf.map((f) => f.name)).size === 4 && cf.every((f) => cf.filter((g) => near(g.o[1], f.o[1], 1e-9)).length === 4),
        'four counterbore floors in one plane keep their own names (each bounded by its hole)');
      const cone = m.faces.find((f) => f.type === 'cone');
      ok(cone && /\.csink:/.test(cone.name), 'the countersink is a cone face');
    }
  }

  section('mesh kernel: fillets and chamfers on straight edges (0.4 K.4)');
  {
    const cube = () => { const part = P.newPart('C'); const sk = S.newSketch(); S.addRect(sk, [0, 0], [50, 50]);
      const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
      P.addFeature(part, 'extrude', { sketch: s1.id, depth: 50 }); return part; };
    const base = K.regenerate(cube(), M);
    const top = base.edges.filter((e) => e.type === 'line' && Math.abs(e.a[1] - 50) < 1e-4 && Math.abs(e.b[1] - 50) < 1e-4);
    const q = (r) => r * r - Math.PI * r * r / 4;
    const run = (type, edges, props) => { const part = cube(); const f = P.addFeature(part, type, { edges: edges.map((e) => ({ faces: [...e.faces], at: e.at })), ...props }); const r = K.regenerate(part, M); return { part, r, res: r.results.get(f.id) }; };
    let x = run('fillet', top.slice(0, 1), { r: 5 });
    ok(top.length === 4 && x.res.status === 'ok' && !x.res.warning && Math.abs(x.r.stats.volume - (125000 - q(5) * 50)) / (q(5) * 50) < 0.01, `one top edge of a 50 mm cube, r 5: removes (5² − 25π/4)·50 = ${(q(5) * 50).toFixed(3)} (${(125000 - x.r.stats.volume).toFixed(3)}, faceted)`);
    const bl = x.r.faces.filter((f) => /\.blend:0$/.test(f.name));
    ok(bl.length === 1 && bl[0].type === 'cylinder' && near(bl[0].r, 5, 1e-12) && [...x.r.mesh.triFace].every((v) => v >= 0), 'its round face is a cylinder r 5 named f3.blend:0, and every triangle still has a face');
    x = run('chamfer', top.slice(0, 1), { d: 5 });
    ok(x.res.status === 'ok' && near(x.r.stats.volume, 125000 - 12.5 * 50, 1e-6) && x.r.faces.some((f) => /\.bevel:0$/.test(f.name) && f.type === 'plane'), 'chamfer 5: exactly 125000 − 12.5·50, one plane bevel:0');
    x = run('chamfer', top.slice(0, 1), { d: 5, mode: 'two', d2: 10 });
    ok(x.res.status === 'ok' && near(x.r.stats.volume, 125000 - 25 * 50, 1e-6), 'two distances 5 and 10: exactly 125000 − 25·50');
    x = run('chamfer', top.slice(0, 1), { d: 5, mode: 'angle', angle: 30 });
    ok(x.res.status === 'ok' && near(x.r.stats.volume, 125000 - 0.5 * 5 * 5 * Math.tan(Math.PI / 6) * 50, 1e-6), 'distance 5 at 30°: the other leg 5·tan 30°, exactly');
    x = run('fillet', top, { r: 5 });
    const mitre = 125000 - 4 * q(5) * 50 + 4 * 125 * (5 / 3 - Math.PI / 2);
    ok(x.res.status === 'ok' && /mitred/.test(x.res.warning || '') && Math.abs(x.r.stats.volume - mitre) / (125000 - mitre) < 0.01, `all four top edges: mitred where they meet (the note says so), ${(125000 - x.r.stats.volume).toFixed(3)} removed vs ${(125000 - mitre).toFixed(3)}`);
    ok(run('fillet', top.slice(0, 1), { r: 5, r2: 8 }).res.status === 'error' && /changes along the edge/.test(run('fillet', top.slice(0, 1), { r: 5, r2: 8 }).res.message), 'a variable radius is refused in words (exact kernel only)');
    // a concave edge: the inside corner of an L adds material
    const L = P.newPart('L'); const sk = S.newSketch();
    const pts = [[0, 0], [80, 0], [80, 8], [8, 8], [8, 60], [0, 60]];
    for (let i = 0; i < pts.length; i++) S.addLine(sk, pts[i], pts[(i + 1) % pts.length]);
    const sl = P.addFeature(L, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(L, 'extrude', { sketch: sl.id, depth: 40 });
    const lb = K.regenerate(L, M);
    const inner = lb.edges.find((e) => e.type === 'line' && Math.abs(e.a[0] - 8) < 1e-4 && Math.abs(e.a[1] - 8) < 1e-4 && Math.abs(e.b[0] - 8) < 1e-4);
    const fl = P.addFeature(L, 'fillet', { edges: [{ faces: [...inner.faces], at: inner.at }], r: 6 });
    const lr = K.regenerate(L, M);
    ok(inner && lr.results.get(fl.id).status === 'ok' && Math.abs(lr.stats.volume - lb.stats.volume - q(6) * 40) / (q(6) * 40) < 0.01, `the inside corner of an L, r 6: adds (6² − 36π/4)·40 = ${(q(6) * 40).toFixed(3)} (${(lr.stats.volume - lb.stats.volume).toFixed(3)})`);
    if (oc) {
      const xr = B.regenerateBrep(L, oc);
      ok(Math.abs(lr.stats.volume - xr.stats.volume) / xr.stats.volume < 2e-4, `… the exact kernel's fillet of that edge: ${xr.stats.volume.toFixed(3)} vs ${lr.stats.volume.toFixed(3)} mm³ (faceting only)`);
    }
    const circ = base.edges.find((e) => e.type !== 'line') || null;
    void circ;
    const fl2 = K.regenerate(F.flange().part, M);
    const rim = fl2.edges.find((e) => e.type === 'circle');
    const fp = F.flange().part; const ff = P.addFeature(fp, 'fillet', { edges: [{ faces: [...rim.faces], at: rim.at }], r: 1 });
    ok(K.regenerate(fp, M).results.get(ff.id).status === 'error', 'a round edge is refused in words: straight edges between flat faces only, in this version');
  }

  section('mesh kernel: shell (0.4 K.5)');
  {
    const block = (hole) => { const bp = P.newPart('B'); const b = F.blockSketch(100, 50); if (hole) S.addCircle(b.sk, [70, 25], 5);
      const s1 = P.addFeature(bp, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk }); P.addFeature(bp, 'extrude', { sketch: s1.id, depth: 20 }); return bp; };
    const shell = (bp, props) => { const r0 = K.regenerate(bp, M); const top = r0.faces.find((x) => x.name === 'f2.end');
      const sh = P.addFeature(bp, 'shell', { faces: [{ name: top.name, at: top.at }], ...props }); const t0 = performance.now(); const r = K.regenerate(bp, M); return { r, res: r.results.get(sh.id), ms: performance.now() - t0 }; };
    const a = shell(block(false), { t: 2, outward: false });
    const inner = a.r.faces.filter((x) => /~f3$/.test(x.name));
    ok(a.res.status === 'ok' && near(a.r.stats.volume, 100000 - 96 * 46 * 18, 1e-3), `a 100 × 50 × 20 block shelled 2 mm, top open: to 1e-3 mm³ of 100000 − 96·46·18 = 20512 (${a.r.stats.volume.toFixed(6)}, ${a.ms.toFixed(0)} ms)`);
    ok(inner.length === 5 && inner.every((x) => x.type === 'plane') && [...a.r.mesh.triFace].every((v) => v >= 0), `its 5 inner faces are planes named after the faces they offset (${inner.map((x) => x.name).join(', ')})`);
    if (process.env.PC_QUICK) skip('shell of a holed block (minkowski, minutes under load): PC_QUICK=1');
    else {
      const h = shell(block(true), { t: 2, outward: false });
      const tube = h.r.faces.find((x) => x.name === 'f2.side:c13~f3' || (/~f3$/.test(x.name) && x.type === 'cylinder'));
      ok(h.res.status === 'ok' && tube && near(tube.r, 7, 1e-9), `with a Ø10 hole through it: the hole gets a 2 mm tube round it, a cylinder r 7 (${tube && tube.name})`);
      if (oc) {
        const bp = block(true); const r0 = K.regenerate(bp, M); const top = r0.faces.find((x) => x.name === 'f2.end');
        P.addFeature(bp, 'shell', { faces: [{ name: top.name, at: top.at }], t: 2, outward: false });
        const xr = B.regenerateBrep(bp, oc);
        ok(Math.abs(h.r.stats.volume - xr.stats.volume) / xr.stats.volume < 2e-3, `… the exact kernel's shell of the same part: ${xr.stats.volume.toFixed(3)} vs ${h.r.stats.volume.toFixed(3)} mm³ (faceting)`);
      }
    }
    const o = shell(block(false), { t: 2, outward: true });
    ok(o.res.status === 'ok' && o.r.stats.volume > 104 * 54 * 22 - 100 * 50 * 22 - 2000 && o.r.stats.volume < 104 * 54 * 24 - 100 * 50 * 22, `outward 2 mm: walls outside the block, the old volume hollow, open at the top (${o.r.stats.volume.toFixed(1)} mm³; edges rounded by the offset)`);
    const fp = F.flange().part; const r0 = K.regenerate(fp, M); const cyl = r0.faces.find((x) => x.type === 'cylinder');
    const sh = P.addFeature(fp, 'shell', { faces: [{ name: cyl.name, at: cyl.at }], t: 2 });
    ok(K.regenerate(fp, M).results.get(sh.id).status === 'error', 'opening a curved face is refused in words (flat faces only, in this version)');
  }

  section('mesh kernel: draft (0.4 K.5)');
  {
    const draft = (angle, neutral, all) => {
      const bp = P.newPart('B'); const s1 = P.addFeature(bp, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk }); P.addFeature(bp, 'extrude', { sketch: s1.id, depth: 20 });
      const r0 = K.regenerate(bp, M); const sides = r0.faces.filter((x) => x.type === 'plane' && Math.abs(x.n[1]) < 0.5);
      const pick = all ? sides : sides.filter((x) => x.n[0] > 0.99);
      const d = P.addFeature(bp, 'draft', { faces: pick.map((x) => ({ name: x.name, at: x.at })), neutral, pull: null, angle });
      return { bp, d, r: K.regenerate(bp, M) };
    };
    const base = { kind: 'base', name: 'top' };
    const one = draft(5, base, false);
    const wedge = 20 * 20 * Math.tan(5 * Math.PI / 180) / 2 * 50;
    const df = one.r.faces.find((x) => x.name === `${one.d.id}.draft:0`);
    ok(one.r.results.get(one.d.id).status === 'ok' && near(100000 - one.r.stats.volume, wedge, 1e-3) && df && near(df.n[0], Math.cos(5 * Math.PI / 180), 1e-9) && near(df.n[1], Math.sin(5 * Math.PI / 180), 1e-9),
      `one side of the block drafted 5° about its base: ${wedge.toFixed(3)} mm³ taken off (20²·tan 5°/2·50), the face named draft:0 with its normal leaned 5° to the pull`);
    ok(near(draft(-5, base, false).r.stats.volume - 100000, wedge, 1e-3), '−5° adds the same wedge');
    const mid = draft(5, { kind: 'fixed', o: [0, 10, 0], n: [0, 1, 0] }, false);
    ok(near(mid.r.stats.volume, 100000, 1e-3) && mid.r.faces.filter((x) => /draft:0$/.test(x.name)).length === 2, 'about a neutral plane half way up: cut above, added below, the same amount; the face in two pieces with one name');
    const four = draft(3, base, true);
    ok(four.r.results.get(four.d.id).status === 'ok' && four.r.faces.filter((x) => /\.draft:/.test(x.name)).length === 4, 'all four sides at 3°: four drafted faces');
    if (oc) {
      for (const [k, x] of [['one side 5°', one], ['four sides 3°', four], ['mid neutral', mid]]) {
        const xr = B.regenerateBrep(x.bp, oc);
        ok(near(x.r.stats.volume, xr.stats.volume, 1e-3), `${k}: the exact kernel's draft has the same volume (${xr.stats.volume.toFixed(3)} vs ${x.r.stats.volume.toFixed(3)})`);
      }
    }
    const fp = F.flange().part; const r0 = K.regenerate(fp, M); const cyl = r0.faces.find((x) => x.type === 'cylinder');
    const dr = P.addFeature(fp, 'draft', { faces: [{ name: cyl.name, at: cyl.at }], neutral: base, pull: null, angle: 2 });
    ok(K.regenerate(fp, M).results.get(dr.id).status === 'error', 'a curved face is refused in words (flat faces only, in this version)');
  }

  section('mesh kernel: the workspaces read its faces (simulation, CAM)');
  {
    const part = P.newPart('Bar'); const sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 10]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 10 });
    const tip = (regen) => {
      const face = (n) => regen.faces.findIndex((f) => f.type === 'plane' && f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] > 0.999);
      const st = { ...SIM.newSimStudy(), mesher: 'voxel', h: 2.5 };
      st.constraints.push({ id: 'c1', type: 'fixed', faces: [B.faceRef(regen.faces[face([-1, 0, 0])])] });
      st.loads.push({ id: 'l1', type: 'force', faces: [B.faceRef(regen.faces[face([1, 0, 0])])], total: 100, dir: [0, -1, 0] });
      const { job, problems } = SIM.simJob(st, regen);
      return problems.length ? { problems } : { d: FE.solveStudy(job).maxDisp.value };
    };
    const mr = tip(K.regenerate(part, M));
    const MAT = await import(DEV + 'materials.js');
    const E = MAT.materialById(SIM.newSimStudy().material).E, eb = 100 * 100 ** 3 / (3 * E * (10 * 10 ** 3 / 12));
    ok(!mr.problems && Math.abs(mr.d / eb - 1) < 0.15, `simulation on the mesh kernel: simJob finds the faces; voxel cantilever tip ${mr.d?.toFixed(6)} mm (PL³/3EI ${eb.toFixed(6)}; plain hexahedra at 2.5 mm)`);
    if (oc) { const xr = tip(B.regenerateBrep(part, oc)); ok(near(mr.d, xr.d, 1e-12), `… the same as on the exact kernel (${xr.d.toFixed(6)} mm)`); }
  }
  {
    const part = P.newPart('Block');
    const s1 = S.newSketch(); S.addRect(s1, [0, 0], [100, 60]);
    const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: s1 });
    const e1 = P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 20 });
    const s2 = S.newSketch(); S.addRect(s2, [30, 18], [70, 42]); S.addCircle(s2, [15, 30], 8);
    const f2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: s2 });
    P.addFeature(part, 'extrude', { sketch: f2.id, op: 'cut', end: 'blind', depth: 8 });
    const rg = K.regenerate(part, M);
    const study = C.newStudy();
    study.setup.stock = { ...study.setup.stock, side: 2, top: 1, bottom: 0 };
    const model = C.machineModel(rg, study.setup);
    const floors = rg.faces.map((f, i) => i).filter((i) => model.isFloor(model.faces[i]) && Math.abs(model.faces[i].o[2] + 9) < 1e-6);
    const rectI = floors.find((i) => model.faceLoops(i).loops[0].length === 4), circI = floors.find((i) => model.faceLoops(i).loops[0].length === 1);
    ok(rectI !== undefined && circI !== undefined, 'CAM on the mesh kernel: the two pocket floors are found');
    if (rectI !== undefined && circI !== undefined) {
      const L = model.faceLoops(rectI).loops[0], xs = L.map((p) => p.s[0]), ys = L.map((p) => p.s[1]);
      ok(near(Math.min(...xs), 32, 1e-6) && near(Math.max(...xs), 72, 1e-6) && near(Math.min(...ys), 20, 1e-6) && near(Math.max(...ys), 44, 1e-6), 'pocket floor loop: corners (32, 20)–(72, 44) snapped from the edge table');
      const c = model.faceLoops(circI).loops[0][0];
      ok(c.k === 'A' && near(c.r, 8, 1e-9) && near(c.c[0], 17, 1e-6) && near(c.c[1], 32, 1e-6), `round pocket floor: one exact circle r 8 about (17, 32) (got ${c.k} r ${c.r})`);
      const em = study.tools.find((x) => x.id === 'em6'), r = em.d / 2;
      study.ops = [C.newOp('pocket', { id: 'pr', tool: 'em6', geo: { faces: [B.faceRef(rg.faces[rectI])] }, params: { stepdown: 3, stepover: 0.45 } }),
        C.newOp('pocket', { id: 'pc', tool: 'em6', geo: { faces: [B.faceRef(rg.faces[circI])] }, params: { stepdown: 4, entry: 'helix' } })];
      const prog = CP.generateProgram(study, rg, { sim: new CS.Sim(model, { cell: 0.25 }), model });
      ok(prog.paths.every((p) => !p.error), 'the pocket program builds: ' + prog.paths.map((p) => p.error || p.op.id + ' ' + p.moves.length + ' moves').join(', '));
      const segs = CP.segments([prog.paths[0]]).filter((s) => s.k !== 'rapid' && Math.min(s.a[2], s.b[2]) < -1 + 1e-9);
      const pts = segs.flatMap((s) => CP.segPoints(s, 1e-4));
      const walls = [O.line([32, 20], [72, 20]), O.line([72, 20], [72, 44]), O.line([72, 44], [32, 44]), O.line([32, 44], [32, 20])];
      const md = Math.min(...pts.map((q) => O.distToLoops([q[0], q[1]], [walls])));
      ok(pts.length && Math.abs(md - r) < 1e-6 && pts.every((q) => q[0] >= 32 + r - 1e-6 && q[0] <= 72 - r + 1e-6 && q[1] >= 20 + r - 1e-6 && q[1] <= 44 - r + 1e-6), `rectangular pocket: the wall pass at exactly r from the walls (min ${md.toFixed(9)})`);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runMeshFacesTests({ ok, section: (t) => console.log('\n== ' + t), near: (a, b, tol = 1e-9) => Math.abs(a - b) <= tol });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
