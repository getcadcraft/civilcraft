// SPDX-License-Identifier: Apache-2.0
// Super: the timer plugin (SC.14) in headless Chromium: its five commands in the Workflow menu, the status item (running time, pause, stop), one timer at a time, a reload that keeps the
// timer running and asks about a gap when the page was closed, the Timer dialog (entries by hand, edit with history, remove and restore, totals by day and task, CSV), the Report and price
// summary lines, the link to a notes-tasks task, the Settings switch and a damaged file.
//   node tools/super-test/timer.mjs
import { start, launch } from './serve.mjs';
const { url: URL0, close, missing } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
const boot = async (url = URL0) => { await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); };
await boot();
const WF = '.sc-barbtn[data-act="workflow"]';
const item = key => `.sc-wf-menu [data-act="plugin:${key}"]`;
const wfOpen = async () => { if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); };
const wfClose = async () => { if (await page.$('.sc-wf-menu')) { await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.sc-wf-menu')); } };
const inMenu = async key => { if (!await page.$(WF)) return false; await wfOpen(); const r = await page.$(item(key)) !== null; await wfClose(); return r; };
const runCmd = async key => { await wfOpen(); await page.click(item(key)); };
const DLG = 'dialog[data-sc-plugin="timer"][open]';
const SLOT = 'cc-super-plugin-timer';
const PS = '[data-pstat="timer:timer"]', pst = sel => `${PS} ${sel}`;
const statusText = () => page.$eval(pst('.sc-pstat-text'), e => e.textContent).catch(() => null);
const file = () => page.evaluate(() => { const b = window.superWindow.P.extGet(window.superWindow.project, 'timer', 'time.json'); return b ? JSON.parse(new TextDecoder().decode(b)) : null; });
const closeDlg = async () => { await page.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin="timer"][open]').forEach(d => d.close())); await page.waitForTimeout(100); };
const slot = () => page.evaluate(k => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }, SLOT);
let seedN = 0;
/** put a timer in the slot as the page STARTS (leaving the old page fires its heartbeat, which would overwrite a planted "seen") and load the page */
const seedBoot = async (o, url = URL0) => { const id = ++seedN; await page.addInitScript(([i, k, v]) => { if (!localStorage.getItem('__seeded' + i)) { localStorage.setItem(k, JSON.stringify(v)); localStorage.setItem('__seeded' + i, '1'); } }, [id, SLOT, o]); await boot(url); };
const putSlot = (o) => page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [SLOT, o]);
const iso = ms => new Date(ms).toISOString();
const local = (d) => { const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
await page.evaluate(k => localStorage.removeItem(k), SLOT);

// the host and the plugin
const pl = await page.evaluate(() => ({ list: window.superWindow.plugins.list(), cmds: window.superWindow.plugins.commands().map(c => c.key) }));
ok(pl.list.length === 6 && pl.list.every(x => x.enabled && !x.error), 'four plugins are registered, on and started without an error: ' + JSON.stringify(pl.list));
ok(pl.cmds.filter(k => k.startsWith('timer:')).join() === 'timer:timer,timer:start,timer:pause,timer:stop,timer:add', 'its five commands: ' + pl.cmds);

// the Workflow menu: a Timer group in every workspace
const shown = await page.evaluate(() => window.superWindow.state.shown);
for (const id of shown) {
  await page.click(`.sc-wstab[data-ws="${id}"]`); await page.waitForTimeout(120);
  const has = []; for (const c of ['timer', 'start', 'pause', 'stop', 'add']) has.push(await inMenu('timer:' + c));
  ok(has.every(Boolean), `workspace ${id}: the five timer commands are in the Workflow menu`);
}
await wfOpen();
ok(await page.$eval('.sc-wf-menu [data-wf-group="timer"] .sc-menu-h', e => e.textContent) === 'Timer', 'the menu has a Timer group named for the plugin');
const labels = await page.$$eval('.sc-wf-menu [data-wf-group="timer"] [role=menuitem]', n => n.map(x => x.textContent.trim()));
ok(labels.join('|') === 'Timer…|Start timer|Pause or resume timer|Stop timer|Add time…', 'the timer items: ' + labels);
await wfClose();
// Ctrl+K
await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().filter(i => /^app:plugin:timer:/.test(i.id)).length === 5, null, { timeout: 8000 }).catch(() => {});
ok(await page.evaluate(() => window.ccPalette.items().filter(i => /^app:plugin:timer:/.test(i.id)).length) === 5, 'Ctrl+K lists all five');

