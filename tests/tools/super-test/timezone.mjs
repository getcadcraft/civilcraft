// SPDX-License-Identifier: Apache-2.0
// Super: time zones (SC.15b) in headless Chromium: Settings › SuperCad Studio › Time zone (default this computer's, a chosen zone kept in this browser and in the exported preferences, a bad zone refused),
// times shown and typed in that zone while the file holds UTC, a changed zone redrawing an open dialog, a repeating event made through the form (weekly, count, attendees, reminders, a zone of its own), its occurrences
// (skip one, change one, this and the ones after), the .ics it makes (a real download; TZID, VTIMEZONE, RRULE, EXDATE, RECURRENCE-ID, ATTENDEE, VALARM) and the invitation handed to a fake share sheet.
// A real calendar program cannot be driven here.   node tools/super-test/timezone.mjs
import fs from 'node:fs';
import { start, launch } from './serve.mjs';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, timezoneId: 'America/Chicago' });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const WF = '.sc-barbtn[data-act="workflow"]', item = key => `.sc-wf-menu [data-act="plugin:${key}"]`;
const runCmd = async key => { if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.click(item(key)); };
const DLG = 'dialog[data-sc-plugin="calendar"][open]';
const file = (plugin, name) => page.evaluate(([p, n]) => { const b = window.superWindow.P.extGet(window.superWindow.project, p, n); return b ? new TextDecoder().decode(b) : null; }, [plugin, name]);
const json = async (plugin, name) => { const t = await file(plugin, name); return t ? JSON.parse(t) : null; };
const closeDlg = async () => { await page.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin][open]').forEach(d => d.close())); await page.waitForTimeout(100); };
/** Settings is a dialog that stays closed in this test: drive its controls in the page, as the other Super tests do. */
const setBox = (sel, on) => page.evaluate(([q, v]) => { const c = document.querySelector(q); c.checked = v; c.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, on]);
const setText = (sel, v) => page.evaluate(([q, x]) => { const c = document.querySelector(q); c.value = x; c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, v]);
const zoneNow = () => page.evaluate(() => window.superWindow.plugins.zone.get());
const unfold = t => t.replace(/\r\n /g, '');
async function downloads(selector) { try { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click(selector)]); return { name: dl.suggestedFilename(), text: fs.readFileSync(await dl.path(), 'utf8') }; } catch (e) { console.log('NO DOWNLOAD:', await page.textContent('[data-cal-msg]').catch(() => '?'), await page.textContent('[data-cal-warn]').catch(() => '?')); throw e; } }
const P = (d, t, z) => page.evaluate(([d1, t1, z1]) => { const [y, mo, da] = d1.split('-').map(Number), [h, mi] = t1.split(':').map(Number); return new Date(window.superWindow.plugins.time.wallToInstant(z1, { y, mo, d: da, h, mi, s: 0 }).ms).toISOString(); }, [d, t, z]);

/* ---- Settings › Time zone */
ok(await page.$('[data-sc-tz-set]') !== null, 'the Settings page has a Time zone section');
const s0 = await page.evaluate(() => ({ use: document.querySelector('[data-sc-tz-use]').checked, dis: document.querySelector('[data-sc-tz]').disabled, val: document.querySelector('[data-sc-tz]').value, now: document.querySelector('[data-sc-tz-now]').textContent, opts: document.querySelector('[data-sc-tz-list]').children.length, store: localStorage.getItem('cc-super-timezone') }));
ok(s0.use && s0.dis && s0.val === 'America/Chicago' && /Chicago/.test(s0.now) && s0.opts > 100 && s0.store === null, 'default: this computer\'s zone (America/Chicago here), the box ticked, the field off, a long list of zones, nothing stored: ' + JSON.stringify(s0));
await setBox('[data-sc-tz-use]', false); ok(!(await page.isDisabled('[data-sc-tz]')), 'untick "use this computer\'s zone": the field is on');
await setText('[data-sc-tz]', 'Pacific/Auckland'); await page.waitForTimeout(100);
ok(await zoneNow() === 'Pacific/Auckland' && await page.evaluate(() => localStorage.getItem('cc-super-timezone')) === 'Pacific/Auckland' && /Auckland/.test(await page.textContent('[data-sc-tz-now]')), 'a chosen zone is kept in this browser and shown');
const prefs = await page.evaluate(() => { const c = window.superWindow.PR.capture(localStorage); return c.sections.window && c.sections.window.keys['cc-super-timezone']; }); ok(prefs === 'Pacific/Auckland', 'and it travels in the exported preferences (window section): ' + prefs);
await setText('[data-sc-tz]', 'Mars/Olympus'); await page.waitForTimeout(100);
ok(await zoneNow() === 'Pacific/Auckland' && /not a time zone/i.test(await page.textContent('[data-sc-tz-msg]')) && await page.inputValue('[data-sc-tz]') === 'Pacific/Auckland', 'a zone the browser does not know is refused, with a message, and nothing changes');

