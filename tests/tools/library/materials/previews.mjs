#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * previews.mjs — each library material's preview, rendered by CadCraft's own path tracer (0.7 MT.3, session `materials`;
 * "previews rendered by RN"): in /lab/modelcraft (headless Chromium, ModelCraft's test admin), a sphere on a floor under the clear
 * sky and the sun, the material placed triplanar at its real tile size, the JS reference at 128 × 128 × 16 samples (KICKOFF rule
 * 14), then RN.5's denoiser; written as CC_HOME/refs/cc0-materials/<id>/preview.png. Made once: an existing preview is kept
 * (delete it to make it again). Run as root.
 *
 *   node tools/library/materials/previews.mjs [--only red_brick,…]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const REFS = '/var/www/CADCRAFT/refs/cc0-materials';
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SETS = JSON.parse(fs.readFileSync(path.join(HERE, 'sets.json'), 'utf8')).sets.map((s) => s.id);
const ONLY = arg('--only', '') ? arg('--only', '').split(',') : SETS;

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
let made = 0, kept = 0, bad = 0;
try {
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  pageerror ' + e.message));
  await page.goto(BASE + '/admin/login'); await page.fill('input[name="email"]', admin.email); await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'networkidle' });
  for (const id of ONLY) {
    const out = path.join(REFS, id, 'preview.png');
    if (fs.existsSync(out)) { kept++; continue; }
    const item = JSON.parse(fs.readFileSync(path.join(HERE, 'items', id + '.item.json'), 'utf8'));
    const maps = {};
    for (const [role, m] of Object.entries(item.material.maps)) maps[role] = { media: m.media, b64: fs.readFileSync(path.join(REFS, id, m.file)).toString('base64') };
    const t0 = Date.now();
    const r = await page.evaluate(async ({ item, maps }) => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const url = (re) => Object.entries(map).find(([k]) => re.test(k))[1];
      const [D, IM, G, PK, REF, SMP, PS, DN] = await Promise.all([/shading\/doc\.js/, /shading\/images\.js/, /shading\/graph\.js/, /render\/pt-pack\.js/, /render\/pt-ref\.js/,
        /render\/pt-sampler\.js/, /render\/pt-spec\.js/, /render\/denoise\.js/].map((re) => import(url(re))));
      const T = new D.MaterialTable();
      for (const [role, m] of Object.entries(maps)) T.images.set('map:' + role, await IM.decodeImage(m.media, m.b64));
      const g = G.cleanGraph(JSON.parse(item.material.graph)).graph;
      const out = g.nodes.find((n) => n.type === 'output');
      out.params.mapping = 'triplanar'; out.params.sharpness = 8;   // a sphere: no seams
      const id = T.create(item.name, g);
      // a sphere 0.8 tile across on a floor, the camera a little above, the clear sky and a low sun from the front left
      const R = Math.max(0.05, 0.4 * Math.min(item.material.size[0], item.material.size[1]));
      const items = [];
      const sph = { pos: [], nor: [], look: 'mat:' + id }, seg = 48, rings = 32;
      const P = (i, j) => { const th = (Math.PI * j) / rings, ph = (2 * Math.PI * i) / seg, n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]; return { p: [R * n[0], R * n[1], R + R * n[2]], n }; };
      for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) { const a = P(i, j), b = P(i, j + 1), c = P(i + 1, j + 1), d = P(i + 1, j); for (const v of [a, b, c, a, c, d]) { sph.pos.push(...v.p); sph.nor.push(...v.n); } }
      items.push(sph);
      const attr = (a, k) => ({ count: a.length / k, getX: (i) => a[i * k], getY: (i) => a[i * k + 1], getZ: (i) => a[i * k + 2] });
      const geo = (it) => ({ getAttribute: (n) => (n === 'position' ? attr(it.pos, 3) : n === 'normal' ? attr(it.nor, 3) : null), index: null, drawRange: { start: 0, count: Infinity } });
      const look = (eye, tg) => { const f = tg.map((x, k) => x - eye[k]), fl = Math.hypot(...f), z = f.map((x) => -x / fl); let x = [-z[1], z[0], 0]; const xl = Math.hypot(...x); x = x.map((v) => v / xl); const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]]; return [...x, 0, ...y, 0, ...z, 0, ...eye, 1]; };
      const persp = (fov, a, n, f) => { const t = 1 / Math.tan((fov * Math.PI) / 360); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]; };
      const scene = { items: items.map((it) => ({ geometry: geo(it), look: it.look, matrix: null })), defaultColor: '#bdbab4', up: [0, 0, 1],
        bounds: { min: [-R, -R, 0], max: [R, R, 2 * R] }, groundAt: 0, sun: [-0.55, -0.6, 0.58], lights: [],
        camera: () => ({ world: look([R * 0.2, -R * 3.2, R * 2.1], [0, 0, R * 0.95]), proj: persp(40, 1, R * 0.05, R * 60) }) };
      const pk = PK.packScene(scene, { sky: 'clear', ground: true, denoise: true }, { w: 128, h: 128 });
      const acc = REF.makeTracer(pk, { mask: SMP.blueNoise() }).render({ spp: 16 });
      const L = { w: 128, h: 128, accum: acc, aux: acc.aux, stride: pk.auxStride, nElements: 2 };
      let lin, engine = 'none';
      try { const d = await DN.denoiseLayers(L); lin = d.lin; engine = d.engine; } catch (e) { lin = null; }
      const cv = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), cg = cv.getContext('2d'), im = cg.createImageData(128, 128);
      for (let i = 0; i < 128 * 128; i++) {
        const n = acc[i * 4 + 3] || 1, m = lin ? [lin[i * 3], lin[i * 3 + 1], lin[i * 3 + 2]] : [acc[i * 4] / n, acc[i * 4 + 1] / n, acc[i * 4 + 2] / n];
        const px = PS.displayPixel(m, 0, null);
        im.data[i * 4] = px[0]; im.data[i * 4 + 1] = px[1]; im.data[i * 4 + 2] = px[2]; im.data[i * 4 + 3] = 255;
      }
      cg.putImageData(im, 0, 0);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const b = new Uint8Array(await blob.arrayBuffer());
      let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
      T.load(null);
      return { png: btoa(s), engine };
    }, { item, maps }).catch((e) => ({ error: String(e) }));
    if (r.error) { console.log('! ' + id + ': ' + r.error.slice(0, 300)); bad++; continue; }
    fs.writeFileSync(out, Buffer.from(r.png, 'base64'));
    console.log('  ' + id + ': preview made (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s, denoised: ' + r.engine + ')');
    made++;
  }
} finally {
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch (e) { /* next run */ }
  await browser.close();
}
console.log(`previews: ${made} made, ${kept} kept, ${bad} problems`);
process.exit(bad ? 1 : 0);
