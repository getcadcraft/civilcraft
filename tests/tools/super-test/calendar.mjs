// SPDX-License-Identifier: Apache-2.0
// Super: the calendar plugin (SC.15) in headless Chromium: its two commands in the Workflow menu and Ctrl+K, the Events dialog (add, edit, remove, restore, search, a link to what is picked), "Add to
// calendar" (a real download of a valid .ics, the same bytes kept in the project, UID and SEQUENCE across an edit, a fake share sheet, a cancelled one), the line each export adds to the communications
// log and its panel, tasks with a due day as an all-day event or a to-do, the Report and price summary lines, a hostile title, the Settings switch, a damaged file and the project round trip.
// A real calendar program cannot be driven here: the file is checked by structure, not by opening it in one.   node tools/super-test/calendar.mjs
import fs from 'node:fs';
import { start, launch } from './serve.mjs';
const { url: URL0, close, missing } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const WF = '.sc-barbtn[data-act="workflow"]';
const item = key => `.sc-wf-menu [data-act="plugin:${key}"]`;
const wfOpen = async () => { if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); };
const wfClose = async () => { if (await page.$('.sc-wf-menu')) { await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.sc-wf-menu')); } };
const inMenu = async key => { if (!await page.$(WF)) return false; await wfOpen(); const r = await page.$(item(key)) !== null; await wfClose(); return r; };
const runCmd = async key => { await wfOpen(); await page.click(item(key)); };
const DLG = 'dialog[data-sc-plugin="calendar"][open]', CDLG = 'dialog[data-sc-plugin="communications"][open]';
const file = (plugin, name) => page.evaluate(([p, n]) => { const b = window.superWindow.P.extGet(window.superWindow.project, p, n); return b ? new TextDecoder().decode(b) : null; }, [plugin, name]);
const json = async (plugin, name) => { const t = await file(plugin, name); return t ? JSON.parse(t) : null; };
const closeDlg = async () => { await page.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin][open]').forEach(d => d.close())); await page.waitForTimeout(100); };
const ymd = n => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const BS = String.fromCharCode(92);   // one backslash: RFC 5545 escapes (BS + ';' and BS + ',')
const unfold = t => t.replace(/\r\n /g, '');
/** click a button that downloads, and return the downloaded file's name and text */
async function downloads(selector) {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click(selector)]);
  return { name: dl.suggestedFilename(), text: fs.readFileSync(await dl.path(), 'utf8') };
}
/** the structural checks of RFC 5545 that matter for our files (CRLF, ≤ 75 octets, balanced, one component, escaped text) */
function validate(text, kind = 'VEVENT') {
  if (!text.endsWith('\r\n') || /[^\r]\n|\r[^\n]/.test(text)) return 'line ends';
  const phys = text.slice(0, -2).split('\r\n'); if (phys.some(l => Buffer.byteLength(l) > 75)) return 'a line over 75 octets';
  const lines = []; for (const l of phys) { if (l[0] === ' ') lines[lines.length - 1] += l.slice(1); else lines.push(l); }
  const stack = []; let comp = 0;
  for (const l of lines) { const m = /^([A-Z][A-Z0-9-]*)((?:;[A-Z][A-Z0-9-]*=[^;:]*)*):(.*)$/.exec(l); if (!m) return 'not a content line: ' + l.slice(0, 30);
    if (m[1] === 'BEGIN') { stack.push(m[3]); if (m[3] === kind) comp++; } else if (m[1] === 'END') { if (stack.pop() !== m[3]) return 'unbalanced'; } }
  return stack.length ? 'unbalanced' : comp !== 1 ? 'not one ' + kind : lines.filter(l => l.startsWith('UID:')).length !== 1 ? 'uid' : null;
}

