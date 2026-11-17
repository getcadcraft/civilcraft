// SPDX-License-Identifier: Apache-2.0
// Super: the four plugins (communications, notes-tasks, timer, calendar) working TOGETHER in one page and one project, in headless Chromium. Nine scenarios: (1) the Workflow ▾ menu, Ctrl+K and the Report
// strip as one set; (2) a job across the plugins through the UI (note → task → timer → event → .ics → log → Email… hand-offs); (3) a .ccproject zip and a project folder (the origin-private file system) reopened
// into the live window; (4) each plugin off in turn and all off, with the dependent features degrading cleanly; (5) a damaged, a newer and an oversized file at once; (6) the extension caps; (7) a second tab
// with a timer running; (8) a keyboard-only pass through the menu to every dialog and back; (9) Spanish (es-MX) and Indonesian with no raw `sc.` keys on screen.
// Written against the DOM and the public host API so it re-runs unchanged as the plugins change. Real mail clients, share sheets and calendars cannot be driven here: they are faked or checked by structure.
//   node tools/super-test/plugins-together.mjs        (about 2 minutes: the timer needs two real 31-second runs)
import fs from 'node:fs';
import { start, launch } from './serve.mjs';
const { url: URL0, close, missing } = await start({ langs: ['', 'es-MX', 'id'] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const note = m => console.log('NOTE', m);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const pageErrors = [], consoleErrors = [];
/** every page opened here reports its errors into the two lists; the harness's own 404s (it serves only /assets and the lab page) are not the plugins' */
const watch = (p, tag) => { p.on('pageerror', e => pageErrors.push(`${tag}: ${String(e.message)}`)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: the server responded with a status of 404|bad HTTP response code \(404\)/.test(m.text())) consoleErrors.push(`${tag}: ${m.text().slice(0, 200)}`); }); };
async function boot(p, url = URL0) { await p.goto(url); await p.waitForSelector('[data-sc-ready]'); await p.evaluate(() => window.superWindow.ready); }
let page = await ctx.newPage(); page.setDefaultTimeout(10000); watch(page, 'A'); await boot(page);
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);   // ONLY=1,2 runs just those scenarios (for debugging); empty = all
const scenario = async (name, fn) => { if (ONLY.length && !ONLY.includes(name.split(' ')[0])) return; try { await fn(); } catch (e) { fail++; console.log('FAIL (threw) ' + name + ': ' + String(e && e.message).split('\n').filter(Boolean).slice(0, 3).join(' / ')); } };

const IDS = ['communications', 'notes-tasks', 'timer', 'calendar', 'report-binder', 'teams'];
const FILE_IDS = ['communications', 'notes-tasks', 'timer', 'calendar'];   // the plugins that keep files in the project from the start (the binder and Teams write nothing until used)
const WF = '.sc-barbtn[data-act="workflow"]';
const item = key => `.sc-wf-menu [data-act="plugin:${key}"]`;
const wfOpen = async (p = page) => { if (!await p.$('.sc-wf-menu')) await p.click(WF); await p.waitForSelector('.sc-wf-menu'); };
const wfClose = async (p = page) => { if (await p.$('.sc-wf-menu')) { await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('.sc-wf-menu')); } };
const runCmd = async (key, p = page) => { await wfOpen(p); await p.click(item(key)); };
const inMenu = async (key, p = page) => { if (!await p.$(WF)) return false; await wfOpen(p); const r = await p.$(item(key)) !== null; await wfClose(p); return r; };
const dlg = id => `dialog[data-sc-plugin="${id}"][open]`;
const closeDlgs = async (p = page) => { await p.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin][open]').forEach(d => d.close())); await p.waitForTimeout(120); };
const ymd = n => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const extText = (plugin, name, p = page) => p.evaluate(([pl, n]) => { const b = window.superWindow.P.extGet(window.superWindow.project, pl, n); return b ? new TextDecoder().decode(b) : null; }, [plugin, name]);
const extJson = async (plugin, name, p = page) => { const t = await extText(plugin, name, p); try { return t ? JSON.parse(t) : null; } catch { return null; } };
/** sha256 of every plugin file in the live project: { 'plugin/path': hex } */
const hashes = (p = page) => p.evaluate(() => { const { P, project } = window.superWindow; const o = {}; for (const [k, b] of project.ext) o[k] = P.sha256(b); return o; });
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/** two hash maps are the same files with the same bytes, whatever their order */
const sameHashes = (a, b) => { const A = Object.keys(a).sort(), B = Object.keys(b).sort(); return A.length === B.length && A.every((k, i) => k === B[i] && a[k] === b[k]); };
/** which files differ between two hash maps: 'only before: …; only after: …; changed: …' */
const diffKeys = (a, b) => { const A = Object.keys(a), B = Object.keys(b); return ['only before: ' + A.filter(k => !(k in b)).join(','), 'only after: ' + B.filter(k => !(k in a)).join(','), 'changed: ' + A.filter(k => k in b && a[k] !== b[k]).join(',')].join('; '); };
const summaryText = (p = page) => p.evaluate(() => (document.querySelector('[data-sc-summary]') || {}).textContent || '');
const groupsOf = async (p = page) => { await wfOpen(p); const g = await p.evaluate(() => [...document.querySelectorAll('.sc-wf-menu [role=group]')].map(x => ({ id: x.dataset.wfGroup, items: [...x.querySelectorAll('[role=menuitem]')].map(i => i.dataset.act) }))); await wfClose(p); return g; };
async function downloads(selector, p = page) { const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), p.click(selector)]); return { name: dl.suggestedFilename(), text: fs.readFileSync(await dl.path(), 'utf8') }; }
/** a member no app takes back (a .txt): Save and Email… need at least one app file before they write anything (see the finding in 2); this keeps the rest of the run going */
const ensureMember = (p = page) => p.evaluate(() => { const { P, project } = window.superWindow; if (!project.members.length) P.addMember(project, { app: 'markupcraft', name: 'readme.txt', bytes: new TextEncoder().encode('placeholder'), role: 'saved' }); return project.members.length; });
/** press Prepare in the Email… dialog; → true when the hand-off button appears, else the dialog's own status text (so a failure says why) */
const prepare = async (p = page) => { await p.click('[data-act=mail-prepare]'); try { await p.waitForSelector('[data-act=mail-handoff]:not([hidden])', { timeout: 20000 }); return true; } catch { return (await p.textContent('[data-mail-status]').catch(() => '')) || (await p.textContent('[data-mail-ready]').catch(() => '')) || 'no status text'; } };
const PS = '[data-pstat="timer:timer"]';
const slot = (p = page) => p.evaluate(() => { const v = localStorage.getItem('cc-super-plugin-timer'); return v ? JSON.parse(v) : null; });
const plugin = (id, on, p = page) => p.evaluate(([i, v]) => { const c = document.querySelector(`[data-sc-plugin-on="${i}"]`); c.checked = v; c.dispatchEvent(new Event('change', { bubbles: true })); }, [id, on]).then(() => p.waitForTimeout(250));
/** the project through a zip and back into the live window, as Open does */
const reopenViaZip = (p = page) => p.evaluate(async () => { const { P, project } = window.superWindow; const bytes = P.toBytes(project, {}); await window.superWindow.openProject(new File([bytes], 'job.ccproject')); return window.superWindow.project.ext.size; });

