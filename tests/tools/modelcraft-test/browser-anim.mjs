#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-anim.mjs — the animation timeline and Render video (0.6 LC.10, session `lc-model`) in headless Chromium on
 * /lab/modelcraft: Views › Animation timeline opens the bar under the view (the view gets shorter, not covered); camera keys
 * and keys for a selected group by real clicks; scrubbing shows the camera and the group at their in-between values
 * (checked against render/anim.js in the page); Play runs to the end; Auto key keys a group moved at the playhead, and the
 * timeline's own Undo takes it back; a key dragged along its row; an ease changed; the animation saved in the .modelcraft
 * file and back on open; Render video at 480p / 24 fps / Quick → a WebM that ffprobe reads (codec, size, every frame) and
 * whose first and last frames differ (ffmpeg); the PNG ZIP choice (unzip); Stop keeps the frames made; with no keys and two
 * scenes, Export › Render video… uses the scenes (WALK); closing puts the group back; 390 px wide; no console errors.
 * Shots in tmp/shots/anim.
 *
 *   node tools/modelcraft-test/browser-anim.mjs [--out <dir>] [--keep-admin]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php). Headless Chromium draws with SwiftShader (the
 * CPU), so rendering is far slower than on a graphics card.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/anim')));
const STATE = path.join(REPO, 'tmp/render-browser-state.json');   // the same signed-in state as browser-render.mjs
const KEEP_ADMIN = process.argv.includes('--keep-admin');
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };
const has = (bin) => { try { execFileSync('which', [bin], { stdio: 'ignore' }); return true; } catch { return false; } };

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

/** A floor and a red box group; → the box's placement id. */
const build3 = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
  const m = window.modelcraft.model;
  let id;
  m.change('scene', (mm) => {
    M.addPolygon(mm.root, M.rectPts([-6, -6, 0], [1, 0, 0], [0, 1, 0], 12, 12));
    for (const f of mm.root.faces.values()) f.color = '#9a978f';
    M.addPolygon(mm.root, M.rectPts([-3, -1, 0.01], [1, 0, 0], [0, 1, 0], 2, 2));
    const f = [...mm.root.faces.keys()].pop();
    M.pushPull(mm.root, f, 1.5);
    id = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group', 'Box');
    for (const fc of mm.defs.get(mm.root.insts.get(id).def).faces.values()) fc.color = '#b3122e';
  });
  window.modelcraft.host.changed();
  return id;
});
/** render/anim.js as the page loads it (for the expected values). */
const animIn = `(async () => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  return import(Object.entries(map).find(([k]) => /\\/modelcraft\\/dev\\/render\\/anim\\.js/.test(k))[1]); })()`;
const scrubTo = (page, s) => page.evaluate((s) => { const r = document.querySelector('[data-tl-time]'); r.value = String(s); r.dispatchEvent(new Event('input', { bubbles: true })); }, s);
const same = (a, b, e = 1e-6) => a && b && a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < e);

const ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const tmpDir = path.join(REPO, 'tmp/anim-test');
fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

