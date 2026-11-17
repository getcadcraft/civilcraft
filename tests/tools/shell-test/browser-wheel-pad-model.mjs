#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wheel-pad-model.mjs — 0.8 D7.56 in a real page, the 2D views beside the main canvases (companion to browser-wheel-pad.mjs):
 *   uv          ModelCraft's UV editor                  (modelcraft/dev/mesh/uv-editor.js)
 *   curves      ModelCraft's animation curve editor     (modelcraft/dev/anim/curves-ui.js)
 *   shading     the node material editor, in ModelCraft (modelcraft/dev/shading/editor.js)
 *   nodes-mc    the Nodes window in ModelCraft          (assets/js/app-nodes.js, rule handed over by modelcraft/dev/nodes-mc.js)
 *   nodes-plain the same panel mounted WITHOUT a rule, as the released builds mount it: the wheel only ever zooms (as before D7.56)
 *   nodes-pc    the Nodes window in PartCraft           (rule = PartCraft's own view.isPad, 400 ms latch; partcraft/dev/nodes-pc.js)
 *   node tools/shell-test/browser-wheel-pad-model.mjs [--only uv,curves,shading,nodes-mc,nodes-plain,nodes-pc]
 *
 * One page at a time, in /lab/<app>, headless Chromium (cached Playwright, host rule getcadcraft.com -> 127.0.0.1), a session minted with
 * tools/shell-test/admin.php session. Each view's own pan/zoom state is read through page.evaluate (the world point under a screen point
 * + the scale on each axis), then wheel events are sent: real page.mouse.wheel and synthetic WheelEvents on the view's element.
 * Checks per view: (1) a swipe with a sideways part, fractional deltas -> pans by exactly the swiped pixels, scale unchanged, and what is
 * drawn moved (a node's box on screen / the canvas's pixels); (2) vertical-only small fractional deltas -> pans; (3) ctrlKey pinch ->
 * zooms about the pointer (the curve editor: Ctrl = values only); (4) a wheel step (100 real / 120 synthetic / lines) -> zooms about the
 * pointer; plus: default prevented, the page did not scroll, no console errors.
 * It cannot show what only a real trackpad shows (inertia, the OS's smoothing, Windows precision touchpad vs Mac).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

// ---- per view (functions are serialised into the page, self-contained):
//   target()      the element that takes wheel events
//   read(cx, cy)  { zx, zy, w: [x, y] } — screen px per world unit on each axis, and the world point under the client point
//   yUp           the world's y grows upward on screen
//   mark()        (optional) a client point of something drawn in the DOM: it must move with a pan
//   pixels()      (optional) a string that changes when the canvas is drawn again differently
// a CSS "translate(Xpx, Ypx) scale(K)" world inside a viewport: the view is exactly that transform
const cssWorld = (vpSel, worldSel, nodeSel) => ({
  yUp: false,
  target: new Function(`return document.querySelector(${JSON.stringify(vpSel)});`),
  read: new Function('cx', 'cy', `const vp = document.querySelector(${JSON.stringify(vpSel)}), w = document.querySelector(${JSON.stringify(worldSel)});
    const m = /translate\\((-?[\\d.e+-]+)px,\\s*(-?[\\d.e+-]+)px\\)\\s*scale\\((-?[\\d.e+-]+)\\)/.exec(w.style.transform), x = +m[1], y = +m[2], k = +m[3], r = vp.getBoundingClientRect();
    return { zx: k, zy: k, w: [(cx - r.left - x) / k, (cy - r.top - y) / k] };`),
  mark: new Function(`const r = document.querySelector(${JSON.stringify(nodeSel)}).getBoundingClientRect(); return [r.left, r.top];`),
});
const V = {
  uv: { yUp: true, target: () => document.querySelector('[data-uv-editor] canvas'),
    read: (cx, cy) => { const c = document.querySelector('[data-uv-editor] canvas'), v = c.uvView, r = c.getBoundingClientRect(); return { zx: v.z, zy: v.z, w: [(cx - r.left - v.ox) / v.z, (v.oy - (cy - r.top)) / v.z] }; },
    pixels: () => document.querySelector('[data-uv-editor] canvas').toDataURL() },
  curves: { yUp: true, target: () => document.querySelector('[data-an-canvas]'),
    read: (cx, cy) => {   // anim/graph.js fromPx
      const v = window.modelcraft.timeline.curves.view, r = document.querySelector('[data-an-canvas]').getBoundingClientRect(), p = v.pad ?? 12, x = cx - r.left, y = cy - r.top;
      return { zx: (v.w - 2 * p) / (v.t1 - v.t0), zy: (v.h - 2 * p) / (v.v1 - v.v0), w: [v.t0 + ((x - p) / (v.w - 2 * p)) * (v.t1 - v.t0), v.v0 + ((v.h - p - y) / (v.h - 2 * p)) * (v.v1 - v.v0)] };
    },
    pixels: () => document.querySelector('[data-an-canvas]').toDataURL() },
  shading: cssWorld('[data-shading-editor] [data-ne-view]', '[data-shading-editor] .cc-ne-world', '[data-shading-editor] .cc-ne-node'),
  'nodes-mc': cssWorld('[data-nodes-window] .nd-view', '[data-nodes-window] .nd-world', '[data-nodes-window] [data-nd-out]'),
  'nodes-pc': cssWorld('[data-nodes-window] .nd-view', '[data-nodes-window] .nd-world', '[data-nodes-window] [data-nd-out]'),
  'nodes-plain': cssWorld('[data-wheel-plain] .nd-view', '[data-wheel-plain] .nd-world', '[data-wheel-plain] [data-nd-out]'),
};

const near = (a, b, tol) => Math.abs(a - b) <= tol;
/** The tools for one view: the pointer (off centre, on the view itself, not on a field), reads, events. */
async function kit(page, name) {
  const v = V[name];
  const rect = await page.evaluate(`(() => { const r = (${v.target})().getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  ok(rect.w > 200 && rect.h > 100, `${name}: the view has a size (${Math.round(rect.w)} x ${Math.round(rect.h)})`);
  // the pointer: the first of a few off-centre points where the view itself is on top and no field or button is under it
  const P = await page.evaluate(`(() => { const t = (${v.target})(), r = t.getBoundingClientRect();
    for (const [fx, fy] of [[0.6, 0.55], [0.62, 0.8], [0.3, 0.8], [0.8, 0.3], [0.85, 0.85], [0.15, 0.15], [0.5, 0.92]]) {
      const x = Math.round(r.x + r.width * fx), y = Math.round(r.y + r.height * fy), e = document.elementFromPoint(x, y);
      if (e && t.contains(e) && !e.closest('input, select, textarea, button')) return { x, y, on: e === t ? 'the view' : (e.className && String(e.className.baseVal ?? e.className)) || e.tagName };
    }
    return null; })()`);
  ok(!!P, `${name}: a free point of the view is under the pointer${P ? ` (${P.x}, ${P.y}, on ${P.on})` : ''}`);
  if (!P) throw new Error('no free point on the view');
  const read = () => page.evaluate(`(${v.read})(${P.x}, ${P.y})`);
  const mark = () => (v.mark ? page.evaluate(`(${v.mark})()`) : null);
  const pixels = async () => { if (!v.pixels) return null; await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); return page.evaluate(`(${v.pixels})()`); };
  const synth = (init) => page.evaluate(`(() => { const t = (${v.target})(); const init = ${JSON.stringify(init)}; const e = new WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true, clientX: ${P.x}, clientY: ${P.y}, deltaMode: 0 }, init)); if ('chromeLike' in init) Object.defineProperty(e, 'wheelDeltaY', { value: -3 * init.deltaY }); return { prevented: !t.dispatchEvent(e) }; })()`);
  const real = (dx, dy, key) => async () => { await page.mouse.move(P.x, P.y); if (key) await page.keyboard.down(key); await page.mouse.wheel(dx, dy); if (key) await page.keyboard.up(key); await page.waitForTimeout(60); };
  const scrolled = () => page.evaluate(() => [window.scrollX, window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop]);
  const settle = () => page.waitForTimeout(500);   // past PartCraft's 400 ms swipe latch, so the next gesture starts clean

  // a pan: the scale unchanged, the content moved by -(dx, dy) screen px (a page scrolling under the fingers), and what is drawn moved too
  const panCheck = async (label, run, dx, dy) => {
    const a = await read(), ma = await mark(), pa = await pixels(); await run(); const b = await read(), mb = await mark(), pb = await pixels();
    const sx = (b.w[0] - a.w[0]) * a.zx, sy = (b.w[1] - a.w[1]) * a.zy * (v.yUp ? -1 : 1);   // = the delta the view followed
    ok(near(b.zx / a.zx, 1, 1e-9) && near(b.zy / a.zy, 1, 1e-9), `${name}: ${label} - zoom unchanged (${a.zx} -> ${b.zx})`);
    ok(near(sx, dx, 0.01) && near(sy, dy, 0.01), `${name}: ${label} - pans by exactly the swipe (${sx.toFixed(3)}, ${sy.toFixed(3)} px for delta ${dx}, ${dy})`, `got ${sx.toFixed(4)}, ${sy.toFixed(4)}`);
    if (ma) ok(near(mb[0] - ma[0], -dx, 0.05) && near(mb[1] - ma[1], -dy, 0.05), `${name}: ${label} - a node on screen moved by (${(mb[0] - ma[0]).toFixed(2)}, ${(mb[1] - ma[1]).toFixed(2)}) px`);
    if (pa) ok(pa !== pb, `${name}: ${label} - the canvas was drawn again (its pixels changed)`);
  };
  // a zoom: axes 'both' | 'x' | 'y' (the curve editor's one-axis zooms); the world point under the pointer stays
  const zoomCheck = async (label, run, dir, axes = 'both') => {
    const a = await read(), pa = await pixels(); await run(); const b = await read(), pb = await pixels();
    const moved = (z0, z1) => (dir > 0 ? z1 > z0 * 1.0005 : z1 < z0 / 1.0005), same = (z0, z1) => near(z1 / z0, 1, 1e-9);
    const zx = axes === 'y' ? same(a.zx, b.zx) : moved(a.zx, b.zx), zy = axes === 'x' ? same(a.zy, b.zy) : moved(a.zy, b.zy);
    ok(zx && zy, `${name}: ${label} - zooms ${dir > 0 ? 'in' : 'out'}${axes === 'both' ? '' : axes === 'y' ? ', values only' : ', time only'} (x ${a.zx.toPrecision(6)} -> ${b.zx.toPrecision(6)}, y ${a.zy.toPrecision(6)} -> ${b.zy.toPrecision(6)})`);
    ok(near(a.w[0], b.w[0], 0.05 / Math.min(a.zx, b.zx)) && near(a.w[1], b.w[1], 0.05 / Math.min(a.zy, b.zy)), `${name}: ${label} - about the pointer (world under it ${a.w.map((x) => x.toFixed(4))} -> ${b.w.map((x) => x.toFixed(4))})`);
    if (pa) ok(pa !== pb, `${name}: ${label} - the canvas was drawn again`);
  };
  return { v, P, read, mark, synth, real, scrolled, settle, panCheck, zoomCheck };
}

/** The checks on one view. `pinch`: the axes a ctrlKey wheel zooms ('both'; the curve editor 'y'). */
async function exercise(page, name, problems, { pinch = 'both' } = {}) {
  const { synth, real, scrolled, settle, panCheck, zoomCheck } = await kit(page, name);
  // (1) swipe with a sideways part, fractional pixels
  await panCheck('real swipe dx 31.5 dy 12.25', real(31.5, 12.25), 31.5, 12.25); await settle();
  await panCheck('real swipe dx -7.25 dy -20.5', real(-7.25, -20.5), -7.25, -20.5); await settle();
  await panCheck('synthetic swipe dx -18.75 dy 9.5', () => synth({ deltaX: -18.75, deltaY: 9.5 }), -18.75, 9.5); await settle();
  // (2) vertical only, small fractional
  // Chromium's input injection (CDP) stamps wheelDeltaY = +-120 on EVERY real wheel event, even deltaY 7.5, so a vertical-only injected
  // event looks like a mouse tick to the detector (a real Chrome trackpad sends wheelDeltaY = -3 * deltaY). Not a trackpad: the
  // vertical swipe is proven with the same legacy field a real Chrome trackpad sets (chromeLike).
  await panCheck('Chrome-trackpad-like vertical swipe dy 7.5 (wheelDeltaY -22.5)', () => synth({ deltaX: 0, deltaY: 7.5, chromeLike: 1 }), 0, 7.5); await settle();
  await panCheck('synthetic vertical swipe dy -14.25', () => synth({ deltaX: 0, deltaY: -14.25 }), 0, -14.25); await settle();
  await panCheck('synthetic whole-pixel swipe dx 6 dy 4 (a precision touchpad sends whole numbers)', () => synth({ deltaX: 6, deltaY: 4 }), 6, 4); await settle();
  // (3) pinch: ctrlKey
  await zoomCheck('synthetic pinch ctrlKey deltaY -9.5', () => synth({ ctrlKey: true, deltaY: -9.5 }), +1, pinch); await settle();
  await zoomCheck('synthetic pinch ctrlKey deltaY 6.25', () => synth({ ctrlKey: true, deltaY: 6.25 }), -1, pinch); await settle();
  await zoomCheck('synthetic pinch with a sideways part (ctrlKey, dx 2.5 dy -5.5)', () => synth({ ctrlKey: true, deltaX: 2.5, deltaY: -5.5 }), +1, pinch); await settle();
  await zoomCheck('real pinch (Control held) deltaY -12', real(0, -12, 'Control'), +1, pinch); await settle();
  // (4) mouse-wheel steps
  await zoomCheck('real wheel step deltaY -100', real(0, -100), +1); await settle();
  await zoomCheck('real wheel step deltaY 100', real(0, 100), -1); await settle();
  await zoomCheck('synthetic wheel step deltaY -120', () => synth({ deltaY: -120 }), +1); await settle();
  await zoomCheck('synthetic wheel step deltaY 120', () => synth({ deltaY: 120 }), -1); await settle();
  await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY -3)', () => synth({ deltaY: -3, deltaMode: 1 }), +1); await settle();
  await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY 3)', () => synth({ deltaY: 3, deltaMode: 1 }), -1); await settle();
  // the default is prevented, the page did not scroll
  const sBefore = await scrolled();
  const all = [];
  for (const init of [{ deltaX: 5.5, deltaY: 2.5 }, { deltaY: 3.5 }, { ctrlKey: true, deltaY: -4.5 }, { deltaY: 100 }, { deltaY: -120 }]) { all.push((await synth(init)).prevented); await settle(); }
  ok(all.every(Boolean), `${name}: default prevented for a swipe, a vertical swipe, a pinch and both wheel steps`, all.join());
  await real(20.5, 40.25)(); await settle(); await real(0, 100)(); await settle();
  ok(JSON.stringify(await scrolled()) === JSON.stringify(sBefore), `${name}: the real events did not scroll the page`);
  ok(problems.length === 0, `${name}: no console errors`, problems.join(' | '));
}

// ---- pages
async function openApp(app, search = '?space=paper') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-tours', 'off'); } catch (e) { /* none */ } });   // the tour toast would sit over the view, under the pointer
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(`${BASE}/lab/${app}${search}`, { waitUntil: 'networkidle' });
  if (await page.waitForSelector('[data-autosave-dialog][open]', { timeout: 1500 }).catch(() => null)) {
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  }
  return { ctx, page, problems };
}
/** Run fn(module, window.modelcraft, arg) in the page with one of the app's own modules (found in its import map). */
const withModule = (page, re, fn, arg) => page.evaluate(async ([src, flags, body, a]) => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports, k = Object.keys(map).find((x) => new RegExp(src, flags).test(x));
  if (!k) throw new Error('no module ' + src);
  return (0, eval)('(' + body + ')')(await import(map[k]), window.modelcraft, a);
}, [re.source, re.flags, fn.toString(), arg]);
const modelcraft = async () => { const o = await openApp('modelcraft'); await o.page.waitForFunction(() => window.modelcraft?.model && window.modelcraft.timeline, null, { timeout: 60000 }); return o; };
/** Three nodes from the palette, laid out, the view fitted: the Nodes window with real content. `panel` is a page expression. */
async function fillNodes(page, name, panel) {
  for (const id of ['length', 'circle', 'angle']) await page.click(`[data-nodes-window] [data-nd-add="${id}"]`);
  await page.evaluate(`(() => { const p = ${panel}, g = p.graph; g.move('n1', [20, 20]); g.move('n2', [300, 20]); g.move('n3', [20, 240]); g.connect({ node: 'n1', port: 'out' }, { node: 'n2', port: 'radius' }); p.set(g.toJSON()); })()`);
  await page.click('[data-nodes-window] [data-nd-act="fit"]');
  await page.waitForTimeout(200);
  const n = await page.evaluate(`(() => { const g = ${panel}.graph.toJSON(); return [g.nodes.length, g.wires.length, document.querySelectorAll('[data-nodes-window] .nd-world [data-nd-out]').length]; })()`);
  ok(n[0] === 3 && n[1] === 1 && n[2] >= 3, `${name}: the Nodes window is open with ${n[0]} nodes and ${n[1]} wire`);
}

const VIEWS = {
  // Workspace › Mesh, Add › Cube, Workspace › UV, Unwrap: the cube's islands in the UV editor
  async uv() {
    const { ctx, page, problems } = await modelcraft();
    await page.selectOption('[data-workspace]', 'mesh'); await page.waitForTimeout(250);
    await page.click('[data-mesh-add="cube"]'); await page.waitForTimeout(300);
    await page.selectOption('[data-workspace]', 'uv'); await page.waitForTimeout(400);
    await page.click('[data-cmd="uv-seam-sharp"]'); await page.waitForTimeout(150);
    await page.click('[data-cmd="uv-unwrap"]'); await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({ ws: window.modelcraft.workspace, cv: !!document.querySelector('[data-uv-editor] canvas'), faces: window.modelcraft.tools.tool?.mesh?.faceCount ?? null, uv: !!window.modelcraft.tools.tool?.mesh?.attrArray('uv'), hook: !!document.querySelector('[data-uv-editor] canvas')?.uvView }));
    ok(st.ws === 'uv' && st.cv && st.uv && st.hook, 'uv: Workspace › UV is open on an unwrapped cube, the editor beside the 3D view', JSON.stringify(st));
    await exercise(page, 'uv', problems); await ctx.close();
  },
  // Workspace › Animate, a box with its place keyed at 0 s and 2 s, the timeline's Curves view, framed
  async curves() {
    const { ctx, page, problems } = await modelcraft();
    const box = await withModule(page, /\/modelcraft\/dev\/model\.js/, (M, mc) => {
      let id;
      mc.model.change('scene', (mm) => {
        M.addPolygon(mm.root, M.rectPts([-1, -1, 0], [1, 0, 0], [0, 1, 0], 2, 2));
        const f = [...mm.root.faces.keys()].pop();
        M.pushPull(mm.root, f, 1.5);
        id = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group', 'Box');
      });
      mc.host.changed();
      return id;
    });
    await page.selectOption('[data-workspace]', 'animate');
    await page.waitForSelector('[data-timeline]:not([hidden])');
    await page.fill('[data-tl-length]', '2'); await page.locator('[data-tl-length]').dispatchEvent('change');
    await page.evaluate((id) => { window.modelcraft.host.setSel([{ t: 'i', id }]); window.modelcraft.host.changed(); }, box);
    const scrubTo = (s) => page.evaluate((x) => { const r = document.querySelector('[data-tl-time]'); r.value = String(x); r.dispatchEvent(new Event('input', { bubbles: true })); }, s);
    const typeIn = async (sel, val) => {   // the panel redraws at most five times a second: wait before and after
      await page.waitForTimeout(400); await page.waitForSelector(sel);
      await page.evaluate(([s2, x]) => { const i = document.querySelector(s2); i.value = x; i.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, String(val)]);
      await page.waitForTimeout(400);
    };
    await scrubTo(0); await typeIn('[data-an-in="location.0"]', '0');
    await scrubTo(2); await typeIn('[data-an-in="location.0"]', '4');
    await page.click('[data-tl-mode="curves"]');
    await page.waitForSelector('[data-an-curves]:not([hidden]) canvas');
    await page.waitForTimeout(300);
    await page.click('[data-an-frame]'); await page.waitForTimeout(200);
    const st = await page.evaluate(() => { const v = window.modelcraft.timeline.curves.view, r = document.querySelector('[data-an-canvas]').getBoundingClientRect(); return { keys: window.modelcraft.timeline.anim.props?.[0]?.keys.length, chans: document.querySelectorAll('[data-an-chan]').length, v, rw: r.width, rh: r.height }; });
    ok(st.keys === 2 && st.chans >= 1 && st.v && Math.abs(st.v.w - st.rw) < 0.5 && Math.abs(st.v.h - st.rh) < 0.5, `curves: the Curves view is open on a keyed box (${st.keys} keys, ${st.chans} curves), its view the size of the canvas`, JSON.stringify(st));
    await exercise(page, 'curves', problems, { pinch: 'y' });
    // the one-axis zooms stay, also when the deltas look like a swipe: Shift = time only, Meta = values only (never a pan)
    const { synth, settle, zoomCheck } = await kit(page, 'curves');
    await zoomCheck('Shift + wheel step deltaY -120', () => synth({ shiftKey: true, deltaY: -120 }), +1, 'x'); await settle();
    await zoomCheck('Shift + swipe-like deltas (dx 3.5 dy 6.5)', () => synth({ shiftKey: true, deltaX: 3.5, deltaY: 6.5 }), -1, 'x'); await settle();
    await zoomCheck('Meta + swipe-like deltas (dx 3.5 dy -6.5)', () => synth({ metaKey: true, deltaX: 3.5, deltaY: -6.5 }), +1, 'y'); await settle();
    await zoomCheck('Ctrl + wheel step deltaY 120', () => synth({ ctrlKey: true, deltaY: 120 }), -1, 'y'); await settle();
    ok(problems.length === 0, 'curves: no console errors after the one-axis zooms', problems.join(' | '));
    await ctx.close();
  },
  // a box, Workspace › Shading, New material, Noise + Color ramp from the list, Frame: the node material editor
  async shading() {
    const { ctx, page, problems } = await modelcraft();
    await withModule(page, /\/modelcraft\/dev\/model\.js/, (M, mc) => {
      const id = mc.model.change('test box', (mm) => {
        M.addPolygon(mm.root, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 4, 4));
        M.pushPull(mm.root, [...mm.root.faces.keys()][0], 2);
        return mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Box');
      });
      mc.host.changed(); mc.host.setSel([{ t: 'i', id }]);
    });
    await page.evaluate(() => window.modelcraft.setWorkspace('shading')); await page.waitForTimeout(300);
    await page.click('[data-shading-empty] button'); await page.waitForTimeout(200);
    await page.selectOption('[data-ne-add]', 'noise'); await page.selectOption('[data-ne-add]', 'ramp'); await page.waitForTimeout(200);
    await page.click('[data-ne-frame]'); await page.waitForTimeout(200);
    const st = await page.evaluate(() => ({ ws: window.modelcraft.workspace, nodes: document.querySelectorAll('[data-shading-editor] .cc-ne-node').length, tf: document.querySelector('[data-shading-editor] .cc-ne-world')?.style.transform }));
    ok(st.ws === 'shading' && st.nodes === 3 && /translate\(.+\) scale\(/.test(st.tf || ''), `shading: Workspace › Shading is open on a new material with ${st.nodes} nodes (${st.tf})`);
    await exercise(page, 'shading', problems); await ctx.close();
  },
  // the sidebar's Nodes › Open: the shared window, three nodes from its palette
  async 'nodes-mc'() {
    const { ctx, page, problems } = await modelcraft();
    for (const h of await page.$$('[data-af="closed"]')) { if (await page.isVisible('[data-nodes-open]')) break; await h.click().catch(() => {}); }   // the right panel folds its sections: open the one with Nodes
    await page.click('[data-nodes-open]');
    await page.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 20000 });
    await page.waitForFunction(() => !!window.modelcraft.nodes);
    if (want('nodes-mc')) {
      await fillNodes(page, 'nodes-mc', 'window.modelcraft.nodes.window.panel');
      await exercise(page, 'nodes-mc', problems);
    }
    if (want('nodes-plain')) {
      // the panel as a released build mounts it: mountNodesPanel with NO isSwipe (the same module the page already runs, the app's own node library)
      const made = await page.evaluate(async () => {
        const { mountNodesPanel } = await import('/assets/js/app-nodes.js');
        const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;   // the app's own modules, by the addresses the page runs them from
        const src = Object.keys(map).find((u) => /\/modelcraft\/dev\/nodes\/index\.js/.test(u));
        if (!src) throw new Error('nodes/index.js is not in the import map');
        const E = await import(map[src]);
        document.querySelector('[data-nodes-window]').hidden = true;
        const box = document.createElement('div');
        box.dataset.wheelPlain = '';
        box.style.cssText = 'position:fixed;left:40px;top:40px;width:900px;height:560px;z-index:99999;background:#fff;display:flex;flex-direction:column';
        document.body.append(box);
        const g = new E.Graph(), a = g.add('length'), b = g.add('circle'), c = g.add('angle');
        g.move(a, [20, 20]); g.move(b, [300, 20]); g.move(c, [20, 240]); g.connect({ node: a, port: 'out' }, { node: b, port: 'radius' });
        const tr = window.modelcraft.nodes.window.panel;   // only to know the hosted panel exists; the plain one is its own
        const panel = mountNodesPanel({ box, E, t: (k) => k, data: g.toJSON() });
        panel.fit();
        window.__plainPanel = panel;
        return { hosted: !!tr, nodes: panel.graph.nodes.length, drawn: box.querySelectorAll('.nd-world [data-nd-out]').length, tf: box.querySelector('.nd-world').style.transform };
      });
      ok(made.nodes === 3 && made.drawn >= 3, `nodes-plain: mountNodesPanel without isSwipe is up with ${made.nodes} nodes (${made.tf})`, JSON.stringify(made));
      await page.waitForTimeout(300);
      const { read, mark, synth, real, scrolled, settle, zoomCheck } = await kit(page, 'nodes-plain');
      // exactly as before D7.56: k' = clamp(k * exp(-deltaY * 0.0015)), about the pointer, whatever the deltas look like; deltaX is ignored
      const legacy = async (label, run, dy) => {
        const a = await read(), ma = await mark(); await run(); const b = await read(), mb = await mark();
        const k = Math.min(2.5, Math.max(0.2, a.zx * Math.exp(-dy * 0.0015)));
        ok(near(b.zx, k, 1e-5 * k) && b.zx !== a.zx, `nodes-plain: ${label} - zooms by exp(-deltaY * 0.0015) as before (${a.zx.toPrecision(7)} -> ${b.zx.toPrecision(7)}, expected ${k.toPrecision(7)})`);
        ok(near(a.w[0], b.w[0], 0.05 / k) && near(a.w[1], b.w[1], 0.05 / k), `nodes-plain: ${label} - about the pointer, no pan (world under it ${a.w.map((x) => x.toFixed(3))} -> ${b.w.map((x) => x.toFixed(3))})`);
        ok(Math.abs(mb[0] - ma[0]) > 1e-4 || Math.abs(mb[1] - ma[1]) > 1e-4, `nodes-plain: ${label} - the nodes on screen were scaled`);
      };
      await legacy('real swipe-like dx 31.5 dy 12.25', real(31.5, 12.25), 12.25); await settle();
      await legacy('synthetic swipe-like dx -18.75 dy 9.5', () => synth({ deltaX: -18.75, deltaY: 9.5 }), 9.5); await settle();
      await legacy('Chrome-trackpad-like vertical dy 7.5', () => synth({ deltaX: 0, deltaY: 7.5, chromeLike: 1 }), 7.5); await settle();
      await legacy('synthetic vertical dy -14.25', () => synth({ deltaY: -14.25 }), -14.25); await settle();
      await legacy('synthetic whole-pixel dx 6 dy 4', () => synth({ deltaX: 6, deltaY: 4 }), 4); await settle();
      await zoomCheck('synthetic pinch ctrlKey deltaY -9.5', () => synth({ ctrlKey: true, deltaY: -9.5 }), +1); await settle();
      await zoomCheck('real wheel step deltaY -100', real(0, -100), +1); await settle();
      await zoomCheck('real wheel step deltaY 100', real(0, 100), -1); await settle();
      await zoomCheck('synthetic wheel step deltaY 120', () => synth({ deltaY: 120 }), -1); await settle();
      await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY -3)', () => synth({ deltaY: -3, deltaMode: 1 }), +1); await settle();
      const s0 = await scrolled(), pv = [];
      for (const init of [{ deltaX: 5.5, deltaY: 2.5 }, { deltaY: 3.5 }, { ctrlKey: true, deltaY: -4.5 }, { deltaY: 100 }]) pv.push((await synth(init)).prevented);
      await real(20.5, 40.25)();
      ok(pv.every(Boolean) && JSON.stringify(await scrolled()) === JSON.stringify(s0), 'nodes-plain: default prevented, the page did not scroll', pv.join());
      ok(problems.length === 0, 'nodes-plain: no console errors', problems.join(' | '));
    }
    await ctx.close();
  },
  // a new part, Workspace › Nodes: the same window, PartCraft's own trackpad rule
  async 'nodes-pc'() {
    const { ctx, page, problems } = await openApp('partcraft');
    await page.waitForFunction(() => window.partcraft?.ready !== undefined);
    const P = await import(path.join(REPO, 'public_html/assets/apps/partcraft/dev/part.js'));
    await page.evaluate((t) => window.partcraft.openText(t, 'Pad.partcraft.json'), P.toJSON(P.newPart('Pad')));
    await page.evaluate(() => window.partcraft.built());
    await page.selectOption('[data-workspace]', 'nodes');
    await page.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 20000 });
    await page.waitForFunction(() => !!window.partcraft.nodes?.win);
    const scroll = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('partcraft.settings') || '{}').scroll || 'auto'; } catch { return 'auto'; } });
    ok(scroll === 'auto', `nodes-pc: Settings › PartCraft › Scrolling is on its default (${scroll})`);
    await fillNodes(page, 'nodes-pc', 'window.partcraft.nodes.win.panel');
    await page.waitForTimeout(500);
    await exercise(page, 'nodes-pc', problems); await ctx.close();
  },
};

const t0 = Date.now();
try {
  for (const [name, run] of Object.entries(VIEWS)) {
    if (!(want(name) || (name === 'nodes-mc' && want('nodes-plain')))) continue;
    console.log(`\n== ${name}${name === 'nodes-mc' ? ' / nodes-plain' : ''}`);
    try { await run(); } catch (e) { fail++; console.log('  FAIL ' + name + ' did not run: ' + String(e.message).split('\n')[0]); }
  }
} finally { await browser.close(); }
console.log(`\nwheel-pad model browser: ${pass} passed, ${fail} failed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
process.exit(fail ? 1 : 0);
