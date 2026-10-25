#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-as5.mjs — the gaps filled in 0.7 AS.5 (session assistants), each in a real /lab window: BimCraft (set a name,
 * change a wall, move and delete), ModelCraft (push/pull, paint, group, scenes), MarkupCraft (status, reply, CSV export)
 * and TakeoffCraft (items and marks on a scaled sheet). Every edit one undo step the window's own undo takes back.
 *
 *   node tools/mcp/test/browser-as5.mjs [--shots <dir>] [--verbose]      (run as root)
 *
 * Studio's window channel stood in (studio-stand-in.mjs, no desktop bridge); assistants switched on in each app's stored
 * settings before it loads. One sign-in: the assistants test admin agentstest+cadcraft@projectz.xyz (tools/mcp/test/admin.php).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..');
const { studioStandIn } = await import(pathToFileURL(path.join(REPO, 'tools/mcp/test/studio-stand-in.mjs')).href);
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const VERBOSE = args.includes('--verbose');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 500) : '')); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const sc = (r) => (r && r.structuredContent) || {};
const text = (r) => (r && r.content && r.content[0] && r.content[0].text) || '';

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/mcp/test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const problems = [];

async function appPage(app, settings) {
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') problems.push(app + ' console: ' + m.text()); });
  p.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
  const S = await studioStandIn(p, { app, desktop: false });
  await p.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* fine */ } }, settings);
  await p.goto(BASE + '/lab/' + app + '?space=paper', { waitUntil: 'networkidle' });
  return { p, S };
}

