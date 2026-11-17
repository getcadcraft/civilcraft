#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * core10-run.mjs: runs the bim-core-10 node tests on their own (0.10 W1.7), with the same engine set-up as bin/test-bimcraft.mjs:
 *   nice -n 10 timeout 300 node tools/bimcraft-test/core10-run.mjs --updatewall     BK.173 updateWall from non-UI callers keeps a joined wall square
 *   nice -n 10 timeout 300 node tools/bimcraft-test/core10-run.mjs --layer1         BK.78 the layer 1 depth gate on the small house, 2D and 3D
 * Until bin/test-bimcraft.mjs has these two lines (Inbox, perf-site-10) this is how they run.
 */
import { register } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (/^[A-Za-z]:/.test(spec)) return { url: pathToFileURL(spec).href, shortCircuit: true };
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  if (spec === 'proj4') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js')).href)}, shortCircuit: true };
  if (spec === 'delaunator') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/delaunator/current/index.js')).href)}, shortCircuit: true };
  if (spec === 'robust-predicates') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/robust-predicates/current/index.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
const own = path.join(APP, 'ifc/api.js');
const WebIFC = await import(pathToFileURL(fs.existsSync(own) ? own : path.join(ROOT, 'lib/ifc/api.js')).href);
const { IfcModel } = await import(pathToFileURL(path.join(APP, 'ifc-model.js')).href);
const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn, e = console.error; console.log = console.warn = console.error = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; console.error = e; } };
const args = process.argv.slice(2);
let bad = 0;
if (args.includes('--updatewall') || !args.length) bad += await (await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/wall-updatewall-test.mjs')).href)).updateWallMode({ APP, ROOT, WebIFC, IfcModel, quiet, args });
if (args.includes('--layer1') || !args.length) bad += await (await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/layer1-test.mjs')).href)).layer1Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args });
process.exit(bad ? 1 : 0);
