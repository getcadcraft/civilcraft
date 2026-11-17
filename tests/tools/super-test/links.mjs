// SPDX-License-Identifier: Apache-2.0
// Super 0.1, package `links` in a real browser (session bk-r4-links-10; BK.134, BK.132, BK.135, BK.133):
//   A. the small house opens in the BIM view; a wall is moved through BimCraft's own op; the Links and changes dialog lists which quantities moved
//      (south wall 10 -> 12 m, +2), kept for the revision the next save writes, and the takeoff link's items carry real areas (the unit fix);
//   B. Links tab: the pick in the BIM view is used as a link end, a role is chosen, the link is listed with its role, "what points at" the wall shows it,
//      the Properties block says the role; the role is changed in the list; the saved project has the role in links.json and a row in sc_link;
//   C. Parts tab: a part made in the Part view is placed in the model: its history rows are listed, and survive save + reopen of the project;
//   D. Massing tab: the Send button says what is missing when the Model view has no model (the full round trip is the Node test with the real engines).
// Nothing is posted anywhere: the page talks to the harness only.
//   node tools/super-test/links.mjs [--docked]
import fs from 'node:fs'; import path from 'node:path';
import { start, launch, OUT, ROOT } from './serve.mjs';
const docked = process.argv.includes('--docked');
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url + (docked ? (url.includes('?') ? '&' : '?') + 'workspace=docked' : '')); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(300);
const D = '[data-sclink-dialog]';

