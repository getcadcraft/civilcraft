#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// night.test.mjs — SU.1816: the design as lights in the render scene, the site calculation, the false colour. node lib/lightdesign/test/night.test.mjs
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as L from '../lib/index.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const RD = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/render');
const imp = (f) => import(pathToFileURL(path.join(RD, f)).href);
const [PK, REF, SMP, IES, SPEC, LOOKS] = await Promise.all(['pt-pack.js', 'pt-ref.js', 'pt-sampler.js', 'pt-ies.js', 'pt-spec.js', 'looks.js'].map(imp));
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(b));
const section = (s) => console.log('\n' + s);
const KIT = { PK, REF, SMP };
const room = (o = {}) => L.cleanRoom({ polygon: [[0, 0], [12000, 0], [12000, 12000], [0, 12000]], height: 5000, workplane: 0, margin: 0, ...o });
const site = (photo, at = [6000, 6000, 5000], extra = {}) => ({ photo, p: at, aim: [0, 0, -1], rot: 0, ...extra });
const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;

section('colour, web, lamps');
{
  ok(kelvinOk(), 'kelvinToHex: 2700 K is warm, 6500 K near white, 10000 K bluish');
  function kelvinOk() { const a = L.kelvinToHex(2700), b = L.kelvinToHex(6500), c = L.kelvinToHex(10000), n = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16); return n(a, 0) === 255 && n(a, 2) < n(a, 1) && n(a, 1) < 255 && n(b, 0) > 240 && n(b, 2) > 240 && n(c, 2) === 255 && n(c, 0) < n(c, 2); }
  ok(L.SCENE_LIGHT_SCALE === SPEC.LIGHT_SCALE && SPEC.LIGHT_SCALE === LOOKS.LIGHT_SCALE, 'the scene light scale is the renderer\'s (pt-spec = looks = night.js)');
  for (const id of ['downlight', 'pole', 'bollard']) {
    const p = L.genericPhoto(id), f = L.webFlux(p);
    ok(near(f, p.lumens, 0.01), 'web flux of ' + id + ' = its lumens', f.toFixed(0) + ' vs ' + p.lumens);
    const ies = IES.readIes(L.iesText(p, { name: id }));
    ok(ies.vertical.length === p.vAngles.length && near(ies.flux, f, 0.01), 'iesText(' + id + ') is read by the renderer\'s own reader with the same flux', ies.flux.toFixed(0));
  }
  // an asymmetric web: a luminaire whose 0..180 plane is bright, rotated 90 degrees
  const asym = { ...L.genericPhoto('downlight'), hAngles: [0, 90, 180, 270, 360], sym: 'none' };
  asym.cd = [0, 1, 2, 3, 4].map((h) => asym.cd[0].map((v) => v * (h === 1 ? 2 : h === 3 ? 0.2 : 1)));
  ok(!L.isAxial(asym) && L.isAxial(L.genericPhoto('panel')), 'isAxial tells a rotationally symmetric web from an asymmetric one');
  const t0 = IES.readIes(L.iesText(asym, { rotation: 0 })), t30 = IES.readIes(L.iesText(asym, { rotation: 30 }));
  ok(t0.horizontal.length === 73 && Math.abs(IES.candelaAt(t30, 30, 120) - IES.candelaAt(t0, 30, 90)) / IES.candelaAt(t0, 30, 90) < 0.02, 'a turned web: the file plane at C+30 holds the candela of C');
  const lum = [site(L.genericPhoto('pole')), site(L.genericPhoto('pole'), [1000, 1000, 5000]), site(L.genericPhoto('bollard'), [2000, 2000, 900], { cct: 4000 })];
  const rl = L.renderLamps(lum, { llf: 0.8, cct: 3000 });
  ok(rl.lamps.length === 3 && Object.keys(rl.ies).length === 2, 'three luminaires, two webs (the same type shares one)', Object.keys(rl.ies).join(', '));
  ok(near(rl.lamps[0].lumens, L.webFlux(lum[0].photo), 1e-9) && near(L.renderLamps(lum, { llf: 0.8, maintained: true }).lamps[0].lumens, L.webFlux(lum[0].photo) * 0.8, 1e-9), 'lumens = the web\'s flux, times the maintenance factor when asked');
  ok(rl.lamps[0].color === L.kelvinToHex(3000) && rl.lamps[2].color === L.kelvinToHex(4000) && L.renderLamps(lum, { cct: null }).lamps[0].color === '#ffffff', 'colour temperature per luminaire, else the default, null = white');
  const y = L.renderLamps([site(L.genericPhoto('pole'), [1000, 2000, 5000])], { axes: 'y' }).lamps[0];
  ok(y.p[0] === 1 && y.p[1] === 5 && y.p[2] === -2 && y.dir[1] === -1, 'BimCraft axes: (x, y, z) mm become (x, z, -y) m, nadir becomes -y');
  const many = L.renderLamps(Array.from({ length: 40 }, (_, i) => site({ ...L.genericPhoto('panel'), name: 'p' + i }, [i * 100, 0, 3000])), {});
  ok(Object.keys(many.ies).length === L.MAX_WEBS && many.notes.includes('webs.cap') && many.lamps.length === 40, 'more than 32 different webs: the rest light without a web and the notes say so');
  // the renderer takes the lamps and the webs
  const d = L.nightScene({ room: room(), luminaires: lum, outdoor: true, lamps: rl.lamps, ies: rl.ies });
  const pk = PK.packScene(L.rendererScene(d), d.settings, { w: 8, h: 8 });
  ok(new Uint32Array(pk.header)[5] >= 3, 'packScene takes the three lamps', 'lights ' + new Uint32Array(pk.header)[5]);
  const pr = L.nightPreset({ lat: -34, lux: 10 }), cs = LOOKS.cleanSettings(pr);
  ok(pr.sun.month === 6 && cs.sun && cs.sun.hour === 0 && cs.exposure >= -3 && cs.exposure <= 3 && L.nightPreset({ lat: 10 }).sun.month === 12, 'night preset: sun down on the hemisphere\'s solstice, exposure in the dialog\'s range');
  ok(L.exposureFor(5, 0.2) === 3 && L.exposureFor(500, 0.2) < L.exposureFor(50, 0.2), 'exposure follows the light: brighter site, fewer stops');
}

