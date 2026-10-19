#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-view.mjs — how fast the 3D view is with a big model: ~1M triangles in 100 groups (spheres, half smooth).
 * 25 frames (0–24), the camera somewhere else on every one, in three runs:
 *   orbit   the camera moves; nothing else
 *   hover   the camera moves and the cursor snaps (infer) somewhere else on every frame
 *   move    the camera moves, a group is moved by the Move tool's preview path (model.preview) and the cursor snaps
 * A frame is timed from the start of the step until the GPU has finished it (a 1-pixel read). Each frame's picture
 * must differ from the one before (the camera did move), and frames 0, 12, 24 of each run are saved as PNGs.
 *
 *   node devshell/serve.mjs &   then   node tests/tools/modelcraft-test/bench-view.mjs [--url http://127.0.0.1:8000/]
 *     [--chrome <path>] [--out <dir>] [--tris 1000000] [--headless]
 * Needs playwright-core (`npm i playwright-core` next to this file or anywhere on NODE_PATH) and Chrome.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL_ = arg('--url', 'http://127.0.0.1:8000/');
const OUT = path.resolve(arg('--out', path.join(HERE, '../../../tmp/bench-view')));
const TRIS = Number(arg('--tris', 1e6));
const CHROME = arg('--chrome', process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome');
fs.mkdirSync(OUT, { recursive: true });

const req = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = req('playwright-core')); } catch { ({ chromium } = createRequire(path.join(process.cwd(), 'x.js'))('playwright-core')); }

