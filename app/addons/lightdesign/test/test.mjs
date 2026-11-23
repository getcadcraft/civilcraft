/* SPDX-License-Identifier: Apache-2.0 */
// Interior lighting design engine tests (0.9 LD): node lib/lightdesign/test/test.mjs   (run from any folder; imports the engine next to it)
import * as L from '../lib/index.js';
import path from 'node:path';
import fs from 'node:fs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, m + ' (' + a + ' vs ' + b + ', tol ' + tol + ')');
const rel = (a, b, r, m) => ok(Math.abs(a - b) <= r * Math.abs(b), m + ' (' + a + ' vs ' + b + ', ' + (100 * Math.abs(a - b) / Math.abs(b)).toFixed(2) + ' %)');
const room = (o = {}) => ({ polygon: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], height: 2800, workplane: 800, margin: 500, refl: { ceiling: 0.7, walls: 0.5, floor: 0.2 }, ...o });

// ---- generic luminaires: the flux of the synthetic distribution is the lumens it says
for (const id of L.GENERIC_IDS) {
  const p = L.genericPhoto(id); let flux = 0; const dg = 0.05;
  for (let g = dg / 2; g < 90; g += dg) flux += L.candela(p, g, 0) * Math.sin(g * Math.PI / 180) * (dg * Math.PI / 180) * 2 * Math.PI;
  rel(flux, p.lumens, 0.01, id + ': integrated flux = lumens');
}

// ---- no reflection: the answer is the photometry's own direct calculation
{
  const photo = L.genericPhoto('downlight'), lum = [{ photo, p: [3000, 2000, 2800] }];
  const r = L.runRoom({ room: room({ refl: { ceiling: 0, walls: 0, floor: 0 } }), luminaires: lum, llf: 1 });
  const d = L.computeGrid({ luminaires: [{ photo, p: [3000, 2000, 2800] }], polygon: room().polygon, spacing: r.grid.spacing, height: 800, margin: 500, llf: 1 });
  rel(r.em, d.stats.avg, 1e-6, 'rho 0 equals the direct grid, mean');
  rel(r.emin, d.stats.min, 1e-6, 'rho 0 equals the direct grid, minimum');
  near(r.directShare, 1, 1e-9, 'rho 0: all of it direct');
  // inverse square cosine law by hand: 1000 lm Lambertian-like point straight above
  const cd = L.genericPhoto('panel'); const Ih = cd.maxCd, h = 2;   // panel n = 1: I(0) = lumens · 2 / (2π)
  near(L.illuminanceAt([{ photo: cd, p: [0, 0, 2000] }], [0, 0, 0], [0, 0, 1], 1), Ih / (h * h), 1e-6, 'E straight below = I / d²');
}

// ---- energy conservation: every lumen the luminaires send into a closed room is absorbed by some surface
for (const [name, poly] of [['rectangle', room().polygon], ['L shape', [[0, 0], [8000, 0], [8000, 3000], [3500, 3000], [3500, 7000], [0, 7000]]], ['clockwise', room().polygon.slice().reverse()]]) {
  const photo = L.genericPhoto('panel'), rm = room({ polygon: poly });
  const bb = L.bbox(poly), lum = L.gridLayout(rm, photo, 3, 3).luminaires;
  const prep = L.prepare(rm), sol = L.solve(prep, lum);
  let absorbed = 0; prep.patches.forEach((p, i) => { absorbed += p.a * (1 - p.rho) * sol.E[i]; });
  const flux = lum.length * photo.lumens;
  rel(absorbed, flux, 0.03, name + ': absorbed flux = emitted flux');
  let direct = 0; prep.patches.forEach((p, i) => { direct += p.a * sol.E0[i]; });
  rel(direct, flux, 0.03, name + ': direct flux on the patches = emitted flux');
  near(prep.patches.filter((p) => p.kind === 'floor').reduce((s, p) => s + p.a, 0), L.polyArea(poly), 1e-6, name + ': patch areas add up to the floor area');
}
{
  const r = room({ refl: { ceiling: 0.9, walls: 0.9, floor: 0.9 } });
  const photo = L.genericPhoto('panel'), lum = L.gridLayout(r, photo, 2, 2).luminaires, prep = L.prepare(r), sol = L.solve(prep, lum);
  let area = 0, sum = 0; prep.patches.forEach((p, i) => { area += p.a; sum += p.a * sol.E[i]; });
  rel(sum / area, lum.length * photo.lumens / (area * (1 - 0.9)), 0.03, 'uniform rho 0.9: mean irradiance = flux / (area · (1 - rho))');
}

