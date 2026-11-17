// SPDX-License-Identifier: Apache-2.0
// Super 0.1, two fixes to SC.5 in a real browser with the real panels (FX.239, FX.240).
//   A. FX.239: the Parts view opens the project's part file with no page error, also when the file arrives before its solid kernel has loaded;
//   B. FX.240: a 2D drawing opened from a DXF. A pick in the drawing carries the name the project's object list knows the line by (the file's handle),
//      that name is a row of the list, and a ref in the list's spelling selects the line;
//   C. a link that names the line by the list's spelling takes a building pick to the drawing, and the drawing's pick to the building;
//   D. after the project takes the drawing back in (Check for changes), the same lines keep the same names and a line drawn since has one too.
// Nothing is posted anywhere: the page talks to the harness only.
//   node tools/super-test/picks-dxf.mjs
import fs from 'node:fs'; import path from 'node:path';
import { start, launch, ROOT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1600, height: 1000 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message) + ' @ ' + String(e.stack || '').split('\n').slice(1, 4).join(' < ').slice(0, 400)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(600);
await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(200);

const b64 = f => fs.readFileSync(path.join(ROOT, f)).toString('base64');
const members = [
  { app: 'cadcraft', name: 'kitchen.dxf', b64: b64('fixtures/cad/kitchen-count.dxf') },   // a DXF 2000: the project lists it from the file, by the file's handles
  { app: 'bimcraft', name: 'small-house.ifc', b64: b64('fixtures/bimcraft/small-house.ifc') },
  { app: 'partcraft', name: 'bracket.partcraft.json', b64: b64('fixtures/showcase/partcraft-enclosure.partcraft.json') },
];
await page.evaluate(async ([ms, n]) => {
  const P = window.superWindow.P, p = P.newProject(n); const un = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  for (const m of ms) P.addMember(p, { app: m.app, name: m.name, bytes: un(m.b64) });
  return window.superWindow.openProject(new File([P.zipStore(P.projectFiles(p, {}).files.map(f => ({ path: n + '/' + f.path, bytes: f.bytes })))], n + '.ccproject'));
}, [members, 'PicksDxf']);
const show = async id => { await page.evaluate(i => { const sw = window.superWindow; sw.M.showPanel(sw.state, i); sw.render(); }, id); await page.waitForTimeout(250); };
// the Parts view FIRST and at once: its file is handed over while its kernel is still loading (FX.239)
for (const id of ['part', 'cad', 'bim']) {
  await show(id);
  await page.waitForFunction(i => { const d = document.querySelector(`[data-panel="${i}"][data-mount]`)?.dataset.mount; return d === 'ready' || d === 'failed'; }, id, { timeout: 90000 }).catch(() => {});
}
const settle = async (ms = 350) => { await page.evaluate(() => window.superWindow.selWire.settled()); await page.waitForTimeout(ms); await page.evaluate(() => window.superWindow.selWire.settled()); };
const hub = () => page.evaluate(() => { const h = window.superWindow.hub; return { ...h.get(), related: h.related(), shown: h.shown() }; });

/* ---------------- A. the part file opens */
const partOpen = await page.waitForFunction(() => { try { return window.partcraft.part.features.length > 0 && !!window.partcraft.regen && window.partcraft.regen.results.size > 0; } catch { return false; } }, null, { timeout: 120000 }).then(() => true, () => false);
const part = await page.evaluate(() => { try { const p = window.partcraft; return { n: p.part.features.length, built: p.regen ? p.regen.results.size : -1, bad: p.regen ? [...p.regen.results.values()].filter(r => r.status === 'error').length : -1 }; } catch (e) { return { err: String(e) }; } });
ok(partOpen && part.n > 0 && part.built > 0, 'the Parts view opened the project\'s part and built it: ' + JSON.stringify(part));
ok(part.bad === 0, 'no feature of the part fails: ' + JSON.stringify(part));
ok(!errors.some(e => /openText|reading 'results'/.test(e)), 'opening the part raised no page error' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));

/* ---------------- B. a pick in the DXF drawing meets the project's object list */
await page.waitForFunction(() => { try { return window.cadcraft.doc.all().length > 10 && window.bimcraftColor.index(); } catch { return false; } }, null, { timeout: 120000 }).catch(() => {});
const proj = await page.evaluate(() => { const p = window.superWindow.project; return Object.fromEntries(p.members.map(m => [m.app, m.id])); });
await page.evaluate(() => window.superRegistry.index());
const rows = () => page.evaluate(() => { const R = window.superRegistry.REG, p = window.superWindow.project; return R.list(p, { app: 'cadcraft', kind: 'entity' }).map(o => o.native_id); });
const rows0 = await rows();
ok(rows0.length > 10 && rows0.every(r => r.startsWith(proj.cadcraft + ':')), 'the project lists the drawing\'s objects from the DXF, by handle: ' + rows0.length + ' rows, ' + rows0.slice(0, 3).join(' '));
const ents = await page.evaluate(() => window.cadcraft.doc.all().map(e => ({ id: e.id, type: e.type, handle: e.handle })));
const withH = ents.filter(e => typeof e.handle === 'string');
ok(withH.length === ents.length && ents.length > 10, 'every object of the open drawing carries the handle its file gave it: ' + withH.length + ' of ' + ents.length);
ok(withH.every(e => rows0.includes(proj.cadcraft + ':' + e.handle)), 'and each is a row of the project\'s list');
const lines = withH.filter(e => e.type === 'line' || e.type === 'poly' || e.type === 'circle').slice(0, 3);
await show('props'); await show('cad');
await page.evaluate(id => window.cadcraft.host.setSelection(new Set([id])), lines[0].id); await settle();
const h1 = await hub(); const native0 = proj.cadcraft + ':' + lines[0].handle;
ok(h1.source === 'cadcraft' && h1.refs.length === 1, 'an object picked in the drawing is the one selection: ' + JSON.stringify([h1.source, h1.refs]));
ok(h1.refs[0] && Array.isArray(h1.refs[0].aka) && h1.refs[0].aka.includes(native0), 'the pick carries the name the project\'s list knows it by: ' + JSON.stringify(h1.refs[0]));
const row0 = await page.evaluate(n => { const R = window.superRegistry.REG; const o = R.byNative(window.superWindow.project, 'cadcraft', n); return o ? { label: o.label, kind: o.kind } : null; }, native0);
ok(row0 && row0.kind === 'entity', 'that name is a row of the list: ' + JSON.stringify(row0));
await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await settle();
const applied = await page.evaluate(n => window.ccPickApply([{ app: 'cadcraft', id: n }]), proj.cadcraft + ':' + lines[1].handle); await settle();
const selNow = await page.evaluate(() => [...window.cadcraft.host.selection]);
ok(applied && selNow.length === 1 && selNow[0] === lines[1].id, 'a ref in the list\'s spelling selects that object in the drawing: ' + JSON.stringify([applied, selNow, lines[1].id]));
await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await settle();

