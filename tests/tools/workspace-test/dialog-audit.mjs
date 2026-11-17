#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dialog-audit.mjs — owner 2026-10-24 ("too tiny for the function … check to see if any others are too tiny"): opens every <dialog> each
 * lab app has in its page (classic layout), plus the layout engine's own (File menu, a greyed tool's reason, What each tool does here,
 * Arrange your own layout, My tools' picker), measures it and reports the ones under the floor: narrower than MIN_W px, body text under
 * MIN_FONT px, or a visible button shorter than MIN_BTN px. A dialog that is a full-screen sheet or bigger is fine by width.
 * With --commands it also runs every command of the app's menus (its input registry; the ones it says can run now) with showModal / show
 * watched, so dialogs built on demand are measured too (file pickers are cancelled, new windows closed, downloads dropped).
 *   node tools/workspace-test/dialog-audit.mjs [--apps a,b] [--shots dir] [--all] [--commands]   (--all lists every dialog, not only the small ones)
 * Exit 1 when one is under the floor. Run as root (Playwright, the bimres test admin), one app at a time.
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const ALL = ['cadcraft', 'bimcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft', 'supercadcraft'];
const APPS = arg('--apps') ? arg('--apps').split(',') : ALL;
const SH = arg('--shots'); if (SH) fs.mkdirSync(SH, { recursive: true });
const LIST = process.argv.includes('--all'), COMMANDS = process.argv.includes('--commands');
const SKIP = /^(file\.(print|export|save|saveas|save-as|plot|download)|edit\.(delete|cut)|view\.(fullscreen|screen))/;   // nothing that leaves the page or changes a file
const MIN_W = 384, MIN_FONT = 13, MIN_BTN = 28;
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const small = [];

/** Measures the open dialog (or menu) `sel` in the page. */
const measure = (page, sel) => page.evaluate(([sel, MIN_BTN]) => {
  const d = document.querySelector(sel); if (!d) return null;
  const r = d.getBoundingClientRect();
  const texts = [...d.querySelectorAll('p, li, label, span, td, dd, dt, button, summary, legend, h1, h2, h3, h4')].filter((n) => n.offsetParent !== null && n.textContent.trim());
  const sizes = texts.map((n) => parseFloat(getComputedStyle(n).fontSize));
  // a button styled as a text link (no border, no fill) reads as a link: links are measured by their text, not as buttons
  const asLink = (b) => { const s = getComputedStyle(b); return s.borderStyle === 'none' && (s.backgroundColor === 'rgba(0, 0, 0, 0)' || s.backgroundColor === 'transparent') && s.textDecorationLine.includes('underline'); };
  const btns = [...d.querySelectorAll('button')].filter((b) => b.offsetParent !== null && !asLink(b)).map((b) => b.getBoundingClientRect().height);
  window.__auditSmall = [...d.querySelectorAll('button')].filter((b) => b.offsetParent !== null && !asLink(b) && b.getBoundingClientRect().height < MIN_BTN).map((b) => b.className + ':' + b.textContent.trim().slice(0, 20));
  const name = d.getAttribute('aria-label') || d.querySelector('h1, h2, h3, legend')?.textContent.trim().slice(0, 60) || d.className.slice(0, 40) || '(no name)';
  return { name, w: Math.round(r.width), h: Math.round(r.height), font: sizes.length ? Math.min(...sizes) : 0, body: sizes.length ? sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)] : 0,
    btn: btns.length ? Math.round(Math.min(...btns)) : 0, smallBtns: btns.filter((h) => h < MIN_BTN).length, which: window.__auditSmall, vw: innerWidth };
}, [sel, MIN_BTN]);

function judge(slug, m, shot) {
  if (!m || !m.w) return;
  const why = [];
  if (m.w < MIN_W) why.push('narrow ' + m.w + 'px');
  if (m.body && m.body < MIN_FONT) why.push('text ' + m.body + 'px');
  if (m.smallBtns) why.push(m.smallBtns + ' button(s) under ' + MIN_BTN + 'px (smallest ' + m.btn + ': ' + (m.which || []).join(', ') + ')');
  if (why.length) small.push({ slug, name: m.name, why: why.join(', '), shot });
  if (why.length || LIST) console.log((why.length ? '  SMALL ' : '  ok    ') + slug.padEnd(13) + m.name.padEnd(48) + ' ' + m.w + '×' + m.h + ' text ' + m.body + 'px btn ' + m.btn + 'px' + (why.length ? '  ← ' + why.join(', ') : ''));
}

