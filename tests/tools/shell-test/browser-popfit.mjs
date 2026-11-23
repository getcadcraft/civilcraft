// SPDX-License-Identifier: Apache-2.0
// Every app: a menu or pop-up never falls off an edge (assets/js/app-popfit.js; owner 2026-11-20, first report Discord unsaph3: CadCraft Layers > Tools ran
// off the panel's left edge). In each app's lab build, at a wide and a small window, it opens every <details> menu on screen, presses every button that says
// it has a pop-up, and right-clicks near the four corners of the window's middle, then measures each placed menu against the window and every box above it
// that clips or scrolls. Left, right, top, bottom.
//   node tools/shell-test/browser-popfit.mjs [--off] [--apps cadcraft,bimcraft] [--shots <dir>] [--verbose]
//   --swap <repo path> = serve app-popfit.js from that file (compare a change with the copy before it).
//   --off = measure the apps WITHOUT the helper (window.ccPopFitOff): lists what would fall off, and always exits 0.     (root: signs a staff test account in)
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), BASE = 'https://getcadcraft.com';
const arg = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const OFF = process.argv.includes('--off'), VERBOSE = process.argv.includes('--verbose'), SHOTS = arg('--shots'); if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const APPS = (arg('--apps') || 'cadcraft,bimcraft,modelcraft,markupcraft,takeoffcraft,civilcraft,detailcraft,partcraft').split(',');
const SIZES = [[1440, 900], [1024, 640]];
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map(s => path.join(cacheDir, build, s)).find(p => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
// --swap <repo path>: serve app-popfit.js from that copy instead of the server's (perf-finish-11, PERF.56: the same menus measured before and after a change)
if (arg('--swap')) { const body = fs.readFileSync(path.join(REPO, arg('--swap'))); await ctx.route((u) => u.pathname.endsWith('/app-popfit.js'), (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body })); }
await ctx.addInitScript((off) => { try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch {} if (off) window.ccPopFitOff = true;
  // the measure, written apart from the helper: placed menus on screen and how far each is past the room it has
  window.__popOut = (extra) => {
    const NAME = /(^|[\s_-])(menu|ctx|popover|flyout|popup)([\s_-]|$)|menu-list|-menu\b/, de = document.documentElement, out = [], seen = new Set(extra || []);
    for (const el of document.querySelectorAll('[role="menu"], [role="listbox"], [class*="menu"], [class*="ctx"], [class*="popover"], [class*="flyout"], [class*="popup"]')) {
      const role = el.getAttribute('role'); if (role === 'menu' || role === 'listbox' || NAME.test(typeof el.className === 'string' ? el.className : '')) seen.add(el);
    }
    let n = 0;
    for (const el of seen) {
      const cs = getComputedStyle(el); if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (el.closest('details:not([open])') ) continue;
      n++;
      const b = { l: 0, t: 0, r: de.clientWidth, b: de.clientHeight };
      if (cs.position !== 'fixed') for (let p = el.offsetParent || el.parentElement; p && p !== de && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p), q = p.getBoundingClientRect();
        if (s.overflowX !== 'visible') { b.l = Math.max(b.l, q.left); b.r = Math.min(b.r, q.right); }
        if (s.overflowY !== 'visible') { b.t = Math.max(b.t, q.top); b.b = Math.min(b.b, q.bottom); }
        if (s.position === 'fixed') break;
      }
      const o = { left: Math.round(b.l - r.left), right: Math.round(r.right - b.r), top: Math.round(b.t - r.top), bottom: Math.round(r.bottom - b.b) };
      const sides = Object.keys(o).filter(k => o[k] > 1);
      if (sides.length) out.push((el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.')) + (el.getAttribute('aria-label') ? ' "' + el.getAttribute('aria-label').slice(0, 30) + '"' : '') + ' off ' + sides.map(k => k + ' ' + o[k] + 'px').join(', '));
    }
    return { n, out };
  };
}, OFF);
const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.dismiss().catch(() => {}));
const closeAll = async () => { await page.keyboard.press('Escape').catch(() => {}); await page.evaluate(() => { for (const d of document.querySelectorAll('details[open]')) if ([...d.children].some(c => c.tagName !== 'SUMMARY' && /absolute|fixed/.test(getComputedStyle(c).position))) d.open = false; }); };
const totals = {};
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email); await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  for (const app of APPS) for (const [w, h] of SIZES) {
    const name = `${app} ${w}x${h}`, found = new Set(); let opened = 0;
    await page.setViewportSize({ width: w, height: h });
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2500);
    if (!OFF) ok(await page.evaluate(() => typeof window.ccPopFit === 'function'), `${name}: the lab build loads the helper`);
    const note = (r) => { opened += r.n; r.out.forEach(x => found.add(x)); };
    // 1. every <details> on screen that holds a placed list
    const nDet = await page.evaluate(() => { window.__det = [...document.querySelectorAll('details')].filter(d => d.querySelector(':scope > summary')?.getClientRects().length && !d.open && d.children.length > 1); return window.__det.length; });
    for (let i = 0; i < nDet; i++) {
      const r = await page.evaluate(async (i) => { const d = window.__det[i], s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length) return null;
        s.scrollIntoView({ block: 'nearest', inline: 'nearest' }); d.open = true; await new Promise(r => setTimeout(r, 120));
        const kids = [...d.children].filter(c => c !== s && /absolute|fixed/.test(getComputedStyle(c).position)); const res = kids.length ? window.__popOut(kids) : { n: 0, out: [] }; d.open = false; return res; }, i);
      if (r) note(r);
    }
    await closeAll();
    // 2. buttons that say they have a pop-up
    const nPop = await page.evaluate(() => { window.__pop = [...document.querySelectorAll('[aria-haspopup]:not([aria-haspopup="false"]):not([aria-haspopup="dialog"])')].filter(b => b.getClientRects().length && !b.disabled && b.tagName !== 'SUMMARY'); return window.__pop.length; });
    for (let i = 0; i < Math.min(nPop, 60); i++) {
      const r = await page.evaluate(async (i) => { const b = window.__pop[i]; if (!b.isConnected || !b.getClientRects().length) return null; b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); b.click(); await new Promise(r => setTimeout(r, 150)); return window.__popOut(); }, i).catch(() => null);
      if (r) note(r);
      await closeAll();
    }
    // 3. right-click near the corners of the window's middle (the drawing) and of the window
    for (const [x, y] of [[w - 6, h - 6], [6, h - 6], [w - 6, Math.round(h / 2)], [Math.round(w / 2), h - 40], [Math.round(w * .62), Math.round(h * .6)], [Math.round(w * .3), Math.round(h * .8)]]) {
      await page.mouse.click(x, y, { button: 'right' }).catch(() => {}); await page.waitForTimeout(150);
      note(await page.evaluate(() => window.__popOut()));
      if (SHOTS && x === w - 6 && y === Math.round(h / 2)) await page.screenshot({ path: path.join(SHOTS, `popfit-${app}-${w}-ctx.png`) });
      await closeAll(); await page.mouse.click(Math.round(w / 2), 8).catch(() => {});
    }
    totals[name] = { menus: opened, off: found.size };
    console.log(`  ${name}: ${nDet} details, ${nPop} pop-up buttons, ${opened} placed menus measured, ${found.size} off an edge`);
    if (found.size && (OFF || VERBOSE || true)) for (const x of found) console.log('      ' + x);
    if (!OFF) { ok(opened > 0, `${name}: menus were opened and measured`); ok(found.size === 0, `${name}: no menu is off an edge (${found.size})`); }
  }
  if (!OFF) ok(errors.length === 0, 'no page error: ' + [...new Set(errors)].slice(0, 3).join('; '));
} finally { await browser.close(); try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' }); } catch { /* the fixture account stays disabled-on-next-run */ } }
console.log(OFF ? 'measured without the helper' : `${fail ? 'FAILED' : 'ok'}: ${pass} passed, ${fail} failed`); process.exit(!OFF && fail ? 1 : 0);