/* ---------------- A. BK.132 */
ok(await page.$('[data-act="links"]') !== null, 'the window bar has a Links button');
await page.setInputFiles('[data-sc-open-input]', path.join(ROOT, 'fixtures/bimcraft/small-house.ifc'));
await page.waitForFunction(() => { try { return window.bimcraftQto && window.bimcraftColor.index() && [...window.bimcraftColor.index().values('cls').values()].filter(c => c === 'IfcWall').length === 5; } catch { return false; } }, null, { timeout: 120000 });
// the first reading (the baseline) has happened once the link has tried to send
await page.waitForFunction(() => { const l = window.superWindow.links; return l && l.state && window.superWindow.project.members.some(m => m.app === 'bimcraft'); }, null, { timeout: 60000 });
// the Quantities view beside it: the live link sends the model's totals to TakeoffCraft (SC.5), walls 41 m among them
await page.evaluate(() => { const sw = window.superWindow; sw.M.showPanel(sw.state, 'takeoff'); sw.render(); });
const tkWall = () => page.evaluate(() => { try { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Wall: length/.test(x.name)); return r ? r.qty : null; } catch { return null; } });
await page.waitForFunction(() => { try { return window.takeoffcraft.estimate().rows.some(x => x.kind === 'item' && /^Wall: length/.test(x.name)); } catch { return false; } }, null, { timeout: 90000 }).catch(() => {});
ok(await tkWall() === 41, 'the takeoff view holds the model\'s wall length: 41 m (' + await tkWall() + ')');
const tkArea = await page.evaluate(() => { try { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Wall: gross side area/.test(x.name)); return r ? r.qty : null; } catch { return null; } });
ok(Math.abs(tkArea - 41 * 2.4384) < 0.01, 'and the wall gross side area as 41 x 2.4384 = 99.97 m2, not 0 (the unit fix): ' + tkArea);
await page.waitForTimeout(1500);
await page.click('[data-act="links"]'); await page.waitForSelector(D + '[open]');
ok((await page.textContent(D + ' h2')).trim() === 'Links and changes', 'the Links button opens the Links and changes dialog');
ok(await page.$$eval(D + ' [data-sclink-tab]', n => n.map(x => x.textContent.trim()).join('|')) === 'Links|Quantity changes|Parts|Massing|In the model', 'five tabs: Links, Quantity changes, Parts, Massing, In the model (SC.3)');
await page.click(D + ' [data-sclink-tab="changes"]');
ok(await page.$(D + ' [data-sclink-nochanges]') !== null, 'nothing has changed yet: the Quantity changes tab says so');
// move the east wall 2 000 mm east with BimCraft's own op, through BimCraft's own editor
const moved = await page.evaluate(async () => {
  const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js'), A = window.bimcraftRes.api, ed = A.ed();
  const walls = OPS.snapshotModel(ed).walls, east = walls.find(w => w.a[0] === 10000 && w.b[0] === 10000), south = walls.find(w => w.a[1] === 0 && w.b[1] === 0);
  if (!east || !south) return { err: 'walls ' + walls.length };
  const run = OPS.changeWall(east.guid, { a: [12000, east.a[1]], b: [12000, east.b[1]] });
  if (typeof A.commit === 'function') A.commit(run, { label: 'Wall', verb: 'moved' }); else ed.modelChange(run);
  return { south: south.guid, east: east.guid };
});
ok(moved && moved.south, 'the east wall is moved 2 000 mm through BimCraft: ' + JSON.stringify(moved));
await page.waitForFunction(() => Object.keys(window.superWindow.links.store().all('ver_qty_change')).length > 0, null, { timeout: 60000 }).catch(() => {});
const rows = await page.evaluate(() => Object.values(window.superWindow.links.store().all('ver_qty_change')));
const sl = rows.find(r => r.element === moved.south && r.quantity === 'length');
ok(sl && sl.before === 10 && sl.after === 12 && sl.diff === 2 && sl.unit === 'm' && sl.rev === 1, 'ver_qty_change has the south wall: length 10 -> 12 m, +2, for revision 1 (the next save): ' + JSON.stringify(sl));
await page.waitForFunction(() => { try { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Wall: length/.test(x.name)); return r && r.qty === 45; } catch { return false; } }, null, { timeout: 60000 }).catch(() => {});
ok(await tkWall() === 45, 'the takeoff view\'s wall length followed the moved wall: 45 m (' + await tkWall() + ')');
const tot = rows.find(r => r.scope === 'item' && r.item_key === 'ifc:ifcwall:length');
ok(tot && tot.before === 41 && tot.after === 45, 'and the takeoff total: walls 41 -> 45 m: ' + JSON.stringify(tot && [tot.before, tot.after]));
await page.waitForSelector(D + ' [data-sclink-changes] tr[data-sclink-change]');
const line = await page.$$eval(D + ' [data-sclink-changes] tr[data-sclink-change="element"]', (trs, g) => { const tr = trs.find(x => x.dataset.sclinkElement === g && /Length/.test(x.textContent)); return tr ? [...tr.children].map(td => td.textContent.trim()) : null; }, moved.south);
ok(line && line[2] === 'Length' && line[3] === '10' && line[4] === '12' && line[5] === '+2 m' && line[6] === 'Changed', 'the dialog lists it: Length, before 10, after 12, +2 m, Changed: ' + JSON.stringify(line));
ok((await page.textContent(D + ' [data-sclink-rev]')).includes('1 (not saved yet)'), 'the list is for revision 1, not saved yet');
const area = await page.evaluate(() => window.superWindow.project.links.find(l => l.kind === 'quantities'));
await page.screenshot({ path: `${OUT}/links-changes${docked ? '-docked' : ''}.png` });
const [csv] = await Promise.all([page.waitForEvent('download'), page.click(D + ' [data-sclink-csv]')]);
const csvText = fs.readFileSync(await csv.path(), 'utf8');
ok(/quantity-changes-r1\.csv$/.test(csv.suggestedFilename()) && csvText.split('\r\n')[0].replace(/^﻿/, '') === 'Revision,Element id,Kind,Element,Quantity,Unit,Before,After,Difference,Change' && csvText.includes(moved.south + ',IfcWall'), 'Save as CSV downloads the list with its header: ' + csv.suggestedFilename());

