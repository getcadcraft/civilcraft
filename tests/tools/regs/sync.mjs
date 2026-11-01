#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — the Building regulations engine (0.8 REG.1 step 4, session `regs-08`; decision 8: one engine in every app). BimCraft's add-on
 * (bimcraft/dev/addons/regs/) is canonical; CadCraft, CivilCraft and DetailCraft carry byte-identical copies of the engine files (rule 3: one
 * owner, copies never edited). The engine is what has no app imports: lib/regs.js (pack format, resolve), active.js (what is ticked, the
 * drawing's ticks), library.js (installed regions), problems.js (rules as shared Problems), report.js (pinned versions, the report), the
 * packs and the strings. What stays per app: addon.json, main.js (the app's adapter: its model reader, the Settings and panel mounts) and
 * lib/check.js (the checks that read the app's own model).
 *
 *   node tools/regs/sync.mjs --to cadcraft,civilcraft     copy where it differs, print what changed
 *   node tools/regs/sync.mjs --check --to detailcraft     compare only; exit 1 on any drift
 *
 * `--to` is required (rule 31: shared sync scripts are always scoped); an app whose addons/regs/ folder does not exist yet is skipped
 * ("not installed"), the engine is not put into an app that has no adapter for it. REGS_APPS_DIR overrides the apps folder (the test).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = process.env.REGS_APPS_DIR || path.join(ROOT, 'public_html/assets/apps');
const SRC = path.join(APPS, 'bimcraft/dev/addons/regs');
export const TARGETS = ['cadcraft', 'civilcraft', 'detailcraft'];
export const ENGINE = ['LICENSE', 'lib/regs.js', 'lib/active.js', 'lib/library.js', 'lib/problems.js', 'lib/report.js', 'lib/ui.js', 'lib/rows.js', 'lib/adapter.js'];

const walk = (dir, rel = '') => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name), rel + d.name + '/') : [rel + d.name])).sort() : []);
/** The files every copy carries: the engine, the packs, and the add-on's strings. */
export const files = () => [...ENGINE, ...walk(path.join(SRC, 'packs')).map((f) => 'packs/' + f), ...walk(path.join(SRC, 'lang')).map((f) => 'lang/' + f)];

/** What differs in the named apps: [{ app, file, kind: 'file' | 'extra', to }]; an app without addons/regs/ is skipped. */
export function drift(apps) {
  const out = [], list = files();
  for (const app of apps) {
    const dir = path.join(APPS, app, 'dev/addons/regs');
    if (!fs.existsSync(dir)) continue;
    for (const f of list) {
      const a = fs.readFileSync(path.join(SRC, f)), bp = path.join(dir, f);
      if (!fs.existsSync(bp) || !fs.readFileSync(bp).equals(a)) out.push({ app, kind: 'file', file: f, from: path.join(SRC, f), to: bp });
    }
    for (const sub of ['packs', 'lang']) for (const f of walk(path.join(dir, sub))) if (!list.includes(sub + '/' + f)) out.push({ app, kind: 'extra', file: sub + '/' + f, to: path.join(dir, sub, f) });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--to'), apps = i > 0 ? String(process.argv[i + 1] || '').split(',').filter(Boolean) : [];
  const check = process.argv.includes('--check');
  if (!apps.length || apps.some((a) => !TARGETS.includes(a))) { console.error('usage: node tools/regs/sync.mjs [--check] --to ' + TARGETS.join(',') + '  (one or more, comma-separated)'); process.exit(2); }
  const skipped = apps.filter((a) => !fs.existsSync(path.join(APPS, a, 'dev/addons/regs')));
  for (const a of skipped) console.log('  - ' + a + ': not installed (no addons/regs/ folder), skipped');
  const d = drift(apps);
  for (const x of d) {
    console.log((check ? '  ~ ' : '  → ') + x.app + ' ' + x.file + (x.kind === 'extra' ? ' (not in BimCraft\'s copy)' : ''));
    if (check) continue;
    if (x.kind === 'extra') fs.rmSync(x.to);
    else { fs.mkdirSync(path.dirname(x.to), { recursive: true }); fs.copyFileSync(x.from, x.to); }
  }
  console.log(d.length ? (check ? d.length + ' files drift' : 'synced ' + d.length + ' files') : 'in sync' + (skipped.length === apps.length ? ' (nothing installed)' : ''));
  process.exit(check && d.length ? 1 : 0);
}
