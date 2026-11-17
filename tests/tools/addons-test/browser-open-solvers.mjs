#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-open-solvers.mjs — the Open solver cases add-on in the real /lab/partcraft page (0.9.1, suggestion 1309). Run as root (a session is minted by
 * tools/addons-test/admin.php; root's Playwright Chromium). One browser, nice, with a timeout:
 *   nice timeout 900 node tools/addons-test/browser-open-solvers.mjs [--shots dir]
 * Bundled and off, added in Settings > Add-ons; the showcase part "Wind tunnel car" (fixtures/showcase) opened on the mesh kernel; the tab; a flow case
 * exported for both lines of the flow solver and the downloaded zip read back here; a named wall, fixed faces and a force picked by CLICKING faces in the 3D
 * view; the structure and impact cases exported (the part meshed by PartCraft's own mesher) and their zips read back; a small VTK result imported through
 * the file chooser and drawn as display bodies saved in the part; the "What you need on your computer" list; the settings saved in the part file and read
 * back with the add-on off; no console errors. The outside solvers are NOT run (they are not on this server).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com', ID = 'open-solvers';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/open-solvers'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());
/** A stored zip read back → [{ name, text }]. */
function unzip(buf) {
  const out = []; let p = 0;
  while (p + 4 <= buf.length && buf.readUInt32LE(p) === 0x04034b50) {
    const method = buf.readUInt16LE(p + 8), crc = buf.readUInt32LE(p + 14), size = buf.readUInt32LE(p + 18), nl = buf.readUInt16LE(p + 26), el = buf.readUInt16LE(p + 28);
    const name = buf.toString('utf8', p + 30, p + 30 + nl), data = buf.subarray(p + 30 + nl + el, p + 30 + nl + el + size);
    if (method !== 0) throw new Error('entry not stored: ' + name);
    if ((zlib.crc32(data) >>> 0) !== crc) throw new Error('bad CRC: ' + name);
    out.push({ name, text: data.toString('utf8') }); p += 30 + nl + el + size;
  }
  return out;
}
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const [cname, cvalue] = admin('session').cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const pane = '[data-osc]';
const unscroll = () => page.evaluate(() => { for (let e = document.querySelector('[data-osc]'); e; e = e.parentElement) if (e.scrollLeft) e.scrollLeft = 0; });
const shot = async (name) => { await unscroll().catch(() => {}); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const act = async (a, scope = pane) => { const sel = scope + ' [data-osc-act="' + a + '"]'; await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' })); await page.click(sel); };
const setSel = async (key, v) => { await page.selectOption(pane + ' [data-osc-set="' + key + '"]', String(v)); await page.waitForTimeout(150); };
const study = () => page.evaluate(() => JSON.parse(JSON.stringify(window.partcraft.part.studies?.['open-solvers'] || null)));
const msg = () => page.textContent(pane + ' [data-osc-msg]').catch(() => '');
/** Press Export and read the downloaded zip back. */
async function exportZip() {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 240000 }), act('export')]);
  const file = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(file);
  const files = unzip(fs.readFileSync(file));
  return { name: dl.suggestedFilename(), files, names: files.map((f) => f.name.split('/').slice(1).join('/')), get: (n) => (files.find((f) => f.name.endsWith('/' + n)) || {}).text };
}
/** A screen point on a face the pointer can hit, not one of `skip` → { x, y, face, name } | null. */
const facePoint = (skip = []) => page.evaluate((skip) => {
  const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, rg = pcw.regen, m = rg.mesh, rect = view.canvas.getBoundingClientRect();
  for (let t = 0; t < m.triFace.length; t++) {
    const fi = m.triFace[t];
    if (skip.includes(fi) || !rg.faces[fi] || !rg.faces[fi].name) continue;
    for (const w of [[1 / 3, 1 / 3, 1 / 3], [0.6, 0.2, 0.2], [0.2, 0.6, 0.2], [0.2, 0.2, 0.6]]) {
      const p = [0, 1, 2].map((c) => w[0] * m.positions[3 * m.indices[3 * t] + c] + w[1] * m.positions[3 * m.indices[3 * t + 1] + c] + w[2] * m.positions[3 * m.indices[3 * t + 2] + c]);
      const v = new THREE.Vector3(...p).project(view.camera);
      const x = rect.left + (v.x + 1) / 2 * rect.width, y = rect.top + (1 - v.y) / 2 * rect.height;
      if (x < rect.left + 4 || y < rect.top + 4 || x > rect.right - 4 || y > rect.bottom - 4) continue;
      const hit = view.pickAt(x, y, { edges: false });
      const hit2 = view.pickAt(x, y);   // what a real click sees (an edge near the point would take it)
      if (hit && hit.kind === 'face' && hit.face === fi && hit2 && hit2.kind === 'face' && hit2.face === fi && rg.faces[fi].area > 200) return { x, y, face: fi, name: rg.faces[fi].name };
    }
  }
  return null;
}, skip);
async function clickFace(skip, groupId) {
  const f = await facePoint(skip);
  if (!f) throw new Error('no face to click');
  await page.evaluate(() => { for (const b of document.querySelectorAll('button')) if (/^\s*No thanks\s*$/.test(b.textContent)) b.click(); });   // the first-visit tour card must not cover the view
  await page.mouse.move(f.x, f.y); await page.waitForTimeout(250); await page.mouse.click(f.x, f.y);
  await page.waitForFunction((g) => ((window.partcraft.part.studies?.['open-solvers']?.groups || []).find((x) => x.id === g)?.faces || []).length === 1, groupId, { timeout: 5000 }).catch(() => { throw new Error('the click at ' + Math.round(f.x) + ',' + Math.round(f.y) + ' on face ' + f.face + ' (' + f.name + ') did not reach ' + groupId); });
  return f;
}
try {
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate((id) => { localStorage.removeItem('partcraft.exactKernel'); const k = 'cc-addons:partcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on[id]; if (s.off) delete s.off[id]; localStorage.setItem(k, JSON.stringify(s)); }, ID);
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons && !!window.partcraft, null, { timeout: 30000 });
  await page.waitForFunction((id) => window.ccAddons.list().some((a) => a.id === id && a.state !== 'loading'), ID, { timeout: 15000 }).catch(() => {});
  const me = await page.evaluate((id) => window.ccAddons.list().find((a) => a.id === id), ID);
  ok(me && me.state === 'off' && me.source === 'bundled', 'Open solver cases is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason }));
  ok(me && me.version === '0.9.1' && me.manifest.api === '1.3' && me.manifest.default === 'off', 'version 0.9.1, add-on API 1.3, default off');
  ok(!(await page.$('.pc-tabs [data-addon="' + ID + '"]')), 'off: no tab in the right panel (never embedded)');

  await page.click('[data-settings-open]');
  if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  const nav = page.locator('.shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });
  if (await nav.count()) await nav.first().click();
  const rowSel = '[data-addons-set] li[data-addon="' + ID + '"]';
  await page.waitForSelector(rowSel, { state: 'visible', timeout: 10000 });
  ok(/Open solver cases/.test(await page.textContent(rowSel)), 'Settings > Add-ons lists Open solver cases');
  await page.$eval(rowSel, (e) => e.scrollIntoView({ block: 'center' }));
  await shot('00-settings-addons');
  await page.click('[data-addon-toggle="' + ID + '"]');
  await page.waitForFunction((id) => window.ccAddons.list().find((a) => a.id === id)?.state === 'active', ID, { timeout: 15000 });
  ok(await page.isChecked('[data-addon-toggle="' + ID + '"]'), 'added (state active)');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());

  // the showcase part
  const car = fs.readFileSync(path.join(ROOT, 'fixtures/showcase/partcraft-wind-tunnel-car.partcraft.json'), 'utf8');
  const opened = await page.evaluate(async ([t, n]) => { await window.partcraft.openText(t, n); await window.partcraft.built(); const r = window.partcraft.regen; return { faces: r.faces.length, named: !!r.named, vol: r.stats.volume, name: window.partcraft.part.name, tris: r.mesh.indices.length / 3, tf: !!r.mesh.triFace }; }, [car, 'partcraft-wind-tunnel-car.partcraft.json']);
  ok(opened.faces > 5 && opened.named && opened.vol > 0 && opened.tf, `the showcase part "${opened.name}" opens on the mesh kernel: ${opened.faces} named faces, ${opened.tris} triangles`, JSON.stringify(opened));
  await page.waitForTimeout(600);
  const tab = await page.$('.pc-tabs [data-addon="' + ID + '"]');
  ok(!!tab && /Solver cases/.test(await tab.textContent()), 'a "Solver cases" tab is in the right panel strip');
  await tab.click();
  await page.waitForSelector(pane, { timeout: 10000 });
  ok(/No case from this add-on has yet been run in the real solvers/.test(await page.textContent(pane + ' [data-osc-honest]')) && /yet been run in the real solvers/.test(await page.textContent(pane + ' [data-osc-note]')), 'the panel says, top and bottom, that no case has been run in the real solvers');
  ok(!(await page.$(pane + ' [title]')), 'no native title tooltips in the panel');
  await page.waitForSelector(pane + ' [data-osc-info]');
  const info = await page.textContent(pane + ' [data-osc-info]');
  ok(/Reynolds number/.test(info) && /k = 1\.5 \(U I\)²/.test(info) && /ω = √k/.test(info) && /Point in the fluid \(checked\)[\s\S]*m/.test(info) && !/none found/.test(info), 'the derived numbers are shown before the export: Reynolds, k, omega, the checked point in the fluid');
  await page.evaluate(() => window.partcraft.view.view('iso')); await page.waitForTimeout(800);
  await shot('01-flow-setup');

  // ---- flow, external, the openfoam.com line
  const z1 = await exportZip();
  ok(z1.name === 'Wind_tunnel_car-openfoam.zip', 'Export downloads ' + z1.name);
  const ESI = ['system/controlDict', 'system/fvSchemes', 'system/fvSolution', 'system/blockMeshDict', 'system/snappyHexMeshDict', 'system/surfaceFeatureExtractDict', 'system/decomposeParDict', 'constant/transportProperties', 'constant/turbulenceProperties', 'constant/triSurface/body.stl', '0.orig/U', '0.orig/p', '0.orig/k', '0.orig/omega', '0.orig/nut', 'Allrun', 'Allclean', 'Wind_tunnel_car.foam', 'README.txt'];
  ok(JSON.stringify([...z1.names].sort()) === JSON.stringify([...ESI].sort()), 'flow case (OpenFOAM v2412): exactly the ' + ESI.length + ' files of that line', z1.names.join(' '));
  ok((z1.get('constant/triSurface/body.stl').match(/facet normal/g) || []).length === opened.tris, 'body.stl holds every triangle of the part (' + opened.tris + ')');
  ok(/application\s+simpleFoam;/.test(z1.get('system/controlDict')) && /locationInMesh \(/.test(z1.get('system/snappyHexMeshDict')) && /OpenFOAM v2412/.test(z1.get('system/controlDict')), 'controlDict and snappyHexMeshDict are in that line\'s form and name the version');
  ok((await page.textContent(pane + ' [data-osc-files]')).split('\n').length === ESI.length && /written: 19 files/.test(await msg()), 'the panel lists the files it wrote');
  // the other line
  await setSel('flow.flavour', 'foundation');
  const z2 = await exportZip();
  const FND = ['system/controlDict', 'system/fvSchemes', 'system/fvSolution', 'system/blockMeshDict', 'system/snappyHexMeshDict', 'system/surfaceFeaturesDict', 'system/decomposeParDict', 'system/functions', 'constant/physicalProperties', 'constant/momentumTransport', 'constant/geometry/body.stl', '0/U', '0/p', '0/k', '0/omega', '0/nut', 'Allrun', 'Allclean', 'Wind_tunnel_car.foam', 'README.txt'];
  ok(JSON.stringify([...z2.names].sort()) === JSON.stringify([...FND].sort()), 'flow case (OpenFOAM-13): exactly the ' + FND.length + ' files of the other line', z2.names.join(' '));
  ok(/solver\s+incompressibleFluid;/.test(z2.get('system/controlDict')) && /insidePoint \(/.test(z2.get('system/snappyHexMeshDict')) && /foamRun/.test(z2.get('Allrun')), 'its keywords: solver incompressibleFluid, insidePoint, foamRun');

  // a named wall picked by clicking a face in the view
  await act('add-wall');
  await page.waitForSelector(pane + ' [data-osc-item="g1"]');
  const wall = await clickFace([], 'g1');
  ok(true, 'clicking a face in the 3D view adds it to the named wall g1 (' + wall.name.slice(0, 40) + ')');
  ok((await page.evaluate(() => window.partcraft.sel))?.kind !== 'face', 'the click did not select anything else in the app');
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => (window.partcraft.part.studies?.['open-solvers']?.groups?.[0]?.faces || []).length === 0, null, { timeout: 5000 });
  await page.keyboard.press('Control+y');
  await page.waitForFunction(() => (window.partcraft.part.studies?.['open-solvers']?.groups?.[0]?.faces || []).length === 1, null, { timeout: 5000 });
  ok(true, 'undo takes the face off, redo puts it back (one undo step a pick)');
  await shot('02-wall-picked');
  await act('pick', pane + ' [data-osc-item="g1"]');   // Done picking
  const z3 = await exportZip();
  ok(z3.names.includes('constant/geometry/wall_g1.stl') && z3.names.includes('constant/geometry/body.stl') && /patches\s+\(wall_g1 body\);/.test(z3.get('system/functions')) && /wall_g1\s*\{[\s\S]*?type\s+noSlip;/.test(z3.get('0/U')), 'the picked wall is its own surface file and patch, in the fields and in the forces function');

  // ---- structure: fixed faces and a force by clicking, PartCraft's own mesher, the three files
  await page.selectOption(pane + ' [data-osc-target]', 'structure');
  await page.waitForSelector(pane + ' [data-osc-act="add-fixed"]');
  ok(!(await page.$(pane + ' [data-osc-item="g1"]')), 'a stress study does not show the flow\'s wall item (it is kept for the flow case)');
  await act('add-fixed'); await page.waitForSelector(pane + ' [data-osc-item="g2"]');
  const fx = await clickFace([], 'g2');
  await act('pick', pane + ' [data-osc-item="g2"]');
  await act('add-force'); await page.waitForSelector(pane + ' [data-osc-item="g3"]');
  const fo = await clickFace([fx.face], 'g3');
  await act('pick', pane + ' [data-osc-item="g3"]');
  ok(fx.face !== fo.face, 'fixed faces g2 and a force g3 picked on two different faces');
  await shot('03-structure-setup');
  const z4 = await exportZip();
  ok(z4.name === 'Wind_tunnel_car-code-aster.zip' && z4.names.join() === 'Wind_tunnel_car.comm,Wind_tunnel_car.mail,Wind_tunnel_car.export,README.txt', 'structure case: comm, mail, export, README', z4.names.join(' '));
  const mail = z4.get('Wind_tunnel_car.mail'), comm = z4.get('Wind_tunnel_car.comm');
  const nTet = (mail.split(' TETRA10\n')[1].split(' FINSF')[0].trim().split('\n').length) / 2;
  ok(nTet > 50 && /GROUP_MA\n FIX_G2\n/.test(mail) && /GROUP_MA\n FRC_G3\n/.test(mail) && mail.split('\n').every((l) => l.length <= 80), `the part was meshed by PartCraft's own mesher (${nTet} ten-node tetrahedra); the mesh file has the picked groups and no line over 80 characters`);
  ok(/DDL_IMPO=\(\s*_F\(GROUP_MA="FIX_G2"/.test(comm) && /FORCE_FACE=\(\s*_F\(GROUP_MA="FRC_G3", FX=0\.0, FY=-/.test(comm) && /MECA_STATIQUE/.test(comm), 'the command file fixes g2 and loads g3 (100 N down by default, as force ÷ area)');
  ok(/quadratic tetrahedra/.test(await page.textContent(pane + ' [data-osc-mesh]')), 'the panel shows the mesh it used');

  // ---- impact
  await page.selectOption(pane + ' [data-osc-target]', 'impact');
  await page.waitForSelector(pane + ' [data-osc-set="impact.elem"]');
  const z5 = await exportZip();
  ok(z5.name === 'Wind_tunnel_car-openradioss.zip' && z5.names.join() === 'Wind_tunnel_car_0000.rad,Wind_tunnel_car_0001.rad,README.txt', 'impact case: starter deck, engine deck, README', z5.names.join(' '));
  const st = z5.get('Wind_tunnel_car_0000.rad');
  ok(st.startsWith('#RADIOSS STARTER\n') && /\/BEGIN\nWind_tunnel_car\n {6}2022 {9}0\n {18}Mg {18}mm {19}s\n/.test(st) && /\/TETRA4\/1/.test(st) && /\/RWALL\/PLANE\/1/.test(st) && /\/INIVEL\/TRA\/1/.test(st) && /\/BCS\/1/.test(st) && st.trimEnd().endsWith('/END'), 'the starter deck: /BEGIN 2022 in Mg mm s, tetrahedra, the rigid floor, the drop speed, the fixed face g2');
  ok(st.split('\n').every((l) => l.length <= 100), 'no deck line is over 100 characters');
  await shot('04-impact-setup');

  // ---- a result back through the file chooser, drawn on the model
  const vtk = ['# vtk DataFile Version 3.0', 'vtk output', 'ASCII', 'DATASET UNSTRUCTURED_GRID', 'POINTS 5 float', '0 0 0', '60 0 0', '0 40 0', '0 0 30', '60 40 30', 'CELLS 2 10', '4 0 1 2 3', '4 1 2 3 4', 'CELL_TYPES 2', '10', '10',
    'POINT_DATA 5', 'SCALARS NODE_ID int 1', 'LOOKUP_TABLE default', '1 2 3 4 5', 'VECTORS Displacement float', '0 0 0', '0 0 0', '0 0 0', '0 0 0', '0 0 1.5',
    'CELL_DATA 2', 'SCALARS 3DELEM_Von_Mises float 1', 'LOOKUP_TABLE default', '120.5', '310.25', 'SCALARS 3DELEM_Plastic_Strain float 1', 'LOOKUP_TABLE default', '0', '0.02', ''].join('\n');
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), act('import')]);
  await fc.setFiles([{ name: 'car_001.vtk', mimeType: 'text/plain', buffer: Buffer.from(vtk) }]);
  await page.waitForSelector(pane + ' [data-osc-result]', { timeout: 15000 });
  ok(/Read 1 result frames/.test(await msg()) && /5 points, 2 cells, 6 surface triangles/.test(await page.textContent(pane + ' [data-osc-result]')), 'a legacy ASCII VTK file chosen in the file dialog is read: 5 points, 2 cells, 6 outside triangles');
  ok((await page.$eval(pane + ' [data-osc-field]', (e) => e.value)) === 'cell:3DELEM_Von_Mises', 'the plot opens on von Mises');
  await act('show');
  await page.waitForSelector(pane + ' [data-osc-legend]', { timeout: 15000 });
  const placed = await page.evaluate(() => { const g = window.partcraft.part.addonBodies?.['open-solvers']?.result; return g ? { n: g.bodies.length, name: g.name } : null; });
  ok(placed && placed.n === 2 && /Von_Mises/.test(placed.name), `the result is ${placed && placed.n} colour bands of display bodies saved in the part (PartCraft's own result display)`, JSON.stringify(placed));
  ok(/120.5 to 310.3/.test(await page.textContent(pane)), 'the legend gives the range read from the file (120.5 to 310.3, four digits of 310.25)');
  await page.evaluate(() => window.partcraft.view.fit && window.partcraft.view.fit()); await page.waitForTimeout(1200);
  await shot('05-result-on-model');
  await act('clear'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.partcraft.part.addonBodies?.['open-solvers']?.result), 'Remove the plot takes the bodies away');

  // ---- what you need on your computer
  await act('need');
  await page.waitForSelector(pane + ' [data-osc-need]');
  const need = await page.textContent(pane + ' [data-osc-need]');
  const links = await page.$$eval(pane + ' [data-osc-need] a', (a) => a.map((x) => [x.href, x.target, x.rel]));
  ok(/separate from CadCraft/.test(need) && /not part of it/.test(need) && /add them to your own computer yourself/.test(need), 'the list says the programs are separate, not part of CadCraft, and added by the person');
  ok(links.length === 4 && links.every((l) => /^https:\/\//.test(l[0]) && l[1] === '_blank' && /noopener/.test(l[2])) && ['openfoam.com', 'openfoam.org', 'code-aster.org', 'github.com/OpenCourant'].every((h) => links.some((l) => l[0].includes(h))), 'four links to the projects\' own pages', links.map((l) => l[0]).join(' '));
  ok((need.match(/GNU General Public License, version 3 or later/g) || []).length === 3 && /GNU Affero General Public License, version 3 or later/.test(need), 'each licence is named (GPL three times, AGPL once)');
  ok((await page.$eval(pane + ' [data-osc-act="need"] i', (e) => e.className)) === 'bi bi-chevron-down' && (await page.$eval(pane + ' [data-osc-act="need"]', (e) => getComputedStyle(e).justifyContent)) === 'space-between', 'the fold\'s caret is on the right and points down when open');
  await page.$eval(pane + ' [data-osc-need]', (e) => e.scrollIntoView({ block: 'center' }));
  await shot('06-what-you-need');

  // ---- saved with the part, read back with the add-on off
  const json = await page.evaluate(() => JSON.stringify(window.partcraft.part));
  const saved = JSON.parse(json).studies['open-solvers'];
  ok(saved.target === 'impact' && saved.groups.length === 3 && saved.flow.flavour === 'foundation', 'the settings are in the saved part file (target, three face groups, the flow line)');
  await page.evaluate((id) => window.ccAddons.loader.setEnabled(id, false), ID);
  await page.waitForTimeout(500);
  ok(!(await page.$('.pc-tabs [data-addon="' + ID + '"]')), 'taken off: the tab goes');
  const reopened = await page.evaluate(async (t) => { try { await window.partcraft.openText(t, 'again.partcraft.json'); return window.partcraft.part.studies['open-solvers'].groups.length; } catch (e) { return String(e.message || e); } }, json);
  ok(reopened === 3, 'the file opens with the add-on off and keeps the settings', String(reopened));
  void study;
  const real = problems.filter((p) => !/favicon|ResizeObserver|net::ERR|404|429/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('error').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
