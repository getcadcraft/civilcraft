// SPDX-License-Identifier: Apache-2.0
// Super 0.1, rows SC.3 (one project file) and SC.5's live links (session sc-r5-project), in a real browser with the eight real apps:
//   A. ONE PROJECT, EIGHT KINDS. A drawing (DWG, CadCraft), the IFC model (BimCraft), a 3D model (ModelCraft), a PDF sheet (MarkupCraft), a site surface
//      (CivilCraft), steel (DetailCraft) are opened from a project file of the current format; the takeoff (TakeoffCraft) fills from the model; a part is made in
//      PartCraft. The links are made in the Links window's "In the model" tab: the site under the building, the steel in the model, the part placed twice.
//      Then the window's own Save: each app's own Save is collected into ONE .ccproject (nothing is downloaded loose).
//   B. THE FILE. The saved project holds all eight, each in the app's own file format, in the Data / Drawings / Documentation tree, with the links and the
//      placement table. Each member, taken out of the project, opens in its own SINGLE app (the app's own page, its own file input).
//   C. REOPEN (a fresh window): every app has its document again, the registry lists objects of all eight, the links and placements are back and the building
//      view shows the site, the steel and both parts where they were put.
//   D. LIVE LINKS in the real views: a steel member changed in DetailCraft, a ground point changed in CivilCraft, the part changed in PartCraft, a wall moved in
//      BimCraft: the other view follows without anything being imported again. A placement is moved and one is taken out.
//   E. FOLDER FORM and OLDER FILES: the same project written as a folder (the browser's own file system), its files read straight from the folder, the folder
//      opened in a fresh window; a version 1 project file still opens.
// Nothing is posted anywhere: the page talks to the harness only.
//   node tools/super-test/project-eight.mjs [--shots]
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { start, launch, OUT, ROOT } from './serve.mjs';
const SUP = path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev');
const P = await import(pathToFileURL(path.join(SUP, 'super-project.js'))), OPEN = await import(pathToFileURL(path.join(SUP, 'super-open.js'))), PL = await import(pathToFileURL(path.join(SUP, 'super-place.js')));
const shots = process.argv.includes('--shots');
const TMP = path.join(ROOT, 'tmp/sc-r5-project-eight'); fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
// The harness keeps the pages it renders in tmp/super-test and every run clears them when it starts: another session's run, started while this one is going,
// can take a file away between "it is there" and "send it". That request is then lost (the page is asked again below), not the whole run.
process.on('uncaughtException', e => { if (e && e.code === 'ENOENT' && /tmp\/super-test\/render-/.test(String(e.path))) { console.log('note: another run cleared the harness cache (' + path.basename(String(e.path)) + '); the page is asked again'); return; } console.error(e); process.exit(1); });
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1500, height: 950 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; if (process.argv.includes('--verbose')) console.log('  ok  ', m); } else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, acceptDownloads: true });
const errors = [];
const watchErrors = pg => pg.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message).slice(0, 300)); });
const superPage = async () => {
  for (let attempt = 1; ; attempt++) {
    const pg = await ctx.newPage(); watchErrors(pg);
    try {
      await pg.goto(url, { timeout: 60000 }); await pg.waitForSelector('[data-sc-ready]', { timeout: 60000 }); await pg.evaluate(() => window.superWindow.ready); await pg.waitForTimeout(600);
      await pg.evaluate(() => window.superWindow.home.leave()); await pg.waitForTimeout(200);
      return pg;
    } catch (e) { await pg.close().catch(() => {}); if (attempt >= 3) throw e; }
  }
};
const enc = s => new TextEncoder().encode(s), dec = b => new TextDecoder().decode(b);
const fx = f => new Uint8Array(fs.readFileSync(path.join(ROOT, f)));
const D = '[data-sclink-dialog]', PANE = D + ' [data-sclink-pane="model"]';
const status = pg => pg.evaluate(() => (document.querySelector('.sc-status')?.textContent || ''));

/* ---- the files that go in. The site is made by hand so its ground can be worked out: a plane z = 100 + 0.1 E + 0.05 N on a 10 m grid over 0..40 × 0..40 (metres);
        the middle (20, 20) is 100 + 2 + 1 = 103, point 13 of 25. ---- */
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/formats/civilcraft/v1-site.json'), 'utf8'));
site.name = 'Hill lot'; site.units = 'm'; site.points = []; { let n = 1; for (let x = 0; x <= 40; x += 10) for (let y = 0; y <= 40; y += 10) site.points.push([String(n++), x, y, 100 + 0.1 * x + 0.05 * y, 'GRD']); }
const SEED = [
  { app: 'cadcraft', name: 'plan.dwg', bytes: fx('fixtures/showcase/cadcraft-sample-house.dwg') },
  { app: 'bimcraft', name: 'house.ifc', bytes: fx('fixtures/bimcraft/small-house.ifc') },
  { app: 'modelcraft', name: 'massing.modelcraft', bytes: fx('fixtures/showcase/modelcraft-house.modelcraft') },
  { app: 'markupcraft', name: 'sheet.pdf', bytes: fx('fixtures/pdf/kitchen-plan-sheet.pdf') },
  { app: 'civilcraft', name: 'site.civilcraft.json', bytes: enc(JSON.stringify(site)) },
  { app: 'detailcraft', name: 'frame.detailcraft.json', bytes: fx('fixtures/showcase/detailcraft-frame-live-load.detailcraft.json') },
];
// a project of the CURRENT format as an earlier build wrote it: no registry tables, no placement table (they start at this window's first save)
const seedProject = P.newProject('Eight'); for (const m of SEED) P.addMember(seedProject, m);
const seedFile = path.join(TMP, 'Eight.ccproject'); fs.writeFileSync(seedFile, P.toBytes(seedProject, {}));
ok((await P.fromBytes(new Uint8Array(fs.readFileSync(seedFile)))).project.members.length === 6, 'the seed project (current format, six files, no tables) reads back');

