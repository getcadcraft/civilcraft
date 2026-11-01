#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-look.mjs — "say the scene" (EG.61 ★) and "material from a photo" (EG.62) in the real ModelCraft page (0.8 round 2, session
 * `model_PART_2`). The tools are called through the page's own dispatcher (host.js control.call, as an assistant or the Ask box
 * calls them), the pictures come from the Render dialog's renderer (render_still), and they are judged by their pixels.
 *
 *   EG.61  a plaza with a hall on it; "noon, clear, summer, 6 trees, 8 people" → "dusk, light rain, autumn trees, people on the plaza"
 *          (one look_set call): the second picture is darker, its sky grey instead of blue, its trees orange instead of green, the
 *          plaza's colour is wet (satin look), people carry umbrellas; the sun in the view moved to October dusk; the file saves it.
 *   EG.62  a made-up photo (stone-like, lit from one side) in the file's pictures → material_make → painted on the hall's wall →
 *          the wall renders textured; the Shading panel's "A photo…" button makes the same material from a file.
 *
 *   node tools/modelcraft-test/browser-look.mjs [--out <dir>] [--mode fast|hq] [--size 640]
 *   tools/gpu-remote/run.sh --session model-part-2 --lab -- tools/modelcraft-test/browser-look.mjs --mode hq      (rule 25: the GPU run)
 * Pictures in tmp/shots/look (or --out). Here Chromium draws with SwiftShader (the CPU): use the default fast mode and a small size.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, remote, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/look')));
const MODE = arg('--mode', 'fast'), SIZE = parseInt(arg('--size', '640'), 10);
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

const browser = await launch({ webgpu: MODE === 'hq', webgl: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
await ctx.addCookies(labCookie());
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.modelcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'], folders: [] })); } catch { /* none */ } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message || e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200)); });
await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.modelcraft && window.modelcraft.model, null, { timeout: 60000 });
console.log('machine: ' + await machine(page));

/** An assistant's call through the page's dispatcher → {ok, sc (structuredContent), text, image}. */
const call = (name, args) => page.evaluate(async ([n, a]) => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const H = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/host\.js/.test(k))[1]);
  const r = await H.getHost({ app: 'modelcraft' }).control.call(n, a, { client: { name: 'browser-look test' } });
  const img = (r.content || []).find((c) => c.type === 'image');
  return { ok: !r.isError, sc: r.structuredContent, text: (r.content || []).find((c) => c.type === 'text')?.text || '', image: img ? img.data : null };
}, [name, args]);

/** The picture render_still makes, saved, with its numbers. */
async function render(tag, extra = {}) {
  const r = await call('render_still', { mode: MODE, quality: 'draft', width: SIZE, height: Math.round((SIZE * 9) / 16), ...extra });
  if (!r.ok || !r.image) { console.log('   render_still failed: ' + r.text.slice(0, 200)); return null; }
  fs.writeFileSync(path.join(OUT, tag + '.png'), Buffer.from(r.image, 'base64'));
  const s = await page.evaluate(async (b64) => {
    const blob = await (await fetch('data:image/png;base64,' + b64)).blob(), bmp = await createImageBitmap(blob);
    const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d');
    g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data, W = bmp.width, H = bmp.height;
    let lum = 0, n = 0, green = 0, orange = 0, sd = 0;
    const L = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const r = d[i * 4], g2 = d[i * 4 + 1], b = d[i * 4 + 2], l = 0.2126 * r + 0.7152 * g2 + 0.0722 * b;
      L[i] = l; lum += l; n++;
      if (g2 > r + 12 && g2 > b + 12) green++;
      if (r > g2 + 28 && g2 > b + 8 && r > 120) orange++;
    }
    lum /= n;
    for (let i = 0; i < L.length; i++) sd += (L[i] - lum) ** 2;
    const band = (y0, y1) => { let r = 0, g2 = 0, b = 0, k = 0; for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y++) for (let x = 0; x < W; x += 2) { const o = (y * W + x) * 4; r += d[o]; g2 += d[o + 1]; b += d[o + 2]; k++; } return [r / k, g2 / k, b / k]; };
    return { w: W, h: H, lum, sd: Math.sqrt(sd / n), green, orange, sky: band(0, 0.06) };
  }, r.image);
  console.log('   ' + tag + ': mean ' + s.lum.toFixed(1) + ', sky rgb ' + s.sky.map((v) => v.toFixed(0)).join(',') + ', green px ' + s.green + ', orange px ' + s.orange + ', sd ' + s.sd.toFixed(1) + (r.sc && r.sc.ms ? ', ' + r.sc.ms + ' ms' : ''));
  return { ...s, info: r.sc };
}