// ---- reflection helps, more reflection helps more
{
  const photo = L.genericPhoto('panel'), lum = (r) => L.gridLayout(r, photo, 3, 2).luminaires;
  const em = (refl) => { const r = room({ refl }); return L.runRoom({ room: r, luminaires: lum(r), llf: 1 }).em; };
  const e0 = em({ ceiling: 0, walls: 0, floor: 0 }), e1 = em({ ceiling: 0.7, walls: 0.5, floor: 0.2 }), e2 = em({ ceiling: 0.8, walls: 0.7, floor: 0.3 });
  ok(e0 < e1 && e1 < e2, 'mean lux rises with reflectance: ' + [e0, e1, e2].map((x) => x.toFixed(0)).join(' < '));
  ok(e1 / e0 > 1.1 && e1 / e0 < 2, 'a light room adds 10 % to 100 % over direct only (' + (e1 / e0).toFixed(2) + ')');
}

// ---- independent check: a Monte Carlo photon trace of the same box room (diffuse bounces, nothing shared with the radiosity code) gives the same mean lux on the workplane
{
  let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const W = 6, D = 4, H = 2.8, wp = 0.8, m = 0.5, rf = { ceiling: 0.7, walls: 0.5, floor: 0.2 };
  const photo = L.genericPhoto('panel'), lum = L.gridLayout(room(), photo, 3, 2).luminaires;       // n = 1: I ∝ cos γ, i.e. cosine-weighted emission
  const N = 600000, area = (W - 2 * m) * (D - 2 * m); let crossed = 0;
  const cosDir = () => { const u = rnd(), a = 2 * Math.PI * rnd(), r = Math.sqrt(u); return [r * Math.cos(a), r * Math.sin(a), Math.sqrt(1 - u)]; };
  for (let k = 0; k < N; k++) {
    const l = lum[k % lum.length]; let x = l.p[0] / 1000, y = l.p[1] / 1000, z = H - 1e-6, d = cosDir(); d = [d[0], d[1], -d[2]];
    for (let bounce = 0; bounce < 60; bounce++) {
      // distance to the box faces
      let tmin = Infinity, face = '';
      const tryT = (t, f) => { if (t > 1e-9 && t < tmin) { tmin = t; face = f; } };
      if (d[0] > 0) tryT((W - x) / d[0], 'x1'); if (d[0] < 0) tryT(-x / d[0], 'x0');
      if (d[1] > 0) tryT((D - y) / d[1], 'y1'); if (d[1] < 0) tryT(-y / d[1], 'y0');
      if (d[2] > 0) tryT((H - z) / d[2], 'z1'); if (d[2] < 0) tryT(-z / d[2], 'z0');
      // a downward crossing of the workplane inside the border
      if (d[2] < 0 && z > wp && z + d[2] * tmin <= wp) { const t = (wp - z) / d[2], cx = x + d[0] * t, cy = y + d[1] * t; if (cx >= m && cx <= W - m && cy >= m && cy <= D - m) crossed++; }
      x += d[0] * tmin; y += d[1] * tmin; z += d[2] * tmin;
      const rho = face === 'z0' ? rf.floor : face === 'z1' ? rf.ceiling : rf.walls;
      if (rnd() > rho) break;                                                   // absorbed
      const c = cosDir(); const n = { x0: [1, 0, 0], x1: [-1, 0, 0], y0: [0, 1, 0], y1: [0, -1, 0], z0: [0, 0, 1], z1: [0, 0, -1] }[face];
      const t1 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], dotn = t1[0] * n[0] + t1[1] * n[1] + t1[2] * n[2];
      let a = [t1[0] - dotn * n[0], t1[1] - dotn * n[1], t1[2] - dotn * n[2]]; const al = Math.hypot(...a); a = a.map((v) => v / al);
      const b = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]];
      d = [c[0] * a[0] + c[1] * b[0] + c[2] * n[0], c[0] * a[1] + c[1] * b[1] + c[2] * n[1], c[0] * a[2] + c[1] * b[2] + c[2] * n[2]];
      z = Math.min(Math.max(z, 1e-9), H - 1e-9); x = Math.min(Math.max(x, 1e-9), W - 1e-9); y = Math.min(Math.max(y, 1e-9), D - 1e-9);
    }
  }
  const mc = (crossed / N) * (lum.length * photo.lumens) / area;
  const res = L.runRoom({ room: room(), luminaires: lum, llf: 1, spacing: 200 });
  rel(res.em, mc, 0.04, 'radiosity mean on the workplane = Monte Carlo photon trace (' + res.em.toFixed(1) + ' vs ' + mc.toFixed(1) + ' lx)');
}