/** What each view holds, read through each app's own window object (ModelCraft lives in a frame). */
const held = pg => pg.evaluate(() => {
  const wins = [window, ...[...document.querySelectorAll('iframe')].map(f => { try { return f.contentWindow; } catch { return null; } }).filter(Boolean)];
  const mc = wins.find(w => w.modelcraft), o = {};
  const get = (k, fn) => { try { o[k] = fn(); } catch { o[k] = null; } };
  get('cad', () => window.cadcraft.doc.all().length);
  get('bim', () => window.bimcraftModels.list().map(m => ({ mi: m.mi, name: m.name, n: m.elements, off: m.offset.map(v => Math.round(v * 1000) / 1000) })));
  get('model', () => Object.keys(mc.modelcraft.file().defs || {}).length);
  get('markup', () => window.markupcraft.sheets.length);
  get('takeoff', () => { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Wall: length/.test(x.name)); return r ? r.qty : null; });
  get('civil', () => ({ name: window.civilcraft.project.state.name, pts: window.civilcraft.project.points.length }));
  get('steel', () => ({ name: window.detailcraft.model.state.name, n: window.detailcraft.model.state.members.length }));
  get('part', () => ({ name: window.partcraft.part.name, feats: window.partcraft.part.features.map(f => f.type) }));
  return o;
});
const waitHeld = (pg, test, ms = 150000) => pg.waitForFunction(test, null, { timeout: ms }).then(() => true, () => false);
const showPanel = (pg, id) => pg.evaluate(i => { const sw = window.superWindow; sw.M.showPanel(sw.state, i); sw.M.setActiveTab(sw.state, i); sw.render(); }, id);
const placed = (pg, kind) => pg.evaluate(k => window.superWindow.links.placements(k), kind);
const links = pg => pg.evaluate(() => window.superWindow.project.links);
const openTab = async pg => { if (!(await pg.$(D + '[open]'))) await pg.click('[data-act="links"]'); await pg.waitForSelector(D + '[open]'); await pg.click(D + ' [data-sclink-tab="model"]'); await pg.waitForSelector(PANE); };
const type = async (pg, sel, v) => { await pg.fill(sel, ''); await pg.fill(sel, String(v)); };

/* ================================================================ A. one project, eight kinds */
let page = await superPage();
await page.setInputFiles('[data-sc-open-input]', seedFile);   // the window's own Open: the project file goes through Open project, each member to its own app
const six = await waitHeld(page, () => { try {
  const fr = [...document.querySelectorAll('iframe')].map(f => f.contentWindow).find(w => w && w.modelcraft);
  return window.cadcraft.doc.all().length > 20 && window.bimcraftModels.list().length === 1 && fr && Object.keys(fr.modelcraft.file().defs || {}).length > 0 && window.markupcraft.sheets.length === 1
    && window.civilcraft.project.points.length === 25 && window.detailcraft.model.state.members.length === 11; } catch { return false; } });
const h0 = await held(page);
ok(six, 'Open project hands each file to its own app: the drawing, the model, the 3D model, the sheet, the site and the steel are all open: ' + JSON.stringify(h0));
ok(h0.steel && h0.steel.n === 11, 'the steel model opens although its view was not up yet when the project was opened (the lost-file fault): 11 members');
// the takeoff: the Quantities view fills from the model by the live link (41 m of wall in the small house, by hand: 10 + 7 + 10 + 7 + 7)
await showPanel(page, 'takeoff');
await waitHeld(page, () => { try { return window.takeoffcraft.estimate().rows.some(x => x.kind === 'item' && /^Wall: length/.test(x.name) && x.qty === 41); } catch { return false; } }, 120000);
const tk0 = await page.evaluate(() => { const rows = window.takeoffcraft.estimate().rows, f = re => { const r = rows.find(x => x.kind === 'item' && re.test(x.name)); return r ? r.qty : null; }; return { len: f(/^Wall: length/), area: f(/^Wall: gross side area/) }; });
ok(tk0.len === 41, 'the takeoff follows the model: walls 41 m (' + tk0.len + ')');
ok(Math.abs(tk0.area - 41 * 2.4384) < 0.01, 'and the wall area of this millimetre model arrives in square metres, 41 x 2.4384 = 99.97, not 0 (the unit fix): ' + tk0.area);
// the part: made in the Part view (a 40 x 20 rectangle pulled 10)
await showPanel(page, 'part');
const partUp = await waitHeld(page, () => !!(window.partcraft && window.partcraft.part), 90000);
const built = partUp ? await page.evaluate(async () => {
  const pcw = window.partcraft, Pm = await import('/assets/apps/partcraft/dev/part.js'), SK = await import('/assets/apps/partcraft/dev/sketch.js');
  const part = pcw.part; part.name = 'Bracket';
  const s = Pm.addFeature(part, 'sketch', {}); SK.addRect(s.sketch, [0, 0], [40, 20]);
  Pm.addFeature(part, 'extrude', { sketch: s.id, depth: 10 });
  try { pcw.rebuild(); } catch (e) { return 'rebuild ' + e.message; }
  for (let i = 0; i < 80 && !(pcw.regen && pcw.regen.mesh); i++) await new Promise(r => setTimeout(r, 250));
  return pcw.regen && pcw.regen.mesh ? 'ok' : 'no solid';
}) : 'no part view';
ok(built === 'ok', 'a part is made in the Part view (sketch + extrude): ' + built);
// a wall moved in the building view through BimCraft's own op: the model now has an edit to save, and the takeoff follows (41 -> 45 m)
const movedWall = await page.evaluate(async () => {
  const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js'), A = window.bimcraftRes.api, ed = A.ed();
  const east = OPS.snapshotModel(ed).walls.find(w => w.a[0] === 10000 && w.b[0] === 10000); if (!east) return null;
  const run = OPS.changeWall(east.guid, { a: [12000, east.a[1]], b: [12000, east.b[1]] });
  if (typeof A.commit === 'function') A.commit(run, { label: 'Wall', verb: 'moved' }); else ed.modelChange(run);
  return east.guid;
});
const tk45 = await waitHeld(page, () => { try { return window.takeoffcraft.estimate().rows.some(x => x.kind === 'item' && /^Wall: length/.test(x.name) && x.qty === 45); } catch { return false; } }, 90000);
ok(movedWall && tk45, 'LIVE: the east wall moved 2 m in the building view: the takeoff shows 45 m without anything being sent by hand');