// ------------------------------------------------------------------ the scene: a plaza with a hall on it
const a1 = await call('box_add', { at: ['0m', '0m', '0m'], size: ['26m', '24m', '0.2m'], name: 'Plaza' });
await call('box_add', { at: ['15m', '14m', '0.2m'], size: ['6m', '6m', '7m'], name: 'Hall' });
const plazaId = a1.sc.instance;
await call('paint', { instance: plazaId, paint: '#b9b6ae' });
await page.evaluate(() => { const mc = window.modelcraft; mc.cam.fit(mc.model.bbox(), [-0.5, -1, 0.16]); mc.view.invalidate(); });
const pl = await call('places_list', {});
ok(pl.ok && pl.sc.places.some((p) => p.instance === plazaId && p.kind === 'flat') && pl.sc.places.some((p) => p.name === 'Hall' && p.kind === 'standing'), 'places_list finds the flat plaza and the standing hall');

// ---- noon, clear, summer
const first = await call('look_set', { time: 'noon', weather: 'clear', season: 'summer', trees: { kind: 'tree-deciduous-6m', count: 6, where: { instance: plazaId }, seed: 4 }, people: { count: 8, where: { instance: plazaId }, seed: 5 } });
ok(first.ok && first.sc.trees.placed.length === 6 && first.sc.people.placed.length === 8 && first.sc.look.sky === 'clear' && first.sc.look.sun.altitude > 55, 'look_set: noon, clear, summer — six trees, eight people', first.ok ? JSON.stringify(first.sc.look.sun) : first.text);
const sunNoon = await page.evaluate(() => ({ ...window.modelcraft.view.style.sun, shadows: window.modelcraft.view.style.shadows }));
ok(sunNoon.month === 6 && sunNoon.shadows === true && sunNoon.hour > 11 && sunNoon.hour < 14, 'the view\'s own sun moved (and shadows are on)', JSON.stringify(sunNoon));
const A = await render('1-summer-noon-clear');

// ---- the sentence
const said = await call('look_set', { time: 'dusk', weather: 'light-rain', season: 'autumn', replace: true, trees: { kind: 'tree-deciduous-6m', count: 8, where: { instance: plazaId }, seed: 4 }, people: { count: 12, where: { instance: plazaId }, seed: 5 } });
ok(said.ok && said.sc.look.weather === 'light-rain' && said.sc.look.season === 'autumn' && said.sc.look.sky === 'overcast' && said.sc.people.umbrellas.length >= 6 && said.sc.scene.trees === 8 && said.sc.scene.people === 12, 'one call: dusk, light rain, autumn trees, people on the plaza (umbrellas up)', said.ok ? said.sc.notes.join(' | ').slice(0, 300) : said.text);
const sunDusk = await page.evaluate(() => ({ ...window.modelcraft.view.style.sun }));
ok(sunDusk.month === 10 && sunDusk.hour > 15 && sunDusk.hour < 19, 'the sun is in October, late afternoon', JSON.stringify(sunDusk));
const settings = await page.evaluate(() => window.modelcraft.renderSettings ?? null).catch(() => null);
const rs = await call('look_describe', {});
ok(rs.ok && rs.sc.weather === 'light-rain' && rs.sc.season === 'autumn' && rs.sc.sky === 'overcast' && rs.sc.fog.on && rs.sc.wet.includes('#b9b6ae'), 'look_describe: overcast, haze on, the plaza\'s colour is wet', rs.ok ? JSON.stringify({ sky: rs.sc.sky, fog: rs.sc.fog.on, wet: rs.sc.wet }) : rs.text);
const B = await render('2-autumn-dusk-light-rain');
if (A && B) {
  ok(B.lum < A.lum - 8, 'the dusk rain picture is darker than the summer noon', A.lum.toFixed(1) + ' → ' + B.lum.toFixed(1));
  ok(A.sky[2] > A.sky[0] + 15 && Math.abs(B.sky[2] - B.sky[0]) < Math.abs(A.sky[2] - A.sky[0]), 'the sky went from blue to grey', 'noon ' + A.sky.map((v) => v.toFixed(0)) + ' / rain ' + B.sky.map((v) => v.toFixed(0)));
  ok(B.orange > A.orange + 40 && A.green > B.green, 'the trees went from green to autumn orange', 'orange ' + A.orange + ' → ' + B.orange + ', green ' + A.green + ' → ' + B.green);
}

