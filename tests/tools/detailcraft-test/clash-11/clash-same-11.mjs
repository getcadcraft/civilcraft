#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/clash-11/clash-same-11.mjs (0.11 PERF.36): the clash check of the lab (dev) against the release (0.10) on the same model,
 * same machine, one app per child process: the time of clashCheck (and of its parts: the solids, the grid's pairs) and the WHOLE result compared as
 * JSON (every clash with its parts, depth and point, the pair count and the solid count; at tolerance 1, 0 and 5 mm and with phase 1 only). A file over readModel's 20,000 cap is measured whole, as
 * perf-11.mjs does. With --perf it then runs ../perf-11.mjs on each file (an edit's change + build + marks, undo, the Tx lookups, clash).
 *   node tools/detailcraft-test/clash-11/clash-same-11.mjs --file <model.json> [--file ...] [--root <dir with 0.10/ and dev/>] [--runs 3] [--perf] [--out <dir>]
 * Make a model with clashes of every kind with make-clash-model.mjs. Big models: workstation11a (tools/gpu-remote/run.sh --wsl).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = arg('--root', path.resolve(here, '../../../public_html/assets/apps/detailcraft'));
const RUNS = Number(arg('--runs', 3));
const OUT = arg('--out', path.resolve(here, '../../../tmp/clash-11'));

async function one(app, file, dump) {
  const dir = path.join(ROOT, app) + '/';
  const mod = (f) => import(pathToFileURL(dir + f).href);
  const I = await mod('i18n.js');
  I.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(dir + 'lang/en.json', 'utf8')) });
  const [Md, B, K] = await Promise.all([mod('model.js'), mod('build.js'), mod('clash.js')]);
  const text = fs.readFileSync(file, 'utf8');
  const r = Md.readModel(text), state = r.state || r, raw = JSON.parse(text);
  if (raw.members.length > state.members.length) { state.members = raw.members; state.connections = raw.connections; }
  const built = B.build(state, {});
  const out = { app, machine: os.hostname() + ' ' + os.cpus()[0].model + ' x' + os.cpus().length, load: os.loadavg().map((x) => Math.round(x * 10) / 10), members: state.members.length, parts: built.parts.length, footings: state.footings.length };
  let t = performance.now(); const S = K.solids(state, built, null); out.solids_ms = Math.round(performance.now() - t);
  t = performance.now(); out.pairs_grid = K.solidIndex(S, { margin: 2 }).pairs().length; out.pairs_ms = Math.round(performance.now() - t);
  const times = []; let res;
  for (let i = 0; i < (app === '0.10' ? 1 : RUNS); i++) { t = performance.now(); res = K.clashCheck(state, built); times.push(Math.round(performance.now() - t)); }
  out.clash_ms = times.sort((a, b) => a - b)[Math.floor(times.length / 2)]; out.clash_all = times;
  out.clashes = res.clashes.length; out.pairs = res.pairs; out.checked = res.checked;
  const kinds = {}; for (const c of res.clashes) { const k = c.kind + ' ' + c.a.kind + '-' + c.b.kind; kinds[k] = (kinds[k] || 0) + 1; } out.kinds = kinds;
  // other tolerances and a phase filter: the cached section points are per tolerance, the solids per phase set
  const more = [{ tol: 0 }, { tol: 5 }, { tol: 1, phases: new Set([1]) }].map((o) => { const x = K.clashCheck(state, built, o); return { o: { tol: o.tol, phases: o.phases ? [...o.phases] : null }, clashes: x.clashes, pairs: x.pairs, checked: x.checked }; });
  out.more = more.map((m) => m.clashes.length);
  fs.writeFileSync(dump, JSON.stringify({ clashes: res.clashes, pairs: res.pairs, checked: res.checked, more }));
  console.log(JSON.stringify(out));
}

if (process.argv.includes('--one')) { await one(arg('--one'), arg('--file'), arg('--dump')); process.exit(0); }
fs.mkdirSync(OUT, { recursive: true });
const files = process.argv.filter((a, i) => process.argv[i - 1] === '--file');
let pass = 0, fail = 0;
const report = [];
for (const file of files) {
  const name = path.basename(file), row = { file: name };
  for (const app of ['0.10', 'dev']) {
    const dump = path.join(OUT, `${name}.${app}.clashes.json`);
    const r = spawnSync(process.execPath, ['--max-old-space-size=8000', process.argv[1], '--one', app, '--file', file, '--dump', dump, '--root', ROOT, '--runs', String(RUNS)], { encoding: 'utf8', maxBuffer: 1e8 });
    try { row[app] = JSON.parse((r.stdout || '').trim().split('\n').pop()); }
    catch { console.log(app, 'ERROR', (r.stderr || '').split('\n').slice(0, 4).join(' | ').slice(0, 400)); row[app] = null; }
  }
  const a = row['0.10'], b = row.dev;
  if (a && b) {
    const same = fs.readFileSync(path.join(OUT, `${name}.0.10.clashes.json`), 'utf8') === fs.readFileSync(path.join(OUT, `${name}.dev.clashes.json`), 'utf8');
    row.same = same; if (same) pass++; else fail++;
    console.log(`${name}: ${a.members} members, ${a.parts} parts, ${a.footings} footings, ${a.checked} solids; ${a.clashes} clashes (${JSON.stringify(a.kinds)}) from ${a.pairs} pairs; at tol 0 / 5 / phase 1: ${a.more.join(' / ')}`);
    console.log(`  clashCheck 0.10 ${a.clash_ms} ms, lab ${b.clash_ms} ms (${b.clash_all.join(', ')}); grid pairs ${a.pairs_ms} → ${b.pairs_ms} ms; result ${same ? 'IDENTICAL' : 'DIFFERENT'}; ${b.machine}; load ${b.load.join('/')}`);
  }
  report.push(row);
  if (process.argv.includes('--perf')) {
    const r = spawnSync(process.execPath, [path.resolve(here, '../perf-11.mjs'), '--file', file, '--root', ROOT, '--out', path.join(OUT, `${name}.perf-11.json`)], { encoding: 'utf8', maxBuffer: 1e8 });
    console.log((r.stdout || '').trim() + (r.status ? '\n' + (r.stderr || '').slice(0, 400) : ''));
  }
}
fs.writeFileSync(path.join(OUT, 'clash-same-11.json'), JSON.stringify(report, null, 1));
console.log(`\n${pass} identical, ${fail} different`);
process.exit(fail ? 1 : 0);
