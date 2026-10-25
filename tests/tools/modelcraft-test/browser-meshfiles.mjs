#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-meshfiles.mjs — OBJ + MTL, PLY, STL and Alembic in ModelCraft (0.7 XF.3, session `interchange`), headless
 * Chromium at /lab/modelcraft.   node tools/modelcraft-test/browser-meshfiles.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin; session shared in tmp/skp-browser-state.json). Drops an OBJ with its .mtl and
 * picture together, imports a coloured PLY, an STL and an Alembic cache (made here by the oracles in
 * /var/www/CADCRAFT/oracles; skipped when missing), exports OBJ (one .zip with the texture), PLY and STL and reads them
 * back with the page's own modules. Screenshot tmp/shots/meshfiles/. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/meshfiles')));
const DL = path.join(REPO, 'tmp/modelcraft-test');
const STATE = path.join(REPO, 'tmp/skp-browser-state.json');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DL, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const req = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'));
const { chromium } = req('playwright-core');
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

/** Drop files (paths) on the stage as one drop. */
const drop = (page, files) => page.evaluate(async (list) => {
  const dt = new DataTransfer();
  for (const { name, b64 } of list) dt.items.add(new File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], name));
  const stage = window.modelcraft.ui.stage;
  stage.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
  stage.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
}, files.map((f) => ({ name: path.basename(f), b64: fs.readFileSync(f).toString('base64') })));
const state = (page) => page.evaluate(() => {
  const m = window.modelcraft.model;
  const meshes = [...m.defs.values()].filter((d) => d.mesh);
  return { msg: window.modelcraft.ui.msg.textContent, meshes: meshes.length, faces: meshes.reduce((n, d) => n + d.mesh.faceCount, 0), images: m.images.size, lights: m.lights.size, scenes: m.scenes.length, top: m.root.insts.size };
});
const waitMsg = (page, re) => page.waitForFunction((src) => new RegExp(src).test(window.modelcraft.ui.msg.textContent), re.source, { timeout: 120000 });

