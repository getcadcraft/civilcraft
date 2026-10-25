#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * edition.mjs — build this app's browser edition from a clone: one folder of static files that runs from any web server
 * and any subfolder, with no PHP, no Node and never a request to getcadcraft.com. The same steps as the site's own packer
 * (devshell/edition.php + edition-docs.php there), from what this repo carries: app/, devshell/site/ (the shared shell),
 * the libraries in devshell/vendor/ (fetched by version, checked by sha256) and devshell/edition/ (the service worker,
 * the INSTALL.md template and kit.json: library names, sources, license texts and the notices).
 *
 *   node devshell/edition.mjs [--version x.y|dev] [--out <dir>] [--zip] [--offline]
 *   → <out>/<slug>-browser-edition-v<x.y.z>/          (default out: dist/; --version defaults to dev)
 *   → <out>/<slug>-browser-edition-v<x.y.z>.zip + <out>/SHA256SUMS with --zip
 *
 * Needs Node 20.19+ and PHP 8.1+ (the page is rendered by devshell/render.php --edition). Missing libraries are fetched
 * first, as `npm run fetch-vendor` does; --offline never downloads. The zip has one top folder, files in sorted order
 * and every date set to the build's date (app/release.json, else SOURCE_DATE_EPOCH, else now), so the same folder gives
 * the same bytes.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fetchVendor } from './fetch-vendor.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(HERE);
const SRC = path.join(REPO, 'app');
const SITE = path.join(HERE, 'site');
const VENDOR = path.join(HERE, 'vendor');
const KIT_DIR = path.join(HERE, 'edition');

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const die = (m) => { console.error('edition: ' + m); process.exit(1); };
const label = opt('--version') || 'dev';
if (!/^(\d{1,3}\.\d{1,3}(\.\d{1,3})?|dev)$/.test(label)) die('--version needs x.y, x.y.z or dev');

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
for (const f of [path.join(SRC, 'manifest.json'), path.join(HERE, 'app.json'), path.join(HERE, 'vendor.json'), path.join(KIT_DIR, 'kit.json')]) {
  if (!fs.existsSync(f)) die(`${path.relative(REPO, f)} is missing: run this from a clone of the app's repository`);
}
const dev = readJson(path.join(HERE, 'app.json'));
const vendorList = readJson(path.join(HERE, 'vendor.json'));
const kit = readJson(path.join(KIT_DIR, 'kit.json'));
const app = dev.app;
const slug = app.slug;
const semver = /^\d+\.\d+$/.test(label) ? label + '.0' : label;
const top = `${slug}-browser-edition-v${semver}`;
const outDir = path.resolve(opt('--out') || path.join(REPO, 'dist'));
const ed = path.join(outDir, top);
const php = process.env.PHP_BIN || 'php';
if (spawnSync(php, ['-r', 'exit(PHP_VERSION_ID >= 80100 ? 0 : 1);']).status !== 0) die('PHP 8.1 or newer is needed to render the page (set PHP_BIN if it is not on the PATH)');

