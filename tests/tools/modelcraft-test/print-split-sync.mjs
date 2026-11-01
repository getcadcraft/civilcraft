#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * print-split-sync.mjs — Split for printing and Scale by factors live in modelcraft/dev; PartCraft carries byte-identical copies of
 * the DOM-free files its Split / Scale features need (0.8 SU.929 step 5 + SU.934, session model-08; the PartCraft side is
 * partcraft/dev/print-features.js, mounted by `engineer`). Copies them, or with --check reports copies that differ (exit 1).
 * print3d.js has its own script (print3d-sync.mjs); i18n.js is the language shell's.
 *
 *   node tools/modelcraft-test/print-split-sync.mjs [--check] [app…]      (default app: partcraft)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
export const FILES = ['print-split.js', 'print-geom.js', 'bvh.js', 'strokefont.js', 'scale-factors.js'];
const check = process.argv.includes('--check');
const apps = process.argv.slice(2).filter((a) => !a.startsWith('--'));
let bad = 0;
for (const app of apps.length ? apps : ['partcraft']) {
  for (const f of FILES) {
    const src = path.join(APPS, 'modelcraft/dev', f), dst = path.join(APPS, app, 'dev', f);
    const want = fs.readFileSync(src);
    if (fs.existsSync(dst) && fs.readFileSync(dst).equals(want)) { console.log('same     ' + path.relative(ROOT, dst)); continue; }
    if (check) { console.log('differs  ' + path.relative(ROOT, dst)); bad++; continue; }
    fs.writeFileSync(dst, want);
    console.log('copied   ' + path.relative(ROOT, dst));
  }
}
process.exit(check && bad ? 1 : 0);
