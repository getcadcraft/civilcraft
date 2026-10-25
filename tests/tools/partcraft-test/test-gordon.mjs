#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-gordon.mjs — Gordon (curve-network) surfaces: the B-spline math of gordon.js and the `gordon` feature of the part
 * history (surface.js). References are independent of the code under test: closed-form surfaces the networks are cut
 * from (a bicubic Bézier patch evaluated by Bernstein polynomials, a cylinder, a cone frustum, a bilinear patch), the
 * analytic input curves themselves, and OpenCascade measuring the exact surface we hand it (GeomAPI_ProjectPointOnSurf
 * distances, BRepGProp volumes and areas, sewing).
 *   node tools/partcraft-test/test-gordon.mjs [--verbose]     (or runGordonTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runGordonTests({ ok, section, oc = null }) {
  // messages through t() (0.4) read as words with the English catalog
  (await import(DEV + 'i18n.js')).init({ locale: 'en', strings: JSON.parse((await import('node:fs')).readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const V = await import(DEV + 'vec.js');
  const G = await import(DEV + 'gordon.js');
  const SU = await import(DEV + 'surface.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const S = await import(DEV + 'sketch.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const PI = Math.PI;
  const dist = (a, b) => V.len(V.sub(a, b));
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const allOk = (r) => [...r.results.values()].every((x) => x.status === 'ok');
  const e1 = (v) => v.toExponential(1);

  // ---- references
  // a bicubic Bézier patch, evaluated by Bernstein polynomials (not by gordon.js)
  const BZ = [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => [100 * i / 3, 80 * j / 3, 20 * Math.sin(i * 1.3 + j * 0.7) + 5 * i * j - 8]));
  const bern = (t) => [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
  const Sref = (u, v) => { const bu = bern(u), bv = bern(v), o = [0, 0, 0]; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let a = 0; a < 3; a++) o[a] += bu[i] * bv[j] * BZ[i][j][a]; return o; };
  const isoPoles = (u, dirU) => { const b = bern(u); return [0, 1, 2, 3].map((k) => { const o = [0, 0, 0]; for (let q = 0; q < 4; q++) for (let a = 0; a < 3; a++) o[a] += b[q] * (dirU ? BZ[q][k][a] : BZ[k][q][a]); return o; }); };
  const BEZ = [0, 0, 0, 0, 1, 1, 1, 1];
  const uIso = (u) => G.samplerCurve((t) => Sref(u, t), { bs: { p: 3, U: BEZ, P: isoPoles(u, true) }, label: `u = ${u}` });
  const vIso = (v) => G.samplerCurve((t) => Sref(t, v), { bs: { p: 3, U: BEZ, P: isoPoles(v, false) }, label: `v = ${v}` });
  /** Largest distance from the reference surface's grid to the Gordon surface (profiles = u isos: the surface's s runs along v). */
  const vsRef = (surf, swap = true) => { let m = 0; for (let a = 0; a <= 50; a++) for (let b = 0; b <= 50; b++) m = Math.max(m, dist(swap ? G.evalSurface(surf, b / 50, a / 50) : G.evalSurface(surf, a / 50, b / 50), Sref(a / 50, b / 50))); return m; };
  /** OpenCascade's distance from points to a gordon.js surface handed over as a Geom_BSplineSurface. */
  const occtDist = (surf, pts) => {
    const live = [];
    const T = (o) => { live.push(o); return o; };
    try {
      const gs = SU.bsplineSurface(oc, T, surf);
      let m = 0;
      for (const p of pts) {
        const pr = T(new oc.GeomAPI_ProjectPointOnSurf(T(new oc.gp_Pnt(p[0], p[1], p[2])), gs));
        m = Math.max(m, pr.NbPoints() ? pr.LowerDistance() : Infinity);
      }
      return m;
    } finally { for (const o of live) try { o.delete(); } catch { /* gone */ } }
  };
  const samples = (c, n = 60) => Array.from({ length: n + 1 }, (_, k) => c.f(k / n));

  // =======================================================================================
  section('gordon: B-spline building blocks');
  {
    const c = { p: 3, U: [0, 0, 0, 0, 0.3, 0.6, 1, 1, 1, 1], P: [[0, 0, 0], [10, 20, 5], [30, 25, -5], [45, 5, 10], [60, -10, 0], [80, 0, 3]] };
    const e = G.elevate(c, 5);
    let m = 0; for (let k = 0; k <= 200; k++) m = Math.max(m, dist(G.evalCurve(c, k / 200), G.evalCurve(e, k / 200)));
    ok(e.p === 5 && e.P.length === 6 + 2 * 3 && m < 1e-12, `degree 3 → 5 by interpolation at the Greville points: the same curve (${e1(m)} mm at 201 points), ${e.P.length} control points`);
    const Q = [[0, 0, 0], [10, 3, 1], [25, -2, 4], [40, 6, 0], [55, 1, -3], [70, 0, 0]];
    const t = [0, 0.1, 0.35, 0.5, 0.8, 1];
    const it = G.interpolate(Q, t, 3);
    ok(Q.every((q, k) => dist(G.evalCurve(it, t[k]), q) < 1e-12), 'global cubic interpolation (knots by averaging) passes through its points to 1e-12');
    const U = G.averagedKnots(t, 3);
    ok(U.length === t.length + 4 && Math.abs(U[4] - (0.1 + 0.35 + 0.5) / 3) < 1e-15, 'averaged knots: NURBS Book eq. 9.8');
  }

  section('gordon: networks cut from known surfaces');
  {
    // bicubic patch: 4 × 3 and 5 × 5 iso-curve networks give back the patch
    for (const [us, vs] of [[[0, 0.3, 0.7, 1], [0, 0.5, 1]], [[0, 0.2, 0.45, 0.8, 1], [0, 0.1, 0.6, 0.9, 1]]]) {
      const r = G.gordon(us.map(uIso), vs.map(vIso), { tol: 1e-6 });
      const d = vsRef(r.surface);
      ok(r.report.exact && d < 1e-10 * r.report.size, `bicubic patch from a ${us.length} × ${vs.length} iso-curve network: exact path, the patch back to ${e1(d)} mm at 51² points (size ${r.report.size.toFixed(0)} mm)`);
    }
    // order and direction do not matter: shuffled and reversed curves give the same surface
    {
      const rv = (c) => G.samplerCurve((t) => c.f(1 - t), { bs: { p: c.bs.p, U: c.bs.U.slice().reverse().map((u) => 1 - u), P: c.bs.P.slice().reverse() }, label: c.label + ' reversed' });
      const r = G.gordon([uIso(0.7), rv(uIso(0)), uIso(1), rv(uIso(0.3))], [vIso(1), rv(vIso(0.5)), vIso(0)], { tol: 1e-6 });
      ok(r.report.exact && vsRef(r.surface) < 1e-10 * r.report.size, `the same network shuffled with half its curves reversed: sorted and turned round, the same patch (${e1(vsRef(r.surface))} mm)`);
      const o = G.evalSurface(r.surface, 0, 0);
      ok(dist(o, Sref(0, 0)) < 1e-9, 'its parameter origin is the patch corner the first profile and guide share');
    }
    // the same patch through OpenCascade: projections of the analytic curves and the reference surface onto our Geom_BSplineSurface
    {
      const prof = [0, 0.25, 0.6, 1].map(uIso), guid = [0, 0.4, 1].map(vIso);
      const r = G.gordon(prof, guid, { tol: 1e-6 });
      const curvePts = [...prof, ...guid].flatMap((c) => samples(c, 40));
      const refPts = []; for (let a = 0; a <= 12; a++) for (let b = 0; b <= 12; b++) refPts.push(Sref(a / 12, b / 12));
      const dc = occtDist(r.surface, curvePts), dr = occtDist(r.surface, refPts);
      ok(dc < 1e-9 * r.report.size && dr < 1e-9 * r.report.size, `OpenCascade: every curve (287 points) lies on the Geom_BSplineSurface within ${e1(dc)} mm, the reference patch (169 points) within ${e1(dr)} mm`);
    }
    // 2 × 2 straight lines → the bilinear patch
    {
      const a = [0, 0, 0], b = [100, 0, 10], c = [0, 80, 30], d = [100, 80, -20];
      const r = G.gordon([G.lineCurve(a, b, 'ab'), G.lineCurve(c, d, 'cd')], [G.lineCurve(a, c, 'ac'), G.lineCurve(b, d, 'bd')]);
      let m = 0;
      for (let u = 0; u <= 20; u++) for (let v = 0; v <= 20; v++) {
        const U = u / 20, W = v / 20;
        const ref = V.add(V.add(V.mul(a, (1 - U) * (1 - W)), V.mul(b, U * (1 - W))), V.add(V.mul(c, (1 - U) * W), V.mul(d, U * W)));
        m = Math.max(m, dist(G.evalSurface(r.surface, U, W), ref));
      }
      ok(r.report.degree.join() === '1,1' && r.report.poles.join() === '2,2' && m < 1e-12, `2 × 2 lines: a bilinear patch (degree 1 × 1, 2 × 2 control points), = (1−u)(1−v)a + u(1−v)b + (1−u)v c + uv d to ${e1(m)} mm`);
    }
    // cylinder patch: arcs × straight lines (arcs are rational, so they are fitted)
    {
      const R = 50;
      const arc = (z) => G.samplerCurve((t) => [R * Math.cos(t * PI / 2), R * Math.sin(t * PI / 2), z], { label: `arc z ${z}` });
      const line = (deg) => { const th = deg * PI / 180; return G.lineCurve([R * Math.cos(th), R * Math.sin(th), 0], [R * Math.cos(th), R * Math.sin(th), 100], `line ${deg}°`); };
      const prof = [arc(0), arc(40), arc(100)], guid = [0, 20, 55, 90].map(line);
      const r = G.gordon(prof, guid);
      let m = 0; for (let u = 0; u <= 200; u++) for (let v = 0; v <= 40; v++) { const p = G.evalSurface(r.surface, u / 200, v / 40); m = Math.max(m, Math.abs(Math.hypot(p[0], p[1]) - R)); }
      ok(!r.report.exact && m < 1e-7 * r.report.size, `cylinder patch from 3 arcs × 4 lines: within ${e1(m)} mm of the cylinder r 50 everywhere (${(m / r.report.size).toExponential(1)} of the size; arcs fitted within ${e1(r.report.fitErr)})`);
      const dc = occtDist(r.surface, [...prof, ...guid].flatMap((c) => samples(c, 50)));
      ok(dc < 1e-6 * r.report.size && r.report.dev < 1e-6 * r.report.size, `OpenCascade: the arcs and lines lie on the surface within ${e1(dc)} mm (< 1e-6 of the size; the builder's own check ${e1(r.report.dev)})`);
    }
    // unevenly parametrised arcs that overhang the outer guides: reparametrised and trimmed, still through every curve
    {
      const R = 50;
      const arc = (z, a0, a1) => G.samplerCurve((t) => { const w = t * t * (3 - 2 * t) * 0.3 + 0.7 * t; const th = a0 + (a1 - a0) * w; return [R * Math.cos(th), R * Math.sin(th), z]; }, { label: `arc z ${z}` });
      const line = (deg) => { const th = deg * PI / 180; return G.lineCurve([R * Math.cos(th), R * Math.sin(th), -10], [R * Math.cos(th), R * Math.sin(th), 110], `line ${deg}°`); };
      const prof = [arc(0, -0.2, 1.7), arc(40, 0, 1.6), arc(100, -0.1, 2)], guid = [0, 20, 55, 90].map(line);
      const r = G.gordon(prof, guid);
      // the curves between the outer crossings (the trimmed network)
      const inner = [];
      for (const z of [0, 40, 100]) for (let k = 0; k <= 60; k++) { const th = PI / 2 * k / 60; inner.push([R * Math.cos(th), R * Math.sin(th), z]); }
      for (const deg of [0, 20, 55, 90]) for (let k = 0; k <= 30; k++) { const th = deg * PI / 180; inner.push([R * Math.cos(th), R * Math.sin(th), 100 * k / 30]); }
      const dc = occtDist(r.surface, inner);
      const c00 = G.evalSurface(r.surface, 0, 0), c11 = G.evalSurface(r.surface, 1, 1);
      ok(dc < 1e-6 * r.report.size && dist(c00, [R, 0, 0]) < 1e-9 && dist(c11, [0, R, 100]) < 1e-9, `overhanging, unevenly parametrised arcs: trimmed at the outer guides (corners (50, 0, 0) and (0, 50, 100)), every curve on the surface within ${e1(dc)} mm`);
    }
    // closed profiles: a cone frustum from two circles and four lines
    {
      const circ = (z, R) => G.samplerCurve((t) => [R * Math.cos(2 * PI * t), R * Math.sin(2 * PI * t), z], { closed: true, label: `circle z ${z}` });
      const gl = (th) => G.lineCurve([50 * Math.cos(th), 50 * Math.sin(th), 0], [25 * Math.cos(th), 25 * Math.sin(th), 100], 'line');
      const r = G.gordon([circ(100, 25), circ(0, 50)], [0, 1, 2, 3].map((k) => gl(k * PI / 2 + 0.3)));
      let m = 0; for (let u = 0; u <= 400; u++) for (let v = 0; v <= 20; v++) { const p = G.evalSurface(r.surface, u / 400, v / 20); m = Math.max(m, Math.abs(Math.hypot(p[0], p[1]) - (50 - p[2] / 4))); }
      const seam = Math.max(...Array.from({ length: 21 }, (_, k) => dist(G.evalSurface(r.surface, 0, k / 20), G.evalSurface(r.surface, 1, k / 20))));
      ok(r.report.closedU && m < 1e-7 * r.report.size && seam < 1e-12, `two circles × four lines: a closed cone frustum within ${e1(m)} mm of the cone; the seam closes to ${e1(seam)} mm`);
    }
  }

  section('gordon: G0 at the boundaries');
  {
    const prof = [0, 0.3, 0.7, 1].map(uIso), guid = [0, 0.5, 1].map(vIso);
    const r = G.gordon(prof, guid, { tol: 1e-6 });
    let m = 0;
    for (let k = 0; k <= 100; k++) {
      const t = k / 100;
      m = Math.max(m, dist(G.evalSurface(r.surface, t, 0), Sref(0, t)), dist(G.evalSurface(r.surface, t, 1), Sref(1, t)), dist(G.evalSurface(r.surface, 0, t), Sref(t, 0)), dist(G.evalSurface(r.surface, 1, t), Sref(t, 1)));
    }
    ok(m < 1e-10, `the four edges of the surface are the four outer curves (${e1(m)} mm at 101 points each)`);
    // two networks sharing a guide: their surfaces sew along it (OpenCascade finds one shared edge)
    const second = (u, v) => { const p = Sref(1 - u, v); return [200 - p[0], p[1], p[2]]; };   // the patch mirrored about x = 100
    const uIso2 = (u) => G.samplerCurve((t) => second(u, t), { label: `u2 = ${u}` });
    const vIso2 = (v) => G.samplerCurve((t) => second(t, v), { label: `v2 = ${v}` });
    const r2 = G.gordon([0, 0.5, 1].map(uIso2), [0, 0.5, 1].map(vIso2), { tol: 1e-6 });
    const live = [];
    const T = (o) => { if (o && typeof o.delete === 'function') live.push(o); return o; };
    try {
      const faces = [r.surface, r2.surface].map((s) => T(T(new oc.BRepBuilderAPI_MakeFace(SU.bsplineSurface(oc, T, s), 1e-9)).Face()));
      const st = SU.stitchShapes(oc, faces, { tol: 1e-6, T });
      ok(!st.closed && st.free === 6, `two networks sharing the curve x = 100 sew at a 1e-6 mm tolerance: 6 open edges of 8 (the shared boundary is one edge — G0)`);
    } finally { for (const o of live.reverse()) try { o.delete(); } catch { /* gone */ } }
  }

  section('gordon: tangent to planes along boundary curves (0.4 P11)');
  {
    // an arch: flat profiles at y 0 and 100 on the floor z 0, one raised at y 50; three guides climbing over it
    const sinc = (t) => Math.sin(PI * t);
    const profiles = [G.lineCurve([0, 0, 0], [100, 0, 0], 'front'), G.samplerCurve((t) => [100 * t, 50, 20 + 10 * sinc(t)], { label: 'ridge' }), G.lineCurve([0, 100, 0], [100, 100, 0], 'back')];
    const guides = (flat) => [[0, 80], [50, 120], [100, 80]].map(([x, h]) => G.samplerCurve((s) => [x, 100 * s, flat ? 2 * h * s * s * (1 - s) : h * s * (1 - s)], { label: 'x' + x }));
    const floor = { o: [0, 0, 0], n: [0, 0, 1] };
    /** The largest angle (°) between the floor and the surface's slope leaving the edge v = e. */
    const slope = (Sf, e) => { let w = 0; for (let k = 0; k <= 64; k++) { const u = k / 64, a = G.evalSurface(Sf, u, e), b = G.evalSurface(Sf, u, e ? 1 - 1e-7 : 1e-7), d = V.sub(b, a); w = Math.max(w, Math.asin(Math.min(1, Math.abs(d[2]) / V.len(d))) * 180 / PI); } return w; };
    const free = G.gordon(profiles, guides(false));
    const g1 = G.gordon(profiles, guides(false), { tangent: [floor] });
    ok(slope(free.surface, 0) > 45 && slope(g1.surface, 0) < 1e-3 && g1.report.tangent.length === 1 && g1.report.tangent[0].side === 'v0' && Math.abs(g1.report.tangent[0].angle - slope(free.surface, 0)) < 0.5, `tangent to the floor along the front profile: it left the floor at up to ${slope(free.surface, 0).toFixed(1)}°, now at ${slope(g1.surface, 0).toExponential(1)}° (the slope of 1e-7 steps)`);
    const ridge = (Sf, gg) => Math.max(...[0, 0.25, 0.5, 0.75, 1].map((u) => V.len(V.sub(G.evalSurface(Sf, u, gg.params.v[1]), profiles[1].f(u)))));
    ok(ridge(g1.surface, g1) < 1e-9 && g1.report.dev > 1 && /tangent along Profile 1 \(front\)/.test(G.describeGordon(g1.report)), `the ridge profile is untouched (${ridge(g1.surface, g1).toExponential(1)} mm); the guides, which climb at ~50°, are bent near the edge by ${g1.report.dev.toFixed(2)} mm and the report says so`);
    const flat = G.gordon(profiles, guides(true), { tangent: [floor] });
    ok(flat.report.dev < 1e-6 * flat.report.size && slope(flat.surface, 0) < 1e-3, `guides that leave the floor flat: followed within ${flat.report.dev.toExponential(1)} mm, and tangent`);
    const both = G.gordon(profiles, guides(true), { tangent: [floor, floor] });
    ok(both.report.tangent.map((x) => x.side).join() === 'v0,v1' && slope(both.surface, 0) < 1e-3 && slope(both.surface, 1) < 1e-3, 'the floor given twice: tangent along the front and the back profile');
    ok(throws(() => G.gordon(profiles, guides(true), { tangent: [{ o: [0, 0, 50], n: [0, 0, 1] }] }), /No boundary curve of the network lies in the plane/), 'a plane no boundary curve lies in is refused in words');
    ok(throws(() => G.gordon(profiles, guides(true), { tangent: [floor, floor, floor] }), /No boundary curve/), 'a third copy of the floor (no free boundary left in it) is refused');
  }

  section('gordon: networks that do not fit are refused');
  {
    const a = [0, 0, 0], b = [100, 0, 0], c = [0, 80, 0], d = [100, 80, 0];
    const L = G.lineCurve;
    ok(throws(() => G.gordon([L(a, b, 'ab')], [L(a, c, 'ac'), L(b, d, 'bd')]), /at least two profiles and two guides/), 'one profile: "at least two profiles and two guides"');
    ok(throws(() => G.gordon([L(a, b, 'ab'), L(c, d, 'cd')], [L(a, c, 'ac'), L([100, 0, 5], [100, 80, 5], 'high')]), /do not meet: they pass 5 mm apart \(the tolerance is 0\.01 mm\)/), 'a guide 5 mm above the profiles: "do not meet: they pass 5 mm apart (the tolerance is 0.01 mm)"');
    const zig = G.samplerCurve((t) => [100 * t, 80 * t, 0].map((v, k) => (k === 1 ? 40 + 60 * Math.sin(2 * PI * t) : v)), { label: 'wave' });
    ok(throws(() => G.gordon([L([0, 40, 0], [100, 40, 0], 'mid'), L(c, d, 'cd')], [L(a, c, 'ac'), zig]), /meets .* 2 times|meets .* 3 times/), 'a guide crossing a profile more than once: "meets … times: each profile crosses each guide once (a grid)"');
    // crossing order differs between profiles (a twisted, non-grid network)
    const p1 = L([0, 0, 0], [100, 0, 0], 'p1'), p2 = L([0, 80, 0], [100, 80, 0], 'p2');
    const g1 = L([10, 0, 0], [90, 80, 0], 'g1'), g2 = L([90, 0, 0], [10, 80, 0], 'g2');
    ok(throws(() => G.gordon([p1, p2], [g1, g2]), /different order|meets .* 0 times|not a grid|grid/), 'guides that swap places between the profiles: refused as not a grid');
    const circ = G.samplerCurve((t) => [50 + 30 * Math.cos(2 * PI * t), 40 + 30 * Math.sin(2 * PI * t), 0], { closed: true, label: 'circle' });
    ok(throws(() => G.gordon([circ, L(a, b, 'ab')], [L(a, c, 'ac'), L(b, d, 'bd')]), /mix open and closed/), 'open and closed profiles mixed: refused');
  }

  // =======================================================================================
  section('gordon feature: sketches and model edges through OpenCascade');
  const xb = (part) => B.regenerateBrep(part, oc);
  /** A sketch on the plane through o with normal n, holding the given world points as a control spline / lines / an arc. */
  const planeOf = (o, n) => ({ kind: 'fixed', o, n });
  const onPlane = (part, o, n, draw) => { const fr = V.frameFor(n, o); const sk = S.newSketch(); draw(sk, (p) => V.toPlane(fr, p)); return P.addFeature(part, 'sketch', { sketch: sk, plane: planeOf(o, n) }); };
  {
    // the bicubic patch from planar iso curves: z = h(x, y) with x = 100u, y = 80v is planar along every iso curve
    const H = [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => [100 * i / 3, 80 * j / 3, 15 * Math.cos(i + 2 * j) + 4 * i - 3 * j]));
    const Sh = (u, v) => { const bu = bern(u), bv = bern(v), o = [0, 0, 0]; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let a = 0; a < 3; a++) o[a] += bu[i] * bv[j] * H[i][j][a]; return o; };
    const iso = (t, alongV) => { const b = bern(t); return [0, 1, 2, 3].map((k) => { const o = [0, 0, 0]; for (let q = 0; q < 4; q++) for (let a = 0; a < 3; a++) o[a] += b[q] * (alongV ? H[q][k][a] : H[k][q][a]); return o; }); };
    const part = P.newPart();
    const profs = [0, 1 / 3, 0.75, 1].map((u) => onPlane(part, [100 * u, 0, 0], [1, 0, 0], (sk, L) => S.addSpline(sk, iso(u, true).map(L), { kind: 'control' })));
    const guids = [0, 0.5, 1].map((v) => onPlane(part, [0, 80 * v, 0], [0, 1, 0], (sk, L) => S.addSpline(sk, iso(v, false).map(L), { kind: 'control' })));
    const gf = P.addFeature(part, 'gordon', { profiles: profs.map((s) => ({ sketch: s.id })), guides: guids.map((s) => ({ sketch: s.id })) });
    const r = xb(part);
    const rep = r.results.get(gf.id).gordon;
    const sheet = r.sheets?.find((s) => s.feature === gf.id);
    ok(allOk(r) && rep && rep.exact && sheet && rep.profiles === 4 && rep.guides === 3, `Gordon feature from 4 + 3 sketch control splines on planes x / y = const: a surface body, exact path (${rep ? G.describeGordon(rep) : r.results.get(gf.id).message})`);
    // area against the reference patch's surface integral (Gauss–Legendre 12 × 12 per quarter)
    const GL = [[-0.9815606342467192, 0.0471753363865118], [-0.9041172563704749, 0.1069393259953184], [-0.7699026741943047, 0.1600783285433462], [-0.5873179542866175, 0.2031674267230659], [-0.3678314989981802, 0.2334925365383548], [-0.1252334085114689, 0.2491470458134028], [0.1252334085114689, 0.2491470458134028], [0.3678314989981802, 0.2334925365383548], [0.5873179542866175, 0.2031674267230659], [0.7699026741943047, 0.1600783285433462], [0.9041172563704749, 0.1069393259953184], [0.9815606342467192, 0.0471753363865118]];
    let area = 0;
    for (let qa = 0; qa < 2; qa++) for (let qb = 0; qb < 2; qb++) for (const [x, wx] of GL) for (const [y, wy] of GL) {
      const u = (qa + (x + 1) / 2) / 2, v = (qb + (y + 1) / 2) / 2, h = 1e-6;
      const su = V.mul(V.sub(Sh(u + h, v), Sh(u - h, v)), 1 / (2 * h)), sv = V.mul(V.sub(Sh(u, v + h), Sh(u, v - h)), 1 / (2 * h));
      area += wx * wy / 16 * V.len(V.cross(su, sv));
    }
    ok(sheet && Math.abs(sheet.area - area) / area < 1e-6, `its area by OpenCascade ${sheet?.area.toFixed(4)} mm² = the reference patch's ${area.toFixed(4)} mm² (${sheet ? e1(Math.abs(sheet.area - area) / area) : '?'} relative)`);
    // thicken uses it; the history saves and opens; dependencies
    const th = P.addFeature(part, 'thicken', { sheet: gf.id, t: 1, side: 'out', op: 'new' });
    const r2 = xb(part);
    ok(allOk(r2) && r2.stats && Math.abs(r2.stats.volume - area) / area < 2e-3, `Thicken 1 mm of the Gordon surface: a solid of ${r2.stats?.volume.toFixed(2)} mm³ ≈ area × 1 (curvature changes it by ~t²H: ${r2.stats ? ((r2.stats.volume - area) / area * 100).toFixed(3) : '?'} %)`);
    void th;
    const back = P.readPart(P.toJSON(part));
    ok(back.features.find((f) => f.type === 'gordon').guides.length === 3 && JSON.parse(P.toJSON(part)).version === 3, 'the Gordon feature saves and opens (file version 3)');
    ok(P.dependsOn(gf).length === 7 && profs.every((s) => P.dependsOn(gf).includes(s.id)), 'it depends on its 7 sketches');
    const SC = await import(DEV + 'script.js');
    const sback = SC.scriptToPart(SC.partToScript(part).text).part;
    ok(JSON.stringify(sback.features.find((f) => f.type === 'gordon')) === JSON.stringify(gf), 'PartCraft script: part → script → part keeps the Gordon feature unchanged');
    const del = JSON.parse(JSON.stringify(part));
    P.deleteFeatures(del, [guids[1].id]);
    ok(!del.features.some((f) => f.type === 'gordon' || f.type === 'thicken'), 'deleting a guide sketch deletes the Gordon surface and the thicken on it');
    const tamper = (mut, re, what) => { const j = JSON.parse(P.toJSON(part)); mut(j); ok(throws(() => P.readPart(JSON.stringify(j)), re), what); };
    const gi = part.features.indexOf(gf);
    tamper((j) => { j.features[gi].profiles[0].sketch = 'f99'; }, /a sketch of its profiles is bad/, 'a profile naming a missing sketch is refused');
    tamper((j) => { j.features[gi].guides = 'all'; }, /its guides is bad/, 'guides that are not a list are refused');
    tamper((j) => { j.features[gi].tol = 50; }, /tolerance is bad/, 'a tolerance of 50 mm is refused');
    tamper((j) => { j.features[gi].op = 'melt'; }, /operation is bad/, 'a bad operation is refused');
    tamper((j) => { j.features[gi].profiles[1] = { edge: { faces: ['f1.side:l9', '<script>'] } }; }, /an edge of its profiles is bad/, 'a malformed edge reference is refused');
    tamper((j) => { j.features[gi].guides[0].entities = [42]; }, /curves picked from a sketch/, 'non-string curve ids are refused');
    const K = await import(DEV + 'kernel.js');
    const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
    const M = await Module(); M.setup();
    const km = K.regenerate(part, M);
    ok(km.results.get(gf.id).status === 'skipped' && /exact kernel/.test(km.results.get(gf.id).message), 'the mesh kernel skips it, saying it needs the exact kernel');
  }
  {
    // 0.4 P11 through OpenCascade: a tent of sketch line chains, tangent to the floor along both outer profiles
    const part = P.newPart();
    const chain = (pts) => (sk, L) => { let prev = null; for (let i = 0; i + 1 < pts.length; i++) prev = S.addLine(sk, prev ? prev.p2 : L(pts[i]), L(pts[i + 1])); };
    const pr = [0, 50, 100].map((y) => onPlane(part, [0, y, 0], [0, 1, 0], chain([[0, y, y === 50 ? 20 : 0], [50, y, y === 50 ? 30 : 0], [100, y, y === 50 ? 20 : 0]])));
    const gu = [0, 50, 100].map((x) => onPlane(part, [x, 0, 0], [1, 0, 0], chain([[x, 0, 0], [x, 50, x === 50 ? 30 : 20], [x, 100, 0]])));
    const floor = { kind: 'fixed', o: [0, 0, 0], n: [0, 0, 1] };
    const gf = P.addFeature(part, 'gordon', { profiles: pr.map((s) => ({ sketch: s.id })), guides: gu.map((s) => ({ sketch: s.id })), tangent: [floor, floor] });
    const r = xb(part);
    const rep = r.results.get(gf.id)?.gordon;
    ok(allOk(r) && rep && rep.tangent.length === 2 && rep.tangent.every((x) => x.side[0] === 'v' && x.angle > 10), `a tent network, tangent to the floor plane along both outer profiles, through OpenCascade (${rep ? rep.tangent.map((x) => x.side + ' ' + x.angle.toFixed(1) + '°').join(', ') : r.results.get(gf.id)?.message})`);
    const back = P.readPart(P.toJSON(part)).features.find((f) => f.type === 'gordon');
    ok(back.tangent.length === 2 && back.tangent[0].kind === 'fixed' && back.tangent[0].n[2] === 1, 'the tangent planes are saved with the feature');
    const j = JSON.parse(P.toJSON(part)); j.features.find((f) => f.type === 'gordon').tangent = [floor, floor, floor, floor, floor];
    ok(throws(() => P.readPart(JSON.stringify(j)), /tangent planes is bad/), 'more than four tangent planes are refused');
  }
  {
    // a flat network of sketch lines (two sketches, two lines each) → thicken = 100 × 80 × 2 exactly
    const part = P.newPart();
    const pr = onPlane(part, [0, 0, 0], [0, 0, 1], (sk, L) => { S.addLine(sk, L([0, 0, 0]), L([100, 0, 0])); S.addLine(sk, L([0, 80, 0]), L([100, 80, 0])); });
    const gu = onPlane(part, [0, 0, 0], [0, 0, 1], (sk, L) => { S.addLine(sk, L([0, 0, 0]), L([0, 80, 0])); S.addLine(sk, L([100, 0, 0]), L([100, 80, 0])); });
    const gf = P.addFeature(part, 'gordon', { profiles: [{ sketch: pr.id }], guides: [{ sketch: gu.id }] });
    P.addFeature(part, 'thicken', { sheet: gf.id, t: 2, side: 'out', op: 'new' });
    const r = xb(part);
    ok(allOk(r) && Math.abs(r.stats.volume - 16000) < 1e-9 * 16000, `two separate lines per sketch are two curves each: a flat 2 × 2 network, thickened 2 = 100 × 80 × 2 = 16000 (${r.stats?.volume.toFixed(9)})`);
  }
  {
    // a cylinder patch from sketch arcs (planes z = const) and lines (planes through the axis), thickened outward
    const R = 50, part = P.newPart();
    const arcs = [0, 50, 100].map((z) => onPlane(part, [0, 0, z], [0, 0, 1], (sk, L) => { const c = L([0, 0, z]), s = L([R, 0, z]), e = L([0, R, z]); S.addArc(sk, c, s, e); }));
    const lines = [0, 30, 90].map((deg) => { const th = deg * PI / 180, d = [Math.cos(th), Math.sin(th), 0], n = [-Math.sin(th), Math.cos(th), 0]; return onPlane(part, [0, 0, 0], n, (sk, L) => S.addLine(sk, L(V.mul(d, R)), L(V.add(V.mul(d, R), [0, 0, 100])))); });
    const gf = P.addFeature(part, 'gordon', { profiles: arcs.map((s) => ({ sketch: s.id })), guides: lines.map((s) => ({ sketch: s.id })) });
    const r = xb(part);
    const sheet = r.sheets?.find((s) => s.feature === gf.id), rep = r.results.get(gf.id).gordon;
    const want = PI / 2 * R * 100;
    ok(allOk(r) && sheet && Math.abs(sheet.area - want) / want < 1e-6, `3 sketch arcs × 3 sketch lines: a quarter cylinder of area ${sheet?.area.toFixed(5)} = π/2·50·100 = ${want.toFixed(5)} (${sheet ? e1(Math.abs(sheet.area - want) / want) : r.results.get(gf.id).message} relative)`);
    ok(rep && rep.dev < 1e-6 * rep.size, `the surface follows every curve within ${rep ? e1(rep.dev) : '?'} mm (< 1e-6 of the ${rep?.size.toFixed(0)} mm network)`);
    P.addFeature(part, 'thicken', { sheet: gf.id, t: 2, side: 'out', op: 'new' });
    const r2 = xb(part);
    const vOut = PI / 4 * ((R + 2) ** 2 - R ** 2) * 100, vIn = PI / 4 * (R ** 2 - (R - 2) ** 2) * 100;
    const v = r2.stats?.volume || 0, err = Math.min(Math.abs(v - vOut) / vOut, Math.abs(v - vIn) / vIn);
    ok(allOk(r2) && err < 1e-5, `thickened 2 mm: ${v.toFixed(3)} mm³ = the exact quarter tube ${Math.abs(v - vOut) < Math.abs(v - vIn) ? vOut.toFixed(3) + ' (outward)' : vIn.toFixed(3) + ' (inward)'} within ${e1(err)}`);
  }
  {
    // closed profiles + caps → a solid frustum, named faces
    const part = P.newPart();
    const c0 = onPlane(part, [0, 0, 0], [0, 0, 1], (sk, L) => S.addCircle(sk, L([0, 0, 0]), 50));
    const c1 = onPlane(part, [0, 0, 100], [0, 0, 1], (sk, L) => S.addCircle(sk, L([0, 0, 100]), 25));
    const gl = [15, 100, 200, 290].map((deg) => { const th = deg * PI / 180, d = [Math.cos(th), Math.sin(th), 0], n = [-Math.sin(th), Math.cos(th), 0]; return onPlane(part, [0, 0, 0], n, (sk, L) => S.addLine(sk, L(V.mul(d, 50)), L(V.add(V.mul(d, 25), [0, 0, 100])))); });
    const gf = P.addFeature(part, 'gordon', { profiles: [{ sketch: c0.id }, { sketch: c1.id }], guides: gl.map((s) => ({ sketch: s.id })), solid: true, op: 'new' });
    const r = xb(part);
    const want = PI * 100 / 3 * (50 * 50 + 50 * 25 + 25 * 25);
    const names = r.faces?.map((f) => f.name).sort().join() || '';
    ok(allOk(r) && Math.abs(r.stats.volume - want) / want < 1e-6, `2 circles × 4 lines, closed to a solid: a frustum of ${r.stats?.volume.toFixed(3)} mm³ = πh/3·(R² + Rr + r²) = ${want.toFixed(3)} (${r.stats ? e1(Math.abs(r.stats.volume - want) / want) : r.results.get(gf.id).message} relative)`);
    ok(names === `${gf.id}.end,${gf.id}.gordon:0,${gf.id}.start` && r.stats.bodies === 1, `faces ${names}: start cap on the first profile, the network surface, end cap`);
    // an open network cannot close; a profile that is not flat cannot be capped
    const op = P.newPart();
    const a = onPlane(op, [0, 0, 0], [0, 0, 1], (sk, L) => { S.addLine(sk, L([0, 0, 0]), L([100, 0, 0])); S.addLine(sk, L([0, 80, 0]), L([100, 80, 0])); });
    const b = onPlane(op, [0, 0, 0], [0, 0, 1], (sk, L) => { S.addLine(sk, L([0, 0, 0]), L([0, 80, 0])); S.addLine(sk, L([100, 0, 0]), L([100, 80, 0])); });
    const of = P.addFeature(op, 'gordon', { profiles: [{ sketch: a.id }], guides: [{ sketch: b.id }], solid: true, op: 'new' });
    const ro = xb(op);
    ok(ro.results.get(of.id).status === 'error' && /open network does not bound a solid/.test(ro.results.get(of.id).message), 'an open network with "close to a solid" is refused: "An open network does not bound a solid…"');
    // join to a body: a frustum added on top of a block
    const jp = JSON.parse(JSON.stringify(part));
    jp.features.find((f) => f.type === 'gordon').op = 'add';
    const blk = S.newSketch(); S.addRect(blk, [-60, -60], [60, 60]);
    const bs = P.addFeature(jp, 'sketch', { sketch: blk, plane: { kind: 'base', name: 'front' } });
    const ex = P.addFeature(jp, 'extrude', { sketch: bs.id, op: 'add', end: 'blind', depth: 10, reverse: true });
    P.moveFeature?.(jp, bs.id, 0); P.moveFeature?.(jp, ex.id, 1);
    jp.features = [jp.features.find((f) => f.id === bs.id), jp.features.find((f) => f.id === ex.id), ...jp.features.filter((f) => f.id !== bs.id && f.id !== ex.id)];
    const rj = xb(jp);
    ok(allOk(rj) && Math.abs(rj.stats.volume - (want + 120 * 120 * 10)) / (want + 144000) < 1e-6 && rj.stats.bodies === 1, `operation Join: the frustum fused onto a 120 × 120 × 10 block below it = one body of ${rj.stats?.volume.toFixed(2)} mm³ (frustum + 144000)`);
  }
  {
    // model edges as curves: the four top edges of a block span its top face
    const part = P.newPart();
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 80]);
    const s1 = P.addFeature(part, 'sketch', { sketch: sk, plane: { kind: 'base', name: 'front' } });
    const ex = P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 20 });
    const r0 = xb(part);
    const top = r0.edges.filter((e) => e.faces.includes(`${ex.id}.end`));
    const along = (e, axis) => Math.abs(V.sub(e.b, e.a)[axis]) > 1;
    const gf = P.addFeature(part, 'gordon', { profiles: top.filter((e) => along(e, 0)).map((e) => ({ edge: B.edgeRef(e) })), guides: top.filter((e) => along(e, 1)).map((e) => ({ edge: B.edgeRef(e) })) });
    const r = xb(part);
    const sheet = r.sheets?.find((s) => s.feature === gf.id);
    ok(top.length === 4 && allOk(r) && sheet && Math.abs(sheet.area - 8000) < 1e-9 * 8000 && P.dependsOn(gf).includes(ex.id), `four model edges (the block's top) as 2 profiles + 2 guides: a 100 × 80 surface (area ${sheet?.area.toFixed(9)}), depending on the extrude`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runGordonTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