/* ---- the links, made in the Links window › In the model ---- */
await openTab(page);
ok(await page.$$eval(D + ' [data-sclink-tab]', n => n.map(x => x.textContent.trim()).join('|')) === 'Links|Quantity changes|Parts|Massing|In the model', 'the Links window has the In the model tab');
ok(await page.$$eval(PANE + ' [data-scplace-sec]', n => n.map(x => x.dataset.scplaceSec).join(',')) === 'site,steel,part', 'with three parts: the site under the building, the steel in the model, parts placed');
// 1. the site under the building: the boxes start at the middle of the surface
const pre = await page.$$eval(PANE + ' [data-scplace-new="site"] input', n => n.map(x => x.value));
ok(pre.join(',') === '20,20', 'the site boxes start at the middle of the ground surface: E 20, N 20 (' + pre + ')');
await page.click(PANE + ' [data-scplace-site]');
await waitHeld(page, () => window.superWindow.links.placements('site').length === 1 && window.bimcraftModels.list().some(m => / \(site\)\.ifc$/.test(m.name)), 90000);
const s1 = (await placed(page, 'site'))[0];
ok(s1 && s1.site.e === 20 && s1.site.n === 20 && s1.site.ground === 103 && s1.site.inside && s1.site.units === 'm', 'ONE CLICK: the site is under the building; the ground where the building stands is 103 m (by hand: 100 + 0.1 x 20 + 0.05 x 20): ' + JSON.stringify(s1 && s1.site));
ok((await status(page)).includes('Hill lot is under the building at E 20, N 20. The ground there is 103 m.'), 'and the window says so in words');
// 2. the steel, 3 m along X
await openTab(page);
await type(page, PANE + ' [data-scplace-new="steel"] [data-scplace-x]', 3);
await page.click(PANE + ' [data-scplace-steel]');
await waitHeld(page, () => window.superWindow.links.placements('steel').length === 1 && window.bimcraftModels.list().some(m => / \(steel\)\.ifc$/.test(m.name)), 120000);
const st1 = (await placed(page, 'steel'))[0];
ok(st1 && st1.x === 3 && st1.y === 0 && st1.source_name === 'Sample frame', 'TWO STEPS (a position, a click): the steel is in the model, 3 m along X: ' + JSON.stringify(st1 && [st1.x, st1.y, st1.z, st1.source_name]));
// 3. the part, twice, each at its own position
await openTab(page);
await type(page, PANE + ' [data-scplace-new="part"] [data-scplace-x]', 1); await type(page, PANE + ' [data-scplace-new="part"] [data-scplace-y]', 2);
await page.click(PANE + ' [data-scplace-part]');
await waitHeld(page, () => window.superWindow.links.placements('part').length === 1, 90000);
await openTab(page);
await type(page, PANE + ' [data-scplace-new="part"] [data-scplace-x]', 4); await type(page, PANE + ' [data-scplace-new="part"] [data-scplace-y]', 2);
await page.click(PANE + ' [data-scplace-part]');
await waitHeld(page, () => window.superWindow.links.placements('part').length === 2 && window.bimcraftModels.list().filter(m => m.name === 'Bracket.ifc').length === 2, 90000);
const pp = await placed(page, 'part');
ok(pp.length === 2 && pp[0].x === 1 && pp[0].y === 2 && pp[1].x === 4 && pp[0].shape_member === pp[1].shape_member && pp[0].id !== pp[1].id, 'the part is placed twice, each placement a row of its own with its position, one shape file: ' + JSON.stringify(pp.map(r => [r.id, r.x, r.y, r.z])));
ok((await status(page)).includes('Bracket placed again: 2 placements.'), 'the second placement is said');
// move the second placement up 3 m through its own row
await openTab(page);
const row2 = `${PANE} [data-scplace-id="${pp[1].id}"]`;
await type(page, row2 + ' [data-scplace-z]', 3); await page.click(row2 + ' [data-scplace-move]');
await waitHeld(page, () => window.superWindow.links.placements('part')[1].z === 3, 30000);
const h1 = await held(page);
const inView = (h, re) => h.bim.filter(m => re.test(m.name));
ok(h1.bim.length === 5 && h1.bim[0].name === 'house.ifc' && inView(h1, / \(site\)\.ifc$/).length === 1 && inView(h1, / \(steel\)\.ifc$/).length === 1, 'the building view shows five models: the house, the site, the steel and the part twice: ' + h1.bim.map(m => m.name).join(', '));
ok(JSON.stringify(inView(h1, / \(site\)\.ifc$/)[0].off) === '[0,0,0]' && JSON.stringify(inView(h1, / \(steel\)\.ifc$/)[0].off) === '[3,0,0]', 'the site at the building\'s origin (its ground there is the zero), the steel 3 m along X');
ok(JSON.stringify(inView(h1, /^Bracket\.ifc$/).map(m => m.off).sort()) === '[[1,2,0],[4,2,3]]', 'the parts at (1, 2, 0) and, after Move, (4, 2, 3): ' + JSON.stringify(inView(h1, /^Bracket\.ifc$/).map(m => m.off)));
const L1 = await links(page);
const kinds = k => L1.filter(l => l.kind === k);
ok(kinds('site').length === 1 && kinds('site')[0].role === 'hosts' && kinds('site')[0].from.app === 'civilcraft' && kinds('site')[0].to.app === 'bimcraft', 'links: the site HOSTS the building');
ok(kinds('steel').length === 11 && kinds('steel').every(l => l.role === 'same' && l.from.app === 'detailcraft' && /^[0-9A-Za-z_$]{22}$/.test(l.to.id)) && kinds('steel-model').length === 1, 'links: each of the 11 steel members is the SAME as its element in the model; the steel model is PART OF the building');
ok(kinds('part').length === 1 && kinds('part')[0].role === 'defines' && kinds('quantities').length === 1, 'links: the part DEFINES its model object (one link for both placements); the takeoff MEASURES the model');
// a steel member picked in the building view relates to the member in the steel view through the link table (the selection hub of the `select` package follows it)
const rel = await page.evaluate(() => { const l = window.superWindow.project.links.find(x => x.kind === 'steel'); return import('/assets/apps/supercadcraft/dev/super-linkroles.js').then(LR => LR.pointingAt(window.superWindow.project.links, { app: 'bimcraft', id: l.to.id }, { both: true }).map(x => [x.role, x.other.app, x.other.id])); });
ok(rel.length === 1 && rel[0][0] === 'same' && rel[0][1] === 'detailcraft', 'what points at a steel element of the model: the DetailCraft member (' + JSON.stringify(rel) + ')');
if (shots) await page.screenshot({ path: `${OUT}/project-eight-model-tab.png` });
await page.click(D + ' [data-sclink-close]').catch(() => {});

