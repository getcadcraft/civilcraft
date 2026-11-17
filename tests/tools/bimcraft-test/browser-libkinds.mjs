#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-libkinds.mjs: 0.10 BK.21 (Symbols / Types / Assets in the picker, a Type added to the project), BK.98 (a project template and a Quick Kit
 * from the Library, a template shared as a Library file), BK.154 (a kit's changelog newest first) in the real page, /lab, headless (bk-r3-library-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-libkinds.mjs [--shots <dir>]      run as root (a test admin session)
 * The Library API is answered by the test (page.route) so no item is written to the real Library; the file buttons and every dialog are the real ones.
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
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d).slice(0, 600) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimlibkinds'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
page.on('console', (m) => { if (m.type() === 'error' && !/the server responded with a status of 4\d\d/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const requests = [];
page.on('request', (r) => { if (r.url().includes('/api/v1/library/items')) requests.push(r.url()); });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const status = () => page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
const download = async (fn) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); return { name: dl.suggestedFilename(), text: fs.readFileSync(await dl.path(), 'utf8') }; };

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); indexedDB.deleteDatabase('bimcraft-templates'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new], [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Kinds'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();

  console.log('== the items the test Library answers with');
  const made = await page.evaluate(async () => {
    const L = await import('/assets/apps/bimcraft/dev/libitem.js');
    const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js');
    const ed = window.bimcraftRes.api.ed();
    const w = new ModelWriter(ed.W, ed.api, ed.mid);
    const TLI = await import('/assets/apps/bimcraft/dev/type-library-item.js');
    const type = { item: TLI.typeToLibraryItem(w, 'ext-2x6', { name: 'Library wall 2x6' }) }; type.ok = L.validateItem(type.item, { partial: true }).ok; type.errors = L.validateItem(type.item, { partial: true }).errors;
    const ifc = new TextDecoder().decode(ed.save());
    const uuid = (n) => '00000000-0000-4000-8000-00000000000' + n;
    const tpl = L.kitItem({ type: 'project-template', name: 'Office start', app: 'bimcraft', summary: 'Levels and wall types', ifcText: ifc, version: '0.2.0', added: ['Second storey'] });
    tpl.item.kit.changelog.push({ version: '0.1.0', date: '2026-10-01', added: ['First version'] });
    const qk = L.kitItem({ type: 'quick-kit', name: 'Office kit', apps: ['bimcraft'], members: [{ uuid: uuid(7), name: 'Library table' }] });
    const tbl = { format: 'cadcraft-library-item', format_version: 1, name: 'Library table', kind: 'furniture', category: 'furniture/tables', ifc: { class: 'IfcFurniture' }, lod: 300, classification: [{ system: 'uniclass', code: 'Pr_40_50_30' }],
      plan: { layers: [{ name: 'A', color: 7 }], entities: [{ type: 'poly', layer: 'A', color: null, pts: [[0, 0], [1200, 0], [1200, 800], [0, 800]], closed: true }] }, body: { type: 'box', x: 0, y: 0, z: 0, w: 1200, d: 800, h: 750 }, params: { width: 1200, depth: 800, height: 750 } };
    return { type: type.item, typeOk: type.ok, typeErrors: type.errors, tpl: tpl.item, tplOk: tpl.ok, qk: qk.item, qkOk: qk.ok, tbl, uuids: { type: uuid(1), tpl: uuid(2), qk: uuid(3), tbl: uuid(7) } };
  });
  ok(made.typeOk && made.tplOk && made.qkOk, 'the three items are made by typeToLibraryItem / kitItem and pass the checker', made.typeErrors);
  const store = {
    [made.uuids.type]: { ...made.type, uuid: made.uuids.type, version: 1, license: { id: 'CC0-1.0' } },
    [made.uuids.tpl]: { ...made.tpl, uuid: made.uuids.tpl, version: 1, license: { id: 'CC0-1.0' } },
    [made.uuids.qk]: { ...made.qk, uuid: made.uuids.qk, version: 1, license: { id: 'CC0-1.0' } },
    [made.uuids.tbl]: { ...made.tbl, uuid: made.uuids.tbl, version: 1, license: { id: 'CC0-1.0' } },
  };
  const summary = (u) => { const i = store[u]; return { uuid: u, slug: 'x-' + u.slice(-1), name: i.name, kind: i.kind, class: '', category: i.category, maker: '', model: '', license: 'CC0-1.0', version: 1, preview_url: null, item_url: '/api/v1/library/items/' + u + '/1/item.json', visibility: 'public', stretch: [] }; };
  const json = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', message: '', data }) });
  await page.route('**/api/v1/library/items**', async (route) => {
    const url = new URL(route.request().url());
    const m = /\/items\/([0-9a-f-]{36})(?:\/(\d+)\/item\.json)?$/.exec(url.pathname);
    if (m && m[2]) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(store[m[1]]) });
    if (m) return route.fulfill(json({ item: { ...summary(m[1]), versions: [{ version: 1, status: 'published', item_url: '/api/v1/library/items/' + m[1] + '/1/item.json', license: 'CC0-1.0' }] } }));
    const kind = url.searchParams.get('kind'), cls = url.searchParams.get('class');
    let list = [];
    if (kind === 'kit') list = [made.uuids.tpl, made.uuids.qk];
    else if (cls === 'type') list = [made.uuids.type];
    else if (cls === 'asset') list = [made.uuids.tbl];
    else list = [made.uuids.tbl];
    return route.fulfill(json({ items: list.map(summary), page: 1, per: 24, total: list.length }));
  });

  console.log('== the picker: Symbols, Types, Assets');
  await page.click('[data-rtab="library"]');
  await page.evaluate(() => window.bimcraftLibrary.setSource('librarycraft'));
  await page.waitForSelector('[data-lib-class]');
  const opts = await page.$$eval('[data-lib-class] option', (o) => o.map((x) => [x.value, x.textContent]));
  ok(JSON.stringify(opts) === JSON.stringify([['', 'Everything'], ['symbol', 'Symbols'], ['type', 'Types'], ['asset', 'Assets']]), 'a class choice with Everything, Symbols, Types, Assets', opts);
  await shot('picker');
  requests.length = 0;
  await page.selectOption('[data-lib-class]', 'type');
  await page.waitForSelector('[data-lib-card]');
  ok(requests.some((u) => /[?&]class=type\b/.test(u)), 'choosing Types asks the Library for class=type', requests);
  ok((await page.$$eval('[data-lib-card] .bc-lib-name', (e) => e.map((x) => x.textContent))).join() === 'Library wall 2x6', 'the Type is listed');
  await page.selectOption('[data-lib-class]', 'asset');
  await page.waitForFunction(() => document.querySelector('[data-lib-card] .bc-lib-name')?.textContent === 'Library table');
  ok(requests.some((u) => /[?&]class=asset\b/.test(u)), 'choosing Assets asks for class=asset');

  console.log('== a Type is added to the project');
  await page.selectOption('[data-lib-class]', 'type');
  await page.waitForFunction(() => document.querySelector('[data-lib-card] .bc-lib-name')?.textContent === 'Library wall 2x6');
  const before = await page.evaluate(async () => { const WA = await import('/assets/apps/bimcraft/dev/wall-assemblies.js'); const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const ed = window.bimcraftRes.api.ed(); return WA.readAssemblies(new ModelWriter(ed.W, ed.api, ed.mid)).length; });
  await page.click('[data-lib-card]');
  await page.waitForSelector('[data-lib-type-add]');
  ok(!(await page.$('[data-lib-place]')), 'a Type has no Place button (it is not drawn, it is added)');
  ok((await page.textContent('.bc-lib-detail dl')).includes('Build-up'), 'its facts say the build-up');
  await shot('type-detail');
  await page.click('[data-lib-type-add]');
  await settled();
  const after = await page.evaluate(async () => { const WA = await import('/assets/apps/bimcraft/dev/wall-assemblies.js'); const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const ed = window.bimcraftRes.api.ed(); return WA.readAssemblies(new ModelWriter(ed.W, ed.api, ed.mid)).map((x) => x.name); });
  ok(after.length === before + 1, 'the project has one more wall type', { before, after });
  ok(/Added the type/.test(await status()), 'the status line says so', await status());

  console.log('== Kits: a project template and a Quick Kit');
  await page.evaluate(() => window.bimcraftLibrary.setSource('kits'));
  await page.waitForFunction(() => document.querySelectorAll('[data-lib-card]').length === 2);
  ok(requests.some((u) => /[?&]kind=kit\b/.test(u)), 'the Kits source asks for kind=kit');
  ok(!!(await page.$('[data-lib-kit-make]')), 'the Kits source offers "Make a Quick Kit from this project"');
  await page.click('[data-lib-kit-make]');
  ok(/uses no Library items yet/.test(await status()), 'with no Library item in the project it says there is nothing to put in a kit', await status());
  await page.evaluate(() => { const c = [...document.querySelectorAll('[data-lib-card]')].find((x) => /Office start/.test(x.textContent)); c.click(); });
  await page.waitForSelector('[data-lib-kit-template]');
  const cl = await page.textContent('[data-lib-changelog]');
  ok(cl.indexOf('0.2.0') > -1 && cl.indexOf('0.2.0') < cl.indexOf('0.1.0') && /Second storey/.test(cl), 'the changelog is there, newest first (0.2.0 above 0.1.0)', cl);
  ok((await page.textContent('.bc-lib-detail dl')).includes('0.2.0'), 'the kit version shows in its facts');
  await page.click('[data-lib-kit-template]');
  await page.waitForFunction(() => /Saved/.test(document.querySelector('[data-status]')?.textContent || ''));
  const tpls = await page.evaluate(async () => (await import('/assets/apps/bimcraft/dev/template-store.js')).listTemplates());
  ok(tpls.length === 1 && tpls[0].name === 'Office start', 'the template is in "my templates"', tpls);
  const bytes = await page.evaluate(async () => { const S = await import('/assets/apps/bimcraft/dev/template-store.js'); const r = await S.getTemplate((await S.listTemplates())[0].id); return new TextDecoder().decode(new Uint8Array(r.bytes)).slice(0, 14); });
  ok(bytes.startsWith('ISO-10303-21;'), 'and it is the IFC text from the item', bytes);
  await page.evaluate(() => window.bimcraftLibrary.setSource('kits'));
  await page.waitForFunction(() => document.querySelectorAll('[data-lib-card]').length === 2);
  await page.evaluate(() => { const c = [...document.querySelectorAll('[data-lib-card]')].find((x) => /Office kit/.test(x.textContent)); c.click(); });
  await page.waitForSelector('[data-lib-kit-items]');
  await page.click('[data-lib-kit-items]');
  await page.waitForFunction(() => document.querySelectorAll('[data-lib-card]').length === 1);
  ok((await page.textContent('[data-lib-card] .bc-lib-name')) === 'Library table', 'a Quick Kit shows the items it brings as cards');
  await page.click('[data-lib-card]');
  await page.waitForSelector('[data-lib-place]');
  ok(true, 'and each opens as an item that can be placed');
  await shot('kit-items');

  console.log('== a template shared as a Library file');
  await page.evaluate(() => window.bimcraftLibrary.setSource('symbols'));
  await page.evaluate(() => document.querySelector('[data-tpl-save]').click());   // the button is in the File menu: same handler as the command file.saveTemplate
  await page.waitForSelector('[data-tpl-dialog]');
  ok((await page.isHidden('[data-tpl-sharebox]')), 'the sharing fields are hidden until asked for');
  await page.check('[data-tpl-share]');
  ok(await page.isVisible('[data-tpl-sharebox]'), 'ticking "Also make a file to share in the Library" shows summary and version');
  await page.fill('[data-tpl-name]', 'Shared start'); await page.fill('[data-tpl-summary]', 'One level');
  await shot('template-share');
  const f1 = await download(() => page.click('[data-tpl-ok]'));
  const j1 = JSON.parse(f1.text);
  ok(/\(Library template\)\.json$/.test(f1.name) && j1.kind === 'kit' && j1.category === 'kits/templates' && j1.kit.type === 'project-template' && j1.kit.version === '0.1.0' && j1.kit.file.data.startsWith('ISO-10303-21;') && j1.kit.summary === 'One level' && !j1.license && !j1.uuid,
    'the file is a format-1 kit item: IFC text, version 0.1.0, no licence or uuid (the Library asks for the licence when it is uploaded)', { name: f1.name, kit: { ...j1.kit, file: '…' } });

  console.log('== types as Library files');
  await page.evaluate(() => { document.querySelector('[data-data-tools]').open = true; });
  await page.click('[data-typepack-open]');
  await page.waitForSelector('[data-tp]');
  for (const b of await page.$$('[data-tp-type]')) await b.uncheck();   // the type added from the Library above is ticked by default
  await page.check('[data-tp-type="ext-2x6"]');
  const f2 = await download(() => page.click('[data-tp-save-item]'));
  const j2 = JSON.parse(f2.text);
  ok(/\.cctype\.json$/.test(f2.name) && j2.kind === 'type' && j2.ifc.class === 'IfcWallType' && j2.type.pack.types.length === 1 && j2.type.layers === j2.type.pack.types[0].recipe.layers.length, 'a ticked type as a Library file: kind type, IfcWallType, the one-type pack', { name: f2.name, type: j2.type && { ...j2.type, pack: '…' } });
  await shot('type-library-file');
} catch (e) {
  fail++; console.log('  FAIL exception: ' + (e && e.stack || e));
}
ok(problems.length === 0, 'no console errors or page errors', problems);
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
