// SPDX-License-Identifier: Apache-2.0
// Super 0.1: every app opened empty in one window, one after another (the same measurement Settings › Measure this computer makes on the owner's
// laptop). Headless Chromium on the VPS: "VPS, capped" — the load average is printed beside it; single timings are ±40 %.
//   node tools/super-test/bench.mjs [--out file.json]
import fs from 'node:fs'; import os from 'node:os'; import { execSync } from 'node:child_process'; import path from 'node:path';
import { start, launch, ROOT } from './serve.mjs';
import { chromium } from '../../node_modules/playwright-core/index.mjs';
const { url, close } = await start({ langs: [''] });
const b = await launch();
await b.close();
// the harness's launch() has no precise-memory flag: start our own with it
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort((a, c) => parseInt(c.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map(s => path.join(cache, build, s)).find(p => fs.existsSync(p));
const marker = 'scbench' + Math.random().toString(36).slice(2, 8);
const br = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--enable-precise-memory-info', '--sc-marker=' + marker] });
// the browser is a tree of processes: the one launched with the marker and everything under it
const rss = () => {
  try {
    const main = execSync(`pgrep -f -- '--sc-marker=${marker}' | head -1`).toString().trim();
    const rows = execSync('ps -eo pid=,ppid=,rss=').toString().trim().split('\n').map(l => l.trim().split(/\s+/).map(Number));
    const kids = new Map(); for (const [pid, ppid, r] of rows) { if (!kids.has(ppid)) kids.set(ppid, []); kids.get(ppid).push([pid, r]); }
    const byPid = new Map(rows.map(([pid, , r]) => [pid, r]));
    let total = 0; const walk = pid => { total += byPid.get(pid) || 0; for (const [k] of kids.get(pid) || []) walk(k); };
    walk(Number(main)); return Math.round(total / 1024);
  } catch { return null; }
};
const page = await (await br.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const uptime = () => execSync('uptime').toString().trim();
const u0 = uptime();
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.waitForTimeout(1500);
const rss0 = rss();
const r = await page.evaluate(() => window.superWindow.bench());
const rss1 = rss();
r.vps = { label: 'VPS, capped', uptimeBefore: u0, uptimeAfter: uptime(), cpus: os.cpus().length, browserRssMBBefore: rss0, browserRssMBAfter: rss1 };
console.log(JSON.stringify(r, null, 1));
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(ROOT, 'tmp/super-test/bench.json');
fs.writeFileSync(out, JSON.stringify(r, null, 1));
await br.close(); close();