/* ---- the window's own Save: every app's own Save, collected into the one file ---- */
const downloads = []; page.on('download', d => downloads.push(d));
// a browser with a folder picker (as a person's Chromium has): CivilCraft's own Save would ask for a folder for its pair. While SuperCad Studio collects, it must not.
await page.evaluate(() => { window.__folderAsked = 0; window.showDirectoryPicker = async () => { window.__folderAsked++; throw new DOMException('no folder', 'AbortError'); }; });
await page.click('.sc-barbtn[data-act="save"]');
await waitHeld(page, () => /Saved Eight\.ccproject/.test(document.querySelector('.sc-status')?.textContent || ''), 180000);
await page.waitForTimeout(1500);
ok(await page.evaluate(() => window.__folderAsked) === 0, 'no app asks the person for a folder in the middle of Save (CivilCraft\'s pair is collected like the rest)');
ok(downloads.length === 1 && downloads[0].suggestedFilename() === 'Eight.ccproject', 'Save downloads ONE file, the project; no app\'s file is downloaded loose: ' + downloads.map(d => d.suggestedFilename()).join(', '));
const saved = path.join(TMP, 'saved', 'Eight.ccproject'); fs.mkdirSync(path.dirname(saved), { recursive: true });
if (downloads[0]) await downloads[0].saveAs(saved);

/* ================================================================ B. the file */
const zipBytes = new Uint8Array(fs.readFileSync(saved));
const back = await P.fromBytes(zipBytes), pr = back.project, files = await P.unzip(zipBytes);
const pathOf = n => [...files.keys()].find(k => k.endsWith('/' + n));
const mem = (app, re) => pr.members.find(m => m.app === app && re.test(m.name));
const head = (m, n = 40) => dec(m.bytes.subarray(0, n));
const EIGHT = {
  cadcraft: { m: mem('cadcraft', /^plan\.dwg$/), dir: 'Drawings/2D', is: m => /^AC10\d\d/.test(head(m, 6)), what: 'a DWG (AC10xx)' },
  bimcraft: { m: mem('bimcraft', /^house \(edited\)\.ifc$/), dir: 'Drawings/3D', is: m => head(m).startsWith('ISO-10303-21;') && dec(m.bytes).includes('IFCWALL'), what: 'an IFC (STEP text)' },
  modelcraft: { m: mem('modelcraft', /\.modelcraft$/), dir: 'Drawings/3D', is: m => { try { return JSON.parse(dec(m.bytes)).format === 'modelcraft'; } catch { return false; } }, what: 'a ModelCraft file' },
  markupcraft: { m: mem('markupcraft', /\(marked up\)\.pdf$/), dir: 'Documentation', is: m => head(m, 5) === '%PDF-', what: 'a PDF' },
  takeoffcraft: { m: mem('takeoffcraft', /\.json$/), dir: 'Documentation', is: m => { try { return JSON.parse(dec(m.bytes)).format === 'takeoffcraft-project'; } catch { return false; } }, what: 'a TakeoffCraft project' },
  civilcraft: { m: mem('civilcraft', /\.civilcraft\.json$/), dir: 'Drawings/3D', is: m => { try { const j = JSON.parse(dec(m.bytes)); return j.format === 'civilcraft-project' && j.points.length === 25; } catch { return false; } }, what: 'a CivilCraft project with its 25 points' },
  detailcraft: { m: mem('detailcraft', /\.detailcraft\.json$/), dir: 'Drawings/3D', is: m => { try { const j = JSON.parse(dec(m.bytes)); return j.format === 'detailcraft' && j.members.length === 11; } catch { return false; } }, what: 'a DetailCraft model with its 11 members' },
  partcraft: { m: mem('partcraft', /^Bracket\.partcraft\.json$/), dir: 'Drawings/3D', is: m => { try { const j = JSON.parse(dec(m.bytes)); return j.format === 'partcraft' && j.features.some(f => f.type === 'extrude'); } catch { return false; } }, what: 'a PartCraft part with its extrude' },
};
ok(back.skipped.length === 0 && pr.revision === 2, 'the saved project reads back whole (nothing skipped), revision 2 (the seed file was revision 1): ' + JSON.stringify([back.skipped, pr.revision]));
for (const [app, e] of Object.entries(EIGHT)) {
  ok(e.m && e.m.role === 'saved', `${app}: its own Save is in the project (${e.m ? e.m.name : 'missing'}; members: ${pr.members.filter(m => m.app === app).map(m => m.name + ':' + m.role).join(', ')})`);
  if (!e.m) continue;
  ok(e.is(e.m), `${app}: the bytes are the app's own format, ${e.what}`);
  const at = pathOf(e.m.name);
  ok(at === `Eight/${e.dir}/${e.m.name}` && P.sha256(files.get(at).bytes) === P.sha256(e.m.bytes), `${app}: kept byte for byte at ${at}`);
}
const civ = pr.members.filter(m => m.app === 'civilcraft' && /\.json$/.test(m.name)), stl = pr.members.filter(m => m.app === 'detailcraft');
ok(civ.length === 1 && civ[0].id === 'm5' && civ[0].name === 'Hill lot.civilcraft.json', 'CivilCraft names its file after its document: the saved file took the opened member\'s place (same member, no second copy): ' + civ.map(m => m.id + ' ' + m.name));
ok(stl.length === 1 && stl[0].id === 'm6' && stl[0].name === 'Sample frame.detailcraft.json', 'and DetailCraft\'s likewise: ' + stl.map(m => m.id + ' ' + m.name));
const tableOf = (p, t) => { const b = P.extGet(p, 'links', `rows/${t}.json`); return b ? JSON.parse(dec(b)).rows : {}; };
const plc = PL.livePlacements(tableOf(pr, 'sc_placement'));
ok(plc.length === 4 && plc.map(r => r.kind).join(',') === 'part,part,site,steel' && plc.every(r => pr.members.some(m => m.id === r.shape_member) && pr.members.some(m => m.id === r.source_member)), 'the placement table is in the file: two parts, the site, the steel, each naming its own file and its shape file: ' + plc.map(r => r.id).join(', '));
ok(pr.links.filter(l => l.kind === 'steel').length === 11 && pr.links.some(l => l.kind === 'site') && pr.links.some(l => l.kind === 'part') && pr.links.some(l => l.kind === 'quantities'), 'and the links between the eight (links.json): ' + [...new Set(pr.links.map(l => l.kind))].join(', '));
ok(Object.values(tableOf(pr, 'sc_link')).filter(r => r.deleted_rev == null).length === pr.links.length, 'mirrored row by row in sc_link');
const regRows = (() => { const b = P.extGet(pr, 'registry', 'rows/sc_object.json'); return b ? Object.values(JSON.parse(dec(b)).rows) : []; })();
const regApps = [...new Set(regRows.filter(o => o.deleted_rev == null).map(o => o.app))].sort();
ok(P.APPS.every(a => regApps.includes(a)), 'the registry in the file lists objects of all eight apps: ' + regApps.join(', ') + ' (' + regRows.length + ' objects)');

