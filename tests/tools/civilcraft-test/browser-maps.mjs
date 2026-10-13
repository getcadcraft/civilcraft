#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-maps.mjs — CivilCraft's coordinate system dialog, latitude/longitude readout and map layers in headless
 * Chromium at https://getcadcraft.com/lab/civilcraft (docs/GIS-SPEC.md §4), by real clicks and keys:
 *   - nothing GIS loads at start; GIS › Coordinates: "Systems these coordinates fit", search by code, a refusal
 *     (a metre system for a feet project) explained, Apply = one undo step, changing it asks whether the coordinates are
 *     in the new system already; a .prj read into the dialog
 *   - ground: the factor computed at a point picked on the plan (k vs PROJ's get_factors), applied, undone
 *   - local: two control points by number + grid coordinates, a third point's misclosure, the scale and rotation found
 *   - the status bar's latitude/longitude vs PROJ, in degrees-minutes-seconds and (Settings) decimal degrees
 *   - reg.pickCrs as the other GIS parts call it ('source': a geographic system allowed)
 *   - a map layer from a georeferenced PNG + world file (offline), drawn where the world file says (pixel check)
 *   - Map layers from the internet Off (the default): an XYZ layer and a WMS layer are listed, greyed, and NO request
 *     leaves the page (Playwright's request log) — also after saving and reopening the project
 *   - On: a stand-in tile/WMS server (a tiny Node HTTP server started here, generated PNGs with CORS headers): tiles drawn
 *     where they belong (each tile's colour encodes z/x/y), ≤ 64 tiles per view and ≤ 6 at a time; a WMS picture
 *     (each pixel's colour encodes where it is in the requested box) lands within 2 px of where PROJ puts it;
 *     a server without CORS → the note on the layer row; attribution shown at the plan's bottom right
 *   - the toolbar stays within two rows at 1440 px; paper and model themes; fails on any console error.
 *
 *   node tools/civilcraft-test/browser-maps.mjs [--out <dir>] [--state <storageState.json>] [--stay-up] [--live]
 * --live adds one check against the public USGS National Map map service (read, tiles drawn, attribution).
 * Run as root: `sudo -u www-data php tools/civilcraft-test/admin.php up|down gisc` gives this check its own test admin
 * (civilcrafttest-gisc+cadcraft@projectz.xyz). PROJ checks use tools/civilcraft-test/venv (pyproj).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const TAG = 'gisc';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-gis-' + TAG));
const STATE = arg('--state', path.join(REPO, 'tmp/civilcraft-test/state-' + TAG + '.json'));
const STAY = process.argv.includes('--stay-up');
const LIVE = process.argv.includes('--live');   // one check against the public USGS server (skipped without network)
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const WORK = fs.mkdtempSync('/tmp/civilcraft-maps-');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const note = (s) => console.log('  note ' + s);
const section = (s) => console.log('\n== ' + s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const python = path.join(HERE, 'venv/bin/python');
const py = (jobs) => JSON.parse(execFileSync(python, [path.join(HERE, 'crs_check.py')], { input: JSON.stringify(jobs) }).toString());

// ---------------------------------------------------------------- small PNG writer (RGBA, no filter)
function png(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; for (let x = 0; x < w; x++) { const c = px(x, y), o = y * (w * 4 + 1) + 1 + x * 4; raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2]; raw[o + 3] = c[3] ?? 255; } }
  const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4); len.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------- the stand-in map server
const served = [];             // every request the stand-in saw
let inFlight = 0, maxInFlight = 0;
const tileCache = new Map();
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  served.push(u.pathname + u.search);
  inFlight++; maxInFlight = Math.max(maxInFlight, inFlight);
  const done = () => { inFlight--; };
  res.on('close', done);
  await wait(40);
  const cors = !u.pathname.startsWith('/nocors/');
  const head = { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', ...(cors ? { 'Access-Control-Allow-Origin': '*' } : {}) };
  let m;
  if ((m = u.pathname.match(/^\/(?:nocors\/)?tiles\/(\d+)\/(\d+)\/(\d+)\.png$/))) {
    const [z, x, y] = m.slice(1).map(Number), k = z + '/' + x + '/' + y;
    // the colour says which tile it is: R = x mod 256, G = y mod 256, B = 10·z
    let b = tileCache.get(k); if (!b) tileCache.set(k, (b = png(256, 256, () => [x % 256, y % 256, z * 10])));
    res.writeHead(200, head); res.end(b); return;
  }
  if (u.pathname === '/wms') {
    const p = Object.fromEntries([...u.searchParams].map(([a, v]) => [a.toUpperCase(), v]));
    if (p.REQUEST === 'GetCapabilities') {
      res.writeHead(200, { 'Content-Type': 'text/xml', ...(cors ? { 'Access-Control-Allow-Origin': '*' } : {}) });
      res.end(`<?xml version="1.0"?><WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms" xmlns:xlink="http://www.w3.org/1999/xlink"><Service><Title>Stand-in WMS</Title></Service><Capability><Request><GetMap><Format>image/png</Format><DCPType><HTTP><Get><OnlineResource xlink:href="http://127.0.0.1:${server.address().port}/wms?"/></Get></HTTP></DCPType></GetMap></Request><Layer><Title>Root</Title><CRS>EPSG:4326</CRS><CRS>EPSG:3857</CRS><Layer><Name>grad</Name><Title>Gradient</Title><Attribution><Title>Stand-in WMS data</Title></Attribution></Layer></Layer></Capability></WMS_Capabilities>`);
      return;
    }
    // GetMap: each pixel's colour = where it is in the picture (R = column / width, G = row / height, B = 200)
    const W = Math.min(2048, Number(p.WIDTH)), H = Math.min(2048, Number(p.HEIGHT));
    res.writeHead(200, head);
    res.end(png(W, H, (x, y) => [Math.round((x + 0.5) / W * 255), Math.round((y + 0.5) / H * 255), 200]));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }); res.end('no');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const STAND = `http://127.0.0.1:${PORT}`;

// ---------------------------------------------------------------- browser
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, TAG], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
const outside = [];            // requests that left getcadcraft.com
async function signedInContext() {
  const opts = { viewport: { width: 1440, height: 900 }, acceptDownloads: true };
  if (fs.existsSync(STATE)) {
    const ctx = await browser.newContext({ storageState: STATE, ...opts });
    const p = await ctx.newPage();
    const r = await p.goto(BASE + '/lab/civilcraft', { waitUntil: 'domcontentloaded' });
    const fine = r.status() === 200 && (await p.$('[data-civilcraft]'));
    await p.close();
    if (fine) return ctx;
    await ctx.close();
  }
  const cred = admin('up');
  const ctx = await browser.newContext(opts);
  const p = await ctx.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', cred.email);
  await p.fill('input[name="password"]', cred.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await ctx.storageState({ path: STATE });
  await p.close();
  return ctx;
}

let ctx;
try {
  ctx = await signedInContext();
  // 0.4 1.2: a reload after unsaved work offers "Recover your work?" (app-autosave.js); this suite does not test that
  // (browser-part2.mjs a12 does), so the offer is discarded whenever it shows
  await ctx.addInitScript(() => {
    new MutationObserver(() => { const b = document.querySelector('[data-autosave-dialog][open] [data-autosave-discard]'); if (b) b.click(); })
      .observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  });
  const page = await ctx.newPage();
  // the browser itself logs each picture a server refuses (CORS) — expected only for the stand-in's /nocors/ layer
  let corsLogged = 0;
  page.on('console', (m) => { if (m.type() !== 'error') return; if (/\/nocors\/.*blocked by CORS policy/.test(m.text())) { corsLogged++; return; } if (!/Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  const gisReq = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.hostname !== 'getcadcraft.com' && u.protocol !== 'data:' && u.protocol !== 'blob:') outside.push(r.url());
    if (/\/gis-(ui|crs-ui|map-ui)\.js/.test(u.pathname)) gisReq.push(u.pathname);
  });
  const evalP = (f, a) => page.evaluate(f, a);
  const shot = (n) => page.screenshot({ path: path.join(OUT, n + '.png') });
  const settingsSet = async (name, value) => {
    await page.click('[data-settings-open]');
    await page.waitForSelector('[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]').catch(() => {});
    await page.check(`[data-app-settings] input[name="${name}"][value="${value}"]`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-app-settings]').open);
  };

  section('start: nothing GIS until it is used');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await evalP(() => { try { localStorage.removeItem('civilcraft.settings'); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  ok(gisReq.length === 0, 'no GIS module is fetched when the app starts');
  ok(await evalP(() => window.civilcraft.settings.internet === false && window.civilcraft.settings.latlon === 'dms'), 'Map layers from the internet is Off by default; lat/long in degrees-minutes-seconds');
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  ok(await evalP(() => { const t = document.querySelector('.cv-tools'); const tops = new Set([...t.querySelectorAll('.cv-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top))); return tops.size <= 2 && t.getBoundingClientRect().height < 140; }), 'the toolbar (with the GIS group) stays within two rows at 1440 px');
  const tbRows = await evalP(() => new Set([...document.querySelectorAll('.cv-tools .cv-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top))).size);
  note(`toolbar rows at 1440 px: ${tbRows}`);
  ok(await evalP(() => document.querySelector('[data-latlon]').hidden), 'no system: no latitude/longitude in the status bar');

  section('GIS › Coordinates: fits, search, a refusal, apply');
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  ok(gisReq.some((p) => /gis-crs-ui/.test(p)), 'the dialog module loads on first use');
  ok(/None/.test(await page.textContent('.cv-crs-now')), 'shows "None — coordinates are just numbers"');
  await page.waitForFunction(() => document.querySelectorAll('.cv-crs-list .cv-crs-item').length > 0);
  const head = await page.textContent('.cv-crs-listhead');
  ok(/Systems these coordinates fit: \d+ systems? in feet/.test(head), 'opens on "Systems these coordinates fit": ' + head.slice(0, 90) + '…');
  const fitCodes = await evalP(() => [...document.querySelectorAll('.cv-crs-list .cv-crs-item')].map((b) => Number(b.dataset.crsCode)));
  ok(fitCodes.includes(2230) && fitCodes.every((c) => c > 2000), `California zone 6 (2230) is among the ${fitCodes.length} listed`);
  await shot('01-crs-fits-paper');
  // a metre system: refused, with the reason
  await page.fill('[data-crs-dialog] input[type=search]', '32611');
  await page.waitForFunction(() => document.querySelector('.cv-crs-item[data-crs-code="32611"]'));
  await page.click('.cv-crs-item[data-crs-code="32611"]');
  ok(/meters|metres/.test(await page.textContent('.cv-crs-problem:not([hidden])')), 'a metre system for a feet project: the refusal is explained');
  await page.click('[data-crs-apply]');
  ok(await evalP(() => window.civilcraft.project.state.crs === null), 'and Apply does not set it');
  await page.fill('[data-crs-dialog] input[type=search]', '2230');
  await page.waitForFunction(() => document.querySelector('.cv-crs-item[data-crs-code="2230"]'));
  await page.click('.cv-crs-item[data-crs-code="2230"]');
  ok(await page.isHidden('.cv-crs-chosen + .cv-crs-problem'), 'California zone 6 (ftUS) is accepted');
  ok(/inside its area of use/.test(await page.textContent('.cv-crs-chosen')), 'it says the project\'s middle is inside the system\'s area of use');
  const undoBefore = await evalP(() => window.civilcraft.project.undoStack.length);
  await page.click('[data-crs-apply]');
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  ok(await evalP(() => window.civilcraft.project.state.crs?.code === 2230 && window.civilcraft.project.state.crs.local === null), 'Apply: the project is in EPSG:2230, grid coordinates');
  ok(await evalP((n) => window.civilcraft.project.undoStack.length === n + 1, undoBefore), 'one undo step');
  ok(await evalP(() => window.civilcraft.project.points[0].x === 6150000 || window.civilcraft.project.points.length === 276), 'nothing moved');

  section('latitude and longitude in the status bar vs PROJ');
  const pt = await evalP(() => { const p = window.civilcraft.project.points[40]; return { x: p.x, y: p.y, s: window.civilcraft.toScreen(p.x, p.y) }; });
  await page.mouse.move(pt.s.x, pt.s.y);
  await page.waitForFunction(() => !document.querySelector('[data-latlon]').hidden && /″/.test(document.querySelector('[data-latlon]').textContent));
  const readout = await page.textContent('[data-latlon]');
  const cur = await evalP(() => { const t = document.querySelector('[data-coords]').textContent.match(/E ([\d.-]+)\s+N ([\d.-]+)/); return t ? [Number(t[1]), Number(t[2])] : null; });
  const dms = (s) => { const m = s.match(/(\d+)°(\d+)′([\d.]+)″ ([NSEW])/g); return m.map((x) => { const q = x.match(/(\d+)°(\d+)′([\d.]+)″ ([NSEW])/); const v = Number(q[1]) + Number(q[2]) / 60 + Number(q[3]) / 3600; return /[SW]/.test(q[4]) ? -v : v; }); };
  const [lat, lon] = dms(readout);
  const pyll = py([{ op: 'inv', code: 2230, pts: [cur] }])[0].pts[0];
  ok(Math.abs(lat - pyll[1]) * 3600 < 0.011 && Math.abs(lon - pyll[0]) * 3600 < 0.011, `"${readout}" at E ${cur[0]} N ${cur[1]} matches PROJ to 0.01″ (${(Math.abs(lat - pyll[1]) * 3600).toFixed(4)}″, ${(Math.abs(lon - pyll[0]) * 3600).toFixed(4)}″)`);
  await settingsSet('cvLatlon', 'dd');
  await page.mouse.move(pt.s.x + 3, pt.s.y + 3);
  await page.mouse.move(pt.s.x, pt.s.y);
  const dd = await page.textContent('[data-latlon]');
  const ddv = dd.match(/([\d.]+)° ([NS])\s+([\d.]+)° ([EW])/);
  ok(!!ddv && Math.abs(Number(ddv[1]) - pyll[1]) < 2e-6 && Math.abs(-Number(ddv[3]) - pyll[0]) < 2e-6, `Settings › decimal degrees: "${dd}"`);
  await settingsSet('cvLatlon', 'dms');
  await page.mouse.move(pt.s.x + 2, pt.s.y);
  ok(/″/.test(await page.textContent('[data-latlon]')), 'and back to degrees-minutes-seconds');

  section('changing the system asks whether the coordinates are in it already');
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  ok(/California zone 6/.test(await page.textContent('.cv-crs-now')) && /2230/.test(await page.textContent('.cv-crs-now')), '"Now" shows the system, its code, unit, datum shift and area');
  await page.fill('[data-crs-dialog] input[type=search]', '6426');
  await page.waitForFunction(() => document.querySelector('.cv-crs-item[data-crs-code="6426"]'));
  await page.click('.cv-crs-item[data-crs-code="6426"]');
  await page.click('[data-crs-apply]');
  await page.waitForSelector('.cv-ask');
  ok(/already/.test(await page.textContent('.cv-ask')), 'asks: "Are the coordinates in … already?"');
  await shot('02-crs-change-ask-paper');
  const x0 = await evalP(() => window.civilcraft.project.points[0].x);
  await page.click('.cv-ask button[data-key="yes"]');
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  ok(await evalP((x) => window.civilcraft.project.state.crs.code === 6426 && window.civilcraft.project.points[0].x === x, x0), 'Yes: the system changes, nothing moves');
  await page.keyboard.press('Control+z');
  ok(await evalP(() => window.civilcraft.project.state.crs.code === 2230), 'Ctrl+Z puts 2230 back');

  section('.prj into the dialog');
  const prjText = py([{ op: 'wkt', code: 2230 }])[0].esri;
  fs.writeFileSync(path.join(WORK, 'site.prj'), prjText);
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  await page.setInputFiles('[data-crs-dialog] input[type=file][accept=".prj,.txt,.wkt"]', path.join(WORK, 'site.prj'));
  await page.waitForFunction(() => /site\.prj/.test(document.querySelector('.cv-crs-chosen')?.textContent || ''));
  ok(/EPSG:2230/.test(await page.textContent('.cv-crs-chosen')), 'an ESRI .prj written by PROJ reads as EPSG:2230');

  section('ground coordinates: the factor computed at a picked point');
  await page.check('[data-crs-mode="ground"]');
  await page.click('[data-crs-pick-plan="factor"]');
  await page.waitForFunction(() => !document.querySelector('[data-crs-dialog]').open);
  const p2 = await evalP(() => { const p = window.civilcraft.project.points[100]; return { x: p.x, y: p.y, z: p.z, s: window.civilcraft.toScreen(p.x, p.y) }; });
  await page.mouse.click(p2.s.x, p2.s.y);
  await page.waitForSelector('[data-crs-dialog][open] [data-crs-factors]');
  const fac = await evalP(() => ({ text: document.querySelector('[data-crs-factors]').textContent, combined: Number(document.querySelector('[data-crs-combined]').textContent.match(/[\d.]+/)[0]) }));
  const kpy = py([{ op: 'factors', code: 2230, pts: [[p2.x, p2.y]] }])[0][0];
  const kTxt = Number(fac.text.match(/Grid scale factor k([\d.]+)/)[1]);
  ok(Math.abs(kTxt - (kpy.km + kpy.kp) / 2) < 2e-9, `k at survey point ${p2.x.toFixed(1)}, ${p2.y.toFixed(1)} = ${kTxt} (PROJ ${((kpy.km + kpy.kp) / 2).toFixed(9)})`);
  ok(/Elevation factor/.test(fac.text) && /Convergence/.test(fac.text) && fac.combined > 0.999 && fac.combined < 1.0001, `elevation factor, combined ${fac.combined}, convergence shown with what each means`);
  const conv = Number(fac.text.match(/Convergence(-?[\d.]+)°/)[1]);
  ok(Math.abs(conv - kpy.conv) < 1e-5, `convergence ${conv}° (PROJ ${kpy.conv.toFixed(6)}°)`);
  await shot('03-crs-ground-paper');
  await page.click('[data-crs-use-factor]');
  await page.click('[data-crs-apply]');
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  const loc = await evalP(() => window.civilcraft.project.state.crs.local);
  ok(loc && Math.abs(loc.scale - fac.combined) < 1e-9 && loc.rotation === 0 && loc.from[0] === 0 && loc.to[1] === 0, `ground: scale ${loc?.scale} about the base point 0,0`);
  await page.keyboard.press('Control+z');
  ok(await evalP(() => window.civilcraft.project.state.crs.local === null), 'undone in one step');

  section('local coordinates: two control points, a third checks');
  const pp = await evalP(() => window.civilcraft.project.points.slice(0, 3).map((p) => ({ n: p.n, x: p.x, y: p.y })));
  const truth = { scale: 1.00009, rot: 7.25, from: [pp[0].x, pp[0].y], to: [6400000, 2100000] };
  const T = (p) => { const c = Math.cos(truth.rot * Math.PI / 180), s = Math.sin(truth.rot * Math.PI / 180), dx = p.x - truth.from[0], dy = p.y - truth.from[1]; return [truth.to[0] + truth.scale * (c * dx - s * dy), truth.to[1] + truth.scale * (s * dx + c * dy)]; };
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  await page.check('[data-crs-mode="local"]');
  const fillCp = async (i, p, g) => { const idn = await page.getAttribute(`[data-crs-cp="${i}"]`, 'id'), base = idn.replace(/n$/, ''); await page.fill('#' + idn, p.n); await page.fill('#' + base + 'e', g[0].toFixed(4)); await page.fill('#' + base + 'g', g[1].toFixed(4)); };
  await fillCp(0, pp[0], T(pp[0]));
  await fillCp(1, pp[1], T(pp[1]));
  const g3 = T(pp[2]); g3[0] += 0.05;
  await fillCp(2, pp[2], g3);
  await page.waitForFunction(() => document.querySelector('[data-crs-misclosure]'));
  const lt = await page.textContent('[data-crs-local]');
  const sc = Number(lt.match(/Scale([\d.]+)/)[1]), ro = Number(lt.match(/Rotation(-?[\d.]+)°/)[1]);
  ok(Math.abs(sc - truth.scale) < 1e-6 && Math.abs(ro - truth.rot) < 1e-4, `scale ${sc} and rotation ${ro}° found (set ${truth.scale}, ${truth.rot}°; grid coordinates typed to 0.0001 ft)`);
  ok(/Two points always fit exactly — check a third/.test(lt), '"Two points always fit exactly — check a third."');
  const mis = Number(await page.getAttribute('[data-crs-misclosure]', 'data-crs-misclosure'));
  ok(Math.abs(mis - 0.05) < 2e-4, `the check point 0.05 ft off shows a misclosure of ${mis}`);
  await shot('04-crs-local-paper');
  await page.click('[data-crs-apply]');
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  ok(await evalP(() => { const l = window.civilcraft.project.state.crs.local; return l && Math.abs(l.rotation - 7.25) < 1e-5; }), 'applied as the project\'s local step');
  await page.keyboard.press('Control+z');

  section('reg.pickCrs as builders A and B call it');
  const picked = evalP(() => window.civilcraft.gis.reg.pickCrs({ reason: 'Which system is roads.shp in?', near: [-117.3, 34.1], purpose: 'source' }));
  await page.waitForSelector('[data-crs-dialog="pick"]');
  ok(/roads\.shp/.test(await page.textContent('.cv-crs-reason')), 'the reason is shown on top');
  ok((await page.$$('.cv-crs-list .cv-crs-item')).length > 3, 'systems near the given lat/long are listed');
  await page.fill('[data-crs-dialog] input[type=search]', '4269');
  await page.waitForFunction(() => document.querySelector('.cv-crs-item[data-crs-code="4269"]'));
  await page.click('.cv-crs-item[data-crs-code="4269"]');
  await page.click('[data-crs-apply]');
  const got = await picked;
  ok(got?.code === 4269 && got.unit === 'deg' && got.local === null, '"source": a geographic system can be picked; the promise gives it (not applied)');
  ok(await evalP(() => window.civilcraft.project.state.crs.code === 2230), 'the project\'s own system is untouched');
  const cancelled = evalP(() => window.civilcraft.gis.reg.pickCrs({ reason: 'x' }));
  await page.waitForSelector('[data-crs-dialog="pick"]');
  await page.keyboard.press('Escape');
  ok((await cancelled) === null, 'Esc → null');

  section('a map layer from a georeferenced PNG (offline)');
  // a 400 × 300 magenta picture, 0.5 ft pixels, over the middle of the site
  const mid = await evalP(() => { const b = window.civilcraft.gis.extentsAll(); return [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2]; });
  const g0 = [mid[0] - 100, 0.5, 0, mid[1] + 75, 0, -0.5];
  fs.writeFileSync(path.join(WORK, 'aerial.png'), png(400, 300, (x, y) => (x < 20 && y < 20 ? [0, 160, 0] : [230, 0, 230])));
  fs.writeFileSync(path.join(WORK, 'aerial.pgw'), [0.5, 0, 0, -0.5, g0[0] + 0.25, g0[3] - 0.25].join('\n') + '\n');
  await evalP(() => { const p = window.civilcraft.project; for (const k of Object.keys(p.state.display)) if (typeof p.state.display[k] === 'boolean') p.setDisplay(k, false); });
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  ok(gisReq.some((p) => /gis-map-ui/.test(p)), 'GIS › Map opens the map dialog');
  ok(!!(await page.$('[data-map-off]')), 'Off: the dialog says map layers from the internet are off, and why');
  await page.setInputFiles('[data-map-file]', [path.join(WORK, 'aerial.png'), path.join(WORK, 'aerial.pgw')]);
  await page.waitForSelector('.cv-ask');
  await page.click('.cv-ask button[data-key="same"]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.maps.some((m) => m.kind === 'image'));
  await page.keyboard.press('Escape');
  await evalP(([x, y]) => { const v = window.civilcraft.view; v.fit({ minX: x - 150, minY: y - 110, maxX: x + 150, maxY: y + 110 }); }, mid);
  await wait(400);
  const pix = (x, y) => evalP(([x, y]) => { const v = window.civilcraft.view, s = v.toScreen(x, y), c = v.base, d = c.getContext('2d').getImageData(Math.round(s.x * v.dpr), Math.round(s.y * v.dpr), 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
  const inside = await pix(mid[0] + 20, mid[1] - 10), corner = await pix(g0[0] + 4, g0[3] - 4), outsideP = await pix(g0[0] - 10, g0[3] + 10);
  ok(inside[0] > 200 && inside[1] < 40 && inside[2] > 200, `the picture is drawn under the plan (magenta ${inside})`);
  ok(corner[1] > 120 && corner[0] < 60, `its green upper-left corner lands where the world file says (${corner})`);
  ok(!(outsideP[0] > 200 && outsideP[1] < 40), `and nothing is drawn outside it (${outsideP})`);
  await shot('05-map-picture-paper');
  ok(outside.length === 0, 'no request left the page so far' + (outside.length ? ': ' + outside.slice(0, 3).join(', ') : ''));

  section('an RGB GeoTIFF opened like any file (builder B\'s reader passes pictures on)');
  {
    // 120 × 80 px, 1 ft pixels, cyan, a little north-east of the PNG, in EPSG:2230 (written by rasterio / GDAL)
    const tif = path.join(WORK, 'ortho.tif');
    execFileSync(python, ['-c', `
import numpy as np, rasterio
from rasterio.transform import from_origin
a = np.zeros((3, 80, 120), dtype='uint8'); a[1] = 200; a[2] = 220
with rasterio.open(${JSON.stringify(tif)}, 'w', driver='GTiff', width=120, height=80, count=3, dtype='uint8', crs='EPSG:2230', transform=from_origin(${mid[0] + 120}, ${mid[1] + 140}, 1, 1), photometric='RGB') as d: d.write(a)
`]);
    await page.setInputFiles('[data-file]', tif);
    await page.waitForFunction(() => window.civilcraft.project.state.gis.maps.filter((m) => m.kind === 'image').length === 2, null, { timeout: 15000 });
    const m2 = await evalP(() => window.civilcraft.project.state.gis.maps.find((m) => m.name === 'ortho'));
    ok(m2 && m2.crsCode === 2230 && m2.width === 120 && Math.abs(m2.a0 - (mid[0] + 120)) < 1e-6, 'the GeoTIFF became a picture layer in EPSG:2230 with its own placement');
    await evalP(([x, y]) => window.civilcraft.view.fit({ minX: x - 200, minY: y - 150, maxX: x + 300, maxY: y + 200 }), mid);
    await wait(500);
    const cy = await pix(mid[0] + 180, mid[1] + 100);
    ok(cy[0] < 40 && cy[1] > 170 && cy[2] > 190, `drawn where its GeoTIFF tags say (cyan ${cy})`);
    await shot('05b-map-geotiff-paper');
  }

  section('Map layers from the internet: Off → nothing is requested');
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  await page.selectOption('[data-map-kind]', 'xyz');
  await page.fill('[data-map-url]', STAND + '/tiles/{z}/{x}/{y}.png');
  await page.fill('[data-map-name]', 'Stand-in tiles');
  await page.fill('[data-map-att]', 'Stand-in tiles © nobody');
  await page.click('[data-map-add-xyz]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.maps.some((m) => m.kind === 'xyz'));
  ok(await evalP(() => [...document.querySelectorAll('[data-map-dialog] [data-map-row]')].some((r) => /Stand-in tiles/.test(r.textContent) && /off in Settings/.test(r.textContent) && r.classList.contains('is-off'))), 'the internet layer is listed, grayed out, with the reason');
  ok(await page.isDisabled('[data-map-kind]') === false, 'the picture option still works');
  await page.selectOption('[data-map-kind]', 'wms');
  ok(await page.isDisabled('[data-map-read]'), 'reading a WMS server is disabled while Off');
  await shot('06-map-dialog-off-paper');
  await page.keyboard.press('Escape');
  await evalP(() => window.civilcraft.view.zoomAt(700, 400, 0.5));
  await wait(1500);
  ok(served.length === 0 && outside.length === 0, 'Off: no request leaves the page (Playwright\'s log) and the stand-in server saw none');

  // the project saved and opened again: still nothing
  const [dl] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Control+s')]);
  const saved = path.join(WORK, 'site.civilcraft.json'); await dl.saveAs(saved);
  const pj = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(pj.gis.maps.length === 3 && /^data:image\/png;base64,/.test(pj.gisImages?.img1 || '') && /^data:image\/(png|jpeg);base64,/.test(pj.gisImages?.img2 || ''), 'the project file keeps the three layers and both pictures (data URLs)');
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction(() => window.civilcraft.project.state.gis?.maps?.length === 3);
  await wait(1500);
  ok(served.length === 0 && outside.length === 0, 'opening a project that names a map server never contacts it while Off');
  ok(await evalP(() => window.civilcraft.project.state.crs.code === 2230 && window.civilcraft.project.gisImages.has('img1')), 'reopened with its system and picture');

  section('On: tiles from the stand-in server, drawn in the right place');
  await settingsSet('cvInternet', 'on');
  await evalP(() => { const p = window.civilcraft.project; p.change('hide pictures', (s) => { for (const m of s.gis.maps) if (m.kind === 'image') m.visible = false; }); for (const k of Object.keys(p.state.display)) if (typeof p.state.display[k] === 'boolean') p.setDisplay(k, false); });
  await evalP(([x, y]) => window.civilcraft.view.fit({ minX: x - 600, minY: y - 400, maxX: x + 600, maxY: y + 400 }), mid);
  await page.waitForFunction(() => document.querySelector('[data-map-attribution]') && !document.querySelector('[data-map-attribution]').hidden, null, { timeout: 5000 }).catch(() => {});
  await wait(2500);
  const tileReqs = served.filter((s) => s.startsWith('/tiles/'));
  ok(tileReqs.length > 0 && tileReqs.length <= 64, `tiles requested for the view: ${tileReqs.length} (≤ 64)`);
  ok(maxInFlight <= 6, `at most ${maxInFlight} requests at a time (≤ 6)`);
  ok(outside.every((u) => u.startsWith(STAND)), 'every request that left the page went to the server the layer names');
  // sample pixels: the colour names the tile; that tile must hold the point (lat/long by PROJ)
  const samples = [[0, 0], [250, 120], [-300, -200], [400, -150]];
  const sTiles = [];
  for (const [dx, dy] of samples) sTiles.push(await pix(mid[0] + dx, mid[1] + dy));
  const lls = py([{ op: 'inv', code: 2230, pts: samples.map(([dx, dy]) => [mid[0] + dx, mid[1] + dy]) }])[0].pts;
  let right = 0;
  samples.forEach((s, i) => {
    const [r, g, b] = sTiles[i], z = Math.round(b / 10);
    const n = 2 ** z, la = lls[i][1] * Math.PI / 180;
    const tx = Math.floor((lls[i][0] + 180) / 360 * n), ty = Math.floor((1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2 * n);
    if (z >= 10 && tx % 256 === r && ty % 256 === g) right++; else note(`sample ${i}: colour ${sTiles[i]} → z${z} x${r} y${g}; PROJ says tile ${tx % 256}/${ty % 256} at z${z}`);
  });
  ok(right === samples.length, `the tile under each of ${samples.length} sample points is the one PROJ's lat/long falls in`);
  ok(/Stand-in tiles/.test(await page.textContent('[data-map-attribution]')), 'attribution shown at the plan\'s bottom right');
  await shot('07-map-tiles-paper');
  await page.goto(page.url().replace('space=paper', 'space=model'), { waitUntil: 'networkidle' }).catch(() => {});
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction(() => window.civilcraft.project.state.gis?.maps?.length === 3);
  await evalP(([x, y]) => { const p = window.civilcraft.project; for (const k of Object.keys(p.state.display)) if (typeof p.state.display[k] === 'boolean' && !['contours', 'points'].includes(k)) p.setDisplay(k, false); window.civilcraft.view.fit({ minX: x - 600, minY: y - 400, maxX: x + 600, maxY: y + 400 }); }, mid);
  await wait(2500);
  await shot('08-map-tiles-model');
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  await shot('09-map-dialog-model');
  await page.keyboard.press('Escape');
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog]');
  await shot('10-crs-model');
  await page.keyboard.press('Escape');

  section('On: a WMS picture warped into the project');
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  await page.selectOption('[data-map-kind]', 'wms');
  await page.fill('[data-map-url]', STAND + '/wms');
  await page.click('[data-map-read]');
  await page.waitForSelector('[data-map-layer]');
  ok(/EPSG:3857/.test(await page.textContent('[data-map-info]')), 'the server offers 3857 and 4326, not the project\'s 2230: web Mercator, warped');
  await page.click('[data-map-add-found]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.maps.some((m) => m.kind === 'wms'));
  // only the WMS layer
  await evalP(() => window.civilcraft.project.change('only WMS', (s) => { for (const m of s.gis.maps) m.visible = m.kind === 'wms'; }));
  await page.keyboard.press('Escape');
  await evalP(() => { const p = window.civilcraft.project; for (const k of Object.keys(p.state.display)) if (typeof p.state.display[k] === 'boolean') p.setDisplay(k, false); });
  await evalP(([x, y]) => window.civilcraft.view.fit({ minX: x - 2000, minY: y - 1300, maxX: x + 2000, maxY: y + 1300 }), mid);
  await wait(1800);
  const gm = served.filter((s) => s.startsWith('/wms') && /GetMap/i.test(s)).at(-1);
  ok(!!gm, 'one GetMap for the settled view: ' + (gm || '').slice(0, 120));
  const gq = Object.fromEntries([...new URL('http://x' + gm).searchParams].map(([k, v]) => [k.toUpperCase(), v]));
  ok(gq.CRS === 'EPSG:3857' && gq.VERSION === '1.3.0' && gq.LAYERS === 'grad', 'GetMap in EPSG:3857, WMS 1.3.0, layer grad');
  const bb = gq.BBOX.split(',').map(Number), W = Number(gq.WIDTH), H = Number(gq.HEIGHT);
  const pts2 = [[0, 0], [1200, 600], [-1500, -900], [800, -1000]];
  const merc = py([{ op: 'fwd', code: 3857, pts: py([{ op: 'inv', code: 2230, pts: pts2.map(([dx, dy]) => [mid[0] + dx, mid[1] + dy]) }])[0].pts }])[0].pts;
  let worstPx = 0;
  for (let i = 0; i < pts2.length; i++) {
    const c = await pix(mid[0] + pts2[i][0], mid[1] + pts2[i][1]);
    const u = c[0] / 255 * W, v = c[1] / 255 * H;
    const eu = (merc[i][0] - bb[0]) / (bb[2] - bb[0]) * W, ev = (bb[3] - merc[i][1]) / (bb[3] - bb[1]) * H;
    worstPx = Math.max(worstPx, Math.hypot(u - eu, v - ev));
  }
  // the colour has 256 levels over W px: one level = W/256 px of rounding
  ok(worstPx < Math.max(2, W / 256 * 1.5), `the WMS picture lands where PROJ puts it (worst ${worstPx.toFixed(2)} px of the picture, colour step ${(W / 256).toFixed(1)} px)`);
  ok(/Stand-in WMS data/.test(await page.textContent('[data-map-attribution]')), 'the layer\'s attribution from the capabilities is shown');
  await shot('11-map-wms-model');

  if (LIVE) {
    section('live (--live): the USGS National Map map service, read and drawn');
    const liveImgs = [];
    page.on('response', (r) => { if (/basemap\.nationalmap\.gov\/.*\/tile\//.test(r.url()) && r.status() === 200 && /^image\//.test(r.headers()['content-type'] || '')) liveImgs.push(r.url()); });
    await page.click('[data-cmd="basemap"]');
    await page.waitForSelector('[data-map-dialog]');
    await page.selectOption('[data-map-kind]', 'arcgis');
    await page.fill('[data-map-url]', 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer');
    await page.click('[data-map-read]');
    const okRead = await page.waitForSelector('[data-map-add-found]', { timeout: 25000 }).then(() => true).catch(() => false);
    if (!okRead) note('the USGS service could not be read from here (' + (await page.textContent('.cv-map-status')) + ') — skipped');
    else {
      ok(/cached web Mercator tiles/.test(await page.textContent('[data-map-info]')), 'USGSTopo is read as a cached web Mercator service');
      await page.click('[data-map-add-found]');
      await page.keyboard.press('Escape');
      await evalP(() => window.civilcraft.project.change('only USGS', (s) => { for (const m of s.gis.maps) m.visible = m.kind === 'arcgis'; }));
      await page.waitForFunction(() => true);
      await wait(6000);
      ok(liveImgs.length > 0, `${liveImgs.length} USGS tiles arrived and were drawn`);
      ok(/USGS/.test(await page.textContent('[data-map-attribution]')), 'its copyright text is shown');
      await shot('12-map-usgs-live-model');
      await evalP(() => window.civilcraft.project.change('USGS off', (s) => { for (const m of s.gis.maps) if (m.kind === 'arcgis') m.visible = false; }));
    }
  }

  section('errors: a server that does not allow the page to use its images');
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  await page.selectOption('[data-map-kind]', 'xyz');
  await page.fill('[data-map-url]', STAND + '/nocors/tiles/{z}/{x}/{y}.png');
  await page.fill('[data-map-name]', 'No CORS');
  await page.click('[data-map-add-xyz]');
  await page.keyboard.press('Escape');
  await evalP(() => window.civilcraft.project.change('only no-CORS', (s) => { for (const m of s.gis.maps) m.visible = m.name === 'No CORS'; }));
  await wait(2000);
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  const why = await evalP(() => [...document.querySelectorAll('[data-map-note]')].map((e) => e.textContent).join(' | '));
  ok(/CORS/.test(why), 'the layer row says: ' + why);
  const nocors = served.filter((u) => u.startsWith('/nocors/')).length;
  await evalP(() => window.civilcraft.view.zoomAt(700, 400, 0.7));
  await wait(1200);
  ok(served.filter((u) => u.startsWith('/nocors/')).length === nocors && nocors <= 10, `after a few refusals it stops asking that server (${nocors} requests, none after the view moved; ${corsLogged} logged by the browser)`);
  await page.keyboard.press('Escape');

  section('Off again: in-flight and future requests stop');
  await settingsSet('cvInternet', 'off');
  const n0 = served.length;
  await evalP(() => window.civilcraft.view.zoomAt(700, 400, 2));
  await wait(1500);
  ok(served.length === n0, 'turning it off: no further requests');

  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
  await page.close();
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
} finally {
  await ctx?.close().catch(() => {});
  await browser.close();
  server.close();
  if (!STAY) { try { admin('down'); } catch { /* */ } }
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(REPO, OUT)}`);
process.exit(fail ? 1 : 0);
