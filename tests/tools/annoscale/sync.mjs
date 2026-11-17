#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs: the annotation-scale rule (0.10 BK.10, session bk-r3-scale-10). lib/annoscale/annoscale.js is canonical; each host app
 * carries a byte-identical copy at <app>/dev/annoscale.js (one owner, copies never edited). What stays per app: its adapter
 * (BimCraft anno-scale-bim.js, CadCraft anno-scale-cad.js).
 *
 *   node tools/annoscale/sync.mjs --check --to bimcraft,cadcraft     compare only; exit 1 on any drift
 *   node tools/annoscale/sync.mjs --to bimcraft                      copy where it differs
 *
 * `--to` is required (shared sync scripts are always scoped). ANNOSCALE_APPS_DIR overrides the apps folder (the test).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = process.env.ANNOSCALE_APPS_DIR || path.join(ROOT, 'public_html/assets/apps');
const SRC = path.join(ROOT, 'lib/annoscale');
export const TARGETS = ['bimcraft', 'cadcraft', 'supercadcraft'];
export const FILES = ['annoscale.js'];

/** [{ app, file, from, to }] for the named apps. */
export function drift(apps) {
  const out = [];
  for (const app of apps) for (const f of FILES) {
    const from = path.join(SRC, f), to = path.join(APPS, app, 'dev', f);
    if (!fs.existsSync(to) || !fs.readFileSync(to).equals(fs.readFileSync(from))) out.push({ app, file: f, from, to });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--to'), apps = i > 0 ? String(process.argv[i + 1] || '').split(',').filter(Boolean) : [];
  const check = process.argv.includes('--check');
  if (!apps.length || apps.some((a) => !TARGETS.includes(a))) { console.error('usage: node tools/annoscale/sync.mjs [--check] --to ' + TARGETS.join(',') + '  (one or more, comma-separated)'); process.exit(2); }
  const d = drift(apps);
  for (const x of d) { console.log((check ? '  ~ ' : '  → ') + x.app + ' ' + x.file); if (!check) fs.copyFileSync(x.from, x.to); }
  console.log(d.length ? (check ? d.length + ' files drift' : 'synced ' + d.length + ' files') : 'in sync');
  process.exit(check && d.length ? 1 : 0);
}