// the host and the plugin
const pl = await page.evaluate(() => ({ list: window.superWindow.plugins.list(), cmds: window.superWindow.plugins.commands().map(c => c.key) }));
const me = pl.list.find(x => x.id === 'calendar');
ok(!!me && me.enabled && !me.error && pl.list.length === 6 && pl.list.every(x => !x.error), 'all four plugins are registered, on and started without an error: ' + JSON.stringify(pl.list));
ok(pl.cmds.filter(k => k.startsWith('calendar:')).join() === 'calendar:events,calendar:new-event', 'its two commands: ' + pl.cmds);

// the two commands in every workspace; the bar still fits
const shown = await page.evaluate(() => window.superWindow.state.shown);
for (const id of shown) {
  await page.click(`.sc-wstab[data-ws="${id}"]`); await page.waitForTimeout(150);
  ok(await inMenu('calendar:events') && await inMenu('calendar:new-event'), `workspace ${id}: Events… and New event… are in the Workflow menu`);
  ok(await page.evaluate(() => { const b = document.querySelector('.sc-bar'); return b.scrollWidth <= b.clientWidth + 1; }), `workspace ${id}: the bar does not overflow at 1440 px`);
}
await wfOpen();
const grp = await page.evaluate(() => [...document.querySelectorAll('.sc-wf-menu [role=group]')].map(g => ({ id: g.dataset.wfGroup, label: document.getElementById(g.getAttribute('aria-labelledby')).textContent, items: [...g.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim()) })));
const cal = grp.find(g => g.id === 'calendar'); ok(cal && cal.label === 'Calendar' && cal.items.join('|') === 'Events…|New event…', 'a group named Calendar in the menu: ' + JSON.stringify(cal)); await wfClose();
// Ctrl+K
await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().some(i => i.id === 'app:plugin:calendar:new-event'), null, { timeout: 8000 }).catch(() => {});
ok(await page.evaluate(() => window.ccPalette.items().filter(i => /^app:plugin:calendar:/.test(i.id)).map(i => i.label).join('|')) === 'Events…|New event…', 'Ctrl+K lists both');
await page.keyboard.press('Control+k'); await page.waitForTimeout(200); await page.keyboard.type('ics');
ok((await page.$$eval('.shell-palette-opt', e => e.map(x => x.textContent))).some(h => /Events/.test(h)), 'typing "ics" in Ctrl+K finds Events…'); await page.keyboard.press('Escape');

// the summary strip, empty
await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(200);
const s0 = await page.evaluate(() => (document.querySelector('[data-sc-summary]') || {}).textContent || '');
ok(/Events\s*none yet/.test(s0), 'Report and price shows "Events none yet": ' + s0);

// New event…: the form opens at once; add a timed event
await runCmd('calendar:new-event'); await page.waitForSelector(DLG);
ok(await page.isVisible('[data-cal-form]') && await page.evaluate(() => document.activeElement && document.activeElement.matches('[data-cal-title]')), 'New event… opens the dialog with the form, the title field focused');
ok(/does not connect to a calendar account/.test(await page.textContent('[data-cal-honest]')) && /invitation/.test(await page.textContent('[data-cal-honest]')), 'the dialog says plainly: no calendar account, no invitations');
ok(await page.isDisabled('[data-link-pick]'), 'nothing is picked in the apps: the link tick is greyed with the reason');
const D1 = ymd(1);
await page.fill('[data-cal-title]', 'Site visit <b>now</b>, bring; coffee'); await page.fill('[data-cal-start]', `${D1}T10:00`); await page.fill('[data-cal-end]', `${D1}T11:30`);
await page.fill('[data-cal-place]', 'Corner shop, 12 Main St'); await page.fill('[data-cal-note]', 'Bring the survey\nand the camera'); await page.check('[data-cal-rem="15"]'); await page.click('[data-cal-save]'); await page.waitForTimeout(200);
let ev = await json('calendar', 'events.json');
const iso = s => page.evaluate(v => new Date(v).toISOString(), s);
ok(ev && ev.events.length === 1 && ev.events[0].id === 'e1' && ev.events[0].start === await iso(`${D1}T10:00`) && ev.events[0].end === await iso(`${D1}T11:30`) && JSON.stringify(ev.events[0].reminders) === '[{"m":15}]' && ev.events[0].place === 'Corner shop, 12 Main St', 'the event is saved in Data/calendar/events.json with exact moments: ' + JSON.stringify(ev && ev.events[0]).slice(0, 200));
ok(!(await page.isVisible('[data-cal-form]')), 'the form closes after saving');
ok(await page.evaluate(() => { const t = document.querySelector('.sc-task-title'); return t && t.querySelector('b') === null && /<b>now<\/b>/.test(t.textContent); }), 'a title with markup in it shows as text, never as markup');
ok(await page.isVisible('[data-cal-section="upcoming"]') && !await page.$('[data-cal-section="past"]') && /Coming up/.test(await page.textContent('[data-cal-section="upcoming"] h3')), 'it is listed under Coming up');
// the Report strip behind the dialog followed along, and the window was not redrawn
const strip1 = await page.evaluate(() => { const s = document.querySelector('[data-sc-summary]'); return s.textContent; });
ok(/Next event\s*Site visit/.test(strip1) && /Events this week\s*1/.test(strip1), 'the strip shows the next event and events this week: ' + strip1);

