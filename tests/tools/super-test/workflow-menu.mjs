// SPDX-License-Identifier: Apache-2.0
// Super: the window bar's ONE "Workflow ▾" menu (SC.14) in headless Chromium: one button instead of a button per plugin, a group per plugin named for it, arrow keys / Home / End,
// Esc and Tab close it and give the focus back to the button, an outside click closes it, an item runs its command and closes the menu, and the five workspace tabs keep whole names at
// 1440 px and fit at 1280 px (the bar's file buttons are icons below 1700 px).
//   node tools/super-test/workflow-menu.mjs
import { start, launch } from './serve.mjs';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const errors = [];
async function open(width, layout = '') {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(String(e.message)));
  await page.goto(URL0 + layout); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  if (layout) await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 });
  return { ctx, page };
}
const WF = '.sc-barbtn[data-act="workflow"]';
const focusAct = page => page.evaluate(() => document.activeElement && (document.activeElement.dataset.act || document.activeElement.tagName));

{
  const { ctx, page } = await open(1440);
  const hostGroups = await page.evaluate(() => window.superWindow.plugins.groups().map(g => ({ plugin: g.plugin, name: g.name, n: g.commands.length, keys: g.commands.map(c => c.key) })));
  // plug-ins added later join the list: the four first ones are there, first, in their registration order; nothing is listed twice
  const FIRST = ['communications', 'notes-tasks', 'timer', 'calendar'], order = hostGroups.map(g => g.plugin);
  ok(order.slice(0, FIRST.length).join() === FIRST.join() && new Set(order).size === order.length, 'the host groups the commands by plugin, in registration order (the first four lead, later plug-ins follow): ' + JSON.stringify(order));
  const nCommands = hostGroups.reduce((n, g) => n + g.n, 0);
  ok(hostGroups.find(g => g.plugin === 'communications').name === 'Communications' && hostGroups.find(g => g.plugin === 'notes-tasks').name === 'Notes and tasks', 'each group carries the plugin\'s own name');

  // one button, no per-plugin buttons
  ok(await page.$$eval(WF, b => b.length) === 1, 'one Workflow button on the bar');
  ok(await page.$$eval('.sc-bar [data-act^="plugin:"]', b => b.length) === 0, 'no per-plugin button on the bar while the menu is closed');
  ok(await page.$eval(WF, b => b.getAttribute('aria-haspopup') === 'menu' && b.getAttribute('aria-expanded') === 'false'), 'the button says it opens a menu, closed');
  ok(await page.$('.sc-wf-menu') === null, 'the menu is not shown until it is opened');

  // open with the mouse: the groups, named
  await page.click(WF);
  ok(await page.waitForSelector('.sc-wf-menu', { timeout: 3000 }).then(() => true).catch(() => false), 'a click opens the menu');
  const m = await page.evaluate(() => { const menu = document.querySelector('.sc-wf-menu'); return { role: menu.getAttribute('role'), expanded: document.querySelector('[data-act=workflow]').getAttribute('aria-expanded'),
    groups: [...menu.querySelectorAll('[role=group]')].map(g => ({ id: g.dataset.wfGroup, label: document.getElementById(g.getAttribute('aria-labelledby')).textContent, items: [...g.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim()) })),
    first: document.activeElement.dataset.act }; });
  ok(m.role === 'menu' && m.expanded === 'true', 'the menu has role menu and the button says expanded');
  ok(m.groups[0].label === 'Communications' && m.groups[0].items.slice(0, 2).join('|') === 'Email…|Communications…', 'group Communications: ' + JSON.stringify(m.groups[0]));
  ok(m.groups[1].label === 'Notes and tasks' && m.groups[1].items.join('|') === 'Notes…|Tasks…|New note…|New task…', 'group Notes and tasks: ' + JSON.stringify(m.groups[1]));
  ok(m.groups[2].label === 'Timer' && m.groups[2].items.join('|') === 'Timer…|Start timer|Pause or resume timer|Stop timer|Add time…', 'group Timer: ' + JSON.stringify(m.groups[2]));
  ok(m.first === 'plugin:communications:email', 'opening puts the focus on the first item: ' + m.first);
  ok(m.groups.map(g => g.id).join() === hostGroups.filter(g => g.n > 0).map(g => g.plugin).join() && m.groups.reduce((n, g) => n + g.items.length, 0) === nCommands, 'the menu has a group for every plug-in with commands, in the host\'s order, with every command: ' + m.groups.map(g => g.id + ' ' + g.items.length).join(', '));

  // keyboard
  await page.keyboard.press('ArrowDown'); ok(await focusAct(page) === 'plugin:communications:log', 'ArrowDown moves to the next item');
  for (let i = 2; i < m.groups[0].items.length; i++) await page.keyboard.press('ArrowDown');   // the rest of the first group, however many commands it has now
  ok(/^plugin:communications:/.test(await focusAct(page)), 'ArrowDown stays in the group down to its last item');
  await page.keyboard.press('ArrowDown'); ok(await focusAct(page) === 'plugin:notes-tasks:notes', 'ArrowDown crosses into the next group');
  await page.keyboard.press('End'); const last = await page.evaluate(() => [...document.querySelectorAll('.sc-wf-menu [role=menuitem]')].at(-1).dataset.act);
  ok(await focusAct(page) === last, 'End jumps to the last item');
  await page.keyboard.press('ArrowDown'); ok(await focusAct(page) === 'plugin:communications:email', 'ArrowDown wraps from the last item to the first');
  await page.keyboard.press('ArrowUp'); ok(await focusAct(page) === last, 'ArrowUp wraps from the first item to the last');
  await page.keyboard.press('Home'); ok(await focusAct(page) === 'plugin:communications:email', 'Home jumps to the first item');
  await page.keyboard.press('Escape');
  ok(await page.$('.sc-wf-menu') === null && await focusAct(page) === 'workflow', 'Esc closes the menu and the focus is back on the button');

  // keyboard open from the button
  await page.focus(WF); await page.keyboard.press('ArrowDown');
  ok(await page.$('.sc-wf-menu') !== null && await focusAct(page) === 'plugin:communications:email', 'ArrowDown on the button opens it on the first item');
  await page.keyboard.press('Escape');
  await page.focus(WF); await page.keyboard.press('ArrowUp');
  ok(await focusAct(page) === last, 'ArrowUp on the button opens it on the last item');
  await page.keyboard.press('Tab');
  ok(await page.$('.sc-wf-menu') === null && await focusAct(page) === 'workflow', 'Tab closes the menu and keeps the focus on the button');

  // an outside click closes it
  await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.mouse.click(400, 600); await page.waitForTimeout(150);
  ok(await page.$('.sc-wf-menu') === null, 'a click outside closes the menu');
  // the Panels menu and the Workflow menu never both stay open
  await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.click('.sc-barbtn[data-act=panels]'); await page.waitForTimeout(150);
  ok(await page.$('.sc-wf-menu') === null && await page.$('.sc-menu[aria-label="Panels"]') !== null, 'opening Panels closes Workflow');

  // an item runs its command, closes the menu, and the focus returns to the button when the dialog closes
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.click('.sc-wf-menu [data-act="plugin:notes-tasks:notes"]');
  await page.waitForSelector('dialog[data-sc-plugin="notes-tasks"][open]');
  ok(await page.$('.sc-wf-menu') === null, 'choosing an item closes the menu and opens its dialog');
  await page.click('[data-act="note-close"]'); await page.waitForTimeout(150);
  ok(await focusAct(page) === 'workflow', 'closing the dialog gives the focus back to the Workflow button: ' + await focusAct(page));
  // Enter on a focused item
  // (on a Notes and tasks item: what the Communications commands open is that plug-in's own business and is changing)
  await page.focus(WF); await page.keyboard.press('ArrowDown'); for (let i = 0; i < m.groups[0].items.length; i++) await page.keyboard.press('ArrowDown');
  ok(await focusAct(page) === 'plugin:notes-tasks:notes', 'the keyboard reaches an item of the second group'); await page.keyboard.press('Enter');
  ok(await page.waitForSelector('dialog[data-sc-plugin="notes-tasks"][open]', { timeout: 8000 }).then(() => true).catch(() => false) && await page.$('.sc-wf-menu') === null, 'Enter on an item runs it and closes the menu'); await page.click('[data-act="note-close"]');

  // Ctrl+K still lists every command
  await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().filter(i => /^app:plugin:/.test(i.id)).length >= 11, null, { timeout: 8000 }).catch(() => {});
  ok(await page.evaluate(() => window.ccPalette.items().filter(i => /^app:plugin:/.test(i.id)).length) >= 13, 'Ctrl+K still lists every plugin command (thirteen)');

  // a plugin switched off leaves the menu (and its group); all off, the button goes
  await page.evaluate(() => { const h = window.superWindow.plugins; h.setEnabled('communications', false); }); await page.waitForTimeout(200);
  await page.click(WF); await page.waitForSelector('.sc-wf-menu');
  ok(await page.$$eval('.sc-wf-menu [role=group]', g => g.map(x => x.dataset.wfGroup).join()) === 'notes-tasks' || (await page.$$eval('.sc-wf-menu [role=group]', g => g.map(x => x.dataset.wfGroup))).every(x => x !== 'communications'), 'a plugin switched off leaves its group out of the menu');
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const h = window.superWindow.plugins; for (const p of h.list()) h.setEnabled(p.id, false); }); await page.waitForTimeout(200);
  ok(await page.$(WF) === null, 'every plugin off: there is no Workflow button');
  await page.evaluate(() => { const h = window.superWindow.plugins; for (const p of h.list()) h.setEnabled(p.id, true); }); await page.waitForTimeout(200);
  ok(await page.$(WF) !== null, 'switched on again: the button is back');
  await ctx.close();
}

