#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-print07.mjs — the 0.7 print tools in ModelCraft (LC.21, session print-07), headless Chromium at /lab/modelcraft:
 * Supports preview, the Beginner menu style, Wall thickness, Hollow and Repair, each opened from Check for 3D printing.
 *   node tools/modelcraft-test/browser-print07.mjs [--only supports,beginner,walls,hollow,repair] [--out <dir>] [--keep-admin]
 * Run as root (ModelCraft's test admin, as browser-print3d.mjs). Shapes are built with the page's own model module.
 * Screenshots in tmp/shots/print07 (both themes for the cards). Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/print07')));
const ONLY = new Set(arg('--only', 'supports,walls,beginner,hollow,repair,showcase').split(','));
const STATE = path.join(REPO, 'tmp/skp-browser-state.json');
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
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE, acceptDownloads: true });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (okLab) return c;
    await c.close();
  }
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

// shapes, in metres, through the page's own model module: a profile in the XZ plane pulled 20 mm along Y
const PROFILES = {
  bridge: [[0, 0], [10, 0], [10, 30], [50, 30], [50, 0], [60, 0], [60, 40], [0, 40]],
  fin: [[0, 0], [30, 0], [30, 4], [15.3, 4], [15.3, 20], [14.7, 20], [14.7, 4], [0, 4]],   // a 0.6 mm fin on a 4 mm base
};
const buildProfile = (page, name) => page.evaluate(async (prof) => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const url = Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))?.[1];
  const M = await import(url);
  const mc = window.modelcraft, m = mc.model;
  m.change('test shape', (mm) => {
    M.addPolygon(mm.root, prof.map(([x, z]) => [x / 1000, 0, z / 1000]));
    const f = [...mm.root.faces.keys()][0], n = M.faceNormal(mm.root, mm.root.faces.get(f));
    M.pushPull(mm.root, f, n[1] > 0 ? 0.02 : -0.02);
  });
  mc.host.changed?.();
  document.querySelector('[data-hint]').hidden = true;   // the empty-view hint (a shape made by script never hides it)
}, PROFILES[name]).then(() => page.click('[data-act="extents"]'));