// the status item: idle, start, tick, pause, resume, stop
ok(/Timer/.test(await statusText() || '') && await page.$(pst('[data-act="pstat:timer:start"]')) !== null && await page.$(pst('[data-act="pstat:timer:open"]')) !== null, 'idle: the status line shows "Timer" with a start button and an open button');
ok(await page.$eval(pst('.sc-pstat-text'), e => e.getAttribute('role')) === 'timer', 'the running time is a role=timer (a screen reader is not told every second)');
await page.click(pst('[data-act="pstat:timer:start"]')); await page.waitForTimeout(300);
const s1 = await slot(); ok(!!s1 && s1.pausedAt === null && s1.pausedMs === 0 && /^\d{4}-/.test(s1.start), 'start: the timer is kept in this browser: ' + JSON.stringify(s1));
const t1 = await statusText(); ok(/^0:00:0\d$/.test(t1), 'running: the status shows H:MM:SS: ' + t1);
await page.waitForTimeout(2300); const t2 = await statusText(); ok(/^0:00:0[2-9]$/.test(t2) && t2 !== t1, 'and it ticks each second: ' + t1 + ' → ' + t2);
// a click is not lost to a tick: the buttons are the same nodes from one tick to the next
const nodeBefore = await page.$eval(pst('[data-act="pstat:timer:pause"]'), e => (e.__probe = 'same'));
await page.waitForTimeout(1200); ok(await page.$eval(pst('[data-act="pstat:timer:pause"]'), e => e.__probe) === 'same', 'a tick updates only the text: the buttons are the same nodes (a click is never swallowed)');
await page.click(pst('[data-act="pstat:timer:pause"]')); await page.waitForTimeout(250);
const tp = await statusText(); ok(/paused/.test(tp || '') || /sc\.timer\.status\.paused/.test(tp || '') || /\d:\d\d:\d\d.*(pause|Pause)/.test(tp || ''), 'pause: the status says paused: ' + tp);
const a1 = await page.$eval(pst('.sc-pstat-text'), e => e.textContent); await page.waitForTimeout(1500); ok(await page.$eval(pst('.sc-pstat-text'), e => e.textContent) === a1, 'a paused timer does not run');
await page.click(pst('[data-act="pstat:timer:pause"]')); await page.waitForTimeout(250);
ok(/^0:00:\d\d$/.test(await statusText()) && (await slot()).pausedAt === null && (await slot()).pausedMs >= 1000, 'resume: running again, and the paused stretch is not counted');

// one timer at a time: a second Start asks
await runCmd('timer:start'); await page.waitForSelector(DLG);
const q = await page.$eval(DLG, d => d.textContent); ok(/Only one timer runs at a time/.test(q), 'a second Start asks: ' + q.slice(0, 120));
const startBefore = (await slot()).start;
await page.click('[data-act="timer-replace-no"]'); await page.waitForTimeout(200);
ok((await slot()).start === startBefore && await page.$(DLG) === null, '"Keep the running timer" changes nothing');
await runCmd('timer:start'); await page.waitForSelector(DLG); await page.waitForTimeout(1100); await page.click('[data-act="timer-replace-yes"]'); await page.waitForTimeout(400);
const s2 = await slot(); ok(s2 && s2.start !== startBefore && s2.pausedMs === 0, '"Stop it and start a new one": the old run is stopped (under 30 s: nothing recorded) and a new one runs');
ok((await file()) === null || (await file()).entries.length === 0, 'a run under 30 seconds recorded nothing');

