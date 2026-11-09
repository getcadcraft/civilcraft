#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lib-openings.mjs — Library doors in BimCraft walls (2026-11-02, BIMBro on Discord), in the lab, headless, real clicks.
 *   nice node tools/bimcraft-test/browser-lib-openings.mjs [--shots <dir>]      (run as root: Playwright Chromium + a minted session)
 * The Library's answers are stubbed by routes with a made-up double door (no member's item). One new building, then:
 *   the panel asks with openings=1 · Place on a door item starts the plan's Door tool with its fixed size · a click on a wall sets it
 *   in (opening cut, one undo step) · a click away from walls stands one on its own · a wall drawn through it takes it in.
 * Fails on any console error.
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
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' - ' + d : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

// a made-up double door: frame and two leaves, 1700 wide, 120 deep, 2100 tall
const UUID = 'abababab-abab-4bab-8bab-abababababab';
function door() {
  const P = [], I = [];
  const box = ([x0, y0, z0, x1, y1, z1]) => {
    const b = P.length / 3;
    for (const z of [z0, z1]) for (const y of [y0, y1]) for (const x of [x0, x1]) P.push(x, y, z);
    for (const t of [[0, 2, 1], [1, 2, 3], [4, 5, 6], [5, 7, 6], [0, 1, 4], [1, 5, 4], [2, 6, 3], [3, 6, 7], [0, 4, 2], [2, 4, 6], [1, 3, 5], [3, 7, 5]]) I.push(b + t[0], b + t[1], b + t[2]);
  };
  for (const p of [[-850, -60, 0, -800, 60, 2100], [800, -60, 0, 850, 60, 2100], [-800, -60, 2050, 800, 60, 2100], [-795, -20, 0, -2, 20, 2045], [2, -20, 0, 795, 20, 2045]]) box(p);
  return {
    format: 'cadcraft-library-item', format_version: 1, uuid: UUID, version: 1, name: 'Browsertest double door', kind: 'door', category: 'openings/doors',
    description: 'Made up for the test.', maker: '', model: '', ifc: { class: 'IfcDoor', predefined: 'NOTDEFINED' },
    plan: { layers: [{ name: 'EQUIP', color: 7 }], entities: [{ type: 'poly', layer: 'EQUIP', color: null, pts: [[-850, -60], [850, -60], [850, 60], [-850, 60]], closed: true }] },
    body: { type: 'mesh', positions: P, indices: I }, clearances: [], params: { width: 1700, depth: 120, height: 2100 }, source_attrs: {},
    license: { id: 'CC0-1.0', holder: 'CadCraft', attribution: '', url: '' },
  };
}
const ITEM = door();
const UUID2 = 'cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd', ITEM2 = { ...door(), uuid: UUID2, name: 'Browsertest stretch door' };
const summary = { uuid: UUID, slug: 'browsertest-double-door', name: ITEM.name, kind: 'door', category: 'openings/doors', maker: '', model: '', license: 'CC0-1.0', version: 1,
  preview_url: null, item_url: '/api/v1/library/items/' + UUID + '/1/item.json', updated_at: '2026-11-02T00:00:00Z', visibility: 'public', stretch: [] };
const summary2 = { ...summary, uuid: UUID2, slug: 'browsertest-stretch-door', name: ITEM2.name, item_url: '/api/v1/library/items/' + UUID2 + '/1/item.json', stretch: ['x', 'y'] };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimlibdoor'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 90000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { await page.evaluate(() => window.bimcraftPlan.view.canvas.scrollIntoView({ block: 'center' })); const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 3 }); await page.mouse.click(px, py); };
const openings = () => page.evaluate(async () => {
  const { readOpenings } = await import('/assets/apps/bimcraft/dev/model-openings.js');
  const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js');
  const ed = window.bimcraftPicture.ext.ed();
  return readOpenings(new ModelWriter(ed.W, ed.api, ed.mid)).map((o) => ({ guid: o.guid, lib: !!o.library, width: Math.round(o.width), height: Math.round(o.height), offset: Math.round(o.offset), wall: o.wallGuid, kind: o.kind }));
});
const doors = () => page.evaluate(() => { const ed = window.bimcraftPicture.ext.ed(); try { return [...ed.api.GetLineIDsWithType(ed.mid, ed.api.GetTypeCodeFromName('IFCDOOR'))].length; } catch (e) { return -1; } });
const placeFromLibrary = async (name = 'Browsertest double door') => {
  await page.click('[data-rtab="library"]');
  const back = await page.$('.bc-lib-detail .bc-linkbtn');   // an item is open: back to the list (its sources show only there)
  if (back) await back.click();
  await page.click('.bc-lib-src:text-is("Library")');
  await page.waitForSelector('.bc-lib-card:has-text("' + name + '")', { timeout: 15000 });
  await page.click('.bc-lib-card:has-text("' + name + '")');
  await page.waitForSelector('[data-lib-place]', { timeout: 15000 });
  await page.click('[data-lib-place]');
};

