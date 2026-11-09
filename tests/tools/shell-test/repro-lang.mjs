#!/usr/bin/env node
/* Repro: pick French in Settings › Language, reload, does it stick? (Tazerface, Discord 2026-11-02). Root, Playwright. */
import fs from 'node:fs';
import path from 'node:path';
const BASE = 'https://getcadcraft.com';
const app = process.argv[2] || 'cadcraft';
const area = process.argv[3] || 'use';
const { chromium } = await import('/var/www/CADCRAFT/getcadcraft.com/node_modules/playwright-core/index.mjs');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US' });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
await page.goto(`${BASE}/${area}/${app}`, { waitUntil: 'load' });
await page.waitForTimeout(2500);
const st = async (label) => {
  const r = await page.evaluate(() => {
    const s = document.getElementById('shell-lang');
    return { sel: s ? s.value : null, now: s ? s.dataset.langNow : null, html: document.documentElement.lang, cookie: document.cookie.split('; ').filter((c) => c.startsWith('cc_lang')).join(), cat: (() => { try { return JSON.parse(document.getElementById('cc-lang').textContent).locale; } catch (e) { return null; } })() };
  });
  console.log(label, JSON.stringify(r));
};
await st('start   ');
await page.evaluate(() => { const s = document.getElementById('shell-lang'); s.value = 'fr'; s.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForTimeout(300);
await st('picked  ');
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(3000);
await st('reloaded');
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(3000);
await st('again   ');
console.log('errors', logs.slice(0, 5));
await browser.close();
