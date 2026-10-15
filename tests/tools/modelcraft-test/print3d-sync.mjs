#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * print3d-sync.mjs — print3d.js (is a mesh ready for a 3D printer; STL and 3MF; 0.5 SG.4) lives in modelcraft/dev;
 * PartCraft carries a byte-identical copy (owner `sg-model-part`, rule 3). Copies it, or with --check reports copies
 * that differ (exit 1).
 *
 *   node tools/modelcraft-test/print3d-sync.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const SRC = path.join(APPS, 'modelcraft/dev/print3d.js');
const COPIES = ['partcraft/dev'].map((d) => path.join(APPS, d, 'print3d.js'));
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