// ---- the workplane just above the floor matches the floor patches' mean (two different code paths)
{
  const photo = L.genericPhoto('panel'), r = room({ workplane: 5, margin: 0 }), lum = L.gridLayout(r, photo, 3, 2).luminaires;
  const res = L.runRoom({ room: r, luminaires: lum, llf: 1, spacing: 250 });
  rel(res.em, res.surfaces.floor, 0.06, 'workplane at the floor = floor patches mean');
}

// ---- symmetry
{
  const photo = L.genericPhoto('downlight'), lum = [{ photo, p: [3000, 2000, 2800] }], r = L.runRoom({ room: room(), luminaires: lum, llf: 1, spacing: 500 });
  const at = (x, y) => r.grid.values[r.grid.points.findIndex((p) => Math.abs(p[0] - x) < 1 && Math.abs(p[1] - y) < 1)];
  const a = at(r.grid.points[0][0], r.grid.points[0][1]), b = at(6000 - r.grid.points[0][0], 4000 - r.grid.points[0][1]);
  near(a, b, 1e-6 * a, 'a centred luminaire lights opposite corners alike');
  ok(r.stats.max > r.stats.min * 1.5, 'one downlight in a room is clearly uneven');
}

// ---- maintenance factor scales every lux
{
  const photo = L.genericPhoto('panel'), lum = L.gridLayout(room(), photo, 3, 2).luminaires;
  const a = L.runRoom({ room: room(), luminaires: lum, llf: 1 }), b = L.runRoom({ room: room(), luminaires: lum, llf: 0.8 });
  rel(b.em, a.em * 0.8, 1e-9, 'llf 0.8 gives 80 % of the lux'); rel(b.surfaces.walls, a.surfaces.walls * 0.8, 1e-9, 'llf scales the walls too');
}

// ---- planning
{
  const photo = L.genericPhoto('panel'), p = L.planLayout({ room: room(), photo, targetLux: 500, llf: 0.8, uo: 0.6 });
  ok(p.ok && p.em >= 500 && p.uo >= 0.6, 'plan reaches 500 lx and Uo 0.6 with ' + p.count + ' panels');
  const full = L.runRoom({ room: room(), luminaires: p.luminaires, llf: 0.8 });
  rel(full.em, p.em, 0.05, 'the planning figure agrees with the full run');
  ok(p.count <= 9, 'a 6 × 4 m office needs a sensible number of 600 panels (' + p.count + ')');
  const q = L.planLayout({ room: room(), photo, targetLux: 100000, llf: 0.8, maxCount: 20 });
  ok(!q.ok, 'an impossible target is reported, not faked');
  ok(!L.planLayout({ room: room(), photo, targetLux: 0 }).ok, 'no target, no plan');
  const rows = L.rowLayout(room(), L.genericPhoto('batten'), 3, 4);
  ok(rows.luminaires.length === 12 && rows.luminaires.every((l) => l.p[0] > 0 && l.p[0] < 6000 && l.p[1] > 0 && l.p[1] < 4000), 'row layout stays inside the room');
}

