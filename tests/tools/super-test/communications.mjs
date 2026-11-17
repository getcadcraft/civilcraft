// SPDX-License-Identifier: Apache-2.0
// Super: the plugin host and the communications plugin (SC.12) in headless Chromium: the Email… and Communications… commands in every workspace and in the docked
// layout, Ctrl+K, the modal, the three hand-off tiers with a fake share sheet and a fake mail opener (a real mail client cannot be driven here), the log, the Settings switch.
//   node tools/super-test/communications.mjs
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
/** is the command in the Workflow menu? (no button at all = no plugin command is on) */
const inMenu = async key => { if (!await page.$(WF)) return false; await wfOpen(); const r = await page.$(item(key)) !== null; await wfClose(); return r; };
const runCmd = async key => { await wfOpen(); await page.click(item(key)); };
const EMAIL = 'communications:email', LOG = 'communications:log';
const log = () => page.evaluate(() => { const b = window.superWindow.P.extGet(window.superWindow.project, 'communications', 'log.json'); return b ? JSON.parse(new TextDecoder().decode(b)) : null; });

// the host and the plugin
const pl = await page.evaluate(() => ({ list: window.superWindow.plugins.list(), cmds: window.superWindow.plugins.commands().map(c => c.key) }));
const me = pl.list.find(x => x.id === 'communications');
ok(!!me && me.enabled && !me.error, 'the plugin is registered, on and started without an error: ' + JSON.stringify(pl.list));
ok(pl.cmds.filter(k => k.startsWith('communications:')).join() === 'communications:email,communications:log', 'its two commands: ' + pl.cmds);

// Email… and Communications… in every workspace
const shown = await page.evaluate(() => window.superWindow.state.shown);
ok(shown.length >= 5, 'the five workspaces are shown: ' + shown);
for (const id of shown) {
  await page.click(`.sc-wstab[data-ws="${id}"]`); await page.waitForTimeout(150);
  ok(await inMenu(EMAIL) && await inMenu(LOG), `workspace ${id}: Email… and Communications… are in the Workflow menu`);
}
// Ctrl+K
await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().some(i => i.id === 'app:plugin:communications:email'), null, { timeout: 8000 }).catch(() => {});
const pal = await page.evaluate(() => window.ccPalette ? window.ccPalette.items().filter(i => /^app:plugin:communications:/.test(i.id)).map(i => [i.id, i.label]) : []);
ok(pal.length === 2 && pal[0][1] === 'Email…', 'Ctrl+K lists both commands: ' + JSON.stringify(pal));
await page.keyboard.press('Control+k'); await page.waitForTimeout(200); await page.keyboard.type('email');
const hits = await page.$$eval('.shell-palette-opt', e => e.map(x => x.textContent));
ok(hits.some(h => /Email/.test(h)), 'typing "email" in Ctrl+K finds it: ' + hits.slice(0, 3).join(' | '));
await page.keyboard.press('Escape');