const browser = await chromium.launch({ executablePath: CHROME, headless: process.argv.includes('--headless'), args: ['--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// the dev shell serves no icon font stylesheet: that one complaint is not the view's
page.on('console', (m) => { if (m.type() === 'error' && !/bootstrap-icons/.test(m.text())) errors.push(m.text()); });
await page.goto(URL_, { waitUntil: 'load' });
await page.waitForFunction(() => window.modelcraft?.view?.renderer, null, { timeout: 60000 });

const info = await page.evaluate(async (TRIS) => {
  const mc = window.modelcraft, model = mc.model;
  // ~TRIS triangles: 100 spheres of NU×NV quads (2 triangles each), in a 10×10 grid of groups
  const G = 100, quads = Math.round(TRIS / G / 2), NV = Math.max(4, Math.round(Math.sqrt(quads / 2))), NU = Math.max(6, Math.round(quads / NV));
  const R = 2, defs = [], insts = [];
  for (let g = 0; g < G; g++) {
    const verts = [], edges = [], faces = [];
    let id = 1;
    const vid = [];
    const top = id++; verts.push([top, 0, 0, R]);
    for (let j = 1; j < NV; j++) for (let i = 0; i < NU; i++) {
      const th = Math.PI * j / NV, ph = 2 * Math.PI * i / NU;
      vid[j * NU + i] = id; verts.push([id++, R * Math.sin(th) * Math.cos(ph), R * Math.sin(th) * Math.sin(ph), R * Math.cos(th)]);
    }
    const bot = id++; verts.push([bot, 0, 0, -R]);
    const V = (j, i) => (j === 0 ? top : j === NV ? bot : vid[j * NU + (i % NU)]);
    const soft = g % 2 === 0, ek = new Set();
    const edge = (a, b) => { const k = a < b ? a + ',' + b : b + ',' + a; if (ek.has(k)) return; ek.add(k); edges.push(soft ? [id++, a, b, 1] : [id++, a, b]); };
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = V(j, i), b = V(j + 1, i), c = V(j + 1, i + 1), d = V(j, i + 1);
      const loop = j === 0 ? [a, b, c] : j === NV - 1 ? [a, b, d] : [a, b, c, d];
      for (let k = 0; k < loop.length; k++) edge(loop[k], loop[(k + 1) % loop.length]);
      faces.push({ id: id++, loops: [loop] });
    }
    defs.push({ id: 'd' + (g + 1), kind: 'group', name: 'Ball ' + (g + 1), next: id, verts, edges, faces, insts: [] });
    const x = (g % 10) * 5, y = Math.floor(g / 10) * 5;
    insts.push({ id: 1000 + g, def: 'd' + (g + 1), m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, R, 1], ...(g % 3 === 0 ? { color: '#8fa9c4' } : {}) });
  }
  const j = { format: model.toJSON().format, version: model.toJSON().version, units: 'm', nextId: 2000, defs: [{ id: 'root', kind: 'root', name: 'Model', next: 1, verts: [], edges: [], faces: [], insts }, ...defs], guides: [], dims: [] };
  const t0 = performance.now();
  model.load(j);
  mc.view.draw();
  mc.host.changed();   // as opening a file does: snapping's trees are then made in idle time
  const tris = defs.reduce((s, d) => s + d.faces.reduce((a, f) => a + f.loops[0].length - 2, 0), 0);
  return { tris, loadMs: performance.now() - t0, NU, NV };
}, TRIS);
console.log(`model: ${info.tris} triangles in 100 groups (${info.NU}×${info.NV} each); load + first draw ${info.loadMs.toFixed(0)} ms`);
await page.waitForTimeout(4000);   // a person looks at the model before they move the mouse

const run = (mode) => page.evaluate(async (mode) => {
  const base = document.querySelector('script[type="module"][src*="/modelcraft/"]').src.replace(/modelcraft\.js$/, '');
  const I = await import(base + 'infer.js');
  const mc = window.modelcraft, model = mc.model, view = mc.view, cam = mc.cam;
  const gl = view.renderer.getContext(), px = new Uint8Array(4);
  const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  const sig = () => { const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, b = new Uint8Array(4 * 64); let s = 0; for (let k = 0; k < 64; k++) { gl.readPixels(Math.floor((k % 8 + 0.5) * w / 8), Math.floor((Math.floor(k / 8) + 0.5) * h / 8), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b.subarray(k * 4, k * 4 + 4)); } for (const v of b) s = (s * 31 + v) >>> 0; return s; };
  const shots = {};
  const times = [], sigs = [], eyes = [];
  const centre = [22.5, 22.5, 2];
  const instId = [...model.root.insts.keys()][44];
  let mover = null;
  let beginMs;
  if (mode === 'move') { mc.host.setSel([{ t: 'i', id: instId }]); mover = mc.tools.set('move'); const t0 = performance.now(); mover.begin([0, 0, 0], false); beginMs = performance.now() - t0; }
  for (let f = 0; f <= 24; f++) {
    const a = (f / 25) * Math.PI * 2, el = 0.35 + 0.25 * Math.sin(f / 4);
    const t0 = performance.now();
    cam.target = centre.slice();
    cam.eye = [centre[0] + 70 * Math.cos(a) * Math.cos(el), centre[1] + 70 * Math.sin(a) * Math.cos(el), centre[2] + 70 * Math.sin(el)];
    eyes.push(cam.eye.map((v) => +v.toFixed(2)).join(','));
    if (mode === 'move') {
      mover.apply([0.4 * (f + 1), 0, 0.2 * (f + 1)]);   // the Move tool's own preview path
    }
    if (mode !== 'orbit') {
      I.infer(mc.host.scene(), cam, 300 + f * 40, 200 + f * 18, {});
    }
    view.draw();
    sync();
    times.push(performance.now() - t0);
    sigs.push(sig());
    if (f === 0 || f === 12 || f === 24) shots[f] = view.gl.toDataURL('image/png');
  }
  if (mode === 'move') {
    let t0 = performance.now(); mover.finish(); view.draw(); sync(); const commitMs = performance.now() - t0;
    mc.tools.set('select');
    t0 = performance.now(); model.undo(); view.draw(); sync(); const undoMs = performance.now() - t0;
    mc.host.setSel([]); view.draw();
    return { times, sigs, eyes, shots, commitMs, beginMs, undoMs };
  }
  view.draw();
  return { times, sigs, eyes, shots };
}, mode);

const stats = (t) => { const s = [...t].sort((a, b) => a - b); return { med: s[Math.floor(s.length / 2)], max: s[s.length - 1], mean: t.reduce((a, b) => a + b, 0) / t.length }; };
let failed = false;
const results = {};
for (const mode of ['orbit', 'hover', 'move']) {
  const r = await run(mode);
  const distinctEyes = new Set(r.eyes).size, sameAsPrev = r.sigs.filter((s, i) => i && s === r.sigs[i - 1]).length;
  if (distinctEyes !== 25) { failed = true; console.log(`  FAIL ${mode}: the camera was in only ${distinctEyes} places`); }
  if (sameAsPrev) { failed = true; console.log(`  FAIL ${mode}: ${sameAsPrev} frame(s) looked the same as the one before`); }
  for (const [f, url] of Object.entries(r.shots)) fs.writeFileSync(path.join(OUT, `${mode}-${String(f).padStart(2, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  const s = stats(r.times.slice(1));
  results[mode] = { ...s, frames: r.times.map((x) => +x.toFixed(1)) };
  console.log(`${mode.padEnd(6)} median ${s.med.toFixed(1)} ms  mean ${s.mean.toFixed(1)} ms  max ${s.max.toFixed(1)} ms  (~${(1000 / s.mean).toFixed(0)} fps)  frame 0: ${r.times[0].toFixed(1)} ms` + (r.commitMs !== undefined ? `\n       pick up: ${r.beginMs.toFixed(0)} ms  put down: ${r.commitMs.toFixed(0)} ms  undo: ${r.undoMs.toFixed(0)} ms` : ''));
}
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ info, results }, null, 1));
if (errors.length) { failed = true; console.log('console errors:\n  ' + errors.slice(0, 10).join('\n  ')); }
console.log(failed ? 'FAILED' : 'ok', '— pictures in', OUT);
await browser.close();
process.exit(failed ? 1 : 0);
