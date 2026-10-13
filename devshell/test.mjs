#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — run this app's tests from a clean clone (`npm test`; 0.4 item 0.8, docs/DEVSHELL.md). Node 20.19+
 * (the app's .js files are ES modules without a "type": "module", so Node must detect them).
 *
 *   npm test                       every tests/bin/test-*.mjs, Node only (no browser, no website)
 *   npm test -- --only test-x.mjs  one file;   -- --offline  never download;   -- --no-python;   -- --list
 *   npm test -- --oracles          also the copyleft reference readers some checks compare against (LibreDWG, web-ifc,
 *                                  occt-import-js; test-only black boxes, never part of the app — PROVENANCE.md)
 *
 * Steps: (1) the libraries the app and its tests use, by exact version (devshell/fetch-vendor.mjs, sha256-checked);
 * (2) .cc-test/ — a copy of tests/ laid out like the getcadcraft.com repo the tests were written in, with the app,
 * the libraries, the shared shell and fixtures/ linked in, so the tests run unchanged; (3) npm packages a test folder
 * declares (tools/<x>/package.json, installed once into .cc-test) and Python packages (tools/<x>/requirements.txt →
 * tools/<x>/venv; --no-python skips); (4) each test file in turn; a summary; exit 1 if any failed. LibreOffice and the
 * ODA converter are not installed here: the tests say what they skip.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fetchVendor } from './fetch-vendor.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MIRROR = path.join(ROOT, '.cc-test');
const META = JSON.parse(fs.readFileSync(path.join(HERE, 'app.json'), 'utf8'));
const SLUG = META.app.slug;
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const OFFLINE = args.includes('--offline');
const ORACLES = args.includes('--oracles');
/** npm packages that are copyleft reference readers: installed only with --oracles (0.4 part 2, L.5). */
const COPYLEFT_NPM = { 'web-ifc': 'MPL-2.0', 'occt-import-js': 'LGPL-2.1', '@mlightcad/libredwg-web': 'GPL-3.0' };

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const n of fs.readdirSync(from)) {
    const a = path.join(from, n), b = path.join(to, n);
    if (fs.statSync(a).isDirectory()) copyTree(a, b);
    else if (!fs.existsSync(b) || fs.statSync(b).mtimeMs < fs.statSync(a).mtimeMs || fs.statSync(b).size !== fs.statSync(a).size) fs.copyFileSync(a, b);
  }
}
function link(target, at) {
  fs.mkdirSync(path.dirname(at), { recursive: true });
  try { fs.rmSync(at, { recursive: true, force: true }); } catch {}
  fs.symlinkSync(path.relative(path.dirname(at), target), at);
}

export function buildMirror() {
  const vj = JSON.parse(fs.readFileSync(path.join(HERE, 'vendor.json'), 'utf8'));
  const vend = { ...vj.libs, ...(ORACLES ? vj.oracles || {} : {}) };
  for (const d of ['bin', 'tools', 'lib']) if (fs.existsSync(path.join(ROOT, 'tests', d))) copyTree(path.join(ROOT, 'tests', d), path.join(MIRROR, d));
  // The app is copied, not linked: modules that find vendor/ by a relative path from their own location
  // (../../../vendor/…) must resolve inside the mirror, and Node follows symlinks to the real file.
  const appDir = path.join(MIRROR, 'public_html/assets/apps', SLUG, 'dev');
  fs.rmSync(appDir, { recursive: true, force: true });
  copyTree(path.join(ROOT, 'app'), appDir);
  for (const d of fs.readdirSync(path.join(HERE, 'site/assets'))) {
    if (d === 'vendor') continue;
    link(path.join(HERE, 'site/assets', d), path.join(MIRROR, 'public_html/assets', d));
  }
  link(path.join(HERE, 'site/core'), path.join(MIRROR, 'public_html/core'));
  for (const f of fs.readdirSync(path.join(HERE, 'site'))) if (/^favicon/.test(f)) link(path.join(HERE, 'site', f), path.join(MIRROR, 'public_html', f));
  for (const [lib, v] of Object.entries(vend)) {
    const dir = path.join(HERE, 'vendor', lib, v.version);
    fs.mkdirSync(dir, { recursive: true });
    link(dir, path.join(MIRROR, 'public_html/assets/vendor', lib, v.version));
    const cur = path.join(MIRROR, 'public_html/assets/vendor', lib, 'current');   // current → "<version>", as on the site
    try { fs.rmSync(cur, { force: true }); } catch {}
    fs.symlinkSync(v.version, cur);
  }
  if (fs.existsSync(path.join(ROOT, 'fixtures'))) link(path.join(ROOT, 'fixtures'), path.join(MIRROR, 'fixtures'));
  fs.mkdirSync(path.join(MIRROR, 'tmp'), { recursive: true });
}

