// SPDX-License-Identifier: Apache-2.0
// SuperCad Studio Home (the intro screen) in a real browser: it opens first, the workspaces are doors into the drawing space, the Home button
// comes back, a new project is remembered and offered again, and the preference and #editor skip it. Unit part: bin/test-super-home.mjs.
//   node tools/super-test/home.mjs
import { start, launch } from './serve.mjs';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const errors = [];
const open = async (home = 'on') => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (home) await ctx.addInitScript(h => { try { if (!sessionStorage.getItem('t-seen')) { localStorage.setItem('cc-super-home', h); sessionStorage.setItem('t-seen', '1'); } } catch { /* none */ } }, home);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e.message)));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errors.push(m.text()); });
  return { ctx, page };
};
const boot = async (page, q = '') => { await page.goto(URL0 + q); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); };
const shown = page => page.evaluate(() => { const h = document.querySelector('[data-sc-home]'); return !h.hidden && getComputedStyle(h).display !== 'none'; });

{
  const { ctx, page } = await open('on');
  await boot(page);
  ok(await shown(page), 'Home is the first thing on screen');
  ok((await page.textContent('[data-home-greeting]')).length > 3, 'it greets by the time of day');
  ok(await page.evaluate(() => document.body.classList.contains('sc-home-on')), 'the page behind does not scroll');
  ok(await page.locator('.sc-quick button').count() >= 3, 'the start actions are there');
  const doors = await page.evaluate(() => [...document.querySelectorAll('[data-home-doors] [data-door]')].map(b => b.dataset.door));
  ok(JSON.stringify(doors) === JSON.stringify(['layout', 'build', 'model', 'report', 'finalize']), 'the five workspaces are the doors (Home keeps all five while the bar starts with Build, BK.77): ' + doors);
  ok((await page.textContent('[data-home-recent="6"]')).trim().length > 10 && (await page.locator('.sc-pcard').count()) === 0, 'no recent projects are invented');
  ok(!!(await page.textContent('[data-home-project]')).includes('0'), 'This project reads the open project (nothing in it yet)');

  await page.click('[data-door="build"]');
  ok(!(await shown(page)), 'a door closes Home');
  ok((await page.evaluate(() => window.superWindow.state.active)) === 'build', 'and opens that workspace');
  ok((await page.evaluate(() => location.hash)) === '#editor', 'the address says drawing space');

  await page.click('[data-act="home"]');
  ok(await shown(page), 'the Home button on the bar comes back');
  ok((await page.evaluate(() => location.hash)) === '#home', 'the address says Home');
  ok((await page.evaluate(() => document.querySelector('[data-door="build"]').classList.contains('is-on'))), 'the door of the workspace you were in is marked');

  // New project is a page of Home now (name, client, dates, units), not a name prompt: Create makes the project and goes to the drawing space
  await page.click('[data-home-act="new"]');
  ok(await page.waitForSelector('[data-np-name]', { timeout: 8000 }).then(() => true).catch(() => false) && await shown(page), 'New project opens the New project page, still on Home');
  await page.fill('[data-np-name]', 'Test house'); await page.click('[data-act="np-create"]');
  await page.waitForFunction(() => window.superWindow.project.name === 'Test house', null, { timeout: 8000 }).catch(() => {});
  ok((await page.evaluate(() => window.superWindow.project.name)) === 'Test house', 'Create makes the project with the name typed');
  await page.waitForFunction(() => { const h = document.querySelector('[data-sc-home]'); return h.hidden || getComputedStyle(h).display === 'none'; }, null, { timeout: 8000 }).catch(() => {});
  ok(!(await shown(page)), 'and goes straight to the drawing space');
  ok(await page.evaluate(() => { const w = window.superWindow; return w.state.active === 'build' && w.M.visible(w.state).includes('bim'); }), 'in Build, with the building view (BK.3)');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-recent')));
  ok(stored.length === 1 && stored[0].name === 'Test house' && stored[0].kind === 'new', 'it is remembered in this browser only: ' + JSON.stringify(stored));

  await page.goto(URL0); await page.waitForSelector('[data-sc-ready]');
  ok(await shown(page), 'a reload opens on Home again');
  ok((await page.locator('[data-home-recent="6"] .sc-pcard').count()) === 1 && (await page.textContent('[data-home-recent="6"] b')) === 'Test house', 'and offers the project');
  await page.click('[data-hv="projects"]');
  ok(await page.locator('[data-home-table] tr').count() === 1, 'the Projects view lists it');
  // the Projects page (super-home-projects.js): tabs with counts, search, cards or list, the open project, real empty states
  ok(await page.isVisible('[data-pj-kind="all"]') && (await page.textContent('[data-pj-kind="all"] .sc-nt-count')) === '1' && await page.isVisible('[data-pj-kind="new"]') && await page.$('[data-pj-kind="folder"]') === null, 'tabs: All and the kinds that exist, with counts');
  ok(!(await page.isVisible('[data-pj-now]')), 'after a reload nothing is open, so there is no Open now line');
  await page.evaluate(() => { window.superWindow.project.name = 'Test house'; window.superWindow.home.show('projects'); });
  ok(await page.isVisible('[data-pj-now]') && /Test house/.test(await page.textContent('[data-pj-now]')) && await page.isVisible('[data-pj-now] [data-home-act="continue"]'), 'a named open project has its own line, with the way back to the drawing space');
  ok(!(await page.isVisible('[data-home-projects] [data-home-none]')) && await page.isVisible('[data-pj-foot]'), 'no empty state while there is a project');
  await page.fill('[data-pj-q]', 'zzz');
  ok(await page.isVisible('[data-pj-miss]') && await page.locator('[data-home-table] tr').count() === 0 && await page.evaluate(() => document.activeElement.matches('[data-pj-q]')), 'a search with no match says so and keeps the cursor in the box');
  await page.click('[data-pj-clear]');
  ok(await page.locator('[data-home-table] tr').count() === 1 && (await page.inputValue('[data-pj-q]')) === '', 'Clear the search brings the list back');
  await page.click('[data-pj-mode="cards"]');
  ok(await page.locator('[data-pj-cards] .sc-pj-card').count() === 1 && !(await page.isVisible('[data-home-tablewrap]')) && (await page.getAttribute('[data-pj-mode="cards"]', 'aria-pressed')) === 'true', 'Cards shows the same projects as cards');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-projects-view')).mode === 'cards'), 'and the choice is remembered on this computer');
  await page.click('[data-pj-mode="list"]');
  ok(await page.locator('[data-home-table] tr').count() === 1 && await page.isVisible('[data-home-tablewrap]'), 'List is the table again');
  ok(await page.isVisible('[data-home-projects] [data-home-act="new"]') && await page.isVisible('[data-home-projects] [data-home-act="open-file"]'), 'New project and Open project file are on the page');
  await page.click('[data-forget]');
  ok(await page.locator('[data-home-table] tr').count() === 0 && (await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-recent')).length)) === 0, 'Forget removes the name from the list');
  ok(await page.isVisible('[data-home-projects] [data-home-none]') && !(await page.isVisible('[data-pj-bar]')) && !(await page.isVisible('[data-pj-tabs]')) && (await page.locator('[data-home-projects] [data-home-none]').count()) === 1, 'with nothing left: one empty state, no bar, no tabs');
  // the Workflow view became blocks of Home itself (the doors with their longer words and engines, then the workflow tools)
  await page.click('[data-hv="home"]');
  ok(await page.locator('[data-home-view="home"] [data-home-block="start"] [data-door]:visible').count() === 5 && await page.evaluate(() => [...document.querySelectorAll('[data-home-block="start"] [data-door]')].every(b => b.querySelector('small')?.textContent.trim().length > 10 && b.querySelector('.sc-door-app')))
    , 'Home lists the five workspaces with their longer words and the engines behind each');
  ok(await page.locator('[data-home-view="home"] [data-home-block="workflow"] .sc-home-cmd:visible').count() > 0, 'and the workflow plugins\' own commands');

  await page.goto(URL0 + '#editor'); await page.waitForSelector('[data-sc-ready]');
  ok(!(await shown(page)), '#editor in the address skips Home');
  await page.goto(URL0 + '?workspace=docked#home'); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  ok(await shown(page), 'the docked layout opens on Home too');
  await page.click('[data-home-act="continue"]');
  await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 });
  ok(!(await shown(page)) && await page.locator('body.ws-on .ws-ribbon').isVisible(), 'and Continue lands in the ribbon layout');
  await ctx.close();
}
{
  const { ctx, page } = await open(null);   // the shared launcher's default: the preference is off
  await boot(page);
  ok(!(await shown(page)), 'with the preference off the window opens straight in the drawing space');
  await ctx.close();
}
console.log(`home: ${pass} passed, ${fail} failed`);
if (errors.length) { console.log('page errors:', [...new Set(errors)].slice(0, 6)); fail++; }
await browser.close(); close(); process.exit(fail ? 1 : 0);
