#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-analysis.mjs — draft analysis (0.4 P21, analysis.js) against closed forms: a box pulled along +Y (top positive,
 * bottom negative, walls need draft — areas exact), one triangle tilted 3° (positive at a 1° minimum, needs draft at 5°),
 * and a cylinder lying across the pull, where the band within ±m of the side wall is 4m/360 of its side and the rest splits
 * evenly — on the mesh kernel (facet normals) and the exact kernel (OpenCascade's surface normals per corner).
 *   node tools/partcraft-test/test-analysis.mjs [--verbose]    (or runAnalysisTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runAnalysisTests({ ok, section, M, oc }) {
  const AN = await import(DEV + 'analysis.js');
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const K = await import(DEV + 'kernel.js');
  const B = await import(DEV + 'brep.js');
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const C = { positive: [0, 1, 0], needs: [1, 1, 0], negative: [1, 0, 0] };
  const front = { kind: 'base', name: 'front' };
  const solid = (draw, depth) => { const part = P.newPart('A'); const sk = S.newSketch(); draw(sk); const s = P.addFeature(part, 'sketch', { plane: front, sketch: sk }); P.addFeature(part, 'extrude', { sketch: s.id, depth }); return part; };

  section('draft analysis (analysis.js)');
  {
    ok(Math.abs(AN.draftAngle([0, 1, 0], [0, 1, 0]) - 90) < 1e-12 && Math.abs(AN.draftAngle([1, 0, 0], [0, 1, 0])) < 1e-12 && Math.abs(AN.draftAngle([0, -1, 0], [0, 1, 0]) + 90) < 1e-12, 'draft angle: 90° facing the pull, 0° along it, −90° against it');
    // a 100 × 40 (x) … box: x 0…100, y 0…20 (a sketch 100 × 20 on the front plane), z 0…40
    const box = K.regenerate(solid((sk) => S.addRect(sk, [0, 0], [100, 20]), 40), M).mesh;
    const r = AN.draftAnalysis(box, AN.PULLS['+y'], 1, C);
    ok(rel(r.areas.positive, 4000, 1e-9) && rel(r.areas.negative, 4000, 1e-9) && rel(r.areas.needs, 2 * 100 * 20 + 2 * 40 * 20, 1e-9) && rel(r.areas.total, 13600, 1e-9), `a box pulled along +Y: top 4000 positive, bottom 4000 negative, walls 5600 need draft (${r.areas.positive.toFixed(3)} / ${r.areas.negative.toFixed(3)} / ${r.areas.needs.toFixed(3)})`);
    const anyRed = [...Array(r.colors.length / 3).keys()].some((i) => r.colors[i * 3] === 1 && r.colors[i * 3 + 1] === 0);
    ok(r.colors.length === box.indices.length * 3 && anyRed, 'one RGB per triangle corner, in the colours given');
    const rr = AN.draftAnalysis(box, AN.PULLS['-y'], 1, C);
    ok(rel(rr.areas.positive, 4000, 1e-9) && rel(rr.areas.negative, 4000, 1e-9), 'pulled the other way: top and bottom swap');
    // one triangle tilted 3° toward the pull
    const a = 3 * Math.PI / 180;
    // a wall through the X axis and (0, cos a, −sin a): its normal is (0, sin a, cos a), 3° toward the pull
    const tri = { positions: Float64Array.from([0, 0, 0, 10, 0, 0, 0, Math.cos(a) * 10, -Math.sin(a) * 10]), indices: Uint32Array.from([0, 1, 2]) };
    const n3 = (() => { const p = tri.positions; const u = [p[3] - p[0], p[4] - p[1], p[5] - p[2]], v = [p[6] - p[0], p[7] - p[1], p[8] - p[2]]; return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; })();
    const ang = AN.draftAngle(n3.map((x) => x / Math.hypot(...n3)), [0, 1, 0]);
    const t1 = AN.draftAnalysis(tri, [0, 1, 0], 1, C), t5 = AN.draftAnalysis(tri, [0, 1, 0], 5, C);
    ok(Math.abs(ang - 3) < 1e-4 && t1.areas.positive > 0 && t1.areas.needs === 0 && t5.areas.needs > 0 && t5.areas.positive === 0, `a face with ${ang.toFixed(4)}° of draft: positive at a 1° minimum, needs draft at 5°`);
    // a cylinder r 10, 50 long, lying across the pull (+Y): side 2π·10·50; the band |draft| < m is 4m/360 of it; ends need draft
    const side = 2 * Math.PI * 10 * 50, ends = 2 * Math.PI * 100;
    // the mesh kernel's 64 facets turn 5.6° each: each of the band's four edges may land a facet off, so ± 4 facets of side;
    // the exact kernel's per-corner surface normals land within 1 %
    const facet = side / 64;
    for (const [label, mesh, tolAbs] of [['mesh kernel (facet normals, ± 4 facets)', K.regenerate(solid((sk) => S.addCircle(sk, [0, 0], 10), 50), M).mesh, 4 * facet], ['exact kernel (surface normals, ± 1 %)', oc ? B.regenerateBrep(solid((sk) => S.addCircle(sk, [0, 0], 10), 50), oc).mesh : null, 0.01 * (side + ends)]]) {
      if (!mesh) continue;
      const c = AN.draftAnalysis(mesh, [0, 1, 0], 10, C);
      const band = side * 40 / 360, within = (x, y) => Math.abs(x - y) <= tolAbs;
      ok(within(c.areas.needs, band + ends) && within(c.areas.positive, (side - band) / 2) && within(c.areas.negative, (side - band) / 2) && Math.abs(c.areas.positive - c.areas.negative) < 1e-6 * side, `a cylinder across the pull, minimum 10°, ${label}: needs ${c.areas.needs.toFixed(1)} ≈ ${(band + ends).toFixed(1)} (the band 4·10/360 of the side + the ends), positive ${c.areas.positive.toFixed(1)} ≈ negative ${c.areas.negative.toFixed(1)} ≈ ${((side - band) / 2).toFixed(1)}`);
    }
  }

  section('zebra stripes and curvature on any body (analysis.js, 0.4 P22)');
  {
    const dark = [0, 0, 0], light = [1, 1, 1];
    const box = K.regenerate(solid((sk) => S.addRect(sk, [0, 0], [100, 20]), 40), M).mesh;
    const z = AN.zebraColors(box, [0.3, -0.5, -0.8], 12, { dark, light });
    // every triangle of a flat face shows one colour (one normal, one stripe)
    const I = box.indices, P2 = box.positions, byNormal = new Map();
    for (let tt = 0; tt < I.length / 3; tt++) {
      const a = I[tt * 3] * 3, b = I[tt * 3 + 1] * 3, c = I[tt * 3 + 2] * 3;
      const u = [P2[b] - P2[a], P2[b + 1] - P2[a + 1], P2[b + 2] - P2[a + 2]], v = [P2[c] - P2[a], P2[c + 1] - P2[a + 1], P2[c + 2] - P2[a + 2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]].map((x) => Math.round(x / Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]))).join();
      const set = byNormal.get(n) || new Set(); for (let k = 0; k < 3; k++) set.add(z[tt * 9 + k * 3]); byNormal.set(n, set);
    }
    ok(z.length === box.indices.length * 3 && byNormal.size === 6 && [...byNormal.values()].every((st) => st.size === 1), 'zebra on a box: one colour per triangle corner, and each of the six flat faces a single stripe');
    const cyl = K.regenerate(solid((sk) => S.addCircle(sk, [0, 0], 10), 50), M).mesh;
    const zc = AN.zebraColors(cyl, [0.6, 0, -0.8], 12, { dark, light });   // a view tilted across the axis (along it every side normal reflects alike)
    let nd = 0, nl = 0; for (let k = 0; k < zc.length; k += 3) { if (zc[k] === 0) nd++; else nl++; }
    ok(nd > 0 && nl > 0, `zebra on a cylinder seen at a slant: stripes of both colours (${nd} dark, ${nl} light corners)`);
    // curvature: a sphere of radius 10 has mean curvature 1/10 everywhere
    const sph = M.Manifold.sphere(10, 96).getMesh();
    const mesh = { positions: Float64Array.from(sph.vertProperties.filter((_, i) => i % sph.numProp < 3)), indices: Uint32Array.from(sph.triVerts) };
    const cv = AN.curvatureColors(mesh, { concave: [0, 0, 1], flat: [1, 1, 1], convex: [1, 0, 0] });
    ok(Math.abs(cv.lim - 0.1) < 0.01 && cv.colors.length === mesh.positions.length, `mean curvature of a sphere r 10: the colour scale reaches full at ${cv.lim.toFixed(4)} 1/mm (1/r = 0.1)`);
    let convex = 0; for (let k = 0; k < cv.colors.length; k += 3) if (cv.colors[k] === 1 && cv.colors[k + 2] < 0.5) convex++;
    ok(convex > 0.5 * cv.colors.length / 3, 'and it is coloured convex (red) over most of it');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  await runAnalysisTests({ ok, section, M, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