// Add to calendar: a real download
let d1 = await downloads('[data-act="cal-ics"][data-event="e1"]');
ok(d1.name === 'Site visit <b>now</b>, bring; coffee.ics'.replace(/[<>]/g, '_') || /\.ics$/.test(d1.name), 'the download is named after the event: ' + d1.name);
ok(validate(d1.text) === null, 'the downloaded file is a valid .ics (structure): ' + validate(d1.text));
const t1 = unfold(d1.text), uid1 = (/UID:(\S+)/.exec(t1) || [])[1];
ok(t1.includes('SEQUENCE:0') && t1.includes(`SUMMARY:Site visit <b>now</b>${BS}, bring${BS}; coffee`) && t1.includes('LOCATION:Corner shop\\, 12 Main St') && t1.includes('DESCRIPTION:Bring the survey\\nand the camera') && t1.includes('TRIGGER:-PT15M'), 'title, place, note (with its line break) and the reminder are escaped into one value each');
ok(t1.includes('DTSTART:' + (await iso(`${D1}T10:00`)).replace(/[-:]/g, '').replace(/\.\d+Z/, 'Z')) && !/METHOD|ORGANIZER|ATTENDEE/.test(t1), 'the start is in UTC; nothing invites anyone');
ok(/saved to your downloads/.test(await page.textContent('[data-cal-msg]')) && /Recorded in the communications log/.test(await page.textContent('[data-cal-msg]')), 'the dialog says it was saved to downloads and recorded in the log (and never that it was added to a calendar): ' + await page.textContent('[data-cal-msg]'));
ok(!/added to (your|the) calendar/i.test(await page.textContent('[data-cal-msg]')), 'it never claims the event was added to a calendar');
ev = await json('calendar', 'events.json');
ok(ev.events[0].uid === uid1 && ev.events[0].ics.sequence === 0 && ev.events[0].ics.file === 'ics/e1-s0.ics' && /Saved as \.ics, revision 0/.test(await page.textContent('[data-entry="e1"]')), 'the event keeps its uid and the export record, and the list says so');
ok(await file('calendar', 'ics/e1-s0.ics') === d1.text, 'the copy kept in the project is the file that was downloaded, byte for byte');
// an edit, then again: the same UID with SEQUENCE 1
await page.click('[data-act="cal-edit"][data-event="e1"]'); await page.fill('[data-entry="e1"] [data-cal-title]', 'Site visit (moved)'); await page.click('[data-entry="e1"] [data-cal-save]'); await page.waitForTimeout(200);
ev = await json('calendar', 'events.json'); ok(ev.events[0].title === 'Site visit (moved)' && ev.events[0].history.length === 1 && ev.events[0].history[0].title.startsWith('Site visit <b>') && ev.events[0].uid === uid1, 'edit keeps the earlier values in history and the uid');
ok(/1 earlier versions? kept/.test(await page.textContent('[data-entry="e1"]')), 'the list says how many earlier versions are kept');
const d2 = await downloads('[data-act="cal-ics"][data-event="e1"]'); const t2 = unfold(d2.text);
ok(validate(d2.text) === null && t2.includes('UID:' + uid1) && t2.includes('SEQUENCE:1') && t2.includes('SUMMARY:Site visit (moved)'), 'after the edit the SAME UID goes out with SEQUENCE:1 (a calendar updates the event, it does not add a second one)');
ok(await file('calendar', 'ics/e1-s1.ics') === d2.text, 'its copy is kept under its own revision');
const dSame = await downloads('[data-act="cal-ics"][data-event="e1"]'); ok(unfold(dSame.text).includes('SEQUENCE:1'), 'exported again with no change: still SEQUENCE:1');

