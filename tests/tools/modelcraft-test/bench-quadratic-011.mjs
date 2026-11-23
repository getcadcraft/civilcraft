#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-quadratic-011.mjs — PERF.76 (0.11 session `model-part-11`): the list searches turned into Sets / maps in ModelCraft's
 * mesh operations and shared m3d model (mesh/ops.js fill, slideRails, gridFill, insetFaces; model.js healCollinear, edgeChain).
 * `--before DIR` runs the same cases against copies of ops.js and model.js saved before the change (DIR holds ops.before.js and
 * model.before.js; they are copied beside the originals for the run and removed after), so before and after are one machine.
 *   nice -n 10 node tools/modelcraft-test/bench-quadratic-011.mjs [--before DIR] [--grid 400] [--chain 4000]
 * Prints one RESULT line per case (JSON, with the load average). Each case also prints a hash of what it made, so the two runs can
 * be compared for equal results.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BEFORE = arg('--before', ''), GRID = +arg('--grid', 400), CHAIN = +arg('--chain', 4000);
const I18N = await import(path.join(APP, 'i18n.js'));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const tmps = [];
const load = async (rel, beforeName) => {
  if (!BEFORE) return import(pathToFileURL(path.join(APP, rel)));
  const tmp = path.join(APP, path.dirname(rel), `.bench-${process.pid}-${path.basename(rel)}`);
  fs.copyFileSync(path.join(BEFORE, beforeName), tmp); tmps.push(tmp);
  return import(pathToFileURL(tmp));
};
try {
  const { Mesh } = await import(pathToFileURL(path.join(APP, 'mesh.js')));
  const OPS = await load('mesh/ops.js', 'ops.before.js');
  const MODEL = BEFORE ? await load('model.js', 'model.before.js') : await import(pathToFileURL(path.join(APP, 'model.js')));
  const grid = (n) => {
    const nv = (n + 1) * (n + 1), p = new Float64Array(nv * 3);
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const k = (j * (n + 1) + i) * 3; p[k] = i * 0.01; p[k + 1] = j * 0.01; }
    const fc = new Int32Array(n * n).fill(4), fi = new Int32Array(n * n * 4);
    for (let j = 0, k = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i; fi[k++] = a; fi[k++] = a + 1; fi[k++] = a + n + 2; fi[k++] = a + n + 1; }
    const m = new Mesh(); m._bulk(p, nv, fc, fi); return m;
  };
  const hash = (x) => crypto.createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0, 12);
  const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
  const out = (name, ms, h, extra = {}) => console.log('RESULT ' + JSON.stringify({ case: name, mode: BEFORE ? 'before' : 'after', ms: +ms.toFixed(1), hash: h, load: os.loadavg()[0].toFixed(2), ...extra }));
  const timeit = (f, runs = 3) => { const t = []; let r; for (let i = 0; i < runs; i++) { const t0 = performance.now(); r = f(i); t.push(performance.now() - t0); } return [med(t), r]; };

  // slideRails: the middle row of a GRID x GRID grid (an interior edge loop of GRID+1 vertices)
  { const m = grid(GRID), row = Array.from({ length: GRID + 1 }, (_, i) => (GRID >> 1) * (GRID + 1) + i);
    const open = grid(GRID);   // an open border row too: the half-edges the old scan walked are the border's
    const [ms, r] = timeit(() => OPS.slideRails(open, row));
    out('slideRails', ms, hash([...r]), { verts: row.length, halfEdges: m.nh }); }
  // fill: close the whole border of a grid with the border loop followed (loop.includes in the old code)
  { const n = Math.min(GRID, 1000), borderVerts = [];
    for (let i = 0; i <= n; i++) borderVerts.push(i, n * (n + 1) + i); for (let j = 1; j < n; j++) borderVerts.push(j * (n + 1), j * (n + 1) + n);
    let h = '';
    const [ms] = timeit(() => { const m = grid(n); try { const r = OPS.fill(m, { verts: borderVerts }); h = hash(r); } catch (e) { h = 'err:' + (e.code || e.message); } });
    out('fill-border-loop', ms, h, { loop: borderVerts.length }); }
  // gridFill / borderLoops on the same border
  { const n = Math.min(GRID, 120), m = grid(n); const all = new Set(); for (let f = 0; f < m.nf; f++) all.add(f);
    const [ms, r] = timeit(() => OPS.borderLoops(m, all)); out('borderLoops', ms, hash(r.map((l) => l.length)), { loops: r.length }); }
  // insetFaces individual on every face of a small grid (inner.includes per band face)
  { const n = Math.min(GRID, 150);
    let h = '';
    const [ms] = timeit(() => { const m = grid(n), fs_ = []; for (let f = 0; f < m.nf; f++) fs_.push(f); const r = OPS.insetFaces(m, fs_, { thickness: 0.002, individual: true }); h = hash([r.faces.length, r.band.length]); });
    out('insetFaces-individual', ms, h, { faces: n * n }); }
  // healCollinear: CHAIN collinear vertices on a polyline (a definition of CHAIN edges)
  { let h = '';
    const [ms] = timeit(() => { const d = { verts: new Map(), edges: new Map(), faces: new Map(), next: 1 };
      const ids = []; for (let i = 0; i <= CHAIN; i++) ids.push(MODEL.vAdd(d, [i * 0.01, 0, 0]));
      for (let i = 0; i < CHAIN; i++) MODEL.eAdd(d, ids[i], ids[i + 1]);
      MODEL.healCollinear(d, ids.slice(1, -1)); h = hash([d.verts.size, d.edges.size]); });
    out('healCollinear', ms, h, { chain: CHAIN }); }
  // edgeChain: a path of CHAIN edges
  { let h = '';
    const [ms] = timeit(() => { const d = { verts: new Map(), edges: new Map(), faces: new Map(), next: 1 };
      const ids = []; for (let i = 0; i <= CHAIN; i++) ids.push(MODEL.vAdd(d, [i * 0.01, 0, 0]));
      const es = []; for (let i = 0; i < CHAIN; i++) es.push(MODEL.eAdd(d, ids[i], ids[i + 1]));
      const r = MODEL.edgeChain(d, es); h = hash([r.verts.length, r.closed]); });
    out('edgeChain', ms, h, { chain: CHAIN }); }
} finally { for (const f of tmps) { try { fs.unlinkSync(f); } catch {} } }