// the demo file (rule 37, memory showcase-files): made once, only here (the workstation run has no repo to write to), never overwritten
const SHOW = path.join(REPO, 'fixtures/showcase/modelcraft-say-the-scene.modelcraft');
if (!remote && !fs.existsSync(SHOW)) {
  fs.writeFileSync(SHOW, JSON.stringify(await page.evaluate(() => window.modelcraft.file())));
  console.log('   wrote ' + path.relative(REPO, SHOW) + ' (' + fs.statSync(SHOW).size + ' bytes)');
}

// ---- the same words without the sentence: weather alone keeps the trees; season alone moves the date; the file keeps it
const clear = await call('look_set', { weather: 'clear', time: 'noon' });
ok(clear.ok && clear.sc.look.sky === 'clear' && !clear.sc.look.fog.on && clear.sc.look.wet.length === 0 && clear.sc.look.season === 'autumn', 'clear again: sky, no fog, dry plaza; the autumn trees stay', clear.ok ? '' : clear.text);
const winter = await call('look_set', { season: 'winter' });
ok(winter.ok && winter.sc.seasonChange.changed === 8, 'winter: the 8 scene trees turn bare');
const C = await render('3-winter-noon');
const saved = await page.evaluate(() => { const t = window.modelcraft.model; return { insts: t.root.insts.size, tags: t.tags.map((g) => g.name) }; });
ok(saved.tags.includes('Scene trees') && saved.tags.includes('Scene people'), 'trees and people sit on tags of their own (the tag switch hides them)', JSON.stringify(saved.tags));
const prev = await call('look_set', { weather: 'storm', preview: true });
const stillClear = await call('look_describe', {});
ok(prev.ok && prev.sc.preview === true && stillClear.sc.weather === 'clear', 'preview: says what a storm would do and changes nothing');
const bad = await call('look_set', { time: 'teatime' });
ok(!bad.ok && /dawn/.test(bad.text), 'an unknown time is an error that lists the times');
const undo = await call('undo', { steps: 3 });
ok(undo.ok, 'undo takes the assistant\'s scene steps back');

