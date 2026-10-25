#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mesh.mjs — ModelCraft's meshes in a real page (0.7 Track MD; session `mesh`), headless Chromium at
 * /lab/modelcraft. Grows one section per finished MD item.
 *   node tools/modelcraft-test/browser-mesh.mjs [--out <dir>] [--keep-admin]
 * Run as root: ModelCraft's test admin (`sudo -u www-data php tools/modelcraft-test/admin.php up|down`); the session is
 * kept in tmp/mesh-browser-state.json while it runs. Screenshots in tmp/shots/mesh. Fails on any console error.
 * MD.1: a box made into a group → Entity info › Convert to mesh (one undo step; Ctrl+Z / Ctrl+Y), the mesh drawn (pixels
 * where the box is, in both themes), its counts in Entity info, a double-click does not open it, the file saved with a
 * mesh (version 2) and opened again, a 40 000-face grid edited by deltas (the edit and its undo timed in the page),
 * Convert to geometry.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/mesh')));
const STATE = path.join(REPO, 'tmp/mesh-browser-state.json');
const KEEP_ADMIN = process.argv.includes('--keep-admin');
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext({ ...opts, acceptDownloads: true });
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  fs.chmodSync(STATE, 0o600);
  await p.close();
  return c;
}

/** The page's own kernel module (its import-map URL), so shapes are made with the code the app runs. */
const withKernel = (page, fn, arg) => page.evaluate(async ({ src, arg }) => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const find = (re) => Object.entries(map).find(([k]) => re.test(k))?.[1] || Object.keys(map).find((k) => re.test(k));
  const M = await import(find(/\/modelcraft\/dev\/model\.js/));
  const MM = await import(find(/\/modelcraft\/dev\/mesh\.js/));
  // eslint-disable-next-line no-new-func
  return new Function('M', 'MM', 'mc', 'arg', 'return (' + src + ')(M, MM, mc, arg)')(M, MM, window.modelcraft, arg);
}, { src: fn.toString(), arg });