/* ---- times typed and shown in the chosen zone; the file holds UTC */
await runCmd('calendar:new-event'); await page.waitForSelector(DLG); await page.waitForSelector('[data-cal-form]:not([hidden])');
await page.fill('[data-cal-title]', 'Kickoff in Auckland'); await page.fill('[data-cal-start]', '2026-12-07T09:00'); await page.fill('[data-cal-end]', '2026-12-07T10:00');
ok(await page.inputValue('[data-cal-zone]') === 'Pacific/Auckland', 'the form\'s Event time zone starts as the person\'s zone');
await page.click('[data-cal-save]'); await page.waitForTimeout(200);
let ev = await json('calendar', 'events.json'); const want = await P('2026-12-07', '09:00', 'Pacific/Auckland');
ok(ev && ev.version === 2 && ev.events[0].start === want && want === '2026-12-06T20:00:00.000Z' && /Z$/.test(ev.events[0].end) && ev.events[0].tz === 'Pacific/Auckland', 'typed 09:00 in Auckland: stored as 20:00Z the day before, with the event\'s zone: ' + JSON.stringify(ev && ev.events[0]).slice(0, 220));
const w1 = await page.textContent('[data-cal-when]'); ok(/9:00/.test(w1) && /Dec 7, 2026|7 Dec 2026|2026/.test(w1), 'the list shows it as 9:00 on 7 December: ' + w1);
await page.evaluate(() => { window.superWindow.plugins.zone.set('America/New_York'); }); await page.waitForTimeout(150);
const w2 = await page.textContent('[data-cal-when]'); ok(/3:00/.test(w2) && /Dec 6, 2026|6 Dec 2026/.test(w2) && /event zone: Pacific\/Auckland/.test(w2), 'a changed zone redraws the open dialog at once: 3:00 PM on 6 December in New York, naming the event\'s own zone: ' + w2);
await page.evaluate(() => { window.superWindow.plugins.zone.set('Pacific/Auckland'); }); await closeDlg();