/* ---------------- C. a link that names the line by the list's spelling is followed both ways */
const wall = await page.evaluate(() => { const ix = window.bimcraftColor.index(); for (const [id, g] of ix.values('guid')) { const c = ix.values('class').get ? ix.values('class').get(id) : null; if (!c || /wall/i.test(String(c))) return { key: String(ix.keyBase + id), guid: g }; } return null; });
ok(wall && wall.guid, 'the building has a wall to link: ' + JSON.stringify(wall));
await page.evaluate(([from, to]) => { const sw = window.superWindow; return sw.P.addLink(sw.project, { kind: 'object', role: 'depicts', from, to }).id; }, [{ app: 'cadcraft', id: native0 }, { app: 'bimcraft', id: wall.guid }]);
await page.evaluate(id => window.cadcraft.host.setSelection(new Set([id])), lines[0].id); await settle(600);
const h2 = await hub();
ok(h2.source === 'cadcraft' && h2.related.some(r => r.app === 'bimcraft'), 'the drawing\'s pick finds the wall it depicts: ' + JSON.stringify(h2.related).slice(0, 200));
ok(h2.shown.includes('bimcraft'), 'and the building view shows it: ' + JSON.stringify(h2.shown));
await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await settle();
const bimPick = await page.evaluate(k => { try { return window.bimcraftVis.pick([k]) !== false; } catch (e) { return String(e); } }, wall.key); await settle(600);
const h3 = await hub(); const selCad = await page.evaluate(() => [...window.cadcraft.host.selection]);
ok(h3.source === 'bimcraft', 'the wall picked in the building is the one selection: ' + JSON.stringify([bimPick, h3.source]));
ok(selCad.length === 1 && selCad[0] === lines[0].id, 'and the drawing selects the line that depicts it: ' + JSON.stringify(selCad));
await page.evaluate(() => { try { window.superWindow.hub.clear(); } catch { /* cleared below */ } window.cadcraft.host.setSelection(new Set()); }); await settle();

/* ---------------- D. after the project takes the drawing back in, the names are the same; a new line has one */
const fresh = await page.evaluate(() => { const d = window.cadcraft.doc; let e; d.change('line', () => { e = d.add({ type: 'line', x1: 1, y1: 1, x2: 7, y2: 3 }); }); return { id: e.id, handle: e.handle === undefined ? null : e.handle }; });
ok(fresh.handle === null, 'a line drawn now has no name yet');
await page.evaluate(id => window.cadcraft.host.setSelection(new Set([id])), fresh.id); await settle();
const h4 = await hub();
ok(h4.refs.length === 1 && !(h4.refs[0].aka || []).some(a => rows0.includes(a)), 'and its pick is not taken for another object of the list: ' + JSON.stringify(h4.refs[0]));
await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await settle();
await page.evaluate(() => window.superRegistry.index()); await page.waitForTimeout(800);
const rows1 = await rows();
const after = await page.evaluate(() => window.cadcraft.doc.all().map(e => ({ id: e.id, handle: e.handle })));
const kept = lines.every(l => after.find(e => e.id === l.id)?.handle === l.handle);
ok(kept, 'the lines keep their names after the project took the drawing in');
// a sheet's viewports are the one thing a save still renames (the sheet is written anew): a stated limit of FX.240
const gone = rows0.filter(r => !rows1.includes(r));
const goneLabels = await page.evaluate(ns => { const R = window.superRegistry.REG, p = window.superWindow.project; return ns.map(n => { const o = R.byNative(p, 'cadcraft', n, { deleted: true }); return o ? String(o.label) : '?'; }); }, gone);
ok(goneLabels.every(l => /^VIEWPORT\b/.test(l)) && gone.length <= 4, 'every earlier row of a drawn object is still a row (nothing renamed): ' + gone.length + ' of ' + rows0.length + ' gone: ' + JSON.stringify(goneLabels));
const freshH = after.find(e => e.id === fresh.id)?.handle;
ok(typeof freshH === 'string' && rows1.includes(proj.cadcraft + ':' + freshH) && !rows0.includes(proj.cadcraft + ':' + freshH), 'the new line was told its name and is a new row: ' + freshH);
await page.evaluate(id => window.cadcraft.host.setSelection(new Set([id])), fresh.id); await settle();
const h5 = await hub();
ok(h5.refs[0] && (h5.refs[0].aka || []).includes(proj.cadcraft + ':' + freshH), 'its pick now carries that name: ' + JSON.stringify(h5.refs[0]));

ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 4).join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
