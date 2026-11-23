#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// il7.test.mjs — IL.7 isolines + 3D surface; SU.1816 the model's own geometry in the night picture, landscape lights. node lib/lightdesign/test/il7.test.mjs
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as L from '../lib/index.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const RD = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/render');
const imp = (f) => import(pathToFileURL(path.join(RD, f)).href);
const [PK, REF, SMP] = await Promise.all(['pt-pack.js', 'pt-ref.js', 'pt-sampler.js'].map(imp));
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
const KIT = { PK, REF, SMP };

console.log('\nisolines');
const rm = L.cleanRoom({ polygon: [[0, 0], [12000, 0], [12000, 12000], [0, 12000]], height: 5000, workplane: 0, margin: 0 });
const lum = [{ photo: L.genericPhoto('pole'), p: [6000, 6000, 5000], aim: [0, 0, -1], rot: 0 }];
const res = L.runSite({ room: rm, luminaires: lum, llf: 1, spacing: 250 });
const f = L.gridField(res), lv = L.niceLevels(res.emin, res.emax, 5);
ok(f.nx === 48 && f.ny === 48 && !Array.from(f.v).some(Number.isNaN), 'gridField rebuilds the regular grid (48 x 48) from a result');
ok(lv.length >= 3 && lv.every((l, i) => i === 0 || l > lv[i - 1]) && lv.every((l) => l > res.emin && l < res.emax), 'niceLevels: round, rising, inside the range', lv.join(' '));
const iso = L.isolines(f, lv);
// under a symmetric single luminaire every isoline is a closed ring about the pole; check each point has the level's lux (bilinear along edges: within 3 %) and ring radius shrinks with level
let worst = 0, n = 0;
for (const { level, segments } of iso) for (const s of segments) for (const p of s) { const e = L.siteLuxAt(lum, p[0], p[1], 0, { llf: 1 }); worst = Math.max(worst, Math.abs(e - level) / level); n++; }
ok(n > 100 && worst < 0.03, 'every isoline point lies where the calculation gives that lux (within 3 %)', 'worst ' + (worst * 100).toFixed(2) + ' % over ' + n + ' points');
const radius = (isoI) => mean(isoI.segments.map((s) => Math.hypot(s[0][0] - 6000, s[0][1] - 6000)));
ok(iso.every((a, i) => i === 0 || radius(a) < radius(iso[i - 1])), 'a higher level makes a smaller ring about the pole');
const flat = { nx: 3, ny: 3, x0: 0, y0: 0, dx: 1, dy: 1, v: new Float64Array([1, 1, 1, 1, 1, 1, 1, 1, 1]) };
ok(L.isolines(flat, [0.5, 2]).every((a) => a.segments.length === 0), 'a flat field has no isoline');
const sad = { nx: 2, ny: 2, x0: 0, y0: 0, dx: 1, dy: 1, v: new Float64Array([1, 0, 0, 1]) };   // i*ny+j: (0,0)=1 (0,1)=0 (1,0)=0 (1,1)=1: a saddle
ok(L.isolines(sad, [0.5])[0].segments.length === 2, 'a saddle cell gives two segments');
const holes = L.gridField(L.runSite({ room: rm, luminaires: lum, llf: 1, spacing: 250, obstacles: [{ x0: 7000, y0: 5000, x1: 8000, y1: 7000, z0: -100, z1: 8000 }] }));
ok(Array.from(holes.v).some(Number.isNaN) && L.isolines(holes, lv).every((a) => a.segments.every((s) => s.flat().every(Number.isFinite))), 'points inside an obstacle footprint are left out and no isoline crosses them');

console.log('\n3D surface');
const sf = L.luxSurface(f);
ok(sf.positions.length === 48 * 48 * 3 && sf.indices.length === 47 * 47 * 6 && sf.colours.length === sf.positions.length, 'one vertex per grid point, two triangles per cell');
let zi = 0; for (let i = 2; i < sf.positions.length; i += 3) if (sf.positions[i] > sf.positions[zi]) zi = i;
ok(Math.abs(sf.positions[zi - 2] - 6000) < 300 && Math.abs(sf.positions[zi - 1] - 6000) < 300, 'the peak of the surface is under the pole');
ok(Math.abs(sf.positions[zi] / sf.heightPerLux - res.emax) / res.emax < 1e-4, 'height / heightPerLux is the lux at that vertex');

