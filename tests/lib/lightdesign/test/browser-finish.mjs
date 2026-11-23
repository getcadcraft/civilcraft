#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-finish.mjs — IL.7 / IL.8 finish (session `light-finish-11`) in the real /lab pages: the 3D lux surface and the person's luminaire catalogues in /lab/cadcraft,
 * the ModelCraft adapter in /lab/modelcraft (a selected floor face → Calculate → Draw puts luminaires and the lux surface in the model as bodies, one undo step → Erase).
 * Run as root, alone, nice, with a timeout:   nice -n 10 timeout 900 node lib/lightdesign/test/browser-finish.mjs [--shots dir] [--apps cadcraft,modelcraft]
 * The photometry files it adds are written here from the formats' published layouts (test files, no maker's data).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/lightdesign-finish'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

// test photometry files: IES spots of different flux / power / spread, and one EULUMDAT, in a folder (with a stray .txt the catalogue must skip)
const ies = (name, lm, w, cds) => ['IESNA:LM-63-2002', '[MANUFAC] Test maker', '[LUMINAIRE] ' + name, 'TILT=NONE', '1 ' + lm + ' 1 7 1 1 2 0.15 0.15 0 1 1 ' + w, '0 15 30 45 60 75 90', '0', cds.join(' ')].join('\n') + '\n';
const ldh = Array(26).fill('0');
Object.assign(ldh, { 0: 'ACME test', 1: '1', 2: '1', 3: '0', 4: '0', 5: '3', 6: '45', 8: 'Wide LDT', 12: '200', 14: '50', 15: '180', 22: '100', 23: '1', 24: '0', 25: '1' });
const LDT = [...ldh, '1', 'LED', '3000', '3000', '80', '30', ...Array(10).fill('0'), '0', '45', '90', '318.3', '225.1', '0'].join('\n') + '\n';
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ld-cat-'));
const FILES = {
  'spot-narrow.ies': ies('Narrow spot', 1500, 15, [3000, 1200, 300, 80, 20, 5, 0]),
  'spot-medium.ies': ies('Medium spot', 2500, 22, [2000, 1700, 1100, 500, 150, 30, 0]),
  'downlight-big.ies': ies('Big downlight', 4000, 35, [1500, 1450, 1300, 1050, 700, 300, 0]),
  'wide.ldt': LDT,
  'notes.txt': 'not photometry',
};
for (const [n, t] of Object.entries(FILES)) fs.writeFileSync(path.join(DIR, n), t);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, ...cv] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = (name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });
const ld = (k) => `[data-ld="${k}"]`;
const closeDialogs = () => page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) { try { d.close(); } catch { /* */ } } for (const e of document.querySelectorAll('.nh-offer, .tour-toast')) { try { e.hidePopover(); } catch { /* */ } e.remove(); } });
const showPanel = async () => {
  for (let k = 0; k < 20 && !(await page.isVisible('[data-ld-root]').catch(() => false)); k++) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button.bc-rtab, [role=tab], button, [data-af="closed"]')].find((x) => /^\s*Lighting design\s*$/.test(x.textContent || '') && x.offsetParent); if (b) b.click(); });
    await page.waitForTimeout(600);
  }
};
const enable = async (app, clear = true) => {
  await page.goto(BASE + '/lab/' + app, { waitUntil: 'domcontentloaded' });
  if (clear) await page.evaluate((a) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':lightdesign:')) localStorage.removeItem(k); }, app);
  await page.goto(BASE + '/lab/' + app, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons, null, { timeout: 60000 });
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'lightdesign' && a.state !== 'loading'), null, { timeout: 30000 }).catch(() => {});
  const me = await page.evaluate(() => { const a = window.ccAddons.list().find((x) => x.id === 'lightdesign'); return a ? { state: a.state, source: a.source, apps: a.manifest && a.manifest.apps } : null; });
  if (me && me.state !== 'active') await page.evaluate(() => window.ccAddons.loader.setEnabled('lightdesign', true));   // already on (kept from the last visit): switching it on again would start a second copy
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'lightdesign')?.state === 'active', null, { timeout: 20000 });
  await closeDialogs();
  await showPanel();
  return me;
};
/** Non-white pixels and distinct colours of a canvas. */
const canvasStats = (sel) => page.$eval(sel, (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let ink = 0; const cols = new Set(); for (let i = 0; i < d.length; i += 4) { if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) ink++; cols.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4)); } return { ink, colours: cols.size, w: c.width, h: c.height }; });

