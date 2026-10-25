#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * illustrate-words.mjs — writes the Illustrate words (illustrate-lang.mjs) into PartCraft's lang/en.json and lang/es-MX.json
 * (the draft). Only keys starting `illustrate.` are added, changed or removed; every other key, and the key order of the
 * file, is left as it is (new keys go at the end). `--check`: exit 1 when a file is out of step, write nothing.
 *   node tools/partcraft-test/illustrate-words.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN, ES } from './illustrate-lang.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANG = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/lang/');
const check = process.argv.includes('--check');
let off = 0;
for (const [file, words] of [['en.json', EN], ['es-MX.json', ES]]) {
  const p = path.join(LANG, file);
  const cur = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = {};
  for (const [k, v] of Object.entries(cur)) if (!k.startsWith('illustrate.')) next[k] = v;
  for (const [k, v] of Object.entries(words)) next[k] = v;
  const same = JSON.stringify(Object.entries(cur).filter(([k]) => k.startsWith('illustrate.'))) === JSON.stringify(Object.entries(words));
  if (same) { console.log(file + ': in step (' + Object.keys(words).length + ' words)'); continue; }
  off++;
  if (check) { console.log(file + ': out of step'); continue; }
  fs.writeFileSync(p, JSON.stringify(next, null, 2) + '\n');
  console.log(file + ': wrote ' + Object.keys(words).length + ' illustrate.* words');
}
if (check && off) process.exit(1);
