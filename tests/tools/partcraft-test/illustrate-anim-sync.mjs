#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * illustrate-anim-sync.mjs — Illustrate's timeline (0.7 TP.6) is built on AN.1's animation model, not a fork of it: this copies
 * ModelCraft's canonical `render/anim.js` (owner: session `anim`) and the shared video encoder `render/video.js`, `webm.js`,
 * `mp4.js` (owner: session `render`) byte for byte into partcraft/dev/illustrate/ (rule 3: the copies are never edited; an app
 * never imports another app's folder). The canonical files' owners have stopped (2026-10-22/23), so this script is how the copy
 * follows them until 0.8 moves both to a shared lib/.
 *   node tools/partcraft-test/illustrate-anim-sync.mjs [--check]     (--check: exit 1 when a copy differs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/render');
const DST = path.join(ROOT, 'public_html/assets/apps/partcraft/dev/illustrate');
export const FILES = ['anim.js', 'video.js', 'webm.js', 'mp4.js'];
const check = process.argv.includes('--check');
let off = 0;
for (const f of FILES) {
  const a = fs.readFileSync(path.join(SRC, f)), d = path.join(DST, f);
  const same = fs.existsSync(d) && Buffer.compare(a, fs.readFileSync(d)) === 0;
  if (same) continue;
  off++;
  if (check) console.log('differs: ' + f);
  else { fs.writeFileSync(d, a); console.log('copied: ' + f); }
}
if (!off) console.log('in step (' + FILES.join(', ') + ')');
if (check && off) process.exit(1);
