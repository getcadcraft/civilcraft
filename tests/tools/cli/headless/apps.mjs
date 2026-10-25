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
import { register } from 'node:module';
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
  const packed = path.resolve(HERE, '..', 'vendor', lib);   // packed: vendor/<lib>/<version>/, one version
  const ver = isDir(packed) ? fs.readdirSync(packed).filter((v) => /^\d/.test(v) && isDir(path.join(packed, v))) : [];
  for (const t of [ver.length === 1 ? path.join(packed, ver[0]) : null, path.join(REPO, 'public_html/assets/vendor', lib, 'current')]) if (t && isDir(t)) return t;
  return null;
}

/** A Node package used only where the browser has a build of its own (pdf.js legacy for Node, in a test folder). */
export function nodeModule(name, from) {
  for (const t of [path.resolve(HERE, '..', '..', 'node_modules', name), path.resolve(HERE, '..', 'node_modules', name), path.join(REPO, 'tools', from, 'node_modules', name)]) if (isDir(t)) return t;
  return null;
}

/**
 * The libraries an app's modules import by name ("delaunator", "proj4"), as its page's import map gives them (0.7 AS.3):
 * the build's manifest.json `imports` (packed: imports.json beside the modules) → the vendor folder's file. Only for the
 * apps that need it (CivilCraft); one resolve hook per app, registered before its first module loads.
 */
const MAPPED = new Set(['civilcraft']);
const hooked = new Set();
const LOADER = 'data:text/javascript,' + encodeURIComponent('let map = {};\nexport function initialize(d) { map = d || {}; }\n'
  + 'export async function resolve(s, c, next) { return Object.prototype.hasOwnProperty.call(map, s) ? { url: map[s], shortCircuit: true } : next(s, c); }\n');
function mapImports(slug, dir) {
  if (!MAPPED.has(slug) || hooked.has(slug)) return;
  hooked.add(slug);
  let imports = null;
  for (const f of ['imports.json', 'manifest.json']) { try { const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); imports = j.imports || j; break; } catch { /* next */ } }
  const map = {};
  for (const [spec, url] of Object.entries(imports || {})) {
    const m = /^\/assets\/vendor\/([^/]+)\/current\/(.+)$/.exec(String(url));
    const dirOf = m && vendorDir(m[1]);
    if (dirOf && fs.existsSync(path.join(dirOf, m[2]))) map[spec] = pathToFileURL(path.join(dirOf, m[2])).href;
  }
  if (Object.keys(map).length) register(LOADER, { data: map });
}

const ready = new Map();
/**
 * Import one of an app's modules. The first call for an app loads its language file into its own i18n.js first, so any
 * text the modules print is the app's real wording.
 */
export async function load(slug, file) {
  const dir = appDir(slug);
  if (!ready.has(slug)) {
    mapImports(slug, dir);
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
