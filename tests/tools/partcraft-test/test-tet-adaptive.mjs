#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-tet-adaptive.mjs — automatic mesh refinement for the tet studies (tetadapt.js, the ZZ estimates in tetfea.js and
 * tet-elements.js, the tetSolve op, sim.js settings):
 *   refinement: conforming bisection keeps the volume, the boundary nodes on the exact faces and the angles;
 *   the estimate: effectivity index (estimated ÷ true error in the energy norm) against Lamé's thick cylinder (stress) and
 *   radial conduction (heat), both known exactly;
 *   adaptivity vs uniform refinement on a plate with a hole (Heywood/Howland Kt, d/W 0.2) and a bar with two semicircular
 *   edge notches (Isida/Ling via Peterson, 2r/H 0.1), plane strain: the unknowns each needs to get within 1 % of Kt;
 *   stops: target, passes, element limit, a failing pass; study settings, simJob and the worker op (static and thermal).
 *   node tools/partcraft-test/test-tet-adaptive.mjs [--verbose]     (or runTetAdaptiveTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runTetAdaptiveTests({ ok, section, near, oc = null, log = (m) => console.log('  note ' + m) }) {
  const TM = await import(DEV + 'tetmesh.js'), TF = await import(DEV + 'tetfea.js'), TA = await import(DEV + 'tetadapt.js'), TE = await import(DEV + 'tet-elements.js');
  const TW = await import(DEV + 'tet-worker.js'), FE = await import(DEV + 'fea.js'), SIM = await import(DEV + 'sim.js'), MAT = await import(DEV + 'materials.js');
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'), B = await import(DEV + 'brep.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(2)} %`;
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const table = [], row = (...r) => table.push(r);
  const extrude = (name, draw, depth) => { const part = P.newPart(name), sk = S.newSketch(); draw(sk); const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk }); P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth }); return B.regenerateBrep(part, oc); };
  const plane = (b, n, at = null) => { let best = -1, bd = Infinity; b.faces.forEach((f, i) => { if (f.type !== 'plane' || f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] < 0.999) return; const d = at ? Math.hypot(...f.at.map((v, k) => v - at[k])) : 0; if (d < bd) { bd = d; best = i; } }); return best; };
  const cyl = (b, r) => b.faces.findIndex((f) => f.type === 'cylinder' && Math.abs(f.r - r) < 1e-6);
  const steel = MAT.materialById('steel');
  const a = 10, b = 20;
  const tube = extrude('Tube', (sk) => { const l1 = S.addLine(sk, [a, 0], [b, 0]), ar = S.addArc(sk, [0, 0], l1.p2, [0, b]), l2 = S.addLine(sk, ar.e, [0, a]); S.addArc(sk, [0, 0], l1.p1, l2.p2); }, 10);
  const bar = extrude('Bar', (sk) => S.addRect(sk, [0, 0], [100, 10]), 10);

  section('adaptive: refinement by conforming bisection (tetadapt.js refineTets, markForRefinement)');
  {
    const mj = TF.meshJob({ mesh: tube.mesh, faces: tube.faces, h: 5 }), tm = mj.tm, m = tm.tets.length / 4;
    // refine the tets touching the bore to a third of their size
    const target = new Float64Array(m).fill(Infinity);
    for (let e = 0; e < m; e++) { const r0 = Math.min(...[0, 1, 2, 3].map((k) => Math.hypot(tm.nodes[3 * tm.tets[4 * e + k]], tm.nodes[3 * tm.tets[4 * e + k] + 1]))); if (r0 < a + 1e-6) target[e] = 0.8; }
    const t0 = Date.now(), r = TA.refineTets(tm, tube.mesh, mj.faces, mj.bvh, target), ms = Date.now() - t0;
    const fc = new Map(); for (let e = 0; e < r.tets.length / 4; e++) for (const f of [[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]]) { const k = f.map((i) => r.tets[4 * e + i]).sort((x, y) => x - y).join(','); fc.set(k, (fc.get(k) || 0) + 1); }
    let over = 0, once = 0; for (const n of fc.values()) { if (n > 2) over++; if (n === 1) once++; }
    let neg = 0; for (let e = 0; e < r.tets.length / 4; e++) if (TM.tetVolume(r.nodes, r.tets[4 * e], r.tets[4 * e + 1], r.tets[4 * e + 2], r.tets[4 * e + 3]) <= 0) neg++;
    ok(r.tets.length / 4 > 3 * m && over === 0 && once === r.btri.length / 3 && neg === 0 && r.parent.length === r.tets.length / 4, `${m} → ${r.tets.length / 4} tets in ${r.stats.refineRounds} bisection rounds (${ms} ms): conforming (no face used three times, the boundary = the faces used once), none inverted, each knows its parent`);
    // new boundary vertices on the bore lie on the cylinder exactly
    let off = 0, cnt = 0; const bore = cyl(tube, a);
    for (let t = 0; t < r.btri.length / 3; t++) if (r.bface[t] === bore) for (let k = 0; k < 3; k++) { const v = r.btri[3 * t + k]; if (v < tm.nodes.length / 3) continue; off = Math.max(off, Math.abs(Math.hypot(r.nodes[3 * v], r.nodes[3 * v + 1]) - a)); cnt++; }
    ok(cnt > 100 && off < 1e-12 && r.stats.keptOnChord === 0, `the ${cnt} new nodes on the bore lie on its cylinder (worst ${off.toExponential(1)} mm), none left on a chord`);
    ok(r.quality.minDihedral >= Math.min(5, tm.quality.minDihedral) && r.quality.maxAspect < 3 * tm.quality.maxAspect, `angles kept: smallest dihedral ${tm.quality.minDihedral.toFixed(1)}° → ${r.quality.minDihedral.toFixed(1)}°, worst aspect ${tm.quality.maxAspect.toFixed(2)} → ${r.quality.maxAspect.toFixed(2)}`);
    const t10 = TM.toT10(r, tube.mesh, mj.faces, mj.bvh); let V = 0; for (let e = 0; e < t10.tets10.length / 10; e++) { const d = TM.t10DetJ(t10.nodes, t10.tets10.subarray(10 * e, 10 * e + 10)); V += (d[4] + d[5] + d[6] + d[7]) / 24; }
    ok(Math.abs(V / tube.stats.volume - 1) < 2e-4, `the refined quadratic mesh holds the tube's volume: ${V.toFixed(3)} vs ${tube.stats.volume.toFixed(3)} mm³ (${pct(V, tube.stats.volume)})`);
    // marking: Dörfler's bulk share, the cap
    const err = Float32Array.from({ length: 100 }, (_, i) => 100 - i), errSq = err.reduce((s, x) => s + x * x, 0), fake = { nodes: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]), tets: new Int32Array(400).map((_, i) => i % 4) };
    const mk = TA.markForRefinement(fake, err, 1e6, errSq, { target: 1 });
    const want = (() => { let s = 0, k = 0; for (const x of err) { if (s >= 0.5 * errSq) break; s += x * x; k++; } return k; })();
    ok(mk.marked === want && mk.share >= 0.5 && [...mk.target].slice(0, mk.marked).every((x) => x >= 0.5 * Math.SQRT2 - 1e-12 && x <= 0.7 * Math.SQRT2 + 1e-12) && [...mk.target].slice(mk.marked).every((x) => x === Infinity), `marking: the ${mk.marked} largest of 100 carry ${(100 * mk.share).toFixed(1)} % of Σe² (Dörfler θ 0.5); each to ½–0.7 of its longest edge; the rest left`);
    const mk2 = TA.markForRefinement(fake, Float32Array.from({ length: 100 }, () => 1), 1e6, 100, { target: 1 });
    ok(mk2.marked === 30, 'with an even error the cap marks 30 % of the elements');
  }

  section('adaptive: the error estimate against exact solutions (effectivity index)');
  {
    // Lamé, plane strain: true error ∫(σ − σh):C⁻¹:(σ − σh) at the Gauss points
    const p = 10, E = 2e5, nu = 0.26, A = p * a * a / (b * b - a * a), Bc = p * a * a * b * b / (b * b - a * a), mat = { name: 'Lamé', E, nu, density: 7850, yield: 250 };
    const bcs = { constraints: [{ type: 'frictionless', faces: [plane(tube, [-1, 0, 0]), plane(tube, [0, -1, 0]), plane(tube, [0, 0, -1]), plane(tube, [0, 0, 1])] }], loads: [{ type: 'pressure', faces: [cyl(tube, a)], p }] };
    const exact = (x, y) => { const r2 = x * x + y * y, sr = A - Bc / r2, st = A + Bc / r2; return [(sr * x * x + st * y * y) / r2, (sr * y * y + st * x * x) / r2, nu * (sr + st), (sr - st) * x * y / r2, 0, 0]; };
    const Cinv = (s) => ((s[0] * s[0] + s[1] * s[1] + s[2] * s[2]) - 2 * nu * (s[0] * s[1] + s[1] * s[2] + s[2] * s[0]) + 2 * (1 + nu) * (s[3] * s[3] + s[4] * s[4] + s[5] * s[5])) / E;
    const D = FE.elasticD(nu), thetas = [];
    for (const h of [5, 2.5]) {
      const r = TF.solveTetStudy({ mesh: tube.mesh, faces: tube.faces, material: mat, h, kind: 'static', bcs, tol: 1e-11 }), M = r.model, el = new Int32Array(10), ue = new Float64Array(30), g = new Float64Array(30), sg = new Float64Array(6), eg = new Float64Array(6);
      let te = 0;
      for (let e = 0; e < M.tets10.length / 10; e++) {
        for (let k = 0; k < 10; k++) { el[k] = M.tets10[10 * e + k]; for (let c = 0; c < 3; c++) ue[3 * k + c] = r.u[3 * el[k] + c]; }
        for (let q = 0; q < 4; q++) { TF.gpStress(M.X, el, q, ue, E, D, sg, eg, g); const det = TF.jac(M.X, el, TF.SH4[q].dN, g), N = TF.SH4[q].N; let x = 0, y = 0; for (let k = 0; k < 10; k++) { x += N[k] * M.X[3 * el[k]]; y += N[k] * M.X[3 * el[k] + 1]; } const ex = exact(x, y); te += TF.GP4[q][3] * det * Cinv(ex.map((v, i) => v - sg[i])); }
      }
      const th = Math.sqrt(r.errSq / te); thetas.push(th);
      row(`Effectivity, Lamé tube (stress), h ${h}`, `true error ${Math.sqrt(te).toExponential(3)} (energy norm, exact field)`, `estimate ${Math.sqrt(r.errSq).toExponential(3)}, ${r.errorPct.toFixed(3)} %`, `θ = ${th.toFixed(3)}`);
      log(`Lamé tube h ${h}: ${r.summary.elements} T10, ZZ ${Math.sqrt(r.errSq).toExponential(3)} vs true ${Math.sqrt(te).toExponential(3)}: effectivity ${th.toFixed(3)}`);
    }
    ok(thetas.every((t) => t > 0.75 && t < 1.25), `the stress estimate against Lamé's exact field: effectivity ${thetas.map((t) => t.toFixed(3)).join(' and ')} at h 5 and 2.5 (estimated ÷ true error in the energy norm; 1 = exact; it is an estimate, slightly low here)`);
    // radial conduction: q = −k dT/dr, T = 100 (1 − ln(r/a)/ln 2)
    const k = steel.k * 1e-3, heat = [{ type: 'temperature', faces: [cyl(tube, a)], T: 100 }, { type: 'temperature', faces: [cyl(tube, b)], T: 0 }], tth = [];
    for (const h of [5, 2.5]) {
      const r = TE.solveTetThermal({ mesh: tube.mesh, faces: tube.faces, material: 'steel', h, kind: 'thermal', heat }), M = r.model, el = new Int32Array(10), g = new Float64Array(30);
      let te = 0;
      for (let e = 0; e < M.tets10.length / 10; e++) {
        for (let q = 0; q < 10; q++) el[q] = M.tets10[10 * e + q];
        for (let q = 0; q < 4; q++) { const det = TF.jac(M.X, el, TF.SH4[q].dN, g), N = TF.SH4[q].N; let x = 0, y = 0, gx = 0, gy = 0, gz = 0; for (let j = 0; j < 10; j++) { x += N[j] * M.X[3 * el[j]]; y += N[j] * M.X[3 * el[j] + 1]; gx += g[3 * j] * r.T[el[j]]; gy += g[3 * j + 1] * r.T[el[j]]; gz += g[3 * j + 2] * r.T[el[j]]; }
          const r2 = x * x + y * y, d = -100 / Math.log(2) / r2; te += TF.GP4[q][3] * det * k * ((gx - d * x) ** 2 + (gy - d * y) ** 2 + gz * gz); }
      }
      const th = Math.sqrt(r.errSq / te); tth.push(th);
      row(`Effectivity, radial conduction (heat), h ${h}`, `true error ${Math.sqrt(te).toExponential(3)} (energy norm, exact field)`, `estimate ${Math.sqrt(r.errSq).toExponential(3)}, ${r.errorPct.toFixed(3)} %`, `θ = ${th.toFixed(3)}`);
    }
    ok(tth.every((t) => t > 0.5 && t < 1.5) && tth[1] > tth[0], `the heat-flux estimate against the exact log profile: effectivity ${tth.map((t) => t.toFixed(3)).join(' and ')} at h 5 and 2.5 (low on the coarse mesh, nearer 1 as it refines)`);
    const lin = TE.solveTetThermal({ mesh: bar.mesh, faces: bar.faces, material: 'steel', h: 5, kind: 'thermal', heat: [{ type: 'temperature', faces: [plane(bar, [-1, 0, 0])], T: 100 }, { type: 'temperature', faces: [plane(bar, [1, 0, 0])], T: 0 }] });
    ok(lin.errorPct < 1e-6, `a linear temperature field (bar, 100 → 0 °C) is recovered exactly: estimate ${lin.errorPct.toExponential(1)} %`);
  }

  // adaptive vs uniform on a stress concentration (plane strain: both faces in z frictionless, so the 2-D Kt applies)
  const compare = (name, geo, hs, bcs, ref, peakOf, passes, start) => {
    const uni = hs.map((h) => { const t0 = Date.now(), r = TF.solveTetStudy({ mesh: geo.mesh, faces: geo.faces, material: 'steel', h, kind: 'static', bcs, refineCurved: false }); return { h, dofs: r.summary.dofs, elements: r.summary.elements, peak: peakOf(r), est: r.errorPct, ms: Date.now() - t0 }; });
    const job = { mesh: geo.mesh, faces: geo.faces, material: 'steel', h: start, kind: 'static', bcs, refineCurved: false, adaptive: { target: 0.01, passes } };
    const peaks = [], t0 = Date.now(), out = TA.adaptiveTet(job, (cur, pr) => { const r = TF.solveTetOnMesh(job, cur, pr); peaks.push(peakOf(r)); return r; });
    const ad = out.adaptive.passes.map((p, i) => ({ ...p, peak: peaks[i] }));
    for (const u of uni) { log(`${name} uniform h ${u.h}: ${u.elements} T10, ${u.dofs} unknowns, peak ${u.peak.toFixed(3)} MPa (${pct(u.peak, ref)}), estimate ${u.est.toFixed(3)} %, ${u.ms} ms`); row(`${name}, uniform h ${u.h}`, `${ref.toFixed(3)} MPa`, `${u.peak.toFixed(3)} MPa, ${u.dofs.toLocaleString('en-US')} unknowns`, pct(u.peak, ref)); }
    for (const p of ad) { log(`${name} adaptive pass ${p.pass}: ${p.elements} T10, ${p.dofs} unknowns, peak ${p.peak.toFixed(3)} MPa (${pct(p.peak, ref)}), estimate ${p.errorPct.toFixed(3)} %, ${p.ms} ms`); row(`${name}, adaptive pass ${p.pass}`, `${ref.toFixed(3)} MPa`, `${p.peak.toFixed(3)} MPa, ${p.dofs.toLocaleString('en-US')} unknowns`, pct(p.peak, ref)); }
    log(`${name}: adaptive ${Date.now() - t0} ms, ${out.adaptive.message}`);
    return { uni, ad, out };
  };
  const within = (list, ref, tol) => list.find((x) => Math.abs(x.peak / ref - 1) <= tol);

  section('adaptive vs uniform refinement: plate with a hole (Kt), plane strain');
  {
    // a quarter of a 200 × 50 plate (x ≥ 0, y ≥ 0), Ø10 hole at the origin (d/W 0.2), 10 thick; 10 MPa pull along x
    const L = 100, Wh = 25, r = 5, t = 10, sig = 10, kt = (2 + 0.8 ** 3) / 0.8, ref = kt * sig;
    const qp = extrude('QuarterPlate', (sk) => { const l1 = S.addLine(sk, [r, 0], [L, 0]), l2 = S.addLine(sk, l1.p2, [L, Wh]), l3 = S.addLine(sk, l2.p2, [0, Wh]), l4 = S.addLine(sk, l3.p2, [0, r]); S.addArc(sk, [0, 0], l1.p1, l4.p2); }, t);
    const bcs = { constraints: [{ type: 'frictionless', faces: [plane(qp, [-1, 0, 0]), plane(qp, [0, -1, 0]), plane(qp, [0, 0, -1]), plane(qp, [0, 0, 1])] }], loads: [{ type: 'pressure', faces: [plane(qp, [1, 0, 0])], p: -sig }] };
    const hole = (res) => { const X = res.model.X; let m = -Infinity; for (let n = 0; n < res.model.n; n++) if (Math.abs(Math.hypot(X[3 * n], X[3 * n + 1]) - r) < 1e-6) m = Math.max(m, res.sigN[6 * n]); return m; };
    const { uni, ad, out } = compare('Plate with a hole', qp, [10, 5, 2.5, 2], bcs, ref, hole, 3, 10);
    const u1 = within(uni, ref, 0.01), a1 = within(ad, ref, 0.01);
    ok(a1 && u1 && a1.dofs < u1.dofs / 3, `within 1 % of Heywood's Kt ${kt.toFixed(3)} × 10 = ${ref.toFixed(2)} MPa: adaptive at pass ${a1 ? a1.pass : '–'} with ${a1 ? a1.dofs.toLocaleString('en-US') : '–'} unknowns, uniform refinement first at h ${u1 ? u1.h : '–'} with ${u1 ? u1.dofs.toLocaleString('en-US') : '–'} (${a1 && u1 ? (u1.dofs / a1.dofs).toFixed(1) : '–'}× more)`);
    ok(ad.every((p, i) => !i || p.errorPct < ad[i - 1].errorPct) && out.adaptive.stop === 'passes' && /most allowed/.test(out.adaptive.message), `the estimate falls every pass (${ad.map((p) => p.errorPct.toFixed(3)).join(' → ')} %); the run stops at the pass limit with that said ("${out.adaptive.message.slice(0, 60)}…")`);
    ok(Math.abs(ad[ad.length - 1].peak / ref - 1) < 0.006, `the last pass's peak ${ad[ad.length - 1].peak.toFixed(3)} MPa is within 0.6 % of the reference (Heywood's formula matches Howland's exact series to about 0.3 % at d/W 0.2)`);
  }

  section('adaptive vs uniform refinement: two semicircular edge notches (Kt), plane strain');
  {
    // a quarter of a 300 × 100 bar (x ≥ 0, y ≥ 0) with semicircular notches r 5 on both edges at x = 0 (2r/H 0.1)
    const L = 150, Hh = 50, r = 5, t = 10, sig = 10, q = 2 * r / (2 * Hh);
    const ktn = 3.065 - 3.472 * q + 1.009 * q * q + 0.405 * q ** 3, ref = ktn * sig / (1 - q);   // Peterson (Isida 1953, Ling 1968), net section → gross
    const nb = extrude('NotchedBar', (sk) => { const l1 = S.addLine(sk, [0, 0], [L, 0]), l2 = S.addLine(sk, l1.p2, [L, Hh]), l3 = S.addLine(sk, l2.p2, [r, Hh]), l4 = S.addLine(sk, [0, Hh - r], l1.p1); S.addArc(sk, [0, Hh], l4.p1, l3.p2); }, t);
    const bcs = { constraints: [{ type: 'frictionless', faces: [plane(nb, [-1, 0, 0]), plane(nb, [0, -1, 0]), plane(nb, [0, 0, -1]), plane(nb, [0, 0, 1])] }], loads: [{ type: 'pressure', faces: [plane(nb, [1, 0, 0])], p: -sig }] };
    const root = (res) => { const X = res.model.X; let m = -Infinity; for (let n = 0; n < res.model.n; n++) if (Math.abs(Math.hypot(X[3 * n], X[3 * n + 1] - Hh) - r) < 1e-6) m = Math.max(m, res.sigN[6 * n]); return m; };
    const { uni, ad } = compare('Edge notches', nb, [10, 5, 2.5], bcs, ref, root, 3, 10);
    const u1 = within(uni, ref, 0.01), a1 = within(ad, ref, 0.01);
    ok(a1 && (!u1 || a1.dofs < u1.dofs / 3), `within 1 % of Kt ${(ref / sig).toFixed(3)} (Isida/Ling, net ${ktn.toFixed(3)}): adaptive at pass ${a1 ? a1.pass : '–'} with ${a1 ? a1.dofs.toLocaleString('en-US') : '–'} unknowns; uniform refinement ${u1 ? `first at h ${u1.h} with ${u1.dofs.toLocaleString('en-US')} (${(u1.dofs / a1.dofs).toFixed(1)}× more)` : `not within 1 % even at h ${uni[uni.length - 1].h} (${uni[uni.length - 1].dofs.toLocaleString('en-US')} unknowns, ${pct(uni[uni.length - 1].peak, ref)})`}`);
  }

  section('adaptive: stops (target, element limit, a failing pass), study settings, simJob and the worker op');
  {
    const bcs = { constraints: [{ type: 'fixed', faces: [plane(bar, [-1, 0, 0])] }], loads: [{ type: 'force', faces: [plane(bar, [1, 0, 0])], total: 100, dir: [0, -1, 0] }] };
    const job = (extra) => ({ mesh: bar.mesh, faces: bar.faces, material: 'steel', h: 5, kind: 'static', bcs, ...extra });
    const j1 = job({ adaptive: { target: 50, passes: 4 } }), r1 = TA.adaptiveTet(j1, (cur, pr) => TF.solveTetOnMesh(j1, cur, pr));
    ok(r1.adaptive.stop === 'target' && r1.adaptive.converged && r1.adaptive.passes.length === 1, `a target already met stops after the first solve: "${r1.adaptive.message}"`);
    const j2 = job({ adaptive: { target: 0.01, passes: 5, maxElements: 3000 } }), r2 = TA.adaptiveTet(j2, (cur, pr) => TF.solveTetOnMesh(j2, cur, pr));
    ok(r2.adaptive.stop === 'elements' && !r2.adaptive.converged && /more than 3,000/.test(r2.adaptive.message) && r2.result && r2.result.summary.elements <= 3000, `the element limit stops it cleanly with the last good answer: "${r2.adaptive.message}"`);
    let n = 0; const j3 = job({ adaptive: { target: 0.01, passes: 4 } });
    const r3 = TA.adaptiveTet(j3, (cur, pr) => { if (++n === 2) throw new Error('the solver did not converge'); return TF.solveTetOnMesh(j3, cur, pr); });
    ok(r3.adaptive.stop === 'failed' && r3.adaptive.passes.length === 1 && /Pass 2 failed \(the solver did not converge\); the results are pass 1's/.test(r3.adaptive.message) && r3.result.summary, `a failing pass ends the loop with the previous pass's results: "${r3.adaptive.message}"`);
    ok(throws(() => TA.adaptiveTet(j3, () => { throw new Error('no supports'); }), /no supports/), 'a failure on the very first solve is reported as the error itself');
    // study settings
    const st = SIM.newSimStudy();
    ok(st.adaptive === undefined && JSON.stringify(SIM.readSimStudy(JSON.parse(JSON.stringify(st)))) === JSON.stringify(st), 'a new study has no adaptive block, and reads back unchanged');
    const on = SIM.readSimStudy({ ...st, material: 'steel', adaptive: { target: 2, passes: 3 } });
    ok(on.adaptive.target === 2 && on.adaptive.passes === 3, 'the adaptive block { target 2 %, 3 passes } reads back');
    ok(throws(() => SIM.readSimStudy({ ...st, adaptive: { target: 0, passes: 3 } }), /refinement target/) && throws(() => SIM.readSimStudy({ ...st, adaptive: { target: 1, passes: 40 } }), /refinement passes/) && throws(() => SIM.readSimStudy({ ...st, adaptive: 'yes' }), /refinement settings/), 'tampered settings are refused (target 0, 40 passes, not an object)');
    const fixed = bar.faces[plane(bar, [-1, 0, 0])], end = bar.faces[plane(bar, [1, 0, 0])];
    const s2 = SIM.readSimStudy({ ...st, material: 'steel', h: 5, adaptive: { target: 0.5, passes: 2 }, constraints: [{ id: 'c1', type: 'fixed', faces: [B.faceRef(fixed)] }], loads: [{ id: 'l2', type: 'force', faces: [B.faceRef(end)], total: 100, dir: [0, -1, 0] }] });
    const { job: sj, problems } = SIM.simJob(s2, bar);
    ok(!problems.length && sj.adaptive && sj.adaptive.target === 0.5 && sj.adaptive.passes === 2 && sj.adaptive.maxElements === SIM.LIMITS.tetElements, 'simJob passes the settings and the element limit to the worker');
    const w = TW.tetSolve(sj);
    ok(w.adaptive && w.adaptive.passes.length >= 1 && w.adaptive.passes.length <= 2 && w.adaptive.passes.every((p) => p.dofs > 0 && p.maxVm > 0 && p.maxDisp > 0) && w.summary.elements === w.adaptive.passes[w.adaptive.passes.length - 1].elements && near(w.reaction[1], 100, 1e-5), `tetSolve with the settings: ${w.adaptive.passes.length} passes (${w.adaptive.passes.map((p) => `${p.elements} tets, ${p.errorPct.toFixed(3)} %`).join('; ')}), the plot and table from the last; reactions still 100 N`);
    const ts = SIM.readSimStudy({ ...st, kind: 'thermal', material: 'steel', h: 5, adaptive: { target: 0.2, passes: 3 }, heat: [{ id: 'h1', type: 'temperature', faces: [B.faceRef(tube.faces[cyl(tube, a)])], T: 100 }, { id: 'h2', type: 'temperature', faces: [B.faceRef(tube.faces[cyl(tube, b)])], T: 0 }], thermal: { gen: 0, transient: false, T0: 20, t: 60, steps: 30, scheme: 'euler' } });
    const wt = TW.tetSolve(SIM.simJob(ts, tube).job), Qx = 2 * Math.PI * steel.k * 1e-3 * 10 * 100 / Math.log(2) / 4;
    ok(wt.kind === 'thermal' && wt.adaptive && wt.adaptive.passes.length >= 2 && wt.adaptive.passes.every((p, i) => !i || p.errorPct < wt.adaptive.passes[i - 1].errorPct) && Math.abs(wt.balance.inflow / Qx - 1) < 2e-3, `a steady thermal study refines too: ${wt.adaptive.passes.map((p) => `${p.elements} tets ${p.errorPct.toFixed(3)} %`).join(' → ')}; heat flow ${pct(wt.balance.inflow, Qx)} vs 2πkLΔT/ln 2 ÷ 4`);
    ok(!TW.adaptiveApplies({ kind: 'thermal', transient: { T0: 20 }, adaptive: {} }) && !TW.adaptiveApplies({ kind: 'static', thermalLoad: { mode: 'uniform' }, adaptive: {} }) && !TW.adaptiveApplies({ kind: 'buckling', thermalLoad: { mode: 'uniform' }, adaptive: {} }) && TW.adaptiveApplies({ kind: 'modal', adaptive: {} }) && TW.adaptiveApplies({ kind: 'buckling', adaptive: {} }) && TW.adaptiveApplies({ kind: 'static', adaptive: {} }), 'it applies to static and buckling studies without a thermal load, modal and steady thermal studies (0.4: modal and buckling); not transient or thermal-load ones');
  }

  section('adaptive: modal and buckling studies (0.4 P5)');
  {
    // a 100 × 10 × 10 mm steel bar, fixed at x = 0. Euler–Bernoulli: cantilever f₁ = (1.8751²/2π)·√(EI/(ρAL⁴)); fixed-free column
    // P_cr = π²EI/(4L²). Both ignore shear and the fixed end's 3-D stiffening, so the solid comes out a little lower.
    const E = steel.E, I = 10 ** 4 / 12, A = 100, L = 100, rho = MAT.tonnesPerMm3(steel.density);
    const f1EB = 1.875104 ** 2 / (2 * Math.PI) * Math.sqrt(E * I / (rho * A * L ** 4)), PcrEB = Math.PI ** 2 * E * I / (4 * L * L);
    const fixed = plane(bar, [-1, 0, 0]), end = plane(bar, [1, 0, 0]);
    const mj = { mesh: bar.mesh, faces: bar.faces, material: 'steel', h: 5, kind: 'modal', modes: 2, bcs: { constraints: [{ type: 'fixed', faces: [fixed] }], loads: [] }, adaptive: { target: 0.3, passes: 4, maxElements: 60000 } };
    const t0 = Date.now(), mo = TA.adaptiveTet(mj, (cur, pr) => TF.solveTetOnMesh(mj, cur, pr)), P1 = mo.adaptive.passes;
    const f = P1.map((p) => p.freqs[0]), f2 = P1.map((p) => p.freqs[1]);
    ok(P1.length >= 3 && P1.every((p, i) => !i || (p.freqs[0] <= P1[i - 1].freqs[0] * (1 + 1e-9) && p.freqs[1] <= P1[i - 1].freqs[1] * (1 + 1e-9))), `modal, flat faces only (meshes nest): both frequencies fall every pass — f₁ ${f.map((v) => v.toFixed(2)).join(' → ')} Hz, f₂ ${f2.map((v) => v.toFixed(2)).join(' → ')} (${Date.now() - t0} ms)`);
    ok(P1.every((p, i) => !i || p.errorPct < P1[i - 1].errorPct) && P1.every((p) => p.errorParts?.length === 2), `the estimate (both modes, each at unit energy) falls every pass: ${P1.map((p) => p.errorPct.toFixed(3) + ' %').join(' → ')}`);
    ok(Math.abs(f.at(-1) / f1EB - 1) < 0.03 && f.at(-1) < f1EB, `f₁ ${f.at(-1).toFixed(2)} Hz vs Euler–Bernoulli ${f1EB.toFixed(2)} Hz (${pct(f.at(-1), f1EB)}: shear and the solid's 3-D root lower it) at ${P1.at(-1).dofs.toLocaleString('en-US')} unknowns`);
    row('Cantilever bar f₁ (adaptive)', `EB ${f1EB.toFixed(1)} Hz`, `${f.at(-1).toFixed(2)} Hz`, pct(f.at(-1), f1EB));
    const bj = { mesh: bar.mesh, faces: bar.faces, material: 'steel', h: 5, kind: 'buckling', modes: 1, bcs: { constraints: [{ type: 'fixed', faces: [fixed] }], loads: [{ type: 'force', faces: [end], total: 1, dir: [-1, 0, 0] }] }, adaptive: { target: 0.3, passes: 4, maxElements: 60000 } };
    const t1 = Date.now(), bo = TA.adaptiveTet(bj, (cur, pr) => TE.solveTetBucklingOnMesh(bj, cur, pr)), P2 = bo.adaptive.passes, k = P2.map((p) => p.factors[0]);
    ok(P2.length >= 2 && P2.every((p, i) => !i || p.errorPct < P2[i - 1].errorPct) && P2.every((p) => p.errorParts?.length === 2), `buckling: the estimate (pre-stress, modes) falls every pass: ${P2.map((p) => p.errorPct.toFixed(3) + ' %').join(' → ')}; load factor ${k.map((v) => v.toFixed(0)).join(' → ')} (${Date.now() - t1} ms)`);
    ok(Math.abs(k.at(-1) / PcrEB - 1) < 0.03, `load factor ${k.at(-1).toFixed(0)} × 1 N vs Euler π²EI/(4L²) = ${PcrEB.toFixed(0)} N (${pct(k.at(-1), PcrEB)})`);
    row('Fixed-free column P_cr (adaptive)', `Euler ${PcrEB.toFixed(0)} N`, `${k.at(-1).toFixed(0)} N`, pct(k.at(-1), PcrEB));
    // the worker op from a study: modal and buckling with the switch on
    const st = SIM.newSimStudy(), fc = B.faceRef(bar.faces[fixed]), ec = B.faceRef(bar.faces[end]);
    const ms = SIM.readSimStudy({ ...st, kind: 'modal', modes: 2, material: 'steel', h: 5, adaptive: { target: 1, passes: 2 }, constraints: [{ id: 'c1', type: 'fixed', faces: [fc] }], loads: [] });
    const wm = TW.tetSolve(SIM.simJob(ms, bar).job);
    ok(wm.kind === 'modal' && wm.adaptive && wm.adaptive.passes.length >= 1 && wm.adaptive.passes.every((p) => p.freqs.length === 2) && near(wm.freqs[0], wm.adaptive.passes.at(-1).freqs[0], 1e-9) && wm.errorPct === wm.adaptive.passes.at(-1).errorPct, `tetSolve, modal with "Refine automatically": ${wm.adaptive.passes.map((p) => `${p.elements} tets, f₁ ${p.freqs[0].toFixed(1)} Hz, ${p.errorPct.toFixed(2)} %`).join('; ')}; the shapes plotted are the last pass's`);
    const bs = SIM.readSimStudy({ ...st, kind: 'buckling', modes: 1, material: 'steel', h: 5, adaptive: { target: 1, passes: 2 }, constraints: [{ id: 'c1', type: 'fixed', faces: [fc] }], loads: [{ id: 'l2', type: 'force', faces: [ec], total: 1, dir: [-1, 0, 0] }] });
    const wb = TW.tetSolve(SIM.simJob(bs, bar).job);
    ok(wb.kind === 'buckling' && wb.adaptive && wb.adaptive.passes.every((p) => p.factors.length >= 1) && near(wb.factors[0], wb.adaptive.passes.at(-1).factors[0], 1e-9), `tetSolve, buckling with the switch on: ${wb.adaptive.passes.map((p) => `${p.elements} tets, factor ${p.factors[0].toFixed(0)}, ${p.errorPct.toFixed(2)} %`).join('; ')}`);
    const off = TW.tetSolve(SIM.simJob({ ...ms, adaptive: undefined }, bar).job);
    ok(!off.adaptive && off.errorPct === null, 'with the switch off a modal study solves once, with no estimate');
  }

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
  await runTetAdaptiveTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