// ---- glare
{
  near(L.positionIndex(0, 0), 1, 1e-9, 'position index on the line of sight is 1');
  near(L.positionIndex(30, 0), 3.35, 0.02, 'position index 30° above the line of sight (Einhorn) is 3.35');
  ok(L.positionIndex(30, 45) < L.positionIndex(30, 0), 'a source out of the vertical plane glares less');
  const photo = L.genericPhoto('panel'), mk = (scale) => { const r = room(), lum = L.gridLayout(r, photo, 3, 2).luminaires.map((l) => ({ ...l, scale })); return L.runDesign({ room: r, luminaires: lum, llf: 1 }); };
  const a = mk(1), b = mk(2);
  ok(a.ugr > 10 && a.ugr < 30, 'a 6 × 4 m office with 600 panels is between UGR 10 and 30 (' + a.ugr + ')');
  near(b.ugr - a.ugr, 8 * Math.log10(2), 0.15, 'doubling the flux adds 8 · log10 2 to UGR');
  ok(a.observers.length === 4, 'four observers');
  const small = L.genericPhoto('downlight'), r2 = room(), l2 = L.gridLayout(r2, small, 4, 3).luminaires;
  ok(Number.isFinite(L.runDesign({ room: r2, luminaires: l2, llf: 0.8 }).ugr), 'downlights give a UGR');
}

// ---- requirements
{
  const photo = L.genericPhoto('panel'), lum = L.gridLayout(room(), photo, 3, 2).luminaires;
  const res = L.runDesign({ room: room(), luminaires: lum, llf: 0.8, requirements: { em: 300, uo: 0.6, ugr: 28, ra: 80, lpd: 20 } });
  ok(res.checks.length === 5 && res.checks.every((c) => c.ok), 'a lit office meets lenient requirements');
  const res2 = L.runDesign({ room: room(), luminaires: lum, llf: 0.8, requirements: { em: 5000 } });
  ok(res2.checks.length === 1 && !res2.checks[0].ok, 'it fails 5000 lx and says so');
  ok(L.PRESETS.length >= 12 && L.PRESETS.every((p) => p.em > 0 && p.uo > 0 && p.ugr > 0 && p.ra > 0) && L.presetById('office.writing').em === 500, 'presets are complete');
}

// ---- bad input is refused in words
for (const [m, rm] of [['two points', { polygon: [[0, 0], [1000, 0]] }], ['a point', { polygon: [[0, 0], [0, 0], [0, 0]] }], ['height', room({ height: 100 })], ['workplane above ceiling', room({ workplane: 3000 })], ['NaN polygon', { polygon: [[0, 0], [NaN, 1], [3, 4]] }]]) {
  let key = ''; try { L.cleanRoom(rm); } catch (e) { key = e.key || 'x'; }
  ok(key.startsWith('err.'), 'refuses ' + m + ' (' + key + ')');
}
{ let key = ''; try { L.runRoom({ room: room(), luminaires: [] }); } catch (e) { key = e.key; } ok(key === 'err.noluminaires', 'no luminaires is refused'); }
{
  const r = L.cleanRoom(room({ refl: { ceiling: 5, walls: -1, floor: 'x' } }));
  ok(r.refl.ceiling < 1 && r.refl.walls === 0 && r.refl.floor === 0.2, 'reflectances are kept inside 0..0.99');
}

