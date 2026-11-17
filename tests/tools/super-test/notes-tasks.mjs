// SPDX-License-Identifier: Apache-2.0
// Super: the notes-tasks plugin (SC.13) in headless Chromium: the four commands in every workspace and in the docked layout, Ctrl+K, the Notes and Tasks dialogs (add, edit,
// remove, restore, filters, a link to what is picked), the Report and price summary strip, the Settings switch, a round trip through the project file, a damaged file.
//   node tools/super-test/notes-tasks.mjs
import { start, launch } from './serve.mjs';
const { url: URL0, close, missing } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const WF = '.sc-barbtn[data-act="workflow"]';
const item = key => `.sc-wf-menu [data-act="plugin:${key}"]`;
const wfOpen = async () => { if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); };
const wfClose = async () => { if (await page.$('.sc-wf-menu')) { await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.sc-wf-menu')); } };
/** is the command in the Workflow menu? (no button at all = no plugin command is on) */
const inMenu = async key => { if (!await page.$(WF)) return false; await wfOpen(); const r = await page.$(item(key)) !== null; await wfClose(); return r; };
const runCmd = async key => { await wfOpen(); await page.click(item(key)); };
const BTN = id => 'notes-tasks:' + id;
const DLG = 'dialog[data-sc-plugin="notes-tasks"][open]';
const file = name => page.evaluate(n => { const b = window.superWindow.P.extGet(window.superWindow.project, 'notes-tasks', n); return b ? JSON.parse(new TextDecoder().decode(b)) : null; }, name);
const closeDlg = async () => { await page.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin="notes-tasks"][open]').forEach(d => d.close())); await page.waitForTimeout(100); };
const ymd = n => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// the host and the plugin
const pl = await page.evaluate(() => ({ list: window.superWindow.plugins.list(), cmds: window.superWindow.plugins.commands().map(c => c.key) }));
const me = pl.list.find(x => x.id === 'notes-tasks');
ok(!!me && me.enabled && !me.error && pl.list.length === 6 && pl.list.every(x => !x.error), 'all four plugins are registered, on and started without an error: ' + JSON.stringify(pl.list));
ok(pl.cmds.filter(k => k.startsWith('notes-tasks:')).join() === 'notes-tasks:notes,notes-tasks:tasks,notes-tasks:new-note,notes-tasks:new-task', 'its four commands: ' + pl.cmds);

// the four buttons in every workspace; the bar still fits
const shown = await page.evaluate(() => window.superWindow.state.shown);
for (const id of shown) {
  await page.click(`.sc-wstab[data-ws="${id}"]`); await page.waitForTimeout(150);
  const has = []; for (const c of ['notes', 'tasks', 'new-note', 'new-task']) has.push(await inMenu(BTN(c)));
  ok(has.every(Boolean), `workspace ${id}: Notes…, Tasks…, New note… and New task… are in the Workflow menu`);
  ok(await page.evaluate(() => { const b = document.querySelector('.sc-bar'); return b.scrollWidth <= b.clientWidth + 1; }), `workspace ${id}: the bar does not overflow at 1440 px`);
}
// Ctrl+K
await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().some(i => i.id === 'app:plugin:notes-tasks:new-task'), null, { timeout: 8000 }).catch(() => {});
const pal = await page.evaluate(() => window.ccPalette ? window.ccPalette.items().filter(i => /^app:plugin:notes-tasks:/.test(i.id)).map(i => i.label) : []);
ok(pal.join('|') === 'Notes…|Tasks…|New note…|New task…', 'Ctrl+K lists all four: ' + pal);
await page.keyboard.press('Control+k'); await page.waitForTimeout(200); await page.keyboard.type('todo');
ok((await page.$$eval('.shell-palette-opt', e => e.map(x => x.textContent))).some(h => /Tasks|New task/.test(h)), 'typing "todo" in Ctrl+K finds the task commands');
await page.keyboard.press('Escape');

// the summary strip is only in Report and price; empty project: "none yet"
await page.click('.sc-wstab[data-ws="build"]'); await page.waitForTimeout(150);
ok(await page.$('[data-sc-summary]') === null, 'the summary strip is not in the Build workspace');
await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(200);
const s0 = await page.evaluate(() => { const s = document.querySelector('[data-sc-summary]'); return s && { hidden: s.hidden, text: s.textContent }; });
ok(s0 && !s0.hidden && /Project summary/.test(s0.text) && /Tasks\s*none yet/.test(s0.text), 'Report and price shows the strip with "none yet": ' + JSON.stringify(s0));

// New note… : the form opens at once; text is shown as text
await runCmd(BTN('new-note')); await page.waitForSelector(DLG);
ok(await page.isVisible('[data-note-form]') && await page.evaluate(() => document.activeElement && document.activeElement.matches('[data-note-text]')), 'New note… opens the dialog with the form, the cursor in the text');
ok(await page.isDisabled('[data-link-pick]'), 'nothing is picked in the apps: the link tick is greyed with the reason');
await page.fill('[data-note-text]', 'Check the <b>stair</b> width\nwith the client'); await page.click('[data-note-new-save]'); await page.waitForTimeout(150);
let notes = await file('notes.json');
ok(notes && notes.notes.length === 1 && notes.notes[0].id === 'n1' && notes.notes[0].text.startsWith('Check the <b>stair</b>') && !notes.notes[0].link, 'the note is saved in Data/notes-tasks/notes.json');
ok(await page.evaluate(() => { const t = document.querySelector('.sc-note-text'); return t && t.querySelector('b') === null && /<b>stair<\/b>/.test(t.textContent); }), 'a note with markup in it shows as text, never as markup');
ok(!(await page.isVisible('[data-note-form]')), 'the form closes after saving');
// edit keeps the earlier text
await page.click('[data-act="note-edit"]'); await page.fill('[data-edit-text]', 'Stair width is 1100'); await page.click('[data-note-save]'); await page.waitForTimeout(150);
notes = await file('notes.json');
ok(notes.notes[0].text === 'Stair width is 1100' && notes.notes[0].history.length === 1 && /Check the/.test(notes.notes[0].history[0].text) && notes.notes[0].editedAt, 'edit keeps the earlier text in its history');
ok(/1 earlier versions? kept/.test(await page.textContent('[data-note-list]')), 'the list says how many earlier versions are kept');
// add a second, written earlier
await page.click('[data-act="note-add"]'); await page.fill('[data-note-text]', 'Supplier phoned on Friday'); await page.fill('[data-note-when]', '2026-10-30T09:15'); await page.click('[data-note-new-save]'); await page.waitForTimeout(150);
notes = await file('notes.json'); ok(notes.notes.length === 2 && /^2026-10-30T/.test(notes.notes[1].time), 'a note can be written after the fact: it keeps the time the person gave');
// search, remove, show removed, restore
await page.fill('[data-note-search]', 'supplier'); ok((await page.$$('[data-note-list] .sc-log-entry')).length === 1, 'search finds the note by its words');
await page.fill('[data-note-search]', '');
await page.click('[data-act="note-remove"][data-note="n2"]'); await page.waitForTimeout(100);
ok((await page.$$('[data-note-list] .sc-log-entry')).length === 1 && (await file('notes.json')).notes[1].removed === true, 'remove hides the note; it is still in the file');
await page.check('[data-note-removed]'); ok((await page.$$('[data-note-list] .sc-log-entry')).length === 2, 'Show removed lists it');
await page.click('[data-act="note-restore"][data-note="n2"]'); await page.waitForTimeout(100); ok(!(await file('notes.json')).notes[1].removed, 'restore brings it back');
// Make a task from a note
await page.click('[data-act="note-task"][data-note="n1"]'); await page.waitForSelector(DLG + ' [data-task-form]:not([hidden])');
ok(await page.inputValue('[data-task-title]') === 'Stair width is 1100' && /From note n1/.test(await page.textContent('[data-task-form]')), 'Make a task opens the task form with the note\'s first line and "From note n1"');
await page.fill('[data-task-due]', ymd(-2)); await page.click('[data-task-save]'); await page.waitForTimeout(200);
let tasks = await file('tasks.json');
ok(tasks && tasks.tasks.length === 1 && tasks.tasks[0].fromNote === 'n1' && tasks.tasks[0].due === ymd(-2) && tasks.tasks[0].status === 'open', 'the task is saved with its due day and the note it came from');
ok(await page.isVisible('[data-chip="overdue"]'), 'a task past its due day is marked Overdue');
// the Report strip, behind the dialog, followed along (and the window was not redrawn)
await page.evaluate(() => { document.querySelector('[data-sc-summary]').__kept = 1; });
await page.click('[data-act="task-add"]'); await page.fill('[data-task-title]', 'Order the steel'); await page.fill('[data-task-due]', ymd(3)); await page.selectOption('[data-task-form-status]', 'doing');
await page.fill('[data-task-who]', 'Dana'); await page.click('[data-task-save]'); await page.waitForTimeout(200);
const strip = await page.evaluate(() => { const s = document.querySelector('[data-sc-summary]'); return { kept: s.__kept === 1, text: s.textContent, warn: !!s.querySelector('.is-warn') }; });
ok(strip.kept, 'a change in the tasks redraws only the strip, never the window');
ok(/1 open · 1 in progress · 0 done/.test(strip.text) && /Overdue\s*1/.test(strip.text) && /Due this week\s*1/.test(strip.text) && strip.warn, 'the strip shows counts by status, overdue (a warning) and due this week: ' + strip.text);
await closeDlg();
// the strip's line opens the task list
await page.click('[data-summary="notes-tasks:overdue"]'); await page.waitForSelector(DLG);
ok(/Tasks/.test(await page.textContent(DLG + ' .sc-find-h')), 'clicking a summary line opens the Tasks dialog');
// filters
await page.selectOption('[data-task-filter="due"]', 'overdue'); let rows = await page.$$eval('[data-task-list] .sc-task-title', e => e.map(x => x.textContent));
ok(rows.join() === 'Stair width is 1100', 'filter overdue: ' + rows); await page.selectOption('[data-task-filter="due"]', 'week'); rows = await page.$$eval('[data-task-list] .sc-task-title', e => e.map(x => x.textContent));
ok(rows.join() === 'Order the steel', 'filter due this week: ' + rows); await page.selectOption('[data-task-filter="due"]', 'all');
await page.selectOption('[data-task-filter="status"]', 'doing'); rows = await page.$$eval('[data-task-list] .sc-task-title', e => e.map(x => x.textContent)); ok(rows.join() === 'Order the steel', 'filter in progress: ' + rows);
await page.selectOption('[data-task-filter="status"]', 'all');
// change status in the list; edit by hand; mark done with a day in the past
await page.selectOption('[data-task-status="t1"]', 'done'); await page.waitForTimeout(150);
tasks = await file('tasks.json'); ok(tasks.tasks[0].status === 'done' && /^\d{4}-\d{2}-\d{2}$/.test(tasks.tasks[0].doneAt) && tasks.tasks[0].history.length === 1, 'changing the status in the list is saved, with the day done and the earlier value');
ok(!(await page.isVisible('[data-chip="overdue"]')), 'a done task is not overdue');
await page.click('[data-act="task-edit"][data-task="t2"]'); await page.selectOption('[data-entry="t2"] [data-task-form-status]', 'done'); await page.fill('[data-entry="t2"] [data-task-doneat]', '2026-10-28'); await page.fill('[data-entry="t2"] [data-task-title]', 'Order the steel (done)');
await page.click('[data-entry="t2"] [data-task-save]'); await page.waitForTimeout(200);
tasks = await file('tasks.json'); ok(tasks.tasks[1].status === 'done' && tasks.tasks[1].doneAt === '2026-10-28' && tasks.tasks[1].title === 'Order the steel (done)' && tasks.tasks[1].history[0].status === 'doing', 'a task can be edited by hand: it was done on a day the person gave, and the earlier values are kept');
const s2 = await page.evaluate(() => document.querySelector('[data-sc-summary]').textContent); ok(/0 open · 0 in progress · 2 done/.test(s2) && !/Overdue/.test(s2) && !/Due this week/.test(s2), 'the strip follows: ' + s2);
// remove and restore a task
await page.click('[data-act="task-remove"][data-task="t2"]'); await page.waitForTimeout(100); ok((await file('tasks.json')).tasks[1].removed === true, 'remove is soft');
await page.check('[data-task-removed]'); await page.click('[data-act="task-restore"][data-task="t2"]'); await page.waitForTimeout(100); ok(!(await file('tasks.json')).tasks[1].removed, 'restore');
await closeDlg();

// a link to what is picked in the apps
await page.evaluate(() => window.superWindow.hub.set('bimcraft', [{ app: 'bimcraft', id: 'wall-17', cls: 'IfcWall' }]));
await runCmd(BTN('new-note')); await page.waitForSelector(DLG);
ok(!(await page.isDisabled('[data-link-pick]')) && /wall-17/.test(await page.textContent('[data-note-form]')), 'something is picked: the link tick is on offer and names it');
await page.fill('[data-note-text]', 'Wall needs a fire rating'); await page.check('[data-link-pick]'); await page.click('[data-note-new-save]'); await page.waitForTimeout(150);
notes = await file('notes.json'); const ln = notes.notes[notes.notes.length - 1];
ok(ln.link && ln.link.app === 'bimcraft' && ln.link.id === 'wall-17' && ln.link.cls === 'IfcWall' && Object.keys(ln.link).every(k => ['app', 'id', 'cls', 'label'].includes(k)), 'the link names the app and the id and carries nothing else: ' + JSON.stringify(ln.link));
ok(/Linked to/.test(await page.textContent('[data-note-list]')), 'the note shows its link');
await closeDlg(); await page.evaluate(() => window.superWindow.hub.clear());

// the round trip through the project file
const rt = await page.evaluate(async () => { const { P, project } = window.superWindow; const a = P.extGet(project, 'notes-tasks', 'tasks.json'), c = P.extGet(project, 'notes-tasks', 'notes.json'); const back = await P.fromBytes(P.toBytes(project, {}));
  const same = (x, y) => !!x && !!y && x.length === y.length && x.every((v, i) => v === y[i]); return { t: same(a, P.extGet(back.project, 'notes-tasks', 'tasks.json')), n: same(c, P.extGet(back.project, 'notes-tasks', 'notes.json')) }; });
ok(rt.t && rt.n, 'both files come back from the project file byte for byte: ' + JSON.stringify(rt));

// Settings › Plugins: the switch, the strip line leaves
const sw = await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="notes-tasks"]'); return { has: !!c, on: c && c.checked, about: (document.querySelector('[data-sc-plugin-row="notes-tasks"]') || {}).textContent }; });
ok(sw.has && sw.on && /task totals/.test(sw.about), 'Settings › SuperCad Studio › Plugins lists it with a switch: ' + JSON.stringify(sw).slice(0, 160));
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="notes-tasks"]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(!await inMenu(BTN('notes')) && !await inMenu(BTN('new-task')), 'switched off: the commands leave the Workflow menu');
ok(await page.evaluate(() => !window.ccPalette.items().some(i => /^app:plugin:notes-tasks:/.test(i.id))), 'switched off: Ctrl+K no longer lists them');
ok(await page.evaluate(() => !/Tasks/.test(document.querySelector('[data-sc-summary]')?.textContent || '')), 'switched off: its lines leave the Report summary');
ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-plugins'))['notes-tasks'] === false), 'the choice is remembered');
const kept = await page.evaluate(async () => { const { P, project } = window.superWindow; const back = await P.fromBytes(P.toBytes(project, {})); return P.extList(back.project, 'notes-tasks').length; });
ok(kept === 2, 'switched off: a save still carries both files untouched: ' + kept);
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="notes-tasks"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(await inMenu(BTN('notes')) && /Tasks/.test(await page.evaluate(() => document.querySelector('[data-sc-summary]').textContent)), 'switched on again: the commands and the summary line are back');

