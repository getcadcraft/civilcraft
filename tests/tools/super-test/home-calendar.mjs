// SPDX-License-Identifier: Apache-2.0
// Super: the Calendar PAGE (month / week / day / year, calendars by owner, tasks, the list, search, add by click, .ics), and the dropdown look of the Timer dialog.
//   node tools/super-test/home-calendar.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
const PG = '[data-home-view="page"]:not([hidden])';
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(300);
ok(await page.$('.sc-hnav [data-hvpage="calendar:calendar"]') !== null, 'the welcome menu has a Calendar entry');
// a team and a task first, so the calendars and the tasks panel have something
await page.click('.sc-hnav [data-hvpage="teams:teams"]'); await page.waitForSelector(PG + ' [data-act="team-new"]'); await page.click(PG + ' [data-act="team-new"]'); await page.waitForSelector(PG + ' [data-tm-new]');
await page.fill(PG + ' [data-tm-new]', 'Structural'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForSelector(PG + ' [data-team-card]');
await page.click('.sc-hnav [data-hvpage="calendar:calendar"]'); await page.waitForSelector(PG + ' [data-cal-page]');
ok((await page.textContent(PG + ' h1')) === 'Calendar', 'the page has its heading');
ok(await page.evaluate(() => document.querySelectorAll('dialog[open]').length) === 0, 'it is a page, no dialog');
ok(await page.$$eval(PG + ' [data-cal-toggle]', n => n.length) === 2, 'two calendars: the project and the Structural team');
ok(await page.$(PG + ' .sc-cal-side [data-cal-showtasks]') === null && await page.$(PG + ' [data-cal-gearpanel] [data-cal-showtasks]') !== null, 'the due-dates switch lives in the gear, not in the left column');
ok(await page.isVisible(PG + ' [data-cal-gearpanel]') === false, 'the gear panel starts closed');
await page.click(PG + ' [data-cal-gear]'); ok(await page.isVisible(PG + ' [data-cal-gearpanel]'), 'the gear opens the settings'); await page.keyboard.press('Escape'); ok(await page.isVisible(PG + ' [data-cal-gearpanel]') === false, 'Escape closes it');
const cb = await page.$$eval(PG + ' [data-cal-toggle]', n => n.map(x => { const c = getComputedStyle(x); return { on: x.checked, bg: c.backgroundColor, border: c.borderTopColor }; }));
ok(cb.every(x => x.on && x.bg === x.border && x.bg !== 'rgba(0, 0, 0, 0)') && new Set(cb.map(x => x.bg)).size === cb.length, 'each calendar checkbox is filled with its own colour: ' + JSON.stringify(cb));
const w = await page.$eval(PG + ' [data-cal-page]', n => n.getBoundingClientRect().width); ok(w > 1100, 'the page uses the full width: ' + Math.round(w));
// add by clicking a day in the month view
ok(await page.$$eval(PG + ' [data-cal-cell]', n => n.length) === 42, 'month view: 42 day cells');
const day = await page.$eval(PG + ' [data-cal-cell].is-today', n => n.dataset.calCell);
await page.click(PG + ` [data-cal-cell="${day}"]`, { position: { x: 60, y: 70 } }); await page.waitForSelector('dialog[open] [data-cal-title]');
ok(await page.$('dialog[open] [data-cal-owner]') !== null && await page.$('dialog[open] [data-cal-color]') !== null, 'the form has Calendar and Colour');
ok(!/\b(null|undefined)\b/.test(await page.$eval('dialog[open]', d => d.innerText)), 'the event form shows no stray null or undefined text');
ok(await page.$eval('dialog[open] [data-cal-reminders]', n => getComputedStyle(n).gridTemplateColumns.split(' ').length) > 1, 'reminder ticks sit in more than one column');
await page.screenshot({ path: OUT + '/home-calendar-4-form.png' });
ok(await page.$('dialog[open] [data-cal-list]:not([hidden])') === null, 'the form opens alone, without the list behind it');
await page.fill('dialog[open] [data-cal-title]', 'Design review'); await page.selectOption('dialog[open] [data-cal-owner]', 'Structural'); await page.click('dialog[open] [data-cal-save]');
await page.waitForFunction(() => !document.querySelector('dialog[open] [data-cal-title]'));
ok(await page.$(PG + ' [data-cal-chip]') !== null, 'the new event shows in the month');
ok((await page.textContent(PG + ' [data-cal-events]')).includes('Design review'), 'and in the events list');
await page.screenshot({ path: `${OUT}/home-calendar-1-month.png` });
// colour by owner, hide a calendar, search
const col1 = await page.$eval(PG + ' [data-cal-chip]', n => getComputedStyle(n).borderLeftColor);
await page.click(PG + ' [data-cal-toggle="team:Structural"]'); ok(await page.$(PG + ' [data-cal-chip]') === null, 'hiding the team calendar hides its events'); await page.click(PG + ' [data-cal-toggle="team:Structural"]');
await page.fill(PG + ' [data-cal-search]', 'zzz'); ok(await page.$(PG + ' [data-cal-chip]') === null && await page.$(PG + ' [data-cal-empty]') !== null, 'search with no match: empty'); await page.fill(PG + ' [data-cal-search]', 'design'); ok(await page.$(PG + ' [data-cal-chip]') !== null, 'search finds it'); await page.fill(PG + ' [data-cal-search]', '');
ok(!/\bnull\b|undefined/.test(await page.textContent(PG)), 'the Calendar page shows no stray "null"');
// the views
for (const v of ['week', 'day', 'year', 'month']) { await page.click(PG + ` [data-cal-view="${v}"]`); await page.waitForTimeout(250); ok(await page.$eval(PG + ' [data-cal-grid]', n => n.dataset.calView) === v, v + ' view shows'); if (v !== 'month') await page.screenshot({ path: `${OUT}/home-calendar-2-${v}.png` }); }
await page.click(PG + ' [data-cal-view="week"]'); await page.waitForSelector(PG + ' [data-cal-col]');
ok(await page.$$eval(PG + ' [data-cal-col]', n => n.length) === 7, 'week view: 7 columns'); ok(await page.$(PG + ' [data-cal-col] [data-cal-chip]') !== null, 'the event is a block in its hour');
// click an empty slot of the day column
const col = await page.$(PG + ' [data-cal-col].is-today'); const box = await col.boundingBox(); await page.mouse.click(box.x + 8, box.y + 3 * 16 * 14 + 4); await page.waitForSelector('dialog[open] [data-cal-title]'); ok(true, 'clicking an hour opens the form'); await page.click('dialog[open] .btn-line:has-text("Cancel")'); await page.waitForTimeout(150);
// .ics
const dl = page.waitForEvent('download', { timeout: 4000 }).catch(() => null); await page.click(PG + ' [data-act="cal-export-all"]'); const d = await dl;
if (d) { const f = await d.path(); const txt = (await import('node:fs')).readFileSync(f, 'utf8'); ok(/BEGIN:VCALENDAR/.test(txt) && /SUMMARY:Design review/.test(txt) && txt.includes('\r\n'), 'Export .ics downloads a calendar with the event'); } else ok(false, 'Export .ics downloaded nothing');
// month: next / prev / today
const t0 = await page.textContent(PG + ' [data-cal-title]'); await page.click(PG + ' [data-cal-view="month"]'); await page.click(PG + ' [data-cal-next]'); ok((await page.textContent(PG + ' [data-cal-title]')) !== t0, 'next moves the month'); await page.click(PG + ' [data-cal-today]');
// dropdown look + the Timer dialog
await page.evaluate(() => window.superWindow.plugins.run('timer:timer')); await page.waitForSelector('dialog[open] select'); await page.waitForTimeout(200);
const sel = await page.$eval('dialog[open] select', n => { const c = getComputedStyle(n); return { app: c.appearance, bg: c.backgroundImage.slice(0, 20), h: n.getBoundingClientRect().height, w: n.getBoundingClientRect().width }; });
ok(sel.app === 'none' && /gradient/.test(sel.bg) && sel.h >= 36, 'dropdowns have the site look: ' + JSON.stringify(sel));
ok(!/\bnull\b|undefined/.test(await page.textContent('dialog[open]')), 'the Timer dialog shows no stray "null"');
await page.screenshot({ path: `${OUT}/home-calendar-3-timer.png` });
ok(errors.length === 0, 'no page errors: ' + errors.join(' | '));
console.log(`home-calendar: ${pass} passed, ${fail} failed`); await browser.close(); close(); process.exit(fail ? 1 : 0);
