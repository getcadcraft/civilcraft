#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — copies lib/compute (0.7 Track CU: probe, pool, scheduler, BVH, the "Your machine" card) byte for byte into each app
 * that renders: modelcraft/dev/compute/ and bimcraft/dev/compute/ (and probe.js, probe-light.js, report.js only into the shell's
 * public_html/assets/js/compute/ for the light hardware report of the other six apps, 0.7 HW.2), and writes the compute.* words of tools/compute/lang.mjs
 * into both apps' lang/en.json and lang/es-MX.json. Run it after every change to lib/compute (nobody edits a copy);
 * bin/test-compute.mjs fails while a copy differs. Same shape as tools/frame/sync.mjs; every .js/.css/.wasm/.wgsl file under
 * lib/compute is copied, sub-folders included, so a new module needs no edit here. Keep lib/compute flat: AppBuilds' import
 * map versions only files in dev/ and one folder below it, and the copies already live one folder down (dev/compute/).
 *
 *   node tools/compute/sync.mjs [--check] [target …]     targets: modelcraft, bimcraft, shell
 *   --check   change nothing; exit 1 and list what differs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LIB = path.join(ROOT, 'lib/compute');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const COPY_RE = /\.(js|css|wasm|wgsl)$/;
export const TARGETS = {
  modelcraft: path.join(APPS, 'modelcraft/dev/compute'),
  bimcraft: path.join(APPS, 'bimcraft/dev/compute'),
  // 0.7 HW.2: the shell's light hardware report for the six apps without the compute engine (assets/js/app-hardware.js)
  shell: path.join(ROOT, 'public_html/assets/js/compute'),
};
/** Targets that take only some files (and no compute.* words: the shell speaks its own lang files). */
export const ONLY = { shell: ['probe.js', 'probe-light.js', 'report.js'] };

function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, base, out);
    else if (COPY_RE.test(d.name)) out.push(path.relative(base, p));
  }
  return out;
}
export const files = () => walk(LIB);

/** [{ target, file, state: 'ok' | 'differs' | 'missing' | 'stale' }] */
export function compare(names = Object.keys(TARGETS)) {
  const out = [];
  const all = files();
  for (const name of names) {
    const dir = TARGETS[name];
    const list = ONLY[name] || all;
    for (const f of list) {
      const dst = path.join(dir, f);
      if (!fs.existsSync(dst)) { out.push({ target: name, file: f, state: 'missing' }); continue; }
      out.push({ target: name, file: f, state: Buffer.compare(fs.readFileSync(path.join(LIB, f)), fs.readFileSync(dst)) === 0 ? 'ok' : 'differs' });
    }
    for (const f of walk(dir)) if (!list.includes(f)) out.push({ target: name, file: f, state: 'stale' });
  }
  return out;
}

/** compute.* words: replace values in place, add missing keys at the end, drop ones the table no longer has. */
export async function words(names, check) {
  const { EN, ES } = await import('./lang.mjs');
  const changed = [];
  for (const name of names) {
    if (ONLY[name]) continue;
    for (const [loc, table] of [['en', EN], ['es-MX', ES]]) {
      const file = path.join(TARGETS[name], '..', 'lang', loc + '.json');
      const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const stale = Object.keys(obj).filter((k) => k.startsWith('compute.') && !(k in table));
      if (!stale.length && Object.entries(table).every(([k, v]) => same(obj[k], v))) continue;
      const out = {};
      for (const [k, v] of Object.entries(obj)) if (!stale.includes(k)) out[k] = k in table ? table[k] : v;
      for (const [k, v] of Object.entries(table)) if (!(k in out)) out[k] = v;
      if (!check) fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
      changed.push(name + ' ' + loc + '.json');
    }
  }
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const names = args.filter((a) => !a.startsWith('--'));
  for (const n of names) if (!TARGETS[n]) { console.error(n + ': not a target (' + Object.keys(TARGETS).join(', ') + ')'); process.exit(2); }
  const targets = names.length ? names : Object.keys(TARGETS);
  let diff = 0;
  for (const w of await words(targets, check)) { diff++; console.log(w + ': ' + (check ? 'compute.* words differ' : 'compute.* words written')); }
  const rows = compare(targets);
  for (const name of targets) {
    const mine = rows.filter((r) => r.target === name && r.state !== 'ok');
    if (!mine.length) { console.log(name + ': ok (' + (ONLY[name] || files()).length + ' files)'); continue; }
    diff++;
    if (!check) {
      for (const r of mine) {
        const dst = path.join(TARGETS[name], r.file);
        if (r.state === 'stale') { fs.unlinkSync(dst); try { fs.rmdirSync(path.dirname(dst)); } catch { /* not empty, or the target itself */ } }
        else { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(path.join(LIB, r.file), dst); }
      }
    }
    console.log(name + ': ' + (check ? 'differs — ' : 'updated — ') + mine.map((r) => r.file + ' (' + r.state + ')').join(', '));
  }
  process.exit(check && diff ? 1 : 0);
}
