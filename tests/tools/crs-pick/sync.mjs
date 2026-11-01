#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — lib/crs-pick/ is canonical (0.8 D8.9, sessions `d89_PART_3`, `crs-share_PART_3`); each app that offers the projection
 * picker carries byte-identical copies next to its crs.js (which is CivilCraft's, tools/bimcraft-test/crs-sync.mjs). Scoped: this
 * script touches only the files named below and the words listed in lang.mjs / lang-share.mjs, never another library's files or keys.
 *
 *   node tools/crs-pick/sync.mjs [--check] [--words] [target …]
 *   targets: bimcraft    crs-pick.js (its own dialog crs-pick-ui.js is BimCraft's) + the BimCraft words of lang.mjs
 *            civilcraft  crs-pick-shared.js (CivilCraft already has its own crs-pick.js: the catalog "fits" maths) + crs-pick-dialog.js
 *                        + the shared dialog's words and CivilCraft's place words (lang-share.mjs)
 *            cadcraft    the same two files + CadCraft's place words
 *   --words  also write the words (en + es-MX draft, @context notes) into the target's lang files
 *   --check  change nothing; exit 1 and list what differs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const LIB = path.join(ROOT, 'lib/crs-pick');
const DIALOG = [['crs-pick.js', 'crs-pick-shared.js'], ['crs-pick-dialog.js', 'crs-pick-dialog.js']];
export const TARGETS = {
  bimcraft: { dir: path.join(APPS, 'bimcraft/dev'), files: [['crs-pick.js', 'crs-pick.js']], words: 'bimcraft' },
  civilcraft: { dir: path.join(APPS, 'civilcraft/dev'), files: DIALOG, words: 'shared' },
  cadcraft: { dir: path.join(APPS, 'cadcraft/dev'), files: DIALOG, words: 'shared' },
};
const args = process.argv.slice(2), check = args.includes('--check'), words = args.includes('--words');
const names = args.filter((a) => !a.startsWith('--'));
let diff = 0;
const { EN, ES, CTX } = await import('./lang.mjs');
const S = await import('./lang-share.mjs');

/** The words (en, es, ctx) one target gets. */
function wordsFor(name, kind) {
  if (kind === 'bimcraft') return { en: EN, es: ES, ctx: CTX };
  const keep = (k) => S.SHARED_FROM_LANG.includes(k) || S.SHARED_PREFIX.some((p) => k.startsWith(p));
  const pick = (T) => Object.fromEntries(Object.entries(T).filter(([k]) => keep(k)));
  return {
    en: { ...pick(EN), ...S.SHARE_EN, ...S.APP_EN[name] },
    es: { ...pick(ES), ...S.SHARE_ES, ...S.APP_ES[name] },
    ctx: { ...pick(CTX), ...S.SHARE_CTX, ...S.APP_CTX[name] },
  };
}

for (const name of names.length ? names : Object.keys(TARGETS)) {
  const tg = TARGETS[name];
  if (!tg) { console.error(name + ': not a target (' + Object.keys(TARGETS).join(', ') + ')'); diff++; continue; }
  for (const [from, to] of tg.files) {
    const src = fs.readFileSync(path.join(LIB, from)), dst = path.join(tg.dir, to);
    if (fs.existsSync(dst) && Buffer.compare(src, fs.readFileSync(dst)) === 0) console.log(name + ' ' + to + ': ok');
    else { diff++; console.log(name + ' ' + to + ': ' + (check ? 'differs' : 'updated')); if (!check) fs.writeFileSync(dst, src); }
  }
  const W = wordsFor(name, tg.words);
  for (const [loc, table] of [['en', W.en], ['es-MX', W.es]]) {
    const file = path.join(tg.dir, 'lang', loc + '.json');
    const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    const out = {};
    let changed = false;
    for (const [k, v] of Object.entries(obj)) { if (k in table && table[k] !== v) { out[k] = table[k]; changed = true; } else out[k] = v; }
    for (const [k, v] of Object.entries(table)) if (!(k in out)) { out[k] = v; changed = true; }
    if (loc === 'en') { obj['@context'] ||= {}; for (const [k, v] of Object.entries(W.ctx)) if (obj['@context'][k] !== v) { out['@context'] = { ...(out['@context'] || obj['@context']), [k]: v }; changed = true; } }
    if (changed) { diff++; console.log(name + ' ' + loc + '.json: crs.pick / geo.pick words ' + ((check || !words) ? 'differ' : 'written')); if (words && !check) fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n'); }
  }
}
process.exit(check && diff ? 1 : 0);
