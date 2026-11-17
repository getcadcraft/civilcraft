// SPDX-License-Identifier: Apache-2.0
// Super: the object registry, the History page and the one-writer lock in a real browser (BK.50, BK.136, BK.137, BK.138, BK.51).
// Two windows of one browser open the same project: the first edits, the second sees it read-only and cannot save; a restore point is made and restored
// from the History page; a stale lock is taken over on purpose. Nothing here posts to the site.
//   node tools/super-test/registry.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const errors = [];
const open = async (u = url) => { const page = await ctx.newPage(); page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  await page.goto(u); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(600); return page; };
const PG = '[data-home-view="page"]:not([hidden])';
const history = async page => { await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(200); await page.evaluate(() => window.superWindow.home.show('project-options')); await page.click('[data-home-project-pages] [data-hvpage="history:history"]'); await page.waitForSelector(PG + ' [data-reg-list]'); };
const text = async (page, sel) => ((await page.textContent(sel)) || '').replace(/\s+/g, ' ').trim();

/* ---- window 1: a fresh window ---- */
const A = await open();
ok(await A.evaluate(() => !!window.superRegistry && typeof window.superRegistry.REG.register === 'function'), 'the window has the registry (window.superRegistry)');
await A.evaluate(() => window.superWindow.home.show('home')); await A.waitForTimeout(250);
await A.evaluate(() => window.superWindow.home.show('project-options'));
ok(await A.$('[data-home-project-pages] [data-hvpage="history:history"]') !== null, 'the welcome menu has a History entry');
await history(A);
ok((await text(A, PG + ' h1')) === 'History' && await A.$$eval('dialog[open]', n => n.length) === 0, 'History is a page with its heading, not a dialog');
ok(await A.$(PG + ' [data-reg-empty]') !== null && (await A.getAttribute(PG + ' [data-reg-lock]', 'data-reg-lock')) === 'free', 'a new, unsaved project: no saves yet, no lock to hold');
ok(await A.$eval('[data-reg-banner]', b => b.hidden), 'no read-only notice');