/* ---- a repeating event through the form */
await runCmd('calendar:new-event'); await page.waitForSelector(DLG); await page.waitForSelector('[data-cal-form]:not([hidden])');
await page.fill('[data-cal-title]', 'Weekly site meeting'); await page.fill('[data-cal-start]', '2026-10-26T09:00'); await page.fill('[data-cal-end]', '2026-10-26T10:00');
await page.fill('[data-cal-zone]', 'America/New_York'); await page.dispatchEvent('[data-cal-zone]', 'change');
await page.fill('[data-cal-place]', 'Room 4'); await page.selectOption('[data-cal-repeat]', 'weekly'); await page.waitForSelector('[data-cal-weekdays]:not([hidden])');
ok(await page.isChecked('[data-cal-wd="1"]'), 'a weekly repeat starts with the start day\'s weekday ticked (Monday)'); await page.selectOption('[data-cal-ends]', 'count'); await page.fill('[data-cal-count]', '4');
await page.check('[data-cal-rem="15"]'); await page.check('[data-cal-rem="1440"]');
await page.fill('[data-cal-attendees]', 'Ann Lee <ann@example.com>\nbob@example.org (optional)'); await page.click('[data-cal-save]'); await page.waitForTimeout(250);
ev = await json('calendar', 'events.json'); const rec = ev.events[1];
ok(rec && rec.tz === 'America/New_York' && rec.recur.freq === 'weekly' && JSON.stringify(rec.recur.byDay) === '[1]' && rec.recur.ends.count === 4 && JSON.stringify(rec.reminders) === '[{"m":15},{"m":1440}]' && rec.attendees.length === 2 && rec.attendees[1].role === 'opt' && rec.start === '2026-10-26T13:00:00.000Z', 'the series is stored: its zone, rule, reminders and attendees; 09:00 New York on 26 October is 13:00Z: ' + JSON.stringify(rec).slice(0, 300));
ok(/Every week/.test(await page.textContent(`[data-entry="e2"] [data-chip="repeat"]`)) && /2 attendees/.test(await page.textContent('[data-entry="e2"] [data-chip="attendees"]')), 'the card shows the repeat in words and the attendees');
await page.click('[data-entry="e2"] summary'); await page.waitForTimeout(100);
const occ = await page.$$eval('[data-entry="e2"] [data-occ]', rows => rows.map(r => r.textContent.trim().slice(0, 60)));
ok(occ.length >= 1, 'the next occurrences are listed: ' + JSON.stringify(occ));
// skip one, change one, then this and the ones after
const rids = await page.$$eval('[data-entry="e2"] [data-act="cal-skip"]', bs => bs.map(b => b.dataset.rid)); ok(rids.length >= 3, 'each occurrence has Skip: ' + rids.length);
await page.click(`[data-act="cal-skip"][data-rid="${rids[1]}"]`); await page.waitForTimeout(200);
ev = await json('calendar', 'events.json'); ok(JSON.stringify(ev.events[1].exdates) === JSON.stringify([rids[1]]) && /Skipped/.test(await page.textContent('[data-cal-msg]')), 'skipping one occurrence records it (EXDATE) and says so');
await page.click('[data-entry="e2"] summary').catch(() => {});
await page.click(`[data-act="cal-edit-one"][data-rid="${rids[2]}"]`); await page.waitForTimeout(150);
await page.fill('[data-entry="e2"] [data-cal-title]', 'Moved meeting'); await page.click('[data-entry="e2"] [data-cal-save]'); await page.waitForTimeout(250);
ev = await json('calendar', 'events.json'); ok(ev.events[1].overrides && ev.events[1].overrides.length === 1 && ev.events[1].overrides[0].rid === rids[2] && ev.events[1].overrides[0].title === 'Moved meeting' && ev.events[1].recur.ends.count === 4, 'changing only one occurrence records an override and leaves the series alone');

