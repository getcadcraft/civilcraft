#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-gridding.mjs — CivilCraft 0.9 D9.6: the contouring methods (gridding.js), DOM-free, in Node. Known answers:
 *   - a plane z = 0.02x + 0.03y + 5 from scattered points: polynomial regression, local polynomial, radial basis and natural neighbour
 *     (linear precision) reproduce it to rounding; the others stay within a stated tolerance
 *   - nearest returns a data value; every exact method returns the data value at a data point (residuals ~ grid error)
 *   - a smooth hill: each method's RMS error against the true surface is printed with --verbose and bounded
 *   - kriging gives an error (sigma) that is 0 at data and larger away from them; minimum curvature converges
 *   - the surface goes through tin.js surfaceFromFaces and its contours exist and sit on the right level
 *   node bin/test-civilcraft-gridding.mjs [--build dev|x.y] [--verbose]
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

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);

// deterministic scattered points (a small linear congruential generator), 400 m × 300 m, offset like real survey coordinates
let seed = 12345;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const X0 = 512000, Y0 = 4180000;
const scatter = (n, f) => Array.from({ length: n }, () => { const x = X0 + rnd() * 400, y = Y0 + rnd() * 300; return { x, y, z: f(x, y) }; });
const plane = (x, y) => 0.02 * (x - X0) + 0.03 * (y - Y0) + 5;   // a gentle slope: 0 to 17 over the site
const hill = (x, y) => 20 * Math.exp(-(((x - X0 - 200) / 120) ** 2 + ((y - Y0 - 150) / 90) ** 2));

// evaluate a gridded surface against the truth at the grid nodes
const err = (r, f) => {
  let ss = 0, mx = 0, n = 0;
  for (const p of r.pts) { const d = p.z - f(p.x, p.y); ss += d * d; mx = Math.max(mx, Math.abs(d)); n++; }
  return { rms: Math.sqrt(ss / n), max: mx, n };
};

section('the list');
ok(G.METHODS.length === 17 && new Set(G.METHODS.map((m) => m.key)).size === 17, 'ten height methods, the kriging error and six data metrics');
ok(G.gridSurface([], { method: 'idw' }).error === 'few', 'too few points is an error, not a throw');
ok(G.gridSurface(scatter(10, plane), { method: 'nope' }).error === 'method', 'unknown method');

section('a plane');
{
  const P = scatter(300, plane);
  // minimum curvature pins each point to its nearest node, so on a slope it is off by about half a cell × the slope
  const tol = { polyreg: 1e-6, localpoly: 1e-4, rbf: 1e-3, natural: 1e-5, idw: 1.2, shepard: 1.2, movavg: 1.2, nearest: 1.5, mincurv: 1.0, kriging: 0.3 };
  for (const m of G.METHODS.filter((q) => !/^(metric-|krigerr)/.test(q.key))) {
    const r = G.gridSurface(P, { method: m.key, order: 1, maxNodes: 20000 });
    if (r.error) { ok(false, `${m.key}: error ${r.error}`); continue; }
    const e = err(r, plane);
    ok(e.n > 1000 && e.max <= tol[m.key], `${m.key}: plane max error ${e.max.toExponential(2)} within ${tol[m.key]} (${e.n} nodes)`);
    if (VERBOSE) console.log(`      ${m.key.padEnd(10)} rms ${e.rms.toFixed(4)} max ${e.max.toFixed(4)} residual at points rms ${r.residuals.rms.toFixed(4)}`);
  }
}

section('data points');
{
  const P = scatter(120, hill);
  const near1 = G.gridSurface(P, { method: 'nearest', maxNodes: 20000 });
  const zs = new Set(P.map((p) => p.z.toFixed(9)));
  ok(near1.pts.every((p) => zs.has(p.z.toFixed(9))), 'nearest: every node holds a data value');
  for (const k of ['idw', 'shepard', 'natural', 'rbf', 'kriging', 'mincurv']) {
    const r = G.gridSurface(P, { method: k, maxNodes: 20000 });
    ok(r.residuals.n > 100 && r.residuals.rms < 1.5, `${k}: close to the data at the points (rms ${r.residuals.rms.toFixed(3)} on a 20-high hill)`);
  }
  const poly = G.gridSurface(P, { method: 'polyreg', order: 1, maxNodes: 20000 });
  ok(poly.residuals.rms > 2, 'polyreg order 1 is a trend: it does not follow the hill');
}