/* ---- "its parts still open in the single apps": each member, taken out, opens in its own app's page through that app's own file input ---- */
const origin = new URL(url).origin;
const SINGLE = {
  cadcraft: () => window.cadcraft.doc.all().length,
  bimcraft: () => { const l = window.bimcraftModels.list(); return l.length === 1 ? l[0].elements : 0; },
  modelcraft: () => Object.keys(window.modelcraft.file().defs || {}).length,
  markupcraft: () => window.markupcraft.sheets.length,
  takeoffcraft: () => { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Wall: length/.test(x.name)); return r ? r.qty : 0; },
  civilcraft: () => (window.civilcraft.project.state.name === 'Hill lot' ? window.civilcraft.project.points.length : 0),
  detailcraft: () => (window.detailcraft.model.state.name === 'Sample frame' ? window.detailcraft.model.state.members.length : 0),
  partcraft: () => (window.partcraft.part.name === 'Bracket' ? window.partcraft.part.features.filter(f => f.type === 'extrude').length : 0),
};
const WANT = { cadcraft: h0.cad, bimcraft: 20, modelcraft: h0.model, markupcraft: 1, takeoffcraft: 45, civilcraft: 25, detailcraft: 11, partcraft: 1 };
const outDir = path.join(TMP, 'taken-out'); fs.mkdirSync(outDir, { recursive: true });
for (const [app, e] of Object.entries(EIGHT)) {
  if (!e.m) { ok(false, `${app}: no member to open in the single app`); continue; }
  const f = path.join(outDir, e.m.name); fs.writeFileSync(f, e.m.bytes);
  // CivilCraft's own Save writes a pair (its project and the same site as IFC 4.3) and opens the two together: both are in the project, both are handed over
  const give = [f]; if (app === 'civilcraft') { const pair = pr.members.find(m => m.app === 'civilcraft' && m.name === e.m.name.replace(/\.civilcraft\.json$/, '.ifc')); ok(!!pair, 'civilcraft: the IFC half of its saved pair is in the project too'); if (pair) { const f2 = path.join(outDir, pair.name); fs.writeFileSync(f2, pair.bytes); give.push(f2); } }
  const inp = OPEN.inputFor(app, OPEN.extOf(e.m.name));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 200)));
  let got = null;
  try {
    for (let attempt = 1; ; attempt++) { try { await pg.goto(`${origin}/lab/${app}?embed=1`, { timeout: 45000 }); await pg.waitForSelector(inp.sel, { state: 'attached', timeout: 45000 }); break; } catch (x) { if (attempt >= 3) throw x; } }
    if (app === 'detailcraft') await pg.waitForFunction(() => !!window.detailcraft, null, { timeout: 30000 });
    await pg.waitForTimeout(1200);
    await pg.setInputFiles(inp.sel, give);
    const want = WANT[app];
    await pg.waitForFunction(([fn, w]) => { try { return new Function('return (' + fn + ')()')() === w; } catch { return false; } }, [String(SINGLE[app]), want], { timeout: 90000 }).catch(() => {});
    got = await pg.evaluate(fn => { try { return new Function('return (' + fn + ')()')(); } catch (x) { return 'error ' + x.message; } }, String(SINGLE[app]));
  } catch (x) { got = 'failed ' + String(x.message).slice(0, 120); }
  ok(got === WANT[app], `${app} ALONE opens ${e.m.name} taken out of the project, through its own file input: ${JSON.stringify(got)} (expected ${JSON.stringify(WANT[app])})` + (errs.length ? ' errors: ' + errs.join(' | ') : ''));
  await pg.close();
}
await page.close();

/* ================================================================ C. reopen in a fresh window */
page = await superPage();
await page.setInputFiles('[data-sc-open-input]', saved);
const all8 = await waitHeld(page, () => { try {
  const fr = [...document.querySelectorAll('iframe')].map(f => f.contentWindow).find(w => w && w.modelcraft);
  return window.cadcraft.doc.all().length > 20 && window.bimcraftModels.list().length >= 1 && fr && Object.keys(fr.modelcraft.file().defs || {}).length > 0 && window.markupcraft.sheets.length >= 1
    && window.civilcraft.project.points.length === 25 && window.detailcraft.model.state.members.length === 11 && window.partcraft && window.partcraft.part && window.partcraft.part.name === 'Bracket'
    && window.takeoffcraft.estimate().rows.some(x => x.kind === 'item' && /^Wall: length/.test(x.name) && x.qty === 45); } catch { return false; } }, 240000);