for (const slug of APPS) {
  console.log('== ' + slug);
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.dismiss());
  await page.goto('https://getcadcraft.com/lab/' + slug, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(1500);
  await page.evaluate(() => { try { localStorage.removeItem('cc-workspace'); } catch (e) {} });
  await page.reload({ waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(2500);
  await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) d.close(); });
  if (COMMANDS) {
    page.on('filechooser', (fc) => fc.setFiles([]).catch(() => {})); page.on('popup', (p) => p.close().catch(() => {}));
    const ids = await page.evaluate(() => (window.ccInput?.commands || []).map((c) => c.id));
    const seen = new Set();
    for (const id of ids.filter((x) => !SKIP.test(x))) {
      const opened = await page.evaluate(async (id) => {
        const I = window.ccInput; if (!I || (I.why && I.why(id))) return null;
        const before = new Set([...document.querySelectorAll('dialog[open]')]);
        try { await Promise.race([I.run(id), new Promise((r) => setTimeout(r, 600))]); } catch (e) { return null; }
        await new Promise((r) => setTimeout(r, 250));
        const d = [...document.querySelectorAll('dialog[open]')].find((x) => !before.has(x));
        if (!d) return null;
        d.setAttribute('data-audit-cmd', id); return d.getAttribute('aria-label') || d.querySelector('h1, h2, h3')?.textContent.trim().slice(0, 60) || id;
      }, id).catch(() => null);
      if (!opened) { await page.keyboard.press('Escape').catch(() => {}); continue; }
      if (!seen.has(opened)) {
        seen.add(opened);
        const m = await measure(page, 'dialog[data-audit-cmd="' + id + '"]');
        if (m) m.name = opened + ' (' + id + ')';
        const shot = SH ? path.join(SH, slug + '-cmd-' + id.replace(/\W+/g, '-') + '.png') : null;
        const before = small.length; judge(slug, m, shot);
        if (shot && small.length > before) await page.screenshot({ path: shot });
      }
      await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) { d.close(); d.removeAttribute('data-audit-cmd'); } });
      await page.keyboard.press('Escape').catch(() => {});
    }
    await page.goto('https://getcadcraft.com/lab/' + slug, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(3000);   // a command may leave work running: a fresh page
  }
  // every dialog in the page, one at a time (classic layout)
  const n = await page.evaluate(() => { document.querySelectorAll('dialog').forEach((d, i) => d.setAttribute('data-audit', i)); return document.querySelectorAll('dialog').length; });
  for (let i = 0; i < n; i++) {
    const opened = await page.evaluate((i) => { const d = document.querySelector('dialog[data-audit="' + i + '"]'); if (!d || d.open) return false; try { d.showModal(); return true; } catch (e) { return false; } }, i);
    if (!opened) continue;
    await page.waitForTimeout(150);
    const m = await measure(page, 'dialog[data-audit="' + i + '"]');
    const shot = SH ? path.join(SH, slug + '-dlg' + i + '.png') : null;
    const before = small.length; judge(slug, m, shot);
    if (shot && small.length > before) await page.screenshot({ path: shot });
    await page.evaluate((i) => document.querySelector('dialog[data-audit="' + i + '"]')?.close(), i);
  }
  // the layout engine's own, in the ribbon layout (Super's page is its own engine's host)
  await page.evaluate(() => { try { localStorage.setItem('cc-workspace', 'docked'); } catch (e) {} });
  await page.goto('https://getcadcraft.com/lab/' + slug, { waitUntil: 'load' }).catch(() => {});
  await page.waitForFunction(() => window.ccWorkspaceEngine?.inspect().layout === 'docked', null, { timeout: 30000 }).catch(() => {}); await page.waitForTimeout(800);
  await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) d.close(); });
  const engine = [
    ['File menu', async () => { await page.click('.ws-ribbon-tabs [data-ws-file]', { timeout: 3000 }); return '.ws-file-menu'; }],
    ['What each tool does here', async () => { await page.click('[data-ws-inventory]', { timeout: 3000 }); return 'dialog.ws-inventory[open]'; }],
    ['A greyed tool\'s reason', async () => { await page.evaluate(() => [...document.querySelectorAll('.ws-ribbon [data-ws-command][aria-disabled="true"]')][0]?.click()); return 'dialog.ws-explain[open]'; }],
    ['Arrange your own layout', async () => { await page.evaluate(() => window.ccWorkspaceEngine?.arrange()); return 'dialog.ws-arrange[open]'; }],
  ];
  for (const [label, open] of engine) {
    const sel = await open().catch(() => null);
    if (!sel) { console.log('  skip  ' + label + ' (not in this app)'); continue; }
    await page.waitForTimeout(300);
    const m = await measure(page, sel);
    if (!m) { console.log('  skip  ' + label + ' (did not open)'); continue; }
    m.name = 'engine: ' + label;
    const shot = SH ? path.join(SH, slug + '-' + label.replace(/\W+/g, '-').toLowerCase() + '.png') : null;
    judge(slug, m, shot);
    if (shot) await page.screenshot({ path: shot });
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) d.close(); });
  }
  await page.evaluate(() => { try { localStorage.removeItem('cc-workspace'); } catch (e) {} });
  await ctx.close();
}
await browser.close();
console.log('\n' + small.length + ' dialog(s) under the floor (narrower than ' + MIN_W + 'px, text under ' + MIN_FONT + 'px, buttons under ' + MIN_BTN + 'px)');
for (const s of small) console.log('  ' + s.slug + ' · ' + s.name + ' · ' + s.why);
process.exit(small.length ? 1 : 0);
