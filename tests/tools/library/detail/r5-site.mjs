/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, site: hospital campus, construction sites, mine sites and airfields (landscape objects and road/aircraft shapes). Original geometry; scale shapes, not particular machines. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------------ helpers
/** extrude a convex polygon of [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon of [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  const n = poly.length, P = (q, y) => [q[0], y, q[1]];
  for (let i = 1; i < n - 1; i++) { a.t.push([P(poly[0], y0), P(poly[i], y0), P(poly[i + 1], y0)], [P(poly[0], y1), P(poly[i + 1], y1), P(poly[i], y1)]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([P(p, y0), P(q, y1), P(q, y0)], [P(p, y0), P(p, y1), P(q, y1)]); }
  return a;
}
/** a wheel on a lateral axle at (x, y) with radius r resting on the floor, width w */
function whl(a, x, y, r, w = 150) { a.xcyl(x - w / 2, x + w / 2, y, a.Z0 + r, r, 16); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); a.xcyl(x - w / 2 - 3, x + w / 2 + 3, y, a.Z0 + r, r * 0.45, 8); }
function wheelPairs(a, ys, r, w = 150, inset = 10) { for (const y of ys) for (const sx of [a.X0 + inset + w / 2, a.X1 - inset - w / 2]) whl(a, sx, y, r, w); }
/** a post-and-rail from (x0,y0) to (x1,y1) between z0 and z1 */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3, mid = false) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 5);
  if (mid) a.tube([[x0, y0, (z0 + z1) / 2 + (z1 - z0) * 0.05], [x1, y1, (z0 + z1) / 2 + (z1 - z0) * 0.05]], [t * 0.8, t * 0.8], 5);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 5); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
function ring(a, cx, cy, z, r, t = 4, n = 24) { const pts = []; for (let i = 0; i <= n; i++) { const g = (i / n) * PI * 2; pts.push([cx + m.cos(g) * r, cy + m.sin(g) * r, z]); } a.tube(pts, pts.map(() => t), 5); }
/** a ladder in the X-Z plane at y */
function lad(a, x, y, z0, z1, w = 420, t = 18) {
  for (const s of [-1, 1]) a.tube([[x + s * w / 2, y, z0], [x + s * w / 2, y, z1]], [t / 2, t / 2], 5);
  for (let z = z0 + 150; z < z1 - 50; z += 280) a.box(x - w / 2, y - t / 3, z, x + w / 2, y + t / 3, z + t * 0.7);
}
/** a bolted side frame in the Y-Z plane, standing out from the face at x by `out` toward dir */
function sideFrame(a, x, dir, y0, y1, z0, z1, t = 45, out = 12) {
  const xa = x, xb = x + dir * out, [p, q] = xa < xb ? [xa, xb] : [xb, xa];
  a.box(p, y0, z0, q, y0 + t, z1).box(p, y1 - t, z0, q, y1, z1).box(p, y0 + t, z1 - t, q, y1 - t, z1).box(p, y0 + t, z0, q, y1 - t, z0 + t);
}
/** a lattice tower from (x0,y0,z0) to (x1,y1,z1) footprint, narrowing toward the top by `taper` (0..1), n panels */
function lattice(a, x0, y0, x1, y1, z0, z1, o = {}) {
  const n = o.n ?? m.max(2, m.round((z1 - z0) / (m.min(x1 - x0, y1 - y0) * 0.95))), t = o.t ?? 50, bt = o.bt ?? 24, tp = o.taper ?? 0;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, level = (k) => { const s = 1 - tp * (k / n), hx = ((x1 - x0) / 2) * s, hy = ((y1 - y0) / 2) * s, z = z0 + ((z1 - z0) * k) / n; return { z, c: [[cx - hx, cy - hy], [cx + hx, cy - hy], [cx + hx, cy + hy], [cx - hx, cy + hy]] }; };
  const L = []; for (let k = 0; k <= n; k++) L.push(level(k));
  for (let c = 0; c < 4; c++) a.tube(L.map((l) => [l.c[c][0], l.c[c][1], l.z]), L.map(() => t), 5);
  for (let k = 0; k <= n; k++) { const l = L[k]; for (let c = 0; c < 4; c++) { const p = l.c[c], q = l.c[(c + 1) % 4]; if (k % 1 === 0) a.tube([[p[0], p[1], l.z], [q[0], q[1], l.z]], [bt, bt], 4); } }
  for (let k = 0; k < n; k++) for (let c = 0; c < 4; c++) { const p = L[k].c[c], q = L[k].c[(c + 1) % 4], p2 = L[k + 1].c[c], q2 = L[k + 1].c[(c + 1) % 4]; const alt = (k + c) % 2; a.tube(alt ? [[p[0], p[1], L[k].z], [q2[0], q2[1], L[k + 1].z]] : [[q[0], q[1], L[k].z], [p2[0], p2[1], L[k + 1].z]], [bt, bt], 4); }
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** a convex-profile cone/dome stack */
function dome(a, cx, cy, z, r, h) { a.ell(cx, cy, z, r, r, h, 16, 6); }

/** a road vehicle front: chassis, hood, cab, windscreen, side glass, mirrors, bumper, lamps, wheel pairs with fenders.
 *  o: cabL (cab rear from nose tip), nose, cabH, hoodH, ground, wr, axles (offsets from the front), ww wheel width, fr chassis depth */
function trk(a, o) {
  const { X0, X1, YF, YB, Z0, cx, W } = a, gz = Z0 + (o.ground ?? 450), wr = o.wr ?? 450, nose = o.nose, hoodH = Z0 + o.hoodH, cabH = Z0 + o.cabH, ww = o.ww ?? 280;
  a.outline();
  a.box(X0 + 150, YF + 120, gz, X1 - 150, YB - 60, gz + (o.fr ?? 200));
  a.box(X0 + 60, YF + 50, gz + 120, X1 - 60, YF + nose, hoodH);
  a.box(X0 + 40, YF + nose, gz + 120, X1 - 40, YF + o.cabL, cabH);
  a.frame(X0 + 130, hoodH + 30, X1 - 130, cabH - 90, YF + nose - 8, YF + nose + 6, 50); a.box(cx - 20, YF + nose - 8, hoodH + 30, cx + 20, YF + nose + 6, cabH - 90);
  const sy0 = YF + nose + 120, sy1 = YF + m.min(o.cabL - 120, nose + 1700), sz0 = hoodH + 60, sz1 = cabH - 100;
  if (sz1 > sz0 + 200 && sy1 > sy0 + 300) { sideFrame(a, X0 + 40, -1, sy0, sy1, sz0, sz1, 40, 10); sideFrame(a, X1 - 40, 1, sy0, sy1, sz0, sz1, 40, 10); }
  for (const sx of [-1, 1]) a.box(sx < 0 ? X0 : X1 - 80, YF + nose + 30, hoodH + 150, sx < 0 ? X0 + 80 : X1, YF + nose + 110, hoodH + 560);
  a.box(X0 + 30, YF, gz, X1 - 30, YF + 90, gz + 230);
  for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 330) - 110, YF + 22, gz + 360, cx + sx * (W / 2 - 330) + 110, YF + 50, gz + 470);
  wheelPairs(a, o.axles.map((y) => YF + y), wr, ww, 10);
  for (const y of o.axles) for (const sx of [-1, 1]) a.box(sx < 0 ? X0 : X1 - ww - 20, YF + y - wr - 25, Z0 + wr * 2 - 40, sx < 0 ? X0 + ww + 20 : X1, YF + y + wr + 25, Z0 + wr * 2 + 15);
  a.line(X0 + 40, YF + nose, X1 - 40, YF + nose, 'EQUIP-DETAIL'); a.line(X0 + 40, YF + o.cabL, X1 - 40, YF + o.cabL, 'EQUIP-DETAIL');
  return a;
}
/** a beacon or light bar on a roof */
function lightbar(a, cx, y, z, w) { a.box(cx - w / 2, y, z, cx + w / 2, y + 220, z + 100); a.ell(cx - w / 2 + 60, y + 110, z + 100, 70, 90, 40, 8, 4); a.ell(cx + w / 2 - 60, y + 110, z + 100, 70, 90, 40, 8, 4); a.rect(cx - w / 2, y, cx + w / 2, y + 220, 'EQUIP-DETAIL'); }
/** a fixed-size cross relief on a vertical side face at x, centred at (y, z) */
function plusSide(a, x, dir, y, z, s = 260) { const x0 = dir > 0 ? x : x - 10, x1 = dir > 0 ? x + 10 : x; a.box(x0, y - s, z - s * 0.28, x1, y + s, z + s * 0.28); a.box(x0, y - s * 0.28, z - s, x1, y + s * 0.28, z + s); }
const rowsOf = (...rs) => rs;
const FAMS = [];
const F_ = (f) => { FAMS.push(fam(f)); };

