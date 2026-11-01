#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Makes testfiles/generated/drone-survey-300m.las ONCE (LAS 1.2, point format 0, ~4 points per m², all unclassified).
// Refuses to overwrite: the file is listed in testfiles/LARGE-FILES.md and is never regenerated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIZE, X0, Y0, terrainZ, standing, trees, rng } from './drone-scene.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(REPO, 'testfiles/generated/drone-survey-300m.las');
if (fs.existsSync(out)) { console.log('exists, not regenerated: ' + out); process.exit(0); }
const r = rng(12345), T = trees(), pts = [];
const N = SIZE * SIZE * 4;
for (let i = 0; i < N; i++) {
  const u = r() * SIZE, v = r() * SIZE, g = terrainZ(X0 + u, Y0 + v), s = standing(u, v, T);
  let z = g + (r() - 0.5) * 0.06;   // 6 cm of noise on the ground
  if (s?.kind === 'building') z = g + s.h + (r() - 0.5) * 0.04;
  else if (s?.kind === 'tree') { if (r() < 0.12) z = g + (r() - 0.5) * 0.06; else z = g + s.h * (0.5 + r() * 0.5); }
  pts.push([X0 + u, Y0 + v, z]);
}
for (let i = 0; i < 200; i++) { const u = r() * SIZE, v = r() * SIZE; pts.push([X0 + u, Y0 + v, terrainZ(X0 + u, Y0 + v) - 6 - r() * 10]); }   // stray low points
const hdr = Buffer.alloc(227), rec = 20, sc = 0.001;
hdr.write('LASF', 0, 'latin1'); hdr[24] = 1; hdr[25] = 2; hdr.writeUInt16LE(227, 94); hdr.writeUInt32LE(227, 96); hdr[104] = 0; hdr.writeUInt16LE(rec, 105);
hdr.writeUInt32LE(pts.length, 107);
const mn = [X0, Y0, 80], mx = [X0 + SIZE, Y0 + SIZE, 160];
[sc, sc, sc, X0, Y0, 0].forEach((v, k) => hdr.writeDoubleLE(v, 131 + 8 * k));
[mx[0], mn[0], mx[1], mn[1], mx[2], mn[2]].forEach((v, k) => hdr.writeDoubleLE(v, 179 + 8 * k));
const body = Buffer.alloc(pts.length * rec);
pts.forEach(([x, y, z], i) => { const o = i * rec; body.writeInt32LE(Math.round((x - X0) / sc), o); body.writeInt32LE(Math.round((y - Y0) / sc), o + 4); body.writeInt32LE(Math.round(z / sc), o + 8); });
fs.writeFileSync(out, Buffer.concat([hdr, body]));
console.log('wrote ' + out + ' (' + pts.length + ' points, ' + ((227 + body.length) / 1e6).toFixed(1) + ' MB)');