// the modal
await page.evaluate(() => { const { P, project } = window.superWindow; P.addMember(project, { app: 'cadcraft', name: 'floor.dwg', bytes: new TextEncoder().encode('dwg-bytes') }); });
await runCmd(EMAIL); await page.waitForSelector('dialog[data-sc-plugin="communications"][open]');
const m = await page.evaluate(() => { const d = document.querySelector('dialog[data-sc-plugin=communications]'); return { radios: [...d.querySelectorAll('input[name=sc-mail-what]')].map(r => [r.value, r.disabled]), text: d.textContent, files: [...d.querySelectorAll('[data-format]')].length }; });
ok(m.radios.map(r => r[0]).join() === 'view,files,zip,project', 'the four things to send: ' + m.radios.map(r => r[0]));
ok(m.radios.find(r => r[0] === 'project')[1] === false, 'the project file is always offered');
ok(/does not tell us/.test(m.text) && !/\bsent\b/i.test(m.text.replace(/not tell us whether you send/gi, '')), 'the modal says a mail app does not tell us if it was sent');
ok(m.files === 7, 'every export format is listed (greyed when no open app can write it): ' + m.files);
await page.check('input[name=sc-mail-what][value=project]');
// a wrong address is refused before anything is handed over
await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); Object.defineProperty(navigator, 'share', { value: async d => { window.__shared = { n: d.files.length, title: d.title, text: d.text, name: d.files[0].name }; }, configurable: true }); });
await page.fill('[data-mail-to]', 'nobody-at-all'); await page.fill('[data-mail-subject]', 'Corner shop plan'); await page.fill('[data-mail-note]', 'Please review');
await page.click('[data-act=mail-prepare]'); await page.waitForSelector('[data-act=mail-handoff]:not([hidden])', { timeout: 30000 });
const ready = await page.textContent('[data-mail-ready]');
ok(/\.ccproject/.test(ready) && /attachment/.test(ready), 'the prepared files are listed before the hand-off: ' + ready.slice(0, 120));
ok(/share sheet/.test(await page.textContent('[data-mail-tier]')), 'tier 1 (share) is announced when the browser can share files');
await page.click('[data-act=mail-handoff]');
ok(/look wrong/.test(await page.textContent('[data-mail-status]')) && (await log()) === null, 'a bad address stops the hand-off and logs nothing');
// the share tier
await page.fill('[data-mail-to]', 'pat@example.com, lee@example.org');
await page.click('[data-act=mail-handoff]'); await page.waitForFunction(() => /does not tell us/.test(document.querySelector('[data-mail-status]').textContent), null, { timeout: 8000 });
const shared = await page.evaluate(() => window.__shared);
ok(shared && shared.n === 1 && shared.title === 'Corner shop plan' && shared.text === 'Please review' && /\.ccproject$/.test(shared.name), 'share: the sheet got the file, the subject and the note: ' + JSON.stringify(shared));
let L = await log();
const e1 = L.entries[0];
ok(L.entries.length === 1 && e1.via === 'share' && e1.status === 'handed to mail app' && e1.to === 'pat@example.com, lee@example.org' && e1.subject === 'Corner shop plan', 'share: one log entry, handed to mail app: ' + JSON.stringify(e1).slice(0, 220));
ok(e1.attachments.length === 1 && /\.ccproject$/.test(e1.attachments[0].name) && e1.attachments[0].size > 100 && /^[0-9a-f]{64}$/.test(e1.attachments[0].sha256) && !e1.attachments[0].kept, 'share: the attachment is a reference (name, size, sha256), no copy by default');
ok(/Recorded in the project/.test(await page.textContent('[data-mail-status]')), 'the person is told it was logged');
// a closed share sheet is not a hand-off
await page.evaluate(() => { Object.defineProperty(navigator, 'share', { value: async () => { const e = new Error('closed'); e.name = 'AbortError'; throw e; }, configurable: true }); });
await page.click('[data-act=mail-prepare]'); await page.waitForSelector('[data-act=mail-handoff]:not([hidden])', { timeout: 30000 });
await page.click('[data-act=mail-handoff]'); await page.waitForTimeout(300);
ok((await log()).entries.length === 1 && /Nothing was handed over/.test(await page.textContent('[data-mail-status]')), 'a closed share sheet is cancelled: nothing logged');
ok(await page.isVisible('[data-act=mail-handoff]'), 'and the files stay prepared, so the person can try again');
// the mailto tier: files saved, mail app opened with the message filled in, the person told to attach
await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { value: () => false, configurable: true }); document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href^="mailto:"]'); if (a) { e.preventDefault(); window.__mailto = a.getAttribute('href'); } }, true); });
await page.check('[data-mail-keep]');
await page.evaluate(() => document.querySelector('input[name=sc-mail-what][value=project]').dispatchEvent(new Event('change', { bubbles: true })));   // choosing again starts over
await page.click('[data-act=mail-prepare]'); await page.waitForSelector('[data-act=mail-handoff]:not([hidden])', { timeout: 30000 });
ok(/attach the saved files yourself/.test(await page.textContent('[data-mail-tier]')), 'tier 2 (mailto) says plainly to attach the saved files');
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click('[data-act=mail-handoff]')]);
ok(/\.ccproject$/.test(dl.suggestedFilename()), 'mailto: the attachment is saved as a download: ' + dl.suggestedFilename());
await page.waitForFunction(() => window.__mailto, null, { timeout: 8000 });
const mailto = await page.evaluate(() => window.__mailto);
ok(mailto.startsWith('mailto:pat%40example.com,lee%40example.org?subject=Corner%20shop%20plan&body=') && /Please%20review/.test(mailto) && /Attach%3A/.test(mailto), 'mailto: recipients, subject, note and the attach line: ' + mailto.slice(0, 160));
L = await log(); const e2 = L.entries[1];
ok(L.entries.length === 2 && e2.via === 'mailto' && e2.status === 'handed to mail app', 'mailto: logged as handed to mail app');
ok(e2.attachments[0].kept === true && /^attachments\/c2-/.test(e2.attachments[0].path), 'keep a copy (ticked): the bytes are in the project: ' + e2.attachments[0].path);
const kept = await page.evaluate(p => { const { P, project } = window.superWindow; const b = P.extGet(project, 'communications', p); return b ? b.length : 0; }, e2.attachments[0].path);
ok(kept > 100, 'the kept copy has its bytes: ' + kept);
await page.click('[data-act=mail-close]'); await page.waitForSelector('dialog[data-sc-plugin="communications"]', { state: 'detached' });

