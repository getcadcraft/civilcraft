#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * viewimage-sync.mjs — viewimage.js (save a 3D view as a PNG, 0.4 1.7) lives in modelcraft/dev; every 3D app carries a
 * byte-identical copy (owner `model`, rule 3). Copies it, or with --check reports copies that differ (exit 1).
 *
 *   node tools/modelcraft-test/viewimage-sync.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const SRC = path.join(APPS, 'modelcraft/dev/viewimage.js');
const COPIES = ['bimcraft/dev', 'civilcraft/dev', 'detailcraft/dev', 'partcraft/dev', 'takeoffcraft/dev', 'cadcraft/dev/m3d'].map((d) => path.join(APPS, d, 'viewimage.js'));
const check = process.argv.includes('--check');
const want = fs.readFileSync(SRC);
let bad = 0;
for (const f of COPIES) {
  const same = fs.existsSync(f) && fs.readFileSync(f).equals(want);
  if (same) { console.log('same     ' + path.relative(ROOT, f)); continue; }
  if (check) { console.log('differs  ' + path.relative(ROOT, f)); bad++; continue; }
  fs.writeFileSync(f, want);
  console.log('copied   ' + path.relative(ROOT, f));
}
process.exit(check && bad ? 1 : 0);
