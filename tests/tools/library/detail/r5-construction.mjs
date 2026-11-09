/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, construction: equipment (cranes, concrete, lifts, loaders, rollers), temporary works and site facilities, formwork and scaffolding, tools and plant.
 *  Original geometry; generic machines by type and size class, never a maker or model. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math;
const tub = (a, p, q, r, seg = 5) => a.tube([p, q], [r, r], seg);
const cross = (u, s) => [u[1] * s[2] - u[2] * s[1], u[2] * s[0] - u[0] * s[2], u[0] * s[1] - u[1] * s[0]];
/** a square lattice member from p0 to p1: four chords, rings and X-diagonals. s = a unit vector across the section, h0/h1 = half widths at each end */
function lat(a, p0, p1, s, h0, h1, n, t = 12) {
  const L = m.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]), u = [0, 1, 2].map((i) => (p1[i] - p0[i]) / L), v = cross(u, s);
  const pt = (f, sx, sy) => { const h = h0 + (h1 - h0) * f; return [0, 1, 2].map((i) => p0[i] + (p1[i] - p0[i]) * f + s[i] * sx * h + v[i] * sy * h); };
  const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [sx, sy] of cs) tub(a, pt(0, sx, sy), pt(1, sx, sy), t, 4);
  for (let i = 0; i <= n; i++) for (let k = 0; k < 4; k++) tub(a, pt(i / n, ...cs[k]), pt(i / n, ...cs[(k + 1) % 4]), t * 0.55, 4);
  for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const A1 = cs[k], B1 = cs[(k + 1) % 4]; (i + k) % 2 ? tub(a, pt(i / n, ...A1), pt((i + 1) / n, ...B1), t * 0.5, 4) : tub(a, pt(i / n, ...B1), pt((i + 1) / n, ...A1), t * 0.5, 4); }
}
/** a wheel with a lateral axle at (x, y), radius r on the floor (or at height zc), width w */
function whl(a, x, y, r, w = 150, zc) { const z = zc ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, z, r, 18); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); a.xcyl(x - w / 2 - 6, x + w / 2 + 6, y, z, r * 0.45, 10); }
/** wheels on both sides at each y (inset from the outer faces) */
function wheelPairs(a, ys, r, w = 150, inset = 10) { for (const y of ys) for (const sx of [a.X0 + inset + w / 2, a.X1 - inset - w / 2]) whl(a, sx, y, r, w); }
/** a crawler track on the floor at x centre xc, from y0 to y1 (y0 < y1), width w, height hh */
function trackRun(a, xc, y0, y1, w, hh) { a.box(xc - w / 2, y0 + hh / 2, a.Z0, xc + w / 2, y1 - hh / 2, a.Z0 + hh); a.xcyl(xc - w / 2, xc + w / 2, y0 + hh / 2, a.Z0 + hh / 2, hh / 2, 14); a.xcyl(xc - w / 2, xc + w / 2, y1 - hh / 2, a.Z0 + hh / 2, hh / 2, 14); a.rect(xc - w / 2, y0, xc + w / 2, y1, 'EQUIP-DETAIL'); for (let y = y0 + hh; y < y1 - hh * 0.9; y += hh * 1.2) a.xcyl(xc - w / 2 - 4, xc + w / 2 + 4, y, a.Z0 + hh * 0.22, hh * 0.2, 8); }
/** a vertical ladder in the X-Z plane at y, from z0 to z1 */
function ladder(a, x, y, z0, z1, wd = 400, step = 300) { tub(a, [x - wd / 2, y, z0], [x - wd / 2, y, z1], 14, 5); tub(a, [x + wd / 2, y, z0], [x + wd / 2, y, z1], 14, 5); for (let z = z0 + step / 2; z < z1; z += step) tub(a, [x - wd / 2, y, z], [x + wd / 2, y, z], 10, 4); }
/** a rail at height z0..z1 (top rail + mid rail + posts) from (x0,y0) to (x1,y1) */
function rail(a, x0, y0, x1, y1, z0, z1, posts = 3, t = 14) { tub(a, [x0, y0, z1], [x1, y1, z1], t, 5); tub(a, [x0, y0, (z0 + z1) / 2], [x1, y1, (z0 + z1) / 2], t * 0.8, 5); for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); tub(a, [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1], t * 0.8, 5); } a.line(x0, y0, x1, y1, 'EQUIP-DETAIL'); }
/** a cylinder between two points (hydraulic ram: barrel plus rod) */
function ram(a, p, q, r = 40) { const f = 0.55, mid = [0, 1, 2].map((i) => p[i] + (q[i] - p[i]) * f); tub(a, p, mid, r, 8); tub(a, mid, q, r * 0.6, 6); }
/** a hard-hat-style cab block: pillars, roof and glazing frames. x0..x1, y0..y1, z0..z1 */
function cabBlock(a, x0, y0, x1, y1, z0, z1, door = true) { a.box(x0, y0, z0, x1, y1, z0 + 120); a.box(x0 - 30, y0 - 30, z1 - 90, x1 + 30, y1 + 30, z1); for (const x of [x0, x1 - 60]) for (const y of [y0, y1 - 60]) a.box(x, y, z0 + 120, x + 60, y + 60, z1 - 90); a.box(x0 + 30, y0 + 60, z0 + 120, x0 + 50, y1 - 60, z1 - 110); a.box(x1 - 50, y0 + 60, z0 + 120, x1 - 30, y1 - 60, z1 - 110); a.box(x0 + 60, y0 + 30, z0 + 120, x1 - 60, y0 + 48, z1 - 110); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); a.box((x0 + x1) / 2 - 150, y0 + 100, z0 + 120, (x0 + x1) / 2 + 150, y1 - 120, z0 + 560); }
/** a hook block hanging from a cable */
function hook(a, x, y, zt, zb) { tub(a, [x, y, zt], [x, y, zb + 260], 10, 4); a.box(x - 130, y - 80, zb + 130, x + 130, y + 80, zb + 260); a.cyl(x, y, zb, zb + 130, 50, 8); }
/** a stack of n pallet-style legs: a bolt-on cube of blocks (floor pallet) */
function pallet(a, x0, y0, x1, y1, z0, h = 140) { a.box(x0, y0, z0 + h - 25, x1, y1, z0 + h); for (const x of [x0, (x0 + x1) / 2 - 40, x1 - 80]) a.box(x, y0, z0, x + 80, y1, z0 + h - 25); }
const L8 = (n) => Array.from({ length: n }, (_, i) => i);

