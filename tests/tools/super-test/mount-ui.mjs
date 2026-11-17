// SPDX-License-Identifier: Apache-2.0
// Super: a hosted app's own panel buttons ("Open a folder / Documents / Register scans… / New building") are framed and sized to their label both in a SuperCad view and in the
// docked layout's Properties panel, and opening an app shows the page's "Starting up…" indicator naming it, then hides it.   node tools/super-test/mount-ui.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const BTN = ['Open a folder', 'Documents', 'Register scans…', 'New building'];
const measure = page => page.evaluate(names => [...document.querySelectorAll('.bc-folder-btn')].filter(b => b.getBoundingClientRect().width > 0 && names.includes(b.textContent.trim())).map(b => { const c = getComputedStyle(b), r = b.getBoundingClientRect(); const lh = parseFloat(c.lineHeight) || parseFloat(c.fontSize) * 1.25; return { text: b.textContent.trim(), h: Math.round(r.height), w: Math.round(r.width), fs: parseFloat(c.fontSize), borderW: parseFloat(c.borderTopWidth), borderA: (c.borderTopColor.match(/[\d.]+/g) || []).length > 3 ? parseFloat(c.borderTopColor.match(/[\d.]+/g)[3]) : 1, fw: Number(c.fontWeight), minh: c.minHeight, lh: Math.round(lh), padV: parseFloat(c.paddingTop) + parseFloat(c.paddingBottom) }; }), BTN);
const bootLog = () => { window.__boot = []; const push = () => { const chip = document.querySelector('[data-boot]'); if (!chip) return; const st = chip.querySelector('[data-boot-step]'); window.__boot.push({ t: Math.round(performance.now()), hidden: chip.hidden, step: st ? st.textContent : '' }); };
  const watch = () => { const chip = document.querySelector('[data-boot]'); if (!chip) return setTimeout(watch, 5); new MutationObserver(push).observe(chip, { attributes: true, childList: true, subtree: true, characterData: true }); push(); }; watch(); };

for (const [name, query] of [['docked layout (the panel wall)', '?workspace=docked'], ['standard layout (the view)', '']]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(bootLog); const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  await page.goto(url + query); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  // let the page's own start-up settle first, then open the Building app
  await page.waitForFunction(() => { const c = document.querySelector('[data-boot]'); return !c || c.hidden; }, null, { timeout: 30000 }); await page.waitForTimeout(400);
  const pageBoot = await page.evaluate(() => window.__boot.slice()); ok(pageBoot.some(x => !x.hidden && /\S/.test(x.step)), `${name}: the page's own "Starting up…" ran at load, with step names: ` + pageBoot.filter(x => !x.hidden).map(x => x.step).slice(0, 3).join(' / '));
  const mark = await page.evaluate(() => window.__boot.length);
  // The Building view is in front from the start now (BK.3: the window opens in Build), so it opened during the page's own start-up. The indicator for "an app being
  // opened" is tried on a view that is not open yet: the 2D drawing, the tab beside it, opened the way a person does.
  ok(await page.evaluate(() => window.superWindow.state.active === 'build' && document.querySelector('[data-panel="bim"]')?.dataset.mount === 'ready' && !document.querySelector('[data-panel="cad"]')), `${name}: the Building view opened with the window, the 2D drawing is not open yet`);
  await page.click('[data-panel-tab="cad"]');
  await page.waitForFunction(() => ['ready', 'failed'].includes((document.querySelector('[data-panel="cad"]') || {}).dataset?.mount), null, { timeout: 40000 }); await page.waitForTimeout(2500);
  ok(await page.evaluate(() => document.querySelector('[data-panel="cad"]').dataset.mount) === 'ready', `${name}: the 2D drawing opened`);
  const log = (await page.evaluate(() => window.__boot.slice())).slice(mark), vis = log.filter(x => !x.hidden && x.step), at = vis.findIndex(x => /Opening 2D drawing/.test(x.step));
  ok(at >= 0, `${name}: opening the app shows "Opening 2D drawing…" in the indicator: ` + vis.map(x => x.step).slice(0, 4).join(' / '));
  ok(at >= 0 && vis.slice(at + 1).filter(x => !/Opening 2D drawing/.test(x.step)).length >= 1, `${name}: then the real steps (files being fetched) follow: ` + vis.slice(at + 1, at + 4).map(x => x.step).join(' / '));
  ok(await page.evaluate(() => document.querySelector('[data-boot]').hidden), `${name}: and the indicator is gone once the app is ready`);
  // back to the Building view: its own panel buttons are what is measured below
  await page.click('[data-panel-tab="bim"]'); await page.waitForFunction(() => document.querySelector('.sc-body.is-active-view')?.dataset.panel === 'bim', null, { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(600);
  const btns = await measure(page); ok(btns.length === 4, `${name}: the four buttons are on screen: ` + btns.map(b => b.text).join(', '));
  for (const b of btns) {
    ok(b.borderW >= 1 && b.borderA > 0.5, `${name}: "${b.text}" has a visible frame (${b.borderW}px, alpha ${b.borderA})`);
    ok(b.h <= b.lh + b.padV + 2 * b.borderW + 3 && b.h <= 36, `${name}: "${b.text}" is as tall as its label needs (${b.h}px: line ${b.lh} + padding ${b.padV} + border), not 48+`);
    ok(b.fs >= 12 && b.fs <= 15 && b.fw >= 500, `${name}: "${b.text}" is in the panel's text size and readable (${b.fs}px, weight ${b.fw})`);
  }
  // the ribbon's tool frames hug their icon and label (they used to be a fixed 75px with ~30px empty under the label)
  const rib = await page.evaluate(() => [...document.querySelectorAll('.ws-group-tools > .ws-tool')].filter(b => b.getBoundingClientRect().width > 0).map(b => { const r = b.getBoundingClientRect(), c = getComputedStyle(b); const kids = [...b.children].filter(k => k.getBoundingClientRect().height > 0); const bottom = Math.max(...kids.map(k => k.getBoundingClientRect().bottom)); return { t: b.textContent.trim().slice(0, 12), h: Math.round(r.height), empty: Math.round(r.bottom - bottom - parseFloat(c.paddingBottom) - parseFloat(c.borderBottomWidth)) }; }));
  if (query) { ok(rib.length >= 3, `${name}: the ribbon has large tools (${rib.length})`); for (const b of rib.slice(0, 6)) ok(b.empty <= 4 && b.h <= 56, `${name}: ribbon tool "${b.t}" hugs its icon and label (${b.h}px tall, ${b.empty}px empty under the label)`); }
  // Home: a button in the docked title bar takes you back to the welcome page
  if (query) {
    const home = await page.$('.ws-titlebar .ws-quick [data-ws-command="home"], .ws-quick .ws-tool[aria-label="Home"], .ws-quick .ws-tool[title="Home"]');
    ok(!!home, `${name}: the title bar has a Home button`);
    if (home) { await home.click(); await page.waitForTimeout(500); ok(await page.evaluate(() => { const h = document.querySelector('.sc-home'); const r = h && h.getBoundingClientRect(); return !!r && r.width > 300 && r.height > 300 && getComputedStyle(h).visibility !== 'hidden'; }), `${name}: pressing it shows the welcome page`); await page.screenshot({ path: `${OUT}/mount-ui-home.png` }); }
  }
  await page.screenshot({ path: `${OUT}/mount-ui-${query ? 'docked' : 'standard'}.png` }); ok(errors.length === 0, `${name}: no page errors: ` + errors.slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