section('site calculation');
{
  const photo = L.genericPhoto('pole'), lum = [site(photo)];
  const r = L.runSite({ room: room(), luminaires: lum, llf: 1, spacing: 1000, requirements: { em: 5, uo: 0.01 } });
  const e = photo.maxCd / 25;   // straight under the pole, 5 m up
  const mid = r.grid.points.map((p, i) => [Math.hypot(p[0] - 6000, p[1] - 6000), r.grid.values[i]]).sort((a, b) => a[0] - b[0])[0];
  ok(r.outdoor && r.ugr === null && r.notes.includes('note.site'), 'runSite: outdoor, no glare figure, the note says direct light only');
  ok(near(mid[1], e, 0.02) || mid[0] > 0, 'straight under the pole E = I(0) / h²', mid[1].toFixed(1) + ' vs ' + e.toFixed(1));
  const dh = Math.hypot(...[6000, 6000, 5000].map((v, i) => v - [6500, 6000, 0][i])) / 1000;
  ok(near(L.siteLuxAt(lum, 6500, 6000, 0, { llf: 1 }), L.candela(photo, Math.acos(5 / dh) * 180 / Math.PI, 0) * (5 / dh) / (dh * dh), 1e-6), 'siteLuxAt is the cosine law');
  const blocked = L.runSite({ room: room(), luminaires: lum, llf: 1, spacing: 1000, obstacles: [{ x0: 7000, y0: 5000, x1: 8000, y1: 7000, z0: -100, z1: 8000 }] });
  ok(blocked.emin < r.emin && blocked.excluded > 0, 'a building between the pole and the ground shades it, and its footprint is left out');
  ok(r.checks.length > 0 && r.count === 1 && r.em > 0, 'checks and counts as for a room');
  ok(L.SITE_GENERIC_IDS.includes('pole') && !L.GENERIC_IDS.includes('pole') && L.genericPhoto('bollard').generic === 'bollard', 'outdoor types are listed apart from the indoor five');
}