// stop with real time: a timer that started 40 minutes ago (as after a reload)
await page.evaluate(k => localStorage.removeItem(k), SLOT);
const now = Date.now();
await seedBoot({ v: 1, project: '', start: iso(now - 40 * 60000), seen: iso(now - 5000), pausedMs: 5 * 60000, pausedAt: null, task: '', taskTitle: '', note: 'drawing the stair' });   // as after a reload: the timer is still running
const t3 = await statusText(); ok(/^0:3[45]:\d\d$/.test(t3), 'a reload keeps the timer running (40 min, 5 min paused): ' + t3);
await page.waitForTimeout(1600); ok(await page.$(DLG) === null, 'a short reload is not a gap: no question');
await page.click(pst('[data-act="pstat:timer:stop"]')); await page.waitForTimeout(400);
const f1 = await file(); ok(f1 && f1.entries.length === 1 && f1.entries[0].minutes === 35 && f1.entries[0].source === 'timer' && f1.entries[0].note === 'drawing the stair', 'stop records an entry with the counted minutes (35) and the note: ' + JSON.stringify(f1 && f1.entries[0]));
ok((await slot()) === null && /Timer/.test(await statusText()), 'and the timer is cleared');

// the Timer dialog: entries, totals, by hand
await runCmd('timer:timer'); await page.waitForSelector(DLG);
ok(/never leaves|Nothing is uploaded/.test(await page.$eval(DLG, d => d.textContent)) && /does not notice when you step away/.test(await page.$eval(DLG, d => d.textContent)), 'the dialog says it is local only and has no idle detection');
const row1 = await page.$$eval('[data-tm-list] [data-entry]', n => n.map(x => x.textContent));
ok(row1.length === 1 && /35 m/.test(row1[0]) && /drawing the stair/.test(row1[0]), 'the entry is listed: ' + row1[0].slice(0, 100));
ok(/35 m/.test(await page.$eval('[data-tm-total="project"]', e => e.textContent)), 'the project total is 35 m');
// add by hand: yesterday 14:00 to 16:30 with a 30 minute break left out
const y = new Date(); y.setDate(y.getDate() - 1); y.setHours(14, 0, 0, 0); const y2 = new Date(y); y2.setHours(16, 30);
await page.click('[data-act="timer-add"]'); await page.waitForSelector('[data-tm-form]:not([hidden])');
await page.fill('[data-tm-start]', local(y)); await page.fill('[data-tm-end]', local(y2));
ok(await page.$eval('[data-tm-minutes]', e => e.value) === '150', 'adding by hand: minutes default to end − start (150)');
await page.fill('[data-tm-minutes]', '120'); await page.fill('[data-tm-form-note]', 'forgot to time this; break left out');
await page.click('[data-tm-save]'); await page.waitForTimeout(250);
const f2 = await file(); const hand = f2.entries.find(e => e.source === 'manual');
ok(f2.entries.length === 2 && hand && hand.minutes === 120 && hand.note.startsWith('forgot'), 'the entry is in the project: 120 counted minutes, added by hand');
ok(/by hand|added by hand/.test(await page.$eval('[data-tm-list]', e => e.textContent)), 'and it is marked as added by hand');
// invalid: end before start
await page.click('[data-act="timer-add"]'); await page.fill('[data-tm-start]', local(y2)); await page.fill('[data-tm-end]', local(y)); await page.click('[data-tm-save]');
ok(/end must be after the start/i.test(await page.$eval('[data-tm-form-err]', e => e.textContent)) && (await file()).entries.length === 2, 'an end before the start is refused with the reason, nothing is written');
await page.click('[data-tm-form] .btn-line');
// totals
const days = await page.$$eval('[data-tm-sec="day"] [data-tm-day]', n => n.map(x => x.textContent));
ok(days.length === 2 && /2 h 0 m|2 h/.test(days.join()) && /35 m/.test(days.join()), 'totals by day: two days: ' + days.join(' | '));
ok(/2 h 35 m/.test(await page.$eval('[data-tm-total="project"]', e => e.textContent)), 'the project total is 2 h 35 m');
// edit: fix the end (history is kept)
await page.click(`[data-act="tm-edit"][data-entry-id="${hand.id}"]`); await page.waitForSelector('[data-tm-end]');
const inlineEnd = new Date(y); inlineEnd.setHours(17, 0);
await page.fill('[data-entry="' + hand.id + '"] [data-tm-end]', local(inlineEnd)); await page.fill('[data-entry="' + hand.id + '"] [data-tm-minutes]', '150'); await page.click('[data-entry="' + hand.id + '"] [data-tm-save]'); await page.waitForTimeout(250);
const f3 = await file(); const edited = f3.entries.find(e => e.id === hand.id);
ok(edited.minutes === 150 && edited.history.length === 1 && edited.history[0].minutes === 120 && !!edited.editedAt, 'edit by hand: the new minutes count, the earlier values are kept in history: ' + JSON.stringify(edited.history));
ok(/1 earlier|Edited/.test(await page.$eval(`[data-entry="${hand.id}"]`, e => e.textContent)), 'the list says it was edited');
// remove and restore
await page.click(`[data-act="tm-remove"][data-entry-id="${hand.id}"]`); await page.waitForTimeout(200);
ok((await file()).entries.find(e => e.id === hand.id).removed === true && /\b35 m\b/.test(await page.$eval('[data-tm-total="project"]', e => e.textContent)) && !/2 h/.test(await page.$eval('[data-tm-total="project"]', e => e.textContent)), 'remove is soft: still in the file, out of the totals');
await page.click('[data-tm-removed]'); await page.click(`[data-act="tm-restore"][data-entry-id="${hand.id}"]`); await page.waitForTimeout(200);
ok(!(await file()).entries.find(e => e.id === hand.id).removed, 'Show removed, then Restore brings it back');
// CSV
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click('[data-act="timer-csv"]')]);
const csvText = await (async () => { const rs = await dl.createReadStream(); let s = ''; for await (const c of rs) s += c; return s; })();
ok(/-time\.csv$/.test(dl.suggestedFilename()) && csvText.split('\r\n')[0] === 'id,start,end,minutes,task,task title,note,source,edited' && csvText.includes('drawing the stair') && csvText.split('\r\n').filter(Boolean).length === 3, 'CSV export downloads the entries: ' + dl.suggestedFilename());
await page.screenshot({ path: process.env.SHOT || '/tmp/sc-timer-dialog.png' }); await closeDlg();

