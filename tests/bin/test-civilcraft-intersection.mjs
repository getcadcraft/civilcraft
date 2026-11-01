#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-intersection.mjs — CivilCraft 0.8 EG.10: intersections, striping, signs (intersection.js), DOM-free.
 * Known answers: a 90° corner with radius r has tangent length r, arc length πr/2, and the corner cut-off area r²(1 − π/4); a 60° corner has T = r/tan30°;
 * a 4-leg crossing of two 12 m roads with 9 m returns: pavement area = the cross plus 4 corner fills (r²(1 − π/4)) by hand; ISD 0.278·V·tg (60 km/h, 7.5 s = 125.1 m);
 * a dashed line of 3 m / 9 m over 120 m = 10 dashes = 30 m painted; the double centre line has two lines.
 *   node bin/test-civilcraft-intersection.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const I = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'intersection.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

{   // 90° fillet
  const f = I.cornerFillet({ corner: { x: 0, y: 0 }, dirA: { x: 1, y: 0 }, dirB: { x: 0, y: 1 }, radius: 9 });
  near(f.tangent, 9, 1e-9, '90° tangent = r'); near(f.length, Math.PI * 4.5, 1e-9, '90° arc length'); near(f.centre.x, 9, 1e-9, 'centre x'); near(f.centre.y, 9, 1e-9, 'centre y');
  near(Math.hypot(f.arc[3].x - 9, f.arc[3].y - 9), 9, 1e-9, 'arc on the circle');
  const g = I.cornerFillet({ corner: { x: 0, y: 0 }, dirA: { x: 1, y: 0 }, dirB: { x: Math.cos(Math.PI / 3), y: Math.sin(Math.PI / 3) }, radius: 9 });
  near(g.tangent, 9 / Math.tan(Math.PI / 6), 1e-9, '60° tangent length'); near(g.angle, Math.PI - Math.PI / 3, 1e-9, '60° sweep');
  ok(I.cornerFillet({ corner: { x: 0, y: 0 }, dirA: { x: 1, y: 0 }, dirB: { x: -1, y: 0 }, radius: 9 }) === null, 'a straight line has no fillet');
}
{   // 4-leg crossing
  const hw = 6, legs = [0, 90, 180, 270].map((d, i) => ({ bearing: (d * Math.PI) / 180, halfWidth: hw, length: 40, name: 'L' + i }));
  const r = I.intersection({ centre: { x: 0, y: 0 }, legs, radius: 9 });
  const cross = 4 * 40 * 12 - 4 * hw * hw * 0 - (12 * 12) * 3;   // four arms 40 long measured from the centre, overlapping square counted once
  const byHand = (80 * 12 + 80 * 12 - 144) + 4 * 9 * 9 * (1 - Math.PI / 4);   // the returns round the grass corners, so they ADD pavement
  near(r.area, byHand, 0.5, 'pavement area = cross plus four corner fills'); void cross;
  near(r.curbLength, 4 * Math.PI * 4.5, 1e-6, 'curb return length'); ok(r.problems.length === 0, 'no problems ' + JSON.stringify(r.problems));
  ok(r.corners.length === 4 && r.corners.every((c) => c.fillet), 'four fillets');
  const t = I.intersection({ centre: { x: 0, y: 0 }, legs: [0, 90, 180].map((d) => ({ bearing: (d * Math.PI) / 180, halfWidth: hw, length: 40 })), radius: 9 });
  ok(t.corners.filter((c) => c.fillet).length === 2, 'a T has two returns'); near(t.curbLength, 2 * Math.PI * 4.5, 1e-6, 'T curb length');
  ok(I.intersection({ centre: { x: 0, y: 0 }, legs: [{ bearing: 0, halfWidth: 6, length: 10 }] }).problems[0].code === 'int.legs', 'one leg refused');
  const long = I.intersection({ centre: { x: 0, y: 0 }, legs: legs.map((l) => ({ ...l, length: 5 })), radius: 20 }); ok(long.problems.some((p) => p.code === 'int.radius.long'), 'radius too long for the legs flagged');
}
near(I.isd({ speed: 60, gap: 7.5 }), 125.1, 0.05, 'ISD 60 km/h 7.5 s'); near(I.isd({ speed: 60, gap: 7.5, lanes: 2 }), 0.278 * 60 * 8.5, 1e-9, 'ISD +0.5 s per lane');
{
  const tri = I.sightTriangle({ driver: { x: 0, y: 0 }, minorDir: { x: 0, y: -1 }, majorDir: { x: 1, y: 0 }, minorLeg: 10, majorLeg: 100 });
  const hit = I.triangleBlocked(tri, [[{ x: 20, y: -2 }, { x: 30, y: -2 }, { x: 30, y: -3 }, { x: 20, y: -3 }], [{ x: 40, y: 20 }, { x: 50, y: 20 }, { x: 50, y: 30 }, { x: 40, y: 30 }], [{ x: -5, y: -9 }, { x: 5, y: -9 }, { x: 5, y: -1 }, { x: -5, y: -1 }]]);
  ok(hit.includes(2) && !hit.includes(1), 'obstacle inside / outside the sight triangle');
}
{   // striping on a straight 120 m road
  const line = [{ x: 0, y: 0 }, { x: 120, y: 0 }];
  const o = I.offsetLine(line, 3); near(o[0].y, 3, 1e-9, 'offset left'); near(I.offsetLine(line, -3)[1].y, -3, 1e-9, 'offset right');
  const bend = I.offsetLine([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], -1); near(bend[1].x, 11, 1e-9, 'mitred corner x (right of an east-then-north road)'); near(bend[1].y, -1, 1e-9, 'mitred corner y');
  const d = I.dashSegments(line, { dash: 3, gap: 9 }); ok(d.length === 10, '10 dashes in 120 m'); near(d.reduce((s, p) => s + p[1].x - p[0].x, 0), 30, 1e-9, '30 m painted');
  const r = I.stripe(line, { lanesLeft: 2, lanesRight: 2, laneWidth: 3.6, centre: 'double', edge: true });
  near(r.quantities.length['centre-double'], 240, 1e-9, 'double centre line = 2 × 120'); near(r.quantities.length['lane-dashed'], 2 * 30, 1e-9, 'one dashed lane line each way');
  near(r.quantities.length.edge, 240, 1e-9, 'edge lines both sides');
  const gap = I.stripe(line, { lanesLeft: 1, lanesRight: 1, laneWidth: 3.6, centre: 'double', edge: true, breaks: [{ from: 50, to: 70 }] });
  near(gap.quantities.length.edge, 2 * 100, 1e-9, 'breaks at the intersection are left unpainted');
  const e = r.items.find((q) => q.kind === 'edge' && q.tag === 'L'); near(e.pts[0].y, 7.2, 1e-9, 'left edge line at 2 lanes');
}
{
  const cw = I.crosswalk({ x: 0, y: 0 }, { x: 0, y: 1 }, 7.2, { style: 'continental', bar: 0.4, gap: 0.6, length: 3 });
  ok(cw.length === Math.floor((7.2 + 0.6) / 1.0), 'continental bar count'); ok(I.crosswalk({ x: 0, y: 0 }, { x: 0, y: 1 }, 7.2, { style: 'ladder' }).length === 2, 'ladder has two long bars');
}
{
  const line = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
  const s = I.signsFor(line, { signs: [{ kind: 'stop', station: 100, side: 'R', offset: 2.5 }], repeat: [{ kind: 'speed', every: 40, side: 'R', offset: 3, from: 0, to: 80 }] });
  ok(s.counts.stop === 1 && s.counts.speed === 3, 'sign counts ' + JSON.stringify(s.counts)); const st = s.signs.find((q) => q.kind === 'stop'); near(st.y, -2.5, 1e-9, 'right-side sign sits right of travel'); near(st.x, 100, 1e-9, 'stop sign at the station');
}
console.log(`intersection: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
