/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-harness.mjs — the shared start-up for PartCraft's per-area browser checks (tools/partcraft-test/browser-<area>.mjs).
 * Headless Chromium at https://getcadcraft.com/lab/partcraft (mapped to 127.0.0.1), the staff session from a state
 * file (signs the test admin in only when the saved session is gone: `sudo -u www-data php tools/partcraft-test/admin.php up`).
 * It never runs `admin.php down`: the admin and the state file are shared by everyone running checks.
 *
 *   import { startHarness } from './browser-harness.mjs';
 *   const h = await startHarness({ state, out });   // page open, both kernels ready
 *   exact: true (default) turns the exact kernel on through the developer override (localStorage partcraft.exactKernel →
 *   the vendored OpenCascade, a test-only oracle since 0.4 K.2); false = what 0.4 ships, the mesh kernel alone.
 *   await run(h);  …  await h.finish();             // prints "N passed, M failed", exits 1 on a failure
 * h = { page, ctx, browser, BASE, OUT, F (fixtures), ok, near, nearRel, pc(fn, arg), built(), tool(cmd), shot(name),
 *       statusText(), problems (console errors / page errors so far), open(url?) }
 * browser.mjs builds the same object from its own helpers, so an area's run(h) works in both.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
export const BASE = 'https://getcadcraft.com';
export const DEFAULT_STATE = '/tmp/claude-0/pc-browser-state.json';

/** The developer override that gives a page the exact kernel (exact-client.js EXACT_KERNEL_KEY), or null when OpenCascade is
 *  not in this checkout (a clone without the test-only oracles). */
export const OCCT_URL = '/assets/vendor/replicad-opencascadejs/current/replicad_single.js';
export const haveOcct = () => fs.existsSync(path.join(REPO, 'public_html', OCCT_URL));
export const exactInit = (ctx) => ctx.addInitScript((u) => { try { localStorage.setItem('partcraft.exactKernel', u); } catch { /* no storage */ } }, OCCT_URL);

export async function startHarness({ state = DEFAULT_STATE, out = path.join(REPO, 'tmp/shots/partcraft'), width = 1440, height = 900, exact = process.env.PC_EXACT !== '0' } = {}) {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(path.dirname(state), { recursive: true });
  const F = await import('./fixtures.mjs');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const { chromium } = await import('playwright-core');
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, ...(fs.existsSync(state) ? { storageState: state } : {}) });
  if (exact) await exactInit(ctx);
  else await ctx.addInitScript(() => { try { localStorage.removeItem('partcraft.exactKernel'); } catch { /* no storage */ } });
  // 0.7 WS.14: PC_WORKSPACE=docked|toolbox runs the checks with that layout on (Settings › Global › Layout); unset = classic
  const layout = process.env.PC_WORKSPACE || 'standard';
  await ctx.addInitScript((v) => { try { if (v === 'standard') localStorage.removeItem('cc-workspace'); else localStorage.setItem('cc-workspace', v); } catch { /* no storage */ } }, layout);
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  const pc = (fn, a) => page.evaluate(fn, a);
  async function open(url = '/lab/partcraft') {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    if (/\/(admin\/)?login\b/.test(new URL(page.url()).pathname)) {
      const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'up'], { encoding: 'utf8' }));
      await page.fill('input[name="email"]', admin.email);
      await page.fill('input[name="password"]', admin.password);
      await Promise.all([page.waitForNavigation(), page.click('form:has(input[name="password"]) button[type="submit"]:not([name="space"])')]);
      await ctx.storageState({ path: state });
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
    }
    await page.waitForFunction(() => window.partcraft && window.partcraft.regen, null, { timeout: 30000 });
    if (exact) await page.evaluate(() => window.partcraft.exactReady());
    else await page.evaluate(() => window.partcraft.built());
  }
  const h = {
    page, ctx, browser, BASE, OUT: out, F, ok, problems, pc, open,
    near: (a, b, tol) => Math.abs(a - b) <= tol,
    nearRel: (a, b, rel = 2e-6) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)),
    built: () => page.evaluate(() => window.partcraft.built()),
    tool: (cmd) => page.click(`.pc-tools [data-cmd="${cmd}"]`),
    shot: async (name) => { await page.waitForTimeout(150); await page.screenshot({ path: path.join(out, name + '.png') }); },
    statusText: () => page.textContent('[data-status]'),
    async finish() {
      await browser.close();
      console.log(`\n${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    },
    async failed(err) {
      fail++;
      console.log('  FAIL ' + (err && err.stack ? err.stack : err));
      if (problems.length) console.log('    ' + problems.join('\n    '));
      await page.screenshot({ path: path.join(out, 'zz-failure.png') }).catch(() => {});
    },
  };
  await open();
  return h;
}

/** argv helpers for a standalone browser-<area>.mjs: --state <file> (default the shared one), --out <dir>. */
export const cliArgs = () => {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  return { state: arg('--state', DEFAULT_STATE), out: arg('--out', path.join(REPO, 'tmp/shots/partcraft')) };
};
