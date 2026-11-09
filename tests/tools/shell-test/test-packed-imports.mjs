#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * test-packed-imports.mjs — rule 56 / FX.26: a shared shell module that an app imports must be in every packer's list.
 *
 *   node tools/shell-test/test-packed-imports.mjs                 source check: manifest keys -> import closure -> packers' lists
 *   node tools/shell-test/test-packed-imports.mjs --zip a.zip …   packed check: every static import of every assets/js file in each zip resolves inside it
 *
 * Source check: tools/shell-test/packed-imports-urls.php lists, per app, the shell files its dev build's manifest keys name (import map, offline
 * list, page tags). From each file the STATIC import / export-from lines are followed (relative and /assets/ paths; bare names are import-map
 * names and skipped). Every file reached must be in the packer's list: devshell/edition.php (the browser edition, and the Studio suite which is
 * built from the eight editions) and devshell/pack.php (the contributor dev shell). Dynamic import('…') of a literal is listed as a note only.
 * Zip check: needs `unzip` (no PHP): proves a published zip would have failed (the 0.8.1 zips lacked app-devices-studio.js).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PUB = path.join(ROOT, 'public_html');
let fails = 0;
const fail = (m) => { fails++; console.log('FAIL ' + m); };
const ok = (m) => console.log('ok   ' + m);

const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
function staticImports(text) {
  const t = stripComments(text);
  const out = new Set();
  const re = /(?:^|[;\n}])\s*(?:import|export)\s+(?:[^'"`;]*?\bfrom\s*)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(t))) out.add(m[1]);
  return [...out];
}
function dynamicImports(text) {
  const out = new Set();
  const re = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(stripComments(text)))) out.add(m[1]);
  return [...out];
}
const resolveSpec = (from, spec) => {
  if (spec.startsWith('/')) return path.posix.normalize(spec.split('?')[0]);
  if (spec.startsWith('./') || spec.startsWith('../')) return path.posix.normalize(path.posix.join(path.posix.dirname(from), spec.split('?')[0]));
  return null; // bare name: an import-map key
};