// a damaged tasks file: shown read-only, never written over
await page.evaluate(() => { const { P, project } = window.superWindow; P.extSet(project, 'notes-tasks', 'tasks.json', new TextEncoder().encode('{broken'), 'notes-tasks'); });
await runCmd(BTN('tasks')); await page.waitForSelector(DLG);
ok(/cannot be read/.test(await page.textContent('[data-nt-warn]')) && await page.isDisabled('[data-act="task-add"]'), 'a damaged tasks file is shown read-only: a warning, and no Add');
ok(/cannot be read/.test(await page.evaluate(() => document.querySelector('[data-sc-summary]').textContent)), 'and the Report summary says so');
ok(await page.evaluate(() => new TextDecoder().decode(window.superWindow.P.extGet(window.superWindow.project, 'notes-tasks', 'tasks.json')) === '{broken'), 'the file is left exactly as it was');
await closeDlg();

// the docked layout keeps the bar, and the strip is in Report and price
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0 + '?workspace=docked'); await page.waitForSelector('[data-sc-ready]');
await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 }); await page.evaluate(() => window.superWindow.ready);
ok(await inMenu(BTN('notes')) && await inMenu(BTN('new-task')), 'the docked layout: the four commands are in the window bar\'s Workflow menu too');
await runCmd(BTN('new-task')); await page.waitForSelector(DLG); await page.click('[data-act="task-close"]');
ok(missing.length === 0 || missing.every(x => !/plugins\//.test(x)), 'no plugin file was missing from the page: ' + missing.filter(x => /plugins\//.test(x)).join(','));
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
