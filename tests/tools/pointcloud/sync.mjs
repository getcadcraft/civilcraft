#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — the point cloud modules BimCraft and CadCraft share (0.5 SG.1, session sg-cad-bim). An app's build never
 * imports another app's folder, so each carries byte-identical copies:
 *   civilcraft/dev/las.js, terrain.js, crs.js, crs-db.json   → bimcraft/dev, cadcraft/dev   (CivilCraft's LAS / LAZ reader,
 *                                                               canonical there; BimCraft's crs.js is also crs-sync.mjs's)
 *   bimcraft/dev/pointcloud.js, pointcloud-three.js,         → cadcraft/dev                 (canonical in BimCraft)
 *     cloud-types.js, e57.js (0.6: which files are clouds; E57 behind readE57),
 *     register.js, scan-export.js, register-ui.js (0.7 LC.3: registering scans, LAS / E57 out, the dialog)
 * The words those files show come from each app's own language file: every key they use that the app lacks is copied
 * from CivilCraft's en.json (else BimCraft's), with "CivilCraft" / "BimCraft" in the text turned into the app's name,
 * together with its translator note (@context).
 *
 *   node tools/pointcloud/sync.mjs           copy files and missing keys
 *   node tools/pointcloud/sync.mjs --check   exit 1 when a copy differs or a key is missing (bin/test-pointcloud.mjs runs it)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(REPO, 'public_html/assets/apps');
const NAMES = { bimcraft: 'BimCraft', cadcraft: 'CadCraft', civilcraft: 'CivilCraft' };
const COPIES = [
  { from: 'civilcraft', files: ['las.js', 'terrain.js', 'crs.js', 'crs-db.json'], to: ['bimcraft', 'cadcraft'] },
  { from: 'bimcraft', files: ['pointcloud.js', 'pointcloud-three.js', 'cloud-types.js', 'e57.js', 'register.js', 'scan-export.js', 'register-ui.js'], to: ['cadcraft'] },
];
const KEY_SOURCES = ['civilcraft', 'bimcraft'];
const check = process.argv.includes('--check');
const problems = [];
const dev = (app, f = '') => path.join(APPS, app, 'dev', f);

for (const c of COPIES) for (const f of c.files) {
  const want = fs.readFileSync(dev(c.from, f));
  for (const app of c.to) {
    const dst = dev(app, f);
    if (fs.existsSync(dst) && fs.readFileSync(dst).equals(want)) continue;
    if (check) problems.push(app + '/dev/' + f + ' differs from ' + c.from + '/dev/' + f);
    else { fs.writeFileSync(dst, want); console.log('copied ' + c.from + '/dev/' + f + ' → ' + app + '/dev/'); }
  }
}

/**
 * Every language key a module names: any quoted dotted word that is a key in a source language file — t('key' …) calls,
 * las.js's bad('las.bad.…') and its class-name table alike.
 */
const keysOf = (src) => [...src.matchAll(/['"]([a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+)['"]/g)].map((m) => m[1]).filter((k) => KEY_SOURCES.some((a) => k in langs.en[a]));
const jsOf = (app) => [...new Set(COPIES.filter((c) => c.to.includes(app)).flatMap((c) => c.files.filter((f) => f.endsWith('.js'))))];
// en, then the es-MX drafts (0.6 PF.4): a key the app's en.json has from these modules gets its draft from the same source
const LOCALES = ['en', 'es-MX'];
const readLang = (app, loc) => { try { return JSON.parse(fs.readFileSync(dev(app, 'lang/' + loc + '.json'), 'utf8')); } catch { return {}; } };
const langs = Object.fromEntries(LOCALES.map((loc) => [loc, Object.fromEntries(KEY_SOURCES.map((a) => [a, readLang(a, loc)]))]));

for (const loc of LOCALES) for (const app of ['bimcraft', 'cadcraft']) {
  const file = dev(app, 'lang/' + loc + '.json');
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  const have = JSON.parse(text);
  const keys = [...new Set(jsOf(app).flatMap((f) => keysOf(fs.readFileSync(dev(app, f), 'utf8'))))];
  const missing = keys.filter((k) => !(k in have));
  if (!missing.length) continue;
  const rename = (v) => typeof v === 'string' ? v.replace(/\b(CivilCraft|BimCraft)\b/g, NAMES[app])
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, rename(b)])) : v;
  const add = [], notes = [], unknown = [];
  for (const k of missing) {
    const src = KEY_SOURCES.find((a) => k in langs[loc][a]);
    if (!src) { if (loc === 'en') unknown.push(k); continue; }   // a draft nobody wrote yet: closing fills it
    add.push('  ' + JSON.stringify(k) + ': ' + JSON.stringify(rename(langs[loc][src][k]), null, 2).replace(/\n/g, '\n  '));
    const note = langs[loc][src]['@context']?.[k];
    if (note && !(have['@context'] && k in have['@context'])) notes.push('    ' + JSON.stringify(k) + ': ' + JSON.stringify(rename(note)) + ',');
  }
  if (unknown.length) problems.push(app + ': no language file has ' + unknown.join(', '));
  if (check) { if (add.length) problems.push(app + '/dev/lang/' + loc + '.json lacks ' + add.map((l) => l.trim().split('"')[1]).join(', ')); continue; }
  if (!add.length) continue;
  text = text.replace(/\n\}\s*$/, ',\n' + add.join(',\n') + '\n}\n');
  if (notes.length && /"@context": \{\n/.test(text)) text = text.replace(/("@context": \{\n)/, '$1' + notes.join('\n') + '\n');
  JSON.parse(text);
  fs.writeFileSync(file, text);
  console.log('added ' + add.length + ' key(s) to ' + app + '/dev/lang/' + loc + '.json');
}

if (problems.length) { for (const p of problems) console.log('  FAIL ' + p); process.exit(1); }
if (check) console.log('point cloud copies in step');
