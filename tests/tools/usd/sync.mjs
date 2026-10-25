#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — copies cc-usd (lib/usd/*.js + NOTICE; 0.7 XF.2) byte for byte into each app that opens or exports USD
 * (<app>/dev/usd/), and writes the ccusd.* and usd.* words (tools/usd/lang.mjs) into each app's lang/en.json and
 * lang/es-MX.json. Run it after every change to lib/usd — nobody edits a copy; `--check` exits 1 while a copy or a word
 * differs. Same shape as tools/exr/sync.mjs.
 *
 *   node tools/usd/sync.mjs [--check] [target …]     targets: the keys of TARGETS
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(ROOT, 'lib/usd');
const APPS = path.join(ROOT, 'public_html/assets/apps');
export const FILES = ['index.js', 'sdf.js', 'util.js', 'messages.js', 'usda-read.js', 'usda-write.js', 'usdc-read.js', 'usdc-write.js',
  'intcode.js', 'lz4.js', 'usdz.js', 'stage.js', 'geom.js', 'scene.js', 'build.js', 'ifc.js', 'm3d.js', 'earcut.js', 'NOTICE'];
/** Apps that carry lib/usd (XF.9 ModelCraft; XF.8 the others as their adapters land). */
export const TARGETS = Object.fromEntries(['modelcraft', 'bimcraft', 'civilcraft', 'cadcraft', 'detailcraft', 'partcraft', 'takeoffcraft']
  .map((a) => [a, path.join(APPS, a, 'dev/usd')]));
const PREFIXES = ['ccusd.', 'usd.'];

/** [{ target, file, state: 'ok' | 'differs' | 'missing' | 'stale' }] */
export function compare(names = Object.keys(TARGETS)) {
  const out = [];
  for (const name of names) {
    const dir = TARGETS[name];
    for (const f of FILES) {
      const dst = path.join(dir, f);
      if (!fs.existsSync(dst)) { out.push({ target: name, file: f, state: 'missing' }); continue; }
      out.push({ target: name, file: f, state: Buffer.compare(fs.readFileSync(path.join(LIB, f)), fs.readFileSync(dst)) === 0 ? 'ok' : 'differs' });
    }
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (!FILES.includes(f)) out.push({ target: name, file: f, state: 'stale' });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const names = args.filter((a) => !a.startsWith('--'));
  for (const n of names) if (!TARGETS[n]) { console.error(n + ': not a target (' + Object.keys(TARGETS).join(', ') + ')'); process.exit(2); }
  const list = names.length ? names : Object.keys(TARGETS);
  const rows = compare(list);
  let diff = 0;
  const { EN, ES, APP_EN, APP_ES } = await import('./lang.mjs');
  for (const name of list) {
    for (const [loc, table0, extra] of [['en', EN, APP_EN], ['es-MX', ES, APP_ES]]) {
      const table = { ...table0, ...(extra[name] || {}) };
      const file = path.join(TARGETS[name], '..', 'lang', loc + '.json');
      // other sessions edit these files too: values replaced in place, missing keys added at the end, our keys the table
      // no longer has dropped; nobody else's keys move
      const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      // the per-app input.cmd.* words are added and kept; only ccusd.* / usd.* keys are ever removed
      const ours = (k) => PREFIXES.some((p) => k.startsWith(p));
      const stale = Object.keys(obj).filter((k) => ours(k) && !(k in table));
      if (!stale.length && Object.entries(table).every(([k, v]) => same(obj[k], v))) continue;
      const out = {};
      for (const [k, v] of Object.entries(obj)) if (!stale.includes(k)) out[k] = k in table ? table[k] : v;
      for (const [k, v] of Object.entries(table)) if (!(k in out)) out[k] = v;
      diff++;
      if (!check) fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
      console.log(name + ' ' + loc + '.json: ' + (check ? 'ccusd.*/usd.* words differ' : 'ccusd.*/usd.* words written'));
    }
  }
  for (const name of list) {
    const mine = rows.filter((r) => r.target === name && r.state !== 'ok');
    if (!mine.length) { console.log(name + ': ok (' + FILES.length + ' files)'); continue; }
    diff++;
    if (!check) {
      fs.mkdirSync(TARGETS[name], { recursive: true });
      for (const r of mine) {
        if (r.state === 'stale') fs.unlinkSync(path.join(TARGETS[name], r.file));
        else fs.copyFileSync(path.join(LIB, r.file), path.join(TARGETS[name], r.file));
      }
    }
    console.log(name + ': ' + (check ? 'differs — ' : 'updated — ') + mine.map((r) => r.file + ' (' + r.state + ')').join(', '));
  }
  process.exit(check && diff ? 1 : 0);
}