if (process.argv.includes('--zip')) {
  const zips = process.argv.slice(process.argv.indexOf('--zip') + 1).filter((a) => !a.startsWith('--'));
  if (!zips.length) { console.log('no zip given'); process.exit(2); }
  for (const z of zips) {
    const names = execFileSync('unzip', ['-Z1', z], { maxBuffer: 1 << 28 }).toString().split('\n').filter(Boolean);
    // the packed root folder (if any) and the app root where assets/js lives
    const jsFiles = names.filter((n) => /(^|\/)assets\/js\/[^/]+\.js$/.test(n));
    const rootOf = (n) => n.slice(0, n.indexOf('assets/js/'));
    const set = new Set(names);
    let bad = 0, checked = 0;
    for (const n of jsFiles) {
      const root = rootOf(n);
      const text = execFileSync('unzip', ['-p', z, n], { maxBuffer: 1 << 28 }).toString();
      for (const spec of staticImports(text)) {
        if (!spec.startsWith('.') && !spec.startsWith('/assets/')) continue;
        const target = resolveSpec('/' + n.slice(root.length), spec);
        if (!target) continue;
        checked++;
        if (!set.has(root + target.replace(/^\//, ''))) { bad++; fail(`${path.basename(z)}: ${n.slice(root.length)} imports ${spec} -> not in the zip`); }
      }
    }
    if (!bad) ok(`${path.basename(z)}: ${checked} static imports of ${jsFiles.length} shell files all resolve`);
  }
  process.exit(fails ? 1 : 0);
}

// ---- source check
const apps = JSON.parse(execFileSync('php', [path.join(ROOT, 'tools/shell-test/packed-imports-urls.php')], { maxBuffer: 1 << 26 }).toString());
const listOf = (file, startMarker, endMarker) => {
  const t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const a = t.indexOf(startMarker);
  const b = t.indexOf(endMarker, a);
  if (a < 0 || b < 0) throw new Error(`cannot find the file list in ${file}`);
  return new Set([...t.slice(a, b).matchAll(/'(assets\/[^']+)'/g)].map((m) => '/' + m[1]));
};
const packers = {
  'devshell/edition.php (browser edition + Studio suite)': listOf('devshell/edition.php', '// 2. The shared shell.', 'as $f)'),
  'devshell/pack.php (contributor dev shell)': listOf('devshell/pack.php', '$files = [', '];'),
};
const engines = fs.existsSync(path.join(PUB, 'assets/js/engines'));   // the Engines panel's files are copied as a tree (see edition.php)
const edTxt = fs.readFileSync(path.join(ROOT, 'devshell/edition.php'), 'utf8');
const treeCopied = (u) => /\/assets\/js\/engines\//.test(u) && engines && /assets\/js\/engines/.test(edTxt);

// Files the packers do not ship because the packed page has no tag or mount for the key (devshell/render.php prints tags only for
// panels, phone, input, hardware, devices and the extras). A manifest key in this set is a known gap: listed as a note, never a failure.
// Closing a gap is a feature (an edition mount for the key), not a list entry.
const NOT_RENDERED = /\/(problems|problems-pdf|app-problems|app-nodes|app-lang-packs|app-crosshair|app-toolbar-tear|app-fit|app-palette|app-addons|app-addon-license|addon-license|addon-license-keys|app-addons-account-mount)\.(js|css)$|\/css\/app-(problems|nodes)\.css$|\/bootstrap\//;

const read = (f) => { const p = path.join(PUB, f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
const dynNotes = new Set();
for (const [pk, list] of Object.entries(packers)) {
  // A. closure of what the packer ships: every static import of a listed .js file must itself be listed (FX.26: app-devices-ui.js -> app-devices-studio.js)
  const queue = [...list].filter((f) => f.endsWith('.js'));
  const seenA = new Set(queue);
  let bad = 0;
  while (queue.length) {
    const f = queue.shift();
    const text = read(f);
    if (text === null) { bad++; fail(`${pk}: lists ${f}, which is not on the site`); continue; }
    for (const spec of staticImports(text)) {
      const r = resolveSpec(f, spec);
      if (!r || !r.startsWith('/assets/')) continue;
      if (treeCopied(r) || list.has(r)) { if (!seenA.has(r) && r.endsWith('.js')) { seenA.add(r); queue.push(r); } continue; }
      bad++; fail(`${pk}: ${f} imports ${spec} (${r}), which the packer does not copy`);
    }
    for (const spec of dynamicImports(text)) { const r = resolveSpec(f, spec); if (r && r.startsWith('/assets/') && !treeCopied(r) && !list.has(r) && read(r) !== null) dynNotes.add(`${pk}: ${f} dynamically imports ${r}, not copied`); }
  }
  if (!bad) ok(`${pk}: every static import of the ${seenA.size} listed files is listed`);
}
// B. every shell file the apps' manifest keys name (and their static closure) must be shipped, unless the key has no mount in the edition.
const seen = new Map();
const walk = (f, by) => {
  if (seen.has(f)) return;
  seen.set(f, by);
  const text = f.endsWith('.js') ? read(f) : null;
  if (text === null) return;
  for (const spec of staticImports(text)) { const r = resolveSpec(f, spec); if (r && r.startsWith('/assets/')) walk(r, f); }
};
for (const [slug, urls] of Object.entries(apps)) for (const u of urls) walk(u, `${slug} manifest`);
for (const [pk, list] of Object.entries(packers)) {
  const gaps = [];
  let bad = 0;
  for (const [f, by] of seen) {
    if (!/^\/assets\/(js|css)\//.test(f) || f.includes('/vendor/') || treeCopied(f) || list.has(f)) continue;
    if (read(f) === null) { bad++; fail(`${pk}: ${f} is named by ${by} but is not on the site`); continue; }
    if (NOT_RENDERED.test(f)) { gaps.push(f); continue; }
    bad++; fail(`${pk}: ${f} (reached from ${by}) is not in the list`);
  }
  if (!bad) ok(`${pk}: every file the manifest keys name is listed (${seen.size} reached)`);
  if (gaps.length) console.log(`note ${pk}: ${gaps.length} files of keys with no mount in the packed page, not shipped (known gap): ${gaps.join(' ')}`);
}
for (const n of dynNotes) console.log('note ' + n);
console.log(fails ? `\n${fails} failure(s)` : '\nall packers list every imported shell file');
process.exit(fails ? 1 : 0);
