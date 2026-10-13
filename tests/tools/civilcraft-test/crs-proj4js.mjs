#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs-proj4js.mjs — helper for make-crs-db.py: runs the vendored proj4js over candidate systems.
 *   node tools/civilcraft-test/crs-proj4js.mjs <in.json> <out.json>
 * in: [[code, proj4, [[lon, lat], …]], …]  out: { "<code>": [[x, y] | null, …] | "error text" }
 * (WGS 84 lon/lat → the system, exactly as civilcraft/dev/crs.js calls it.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const lib = path.join(REPO, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js');
const tmp = fs.mkdtempSync('/tmp/crs-proj4js-') + '/proj4.mjs';   // .mjs so Node reads the bundle as a module
fs.copyFileSync(lib, tmp);
const proj4 = (await import(pathToFileURL(tmp).href)).default;
fs.rmSync(path.dirname(tmp), { recursive: true });
const out = {};
for (const [code, def, pts] of JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))) {
  try {
    const t = proj4('+proj=longlat +datum=WGS84 +no_defs', def);
    out[code] = pts.map((p) => { const r = t.forward(p); return r.every(Number.isFinite) ? r : null; });
  } catch (e) { out[code] = String(e?.message || e).slice(0, 120); }
}
fs.writeFileSync(process.argv[3], JSON.stringify(out));
