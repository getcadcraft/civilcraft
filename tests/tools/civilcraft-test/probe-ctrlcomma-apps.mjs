#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** probe-ctrlcomma-apps.mjs — civil-11, FX.353: Ctrl+, after wheel / pinch input in each app's /lab page (1600 x 900). Prints open true/false per step. Root, one at a time. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const apps = (process.argv[2] || 'cadcraft,bimcraft,modelcraft,markupcraft,takeoffcraft,detailcraft,partcraft').split(',');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
let bad = 0;
for (const app of apps) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  try {
    await page.goto(`https://getcadcraft.com/lab/${app}`, { waitUntil: 'load', timeout: 90000 }); await page.waitForTimeout(3000);
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
    const open = () => page.evaluate(() => !!document.querySelector('dialog.shell-settings')?.open);
    const box = await page.evaluate(() => { const c = [...document.querySelectorAll('canvas')].filter((x) => x.offsetParent).sort((a, b) => b.width * b.height - a.width * a.height)[0]; const r = c?.getBoundingClientRect(); return r ? [r.x + r.width / 2, r.y + r.height / 2] : [800, 450]; });
    const res = [];
    const step = async (label) => { await page.keyboard.press('Control+,'); await page.waitForTimeout(350); const o = await open(); res.push(label + ':' + o); if (o) { await page.keyboard.press('Control+,'); await page.waitForTimeout(300); } };
    await step('start');
    await page.mouse.move(box[0], box[1]); await page.mouse.wheel(0, -240); await page.waitForTimeout(300); await step('wheel');
    await page.keyboard.down('Control'); await page.mouse.wheel(0, -100); await page.keyboard.up('Control'); await page.waitForTimeout(300); await step('ctrl+wheel');
    await page.mouse.click(box[0], box[1]); await page.mouse.wheel(0, 120); await step('click+wheel');
    if (res.some((r) => r.endsWith('false'))) bad++;
    console.log(app.padEnd(14), res.join(' '));
  } catch (e) { console.log(app.padEnd(14), 'ERROR', e.message.slice(0, 100)); }
  await ctx.close();
}
await browser.close(); admin('down'); process.exit(bad ? 1 : 0);