// a task from notes-tasks: the select, the title kept in the entry, totals by task, and the plugin off
await page.evaluate(() => { const { P, project } = window.superWindow; const doc = { format: 'supercadcraft-tasks', version: 1, seq: 2, tasks: [
  { id: 't1', time: new Date().toISOString(), title: 'Door schedule', status: 'open', who: '' }, { id: 't2', time: new Date().toISOString(), title: 'Finished thing', status: 'done', who: '', doneAt: '2026-11-01' }] };
  P.extSet(project, 'notes-tasks', 'tasks.json', new TextEncoder().encode(JSON.stringify(doc)), 'notes-tasks'); });
await runCmd('timer:add'); await page.waitForSelector('[data-tm-form]:not([hidden])');
const opts = await page.$$eval('[data-tm-task-select] option', o => o.map(x => x.textContent)); ok(opts.join('|') === 'No task|Door schedule', 'the task list offers open tasks only (not the done one): ' + opts);
await page.selectOption('[data-tm-task-select]', 't1'); await page.fill('[data-tm-form-note]', 'on a task');
await page.click('[data-tm-save]'); await page.waitForTimeout(250);
const f4 = await file(); const tk = f4.entries.find(e => e.task === 't1'); ok(tk && tk.taskTitle === 'Door schedule', 'the entry keeps the task id and its title: ' + JSON.stringify(tk && [tk.task, tk.taskTitle]));
await page.click('[data-tm-sec="task"] summary'); const bytask = await page.$$eval('[data-tm-sec="task"] [data-tm-task]', n => n.map(x => x.textContent));
ok(bytask.some(x => /Door schedule/.test(x)) && bytask.some(x => /No task/.test(x)), 'totals by task: ' + bytask.join(' | '));
await closeDlg();
// Settings: switch tasks off; the timer still reads the title it kept
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=notes-tasks]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(200);
await runCmd('timer:timer'); await page.waitForSelector(DLG);
ok(/Door schedule/.test(await page.$eval('[data-tm-list]', e => e.textContent)), 'with Notes and tasks off the entry still shows its task title');
await page.click('[data-act="timer-add"]'); await page.waitForSelector('[data-tm-form]:not([hidden])');
ok(/Notes and tasks plugin is turned off/.test(await page.$eval(DLG, d => d.textContent)) && (await page.$$eval('[data-tm-task-select] option', o => o.map(x => x.textContent))).join('|') === 'No task', 'degrades cleanly when the tasks plugin is off: it says so and offers only "No task"'); await closeDlg();
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=notes-tasks]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(200);