/* ======================================================================== 1. the menu, Ctrl+K and (later) the strip as one set */
await scenario('1 menu', async () => {
  const pl = await page.evaluate(() => ({ list: window.superWindow.plugins.list().map(x => [x.id, x.enabled, x.error]), keys: window.superWindow.plugins.commands().map(c => c.key) }));
  ok(sameJson(pl.list, IDS.map(i => [i, true, ''])), '1: every plugin on, no error: ' + JSON.stringify(pl.list));
  const g = await groupsOf();
  ok(g.map(x => x.id).join() === IDS.join(), '1: the Workflow ▾ menu has a group for each plugin, in order: ' + g.map(x => x.id));
  ok(g.every(x => x.items.length >= 1) && g.flatMap(x => x.items).length === pl.keys.length, '1: the menu holds every command the host knows (' + pl.keys.length + ')');
  await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().filter(i => /^app:plugin:/.test(i.id)).length >= 13, null, { timeout: 8000 }).catch(() => {});
  const pal = await page.evaluate(() => window.ccPalette.items().filter(i => /^app:plugin:/.test(i.id)).map(i => i.id.replace('app:plugin:', '')));
  ok(pl.keys.every(k => pal.includes(k)) && pal.length === pl.keys.length, '1: every command is also in Ctrl+K: ' + pal.length + ' of ' + pl.keys.length);
  await page.keyboard.press('Control+k'); await page.waitForTimeout(200); await page.keyboard.type('timer');
  ok((await page.$$eval('.shell-palette-opt', e => e.map(x => x.textContent))).some(h => /timer/i.test(h)), '1: typing "timer" in Ctrl+K finds the timer commands'); await page.keyboard.press('Escape');
  for (const ws of await page.evaluate(() => window.superWindow.state.shown)) { await page.click(`.sc-wstab[data-ws="${ws}"]`); await page.waitForTimeout(100); ok(await inMenu('timer:timer') && await inMenu('calendar:events') && await inMenu('notes-tasks:tasks') && await inMenu('communications:email'), `1: workspace ${ws}: the four plugins' commands are in the menu`); }
  await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(200);
  ok(/Tasks\s*none yet/.test(await summaryText()) && /Events\s*none yet/.test(await summaryText()), '1: an empty project: the strip says none yet for tasks and events: ' + await summaryText());
});