async function cadcraft() {
  console.log('\n/lab/cadcraft: 3D lux surface and catalogues');
  const me = await enable('cadcraft');
  ok(me && me.source === 'bundled', 'the add-on is bundled in CadCraft', JSON.stringify(me));
  ok(await page.isVisible('[data-ld-root]'), 'the lighting design panel is open');
  ok((await page.$$eval('[data-ld-root]', (r) => r.length)) === 1, 'one panel');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  await page.waitForSelector('[data-ld-3d]', { timeout: 10000 });
  const tris = Number(await page.getAttribute('[data-ld-3d]', 'data-ld-3d'));
  const s3 = await canvasStats('[data-ld-3d]');
  ok(tris > 20 && s3.ink > 8000 && s3.colours >= 8, '3D lux surface drawn under the map (' + tris + ' triangles)', JSON.stringify(s3));
  await page.locator('[data-ld-3d]').scrollIntoViewIfNeeded();
  const box = await page.locator('[data-ld-3d]').boundingBox();
  const yaw0 = await page.getAttribute('[data-ld-3d]', 'data-ld-yaw');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 40, { steps: 6 }); await page.mouse.up();
  const yaw1 = await page.getAttribute('[data-ld-3d]', 'data-ld-yaw'), pitch1 = await page.getAttribute('[data-ld-3d]', 'data-ld-pitch');
  ok(yaw0 === '30' && Number(yaw1) !== 30 && Number(pitch1) > 35, 'dragging turns and tilts it', yaw0 + ' → ' + yaw1 + ' / ' + pitch1);
  await page.locator('[data-ld-surface]').scrollIntoViewIfNeeded();
  await page.locator('[data-ld-surface]').screenshot({ path: path.join(SHOTS, 'cad-3d-surface.png') });
  fs.writeFileSync(path.join(SHOTS, 'cad-3d-canvas.png'), Buffer.from((await page.$eval('[data-ld-3d]', (c) => c.toDataURL('image/png'))).split(',')[1], 'base64'));
  await page.fill(ld('pitch'), '90'); await page.keyboard.press('Tab');
  ok((await page.getAttribute('[data-ld-3d]', 'data-ld-pitch')) === '90', 'typing a tilt of 90° shows it from above');
  await page.click(ld('v3dreset'));

  // catalogue: where to get files, add a folder, search, sort, use
  ok(/makers publish a photometry file/.test(await page.textContent('[data-ld-cat-where]')) && !(await page.$('[data-ld-cat-where] a')), 'the help line says makers publish the files, with no link');
  const folder = await page.$(ld('catfolder'));
  let viaFolder = true;
  try { await folder.setInputFiles(DIR); } catch (e) { viaFolder = false; await page.setInputFiles(ld('catfiles'), Object.keys(FILES).map((n) => path.join(DIR, n))); }
  await page.waitForSelector('[data-ld-cat-count]', { timeout: 15000 });
  ok(Number(await page.getAttribute('[data-ld-cat-count]', 'data-ld-cat-count')) === 4, (viaFolder ? 'Add a folder' : 'Add files') + ': the 4 photometry files are in a new catalogue, the .txt skipped', await page.textContent('[data-ld-cat-msg]').catch(() => ''));
  const rows = await page.$$eval('[data-ld-cat] tr[data-ld-cat-row]', (r) => r.map((x) => ({ name: x.querySelector('[data-ld-cat-name]').textContent, maker: x.querySelector('[data-ld-cat-maker]').textContent, facts: x.querySelector('[data-ld-cat-facts]').textContent, beam: x.dataset.beam })));
  const wide = rows.find((r) => r.name === 'Wide LDT'), narrow = rows.find((r) => r.name === 'Narrow spot');
  ok(wide && wide.maker === 'ACME test, wide.ldt' && wide.facts === '3000 lm, 30.0 W, 100 lm/W, beam 116°', 'a row shows the file\'s name, maker and file, lumens, watts, lm/W and the beam worked out', JSON.stringify(wide));
  ok(narrow && Number(narrow.beam) < 40, 'the narrow spot has a narrow beam', JSON.stringify(narrow));
  await page.selectOption(ld('catSort'), 'lumens');
  const first = await page.$eval('[data-ld-cat] tr[data-ld-cat-row] [data-ld-cat-name]', (n) => n.textContent);
  ok(first === 'Big downlight', 'sort by most lumens: the 4000 lm downlight first', first);
  await page.fill(ld('catq'), 'spot'); await page.keyboard.press('Tab');
  ok((await page.getAttribute('[data-ld-cat-count]', 'data-ld-cat-count')) === '2', 'search "spot": 2 of 4');
  await page.fill(ld('catq'), ''); await page.keyboard.press('Tab');
  await page.fill(ld('catMaxW'), '20'); await page.keyboard.press('Tab');
  ok((await page.getAttribute('[data-ld-cat-count]', 'data-ld-cat-count')) === '1', 'at most 20 W: only the 15 W spot');
  await page.fill(ld('catMaxW'), '0'); await page.keyboard.press('Tab');
  await page.click('[data-ld-cat-use="downlight-big.ies"]');
  ok(/Big downlight/.test(await page.textContent('[data-ld-photo]')) && (await page.inputValue(ld('lum'))) === 'cat', 'Use: the luminaire is the catalogue\'s, its facts shown', await page.textContent('[data-ld-photo]'));
  await page.locator('[data-ld-catalogue]').scrollIntoViewIfNeeded();
  await page.locator('[data-ld-catalogue]').screenshot({ path: path.join(SHOTS, 'cad-catalogue.png') });
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  const n = await page.evaluate(() => window.ccLightDesign.result.result.count), lm = await page.evaluate(() => window.ccLightDesign.result.result.photo.lumens);
  ok(n > 0 && lm === 4000, 'Calculate plans with the catalogue luminaire (' + n + ' of the 4000 lm downlight)');
  // kept: read back after a reload
  await enable('cadcraft', false);
  ok(Number(await page.getAttribute('[data-ld-cat-count]', 'data-ld-cat-count').catch(() => 0)) === 4 && (await page.inputValue(ld('lum'))) === 'cat', 'after a reload the catalogue (4 files) and the pick are still there');
  await page.click(ld('catremove'));
  const gone = { roots: await page.$$eval('[data-ld-root]', (r) => r.length), stored: await page.evaluate(() => localStorage.getItem('cc-addon:cadcraft:lightdesign:catalogues')), count: await page.$('[data-ld-cat-count]') !== null, lum: await page.inputValue(ld('lum')), cats: await page.evaluate(() => window.ccLightDesign.catalogues.list.length) };
  ok(!gone.count && gone.lum === 'panel' && gone.cats === 0, 'Remove this catalogue: gone, the luminaire falls back to a generic type', JSON.stringify(gone));
  await page.click(ld('calc')); await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  await shot('cad-panel');
}

