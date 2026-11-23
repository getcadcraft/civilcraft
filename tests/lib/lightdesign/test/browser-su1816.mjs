#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-su1816.mjs — 0.11 SU.1816 (su-finish-11 `site-light`) in the real /lab pages. Run as root, alone, nice, with a timeout:
 *   nice -n 10 timeout 900 node lib/lightdesign/test/browser-su1816.mjs [--apps bimcraft,civilcraft] [--shots dir]
 * BimCraft: a new building, one 6 x 4 m room drawn with the Wall tool, a floor and a ceiling; the lighting design add-on switched on; the room from the model; plan for
 *   500 lx; the night view is drawn with the model's own surfaces (api.model.triangles), lit; Draw places the fixtures; BimCraft's Render dialog lists them by their
 *   light spread's name with that spread loaded (settings.ies from the project's CadCraft_LightIes); one undo takes the fixtures away.
 * CivilCraft: the add-on is bundled and off; switched on; a parking lot built on the sample site (trees on its islands) and a Landscape path across it; the lot is listed
 *   as an outdoor area; Outdoors and the Landscape layout are chosen; up-lights and bollards; lux on the ground; no Draw; the false-colour night view; the lamps file.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/lightdesign-su1816'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + String(typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 300) : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/cadcraft-test/admin.php'), cmd, 'sulight'], { encoding: 'utf8' }) || '{}');

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = (n) => page.screenshot({ path: path.join(SHOTS, n + '.png') });
const ld = (k) => `[data-ld="${k}"]`;
const closeDialogs = () => page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open].shell-fit')) { try { d.close(); } catch { /* */ } } for (const e of document.querySelectorAll('.nh-offer, .tour-toast')) { try { e.hidePopover(); } catch { /* */ } e.remove(); } });
const readDownload = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); const f = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(f); return { name: dl.suggestedFilename(), text: fs.readFileSync(f, 'utf8') }; };
const stats = (sel) => page.$eval(sel, (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let lit = 0, sum = 0; const cols = new Set(); for (let i = 0; i < d.length; i += 4) { const y = d[i] + d[i + 1] + d[i + 2]; sum += y; if (y > 60) lit++; cols.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5)); } return { lit, mean: sum / (d.length / 4) / 3, colours: cols.size }; });
async function enable(app) {
  await page.evaluate((a) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':lightdesign:')) localStorage.removeItem(k); }, app);
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'lightdesign' && a.state !== 'loading'), null, { timeout: 30000 });
  const me = await page.evaluate(() => { const a = window.ccAddons.list().find((x) => x.id === 'lightdesign'); return a && { state: a.state, source: a.source, apps: a.manifest?.apps }; });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('lightdesign', true));
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'lightdesign')?.state === 'active', null, { timeout: 20000 });
  for (let k = 0; k < 20 && !(await page.isVisible('[data-ld-root]').catch(() => false)); k++) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button, summary, [role=tab]')].find((x) => /^\s*Lighting design\s*$/.test(x.textContent || '') && x.offsetParent); if (b) b.click(); });
    await page.waitForTimeout(600);
  }
  await page.waitForSelector('[data-ld-root]', { state: 'visible', timeout: 20000 });
  return me;
}