// ---- a real file through the whole path: IES text -> luminaire -> result
{
  const ies = ['IESNA:LM-63-2002', '[TEST] unit', '[LUMINAIRE] Test downlight', 'TILT=NONE', '1 1000 1 7 1 1 2 0.15 0.15 0 1 1 12', '0 15 30 45 60 75 90', '0', '1000 900 700 450 200 50 0'].join('\n');
  const pr = L.parsePhotometry(ies, 'x.ies');
  ok(pr.ok && pr.photo.lumens === 1000, 'IES text parses');
  if (pr.ok) { const r = room(), lum = L.gridLayout(r, pr.photo, 3, 2).luminaires, res = L.runDesign({ room: r, luminaires: lum, llf: 0.8 }); ok(res.em > 100 && res.em < 2000 && Number.isFinite(res.ugr), 'a file-based design runs (' + res.em.toFixed(0) + ' lx)'); }
}

// ---- reports
{
  const photo = L.genericPhoto('panel'), lum = L.gridLayout(room(), photo, 3, 2).luminaires, res = L.runDesign({ room: room(), luminaires: lum, llf: 0.8, requirements: { em: 500 } });
  res.luminaires = lum;
  const html = L.reportHtml(res, { title: '<script>alert(1)</script>', project: 'a & b', luminaireNames: ['"x" panel'] }), csv = L.reportCsv(res, { title: '=HYPERLINK("x")' });
  ok(!html.includes('<script>') && html.includes('&lt;script&gt;'), 'report escapes the title');
  ok(html.startsWith('<!doctype html>') && html.includes('<svg') && html.includes('rep.em'), 'report is a page with a map');
  ok(csv.split('\n')[0].includes("'=HYPERLINK") && csv.includes('x_mm,y_mm,z_mm,lux'), 'CSV guards a formula-looking title and lists the grid');
  ok(L.scaleColor(0, 100) !== L.scaleColor(100, 100) && /^#[0-9a-f]{6}$/.test(L.scaleColor(50, 100)), 'colour scale');
}

// ---- time: a 12 × 8 m hall with 24 luminaires inside a second
{
  const r = room({ polygon: [[0, 0], [12000, 0], [12000, 8000], [0, 8000]], height: 4000 }), photo = L.genericPhoto('highbay'), lum = L.gridLayout(r, photo, 6, 4).luminaires;
  const t0 = Date.now(); const res = L.runDesign({ room: r, luminaires: lum, llf: 0.8 }); const ms = Date.now() - t0;
  ok(ms < 3000 && res.patches <= 1400, 'hall of 24 luminaires solved in ' + ms + ' ms with ' + res.patches + ' patches');
}

// ---- the photometry file is the BimCraft one, byte for byte (tools/lightdesign/sync.mjs keeps it so)
{
  const here = path.dirname(new URL(import.meta.url).pathname), canon = path.resolve(here, '../../../public_html/assets/apps/bimcraft/dev/mep/photometry.js');
  if (fs.existsSync(canon)) ok(fs.readFileSync(canon).equals(fs.readFileSync(path.join(here, '../lib/photometry.js'))), 'lib/photometry.js is the BimCraft mep copy');
}

// ---- IL.7 obstruction: a partition between a luminaire and a point blocks the direct light, and only that
{
  const b = { x0: 2500, y0: -1000, x1: 2600, y1: 9000, z0: 0, z1: 2800 };
  ok(L.segmentHitsBox([0, 0, 1000], [5000, 0, 1000], b), 'a segment through a box is blocked');
  ok(!L.segmentHitsBox([0, 0, 1000], [2000, 0, 1000], b), 'a segment that stops short is free');
  ok(!L.segmentHitsBox([0, 0, 3000], [5000, 0, 3000], b), 'a segment over the top is free');
  ok(!L.segmentHitsBox([2600, 0, 0], [5000, 0, 1000], b), 'a segment that only leaves a face is free (a touch is not a hit)');
  ok(!L.segmentHitsBox([2600, 0, 1000], [2600, 5000, 1000], b), 'a segment along a face is free');
  ok(L.cleanObstacles([{ x0: 5, y0: 5, x1: 0, y1: 0, z0: 0, z1: 100 }, { x0: 0, y0: 0, x1: 0, y1: 5, z0: 0, z1: 5 }, null, { x0: 'a' }]).length === 1, 'cleanObstacles keeps one real box, orders corners, drops flat and bad ones');
  const photo = L.genericPhoto('panel'), rm = room({ refl: { ceiling: 0, walls: 0, floor: 0 } }), lum = [{ photo, p: [1000, 2000, 2800] }];
  const wall = [{ x0: 2500, y0: -100, x1: 2600, y1: 4100, z0: 0, z1: 2800 }];
  const free = L.runRoom({ room: rm, luminaires: lum, llf: 1 }), cut = L.runRoom({ room: rm, luminaires: lum, llf: 1, obstacles: wall });
  const behind = cut.grid.points.map((p, i) => [p, cut.grid.values[i]]).filter(([p]) => p[0] > 2700);
  ok(behind.length > 5 && behind.every(([, v]) => v < 1e-9), 'with no bounced light the points behind a full-height partition get no direct light (' + behind.length + ' points)');
  const front = cut.grid.points.map((p, i) => [i, p]).filter(([, p]) => p[0] < 2400);
  ok(front.every(([i]) => Math.abs(cut.grid.values[i] - free.grid.values[free.grid.points.findIndex((q) => q[0] === cut.grid.points[i][0] && q[1] === cut.grid.points[i][1])]) < 1e-9), 'points in front of the partition are unchanged');
  ok(cut.em < free.em && cut.emin <= free.emin, 'the partition lowers the mean');
  const rm2 = room(), a = L.runRoom({ room: rm2, luminaires: lum, llf: 1 }), c = L.runRoom({ room: rm2, luminaires: lum, llf: 1, obstacles: wall });
  ok(c.em < a.em && c.em > 0, 'with bounced light the dark side is lit by the walls: lower but not zero');
  const col = L.runRoom({ room: rm, luminaires: lum, llf: 1, obstacles: [{ x0: 2500, y0: 1000, x1: 4000, y1: 3000, z0: 0, z1: 2800 }] });
  ok(col.excluded > 0 && col.grid.points.length + col.excluded === free.grid.points.length, 'points inside a column are left out of the statistics (' + col.excluded + ')');
  const desk = L.runRoom({ room: rm, luminaires: lum, llf: 1, obstacles: [{ x0: 2500, y0: 1000, x1: 4000, y1: 3000, z0: 0, z1: 740 }] });
  ok(desk.excluded === 0, 'a desk below the work plane does not remove points');
}

// ---- IL.7 daylight: the sky law, then the room
{
  const eext = 10000, lz = L.lzOf(eext);
  near(eext, 7 * Math.PI / 9 * lz, 1e-6, 'Eext = 7π/9 · Lz');
  // a roof light that covers the whole sky above the point: 100 % of Eext (T = 1)
  const h = 1000, cells = [];
  const NR = 1800, NS = 8;
  for (let i = 0; i < NR; i++) {
    const th1 = (89.9 * i / NR) * Math.PI / 180, th2 = (89.9 * (i + 1) / NR) * Math.PI / 180, r1 = h * Math.tan(th1), r2 = h * Math.tan(th2), rm = (r1 + r2) / 2, ar = Math.PI * (r2 * r2 - r1 * r1) / 1e6 / NS;
    for (let j = 0; j < NS; j++) { const ph = (j + 0.5) * 2 * Math.PI / NS; cells.push({ c: [rm * Math.cos(ph), rm * Math.sin(ph), h], n: [0, 0, 1], a: ar }); }
  }
  rel(L.skyIlluminance(cells, [0, 0, 0], [0, 0, 1], lz, 1), eext, 0.005, 'an unobstructed sky overhead gives Eext on a horizontal plane');
  rel(L.skyIlluminance(cells, [0, 0, 0], [0, 0, 1], lz, 0.7), 0.7 * eext, 0.005, 'glass transmittance 0.7 scales it');
  // an infinite vertical window in front of the point: it sees the half of the sky in front, which is exactly half of Eext on a horizontal plane
  const d = 1000, v = [], NA = 360, NB = 180;
  for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) {
    const ph = (-90 + (i + 0.5) * 180 / NA) * Math.PI / 180, ga = ((j + 0.5) * 90 / NB) * Math.PI / 180, ux = Math.cos(ga) * Math.cos(ph), s = d / ux / 1000;   // m
    const dO = Math.cos(ga) * (Math.PI / NA) * (Math.PI / 2 / NB), area = s * s * dO / ux;
    v.push({ c: [d, Math.cos(ga) * Math.sin(ph) * s * 1000, Math.sin(ga) * s * 1000], n: [1, 0, 0], a: area });
  }
  rel(L.skyIlluminance(v, [0, 0, 0], [0, 0, 1], lz, 1), eext / 2, 0.01, 'an infinite vertical window lets in half of Eext on a horizontal plane');
  // and on a vertical plane facing it: Ev = 2 (Lz/3)(π/4 + 2/3), worked by hand = 0.3963 Eext (the CIE overcast sky, no ground)
  const Ev = 2 * (lz / 3) * (Math.PI / 4 + 2 / 3);
  rel(L.skyIlluminance(v, [0, 0, 0], [1, 0, 0], lz, 1), Ev, 0.01, 'vertical illuminance on a plane facing the sky = 2(Lz/3)(π/4 + 2/3)');
  near(Ev / eext, 0.3963, 0.001, 'which is 0.396 of Eext');

  // a room with one window
  const rm = room(), win = [{ edge: 0, from: 1000, width: 3000, sill: 900, head: 2200, t: 0.7 }];
  const day = L.runDaylight({ room: rm, windows: win, eext });
  const Awin = 3 * 1.3;
  rel(day.windowArea, Awin, 1e-9, 'window area');
  rel(day.flux, 0.7 * Ev * Awin, 0.04, 'flux conservation: the lumens that reach the room surfaces = T · Ev · window area (' + day.flux.toFixed(0) + ' lm)');
  const nearW = day.grid.points.map((p, i) => [p[1], day.grid.values[i]]).sort((a, b) => a[0] - b[0]);
  ok(nearW[0][1] > nearW[nearW.length - 1][1] * 2, 'daylight falls away from the window (' + nearW[0][1].toFixed(2) + ' % near, ' + nearW[nearW.length - 1][1].toFixed(2) + ' % far)');
  ok(day.dfAvg > 0 && day.dfAvg < 100 && day.dfMin < day.dfAvg && day.dfAvg < day.dfMax, 'DF avg ' + day.dfAvg.toFixed(2) + ' % between min ' + day.dfMin.toFixed(2) + ' and max ' + day.dfMax.toFixed(2));
  const wide = L.runDaylight({ room: rm, windows: [{ edge: 0, from: 500, width: 5000, sill: 900, head: 2200, t: 0.7 }], eext });
  ok(wide.dfAvg > day.dfAvg, 'a wider window gives more daylight');
  const dark = L.runDaylight({ room: room({ refl: { ceiling: 0, walls: 0, floor: 0 } }), windows: win, eext });
  ok(dark.dfAvg < day.dfAvg && dark.directShare > 0.999, 'with no reflection only the sky component is left (all direct)');
  const lowT = L.runDaylight({ room: rm, windows: [{ ...win[0], t: 0.35 }], eext });
  rel(lowT.dfAvg, day.dfAvg / 2, 1e-6, 'halving the transmittance halves the factor');
  rel(L.runDaylight({ room: rm, windows: win, eext: 20000 }).dfAvg, day.dfAvg, 1e-9, 'the factor does not depend on the reference illuminance');
  near(L.runDaylight({ room: rm, windows: win, eext: 20000 }).luxAvg, 2 * day.luxAvg, 1e-6, 'but the lux do');
  const cw = L.runDaylight({ room: room({ polygon: rm.polygon.slice().reverse() }), windows: [{ edge: 2, from: 1000, width: 3000, sill: 900, head: 2200, t: 0.7 }], eext });
  rel(cw.flux, day.flux, 0.01, 'a clockwise outline gives the same flux through its matching wall');
  let key = ''; try { L.runDaylight({ room: rm, windows: [], eext }); } catch (e) { key = e.key; }
  ok(key === 'err.nowindows', 'no windows: a clear error key');
  const bad = L.checkWindows(room(), [{ edge: 9, from: 0, width: 1000, sill: 900, head: 2000 }, { edge: 0, from: 5800, width: 1000, sill: 900, head: 2000 }, { edge: 0, from: 0, width: 1000, sill: 900, head: 3500 }, { edge: 0, from: 0, width: 1000, sill: 900, head: 2000, t: 2 }, { edge: 0, from: 0, width: 1000, sill: 900, head: 2000 }]);
  ok(bad.windows.length === 1 && bad.dropped.map((x) => x.key).join() === 'err.win.edge,err.win.fit,err.win.height,err.win.t', 'bad windows are dropped with their reasons: ' + bad.dropped.map((x) => x.key));
  ok(day.shareAbove(0) === 1 && day.shareAbove(1e9) === 0, 'shareAbove');
}

