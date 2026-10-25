#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-animate.mjs — the Animate workspace (0.7 Track AN, session `anim`) in headless Chromium on /lab/modelcraft.
 * AN.1: the workspace switch opens the timeline; the panel keys a box's place by typed numbers and a lamp's brightness; the
 * box and the lamp are where render/anim.js says between the keys; Curves: the list, a key dragged on the canvas (then the
 * timeline's Undo), a cycle; Keys: Shift-click two keys, copy and paste them at the playhead, Stretch; Clips: Make a clip
 * (the same motion), a second clip at half; the animation saved in the file; closing puts the box and the lamp back; no
 * console errors. Later items (AN.4, AN.2, AN.3, AN.5) add their sections. Shots in tmp/shots/animate.
 *
 *   node tools/modelcraft-test/browser-animate.mjs [--out <dir>] [--only an1,an4,…]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php; the signed-in state is browser-render's).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/animate')));
const ONLY = arg('--only', '') ? new Set(arg('--only', '').split(',')) : null;
const want = (s) => !ONLY || ONLY.has(s);
const STATE = path.join(REPO, 'tmp/render-browser-state.json');
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

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
/** A module of the dev build as the page loads it. */
const mod = (re) => `(async () => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  return import(Object.entries(map).find(([k]) => ${re}.test(k))[1]); })()`;
const ANIM = mod('/\\/modelcraft\\/dev\\/render\\/anim\\.js/');
const scrubTo = (page, s) => page.evaluate((s) => { const r = document.querySelector('[data-tl-time]'); r.value = String(s); r.dispatchEvent(new Event('input', { bubbles: true })); }, s);
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
/** Type a value into the Animate panel (it redraws at most five times a second: wait for it before and after). */
async function typeIn(page, sel, v) {
  await page.waitForTimeout(400);
  await page.waitForSelector(sel);
  // the value and its change in one go: a redraw can't come between them
  await page.evaluate(([s2, x]) => { const i = document.querySelector(s2); i.value = x; i.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, String(v)]);
  await page.waitForTimeout(400);
}

/** A floor, a box group and a lamp; → {box, lamp}. */
const scene = (page) => page.evaluate(async (src) => {
  const M = await import(JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports[Object.keys(JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports).find((k) => /\/modelcraft\/dev\/model\.js/.test(k))]);
  void src;
  const m = window.modelcraft.model;
  let box;
  m.change('scene', (mm) => {
    M.addPolygon(mm.root, M.rectPts([-6, -6, 0], [1, 0, 0], [0, 1, 0], 12, 12));
    M.addPolygon(mm.root, M.rectPts([-1, -1, 0.01], [1, 0, 0], [0, 1, 0], 2, 2));
    const f = [...mm.root.faces.keys()].pop();
    M.pushPull(mm.root, f, 1.5);
    box = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group', 'Box');
  });
  const lamp = m.addLight({ kind: 'point', p: [0, 0, 3], lumens: 800, name: 'Ceiling lamp' });
  window.modelcraft.host.changed();
  return { box, lamp };
}, null);

const ctx = await signedInContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

