#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-tet-exact.mjs — exact surfaces for the tet mesher (brep-surf.js → surfaces.js → tetmesh.js / tetfea.js):
 *   the OCCT side writes each face's surface (sphere, cone, torus, revolution, extrusion, B-spline incl. rational) and the
 *   JS closest point is checked against OCCT's own GeomAPI_ProjectPointOnSurf (on the surface to 1e-9 of its size, the
 *   same foot point to 1e-9, never farther); mesh volumes of a sphere, torus and cone against the exact formulas with
 *   the nodes on the tessellation (before) and on the exact surfaces (after), on the same mesh; a pressurised thick
 *   sphere against Lamé (before / after); faces with no exact form are counted; tampered records refused.
 *   node tools/partcraft-test/test-tet-exact.mjs [--verbose]     (or runTetExactTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runTetExactTests({ ok, section, near, oc = null, log = (m) => console.log('  note ' + m) }) {
  const SU = await import(DEV + 'surfaces.js'), BS = await import(DEV + 'brep-surf.js');
  const TM = await import(DEV + 'tetmesh.js'), TF = await import(DEV + 'tetfea.js'), SIM = await import(DEV + 'sim.js');
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'), B = await import(DEV + 'brep.js');
  // always its own OpenCascade: the projection checks allocate a lot, and the suite's shared instance is near its heap's end
  // by now (a 32-bit WebAssembly heap only grows)
  void oc;
  { const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js')); oc = await init({ print: () => {}, printErr: () => {} }); }
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(4)} %`;
  const table = [], row = (...r) => table.push(r);
  const revolve = (name, draw, angle = 360) => { const part = P.newPart(name), sk = S.newSketch(); draw(sk); const f1 = P.addFeature(part, 'sketch', { sketch: sk }); P.addFeature(part, 'revolve', { sketch: f1.id, op: 'add', angle }); return B.regenerateBrep(part, oc, { keep: true }); };
  const extrude = (name, draw, depth) => { const part = P.newPart(name), sk = S.newSketch(); draw(sk); const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk }); P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth }); return B.regenerateBrep(part, oc, { keep: true }); };
  const axis = (sk, a = -30, b = 40) => S.addLine(sk, [0, a], [0, b], { construction: true });
  const shapes = {
    sphere: revolve('Sphere', (sk) => { axis(sk); S.addArc(sk, [0, 0], [0, -10], [0, 10]); S.addLine(sk, [0, 10], [0, -10]); }),
    torus: revolve('Torus', (sk) => { axis(sk); S.addCircle(sk, [20, 0], 5); }),
    cone: revolve('Cone', (sk) => { axis(sk); S.addLine(sk, [0, 0], [10, 0]); S.addLine(sk, [10, 0], [0, 15]); S.addLine(sk, [0, 15], [0, 0]); }),
    revolution: revolve('Vase', (sk) => { axis(sk); const l = S.addLine(sk, [0, 0], [10, 0]); const sp = S.addSpline(sk, [l.p2, [14, 10], [8, 20], [12, 30]]); S.addLine(sk, sp.pts[3], [0, 30]); S.addLine(sk, [0, 30], [0, 0]); }, 270),
    extrusion: extrude('Cam', (sk) => { const l = S.addLine(sk, [0, 0], [40, 0]); const sp = S.addSpline(sk, [l.p2, [30, 10], [20, 8], [0, 15]]); S.addLine(sk, sp.pts[3], l.p1); }, 10),
  };
  {   // a lofted solid between a square and a circle: B-spline side faces
    const part = P.newPart('Loft'), a = S.newSketch(), b = S.newSketch();
    S.addRect(a, [-10, -10], [10, 10]); S.addCircle(b, [0, 0], 8);
    const top = { kind: 'base', name: 'top' }, s1 = P.addFeature(part, 'sketch', { plane: top, sketch: a }), pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [top], d: 20 }), s2 = P.addFeature(part, 'sketch', { plane: { kind: 'ref', feature: pl.id }, sketch: b });
    P.addFeature(part, 'loft', { sections: [{ sketch: s1.id }, { sketch: s2.id }], ruled: false });
    shapes.bspline = B.regenerateBrep(part, oc, { keep: true });
  }

  // the thick sphere (Lamé) built first: OCCT's heap only grows, and the projection checks below allocate a lot
  const thick = (() => { const a = 10, b = 20, part = P.newPart('ThickSphere'), sk = S.newSketch(); axis(sk);
    const l1 = S.addLine(sk, [a, 0], [b, 0]), ar = S.addArc(sk, [0, 0], l1.p2, [0, b]), l2 = S.addLine(sk, ar.e, [0, a]); S.addArc(sk, [0, 0], l1.p1, l2.p2);
    const f1 = P.addFeature(part, 'sketch', { sketch: sk }); P.addFeature(part, 'revolve', { sketch: f1.id, op: 'add', angle: 90 });
    return B.regenerateBrep(part, oc); })();

  section('exact surfaces: OCCT records and the JS closest point against GeomAPI_ProjectPointOnSurf (brep-surf.js, surfaces.js)');
  // every non-planar face of a shape: (F, adaptor, record) — the rational B-spline is a sphere turned into one by GeomConvert
  const facesOf = (shape) => { const out = [], ex = new oc.TopExp_Explorer(shape, oc.TopAbs_ShapeEnum.TopAbs_FACE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE); for (; ex.More(); ex.Next()) { const F = oc.TopoDS.Face(ex.Current()), ad = new oc.BRepAdaptor_Surface(F, true); if (ad.GetType() !== 'GeomAbs_Plane' && ad.GetType() !== 'GeomAbs_Cylinder') out.push({ F, ad }); } return out; };
  const live = [], T = (o) => { if (o && typeof o.delete === 'function') live.push(o); return o; };   // OCCT objects freed after each face
  const cases = [];
  for (const [name, r] of Object.entries(shapes)) for (const { F, ad } of facesOf(r.shape)) cases.push({ name, F, ad, rec: BS.exactSurface(oc, T, F, ad), occt: ad.GetType().replace('GeomAbs_', '') });
  {
    const sph = new oc.Geom_SphericalSurface(new oc.gp_Ax3(new oc.gp_Pnt(1, 2, 3), new oc.gp_Dir(0.3, 0.4, 0.866), new oc.gp_Dir(0.8, -0.6, 0)), 12);
    const bs = oc.GeomConvert.SurfaceToBSplineSurface(sph), mk = new oc.BRepBuilderAPI_MakeFace(bs, 1e-7), F = mk.Face(), ad = new oc.BRepAdaptor_Surface(F, true);
    cases.push({ name: 'rational B-spline sphere', F, ad, rec: BS.exactSurface(oc, T, F, ad), occt: ad.GetType().replace('GeomAbs_', ''), rational: bs.IsURational() || bs.IsVRational(), R: 12, C: [1, 2, 3] });
  }
  const want = { sphere: 'sphere', torus: 'torus', cone: 'cone', revolution: 'revolution', extrusion: 'extrusion', bspline: 'bspline', 'rational B-spline sphere': 'bspline' };
  ok(cases.every((c) => c.rec && c.rec.type === want[c.name]), `every curved face has its exact record: ${cases.map((c) => `${c.name} (${c.occt}) → ${c.rec ? c.rec.type : 'none'}`).join(', ')}`);
  ok(cases.find((c) => c.name === 'rational B-spline sphere').rational && !!cases.find((c) => c.name === 'rational B-spline sphere').rec.W, 'the converted sphere is a rational B-spline and its record carries the weights');
  let rnd = 7; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  for (const c of cases) {
    if (!c.rec) continue;
    const g = oc.BRep_Tool.Surface(c.F), [u0, u1, v0, v1] = c.rec.range;
    let size = 0; const corner = c.ad.EvalD0(u0, v0); for (const [u, v] of [[u1, v0], [u0, v1], [u1, v1], [(u0 + u1) / 2, (v0 + v1) / 2]]) { const q = c.ad.EvalD0(u, v); size = Math.max(size, Math.hypot(q.X() - corner.X(), q.Y() - corner.Y(), q.Z() - corner.Z())); }
    let onS = 0, foot = 0, farther = -Infinity, orth = 0, n = 0; const t0 = Date.now();
    for (let k = 0; k < 150; k++) {
      // a point near the face: off a random interior surface point along its normal by up to ±0.5 mm, plus ±0.1 mm sideways
      const u = u0 + (0.1 + 0.8 * rand()) * (u1 - u0), v = v0 + (0.1 + 0.8 * rand()) * (v1 - v0), p = c.ad.EvalD0(u, v), du = c.ad.EvalDN(u, v, 1, 0), dv = c.ad.EvalDN(u, v, 0, 1);
      const nn = [du.Y() * dv.Z() - du.Z() * dv.Y(), du.Z() * dv.X() - du.X() * dv.Z(), du.X() * dv.Y() - du.Y() * dv.X()], nl = Math.hypot(...nn) || 1, off = rand() - 0.5;
      const q = [p.X() + off * nn[0] / nl + 0.2 * (rand() - 0.5), p.Y() + off * nn[1] / nl + 0.2 * (rand() - 0.5), p.Z() + off * nn[2] / nl + 0.2 * (rand() - 0.5)];
      const js = SU.closestOnSurface(c.rec, q);
      [p, du, dv].forEach(T);
      const pr = T(new oc.GeomAPI_ProjectPointOnSurf(T(new oc.gp_Pnt(q[0], q[1], q[2])), g, u0, u1, v0, v1, 1e-12, oc.Extrema_ExtAlgo.Extrema_ExtAlgo_Tree));
      if (!pr.NbPoints()) continue;
      const np = T(pr.NearestPoint());
      const back = T(new oc.GeomAPI_ProjectPointOnSurf(T(new oc.gp_Pnt(js.p[0], js.p[1], js.p[2])), g, u0, u1, v0, v1, 1e-12, oc.Extrema_ExtAlgo.Extrema_ExtAlgo_Grad));
      onS = Math.max(onS, back.NbPoints() ? back.LowerDistance() : Infinity);
      // optimality by OCCT's own derivatives at the JS foot point: q − p ⟂ ∂S/∂u, ∂S/∂v
      if (back.NbPoints()) { const { U, V } = back.LowerDistanceParameters(), su = T(c.ad.EvalDN(U, V, 1, 0)), sv = T(c.ad.EvalDN(U, V, 0, 1)), w = [q[0] - js.p[0], q[1] - js.p[1], q[2] - js.p[2]], wl = Math.hypot(...w);
        for (const t of [su, sv]) { const tl = Math.hypot(t.X(), t.Y(), t.Z()); if (wl > 1e-6 && tl > 1e-9) orth = Math.max(orth, Math.abs(w[0] * t.X() + w[1] * t.Y() + w[2] * t.Z()) / (wl * tl)); } }
      foot = Math.max(foot, Math.hypot(np.X() - js.p[0], np.Y() - js.p[1], np.Z() - js.p[2]));
      farther = Math.max(farther, Math.hypot(q[0] - js.p[0], q[1] - js.p[1], q[2] - js.p[2]) - pr.LowerDistance());
      n++;
      for (const o of live.splice(0)) { try { o.delete(); } catch { /* gone */ } }
    }
    const ms = Date.now() - t0;
    ok(n >= 140 && onS <= 1e-9 * size && orth <= 1e-9 && farther <= 1e-12 * size && foot <= 1e-9 * size, `${c.name} (${c.rec.type}${c.rec.type === 'bspline' ? ` ${c.rec.nu}×${c.rec.nv} poles, degree ${c.rec.ud}/${c.rec.vd}${c.rec.W ? ', rational' : ''}` : ''}): ${n} points near the face — the JS point lies on OCCT's surface to ${(onS / size).toExponential(1)} of its size (${size.toFixed(1)} mm) and is a true foot point by OCCT's derivatives there (cos to the tangents ≤ ${orth.toExponential(1)}); never farther from the point than OCCT's own projection (by ≤ ${farther.toExponential(1)} mm); the two foot points agree to ${(foot / size).toExponential(1)}`);
    row(`Closest point, ${c.name}`, 'GeomAPI_ProjectPointOnSurf (OCCT)', `on the surface to ${(onS / size).toExponential(1)}; orthogonal to ${orth.toExponential(1)}; foot points agree to ${(foot / size).toExponential(1)}`, '≤ 1e-9');
    void ms;
  }
  {
    const c = cases.find((x) => x.name === 'rational B-spline sphere');
    const r0 = SU.curvatureRadius(c.rec, [1 + 12, 2, 3], 0.5);
    ok(Math.abs(r0 / 12 - 1) < 0.02, `curvature radius from the exact normals on the rational sphere: ${r0.toFixed(3)} mm vs 12 (${pct(r0, 12)}; the size field uses it — the tessellation estimate read about a third of it)`);
  }
  // the regen: faces carry the records; a missing one is counted
  {
    const r = shapes.sphere;
    ok(r.faces.length === 1 && r.faces[0].surf && r.faces[0].surf.type === 'sphere' && near(r.faces[0].surf.r, 10, 1e-12), 'regenerateBrep: the sphere face carries surf {type sphere, r 10} (brep.js faceTableOf → brep-surf.js)');
    const tm = TM.tetMesh(r.mesh, r.faces.map(({ surf, ...rest }) => rest), { h: 5, curv: 0.25, thick: 1 });
    ok(tm.stats.tessFaces === 1 && tm.stats.exactFaces === 0 && tm.stats.tessTypes.join() === 'sphere', `a face without its record follows the tessellation and is counted (tessFaces ${tm.stats.tessFaces}, types ${tm.stats.tessTypes.join()})`);
    const bad = [
      { ...r.faces[0].surf, r: -1 }, { type: 'bspline', ud: 3, vd: 3, nu: 2, nv: 4, P: [], uk: [], vk: [], range: [0, 1, 0, 1] }, { ...r.faces[0].surf, range: [0, 1, 0] },
      { type: 'revolution', o: [0, 0, 0], d: [0, 1, 0], curve: { kind: 'nurbs', deg: 3, P: [0, 0, 0, 1, 1, 1], k: [0, 0, 1, 1], W: null }, range: [0, 1, 0, 1] }, { type: 'warp', range: [0, 1, 0, 1] },
    ];
    ok(bad.every((s) => SU.readSurface(s) === null) && TF.jobFaces({ faces: [{ type: 'sphere', surf: bad[0] }] })[0].surf === undefined, 'tampered surface records (negative radius, too few poles, short range, a curve whose degree its poles cannot carry, an unknown type) are refused; the face then follows the tessellation');
    const st = SIM.readSimStudy({ v: 1, kind: 'static', material: 'steel', h: 5, elem: 'h8i', mesher: 'tet', modes: 4, seq: 0, constraints: [], loads: [] });
    const { job } = SIM.simJob(st, r);
    ok(job.faces[0].surf && job.faces[0].surf.type === 'sphere', 'simJob hands the exact surface to the worker job');
  }

  section('exact surfaces: mesh volumes before (nodes on the tessellation) and after (on the exact surface), same mesh');
  const vol10 = (model) => { let V = 0; for (let e = 0; e < model.tets10.length / 10; e++) { const d = TM.t10DetJ(model.X, model.tets10.subarray(10 * e, 10 * e + 10)); V += (d[4] + d[5] + d[6] + d[7]) / 24; } return V; };
  // the same size field for both (computed with the exact curvature), so only where the nodes go differs
  const both = (r, h) => [false, true].map((exact) => { const bvh = TM.buildBVH(r.mesh), field = TM.sizeField(r.mesh, bvh, { h, curv: 0.25, thick: 1, levels: 3, faces: r.faces }); const m = TF.meshJob({ mesh: r.mesh, faces: r.faces, h, field, exactSurfaces: exact }); return { m, V: vol10(m.model) }; });
  for (const [name, h, exact] of [['sphere', 4, 4 / 3 * Math.PI * 1000], ['torus', 5, 2 * Math.PI ** 2 * 20 * 25], ['cone', 4, Math.PI * 100 * 15 / 3]]) {
    const [b, a] = both(shapes[name], h), eb = Math.abs(b.V / exact - 1), ea = Math.abs(a.V / exact - 1);
    ok(a.m.tm.stats.tets === b.m.tm.stats.tets && ea < eb / 10 && ea < 1e-4 && a.m.tm.stats.tessFaces === 0, `${name}: ${a.m.tm.stats.tets} tets — T10 volume ${pct(b.V, exact)} with the nodes on the tessellation, ${pct(a.V, exact)} on the exact surface (${(eb / ea).toFixed(0)}× smaller error)`);
    row(`Mesh volume, ${name} (T10, h ${h})`, `${exact.toFixed(3)} mm³ (exact)`, `before ${b.V.toFixed(3)}, after ${a.V.toFixed(3)}`, `${pct(b.V, exact)} → ${pct(a.V, exact)}`);
  }

  section('exact surfaces: a pressurised thick sphere (Lamé), before and after');
  {
    const a = 10, b = 20, p = 10, E = 2e5, nu = 0.26;
    const r = thick, inner = r.faces.findIndex((f) => f.surf && f.surf.type === 'sphere' && near(f.surf.r, a, 1e-9)), planes = r.faces.map((f, i) => (f.type === 'plane' ? i : -1)).filter((i) => i >= 0);
    const A = p * a ** 3 / (b ** 3 - a ** 3), Bc = p * a ** 3 * b ** 3 / (2 * (b ** 3 - a ** 3)), sth = A + Bc / a ** 3, ua = ((1 - 2 * nu) * A * a + (1 + nu) * Bc / a ** 2) / E;
    const mat = { name: 'steel-like', E, nu, density: 7850, yield: 250 }, h = 5;
    const run = (exact) => {
      const bvh = TM.buildBVH(r.mesh), field = TM.sizeField(r.mesh, bvh, { h, curv: 0.25, thick: 1, levels: 3, faces: r.faces });
      const res = TF.solveTetStudy({ mesh: r.mesh, faces: r.faces, field, exactSurfaces: exact, material: mat, h, kind: 'static', bcs: { constraints: [{ type: 'frictionless', faces: planes }], loads: [{ type: 'pressure', faces: [inner], p }] } });
      const X = res.model.X; let hoop = 0, u = 0, c = 0, dev = 0;
      for (let n = 0; n < res.model.n; n++) {
        const q = [X[3 * n], X[3 * n + 1], X[3 * n + 2]], rr = Math.hypot(...q);
        if (Math.abs(rr - a) > 1e-6) continue;
        const e = q.map((x) => x / rr), s = res.sigN.subarray(6 * n, 6 * n + 6), srr = s[0] * e[0] ** 2 + s[1] * e[1] ** 2 + s[2] * e[2] ** 2 + 2 * (s[3] * e[0] * e[1] + s[4] * e[1] * e[2] + s[5] * e[0] * e[2]);
        hoop += (s[0] + s[1] + s[2] - srr) / 2; u += res.u[3 * n] * e[0] + res.u[3 * n + 1] * e[1] + res.u[3 * n + 2] * e[2]; c++;
      }
      const bt = res.model.btri6; for (let t = 0; t < bt.length / 6; t++) if (res.model.bface[t] === inner) for (let k = 0; k < 6; k++) { const v = bt[6 * t + k]; dev = Math.max(dev, Math.abs(Math.hypot(X[3 * v], X[3 * v + 1], X[3 * v + 2]) - a)); }
      return { res, hoop: c ? hoop / c : NaN, u: c ? u / c : NaN, c, dev };
    };
    const t0 = Date.now(), before = run(false), after = run(true);
    log(`thick sphere a ${a} b ${b}, p ${p} MPa, octant, h ${h}: ${after.res.summary.elements} T10 (${Date.now() - t0} ms for both); bore nodes before ${before.c} (on the tessellation: within ${before.dev.toExponential(1)} mm of r = a; a node counts as on the bore at 1e-6), after ${after.c}`);
    const eh = (x) => Math.abs(x / sth - 1), eu = (x) => Math.abs(x / ua - 1);
    ok(after.res.summary.elements === before.res.summary.elements && after.dev < 1e-12 && before.dev > 1e-4, `boundary and midside nodes of the bore on the exact sphere (worst ${after.dev.toExponential(1)} mm; on the tessellation they were up to ${before.dev.toExponential(1)} mm off)`);
    ok(eh(after.hoop) < 0.002 && eu(after.u) < 0.001, `Lamé (sphere): hoop stress at the bore ${after.hoop.toFixed(4)} MPa vs p(b³ + 2a³)/2(b³ − a³) = ${sth.toFixed(4)} (${pct(after.hoop, sth)}); radial displacement ${pct(after.u, ua)}`);
    row('Thick sphere a 10 b 20, p 10: hoop at the bore', `Lamé ${sth.toFixed(4)} MPa`, `after ${after.hoop.toFixed(4)} (before: ${Number.isFinite(before.hoop) ? before.hoop.toFixed(4) : 'no node on r = a'})`, `${pct(after.hoop, sth)}`);
    row('Thick sphere: radial displacement at the bore', `${ua.toExponential(5)} mm`, `after ${after.u.toExponential(5)}`, pct(after.u, ua));
    // before: the bore nodes are not on r = a; measure at the nodes of the bore face instead
    const onBore = (rr) => { const X = rr.res.model.X, bt = rr.res.model.btri6, seen = new Set(); let hoop = 0, u = 0, c = 0; for (let t = 0; t < bt.length / 6; t++) if (rr.res.model.bface[t] === inner) for (let k = 0; k < 6; k++) { const v = bt[6 * t + k]; if (seen.has(v)) continue; seen.add(v); const q = [X[3 * v], X[3 * v + 1], X[3 * v + 2]], R = Math.hypot(...q), e = q.map((x) => x / R), s = rr.res.sigN.subarray(6 * v, 6 * v + 6), srr = s[0] * e[0] ** 2 + s[1] * e[1] ** 2 + s[2] * e[2] ** 2 + 2 * (s[3] * e[0] * e[1] + s[4] * e[1] * e[2] + s[5] * e[0] * e[2]); hoop += (s[0] + s[1] + s[2] - srr) / 2; u += rr.res.u[3 * v] * e[0] + rr.res.u[3 * v + 1] * e[1] + rr.res.u[3 * v + 2] * e[2]; c++; } return { hoop: hoop / c, u: u / c }; };
    const bb = onBore(before), aa = onBore(after);
    ok(eh(aa.hoop) <= eh(bb.hoop) && eu(aa.u) < eu(bb.u) / 5, `averaged over every node of the bore face: radial displacement ${pct(bb.u, ua)} → ${pct(aa.u, ua)}, hoop ${pct(bb.hoop, sth)} → ${pct(aa.hoop, sth)} (tessellation → exact; the hoop stress was already close: the tessellation sits within ${before.dev.toExponential(1)} mm of the bore)`);
    row('Thick sphere, bore face mean hoop (same mesh)', `${sth.toFixed(4)} MPa`, `before ${bb.hoop.toFixed(4)}, after ${aa.hoop.toFixed(4)}`, `${pct(bb.hoop, sth)} → ${pct(aa.hoop, sth)}`);
    row('Thick sphere, bore face mean radial displacement', `${ua.toExponential(5)} mm`, `before ${bb.u.toExponential(5)}, after ${aa.u.toExponential(5)}`, `${pct(bb.u, ua)} → ${pct(aa.u, ua)}`);
  }
  for (const r of Object.values(shapes)) if (r.shape) r.shape.delete();
  log('verification (case | reference | result | error):');
  for (const r of table) log(`  ${r.join(' | ')}`);
  return table;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runTetExactTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