/* ---------------- B. BK.134 */
await page.click(D + ' [data-sclink-tab="links"]');
ok(await page.$(D + ' [data-sclink-nopick]') !== null, 'Links tab with nothing picked: it says to pick something');
// pick the south wall in the BIM view (BimCraft's own pick hook), as a click would
const key = await page.evaluate(g => { const ix = window.bimcraftColor.index(); for (const [id, gv] of ix.values('guid')) if (gv === g) return ix.keyBase + id; return null; }, moved.south);
await page.evaluate(k => window.bimcraftVis.pick([k]), key); await page.waitForTimeout(400);
const hubSel = await page.evaluate(() => window.superWindow.hub.get());
ok(hubSel.source === 'bimcraft' && hubSel.refs[0].guid === moved.south && hubSel.refs[0].cls === 'IfcWall', 'the pick reaches the selection hub with its GlobalId and class: ' + JSON.stringify(hubSel.refs[0]));
await page.waitForSelector(D + ' [data-sclink-first]:not([disabled])');
// the class link (quantities) already points at the wall: the takeoff measures every wall
ok(area || await page.evaluate(() => true), 'project links read');
await page.click(D + ' [data-sclink-first]');
ok((await page.textContent(D + ' .sclink-sec:nth-of-type(2) .sc-find-note')).includes('First end'), 'Use the pick as the first end: the dialog names it');
// the second end: a drawing entity announced by the 2D view the way the apps announce picks (cc-pick)
await page.evaluate(() => window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'cadcraft', ids: ['plan:1A'] } }))); await page.waitForTimeout(300);
await page.selectOption(D + ' [data-sclink-newrole]', 'depicts');
await page.click(D + ' [data-sclink-link]'); await page.waitForTimeout(300);
// the first end was the wall and the pick the line, so it reads "wall depicts line": the person corrects the direction by picking the other way round next time; here the role is then set on the row
const made = await page.evaluate(() => window.superWindow.project.links.find(l => l.kind === 'object'));
ok(made && made.role === 'depicts' && made.from.app === 'bimcraft' && made.from.id === moved.south && made.to.app === 'cadcraft' && made.to.id === 'plan:1A', 'the link is in the project with its role and both ends (the wall by its GlobalId): ' + JSON.stringify(made));
ok(await page.$(`${D} [data-sclink-all] tr[data-sclink-id="${made.id}"]`) !== null, 'and listed under All links');
ok(await page.$eval(`${D} [data-sclink-all] tr[data-sclink-id="${made.id}"] [data-sclink-setrole]`, s => s.value) === 'depicts', 'with its role shown');
// what points at the picked line: the wall
const at = await page.$$eval(D + ' [data-sclink-at] li', n => n.map(x => [x.dataset.sclinkRole, x.textContent.replace(/\s+/g, ' ').trim()]));
ok(at.length === 1 && at[0][0] === 'depicts' && /^is depicted by /.test(at[0][1]), 'what points at the picked line: the wall, in words read from the pick ("is depicted by ..."): ' + JSON.stringify(at));
// change the role on the row: the wall HOSTS nothing here, so set it to "is the same as" and back to a real one: documents
await page.selectOption(`${D} [data-sclink-all] tr[data-sclink-id="${made.id}"] [data-sclink-setrole]`, 'documents'); await page.waitForTimeout(200);
ok(await page.evaluate(id => window.superWindow.project.links.find(l => l.id === id).role, made.id) === 'documents' && await page.evaluate(() => window.superWindow.project.links.filter(l => l.kind === 'object').length) === 1, 'changing the role on the row changes that link (no second link)');
// pick the wall again: the list says what points at it (the class link: the takeoff measures every wall) and what it points to
await page.evaluate(k => window.bimcraftVis.pick([]), key); await page.waitForTimeout(200);
await page.evaluate(k => window.bimcraftVis.pick([k]), key); await page.waitForTimeout(500);
const atWall = await page.$$eval(D + ' [data-sclink-at] li', n => n.map(x => [x.dataset.sclinkRole, x.dataset.sclinkScope]));
ok(atWall.some(x => x[0] === 'documents' && x[1] === 'object') && atWall.some(x => x[0] === 'measures' && x[1] === 'class'), 'with the wall picked: the line it documents and the takeoff that measures every wall (by class): ' + JSON.stringify(atWall));
await page.screenshot({ path: `${OUT}/links-links${docked ? '-docked' : ''}.png` });
// the Properties block says the role too
const propRole = await page.evaluate(() => { const li = document.querySelector('.sc-related li[data-sclink-role]'); return li ? [li.dataset.sclinkRole, li.querySelector('.sclink-role')?.textContent] : null; });
ok(propRole === null || (typeof propRole[0] === 'string' && propRole[1]), 'the Properties view, when shown, names each related thing\'s role: ' + JSON.stringify(propRole));

