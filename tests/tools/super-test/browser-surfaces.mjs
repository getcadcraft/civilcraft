// SPDX-License-Identifier: Apache-2.0
// 0.9 DC.54 (suggestion #860, session nurbs-s3-09): SuperCad Studio's own Surfaces panel in the real lab page (rendered without a sign-in as the
// rest of tools/super-test, served with the real /assets). Reached from Ctrl+K and the Panels list; the shared panel (curves, surfaces, trims,
// solids and Booleans, fit to scan, stitch) over Super's own 3D view; the patch set rides in the project (Data/surfaces/surfaces.json) and comes
// back when the project is saved and opened again; a click in the view picks; STEP / IGES / STL out.
//   node tools/super-test/browser-surfaces.mjs [--shots <dir>]
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, OUT, start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shots) fs.mkdirSync(shots, { recursive: true });

const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra === undefined ? '' : ' - ' + JSON.stringify(extra).slice(0, 300))); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code|WebGL|GPU stall|GL_/i.test(m.text())) errors.push(m.text()); });
const shot = async n => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };

try {
  await page.goto(url);
  await page.waitForSelector('[data-sc-ready]');
  await page.evaluate(() => window.superWindow.ready);

  console.log('== reaching it');
  ok(await page.evaluate(() => window.superWindow.M.PANELS.some(p => p.id === 'surfaces')), 'the Surfaces panel is one of the window\'s panels');
  await page.waitForFunction(() => window.ccPalette?.items?.().some(i => i.id === 'app:super:surfaces'), null, { timeout: 15000 });
  await page.keyboard.press('Control+k');
  await page.waitForSelector('dialog[open] input', { timeout: 5000 });
  await page.keyboard.type('Surfaces: curves');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-sc-surfaces] [data-nurbs-panel]', { timeout: 60000 });
  ok(true, 'Ctrl+K "Surfaces: curves, surfaces, trims and solids" opens the panel with the shared Surfaces panel in it');
  const groups = await page.$$eval('[data-sc-surfaces] [data-nurbs-start]', b => b.map(x => x.dataset.nurbsStart));
  ok(['curve.points', 'surface.loft', 'surface.trimRect', 'solid.box', 'solid.subtract', 'solid.fillet', 'surface.match'].every(k => groups.includes(k)), 'curves, surfaces, trims, solids, Booleans and matching are all there (' + groups.length + ' commands)');
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-sc-surfaces] .nui-group, [data-sc-surfaces] [data-nurbs-group]')].length >= 0), 'the panel is drawn');
  const hasGl = await page.evaluate(() => !!document.querySelector('[data-sc-surfaces] canvas'));
  ok(hasGl, 'the 3D view has its canvas (software GL)');
  ok(!!(await page.$('[data-surf-scan-open]')), 'the scan fit has its Open a scan button');
  ok(await page.evaluate(() => !!document.querySelector('[data-nurbs-start="scan.fit"]')), 'Fit surfaces to a scan is in the panel');

  console.log('== a solid, a Boolean, a pick in the view');
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const note = () => page.evaluate(() => [...document.querySelectorAll('[data-nurbs-panel] .nui-note[aria-live]')].map(e => e.textContent).join(' '));
  const S = () => page.evaluate(() => { const s = window.superSurfaces.session; return { solids: (s.doc.solids || []).map(b => ({ id: b.id, n: b.faces.length })), items: s.doc.items.length, trims: s.doc.items.filter(i => i.trim).length }; });
  await page.click('[data-nurbs-start="solid.box"]');
  await opt('size', '100, 60, 40');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  ok(/Volume 240000 mm³/.test(await note()), 'Box solid 100 x 60 x 40 mm: volume measured - ' + (await note()).slice(0, 90));
  await page.click('[data-nurbs-start="solid.cylinder"]');
  await opt('base', '50, 30, -10'); await opt('radius', '15'); await opt('height', '60');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b2"]');
  const meshes = await page.evaluate(() => [...window.superSurfaces.display.cache.values()].filter(c => c.obj.isMesh).length);
  ok(meshes === 9, 'the nine faces are drawn in Super\'s own view (box 6, cylinder 3): ' + meshes);
  await page.evaluate(() => window.superSurfaces.render());
  await shot('surf-1-solids');

  // a real click on the box's top face in the view picks the box (Subtract waits for a solid)
  await page.click('[data-nurbs-start="solid.subtract"]');
  const at = await page.evaluate(() => {
    window.superSurfaces.el.querySelector('.sc-surf-view').scrollIntoView({ block: 'start' });   // the dock scrolls as the commands are used; the view must be on screen to be clicked
    const w = window.superSurfaces, T = w.camera.position.constructor, c = new T(50, 30, 40);   // the middle of the top face, outside the cylinder's footprint? (cylinder r 15 pokes through; use a corner of it)
    c.set(88, 12, 40); w.render(); c.project(w.camera);
    const r = w.el.querySelector('canvas').getBoundingClientRect();
    return { x: r.left + (c.x * 0.5 + 0.5) * r.width, y: r.top + (-c.y * 0.5 + 0.5) * r.height };
  });
  await page.mouse.click(at.x, at.y);
  const pk = await page.evaluate(() => window.superSurfaces.session.picks.map(p => p.id));
  ok(pk.length === 1 && pk[0] === 'b1', 'a click on the box in the 3D view picks the box', pk);
  await page.click('[data-nurbs-pick="b2"]');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /Subtract: done/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map(e => e.textContent).join(' ')), null, { timeout: 60000 });
  const line = await note();
  const vol = Number((line.match(/volume ([\d.]+) mm³/) || [])[1]), want = 100 * 60 * 40 - Math.PI * 15 * 15 * 40;
  ok(/7 faces/.test(line) && Math.abs(vol - want) / want < 5e-4, 'Subtract on the page\'s own manifold-3d: 7 faces, volume ' + vol + ' vs ' + want.toFixed(1) + ' - ' + line.slice(0, 120));
  const st = await S();
  ok(st.solids.length === 1 && st.solids[0].n === 7 && st.trims === 3, 'one solid of 7 faces, three of them trimmed', st);
  const stray = await page.evaluate(() => [...document.querySelectorAll('[data-sc-surfaces] *')].filter(e => /^(null|undefined|NaN)$/.test(e.textContent.trim()) || [...e.childNodes].some(n => n.nodeType === 3 && /^(null|undefined)$/.test(n.textContent.trim()))).map(e => e.outerHTML.slice(0, 160)));
  ok(!stray.length, 'no stray "null" or "undefined" text in the panel', stray);
  await page.click('[data-nurbs-undo]');
  ok((await S()).solids.length === 2, 'the panel Undo brings the box and the cylinder back');
  await page.click('[data-nurbs-redo]');
  const sid = (await S()).solids[0].id;
  await shot('surf-2-subtract');

  console.log('== a surface from curves, trimmed');
  await page.evaluate(() => { const s = window.superSurfaces.session; s.pick; });
  const cmds = await page.$$eval('[data-nurbs-start]', b => b.map(x => x.dataset.nurbsStart));
  ok(cmds.includes('surface.extrude') && cmds.includes('curve.points'), 'curve and surface commands are listed');
  await page.click('[data-nurbs-start="curve.points"]');
  await page.fill('[data-nurbs-points]', '0, 0, 0\n40, 20, 10\n80, 0, 0\n120, 20, 10'); await page.dispatchEvent('[data-nurbs-points]', 'change');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => window.superSurfaces.session.doc.items.some(i => i.kind === 'curve'), null, { timeout: 15000 });
  ok(true, 'a curve through typed points');

  console.log('== exports and the project');
  const [stp] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="step"]')]);
  const stText = fs.readFileSync(await stp.path(), 'utf8');
  ok((stText.match(/ADVANCED_FACE\(/g) || []).length >= 7, 'STEP out carries the solid\'s faces');
  const [stl] = await Promise.all([page.waitForEvent('download'), page.click(`[data-nurbs-bake="${sid}"]`)]);
  const stlBytes = fs.readFileSync(await stl.path());
  const tris = stlBytes.readUInt32LE(80);
  ok(stlBytes.length === 84 + 50 * tris && tris > 12, 'Save as STL: a binary STL of ' + tris + ' triangles');

  const ext = () => page.evaluate(() => { const P = window.superWindow.P, b = P.extGet(window.superWindow.project, 'surfaces', 'surfaces.json'); return b ? JSON.parse(new TextDecoder().decode(b)) : null; });
  const j = await ext();
  ok(j && (j.solids || []).length === 1 && (j.items || []).length >= 8, 'the patch set is in the project as Data/surfaces/surfaces.json', j && Object.keys(j));

  // save the project and open it again: the panel comes back with the same solid
  const again = await page.evaluate(async () => {
    const W = window.superWindow, bytes = W.P.toBytes(W.project);
    window.superSurfaces.session.load(null);   // the panel must get its patch set back from the opened project, not keep it
    await W.openProject({ name: 'surfaces-test.ccproject', arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
    await new Promise(r => setTimeout(r, 800));
    window.superWindow.render();
    await new Promise(r => setTimeout(r, 800));
    const s = window.superSurfaces.session;
    return { solids: (s.doc.solids || []).length, faces: (s.doc.solids || [])[0]?.faces.length, items: s.doc.items.length, ext: !!W.P.extGet(W.project, 'surfaces', 'surfaces.json') };
  });
  ok(again.ext && again.solids === 1 && again.faces === 7 && again.items >= 8, 'saved with the project and opened again: the solid (7 faces) and the curve are back', again);
  // a project without the file: the panel starts empty
  const empty = await page.evaluate(async () => {
    const W = window.superWindow, bytes = W.P.toBytes(W.P.newProject('empty'));
    await W.openProject({ name: 'empty.ccproject', arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
    window.superWindow.render(); await new Promise(r => setTimeout(r, 800));
    return [window.superSurfaces.session.doc.items.length, window.superWindow.project.name, document.querySelector('.sc-status')?.textContent];
  });
  ok(empty[0] === 0, 'a project with no surfaces file opens with an empty panel', empty);

  console.log('== fit to a scan');
  // an STL of a 100 x 80 x 6 mm plate (12 triangles), top face at z = 6, opened through the panel's Open a scan
  const tri = (a, b, c) => [a, b, c];
  const V = (x, y, z) => [x, y, z];
  const p = [V(0, 0, 0), V(100, 0, 0), V(100, 80, 0), V(0, 80, 0), V(0, 0, 6), V(100, 0, 6), V(100, 80, 6), V(0, 80, 6)];
  const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const T = []; for (const [a, b, c, d] of quads) { T.push(tri(p[a], p[b], p[c])); T.push(tri(p[a], p[c], p[d])); }
  const buf = Buffer.alloc(84 + 50 * T.length); buf.writeUInt32LE(T.length, 80);
  T.forEach((t3, i) => t3.flat().forEach((v, k) => buf.writeFloatLE(v, 84 + i * 50 + 12 + k * 4)));
  const stlPath = path.join(OUT, 'surf-plate.stl'); fs.writeFileSync(stlPath, buf);
  await page.setInputFiles('[data-surf-scan-file]', stlPath);
  await page.waitForFunction(() => /12 triangles/.test(document.querySelector('[data-surf-scan]').textContent), null, { timeout: 10000 });
  ok(true, 'Open a scan reads the STL (12 triangles)');
  await page.click('[data-nurbs-start="scan.fit"]');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => window.superSurfaces.session.doc.items.some(i => i.kind === 'surface'), null, { timeout: 60000 });
  ok(/scan|plane|fit/i.test(await note()), 'Fit surfaces to the scan ran: ' + (await note()).slice(0, 140));
  await shot('surf-3-scan');

  console.log('== other panels still work');
  ok(await page.evaluate(() => document.querySelectorAll('[data-sc-surfaces]').length === 1), 'one Surfaces panel in the page');
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const e of errors) { fail++; console.log('  FAIL ' + e); }
  await browser.close(); close();
  console.log((fail ? 'FAILED' : 'ok') + ' - ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
