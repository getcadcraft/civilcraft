#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Runs every SuperCad Studio suite, one at a time, and prints a summary table (SC.8).
//   node tools/super-test/run-all.mjs [--only substr] [--skip substr] [--live] [--timeout 300] [--verbose]
// Suites: bin/test-super-*.mjs, bin/test-super-*.php, tools/super-test/*.mjs. Left out on purpose:
//   serve.mjs (the harness), bench.mjs (a measurement, not a test), teams-sync-live.mjs and teams-sync-lab.mjs
//   (they talk to the real site and make a throwaway account: only with --live).
// A suite's counts are read from its "N passed, M failed"-style last lines when it prints them.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i === -1 ? null : args[i + 1]; };
const only = opt('--only'), skip = opt('--skip'), live = args.includes('--live'), verbose = args.includes('--verbose');
const timeout = (Number(opt('--timeout')) || 300) * 1000;
const NOT_SUITES = new Set(['serve.mjs', 'bench.mjs', 'run-all.mjs']);
const LIVE = new Set(['teams-sync-live.mjs', 'teams-sync-lab.mjs']);

const suites = [];
for (const f of fs.readdirSync(path.join(ROOT, 'bin')).sort()) if (/^test-super-.*\.(mjs|php)$/.test(f)) suites.push('bin/' + f);
for (const f of fs.readdirSync(path.join(ROOT, 'tools/super-test')).sort()) if (f.endsWith('.mjs') && !NOT_SUITES.has(f) && (live || !LIVE.has(f))) suites.push('tools/super-test/' + f);
const list = suites.filter((s) => (!only || s.includes(only)) && (!skip || !s.includes(skip)));

function counts(out) {
  let pass = null, fail = null;
  for (const line of out.split('\n').reverse()) {
    let m = line.match(/(\d+)\s+pass(?:ed)?\D+(\d+)\s+fail/i) || line.match(/pass(?:ed)?\D{0,3}(\d+)\D+fail(?:ed)?\D{0,3}(\d+)/i);
    if (m) { pass = +m[1]; fail = +m[2]; break; }
    m = line.match(/(\d+)\s*\/\s*(\d+)\s+pass/i);
    if (m) { pass = +m[1]; fail = +m[2] - +m[1]; break; }
  }
  return { pass, fail };
}

const rows = [];
for (const s of list) {
  const t0 = Date.now();
  const cmd = s.endsWith('.php') ? 'php' : 'node';
  const r = spawnSync(cmd, [path.join(ROOT, s)], { cwd: ROOT, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  const c = counts(out);
  const timedOut = r.error && r.error.code === 'ETIMEDOUT';
  const status = timedOut ? 'TIMEOUT' : (r.status === 0 && !c.fail ? 'ok' : 'FAIL');
  const lines = out.split('\n').map((l) => l.trim()).filter(Boolean);
  const first = status === 'ok' ? '' : (lines.find((l) => /FAIL|Error|error|not ok/.test(l)) || lines[0] || '').slice(0, 160);
  rows.push({ s, status, pass: c.pass, fail: c.fail, secs: ((Date.now() - t0) / 1000).toFixed(1), first });
  console.log(`${status.padEnd(7)} ${s}  ${c.pass ?? '?'} pass / ${c.fail ?? '?'} fail  ${rows.at(-1).secs}s${first ? '\n          ' + first : ''}`);
  if (verbose && status !== 'ok') console.log(out.split('\n').slice(-15).join('\n'));
}
console.log('\n| suite | status | pass | fail | secs |\n|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.s} | ${r.status} | ${r.pass ?? '?'} | ${r.fail ?? '?'} | ${r.secs} |`);
const bad = rows.filter((r) => r.status !== 'ok');
console.log(`\n${rows.length} suites, ${rows.length - bad.length} ok, ${bad.length} not ok`);
for (const r of bad) console.log(`  ${r.status} ${r.s}: ${r.first}`);
process.exit(bad.length ? 1 : 0);
