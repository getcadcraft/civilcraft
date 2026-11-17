#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-perf10.mjs — CivilCraft 0.10 PERF.31 / PERF.33 in Node: Surface.outline() on integer edge lists gives the loops the old string-keyed
 * version gave (same loops, same order, same start vertex) on grids, grids with holes and bad meshes (a directed edge twice, three triangles on one
 * edge); the answer is kept on the surface; the integer vertex key merges points closer than SNAP exactly as the string key did, and a box too big
 * for the integer key falls back to strings without changing the result.
 *   node bin/test-civilcraft-perf10.mjs [--build dev]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const { buildSurface, Surface, SNAP } = await import(pathToFileURL(path.join(APP, 'tin.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };

/** The version before 0.10 (HEAD of tin.js, string keys), kept here as the reference. */
function outlineRef(sf) {
  const { tris, X, Y, ox, oy } = sf, count = new Map();
  for (let t = 0; t < tris.length; t += 3) for (let k = 0; k < 3; k++) { const a = tris[t + k], b = tris[t + (k + 1) % 3]; count.set(a + '_' + b, 1); }
  const nextOf = new Map();
  for (const k of count.keys()) { const [a, b] = k.split('_'); if (!count.has(b + '_' + a)) nextOf.set(+a, +b); }
  const loops = [];
  while (nextOf.size) {
    const [s] = nextOf.keys(); const loop = [];
    let v = s;
    for (let g = 0; g < 1e7 && nextOf.has(v); g++) { loop.push({ x: X[v] + ox, y: Y[v] + oy }); const n = nextOf.get(v); nextOf.delete(v); v = n; }
    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}
const mk = (nv, tris) => new Surface(Float64Array.from({ length: nv }, (_, i) => i % 7), Float64Array.from({ length: nv }, (_, i) => Math.floor(i / 7)), new Float64Array(nv), Int32Array.from(tris), 100, 200);
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// a 6 x 6 grid of cells (two triangles each), then the same with random cells removed (holes, several loops)
const grid = (n, drop) => { const tris = []; const id = (i, j) => j * (n + 1) + i; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { if (drop && rnd() < drop) continue; tris.push(id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j), id(i + 1, j + 1), id(i, j + 1)); } return tris; };
{
  const s = mk(49, grid(6, 0));
  const o = s.outline();
  ok(o.length === 1 && o[0].length === 24, 'a 6 x 6 grid has one loop of 24 corner and edge vertices');
  ok(same(o, outlineRef(s)), 'grid: same loops as the string-keyed version');
  ok(s.outline() === o, 'the answer is kept on the surface (same array the second time)');
}
for (let r = 0; r < 60; r++) {
  const n = 3 + (r % 12), s = mk((n + 1) * (n + 1), grid(n, 0.15 + (r % 5) * 0.1));
  if (!s.tris.length) continue;
  ok(same(s.outline(), outlineRef(s)), `random grid ${r} (${n} x ${n}, holes): same loops as the string-keyed version`);
}
{
  // bad meshes: a directed edge twice; three triangles on one edge (the later boundary edge from a vertex wins, as before)
  const bad = [0, 1, 8, 0, 1, 8, 1, 2, 9, 1, 9, 8, 0, 8, 7, 1, 8, 9, 3, 4, 11, 3, 4, 12, 3, 4, 10];
  const s = mk(14, bad);
  ok(same(s.outline(), outlineRef(s)), 'bad mesh (an edge twice, three triangles on an edge): same as before');
}
{
  const s = mk(4, [0, 1, 2]);
  ok(s.outline().length === 1 && s.outline()[0].length === 3, 'one triangle: one loop of three');
}

// buildSurface: the integer vertex key
const pts = [];
for (let i = 0; i < 400; i++) pts.push({ n: String(i), x: 1000 + (i % 20) * 5 + rnd() * 0.5, y: 2000 + Math.floor(i / 20) * 5 + rnd() * 0.5, z: 10 + rnd() });
for (const p of pts) { p.x = Math.round(p.x * 1000) / 1000; p.y = Math.round(p.y * 1000) / 1000; }   // on a cell centre, so 0.3 of SNAP stays in the cell
{
  const a = buildSurface({ points: pts });
  ok(a.surface && a.surface.nT > 700, 'a 400-point surface builds');
  const dup = pts.concat([{ n: 'd', x: pts[3].x + SNAP * 0.3, y: pts[3].y - SNAP * 0.3, z: pts[3].z }, { n: 'e', x: pts[9].x + SNAP * 3, y: pts[9].y, z: pts[9].z }]);
  const b = buildSurface({ points: dup });
  ok(b.report.merged === 1, 'a point 0.3 of SNAP away is merged (1), one 3 SNAPs away is kept: merged ' + b.report.merged);
  ok(b.surface.X.length === a.surface.X.length + 1, 'one vertex more than the plain surface');
  // a crossing of two breaklines creates a vertex through the same key function
  const bl = [{ name: 'a', pts: [{ x: 1010, y: 2010, z: 12 }, { x: 1060, y: 2060, z: 12 }] }, { name: 'b', pts: [{ x: 1010, y: 2060, z: 12 }, { x: 1060, y: 2010, z: 12 }] }];
  const c = buildSurface({ points: pts, breaklines: bl });
  ok(c.report.crossings === 1 && c.surface, 'two crossing breaklines: one crossing, a surface');
  // the same points a million units away: the integer key box is still small (the origin moves), the result is the same shape
  const far = pts.map((p) => ({ ...p, x: p.x + 5e6, y: p.y + 4e6 }));
  const d = buildSurface({ points: far });
  ok(d.surface.nT === a.surface.nT && d.surface.X.length === a.surface.X.length, 'state-plane sized coordinates: the same triangle count');
  // a box too big for the integer key (1e13 units across): strings are used, the surface is still built
  const wide = pts.slice(0, 50).map((p, i) => ({ ...p, x: p.x + (i % 2 ? 1e11 : 0), y: p.y + (i % 3 ? 1e10 : 0) }));
  const e = buildSurface({ points: wide });
  ok(e.surface || e.report.errors.length, 'a box too large for the integer key still returns a result (surface or a stated error)');
  const dupWide = wide.concat([{ ...wide[4], n: 'x', x: wide[4].x + SNAP * 0.2 }]);
  const f = buildSurface({ points: dupWide });
  ok(f.report.merged === 1, 'and a duplicate is still merged on the string path');
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
