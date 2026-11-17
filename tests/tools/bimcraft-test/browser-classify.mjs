#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-classify.mjs: 0.10 BK.94 (classification codes), BK.97 (type packs) and BK.96 (a class on every element) in the real page,
 * /lab, headless (session bk-content-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-classify.mjs [--shots <dir>]      run as root (a test admin session)
 * A room is drawn; codes are typed and picked in Properties, set on the type, defaults switched on in the project's dialog, an office
 * table loaded from CSV, the schedule columns shown; the file is saved and its text read. Then a wall type is saved as a pack and as IFC,
 * and both are added to a second, empty project.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d).slice(0, 700) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimclassify'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.removeItem('bimcraft.classify.packs'); localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const download = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click(sel)]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };
const newModel = async (name) => {
  await page.click('[data-empty] [data-new], [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
};
const walls = () => page.evaluate(() => { const S = window.bimcraftPlan.state; return S.data.walls.map((w) => ({ guid: w.guid, key: window.bimcraftRes.api.kb() + w.id, t: w.t, typeKey: w.typeKey })); });
const pick = async (keys) => { await page.evaluate((k) => window.bimcraftVis.pick(k), keys); await page.waitForSelector('[data-cls]'); };
const cls = () => page.evaluate(() => { const b = document.querySelector('[data-cls]'); if (!b) return null; const o = { count: b.dataset.count, open: b.open, codes: {}, titles: {}, from: {}, lists: {} };
  for (const i of b.querySelectorAll('[data-cls-code]')) o.codes[i.dataset.clsCode] = i.value;
  for (const i of b.querySelectorAll('[data-cls-title]')) o.titles[i.dataset.clsTitle] = i.textContent;
  for (const i of b.querySelectorAll('[data-cls-from]')) o.from[i.dataset.clsFrom] = i.dataset.from;
  for (const i of b.querySelectorAll('[data-cls-list]')) o.lists[i.dataset.clsList] = Number(i.dataset.rows);
  o.targets = [...b.querySelectorAll('[data-cls-target] option')].map((x) => x.value); return o; });
const typeCode = async (sys, code) => { await page.fill(`[data-cls-code="${sys}"]`, code); await page.press(`[data-cls-code="${sys}"]`, 'Enter'); await settled(); await page.waitForSelector('[data-cls]'); };
const saveText = () => page.evaluate(() => new TextDecoder().decode(window.bimcraftRes.api.ed().save()));

try {
  // ============================================================================================ BK.94
  console.log('== BK.94 the Data menu and Properties');
  await newModel('Classify');
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftRes.api, L1 = A.S.data.levels[0];
    const room = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    A.commit(OPS.drawWalls({ storey: L1.guid, segs: room.map((a, i) => ({ a, b: room[(i + 1) % 4] })), typeKey: 'ext-2x6', height: 2700 }), { label: 'Walls', verb: 'Drew' });
  });
  await settled();
  await page.evaluate(async () => { const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js'); const A = window.bimcraftRes.api; A.commit(OPS.placeOpening({ wall: A.S.data.walls[0].guid, typeKey: 'door-single', offset: 1000, sill: 0 }), { label: 'Door', verb: 'Placed' }); });
  await settled();
  let W = await walls();
  ok(W.length === 4, 'a room of four walls and a door is drawn');
  await page.click('[data-data-tools] > summary');
  const menu = await page.evaluate(() => ['[data-cls-open]', '[data-typepack-open]'].map((s) => { const b = document.querySelector('[data-data-tools] ' + s); return { shown: !!b && b.offsetParent !== null, label: b?.textContent.trim(), tip: b?.getAttribute('title') || b?.getAttribute('data-bs-original-title') || b?.getAttribute('aria-label') || '' }; }));
  ok(menu[0].shown && menu[0].label === 'Classification' && menu[1].shown && menu[1].label === 'Type packs' && menu.every((m) => m.tip.length > 20), 'the model bar\'s Data menu shows Classification and Type packs, each with a tooltip', menu);
  await page.click('[data-data-tools] > summary');
  await pick([W[0].key]);
  let c = await cls();
  ok(c && c.count === '1' && Object.keys(c.codes).join() === 'uniclass,omniclass,uniformat' && Object.values(c.codes).every((v) => v === '') && c.targets.join() === 'element,type',
    'Properties of a wall has a Classification section: a code box for each of the three systems, empty, and "Applies to" this element or its type', c);
  ok(c.open === false, 'with no code and no system chosen yet the section starts closed');
  await page.click('[data-cls] > summary');
  await page.waitForFunction(() => Number(document.querySelector('[data-cls-list="uniclass"]')?.dataset.rows) > 9000, null, { timeout: 30000 });
  c = await cls();
  ok(c.lists.uniclass === 9900 && c.lists.omniclass === 0 && c.lists.uniformat === 0, 'the Uniclass list is loaded (81 + 2272 + 7547 = 9900 codes); OmniClass and UniFormat have none and say so', c.lists);
  const noList = await page.evaluate(() => [...document.querySelectorAll('[data-cls-list]')].map((x) => x.textContent));
  ok(/no code list loaded: type the code/.test(noList[1]) && /no code list loaded: type the code/.test(noList[2]) && /9900 codes loaded/.test(noList[0]), 'the section says which is which in words', noList);

  console.log('== typing and picking codes');
  await page.fill('[data-cls-code="uniclass"]', 'curtain wall');
  const hits = await page.evaluate(() => [...document.querySelectorAll('[data-cls-hits="uniclass"] [data-cls-hit]')].map((b) => b.dataset.clsHit + ' ' + b.parentElement.textContent));
  ok(hits.length > 0 && hits.some((h) => /^Ss_25_10_20 /.test(h) && /Curtain walling systems/.test(h)), 'typing words searches the list: "curtain wall" offers Ss_25_10_20 Curtain walling systems', hits.slice(0, 3));
  await page.fill('[data-cls-code="uniclass"]', 'EF_25');
  await page.click('[data-cls-hits="uniclass"] [data-cls-hit="EF_25_10"]'); await settled(); await page.waitForSelector('[data-cls]');
  c = await cls();
  ok(c.codes.uniclass === 'EF_25_10' && c.titles.uniclass === 'Walls' && c.from.uniclass === 'element', 'picking EF_25_10 from the matches sets it: the title Walls shows, "set on this element"', c);
  await page.fill('[data-cls-code="uniformat"]', 'hello');
  const hint = await page.evaluate(() => { const h = document.querySelector('[data-cls-hint="uniformat"]'); return h.hidden ? '' : h.textContent; });
  ok(/does not look like a UniFormat code/.test(hint) && /kept as typed/.test(hint), 'a code of the wrong shape gets a hint, not a refusal', hint);
  await typeCode('uniformat', 'B2010');
  await typeCode('omniclass', '21-02 20 10');
  c = await cls();
  ok(c.codes.uniformat === 'B2010' && c.codes.omniclass === '21-02 20 10' && c.codes.uniclass === 'EF_25_10' && c.from.uniformat === 'element', 'UniFormat B2010 and OmniClass 21-02 20 10 are typed with no list behind them and kept', c);
  await shot('classify-1-properties');
  // on the type
  await pick([W[1].key]);
  await page.selectOption('[data-cls-target]', 'type');
  await typeCode('uniclass', 'Ss_25_10_32');
  c = await cls();
  ok(c.codes.uniclass === 'Ss_25_10_32' && c.from.uniclass === 'type' && c.titles.uniclass === 'Framed wall structure systems', 'a code set with "Applies to: its type" reads back on the wall as "from its type", with its title from the list', c);
  await pick([W[2].key]);
  c = await cls();
  ok(c.codes.uniclass === 'Ss_25_10_32' && c.from.uniclass === 'type', 'another wall of the same type shows the type\'s code without anyone typing it');
  await pick([W[0].key]);
  c = await cls();
  ok(c.codes.uniclass === 'EF_25_10' && c.from.uniclass === 'element', 'the first wall keeps its own code over the type\'s');
  await pick([W[0].key, W[1].key]);
  c = await cls();
  const ph = await page.evaluate(() => document.querySelector('[data-cls-code="uniclass"]').placeholder);
  ok(c.count === '2' && c.codes.uniclass === '' && ph === 'varies' && c.codes.uniformat === '', 'two walls picked with different Uniclass codes: the box is empty and says "varies"', [c, ph]);
  await typeCode('uniformat', 'B2010');
  await pick([W[1].key]);
  ok((await cls()).codes.uniformat === 'B2010', 'a code typed with two walls picked is on both');
  await page.click('[data-act="undo"]'); await settled(); await pick([W[1].key]);
  ok((await cls()).codes.uniformat === '', 'Undo takes it off again (one step for both walls)');
  await page.click('[data-act="redo"]'); await settled();

  console.log('== the project\'s dialog: systems, licences, an office table, defaults, schedule columns');
  await pick([W[3].key]);
  await page.click('[data-cls-project-open]'); await page.waitForSelector('[data-cls-project]');
  const dlg = await page.evaluate(() => { const d = document.querySelector('[data-cls-project]'); return {
    systems: [...d.querySelectorAll('[data-cls-system]')].map((s) => ({ id: s.dataset.clsSystem, bundled: s.dataset.bundled, text: s.textContent.replace(/\s+/g, ' ') })),
    use: [...d.querySelectorAll('[data-cls-use]')].map((x) => x.checked), links: [...d.querySelectorAll('[data-cls-system="uniclass"] a')].map((a) => a.href) }; });
  ok(dlg.systems.length === 3 && dlg.systems[0].bundled === '1' && /A code list comes with the app: 9900 codes/.test(dlg.systems[0].text) && /© NBS\. Licensed CC BY-ND 4\.0/.test(dlg.systems[0].text) && /v1\.6 \(31 July 2019\)/.test(dlg.systems[0].text) && /not the newest tables/.test(dlg.systems[0].text)
    && dlg.links.some((h) => /identifier\.buildingsmart\.org/.test(h)) && dlg.links.some((h) => /creativecommons\.org\/licenses\/by-nd\/4\.0/.test(h)),
    'Uniclass: says a list comes with the app, its three tables and editions, © NBS, CC BY-ND 4.0 with links to the source and the licence, and that newer tables exist', dlg.systems[0].text.slice(0, 400));
  ok(dlg.systems[1].bundled === '0' && /No code list comes with the app/.test(dlg.systems[1].text) && /Construction Specifications Institute/.test(dlg.systems[1].text) && /load your office's own licensed table/.test(dlg.systems[1].text) && dlg.systems[2].bundled === '0' && /No code list comes with the app/.test(dlg.systems[2].text),
    'OmniClass and UniFormat: say plainly that no list comes with the app because the publisher does not allow it, and that an office can load its own', dlg.systems[1].text.slice(0, 300));
  // an office table (made-up rows, not any publisher's codes)
  await page.setInputFiles('[data-cls-file="uniformat"]', { name: 'office-uniformat.csv', mimeType: 'text/csv', buffer: Buffer.from('Code,Title\r\nZ9010,"Test walls, exterior"\r\nZ9020,Test roofs\r\n') });
  await page.waitForSelector('[data-cls-own="uniformat"] li');
  const own = await page.evaluate(() => ({ text: document.querySelector('[data-cls-own="uniformat"]').textContent, stored: JSON.parse(localStorage.getItem('bimcraft.classify.packs') || '[]').map((p) => [p.system, p.rows.length, p.redistributable]) }));
  ok(/office-uniformat \(2 codes\), kept in this browser only/.test(own.text) && JSON.stringify(own.stored) === '[["uniformat",2,false]]', 'Load a table (CSV): the office\'s two codes are listed as "kept in this browser only" and stored as not redistributable', own);
  await page.check('[data-cls-use="uniclass"]'); await page.check('[data-cls-use="uniformat"]');
  await page.check('[data-cls-defaults]'); await page.check('[data-cls-schedules]');
  await shot('classify-2-project');
  await page.click('[data-cls-save]'); await page.waitForSelector('[data-cls-project]', { state: 'detached' }); await settled();
  await pick([W[3].key]);
  c = await cls();
  ok(Object.keys(c.codes).join() === 'uniclass,uniformat' && c.codes.uniclass === 'Ss_25_10_32' && c.from.uniclass === 'type' && c.lists.uniformat === 2, 'saved: Properties now shows the two systems the project uses; UniFormat has the office\'s 2 codes', c);
  await page.fill('[data-cls-code="uniformat"]', 'Z90');
  const oh = await page.evaluate(() => [...document.querySelectorAll('[data-cls-hits="uniformat"] [data-cls-hit]')].map((b) => b.dataset.clsHit));
  ok(oh.join() === 'Z9010,Z9020', 'the office table is searched like a bundled one', oh);
  await page.keyboard.press('Escape');
  // defaults: the door has no code of its own and its type none: EF_25_30 by class
  const doorKey = await page.evaluate(() => { const S = window.bimcraftPlan.state; return window.bimcraftRes.api.kb() + S.data.openings[0].id; });
  await pick([doorKey]);
  c = await cls();
  ok(c.codes.uniclass === 'EF_25_30' && c.from.uniclass === 'default' && c.titles.uniclass === 'Doors and windows', 'default codes by class: the door shows EF_25_30 Doors and windows as the project default, with nobody typing it', c);
  // a new wall of another type gets the wall default
  await page.evaluate(async () => { const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js'); const A = window.bimcraftRes.api; A.commit(OPS.drawWalls({ storey: A.S.data.levels[0].guid, segs: [{ a: [3000, 0], b: [3000, 4000] }], typeKey: 'int-2x4', height: 2700 }), { label: 'Wall', verb: 'Drew' }); });
  await settled();
  W = await walls();
  const part = W.find((w) => w.typeKey === 'int-2x4');
  await pick([part.key]);
  c = await cls();
  ok(c.codes.uniclass === 'EF_25_10' && c.from.uniclass === 'default', 'a wall drawn afterwards gets the default EF_25_10');
  // schedules
  const schedKind = async (k) => { await page.evaluate((k) => { const s = document.querySelector('[data-msched-kind]'); s.value = k; s.dispatchEvent(new Event('change', { bubbles: true })); }, k); await page.waitForTimeout(300); };
  await schedKind('doors');
  const sched = await page.evaluate(() => { const t = document.querySelector('[data-msched] table'); return t ? { head: [...t.querySelectorAll('thead th')].map((x) => x.textContent), row: [...t.querySelectorAll('tbody tr:first-child td')].map((x) => x.textContent) } : null; });
  ok(sched && sched.head.slice(-2).join() === 'Uniclass,UniFormat' && sched.row.at(-2) === 'EF_25_30' && sched.row.at(-1) === '', 'the Doors schedule has a Uniclass and a UniFormat column: EF_25_30, and nothing where there is no code', sched);
  await schedKind('walls');
  const ws = await page.evaluate(() => [...document.querySelectorAll('[data-msched] table tbody tr')].map((r) => [...r.querySelectorAll('td')].map((x) => x.textContent)));
  ok(ws.some((r) => r.at(-2) === 'varies') && ws.some((r) => r.at(-2) === 'EF_25_10'), 'Walls by type: "varies" for the type whose walls differ, EF_25_10 for the partition type', ws.map((r) => r.slice(-2)));
  await shot('classify-3-schedule');

  console.log('== the saved file');
  const text = await saveText();
  ok(/IFCCLASSIFICATION\('NBS','v1\.6 \(31 July 2019\)',\$,'Uniclass 2015',\$,\$,\$\)|IFCCLASSIFICATION\('NBS',\$,\$,'Uniclass 2015',\$,\$,\$\)/.test(text) && /IFCCLASSIFICATIONREFERENCE\(\$,'EF_25_10','Walls',#\d+,\$,\$\)/.test(text) && /IFCCLASSIFICATIONREFERENCE\(\$,'B2010',\$,#\d+,\$,\$\)/.test(text) && /IFCCLASSIFICATIONREFERENCE\(\$,'21-02 20 10'/.test(text),
    'the IFC has an IfcClassification for the system and an IfcClassificationReference for each code (Uniclass with its title, the typed UniFormat and OmniClass codes)', (text.match(/IFCCLASSIFICATION\([^;]*/g) || []).slice(0, 3));
  const rels = (text.match(/IFCRELASSOCIATESCLASSIFICATION\([^;]*/g) || []);
  ok(rels.length >= 5 && rels.some((r) => /'CadCraft default'/.test(r)) && rels.some((r) => !/'CadCraft default'/.test(r)), rels.length + ' IfcRelAssociatesClassification relations: typed codes, and the defaults (named "CadCraft default")');
  ok(!/Z9010|Test walls, exterior/.test(text), 'the office\'s own table is not in the project file (only codes that were assigned would be)');

  // ============================================================================================ BK.97
  console.log('== BK.97 type packs: save');
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftRes.api;
    A.commit(OPS.saveWallAssembly({ version: 1, key: 'wall-browser-cavity', name: 'Browser cavity wall', exterior: true, lod: 300, layers: [
      { mat: 'brick', t: 102.5, function: 'finish', core: false, priority: 250 }, { mat: 'air', kind: 'cavity', t: 50, function: 'finish', core: false, ventilation: 'ventilated' },
      { mat: 'insulation', t: 100, function: 'insulation', core: false }, { mat: 'block', t: 100, function: 'structure', core: true }, { mat: 'plaster', t: 13, function: 'finish', core: false }] }), { label: 'Type', verb: 'Changed' });
  });
  await settled();
  await page.evaluate(async () => { const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js'); const A = window.bimcraftRes.api; A.commit(OPS.drawWalls({ storey: A.S.data.levels[0].guid, segs: [{ a: [0, 8000], b: [6000, 8000] }], typeKey: 'wall-browser-cavity', height: 2700 }), { label: 'Wall', verb: 'Drew' }); });
  await settled();
  W = await walls();
  const cav = W.find((w) => w.typeKey === 'wall-browser-cavity');
  await pick([cav.key]);
  await page.selectOption('[data-cls-target]', 'type');
  await typeCode('uniclass', 'Ss_25_13_50');
  await page.click('[data-data-tools] > summary'); await page.click('[data-typepack-open]'); await page.waitForSelector('[data-tp]');
  const tp = await page.evaluate(() => [...document.querySelectorAll('[data-tp-type]')].map((b) => ({ key: b.dataset.tpType, on: b.checked, text: b.closest('li').textContent })));
  ok(tp[0].key === 'wall-browser-cavity' && tp[0].on && /Browser cavity wall/.test(tp[0].text) && /366/.test(tp[0].text) && tp.filter((x) => x.on).length === 1 && tp.some((x) => x.key === 'ext-2x6' && !x.on && /starter type/.test(x.text)),
    'the Type packs dialog lists the project\'s wall type ticked (shown as 366: 365.5 mm rounded by the page) and the starter types unticked', tp.slice(0, 2));
  await page.fill('[data-tp-name]', 'Browser pack');
  await shot('typepack-1-save');
  const j = await download('[data-tp-save-json]');
  const pack = JSON.parse(j.bytes.toString('utf8'));
  ok(j.name === 'Browser pack.cctypes.json' && pack.format === 'cadcraft-type-pack' && pack.version === 1 && pack.types.length === 1 && pack.types[0].recipe.layers.length === 5 && pack.types[0].thickness === 365.5 && pack.types[0].recipe.lod === 300 && pack.types[0].recipe.layers[0].priority === 250
    && pack.types[0].classification?.uniclass?.code === 'Ss_25_13_50' && pack.materials.length === 4 && pack.types[0].ifc.class === 'IfcWallType',
    'Save as a pack downloads "Browser pack.cctypes.json": one IfcWallType, 5 layers, 365.5 mm, LOD 300, the layer priority, its Uniclass code, its 4 materials', [j.name, pack.types?.[0]?.thickness, pack.materials?.length]);
  const f = await download('[data-tp-save-ifc]');
  const ifc = f.bytes.toString('utf8');
  ok(f.name === 'Browser pack.ifc' && /IFCPROJECTLIBRARY\(/.test(ifc) && (ifc.match(/IFCWALLTYPE\(/g) || []).length === 1 && /IFCMATERIALLAYERSET\(/.test(ifc) && /IFCCLASSIFICATIONREFERENCE\(\$,'Ss_25_13_50'/.test(ifc) && !/IFCWALL\(/.test(ifc),
    'Save as IFC downloads "Browser pack.ifc": an IfcProjectLibrary with the IfcWallType, its IfcMaterialLayerSet and its classification reference, and no wall', f.name);
  await page.click('[data-tp-close]');

  console.log('== BK.97 type packs: add to an empty project');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await newModel('Empty');
  const openPack = async () => { await page.evaluate(() => { const d = document.querySelector('[data-data-tools]'); d.open = true; }); await page.click('[data-typepack-open]'); await page.waitForSelector('[data-tp]'); };
  await openPack();
  ok((await page.evaluate(() => [...document.querySelectorAll('[data-tp-type]')].filter((b) => b.checked).length)) === 0 && await page.evaluate(() => document.querySelector('[data-tp-import]').disabled), 'the empty project has no type of its own; Add to the project waits for a file');
  await page.setInputFiles('[data-tp-file]', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...pack, vendorBlob: 'AAAA' })) });
  await page.waitForFunction(() => document.querySelector('[data-tp-error]').textContent.length > 0);
  const bad = await page.evaluate(() => document.querySelector('[data-tp-error]').textContent);
  ok(/This is not a type pack the app can read\. vendorBlob: is not part of the format/.test(bad) && await page.evaluate(() => document.querySelector('[data-tp-import]').disabled), 'a pack with a field the format does not have is refused in plain words', bad);
  await page.setInputFiles('[data-tp-file]', { name: j.name, mimeType: 'application/json', buffer: j.bytes });
  await page.waitForSelector('[data-tp-found]:not([hidden])');
  const found = await page.evaluate(() => document.querySelector('[data-tp-found]').textContent.replace(/\s+/g, ' '));
  ok(/1 wall types, 4 materials, 0 families/.test(found) && /Browser cavity wall/.test(found) && /Ss_25_13_50/.test(found) && /5 layers/.test(found), 'opening the pack shows what it holds before anything is added', found);
  await page.click('[data-tp-import]'); await page.waitForSelector('[data-tp-result]:not([hidden])'); await settled();
  const did = await page.evaluate(() => [...document.querySelectorAll('[data-tp-did]')].map((x) => [x.dataset.tpDid, x.dataset.n, x.textContent]));
  ok(did.some((d) => d[0] === 'added' && d[1] === '1' && /Browser cavity wall/.test(d[2])), 'Add to the project: "Added (1): Browser cavity wall"', did);
  await shot('typepack-2-added');
  await page.click('[data-tp-close]');
  const back = await page.evaluate(async () => {
    const TP = await import('/assets/apps/bimcraft/dev/type-pack.js'); const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js');
    const ed = window.bimcraftRes.api.ed(); return TP.makeTypePack(new ModelWriter(ed.W, ed.api, ed.mid), { name: 'Browser pack', now: new Date('2026-11-11T00:00:00Z') });
  });
  const strip = (p) => JSON.stringify({ ...p, made: '' });
  ok(strip(back) === strip(pack), 'exported again from the second project, the pack is the same as the one saved from the first (layers, thicknesses, materials, priority, LOD, code)');
  // draw with it
  await page.evaluate(async () => { const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js'); const A = window.bimcraftRes.api; A.commit(OPS.drawWalls({ storey: A.S.data.levels[0].guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'wall-browser-cavity', height: 2700 }), { label: 'Wall', verb: 'Drew' }); });
  await settled();
  W = await walls();
  await pick([W[0].key]);
  c = await cls();
  ok(Math.abs(W[0].t - 365.5) < 0.01 && c.codes.uniclass === 'Ss_25_13_50' && c.from.uniclass === 'type', 'a wall drawn with the imported type is 365.5 mm thick and shows the type\'s Uniclass code in Properties', [W[0].t, c]);
  // the IFC form, as a copy beside the one already there
  await openPack();
  await page.setInputFiles('[data-tp-file]', { name: f.name, mimeType: 'application/x-step', buffer: f.bytes });
  await page.waitForSelector('[data-tp-found]:not([hidden])', { timeout: 60000 });
  await page.selectOption('[data-tp-conflict]', 'copy');
  await page.click('[data-tp-import]'); await page.waitForSelector('[data-tp-result]:not([hidden])'); await settled();
  const did2 = await page.evaluate(() => [...document.querySelectorAll('[data-tp-did]')].map((x) => [x.dataset.tpDid, x.dataset.n, x.textContent]));
  ok(did2.some((d) => d[0] === 'copied' && d[1] === '1' && /Browser cavity wall \(2\)/.test(d[2])), 'the IFC file opens as a pack too; added as a copy it becomes "Browser cavity wall (2)"', did2);
  await page.click('[data-tp-close]');
  await page.click('[data-act="undo"]'); await settled();
  const n = await page.evaluate(async () => { const TP = await import('/assets/apps/bimcraft/dev/type-pack.js'); const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const ed = window.bimcraftRes.api.ed(); return TP.wallTypeChoices(new ModelWriter(ed.W, ed.api, ed.mid)).filter((x) => x.custom).length; });
  ok(n === 1, 'Undo takes the copy away in one step');

  // ============================================================================================ BK.96
  console.log('== BK.96 a placed Library item keeps its class');
  const placedCls = await page.evaluate(async () => {
    const A = window.bimcraftRes.api, ed = A.ed(), L1 = A.S.data.levels[0];
    const item = { format: 'cadcraft-library-item', format_version: 1, uuid: '0b9a4d6e-1c2f-4a8b-9d3e-5f6a7b8c9d77', version: 1, name: 'Test boiler', kind: 'equipment', category: 'mechanical/equipment', description: '', maker: '', model: '',
      ifc: { class: 'IfcBoiler', predefined: 'WATER' }, plan: { layers: [{ name: 'A', color: 7 }], entities: [{ type: 'poly', layer: 'A', color: null, closed: true, pts: [[-300, -300], [300, -300], [300, 300], [-300, 300]] }] },
      body: { type: 'box', x: -300, y: -300, z: 0, w: 600, d: 600, h: 900 }, clearances: [], params: { width: 600, depth: 600, height: 900 }, source_attrs: {}, license: { id: 'CC0-1.0' }, provenance: { library: 'test', sha256: null, published_at: null } };
    const L = await import('/assets/apps/bimcraft/dev/libitem.js');
    const noClass = { ...item }; delete noClass.ifc;
    const r = ed.placeItem(item, { storey: L1.id, x: 2000, y: 2000, rot: 0, itemNumber: '1', quantity: 1 });
    return { cls: ed.api.GetLine(ed.mid, r.id, false).constructor.name, ok: L.validateItem(item).ok, refused: L.validateItem(noClass).errors.find((e) => e.startsWith('ifc')) || '' };
  });
  ok(placedCls.cls === 'IfcBoiler' && placedCls.ok && /^ifc: is required: every item placed in a drawing or model names its IFC class/.test(placedCls.refused), 'in the page: the item checker refuses an item with no class in plain words, and an IfcBoiler from a library is placed as an IfcBoiler', placedCls);

  const real = problems.filter((p) => !/429|hardware|favicon/i.test(p));
  ok(real.length === 0, 'no page errors', real.slice(0, 4));
} catch (e) {
  fail++; console.log('  FAIL the run stopped: ' + e.message.split('\n')[0]);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
  console.log(problems.slice(0, 6).join('\n'));
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