// Report and price: the summary lines
await page.click('.sc-wstab[data-ws="report"]'); await page.waitForSelector('[data-sc-summary]');
const sum = await page.$$eval('[data-sc-summary] [data-summary^="timer:"]', n => n.map(x => [x.dataset.summary, x.textContent]));
ok(sum.map(x => x[0]).join() === 'timer:today,timer:project', 'Report and price: time today and time this project: ' + JSON.stringify(sum));
ok(/h|m/.test(sum[1][1]) && /Time this project/.test(sum[1][1]), 'the project line reads as hours and minutes: ' + sum[1][1]);
await page.click('[data-sc-summary] [data-summary="timer:project"]'); await page.waitForSelector(DLG); ok(true, 'a summary line opens the Timer dialog'); await closeDlg();
await page.screenshot({ path: process.env.SHOT2 || '/tmp/sc-timer-report.png', clip: { x: 0, y: 0, width: 1440, height: 260 } });

// the page was closed while the timer ran: the gap question (discard, then keep)
const n2 = Date.now();
await seedBoot({ v: 1, project: '', start: iso(n2 - 4 * 3600000), seen: iso(n2 - 3 * 3600000), pausedMs: 0, pausedAt: null, task: '', taskTitle: '', note: '' }); await page.waitForSelector(DLG, { timeout: 6000 });
const gq = await page.$eval(DLG, d => d.textContent); ok(/was closed while the timer ran/.test(gq) && /3 h/.test(gq), 'the gap question names how long: ' + gq.slice(0, 160));
await page.click('[data-act="timer-gap-discard"]'); await page.waitForTimeout(300);
const tg = await statusText(); ok(/^1:00:\d\d$/.test(tg) && (await slot()).pausedMs >= 3 * 3600000 - 2000, 'discard: the 3 hours do not count, the timer keeps running: ' + tg);
await page.evaluate(k => localStorage.removeItem(k), SLOT);
await seedBoot({ v: 1, project: '', start: iso(n2 - 4 * 3600000), seen: iso(n2 - 3 * 3600000), pausedMs: 0, pausedAt: null, task: '', taskTitle: '', note: '' }); await page.waitForSelector(DLG, { timeout: 6000 }); await page.click('[data-act="timer-gap-keep"]'); await page.waitForTimeout(300);
ok(/^4:00:\d\d$/.test(await statusText()), 'keep: the 3 hours count: ' + await statusText());
// a paused timer closed and reopened: no gap question
await page.click(pst('[data-act="pstat:timer:pause"]')); await page.waitForTimeout(200);
const sp = await slot(); await seedBoot({ ...sp, seen: iso(Date.now() - 6 * 3600000) }); await page.waitForTimeout(2000); ok(await page.$(DLG) === null, 'a paused timer has no gap question');
await page.evaluate(k => localStorage.removeItem(k), SLOT);