// the communications log has the lines, and its panel shows them
let log = await json('communications', 'log.json');
ok(log && log.version === 2 && log.entries.length === 3 && log.entries.every(e => e.kind === 'calendar' && e.status === 'saved .ics' && e.via === 'download' && e.to === '' && e.attachments.length === 1 && /^[0-9a-f]{64}$/.test(e.attachments[0].sha256) && e.attachments[0].size > 0), 'three calendar lines in Data/communications/log.json: saved .ics, via download, the file with its sha256 and size');
ok(log.entries[0].attachments[0].sha256 === await page.evaluate(([t]) => window.superWindow.P.sha256(new TextEncoder().encode(t)), [d1.text]), 'the first line\'s sha256 is the sha256 of the file that was downloaded');
await closeDlg(); await runCmd('communications:log'); await page.waitForSelector(CDLG);
const cl = await page.$$eval('[data-log-list] [data-entry]', rows => rows.map(r => ({ text: r.textContent, kind: !!r.querySelector('[data-kind="calendar"]') })));
ok(cl.length === 3 && cl.every(r => r.kind && /Saved as \.ics/.test(r.text) && !/Handed to your mail app/.test(r.text)) && /Site visit/.test(cl[0].text), 'the Communications panel shows the calendar lines, marked Calendar and Saved as .ics: ' + cl[0].text.slice(0, 120));
await page.fill('[data-log-search]', 'moved'); ok((await page.$$('[data-log-list] [data-entry]')).length === 2 || (await page.$$('[data-log-list] [data-entry]')).length === 3, 'the panel search works on calendar lines');
await page.fill('[data-log-search]', ''); await closeDlg();

// a fake share sheet, then a closed one
await page.evaluate(() => { window.__shares = []; window.__abort = false; Object.defineProperty(navigator, 'canShare', { configurable: true, value: o => !!(o && o.files && o.files.length) });
  Object.defineProperty(navigator, 'share', { configurable: true, value: async o => { window.__shares.push({ files: o.files.map(f => f.name), type: o.files[0].type, size: o.files[0].size }); if (window.__abort) { const e = new Error('closed'); e.name = 'AbortError'; throw e; } } }); });
await runCmd('calendar:events'); await page.waitForSelector(DLG);
await page.click('[data-act="cal-ics"][data-event="e1"]'); await page.waitForTimeout(300);
const sh = await page.evaluate(() => window.__shares);
ok(sh.length === 1 && /\.ics$/.test(sh[0].files[0]) && sh[0].type === 'text/calendar' && sh[0].size > 100, 'where the browser can share files, the .ics goes to the share sheet with its type: ' + JSON.stringify(sh));
ok(/handed to the share sheet/.test(await page.textContent('[data-cal-msg]')), 'and the dialog says so');
log = await json('communications', 'log.json'); ok(log.entries.length === 4 && log.entries[3].via === 'share', 'the log line says via share');
await page.evaluate(() => { window.__abort = true; }); const evBefore = await file('calendar', 'events.json'); const logBefore = await file('communications', 'log.json');
await page.click('[data-act="cal-ics"][data-event="e1"]'); await page.waitForTimeout(300);
ok(/Cancelled\. Nothing was saved or recorded/.test(await page.textContent('[data-cal-msg]')) && await file('calendar', 'events.json') === evBefore && await file('communications', 'log.json') === logBefore, 'a closed share sheet: "Cancelled", and nothing was recorded or changed');
await page.evaluate(() => { delete navigator.share; delete navigator.canShare; });