try {
  const lp = await ctx.newPage();
  await lp.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await lp.fill('input[name="email"]', admin.email);
  await lp.fill('input[name="password"]', admin.password);
  await Promise.all([lp.waitForNavigation(), lp.click('form button[type="submit"]')]);
  await lp.close();

  console.log('\n== BimCraft');
  {
    const { p, S } = await appPage('bimcraft', ['bimcraft.settings', JSON.stringify({ assistants: { enabled: true, groups: ['read', 'edit', 'export'] } })]);
    await p.setInputFiles('[data-file]', path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc'));
    let info = null;
    for (let i = 0; i < 120 && !(info && info.open); i++) { await wait(500); info = sc(await S.call('app_info', {})); }
    ok(info && info.open, 'the house is open in BimCraft', info);
    const names = (await S.rpc('tools/list', {})).result.tools.map((t) => t.name);
    ok(['element_set', 'elements_delete', 'elements_move', 'wall_change', 'opening_change'].every((n) => names.includes(n)), 'the AS.5 tools are listed', names);
    const walls = sc(await S.call('walls_list', {})).walls || [];
    const w = walls[0];
    let r = await S.call('element_set', { guid: w.guid, attribute: 'Name', value: 'North wall' });
    ok(!r.isError && sc(r).changed && sc(r).undo === 'Assistant: set Name = North wall', 'element_set: a wall\'s Name', r);
    r = await S.call('wall_change', { guid: w.guid, a: [w.a[0], w.a[1] - 500], b: [w.b[0], w.b[1] - 500] });
    ok(!r.isError && Math.abs(sc(r).a[1] - (w.a[1] - 500)) < 1, 'wall_change: the wall moves 500 mm (rooms and joins follow)', r);
    r = await S.call('undo', { steps: 2 });
    const back = (sc(await S.call('walls_list', {})).walls || []).find((x) => x.guid === w.guid);
    ok(!r.isError && sc(r).undone.length === 2 && back && Math.abs(back.a[1] - w.a[1]) < 1, 'undo (2 steps) puts it back', r);
    const door = walls.flatMap((x) => x.openings).find((o) => o.kind === 'door');
    if (door) {
      r = await S.call('elements_delete', { guids: [door.guid] });
      ok(!r.isError && sc(r).deleted === 1, 'elements_delete: a door', r);
      r = await S.call('undo', {});
      ok(!r.isError && sc(r).undone[0] === 'Assistant: delete 1 element', 'undo brings it back', r);
    }
    {   // 0.7 AS.6: the open model as OpenUSD (usd's XF.8 writer), as Export › USD makes it; no path = the download
      const dl = p.waitForEvent('download', { timeout: 90000 }).catch(() => null);
      r = await S.call('usd_export', { format: 'usda' });
      const got = await dl;
      const usda = got ? fs.readFileSync(await got.path(), 'utf8') : '';
      ok(!r.isError && sc(r).format === 'usda' && /\.usda$/.test(sc(r).downloaded || '') && /^#usda 1\.0/.test(usda) && /def Mesh/.test(usda) && sc(r).report.elements > 0, 'usd_export in BimCraft: a .usda download with the house\'s elements', { err: text(r), r: sc(r), head: usda.slice(0, 20) });
    }
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'as5-bimcraft.png') });
  }

  console.log('\n== ModelCraft');
  {
    const { p, S } = await appPage('modelcraft', ['cadcraft.assistants.modelcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'] })]);
    await p.waitForFunction(() => !!window.modelcraft, null, { timeout: 30000 }).catch(() => {});
    let r = await S.call('box_add', { size: ['2m', '1m', '1m'] });
    const box = sc(r).instance;
    const faces = sc(await S.call('faces_list', { instance: box })).faces || [];
    const top = faces.find((f) => f.normal[2] === 1);
    r = await S.call('push_pull', { instance: box, face: top.id, distance: '0.5m' });
    const vol = (sc(await S.call('model_describe', {})).instances || []).find((x) => x.id === box)?.volumeM3;
    ok(!r.isError && Math.abs(vol - 3) < 1e-9, 'push_pull in the window: 2 → 3 m³', { r: sc(r), vol });
    r = await S.call('paint', { instance: box, faces: [top.id], paint: 'brick-red' });
    ok(!r.isError && sc(r).paint === 'mat:brick-red', 'paint a face with a library material', r);
    r = await S.call('group_make', { instances: [box], name: 'Outer' });
    ok(!r.isError && sc(r).instance, 'group_make', r);
    r = await S.call('scene_add', { name: 'From the assistant' });
    ok(!r.isError && sc(r).scenes >= 1, 'scene_add saves the view as a scene', r);
    r = await S.call('scene_show', { scene: 'From the assistant' });
    ok(!r.isError && sc(r).scene === 'From the assistant', 'scene_show goes to it', r);
    r = await S.call('undo', { steps: 4 });
    ok(!r.isError && sc(r).undone.length === 4, 'undo takes the four steps back', r);
    // 0.7 AS.6: a mesh and a modifier (mesh's MD.2 / MD.3)
    r = await S.call('mesh_add', { primitive: 'cube', options: { size: '1m' }, at: ['3m', 0] });
    const mi = sc(r).instance;
    r = await S.call('modifier_add', { instance: mi, type: 'subsurf', settings: { levels: 2 } });
    const mods = sc(await S.call('modifiers_list', { instance: mi })).modifiers || [];
    ok(!r.isError && mods.length === 1 && mods[0].type === 'subsurf' && mods[0].settings.levels === 2, 'mesh_add + modifier_add in the window: a cube with subdivision 2', mods);
    r = await S.call('modifier_remove', { instance: mi, index: 1 });
    ok(!r.isError && sc(r).modifiers.length === 0, 'modifier_remove', r);
    // 0.7 AS.6: the model as OpenUSD (usd's XF.8 writer), as File › Save as USD makes it; no path = the download
    const dl = p.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    r = await S.call('usd_export', { format: 'usda' });
    const got = await dl;
    const usda = got ? fs.readFileSync(await got.path(), 'utf8') : '';
    ok(!r.isError && sc(r).format === 'usda' && /\.usda$/.test(sc(r).downloaded || '') && /^#usda 1\.0/.test(usda) && /def Mesh/.test(usda), 'usd_export in the window: a .usda download with the model\'s meshes', r);
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'as5-modelcraft.png') });
  }

  console.log('\n== MarkupCraft');
  {
    const { p, S } = await appPage('markupcraft', ['cadcraft.assistants.markupcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'] })]);
    const pdf = fs.readFileSync(path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')).toString('base64');
    await p.evaluate(async (b) => { const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)); await window.markupcraft.openFiles([new File([bin], 'kitchen-plan-sheet.pdf', { type: 'application/pdf' })]); }, pdf);
    await p.waitForFunction(() => window.markupcraft.sheets.length === 1, null, { timeout: 20000 });
    let r = await S.call('markup_add', { type: 'cloudrect', rect: [0.1, 0.1, 0.4, 0.3], comment: 'Check this wall' });
    const id = sc(r).id;
    r = await S.call('markup_status', { id, status: 'Accepted', comment: 'Matches the detail.' });
    const m = await p.evaluate((x) => window.markupcraft.store.get(x), id);
    ok(!r.isError && m.status === 'Accepted' && m.replies.length === 2 && /assistant/.test(m.replies[0].author), 'markup_status: Accepted, logged in the thread with a comment', { r: sc(r), replies: m.replies.length });
    r = await S.call('markup_reply', { id, text: 'Field verified.' });
    ok(!r.isError && (await p.evaluate((x) => window.markupcraft.store.get(x).replies.length, id)) === 3, 'markup_reply', r);
    const dl = p.waitForEvent('download', { timeout: 20000 });
    r = await S.call('markups_export', { format: 'csv' });
    const d = await dl.catch(() => null);
    const csv = d ? fs.readFileSync(await d.path(), 'utf8') : '';
    ok(!r.isError && d && /\.csv$/.test(d.suggestedFilename()) && /Check this wall/.test(csv), 'markups_export CSV: the list\'s own CSV download, with the markup', { name: d && d.suggestedFilename() });
  }

  console.log('\n== TakeoffCraft');
  {
    const { p, S } = await appPage('takeoffcraft', ['cadcraft.assistants.takeoffcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'] })]);
    const pdf = fs.readFileSync(path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')).toString('base64');
    await p.waitForFunction(() => !!window.takeoffcraft, null, { timeout: 30000 });
    await p.evaluate(async (b) => { const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)); await window.takeoffcraft.openFiles([new File([bin], 'kitchen-plan-sheet.pdf', { type: 'application/pdf' })]); }, pdf);
    await p.waitForFunction(() => window.takeoffcraft.sheets().length === 1, null, { timeout: 30000 });
    const key = await p.evaluate(() => window.takeoffcraft.sheets()[0].key);
    let r = await S.call('items_add', { items: [{ name: 'Base trim', type: 'linear', material: 2.5 }, { name: 'Outlet', type: 'count' }] });
    ok(!r.isError && sc(r).ids.length === 2, 'items_add: two items, one step', r);
    r = await S.call('marks_add', { item: 'Base trim', marks: [{ pts: [[100, 100], [244, 100]] }] });
    ok(r.isError && /no scale yet/.test(text(r)), 'a run on an unscaled sheet is refused', r);
    await p.evaluate((k) => window.takeoffcraft.model.setScale(k, { method: 'preset', preset: 'a1/4', ftPerUnit: 1 / 18, label: '1/4" = 1\'-0"', cal: null }), key);
    r = await S.call('marks_add', { item: 'Base trim', marks: [{ pts: [[100, 100], [244, 100]] }] });
    const q = sc(await S.call('takeoff_quantities', {})).items?.find((x) => x.name === 'Base trim');
    ok(!r.isError && q && Math.abs(q.quantity - 8) < 1e-9, 'marks_add after the sheet has a scale: 8 LF', { r: sc(r), q });
    {   // 0.7 AS.6: the sheet's measured run in 3D as OpenUSD (.usdz by default), without opening the 3D view
      const dl = p.waitForEvent('download', { timeout: 30000 }).catch(() => null);
      r = await S.call('usd_export', {});
      const got = await dl;
      const head = got ? fs.readFileSync(await got.path()).subarray(0, 2).toString() : '';
      ok(!r.isError && sc(r).format === 'usdz' && /\.usdz$/.test(sc(r).downloaded || '') && head === 'PK' && sc(r).report.objects > 0, 'usd_export in TakeoffCraft: a .usdz of the measured run', { r: sc(r), head });
    }
    r = await S.call('marks_add', { item: 'Outlet', units: 'fraction', marks: [{ pts: [[0.2, 0.2], [0.3, 0.2]] }] });
    ok(!r.isError && sc(r).ids.length === 2, 'two outlets as fractions of the page', r);
    await p.evaluate(() => window.takeoffcraft.model.undo());
    ok((await p.evaluate(() => window.takeoffcraft.model.state.marks.filter((m) => m.kind === 'count').length)) === 0, 'the person\'s undo takes the assistant\'s last step back');
  }
  ok(!problems.length, 'no console errors', problems.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack || e));
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* fine */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