async function openCheck(page) {
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export="print3d"]');
  await page.waitForSelector('dialog.mc-dialog [data-print-ok]', { timeout: 120000 });
}
async function openTool(page, name) {
  await openCheck(page);
  await page.click(`dialog.mc-dialog [data-prep-tools] button[data-key="tool:${name}"]`);
  await page.waitForSelector(`[data-ptool="${name}"]:not([hidden]) [data-ptool-result]`, { timeout: 120000 });
  return page.evaluate(() => document.querySelector('[data-ptool]:not([hidden])').textContent);
}
const overlayLayers = (page) => page.evaluate(() => {
  const g = window.modelcraft.view?.scene?.getObjectByName?.('print-tools');
  return g ? g.children.map((o) => o.type + ':' + (o.geometry.attributes.position?.count || 0)) : null;
});

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1400, height: 900 }, locale: 'en-US' });
  for (const space of ['paper', 'model']) {
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(space + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(space + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/modelcraft?space=' + space, { waitUntil: 'networkidle' });
    ok(await page.evaluate(() => !!window.modelcraft), space + ': the app starts');

    if (ONLY.has('supports')) {
      await buildProfile(page, 'bridge');
      const text = await openTool(page, 'supports');
      ok(/Faces past the angle \(red\): 8 cm²\. 98 support points, about 4 cm³ of support\./.test(text), space + ': the bridge: 8 cm² past 45°, 98 columns, about 4 cm³ — ' + text.slice(0, 160));
      const layers = await overlayLayers(page);
      ok(layers && layers.some((l) => /^Mesh:6$/.test(l)) && layers.some((l) => l === 'LineSegments:196'), space + ': the view shows the 2 red triangles and 98 columns: ' + layers);
      await page.evaluate(() => window.modelcraft.cam && window.modelcraft.view.invalidate());
      await page.screenshot({ path: path.join(OUT, `01-supports-columns-${space}.png`) });
      await page.check('[data-ptool="supports"] input[value="tree"]');
      await page.waitForFunction(() => /branches 1\.2 mm/.test(document.querySelector('[data-ptool="supports"]')?.textContent || ''));
      const tree = await page.textContent('[data-ptool="supports"]');
      ok(/about 3\.5 cm³ of support/.test(tree) && /branches 1\.2 mm across/.test(tree), space + ': Tree: less material, said how it is estimated');
      await page.screenshot({ path: path.join(OUT, `02-supports-tree-${space}.png`) });
      await page.fill('[data-ptool="supports"] input[name="mcPtool-angle"]', '80');
      await page.dispatchEvent('[data-ptool="supports"] input[name="mcPtool-angle"]', 'change');
      await page.waitForTimeout(300);
      ok(/98 support points/.test(await page.textContent('[data-ptool="supports"]')), space + ': at 80° the flat underside still needs them');
      // the model changes while the card is open: the preview follows
      await page.evaluate(() => window.modelcraft.model.undo());
      await page.waitForFunction(() => /Nothing to print here/.test(document.querySelector('[data-ptool="supports"]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
      ok(/Nothing to print here/.test(await page.textContent('[data-ptool="supports"]')) && !(await overlayLayers(page)).length, space + ': undo to an empty model: the card says so and the marks go');
      await page.click('[data-ptool="supports"] [data-ptool-close]');
      ok(await page.evaluate(() => window.modelcraft.printTool.current() === null && document.querySelector('[data-ptool]').hidden), space + ': Close hides the card');
    }
    if (ONLY.has('walls')) {
      await page.evaluate(() => { const m = window.modelcraft.model; m.change('clear', (mm) => { mm.root.insts.clear(); mm.root.faces.clear(); mm.root.edges.clear(); }); });
      await buildProfile(page, 'fin');
      const text = await openTool(page, 'walls');
      ok(/2 areas are too thin \(red\): 0\.6 mm at the thinnest/.test(text), space + ': a 0.6 mm fin: 2 thin areas (its two sides), 0.6 mm — ' + text.slice(text.indexOf('allow'), text.indexOf('allow') + 150));
      ok((await page.$$('[data-ptool="walls"] [data-ptool-regions] li')).length === 2, space + ': both listed, each with Show');
      await page.click('[data-ptool="walls"] [data-ptool-regions] li button');
      await page.screenshot({ path: path.join(OUT, `05-walls-${space}.png`) });
      await page.fill('[data-ptool="walls"] input[name="mcPtool-min"]', '0.5');
      await page.dispatchEvent('[data-ptool="walls"] input[name="mcPtool-min"]', 'change');
      await page.waitForFunction(() => /No wall is thinner than 0\.5 mm: the thinnest is 0\.6 mm/.test(document.querySelector('[data-ptool="walls"]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
      const t2 = await page.textContent('[data-ptool="walls"]');
      ok(/No wall is thinner than 0\.5 mm: the thinnest is 0\.6 mm/.test(t2) && /Close to the limit/.test(t2), space + ': a 0.5 mm limit: fine, but close to it (orange)');
      await page.click('[data-ptool="walls"] [data-ptool-close]');
    }
    if (ONLY.has('hollow')) {
      // a 30 mm cube as a group, selected
      await page.evaluate(async () => {
        const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
        const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
        const mc = window.modelcraft, m = mc.model;
        const iid = m.change('test cube', (mm) => {
          mm.root.insts.clear(); mm.root.faces.clear(); mm.root.edges.clear();
          const d = mm.newDef('group', 'Cube');
          M.addPolygon(d, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 0.03, 0.03));
          M.pushPull(d, [...d.faces.keys()][0], 0.03);
          return mm.place(mm.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        });
        mc.host.setSel([{ t: 'i', id: iid }]);
        document.querySelector('[data-hint]').hidden = true;
      });
      await page.click('[data-view-menu] > summary'); await page.click('[data-view="top"]');
      await page.click('[data-act="extents"]');
      let text = await openTool(page, 'hollow');
      ok(/It holds 27 cm³/.test(text), space + ': Hollow on the selected 30 mm cube: it holds 27 cm³');
      await page.click('[data-ptool="hollow"] [data-ptool-act="hole"]');
      const mid = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await page.mouse.click(mid.x, mid.y);
      await page.waitForSelector('[data-ptool="hollow"] [data-ptool-holes] li', { timeout: 5000 }).catch(() => {});
      ok((await page.$$('[data-ptool="hollow"] [data-ptool-holes] li')).length === 1 && await page.evaluate(() => window.modelcraft.model.root.insts.size === 1), space + ': a click on the top places one drain hole (and draws nothing in the model)');
      await page.click('[data-ptool="hollow"] [data-ptool-act="preview"]');
      await page.waitForFunction(() => /Hollowing takes out/.test(document.querySelector('[data-ptool="hollow"]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
      text = await page.textContent('[data-ptool="hollow"]');
      ok(/Hollowing takes out 17\.6 cm³ of its 27 cm³ \(65%\)/.test(text) && /exactly the wall/.test(text), space + ': Preview: 17.6 of 27 cm³ (65%), an exact offset — ' + text.slice(text.indexOf('(mm)'), text.indexOf('(mm)') + 200));
      await page.click('[data-view-menu] > summary'); await page.click('[data-view="iso"]');
      await page.screenshot({ path: path.join(OUT, `06-hollow-card-${space}.png`) });
      await page.click('[data-ptool="hollow"] [data-ptool-act="apply"]');
      await page.waitForFunction(() => /^Hollowed:/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 60000 }).catch(() => {});
      ok(/^Hollowed: 17\.6 cm³ taken out, 1 drain hole/.test(await page.textContent('[data-msg]')), space + ': ' + await page.textContent('[data-msg]'));
      const kind = await page.evaluate(() => { const m = window.modelcraft.model; return [...m.root.insts.values()].map((i) => m.def(i.def).kind).join(); });
      ok(kind === 'group' && /It is a solid group/.test(await page.textContent('[data-msg]')), space + ': the hollowed cube is one solid group of faces (kernel-print), and the status line says so — ' + kind);
      await page.click('[data-ptool="hollow"] [data-ptool-close]');
      await openCheck(page);
      const d = await page.textContent('dialog.mc-dialog');
      ok(/Ready to print/.test(d) && /Volume: 9\.4 cm³/.test(d), space + ': the 3D-print check accepts it: ready, 9.4 cm³ — ' + (d.match(/Volume: [^c]+cm³/) || [''])[0]);
      await page.click('dialog.mc-dialog button[data-key="cancel"]');
      await page.evaluate(() => window.modelcraft.model.undo());
      const back = await page.evaluate(() => { const m = window.modelcraft.model; return [...m.root.insts.values()].map((i) => m.def(i.def).kind).join(); });
      ok(back === 'group', space + ': one undo: the solid cube is back — ' + back);
    }
    if (ONLY.has('repair')) {
      // a 30 mm cube as a group with its bottom gone and its top turned over; then two overlapping 20 mm cubes in one group
      const mk = (what) => page.evaluate(async (what) => {
        const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
        const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
        const mc = window.modelcraft, m = mc.model, I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const cube = (mm, name, o, s) => { const d = mm.newDef('group', name); M.addPolygon(d, M.rectPts(o, [1, 0, 0], [0, 1, 0], s, s)); M.pushPull(d, [...d.faces.keys()][0], s); return d; };
        const iid = m.change('test part', (mm) => {
          mm.root.insts.clear(); mm.root.faces.clear(); mm.root.edges.clear();
          if (what === 'broken') {
            const d = cube(mm, 'Broken', [0, 0, 0], 0.03);
            const byZ = (z) => [...d.faces].find(([, f]) => Math.abs(M.faceNormal(d, f)[2] - z) < 1e-6)[0];
            d.faces.delete(byZ(-1));
            M.reverseFaces(d, [byZ(1)]);
            return mm.place(mm.root, d.id, I4);
          }
          const pair = mm.newDef('group', 'Pair');
          mm.place(pair, cube(mm, 'A', [0, 0, 0], 0.02).id, I4);
          mm.place(pair, cube(mm, 'B', [0.01, 0.01, 0.01], 0.02).id, I4);
          return mm.place(mm.root, pair.id, I4);
        });
        mc.host.setSel([{ t: 'i', id: iid }]);
        document.querySelector('[data-hint]').hidden = true;
      }, what);
      await mk('broken');
      await page.click('[data-act="extents"]');
      let text = await openTool(page, 'repair');
      const fixes = await page.$$eval('[data-ptool="repair"] [data-ptool-fixes] li', (l) => l.map((x) => x.dataset.kind + ': ' + x.textContent));
      ok(fixes.length === 2 && /flipped: 2 triangles facing the wrong way turned round/.test(fixes.join()) && /holes: 1 hole closed/.test(fixes.join()), space + ': a cube with no bottom and its top turned: both listed — ' + fixes.join(' | '));
      await page.screenshot({ path: path.join(OUT, `07-repair-${space}.png`) });
      await page.click('[data-ptool="repair"] [data-ptool-act="fix"]');
      await page.waitForFunction(() => /^Repaired:/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
      ok(/^Repaired: 2 triangles facing the wrong way turned round\. 1 hole closed\./.test(await page.textContent('[data-msg]')), space + ': every fix listed in the status: ' + await page.textContent('[data-msg]'));
      await page.waitForFunction(() => /Nothing to repair/.test(document.querySelector('[data-ptool="repair"]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
      ok(/Nothing to repair/.test(await page.textContent('[data-ptool="repair"]')), space + ': the card then says there is nothing left');
      await page.click('[data-ptool="repair"] [data-ptool-close]');
      await openCheck(page);
      let d = await page.textContent('dialog.mc-dialog');
      ok(/Ready to print/.test(d) && /Volume: 27 cm³/.test(d), space + ': the check accepts it: ready, 27 cm³');
      await page.click('dialog.mc-dialog button[data-key="cancel"]');
      await mk('pair');
      text = await openTool(page, 'repair');
      ok(/Separate pieces overlap/.test(text) && !!(await page.$('[data-ptool="repair"] [data-ptool-act="join"]')) && !(await page.$('[data-ptool="repair"] [data-ptool-act="fix"]')), space + ': two overlapping cubes: reported, with Join overlapping parts (asked for, not automatic)');
      await page.click('[data-ptool="repair"] [data-ptool-act="join"]');
      await page.waitForFunction(() => /^Joined:/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
      await page.click('[data-ptool="repair"] [data-ptool-close]');
      await openCheck(page);
      d = await page.textContent('dialog.mc-dialog');
      ok(/Ready to print/.test(d) && /Volume: 15 cm³/.test(d) && !/overlap/i.test(d), space + ': joined: one body of 15 cm³, no overlap warning');
      await page.click('dialog.mc-dialog button[data-key="cancel"]');
    }
    if (ONLY.has('beginner')) {
      await page.evaluate(() => { window.modelcraft.model.change('clear', (m) => { m.root.insts.clear(); m.root.faces.clear(); m.root.edges.clear(); }); window.ccInput.setStyle('beginner'); });
      await page.waitForSelector('.cc-in-big[data-cmd="beginner.box"]', { timeout: 10000 });
      const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map((b) => b.textContent.trim()).filter(Boolean));
      ok(['Make', 'View', 'More tools'].every((x) => tabs.includes(x)), space + ': Beginner: a ribbon with Make, View and More tools — ' + tabs.join(', '));
      const big = await page.evaluate(() => [...document.querySelectorAll('.cc-in-big')].map((b) => b.dataset.cmd));
      ok(['beginner.box', 'beginner.cylinder', 'beginner.hole-cylinder', 'beginner.group', 'export.print3d'].every((c) => big.includes(c)), space + ': big buttons for shapes, holes, Group and the check (' + big.length + ')');
      await page.screenshot({ path: path.join(OUT, `03-beginner-ribbon-${space}.png`) });
      // drop a box where the view's middle is (the ground), then a round hole beside it
      const box = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await page.click('.cc-in-big[data-cmd="beginner.box"]');
      await page.waitForFunction(() => window.modelcraft.tools.name === 'place', null, { timeout: 5000 }).catch(() => {});
      const where = await page.evaluate(() => [window.modelcraft.tools.name, document.querySelector('[data-msg]').textContent, document.querySelector('[data-tip], .mc-status')?.textContent || ''].join(' | '));
      ok(/^place \|/.test(where) && /Click where the Box goes/.test(where), space + ': Box: the Place tool, and where to click — ' + where.slice(0, 140));
      await page.mouse.move(box.x + 3, box.y + 3); await page.mouse.move(box.x, box.y); await page.mouse.click(box.x, box.y);
      await page.waitForFunction(() => window.modelcraft.model.root.insts.size === 1, null, { timeout: 5000 }).catch(() => {});
      await page.click('.cc-in-big[data-cmd="beginner.hole-cylinder"]');
      await page.mouse.move(box.x + 60, box.y + 3); await page.mouse.move(box.x + 60, box.y); await page.mouse.click(box.x + 60, box.y);
      await page.waitForFunction(() => window.modelcraft.model.root.insts.size === 2, null, { timeout: 5000 }).catch(() => {});
      const st = await page.evaluate(() => { const m = window.modelcraft.model; return [...m.root.insts.values()].map((i) => m.def(i.def).starter); });
      ok(st.length === 2 && st[0] === 'beginner-box' && st[1] === 'beginner-hole-cylinder', space + ': a box and a round hole dropped: ' + st);
      // put the hole through the box's middle (half as wide, taller), select both, Group
      await page.evaluate(() => {
        const mc = window.modelcraft, m = mc.model, [a, b] = [...m.root.insts.keys()], A = m.root.insts.get(a);
        m.change('test: hole through', (mm) => { const B = mm.root.insts.get(b); B.m = [0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1.5, 0, A.m[12], A.m[13], A.m[14] - 0.005, 1]; });
        mc.host.setSel([{ t: 'i', id: a }, { t: 'i', id: b }]);
      });
      await page.click('.cc-in-big[data-cmd="beginner.group"]');
      await page.waitForFunction(() => /Grouped: 1 hole cut/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
      ok(/Grouped: 1 hole cut into the shapes/.test(await page.textContent('[data-msg]')), space + ': Group: ' + await page.textContent('[data-msg]'));
      await page.evaluate(() => window.ccInput.run('camera.extents'));
      await page.screenshot({ path: path.join(OUT, `04-beginner-grouped-${space}.png`) });
      await page.click('.cc-in-big[data-cmd="export.print3d"]');
      await page.waitForSelector('dialog.mc-dialog [data-print-ok]', { timeout: 60000 });
      const d = await page.textContent('dialog.mc-dialog');
      ok(/Ready to print/.test(d) && /Volume: 6\.4 cm³/.test(d), space + ': the grouped box with its hole is ready to print, 6.4 cm³ — ' + (d.match(/Volume: [^.]+\.\d? ?cm³/) || [''])[0]);
      await page.click('dialog.mc-dialog button[data-key="cancel"]');
      await page.evaluate(() => window.modelcraft.model.undo());
      ok(await page.evaluate(() => window.modelcraft.model.root.insts.size === 2), space + ': one undo: the box and the hole are back');
      // align and hole / solid, through the style's own commands
      const al = await page.evaluate(async () => {
        const mc = window.modelcraft, m = mc.model, ids = [...m.root.insts.keys()];
        mc.host.setSel(ids.map((id) => ({ t: 'i', id })));
        await window.ccInput.run('beginner.align-left');
        const x = ids.map((id) => m.bbox(m.def(m.root.insts.get(id).def), m.root.insts.get(id).m).min[0]);
        await window.ccInput.run('beginner.solid');
        const solid = ids.map((id) => m.def(m.root.insts.get(id).def).starter);
        return { x, msg: document.querySelector('[data-msg]').textContent, solid };
      });
      ok(Math.abs(al.x[0] - al.x[1]) < 1e-9, space + ': Align left: both left sides meet');
      ok(al.solid[1] === 'beginner-cylinder' && /1 hole is a solid shape again/.test(al.msg), space + ': Make it solid: the round hole is a cylinder again');
      // every other style: unchanged, no Beginner command in it
      const other = await page.evaluate(() => { window.ccInput.setStyle('pushpull'); return [...document.querySelectorAll('[data-cmd^="beginner."]')].length; });
      ok(other === 0, space + ': Push-pull style: no Beginner command anywhere');
      await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
    }
    if (ONLY.has('showcase')) {
      // the saved showcase file (made once by tools/modelcraft-test/make-print-showcase.mjs): each tool on its own part
      await page.evaluate(() => { const mc = window.modelcraft; mc.model.dirty = false; window.ccInput?.setStyle?.('modelcraft'); });
      await page.setInputFiles('[data-file-open]', path.join(REPO, 'fixtures/showcase/modelcraft-print.modelcraft'));
      await page.waitForFunction(() => window.modelcraft.model.root.insts.size === 6, null, { timeout: 30000 }).catch(() => {});
      const pick = (name) => page.evaluate((name) => { const mc = window.modelcraft, m = mc.model; const id = [...m.root.insts].find(([, i]) => m.def(i.def).name === name)?.[0]; mc.host.setSel(id ? [{ t: 'i', id }] : []); return !!id; }, name);
      ok(await pick('Bridge'), space + ': the showcase opens with its six placements');
      await page.click('[data-act="extents"]');
      let text = await openTool(page, 'supports');
      ok(/98 support points/.test(text), space + ': showcase Bridge: 98 supports');
      await page.screenshot({ path: path.join(OUT, `10-showcase-supports-${space}.png`) });
      await pick('Bracket');
      await page.waitForFunction(() => !/98 support points/.test(document.querySelector('[data-ptool]:not([hidden])')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
      await page.click('[data-ptool] [data-ptool-close]');
      text = await openTool(page, 'walls');
      await page.fill('[data-ptool="walls"] input[name="mcPtool-min"]', '0.8');   // the card keeps the last limit used in this visit
      await page.dispatchEvent('[data-ptool="walls"] input[name="mcPtool-min"]', 'change');
      await page.waitForFunction(() => /2 areas are too thin/.test(document.querySelector('[data-ptool="walls"]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
      text = await page.textContent('[data-ptool="walls"]');
      ok(/2 areas are too thin/.test(text), space + ': showcase Bracket: 2 thin areas — ' + text.slice(text.indexOf('(mm)') + 4, text.indexOf('(mm)') + 120));
      await page.click('[data-ptool] [data-ptool-close]');
      await pick('Ball');
      text = await openTool(page, 'hollow');
      ok(/It holds 32\.6 cm³/.test(text), space + ': showcase Ball: Hollow ready (' + (text.match(/It holds [\d.]+ cm³/) || [''])[0] + ')');
      await page.click('[data-ptool] [data-ptool-close]');
      await pick('Broken box');
      text = await openTool(page, 'repair');
      ok(/2 triangles facing the wrong way/.test(text) && /1 hole closed/.test(text), space + ': showcase Broken box: Repair lists 2 turned triangles and 1 hole');
      await page.click('[data-ptool] [data-ptool-close]');
    }
    await page.close();
  }
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} finally {
  await browser.close();
  if (!KEEP_ADMIN) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} if (fs.existsSync(STATE)) fs.unlinkSync(STATE); }
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${OUT}`);
process.exit(fail ? 1 : 0);
