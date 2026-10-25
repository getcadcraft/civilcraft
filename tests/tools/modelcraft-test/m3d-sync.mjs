#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * m3d-sync.mjs — ModelCraft's kernel (canonical in modelcraft/dev) copied byte-identical into an app's dev/m3d/
 * (0.7 M3D-DRIFT; owner: session `mesh`). Until 0.7 the copy was made by hand and fell behind (CadCraft's was
 * ModelCraft 0.5's).
 *
 *   node tools/modelcraft-test/m3d-sync.mjs [--check] [app…]      (default app: cadcraft)
 *
 * The kernel = ENTRY plus every module they import with a static relative import ('./x.js'), found by reading them, so
 * a new dependency (bvh.js, mesh.js) comes along by itself. i18n.js is not copied here: it is the language shell's copy
 * (tools/lang/sync.mjs). Files in m3d/ that are no longer part of the kernel are removed. The list is written to
 * tools/modelcraft-test/m3d-files.json (bin/test-cadcraft-3d.mjs checks the copy against it). After copying, the
 * kernel's words are brought over with m3d-keys.mjs. --check only reports (exit 1 on any difference).
 * Only one level of folders below a build is mapped by the site (AppBuilds), so the kernel stays flat in dev/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const MC = path.join(APPS, 'modelcraft/dev');
export const ENTRY = ['vec.js', 'model.js', 'earcut.js', 'camera.js', 'infer.js', 'tools.js', 'collide.js', 'sun.js', 'units.js', 'view3d.js', 'io.js', 'xml.js', 'strokefont.js', 'viewcube.js', 'viewcube-camera.js', 'viewimage.js'];
const NOT_OURS = new Set(['i18n.js']);

/** The kernel's files (sorted): ENTRY and what they import, relative to modelcraft/dev. */
export function kernelFiles() {
  const seen = new Set(), todo = [...ENTRY];
  while (todo.length) {
    const f = todo.pop();
    if (seen.has(f) || NOT_OURS.has(f)) continue;
    const file = path.join(MC, f);
    if (!fs.existsSync(file)) throw new Error('kernel file missing: modelcraft/dev/' + f);
    seen.add(f);
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:^|\n)\s*(?:import|export)\s[^;'"]*?from\s*['"]\.\/([^'"]+)['"]|(?:^|\n)\s*import\s*['"]\.\/([^'"]+)['"]/g)) {
      const dep = path.posix.normalize(m[1] || m[2]);
      if (dep.includes('/')) throw new Error(`modelcraft/dev/${f} imports ./${dep}: the kernel must stay flat (one folder level is mapped)`);
      todo.push(dep);
    }
  }
  return [...seen].sort();
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2), check = args.includes('--check');
  const apps = args.filter((a) => !a.startsWith('--'));
  if (!apps.length) apps.push('cadcraft');
  const files = kernelFiles();
  const listFile = path.join(ROOT, 'tools/modelcraft-test/m3d-files.json');
  const list = JSON.stringify({ note: 'written by tools/modelcraft-test/m3d-sync.mjs: the m3d kernel copy (i18n.js is the language shell\'s)', files }, null, 2) + '\n';
  let bad = 0;
  if (!fs.existsSync(listFile) || fs.readFileSync(listFile, 'utf8') !== list) {
    if (check) { console.log('m3d-files.json is not up to date'); bad++; } else fs.writeFileSync(listFile, list);
  }
  for (const app of apps) {
    const dir = path.join(APPS, app, 'dev/m3d');
    if (!fs.existsSync(dir)) { console.log(`${app}: no dev/m3d — skipped`); continue; }
    const changed = files.filter((f) => !fs.existsSync(path.join(dir, f)) || !fs.readFileSync(path.join(dir, f)).equals(fs.readFileSync(path.join(MC, f))));
    const extra = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !files.includes(f) && !NOT_OURS.has(f));
    if (!changed.length && !extra.length) { console.log(`${app}: m3d/ in step (${files.length} files)`); continue; }
    bad++;
    console.log(`${app}: ${changed.length} to copy (${changed.join(', ')})${extra.length ? `, ${extra.length} to remove (${extra.join(', ')})` : ''}`);
    if (check) continue;
    for (const f of changed) fs.copyFileSync(path.join(MC, f), path.join(dir, f));
    for (const f of extra) fs.unlinkSync(path.join(dir, f));
    console.log(`${app}: re-copied`);
  }
  if (!check) execFileSync(process.execPath, [path.join(ROOT, 'tools/modelcraft-test/m3d-keys.mjs'), ...apps], { stdio: 'inherit' });
  else try { execFileSync(process.execPath, [path.join(ROOT, 'tools/modelcraft-test/m3d-keys.mjs'), '--check', ...apps], { stdio: 'inherit' }); } catch { bad++; }
  process.exit(check && bad ? 1 : 0);
}