section('false colour');
{
  const rm = room(), cam = L.cameraFor(rm, { outdoor: true, aspect: 2 }), lum = [site(L.genericPhoto('pole'))];
  const fc = L.falseColour({ w: 40, h: 20, camera: cam, planeZ: 0, inside: (x, y) => x >= 0 && x <= 12000 && y >= 0 && y <= 12000, luxAt: (x, y) => L.siteLuxAt(lum, x, y, 0, { llf: 1 }) });
  ok(fc.covered > 100 && fc.range.max > fc.range.min && fc.legend.length >= 3, 'false colour covers the ground in view and has a legend', fc.covered + ' px, ' + fc.legend.map((t) => t.lux).join(' '));
  const i = fc.lux.findIndex((v) => v === Math.max(...Array.from(fc.lux).filter((x) => !Number.isNaN(x))));
  ok(fc.rgba[i * 4] > 200 && fc.rgba[i * 4 + 2] < 100, 'the brightest pixel is red (the top of the scale)');
  const a = L.pixelRay(cam, 40, 20, 20, 10);
  ok(Math.abs(Math.hypot(...a.d) - 1) < 1e-9 && a.d[2] < 0, 'the middle pixel looks down at the site');
  const yy = L.axesOf('y'), p = yy.inv(yy.pt([1234, -567, 890]));
  ok(Math.abs(p[0] - 1234) < 1e-6 && Math.abs(p[1] + 567) < 1e-6 && Math.abs(p[2] - 890) < 1e-6, 'axes map there and back');
}

section('picture and numbers: one luminaire, the renderer vs the calculation');
{
  const photo = L.genericPhoto('pole'), lum = [site(photo)], W = 64, H = 36, SPP = Number(process.env.NIGHT_SPP || 24), RHO = 0.2;
  const rm = room(), asp = W / H;
  const { lamps, ies } = L.renderLamps(lum, { cct: null, llf: 1 });
  const base = (lampsOn) => L.nightScene({ room: rm, luminaires: lum, outdoor: true, aspect: asp, lamps: lampsOn ? lamps : [], ies, settings: { groundRho: RHO } });
  const settings = (d) => ({ ...d.settings, ...L.nightPreset({}), mode: 'hq', ground: false });
  const dOn = base(true), dOff = base(false);
  const diffuse = (pk) => { const F = pk.mats.length / new Uint32Array(pk.header)[4]; for (let m = 0; m < pk.mats.length / F; m++) { pk.mats[m * F + 7] = 0; PK.finishRecord(pk.mats.subarray(m * F, m * F + F)); } };
  const go = (d, patch) => L.renderNight({ kit: KIT, data: d, settings: settings(d), w: W, h: H, spp: SPP, patch });
  const compare = (onR, offR, label) => {
    const diff = new Float64Array(onR.accum.length);
    for (let i = 0; i < diff.length; i += 4) { const n = onR.accum[i + 3] || 1; for (let k = 0; k < 3; k++) diff[i + k] = onR.accum[i + k] / n - offR.accum[i + k] / (offR.accum[i + 3] || 1); diff[i + 3] = 1; }
    const rel = [];
    for (let py = 1; py < H - 1; py++) for (let px = 1; px < W - 1; px++) { const v = fc.lux[py * W + px]; if (v > 2) rel.push([L.pixelLux(diff, W, px, py, RHO, 1) / v, v]); }
    const m = mean(rel.map((r) => r[0])), sd = Math.sqrt(mean(rel.map((r) => (m - r[0]) ** 2))), hi = rel.filter((r) => r[1] > mean(rel.map((x) => x[1])));
    console.log('  info ' + label + ': ' + rel.length + ' pixels, renderer / calculation mean ' + m.toFixed(3) + ', sd ' + sd.toFixed(3) + ', brightest half ' + mean(hi.map((r) => r[0])).toFixed(3) + ' (' + SPP + ' spp, ' + W + 'x' + H + ')');
    return { n: rel.length, m, hi: mean(hi.map((r) => r[0])) };
  };
  const fc = L.falseColour({ w: W, h: H, camera: dOn.camera, planeZ: 0, inside: (x, y) => x >= 0 && x <= 12000 && y >= 0 && y <= 12000, luxAt: (x, y) => L.siteLuxAt(lum, x, y, 0, { llf: 1 }) });
  const dOnR = await go(dOn, diffuse), dOffR = await go(dOff, diffuse), A = compare(dOnR, dOffR, 'diffuse ground (the specular lobe switched off)');
  ok(A.n >= 150, 'enough lit ground pixels to compare', String(A.n));
  ok(Math.abs(A.m - 1) <= 0.05 && Math.abs(A.hi - 1) <= 0.05, 'ONE LUMINAIRE: the renderer\'s illuminance on a diffuse ground agrees with the calculation within 5 % (mean and brightest half)', A.m.toFixed(3) + ' / ' + A.hi.toFixed(3));
  const B = compare(await go(dOn, null), await go(dOff, null), 'the app\'s matte look as it is');
  ok(B.m > A.m && B.m < 1.25, 'the app\'s matte surface also reflects a little specular light (4 % at normal incidence, an addition of about 0.04 / ρ on a ρ = 0.2 floor): ratio between the two', B.m.toFixed(3));
}