// ---- IL.7 emergency lighting: floor lux under the emergency luminaires, direct light only
{
  const photo = L.genericPhoto('panel'), rm = room(), lum = L.gridLayout(rm, photo, 3, 2).luminaires;
  ok(L.pickEmergency(lum, { every: 2 }).length === 3 && L.pickEmergency(lum, { every: 1 }).length === 6 && L.pickEmergency(lum, { every: 2, offset: 1 }).length === 3, 'every n-th luminaire is on the circuit');
  const one = [{ photo, p: [3000, 2000, 2800] }];
  const r = L.runEmergency({ room: rm, luminaires: one, share: 0.1, route: [[3000, 2000], [3000, 2000]] });
  const Ih = photo.maxCd;
  near(r.route.values[0], 0.1 * Ih / (2.8 * 2.8), 1e-6, 'floor lux straight below = share · I / d²');
  ok(L.routePoints([[0, 0], [1000, 0], [1000, 1000]], 500).length === 5, 'route points every 500 mm along two legs (5 points)');
  const full = L.runEmergency({ room: rm, luminaires: lum, share: 1, route: [[500, 2000], [5500, 2000]] });
  ok(full.checks.length === 3 && full.checks.every((c) => typeof c.ok === 'boolean'), 'three checks: route minimum, route ratio, open area minimum');
  const off = L.runEmergency({ room: rm, luminaires: lum, share: 0.001, route: [[500, 2000], [5500, 2000]] });
  ok(off.checks.some((c) => !c.ok), 'a near-dark emergency output fails a check');
  const blockedE = L.runEmergency({ room: rm, luminaires: one, share: 1, route: [[4500, 2000], [5500, 2000]], openArea: false, obstacles: [{ x0: 3400, y0: -100, x1: 3500, y1: 4100, z0: 0, z1: 2800 }] });
  ok(blockedE.route.max < 1e-9, 'a partition blocks the emergency light too');
  let key = ''; try { L.runEmergency({ room: rm, luminaires: [], share: 1 }); } catch (e) { key = e.key; }
  ok(key === 'err.noemergency', 'no emergency luminaires: error key');
  ok(/UNVERIFIED|not checked/i.test(L.EMERGENCY_NOTE) && /engineer/.test(L.EMERGENCY_NOTE), 'the emergency limits are labelled unverified and waiting for an engineer');
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
