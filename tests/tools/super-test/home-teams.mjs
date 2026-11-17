// SPDX-License-Identifier: Apache-2.0
// Super: Teams and Team members are PAGES of the welcome area (menu entry, no dialog, no app opening behind them), buttons are readable (white text on blue), and the commands reach the pages.
//   node tools/super-test/home-teams.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
const lum = c => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const colours = sel => page.$eval(sel, n => { const c = getComputedStyle(n); return { fg: c.color, bg: c.backgroundColor }; });
const HOME = '.sc-home', PG = '[data-home-view="page"]:not([hidden])';
const homeShown = () => page.evaluate(() => { const h = document.querySelector('.sc-home'); return !!h && !h.hidden && h.getBoundingClientRect().width > 300; });
const dialogs = () => page.$$eval('dialog[open]', n => n.length);

// the welcome page: the primary button has white text
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(400);
let c = await colours('[data-home-continue]'); ok(contrast(c.fg, c.bg) >= 4.5 && lum(c.fg) > 0.6, `the welcome page's primary button has light text on its blue (${c.fg} on ${c.bg}, contrast ${contrast(c.fg, c.bg).toFixed(1)})`);
// the left menu has Teams; it opens a page, not a dialog
ok(await page.$('.sc-hnav [data-hvpage="teams:teams"]') !== null, 'the welcome menu has a Teams entry: ' + await page.$$eval('.sc-hnav button', n => n.map(x => x.textContent.trim()).join(', ')));
ok(await page.$('.sc-hnav [data-hvpage="teams:members"]') === null, 'Team members has no menu entry of its own (it is reached from a team)');
const mounts0 = await page.evaluate(() => document.querySelectorAll('[data-mount]').length), ws0 = await page.evaluate(() => window.superWindow.state.active);
await page.click('.sc-hnav [data-hvpage="teams:teams"]'); await page.waitForSelector(PG + ' [data-act="team-new"]');
ok(await page.textContent(PG + ' h1') === 'Teams', 'the Teams page has its heading'); ok(await homeShown() && await dialogs() === 0, 'it is a page of the welcome area: the welcome page stays, and no dialog is open');
ok(await page.$eval('.sc-hnav [data-hvpage="teams:teams"]', b => b.getAttribute('aria-current')) === 'true', 'its menu entry is marked as the current one');
await page.click(PG + ' [data-act="team-new"]'); await page.waitForSelector(PG + ' [data-tm-new]'); await page.fill(PG + ' [data-tm-new]', 'Design team');
c = await colours(PG + ' [data-act="team-add"]'); ok(contrast(c.fg, c.bg) >= 4.5 && lum(c.fg) > 0.6, `"Add team" has white text on its blue (${c.fg} on ${c.bg})`);
await page.click(PG + ' [data-act="team-add"]'); await page.waitForSelector(PG + ' [data-team-card]');
ok(await homeShown() && await dialogs() === 0, 'adding a team keeps you on the welcome page: no dialog, no drawing space');
ok((await page.evaluate(() => document.querySelectorAll('[data-mount]').length)) === mounts0 && await page.evaluate(() => window.superWindow.state.active) === ws0, 'and no app was opened or mounted behind it');
ok(await page.$(PG + ' [data-tm-empty]') !== null, 'a team with nobody on it shows the empty state'); await page.screenshot({ path: `${OUT}/home-teams-1-teams.png` });
// Add people: the right-hand side, from the empty state
await page.click(PG + ' [data-act="members-add-empty"]'); await page.waitForSelector(PG + ' [data-tm-addsearch]');
ok(await homeShown() && await dialogs() === 0 && await page.$(PG + ' [data-tm-side-teams]') !== null, 'Add people opens beside the team list (the welcome area, no dialog)');
await page.fill(PG + ' [data-tm-addsearch]', 'ann@example.com'); await page.click(PG + ' [data-tm-invite-new]'); await page.waitForSelector(PG + ' [data-tm-addcard]');
await page.fill(PG + ' [data-tm-p="name"]', 'Ann Page'); await page.fill(PG + ' [data-tm-p="title"]', 'Architect');
await page.click(PG + ' [data-tm-addrole="admin"]'); ok((await page.textContent(PG + ' [data-tm-addcard]')).includes('Changes roles'), 'picking Admin shows what an admin can do');
await page.screenshot({ path: `${OUT}/home-teams-3-add.png` });
await page.click(PG + ' [data-act="members-add-go"]'); await page.waitForSelector(PG + ' [data-member]');
const row = await page.textContent(PG + ' [data-member]'); ok(row.includes('ann@example.com') && row.includes('Ann Page') && row.includes('Invited'), 'the person shows in the members table as Invited: ' + row.replace(/\s+/g, ' ').slice(0, 90));
ok(await page.$eval(PG + ' [data-tm-role]', s => s.value) === 'admin', 'with the role that was picked'); await page.screenshot({ path: `${OUT}/home-teams-2-members.png` });
await page.click(PG + ' [data-tm-filter="active"]'); ok(await page.$(PG + ' [data-member]') === null, 'the Active filter hides an invited person'); await page.click(PG + ' [data-tm-filter="invited"]'); ok(await page.$(PG + ' [data-member]') !== null, 'the Invited filter shows them'); await page.click(PG + ' [data-tm-filter="all"]');
// one member
await page.click(PG + ' [data-act="member-open"]'); await page.waitForSelector(PG + ' [data-tm-memberhead]');
ok((await page.textContent(PG + ' [data-tm-perm]')).includes('Deletes') === false && await page.$(PG + ' [data-tm-roleradio="admin"]:checked') !== null, "the member's page shows their role on the permissions table"); await page.screenshot({ path: `${OUT}/home-teams-4-member.png` });
ok(await page.$eval(PG + ' [data-act="member-apply"]', b => b.disabled), 'Apply is off until a different role is picked');
await page.click(PG + ' [data-tm-roleradio="member"]'); await page.waitForTimeout(100); ok(!(await page.$eval(PG + ' [data-act="member-apply"]', b => b.disabled)), 'picking another role turns Apply on');
await page.screenshot({ path: `${OUT}/home-teams-5-apply.png` }); await page.click(PG + ' [data-act="member-apply"]'); await page.waitForTimeout(150);
ok(await page.$(PG + ' [data-tm-roleradio="member"]:checked') !== null && await page.$eval(PG + ' [data-act="member-apply"]', b => b.disabled), 'Apply saves the role and goes off again');
await page.click(PG + ' [data-act="member-disable"]'); await page.waitForTimeout(150); ok((await page.textContent(PG + ' [data-tm-memberhead]')).includes('Disabled'), 'Disable access marks them Disabled');
await page.click(PG + ' [data-act="member-enable"]'); await page.waitForTimeout(150); ok(!(await page.textContent(PG + ' [data-tm-memberhead]')).includes('Disabled'), 'and turns it back on');
await page.click(PG + ' [data-act="crumb-team"]'); await page.waitForSelector(PG + ' [data-tm-members]');
ok(/1 person/.test(await page.textContent(PG + ' [data-tm-count]')), 'back on the team: it counts its person');
// leaving the page: the welcome page's own views work; nothing stays listening
await page.click('.sc-hnav [data-hv="projects"]'); await page.waitForTimeout(200); ok(await page.$(PG) === null, 'going to Projects leaves the page');
await page.click('.sc-hnav [data-hvpage="teams:teams"]'); await page.waitForSelector(PG + ' [data-team-card]'); ok(true, 'and the Teams page comes back with its data');
// the commands: from the drawing space the Workflow commands bring the welcome area to the page
await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(200); ok(!(await homeShown()), 'in the drawing space the welcome page is away');
await page.evaluate(() => window.superWindow.plugins.run('teams:team-members')); await page.waitForSelector(PG + ' [data-tm-body] [data-tm-side]'); ok(await homeShown() && await dialogs() === 0, 'the Team members command opens that page, not a dialog');
await page.evaluate(() => window.superWindow.plugins.run('teams:new-team')); await page.waitForSelector(PG + ' [data-tm-new]'); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-tm-new')), 'New team… opens the Teams page with the name field ready to type in');
// the Workflow list on the welcome page: its buttons no longer drop you into the drawing space
await page.click('.sc-hnav [data-hv="home"]'); await page.waitForTimeout(300);   // the Workflow list sits on Home now
await page.click('.sc-home-cmd[data-cmd="teams:teams"]'); await page.waitForSelector(PG + ' [data-tm-body]'); ok(await homeShown(), 'a Workflow button on the welcome page runs the command without leaving the welcome page');
// switched off: the page and its menu entry go
await page.evaluate(() => window.superWindow.plugins.setEnabled('teams', false)); await page.waitForTimeout(300);
ok(await page.$('.sc-hnav [data-hvpage^="teams:"]') === null && await page.$(PG) === null, 'switching the plugin off removes its menu entry and takes you off its page');
await page.evaluate(() => window.superWindow.plugins.setEnabled('teams', true));
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 2).join(' | '));
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
