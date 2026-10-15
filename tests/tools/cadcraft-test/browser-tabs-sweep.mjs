#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-tabs-sweep.mjs — 0.5 VP.5: do the Model / layout tabs ever sit over the command line or the status bar, or
 * under something else, so a tab can't be clicked? (Discord tester, 2026-10-13: "the layouts overlap another menu on
 * the bottom, and none work in these areas"; no screenshot or details will come.)
 *
 *   node tools/cadcraft-test/browser-tabs-sweep.mjs [--browsers chromium,firefox,webkit] [--panels docked,float,bottom] [--quick] [--shots <dir>] [--list <file>]
 *     --scales 1.5,1.75   only these scales (page zoom / device scale)
 *     --list   every failing combination as a JSON line {combo, problems, cssW, cssH, phone} (0.5 VP.5 rest: the summary also
 *              counts the failures on the phone layout — html.cc-phone, set by app-phone.js up to 760 px wide and on short
 *              sideways windows — which is that module's, not app-panels.js's)
 *
 * Run as root (its own test admin cctest+cadcraft-sweep@projectz.xyz via tools/cadcraft-test/admin.php up|down sweep; one
 * sign-in per browser). For each browser × scale (page zoom / device scale 100, 125, 150, 175 %: the CSS viewport is the window
 * divided by the scale, at that device pixel ratio) × panels (docked as shipped, both floating, right docked at the
 * bottom) × touch key row (off, on): every window 1024/1366/1440/1920 × 500/600/768/900 px, with 1, 8 and 40 sheets
 * with long names, and with 40 sheets in each screen mode (normal, full screen, full screen with the bars hidden). A check per combination:
 *   - every tab, scrolled into its strip, is the element at its own centre (nothing covers it) and inside the window;
 *   - the command line input and every status-bar button are the element at their centres, and neither the
 *     command line nor the status bar overlaps the tab strip;
 *   - one real click on the last tab selects it (once per window size).
 * On the phone layout (html.cc-phone) the check waits for the layout to settle and runs again; a phone-layout window under
 * 340 CSS px tall (1024 × 500 at 175 %) is the floor, counted apart (bin/test-phones.mjs checks real phone sizes).
 * Failures are grouped by what covered what. --quick runs a smaller grid (the guard browser-draw.mjs keeps).
 * The staff panel's tab (shown to staff and lab testers) is part of the page here, as it is for them.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageCheck } from './tab-check.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const QUICK = args.includes('--quick');
const SHOTS = opt('--shots');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const BROWSERS = (opt('--browsers') || 'chromium,firefox,webkit').split(',');

const WINDOWS = QUICK ? [[1024, 500], [1366, 768], [1920, 900]]
  : [1024, 1366, 1440, 1920].flatMap((w) => [500, 600, 768, 900].map((h) => [w, h]));
const SCALES = opt('--scales') ? opt('--scales').split(',').map(Number) : QUICK ? [1, 1.5] : [1, 1.25, 1.5, 1.75];   // --scales 1.75: one scale
const LAYOUTS = QUICK ? [40] : [1, 8, 40];
const MODES = QUICK ? ['normal', 'hidden'] : ['normal', 'full', 'hidden'];
const PANELS = opt('--panels') ? opt('--panels').split(',') : QUICK ? ['docked', 'float'] : ['docked', 'float', 'bottom'];   // --panels bottom: re-run one arrangement
const TOUCH = [false, true];

const { chromium, firefox, webkit } = await import('playwright-core');
const engines = { chromium, firefox, webkit };
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up', 'sweep'], { encoding: 'utf8' }));   // its own account: other runs set the shared one up and down
const chromiumExe = (() => {
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  return ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
})();

const PANEL_STATE = {
  docked: null,
  float: { panels: { p: { left: { dock: 'float', order: 0 }, right: { dock: 'float', order: 1 } } } },   // where Float puts them
  bottom: { panels: { p: { left: { dock: 'left', order: 0 }, right: { dock: 'bottom', order: 1 } } } },
};
const LONG = (i) => `A-${String(101 + i)} Ground floor plan, kitchen and servery — issued for construction (${i + 1})`;