/* ======================================================================== 2. a job across the plugins */
const DUE = ymd(2);
await scenario('2 job', async () => {
  // a note, then the task made from it, with a due day
  await runCmd('notes-tasks:new-note'); await page.waitForSelector(dlg('notes-tasks'));
  await page.fill('[data-note-text]', 'Door schedule is missing the fire doors'); await page.click('[data-note-new-save]'); await page.waitForTimeout(150);
  await page.click('[data-act="note-task"][data-note="n1"]'); await page.waitForSelector(dlg('notes-tasks') + ' [data-task-form]:not([hidden])');
  await page.fill('[data-task-due]', DUE); await page.click('[data-task-save]'); await page.waitForTimeout(200);
  const tasks = await extJson('notes-tasks', 'tasks.json'), notes = await extJson('notes-tasks', 'notes.json');
  ok(notes && notes.notes.length === 1 && tasks && tasks.tasks.length === 1 && tasks.tasks[0].fromNote === 'n1' && tasks.tasks[0].due === DUE && tasks.tasks[0].id === 't1', '2: the note n1 and the task t1 made from it, due ' + DUE + ': ' + JSON.stringify(tasks && tasks.tasks[0]));
  await closeDlgs();
  // run the timer on that task through its own dialog; stop it from the status line after 31 s (under 30 s records nothing)
  await runCmd('timer:timer'); await page.waitForSelector(dlg('timer'));
  await page.locator(dlg('timer')).locator('select').first().selectOption('t1'); await page.fill('[data-tm-note]', 'doors');
  await page.click('[data-act="timer-start"]'); await page.waitForTimeout(400);
  ok((await slot()) && (await slot()).task === 't1' && /\d:\d\d:\d\d/.test(await page.$eval(PS + ' .sc-pstat-text', e => e.textContent)), '2: the timer runs on task t1 and the status line shows the clock');
  await closeDlgs(); await page.waitForTimeout(31000);
  await page.click(PS + ' [data-act="pstat:timer:stop"]'); await page.waitForTimeout(400);
  const tm = await extJson('timer', 'time.json');
  ok(tm && tm.entries.length === 1 && tm.entries[0].task === 't1' && tm.entries[0].source === 'timer' && tm.entries[0].minutes >= 0, '2: stopping records a time entry on task t1: ' + JSON.stringify(tm && tm.entries[0]));
  ok(tm.entries[0].taskTitle && /Door schedule/.test(tm.entries[0].taskTitle), '2: the entry kept the task\'s title: ' + (tm.entries[0] && tm.entries[0].taskTitle));
  // a calendar event from the task's due date, with the task chosen in the form, then its .ics as a real download
  await runCmd('calendar:new-event'); await page.waitForSelector(dlg('calendar'));
  await page.fill('[data-cal-title]', 'Door schedule due'); await page.fill('[data-cal-start]', `${DUE}T09:00`); await page.fill('[data-cal-end]', `${DUE}T10:00`);
  await page.selectOption('[data-cal-task]', 't1'); await page.click('[data-cal-save]'); await page.waitForTimeout(200);
  const ev = await extJson('calendar', 'events.json'); ok(ev && ev.events.length === 1 && ev.events[0].fromTask === 't1', '2: the event is saved and says it came from task t1: ' + JSON.stringify(ev && ev.events[0] && ev.events[0].fromTask));
  const d1 = await downloads('[data-act="cal-ics"][data-event="e1"]');
  ok(/\.ics$/.test(d1.name) && /BEGIN:VCALENDAR/.test(d1.text) && /END:VCALENDAR/.test(d1.text) && /SUMMARY:Door schedule due/.test(d1.text), '2: Add to calendar downloads a .ics: ' + d1.name);
  // the task itself as an all-day event, from the dialog's task list
  const d2 = await downloads('[data-act="cal-task"][data-task="t1"]'); ok(/\.ics$/.test(d2.name) && /VEVENT/.test(d2.text), '2: the task\'s due day goes out as an all-day event: ' + d2.name);
  await closeDlgs();
  let log = await extJson('communications', 'log.json');
  const cal = log ? log.entries.filter(e => e.kind === 'calendar') : [];
  ok(cal.length === 2 && cal.every(e => e.status === 'saved .ics' && e.via === 'download' && /^[0-9a-f]{64}$/.test((e.attachments[0] || {}).sha256 || '')), '2: both exports are in the communications log as saved .ics: ' + JSON.stringify(cal.map(e => [e.status, e.via])));
  ok(log && log.version === 2, '2: the log is version 2 now');
  // FINDING probe: a project that holds only plugin data (no app file yet) must still be emailable and saveable; today Save, Save as folder and Email… refuse it (collectSaved() needs a member)
  await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); Object.defineProperty(navigator, 'share', { value: async () => {}, configurable: true }); });
  await runCmd('communications:email'); await page.waitForSelector(dlg('communications')); await page.check('input[name=sc-mail-what][value=project]'); await page.fill('[data-mail-to]', 'pat@example.com');
  { const r = await prepare(); ok(r === true, '2: FINDING: Email… can prepare the project file when the project holds only plugin data (notes, tasks, time, events): ' + r); }
  await page.click('[data-act=mail-close]'); await page.waitForSelector(dlg('communications'), { state: 'detached' });
  { const got = await Promise.race([page.waitForEvent('download', { timeout: 3000 }).then(() => true).catch(() => false), page.click('.sc-barbtn[data-act="save"]').then(() => new Promise(r => setTimeout(() => r(false), 3500)))]); ok(got === true, '2: FINDING: Save writes a project that holds only plugin data (the window says: "' + (await page.evaluate(() => (document.querySelector('.sc-status') || document.body).textContent.match(/Nothing to save yet[^.]*\./)?.[0] || '(no message found)')) + '")'); }
  await ensureMember();
  // two Email… hand-offs of the project file: a share sheet, then the mail-link route
  await page.evaluate(() => { window.__shared = []; Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); Object.defineProperty(navigator, 'share', { value: async d => { window.__shared.push({ n: d.files.length, name: d.files[0].name, title: d.title }); }, configurable: true }); });
  await runCmd('communications:email'); await page.waitForSelector(dlg('communications'));
  const radios = await page.evaluate(() => [...document.querySelectorAll('input[name=sc-mail-what]')].map(r => [r.value, r.disabled]));
  ok(radios.find(r => r[0] === 'project') && radios.find(r => r[0] === 'project')[1] === false, '2: the project file is always on offer');
  await page.check('input[name=sc-mail-what][value=project]'); await page.fill('[data-mail-to]', 'pat@example.com'); await page.fill('[data-mail-subject]', 'Job file'); await page.fill('[data-mail-note]', 'Latest');
  { const r = await prepare(); ok(r === true, 'the Email… dialog prepares the project file: ' + r); if (r !== true) throw new Error('Email prepare failed: ' + r); } await page.click('[data-act=mail-handoff]');
  await page.waitForFunction(() => window.__shared.length === 1, null, { timeout: 8000 });
  ok(await page.evaluate(() => /\.ccproject$/.test(window.__shared[0].name) && window.__shared[0].title === 'Job file'), '2: Email… (share): the project file went to the share sheet with the subject');
  await page.click('[data-act=mail-close]'); await page.waitForSelector(dlg('communications'), { state: 'detached' });
  await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { value: () => false, configurable: true }); window.__mailto = null; document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href^="mailto:"]'); if (a) { e.preventDefault(); window.__mailto = a.getAttribute('href'); } }, true); });
  await runCmd('communications:email'); await page.waitForSelector(dlg('communications'));
  await page.check('input[name=sc-mail-what][value=project]'); await page.fill('[data-mail-to]', 'lee@example.org'); await page.fill('[data-mail-subject]', 'Job file again');
  { const r = await prepare(); ok(r === true, 'the Email… dialog prepares the project file: ' + r); if (r !== true) throw new Error('Email prepare failed: ' + r); }
  await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click('[data-act=mail-handoff]')]); await page.waitForFunction(() => window.__mailto, null, { timeout: 8000 });
  ok(await page.evaluate(() => /^mailto:lee%40example\.org\?subject=Job%20file%20again/.test(window.__mailto)), '2: Email… (mail link): the message is filled in and the file was saved as a download');
  // the export set: offered only when an open app can write it; say so when it cannot be driven here
  const zipOffered = await page.evaluate(() => { const r = document.querySelector('input[name=sc-mail-what][value=zip]'); return !!r && !r.disabled; });
  if (!zipOffered) note('2: "the export set as one zip" is greyed with no app file open in this harness: that hand-off is NOT covered here (project file twice instead)');
  await page.click('[data-act=mail-close]'); await page.waitForSelector(dlg('communications'), { state: 'detached' });
  log = await extJson('communications', 'log.json');
  const emails = log.entries.filter(e => e.kind === 'email');
  ok(emails.length === 2 && sameJson(emails.map(e => e.via), ['share', 'mailto']) && emails.every(e => e.status === 'handed to mail app'), '2: the log has both hand-offs, handed to mail app: ' + JSON.stringify(emails.map(e => [e.via, e.status])));
  ok(log.entries.length === 4, '2: four lines in all (two .ics, two emails): ' + log.entries.length);
  await runCmd('communications:log'); await page.waitForSelector(dlg('communications'));
  const rows = await page.$$eval('[data-log-list] [data-entry]', r => r.map(x => x.textContent));
  ok(rows.length === 4 && /Job file again/.test(rows[0]), '2: the Communications panel lists four lines, newest first: ' + (rows[0] || '').slice(0, 80));
  ok(rows.every(t => !/\bsent\b/i.test(t)), '2: no line says sent');
  ok(/handed to your mail app|Handed to your mail app/i.test(rows.join(' ')) && /Saved as \.ics/.test(rows.join(' ')), '2: the lines say what they are (handed to your mail app, saved as .ics)');
  await closeDlgs();
});

