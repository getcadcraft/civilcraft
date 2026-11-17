// SPDX-License-Identifier: Apache-2.0
// Super: Home on a phone, an upright tablet and a tablet held sideways (owner 2026-11-12: "responsive and mobile capable … in front of clients on a tablet").
// Every Home page (Home, Projects, New project, Learn and each plugin page) at 390, 768 and 1024 px wide, touch on: nothing pushes the page sideways, the menu is a
// drawer under a Menu button below 62rem and the column from there up, fields and buttons are finger-sized.
//   node tools/super-test/home-responsive.mjs [--shots <dir>]
import { start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const SIZES = { phone: { width: 390, height: 844 }, 'tablet-upright': { width: 768, height: 1024 }, 'tablet-sideways': { width: 1024, height: 768 } };
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
for (const [size, viewport] of Object.entries(SIZES)) {
  const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: size === 'phone' });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-super-home', 'on'); const at = n => new Date(Date.now() - n * 3600e3).toISOString();
    localStorage.setItem('cc-super-recent', JSON.stringify([{ id: 'p1abcd', kind: 'folder', name: 'Riverside Library', files: 42, ws: '', at: at(1) }, { id: 'p2abcd', kind: 'file', name: 'Harbour Street Offices, phase two fit-out and landlord works', files: 18, ws: '', at: at(5) }, { id: 'p3abcd', kind: 'new', name: 'Oak Lane House', files: 3, ws: '', at: at(30) }])); } catch { /* no storage */ } });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  const narrow = viewport.width < 992;
  // the menu
  const menuBtn = await page.isVisible('[data-home-menu]');
  ok(menuBtn === narrow, `${size}: the Menu button shows ${narrow ? '' : 'only '}below 62rem`);
  if (narrow) {
    ok((await page.evaluate(() => document.querySelector('.sc-hbar').getBoundingClientRect().height)) <= 60, `${size}: the top bar is one slim row`);
    ok(await page.evaluate(() => getComputedStyle(document.querySelector('.sc-hnav')).visibility === 'hidden'), `${size}: the menu is put away until asked for`);
    await page.click('[data-home-menu]'); await page.waitForTimeout(300);
    ok(await page.isVisible('.sc-hnav [data-hv="projects"]') && (await page.getAttribute('[data-home-menu]', 'aria-expanded')) === 'true' && await page.isVisible('[data-home-scrim]'), `${size}: Menu opens the drawer`);
    ok(await page.evaluate(() => { const r = document.querySelector('.sc-hnav').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && [...document.querySelectorAll('.sc-hnav button')].filter(b => b.offsetParent).every(b => b.getBoundingClientRect().height >= 40); }), `${size}: the drawer fits the screen and its entries are finger-sized`);
    await page.click('.sc-hnav [data-hv="projects"]'); await page.waitForTimeout(300);
    ok(await page.isVisible('[data-home-projects]') && (await page.getAttribute('[data-home-menu]', 'aria-expanded')) === 'false' && !(await page.isVisible('[data-home-scrim]')), `${size}: picking a place goes there and closes the drawer`);
    await page.click('[data-home-menu]'); await page.waitForTimeout(250); await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    ok((await page.getAttribute('[data-home-menu]', 'aria-expanded')) === 'false' && await page.evaluate(() => document.activeElement.matches('[data-home-menu]')), `${size}: Escape closes it and the focus goes back to Menu`);
    await page.click('[data-home-menu]'); await page.waitForTimeout(250); await page.mouse.click(8, viewport.height / 2); await page.waitForTimeout(250);
    ok((await page.getAttribute('[data-home-menu]', 'aria-expanded')) === 'false', `${size}: a tap beside the drawer (left; it opens from the right) closes it`);
  } else {
    ok(await page.isVisible('.sc-hnav [data-hv="projects"]') && (await page.evaluate(() => document.querySelector('.sc-hnav').getBoundingClientRect().width)) < 260, `${size}: the menu is the column on the left`);
  }
  // every page
  const keys = await page.evaluate(() => [...document.querySelectorAll('[data-hvpage]')].map(b => b.dataset.hvpage));
  ok(keys.length >= 5, `${size}: the plugin pages are listed (${keys.length})`);
  for (const v of ['home', 'projects', 'new', 'learn', ...keys]) {
    await page.evaluate(v => { const w = window.superWindow.home; if (v.includes(':')) w.api.showPage(v, {}); else w.show(v); }, v);
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const main = document.querySelector('.sc-hmain'), mr = main.getBoundingClientRect();
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.offsetParent !== null; };
      const scrolls = e => { for (let p = e.parentElement; p && p !== main; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; } return false; };
      const wide = [...main.querySelectorAll('*')].filter(e => vis(e) && e.getBoundingClientRect().right > mr.right + 1 && !scrolls(e)).map(e => (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : e.tagName.toLowerCase()));
      const fields = [...main.querySelectorAll('input, select, textarea')].filter(e => vis(e) && !['checkbox', 'radio', 'range'].includes(e.type));
      return { over: main.scrollWidth - main.clientWidth, page: document.documentElement.scrollWidth - innerWidth, wide: [...new Set(wide)].slice(0, 6), low: fields.filter(e => e.getBoundingClientRect().height < 38).length, grey: fields.filter(e => getComputedStyle(e).backgroundColor !== 'rgb(255, 255, 255)').length, h1: !!main.querySelector('h1') };
    });
    ok(m.over <= 0 && !m.wide.length,   // Home only: the drawing space under it (its top bar) is wider than a tablet and is not part of this test
     `${size} ${v}: nothing wider than the screen (${m.over} px; ${m.wide.join(' ')})`);
    ok(m.low === 0, `${size} ${v}: every field is at least 38 px tall for a finger (${m.low} lower)`);
    ok(m.grey === 0, `${size} ${v}: every field is white`);
    if (shots) await page.screenshot({ path: `${shots}/${size}-${v.replace(':', '-')}.png` });
  }
  // Projects on this size: the actions and the list stay inside the page, the forget x is finger-sized
  await page.evaluate(() => window.superWindow.home.show('projects')); await page.waitForTimeout(300);
  ok(await page.evaluate(() => [...document.querySelectorAll('.sc-pj-acts button, [data-pj-bar] > *, [data-home-table] tr')].filter(e => e.offsetParent).every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })), `${size}: Projects' buttons, bar and rows are inside the screen`);
  ok(await page.evaluate(() => { const r = document.querySelector('[data-forget]').getBoundingClientRect(); return r.width >= 38 && r.height >= 38; }), `${size}: the forget x is finger-sized on a touch screen`);
  ok(errors.length === 0, `${size}: no page error: ` + errors.join('; '));
  await ctx.close();
}
console.log(`home-responsive: ${pass} passed, ${fail} failed`); await browser.close(); await close(); process.exit(fail ? 1 : 0);
