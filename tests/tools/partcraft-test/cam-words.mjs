#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cam-words.mjs — writes the 0.7 CAM words (cam-lang.mjs) into PartCraft's lang/en.json and lang/es-MX.json (the draft). Only the
 * keys listed in cam-lang.mjs are added or changed (new ones go at the end of the file); every other key and the order of the
 * file are left as they are. `--check`: exit 1 when a file is out of step, write nothing.
 *   node tools/partcraft-test/cam-words.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN, ES } from './cam-lang.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANG = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/lang/');
const check = process.argv.includes('--check');
let off = 0;
for (const [file, words] of [['en.json', EN], ['es-MX.json', ES]]) {
  const p = path.join(LANG, file);
  const cur = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = { ...cur };
  for (const [k, v] of Object.entries(words)) next[k] = v;
  const same = Object.entries(words).every(([k, v]) => cur[k] === v);
  if (same) { console.log(file + ': in step (' + Object.keys(words).length + ' words)'); continue; }
  off++;
  if (check) { console.log(file + ': out of step'); continue; }
  fs.writeFileSync(p, JSON.stringify(next, null, 2) + '\n');
  console.log(file + ': wrote ' + Object.keys(words).length + ' words');
}
if (check && off) process.exit(1);
