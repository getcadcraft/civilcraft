#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lwweb-run.mjs — the vendored libredwg-web (public_html/assets/vendor/libredwg-web/current) as a black
 * box, through its public entry (dist/libredwg-web.js: LibreDwg.create → dwg_read_data → convert →
 * dwg_free), in its own process so time and peak memory are its own.
 *
 *   node lwweb-run.mjs <in.dwg> <out.json>  → { opened, error, ms, set (common entity form) }
 * LibreDWG's own messages go to this process's stderr; oracles.mjs counts the ERROR lines.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO } from './lib/util.mjs';
import { fromLibredwgWeb } from './lib/normalize.mjs';

const [file, outJson] = process.argv.slice(2);
const done = (o) => { fs.writeFileSync(outJson, JSON.stringify(o)); process.exit(0); };
const dir = path.join(REPO, 'public_html/assets/vendor/libredwg-web/current');
const log = console.log; console.log = (...x) => console.error(...x);   // keep its chatter off stdout
try {
  const mod = await import(pathToFileURL(path.join(dir, 'dist/libredwg-web.js')).href);
  const lib = await mod.LibreDwg.create(path.join(dir, 'wasm') + '/');
  const bytes = new Uint8Array(fs.readFileSync(file));
  const t0 = performance.now();
  const raw = lib.dwg_read_data(bytes, mod.Dwg_File_Type.DWG);
  if (!raw) done({ opened: false, error: 'dwg_read_data returned nothing', ms: performance.now() - t0 });
  let db;
  try { db = lib.convert(raw); } finally { lib.dwg_free(raw); }
  const ms = performance.now() - t0;
  done({ opened: true, ms, set: fromLibredwgWeb(db) });
} catch (e) {
  done({ opened: false, error: String(e && e.stack ? e.stack : e).split('\n').slice(0, 4).join('\n') });
}
void log;
