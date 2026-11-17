// SPDX-License-Identifier: Apache-2.0
/**
 * lab-page.mjs: one way to open an app's /lab page in headless Chromium for the shell's browser tests (2026-11-11, bk-shell-10).
 *   const lab = await openLab('bkshell');                 a staff session + one browser (run as root; one browser at a time)
 *   const { ctx, page, errors } = await lab.page(slug, { viewport, layout, storage: {key: value}, prepare: true });
 *       layout: a built-in layout id or 'standard' (classic); storage: localStorage set before the page's own scripts;
 *       the first-run offers (layout fit, "new here", tours) are answered "no" so they never cover the page under test;
 *       prepare: run the app's document hook (tools/workspace-test/apps/<slug>.mjs prepare) so tools are live.
 *   await lab.close();
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PUB = path.join(REPO, 'public_html');
export const manifestOf = (slug) => JSON.parse(fs.readFileSync(path.join(PUB, 'assets/apps', slug, 'dev/manifest.json'), 'utf8'));
export const BUILTIN = fs.readdirSync(path.join(PUB, 'assets/workspaces')).filter((f) => f.endsWith('.ccworkspace.json')).map((f) => f.replace('.ccworkspace.json', ''));
/** The built-in layouts an app's dev build lists, in its own order. */
export const layoutsOf = (slug) => { const w = manifestOf(slug).workspaces; return (Array.isArray(w) ? w : w?.layouts || []).filter((x) => BUILTIN.includes(x)); };

export async function openLab(label = 'shelltest') {
  const { chromium } = await import('playwright-core');
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
  const admin = path.join(REPO, 'tools/cadcraft-test/admin.php');
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', admin, 'session', label], { encoding: 'utf8' }));
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  return {
    browser,
    async page(slug, { viewport = { width: 1920, height: 1080 }, layout = 'standard', storage = {}, prepare = true } = {}) {
      const ctx = await browser.newContext({ viewport, serviceWorkers: 'block', acceptDownloads: true });
      await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
      await ctx.addInitScript(([layout, storage]) => {
        try {
          if (sessionStorage.getItem('lab-page-set')) return;   // once per tab: a reload keeps what the page stored since
          sessionStorage.setItem('lab-page-set', '1');
          localStorage.setItem('cc-fit', 'never'); localStorage.setItem('cc-newhere', 'skipped'); localStorage.setItem('cc-tours', 'off');
          if (layout && layout !== 'standard') localStorage.setItem('cc-workspace', layout);
          for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
        } catch (e) { /* private mode */ }
      }, [layout, storage]);
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
      await page.goto('https://getcadcraft.com/lab/' + slug, { waitUntil: 'networkidle' });
      if (layout !== 'standard') await page.waitForFunction((l) => document.querySelector('main')?.dataset.wsLayout === l, layout, { timeout: 20000 }).catch(() => {});
      if (prepare) {
        const hooks = await import(pathToFileURL(path.join(REPO, 'tools/workspace-test/apps', slug + '.mjs')).href).catch(() => ({}));
        if (hooks.prepare) await hooks.prepare(page);
        await page.waitForTimeout(800);
      }
      return { ctx, page, errors };
    },
    async close() { await browser.close(); try { execFileSync('sudo', ['-u', 'www-data', 'php', admin, 'down', label]); } catch (e) { /* re-enabled next run */ } },
  };
}
