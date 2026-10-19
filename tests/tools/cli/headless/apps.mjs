/* SPDX-License-Identifier: Apache-2.0 */
/**
 * apps.mjs — where the headless core finds each app's own modules (docs/AGENTS-SPEC.md §2, §8).
 *
 * The CLI and the MCP server never carry a second copy of an app's logic: they import the app build's DOM-free modules.
 *   - a packed npm package (tools/mcp/pack.mjs): `cli/apps/<slug>/` beside `cli/headless/`;
 *   - this repository: public_html/assets/apps/<slug>/dev/;
 *   - CADCRAFT_APPS=<folder> (holding <slug>/ or <slug>/dev/) overrides both.
 * Shared libraries (cc-ifc, vendor folders) are found the same way: packed `lib/`, `vendor/`, else the repository's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKED = path.resolve(HERE, '..', 'apps');
const REPO = path.resolve(HERE, '..', '..', '..');

const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

/** The folder an app's modules are loaded from. */
export function appDir(slug) {
  if (!/^[a-z]{2,20}$/.test(slug)) throw new Error('unknown app ' + slug);
  const env = process.env.CADCRAFT_APPS;
  const tries = [];
  if (env) tries.push(path.join(env, slug, 'dev'), path.join(env, slug));
  tries.push(path.join(PACKED, slug), path.join(REPO, 'public_html/assets/apps', slug, 'dev'));
  for (const t of tries) if (isDir(t)) return t;
  throw new Error('CadCraft could not find the ' + slug + ' modules (looked in ' + tries.join(', ') + ').');
}

/** cc-ifc (lib/ifc), packed or in the repository. */
export function libDir(name) {
  for (const t of [path.resolve(HERE, '..', 'lib', name), path.join(REPO, 'lib', name)]) if (isDir(t)) return t;
  throw new Error('CadCraft could not find lib/' + name + '.');
}

/** A vendor library folder (assets/vendor/<lib>/current), packed or in the repository; null when absent. */
export function vendorDir(lib) {
  for (const t of [path.resolve(HERE, '..', 'vendor', lib), path.join(REPO, 'public_html/assets/vendor', lib, 'current')]) if (isDir(t)) return t;
  return null;
}

/** A Node package used only where the browser has a build of its own (pdf.js legacy for Node, in a test folder). */
export function nodeModule(name, from) {
  for (const t of [path.resolve(HERE, '..', '..', 'node_modules', name), path.resolve(HERE, '..', 'node_modules', name), path.join(REPO, 'tools', from, 'node_modules', name)]) if (isDir(t)) return t;
  return null;
}

const ready = new Map();
/**
 * Import one of an app's modules. The first call for an app loads its language file into its own i18n.js first, so any
 * text the modules print is the app's real wording.
 */
export async function load(slug, file) {
  const dir = appDir(slug);
  if (!ready.has(slug)) {
    ready.set(slug, (async () => {
      const i18n = path.join(dir, 'i18n.js');
      const en = path.join(dir, 'lang', 'en.json');
      if (fs.existsSync(i18n) && fs.existsSync(en)) {
        const I = await import(pathToFileURL(i18n).href);
        if (typeof I.init === 'function') I.init({ strings: JSON.parse(fs.readFileSync(en, 'utf8')) });
      }
    })());
  }
  await ready.get(slug);
  return import(pathToFileURL(path.join(dir, file)).href);
}

/** The version a build says it is (release.json), else 'dev'. */
export function appVersion(slug) {
  try { return JSON.parse(fs.readFileSync(path.join(appDir(slug), 'release.json'), 'utf8')).version || 'dev'; } catch { return 'dev'; }
}

export const PACKAGE_VERSION = (() => {
  for (const p of [path.resolve(HERE, '..', '..', 'package.json'), path.resolve(HERE, '..', '..', 'mcp', 'package.json')]) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')).version; } catch { /* next */ }
  }
  return '0.0.0-dev';
})();