try {
  let listQuery = '';
  await page.route('**/api/v1/library/items?*', (r) => { listQuery = new URL(r.request().url()).search; r.fulfill({ json: { status: 'success', message: '', data: { items: [summary, summary2], page: 1, per: 24, total: 2 } } }); });
  await page.route('**/api/v1/library/items/' + UUID, (r) => r.fulfill({ json: { status: 'success', message: '', data: { item: { ...summary, description: '', author: { uuid: '', name: 'CadCraft' }, versions: [{ version: 1, status: 'published', license: 'CC0-1.0', item_url: summary.item_url }] } } } }));
  await page.route('**/api/v1/library/items/' + UUID + '/1/item.json', (r) => r.fulfill({ json: ITEM }));
  await page.route('**/api/v1/library/items/' + UUID2, (r) => r.fulfill({ json: { status: 'success', message: '', data: { item: { ...summary2, description: '', author: { uuid: '', name: 'CadCraft' }, versions: [{ version: 1, status: 'published', license: 'CC0-1.0', item_url: summary2.item_url, stretch: ['x', 'y'] }] } } } }));
  await page.route('**/api/v1/library/items/' + UUID2 + '/1/item.json', (r) => r.fulfill({ json: ITEM2 }));
  await page.route('**/api/v1/library/uses**', (r) => r.fulfill({ json: { status: 'success', message: '', data: {} } }));

  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'LibDoors'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building LibDoors/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext, lv = A.S.data.levels;
    const room = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    A.commit(OPS.drawWalls({ storey: lv[0].guid, segs: room.map((a, i) => ({ a, b: room[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: lv[1].guid, extSide: 'right' }), { label: 'Walls', verb: 'Drew' });
  });
  await settled();
  await page.evaluate(() => window.bimcraftPicture.ext.fitPlan());

  console.log('== Place from the Library: into a wall');
  await placeFromLibrary();
  ok(/openings=1/.test(listQuery), 'the Library panel asks for doors and windows (' + listQuery + ')');
  const tool = await page.evaluate(() => { const S = window.bimcraftPlan.state; return { tool: S.tool, lib: S.open.door.lib?.item?.name || '', w: Math.round(S.open.door.width), h: Math.round(S.open.door.height) }; });
  ok(tool.tool === 'door' && tool.lib === 'Browsertest double door' && tool.w === 1700 && tool.h === 2100, 'Place on a door item starts the Door tool holding it, 1700 × 2100 (' + JSON.stringify(tool) + ')');
  const opt = await page.evaluate(() => { const sel = document.querySelector('[data-model-otype="door"]'), w = document.querySelector('[data-model-ow="door"]'); return { text: sel.selectedOptions[0]?.textContent || '', disabled: w.disabled }; });
  ok(/Browsertest double door/.test(opt.text) && opt.disabled, 'the Door tool names it ("' + opt.text + '") and its width can\'t be typed');
  await shot(page, '00-tool');
  await planClick(3000, 0);
  await settled();
  let ops = await openings();
  const set = ops.find((o) => o.lib);
  ok(set && set.width === 1700 && set.height === 2100 && Math.abs(set.offset + 850 - 3000) <= 60, 'a click on the south wall sets it in, its middle at the click (' + JSON.stringify(set) + ')');
  await shot(page, '01-in-wall');
  const src = await page.evaluate(() => new TextDecoder().decode(window.bimcraftPicture.ext.ed().save()));
  ok((src.match(/IFCRELVOIDSELEMENT\(/g) || []).length === 1 && /'MappedRepresentation'/.test(src), 'the wall is cut by its opening; the door\'s body is the Library mesh, mapped');
  await page.evaluate(() => document.activeElement?.blur?.()); await page.mouse.move(10, 10); await page.keyboard.press('Control+z'); await settled();
  ok(!(await openings()).some((o) => o.lib), 'Ctrl+Z takes it out again (one undo step)');
  await page.keyboard.press('Control+y'); await settled();
  ok((await openings()).some((o) => o.lib), 'Ctrl+Y puts it back');

  console.log('== On its own, then a wall drawn through it');
  await placeFromLibrary();
  const before = await doors();
  await planClick(5500, 2500);
  await settled();
  ops = await openings();
  ok((await doors()) === before + 1 && ops.filter((o) => o.lib).length === 1, 'a click away from walls stands it on its own (an IfcDoor in no wall)');
  await shot(page, '02-free');
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext;
    A.commit(OPS.drawWalls({ storey: A.S.data.levels[0].guid, segs: [{ a: [4000, 2500], b: [8000, 2500] }], typeKey: 'int-2x4', height: 2700 }), { label: 'Wall', verb: 'Drew' });
  });
  await settled();
  ops = await openings();
  const took = ops.filter((o) => o.lib);
  ok(took.length === 2 && took.some((o) => Math.abs(o.offset + 850 - 1500) <= 60), 'a wall drawn through it takes it in: two Library doors in walls (' + JSON.stringify(took) + ')');
  await shot(page, '03-taken');

  console.log('== Stretching, where the Library allows it (width and depth)');
  await placeFromLibrary('Browsertest stretch door');
  const row = await page.textContent('.bc-lib-detail');
  ok(/Stretching\s*width, depth/.test(row), 'the panel says it may be stretched in width and depth');
  const inputs = await page.evaluate(() => ({ w: document.querySelector('[data-model-ow="door"]').disabled, h: document.querySelector('[data-model-oh="door"]').disabled }));
  ok(!inputs.w && inputs.h, 'the Door tool lets the width be typed, not the height');
  await page.fill('[data-model-ow="door"]', '2000'); await page.press('[data-model-ow="door"]', 'Enter');
  await planClick(5000, 5000);
  await settled();
  const sd = (await openings()).find((o) => o.lib && o.width === 2000);
  ok(sd && sd.height === 2100, 'placed 2000 wide as typed, still 2100 tall (' + JSON.stringify(sd) + ')');
  await shot(page, '04-stretched');

  console.log('== One Library item per Place, then Select: a click picks it and Delete removes it (BIMBro, 2026-11-02)');
  {
    const doorIds = () => page.evaluate(() => { const ed = window.bimcraftPicture.ext.ed(); return [...ed.api.GetLineIDsWithType(ed.mid, ed.api.GetTypeCodeFromName('IFCDOOR'))]; });
    await placeFromLibrary();
    await planClick(6500, 0); await settled();
    const n0 = (await doorIds()).length;
    ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'select', 'after placing, the tool is Select again');
    await planClick(6500, 0); await settled(); await page.waitForTimeout(400);
    ok((await doorIds()).length === n0 && (await page.evaluate(() => window.bimcraftPicture.ext.selectedKeys().length)) === 1, 'a click on it picks it (no second door on top)');
    await page.keyboard.press('Delete'); await settled(); await page.waitForTimeout(500);
    ok((await doorIds()).length === n0 - 1, 'Delete removes it');
  }

  console.log('== Small screens: Place right under the name, the item without the list header (owner 2026-11-02)');
  {
    await page.setViewportSize({ width: 900, height: 650 });
    await page.waitForTimeout(600);
    await page.evaluate(() => [...document.querySelectorAll('[data-lib-tool="library"]')].find((b) => b.offsetParent)?.click());
    await page.waitForTimeout(600);
    const back2 = await page.$('.bc-lib-detail .bc-linkbtn'); if (back2) await back2.click();
    await page.click('.bc-lib-card:has-text("Browsertest double door")');
    await page.waitForSelector('[data-lib-place]');
    const lay = await page.evaluate(() => {
      const d = document.querySelector('.bc-lib-detail'), name = d.querySelector('[data-lib-name]'), place = d.querySelector('[data-lib-place]'), prev = d.querySelector('.bc-lib-bigprev');
      const r = (e) => e.getBoundingClientRect();
      return { srcs: !!document.querySelector('[data-rpane="library"] .bc-lib-srcs'), placeBelowName: r(place).top > r(name).top, placeAbovePreview: r(place).top < r(prev).top, placeOnScreen: r(place).bottom <= innerHeight && r(place).top >= 0 };
    });
    ok(!lay.srcs && lay.placeBelowName && lay.placeAbovePreview && lay.placeOnScreen, 'one item: no source buttons above it, Place right under its name, above the preview, on screen at 900 × 650 (' + JSON.stringify(lay) + ')');
    await shot(page, '05-small');
    await page.setViewportSize({ width: 1440, height: 900 });
  }

  console.log('== Another tool puts it down');
  await page.evaluate(() => document.querySelector('[data-mtool="select"]').click());
  ok(await page.evaluate(() => !window.bimcraftPlan.state.open.door.lib), 'Select: the Door tool no longer holds the Library door');
  await page.evaluate(() => document.querySelector('[data-mtool="door"]').click());
  const back = await page.evaluate(() => { const sel = document.querySelector('[data-model-otype="door"]'); return { text: sel.selectedOptions[0]?.textContent || '', disabled: document.querySelector('[data-model-ow="door"]').disabled }; });
  ok(!/Browsertest/.test(back.text) && !back.disabled, 'the Door tool again: its own door types, sizes typed as before (' + back.text + ')');
  ok(!problems.length, 'no console errors', problems.slice(0, 4).join(' | '));
} catch (e) {
  ok(false, 'ran to the end', e.stack || String(e));
  await shot(page, 'zz-error');
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'down', 'bimlibdoor'], { stdio: 'ignore' }); } catch (e) { /* the session lapses on its own */ }
}
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