// ------------------------------------------------------------------ EG.62: a material from a photo
await call('entourage_delete', {});
const photoId = await page.evaluate(() => {
  const w = 900, h = 700, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), img = g.createImageData(w, h);
  let a = 7; const rnd = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  const cell = 28, gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, grid = Array.from({ length: gw * gh }, rnd);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const gx = x / cell, gy = y / cell, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = gx - x0, ty = gy - y0, v = (i, j) => grid[(y0 + j) * gw + x0 + i];
    const n = (v(0, 0) * (1 - tx) + v(1, 0) * tx) * (1 - ty) + (v(0, 1) * (1 - tx) + v(1, 1) * tx) * ty, o = (y * w + x) * 4, light = 1 - 0.55 * (x / w);
    img.data[o] = (110 + n * 110) * light; img.data[o + 1] = (100 + n * 100) * light; img.data[o + 2] = (88 + n * 90) * light; img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return window.modelcraft.model.addImage({ name: 'made-up stone photo', mime: 'image/png', data: cv.toDataURL('image/png').split(',')[1], avg: '#707070' });
});
const pics = await call('pictures_list', {});
ok(pics.ok && pics.sc.pictures.some((p) => p.id === photoId), 'pictures_list shows the photo in the file');
const prevM = await call('material_make', { picture: photoId, tile: 0.8, preview: true });
ok(prevM.ok && prevM.sc.preview === true && prevM.sc.would.seam.after < prevM.sc.would.seam.before, 'material_make preview: processes the photo, adds nothing', prevM.ok ? JSON.stringify(prevM.sc.would.seam) : prevM.text);
const made = await call('material_make', { picture: photoId, name: 'Photo stone', tile: 0.8, roughness: 0.45, bump: 1.5 });
ok(made.ok && /^mat:m[a-z0-9]{8}$/.test(made.sc.paint) && made.sc.seam.after < 2.2 && made.sc.maps.join() === 'color,roughness,normal', 'material_make: a tiling material from the photo', made.ok ? JSON.stringify({ paint: made.sc.paint, seam: made.sc.seam }) : made.text);
if (made.ok) {
  const hall = (await call('model_describe', {})).sc.instances.find((i) => i.name === 'Hall');
  await page.evaluate(() => { const mc = window.modelcraft, bb = mc.model.bbox(); mc.cam.fit({ min: [15, 14, 0.2], max: [21, 20, 7.2] }, [-0.6, -1, 0.15]); mc.view.invalidate(); });
  const plain = await render('4-hall-plain', { width: 480, height: 270 });
  const p = await call('paint', { instance: hall.id, paint: made.sc.paint });
  ok(p.ok, 'the new material paints the hall (paint accepts its id)', p.ok ? '' : p.text);
  const textured = await render('5-hall-photo-material', { width: 480, height: 270 });
  if (plain && textured) ok(textured.sd > plain.sd + 4, 'the wall renders textured: more variation in the picture', plain.sd.toFixed(1) + ' → ' + textured.sd.toFixed(1));
  const del = await call('material_delete', { id: made.sc.paint });
  ok(del.ok && del.sc.removed === made.sc.id, 'material_delete removes it');
  const gone = await call('material_delete', { id: made.sc.paint });
  ok(!gone.ok && /no material/.test(gone.text), 'and says so when it is already gone');
}
// the panel's button: the same function
await page.evaluate(() => window.modelcraft.setWorkspace('shading'));
await page.waitForSelector('[data-shading-photo-file]', { state: 'attached', timeout: 15000 }).catch(() => {});
const png = await page.evaluate(() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); for (let i = 0; i < 400; i++) { g.fillStyle = `hsl(${20 + (i * 7) % 30},40%,${30 + (i * 13) % 40}%)`; g.fillRect((i * 53) % 256, (i * 97) % 256, 18, 18); } return cv.toDataURL('image/png').split(',')[1]; });
const before = await page.evaluate(() => document.querySelectorAll('[data-shading-photo-file]').length);
if (before) {
  await page.setInputFiles('[data-shading-photo-file]', { name: 'red brick wall.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.waitForFunction(() => /Made .* from the photo/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  const said2 = await page.evaluate(() => (document.body.innerText.match(/Made [^\n]*from the photo[^\n]*/) || [''])[0]);
  ok(/Made red brick wall from the photo/.test(said2), 'the Shading panel\'s "A photo…" button makes the same material', said2.slice(0, 120));
} else ok(false, 'the Shading panel has the photo button');
await page.screenshot({ path: path.join(OUT, '6-shading-panel.png') });

ok(errors.length === 0, 'no console or page errors', errors.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed — pictures in ${OUT}` + (remote ? ' (on the workstation)' : ''));
await browser.close();
process.exit(fail ? 1 : 0);
