#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs: lib/lod/ (the LOD framework; 0.10 BK.13 to BK.151, session bim-lod-10) is canonical; BimCraft carries a byte-identical copy in
 * public_html/assets/apps/bimcraft/dev/lod/ (nobody edits a copy). What stays in the app: lod-model.js, lod-ui.js.
 *
 *   node lib/lod/sync.mjs --check --to bimcraft      compare only; exit 1 on any drift
 *   node lib/lod/sync.mjs --to bimcraft              copy where it differs
 *
 * `--to` is required (shared sync scripts are always scoped). The files import ../walls/lod.js, which BimCraft carries (lib/walls).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const APPS = process.env.LOD_APPS_DIR || path.join(ROOT, 'public_html/assets/apps');
export const TARGETS = ['bimcraft'];
export const FILES = ['scale.js', 'record.js', 'milestones.js', 'advice.js', 'library.js', 'fixes.js'];

export function drift(apps) {
  const out = [];
  for (const app of apps) for (const f of FILES) {
    const from = path.join(HERE, f), to = path.join(APPS, app, 'dev/lod', f);
    if (!fs.existsSync(to) || !fs.readFileSync(to).equals(fs.readFileSync(from))) out.push({ app, file: f, from, to });
  }
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--to'), apps = i > 0 ? String(process.argv[i + 1] || '').split(',').filter(Boolean) : [];
  const check = process.argv.includes('--check');
  if (!apps.length || apps.some((a) => !TARGETS.includes(a))) { console.error('usage: node lib/lod/sync.mjs [--check] --to ' + TARGETS.join(',')); process.exit(2); }
  const d = drift(apps);
  for (const x of d) { console.log((check ? '  ~ ' : '  -> ') + x.app + ' ' + x.file); if (!check) { fs.mkdirSync(path.dirname(x.to), { recursive: true }); fs.copyFileSync(x.from, x.to); } }
  console.log(d.length ? (check ? d.length + ' files drift' : 'synced ' + d.length + ' files') : 'in sync');
  process.exit(check && d.length ? 1 : 0);
}
