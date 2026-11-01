/* SPDX-License-Identifier: Apache-2.0 */
/**
 * civil-load.mjs — CivilCraft's project.js loaded in Node the way bin/test-civilcraft.mjs does it: the build's language file for t(), and the page's
 * import map (bare names like `delaunator` → the vendored files) as a resolve hook. Used by the merge driver and bin/test-file-versions.mjs so the
 * CivilCraft reader is really run, not SKIPPED. → { Project, readProject(obj) } ; readProject throws when the reader refuses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let cached = null;
export async function loadCivil(build = 'dev') {
  if (cached) return cached;
  const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', build);
  const i18n = await import(pathToFileURL(path.join(APP, 'i18n.js')).href);
  if (fs.existsSync(path.join(APP, 'lang/en.json'))) i18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
  registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
  const { Project } = await import(pathToFileURL(path.join(APP, 'project.js')).href);
  cached = { Project, readProject: (obj) => Project.fromJSON(obj) };
  return cached;
}