function npmInstall() {
  const tools = path.join(MIRROR, 'tools');
  if (!fs.existsSync(tools)) return [];
  const out = [];
  for (const d of fs.readdirSync(tools)) {
    const dir = path.join(tools, d);
    if (!fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, 'node_modules'))) continue;
    if (OFFLINE) { out.push(`${d}: npm packages not installed (--offline)`); continue; }
    const pj = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    const cl = Object.keys({ ...pj.dependencies, ...pj.devDependencies }).filter((n) => COPYLEFT_NPM[n]);
    if (cl.length && !ORACLES) { out.push(`${d}: not installed — needs ${cl.map((n) => `${n} (${COPYLEFT_NPM[n]})`).join(', ')}, a test-only reference reader; run npm test -- --oracles to include it`); continue; }
    console.log(`npm install in tests/tools/${d} …`);
    const lock = fs.existsSync(path.join(dir, 'package-lock.json'));
    const r = spawnSync('npm', [lock ? 'ci' : 'install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: dir, stdio: 'inherit' });
    if (r.status !== 0) out.push(`${d}: npm ${lock ? 'ci' : 'install'} failed`);
  }
  return out;
}

/** tools/<x>/requirements.txt → tools/<x>/venv (python3 -m venv + pip install -r), once. --no-python skips. */
function pythonVenvs() {
  const tools = path.join(MIRROR, 'tools');
  if (!fs.existsSync(tools) || args.includes('--no-python')) return [];
  const out = [];
  for (const d of fs.readdirSync(tools)) {
    const dir = path.join(tools, d), req = path.join(dir, 'requirements.txt');
    if (!fs.existsSync(req) || fs.existsSync(path.join(dir, 'venv/bin/python'))) continue;
    if (OFFLINE) { out.push(`${d}: Python packages not installed (--offline)`); continue; }
    console.log(`python venv in tests/tools/${d} …`);
    const mk = spawnSync('python3', ['-m', 'venv', path.join(dir, 'venv')], { stdio: 'inherit' });
    if (mk.status !== 0) { out.push(`${d}: python3 -m venv failed (install python3-venv), its checks are skipped`); continue; }
    const pip = spawnSync(path.join(dir, 'venv/bin/pip'), ['install', '-q', '-r', req], { stdio: 'inherit' });
    if (pip.status !== 0) out.push(`${d}: pip install -r requirements.txt failed`);
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tests = fs.existsSync(path.join(ROOT, 'tests/bin')) ? fs.readdirSync(path.join(ROOT, 'tests/bin')).filter((f) => /^test-.*\.mjs$/.test(f)).sort() : [];
  const only = opt('--only');
  const run = only ? tests.filter((t) => t === only || t === only + '.mjs') : tests;
  if (args.includes('--list')) { console.log(run.join('\n') || '(no tests)'); process.exit(0); }
  if (!run.length) { console.log('No tests in tests/bin.'); process.exit(only ? 1 : 0); }

  const problems = [];
  if (!OFFLINE) {
    const v = await fetchVendor({ quiet: false, oracles: ORACLES });
    console.log(`libraries: ${v.fetched} fetched, ${v.kept} already here`);
    for (const f of v.failed) problems.push('library: ' + f);
  }
  buildMirror();
  problems.push(...npmInstall());
  problems.push(...pythonVenvs());

  const results = [];
  for (const t of run) {
    console.log(`\n▶ ${t}`);
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [path.join(MIRROR, 'bin', t)], { cwd: MIRROR, stdio: 'inherit', env: { ...process.env, CC_DEVSHELL: '1' } });
    results.push({ t, code: r.status ?? 1, s: ((Date.now() - t0) / 1000).toFixed(1) });
  }
  console.log('\n' + results.map((r) => `${r.code === 0 ? 'pass' : 'FAIL'}  ${r.t}  (${r.s} s)`).join('\n'));
  for (const p of problems) console.log('note  ' + p);
  const failed = results.filter((r) => r.code !== 0).length;
  console.log(`${results.length - failed} of ${results.length} test files passed`);
  process.exit(failed ? 1 : 0);
}