async function modelcraft() {
  console.log('\n/lab/modelcraft: the ModelCraft adapter');
  const me = await enable('modelcraft');
  ok(me && me.source === 'bundled' && (me.apps || []).includes('modelcraft'), 'the add-on is bundled in ModelCraft (its apps list names modelcraft) and starts off before we switch it on', JSON.stringify(me));
  ok(await page.isVisible('[data-ld-root]'), 'the lighting design panel is open in ModelCraft');
  ok(/Select one floor face/.test(await page.textContent('[data-ld-root]')), 'with nothing selected it asks for a floor face');
  const sel = await page.evaluate(async () => {
    const M = await import('/assets/apps/modelcraft/dev/model.js');
    const m = window.modelcraft && window.modelcraft.model;
    if (!m) return { err: 'no window.modelcraft.model' };
    m.change('floor', () => { M.addPolygon(m.root, [[0, 0, 0], [6, 0, 0], [6, 4, 0], [0, 4, 0]]); });
    const fid = [...m.root.faces.keys()][0];
    window.modelcraft.host?.setSel?.([{ t: 'f', id: fid }]);
    return { fid, faces: m.root.faces.size };
  });
  ok(!sel.err && sel.fid, 'a 6 x 4 m floor face drawn and selected', JSON.stringify(sel));
  await page.click(ld('reread'));
  await page.waitForSelector(ld('roompick'), { timeout: 15000 });
  const opts = await page.$$eval('[data-ld="roompick"] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 2 && /24\.0 m²/.test(opts[1]), 'Read again lists the face as a 24 m² room', opts.join(' | '));
  await page.selectOption(ld('roompick'), '0');
  ok((await page.inputValue(ld('outline'))).replace(/\s+/g, ' ') === '0, 0 6000, 0 6000, 4000 0, 4000', 'the room outline is the face\'s, in millimetres', await page.inputValue(ld('outline')));
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  ok(await page.isVisible('[data-ld-3d]'), 'the 3D lux surface is in ModelCraft\'s panel too');
  const faces0 = await page.evaluate(() => window.modelcraft.model.root.faces.size);
  const undo0 = await page.evaluate(() => window.modelcraft.model.undoStack.length);
  await page.click(ld('draw'));
  await page.waitForSelector('[data-ld-message]', { timeout: 30000 });
  const msg = await page.textContent('[data-ld-message]');
  const bodies = await page.evaluate(() => window.ccAddonModel.bodies('lightdesign'));
  const lums = await page.evaluate(() => window.ccLightDesign.result.result.count);
  ok(/luminaires placed as bodies in the model, with the 3D lux surface/.test(msg) && bodies.length === 1 && bodies[0].group === 'lightdesign' && bodies[0].count > lums, 'Draw: the ' + lums + ' luminaires and the lux surface are bodies in one tagged group', msg + ' ' + JSON.stringify(bodies));
  ok((await page.evaluate(() => window.modelcraft.model.undoStack.length)) === undo0 + 1, 'Draw is ONE undo step in ModelCraft\'s history');
  await closeDialogs();
  await page.evaluate(() => { for (const b of document.querySelectorAll('button[aria-label="Close"], button[title="Close"]')) if (b.offsetParent && b.closest('[class*=first], [class*=start], [class*=welcome], [class*=hint]')) b.click(); });
  await page.evaluate(() => { try { window.modelcraft.zoomExtents?.(); } catch { /* */ } });
  await page.waitForTimeout(800);
  await shot('model-drawn');
  await page.click(ld('draw')); await page.waitForTimeout(800);
  const again = await page.evaluate(() => window.ccAddonModel.bodies('lightdesign'));
  ok(again.length === 1 && again[0].count === bodies[0].count, 'Draw again replaces the group, it does not double it');
  await page.click(ld('erase')); await page.waitForTimeout(800);
  const after = await page.evaluate(() => window.ccAddonModel.bodies('lightdesign'));
  const faces1 = await page.evaluate(() => window.modelcraft.model.root.faces.size);
  ok(after.length === 0 && faces1 === faces0 && /Erased [1-9]/.test(await page.textContent('[data-ld-message]')), 'Erase removes them; the floor face is left', JSON.stringify(after) + ' ' + faces0 + '/' + faces1);
}

try {
  const which = opt('--apps', 'cadcraft,modelcraft').split(',');
  if (which.includes('cadcraft')) await cadcraft();
  if (which.includes('modelcraft')) await modelcraft();
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('finish-error').catch(() => {});
}
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
await browser.close();
fs.rmSync(DIR, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