// a hostile title through the form, and an all-day event
await page.click('[data-act="cal-add"]'); await page.fill('[data-cal-title]', 'Hostile\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nATTENDEE:mailto:boss@example.com'); await page.check('[data-cal-allday]');
ok(await page.getAttribute('[data-cal-start]', 'type') === 'date' && await page.getAttribute('[data-cal-end]', 'type') === 'date', 'All day switches the fields to plain dates');
await page.fill('[data-cal-start]', ymd(5)); await page.fill('[data-cal-end]', ymd(6)); await page.click('[data-cal-save]'); await page.waitForTimeout(200);
ev = await json('calendar', 'events.json'); const e2 = ev.events[1];
ok(e2.allDay === true && e2.start === ymd(5) && e2.end === ymd(6) && !/[\r\n]/.test(e2.title), 'an all-day event keeps days, and the title is one line (breaks became spaces): ' + JSON.stringify(e2.title));
const d3 = await downloads('[data-act="cal-ics"][data-event="e2"]'); const t3 = unfold(d3.text);
ok(validate(d3.text) === null && d3.text.split('\r\n').filter(l => l === 'BEGIN:VEVENT').length === 1 && !/^ATTENDEE/m.test(d3.text) && t3.includes(`DTSTART;VALUE=DATE:${ymd(5).replace(/-/g, '')}`), 'the hostile title cannot start a new property: one VEVENT, no ATTENDEE; all-day dates are DATE values');
const endPlus = new Date(ymd(6) + 'T00:00:00Z'); endPlus.setUTCDate(endPlus.getUTCDate() + 1);
ok(t3.includes('DTEND;VALUE=DATE:' + endPlus.toISOString().slice(0, 10).replace(/-/g, '')), 'DTEND is the day after the last day');

// search, remove, show removed, restore
await page.fill('[data-cal-search]', 'moved'); ok((await page.$$('[data-cal-list] .sc-log-entry')).length === 1, 'search finds the event by its words'); await page.fill('[data-cal-search]', '');
await page.click('[data-act="cal-remove"][data-event="e2"]'); await page.waitForTimeout(100);
ok((await page.$$('[data-cal-list] .sc-log-entry')).length === 1 && (await json('calendar', 'events.json')).events[1].removed === true, 'remove hides the event; it is still in the file');
await page.check('[data-cal-removed]'); ok((await page.$$('[data-cal-list] .sc-log-entry')).length === 2, 'Show removed lists it');
await page.click('[data-act="cal-restore"][data-event="e2"]'); await page.waitForTimeout(100); ok(!(await json('calendar', 'events.json')).events[1].removed, 'restore brings it back'); await page.uncheck('[data-cal-removed]');

// tasks with a due day: the notes-tasks plugin is the source (a read-only topic)
ok(/Notes and tasks plugin is on|no task has a due day/i.test(await page.textContent('[data-cal-tasks]')) || /No task has a due day yet/.test(await page.textContent('[data-cal-tasks]')), 'no task yet: it says so');
await page.evaluate(([due]) => { const { P, project } = window.superWindow; const doc = { format: 'supercadcraft-tasks', version: 1, seq: 2, tasks: [
  { id: 't1', time: new Date().toISOString(), title: 'Order the steel, now', status: 'doing', who: 'Dana', due },
  { id: 't2', time: new Date().toISOString(), title: 'No day', status: 'open', who: '' }] };
  P.extSet(project, 'notes-tasks', 'tasks.json', new TextEncoder().encode(JSON.stringify(doc)), 'notes-tasks'); }, [ymd(2)]);