// Settings › Plugins: the switch
await boot();
const sw = await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=timer]'); return { has: !!c, on: c && c.checked, about: (document.querySelector('[data-sc-plugin-row=timer] .shell-hint-text:last-child') || {}).textContent || '' }; });
ok(sw.has && sw.on && /project timer/i.test(await page.$eval('[data-sc-plugin-row=timer]', e => e.textContent)), 'Settings › Plugins lists the timer with a switch');
await page.evaluate(() => { const { P, project } = window.superWindow; const e = { id: 'e1', start: '2026-11-02T09:00:00.000Z', end: '2026-11-02T10:00:00.000Z', minutes: 60, note: 'kept while off', source: 'manual' };
  P.extSet(project, 'timer', 'time.json', new TextEncoder().encode(JSON.stringify({ format: 'supercadcraft-time', version: 1, seq: 1, entries: [e] })), 'timer'); });
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=timer]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(!await inMenu('timer:timer') && await page.$(PS) === null, 'switched off: the commands and the status item go');
ok(await page.evaluate(() => !window.ccPalette.items().some(i => /^app:plugin:timer:/.test(i.id))), 'switched off: Ctrl+K no longer lists them');
const kept = await page.evaluate(async () => { const { P, project } = window.superWindow; const a = P.extGet(project, 'timer', 'time.json'); const back = await P.fromBytes(P.toBytes(project, {})); const b = P.extGet(back.project, 'timer', 'time.json');
  return { n: P.extList(back.project, 'timer').length, same: !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]) }; });
ok(kept.n === 1 && kept.same, 'with the plugin off a save still carries its file untouched: ' + JSON.stringify(kept));
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=timer]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(await inMenu('timer:timer') && await page.$(PS) !== null, 'switched on again: back');

// a round trip through the project file keeps the entries
await runCmd('timer:add'); await page.waitForSelector('[data-tm-form]:not([hidden])'); await page.fill('[data-tm-form-note]', 'for the round trip'); await page.click('[data-tm-save]'); await page.waitForTimeout(200); await closeDlg();
const rt = await page.evaluate(async () => { const { P, project } = window.superWindow; const a = P.extGet(project, 'timer', 'time.json'); const back = await P.fromBytes(P.toBytes(project, {})); const b = P.extGet(back.project, 'timer', 'time.json'); return { same: !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]) }; });
ok(rt.same, 'the time file comes back from the project file byte for byte');
// a damaged file is shown read-only and never written over
await page.evaluate(() => { const { P, project } = window.superWindow; P.extSet(project, 'timer', 'time.json', new TextEncoder().encode('{ damaged'), 'timer'); });
await runCmd('timer:timer'); await page.waitForSelector(DLG);
ok(/cannot be read/.test(await page.$eval('[data-tm-warn]', e => e.textContent)) && await page.$eval('[data-act="timer-add"]', b => b.disabled), 'a damaged file: the dialog says so and Add is off');
await closeDlg();
await page.evaluate(() => { const { P, project } = window.superWindow; window.__badBefore = Array.from(P.extGet(project, 'timer', 'time.json')).join(); });
await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(150);
ok(/cannot be read/.test(await page.$eval('[data-sc-summary] [data-summary="timer:time"]', e => e.textContent).catch(() => '')), 'and the Report summary says so with a warning line');
ok(await page.evaluate(() => Array.from(window.superWindow.P.extGet(window.superWindow.project, 'timer', 'time.json')).join() === window.__badBefore), 'the damaged file was left exactly as it was');

// the docked layout: the status item is on the window's status line too
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await boot(URL0 + '?workspace=docked'); await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 });
ok(await page.$('[data-sc-pstatus] .sc-pstat') !== null, 'the docked layout: the status item is there');
await runCmd('timer:timer'); await page.waitForSelector(DLG); await closeDlg();
ok(missing.length === 0 || missing.every(x => !/plugins\//.test(x)), 'no plugin file was missing from the page: ' + missing.filter(x => /plugins\//.test(x)).join(','));
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