/** How many pixels of the 3D canvas differ from its corner colour inside a box of the view (fractions 0…1). */
const inked = (page, box) => page.evaluate((box) => {
  const c = document.querySelector('canvas');
  const g = document.createElement('canvas'); g.width = c.width; g.height = c.height;
  const x = g.getContext('2d'); x.drawImage(c, 0, 0);
  const d = x.getImageData(0, 0, g.width, g.height).data, bg = [d[0], d[1], d[2]];
  let n = 0;
  for (let j = Math.floor(box[1] * g.height); j < box[3] * g.height; j += 2) for (let i = Math.floor(box[0] * g.width); i < box[2] * g.width; i += 2) {
    const k = (j * g.width + i) * 4;
    if (Math.abs(d[k] - bg[0]) + Math.abs(d[k + 1] - bg[1]) + Math.abs(d[k + 2] - bg[2]) > 30) n++;
  }
  return n;
}, box);

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1400, height: 900 }, locale: 'en-US' });
  for (const space of ['paper', 'model']) {
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(space + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(space + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/modelcraft?space=' + space, { waitUntil: 'networkidle' });
    ok(await page.evaluate(() => !!window.modelcraft), space + ': the app starts');
    // a 2 × 3 × 4 m box made into a group, zoomed to, selected
    const iid = await withKernel(page, (M, MM, mc) => {
      const m = mc.model;
      const id = m.change('test box', (mm) => {
        M.addPolygon(mm.root, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 3));
        M.pushPull(mm.root, [...mm.root.faces.keys()][0], 4);
        return mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Box');
      });
      mc.host.changed();
      mc.host.setSel([{ t: 'i', id }]);
      return id;
    });
    await page.evaluate(() => { document.querySelector('[data-hint]').hidden = true; });
    await page.click('button:has-text("Extents")');
    await page.waitForTimeout(300);
    const steps0 = await page.evaluate(() => window.modelcraft.model.undoStack.length);
    await page.click('button:has-text("Convert to mesh")');
    await page.waitForTimeout(300);
    const after = await page.evaluate((iid) => { const m = window.modelcraft.model, d = m.def(m.root.insts.get(iid).def); return { kind: d.kind, steps: m.undoStack.length, msg: document.querySelector('[data-msg]')?.textContent }; }, iid);
    ok(after.kind === 'mesh' && after.steps === steps0 + 1, space + ': Convert to mesh makes a mesh in one undo step');
    ok(/Now a mesh: 6 faces, 8 vertices\./.test(after.msg || ''), space + ': the status line says so — ' + after.msg);
    const infoText = await page.evaluate(() => document.querySelector('[data-info]').parentElement.textContent || '');
    ok(/Mesh/.test(infoText) && /Faces\s*6/.test(infoText) && /Vertices\s*8/.test(infoText) && /Edges\s*12/.test(infoText), space + ': Entity info shows a mesh with 6 faces, 8 vertices, 12 edges');
    ok(/Convert to geometry/.test(infoText) && !/Convert to mesh/.test(infoText), space + ': Entity info offers Convert to geometry');
    await page.evaluate(() => window.modelcraft.view.invalidate());
    await page.waitForTimeout(300);
    const px = await inked(page, [0.3, 0.2, 0.7, 0.8]);
    ok(px > 500, space + ': the mesh is drawn (' + px + ' pixels in the middle of the view)');
    await page.screenshot({ path: path.join(OUT, `01-mesh-${space}.png`) });
    if (space === 'paper') {
      // undo and redo with the keys
      await page.evaluate(() => document.activeElement?.blur());
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(200);
      ok(await page.evaluate((iid) => { const m = window.modelcraft.model; return m.def(m.root.insts.get(iid).def).kind === 'group'; }, iid), 'Ctrl+Z: the box is a group again');
      await page.keyboard.press('Control+y');
      await page.waitForTimeout(200);
      ok(await page.evaluate((iid) => { const m = window.modelcraft.model; return m.def(m.root.insts.get(iid).def).kind === 'mesh'; }, iid), 'Ctrl+Y: a mesh again');
      // opening it (a double-click, Edit) opens it in the Mesh workspace (MD.2); back to Model selects it again
      await page.evaluate((iid) => window.modelcraft.host.openContext([iid]), iid);
      ok(await page.evaluate(() => window.modelcraft.workspace === 'mesh' && window.modelcraft.tools.name === 'meshedit'), 'opening the mesh like a group opens it in the Mesh workspace');
      await page.evaluate(() => window.modelcraft.setWorkspace('model'));
      ok(await page.evaluate((iid) => window.modelcraft.workspace === 'model' && window.modelcraft.host.sel.length === 1 && window.modelcraft.host.sel[0].id === iid, iid), '… and back in Model it is selected');
      // the file holds the mesh (version 2) and opens again
      const file = await page.evaluate(() => JSON.stringify(window.modelcraft.model.toJSON()));
      const j = JSON.parse(file);
      ok(j.version === 2 && j.defs.some((d) => d.kind === 'mesh' && d.mesh?.fi), 'saved: version 2, the mesh as data');
      const reopened = await withKernel(page, (M, MM, mc, f) => { const x = new M.Model(); x.load(JSON.parse(f)); const d = [...x.defs.values()].find((d) => d.mesh); return d && d.mesh.info(); }, file);
      ok(reopened && reopened.closed && Math.abs(reopened.volume - 24) < 1e-9, 'reopened: a closed 24 m³ mesh');
      // a 40 000-face grid edited by deltas, timed in the page
      const big = await withKernel(page, (M, MM, mc) => {
        const m = mc.model, n = 200, pts = [], faces = [];
        for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) pts.push([10 + i * 0.05, j * 0.05, 0]);
        for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i; faces.push([a, a + 1, a + n + 2, a + n + 1]); }
        const mesh = MM.Mesh.fromLists(pts, faces);
        const d = m.change('grid', (mm) => { const x = mm.newMeshDef(mesh, 'Grid'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
        mc.host.changed();
        const t0 = performance.now();
        m.meshEdit(d.id, 'bump', (me) => { for (let v = 0; v < 400; v++) me.setPos(v * 97 % me.nv, me.P[(v * 97 % me.nv) * 3], me.P[(v * 97 % me.nv) * 3 + 1], 0.5); });
        const edit = performance.now() - t0;
        const t1 = performance.now(); m.undo(); const undo = performance.now() - t1;
        const t2 = performance.now(); m.redo(); const redo = performance.now() - t2;
        const step = m.lastStep(), chars = step.b.parts.reduce((s, p) => s + p[1].length, 0);
        return { edit, undo, redo, chars, faces: m.def(d.id).mesh.faceCount };
      });
      ok(big.faces === 40000 && big.chars < 20000, `a 40 000-face mesh: the undo step holds ${big.chars} characters of definitions (edit ${big.edit.toFixed(1)} ms, undo ${big.undo.toFixed(1)} ms, redo ${big.redo.toFixed(1)} ms in headless Chromium on the VPS)`);
      await page.evaluate(() => { window.modelcraft.view.invalidate(); });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, '02-grid-paper.png') });
      await page.evaluate(() => { window.modelcraft.model.undo(); window.modelcraft.host.changed(); });
      // back to push/pull
      await page.evaluate((iid) => window.modelcraft.host.setSel([{ t: 'i', id: iid }]), iid);
      await page.waitForTimeout(200);
      await page.click('button:has-text("Convert to geometry")');
      await page.waitForTimeout(200);
      ok(await page.evaluate((iid) => { const m = window.modelcraft.model, d = m.def(m.root.insts.get(iid).def); return d.kind === 'group' && d.faces.size === 6; }, iid), 'Convert to geometry: a group of 6 faces again');
      // ---- MC-DIVIDE and MC-CALC (0.7): the Divide button, Entity info › Divide…, and a calculation typed in the value box
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.change('clear', (m) => { m.root.insts.clear(); m.purge(); }); mc.host.setSel([]); mc.host.changed(); });
      const lineId = await withKernel(page, (M, MM, mc) => { mc.model.change('line', (m) => M.addEdge(m.root, [0, 0, 0], [6, 0, 0])); mc.host.changed(); return [...mc.model.root.edges.keys()][0]; });
      await page.click('button:has-text("Extents")');
      await page.waitForTimeout(200);
      await page.click('.mc-tools [data-tool="divide"]');
      const box = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.x, y: r.y }; });
      const mid = await page.evaluate(() => { const mc = window.modelcraft; return mc.cam.project([3, 0, 0]); });
      await page.mouse.move(box.x + mid[0], box.y + mid[1]);
      await page.waitForTimeout(150);
      await page.keyboard.type('4'); await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => window.modelcraft.model.root.edges.size === 4), 'the Divide button, pointing at a line, typed 4 + Enter: four pieces');
      ok(await page.evaluate(() => window.modelcraft.tools.name === 'select' && window.modelcraft.host.sel.length === 4), 'back to Select with the four pieces selected');
      await page.screenshot({ path: path.join(OUT, '03-divide-paper.png') });
      await page.evaluate(() => { window.modelcraft.model.undo(); window.modelcraft.host.changed(); });
      // Entity info › Divide… asks for the number (a tablet has no keys to type into the view)
      await page.evaluate(() => { const mc = window.modelcraft; mc.host.setSel([{ t: 'e', id: [...mc.model.root.edges.keys()][0] }]); });
      await page.waitForTimeout(200);
      await page.click('button:has-text("Divide…")');
      await page.waitForSelector('dialog.mc-dialog #mc-ask-input');
      ok(/Divide into equal parts/.test(await page.textContent('dialog.mc-dialog')), 'Entity info › Divide… opens "Divide into equal parts"');
      await page.fill('#mc-ask-input', '3');
      await page.click('dialog.mc-dialog button[value="ok"]');
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => window.modelcraft.model.root.edges.size === 3), '… 3 and OK: three pieces');
      // the tape measure from the line's end, typed 6/4 → a guide point 1.5 m along
      await page.evaluate(() => { window.modelcraft.model.undo(); window.modelcraft.host.setSel([]); window.modelcraft.host.changed(); });
      await page.click('.mc-tools [data-tool="tape"]');
      const end = await page.evaluate(() => window.modelcraft.cam.project([0, 0, 0])), toward = await page.evaluate(() => window.modelcraft.cam.project([4, 0, 0]));
      await page.mouse.move(box.x + end[0], box.y + end[1]); await page.mouse.down(); await page.mouse.up();
      await page.mouse.move(box.x + toward[0], box.y + toward[1]);
      await page.waitForTimeout(100);
      await page.keyboard.type('(6m)/4'); await page.keyboard.press('Enter');   // the page's model is in feet and inches (en-US): say meters
      await page.waitForTimeout(200);
      const tape = await page.evaluate(() => ({ guides: [...window.modelcraft.model.guides.values()].map((g) => g.kind + ':' + g.p.map((x) => +x.toFixed(4)).join(',')), msg: document.querySelector('[data-msg]').textContent, tool: window.modelcraft.tools.name, vcb: document.querySelector('[data-vcb], .mc-vcb input')?.value }));
      ok(tape.guides.some((g) => /^point:1\.5,0,0$/.test(g)), 'the tape measure from the end, "(6m)/4" typed (a bracket starts the value box): a guide point at 1.5 m — ' + JSON.stringify(tape));
      await page.keyboard.type('6/0'); await page.keyboard.press('Enter');
      await page.waitForTimeout(150);
      ok(/Division by zero/.test(await page.textContent('[data-msg]')), 'a calculation that cannot be done says why in the status line');
      await page.keyboard.press('Escape');
    }
    // ---- MD.2: the Mesh workspace (edit mode) ----
    {
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.change('clear', (m) => { m.root.insts.clear(); m.root.edges.clear(); m.root.faces.clear(); m.purge(); }); mc.host.setSel([]); mc.host.changed(); document.querySelector('[data-hint]').hidden = true; });
      await page.selectOption('[data-workspace]', 'mesh');
      await page.waitForTimeout(250);
      const groups = await page.evaluate(() => ({ draw: document.querySelector('.mc-tools [aria-label="Draw"]')?.hidden, mesh: [...document.querySelectorAll('.mc-tools [data-workspace-group="mesh"]')].every((g) => !g.hidden), ws: window.modelcraft.workspace }));
      ok(groups.ws === 'mesh' && groups.draw === true && groups.mesh, space + ': the switcher opens the Mesh workspace: its groups show, Draw hides');
      ok(await page.isVisible('[data-mesh-add="cube"]'), space + ': with no mesh, the panel offers meshes to add');
      await page.click('[data-mesh-add="cube"]');
      await page.waitForTimeout(250);
      ok(await page.evaluate(() => window.modelcraft.tools.name === 'meshedit' && [...window.modelcraft.model.defs.values()].some((d) => d.mesh)), space + ': Add › Cube: a mesh, open for editing');
      await page.click('button:has-text("Extents")');
      await page.waitForTimeout(200);
      const box2 = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.x, y: r.y }; });
      const topC = await page.evaluate(() => { const mc = window.modelcraft, me = mc.tools.tool.mesh, m = mc.tools.tool.world; let zmax = -1e9; for (let v = 0; v < me.nv; v++) zmax = Math.max(zmax, me.P[v * 3 + 2]); return mc.cam.project([m[12], m[13], m[14] + zmax]); });
      await page.mouse.move(box2.x + topC[0], box2.y + topC[1]);
      await page.keyboard.press('3');
      await page.mouse.down(); await page.mouse.up();
      await page.waitForTimeout(150);
      ok(await page.evaluate(() => window.modelcraft.tools.tool.sel.faces().length === 1 && window.modelcraft.tools.tool.mode === 'face'), space + ': 3 then a click on the top: face mode, the top face selected');
      await page.screenshot({ path: path.join(OUT, `04-mesh-edit-${space}.png`) });
      if (space === 'paper') {
        const vol = () => page.evaluate(() => window.modelcraft.tools.tool.mesh.info().volume);
        const v0 = await vol();
        await page.keyboard.press('p');
        await page.mouse.move(box2.x + topC[0], box2.y + topC[1] - 40);
        await page.keyboard.type('1m'); await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        const v1 = await vol(), side = await page.evaluate(() => { const me = window.modelcraft.tools.tool.mesh; let a = 1e9, b = -1e9; for (let v = 0; v < me.nv; v++) { if (me.vertDead(v)) continue; a = Math.min(a, me.P[v * 3]); b = Math.max(b, me.P[v * 3]); } return b - a; });
        ok(Math.abs(v1 - v0 - side * side * 1) < 1e-6, `P (push/pull keys), typed 1m: the top extruded 1 m (${v0.toFixed(3)} → ${v1.toFixed(3)} m³)`);
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(150);
        ok(Math.abs(await vol() - v0) < 1e-9, 'Ctrl+Z: one step back (delta undo)');
        // loop cut by a click on a side edge
        await page.keyboard.press('Control+r');
        const sideE = await page.evaluate(() => { const mc = window.modelcraft, me = mc.tools.tool.mesh, m = mc.tools.tool.world; let best = null; for (let h = 0; h < me.nh; h++) { if (me.heDead(h)) continue; const a = me.hV[h], b = me.head(h); if (Math.abs(me.P[a * 3 + 2] - me.P[b * 3 + 2]) < 1e-9) continue; const p = [m[12] + (me.P[a * 3] + me.P[b * 3]) / 2, m[13] + (me.P[a * 3 + 1] + me.P[b * 3 + 1]) / 2, m[14] + (me.P[a * 3 + 2] + me.P[b * 3 + 2]) / 2]; const s = mc.cam.project(p); if (s && (!best || s[1] > best[1])) best = s; } return best; });
        await page.mouse.move(box2.x + sideE[0], box2.y + sideE[1]);
        await page.waitForTimeout(100);
        await page.mouse.down(); await page.mouse.up();
        await page.waitForTimeout(200);
        ok(await page.evaluate(() => window.modelcraft.tools.tool.mesh.faceCount === 10), 'Ctrl+R, a click on a side edge: a loop cut (10 faces)');
        // the modeler keys: Tab out and in, G Z typed
        await page.evaluate(() => { const s = document.querySelector('[data-mc-keys]'); s.value = 'blender'; s.dispatchEvent(new Event('change', { bubbles: true })); });
        await page.waitForTimeout(150);
        await page.mouse.move(box2.x + topC[0], box2.y + topC[1]);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        ok(await page.evaluate(() => window.modelcraft.workspace === 'model' && window.modelcraft.host.sel.length === 1), 'modeler keys: Tab goes back to Model with the mesh selected');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        ok(await page.evaluate(() => window.modelcraft.workspace === 'mesh' && window.modelcraft.tools.name === 'meshedit'), '… Tab again opens it in the Mesh workspace');
        await page.keyboard.press('a');
        const z0 = await page.evaluate(() => window.modelcraft.tools.tool.mesh.bounds().min[2]);
        await page.keyboard.press('g'); await page.keyboard.press('z');
        await page.keyboard.type('0.5m'); await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        const z1 = await page.evaluate(() => window.modelcraft.tools.tool.mesh.bounds().min[2]);
        ok(Math.abs(z1 - z0 - 0.5) < 1e-6, `A, G, Z, typed 0.5m: everything up 0.5 m along blue (${z0.toFixed(3)} → ${z1.toFixed(3)})`);
        await page.keyboard.press('Control+b');
        await page.keyboard.press('Escape');
        ok(await page.evaluate(() => !window.modelcraft.tools.tool.op), 'Ctrl+B then Esc: the bevel is cancelled');
        await page.evaluate(() => { const s = document.querySelector('[data-mc-keys]'); s.value = 'sketchup'; s.dispatchEvent(new Event('change', { bubbles: true })); });
        await page.screenshot({ path: path.join(OUT, '05-mesh-loopcut-paper.png') });
      }
      await page.selectOption('[data-workspace]', 'model');
      await page.waitForTimeout(150);
      ok(await page.evaluate(() => window.modelcraft.workspace === 'model' && !document.querySelector('.mc-tools [aria-label="Draw"]').hidden), space + ': back to Model: its groups again');
    }
    // ---- MD.3: modifiers ----
    if (space === 'paper') {
      const sel1 = await page.evaluate(() => { const mc = window.modelcraft, m = mc.model; const iid = [...m.root.insts.keys()].find((i) => m.def(m.root.insts.get(i).def).mesh); mc.host.setSel([{ t: 'i', id: iid }]); return iid; });
      await page.waitForTimeout(250);
      const defId = await page.evaluate((iid) => window.modelcraft.model.root.insts.get(iid).def, sel1);
      await page.selectOption('[data-mod-add]', 'subsurf');
      await page.waitForTimeout(300);
      const shown = () => page.evaluate((id) => { const d = window.modelcraft.model.def(id); return { shown: d.shown.faceCount, own: d.mesh.faceCount, mods: d.mods.length }; }, defId);
      let st = await shown();
      ok(st.mods === 1 && st.shown === st.own * 4, `Entity info › Add a modifier › Subdivision surface: it shows ${st.shown} faces, the mesh keeps ${st.own}`);
      await page.fill('#mc-mod-0-levels', '2'); await page.press('#mc-mod-0-levels', 'Enter');
      await page.waitForTimeout(300);
      st = await shown();
      ok(st.shown === st.own * 16, 'levels 2: sixteen times the faces');
      await page.screenshot({ path: path.join(OUT, '06-modifier-subsurf-paper.png') });
      await page.click('[data-mod-apply="0"]');
      await page.waitForTimeout(300);
      const applied = await shown();
      ok(applied.mods === 0 && applied.own === st.shown, 'Apply: the mesh itself now has those faces, the stack is empty');
      await page.evaluate(() => document.activeElement?.blur());
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(300);
      ok((await shown()).mods === 1, 'Ctrl+Z: the modifier is back, the mesh as it was');
      // a boolean against a second object: manifold loads in the page, then the shape is cut
      const toolId = await page.evaluate(async () => {
        const mc = window.modelcraft, m = mc.model, mod = await import(Object.keys(JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports).find((k) => /\/mesh\/primitives\.js/.test(k)));
        // over the top of the mesh, wherever the earlier steps placed it
        const at = [...m.root.insts.values()].find((i) => m.def(i.def).mesh).m;
        const id = m.change('tool', (mm) => { const d = mm.newMeshDef(mod.makePrimitive('cube', { size: 0.5 }), 'Cutter'); mm.place(mm.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, at[12], at[13], at[14] + 1.3, 1]); return d.id; });
        mc.host.changed();
        return id;
      });
      await page.evaluate(() => { const mc = window.modelcraft, m = mc.model; const iid = [...m.root.insts.keys()].find((i) => m.def(m.root.insts.get(i).def).name !== 'Cutter' && m.def(m.root.insts.get(i).def).mesh); mc.host.setSel([{ t: 'i', id: iid }]); });
      await page.waitForTimeout(250);
      await page.click('[data-mod-remove="0"]');
      await page.waitForTimeout(200);
      await page.selectOption('[data-mod-add]', 'boolean');
      await page.waitForTimeout(200);
      await page.selectOption('#mc-mod-0-target', toolId);
      await page.waitForFunction((id) => { const d = window.modelcraft.model.def(id); return d.shown !== d.mesh && d.shown.info().volume < d.mesh.info().volume - 1e-6; }, defId, { timeout: 20000 }).catch(() => {});
      const vols = await page.evaluate((id) => { const mc = window.modelcraft, m = mc.model, d = m.def(id); const bb = (x) => { const b = x.bounds(); return b ? b.min.map((v) => v.toFixed(2)).join(',') + '..' + b.max.map((v) => v.toFixed(2)).join(',') : '-'; }; const at = (did) => { for (const i of m.root.insts.values()) if (i.def === did) return [i.m[12], i.m[13], i.m[14]].map((v) => v.toFixed(2)).join(','); return 'nowhere'; }; const cut = [...m.defs.values()].find((x) => x.name === 'Cutter'); return [d.mesh.info().volume, d.shown.info().volume, 'mesh ' + bb(d.mesh) + ' at ' + at(id) + ' cutter ' + bb(cut.mesh) + ' at ' + at(cut.id) + ' mods ' + JSON.stringify(d.mods)]; }, defId);
      if (!(vols[1] < vols[0] - 1e-6)) console.log('  boolean: ' + vols[2]);
      ok(vols[1] < vols[0] - 1e-6, `Boolean › Cut away the "Cutter": the mesh shows ${vols[1].toFixed(4)} m³ of ${vols[0].toFixed(4)} (manifold-3d, loaded in the page)`);
      await page.screenshot({ path: path.join(OUT, '07-modifier-boolean-paper.png') });
      // a lattice cage
      await page.click('[data-mod-remove="0"]');
      await page.waitForTimeout(200);
      await page.selectOption('[data-mod-add]', 'lattice');
      await page.waitForTimeout(200);
      await page.click('[data-mod-lattice="0"]');
      await page.waitForTimeout(300);
      const lat = await page.evaluate((id) => {
        const m = window.modelcraft.model, d = m.def(id), cage = m.def(d.mods[0].params.cage);
        // the cage's whole top row of points up 1 m (the test mesh has only corner vertices)
        const top = Object.entries(cage.lattice.ids).filter(([k]) => k.endsWith(',2')).map(([, v]) => v);
        m.meshEdit(cage.id, 'pull', (me) => { for (const v of top) me.setPos(v, me.P[v * 3], me.P[v * 3 + 1], me.P[v * 3 + 2] + 1); });
        window.modelcraft.host.changed();
        return { cage: !!cage.lattice, top: d.shown.bounds().max[2], own: d.mesh.bounds().max[2] };
      }, defId);
      ok(lat.cage && lat.top > lat.own + 0.9, `Lattice › Add a lattice cage, its top row of points pulled up 1 m: the mesh's top follows (${lat.own.toFixed(3)} → ${lat.top.toFixed(3)} m)`);
      await page.screenshot({ path: path.join(OUT, '08-modifier-lattice-paper.png') });
      // ---- MD.4: subdivision with creases, from the Mesh workspace ----
      await page.click('[data-mod-remove="0"]');
      await page.waitForTimeout(200);
      await page.selectOption('[data-mod-add]', 'subsurf');
      await page.waitForTimeout(200);
      await page.fill('#mc-mod-0-levels', '2'); await page.press('#mc-mod-0-levels', 'Enter');
      await page.waitForTimeout(250);
      await page.selectOption('[data-workspace]', 'mesh');
      await page.waitForTimeout(300);
      await page.click('[data-mesh-mode="edge"]');
      await page.evaluate(() => window.modelcraft.tools.tool.command('select-all'));
      await page.evaluate(() => window.modelcraft.renderPanel?.() ?? window.modelcraft.host.renderPanel?.());
      await page.waitForTimeout(250);
      await page.fill('#mc-crease', '1'); await page.press('#mc-crease', 'Enter');
      await page.waitForTimeout(300);
      const cr = await page.evaluate((id) => { const d = window.modelcraft.model.def(id), a = d.mesh.attrArray('crease'); let all = !!a; for (let h = 0; h < d.mesh.nh; h++) if (!d.mesh.heDead(h) && a && a[h] !== 1) all = false; return { all, own: d.mesh.info().volume, shown: d.shown.info().volume, faces: d.shown.faceCount }; }, defId);
      ok(cr.all && Math.abs(cr.shown - cr.own) < 1e-6 && cr.faces > 6, `Mesh workspace › every edge, Crease 1 in the panel: subdivided (${cr.faces} faces) yet still the box (${cr.shown.toFixed(4)} m³)`);
      await page.screenshot({ path: path.join(OUT, '09-crease-paper.png') });
      const cv = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      await page.mouse.move(cv.x, cv.y);
      await page.keyboard.press('Shift+C');
      await page.waitForTimeout(150);
      const opOn = await page.evaluate(() => !!window.modelcraft.tools.tool.op);
      await page.keyboard.type('0'); await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      const cr0 = await page.evaluate((id) => { const d = window.modelcraft.model.def(id); return { own: d.mesh.info().volume, shown: d.shown.info().volume, c: d.mesh.attrArray('crease')?.[0] }; }, defId);
      ok(opOn && cr0.c === 0 && cr0.shown < cr0.own - 1e-3, `Shift+C, typed 0: creases off, the shape rounds (${cr0.shown.toFixed(4)} of ${cr0.own.toFixed(4)} m³)`);
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(250);
      ok(await page.evaluate((id) => window.modelcraft.model.def(id).mesh.attrArray('crease')?.[0] === 1, defId), 'Ctrl+Z: the creases are back');
      await page.selectOption('[data-workspace]', 'model');
      await page.waitForTimeout(200);
      // ---- MD.5: the UV workspace on a fresh cube ----
      let cv0c = null;
      const cv0 = () => cv0c;
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.change('clear', (m) => { m.root.insts.clear(); m.root.edges.clear(); m.root.faces.clear(); m.purge(); }); mc.host.setSel([]); mc.host.changed(); });
      await page.selectOption('[data-workspace]', 'mesh');
      await page.waitForTimeout(250);
      await page.click('[data-mesh-add="cube"]');
      await page.waitForTimeout(300);
      const glW = await page.evaluate(() => document.querySelector('[data-gl]').clientWidth);
      cv0c = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.x + r.width / 4, y: r.y + r.height / 2 }; });
      await page.selectOption('[data-workspace]', 'uv');
      await page.waitForTimeout(400);
      const uvOpen = await page.evaluate(() => ({ ws: window.modelcraft.workspace, tool: window.modelcraft.tools.name, editor: !!document.querySelector('[data-uv-editor] canvas'), gl: document.querySelector('[data-gl]').clientWidth }));
      ok(uvOpen.ws === 'uv' && uvOpen.tool === 'meshedit' && uvOpen.editor && uvOpen.gl < glW * 0.7, `Workspace › UV: the mesh open, the UV editor beside a narrower 3D view (${glW} → ${uvOpen.gl} px)`);
      await page.click('[data-cmd="uv-seam-sharp"]');
      await page.waitForTimeout(200);
      await page.click('[data-cmd="uv-unwrap"]');
      await page.waitForTimeout(300);
      const info = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-uv-info]')].map((e) => [e.dataset.uvInfo, e.textContent])));
      ok(info.seams === '12' && info.islands === '6' && Number(info.stretch) < 0.001, `Seams at sharp, Unwrap: 12 seams, 6 islands, no stretch (panel: ${JSON.stringify(info)})`);
      await page.click('[data-cmd="uv-checker"]');
      await page.waitForTimeout(400);
      ok(await page.evaluate(() => document.querySelector('[data-cmd="uv-checker"]').getAttribute('aria-pressed') === 'true' && window.modelcraft.view.uvPreview?.mode === 'checker'), 'Checker: pressed, the mesh shows the checker in its UVs');
      await page.screenshot({ path: path.join(OUT, '10-uv-checker-paper.png') });
      // pick a face in the UV editor: it is selected in the 3D view too; drag it: its UVs move, one undo step
      const ed = await page.evaluate(() => { const r = document.querySelector('[data-uv-editor] canvas').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      const facePt = await page.evaluate(() => { const mc = window.modelcraft, me = mc.tools.tool.mesh, a = me.attrArray('uv'), cs = me.faceCorners(0, []); let u = 0, v = 0; for (const h of cs) { u += a[h * 2]; v += a[h * 2 + 1]; } return [u / cs.length, v / cs.length]; });
      const s = Math.min(ed.w, ed.h) * 0.86, px = ed.x + (ed.w - s) / 2 + facePt[0] * s, py = ed.y + (ed.h + s) / 2 - facePt[1] * s;
      await page.mouse.click(px, py);
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => { const S = window.modelcraft.tools.tool.sel; return S.mode === 'face' && S.faces().length === 1 && S.faces()[0] === 0; }), 'a click on a face in the UV editor selects that face (in the 3D view too)');
      const uvBefore = await page.evaluate(() => Array.from(window.modelcraft.tools.tool.mesh.attrArray('uv').slice(0, 8)));
      await page.mouse.move(px, py); await page.mouse.down(); await page.mouse.move(px + 30, py - 20, { steps: 4 }); await page.mouse.up();
      await page.waitForTimeout(250);
      const uvAfter = await page.evaluate(() => Array.from(window.modelcraft.tools.tool.mesh.attrArray('uv').slice(0, 8)));
      ok(Math.abs(uvAfter[0] - uvBefore[0] - 30 / s) < 2e-3 && Math.abs(uvAfter[1] - uvBefore[1] - 20 / s) < 2e-3, 'dragging the selected face moves its UVs by the drag');
      await page.mouse.move(cv0().x, cv0().y);
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(250);
      ok(await page.evaluate((b) => Array.from(window.modelcraft.tools.tool.mesh.attrArray('uv').slice(0, 8)).every((x, i) => Math.abs(x - b[i]) < 1e-7), uvBefore), 'Ctrl+Z: the UVs back where they were');
      await page.click('[data-cmd="uv-stretch"]');
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, '11-uv-stretch-paper.png') });
      await page.selectOption('[data-workspace]', 'model');
      await page.waitForTimeout(300);
      ok(await page.evaluate((w) => !document.querySelector('[data-uv-editor]') && !document.querySelector('[data-stage]').classList.contains('mc-stage-uv') && Math.abs(document.querySelector('[data-gl]').clientWidth - w) < 2 && !window.modelcraft.view.uvPreview, glW), 'back to Model: the editor goes, the 3D view is whole again, no preview');
      // ---- MD.6: curve objects ----
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.change('clear', (m) => { m.root.insts.clear(); m.root.edges.clear(); m.root.faces.clear(); m.purge(); }); mc.host.setSel([]); mc.host.changed(); });
      await page.selectOption('[data-workspace]', 'curve');
      await page.waitForTimeout(250);
      await page.click('[data-curve-add]');
      await page.waitForTimeout(250);
      await page.click('dialog[open] button:has-text("Bézier circle")');
      await page.waitForTimeout(400);
      const cdef = () => page.evaluate(() => { const d = [...window.modelcraft.model.defs.values()].find((x) => x.curve); return d ? { id: d.id, pts: d.curve.splines[0].points.map((q) => q.p), faces: d.shown.faceCount, closed: d.shown.info().closed, vol: d.shown.info().volume, depth: d.curve.bevel.depth } : null; });
      let cd = await cdef();
      ok(cd && cd.faces > 0 && cd.closed && await page.evaluate(() => window.modelcraft.workspace === 'curve' && window.modelcraft.tools.name === 'curveedit'), `Curve › Add › Bézier circle: a ring (${cd?.faces} faces, closed), open for editing`);
      await page.click('button:has-text("Extents")');
      await page.waitForTimeout(250);
      await page.fill('#mc-curve-depth', '(' + (cd.depth * 3) + 'm)'); await page.press('#mc-curve-depth', 'Enter');
      await page.waitForTimeout(300);
      const cd2 = await cdef();
      ok(Math.abs(cd2.depth - cd.depth * 3) < 1e-9 && cd2.vol > cd.vol * 8, `Bevel depth × 3 in the panel: the ring nine times the volume (${(cd2.vol / cd.vol).toFixed(2)})`);
      // drag a point on screen
      const scr = await page.evaluate(() => { const mc = window.modelcraft, tl = mc.tools.tool, W = tl.world, q = tl.curve.splines[0].points[0].p; const w = [W[0] * q[0] + W[4] * q[1] + W[8] * q[2] + W[12], W[1] * q[0] + W[5] * q[1] + W[9] * q[2] + W[13], W[2] * q[0] + W[6] * q[1] + W[10] * q[2] + W[14]]; const s = mc.cam.project(w), r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.x + s[0], y: r.y + s[1] }; });
      await page.mouse.move(scr.x, scr.y); await page.mouse.down(); await page.mouse.move(scr.x + 40, scr.y + 10, { steps: 5 }); await page.mouse.up();
      await page.waitForTimeout(300);
      const cd3 = await cdef();
      const moved = Math.hypot(cd3.pts[0][0] - cd2.pts[0][0], cd3.pts[0][1] - cd2.pts[0][1]);
      ok(moved > 1e-3 && Math.abs(cd3.pts[0][2]) < 1e-9 && cd3.pts[1].every((x, i) => x === cd2.pts[1][i]), `dragging a point moves it in the circle's plane (${moved.toFixed(3)} m), the others stay`);
      await page.screenshot({ path: path.join(OUT, '12-curve-paper.png') });
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(250);
      ok((await cdef()).pts[0].every((x, i) => Math.abs(x - cd2.pts[0][i]) < 1e-12), 'Ctrl+Z: the point back');
      await page.click('[data-cmd="curve-to-mesh"]');
      await page.waitForTimeout(300);
      ok(await page.evaluate(() => window.modelcraft.workspace === 'model' && ![...window.modelcraft.model.defs.values()].some((x) => x.curve) && [...window.modelcraft.model.defs.values()].some((x) => x.mesh && x.mesh.faceCount > 0)), 'To mesh: a mesh now, back in Model');
      // a drawn circle → Make a curve object (Entity info)
      await withKernel(page, (M, MM, mc) => { mc.model.change('circle', (m) => { const pts = M.arcPts([0, 0, 0], [0, 0, 1], [1, 0, 0], 1, 2 * Math.PI, 24); for (let i = 0; i + 1 < pts.length; i++) M.addEdge(m.root, pts[i], pts[i + 1]); M.tagCurve(m.root, pts, 'circle', true); }); mc.host.changed(); });
      await page.evaluate(() => { const mc = window.modelcraft, es = [...mc.model.root.edges.entries()].filter(([, e]) => e.curve?.startsWith('circle')).map(([id]) => ({ t: 'e', id })); mc.host.setSel(es); });
      await page.waitForTimeout(300);
      await page.click('button:has-text("Make a curve object")');
      await page.waitForTimeout(300);
      ok(await page.evaluate(() => { const d = [...window.modelcraft.model.defs.values()].find((x) => x.curve); return !!d && d.curve.dim === '2d' && d.curve.splines[0].cyclic && d.shown.info().closed; }), 'a drawn circle › Entity info › Make a curve object: a closed flat curve object, shown as a ring');
      // ---- MD.7: sculpting ----
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.change('clear', (m) => { m.root.insts.clear(); m.root.edges.clear(); m.root.faces.clear(); m.purge(); }); mc.host.setSel([]); mc.host.changed(); });
      await page.selectOption('[data-workspace]', 'mesh');
      await page.waitForTimeout(250);
      await page.click('[data-mesh-add="uvsphere"]');
      await page.waitForTimeout(300);
      await page.click('button:has-text("Extents")');
      await page.waitForTimeout(250);
      await page.selectOption('[data-workspace]', 'sculpt');
      await page.waitForTimeout(400);
      ok(await page.evaluate(() => window.modelcraft.workspace === 'sculpt' && window.modelcraft.tools.name === 'meshsculpt'), 'Workspace › Sculpt: the mesh open with the brush');
      const ov = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
      const shape = () => page.evaluate(() => { const m = window.modelcraft.tools.tool.mesh || [...window.modelcraft.model.defs.values()].find((d) => d.mesh && d.mesh.faceCount).mesh; let s = 0; for (let i = 0; i < m.nv * 3; i++) s += m.P[i] * ((i % 7) + 1); return { s, steps: window.modelcraft.model.undoStack.length, nan: Array.from(window.modelcraft.view.cache.values()).some((g) => g.def.mesh && Array.from(g.faces.attributes.color.array.slice(0, 30)).some((x) => !Number.isFinite(x))) }; });
      const s0 = await shape();
      await page.mouse.move(ov.x - 60, ov.y); await page.mouse.down();
      for (let i = 0; i <= 12; i++) { await page.mouse.move(ov.x - 60 + i * 10, ov.y + Math.sin(i / 2) * 10); await page.waitForTimeout(16); }
      await page.mouse.up();
      await page.waitForTimeout(300);
      const s1 = await shape();
      ok(Math.abs(s1.s - s0.s) > 1e-4 && s1.steps === s0.steps + 1 && !s1.nan, `a Draw stroke across the sphere changes it as one undo step (${s0.steps} → ${s1.steps}), colours sound`);
      await page.screenshot({ path: path.join(OUT, '13-sculpt-paper.png') });
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(250);
      ok(Math.abs((await shape()).s - s0.s) < 1e-9, 'Ctrl+Z: the whole stroke undone');
      await page.mouse.move(ov.x, ov.y);
      await page.keyboard.press('m');
      await page.keyboard.press(']');
      await page.keyboard.press('x');
      const sk = await page.evaluate(() => ({ brush: window.modelcraft.tools.meshSculpt.brush, r: window.modelcraft.tools.meshSculpt.radius, sym: window.modelcraft.tools.meshSculpt.sym, pressed: document.querySelector('[data-cmd="sculpt-mask"]').getAttribute('aria-pressed') }));
      ok(sk.brush === 'mask' && sk.r > 50 && sk.sym === 'x' && sk.pressed === 'true', `keys: M the mask brush (pressed in the toolbar), ] a bigger brush (${sk.r} px), X mirror`);
      await page.mouse.down(); await page.mouse.move(ov.x + 20, ov.y + 5, { steps: 4 }); await page.mouse.up();
      await page.waitForTimeout(300);
      const masked = await page.evaluate(() => { const m = window.modelcraft.tools.tool.mesh, a = m.attrArray('mask'); let n = 0, l = 0, r = 0; if (a) for (let v = 0; v < m.nv; v++) if (a[v] > 0) { n++; if (m.P[v * 3] < 0) l++; else r++; } return { n, l, r }; });
      ok(masked.n > 0 && masked.l > 0 && masked.r > 0, `the mask paints both sides with Mirror X (${masked.l} + ${masked.r} vertices)`);
      await page.selectOption('[data-workspace]', 'model');
      await page.waitForTimeout(250);
      ok(await page.evaluate(() => window.modelcraft.workspace === 'model' && !window.modelcraft.view.showMask), 'back to Model: the mask is not shown there');
      // ---- MD.8: remesh and retopology ----
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.change('clear', (m) => { m.root.insts.clear(); m.root.edges.clear(); m.root.faces.clear(); m.purge(); }); mc.host.setSel([]); mc.host.changed(); });
      await page.selectOption('[data-workspace]', 'mesh');
      await page.waitForTimeout(250);
      await page.click('[data-mesh-add="cube"]');
      await page.waitForTimeout(300);
      const before = await page.evaluate(() => { const m = window.modelcraft.tools.tool.mesh; return { f: m.faceCount, vol: m.info().volume, steps: window.modelcraft.model.undoStack.length }; });
      await page.click('[data-cmd="mesh-remesh"]');
      await page.waitForSelector('#mc-ask-input');
      await page.press('#mc-ask-input', 'Enter');
      await page.waitForFunction((n) => window.modelcraft.tools.tool.mesh.faceCount !== n, before.f, { timeout: 20000 }).catch(() => {});
      const after = await page.evaluate(() => { const m = window.modelcraft.tools.tool.mesh, i = m.info(); return { f: i.faces, vol: i.volume, closed: i.closed, steps: window.modelcraft.model.undoStack.length, tri: Array.from({ length: m.nf }, (_, f) => f).every((f) => m.faceDead(f) || m.faceSize(f) === 3) }; });
      ok(after.f > before.f && after.closed && after.tri && Math.abs(after.vol - before.vol) < before.vol * 5e-3 && after.steps === before.steps + 1, `Mesh › Remesh at the size offered: ${after.f} even triangles, closed, the volume within 0.5 % (${after.vol.toFixed(4)} of ${before.vol}: a voxel remesh rounds sharp edges a little), one undo step`);
      await page.screenshot({ path: path.join(OUT, '14-remesh-paper.png') });
      // a second mesh to build on: a ball under a small plane
      await page.evaluate(async () => {
        const mc = window.modelcraft, map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
        const pr = await import(Object.keys(map).find((k) => /\/mesh\/primitives\.js/.test(k)));
        mc.model.change('ball', (m) => { const d = m.newMeshDef(pr.makePrimitive('uvsphere', { r: 1 }), 'Ball'); m.place(m.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1.5, 1]); });
        mc.host.changed();
      });
      await page.waitForTimeout(250);
      await page.selectOption('#mc-retopo-target', { label: 'Ball' });
      await page.waitForTimeout(200);
      await page.evaluate(() => window.modelcraft.tools.tool.command('select-all'));
      await page.waitForTimeout(150);
      await page.click('[data-retopo-project]');
      await page.waitForTimeout(300);
      const onBall = await page.evaluate(() => {
        const mc = window.modelcraft, tl = mc.tools.tool, W = tl.world, m = tl.mesh;
        let worst = 0;
        for (let v = 0; v < m.nv; v++) { if (m.vertDead(v)) continue; const p = [W[0] * m.P[v * 3] + W[4] * m.P[v * 3 + 1] + W[8] * m.P[v * 3 + 2] + W[12], W[1] * m.P[v * 3] + W[5] * m.P[v * 3 + 1] + W[9] * m.P[v * 3 + 2] + W[13], W[2] * m.P[v * 3] + W[6] * m.P[v * 3 + 1] + W[10] * m.P[v * 3 + 2] + W[14]]; worst = Math.max(worst, Math.abs(Math.hypot(p[0], p[1], p[2] - (-1.5 + 1)) - 1)); }
        return worst;
      });
      ok(onBall < 0.05, `Retopology › Build on: Ball, Put the selected points on it: every point of the remeshed cube on the ball (within ${onBall.toFixed(3)} m)`);
      await page.check('#mc-retopo-front');
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => window.modelcraft.view.meshEditState?.front === true), 'Show this mesh\'s edges in front: the cage drawn over the surface');
      await page.selectOption('[data-workspace]', 'model');
      await page.waitForTimeout(200);
    }
    await page.close();
  }
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} catch (e) {
  // a run that stops early still says what the page complained about
  if (problems.length) console.log('  page problems: ' + problems.join(' | '));
  throw e;
} finally {
  await browser.close();
  if (!KEEP_ADMIN) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} }
  if (fs.existsSync(STATE)) fs.unlinkSync(STATE);
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${OUT}`);
process.exit(fail ? 1 : 0);