// the log panel: list, search, add by hand, edit
await runCmd(LOG); await page.waitForSelector('dialog[data-sc-plugin="communications"][open]');
ok((await page.$$('[data-log-list] [data-entry]')).length === 2, 'the log lists both entries');
ok(/does not tell us/.test(await page.textContent('dialog[data-sc-plugin] .sc-find-note')), 'the log says what an entry means: a hand-off, not a delivery');
await page.fill('[data-log-search]', 'lee@example.org'); ok((await page.$$('[data-log-list] [data-entry]')).length === 2, 'search matches the recipient');
await page.fill('[data-log-search]', 'zzz-nothing'); ok((await page.$$('[data-log-list] [data-entry]')).length === 0, 'search with no match shows none'); await page.fill('[data-log-search]', '');
await page.click('[data-act=log-add]'); await page.fill('[data-manual-to]', 'client@example.com'); await page.fill('[data-manual-subject]', 'Sent from my own mail app'); await page.fill('[data-manual-names]', 'plan.pdf, site.ifc'); await page.fill('[data-manual-note]', 'Called first');
await page.click('[data-log-manual-save]'); await page.waitForTimeout(150);
L = await log(); const e3 = L.entries[2];
ok(L.entries.length === 3 && e3.via === 'manual' && e3.status === 'recorded by hand' && e3.attachments.map(a => a.name).join() === 'plan.pdf,site.ifc', 'an entry added by hand: recorded by hand');
ok((await page.$$('[data-log-list] [data-entry]')).length === 3 && /Recorded by hand/.test(await page.textContent('[data-log-list]')), 'it shows in the list as recorded by hand');
await page.click('[data-log-edit="c1"]'); await page.fill('[data-edit-note]', 'Edited note'); await page.fill('[data-edit-to]', 'pat@example.com'); await page.click('[data-log-save="c1"]'); await page.waitForTimeout(150);
L = await log(); const c1 = L.entries.find(e => e.id === 'c1');
ok(c1.note === 'Edited note' && c1.to === 'pat@example.com' && c1.history.length === 1 && c1.history[0].note === 'Please review' && c1.editedAt, 'an edit is saved and the earlier values are kept: ' + JSON.stringify(c1.history));
ok(/Edited/.test(await page.textContent('[data-entry="c1"]')), 'the list says it was edited');
await page.click('[data-act=log-close]');

// the log travels with the project
const rt = await page.evaluate(async () => { const { P, project } = window.superWindow; const a = P.extGet(project, 'communications', 'log.json'); const back = await P.fromBytes(P.toBytes(project, {})); const b = P.extGet(back.project, 'communications', 'log.json');
  return { same: !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]), n: back.project.ext.size }; });
ok(rt.same && rt.n >= 2, 'the log and the kept copy come back from the project file byte for byte: ' + JSON.stringify(rt));

// Settings › Plugins: the switch
const sw = await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=communications]'); return { has: !!c, on: c && c.checked, row: !!document.querySelector('[data-sc-plugin-row=communications]'), about: (document.querySelector('[data-sc-plugin-row=communications]') || {}).textContent }; });
ok(sw.has && sw.on && sw.row && /Email this/.test(sw.about), 'Settings › SuperCad Studio › Plugins lists it with a switch: ' + JSON.stringify(sw).slice(0, 160));
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=communications]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(!await inMenu(EMAIL) && !await inMenu(LOG), 'switched off: the commands leave the Workflow menu');
ok(await page.evaluate(() => !window.ccPalette.items().some(i => /^app:plugin:communications:/.test(i.id))), 'switched off: Ctrl+K no longer lists them');
ok(await page.evaluate(() => localStorage.getItem('cc-super-plugins')) === '{"communications":false}', 'the choice is remembered');
const kept2 = await page.evaluate(async () => { const { P, project } = window.superWindow; const back = await P.fromBytes(P.toBytes(project, {})); return P.extList(back.project, 'communications').length; });
ok(kept2 >= 2, 'switched off: a save still carries the plugin\'s files untouched: ' + kept2);
await page.evaluate(() => { const c = document.querySelector('[data-sc-plugin-on=communications]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(250);
ok(await inMenu(EMAIL), 'switched on again: the command is back in the Workflow menu');

// the docked layout (Ribbon and project browser) keeps the window's own bar
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0 + '?workspace=docked'); await page.waitForSelector('[data-sc-ready]');
await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 }); await page.evaluate(() => window.superWindow.ready);
ok(await inMenu(EMAIL) && await inMenu(LOG), 'the docked layout: Email… and Communications… are in the window bar\'s Workflow menu too');
await runCmd(EMAIL); await page.waitForSelector('dialog[data-sc-plugin="communications"][open]'); await page.click('[data-act=mail-close]');
ok(missing.length === 0 || missing.every(x => !/plugins\//.test(x)), 'no plugin file was missing from the page: ' + missing.filter(x => /plugins\//.test(x)).join(','));
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
