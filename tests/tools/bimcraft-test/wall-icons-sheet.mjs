#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-icons-sheet.mjs — a check sheet of the DU.1 wall icons (0.9 WT.1; session walls-join-10): every `wall*` drawing of the CadCraft icon set
 * (assets/js/app-workspace-icons.js) at 16, 20 and 24 px, in the Full colour and the Outline style, on the real /lab/bimcraft page so the theme's own
 * colours apply; once in the light (paper) and once in the dark (model) theme. Nothing is changed; two PNG files are written.
 *   nice -n 10 timeout 300 node tools/bimcraft-test/wall-icons-sheet.mjs [<out dir>]      run as root (a test admin session); default docs/0.9-sessions
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || path.join(REPO, 'docs/0.9-sessions');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimwicons'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let count = 0;
try {
  for (const space of ['paper', 'model']) {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
    await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
    const page = await ctx.newPage();
    await page.goto('https://getcadcraft.com/lab/bimcraft?space=' + space, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.ccIconSet?.node, null, { timeout: 60000 });
    count = await page.evaluate((space) => {
      const keys = window.ccIconSet.keys.filter((k) => /^wall/.test(k));
      const box = document.createElement('div');
      box.id = 'wall-icon-sheet';
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:var(--sheet,#fff);color:var(--ink,#000);font:12px/1.2 system-ui,sans-serif;padding:14px 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px 26px;align-content:start;overflow:hidden';
      const head = document.createElement('div');
      head.style.cssText = 'grid-column:1/-1;font-weight:600;margin-bottom:6px';
      head.textContent = 'DU.1 wall icons, ' + keys.length + ' drawings: Full colour at 16 / 20 / 24 px, then Outline at 16 / 20 / 24 px (' + (space === 'paper' ? 'light' : 'dark') + ' theme)';
      box.append(head);
      const outline = '--ic-a:none;--ic-b:none;--ic-c:none;--ic-d:none;--ic-e:none;--ic-paper:none;--ic-line:var(--cc-icon-color,#1b7fb5);--ic-s1:var(--ic-line);--ic-s2:var(--ic-line)';
      for (const k of keys) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;height:28px';
        const name = document.createElement('span'); name.textContent = k; name.style.cssText = 'flex:0 0 108px';
        row.append(name);
        for (const style of ['', outline]) {
          const g = document.createElement('span'); g.style.cssText = 'display:flex;align-items:center;gap:8px;' + style;
          for (const px of [16, 20, 24]) { const n = window.ccIconSet.node(k); n.style.cssText = 'width:' + px + 'px;height:' + px + 'px'; g.append(n); }
          row.append(g);
        }
        box.append(row);
      }
      document.body.append(box);
      return keys.length;
    }, space);
    const file = path.join(OUT, 'walls-join-10-icons-' + (space === 'paper' ? 'light' : 'dark') + '.png');
    await page.locator('#wall-icon-sheet').screenshot({ path: file });
    console.log('written: ' + file);
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(count + ' wall icons on each sheet');