// a project made with the page's own modules: a drawing (DXF, 3 entities) and a takeoff (2 items, 1 mark, 1 sheet), saved once = revision 1.
// The members belong to Engineer (which has no panel) so that no app has to start for this test; the readers go by the file, not by the app.
const zip = await A.evaluate(() => {
  const P = window.superWindow.P, enc = s => new TextEncoder().encode(s);
  const dxf = ents => ['0', 'SECTION', '2', 'ENTITIES', ...ents.flatMap(h => ['0', 'LINE', '5', h, '8', 'WALLS', '10', '0', '20', '0', '11', '4', '21', '0']), '0', 'ENDSEC', '0', 'EOF', ''].join('\n');
  const p = P.newProject('Corner shop'); p.created = '2026-11-11T08:00:00.000Z';
  P.addMember(p, { app: 'engineer', name: 'plan.dxf', bytes: enc(dxf(['A1', 'A2', 'A3'])) });
  P.addMember(p, { app: 'engineer', name: 'bid.takeoff.json', bytes: enc(JSON.stringify({ format: 'takeoffcraft-project', version: 1, sheets: { 'abcdef0123:0': { title: 'A-101' } }, items: [{ id: 'i1', name: 'Gypsum board' }, { id: 'i2', name: '<img src=x onerror="window.__pwn=1">' }], marks: [{ id: 'k1', item: 'i1', kind: 'area' }] })) });
  window.__dxf = dxf;
  return [...P.toBytes(p, { by: 'Ann Example', build: 'dev' })];
});
const openZip = (page, name = 'Corner shop.ccproject') => page.evaluate(async ([bytes, n]) => window.superWindow.openProject(new File([new Uint8Array(bytes)], n)), [zip, name]);
await A.evaluate(() => window.superRegistry.lock.setName('Ann <b>Example</b>'));
await A.evaluate(() => { const s = window.superRegistry.lock.setName; window.superRegistry.lock.setName = () => s('Ann <b>Example</b>'); });   // the harness has no signed-in name
await openZip(A); await A.waitForTimeout(400);
const sa = await A.evaluate(() => ({ lock: window.superRegistry.state(), stats: window.superRegistry.REG.stats(window.superWindow.project), rev: window.superRegistry.REG.currentRevision(window.superWindow.project) }));
ok(sa.lock.mode === 'writer' && sa.lock.mine && !sa.lock.readOnly, 'window 1 opened the project first: it is the writer');
ok(sa.stats.live === 9 && sa.rev === 1, 'the registry came with the file: 3 entities + 4 takeoff entries + the 2 files = 9, at revision 1: ' + JSON.stringify([sa.stats.live, sa.rev]));
await history(A);
ok((await A.getAttribute(PG + ' [data-reg-lock]', 'data-reg-lock')) === 'writer' && /You are editing this project/.test(await text(A, PG + ' [data-reg-lock]')), 'History says: you are editing');
const r1 = await text(A, PG + ' [data-reg-rev="1"]');
ok(/Revision 1/.test(r1) && /by Ann Example/.test(r1) && /9 added, 0 changed, 0 deleted/.test(r1), 'revision 1: who, and 9 added: ' + r1);
ok(/9 objects in the project\. Deleted objects kept on record: 0 /.test(await text(A, PG + ' [data-reg-stats]')), 'the count line');
// the objects of a revision; the caret is on the right, up when closed and down when open
const tog = PG + ' [data-reg-rev="1"] [data-reg-act="objects"]';
ok(await A.$eval(tog, b => b.lastElementChild.classList.contains('bi-chevron-up') && b.getAttribute('aria-expanded') === 'false'), 'Objects is closed: the caret is last (right) and points up');
await A.click(tog); await A.waitForSelector(PG + ' [data-reg-detail="1"] tbody tr');
ok(await A.$eval(tog, b => b.lastElementChild.classList.contains('bi-chevron-down') && b.getAttribute('aria-expanded') === 'true'), 'open: the caret points down');
const rows = await A.$$eval(PG + ' [data-reg-detail="1"] tbody tr', n => n.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
ok(rows.length === 9 && rows.some(x => /Added.*LINE · WALLS.*Drawing entity.*o\d/.test(x)) && rows.some(x => /Gypsum board.*Takeoff item/.test(x)) && rows.some(x => /A-101.*Sheet/.test(x)), 'nine rows: the entities, the takeoff items, the sheet, the files');
ok(await A.evaluate(() => window.__pwn === undefined) && await A.$(PG + ' img[src="x"]') === null, 'an object name that looks like markup is shown as text');
await A.screenshot({ path: `${OUT}/registry-1-history.png` });

/* ---- window 2: the same project, at the same time ---- */
const B = await open();
await openZip(B); await B.waitForTimeout(400);
const sb = await B.evaluate(() => window.superRegistry.state());
ok(sb.mode === 'reader' && sb.readOnly && !sb.mine && sb.holder.name === 'Ann <b>Example</b>', 'window 2 opened it second: read-only, and it knows who holds the lock: ' + JSON.stringify(sb.holder && sb.holder.name));
ok(await B.$eval('[data-reg-banner]', b => !b.hidden) && await B.evaluate(() => document.documentElement.hasAttribute('data-reg-readonly')), 'the read-only notice is up');
const banner = await text(B, '[data-reg-banner]');
ok(/^\s*Read-only\. Ann <b>Example<\/b> has been editing this project since /.test(banner) && await B.$('[data-reg-banner] b') === null, 'it says plainly who and since when (the name is text, never markup): ' + banner);
ok(await B.$('[data-reg-banner] [data-reg-act="take"]') === null, 'a live lock offers no take-over');
ok(await B.evaluate(() => window.superRegistry.REG.list(window.superWindow.project).length) === 9, 'the reader still sees every object');
// Save is refused, with words, and nothing is downloaded
let downloaded = false; B.once('download', () => { downloaded = true; });
await B.evaluate(() => window.superWindow.home.leave()); await B.click('.sc-barbtn[data-act="save"]'); await B.waitForTimeout(600);
ok(!downloaded && await B.evaluate(() => window.superWindow.project.revision) === 1, 'Save in the read-only window writes nothing (still revision 1, no file)');
ok(/Not saved: this window can only read the project\./.test(await B.evaluate(() => document.body.textContent)), 'and says so');
await history(B);
ok(/Read-only\./.test(await text(B, PG + ' [data-reg-lock]')) && await B.$eval(PG + ' [data-reg-act="check"]', b => b.disabled) && await B.$eval(PG + ' [data-reg-act="point"]', b => b.disabled), 'its History page says read-only; Check and Make a restore point are off');
ok(await B.evaluate(() => window.superRegistry.REG.register(window.superWindow.project, { app: 'bimcraft', native_id: 'x' })) === null, 'and the registry refuses a write there');
await B.screenshot({ path: `${OUT}/registry-2-readonly.png` });
ok((await A.evaluate(async () => (await window.superRegistry.lock.beat()).mode)) === 'writer', 'window 1 is still the writer');

/* ---- window 1: a restore point, a change, a save, a restore ---- */
await A.fill(PG + ' [data-reg-point-name]', 'Before the client changes');
const [dl1] = await Promise.all([A.waitForEvent('download'), A.click(PG + ' [data-reg-act="point"]')]);
ok(dl1.suggestedFilename() === 'Corner shop.ccproject', 'Make a restore point saves the project: ' + dl1.suggestedFilename());
await A.waitForSelector(PG + ' [data-reg-rev="2"] [data-reg-point]');
ok(/Restore point: Before the client changes/.test(await text(A, PG + ' [data-reg-rev="2"]')) && await A.$(PG + ' [data-reg-rev="2"] [data-reg-act="restore"]') !== null, 'revision 2 is a restore point with its name and a Restore button');
ok(await A.$(PG + ' [data-reg-rev="1"] [data-reg-act="restore"]') === null, 'an ordinary save has no Restore');
const copies = await A.evaluate(() => [...window.superWindow.project.vh.files.keys()].map(k => k.replace(/^version_history\/[^/]+\//, '')).sort());
ok(JSON.stringify(copies) === JSON.stringify(['Data/bid.takeoff.json', 'Drawings/2D/plan.dxf']), 'it keeps a copy of every member: ' + copies);
// delete an entity and a takeoff item, add one (as the apps saving would)
await A.evaluate(() => { const P = window.superWindow.P, p = window.superWindow.project, enc = s => new TextEncoder().encode(s);
  P.addMember(p, { app: 'engineer', name: 'plan.dxf', bytes: enc(window.__dxf(['A1', 'A3', 'A9'])) });
  P.addMember(p, { app: 'engineer', name: 'bid.takeoff.json', bytes: enc(JSON.stringify({ format: 'takeoffcraft-project', version: 1, sheets: { 'abcdef0123:0': { title: 'A-101' } }, items: [{ id: 'i1', name: 'Gypsum board' }], marks: [{ id: 'k1', item: 'i1', kind: 'area' }] })) }); });
const ids = await A.evaluate(() => { const R = window.superRegistry.REG, p = window.superWindow.project; return { a2: R.byNative(p, 'engineer', 'm1:A2').id, i2: R.byNative(p, 'engineer', 'i2').id }; });
await A.click(PG + ' [data-reg-act="check"]'); await A.waitForFunction(sel => /1 added, 2 changed, 2 deleted/.test(document.querySelector(sel).textContent), PG + ' [data-reg-pending]');
ok(/Checked: 1 added, 2 changed, 2 deleted since the last save\./.test(await text(A, PG + ' [data-reg-msg]')), 'Check for changes: 1 added, 2 changed (the two files), 2 deleted, shown as not saved yet');
await A.evaluate(() => window.superWindow.home.leave());
const [dl2] = await Promise.all([A.waitForEvent('download'), A.click('.sc-barbtn[data-act="save"]')]); await dl2.path();
await history(A);
ok(/1 added, 2 changed, 2 deleted/.test(await text(A, PG + ' [data-reg-rev="3"]')), 'the save is revision 3 with those counts');
const dead = await A.evaluate(i => { const R = window.superRegistry.REG, p = window.superWindow.project; return [R.get(p, i.a2).deleted_rev, R.get(p, i.i2).deleted_rev, R.byNative(p, 'engineer', 'm1:A2'), R.byNative(p, 'engineer', 'm1:A9').id]; }, ids);
ok(dead[0] === 3 && dead[1] === 3 && dead[2] === null && dead[3] !== ids.a2, 'the deleted entity and item keep their rows (tombstones of revision 3); the new entity has a new id: ' + JSON.stringify(dead));
// restore the restore point: the old ids are back
A.once('dialog', d => d.accept());
await A.click(PG + ' [data-reg-rev="2"] [data-reg-act="restore"]');
await A.waitForFunction(sel => /Restored to revision 2/.test(document.querySelector(sel)?.textContent || ''), PG + ' [data-reg-msg]', { timeout: 15000 }).catch(() => {});
const back = await A.evaluate(i => { const R = window.superRegistry.REG, p = window.superWindow.project; return { a2: R.byNative(p, 'engineer', 'm1:A2')?.id, i2: R.byNative(p, 'engineer', 'i2')?.id, a9: R.byNative(p, 'engineer', 'm1:A9'), live: R.list(p).length, name: p.name, n: p.members.length }; }, ids);
ok(back.a2 === ids.a2 && back.i2 === ids.i2 && back.a9 === null && back.live === 9, 'Restore: the deleted entity and item are back under their OLD ids, the entity made since is gone: ' + JSON.stringify(back));
ok(back.name === 'Corner shop' && back.n === 2, 'the project is the same project');
ok((await A.evaluate(() => window.superRegistry.state().mode)) === 'writer', 'and this window still holds the lock');
await A.evaluate(() => window.superWindow.home.leave());
const [dl3] = await Promise.all([A.waitForEvent('download'), A.click('.sc-barbtn[data-act="save"]')]); await dl3.path();
await history(A);
const r4 = await text(A, PG + ' [data-reg-rev="4"]');
ok(/Restored to revision 2/.test(r4), 'the next save is revision 4 and its note says what it restored: ' + r4);
await A.screenshot({ path: `${OUT}/registry-3-restored.png` });

/* ---- the writer closes: the reader may take over; and a stale lock ---- */
await A.close(); await B.waitForTimeout(300);
await B.evaluate(() => window.superRegistry.lock.beat()); await B.waitForTimeout(200);
ok(/Nobody is editing this project now/.test(await text(B, '[data-reg-banner]')) && await B.$('[data-reg-banner] [data-reg-act="take"]') !== null, 'window 1 closed: window 2 is told nobody is editing and may take over');
// someone whose window died an hour ago: a stale record
await B.evaluate(() => { const k = window.superRegistry.lock.key; localStorage.setItem(k, JSON.stringify({ format: 'supercadcraft-lock', version: 1, session: 'dead-session-0001', name: 'Dana Gone', since: '2026-11-11T07:00:00.000Z', seen: new Date(Date.now() - 3600000).toISOString() })); return window.superRegistry.lock.beat(); });
await B.waitForTimeout(200);
const stale = await text(B, '[data-reg-banner]');
ok(/Dana Gone opened this project for editing on .* and was last seen on .* you can take over\./.test(stale), 'a stale lock says who, since when, last seen, and offers the take-over: ' + stale);
ok(await B.evaluate(() => window.superRegistry.state().readOnly), 'until then the window stays read-only (nothing is taken by itself)');
await B.click('[data-reg-banner] [data-reg-act="take"]'); await B.waitForTimeout(300);
const tb = await B.evaluate(() => ({ s: window.superRegistry.state(), hidden: document.querySelector('[data-reg-banner]').hidden, attr: document.documentElement.hasAttribute('data-reg-readonly') }));
ok(tb.s.mode === 'writer' && tb.hidden && !tb.attr, 'Take over editing: this window is the writer now and the notice is gone');
await B.evaluate(() => window.superWindow.home.leave());
const [dl4] = await Promise.all([B.waitForEvent('download'), B.click('.sc-barbtn[data-act="save"]')]);
ok(dl4.suggestedFilename() === 'Corner shop.ccproject' && await B.evaluate(() => window.superWindow.project.revision) === 2, 'and it can save');

/* ---- the folder form: Data/lock.json in a real folder (the browser's own file system), seen by "another browser" (a lock with its own store) ---- */
const fl = await B.evaluate(async () => {
  const { createLock, folderStore } = window.superRegistry.LK;
  const root = await navigator.storage.getDirectory(); try { await root.removeEntry('regtest', { recursive: true }); } catch { /* none */ }
  const dir = await root.getDirectoryHandle('regtest', { create: true });
  const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }; };
  const one = createLock({ storage: mem(), session: 'browser-one-0001', name: 'Fay' }), two = createLock({ storage: mem(), session: 'browser-two-0002', name: 'Gus' });
  const a = await one.acquire('k', folderStore(dir));
  const file = JSON.parse(await (await (await (await dir.getDirectoryHandle('Data')).getFileHandle('lock.json')).getFile()).text());
  const b = await two.acquire('k', folderStore(dir));
  await one.release(); let gone = false; try { await (await dir.getDirectoryHandle('Data')).getFileHandle('lock.json'); } catch { gone = true; }
  const c = await two.takeOver(); await two.release(); await root.removeEntry('regtest', { recursive: true });
  return { a: a.mode, where: a.holder.where, file: [file.format, file.name, file.session], b: [b.mode, b.holder.name, b.holder.where], gone, c: c.mode };
});
ok(fl.a === 'writer' && fl.where === 'folder' && JSON.stringify(fl.file) === JSON.stringify(['supercadcraft-lock', 'Fay', 'browser-one-0001']), 'folder form: the writer leaves Data/lock.json in the project folder: ' + JSON.stringify(fl.file));
ok(JSON.stringify(fl.b) === JSON.stringify(['reader', 'Fay', 'folder']) && fl.gone && fl.c === 'writer', 'another browser opening that folder is a reader and knows who; when the writer lets go the file is removed and the lock can be taken: ' + JSON.stringify(fl));

/* ---- the docked layout loads with the registry too ---- */
const D = await open(url + (url.includes('?') ? '&' : '?') + 'workspace=docked');
ok(await D.evaluate(() => !!window.superRegistry && document.querySelector('[data-reg-banner]').hidden), 'the docked layout: the registry is there, no notice');
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