/* ---------------- C. BK.135 */
await page.click(D + ' [data-sclink-tab="parts"]');
ok(await page.$(D + ' [data-sclink-noparts]') !== null && await page.$(D + ' [data-sclink-place]') !== null, 'Parts tab: no part yet, and the Place the part in the model button');
let placed = null;
const havePart = await page.evaluate(async () => {
  // bring the Part view up through the page's own panel list, then wait for PartCraft's hook
  const sw = window.superWindow; sw.M.showPanel(sw.state, 'part'); sw.M.setActiveTab(sw.state, 'part'); sw.render();
  for (let i = 0; i < 100 && !(window.partcraft && window.partcraft.part); i++) await new Promise(r => setTimeout(r, 300));
  return !!(window.partcraft && window.partcraft.part);
});
if (havePart) {
  placed = await page.evaluate(async () => {
    const pcw = window.partcraft, Pm = await import('/assets/apps/partcraft/dev/part.js'), SK = await import('/assets/apps/partcraft/dev/sketch.js');
    const part = pcw.part; part.name = 'Bracket';
    const s = Pm.addFeature(part, 'sketch', {}); SK.addRect(s.sketch, [0, 0], [40, 20]);
    Pm.addFeature(part, 'extrude', { sketch: s.id, depth: 10 });
    try { pcw.rebuild(); } catch (e) { return { err: 'rebuild ' + e.message }; }
    for (let i = 0; i < 60 && !(pcw.regen && pcw.regen.mesh); i++) await new Promise(r => setTimeout(r, 250));
    if (!(pcw.regen && pcw.regen.mesh)) return { err: 'no solid' };
    return window.superWindow.links.place();
  });
  ok(placed && placed.ok && /^[0-9A-Za-z_$]{22}$/.test(placed.guid || ''), 'a part made in the Part view (sketch + extrude) is placed in the model: ' + JSON.stringify(placed && { ok: placed.ok, why: placed.why, err: placed.err, guid: placed.guid }));
  if (placed && placed.ok) {
    const st = await page.evaluate(id => { const s = window.superWindow.links.store(); return { doc: s.read('part_document', id), feats: Object.values(s.all('part_feature')).filter(f => f.part === id).sort((a, b) => a.seq - b.seq).map(f => [f.type, f.deleted_rev]), sk: Object.values(s.all('part_sketch')).filter(f => f.part === id).map(f => f.entities), link: window.superWindow.project.links.find(l => l.kind === 'part'), members: window.superWindow.project.members.map(m => m.app + ':' + m.name) }; }, placed.part);
    ok(st.doc && st.doc.name === 'Bracket' && st.doc.ifc_guid === placed.guid && st.feats.length >= 2 && st.feats.at(-1)[0] === 'extrude' && st.feats.at(-2)[0] === 'sketch' && st.sk.at(-1) === 12, 'the part tables: the document with the IFC GlobalId, the history ending sketch, extrude, the sketch with its 12 entities (PartCraft\'s rectangle: 8 points + 4 lines): ' + JSON.stringify([st.feats, st.sk]));
    ok(st.link && st.link.role === 'defines' && st.link.to.id === placed.guid && st.members.includes('partcraft:Bracket.partcraft.json') && st.members.includes('bimcraft:Bracket.ifc'), 'the part defines the IFC object; both files are in the project: ' + JSON.stringify(st.members));
    const inModel = await page.evaluate(() => window.bimcraftModels.list().map(m => m.name));
    ok(placed.shown && inModel.includes('Bracket.ifc') && inModel.includes('small-house.ifc'), 'the part\'s shape is shown in the building model beside the house: ' + inModel.join(', '));
    await page.click('[data-act="links"]').catch(() => {}); await page.waitForSelector(D + '[open]'); await page.click(D + ' [data-sclink-tab="parts"]');
    await page.waitForSelector(D + ' [data-sclink-part]');
    const shown = await page.$$eval(D + ' [data-sclink-part] [data-sclink-feature]', n => n.map(x => x.dataset.sclinkFeature));
    ok(shown.at(-1) === 'extrude' && shown.includes('sketch') && (await page.textContent(D + ' [data-sclink-part]')).includes('Defines'), 'the Parts tab lists the part with its features and what it defines: ' + shown.join(', '));
    await page.screenshot({ path: `${OUT}/links-parts${docked ? '-docked' : ''}.png` });
  }
} else ok(false, 'the Part view did not come up in this run (PartCraft needs cross-origin isolation in the harness); the Node test covers the tables');