/* ---- 1 (continued): the Report strip shows lines from three plugins at once; each opens its dialog ---- */
await scenario('1 strip', async () => {
  await page.click('.sc-wstab[data-ws="report"]'); await page.waitForSelector('[data-sc-summary]');
  const lines = await page.$$eval('[data-sc-summary] [data-summary]', n => n.map(x => ({ key: x.dataset.summary, text: x.textContent.trim() })));
  const plugins = [...new Set(lines.map(l => l.key.split(':')[0]))].sort();
  ok(sameJson(plugins.filter(x => ['calendar', 'notes-tasks', 'timer'].includes(x)), ['calendar', 'notes-tasks', 'timer']), '1: the strip holds lines from notes-tasks, timer and calendar together: ' + JSON.stringify(lines.map(l => l.key)));
  ok(lines.every(l => l.text.length > 3), '1: every line has text: ' + lines.map(l => l.text).join(' | '));
  const t = await summaryText(); ok(/Tasks/.test(t) && /Time/.test(t) && /Next event|Events/.test(t), '1: the strip reads as tasks, time and events: ' + t);
  for (const l of lines) { await page.click(`[data-sc-summary] [data-summary="${l.key}"]`); const id = l.key.split(':')[0]; const sel = id === 'calendar' ? '[data-cal-page]' : dlg(id);   // the Calendar is a page of the welcome area now, not a dialog
    ok(await page.waitForSelector(sel, { timeout: 4000 }).then(() => true).catch(() => false), `1: the line "${l.key}" opens the ${id} ${id === 'calendar' ? 'page' : 'dialog'}`); await closeDlgs(); }
});

