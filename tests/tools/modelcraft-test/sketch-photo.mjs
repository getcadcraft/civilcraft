#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sketch-photo.mjs — EG.36's ModelCraft half (0.8 round 3, model_PART_3): a synthetic photo of a sketch (bin/test-photosketch.mjs' sheet: a
 * black room, a blue diagonal, a red circle, pushed through a known perspective over a dark desk), saved as a PNG, read by ModelCraft's
 * copy of cc-photosketch + cc-raster and put on the ground: the room lands at its true size at 1:50, one group per pen colour with a tag of
 * its own, one undo step; the shared engine gives CadCraft's own answer on the same photo (the copy did not drift).
 *   node tools/modelcraft-test/sketch-photo.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MC = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/');
const load = (f) => import(pathToFileURL(MC + f).href);
const SK = await load('sketch-photo-mc.js'), M = await load('model.js'), R = await load('raster/index.js'), P = await load('photosketch/photosketch.js');
const CAD = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/photosketch.js')).href);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

// the sheet (990 × 700 px) and its photo, as bin/test-photosketch.mjs makes them
const SW = 990, SH = 700, sheet = new Uint8Array(SW * SH * 3).fill(238);
const dot = (x, y, r, rgb) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) { const px = Math.round(x) + i, py = Math.round(y) + j; if (px >= 0 && py >= 0 && px < SW && py < SH) { const o = (py * SW + px) * 3; sheet[o] = rgb[0]; sheet[o + 1] = rgb[1]; sheet[o + 2] = rgb[2]; } } };
const seg = (x1, y1, x2, y2, rgb) => { const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1)); for (let i = 0; i <= n; i++) dot(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, 2, rgb); };
const K = [20, 20, 25], RED = [200, 30, 30], B = [30, 50, 200];
seg(100, 100, 700, 100, K); seg(700, 100, 700, 500, K); seg(700, 500, 100, 500, K); seg(100, 500, 100, 100, K);
seg(100, 100, 700, 500, B);
for (let i = 0; i < 500; i++) { const a = i / 500 * Math.PI * 2; dot(850 + 80 * Math.cos(a), 250 + 80 * Math.sin(a), 2, RED); }
const W = 1200, H = 900, quad = [{ x: 200, y: 150 }, { x: 1000, y: 200 }, { x: 1050, y: 780 }, { x: 150, y: 700 }];
const Hp = P.solveHomography(quad, [{ x: 0, y: 0 }, { x: SW, y: 0 }, { x: SW, y: SH }, { x: 0, y: SH }]);
const photo = { w: W, h: H, channels: 3, data: new Uint8Array(W * H * 3) };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const q = P.applyH(Hp, x + 0.5, y + 0.5), o = (y * W + x) * 3;
  if (q.x >= 0 && q.y >= 0 && q.x < SW - 1 && q.y < SH - 1) {
    const x0 = Math.floor(q.x), y0 = Math.floor(q.y), ax = q.x - x0, ay = q.y - y0;
    for (let c = 0; c < 3; c++) { const a = sheet[(y0 * SW + x0) * 3 + c], b = sheet[(y0 * SW + x0 + 1) * 3 + c], d = sheet[((y0 + 1) * SW + x0) * 3 + c], e = sheet[((y0 + 1) * SW + x0 + 1) * 3 + c]; photo.data[o + c] = Math.round((a * (1 - ax) + b * ax) * (1 - ay) + (d * (1 - ax) + e * ax) * ay); }
  } else { photo.data[o] = 70 + (x % 7); photo.data[o + 1] = 55; photo.data[o + 2] = 45; }
}
const png = await R.writePng({ w: W, h: H, channels: 3, data: photo.data });
ok(R.sniffScan(png) === 'png', 'the photo is a PNG file');
// kept for the browser pass (browser-mount3.mjs: File › Import a sketch photo…); small, made each run
import('node:fs').then((fs) => { fs.mkdirSync(path.join(ROOT, 'tmp/shots/mount3'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'tmp/shots/mount3/sketch-photo.png'), png); });

// the same photo through ModelCraft's copy and through CadCraft's own command engine
const r = await SK.sketchPhoto(png, { paper: 'iso-a4', scale: 50 });
const rc = CAD.sketchFromPhoto(await R.readScan(png), { paper: 'iso-a4', scale: 50, units: 'meters' });
ok(r.found && r.layers.map((l) => l.key).sort().join() === 'black,blue,red', 'found; three pen colours: ' + r.layers.map((l) => l.key).join());
ok(r.entities.length === rc.entities.length && JSON.stringify(r.entities) === JSON.stringify(rc.entities), 'the shared engine gives CadCraft\'s answer on the same photo (' + r.entities.length + ' entities)');

// into a model: one undo step, one group, a group + tag per colour, the room at its true size
const m = new M.Model();
const undo0 = m.undoStack.length;
const out = m.change('Import a sketch photo', (mm) => SK.addSketch(mm, r, { name: 'Sketch', names: { black: 'Sketch black', red: 'Sketch red', blue: 'Sketch blue', green: 'Sketch green' } }));
ok(m.undoStack.length === undo0 + 1, 'one undo step');
ok(out.groups.length === 3 && out.groups.every((g) => g.edges > 0) && m.root.insts.size === 1, 'one group "Sketch" holding a group per pen colour: ' + out.groups.map((g) => g.key + ' ' + g.edges).join(', '));
ok(['Sketch black', 'Sketch red', 'Sketch blue'].every((n) => !!m.tag(n)) && [...out.def.insts.values()].every((i) => !!i.tag), 'each colour group carries its own tag');
const black = out.groups.find((g) => g.key === 'black').def, bb = m.bbox(black);
// the room is 600 × 400 px of a 990 px wide A4 sheet (297 mm): 180 × 120 mm on paper, × 50 = 9 m × 6 m on the ground
const w = bb.max[0] - bb.min[0], d = bb.max[1] - bb.min[1];
ok(Math.abs(w - 9) < 0.25 && Math.abs(d - 6) < 0.25, 'the room is 9 m × 6 m at 1:50 (' + w.toFixed(3) + ' × ' + d.toFixed(3) + ' m)');
ok(Math.abs(bb.min[2]) < 1e-12 && Math.abs(bb.max[2]) < 1e-12, 'on the ground (z = 0)');
const red = m.bbox(out.groups.find((g) => g.key === 'red').def), dia = red.max[0] - red.min[0];
ok(Math.abs(dia - 160 * 297 / 990 * 50 / 1000) < 0.2, 'the red circle\'s diameter (' + dia.toFixed(3) + ' m) as drawn');
ok(SK.segmentsOf({ type: 'circle', cx: 0, cy: 0, r: 1 }).length === SK.ARC_SEGS && SK.segmentsOf({ type: 'arc', cx: 0, cy: 0, r: 1, a0: 0, a1: Math.PI / 2 }).length === SK.ARC_SEGS / 4, 'circles and arcs as short straight runs');
m.undo();
ok(m.root.insts.size === 0, 'undo takes it all back');
// what cannot be told is said, never guessed
const blank = await R.writePng({ w: 400, h: 300, channels: 3, data: new Uint8Array(400 * 300 * 3).fill(240) });
const rb = await SK.sketchPhoto(blank, {});
ok(rb.entities.length === 0, 'a photo with no ink gives no lines');
console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
