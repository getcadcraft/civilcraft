#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * tools/gpu-remote/timings.mjs — how long workstation11a runs take, for scheduling (owner 2026-11-22: "we need to know how long they take so they
 * can be properly scheduled"). run.sh appends one line per run to tmp/gpu-runs/timings.jsonl: copy, lock wait (other jobs ahead: one job at a
 * time), display-GPU wait (the owner's desktop busy), run time, exit (124 = hit --timeout).
 *
 *   node tools/gpu-remote/timings.mjs                 per test: runs, median/max lock wait, median/max run time, timeouts
 *   node tools/gpu-remote/timings.mjs --recent 20     the last 20 runs, one line each
 *   node tools/gpu-remote/timings.mjs --backfill      rebuild lines for older runs from their run.log folders (no lock/run split before 2026-11-22:
 *                                                     queue = folder made -> "== <test> on WORKSTATION11A" line, run = that line -> run.log written)
 *   node tools/gpu-remote/timings.mjs --json          the per-test table as JSON
 */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DIR = path.join(ROOT, 'tmp/gpu-runs'), LOG = path.join(DIR, 'timings.jsonl');
const arg = (k) => process.argv.includes(k);
const rows = () => (fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const mmss = (s) => (s == null ? '—' : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}`);
const med = (a) => { const b = a.filter((x) => x != null).sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : null; };
const max = (a) => { const b = a.filter((x) => x != null); return b.length ? Math.max(...b) : null; };

if (arg('--backfill')) {
  const have = new Set(rows().map((r) => r.session + '/' + r.stamp));
  let added = 0;
  for (const sess of fs.readdirSync(DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    for (const stamp of fs.readdirSync(path.join(DIR, sess))) {
      const f = path.join(DIR, sess, stamp, 'run.log');
      if (have.has(sess + '/' + stamp) || !fs.existsSync(f) || !/^\d{8}-\d{6}$/.test(stamp)) continue;
      const txt = fs.readFileSync(f, 'utf8');
      const m = txt.match(/^== (\S+) on WORKSTATION11A, (\d{4}-\d\d-\d\dT[\d:]+Z)/m);
      if (!m) continue;
      const t0 = Date.parse(stamp.replace(/(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)(\d\d)/, '$1-$2-$3T$4:$5:$6Z')) / 1000;
      const ts = Date.parse(m[2]) / 1000, te = Math.round(fs.statSync(f).mtimeMs / 1000);
      const ex = txt.match(/^== exit (\d+)/m);
      fs.appendFileSync(LOG, JSON.stringify({ session: sess, stamp, test: m[1], args: '', exit: ex ? +ex[1] : null, backfilled: true,
        copy_s: null, lock_wait_s: Math.max(0, Math.round(ts - t0)), gpu_wait_s: null, run_s: Math.max(0, te - ts), total_s: Math.max(0, te - t0), timed_out: ex ? +ex[1] === 124 : false }) + '\n');
      added++;
    }
  }
  console.log(`backfilled ${added} run(s) into ${path.relative(ROOT, LOG)}`);
  process.exit(0);
}
const all = rows();
if (arg('--recent')) {
  const n = +process.argv[process.argv.indexOf('--recent') + 1] || 20;
  for (const r of all.slice(-n)) console.log(`${r.stamp}  ${r.session.padEnd(28)} ${path.basename(r.test).padEnd(28)} wait ${mmss(r.lock_wait_s).padStart(6)}  run ${mmss(r.run_s).padStart(6)}  exit ${r.exit}${r.timed_out ? ' TIMEOUT' : ''}`);
  process.exit(0);
}
const by = new Map();
for (const r of all) { const k = r.test; if (!by.has(k)) by.set(k, []); by.get(k).push(r); }
const table = [...by].map(([test, rs]) => ({ test, runs: rs.length, wait_med: med(rs.map((r) => r.lock_wait_s)), wait_max: max(rs.map((r) => r.lock_wait_s)),
  run_med: med(rs.map((r) => r.run_s)), run_max: max(rs.map((r) => r.run_s)), timeouts: rs.filter((r) => r.timed_out).length })).sort((a, b) => (b.run_max ?? 0) - (a.run_max ?? 0));
if (arg('--json')) { console.log(JSON.stringify(table, null, 1)); process.exit(0); }
console.log(`${'test'.padEnd(64)} runs   wait med/max     run med/max   timeouts`);
for (const t of table) console.log(`${t.test.slice(-64).padEnd(64)} ${String(t.runs).padStart(4)}  ${mmss(t.wait_med).padStart(6)} / ${mmss(t.wait_max).padEnd(6)}  ${mmss(t.run_med).padStart(6)} / ${mmss(t.run_max).padEnd(6)} ${t.timeouts || ''}`);
const tot = all.reduce((a, r) => a + (r.run_s || 0), 0), wt = all.reduce((a, r) => a + (r.lock_wait_s || 0), 0);
console.log(`\n${all.length} runs: ${mmss(tot)} running, ${mmss(wt)} waiting for the lock (sum over runs; waits overlap)`);