try {
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft && window.modelcraft.timeline);
  const { box, lamp } = await scene(page);
  const tl = (f, ...a) => page.evaluate(f, ...a);

  if (want('an1')) {
    console.log('\nAN.1 — the Animate workspace');
    const has = await tl(() => [...document.querySelectorAll('#mc-workspace option')].map((o) => o.value));
    ok(has.includes('animate'), 'Animate is in the workspace list (registered from timeline.js)', has.join(','));
    await page.selectOption('#mc-workspace', 'animate');
    await page.waitForSelector('[data-timeline]:not([hidden])');
    const groups = await tl(() => [...document.querySelectorAll('[data-workspace-group="animate"]')].filter((g) => !g.hidden).length);
    ok(groups === 5, 'its five toolbar groups show (Keys, Play, Timeline, Rig, Physics); the timeline is open', String(groups));
    await page.fill('[data-tl-length]', '2');
    await page.locator('[data-tl-length]').dispatchEvent('change');

    // the box: chosen, then its place typed at 0 s and 2 s
    await tl((id) => { window.modelcraft.host.setSel([{ t: 'i', id }]); window.modelcraft.host.changed(); }, box);
    await page.waitForSelector('[data-an-in="location.0"]');
    await scrubTo(page, 0);
    await typeIn(page, '[data-an-in="location.0"]', '0');
    await scrubTo(page, 2);
    await typeIn(page, '[data-an-in="location.0"]', '4');
    let an = await tl(() => window.modelcraft.timeline.anim);
    ok(an.props && an.props.filter((p) => p.target === 'obj:' + 0 || p.prop === 'location').length >= 1 && an.props[0].keys.length === 2, 'two place keys from typed numbers', JSON.stringify(an.props?.map((p) => p.target + '.' + p.prop + ':' + p.keys.length)));
    await scrubTo(page, 1);
    const mid = await tl(async ([src, id]) => { const A = await eval(src); const a = window.modelcraft.timeline.anim; const i = A.findProp(a, 'obj:' + id, 'location'); return { want: A.valueAt(a.props[i], 1), keys: a.props[i].keys.map((k) => k.v[0]), m: window.modelcraft.model.root.insts.get(id).m.slice(12, 15) }; }, [ANIM, box]);
    ok(near(mid.m[0], mid.want[0], 1e-9) && JSON.stringify(mid.keys) === '[0,4]' && near(mid.want[0], 2, 1e-6), 'at 1 s the box is where the curve says (halfway)', JSON.stringify(mid));

    // the lamp's brightness
    await scrubTo(page, 0);
    await typeIn(page, `[data-an-in="light:${lamp}.lumens"]`, '400');
    await scrubTo(page, 2);
    await typeIn(page, `[data-an-in="light:${lamp}.lumens"]`, '1600');
    await scrubTo(page, 1);
    const lit = await tl(async ([src, id]) => { const A = await eval(src); const a = window.modelcraft.timeline.anim; return { want: A.propsAt(a, 1).get('light:' + id + '|lumens')[0], got: window.modelcraft.model.lights.get(id).lumens }; }, [ANIM, lamp]);
    ok(Math.abs(lit.got - Math.round(lit.want)) <= 1 && lit.want > 400 && lit.want < 1600, 'the lamp is as bright as its track says at 1 s', JSON.stringify(lit));
    const rows = await tl(() => [...document.querySelectorAll('[data-tl-row].is-prop .mc-tl-name')].map((n) => n.textContent.trim()));
    ok(rows.length === 2 && rows.some((r) => /Box/.test(r)) && rows.some((r) => /Ceiling lamp/.test(r)), 'a row per property track, named for what it moves', JSON.stringify(rows));

    // Curves: list, drag a key, undo, a cycle
    await page.click('[data-tl-mode="curves"]');
    await page.waitForSelector('[data-an-curves]:not([hidden]) canvas');
    await page.waitForTimeout(300);
    const nChans = await tl(() => document.querySelectorAll('[data-an-chan]').length);
    ok(nChans === 4, 'Curves lists a curve per number (place X, Y, Z and the brightness)', String(nChans));
    // show only the brightness, then drag its key at 2 s down
    await tl(() => { for (const b of document.querySelectorAll('[data-an-chan]')) if (!b.dataset.anChan.startsWith('p1')) { b.checked = false; b.dispatchEvent(new Event('change')); } });
    await page.click('[data-an-frame]');
    const at = await tl(async ([src]) => {
      const G = await import(new URL('../anim/graph.js', new URL(Object.entries(JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports).find(([k]) => /\/modelcraft\/dev\/render\/anim\.js/.test(k))[1], location.href)).href);
      void src;
      const c = window.modelcraft.timeline.curves, v = c.view, r = document.querySelector('[data-an-canvas]').getBoundingClientRect();
      const [x, y] = G.toPx(v, 2, 1600), [x2, y2] = G.toPx(v, 2, 1000);
      const pts = G.points(window.modelcraft.timeline.anim, [{ track: 'p1', comp: 0 }]), h = G.hit(v, pts, x, y);
      return { x: r.left + x, y: r.top + y, y2: r.top + y2, x2: r.left + x2, hit: h && h.kind + h.p.i, v: { w: v.w, h: v.h, t0: v.t0, t1: v.t1 }, rw: r.width, rh: r.height };
    }, [ANIM]);
    await page.mouse.move(at.x, at.y); await page.mouse.down();
    await page.mouse.move(at.x2, at.y2, { steps: 6 }); await page.mouse.up();
    const dragged = await tl(() => window.modelcraft.timeline.anim.props[1].keys[1].v[0]);
    ok(dragged > 900 && dragged < 1100, 'a key dragged down on the canvas: 1600 → about 1000', String(dragged));
    await page.screenshot({ path: path.join(OUT, 'an1-curves.png') });
    await page.click('[data-tl-undo]');
    ok(await tl(() => window.modelcraft.timeline.anim.props[1].keys[1].v[0]) === 1600, 'the timeline\'s Undo takes it back');
    // choose the brightness keys (a box over the whole canvas) and make it ping-pong
    const r = await page.locator('[data-an-canvas]').boundingBox();
    await page.mouse.move(r.x + 2, r.y + 2); await page.mouse.down(); await page.mouse.move(r.x + r.width - 2, r.y + r.height - 2, { steps: 4 }); await page.mouse.up();
    await page.selectOption('[data-an-after]', 'pingpong');
    const cyc = await tl(() => window.modelcraft.timeline.anim.props[1].cycle);
    ok(cyc && cyc.after === 'pingpong', 'a box chooses the keys; After › Back and forth sets the cycle', JSON.stringify(cyc));
    await page.selectOption('[data-an-after]', 'hold');

    // Keys: Shift-click both place keys, copy, paste at 1 s
    await page.click('[data-tl-mode="keys"]');
    await page.click('[data-tl-row="p0"] [data-tl-key][data-t="0"]');
    await page.click('[data-tl-row="p0"] [data-tl-key][data-t="2"]', { modifiers: ['Shift'] });
    const picked = await tl(() => window.modelcraft.timeline.picked.length);
    ok(picked === 2, 'Shift-click adds a second key to the choice', String(picked));
    await page.focus('[data-tl-row="p0"] [data-tl-key][data-t="2"]');
    await page.keyboard.press('Control+c');
    await scrubTo(page, 0.5);
    await page.focus('[data-tl-row="p0"] [data-tl-key][data-t="0"]');
    await page.keyboard.press('Control+v');
    const pasted = await tl(() => window.modelcraft.timeline.anim.props[0].keys.map((k) => k.t));
    ok(JSON.stringify(pasted) === '[0,0.5,2,2.5]', 'Ctrl+C, Ctrl+V at 0.5 s: the two keys again from there', JSON.stringify(pasted));
    await page.click('[data-tl-undo]');

    // Clips: make a clip, the same motion; a second clip at half
    const before = await tl((id) => { window.modelcraft.timeline.setTime(1.5); return window.modelcraft.model.root.insts.get(id).m.slice(); }, box);
    await page.click('[data-tl-mode="clips"]');
    await page.click('[data-an-stash]');
    await page.waitForSelector('[data-an-clip]');
    const after = await tl((id) => { window.modelcraft.timeline.setTime(1.5); return window.modelcraft.model.root.insts.get(id).m.slice(); }, box);
    const st = await tl(() => ({ clips: window.modelcraft.timeline.anim.clips.length, props: (window.modelcraft.timeline.anim.props || []).length }));
    ok(st.clips === 1 && st.props === 0 && after.every((x, i) => near(x, before[i], 1e-9)), 'Make a clip: the tracks become one clip that moves the box the same', JSON.stringify(st));
    await tl(() => window.modelcraft.timeline.setTime(0));
    await page.click('[data-an-clip-add]');
    await page.waitForSelector('[data-an-clip-field="influence"]');
    await page.screenshot({ path: path.join(OUT, 'an1-clips.png') });
    ok(await tl(() => window.modelcraft.timeline.anim.clips.length) === 2, 'Add clip: a second clip of the action at the playhead');

    // saved in the file
    const [dl] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Control+s')]);
    const saved = path.join(REPO, 'tmp/anim-test-animate.modelcraft');
    await dl.saveAs(saved);
    const json = JSON.parse(fs.readFileSync(saved, 'utf8'));
    ok(json.anim && json.anim.actions?.length === 1 && json.anim.clips?.length === 2 && json.anim.rests?.length === 1, 'the clips, the action and the box\'s rest are saved in the .modelcraft file');
    fs.rmSync(saved, { force: true });

    // closing puts the box and the lamp back as at the start
    await scrubTo(page, 2);
    await page.click('[data-tl-close]');
    const back = await tl(([id, l]) => ({ x: window.modelcraft.model.root.insts.get(id).m[12], lm: window.modelcraft.model.lights.get(l).lumens }), [box, lamp]);
    ok(near(back.x, 0, 1e-9) && back.lm === 400, 'closing the timeline: the box and the lamp as at 0 s', JSON.stringify(back));
  }

  if (want('an4')) {
    console.log('\nAN.4 — shape keys and drivers');
    // a cube mesh, chosen, in the Animate workspace
    const cube = await tl(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports, find = (re) => import(new URL(Object.entries(map).find(([k]) => re.test(k))[1], location.href).href);
      const PR = await find(/\/modelcraft\/dev\/mesh\/primitives\.js/);
      const m = window.modelcraft.model;
      const r = m.change('cube', (mm) => { const d = mm.newMeshDef(PR.makePrimitive('cube', { size: 2 }), 'Face'); return { def: d.id, iid: mm.place(mm.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 1, 1]) }; });
      window.modelcraft.host.path = []; window.modelcraft.host.setSel([{ t: 'i', id: r.iid }]); window.modelcraft.host.changed();
      return r;
    });
    await page.selectOption('#mc-workspace', 'model');
    await page.selectOption('#mc-workspace', 'animate');
    await tl((iid) => { window.modelcraft.host.setSel([{ t: 'i', id: iid }]); window.modelcraft.host.changed(); }, cube.iid);
    await page.waitForSelector('[data-an-shape-add]');
    ok(await tl(() => !!document.querySelector('[data-an-shapes] .mc-an-note')), 'the chosen mesh has a Shape keys section (none yet)');
    await page.click('[data-an-shape-add]');
    await page.waitForTimeout(400);
    const ws = await tl(() => document.querySelector('#mc-workspace').value);
    const ed = await tl((def) => window.modelcraft.model.defs.get(def).mesh.hasAttr('shape.basis'), cube.def);
    ok(ws === 'mesh' && ed, 'Add shape key: a key, being edited, in the Mesh workspace', ws);
    // raise the top in the mesh (as the Mesh workspace's move would), then back to Animate › Done
    await tl((def) => { const m = window.modelcraft.model; m.meshEdit(def, 'raise', (me) => { for (let v = 0; v < me.nv; v++) if (me.P[v * 3 + 2] > 0.5) me.setPos(v, me.P[v * 3], me.P[v * 3 + 1], me.P[v * 3 + 2] + 1); }); window.modelcraft.host.changed(); }, cube.def);
    await page.selectOption('#mc-workspace', 'animate');
    await tl((iid) => { window.modelcraft.host.setSel([{ t: 'i', id: iid }]); window.modelcraft.host.changed(); }, cube.iid);
    await page.waitForSelector('[data-an-shape-done]');
    await page.click('[data-an-shape-done]');
    await page.waitForSelector('[data-an-shape-slider="k1"]');
    const topNow = (def) => tl((d) => { const S = window.modelcraft.model.defs.get(d).shown; let z = -Infinity; for (let v = 0; v < S.nv; v++) if (!S.vertDead(v)) z = Math.max(z, S.P[v * 3 + 2]); return z; }, def);
    ok(Math.abs(await topNow(cube.def) - 2) < 1e-6, 'Done: the cube is back as it was (its top at 2: the cube spans 0 to 2)');
    await typeIn(page, '[data-an-shape-value="k1"]', '0.5');
    ok(Math.abs(await topNow(cube.def) - 2.5) < 1e-6, 'the slider at 0.5: the view shows the top half way up (the deformed mesh)', String(await topNow(cube.def)));
    // key the slider at 0 and 2 s, then the view at 1 s follows
    await scrubTo(page, 0);
    await typeIn(page, '[data-an-shape-value="k1"]', '0');
    await page.click('[data-an-shape-key="k1"]');
    await scrubTo(page, 2);
    await typeIn(page, '[data-an-shape-value="k1"]', '1');
    await scrubTo(page, 1);
    await page.waitForTimeout(200);
    const at1 = await topNow(cube.def);
    const want1 = await tl(async ([src, def]) => { const A = await eval(src); return A.shapeWeights(A.propsAt(window.modelcraft.timeline.anim, 1), def).get('k1'); }, [ANIM, cube.def]);
    ok(Math.abs(at1 - (2 + want1)) < 1e-6 && want1 > 0.2 && want1 < 0.8, 'keyed at 0 and 2 s: at 1 s the top is where the track says', JSON.stringify({ at1, want1 }));
    const row = await tl(() => [...document.querySelectorAll('[data-tl-row].is-prop .mc-tl-name')].map((n) => n.textContent.trim()).find((s) => /Face/.test(s)));
    ok(/Face · Key 1/.test(row || ''), 'the timeline row is named for the mesh and its key', row);
    // a driver instead: time / 2
    await page.click('[data-an-shape-driver="k1"]');
    await page.waitForSelector('[data-an-drv-expr="k1"]');
    await typeIn(page, '[data-an-drv-expr="k1"]', 'clamp(v / 4, 0, 1)');
    await scrubTo(page, 1);
    await page.waitForTimeout(250);
    ok(Math.abs(await topNow(cube.def) - 2.25) < 1e-6, 'a driver v / 4 with v = time: at 1 s the key is at 0.25 (the driver wins over the track)', String(await topNow(cube.def)));
    await typeIn(page, '[data-an-drv-expr="k1"]', 'clamp(v / 4');
    const msg = await tl(() => document.querySelector('[data-an-drv-msg="k1"]').textContent);
    ok(/bracket|match/i.test(msg), 'a broken expression says what is wrong and changes nothing', msg);
    await page.screenshot({ path: path.join(OUT, 'an4-shapes.png') });
    await page.click('[data-an-drv-remove="k1"]');
    await scrubTo(page, 1);
    await page.waitForTimeout(250);
    ok(Math.abs(await topNow(cube.def) - (2 + want1)) < 1e-6, 'Remove the driver: the track again');
  }

  if (want('an2')) {
    console.log('\nAN.2 — armatures and skinning');
    const arm = await tl(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports, find = (re) => import(new URL(Object.entries(map).find(([k]) => re.test(k))[1], location.href).href);
      const MM = await find(/\/modelcraft\/dev\/mesh\.js/);
      const tube = new MM.Mesh(), ring = 12, rows = 17;
      for (let r = 0; r < rows; r++) for (let k = 0; k < ring; k++) { const a = (k / ring) * Math.PI * 2; tube.addVertex(-3 + 0.3 * Math.cos(a), 0.3 * Math.sin(a), r * 0.25); }
      for (let r = 0; r < rows - 1; r++) for (let k = 0; k < ring; k++) tube.addFace([r * ring + k, r * ring + (k + 1) % ring, (r + 1) * ring + (k + 1) % ring, (r + 1) * ring + k]);
      const m = window.modelcraft.model;
      const out = m.change('arm', (mm) => { const d = mm.newMeshDef(tube, 'Arm'); return { def: d.id, iid: mm.place(mm.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) }; });
      window.modelcraft.host.changed();
      return out;
    });
    await page.selectOption('#mc-workspace', 'model');
    await page.selectOption('#mc-workspace', 'animate');
    const choose = () => tl((iid) => { window.modelcraft.host.path = []; window.modelcraft.host.setSel([{ t: 'i', id: iid }]); window.modelcraft.host.changed(); }, arm.iid);
    await choose();
    await page.waitForSelector('[data-an-rig-add]');
    await page.click('[data-an-rig-add]');
    await page.waitForSelector('[data-an-bone-child]');
    await page.click('[data-an-bone-child]');
    await page.waitForTimeout(400);
    const rig = await tl(() => window.modelcraft.timeline.anim.rigs?.[0]);
    ok(rig && rig.bones.length === 2 && rig.bones[1].parent === rig.bones[0].id && Math.abs(rig.bones[1].head[2] - rig.bones[0].tail[2]) < 1e-9, 'Add an armature, then Add a child bone: two bones, the second from the first one\'s tip', JSON.stringify(rig?.bones.map((b) => [b.id, b.parent, b.head[2], b.tail[2]])));
    await page.click('[data-an-auto-heat]');
    await page.waitForTimeout(400);
    const held = await tl(([def, ids]) => ids.map((id) => window.modelcraft.model.defs.get(def).mesh.hasAttr('weight.' + id)), [arm.def, rig.bones.map((b) => b.id)]);
    ok(held.every(Boolean), 'Automatic weights: a weight layer for each bone');
    // a typed pose: the child bone turned 60° about its X
    const topZ = () => tl((d) => { const S = window.modelcraft.model.defs.get(d).shown; let z = -Infinity; for (let v = 0; v < S.nv; v++) z = Math.max(z, S.P[v * 3 + 2]); return z; }, arm.def);
    const z0 = await topZ();
    await typeIn(page, '[data-an-pose-in="rotation.0"]', '60');
    const z1 = await topZ();
    ok(z0 > 3.9 && z1 < z0 - 0.3, 'a pose typed for the chosen bone: the tube bends in the view', `${z0.toFixed(3)} → ${z1.toFixed(3)}`);
    // the pose tool: drag the first bone round its head
    await page.click('[data-an-pose-tool]');
    await page.waitForTimeout(300);
    const scr = await tl(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports, find = (re) => import(new URL(Object.entries(map).find(([k]) => re.test(k))[1], location.href).href);
      const RV = await find(/\/modelcraft\/dev\/anim\/rig-view\.js/);
      const mc = window.modelcraft, list = RV.bonesOnScreen(mc.model, mc.timeline, (p) => mc.cam.project(p));
      const r = document.querySelector('[data-gl]').getBoundingClientRect();
      return { list: list.map((s) => ({ bone: s.bone, a: [r.left + s.a[0], r.top + s.a[1]], b: [r.left + s.b[0], r.top + s.b[1]] })) };
    });
    const first = scr.list.find((s) => s.bone === rig.bones[0].id);
    ok(scr.list.length === 2 && first, 'two bones drawn over the view', JSON.stringify(scr.list.map((s) => s.bone)));
    const before = await tl(() => JSON.stringify(window.modelcraft.timeline.anim.rigs[0].pose));
    const mid = [(first.a[0] + first.b[0]) / 2, (first.a[1] + first.b[1]) / 2];
    await page.mouse.move(mid[0], mid[1]); await page.mouse.down();
    await page.mouse.move(mid[0] + 60, mid[1] + 10, { steps: 6 }); await page.mouse.up();
    await page.waitForTimeout(300);
    const after = await tl(() => window.modelcraft.timeline.anim.rigs[0].pose);
    const r0 = after[rig.bones[0].id]?.rotation || [0, 0, 0];
    ok(JSON.stringify(after) !== before && Math.hypot(...r0) > 5, 'the pose tool: dragging a bone turns it (one step)', JSON.stringify(r0));
    await page.screenshot({ path: path.join(OUT, 'an2-pose.png') });
    await page.click('[data-tl-undo]');
    ok(await tl(() => JSON.stringify(window.modelcraft.timeline.anim.rigs[0].pose)) === before, 'the timeline\'s Undo takes the drag back');
    // the weight brush
    await choose();
    await page.waitForSelector('[data-an-paint]');
    await page.click('[data-an-paint]');
    await page.waitForTimeout(400);
    const paintInfo = await tl((d) => { const S = window.modelcraft.model.defs.get(d).shown; const ps = new Set(); for (let f = 0; f < S.nf; f++) ps.add(S.facePaint(f)); return { tool: window.modelcraft.host.tools?.name, paints: [...ps].filter(Boolean).length, rest: S.P[(16 * 12) * 3 + 2] }; }, arm.def);
    ok(paintInfo.paints >= 2 && Math.abs(paintInfo.rest - 4) < 1e-6, 'Paint weights: the mesh at rest, its faces coloured by the bone\'s weight', JSON.stringify(paintInfo));
    const activeBone = await tl(async () => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports; const RV = await import(new URL(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/anim\/rig-view\.js/.test(k))[1], location.href).href); return RV.RIG.bone; });
    const lowBefore = await tl(([d, b]) => { const A = window.modelcraft.model.defs.get(d).mesh.attrArray('weight.' + b); let s = 0; for (let v = 0; v < 12 * 17; v++) s += A[v]; return s; }, [arm.def, activeBone]);
    const tubeMid = await tl(() => { const mc = window.modelcraft, r = document.querySelector('[data-gl]').getBoundingClientRect(), p = mc.cam.project([-3 + 0.3, 0, 0.5]); return p ? [r.left + p[0], r.top + p[1]] : null; });
    await page.mouse.move(tubeMid[0], tubeMid[1]); await page.mouse.down();
    await page.mouse.move(tubeMid[0], tubeMid[1] - 30, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(300);
    const lowAfter = await tl(([d, b]) => { const A = window.modelcraft.model.defs.get(d).mesh.attrArray('weight.' + b); let s = 0; for (let v = 0; v < 12 * 17; v++) s += A[v]; return s; }, [arm.def, activeBone]);
    ok(lowAfter > lowBefore + 0.1, 'a brush stroke on the tube gives the chosen bone more hold there (' + activeBone + ')', `${lowBefore.toFixed(2)} → ${lowAfter.toFixed(2)}`);
    await page.screenshot({ path: path.join(OUT, 'an2-paint.png') });
    await page.click('[data-an-paint]');
    await page.waitForTimeout(300);
    ok(await tl((d) => { const S = window.modelcraft.model.defs.get(d).shown; return S === window.modelcraft.model.defs.get(d).mesh || S.facePaint(0) === null; }, arm.def), 'Stop painting: the colours go, the skin is back');
    // key the pose at 0 and 2 s
    await choose();
    await scrubTo(page, 0);
    await page.waitForSelector('[data-an-pose-in="rotation.0"]');
    await typeIn(page, '[data-an-pose-in="rotation.0"]', '0');
    await page.click('[data-an-pose-key="rotation"]');
    await scrubTo(page, 2);
    await typeIn(page, '[data-an-pose-in="rotation.0"]', '80');
    await scrubTo(page, 1);
    await page.waitForTimeout(300);
    const half = await tl(async ([src]) => { const A = await eval(src); const a = window.modelcraft.timeline.anim; const tr = a.props.find((p) => p.target.startsWith('bone:')); return tr ? A.valueAt(tr, 1)[0] : null; }, [ANIM]);
    ok(half > 10 && half < 70, 'keyed at 0 and 2 s: the bone turns between them', String(half));
  }

  if (want('an3')) {
    console.log('\nAN.3 — IK and constraints');
    const mods = `(async () => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports, find = (re) => import(new URL(Object.entries(map).find(([k]) => re.test(k))[1], location.href).href);
      return { MM: await find(/\\/modelcraft\\/dev\\/mesh\\.js/), M: await find(/\\/modelcraft\\/dev\\/model\\.js/), A: await find(/\\/modelcraft\\/dev\\/render\\/anim\\.js/), W: await find(/\\/modelcraft\\/dev\\/anim\\/weights\\.js/),
        CV: await find(/\\/modelcraft\\/dev\\/mesh\\/curve\\.js/), D: await find(/\\/modelcraft\\/dev\\/anim\\/deform\\.js/), CM: await find(/\\/modelcraft\\/dev\\/anim\\/cns-model\\.js/), RV: await find(/\\/modelcraft\\/dev\\/anim\\/rig-view\\.js/) }; })()`;
    // a rigged tube (made through the page's own modules), its lower bone chosen
    const leg = await tl(async (src) => {
      const { MM, A, W } = await eval(src);
      const tube = new MM.Mesh(), ring = 8, rows = 17;
      for (let r = 0; r < rows; r++) for (let k = 0; k < ring; k++) { const a = (k / ring) * Math.PI * 2; tube.addVertex(3 + 0.25 * Math.cos(a), 3 + 0.25 * Math.sin(a), r * 0.25); }
      for (let r = 0; r < rows - 1; r++) for (let k = 0; k < ring; k++) tube.addFace([r * ring + k, r * ring + (k + 1) % ring, (r + 1) * ring + (k + 1) % ring, (r + 1) * ring + k]);
      const mc = window.modelcraft, m = mc.model;
      const o = m.change('leg', (mm) => { const d = mm.newMeshDef(tube, 'Leg'); return { def: d.id, iid: mm.place(mm.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) }; });
      let an = A.addRig(mc.timeline.anim, o.def, 'Leg rig');
      const rid = A.rigsOf(an, o.def)[0].id;
      an = A.setBone(an, rid, { id: 'thigh', head: [3, 3, 0], tail: [3, 3, 2] });
      an = A.setBone(an, rid, { id: 'shin', parent: 'thigh', head: [3, 3, 2], tail: [3, 3, 4] });
      const rig = A.rigsOf(an, o.def)[0];
      m.meshEdit(o.def, 'w', (me) => W.writeWeights(me, rig, W.autoWeights(me, rig)));
      mc.timeline.commit(an);
      return { ...o, rid };
    }, mods);
    await page.selectOption('#mc-workspace', 'model');
    await page.selectOption('#mc-workspace', 'animate');
    const choose = (iid) => tl((i) => { window.modelcraft.host.path = []; window.modelcraft.host.setSel([{ t: 'i', id: i }]); window.modelcraft.host.changed(); }, iid);
    await choose(leg.iid);
    await page.waitForSelector('[data-an-bone="shin"]');
    await page.click('[data-an-bone="shin"]');
    const bo = `bone:${leg.rid}/shin`;
    await page.waitForSelector(`[data-an-cns-type="${bo}"]`);
    await page.selectOption(`[data-an-cns-type="${bo}"]`, 'ik');
    await page.click(`[data-an-cns-add="${bo}"]`);
    await page.waitForSelector('[data-an-cns-point$=".0"]');
    const cid = await tl(() => window.modelcraft.timeline.anim.constraints.at(-1).id);
    await typeIn(page, `[data-an-cns-point="${cid}.0"]`, '4.5');
    await typeIn(page, `[data-an-cns-point="${cid}.2"]`, '2.5');
    const reach = await tl(async ([src, def, rid]) => {
      const { A, D, CM } = await eval(src);
      const mc = window.modelcraft, an = mc.timeline.anim, rig = A.rigsOf(an, def)[0];
      const w = D.rigWorld(rig, an, mc.timeline.values, CM.rigCtx(mc.model, an, rig, mc.timeline.values)).world.get('shin');
      const tip = [w[4] * 2 + w[12], w[5] * 2 + w[13], w[6] * 2 + w[14]];
      const S = mc.model.defs.get(def).shown; let topz = -Infinity; for (let v = 0; v < S.nv; v++) topz = Math.max(topz, S.P[v * 3 + 2]);
      return { tip, topz };
    }, [mods, leg.def, leg.rid]);
    ok(Math.hypot(reach.tip[0] - 4.5, reach.tip[1] - 3, reach.tip[2] - 2.5) < 1e-3 && reach.topz < 3.9, 'Reach (IK) on the shin, its point at (4.5, 3, 2.5): the shin\'s tip is there and the mesh bends to it', JSON.stringify(reach));
    await page.screenshot({ path: path.join(OUT, 'an3-ik.png') });
    // a constraint's influence, keyed: 0 at 0 s, 1 at 2 s
    await scrubTo(page, 0);
    await page.waitForTimeout(250);
    await page.click(`[data-an-cns-key="${cid}"]`);
    await tl(([id]) => { const tl2 = window.modelcraft.timeline; tl2.keyProp('cns:' + id, 'influence', [0], ''); }, [cid]);
    await scrubTo(page, 2);
    await tl(([id]) => { window.modelcraft.timeline.keyProp('cns:' + id, 'influence', [1], ''); }, [cid]);
    await scrubTo(page, 1);
    await page.waitForTimeout(250);
    const mid = await tl(([id]) => window.modelcraft.timeline.values.get('cns:' + id + '|influence')[0], [cid]);
    ok(mid > 0.2 && mid < 0.8, 'the IK\'s How much keyed from 0 to 1: half way at 1 s', String(mid));
    // look at: an eye turning to a moving ball
    const two = await tl(async (src) => {
      const { M } = await eval(src);
      const m = window.modelcraft.model;
      return m.change('eye ball', (mm) => {
        M.addPolygon(mm.root, M.rectPts([-9, -5, 0.01], [1, 0, 0], [0, 1, 0], 0.5, 0.5));   // off the first section's floor
        const f = [...mm.root.faces.keys()].pop(); M.pushPull(mm.root, f, 0.5);
        const eye = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group', 'Eye');
        M.addPolygon(mm.root, M.rectPts([-9, 5, 0.01], [1, 0, 0], [0, 1, 0], 0.5, 0.5));
        const f2 = [...mm.root.faces.keys()].pop(); M.pushPull(mm.root, f2, 0.5);
        const ball = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f2 }]), 'group', 'Ball');
        return { eye, ball };
      });
    }, mods);
    await choose(two.eye);
    const eo = 'obj:' + two.eye;
    await page.waitForSelector(`[data-an-cns-type="${eo}"]`);
    await page.selectOption(`[data-an-cns-type="${eo}"]`, 'lookat');
    await page.click(`[data-an-cns-add="${eo}"]`);
    const lid = await tl(() => window.modelcraft.timeline.anim.constraints.at(-1).id);
    await page.waitForSelector(`[data-an-cns-target="${lid}"]`);
    await page.selectOption(`[data-an-cns-target="${lid}"]`, 'obj:' + two.ball);
    await page.waitForTimeout(300);
    const aimY = () => tl(([e, b]) => { const m = window.modelcraft.model, E = m.root.insts.get(e).m, B = m.root.insts.get(b).m; const y = [E[4], E[5], E[6]], l = Math.hypot(...y), d = [B[12] - E[12], B[13] - E[13], B[14] - E[14]], dl = Math.hypot(...d); return (y[0] * d[0] + y[1] * d[1] + y[2] * d[2]) / l / dl; }, [two.eye, two.ball]);
    ok(await aimY() > 0.999, 'Look at the Ball: the Eye\'s +Y points at it', String(await aimY()));
    // follow path on a real curve object
    const pathObj = await tl(async (src) => {
      const { CV } = await eval(src);
      const m = window.modelcraft.model;
      const c = CV.cleanCurve({ dim: '3d', fill: false, extrude: 0, bevel: { depth: 0, resolution: 1 }, caps: false, taper: [1], splines: [{ type: 'poly', cyclic: false, resolution: 1, points: [{ p: [0, -4, 0] }, { p: [4, -4, 0] }, { p: [4, 0, 0] }] }] });
      return m.change('path', (mm) => { const d = mm.newMeshDef(CV.curveMesh(c), 'Track'); d.curve = c; return mm.place(mm.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); });
    }, mods);
    await choose(two.ball);
    const ob = 'obj:' + two.ball;
    await page.waitForSelector(`[data-an-cns-type="${ob}"]`);
    await page.selectOption(`[data-an-cns-type="${ob}"]`, 'path');
    await page.click(`[data-an-cns-add="${ob}"]`);
    const pid = await tl(() => window.modelcraft.timeline.anim.constraints.at(-1).id);
    await page.waitForSelector(`[data-an-cns-target="${pid}"]`);
    await page.selectOption(`[data-an-cns-target="${pid}"]`, 'obj:' + pathObj);
    await page.waitForTimeout(250);
    await tl(([id]) => { const s2 = document.querySelector(`[data-an-cns-offset="${id}"]`); s2.value = '0.75'; s2.dispatchEvent(new Event('change', { bubbles: true })); }, [pid]);
    await page.waitForTimeout(400);
    const ballAt = await tl((b) => window.modelcraft.model.root.insts.get(b).m.slice(12, 15), two.ball);
    ok(Math.abs(ballAt[0] - 4) < 1e-6 && Math.abs(ballAt[1] + 2) < 1e-6, 'Follow path at 0.75 of an L-shaped curve object: the Ball on its second leg', JSON.stringify(ballAt));
    ok(await aimY() > 0.999, 'and the Eye still looks at it (constraints on one thing follow another)', String(await aimY()));
    await page.screenshot({ path: path.join(OUT, 'an3-path.png') });
  }

  if (want('an5')) {
    console.log('\nAN.5 — rigid bodies baked to keys');
    const crate = await tl(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const M = await import(new URL(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1], location.href).href);
      const m = window.modelcraft.model;
      return m.change('crate', (mm) => {
        M.addPolygon(mm.root, M.rectPts([8, 0, 3], [1, 0, 0], [0, 1, 0], 1, 1));
        const f = [...mm.root.faces.keys()].pop();
        M.pushPull(mm.root, f, -1);
        return mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group', 'Crate');
      });
    });
    await page.selectOption('#mc-workspace', 'model');
    await page.selectOption('#mc-workspace', 'animate');
    await tl((i) => { window.modelcraft.host.path = []; window.modelcraft.host.setSel([{ t: 'i', id: i }]); window.modelcraft.host.changed(); }, crate);
    await page.waitForSelector('[data-an-phys-kind]');
    ok(await tl(() => !!document.querySelector('[data-workspace-group="animate"][aria-label] [data-cmd="animate-bake"]')), 'a Physics group with Bake physics on the toolbar');
    await page.selectOption('[data-an-phys-kind]', 'active');
    await page.waitForSelector('[data-an-phys-mass]');
    await typeIn(page, '[data-an-phys-to]', '2');
    await page.click('[data-an-phys-bake]');
    await page.waitForTimeout(500);
    const baked = await tl((i) => { const a = window.modelcraft.timeline.anim; return { bodies: a.physics?.bodies.length, tracks: (a.props || []).filter((p) => p.target === 'obj:' + i).map((p) => p.keys.length) }; }, crate);
    ok(baked.bodies === 1 && baked.tracks.length === 3 && baked.tracks.every((n) => n === 61), 'Falls and collides, then Bake: place, turn and size keyed on every frame (61)', JSON.stringify(baked));
    await scrubTo(page, 2);
    await page.waitForTimeout(300);
    const z2 = await tl((i) => { const m = window.modelcraft.model, W = m.root.insts.get(i).m, d = m.defs.get(m.root.insts.get(i).def); const bb = m.bbox(d, W); return [bb.min[2], bb.max[2]]; }, crate);
    ok(Math.abs(z2[0]) < 0.02 && Math.abs(z2[1] - 1) < 0.02, 'at 2 s the crate lies on the ground', JSON.stringify(z2));
    await page.screenshot({ path: path.join(OUT, 'an5-baked.png') });
    await page.click('[data-tl-undo]');
    ok(await tl((i) => !(window.modelcraft.timeline.anim.props || []).some((p) => p.target === 'obj:' + i), crate), 'the timeline\'s Undo takes the bake back');
  }

  ok(!errors.length, 'no console errors', errors.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL  ' + (e && e.stack || e));
  await page.screenshot({ path: path.join(OUT, 'failed.png') }).catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
