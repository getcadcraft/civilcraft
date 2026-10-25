#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-form.mjs — PartCraft's freeform surfacing: the Form cage and Catmull–Clark subdivision (form.js), its
 * conversion to exact OpenCascade B-spline geometry (form-brep.js), and the surface features of the part history
 * (surface.js: form, patch, surface loft, stitch, thicken, offset / extend / trim surface, curvature, zebra).
 * References are independent of the code under test: closed-form limit points, the subdivision limit itself
 * (limit masks after deeper refinement), Gauss–Legendre volume integrals of the Bézier patches, box/sphere volumes,
 * discrete Gauss–Bonnet, and native OpenCascade 7.9 (cadquery-ocp in the test venv) reading our STEP.
 *   node tools/partcraft-test/test-form.mjs [--verbose]     (or runFormTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runFormTests({ ok, section, skip = (m) => console.log('  skip ' + m), oc = null }) {
  const V = await import(DEV + 'vec.js');
  const FM = await import(DEV + 'form.js');
  const FB = await import(DEV + 'form-brep.js');
  const SU = await import(DEV + 'surface.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const S = await import(DEV + 'sketch.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const PI = Math.PI;
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const dist = (a, b) => V.len(V.sub(a, b));
  const allOk = (r) => [...r.results.values()].every((x) => x.status === 'ok');
  const euler = (f) => { const s = FM.formStats(f); return s.verts - s.edges + s.faces; };
  /** Largest gap between each patch and the exact limit points sampled inside it, split exact / approximated. */
  const vsLimit = (form, level = null, extra = 3) => {
    const pr = FM.patches(form, { level });
    let ex = 0, ap = 0, nEx = 0;
    for (const s of FM.limitSamples(form, pr.level, extra)) {
      const p = pr.patches[s.face];
      const d = dist(FM.evalPatch(p.b, s.uv[0], s.uv[1]), s.p);
      if (p.exact) { ex = Math.max(ex, d); nEx++; } else ap = Math.max(ap, d);
    }
    return { pr, ex, ap, nEx };
  };
  // volume inside closed Bézier patches: (1/3)∮ p·n dA, 5-point Gauss–Legendre per direction (exact for degree 9)
  const GL = [[-0.9061798459386640, 0.2369268850561891], [-0.5384693101056831, 0.4786286704993665], [0, 0.5688888888888889], [0.5384693101056831, 0.4786286704993665], [0.9061798459386640, 0.2369268850561891]].map(([x, w]) => [(x + 1) / 2, w / 2]);
  const patchVolume = (ps) => {
    let vol = 0;
    for (const { b } of ps) for (const [u, wu] of GL) for (const [v, wv] of GL) {
      const bu = FM.bern(u), bv = FM.bern(v), du = FM.bernD(u), dv = FM.bernD(v);
      const p = [0, 0, 0], su = [0, 0, 0], sv = [0, 0, 0];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 3; k++) { p[k] += bu[i] * bv[j] * b[i][j][k]; su[k] += du[i] * bv[j] * b[i][j][k]; sv[k] += bu[i] * dv[j] * b[i][j][k]; }
      vol += wu * wv * V.dot(p, V.cross(su, sv)) / 3;
    }
    return vol;
  };
  const meshVolume = (m) => { const Pp = m.positions, I = m.indices; let v = 0; for (let t = 0; t < I.length; t += 3) { const q = (i) => [Pp[I[i] * 3], Pp[I[i] * 3 + 1], Pp[I[i] * 3 + 2]]; v += V.dot(q(t), V.cross(q(t + 1), q(t + 2))) / 6; } return v; };

  // =======================================================================================
  section('form: Catmull–Clark subdivision and limit points');
  {
    // the cube ±1: corner limit (n = 3) = (9v + 4Σe + Σf)/24 = (1/2, 1/2, 1/2) by hand (Σe = (1,1,1), Σf = (−1,−1,−1))
    const cube = FM.box(1, 1, 1, 2, 2, 2);
    let m = FM.meshOf(cube), t = FM.topo(m);
    const c0 = cube.verts[0];
    const L0 = FM.limitPoint(m, t, 0);
    ok(L0.every((x, i) => Math.abs(x - c0[i] / 2) < 1e-15), `cube ±1: corner limit point = (±½, ±½, ±½) (Halstead mask, n = 3), got ${L0.map((x) => x.toFixed(15)).join(', ')}`);
    const errs = [];
    let inv = 0;
    for (let k = 1; k <= 7; k++) {
      m = FM.subdivide(m); t = FM.topo(m);
      inv = Math.max(inv, dist(FM.limitPoint(m, t, 0), L0));
      errs.push(dist(m.P[0], L0));
    }
    ok(inv < 1e-14, `the limit mask gives the same corner point after 1…7 subdivisions (largest change ${inv.toExponential(1)})`);
    const ratios = errs.slice(1).map((e, i) => e / errs[i]);
    ok(errs[6] < 3e-6 && ratios.every((r) => Math.abs(r - 1 / 6) < 1e-9), `the corner vertex converges to it: ${errs[6].toExponential(2)} off after 7 levels, error shrinking by exactly 1/6 per level (got ${ratios.map((r) => r.toFixed(9)).join(', ')})`);
    ok(m.F.length === 6 * 4 ** 7 && m.F.every((f) => f.length === 4), `7 levels: ${m.F.length} quads (6·4⁷)`);
    // face centre of the cube (a regular point after one level): same check, mask stable and vertices converging
    let m1 = FM.subdivide(FM.meshOf(cube)); let t1 = FM.topo(m1);
    const fc = m1.P.length - 6;   // face points are appended last
    const Lf = FM.limitPoint(m1, t1, fc);
    let mf = m1, dfc = 0;
    for (let k = 0; k < 5; k++) { mf = FM.subdivide(mf); dfc = Math.max(dfc, dist(FM.limitPoint(mf, FM.topo(mf), fc), Lf)); }
    ok(dfc < 1e-14 && dist(mf.P[fc], Lf) < 1e-3, `face-centre limit point is stable over 5 more levels (${dfc.toExponential(1)}) and the vertex converges to it`);
    // the cube's limit surface stays inside the hull and is symmetric
    const lm = FM.limitMesh(cube, 4);
    let maxc = 0; for (const x of lm.positions) maxc = Math.max(maxc, Math.abs(x));
    ok(maxc < 1 && Math.abs(meshVolume(lm)) > 0, `the cube's limit surface lies inside the cage (|x| ≤ ${maxc.toFixed(4)} < 1)`);
  }

  section('form: primitives');
  {
    const bx = FM.box(2, 2, 2, 100, 100, 100);
    ok(bx.faces.length === 24 && bx.verts.length === 26 && euler(bx) === 2 && FM.formStats(bx).closed, 'box 2×2×2: 24 quads, 26 vertices, closed, Euler characteristic 2');
    const cy = FM.cylinder(8, 2, 50, 100);
    ok(FM.formStats(cy).closed && euler(cy) === 2 && FM.formStats(cy).nonQuads === 2, 'cylinder: closed, two 8-sided caps, χ = 2');
    const to = FM.torus(8, 6, 50, 20);
    ok(FM.formStats(to).closed && euler(to) === 0 && FM.formStats(to).extraordinary === 0, 'torus: closed, χ = 0, no extraordinary vertices');
    const pl = FM.plane(3, 4, 100, 80);
    ok(!FM.formStats(pl).closed && FM.formStats(pl).boundary === 14, 'plane 3×4: open, 14 boundary edges');
    const sp = FM.sphere(2, 50);
    const m = FM.subdivide(FM.meshOf(sp)), t = FM.topo(m);
    let worst = 0; sp.verts.forEach((_, v) => { worst = Math.max(worst, Math.abs(V.len(FM.limitPoint(m, t, v)) - 50)); });
    ok(worst < 1e-9, `quadball (fitted cage): every cage vertex's limit point lies on r = 50 (worst ${worst.toExponential(1)} mm)`);
    // outward orientation: the limit mesh of each closed primitive has positive volume
    ok([bx, cy, to, sp].every((f) => meshVolume(FM.limitMesh(f, 2)) > 0), 'closed primitives face outward (positive enclosed volume)');
    const fc = FM.addFace(FM.addFace(FM.emptyForm(), [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]]), [[10, 0, 0], [20, 0, 0], [20, 0, 10], [10, 0, 10]]);
    ok(fc.verts.length === 6 && fc.faces.length === 2 && FM.formStats(fc).edges === 7, 'faces added by clicks share the vertices they touch (6 vertices, 7 edges)');
    const fr = FM.addFace(FM.addFace(FM.emptyForm(), [[0, 0, 0], [10, 0, 0], [10, 0, 10]]), [[0, 0, 0], [10, 0, 0], [5, 0, -10]]);
    ok(fr.faces[1][0] === 1 || fr.faces[1].join() !== '0,1,3', 'a face clicked against a neighbour is turned to match its orientation');
  }

  section('form: exact B-spline patches = the limit surface');
  {
    const pl = FM.plane(3, 4, 100, 80); pl.verts[5][1] = 20; pl.verts[7][1] = -10; pl.verts[8][1] = 7;
    let r = vsLimit(pl);
    ok(r.pr.level === 0 && r.pr.approx === 0 && r.ex < 1e-9, `open plane 3×4 (boundary + corner rules), level 0: all ${r.pr.patches.length} patches exact; largest gap to ${r.nEx} limit points ${r.ex.toExponential(1)} mm (< 1e-9)`);
    const to = FM.torus(8, 6, 50, 20);
    r = vsLimit(to);
    ok(r.pr.approx === 0 && r.ex < 1e-9, `torus 8×6: all ${r.pr.patches.length} patches exact (${r.ex.toExponential(1)} mm)`);
    // a sharp crease line across the plane (crease rule, corner rule where it meets the boundary): still exact
    const cr = FM.crease(FM.plane(4, 4, 100, 100), [FM.ek(5, 6), FM.ek(6, 7), FM.ek(7, 8), FM.ek(8, 9)].concat([FM.ek(5, 6)]));
    cr.verts[7][1] = 25; cr.verts[2][1] = -5;
    r = vsLimit(cr);
    ok(r.pr.approx === 0 && r.ex < 1e-9, `a sharp crease across a plane (phantom rows reproduce the crease rule): all patches exact (${r.ex.toExponential(1)} mm)`);
    const rep = FM.patchReport(r.pr);
    ok(rep.gap < 1e-9, `the crease is a C0 seam: patches meet with a ${rep.gap.toExponential(1)} mm gap`);
    // the same patch through OpenCascade: Geom_BSplineSurface poles in the right order
    const T = (o) => o;
    const live = [];
    const pr = FM.patches(to);
    let occGap = 0;
    for (const s of FM.limitSamples(to, pr.level, 2)) {
      if (s.face > 5) continue;
      const surf = FB.bezierSurface(oc, (o) => { live.push(o); return T(o); }, pr.patches[s.face].b);
      const q = surf.Value(s.uv[0], s.uv[1]);
      occGap = Math.max(occGap, dist([q.X(), q.Y(), q.Z()], s.p));
      q.delete();
    }
    for (const o of live) o.delete();
    ok(occGap < 1e-9, `OpenCascade's Geom_BSplineSurface of a torus patch matches the subdivision limit at 25 sample points each (${occGap.toExponential(1)} mm)`);
  }

  section('form: extraordinary points (stated approximation)');
  {
    for (const [name, form, level, size, bound] of [['quadball', FM.sphere(2, 50), null, 100, 0.005], ['quadball at level 2', FM.sphere(2, 50), 2, 100, 0.002], ['box', FM.box(1, 1, 1, 100, 100, 100), null, 100, 0.005], ['cylinder (8-sided caps)', FM.cylinder(8, 2, 50, 100), 2, 100, 0.015]]) {
      const r = vsLimit(form, level);
      const rep = FM.patchReport(r.pr);
      ok(r.ex < 1e-9 && r.ap < bound * size && rep.gap < 1e-9 && rep.degExact < 1e-4 && rep.deg < 3, `${name}, level ${r.pr.level}: ${r.pr.exact} exact patches (${r.ex.toExponential(1)} mm), ${r.pr.approx} around ${r.pr.irregular} extraordinary points within ${(r.ap / size * 100).toFixed(2)} % of the size of the limit surface (bound ${bound * 100} %); watertight (${rep.gap.toExponential(1)} mm); normals across smooth edges within ${rep.deg.toFixed(2)}° (0 between exact patches)`);
    }
    // semi-sharp creases: weight 1 and 2 sit between smooth and sharp (DeRose)
    const edge = FM.ek(0, 1);
    const mid = (w) => {
      const f = w ? FM.crease(FM.box(1, 1, 1, 2, 2, 2), [edge], w) : FM.box(1, 1, 1, 2, 2, 2);
      const lm = FM.limitMesh(f, 5);
      const a = f.verts[0], b = f.verts[1], c = V.mul(V.add(a, b), 0.5);
      let best = Infinity; for (let i = 0; i < lm.positions.length; i += 3) best = Math.min(best, dist([lm.positions[i], lm.positions[i + 1], lm.positions[i + 2]], c));
      return best;
    };
    const d = [0, 1, 2, FM.SHARP].map(mid);
    ok(d[0] > d[1] && d[1] > d[2] && d[2] > d[3], `semi-sharp crease: the surface nears the cage edge as the weight grows (gap ${d.map((x) => x.toFixed(4)).join(' > ')} for weights 0, 1, 2, sharp)`);
    ok(FM.conversionLevel(FM.crease(FM.box(1, 1, 1), [edge], 2.5)) === 3, 'a weight-2.5 crease converts at level 3 (no semi-sharp edge left)');
  }

  section('form: edits');
  {
    const b = FM.box(1, 1, 1, 100, 100, 100);
    const top = b.faces.findIndex((f) => f.every((v) => b.verts[v][1] > 49));
    let e = FM.extrudeFaces(b, [top], 30);
    ok(e.faces.length === 10 && e.verts.length === 12 && euler(e) === 2 && e.faces[top].every((v) => Math.abs(e.verts[v][1] - 80) < 1e-12), 'extrude the top face 30: 4 side walls, the face at y 80, still closed');
    const ring = FM.edgeRing(b, FM.ek(b.faces[top][0], b.faces[top][1]));
    let il = FM.insertEdgeLoop(b, FM.ek(b.faces[top][0], b.faces[top][1]), 0.25);
    ok(ring.length === 4 && il.faces.length === 10 && il.verts.length === 12 && euler(il) === 2 && il.faces.every((f) => f.length === 4), 'insert an edge loop at ¼: a ring of 4 quads split, still all quads, closed');
    const b2 = FM.box(2, 2, 2, 100, 100, 100);
    const mids = b2.verts.map((p, i) => [p, i]).filter(([p]) => Math.abs(p[1]) < 1e-9);
    const k0 = FM.ek(mids[0][1], mids.find(([p], j) => j > 0 && dist(p, mids[0][0]) < 50.0001 && dist(p, mids[0][0]) > 49.9999)[1]);
    ok(FM.edgeLoop(b2, k0).length === 8, 'edge loop on a 2×2×2 box: the 8 edges round the middle');
    const ip = FM.insertPoint(b, FM.ek(b.faces[top][0], b.faces[top][1]));
    ok(ip.verts.length === 9 && ip.faces.filter((f) => f.length === 5).length === 2, 'insert a point: the two faces of the edge gain a corner');
    const sd = FM.subdivideFaces(b, [top]);
    ok(sd.faces.length === 9 && sd.faces.filter((f) => f.length === 5).length === 4 && euler(sd) === 2, 'subdivide the top face: 4 quads, the 4 side faces gain a midpoint');
    const open = FM.deleteFaces(b, [top]);
    ok(open.faces.length === 5 && FM.formStats(open).boundary === 4, 'delete a face: an open box with 4 boundary edges');
    const be = FM.cageEdges(open).find((x) => x.boundary);
    const filled = FM.fillHole(open, be.key);
    ok(FM.formStats(filled).closed && euler(filled) === 2 && meshVolume(FM.limitMesh(filled, 2)) > 0, 'fill the hole: closed again, facing outward');
    const ex = FM.extrudeEdges(open, FM.boundaryLoop(open, be.key).map((v, i, a) => FM.ek(v, a[(i + 1) % a.length])), [0, 20, 0]);
    ok(ex.faces.length === 9 && FM.formStats(ex).boundary === 4 && ex.verts.length === 12, 'extrude the 4 open edges up 20: a collar of 4 quads');
    const col = FM.box(1, 3, 1, 100, 300, 100);
    const ct = col.faces.findIndex((f) => f.every((v) => col.verts[v][1] > 149)), cb = col.faces.findIndex((f) => f.every((v) => col.verts[v][1] < -149));
    const tun = FM.bridge(col, { face: ct }, { face: cb });
    ok(tun.faces.length === col.faces.length + 2 && FM.formStats(tun).closed && euler(tun) === 0, 'bridge the top and bottom faces of a column: a tunnel (closed, χ = 0)');
    ok(throws(() => FM.bridge(b, { face: top }, { face: b.faces.findIndex((f) => f.every((v) => b.verts[v][1] < -49)) }), /more than two/), 'bridging along existing edges (a 1×1×1 box top to bottom) is refused');
    const w = FM.weld(b, [b.faces[top][0], b.faces[top][1]]);
    ok(w.verts.length === 7 && w.faces.length === 6 && w.faces.filter((f) => f.length === 3).length === 2, 'weld two corners: the two faces of their edge become triangles');
    const de = FM.deleteEdges(FM.box(2, 1, 1), [FM.ek(...FM.box(2, 1, 1).faces[0].slice(1, 3))]);
    ok(de.faces.length === FM.box(2, 1, 1).faces.length - 1, 'delete an edge between two faces: they merge');
    const cr = FM.crease(b, [FM.ek(0, 1)], 3);
    ok(cr.creases.length === 1 && cr.creases[0][2] === 3 && FM.uncrease(cr, [FM.ek(0, 1)]).creases.length === 0, 'crease weight 3, then uncrease');
    const fl = FM.flatten(FM.plane(3, 3, 90, 90), { verts: [0, 1, 2, 5, 6] }, null);
    ok(true && fl.verts.length === 16, 'flatten keeps the vertex count');
    const bump = FM.plane(3, 3, 90, 90); bump.verts[5][1] = 10; bump.verts[6][1] = 4; bump.verts[0][1] = -3;
    const fb = FM.flatten(bump, { verts: [0, 5, 6, 10] });
    const nrm = FM.bestNormal([0, 5, 6, 10].map((v) => fb.verts[v]).map((p, _, a) => V.sub(p, a[0])));
    const flat = [0, 5, 6, 10].map((v) => V.dot(V.sub(fb.verts[v], fb.verts[0]), nrm));
    ok(flat.every((x) => Math.abs(x) < 1e-9), 'flatten: the picked vertices end on one plane (least squares)');
    // move with soft falloff: the picked vertex moves fully, a near one partly, a far one not at all
    const pl = FM.plane(4, 4, 100, 100);
    const mv = FM.move(pl, { verts: [12] }, [0, 10, 0], { soft: 40 });
    ok(Math.abs(mv.verts[12][1] - 10) < 1e-12 && mv.verts[13][1] > 0 && mv.verts[13][1] < 10 && mv.verts[0][1] === 0 && Math.abs(mv.verts[13][1] - 10 * FM.falloff(25, 40)) < 1e-12, `soft move: the vertex 10, its neighbour 25 away ${mv.verts[13][1].toFixed(4)} = 10·(1 − (25/40)²)², the far corner 0`);
    const rt = FM.rotate(b, { faces: [top] }, [0, 50, 0], [0, 1, 0], 90);
    ok(b.faces[top].every((v) => Math.abs(Math.hypot(rt.verts[v][0], rt.verts[v][2]) - Math.hypot(b.verts[v][0], b.verts[v][2])) < 1e-9), 'rotate a face about its axis keeps its corners on the same circle');
    const sc = FM.scale(b, { faces: [top] }, [0, 50, 0], 0.5);
    ok(b.faces[top].every((v) => Math.abs(Math.abs(sc.verts[v][0]) - 25) < 1e-12), 'scale a face ½ about its centre');
  }

  section('form: symmetry');
  {
    const b = FM.box(2, 2, 2, 100, 100, 100);
    const s = FM.setSymmetry(b, 'x', 0, 1);
    const pt = FM.partners(s);
    ok(s.faces.length === 24 && FM.formStats(s).closed && pt.every((p) => p >= 0), 'symmetry on x = 0: 24 faces, closed, every vertex has a mirror partner');
    const v = s.verts.findIndex((p) => p[0] > 49 && p[1] > 49 && p[2] > 49);
    const m = FM.move(s, { verts: [v] }, [10, 5, 0]);
    const q = m.verts[pt[v]];
    ok(Math.abs(q[0] + m.verts[v][0]) < 1e-12 && Math.abs(q[1] - m.verts[v][1]) < 1e-12, 'moving a vertex moves its partner mirrored');
    const seam = s.verts.findIndex((p, i) => pt[i] === i && p[1] > 49);
    const ms = FM.move(s, { verts: [seam] }, [7, 3, 0]);
    ok(ms.verts[seam][0] === 0 && Math.abs(ms.verts[seam][1] - s.verts[seam][1] - 3) < 1e-12, 'a seam vertex slides in the plane, never off it');
    const fneg = s.faces.findIndex((f) => f.reduce((a, i) => a + s.verts[i][0], 0) < -1 && f.every((i) => s.verts[i][1] > 49));
    const ex = FM.extrudeFaces(s, [fneg], 20);
    const st = FM.formStats(ex);
    ok(ex.faces.length === 30 && st.closed && FM.partners(ex).every((p) => p >= 0), 'extruding a face by the seam on the mirror side extrudes both sides: 24 + 2·3 walls (the wall on the seam would be inside), still closed and symmetric');
  }

  section('form: untrusted cages');
  {
    const good = FM.box(1, 1, 1);
    ok(JSON.stringify(FM.readForm(FM.toJSON(good))) === JSON.stringify(good), 'a good cage reads back unchanged');
    const bad = (mut, re, what) => { const j = JSON.parse(FM.toJSON(FM.crease(good, [FM.ek(0, 1)], 4))); mut(j); ok(throws(() => FM.readForm(JSON.stringify(j)), re), what); };
    ok(throws(() => FM.readForm('{no'), /not JSON/), 'not JSON refused');
    bad((j) => { j.format = 'x'; }, /not a PartCraft form/, 'wrong format refused');
    bad((j) => { j.version = 9; }, /newer PartCraft/, 'a newer version refused, saying so');
    bad((j) => { j.verts[0][1] = 2e6; }, /vertex is bad/, 'a coordinate past ±1e6 mm refused');
    bad((j) => { j.verts[0][1] = 'x'; }, /vertex is bad/, 'a non-number coordinate refused');
    bad((j) => { j.faces[0][1] = j.faces[0][0]; }, /face is bad/, 'a face repeating a vertex refused');
    bad((j) => { j.faces[0][1] = 99; }, /face is bad/, 'a face index out of range refused');
    bad((j) => { j.faces.push([...j.faces[0]].reverse()); }, /edge shared by more than two|opposite ways/, 'a third face on an edge refused');
    bad((j) => { j.faces[0].reverse(); }, /opposite ways/, 'a face turned against its neighbours refused');
    bad((j) => { j.creases[0] = [0, 6, 4]; }, /crease is bad/, 'a crease on a non-edge refused');
    bad((j) => { j.creases[0][2] = 11; }, /crease is bad/, 'a crease weight over 10 refused');
    bad((j) => { j.corners = [42]; }, /sharp vertices/, 'a bad sharp vertex refused');
    bad((j) => { j.sym = { axis: 'w', at: 0 }; }, /symmetry/, 'a bad symmetry refused');
    bad((j) => { j.verts = Array(FM.MAX_VERTS + 1).fill([0, 0, 0]); }, /at most/, 'too many vertices refused');
    ok(throws(() => FM.extrudeEdges(good, [FM.ek(0, 1)], [0, 1, 0]), /boundary/), 'extruding a closed edge is refused with the reason');
    ok(throws(() => FM.bridge(FM.box(1, 1, 1), { face: 0 }, { face: 0 }), /share/), 'bridging a face to itself is refused');
  }

  // =======================================================================================
  section('form → exact solid (OpenCascade)');
  {
    const r = FB.formShape(oc, FM.sphere(2, 50));
    const pv = patchVolume(FM.patches(FM.sphere(2, 50)).patches);
    const lv = meshVolume(FM.limitMesh(FM.sphere(2, 50), 6));
    const sv = 4 / 3 * PI * 50 ** 3;
    ok(r.closed && r.report.valid && r.report.free === 0, `quadball r 50: ${r.report.patches} B-spline faces sewn into one valid closed solid`);
    ok(rel(r.report.volume, pv, 1e-9), `its OCCT volume ${r.report.volume.toFixed(6)} = the Gauss–Legendre volume of the Bézier patches ${pv.toFixed(6)} (1e-9)`);
    ok(Math.abs(r.report.volume - lv) / lv < 1e-4, `and the limit surface's own volume (level-6 limit mesh ${lv.toFixed(2)}) within 0.01 %`);
    ok(Math.abs(r.report.volume - sv) / sv < 0.005, `a sphere of radius 50: ${sv.toFixed(2)}; the quadball is ${((r.report.volume / sv - 1) * 100).toFixed(2)} % (within 0.5 %: the limit surface sags between its fitted points)`);
    ok(/96 B-spline patches at level 1, 72 exact, 24 approximated around 8 extraordinary points/.test(FB.describeReport(r.report)), 'the report says what is exact and what is approximate');
    r.shape.delete();
    const t = FB.formShape(oc, FM.torusFitted(8, 6, 50, 20));
    const tv = patchVolume(FM.patches(FM.torusFitted(8, 6, 50, 20)).patches);
    ok(t.closed && t.report.valid && t.report.approx === 0 && rel(t.report.volume, tv, 1e-9) && Math.abs(t.report.volume - 2 * PI * PI * 50 * 400) / (2 * PI * PI * 50 * 400) < 0.02, `torus 8×6 (all exact): valid solid, volume ${t.report.volume.toFixed(3)} = patch integral; within 2 % of 2π²Rr² (${(t.report.volume / (2 * PI * PI * 50 * 400) * 100 - 100).toFixed(2)} %)`);
    t.shape.delete();
    const o = FB.formShape(oc, FM.plane(2, 2));
    ok(!o.closed && o.report.free === 8, 'an open plane form sews into a shell with 8 free edges (a surface body)');
    o.shape.delete();
  }

  section('form and surface features in the part history');
  {
    // all edges sharp: the cube itself (corner rule, flat bilinear patches) — volume exactly 100³
    const sharpBox = () => { const f = FM.box(1, 1, 1, 100, 100, 100); return FM.crease(f, FM.cageEdges(f).map((e) => e.key)); };
    let part = P.newPart();
    const fm = P.addFeature(part, 'form', { cage: sharpBox(), op: 'new' });
    let r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.stats.volume, 1e6, 1e-9) && r.faces.length === 6 && r.faces.every((f) => /^f1\.face:\d_0$/.test(f.name)), `a fully creased box form is the box: volume ${r.stats.volume.toFixed(6)} = 100³, 6 faces named f1.face:<cage face>_0`);
    const ed = r.edges.find((x) => x.faces.includes('f1.face:0_0'));
    P.addFeature(part, 'fillet', { edges: [B.edgeRef(ed)], r: 5 });
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.stats.volume, 1e6 - (1 - PI / 4) * 25 * 100, 1e-9), `fillet r 5 on a creased edge of the form: volume = 100³ − (1 − π/4)·25·100 exactly (${r.stats.volume.toFixed(6)})`);
    // STEP of a form body read back by native OCCT
    const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
    const qp = P.newPart('Quadball');
    P.addFeature(qp, 'form', { cage: FM.sphere(2, 50), op: 'new' });
    const qv = B.regenerateBrep(qp, oc);
    const st = B.exportStep(qp, oc).text;
    ok(/B_SPLINE_SURFACE/.test(st) && (st.match(/ADVANCED_FACE/g) || []).length === 96, 'STEP of the quadball form: 96 ADVANCED_FACEs on B-spline surfaces');
    const hasOcp = fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
    if (!hasOcp) skip('cadquery-ocp missing: native read of the form STEP skipped');
    else {
      const TMP = path.join(REPO, 'tmp/partcraft-form'); fs.mkdirSync(TMP, { recursive: true });
      const fstep = path.join(TMP, 'form-quadball.step'); fs.writeFileSync(fstep, st);
      const out = execFileSync(PY, ['-c', `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.TopoDS import TopoDS
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
types = {}
e = TopExp_Explorer(s, TopAbs_FACE)
while e.More():
    t = str(BRepAdaptor_Surface(TopoDS.Face_s(e.Current())).GetType()).split('.')[-1]; types[t] = types.get(t, 0) + 1; e.Next()
n = 0; e = TopExp_Explorer(s, TopAbs_SOLID)
while e.More(): n += 1; e.Next()
print(json.dumps({'valid': BRepCheck_Analyzer(s).IsValid(), 'volume': g.Mass(), 'types': types, 'solids': n}))
`, fstep], { encoding: 'utf8' });
      const j = JSON.parse(out.trim().split('\n').pop());
      ok(j.valid && j.solids === 1 && j.types.GeomAbs_BSplineSurface === 96 && rel(j.volume, qv.stats.volume, 1e-9), `native OpenCascade 7.9 reads the form STEP: a valid solid, 96 B-spline faces, volume ${j.volume.toFixed(6)} (same as ours to 1e-9)`);
    }
    // thicken an open plane form: area × t exactly, each side
    part = P.newPart();
    const pf = P.addFeature(part, 'form', { cage: FM.plane(2, 2, 100, 100), op: 'new' });
    const th = P.addFeature(part, 'thicken', { sheet: pf.id, t: 3, side: 'out', op: 'new' });
    for (const side of ['out', 'in', 'both']) {
      th.side = side;
      r = B.regenerateBrep(part, oc);
      const ys = side === 'out' ? [0, 3] : side === 'in' ? [-3, 0] : [-1.5, 1.5];
      ok(allOk(r) && rel(r.stats.volume, 30000, 1e-9) && Math.abs(r.stats.bbox.min[1] - ys[0]) < 1e-6 && Math.abs(r.stats.bbox.max[1] - ys[1]) < 1e-6, `thicken 3 ${side}: volume = 100 × 100 × 3 = 30000 exactly (${r.stats.volume.toFixed(9)}), y ${ys[0]} … ${ys[1]}`);
    }
    ok(r.faces.filter((f) => /~f2#m$/.test(f.name)).length === 4 && r.faces.filter((f) => /~f2$/.test(f.name)).length === 4 && r.faces.filter((f) => /^f2\.side:/.test(f.name)).length === 8, 'thickened faces are named: 4 offset copies each side (~f2, ~f2#m) and 8 side walls f2.side:<edge>');
    ok(r.sheets.length === 0, 'the thickened surface is used up (no surface body left to show)');
    // patch the boundary of a bumped open form, stitch both into a closed lens: volume = the patch integral
    part = P.newPart();
    const bumped = FM.plane(2, 2, 100, 100); bumped.verts[4][1] = 30;
    const a = P.addFeature(part, 'form', { cage: bumped, op: 'new' });
    const pa = P.addFeature(part, 'patch', { sheet: a.id, cont: 'G0' });
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && r.sheets.length === 2 && r.results.get(pa.id).patch.g0 < 1e-6 && rel(r.sheets.find((s) => s.feature === pa.id).area, 10000, 1e-6), `patch fills the form's open boundary: 2 surface bodies shown, boundary error ${r.results.get(pa.id).patch.g0.toExponential(1)} mm, the flat patch's area 100² (${r.sheets.find((s) => s.feature === pa.id).area.toFixed(6)})`);
    P.addFeature(part, 'stitch', { sheets: [a.id, pa.id], op: 'new' });
    r = B.regenerateBrep(part, oc);
    const lens = patchVolume(FM.patches(bumped).patches);
    ok(allOk(r) && r.sheets.length === 0 && rel(r.stats.volume, lens, 1e-9), `stitch the form and its patch: a closed solid of volume ${r.stats.volume.toFixed(6)} = the surface integral under the form (${lens.toFixed(6)}); both surfaces used up`);
    // a filling patch through 4 skew boundary edges passes through them
    {
      const live = [];
      const T = (o) => { live.push(o); return o; };
      const pts = [[0, 0, 0], [100, 0, 20], [100, 100, 0], [0, 100, 20]];
      const edges = pts.map((p, i) => T(T(new oc.BRepBuilderAPI_MakeEdge(T(new oc.gp_Pnt(...p)), T(new oc.gp_Pnt(...pts[(i + 1) % 4])))).Edge()));
      const fr = SU.fillShape(oc, [edges[2], edges[0], edges[3], edges[1]], { T });
      let worst = 0;
      for (let i = 0; i < 4; i++) for (let s = 0; s <= 10; s++) {
        const p = V.add(pts[i], V.mul(V.sub(pts[(i + 1) % 4], pts[i]), s / 10));
        const vx = T(T(new oc.BRepBuilderAPI_MakeVertex(T(new oc.gp_Pnt(...p)))).Vertex());
        const d = T(new oc.BRepExtrema_DistShapeShape(vx, fr.shape, 1e-9, undefined, undefined, T(new oc.Message_ProgressRange())));
        worst = Math.max(worst, d.Value());
      }
      ok(fr.g0 < 1e-6 && worst < 1e-6, `a filling patch on 4 skew edges (given out of order) passes through all 44 sample points on them (worst ${worst.toExponential(1)} mm)`);
      for (const o of live) { try { o.delete(); } catch { /* gone */ } }
    }
    // offset, trim and extend
    part = P.newPart();
    const fp = P.addFeature(part, 'form', { cage: FM.plane(2, 2, 100, 100), op: 'new' });
    const of = P.addFeature(part, 'offsetsurf', { sheet: fp.id, d: 5 });
    r = B.regenerateBrep(part, oc);
    const osh = r.sheets.find((s) => s.feature === of.id);
    let ymin = Infinity, ymax = -Infinity; for (let i = 1; i < osh.positions.length; i += 3) { ymin = Math.min(ymin, osh.positions[i]); ymax = Math.max(ymax, osh.positions[i]); }
    ok(allOk(r) && r.sheets.length === 2 && rel(osh.area, 10000, 1e-9) && Math.abs(ymin - 5) < 1e-5 && Math.abs(ymax - 5) < 1e-5, 'offset surface 5: a second surface body at y 5 with the same area');
    const tool = FM.rotate(FM.plane(1, 1, 200, 200), { verts: [0, 1, 2, 3] }, [0, 0, 0], [0, 0, 1], 90);
    tool.verts = tool.verts.map((p) => [p[0] + 20, p[1], p[2]]);
    const tf = P.addFeature(part, 'form', { cage: tool, op: 'new' });
    const tr = P.addFeature(part, 'trimsurf', { sheet: fp.id, tool: tf.id, at: [-40, 0, 0], keep: 'near' });
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.sheets.find((s) => s.feature === tr.id).area, 7000, 1e-9), `trim by a crossing surface at x 20, keeping the side at x −40: area 70 × 100 = 7000 (${r.sheets.find((s) => s.feature === tr.id).area.toFixed(6)})`);
    tr.keep = 'far';
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.sheets.find((s) => s.feature === tr.id).area, 3000, 1e-9), 'keeping the other piece: 30 × 100 = 3000');
    const ex = P.addFeature(part, 'extendsurf', { sheet: tr.id, d: 10, sides: ['umin'] });
    r = B.regenerateBrep(part, oc);
    ok(r.results.get(ex.id).status === 'error' && /one-face surface/.test(r.results.get(ex.id).message), 'extend on a 2-face surface is refused with the reason');
    // extend a one-face flat patch on all sides: a planar B-spline grows by 10 each way
    const ep = P.newPart();
    const ef = P.addFeature(ep, 'form', { cage: FM.plane(1, 1, 100, 100), op: 'new' });
    const ee = P.addFeature(ep, 'extendsurf', { sheet: ef.id, d: 10, sides: ['umin', 'umax', 'vmin', 'vmax'] });
    r = B.regenerateBrep(ep, oc);
    ok(allOk(r) && Math.abs(r.sheets.find((s) => s.feature === ee.id).area - 120 * 120) / 14400 < 1e-6, `extend a one-face flat surface 10 on every side: area 120² (${r.sheets.find((s) => s.feature === ee.id).area.toFixed(4)})`);
    // loft surface through two straight sketch lines 100 apart: the flat 100 × 100 rectangle
    const lp = P.newPart();
    const k1 = S.newSketch(); S.addLine(k1, [0, 0], [100, 0]);
    const k2 = S.newSketch(); S.addLine(k2, [0, 0], [100, 0]);
    const s1 = P.addFeature(lp, 'sketch', { sketch: k1 });
    const s2 = P.addFeature(lp, 'sketch', { sketch: k2, plane: { kind: 'fixed', o: [0, 0, 100], n: [0, 0, 1] } });
    const lf = P.addFeature(lp, 'surfloft', { sketches: [s1.id, s2.id] });
    const lt = P.addFeature(lp, 'thicken', { sheet: lf.id, t: 2, side: 'out', op: 'new' });
    r = B.regenerateBrep(lp, oc);
    ok(allOk(r) && rel(r.stats.volume, 20000, 1e-9), `loft surface through two lines 100 apart, thickened 2: volume 100 × 100 × 2 = 20000 (${r.stats.volume.toFixed(6)})`);
    void lt;
    // stitch that does not close is refused with the count of open edges
    const sp2 = P.newPart();
    const o1 = P.addFeature(sp2, 'form', { cage: FM.plane(1, 1), op: 'new' });
    const so = P.addFeature(sp2, 'stitch', { sheets: [o1.id], op: 'new' });
    r = B.regenerateBrep(sp2, oc);
    ok(r.results.get(so.id).status === 'error' && /4 open edges/.test(r.results.get(so.id).message), 'stitching an open surface alone is refused: "4 open edges left"');
    // file: the features round trip, version 3, refusals, dependencies, the mesh kernel skips them
    const back = P.readPart(P.toJSON(part));
    ok(back.features.map((f) => f.type).join() === 'form,offsetsurf,form,trimsurf,extendsurf' && JSON.parse(P.toJSON(part)).version === 3 && back.features[0].cage.faces.length === 4, 'surface features save and open (file version 3)');
    const tamper = (mut, re, what) => { const j = JSON.parse(P.toJSON(part)); mut(j); ok(throws(() => P.readPart(JSON.stringify(j)), re), what); };
    tamper((j) => { j.features[0].cage.faces[0][0] = 999; }, /Form1: A form face is bad/, 'a tampered cage inside a part is refused, naming the feature');
    tamper((j) => { j.features[0].op = 'melt'; }, /operation is bad/, 'a bad form operation refused');
    tamper((j) => { j.features[1].sheet = 'f99'; }, /its surface is bad/, 'an offset of a missing surface refused');
    tamper((j) => { j.features[3].keep = 'both'; }, /which piece/, 'a bad trim choice refused');
    tamper((j) => { j.features[0].level = 9; }, /level is bad/, 'a form level past 3 refused');
    ok(P.dependsOn(part.features[3]).includes(fp.id) && P.dependsOn(part.features[3]).includes(tf.id), 'trim depends on its surface and its tool');
    const del = JSON.parse(JSON.stringify(part));
    const gone = P.deleteFeatures(del, [fp.id]);
    ok(gone.length === 4 && del.features.length === 1, 'deleting the first form takes its offset, trim and extend with it');
    const K = await import(DEV + 'kernel.js');
    const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
    const M = await Module(); M.setup();
    const km = K.regenerate(part, M);
    ok(km.results.get(fp.id).status === 'skipped' && /exact kernel/.test(km.results.get(fp.id).message), 'the mesh kernel skips a form, saying it needs the exact kernel');
    void fm;
  }

  section('surface analysis: curvature and zebra');
  {
    // a lat-long triangulation of a sphere of radius 50
    const R = 50, nu = 64, nv = 32, pos = [], idx = [];
    pos.push(0, R, 0);
    for (let j = 1; j < nv; j++) for (let i = 0; i < nu; i++) { const th = PI * j / nv, ph = 2 * PI * i / nu; pos.push(R * Math.sin(th) * Math.cos(ph), R * Math.cos(th), R * Math.sin(th) * Math.sin(ph)); }
    pos.push(0, -R, 0);
    const id = (j, i) => 1 + (j - 1) * nu + (i % nu);
    for (let i = 0; i < nu; i++) idx.push(0, id(1, i + 1), id(1, i));
    for (let j = 1; j < nv - 1; j++) for (let i = 0; i < nu; i++) idx.push(id(j, i), id(j, i + 1), id(j + 1, i + 1), id(j, i), id(j + 1, i + 1), id(j + 1, i));
    const last = pos.length / 3 - 1;
    for (let i = 0; i < nu; i++) idx.push(last, id(nv - 1, i), id(nv - 1, i + 1));
    const mesh = { positions: Float64Array.from(pos), indices: Uint32Array.from(idx) };
    ok(meshVolume(mesh) > 0, 'the test sphere mesh faces outward');
    const c = SU.curvature(mesh);
    // discrete Gauss–Bonnet: Σ K·A = 2πχ exactly
    const area = new Float64Array(pos.length / 3);
    for (let t = 0; t < idx.length; t += 3) { const q = (k) => [pos[idx[k] * 3], pos[idx[k] * 3 + 1], pos[idx[k] * 3 + 2]]; const A = V.len(V.cross(V.sub(q(t + 1), q(t)), V.sub(q(t + 2), q(t)))) / 6; for (let k = 0; k < 3; k++) area[idx[t + k]] += A; }
    let tot = 0; for (let i = 0; i < area.length; i++) tot += c.gauss[i] * area[i];
    ok(Math.abs(tot - 4 * PI) < 1e-9, `discrete Gauss–Bonnet on the sphere: Σ K·A = 4π (${tot.toFixed(12)})`);
    const eq = id(nv / 2, 0);
    ok(Math.abs(c.mean[eq] - 1 / R) / (1 / R) < 0.01 && Math.abs(c.gauss[eq] - 1 / R ** 2) / (1 / R ** 2) < 0.01, `at the equator: mean curvature ${c.mean[eq].toFixed(6)} ≈ 1/50, Gaussian ${c.gauss[eq].toExponential(4)} ≈ 1/2500 (within 1 %)`);
    const tl = FM.limitMesh(FM.torus(8, 6, 50, 20), 3);
    const ct = SU.curvature(tl);
    const at = new Float64Array(tl.positions.length / 3);
    for (let t = 0; t < tl.indices.length; t += 3) { const q = (k) => [tl.positions[tl.indices[k] * 3], tl.positions[tl.indices[k] * 3 + 1], tl.positions[tl.indices[k] * 3 + 2]]; const A = V.len(V.cross(V.sub(q(t + 1), q(t)), V.sub(q(t + 2), q(t)))) / 6; for (let k = 0; k < 3; k++) at[tl.indices[t + k]] += A; }
    let tt = 0; for (let i = 0; i < at.length; i++) tt += ct.gauss[i] * at[i];
    ok(Math.abs(tt) < 1e-9, `on a torus form's limit mesh Σ K·A = 0 (genus 1): ${tt.toExponential(1)}`);
    let flips = 0, prev = null;
    for (let k = 0; k <= 3600; k++) { const a = PI * k / 3600; const z = SU.zebra([Math.sin(a / 2), 0, Math.cos(a / 2)], [0, 0, -1], 12); if (prev !== null && z !== prev) flips++; prev = z; }
    ok(flips === 6, `zebra: turning a normal 90° sweeps the reflected ray 180°: ${flips} stripe edges (12 stripes per turn → 6)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runFormTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