// the .ics: a real download
const dl = await downloads('[data-act="cal-ics"][data-event="e2"]'); const T = unfold(dl.text).split('\r\n');
ok(/\.ics$/.test(dl.name) && T[0] === 'BEGIN:VCALENDAR' && T.includes('METHOD:PUBLISH') && T.includes('TZID:America/New_York') && T.includes('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=4') && T.some(l => /^EXDATE;TZID=America\/New_York:2026\d{4}T090000$/.test(l)) && T.some(l => /^RECURRENCE-ID;TZID=America\/New_York:/.test(l)) && T.includes('DTSTART;TZID=America/New_York:20261026T090000'), 'the downloaded file: PUBLISH (no organiser set), TZID with its VTIMEZONE, the RRULE, the EXDATE, the RECURRENCE-ID: ' + T.filter(l => /^(METHOD|RRULE|EXDATE|RECURRENCE|DTSTART)/.test(l)).join(' | '));
ok(T.filter(l => /^ATTENDEE/.test(l)).length === 4 && T.filter(l => l === 'BEGIN:VALARM').length === 4 && T.some(l => l === 'BEGIN:DAYLIGHT' || l === 'BEGIN:STANDARD'), 'two attendees and two reminders on the series and on the changed occurrence; the zone\'s changes are spelled out');
ok(/handed|saved to your downloads/.test(await page.textContent('[data-cal-msg]')) && !/added to (your|the) calendar/i.test(await page.textContent('[data-cal-msg]')), 'the dialog says the file was saved, never that it was added to a calendar');
// the invitation: a fake share sheet takes it; the mail topic hands it over and the log says handed to mail app
await page.evaluate(() => { window.__shares = []; Object.defineProperty(navigator, 'canShare', { configurable: true, value: o => !!(o && o.files && o.files.length) }); Object.defineProperty(navigator, 'share', { configurable: true, value: async o => { window.__shares.push({ files: o.files.map(f => f.name), title: o.title, text: o.text, ics: await o.files[0].text() }); } }); });
await page.click('[data-act="cal-invite"][data-event="e2"]'); await page.waitForTimeout(400);
const sh = await page.evaluate(() => window.__shares); ok(sh.length === 1 && /\.ics$/.test(sh[0].files[0]) && /Invitation: Weekly site meeting/.test(sh[0].title), 'the invitation goes to the share sheet with the file: ' + JSON.stringify(sh));
ok(/cannot know whether anyone received it/.test(await page.textContent('[data-cal-msg]')), 'and the dialog says Super cannot know whether anyone received it or replied');
const log = await json('communications', 'log.json'); const last = log && log.entries[log.entries.length - 1]; ok(last && last.kind === 'email' && last.status === 'handed to mail app' && last.to === 'ann@example.com, bob@example.org' && last.attachments[0].name.endsWith('.ics'), 'the communications log has it as an email, handed to mail app: ' + JSON.stringify(last).slice(0, 220));
// this and the ones after
await page.click('[data-entry="e2"] summary').catch(() => {}); const r2 = await page.$$eval('[data-entry="e2"] [data-act="cal-edit-following"]', bs => bs.map(b => b.dataset.rid));
if (r2.length) { await page.click(`[data-act="cal-edit-following"][data-rid="${r2[0]}"]`); await page.waitForTimeout(150); await page.fill('[data-entry="e2"] [data-cal-title]', 'Weekly site meeting (new series)'); await page.click('[data-entry="e2"] [data-cal-save]'); await page.waitForTimeout(250);
  ev = await json('calendar', 'events.json'); ok(ev.events.length === 3 && ev.events[2].title === 'Weekly site meeting (new series)' && ev.events[1].recur.ends.type === 'count' && ev.events[2].recur.ends.type === 'count', 'this and the ones after cuts the series and starts a new one: ' + ev.events.map(e => e.title + ' ' + JSON.stringify(e.recur && e.recur.ends)).join(' / ')); }
else ok(false, 'no "this and the ones after" button');
await closeDlg();

/* ---- the Report strip speaks of occurrences, in the zone; the organiser setting; a repeat form refuses a bad day */
await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(200);
const strip = await page.evaluate(() => (document.querySelector('[data-sc-summary]') || {}).textContent || ''); ok(/Next event|Events this week/.test(strip), 'the Report strip still has the calendar lines: ' + strip.slice(0, 120));
ok(await page.$('[data-cal-org-email]') !== null, 'Settings › Plugins › Calendar has the organiser fields');
await setText('[data-cal-org-email]', 'me@example.com'); await setText('[data-cal-org-name]', 'Me'); await page.evaluate(() => document.querySelector('[data-cal-org-save]').click()); await page.waitForTimeout(100);
ok(await page.evaluate(() => localStorage.getItem('cc-super-plugin-calendar')) && /saved/i.test(await page.textContent('[data-cal-org-msg]')) && !/me@example\.com/.test(await file('calendar', 'events.json')), 'the organiser is kept in this browser only: not in the project file');
await runCmd('calendar:events'); await page.waitForSelector(DLG); await page.evaluate(() => { window.__shares = []; }); await page.click('[data-act="cal-ics"][data-event="e3"]'); await page.waitForTimeout(400); const shs = await page.evaluate(() => window.__shares); ok(shs.length === 1 && unfold(shs[0].ics).includes('METHOD:REQUEST') && unfold(shs[0].ics).includes('ORGANIZER;CN="Me":mailto:me@example.com'), 'with an organiser set the file is METHOD:REQUEST with an ORGANIZER line'); await closeDlg();
// back to this computer's zone
await setBox('[data-sc-tz-use]', true); await page.waitForTimeout(100); ok(await zoneNow() === 'America/Chicago' && await page.evaluate(() => localStorage.getItem('cc-super-timezone')) === null, 'tick "use this computer\'s zone": back to America/Chicago, the stored choice is removed');
ok(errors.length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); await close();
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