await closeDlg(); await runCmd('calendar:events'); await page.waitForSelector(DLG);
let rows = await page.$$eval('[data-task-row] .sc-task-title', e => e.map(x => x.textContent)); ok(rows.join() === 'Order the steel, now', 'only a task that has a due day is offered: ' + rows);
ok(/all-day event/.test(await page.textContent('[data-cal-tasks]')) && /to-do/i.test(await page.textContent('[data-cal-tasks]')) && /Google Calendar does not/.test(await page.textContent('[data-cal-tasks]')), 'the choice is explained: an all-day event or a to-do, and which calendars read which');
const d4 = await downloads('[data-act="cal-task"][data-task="t1"]'); const t4 = unfold(d4.text);
ok(validate(d4.text) === null && t4.includes('BEGIN:VEVENT') && !t4.includes('VTODO') && t4.includes(`DTSTART;VALUE=DATE:${ymd(2).replace(/-/g, '')}`) && t4.includes('SUMMARY:Order the steel\\, now') && /Who: Dana/.test(t4), 'a task goes out as an all-day event by default, with its status and who in the description');
await page.selectOption('[data-cal-as="t1"]', 'todo'); const d5 = await downloads('[data-act="cal-task"][data-task="t1"]'); const t5 = unfold(d5.text);
ok(validate(d5.text, 'VTODO') === null && t5.includes('BEGIN:VTODO') && t5.includes(`DUE;VALUE=DATE:${ymd(2).replace(/-/g, '')}`) && t5.includes('STATUS:IN-PROCESS'), 'as a to-do: a VTODO with a due DATE and its status');
ev = await json('calendar', 'events.json'); ok(Object.keys(ev.taskExports).sort().join() === 't1-event,t1-todo' && ev.taskExports['t1-event'].uid !== ev.taskExports['t1-todo'].uid, 'each kind keeps its own uid and record in events.json');
log = await json('communications', 'log.json'); ok(log.entries.at(-1).subject === 'Order the steel, now' && log.entries.at(-1).status === 'saved .ics', 'task exports are in the log too');
await closeDlg();

// a link to what is picked in the apps
await page.evaluate(() => window.superWindow.hub.set('bimcraft', [{ app: 'bimcraft', id: 'wall-17', cls: 'IfcWall' }]));
await runCmd('calendar:new-event'); await page.waitForSelector(DLG);
ok(!(await page.isDisabled('[data-link-pick]')) && /wall-17/.test(await page.textContent('[data-cal-form]')), 'something is picked: the link tick is on offer and names it');
await page.fill('[data-cal-title]', 'Review wall 17'); await page.fill('[data-cal-start]', `${ymd(3)}T09:00`); await page.check('[data-link-pick]'); await page.click('[data-cal-save]');   // only the start was filled: the end follows it (the length is kept) await page.waitForTimeout(200);
ev = await json('calendar', 'events.json'); const ln = ev.events.at(-1);
ok(ln.link && ln.link.app === 'bimcraft' && ln.link.id === 'wall-17' && Object.keys(ln.link).every(k => ['app', 'id', 'cls', 'label'].includes(k)), 'the link names the app and the id and nothing else: ' + JSON.stringify(ln.link));
ok(ln.end === new Date(new Date(await iso(`${ymd(3)}T09:00`)).getTime() + 3600 * 1000).toISOString(), 'changing only the start moved the end with it: one hour later, the length the form began with: ' + ln.end);
ok(/Linked: /.test(await page.textContent('[data-cal-list]')), 'the event shows its link'); await closeDlg(); await page.evaluate(() => window.superWindow.hub.clear());

// the Report strip across the events
const strip2 = await page.evaluate(() => document.querySelector('[data-sc-summary]').textContent); ok(/Next event\s*Site visit \(moved\)/.test(strip2) && /Events this week\s*[2-9]/.test(strip2), 'the strip: ' + strip2);
await page.click('[data-summary="calendar:next"]'); await page.waitForSelector(DLG); ok(/Calendar events/.test(await page.textContent(DLG + ' .sc-find-h')), 'clicking a summary line opens the Events dialog'); await closeDlg();