let checks = 0, fails = 0, phoneFails = 0, floor = 0;
// The phone layout (html.cc-phone, app-phone.js) has its own rules: panels are sheets from a bar, the window is a phone's.
// There the sweep waits for the layout to settle (sheets slide away in .18 s after a resize from a desktop size) and checks
// again; a window shorter than any phone held sideways (FLOOR_H CSS px; test-phones.mjs's shortest is 344) is the floor —
// listed, not failed: the tabs still work when the page opens at that size, but nothing is left for the drawing.
const FLOOR_H = 340;
const groups = new Map();   // "what covered what" → example combos
const LIST = opt('--list');
if (LIST) fs.writeFileSync(LIST, '');
const record = (combo, problems, css = null) => {
  checks++;
  if (!problems.length) return;
  fails++;
  if (css && (css.phone ?? css.w <= 760)) phoneFails++;
  if (LIST) fs.appendFileSync(LIST, JSON.stringify({ combo, problems, cssW: css?.w ?? null, cssH: css?.h ?? null, phone: css?.phone ?? null }) + '\n');
  for (const p of problems) {
    const g = groups.get(p) || [];
    if (g.length < 6) g.push(combo);
    groups.set(p, g);
  }
};

const browserProblems = [];
for (const name of BROWSERS) {
  const engine = engines[name];
  const launchOpts = name === 'chromium'
    ? { executablePath: chromiumExe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] }
    : name === 'firefox'
      ? { firefoxUserPrefs: { 'network.dns.forceResolve': '127.0.0.1', 'security.enterprise_roots.enabled': true } }
      : {};
  let browser;
  try { browser = await engine.launch(launchOpts); } catch (e) { console.log(`\n== ${name}: could not start (${e.message.split('\n')[0]})`); browserProblems.push(name); continue; }
  // one sign-in per browser; every context after it reuses the cookies
  const ctx0 = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const p0 = await ctx0.newPage();
  if (name === 'webkit') await p0.route('**/*', (r) => r.continue());
  try {
    await p0.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
    await p0.fill('input[name="email"]', admin.email);
    await p0.fill('input[name="password"]', admin.password);
    await Promise.all([p0.waitForNavigation(), p0.click('form button[type="submit"]')]);
  } catch (e) { console.log(`\n== ${name}: could not sign in (${e.message.split('\n')[0]})`); browserProblems.push(name); await browser.close(); continue; }
  const storage = await ctx0.storageState();
  await ctx0.close();
  console.log(`\n== ${name}`);

  for (const scale of SCALES) {
    for (const panels of PANELS) {
      for (const touch of TOUCH) {
        const ctx = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block', storageState: storage, deviceScaleFactor: scale, viewport: { width: Math.round(1440 / scale), height: Math.round(900 / scale) } });
        const st = PANEL_STATE[panels];
        await ctx.addInitScript((s) => { if (s) localStorage.setItem('cc-app-settings:cadcraft', JSON.stringify(s)); else localStorage.removeItem('cc-app-settings:cadcraft'); }, st);
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        try {
          for (let tries = 2; ; tries--) {   // another session may be saving a module this very second: one more try
            try {
              const resp = await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'load' });
              if (!resp || resp.status() !== 200) throw new Error('status ' + resp?.status());
              await page.waitForFunction(() => !!window.cadcraft, null, { timeout: 30000 });
              break;
            } catch (e) { if (tries <= 1) throw e; await page.waitForTimeout(5000); }
          }
        } catch (e) { console.log(`  could not open the lab at ${scale} (${e.message.split('\n')[0]})`); browserProblems.push(`${name} ${scale}`); await ctx.close(); continue; }
        if (touch) {
          await page.evaluate(() => {
            const c = document.querySelector('[data-over]'), r = c.getBoundingClientRect();
            const o = { pointerType: 'touch', pointerId: 77, isPrimary: true, clientX: r.left + 20, clientY: r.top + 20, bubbles: true };
            c.dispatchEvent(new PointerEvent('pointerdown', o)); c.dispatchEvent(new PointerEvent('pointerup', o));
          });
        }
        let lastLayouts = -1;
        for (const [w, h] of WINDOWS) {
          await page.setViewportSize({ width: Math.round(w / scale), height: Math.round(h / scale) });
          for (const n of LAYOUTS) {
            if (n !== lastLayouts) {
              await page.evaluate(async ({ n, names }) => {
                const { doc, engine } = window.cadcraft;
                if (!doc.layouts.length) { await engine.run('LAYOUT'); await engine.done; }
                const base = doc.layouts[0];
                const list = names.slice(0, n).map((name, i) => (i === 0 ? { ...base, name } : { ...base, name, entities: new Map() }));
                doc.setSpace(null);
                doc.change('sweep', () => doc.setLayouts(list));
                
              }, { n, names: Array.from({ length: 40 }, (_, i) => LONG(i)) });
              lastLayouts = n;
            }
            for (const mode of n === Math.max(...LAYOUTS) ? MODES : ['normal']) {   // screen modes with the most sheets
              if (mode !== 'normal') {
                // full screen needs a gesture: a real click on an empty spot of the status bar, then the shell's goTo
                await page.mouse.click(5, (await page.evaluate(() => document.querySelector('.cc-status').getBoundingClientRect().bottom)) - 3).catch(() => {});
                await page.evaluate((m) => window.ccShellScreen?.goTo(m), mode === 'full' ? 'full' : 'hidden');
              }
              await page.waitForTimeout(mode === 'normal' ? 60 : 900);   // bars slide off in 0.7 s
              await page.mouse.move(Math.round(w / scale / 2), Math.round(h / scale / 2));
              let problems = await page.evaluate(pageCheck);
              const combo = `${name} ${w}×${h} @${scale * 100}% sheets ${n} panels ${panels}${touch ? ' touch' : ''} ${mode}`;
              const phone = await page.evaluate(() => document.documentElement.classList.contains('cc-phone'));
              if (phone && problems.length) { await page.waitForTimeout(400); problems = await page.evaluate(pageCheck); }
              if (phone && problems.length && Math.round(h / scale) < FLOOR_H) {
                floor++;
                if (LIST) fs.appendFileSync(LIST, JSON.stringify({ combo, floor: true, problems, cssW: Math.round(w / scale), cssH: Math.round(h / scale), phone }) + '\n');
                problems = [];
              }
              record(combo, problems, { w: Math.round(w / scale), h: Math.round(h / scale), phone });
              if (problems.length && SHOTS && fails <= 30) {
                const f = `fail-${String(fails).padStart(2, '0')}.png`;
                await page.screenshot({ path: path.join(SHOTS, f) });
                console.log(`    ${f}: ${combo} — ${problems.join('; ')}`);
              }
              if (mode !== 'normal') { await page.evaluate(() => window.ccShellScreen?.goTo('normal')); await page.waitForTimeout(150); }
            }
          }
          // a real click on the last tab selects it
          const sel = await page.evaluate(() => { const t = [...document.querySelectorAll('[data-tabs] .cc-tab')].pop(); t.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }); const r = t.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 12), y: r.top + r.height / 2 }; });
          await page.mouse.click(sel.x, sel.y);
          await page.waitForTimeout(80);
          const picked = await page.evaluate(() => [...document.querySelectorAll('[data-tabs] .cc-tab')].pop().getAttribute('aria-selected') === 'true');
          if (!picked && Math.round(h / scale) < FLOOR_H && await page.evaluate(() => document.documentElement.classList.contains('cc-phone'))) { floor++; checks++; await page.evaluate(() => { window.cadcraft.doc.setSpace(null); }); continue; }
          record(`${name} ${w}×${h} @${scale * 100}% panels ${panels}${touch ? ' touch' : ''} click`, picked ? [] : ['a real click on the last tab did not select it'], { w: Math.round(w / scale), h: Math.round(h / scale), phone: await page.evaluate(() => document.documentElement.classList.contains('cc-phone')) });
          await page.evaluate(() => { window.cadcraft.doc.setSpace(null);  });
        }
        if (errors.length) record(`${name} @${scale} ${panels}`, errors.map((e) => 'page error: ' + e));
        await ctx.close();
        process.stdout.write(`  @${scale * 100}% panels ${panels}${touch ? ' touch' : ''}: ${checks} checks, ${fails} failing so far\n`);
      }
    }
  }
  await browser.close();
}
execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'sweep']);

console.log(`\n${checks} combinations checked, ${fails} with a problem (${phoneFails} on the phone layout: html.cc-phone, app-phone.js); ${floor} at the floor (phone layout under ${FLOOR_H} CSS px tall)${browserProblems.length ? '; not run: ' + browserProblems.join(', ') : ''}`);
for (const [p, ex] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) console.log(`  ${p}\n      e.g. ${ex.join('\n           ')}`);
process.exit(fails || browserProblems.length ? 1 : 0);
