// SPDX-License-Identifier: Apache-2.0
// Super: the organized project folder (Data / Drawings / Documentation), the save log and the optional version history, in headless Chromium.
// The real folder API is exercised through the browser's origin-private file system (navigator.storage.getDirectory()): a genuine
// FileSystemDirectoryHandle with getDirectoryHandle / getFileHandle / createWritable / entries / getFile / removeEntry. The picker itself
// (showDirectoryPicker) needs a person's click and a chosen folder, so it is not driven here. Also the Settings switch and the buttons.
//   node tools/super-test/project-folder.mjs
import { start, launch } from './serve.mjs';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);

// the buttons: a folder save and an open-folder, only where the browser can write a folder
const bar = await page.$$eval('.sc-barbtn', b => b.map(x => x.dataset.act));
const canFolders = await page.evaluate(() => typeof window.showDirectoryPicker === 'function');
ok(bar.includes('save') && bar.includes('open'), 'the bar keeps Open and Save: ' + bar);
ok(canFolders === (bar.includes('save-folder') && bar.includes('open-folder')), 'Save as folder and Open folder show exactly where showDirectoryPicker exists (' + canFolders + ')');
// Settings › Version history: off by default, remembered with the project and as the default
const state0 = await page.evaluate(() => ({ on: window.superWindow.project.vh.on, box: !!document.querySelector('[data-sc-ver-on]'), checked: document.querySelector('[data-sc-ver-on]')?.checked, del: !!document.querySelector('[data-sc-ver-delete]'), size: document.querySelector('[data-sc-ver-size]')?.textContent }));
ok(state0.on === false && state0.box && state0.checked === false && state0.del, 'version history: the switch is in Settings and off by default: ' + JSON.stringify(state0));
ok(/folder/.test(state0.size || ''), 'the size line says it shows for a folder: ' + state0.size);
await page.evaluate(() => { const c = document.querySelector('[data-sc-ver-on]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); });
const state1 = await page.evaluate(() => ({ on: window.superWindow.project.vh.on, pref: localStorage.getItem('cc-super-versions'), inPrefs: window.superWindow.prefs ? true : true }));
ok(state1.on === true && state1.pref === 'on', 'turning it on sets the project and the default: ' + JSON.stringify(state1));
// a delete the person cancels removes nothing
const cancelled = await page.evaluate(async () => { window.confirm = () => false; const before = window.superWindow.project.vh.files.size; document.querySelector('[data-sc-ver-delete]').click(); await new Promise(r => setTimeout(r, 100)); return before === window.superWindow.project.vh.files.size; });
ok(cancelled, 'Delete version history asks first: a Cancel changes nothing');

// the real folder API (OPFS) against the module the page loaded
const r = await page.evaluate(async () => {
  const P = window.superWindow.P, enc = s => new TextEncoder().encode(s), dec = b => new TextDecoder().decode(b);
  const root = await navigator.storage.getDirectory(); try { await root.removeEntry('sctest', { recursive: true }); } catch { /* none */ }
  const parent = await root.getDirectoryHandle('sctest', { create: true });
  const D = (d, h = 10) => new Date(2026, 10, d, h, 0, 0);
  const p = P.newProject('Plant'); p.vh.on = true;
  P.addMember(p, { app: 'bimcraft', name: 'plant.ifc', bytes: enc('ifc-v1'), role: 'saved' }); P.addMember(p, { app: 'cadcraft', name: 'layout.dwg', bytes: enc('dwg-v1') });
  P.addMember(p, { app: 'markupcraft', name: 'notes.pdf', bytes: enc('pdf-v1') }); P.addMember(p, { app: 'bimcraft', name: 'issues.bcf', bytes: enc('bcf-v1') });
  const walk = async (d, pre = '') => { const out = []; for await (const [n, h] of d.entries()) out.push(...(h.kind === 'directory' ? await walk(h, pre + n + '/') : [pre + n])); return out.sort(); };
  const out = {};
  out.w1 = await P.writeFolder(p, parent, { now: D(1), build: 'dev', by: 'Pat Example' });
  P.addMember(p, { app: 'bimcraft', name: 'plant.ifc', bytes: enc('ifc-v2'), role: 'saved' });
  out.w2 = await P.writeFolder(p, parent, { now: D(1, 15) });
  P.addMember(p, { app: 'bimcraft', name: 'plant.ifc', bytes: enc('ifc-v3'), role: 'saved' });
  out.w3 = await P.writeFolder(p, parent, { now: D(2, 9) });
  const dir = await parent.getDirectoryHandle('Plant');
  out.tree = await walk(dir);
  const vf = await (await (await (await dir.getDirectoryHandle('version_history')).getDirectoryHandle('2026-11-02_090000')).getDirectoryHandle('Drawings')).getDirectoryHandle('3D');
  out.versionBytes = dec(new Uint8Array(await (await (await vf.getFileHandle('plant.ifc')).getFile()).arrayBuffer()));
  out.size = await P.folderVersionSize(dir);
  const back = await P.fromFolder(dir), backParent = await P.fromFolder(parent);
  out.back = { members: back.project.members.map(m => m.name), skipped: back.skipped, on: back.project.vh.on, hist: back.project.history.length, rev: back.project.revision, ifc: dec(back.project.members[0].bytes), same: backParent.project.name };
  // a stray file of the person's is never deleted; delete removes only version_history
  const mine = await (await (await dir.getDirectoryHandle('Documentation')).getFileHandle('mine.txt', { create: true })).createWritable(); await mine.write(enc('keep')); await mine.close();
  out.deleted = await P.deleteVersionHistory(p, dir);
  out.treeAfter = await walk(dir);
  out.sizeAfter = await P.folderVersionSize(dir);
  const again = await P.fromFolder(dir); out.openAfter = { members: again.project.members.length, skipped: again.skipped };
  P.addMember(again.project, { app: 'bimcraft', name: 'plant.ifc', bytes: enc('ifc-v4'), role: 'saved' });
  out.w4 = await P.writeFolder(again.project, parent, { now: D(3, 9) });
  out.deleteAgain = await P.deleteVersionHistory(again.project, dir); out.deleteMissing = await P.deleteVersionHistory(again.project, dir);
  await root.removeEntry('sctest', { recursive: true });
  return out;
});
ok(r.w1.count === 11 && r.w1.versions === 0 && r.w2.versions === 0, 'real handle: the first and a same-day save write the project and no version: ' + JSON.stringify([r.w1, r.w2]));
ok(r.w3.versions === 2 && r.w3.versionStamp === '2026-11-02_090000' && r.w3.versionError === false, 'real handle: the next day writes a timestamped version folder: ' + JSON.stringify(r.w3));
ok(JSON.stringify(r.tree.filter(k => !k.startsWith('version_history'))) === JSON.stringify(['Data/history.json', 'Data/issues.bcf', 'Data/links.json', 'Data/manifest.json', 'Data/registry/rows/sc_meta.json', 'Data/registry/rows/sc_object.json', 'Data/registry/rows/ver_change.json', 'Data/registry/rows/ver_revision.json', 'Documentation/notes.pdf', 'Drawings/2D/layout.dwg', 'Drawings/3D/plant.ifc']), 'real handle: the project folder holds Data (with the object registry, BK.50), Drawings/2D, Drawings/3D and Documentation: ' + r.tree.join(' '));
ok(JSON.stringify(r.tree.filter(k => k.startsWith('version_history'))) === JSON.stringify(['version_history/2026-11-02_090000/Drawings/2D/layout.dwg', 'version_history/2026-11-02_090000/Drawings/3D/plant.ifc']), 'real handle: version_history holds the previous Drawings tree only');
ok(r.versionBytes === 'ifc-v2', 'real handle: the version copy is the state before the save (' + r.versionBytes + ')');
ok(r.size === 'ifc-v2'.length + 'dwg-v1'.length, 'real handle: the size of version_history: ' + r.size);
ok(JSON.stringify(r.back.members) === JSON.stringify(['plant.ifc', 'layout.dwg', 'notes.pdf', 'issues.bcf']) && r.back.skipped.length === 0 && r.back.on === true && r.back.hist === 3 && r.back.rev === 3 && r.back.ifc === 'ifc-v3' && r.back.same === 'Plant', 'real handle: opening the folder (or the folder holding it) brings the project, the switch and the log back: ' + JSON.stringify(r.back));
ok(r.deleted === true && !r.treeAfter.some(k => k.startsWith('version_history')) && r.treeAfter.includes('Documentation/mine.txt') && r.treeAfter.includes('Data/manifest.json') && r.treeAfter.includes('Drawings/3D/plant.ifc'), 'real handle: delete removes version_history and nothing else: ' + r.treeAfter.join(' '));
ok(r.sizeAfter === null, 'real handle: no version_history, no size');
ok(r.openAfter.members === 4 && r.openAfter.skipped.length === 0, 'real handle: the project opens normally with version_history gone');
ok(r.w4.versionError === false && r.w4.versions === 2, 'real handle: and saves normally afterwards, starting a new version the next day: ' + JSON.stringify(r.w4));
ok(r.deleteAgain === true && r.deleteMissing === true, 'real handle: deleting what is already gone is fine');
// plugin data (Data/<PluginId>/…) through the real handle: carried untouched
const x = await page.evaluate(async () => {
  const P = window.superWindow.P, enc = s => new TextEncoder().encode(s), dec = b => new TextDecoder().decode(b);
  const root = await navigator.storage.getDirectory(); try { await root.removeEntry('sctest2', { recursive: true }); } catch { /* none */ }
  const parent = await root.getDirectoryHandle('sctest2', { create: true });
  const p = P.newProject('Ext'); P.addMember(p, { app: 'cadcraft', name: 'a.dwg', bytes: enc('dwg') });
  P.extSet(p, 'notes', 'n.json', enc('{"a":1}')); P.extSet(p, 'tasks', 'inbox/2026/w44.txt', enc('t1'));
  await P.writeFolder(p, parent, { now: new Date(2026, 10, 1) });
  const dir = await parent.getDirectoryHandle('Ext'), back = await P.fromFolder(dir);
  await P.writeFolder(back.project, parent, { now: new Date(2026, 10, 1, 12) });
  const again = await P.fromFolder(dir);
  const out = { notes: dec(P.extGet(again.project, 'notes', 'n.json')), tasks: dec(P.extGet(again.project, 'tasks', 'inbox/2026/w44.txt')), skipped: again.skipped.length, members: again.project.members.length };
  await root.removeEntry('sctest2', { recursive: true }); return out;
});
ok(x.notes === '{"a":1}' && x.tasks === 't1' && x.skipped === 0 && x.members === 1, 'real handle: plugin folders under Data/ are written, read back and carried through a second save: ' + JSON.stringify(x));
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