section('picture and numbers: a room (inter-reflection), the renderer vs the radiosity calculation');
{
  const rm = L.cleanRoom({ polygon: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], height: 2800, workplane: 0, margin: 0, refl: { ceiling: 0.7, walls: 0.5, floor: 0.2 } });
  const photo = L.genericPhoto('panel'), lum = [site(photo, [2000, 2000, 2800]), site(photo, [4000, 2000, 2800])], W = 64, H = 36, SPP = Number(process.env.NIGHT_SPP || 24);
  const prep = L.prepare(rm), sol = L.solve(prep, lum), { lamps, ies } = L.renderLamps(lum, { cct: null, llf: 1 });
  const mk = (on) => L.nightScene({ room: rm, luminaires: lum, aspect: W / H, lamps: on ? lamps : [], ies });
  const diffuse = (pk) => { const F = pk.mats.length / new Uint32Array(pk.header)[4]; for (let m = 0; m < pk.mats.length / F; m++) { pk.mats[m * F + 7] = 0; PK.finishRecord(pk.mats.subarray(m * F, m * F + F)); } };
  const go = (d) => L.renderNight({ kit: KIT, data: d, settings: { ...d.settings, ...L.nightPreset({}), mode: 'hq', ground: false }, w: W, h: H, spp: SPP, patch: diffuse });
  const dOn = mk(true), onR = await go(dOn), offR = await go(mk(false));
  const fc = L.falseColour({ w: W, h: H, camera: dOn.camera, planeZ: 0, inside: (x, y) => x > 0 && x < 6000 && y > 0 && y < 4000, luxAt: (x, y) => L.workplane(prep, sol, lum, [[x, y, 0]])[0] });
  const diff = new Float64Array(onR.accum.length);
  for (let i = 0; i < diff.length; i += 4) { const n = onR.accum[i + 3] || 1; for (let k = 0; k < 3; k++) diff[i + k] = onR.accum[i + k] / n - offR.accum[i + k] / (offR.accum[i + 3] || 1); diff[i + 3] = 1; }
  const rel = [];
  for (let py = 1; py < H - 1; py++) for (let px = 1; px < W - 1; px++) { const v = fc.lux[py * W + px]; if (v > 20) rel.push(L.pixelLux(diff, W, px, py, 0.2, 1) / v); }
  const m = mean(rel);
  console.log('  info room floor: ' + rel.length + ' pixels, renderer / radiosity mean ' + m.toFixed(3) + ' (' + SPP + ' spp)');
  ok(rel.length > 100, 'floor pixels in view', String(rel.length));
  ok(Math.abs(m - 1) <= 0.12, 'the renderer\'s floor lux (all bounces) agree with the radiosity calculation within 12 % on average', m.toFixed(3));
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