const h2 = await held(page);
ok(all8, 'REOPENED in a fresh window: all eight views have their document again (the takeoff at 45 m, the part with its history): ' + JSON.stringify({ ...h2, bim: h2.bim && h2.bim.length }));
await waitHeld(page, () => window.bimcraftModels.list().length === 5, 120000);
const h3 = await held(page);
ok(h3.bim.length === 5 && /^house \(edited\)\.ifc$/.test(h3.bim[0].name), 'the building view opens the model as it was saved and shows the four placements beside it (not the shape files as loose models): ' + h3.bim.map(m => m.name).join(', '));
ok(JSON.stringify(inView(h3, / \(steel\)\.ifc$/).map(m => m.off)) === '[[3,0,0]]' && JSON.stringify(inView(h3, /^Bracket\.ifc$/).map(m => m.off).sort()) === '[[1,2,0],[4,2,3]]' && JSON.stringify(inView(h3, / \(site\)\.ifc$/).map(m => m.off)) === '[[0,0,0]]', 'each where it was put: steel (3, 0, 0), parts (1, 2, 0) and (4, 2, 3), the site under the origin');
const re = await page.evaluate(() => { const R = window.superRegistry.REG, p = window.superWindow.project, apps = {}; for (const o of R.list(p, {})) apps[o.app] = (apps[o.app] || 0) + 1; return { apps, rev: p.revision, links: p.links.length, kinds: [...new Set(p.links.map(l => l.kind))].sort(), site: window.superWindow.links.placements('site')[0].site, members: p.members.length }; });
ok(['cadcraft', 'bimcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft'].every(a => re.apps[a] > 0), 'the registry of the reopened project lists objects of all eight apps: ' + JSON.stringify(re.apps));
ok(re.rev === 2 && re.kinds.join(',') === 'part,quantities,site,steel,steel-model' && re.site.ground === 103, 'the links and the ground under the building (103 m) are back: ' + JSON.stringify([re.kinds, re.site]));

/* ================================================================ D. live links, in the real views */
const settle = pg => pg.evaluate(() => window.superWindow.links.follow());   // placing, moving and following run one after the other: this returns when what was under way is done
const sha = (pg, kind) => pg.evaluate(k => window.superWindow.links.placements(k).map(r => r.shape_sha256).join(','), kind);
const shapeText = (pg, kind) => pg.evaluate(k => { const p = window.superWindow.project, r = window.superWindow.links.placements(k)[0]; return new TextDecoder().decode(p.members.find(m => m.id === r.shape_member).bytes); }, kind);
await page.waitForTimeout(2500);   // every source has been looked at once since the project opened
// 1. steel: a column's section changed in the Steel view, by DetailCraft's own edit
const steel0 = await sha(page, 'steel'), steelMi0 = await page.evaluate(() => window.superWindow.links.shownAs(window.superWindow.links.placements('steel')[0].id));
ok(!(await shapeText(page, 'steel')).includes('W14X90') && !(await shapeText(page, 'steel')).includes('W14x90'), 'before: no W14x90 in the steel the building shows');
await page.evaluate(() => { const m = window.detailcraft.model; m.change('test: section', tx => tx.updateMember('m1', { profile: 'W14x90' })); });
const steelNow = await page.waitForFunction(s0 => window.superWindow.links.placements('steel')[0].shape_sha256 !== s0 && window.bimcraftModels.list().filter(m => / \(steel\)\.ifc$/.test(m.name)).length === 1, steel0, { timeout: 60000 }).then(() => true, () => false);
await settle(page);
const h4 = await held(page), steelMi1 = await page.evaluate(() => window.superWindow.links.shownAs(window.superWindow.links.placements('steel')[0].id));
ok(steelNow && /W14x90/i.test(await shapeText(page, 'steel')), 'LIVE steel: a column changed to W14x90 in the Steel view; the steel in the project\'s model was written again by DetailCraft with the new section');
ok(steelMi1 !== steelMi0 && inView(h4, / \(steel\)\.ifc$/).length === 1 && JSON.stringify(inView(h4, / \(steel\)\.ifc$/)[0].off) === '[3,0,0]' && h4.bim.length === 5, 'and the building view shows the new steel in the same place (one steel model, still 3 m along X, nothing imported by hand): ' + JSON.stringify([steelMi0, steelMi1, h4.bim]));
ok((await status(page)).includes('Sample frame changed: the steel in the model was brought up to date (11 members linked).'), 'the window says what happened: ' + (await status(page)).split('not signed in').pop());
// a member added: one more link
await page.evaluate(() => { const m = window.detailcraft.model, a = m.state.members.find(x => x.type === 'beam') || m.state.members[0]; m.change('test: add', tx => tx.addMember({ type: 'beam', profile: a.profile, material: a.material, start: [0, 3500, 4000], end: [6000, 3500, 4000] })); });
const twelve = await page.waitForFunction(() => window.superWindow.project.links.filter(l => l.kind === 'steel').length === 12, null, { timeout: 60000 }).then(() => true, () => false);
await settle(page);
ok(twelve, 'a beam added in the Steel view: the model has it and a twelfth member link is made (' + (await links(page)).filter(l => l.kind === 'steel').length + ')');
// 2. the site: the ground point where the building stands is raised 1 m in the Site view, by CivilCraft's own point edit
const site0 = await sha(page, 'site');
await page.evaluate(() => { const p = window.civilcraft.project; p.editPoints('test: raise', pts => pts.map(q => (String(q.n) === '13' ? { ...q, z: q.z + 1 } : q))); });
const siteNow = await page.waitForFunction(s0 => window.superWindow.links.placements('site')[0].shape_sha256 !== s0, site0, { timeout: 60000 }).then(() => true, () => false);
await settle(page);
const s2 = (await placed(page, 'site'))[0], h5 = await held(page);
ok(siteNow && s2.site.ground === 104, 'LIVE site: the ground point under the building raised 1 m in the Site view; the building\'s ground level follows: 103 -> 104 m (' + JSON.stringify(s2.site) + ')');
ok((await status(page)).includes('Hill lot changed: the ground under the building went from 103 to 104 m.'), 'said in words: ' + (await status(page)).split('not signed in').pop());
ok(inView(h5, / \(site\)\.ifc$/).length === 1 && h5.bim.length === 5, 'the building view shows the new surface (one site model)');
// the building moved to another point of the site through the tab: the corner E 40, N 0, where the plane is 100 + 0.1 x 40 = 104 (far from the raised point)
await openTab(page);
const siteRow = `${PANE} [data-scplace-kind="site"]`;
await type(page, siteRow + ' [data-scplace-e]', 40); await type(page, siteRow + ' [data-scplace-n]', 0); await page.click(siteRow + ' [data-scplace-move]');
await page.waitForFunction(() => window.superWindow.links.placements('site')[0].site.e === 40, null, { timeout: 60000 }).catch(() => {});
await settle(page);
const s3 = (await placed(page, 'site'))[0];
ok(s3.site.e === 40 && s3.site.n === 0 && s3.site.ground === 104 && (await status(page)).includes('The building now stands at E 40, N 0. The ground there is 104 m.'), 'the building moved to the corner E 40, N 0 in the tab: the ground there is 100 + 0.1 x 40 = 104 m, read again from CivilCraft\'s surface: ' + JSON.stringify(s3.site));
await type(page, siteRow + ' [data-scplace-e]', 90); await page.click(siteRow + ' [data-scplace-move]');
await page.waitForFunction(() => window.superWindow.links.placements('site')[0].site.e === 90, null, { timeout: 60000 }).catch(() => {});
await settle(page);
ok((await status(page)).includes('is off the ground surface'), 'a point off the surface is said, not guessed: ' + (await status(page)).split('not signed in').pop());
await type(page, siteRow + ' [data-scplace-e]', 20); await type(page, siteRow + ' [data-scplace-n]', 20); await page.click(siteRow + ' [data-scplace-move]');
await page.waitForFunction(() => window.superWindow.links.placements('site')[0].site.e === 20, null, { timeout: 60000 }).catch(() => {});
await settle(page);
// 3. the part: pulled to 25 instead of 10 in the Part view
await showPanel(page, 'part');
const part0 = await sha(page, 'part');
await page.evaluate(() => { const pcw = window.partcraft; pcw.part.features.find(f => f.type === 'extrude').depth = 25; pcw.rebuild(); });
const partNow = await page.waitForFunction(s0 => { const r = window.superWindow.links.placements('part'); return r.length === 2 && r.map(x => x.shape_sha256).join(',') !== s0 && r[0].shape_sha256 === r[1].shape_sha256; }, part0, { timeout: 90000 }).then(() => true, () => false);
await settle(page);
const h6 = await held(page);
const depth = await page.evaluate(() => { const s = window.superWindow.links.store(), f = Object.values(s.all('part_feature')).find(x => x.type === 'extrude' && x.deleted_rev == null); return f && f.data ? f.data.depth : null; });
ok(partNow && JSON.stringify(inView(h6, /^Bracket\.ifc$/).map(m => m.off).sort()) === '[[1,2,0],[4,2,3]]', 'LIVE part: the part pulled to 25 in the Part view; BOTH placements in the building follow, each still at its position');
ok(depth === 25, 'and the part\'s history table has the new depth (25): ' + depth);
// 4. take one placement out with its small x
await openTab(page);
await page.click(`${PANE} [data-scplace-id="${pp[0].id}"] [data-scplace-remove]`);
await page.waitForFunction(() => window.superWindow.links.placements('part').length === 1 && window.bimcraftModels.list().filter(m => m.name === 'Bracket.ifc').length === 1, null, { timeout: 30000 }).catch(() => {});
const h7 = await held(page);
const tomb = await page.evaluate(id => window.superWindow.links.store().read('sc_placement', id), pp[0].id);
ok(inView(h7, /^Bracket\.ifc$/).length === 1 && JSON.stringify(inView(h7, /^Bracket\.ifc$/)[0].off) === '[4,2,3]' && tomb && tomb.deleted_rev !== null && (await links(page)).some(l => l.kind === 'part'), 'a placement taken out with its x: it leaves the building, its row stays as a tombstone, the other placement and the part\'s link stay');
if (shots) await page.screenshot({ path: `${OUT}/project-eight-live.png` });
await page.click(D + ' [data-sclink-close]').catch(() => {});