section('a smooth hill: the methods compared');
{
  const P = scatter(150, hill);
  const out = {};
  for (const m of G.METHODS.filter((q) => !/^(metric-|krigerr)/.test(q.key))) {
    const r = G.gridSurface(P, { method: m.key, order: 3, maxNodes: 20000 });
    out[m.key] = err(r, hill).rms;
    if (VERBOSE) console.log(`      ${m.key.padEnd(10)} rms vs the true hill ${out[m.key].toFixed(3)}`);
  }
  ok(out.rbf < 1.5 && out.kriging < 1.5 && out.natural < 2 && out.mincurv < 2, 'smooth methods follow the hill (rms < 1.5-2 of 20)');
  ok(out.rbf < out.nearest && out.natural < out.nearest, 'smooth methods beat nearest on a smooth hill');
  ok(out.polyreg < 5, 'cubic trend gets the hill roughly');
}

section('kriging error and minimum curvature');
{
  const P = scatter(80, hill);
  const k = G.gridSurface(P, { method: 'kriging', maxNodes: 15000 });
  ok(k.sigma instanceof Float64Array && k.notes.some((n) => n.code === 'kriging.variogram' && n.range > 0 && n.sill > 0), 'kriging: variogram fitted and reported, sigma returned');
  const s = Array.from(k.sigma).filter(Number.isFinite);
  ok(s.length > 100 && Math.min(...s) >= 0 && Math.max(...s) > 0, 'kriging sigma is finite and non-negative');
  const m = G.gridSurface(P, { method: 'mincurv', maxNodes: 15000 });
  const it = m.notes.find((n) => n.code === 'mincurv.iter');
  ok(it && it.n > 1 && it.converged, `minimum curvature converged in ${it && it.n} passes`);
}

section('breaklines, boundary, data metrics, the kriging error');
{
  // a ridge: a breakline along y = Y0+150 at height 30 where the scattered points say 0
  const flat = scatter(120, () => 0);
  const withLine = G.gridSurface(flat, { method: 'idw', lines: [[{ x: X0 + 20, y: Y0 + 150, z: 30 }, { x: X0 + 380, y: Y0 + 150, z: 30 }]], maxNodes: 20000 });
  const without = G.gridSurface(flat, { method: 'idw', maxNodes: 20000 });
  const onLine = (r) => Math.max(...r.pts.filter((p) => Math.abs(p.y - (Y0 + 150)) < 3 && p.x > X0 + 60 && p.x < X0 + 340).map((p) => p.z));
  ok(withLine.notes.some((n) => n.code === 'lines' && n.n > 20), 'breakline: points along the line were added as data');
  ok(onLine(withLine) > 20 && onLine(without) < 1, `breakline: the surface rises to the line (${onLine(withLine).toFixed(1)} vs ${onLine(without).toFixed(1)} without it)`);
  const sq = [{ x: X0 + 100, y: Y0 + 50 }, { x: X0 + 300, y: Y0 + 50 }, { x: X0 + 300, y: Y0 + 250 }, { x: X0 + 100, y: Y0 + 250 }];
  const cut = G.gridSurface(scatter(300, hill), { method: 'natural', boundary: sq, maxNodes: 20000 });
  ok(cut.pts.length > 100 && cut.pts.every((p) => p.x >= X0 + 100 - 1e-6 && p.x <= X0 + 300 + 1e-6 && p.y >= Y0 + 50 - 1e-6 && p.y <= Y0 + 250 + 1e-6), 'boundary: every node is inside the polygon (' + cut.pts.length + ' nodes)');
  // data metrics: 10 × 10 lattice at 10 m, one point each: a 25 m disc holds 21 points centred on one (counted by hand), 22 at best between points
  const lat = []; for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) lat.push({ x: X0 + i * 10, y: Y0 + j * 10, z: i + j });
  const cnt = G.gridSurface(lat, { method: 'metric-count', radius: 25, step: 5 });
  const zs = cnt.pts.map((p) => p.z);
  ok(Math.max(...zs) >= 21 && Math.max(...zs) <= 22 && Math.min(...zs) >= 1, `metric count: a 25 m disc holds 21 lattice points on a point, up to 22 between points (max ${Math.max(...zs)}, min ${Math.min(...zs)})`);
  const rng = G.gridSurface(lat, { method: 'metric-range', radius: 15, step: 5 });
  ok(rng.pts.length > 100 && Math.min(...rng.pts.map((p) => p.z)) >= 0 && Math.max(...rng.pts.map((p) => p.z)) <= 6, 'metric range: the spread of i + j within 15 m is at most 6');
  const mean = G.gridSurface(lat, { method: 'metric-mean', radius: 12, step: 5 });
  ok(mean.pts.every((p) => p.z >= 0 && p.z <= 18), 'metric mean stays inside the data range');
  const ke = G.gridSurface(scatter(60, hill), { method: 'krigerr', maxNodes: 12000 });
  const ez = ke.pts.map((p) => p.z);
  ok(ez.length > 100 && ez.every((v) => v >= 0) && Math.max(...ez) > 0.5, 'kriging error is a non-negative surface that is larger away from the points');
}

