#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * build-packs.mjs — writes TakeoffCraft's trade packs (0.5 TK.2/TK.3) from tools/takeoffcraft-test/packs/<trade>.mjs to
 * public_html/assets/apps/takeoffcraft/dev/packs/<id>.ccpack.json, plus packs/index.json (what the app's Packs dialog and the
 * site's /addons listing read). Every pack is read back through the app's own readPack() before it is written.
 *
 *   node tools/takeoffcraft-test/build-packs.mjs            write
 *   node tools/takeoffcraft-test/build-packs.mjs --check    exit 1 when a written file differs from its source (the test runs this)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'tools/takeoffcraft-test/packs');
const OUT = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev/packs');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
export const PACK_FILES = ['electrical', 'drywall-framing', 'painting', 'concrete', 'flooring', 'masonry',
  'roofing-residential', 'roofing-commercial', 'siding', 'finish-carpentry', 'plumbing', 'hvac', 'insulation', 'landscape',
  'decking', 'general-contractor'];

/** The packs' source objects (with the test-only `_k` per twin), in listing order. */
export async function sources() {
  const out = [];
  for (const f of PACK_FILES) {
    const file = path.join(SRC, f + '.mjs');
    if (fs.existsSync(file)) out.push({ file: f, pack: (await import(pathToFileURL(file).href)).default });
  }
  return out;
}

const strip = (p) => JSON.parse(JSON.stringify(p, (k, v) => (k === '_k' ? undefined : v)));

export async function build() {
  const i18n = await import(pathToFileURL(path.join(APP, 'i18n.js')).href);
  i18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const { readPack, packSystemOf } = await import(pathToFileURL(path.join(APP, 'packs.js')).href);
  const files = new Map();
  const index = [];
  for (const { file, pack } of await sources()) {
    const json = strip(pack);
    const r = readPack(JSON.parse(JSON.stringify(json)));
    if (!r.ok) throw new Error(file + ': ' + r.error);
    if (r.warnings.length) throw new Error(file + ': ' + r.warnings.join(' | '));
    if (r.pack.items.length !== json.items.length) throw new Error(file + ': items dropped on read');
    const name = json.id.replace(/^trade\./, '') + '.ccpack.json';
    files.set(name, JSON.stringify(json, null, 1) + '\n');
    const sys = (s) => r.pack.items.filter((i) => packSystemOf(i) === s || packSystemOf(i) === 'any').length;
    index.push({ id: json.id, name: json.name, file: name, trade: json.trade, packVersion: json.packVersion, status: json.status,
      license: json.license, description: json.description, csi: json.csi, items: r.pack.items.length, imperial: sys('imperial'), metric: sys('metric'),
      components: r.pack.items.reduce((n, i) => n + i.components.length, 0), sources: r.pack.sources.length });
  }
  files.set('index.json', JSON.stringify({ format: 'takeoffcraft-packs', version: 1, packs: index }, null, 1) + '\n');
  return files;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  const files = await build();
  let bad = 0;
  if (!check) fs.mkdirSync(OUT, { recursive: true });
  for (const [name, text] of files) {
    const p = path.join(OUT, name);
    const now = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
    if (now === text) continue;
    if (check) { console.log('differs: packs/' + name); bad++; } else { fs.writeFileSync(p, text); console.log('wrote packs/' + name); }
  }
  if (check) {
    for (const f of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) if (f.endsWith('.json') && !files.has(f)) { console.log('not from a source: packs/' + f); bad++; }
    console.log(bad ? bad + ' file(s) out of date: run node tools/takeoffcraft-test/build-packs.mjs' : 'packs up to date (' + (files.size - 1) + ')');
    process.exit(bad ? 1 : 0);
  }
}