/** extrude a convex polygon given as [y, z] points between x0 and x1 (a barrier profile) */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]);
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a site cabin shell with windows, door, steps and roof; o: windows count, doors count, ac. The front 760 mm of the body is the entry step. */
function cabin(a, v, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
  const yf = YF + 760, zr = Z1 - 300;
  a.box(X0 + 20, yf + 20, Z0 + 150, X1 - 20, YB - 20, Z0 + 260); for (const x of [X0 + 300, cx, X1 - 600]) a.box(x, yf + 20, Z0, x + 300, YB - 20, Z0 + 150);
  a.box(X0 + 20, yf + 20, Z0 + 260, X1 - 20, YB - 20, zr - 100); a.box(X0, yf, zr - 100, X1, YB, zr - 20); a.box(X0 + 40, yf + 40, zr - 20, X1 - 40, YB - 40, zr);
  a.rect(X0 + 20, yf + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  const nt = o.windows + o.doors, dw = (W - 700) / nt;
  for (let i = 0; i < nt; i++) { const x0 = X0 + 350 + i * dw;
    if (i < o.doors) { a.box(x0 + 60, yf - 20, Z0 + 260, x0 + dw - 60, yf + 20, zr - 400); a.box(x0 + dw - 150, yf - 50, Z0 + 1100, x0 + dw - 110, yf - 20, Z0 + 1250); a.rect(x0 + 60, yf - 4, x0 + dw - 60, yf + 20, 'EQUIP-DETAIL'); a.arc(x0 + 60, yf, dw - 120, 270, 360); }
    else { a.frame(x0 + 100, Z0 + 1000, x0 + dw - 100, zr - 500, yf - 20, yf + 10, 40); a.box(x0 + 140, yf - 8, Z0 + 1040, x0 + dw - 140, yf, zr - 540); a.line(x0 + 100, yf, x0 + dw - 100, yf, 'EQUIP-DETAIL'); } }
  const sw = dw * 0.9; a.box(X0 + 350, yf - 740, Z0, X0 + 350 + sw, yf - 20, Z0 + 140); a.box(X0 + 350, yf - 740, Z0 + 140, X0 + 350 + sw, yf - 380, Z0 + 280); a.rect(X0 + 350, yf - 740, X0 + 350 + sw, yf - 20, 'EQUIP-DETAIL');
  rail(a, X0 + 350, yf - 700, X0 + 350, yf - 30, Z0 + 280, Z0 + 1100, 3, 14); rail(a, X0 + 350 + sw, yf - 700, X0 + 350 + sw, yf - 30, Z0 + 280, Z0 + 1100, 3, 14);
  if (o.ac) { a.box(X1 - 900, yf + 500, zr, X1 - 200, yf + 1100, Z1 - 20); a.cyl(X1 - 550, yf + 800, zr, Z1, 220, 12); }
  a.log(o.log || 'Added the skid frame, panelled shell, windows, door with swing, entry step with rail and roof (plan and 3D).');
}


export default [
// ======================================================================================= construction/equipment
fam({ cat: 'construction/equipment', title: 'Generic construction-site tower crane',
  desc: (v) => `Hammerhead tower crane, ${v.jib} ft jib on a ${v.mast} ft lattice mast: ballasted cross base, mast lattice, slewing ring, operator cab, tower head with jib pendants, counter-jib with concrete counterweights, trolley and hook block.`,
  vs: [[100, 90], [130, 130], [165, 170], [200, 210], [230, 260]].map(([jib, mast]) => [`${jib} ft jib on ${mast} ft mast`, m.round((jib * 1.28 + 4) * 12), 168, (mast + 30) * 12, 0, { jib, mast }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cy } = a; a.outline();
    const jl = v.jib * FT, xs = X1 - jl - 400, hw = 780, zt = Z1 - 2000, zb = Z1 - 3600, zm = zb - 600;
    for (const [x0, y0, x1, y1] of [[xs - 2100, cy - 260, xs + 2100, cy + 260], [xs - 260, YF + 100, xs + 260, YB - 100]]) { a.box(x0, y0, Z0, x1, y1, Z0 + 600); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { a.box(xs + sx * 1500 - 480, cy + sy * ((a.D / 2) - 700) - 480, Z0 + 600, xs + sx * 1500 + 480, cy + sy * ((a.D / 2) - 700) + 480, Z0 + 1800); }
    lat(a, [xs, cy, Z0 + 600], [xs, cy, zm], [1, 0, 0], hw, hw, m.round((zm - Z0) / 1500), 16); a.rect(xs - hw, cy - hw, xs + hw, cy + hw);
    a.cyl(xs, cy, zm, zb, hw * 1.5, 16); a.circ(xs, cy, hw * 1.5, 'EQUIP-DETAIL');
    cabBlock(a, xs - 1900, cy - 700, xs - 600, cy + 700, zb, zb + 1900); a.box(xs - 2000, cy - 800, zb, xs - 500, cy + 800, zb + 100);
    lat(a, [xs - 300, cy, zt - 750], [xs - 300, cy, Z1 - 350], [1, 0, 0], 560, 120, 3, 12); tub(a, [xs - 300, cy, Z1 - 350], [xs - 300, cy, Z1], 24, 6);
    const je = X1 - 150; lat(a, [xs, cy, zt - 700], [je, cy, zt - 700], [0, 1, 0], 560, 160, v.jib > 150 ? 20 : 14, 14);
    tub(a, [xs - 300, cy, Z1], [xs + jl * 0.55, cy, zt - 700], 12, 4); tub(a, [xs - 300, cy, Z1], [je - 600, cy, zt - 700], 12, 4);
    const cl = xs - X0 - 300; lat(a, [xs, cy, zt - 700], [X0 + 150, cy, zt - 700], [0, 1, 0], 560, 400, 6, 14); tub(a, [xs - 300, cy, Z1], [X0 + 400, cy, zt - 700], 12, 4);
    for (let i = 0; i < 4; i++) a.box(X0 + 250 + i * 520, cy - 500, zt - 1500, X0 + 700 + i * 520, cy + 500, zt - 800);
    const tx = xs + jl * 0.6; a.box(tx - 500, cy - 450, zt - 1500, tx + 500, cy + 450, zt - 1150); hook(a, tx, cy, zt - 1500, Z0 + (Z1 - Z0) * 0.42);
    a.rect(X0 + 150, cy - 280, xs, cy + 280, 'EQUIP-DETAIL'); a.rect(xs, cy - 280, je, cy + 280, 'EQUIP-DETAIL'); a.circ(xs, cy, hw * 1.5, 'EQUIP-DETAIL');
    a.log('Added the ballasted cross base, lattice mast, slewing ring, cab, tower head with pendants, jib, counter-jib with counterweights, trolley and hook block (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic site mobile crane, all-terrain',
  desc: (v) => `All-terrain mobile crane, ${v.t} ton class, ${v.ax} axles: steel carrier with ${v.ax * 2} large tyres, forward cab, stowed outrigger beams, rear turntable with hoist cab, telescopic boom in four sections lying forward over the cab, counterweight and hook block.`,
  vs: [[30, 3, 33], [60, 4, 40], [100, 5, 44], [160, 6, 50], [250, 7, 58]].map(([t, ax, len]) => [`${t} ton class, ${ax} axles`, 118, len * 12, 158 + (ax > 4 ? 6 : 0), 0, { t, ax }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 900; a.box(X0 + 120, YF + 200, gz, X1 - 120, YB - 100, gz + 520);
    const cabL = 2300; a.box(X0 + 60, YF + 60, gz + 100, X1 - 60, YF + cabL, Z0 + 3300); a.box(X0 + 120, YF + 30, gz + 160, X1 - 120, YF + 80, gz + 700);
    a.box(X0 + 140, YF + 40, Z0 + 2100, X1 - 140, YF + 70, Z0 + 3000); a.rect(X0 + 60, YF + 60, X1 - 60, YF + cabL, 'EQUIP-DETAIL');
    for (let i = 0; i < v.ax; i++) { const y = i < 2 ? YF + cabL - 600 + i * 1500 : YF + cabL + 2400 + (i - 2) * 1500; wheelPairs(a, [y], 640, 380, 20); a.xcyl(X0 + 400, X1 - 400, y, Z0 + 640, 70, 8); }
    for (const sy of [YF + 1900, YB - 1500]) { a.box(X0 + 20, sy - 150, gz - 80, X1 - 20, sy + 150, gz + 420); a.rect(X0 + 20, sy - 150, X1 - 20, sy + 150, 'EQUIP-DETAIL'); }
    const ty = YB - 3000, tz = gz + 520; a.cyl(cx, ty, tz, tz + 400, 1500, 20); a.circ(cx, ty, 1500, 'EQUIP-DETAIL'); cabBlock(a, X0 + 80, ty - 2000, X0 + 1100, ty - 700, tz + 400, tz + 1900);
    a.box(cx - 800, YB - 1800, tz + 400, cx + 800, YB - 100, tz + 1300);
    const b0 = [cx, ty + 400, tz + 900], b1 = [cx, YF + cabL + 500, Z1 - 650];
    tub(a, b0, b1, 640, 8); tub(a, [cx, ty - 600, tz + 1000], [cx, YF + cabL + 800, Z1 - 800], 540, 8); tub(a, [cx, YF + cabL + 2000, tz + 1200], [cx, YF + cabL + 120, Z1 - 500], 420, 8); a.cyl(cx, YF + cabL + 120, Z1 - 500, Z1 - 100, 70, 8);
    ram(a, [cx, ty + 800, tz + 400], [cx, YF + cabL + 2200, Z1 - 900], 120); tub(a, [cx, YF + cabL + 120, Z1 - 100], [cx, YF + cabL + 120, Z0 + 3500], 10, 4); a.box(cx - 150, YF + cabL + 40, Z0 + 3350, cx + 150, YF + cabL + 200, Z0 + 3500);
    a.rect(cx - 420, YF + cabL, cx + 420, ty, 'EQUIP-DETAIL');
    a.log('Added the carrier with axles and tyres, cab, stowed outriggers, turntable with hoist cab, four-section telescopic boom with ram, counterweight and hook block (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic crawler crane with lattice boom',
  desc: (v) => `Crawler crane, ${v.t} ton class, with a ${v.bl} ft lattice boom raised at about 60 degrees: two crawler tracks, a turntable car body with operator cab, engine enclosure, counterweight, mast and boom pendants, and a hook block.`,
  vs: [[60, 80], [120, 120], [200, 160]].map(([t, bl]) => [`${t} ton class, ${bl} ft boom`, (14 + t / 20) * 12, m.round((20 + t / 8 + bl * 0.55) * 12 + 120), m.round((bl * 0.87 + 18) * 12), 0, { t, bl }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const tw = W * 0.22;
const tyo = YB - 6900;
    for (const sx of [-1, 1]) trackRun(a, cx + sx * (W / 2 - tw / 2 - 40), tyo, YB - 100, tw, 1100);
    a.box(X0 + tw + 100, tyo + 400, Z0 + 700, X1 - tw - 100, YB - 400, Z0 + 1400); a.cyl(cx, YB - 3400, Z0 + 1400, Z0 + 1800, 2100, 20); a.circ(cx, YB - 3400, 2100, 'EQUIP-DETAIL');
    a.box(cx - 1600, YB - 5200, Z0 + 1800, cx + 1600, YB - 1500, Z0 + 3100); cabBlock(a, cx - 1600, YB - 5600, cx - 400, YB - 4400, Z0 + 1800, Z0 + 3500); a.box(cx - 1500, YB - 1800, Z0 + 1800, cx + 1500, YB - 300, Z0 + 2700);
    for (let i = 0; i < 3; i++) a.box(cx - 1400, YB - 900 - i * 80, Z0 + 2700 + i * 280, cx + 1400, YB - 300, Z0 + 2980 + i * 280);
    a.rect(cx - 1600, YB - 5200, cx + 1600, YB - 300, 'EQUIP-DETAIL');
    const p0 = [cx, YB - 5300, Z0 + 2100], ang = m.PI / 3, bl = v.bl * FT * 0.99, p1 = [cx, p0[1] - m.cos(ang) * bl, p0[2] + m.sin(ang) * bl];
    lat(a, p0, p1, [1, 0, 0], 520, 220, m.round(bl / 1800), 16);
    lat(a, [cx, YB - 4500, Z0 + 3100], [cx, YB - 4500 - 800, Z0 + 3100 + 4200], [1, 0, 0], 520, 120, 3, 14);
    tub(a, [cx, YB - 4500 - 800, Z0 + 7300], [cx, p1[1] + 300, p1[2] - 300], 14, 4); tub(a, [cx, YB - 4500 - 800, Z0 + 7300], [cx, YB - 700, Z0 + 2900], 14, 4);
    ram(a, [cx - 300, YB - 4400, Z0 + 3000], [cx - 300, YB - 5300 - 3000, Z0 + 3000 + 2900], 110);
    hook(a, cx, p1[1] - 160, p1[2] - 400, Z0 + (Z1 - Z0) * 0.3); a.line(cx, YB - 5300, cx, p1[1], 'EQUIP-DETAIL');
    a.rect(cx - 520, p1[1], cx + 520, YB - 5300, 'EQUIP-DETAIL');
    a.log('Added the two crawler tracks, car body, turntable, cab, counterweight, mast, raised lattice boom with pendants, ram and hook block (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic concrete mixer truck',
  desc: (v) => `Concrete mixer truck, ${v.yd} cubic yard drum: ${v.ax}-axle chassis with cab, an inclined rotating drum with ridged shell and charging hopper, a swing-out discharge chute, water tank, ladder and platform.`,
  vs: [[6, 3, 24], [8, 3, 26], [10, 4, 29], [12, 5, 32]].map(([yd, ax, len]) => [`${yd} yd drum, ${ax} axles`, 100, len * 12, 150, 0, { yd, ax }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 800, cabL = 2300; a.box(X0 + 140, YF + 200, gz, X1 - 140, YB - 100, gz + 300);
    a.box(X0 + 80, YF + 450, gz + 100, X1 - 80, YF + cabL, Z0 + 2700); a.box(X0 + 120, YF + 40, gz + 120, X1 - 120, YF + 450, gz + 800); a.box(X0 + 140, YF + 40, Z0 + 1700, X1 - 140, YF + 460, Z0 + 2400);
    a.rect(X0 + 80, YF + 40, X1 - 80, YF + cabL, 'EQUIP-DETAIL');
    const ys = [YF + 1100, ...L8(v.ax - 1).map((i) => YB - 1100 - i * 1250)].filter(Boolean); wheelPairs(a, ys, 530, 300, 25);
    const dr = 900 + v.yd * 8, dz0 = gz + 900; const pf = [cx, YF + cabL + 300, dz0 + 1000], pb = [cx, YB - 900, dz0 - 100];
    a.tube([pb, [cx, pb[1] - 500, dz0 + 20], [cx, (pb[1] + pf[1]) / 2, dz0 + 750], [cx, pf[1] + 400, pf[2] - 40], pf], [dr * 0.4, dr * 0.85, dr, dr * 0.95, dr * 0.5], 20);
    for (let i = 1; i < 6; i++) { const f = i / 6; a.tube([[cx, pb[1] + (pf[1] - pb[1]) * f - 40, pb[2] + (pf[2] - pb[2]) * f], [cx, pb[1] + (pf[1] - pb[1]) * f + 40, pb[2] + (pf[2] - pb[2]) * f]], [dr * 1.04, dr * 1.04], 18); }
    a.box(cx - 650, YB - 700, gz + 1300, cx + 650, YB - 120, gz + 1750); a.box(cx - 500, YB - 500, gz + 1100, cx + 500, YB - 180, gz + 1300);
    tub(a, [X1 - 330, YB - 450, gz + 1000], [X1 - 330, YB - 250, gz + 700], 140, 8); a.box(X1 - 420, YB - 700, gz + 520, X1 - 240, YB - 100, gz + 700);
    a.box(X0 + 160, YF + cabL + 150, gz + 400, X0 + 700, YF + cabL + 1600, gz + 1200); ladder(a, X1 - 300, YB - 1800, gz + 200, gz + 2000, 300);
    a.circ(cx, (pb[1] + pf[1]) / 2, dr, 'EQUIP-DETAIL'); a.rect(cx - 650, YB - 700, cx + 650, YB - 120, 'EQUIP-DETAIL');
    a.log('Added the cab, chassis with axles and tyres, inclined ridged drum, charging hopper, discharge chute, water tank, ladder and platform (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic truck-mounted concrete boom pump',
  desc: (v) => `Truck-mounted concrete pump with a ${v.bm} m placing boom folded over the cab and body in ${v.sec} sections, rear hopper and pump unit, four outrigger beams with pads, ${v.ax}-axle chassis with cab and tyres.`,
  vs: [[28, 4, 3, 30], [36, 5, 4, 32], [47, 5, 4, 36], [58, 6, 5, 40]].map(([bm, sec, ax, len]) => [`${bm} m boom, ${sec} sections`, 100, len * 12, 150, 0, { bm, sec, ax }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 800, cabL = 2300; a.box(X0 + 140, YF + 200, gz, X1 - 140, YB - 100, gz + 300);
    a.box(X0 + 80, YF + 450, gz + 100, X1 - 80, YF + cabL, Z0 + 2700); a.box(X0 + 120, YF + 40, gz + 120, X1 - 120, YF + 450, gz + 800); a.rect(X0 + 80, YF + 40, X1 - 80, YF + cabL, 'EQUIP-DETAIL');
    wheelPairs(a, [YF + 1100, YF + 2600, ...L8(v.ax - 2).map((i) => YB - 900 - i * 1300)], 530, 300, 25);
    for (const sy of [YF + cabL + 300, YB - 1700]) for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 100) - 80, sy - 150, gz - 100, cx + sx * (W / 2 - 100) + 80, sy + 150, gz + 360); a.box(cx + sx * (W / 2 - 100) - 280, sy - 280, Z0, cx + sx * (W / 2 - 100) + 280, sy + 280, Z0 + 90); }
    a.box(cx - 700, YB - 1900, gz + 300, cx + 700, YB - 100, gz + 1200); a.box(cx - 800, YB - 900, gz + 1200, cx + 800, YB - 100, gz + 1700); a.rect(cx - 800, YB - 900, cx + 800, YB - 100, 'EQUIP-DETAIL');
    a.box(cx - 500, YF + cabL + 150, gz + 300, cx + 500, YF + cabL + 1100, gz + 1500);
    const secL = (YB - 2500 - (YF + cabL + 300)) / m.max(1, v.sec - 1);
    for (let k = 0; k < v.sec; k++) { const y0 = YB - 2400 - k * (secL * 0.9) - (k === 0 ? 0 : 0), z = gz + 1900 + k * 190, r = 190 - k * 12; tub(a, [cx, y0, z], [cx, y0 - secL * 0.95, z + 60 * (k % 2)], r, 6); }
    ram(a, [cx, YB - 2800, gz + 900], [cx, YB - 2500 - secL * 0.5, gz + 1900], 90); a.cyl(cx, YB - 2500, gz + 1400, gz + 2000, 260, 12);
    tub(a, [cx, YB - 2500 - (v.sec - 1) * secL * 0.9 - secL * 0.95, gz + 1900 + (v.sec - 1) * 190], [cx, YB - 2500 - (v.sec - 1) * secL * 0.9 - secL * 0.95 - 1400, gz + 1500], 70, 5);
    a.log('Added the cab, chassis with tyres, four outrigger beams with pads, pump unit and hopper, and the folded boom in sections with its ram (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic trailer-mounted concrete pump',
  desc: (v) => `Towable stationary concrete pump, ${v.cy} cubic yard per hour class: twin-axle trailer with a charging hopper, hydraulic pump unit, engine cover, delivery pipe, tow eye and two outrigger legs.`,
  vs: [[40, 72, 150], [65, 80, 180], [100, 88, 216]].map(([cy, w, d]) => [`${cy} yd/h class`, w, d, 74 + cy / 8, 0, { cy }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0 + 110, YF + 500, Z0 + 420, X1 - 110, YB - 100, Z0 + 600); for (const sx of [-1, 1]) for (const dy of [0, 600]) whl(a, cx + sx * (W / 2 - 120), YB - D * 0.45 - dy, 360, 200);
    tub(a, [cx - 60, YF + 500, Z0 + 520], [cx, YF + 80, Z0 + 520], 40, 5); a.cyl(cx, YF + 70, Z0 + 420, Z0 + 600, 70, 10);
    a.box(X0 + 130, YB - D * 0.5, Z0 + 600, X1 - 130, YB - 150, Z0 + 1100); a.box(X0 + 200, YB - D * 0.5 - 60, Z0 + 1100, X1 - 200, YB - 300, Z1 - 450);
    a.box(cx - 450, YF + D * 0.2, Z0 + 600, cx + 450, YB - D * 0.5, Z1 - 150); a.box(cx - 380, YF + D * 0.2 - 100, Z1 - 450, cx + 380, YF + D * 0.2 + 500, Z1);
    tub(a, [cx + 300, YF + D * 0.35, Z0 + 1000], [cx + 300, YB - 100, Z0 + 1050], 60, 6);
    for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 150) - 40, YB - D * 0.45 - 450, Z0 + 150, cx + sx * (W / 2 - 150) + 40, YB - D * 0.45 - 330, Z0 + 650); a.box(cx + sx * (W / 2 - 150) - 150, YB - D * 0.45 - 520, Z0, cx + sx * (W / 2 - 150) + 150, YB - D * 0.45 - 260, Z0 + 70); }
    a.rect(cx - 380, YF + D * 0.2 - 100, cx + 380, YF + D * 0.2 + 500, 'EQUIP-DETAIL');
    a.log('Added the trailer frame and wheels, hopper, pump unit, engine cover, delivery pipe, tow eye and outrigger legs (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic rack-and-pinion material hoist',
  desc: (v) => `Rack-and-pinion material hoist, ${v.ht} ft travel, ${v.cap} ton rated: lattice mast, a mesh-sided cage with roof and gates, drive unit on the cage, counterweight, base fence with a gate and landing ramps.`,
  vs: [[40, 1], [70, 1.5], [100, 2], [150, 3]].map(([ht, cap]) => [`${ht} ft travel, ${cap} ton`, 120, 156, (ht + 14) * 12, 0, { ht, cap }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const my = YB - 260, mh = 330;
    lat(a, [cx, my, Z0], [cx, my, Z1 - 200], [1, 0, 0], mh, mh, m.round((Z1 - Z0) / 1200), 16); a.rect(cx - mh, my - mh, cx + mh, my + mh);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) a.box(cx + sx * 1300 - 40, YF + 600 + (sy > 0 ? 3000 : 0) - 40, Z0, cx + sx * 1300 + 40, YF + 600 + (sy > 0 ? 3000 : 0) + 40, 1200);
    rail(a, X0 + 100, YF + 100, X0 + 100, YB - 100, Z0, Z0 + 1200, 5, 20); rail(a, X1 - 100, YF + 100, X1 - 100, YB - 100, Z0, Z0 + 1200, 5, 20); rail(a, X0 + 100, YB - 100, X1 - 100, YB - 100, Z0, Z0 + 1200, 6, 20); rail(a, X0 + 100, YF + 100, X1 - 100, YF + 100, Z0, Z0 + 1200, 6, 20);
    const cw = W - 600, c0 = YB - 2850, cz = Z0 + 300;
    a.box(cx - cw / 2, c0, cz, cx + cw / 2, YB - 560, cz + 120); a.frame(cx - cw / 2, cz + 120, cx + cw / 2, cz + 2000, c0, c0 + 40, 60); a.frame(cx - cw / 2, cz + 120, cx + cw / 2, cz + 2000, YB - 600, YB - 560, 60);
    for (const sx of [-1, 1]) a.frame(cx + sx * cw / 2 - 20, cz + 120, cx + sx * cw / 2 + 20, cz + 2000, c0, YB - 560, 60);
    for (let x = cx - cw / 2 + 200; x < cx + cw / 2 - 100; x += 200) a.box(x, c0, cz + 120, x + 18, c0 + 40, cz + 2000);
    a.box(cx - cw / 2 - 40, c0 - 40, cz + 2000, cx + cw / 2 + 40, YB - 520, cz + 2090);
    a.box(cx - 300, my - mh - 400, cz + 900, cx + 300, my - mh, cz + 1500); a.box(cx - 120, my - mh, cz + 300, cx + 120, my, cz + 1800);
    a.box(cx - 300, my + mh, Z0 + 300, cx + 300, my + mh + 150, Z1 - 1500);
    a.box(cx - cw / 2, YF + 200, Z0, cx + cw / 2, c0 - 150, Z0 + 150); a.line(cx - cw / 2, YF + 200, cx + cw / 2, c0 - 150, 'EQUIP-DETAIL');
    a.rect(cx - cw / 2, c0, cx + cw / 2, YB - 560, 'EQUIP-DETAIL');
    a.log('Added the lattice mast, cage with mesh sides, roof and gates, drive unit, counterweight, base fence with a gate and the landing ramp (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic rough-terrain telehandler',
  desc: (v) => `Rough-terrain telescopic handler, ${v.lb} lb rated and ${v.ft} ft lift height: four-wheel chassis, offset cab, a two-section boom lying along the frame with its lift ram, fork carriage with tilt ram and forks.`,
  vs: [[5500, 30, 18], [8800, 42, 19.5], [10000, 55, 21], [12000, 56, 22]].map(([lb, ft, len]) => [`${lb} lb, ${ft} ft lift`, 90, len * 12, 105 + ft / 6, 0, { lb, ft }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 420; a.box(X0 + 200, YF + 1100, gz, X1 - 200, YB - 100, gz + 800); wheelPairs(a, [YF + 1700, YB - 1100], 540, 400, 10);
    a.box(X0 + 120, YB - 1700, gz + 600, X1 - 120, YB - 100, gz + 1200); a.rect(X0 + 120, YB - 1700, X1 - 120, YB - 100, 'EQUIP-DETAIL');
    cabBlock(a, X0 + 100, YB - 3600, X0 + 1000, YB - 1900, gz + 800, gz + 2300);
    const bx = cx + 280, p0 = [bx, YB - 900, gz + 1500], p1 = [bx, YF + 1100, gz + 1250];
    a.box(bx - 220, p1[1], p1[2] - 250, bx + 220, p0[1], p0[2] + 250); a.box(bx - 180, p1[1] + 800, p1[2] - 210, bx + 180, p1[1], p1[2] + 210); a.rect(bx - 220, p1[1], bx + 220, YB - 700, 'EQUIP-DETAIL');
    ram(a, [bx, YB - 1800, gz + 850], [bx, YB - 3200, gz + 1480], 70);
    a.box(bx - 480, YF + 400, p1[2] - 450, bx + 480, YF + 520, p1[2] + 500); for (const sx of [-1, 1]) a.box(bx + sx * 340 - 50, YF, p1[2] - 450, bx + sx * 340 + 50, YF + 400, p1[2] - 380), a.box(bx + sx * 340 - 50, YF + 400, p1[2] - 450, bx + sx * 340 + 50, YF + 480, p1[2] + 420);
    ram(a, [bx + 200, YF + 700, p1[2] + 160], [bx + 200, YF + 480, p1[2] + 300], 40); tub(a, [bx, p1[1], p1[2]], [bx, YF + 500, p1[2] - 60], 90, 6);
    a.log('Added the chassis with four wheels, engine housing, cab, boom with lift ram, carriage with tilt ram and forks (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic site boom lift',
  desc: (v) => `${v.tele ? 'Telescopic' : 'Articulating'} boom lift, ${v.wh} ft working height, stowed: wheeled chassis with counterweight, turntable, ${v.tele ? 'a telescopic boom in three sections' : 'a lower boom, riser and jib with knuckle joints'}, lift rams and a work platform with guardrails and a gate.`,
  vs: [[34, 0, 21, 72, 100], [45, 0, 24, 80, 104], [60, 0, 27, 88, 108], [80, 1, 32, 94, 116], [120, 1, 36, 100, 126]].map(([wh, tele, len, w, h]) => [`${tele ? 'telescopic' : 'articulating'} ${wh} ft`, w, len * 12, h, 0, { wh, tele }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 340; a.box(X0 + 90, YF + 600, gz, X1 - 90, YB - 100, gz + 900); wheelPairs(a, [YF + 1500, YB - 1100], 480, 360, 0); a.box(X0 + 120, YB - 1400, gz + 900, X1 - 120, YB - 100, gz + 1300);
    a.cyl(cx, YB - 2800, gz + 900, gz + 1200, 800, 16); a.box(cx - 700, YB - 2600, gz + 1200, cx + 700, YB - 100, gz + 1700); a.rect(cx - 700, YB - 2600, cx + 700, YB - 100, 'EQUIP-DETAIL');
    const px = YB - 2000; const pw = 900, pd = 760;
    const zh = Z1 - 100, y0 = YF + 320;
    if (v.tele) { tub(a, [cx, px, gz + 1500], [cx, y0 + 2500, gz + 1900], 300, 6); tub(a, [cx, px - 300, gz + 1550], [cx, y0 + 800, gz + 2000], 240, 6); ram(a, [cx, px + 100, gz + 900], [cx, y0 + 3300, gz + 1900], 90); }
    else { const lz = gz + 1900; tub(a, [cx, px, gz + 1500], [cx, y0 + 2800, lz], 200, 5); tub(a, [cx - 120, px - 100, lz - 100], [cx - 120, px - 100, lz - 100], 1, 3); tub(a, [cx + 300, YB - 2800, gz + 1400], [cx + 300, y0 + 1800, lz + 330], 150, 5); ram(a, [cx - 300, px + 200, gz + 1000], [cx - 300, y0 + 3000, lz - 100], 80); }
    a.box(cx - pw / 2, y0, zh - 1050, cx + pw / 2, y0 + pd, zh - 960); a.frame(cx - pw / 2, zh - 960, cx + pw / 2, zh, y0, y0 + 30, 40); a.frame(cx - pw / 2, zh - 960, cx + pw / 2, zh, y0 + pd - 30, y0 + pd, 40);
    for (const sx of [-1, 1]) a.frame(cx + sx * pw / 2 - (sx > 0 ? 30 : 0), zh - 960, cx + sx * pw / 2 + (sx > 0 ? 0 : 30), zh, y0, y0 + pd, 40);
    tub(a, [cx, y0 + 2500, gz + 1600], [cx, y0 + 800, zh - 1000], 70, 5); a.rect(cx - pw / 2, y0, cx + pw / 2, y0 + pd, 'EQUIP-DETAIL');
    a.log('Added the chassis with four wheels, counterweight, turntable, boom with lift rams and the platform with guardrails (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic scissor lift, raised',
  desc: (v) => `${v.rt ? 'Rough-terrain' : 'Slab'} scissor lift with the platform raised to ${v.ph} ft: crossed scissor arms in ${v.n} stages on both sides, a base with wheels, a platform with guardrails, a sliding deck extension and a control box.`,
  vs: [[19, 0, 4, 32, 75], [26, 0, 5, 46, 84], [32, 0, 6, 46, 88], [40, 1, 7, 68, 118], [50, 1, 8, 68, 130]].map(([ph, rt, n, w, d]) => [`${rt ? 'rough-terrain' : 'slab'} ${ph} ft platform`, w, d, ph * 12 + 44, 0, { ph, rt, n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const wr = v.rt ? 420 : 220; a.box(X0 + 30, YF + 60, Z0 + wr * 0.7, X1 - 30, YB - 60, Z0 + wr * 0.7 + 380); wheelPairs(a, [YF + D * 0.2, YB - D * 0.2], wr, v.rt ? 340 : 180, 0);
    const zb = Z0 + wr * 0.7 + 380, zp = Z1 - 1050 - 40, dz = (zp - zb) / v.n, y0 = YF + D * 0.18, y1 = YB - D * 0.18;
    for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 110); for (let i = 0; i < v.n; i++) { const za = zb + i * dz, zc = za + dz; tub(a, [x, y0, za], [x, y1, zc], 36, 4); tub(a, [x, y1, za], [x, y0, zc], 36, 4); a.cyl(x, (y0 + y1) / 2, za + dz / 2 - 30, za + dz / 2 + 30, 26, 6); } }
    a.box(X0 + 20, YF + 60, zp, X1 - 20, YB - 60, zp + 90); a.box(X0 + 20, YF + 60, zp + 90, X1 - 20, YF + 80, zp + 160);
    rail(a, X0 + 30, YF + 60, X0 + 30, YB - 60, zp + 90, zp + 1050, 4, 16); rail(a, X1 - 30, YF + 60, X1 - 30, YB - 60, zp + 90, zp + 1050, 4, 16); rail(a, X0 + 30, YB - 60, X1 - 30, YB - 60, zp + 90, zp + 1050, 3, 16); rail(a, X0 + 30, YF + 60, X1 - 30, YF + 60, zp + 90, zp + 1050, 3, 16);
    a.box(cx - 150, YF + 90, zp + 700, cx + 150, YF + 200, zp + 1000); a.rect(X0 + 20, YF + 60, X1 - 20, YB - 60, 'EQUIP-DETAIL');
    a.log('Added the base with wheels, the crossed scissor arms in stages, the platform with guardrails and the control box (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic rough-terrain site forklift',
  desc: (v) => `Rough-terrain forklift, ${v.lb} lb capacity, with large knobby tyres, a counterweight rear, an overhead guard with seat and steering wheel, a two-stage mast with lift rams, a carriage and two tapered forks.`,
  vs: [[5000, 7, 15], [8000, 9, 17], [12000, 10.5, 19]].map(([lb, w, len]) => [`${lb} lb`, w * 12, len * 12, 100 + lb / 400, 0, { lb }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 380; a.box(X0 + 200, YF + 1000, gz, X1 - 200, YB - 100, gz + 700); wheelPairs(a, [YF + 1500, YB - 1050], 520, 330, 0);
    a.box(X0 + 120, YB - 1400, gz + 700, X1 - 120, YB - 100, gz + 1300); a.rect(X0 + 120, YB - 1400, X1 - 120, YB - 100, 'EQUIP-DETAIL');
    a.box(cx - 300, YB - 2300, gz + 700, cx + 300, YB - 1500, gz + 950); a.box(cx - 280, YB - 1900, gz + 950, cx + 280, YB - 1500, gz + 1500);
    for (const sx of [-1, 1]) for (const y of [YB - 2500, YB - 1350]) a.box(cx + sx * (W / 2 - 300) - 25, y - 25, gz + 700, cx + sx * (W / 2 - 300) + 25, y + 25, gz + 2100);
    a.box(X0 + 250, YB - 2650, gz + 2100, X1 - 250, YB - 1250, gz + 2170); for (let x = X0 + 350; x < X1 - 300; x += 140) a.line(x, YB - 2650, x, YB - 1250, 'EQUIP-DETAIL');
    const my = YF + 900; for (const sx of [-1, 1]) { a.box(cx + sx * 480 - 60, my - 120, gz + 200, cx + sx * 480 + 60, my + 120, Z1 - 400); a.box(cx + sx * 380 - 50, my - 90, gz + 300, cx + sx * 380 + 50, my + 90, Z1 - 1100); }
    for (const z of [gz + 600, Z1 - 600]) a.box(cx - 540, my - 100, z, cx + 540, my + 100, z + 80);
    ram(a, [cx, my + 400, gz + 250], [cx, my + 150, Z1 - 1500], 60);
    a.box(cx - 600, YF + 150, gz + 220, cx + 600, YF + 250, gz + 1050); for (const sx of [-1, 1]) a.box(cx + sx * 380 - 60, YF, gz + 210, cx + sx * 380 + 60, YF + 150, gz + 260), a.box(cx + sx * 380 - 60, YF + 20, gz + 210, cx + sx * 380 + 60, YF + 1200, gz + 260);
    a.rect(cx - 600, YF, cx + 600, YF + 250, 'EQUIP-DETAIL');
    a.log('Added the chassis with large tyres, counterweight, overhead guard, seat, mast with lift ram, carriage and forks (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic site skid steer loader',
  desc: (v) => `Skid steer loader, ${v.lb} lb rated, on ${v.trk ? 'rubber tracks' : 'four wheels'}: compact chassis, ROPS cab frame, two lift arms with lift rams, tilt ram and a general-purpose bucket with a cutting edge.`,
  vs: [[1500, 0, 60, 108], [2200, 0, 66, 118], [2200, 1, 68, 120], [3000, 1, 72, 128]].map(([lb, trk, w, d]) => [`${lb} lb, ${trk ? 'tracked' : 'wheeled'}`, w, d, 80, 0, { lb, trk }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + 300; a.box(X0 + 140, YF + 700, gz, X1 - 140, YB - 80, gz + 600);
    if (v.trk) for (const sx of [-1, 1]) trackRun(a, cx + sx * (W / 2 - 160), YF + 1000, YB - 60, 300, 620); else wheelPairs(a, [YF + 1300, YB - 650], 330, 280, 8);
    a.box(X0 + 140, YB - 1300, gz + 600, X1 - 140, YB - 80, gz + 1100); a.rect(X0 + 140, YB - 1300, X1 - 140, YB - 80, 'EQUIP-DETAIL');
    for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 330) - 40, YB - 1800, gz + 600, cx + sx * (W / 2 - 330) + 40, YB - 1350, Z1 - 100); a.box(cx + sx * (W / 2 - 330) - 40, YB - 2250, gz + 600, cx + sx * (W / 2 - 330) + 40, YB - 2200 + 40, Z1 - 100); a.box(cx + sx * (W / 2 - 330) - 40, YB - 2250, Z1 - 100, cx + sx * (W / 2 - 330) + 40, YB - 1350, Z1); }
    a.box(cx - 380, YB - 2100, gz + 900, cx + 380, YB - 1500, gz + 1000);
    for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 80); tub(a, [x, YB - 1100, gz + 1050], [x, YF + 1500, gz + 650], 55, 5); ram(a, [x, YB - 700, gz + 700], [x, YB - 1250, gz + 1000], 40); }
    const bw = W - 40; a.box(X0 + 20, YF, gz + 100, X1 - 20, YF + 100, gz + 520); a.prism([[X0 + 20, YF + 100], [X1 - 20, YF + 100], [X1 - 20, YF + 1000], [X0 + 20, YF + 1000]], gz + 100, gz + 160); a.box(X0 + 20, YF + 900, gz + 160, X1 - 20, YF + 1000, gz + 620); a.box(X0 + 40, YF + 20, gz + 60, X1 - 40, YF + 120, gz + 120);
    ram(a, [cx, YF + 1300, gz + 900], [cx, YF + 900, gz + 480], 40); a.rect(X0 + 20, YF, X1 - 20, YF + 1000, 'EQUIP-DETAIL');
    a.log('Added the chassis with wheels or tracks, ROPS cab frame, lift arms with rams, tilt ram and bucket with cutting edge (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic site dumper',
  desc: (v) => `Site dumper, ${v.t} ton payload, ${v.trk ? 'on rubber tracks' : 'wheeled and articulated'}: a front-tipping skip with a lip, a rear operator's seat with a protective frame, a chassis, a skip ram and ${v.trk ? 'two tracks' : 'four wheels'}.`,
  vs: [[1.5, 0, 52, 96], [3, 0, 60, 118], [6, 0, 74, 150], [9, 0, 90, 192], [3, 1, 52, 126]].map(([t, trk, w, d]) => [`${t} ton, ${trk ? 'tracked' : 'wheeled'}`, w, d, w * 0.9 + 18, 0, { t, trk }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gz = Z0 + (v.trk ? 260 : 400), wr = v.t > 4 ? 560 : 400;
    a.box(X0 + 120, YF + 200, gz, X1 - 120, YB - 100, gz + 300);
    if (v.trk) for (const sx of [-1, 1]) trackRun(a, cx + sx * (W / 2 - 150), YF + 300, YB - 200, 260, 520); else wheelPairs(a, [YF + D * 0.2, YB - D * 0.2], wr, v.t > 4 ? 420 : 260, 0);
    const sk0 = YF + 300, sk1 = YB - D * 0.4; a.prism([[X0 + 60, sk0], [X1 - 60, sk0], [X1 - 30, sk1], [X0 + 30, sk1]], gz + 300, gz + 400);
    a.box(X0 + 40, sk0, gz + 400, X0 + 90, sk1, Z1 - 650); a.box(X1 - 90, sk0, gz + 400, X1 - 40, sk1, Z1 - 650); a.box(X0 + 40, sk1 - 50, gz + 400, X1 - 40, sk1, Z1 - 650); a.box(X0 + 30, sk0 - 70, gz + 380, X1 - 30, sk0 + 40, Z1 - 600);
    a.rect(X0 + 40, sk0, X1 - 40, sk1, 'EQUIP-DETAIL');
    ram(a, [cx, sk1 + 100, gz + 300], [cx, sk1 - 800, gz + 1000], 50);
    a.box(cx - 350, sk1 + 100, gz + 300, cx + 350, YB - 100, gz + 1000); a.box(cx - 330, YB - 700, gz + 1000, cx + 330, YB - 450, gz + 1250);
    for (const sx of [-1, 1]) a.box(cx + sx * 380 - 20, YB - 800, gz + 1000, cx + sx * 380 + 20, YB - 700, Z1 - 20); a.box(cx - 400, YB - 800, Z1 - 60, cx + 400, YB - 600, Z1);
    a.log('Added the chassis with wheels or tracks, the tipping skip with a lip, the skip ram, operator seat and protective frame (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic ride-on tandem roller, site',
  desc: (v) => `Ride-on tandem vibratory roller, ${v.t} ton class: two steel drums ${v.dw} in wide with scrapers, an articulated frame, an operator platform with a protective frame and seat, a spray bar and a water tank.`,
  vs: [[2, 35], [4, 48], [8, 66], [12, 84]].map(([t, dw]) => [`${t} ton, ${dw} in drums`, dw + 8, 72 + t * 8, 80 + t * 1.5, 0, { t, dw }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const dr = 300 + v.t * 40, dwm = v.dw * IN; for (const y of [YF + dr + 100, YB - dr - 100]) { a.xcyl(cx - dwm / 2, cx + dwm / 2, y, Z0 + dr, dr, 22); a.rect(cx - dwm / 2, y - dr, cx + dwm / 2, y + dr, 'EQUIP-DETAIL'); a.box(cx - dwm / 2, y - dr - 60, Z0 + 60, cx + dwm / 2, y - dr - 20, Z0 + 140); a.box(cx - dwm / 2, y + dr + 20, Z0 + 60, cx + dwm / 2, y + dr + 60, Z0 + 140); }
    for (const sx of [-1, 1]) for (const y of [YF + dr + 100, YB - dr - 100]) a.box(cx + sx * (dwm / 2 + 20) - 30, y - 80, Z0 + dr * 0.8, cx + sx * (dwm / 2 + 20) + 30, y + 80, Z0 + dr * 2.6);
    const zt = Z0 + dr * 1.9; a.box(cx - dwm / 2 + 60, YF + dr * 2 + 150, zt, cx + dwm / 2 - 60, YB - dr * 2 - 150, zt + 160 + v.t * 20);
    a.box(cx - dwm / 2 + 40, YF + dr * 2, zt - 400, cx + dwm / 2 - 40, YF + dr * 2 + 400, zt); a.box(cx - dwm / 2 + 80, YB - dr * 2 - 600, zt + 160, cx + dwm / 2 - 80, YB - dr * 2 - 100, zt + 700 + v.t * 20);
    a.box(cx - 260, YF + dr * 2 + 350, zt + 160, cx + 260, YF + dr * 2 + 800, zt + 640);
    for (const sx of [-1, 1]) for (const y of [YF + dr * 2 + 300, YF + dr * 2 + 1000]) a.box(cx + sx * (dwm / 2 - 120) - 25, y - 25, zt + 160, cx + sx * (dwm / 2 - 120) + 25, y + 25, Z1 - 30);
    a.box(cx - dwm / 2 + 20, YF + dr * 2 + 250, Z1 - 60, cx + dwm / 2 - 20, YF + dr * 2 + 1100, Z1);
    tub(a, [cx - dwm / 2 + 60, YF + 40, Z0 + dr * 2 + 50], [cx + dwm / 2 - 60, YF + 40, Z0 + dr * 2 + 50], 20, 5); a.line(X0 + 20, YF + 40, X1 - 20, YF + 40, 'EQUIP-DETAIL');
    a.log('Added the two steel drums with scrapers, the articulated frame, platform with protective frame and seat, water tank and spray bar (plan and 3D).');
  } }),

fam({ cat: 'construction/equipment', title: 'Generic mast climbing work platform',
  desc: (v) => `Mast climbing work platform, ${v.pw} ft platform on ${v.mh} ft of ${v.twin ? 'twin masts' : 'a single mast'}: base frame with outrigger pads, lattice mast sections with rack, a platform with guardrails and toe boards, a drive unit and wall ties.`,
  vs: [[13, 1, 60], [20, 1, 100], [26, 0, 130], [33, 0, 160]].map(([pw, twin, mh]) => [`${pw} ft platform, ${twin ? 'single' : 'twin'} mast, ${mh} ft`, pw * 12 + 40, 96, (mh + 5) * 12, 0, { pw, twin, mh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const mxs = v.twin ? [cx] : [cx - W * 0.28, cx + W * 0.28], my = YB - 260;
    a.box(X0 + 100, YF + 600, Z0 + 100, X1 - 100, YB - 100, Z0 + 260); for (const x of [X0 + 300, X1 - 300]) for (const y of [YF + 900, YB - 400]) a.box(x - 250, y - 250, Z0, x + 250, y + 250, Z0 + 80), a.box(x - 40, y - 40, Z0 + 80, x + 40, y + 40, Z0 + 260);
    for (const x of mxs) { lat(a, [x, my, Z0 + 260], [x, my, Z1 - 100], [1, 0, 0], 280, 280, m.round((Z1 - Z0) / 1300), 14); a.rect(x - 280, my - 280, x + 280, my + 280); a.box(x - 120, my - 320, Z0 + 260, x + 120, my - 280, Z1 - 200); }
    const pz = Z0 + (Z1 - Z0) * 0.45, y0 = YF + 300, y1 = my - 300; a.box(X0 + 20, y0, pz, X1 - 20, y1, pz + 90);
    a.frame(X0 + 20, pz + 90, X1 - 20, pz + 1100, y0, y0 + 30, 40); for (const sx of [-1, 1]) a.frame(cx + sx * (W / 2 - 20) - (sx > 0 ? 30 : 0), pz + 90, cx + sx * (W / 2 - 20) + (sx > 0 ? 0 : 30), pz + 1100, y0, y1, 40);
    for (const x of mxs) { a.box(x - 450, my - 700, pz + 90, x + 450, my - 280, pz + 900); }
    a.box(X0 + 20, y0, pz + 90, X1 - 20, y0 + 20, pz + 250);
    for (const z of [Z0 + (Z1 - Z0) * 0.3, Z0 + (Z1 - Z0) * 0.7, Z0 + (Z1 - Z0) * 0.9]) for (const x of mxs) tub(a, [x, my, z], [x, YB - 20, z], 30, 5);
    a.rect(X0 + 20, y0, X1 - 20, y1, 'EQUIP-DETAIL');
    a.log('Added the base frame with pads, the lattice mast sections with rack, the platform with guardrails and toe board, drive units and wall ties (plan and 3D).');
  } }),

// ======================================================================================= construction/temporary
fam({ cat: 'construction/temporary', title: 'Generic site hoarding run, plywood',
  desc: (v) => `Site hoarding run, ${v.len} ft long and ${v.hh} ft high: plywood panels in a timber frame on posts every 8 ft, a top cap rail, a painted kick band, raking props to the rear on every post and a ground shoe.`,
  vs: [[8, 8], [16, 8], [24, 8], [32, 8], [16, 10]].map(([len, hh]) => [`${len} ft long, ${hh} ft high`, len * 12, hh * 6 + 12, hh * 12, 0, { len, hh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const y0 = YF + 150, y1 = y0 + 90, n = m.round(v.len / 8); const bay = (W - 120) / n;
    a.box(X0 + 20, y0, Z0, X1 - 20, y1 + 40, Z0 + 160);
    for (let i = 0; i <= n; i++) { const x = X0 + 60 + i * bay; a.box(x - 45, y0 - 40, Z0, x + 45, y1 + 90, Z1 - 60); a.rect(x - 45, y0 - 40, x + 45, y1 + 90, 'EQUIP-DETAIL'); tub(a, [x, y1 + 90, Z1 * 0 + Z0 + (Z1 - Z0) * 0.7], [x, YB - 80, Z0 + 60], 36, 5); a.box(x - 120, YB - 280, Z0, x + 120, YB - 40, Z0 + 60); a.line(x, y1 + 90, x, YB - 80, 'EQUIP-DETAIL'); }
    for (let i = 0; i < n; i++) { const x0 = X0 + 60 + i * bay + 45, x1 = X0 + 60 + (i + 1) * bay - 45; a.box(x0, y0, Z0 + 160, x1, y1, Z1 - 160); a.box(x0, y0 - 14, Z0 + 160, x1, y0, Z0 + 700); a.box(x0, y1, Z0 + 600, x1, y1 + 40, Z0 + 700); a.box(x0, y1, (Z0 + Z1) / 2 - 30, x1, y1 + 40, (Z0 + Z1) / 2 + 30); a.line(x0, y0, x0, y1, 'EQUIP-DETAIL'); }
    a.box(X0 + 20, y0 - 20, Z1 - 160, X1 - 20, y1 + 60, Z1);
    a.log('Added the plywood panels in timber frames, posts, top cap, kick band, raking props and ground shoes (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic temporary mesh fence run',
  desc: (v) => `Temporary mesh fence, ${v.n} panels each 11.5 ft wide and 6.5 ft high: welded-wire panels in tube frames, concrete feet with post sockets and a clamp at every joint, with bracing stays on the feet.`,
  vs: [1, 2, 3, 4].map((n) => [`${n} panel${n > 1 ? 's' : ''}`, n * 138 + 6, 28, 80, 0, { n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const pw = 138 * IN, y = a.cy; 
    for (let i = 0; i < v.n; i++) { const x0 = X0 + 60 + i * pw + 20, x1 = x0 + pw - 40, zb = Z0 + 300, zt = Z1 - 100;
      a.frame(x0, zb, x1, zt, y - 15, y + 15, 28); for (let x = x0 + 150; x < x1 - 80; x += 150) a.box(x, y - 6, zb + 28, x + 6, y + 6, zt - 28); for (let z = zb + 230; z < zt - 100; z += 230) a.box(x0 + 28, y - 6, z, x1 - 28, y + 6, z + 6);
      a.line(x0, y, x1, y, 'EQUIP-DETAIL'); }
    for (let i = 0; i <= v.n; i++) { const x = X0 + 60 + i * pw; a.box(x - 140, y - 250, Z0, x + 140, y + 250, Z0 + 120); a.cyl(x, y, Z0 + 120, Z1 - 60, 22, 8); a.rect(x - 140, y - 250, x + 140, y + 250, 'EQUIP-DETAIL'); a.box(x - 30, y - 45, Z0 + 1100, x + 30, y + 45, Z0 + 1160); }
    a.log('Added the welded-wire panels in tube frames, the concrete feet, posts and clamps (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site pedestrian barrier',
  desc: (v) => `Steel pedestrian barrier, ${v.len} ft long and 42 in high: a tube frame with vertical infill bars, two tubular feet that turn out to each side and a top rail with hand grips.`,
  vs: [[6.5], [8.2], [10]].map(([len]) => [`${len} ft`, m.round(len * 12), 24, 42, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const y = a.cy; a.frame(X0 + 40, Z0 + 150, X1 - 40, Z1 - 20, y - 12, y + 12, 24);
    for (let x = X0 + 110; x < X1 - 80; x += 80) a.box(x, y - 8, Z0 + 170, x + 14, y + 8, Z1 - 40);
    a.box(X0 + 40, y - 12, Z0 + 600, X1 - 40, y + 12, Z0 + 640);
    for (const x of [X0 + 120, X1 - 120]) { tub(a, [x, y - 280, Z0 + 30], [x, y + 280, Z0 + 30], 24, 6); tub(a, [x, y, Z0 + 150], [x, y, Z0 + 30], 24, 6); a.rect(x - 25, y - 290, x + 25, y + 290, 'EQUIP-DETAIL'); }
    a.line(X0 + 40, y, X1 - 40, y, 'EQUIP-DETAIL');
    a.log('Added the tube frame with infill bars, the top rail and the two turned feet (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic water-filled barrier',
  desc: (v) => `Hollow plastic barrier module, ${v.len} ft long and ${v.hh} in high, tapered to a wide base: a fill cap on top, a drain plug at the foot, forklift pockets low down and a hand-hold, shown as one unit with a tongue-and-groove end.`,
  vs: [[6, 32], [8, 36], [10, 42]].map(([len, hh]) => [`${len} ft long, ${hh} in high`, len * 12, 24, hh, 0, { len, hh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    prismX(a, [[YF + 40, Z0], [YB - 40, Z0], [YB - 160, Z0 + (Z1 - Z0) * 0.55], [YB - 190, Z1], [YF + 190, Z1], [YF + 160, Z0 + (Z1 - Z0) * 0.55]], X0 + 20, X1 - 20);
    a.cyl(cx, a.cy, Z1, Z1 + 0.01, 1, 4); a.cyl(cx - W * 0.25, a.cy, Z1 - 10, Z1, 70, 12); a.cyl(cx + W * 0.25, a.cy, Z1 - 10, Z1, 70, 12);
    for (const x of [X0 + W * 0.22, X1 - W * 0.22]) { a.box(x - 180, YF + 20, Z0 + 40, x + 180, YF + 60, Z0 + 140); a.box(x - 180, YB - 60, Z0 + 40, x + 180, YB - 20, Z0 + 140); }
    a.box(cx - 300, YF + 20, Z1 - 140, cx + 300, YF + 190, Z1 - 80); a.box(X1 - 20, a.cy - 200, Z0 + 100, X1, a.cy + 200, Z1 - 100);
    a.circ(cx - W * 0.25, a.cy, 70, 'EQUIP-DETAIL'); a.circ(cx + W * 0.25, a.cy, 70, 'EQUIP-DETAIL'); a.rect(X0 + 20, YF + 160, X1 - 20, YB - 160, 'EQUIP-DETAIL');
    a.log('Added the tapered body, two fill caps, forklift pockets, hand-hold and tongue-and-groove end (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic precast concrete safety barrier',
  desc: (v) => `Precast concrete barrier module, ${v.len} ft long and ${v.hh} in high: the sloped two-step safety profile, lifting loops on top and a pin-and-loop joint at each end.`,
  vs: [[6, 32], [10, 32], [12, 42], [20, 32]].map(([len, hh]) => [`${len} ft long, ${hh} in high`, len * 12, 24, hh, 0, { len, hh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const h = Z1 - Z0; prismX(a, [[YF + 20, Z0], [YB - 20, Z0], [YB - 20, Z0 + 80], [YB - 140, Z0 + h * 0.4], [YB - 190, Z1], [YF + 190, Z1], [YF + 140, Z0 + h * 0.4], [YF + 20, Z0 + 80]], X0 + 30, X1 - 30);
    for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { tub(a, [x, a.cy - 60, Z1], [x, a.cy - 60, Z1 + 0.5], 1, 3); a.box(x - 60, a.cy - 20, Z1 - 20, x + 60, a.cy + 20, Z1); }
    for (const x of [X0 + 12, X1 - 12]) a.cyl(x, a.cy, Z0 + h * 0.5, Z0 + h * 0.5 + 120, 14, 6);
    a.line(X0 + 30, YF + 20, X0 + 30, YB - 20, 'EQUIP-DETAIL'); a.line(X1 - 30, YF + 20, X1 - 30, YB - 20, 'EQUIP-DETAIL'); a.rect(X0 + 30, YF + 190, X1 - 30, YB - 190, 'EQUIP-DETAIL');
    a.log('Added the two-step safety profile, lifting loops and the end joint pins (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site access gate',
  desc: (v) => `${v.slide ? 'Sliding' : 'Double-leaf swing'} site gate, ${v.len} ft opening and ${v.hh} ft high: tube leaf frames with welded mesh infill and diagonal brace, ${v.slide ? 'a bottom track, roller carriages and a guide post' : 'two end posts, a centre drop bolt and hinge pins, with the leaf swings shown in plan'}, and a padlock hasp.`,
  vs: [[12, 0, 8], [16, 0, 8], [20, 0, 8], [20, 1, 8], [26, 1, 8]].map(([len, slide, hh]) => [`${slide ? 'sliding' : 'swing'}, ${len} ft opening`, len * 12 + 12, slide ? 34 : len * 6 + 6, hh * 12, 0, { len, slide, hh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const gy = v.slide ? YB - 200 : YB - 100; const post = (x) => { a.cyl(x, gy, Z0, Z1, 60, 10); a.circ(x, gy, 60); };
    post(X0 + 60); post(X1 - 60); if (v.slide) post(X0 + W * 0.5); 
    const leaf = (xa, xb, ym) => { a.frame(xa, Z0 + 150, xb, Z1 - 80, ym - 20, ym + 20, 40); for (let x = xa + 120; x < xb - 60; x += 130) a.box(x, ym - 6, Z0 + 190, x + 6, ym + 6, Z1 - 120); for (let z = Z0 + 400; z < Z1 - 200; z += 300) a.box(xa + 40, ym - 6, z, xb - 40, ym + 6, z + 6); tub(a, [xa + 40, ym, Z0 + 190], [xb - 40, ym, Z1 - 120], 16, 4); };
    if (v.slide) { leaf(X0 + 150, X1 - W * 0.28, gy); a.box(X0 + 100, gy - 30, Z0, X1 - 100, gy + 30, Z0 + 40); for (const x of [X0 + 400, X1 - W * 0.28 - 300]) a.cyl(x, gy, Z0 + 40, Z0 + 120, 40, 8); a.line(X0 + 150, gy, X1 - 150, gy, 'EQUIP-DETAIL'); a.rect(X0 + 100, gy - 30, X1 - 100, gy + 30, 'EQUIP-DETAIL'); }
    else { const mid = cx; leaf(X0 + 120, mid - 20, gy); leaf(mid + 20, X1 - 120, gy); a.arc(X0 + 120, gy, (W - 280) / 2, 270, 360); a.arc(X1 - 120, gy, (W - 280) / 2, 180, 270); a.cyl(mid, gy, Z0, Z0 + 200, 20, 6); a.line(X0 + 120, gy, mid - 20, gy, 'EQUIP-DETAIL'); a.line(mid + 20, gy, X1 - 120, gy, 'EQUIP-DETAIL'); }
    a.box(X1 - 220, gy - 70, Z0 + 1000, X1 - 120, gy + 70, Z0 + 1100);
    a.log('Added the end posts, mesh-infilled leaf frames with braces, the swing arcs or the track with roller carriages, and the hasp (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic portable site office unit',
  desc: (v) => `portable site office unit, ${v.len} ft by ${v.wd} ft: a steel skid base with fork pockets, panelled walls, ${v.nw} windows with frames, an entry door with swing, a stepped landing with handrails, a roof with eaves and a roof-mounted air conditioner.`,
  vs: [[10, 8, 2], [16, 8, 3], [20, 9.5, 4], [24, 9.5, 5], [32, 10, 7]].map(([len, wd, nw]) => [`${len} ft by ${wd} ft`, len * 12, wd * 12 + 30, 126, 0, { len, wd, nw }]),
  build: (a, v) => cabin(a, v, { windows: v.nw, doors: 1, ac: true }) }),

fam({ cat: 'construction/temporary', title: 'Generic site canteen and drying unit',
  desc: (v) => `Site welfare unit, ${v.len} ft by 10 ft, for a canteen and drying room: skid base, panelled walls, ${v.nw} windows, ${v.nd} entry doors with swings, a stepped landing with handrails, a vented roof and a roof air conditioner.`,
  vs: [[20, 4, 2], [24, 5, 2], [32, 7, 2]].map(([len, nw, nd]) => [`${len} ft`, len * 12, 150, 126, 0, { len, nw, nd }]),
  build: (a, v) => cabin(a, v, { windows: v.nw, doors: v.nd, ac: true, log: 'Added the skid base, panelled walls, windows, two doors with swings, entry step with rails and the roof with air conditioner (plan and 3D).' }) }),

fam({ cat: 'construction/temporary', title: 'Generic shipping container site store',
  desc: (v) => `Steel shipping container used as a lockable site store, ${v.len} ft long${v.hc ? ' and high-cube' : ''}: corrugated side walls and roof, corner castings, a pair of end doors with locking bars, hinges and a padlock hasp, and a floor frame with fork pockets.`,
  vs: [[10, 0], [20, 0], [40, 0], [40, 1]].map(([len, hc]) => [`${len} ft${hc ? ', high-cube' : ''}`, 96, len * 12, hc ? 106 : 102, 0, { len, hc }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0, YF, Z0 + 140, X1, YB, Z1); a.box(X0 + 20, YF, Z0, X0 + 220, YB, Z0 + 140); a.box(X1 - 220, YF, Z0, X1 - 20, YB, Z0 + 140); for (const y of [YF + 400, YB - 400]) a.box(X0 + 20, y - 60, Z0 + 20, X1 - 20, y + 60, Z0 + 140);
    for (let y = YF + 160; y < YB - 100; y += 106) { a.box(X0 - 10, y, Z0 + 200, X0, y + 38, Z1 - 60); a.box(X1, y, Z0 + 200, X1 + 10, y + 38, Z1 - 60); }
    for (let x = X0 + 150; x < X1 - 100; x += 106) a.box(x, YF + 60, Z1, x + 38, YB - 60, Z1 + 10);
    for (const x of [X0, X1 - 160]) for (const y of [YF, YB - 160]) a.box(x, y, Z1 - 120, x + 160, y + 160, Z1);
    for (const sx of [0, 1]) { const x0 = sx ? cx : X0 + 40; a.box(x0, YF - 20 + 20, Z0 + 180, x0 + (W - 80) / 2, YF + 20, Z1 - 60); for (const k of [0.35, 0.65]) tub(a, [x0 + (W - 80) / 2 * (sx ? 0.9 : 0.1), YF - 10, Z0 + 250], [x0 + (W - 80) / 2 * (sx ? 0.9 : 0.1), YF - 10, Z1 - 120], 12, 5); a.arc(sx ? X1 - 40 : X0 + 40, YF, (W - 80) / 2, sx ? 180 : 270, sx ? 270 : 360); }
    a.box(cx - 80, YF - 40, Z0 + 1000, cx + 80, YF - 10, Z0 + 1100); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
    a.log('Added the corrugated walls and roof, corner castings, floor frame with fork pockets and the end doors with locking bars and hasp (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic construction site toilet unit',
  desc: (v) => `Site toilet unit with ${v.n} cubicle${v.n > 1 ? 's' : ''}: a moulded plastic shell with a pitched roof, a vent stack and a roof tank${v.n > 1 ? ', a row of doors with door swings and a shared lobby' : ' and a hinged door with a latch'}, standing on a floor skid.`,
  vs: [[1, 44, 44], [2, 90, 48], [4, 180, 50]].map(([n, w, d]) => [`${n} cubicle${n > 1 ? 's' : ''}`, w, d, 92, 0, { n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0, YF, Z0, X1, YB, Z0 + 120); a.box(X0 + 20, YF + 20, Z0 + 120, X1 - 20, YB - 20, Z1 - 300); a.prism([[X0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 300, Z1 - 260);
    a.prism([[X0 + 30, YF + 30], [X1 - 30, YF + 30], [X1 - 80, YB - 60], [X0 + 80, YB - 60]], Z1 - 260, Z1 - 120);
    const cw = W / v.n; for (let i = 0; i < v.n; i++) { const x0 = X0 + i * cw; a.box(x0 + cw * 0.15, YF - 14, Z0 + 120, x0 + cw * 0.85, YF + 20, Z1 - 380); a.box(x0 + cw * 0.78, YF - 40, Z0 + 1000, x0 + cw * 0.82, YF - 14, Z0 + 1060); a.rect(x0 + cw * 0.15, YF, x0 + cw * 0.85, YF + 20, 'EQUIP-DETAIL'); a.arc(x0 + cw * 0.15, YF, cw * 0.7 * 0.8, 270, 360); for (let z = Z1 - 780; z < Z1 - 460; z += 50) a.box(x0 + cw * 0.3, YF - 8, z, x0 + cw * 0.7, YF, z + 20); a.cyl(x0 + cw * 0.5, YB - 150, Z1 - 120, Z1 - 20, 40, 8); }
    a.box(cx - W * 0.35, YB - 700, Z1 - 120, cx + W * 0.35, YB - 150, Z1 - 20 + 0.01);
    a.log('Added the floor skid, moulded shell, pitched roof, cubicle doors with swings and latches, vent stacks and the roof tank (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic temporary stair tower',
  desc: (v) => `Temporary site stair tower, ${v.rise} ft rise: a scaffold-style frame with corner legs and bracing, ${v.fl} return flights of steel treads with stringers, intermediate landings, handrails on both sides and a top landing with guardrails.`,
  vs: [8, 12, 16, 24].map((rise) => [`${rise} ft rise`, 90, 126, rise * 12 + 44, 0, { rise, fl: m.max(2, m.round(rise / 4)) }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const zt = Z1 - 44 * IN; const nl = v.fl; const lw = 1000;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const x = cx + sx * (W / 2 - 80), y = a.cy + sy * (D / 2 - 80); a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z1 - 100); }
    for (let k = 0; k <= nl; k += 2) for (const [x, y] of [[X0 + 80, a.cy], [X1 - 80, a.cy]]) tub(a, [x, y - (D / 2 - 80), Z0 + k * (zt - Z0) / nl], [x, y + (D / 2 - 80), Z0 + (k + 1) * (zt - Z0) / nl], 20, 4);
    const rh = (zt - Z0) / nl;
    for (let k = 0; k < nl; k++) { const up = k % 2 === 0, ya = up ? YF + 300 : YB - 300, yb = up ? YB - 300 : YF + 300, n = 8;
      for (let i = 0; i < n; i++) { const f = (i + 0.5) / n, y = ya + (yb - ya) * f, z = Z0 + k * rh + rh * f; a.box(cx - W / 2 + 160, y - (yb - ya) / n / 2, z, cx + W / 2 - 160, y + (yb - ya) / n / 2, z + 30); }
      for (const sx of [-1, 1]) tub(a, [cx + sx * (W / 2 - 150), ya, Z0 + k * rh + 20], [cx + sx * (W / 2 - 150), yb, Z0 + (k + 1) * rh + 20], 25, 4);
      for (const sx of [-1, 1]) tub(a, [cx + sx * (W / 2 - 150), ya, Z0 + k * rh + 900], [cx + sx * (W / 2 - 150), yb, Z0 + (k + 1) * rh + 900], 14, 4);
      a.box(X0 + 120, up ? YB - 300 : YF + 80, Z0 + (k + 1) * rh - 30, X1 - 120, up ? YB - 80 : YF + 300, Z0 + (k + 1) * rh); }
    for (let k = 1; k <= nl; k++) if (k % 2 === 1 || k === nl) a.line(X0 + 160, k % 2 ? YB - 300 : YF + 300, X1 - 160, k % 2 ? YB - 300 : YF + 300, 'EQUIP-DETAIL');
    rail(a, X0 + 120, YF + 80, X1 - 120, YF + 80, zt, zt + 1050, 3, 14);
    a.box(X0 + 120, YF + 80, zt - 40, X1 - 120, YF + 400, zt);
    a.log('Added the corner legs and bracing, return flights with treads, handrails, intermediate landings and the guarded top landing (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic slab edge protection guardrail',
  desc: (v) => `Edge protection guardrail bay, ${v.len} ft long: ${v.mesh ? 'a mesh infill panel in a tube frame' : 'a top rail, a mid rail'} and a toe board, on posts with a clamp base that grips the slab edge.`,
  vs: [[6, 0], [8, 0], [10, 0], [8, 1]].map(([len, mesh]) => [`${len} ft bay${mesh ? ', mesh infill' : ''}`, len * 12 + 4, 14, 50, 0, { len, mesh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const y = a.cy; for (const x of [X0 + 40, X1 - 40]) { a.box(x - 25, y - 20, Z0 + 20, x + 25, y + 20, Z1 - 20); a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z0 + 20); a.box(x - 30, y - 120, Z0, x + 30, y + 40, Z0 + 20); a.rect(x - 60, y - 60, x + 60, y + 60, 'EQUIP-DETAIL'); }
    a.box(X0 + 40, y - 8, Z0 + 20, X1 - 40, y + 8, Z0 + 20 + 150); tub(a, [X0 + 40, y, Z1 - 60], [X1 - 40, y, Z1 - 60], 15, 6);
    if (v.mesh) { a.frame(X0 + 60, Z0 + 170, X1 - 60, Z1 - 80, y - 8, y + 8, 14); for (let x = X0 + 120; x < X1 - 60; x += 100) a.box(x, y - 3, Z0 + 180, x + 4, y + 3, Z1 - 90); } else tub(a, [X0 + 40, y, Z0 + 340], [X1 - 40, y, Z0 + 340], 14, 6);
    a.line(X0 + 40, y, X1 - 40, y, 'EQUIP-DETAIL');
    a.log('Added the clamp-base posts, toe board, rails or mesh panel (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site notice board on posts',
  desc: (v) => `Site notice board, ${v.pw} in wide by ${v.ph} in high panel in a steel frame with a colour band header strip, a hazard-sign area, two round posts set in concrete feet and a bracing strut at the back.`,
  vs: [[48, 48], [96, 48], [96, 96]].map(([pw, ph]) => [`${pw} by ${ph} in panel`, pw + 24, 36, ph + 60, 0, { pw, ph }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const y = a.cy - 30; for (const x of [X0 + 120, X1 - 120]) { a.cyl(x, y, Z0, Z1 - 60, 40, 10); a.box(x - 220, y - 250, Z0, x + 220, y + 250, Z0 + 100); a.rect(x - 220, y - 250, x + 220, y + 250, 'EQUIP-DETAIL'); tub(a, [x, y + 20, Z0 + 150], [x, YB - 60, Z0 + 20], 14, 4); }
    const zb = Z1 - v.ph * IN - 10; a.box(X0 + 60, y - 18, zb, X1 - 60, y + 18, Z1 - 10); a.box(X0 + 60, y - 40, Z1 - 160, X1 - 60, y - 18, Z1 - 10); a.frame(X0 + 40, zb - 20, X1 - 40, Z1, y - 40, y - 18, 30);
    a.box(X0 + 100, y - 36, zb + 120, X0 + 100 + (v.pw * IN) * 0.3, y - 18, zb + 120 + (v.ph * IN) * 0.4); a.line(X0 + 60, y, X1 - 60, y, 'EQUIP-DETAIL');
    a.log('Added the framed panel with header strip and sign area, the two posts with concrete feet and the rear struts (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site tool store chest',
  desc: (v) => `Lockable steel site tool chest, ${v.w} in wide: a hinged lid with a padlock hasp, a front with two hinged doors and a shelf inside, corner guards, fork-and-lift pockets and small wheels at one end.`,
  vs: [[36, 24], [48, 24], [60, 30]].map(([w, d]) => [`${w} in`, w, d, 36, 0, { w }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0, YF, Z0 + 100, X1, YB, Z1 - 70); a.box(X0 - 0.01, YF, Z1 - 70, X1, YB, Z1); a.box(X0 + 30, YF - 0.01, Z0 + 20, X0 + 130, YB, Z0 + 100); a.box(X1 - 130, YF, Z0 + 20, X1, YB, Z0 + 100);
    a.box(cx - 15, YF - 30, Z0 + 300, cx + 15, YF, Z1 - 150); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL'); for (const sx of [-1, 1]) a.box(cx + sx * W * 0.15 - 50, YF - 25, Z0 + 350, cx + sx * W * 0.15 + 50, YF, Z0 + 400);
    a.box(cx - 40, YF - 45, Z1 - 160, cx + 40, YF, Z1 - 70); a.box(X0 + 100, YF - 6, Z0 + 140, cx - 40, YF, Z1 - 120); a.box(cx + 40, YF - 6, Z0 + 140, X1 - 100, YF, Z1 - 120);
    for (const x of [X1 - 100, X0 + 100]) for (const y of [YF + 50, YB - 50]) a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z0 + 20);
    for (const x of [X0 + 8, X1 - 8]) a.box(x - 8, YF + 30, Z1 - 250, x + 8, YB - 30, Z1 - 150);
    a.log('Added the chest body, hinged lid with hasp, front doors, corner guards, fork pockets and base rails (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic temporary power distribution board',
  desc: (v) => `Site power distribution board, ${v.amp} A: a steel cabinet on a tube stand, a hinged front with a latch, ${v.ns} socket outlets in two rows with caps, a main isolator handle, breaker panel behind, an inlet gland plate at the base and carrying handles.`,
  vs: [[63, 6], [125, 8], [250, 10], [400, 12]].map(([amp, ns]) => [`${amp} A`, 14 + amp / 40, 10 + amp / 80, 30 + amp / 40, 0, { amp, ns }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    for (const x of [X0 + 40, X1 - 40]) { tub(a, [x, YB - 100, Z0 + 20], [x, YB - 100, Z0 + 250], 14, 5); tub(a, [x, YB - 30 - 0, Z0 + 20], [x, YF + 40, Z0 + 20], 14, 5); a.rect(x - 14, YF + 40, x + 14, YB - 30, 'EQUIP-DETAIL'); }
    const cz0 = Z0 + 250; a.box(X0 + 20, YF + 60, cz0, X1 - 20, YB - 30, Z1); a.box(X0 + 10, YF + 20, cz0 + 60, X1 - 10, YF + 60, Z1 - 20);
    const nr = 2, per = v.ns / nr; for (let r = 0; r < nr; r++) for (let i = 0; i < per; i++) { const x = X0 + 70 + (i + 0.5) * ((W - 140) / per), z = Z0 + 250 + (r === 0 ? (Z1 - cz0) * 0.2 : (Z1 - cz0) * 0.45); a.cyl(x, YF + 10, z, z + 0.01 + 1, 1, 3); a.box(x - 35, YF, z - 40, x + 35, YF + 20, z + 40); a.cyl(x, YF + 10, z - 50, z + 50, 0.1, 3); }
    a.box(cx - 50, YF - 30, Z1 - 240, cx + 50, YF + 20, Z1 - 140); a.box(X1 - 90, YF - 10, cz0 + 40, X1 - 40, YF + 20, cz0 + 120);
    a.box(X0 + 50, YF + 30, Z1 - 200, X0 + 150, YF + 60, Z1 - 60); a.box(X0 + 20, YB - 40, Z1 - 100, X1 - 20, YB - 30, Z1 - 60);
    a.log('Added the tube stand, steel cabinet with hinged front, two rows of socket outlets, isolator handle and the inlet gland plate (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site water bowser',
  desc: (v) => `Towable site water bowser, ${v.gal} gallon: a horizontal cylindrical tank with end domes, a top hatch and a ladder, a drain valve, a hose reel and outlet, a tubular chassis on two wheels, a jockey leg and a tow eye.`,
  vs: [[500, 54, 126], [1000, 62, 150], [2000, 74, 186], [4000, 90, 240]].map(([gal, w, d]) => [`${gal} gal`, w, d, m.round((720 + (w * 25.4 - 260) * 0.95) / 25.4) + 2, 0, { gal }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const wr = 360; for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 130), YB - D * 0.45, wr, 200);
    a.box(X0 + 200, YF + 400, Z0 + 500, X1 - 200, YB - 80, Z0 + 600); tub(a, [cx, YF + 400, Z0 + 550], [cx, YF + 60, Z0 + 600], 40, 5); a.cyl(cx, YF + 60, Z0 + 540, Z0 + 620, 70, 10);
    const r = (W - 260) / 2 * 0.95; a.ycyl(YF + 420, YB - 100, cx, Z0 + 600 + r, r, 24); a.ell(cx, YF + 420, Z0 + 600 + r, r * 0.12 + 1, r * 0.1, r, 10, 6); a.ell(cx, YB - 100, Z0 + 600 + r, r * 0.12, r * 0.1, r, 10, 6);
    a.cyl(cx, a.cy + 300, Z0 + 600 + 2 * r, Z0 + 600 + 2 * r + 120, 200, 14); a.circ(cx, a.cy + 300, 200, 'EQUIP-DETAIL'); ladder(a, cx, YB - 90, Z0 + 600, Z0 + 600 + 2 * r, 300);
    a.cyl(cx, YB - 40, Z0 + 700, Z0 + 800, 55, 8); a.ycyl(YB - 140, YB - 20, X1 - 300, Z0 + 750, 50, 8);
    a.cyl(X0 + 320, YF + 500, Z0 + 600, Z0 + 900, 20, 6); a.xcyl(X0 + 300, X0 + 380, YF + 500, Z0 + 900, 150, 12); a.rect(X0 + 300, YF + 350, X0 + 380, YF + 650, 'EQUIP-DETAIL'); a.rect(cx - r, YF + 420, cx + r, YB - 100, 'EQUIP-DETAIL');
    a.log('Added the cylindrical tank with domes, hatch and ladder, the chassis with wheels, jockey leg, tow eye, hose reel and drain valve (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site skip bin',
  desc: (v) => `Open-top steel skip, ${v.yd} cubic yard: sloped end walls and straight sides with horizontal ribs, a rim, lifting lugs at each end, chain pockets and a base frame with fork pockets.`,
  vs: [[6, 108, 66, 36], [8, 126, 70, 44], [12, 150, 74, 52], [20, 180, 84, 60]].map(([yd, d, w, h]) => [`${yd} yd`, w, d, h, 0, { yd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0 + 60, YF + 40, Z0, X1 - 60, YB - 40, Z0 + 100); for (const y of [YF + D * 0.25, YB - D * 0.25]) a.box(X0 + 20, y - 60, Z0, X1 - 20, y + 60, Z0 + 140);
    a.box(X0 + 70, YF + 40, Z0 + 100, X0 + 90, YB - 40, Z1); a.box(X1 - 90, YF + 40, Z0 + 100, X1 - 70, YB - 40, Z1);
    a.prism([[X0 + 70, YF + 40], [X1 - 70, YF + 40], [X1 - 70, YF + 60], [X0 + 70, YF + 60]], Z0 + 100, Z0 + 120);
    for (const [y0, y1] of [[YF + 40, YF + 60], [YB - 60, YB - 40]]) a.prism([[X0 + 70, y0 - 0.01 + (y1 === YF + 60 ? 0 : 0)], [X1 - 70, y0], [X1 - 70, y1], [X0 + 70, y1]], Z0 + 100, Z1 - 0.5);
    for (let z = Z0 + 300; z < Z1 - 100; z += 260) { a.box(X0 + 60, YF + 40, z, X0 + 100, YB - 40, z + 40); a.box(X1 - 100, YF + 40, z, X1 - 60, YB - 40, z + 40); }
    a.box(X0 + 50, YF + 30, Z1 - 40, X1 - 50, YB - 30, Z1); for (const y of [YF + 70, YB - 70]) { a.box(X0 + 110, y - 30, Z1 - 60, X1 - 110, y + 30, Z1 - 20); for (const x of [X0 + 120, X1 - 120]) a.box(x - 30, y - 30, Z1 - 140, x + 30, y + 30, Z1 - 60); }
    a.rect(X0 + 70, YF + 40, X1 - 70, YB - 40, 'EQUIP-DETAIL');
    a.log('Added the ribbed side and end walls, rim, lifting lugs, base frame and fork pockets (plan and 3D).');
  } }),

fam({ cat: 'construction/temporary', title: 'Generic site wheel wash trough',
  desc: (v) => `Drive-through wheel wash, ${v.len} ft long: two approach ramps, a bar-grid deck over a settling trough, side kerbs, two rows of spray risers with nozzles and a sump with a pump housing at one end.`,
  vs: [[20, 120], [30, 132], [40, 144]].map(([len, w]) => [`${len} ft long`, w, len * 12, 30, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const rl = 1800; a.prism([[X0 + 100, YF], [X1 - 100, YF], [X1 - 100, YF + rl], [X0 + 100, YF + rl]], Z0, Z0 + 40); a.box(X0 + 100, YF, Z0, X1 - 100, YF + rl, Z0 + 40);
    a.box(X0 + 100, YB - rl, Z0, X1 - 100, YB, Z0 + 40); const gz = Z1 - 60;
    for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 200) - 60, YF + rl, Z0, cx + sx * (W / 2 - 200) + 60, YB - rl, Z1);
    a.box(X0 + 80, YF + rl, Z0, X0 + 140, YB - rl, Z0 + 50); a.box(X1 - 140, YF + rl, Z0, X1 - 80, YB - rl, Z0 + 50);
    for (let y = YF + rl + 40; y < YB - rl - 40; y += 90) a.box(X0 + 260, y, gz, X1 - 260, y + 50, Z1 - 10); a.box(X0 + 260, YF + rl, gz - 80, X1 - 260, YB - rl, gz);
    for (let y = YF + rl + 600; y < YB - rl - 400; y += 1200) for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 280); a.cyl(x, y, Z1, Z1 + 0.1, 1, 3); a.box(x - 25, y - 25, Z0, x + 25, y + 25, Z1 - 10); a.line(x, y, cx + sx * (W / 2 - 340), y, 'EQUIP-DETAIL'); }
    a.box(cx - 400, YB - rl - 600, Z0, cx + 400, YB - rl - 100, Z1 - 20); a.rect(X0 + 260, YF + rl, X1 - 260, YB - rl, 'EQUIP-DETAIL'); a.rect(cx - 400, YB - rl - 600, cx + 400, YB - rl - 100, 'EQUIP-DETAIL');
    a.log('Added the approach ramps, bar-grid deck over the trough, side kerbs, spray risers and the sump with pump housing (plan and 3D).');
  } }),


// ======================================================================================= construction/formwork
fam({ cat: 'construction/formwork', title: 'Generic frame scaffold bay',
  desc: (v) => `Frame scaffold bay, ${v.lifts} lift${v.lifts > 1 ? 's' : ''} high and 7 ft long: two end frames per lift with rungs, cross braces on both faces, a plank deck on every lift, guardrails and toe boards at the top, base jacks with plates and a ladder rung set.`,
  vs: [1, 2, 3, 4, 5, 6].map((lifts) => [`${lifts} lift${lifts > 1 ? 's' : ''}`, 92, 34, lifts * 78 + 40, 0, { lifts }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const lh = 6.5 * 12 * IN * 0.9999, zb = Z0 + 150, ys = [YF + 120, YB - 120];
    for (const y of ys) { for (const x of [X0 + 100, X1 - 100]) { a.box(x - 100, y - 100, Z0, x + 100, y + 100, Z0 + 20); a.cyl(x, y, Z0 + 20, Z0 + 150, 18, 6); } }
    for (let k = 0; k < v.lifts; k++) { const z0 = zb + k * lh;
      for (const x of [X0 + 100, X1 - 100]) { for (const y of ys) tub(a, [x, y, z0], [x, y, z0 + lh], 24, 6); }
      for (const y of ys) { tub(a, [X0 + 100, y, z0 + lh - 80], [X1 - 100, y, z0 + lh - 80], 20, 5); }
      for (const x of [X0 + 100, X1 - 100]) { tub(a, [x, ys[0], z0 + lh - 80], [x, ys[1], z0 + lh - 80], 20, 5); tub(a, [x, ys[0], z0 + 400], [x, ys[1], z0 + 400], 12, 4); }
      for (const y of ys) { tub(a, [X0 + 100, y, z0 + 100], [X1 - 100, y, z0 + lh - 100], 14, 4); tub(a, [X1 - 100, y, z0 + 100], [X0 + 100, y, z0 + lh - 100], 14, 4); }
      const pw = (ys[1] - ys[0] - 100) / 4; for (let i = 0; i < 4; i++) a.box(X0 + 90, ys[0] + 50 + i * pw + 4, z0 + lh - 80, X1 - 90, ys[0] + 50 + (i + 1) * pw - 4, z0 + lh - 55);
    }
    const zt = zb + v.lifts * lh; for (const y of ys) { for (const x of [X0 + 100, X1 - 100]) tub(a, [x, y, zt], [x, y, zt + 1000], 22, 6); tub(a, [X0 + 100, y, zt + 1000], [X1 - 100, y, zt + 1000], 22, 5); tub(a, [X0 + 100, y, zt + 500], [X1 - 100, y, zt + 500], 18, 5); a.box(X0 + 100, y - 8, zt - 20, X1 - 100, y + 8, zt + 150); }
    ladder(a, cx, YB - 30, zb, zt, 360, 280);
    a.rect(X0 + 100 - 20, ys[0] - 20, X1 - 100 + 20, ys[1] + 20, 'EQUIP-DETAIL'); for (const x of [X0 + 100, X1 - 100]) for (const y of ys) a.circ(x, y, 24);
    a.log('Added the base jacks and plates, the end frames with rungs, cross braces, plank decks on each lift, guardrails with toe boards and the ladder (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic system scaffold bay',
  desc: (v) => `Modular rosette-node system scaffold bay, ${v.len} ft long and ${v.lifts} lifts high: standards with a node every 20 in, ledgers and transoms at each lift, a steel deck, a facade diagonal, guardrails with toe boards and base jacks with sole plates.`,
  vs: [[4.9, 5], [6.6, 3], [8.2, 2], [8.2, 4], [10, 3], [10, 6]].map(([len, lifts]) => [`${len} ft bay, ${lifts} lifts`, m.round(len * 12) + 6, 40, lifts * 78 + 44, 0, { len, lifts }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const lh = 2000, ys = [YF + 120, YB - 120], xs = [X0 + 80, X1 - 80], zb = Z0 + 150;
    for (const y of ys) for (const x of xs) { a.box(x - 100, y - 100, Z0, x + 100, y + 100, Z0 + 20); a.cyl(x, y, Z0 + 20, Z0 + 150, 16, 6); tub(a, [x, y, zb], [x, y, zb + v.lifts * lh + 1000], 24, 6); for (let z = zb + 500; z < zb + v.lifts * lh + 400; z += 500) a.cyl(x, y, z, z + 30, 40, 8); }
    for (let k = 0; k <= v.lifts; k++) { const z = zb + k * lh + (k ? -0 : 500); for (const y of ys) tub(a, [xs[0], y, z], [xs[1], y, z], 20, 5); for (const x of xs) tub(a, [x, ys[0], z], [x, ys[1], z], 20, 5); }
    for (let k = 0; k < v.lifts; k++) { const z = zb + (k + 1) * lh; a.box(xs[0], ys[0] + 20, z + 20, xs[1], ys[1] - 20, z + 55); tub(a, [xs[0], ys[0], z - lh + 500], [xs[1], ys[0], z], 14, 4); a.box(xs[0], ys[0] - 5, z + 55, xs[1], ys[0] + 5, z + 200); }
    const zt = zb + v.lifts * lh; for (const y of ys) { tub(a, [xs[0], y, zt + 1000], [xs[1], y, zt + 1000], 20, 5); tub(a, [xs[0], y, zt + 500], [xs[1], y, zt + 500], 18, 5); }
    for (const x of xs) tub(a, [x, ys[0], zt + 1000], [x, ys[1], zt + 1000], 20, 5);
    a.rect(xs[0] - 20, ys[0] - 20, xs[1] + 20, ys[1] + 20, 'EQUIP-DETAIL'); for (const y of ys) for (const x of xs) a.circ(x, y, 24);
    a.log('Added the base jacks, standards with rosette nodes, ledgers and transoms, steel decks, facade diagonals, guardrails and toe boards (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic adjustable steel prop',
  desc: (v) => `Adjustable steel slab prop, ${v.lo} to ${v.hi} ft: an outer tube with a ring-pin hole row, an inner tube, a threaded adjusting collar with a handle pin, a square base plate and a head plate with fold-up ears.`,
  vs: [[3.3, 5.6, 8], [5.6, 10, 10], [8, 14.7, 12], [11.5, 18, 14]].map(([lo, hi, w]) => [`${lo} to ${hi} ft`, w, w, m.round((lo + hi) / 2 * 12), 0, { lo, hi }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const cy = a.cy, zc = Z0 + (Z1 - Z0) * 0.45, r = W * 0.22;
    a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z0 + 12); a.cyl(cx, cy, Z0 + 12, zc, r, 14); a.cyl(cx, cy, zc - 20, Z1 - 12, r * 0.8, 14); a.cyl(cx, cy, zc, zc + 130, r * 1.5, 14);
    a.box(cx + r * 1.4, cy - 8, zc + 40, X1 - 4, cy + 8, zc + 90);
    for (let z = zc + 260; z < Z1 - 100; z += 90) a.cyl(cx, cy, z, z + 8, r * 0.95, 8);
    a.box(X0 + 10, YF + 10, Z1 - 12, X1 - 10, YB - 10, Z1); a.box(X0 + 12, YF + 10, Z1, X0 + 24, YB - 10, Z1 + 0.01); a.circ(cx, cy, r); a.circ(cx, cy, r * 1.5, 'EQUIP-DETAIL'); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
    a.log('Added the base plate, outer and inner tubes, ring-pin holes, adjusting collar with pin handle and the head plate (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic wall formwork panel with braces',
  desc: (v) => `Wall formwork panel, ${v.wd} ft wide and ${v.ht} ft high: a plywood face in a steel frame, vertical soldiers and horizontal walers on the rear, a working platform with a handrail near the top, a lifting eye and two push-pull braces with base plates.`,
  vs: [[4, 8], [8, 8], [8, 10], [8, 12], [8, 14]].map(([wd, ht]) => [`${wd} ft wide, ${ht} ft high`, wd * 12 + 8, ht * 6 + 36, ht * 12 + 6, 0, { wd, ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const y0 = YF + 20, y1 = y0 + 90, fz = Z0 + 80, ft = Z1 - 150;
    a.box(X0 + 40, y0, fz, X1 - 40, y1, ft); a.frame(X0 + 40, fz, X1 - 40, ft, y1, y1 + 80, 60);
    const ns = m.max(2, m.round(v.wd / 2)); for (let i = 0; i <= ns; i++) { const x = X0 + 100 + i * (W - 200) / ns; a.box(x - 40, y1 + 80, fz + 20, x + 40, y1 + 140, ft - 20); }
    const nw = m.max(3, m.round(v.ht / 2.5)); for (let i = 0; i < nw; i++) { const z = fz + 400 + i * (ft - fz - 800) / (nw - 1); a.box(X0 + 60, y1 + 140, z - 45, X1 - 60, y1 + 200, z + 45); }
    a.rect(X0 + 40, y0, X1 - 40, y1, 'EQUIP-DETAIL'); for (const x of [X0 + 260, X1 - 260]) { tub(a, [x, y1 + 200, fz + (ft - fz) * 0.75], [x, YB - 400, Z0 + 150], 40, 6); a.box(x - 200, YB - 600, Z0, x + 200, YB - 100, Z0 + 40); a.line(x, y1 + 200, x, YB - 400, 'EQUIP-DETAIL'); }
    const py = y1 + 200, pz = ft - 1000; a.box(X0 + 40, py, pz - 40, X1 - 40, YB - 120, pz); rail(a, X0 + 40, YB - 120, X1 - 40, YB - 120, pz, pz + 950, 3, 14); a.rect(X0 + 40, py, X1 - 40, YB - 120, 'EQUIP-DETAIL');
    a.cyl(cx, y1 + 160, ft, ft + 140, 40, 8);
    a.log('Added the plywood face in a steel frame, soldiers, walers, top working platform with handrail, lifting eye and the push-pull braces with base plates (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic slab table form',
  desc: (v) => `Flying slab table form, ${v.wd} ft by ${v.ln} ft and ${v.ht} ft tall: a plywood deck on timber joists over steel primary beams, adjustable props on a grid with cross bracing, and head-and-base plates with trolley wheels at one end.`,
  vs: [[8, 16, 9], [8, 20, 10], [10, 20, 12], [10, 24, 14]].map(([wd, ln, ht]) => [`${wd} ft by ${ln} ft, ${ht} ft high`, wd * 12, ln * 12, ht * 12, 0, { wd, ln, ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const zd = Z1 - 18 * 0 - 130; a.box(X0, YF, zd + 60, X1, YB, Z1);
    for (let y = YF + 150; y < YB; y += 450) a.box(X0 + 20, y, zd, X1 - 20, y + 60, zd + 60);
    for (const y of [YF + 400, cx * 0 + (YF + YB) / 2, YB - 400]) a.box(X0 + 60, y - 50, zd - 120, X1 - 60, y + 50, zd);
    const nxp = 3, nyp = v.ln > 16 ? 4 : 3;
    for (let i = 0; i < nxp; i++) for (let j = 0; j < nyp; j++) { const x = X0 + 150 + i * (W - 300) / (nxp - 1), y = YF + 300 + j * (D - 600) / (nyp - 1); a.cyl(x, y, Z0 + 70, zd - 120, 28, 8); a.box(x - 100, y - 100, zd - 150, x + 100, y + 100, zd - 120); a.box(x - 120, y - 120, Z0 + 20, x + 120, y + 120, Z0 + 70); a.cyl(x, y, Z0 + 600, Z0 + 700, 40, 8); a.circ(x, y, 28, 'EQUIP-DETAIL'); }
    for (let j = 0; j < nyp - 1; j++) for (const x of [X0 + 150, X1 - 150]) { const y0 = YF + 300 + j * (D - 600) / (nyp - 1), y1 = YF + 300 + (j + 1) * (D - 600) / (nyp - 1); tub(a, [x, y0, Z0 + 350], [x, y1, zd - 400], 16, 4); tub(a, [x, y1, Z0 + 350], [x, y0, zd - 400], 16, 4); }
    for (const x of [X0 + 150, X1 - 150]) { a.xcyl(x - 80, x + 80, YF + 150, Z0 + 20, 20, 10); }
    for (const x of [X0 + 40, X1 - 40]) a.box(x - 40, YF, zd + 60, x + 40, YB, Z1 + 0.01);
    a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); for (let y = YF + 150; y < YB; y += 450) a.line(X0, y, X1, y, 'EQUIP-DETAIL');
    a.log('Added the plywood deck, timber joists, steel primary beams, the grid of adjustable props with head and base plates, bracing and trolley wheels (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic square column form',
  desc: (v) => `Square concrete column form, ${v.s} in section and 10 ft high: four plywood-faced steel panels forming a hollow box, welded corner angles, bolted column clamps every 24 in and a base shoe; the open top shows the void.`,
  vs: [12, 16, 24, 30].map((s) => [`${s} in section`, s + 8, s + 8, 120, 0, { s }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const t = 70, ins = 20; a.box(X0 + ins, YF + ins, Z0 + 60, X1 - ins, YF + ins + t, Z1); a.box(X0 + ins, YB - ins - t, Z0 + 60, X1 - ins, YB - ins, Z1); a.box(X0 + ins, YF + ins + t, Z0 + 60, X0 + ins + t, YB - ins - t, Z1); a.box(X1 - ins - t, YF + ins + t, Z0 + 60, X1 - ins, YB - ins - t, Z1);
    a.box(X0, YF, Z0, X1, YB, Z0 + 60);
    for (let z = Z0 + 400; z < Z1 - 200; z += 600) { a.box(X0 + 4, YF + 4, z, X1 - 4, YF + 12 + ins - 4 + 0.01 + 8, z + 70); a.box(X0 + 4, YB - 12 - ins, z, X1 - 4, YB - 4, z + 70); a.box(X0 + 4, YF + 4, z, X0 + 12 + ins, YB - 4, z + 70); a.box(X1 - 12 - ins, YF + 4, z, X1 - 4, YB - 4, z + 70); a.box(X1 - 4, YF + 4, z + 5, X1 - 0.5, YF + 120, z + 65); }
    a.rect(X0 + ins, YF + ins, X1 - ins, YB - ins, 'EQUIP'); a.rect(X0 + ins + t, YF + ins + t, X1 - ins - t, YB - ins - t, 'EQUIP-DETAIL');
    a.log('Added the four steel and plywood panels, base shoe and the bolted column clamps (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic round column form',
  desc: (v) => `Round concrete column form, ${v.dia} in diameter and 12 ft high: a split steel shell in two halves with bolted vertical flanges, horizontal stiffener rings every 30 in, a base ring and lifting lugs.`,
  vs: [12, 18, 24, 36].map((dia) => [`${dia} in diameter`, dia + 8, dia + 8, 144, 0, { dia }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const r = v.dia * IN / 2, cy = a.cy; a.cyl(cx, cy, Z0 + 40, Z1, r, 28); a.cyl(cx, cy, Z0, Z0 + 40, r + 80, 28);
    for (let z = Z0 + 500; z < Z1 - 100; z += 760) a.cyl(cx, cy, z, z + 70, r + 40, 28);
    for (const s of [-1, 1]) a.box(cx + s * r - 20, cy - 40, Z0 + 40, cx + s * r + 20, cy + 40, Z1 - 20);
    for (let z = Z0 + 300; z < Z1 - 200; z += 380) for (const s of [-1, 1]) a.box(cx + s * (r + 20) - 12, cy - 60, z, cx + s * (r + 20) + 12, cy + 60, z + 50);
    for (const s of [-1, 1]) a.box(cx + s * r * 0.3 - 40, cy - 25, Z1 - 20, cx + s * r * 0.3 + 40, cy + 25, Z1 + 0.01 - 0.01 + 0.5);
    a.circ(cx, cy, r); a.circ(cx, cy, r - 50, 'EQUIP-DETAIL'); a.circ(cx, cy, r + 40, 'EQUIP-DETAIL');
    a.log('Added the split steel shell, base ring, stiffener rings, bolted flanges and lifting lugs (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic heavy-duty shoring tower',
  desc: (v) => `Heavy-duty frame shoring tower, ${v.ht} ft tall on a 4 ft by 4 ft footprint: four screw-jack bases, stacked heavy frames with cross braces on every face, interlocking pins, and a U-head jack carrying a steel beam at the top.`,
  vs: [10, 14, 20, 28].map((ht) => [`${ht} ft tall`, 52, 52, m.ceil((300 + m.max(1, m.round((ht * FT - 800) / 1900)) * 1900 + 450) / IN) + 1, 0, { ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const fh = 1900, nf = m.max(1, m.round((v.ht * FT - 800) / fh)), zb = Z0 + 300, ft = zb + nf * fh; const pts = [[X0 + 150, YF + 150], [X1 - 150, YF + 150], [X1 - 150, YB - 150], [X0 + 150, YB - 150]];
    for (const [x, y] of pts) { a.box(x - 100, y - 100, Z0, x + 100, y + 100, Z0 + 20); a.cyl(x, y, Z0 + 20, Z0 + 320, 20, 6); a.cyl(x, y, Z0 + 150, Z0 + 190, 35, 8); }
    for (let k = 0; k < nf; k++) { const z = zb + k * fh; for (const [x, y] of pts) tub(a, [x, y, z], [x, y, z + fh], 26, 6);
      for (let i = 0; i < 4; i++) { const p = pts[i], q = pts[(i + 1) % 4]; tub(a, [p[0], p[1], z + fh - 60], [q[0], q[1], z + fh - 60], 20, 5); tub(a, [p[0], p[1], z + 80], [q[0], q[1], z + fh - 80], 14, 4); tub(a, [q[0], q[1], z + 80], [p[0], p[1], z + fh - 80], 14, 4); } }
    for (const [x, y] of pts) { a.cyl(x, y, ft, ft + 250, 20, 6); a.box(x - 80, y - 20, ft + 250, x + 80, y + 20, ft + 300); }
    a.box(X0 + 80, YF + 130, ft + 300, X1 - 80, YF + 190, ft + 450); a.box(X0 + 80, YB - 190, ft + 300, X1 - 80, YB - 130, ft + 450);
    a.rect(X0 + 100, YF + 100, X1 - 100, YB - 100, 'EQUIP-DETAIL'); for (const [x, y] of pts) a.circ(x, y, 26);
    a.log('Added the screw-jack bases, stacked heavy frames with cross braces, pins and the U-head jacks with the top beams (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic rebar column cage',
  desc: (v) => `Reinforcing cage for a ${v.rd ? 'round' : 'square'} column, ${v.s} in ${v.rd ? 'diameter' : 'section'} and ${v.ht} ft high: ${v.rd ? 'eight' : 'twelve'} vertical bars with ${v.rd ? 'spiral-style round ties' : 'rectangular ties'} every 8 in, closer ties near the base and a pair of lifting bars at the top.`,
  vs: [[16, 0, 10], [24, 0, 12], [24, 1, 12], [36, 1, 14]].map(([s, rd, ht]) => [`${s} in ${rd ? 'round' : 'square'}, ${ht} ft`, s + 6, s + 6, ht * 12, 0, { s, rd, ht }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const h = v.s * IN / 2 - 30, cy = a.cy, nb = v.rd ? 8 : 12, pts = [];
    if (v.rd) for (let i = 0; i < nb; i++) pts.push([cx + m.cos(i / nb * m.PI * 2) * h, cy + m.sin(i / nb * m.PI * 2) * h]);
    else for (let i = 0; i < nb; i++) { const k = i % 4, side = m.floor(i / 4); const off = [-h, h / 3, -h / 3, h][side] ?? 0; pts.push(k === 0 ? [cx - h, cy + (side - 1) * h] : k === 1 ? [cx + h, cy + (side - 1) * h] : k === 2 ? [cx + (side - 1) * h, cy - h] : [cx + (side - 1) * h, cy + h]); }
    for (const [x, y] of pts) tub(a, [x, y, Z0 + 20], [x, y, Z1 - 20], 13, 5);
    for (let z = Z0 + 100; z < Z1 - 200; z += (z < Z0 + 900 ? 100 : 200)) { if (v.rd) { const ring = []; for (let i = 0; i <= 16; i++) ring.push([cx + m.cos(i / 16 * m.PI * 2) * (h + 8), cy + m.sin(i / 16 * m.PI * 2) * (h + 8), z]); a.tube(ring, ring.map(() => 6), 4); } else { const c = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([sx, sy]) => [cx + sx * (h + 8), cy + sy * (h + 8), z]); a.tube(c, c.map(() => 6), 4); } }
    tub(a, [cx - h, cy, Z1 - 20], [cx + h, cy, Z1 - 20], 13, 5);
    if (v.rd) { a.circ(cx, cy, h + 8); a.circ(cx, cy, h + 20, 'EQUIP-DETAIL'); } else { a.rect(cx - h - 8, cy - h - 8, cx + h + 8, cy + h + 8, 'EQUIP-DETAIL'); } for (const [x, y] of pts) a.circ(x, y, 13, 'EQUIP-DETAIL');
    a.log('Added the vertical bars, the ties at their spacing with closer ties at the base and the top lifting bar (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic rebar mat on chairs',
  desc: (v) => `Reinforcing mat, ${v.wd} ft by ${v.ln} ft, in two crossed layers of bars at ${v.sp} in centres: bottom layer in the long direction, top layer across, tied at crossings and held up by bar chairs.`,
  vs: [[4, 8, 8], [8, 20, 6], [10, 30, 12]].map(([wd, ln, sp]) => [`${wd} ft by ${ln} ft, ${sp} in centres`, wd * 12, ln * 12, 10, 0, { wd, ln, sp }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const sp = v.sp * IN, zb = Z0 + 60;
    for (let y = YF + 30; y <= YB - 20; y += sp) a.box(X0 + 15, y - 7, zb, X1 - 15, y + 7, zb + 14);
    for (let x = X0 + 30; x <= X1 - 20; x += sp) a.box(x - 7, YF + 15, zb + 14, x + 7, YB - 15, zb + 28);
    for (let x = X0 + 150; x < X1 - 100; x += 600) for (let y = YF + 150; y < YB - 100; y += 600) { a.box(x - 20, y - 20, Z0, x + 20, y + 20, zb - 0.01); a.box(x - 40, y - 3, Z0, x + 40, y + 3, Z0 + 10); }
    for (let y = YF + 30; y <= YB - 20; y += sp) a.line(X0 + 15, y, X1 - 15, y, 'EQUIP-DETAIL');
    for (let x = X0 + 30; x <= X1 - 20; x += sp) a.line(x, YF + 15, x, YB - 15, 'EQUIP-DETAIL');
    a.log('Added the two crossed layers of bars at their spacing and the bar chairs under them (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic rebar bundle stillage',
  desc: (v) => `Stillage of reinforcing bar bundles, ${v.len} ft long: ${v.rows} tiers of bars laid in a triangular stack, strapped in two places, on a timber bearer base with end stops at each side.`,
  vs: [[12, 3], [20, 4], [40, 5]].map(([len, rows]) => [`${len} ft bars, ${rows} tiers`, len * 12, 40, 10 + rows * 4, 0, { len, rows }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    for (const x of [X0 + W * 0.15, cx, X1 - W * 0.15]) a.box(x - 60, YF + 20, Z0, x + 60, YB - 20, Z0 + 100);
    const r = 14; let z = Z0 + 100 + r; for (let row = 0; row < v.rows; row++) { const n = v.rows - row + 1 + (v.rows > 3 ? 1 : 0); const w = n * r * 2.1; for (let i = 0; i < n; i++) a.xcyl(X0 + 20, X1 - 20, a.cy - w / 2 + (i + 0.5) * r * 2.1, z, r, 8); z += r * 1.8; }
    for (const x of [X0 + W * 0.25, X1 - W * 0.25]) { a.box(x - 15, YF + 120, Z0 + 100, x + 15, YB - 120, Z1 - 5); }
    for (const y of [YF + 40, YB - 40]) a.box(X0, y - 30, Z0 + 100, X0 + 25, y + 30, Z1 - 20);
    for (let i = 0; i < 3; i++) a.line(X0 + 20, a.cy - 150 + i * 150, X1 - 20, a.cy - 150 + i * 150, 'EQUIP-DETAIL');
    a.log('Added the timber bearers, the stacked bar bundles in tiers, the two straps and the end stops (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic mobile scaffold tower',
  desc: (v) => `Mobile scaffold access tower, platform at ${v.ph} ft: four standards with rung frames and diagonal braces on every face, castors with brakes, four outrigger stabilisers, a decked platform with trapdoor, guardrails and toe boards, and an internal ladder run.`,
  vs: [6.5, 10, 16, 23].map((ph) => [`${ph} ft platform`, 100, 100, m.round(ph * 12 + 46), 0, { ph }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const tw = 760, cy = a.cy, zp = Z1 - 1100, xs = [cx - tw / 2, cx + tw / 2], ys = [cy - 1100 + 600 - 0, cy + 0 + 0];
    const y0 = cy - 560, y1 = cy + 560; const Ys = [y0, y1];
    for (const x of [X0 + 100, X1 - 100]) for (const y of [YF + 100, YB - 100]) { a.cyl(x, y, Z0 + 20, Z0 + 150, 25, 8); a.xcyl(x - 25, x + 25, y, Z0 + 20, 20, 8); }
    for (const x of xs) for (const y of Ys) { tub(a, [x, y, Z0 + 200], [x, y, zp], 24, 6); }
    for (const x of xs) for (const y of Ys) { }
    for (const x of [X0 + 100, X1 - 100]) for (const y of [YF + 100, YB - 100]) { const tx = x < cx ? xs[0] : xs[1], ty = y < cy ? Ys[0] : Ys[1]; tub(a, [x, y, Z0 + 150], [tx, ty, Z0 + 500], 22, 5); }
    for (let z = Z0 + 500; z < zp - 300; z += 500) { for (const y of Ys) tub(a, [xs[0], y, z], [xs[1], y, z], 14, 4); for (const x of xs) tub(a, [x, Ys[0], z], [x, Ys[1], z], 14, 4); }
    for (let k = 0; k * 1500 < zp - Z0 - 600; k++) { const z = Z0 + 500 + k * 1500; for (const y of Ys) { tub(a, [xs[0], y, z], [xs[1], y, z + 1500], 14, 4); } for (const x of xs) tub(a, [x, Ys[0], z + 1500], [x, Ys[1], z], 14, 4); }
    a.box(xs[0] - 80, y0 - 80, zp, xs[1] + 80, y1 + 80, zp + 40); a.box(xs[0] - 80, y0 - 80, zp + 40, xs[1] + 80, y0 - 60, zp + 190); a.box(cx - 150, y0 - 20, zp + 40, cx + 150, y0 + 400, zp + 45);
    for (const x of xs) for (const y of Ys) tub(a, [x, y, zp], [x, y, zp + 1000], 22, 6);
    for (const y of Ys) { tub(a, [xs[0], y, zp + 1000], [xs[1], y, zp + 1000], 20, 5); tub(a, [xs[0], y, zp + 500], [xs[1], y, zp + 500], 18, 5); }
    for (const x of xs) { tub(a, [x, Ys[0], zp + 1000], [x, Ys[1], zp + 1000], 20, 5); tub(a, [x, Ys[0], zp + 500], [x, Ys[1], zp + 500], 18, 5); }
    a.rect(xs[0], y0, xs[1], y1, 'EQUIP-DETAIL'); a.line(X0 + 100, YF + 100, xs[0], y0, 'EQUIP-DETAIL'); a.line(X1 - 100, YF + 100, xs[1], y0, 'EQUIP-DETAIL'); a.line(X0 + 100, YB - 100, xs[0], y1, 'EQUIP-DETAIL'); a.line(X1 - 100, YB - 100, xs[1], y1, 'EQUIP-DETAIL');
    a.log('Added the standards with rungs and diagonal braces, castors, four outrigger stabilisers, the platform with trapdoor, guardrails and toe boards (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic beam soffit formwork',
  desc: (v) => `Beam formwork for a ${v.bw} in by ${v.bh} in concrete beam, 10 ft long: a plywood soffit board and two side panels with kicker strips, timber yokes at the third points, two adjustable props with head plates and a ledger tie.`,
  vs: [[12, 24], [16, 30], [20, 36]].map(([bw, bh]) => [`${bw} by ${bh} in beam`, 120, bw + 28, 108 + bh, 0, { bw, bh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const cy = a.cy, bw = v.bw * IN, bh = v.bh * IN, zs = Z1 - bh - 60;
    a.box(X0 + 20, cy - bw / 2 - 20, zs - 30, X1 - 20, cy + bw / 2 + 20, zs); a.box(X0 + 20, cy - bw / 2 - 60, zs, X1 - 20, cy - bw / 2 - 20, Z1 - 20); a.box(X0 + 20, cy + bw / 2 + 20, zs, X1 - 20, cy + bw / 2 + 60, Z1 - 20);
    for (const f of [0.17, 0.5, 0.83]) { const x = X0 + W * f; a.box(x - 40, cy - bw / 2 - 150, zs - 100, x + 40, cy + bw / 2 + 150, zs - 30); for (const s of [-1, 1]) a.box(x - 40, cy + s * (bw / 2 + 60) - 20, zs, x + 40, cy + s * (bw / 2 + 140) + 20, Z1 - 120); a.box(x - 40, cy - bw / 2 - 150, Z1 - 120, x + 40, cy + bw / 2 + 150, Z1 - 80); }
    for (const f of [0.25, 0.75]) { const x = X0 + W * f; a.cyl(x, cy, Z0 + 30, zs - 130, 26, 8); a.box(x - 100, cy - 100, Z0, x + 100, cy + 100, Z0 + 30); a.box(x - 90, cy - 90, zs - 130, x + 90, cy + 90, zs - 100); a.circ(x, cy, 26, 'EQUIP-DETAIL'); }
    a.rect(X0 + 20, cy - bw / 2 - 60, X1 - 20, cy + bw / 2 + 60, 'EQUIP'); a.rect(X0 + 20, cy - bw / 2, X1 - 20, cy + bw / 2, 'EQUIP-DETAIL');
    a.log('Added the soffit board, side panels with kickers, timber yokes, two adjustable props with head plates and the ledger tie (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic stack of formwork plywood on a pallet',
  desc: (v) => `Pallet of ${v.n} formwork plywood sheets, each 4 ft by 8 ft: the sheets lie flat in a square stack on a timber pallet and are held by two steel straps with corner guards.`,
  vs: [[20, 15], [40, 21], [60, 27]].map(([n, h]) => [`${n} sheets`, 49, 97, h, 0, { n }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    pallet(a, X0 + 10, YF + 10, X1 - 10, YB - 10, Z0, 140);
    const sh = (Z1 - Z0 - 140 - 4) / v.n; for (let i = 0; i < v.n; i++) a.box(X0 + 20, YF + 20, Z0 + 140 + i * sh, X1 - 20, YB - 20, Z0 + 140 + (i + 1) * sh - 0.5);
    for (const y of [YF + D * 0.25, YB - D * 0.25]) { a.box(X0 + 14, y - 12, Z0 + 140, X0 + 22, y + 12, Z1); a.box(X1 - 22, y - 12, Z0 + 140, X1 - 14, y + 12, Z1); a.box(X0 + 14, y - 12, Z1 - 6, X1 - 14, y + 12, Z1); a.line(X0 + 14, y, X1 - 14, y, 'EQUIP-DETAIL'); }
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the timber pallet, the stacked plywood sheets and the two steel straps with corner guards (plan and 3D).');
  } }),

fam({ cat: 'construction/formwork', title: 'Generic suspended access cradle',
  desc: (v) => `Suspended access cradle, ${v.len} ft platform: a steel-floored platform with guardrails and toe boards, two stirrups at the ends, wire rope falls up to a hoist at each stirrup, a safety line and a hoist motor at the stirrup; hung from a pair of top beams.`,
  vs: [8, 16, 24].map((len) => [`${len} ft platform`, len * 12 + 24, 40, 130, 0, { len }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const cy = a.cy, pz = Z0 + 60; a.box(X0 + 60, YF + 100, pz, X1 - 60, YB - 100, pz + 70);
    rail(a, X0 + 60, YF + 100, X1 - 60, YF + 100, pz + 70, pz + 1100, 6, 18); rail(a, X0 + 60, YB - 100, X1 - 60, YB - 100, pz + 70, pz + 1100, 6, 18); a.box(X0 + 60, YF + 90, pz + 70, X1 - 60, YF + 110, pz + 220); a.box(X0 + 60, YB - 110, pz + 70, X1 - 60, YB - 90, pz + 220);
    for (const x of [X0 + 100, X1 - 100]) { a.frame(x - 100, pz, x + 100, pz + 1800, YF + 90, YB - 90, 30); a.box(x - 130, cy - 150, pz + 400, x + 130, cy + 150, pz + 1000); tub(a, [x, cy - 60, pz + 1800], [x, cy - 60, Z1 - 80], 10, 4); tub(a, [x + 40, cy + 60, pz + 1800], [x + 40, cy + 60, Z1 - 80], 6, 4); a.rect(x - 130, cy - 150, x + 130, cy + 150, 'EQUIP-DETAIL'); }
    a.box(X0 + 40, YF + 120, Z1 - 100, X1 - 40, YB - 120, Z1); for (const x of [X0 + 100, X1 - 100]) a.box(x - 100, YF + 60, Z1 - 160, x + 100, YB - 60, Z1 - 100);
    a.rect(X0 + 60, YF + 100, X1 - 60, YB - 100, 'EQUIP-DETAIL');
    a.log('Added the platform with guardrails and toe boards, the two stirrups with hoists, the wire ropes, safety line and the top suspension beams (plan and 3D).');
  } }),

// ======================================================================================= construction/tools
fam({ cat: 'construction/tools', title: 'Generic site plate compactor',
  desc: (v) => `${v.rev ? 'Reversible' : 'Forward'} plate compactor, ${v.lb} lb, ${v.pw} in plate: a steel base plate with turned-up front, an eccentric housing, an engine on a mount with a belt guard, a fuel tank, a lifting bar and a folding handle with a grip loop.`,
  vs: [[150, 18, 0], [220, 20, 0], [400, 24, 1], [700, 32, 1]].map(([lb, pw, rev]) => [`${lb} lb, ${pw} in plate`, pw + 2, 44 + pw * 0.8, 34, 0, { lb, pw, rev }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const pl = (v.pw * 1.6) * IN * 0.55 + 200, y0 = YF + 20, y1 = y0 + 760 + v.pw * 12; a.prism([[X0 + 20, y0 + 80], [X0 + 60, y0], [X1 - 60, y0], [X1 - 20, y0 + 80], [X1 - 20, y1], [X0 + 20, y1]], Z0, Z0 + 40); a.rect(X0 + 20, y0, X1 - 20, y1, 'EQUIP-DETAIL');
    a.box(X0 + 60, y0 + 160, Z0 + 40, X1 - 60, y1 - 100, Z0 + 260); a.box(X0 + 80, y1 - 300, Z0 + 260, X1 - 80, y1 - 60, Z0 + 520); a.cyl(X0 + 130, y1 - 100, Z0 + 260, Z0 + 480, 90, 12);
    a.box(X0 + 90, y0 + 200, Z0 + 260, X1 - 90, y0 + 520, Z0 + 440); a.box(X1 - 140, y1 - 260, Z0 + 520, X1 - 60, y1 - 160, Z0 + 600);
    a.box(cx - 120, y0 + 420, Z0 + 520, cx + 120, y0 + 600, Z0 + 640);
    tub(a, [cx - 150, y1 - 80, Z0 + 300], [cx - 150, YB - 200, Z1 - 100], 16, 5); tub(a, [cx + 150, y1 - 80, Z0 + 300], [cx + 150, YB - 200, Z1 - 100], 16, 5); tub(a, [cx - 150, YB - 200, Z1 - 100], [cx + 150, YB - 200, Z1 - 100], 18, 6); tub(a, [cx - 150, YB - 200, Z1 - 100], [cx - 150, YB - 20, Z1 - 100], 16, 5); tub(a, [cx + 150, YB - 200, Z1 - 100], [cx + 150, YB - 20, Z1 - 100], 16, 5); tub(a, [cx - 150, YB - 20, Z1 - 100], [cx + 150, YB - 20, Z1 - 100], 18, 6);
    if (v.rev) a.box(cx - 100, YB - 280, Z1 - 160, cx + 100, YB - 200, Z1 - 60);
    a.line(cx - 150, y1 - 80, cx - 150, YB - 20, 'EQUIP-DETAIL'); a.line(cx + 150, y1 - 80, cx + 150, YB - 20, 'EQUIP-DETAIL'); a.line(cx - 150, YB - 20, cx + 150, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the base plate with turned-up front, eccentric housing, engine with belt guard, fuel tank, lifting bar and the handle with grip loop (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic towable site concrete mixer',
  desc: (v) => `Towable drum concrete mixer, ${v.cf} cubic foot: a tilting steel drum with internal ridges and a rim ring, a drive motor and guard, a tilt handwheel, a steel frame on two wheels, a stand leg and a tow handle.`,
  vs: [[3.5, 40, 66, 58], [5, 44, 74, 62], [9, 54, 92, 72]].map(([cf, w, d, h]) => [`${cf} cu ft`, w, d, h, 0, { cf }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const r = W * 0.28; for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 100), YB - D * 0.35, 280, 100);
    a.box(X0 + 120, YF + 300, Z0 + 380, X1 - 120, YB - 100, Z0 + 440); a.box(cx - 70, YF + 40, Z0 + 390, cx + 70, YF + 300, Z0 + 430); a.cyl(cx, YF + 60, Z0 + 270, Z0 + 390, 25, 8);
    const dz = Z0 + 440 + r + 160, dy = a.cy + 100; a.tube([[cx, dy + D * 0.2, dz - 120], [cx, dy + D * 0.08, dz - 50], [cx, dy, dz], [cx, dy - D * 0.12, dz + 100], [cx, dy - D * 0.22, dz + 220]], [r * 0.45, r * 0.95, r, r * 0.92, r * 0.6], 20);
    a.cyl(cx, dy, dz, dz + 0.01, 1, 3); a.tube([[cx, dy - D * 0.22 - 5, dz + 220], [cx, dy - D * 0.22 + 5, dz + 220]], [r * 0.7, r * 0.7], 20); a.ycyl(dy - 20, dy + 20, cx + r + 60, dz, 100, 12);
    a.box(cx - 130, YB - 520, Z0 + 440, cx + 130, YB - 150, Z0 + 700); a.cyl(cx, YB - 335, Z0 + 700, Z0 + 740, 150, 12); a.box(X1 - 200, a.cy - 40, Z0 + 440, X1 - 120, a.cy + 40, Z0 + 900); a.cyl(X1 - 160, a.cy, Z0 + 900, Z0 + 940, 90, 10);
    a.box(X0 + 120, YF + 600, Z0 + 440, X0 + 160, YF + 640, Z0 + 700); tub(a, [cx, dy, dz - r], [cx, dy, Z0 + 440], 40, 6);
    a.circ(cx, dy, r, 'EQUIP-DETAIL'); a.rect(X0 + 120, YF + 300, X1 - 120, YB - 100, 'EQUIP-DETAIL');
    a.log('Added the tilting ridged drum, drive motor, handwheel, steel frame, two wheels, stand leg and tow handle (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic engine-driven site welder',
  desc: (v) => `Engine-driven welding set, ${v.amp} A: a louvered steel enclosure with a front control panel of dials, two output terminals and a receptacle, a side service door, an exhaust stack, a lifting eye, a fuel cap and a small chassis with wheels and a handle.`,
  vs: [[200, 22, 44, 36], [300, 26, 52, 40], [500, 32, 62, 46]].map(([amp, w, d, h]) => [`${amp} A`, w, d, h, 0, { amp }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    a.box(X0 + 20, YF + 20, Z0 + 180, X1 - 20, YB - 20, Z1 - 40); a.box(X0, YF, Z0 + 140, X1, YB, Z0 + 200); a.box(X0 + 10, YF + 10, Z1 - 40, X1 - 10, YB - 10, Z1 - 10);
    wheelPairs(a, [YB - 220], 160, 80, 20); for (const x of [X0 + 100, X1 - 100]) a.box(x - 30, YF + 20, Z0, x + 30, YF + 120, Z0 + 140);
    for (let z = Z0 + 400; z < Z1 - 250; z += 38) { a.box(X0 + 60, YF - 8, z, cx - 10, YF + 20, z + 14); }
    a.box(cx + 20, YF - 20, Z0 + 400, X1 - 60, YF + 20, Z1 - 120); for (let i = 0; i < 3; i++) a.cyl(cx + 110 + i * 120, YF - 30, Z1 - 240, Z1 - 239, 1, 3), a.box(cx + 60 + i * 120, YF - 50, Z1 - 290, cx + 120 + i * 120, YF - 20, Z1 - 230);
    for (const s of [0, 1]) a.cyl(cx + 130 + s * 150, YF - 10, Z0 + 520, Z0 + 521, 1, 3), a.box(cx + 100 + s * 150, YF - 50, Z0 + 480, cx + 160 + s * 150, YF - 20, Z0 + 540);
    a.cyl(X1 - 150, YB - 150, Z1 - 10, Z1 + 0.01, 1, 3); a.box(X1 - 90, YB - 160, Z1 - 20, X1 - 20, YB - 80, Z1 - 0.01); tub(a, [X0 + 120, YB - 120, Z1 - 20], [X0 + 120, YB - 120, Z1 - 20], 1, 3);
    tub(a, [cx - 150, YB - 20, Z0 + 500], [cx + 150, YB - 20, Z0 + 500], 14, 5); a.line(X0 + 60, YF + 10, cx - 10, YF + 10, 'EQUIP-DETAIL'); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
    a.log('Added the louvered enclosure, control panel with dials, terminals, receptacle, exhaust, lifting eye, wheels and the handle (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site generator set',
  desc: (v) => `Diesel generator set, ${v.kva} kVA, in a weatherproof canopy: a louvered enclosure with two hinged service doors and swings, a control window, a silencer stack, a bunded fuel base with a fill cap, a lifting eye${v.tow ? ', two wheels and a tow bar with eye' : ' and fork pockets'}.`,
  vs: [[20, 36, 76, 54, 1], [60, 42, 104, 64, 1], [100, 46, 116, 70, 0], [200, 50, 138, 80, 0], [400, 56, 180, 92, 0]].map(([kva, w, d, h, tow]) => [`${kva} kVA`, w, d, h, 0, { kva, tow }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const bz = Z0 + (v.tow ? 380 : 220), by0 = YF + (v.tow ? 900 : 60); a.box(X0 + 10, by0, Z0 + 120, X1 - 10, YB - 20, bz); if (v.tow) { for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 80), YB - D * 0.42, 300, 130); tub(a, [cx, by0, Z0 + 250], [cx, YF + 80, Z0 + 330], 35, 5); a.cyl(cx, YF + 70, Z0 + 250, Z0 + 350, 65, 10); } else for (const x of [X0 + W * 0.2, X1 - W * 0.2]) a.box(x - 100, by0, Z0, x + 100, YB - 20, Z0 + 120);
    a.box(X0 + 40, by0 + 20, bz, X1 - 40, YB - 40, Z1 - 80); a.box(X0 + 30, by0 + 10, Z1 - 80, X1 - 30, YB - 30, Z1 - 20);
    const nd = 2, dw = (W - 120) / nd; for (let i = 0; i < nd; i++) { const x0 = X0 + 60 + i * dw; for (let z = bz + 250; z < Z1 - 350; z += 38) a.box(x0 + 80, by0 + 10, z, x0 + dw - 80, by0 + 20, z + 14); a.box(x0 + dw - 100, by0 - 15, (bz + Z1) / 2 - 60, x0 + dw - 70, by0 + 10, (bz + Z1) / 2 + 60); a.arc(i ? x0 + dw : x0, by0, dw, i ? 180 : 270, i ? 270 : 360); a.line(x0, by0, x0 + dw, by0, 'EQUIP-DETAIL'); }
    a.box(cx - 160, by0 - 10, Z1 - 330, cx + 160, by0 + 10, Z1 - 150);
    a.cyl(X1 - 200, YB - 240, Z1 - 20, Z1, 80, 12); a.cyl(X1 - 200, YB - 240, Z1 - 20, Z1 - 19, 1, 3); a.box(X0 + 80, YB - 200, Z1 - 120, X0 + 180, YB - 100, Z1 - 20); a.cyl(X0 + 130, YB - 150, Z1 - 20, Z1 - 19, 1, 3);
    a.cyl(X0 + 200, a.cy, bz, bz + 0.1, 1, 3); a.rect(X0 + 40, by0 + 20, X1 - 40, YB - 40, 'EQUIP-DETAIL');
    a.log('Added the bunded fuel base, the louvered canopy with two service doors and swings, control window, silencer, lifting eye and the wheels with tow bar or fork pockets (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic towable site air compressor',
  desc: (v) => `Towable diesel air compressor, ${v.cfm} cfm: a louvered canopy with two service doors, a receiver tank with a gauge, two hose outlets with ball valves, an exhaust silencer, a twin-wheel running gear, a tow bar and a jockey wheel.`,
  vs: [[100, 56, 108, 62], [185, 62, 132, 70], [375, 72, 170, 84]].map(([cfm, w, d, h]) => [`${cfm} cfm`, w, d, h, 0, { cfm }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 100), YB - D * 0.38, 330, 160); const by0 = YF + 850;
    a.box(X0 + 60, by0, Z0 + 330, X1 - 60, YB - 40, Z0 + 520); tub(a, [cx, by0, Z0 + 420], [cx, YF + 80, Z0 + 470], 35, 5); a.cyl(cx, YF + 70, Z0 + 330, Z0 + 480, 60, 10); a.cyl(cx, YF + 380, Z0 + 250, Z0 + 420, 22, 6); a.box(cx - 100, YF + 330, Z0 + 200, cx + 100, YF + 430, Z0 + 260);
    a.box(X0 + 90, by0 + 20, Z0 + 520, X1 - 90, YB - 60, Z1 - 60); a.box(X0 + 70, by0 + 10, Z1 - 60, X1 - 70, YB - 50, Z1 - 10);
    for (let i = 0; i < 2; i++) { const dw = (W - 280) / 2, x0 = X0 + 140 + i * dw; for (let z = Z0 + 760; z < Z1 - 300; z += 40) a.box(x0 + 60, by0 + 10, z, x0 + dw - 60, by0 + 20, z + 14); a.arc(i ? x0 + dw : x0, by0, dw, i ? 180 : 270, i ? 270 : 360); a.box(x0 + dw - 80, by0 - 15, (Z0 + 520 + Z1) / 2 - 60, x0 + dw - 50, by0 + 10, (Z0 + 520 + Z1) / 2 + 60); }
    a.cyl(X1 - 150, by0 + 300, Z0 + 520, Z0 + 700, 150, 16); a.box(X1 - 80, a.cy + 100, Z0 + 560, X1 - 10, a.cy + 220, Z0 + 640); a.cyl(X1 - 150, by0 + 300, Z0 + 700, Z0 + 740, 40, 8);
    for (const dy of [0, 220]) { a.xcyl(X1 - 90, X1 - 8, a.cy + 160 + dy, Z0 + 600, 35, 8); }
    a.cyl(X0 + 180, YB - 220, Z1 - 10, Z1, 70, 12); a.cyl(cx, YB - 120, Z1 - 10, Z1, 5, 3); a.rect(X0 + 60, by0, X1 - 60, YB - 40, 'EQUIP-DETAIL'); a.line(cx, YF + 70, cx, by0, 'EQUIP-DETAIL');
    a.log('Added the canopy with louvers and two service doors, receiver tank with gauge, hose outlets, silencer, running gear, tow bar and jockey wheel (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site trash pump',
  desc: (v) => `Engine-driven centrifugal trash pump, ${v.dia} in ports: a tube-frame cage with lifting bar, a small engine with fuel tank, a pump volute with a suction flange and an upright discharge flange, a priming cap and a drain plug.`,
  vs: [[2, 24, 30, 26], [3, 28, 36, 30], [4, 34, 44, 36], [6, 46, 62, 48]].map(([dia, w, d, h]) => [`${dia} in`, w, d, h, 0, { dia }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const r = v.dia * IN * 0.9;
    a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 50); for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) tub(a, [x, y, Z0], [x, y, Z1 - 10], 12, 5);
    for (const y of [YF + 30, YB - 30]) tub(a, [X0 + 30, y, Z1 - 10], [X1 - 30, y, Z1 - 10], 12, 5); for (const x of [X0 + 30, X1 - 30]) tub(a, [x, YF + 30, Z1 - 10], [x, YB - 30, Z1 - 10], 12, 5);
    a.box(X0 + 70, a.cy + 20, Z0 + 50, X1 - 70, YB - 60, Z0 + 330); a.box(X0 + 90, YB - 190, Z0 + 330, X1 - 90, YB - 70, Z0 + 470); a.cyl(X1 - 140, YB - 130, Z0 + 470, Z0 + 520, 30, 8);
    a.ycyl(YF + 60, a.cy + 20, cx, Z0 + 230, r * 0.85 * 0.5 + 60, 20); a.ell(cx, YF + (a.cy - YF) * 0.5, Z0 + 230, r * 0.85 * 0.5 + 40, (a.cy - YF) * 0.35, r * 0.85 * 0.5 + 40, 16, 8);
    a.ycyl(YF + 20, YF + 80, cx, Z0 + 230, r * 0.5 + 40, 16); a.cyl(cx, YF + (a.cy - YF) * 0.55, Z0 + 230 + r * 0.4, Z1 - 80, r * 0.3 + 10, 14); a.cyl(cx, YF + (a.cy - YF) * 0.55, Z1 - 80, Z1 - 60, r * 0.5 + 20, 14);
    a.cyl(cx + r * 0.5, YF + (a.cy - YF) * 0.5, Z0 + 230 + r * 0.3, Z0 + 230 + r * 0.3 + 60, 40, 8);
    a.circ(cx, YF + (a.cy - YF) * 0.55, r * 0.3 + 10, 'EQUIP-DETAIL'); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL'); a.circ(cx, YF + 40, r * 0.5 + 40, 'EQUIP-DETAIL');
    a.log('Added the tube-frame cage, engine with fuel tank, pump volute with suction and discharge flanges, priming cap and drain plug (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic towable site light tower',
  desc: (v) => `Towable light tower, ${v.mh} ft mast raised: a trailer with four outrigger legs, a generator enclosure with a service door, a telescoping mast in sections with winch cable, a lamp frame with four floodlamps and a tow eye.`,
  vs: [[20], [26], [30]].map(([mh]) => [`${mh} ft mast`, 78, 144, mh * 12 + 30, 0, { mh }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const by0 = YF + 900; for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 100), YB - D * 0.4, 280, 130);
    a.box(X0 + 140, by0, Z0 + 380, X1 - 140, YB - 100, Z0 + 460); tub(a, [cx, by0, Z0 + 420], [cx, YF + 80, Z0 + 460], 30, 5); a.cyl(cx, YF + 70, Z0 + 360, Z0 + 470, 55, 10);
    a.box(X0 + 160, by0 + 150, Z0 + 460, X1 - 160, YB - 140, Z0 + 1300); for (let z = Z0 + 650; z < Z0 + 1200; z += 40) a.box(X0 + 200, by0 + 140, z, X1 - 200, by0 + 150, z + 14); a.box(X0 + 260, by0 + 130, Z0 + 560, cx, by0 + 150, Z0 + 1200); a.rect(X0 + 160, by0 + 150, X1 - 160, YB - 140, 'EQUIP-DETAIL');
    for (const sx of [-1, 1]) for (const y of [by0 + 100, YB - 250]) { a.box(cx + sx * (W / 2 - 40) - 25, y - 25, Z0 + 150, cx + sx * (W / 2 - 40) + 25, y + 25, Z0 + 470); a.box(cx + sx * (W / 2 - 40) - 130, y - 130, Z0, cx + sx * (W / 2 - 40) + 130, y + 130, Z0 + 40); }
    const my = (by0 + YB) / 2 + 80, mz0 = Z0 + 1300, nsec = 4, seg = (Z1 - 600 - mz0) / nsec; for (let k = 0; k < nsec; k++) a.cyl(cx, my, mz0 + k * seg, mz0 + (k + 1) * seg + 100, 90 - k * 14, 10);
    tub(a, [cx + 100, my, Z0 + 1000], [cx + 100, my, Z1 - 650], 5, 3); a.cyl(cx + 100, my, Z0 + 900, Z0 + 1000, 90, 8);
    a.box(cx - 800, my - 60, Z1 - 600, cx + 800, my + 60, Z1 - 540); for (let i = 0; i < 4; i++) { const x = cx - 600 + i * 400; a.box(x - 140, my - 150, Z1 - 540, x + 140, my + 150, Z1 - 200); a.box(x - 120, my - 170, Z1 - 520, x + 120, my - 150, Z1 - 220); }
    a.circ(cx, my, 90); for (let i = 0; i < 4; i++) a.rect(cx - 740 + i * 400, my - 150, cx - 460 + i * 400, my + 150, 'EQUIP-DETAIL');
    a.log('Added the trailer with wheels and outrigger legs, generator enclosure with louvers, telescoping mast with winch cable, the four-lamp frame and the tow eye (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site indirect-fired heater',
  desc: (v) => `Indirect-fired construction heater, ${v.kbtu} thousand BTU per hour: a cylindrical heat-exchanger shell on a frame, a burner and blower housing, a hot-air outlet with a duct collar, a flue stack, a control box with a thermostat dial, a fuel inlet and two wheels with a handle.`,
  vs: [[150, 26, 42, 34], [400, 32, 58, 42], [800, 40, 74, 54]].map(([kbtu, w, d, h]) => [`${kbtu}k BTU/h`, w, d, h, 0, { kbtu }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const r = W * 0.36, cz = Z0 + 260 + r; a.box(X0 + 30, YF + 60, Z0 + 180, X1 - 30, YB - 60, Z0 + 260); for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 40), YB - 220, 190, 60);
    a.ycyl(YF + 140, YB - 300, cx, cz, r, 22); a.ycyl(YF + 120, YF + 140, cx, cz, r * 0.92, 20);
    a.cyl(cx, YF + 130, Z0 + 260, Z0 + 261, 1, 3); a.box(cx - r * 0.7, YF + 20, cz - r * 0.6, cx + r * 0.7, YF + 140, cz + r * 0.6); a.cyl(cx, YF + 30, cz, cz + 0.01, 1, 3); for (let i = 0; i < 3; i++) a.box(cx - r * 0.6, YF + 10, cz - r * 0.4 + i * r * 0.35, cx + r * 0.6, YF + 25, cz - r * 0.4 + i * r * 0.35 + 18);
    a.box(cx - r * 0.8, YB - 300, cz - r * 0.8, cx + r * 0.8, YB - 60, cz + r * 0.8); a.cyl(cx + r * 0.2, YB - 60, Z0 + 260, Z0 + 261, 1, 3);
    a.cyl(cx, YB - 200, cz + r * 0.8, Z1 - 5, 45, 12); a.xcyl(cx + r * 0.6, X1 - 5, YB - 170, cz + r * 0.2, 55, 12);
    a.box(X0 + 40, YB - 290, cz - 100, X0 + 140, YB - 200, cz + 100); a.cyl(X0 + 90, YB - 245, cz + 100, cz + 160, 30, 8);
    tub(a, [X0 + 80, YB - 80, Z0 + 600], [X1 - 80, YB - 80, Z0 + 600], 12, 5);
    a.circ(cx, YB - 200, 45, 'EQUIP-DETAIL'); a.rect(X0 + 30, YF + 140, X1 - 30, YB - 300, 'EQUIP-DETAIL'); a.circ(cx, YF + 130, r, 'EQUIP-DETAIL');
    a.log('Added the cylindrical shell, burner and blower housing, outlet collar, flue stack, control box, wheels and the handle (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic walk-behind power trowel',
  desc: (v) => `Walk-behind power trowel, ${v.dia} in rotor: a ring guard around four trowel blades on a rotor with spokes, a gearbox, an engine with fuel tank, a lifting hook and a long handle with a grip and a speed lever.`,
  vs: [[36, 40, 76, 42], [46, 50, 90, 44]].map(([dia, w, d, h]) => [`${dia} in rotor`, w, d, h, 0, { dia }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const r = v.dia * IN / 2, cy = YF + r + 20, hub = Z0 + 180;
    const ring = []; for (let i = 0; i <= 28; i++) ring.push([cx + m.cos(i / 28 * m.PI * 2) * r, cy + m.sin(i / 28 * m.PI * 2) * r, Z0 + 140]); a.tube(ring, ring.map(() => 10), 5);
    for (let i = 0; i < 4; i++) { const g = i * m.PI / 2 + 0.4; a.tube([[cx, cy, Z0 + 40], [cx + m.cos(g) * r * 0.93, cy + m.sin(g) * r * 0.93, Z0 + 30]], [14, 14], 4); const ring2 = []; a.box(cx + m.cos(g) * r * 0.5 - 30, cy + m.sin(g) * r * 0.5 - 30, Z0 + 20, cx + m.cos(g) * r * 0.5 + 30, cy + m.sin(g) * r * 0.5 + 30, Z0 + 40); a.line(cx, cy, cx + m.cos(g) * r * 0.93, cy + m.sin(g) * r * 0.93, 'EQUIP-DETAIL'); }
    for (let i = 0; i < 6; i++) { const g = i * m.PI / 3; tub(a, [cx + m.cos(g) * r * 0.97, cy + m.sin(g) * r * 0.97, Z0 + 140], [cx, cy, hub + 120], 8, 4); }
    a.cyl(cx, cy, Z0 + 40, hub + 120, 140, 14); a.box(cx - 280, cy - 200, hub + 100, cx + 280, cy + 300, hub + 420); a.cyl(cx - 150, cy + 100, hub + 420, hub + 520, 70, 10); a.box(cx + 100, cy + 80, hub + 420, cx + 260, cy + 240, hub + 540);
    a.cyl(cx, cy, hub + 420, Z1 - 20, 25, 8); a.cyl(cx, cy, Z1 - 60, Z1 - 20, 60, 8);
    tub(a, [cx, cy + 300, hub + 300], [cx - 0, YB - 80, Z1 - 100], 22, 6); tub(a, [cx, YB - 80, Z1 - 100], [cx - 250, YB - 80, Z1 - 100], 16, 5); tub(a, [cx, YB - 80, Z1 - 100], [cx + 250, YB - 80, Z1 - 100], 16, 5); a.box(cx + 250, YB - 130, Z1 - 140, cx + 300, YB - 30, Z1 - 60);
    a.circ(cx, cy, r); a.circ(cx, cy, r * 0.97, 'EQUIP-DETAIL'); a.line(cx, cy + 300, cx, YB - 80, 'EQUIP-DETAIL'); a.circ(cx, cy, 140, 'EQUIP-DETAIL');
    a.log('Added the ring guard, four trowel blades on the rotor with spokes, gearbox, engine with fuel tank, lifting hook and the handle with grip and speed lever (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic walk-behind floor saw',
  desc: (v) => `Walk-behind concrete floor saw, ${v.bd} in blade: a frame on four wheels, a front blade guard over a blade with a flange and arbor, a depth-control wheel, an engine with fuel tank and belt guard, a water tank with feed hose, a front pointer and a handle with grips.`,
  vs: [[14, 26, 50, 38], [18, 28, 58, 42], [24, 32, 66, 46]].map(([bd, w, d, h]) => [`${bd} in blade`, w, d, h, 0, { bd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    wheelPairs(a, [YB - 450], 180, 60, 10); wheelPairs(a, [YF + 560], 150, 60, 10);
    a.box(X0 + 90, YF + 520, Z0 + 180, X1 - 90, YB - 160, Z0 + 260); const br = v.bd * IN / 2, by = YF + br + 40, bz = Z0 + br + 10;
    a.xcyl(X1 - 150, X1 - 110, by, bz, br, 28); a.rect(X1 - 150, by - br, X1 - 110, by + br, 'EQUIP-DETAIL');
    a.box(X1 - 260, by - br - 40, bz - 60, X1 - 40, by + br * 0.4, bz + br + 30); a.xcyl(X1 - 260, X1 - 40, by, bz, 50, 10);
    a.box(X0 + 90, YF + 520, Z0 + 260, X1 - 260, YB - 400, Z0 + 520); a.cyl(X0 + 180, YB - 400, Z0 + 260, Z0 + 600, 90, 12);
    a.box(X0 + 120, YB - 560, Z0 + 260, X0 + 440, YB - 200, Z0 + 520); a.box(cx - 120, YF + 520, Z0 + 520, cx + 120, YF + 760, Z0 + 700);
    a.cyl(X0 + 130, YF + 700, Z0 + 260, Z0 + 330, 70, 10); tub(a, [X0 + 130, YF + 700, Z0 + 300], [X1 - 200, YF + 240, Z0 + 330], 10, 4);
    tub(a, [cx - 150, YB - 220, Z0 + 300], [cx - 150, YB - 40, Z1 - 80], 18, 5); tub(a, [cx + 150, YB - 220, Z0 + 300], [cx + 150, YB - 40, Z1 - 80], 18, 5); tub(a, [cx - 150, YB - 40, Z1 - 80], [cx + 150, YB - 40, Z1 - 80], 20, 6);
    tub(a, [X1 - 120, by, bz + 50], [X1 - 120, YF + 5, bz], 8, 4); a.line(X1 - 130, YF + 5, X1 - 130, by, 'EQUIP-DETAIL'); a.rect(X0 + 90, YF + 520, X1 - 90, YB - 160, 'EQUIP-DETAIL');
    a.log('Added the frame on four wheels, blade and guard, depth-control wheel, engine, water tank with hose, front pointer and the handle (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic rebar bending bench',
  desc: (v) => `Powered rebar bender bench for up to #${v.no} bar: a steel-topped bench on four legs with a shelf, a rotating bending disc with a centre pin and forming pins, a gear motor housing under the top, bar support rollers, a foot pedal and a stop plate.`,
  vs: [[6, 60, 28, 34], [8, 72, 30, 36], [11, 84, 34, 38]].map(([no, w, d, h]) => [`#${no} bar`, w, d, h, 0, { no }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const zt = Z1 - 60; a.box(X0 + 20, YF + 20, zt, X1 - 20, YB - 20, Z1); for (const x of [X0 + 70, X1 - 70]) for (const y of [YF + 70, YB - 70]) a.box(x - 25, y - 25, Z0, x + 25, y + 25, zt);
    a.box(X0 + 70, YF + 70, Z0 + 180, X1 - 70, YB - 70, Z0 + 215); a.box(X0 + 100, YF + 100, Z0 + 215, X0 + 700, YB - 100, zt - 10); a.rect(X0 + 100, YF + 100, X0 + 700, YB - 100, 'EQUIP-HIDDEN');
    const dx = X0 + W * 0.7, dy = a.cy; a.cyl(dx, dy, Z1, Z1 + 0.01, 1, 3); a.cyl(dx, dy, zt - 20, Z1 - 0.1, 0.5, 3);
    a.cyl(dx, dy, Z1 - 12, Z1 - 0.2, 190 + v.no * 6, 24);
    a.cyl(dx, dy, Z1 - 12, Z1 - 5, 20, 8);
    a.circ(dx, dy, 190 + v.no * 6); for (const [px, py] of [[dx + 240, dy - 60], [dx + 240, dy + 60]]) { a.cyl(px, py, Z1 - 12, Z1 - 4, 16, 8); a.circ(px, py, 16, 'EQUIP-DETAIL'); }
    for (const x of [X0 + 250, X0 + 600]) a.xcyl(x - 25, x + 25, a.cy, Z1, 25, 10);
    a.box(X0 + 120, YF + 80, Z1 - 5, X0 + 160, YB - 80, Z1 + 0.01 + 0.5);
    a.box(X0 + 200, YF - 0.01 + 20, Z0 + 30, X0 + 400, YF + 200, Z0 + 70);
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP'); a.line(X0 + 250, dy, dx, dy, 'EQUIP-DETAIL');
    a.log('Added the steel-topped bench with legs and shelf, the bending disc with centre and forming pins, motor housing, bar rollers and the foot pedal (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site mortar mixer',
  desc: (v) => `Horizontal paddle mortar mixer, ${v.cf} cubic foot: an open U-shaped trough with a grated hopper cover, a paddle shaft with arms, a tilt handwheel and gearbox, a drive engine with guard, a discharge lever and a frame on two wheels and a stand.`,
  vs: [[6, 40, 60, 38], [9, 44, 72, 42], [12, 48, 84, 46]].map(([cf, w, d, h]) => [`${cf} cu ft`, w, d, h, 0, { cf }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 80), YB - D * 0.3, 220, 90);
    a.box(X0 + 90, YF + 150, Z0 + 330, X1 - 90, YB - 100, Z0 + 390); for (const x of [X0 + 120, X1 - 120]) a.box(x - 25, YF + 160, Z0, x + 25, YF + 210, Z0 + 330);
    const tl = YF + 220, tr = YB - 600, tz = Z0 + 390;
    a.prism([[X0 + 80, tl], [X1 - 80, tl], [X1 - 120, tr], [X0 + 120, tr]], tz, tz + 90 + (Z1 - Z0) * 0.02); a.box(X0 + 70, tl, tz + 90, X0 + 110, tr, Z1 - 250); a.box(X1 - 110, tl, tz + 90, X1 - 70, tr, Z1 - 250); a.box(X0 + 70, tl, tz + 90, X1 - 70, tl + 40, Z1 - 250); a.box(X0 + 70, tr - 40, tz + 90, X1 - 70, tr, Z1 - 250);
    for (let i = 0; i < 5; i++) { const y = tl + 60 + i * ((tr - tl - 120) / 4); a.box(X0 + 90, y - 8, Z1 - 260, X1 - 90, y + 8, Z1 - 230); }
    a.xcyl(X0 + 60, X1 - 60, (tl + tr) / 2, tz + 450, 30, 10); for (let i = 0; i < 3; i++) tub(a, [cx - 200 + i * 200, (tl + tr) / 2, tz + 450], [cx - 200 + i * 200, (tl + tr) / 2 + 150, tz + 250], 14, 4);
    a.box(X1 - 60, tl + 50, tz + 300, X1 + 0, tl + 250, tz + 600 - 0.01); a.cyl(X0 + 60, (tl + tr) / 2, tz + 450, tz + 450.1, 1, 3);
    a.box(X0 + 130, tr + 40, tz, X1 - 130, YB - 150, tz + 480); a.cyl(X1 - 200, YB - 330, tz + 480, tz + 540, 90, 10);
    a.cyl(cx, YF + 80, Z0 + 150, Z0 + 330, 25, 6); a.box(cx - 90, YF + 30, Z0, cx + 90, YF + 130, Z0 + 50);
    a.rect(X0 + 80, tl, X1 - 80, tr, 'EQUIP-DETAIL'); a.rect(X0 + 130, tr + 40, X1 - 130, YB - 150, 'EQUIP-DETAIL');
    a.log('Added the U-shaped trough with grated cover, paddle shaft with arms, handwheel, engine with guard, discharge lever, wheels and the stand (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site wheelbarrow',
  desc: (v) => `${v.cf} cubic foot site wheelbarrow: a pressed steel tray with a rolled rim and a front lip, a ${v.two ? 'two-wheel front axle' : 'single pneumatic wheel on a fork'}, two tubular handles with grips, a frame brace and two standing legs.`,
  vs: [[4, 0, 24, 66, 26], [6, 0, 26, 70, 28], [8, 1, 30, 72, 30]].map(([cf, two, w, d, h]) => [`${cf} cu ft${two ? ', two wheel' : ''}`, w, d, h, 0, { cf, two }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const tr = 330 + v.cf * 25, tz = Z0 + 250, ty0 = YF + 350, ty1 = YB - 700;
    a.prism([[cx - W * 0.4, ty0], [cx + W * 0.4, ty0], [cx + W * 0.28, ty1], [cx - W * 0.28, ty1]], tz + 120, tz + 160); a.box(cx - W * 0.4, ty0, tz + 120, cx - W * 0.38, ty1, tz + 330); a.box(cx + W * 0.38, ty0, tz + 120, cx + W * 0.4, ty1, tz + 330);
    a.prism([[cx - W * 0.4, ty0], [cx + W * 0.4, ty0], [cx + W * 0.4 - 10, ty0 + 20], [cx - W * 0.4 + 10, ty0 + 20]], tz + 120, tz + 330); a.prism([[cx - W * 0.28, ty1 - 20], [cx + W * 0.28, ty1 - 20], [cx + W * 0.3, ty1], [cx - W * 0.3, ty1]], tz + 120, tz + 330);
    for (const sx of [-1, 1]) { tub(a, [cx + sx * W * 0.3, ty0 + 200, tz + 100], [cx + sx * W * 0.28, YB - 60, Z0 + 320], 14, 5); a.box(cx + sx * W * 0.28 - 35, YB - 160, Z0 + 270, cx + sx * W * 0.28 + 35, YB - 30, Z0 + 340); }
    for (const sx of v.two ? [-1, 1] : [0]) { const x = cx + sx * 90; a.xcyl(x - 40, x + 40, YF + 160, Z0 + 190, 190, 16); a.rect(x - 40, YF - 30, x + 40, YF + 350, 'EQUIP-DETAIL'); tub(a, [x + (sx === 0 ? -90 : 0), YF + 160, Z0 + 190], [cx + sx * W * 0.2, ty0 + 50, tz + 110], 15, 4); }
    if (!v.two) tub(a, [cx + 90, YF + 160, Z0 + 190], [cx + W * 0.2, ty0 + 50, tz + 110], 15, 4);
    for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.28 - 12, YB - 650, Z0, cx + sx * W * 0.28 + 12, YB - 610, tz + 100); }
    a.rect(cx - W * 0.4, ty0, cx + W * 0.4, ty1, 'EQUIP'); for (const sx of [-1, 1]) a.line(cx + sx * W * 0.3, ty1, cx + sx * W * 0.28, YB - 60, 'EQUIP-DETAIL');
    a.log('Added the pressed steel tray with rim and lip, the wheel or wheels on the front axle, handles with grips, frame brace and the two standing legs (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site dehumidifier',
  desc: (v) => `Portable construction dehumidifier, ${v.pt} pint per day: a boxy housing with a front intake grille, a top carry handle, a control panel with a display and buttons, a drain hose outlet, a hinged side door over the filter and small castors.`,
  vs: [[70, 18, 14, 25], [125, 20, 16, 30], [210, 26, 20, 40]].map(([pt, w, d, h]) => [`${pt} pint`, w, d, h, 0, { pt }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const cz = Z0 + 90; a.box(X0 + 10, YF + 10, cz, X1 - 10, YB - 10, Z1 - 20); a.box(X0 + 5, YF + 5, Z1 - 30, X1 - 5, YB - 5, Z1 - 5);
    for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) a.caster(x, y, 90);
    for (let z = cz + 120; z < Z1 - 200; z += 36) a.box(X0 + 50, YF - 6, z, X1 - 50, YF + 10, z + 14);
    a.box(X0 + 50, YF - 12, Z1 - 190, X1 - 50, YF + 10, Z1 - 60); a.box(X0 + 70, YF - 18, Z1 - 170, cx - 20, YF - 12, Z1 - 120); for (let i = 0; i < 4; i++) a.cyl(cx + 40 + i * (W * 0.1), YF - 12, Z1 - 140, Z1 - 139, 1, 3), a.box(cx + 20 + i * (W * 0.1), YF - 22, Z1 - 150, cx + 60 + i * (W * 0.1), YF - 12, Z1 - 110);
    tub(a, [X0 + 100, a.cy, Z1 - 20], [X1 - 100, a.cy, Z1 - 20], 12, 5); tub(a, [X0 + 100, a.cy, Z1 - 20], [X0 + 100, a.cy, Z1 - 5], 12, 5); tub(a, [X1 - 100, a.cy, Z1 - 20], [X1 - 100, a.cy, Z1 - 5], 12, 5);
    a.xcyl(X1 - 10, X1 + 0.01, YB - 100, cz + 100, 12, 6); a.box(X1 - 14, YB - 200, cz + 150, X1, YB - 60, Z1 - 120);
    a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP'); a.line(X0 + 10, YF + 50, X1 - 10, YF + 50, 'EQUIP-DETAIL');
    a.log('Added the housing with intake grille, control panel and display, carry handle, drain outlet, filter door and castors (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic remote demolition machine',
  desc: (v) => `Remote-controlled demolition machine, ${v.t} ton class: two rubber tracks with a body between, four outrigger legs with pads, a rotating turret, a three-part arm with rams and a hydraulic breaker at the tip, a hose bundle and a control receiver box.`,
  vs: [[0.5, 28, 66, 50], [1, 34, 92, 60], [2, 44, 118, 76]].map(([t, w, d, h]) => [`${t} ton class`, w, d, h, 0, { t }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const tw = W * 0.2, ty0 = YB - 1500 - v.t * 400, th = 260 + v.t * 80;
    for (const sx of [-1, 1]) trackRun(a, cx + sx * (W / 2 - tw / 2 - 20), ty0, YB - 40, tw, th);
    a.box(X0 + tw + 30, ty0 + 100, Z0 + th * 0.4, X1 - tw - 30, YB - 140, Z0 + th + 100); const tz = Z0 + th + 100;
    for (const sx of [-1, 1]) for (const y of [ty0 + 300, YB - 400]) { tub(a, [cx + sx * (W / 2 - tw - 60), y, tz - 100], [cx + sx * (W / 2 - 40), y, Z0 + 150], 28, 5); a.box(cx + sx * (W / 2 - 40) - 90, y - 90, Z0, cx + sx * (W / 2 - 40) + 90, y + 90, Z0 + 40); a.rect(cx + sx * (W / 2 - 40) - 90, y - 90, cx + sx * (W / 2 - 40) + 90, y + 90, 'EQUIP-DETAIL'); }
    a.cyl(cx, YB - 800, tz, tz + 100, 280 + v.t * 40, 16); a.box(cx - 280 - v.t * 30, YB - 1100 - v.t * 150, tz + 100, cx + 280 + v.t * 30, YB - 160, tz + 500 + v.t * 120);
    const bx = [cx, YB - 1100 - v.t * 150, tz + 400 + v.t * 80], elb = [cx, YF + (YB - YF) * 0.36, Z1 - 250], tip = [cx, YF + 120, tz + 100];
    tub(a, bx, elb, 60 + v.t * 14, 6); tub(a, elb, [cx, YF + 280, elb[2] - 100], 50 + v.t * 10, 6); tub(a, [cx, YF + 280, elb[2] - 100], tip, 42 + v.t * 8, 6); a.box(cx - 90, YF + 40, tz + 20, cx + 90, YF + 260, tz + 160 + 0.01);
    ram(a, [cx, YB - 1000, tz + 450], [cx, elb[1] + 300, elb[2] - 60], 36); ram(a, [cx + 90, elb[1] - 80, elb[2] + 20], [cx + 90, YF + 600, elb[2] - 150], 28);
    a.box(X1 - tw - 150, YB - 480, tz + 100, X1 - tw - 30, YB - 300, tz + 300); a.rect(X0 + tw + 30, ty0 + 100, X1 - tw - 30, YB - 140, 'EQUIP-DETAIL'); a.line(cx, YB - 1100, cx, YF + 120, 'EQUIP-DETAIL');
    a.log('Added the two rubber tracks, body, four outrigger legs with pads, turret, three-part arm with rams, hydraulic breaker tip and the receiver box (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site masonry table saw',
  desc: (v) => `Wet masonry table saw, ${v.bd} in blade: a folding steel stand with four legs and cross braces, a water tray with a slide table and a rip fence, a blade with a guard and spray nozzle, and a motor housing under the tray.`,
  vs: [[10, 40, 30, 36], [14, 48, 34, 38], [18, 56, 36, 40]].map(([bd, w, d, h]) => [`${bd} in blade`, w, d, h, 0, { bd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const zt = Z0 + (Z1 - Z0) * 0.62; for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 70, YB - 70]) tub(a, [x, y, Z0], [x, y, zt], 16, 5);
    for (const y of [YF + 70, YB - 70]) { tub(a, [X0 + 60, y, zt - 100], [X1 - 60, y, zt - 100], 12, 4); tub(a, [X0 + 60, y, Z0 + 20], [X1 - 60, y, Z0 + 20], 12, 4); tub(a, [X0 + 60, y, Z0 + 20], [X1 - 60, y, zt - 100], 10, 4); }
    for (const x of [X0 + 60, X1 - 60]) tub(a, [x, YF + 70, Z0 + 20], [x, YB - 70, Z0 + 20], 12, 4);
    a.box(X0 + 20, YF + 20, zt, X1 - 20, YB - 20, zt + 120); a.box(X0 + 20, YF + 20, zt + 120, X1 - 20, YF + 50, zt + 190); a.box(X0 + 20, YB - 50, zt + 120, X1 - 20, YB - 20, zt + 190);
    a.box(cx - 200, YF + 40, zt + 120, cx + 200, YB - 40, zt + 135); a.box(cx - 180, YF + 40, zt + 135, cx + 180, YF + 70, zt + 150);
    const br = v.bd * IN / 2; a.xcyl(cx - 12, cx + 12, a.cy, zt + 50 + br * 0.45, br, 28); a.box(cx - 60, a.cy - br - 30, zt + 120, cx + 60, a.cy + br + 30, Z1 - 20); a.box(cx - 70, a.cy - br - 40, Z1 - 80, cx + 70, a.cy + br + 40, Z1 - 20);
    a.box(X0 + 120, YF + 80, zt + 190, X0 + 160, YB - 80, zt + 330); a.box(X0 + 120, YF + 80, zt + 190, cx - 80, YF + 120, zt + 230); a.box(cx + W * 0.1, YB - 160, zt - 200, X1 - 120, YB - 60, zt - 20); a.cyl(cx + W * 0.28, YB - 110, zt - 200, zt - 150, 90, 10);
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP'); a.line(cx, YF + 40, cx, YB - 40, 'EQUIP-DETAIL'); a.rect(cx - 200, YF + 40, cx + 200, YB - 40, 'EQUIP-DETAIL');
    a.log('Added the folding stand with braces, water tray, slide table, rip fence, blade with guard and spray nozzle, and the motor housing (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic core drill rig on column stand',
  desc: (v) => `Core drilling rig for a ${v.bit} in bit: a heavy base plate with four levelling screws and a vacuum port, a rigid column, a rack-and-pinion carriage with a feed handle, a drill motor with a water swivel and a hollow core bit.`,
  vs: [[4, 44, 18, 16], [8, 52, 20, 18], [12, 64, 24, 22]].map(([bit, h, w, d]) => [`${bit} in bit`, w, d, h, 0, { bit }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const cy = a.cy; a.box(X0 + 10, YF + 10, Z0 + 40, X1 - 10, YB - 10, Z0 + 100); for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { a.cyl(x, y, Z0, Z0 + 60, 14, 6); }
    a.cyl(X1 - 60, YB - 60, Z0 + 100, Z0 + 150, 20, 8); const px = cx - W * 0.22;
    a.box(px - 30, YB - 120, Z0 + 100, px + 30, YB - 60, Z1 - 10); a.box(px - 40, YB - 130, Z1 - 40, px + 40, YB - 50, Z1);
    a.box(px - 90, YB - 280, Z0 + 700, px + 190, YB - 100, Z0 + 1000);
    const mz = Z0 + 760, mz1 = Z0 + (Z1 - Z0) * 0.78; a.box(px - 80, YB - 360, mz, px + 180, YB - 100, mz1);
    const bx = px + 50, by = YB - 400, br = v.bit * IN / 2; a.cyl(bx, by, mz - 300, mz, 40, 10); a.cyl(bx, by, Z0 + 100, mz - 300, br, 20); a.cyl(bx, by, Z0 + 110, mz - 300, br - 6, 20);
    a.box(px - 120, YB - 40, Z0 + 500, px - 30, YB + 0.01 - 20, Z1 - 100); a.xcyl(px + 180, px + 330, YB - 220, mz + 150, 15, 8); a.cyl(px + 330, YB - 220, mz + 70, mz + 230, 26, 8);
    a.circ(bx, by, br); a.circ(bx, by, br - 6, 'EQUIP-DETAIL'); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP'); a.rect(px - 30, YB - 120, px + 30, YB - 60, 'EQUIP-DETAIL');
    a.log('Added the base plate with levelling screws and vacuum port, the column, the carriage with feed handle, drill motor with water swivel and the hollow core bit (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic concrete vibrator set on a cart',
  desc: (v) => `Concrete poker vibrator set, ${v.hd} in head: a drive motor in a tube-frame cart with two wheels, a flexible shaft in a coil, a steel poker head with a rubber-handled grip and a handle bar with a switch.`,
  vs: [[1.5, 24, 40, 30], [2, 24, 44, 32], [3, 28, 54, 36]].map(([hd, w, d, h]) => [`${hd} in head`, w, d, h, 0, { hd }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    for (const sx of [-1, 1]) whl(a, cx + sx * (W / 2 - 60), YB - 250, 150, 50); const zc = Z0 + 250;
    a.box(X0 + 60, YB - 700, zc, X1 - 60, YB - 150, zc + 360); a.cyl(cx, YB - 420, zc + 360, zc + 440, 90, 12); for (let z = zc + 80; z < zc + 300; z += 40) a.box(X0 + 90, YB - 710, z, X1 - 90, YB - 700, z + 14);
    for (const sx of [-1, 1]) { tub(a, [cx + sx * (W / 2 - 100), YB - 150, zc], [cx + sx * (W / 2 - 100), YB - 40, Z1 - 100], 14, 5); a.box(cx + sx * (W / 2 - 100) - 12, YB - 700, Z0 + 20, cx + sx * (W / 2 - 100) + 12, YB - 150, zc); }
    tub(a, [cx - (W / 2 - 100), YB - 40, Z1 - 100], [cx + (W / 2 - 100), YB - 40, Z1 - 100], 16, 5); a.box(cx - 50, YB - 80, Z1 - 160, cx + 50, YB - 10, Z1 - 80);
    const coil = []; for (let i = 0; i <= 40; i++) { const g = i / 40 * m.PI * 6; coil.push([cx + m.cos(g) * (W * 0.28), YF + 500 + (YB - 900 - YF - 500) * (i / 40) + m.sin(g) * 70, zc + 40 + i * 4 + m.sin(g) * 20]); } a.tube(coil, coil.map(() => 12), 4);
    a.tube([[cx, YB - 700, zc + 140], [cx, YF + 700, Z0 + 120], [cx, YF + 220, Z0 + 60]], [14, 14, 14], 6); a.cyl(cx, YF + 150, Z0 + 20, Z0 + 130, 18 + v.hd * 7, 12); a.cyl(cx, YF + 200, Z0 + 20, Z0 + 700, 14, 8); a.cyl(cx, YF + 200, Z0 + 500, Z0 + 700, 22, 8);
    a.circ(cx, YF + 150, 18 + v.hd * 7, 'EQUIP-DETAIL'); a.rect(X0 + 60, YB - 700, X1 - 60, YB - 150, 'EQUIP-DETAIL'); a.line(cx, YB - 700, cx, YF + 150, 'EQUIP-DETAIL');
    a.log('Added the motor in a tube-frame cart on two wheels, the coiled flexible shaft, the poker head with its grip and the handle bar with switch (plan and 3D).');
  } }),

fam({ cat: 'construction/tools', title: 'Generic site lifting gantry with chain hoist',
  desc: (v) => `Portable A-frame lifting gantry, ${v.t} ton: a horizontal beam of ${v.sp} ft span on two A-frame legs with cross ties, swivel castors with brakes, a push-through trolley carrying a chain hoist and a hook with a safety latch.`,
  vs: [[1, 8, 9], [3, 10, 10.5], [5, 12, 12]].map(([t, sp, h]) => [`${t} ton, ${sp} ft span`, sp * 12 + 14, 50, h * 12, 0, { t, sp }]),
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
    const cy = a.cy, zb = Z1 - 200, tw = 120 + v.t * 20;
    for (const x of [X0 + 120, X1 - 120]) { for (const sy of [-1, 1]) { tub(a, [x, cy + sy * (D / 2 - 160), Z0 + 200], [x, cy, zb], 28, 6); } tub(a, [x, cy - (D / 2 - 160) * 0.5, Z0 + 600], [x, cy + (D / 2 - 160) * 0.5, Z0 + 600], 18, 5); a.box(x - 60, cy - D / 2 + 90, Z0 + 180, x + 60, cy + D / 2 - 90, Z0 + 220); for (const sy of [-1, 1]) a.caster(x, cy + sy * (D / 2 - 120), 200); a.rect(x - 60, cy - D / 2 + 90, x + 60, cy + D / 2 - 90, 'EQUIP-DETAIL'); }
    a.box(X0 + 60, cy - tw / 2, zb, X1 - 60, cy + tw / 2, zb + 160); a.box(X0 + 60, cy - 15, zb + 160, X1 - 60, cy + 15, zb + 180);
    const tx = cx + W * 0.1; a.box(tx - 200, cy - tw / 2 - 30, zb - 80, tx + 200, cy + tw / 2 + 30, zb); a.box(tx - 150, cy - 90, zb - 400, tx + 150, cy + 90, zb - 80); tub(a, [tx, cy, zb - 400], [tx, cy, zb - 700], 8, 4); a.box(tx - 60, cy - 40, zb - 880, tx + 60, cy + 40, zb - 700); a.cyl(tx, cy, zb - 1050, zb - 880, 25, 8);
    a.line(X0 + 120, cy, X1 - 120, cy, 'EQUIP-DETAIL'); a.circ(tx, cy, 40, 'EQUIP-DETAIL');
    a.log('Added the A-frame legs with cross ties, base frames with castors, the beam, the trolley with chain hoist and the hook with its latch (plan and 3D).');
  } }),
];