section('a surface the rest of CivilCraft can use');
{
  const P = scatter(200, hill);
  const r = G.gridSurface(P, { method: 'natural', maxNodes: 20000 });
  const { surface } = TIN.surfaceFromFaces({ pts: r.pts, faces: r.faces });
  ok(surface && surface.nT > 500, 'faces build a TIN surface (' + surface?.nT + ' triangles)');
  const c = surface.contours(5);
  ok(c.length >= 3 && c.every((l) => l.pts.length >= 2), `contours every 5: ${c.length} lines`);
  const mid = c.find((l) => l.z === 10);
  ok(!!mid && mid.pts.every((p) => Math.abs(hill(p.x, p.y) - 10) < 1.2), 'the 10 contour sits on the 10 level of the true hill');
  const dup = [...P, { ...P[0], z: P[0].z + 2 }];
  const d = G.gridSurface(dup, { method: 'idw', maxNodes: 5000 });
  ok(d.notes.some((n) => n.code === 'dupes' && n.n === 1), 'two points at one spot are averaged and counted');
  ok(G.gridSurface([{ x: 0, y: 0, z: 1 }, { x: 1, y: 1, z: 2 }, { x: 2, y: 2, z: 3 }], { method: 'idw' }).error === 'flat', 'points in a line: no surface');
}

section('the project: method saved, reloaded, used, undone');
{
  const p = new PJ.Project();
  p.setPoints(scatter(150, hill).map((q, i) => ({ n: String(i + 1), x: q.x, y: q.y, z: q.z, d: 'GR' })), 'hill.csv');
  const tin = p.eg().surface;
  ok(!!tin && !p.toJSON().surface.method, 'default: the TIN, and no method key in the file');
  p.change('Method', (st) => { st.surface.method = 'kriging'; });
  const k = p.eg();
  ok(k.surface && k.surface.nT > 500 && k.report.notes.some((n) => /Kriging/.test(n)), 'kriging: a gridded surface and a report line naming the method');
  ok(p.toJSON().surface.method === 'kriging', 'the method is in the saved file');
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(back.state.surface.method === 'kriging', 'and comes back on load');
  const bad = PJ.Project.fromJSON({ ...JSON.parse(JSON.stringify(p.toJSON())), surface: { ...p.toJSON().surface, method: 'nonsense' } }).project;
  ok(!bad.state.surface.method, 'an unknown method in a file is ignored');
  p.undo();
  ok(!p.state.surface.method && p.eg().surface.nT !== k.surface.nT, 'undo goes back to the TIN');
  p.change('Method', (st) => { st.surface.method = 'idw'; });
  p.setPoints([{ n: '1', x: 0, y: 0, z: 1, d: '' }, { n: '2', x: 1, y: 0, z: 2, d: '' }], 'two.csv');
  ok(p.eg().report.errors.length === 1 && p.eg().surface === null, 'two points: a plain error, no throw');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
