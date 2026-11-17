// SPDX-License-Identifier: Apache-2.0
// Super: the Communications PAGE (menu entry, no dialog): log by hand a call, see it in the log, follow-up, per-person view, delete + undo, Email files page.
//   node tools/super-test/home-comms.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
const PG = '[data-home-view="page"]:not([hidden])';
const dialogs = () => page.$$eval('dialog[open]', n => n.length);
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(300);
ok(await page.$('.sc-hnav [data-hvpage="communications:communications"]') !== null, 'the welcome menu has a Communications entry');
await page.click('.sc-hnav [data-hvpage="communications:communications"]'); await page.waitForSelector(PG + ' [data-act="cm-hand"]');
ok(await dialogs() === 0, 'it is a page, not a dialog'); ok(await page.$(PG + ' [data-cm-empty]') !== null, 'an empty log says so');
// log a call by hand with a follow-up
await page.click(PG + ' [data-act="cm-hand"]'); await page.waitForSelector(PG + ' [data-cm-hsubject]');
await page.fill(PG + ' [data-cm-input="hInput"]', 'Pieter van Wyk'); await page.keyboard.press('Enter');
await page.fill(PG + ' [data-cm-hsubject]', 'Transfer beam review'); await page.fill(PG + ' [data-cm-hbody]', 'Moved to Monday.');
await page.check(PG + ' [data-cm-hfollow]'); await page.fill(PG + ' #cm-hfutext', 'Send Pieter the IFC');
await page.click(PG + ' [data-act="cm-hand-save"]'); await page.waitForSelector(PG + ' [data-cm-entry]');
ok((await page.textContent(PG + ' [data-cm-detail]')).includes('Transfer beam review') && (await page.textContent(PG + ' [data-cm-detail]')).includes('Send Pieter the IFC'), 'the new call is selected, with its follow-up');
ok((await page.textContent(PG + ' [data-cm-flash]')).includes('Entry added'), 'a message confirms it');
await page.click(PG + ' [data-act="cm-fu-toggle"]'); ok((await page.textContent(PG + ' [data-cm-fu]')).includes('Done'), 'the follow-up can be marked done');
// person view
await page.click(PG + ' [data-cm-person]:not([data-cm-person=""])'); ok(await page.$(PG + ' [data-cm-pcard]') !== null, 'a person opens their history');
await page.click(PG + ' [data-act="cm-person-clear"]');
// search + tabs
await page.fill(PG + ' [data-cm-search]', 'zzzz'); ok(await page.$(PG + ' [data-cm-empty]') !== null, 'search with no match shows the empty state'); await page.fill(PG + ' [data-cm-search]', '');
await page.click(PG + ' [data-cm-tab="email"]'); ok(await page.$(PG + ' [data-cm-empty]') !== null, 'the Email tab is empty'); await page.click(PG + ' [data-cm-tab="all"]');
// delete + undo
await page.click(PG + ' [data-act="cm-delete"]'); ok(await page.$(PG + ' [data-cm-empty]') !== null, 'deleting removes it'); await page.click(PG + ' [data-act="cm-undo"]');
ok(await page.$(PG + ' [data-cm-entry]') !== null, 'Undo brings it back'); await page.screenshot({ path: `${OUT}/home-comms-1-log.png` });
// Email files page
await page.click(PG + ' [data-act="cm-email"]'); await page.waitForSelector(PG + ' [data-act="mail-prepare"]'); ok(await dialogs() === 0, 'Email files is a page too');
await page.fill(PG + ' [data-cm-input="input"]', 'a@example.com'); await page.keyboard.press('Enter'); ok(await page.$(PG + ' [data-cm-chosen="a@example.com"]') !== null, 'an address becomes a chip');
await page.screenshot({ path: `${OUT}/home-comms-2-email.png` });
ok(!errors.length, 'no page errors ' + errors.join(' | '));
console.log(`\n${pass} passed, ${fail} failed`); await browser.close(); close(); process.exit(fail ? 1 : 0);