const FIX = path.join(DL, 'meshfiles');
fs.rmSync(FIX, { recursive: true, force: true });
fs.mkdirSync(FIX, { recursive: true });
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(path.join(FIX, 'slab.obj'), ['mtllib slab.mtl', 'o Slab', 'v 0 0 0', 'v 2 0 0', 'v 2 0 -1', 'v 0 0 -1', 'vt 0 0', 'vt 1 0', 'vt 1 1', 'vt 0 1', 'usemtl Brick', 'f 1/1 2/2 3/3 4/4', ''].join('\n'));
fs.writeFileSync(path.join(FIX, 'slab.mtl'), 'newmtl Brick\nKd 0.8 0.2 0.1\nmap_Kd brick.png\n');
fs.writeFileSync(path.join(FIX, 'brick.png'), PNG);
const PY = '/var/www/CADCRAFT/oracles/mesh-venv/bin/python';
const ABC = '/var/www/CADCRAFT/oracles/alembic-oracle/alembic-oracle';
const haveOracles = fs.existsSync(PY) && fs.existsSync(ABC);
if (haveOracles) {
  execFileSync(PY, ['-I', '-c', 'import trimesh,sys; trimesh.creation.box(extents=(20,10,5)).export(sys.argv[1])', path.join(FIX, 'box.stl')]);
  execFileSync(PY, ['-I', '-c', `import numpy as np, sys
from plyfile import PlyData, PlyElement
v = np.array([(0,0,0),(1,0,0),(1,1,0),(0,1,0)], dtype=[('x','f4'),('y','f4'),('z','f4')])
f = np.array([([0,1,2,3],40,160,80)], dtype=[('vertex_indices','O'),('red','u1'),('green','u1'),('blue','u1')])
PlyData([PlyElement.describe(v,'vertex'), PlyElement.describe(f,'face')]).write(sys.argv[1])`, path.join(FIX, 'tile.ply')]);
  execFileSync(ABC, ['write', path.join(FIX, 'cache.abc'), 'anim']);
}

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1400, height: 900 }, locale: 'en-US' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('page: ' + e.message));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft && window.modelcraft.model);

  await drop(page, ['slab.obj', 'slab.mtl', 'brick.png'].map((f) => path.join(FIX, f)));
  await waitMsg(page, /slab\.obj/);
  let s = await state(page);
  ok(s.meshes === 1 && s.images === 1 && /One texture kept/.test(s.msg), 'an OBJ dropped with its .mtl and picture: one mesh, its texture kept', JSON.stringify(s));
  if (haveOracles) {
    await page.setInputFiles('[data-file-import]', path.join(FIX, 'tile.ply'));
    await waitMsg(page, /tile\.ply/);
    s = await state(page);
    ok(s.meshes === 2 && /One colour/.test(s.msg), 'a PLY with a face colour: a mesh painted that colour', s.msg);
    await page.setInputFiles('[data-file-import]', path.join(FIX, 'box.stl'));
    await waitMsg(page, /box\.stl/);
    s = await state(page);
    ok(s.meshes === 3 && /12 faces, read as Millimeters/i.test(s.msg), 'an STL: 12 faces, read as millimetres', s.msg);
    await page.setInputFiles('[data-file-import]', path.join(FIX, 'cache.abc'));
    await waitMsg(page, /cache\.abc/);
    s = await state(page);
    ok(s.meshes === 4 && /3 samples/.test(s.msg), 'an Alembic cache: its mesh, and the message says it has 3 samples', s.msg);
  }
  const FBX = '/var/www/CADCRAFT/testfiles/fbx-corpus/assimp';
  if (fs.existsSync(FBX)) {
    const before = (await state(page)).meshes;
    await page.setInputFiles('[data-file-import]', path.join(FBX, 'embedded_float_uv.fbx'));
    await waitMsg(page, /embedded_float_uv\.fbx/);
    s = await state(page);
    ok(s.meshes === before + 1 && /One texture kept/.test(s.msg), 'an FBX with an embedded TGA texture: its mesh, the texture kept (as PNG)', s.msg);
    await page.setInputFiles('[data-file-import]', path.join(FBX, 'huesitos.fbx'));
    await waitMsg(page, /huesitos\.fbx/);
    s = await state(page);
    ok(/bones/.test(s.msg) && /lamp/.test(s.msg), 'a skinned FBX: the mesh at rest, its lamp, bones and animation counted in the message', s.msg);
  }
  await page.screenshot({ path: path.join(OUT, '01-imports.png') });
  // exports, read back with the page's own modules
  const exp = async (kind, file) => {
    await page.click('[data-export-menu] > summary');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-export="' + kind + '"]')]);
    const f = path.join(FIX, file);
    await dl.saveAs(f);
    return { name: dl.suggestedFilename(), bytes: fs.readFileSync(f) };
  };
  const z = await exp('obj', 'out.zip');
  const entries = await page.evaluate(async (b64) => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const url = Object.keys(map).find((k) => /\/modelcraft\/dev\/bcf\.js/.test(k));
    const { unzip } = await import(map[url] || url);
    const files = await unzip(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    return [...files.keys()];
  }, z.bytes.toString('base64'));
  ok(/\.zip$/.test(z.name) && entries.some((n) => /\.obj$/.test(n)) && entries.some((n) => /\.mtl$/.test(n)) && entries.some((n) => /^textures\//.test(n)), 'Export › OBJ with a texture → one .zip holding the .obj, the .mtl and the picture', entries.join(', '));
  const ply = await exp('ply', 'out.ply');
  ok(/^ply\nformat binary_little_endian/.test(ply.bytes.subarray(0, 40).toString('latin1')), 'Export › PLY writes a binary PLY');
  const stl = await exp('stl', 'out.stl');
  ok(stl.bytes.length === 84 + stl.bytes.readUInt32LE(80) * 50 && stl.bytes.readUInt32LE(80) > 12, 'Export › STL writes every triangle', String(stl.bytes.readUInt32LE(80)));
  const after = (await state(page)).meshes;
  await page.keyboard.press('Control+z');
  ok((await state(page)).meshes < after, 'one undo takes the last import back');
  await page.close();
  await ctx.close();
} catch (err) {
  problems.push('run: ' + (err.stack || err.message));
} finally {
  await browser.close();
}
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
