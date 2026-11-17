#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stages-run.mjs: runs stages-test.mjs on its own (0.10 W1.10, session stages-10), with the same engine set-up as bin/test-bimcraft.mjs:
 *   nice -n 10 timeout 600 node tools/bimcraft-test/stages-run.mjs [--brief] [--options] [--types] [--records]     (no flag = all four)
 * Until bin/test-bimcraft.mjs has a --stages line (Inbox, perf-site-10) this is how the suite runs.
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
const { stagesMode } = await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/stages-test.mjs')).href);
process.exit(await stagesMode({ APP, ROOT, WebIFC, IfcModel, quiet, args: process.argv.slice(2) }));
