#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ours-run.mjs — run OUR library (lib/dwg/index.js) on one input, in its own process so time and peak
 * memory are its own (compare.mjs runs it under /usr/bin/time -v). Degrades to { built: false } while
 * lib/dwg does not export what is needed yet.
 *
 *   node ours-run.mjs read  <in.dwg> <out.json>
 *       → { built, opened, error, ms, version, set (common entity form), notes, unknown }
 *   node ours-run.mjs write <in.dwg | civil:<list.json>> <AC10xx> <out.dwg> <out.json>
 *       → { built, written, error, ms, bytes, notes, source (common form of the model written),
 *           renamed (the writer's report.renamed: { layers, blocks, layouts } source name → written name) }
 *       in.dwg is read with our reader first (round trip); civil: goes through lib/dwg/civil.js fromCivilList.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO } from './lib/util.mjs';
import { fromModel } from './lib/normalize.mjs';

const LIB = path.join(REPO, 'lib/dwg');
const [mode, ...a] = process.argv.slice(2);
const outJson = mode === 'read' ? a[1] : a[3];
const done = (o) => { fs.writeFileSync(outJson, JSON.stringify(o)); process.exit(0); };
const errText = (e) => String(e && e.stack ? e.stack : e).split('\n').slice(0, 6).join('\n');

let lib = null;
try {
  if (fs.existsSync(path.join(LIB, 'index.js'))) lib = await import(pathToFileURL(path.join(LIB, 'index.js')).href);
} catch (e) { done({ built: false, why: 'lib/dwg/index.js does not load: ' + errText(e) }); }
if (!lib) done({ built: false, why: 'lib/dwg/index.js not there yet' });

async function readModel(file) {
  if (typeof lib.readDwg !== 'function') return { built: false, why: 'lib/dwg does not export readDwg yet' };
  const bytes = new Uint8Array(fs.readFileSync(file));
  const t0 = performance.now();
  try {
    const model = await lib.readDwg(bytes, {});
    return { built: true, opened: true, model, ms: performance.now() - t0 };
  } catch (e) {
    return { built: true, opened: false, error: errText(e), ms: performance.now() - t0 };
  }
}

if (mode === 'read') {
  const r = await readModel(a[0]);
  if (!r.built || !r.opened) done(r);
  let set;
  try { set = fromModel(r.model); } catch (e) { done({ built: true, opened: true, ms: r.ms, error: 'normalising the model failed: ' + errText(e) }); }
  done({ built: true, opened: true, ms: r.ms, version: r.model.version, set, notes: (r.model.report?.notes || []).slice(0, 200).map(String), unknown: r.model.report?.unknown || {} });
} else if (mode === 'write') {
  const [src, version, outDwg] = a;
  if (typeof lib.writeDwg !== 'function') done({ built: false, why: 'lib/dwg does not export writeDwg yet' });
  let model;
  if (src.startsWith('civil:')) {
    let civ = null;
    try { if (fs.existsSync(path.join(LIB, 'civil.js'))) civ = await import(pathToFileURL(path.join(LIB, 'civil.js')).href); } catch (e) { done({ built: false, why: 'lib/dwg/civil.js does not load: ' + errText(e) }); }
    if (!civ || typeof civ.fromCivilList !== 'function') done({ built: false, why: 'lib/dwg/civil.js fromCivilList not there yet' });
    try { model = civ.fromCivilList(JSON.parse(fs.readFileSync(src.slice(6), 'utf8'))); } catch (e) { done({ built: true, written: false, error: 'fromCivilList: ' + errText(e) }); }
  } else {
    const r = await readModel(src);
    if (!r.built) done(r);
    if (!r.opened) done({ built: true, written: false, error: 'our reader could not read the source: ' + r.error });
    model = r.model;
  }
  let source;
  try { source = fromModel(model); } catch (e) { source = null; }
  const t0 = performance.now();
  try {
    const res = await lib.writeDwg(model, { version });
    const ms = performance.now() - t0;
    const bytes = res?.bytes || res;
    fs.writeFileSync(outDwg, bytes);
    // renamed: the writer's own record of the names it changed (report.renamed { layers, blocks, layouts }:
    // source name → written name), so the harness compares through it (match.mjs compareSets { renamed })
    done({ built: true, written: true, ms, bytes: bytes.length, notes: (res?.report?.notes || []).slice(0, 200).map(String), source, renamed: res?.report?.renamed || null });
  } catch (e) {
    done({ built: true, written: false, error: errText(e), ms: performance.now() - t0, source });
  }
} else {
  console.error('usage: ours-run.mjs read <in.dwg> <out.json> | write <in> <version> <out.dwg> <out.json>');
  process.exit(2);
}
