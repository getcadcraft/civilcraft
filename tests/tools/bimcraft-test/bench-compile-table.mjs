#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-compile-table.mjs — PERF.78 (perf-finish-11 bimcraft, 2026-11-22): dwg-compile.js's entity switch made table-driven must
 * draw exactly what the switch drew. Every DWG / DXF under fixtures/ and ../testfiles (up to --max-mb each) is read once with the
 * dev readers, then compiled by the OLD and the NEW dwg-compile.js; the whole result (spaces, batches, lines, fills, texts, pictures,
 * viewports, layers, stats) must be the same JSON. Times are the median of --reps compiles each, interleaved.
 *   node tools/bimcraft-test/bench-compile-table.mjs <old dwg-compile.js> [--new <file>] [--max-mb 20] [--reps 3] [--limit N]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const OLD = a[0]; if (!OLD) { console.error('usage: bench-compile-table.mjs <old dwg-compile.js>'); process.exit(2); }
const MAX = +opt('--max-mb', 20) * 1e6, REPS = +opt('--reps', 3), LIMIT = +opt('--limit', 1e9);
const Old = await import(pathToFileURL(path.resolve(OLD)).href + '?old'), New = await import(pathToFileURL(opt('--new', null) ? path.resolve(opt('--new')) : path.join(APP, 'dwg-compile.js')).href + '?new');
const { readDxfModel } = await import(pathToFileURL(path.join(APP, 'dxf-model.js')).href);
const { readDwg } = await import(pathToFileURL(path.join(APP, 'dwg/read.js')).href);
const files = [];
const walk = (d) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(dwg|dxf)$/i.test(e.name) && fs.statSync(p).size <= MAX) files.push(p); } };
walk(path.join(ROOT, 'fixtures')); walk(path.join(ROOT, '../testfiles'));
files.sort();
const json = (d) => JSON.stringify(d, (k, v) => (v instanceof Map ? [...v.entries()] : v instanceof Set ? [...v] : ArrayBuffer.isView(v) ? Array.from(v) : v));
const med = (xs) => xs.sort((x, y) => x - y)[xs.length >> 1];
let same = 0, diff = 0, failed = 0, tOld = 0, tNew = 0, n = 0;
const quiet = async (f) => { const w = console.warn, l = console.log; console.warn = console.log = () => {}; try { return await f(); } finally { console.warn = w; console.log = l; } };
for (const f of files.slice(0, LIMIT)) {
  let db;
  try { const b = new Uint8Array(fs.readFileSync(f)); db = await quiet(async () => (/\.dxf$/i.test(f) ? readDxfModel((() => { let s = new TextDecoder('utf-8').decode(b); if (s.includes('�')) s = new TextDecoder('windows-1252').decode(b); return s; })()) : readDwg(b))); } catch { continue; }
  let ro, rn, eo = null, en = null;
  try { ro = json(Old.compileDrawing(db, {})); } catch (e) { eo = String(e.message); }
  try { rn = json(New.compileDrawing(db, {})); } catch (e) { en = String(e.message); }
  n++;
  if (eo !== en || ro !== rn) { diff++; console.log('DIFF ' + path.relative(ROOT, f) + (eo || en ? ` (old: ${eo}, new: ${en})` : '')); continue; }
  if (eo) { failed++; continue; }
  same++;
  const to = [], tn = [];
  for (let r = 0; r < REPS; r++) { let t = performance.now(); Old.compileDrawing(db, {}); to.push(performance.now() - t); t = performance.now(); New.compileDrawing(db, {}); tn.push(performance.now() - t); }
  tOld += med(to); tNew += med(tn);
}
console.log(`\n${n} drawings compiled: ${same} identical, ${diff} different, ${failed} threw the same error in both`);
console.log(`compile time, sum of medians: old ${tOld.toFixed(1)} ms, new ${tNew.toFixed(1)} ms`);
process.exit(diff ? 1 : 0);
