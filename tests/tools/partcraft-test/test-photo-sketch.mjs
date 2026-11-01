#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-photo-sketch.mjs — 0.8 EG.38: photo to sketch (photo-sketch.js) on pictures drawn by the test, so every answer is known:
 *   - a 400 × 250 px plate with 30 px rounded corners and a Ø80 px hole on a 600 × 400 background, "100 mm wide": 4 lines, 4 arcs, 1 circle;
 *     100 × 62.5 mm, corner radius 7.5 mm, hole Ø20 mm at (37.5, 31.25); lines exactly horizontal and vertical; every outline closed
 *   - the sketch built from it and extruded 10 mm by the mesh kernel: volume = (100·62.5 − (4 − π)·7.5² − π·10²)·10 within 1 %
 *   - a polygon (L-shape with a 60° cut): the cut keeps its angle within 1.5°; a disc is one circle; light on dark is turned over by itself
 *   - noise and a shadow across the picture, the object cut by the picture's edge, a blank picture, no scale given: each says what it found
 *   - pen lines (trace): a rectangle and a circle drawn 5 px thick come back as 4 lines and arcs at the scale
 *   - the outline follower and the fits on their own: a 3 × 3 square, a square with a hole, an exact circle, an exact line
 *   node tools/partcraft-test/test-photo-sketch.mjs [--verbose]    (or runPhotoSketchTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runPhotoSketchTests({ ok, section, M }) {
  await import(path.join(HERE, 'fixtures.mjs'));
  const [PS, P, K] = await Promise.all(['photo-sketch.js', 'part.js', 'kernel.js'].map((f) => import(DEV + f)));
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const picture = (W, H, ground, fn, ink = 30) => {
    const data = new Uint8Array(W * H * 3).fill(ground);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fn(x + 0.5, y + 0.5)) { const o = (y * W + x) * 3; data[o] = data[o + 1] = data[o + 2] = ink; }
    return { w: W, h: H, channels: 3, data };
  };
  const roundedPlate = (x, y) => { const x0 = 100, y0 = 75, x1 = 500, y1 = 325, r = 30; if (x < x0 || x > x1 || y < y0 || y > y1) return false; const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r; };
  const plate = (x, y) => roundedPlate(x, y) && (x - 250) ** 2 + (y - 200) ** 2 > 40 * 40;
  const ends = (e) => (e.type === 'line' ? [e.a, e.b] : e.type === 'arc' ? [e.s, e.e] : []);
  const meet = (e, f) => ends(e).some((p) => ends(f).some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.06));
  const closed = (r) => r.loops.every((L) => L.length === 1 || L.every((i, k) => meet(r.entities[i], r.entities[L[(k + 1) % L.length]])));

  section('EG.38 photo to sketch: a plate with rounded corners and a hole');
  {
    const r = PS.photoToSketch(picture(600, 400, 235, plate), { known: { of: 'width', mm: 100 } });
    const by = (t) => r.entities.filter((e) => e.type === t);
    ok(r.found && r.problems.length === 0 && r.scaled && near(r.mmPerPx, 0.25, 1e-9), 'found, at 100 mm for the 400 px width: 0.25 mm per pixel');
    ok(by('line').length === 4 && by('arc').length === 4 && by('circle').length === 1 && r.loops.length === 2, '4 lines, 4 arcs, 1 circle in two outlines (the plate and the hole)');
    ok(near(r.size.w, 100, 0.25) && near(r.size.h, 62.5, 0.25), `size ${r.size.w.toFixed(2)} × ${r.size.h.toFixed(2)} mm (100 × 62.5)`);
    const c = by('circle')[0];
    ok(near(c.r, 10, 0.2) && near(c.c[0], 37.5, 0.2) && near(c.c[1], 31.25, 0.2), `hole Ø${(2 * c.r).toFixed(2)} mm at (${c.c[0].toFixed(2)}, ${c.c[1].toFixed(2)}) — Ø20 at (37.5, 31.25)`);
    const rs = by('arc').map((a) => a.r);
    ok(rs.every((v) => near(v, 7.5, 0.4)), `corner radii ${rs.map((v) => v.toFixed(2)).join(', ')} mm (7.5; within 5 %, about a pixel and a half)`);
    ok(by('line').every((l) => l.a[0] === l.b[0] || l.a[1] === l.b[1]), 'the lines are exactly horizontal or vertical');
    ok(closed(r), 'every outline is closed: each piece starts where the last ended');
    ok(r.entities.every((e) => (e.type === 'arc' ? [e.s, e.e, e.c] : e.type === 'line' ? [e.a, e.b] : [e.c]).every((p) => p[0] >= -0.3 && p[1] >= -0.3 && p[0] <= 100.3 && p[1] <= 62.8)), 'everything lies inside the box, the lower-left corner at the origin (y up)');
    // a sketch from it, extruded by the kernel
    const sk = PS.sketchFromEntities(r.entities, r.loops);
    const part = P.newPart('Plate');
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
    const reg = K.regenerate(part, M);
    const hand = (100 * 62.5 - (4 - Math.PI) * 7.5 ** 2 - Math.PI * 10 ** 2) * 10;
    ok(reg.stats.volume > 0 && Math.abs(reg.stats.volume / hand - 1) < 0.01, `extruded 10 mm: volume ${reg.stats.volume.toFixed(0)} mm³ vs the hand figure ${hand.toFixed(0)} (${(100 * (reg.stats.volume / hand - 1)).toFixed(2)} %)`);
  }

  section('EG.38 photo to sketch: other shapes and lighting');
  {
    // an L with a 60° cut: vertices (px) (100,50) (400,50) (400,150) (250,150) (250,350) (100,350); cut the lower-right corner of the foot by a line at 60°
    const poly = [[100, 50], [400, 50], [400, 150], [250, 150], [250, 280], [200, 350], [100, 350]];
    const inPoly = (x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    const r = PS.photoToSketch(picture(500, 400, 240, inPoly), { known: { of: 'width', mm: 150 } });
    const lines = r.entities.filter((e) => e.type === 'line');
    ok(r.found && lines.length === 7 && r.entities.length === 7 && closed(r), `an L with a cut: 7 lines, no arcs, closed (${lines.length} lines, ${r.entities.length} pieces)`);
    const cut = lines.find((l) => l.a[0] !== l.b[0] && l.a[1] !== l.b[1]);
    const ang = Math.abs(Math.atan2(cut.b[1] - cut.a[1], cut.b[0] - cut.a[0])) * 180 / Math.PI;
    const want = Math.atan2(70, 50) * 180 / Math.PI;   // the cut runs 50 px across and 70 down
    ok(cut && (near(ang, want, 1.5) || near(180 - ang, want, 1.5)), `the cut keeps its angle: ${Math.min(ang, 180 - ang).toFixed(2)}° (${want.toFixed(2)}°)`);
    ok(near(r.size.w, 150, 0.3) && near(r.size.h, 150, 0.4), 'size 150 × 150 mm');
    const disc = PS.photoToSketch(picture(400, 400, 235, (x, y) => (x - 200) ** 2 + (y - 190) ** 2 <= 120 * 120), { known: { of: 'width', mm: 60 } });
    ok(disc.entities.length === 1 && disc.entities[0].type === 'circle' && near(disc.entities[0].r, 30, 0.15), `a disc is one circle: r ${disc.entities[0] && disc.entities[0].r.toFixed(3)} mm (30)`);
    const light = PS.photoToSketch(picture(600, 400, 20, plate, 230), { known: { of: 'width', mm: 100 } });
    ok(light.found && light.report.inverted && light.entities.length === 9 && near(light.size.w, 100, 0.25), 'a light plate on a dark ground is turned over by itself: the same nine pieces');
    // noise (seeded) and a shadow across the picture
    let seed = 42; const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const noisy = picture(600, 400, 235, plate);
    for (let y = 0; y < 400; y++) for (let x = 0; x < 600; x++) for (let c = 0; c < 3; c++) { const o = (y * 600 + x) * 3 + c; noisy.data[o] = Math.max(0, Math.min(255, noisy.data[o] + (rnd() - 0.5) * 36 - (x / 600) * 50)); }
    const rn = PS.photoToSketch(noisy, { known: { of: 'width', mm: 100 } });
    ok(rn.found && near(rn.size.w, 100, 0.5) && near(rn.size.h, 62.5, 0.6) && rn.entities.filter((e) => e.type === 'circle').length === 1, `noise ±18 grey levels and a shadow of 50 across the picture: still ${rn.size.w.toFixed(2)} × ${rn.size.h.toFixed(2)} mm and the hole`);
  }

  section('EG.38 photo to sketch: what it cannot tell');
  {
    const cut = PS.photoToSketch(picture(300, 300, 235, (x, y) => x < 220 && y > 80 && y < 220), { known: { of: 'width', mm: 50 } });
    ok(cut.found && cut.problems.some((p) => /edge of the picture/.test(p)), 'an object cut by the picture\'s edge is traced, with a problem that says its outline is cut off');
    const blank = PS.photoToSketch(picture(300, 300, 235, () => false), {});
    ok(!blank.found && blank.problems.some((p) => /No object/.test(p)) && blank.entities.length === 0, 'a blank picture: not found, and it says so');
    const unscaled = PS.photoToSketch(picture(600, 400, 235, plate), {});
    ok(unscaled.found && !unscaled.scaled && unscaled.mmPerPx === 1 && unscaled.problems.some((p) => /in pixels/.test(p)) && near(unscaled.size.w, 400, 1), 'no scale given: the sketch is in pixels (400 wide) and the problem says to give one length');
    ok(!PS.photoToSketch(null).found && !PS.photoToSketch({ w: 1, h: 1, channels: 1, data: new Uint8Array(1) }).found, 'no picture, or a 1-pixel one: not found');
    const byPx = PS.photoToSketch(picture(600, 400, 235, plate), { mmPerPx: 0.5 });
    ok(byPx.scaled && near(byPx.size.w, 200, 0.5), 'mmPerPx 0.5 scales the 400 px plate to 200 mm');
    const tall = PS.photoToSketch(picture(600, 400, 235, plate), { known: { of: 'height', mm: 125 } });
    ok(near(tall.size.h, 125, 0.4) && near(tall.size.w, 200, 0.8), 'known height 125 mm: the 250 px height sets the scale (width 200)');
    const speck = picture(600, 400, 235, (x, y) => plate(x, y) && !((x - 450) ** 2 + (y - 120) ** 2 < 3 * 3));
    const rs = PS.photoToSketch(speck, { known: { of: 'width', mm: 100 } });
    ok(rs.entities.filter((e) => e.type === 'circle').length === 1, 'a 6 px speck of background is not a hole (the smallest hole kept is 0.5 % of the long side)');
  }

  section('EG.38 photo to sketch: pen lines');
  {
    const stroke = (x, y) => {
      const t = 2.5;
      const rect = (Math.abs(x - 100) <= t && y >= 100 - t && y <= 300 + t) || (Math.abs(x - 500) <= t && y >= 100 - t && y <= 300 + t) || (Math.abs(y - 100) <= t && x >= 100 - t && x <= 500 + t) || (Math.abs(y - 300) <= t && x >= 100 - t && x <= 500 + t);
      const circ = Math.abs(Math.hypot(x - 300, y - 200) - 50) <= t;
      return rect || circ;
    };
    const r = PS.photoToSketch(picture(600, 400, 240, stroke), { mode: 'lines', known: { of: 'width', mm: 200 } });
    const L = r.entities.filter((e) => e.type === 'line'), A = r.entities.filter((e) => e.type === 'arc');
    ok(r.found && r.mode === 'lines' && L.length >= 4 && A.length >= 1, `a rectangle and a circle drawn 5 px thick: ${L.length} lines and ${A.length} arcs`);
    ok(near(r.size.w, 200, 3) && near(r.size.h, 100, 3), `${r.size.w.toFixed(1)} × ${r.size.h.toFixed(1)} mm for 400 × 200 px at 200 mm wide`);
    ok(A.every((a) => near(a.r, 25, 1)) && A.every((a) => near(a.c[0], 100, 1.5) && near(a.c[1], 50, 1.5)), 'the circle: radius 25 mm about (100, 50)');
    ok(!PS.photoToSketch(picture(300, 300, 240, () => false), { mode: 'lines' }).found, 'a blank page: no lines found');
  }

  section('EG.38 photo to sketch: the outline follower and the fits');
  {
    const sq = new Uint8Array(25); for (const [x, y] of [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [1, 3], [2, 3], [3, 3]]) sq[y * 5 + x] = 1;
    const o = PS.outlines(sq, 5, 5);
    ok(o.length === 1 && o[0].length === 12 && Math.abs(Math.abs(o[0].reduce((a, p, i, P) => a + p[0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * p[1], 0) / 2) - 9) < 1e-9, 'a 3 × 3 square: one outline, 12 unit edges, area 9');
    const ring = new Uint8Array(49); for (let y = 1; y < 6; y++) for (let x = 1; x < 6; x++) ring[y * 7 + x] = 1; ring[3 * 7 + 3] = 0;
    const o2 = PS.outlines(ring, 7, 7), signed = o2.map((L) => L.reduce((a, p, i) => a + p[0] * L[(i + 1) % L.length][1] - L[(i + 1) % L.length][0] * p[1], 0) / 2);
    ok(o2.length === 2 && signed.filter((a) => a > 0).length === 1 && signed.filter((a) => a < 0).length === 1 && Math.abs(signed.find((a) => a > 0)) === 25 && Math.abs(signed.find((a) => a < 0)) === 1, 'a square with a hole: the outer outline clockwise (25), the hole the other way (1)');
    const diag = new Uint8Array(16); diag[1 * 4 + 1] = 1; diag[2 * 4 + 2] = 1;
    ok(PS.outlines(diag, 4, 4).length === 1, 'two pixels touching at a corner are one piece (8-connected)');
    const circ = Array.from({ length: 90 }, (_, i) => [50 + 20 * Math.cos(i * 4 * Math.PI / 180), 30 + 20 * Math.sin(i * 4 * Math.PI / 180)]);
    const cf = PS.fitCircle(circ);
    ok(near(cf.c[0], 50, 1e-9) && near(cf.c[1], 30, 1e-9) && near(cf.r, 20, 1e-9) && cf.max < 1e-9, 'an exact circle is recovered exactly');
    const lf = PS.fitLine([[0, 0], [10, 5], [20, 10], [30, 15]]);
    ok(near(Math.abs(lf.d[1] / lf.d[0]), 0.5, 1e-9) && lf.max < 1e-9, 'an exact line is recovered exactly');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const H = await import(path.join(REPO, 'tools/cli/headless/part.mjs'));
  const M = (await H.partModules()).man;
  await runPhotoSketchTests({ ok, section: (m) => { if (VERBOSE) console.log(m); }, M });
  console.log(`photo to sketch: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