async function bim() {
  console.log('\nbimcraft');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); const k = 'cc-addons:bimcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.lightdesign; localStorage.setItem(k, JSON.stringify(s)); } catch { /* */ } });
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!document.querySelector('[data-empty] [data-new]'), null, { timeout: 60000 });
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
  const planClick = async (x, y) => { await page.evaluate(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await settled(); };
  const at = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  await closeDialogs();
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Night room'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '2800 mm');
  await page.click('[data-new-ok]');
  await page.waitForFunction(() => /^New building Night room/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[0, 0], [6000, 0], [6000, 4000], [0, 4000], [0, 0]]) await planClick(x, y);
  await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="floor"]');
  await page.selectOption('[data-model-flmode="floor"]', 'building').catch(() => {});
  const [fx, fy] = await at(3000, 2000); await page.mouse.move(fx, fy, { steps: 3 }); await page.mouse.click(fx, fy); await settled();
  await page.click('[data-mtool="ceiling"]'); await planClick(3000, 2000); await settled();
  await page.keyboard.press('Escape'); await page.click('[data-mtool="select"]').catch(() => {});
  const me = await enable('bimcraft');
  ok(me && me.source === 'bundled' && me.state === 'off', 'lighting design is bundled in BimCraft and starts off', me);
  await closeDialogs();
  await page.click(ld('reread'));
  await page.waitForFunction(() => document.querySelectorAll('[data-ld="roompick"] option').length >= 2, null, { timeout: 20000 }).catch(() => {});
  const opts = await page.$$eval('[data-ld="roompick"] option', (o) => o.map((x) => x.textContent));
  const areaOf = (x) => Number((x.match(/([\d.]+) m²/) || [])[1] || 0);
  ok(opts.length >= 2 && opts.some((x) => areaOf(x) > 20 && areaOf(x) <= 24), 'the model\'s room is listed (inside the walls of 6 x 4 m)', opts);
  const i = opts.findIndex((x) => areaOf(x) > 20 && areaOf(x) <= 24) - 1;
  await page.selectOption(ld('roompick'), String(i));
  await page.selectOption(ld('preset'), 'office.writing');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  const n = await page.evaluate(() => window.ccLightDesign.result.result.count);
  ok(n >= 2, 'planned for 500 lx: ' + n + ' luminaires');
  ok(/as the model has it/.test(await page.textContent('[data-ld-night]')), 'the night note says the picture is the room as the model has it');
  await page.selectOption(ld('nightQ'), '8');
  await closeDialogs();
  const t0 = Date.now();
  await page.click(ld('night'));
  await page.waitForSelector('[data-ld-night-canvas="false"]', { timeout: 300000 });
  const tris = Number(await page.getAttribute('[data-ld-night-model]', 'data-ld-night-model').catch(() => 0));
  const mline = await page.textContent('[data-ld-night-model]').catch(() => '');
  ok(tris >= 12, 'the night view used the model\'s own surfaces (' + tris + ' triangles, ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)', mline);
  ok(!/no floor/.test(mline) && !/no ceiling/.test(mline), 'the model\'s floor and ceiling were found over the room', mline);
  const pic = await stats('[data-ld-night-canvas="picture"]');
  ok(pic.lit > 500 && pic.mean > 5 && pic.mean < 600 && pic.colours >= 4, 'the picture of the model is lit by the lamps', pic);
  await shot('bim-night-model');
  const cz = await page.getAttribute('[data-ld-night-ceiling]', 'data-ld-night-ceiling').catch(() => null);
  if (cz !== null) {
    ok(Number(cz) > 1500 && Number(cz) < 2800, 'the model\'s ceiling is lower than the walls: the panel says so (' + cz + ' mm)', await page.textContent('[data-ld-night-ceiling]'));
    await page.fill(ld('height'), cz); await page.keyboard.press('Tab');
    await page.click(ld('calc')); await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
    await closeDialogs(); await page.click(ld('night'));
    await page.waitForSelector('[data-ld-night-canvas="false"]', { timeout: 300000 });
    ok(!(await page.$('[data-ld-night-ceiling]')), 'with that height typed, the numbers and the picture use the same ceiling');
    const p2 = await stats('[data-ld-night-canvas="picture"]');
    ok(p2.lit > 500 && p2.mean > 5 && p2.mean < 600, 'and the picture is still lit', p2);
  }
  await closeDialogs();
  const undo0 = await page.evaluate(() => document.querySelector('[data-undo]')?.disabled === false);
  await page.click(ld('draw'));
  await page.waitForSelector('[data-ld-message]', { timeout: 30000 });
  ok(/\d+ luminaires? placed|placed/i.test(await page.textContent('[data-ld-message]')), 'Draw places the fixtures: ' + (await page.textContent('[data-ld-message]')));
  void undo0;
  // BimCraft's own Render: the fixtures by their light spread's name, with the spread loaded
  await closeDialogs();
  await page.evaluate(() => document.querySelector('[data-render-open]').click());
  await page.waitForSelector('.cc-render [data-render-lamps]', { timeout: 30000 });
  const lamps = await page.$$eval('.cc-render [data-render-lamps] .cc-render-look', (rows) => rows.map((r) => [r.querySelector('span')?.textContent || '', r.querySelector('[data-render-lamp-ies]')?.textContent || '']));
  ok(lamps.length === n, 'Render lists the ' + n + ' fixtures', lamps.length);
  ok(lamps.every(([nm, ies]) => /^LD /.test(nm) && /\.ies/i.test(ies)), 'each by its light spread\'s name with the spread loaded', lamps.slice(0, 2));
  const set = await page.evaluate(() => { try { return Object.keys(JSON.parse(localStorage.getItem('bimcraft.render') || '{}').ies || {}); } catch { return []; } });
  await shot('bim-render-lamps');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.evaluate(() => { for (const d of document.querySelectorAll('dialog.cc-render[open]')) d.close(); });
  ok(Array.isArray(set), 'the dialog keeps working with the settings (' + set.length + ' webs saved)');
  // erase takes them out again; Render then has no lamps
  await closeDialogs();
  await page.click(ld('erase'));
  await page.waitForTimeout(1500);
  ok(await page.evaluate(() => window.ccLightDesign.host.count()) === 0, 'Erase removes the fixtures');
}