/* ======================================================================== 3. zip and folder, reopened into the live window */
let before3 = null;
await scenario('3 zip+folder', async () => {
  before3 = { h: await hashes(), strip: await summaryText(), groups: sameJson(await groupsOf(), await groupsOf()) ? await groupsOf() : null };
  ok(FILE_IDS.every(id => Object.keys(before3.h).some(k => k.startsWith(id + '/'))), '3: every plugin that keeps files has files in the project: ' + Object.keys(before3.h).join(' '));
  // the save log of a zip
  const info = await page.evaluate(async () => { const { P, project } = window.superWindow; const bytes = P.toBytes(project, {}); const f = await P.unzip(bytes); const get = re => { const k = [...f.keys()].find(x => re.test(x)); return JSON.parse(new TextDecoder().decode(f.get(k).bytes)); };
    const h = get(/Data\/history\.json$/), m = get(/Data\/manifest\.json$/); return { last: h.entries[h.entries.length - 1], ext: m.extensions.map(e => e.path), keys: [...f.keys()].filter(k => /Data\/[a-z-]+\//.test(k)).length }; });
  const listed = info.last.extensions.map(e => e.path).sort(); const want = Object.keys(before3.h).map(k => 'Data/' + k).sort();
  ok(sameJson(listed, want), '3: the save log (history.json) lists every plugin file: ' + listed.length + ' of ' + want.length);
  ok(sameJson([...info.ext].sort(), want) && info.last.extensions.every(e => /^[0-9a-f]{64}$/.test(e.sha256)), '3: the manifest lists them too, and the log carries each file\'s sha256');
  // zip: reopen into the live window
  const n = await reopenViaZip(); ok(n === Object.keys(before3.h).length, '3: zip: the reopened project has every plugin file: ' + n);
  { const h = await hashes(); ok(sameHashes(h, before3.h), '3: zip: every plugin file is byte for byte the same after reopening: ' + diffKeys(before3.h, h)); }
  await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(400);
  ok(await summaryText() === before3.strip, '3: zip: the Report strip is the same after reopening: ' + await summaryText());
  ok(sameJson(await groupsOf(), before3.groups), '3: zip: the Workflow menu groups are the same after reopening');
  // folder through the origin-private file system, then into the live window through the same zip door
  const r = await page.evaluate(async () => {
    const { P, project } = window.superWindow; const root = await navigator.storage.getDirectory(); try { await root.removeEntry('sctogether', { recursive: true }); } catch { /* none */ }
    const parent = await root.getDirectoryHandle('sctogether', { create: true });
    const rep = await P.writeFolder(project, parent, { now: new Date(), build: 'test' }); const dir = await parent.getDirectoryHandle(rep.root);
    const walk = async (d, pre = '') => { const out = []; for await (const [nme, h] of d.entries()) out.push(...(h.kind === 'directory' ? await walk(h, pre + nme + '/') : [pre + nme])); return out.sort(); };
    const tree = await walk(dir); const back = await P.fromFolder(dir);
    const same = {}; for (const [k, b] of project.ext) { const o = back.project.ext.get(k); same[k] = !!o && o.length === b.length && o.every((v, i) => v === b[i]); }
    const bytes = P.toBytes(back.project, {}); await window.superWindow.openProject(new File([bytes], 'job-folder.ccproject'));
    await root.removeEntry('sctogether', { recursive: true });
    return { tree, skipped: back.skipped, same, files: rep.count };
  });
  ok(FILE_IDS.every(id => r.tree.some(t => t.startsWith(`Data/${id}/`))), '3: folder: Data/ has a folder for each plugin that keeps files: ' + r.tree.filter(t => t.startsWith('Data/')).join(' '));
  ok(r.skipped.length === 0 && Object.values(r.same).every(Boolean), '3: folder: opening it brings every plugin file back byte for byte (skipped ' + r.skipped.length + ')');
  ok(r.tree.includes('Data/history.json') && r.tree.includes('Data/manifest.json'), '3: folder: the save log and the manifest are there');
  { const h = await hashes(); ok(sameHashes(h, before3.h), '3: folder: after reopening into the window every file is still the same: ' + diffKeys(before3.h, h)); }
  await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(400);
  ok(await summaryText() === before3.strip && sameJson(await groupsOf(), before3.groups), '3: folder: the strip and the menus are the same after reopening');
});

/* ======================================================================== 4. each plugin off in turn, and all off */
await scenario('4 off', async () => {
  await page.click('.sc-wstab[data-ws="report"]');
  const base = await hashes();
  for (const id of IDS) {
    await plugin(id, false);
    ok(!(await groupsOf()).some(g => g.id === id) && (await groupsOf()).length === IDS.length - 1, `4: ${id} off: its group leaves the menu, the others stay`);
    ok(await page.evaluate(i => !window.ccPalette.items().some(x => x.id.startsWith('app:plugin:' + i + ':')), id), `4: ${id} off: Ctrl+K no longer lists it`);
    await reopenViaZip(); { const h = await hashes(); ok(sameHashes(h, base), `4: ${id} off: a save and reopen carries every file untouched (its own too): ` + diffKeys(base, h)); }
    await plugin(id, true); ok((await groupsOf()).length === IDS.length, `4: ${id} on again: back`);
  }
  // timer without notes-tasks: "No task", and it says why
  await plugin('notes-tasks', false); await runCmd('timer:add'); await page.waitForSelector(dlg('timer') + ' [data-tm-form]:not([hidden])');
  ok(sameJson(await page.$$eval('[data-tm-task-select] option', o => o.map(x => x.textContent)), ['No task', ...(await page.$$eval('[data-tm-task-select] option', o => o.map(x => x.textContent))).slice(1).filter(x => /Door schedule/.test(x))]) && /Notes and tasks plugin is turned off/.test(await page.textContent(dlg('timer'))), '4: timer without notes-tasks: the task choice offers no live tasks and says the plugin is off');
  await closeDlgs();
  // calendar without notes-tasks: the task list is off, with the reason
  await runCmd('calendar:events'); await page.waitForSelector(dlg('calendar'));
  ok(/Notes and tasks plugin is off/.test(await page.textContent('[data-cal-tasks]')), '4: calendar without notes-tasks: the task list says the plugin is off');
  ok(await page.$('[data-act="cal-task"]') === null, '4: and no task can be exported'); await closeDlgs(); await plugin('notes-tasks', true);
  // calendar without communications: the export works, the dialog says it was not recorded, no log file is written
  const logBefore = await extText('communications', 'log.json'); await plugin('communications', false);
  await runCmd('calendar:events'); await page.waitForSelector(dlg('calendar'));
  await downloads('[data-act="cal-ics"][data-event="e1"]');
  ok(/Not recorded in the communications log/.test(await page.textContent('[data-cal-msg]')), '4: calendar without communications: the file is still saved, the dialog says it was not recorded: ' + await page.textContent('[data-cal-msg]'));
  ok(await extText('communications', 'log.json') === logBefore, '4: and the log file was not touched'); await closeDlgs(); await plugin('communications', true);
  // all off: no button, no strip lines, no status item; the project still reopens (the baseline is taken again: the export above legitimately rewrote the calendar's files)
  const base2 = await hashes();
  for (const id of IDS) await plugin(id, false);
  ok(await page.$(WF) === null && await page.$(PS) === null, '4: all off: no Workflow button and no timer status item');
  await page.click('.sc-wstab[data-ws="report"]'); ok(!/Tasks|Time|Events/.test(await summaryText()), '4: all off: the Report strip has none of their lines: ' + await summaryText());
  await reopenViaZip(); { const h = await hashes(); ok(sameHashes(h, base2), '4: all off: the project saves and reopens with every plugin file untouched: ' + diffKeys(base2, h)); }
  for (const id of IDS) await plugin(id, true); ok((await groupsOf()).length === IDS.length, '4: all on again');
});

/* ======================================================================== 5. a damaged, a newer and an oversized file at once */
let g5 = null;
await scenario('5 damaged', async () => {
  await reopenViaZip();
  const bad = await page.evaluate(() => { const { P, project } = window.superWindow; const enc = s => new TextEncoder().encode(s); const big = new Uint8Array(5 * 1024 * 1024).fill(32); big[0] = 123;
    P.extSet(project, 'notes-tasks', 'tasks.json', enc('{broken')); P.extSet(project, 'timer', 'time.json', enc(JSON.stringify({ format: 'supercadcraft-time', version: 99, seq: 0, entries: [] }))); P.extSet(project, 'calendar', 'events.json', big);
    return { tasks: P.sha256(enc('{broken')), time: P.sha256(enc(JSON.stringify({ format: 'supercadcraft-time', version: 99, seq: 0, entries: [] }))), ev: P.sha256(big) }; });
  await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(500);
  const s = await summaryText(); ok(/cannot be read|read-only|newer|too big/i.test(s), '5: the Report strip warns about the damaged files: ' + s);
  ok(await page.$$eval('[data-sc-summary] .is-warn', n => n.length) >= 3, '5: one warning line each for tasks, time and events: ' + await page.$$eval('[data-sc-summary] .is-warn', n => n.length));
  // each dialog is read-only for its own file, and others keep working
  await runCmd('notes-tasks:tasks'); await page.waitForSelector(dlg('notes-tasks')); ok(await page.isDisabled('[data-act="task-add"]') && /cannot be read/.test(await page.textContent('[data-nt-warn]')), '5: tasks: damaged: a warning and no Add'); await closeDlgs();
  await runCmd('timer:timer'); await page.waitForSelector(dlg('timer')); ok(await page.$eval('[data-act="timer-add"]', b => b.disabled) && (await page.textContent('[data-tm-warn]')).length > 5, '5: timer: a newer file: a warning and no Add: ' + (await page.textContent('[data-tm-warn]')).slice(0, 80)); await closeDlgs();
  await runCmd('calendar:events'); await page.waitForSelector(dlg('calendar')); ok((await page.textContent(dlg('calendar'))).length > 100 && await page.isDisabled('[data-act="cal-add"]').catch(() => true), '5: calendar: an oversized file: read-only'); await closeDlgs();
  // the good ones: a note can still be written (notes.json is fine) and an email line logged
  await runCmd('notes-tasks:new-note'); await page.waitForSelector(dlg('notes-tasks')); await page.fill('[data-note-text]', 'written while tasks are damaged'); await page.click('[data-note-new-save]'); await page.waitForTimeout(200);
  ok(((await extJson('notes-tasks', 'notes.json')) || { notes: [] }).notes.length === 2, '5: notes still work while tasks.json is damaged'); await closeDlgs();
  await ensureMember(); const logN = ((await extJson('communications', 'log.json')) || { entries: [] }).entries.length;
  await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); Object.defineProperty(navigator, 'share', { value: async () => {}, configurable: true }); });
  await runCmd('communications:email'); await page.waitForSelector(dlg('communications')); await page.check('input[name=sc-mail-what][value=project]'); await page.fill('[data-mail-to]', 'a@example.com');
  { const r = await prepare(); ok(r === true, 'the Email… dialog prepares the project file: ' + r); if (r !== true) throw new Error('Email prepare failed: ' + r); } await page.click('[data-act=mail-handoff]'); await page.waitForTimeout(500);
  ok(((await extJson('communications', 'log.json')) || { entries: [] }).entries.length === logN + 1, '5: an email hand-off is still logged while three other files are damaged');
  await page.click('[data-act=mail-close]'); await page.waitForSelector(dlg('communications'), { state: 'detached' });
  const h = await hashes(); ok(h['notes-tasks/tasks.json'] === bad.tasks && h['timer/time.json'] === bad.time && h['calendar/events.json'] === bad.ev, '5: the three damaged files are exactly as they were (never overwritten)');
  // and the log newer too
  await page.evaluate(() => { const { P, project } = window.superWindow; P.extSet(project, 'communications', 'log.json', new TextEncoder().encode(JSON.stringify({ format: 'supercadcraft-communications', version: 99, seq: 0, entries: [] }))); });
  await ensureMember(); g5 = await hashes(); await runCmd('communications:email'); await page.waitForSelector(dlg('communications')); await page.check('input[name=sc-mail-what][value=project]'); await page.fill('[data-mail-to]', 'b@example.com');
  { const r = await prepare(); ok(r === true, 'the Email… dialog prepares the project file: ' + r); if (r !== true) throw new Error('Email prepare failed: ' + r); } await page.click('[data-act=mail-handoff]'); await page.waitForTimeout(500);
  ok((await hashes())['communications/log.json'] === g5['communications/log.json'], '5: a newer log is never overwritten by an email hand-off');
  { const st = await page.textContent('[data-mail-status]'); ok(/could not be recorded|not recorded/i.test(st), '5: and the dialog says it was not logged: ' + st.slice(0, 300)); if (!/newer/i.test(st)) note('5: the dialog says the hand-off was not recorded but not WHY (the log file is a newer version); (whether the Communications panel explains it was not checked)'); }
  await page.click('[data-act=mail-close]'); await page.waitForSelector(dlg('communications'), { state: 'detached' });
  await reopenViaZip(); const h2 = await hashes(); ok(h2['notes-tasks/tasks.json'] === bad.tasks && h2['timer/time.json'] === bad.time && h2['calendar/events.json'] === bad.ev && h2['communications/log.json'] === g5['communications/log.json'], '5: a save and reopen with four damaged files in it carries all four untouched');
});

/* ======================================================================== 6. the extension caps, with all four plugins writing */
await scenario('6 caps', async () => {
  await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);   // a clean project again
  const seeded = await page.evaluate(() => { const { P, project } = window.superWindow; const enc = s => new TextEncoder().encode(s);
    P.extSet(project, 'notes-tasks', 'tasks.json', enc(JSON.stringify({ format: 'supercadcraft-tasks', version: 1, seq: 1, tasks: [{ id: 't1', time: new Date().toISOString(), title: 'Cap task', status: 'open', who: '', due: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10) }] })));
    const room = P.LIMITS.extFiles - project.ext.size; for (let i = 0; i < room; i++) P.extSet(project, 'filler', `f${i}.txt`, enc('x')); return { size: project.ext.size, cap: P.LIMITS.extFiles }; });
  ok(seeded.size === seeded.cap, '6: the project holds exactly the file cap: ' + seeded.size);
  await ensureMember(); const before = await hashes(); const errsBefore = pageErrors.length;
  // calendar: a new event, then its .ics: the copy under Data/calendar/ics/ is a NEW file and cannot fit
  await runCmd('calendar:new-event'); await page.waitForSelector(dlg('calendar')); await page.fill('[data-cal-title]', 'At the cap'); await page.fill('[data-cal-start]', `${ymd(3)}T10:00`); await page.fill('[data-cal-end]', `${ymd(3)}T11:00`); await page.click('[data-cal-save]'); await page.waitForTimeout(250);
  const evs = await extJson('calendar', 'events.json'); note('6: at the file cap a NEW events.json was ' + (evs ? 'written' : 'refused'));
  const msg0 = await page.textContent('[data-cal-msg]').catch(() => '');
  if (evs) { const d = await downloads('[data-act="cal-ics"][data-event="e1"]').catch(() => null); ok(d !== null, '6: calendar: the .ics still goes to the person at the cap (the copy kept in the project may not fit)'); const m = await page.textContent('[data-cal-msg]').catch(() => ''); ok(m.length > 5, '6: calendar: the dialog says what happened: ' + m.slice(0, 140)); }
  else ok(msg0.length > 3 || (await page.textContent(dlg('calendar'))).length > 50, '6: calendar: a refused write says so: ' + msg0);
  await closeDlgs();
  // timer, notes, email: each adds a NEW file at the cap too (time.json, notes.json, log.json)
  await runCmd('timer:add'); await page.waitForSelector(dlg('timer') + ' [data-tm-form]:not([hidden])'); await page.fill('[data-tm-form-note]', 'at the cap'); await page.click('[data-tm-save]'); await page.waitForTimeout(250);
  const tmMsg = await page.textContent('[data-tm-msg]').catch(() => ''); const tm = await extJson('timer', 'time.json'); ok(tm ? tm.entries.length === 1 : tmMsg.length > 3, '6: timer: written, or refused with a message: ' + (tm ? 'written' : tmMsg)); await closeDlgs();
  await runCmd('notes-tasks:new-note'); await page.waitForSelector(dlg('notes-tasks')); await page.fill('[data-note-text]', 'at the cap'); await page.click('[data-note-new-save]'); await page.waitForTimeout(250);
  const nt = await extJson('notes-tasks', 'notes.json'); const ntMsg = await page.textContent(dlg('notes-tasks')); ok(nt ? nt.notes.length === 1 : /could not|too many|cannot|failed|full/i.test(ntMsg), '6: notes: written, or refused with a message'); await closeDlgs();
  await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); Object.defineProperty(navigator, 'share', { value: async () => {}, configurable: true }); });
  await runCmd('communications:email'); await page.waitForSelector(dlg('communications')); await page.check('input[name=sc-mail-what][value=project]'); await page.fill('[data-mail-to]', 'cap@example.com'); await prepare(); if (await page.isVisible('[data-act=mail-handoff]')) await page.click('[data-act=mail-handoff]'); await page.waitForTimeout(500);
  const stat = await page.textContent('[data-mail-status]').catch(() => ''); const lg = await extJson('communications', 'log.json');
  ok(lg ? lg.entries.length === 1 : /not recorded|could not|too many|cannot|failed/i.test(stat), '6: email: logged, or the dialog says it could not be recorded: ' + stat.slice(0, 120));
  await page.click('[data-act=mail-close]').catch(() => {}); await closeDlgs();
  const after = await hashes(); const size = await page.evaluate(() => window.superWindow.project.ext.size);
  ok(size <= seeded.cap, '6: the project never passes the file cap: ' + size);
  ok(Object.keys(before).every(k => k in after && (after[k] === before[k] || /^(notes-tasks|timer|calendar|communications)\//.test(k))), '6: nothing that was there was lost or changed (only the plugins\' own files may be rewritten)');
  ok(pageErrors.length === errsBefore, '6: none of it threw: ' + pageErrors.slice(errsBefore).join(' | '));
  // the bytes caps: one file over the per-file cap is refused by the store (the plugins ride on the same call)
  const caps = await page.evaluate(() => { const { P, project } = window.superWindow; let a = '', b = ''; try { P.extSet(project, 'timer', 'time.json', new Uint8Array(P.LIMITS.extFileBytes + 1)); } catch (e) { a = e.message; } try { P.extSet(project, 'filler', 'zz.txt', new Uint8Array(1)); } catch (e) { b = e.message; } return [a, b]; });
  ok(/too large/.test(caps[0]) && /too many files/.test(caps[1]), '6: over the per-file cap and over the file cap are refused with reasons: ' + caps.join(' | '));
  await reopenViaZip().catch(e => ok(false, '6: a project at the file cap reopens: ' + e.message));
  ok(await page.evaluate(() => window.superWindow.project.ext.size) === size, '6: a project at the file cap saves and reopens with every file: ' + await page.evaluate(() => window.superWindow.project.ext.size));
});

/* ======================================================================== 7. a second tab, a timer running, another project */
await scenario('7 tabs', async () => {
  await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  await page.evaluate(() => localStorage.removeItem('cc-super-plugin-timer'));
  await page.evaluate(() => { window.superWindow.project.name = 'Corner shop'; });
  await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.evaluate(() => { window.superWindow.project.name = 'Corner shop'; });
  await page.click(PS + ' [data-act="pstat:timer:start"]'); await page.waitForTimeout(400);
  const st = await slot(); ok(st && st.project === 'Corner shop' && st.pausedAt === null, '7: tab A: a timer runs in "Corner shop": ' + JSON.stringify(st && [st.project, st.start]));
  const B = await ctx.newPage(); B.setDefaultTimeout(10000); watch(B, 'B'); await boot(B); await B.evaluate(() => { window.superWindow.project.name = 'Other job'; });
  ok(/\d:\d\d:\d\d/.test(await B.$eval(PS + ' .sc-pstat-text', e => e.textContent)), '7: tab B (another project): the status line shows the running timer too');
  await runCmd('timer:timer', B); await B.waitForSelector(dlg('timer'));
  ok(/started in the project "Corner shop"/.test(await B.textContent(dlg('timer'))) && /recorded in the project that is open when you stop it/.test(await B.textContent(dlg('timer'))), '7: tab B: the dialog says the timer was started in "Corner shop" and where the time will be recorded');
  await closeDlgs(B); await B.waitForTimeout(31000);
  await B.click(PS + ' [data-act="pstat:timer:stop"]'); await B.waitForTimeout(500);
  const eB = await extJson('timer', 'time.json', B), eA = await extJson('timer', 'time.json', page);
  ok(eB && eB.entries.length === 1 && eB.entries[0].source === 'timer', '7: stopped in tab B: the entry is in the project open in B (as plugin-timer.md says): ' + JSON.stringify(eB && eB.entries.length));
  ok(eA === null || eA.entries.length === 0, '7: and none in tab A\'s project');
  ok((await slot(B)) === null, '7: the timer is cleared in the shared slot');
  // what tab A shows now (the page does not listen for the other tab's change; documented, observed here)
  await page.waitForTimeout(2500); const aText = await page.$eval(PS + ' .sc-pstat-text', e => e.textContent).catch(() => '');
  note('7: after B stops the timer, tab A\'s status line reads "' + aText + '" (idle = A noticed the shared slot was cleared; a running clock would mean A shows a stale timer)');
  if (/\d:\d\d:\d\d/.test(aText)) { await page.click(PS + ' [data-act="pstat:timer:stop"]').catch(() => {}); await page.waitForTimeout(400); const eA2 = await extJson('timer', 'time.json', page); note('7: stopping the stale clock in A records ' + (eA2 ? eA2.entries.length : 0) + ' entries in A\'s project'); ok(pageErrors.every(e => !/^A:/.test(e)) , '7: stopping the stale clock in A does not throw'); }
  await B.close();
});

/* ======================================================================== 8. keyboard only */
await scenario('8 keyboard', async () => {
  await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  const cmds = [['communications:email', 'communications'], ['communications:log', 'communications'], ['notes-tasks:notes', 'notes-tasks'], ['notes-tasks:tasks', 'notes-tasks'], ['notes-tasks:new-note', 'notes-tasks'], ['notes-tasks:new-task', 'notes-tasks'], ['timer:timer', 'timer'], ['timer:add', 'timer'], ['calendar:events', 'calendar'], ['calendar:new-event', 'calendar']];
  const focusAct = () => page.evaluate(() => document.activeElement && (document.activeElement.dataset.act || document.activeElement.tagName));
  for (const [key, id] of cmds) {
    await page.focus(WF); await page.keyboard.press('ArrowDown'); await page.waitForSelector('.sc-wf-menu');
    let guard = 0; while (await focusAct() !== 'plugin:' + key && guard++ < 30) await page.keyboard.press('ArrowDown');
    ok(await focusAct() === 'plugin:' + key, `8: the menu reaches ${key} with the arrow keys`);
    await page.keyboard.press('Enter'); ok(await page.waitForSelector(dlg(id), { timeout: 4000 }).then(() => true).catch(() => false), `8: Enter opens the ${id} dialog (${key})`);
    ok(await page.evaluate(() => { const d = document.querySelector('dialog[open]'); return !!d && d.contains(document.activeElement); }), `8: ${key}: the focus is inside the dialog`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    ok(await page.$(dlg(id)) === null, `8: Esc closes the ${key} dialog`);
    ok(await focusAct() === 'workflow', `8: ${key}: the focus is back on the Workflow button: ` + await focusAct());
  }
});

/* ======================================================================== 9. language */
await scenario('9 language', async () => {
  const en = {}; { const g = await groupsOf(); en.items = await page.evaluate(() => [...document.querySelectorAll('x')].length); await wfOpen(); en.labels = await page.$$eval('.sc-wf-menu [role=menuitem]', n => n.map(x => x.textContent.trim())); await wfClose(); }
  for (const lang of ['es-MX', 'id']) {
    const L = await ctx.newPage(); L.setDefaultTimeout(10000); watch(L, lang); await boot(L, URL0 + '?lang=' + lang);
    await wfOpen(L); const labels = await L.$$eval('.sc-wf-menu [role=menuitem]', n => n.map(x => x.textContent.trim())); const groups = await L.$$eval('.sc-wf-menu [role=group]', g => g.map(x => x.getAttribute('aria-labelledby') && document.getElementById(x.getAttribute('aria-labelledby')).textContent));
    ok(labels.length === en.labels.length && labels.every(t => t && !/\bsc\.[a-z0-9-]+\.[a-z0-9.-]+/.test(t)), `9 ${lang}: the menu has ${labels.length} items and no raw key: ` + labels.filter(t => /\bsc\./.test(t)).join(','));
    ok(labels.filter((t, i) => t !== en.labels[i]).length >= 8, `9 ${lang}: the menu is translated (${labels.filter((t, i) => t !== en.labels[i]).length} of ${labels.length} differ from English): ` + labels.slice(0, 4).join(' | '));
    ok(groups.every(t => t && !/\bsc\./.test(t)), `9 ${lang}: the group names: ` + groups.join(' | ')); await wfClose(L);
    for (const [key, id, sel] of [['communications:email', 'communications', null], ['communications:log', 'communications', null], ['notes-tasks:notes', 'notes-tasks', null], ['notes-tasks:tasks', 'notes-tasks', null], ['timer:timer', 'timer', null], ['calendar:events', 'calendar', null], ['calendar:new-event', 'calendar', null], ['notes-tasks:new-task', 'notes-tasks', null], ['timer:add', 'timer', null]]) {
      await runCmd(key, L); await L.waitForSelector(dlg(id), { timeout: 4000 }).catch(() => {}); const text = await L.evaluate(() => { const d = document.querySelector('dialog[open]'); return d ? d.textContent + ' ' + [...d.querySelectorAll('[placeholder],[aria-label],[title]')].map(x => (x.getAttribute('placeholder') || '') + ' ' + (x.getAttribute('aria-label') || '') + ' ' + (x.getAttribute('title') || '')).join(' ') : ''; });
      const raw = text.match(/\bsc\.[a-z0-9-]+\.[a-z0-9.-]+/g) || [];
      ok(text.length > 40 && raw.length === 0, `9 ${lang}: ${key}: the dialog shows words and no raw key` + (raw.length ? ' (' + raw.slice(0, 3).join(', ') + ')' : ''));
      await closeDlgs(L);
    }
    await L.click('.sc-wstab[data-ws="report"]').catch(() => {});
    const status = await L.$eval(PS + ' .sc-pstat-text', e => e.textContent).catch(() => ''); ok(status && !/\bsc\./.test(status), `9 ${lang}: the timer's status text is words: "${status}"`);
    await L.close();
  }
});

/* ======================================================================== the whole run */
ok(pageErrors.length === 0, 'no page errors in the whole run: ' + pageErrors.slice(0, 3).join(' | '));
ok(consoleErrors.length === 0, 'no console errors in the whole run (the harness\'s own 404s are filtered): ' + consoleErrors.slice(0, 3).join(' | '));
ok(missing.every(x => !/plugins\//.test(x)), 'no plugin file was missing from the page: ' + missing.filter(x => /plugins\//.test(x)).join(','));
if (missing.length) note('the harness served 404 for: ' + [...new Set(missing)].slice(0, 6).join(' '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
