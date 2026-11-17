#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-abos.mjs — CivilCraft 0.9.1 (/suggest #1500): the ABOS gridding method (gridding.js abos(), written from
 * M. Dressler's description, Technical University of Liberec 2007, chapter 4). DOM-free, in Node. What is checked:
 *   - a plane: ABOS is an approximation, not an exact fit; at the points it is within the accuracy the paper states
 *     (1 % of the height range by default), and over the grid within a stated bound
 *   - the data are honoured to the accuracy asked for whenever the method reports it converged (and it says so when not)
 *   - a hill and a ridge: RMS error against the true surface beside minimum curvature and kriging (printed; bounded)
 *   - the parameters do what the paper says: a lower q is smoother, a tighter accuracy takes more cycles and fits closer
 *   - the survey points already in the repo (tools/civilcraft-test/site-topo.csv): converges, contours exist
 *   - the project: method, smoothness and accuracy saved, read back, reported in words
 *   node bin/test-civilcraft-abos.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const G = await mod('gridding.js');
const TIN = await mod('tin.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);

let seed = 12345;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const X0 = 512000, Y0 = 4180000;
const scatter = (n, f) => Array.from({ length: n }, () => { const x = X0 + rnd() * 400, y = Y0 + rnd() * 300; return { x, y, z: f(x, y) }; });
const plane = (x, y) => 0.02 * (x - X0) + 0.03 * (y - Y0) + 5;
const hill = (x, y) => 20 * Math.exp(-(((x - X0 - 200) / 120) ** 2 + ((y - Y0 - 150) / 90) ** 2));
const ridge = (x, y) => 12 - 0.08 * Math.abs((y - Y0 - 150) - 0.25 * (x - X0 - 200));   // a straight roof-like ridge, sharp along its top
const err = (r, f) => { let ss = 0, mx = 0, n = 0; for (const p of r.pts) { const d = p.z - f(p.x, p.y); ss += d * d; mx = Math.max(mx, Math.abs(d)); n++; } return { rms: Math.sqrt(ss / n), max: mx, n }; };
const note = (r) => r.notes.find((n) => n.code === 'abos.iter');
const range = (P) => Math.max(...P.map((p) => p.z)) - Math.min(...P.map((p) => p.z));
// how rough a grid is: mean |second difference| over the inside nodes
const rough = (r) => { const { nx, ny, z } = r.grid; let s = 0, n = 0; for (let j = 1; j + 1 < ny; j++) for (let i = 1; i + 1 < nx; i++) { const c = z[j * nx + i], a = z[j * nx + i - 1], b = z[j * nx + i + 1], d = z[(j - 1) * nx + i], e = z[(j + 1) * nx + i]; if (![c, a, b, d, e].every(Number.isFinite)) continue; s += Math.abs(a + b - 2 * c) + Math.abs(d + e - 2 * c); n++; } return s / n; };

section('the method is listed');
{
  const m = G.METHODS.find((q) => q.key === 'abos');
  ok(!!m && m.exact === false, 'abos is in the list, marked as not exact (an approximation)');
}

section('a plane');
{
  const P = scatter(300, plane), R = range(P);
  const r = G.gridSurface(P, { method: 'abos' });
  const n = note(r), e = err(r, plane);
  ok(!r.error && n.converged && n.q === 0.5 && n.accuracy === 1, `converged in ${n.n} cycles with the paper's defaults (q 0.5, accuracy 1 %)`);
  ok(n.max <= 0.01 * R + 1e-12 && Math.abs(n.tol - 0.01 * R) < 1e-6 * R, `largest difference at the (filtered) points ${n.max.toFixed(4)} is inside 1 % of the height range (${(0.01 * R).toFixed(4)})`);
  ok(r.residuals.max <= 0.02 * R, `at every original point: off by ${r.residuals.max.toFixed(4)} at most, ${r.residuals.rms.toFixed(4)} RMS (range ${R.toFixed(2)})`);
  ok(e.rms <= 0.01 * R && e.max <= 0.04 * R, `over the grid the plane is reproduced to ${e.rms.toFixed(4)} RMS, ${e.max.toFixed(4)} at most (not exactly: ABOS approximates)`);
  const tight = G.gridSurface(P, { method: 'abos', abosAccuracy: 0.25 }), nt = note(tight);
  ok(nt.n >= n.n && (nt.converged ? nt.max <= 0.0025 * R + 1e-12 : nt.stalled), `accuracy 0.25 %: ${nt.n} cycles, ${nt.converged ? 'converged at ' + nt.max.toFixed(4) : 'stopped at ' + nt.max.toFixed(4) + ' and says it did not converge'}`);
  ok(nt.max <= n.max + 1e-12, 'a tighter accuracy never ends farther from the points');
}

section('the data are honoured to the stated accuracy');
for (const [name, f] of [['hill', hill], ['ridge', ridge]]) {
  seed = 777;
  const P = scatter(400, f), R = range(P);
  for (const acc of [1, 5]) {
    const r = G.gridSurface(P, { method: 'abos', abosAccuracy: acc }), n = note(r);
    ok(n.converged ? n.max <= acc * R / 100 + 1e-12 : n.stalled, `${name}, accuracy ${acc} %: ${n.converged ? `converged in ${n.n} cycles, largest difference ${n.max.toFixed(4)} ≤ ${(acc * R / 100).toFixed(4)}` : `did not converge (${n.max.toFixed(4)}), reported`}`);
    if (acc === 1 && name === 'hill') ok(n.converged, `${name}: converges at the default accuracy`);
  }
}

section('a hill and a ridge beside minimum curvature and kriging');
for (const [name, f, bound] of [['hill', hill, 0.6], ['ridge', ridge, 0.6]]) {
  seed = 2024;
  const P = scatter(400, f);
  const res = {};
  for (const m of ['abos', 'mincurv', 'kriging']) { const r = G.gridSurface(P, { method: m, maxNodes: 20000 }); res[m] = { e: err(r, f), r }; }
  const line = Object.entries(res).map(([m, v]) => `${m} ${v.e.rms.toFixed(3)} RMS / ${v.e.max.toFixed(3)} max`).join(', ');
  console.log(`  ${name} (true surface known): ${line}`);
  ok(res.abos.e.rms <= bound, `${name}: ABOS RMS error ${res.abos.e.rms.toFixed(3)} within ${bound}`);
  ok(res.abos.e.rms <= 2 * Math.max(res.mincurv.e.rms, res.kriging.e.rms), `${name}: ABOS is no worse than twice the worse of the other two`);
  // no wild overshoot: the grid stays within the data's range plus 10 %
  const zs = res.abos.r.pts.map((p) => p.z), lo = Math.min(...P.map((p) => p.z)), hi = Math.max(...P.map((p) => p.z));
  ok(Math.min(...zs) >= lo - 0.1 * (hi - lo) && Math.max(...zs) <= hi + 0.1 * (hi - lo), `${name}: no overshoot beyond 10 % of the data's range`);
}

section('the parameters');
{
  seed = 99;
  const P = scatter(400, (x, y) => hill(x, y) + (rnd() - 0.5) * 1.5);   // a hill with ±0.75 of noise, so smoothness shows
  const a = G.gridSurface(P, { method: 'abos', abosQ: 0.1, abosAccuracy: 10 }), b = G.gridSurface(P, { method: 'abos', abosQ: 1.5, abosAccuracy: 10 });
  ok(note(a).q === 0.1 && note(b).q === 1.5, 'q is taken from the options');
  ok(rough(a) < rough(b), `a lower q gives a smoother grid (roughness ${rough(a).toFixed(4)} at q 0.1, ${rough(b).toFixed(4)} at q 1.5)`);
  const les = G.gridSurface(P, { method: 'abos', abosLes: true });
  ok(!les.error && note(les), 'the LES smoothing option runs');
  const bad = G.gridSurface(P, { method: 'abos', abosQ: -1, abosAccuracy: NaN });
  ok(note(bad).q === 0.5 && note(bad).accuracy === 1, 'a bad q or accuracy falls back to the defaults');
  const coarse = G.gridSurface(P, { method: 'abos', step: 20 }), fine = G.gridSurface(P, { method: 'abos', step: 5 }), auto = G.gridSurface(P, { method: 'abos' }), autoK = G.gridSurface(P, { method: 'kriging' });
  ok(Math.abs(auto.step * 4 - autoK.step) < 1e-9 * autoK.step, `left automatic, the ABOS grid is four times finer than the other methods' (${auto.step.toFixed(2)} against ${autoK.step.toFixed(2)})`);
  ok(coarse.step === 20 && fine.step === 5 && note(coarse).merged > note(fine).merged, `the grid spacing is the resolution: ${note(coarse).merged} points merged at 20, ${note(fine).merged} at 5`);
  const t = Date.now(); const big = G.gridSurface(scatter(3000, hill), { method: 'abos' }); const ms = Date.now() - t;
  ok(!big.error && big.grid.nx * big.grid.ny <= 90000 + 2000, `3000 points: ${big.grid.nx} × ${big.grid.ny} nodes in ${ms} ms`);
}

section('breaklines and a boundary');
{
  seed = 5;
  const P = scatter(300, plane);
  const line = [{ x: X0 + 50, y: Y0 + 50, z: 30 }, { x: X0 + 350, y: Y0 + 250, z: 30 }];
  const r = G.gridSurface(P, { method: 'abos', lines: [line], boundary: [{ x: X0 + 20, y: Y0 + 20 }, { x: X0 + 380, y: Y0 + 20 }, { x: X0 + 380, y: Y0 + 280 }, { x: X0 + 20, y: Y0 + 280 }] });
  ok(!r.error && r.notes.some((n) => n.code === 'lines') && r.notes.some((n) => n.code === 'boundary'), 'breakline points join the data, the boundary cuts the grid');
  const s = TIN.surfaceFromFaces({ pts: r.pts, faces: r.faces }).surface;
  const z = s.elevationAt(X0 + 200, Y0 + 150);
  ok(z > 20, `the surface rises to the breakline (${z.toFixed(2)} on a line at 30 over ground near 13)`);
}

section('survey points in the repo (site-topo.csv)');
{
  const fx = PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points.map((p) => ({ x: p.x, y: p.y, z: p.z }));
  const R = range(fx);
  const r = G.gridSurface(fx, { method: 'abos' }), n = note(r);
  ok(!r.error && n.converged && n.max <= 0.01 * R, `276 points: converged in ${n.n} cycles, largest difference ${n.max.toFixed(3)} of a ${R.toFixed(2)} range`);
  const k = G.gridSurface(fx, { method: 'kriging' }), mc = G.gridSurface(fx, { method: 'mincurv' });
  console.log(`  residual at the points: ABOS ${r.residuals.rms.toFixed(3)} RMS / ${r.residuals.max.toFixed(3)} max, kriging ${k.residuals.rms.toFixed(3)} / ${k.residuals.max.toFixed(3)}, minimum curvature ${mc.residuals.rms.toFixed(3)} / ${mc.residuals.max.toFixed(3)}`);
  const s = TIN.surfaceFromFaces({ pts: r.pts, faces: r.faces }).surface;
  const c = s.contours(1);
  ok(c.length > 10 && c.every((l) => l.pts.length >= 2), `${c.length} contour lines at 1 ft from the ABOS surface`);
}

section('the project');
{
  const fx = PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points;
  const p = new PJ.Project();
  p.setPoints(fx, 'site-topo.csv');
  p.change('method', (st) => { st.surface.method = 'abos'; st.surface.gridQ = 0.25; st.surface.gridAcc = 2; });
  const eg = p.eg();
  ok(!!eg.surface && eg.report.errors.length === 0, 'the ground is built by ABOS');
  ok(eg.report.notes.some((n) => /^ABOS (finished|stopped) after \d+ cycles/.test(n) && n.includes('2% of the height range')), 'the surface report says how it ended, in words: ' + (eg.report.notes.find((n) => /^ABOS (finished|stopped)/.test(n)) || '').slice(0, 110) + '…');
  ok(eg.report.notes.every((n) => !/cv\.grid\./.test(n)), 'no untranslated keys in the report');
  const saved = JSON.parse(JSON.stringify(p.toJSON()));
  ok(saved.surface.method === 'abos' && saved.surface.gridQ === 0.25 && saved.surface.gridAcc === 2, 'method, smoothness and accuracy are saved');
  const back = PJ.Project.fromJSON(saved); const q = back.project ?? back;
  ok(q.state.surface.method === 'abos' && q.state.surface.gridQ === 0.25 && q.state.surface.gridAcc === 2, 'and read back');
  ok(p.contours().length > 10, 'contours come from it');
  p.undo();
  ok(!p.state.surface.method, 'undo goes back to the triangulation');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
