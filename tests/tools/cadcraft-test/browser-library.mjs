#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-library.mjs — CadCraft's library panel, attributes and INSERT F in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-library.mjs [--shots <dir>] [--live]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium.
 * Unless --live, /api/v1/library/* is answered by a stand-in that speaks docs/LIBRARY-SPEC.md §6 (the
 * real API may not be up); --live talks to the site's own API and only needs one published item.
 * Checks: Blocks panel "Library…" opens the panel, cards render (license badge, version), Place → INSERT L
 * → click → item number → the LIB_ block with its attributes; Properties edits an attribute (one undo
 * step); Check for updates → Update redefines the block; Library credits; Files… with an item.json;
 * ?library=<uuid>; INSERT F with a DXF (block dialog); no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const LIVE = args.includes('--live');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const APP = path.join(REPO, 'public_html/assets/apps/cadcraft/dev/');
const { Doc } = await import(pathToFileURL(APP + 'doc.js').href);
const { writeDxf } = await import(pathToFileURL(APP + 'dxf.js').href);
const { attdef } = await import(pathToFileURL(APP + 'attrs.js').href);

const UUID = '3f2b8c1e-7d4a-4b6e-9a51-0c2d3e4f5a6b';
const item = (version, w) => ({
  format: 'cadcraft-library-item', format_version: 1, uuid: UUID, version, name: 'Generic work table, 30 × 72 in', kind: 'equipment', category: 'foodservice/worktables',
  description: 'Stand-in item for the browser check.', maker: '', model: '', ifc: { class: 'IfcFurnishingElement', predefined: 'NOTDEFINED' },
  plan: { layers: [{ name: 'EQUIP', color: 7 }], entities: [
    { type: 'poly', layer: 'EQUIP', color: null, pts: [[-w / 2, -381], [w / 2, -381], [w / 2, 381], [-w / 2, 381]], closed: true },
    { type: 'line', layer: 'EQUIP', color: null, x1: -w / 2 + 50, y1: 300, x2: w / 2 - 50, y2: 300 },
    { type: 'circle', layer: 'EQUIP', color: null, x: -w / 2 + 60, y: -320, r: 25 }, { type: 'circle', layer: 'EQUIP', color: null, x: w / 2 - 60, y: -320, r: 25 },
  ] },
  body: { type: 'box', x: -w / 2, y: -381, z: 0, w, d: 762, h: 864 }, clearances: [],
  params: { width: w, depth: 762, height: 864, weight_kg: 0, elec: {}, plumb: {}, remarks: '' }, source_attrs: {},
  license: { id: 'CC0-1.0', holder: 'CadCraft', attribution: '“Generic work table” by CadCraft, CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  provenance: { library: 'librarycraft', item: UUID, version, sha256: 'cd'.repeat(32), source_file: 'seed.csv', published_at: '2026-10-10T00:00:00Z' },
});
const preview = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-950 -400 1900 800"><rect x="-914" y="-381" width="1828" height="762" fill="none" stroke="#000" stroke-width="12"/><line x1="-864" y1="-300" x2="864" y2="-300" stroke="#000" stroke-width="8"/></svg>';
const listEntry = { uuid: UUID, slug: 'generic-work-table-30x72', name: 'Generic work table, 30 × 72 in', kind: 'equipment', category: 'foodservice/worktables', maker: '', model: '', license: 'CC0-1.0', version: 1, preview_url: '/api/v1/library/items/' + UUID + '/1/preview.svg', item_url: '/api/v1/library/items/' + UUID + '/1/item.json', updated_at: '2026-10-10T00:00:00Z', visibility: 'public' };
const withdrawnEntry = { ...listEntry, uuid: '9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d', slug: 'old-sink', name: 'Old sink (withdrawn test)', license: 'CC-BY-4.0', preview_url: null };
const seen = { uses: 0, updates: 0 };

// a DXF with a block for INSERT F
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-lib-'));
const dxfPath = path.join(tmp, 'Kitchen parts.dxf');
{
  const s = new Doc();
  s.meta.units = 'inches';
  s.change('seed', () => {
    s.defineBlock({ name: 'Floor sink', base: { x: 0, y: 0 }, entities: [{ type: 'poly', layer: '0', color: null, closed: true, pts: [{ x: -6, y: -6, b: 0 }, { x: 6, y: -6, b: 0 }, { x: 6, y: 6, b: 0 }, { x: -6, y: 6, b: 0 }] }, { type: 'circle', layer: '0', color: null, cx: 0, cy: 0, r: 3 }],
      attdefs: [attdef({ x: 0, y: 8, h: 3, ha: 'center', va: 'baseline' }, { tag: 'TAG', prompt: 'Floor sink tag', def: 'FS-1' })] });
    s.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 120, y2: 0 });
  });
  fs.writeFileSync(dxfPath, writeDxf(s).text);
}
const itemPath = path.join(tmp, 'item.json');
fs.writeFileSync(itemPath, JSON.stringify({ ...item(1, 1829), uuid: '5d6e7f80-1a2b-4c3d-9e4f-5a6b7c8d9e0f', name: 'Hand sink from a file', category: 'plumbing/fixtures', license: { id: 'CC-BY-4.0', holder: 'Jane Maker', attribution: '“Hand sink” by Jane Maker, CC BY 4.0', url: '' } }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });   // the stand-in API must see every request
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });

if (!LIVE) {
  await ctx.route((url) => url.pathname.startsWith('/api/v1/library/'), async (route) => {
    const req = route.request(), u = new URL(req.url()), p = u.pathname.replace('/api/v1/library', '');
    const json = (code, body) => route.fulfill({ status: code, contentType: 'application/json', body: JSON.stringify(body) });
    if ((req.headers().authorization || '') === 'Bearer ccu_' + 'X'.repeat(40)) { seen.expired = (seen.expired || 0) + 1; return json(401, { status: 'error', message: 'Invalid token.', code: 'invalid_token' }); }
    if (p === '/items') {
      const q = (u.searchParams.get('q') || '').toLowerCase();
      const items = [listEntry, withdrawnEntry].filter((x) => !q || x.name.toLowerCase().includes(q));
      return json(200, { status: 'success', message: '', data: { items, page: 1, per: 48, total: items.length } });
    }
    if (p === '/items/' + UUID) return json(200, { status: 'success', message: '', data: { item: { ...listEntry, description: 'x', author: { uuid: UUID, name: 'CadCraft' }, versions: [{ version: 2, status: 'published', change_kind: 'geometry', changelog: '60 in', license: 'CC0-1.0', published_at: '2026-10-11T00:00:00Z', item_url: '', preview_url: listEntry.preview_url, source_url: null, withdrawn_reason: null }, { version: 1, status: 'published', change_kind: 'geometry', license: 'CC0-1.0' }] } } });
    const m = p.match(/^\/items\/([0-9a-f-]+)\/(\d+)\/(item\.json|preview\.svg)$/);
    if (m && m[3] === 'preview.svg') return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: preview });
    if (m && m[1] === UUID) return json(200, item(+m[2], +m[2] === 1 ? 1828.8 : 1524));
    if (m) return json(200, { ...item(1, 1200), uuid: m[1], name: 'Old sink (withdrawn test)' });
    if (p === '/updates' && req.method() === 'POST') {
      seen.updates++;
      const body = JSON.parse(req.postData() || '{}');
      return json(200, { status: 'success', message: '', data: { results: (body.items || []).map((x) => (x.uuid === UUID && x.version === 1 ? { uuid: x.uuid, version: 1, latest: 2, status: 'newer', change_kinds: ['geometry'], license_changed: false, withdrawn_reason: null } : { uuid: x.uuid, version: x.version, latest: x.version, status: 'current', change_kinds: [], license_changed: false, withdrawn_reason: null })) } });
    }
    if (p === '/uses' && req.method() === 'POST') { seen.uses++; seen.useAuth = req.headers().authorization || ''; return json(200, { status: 'success', message: '', data: { id: 1 } }); }
    return json(404, { status: 'error', message: 'Not found.' });
  });
}

// (routes first: a page made before them does not see them)
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const cc = (fn, arg) => page.evaluate(fn, arg);
const prompt = () => page.textContent('[data-prompt]');
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(120); };
const stageClick = async (fx, fy) => { const b = await page.locator('[data-over]').boundingBox(); await page.mouse.click(b.x + b.width * fx, b.y + b.height * fy); await page.waitForTimeout(150); };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await cc(() => { const { doc } = window.cadcraft; doc.meta.units = 'inches'; doc.change('seed', () => { doc.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 240, y: 0, b: 0 }, { x: 240, y: 144, b: 0 }, { x: 0, y: 144, b: 0 }] }); }); window.cadcraft.view.fit(); });


  if (LIVE) {
    // The site's own API: no stand-in, real seeded items.
    console.log('\n== live API');
    const api = await cc(() => fetch('/api/v1/library/items?per=48').then((r) => r.json()));
    const total = api.data.items.length;
    await page.click('[data-library]');
    await page.waitForSelector('dialog[data-lib][open] .cc-lib-card');
    ok(await page.locator('.cc-lib-card').count() === total && total > 0, 'the panel lists every published item the API returns (' + total + ')');
    // the cards' previews load lazily: with more items than fit (136 since the standard parts), make them all load now
    await cc(() => { for (const i of document.querySelectorAll('.cc-lib-card .cc-lib-prev img')) i.loading = 'eager'; });
    await page.waitForFunction(() => [...document.querySelectorAll('.cc-lib-card .cc-lib-prev img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {});
    const imgs = await page.$$eval('.cc-lib-card .cc-lib-prev img', (l) => l.map((i) => ({ w: i.naturalWidth, h: i.naturalHeight })));
    ok(imgs.length === total && imgs.every((i) => i.w === 480 && i.h === 360), 'every live card shows its drawn preview.svg (480×360 tile)', JSON.stringify(imgs.slice(0, 3)));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '06a-live-panel.png') });
    // signing in reloads the list with the token; the library refuses it (401)
    await cc(() => window.postMessage({ type: 'cadcraft-library-token', app: 'cadcraft', token: 'ccu_' + 'X'.repeat(40) }, location.origin));
    await page.waitForTimeout(800);
    const dropped = { cards: await page.locator('.cc-lib-card').count(), said: (await page.textContent('dialog[data-lib]')).includes('sign-in has ended'), token: await cc(() => sessionStorage.getItem('cadcraft.library.token')) };
    ok(dropped.cards === total && dropped.said && dropped.token === null,
      'a token the library refuses is dropped; public items still load and the panel says the sign-in ended', JSON.stringify(dropped));
    const first = api.data.items[0];
    await page.locator('.cc-lib-card button:has-text("Place")').first().click();
    await page.waitForFunction(() => /insertion point/.test(document.querySelector('[data-prompt]').textContent));
    await stageClick(0.4, 0.45);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const lp = await cc(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'insert'); return e && { block: e.block, uuid: e.attrs['CC-ITEM-UUID'], ver: e.attrs['CC-ITEM-VER'], sha: e.attrs['CC-SHA256'] }; });
    ok(lp && lp.uuid === first.uuid && lp.ver === String(first.version) && /^LIB_.+_v\d+$/.test(lp.block) && /^[0-9a-f]{64}$/.test(lp.sha || ''), 'a live item places as a LIB_ block carrying its uuid, version and sha256', JSON.stringify(lp));
    await page.click('[data-library]');
    await page.click('dialog[data-lib] button:has-text("Check for updates")');
    await page.waitForTimeout(800);
    ok((await page.textContent('dialog[data-lib]')).includes('Up to date'), 'Check for updates against the live API: up to date');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '06-live.png') });
    ok(problems.filter((x) => !/401/.test(x)).length === 0, 'no console errors (the refused token\'s 401 aside)' + (problems.length ? ': ' + problems.join(' | ') : ''));
    throw 'live-done';
  }

  console.log('\n== library panel');
  await page.click('[data-library]');
  await page.waitForSelector('dialog[data-lib][open] .cc-lib-card');
  const cards = await page.locator('.cc-lib-card').count();
  ok(cards === 2, 'Blocks panel "Library…" opens the panel with the LibraryCraft cards (' + cards + ')');
  ok(await page.locator('.cc-lib-card .cc-lib-badge').first().textContent() === 'CC0' && (await page.locator('.cc-lib-card').first().textContent()).includes('Version 1'), 'card: license badge and version');
  await page.waitForFunction(() => { const i = document.querySelector('.cc-lib-card img'); return i && i.complete && i.naturalWidth > 0; });
  ok(true, 'the preview image loads');
  ok(await page.locator('.cc-lib-tabs, [role=tablist][aria-label="Library sources"] [role=tab]').count() === 4, 'sources: LibraryCraft, Files…, Standard (0.5 MQ.3/MQ.4), Other feeds');
  ok(await page.locator('dialog[data-lib] a:has-text("Sign in to the library")').count() === 1, '"Sign in to the library" link is offered');
  await page.fill('dialog[data-lib] input[type=search]', 'table');
  await page.click('dialog[data-lib] .cc-lib-search button[type=submit]');
  await page.waitForTimeout(300);
  ok(await page.locator('.cc-lib-card').count() === 1, 'search narrows the list');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-library-panel.png') });

  // an expired token: the stand-in answers 401, the panel drops it and lists the public items again
  await page.fill('dialog[data-lib] input[type=search]', '');
  await cc(() => window.postMessage({ type: 'cadcraft-library-token', app: 'cadcraft', token: 'ccu_' + 'X'.repeat(40) }, location.origin));
  await page.waitForTimeout(600);
  ok(seen.expired >= 1 && await page.locator('.cc-lib-card').count() === 2 && (await page.textContent('dialog[data-lib]')).includes('sign-in has ended') && await cc(() => sessionStorage.getItem('cadcraft.library.token')) === null,
    'a refused (expired) token is dropped and the public items load again');
  problems.splice(0, problems.length, ...problems.filter((x) => !/401/.test(x)));
  console.log('\n== place');
  // pretend to be signed in (the token as /library/connect would post it)
  await cc(() => window.postMessage({ type: 'cadcraft-library-token', app: 'cadcraft', token: 'ccu_' + 'T'.repeat(40) }, location.origin));
  await page.waitForTimeout(200);
  ok(await page.locator('dialog[data-lib] :text("Signed in to the library")').count() === 1 && await cc(() => sessionStorage.getItem('cadcraft.library.token')) === 'ccu_' + 'T'.repeat(40), 'a token posted from the same origin signs the panel in (sessionStorage)');
  await page.locator('.cc-lib-card button:has-text("Place")').first().click();
  await page.waitForFunction(() => /insertion point/.test(document.querySelector('[data-prompt]').textContent));
  ok(!(await page.locator('dialog[data-lib]').evaluate((d) => d.open)), 'Place closes the panel and INSERT asks for the insertion point');
  await stageClick(0.35, 0.45);
  ok(/Item number/.test(await prompt()), 'then the item number', await prompt());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const placed = await cc(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'insert'); return e && { block: e.block, attrs: e.attrs, id: e.id }; });
  ok(placed && placed.block === 'LIB_generic-work-table-3_v1' && placed.attrs['CC-ITEM'] === '1' && placed.attrs['CC-ITEM-UUID'] === UUID && placed.attrs['CC-LICENSE'] === 'CC0-1.0', 'the item is placed as block LIB_<slug>_v1 with its attributes', JSON.stringify(placed).slice(0, 300));
  await page.waitForTimeout(300);
  ok(seen.uses === 1 && seen.useAuth.startsWith('Bearer ccu_'), 'signed in: the use is registered (POST /uses with the Bearer token)');

  console.log('\n== attributes in Properties');
  await cc((id) => window.cadcraft.host.setSelection(new Set([id])), placed.id);
  await page.waitForSelector('[data-attr="CC-ITEM"]');
  ok(await page.locator('[data-props] .cc-att-ro').count() > 5 && (await page.textContent('[data-props]')).includes('“Generic work table” by CadCraft'), 'Properties lists the attributes; library fields read-only, attribution shown');
  const undoBefore = await cc(() => window.cadcraft.doc.undoStack.length);
  await page.fill('[data-attr="CC-ITEM"]', 'WT-3');
  await page.press('[data-attr="CC-ITEM"]', 'Enter');
  await page.waitForTimeout(200);
  const edited = await cc((id) => ({ v: window.cadcraft.doc.get(id).attrs['CC-ITEM'], n: window.cadcraft.doc.undoStack.length, label: window.cadcraft.doc.undoStack.at(-1).label }), placed.id);
  ok(edited.v === 'WT-3' && edited.n === undoBefore + 1 && edited.label === 'ATTRIBUTE', 'editing a value is one undo step', JSON.stringify(edited));
  if (SHOTS) { await cc(() => window.cadcraft.view.fit()); await page.waitForTimeout(200); await page.screenshot({ path: path.join(SHOTS, '02-placed-item.png') }); }
  await typeCmd('LIST');
  ok((await page.textContent('[data-history]')).includes('CC-ITEM = WT-3'), 'LIST shows the attributes');

  console.log('\n== updates and credits');
  await cc(() => window.cadcraft.host.setSelection(new Set()));
  await page.click('[data-library]');
  await page.click('dialog[data-lib] button:has-text("Check for updates")');
  await page.waitForSelector('dialog[data-lib] .cc-lib-rows button:has-text("Update")');
  ok((await page.textContent('dialog[data-lib] .cc-lib-rows')).includes('Version 2 is out (geometry)'), 'Check for updates: version 2 is out');
  await page.click('dialog[data-lib] .cc-lib-rows button:has-text("Update")');
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.block === 'LIB_generic-work-table-3_v2'));
  const up = await cc(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'insert'); return { block: e.block, num: e.attrs['CC-ITEM'], ver: e.attrs['CC-ITEM-VER'], old: window.cadcraft.doc.blocks.has('LIB_generic-work-table-3_v1') }; });
  ok(up.block.endsWith('_v2') && up.num === 'WT-3' && up.ver === '2' && !up.old, 'Update redefines the block for version 2; the item number stays', JSON.stringify(up));
  await page.waitForTimeout(300);
  ok((await page.textContent('dialog[data-lib] .cc-lib-rows')).includes('Up to date'), 'checked again: up to date');
  await page.click('dialog[data-lib] button:has-text("Library credits")');
  await page.waitForSelector('dialog[data-lib] .cc-lib-credits');
  ok((await page.textContent('dialog[data-lib] .cc-lib-credits')).includes('“Generic work table” by CadCraft, CC0 1.0'), 'Library credits lists the attribution');
  await page.click('dialog[data-lib] .cc-lib-credits button:has-text("Copy attribution")');
  await page.waitForTimeout(150);
  ok((await cc(() => navigator.clipboard.readText())) === '“Generic work table” by CadCraft, CC0 1.0', 'Copy attribution copies it');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog[data-lib] button:has-text("Download CSV")')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename().endsWith('library credits.csv') && csv.includes('WT-3') && csv.includes(UUID), 'credits CSV downloads with the schedule', dl.suggestedFilename());
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '03-library-credits.png') });

  console.log('\n== Files…');
  await page.click('dialog[data-lib] [role=tab]:has-text("Files")');
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('dialog[data-lib] button:has-text("Choose a file")')]);
  await fc.setFiles(itemPath);
  await page.waitForSelector('dialog[data-lib] .cc-lib-card canvas');
  ok((await page.textContent('dialog[data-lib] .cc-lib-card')).includes('Hand sink from a file'), 'an item.json from this computer shows as a card (plan drawn as its preview)');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '04-files-source.png') });
  await page.locator('.cc-lib-card button:has-text("Place")').first().click();
  await page.waitForFunction(() => /insertion point/.test(document.querySelector('[data-prompt]').textContent));
  await stageClick(0.6, 0.45);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const n = await cc(() => window.cadcraft.doc.all().filter((e) => e.type === 'insert').map((e) => e.attrs['CC-ITEM']));
  ok(n.length === 2 && n[1] === '1', 'placed too (its own item numbering from the drawing: next free number)', JSON.stringify(n));

  console.log('\n== INSERT F');
  await typeCmd('INSERT');
  const [fc2] = await Promise.all([page.waitForEvent('filechooser'), typeCmd('F')]);
  await fc2.setFiles(dxfPath);
  await page.waitForSelector('dialog.cc-ask select');
  ok((await page.textContent('dialog.cc-ask')).includes('Insert from Kitchen parts.dxf'), 'INSERT F: the block dialog lists the file\'s blocks');
  await page.selectOption('dialog.cc-ask select', 'FLOOR_SINK');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '05-insert-from-file.png') });
  await page.click('dialog.cc-ask button:has-text("Insert")');
  await page.waitForFunction(() => /insertion point/.test(document.querySelector('[data-prompt]').textContent));
  await stageClick(0.5, 0.7);
  ok(/Floor sink tag/.test(await prompt()), 'its attribute is asked', await prompt());
  await page.keyboard.type('FS-7'); await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const fs1 = await cc(() => window.cadcraft.doc.all().filter((e) => e.block === 'FLOOR_SINK').map((e) => e.attrs));
  ok(fs1.length === 1 && fs1[0].TAG === 'FS-7', 'placed with TAG = FS-7', JSON.stringify(fs1));

  console.log('\n== deep link');
  await page.evaluate(() => { window.cadcraft.doc.markSaved(); });
  await page.goto(BASE + '/lab/cadcraft?space=paper&library=' + UUID, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog[data-lib][open] .cc-lib-card');
  ok(await page.locator('.cc-lib-card').count() === 1 && (await page.textContent('.cc-lib-card')).includes('Version 2'), '?library=<uuid> opens the panel on that item (its newest published version)');
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} catch (err) {
  if (err !== 'live-done') {
  ok(false, 'browser run', err.stack || err.message);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
  }
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