// ================================================================================================ HOSPITAL CAMPUS
F_({ cat: 'site/vehicles', title: 'Generic hospital ambulance',
  desc: (v) => `${v.kind === 'car' ? 'Rapid response station wagon' : v.kind === 'van' ? 'Van-based ambulance' : v.kind === 'bus' ? 'Multi-patient ambulance bus' : 'Box-body ambulance'} with a cab, windscreen and side glass, ${v.kind === 'car' ? 'a roof light bar and a rear hatch' : 'a roof light bar, a patient box with a side cross relief and rear double doors with a step'}, four wheels with fenders and lamps.`,
  vs: [['van-based, one stretcher', 80, 246, 108, 0, { kind: 'van' }], ['box-body, two stretchers', 96, 288, 122, 0, { kind: 'box' }], ['box-body, bariatric stretcher', 100, 312, 128, 0, { kind: 'box' }], ['multi-patient bus type', 100, 372, 124, 0, { kind: 'bus' }], ['rapid response wagon', 74, 190, 64, 0, { kind: 'car' }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, k = v.kind, gz = Z0 + 420;
    const o = { van: { cabL: D, nose: 900, cabH: H - 150, hoodH: 1050, wr: 380, axles: [1050, D - 1000] }, box: { cabL: 2000, nose: 1000, cabH: 2600, hoodH: 1350, wr: 440, axles: [1150, D - 1150] }, bus: { cabL: 2000, nose: 1000, cabH: 2600, hoodH: 1350, wr: 440, axles: [1150, D - 2300, D - 1150] }, car: { cabL: D - 250, nose: 1150, cabH: H - 110, hoodH: H * 0.5, wr: 320, axles: [1100, D - 950] } }[k];
    trk(a, { ...o, ground: 420 });
    if (k === 'box' || k === 'bus') { a.box(X0 + 30, YF + 2060, gz + 150, X1 - 30, YB, Z0 + H - 150); a.line(X0 + 30, YF + 2060, X1 - 30, YF + 2060); }
    if (k === 'van' || k === 'box' || k === 'bus') {
      const bz = Z0 + H * 0.55, by = YF + (k === 'van' ? D * 0.62 : (D + 2060) / 2);
      plusSide(a, X0 + 30, -1, by, bz, 230); plusSide(a, X1 - 30, 1, by, bz, 230);
      a.frame(X0 + 160, gz + 500, X1 - 160, Z0 + H - 330, YB - 14, YB, 45); a.box(cx - 15, YB - 14, gz + 500, cx + 15, YB, Z0 + H - 330);
      a.box(X0 + 120, YB - 260, gz - 20, X1 - 120, YB, gz + 60); a.line(cx, YB, cx, YB - 260, 'EQUIP-DETAIL'); a.rect(X0 + 120, YB - 260, X1 - 120, YB, 'EQUIP-DETAIL');
      if (k === 'bus') for (let i = 0; i < 4; i++) sideFrame(a, X0 + 30, -1, YF + 2400 + i * 1250, YF + 3350 + i * 1250, Z0 + H * 0.55, Z0 + H * 0.78, 30, 8);
    } else { a.frame(X0 + 160, Z0 + 620, X1 - 160, Z0 + H - 220, YB - 14, YB, 45); }
    lightbar(a, cx, YF + (k === 'car' ? 1500 : 800), Z0 + o.cabH, W * 0.62);
    a.log('Added the cab with windscreen and side glass, ' + (k === 'car' ? 'the rear hatch' : 'the patient box with cross reliefs and rear doors with a step') + ', the roof light bar, lamps and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic patient transport van',
  desc: (v) => `Patient transport van for ${v.seats} wheelchair places, with a cab, windscreen, ${v.seats > 2 ? 'a band of side windows' : 'side windows'}, a sliding side door line, a rear lift platform folded against the back doors and four wheels with fenders.`,
  vs: [['low floor, 2 wheelchair places', 78, 215, 100, 0, { seats: 2 }], ['4 wheelchair places, rear lift', 84, 252, 110, 0, { seats: 4 }], ['6 wheelchair places, high roof', 84, 280, 118, 0, { seats: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
    trk(a, { cabL: D, nose: 850, cabH: H - 140, hoodH: 980, wr: 360, ground: 380, axles: [1000, D - 1000] });
    for (let i = 0; i < v.seats; i++) { const y0 = YF + 1700 + i * ((D - 3000) / v.seats); sideFrame(a, X0 + 40, -1, y0, y0 + (D - 3000) / v.seats - 140, Z0 + H * 0.52, Z0 + H * 0.78, 34, 8); sideFrame(a, X1 - 40, 1, y0, y0 + (D - 3000) / v.seats - 140, Z0 + H * 0.52, Z0 + H * 0.78, 34, 8); }
    a.line(X1 - 40, YF + 1700, X1 - 40, YF + 1700, 'EQUIP-DETAIL'); a.box(X1 - 60, YF + 1500, Z0 + 500, X1 - 30, YF + 1560, H - 400 + Z0);
    a.frame(X0 + 160, Z0 + 520, X1 - 160, Z0 + H - 260, YB - 14, YB, 45); a.box(cx - 15, YB - 14, Z0 + 520, cx + 15, YB, Z0 + H - 260);
    a.box(X0 + 200, YB - 40, Z0 + 420, X1 - 200, YB, Z0 + H - 300); a.box(X0 + 200, YB - 380, Z0 + 330, X1 - 200, YB - 40, Z0 + 380); a.rect(X0 + 200, YB - 380, X1 - 200, YB, 'EQUIP-DETAIL');
    a.log('Added the cab, side window bands, the sliding door line, the folded rear lift platform and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic hospital shuttle cart',
  desc: (v) => `Electric shuttle cart with ${v.seats} seats in ${v.seats / 2} rows, a roof canopy on four posts, a windscreen, a steering column, four small wheels and a rear step.`,
  vs: [['4 seats', 48, 108, 78, 0, { seats: 4 }], ['6 seats', 48, 140, 78, 0, { seats: 6 }], ['8 seats, long', 50, 176, 80, 0, { seats: 8 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    wheelPairs(a, [YF + 420, YB - 420], 220, 120, 20);
    a.box(X0 + 60, YF + 160, Z0 + 150, X1 - 60, YB - 100, Z0 + 330); a.box(X0 + 90, YF + 40, Z0 + 330, X1 - 90, YF + 520, Z0 + 600);
    const rows = v.seats / 2, ry0 = YF + 760, step = (D - 1000) / rows;
    for (let i = 0; i < rows; i++) { const y = ry0 + i * step; a.box(X0 + 120, y, Z0 + 330, X1 - 120, y + step - 140, Z0 + 520); a.box(X0 + 120, y + step - 190, Z0 + 520, X1 - 120, y + step - 140, Z0 + 900); a.line(cx, y, cx, y + step - 140, 'EQUIP-DETAIL'); }
    for (const [x, y] of [[X0 + 80, YF + 560], [X1 - 80, YF + 560], [X0 + 80, YB - 140], [X1 - 80, YB - 140]]) a.cyl(x, y, Z0 + 330, Z1 - 70, 22, 8);
    a.box(X0 + 40, YF + 540, Z1 - 70, X1 - 40, YB - 60, Z1); a.rect(X0 + 40, YF + 540, X1 - 40, YB - 60, 'EQUIP-DETAIL');
    a.frame(X0 + 100, Z0 + 600, X1 - 100, Z1 - 80, YF + 540, YF + 560, 30);
    a.tube([[cx - W * 0.2, YF + 600, Z0 + 600], [cx - W * 0.2, YF + 480, Z0 + 950]], [20, 20], 6); a.cyl(cx - W * 0.2, YF + 480, Z0 + 950, Z0 + 970, 150, 12);
    a.log('Added the chassis, ' + v.seats + ' seats with backrests, the roof canopy on four posts, windscreen, steering wheel and four wheels (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital rooftop helipad',
  desc: (v) => `Helicopter landing pad with a ${v.t} ft touchdown ring on a raised deck, a painted H and ring in relief, a perimeter safety-net frame on posts with two rails, edge lights and a windsock mast at one corner.`,
  vs: [30, 40, 50, 60].map((t) => [`${t} ft touchdown`, (t + 4) * 12, (t + 4) * 12, 84, 0, { t }]),
  build: (a, v) => {
    const { cx, cy, Z0, Z1 } = a, R = (v.t * FT) / 2, E = R + 300; a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, E); a.circ(cx, cy, R * 0.78, 'EQUIP-DETAIL');
    a.cyl(cx, cy, Z0, Z0 + 300, E, 40); ring(a, cx, cy, Z0 + 312, R * 0.78, 14, 40);
    const hs = R * 0.34; for (const s of [-1, 1]) a.box(cx + s * hs - 60, cy - hs * 1.2, Z0 + 300, cx + s * hs + 60, cy + hs * 1.2, Z0 + 320); a.box(cx - hs, cy - 60, Z0 + 300, cx + hs, cy + 60, Z0 + 320);
    a.line(cx - hs, cy, cx + hs, cy, 'EQUIP-DETAIL'); a.line(cx - hs, cy - hs * 1.2, cx - hs, cy + hs * 1.2, 'EQUIP-DETAIL'); a.line(cx + hs, cy - hs * 1.2, cx + hs, cy + hs * 1.2, 'EQUIP-DETAIL');
    const n = m.round(v.t * 0.7), pr = E - 40; for (let i = 0; i < n; i++) { const g = (i / n) * PI * 2; a.cyl(cx + m.cos(g) * pr, cy + m.sin(g) * pr, Z0 + 300, Z0 + 1180, 20, 6); if (i % 3 === 0) a.ell(cx + m.cos(g) * (E - 80), cy + m.sin(g) * (E - 80), Z0 + 320, 60, 60, 40, 8, 4); }
    ring(a, cx, cy, Z0 + 1180, pr, 18, 48); ring(a, cx, cy, Z0 + 760, pr, 14, 48);
    const mx = cx + m.cos(0.8) * (E - 200), my = cy + m.sin(0.8) * (E - 200); a.cyl(mx, my, Z0 + 300, Z1 - 120, 30, 8); a.tube([[mx, my, Z1 - 160], [mx + 500, my, Z1 - 170], [mx + 1000, my, Z1 - 200]], [140, 100, 50], 8); a.circ(mx, my, 40, 'EQUIP-DETAIL');
    a.log('Added the raised deck, the painted H and touchdown ring in relief, the safety-net frame on posts with two rails, edge lights and the windsock mast (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital ambulance bay canopy',
  desc: (v) => `Flat-roofed canopy over ${v.bays} ambulance bay${v.bays > 1 ? 's' : ''}, a deep fascia, columns at every bay line, soffit lights, a building wall behind with a glazed door frame for each bay, a kerb along the front and bollards.`,
  vs: [1, 2, 3, 4].map((bays) => [`${bays} bay${bays > 1 ? 's' : ''}`, (bays * 14 + 2) * 12, 360, 180, 0, { bays }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, bw = (W - 600) / v.bays; a.outline();
    a.box(X0, YB - 300, Z0, X1, YB, Z1 - 600); a.box(X0, YF, Z1 - 620, X1, YB, Z1 - 380); a.box(X0, YF, Z1 - 900, X1, YF + 90, Z1 - 380);
    for (let i = 0; i <= v.bays; i++) { const x = X0 + 300 + i * bw; a.cyl(x, YF + 500, Z0, Z1 - 620, 110, 12); a.circ(x, YF + 500, 110); if (i < v.bays) { a.frame(x + bw * 0.2, Z0 + 20, x + bw * 0.8, Z0 + 2300, YB - 330, YB - 300, 60); a.box(x + bw * 0.5 - 20, YB - 330, Z0 + 20, x + bw * 0.5 + 20, YB - 300, Z0 + 2300); a.box(x + bw * 0.25, YF + 900, Z1 - 650, x + bw * 0.75, YF + 1100, Z1 - 620); a.line(x, YF + 1300, x, YB - 300, 'EQUIP-DETAIL'); a.rect(x + bw * 0.2, YB - 330, x + bw * 0.8, YB - 300, 'EQUIP-DETAIL'); } }
    for (let i = 0; i < v.bays; i++) { const x = X0 + 300 + (i + 0.5) * bw; a.cyl(x, YF + 150, Z0, Z0 + 1000, 80, 10); a.circ(x, YF + 150, 80); }
    a.box(X0 + 200, YF + 50, Z0, X1 - 200, YF + 250, Z0 + 150); a.rect(X0, YF, X1, YB, 'EQUIP-HIDDEN');
    a.log('Added the flat roof with deep fascia, columns at each bay line, soffit lights, the wall with a glazed door frame per bay, the kerb and bollards (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital emergency entrance canopy',
  desc: (v) => `Entrance canopy ${v.w} ft wide projecting from the building wall, with a fascia sign band, two front columns, ${v.sets} pair${v.sets > 1 ? 's' : ''} of glazed sliding doors, a ramp up to the threshold and bollards.`,
  vs: [[16, 1], [24, 2], [32, 3]].map(([w, sets]) => [`${w} ft canopy, ${sets} door pair${sets > 1 ? 's' : ''}`, w * 12, 240, 168, 0, { w, sets }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
    a.box(X0, YB - 300, Z0 + 150, X1, YB, Z1 - 600);
    a.box(X0, YF, Z1 - 620, X1, YB, Z1 - 420); a.box(X0 + 100, YF, Z1 - 1100, X1 - 100, YF + 70, Z1 - 420); a.box(X0 + 400, YF - 0, Z1 - 1000, X1 - 400, YF + 90, Z1 - 520);
    for (const x of [X0 + 250, X1 - 250]) { a.cyl(x, YF + 500, Z0, Z1 - 620, 130, 12); a.circ(x, YF + 500, 130); }
    const dw = (W - 800) / v.sets;
    for (let i = 0; i < v.sets; i++) { const x0 = X0 + 400 + i * dw; a.frame(x0, Z0 + 150, x0 + dw - 100, Z0 + 2400, YB - 340, YB - 300, 70); for (let k = 0; k < 2; k++) a.box(x0 + 70 + k * ((dw - 240) / 2), YB - 345, Z0 + 170, x0 + 70 + (k + 1) * ((dw - 240) / 2) - 20, YB - 335, Z0 + 2330); a.rect(x0, YB - 340, x0 + dw - 100, YB - 300, 'EQUIP-DETAIL'); a.line(x0 + (dw - 100) / 2, YB - 340, x0 + (dw - 100) / 2, YB - 300, 'EQUIP-DETAIL'); }
    prismX(a, [[YF + 700, Z0], [YB - 300, Z0], [YB - 300, Z0 + 150]], X0 + 300, X1 - 300);
    for (const x of [X0 + 600, cx, X1 - 600]) { a.cyl(x, YF + 250, Z0, Z0 + 950, 75, 10); a.circ(x, YF + 250, 75); }
    a.log('Added the canopy roof with fascia sign band, two columns, glazed sliding door pairs in frames, the ramp and bollards (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital bulk medical-gas tank pad',
  desc: (v) => `Vertical bulk gas tank, ${v.gal.toLocaleString('en-US')} gal nominal, on four legs on a concrete pad, with domed ends, a ladder, a relief stack, ${v.vap} finned vaporizer columns on a frame, connecting pipework and corner bollards.`,
  vs: [[3000, 5, 17, 2], [6000, 6.5, 20, 3], [9000, 8, 21, 4], [11000, 8.5, 25, 5]].map(([gal, dia, ht, vap]) => [`${gal.toLocaleString('en-US')} gal tank`, (dia + 11) * 12, (dia + 5) * 12, ht * 12, 0, { gal, dia, vap }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, r = (v.dia * FT) / 2, tx = X0 + r + 400, ty = cy; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 150);
    const zb = Z0 + 900, zt = Z1 - 700;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.cyl(tx + sx * r * 0.62, ty + sy * r * 0.62, Z0 + 150, zb, 90, 8);
    a.cyl(tx, ty, zb, zt, r, 28); dome(a, tx, ty, zb, r, r * 0.35); dome(a, tx, ty, zt, r, r * 0.35); a.circ(tx, ty, r); a.circ(tx, ty, r * 0.55, 'EQUIP-DETAIL');
    ring(a, tx, ty, zb + (zt - zb) * 0.33, r + 15, 10, 28); ring(a, tx, ty, zb + (zt - zb) * 0.66, r + 15, 10, 28);
    lad(a, tx + r * 0.2, ty - r - 40, zb, zt + 150, 420); a.cyl(tx - r * 0.3, ty, zt + r * 0.3, Z1 - 30, 55, 8); a.cyl(tx - r * 0.3, ty, Z1 - 30, Z1, 90, 8);
    const vx0 = tx + r + 500, step = (X1 - 300 - vx0) / v.vap; a.box(vx0 - 100, ty - 450, Z0 + 150, X1 - 150, ty + 450, Z0 + 330);
    for (let i = 0; i < v.vap; i++) { const x = vx0 + step * (i + 0.5); a.cyl(x, ty, Z0 + 330, Z0 + 3300, 85, 10); for (let z = Z0 + 500; z < Z0 + 3200; z += 300) a.cyl(x, ty, z, z + 40, 190, 10); a.circ(x, ty, 190, 'EQUIP-DETAIL'); }
    a.tube([[tx + r, ty, zb + 200], [vx0 - 150, ty, Z0 + 600], [vx0 + step * 0.5, ty, Z0 + 420]], [35, 35, 35], 6);
    for (const [bx, by] of [[X0 + 150, YF + 150], [X1 - 150, YF + 150], [X0 + 150, YB - 150], [X1 - 150, YB - 150]]) { a.cyl(bx, by, Z0 + 150, Z0 + 1050, 70, 8); a.circ(bx, by, 70); }
    a.log('Added the pad, four legs, the tank body with domed ends, bands, ladder and relief stack, the finned vaporizer columns, pipework and bollards (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital gas cylinder manifold enclosure',
  desc: (v) => `Open-sided cage for ${v.n} gas cylinders in two banks, with a roof, louvered side panels, a safety chain across each bank, a header pipe and a regulator panel box on the back wall.`,
  vs: [[6, 'one bank each side'], [12, ''], [20, '']].map(([n]) => [`${n} cylinders`, n / 2 * 10 + 30, 44, 100, 0, { n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 80);
    for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) a.cyl(x, y, Z0 + 80, Z1 - 60, 35, 8);
    a.box(X0, YF, Z1 - 60, X1, YB, Z1); for (const y of [YF + 40, YB - 40]) { a.tube([[X0 + 40, y, Z0 + 600], [X1 - 40, y, Z0 + 600]], [12, 12], 4); a.tube([[X0 + 40, y, Z0 + 1500], [X1 - 40, y, Z0 + 1500]], [12, 12], 4); }
    const per = v.n / 2, pw = (W - 160) / per;
    for (let b = 0; b < 2; b++) for (let i = 0; i < per; i++) { const x = X0 + 80 + pw * (i + 0.5), y = b ? YB - 330 : YF + 330; a.cyl(x, y, Z0 + 80, Z0 + 1450, 100, 12); dome(a, x, y, Z0 + 1450, 100, 80); a.cyl(x, y, Z0 + 1530, Z0 + 1600, 40, 8); a.circ(x, y, 100); }
    a.tube([[X0 + 80, YB - 80, Z0 + 1700], [X1 - 80, YB - 80, Z0 + 1700]], [28, 28], 6); a.box(cx - 280, YB - 140, Z0 + 1100, cx + 280, YB - 70, Z0 + 1550);
    for (const x of [X0, X1 - 20]) for (let z = Z0 + 200; z < Z1 - 200; z += 70) a.box(x, YF + 360, z, x + 20, YB - 360, z + 22);
    a.log('Added the cage frame and roof, the two banks of cylinders with domed shoulders, safety chains, header pipe, regulator panel box and louvered side panels (plan and 3D).');
  } });

// a generator set in a weather enclosure (hospital standby, site and mine skids)
function genset(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
  const sk = o.skid ?? 300; a.box(X0 + 30, YF + 30, Z0, X1 - 30, YB - 30, Z0 + sk);
  a.box(X0 + 60, YF + 60, Z0 + sk, X1 - 60, YB - 60, Z0 + sk + o.tank);
  const ez = Z0 + sk + o.tank; a.box(X0 + 20, YF + 80, ez, X1 - 20, YB - 20, Z1 - o.stack);
  const nd = o.doors, mg = m.min(400, W * 0.1), dw = (W - 2 * mg) / nd;
  for (let i = 0; i < nd; i++) { const x0 = X0 + mg + i * dw; a.frame(x0 + 20, ez + 150, x0 + dw - 20, Z1 - o.stack - 150, YF + 20, YF + 80, 40); for (let z = ez + 300; z < Z1 - o.stack - 300; z += 60) a.box(x0 + 80, YF + 40, z, x0 + dw - 80, YF + 82, z + 30); a.box(x0 + dw - 70, YF + 10, ez + (Z1 - o.stack - ez) / 2 - 100, x0 + dw - 40, YF + 60, ez + (Z1 - o.stack - ez) / 2 + 100); a.arc(i % 2 ? x0 + dw - 20 : x0 + 20, YF + 20, dw - 40, i % 2 ? 180 : 270, i % 2 ? 270 : 360); }
  for (const [x0, x1] of [[X0 + 20, X0 + mg], [X1 - mg, X1 - 20]]) for (let z = ez + 200; z < Z1 - o.stack - 200; z += 70) a.box(x0 + 40, YF + 40, z, x1 - 40, YF + 82, z + 32);
  a.box(X1 - 20, YF + 200, ez + 150, X1 + 0.01 - 0.01, YB - 200, Z1 - o.stack - 150);
  const sx = X0 + W * 0.28, sy = YB - 300; a.cyl(sx, sy, Z1 - o.stack, Z1 - 120, o.sr, 14); a.cone(sx, sy, Z1 - 120, Z1 - 40, o.sr * 1.4, o.sr * 1.4, 14); a.cyl(sx, sy, Z1 - 40, Z1, o.sr * 1.1, 14); a.circ(sx, sy, o.sr, 'EQUIP-DETAIL');
  for (const x of [X0 + 120, X1 - 120]) a.cyl(x, YF + 120, Z1 - o.stack - 60, Z1 - o.stack + 60, 45, 8);
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  return a;
}
F_({ cat: 'site/landscape', title: 'Generic hospital standby generator enclosure',
  desc: (v) => `Weatherproof generator enclosure for a ${v.kw} kW set on a skid with a base fuel tank, louvered doors with handles and swings, louvered end panels and a vertical exhaust stack with a rain cap.`,
  vs: [[150, 120, 48, 78, 2], [350, 150, 60, 92, 2], [750, 200, 76, 108, 3], [1250, 280, 90, 124, 4]].map(([kw, w, d, h, doors]) => [`${kw} kW`, w, d, h, 0, { kw, doors }]),
  build: (a, v) => { genset(a, { tank: 350, doors: v.doors, stack: 450, sr: 90 }); a.log('Added the skid, base tank, enclosure with louvered doors and swings, end louvers, lifting eyes and the exhaust stack with rain cap (plan and 3D).'); } });

F_({ cat: 'site/landscape', title: 'Generic hospital campus wayfinding totem',
  desc: (v) => `Free-standing direction totem, ${v.h} ft tall, with a concrete footing, a steel spine, ${v.n} stacked sign panels with arrow shapes and a cap.`,
  vs: [[4, 8], [6, 10], [8, 12]].map(([n, h]) => [`${n} panels, ${h} ft`, 32, 14, h * 12, 0, { n, h }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
    a.box(cx - 380, cy - 200, Z0, cx + 380, cy + 200, Z0 + 250); a.box(cx - 70, cy - 70, Z0 + 250, cx + 70, cy + 70, Z1 - 150); a.box(cx - 180, cy - 90, Z1 - 150, cx + 180, cy + 90, Z1);
    const pz0 = Z0 + 600, step = (Z1 - 150 - pz0) / v.n;
    for (let i = 0; i < v.n; i++) { const z = pz0 + i * step; a.box(cx - 360, cy - 200 - 0, z + 40, cx + 360, cy - 70, z + step - 40); a.prism([[cx + 220, cy - 215], [cx + 120, cy - 215], [cx + 120, cy - 200], [cx + 220, cy - 200]], z + 80, z + step - 80); const dir = i % 2 ? -1 : 1; a.prism([[cx + dir * 150, cy - 232], [cx + dir * 300, cy - 232], [cx + dir * 300, cy - 200], [cx + dir * 150, cy - 200]], z + step / 2 - 40, z + step / 2 + 40); a.line(cx - 360, cy - 200, cx + 360, cy - 200, 'EQUIP-DETAIL'); }
    a.log('Added the footing, steel spine and cap and ' + v.n + ' stacked sign panels with arrow shapes (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital waste enclosure',
  desc: (v) => `Screened enclosure with ${v.n} wheeled waste container${v.n > 1 ? 's' : ''} inside, solid fence walls on three sides with posts, double gate leaves swung open, a concrete pad and a kerb.`,
  vs: [1, 2, 3].map((n) => [`${n} container${n > 1 ? 's' : ''}`, (n * 8 + 4) * 12, 144, 78, 0, { n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline('EQUIP-HIDDEN'); a.box(X0, YF, Z0, X1, YB, Z0 + 100);
    const t = 70, h = Z1 - Z0 - 100; a.box(X0, YB - t, Z0 + 100, X1, YB, Z1); a.box(X0, YF + 120, Z0 + 100, X0 + t, YB - t, Z1); a.box(X1 - t, YF + 120, Z0 + 100, X1, YB - t, Z1);
    for (let x = X0 + 400; x < X1 - 300; x += 400) a.line(x, YB - t, x, YB, 'EQUIP-DETAIL');
    for (const x of [X0 + t / 2, X1 - t / 2]) { a.box(x - 60, YF + 90, Z0 + 100, x + 60, YF + 210, Z1 + 0); }
    for (const sx of [-1, 1]) { const hx = sx < 0 ? X0 + t : X1 - t; a.box(hx - 25 + (sx < 0 ? 25 : -25) - 0, YF + 150, Z0 + 150, hx + (sx < 0 ? 50 : -50) + (sx < 0 ? 0 : 0), YF + 1250, Z1 - 100); a.rect(hx, YF + 150, hx + sx * 40, YF + 1250, 'EQUIP-DETAIL'); a.arc(hx, YF + 150, 1100, sx < 0 ? 0 : 90, sx < 0 ? 90 : 180); }
    const cw = (W - 2 * t - 300) / v.n;
    for (let i = 0; i < v.n; i++) { const x0 = X0 + t + 150 + i * cw + 40, x1 = x0 + cw - 80, y0 = YB - t - 1500; a.box(x0, y0, Z0 + 250, x1, YB - t - 40, Z0 + 1150); a.box(x0 - 20, y0 - 30, Z0 + 1150, x1 + 20, YB - t - 20, Z0 + 1220); a.rect(x0, y0, x1, YB - t - 40, 'EQUIP-DETAIL'); for (const x of [x0 + 60, x1 - 60]) a.xcyl(x - 25, x + 25, YB - t - 140, Z0 + 125, 125, 10); }
    a.log('Added the pad and kerb, three solid walls with posts, the open double gate leaves and ' + v.n + ' wheeled container(s) with lids and wheels (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic hospital accessible ramp with handrails',
  desc: (v) => `Straight access ramp ${v.len} ft long rising ${v.rise} in with a level top landing, a solid deck on a sloping edge profile, double handrails on both sides with posts and kerb upstands.`,
  vs: [[20, 15], [30, 25], [40, 30]].map(([len, rise]) => [`${len} ft long, ${rise} in rise`, len * 12, 52, rise + 40, 0, { len, rise }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, rise = v.rise * IN, land = 5 * FT, top = Z0 + rise; a.outline();
    prismY(a, [[X0, Z0], [X1, Z0], [X1, top], [X1 - land, top]], YF + 150, YB - 150);
    for (const y of [YF + 150, YB - 150]) { prismY(a, [[X0, Z0], [X1 - land, top], [X1 - land, top + 100], [X0, Z0 + 100]], y - 50 < YF ? YF : y - 50, y + 0.01 + 50 > YB ? YB : y + 50 + (y < 0 ? 0 : 0)); }
    for (const y of [YF + 70, YB - 70]) { const n = m.round(v.len / 6) + 1; for (let k = 0; k < n; k++) { const f = k / (n - 1), x = X0 + (X1 - X0 - land) * f, z = Z0 + rise * f; a.tube([[x, y, z + 100], [x, y, z + 1000]], [18, 18], 6); } a.tube([[X0, y, Z0 + 1000], [X1 - land, y, top + 1000], [X1, y, top + 1000]], [20, 20, 20], 6); a.tube([[X0, y, Z0 + 700], [X1 - land, y, top + 700], [X1, y, top + 700]], [16, 16, 16], 6); a.tube([[X1, y, top + 100], [X1, y, top + 1000]], [18, 18], 6); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
    a.line(X1 - land, YF + 150, X1 - land, YB - 150, 'EQUIP-DETAIL');
    a.log('Added the sloping deck with a level landing, kerb upstands, posts and double handrails on both sides (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic healing garden pergola',
  desc: (v) => `Timber pergola ${v.pw} by ${v.pd} ft on six or more square posts, with two long beams, cross rafters on top, a lattice slat screen at the back${v.bench ? ' and a built-in bench along the back' : ''}.`,
  vs: [[10, 10, false], [12, 16, false], [12, 24, false], [16, 24, true]].map(([pw, pd, bench]) => [`${pw} x ${pd} ft${bench ? ' with bench' : ''}`, pd * 12, pw * 12, 108, 0, { pw, pd, bench }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
    const np = v.pd > 16 ? 4 : v.pd > 10 ? 3 : 2, xs = Array.from({ length: np }, (_, i) => X0 + 100 + ((W - 200) * i) / (np - 1));
    for (const x of xs) for (const y of [YF + 100, YB - 100]) { a.box(x - 80, y - 80, Z0, x + 80, y + 80, Z1 - 350); a.rect(x - 80, y - 80, x + 80, y + 80); }
    for (const y of [YF + 100, YB - 100]) a.box(X0, y - 90, Z1 - 350, X1, y + 90, Z1 - 150);
    for (let x = X0 + 50; x < X1 - 100; x += 380) a.box(x, YF, Z1 - 150, x + 90, YB, Z1);
    for (let x = X0 + 150; x < X1 - 100; x += 140) a.box(x, YB - 70, Z0 + 300, x + 40, YB - 50, Z1 - 350);
    a.box(X0 + 100, YB - 70, Z0 + 1900, X1 - 100, YB - 50, Z0 + 1960);
    if (v.bench) { a.box(X0 + 400, YB - 700, Z0 + 420, X1 - 400, YB - 120, Z0 + 470); a.box(X0 + 400, YB - 150, Z0 + 470, X1 - 400, YB - 120, Z0 + 950); a.rect(X0 + 400, YB - 700, X1 - 400, YB - 120, 'EQUIP-DETAIL'); }
    a.log('Added the square posts, two long beams, cross rafters, the back lattice screen' + (v.bench ? ' and the built-in bench' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic mobile medical unit trailer',
  desc: (v) => `${v.len} ft mobile unit trailer standing on landing legs, with a box body, a side entrance door with steps and a ramp, window openings, a roof air-conditioner, a nose equipment box, a kingpin plate and a tandem rear axle with fenders.`,
  vs: [28, 40, 48, 53].map((len) => [`${len} ft trailer`, 102, len * 12, 156, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0 + 20, YF + 600, Z0 + 1100, X1 - 20, YB, Z1 - 250); a.box(X0 + 150, YF + 30, Z0 + 1100, X1 - 150, YF + 600, Z0 + 1900); a.rect(X0 + 150, YF + 30, X1 - 150, YF + 600, 'EQUIP-DETAIL'); a.rect(X0 + 20, YF + 600, X1 - 20, YB);
    a.box(X0 + 60, YF + 600, Z0 + 950, X1 - 60, YB - 100, Z0 + 1100); a.cyl(cx, YF + 300, Z0 + 1040, Z0 + 1100, 150, 12);
    for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 220); a.box(x - 40, YF + 900, Z0 + 40, x + 40, YF + 1000, Z0 + 1000); a.box(x - 180, YF + 880, Z0, x + 180, YF + 1020, Z0 + 40); }
    wheelPairs(a, [YB - 1450, YB - 500], 480, 280, 20); a.line(X0 + 20, YB - 1450, X1 - 20, YB - 1450, 'EQUIP-DETAIL');
    for (const y of [YB - 1450, YB - 500]) for (const sx of [-1, 1]) a.box(sx < 0 ? X0 : X1 - 300, y - 500, Z0 + 940, sx < 0 ? X0 + 300 : X1, y + 500, Z0 + 1000);
    const dy = YF + 1500, nw = m.floor((D - 3600) / 1800);
    sideFrame(a, X1 - 20, 1, dy, dy + 950, Z0 + 1250, Z0 + 3050, 55, 14); a.box(X1, dy + 80, Z0 + 1300, X1 + 0.01, dy + 870, Z0 + 3000);
    a.box(X1 - 440, dy - 100, Z0 + 700, X1, dy + 1050, Z0 + 760); a.box(X1 - 440, dy - 100, Z0 + 1000, X1, dy + 1050, Z0 + 1060); prismX(a, [[dy - 100, Z0 + 60], [dy + 1050, Z0 + 60], [dy + 1050, Z0 + 700], [dy - 100, Z0 + 700]], X1 - 440, X1 - 400);
    for (let i = 0; i < nw; i++) { const y = dy + 1400 + i * 1800; if (y + 1000 < YB - 200) sideFrame(a, X1 - 20, 1, y, y + 1000, Z0 + 1900, Z0 + 2700, 45, 12); }
    a.box(cx - 450, YF + 2200, Z1 - 250, cx + 450, YF + 3200, Z1); a.rect(cx - 450, YF + 2200, cx + 450, YF + 3200, 'EQUIP-DETAIL');
    a.log('Added the box body, nose equipment box, kingpin plate, landing legs, entrance door with steps, windows, roof unit and the tandem axle with fenders (plan and 3D).');
  } });

// ================================================================================================ CONSTRUCTION SITES
F_({ cat: 'site/landscape', title: 'Generic tower crane mast and ballasted base',
  desc: (v) => `Tower crane base with a cross-shaped steel footing, ${v.layers} ballast block layer${v.layers > 1 ? 's' : ''} on each arm, a ${v.mw} ft lattice mast of ${v.sec} sections with joint plates, a ladder, a top platform with rails and a slew ring stub.`,
  vs: [[4.5, 2, 2, 18, 34], [4.5, 3, 3, 18, 46], [6, 3, 3, 24, 52], [7.5, 3, 4, 28, 56]].map(([mw, sec, layers, base, h]) => [`${mw} ft mast, ${sec} sections`, base * 12, base * 12, h * 12, 0, { mw, sec, layers }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, mw = (v.mw * FT) / 2; a.outline();
    const bz = Z0 + 450; a.box(X0, cy - 450, Z0, X1, cy + 450, bz); a.box(cx - 450, YF, Z0, cx + 450, YB, bz);
    for (const [bx, by, sx, sy] of [[X0, cy, 1, 0], [X1, cy, -1, 0], [cx, YF, 0, 1], [cx, YB, 0, -1]]) for (let l = 0; l < v.layers; l++) { const z0 = bz + l * 520; if (sx) a.box(bx + (sx > 0 ? 0 : -1500), by - 780, z0, bx + (sx > 0 ? 1500 : 0), by + 780, z0 + 520); else a.box(bx - 780, by + (sy > 0 ? 0 : -1500), z0, bx + 780, by + (sy > 0 ? 1500 : 0), z0 + 520); }
    a.rect(X0, cy - 450, X1, cy + 450, 'EQUIP-DETAIL'); a.rect(cx - 450, YF, cx + 450, YB, 'EQUIP-DETAIL');
    const zt = Z1 - 1400; lattice(a, cx - mw, cy - mw, cx + mw, cy + mw, bz, zt, { n: v.sec * 3, t: 90, bt: 40 });
    for (let k = 1; k < v.sec; k++) { const z = bz + ((zt - bz) * k) / v.sec; a.box(cx - mw - 60, cy - mw - 60, z - 30, cx + mw + 60, cy + mw + 60, z + 30); }
    lad(a, cx, cy - mw - 50, bz, zt, 450, 20);
    a.box(cx - mw - 300, cy - mw - 300, zt, cx + mw + 300, cy + mw + 300, zt + 90); rail(a, cx - mw - 300, cy - mw - 300, cx + mw + 300, cy - mw - 300, zt + 90, zt + 1100, 18, 4, true); rail(a, cx - mw - 300, cy + mw + 300, cx + mw + 300, cy + mw + 300, zt + 90, zt + 1100, 18, 4, true);
    a.cyl(cx, cy, zt + 90, Z1 - 100, mw * 0.9, 20); ring(a, cx, cy, Z1 - 100, mw * 0.95, 30, 20); a.circ(cx, cy, mw * 0.9, 'EQUIP-DETAIL');
    a.log('Added the cross-shaped footing with stacked ballast blocks, the lattice mast with joint plates and ladder, the top platform with rails and the slew ring stub (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic construction material hoist',
  desc: (v) => `Rack-and-pinion material hoist with a ${v.ht} ft lattice mast, a mesh-sided cage car at the base, a fenced loading enclosure with a gate, wall tie arms every second panel and a drive unit on top of the car.`,
  vs: [40, 60, 80, 100].map((ht) => [`${ht} ft mast`, 132, 150, ht * 12, 0, { ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const mx = cx, my = YB - 700, mw = 450; lattice(a, mx - mw, my - mw, mx + mw, my + mw, Z0, Z1 - 100, { n: m.round(v.ht / 5), t: 70, bt: 30 });
    for (let k = 2; k < v.ht / 5; k += 2) { const z = Z0 + ((Z1 - 100 - Z0) * k) / (v.ht / 5); a.tube([[mx - mw, my + mw, z], [mx - mw - 0, YB - 30, z]], [34, 34], 5); a.tube([[mx + mw, my + mw, z], [mx + mw, YB - 30, z]], [34, 34], 5); a.box(mx - mw - 60, YB - 50, z - 60, mx + mw + 60, YB, z + 60); }
    a.box(cx - 1050, YF + 250, Z0 + 50, cx + 1050, YF + 1500, Z0 + 100);
    a.frame(cx - 1000, Z0 + 100, cx + 1000, Z0 + 2300, YF + 300, YF + 340, 50); a.frame(cx - 1000, Z0 + 100, cx + 1000, Z0 + 2300, YF + 1400, YF + 1440, 50); a.box(cx - 1000, YF + 300, Z0 + 2300, cx + 1000, YF + 1440, Z0 + 2360);
    for (const x of [cx - 1000, cx + 1000 - 50]) a.box(x, YF + 300, Z0 + 100, x + 50, YF + 1440, Z0 + 2300);
    for (let z = Z0 + 300; z < Z0 + 2200; z += 220) a.box(cx - 1000, YF + 300, z, cx + 1000, YF + 310, z + 8);
    a.box(cx - 260, YF + 1000, Z0 + 2360, cx + 260, YF + 1440, Z0 + 2900); a.cyl(cx, YF + 1220, Z0 + 2900, Z0 + 3000, 150, 12);
    const fx = X0 + 100; a.box(X0 + 60, YF + 20, Z0, X1 - 60, YF + 70, Z0 + 1500); a.box(X0 + 60, YF + 1900, Z0, X1 - 60, YB - 1500, Z0 + 5); rail(a, X0 + 100, YF + 60, X1 - 100, YF + 60, Z0 + 100, Z0 + 1300, 20, 5, true);
    a.log('Added the lattice mast with wall tie arms, the mesh-sided cage car with a drive unit and the fenced loading enclosure with a gate (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic construction site hoarding',
  desc: (v) => `Plywood site hoarding ${v.len} ft long and ${v.ht} ft high on square posts at 8 ft centres, with sheet joints, a kicker board, a top rail and raking braces to the ground at the back${v.win ? ', and viewing windows cut into three sheets' : ''}.`,
  vs: [[8, 16, false], [8, 32, false], [10, 16, false], [10, 32, true]].map(([ht, len, win]) => [`${ht} ft high, ${len} ft run${win ? ' with viewing windows' : ''}`, len * 12, 36, ht * 12 + 4, 0, { ht, len, win }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); const t = 60, fy = YB - 100, hz = Z1 - 100;
    for (let x = X0 + 60; x <= X1 - 60 + 1; x += (W - 120) / m.round(v.len / 8)) { a.box(x - 50, fy - 50, Z0, x + 50, fy + 50, hz); a.rect(x - 50, fy - 50, x + 50, fy + 50); a.tube([[x, fy, Z0 + (hz - Z0) * 0.8], [x, YF + 80, Z0 + 20]], [22, 22], 5); a.line(x, fy, x, YF + 80, 'EQUIP-DETAIL'); a.box(x - 140, YF + 50, Z0, x + 140, YF + 110, Z0 + 20); }
    a.box(X0, fy - 70, Z0 + 120, X1, fy - 10, hz); a.box(X0, fy - 70, Z0, X1, fy - 10, Z0 + 120); a.box(X0, fy - 70, hz, X1, fy + 40, hz + 50);
    for (let x = X0 + 1219; x < X1 - 100; x += 1219) a.box(x - 6, fy - 78, Z0 + 120, x + 6, fy - 70, hz); a.line(X0, fy - 40, X1, fy - 40, 'EQUIP-DETAIL');
    if (v.win) for (const x of [X0 + W * 0.2, X0 + W * 0.5, X0 + W * 0.8]) a.frame(x - 300, Z0 + 1300, x + 300, Z0 + 1900, fy - 85, fy - 70, 40);
    a.log('Added the posts, plywood sheets with joints, kicker, top rail and rear raking braces' + (v.win ? ' and three framed viewing windows' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic temporary construction fence',
  desc: (v) => `Temporary fence of ${v.n} wire-mesh panels ${v.ht} ft high, each a welded frame with vertical wires and cross wires, set on concrete feet joined by coupler clamps${v.screen ? ', with a screen fabric strip along the top third' : ''}.`,
  vs: [[78, 3, 6.5, false], [78, 5, 6.5, false], [96, 3, 8, false], [96, 5, 8, true]].map(([h, n, ht, screen]) => [`${ht} ft high, ${n} panels${screen ? ' with screen' : ''}`, n * 144, 30, h, 0, { n, ht, screen }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, pw = W / v.n; a.outline();
    for (let i = 0; i < v.n; i++) { const x0 = X0 + i * pw + 20, x1 = X0 + (i + 1) * pw - 20; a.frame(x0, Z0 + 250, x1, Z1 - 20, cy - 10, cy + 10, 36);
      for (let x = x0 + 120; x < x1 - 60; x += 100) a.box(x - 4, cy - 4, Z0 + 270, x + 4, cy + 4, Z1 - 40); for (const z of [Z0 + 700, (Z0 + Z1) / 2 + 100, Z1 - 600]) a.box(x0 + 30, cy - 4, z - 4, x1 - 30, cy + 4, z + 4);
      if (v.screen) a.box(x0 + 40, cy + 8, Z1 - 700, x1 - 40, cy + 14, Z1 - 60);
      a.rect(x0, cy - 10, x1, cy + 10, 'EQUIP-DETAIL'); for (const x of [x0 + 150, x1 - 150]) { a.box(x - 25, cy - 20, Z0 + 250, x + 25, cy + 20, Z0 + 400); }
    }
    for (let i = 0; i <= v.n; i++) { const x = X0 + i * pw; if (i < v.n) { a.box(x + 60, cy - 160, Z0, x + 560, cy + 160, Z0 + 250); a.rect(x + 60, cy - 160, x + 560, cy + 160, 'EQUIP-DETAIL'); } if (i > 0) { a.box(x - 560, cy - 160, Z0, x - 60, cy + 160, Z0 + 250); } if (i && i < v.n) { a.box(x - 25, cy - 40, Z0 + 900, x + 25, cy + 40, Z0 + 1000); a.box(x - 25, cy - 40, Z1 - 800, x + 25, cy + 40, Z1 - 700); } }
    a.log('Added the welded mesh panels with vertical and cross wires, concrete feet, coupler clamps' + (v.screen ? ' and the screen fabric strip' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic construction site swing gate',
  desc: (v) => `Double-leaf swing gate for a ${v.clear} ft opening, two posts with footings, two framed leaves with vertical bars and a diagonal brace each, hinge straps, a centre drop bolt and a chain latch; plan shows both swings.`,
  vs: [12, 16, 20, 24].map((clear) => [`${clear} ft opening`, (clear + 1) * 12, 12, 84, 0, { clear }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, pw = 150; a.outline('EQUIP-HIDDEN');
    for (const x of [X0 + pw / 2, X1 - pw / 2]) { a.box(x - pw / 2, cy - 100, Z0, x + pw / 2, cy + 100, Z1); a.box(x - 250, cy - 250, Z0, x + 250, cy + 250, Z0 + 20); a.rect(x - pw / 2, cy - 100, x + pw / 2, cy + 100); }
    const lw = (W - 2 * pw) / 2 - 20;
    for (let i = 0; i < 2; i++) { const x0 = i ? cx + 10 : X0 + pw + 10, x1 = x0 + lw; a.frame(x0, Z0 + 120, x1, Z1 - 120, cy - 25, cy + 25, 50);
      for (let x = x0 + 150; x < x1 - 100; x += 130) a.box(x - 8, cy - 8, Z0 + 170, x + 8, cy + 8, Z1 - 170); a.box(x0 + 50, cy - 8, (Z0 + Z1) / 2 - 25, x1 - 50, cy + 8, (Z0 + Z1) / 2 + 25);
      a.tube(i ? [[x0 + 50, cy, Z1 - 170], [x1 - 50, cy, Z0 + 170]] : [[x0 + 50, cy, Z0 + 170], [x1 - 50, cy, Z1 - 170]], [24, 24], 5);
      for (const z of [Z0 + 400, Z1 - 400]) a.box(i ? x1 - 0 - 30 : x0 - 120, cy - 30, z - 30, i ? x1 + 120 : x0 + 30, cy + 30, z + 30);
      a.rect(x0, cy - 25, x1, cy + 25, 'EQUIP-DETAIL'); a.arc(i ? x1 : x0, cy, lw, i ? 90 : 0, i ? 180 : 90); }
    a.cyl(cx, cy, Z0, Z0 + 250, 22, 6); a.box(cx - 70, cy - 45, Z0 + 1100, cx + 70, cy + 45, Z0 + 1200); a.tube([[cx - 60, cy + 40, Z0 + 1150], [cx, cy + 60, Z0 + 900], [cx + 60, cy + 40, Z0 + 1150]], [10, 10, 10], 4);
    a.log('Added the two posts with footings, the framed leaves with bars and braces, hinge straps, the drop bolt and chain latch and both swing arcs (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic construction site sliding gate',
  desc: (v) => `Cantilever sliding gate for a ${v.open} ft opening: a framed leaf with vertical bars and a counterbalance tail, two guide posts with roller pairs, a floor track and a latch post.`,
  vs: [16, 24, 32].map((open) => [`${open} ft opening`, (open + m.round(open * 0.5) + 2) * 12, 14, 84, 0, { open }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, lw = v.open * FT * 1.4; a.outline('EQUIP-HIDDEN');
    a.box(X0, cy - 40, Z0, X1, cy + 40, Z0 + 20); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
    const lx0 = X1 - lw - 300; a.frame(lx0, Z0 + 200, X1 - 300, Z1 - 100, cy - 30, cy + 30, 60);
    for (let x = lx0 + 140; x < X1 - 400; x += 140) a.box(x - 8, cy - 8, Z0 + 260, x + 8, cy + 8, Z1 - 160); a.box(lx0, cy - 40, Z0 + 140, X1 - 300, cy + 40, Z0 + 260);
    a.tube([[lx0 + 60, cy, Z0 + 260], [lx0 + lw * 0.55, cy, Z1 - 160]], [28, 28], 5); a.rect(lx0, cy - 30, X1 - 300, cy + 30, 'EQUIP-DETAIL');
    for (const x of [X1 - 600, lx0 + lw * 0.5]) { a.box(x - 120, cy - 150, Z0, x + 120, cy + 150, Z0 + 1000); for (const y of [cy - 80, cy + 80]) a.xcyl(x - 70, x + 70, y, Z0 + 250, 60, 8); a.rect(x - 120, cy - 150, x + 120, cy + 150); }
    a.box(X0, cy - 120, Z0, X0 + 220, cy + 120, Z1); a.rect(X0, cy - 120, X0 + 220, cy + 120);
    a.log('Added the framed leaf with bars, tail and floor track, two guide posts with roller pairs and the latch post (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site wheel wash bay',
  desc: (v) => `Drive-through wheel wash ${v.len} ft long: a steel grating deck between two sloped ramps, side kerbs, a spray arch with nozzles over the middle, a sump tank and a pump room at the side with pipework.`,
  vs: [30, 40, 50].map((len) => [`${len} ft long`, len * 12, 168, 132, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
    const rl = 1800, dz = Z0 + 330, dy0 = YF + 900, dy1 = YB - 1500;
    prismY(a, [[X0, Z0], [X0 + rl, dz], [X1 - rl, dz], [X1, Z0]], dy0, dy1);
    for (let x = X0 + rl; x < X1 - rl; x += 120) a.box(x, dy0 + 120, dz, x + 25, dy1 - 120, dz + 25); a.rect(X0 + rl, dy0, X1 - rl, dy1, 'EQUIP-DETAIL'); a.line(X0, dy0, X0 + rl, dy0, 'EQUIP-DETAIL'); a.line(X1 - rl, dy0, X1, dy0, 'EQUIP-DETAIL');
    for (const y of [dy0, dy1 - 140]) a.box(X0 + rl, y, dz, X1 - rl, y + 140, dz + 260);
    const ax = cx, az = Z1 - 150; for (const y of [dy0 + 50, dy1 - 50]) a.box(ax - 90, y - 45, dz, ax + 90, y + 45, az); a.box(ax - 90, dy0 + 50, az - 160, ax + 90, dy1 - 50, az);
    for (let y = dy0 + 400; y < dy1 - 300; y += 380) { a.cyl(ax, y, az - 260, az - 160, 22, 6); } a.circ(ax, cy - 10, 20, 'EQUIP-DETAIL');
    a.box(cx - 1500, YB - 1300, Z0, cx + 1500, YB - 100, Z0 + 1200); a.rect(cx - 1500, YB - 1300, cx + 1500, YB - 100, 'EQUIP-DETAIL'); a.box(cx - 1500, YB - 1300, Z0 + 1200, cx - 400, YB - 100, Z0 + 1900); a.cyl(cx + 700, YB - 700, Z0 + 1200, Z0 + 1600, 280, 14);
    a.tube([[cx - 100, YB - 1300, Z0 + 500], [cx - 100, dy1 - 100, Z0 + 500], [ax, dy1 - 50, az - 160]], [40, 40, 40], 6);
    a.log('Added the sloped ramps, the grating deck with kerbs, the spray arch with nozzles, the sump tank, the pump room and pipework (plan and 3D).');
  } });

/** a portable cabin on skids: long face toward the front, door and windows, step platform, roof unit */
function cabin(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
  const sk = o.skid ?? 250, f0 = o.f0 ?? 950, rz = Z1 - (o.ac ? 420 : 200); a.box(X0 + 60, YF + f0 + 20, Z0, X1 - 60, YF + f0 + 230, Z0 + sk); a.box(X0 + 60, YB - 330, Z0, X1 - 60, YB - 120, Z0 + sk);
  a.box(X0 + 20, YF + f0, Z0 + sk, X1 - 20, YB - 100, rz); a.box(X0, YF + f0 - 40, rz, X1, YB - 60, o.ac ? rz + 120 : Z1); a.rect(X0 + 20, YF + f0, X1 - 20, YB - 100);
  const fy = YF + f0, wz0 = Z0 + sk + 800, wz1 = rz - 350, nw = o.nw, dw = o.door ?? 900;
  const slots = nw + 1, sw = (W - 400) / slots;
  for (let i = 0; i < slots; i++) { const x0 = X0 + 200 + i * sw; if (i === (o.doorAt ?? 0)) { a.frame(x0 + 60, Z0 + sk + 40, x0 + 60 + dw, rz - 300, fy - 100, fy, 100); a.box(x0 + 60 + dw - 140, fy - 130, Z0 + sk + 900, x0 + 60 + dw - 100, fy - 90, Z0 + sk + 1000); a.rect(x0 + 60, fy - 100, x0 + 60 + dw, fy, 'EQUIP-DETAIL'); } else { a.frame(x0 + 150, wz0, x0 + sw - 150, wz1, fy - 100, fy, 90); a.box(x0 + sw / 2 - 30, fy - 100, wz0, x0 + sw / 2 + 30, fy, wz1); a.rect(x0 + 150, fy - 100, x0 + sw - 150, fy, 'EQUIP-DETAIL'); } }
  const ds = X0 + 200 + (o.doorAt ?? 0) * sw + 60 - 150; a.box(ds, fy - 900, Z0 + sk + 40, ds + dw + 300, fy - 14, Z0 + sk + 120); rail(a, ds, fy - 900, ds + dw + 300, fy - 900, Z0 + sk + 120, Z0 + sk + 1050, 16, 3);
  a.box(ds, fy - 900, Z0, ds + 60, fy - 850, Z0 + sk + 40); a.box(ds + dw + 240, fy - 900, Z0, ds + dw + 300, fy - 850, Z0 + sk + 40);
  if (o.ac) a.box(X1 - 700, YB - 800, rz + 120, X1 - 100, YB - 300, Z1);
  for (const x of [X0 + 300, X1 - 300]) a.box(x - 60, fy - 30, Z0 + sk - 30, x + 60, fy, Z0 + sk + 100);
  return a;
}
F_({ cat: 'site/landscape', title: 'Generic portable site office',
  desc: (v) => `Portable site office unit ${v.len} ft long on steel skids, with a front door and a landing with steps and rails, ${v.nw} framed windows with a mid post, a flat roof with a unit on top and lifting corners.`,
  vs: [[10, 1], [16, 2], [24, 3], [32, 4]].map(([len, nw]) => [`${len} ft long`, len * 12, 132, 108, 0, { len, nw }]),
  build: (a, v) => { cabin(a, { nw: v.nw, ac: true }); a.log('Added the skids, the office body with door, steps and rails, framed windows, the roof unit and lifting corners (plan and 3D).'); } });

F_({ cat: 'site/landscape', title: 'Generic site shipping container',
  desc: (v) => `Steel shipping container ${v.len} ft long with a corrugated side wall, corner castings, top and bottom side rails, and a two-leaf end door with four locking rods, cam keepers and hinges.`,
  vs: [['10 ft', 10, 8.5], ['20 ft', 20, 8.5], ['40 ft', 40, 8.5], ['40 ft high cube', 40, 9.5]].map(([l, len, h]) => [l, len * 12, 96, h * 12, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
    a.box(X0, YF + 30, Z0 + 150, X1 - 30, YB - 30, Z1 - 150); a.box(X1 - 30, YF + 30, Z0 + 150, X1, YB - 30, Z1 - 150);
    for (let x = X0 + 80; x < X1 - 140; x += 90) { a.box(x, YF + 12, Z0 + 230, x + 45, YF + 30, Z1 - 230); a.box(x, YB - 30, Z0 + 230, x + 45, YB - 12, Z1 - 230); }
    for (const z of [Z0, Z1 - 150]) { a.box(X0, YF, z, X1, YF + 60, z + 150); a.box(X0, YB - 60, z, X1, YB, z + 150); a.box(X0, YF, z, X1, YB, z + 60); }
    for (const [x, y, z] of [[X0, YF, Z0], [X1 - 160, YF, Z0], [X0, YB - 160, Z0], [X1 - 160, YB - 160, Z0], [X0, YF, Z1 - 160], [X1 - 160, YF, Z1 - 160], [X0, YB - 160, Z1 - 160], [X1 - 160, YB - 160, Z1 - 160]]) a.box(x, y, z, x + 160, y + 160, z + 160);
    for (const y of [cy - 480, cy - 160, cy + 160, cy + 480]) { a.tube([[X1 + 0 - 25, y, Z0 + 200], [X1 - 25, y, Z1 - 200]], [14, 14], 6); a.box(X1 - 45, y - 40, Z0 + 700, X1 - 5, y + 40, Z0 + 780); }
    a.line(X1 - 30, cy, X1 - 30, cy, 'EQUIP-DETAIL'); a.line(X1 - 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL'); a.line(X1 - 30, cy, X1, cy, 'EQUIP-DETAIL');
    for (let x = X0 + 2000; x < X1 - 100; x += 2000) a.line(x, YF, x, YF + 12, 'EQUIP-DETAIL');
    a.log('Added the frame with corner castings and side rails, the corrugated wall and the two-leaf end door with locking rods and cams (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic construction light tower trailer',
  desc: (v) => `Trailer-mounted light tower with a ${v.mast} ft telescoping mast of three sections, a head frame carrying ${v.lamps} lamps, a generator canopy, four stabiliser legs, two wheels and a tow bar with a jack stand.`,
  vs: [[20, 4], [25, 4], [30, 4], [30, 6]].map(([mast, lamps]) => [`${mast} ft mast, ${lamps} lamps`, 72, 150, mast * 12 + 20, 0, { mast, lamps }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    wheelPairs(a, [YB - 1400], 330, 190, 20); a.box(X0 + 120, YF + 500, Z0 + 420, X1 - 120, YB - 100, Z0 + 520);
    a.box(X0 + 120, YB - 1900, Z0 + 520, X1 - 120, YB - 150, Z0 + 1400); a.rect(X0 + 120, YB - 1900, X1 - 120, YB - 150, 'EQUIP-DETAIL');
    for (let z = Z0 + 700; z < Z0 + 1300; z += 60) a.box(X0 + 200, YB - 1905, z, X1 - 200, YB - 1900, z + 22);
    a.tube([[X0 + 250, YF + 500, Z0 + 470], [cx, YF + 60, Z0 + 520]], [30, 30], 6); a.tube([[X1 - 250, YF + 500, Z0 + 470], [cx, YF + 60, Z0 + 520]], [30, 30], 6); a.cyl(cx, YF + 60, Z0 + 330, Z0 + 520, 40, 8);
    for (const [x, y] of [[X0 + 80, YF + 1000], [X1 - 80, YF + 1000], [X0 + 80, YB - 500], [X1 - 80, YB - 500]]) { a.tube([[x, y, Z0 + 450], [x, y, Z0 + 60]], [25, 25], 6); a.box(x - 100, y - 100, Z0, x + 100, y + 100, Z0 + 40); }
    const mx = cx, my = YB - 1000, zt = Z1 - 450; a.tube([[mx, my, Z0 + 1400], [mx, my, Z0 + 1400 + (zt - Z0 - 1400) * 0.34]], [75, 75], 10); a.tube([[mx, my, Z0 + 1400 + (zt - Z0 - 1400) * 0.34], [mx, my, Z0 + 1400 + (zt - Z0 - 1400) * 0.67]], [58, 58], 10); a.tube([[mx, my, Z0 + 1400 + (zt - Z0 - 1400) * 0.67], [mx, my, zt]], [42, 42], 10);
    a.circ(mx, my, 75, 'EQUIP-DETAIL'); const hw = v.lamps > 4 ? 900 : 650; a.box(mx - hw, my - 30, zt, mx + hw, my + 30, zt + 60);
    for (let i = 0; i < v.lamps; i++) { const x = mx - hw + 140 + ((2 * hw - 280) * i) / (v.lamps - 1); a.box(x - 130, my - 120, zt + 60, x + 130, my + 70, zt + 380); a.ell(x, my - 125, zt + 220, 90, 20, 90, 10, 4); }
    a.log('Added the trailer chassis, tow bar with jack stand, generator canopy, stabiliser legs, three-section mast and the lamp head frame (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic construction roll-off skip',
  desc: (v) => `Open-top steel skip, ${v.yd} cubic yards, with a flat floor, sloped end walls, upright stiffeners along the sides, a top rim, a lifting hook bar at the front end and rear rollers.`,
  vs: [[10, 12, 7.5, 3.5], [20, 22, 7.5, 4.2], [30, 22, 8, 6], [40, 22, 8, 7.5]].map(([yd, L, Wd, h]) => [`${yd} yd`, L * 12, Wd * 12, h * 12, 0, { yd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
    const fl = Z0 + 200; a.box(X0, YF, Z0 + 120, X1, YB, fl);
    a.box(X0 + 500, YF, fl, X1 - 500, YF + 40, Z1); a.box(X0 + 500, YB - 40, fl, X1 - 500, YB, Z1);
    prismY(a, [[X0, fl], [X0 + 500, fl], [X0 + 500, Z1], [X0 + 100, Z1]], YF, YB); prismY(a, [[X1 - 500, fl], [X1, fl], [X1 - 100, Z1], [X1 - 500, Z1]], YF, YB);
    for (let x = X0 + 700; x < X1 - 600; x += 480) { a.box(x, YF - 0, fl, x + 50, YF + 60, Z1); a.box(x, YB - 60, fl, x + 50, YB, Z1); }
    a.box(X0 + 100, YF, Z1 - 60, X1 - 100, YF + 80, Z1); a.box(X0 + 100, YB - 80, Z1 - 60, X1 - 100, YB, Z1);
    a.tube([[X0 + 60, cy - 350, Z1 - 400], [X0 - 0, cy - 350, Z1 - 150], [X0 + 0, cy + 350, Z1 - 150], [X0 + 60, cy + 350, Z1 - 400]], [40, 40, 40, 40], 6);
    for (const y of [YF + 150, YB - 150]) a.xcyl(X1 - 400, X1 - 250, y, Z0 + 100, 100, 10); a.line(X0 + 500, YF, X0 + 500, YB, 'EQUIP-DETAIL'); a.line(X1 - 500, YF, X1 - 500, YB, 'EQUIP-DETAIL');
    a.log('Added the floor, side walls with stiffeners, sloped end walls, the top rim, the lifting hook bar and the rear rollers (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site cement silo',
  desc: (v) => `Vertical cement silo, ${v.t} tonnes, on four braced legs with a cone outlet and a butterfly valve, a welded shell with weld bands, a roof cone with a dust filter box, a caged ladder and a filling pipe up the side.`,
  vs: [[30, 8, 28], [50, 9, 32], [80, 10, 36], [100, 10.5, 40]].map(([t, dia, h]) => [`${t} tonne`, (dia + 3) * 12, (dia + 3) * 12, h * 12, 0, { t, dia }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, r = (v.dia * FT) / 2; a.outline(); a.circ(cx, cy, r, 'EQUIP-DETAIL');
    const zb = Z0 + 2600, cz = zb + r * 1.4, zt = Z1 - 900;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { a.tube([[cx + sx * r * 0.72, cy + sy * r * 0.72, Z0], [cx + sx * r * 0.72, cy + sy * r * 0.72, cz]], [70, 70], 8); a.rect(cx + sx * r * 0.72 - 120, cy + sy * r * 0.72 - 120, cx + sx * r * 0.72 + 120, cy + sy * r * 0.72 + 120); }
    for (const z of [Z0 + 1000, Z0 + 1800]) { a.tube([[cx - r * 0.72, cy - r * 0.72, z], [cx + r * 0.72, cy - r * 0.72, z]], [30, 30], 5); a.tube([[cx - r * 0.72, cy + r * 0.72, z], [cx + r * 0.72, cy + r * 0.72, z]], [30, 30], 5); }
    a.tube([[cx - r * 0.72, cy - r * 0.72, Z0 + 300], [cx + r * 0.72, cy - r * 0.72, Z0 + 1800]], [28, 28], 5); a.tube([[cx + r * 0.72, cy - r * 0.72, Z0 + 300], [cx - r * 0.72, cy - r * 0.72, Z0 + 1800]], [28, 28], 5);
    a.cone(cx, cy, zb, cz, 250, r, 26); a.cyl(cx, cy, cz, zt, r, 26); a.cone(cx, cy, zt, zt + 600, r, r * 0.35, 26); a.cyl(cx, cy, zt + 600, zt + 700, r * 0.35, 14);
    for (let z = cz + 1100; z < zt; z += 1250) ring(a, cx, cy, z, r + 12, 14, 26);
    a.cyl(cx, cy, zb - 400, zb, 250, 12); a.box(cx - 330, cy - 120, zb - 520, cx + 330, cy + 120, zb - 400); a.cyl(cx, cy, zb - 520, zb - 400, 330, 12);
    a.box(cx - 380, cy - 380, zt + 700, cx + 380, cy + 380, Z1); a.box(cx - 400, cy - 400, Z1 - 100, cx + 400, cy + 400, Z1);
    const lx = cx - r * 0.45, ly = cy - r - 60; lad(a, lx, ly, Z0 + 600, zt + 300, 420, 20); for (let z = Z0 + 2600; z < zt + 300; z += 600) { a.tube([[lx - 300, ly - 100, z], [lx - 300, ly - 100, z + 5]], [10, 10], 4); ring(a, lx, ly + 60, z, 330, 8, 12); }
    const px = cx + r + 120; a.tube([[px, cy, Z0 + 700], [px, cy, zt + 500], [px - 300, cy, zt + 500]], [60, 60, 60], 8); a.circ(px, cy, 60, 'EQUIP-DETAIL');
    a.log('Added the braced legs, cone outlet with butterfly valve, shell with weld bands, roof cone with the filter box, the caged ladder and the filling pipe (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site portable toilet',
  desc: (v) => `${v.kind === 'bank' ? 'A bank of three portable toilet cubicles' : v.kind === 'trailer' ? 'A wheeled toilet trailer of four cubicles with a tow bar and jack legs' : v.kind === 'acc' ? 'A wide accessible portable toilet cubicle with an entry ramp' : 'A single portable toilet cubicle'} with sloped roofs, vent stacks, framed doors with handles and locks, and moulded walls with a base step.`,
  vs: [['single cubicle', 44, 44, 92, 0, { kind: 'one', n: 1 }], ['accessible cubicle with ramp', 100, 84, 92, 0, { kind: 'acc', n: 1 }], ['bank of 3 cubicles', 132, 44, 92, 0, { kind: 'bank', n: 3 }], ['trailer, 4 cubicles', 192, 100, 112, 0, { kind: 'trailer', n: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const tr = v.kind === 'trailer', acc = v.kind === 'acc', z0 = Z0 + (tr ? 420 : 60), bw = acc ? (W - 600) : W, bx0 = acc ? X0 + 600 : X0, ydo = acc ? YF + 800 : YF;
    if (tr) { wheelPairs(a, [YB - 900], 330, 170, 20); a.box(X0 + 60, YF + 400, Z0 + 330, X1 - 60, YB - 40, z0); a.tube([[X0 + 400, YF + 400, Z0 + 380], [cx, YF + 40, Z0 + 420]], [26, 26], 6); a.tube([[X1 - 400, YF + 400, Z0 + 380], [cx, YF + 40, Z0 + 420]], [26, 26], 6); }
    const y0 = tr ? YF + 400 : ydo, cw = bw / v.n;
    a.box(bx0 + 10, y0, z0 - 40, bx0 + bw - 10, YB, z0); 
    for (let i = 0; i < v.n; i++) { const x0 = bx0 + i * cw + 12, x1 = bx0 + (i + 1) * cw - 12;
      a.box(x0, y0 + 10, z0, x1, YB - 10, Z1 - 140); prismX(a, [[y0 - 20, Z1 - 150], [YB, Z1 - 150], [YB, Z1 - 90], [y0 - 20, Z1 - 20]], x0 - 10, x1 + 10);
      const dw = m.min(cw - 280, acc ? 900 : 640); a.frame(x0 + 100, z0 + 40, x0 + 100 + dw, Z1 - 260, y0 - 6, y0 + 10, 40); a.box(x0 + 100 + dw - 90, y0 - 16, z0 + 900, x0 + 100 + dw - 50, y0 + 4, z0 + 1040); a.box(x0 + 130, y0 - 6, Z1 - 560, x0 + 100 + dw - 30, y0 + 2, Z1 - 300);
      a.cyl((x0 + x1) / 2, YB - 120, Z1 - 20, Z1 + 0.01 - 0.01 + 0.5, 3, 4); a.cyl(x1 - 120, YB - 120, Z1 - 150, Z1 - 20, 28, 8); a.rect(x0, y0, x1, YB, 'EQUIP-DETAIL'); a.line(x0 + 100 + dw, y0, x0 + 100 + dw, y0 + 40, 'EQUIP-DETAIL'); }
    if (acc) { prismX(a, [[YF + 60, z0 - 40 - 0 - 0 + 0 - 0 + 0 - 40 + 40 - 0], [ydo, z0 - 40], [ydo, z0 - 40]].slice(0, 0).concat([[YF + 60, Z0], [ydo, Z0], [ydo, z0 - 40]]), X0 + 100, X0 + 700); rail(a, X0 + 100, YF + 60, X0 + 100, ydo, Z0 + 500, Z0 + 1000, 14, 3); rail(a, X0 + 700, YF + 60, X0 + 700, ydo, Z0 + 500, Z0 + 1000, 14, 3); }
    a.log('Added the moulded cubicle walls with sloped roofs, vent stacks, framed doors with handles and locks' + (tr ? ', the wheeled chassis and tow bar' : '') + (acc ? ' and the entry ramp with rails' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site covered pedestrian walkway',
  desc: (v) => `Covered footpath shed ${v.len} ft long: scaffold-tube posts on both sides at 8 ft centres, deck beams and a plank deck, a plywood roof, a solid kicker panel on the traffic side, a guard rail on the building side and an overhead light strip.`,
  vs: [16, 24, 32, 40].map((len) => [`${len} ft long`, len * 12, 96, 126, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
    const n = v.len / 8, rz = Z1 - 150; a.box(X0, YF + 40, Z0 + 150, X1, YB - 40, Z0 + 230);
    for (let i = 0; i <= n; i++) { const x = X0 + 60 + ((W - 120) * i) / n; for (const y of [YF + 80, YB - 80]) { a.tube([[x, y, Z0], [x, y, rz]], [24, 24], 6); a.rect(x - 30, y - 30, x + 30, y + 30); } a.tube([[x, YF + 80, rz - 100], [x, YB - 80, rz - 100]], [22, 22], 5); a.line(x, YF + 80, x, YB - 80, 'EQUIP-DETAIL'); }
    for (const y of [YF + 80, YB - 80]) { a.tube([[X0 + 60, y, Z0 + 1000], [X1 - 60, y, Z0 + 1000]], [20, 20], 5); a.tube([[X0 + 60, y, rz - 100], [X1 - 60, y, rz - 100]], [20, 20], 5); }
    a.box(X0, YF, rz, X1, YB, Z1); a.box(X0, YF + 30, Z0 + 230, X1, YF + 90, Z0 + 1400); a.tube([[X0 + 60, YB - 80, Z0 + 1100], [X1 - 60, YB - 80, Z0 + 1100]], [20, 20], 5);
    for (let x = X0 + 1219; x < X1; x += 1219) a.line(x, YF + 30, x, YF + 90, 'EQUIP-DETAIL');
    a.box(X0 + 200, cy_(a) + 0 - 50 - 0, rz - 40, X1 - 200, cy_(a) + 50, rz);
    for (let x = X0 + 600; x < X1 - 400; x += 1600) a.box(x - 180, YB - 160, rz - 120, x + 180, YB - 60, rz - 80);
    a.log('Added the scaffold posts, deck beams and plank deck, the plywood roof, the traffic-side kicker panel, the building-side guard rail and the light strip (plan and 3D).');
  } });
function cy_(a) { return a.cy; }

F_({ cat: 'site/landscape', title: 'Generic site debris chute',
  desc: (v) => `Vertical debris chute, ${v.ht} ft long, of stacked tapered hoppers with overlap rings, a top loading hopper, a wall bracket arm at every other joint and a discharge cone at the bottom.`,
  vs: [20, 30, 40].map((ht) => [`${ht} ft long`, 40, 60, ht * 12 + 24, 0, { ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
    const cy = YB - 450, n = m.round(v.ht / 3), zt = Z1 - 450, zb = Z0 + 500, sec = (zt - zb) / n;
    for (let i = 0; i < n; i++) { const z0 = zb + i * sec, z1 = z0 + sec; a.cone(cx, cy, z0, z1, 280, 320, 16); ring(a, cx, cy, z1, 340, 18, 16); if (i % 2 === 0) { a.tube([[cx - 150, cy + 300, z1 - 100], [cx - 150, YB - 30, z1 - 100]], [20, 20], 5); a.tube([[cx + 150, cy + 300, z1 - 100], [cx + 150, YB - 30, z1 - 100]], [20, 20], 5); a.box(cx - 220, YB - 40, z1 - 160, cx + 220, YB, z1 - 40); } }
    a.cone(cx, cy, Z0 + 80, zb, 120, 280, 16); a.cyl(cx, cy, Z0, Z0 + 80, 140, 12);
    a.prism([[cx - 380, cy - 480], [cx + 380, cy - 480], [cx + 330, cy + 20], [cx - 330, cy + 20]], zt + 0, zt + 40); a.box(cx - 380, cy - 480, zt + 40, cx + 380, cy - 440, Z1); a.box(cx - 380, cy - 440, zt + 40, cx - 340, cy + 100, Z1); a.box(cx + 340, cy - 440, zt + 40, cx + 380, cy + 100, Z1);
    a.circ(cx, cy, 300); a.rect(cx - 380, cy - 480, cx + 380, cy + 100, 'EQUIP-DETAIL');
    a.log('Added the stacked tapered hoppers with overlap rings, the top loading hopper, the wall bracket arms and the discharge cone (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site notice board on posts',
  desc: (v) => `Site notice board ${v.bw} ft wide and ${v.bh} ft high on ${v.posts} steel posts, with an outer frame, a header panel and three framed text areas, diagonal back braces${v.lit ? ' and two floodlight arms along the top' : ''}.`,
  vs: [[8, 4, 2, false], [12, 6, 3, false], [16, 8, 3, true]].map(([bw, bh, posts, lit]) => [`${bw} x ${bh} ft${lit ? ' with lights' : ''}`, bw * 12 + 12, 14, bh * 12 + 40 + (lit ? 20 : 0), 0, { bw, bh, posts, lit }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
    const bz0 = Z0 + 900, bz1 = bz0 + v.bh * FT, bx0 = X0 + 150, bx1 = X1 - 150, fy = YF + 60;
    for (let i = 0; i < v.posts; i++) { const x = bx0 + 200 + ((bx1 - bx0 - 400) * i) / (v.posts - 1); a.box(x - 60, YB - 130, Z0, x + 60, YB - 10, bz1 - 100); a.box(x - 220, YB - 210, Z0, x + 220, YB - 0, Z0 + 60); a.tube([[x, YB - 130, bz0 + 200], [x, fy + 80, bz0 + 50]], [20, 20], 5); a.rect(x - 60, YB - 130, x + 60, YB - 10); }
    a.box(bx0, fy, bz0, bx1, fy + 80, bz1); a.frame(bx0, bz0, bx1, bz1, fy - 14, fy, 70);
    const hy = bz1 - (bz1 - bz0) * 0.26; a.box(bx0 + 120, fy - 12, hy, bx1 - 120, fy, bz1 - 100);
    const pw = (bx1 - bx0 - 240 - 160) / 3; for (let i = 0; i < 3; i++) a.frame(bx0 + 120 + i * (pw + 80), bz0 + 120, bx0 + 120 + i * (pw + 80) + pw, hy - 80, fy - 12, fy, 40);
    if (v.lit) for (const x of [bx0 + (bx1 - bx0) * 0.25, bx0 + (bx1 - bx0) * 0.75]) { a.tube([[x, fy + 40, bz1], [x, fy - 220, bz1 + 160]], [16, 16], 5); a.box(x - 180, fy - 300, bz1 + 120, x + 180, fy - 160, bz1 + 200); }
    a.rect(bx0, fy, bx1, fy + 80, 'EQUIP-DETAIL');
    a.log('Added the steel posts with footing plates and back braces, the framed board with a header panel and three text areas' + (v.lit ? ' and two floodlight arms' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site cantilever material rack',
  desc: (v) => `Single-sided cantilever rack of ${v.bays} bays at 8 ft: upright columns on base plates, three levels of arms, diagonal back bracing and rolled pipe lengths resting on the arms.`,
  vs: [2, 3, 4].map((bays) => [`${bays} bays`, bays * 96 + 6, 60, 120, 0, { bays }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); const bw = (W - 300) / v.bays, zs = [Z0 + 500, Z0 + 1400, Z0 + 2300];
    for (let i = 0; i <= v.bays; i++) { const x = X0 + 150 + i * bw; a.box(x - 60, YB - 200, Z0, x + 60, YB - 60, Z1 - 100); a.box(x - 180, YB - 480, Z0, x + 180, YB, Z0 + 30); a.box(x - 90, YF + 30, Z0, x + 90, YB - 200, Z0 + 80); for (const z of zs) a.box(x - 35, YF + 100, z, x + 35, YB - 200, z + 70); a.rect(x - 60, YB - 200, x + 60, YB - 60); a.line(x, YF + 100, x, YB - 200, 'EQUIP-DETAIL'); }
    for (let i = 0; i < v.bays; i++) { const x0 = X0 + 150 + i * bw, x1 = x0 + bw; a.tube([[x0, YB - 130, Z0 + 100], [x1, YB - 130, Z1 - 200]], [24, 24], 5); a.tube([[x1, YB - 130, Z0 + 100], [x0, YB - 130, Z1 - 200]], [24, 24], 5);
      zs.forEach((z, k) => { for (let p = 0; p < 4 - (k > 1 ? 1 : 0); p++) { const y = YF + 300 + p * 300; a.xcyl(x0 + 100, x1 - 100, y, z + 70 + 100, 100, 10); } a.circ(x0 + 200, YF + 300, 0.5, 'EQUIP-DETAIL'); }); }
    a.log('Added the base plates and columns, three levels of cantilever arms, the diagonal back bracing and the rolled pipe lengths on the arms (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site precast barrier run',
  desc: (v) => `Run of ${v.n} precast concrete barrier section${v.n > 1 ? 's' : ''}, each ${v.sl} ft long and ${v.h} in tall, with a sloped lower face, a vertical top, joint lines and two lifting loops on top of each section.`,
  vs: [[1, 10, 32], [3, 10, 32], [1, 12, 42], [4, 6, 24]].map(([n, sl, h]) => [`${n} x ${sl} ft, ${h} in tall`, n * sl * 12, 24, h, 0, { n, sl, h }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); const hh = Z1 - Z0, sw = W / v.n;
    for (let i = 0; i < v.n; i++) { const x0 = X0 + i * sw + 5, x1 = X0 + (i + 1) * sw - 5; prismX(a, [[YF, Z0], [YB, Z0], [YB - D * 0.18, Z0 + hh * 0.55], [YB - D * 0.3, Z1], [YF + D * 0.3, Z1], [YF + D * 0.18, Z0 + hh * 0.55]], x0, x1); a.line(x0, YF, x0, YB, 'EQUIP-DETAIL');
      for (const f of [0.25, 0.75]) { const x = x0 + (x1 - x0) * f; a.tube([[x - 60, cy, Z1], [x - 60, cy, Z1 + 0.01]], [10, 10], 4); a.box(x - 80, cy - 25, Z1 - 60, x - 40, cy + 25, Z1); a.box(x + 40, cy - 25, Z1 - 60, x + 80, cy + 25, Z1); a.box(x - 80, cy - 25, Z1 - 20, x + 80, cy + 25, Z1); } a.line(x0, cy, x1, cy, 'EQUIP-DETAIL'); }
    a.log('Added the sections with a sloped lower face and vertical top, the joint lines and the lifting loops (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic concrete mixer truck',
  desc: (v) => `Concrete mixer truck for ${v.yd} cubic yards: a cab and chassis with tandem rear axles, a tilted mixing drum with a conical nose and a mouth, spiral blade lines, a rear charging hopper, a discharge chute folded on the back and a ladder.`,
  vs: [[6, 300, 120], [8, 324, 126], [10, 348, 132], [12, 372, 134]].map(([yd, d, h]) => [`${yd} yd drum`, 98, d, h, 0, { yd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a;
    trk(a, { cabL: 1900, nose: 900, cabH: 2800, hoodH: 1400, wr: 520, ground: 520, axles: [1200, D - 2500, D - 1200], ww: 300 });
    const dr = W * 0.43, y0 = YF + 2300, y1 = YB - 500, zl = Z0 + 2050, zh = Z0 + 2050 + (y1 - y0) * 0.12;
    const pts = [[y0, zl, 0.2], [y0 + (y1 - y0) * 0.12, zl + (zh - zl) * 0.12, 0.8], [y0 + (y1 - y0) * 0.35, zl + (zh - zl) * 0.35, 1], [y0 + (y1 - y0) * 0.7, zl + (zh - zl) * 0.7, 1], [y0 + (y1 - y0) * 0.9, zl + (zh - zl) * 0.9, 0.6], [y1, zh, 0.36]];
    a.tube(pts.map(([y, z]) => [cx, y, z]), pts.map(([, , f]) => dr * f), 20);
    for (const f of [0.28, 0.5, 0.72]) { const k = 0.12 + f * 0.0; const y = y0 + (y1 - y0) * f, z = zl + (zh - zl) * f; ring(a, cx, y, z, dr * 1.0 + 8, 10, 20); }
    a.rect(cx - dr, y0, cx + dr, y1, 'EQUIP'); for (let i = -3; i <= 3; i++) a.line(cx + (dr * i) / 3.2, y0 + 600, cx + (dr * i) / 3.2, y1 - 400, 'EQUIP-DETAIL');
    a.box(cx - 450, y0 - 250, Z0 + 1000, cx + 450, y0 + 250, zl - dr * 0.4); a.box(cx - 400, y1 - 450, Z0 + 1300, cx + 400, YB - 300, zh - dr * 0.35);
    a.box(cx - 400, YB - 700, zh - 250, cx + 400, YB - 100, zh + 500); a.tube([[cx, YB - 700, zh + 480], [cx + 80, YB - 250, zh + 120], [cx + 50, YB - 40, Z0 + 1500]], [160, 150, 140], 10);
    for (const s of [-1, 1]) lad(a, cx + s * 0, YB - 20, Z0 + 700, zh + 300, 380, 18); a.box(cx + W * 0.26, y0 + 700, Z0 + 1800, cx + W * 0.5 - 60, y0 + 1400, Z0 + 2300);
    a.log('Added the cab and chassis, the tilted mixing drum with its nose cone, bands and spiral lines, the rear charging hopper, the folded discharge chute and the ladder (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic site flatbed truck',
  desc: (v) => `Flatbed truck with a ${v.deck} ft deck: a cab and chassis, a headboard behind the cab, an edge rail with stake pockets, a rear underride bar and tandem axles${v.crane ? ', and a knuckle boom crane on a pedestal behind the cab with two boom sections, a hook and two outrigger legs' : ''}.`,
  vs: [['12 ft deck', 12, false, 96, 276, 112], ['16 ft deck', 16, false, 96, 324, 112], ['20 ft deck', 20, false, 98, 372, 114], ['16 ft deck with knuckle crane', 16, true, 100, 340, 150]].map(([l, deck, crane, w, d, h]) => [l, w, d, h, 0, { deck, crane }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a;
    trk(a, { cabL: 1900, nose: 900, cabH: 2700, hoodH: 1400, wr: 480, ground: 480, axles: [1100, D - 2300, D - 1100] });
    const dz = Z0 + 1250, dy0 = YF + 2000; a.box(X0 + 20, dy0, dz - 160, X1 - 20, YB, dz); a.rect(X0 + 20, dy0, X1 - 20, YB, 'EQUIP-DETAIL');
    for (let y = dy0 + 300; y < YB - 100; y += 600) for (const x of [X0 + 25, X1 - 25]) a.box(x - 25, y, dz, x + 25, y + 70, dz + 120);
    a.box(X0 + 100, dy0 + 40, dz, X1 - 100, dy0 + 110, dz + 1050); a.box(X0 + 100, YB - 650, Z0 + 520, X1 - 100, YB - 560, Z0 + 640);
    for (const x of [cx - 500, cx + 500]) a.box(x - 25, dy0 + 120, dz, x + 25, YB, dz + 20);
    if (v.crane) { const py = dy0 + 500, pz = dz; a.box(cx - 380, py - 380, pz, cx + 380, py + 380, pz + 700); a.cyl(cx, py, pz + 700, pz + 800, 300, 16); a.tube([[cx, py, pz + 800], [cx + 100, py + 500, pz + 2000]], [140, 130], 10); a.tube([[cx + 100, py + 500, pz + 2000], [cx + 100, py + 2600, Z1 - 150]], [110, 90], 10); a.ell(cx + 100, py + 500, pz + 2000, 170, 170, 170, 10, 5); a.tube([[cx + 100, py + 2600, Z1 - 150], [cx + 100, py + 2600, Z1 - 600]], [10, 10], 4); a.box(cx + 40, py + 2540, Z1 - 800, cx + 160, py + 2660, Z1 - 600);
      for (const s of [-1, 1]) { a.box(cx + s * 1100 - 50, py - 100, dz - 200, cx + s * 1100 + 50, py + 100, dz - 160); a.tube([[cx + s * 380, py, dz + 100], [cx + s * 1100, py, dz - 120]], [40, 40], 6); a.box(cx + s * 1100 - 150, py - 150, Z0, cx + s * 1100 + 150, py + 150, Z0 + 40); }
      a.circ(cx, py, 300, 'EQUIP-DETAIL'); }
    a.log('Added the cab and chassis, the flat deck with edge rail and stake pockets, the headboard, the underride bar and the tandem axles' + (v.crane ? ', the crane pedestal, boom sections, hook and outrigger legs' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic site crew pickup truck',
  desc: (v) => `${v.kind === 'rack' ? 'Crew-cab truck with a service body of side compartment doors and a roof ladder rack' : 'Crew-cab pickup'} with a ${v.kind === 'rack' ? 'tool body' : v.bed === 'long' ? 'long open bed' : 'short open bed'} behind the cab, windscreen and side glass, mirrors, a bumper and four wheels with fenders.`,
  vs: [['short bed', 80, 230, 74, 0, { kind: 'pu', bed: 'short' }], ['long bed', 80, 252, 74, 0, { kind: 'pu', bed: 'long' }], ['service body', 82, 262, 84, 0, { kind: 'rack' }], ['service body, ladder rack', 82, 262, 104, 0, { kind: 'rack', rack: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, rk = v.rack;
    trk(a, { cabL: 2700, nose: 1250, cabH: rk ? 1900 : H - 20, hoodH: 1050, wr: 400, ground: 400, axles: [1250, D - 1000] });
    const bz = Z0 + 1000, by = YF + 2740;
    if (v.kind === 'pu') { a.box(X0 + 40, by, Z0 + 450, X1 - 40, YB - 20, Z0 + 600); for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 60) - 30, by, Z0 + 600, cx + sx * (W / 2 - 60) + 30, YB - 20, bz + 100); a.box(X0 + 40, by, Z0 + 600, X1 - 40, by + 60, bz + 100); a.box(X0 + 40, YB - 80, Z0 + 600, X1 - 40, YB - 20, bz + 60); a.rect(X0 + 40, by, X1 - 40, YB - 20, 'EQUIP-DETAIL'); }
    else { a.box(X0 + 30, by, Z0 + 450, X1 - 30, YB, bz + 600); const n = v.rack ? 3 : 3, cw = (YB - 100 - by) / n; for (let i = 0; i < n; i++) for (const [x, dir] of [[X0 + 30, -1], [X1 - 30, 1]]) { sideFrame(a, x, dir, by + i * cw + 60, by + (i + 1) * cw - 20, Z0 + 600, bz + 450, 40, 12); a.box(dir < 0 ? x - 14 : x + 8, by + i * cw + cw - 140, Z0 + 950, dir < 0 ? x - 8 : x + 14, by + i * cw + cw - 60, Z0 + 1050); } a.box(X0 + 120, YB - 40, bz + 600, X1 - 120, YB, bz + 640); }
    if (rk) { const rz = Z0 + 1900 - 0; a.tube([[X0 + 150, YF + 1200, Z0 + 1900], [X0 + 150, YB - 100, Z0 + 1900]], [20, 20], 5); a.tube([[X1 - 150, YF + 1200, Z0 + 1900], [X1 - 150, YB - 100, Z0 + 1900]], [20, 20], 5); }
    if (v.rack) { const z0 = Z0 + 1900, z1 = Z1 - 60; for (const [y] of [[YF + 1700], [by + 800], [YB - 250]]) { a.tube([[X0 + 150, y, z0], [X0 + 150, y, z1]], [22, 22], 5); a.tube([[X1 - 150, y, z0], [X1 - 150, y, z1]], [22, 22], 5); a.tube([[X0 + 150, y, z1], [X1 - 150, y, z1]], [22, 22], 5); } lad(a, cx, YF + 1700, z1 - 10, z1 - 8, 500, 20); a.tube([[cx - 250, YF + 1700, z1 - 30], [cx - 250, YB - 250, z1 - 30]], [18, 18], 5); a.tube([[cx + 250, YF + 1700, z1 - 30], [cx + 250, YB - 250, z1 - 30]], [18, 18], 5); }
    a.log('Added the crew cab with windscreen, side glass and mirrors, ' + (v.kind === 'pu' ? 'the open bed with sides and tailgate' : 'the tool body with compartment doors') + (v.rack ? ', the roof ladder rack' : '') + ' and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic construction generator set, silenced canopy',
  desc: (v) => `Silenced canopy generator set, ${v.kva} kVA nominal, on a skid with a base fuel tank, louvered doors with handles and swings, louvered end panels, a short exhaust stack and lifting eyes.`,
  vs: [[20, 60, 28, 40, 2], [60, 84, 36, 50, 2], [125, 110, 44, 62, 2], [250, 150, 56, 76, 2], [500, 200, 70, 92, 3]].map(([kva, w, d, h, doors]) => [`${kva} kVA`, w, d, h, 0, { kva, doors }]),
  build: (a, v) => { genset(a, { tank: 250, doors: v.doors, stack: 300, sr: 60, skid: 200 }); a.log('Added the skid, base tank, canopy with louvered doors and swings, end louvers, lifting eyes and the short exhaust stack (plan and 3D).'); } });

F_({ cat: 'site/landscape', title: 'Generic site stair tower',
  desc: (v) => `Scaffold stair tower ${v.ht} ft high: corner posts with ledgers, ${v.fl} stair flights that switch back between landings, treads, handrails on both sides of each flight, guarded landings and base plates.`,
  vs: [[8, 1], [12, 2], [16, 3], [20, 4]].map(([ht, fl]) => [`${ht} ft high`, 108, 96, ht * 12 + 42, 0, { ht, fl }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const rise = (v.ht * FT) / v.fl, topz = Z0 + v.ht * FT;
    for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) { a.tube([[x, y, Z0 + 30], [x, y, topz + 1050]], [24, 24], 6); a.box(x - 110, y - 110, Z0, x + 110, y + 110, Z0 + 30); }
    for (let z = Z0 + 1000; z < topz; z += 2000) for (const [x0, y0, x1, y1] of [[X0 + 60, YF + 60, X1 - 60, YF + 60], [X0 + 60, YB - 60, X1 - 60, YB - 60], [X0 + 60, YF + 60, X0 + 60, YB - 60], [X1 - 60, YF + 60, X1 - 60, YB - 60]]) a.tube([[x0, y0, z], [x1, y1, z]], [20, 20], 5);
    for (let f = 0; f < v.fl; f++) { const z0 = Z0 + 30 + f * rise, lane = f % 2 === 0, ya = lane ? YF + 100 : YB - 100 - 760, yb = ya + 760, steps = m.round(rise / 190), sw = rise / steps, run = W - 700 - 120; const dir = f % 2 === 0 ? 1 : -1;
      for (let s = 0; s < steps; s++) { const x0 = dir > 0 ? X0 + 120 + (run * s) / steps : X1 - 120 - (run * (s + 1)) / steps; a.box(x0, ya, z0 + s * sw, x0 + run / steps, yb, z0 + s * sw + 40); }
      for (const y of [ya, yb]) { a.tube([[dir > 0 ? X0 + 120 : X1 - 120, y, z0 + 900], [dir > 0 ? X0 + 120 + run : X1 - 120 - run, y, z0 + rise + 900]], [18, 18], 5); }
      a.line(dir > 0 ? X0 + 120 : X1 - 120, (ya + yb) / 2, dir > 0 ? X0 + 120 + run : X1 - 120 - run, (ya + yb) / 2, 'EQUIP-DETAIL');
      const lx0 = dir > 0 ? X1 - 580 : X0 + 60, lx1 = dir > 0 ? X1 - 60 : X0 + 580; a.box(lx0, YF + 60, z0 + rise - 30, lx1, YB - 60, z0 + rise + 10); if (f < v.fl - 1) { a.rect(lx0, YF + 60, lx1, YB - 60, 'EQUIP-DETAIL'); } }
    const tz = topz; for (const [x0, y0, x1, y1] of [[X0 + 60, YF + 60, X1 - 60, YF + 60], [X0 + 60, YB - 60, X1 - 60, YB - 60], [X0 + 60, YF + 60, X0 + 60, YB - 60], [X1 - 60, YF + 60, X1 - 60, YB - 60]]) { a.tube([[x0, y0, tz + 500], [x1, y1, tz + 500]], [16, 16], 5); a.tube([[x0, y0, tz + 1050], [x1, y1, tz + 1050]], [18, 18], 5); }
    a.log('Added the corner posts with base plates and ledgers, the switchback stair flights with treads and handrails, the landings and the guard rails (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic towed site water bowser',
  desc: (v) => `Towed water bowser of ${v.gal} gal: a horizontal cylindrical tank with domed ends on a two-wheel chassis, a fill hatch, a pump set with a hose reel at the front, a rear spray bar and a tow bar with a jack stand.`,
  vs: [[500, 64, 126, 66], [1000, 70, 156, 76], [2000, 80, 192, 90]].map(([gal, w, d, h]) => [`${gal} gal`, w, d, h, 0, { gal }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a; a.outline();
    const wr = m.min(330, W * 0.2), tr = m.min((W - 260) / 2, (H - wr * 1.6 - 80 - 140) / 1.9); wheelPairs(a, [YB - D * 0.4], wr, 170, 15);
    a.box(X0 + 120, YF + 600, Z0 + wr * 1.6, X1 - 120, YB - 80, Z0 + wr * 1.6 + 80);
    const zc = Z0 + wr * 1.6 + 80 + tr * 0.9, y0 = YF + 1200, y1 = YB - 200; a.ycyl(y0, y1, cx, zc, tr, 22); a.ell(cx, y0, zc, tr, 60, tr, 14, 6); a.ell(cx, y1, zc, tr, 60, tr, 14, 6); a.rect(X0 + 130, y0, X1 - 130, y1, 'EQUIP');
    for (const f of [0.33, 0.66]) { const y = y0 + (y1 - y0) * f; a.ycyl(y - 20, y + 20, cx, zc, tr + 15, 22); }
    a.cyl(cx, (y0 + y1) / 2, zc + tr, zc + tr + 120, 150, 12); a.circ(cx, (y0 + y1) / 2, 150, 'EQUIP-DETAIL');
    a.box(X0 + 200, YF + 650, Z0 + wr * 1.6 + 80, X1 - 200, YF + 1150, Z0 + wr * 1.6 + 600); a.xcyl(cx - 120, cx + 120, YF + 900, Z0 + wr * 1.6 + 900, 220, 14);
    a.tube([[X0 + 300, YF + 600, Z0 + wr * 1.6 + 40], [cx, YF + 40, Z0 + wr * 1.6]], [28, 28], 6); a.tube([[X1 - 300, YF + 600, Z0 + wr * 1.6 + 40], [cx, YF + 40, Z0 + wr * 1.6]], [28, 28], 6); a.tube([[cx, YF + 60, Z0 + wr * 1.6], [cx, YF + 60, Z0 + 60]], [20, 20], 6); a.box(cx - 120, YF + 0, Z0, cx + 120, YF + 120, Z0 + 40);
    a.tube([[X0 + 150, YB - 20, Z0 + wr * 1.6 + 200], [X1 - 150, YB - 20, Z0 + wr * 1.6 + 200]], [32, 32], 8); for (let x = X0 + 250; x < X1 - 200; x += 160) a.cyl(x, YB - 40, Z0 + wr * 1.6 + 60, Z0 + wr * 1.6 + 200, 10, 4);
    a.log('Added the cylindrical tank with domed ends and bands, the fill hatch, the pump set with hose reel, the rear spray bar, the wheels and the tow bar with jack stand (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic site bunded fuel tank skid',
  desc: (v) => `Self-bunded steel fuel tank skid, ${v.gal} gal, a rectangular tank in a bund trough with lifting lugs and fork pockets, a lockable top hatch with a gauge, a ladder step, a pump cabinet with a hose reel and a nozzle holster.`,
  vs: [[250, 60, 48, 60], [500, 78, 54, 66], [1000, 96, 60, 72], [2000, 132, 66, 78]].map(([gal, w, d, h]) => [`${gal} gal`, w, d, h, 0, { gal }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 140); a.box(X0 + 20, YF + 20, Z0 + 140, X1 - 20, YF + 80, Z0 + 600); a.box(X0 + 20, YB - 80, Z0 + 140, X1 - 20, YB - 20, Z0 + 600); a.box(X0 + 20, YF + 80, Z0 + 140, X0 + 80, YB - 80, Z0 + 600); a.box(X1 - 80, YF + 80, Z0 + 140, X1 - 20, YB - 80, Z0 + 600);
    for (const x of [X0 + W * 0.25, X1 - W * 0.25]) a.box(x - 100, YF + 20, Z0, x + 100, YB - 20, Z0 + 140);
    const tz = Z0 + 600, tw = W - 400, px = X0 + W - 900; a.box(X0 + 130, YF + 130, tz, X0 + 130 + tw - 750, YB - 130, Z1 - 100); a.rect(X0 + 130, YF + 130, X0 + 130 + tw - 750, YB - 130, 'EQUIP');
    const tx1 = X0 + 130 + tw - 750; a.box(X0 + 260, cx * 0 + YF + 180, Z1 - 100, X0 + 560, YF + 480, Z1 - 20); a.cyl(X0 + 410, YF + 330, Z1 - 20, Z1, 60, 8); a.cyl(tx1 - 250, YF + 330, Z1 - 100, Z1 - 30, 90, 10);
    for (const z of [tz + 250, tz + 600]) a.box(tx1 - 6, YF + 130, z, tx1, YB - 130, z + 0.01 + 10);
    a.box(tx1 + 100, YF + 150, Z0 + 140, X1 - 120, YB - 150, Z1 - 120); a.box(tx1 + 130, YF + 100, Z1 - 350, X1 - 150, YF + 150, Z1 - 160); a.frame(tx1 + 160, Z0 + 250, X1 - 160, Z1 - 400, YF + 135, YF + 150, 40);
    a.ycyl(YF + 40, YF + 130, X1 - 360, Z1 - 600, 140, 14); a.tube([[X1 - 160, YF + 100, Z1 - 520], [X1 - 100, YF + 60, Z1 - 800], [X1 - 70, YF + 60, Z1 - 1000]], [14, 14, 14], 6); a.box(X1 - 200, YF + 40, Z1 - 1050, X1 - 30, YF + 100, Z1 - 900);
    a.tube([[tx1 + 40, YF + 60, Z0 + 150], [tx1 + 40, YF + 60, tz + 100]], [14, 14], 5); lad(a, X0 + 200, YF + 30, Z0 + 140, tz + 50, 300, 14);
    for (const [x, y] of [[X0 + 70, YF + 70], [X1 - 70, YF + 70]]) a.box(x - 40, y - 40, Z0 + 600, x + 40, y + 40, Z0 + 700);
    a.line(tx1, YF + 20, tx1, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the bund trough with fork pockets, the tank with hatch and gauge, the ladder step, the pump cabinet with hose reel and the nozzle holster (plan and 3D).');
  } });

// ================================================================================================ MINE SITES
F_({ cat: 'site/landscape', title: 'Generic mine haul-road safety berm',
  desc: (v) => `Haul-road edge berm ${v.h} ft high and 40 ft long, a trapezoid earth bank with sloped sides and a flat crest, with large boulders set along the crest and base and two reflective marker posts.`,
  vs: [4, 5, 6, 7].map((h) => [`${h} ft high`, 480, h * 12 * 3 + 36, h * 12 + 20, 0, { h }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); const bh = v.h * FT, cw = D * 0.2;
    prismX(a, [[YF + 150, Z0], [YB - 150, Z0], [cy + cw / 2, Z0 + bh], [cy - cw / 2, Z0 + bh]], X0, X1); a.line(X0, cy - cw / 2, X1, cy - cw / 2, 'EQUIP-DETAIL'); a.line(X0, cy + cw / 2, X1, cy + cw / 2, 'EQUIP-DETAIL');
    const rs = [0.07, 0.19, 0.31, 0.43, 0.55, 0.67, 0.79, 0.91]; rs.forEach((f, i) => { const x = X0 + W * f; const br = 250 + (i % 3) * 90; a.ell(x, cy + (i % 2 ? 1 : -1) * cw * 0.3, Z0 + bh, br, br * 0.8, br * 0.65, 8, 5); a.ell(x + 200, YF + 350 + (i % 2) * (D - 700), Z0 + 150, br * 0.8, br * 0.7, br * 0.55, 8, 5); a.circ(x, cy + (i % 2 ? 1 : -1) * cw * 0.3, br, 'EQUIP-DETAIL'); });
    for (const x of [X0 + W * 0.2, X0 + W * 0.8]) { a.cyl(x, cy, Z0 + bh, Z1, 30, 6); a.box(x - 80, cy - 8, Z1 - 300, x + 80, cy + 8, Z1 - 100); }
    a.log('Added the trapezoid earth bank with a flat crest, large boulders along the crest and base, and two reflective marker posts (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine ore stockpile',
  desc: (v) => `Conical ore stockpile with a ${v.dia} ft base and a ${v.ht} ft peak, a stepped flank with ridges and spilled lumps at the toe, and contour rings on the plan.`,
  vs: [40, 60, 80, 100, 120].map((dia) => [`${dia} ft base`, dia * 12, dia * 12, m.round(dia * 0.375) * 12, 0, { dia, ht: m.round(dia * 0.375) }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = W / 2 - 60; a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, r);
    a.cone(cx, cy, Z0, Z1 - 100, r, r * 0.07, 28); a.ell(cx, cy, Z1 - 100, r * 0.07, r * 0.07, 120, 10, 5);
    for (let k = 1; k <= 3; k++) a.circ(cx, cy, r * (1 - k * 0.24), 'EQUIP-DETAIL');
    for (let i = 0; i < 14; i++) { const g = (i / 14) * PI * 2 + 0.3, f = 0.22 + (i % 4) * 0.2, rr = r * (1 - f); a.ell(cx + m.cos(g) * rr * 0.98, cy + m.sin(g) * rr * 0.98, Z0 + (Z1 - Z0) * f * 0.97, r * 0.09, r * 0.07, r * 0.05, 8, 4); }
    for (let i = 0; i < 8; i++) { const g = (i / 8) * PI * 2 + 0.15; a.ell(cx + m.cos(g) * (r + 20), cy + m.sin(g) * (r + 20), Z0 + 150, 300, 250, 160, 8, 4); }
    a.log('Added the cone with a stepped flank, ridges, spilled lumps at the toe and the contour rings (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine fuel island canopy',
  desc: (v) => `Fuel island under a flat canopy on ${v.cols} columns, with ${v.disp} dispensers on a raised kerb, hose and nozzle holsters, a horizontal bunded tank of ${v.gal.toLocaleString('en-US')} gal behind on saddles, a pipe run to the island and bollards.`,
  vs: [[10000, 2, 6, 20], [20000, 3, 6, 28], [40000, 4, 8, 36]].map(([gal, disp, cols, w]) => [`${gal.toLocaleString('en-US')} gal tank, ${disp} dispensers`, w * 12, 360, 216, 0, { gal, disp, cols }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const rz = Z1 - 300; a.box(X0 + 300, YF + 900, rz, X1 - 300, YB - 1800, Z1); a.rect(X0 + 300, YF + 900, X1 - 300, YB - 1800, 'EQUIP-HIDDEN');
    const cols = v.cols / 2, cs = (W - 1000) / (cols - 1 || 1);
    for (let i = 0; i < cols; i++) for (const y of [YF + 1200, YB - 2100]) { const x = X0 + 500 + cs * i; a.cyl(x, y, Z0 + 150, rz, 120, 12); a.circ(x, y, 120); }
    a.box(X0 + 600, YF + 1500, Z0, X1 - 600, YB - 2500, Z0 + 200);
    const ds = (W - 1600) / v.disp; for (let i = 0; i < v.disp; i++) { const x = X0 + 800 + ds * (i + 0.5), y = (YF + 1500 + YB - 2500) / 2; a.box(x - 260, y - 200, Z0 + 200, x + 260, y + 200, Z0 + 1700); a.box(x - 280, y - 220, Z0 + 1700, x + 280, y + 220, Z0 + 1900); a.box(x - 200, y - 215, Z0 + 1000, x + 200, y - 200, Z0 + 1500); a.tube([[x + 260, y, Z0 + 1400], [x + 380, y - 150, Z0 + 1100], [x + 330, y - 200, Z0 + 900]], [14, 14, 14], 5); a.rect(x - 260, y - 200, x + 260, y + 200, 'EQUIP-DETAIL'); }
    const ty = YB - 750, tr = 650; a.box(X0 + 200, YB - 1500, Z0, X1 - 200, YB - 20, Z0 + 350); a.box(X0 + 200, YB - 1500, Z0 + 350, X1 - 200, YB - 1440, Z0 + 1300); a.box(X0 + 200, YB - 80, Z0 + 350, X1 - 200, YB - 20, Z0 + 1300);
    const tl = W - 1600; a.xcyl(X0 + 800, X0 + 800 + tl, ty, Z0 + 350 + tr, tr, 22); a.ell(X0 + 800, ty, Z0 + 350 + tr, 60, tr, tr, 10, 8); a.ell(X0 + 800 + tl, ty, Z0 + 350 + tr, 60, tr, tr, 10, 8); a.rect(X0 + 800, ty - tr, X0 + 800 + tl, ty + tr, 'EQUIP');
    for (const f of [0.2, 0.8]) a.box(X0 + 800 + tl * f - 80, ty - tr, Z0 + 350, X0 + 800 + tl * f + 80, ty + tr, Z0 + 350 + tr * 0.6); a.cyl(X0 + 800 + tl * 0.5, ty, Z0 + 350 + tr * 2, Z0 + 350 + tr * 2 + 160, 190, 12);
    a.tube([[X0 + 800 + tl * 0.7, ty, Z0 + 350 + tr * 2], [X0 + 800 + tl * 0.7, YB - 2400, Z0 + 600]], [30, 30], 6);
    for (const x of [X0 + 350, X1 - 350, cx]) { a.cyl(x, YF + 300, Z0, Z0 + 900, 80, 8); a.circ(x, YF + 300, 80); }
    a.log('Added the flat canopy on columns, the raised kerb with dispensers, hoses and nozzle holsters, the bunded horizontal tank on saddles, the pipe run and bollards (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine weighbridge',
  desc: (v) => `Truck weighbridge with a ${v.len} ft steel deck on a plinth with checker-plate grooves, sloped approach ramps at both ends, side kerbs, load-cell blocks, and a scale office with a window, door and step at the side with a traffic light post.`,
  vs: [50, 60, 80, 100].map((len) => [`${len} ft deck`, len * 12 + 400, 252, 108, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, rl = 2400; a.outline();
    const dz = Z0 + 350, dy0 = YF + 200, dy1 = YF + 4000; prismY(a, [[X0, Z0], [X0 + rl, dz], [X1 - rl, dz], [X1, Z0]], dy0, dy1);
    a.box(X0 + rl, dy0 + 100, Z0 + 100, X1 - rl, dy1 - 100, dz); for (let x = X0 + rl + 200; x < X1 - rl - 100; x += 300) a.box(x, dy0 + 200, dz, x + 60, dy1 - 200, dz + 14); a.rect(X0 + rl, dy0, X1 - rl, dy1, 'EQUIP-DETAIL'); a.line(X0, dy0, X0 + rl, dy0, 'EQUIP-DETAIL'); a.line(X1 - rl, dy0, X1, dy0, 'EQUIP-DETAIL');
    for (const y of [dy0, dy1 - 150]) a.box(X0 + rl, y, dz, X1 - rl, y + 150, dz + 200);
    for (const x of [X0 + rl + 100, X1 - rl - 400]) for (const y of [dy0 + 80, dy1 - 330]) a.box(x, y, dz - 120, x + 300, y + 250, dz);
    const ox = cx + W * 0.1, oy0 = dy1 + 500; a.box(ox - 1800, oy0, Z0, ox + 1800, YB - 100, Z0 + 2700); a.box(ox - 1900, oy0 - 100, Z0 + 2700, ox + 1900, YB, Z0 + 2850); a.frame(ox - 1400, Z0 + 1200, ox + 400, Z0 + 2300, oy0 - 14, oy0, 70); a.box(ox - 25, oy0 - 14, Z0 + 1200, ox + 25, oy0, Z0 + 2300); a.frame(ox + 700, Z0 + 100, ox + 1500, Z0 + 2300, oy0 - 14, oy0, 70); a.box(ox + 600, oy0 - 500, Z0, ox + 1600, oy0 - 14, Z0 + 150); a.rect(ox - 1800, oy0, ox + 1800, YB - 100); a.rect(ox + 600, oy0 - 500, ox + 1600, oy0 - 14, 'EQUIP-DETAIL');
    const px = X0 + rl - 350; a.cyl(px, dy1 + 300, Z0, Z0 + 3200, 50, 8); a.box(px - 130, dy1 + 250, Z0 + 3200, px + 130, dy1 + 350, Z0 + 3600); for (const z of [Z0 + 3250, Z0 + 3400, Z0 + 3520]) a.ell(px, dy1 + 245, z + 30, 50, 15, 50, 8, 4); a.circ(px, dy1 + 300, 50, 'EQUIP-DETAIL');
    a.log('Added the sloped approach ramps, the checker-plate deck with kerbs and load cells, the scale office with window, door and step, and the traffic light post (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine haul-road sign',
  desc: (v) => `${v.kind === 'stop' ? 'Octagonal stop sign face' : v.kind === 'speed' ? 'Round speed sign face with an outer rim' : v.kind === 'give' ? 'Triangular give-way sign face' : 'Rectangular multi-sign board of three stacked plates'} on a heavy steel post with a footing, ${v.kind === 'multi' ? 'rear braces' : 'a reflective rim plate'} and a tall panel for use beside haul roads.`,
  vs: [['stop octagon, 48 in', 56, 12, 120, 0, { kind: 'stop', sz: 48 }], ['speed circle, 48 in', 56, 12, 120, 0, { kind: 'speed', sz: 48 }], ['give-way triangle, 60 in', 70, 12, 126, 0, { kind: 'give', sz: 60 }], ['multi-sign board, 36 x 96 in', 60, 12, 144, 0, { kind: 'multi', sz: 36 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); const s = v.sz * IN, fy = YF + 100, zc = Z1 - s * 0.62 - 100;
    a.box(cx - 250, YB - 250, Z0, cx + 250, YB, Z0 + 150); a.box(cx - 70, YB - 200, Z0 + 150, cx + 70, YB - 60, Z1 - 100);
    if (v.kind === 'stop') { const R = s / 2, pts = Array.from({ length: 8 }, (_, i) => { const g = PI / 8 + (i * PI) / 4; return [cx + m.cos(g) * R, zc + m.sin(g) * R]; }); prismY(a, pts, fy, fy + 30); const p2 = pts.map(([x, z]) => [cx + (x - cx) * 0.9, zc + (z - zc) * 0.9]); prismY(a, p2, fy - 14, fy); a.box(cx - 60, fy - 6, zc - 15, cx + 60, fy, zc + 15); }
    else if (v.kind === 'speed') { a.ycyl(fy, fy + 30, cx, zc, s / 2, 28); a.ycyl(fy - 14, fy, cx, zc, s * 0.44, 28); a.ycyl(fy - 20, fy - 14, cx, zc, s * 0.3, 28); }
    else if (v.kind === 'give') { const R = s / 2; prismY(a, [[cx - R, zc + R * 0.7], [cx + R, zc + R * 0.7], [cx, zc - R * 0.9]], fy, fy + 30); prismY(a, [[cx - R * 0.75, zc + R * 0.55], [cx + R * 0.75, zc + R * 0.55], [cx, zc - R * 0.65]], fy - 14, fy); }
    else { const pw = s * 0.9; for (let i = 0; i < 3; i++) { const z0 = Z1 - 140 - (i + 1) * 780; a.box(cx - pw / 2 - 40, fy, z0, cx + pw / 2 + 40, fy + 30, z0 + 720); a.box(cx - pw / 2, fy - 14, z0 + 50, cx + pw / 2, fy, z0 + 670); } for (const z of [Z0 + 1000, Z1 - 800]) a.tube([[cx, YB - 130, z], [cx, fy + 40, z + 300]], [18, 18], 5); }
    a.rect(cx - s / 2, fy, cx + s / 2, fy + 30, 'EQUIP-DETAIL'); a.rect(cx - 70, YB - 200, cx + 70, YB - 60, 'EQUIP-DETAIL');
    a.log('Added the footing, the heavy steel post and the ' + (v.kind === 'stop' ? 'octagonal face with rim' : v.kind === 'speed' ? 'round face with rim rings' : v.kind === 'give' ? 'triangular face with rim' : 'three stacked plates with braces') + ' (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine decline portal',
  desc: (v) => `Concrete portal headwall for a ${v.open} ft wide decline, built from side piers and strips that follow a semi-elliptical arch, a steel arch ring, a lintel cap and a short canopy in front, with a ventilation duct hung under the arch and two lights.`,
  vs: [14, 18, 24].map((open) => [`${open} ft opening`, (open + 16) * 12, 144, m.round(open * 0.75 + 7) * 12, 0, { open }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, ow = v.open * FT, hw = ow / 2, ah = ow * 0.75 * 0.5 * 1.0, zs = Z0 + ow * 0.4; a.outline();
    const wt = 700, fy = YB - wt; const step = 150, n = m.ceil(W / step);
    for (let i = 0; i < n; i++) { const x0 = X0 + i * step, x1 = m.min(X1, x0 + step), xc = (x0 + x1) / 2, dx = m.abs(xc - cx); const zb = dx < hw ? zs + ah * m.sqrt(1 - (dx / hw) ** 2) : Z0; a.box(x0, fy, zb < Z0 ? Z0 : (dx < hw ? zb : Z0), x1, YB, Z1 - 300); if (dx < hw) a.box(x0, fy, Z0, x1, YB, Z0 + 0.001); }
    a.box(cx - hw - 250, fy - 250, Z0, cx - hw, YB, zs + 40); a.box(cx + hw, fy - 250, Z0, cx + hw + 250, YB, zs + 40);
    const pts = []; for (let i = 0; i <= 24; i++) { const g = PI * (i / 24); pts.push([cx - m.cos(g) * hw, fy - 30, zs + m.sin(g) * ah]); } a.tube(pts, pts.map(() => 70), 6); a.tube([[cx - hw, fy - 30, Z0], [cx - hw, fy - 30, zs]], [70, 70], 6); a.tube([[cx + hw, fy - 30, Z0], [cx + hw, fy - 30, zs]], [70, 70], 6);
    a.box(X0, fy - 100, Z1 - 300, X1, YB, Z1); a.box(X0 + 600, YF + 60, Z1 - 900, X1 - 600, fy - 100, Z1 - 800); for (const x of [X0 + 700, X1 - 700]) a.box(x - 60, YF + 60, Z1 - 800, x + 60, fy - 100, Z1 - 300);
    a.tube([[cx - hw * 0.5, YB - 100, zs + ah * 0.8], [cx - hw * 0.5, fy - 400, zs + ah * 0.8]], [140, 140], 10); a.tube([[cx + hw * 0.4, fy - 100, zs + ah * 0.9], [cx + hw * 0.4, fy + 40, zs + ah * 0.9]], [15, 15], 4);
    for (const s of [-1, 1]) a.box(cx + s * (hw * 0.7) - 100, fy - 140, zs + ah * 0.5, cx + s * (hw * 0.7) + 100, fy - 30, zs + ah * 0.5 + 120);
    a.rect(X0, fy, X1, YB, 'EQUIP'); a.circ(cx, YB, hw, 'EQUIP-HIDDEN'); a.rect(X0 + 600, YF + 60, X1 - 600, fy - 100, 'EQUIP-DETAIL');
    a.log('Added the side piers and the wall strips following the arch, the steel arch ring, the lintel cap, the front canopy, the hung ventilation duct and the lights (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine change building',
  desc: (v) => `Single-storey change building ${v.len} ft long on skids for a mine: a long front with ${v.nw} framed windows and an entry door with a landing, steps and rails, a flat roof with an overhang and lifting corners.`,
  vs: [[40, 4], [60, 6], [80, 8]].map(([len, nw]) => [`${len} ft long`, len * 12, 132, 108, 0, { len, nw }]),
  build: (a, v) => { cabin(a, { nw: v.nw, ac: false, doorAt: m.floor(v.nw / 2) }); a.log('Added the skids, the building body with entry door, landing, steps and rails, framed windows, the roof overhang and lifting corners (plan and 3D).'); } });

F_({ cat: 'site/landscape', title: 'Generic mine camp accommodation block',
  desc: (v) => `Two-storey camp accommodation block of ${v.rooms * 2} rooms (${v.rooms} per floor): a door and window per room on both floors, an upper walkway with posts and rails along the front, an end stair flight with treads and rails, and a flat roof.`,
  vs: [3, 5, 8].map((rooms) => [`${rooms * 2} rooms`, rooms * 120 + 96, 192, 252, 0, { rooms }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const sx = X0 + 2500, fy = YF + 1500, f1 = Z0 + 200, f2 = Z0 + 3250, rz = Z1 - 200; const rw = (X1 - sx - 100) / v.rooms;
    a.box(sx, fy, f1, X1 - 50, YB - 50, f2 - 20); a.box(sx, fy, f2, X1 - 50, YB - 50, rz); a.box(sx - 80, fy - 100, rz, X1, YB, Z1); a.rect(sx, fy, X1 - 50, YB - 50);
    for (let i = 0; i < v.rooms; i++) { const x0 = sx + i * rw; for (const [fz, d0] of [[f1, 0], [f2, 1]]) { a.frame(x0 + 100, fz + 40, x0 + 100 + 900, fz + 2300, fy - 100, fy, 100); a.box(x0 + 100 + 900 - 150, fy - 130, fz + 1000, x0 + 100 + 900 - 110, fy - 90, fz + 1100); a.frame(x0 + 1300, fz + 900, x0 + rw - 100, fz + 2100, fy - 100, fy, 90); } a.line(x0, fy, x0, YB - 50, 'EQUIP-DETAIL'); }
    a.box(sx - 20, YF + 80, f2 - 150, X1 - 50, fy - 20, f2); a.rect(sx - 20, YF + 80, X1 - 50, fy - 20, 'EQUIP-DETAIL');
    for (let i = 0; i <= v.rooms * 2; i++) { const x = sx + ((X1 - 50 - sx) * i) / (v.rooms * 2); a.cyl(x, YF + 110, f2, f2 + 1000, 25, 6); a.cyl(x, YF + 110, f1, f2 - 150, 45, 8); } a.tube([[sx, YF + 110, f2 + 1000], [X1 - 50, YF + 110, f2 + 1000]], [20, 20], 5); a.tube([[sx, YF + 110, f2 + 500], [X1 - 50, YF + 110, f2 + 500]], [16, 16], 5);
    const steps = 17, run = 2300; for (let s = 0; s < steps; s++) a.box(X0 + 100 + (run * s) / steps, YF + 150, f1 + s * ((f2 - f1) / steps), X0 + 100 + (run * (s + 1)) / steps, YF + 950, f1 + s * ((f2 - f1) / steps) + 40);
    for (const y of [YF + 150, YF + 950]) a.tube([[X0 + 100, y, f1 + 900], [X0 + 100 + run, y, f2 + 900]], [18, 18], 5); a.line(X0 + 100, YF + 550, X0 + 100 + run, YF + 550, 'EQUIP-DETAIL'); a.box(X0 + 100 + run - 20, YF + 80, f2 - 150, sx, fy - 20, f2);
    a.log('Added the two floors with doors and windows per room, the upper walkway with posts and rails, the end stair flight, the roof overhang and the base (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine headframe',
  desc: (v) => `Steel headframe ${v.ht} ft tall: a tapered four-leg lattice tower, a sheave deck with two large sheave wheels, a hoist rope running down to the shaft collar and another back toward the hoist, a collar slab with a rail guard, a caged ladder and a small cab at the top.`,
  vs: [[60, 20, 16], [90, 28, 22], [120, 36, 28], [150, 42, 32]].map(([ht, w, d]) => [`${ht} ft tall`, w * 12, d * 12, ht * 12, 0, { ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 200);
    const zt = Z1 - 300, lw = 0.5; lattice(a, X0 + 300, YF + 300, X1 - 300, YB - 1200, Z0 + 200, zt, { taper: 0.72, n: m.round(v.ht / 10), t: 130, bt: 55 });
    const sr = m.min(1300, W * 0.08), sz = zt - sr - 100; for (const x of [cx - W * 0.1, cx + W * 0.1]) { a.xcyl(x - 120, x + 120, cy - 300, sz, sr, 24); a.xcyl(x - 160, x + 160, cy - 300, sz, 150, 10); }
    a.box(cx - W * 0.1 - 400, cy - 900, zt - 300, cx + W * 0.1 + 400, cy + 400, zt); a.rect(cx - W * 0.1 - 400, cy - 900, cx + W * 0.1 + 400, cy + 400, 'EQUIP-DETAIL');
    for (const x of [cx - W * 0.1, cx + W * 0.1]) { a.tube([[x, cy - 300 - sr, sz], [x, cy - 300 - sr, Z0 + 700]], [30, 30], 6); a.tube([[x, cy - 300 + sr, sz], [x, YB - 700, Z0 + 500]], [30, 30], 6); }
    a.box(cx - W * 0.1 - 900, cy - 300 - sr - 700, Z0 + 200, cx + W * 0.1 + 900, cy - 300 - sr + 700, Z0 + 500); a.rect(cx - W * 0.1 - 900, cy - 300 - sr - 700, cx + W * 0.1 + 900, cy - 300 - sr + 700, 'EQUIP-DETAIL');
    rail(a, cx - W * 0.1 - 900, cy - 300 - sr - 700, cx + W * 0.1 + 900, cy - 300 - sr - 700, Z0 + 500, Z0 + 1500, 20, 5, true);
    a.box(cx - 500, cy + 100, zt, cx + 500, cy + 900, zt + 280); lad(a, cx, YF + 280, Z0 + 200, zt, 450, 24);
    a.log('Added the tapered lattice legs, the sheave deck with two sheave wheels, both rope runs, the collar slab with a rail guard, the caged ladder and the top cab (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine floodlight skid',
  desc: (v) => `Skid-mounted mine floodlight plant with a heavy steel sled with fork pockets and a tow eye, a ballast block, a generator canopy with louvers, a ${v.mast} ft mast on a hinge with a tilt cylinder and a head frame of ${v.lamps} floodlights.`,
  vs: [[20, 4], [30, 6], [40, 6]].map(([mast, lamps]) => [`${mast} ft mast, ${lamps} lamps`, 84, 132, mast * 12 + 30, 0, { mast, lamps }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0 + 30, YF + 400, Z0, X1 - 30, YB - 30, Z0 + 250); for (const x of [X0 + 400, X1 - 400]) a.box(x - 120, YF + 400, Z0 - 0, x + 120, YB - 30, Z0 + 250); a.tube([[X0 + 300, YF + 400, Z0 + 150], [X0 + 200, YF + 40, Z0 + 150], [X1 - 200, YF + 40, Z0 + 150], [X1 - 300, YF + 400, Z0 + 150]], [30, 30, 30, 30], 6);
    a.box(X0 + 150, YB - 1400, Z0 + 250, X1 - 150, YB - 100, Z0 + 1400); for (let z = Z0 + 500; z < Z0 + 1300; z += 60) a.box(X0 + 220, YB - 1405, z, X1 - 220, YB - 1400, z + 22); a.rect(X0 + 150, YB - 1400, X1 - 150, YB - 100, 'EQUIP-DETAIL');
    a.box(X0 + 150, YF + 450, Z0 + 250, X1 - 150, YF + 1400, Z0 + 900); a.rect(X0 + 150, YF + 450, X1 - 150, YF + 1400, 'EQUIP-DETAIL');
    const mx = cx, my = YB - 800, zt = Z1 - 450, base = Z0 + 1400, L = zt - base; a.box(mx - 200, my - 150, base, mx + 200, my + 150, base + 140);
    a.tube([[mx, my, base + 140], [mx, my, base + 140 + L * 0.5]], [90, 90], 10); a.tube([[mx, my, base + 140 + L * 0.5], [mx, my, zt]], [66, 66], 10); a.tube([[mx + 380, YB - 1000, Z0 + 1300], [mx + 120, my, base + 600]], [34, 34], 6); a.circ(mx, my, 90, 'EQUIP-DETAIL');
    const hw = v.lamps > 4 ? 1000 : 700, rows = v.lamps > 4 ? 2 : 1, per = v.lamps / rows; a.box(mx - hw, my - 40, zt, mx + hw, my + 40, zt + 70);
    for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) { const x = mx - hw + 200 + ((2 * hw - 400) * i) / (per - 1 || 1), z = zt + 70 + r * 420; a.box(x - 170, my - 190, z, x + 170, my + 60, z + 360); a.ell(x, my - 195, z + 180, 130, 20, 130, 10, 4); }
    a.log('Added the sled with fork pockets and tow eye, the ballast block, the louvered generator canopy, the hinged mast with tilt cylinder and the floodlight head frame (plan and 3D).');
  } });

/** a tank truck: cab, chassis, tank with bands, catwalk, rear cabinet */
function tankTruck(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
  trk(a, { cabL: 1900, nose: 950, cabH: 2650, hoodH: 1400, wr: 500, ground: 520, axles: o.axles(D), ww: 290 });
  const y0 = YF + 2250, y1 = YB - (o.rear ?? 750), tr = m.min((W - 300) / 2, (H - 1150 - 530) / 2), zc = Z0 + 1150 + tr;
  a.ycyl(y0, y1, cx, zc, tr, 26); a.ell(cx, y0, zc, tr, 70, tr, 18, 6); a.ell(cx, y1, zc, tr, 70, tr, 18, 6); a.rect(X0 + 180, y0, X1 - 180, y1, 'EQUIP');
  a.box(X0 + 140, y0, Z0 + 700, X1 - 140, y1, Z0 + 1250); const nb = o.bands;
  for (let k = 1; k <= nb; k++) { const y = y0 + ((y1 - y0) * k) / (nb + 1); a.ycyl(y - 25, y + 25, cx, zc, tr + 22, 26); a.line(X0 + 180, y, X1 - 180, y, 'EQUIP-DETAIL'); }
  a.box(cx - 280, y0 + 200, zc + tr - 40, cx + 280, y1 - 200, zc + tr + 40); rail(a, cx - 280, y0 + 200, cx - 280, y1 - 200, zc + tr + 40, zc + tr + 500, 18, 4); rail(a, cx + 280, y0 + 200, cx + 280, y1 - 200, zc + tr + 40, zc + tr + 500, 18, 4);
  for (let k = 0; k < nb + 1; k++) { const y = y0 + ((y1 - y0) * (k + 0.5)) / (nb + 1); a.cyl(cx, y, zc + tr + 40, zc + tr + 200, 170, 14); a.circ(cx, y, 170, 'EQUIP-DETAIL'); }
  a.box(X0 + 80, y1, Z0 + 650, X1 - 80, YB, m.min(Z1 - 100, Z0 + 2000)); a.rect(X0 + 80, y1, X1 - 80, YB, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) a.tube([[cx + sx * W * 0.28, YB - 20, Z0 + 1000], [cx + sx * W * 0.28 + sx * 100, YB - 40, Z0 + 700]], [30, 30], 6);
  return { y0, y1, zc, tr };
}
F_({ cat: 'site/vehicles', title: 'Generic mine fuel tanker truck',
  desc: (v) => `Fuel tanker truck of ${v.gal} gal for mine service: a cab and chassis, a horizontal cylindrical tank with ${v.bands + 1} compartment bands and domed ends, a top walkway with rails and hatches, a rear valve cabinet with hoses and ${v.axles} axles.`,
  vs: [[2000, 276, 112, 1], [4000, 330, 118, 2], [6000, 372, 124, 2], [8000, 410, 126, 3]].map(([gal, d, h, bands]) => [`${gal} gal`, d < 340 ? 96 : 100, d, h, 0, { gal, bands, axles: d > 400 ? 'three' : 'two' }]),
  build: (a, v) => { tankTruck(a, { bands: v.bands, axles: (D) => (v.axles === 'three' ? [1150, D - 2300, D - 1100] : [1150, D - 1150]) }); a.log('Added the cab and chassis, the cylindrical tank with domed ends and bands, the top walkway with rails and hatches, the rear valve cabinet with hoses and the axles (plan and 3D).'); } });

F_({ cat: 'site/vehicles', title: 'Generic mine water tanker truck',
  desc: (v) => `Water tanker truck of ${v.gal} gal for dust control: a cab and chassis, a horizontal cylindrical tank with domed ends and fill hatches, a front bumper spray bar, a rear spray bar with nozzles, a side pump housing and ${v.axles} axles.`,
  vs: [[2000, 276, 112, 'two'], [4000, 330, 118, 'two'], [6000, 372, 124, 'three'], [10000, 410, 130, 'three']].map(([gal, d, h, axles]) => [`${gal} gal`, d < 340 ? 96 : 100, d, h, 0, { gal, axles }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, cx, W } = a; tankTruck(a, { bands: 1, rear: 900, axles: (D) => (v.axles === 'three' ? [1150, D - 2300, D - 1100] : [1150, D - 1150]) });
    a.tube([[X0 + 200, YB - 20, Z0 + 700], [X1 - 200, YB - 20, Z0 + 700]], [32, 32], 8); for (let x = X0 + 320; x < X1 - 250; x += 260) a.box(x - 25, YB - 70, Z0 + 580, x + 25, YB - 20, Z0 + 700);
    a.tube([[X0 + 200, YF + 20, Z0 + 700], [X1 - 200, YF + 20, Z0 + 700]], [28, 28], 8); for (let x = X0 + 380; x < X1 - 300; x += 320) a.box(x - 25, YF + 0, Z0 + 600, x + 25, YF + 50, Z0 + 700);
    a.box(X1 - 220, YF + 3000, Z0 + 600, X1 - 20, YF + 3900, Z0 + 1300);
    a.log('Added the cab and chassis, the cylindrical tank with domed ends and hatches, the front and rear spray bars with nozzles, the side pump housing and the axles (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic mine crew bus',
  desc: (v) => `Crew bus for ${v.seats} people: a flat front with a windscreen, a long body with ${v.nw} side windows per side and a front entry door with a step, a roof hatch and two roof lamps, a rear window frame and four wheels with fenders.`,
  vs: [[12, 3, 250, 100], [22, 5, 330, 114], [30, 7, 396, 118]].map(([seats, nw, d, h]) => [`${seats} seats`, seats > 12 ? 90 : 80, d, h, 0, { seats, nw }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
    trk(a, { cabL: D, nose: 500, cabH: H - 160, hoodH: 900, wr: 400, ground: 400, axles: [1000, D - 1000] });
    const sy0 = YF + 1100, gap = (YB - 700 - sy0) / v.nw, wz0 = Z0 + H * 0.5, wz1 = Z0 + H * 0.78;
    for (let i = 0; i < v.nw; i++) for (const [x, dir] of [[X0 + 40, -1], [X1 - 40, 1]]) sideFrame(a, x, dir, sy0 + i * gap + 60, sy0 + (i + 1) * gap - 60, wz0, wz1, 36, 10);
    sideFrame(a, X1 - 40, 1, YF + 540, YF + 1000, Z0 + 700, wz1, 40, 14); a.box(X1 - 160, YF + 540, Z0 + 330, X1, YF + 1000, Z0 + 420);
    a.frame(X0 + 140, wz0 - 100, X1 - 140, wz1 + 100, YB - 14, YB, 45); a.box(cx - 400, YF + D * 0.45, H + Z0 - 150, cx + 400, YF + D * 0.45 + 600, Z1 - 60); for (const x of [cx - W * 0.3, cx + W * 0.3]) a.ell(x, YF + 1500, Z1 - 60, 90, 90, 60, 8, 4);
    a.box(X0 + 120, YB - 260, Z0 + 300, X1 - 120, YB, Z0 + 440);
    a.log('Added the flat front with windscreen, the side window bands, the entry door with a step, the roof hatch and lamps, the rear window frame and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic mine light vehicle',
  desc: (v) => `Mine light vehicle, ${v.kind}: a crew cab with a bull bar, a tall whip pole with a flag, a roll cage over a ${v.kind === 'dual cab with canopy' ? 'tray with a canopy' : 'flat tray'}, a rear tow hitch, mirrors and four wheels with fenders.`,
  vs: [['single cab with tray', 74, 205, 118, 0, { kind: 'single cab with tray', cab: 1600 }], ['dual cab with tray', 74, 232, 118, 0, { kind: 'dual cab with tray', cab: 2300 }], ['dual cab with canopy', 74, 232, 118, 0, { kind: 'dual cab with canopy', cab: 2300 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
    trk(a, { cabL: v.cab, nose: 1150, cabH: 1700, hoodH: 1000, wr: 400, ground: 420, axles: [1200, D - 950] });
    const ty = YF + v.cab + 40; a.box(X0 + 40, ty, Z0 + 700, X1 - 40, YB - 40, Z0 + 800); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 60) - 25, ty, Z0 + 800, cx + s * (W / 2 - 60) + 25, YB - 40, Z0 + 1050);
    a.frame(X0 + 120, Z0 + 900, X1 - 120, Z0 + 1800, YF + 60, YF + 90, 35); a.box(cx - 25, YF + 60, Z0 + 700, cx + 25, YF + 90, Z0 + 1800); a.box(X0 + 120, YF + 20, Z0 + 700, X1 - 120, YF + 90, Z0 + 830);
    if (v.kind === 'dual cab with canopy') a.box(X0 + 60, ty + 40, Z0 + 800, X1 - 60, YB - 60, Z0 + 1750);
    else for (const y of [ty + 100, YB - 150]) { a.tube([[X0 + 100, y, Z0 + 800], [X0 + 100, y, Z0 + 1800]], [22, 22], 6); a.tube([[X1 - 100, y, Z0 + 800], [X1 - 100, y, Z0 + 1800]], [22, 22], 6); a.tube([[X0 + 100, y, Z0 + 1800], [X1 - 100, y, Z0 + 1800]], [22, 22], 6); }
    const wx = X0 + 170, wy = YF + 900; a.tube([[wx, wy, Z0 + 800], [wx, wy, Z1 - 20]], [12, 4], 6); a.box(wx - 5, wy - 3, Z1 - 330, wx + 230, wy + 3, Z1 - 80); a.circ(wx, wy, 12, 'EQUIP-DETAIL');
    a.box(cx - 90, YB - 140, Z0 + 420, cx + 90, YB, Z0 + 520);
    a.log('Added the crew cab with bull bar and mirrors, the tray' + (v.kind === 'dual cab with canopy' ? ' with a canopy' : '') + ', the roll cage, the whip pole with a flag, the tow hitch and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine run-of-mine dump ramp',
  desc: (v) => `Earth dump ramp ${v.wd} ft wide rising to a tipping edge, with a sloped wedge profile, a rock-faced tip wall along the high edge with large stop boulders, and reflective guide posts down both sides.`,
  vs: [24, 40, 60].map((wd) => [`${wd} ft wide`, wd * 12, 480, 108, 0, { wd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
    prismX(a, [[YF, Z0], [YB, Z0], [YB, Z0 + 1500], [YF, Z0 + 150]], X0, X1);
    a.box(X0, YB - 1500, Z0 + 1500 - 200, X1, YB, Z1 - 600); a.rect(X0, YB - 1500, X1, YB, 'EQUIP-DETAIL');
    const nb = m.round(v.wd / 4); for (let i = 0; i < nb; i++) { const x = X0 + (W * (i + 0.5)) / nb; a.ell(x, YB - 700, Z1 - 650, 420, 500, 320, 8, 5); a.circ(x, YB - 700, 420, 'EQUIP-DETAIL'); }
    for (let y = YF + 1500; y < YB - 1800; y += 1800) for (const x of [X0 + 150, X1 - 150]) { a.cyl(x, y, Z0 + 150 + (y - YF) / (YB - YF) * 1350, Z0 + 150 + (y - YF) / (YB - YF) * 1350 + 900, 25, 6); a.box(x - 60, y - 6, Z0 + 150 + (y - YF) / (YB - YF) * 1350 + 600, x + 60, y + 6, Z0 + 150 + (y - YF) / (YB - YF) * 1350 + 850); }
    a.line(cx, YF, cx, YB - 1500, 'EQUIP-DETAIL');
    a.log('Added the sloped earth wedge, the rock-faced tip wall with large stop boulders and the reflective guide posts down both sides (plan and 3D).');
  } });

// ================================================================================================ AIRFIELD
F_({ cat: 'site/landscape', title: 'Generic airfield taxiway direction sign',
  desc: (v) => `Lit taxiway direction sign of ${v.n} panel${v.n > 1 ? 's' : ''}, each ${v.pw} in wide and ${v.ph} in tall with a border frame, raised letter blocks and an arrow, mounted on two breakaway legs with a base plate each.`,
  vs: [[1, 36, 18], [2, 48, 24], [3, 48, 30], [4, 60, 36]].map(([n, pw, ph]) => [`${n} panel${n > 1 ? 's' : ''}, ${ph} in tall`, n * pw + 12, 14, ph + 30, 0, { n, pw, ph }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, pw = v.pw * IN, ph = v.ph * IN; a.outline();
    for (const x of [X0 + 200, X1 - 200]) { a.box(x - 120, cy - 100, Z0, x + 120, cy + 100, Z0 + 20); a.cyl(x, cy, Z0 + 20, Z0 + 330, 28, 8); a.rect(x - 120, cy - 100, x + 120, cy + 100, 'EQUIP-DETAIL'); }
    const z0 = Z0 + 330; a.box(X0 + 60, YF + 90, z0, X1 - 60, YB - 60, z0 + ph);
    for (let i = 0; i < v.n; i++) { const x0 = X0 + 60 + i * pw; a.frame(x0 + 25, z0 + 25, x0 + pw - 25, z0 + ph - 25, YF + 55, YF + 90, 40); a.box(x0 + pw * 0.18, YF + 50, z0 + ph * 0.3, x0 + pw * 0.42, YF + 78, z0 + ph * 0.7); a.box(x0 + pw * 0.5, YF + 50, z0 + ph * 0.46, x0 + pw * 0.82, YF + 78, z0 + ph * 0.54); a.prism([[x0 + pw * 0.82, YF + 50], [x0 + pw * 0.82, YF + 78], [x0 + pw * 0.92, YF + 78], [x0 + pw * 0.92, YF + 50]], z0 + ph * 0.3, z0 + ph * 0.7); a.line(x0, YF + 90, x0, YB - 60, 'EQUIP-DETAIL'); }
    a.rect(X0 + 60, YF + 90, X1 - 60, YB - 60, 'EQUIP-DETAIL');
    a.log('Added the base plates, the breakaway legs and ' + v.n + ' framed panels with raised letter blocks and arrows (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic aircraft parking stand with markings',
  desc: (v) => `Aircraft parking stand for a ${v.cls} on a paving slab, with a raised lead-in line, a stop bar, an equipment-restraint box, wing-tip clearance lines in plan, four corner bollards and a stand sign on a post.`,
  vs: [['regional jet class', 100, 120], ['narrow-body class', 140, 160], ['wide-body class', 210, 240]].map(([cls, w, d]) => [cls, w * 12, d * 12, 100, 0, { cls: cls.replace(' class', '') }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60);
    a.box(cx - 50, YF + D * 0.05, Z0 + 60, cx + 50, YF + D * 0.55, Z0 + 76); a.box(cx - 500, YF + D * 0.55, Z0 + 60, cx + 500, YF + D * 0.55 + 100, Z0 + 76);
    for (let y = YF + D * 0.7; y < YB - D * 0.1; y += D * 0.04) a.box(cx - 600, y, Z0 + 60, cx + 600, y + D * 0.02, Z0 + 70);
    a.rect(cx - W * 0.2, YF + D * 0.62, cx + W * 0.2, YB - D * 0.08, 'EQUIP-DETAIL'); a.line(cx, YF, cx, YF + D * 0.55, 'EQUIP-DETAIL'); a.line(cx - 500, YF + D * 0.55, cx + 500, YF + D * 0.55, 'EQUIP-DETAIL');
    a.rect(X0 + 300, YF + 300, X1 - 300, YB - 300, 'EQUIP-HIDDEN');
    for (const [x, y] of [[X0 + 300, YF + 300], [X1 - 300, YF + 300], [X0 + 300, YB - 300], [X1 - 300, YB - 300]]) { a.cyl(x, y, Z0 + 60, Z0 + 1000, 80, 10); a.circ(x, y, 80); }
    a.cyl(cx + W * 0.3, YF + D * 0.3, Z0 + 60, Z1 - 300, 50, 8); a.box(cx + W * 0.3 - 450, YF + D * 0.3 - 30, Z1 - 800, cx + W * 0.3 + 450, YF + D * 0.3 + 10, Z1 - 100); a.circ(cx + W * 0.3, YF + D * 0.3, 50, 'EQUIP-DETAIL');
    a.log('Added the slab, the raised lead-in line and stop bar, the equipment-restraint box, the corner bollards, the clearance lines and the stand sign post (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield fire station',
  desc: (v) => `Airfield fire station with ${v.bays} vehicle bays: a flat-roofed building with a parapet, ${v.bays} tall roller doors with slat lines, a personnel door, side windows, a roof watch tower with a glazed lookout and a front apron slab.`,
  vs: [2, 3, 4].map((bays) => [`${bays} bays`, (bays * 18 + 14) * 12, 780, 36 * 12, 0, { bays }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YF + 3000, Z0 + 100);
    const by = YF + 3000, bh = Z0 + 22 * FT * 0.5 + 3000, rz = Z0 + 6800; a.box(X0 + 200, by, Z0, X1 - 200, YB - 100, rz); a.box(X0 + 120, by - 100, rz, X1 - 120, YB - 40, rz + 350);
    const bw = 18 * FT; for (let i = 0; i < v.bays; i++) { const x0 = X0 + 700 + i * (bw + 200); a.frame(x0, Z0 + 100, x0 + bw, Z0 + 4300, by - 220, by, 160); a.box(x0 + 60, by - 150, Z0 + 110, x0 + bw - 60, by - 5, Z0 + 4240); for (let z = Z0 + 300; z < Z0 + 4200; z += 280) a.box(x0 + 80, by - 190, z, x0 + bw - 80, by - 150, z + 50); a.rect(x0, by - 20, x0 + bw, by, 'EQUIP-DETAIL'); }
    const px = X0 + 700 + v.bays * (bw + 200) + 100; a.frame(px, Z0 + 100, px + 1000, Z0 + 2400, by - 70, by, 90); const wx0 = px + 1300; a.frame(wx0, Z0 + 1200, X1 - 400, Z0 + 2600, by - 70, by, 80);
    const tx = cx, tz0 = rz + 350, th = 3000; a.box(tx - 1500, by + 1500, tz0, tx + 1500, by + 4500, tz0 + 2200); a.frame(tx - 1400, tz0 + 500, tx + 1400, tz0 + 1900, by + 1486, by + 1500, 60); a.box(tx - 1500, by + 1400, tz0 + 2200, tx + 1500, by + 4600, tz0 + 2350); a.box(tx - 1300, by + 1400, tz0 + 2350, tx + 1300, by + 4600, tz0 + 2450);
    a.rect(tx - 1500, by + 1500, tx + 1500, by + 4500, 'EQUIP-DETAIL'); a.rect(X0 + 200, by, X1 - 200, YB - 100);
    a.log('Added the building with parapet, ' + v.bays + ' roller doors with slat lines, the personnel door and windows, the roof watch tower with a lookout and the apron slab (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield control tower',
  desc: (v) => `Control tower ${v.ht} ft tall: a square base building, a tall shaft with a stair and lift core, an octagonal flared glazed cab with mullions, a balcony ring with a rail, a roof with an overhang and an antenna mast.`,
  vs: [60, 90, 120, 150].map((ht) => [`${ht} ft tall`, 40 * 12, 40 * 12, ht * 12, 0, { ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
    a.box(X0, YF, Z0, X1, YB, Z0 + 4800); a.box(X0 + 100, YF + 100, Z0 + 4800, X1 - 100, YB - 100, Z0 + 5000);
    const sh = 2100, zs = Z0 + 5000, zc0 = Z1 - 6000; a.box(cx - sh, cy - sh, zs, cx + sh, cy + sh, zc0 - 600);
    for (let z = zs + 1500; z < zc0 - 800; z += 1800) { a.box(cx - sh - 12, cy - sh - 12, z, cx + sh + 12, cy - sh, z + 60); a.box(cx - sh - 12, cy + sh, z, cx + sh + 12, cy + sh + 12, z + 60); }
    a.cone(cx, cy, zc0 - 600, zc0, sh * 1.4, sh * 2.6, 8); a.box(cx - sh * 2.9, cy - sh * 2.9, zc0, cx + sh * 2.9, cy + sh * 2.9, zc0 + 120);
    const cz1 = zc0 + 2600; a.cone(cx, cy, zc0 + 120, cz1, sh * 2.5, sh * 2.9, 8);
    for (let i = 0; i < 8; i++) { const g = PI / 8 + (i * PI) / 4, r = sh * 2.9; a.tube([[cx + m.cos(g) * sh * 2.55, cy + m.sin(g) * sh * 2.55, zc0 + 120], [cx + m.cos(g) * r, cy + m.sin(g) * r, cz1]], [45, 45], 5); }
    ring(a, cx, cy, zc0 + 120 + 1300, sh * 2.72, 30, 8); ring(a, cx, cy, zc0 + 120 + 20, sh * 2.5, 40, 8);
    const rr = sh * 3.4, bz = zc0 + 120; ring(a, cx, cy, bz + 1000, rr, 22, 8); ring(a, cx, cy, bz + 500, rr, 18, 8); for (let i = 0; i < 8; i++) { const g = PI / 8 + (i * PI) / 4; a.tube([[cx + m.cos(g) * rr, cy + m.sin(g) * rr, bz + 0], [cx + m.cos(g) * rr, cy + m.sin(g) * rr, bz + 1000]], [18, 18], 5); }
    a.cone(cx, cy, cz1, cz1 + 200, sh * 3.3, sh * 3.3, 8); a.cone(cx, cy, cz1 + 200, Z1 - 1200, sh * 2.7, sh * 0.6, 8); a.cyl(cx, cy, Z1 - 1200, Z1, 40, 6); a.box(cx - 150, cy - 150, Z1 - 1800, cx + 150, cy + 150, Z1 - 1500);
    a.circ(cx, cy, sh * 2.9, 'EQUIP-DETAIL'); a.circ(cx, cy, rr, 'EQUIP-HIDDEN'); a.rect(cx - sh, cy - sh, cx + sh, cy + sh, 'EQUIP-DETAIL');
    a.log('Added the base building, the shaft with landing bands, the flared octagonal glazed cab with mullions, the balcony ring with rail, the roof and the antenna mast (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield fuel farm',
  desc: (v) => `Bulk fuel farm with ${v.n} upright cone-roof tanks of about ${v.gal} gal each inside a bund wall, tank ladders and vents, a pipe manifold, a pump skid with two pumps and a loading gantry with a rail and a stair.`,
  vs: [[2, '100,000'], [3, '100,000'], [4, '200,000']].map(([n, gal]) => [`${n} tanks of ${gal} gal`, (n * 34 + 20) * 12, 72 * 12, 32 * 12, 0, { n, gal }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline('EQUIP-HIDDEN'); a.box(X0, YF, Z0, X1, YB, Z0 + 80);
    const bt = 300, bh = 1100; a.box(X0, YF, Z0 + 80, X1, YF + bt, Z0 + bh); a.box(X0, YB - bt, Z0 + 80, X1, YB, Z0 + bh); a.box(X0, YF + bt, Z0 + 80, X0 + bt, YB - bt, Z0 + bh); a.box(X1 - bt, YF + bt, Z0 + 80, X1, YB - bt, Z0 + bh);
    const r = 4600, tz = Z1 - 1400, ty = YF + 7500; const sp = (W - 2 * 2500) / v.n;
    for (let i = 0; i < v.n; i++) { const x = X0 + 2500 + sp * (i + 0.5); a.cyl(x, ty, Z0 + 80, tz, r, 28); a.cone(x, ty, tz, tz + 1100, r, 200, 28); a.cyl(x, ty, tz + 1100, tz + 1300, 150, 8); ring(a, x, ty, Z0 + 3000, r + 12, 14, 28); ring(a, x, ty, Z0 + 6200, r + 12, 14, 28); a.circ(x, ty, r); lad(a, x + r * 0.5, ty - r - 40, Z0 + 80, tz, 450, 22); a.tube([[x + r * 0.5 + 300, ty - r - 40, tz], [x - r * 0.3, ty - r * 0.9, tz + 300]], [18, 18], 5); a.cyl(x + 1500, ty - r * 0.5, tz + 700, tz + 1000, 70, 8); a.tube([[x, ty + r, Z0 + 700], [x, YB - 6000, Z0 + 700]], [60, 60], 6); }
    a.tube([[X0 + 2500, YB - 6000, Z0 + 700], [X1 - 2500, YB - 6000, Z0 + 700]], [90, 90], 8); a.line(X0 + 2500, YB - 6000, X1 - 2500, YB - 6000, 'EQUIP-DETAIL');
    const px = X0 + 2000, py = YB - 5500; a.box(px, py, Z0 + 80, px + 3600, py + 2200, Z0 + 150); for (const x of [px + 900, px + 2700]) { a.box(x - 450, py + 500, Z0 + 150, x + 450, py + 1700, Z0 + 1000); a.ycyl(py + 1700, py + 1900, x, Z0 + 600, 220, 12); }
    const gx = X1 - 8500; a.box(gx, YB - 2800, Z0 + 80, gx + 6000, YB - 400, Z0 + 4400); a.box(gx - 400, YB - 2900, Z0 + 4300, gx + 6400, YB - 300, Z0 + 4440); rail(a, gx - 400, YB - 2900, gx + 6400, YB - 2900, Z0 + 4440, Z0 + 5440, 20, 6, true); a.rect(gx, YB - 2800, gx + 6000, YB - 400, 'EQUIP-DETAIL');
    for (let s = 0; s < 22; s++) a.box(gx + 6000, YB - 2800 + s * 0 , Z0 + 80 + s * 195, gx + 6900 - s * 0 + 0.01, YB - 2200, Z0 + 80 + s * 195 + 0.01 + 30);
    a.log('Added the bund wall, ' + v.n + ' cone-roof tanks with ladders and vents, the pipe manifold, the pump skid and the loading gantry with rail and stair (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield windsock mast',
  desc: (v) => `Airfield windsock on a ${v.pole} ft ${v.kind === 'frangible' ? 'frangible' : 'tapered'} pole: a base plate and ladder-free pole, a hoop ring with a swivel arm, a striped tapered sock about 10 ft long${v.lit ? ' and a ring of lamps around the hoop' : ''}.`,
  vs: [[12, false, 'taper'], [20, false, 'taper'], [30, false, 'frangible'], [20, true, 'taper']].map(([pole, lit, kind]) => [`${pole} ft pole${lit ? ' with lit ring' : kind === 'frangible' ? ', frangible' : ''}`, 168, 48, pole * 12 + 36, 0, { pole, lit, kind }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
    const px = X0 + 500, zt = Z1 - 1000; a.box(px - 300, cy - 300, Z0, px + 300, cy + 300, Z0 + 40); a.rect(px - 300, cy - 300, px + 300, cy + 300, 'EQUIP-DETAIL');
    if (v.kind === 'frangible') { a.box(px - 90, cy - 90, Z0 + 40, px + 90, cy + 90, Z0 + 600); a.cyl(px, cy, Z0 + 600, zt, 55, 10); } else a.tube([[px, cy, Z0 + 40], [px, cy, zt]], [95, 45], 12);
    a.circ(px, cy, 60, 'EQUIP-DETAIL'); a.cyl(px, cy, zt, zt + 90, 80, 10);
    const hr = 460, hz = zt + 450; a.tube([[px, cy, zt + 90], [px + 150, cy, hz - 100]], [30, 20], 6); ring(a, px + 330, cy, hz, hr, 18, 20); a.ycyl(cy - hr, cy + hr, px + 330, hz, 14, 4);
    if (v.lit) for (let i = 0; i < 8; i++) { const g = (i / 8) * PI * 2; a.ell(px + 330 + m.cos(g) * (hr + 20) * 0, cy + m.sin(g) * 0, hz + 0, 1, 1, 1, 4, 3); a.box(px + 330 - 30, cy + m.sin(g) * hr - 25, hz + m.cos(g) * hr - 25, px + 330 + 30, cy + m.sin(g) * hr + 25, hz + m.cos(g) * hr + 25); }
    const L = 3000, seg = 6; for (let i = 0; i < seg; i++) { const x0 = px + 330 + (L * i) / seg, x1 = px + 330 + (L * (i + 1)) / seg, r0 = hr * (1 - 0.6 * (i / seg)), r1 = hr * (1 - 0.6 * ((i + 1) / seg)), sag = i * 22; a.tube([[x0, cy, hz - sag], [x1, cy, hz - sag - 22]], [r0, r1], 14); }
    a.line(px + 330, cy, px + 330 + L, cy, 'EQUIP-DETAIL'); a.circ(px + 330, cy, hr, 'EQUIP-DETAIL');
    a.log('Added the base plate and pole, the hoop ring with swivel arm, the tapered sock in segments' + (v.lit ? ' and the ring of lamps' : '') + ' (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield jet blast fence',
  desc: (v) => `Jet blast deflector fence ${v.len} ft long and ${v.ht} ft high: angled steel baffle slats in a row on posts with footings, a deflector lip along the top, diagonal back bracing and a top rail.`,
  vs: [[10, 20], [14, 30], [14, 40], [20, 40]].map(([ht, len]) => [`${ht} ft high, ${len} ft long`, len * 12, ht * 12 * 0.5 + 24, ht * 12, 0, { ht, len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const np = m.round(v.len / 10) + 1, hz = Z1 - 100; for (let i = 0; i < np; i++) { const x = X0 + 150 + ((W - 300) * i) / (np - 1); a.box(x - 80, YB - 250, Z0, x + 80, YB - 90, hz); a.box(x - 350, YB - 450, Z0, x + 350, YB, Z0 + 350); a.tube([[x, YB - 160, Z0 + (hz - Z0) * 0.7], [x, YF + 150, Z0 + 150]], [25, 25], 5); a.rect(x - 80, YB - 250, x + 80, YB - 90); a.line(x, YB - 160, x, YF + 150, 'EQUIP-DETAIL'); }
    const ns = m.round((hz - Z0 - 400) / 360), step = (hz - Z0 - 400) / ns; for (let k = 0; k < ns; k++) { const z0 = Z0 + 400 + k * step; prismX(a, [[YB - 90, z0], [YB - 90, z0 + 70], [YF + 200 + (ns - k) * 20, z0 + step * 0.85 + 70], [YF + 200 + (ns - k) * 20, z0 + step * 0.85]], X0 + 60, X1 - 60); }
    a.box(X0 + 60, YB - 250, hz, X1 - 60, YB - 90, hz + 100); prismX(a, [[YB - 90, hz], [YF + 100, hz + 150], [YF + 100, hz + 220], [YB - 90, hz + 100]], X0 + 60, X1 - 60); a.line(X0 + 60, YF + 200, X1 - 60, YF + 200, 'EQUIP-DETAIL');
    a.log('Added the posts with footings, the angled baffle slats, the deflector lip, the top rail and the diagonal back bracing (plan and 3D).');
  } });

// ---- aircraft shapes
/** a big airliner-style freighter shape from a fuselage tube, swept wings, engines, tail and gear. Nose at −Y. */
function plane(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, R = o.fd / 2, zc = Z0 + o.gear + R, S2 = W / 2;
  const st = [[0, 0.1], [0.025, 0.5], [0.07, 0.82], [0.12, 0.97], [0.18, 1], [0.6, 1], [0.78, 0.8], [0.92, 0.45], [1, 0.1]];
  a.tube(st.map(([f]) => [cx, YF + f * L, zc + (f > 0.6 ? ((f - 0.6) / 0.4) * R * 0.4 : 0)]), st.map(([, r]) => R * r), 20);
  a.ellp(cx, (YF + YB) / 2, R, L / 2); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  a.box(cx - R * 0.7, YF + L * 0.045, zc + R * 0.3, cx + R * 0.7, YF + L * 0.075, zc + R * 0.55);
  const w = o.wing, yr = YF + L * w.r, zw = zc - R * 0.55, sweep = w.sw * L;
  for (const s of [-1, 1]) { const pts = [[cx + s * R * 0.8, yr], [cx + s * S2, yr + sweep], [cx + s * S2, yr + sweep + w.c1 * L], [cx + s * R * 0.8, yr + w.c0 * L]]; a.prism(s > 0 ? pts : pts.slice().reverse(), zw, zw + 90); a.poly(pts); }
  const er = o.er;
  for (const f of o.ne === 4 ? [0.33, 0.62] : [0.38]) for (const s of [-1, 1]) { const x = cx + s * S2 * f, y0 = yr + sweep * f - er * 2.8, len = er * 5, zE = zw - er * 1.1; a.tube([[x, y0, zE], [x, y0 + len * 0.15, zE], [x, y0 + len * 0.9, zE], [x, y0 + len, zE]], [er * 0.85, er, er, er * 0.5], 16); a.box(x - 20, y0 + len * 0.25, zE + er * 0.5, x + 20, y0 + len * 0.85, zw + 5); a.rect(x - er, y0, x + er, y0 + len, 'EQUIP'); a.circ(x, y0, er, 'EQUIP-DETAIL'); }
  const fy0 = YB - L * 0.2, fy1 = YB - L * 0.03, zf0 = zc + R * 0.6;
  prismX(a, [[fy0 - L * 0.012, zf0 - 40], [fy1, zf0 - 40], [fy1, Z1 - 20], [fy0 + (fy1 - fy0) * 0.35, Z1]], cx - 38, cx + 38); a.rect(cx - 38, fy0, cx + 38, fy1, 'EQUIP-DETAIL');
  const sz = zc + R * 0.55, ss = S2 * 0.36, sy = YB - L * 0.13; for (const s of [-1, 1]) { const pts = [[cx + s * 30, sy], [cx + s * ss, sy + L * 0.04], [cx + s * ss, sy + L * 0.085], [cx + s * 30, sy + L * 0.105]]; a.prism(s > 0 ? pts : pts.slice().reverse(), sz, sz + 50); a.poly(pts); }
  const gz = Z0 + o.gear;
  for (const s of [-1, 1]) { const x = cx + s * R * 1.3, y = yr + L * 0.075 + sweep * (R * 1.3 / S2); a.tube([[x, y, gz + 150], [x, y, zw]], [28, 28], 8); a.xcyl(x - 150, x + 150, y, Z0 + 330, 330, 16); a.rect(x - 150, y - 330, x + 150, y + 330, 'EQUIP-DETAIL'); }
  a.tube([[cx, YF + L * 0.1, gz + 120], [cx, YF + L * 0.1, zc - R * 0.5]], [24, 24], 8); a.xcyl(cx - 110, cx + 110, YF + L * 0.1, Z0 + 260, 260, 14);
}
/** a light propeller aeroplane: fuselage, nose cowl and propeller, straight wing (high or low), tail, fixed tricycle gear; twin adds two wing engines */
function lightPlane(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, R = o.fd / 2, zc = Z0 + o.gear + R, S2 = W / 2, L = D;
  const st = [[0, 0.5], [0.06, 0.8], [0.14, 1], [0.45, 0.95], [0.7, 0.55], [0.9, 0.28], [1, 0.14]];
  a.tube(st.map(([f]) => [cx, YF + f * L, zc + (f > 0.45 ? (f - 0.45) * R * 0.5 : 0)]), st.map(([, r]) => R * r), 16);
  a.ellp(cx, (YF + YB) / 2, R, L / 2); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  a.box(cx - R * 0.8, YF + L * 0.18, zc + R * 0.4, cx + R * 0.8, YF + L * 0.34, zc + R * 0.95);
  const yr = YF + L * 0.22, ch = L * 0.2, zw = o.high ? zc + R * 0.95 : zc - R * 0.55;
  for (const s of [-1, 1]) { const pts = [[cx + s * R * 0.7, yr], [cx + s * S2, yr + L * 0.015], [cx + s * S2, yr + L * 0.015 + ch * 0.8], [cx + s * R * 0.7, yr + ch]]; a.prism(s > 0 ? pts : pts.slice().reverse(), zw, zw + 70); a.poly(pts); if (o.high) a.tube([[cx + s * R * 0.9, yr + ch * 0.5, zc - R * 0.7], [cx + s * S2 * 0.55, yr + ch * 0.5, zw]], [20, 20], 6); }
  const px = cx, py = YF + 30; if (o.twin) { for (const s of [-1, 1]) { const x = cx + s * S2 * 0.34, y0 = yr - 700; a.tube([[x, y0, zw + 50], [x, y0 + 900, zw + 50], [x, yr + ch * 0.8, zw + 40]], [150, 200, 120], 12); a.box(x - 60, y0 - 40, zw + 5, x + 60, y0 + 900, zw + 60); a.xcyl(x - 5, x + 5, y0 - 10, zw + 50, 30, 6); a.box(x - 25, y0 - 30, zw - 330, x + 25, y0 - 10, zw + 430); a.rect(x - 150, y0, x + 150, yr + ch * 0.8, 'EQUIP'); } }
  else { a.ell(px, py + 220, zc, R * 0.85, 260, R * 0.8, 14, 6); a.ell(px, py - 10, zc, 80, 70, 80, 8, 4); a.box(px - 40, py - 40, zc - R * 1.35, px + 40, py - 10, zc + R * 1.35); a.rect(px - 30, py - 10, px + 30, py + 90, 'EQUIP-DETAIL'); }
  const fy0 = YB - L * 0.2, fy1 = YB - L * 0.02; prismX(a, [[fy0, zc + R * 0.35], [fy1, zc + R * 0.35], [fy1, Z1 - 20], [fy0 + (fy1 - fy0) * 0.45, Z1]], cx - 28, cx + 28); a.rect(cx - 28, fy0, cx + 28, fy1, 'EQUIP-DETAIL');
  const sy = YB - L * 0.17; for (const s of [-1, 1]) { const pts = [[cx + s * 30, sy], [cx + s * S2 * 0.3, sy + L * 0.03], [cx + s * S2 * 0.3, sy + L * 0.09], [cx + s * 30, sy + L * 0.1]]; a.prism(s > 0 ? pts : pts.slice().reverse(), zc + R * 0.35, zc + R * 0.35 + 45); a.poly(pts); }
  const gz = Z0 + o.gear * 0.9; for (const s of [-1, 1]) { const x = cx + s * R * 1.6, y = yr + ch * 0.55; a.tube([[cx + s * R * 0.4, y, zc - R * 0.5], [x, y, Z0 + 200]], [24, 24], 6); a.xcyl(x - 70, x + 70, y, Z0 + 200, 200, 12); a.rect(x - 70, y - 200, x + 70, y + 200, 'EQUIP-DETAIL'); }
  a.tube([[cx, YF + L * 0.14, zc - R * 0.5], [cx, YF + L * 0.14, Z0 + 150]], [22, 22], 6); a.xcyl(cx - 55, cx + 55, YF + L * 0.14, Z0 + 150, 150, 10);
}
/** a helicopter: cabin, tail boom with fin and tail rotor, main mast with blades, engine cowl and skids */
function heli(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, L = D, bl = W / 2 - 150, cw = o.cw, zk = Z0 + 500, cz = zk + cw * 0.55;
  a.ell(cx, YF + L * 0.2, cz, cw / 2, L * 0.17, cw * 0.55, 18, 8); a.box(cx - cw * 0.45, YF + L * 0.2, cz - cw * 0.5, cx + cw * 0.45, YF + L * 0.43, cz + cw * 0.6); a.rect(cx - cw / 2, YF + L * 0.03, cx + cw / 2, YF + L * 0.43);
  a.frame(cx - cw * 0.4, cz - cw * 0.05, cx + cw * 0.4, cz + cw * 0.45, YF + L * 0.045, YF + L * 0.06, 40);
  a.box(cx - cw * 0.35, YF + L * 0.43, cz + cw * 0.1, cx + cw * 0.35, YF + L * 0.55, cz + cw * 0.78); a.rect(cx - cw * 0.35, YF + L * 0.43, cx + cw * 0.35, YF + L * 0.55, 'EQUIP-DETAIL');
  if (o.twin) for (const s of [-1, 1]) a.ell(cx + s * cw * 0.32, YF + L * 0.5, cz + cw * 0.75, cw * 0.22, L * 0.07, cw * 0.18, 10, 5);
  a.tube([[cx, YF + L * 0.4, cz + cw * 0.15], [cx, YF + L * 0.65, cz + cw * 0.3], [cx, YB - 200, cz + cw * 0.45]], [cw * 0.3, cw * 0.16, cw * 0.06], 12); a.rect(cx - cw * 0.12, YF + L * 0.43, cx + cw * 0.12, YB - 200, 'EQUIP-DETAIL');
  prismX(a, [[YB - L * 0.12, cz + cw * 0.4], [YB - 150, cz + cw * 0.4], [YB - 150, cz + cw * 1.2], [YB - L * 0.08, cz + cw * 0.9]], cx - 25, cx + 25);
  a.xcyl(cx + 40, cx + 70, YB - 120, cz + cw * 0.9, cw * 0.5, 14); a.circ(cx + 55, YB - 120, 30, 'EQUIP-DETAIL'); prismX(a, [[YB - L * 0.14, cz + cw * 0.4], [YB - L * 0.09, cz + cw * 0.4], [YB - L * 0.09, cz + cw * 0.46], [YB - L * 0.14, cz + cw * 0.46]], cx - cw * 0.5, cx + cw * 0.5);
  const hz = Z1 - 150, my = YF + L * 0.46; a.tube([[cx, my, cz + cw * 0.7], [cx, my, hz - 100]], [cw * 0.1, cw * 0.1], 10); a.cyl(cx, my, hz - 100, hz, cw * 0.17, 12);
  for (let i = 0; i < o.blades; i++) { const g = (i / o.blades) * PI * 2 + 0.4, ux = m.cos(g), uy = m.sin(g), nx = -uy * 110, ny = ux * 110; a.prism([[cx + nx, my + ny], [cx + ux * bl + nx, my + uy * bl + ny], [cx + ux * bl - nx, my + uy * bl - ny], [cx - nx, my - ny]], hz - 30, hz); a.line(cx, my, cx + ux * bl, my + uy * bl, 'EQUIP-DETAIL'); }
  a.circ(cx, my, bl, 'EQUIP-HIDDEN');
  for (const s of [-1, 1]) { const x = cx + s * cw * 0.55; a.tube([[x, YF + L * 0.06, zk], [x, YF + L * 0.14, zk], [x, YF + L * 0.46, zk], [x, YF + L * 0.52, zk + 80]], [o.sk, o.sk, o.sk, o.sk], 8); for (const f of [0.2, 0.42]) a.tube([[x, YF + L * f, zk], [cx + s * cw * 0.38, YF + L * f, cz - cw * 0.3]], [o.sk * 0.8, o.sk * 0.8], 6); a.line(x, YF + L * 0.06, x, YF + L * 0.52, 'EQUIP-DETAIL'); }
}

F_({ cat: 'site/vehicles', title: 'Generic light helicopter',
  desc: (v) => `${v.label0} helicopter shape: a rounded cab with a glazed front frame, an engine cowl, a tail boom with a fin and tail rotor, a mast with ${v.blades} main rotor blades of ${v.rot} ft diameter and two skids with cross tubes.`,
  vs: [['piston, 2 seats', 396, 456, 126, 0, { rot: 33, blades: 2, cw: 1250, sk: 28, label0: 'Light piston-engine' }], ['turbine, 5 seats', 420, 504, 126, 0, { rot: 35, blades: 3, cw: 1450, sk: 30, label0: 'Light turbine' }], ['turbine twin, 8 seats', 540, 612, 150, 0, { rot: 45, blades: 4, cw: 1700, sk: 34, label0: 'Medium twin-engine', twin: true }]],
  build: (a, v) => { a.outline('EQUIP-HIDDEN'); heli(a, { cw: v.cw, blades: v.blades, sk: v.sk, twin: v.twin }); a.log('Added the cabin with glazed frame, the engine cowl, the tail boom with fin and tail rotor, the mast with main rotor blades and the skids (plan and 3D).'); } });

F_({ cat: 'site/vehicles', title: 'Generic heavy-lift helicopter',
  desc: (v) => `Heavy-lift helicopter shape: a large cabin, a twin engine cowl, a tail boom with a fin and tail rotor, a mast with ${v.blades} main rotor blades of ${v.rot} ft diameter and two skid sets.`,
  vs: [['5 blades, 72 ft rotor', 864, 1056, 228, 0, { rot: 72, blades: 5 }], ['6 blades, 90 ft rotor', 1080, 1320, 264, 0, { rot: 90, blades: 6 }]],
  build: (a, v) => { a.outline('EQUIP-HIDDEN'); heli(a, { cw: v.rot > 80 ? 3200 : 2800, blades: v.blades, sk: 55, twin: true }); a.log('Added the large cabin, the twin cowl, the tail boom with fin and tail rotor, the mast with main rotor blades and the skids (plan and 3D).'); } });

F_({ cat: 'site/vehicles', title: 'Generic light propeller aircraft',
  desc: (v) => `${v.seats}-seat light aircraft shape, ${v.len} ft long with a ${v.span} ft span: a rounded fuselage, a nose cowl with a two-blade propeller, a straight ${v.high ? 'high' : 'low'} wing${v.high ? ' with struts' : ''}, a fin and tailplanes, and fixed tricycle gear.`,
  vs: [[2, 24, 33, true, 100], [4, 27, 36, false, 100], [6, 29, 37, true, 108]].map(([seats, len, span, high, h]) => [`${seats} seats, ${high ? 'high' : 'low'} wing`, span * 12, len * 12, h, 0, { seats, len, span, high }]),
  build: (a, v) => { a.outline('EQUIP-HIDDEN'); lightPlane(a, { fd: 1200, gear: 420, high: v.high }); a.log('Added the fuselage, nose cowl and propeller, the straight wing' + (v.high ? ' with struts' : '') + ', the fin and tailplanes and the fixed tricycle gear (plan and 3D).'); } });

F_({ cat: 'site/vehicles', title: 'Generic light twin-engine aircraft',
  desc: (v) => `${v.seats}-seat twin-engine aircraft shape, ${v.len} ft long with a ${v.span} ft span: a rounded fuselage, a low straight wing carrying two engine nacelles with propellers, a fin and tailplanes and a retractable-style gear shown down.`,
  vs: [[5, 31, 38, 108], [8, 38, 46, 120]].map(([seats, len, span, h]) => [`${seats} seats`, span * 12, len * 12, h, 0, { seats, len, span }]),
  build: (a, v) => { a.outline('EQUIP-HIDDEN'); lightPlane(a, { fd: 1350, gear: 460, high: false, twin: true }); a.log('Added the fuselage, the low straight wing with two nacelles and propellers, the fin and tailplanes and the landing gear (plan and 3D).'); } });

F_({ cat: 'site/vehicles', title: 'Generic freighter aircraft',
  desc: (v) => `${v.kind} freighter aircraft shape, ${v.len} ft long with a ${v.span} ft span: a round fuselage with a side cargo door outline and no window bands, swept low wings, ${v.ne} underwing engines, a fin with tailplanes and multi-wheel gear.`,
  vs: [['narrow-body', 130, 112, 40, 2, 3950, 650, 1000], ['wide-body', 200, 197, 54, 2, 6000, 900, 1450], ['wide-body, long', 240, 212, 60, 4, 6000, 900, 1450]].map(([kind, len, span, tail, ne, fd, gear, er]) => [`${kind}, ${len} ft`, span * 12, len * 12, tail * 12, 0, { kind: kind.replace(', long', ''), len, span, ne, fd, gear, er }]),
  build: (a, v) => { plane(a, { fd: v.fd, gear: v.gear, wing: { r: 0.37, c0: 0.1, c1: 0.035, sw: 0.1 }, ne: v.ne, er: v.er }); const zc = a.Z0 + v.gear + v.fd / 2, L = a.D, R = v.fd / 2; for (const s of [-1, 1]) { a.box(a.cx + s * (R - 4) - 5, a.YF + L * 0.24, zc + R * 0.1, a.cx + s * (R - 4) + 5, a.YF + L * 0.24 + R * 1.8, zc + R * 0.95); a.frame(a.cx + s * (R - 4) - 5, zc + R * 0.1, a.cx + s * (R - 4) + 5, zc + R * 0.95, a.YF + L * 0.24 + 0, a.YF + L * 0.24 + 0, 1); } a.log('Added the fuselage with a raised side cargo door outline, swept wings, engines, the fin and tailplanes and the landing gear (plan and 3D).'); } });

F_({ cat: 'site/vehicles', title: 'Generic airfield runway sweeper',
  desc: (v) => `Runway sweeper truck with a ${v.sw} ft sweep: a cab and chassis, a cross-axis broom drum with bristle bands across the front, a hopper body with a raised lid and side hatch, a fan housing on top and four wheels with fenders.`,
  vs: [[6, 220, 100], [8, 252, 106], [12, 310, 116]].map(([sw, d, h]) => [`${sw} ft sweep`, sw * 12 * 0.5 + 66 > 100 ? sw * 12 * 0.5 + 60 : 96, d, h, 0, { sw }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a;
    trk(a, { cabL: 2000, nose: 1000, cabH: m.min(2700, H - 150), hoodH: 1400, wr: 440, ground: 420, axles: [1500, D - 1100] });
    a.xcyl(X0 + 60, X1 - 60, YF + 300, Z0 + 330, 300, 16); for (let x = X0 + 100; x < X1 - 100; x += 90) a.box(x, YF + 0, Z0 + 150, x + 40, YF + 120, Z0 + 520);
    const by = YF + 2100; a.box(X0 + 60, by, Z0 + 700, X1 - 60, YB - 100, m.min(Z1 - 400, Z0 + 2300)); a.box(X0 + 80, by + 200, m.min(Z1 - 400, Z0 + 2300), X1 - 80, YB - 200, m.min(Z1 - 300, Z0 + 2400)); a.rect(X0 + 60, by, X1 - 60, YB - 100, 'EQUIP-DETAIL');
    a.cyl(cx, by + 1000, m.min(Z1 - 300, Z0 + 2400), Z1 - 100, 280, 14); a.cone(cx, by + 1000, Z1 - 100, Z1, 280, 160, 14); sideFrame(a, X1 - 60, 1, by + 500, by + 1500, Z0 + 1100, Z0 + 1800, 40, 10);
    a.log('Added the cab and chassis, the cross-axis broom drum with bristle bands, the hopper body with lid and side hatch, the fan housing and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/vehicles', title: 'Generic airfield inspection vehicle',
  desc: (v) => `Airfield inspection ${v.kind === 'van' ? 'van' : 'pickup'}: a cab with windscreen and side glass, ${v.kind === 'van' ? 'a van body with side windows and rear doors, and a roof sign board on two legs' : 'an open bed with a toolbox and a roof beacon bar'}, a roof beacon, a front bull bar and four wheels with fenders.`,
  vs: [['pickup with beacon bar', 78, 226, 78, 0, { kind: 'pickup' }], ['van with roof sign board', 78, 246, 110, 0, { kind: 'van' }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D, H } = a, van = v.kind === 'van';
    trk(a, { cabL: van ? D : 2500, nose: van ? 900 : 1150, cabH: van ? 2500 : H - 100, hoodH: 1000, wr: 380, ground: 400, axles: [1150, D - 950] });
    a.frame(X0 + 120, Z0 + 500, X1 - 120, Z0 + 1050, YF + 20, YF + 60, 35); a.box(X0 + 120, YF + 20, Z0 + 500, X1 - 120, YF + 90, Z0 + 620);
    if (van) { for (let i = 0; i < 3; i++) for (const [x, d] of [[X0 + 40, -1], [X1 - 40, 1]]) sideFrame(a, x, d, YF + 1800 + i * 1300, YF + 2800 + i * 1300, Z0 + 1300, Z0 + 1950, 36, 8); a.frame(X0 + 160, Z0 + 650, X1 - 160, Z0 + 2200, YB - 14, YB, 45); a.box(cx - 15, YB - 14, Z0 + 650, cx + 15, YB, Z0 + 2200); for (const x of [X0 + 350, X1 - 350]) a.tube([[x, YF + 3000, Z0 + 2500], [x, YF + 3000, Z1 - 350]], [20, 20], 6); a.box(X0 + 200, YF + 2950, Z1 - 350, X1 - 200, YF + 3100, Z1 - 20); a.frame(X0 + 260, Z1 - 330, X1 - 260, Z1 - 60, YF + 2938, YF + 2950, 30); }
    else { const ty = YF + 2540; a.box(X0 + 40, ty, Z0 + 450, X1 - 40, YB - 20, Z0 + 600); for (const s of [-1, 1]) a.box(cx + s * (W / 2 - 60) - 30, ty, Z0 + 600, cx + s * (W / 2 - 60) + 30, YB - 20, Z0 + 1000); a.box(X0 + 140, ty + 80, Z0 + 600, X1 - 140, ty + 650, Z0 + 900); a.box(X0 + 40, ty, Z0 + 600, X1 - 40, ty + 60, Z0 + 1000); a.rect(X0 + 40, ty, X1 - 40, YB - 20, 'EQUIP-DETAIL'); }
    lightbar(a, cx, YF + (van ? 900 : 1100), Z0 + (van ? 2500 : H - 100), W * 0.62);
    a.log('Added the cab, ' + (van ? 'the van body with side windows, rear doors and the roof sign board' : 'the open bed with a toolbox') + ', the roof beacon bar, the bull bar and four wheels with fenders (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield beacon tower',
  desc: (v) => `Airfield beacon tower ${v.ht} ft tall: a four-leg lattice with panel bracing, a caged ladder, a service platform with a rail and a rotating beacon head of a lens drum with two lenses and a dome.`,
  vs: [[40, 8], [60, 10], [80, 12]].map(([ht, base]) => [`${ht} ft tall`, base * 12, base * 12, ht * 12, 0, { ht, base }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 200);
    const zt = Z1 - 1500; lattice(a, X0 + 300, YF + 300, X1 - 300, YB - 300, Z0 + 200, zt, { taper: 0.55, n: m.round(v.ht / 8), t: 70, bt: 32 });
    lad(a, cx, YF + 250, Z0 + 200, zt, 450, 20); const pw = W * 0.3 + 300; a.box(cx - pw, cy - pw, zt, cx + pw, cy + pw, zt + 90); rail(a, cx - pw, cy - pw, cx + pw, cy - pw, zt + 90, zt + 1000, 16, 4, true); rail(a, cx - pw, cy + pw, cx + pw, cy + pw, zt + 90, zt + 1000, 16, 4, true);
    a.cyl(cx, cy, zt + 90, zt + 500, 240, 14); a.cyl(cx, cy, zt + 500, zt + 900, 300, 18); for (const s of [-1, 1]) a.box(cx + s * 300 - 25, cy - 130, zt + 520, cx + s * 300 + 25, cy + 130, zt + 880); a.ell(cx, cy, zt + 900, 300, 300, 260, 16, 6); a.circ(cx, cy, 300, 'EQUIP-DETAIL');
    a.log('Added the tapered lattice legs with panel bracing, the caged ladder, the service platform with rail and the rotating beacon head with lenses and dome (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic airfield navigation antenna station',
  desc: (v) => `Navigation antenna station on a ${v.dia} ft ground plane: a round counterpoise disc with a raised rim, a central cylindrical housing under a conical radome, a ring of ${v.n} perimeter posts with a rail, and a small equipment shelter at the edge.`,
  vs: [[30, 12], [50, 16], [100, 24]].map(([dia, n]) => [`${dia} ft ground plane`, (dia + 14) * 12, (dia + 14) * 12, (dia > 60 ? 18 : 14) * 12, 0, { dia, n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, r = (v.dia * FT) / 2; a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.12, 'EQUIP-DETAIL');
    a.cyl(cx, cy, Z0, Z0 + 150, r, 32); ring(a, cx, cy, Z0 + 180, r - 20, 30, 32); a.cyl(cx, cy, Z0 + 150, Z0 + 1700, r * 0.12 + 40, 20); a.cone(cx, cy, Z0 + 1700, Z1 - 100, r * 0.14 + 60, r * 0.03, 20); a.ell(cx, cy, Z1 - 100, r * 0.03, r * 0.03, 80, 8, 4);
    for (let i = 0; i < v.n; i++) { const g = (i / v.n) * PI * 2, pr = r + 500; a.cyl(cx + m.cos(g) * pr, cy + m.sin(g) * pr, Z0, Z0 + 1200, 40, 6); } ring(a, cx, cy, Z0 + 1200, r + 500, 18, 32); ring(a, cx, cy, Z0 + 700, r + 500, 14, 32); a.circ(cx, cy, r + 500, 'EQUIP-DETAIL');
    const sx = cx + r * 0.62, sy = cy + r * 0.62; a.box(sx - 900, sy - 700, Z0 + 150, sx + 900, sy + 700, Z0 + 2500); a.box(sx - 1000, sy - 800, Z0 + 2500, sx + 1000, sy + 800, Z0 + 2620); a.frame(sx - 500, Z0 + 150, sx + 500, Z0 + 2100, sy - 714, sy - 700, 60); a.rect(sx - 900, sy - 700, sx + 900, sy + 700);
    a.log('Added the counterpoise disc with a raised rim, the central housing with conical radome, the perimeter posts with rails and the equipment shelter (plan and 3D).');
  } });

F_({ cat: 'site/landscape', title: 'Generic mine explosives magazine',
  desc: (v) => `Steel explosives store for a mine, ${v.len} ft long: a container-style box on a gravel pad with a ventilated roof, a two-leaf locked door with a hasp, vent grilles, a lightning mast and an earth mound along both sides and the back.`,
  vs: [10, 20, 40].map((len) => [`${len} ft store`, (len + 16) * 12, 240, 150, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline('EQUIP-HIDDEN'); const bw = v.len * FT, bx0 = cx - bw / 2, bx1 = cx + bw / 2, fy = YF + 2400, by1 = YB - 1800;
    a.box(X0, YF, Z0, X1, YB, Z0 + 150);
    a.box(bx0, fy, Z0 + 150, bx1, by1, Z0 + 2850); a.box(bx0 - 60, fy - 60, Z0 + 2850, bx1 + 60, by1 + 60, Z0 + 2950);
    for (let x = bx0 + 200; x < bx1 - 200; x += 280) a.box(x, fy - 15, Z0 + 350, x + 150, fy, Z0 + 2700);
    const dw = 1100; for (const s of [-1, 1]) a.frame(cx + (s < 0 ? -dw : 0), Z0 + 150, cx + (s < 0 ? 0 : dw), Z0 + 2650, fy - 26, fy - 10, 70); a.box(cx - 80, fy - 50, Z0 + 1250, cx + 80, fy - 26, Z0 + 1500); a.rect(cx - dw, fy - 26, cx + dw, fy, 'EQUIP-DETAIL');
    for (const x of [bx0 + 600, bx1 - 600]) a.box(x - 250, fy - 24, Z0 + 2300, x + 250, fy - 8, Z0 + 2600);
    const mh = 2200; prismY(a, [[X0 + 600, Z0 + 150], [bx0 - 100, Z0 + 150], [bx0 - 100, Z0 + mh], [X0 + 1500, Z0 + mh * 0.5]].slice(0, 0).concat([[X0 + 300, Z0 + 150], [bx0 - 100, Z0 + 150], [bx0 - 100, Z0 + mh], [bx0 - 900, Z0 + mh]]), fy, by1 + 1200); prismY(a, [[bx1 + 100, Z0 + 150], [X1 - 300, Z0 + 150], [bx1 + 900, Z0 + mh], [bx1 + 100, Z0 + mh]], fy, by1 + 1200);
    a.box(bx0 - 100, by1, Z0 + 150, bx1 + 100, YB - 100, mh + Z0); a.cyl(bx1 - 400, by1 - 300, Z0 + 2950, Z1 - 50, 30, 8); a.ell(bx1 - 400, by1 - 300, Z1 - 50, 50, 50, 50, 6, 4); a.circ(bx1 - 400, by1 - 300, 30, 'EQUIP-DETAIL'); a.rect(bx0, fy, bx1, by1, 'EQUIP');
    a.log('Added the gravel pad, the steel box with roof and door leaves, the vent grilles, the lightning mast and the earth mound along both sides and the back (plan and 3D).');
  } });

export default FAMS;