/** Copy a tree; skip(p) leaves a file or folder out (p is the source path). '.DS_Store' and '*.tmp' are never copied. */
function copyTree(from, to, skip = null) {
  fs.mkdirSync(to, { recursive: true });
  for (const n of fs.readdirSync(from).sort()) {
    if (n === '.DS_Store' || n.endsWith('.tmp')) continue;
    const a = path.join(from, n);
    if (skip && skip(a)) continue;
    if (fs.statSync(a).isDirectory()) copyTree(a, path.join(to, n), skip);
    else fs.copyFileSync(a, path.join(to, n));
  }
}
function walk(dir, out = []) {
  for (const n of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const rel = (p, base) => path.relative(base, p).split(path.sep).join('/');

fs.rmSync(ed, { recursive: true, force: true });
fs.mkdirSync(ed, { recursive: true });
const notes = [];

// 1. The build (rendered and source-only files left out; an add-on's own tests too).
const appRel = `assets/apps/${slug}/${label}`;
copyTree(SRC, path.join(ed, appRel), (p) => path.basename(p) === 'node_modules'
  || /^(ui|settings)\.inc$|\.md$|(^|\/)\.|^addons\/[^/]+\/test(\/|$)/.test(rel(p, SRC)));

// 2. The shared shell.
for (const f of ['assets/css/tokens.css', 'assets/css/site.css', 'assets/css/app-shell.css', 'assets/css/help.css',
  'assets/js/site.js', 'assets/js/app-shell.js', 'assets/js/app-settings.js', 'assets/js/app-panels.js', 'assets/js/app-phone.js',
  'assets/js/app-offline.js', 'assets/js/app-input.js', 'assets/js/app-input-ui.js', 'assets/css/app-input.css', 'assets/js/app-workspace.js', 'assets/js/app-workspace-format.js', 'assets/js/app-workspace-popout.js', 'assets/js/app-workspace-input.js', 'assets/js/app-workspace-extras.js', 'assets/js/app-workspace-arrange.js', 'assets/css/app-workspace.css', 'assets/workspaces/docked.ccworkspace.json', 'assets/workspaces/toolbox.ccworkspace.json', 'assets/js/app-hardware.js', 'assets/js/compute/probe.js', 'assets/js/compute/probe-light.js', 'assets/js/compute/report.js', 'assets/js/help-panel.js', 'assets/js/help-core.js', 'assets/js/i18n.js',
  'favicon.svg', 'favicon.ico', 'favicon-32.png']) {
  fs.mkdirSync(path.dirname(path.join(ed, f)), { recursive: true });
  fs.copyFileSync(path.join(SITE, f), path.join(ed, f));
}
fs.copyFileSync(path.join(KIT_DIR, 'sw.js'), path.join(ed, 'sw.js'));

// 3. Libraries, each in assets/vendor/<lib>/<version>/ with LICENSE + SOURCE.txt.
const libs = {};
{
  let text = fs.readFileSync(path.join(SRC, 'manifest.json'), 'latin1');
  for (const f of walk(SRC)) if (/\.(m?js|inc|json)$/.test(path.basename(f))) text += fs.readFileSync(f, 'latin1');
  for (const m of text.matchAll(/\/assets\/vendor\/([a-z0-9._-]+)\/([a-z0-9._-]+)\//g)) {
    if (m[1] === 'bootstrap-icons') continue;
    libs[m[1]] = m[2] === 'current' ? (dev.vendor?.[m[1]] || vendorList.libs?.[m[1]]?.version) : m[2];
    if (!libs[m[1]]) die(`no version for library ${m[1]} in devshell/app.json`);
  }
  const sorted = Object.keys(libs).sort();                 // ksort, as edition.php; the shell libraries follow
  for (const k of sorted) { const v = libs[k]; delete libs[k]; libs[k] = v; }
}
const missing = Object.entries(libs).filter(([lib, ver]) => {
  const v = vendorList.libs?.[lib];
  if (!v || v.version !== ver) die(`library ${lib} ${ver} is not in devshell/vendor.json`);
  return v.files.some(([f, size]) => !fs.existsSync(path.join(VENDOR, lib, ver, f)) || fs.statSync(path.join(VENDOR, lib, ver, f)).size !== size);
});
if (missing.length) {
  if (args.includes('--offline')) die(`libraries not downloaded yet: ${missing.map(([l]) => l).join(', ')} (run npm run fetch-vendor)`);
  for (const [lib] of missing) {
    const r = await fetchVendor({ only: lib, quiet: true });
    if (r.failed.length) die(`could not fetch ${lib}:\n  ${r.failed.join('\n  ')}`);
  }
}
const vendorSkip = (p) => path.basename(p) === 'node_modules' || /\.map$|(^|\/)\.[^/]+$/.test(p)
  || (/\.md$/i.test(p) && !/^LICEN[CS]E/i.test(path.basename(p)));
for (const [lib, ver] of Object.entries(libs)) {
  const to = path.join(ed, 'assets/vendor', lib, ver);
  // Only the files vendor.json lists (checked by sha256), never anything else lying in devshell/vendor/.
  for (const [f] of vendorList.libs[lib].files) {
    if (vendorSkip(path.join(VENDOR, lib, ver, f))) continue;
    fs.mkdirSync(path.dirname(path.join(to, f)), { recursive: true });
    fs.copyFileSync(path.join(VENDOR, lib, ver, f), path.join(to, f));
  }
  // Files the site does not serve (license texts as .md): kit.json carries them.
  for (const [f, b64] of Object.entries(kit.extra?.[lib]?.[ver] || {})) fs.writeFileSync(path.join(to, f), Buffer.from(b64, 'base64'));
}
for (const [lib, s] of Object.entries(kit.shell)) {
  const from = path.join(SITE, s.from, 'current');
  const to = path.join(ed, 'assets/vendor', lib, s.version);
  fs.mkdirSync(to, { recursive: true });
  const keep = { bootstrap: (n) => /^bootstrap\.(min\.css|bundle\.min\.js)$/.test(n),
    'bootstrap-icons': (n) => n === 'bootstrap-icons.min.css' || n === 'fonts' || /^bootstrap-icons\.woff2?$/.test(n),
    archivo: (n) => n.endsWith('.woff2') }[lib] || (() => true);
  for (const n of fs.readdirSync(from).sort()) {
    if (!keep(n)) continue;
    if (fs.statSync(path.join(from, n)).isDirectory()) copyTree(path.join(from, n), path.join(to, n), vendorSkip);
    else fs.copyFileSync(path.join(from, n), path.join(to, n));
  }
  libs[lib] = s.version;
}
for (const [lib, ver] of Object.entries(libs)) {
  const dir = path.join(ed, 'assets/vendor', lib, ver);
  if (!['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'].some((n) => fs.existsSync(path.join(dir, n)))) {
    const text = kit.shell[lib]?.license;
    if (text == null) die(`no license text for ${lib} ${ver}`);
    fs.writeFileSync(path.join(dir, 'LICENSE'), text);
  }
  if (!fs.existsSync(path.join(dir, 'SOURCE.txt'))) {
    const k = kit.shell[lib] || kit.known[lib];
    if (!k) die(`no source note for ${lib} (devshell/edition/kit.json)`);
    fs.writeFileSync(path.join(dir, 'SOURCE.txt'), `${k.name} ${ver} — ${k.url}\n${k.source ?? 'Files from the published package of that version, unchanged.'}\n` +
      `Copied into this edition from getcadcraft.com's vendored copy (assets/vendor/${lib}/${ver}/ there).\n`);
  }
}

// 4. Rewrites over every text file: pin /current/ to versions, shell libraries to their vendor folders, .mjs → .js.
const map = {};
for (const [lib, ver] of Object.entries(libs)) map[`/assets/vendor/${lib}/current/`] = `/assets/vendor/${lib}/${ver}/`;
for (const [lib, s] of Object.entries(kit.shell)) { map[`/${s.from}/current/`] = `/assets/vendor/${lib}/${s.version}/`; map[`/${s.from}/${s.version}/`] = `/assets/vendor/${lib}/${s.version}/`; }
const mapRe = new RegExp(Object.keys(map).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const strtr = (t) => t.replace(mapRe, (k) => map[k]);
const files = walk(path.join(ed, 'assets'));
const mjs = {};
for (const p of files) {
  const n = path.basename(p);
  if (!n.endsWith('.mjs')) continue;
  const js = n.slice(0, -4) + '.js';
  if (fs.existsSync(path.join(path.dirname(p), js))) die(`cannot rename ${p}: ${js} exists beside it`);
  mjs[n] = js;
}
const renameMjs = (t) => (Object.keys(mjs).length ? t.replace(/\b([A-Za-z0-9_.-]+)\.mjs\b/g, (m, b) => (mjs[b + '.mjs'] ? b + '.js' : m)) : t);
/** a/b/c.css + assets/x/y → ../x/y (both relative to the edition root). */
function editionRel(fromFile, to) {
  let a = path.posix.dirname(fromFile).split('/'), b = to.split('/');
  if (a.length === 1 && a[0] === '.') a = [];
  while (a.length && b.length && a[0] === b[0]) { a.shift(); b.shift(); }
  return '../'.repeat(a.length) + b.join('/');
}
for (const p of files) {
  if (!/\.(m?js|css|json|html)$/.test(p)) continue;
  const t = fs.readFileSync(p, 'latin1');
  let n = renameMjs(strtr(t));
  if (p.endsWith('.css')) {
    const r = rel(p, ed);
    n = n.replace(/url\(\s*(['"]?)\/(assets\/[^'")]+)\1\s*\)/g, (m, q, u) => `url(${q}${editionRel(r, u)}${q})`);
  }
  if (path.basename(p) === 'manifest.json' && rel(p, ed).startsWith(appRel + '/')) n = n.split('"/assets/').join('"./assets/');
  if (n !== t) fs.writeFileSync(p, n, 'latin1');
}
for (const p of files) if (p.endsWith('.mjs')) fs.renameSync(p, p.slice(0, -4) + '.js');
if (Object.keys(mjs).length) notes.push('Renamed ' + Object.keys(mjs).sort().join(', ') + ' to .js (and every reference to them), so servers that do not know the .mjs type still serve them as JavaScript.');
notes.push('Library URLs written as /assets/vendor/<lib>/current/ are pinned to the versions listed in release.json.');

// 5. The page: render.php --edition from a staged dev shell, then nothing absolute may be left in it.
const offline = walk(ed).map((p) => rel(p, ed))
  .filter((r) => !/^(sw\.js|offline\.json)$|\.(md|txt|map)$|(^|\/)(LICENSE|NOTICE|SOURCE)[^/]*$/i.test(r)).sort();
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-edition-'));
try {
  fs.mkdirSync(path.join(stage, 'devshell/site/core/components'), { recursive: true });
  fs.mkdirSync(path.join(stage, 'devshell/site/core/classes'), { recursive: true });
  for (const f of ['render.php', 'stubs.php']) fs.copyFileSync(path.join(HERE, f), path.join(stage, 'devshell', f));
  fs.copyFileSync(path.join(SITE, 'core/components/app-settings.inc'), path.join(stage, 'devshell/site/core/components/app-settings.inc'));
  fs.copyFileSync(path.join(SITE, 'core/classes/Lang.php'), path.join(stage, 'devshell/site/core/classes/Lang.php'));
  copyTree(path.join(SITE, 'assets/lang/shell'), path.join(stage, 'devshell/site/assets/lang/shell'));
  if (fs.existsSync(path.join(SITE, 'assets/workspaces'))) copyTree(path.join(SITE, 'assets/workspaces'), path.join(stage, 'devshell/site/assets/workspaces'));   // the built-in layouts render.php embeds (0.7 WS.6)
  copyTree(path.join(ed, appRel), path.join(stage, 'app'));
  for (const f of ['ui.inc', 'settings.inc']) if (fs.existsSync(path.join(SRC, f))) fs.copyFileSync(path.join(SRC, f), path.join(stage, 'app', f));
  fs.writeFileSync(path.join(stage, 'offline.json'), JSON.stringify(offline));
  fs.writeFileSync(path.join(stage, 'devshell/app.json'), JSON.stringify({
    format: 'cadcraft-devshell', version: 1, app, others: dev.others, vendor: libs,
    shell: Object.fromEntries(Object.entries(kit.shell).map(([k, s]) => [k, s.version])),
    origin: kit.site, packed: { at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), build: label },
  }, null, 4));
  const r = spawnSync(php, [path.join(stage, 'devshell/render.php'), '--edition', label, '--out', path.join(ed, 'index.html')], { encoding: 'utf8' });
  if (r.status !== 0) die('render --edition failed:\n' + r.stdout + r.stderr);
} finally { fs.rmSync(stage, { recursive: true, force: true }); }
{
  const f = path.join(ed, 'index.html');
  const html = renameMjs(strtr(fs.readFileSync(f, 'latin1')));
  fs.writeFileSync(f, html, 'latin1');
  // an import map's KEYS stay absolute on purpose (the apps' adapters import '/assets/js/app-workspace-input.js'); only keys are skipped
  const abs = html.replace(/"\/assets\/[^"]*"\s*:/g, '"":').match(/(?:src|href|action)=["']\/(?!\/)[^"']*|["']\/assets\/[^"']*/g);
  if (abs) die('index.html still has absolute URLs: ' + [...new Set(abs)].slice(0, 5).join(', '));
}

// 6. Licenses and notes for the whole edition.
const thirdParty = (() => {
  const shellKeys = Object.fromEntries(Object.entries(kit.shell).map(([k, s]) => [k, { ...s, ...kit.shellMeta[k] }]));
  const vroot = path.join(ed, 'assets/vendor');
  const rows = [];
  for (const lib of fs.readdirSync(vroot).sort()) {
    for (const version of fs.readdirSync(path.join(vroot, lib)).sort()) {
      const meta = kit.known[lib] || shellKeys[lib];
      if (!meta) die(`no entry for ${lib} in devshell/edition/kit.json`);
      const dir = path.join(vroot, lib, version);
      const lic = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'].map((n) => path.join(dir, n)).find((f) => fs.existsSync(f));
      rows.push({ ...meta, key: lib, version, where: `assets/vendor/${lib}/${version}/`, text: lic ? fs.readFileSync(lic, 'utf8').trim() : null });
    }
  }
  const embedded = [];
  for (const f of walk(SRC)) { const e = kit.embedded[path.basename(f)]; if (e && !rel(f, SRC).split('/').includes('node_modules')) embedded.push({ file: rel(f, SRC), ...e }); }
  const permissive = new Set(kit.permissive);
  const copyleft = rows.filter((r) => !permissive.has(r.spdx) && !r.allowed);
  const alsoText = (r) => (r.also ? `\n### ${r.also.title}\n\n` + '```text\n' + r.also.text.trim() + '\n```\n' : '');
  let md = `# Third-party software in this edition\n\nThis app is licensed under the Apache License 2.0 (see LICENSE). This browser edition includes the libraries below,\neach under its own license, in the folder named here, with that license (LICENSE) and where it came from (SOURCE.txt)\nbeside it. Generated by \`tools/lang/third-party.mjs\`; do not edit by hand.\n\n`;
  md += '| Library | Version | License (SPDX) | Source | Folder |\n|---|---|---|---|---|\n';
  for (const r of rows) md += `| ${r.name} | ${r.version} | ${r.spdx} | ${r.url} | \`${r.where}\` |\n`;
  if (embedded.length) {
    md += '\n## Code from others inside our files\n\nThese files are ours but follow another project\'s code closely, so its license applies to those parts too (their SPDX line\nnames both).\n\n| File | Follows | License (SPDX) | Source |\n|---|---|---|---|\n';
    for (const e of embedded) md += `| \`assets/apps/${slug}/${label}/${e.file}\` | ${e.name} | ${e.spdx} | ${e.url} |\n`;
  }
  if (copyleft.length) {
    md += '\n## Not Apache-2.0 compatible (this edition must not be published)\n\n';
    for (const r of copyleft) md += `- **${r.name} ${r.version}** (${r.spdx}): ${r.copyleft || 'not on the allowlist'}\n`;
  }
  md += '\n## License texts\n';
  for (const r of rows) md += `\n### ${r.name} ${r.version}\n\n` + (r.note ? r.note + '\n\n' : '') + '```text\n' + (r.text || `${r.spdx} — see ${r.url}`) + '\n```\n' + alsoText(r);
  for (const e of new Map(embedded.map((x) => [x.name, x])).values()) md += `\n### ${e.name}\n\n` + '```text\n' + e.text + '\n```\n';
  return { md, copyleft };
})();
fs.writeFileSync(path.join(ed, 'THIRD_PARTY.md'), thirdParty.md);
for (const f of ['LICENSE', 'PROVENANCE.md', 'TRADEMARKS.md']) fs.copyFileSync(path.join(REPO, f), path.join(ed, f));
fs.writeFileSync(path.join(ed, 'NOTICE'), kit.notice);

// 7. README, INSTALL, the server helpers and release.json (devshell/edition-docs.php on the site).
const repoUrl = `https://github.com/getcadcraft/${slug}`;
const zipName = `${top}.zip`;
const manifest = readJson(path.join(SRC, 'manifest.json'));
const iso = ['require-corp', 'credentialless'].includes(String(manifest.isolate ?? '')) ? manifest.isolate : null;
const threads = !iso ? '' : `## Faster solving (optional)\n\n${app.name} runs without any special server settings. It can use several processor cores for its `
  + 'solvers when the server also sends these two headers with the folder\'s files; without them it uses one core, which is '
  + `slower on big models but gives the same results:\n\n\`\`\`text\nCross-Origin-Opener-Policy: same-origin\nCross-Origin-Embedder-Policy: ${iso}\n\`\`\`\n\n`
  + 'Apache: uncomment the two `Header` lines in the folder\'s `.htaccess` (needs mod_headers). nginx: '
  + `\`add_header Cross-Origin-Opener-Policy same-origin; add_header Cross-Origin-Embedder-Policy ${iso};\` in the `
  + 'location block. Caddy: `header Cross-Origin-Opener-Policy same-origin` and `header Cross-Origin-Embedder-Policy '
  + `${iso}\`. The one-line test servers cannot send them; that is fine.\n`;
const fill = (t) => t.replace(/\{\{(name|slug|version|semver|zip|releases|repo|folder|threads)\}\}/g, (m, k) => ({
  name: app.name, slug, version: label, semver, zip: zipName, releases: `${repoUrl}/releases/tag/${slug}-v${semver}`, repo: repoUrl, folder: top, threads,
}[k]));
const install = fill(fs.readFileSync(path.join(KIT_DIR, 'INSTALL.md'), 'utf8').split('{{privacy}}').join(kit.privacy)).replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(path.join(ed, 'INSTALL.md'), install);
const role = /^[A-Z][a-z]/.test(app.role || '') ? app.role[0].toLowerCase() + app.role.slice(1) : (app.role || '');
fs.writeFileSync(path.join(ed, 'README.md'), `# ${app.name} ${label}: browser edition\n\n${app.tagline ?? ''}\n\n`
  + `${app.name} is the ${role} app in the CadCraft family. This folder is the whole app as plain files: `
  + `put it on any web server and open it in your browser. ${kit.privacy}\n\n`
  + `1. **Get it:** the zip \`${zipName}\` from ${repoUrl}/releases, or build this folder from a clone of ${repoUrl} (\`node devshell/edition.mjs\`, see BUILDING.md there).\n`
  + '2. **Put it on a web server:** any folder of any web server. On your own computer, run `python3 -m http.server 8000` '
  + '(or `php -S localhost:8000`, or `npx serve .`) inside this folder.\n'
  + '3. **Open it:** the folder\'s address in your browser, for example http://localhost:8000/. Press F1 for help.\n\n'
  + 'Double-clicking `index.html` does not work: browsers do not run apps like this from `file://` addresses. '
  + 'Servers, troubleshooting, updating and removing: see [INSTALL.md](INSTALL.md).\n\n'
  + '## License\n\nApache License 2.0 (`LICENSE`, `NOTICE`). Libraries and their licenses: `THIRD_PARTY.md`. Where our code comes from: `PROVENANCE.md`. '
  + 'The CadCraft names are trademarks; a fork must use another name ([TRADEMARKS.md](TRADEMARKS.md)).\n\n'
  + '---\n' + kit.trademarkNotice + '\n');
fs.writeFileSync(path.join(ed, '.htaccess'), `# ${app.name} browser edition: file types some servers do not know (see INSTALL.md).\n`
  + 'AddType application/wasm .wasm\nAddType text/javascript .js\nAddType application/json .json\nAddType font/woff2 .woff2\n'
  + 'DirectoryIndex index.html\n'
  + (iso ? `# Optional, for faster solving (needs mod_headers):\n# Header set Cross-Origin-Opener-Policy "same-origin"\n# Header set Cross-Origin-Embedder-Policy "${iso}"\n` : ''));
fs.writeFileSync(path.join(ed, 'web.config'), `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${app.name} browser edition for IIS: file types IIS does not know (see INSTALL.md). -->\n`
  + '<configuration>\n  <system.webServer>\n    <defaultDocument><files><add value="index.html" /></files></defaultDocument>\n    <staticContent>\n'
  + '      <remove fileExtension=".wasm" /><mimeMap fileExtension=".wasm" mimeType="application/wasm" />\n'
  + '      <remove fileExtension=".woff2" /><mimeMap fileExtension=".woff2" mimeType="font/woff2" />\n'
  + '      <remove fileExtension=".json" /><mimeMap fileExtension=".json" mimeType="application/json" />\n'
  + '      <remove fileExtension=".js" /><mimeMap fileExtension=".js" mimeType="text/javascript" />\n'
  + '    </staticContent>\n  </system.webServer>\n</configuration>\n');
const relInfo = fs.existsSync(path.join(SRC, 'release.json')) ? readJson(path.join(SRC, 'release.json')) : {};
const epoch = process.env.SOURCE_DATE_EPOCH && /^\d+$/.test(process.env.SOURCE_DATE_EPOCH) ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000) : new Date();
const packedAt = epoch.toISOString().replace(/\.\d+Z$/, 'Z');
let nFiles = 0, nBytes = 0;
for (const f of walk(ed)) { nFiles++; nBytes += fs.statSync(f).size; }
fs.writeFileSync(path.join(ed, 'release.json'), JSON.stringify({
  format: 'cadcraft-edition', version: 1,
  app: slug, name: app.name, edition: 'browser',
  release: label, semver, tag: `${slug}-v${semver}`, zip: zipName,
  packed_at: packedAt,
  from: { build: label, released_at: relInfo.released_at ?? null, git: relInfo.git ?? null },
  license: 'Apache-2.0',
  libs,
  changes_to_copied_files: notes,
  files: nFiles + 1, bytes_before_this_file: nBytes,
  notes: relInfo.notes ?? null,
}, null, 4) + '\n');

// 8. Every library folder carries its license and its source note.
for (const lib of fs.readdirSync(path.join(ed, 'assets/vendor'))) {
  for (const ver of fs.readdirSync(path.join(ed, 'assets/vendor', lib))) {
    const d = path.join(ed, 'assets/vendor', lib, ver);
    if (!fs.readdirSync(d).some((n) => /^(LICEN[CS]E|COPYING)/i.test(n)) || !fs.existsSync(path.join(d, 'SOURCE.txt'))) die(`assets/vendor/${lib}/${ver} has no LICENSE or SOURCE.txt`);
  }
}
if (thirdParty.copyleft.length) console.warn(`edition: not Apache-2.0 compatible, do not publish: ${thirdParty.copyleft.map((r) => r.key).join(', ')}`);
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
console.log(`edition: ${app.name} ${label} → ${path.relative(process.cwd(), ed) || '.'} (${nFiles + 1} files, ${mb(nBytes)})`);

// 9. --zip: one top folder, sorted, every date the build's date, so the same folder gives the same bytes.
if (args.includes('--zip')) {
  const list = walk(ed).map((p) => rel(p, ed)).sort();
  const when = relInfo.released_at ? new Date(relInfo.released_at.replace(' UTC', 'Z').replace(' ', 'T')) : new Date(packedAt);
  const dosTime = ((when.getUTCHours() << 11) | (when.getUTCMinutes() << 5) | (when.getUTCSeconds() >> 1)) & 0xffff;
  const dosDate = (((when.getUTCFullYear() - 1980) << 9) | ((when.getUTCMonth() + 1) << 5) | when.getUTCDate()) & 0xffff;
  const parts = [], central = [];
  let offset = 0;
  for (const f of list) {
    const data = fs.readFileSync(path.join(ed, f));
    const name = Buffer.from(`${top}/${f}`, 'utf8');
    const crc = zlib.crc32(data) >>> 0;
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const store = deflated.length >= data.length;
    const body = store ? data : deflated;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(store ? 0 : 8, 8);
    lh.writeUInt16LE(dosTime, 10); lh.writeUInt16LE(dosDate, 12); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(body.length, 18);
    lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    parts.push(lh, name, body);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(0x0314, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(store ? 0 : 8, 10);
    ch.writeUInt16LE(dosTime, 12); ch.writeUInt16LE(dosDate, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE((0o100644 << 16) >>> 0, 38); ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += lh.length + name.length + body.length;
  }
  if (list.length > 0xffff || offset > 0xffffffff) die('too big for a plain zip (no Zip64 here)');
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(list.length, 8); end.writeUInt16LE(list.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  const zipBuf = Buffer.concat([...parts, cd, end]);
  fs.writeFileSync(path.join(outDir, zipName), zipBuf);
  const sha = crypto.createHash('sha256').update(zipBuf).digest('hex');
  const sums = path.join(outDir, 'SHA256SUMS');
  const lines = fs.existsSync(sums) ? fs.readFileSync(sums, 'utf8').split('\n').filter((l) => l && !l.endsWith('  ' + zipName)) : [];
  lines.push(`${sha}  ${zipName}`);
  fs.writeFileSync(sums, lines.sort((a, b) => a.slice(66).localeCompare(b.slice(66))).join('\n') + '\n');
  console.log(`edition: ${zipName} ${mb(zipBuf.length)} sha256 ${sha}`);
}