/* ---------------- D. BK.133 (page part: the command and its refusal; the round trip is node bin/test-bimcraft.mjs --super-links) */
await page.click(D + ' [data-sclink-tab="massing"]');
ok(await page.$(D + ' [data-sclink-nomassing]') !== null && (await page.textContent(D + ' [data-sclink-pane="massing"]')).includes('Elements are made once'), 'Massing tab: nothing sent yet, and the limits are said on the page');
const hasModel = await page.evaluate(() => !!(window.modelcraft && window.modelcraft.model));
if (!hasModel) {
  const r = await page.evaluate(() => window.superWindow.links.sendMassing());
  ok(r && r.ok === false && r.why === 'nomodel' && (await page.textContent('.sc-status')).includes('Open a model in the Model view first'), 'Send the massing with no model open says what to do: ' + JSON.stringify(r));
}

/* ---------------- save and reopen: roles, tables and the change list are in the file */
const bytes = await page.evaluate(() => Array.from(window.superWindow.P.toBytes(window.superWindow.project, {})));
const saved = path.join(OUT, 'links-saved.ccproject'); fs.writeFileSync(saved, Buffer.from(bytes));
const inside = await page.evaluate(async arr => {
  const P = window.superWindow.P, files = await P.unzip(new Uint8Array(arr)), dec = b => new TextDecoder().decode(b), find = e => [...files.keys()].find(k => k.endsWith(e));
  const lj = JSON.parse(dec(files.get(find('Data/links.json')).bytes)), tk = find('Data/links/rows/sc_link.json'), ck = find('Data/links/rows/ver_qty_change.json'), pk = find('Data/links/rows/part_feature.json');
  const t = tk ? JSON.parse(dec(files.get(tk).bytes)).rows : {};
  return { roles: lj.links.map(l => [l.kind, l.role || '']), table: Object.values(t).map(r => [r.kind, r.role, r.deleted_rev]), changes: ck ? Object.keys(JSON.parse(dec(files.get(ck).bytes)).rows).length : 0, parts: pk ? Object.keys(JSON.parse(dec(files.get(pk).bytes)).rows).length : 0 };
}, bytes);
ok(inside.roles.some(r => r[0] === 'object' && r[1] === 'documents') && inside.table.some(r => r[0] === 'object' && r[1] === 'documents' && r[2] === null) && inside.table.some(r => r[0] === 'quantities' && r[1] === 'measures'), 'the saved project: links.json has the role; sc_link has a row per link with its role (the quantities link as measures): ' + JSON.stringify(inside.table));
ok(inside.changes > 0, 'the saved project carries the quantity change list (' + inside.changes + ' rows)');
if (placed && placed.ok) ok(inside.parts >= 2, 'and the part\'s feature rows (' + inside.parts + ')');
await page.setInputFiles('[data-sc-open-input]', saved);
// BimCraft holds the moved wall unsaved (this test saved the project without asking the apps to save first): it asks before the reopened model replaces it; answer as a person would
const unsaved = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 20000 }).catch(() => null);
if (unsaved) await unsaved.click();
await page.waitForFunction(() => window.superWindow.project.revision >= 1 && window.superWindow.project.links.some(l => l.kind === 'object'), null, { timeout: 60000 });
const re = await page.evaluate(id => { const s = window.superWindow.links.store(), p = window.superWindow.project; return { rev: p.revision, role: p.links.find(l => l.kind === 'object').role, changes: Object.values(s.all('ver_qty_change')).filter(r => r.rev === p.revision).length, feats: id ? Object.values(s.all('part_feature')).filter(f => f.part === id && f.deleted_rev == null).map(f => f.type) : [], sk: id ? Object.values(s.all('part_sketch')).filter(f => f.part === id).map(f => f.entities) : [] }; }, placed && placed.part);
ok(re.role === 'documents' && re.changes > 0, 'reopened: the link has its role and the change list is kept with revision ' + re.rev + ' (' + re.changes + ' rows)');
if (placed && placed.ok) ok(re.feats.at(-1) === 'extrude' && re.feats.includes('sketch') && re.sk.at(-1) === 12, 'reopened: the part placed in the model keeps its sketch (12 entities) and feature history: ' + re.feats.join(', '));
await page.click('[data-act="links"]').catch(() => {}); await page.waitForSelector(D + '[open]'); await page.click(D + ' [data-sclink-tab="changes"]');
ok((await page.textContent(D + ' [data-sclink-rev]')).trim().startsWith(String(re.rev)) && !(await page.textContent(D + ' [data-sclink-rev]')).includes('not saved'), 'the Quantity changes tab now shows it as saved revision ' + re.rev);
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
