#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geoid-spike.mjs — CivilCraft 0.4 V12 spike (not a test, not shipped): can the browser get geoid heights (GEOID18) the way
 * PROJ does, without downloading a 16.7 MB grid? Reads NOAA's GEOID18 CONUS grid from cdn.proj.org as a cloud-optimized
 * GeoTIFF through geotiff.js range requests (the vendored library the app already has), interpolates bilinearly between the
 * four nodes round each point, and compares with PROJ's vgridshift (pyproj, network on) at the same points. Prints the
 * geoid height N per point, the difference from PROJ, the bytes fetched and the time. Needs the network.
 *
 *   node tools/civilcraft-test/geoid-spike.mjs [--one]      --one: one site (two points in Austin) to measure one tile
 * Findings: docs/apps/civilcraft-geoid-spike.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps/civilcraft/dev/manifest.json'), 'utf8'));
registerHooks({ resolve(s, c, n) { const m = manifest.imports?.[s]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return n(s, c); } });
const GT = await import('geotiff');

const GRID = 'us_noaa_g2018u0.tif';
const pts = process.argv.includes('--one') ? [[-97.74, 30.27], [-97.70, 30.30]]
  : [[-97.74, 30.27], [-105.27, 40.01], [-122.42, 37.77], [-74.0, 40.71], [-80.19, 25.76], [-90.07, 29.95]];
let bytes = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => { const r = await realFetch(u, o); bytes += (await r.clone().arrayBuffer()).byteLength; return r; };
const t0 = Date.now();
const tiff = await GT.fromUrl('https://cdn.proj.org/' + GRID);
const img = await tiff.getImage(0);
const header = bytes;
const [ox, oy] = img.getOrigin(), [rx, ry] = img.getResolution();
const ours = [];
for (const [lon0, lat] of pts) {
  const lon = lon0 < ox ? lon0 + 360 : lon0;   // the grid runs 230°…300° east
  const fx = (lon - ox) / rx, fy = (lat - oy) / ry, x0 = Math.floor(fx), y0 = Math.floor(fy);   // pixel-is-point: nodes at the origin
  const [a] = await img.readRasters({ window: [x0, y0, x0 + 2, y0 + 2], samples: [0] });
  const tx = fx - x0, ty = fy - y0;
  ours.push(a[0] * (1 - tx) * (1 - ty) + a[1] * tx * (1 - ty) + a[2] * (1 - tx) * ty + a[3] * tx * ty);
}
const ms = Date.now() - t0;
const PY = path.join(REPO, 'tools/civilcraft-test/venv/bin/python');
let proj = null;
try {
  proj = JSON.parse(execFileSync(PY, ['-c', `
import json, sys, pyproj
pyproj.network.set_network_enabled(True)
t = pyproj.Transformer.from_pipeline('+proj=pipeline +step +proj=unitconvert +xy_in=deg +xy_out=rad +step +proj=vgridshift +grids=${GRID} +multiplier=1 +step +proj=unitconvert +xy_in=rad +xy_out=deg')
print(json.dumps([t.transform(lo, la, 0)[2] for lo, la in json.load(sys.stdin)]))
`], { input: JSON.stringify(pts), encoding: 'utf8' }));
} catch (e) { console.log('PROJ comparison skipped: ' + e.message.split('\n')[0]); }
console.log('point                 N (geotiff.js)   N (PROJ)     difference');
pts.forEach(([lo, la], i) => console.log(`${lo.toFixed(2).padStart(8)}, ${la.toFixed(2).padStart(6)}   ${ours[i].toFixed(4).padStart(10)} m   ${proj ? proj[i].toFixed(4).padStart(10) + ' m' : '—'}   ${proj ? (ours[i] - proj[i]).toExponential(1) + ' m' : ''}`));
console.log(`fetched ${bytes.toLocaleString('en-US')} bytes (header ${header.toLocaleString('en-US')}) in ${ms} ms for ${pts.length} points`);
