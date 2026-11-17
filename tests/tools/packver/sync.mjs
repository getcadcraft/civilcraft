#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs: the pack version + changelog rule (0.10 BK.153 / BK.154, session bk-r3-library-10). lib/packver/packver.js is canonical; byte-identical
 * copies live at public_html/assets/js/packver.js (shell, and the PHP parity test bin/test-packver.php), and <app>/dev/packver.js for the apps
 * whose libitem.js imports it. The PHP twin is core/classes/PackVersioning.php.
 *
 *   node tools/packver/sync.mjs --check --to shell,bimcraft,cadcraft     compare only; exit 1 on any drift
 *   node tools/packver/sync.mjs --to shell,bimcraft                      copy where it differs
 * `--to` is required (shared sync scripts are always scoped). PACKVER_ROOT overrides the site folder (the test).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.PACKVER_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'lib/packver/packver.js');
export const TARGETS = { shell: 'public_html/assets/js/packver.js', bimcraft: 'public_html/assets/apps/bimcraft/dev/packver.js', cadcraft: 'public_html/assets/apps/cadcraft/dev/packver.js' };

export function drift(names) {
  const out = [];
  for (const n of names) {
    const to = path.join(ROOT, TARGETS[n]);
    if (!fs.existsSync(to) || !fs.readFileSync(to).equals(fs.readFileSync(SRC))) out.push({ target: n, from: SRC, to });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--to'), names = i > 0 ? String(process.argv[i + 1] || '').split(',').filter(Boolean) : [];
  const check = process.argv.includes('--check');
  if (!names.length || names.some((a) => !TARGETS[a])) { console.error('usage: node tools/packver/sync.mjs [--check] --to ' + Object.keys(TARGETS).join(',') + '  (one or more, comma-separated)'); process.exit(2); }
  const d = drift(names);
  for (const x of d) { console.log((check ? '  ~ ' : '  → ') + x.target); if (!check) fs.copyFileSync(x.from, x.to); }
  console.log(d.length ? (check ? d.length + ' files drift' : 'synced ' + d.length + ' files') : 'in sync');
  process.exit(check && d.length ? 1 : 0);
}
