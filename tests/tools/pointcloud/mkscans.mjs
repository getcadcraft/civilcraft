#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mkscans.mjs — two overlapping scans of the kept room, for scan registration tests (0.7 LC.3, session `scans`).
 *   node tools/pointcloud/mkscans.mjs [outDir]       default testfiles/generated/pointcloud-register/ (made once: skipped when there)
 * Scan A = every even point of testfiles/generated/pointcloud-room/room-f2-12.las, scan B = every odd point moved by a known
 * rigid transform (written to truth.json: `applied`, row-major; registering B back needs its inverse). The two share every
 * surface but no point, so ICP has to find the surface, not the same sample. Both are LAS 1.2 format 2, written by scan-export.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || path.join(REPO, '../testfiles/generated/pointcloud-register');
const SRC = path.join(REPO, '../testfiles/generated/pointcloud-room/room-f2-12.las');
if (fs.existsSync(path.join(OUT, 'truth.json'))) { console.log('already there: ' + OUT); process.exit(0); }
if (!fs.existsSync(SRC)) { console.log('missing ' + SRC); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const { P, R, X } = await (await import('./node-env.mjs')).loadPointCloudEnv();

const blob = await fs.openAsBlob(SRC); Object.defineProperty(blob, 'name', { value: 'room-f2-12.las' });
const info = await P.readCloudInfo(blob);
const c = await P.loadCloud(blob, info, { budget: 5e6 });
const pick = (parity) => {
  const idx = []; for (let i = parity; i < c.n; i += 2) idx.push(i);
  const g = { ...c, n: idx.length, pos: new Float32Array(idx.length * 3), rgb: c.rgb && new Uint8Array(idx.length * 3), inten: c.inten && new Uint16Array(idx.length), cls: c.cls && new Uint8Array(idx.length) };
  idx.forEach((i, k) => { g.pos.set(c.pos.subarray(i * 3, i * 3 + 3), k * 3); if (c.rgb) g.rgb.set(c.rgb.subarray(i * 3, i * 3 + 3), k * 3); if (c.inten) g.inten[k] = c.inten[i]; if (c.cls) g.cls[k] = c.cls[i]; });
  return g;
};
// the room's middle, in the file's own (UTM) coordinates, is the centre of the turn: 14° about Z, 1.5° about X, then 2.35 m / −1.1 m / 0.12 m
const mid = [(c.min[0] + c.max[0]) / 2, (c.min[1] + c.max[1]) / 2, (c.min[2] + c.max[2]) / 2];
const applied = R.mul4(R.rotation4([0, 0, 1], 14 * Math.PI / 180, mid), R.rotation4([1, 0, 0], 1.5 * Math.PI / 180, mid));
applied[3] += 2.35; applied[7] += -1.1; applied[11] += 0.12;
const a = X.writeLas([{ name: 'a', cloud: pick(0), M: R.I4() }]);
const b = X.writeLas([{ name: 'b', cloud: pick(1), M: applied }]);
fs.writeFileSync(path.join(OUT, 'room-scan-a.las'), Buffer.from(await a.blob.arrayBuffer()));
fs.writeFileSync(path.join(OUT, 'room-scan-b.las'), Buffer.from(await b.blob.arrayBuffer()));
fs.writeFileSync(path.join(OUT, 'truth.json'), JSON.stringify({ source: 'room-f2-12.las', a: 'even points', b: 'odd points moved by `applied` (row-major 4x4, file coordinates)', applied, aCount: a.count, bCount: b.count }, null, 1));
const sum = (f) => createHash('sha256').update(fs.readFileSync(path.join(OUT, f))).digest('hex').slice(0, 16);
fs.writeFileSync(path.join(OUT, 'README.md'), `# pointcloud-register: two overlapping scans (ours, synthetic)\n\nMade once by \`getcadcraft.com/tools/pointcloud/mkscans.mjs\` from \`../pointcloud-room/room-f2-12.las\`. Scan A = even points, scan B = odd points moved by the transform in truth.json. Registering B back must undo it. Never regenerate.\n\nroom-scan-a.las ${sum('room-scan-a.las')}\nroom-scan-b.las ${sum('room-scan-b.las')}\n`);
console.log('made', OUT, a.count, b.count, sum('room-scan-a.las'), sum('room-scan-b.las'));
