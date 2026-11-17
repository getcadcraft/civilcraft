// SPDX-License-Identifier: Apache-2.0
/**
 * Screenshot one /admin page as the test admin (tools/cadcraft-test/admin.php, tag "shots": up → session → down).
 *   node tools/cadcraft-test/shot-admin-page.mjs /admin/cdn-links out.png [--dark] [--width=1440] [--mobile]
 * Run as root. Prints console errors and failed requests, so it doubles as a quick page check.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [url, out, ...flags] = process.argv.slice(2);
if (!url || !out) { console.error('usage: shot-admin-page.mjs <path> <out.png> [--dark] [--width=N] [--mobile]'); process.exit(2); }
const width = flags.includes('--mobile') ? 390 : parseInt((flags.find((f) => f.startsWith('--width=')) || '--width=1440').slice(8), 10);
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const php = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, cmd, 'shots'], { encoding: 'utf8' }));
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
php('up');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
try {
  const s = php('session');
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: flags.includes('--dark') ? 'dark' : 'light' });
  await ctx.addCookies([{ name: s.name, value: s.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console error: ' + m.text()); });
  page.on('requestfailed', (r) => console.log('request failed: ' + r.url()));
  const res = await page.goto('https://getcadcraft.com' + url, { waitUntil: 'networkidle' });
  console.log('HTTP ' + res.status() + ' ' + page.url());
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log('sideways scroll: ' + over + 'px');
  await page.screenshot({ path: out, fullPage: flags.includes('--full') });
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'shots']); } catch {}
}
