#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-mesh-showcase.mjs — makes fixtures/showcase/partcraft-bracket.stl ONCE (0.7 D7.49; CC0, ours): a 60 × 40 × 20 mm
 * bracket (Z up) with two Ø10 through holes and a 20 × 20 × 10 boss, binary STL, with one triangle of its top left out so
 * opening it shows a repair ("1 hole filled"). Refuses to overwrite; `--check` rebuilds in memory and compares.
 *   node tools/partcraft-test/make-mesh-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUT = path.join(REPO, 'fixtures/showcase/partcraft-bracket.stl');
const check = process.argv.includes('--check');
if (fs.existsSync(OUT) && !check) { console.log('exists, left as it is: ' + OUT); process.exit(0); }
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();
const X = await import(path.join(REPO, 'public_html/assets/apps/partcraft/dev/export.js'));
const hole = (x, y) => M.Manifold.cylinder(40, 5, 5, 64).translate([x, y, -10]);
const body = M.Manifold.cube([60, 40, 20]).subtract(hole(12, 20)).subtract(hole(48, 20)).add(M.Manifold.cube([20, 20, 10]).translate([20, 10, 20]));
const g = body.getMesh();
const P = g.vertProperties, I = [...g.triVerts];
// leave out the first triangle lying in the block's top (z 20)
for (let t = 0; t < I.length / 3; t++) if ([0, 1, 2].every((k) => Math.abs(P[I[t * 3 + k] * 3 + 2] - 20) < 1e-9)) { I.splice(t * 3, 3); break; }
const yUp = new Float32Array(P.length);   // stlBinary writes PartCraft's Y up as Z up
for (let i = 0; i < P.length; i += 3) { yUp[i] = P[i]; yUp[i + 1] = P[i + 2]; yUp[i + 2] = -P[i + 1]; }
const bytes = Buffer.from(X.stlBinary({ positions: yUp, indices: Uint32Array.from(I) }, 'bracket'));
if (check) { const same = fs.existsSync(OUT) && Buffer.compare(fs.readFileSync(OUT), bytes) === 0; console.log(same ? 'same' : 'DIFFERS'); process.exit(same ? 0 : 1); }
fs.writeFileSync(OUT, bytes);
console.log(`wrote ${OUT} (${bytes.length} bytes, ${I.length / 3} triangles, solid ${body.volume().toFixed(3)} mm³)`);