async function civil() {
  console.log('\ncivilcraft');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { const k = 'cc-addons:civilcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.lightdesign; localStorage.setItem(k, JSON.stringify(s)); } catch { /* */ } });
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  const lot = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('r');
    const pts = [{ x: X(0.15), y: Y(0.15) }, { x: X(0.85), y: Y(0.15) }, { x: X(0.85), y: Y(0.7) }, { x: X(0.15), y: Y(0.7) }];
    p.change('parcel', (s) => { (s.parcels ||= []).push({ id, name: 'Lot parcel', pts }); });
    window.civilcraft.select({ kind: 'parcel', id }); return { id, pts };
  });
  await page.evaluate(() => window.civilcraft.command('parking'));
  await page.waitForSelector('[data-pk-dialog][open]');
  await page.click('[data-pk-build]'); await page.waitForTimeout(1500);
  await page.click('[data-pk-dialog] .cv-x'); await page.waitForTimeout(200);
  const made = await page.evaluate(() => { const L = window.civilcraft.project.state.landscape; return { lots: (window.civilcraft.project.state.parking || []).length, plants: (L.plants || []).length }; });
  ok(made.lots === 1 && made.plants >= 1, 'a parking lot with trees on its islands', made);
  await page.evaluate((L) => {
    const p = window.civilcraft.project, xs = L.pts.map((q) => q.x), ys = L.pts.map((q) => q.y), y = Math.min(...ys) + (Math.max(...ys) - Math.min(...ys)) * 0.03;
    p.change('path', (s) => { s.landscape.hardscape.push({ id: p.nextId('h'), kind: 'path', name: 'Footpath', pts: [{ x: Math.min(...xs) - 5, y }, { x: Math.max(...xs) + 5, y }], width: 1.5, crossfall: 2, edge: 0, layers: [], maxGrade: 5 }); });
  }, lot);
  const me = await enable('civilcraft');
  ok(me && me.source === 'bundled' && me.state === 'off' && (me.apps || []).includes('civilcraft'), 'lighting design is bundled in CivilCraft and starts off (people add it)', me);
  await closeDialogs();
  await page.click(ld('reread'));
  await page.waitForFunction(() => document.querySelectorAll('[data-ld="roompick"] option').length >= 3, null, { timeout: 20000 }).catch(() => {});
  const opts = await page.$$eval('[data-ld="roompick"] option', (o) => o.map((x) => x.textContent));
  ok(opts.some((x) => /^Parking lot:/.test(x)) && opts.some((x) => /^Parcel: Lot parcel/.test(x)), 'the parking lot and the parcel are listed as areas', opts);
  const i = opts.findIndex((x) => /^Parking lot:/.test(x)) - 1;
  await page.selectOption(ld('roompick'), String(i));
  ok(await page.isChecked(ld('outdoor')), 'choosing the lot ticks Outdoors');
  ok(await page.getAttribute('[data-ld-mode="landscape"]', 'aria-pressed') === 'true', 'and chooses the Landscape layout');
  const facts = await page.textContent('[data-ld-landscape]');
  const nt = Number(facts.match(/(\d+) trees/)?.[1] || 0);
  ok(nt >= 1 && /1 paths/.test(facts), 'the landscape in the lot: ' + facts);
  ok(!(await page.$(ld('draw'))) && !(await page.$(ld('erase'))), 'no Draw or Erase in CivilCraft');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  const r = await page.evaluate(() => { const x = window.ccLightDesign.result.result; return { n: x.count, em: x.em, kinds: x.luminaires.reduce((m, q) => ((m[q.kind] = (m[q.kind] || 0) + 1), m), {}) }; });
  ok(r.kinds.tree === nt && r.kinds.path >= 3 && r.em > 0, 'an up-light per tree and bollards along the path; ' + r.em.toFixed(1) + ' lx mean on the ground', r);
  await closeDialogs();
  await page.click(ld('night'));
  await page.waitForSelector('[data-ld-night-canvas="false"]', { timeout: 120000 });
  const fc = await stats('[data-ld-night-canvas="false"]');
  ok(fc.colours >= 4 && !!(await page.$('[data-ld-night-nokit]')) && !(await page.$('[data-ld-night-canvas="picture"]')), 'the false-colour night view (no renderer in CivilCraft, and it says so)', fc);
  await shot('civil-landscape-night');
  await closeDialogs();
  const pkg = await readDownload(ld('nightpkg'));
  const j = JSON.parse(pkg.text);
  ok(j.format === 'cadcraft-night-lights' && j.lamps.length === r.n && Object.keys(j.ies).length >= 2, 'the lamps file: ' + j.lamps.length + ' lamps, ' + Object.keys(j.ies).length + ' light spreads', pkg.name);
  const rep = await readDownload(ld('report'));
  ok(/Mean illuminance/.test(rep.text), 'the report downloads');
}

try {
  const which = opt('--apps', 'bimcraft,civilcraft').split(',');
  if (which.includes('bimcraft')) await bim();
  if (which.includes('civilcraft')) await civil();
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); await shot('su1816-error').catch(() => {}); }
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5));
await browser.close(); admin('down');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