console.log('\nlandscape lights');
const feat = { trees: [{ x: 3000, y: 3000 }, { x: 9000, y: 9000 }], paths: [{ pts: [[0, 6000], [12000, 6000]] }], spots: [[6000, 6000]] };
const ll = L.landscapeLuminaires(feat, { pathStep: 4000 });
ok(ll.filter((x) => x.kind === 'tree').length === 2 && ll.filter((x) => x.kind === 'path').length === 4 && ll.filter((x) => x.kind === 'pole').length === 1, '2 trees, a 12 m path every 4 m (ends included = 4), 1 pole');
const up = ll.find((x) => x.kind === 'tree'), r1 = L.runSite({ room: rm, luminaires: ll, llf: 1, spacing: 500 });
ok(up.aim[2] > 0 && r1.count === 7 && r1.em > 0, 'up-lights aim up; the whole set calculates as a site');
const rl = L.renderLamps(ll, { cct: 3000 });
ok(rl.lamps.length === 7 && rl.lamps.find((x, i) => ll[i].kind === 'tree').dir[2] > 0.8, 'the lights reach the renderer as lamps, the up-light still pointing up');

console.log('\nthe model\'s own geometry in the night picture (one luminaire vs the calculation)');
{
  const photo = L.genericPhoto('pole'), W = 64, H = 36, SPP = Number(process.env.NIGHT_SPP || 24), RHO = 0.2, lamp1 = [{ photo, p: [6000, 6000, 5000], aim: [0, 0, -1], rot: 0 }];
  const { lamps, ies } = L.renderLamps(lamp1, { cct: null, llf: 1 });
  const tri = (a, b, c) => [a, b, c], g = [[-4000, -4000, 0], [16000, -4000, 0], [16000, 16000, 0], [-4000, 16000, 0]];
  // the "model": its own ground (two triangles, counter-clockwise seen from above) of reflectance 0.2, taken from the host, with the generated shell switched off
  const ground = L.modelItem([tri(g[0], g[1], g[2]), tri(g[0], g[2], g[3])], L.greyOf(RHO), 'z');
  const mk = (on) => L.nightScene({ room: rm, luminaires: lamp1, outdoor: true, aspect: W / H, lamps: on ? lamps : [], ies, modelItems: [ground], shell: false });
  const diffuse = (pk) => { const F = pk.mats.length / new Uint32Array(pk.header)[4]; for (let m = 0; m < pk.mats.length / F; m++) { pk.mats[m * F + 7] = 0; PK.finishRecord(pk.mats.subarray(m * F, m * F + F)); } };
  const go = (d) => L.renderNight({ kit: KIT, data: d, settings: { ...d.settings, ...L.nightPreset({}), mode: 'hq', ground: false }, w: W, h: H, spp: SPP, patch: diffuse });
  const dOn = mk(true), onR = await go(dOn), offR = await go(mk(false));
  ok(dOn.items.length === 1, 'shell:false leaves only the model\'s own items in the scene', String(dOn.items.length));
  const fc = L.falseColour({ w: W, h: H, camera: dOn.camera, planeZ: 0, inside: (x, y) => x >= 0 && x <= 12000 && y >= 0 && y <= 12000, luxAt: (x, y) => L.siteLuxAt(lamp1, x, y, 0, { llf: 1 }) });
  const diff = new Float64Array(onR.accum.length);
  for (let i = 0; i < diff.length; i += 4) { const n = onR.accum[i + 3] || 1; for (let k = 0; k < 3; k++) diff[i + k] = onR.accum[i + k] / n - offR.accum[i + k] / (offR.accum[i + 3] || 1); diff[i + 3] = 1; }
  const rel = [];
  for (let py = 1; py < H - 1; py++) for (let px = 1; px < W - 1; px++) { const v = fc.lux[py * W + px]; if (v > 2) rel.push([L.pixelLux(diff, W, px, py, RHO, 1) / v, v]); }
  const m = mean(rel.map((r) => r[0])), hi = rel.filter((r) => r[1] > mean(rel.map((x) => x[1]))), mh = mean(hi.map((r) => r[0]));
  console.log('  info model ground: ' + rel.length + ' pixels, renderer / calculation mean ' + m.toFixed(3) + ', brightest half ' + mh.toFixed(3) + ' (' + SPP + ' spp)');
  ok(rel.length >= 150 && Math.abs(m - 1) <= 0.05 && Math.abs(mh - 1) <= 0.05, 'ONE LUMINAIRE on the MODEL\'S OWN ground: renderer vs calculation within 5 % (mean and brightest half)', m.toFixed(3) + ' / ' + mh.toFixed(3));
  const wall = L.modelItem([tri([2000, 2000, 0], [3000, 2000, 0], [3000, 2000, 2000]), tri([2000, 2000, 0], [3000, 2000, 2000], [2000, 2000, 2000])], '#cc3322', 'y');
  ok(wall.pos.length === 18 && Math.abs(Math.hypot(wall.nor[0], wall.nor[1], wall.nor[2]) - 1) < 1e-9, 'modelItem in BimCraft axes: triangles in, unit normals out');
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