// the project file round trip (the .ics copies too)
const rt = await page.evaluate(async () => { const { P, project } = window.superWindow; const names = P.extList(project, 'calendar').map(f => f.path); const back = await P.fromBytes(P.toBytes(project, {}));
  const same = (x, y) => !!x && !!y && x.length === y.length && x.every((v, i) => v === y[i]); return { names, all: names.every(n => same(P.extGet(project, 'calendar', n), P.extGet(back.project, 'calendar', n))), log: same(P.extGet(project, 'communications', 'log.json'), P.extGet(back.project, 'communications', 'log.json')) }; });
ok(rt.all && rt.log && rt.names.includes('events.json') && rt.names.includes('ics/e1-s0.ics') && rt.names.includes('ics/e1-s1.ics'), 'the events file, every .ics copy and the log come back from the project file byte for byte: ' + rt.names.join());

// Communications switched off: the file is still saved, and the dialog says it was not logged
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="communications"]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
const logBeforeOff = await file('communications', 'log.json');
await runCmd('calendar:events'); await page.waitForSelector(DLG); const d6 = await downloads('[data-act="cal-ics"][data-event="e1"]');
ok(validate(d6.text) === null && /Not recorded in the communications log: that plugin is off/.test(await page.textContent('[data-cal-msg]')) && await file('communications', 'log.json') === logBeforeOff, 'communications off: the file is still saved, the dialog says it was not logged, the log is untouched');
await closeDlg(); await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="communications"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(200);

// a damaged file: shown read-only, never written over
const sane = await file('calendar', 'events.json');
await page.evaluate(() => { const { P, project } = window.superWindow; P.extSet(project, 'calendar', 'events.json', new TextEncoder().encode('{ damaged'), 'calendar'); });
await runCmd('calendar:events'); await page.waitForSelector(DLG);
ok(/cannot be read/.test(await page.textContent('[data-cal-warn]')) && await page.isDisabled('[data-act="cal-add"]'), 'a damaged file: a warning, and adding is disabled');
ok(await file('calendar', 'events.json') === '{ damaged', 'and the file is left exactly as it was'); await closeDlg();
const sdmg = await page.evaluate(() => (document.querySelector('[data-sc-summary]') || {}).textContent || ''); ok(/cannot be read/.test(sdmg), 'the Report strip says it cannot be read: ' + sdmg);
await page.evaluate(([t]) => { const { P, project } = window.superWindow; P.extSet(project, 'calendar', 'events.json', new TextEncoder().encode(t), 'calendar'); }, [sane]);

// Settings › Plugins: the switch; the strip lines and commands leave; the files ride through
const sw = await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="calendar"]'); return { has: !!c, on: c && c.checked, about: (document.querySelector('[data-sc-plugin-row="calendar"]') || {}).textContent }; });
ok(sw.has && sw.on && /\.ics file/.test(sw.about), 'Settings › SuperCad Studio › Plugins lists it with a switch: ' + JSON.stringify(sw).slice(0, 160));
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="calendar"]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(!await inMenu('calendar:events') && !await inMenu('calendar:new-event'), 'switched off: the commands leave the Workflow menu');
ok(await page.evaluate(() => !window.ccPalette.items().some(i => /^app:plugin:calendar:/.test(i.id))), 'switched off: Ctrl+K no longer lists them');
ok(await page.evaluate(() => !/Next event|Events this week/.test(document.querySelector('[data-sc-summary]')?.textContent || '')), 'switched off: its lines leave the Report summary');
const kept = await page.evaluate(async () => { const { P, project } = window.superWindow; const back = await P.fromBytes(P.toBytes(project, {})); return P.extList(back.project, 'calendar').length; });
ok(kept >= 4, 'switched off: a save still carries every calendar file untouched: ' + kept);
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on="calendar"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(await inMenu('calendar:events'), 'switched on again: the commands are back');

ok(errors.length === 0, 'no page errors: ' + errors.join(' | '));
await browser.close(); await close();
console.log(`\n${pass} passed, ${fail} failed` + (missing && missing.length ? ' (missing: ' + missing.join(',') + ')' : ''));
process.exit(fail ? 1 : 0);