/* ================================================================ E. folder form; a version 1 file */
// Save as folder, the window's own button: every app's own Save is collected again (the steel with its twelfth member, the site with its raised point, the part
// pulled to 25) and written as a folder. The folder picker needs a person's click on a real folder, so it is answered with a folder of the browser's own file system.
await page.evaluate(async () => { const root = await navigator.storage.getDirectory(); try { await root.removeEntry('sc-eight', { recursive: true }); } catch { /* none */ } const parent = await root.getDirectoryHandle('sc-eight', { create: true }); window.showDirectoryPicker = async () => parent; });
const loose = []; page.on('download', d => loose.push(d.suggestedFilename()));
await page.click('.sc-barbtn[data-act="save-folder"]');
const folderSaved = await waitHeld(page, () => /Saved the project folder Eight/.test((document.querySelector('.sc-status')?.textContent || '').split('not signed in').pop()) && !!window.superWindow.projectFolder, 180000);
await page.waitForTimeout(1500);
ok(folderSaved && loose.length === 0, 'Save as folder (the window\'s own button) collects every app\'s Save into the folder; nothing is downloaded: ' + (await status(page)).split('not signed in').pop() + ' ' + loose.join(','));
const folder = await page.evaluate(async () => {
  const P = window.superWindow.P, p = window.superWindow.project, dir = window.superWindow.projectFolder;
  const walk = async (d, pre = '') => { const out = []; for await (const [n, h] of d.entries()) out.push(...(h.kind === 'directory' ? await walk(h, pre + n + '/') : [pre + n])); return out.sort(); };
  const tree = await walk(dir);
  // every member read STRAIGHT from the folder, compared with what the project holds
  const same = [];
  for (const m of p.members) { const at = tree.find(t => t.endsWith('/' + m.name)); if (!at) { same.push([m.app, m.name, 'missing']); continue; } let h = dir; const seg = at.split('/'); for (const s of seg.slice(0, -1)) h = await h.getDirectoryHandle(s); const b = new Uint8Array(await (await (await h.getFileHandle(seg.at(-1))).getFile()).arrayBuffer()); same.push([m.app, at, P.sha256(b) === P.sha256(m.bytes)]); }
  const r = await P.fromFolder(dir);
  const dec = b => new TextDecoder().decode(b), steel = JSON.parse(dec(r.project.members.find(m => m.app === 'detailcraft').bytes)).members.length;
  const z13 = JSON.parse(dec(r.project.members.find(m => m.app === 'civilcraft' && /\.civilcraft\.json$/.test(m.name)).bytes)).points[12][3], looseInParent = [];
  for await (const [n, h] of (await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-eight')).entries()) if (h.kind === 'file') looseInParent.push(n);
  return { root: dir.name, tree, same, members: r.project.members.length, links: r.project.links.length, skipped: r.skipped, rev: r.project.revision, steel, z13, looseInParent };
});
ok(folder.steel === 12, 'the steel file in the folder is DetailCraft\'s own Save of the model as it is now: 12 members (' + folder.steel + ')');
ok(folder.z13 === 104 && folder.looseInParent.length === 0, 'and the site file is CivilCraft\'s own Save with the raised point (104), inside the project folder: CivilCraft did not write its pair loose into a folder of its own asking: ' + JSON.stringify([folder.z13, folder.looseInParent]));
const own = a => folder.same.filter(x => x[0] === a && x[2] === true).map(x => x[1]);
ok(folder.same.every(x => x[2] === true), 'FOLDER FORM: every member is a plain file in the project folder, byte for byte what the project holds: ' + JSON.stringify(folder.same.filter(x => x[2] !== true)));
ok(own('cadcraft').includes('Drawings/2D/plan.dwg') && own('bimcraft').includes('Drawings/3D/house (edited).ifc') && own('civilcraft').includes('Drawings/3D/Hill lot.civilcraft.json') && own('detailcraft').includes('Drawings/3D/Sample frame.detailcraft.json') && own('partcraft').includes('Drawings/3D/Bracket.partcraft.json')
  && own('modelcraft').some(x => /^Drawings\/3D\/.*\.modelcraft$/.test(x)) && own('markupcraft').some(x => /^Documentation\/.*\(marked up\)\.pdf$/.test(x)) && own('takeoffcraft').some(x => /^Documentation\/.*\.json$/.test(x)),
  'so each part opens straight from the folder in its own app: Drawings/2D (the DWG), Drawings/3D (the IFC, the 3D model, the site, the steel, the part), Documentation (the PDF, the takeoff)');
ok(folder.tree.includes('Data/links/rows/sc_placement.json') && folder.tree.includes('Data/links.json') && folder.tree.includes('Data/registry/rows/sc_object.json') && folder.skipped.length === 0 && folder.rev === 3, 'with the links, the placement table and the registry under Data; the folder reads back whole as revision 3: ' + JSON.stringify([folder.skipped, folder.rev]));
await page.close();

page = await superPage();
// a version 1 project file (flat members/<id>/<name>, no Data folder, a link without a role), made by hand as the first builds wrote it
const v1 = P.zipStore([
  { path: 'manifest.json', bytes: enc(JSON.stringify({ format: 'supercadcraft-project', version: 1, name: 'Old shed', created: '2026-10-25T10:00:00Z', members: [{ id: 'm1', app: 'detailcraft', name: 'frame.detailcraft.json', role: 'opened' }, { id: 'm2', app: 'civilcraft', name: 'site.civilcraft.json', role: 'saved' }] })) },
  { path: 'links.json', bytes: enc(JSON.stringify({ version: 1, links: [{ kind: 'quantities', from: { app: 'bimcraft' }, to: { app: 'takeoffcraft' }, keys: ['ifc:ifcwall:length'] }] })) },
  { path: 'members/m1/frame.detailcraft.json', bytes: SEED[5].bytes }, { path: 'members/m2/site.civilcraft.json', bytes: SEED[4].bytes }]);
const v1File = path.join(TMP, 'Old shed.ccproject'); fs.writeFileSync(v1File, v1);
await page.setInputFiles('[data-sc-open-input]', v1File);
const oldUp = await waitHeld(page, () => { try { return window.detailcraft.model.state.members.length === 11 && window.civilcraft.project.points.length === 25; } catch { return false; } }, 120000);
const old = await page.evaluate(() => { const p = window.superWindow.project; return { name: p.name, members: p.members.map(m => m.app + ':' + m.name), links: p.links.map(l => l.kind), placed: window.superWindow.links.placements().length }; });
ok(oldUp && old.name === 'Old shed' && old.members.length === 2 && old.links.join() === 'quantities' && old.placed === 0, 'OLDER FILES: a version 1 project opens, its steel and its site in their views, its link kept: ' + JSON.stringify(old));
await page.close();
// and the folder written above opens in a fresh window through Open folder
page = await superPage();
const viaFolder = await page.evaluate(async root => {
  const parent = await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-eight'), dir = await parent.getDirectoryHandle(root);
  const opened = await window.superWindow.openFolder(dir);
  return { opened, name: window.superWindow.project.name, members: window.superWindow.project.members.length, placed: window.superWindow.links.placements().map(r => r.kind).join(',') };
}, folder.root);
const folderUp = await waitHeld(page, () => { try { return window.bimcraftModels.list().length === 4 && window.detailcraft.model.state.members.length === 12 && window.partcraft.part.name === 'Bracket' && window.civilcraft.project.points.find(q => String(q.n) === '13').z === 104; } catch { return false; } }, 240000);
const h8 = await held(page);
ok(viaFolder.opened === true && viaFolder.name === 'Eight' && viaFolder.placed === 'part,site,steel', 'the project FOLDER opens in a fresh window: ' + JSON.stringify(viaFolder));
ok(folderUp && inView(h8, /^Bracket\.ifc$/).length === 1 && inView(h8, / \(steel\)\.ifc$/).length === 1 && inView(h8, / \(site\)\.ifc$/).length === 1, 'with the changes made before it was written (12 steel members, the raised point, one part placement) and the three placements shown in the building: ' + JSON.stringify([h8.bim && h8.bim.map(m => m.name), h8.civil, h8.steel, h8.part, await page.evaluate(() => { try { return window.civilcraft.project.points.find(q => String(q.n) === '13').z; } catch { return null; } }), await page.evaluate(() => [...document.querySelectorAll('dialog[open]')].map(d => d.textContent.replace(/\s+/g, ' ').slice(0, 160)))]));
await page.evaluate(async () => { try { await (await navigator.storage.getDirectory()).removeEntry('sc-eight', { recursive: true }); } catch { /* none */ } });

ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + [...new Set(errors)].join(' | ') : ''));
await browser.close(); await close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
