#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-input-apps.mjs — every app's menu styles in the lab, headless, real clicks and keys (0.5 track IP.7, session
 * input-apps; the shell's app-input-ui.js, map docs/apps/app-input.md).
 *
 *   node tools/shell-test/browser-input-apps.mjs [--apps cadcraft,modelcraft] [--shots <dir>] [--no-phone]
 *
 * Run as root: a session minted in-process for its own test admin (tools/cadcraft-test/admin.php session inputapps, so other
 * runs never sign it out; disabled again at the end; --tag <x> gives a parallel run its own). Per app, from its
 * registry (manifest "input") and a small probe module tools/shell-test/input-apps/<slug>.mjs:
 *   - the registry covers the toolbar: every button of the app's own toolbar (and its menus) is one of the registry's
 *     commands, and every command's button is in the page (optional ones may be missing);
 *   - every style: picked in Settings › <App> › Menus, keys and mouse (a card click for the first), its bar shows (or the
 *     toolbar, for the app's own style), every placed command has its button in the bar, no console errors;
 *   - a command run from its menu or ribbon tab with real clicks (the probe says which, and checks it ran);
 *   - a remapped key: an imported style (.ccinput.json, the Import path) gives a command a new key; pressing it runs the
 *     command, and the app's own key for it is held back with a word on where it went;
 *   - a remapped mouse button: an imported style changes which button pans; the probe drags and checks the view;
 *   - on a phone (412 × 892, touch): each non-own style's bar is one row that scrolls sideways inside the toolbar, nothing
 *     past the right edge, a menu opens inside the screen.
 * Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PUB = path.join(REPO, 'public_html');
const BASE = 'https://getcadcraft.com';
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const PHONE = !process.argv.includes('--no-phone');
const IP = await import(pathToFileURL(path.join(PUB, 'assets/js/app-input.js')).href);
const ALL = fs.readdirSync(path.join(REPO, 'tools/shell-test/input-apps')).filter((f) => f.endsWith('.mjs')).map((f) => f.replace(/\.mjs$/, '')).sort();
const APPS = arg('--apps') ? arg('--apps').split(',') : ALL;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const TAG = 'inputapps' + (arg('--tag') || '').replace(/[^a-z0-9]/g, '');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', TAG], { encoding: 'utf8' }));
const [cookieName, cookieValue] = [minted.name, minted.value];
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const cookie = { name: cookieName, value: cookieValue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' };

/** In the page: toolbar buttons no registry command knows (the shell offers those in a More menu / an Add-ons tab). */
function uncoveredInPage() {
  const ci = window.ccInput;
  const root = document.querySelector('body > main');
  const tb = document.querySelector('[data-input-bar]')?.parentElement || [...root.children].find((n) => n.getAttribute('role') === 'toolbar');
  const target = (c) => (c.sel ? root.querySelector(c.sel) || document.querySelector(c.sel) : null);
  const dataKey = (n) => { const a = n.getAttributeNames().find((x) => x.startsWith('data-')); return a ? a + '=' + n.getAttribute(a) : null; };
  const known = new Set(ci.commands.map(target).filter(Boolean).map(dataKey).filter(Boolean));
  const bar = document.querySelector('[data-input-bar]');
  const extra = [...tb.querySelectorAll('button, [role="menuitem"]')].filter((b) => !(bar && bar.contains(b)) && !b.closest('summary')
    && !known.has(dataKey(b)) && (b.textContent || b.title || '').trim()).map((b) => (dataKey(b) || '') + ' "' + (b.textContent || b.title).trim().slice(0, 30) + '"');
  const missing = ci.commands.filter((c) => !c.optional && !target(c)).map((c) => c.id);
  return { extra, missing };
}

async function openApp(ctx, slug, probe) {
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' && !(probe.ignoreConsole || []).some((r) => r.test(m.text()))) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(`${BASE}/lab/${slug}?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ccInput && window.ccInput.current(), null, { timeout: 30000 });
  if (probe.ready) await probe.ready(page);
  return { page, problems };
}
const resetStore = (page, store) => page.evaluate((s) => { try { localStorage.removeItem(s); localStorage.removeItem('cc-input-family'); } catch (e) { /* none */ } }, store);

for (const slug of APPS) {
  const probe = (await import(pathToFileURL(path.join(REPO, 'tools/shell-test/input-apps', slug + '.mjs')).href)).default;
  const man = JSON.parse(fs.readFileSync(path.join(PUB, 'assets/apps', slug, 'dev/manifest.json'), 'utf8'));
  if (!man.input) { ok(false, slug + ': no "input" in its manifest'); continue; }
  const reg = await import(pathToFileURL(path.join(PUB, 'assets/apps', slug, 'dev', man.input)).href);
  const STORE = reg.STORE || slug + '.input';
  console.log(`== ${slug}`);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([cookie]);
  let page, problems;
  try {
    ({ page, problems } = await openApp(ctx, slug, probe));
    await resetStore(page, STORE);
    if (probe.before) await probe.before(page);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.ccInput && window.ccInput.current(), null, { timeout: 30000 });
    if (probe.ready) await probe.ready(page);
    const own = reg.STYLE_ORDER[0];
    ok(await page.evaluate(() => window.ccInput.current().id) === own, `${slug}: opens in its own style (${own})`);

    // ---- the registry covers the toolbar ----
    if (probe.coverage) await probe.coverage(page);   // e.g. open the 3D tab once, so its group is in the toolbar
    const cov = await page.evaluate(uncoveredInPage);
    ok(!cov.extra.length, `${slug}: every toolbar button is a registry command` + (cov.extra.length ? ': ' + cov.extra.slice(0, 6).join(', ') : ''));
    ok(!cov.missing.length, `${slug}: every command's own button is in the page` + (cov.missing.length ? ': ' + cov.missing.slice(0, 6).join(', ') : ''));
    if (probe.afterCoverage) await probe.afterCoverage(page);

    // ---- every style ----
    for (const [i, id] of reg.STYLE_ORDER.entries()) {
      if (i === 1) {   // the first other style through Settings, as a person picks it
        await page.keyboard.press('Control+Comma');
        await page.waitForSelector('[data-app-settings][open]');
        ok((await page.$$('[data-input-settings] .cc-in-card')).length === reg.STYLE_ORDER.length, `${slug}: ${reg.STYLE_ORDER.length} style cards in Settings`);
        await page.click(`[data-input-settings] input[value="${id}"]`, { force: true });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('[data-app-settings]').open);
      } else await page.evaluate((s) => window.ccInput.setStyle(s), id);
      const st = await page.evaluate(() => {
        const p = window.ccInput.current(), bar = document.querySelector('[data-input-bar]');
        const shown = bar && !bar.hidden && bar.getBoundingClientRect().height > 0;
        return { id: p.id, layout: p.layout, shown, cmds: shown ? [...bar.querySelectorAll('[data-cmd]')].map((b) => b.dataset.cmd) : [], tabs: (p.tabs || []).length };
      });
      ok(st.id === id && (st.layout === 'toolbar' ? !st.shown || id !== own : st.shown), `${slug}/${id}: ${st.layout === 'toolbar' ? 'the toolbar as it is' : 'its ' + st.layout + ' shows'}`);
      if (st.layout === 'menubar') {
        const p = IP.resolve(reg.STYLES[id], reg.STYLES);
        const want = new Set((p.menus || []).flatMap((m) => m.items).filter((x) => x !== '-' && !reg.COMMANDS.find((c) => c.id === x)?.optional));
        const lost = [...want].filter((x) => !st.cmds.includes(x));
        ok(!lost.length, `${slug}/${id}: every menu item has its button in the bar` + (lost.length ? ': ' + lost.slice(0, 5).join(', ') : ''));
      }
      if (st.layout === 'ribbon') {   // every tab, one at a time
        const p = IP.resolve(reg.STYLES[id], reg.STYLES);
        const lost = [];
        for (let ti = 0; ti < st.tabs; ti++) {
          await page.click(`[data-input-bar] [role="tab"] >> nth=${ti}`);
          const have = await page.$$eval('[data-input-bar] .cc-in-rbody [data-cmd]', (b) => b.map((x) => x.dataset.cmd));
          for (const pn of p.tabs[ti].panels) for (const x of [...pn.items.flatMap(IP.itemIds), ...(pn.more || [])]) if (!have.includes(x) && !reg.COMMANDS.find((c) => c.id === x)?.optional) lost.push(x);
        }
        ok(!lost.length, `${slug}/${id}: every ribbon tab shows its buttons` + (lost.length ? ': ' + lost.slice(0, 5).join(', ') : ''));
        await page.click('[data-input-bar] [role="tab"] >> nth=0');
      }
      await shot(page, `${slug}-${id}`);
    }

    // ---- a command run from its menu ----
    const mc = probe.menu;
    await page.evaluate((s) => window.ccInput.setStyle(s), mc.style);
    const place = IP.placeOf(IP.resolve(reg.STYLES[mc.style], reg.STYLES), mc.cmd);
    ok(!!place, `${slug}/${mc.style}: ${mc.cmd} has a place (${String(place).replace('\u0000', ' › ')})`);
    if (probe.beforeRun) await probe.beforeRun(page, mc.cmd);
    if (String(place).includes('\u0000')) {   // a ribbon tab › panel
      const tabs = IP.resolve(reg.STYLES[mc.style], reg.STYLES).tabs;
      const ti = tabs.findIndex((t) => t.label === place.split('\u0000')[0]);
      await page.click(`[data-input-bar] [role="tab"] >> nth=${ti}`);
      await page.click(`[data-input-bar] .cc-in-rbody [data-cmd="${mc.cmd}"]`);
    } else {   // a menu: open it, then the item
      await page.click(`[data-input-bar] details:has([data-cmd="${mc.cmd}"]) > summary`);
      await page.click(`[data-input-bar] details[open] [role="menuitem"][data-cmd="${mc.cmd}"]`);
    }
    ok(await mc.check(page), `${slug}/${mc.style}: ${mc.cmd} from its ${String(place).includes('\u0000') ? 'ribbon tab' : 'menu'} ran (${mc.what})`);
    if (probe.afterRun) await probe.afterRun(page);
    await shot(page, `${slug}-menu-run`);

    // ---- a remapped key (an imported style: the IP.5 path) ----
    const kc = probe.key;
    const style = { format: 'cadcraft-input', version: 1, name: 'Test keys', base: kc.base, keys: { ...(IP.resolve(reg.STYLES[kc.base], reg.STYLES).keys || {}), [kc.cmd]: [kc.combo] } };
    const imp = await page.evaluate((t) => !!window.ccInput.importText(t), JSON.stringify(style));
    ok(imp && await page.evaluate(() => window.ccInput.current().name) === 'Test keys', `${slug}: a style with ${kc.cmd} on ${kc.combo} imported and in use`);
    if (probe.beforeKey) await probe.beforeKey(page);
    await page.keyboard.press(kc.combo.replace(/Ctrl/g, 'Control'));
    ok(await kc.check(page), `${slug}: ${kc.combo} runs ${kc.cmd} (${kc.what})`);
    if (probe.afterKey) await probe.afterKey(page);
    if (kc.own) {   // the app's own key for that command is held back and says where it went (probe.key.ownCheck: it did not run)
      await page.keyboard.press(kc.own.replace(/Ctrl/g, 'Control'));
      const said = await page.evaluate((sel) => document.querySelector(sel)?.textContent || '', probe.statusSel || '[data-status]');
      ok(await kc.ownCheck(page), `${slug}: the own key ${kc.own} no longer runs it`);
      ok(said.includes('Test keys'), `${slug}: the status says where it went: "${said.slice(0, 90)}"`);
    }
    if (probe.extra) await probe.extra(page, ok);

    // ---- a remapped mouse button ----
    if (probe.mouse) await probe.mouse(page, ok, async (mouse) => {
      const t = JSON.stringify({ format: 'cadcraft-input', version: 1, name: 'Test mouse', base: own, mouse });
      return page.evaluate((x) => !!window.ccInput.importText(x), t);
    });

    // back to the own style
    await page.evaluate((s) => window.ccInput.setStyle(s), own);
    for (const p of problems) { fail++; console.log('  FAIL ' + slug + ' ' + p); }
    problems.length = 0;
    await resetStore(page, STORE);
  } catch (e) {
    fail++;
    console.log('  FAIL ' + slug + ': ' + (e.stack || e.message));
    if (page) await shot(page, slug + '-error');
  }
  await ctx.close();

  // ---- on a phone ----
  if (!PHONE) continue;
  const pctx = await browser.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  await pctx.addCookies([cookie]);
  try {
    ({ page, problems } = await openApp(pctx, slug, probe));
    ok(await page.evaluate(() => document.documentElement.classList.contains('cc-phone')), `${slug} on a phone: the phone layout is on`);
    for (const id of reg.STYLE_ORDER.slice(1)) {
      await page.evaluate((s) => window.ccInput.setStyle(s), id);
      await page.waitForTimeout(150);
      const g = await page.evaluate(() => {
        const bar = document.querySelector('[data-input-bar]'), tb = bar.parentElement;
        const items = [...bar.querySelectorAll('summary, button')].filter((b) => b.getBoundingClientRect().height > 0 && !b.closest('details:not([open]) > :not(summary)'));
        const tops = items.map((b) => b.getBoundingClientRect().top).sort((a, b) => a - b);
        const rowStarts = tops.filter((t, i) => i === 0 || t - tops[i - 1] > 20);   // a new row starts 20 px or more lower
        const r = tb.getBoundingClientRect();
        return { dbg: items.slice(0, 12).map((b) => [b.className, Math.round(b.getBoundingClientRect().top)]), rows: rowStarts.length, h: Math.round(bar.getBoundingClientRect().height), tbH: Math.round(r.height), right: Math.round(r.right),
          scrolls: tb.scrollWidth > tb.clientWidth, overflowX: getComputedStyle(tb).overflowX, vw: document.documentElement.clientWidth,
          pageW: document.documentElement.scrollWidth, rem: parseFloat(getComputedStyle(document.documentElement).fontSize) };
      });
      ok(g.rows === 1 && g.h <= 3.6 * g.rem, `${slug}/${id} on a phone: one row (${g.rows} row, ${g.h} px tall)` + (g.rows > 1 ? JSON.stringify(g.dbg) : ""));
      ok(g.overflowX === 'auto' && g.right <= g.vw && g.pageW <= g.vw, `${slug}/${id} on a phone: the row scrolls sideways inside the screen (scrolls: ${g.scrolls}, page ${g.pageW}/${g.vw} px)`);
      const sum = await page.$('[data-input-bar] details > summary');
      if (sum) {
        await sum.scrollIntoViewIfNeeded();
        await sum.click();
        await page.waitForTimeout(100);
        const box = await page.evaluate(() => { const l = document.querySelector('[data-input-bar] details[open] > .cc-in-list'); if (!l) return null; const r = l.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, vw: document.documentElement.clientWidth, vh: window.innerHeight }; });
        ok(box && box.l >= 0 && box.r <= box.vw + 1 && box.t >= 0 && box.b <= box.vh + 1, `${slug}/${id} on a phone: a menu opens inside the screen ` + JSON.stringify(box));
        await page.evaluate(() => { for (const d of document.querySelectorAll('[data-input-bar] details[open]')) d.open = false; });
      }
      await shot(page, `${slug}-${id}-phone`);
    }
    await page.evaluate((s) => window.ccInput.setStyle(s), reg.STYLE_ORDER[0]);
    for (const p of problems) { fail++; console.log('  FAIL ' + slug + ' (phone) ' + p); }
    await resetStore(page, STORE);
  } catch (e) {
    fail++;
    console.log('  FAIL ' + slug + ' (phone): ' + (e.stack || e.message));
    if (page) await shot(page, slug + '-phone-error');
  }
  await pctx.close();
}
await browser.close();
try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', TAG]); } catch (e) { /* the next run re-enables it */ }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
