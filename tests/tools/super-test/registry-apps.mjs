// SPDX-License-Identifier: Apache-2.0
// Super: the object registry against the REAL apps (BK.136, BK.138): a DWG opened in CadCraft is listed from the open app (no file reader lists a DWG), an entity is
// deleted, the delete is undone and redone in CadCraft, and each time the registry is asked again: the entity's row is a tombstone, comes back under the SAME id,
// and is a tombstone again. Then the sample house opened in BimCraft: its walls, doors and windows are in the registry after a save, each with its GlobalId.
//   node tools/super-test/registry-apps.mjs
import fs from 'node:fs'; import path from 'node:path';
import { start, launch, ROOT, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.evaluate(() => { try { localStorage.removeItem('cc-super-window'); } catch { /* none */ } }).catch(() => {});
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(600);
const give = file => page.setInputFiles('[data-sc-open-input]', path.join(ROOT, file));
const cad = fn => page.evaluate(fn0 => { const w = [window, ...[...document.querySelectorAll('iframe')].map(f => { try { return f.contentWindow; } catch { return null; } })].find(x => x && x.cadcraft); return new Function('cad', 'return (' + fn0 + ')(cad)')(w.cadcraft); }, String(fn));
const reg = fn => page.evaluate(fn0 => new Function('R', 'p', 'return (' + fn0 + ')(R, p)')(window.superRegistry.REG, window.superWindow.project), String(fn));

/* ---- drawing: a DWG, listed from the open CadCraft. The files come in as a project (each member goes to its own app, as Open project does) ---- */
const b64 = f => fs.readFileSync(path.join(ROOT, f)).toString('base64');
const openAs = (members, name) => page.evaluate(async ([ms, n]) => {
  const P = window.superWindow.P, p = P.newProject(n); const un = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  for (const m of ms) P.addMember(p, { app: m.app, name: m.name, bytes: un(m.b64) });
  // built without the registry's save (as an older project): the registry starts when this window first reads it
  return window.superWindow.openProject(new File([P.zipStore(P.projectFiles(p, {}).files.filter(f => !f.path.startsWith('Data/registry/')).map(f => ({ path: n + '/' + f.path, bytes: f.bytes })))], n + '.ccproject'));
}, [members, name]);
await openAs([{ app: 'cadcraft', name: 'cadcraft-sample-house.dwg', b64: b64('fixtures/showcase/cadcraft-sample-house.dwg') }, { app: 'bimcraft', name: 'bimcraft-house.ifc', b64: b64('fixtures/showcase/bimcraft-house.ifc') }], 'House');
await page.waitForFunction(() => [window, ...[...document.querySelectorAll('iframe')].map(f => { try { return f.contentWindow; } catch { return null; } })].some(x => x && x.cadcraft && x.cadcraft.doc && x.cadcraft.doc.all().length > 20), null, { timeout: 90000 }); await page.waitForTimeout(1500);
const n0 = await cad(c => c.doc.all().length);
ok(n0 > 20, 'CadCraft has the drawing open: ' + n0 + ' entities');
const r0 = await page.evaluate(() => window.superRegistry.index());
const s0 = await reg((R, p) => ({ ents: R.list(p, { app: 'cadcraft', kind: 'entity' }).length, docs: R.list(p, { app: 'cadcraft', kind: 'document' }).map(o => o.label), members: p.members.filter(m => m.app === 'cadcraft').map(m => m.name), partial: R.stats(p).partial }));
ok(r0 && s0.ents === n0, `Check for changes lists every entity of the open drawing (${s0.ents} of ${n0}) from the app, the file being a ${s0.members.join(', ')}`);
ok(s0.docs.length >= 1 && Object.keys(s0.partial).length === 0, 'the file has its own entry and nothing is reported as not listed: ' + JSON.stringify(s0.partial));
// delete one entity in CadCraft
const victim = await cad(c => { const e = c.doc.all().find(x => x.type === 'line') || c.doc.all()[0]; const h = typeof e.handle === 'string' && /^[0-9A-Fa-f]{1,16}$/.test(e.handle) ? e.handle.toUpperCase() : e.id.toString(16).toUpperCase(); c.doc.change('test delete', () => c.doc.remove(e.id)); return h; });
const mid = await reg((R, p) => p.members.find(m => m.app === 'cadcraft' && /\.dwg$/i.test(m.name)).id);
const key = `${mid}:${victim}`;
const before = await page.evaluate(k => { const o = window.superRegistry.REG.byNative(window.superWindow.project, 'cadcraft', k); return o && o.id; }, key);
ok(!!before, 'the entity to delete has a registry entry: ' + key + ' = ' + before);
await page.evaluate(() => window.superRegistry.index());
const d1 = await page.evaluate(k => { const R = window.superRegistry.REG, p = window.superWindow.project, dead = R.byNative(p, 'cadcraft', k, { deleted: true }); return { live: R.byNative(p, 'cadcraft', k), id: dead && dead.id, del: dead && dead.deleted_rev, ents: R.list(p, { app: 'cadcraft', kind: 'entity' }).length, pend: R.pending(p).counts.cadcraft }; }, key);
ok(d1.live === null && d1.id === before && d1.del !== null && d1.ents === n0 - 1, 'deleted in CadCraft: the row stays as a tombstone with the same id: ' + JSON.stringify(d1));
// undo in CadCraft: the same id is alive again
await cad(c => c.doc.undo()); await page.evaluate(() => window.superRegistry.index());
const d2 = await page.evaluate(k => { const R = window.superRegistry.REG, p = window.superWindow.project, o = R.byNative(p, 'cadcraft', k); return { id: o && o.id, del: o && o.deleted_rev, ents: R.list(p, { app: 'cadcraft', kind: 'entity' }).length, next: R.stats(p).nextId }; }, key);
ok(d2.id === before && d2.del === null && d2.ents === n0, 'undo: the entity is back under its old id: ' + JSON.stringify(d2));
// redo: deleted again, still the same row; no id was handed out in between
await cad(c => c.doc.redo()); await page.evaluate(() => window.superRegistry.index());
const d3 = await page.evaluate(k => { const R = window.superRegistry.REG, p = window.superWindow.project, dead = R.byNative(p, 'cadcraft', k, { deleted: true }); return { live: R.byNative(p, 'cadcraft', k), id: dead && dead.id, next: R.stats(p).nextId, all: R.list(p, { deleted: 'all' }).map(o => o.id) }; }, key);
ok(d3.live === null && d3.id === before && d3.next === d2.next && new Set(d3.all).size === d3.all.length, 'redo: a tombstone again, the same id; undo and redo used no new id (next is still ' + d3.next + ')');

/* ---- model: the sample house in BimCraft, then a real Save ---- */
await page.waitForTimeout(2000);
await page.evaluate(() => window.superWindow.home && window.superWindow.home.leave());
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), page.click('.sc-barbtn[data-act="save"]')]); await dl.path();
const m = await reg((R, p) => { const c = k => R.list(p, { app: 'bimcraft', kind: k }).length; const w = R.list(p, { app: 'bimcraft', kind: 'wall' })[0]; return { rev: R.currentRevision(p), walls: c('wall'), doors: c('door'), windows: c('window'), guid: w && w.ifc_guid === w.native_id && w.ifc_guid.length === 22, same: w && R.byIfcGuid(p, w.ifc_guid)[0].id === w.id, counts: R.revisions(p).at(-1).counts, files: p.members.map(x => x.app + ':' + x.name) }; });
ok(m.rev === 2 && m.walls === 13 && m.doors === 7 && m.windows === 9, 'after Save (revision 2) the model is in the registry: 13 walls, 7 doors, 9 windows: ' + JSON.stringify([m.rev, m.walls, m.doors, m.windows, m.files]));
ok(m.guid && m.same, 'each with its IFC GlobalId, and found by it');
ok(m.counts.cadcraft && m.counts.cadcraft.added === n0 && m.counts.bimcraft && m.counts.bimcraft.added > 30, 'the revision row counts what each app added: ' + JSON.stringify(m.counts));
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(200); await page.click('.sc-hnav [data-hvpage="history:history"]'); await page.waitForSelector('[data-home-view="page"]:not([hidden]) [data-reg-rev="2"]');
await page.screenshot({ path: `${OUT}/registry-apps-history.png` });
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