// the workspace tabs keep whole names, and the bar does not overflow
for (const w of [1440, 1280]) {
  const { ctx, page } = await open(w);
  const r = await page.evaluate(() => { const bar = document.querySelector('.sc-bar'), ws = document.querySelector('.sc-ws'), tabs = [...document.querySelectorAll('.sc-wstab')];
    return { bar: bar.scrollWidth <= bar.clientWidth + 1, strip: ws.scrollWidth <= ws.clientWidth + 1, ws: [ws.scrollWidth, ws.clientWidth], names: tabs.map(t => t.textContent), whole: tabs.every(t => t.scrollWidth <= t.clientWidth + 1 && t.getBoundingClientRect().right <= ws.getBoundingClientRect().right + 1),
      labelled: [...bar.querySelectorAll('.sc-barbtn')].map(b => [b.dataset.act, b.getAttribute('aria-label') || b.textContent.trim(), getComputedStyle(b.querySelector('.sc-bl') || b).display]) }; });
  ok(r.strip && r.whole, `${w} px: the five workspace tabs show whole names and the strip does not scroll (needs ${r.ws[0]}, has ${r.ws[1]}): ${r.names.join(', ')}`);
  ok(r.bar, `${w} px: the bar does not overflow`);
  ok(r.labelled.filter(([a]) => ['open', 'save', 'export', 'find'].includes(a)).every(([, name, disp]) => name && disp === 'none'), `${w} px: the file buttons are icons (name kept as the accessible name)`);
  if (w === 1440) {
    await page.click(WF); await page.waitForSelector('.sc-wf-menu');
    const inside = await page.evaluate(() => { const r = document.querySelector('.sc-wf-menu').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
    ok(inside, 'the open menu sits inside the window');
    await page.screenshot({ path: process.env.SHOT || '/tmp/sc-workflow-menu.png', clip: { x: 0, y: 0, width: w, height: 330 } });
  }
  await ctx.close();
}
// at 1700 px and wider the file buttons keep their words
{ const { ctx, page } = await open(1800);
  ok(await page.$$eval('.sc-barbtn[data-act="open"] .sc-bl, .sc-barbtn[data-act="save"] .sc-bl', n => n.length === 2 && n.every(x => getComputedStyle(x).display !== 'none')), '1800 px: the file buttons keep their words');
  await ctx.close(); }
// the docked layout keeps the same single menu
{ const { ctx, page } = await open(1440, '?workspace=docked');
  await page.click(WF); await page.waitForSelector('.sc-wf-menu');
  ok(await page.$$eval('.sc-wf-menu [role=menuitem]', i => i.length) === await page.evaluate(() => window.superWindow.plugins.groups().reduce((n, g) => n + g.commands.length, 0)) && await page.$$eval('.sc-wf-menu [role=menuitem]', i => i.length) >= 13, 'the docked layout: the Workflow menu is on the window bar with every command (thirteen or more)');
  await ctx.close(); }
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
