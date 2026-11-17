// SPDX-License-Identifier: Apache-2.0
// Super: the Notes and tasks PAGE of the notes-tasks plugin in headless Chromium, against the design (docs: SuperCad Studio Notes and tasks, 4 boards): write an annotation and a task with it, filter by where,
// run the timer from a task (banner, pause, stop), add time by hand, read the week as a calendar, set the two Calendar switches.
//   node tools/super-test/notes-page.mjs [--shots <dir>]
import { start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 940 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const file = (plugin, n) => page.evaluate(([plugin, n]) => { const b = window.superWindow.P.extGet(window.superWindow.project, plugin, n); return b ? JSON.parse(new TextDecoder().decode(b)) : null; }, [plugin, n]);
const shot = async n => { if (shots) await page.screenshot({ path: `${shots}/${n}.png`, fullPage: true }); };
await page.evaluate(() => window.superWindow.home.api.showPage('notes-tasks:notes-tasks', {}));
await page.waitForSelector('[data-nt-body]');
ok(await page.$('.sc-nt-crumb') === null && await page.$('[data-act="nt-tab-time"]') !== null, 'no breadcrumb, and the three tabs');
ok(await page.$('[data-act="nt-rail-all"]') !== null && await page.$('[data-act="nt-rail-site"]') !== null, 'the Where rail lists All notes and Site');
// a project-wide note, then an annotation that is also a task
await page.click('[data-act="nt-new"]');
await page.fill('[data-nt-title]', 'What the client cares about most'); await page.fill('[data-nt-text]', 'Daylight in the reading room.');
await page.click('[data-act="nt-save"]'); await page.waitForSelector('.sc-nt-title');
await page.click('[data-act="nt-new"]');
await page.fill('[data-nt-title]', 'Keep the oak by the north entrance'); await page.fill('[data-nt-text]', 'Do not move the oak.');
await page.click('[data-act="nt-scope-view"]'); await page.selectOption('[data-nt-place]', 'site'); await page.fill('[data-nt-spot]', 'North entrance oak');
await page.check('[data-nt-also]'); await shot('1-new-note');
await page.click('[data-act="nt-save"]'); await page.waitForSelector('.sc-nt-sheet');
const nf = await file('notes-tasks', 'notes.json'), n2 = nf && nf.notes[1];
ok(n2 && n2.where && n2.where.kind === 'site' && n2.where.place === 'North entrance oak', 'the annotation keeps where it applies');
ok((await file('notes-tasks', 'tasks.json')).tasks[0].fromNote === n2.id, '"Also make it a task" made a task from the annotation');
ok((await page.$$('.sc-nt-nrow')).length === 2 && await page.$('.sc-nt-chip.is-open') !== null, 'two rows, the annotation shows its task chip');
await page.click('[data-act="nt-nf-ann"]'); ok((await page.$$('.sc-nt-nrow')).length === 1, 'the Annotations filter keeps one'); await page.click('[data-act="nt-nf-all"]');
await page.click('[data-act="nt-rail-site"]'); ok((await page.$$('.sc-nt-nrow')).length === 1, 'the Site place on the rail keeps one'); await shot('2-notes'); await page.click('[data-act="nt-rail-all"]');
await page.click('[data-act="nt-pin"]').catch(() => {}); 
// tasks: run the timer from a task
await page.click('[data-act="nt-tab-tasks"]'); await page.waitForSelector('[data-nt-task]');
ok(await page.$('.sc-nt-sum') !== null, 'the task list has its summary line');
await page.click('[data-nt-play]'); await page.waitForSelector('[data-nt-banner]');
ok(/^\d+:\d\d:\d\d$/.test((await page.textContent('[data-nt-banner] [data-nt-clock]')).trim()), 'play starts the timer: the banner shows a clock');
await page.waitForTimeout(2300); ok((await page.textContent('[data-nt-banner] [data-nt-clock]')).trim() !== '0:00:00', 'the clock ticks in place');
await page.click('[data-act="nt-pause"]'); await page.waitForSelector('.sc-nt-banner.is-paused'); ok(true, 'pause');
await page.click('[data-act="nt-stop"]'); await page.waitForFunction(() => !document.querySelector('[data-nt-banner]'));
ok(true, 'stop (a run under 30 seconds records nothing)');
// add time by hand on the task, then the week
await page.click('[data-nt-task]'); await page.click('[data-act="nt-addhand"]'); await page.click('[data-act="nt-len-30"]'); await shot('3-tasks');
await page.click('[data-act="nt-addtime"]'); await page.waitForSelector('[data-nt-entry]');
const tf = await file('timer', 'time.json'); ok(tf && tf.entries.length === 1 && tf.entries[0].minutes === 30 && /^t\d+$/.test(tf.entries[0].task), 'time added by hand lands in the timer file, on the task');
await page.click('[data-act="nt-tab-time"]'); await page.waitForSelector('[data-nt-day]');
ok((await page.$$('[data-nt-day]')).length === 7 && await page.$('.sc-nt-blk') !== null, 'the week is a calendar of seven days with a block for the entry');
ok(await page.$('.sc-nt-bar-row') !== null, 'time by task');
await shot('4-time');
await page.uncheck('[data-nt-pref="showDue"]');
ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-plugin-notes-tasks')).showDue === false), 'the Calendar switch is remembered');
await page.evaluate(() => window.superWindow.home.api.showPage('calendar:calendar', {}));
await page.waitForSelector('.sc-cal-chip.is-logged', { timeout: 8000 }).then(() => ok(true, 'the Calendar shows the logged time on its day'), () => ok(false, 'the Calendar shows the logged time on its day'));
ok(errors.length === 0, 'no page error: ' + errors.join('; '));
console.log(`${pass} passed, ${fail} failed`); await browser.close(); await close(); process.exit(fail ? 1 : 0);