try {
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft && window.modelcraft.timeline);
  const boxId = await build3(page);
  const m0 = await page.evaluate((id) => window.modelcraft.model.root.insts.get(id).m.slice(), boxId);

  console.log('\nthe timeline');
  const stageH0 = await page.evaluate(() => document.querySelector('[data-stage]').clientHeight);
  await page.click('[data-view-menu] > summary');
  await page.click('[data-timeline-toggle]');
  await page.waitForSelector('[data-timeline]:not([hidden])');
  const lay = await page.evaluate(() => {
    const st = document.querySelector('[data-stage]').getBoundingClientRect(), tl = document.querySelector('[data-timeline]').getBoundingClientRect();
    return { stageH: st.height, below: tl.top >= st.bottom - 1, checked: document.querySelector('[data-timeline-toggle]').getAttribute('aria-checked'), canvas: document.querySelector('[data-gl]').clientHeight };
  });
  ok(lay.below && lay.stageH < stageH0 && Math.abs(lay.canvas - lay.stageH) < 2 && lay.checked === 'true', 'Views › Animation timeline: the bar sits under the view, the view gets shorter (not covered)', JSON.stringify(lay));
  await page.fill('[data-tl-length]', '2');
  await page.locator('[data-tl-length]').dispatchEvent('change');
  ok(await page.evaluate(() => window.modelcraft.timeline.anim.length) === 2, 'length set to 2 s');

  // camera keys: A at 0 s, B at 2 s
  const camA = { eye: [12, -10, 7], target: [0, 0, 0.5], fov: 35, persp: true }, camB = { eye: [-6, -12, 3], target: [0, 0, 0.75], fov: 35, persp: true };
  await scrubTo(page, 0);
  await page.evaluate((c) => { window.modelcraft.cam.set(c); window.modelcraft.view.invalidate(); }, camA);
  await page.click('[data-tl-key-cam]');
  await scrubTo(page, 2);
  await page.evaluate((c) => { window.modelcraft.cam.set(c); window.modelcraft.view.invalidate(); }, camB);
  await page.click('[data-tl-key-cam]');
  ok(await page.locator('[data-tl-row="camera"] [data-tl-key]').count() === 2, 'Key camera twice: two diamonds on the Camera row');

  // the box: a key at 0 s where it is, a key at 2 s moved 5 m along red and turned
  await page.evaluate((id) => window.modelcraft.host.setSel([{ t: 'i', id }]), boxId);
  await scrubTo(page, 0);
  await page.click('[data-tl-key-sel]');
  await scrubTo(page, 2);
  const m2 = await page.evaluate(async ({ id, code }) => {
    const A = await eval(code);
    const mc = window.modelcraft, d = A.decompose(mc.model.root.insts.get(id).m);
    const m = A.compose({ t: [d.t[0] + 5, d.t[1] + 1, d.t[2]], q: [0, 0, Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)], s: [1, 1, 1] });
    mc.model.change('Move', (mm) => { mm.root.insts.get(id).m = m; });
    mc.host.changed();
    return m;
  }, { id: boxId, code: animIn });
  await page.click('[data-tl-key-sel]');
  ok(await page.locator('[data-tl-row="0"] [data-tl-key]').count() === 2, 'Key selected at 0 s and 2 s: the Box row has two keys');
  await page.screenshot({ path: path.join(OUT, '01-timeline.png') });

  // scrub to 1 s: camera and box in between
  await scrubTo(page, 1);
  const mid = await page.evaluate(async ({ id, code }) => {
    const A = await eval(code), mc = window.modelcraft, an = mc.timeline.anim;
    return { cam: mc.cam.toJSON(), want: A.cameraAt(an, 1), m: mc.model.root.insts.get(id).m, wantM: A.poseAt(an.objects[0], 1), out: document.querySelector('[data-tl-time-out]').textContent };
  }, { id: boxId, code: animIn });
  ok(same(mid.cam.eye, mid.want.eye) && same(mid.cam.target, mid.want.target), 'scrub to 1 s: the camera is on its path');
  ok(same(mid.m, mid.wantM) && !same(mid.m, m0) && !same(mid.m, m2), 'the box is between its keys', mid.out);
  await page.screenshot({ path: path.join(OUT, '02-scrub-1s.png') });

  // play to the end
  await scrubTo(page, 0);
  await page.click('[data-tl-play]');
  await page.waitForTimeout(700);
  const playing = await page.evaluate(() => ({ t: window.modelcraft.timeline.time, p: document.querySelector('[data-tl-play]').getAttribute('aria-pressed') }));
  await page.waitForFunction(() => document.querySelector('[data-tl-play]').getAttribute('aria-pressed') === 'false', null, { timeout: 8000 });
  const ended = await page.evaluate((id) => ({ t: window.modelcraft.timeline.time, m: window.modelcraft.model.root.insts.get(id).m }), boxId);
  ok(playing.p === 'true' && playing.t > 0.1 && playing.t < 2, 'Play moves the playhead', String(playing.t));
  ok(Math.abs(ended.t - 2) < 1e-6 && same(ended.m, m2), 'and stops at the end, the box at its last key');

  // Auto key at 1 s, then the timeline's Undo
  await scrubTo(page, 1);
  await page.click('[data-tl-auto]');
  await page.evaluate((id) => { const mc = window.modelcraft; mc.model.change('Move', (mm) => { const m = mm.root.insts.get(id).m.slice(); m[14] += 2; mm.root.insts.get(id).m = m; }); mc.host.changed(); }, boxId);
  await page.waitForFunction(() => window.modelcraft.timeline.anim.objects[0].keys.length === 3, null, { timeout: 3000 }).catch(() => {});
  const auto = await page.evaluate(() => ({ keys: window.modelcraft.timeline.anim.objects[0].keys.map((k) => k.t), msg: document.querySelector('[data-msg]').textContent }));
  ok(JSON.stringify(auto.keys) === JSON.stringify([0, 1, 2]), 'Auto key: moving the box at 1 s sets a key there', auto.msg);
  await page.click('[data-tl-undo]');
  ok(await page.evaluate(() => window.modelcraft.timeline.anim.objects[0].keys.length) === 2, 'the timeline\'s Undo takes the key back');
  await page.click('[data-tl-auto]');
  await page.click('[data-tl-redo]');
  await page.click('[data-tl-undo]');

  // drag the camera key at 2 s to 1.5 s, then undo; ease
  const lane = await page.locator('[data-tl-row="camera"] .mc-tl-lane').boundingBox();
  const k2 = await page.locator('[data-tl-row="camera"] [data-tl-key][data-t="2"]').boundingBox();
  await page.mouse.move(k2.x + k2.width / 2, k2.y + k2.height / 2);
  await page.mouse.down();
  await page.mouse.move(lane.x + lane.width * 0.75, k2.y + k2.height / 2, { steps: 6 });
  await page.mouse.up();
  const dragged = await page.evaluate(() => window.modelcraft.timeline.anim.camera.map((k) => k.t));
  ok(dragged.length === 2 && Math.abs(dragged[1] - 1.5) < 0.05, 'a camera key dragged along its row to 1.5 s', JSON.stringify(dragged));
  await page.click('[data-tl-undo]');
  await page.click('[data-tl-row="camera"] [data-tl-key][data-t="0"]');
  await page.selectOption('[data-tl-ease]', 'hold');
  await scrubTo(page, 1.5);
  const held = await page.evaluate(() => window.modelcraft.cam.toJSON().eye);
  ok(same(held, camA.eye), 'Hold on the first key: the camera stays until the next key');
  await page.click('[data-tl-row="camera"] [data-tl-key][data-t="0"]');
  await page.selectOption('[data-tl-ease]', 'smooth');

  console.log('\nsaved in the file');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Control+s')]);
  const saved = path.join(tmpDir, 'anim.modelcraft');
  await dl.saveAs(saved);
  const file = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(file.anim && file.anim.format === 'cadcraft-anim' && file.anim.camera.length === 2 && file.anim.objects.length === 1 && file.anim.objects[0].keys.length === 2, 'the .modelcraft file carries the animation');
  await page.evaluate(() => window.modelcraft.timeline.reset());
  await page.setInputFiles('[data-file-open]', saved);
  await page.waitForFunction(() => window.modelcraft.timeline.anim.camera.length === 2, null, { timeout: 5000 }).catch(() => {});
  ok(await page.evaluate(() => window.modelcraft.timeline.anim.objects[0]?.keys.length) === 2, 'and it comes back on open');

  console.log('\nRender video');
  if (await page.evaluate(() => !!(window.VideoEncoder && window.VideoFrame))) {
    await page.click('[data-tl-video]');
    await page.waitForSelector('[data-video-dialog]');
    await page.selectOption('[data-video-size]', 'p480');
    await page.selectOption('[data-video-fps]', '24');
    await page.selectOption('[data-video-quality]', 'quick');
    await page.selectOption('[data-video-format]', 'webm');
    const est = await page.textContent('[data-video-estimate]');
    ok(/49 frames/.test(est), 'the dialog says what it will make', est);
    await page.waitForFunction(() => !document.querySelector('[data-video-go]').disabled, null, { timeout: 5000 });
    const t0 = Date.now();
    await page.click('[data-video-go]');
    await page.waitForFunction(() => /\d+ frames at/.test(document.querySelector('[data-video-status]').textContent), null, { timeout: 600000 });
    const secs = Math.round((Date.now() - t0) / 1000);
    await page.screenshot({ path: path.join(OUT, '03-video-done.png') });
    const [vd] = await Promise.all([page.waitForEvent('download'), page.click('[data-video-save]')]);
    const webm = path.join(tmpDir, 'anim.webm');
    await vd.saveAs(webm);
    ok(vd.suggestedFilename().endsWith(' animation.webm'), 'Save video downloads a .webm', vd.suggestedFilename() + ', ' + secs + ' s on CPU graphics, load ' + fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]);
    if (has('ffprobe') && has('ffmpeg')) {
      const p = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_name,width,height,nb_read_frames:format=format_name,duration', '-of', 'json', webm]).toString());
      const st = p.streams[0];
      ok(/vp[89]/.test(st.codec_name) && st.width === 854 && st.height === 480 && Number(st.nb_read_frames) === 49, 'ffprobe: VP9 / VP8, 854 × 480, all 49 frames', JSON.stringify(st));
      ok(Math.abs(Number(p.format.duration) - 49 / 24) < 0.05, 'and 49 ÷ 24 s long', p.format.duration);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', webm, '-vf', 'select=eq(n\\,0)', '-frames:v', '1', path.join(tmpDir, 'first.png')]);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', webm, '-vf', 'select=eq(n\\,48)', '-frames:v', '1', path.join(tmpDir, 'last.png')]);
      // PSNR of the first frame against the last (ffmpeg prints it on stderr): identical pictures give inf
      const out = execFileSync('sh', ['-c', 'ffmpeg -v info -i "$1" -i "$2" -lavfi psnr -f null - 2>&1 | grep -o "average:[0-9.inf]*"', 'sh', path.join(tmpDir, 'first.png'), path.join(tmpDir, 'last.png')]).toString().trim();
      const avg = parseFloat(out.split(':')[1]);
      ok(Number.isFinite(avg) && avg < 25, 'the first and last frames differ (the camera and the box moved)', 'PSNR ' + out);
      let decoded = true;
      try { execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', webm, '-f', 'null', '-'], { stdio: 'pipe' }); } catch { decoded = false; }
      ok(decoded, 'ffmpeg decodes it without an error');
    } else console.log('  skip  ffprobe / ffmpeg not installed');

    // Stop keeps the frames made
    await page.selectOption('[data-video-quality]', 'draft');
    await page.click('[data-video-go]');
    await page.waitForFunction(() => /frame [3-9]|frame \d\d/.test(document.querySelector('[data-video-status]').textContent), null, { timeout: 300000 });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => /Stopped after/.test(document.querySelector('[data-video-status]').textContent), null, { timeout: 60000 });
    const stopped = await page.textContent('[data-video-status]');
    ok(await page.locator('[data-video-dialog]').count() === 1 && !(await page.isDisabled('[data-video-save]')), 'Esc stops, the dialog stays and Save video keeps the frames made', stopped);
    const [sd] = await Promise.all([page.waitForEvent('download'), page.click('[data-video-save]')]);
    const part = path.join(tmpDir, 'part.webm');
    await sd.saveAs(part);
    if (has('ffprobe')) {
      const n = Number(JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'json', part]).toString()).streams[0].nb_read_frames);
      ok(n >= 2 && n < 49, 'the shorter video has the frames made', String(n));
    }
    // PNG pictures in a ZIP
    await page.selectOption('[data-video-quality]', 'quick');
    await page.selectOption('[data-video-format]', 'png');
    await page.click('[data-video-go]');
    await page.waitForFunction(() => /\d+ frames at/.test(document.querySelector('[data-video-status]').textContent), null, { timeout: 600000 });
    const [zd] = await Promise.all([page.waitForEvent('download'), page.click('[data-video-save]')]);
    const zip = path.join(tmpDir, 'frames.zip');
    await zd.saveAs(zip);
    if (has('unzip')) {
      const list = execFileSync('unzip', ['-l', zip]).toString();
      let tested = '';
      try { tested = execFileSync('unzip', ['-t', zip]).toString(); } catch (e) { tested = String(e.stdout); }
      ok((list.match(/frame-\d{5}\.png/g) || []).length === 49 && /No errors detected/.test(tested) && zd.suggestedFilename().endsWith(' frames.zip'), 'PNG pictures: 49 numbered frames in a sound ZIP');
    }
    await page.click('[data-video-close]');
  } else console.log('  skip  this Chromium has no WebCodecs VideoEncoder');

  console.log('\nthe walkthrough from scenes (WALK)');
  await page.evaluate(() => window.modelcraft.timeline.reset());
  await page.evaluate(({ a, b }) => {
    const mc = window.modelcraft;
    mc.model.change('scenes', (mm) => { mm.scenes = [{ name: 'Front', cam: { ...a, height: 8 }, style: { mode: 'shaded', edges: true, shadows: false, sun: { month: 6, day: 21, hour: 15, lat: 40, lon: -105, tz: -7 } } },
      { name: 'Side', cam: { ...b, height: 8 }, style: { mode: 'shaded', edges: true, shadows: false, sun: { month: 6, day: 21, hour: 15, lat: 40, lon: -105, tz: -7 } } }]; });
  }, { a: camA, b: camB });
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export="video"]');
  await page.waitForSelector('[data-video-dialog]');
  const walk = await page.evaluate(() => ({ cams: window.modelcraft.timeline.anim.camera.length, L: window.modelcraft.timeline.anim.length, est: document.querySelector('[data-video-estimate]').textContent }));
  ok(walk.cams === 4 && Math.abs(walk.L - 6) < 1e-6, 'no keys, two scenes: Export › Render video… takes the scenes as the camera path (hold 1.5 s, move 3 s)', JSON.stringify(walk));
  await page.click('[data-video-close]');

  console.log('\nclosing and small screens');
  await page.evaluate((m0) => { window.modelcraft.timeline.load({ format: 'cadcraft-anim', version: 1, length: 2, fps: 30, camera: [], objects: [] }); }, m0);
  await page.evaluate(() => window.modelcraft.timeline.load(null));
  await page.setInputFiles('[data-file-open]', saved);
  await page.waitForFunction(() => window.modelcraft.timeline.anim.objects.length === 1, null, { timeout: 5000 });
  const id2 = await page.evaluate(() => window.modelcraft.timeline.anim.objects[0].path[0]);
  await scrubTo(page, 2);
  await page.click('[data-tl-close]');
  const back = await page.evaluate((id) => ({ m: window.modelcraft.model.root.insts.get(id).m, hidden: document.querySelector('[data-timeline]').hidden }), id2);
  ok(back.hidden && same(back.m, file.anim.objects[0].keys[0].m), 'closing the timeline puts the box back at its first pose');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('[data-view-menu] > summary');
  await page.click('[data-timeline-toggle]');
  await page.waitForTimeout(300);
  const narrow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth, tl: document.querySelector('[data-timeline]').getBoundingClientRect().width }));
  ok(narrow.sw <= narrow.w + 1 && narrow.tl <= narrow.w + 1, '390 px wide: the timeline fits, no sideways scroll', JSON.stringify(narrow));
  // 0.6.1 FIX-TIMELINE-PHONE: on a phone (app-phone.js) the timeline is under the view, never a phone sheet of height 0
  const ph = await page.evaluate(() => {
    const st = document.querySelector('[data-stage]').getBoundingClientRect(), tl = document.querySelector('[data-timeline]').getBoundingClientRect();
    const head = document.querySelector('.mc-tl-head'), play = document.querySelector('[data-tl-play]').getBoundingClientRect();
    return { phone: document.documentElement.classList.contains('cc-phone'), sheetBtn: !!document.querySelector('[data-phone-sheet="timeline"]'), sheet: document.querySelector('[data-timeline]').classList.contains('shell-sheet'),
      tlH: tl.height, tlTop: tl.top, tlBottom: tl.bottom, stageH: st.height, stageBottom: st.bottom, vh: innerHeight, headH: head.getBoundingClientRect().height, playIn: play.width > 0 && play.right <= innerWidth + 1 && play.bottom <= innerHeight + 1 };
  });
  ok(ph.phone && !ph.sheetBtn && !ph.sheet, '390 px wide (phone layout): the timeline is no phone sheet, no sheet button for it', JSON.stringify(ph));
  ok(ph.tlH > 80 && ph.tlTop >= ph.stageBottom - 1 && ph.tlBottom <= ph.vh + 1 && ph.stageH >= 0.4 * ph.vh, 'the timeline shows under the view, inside the screen; the view keeps ≥ 40 % of the height', `timeline ${Math.round(ph.tlH)} px, view ${Math.round(ph.stageH)} of ${ph.vh}`);
  ok(ph.headH < 64 && ph.playIn, 'its controls are one row (scrolling sideways) and Play is on screen', `head ${Math.round(ph.headH)} px`);
  await scrubTo(page, 0);
  await page.click('[data-tl-play]');
  await page.waitForFunction(() => Number(document.querySelector('[data-tl-time]').value) > 0.3, null, { timeout: 8000 }).catch(() => {});
  ok(await page.evaluate(() => Number(document.querySelector('[data-tl-time]').value) > 0.3), 'Play on the phone runs the playhead');
  await page.screenshot({ path: path.join(OUT, '04-phone.png'), fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'model'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, '05-model-theme.png') });

  ok(!errors.length, 'no console errors', errors.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL  ' + (e && e.stack || e));
  await page.screenshot({ path: path.join(OUT, 'error.png') }).catch(() => {});
} finally {
  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (!KEEP_ADMIN) try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { stdio: 'ignore' }); } catch { /* best effort */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
