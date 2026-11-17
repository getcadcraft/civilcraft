// SPDX-License-Identifier: Apache-2.0
// Super: Compact view, the tablet and phone MODE of the drawing space (owner 2026-11-12: "you have to be able to function AND see the drawing … how about switching css
// or having a different display mode?"). super-compact.js + supercadcraft-compact.css.
// On by itself on a tablet (1270x760, the owner's case), an upright tablet and a phone; off on a desktop; the person can flip it and it is remembered.
// In the mode: one slim bar, the view has the screen, and everything put away is still reachable (tools, Properties, the app's panels, the other views, every bar button).
//   node tools/super-test/compact.mjs [--shots <dir>]
import { start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const open = async (viewport, touch) => { const ctx = await browser.newContext({ viewport, hasTouch: touch, isMobile: viewport.width < 500 }); const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(500); await noTour(page); return { ctx, page, errors }; };
// the shell offers a new visitor its tour (a pop-over above everything): say no, as a person would, so it is not what the test taps
const noTour = async page => { const b = await page.waitForSelector('.nh-offer [data-k="no"]', { timeout: 2500 }).catch(() => null); if (b) await b.click().catch(() => {}); };
const isOn = page => page.evaluate(() => document.documentElement.classList.contains('sc-compact'));
const stage = page => page.evaluate(() => { const b = [...document.querySelectorAll('.sc-center .sc-body.sc-app')].find(e => e.offsetParent); const s = b && b.querySelector('[class$="-stage"]'); const r = s ? s.getBoundingClientRect() : { width: 0, height: 0 }; return { w: Math.round(r.width), h: Math.round(r.height) }; });

/* ---- a desktop: not in the mode, nothing changed, no extra button in a wide window ---- */
{ const { ctx, page, errors } = await open({ width: 1700, height: 1000 }, false);
  ok(!(await isOn(page)), 'a desktop window is not in Compact view');
  ok(await page.isVisible('.app-bar') && await page.isVisible('.sc-status') && await page.isVisible('.sc-center .sc-tabs') && !(await page.isVisible('[data-act="compact-on"]')), 'the full window is as before: the shell bar, the tab strips, the status line; no Compact button in a wide window');
  ok(await page.$('[data-compact-view]') === null && await page.$('[data-act="compact-more"]') === null, 'none of the mode\'s controls are in the bar');
  ok(errors.length === 0, 'desktop: no page error: ' + errors.join('; ')); await ctx.close(); }

/* ---- the three small screens ---- */
for (const [size, viewport] of Object.entries({ 'tablet-sideways': { width: 1270, height: 760 }, 'tablet-upright': { width: 768, height: 1024 }, phone: { width: 390, height: 844 } })) {
  const { ctx, page, errors } = await open(viewport, true); const W = viewport.width, H = viewport.height;
  ok(await isOn(page), `${size}: Compact view is on by itself`);
  const g = await page.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; const b = e.getBoundingClientRect(); return { t: b.top, h: b.height, w: b.width, r: b.right, b: b.bottom }; };
    return { appbar: r('.app-bar'), bar: r('.sc-root > .sc-bar'), status: r('.sc-root > .sc-status'), tabs: r('.sc-center .sc-tabs'), center: r('.sc-center'), strip: r('.scpage-strip'), left: r('.sc-work > .sc-left'), right: r('.sc-work > .sc-right'), doc: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight,
      barKids: [...document.querySelectorAll('.sc-root > .sc-bar > *')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 4).length }; });
  ok(!g.appbar && !g.status && !g.tabs && !g.left && !g.right, `${size}: the shell bar, the status line, the tab strip and the side strips are put away`);
  ok(g.bar && g.bar.t < 2 && g.bar.h <= 52 && g.bar.r <= W + 1, `${size}: one slim bar at the top (${g.bar && Math.round(g.bar.h)} px)`);
  ok(g.barKids <= 8, `${size}: the bar holds at most eight things (${g.barKids})`);
  ok(g.doc <= W && g.docH <= H + 1, `${size}: pinned to the screen, nothing wider`);
  ok(g.center.w >= W - 2 && g.center.h >= H - 110, `${size}: the view has the screen: ${Math.round(g.center.w)}x${Math.round(g.center.h)} of ${W}x${H}`);
  // the drawing in a real app: Markup
  await page.evaluate(() => document.querySelector('[data-scpage="markup"]').click()); await page.waitForTimeout(2500);
  let s = await stage(page);
  ok(s.w >= W - 2 && s.h >= H * 0.7, `${size} Markup: the sheet area is ${s.w}x${s.h} (${Math.round(100 * s.w * s.h / (W * H))}% of the screen)`);
  ok(await page.isVisible('.sc-app .mc-tools .mc-tool'), `${size} Markup: its tools are still there to work with`);
  if (shots) await page.screenshot({ path: `${shots}/compact-${size}-markup.png` });
  // the app's own side panels, one tap
  await page.click('[data-act="compact-app-panels"]'); await page.waitForTimeout(300);
  ok(await page.isVisible('.sc-app .mc-left') && (await page.getAttribute('[data-act="compact-app-panels"]', 'aria-pressed')) === 'true', `${size}: the side-panels button brings the view's own panels back`);
  await page.click('[data-act="compact-app-panels"]'); await page.waitForTimeout(300);
  ok(!(await page.isVisible('.sc-app .mc-left')) && (await stage(page)).w >= W - 2, `${size}: and puts them away again`);
  // Tools and Properties are drawers
  for (const z of ['left', 'right']) {
    await page.click(`[data-act="compact-${z}"]`); await page.waitForTimeout(300);
    const d = await page.evaluate(z => { const e = document.querySelector('.sc-work > .sc-' + z); const b = e.getBoundingClientRect(); return { w: b.width, l: b.left, r: b.right, shown: !!e.querySelector('.sc-frame')?.offsetParent, cw: document.querySelector('.sc-center').getBoundingClientRect().width }; }, z);
    ok(d.shown && d.w >= 240 && d.l >= 0 && d.r <= W + 1 && d.cw >= W - 2, `${size}: ${z === 'left' ? 'Tools' : 'Properties'} opens as a drawer over the view (${Math.round(d.w)} px), the view keeps its width`);
    if (size === 'phone') await page.click(`.sc-work > .sc-${z} [data-act="fold-${z}"]`); else await page.click('[data-act="fold-close"]', { position: z === 'left' ? { x: W - 20, y: 200 } : { x: 20, y: 200 } });
    await page.waitForTimeout(300);
    ok(!(await page.isVisible(`.sc-work > .sc-${z}`)), `${size}: and is put away by ${size === 'phone' ? 'its heading' : 'a tap beside it'}`);
  }
  // what the status line would say still reaches the person
  await page.evaluate(() => { const m = document.querySelector('.sc-status .sc-msg'); m.textContent = 'Start the building first.'; }); await page.waitForTimeout(200);
  ok(await page.isVisible('[data-compact-toast]') && /Start the building first/.test(await page.textContent('[data-compact-toast]')) && await page.evaluate(() => { const b = document.querySelector('[data-compact-toast]').getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth + 1 && b.bottom <= innerHeight; }), `${size}: a status message shows for a moment over the view`);
  await page.evaluate(() => window.superWindow.render()); await page.waitForTimeout(150);
  ok(await page.isVisible('[data-compact-toast]'), `${size}: and stays through a redraw of the window`);
  // the view list stands in for the tab strips
  const opts = await page.$$eval('[data-compact-view] option', o => o.map(x => x.value));
  ok(opts.includes('v:cad') && opts.some(v => v.startsWith('w:')), `${size}: the view list has the views and the workspaces (${opts.join(' ')})`);
  await page.selectOption('[data-compact-view]', 'v:cad'); await page.waitForTimeout(2500);
  ok(await page.evaluate(() => window.superWindow.state && document.querySelector('.sc-center .sc-tab[aria-selected="true"]')?.dataset.panelTab === 'cad') && (await page.inputValue('[data-compact-view]')) === 'v:cad', `${size}: choosing 2D drawing brings it to the front`);
  s = await stage(page); ok(s.w >= W - 2 && s.h >= H * 0.4, `${size} 2D drawing: the drawing area is ${s.w}x${s.h}`);
  if (shots) await page.screenshot({ path: `${shots}/compact-${size}-cad.png` });
  await page.evaluate(() => document.querySelectorAll('.nh-offer').forEach(e => e.remove()));   // CadCraft offers its own tour when its view opens
  // More: every bar button that was put away, the shell's, Paper / Model, and the way out
  await page.click('[data-act="compact-more"]'); await page.waitForTimeout(250);
  const items = await page.$$eval('[data-compact-menu] [data-compact-press]', e => e.map(x => x.dataset.compactPress));
  ok(['[data-act="open"]', '[data-act="export"]', '[data-act="workflow"]', '[data-act="find"]', '[data-act="panels"]', '.app-bar-help', '.app-bar-settings'].every(k => items.includes(k)), `${size}: More lists the bar buttons that were put away and the shell's (${items.length})`);
  ok(await page.evaluate(() => { const m = document.querySelector('[data-compact-menu]').getBoundingClientRect(); return m.left >= 0 && m.right <= innerWidth + 1 && m.bottom <= innerHeight + 1 && m.top > 30; }), `${size}: the menu is on the screen, under the bar`);
  if (shots) await page.screenshot({ path: `${shots}/compact-${size}-more.png` });
  await page.click('[data-compact-press=\'[data-act="workflow"]\']'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => { const m = document.querySelector('.sc-wf-menu'); if (!m || !m.offsetParent && getComputedStyle(m).position !== 'fixed') return false; const b = m.getBoundingClientRect(); return b.width > 100 && b.left >= 0 && b.right <= innerWidth + 1 && b.top >= 0 && b.bottom <= innerHeight + 1; }), `${size}: Workflow, pressed from More, opens its own menu on the screen`);
  await page.keyboard.press('Escape'); await page.mouse.click(W / 2, H / 2); await page.waitForTimeout(250);
  await page.click('[data-act="compact-more"]'); await page.waitForTimeout(250);
  await page.click('[data-compact-press=".app-bar-settings"]'); await page.waitForTimeout(600);
  ok(await page.evaluate(() => !!document.querySelector('dialog[open]')), `${size}: Settings opens from More though the shell bar is put away`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); await page.evaluate(() => document.querySelector('dialog[open]')?.close());
  // the way out, and back
  await page.evaluate(() => document.querySelectorAll('.nh-offer').forEach(e => e.remove()));
  await page.click('[data-act="compact-more"]'); await page.waitForTimeout(250); await page.click('[data-act="compact-off"]'); await page.waitForTimeout(400);
  ok(!(await isOn(page)) && await page.isVisible('.app-bar') && (await page.evaluate(() => localStorage.getItem('cc-super-compact'))) === 'off', `${size}: Full view leaves the mode and is remembered`);
  ok(await page.isVisible('[data-act="compact-on"]'), `${size}: the full window has a quiet Compact view button`);
  await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(400); await noTour(page);
  ok(!(await isOn(page)), `${size}: still the full view after a reload`);
  await page.click('[data-act="compact-on"]'); await page.waitForTimeout(400);
  ok(await isOn(page) && (await page.evaluate(() => localStorage.getItem('cc-super-compact'))) === null, `${size}: Compact view again, back to automatic (nothing stored)`);
  ok(errors.length === 0, `${size}: no page error: ` + errors.join('; '));
  await ctx.close();
}
console.log(`compact: ${pass} passed, ${fail} failed`); await browser.close(); await close(); process.exit(fail ? 1 : 0);
