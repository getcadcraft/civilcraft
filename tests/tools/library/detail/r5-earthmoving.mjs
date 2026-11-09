/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, earthmoving: excavators, loaders and dozers, haulage, compaction and paving, attachments. Original geometry; machines by type and size class, never a maker. Sizes are transport sizes in inches. */
import { fam } from './r4-kit.mjs';

const m = Math, PI = m.PI;

// ------------------------------------------------------------------------------------------------ shared drawing helpers (mm, z up, front at -Y)
/** extrude a convex outline given as [y, z] points between x0 and x1 */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a tyre on a lateral axle at (x, y), radius r, width w; zc = axle height (default: resting on the floor) */
function tyre(a, x, y, r, w, zc) {
  zc = zc ?? a.Z0 + r;
  a.xcyl(x - w / 2, x + w / 2, y, zc, r, 20); a.xcyl(x - w / 2 - 6, x + w / 2 + 6, y, zc, r * 0.5, 12);
  a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL');
}
/** a crawler track along y from y0 (front) to y1, height h, width w, centred on xc, sitting at zb */
function track(a, xc, w, y0, y1, h, zb) {
  const x0 = xc - w / 2, x1 = xc + w / 2;
  prismX(a, [[y0, zb + h * 0.35], [y0 + h * 0.3, zb], [y1 - h * 0.3, zb], [y1, zb + h * 0.3], [y1 - h * 0.22, zb + h], [y0 + h * 0.22, zb + h * 0.92]], x0, x1);
  const n = m.max(2, m.round((y1 - y0) / (h * 1.1)));
  for (let i = 1; i < n; i++) a.xcyl(x0 - 4, x1 + 4, y0 + ((y1 - y0) * i) / n, zb + h * 0.2, h * 0.13, 8);
  a.xcyl(x0 - 8, x1 + 8, y0 + h * 0.3, zb + h * 0.5, h * 0.3, 12); a.xcyl(x0 - 8, x1 + 8, y1 - h * 0.3, zb + h * 0.5, h * 0.26, 12);
  a.rect(x0, y0, x1, y1);
  for (let y = y0 + h * 0.5; y < y1 - h * 0.4; y += h * 0.45) a.line(x0, y, x1, y, 'EQUIP-DETAIL');
}
/** a scoop bucket opening forward (−Y): lip at (yl, zl), body behind it. bw width, bd depth, bh height, nt teeth */
function scoop(a, cx, yl, zl, bw, bd, bh, nt = 0, ls = 1) {
  prismX(a, [[yl, zl], [yl + bd * 0.9, zl + bh * 0.1], [yl + bd, zl + bh], [yl + bd * 0.12, zl + bh * 0.7]], cx - bw / 2, cx + bw / 2);
  a.box(cx - bw / 2, yl - 14, zl - 6, cx + bw / 2, yl + bd * 0.1, zl + bh * 0.08);
  for (let i = 0; i < nt; i++) { const x = cx - bw / 2 + (bw * (i + 0.5)) / nt; a.prism([[x - bw / (nt * 4), yl - 70 * ls], [x + bw / (nt * 4), yl - 70 * ls], [x + bw / (nt * 3), yl + 8], [x - bw / (nt * 3), yl + 8]], zl - 8, zl + bh * 0.1); }
  a.rect(cx - bw / 2, yl - 14, cx + bw / 2, yl + bd); a.line(cx - bw / 2, yl + bd * 0.3, cx + bw / 2, yl + bd * 0.3, 'EQUIP-DETAIL');
}
/** an enclosed cab: box, window frames on the front and sides, roof overhang and a wiper */
function cabin(a, x0, x1, y0, y1, z0, z1, glass = true) {
  a.box(x0, y0, z0, x1, y1, z1);
  if (glass) {
    a.frame(x0 + 25, z0 + (z1 - z0) * 0.2, x1 - 25, z1 - (z1 - z0) * 0.08, y0 - 10, y0 + 2, 30);
    for (const sx of [x0 - 10, x1 + 2]) a.box(sx, y0 + (y1 - y0) * 0.1, z0 + (z1 - z0) * 0.25, sx + 8, y1 - (y1 - y0) * 0.1, z1 - (z1 - z0) * 0.15);
  }
  a.box(x0 - 20, y0 - 25, z1, x1 + 20, y1 + 10, z1 + 25);
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** an open ROPS frame: four posts and a roof */
function rops(a, x0, x1, y0, y1, z0, z1) {
  for (const x of [x0, x1]) for (const y of [y0, y1]) a.tube([[x, y, z0], [x, y, z1]], [14, 14], 6);
  a.box(x0 - 15, y0 - 15, z1, x1 + 15, y1 + 15, z1 + 22); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** a hydraulic cylinder between two points (barrel and rod) */
function hyd(a, p, q, r) {
  const mid = [p[0] + (q[0] - p[0]) * 0.55, p[1] + (q[1] - p[1]) * 0.55, p[2] + (q[2] - p[2]) * 0.55];
  a.tube([p, mid], [r, r], 8); a.tube([mid, q], [r * 0.55, r * 0.55], 6);
}
/** a ladder on the side of a machine: two rails and rungs */
function ladder(a, x, y0, y1, z0, z1, wd = 360) {
  a.tube([[x, y0, z0], [x, y0, z1]], [12, 12], 5); a.tube([[x + wd, y0, z0], [x + wd, y0, z1]], [12, 12], 5);
  const n = m.max(3, m.round((z1 - z0) / 300)); for (let i = 1; i < n; i++) a.xcyl(x, x + wd, y0, z0 + ((z1 - z0) * i) / n, 8, 5);
}
/** warning beacon and work lights */
function lamps(a, cx, y, z, w) { a.cyl(cx, y, z, z + 110, 55, 10); for (const sx of [-1, 1]) a.box(cx + sx * w - 70, y - 20, z - 30, cx + sx * w + 70, y + 20, z + 50); }

// ------------------------------------------------------------------------------------------------ excavators
/** A hydraulic excavator in transport posture. o: wheeled, zt (zero tail), blade, lt (track length fraction), hr (high reach), lr (long reach), bw (bucket width), two (two-piece boom), nt (teeth), jaw */
function excav(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a;
  a.outline();
  const wheeled = !!o.wheeled;
  const rW = H * 0.17, th = wheeled ? rW * 1.5 : H * (o.th ?? 0.27), tw = W * (o.tw ?? 0.22);
  const yT1 = -D * 0.05, yT0 = yT1 - D * (o.lt ?? 0.4), hz0 = Z0 + th;
  const hh = H * 0.27, hw = W * 0.42, y0h = -D * 0.36;
  // undercarriage
  if (!wheeled) {
    for (const sx of [-1, 1]) track(a, cx + sx * (W / 2 - tw / 2), tw, yT0, yT1, th, Z0);
    a.box(X0 + tw, yT0 + th, Z0 + th * 0.25, X1 - tw, yT1 - th * 0.4, hz0);
  } else {
    a.box(X0 + W * 0.2, yT0 + rW, Z0 + rW * 0.9, X1 - W * 0.2, yT1 - rW * 0.6, hz0);
    for (const y of [yT0 + rW * 1.1, yT1 - rW * 1.2]) { a.xcyl(X0 + W * 0.12, X1 - W * 0.12, y, Z0 + rW, rW * 0.2, 10); for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - W * 0.1), y, rW, W * 0.2); }
    if (o.outrig) for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - W * 0.04) - 90, yT1 - 140, Z0, cx + sx * (W / 2 - W * 0.04) + 90, yT1 + 60, hz0 - rW * 0.3); a.rect(cx + sx * (W / 2 - W * 0.04) - 90, yT1 - 140, cx + sx * (W / 2 - W * 0.04) + 90, yT1 + 60, 'EQUIP-DETAIL'); }
  }
  if (o.blade) { const bx = o.blade; a.box(X0 + 10, yT0 - bx * 0.9, Z0, X1 - 10, yT0 - bx * 0.15, Z0 + th * 1.05); for (const sx of [-1, 1]) a.box(cx + sx * W * 0.28 - 25, yT0 - bx * 0.2, Z0 + th * 0.3, cx + sx * W * 0.28 + 25, yT0 + th * 0.8, Z0 + th * 0.7); a.rect(X0 + 10, yT0 - bx * 0.9, X1 - 10, yT0 - bx * 0.15, 'EQUIP-DETAIL'); }
  // house
  a.cyl(cx, -D * 0.16, hz0 - th * 0.12, hz0, m.min(W * 0.34, D * 0.14), 18); a.circ(cx, -D * 0.16, m.min(W * 0.34, D * 0.14), 'EQUIP-DETAIL');
  if (o.zt) {
    const R = m.min(W * 0.46, D * 0.2); a.cyl(cx, -D * 0.2, hz0, hz0 + hh * 0.9, R, 22); a.circ(cx, -D * 0.2, R, 'EQUIP-DETAIL');
    a.ell(cx, -D * 0.14, hz0 + hh * 0.5, R * 0.95, R * 0.9, hh * 0.45, 16, 8);
  } else {
    a.box(cx - hw, -D * 0.1, hz0, cx + hw, YF * 0 - 4 + 0, hz0 + hh * 0.95);                 // counterweight
    a.ell(cx, -D * 0.05, hz0 + hh * 0.5, hw * 0.98, D * 0.06, hh * 0.45, 14, 8);
    a.box(cx - hw, y0h, hz0, cx + hw, -D * 0.1, hz0 + hh * 0.62);                              // engine hood
    for (let i = 0; i < 4; i++) a.box(cx + hw * 0.1 + i * hw * 0.2, -D * 0.2, hz0 + hh * 0.62, cx + hw * 0.1 + i * hw * 0.2 + hw * 0.1, -D * 0.12, hz0 + hh * 0.7);
    a.rect(cx - hw, y0h, cx + hw, 0, 'EQUIP-DETAIL'); a.line(cx - hw, -D * 0.1, cx + hw, -D * 0.1, 'EQUIP-DETAIL');
  }
  a.cyl(cx + W * 0.3, -D * 0.12, hz0 + hh * 0.6, hz0 + hh * 1.35, m.max(18, W * 0.015), 8);
  // cab on the left, with a guard
  const cL = cx - hw, cR = cx - hw * 0.08, cY0 = y0h, cY1 = y0h + D * 0.17, cZ1 = hz0 + hh * (o.hr ? 1.6 : 1.4);
  cabin(a, cL, cR, cY0, cY1, hz0 + hh * 0.05, cZ1);
  if (o.guard) for (const x of [cL, cR]) { a.tube([[x, cY0 - 20, hz0 + hh * 0.7], [x, cY0 - 20, cZ1 + 30]], [10, 10], 5); }
  // boom, stick, cylinders
  const bx = cx + W * 0.06, rb = H * (o.lr ? 0.032 : 0.042);
  const foot = [bx, y0h + D * 0.02, hz0 + hh * 0.45];
  let kn, sEnd;
  if (o.hr) {
    const p1 = [bx, -D * 0.46, Z0 + H * 0.55], p2 = [bx, -D * 0.55, Z1 - rb * 2];
    a.tube([foot, p1, p2], [rb * 1.2, rb * 1.3, rb], 10); kn = p2; sEnd = [bx, -D * 0.78, Z0 + H * 0.78];
    a.tube([kn, [bx, -D * 0.68, Z0 + H * 0.93], sEnd], [rb * 0.9, rb * 0.8, rb * 0.6], 8);
    for (const sx of [-1, 1]) hyd(a, [bx + sx * rb * 2.4, y0h + D * 0.04, hz0 + hh * 0.8], [bx + sx * rb * 1.5, -D * 0.43, Z0 + H * 0.5], rb * 0.5);
    const jx = bx, jy = sEnd[1] - D * 0.04;
    prismX(a, [[jy + 90, sEnd[2] + 160], [jy - 280, sEnd[2] - 20], [jy - 380, sEnd[2] - 520], [jy + 20, sEnd[2] - 500]], jx - W * 0.05, jx + W * 0.05);
    a.box(jx - W * 0.05, jy - 520, sEnd[2] - 680, jx + W * 0.05, jy - 220, sEnd[2] - 440);
    a.rect(jx - W * 0.05, jy - 520, jx + W * 0.05, jy + 90);
  } else {
    const kY = o.lr ? -D * 0.5 : -D * 0.56;
    kn = [bx, kY, Z1 - rb * 1.4];
    const mid = [bx, (foot[1] + kY) / 2, (foot[2] + kn[2]) / 2 + H * 0.06];
    const pts = o.two ? [foot, mid, [bx, kY + D * 0.04, Z1 - rb * 3.2], kn] : [foot, mid, kn];
    a.tube(pts, o.two ? [rb * 1.2, rb * 1.3, rb * 1.1, rb * 0.9] : [rb * 1.2, rb * 1.3, rb * 0.9], 10);
    sEnd = [bx, o.lr ? -D * 0.93 : -D * 0.86, Z0 + H * (o.lr ? 0.2 : 0.3)];
    a.tube([kn, sEnd], [rb * 0.9, rb * 0.6], 8);
    for (const sx of [-1, 1]) hyd(a, [bx + sx * rb * 2.3, y0h + D * 0.04, hz0 + hh * 0.8], [bx + sx * rb * 1.5, mid[1] - D * 0.02, mid[2] - rb * 0.2], rb * 0.52);
    hyd(a, [bx, mid[1] + D * 0.02, mid[2] + rb * 1.6], [bx, kY - D * 0.06, kn[2] - rb * 0.4], rb * 0.5);
    hyd(a, [bx, kY - D * 0.08, kn[2] + rb * 0.6], [bx, sEnd[1] + D * 0.03, sEnd[2] + H * 0.08], rb * 0.42);
    const bw = o.bw ?? W * 0.38, bd = D * (o.lr ? 0.05 : 0.09), bh = H * (o.lr ? 0.12 : 0.2);
    scoop(a, bx, YF + D * 0.01, Z0 + H * 0.06, bw, bd, bh, o.nt ?? m.max(2, m.round(bw / 340)));
    a.tube([[bx, sEnd[1], sEnd[2]], [bx, YF + D * 0.04, Z0 + H * 0.12 + bh * 0.4]], [rb * 0.5, rb * 0.5], 6);
    a.line(bx, kn[1], bx, sEnd[1], 'EQUIP-DETAIL');
  }
  a.circ(bx, y0h, rb, 'EQUIP-DETAIL');
  a.log('Added the tracks or wheels, upper structure, cab, counterweight, boom, stick, cylinders and bucket (plan and 3D).');
}
const exDesc = (v) => `${v.wheeled ? 'Wheeled' : v.zt ? 'Zero tail swing crawler' : v.hr ? 'High reach demolition' : v.lr ? 'Long reach crawler' : 'Crawler'} excavator, ${v.label.split(',')[0]}, in transport posture: ${v.wheeled ? 'axles and tyres' : 'tracks'}, upper structure, cab, counterweight, boom and stick with cylinders${v.hr ? ' and a jaw' : ' and a bucket'}.`;

const EXC = [
  fam({ cat: 'earthmoving/excavators', title: 'Generic crawler excavator', desc: exDesc, build: (a, v) => excav(a, v),
    vs: [['1.5 ton class, mini, with dozer blade', 39, 130, 90, 0, { blade: 150, lt: 0.34, tw: 0.2 }],
      ['3 ton class, mini, with dozer blade', 59, 165, 98, 0, { blade: 190, lt: 0.36, tw: 0.2 }],
      ['5 ton class, with dozer blade', 63, 200, 102, 0, { blade: 200, lt: 0.38 }],
      ['8 ton class, with dozer blade', 79, 235, 104, 0, { blade: 230, lt: 0.38 }],
      ['14 ton class', 98, 290, 112, 0, {}],
      ['20 ton class', 118, 365, 117, 0, {}],
      ['30 ton class', 126, 400, 126, 0, { two: 1 }],
      ['50 ton class', 138, 450, 140, 0, { two: 1 }],
      ['100 ton class', 157, 540, 170, 0, { two: 1, tw: 0.2 }]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic wheeled excavator', desc: exDesc, build: (a, v) => excav(a, { ...v, wheeled: true }),
    vs: [['8 ton class, with blade and outriggers', 78, 255, 108, 0, { outrig: 1, blade: 180 }],
      ['14 ton class, with blade and outriggers', 98, 300, 124, 0, { outrig: 1, blade: 200 }],
      ['18 ton class, with outriggers', 100, 330, 128, 0, { outrig: 1 }],
      ['22 ton class, with outriggers', 100, 350, 130, 0, { outrig: 1 }],
      ['26 ton class, two-piece boom', 102, 370, 134, 0, { outrig: 1, two: 1 }]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic long reach excavator', desc: exDesc, build: (a, v) => excav(a, { ...v, lr: true, two: true, nt: 0 }),
    vs: [['20 ton class, 15 m reach, ditching bucket', 118, 470, 118, 0, { bw: 1700 }],
      ['30 ton class, 18 m reach, ditching bucket', 126, 520, 128, 0, { bw: 1900 }],
      ['40 ton class, 21 m reach, ditching bucket', 134, 570, 135, 0, { bw: 2100 }],
      ['50 ton class, 24 m reach, ditching bucket', 138, 620, 142, 0, { bw: 2200 }]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic zero tail swing excavator', desc: exDesc, build: (a, v) => excav(a, { ...v, zt: true, blade: v.bl, lt: 0.36 }),
    vs: [['1.7 ton class', 38, 128, 88, 0, { bl: 150, tw: 0.2 }], ['2.5 ton class', 49, 152, 91, 0, { bl: 180, tw: 0.2 }], ['3.5 ton class', 59, 170, 95, 0, { bl: 200 }],
      ['5 ton class', 63, 196, 100, 0, { bl: 205 }], ['8 ton class', 78, 238, 104, 0, { bl: 235 }]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic demolition excavator', desc: exDesc, build: (a, v) => excav(a, { ...v, hr: true, guard: true }),
    vs: [['30 ton class, high reach, with pulverizer jaw', 130, 330, 300, 0, {}], ['50 ton class, high reach, with pulverizer jaw', 142, 380, 380, 0, {}], ['80 ton class, high reach, with pulverizer jaw', 160, 440, 460, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic spider excavator', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const r = H * 0.13, hz = Z0 + H * 0.3;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const lx = cx + sx * W * 0.4, ly = -D * (sy < 0 ? 0.55 : 0.1); a.tube([[cx + sx * W * 0.12, -D * 0.33, hz], [lx, ly, Z0 + r * 0.9]], [60, 50], 8); tyre(a, lx, ly, r, W * 0.12); }
      a.box(cx - W * 0.2, -D * 0.5, hz - 100, cx + W * 0.2, -D * 0.16, hz + H * 0.1);
      const hz0 = hz + H * 0.1; a.cyl(cx, -D * 0.34, hz0, hz0 + H * 0.16, W * 0.26, 16); a.circ(cx, -D * 0.34, W * 0.26, 'EQUIP-DETAIL');
      a.box(cx - W * 0.22, -D * 0.2, hz0, cx + W * 0.22, -D * 0.02, hz0 + H * 0.16);
      cabin(a, cx - W * 0.28, cx + W * 0.08, -D * 0.5, -D * 0.3, hz0 + 10, hz0 + H * 0.45);
      const bx = cx + W * 0.1, rb = H * 0.05;
      a.tube([[bx, -D * 0.5, hz0 + H * 0.1], [bx, -D * 0.6, Z1 - rb * 1.4]], [rb, rb * 0.9], 8); a.tube([[bx, -D * 0.6, Z1 - rb * 1.4], [bx, -D * 0.93, Z0 + H * 0.3]], [rb * 0.8, rb * 0.5], 8);
      hyd(a, [bx + rb * 2, -D * 0.48, hz0 + H * 0.15], [bx + rb * 1.5, -D * 0.57, Z0 + H * 0.7], rb * 0.5);
      scoop(a, bx, YF + D * 0.01, Z0 + H * 0.08, W * 0.3, D * 0.08, H * 0.2, 3);
      a.outline('EQUIP'); a.log('Added the four outrigger legs with wheels, the slewing upper structure, cab, boom, stick and bucket (plan and 3D).');
    }, desc: (v) => `Walking spider excavator, ${v.label}, with four splayed outrigger legs on wheels, a slewing upper structure with a cab, a boom, a stick and a bucket.`,
    vs: [['2 ton class', 62, 150, 90, 0, {}], ['3 ton class', 80, 175, 98, 0, {}], ['4 ton class', 96, 205, 104, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic wheeled material handler', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const r = H * 0.14, hz = Z0 + r * 1.6;
      a.box(X0 + W * 0.15, -D * 0.78, Z0 + r * 0.9, X1 - W * 0.15, -D * 0.12, hz);
      for (const y of [-D * 0.68, -D * 0.2]) for (const sx of [-1, 1]) tyre(a, cx + sx * W * 0.4, y, r, W * 0.18);
      for (const sx of [-1, 1]) a.box(cx + sx * W * 0.4 - 70, -D * 0.9, Z0, cx + sx * W * 0.4 + 70, -D * 0.82, hz);
      a.cyl(cx, -D * 0.45, hz, hz + 160, W * 0.3, 18); a.circ(cx, -D * 0.45, W * 0.3, 'EQUIP-DETAIL');
      a.box(cx - W * 0.4, -D * 0.32, hz + 160, cx + W * 0.4, -D * 0.02, hz + H * 0.3);
      for (const sx of [-1, 1]) a.tube([[cx + sx * W * 0.3, -D * 0.42, hz + 160], [cx + sx * W * 0.3, -D * 0.42, hz + H * 0.45]], [28, 28], 6);   // cab riser
      cabin(a, cx - W * 0.38, cx + W * 0.1, -D * 0.5, -D * 0.34, hz + H * 0.4, Z1 - H * 0.12);
      const bx = cx + W * 0.1, rb = H * 0.04;
      a.tube([[bx, -D * 0.42, hz + H * 0.3], [bx, -D * 0.6, Z1 - rb], [bx, -D * 0.74, Z1 - rb * 2]], [rb, rb * 1.1, rb * 0.8], 8);
      a.tube([[bx, -D * 0.74, Z1 - rb * 2], [bx, -D * 0.9, Z0 + H * 0.45]], [rb * 0.7, rb * 0.5], 8);
      hyd(a, [bx + rb * 2, -D * 0.4, hz + H * 0.32], [bx + rb * 1.5, -D * 0.58, Z1 - H * 0.2], rb * 0.5);
      // orange peel grab: four tines closed
      for (let i = 0; i < 4; i++) { const g = (i / 4) * PI * 2 + 0.4; a.tube([[bx, -D * 0.9, Z0 + H * 0.45], [bx + m.cos(g) * W * 0.07, -D * 0.93 + m.sin(g) * W * 0.03, Z0 + H * 0.2], [bx + m.cos(g) * W * 0.03, -D * 0.95 + m.sin(g) * W * 0.012, Z0 + H * 0.1]], [40, 30, 14], 6); }
      a.circ(bx, -D * 0.92, W * 0.08, 'EQUIP-DETAIL'); a.log('Added the axles and tyres, outrigger pads, slewing upper structure, raised cab on a riser, boom, stick and a four-tine grab (plan and 3D).');
    }, desc: (v) => `Wheeled material handler, ${v.label}, with a raised cab on a riser, boom, stick and a four-tine grab, on two axles with outrigger pads.`,
    vs: [['18 ton class, scrap yard', 100, 340, 160, 0, {}], ['26 ton class, scrap yard', 100, 380, 190, 0, {}], ['36 ton class, scrap yard', 112, 420, 210, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic electric rope shovel', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const th = H * 0.18;
      for (const sx of [-1, 1]) track(a, cx + sx * W * 0.4, W * 0.18, -D * 0.82, -D * 0.12, th, Z0);
      a.box(X0 + W * 0.2, -D * 0.78, Z0 + th * 0.3, X1 - W * 0.2, -D * 0.16, Z0 + th);
      const hz = Z0 + th; a.cyl(cx, -D * 0.46, hz, hz + H * 0.05, W * 0.36, 20);
      a.box(cx - W * 0.42, -D * 0.62, hz + H * 0.05, cx + W * 0.42, 0, hz + H * 0.3);              // machinery house
      for (let i = 0; i < 5; i++) a.box(cx - W * 0.4, -D * 0.6 + i * D * 0.12, hz + H * 0.3, cx + W * 0.4, -D * 0.52 + i * D * 0.12, hz + H * 0.34);
      cabin(a, cx - W * 0.4, cx - W * 0.1, -D * 0.78, -D * 0.64, hz + H * 0.3, hz + H * 0.5);
      // A-frame and boom
      const top = Z1 - 80;
      for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.3, -D * 0.12, hz + H * 0.3], [cx + sx * W * 0.03, -D * 0.2, top - 40]], [60, 40], 8); }
      for (const sx of [-1, 1]) a.tube([[cx + sx * W * 0.18, -D * 0.64, hz + H * 0.22], [cx + sx * W * 0.12, -D * 0.82, top - H * 0.05]], [75, 55], 8);
      a.box(cx - W * 0.2, -D * 0.84, top - H * 0.08, cx + W * 0.2, -D * 0.78, top);
      a.tube([[cx, -D * 0.2, top - 40], [cx, -D * 0.82, top - H * 0.06]], [24, 24], 6);
      // dipper handle and bucket
      a.box(cx - W * 0.06, -D * 0.9, hz + H * 0.3, cx + W * 0.06, -D * 0.55, hz + H * 0.38);
      prismX(a, [[-D * 0.99, Z0 + H * 0.1], [-D * 0.84, Z0 + H * 0.12], [-D * 0.82, Z0 + H * 0.42], [-D * 0.93, Z0 + H * 0.36]], cx - W * 0.17, cx + W * 0.17);
      for (let i = 0; i < 5; i++) { const x = cx - W * 0.14 + i * W * 0.07; a.box(x - 30, -D * 0.995, Z0 + H * 0.07, x + 30, -D * 0.97, Z0 + H * 0.14); }
      a.circ(cx, -D * 0.46, W * 0.36, 'EQUIP-DETAIL'); a.line(cx, -D * 0.2, cx, YF, 'EQUIP-DETAIL');
      a.log('Added the crawler tracks, swing ring, machinery deck, cab, A-frame, boom, dipper handle and dipper bucket (plan and 3D).');
    }, desc: (v) => `Electric rope shovel, ${v.label}: twin crawler tracks, a machinery deck with a cab, an A-frame, a boom with a sheave head, a dipper handle and a toothed dipper bucket.`,
    vs: [['15 yd3 dipper class, quarry', 230, 520, 330, 0, {}], ['30 yd3 dipper class, quarry', 300, 700, 440, 0, {}], ['60 yd3 dipper class, open pit', 420, 960, 600, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic hydraulic face shovel', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const th = H * 0.22;
      for (const sx of [-1, 1]) track(a, cx + sx * (W / 2 - W * 0.1), W * 0.2, -D * 0.84, -D * 0.1, th, Z0);
      a.box(X0 + W * 0.2, -D * 0.8, Z0 + th * 0.3, X1 - W * 0.2, -D * 0.14, Z0 + th);
      const hz = Z0 + th; a.cyl(cx, -D * 0.34, hz, hz + 100, W * 0.3, 18);
      a.box(cx - W * 0.42, -D * 0.3, hz + 100, cx + W * 0.42, 0, hz + H * 0.3);
      a.box(cx - W * 0.42, -D * 0.5, hz + 100, cx + W * 0.1, -D * 0.3, hz + H * 0.2);
      cabin(a, cx - W * 0.4, cx - W * 0.1, -D * 0.52, -D * 0.38, hz + H * 0.2, hz + H * 0.45);
      const rb = H * 0.07, bx = cx;
      a.tube([[bx, -D * 0.46, hz + H * 0.15], [bx, -D * 0.6, Z1 - rb * 1.6]], [rb, rb * 0.9], 8);
      a.tube([[bx, -D * 0.6, Z1 - rb * 1.6], [bx, -D * 0.88, Z0 + H * 0.4]], [rb * 0.9, rb * 0.6], 8);
      hyd(a, [bx + rb * 2, -D * 0.4, hz + H * 0.28], [bx + rb * 1.6, -D * 0.57, Z0 + H * 0.65], rb * 0.55); hyd(a, [bx - rb * 2, -D * 0.4, hz + H * 0.28], [bx - rb * 1.6, -D * 0.57, Z0 + H * 0.65], rb * 0.55);
      hyd(a, [bx, -D * 0.6, Z1 - rb * 0.8], [bx, -D * 0.85, Z0 + H * 0.62], rb * 0.5);
      scoop(a, bx, YF + D * 0.01, Z0 + H * 0.12, W * 0.4, D * 0.1, H * 0.3, 5, 2);
      a.circ(bx, -D * 0.34, W * 0.3, 'EQUIP-DETAIL'); a.log('Added the crawler tracks, swing ring, machinery deck, cab, boom, stick, cylinders and a toothed face-shovel bucket (plan and 3D).');
    }, desc: (v) => `Hydraulic face shovel, ${v.label}: twin crawler tracks, an upper structure with a cab, a heavy boom and stick with cylinders and a large toothed bucket.`,
    vs: [['3 m3 bucket class, quarry', 150, 400, 175, 0, {}], ['6 m3 bucket class, quarry', 200, 520, 230, 0, {}], ['12 m3 bucket class, open pit', 270, 700, 300, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic excavator undercarriage, earthworks', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const tw = W * 0.22;
      for (const sx of [-1, 1]) track(a, cx + sx * (W / 2 - tw / 2), tw, YF, -D * 0.02 - 1, H * 0.78, Z0);
      a.box(X0 + tw, YF + D * 0.2, Z0 + H * 0.15, X1 - tw, -D * 0.2, Z0 + H * 0.78);
      a.cyl(cx, -D * 0.5, Z0 + H * 0.78, Z1, W * 0.3, 20); a.cyl(cx, -D * 0.5, Z1 - 60, Z1, W * 0.36, 20); a.circ(cx, -D * 0.5, W * 0.36, 'EQUIP-DETAIL');
      for (const sx of [-1, 1]) a.box(cx + sx * W * 0.3 - 80, YF, Z0 + H * 0.2, cx + sx * W * 0.3 + 80, YF + 120, Z0 + H * 0.5);
      a.log('Added the two track frames with rollers and shoes, the centre frame and the swing ring (plan and 3D).');
    }, desc: (v) => `Excavator undercarriage, ${v.label}: two track frames with rollers, sprockets and idlers, a centre frame and a slewing ring on top, with no upper structure.`,
    vs: [['14 ton class', 98, 150, 40, 0, {}], ['20 ton class', 118, 168, 44, 0, {}], ['30 ton class', 126, 188, 48, 0, {}], ['50 ton class', 138, 215, 56, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic excavator boom and stick set', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const rb = H * 0.2;
      a.tube([[cx, YF * 0 - 60, Z0 + rb * 1.4], [cx, YF * 0.45, Z1 - rb * 1.1], [cx, YF * 0.62, Z1 - rb * 1.4]], [rb, rb * 1.25, rb * 0.9], 12);
      a.box(cx - rb * 1.3, -rb * 2, Z0, cx + rb * 1.3, 0, Z0 + rb * 2.6);
      a.tube([[cx - W * 0.25, YF * 0.62, Z0 + rb * 2.2], [cx - W * 0.25, YF + 60, Z0 + rb * 1.2]], [rb * 0.8, rb * 0.55], 10);
      a.tube([[cx + W * 0.25, YF * 0.62, Z0 + rb * 2.2], [cx + W * 0.25, YF + 60, Z0 + rb * 1.2]], [rb * 0.8, rb * 0.55], 10);
      for (const sx of [-1, 1]) hyd(a, [cx + sx * rb * 1.8, YF * 0.1, Z0 + rb * 2.2], [cx + sx * rb * 1.4, YF * 0.4, Z1 - rb * 2.2], rb * 0.4);
      a.line(cx, 0, cx, YF, 'EQUIP-DETAIL'); a.circ(cx, -rb, rb * 0.6, 'EQUIP-DETAIL');
      a.log('Added the boom with its foot, two lifting cylinders and two spare sticks laid beside it (plan and 3D).');
    }, desc: (v) => `Excavator front set, ${v.label}: a boom with a foot block and two lifting cylinders, and two sticks lying beside it, as a plain object.`,
    vs: [['10 ton class, 3 m stick', 40, 220, 34, 0, {}], ['20 ton class, 3 m stick', 50, 300, 44, 0, {}], ['30 ton class, 3.5 m stick', 56, 340, 52, 0, {}], ['50 ton class, 4 m stick', 66, 400, 60, 0, {}]] }),
  fam({ cat: 'earthmoving/excavators', title: 'Generic ride-on chain trencher', build: (a, v) => {
      const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
      const th = H * 0.28;
      for (const sx of [-1, 1]) track(a, cx + sx * (W / 2 - W * 0.12), W * 0.24, -D * 0.78, -D * 0.1, th, Z0);
      a.box(X0 + W * 0.2, -D * 0.74, Z0 + th * 0.35, X1 - W * 0.2, -D * 0.14, Z0 + th + 160);
      a.box(cx - W * 0.4, -D * 0.5, Z0 + th, cx + W * 0.4, -D * 0.02, Z0 + H * 0.55);
      rops(a, cx - W * 0.35, cx + W * 0.35, -D * 0.62, -D * 0.52, Z0 + H * 0.55, Z0 + H * 0.97); a.box(cx - W * 0.2, -D * 0.6, Z0 + H * 0.55, cx + W * 0.2, -D * 0.5, Z0 + H * 0.62);
      // digging boom with chain
      a.prism([[cx - 110, -D * 0.92], [cx + 110, -D * 0.92], [cx + 110, -D * 0.74], [cx - 110, -D * 0.74]], Z0 + H * 0.02, Z0 + H * 0.5);
      a.tube([[cx, -D * 0.74, Z0 + H * 0.52], [cx, -D * 0.92, Z0 + H * 0.2]], [60, 60], 8); a.xcyl(cx - 90, cx + 90, -D * 0.93, Z0 + H * 0.12, 90, 12);
      a.ycyl(-D * 0.93, -D * 0.74, cx, Z0 + H * 0.14, 20, 6);
      a.log('Added the crawler tracks, engine hood, roll-over frame, boom, chain and boom cylinder (plan and 3D).');
    }, desc: (v) => `Ride-on chain trencher, ${v.label}: twin crawler tracks, an engine hood, a roll-over frame, a digging boom with a toothed chain and a boom cylinder.`,
    vs: [['4 ft depth, 6 in chain', 52, 130, 62, 0, {}], ['5 ft depth, 8 in chain', 62, 160, 70, 0, {}], ['6 ft depth, 12 in chain', 72, 190, 78, 0, {}], ['9 ft depth, 16 in chain', 82, 230, 90, 0, {}]] }),
];

// ------------------------------------------------------------------------------------------------ loaders, dozers, graders
/** articulated wheel loader. o: bucket height frac, hb (high-lift boom), mine, fork */
function wheelLoader(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * (o.rr ?? 0.27), tw = W * 0.2, ax = [-D * 0.7, -D * 0.3], hz = Z0 + r * 1.2;
  for (const y of ax) { a.xcyl(cx - W * 0.4, cx + W * 0.4, y, Z0 + r, r * 0.18, 10); for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - W * 0.04 - tw / 2), y, r, tw); }
  a.box(cx - W * 0.28, -D * 0.78, Z0 + r * 0.8, cx + W * 0.28, -D * 0.52, hz + r * 0.25);                     // front frame
  a.box(cx - W * 0.3, -D * 0.5, Z0 + r * 0.8, cx + W * 0.3, 0, Z0 + H * 0.52);                               // rear frame and engine
  a.box(cx - W * 0.31, -D * 0.05, Z0 + r * 0.9, cx + W * 0.31, 0, Z0 + H * 0.58);                            // counterweight
  for (let i = 0; i < 5; i++) a.box(cx - W * 0.22 + i * W * 0.09, -D * 0.01, Z0 + H * 0.3, cx - W * 0.2 + i * W * 0.09, 0, Z0 + H * 0.5);
  a.cyl(cx + W * 0.2, -D * 0.24, Z0 + H * 0.52, Z0 + H * 0.7, 28, 8);
  cabin(a, cx - W * 0.26, cx + W * 0.26, -D * 0.52, -D * 0.34, hz + r * 0.2, Z1 - 30);
  ladder(a, cx - W * 0.28 - 360, -D * 0.5, 0, Z0 + r * 0.7, hz + r * 0.8);
  // lift arms, tower, cylinders
  const top = Z0 + H * (o.hb ? 0.78 : 0.66), lowZ = Z0 + r * 0.8, bY = -D * 0.86;
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.3; a.box(x - 40, -D * 0.56, hz + r * 0.2, x + 40, -D * 0.48, top + 60); a.tube([[x, -D * 0.52, top], [x, -D * 0.7, top - H * 0.04], [x, bY, lowZ]], [70, 80, 60], 8); hyd(a, [x, -D * 0.6, hz + r * 0.3], [x, -D * 0.68, top - H * 0.05], 60); }
  a.xcyl(cx - W * 0.3, cx + W * 0.3, -D * 0.52, top, 40, 8); a.tube([[cx, -D * 0.56, top + 20], [cx, bY, lowZ + H * 0.18]], [32, 40], 8);
  if (o.fork) { for (const sx of [-1, 1]) a.box(cx + sx * W * 0.2 - 55, YF, Z0 + 20, cx + sx * W * 0.2 + 55, bY, Z0 + 90); a.box(cx - W * 0.3, bY, Z0 + 20, cx + W * 0.3, bY + 40, Z0 + H * 0.4); a.rect(cx - W * 0.3, YF, cx + W * 0.3, bY + 40); }
  else scoop(a, cx, YF + 20, Z0 + 15, W * (o.bwF ?? 0.99), D * 0.13, H * (o.bhF ?? 0.3), o.nt ?? 0);
  a.line(cx - W * 0.4, -D * 0.52, cx + W * 0.4, -D * 0.52, 'EQUIP-DETAIL'); a.rect(cx - W * 0.3, -D * 0.5, cx + W * 0.3, 0, 'EQUIP-DETAIL');
  a.log('Added the four tyres and axles, articulated frames, engine, counterweight, cab, lift arms, cylinders and bucket (plan and 3D).');
}
/** skid-steer or compact track loader. o: tracks, vl (vertical lift), bw */
function skid(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.2;
  if (o.tracks) for (const sx of [-1, 1]) track(a, cx + sx * (W / 2 - W * 0.12), W * 0.22, -D * 0.78, -D * 0.1, H * 0.32, Z0); else for (const y of [-D * 0.62, -D * 0.28]) for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - W * 0.12), y, r, W * 0.22);
  a.box(cx - W * 0.36, -D * 0.74, Z0 + H * 0.2, cx + W * 0.36, 0, Z0 + H * 0.5);
  a.box(cx - W * 0.34, -D * 0.04, Z0 + H * 0.2, cx + W * 0.34, 0, Z0 + H * 0.58);
  rops(a, cx - W * 0.3, cx + W * 0.3, -D * 0.58, -D * 0.2, Z0 + H * 0.5, Z0 + H * 0.97);
  a.box(cx - W * 0.2, -D * 0.5, Z0 + H * 0.5, cx + W * 0.2, -D * 0.3, Z0 + H * 0.6);
  const top = Z0 + H * (o.vl ? 0.9 : 0.78), bY = -D * 0.92, bz = Z0 + H * 0.2;
  for (const sx of [-1, 1]) { const x = cx + sx * (W * 0.4 + 20); a.tube([[x, o.vl ? -D * 0.3 : -D * 0.08, top], [x, o.vl ? -D * 0.6 : -D * 0.5, top + 20], [x, bY, bz]], [38, 42, 32], 8); hyd(a, [x, -D * 0.3, Z0 + H * 0.35], [x, -D * 0.5, top - 40], 30); }
  scoop(a, cx, YF + 20, Z0 + 10, o.bw ?? W * 0.98, D * 0.13, H * 0.26, 0);
  a.log('Added the wheels or tracks, engine deck, roll-over cab frame, lift arms, cylinders and bucket (plan and 3D).');
}
/** crawler dozer. o: blade 'S'|'U'|'SU', ripper, cabin, side (pipelayer), bucket (track loader) */
function dozer(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const th = H * 0.42, tw = W * 0.14, gauge = W * (o.side ? 0.42 : 0.66), bw = o.bucket ? W : W * 0.96;
  const yb = YF + (o.bucket ? D * 0.1 : D * 0.08);
  for (const sx of [-1, 1]) track(a, cx + sx * gauge / 2 + (o.side ? -W * 0.1 : 0), tw, YF + D * 0.2, -D * 0.02, th, Z0);
  const xl = cx - gauge / 2 - tw / 2 + (o.side ? -W * 0.1 : 0), xr = cx + gauge / 2 + tw / 2 + (o.side ? -W * 0.1 : 0);
  a.box(xl + tw, YF + D * 0.35, Z0 + th * 0.3, xr - tw, -D * 0.1, Z0 + th + 80);
  const hz = Z0 + th * 0.9, mx = (xl + xr) / 2;
  a.box(mx - gauge * 0.38, YF + D * 0.22, hz, mx + gauge * 0.38, YF + D * 0.55, hz + H * 0.3);              // engine hood
  a.box(mx - gauge * 0.38, YF + D * 0.21, hz + H * 0.06, mx + gauge * 0.38, YF + D * 0.23, hz + H * 0.26);   // grille
  a.box(mx - gauge * 0.4, YF + D * 0.55, hz, mx + gauge * 0.4, -D * 0.06, hz + H * 0.14);                    // deck and fenders
  if (o.cabin) cabin(a, mx - gauge * 0.36, mx + gauge * 0.36, YF + D * 0.56, -D * 0.12, hz + H * 0.1, Z1 - 25); else rops(a, mx - gauge * 0.34, mx + gauge * 0.34, YF + D * 0.6, -D * 0.14, hz + H * 0.14, Z1 - 30);
  a.cyl(mx + gauge * 0.25, YF + D * 0.35, hz + H * 0.3, hz + H * 0.45, 30, 8);
  // blade, push arms, tilt cylinder
  const bh = H * 0.46, zb = Z0 + th * 0.0;
  if (o.bucket) { scoop(a, cx, YF + 10, Z0 + 10, bw, D * 0.16, H * 0.3, 0); for (const sx of [-1, 1]) a.tube([[xl + (sx > 0 ? xr - xl : 0), YF + D * 0.5, Z0 + th * 0.9], [cx + sx * bw * 0.45, YF + D * 0.1, Z0 + H * 0.25]], [50, 40], 8); }
  else {
    for (const sx of [-1, 1]) { const x = sx < 0 ? xl : xr; a.tube([[x, YF + D * 0.45, Z0 + th * 0.55], [x + sx * (bw / 2 - (x - cx) * sx - 150) * 0.2, yb + 120, zb + bh * 0.35]], [55, 45], 8); }
    prismX(a, [[yb, zb + 30], [yb + 200, zb + 30], [yb + 220, zb + bh], [yb + 60, zb + bh]], cx - bw / 2, cx + bw / 2);
    a.box(cx - bw / 2, yb - 25, zb, cx + bw / 2, yb + 40, zb + 90);
    if (o.blade && o.blade.includes('U')) for (const sx of [-1, 1]) prismX(a, [[yb - 380, zb + 30], [yb - 100, zb + 30], [yb + 120, zb + bh], [yb - 300, zb + bh]], sx < 0 ? cx - bw / 2 : cx + bw / 2 - bw * 0.1, sx < 0 ? cx - bw / 2 + bw * 0.1 : cx + bw / 2);
    hyd(a, [cx + bw * 0.28, YF + D * 0.5, hz + H * 0.1], [cx + bw * 0.3, yb + 200, zb + bh * 0.9], 36);
    a.rect(cx - bw / 2, yb - 20, cx + bw / 2, yb + 220); a.line(cx - bw / 2, yb + 110, cx + bw / 2, yb + 110, 'EQUIP-DETAIL');
  }
  if (o.ripper) { a.box(mx - gauge * 0.3, -D * 0.02, Z0 + th * 0.8, mx + gauge * 0.3, -D * 0.0 + 0.1 - 0.1, hz + H * 0.1); for (const x of [mx - gauge * 0.15, mx + gauge * 0.15]) a.prism([[x - 60, -D * 0.0 - 10], [x + 60, -D * 0.0 - 10], [x + 40, -D * 0.0 + 0], [x - 40, -D * 0.0 + 0]], Z0 + 30, hz + H * 0.1); }
  if (o.side) { const sx = 1; a.box(xr, YF + D * 0.5, hz + H * 0.1, X1, -D * 0.1, hz + H * 0.3); a.tube([[xr + 200, -D * 0.3, hz + H * 0.3], [X1 - 60, -D * 0.3, Z1 - 120]], [90, 50], 8); a.xcyl(X1 - 260, X1 - 60, -D * 0.3, Z1 - 120, 70, 10); a.box(X0, YF + D * 0.45, hz, xl, -D * 0.05, hz + H * 0.35); }
  a.log('Added the crawler tracks, engine hood, cab frame, fenders, push arms, blade and cylinders (plan and 3D).');
}
/** motor grader. o: bw (blade width mm), mw (machine width frac), ripper */
function grader(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.3, mw = W * (o.mw ?? 0.7), tw = r * 0.55, hz = Z0 + r * 1.55;
  for (const sx of [-1, 1]) { tyre(a, cx + sx * mw / 2 * 0.86, -D * 0.9, r, tw); for (const y of [-D * 0.13, -D * 0.26]) tyre(a, cx + sx * mw / 2, y, r, tw); a.box(cx + sx * mw / 2 - 40, -D * 0.28, Z0 + r * 0.6, cx + sx * mw / 2 + 40, -D * 0.11, hz); }
  a.xcyl(cx - mw / 2, cx + mw / 2, -D * 0.9, Z0 + r, 40, 8);
  a.box(cx - 130, -D * 0.92, hz, cx + 130, -D * 0.3, hz + H * 0.1);                                           // frame beam
  a.tube([[cx, -D * 0.92, hz + H * 0.05], [cx, -D * 0.9, Z0 + r * 1.2]], [60, 60], 8);
  a.box(cx - W * 0.2, -D * 0.28, hz - 100, cx + W * 0.2, 0, hz + H * 0.4);                                    // engine
  a.box(cx - W * 0.2, -D * 0.03, hz + H * 0.4 - 20, cx + W * 0.2, 0, hz + H * 0.45);
  cabin(a, cx - W * 0.17, cx + W * 0.17, -D * 0.46, -D * 0.28, hz + H * 0.05, Z1 - 30);
  // circle, drawbar and blade
  const bw = o.bw ?? W * 0.96, zbl = Z0 + r * 0.9;
  a.tube([[cx, -D * 0.84, hz], [cx - 100, -D * 0.6, zbl + 380]], [38, 38], 8); a.tube([[cx, -D * 0.84, hz], [cx + 100, -D * 0.6, zbl + 380]], [38, 38], 8);
  a.cyl(cx, -D * 0.58, zbl + 340, zbl + 400, 280, 20);
  prismX(a, [[-D * 0.62, zbl], [-D * 0.57, zbl + 40], [-D * 0.56, zbl + 480], [-D * 0.6, zbl + 520]], cx - bw / 2, cx + bw / 2);
  a.box(cx - bw / 2, -D * 0.64, zbl - 10, cx + bw / 2, -D * 0.6, zbl + 80);
  hyd(a, [cx - 330, -D * 0.78, hz + 40], [cx - 330, -D * 0.6, zbl + 450], 32); hyd(a, [cx + 330, -D * 0.78, hz + 40], [cx + 330, -D * 0.6, zbl + 450], 32);
  if (o.ripper) a.box(cx - W * 0.15, -D * 0.0 - 70, Z0 + r * 0.5, cx + W * 0.15, 0, hz);
  a.rect(cx - bw / 2, -D * 0.64, cx + bw / 2, -D * 0.56, 'EQUIP'); a.line(cx, -D * 0.92, cx, 0, 'EQUIP-DETAIL');
  a.log('Added the front wheels, tandem rear wheels, frame beam, engine, cab, drawbar, circle, moldboard and lift cylinders (plan and 3D).');
}
/** self-propelled scraper */
function scraper(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.27, tw = W * 0.2, hz = Z0 + r * 1.5;
  for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - W * 0.05 - tw / 2), -D * 0.82, r, tw); tyre(a, cx + sx * (W / 2 - W * 0.05 - tw / 2), -D * 0.3, r, tw); if (o.twin) tyre(a, cx + sx * (W / 2 - W * 0.05 - tw / 2), -D * 0.06, r, tw); }
  a.box(cx - W * 0.3, -D * 0.98, Z0 + r * 0.9, cx + W * 0.3, -D * 0.66, Z0 + H * 0.5);                        // tractor
  a.box(cx - W * 0.28, -D * 0.74, Z0 + H * 0.5, cx + W * 0.28, -D * 0.66, Z0 + H * 0.55);
  cabin(a, cx - W * 0.24, cx + W * 0.24, -D * 0.9, -D * 0.76, Z0 + H * 0.5, Z1 - 30);
  a.cyl(cx + W * 0.18, -D * 0.93, Z0 + H * 0.5, Z0 + H * 0.62, 26, 8);
  a.tube([[cx - W * 0.3, -D * 0.64, hz], [cx - W * 0.3, -D * 0.5, hz + 100]], [60, 60], 8); a.tube([[cx + W * 0.3, -D * 0.64, hz], [cx + W * 0.3, -D * 0.5, hz + 100]], [60, 60], 8);
  a.box(cx - W * 0.45, -D * 0.64, Z0 + r * 0.55, cx + W * 0.45, -D * 0.2, Z0 + H * 0.62);                       // bowl
  a.box(cx - W * 0.42, -D * 0.5, Z0 + H * 0.62, cx + W * 0.42, -D * 0.2, Z0 + H * 0.66);
  a.box(cx - W * 0.45, -D * 0.64, Z0 + r * 0.55, cx + W * 0.45, -D * 0.6, Z0 + H * 0.6);                        // apron
  a.box(cx - W * 0.38, -D * 0.2, Z0 + r * 0.9, cx + W * 0.38, 0, Z0 + H * 0.58);                                // rear engine/ejector
  if (o.twin) { a.box(cx - W * 0.3, -D * 0.1, Z0 + H * 0.58, cx + W * 0.3, 0, Z0 + H * 0.72); a.cyl(cx, -D * 0.04, Z0 + H * 0.72, Z0 + H * 0.82, 26, 8); }
  hyd(a, [cx - W * 0.4, -D * 0.66, Z0 + H * 0.78], [cx - W * 0.4, -D * 0.62, Z0 + H * 0.58], 40);
  a.rect(cx - W * 0.45, -D * 0.64, cx + W * 0.45, -D * 0.2, 'EQUIP-DETAIL'); a.line(cx - W * 0.4, -D * 0.66, cx + W * 0.4, -D * 0.66, 'EQUIP-DETAIL');
  a.log('Added the tractor with cab and engine, the bail arms, the bowl with apron and ejector, and the wheels (plan and 3D).');
}
/** backhoe loader */
function backhoe(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const rr = H * 0.2, fr = H * (o.small ? 0.16 : 0.15), hz = Z0 + rr * 1.5;
  for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - W * 0.12), -D * 0.36, rr, W * 0.2); tyre(a, cx + sx * (W / 2 - W * 0.1), -D * 0.7, fr, W * 0.17); }
  a.box(cx - W * 0.28, -D * 0.78, Z0 + fr, cx + W * 0.28, -D * 0.5, Z0 + H * 0.4);                              // hood
  a.box(cx - W * 0.3, -D * 0.5, Z0 + rr, cx + W * 0.3, -D * 0.16, Z0 + H * 0.4);
  rops(a, cx - W * 0.3, cx + W * 0.3, -D * 0.5, -D * 0.28, Z0 + H * 0.4, Z1 - 30); a.box(cx - W * 0.2, -D * 0.46, Z0 + H * 0.4, cx + W * 0.2, -D * 0.34, Z0 + H * 0.46);
  for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.4 - 25, -D * 0.12, Z0 + 30, cx + sx * W * 0.4 + 25, -D * 0.06, hz + 100); a.box(cx + sx * W * 0.4 - 90, -D * 0.14, Z0, cx + sx * W * 0.4 + 90, -D * 0.02, Z0 + 60); }
  // loader arms and bucket
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.34; a.tube([[x, -D * 0.46, Z0 + H * 0.5], [x, -D * 0.86, Z0 + H * 0.2]], [40, 36], 8); hyd(a, [x, -D * 0.6, Z0 + H * 0.34], [x, -D * 0.66, Z0 + H * 0.48], 28); }
  scoop(a, cx, YF + 20, Z0 + 15, W * 0.98, D * 0.1, H * 0.3, 0);
  // hoe at the rear
  a.box(cx - W * 0.2, -D * 0.16, hz, cx + W * 0.2, 0, Z0 + H * 0.55);
  a.tube([[cx, -D * 0.1, Z0 + H * 0.5], [cx, -D * 0.02, Z1 - 120], [cx, -D * 0.0, Z0 + H * 0.75]], [60, 50, 40], 8);
  a.tube([[cx, -D * 0.0, Z0 + H * 0.75], [cx, -D * 0.0, Z0 + H * 0.2]], [40, 30], 8);
  prismX(a, [[-D * 0.0 - 40, Z0 + H * 0.0 + 30], [-D * 0.0 - 40 + 340, Z0 + 30], [-D * 0.0 - 40 + 340, Z0 + H * 0.16], [-D * 0.0 - 40, Z0 + H * 0.2]].map(([y, z]) => [y - 20, z]), cx - W * 0.18, cx + W * 0.18);
  a.log('Added the front loader bucket and arms, the cab frame, hood, wheels, stabilisers and the rear hoe boom and bucket (plan and 3D).');
}
/** rough-terrain telehandler with bucket or forks */
function telehandler(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.2, tw = W * 0.2;
  for (const y of [-D * 0.62, -D * 0.22]) for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - tw / 2 - 20), y, r, tw);
  a.box(cx - W * 0.3, -D * 0.82, Z0 + r * 0.8, cx + W * 0.3, 0, Z0 + H * 0.4);
  a.box(cx - W * 0.14, -D * 0.1, Z0 + H * 0.4, cx + W * 0.4, 0, Z0 + H * 0.5);                                  // engine pod
  cabin(a, cx - W * 0.4, cx - W * 0.1, -D * 0.6, -D * 0.4, Z0 + H * 0.4, Z0 + H * 0.78);
  a.box(cx - W * 0.1, -D * 0.2, Z0 + H * 0.4, cx + W * 0.2, -D * 0.04, Z0 + H * 0.66);
  // boom, inclined forward and up
  const tip = [cx + W * 0.04, -D * 0.96, Z0 + H * 0.66];
  a.tube([[cx + W * 0.04, -D * 0.1, Z0 + H * 0.62], [cx + W * 0.04, -D * 0.5, Z0 + H * 0.74], [cx + W * 0.04, -D * 0.84, Z0 + H * 0.7]], [W * 0.07, W * 0.07, W * 0.06], 8);
  hyd(a, [cx + W * 0.04, -D * 0.2, Z0 + H * 0.44], [cx + W * 0.04, -D * 0.5, Z0 + H * 0.72], 50);
  if (o.fork) { a.box(cx - W * 0.28, -D * 0.9, Z0 + H * 0.36, cx + W * 0.28, -D * 0.86, Z0 + H * 0.78); for (const sx of [-1, 1]) a.box(cx + sx * W * 0.2 - 50, YF, Z0 + H * 0.38, cx + sx * W * 0.2 + 50, -D * 0.9, Z0 + H * 0.42); a.rect(cx - W * 0.28, YF, cx + W * 0.28, -D * 0.86); }
  else scoop(a, cx + W * 0.04, YF + 20, Z0 + H * 0.38, W * 0.9, D * 0.1, H * 0.26, 0);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.45 - 70, -D * 0.7, Z0, cx + sx * W * 0.45 + 70, -D * 0.62, Z0 + r * 0.8);
  a.log('Added the four tyres, chassis, side cab, engine pod, the inclined telescopic boom with its cylinder and a bucket or forks (plan and 3D).');
}
/** compact tractor loader */
function tractor(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const rr = H * 0.26, fr = H * 0.17;
  for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - W * 0.12), -D * 0.3, rr, W * 0.24); tyre(a, cx + sx * (W / 2 - W * 0.1), -D * 0.68, fr, W * 0.18); }
  a.box(cx - W * 0.22, -D * 0.78, Z0 + fr, cx + W * 0.22, -D * 0.5, Z0 + H * 0.56);
  a.box(cx - W * 0.2, -D * 0.5, Z0 + rr * 0.9, cx + W * 0.2, -D * 0.1, Z0 + H * 0.5);
  a.cyl(cx + W * 0.1, -D * 0.5, Z0 + H * 0.56, Z0 + H * 0.78, 26, 8);
  rops(a, cx - W * 0.28, cx + W * 0.28, -D * 0.46, -D * 0.2, Z0 + H * 0.5, Z1 - 30);
  a.box(cx - W * 0.22, -D * 0.36, Z0 + H * 0.5, cx + W * 0.22, -D * 0.24, Z0 + H * 0.58);
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.36; a.tube([[x, -D * 0.44, Z0 + H * 0.5], [x, -D * 0.72, Z0 + H * 0.82], [x, -D * 0.9, Z0 + H * 0.24]], [28, 30, 24], 8); hyd(a, [x, -D * 0.5, Z0 + H * 0.4], [x, -D * 0.6, Z0 + H * 0.62], 22); }
  scoop(a, cx, YF + 20, Z0 + 12, W * 0.96, D * 0.1, H * 0.22, 0);
  a.box(cx - W * 0.2, -D * 0.04, Z0 + H * 0.2, cx + W * 0.2, 0, Z0 + H * 0.42);
  a.log('Added the four tyres, bonnet, roll-over frame, loader arms with cylinders and a bucket, and the rear linkage block (plan and 3D).');
}
const LOADERS = [
  fam({ cat: 'earthmoving/loaders', title: 'Generic earthworks wheel loader', desc: (v) => `Articulated wheel loader, ${v.label}: four tyres, articulated frames, engine, counterweight, cab, lift arms with cylinders and ${v.fork ? 'pallet forks' : 'a bucket'}.`, build: (a, v) => wheelLoader(a, v),
    vs: [['0.8 m3 bucket class, compact', 76, 200, 92, 0, { rr: 0.28 }], ['1.5 m3 bucket class', 90, 245, 104, 0, {}], ['2.5 m3 bucket class', 102, 295, 118, 0, {}], ['3.5 m3 bucket class', 114, 335, 130, 0, {}],
      ['5 m3 bucket class', 128, 380, 142, 0, { nt: 6 }], ['7 m3 bucket class, quarry', 148, 420, 156, 0, { nt: 6 }], ['10 m3 bucket class, quarry', 172, 480, 180, 0, { nt: 8, hb: 1 }], ['2.5 m3 class, pallet forks', 102, 310, 118, 0, { fork: 1 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic skid steer loader, earthworks', desc: (v) => `Skid steer loader, ${v.label}: ${v.tracks ? 'two short tracks' : 'four wheels'}, an engine deck, a roll-over cab frame, lift arms with cylinders and a bucket.`, build: (a, v) => skid(a, v),
    vs: [['1,000 lb rated load, wheels', 53, 105, 78, 0, {}], ['1,500 lb rated load, wheels', 60, 116, 80, 0, {}], ['2,200 lb rated load, wheels', 68, 128, 82, 0, {}], ['2,800 lb rated load, vertical lift, wheels', 72, 140, 84, 0, { vl: 1 }], ['3,200 lb rated load, wheels, wide bucket', 78, 148, 86, 0, { vl: 1, bw: 1980 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic compact track loader', desc: (v) => `Compact track loader, ${v.label}: two rubber tracks, an engine deck, a roll-over cab frame, lift arms with cylinders and a bucket.`, build: (a, v) => skid(a, { ...v, tracks: true }),
    vs: [['1,800 lb rated load', 62, 120, 80, 0, {}], ['2,700 lb rated load, vertical lift', 70, 136, 84, 0, { vl: 1 }], ['3,500 lb rated load, vertical lift', 76, 148, 88, 0, { vl: 1 }], ['4,300 lb rated load, wide tracks', 84, 158, 90, 0, { vl: 1 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic crawler dozer', desc: (v) => `Crawler dozer, ${v.label}: two tracks, engine hood, ${v.cabin ? 'enclosed cab' : 'open roll-over frame'}, push arms, tilt cylinder and ${v.blade === 'S' ? 'a straight' : v.blade === 'U' ? 'a universal' : 'a semi-universal'} blade${v.ripper ? ' and a rear ripper' : ''}.`, build: (a, v) => dozer(a, v),
    vs: [['10 ton class, straight blade', 98, 190, 105, 0, { blade: 'S' }], ['15 ton class, straight blade', 110, 220, 110, 0, { blade: 'S' }], ['20 ton class, semi-universal blade', 118, 245, 118, 0, { blade: 'SU', cabin: 1 }],
      ['25 ton class, semi-universal blade, ripper', 130, 285, 126, 0, { blade: 'SU', cabin: 1, ripper: 1 }], ['40 ton class, universal blade, ripper', 150, 320, 140, 0, { blade: 'U', cabin: 1, ripper: 1 }],
      ['55 ton class, universal blade, ripper', 168, 345, 152, 0, { blade: 'U', cabin: 1, ripper: 1 }], ['70 ton class, universal blade', 188, 375, 160, 0, { blade: 'U', cabin: 1 }], ['100 ton class, universal blade, ripper', 225, 430, 180, 0, { blade: 'U', cabin: 1, ripper: 1 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic crawler loader', desc: (v) => `Crawler track loader, ${v.label}: two tracks, engine hood, cab frame, loader arms and a wide bucket.`, build: (a, v) => dozer(a, { ...v, bucket: true, cabin: true }),
    vs: [['8 ton class, 1.3 m3 bucket', 88, 200, 112, 0, {}], ['15 ton class, 2.3 m3 bucket', 108, 245, 126, 0, {}], ['25 ton class, 3.6 m3 bucket', 126, 290, 142, 0, {}]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic pipelayer', desc: (v) => `Side-boom pipelayer, ${v.label}: crawler tracks, a cab frame, a side boom with a hook block on the right and a counterweight box on the left.`, build: (a, v) => dozer(a, { ...v, side: true, cabin: false, blade: 'S' }),
    vs: [['30 ton class, 36 in pipe', 150, 280, 160, 0, {}], ['50 ton class, 48 in pipe', 175, 320, 175, 0, {}], ['85 ton class, 60 in pipe', 205, 370, 195, 0, {}]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic motor grader', desc: (v) => `Motor grader, ${v.label}: front wheels, tandem rear wheels, a long frame beam, a cab, an engine, a drawbar and circle with a moldboard and lift cylinders.`, build: (a, v) => grader(a, v),
    vs: [['12 ft moldboard', 150, 330, 120, 0, { mw: 0.58 }], ['14 ft moldboard', 170, 380, 128, 0, { mw: 0.6 }], ['14 ft moldboard, rear ripper', 170, 395, 128, 0, { mw: 0.6, ripper: 1 }], ['16 ft moldboard', 195, 420, 136, 0, { mw: 0.6 }], ['24 ft moldboard, mine', 290, 520, 165, 0, { mw: 0.55 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic motor scraper', desc: (v) => `Self-propelled scraper, ${v.label}: a tractor with cab and engine, bail arms, a bowl with an apron and ${v.twin ? 'a second engine at the rear, ' : ''}wheels.`, build: (a, v) => scraper(a, v),
    vs: [['15 yd3 bowl', 116, 420, 130, 0, {}], ['24 yd3 bowl', 128, 470, 142, 0, {}], ['34 yd3 bowl', 140, 520, 154, 0, {}], ['34 yd3 bowl, push-pull twin engine', 140, 580, 160, 0, { twin: 1 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic backhoe loader', desc: (v) => `Backhoe loader, ${v.label}: large rear and small front wheels, a roll-over cab frame, a front loader bucket on arms and a rear hoe with boom, stick, bucket and stabilisers.`, build: (a, v) => backhoe(a, v),
    vs: [['compact, 4 ft bucket', 60, 200, 94, 0, { small: 1 }], ['standard, 6 ft bucket', 78, 235, 106, 0, {}], ['standard, 8 ft bucket, 14 ft dig depth', 88, 250, 108, 0, {}], ['large, extendable stick, 4x4', 92, 265, 112, 0, {}], ['large, 4-in-1 bucket', 92, 262, 112, 0, {}]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic earthworks telehandler', desc: (v) => `Rough-terrain telehandler, ${v.label}: four tyres, a side cab, an inclined telescopic boom with a lift cylinder, outrigger pads and ${v.fork ? 'pallet forks on a carriage' : 'a bucket'}.`, build: (a, v) => telehandler(a, v),
    vs: [['4 m lift, with bucket', 78, 235, 94, 0, {}], ['7 m lift, with bucket', 90, 280, 104, 0, {}], ['10 m lift, with forks', 96, 320, 108, 0, { fork: 1 }], ['14 m lift, with forks', 98, 345, 110, 0, { fork: 1 }], ['17 m lift, with forks', 102, 370, 114, 0, { fork: 1 }]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic tractor loader', desc: (v) => `Compact tractor with a front loader, ${v.label}: four tyres, a bonnet, a roll-over frame, loader arms with cylinders, a bucket and a rear linkage block.`, build: (a, v) => tractor(a, v),
    vs: [['25 hp class, 4 ft bucket', 52, 120, 78, 0, {}], ['45 hp class, 5 ft bucket', 64, 150, 88, 0, {}], ['75 hp class, 6 ft bucket', 78, 175, 98, 0, {}]] }),
  fam({ cat: 'earthmoving/loaders', title: 'Generic wheel dozer', desc: (v) => `Articulated wheel dozer, ${v.label}: four large tyres, articulated frames, an engine with counterweight, a cab and a blade on push arms.`, build: (a, v) => {
      wheelLoader(a, { rr: 0.3, bwF: 0.01, bhF: 0.01 }); const { X0, X1, Z0, D, H, W, cx } = a; a.p = a.p.filter((s) => !(s.kind === 'rect' && s.y0 === a.YF + 20 - 14));
      prismX(a, [[-D * 0.97, Z0 + 20], [-D * 0.9, Z0 + 20], [-D * 0.9, Z0 + H * 0.4], [-D * 0.96, Z0 + H * 0.4]], cx - W * 0.48, cx + W * 0.48); a.box(cx - W * 0.48, -D * 0.99, Z0, cx + W * 0.48, -D * 0.95, Z0 + 80); a.rect(cx - W * 0.48, -D * 0.99, cx + W * 0.48, -D * 0.9);
      a.log('Added the four tyres, articulated frames, engine, counterweight, cab, push arms and blade (plan and 3D).'); },
    vs: [['25 ton class', 132, 330, 128, 0, {}], ['35 ton class', 148, 370, 140, 0, {}], ['45 ton class', 164, 405, 152, 0, {}]] }),
];

// ------------------------------------------------------------------------------------------------ haulage
/** a dump body as a side-profile prism with ribs. (yA front, yB rear), floor heights zA (front) zB (rear), top zT */
function dumpBody(a, x0, x1, yA, yB, zA, zB, zT, ribs = 5, t = 60) {
  prismX(a, [[yA, zA], [yB, zB], [yB, zT], [yA, zT]], x0, x1);
  for (let i = 0; i <= ribs; i++) { const y = yA + ((yB - yA) * i) / ribs; for (const x of [x0 - 14, x1]) a.box(x, y - 22, zB + (zA - zB) * (1 - i / ribs) * 0.9 + 100, x + 14, y + 22, zT - 20); }
  a.box(x0 - 20, yA, zT - 40, x1 + 20, yB, zT);
  a.rect(x0, yA, x1, yB, 'EQUIP-DETAIL'); a.line(x0, (yA + yB) / 2, x1, (yA + yB) / 2, 'EQUIP-DETAIL');
}
/** rigid off-highway dump truck */
function rigidDump(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.22, tw = r * 0.62, fz = Z0 + H * 0.34;
  for (const sx of [-1, 1]) { tyre(a, cx + sx * (W * 0.46 - tw / 2), -D * 0.8, r, tw); tyre(a, cx + sx * (W * 0.46 - tw), -D * 0.16, r, tw); tyre(a, cx + sx * (W * 0.46 - tw * 1.75), -D * 0.16, r, tw); }
  a.box(cx - W * 0.3, -D * 0.9, fz, cx + W * 0.3, -D * 0.04, fz + H * 0.08);
  a.xcyl(cx - W * 0.42, cx + W * 0.42, -D * 0.8, Z0 + r, r * 0.12, 10); a.xcyl(cx - W * 0.36, cx + W * 0.36, -D * 0.16, Z0 + r, r * 0.14, 10);
  a.box(cx - W * 0.25, -D * 0.995, fz + H * 0.02, cx + W * 0.25, -D * 0.9, fz + H * 0.3);                  // hood
  a.box(cx - W * 0.2, -D * 0.998, fz + H * 0.06, cx + W * 0.2, -D * 0.99, fz + H * 0.26);                   // grille
  a.box(cx - W * 0.4, -D * 0.93, fz, cx - W * 0.1, -D * 0.73, fz + H * 0.06);                                // deck
  cabin(a, cx - W * 0.4, cx - W * 0.14, -D * 0.92, -D * 0.78, fz + H * 0.06, fz + H * 0.38);
  a.box(cx - W * 0.42, -D * 0.96, Z1 - H * 0.07, cx + W * 0.42, -D * 0.5, Z1 - H * 0.04);                   // canopy
  ladder(a, cx - W * 0.46, -D * 0.84, 0, Z0 + 150, fz + H * 0.08, 380); a.line(cx - W * 0.46, -D * 0.84, cx - W * 0.4, -D * 0.84, 'EQUIP-DETAIL');
  dumpBody(a, cx - W * 0.38, cx + W * 0.38, -D * 0.72, 0, fz + H * 0.14, fz + H * 0.06, Z1 - H * 0.12, 6);
  for (const sx of [-1, 1]) hyd(a, [cx + sx * W * 0.22, -D * 0.4, fz + H * 0.02], [cx + sx * W * 0.22, -D * 0.46, fz + H * 0.2], H * 0.03);
  a.box(cx - W * 0.26, -D * 0.56, Z1 - H * 0.12, cx + W * 0.26, -D * 0.3, Z1 - H * 0.1);
  a.log('Added the front and dual rear tyres, frame, hood, cab on a deck, ladder, canopy, dump body with ribs and hoist cylinders (plan and 3D).');
}
/** articulated dump truck: o.ax = rear axle count (1 or 2) */
function articDump(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.27, tw = W * 0.2, fz = Z0 + r * 1.6;
  const ys = [-D * 0.78, -D * 0.4, -D * 0.2];
  for (const y of ys) for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - tw / 2 - 40), y, r, tw);
  for (const y of ys) a.xcyl(cx - W * 0.4, cx + W * 0.4, y, Z0 + r, r * 0.14, 10);
  a.box(cx - W * 0.28, -D * 0.96, fz - 100, cx + W * 0.28, -D * 0.66, fz + H * 0.16);                      // front frame and hood
  a.box(cx - W * 0.2, -D * 0.995, fz + H * 0.02, cx + W * 0.2, -D * 0.96, fz + H * 0.14);
  cabin(a, cx - W * 0.28, cx + W * 0.28, -D * 0.88, -D * 0.74, fz + H * 0.12, Z1 - H * 0.2);
  a.cyl(cx + W * 0.2, -D * 0.9, fz + H * 0.16, fz + H * 0.3, 26, 8);
  a.box(cx - W * 0.24, -D * 0.68, fz - 60, cx + W * 0.24, -D * 0.04, fz + 40);                              // rear frame
  a.cyl(cx, -D * 0.66, fz - 60, fz + 120, 120, 12);
  dumpBody(a, cx - W * 0.44, cx + W * 0.44, -D * 0.68, -D * 0.0 - 4, fz + 60, fz + H * 0.02, Z1 - 10, 5);
  for (const sx of [-1, 1]) hyd(a, [cx + sx * W * 0.2, -D * 0.5, fz - 20], [cx + sx * W * 0.2, -D * 0.46, fz + H * 0.14], H * 0.025);
  for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - tw / 2 - 40) - tw * 0.55, -D * 0.82 - r * 1.05, fz + H * 0.02, cx + sx * (W / 2 - tw / 2 - 40) + tw * 0.55, -D * 0.82 + r * 1.05, fz + 60);
  a.line(cx - W * 0.4, -D * 0.68, cx + W * 0.4, -D * 0.68, 'EQUIP-DETAIL');
  a.log('Added the three axles, six tyres, articulated frames and hitch, hood, cab, mudguards, dump body with ribs and hoist cylinders (plan and 3D).');
}
/** road tipper truck, cab forward, tipper body behind. o.ax = axle ys as fractions of D */
function roadTipper(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.17, tw = W * 0.12, ax = o.ax ?? [0.8, 0.22, 0.1], fz = Z0 + r * 1.55;
  for (const f of ax) { for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - tw), -D * f, r, tw); if (f < 0.4) tyre(a, cx + sx * (W / 2 - tw * 2.1), -D * f, r, tw); } a.xcyl(cx - W * 0.42, cx + W * 0.42, -D * f, Z0 + r, r * 0.12, 8); }
  a.box(cx - W * 0.3, -D * 0.995, fz - 80, cx + W * 0.3, -D * 0.02, fz + 100);
  cabin(a, cx - W * 0.44, cx + W * 0.44, -D * 0.995, -D * 0.82, fz + 80, fz + H * 0.52);
  a.box(cx - W * 0.4, -D * 0.998, Z0 + r * 0.9, cx + W * 0.4, -D * 0.98, Z0 + r * 1.3);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.3 - 60, -D * 0.998, fz + H * 0.14, cx + sx * W * 0.3 + 60, -D * 0.988, fz + H * 0.2);
  dumpBody(a, cx - W * 0.46, cx + W * 0.46, -D * 0.78, 0, fz + 180, fz + 100, Z1 - 10, 4);
  a.box(cx - W * 0.46, -D * 0.8, fz + 100, cx + W * 0.46, -D * 0.78, Z1 + 0);
  hyd(a, [cx, -D * 0.62, fz + 60], [cx, -D * 0.54, fz + 300], 70);
  a.log('Added the axles with single and dual tyres, chassis, forward cab with bumper and lamps, tipper body with ribs and headboard, and a hoist cylinder (plan and 3D).');
}
/** end-dump tipper semi trailer or bottom-dump trailer. o: bottom, ax */
function tipperTrailer(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.16, tw = W * 0.12, ax = o.ax ?? 3, fz = Z0 + r * 1.7;
  for (let i = 0; i < ax; i++) { const y = -D * 0.12 - i * r * 2.3; for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - tw), y, r, tw); tyre(a, cx + sx * (W / 2 - tw * 2.2), y, r, tw); } a.xcyl(cx - W * 0.42, cx + W * 0.42, y, Z0 + r, r * 0.12, 8); }
  a.box(cx - W * 0.2, -D * 0.96, fz - 100, cx + W * 0.2, -D * 0.04, fz);
  a.cyl(cx, -D * 0.95, fz - 60, fz + 60, 140, 12);
  for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.3, -D * 0.9, fz - 80], [cx + sx * W * 0.3, -D * 0.9, Z0 + 30]], [40, 40], 6); a.box(cx + sx * W * 0.3 - 100, -D * 0.93, Z0, cx + sx * W * 0.3 + 100, -D * 0.87, Z0 + 40); }
  if (o.bottom) {
    prismX(a, [[-D * 0.98, fz + 120], [-D * 0.04, fz + 120], [-D * 0.04, Z1], [-D * 0.98, Z1]], cx - W * 0.46, cx + W * 0.46);
    for (const sx of [-1, 1]) prismX(a, [[-D * 0.98, fz - 100], [-D * 0.04, fz - 100], [-D * 0.04, fz + 120], [-D * 0.98, fz + 120]], sx < 0 ? cx - W * 0.46 : cx + W * 0.46 - W * 0.12, sx < 0 ? cx - W * 0.46 + W * 0.12 : cx + W * 0.46);
    a.box(cx - W * 0.2, -D * 0.7, fz - 140, cx + W * 0.2, -D * 0.3, fz - 80);
    a.line(cx - W * 0.2, -D * 0.7, cx + W * 0.2, -D * 0.7, 'EQUIP-DETAIL'); a.line(cx - W * 0.2, -D * 0.3, cx + W * 0.2, -D * 0.3, 'EQUIP-DETAIL');
  } else {
    dumpBody(a, cx - W * 0.46, cx + W * 0.46, -D * 0.98, -D * 0.0 - 6, fz + 140, fz + 140, Z1, 8);
    a.box(cx - W * 0.46, -D * 0.0 - 30, fz + 140, cx + W * 0.46, 0, Z1);
    hyd(a, [cx, -D * 0.84, fz + 20], [cx, -D * 0.78, fz + H * 0.36], 100); a.tube([[cx, -D * 0.78, fz + H * 0.36], [cx, -D * 0.76, fz + H * 0.55]], [60, 50], 8);
  }
  a.log('Added the kingpin plate, frame, landing legs, axles with dual tyres, ' + (o.bottom ? 'a bottom-dump hopper with gate lines' : 'a ribbed tipper body with a telescopic hoist ram and tailgate') + ' (plan and 3D).');
}
/** a water cart or fuel tanker on a truck chassis */
function tankTruck(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * (o.rr ?? 0.2), tw = W * 0.12, fz = Z0 + r * 1.55;
  const ax = o.ax ?? [0.8, 0.2, 0.09];
  for (const f of ax) { for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - tw), -D * f, r, tw); if (f < 0.4) tyre(a, cx + sx * (W / 2 - tw * 2.1), -D * f, r, tw); } a.xcyl(cx - W * 0.42, cx + W * 0.42, -D * f, Z0 + r, r * 0.12, 8); }
  a.box(cx - W * 0.3, -D * 0.995, fz - 80, cx + W * 0.3, -D * 0.02, fz + 100);
  cabin(a, cx - W * 0.44, cx + W * 0.44, -D * 0.995, -D * 0.82, fz + 80, fz + H * 0.48);
  a.box(cx - W * 0.4, -D * 0.998, Z0 + r * 0.9, cx + W * 0.4, -D * 0.98, Z0 + r * 1.3);
  const tr = m.min(W * 0.46, (Z1 - fz - 120) / 2), tz = fz + 120 + tr;
  a.ycyl(-D * 0.78, -D * 0.1, cx, tz, tr, 24); a.ell(cx, -D * 0.78, tz, tr, tr * 0.25, tr, 14, 6); a.ell(cx, -D * 0.1, tz, tr, tr * 0.25, tr, 14, 6);
  for (let i = 1; i < 4; i++) a.ycyl(-D * 0.78 + i * D * 0.17 - 20, -D * 0.78 + i * D * 0.17 + 20, cx, tz, tr + 14, 20);
  a.cyl(cx, -D * 0.5, tz + tr, tz + tr + 120, 120, 12); a.line(cx - tr, -D * 0.78, cx - tr, -D * 0.1, 'EQUIP-DETAIL'); a.line(cx + tr, -D * 0.78, cx + tr, -D * 0.1, 'EQUIP-DETAIL');
  if (o.spray) { a.box(cx - W * 0.45, -D * 0.04, fz - 60, cx + W * 0.45, 0, fz + 20); for (let i = 0; i < 7; i++) a.box(cx - W * 0.4 + i * W * 0.13, -D * 0.02, fz - 100, cx - W * 0.4 + i * W * 0.13 + 30, 0, fz - 60); a.box(cx - W * 0.2, -D * 0.12, fz - 100, cx + W * 0.2, -D * 0.04, fz + 40); }
  else { a.box(cx - W * 0.3, -D * 0.08, fz + 20, cx + W * 0.3, 0, fz + 400); for (const sx of [-1, 1]) a.cyl(cx + sx * W * 0.15, -D * 0.04, fz + 400, fz + 480, 90, 10); }
  a.rect(cx - tr, -D * 0.78, cx + tr, -D * 0.1, 'EQUIP-DETAIL');
  a.log('Added the axles and dual tyres, chassis, forward cab, the horizontal tank with baffle bands and a roof manway, ' + (o.spray ? 'a spray bar with nozzles and a pump box' : 'a rear hose and pump cabinet') + ' (plan and 3D).');
}
/** low-loader trailer. o.ax axle count, o.ramps */
function lowboy(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.3, tw = W * 0.1, ax = o.ax ?? 3, deck = Z0 + H * 0.28;
  for (let i = 0; i < ax; i++) { const y = -D * 0.06 - i * r * 2.1; for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - tw), y, r, tw); tyre(a, cx + sx * (W / 2 - tw * 2.2), y, r, tw); } a.xcyl(cx - W * 0.42, cx + W * 0.42, y, Z0 + r, r * 0.12, 8); }
  const rearEnd = -D * 0.06 - (ax - 1) * r * 2.1 - r;
  a.box(cx - W * 0.46, -D * 0.74, deck - 90, cx + W * 0.46, -D * 0.04, deck);                                  // main deck
  a.box(cx - W * 0.4, -D * 0.74, deck - 260, cx + W * 0.4, rearEnd, deck - 90);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.46 - (sx > 0 ? 40 : 0), -D * 0.74, deck, cx + sx * W * 0.46 + (sx > 0 ? 0 : 40), -D * 0.04, deck + 50);
  a.box(cx - W * 0.22, -D * 0.98, Z1 - 170, cx + W * 0.22, -D * 0.82, Z1);                                    // gooseneck
  a.tube([[cx - W * 0.2, -D * 0.82, Z1 - 80], [cx - W * 0.2, -D * 0.72, deck - 40]], [60, 60], 8); a.tube([[cx + W * 0.2, -D * 0.82, Z1 - 80], [cx + W * 0.2, -D * 0.72, deck - 40]], [60, 60], 8);
  a.cyl(cx, -D * 0.94, Z1 - 230, Z1 - 170, 130, 12);
  if (o.ramps) for (const sx of [-1, 1]) prismX(a, [[-D * 0.04, deck - 90], [-D * 0.0 - 4, deck - 40], [-D * 0.0 - 4, deck], [-D * 0.04, deck]], sx < 0 ? cx - W * 0.3 : cx + W * 0.2, sx < 0 ? cx - W * 0.2 : cx + W * 0.3);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.3 - 40, -D * 0.04, deck - 40, cx + sx * W * 0.3 + 40, 0, deck + 40);
  for (let i = 0; i < 6; i++) a.box(cx - W * 0.46 - 0, -D * 0.2 - i * D * 0.1, deck - 40, cx - W * 0.46 - 36, -D * 0.2 - i * D * 0.1 + 80, deck);
  a.rect(cx - W * 0.46, -D * 0.74, cx + W * 0.46, -D * 0.04, 'EQUIP-DETAIL'); a.line(cx - W * 0.22, -D * 0.98, cx - W * 0.22, -D * 0.74, 'EQUIP-DETAIL'); a.line(cx + W * 0.22, -D * 0.98, cx + W * 0.22, -D * 0.74, 'EQUIP-DETAIL');
  a.log('Added the gooseneck and kingpin plate, the lowered main deck with side rails, the dual-tyre axles, rear ramps and lashing rings (plan and 3D).');
}
/** site dumper (forward tip, wheels) or tracked carrier */
function siteDumper(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.2, tw = W * 0.2, th = H * 0.3;
  if (o.tracks) for (const sx of [-1, 1]) track(a, cx + sx * (W / 2 - W * 0.14), W * 0.26, -D * 0.96, -D * 0.04, th, Z0);
  else for (const y of [-D * 0.78, -D * 0.2]) for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - tw / 2), y, r, tw);
  const bz = Z0 + (o.tracks ? th : r * 1.3);
  a.box(cx - W * 0.3, -D * 0.95, bz, cx + W * 0.3, -D * 0.05, bz + H * 0.1);
  // skip: a tilted tray in front, operator at the rear
  prismX(a, [[-D * 0.995, bz + H * 0.22], [-D * 0.32, bz + H * 0.12], [-D * 0.32, bz + H * (o.swivel ? 0.5 : 0.56)], [-D * 0.995, bz + H * 0.5]], cx - W * 0.46, cx + W * 0.46);
  a.box(cx - W * 0.46 - 12, -D * 0.995, bz + H * 0.45, cx + W * 0.46 + 12, -D * 0.32, bz + H * 0.5);
  hyd(a, [cx, -D * 0.6, bz + H * 0.1], [cx, -D * 0.66, bz + H * 0.2], 40);
  a.box(cx - W * 0.28, -D * 0.28, bz + H * 0.1, cx + W * 0.28, -D * 0.04, bz + H * 0.32);
  rops(a, cx - W * 0.28, cx + W * 0.28, -D * 0.28, -D * 0.1, bz + H * 0.32, Z1 - 20);
  a.box(cx - W * 0.16, -D * 0.2, bz + H * 0.32, cx + W * 0.16, -D * 0.12, bz + H * 0.42);
  if (o.swivel) a.cyl(cx, -D * 0.52, bz + H * 0.1, bz + H * 0.16, W * 0.2, 14);
  a.rect(cx - W * 0.46, -D * 0.995, cx + W * 0.46, -D * 0.32, 'EQUIP-DETAIL');
  a.log('Added the ' + (o.tracks ? 'two tracks' : 'four tyres') + ', chassis, forward-tipping skip with its cylinder, the operator seat and roll-over frame (plan and 3D).');
}
/** plant trailer with a tilting bed */
function plantTrailer(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.28, tw = W * 0.1, deck = Z0 + r * 1.55;
  for (let i = 0; i < (o.ax ?? 2); i++) { const y = -D * 0.26 - i * r * 2.1; for (const sx of [-1, 1]) tyre(a, cx + sx * (W / 2 - tw), y, r, tw); a.xcyl(cx - W * 0.42, cx + W * 0.42, y, Z0 + r, r * 0.12, 8); }
  a.box(cx - W * 0.46, -D * 0.78, deck - 90, cx + W * 0.46, -D * 0.22, deck);
  prismX(a, [[-D * 0.22, deck - 90], [-D * 0.0 - 5, Z0 + 120], [-D * 0.0 - 5, Z0 + 180], [-D * 0.22, deck]], cx - W * 0.46, cx + W * 0.46);
  a.box(cx - W * 0.46, -D * 0.78, deck, cx - W * 0.46 + 40, -D * 0.22, deck + 80); a.box(cx + W * 0.46 - 40, -D * 0.78, deck, cx + W * 0.46, -D * 0.22, deck + 80);
  a.tube([[cx, -D * 0.78, deck - 50], [cx, -D * 0.995, Z0 + H * 0.7]], [70, 40], 8); a.box(cx - 90, -D * 0.998, Z0 + H * 0.66, cx + 90, -D * 0.96, Z0 + H * 0.78);
  hyd(a, [cx - W * 0.2, -D * 0.6, deck - 60], [cx - W * 0.2, -D * 0.3, deck - 30], 45);
  a.box(cx + W * 0.26, -D * 0.74, deck, cx + W * 0.42, -D * 0.66, deck + 500);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.2 - 40, -D * 0.86, Z0, cx + sx * W * 0.2 + 40, -D * 0.8, Z0 + 200);
  a.rect(cx - W * 0.46, -D * 0.78, cx + W * 0.46, -D * 0.22, 'EQUIP-DETAIL'); a.line(cx - W * 0.46, -D * 0.22, cx + W * 0.46, -D * 0.22, 'EQUIP-DETAIL');
  a.log('Added the drawbar with towing eye, the flat bed with side rails, a fold-down ramp, the axles with tyres, the tilt cylinder and a winch box (plan and 3D).');
}
/** lube and fuel service truck for earthworks */
function serviceTruck(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.2, tw = W * 0.12, fz = Z0 + r * 1.55;
  for (const f of [0.8, 0.2]) { for (const sx of [-1, 1]) { tyre(a, cx + sx * (W / 2 - tw), -D * f, r, tw); if (f < 0.4) tyre(a, cx + sx * (W / 2 - tw * 2.1), -D * f, r, tw); } }
  a.box(cx - W * 0.3, -D * 0.995, fz - 80, cx + W * 0.3, -D * 0.02, fz + 100);
  cabin(a, cx - W * 0.44, cx + W * 0.44, -D * 0.995, -D * 0.8, fz + 80, fz + H * 0.48);
  a.box(cx - W * 0.46, -D * 0.78, fz + 100, cx + W * 0.46, 0, Z1 - 200);                                          // service body
  for (let i = 0; i < 4; i++) { const y = -D * 0.76 + i * D * 0.18; a.box(cx - W * 0.46 - 8, y, fz + 220, cx - W * 0.46, y + D * 0.15, Z1 - 380); a.box(cx + W * 0.46, y, fz + 220, cx + W * 0.46 + 8, y + D * 0.15, Z1 - 380); }
  a.box(cx - W * 0.4, -D * 0.74, Z1 - 200, cx + W * 0.4, -D * 0.4, Z1 - 100);
  for (const sx of [-1, 1]) { a.xcyl(cx + sx * W * 0.46 + (sx > 0 ? 8 : -8), cx + sx * W * 0.46 + (sx > 0 ? 80 : -80), -D * 0.32, fz + 900, 180, 14); }
  a.box(cx - W * 0.3, -D * 0.38, Z1 - 200, cx + W * 0.3, -D * 0.0, Z1);
  a.cyl(cx, -D * 0.2, Z1, Z1 + 0, 5, 4);
  a.rect(cx - W * 0.46, -D * 0.78, cx + W * 0.46, 0, 'EQUIP-DETAIL');
  a.log('Added the axles with dual tyres, chassis, forward cab, service body with side compartments, two hose reels and the tank deck (plan and 3D).');
}
const HAUL = [
  fam({ cat: 'earthmoving/haulage', title: 'Generic rigid dump truck', desc: (v) => `Rigid dump truck, ${v.label}: front and dual rear tyres, a frame, hood, cab on a side deck with a ladder, a canopy over the cab and a ribbed dump body with hoist cylinders.`, build: (a, v) => rigidDump(a, v),
    vs: [['20 ton payload class, quarry', 130, 280, 130, 0, {}], ['40 ton payload class', 170, 340, 160, 0, {}], ['60 ton payload class', 200, 370, 180, 0, {}], ['100 ton payload class', 236, 400, 210, 0, {}], ['150 ton payload class', 280, 460, 240, 0, {}], ['250 ton payload class', 330, 560, 290, 0, {}]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic articulated dump truck', desc: (v) => `Articulated dump truck, ${v.label}: three axles with six tyres, an articulation hitch, a hood and cab, mudguards and a ribbed dump body with hoist cylinders.`, build: (a, v) => articDump(a, v),
    vs: [['20 ton payload class', 105, 330, 125, 0, {}], ['25 ton payload class', 112, 350, 130, 0, {}], ['30 ton payload class', 119, 370, 134, 0, {}], ['40 ton payload class', 132, 390, 140, 0, {}], ['60 ton payload class', 150, 430, 152, 0, {}]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic tipper truck, earthworks', desc: (v) => `Road tipper truck, ${v.label}: single and dual tyres on ${v.ax.length} axles, a forward cab with bumper and lamps, a ribbed tipper body with headboard and a hoist cylinder.`, build: (a, v) => roadTipper(a, v),
    vs: [['4x2, 7 ton payload class', 82, 252, 100, 0, { ax: [0.8, 0.18] }], ['6x4, 13 ton payload class', 94, 310, 108, 0, { ax: [0.82, 0.26, 0.1] }], ['6x4, 18 ton payload class', 98, 330, 112, 0, { ax: [0.82, 0.26, 0.1] }],
      ['8x4, 22 ton payload class', 100, 360, 116, 0, { ax: [0.86, 0.72, 0.22, 0.1] }], ['8x4, 26 ton payload class, steel body', 102, 380, 120, 0, { ax: [0.86, 0.72, 0.22, 0.1] }]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic end-dump semi trailer', desc: (v) => `End-dump tipper trailer, ${v.label}: kingpin plate, landing legs, ${v.ax} axles with dual tyres, a ribbed body with a tailgate and a telescopic hoist ram.`, build: (a, v) => tipperTrailer(a, v),
    vs: [['2 axle, 24 ft body', 100, 330, 118, 0, { ax: 2 }], ['3 axle, 32 ft body', 102, 440, 122, 0, { ax: 3 }], ['3 axle, 40 ft body', 102, 540, 126, 0, { ax: 3 }], ['4 axle, 42 ft body', 102, 580, 128, 0, { ax: 4 }]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic bottom-dump trailer', desc: (v) => `Bottom-dump trailer, ${v.label}: kingpin plate, landing legs, ${v.ax} axles with dual tyres and a hopper body with sloped sides and a clamshell gate underneath.`, build: (a, v) => tipperTrailer(a, { ...v, bottom: true }),
    vs: [['2 axle, 18 yd3', 100, 320, 118, 0, { ax: 2 }], ['3 axle, 26 yd3', 102, 420, 122, 0, { ax: 3 }], ['3 axle, 34 yd3', 102, 480, 128, 0, { ax: 3 }]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic dust-suppression water cart', desc: (v) => `Water cart truck, ${v.label}: a forward cab, a horizontal tank with baffle bands and a roof manway, a rear spray bar with nozzles and a pump box, on dual-tyred axles.`, build: (a, v) => tankTruck(a, { ...v, spray: true }),
    vs: [['2,000 gal tank', 92, 260, 98, 0, { ax: [0.78, 0.2] }], ['4,000 gal tank', 98, 320, 108, 0, { ax: [0.8, 0.22, 0.1] }], ['8,000 gal tank', 102, 380, 118, 0, { ax: [0.82, 0.24, 0.1] }], ['12,000 gal tank, off-road', 126, 440, 140, 0, { rr: 0.24, ax: [0.8, 0.22, 0.1] }], ['20,000 gal tank, off-road', 148, 500, 160, 0, { rr: 0.25, ax: [0.8, 0.22, 0.1] }]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic earthworks fuel and lube service truck', desc: (v) => `Service truck, ${v.label}: a forward cab, a service body with side compartments, two hose reels and a tank deck on the roof, on dual-tyred axles.`, build: (a, v) => serviceTruck(a, v),
    vs: [['4x2, 1,500 gal', 90, 270, 112, 0, {}], ['6x4, 2,500 gal', 98, 320, 120, 0, {}], ['6x4, 4,000 gal, with lube bays', 102, 360, 128, 0, {}]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic low-loader trailer', desc: (v) => `Low-loader trailer, ${v.label}: a gooseneck with a kingpin plate, a lowered main deck with side rails, dual-tyre axles, rear ramps and lashing rings.`, build: (a, v) => lowboy(a, { ...v, ramps: true }),
    vs: [['2 axle, 25 ton class', 102, 420, 60, 0, { ax: 2 }], ['3 axle, 40 ton class', 102, 500, 62, 0, { ax: 3 }], ['4 axle, 60 ton class', 102, 560, 64, 0, { ax: 4 }], ['6 axle, 100 ton class', 120, 640, 68, 0, { ax: 6 }]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic tilt-bed plant trailer', desc: (v) => `Plant trailer, ${v.label}: a drawbar with towing eye, a flat bed with side rails, a fold-down rear ramp, ${v.ax} axles with tyres, a tilt cylinder and a winch box.`, build: (a, v) => plantTrailer(a, v),
    vs: [['3.5 ton class, 1 axle', 78, 190, 40, 0, { ax: 1 }], ['8 ton class, 2 axle', 90, 270, 46, 0, { ax: 2 }], ['14 ton class, 3 axle', 98, 330, 52, 0, { ax: 3 }]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic site dumper', desc: (v) => `Site dumper, ${v.label}: four tyres, a chassis, a forward-tipping skip with its cylinder, an operator seat and a roll-over frame${v.swivel ? ', with a swivel ring under the skip' : ''}.`, build: (a, v) => siteDumper(a, v),
    vs: [['1 ton skip', 38, 98, 54, 0, {}], ['3 ton skip', 56, 128, 66, 0, {}], ['6 ton skip, swivel', 66, 150, 76, 0, { swivel: 1 }], ['9 ton skip', 80, 180, 88, 0, {}], ['10 ton skip, swivel', 82, 190, 92, 0, { swivel: 1 }], ['15 ton skip', 96, 230, 102, 0, {}]] }),
  fam({ cat: 'earthmoving/haulage', title: 'Generic tracked dumper', desc: (v) => `Tracked dumper, ${v.label}: two rubber tracks, a chassis, a forward-tipping skip with its cylinder, a rear operator seat and a roll-over frame.`, build: (a, v) => siteDumper(a, { ...v, tracks: true }),
    vs: [['0.5 ton skip, mini', 28, 66, 40, 0, {}], ['1 ton skip, mini', 36, 88, 52, 0, {}], ['6 ton skip', 70, 150, 76, 0, {}], ['10 ton skip', 84, 190, 90, 0, {}]] }),
];

// ------------------------------------------------------------------------------------------------ compaction and paving
/** a roller drum across the machine: axle height = radius above z0 */
function drum(a, cx, y, rD, wD, pad = 0, zc = null) {
  zc = zc ?? a.Z0 + rD;
  a.xcyl(cx - wD / 2, cx + wD / 2, y, zc, rD, 28); a.xcyl(cx - wD / 2 - 30, cx + wD / 2 + 30, y, zc, rD * 0.3, 12);
  a.rect(cx - wD / 2, y - rD, cx + wD / 2, y + rD, 'EQUIP-DETAIL');
  if (pad) { const rows = m.max(4, m.round(wD / 220)), nf = 20; for (let k = 0; k < rows; k++) { const x = cx - wD / 2 + (wD * (k + 0.5)) / rows; for (let i = 0; i < nf; i++) { const g = (i / nf) * PI * 2 + (k % 2) * PI / nf; const px = x, py = y + m.cos(g) * rD, pz = zc + m.sin(g) * rD; a.tube([[px, py, pz], [px, py + m.cos(g) * pad, pz + m.sin(g) * pad]], [26, 18], 5); } } }
}
/** ride-on roller, single drum articulated (o.pad = padfoot) or tandem (o.tandem) */
function roller(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const rD = H * (o.tandem ? 0.3 : 0.34), pad = o.pad ? rD * 0.1 : 0, rD2 = rD - pad;
  const wDf = W * (o.tandem ? 0.96 : 0.99);
  drum(a, cx, -D * (o.tandem ? 0.8 : 0.78) + 0, rD2, wDf, pad, Z0 + rD);
  const bz = Z0 + rD * 1.55;
  if (o.tandem) drum(a, cx, -D * 0.2, rD2, wDf, pad, Z0 + rD); else for (const sx of [-1, 1]) tyre(a, cx + sx * W * 0.38, -D * 0.2, H * 0.28, W * 0.2);
  a.box(cx - W * 0.3, -D * 0.95, bz - H * 0.1, cx + W * 0.3, -D * 0.64, bz + H * 0.1);
  for (const sx of [-1, 1]) a.box(cx + sx * wDf / 2 - (sx > 0 ? 40 : 0), -D * 0.78 - rD * 0.5, Z0 + rD * 1.2, cx + sx * wDf / 2 + (sx > 0 ? 0 : 40), -D * 0.78 + rD * 0.5, bz + H * 0.1);
  a.box(cx - W * 0.32, -D * 0.4, bz - H * 0.08, cx + W * 0.32, -D * 0.02, bz + H * 0.22);
  a.box(cx - W * 0.3, -D * 0.64, bz + H * 0.1, cx + W * 0.3, -D * 0.42, bz + H * 0.2);
  if (o.cab) cabin(a, cx - W * 0.28, cx + W * 0.28, -D * 0.64, -D * 0.4, bz + H * 0.2, Z1 - 30); else rops(a, cx - W * 0.26, cx + W * 0.26, -D * 0.6, -D * 0.44, bz + H * 0.2, Z1 - 30);
  a.box(cx - W * 0.2, -D * 0.62, bz + H * 0.2 - 10, cx + W * 0.2, -D * 0.44, bz + H * 0.27);
  a.box(cx - W * 0.2, -D * 0.995, bz - 50, cx + W * 0.2, -D * 0.95, bz + H * 0.12);
  a.rect(cx - W * 0.3, -D * 0.95, cx + W * 0.3, -D * 0.02, 'EQUIP-DETAIL'); a.line(cx - W * 0.4, -D * 0.5, cx + W * 0.4, -D * 0.5, 'EQUIP-DETAIL');
  a.log('Added the ' + (o.tandem ? 'two vibratory drums' : 'front drum' + (o.pad ? ' with padfoot studs' : '') + ' and two rear tyres') + ', frame, hood, ' + (o.cab ? 'cab' : 'roll-over frame') + ' and scraper bar (plan and 3D).');
}
/** pedestrian roller: drums, engine and a handle */
function walkRoller(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const rD = H * 0.28, wD = W * 0.86;
  for (const y of o.single ? [-D * 0.7] : [-D * 0.74, -D * 0.38]) drum(a, cx, y, rD, wD, 0, Z0 + rD);
  a.box(cx - W * 0.36, -D * 0.82, Z0 + rD * 1.4, cx + W * 0.36, -D * 0.3, Z0 + H * 0.62);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.45 - 12, -D * 0.74 - 60, Z0 + rD * 0.6, cx + sx * W * 0.45 + 12, -D * 0.38 + 60, Z0 + rD * 1.5);
  a.box(cx - W * 0.2, -D * 0.5, Z0 + H * 0.62, cx + W * 0.2, -D * 0.2, Z0 + H * 0.72);
  a.tube([[cx, -D * 0.3, Z0 + H * 0.6], [cx, -D * 0.04, Z1 - 60]], [16, 16], 6); a.xcyl(cx - W * 0.3, cx + W * 0.3, -D * 0.04, Z1 - 40, 16, 8);
  a.rect(cx - W * 0.36, -D * 0.82, cx + W * 0.36, -D * 0.3, 'EQUIP-DETAIL'); a.line(cx, -D * 0.3, cx, 0, 'EQUIP-DETAIL');
  a.log('Added the ' + (o.single ? 'single drum' : 'two drums') + ', frame side plates, engine, and the folding handle (plan and 3D).');
}
/** plate compactor and rammer */
function plateComp(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  if (o.rammer) {
    a.box(cx - W * 0.4, YF + D * 0.1, Z0, cx + W * 0.4, -D * 0.1, Z0 + H * 0.1);
    a.cyl(cx, -D * 0.5, Z0 + H * 0.1, Z0 + H * 0.45, W * 0.2, 14); for (let i = 0; i < 5; i++) a.cyl(cx, -D * 0.5, Z0 + H * 0.2 + i * H * 0.04, Z0 + H * 0.22 + i * H * 0.04, W * 0.24, 14);
    a.box(cx - W * 0.35, -D * 0.7, Z0 + H * 0.45, cx + W * 0.35, -D * 0.3, Z0 + H * 0.62);
    a.tube([[cx, -D * 0.3, Z0 + H * 0.5], [cx, -D * 0.05, Z1 - 60]], [14, 14], 6); a.xcyl(cx - W * 0.3, cx + W * 0.3, -D * 0.04, Z1 - 40, 14, 8);
    a.circ(cx, -D * 0.5, W * 0.2, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, YF + D * 0.1, cx + W * 0.4, -D * 0.1, 'EQUIP-DETAIL');
    a.log('Added the tamping shoe, the spring housing, the engine and fuel tank, and the handle (plan and 3D).'); return;
  }
  a.box(cx - W * 0.5, YF, Z0, cx + W * 0.5, -D * 0.1, Z0 + H * 0.06);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.5 - (sx > 0 ? 20 : 0), YF, Z0 + H * 0.06, cx + sx * W * 0.5 + (sx > 0 ? 0 : 20), -D * 0.1, Z0 + H * 0.12);
  a.box(cx - W * 0.4, -D * 0.78, Z0 + H * 0.08, cx + W * 0.4, -D * 0.4, Z0 + H * 0.4);                           // vibrator housing
  a.box(cx - W * 0.3, -D * 0.56, Z0 + H * 0.4, cx + W * 0.3, -D * 0.2, Z0 + H * 0.58);                           // engine
  a.cyl(cx + W * 0.2, -D * 0.34, Z0 + H * 0.58, Z0 + H * 0.66, 30, 8);
  if (o.rev) a.box(cx - W * 0.3, -D * 0.2, Z0 + H * 0.3, cx + W * 0.3, -D * 0.1, Z0 + H * 0.5);
  a.tube([[cx, -D * 0.2, Z0 + H * 0.3], [cx, -D * 0.02, Z1 - 50]], [18, 18], 6); a.xcyl(cx - W * 0.3, cx + W * 0.3, -D * 0.02, Z1 - 40, 18, 8);
  a.rect(cx - W * 0.5, YF, cx + W * 0.5, -D * 0.1); a.rect(cx - W * 0.4, -D * 0.78, cx + W * 0.4, -D * 0.2, 'EQUIP-DETAIL'); a.line(cx, -D * 0.2, cx, 0, 'EQUIP-DETAIL');
  a.log('Added the base plate with edge curves, the vibrator housing, the engine, fuel cap and the folding handle (plan and 3D).');
}
/** asphalt paver, crawler. o: screed width factor, wheeled */
function paver(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const th = H * 0.3;
  for (const sx of [-1, 1]) track(a, cx + sx * (W * 0.36), W * 0.14, -D * 0.82, -D * 0.28, th, Z0);
  a.box(cx - W * 0.24, -D * 0.78, Z0 + th * 0.4, cx + W * 0.24, -D * 0.3, Z0 + th + 100);
  // hopper wings and push rollers at the front
  prismX(a, [[-D * 0.995, Z0 + th + 60], [-D * 0.78, Z0 + th], [-D * 0.78, Z0 + H * 0.5], [-D * 0.995, Z0 + H * 0.58]], cx - W * 0.46, cx + W * 0.46);
  a.xcyl(cx - W * 0.3, cx + W * 0.3, -D * 0.995, Z0 + th * 0.6, th * 0.22, 12); a.xcyl(cx - W * 0.46, cx + W * 0.46, -D * 0.995, Z0 + H * 0.58, 18, 6);
  for (const sx of [-1, 1]) hyd(a, [cx + sx * W * 0.3, -D * 0.78, Z0 + H * 0.3], [cx + sx * W * 0.42, -D * 0.9, Z0 + H * 0.5], 24);
  a.box(cx - W * 0.3, -D * 0.78, Z0 + th, cx + W * 0.3, -D * 0.2, Z0 + H * 0.6);                              // body
  a.box(cx - W * 0.3, -D * 0.22, Z0 + H * 0.2, cx + W * 0.3, -D * 0.06, Z0 + H * 0.4);                         // auger housing
  a.xcyl(cx - W * 0.36, cx + W * 0.36, -D * 0.1, Z0 + H * 0.3, H * 0.07, 12);
  const sw = W * (o.sw ?? 0.98);
  a.box(cx - sw / 2, -D * 0.08, Z0 + H * 0.1, cx + sw / 2, 0, Z0 + H * 0.3); a.box(cx - sw / 2, -D * 0.12, Z0 + H * 0.28, cx + sw / 2, -D * 0.0, Z0 + H * 0.33);
  for (const sx of [-1, 1]) a.tube([[cx + sx * W * 0.3, -D * 0.2, Z0 + H * 0.3], [cx + sx * W * 0.34, -D * 0.06, Z0 + H * 0.24]], [24, 24], 6);
  // operator canopy
  a.box(cx - W * 0.3, -D * 0.6, Z0 + H * 0.6, cx + W * 0.3, -D * 0.3, Z0 + H * 0.68);
  for (const x of [cx - W * 0.28, cx + W * 0.28]) a.tube([[x, -D * 0.6, Z0 + H * 0.68], [x, -D * 0.6, Z1 - 30]], [14, 14], 6);
  a.box(cx - W * 0.34, -D * 0.64, Z1 - 30, cx + W * 0.34, -D * 0.26, Z1);
  a.cyl(cx, -D * 0.4, Z0 + H * 0.68, Z0 + H * 0.82, 120, 10);
  a.rect(cx - sw / 2, -D * 0.12, cx + sw / 2, 0); a.rect(cx - W * 0.46, -D * 0.995, cx + W * 0.46, -D * 0.78, 'EQUIP-DETAIL'); a.line(cx - W * 0.3, -D * 0.78, cx - W * 0.3, -D * 0.1, 'EQUIP-DETAIL'); a.line(cx + W * 0.3, -D * 0.78, cx + W * 0.3, -D * 0.1, 'EQUIP-DETAIL');
  a.log('Added the two crawler tracks, the front hopper with wings and push roller, the body, auger, the screed, tow arms and the operator canopy (plan and 3D).');
}
/** cold milling machine or soil stabilizer. o.stab, o.rw rotor width fraction */
function miller(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const th = H * 0.28, wr = H * 0.16;
  for (const sx of [-1, 1]) for (const y of [-D * 0.7, -D * 0.2]) { if (o.wheels) tyre(a, cx + sx * W * 0.4, y, H * 0.2, W * 0.14); else track(a, cx + sx * W * 0.4, W * 0.12, y - D * 0.08, y + D * 0.08, th, Z0); a.box(cx + sx * W * 0.4 - 50, y - 50, Z0 + th, cx + sx * W * 0.4 + 50, y + 50, Z0 + H * 0.44); }
  a.box(cx - W * 0.32, -D * 0.84, Z0 + H * 0.44, cx + W * 0.32, -D * 0.06, Z0 + H * 0.56);                    // frame
  a.box(cx - W * 0.28, -D * 0.2, Z0 + H * 0.56, cx + W * 0.28, -D * 0.02, Z0 + H * 0.74);                     // engine
  const rw = W * (o.rw ?? 0.7);
  a.box(cx - rw / 2, -D * 0.52, Z0 + 20, cx + rw / 2, -D * 0.38, Z0 + H * 0.44); a.xcyl(cx - rw / 2, cx + rw / 2, -D * 0.45, Z0 + wr + 20, wr, 22);
  for (let i = 0; i < m.round(rw / 120); i++) a.box(cx - rw / 2 + i * 120, -D * 0.45 - wr - 14, Z0 + wr, cx - rw / 2 + i * 120 + 24, -D * 0.45 - wr + 4, Z0 + wr + 40);
  if (!o.stab) { prismX(a, [[-D * 0.995, Z0 + H * 0.78], [-D * 0.78, Z0 + H * 0.5], [-D * 0.78, Z0 + H * 0.62], [-D * 0.995, Z0 + H * 0.9]], cx - W * 0.09, cx + W * 0.09); a.line(cx, -D * 0.995, cx, -D * 0.5, 'EQUIP-DETAIL'); }
  else a.box(cx - W * 0.3, -D * 0.75, Z0 + H * 0.56, cx + W * 0.3, -D * 0.6, Z0 + H * 0.68);
  cabin(a, cx - W * 0.2, cx + W * 0.2, -D * 0.74, -D * 0.5, Z0 + H * 0.56, Z1 - 20);
  a.rect(cx - rw / 2, -D * 0.52, cx + rw / 2, -D * 0.38, 'EQUIP'); a.rect(cx - W * 0.32, -D * 0.84, cx + W * 0.32, -D * 0.06, 'EQUIP-DETAIL');
  a.log('Added the four ' + (o.wheels ? 'tyred' : 'tracked') + ' legs, frame, engine, the rotor housing with the cutter drum and teeth, ' + (o.stab ? 'a soil hood' : 'the front discharge conveyor') + ' and the cab (plan and 3D).');
}
/** pneumatic tyred roller */
function tyreRoller(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const r = H * 0.2, n = o.n ?? 4;
  for (let i = 0; i < n; i++) { const x = X0 + W * 0.06 + ((W * 0.88) * (i + 0.5)) / n; tyre(a, x, -D * 0.78, r, W * 0.86 / n - 10); }
  for (let i = 0; i < n + 1; i++) { const x = X0 + W * 0.06 + ((W * 0.88) * (i + 0.5)) / (n + 1); tyre(a, x, -D * 0.2, r, W * 0.86 / (n + 1) - 10); }
  a.box(cx - W * 0.44, -D * 0.95, Z0 + r * 1.2, cx + W * 0.44, -D * 0.04, Z0 + r * 1.9);
  a.box(cx - W * 0.4, -D * 0.5, Z0 + r * 1.9, cx + W * 0.4, -D * 0.1, Z0 + H * 0.6);
  a.box(cx - W * 0.3, -D * 0.95, Z0 + r * 1.9, cx + W * 0.3, -D * 0.52, Z0 + H * 0.55);
  rops(a, cx - W * 0.26, cx + W * 0.26, -D * 0.52, -D * 0.4, Z0 + H * 0.6, Z1 - 30);
  a.box(cx - W * 0.4, -D * 0.998, Z0 + r * 1.6, cx + W * 0.4, -D * 0.96, Z0 + r * 2.1);
  a.rect(cx - W * 0.44, -D * 0.95, cx + W * 0.44, -D * 0.04, 'EQUIP-DETAIL');
  a.log('Added the staggered front and rear tyre rows, the frame, ballast box, hood, roll-over frame and wetting bar (plan and 3D).');
}
/** towed single-drum roller and material transfer vehicle share small builders */
function towRoller(a) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const rD = H * 0.4; drum(a, cx, -D * 0.4, rD, W * 0.9, 0, Z0 + rD);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.46 - 15, -D * 0.4 - rD * 0.4, Z0 + rD * 0.4, cx + sx * W * 0.46 + 15, -D * 0.4 + rD * 0.4, Z0 + rD * 1.7);
  a.box(cx - W * 0.4, -D * 0.44, Z0 + rD * 1.7, cx + W * 0.4, -D * 0.36, Z0 + rD * 2);
  a.tube([[cx - W * 0.4, -D * 0.5, Z0 + rD * 1.8], [cx, -D * 0.995, Z0 + rD * 1.3]], [30, 24], 8); a.tube([[cx + W * 0.4, -D * 0.5, Z0 + rD * 1.8], [cx, -D * 0.995, Z0 + rD * 1.3]], [30, 24], 8);
  a.box(cx - 60, -D * 0.998, Z0 + rD * 1.2, cx + 60, -D * 0.96, Z0 + rD * 1.5);
  a.box(cx - W * 0.2, -D * 0.2, Z0 + rD * 1.9, cx + W * 0.2, -D * 0.05, Z1);
  a.log('Added the drum on its side frames, the A-frame drawbar with towing eye and the weight box (plan and 3D).');
}
function mtv(a) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const th = H * 0.26;
  for (const sx of [-1, 1]) track(a, cx + sx * W * 0.38, W * 0.15, -D * 0.82, -D * 0.2, th, Z0);
  a.box(cx - W * 0.25, -D * 0.78, Z0 + th * 0.4, cx + W * 0.25, -D * 0.22, Z0 + th + 100);
  prismX(a, [[-D * 0.995, Z0 + th + 100], [-D * 0.78, Z0 + th], [-D * 0.78, Z0 + H * 0.55], [-D * 0.995, Z0 + H * 0.62]], cx - W * 0.46, cx + W * 0.46);
  a.box(cx - W * 0.3, -D * 0.78, Z0 + th, cx + W * 0.3, -D * 0.1, Z0 + H * 0.5);
  a.tube([[cx, -D * 0.5, Z0 + H * 0.5], [cx, -D * 0.04, Z1 - 80]], [W * 0.1, W * 0.1], 10); a.box(cx - W * 0.2, -D * 0.1, Z1 - 160, cx + W * 0.2, 0, Z1);
  a.box(cx - W * 0.3, -D * 0.7, Z0 + H * 0.5, cx + W * 0.3, -D * 0.5, Z0 + H * 0.62);
  for (const x of [cx - W * 0.28, cx + W * 0.28]) a.tube([[x, -D * 0.7, Z0 + H * 0.62], [x, -D * 0.7, Z1 - 100]], [14, 14], 6); a.box(cx - W * 0.34, -D * 0.74, Z1 - 100, cx + W * 0.34, -D * 0.46, Z1 - 70);
  a.rect(cx - W * 0.46, -D * 0.995, cx + W * 0.46, -D * 0.78, 'EQUIP-DETAIL'); a.line(cx, -D * 0.78, cx, 0, 'EQUIP-DETAIL');
  a.log('Added the two tracks, the wide receiving hopper, the body, the inclined swing conveyor and the operator canopy (plan and 3D).');
}
const COMP = [
  fam({ cat: 'earthmoving/compaction', title: 'Generic single drum soil roller', desc: (v) => `Articulated single drum roller, ${v.label}: a smooth front drum, two rear tyres, a hood, ${v.cab ? 'an enclosed cab' : 'a roll-over frame'} and a scraper bar.`, build: (a, v) => roller(a, v),
    vs: [['7 ton class, 54 in drum', 59, 170, 94, 0, {}], ['10 ton class, 66 in drum', 71, 195, 100, 0, {}], ['14 ton class, 84 in drum', 88, 220, 110, 0, { cab: 1 }], ['18 ton class, 84 in drum', 90, 240, 116, 0, { cab: 1 }], ['25 ton class, 84 in drum', 92, 260, 124, 0, { cab: 1 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic padfoot soil roller', desc: (v) => `Articulated padfoot roller, ${v.label}: a front drum covered with studs, two rear tyres, a hood, an enclosed cab and a scraper bar.`, build: (a, v) => roller(a, { ...v, pad: true, cab: true }),
    vs: [['10 ton class, 66 in drum', 71, 200, 102, 0, {}], ['14 ton class, 84 in drum', 90, 225, 112, 0, {}], ['18 ton class, 84 in drum', 92, 245, 118, 0, {}], ['25 ton class, 84 in drum', 94, 265, 126, 0, {}]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic tandem asphalt roller', desc: (v) => `Articulated tandem roller, ${v.label}: two steel drums, a frame, a hood, a roll-over frame and a scraper bar.`, build: (a, v) => roller(a, { ...v, tandem: true }),
    vs: [['1.5 ton class, 28 in drums', 31, 100, 66, 0, {}], ['3 ton class, 39 in drums', 42, 120, 72, 0, {}], ['5 ton class, 47 in drums', 51, 140, 78, 0, {}], ['8 ton class, 60 in drums', 64, 170, 86, 0, { cab: 1 }], ['10 ton class, 66 in drums', 70, 188, 92, 0, { cab: 1 }], ['12 ton class, 84 in drums', 90, 205, 98, 0, { cab: 1 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic walk-behind roller, earthworks', desc: (v) => `Pedestrian roller, ${v.label}: ${v.single ? 'one vibrating drum' : 'two vibrating drums'}, side plates, an engine and a folding handle.`, build: (a, v) => walkRoller(a, v),
    vs: [['two drum, 24 in drums', 26, 62, 42, 0, {}], ['two drum, 32 in drums', 34, 72, 44, 0, {}], ['single drum trench roller, 20 in', 22, 56, 40, 0, { single: 1 }], ['single drum trench roller, 28 in', 30, 62, 42, 0, { single: 1 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic earthworks plate compactor', desc: (v) => `${v.rev ? 'Reversible' : 'Forward'} plate compactor, ${v.label}: a base plate with curved edges, a vibrator housing, an engine, a fuel cap and a folding handle.`, build: (a, v) => plateComp(a, v),
    vs: [['50 kg, 14 in plate', 14, 36, 36, 0, {}], ['90 kg, 18 in plate', 18, 42, 38, 0, {}], ['150 kg, 22 in plate, reversible', 22, 50, 40, 0, { rev: 1 }], ['300 kg, 28 in plate, reversible', 28, 56, 42, 0, { rev: 1 }], ['600 kg, 34 in plate, reversible', 34, 66, 44, 0, { rev: 1 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic earthworks vibratory rammer', desc: (v) => `Vibratory rammer, ${v.label}: a tamping shoe, a spring housing, an engine with a fuel tank and a handle.`, build: (a, v) => plateComp(a, { ...v, rammer: true }),
    vs: [['10 in shoe, 60 kg', 10, 14, 42, 0, {}], ['12 in shoe, 70 kg', 12, 16, 44, 0, {}], ['14 in shoe, 85 kg', 14, 18, 46, 0, {}]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic asphalt paver', desc: (v) => `Crawler asphalt paver, ${v.label}: two tracks, a front hopper with wings and a push roller, a body with auger, a screed with tow arms and an operator canopy.`, build: (a, v) => paver(a, v),
    vs: [['2.5 m screed, compact', 102, 210, 100, 0, { sw: 0.96 }], ['3.5 m screed', 114, 250, 110, 0, { sw: 1 }], ['5 m screed, extendable', 120, 280, 112, 0, { sw: 1 }], ['7 m screed, extendable', 132, 300, 118, 0, { sw: 1 }], ['9 m screed, extendable', 144, 320, 122, 0, { sw: 1 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic cold milling machine', desc: (v) => `Cold milling machine, ${v.label}: four tracked legs, a frame, an engine, a rotor housing with a toothed cutter drum, a front discharge conveyor and a cab.`, build: (a, v) => miller(a, v),
    vs: [['20 in cutting width', 60, 150, 76, 0, { rw: 0.5 }], ['40 in cutting width', 80, 230, 94, 0, { rw: 0.55 }], ['50 in cutting width', 100, 290, 104, 0, { rw: 0.6 }], ['79 in cutting width', 118, 360, 112, 0, { rw: 0.72 }], ['87 in cutting width', 126, 390, 116, 0, { rw: 0.74 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic soil stabilizer', desc: (v) => `Soil stabilizer and reclaimer, ${v.label}: four large tyres, a frame, an engine, a mixing rotor housing with a toothed rotor, a soil hood and a cab.`, build: (a, v) => miller(a, { ...v, stab: true, wheels: true, rw: 0.8 }),
    vs: [['8 ft rotor, 350 hp class', 118, 340, 114, 0, {}], ['8 ft rotor, 500 hp class', 120, 370, 120, 0, {}], ['8.5 ft rotor, 600 hp class', 124, 400, 124, 0, {}]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic pneumatic tyred roller', desc: (v) => `Pneumatic tyred roller, ${v.label}: staggered front and rear tyre rows, a frame, a ballast box, a roll-over frame and a wetting bar.`, build: (a, v) => tyreRoller(a, v),
    vs: [['7 tyres, 8 ton class', 66, 160, 80, 0, { n: 3 }], ['9 tyres, 14 ton class', 88, 190, 90, 0, { n: 4 }], ['11 tyres, 20 ton class', 98, 210, 96, 0, { n: 5 }]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic towed vibratory roller', desc: (v) => `Towed single drum roller, ${v.label}: a drum on side frames, an A-frame drawbar with a towing eye and a weight box.`, build: (a, v) => towRoller(a),
    vs: [['54 in drum, 5 ton class', 70, 140, 64, 0, {}], ['72 in drum, 9 ton class', 88, 160, 76, 0, {}]] }),
  fam({ cat: 'earthmoving/compaction', title: 'Generic material transfer vehicle', desc: (v) => `Material transfer vehicle for paving, ${v.label}: two tracks, a wide receiving hopper, an inclined swing conveyor and an operator canopy.`, build: (a, v) => mtv(a),
    vs: [['standard, 15 ton hopper', 120, 270, 130, 0, {}], ['high capacity, 25 ton hopper', 128, 300, 138, 0, {}]] }),
];

// ------------------------------------------------------------------------------------------------ attachments (plain objects, standing on the floor, opening toward the front)
/** an excavator or loader bucket on the floor with mounting ears. o: nt teeth, kind: dig|ditch|rock|side|light|multi, tilt */
function bucketObj(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const bd = D * 0.9, bh = H * (o.kind === 'ditch' ? 0.55 : 0.6), zl = Z0;
  const light = o.kind === 'light';
  prismX(a, [[YF + 40, zl + 10], [YF + 40 + bd * 0.9, zl + bh * 0.1 + 20], [YF + 40 + bd, zl + bh], [YF + 40 + bd * (light ? 0.02 : 0.12), zl + bh * (light ? 0.95 : 0.72)]], X0, X1);
  a.box(X0, YF + 10, zl, X1, YF + 40 + bd * 0.1, zl + 50);                                                    // cutting edge
  const nt = o.nt ?? 0; for (let i = 0; i < nt; i++) { const x = X0 + (W * (i + 0.5)) / nt; a.prism([[x - W / (nt * 4), YF], [x + W / (nt * 4), YF], [x + W / (nt * 3), YF + 60], [x - W / (nt * 3), YF + 60]], zl, zl + 90); }
  if (o.kind === 'rock') for (const sx of [-1, 1]) a.box(sx < 0 ? X0 - 0 : X1 - 24, YF + 40, zl, sx < 0 ? X0 + 24 : X1, YF + 40 + bd, zl + bh * 1.02);
  if (o.kind === 'side') { a.box(X0 + 20, YF + 40 + bd, zl + bh * 0.2, X1 - 20, YF + 40 + bd + 30, zl + bh); }
  // mounting ears at the back
  const ez = zl + bh;
  for (const sx of [-1, 1]) { const x = cx + sx * m.min(W * 0.25, 260); a.box(x - 18, YF + 40 + bd * 0.5, ez - 20, x + 18, YF + 40 + bd, ez + H * 0.25); a.xcyl(x - 30, x + 30, YF + 40 + bd * 0.8, ez + H * 0.18, 28, 10); }
  a.xcyl(cx - W * 0.25, cx + W * 0.25, YF + 40 + bd * 0.8, ez + H * 0.18, 12, 6);
  if (o.tilt) { a.box(cx - 200, YF + 40 + bd * 0.55, ez + H * 0.2, cx + 200, YF + 40 + bd, ez + H * 0.3); for (const sx of [-1, 1]) hyd(a, [cx + sx * 160, YF + 40 + bd * 0.9, ez + H * 0.28], [cx + sx * m.min(W * 0.3, 380), YF + 40 + bd * 0.7, ez + 20], 24); }
  a.rect(X0, YF + 10, X1, YF + 40 + bd, 'EQUIP'); a.line(X0, YF + 40 + bd * 0.3, X1, YF + 40 + bd * 0.3, 'EQUIP-DETAIL');
  a.log('Added the bucket shell, cutting edge' + (nt ? ', teeth' : '') + ', side plates, mounting ears with pin bores' + (o.tilt ? ' and a tilt head with two cylinders' : '') + ' (plan and 3D).');
}
/** hydraulic breaker */
function breaker(a) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const cy = (YF + 0) / 2, R = W * 0.4;
  a.box(cx - W * 0.45, cy - D * 0.35, Z1 - H * 0.12, cx + W * 0.45, cy + D * 0.35, Z1);                        // mounting bracket
  for (const sx of [-1, 1]) a.xcyl(cx + sx * W * 0.25 - 40, cx + sx * W * 0.25 + 40, cy, Z1 - H * 0.04, 30, 10);
  a.box(cx - W * 0.4, cy - D * 0.4, Z0 + H * 0.45, cx + W * 0.4, cy + D * 0.4, Z1 - H * 0.12);                  // power cell
  a.box(cx - W * 0.45, cy - D * 0.45, Z0 + H * 0.28, cx + W * 0.45, cy + D * 0.45, Z0 + H * 0.45);              // front head
  a.box(cx - W * 0.38, cy - D * 0.5, Z0 + H * 0.46, cx + W * 0.38, cy - D * 0.4, Z0 + H * 0.82);                // side guards
  a.box(cx - W * 0.38, cy + D * 0.4, Z0 + H * 0.46, cx + W * 0.38, cy + D * 0.5, Z0 + H * 0.82);
  a.cone(cx, cy, Z0 + 10, Z0 + H * 0.3, R * 0.12, R * 0.22, 10);                                              // chisel tool
  a.cone(cx, cy, Z0, Z0 + 30, R * 0.02, R * 0.12, 10);
  a.cyl(cx, cy, Z0 + H * 0.28, Z0 + H * 0.34, R * 0.3, 12);
  a.circ(cx, cy, R * 0.12, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.05, cy - D * 0.45, X1 - W * 0.05, cy + D * 0.45, 'EQUIP');
  a.log('Added the mounting bracket with pin bores, the power cell, the front head, side guards and the chisel tool (plan and 3D).');
}
/** rock or demolition grapple */
function grapple(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const n = o.n ?? 3, tz = H * 0.5;
  a.box(cx - W * 0.4, -D * 0.55, Z1 - H * 0.16, cx + W * 0.4, -D * 0.2, Z1);
  for (const sx of [-1, 1]) a.xcyl(cx + sx * W * 0.25 - 30, cx + sx * W * 0.25 + 30, -D * 0.38, Z1 - H * 0.08, 30, 10);
  a.box(cx - W * 0.45, -D * 0.6, Z0 + H * 0.38, cx + W * 0.45, -D * 0.12, Z1 - H * 0.16);                       // frame
  for (let i = 0; i < n; i++) { const x = X0 + W * 0.08 + ((W * 0.84) * (i + 0.5)) / n; a.tube([[x, -D * 0.5, Z0 + H * 0.4], [x, -D * 0.82, Z0 + H * 0.2], [x, YF + 40, Z0 + H * 0.04]], [W * 0.035, W * 0.03, W * 0.015], 8); }  // fixed tines
  for (let i = 0; i < n - 1; i++) { const x = X0 + W * 0.08 + ((W * 0.84) * (i + 1)) / n; a.tube([[x, -D * 0.12, Z0 + H * 0.5], [x, -D * 0.5, Z0 + H * 0.38], [x, -D * 0.88, Z0 + H * 0.12]], [W * 0.03, W * 0.025, W * 0.012], 8); }  // moving tines
  hyd(a, [cx, -D * 0.15, Z1 - H * 0.2], [cx, -D * 0.4, Z0 + H * 0.46], W * 0.05);
  a.rect(cx - W * 0.45, -D * 0.6, cx + W * 0.45, -D * 0.12, 'EQUIP'); for (let i = 0; i < n; i++) { const x = X0 + W * 0.08 + ((W * 0.84) * (i + 0.5)) / n; a.line(x, -D * 0.5, x, YF + 40, 'EQUIP-DETAIL'); }
  a.log('Added the mounting head with pin bores, the frame, fixed tines, moving tines and the closing cylinder (plan and 3D).');
}
/** earth auger: drive unit with flighted bit */
function auger(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx, cy } = a; a.outline(); const R = W * 0.5 * 0.95;
  a.cyl(cx, cy, Z1 - H * 0.2, Z1, R * 0.8 < 220 ? 220 : R * 0.8, 14); a.box(cx - 180, cy - 120, Z1 - H * 0.2 - 90, cx + 180, cy + 120, Z1 - H * 0.2);
  a.cyl(cx, cy, Z0 + 120, Z1 - H * 0.2, 55, 10);
  const nf = m.round((H * 0.8) / 120);
  for (let i = 0; i < nf; i++) { const z = Z0 + 120 + i * 120, ph = i * 0.9; a.ell(cx + m.cos(ph) * R * 0.2, cy + m.sin(ph) * R * 0.2, z, R * 0.95, R * 0.95, 14, 14, 3); }
  a.cone(cx, cy, Z0, Z0 + 120, 20, R * 0.7, 12); a.box(cx - R * 0.8, cy - 12, Z0 + 40, cx + R * 0.8, cy + 12, Z0 + 80);
  a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, 55, 'EQUIP-DETAIL'); a.line(cx - R, cy, cx + R, cy, 'EQUIP-DETAIL');
  a.log('Added the drive unit with its motor housing, the shaft, a helical flight and the pilot tip with cutting teeth (plan and 3D).');
}
/** quick coupler */
function coupler(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.3); a.box(X0 + W * 0.1, YF, Z0 + H * 0.3, X1 - W * 0.1, 0, Z1 - H * 0.2);
  for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.32 - 25, YF, Z1 - H * 0.2, cx + sx * W * 0.32 + 25, 0, Z1); a.xcyl(cx + sx * W * 0.32 - 45, cx + sx * W * 0.32 + 45, YF * 0.5, Z1 - H * 0.12, 36, 10); }
  a.xcyl(X0, X1, YF + D * 0.12, Z0 + H * 0.2, 40, 10); a.xcyl(X0, X1, -D * 0.12, Z0 + H * 0.2, 40, 10);
  a.prism([[X0 + 20, YF], [X0 + W * 0.2, YF], [X0 + W * 0.2, YF + D * 0.25], [X0 + 20, YF + D * 0.2]], Z0, Z0 + H * 0.3);
  if (o.hyd) hyd(a, [cx, YF * 0.2, Z0 + H * 0.5], [cx, YF * 0.8, Z0 + H * 0.4], 28);
  a.rect(X0, YF, X1, 0, 'EQUIP'); a.circ(cx - W * 0.32, YF * 0.5, 36, 'EQUIP-DETAIL'); a.circ(cx + W * 0.32, YF * 0.5, 36, 'EQUIP-DETAIL');
  a.log('Added the coupler body with pin bores, two hook jaws and a locking ' + (o.hyd ? 'cylinder' : 'wedge') + ' (plan and 3D).');
}
/** thumb */
function thumb(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  a.box(X0, YF * 0.2 - 100, Z1 - H * 0.2, X1, YF * 0.2 + 100, Z1);
  const n = o.n ?? 1, tw = W * 0.3 / n;
  for (let i = 0; i < n; i++) { const x = cx - W * 0.3 + ((W * 0.6) * (i + 0.5)) / n; a.tube([[x, YF * 0.2, Z1 - H * 0.1], [x, YF * 0.5, Z0 + H * 0.7], [x, YF + 40, Z0 + H * 0.2]], [W * 0.1 / n + 20, W * 0.07 / n + 15, 16], 8); }
  hyd(a, [cx, YF * 0.1, Z1 - 80], [cx, YF * 0.5, Z0 + H * 0.5], 28);
  a.rect(X0, YF * 0.2 - 100, X1, YF * 0.2 + 100); a.line(cx, YF * 0.2, cx, YF, 'EQUIP-DETAIL');
  a.log('Added the mounting bracket, the curved ' + (n > 1 ? 'tines' : 'tine') + ' and the closing cylinder (plan and 3D).');
}
/** dozer blade on its push frame */
function blade(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const bh = H * 0.9, yb = YF + D * 0.1;
  prismX(a, [[yb, Z0 + 30], [yb + 220, Z0 + 30], [yb + 240, Z0 + bh], [yb + 80, Z0 + bh]], cx - W * (o.U ? 0.4 : 0.5), cx + W * (o.U ? 0.4 : 0.5));
  a.box(cx - W * (o.U ? 0.4 : 0.5), yb - 25, Z0, cx + W * (o.U ? 0.4 : 0.5), yb + 50, Z0 + 90);
  if (o.U) for (const sx of [-1, 1]) prismX(a, [[yb - D * 0.1, Z0 + 30], [yb, Z0 + 30], [yb + 220, Z0 + bh], [yb - D * 0.08, Z0 + bh]], sx < 0 ? cx - W * 0.5 : cx + W * 0.4, sx < 0 ? cx - W * 0.4 : cx + W * 0.5);
  for (const sx of [-1, 1]) { a.tube([[cx + sx * W * 0.34, yb + 240, Z0 + bh * 0.4], [cx + sx * W * 0.3, -D * 0.15, Z0 + bh * 0.5]], [60, 55], 8); a.box(cx + sx * W * 0.3 - 80, -D * 0.2, Z0 + bh * 0.3, cx + sx * W * 0.3 + 80, 0, Z0 + bh * 0.7); }
  hyd(a, [cx + W * 0.26, -D * 0.2, Z1 - 80], [cx + W * 0.3, yb + 220, Z0 + bh * 0.92], 36);
  a.rect(cx - W * 0.5, yb - 25, cx + W * 0.5, yb + 240); a.rect(cx - W * 0.34 - 80, -D * 0.2, cx + W * 0.34 + 80, 0, 'EQUIP-DETAIL');
  a.log('Added the curved moldboard with cutting edge' + (o.U ? ' and side wings' : '') + ', two push arms with trunnions and the tilt cylinder (plan and 3D).');
}
/** ripper with shanks */
function ripper(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const n = o.n ?? 3;
  a.box(X0, -D * 0.3, Z0 + H * 0.5, X1, 0, Z1 - 40);
  for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.4 - 50, -D * 0.5, Z0 + H * 0.35, cx + sx * W * 0.4 + 50, 0, Z1); a.xcyl(cx + sx * W * 0.4 - 80, cx + sx * W * 0.4 + 80, -D * 0.4, Z1 - H * 0.12, 40, 10); }
  for (let i = 0; i < n; i++) { const x = n === 1 ? cx : cx - W * 0.3 + ((W * 0.6) * i) / (n - 1); a.prism([[x - 60, -D * 0.4], [x + 60, -D * 0.4], [x + 50, YF + D * 0.2], [x - 50, YF + D * 0.2]], Z0 + H * 0.5, Z1 - 60); a.prism([[x - 60, -D * 0.4], [x + 60, -D * 0.4], [x + 40, YF + 40], [x - 40, YF + 40]], Z0, Z0 + H * 0.55); }
  hyd(a, [cx, 0, Z1 - 60], [cx, -D * 0.3, Z0 + H * 0.6], 40);
  a.rect(X0, -D * 0.3, X1, 0); for (let i = 0; i < n; i++) { const x = n === 1 ? cx : cx - W * 0.3 + ((W * 0.6) * i) / (n - 1); a.circ(x, -D * 0.4, 60, 'EQUIP-DETAIL'); }
  a.log('Added the toolbar, the parallelogram arms with pin bores, ' + n + ' shank' + (n > 1 ? 's' : '') + ' with tips and the lift cylinder (plan and 3D).');
}
/** pallet forks on a carriage */
function forks(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  a.box(X0, -80, Z0 + 20, X1, 0, Z1);
  for (let i = 0; i < 4; i++) a.box(X0, -100, Z0 + 20 + ((H - 20) * i) / 4 + 30, X1, -80, Z0 + 20 + ((H - 20) * i) / 4 + 90);
  a.box(X0 + 20, -120, Z1 - 100, X1 - 20, -80, Z1);
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.28; a.box(x - 55, YF, Z0, x + 55, -80, Z0 + 55); a.box(x - 55, -140, Z0, x + 55, -80, Z0 + H * 0.4); a.prism([[x - 55, YF], [x + 55, YF], [x + 55, YF + 260], [x - 55, YF + 260]], Z0, Z0 + 20); }
  a.rect(X0, -80, X1, 0); for (const sx of [-1, 1]) a.rect(cx + sx * W * 0.28 - 55, YF, cx + sx * W * 0.28 + 55, -80, 'EQUIP-DETAIL');
  a.log('Added the carriage frame with a load backrest and two tapered tines with their heel blocks (plan and 3D).');
}
/** angle broom */
function sweeper(a, o = {}) {
  const { X0, X1, YF, Z0, Z1, W, D, H, cx } = a; a.outline();
  const R = H * 0.4, yc = -D * 0.5;
  a.xcyl(X0 + 80, X1 - 80, yc, Z0 + R, R, 24); a.xcyl(X0 + 40, X1 - 40, yc, Z0 + R, R * 0.35, 10);
  const n = 18; for (let i = 0; i < n; i++) { const x = X0 + 80 + ((W - 160) * (i + 0.5)) / n; a.tube([[x, yc, Z0 + R], [x, yc + m.cos(i) * R * 0.98, Z0 + R + m.sin(i) * R * 0.98]], [R * 0.13, R * 0.1], 6); }
  a.box(X0, yc + R * 0.2, Z0 + R * 0.6, X1, yc + R * 1.4, Z0 + R * 2.1);                                      // hood
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.5 - (sx > 0 ? 30 : 0), yc - R * 0.5, Z0 + R * 0.4, cx + sx * W * 0.5 + (sx > 0 ? 0 : 30), yc + R * 1.4, Z0 + R * 2.1);
  a.box(cx - W * 0.3, -D * 0.08, Z0 + R * 0.9, cx + W * 0.3, 0, Z1);
  a.tube([[cx, -D * 0.04, Z0 + R * 1.6], [cx, yc + R, Z0 + R * 1.6]], [40, 40], 8);
  a.rect(X0, yc - R, X1, yc + R * 1.4); a.line(X0, yc, X1, yc, 'EQUIP-DETAIL');
  a.log('Added the bristle roller with fins, the end plates, the hood, the mounting block and the drive arm (plan and 3D).');
}
const bDesc = (what) => (v) => `${what}, ${v.label}: a bucket shell with a cutting edge, side plates and mounting ears with pin bores${v.nt ? ', with ' + v.nt + ' teeth' : ''}${v.tilt ? ' and a tilt head with two cylinders' : ''}.`;
const ATT = [
  fam({ cat: 'earthmoving/attachments', title: 'Generic excavator digging bucket', desc: bDesc('Digging bucket'), build: (a, v) => bucketObj(a, { ...v, kind: 'dig' }),
    vs: [['12 in, mini', 12, 20, 18, 0, { nt: 3 }], ['18 in, mini', 18, 24, 20, 0, { nt: 3 }], ['24 in, 5 ton class', 24, 30, 26, 0, { nt: 4 }], ['30 in, 8 ton class', 30, 34, 28, 0, { nt: 4 }], ['36 in, 14 ton class', 36, 40, 32, 0, { nt: 5 }], ['48 in, 20 ton class', 48, 48, 38, 0, { nt: 5 }], ['60 in, 30 ton class', 60, 56, 44, 0, { nt: 6 }], ['72 in, 50 ton class', 72, 64, 50, 0, { nt: 7 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic ditch cleaning bucket', desc: bDesc('Ditch cleaning bucket'), build: (a, v) => bucketObj(a, { ...v, kind: 'ditch' }),
    vs: [['48 in, smooth edge', 48, 36, 24, 0, {}], ['60 in, smooth edge', 60, 40, 26, 0, {}], ['72 in, smooth edge, 20 ton class', 72, 44, 28, 0, {}]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic heavy duty rock bucket', desc: bDesc('Heavy duty rock bucket'), build: (a, v) => bucketObj(a, { ...v, kind: 'rock' }),
    vs: [['36 in, 20 ton class', 36, 42, 34, 0, { nt: 4 }], ['48 in, 30 ton class', 48, 50, 40, 0, { nt: 5 }], ['60 in, 50 ton class, quarry', 60, 60, 48, 0, { nt: 5 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic tilt bucket', desc: bDesc('Tilting grading bucket'), build: (a, v) => bucketObj(a, { ...v, kind: 'ditch', tilt: true }),
    vs: [['60 in, 14 ton class', 60, 38, 34, 0, {}], ['72 in, 20 ton class', 72, 42, 36, 0, {}], ['84 in, 30 ton class', 84, 46, 38, 0, {}]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic loader bucket', desc: bDesc('Loader bucket'), build: (a, v) => bucketObj(a, v),
    vs: [['general purpose, 78 in, skid steer', 78, 32, 28, 0, { kind: 'dig' }], ['light material, 96 in, wheel loader', 96, 48, 40, 0, { kind: 'light' }], ['general purpose, 120 in, wheel loader, teeth', 120, 56, 46, 0, { kind: 'dig', nt: 6 }], ['side dump, 90 in, compact loader', 90, 40, 36, 0, { kind: 'side' }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic excavator hydraulic breaker', desc: (v) => `Hydraulic breaker, ${v.label}: a mounting bracket with pin bores, a power cell, a front head, side guards and a chisel tool.`, build: (a, v) => breaker(a),
    vs: [['mini, 12 in wide', 12, 14, 46, 0, {}], ['8 ton class, 14 in wide', 14, 16, 56, 0, {}], ['20 ton class, 20 in wide', 20, 22, 82, 0, {}], ['30 ton class, 24 in wide', 24, 26, 100, 0, {}], ['50 ton class, 30 in wide', 30, 32, 124, 0, {}]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic excavator grapple', desc: (v) => `Grapple, ${v.label}: a mounting head with pin bores, a frame, ${v.n} fixed tines, ${v.n - 1} moving tines and a closing cylinder.`, build: (a, v) => grapple(a, v),
    vs: [['rock grapple, 8 ton class', 30, 34, 40, 0, { n: 3 }], ['rock grapple, 20 ton class', 42, 48, 54, 0, { n: 3 }], ['demolition grapple, 30 ton class', 54, 58, 64, 0, { n: 4 }], ['demolition grapple, 50 ton class', 66, 70, 76, 0, { n: 4 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic earth auger', desc: (v) => `Earth auger, ${v.label}: a drive unit with its motor housing, a shaft, a helical flight and a pilot tip with cutting teeth.`, build: (a, v) => auger(a),
    vs: [['12 in bit, 60 in long', 12, 12, 76, 0, {}], ['18 in bit, 72 in long', 18, 18, 90, 0, {}], ['24 in bit, 72 in long', 24, 24, 92, 0, {}], ['36 in bit, 84 in long', 36, 36, 106, 0, {}]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic excavator quick coupler', desc: (v) => `Quick coupler, ${v.label}: a coupler body with pin bores, two hook jaws and a locking ${v.hyd ? 'cylinder' : 'wedge'}.`, build: (a, v) => coupler(a, v),
    vs: [['mechanical, 8 ton class', 14, 12, 12, 0, {}], ['hydraulic, 20 ton class', 22, 20, 18, 0, { hyd: 1 }], ['hydraulic, 50 ton class', 30, 28, 24, 0, { hyd: 1 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic excavator thumb', desc: (v) => `Hydraulic thumb, ${v.label}: a mounting bracket, ${v.n > 1 ? 'curved tines' : 'a curved tine'} and a closing cylinder.`, build: (a, v) => thumb(a, v),
    vs: [['single tine, 14 ton class', 16, 40, 26, 0, { n: 1 }], ['two tine, 30 ton class', 28, 56, 34, 0, { n: 2 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic dozer blade', desc: (v) => `Dozer blade assembly, ${v.label}: a curved moldboard with a cutting edge${v.U ? ' and side wings' : ''}, two push arms with trunnions and a tilt cylinder.`, build: (a, v) => blade(a, v),
    vs: [['straight, 10 ft, 15 ton class', 120, 100, 46, 0, {}], ['semi-universal, 12 ft, 25 ton class', 144, 112, 54, 0, { U: 1 }], ['universal, 16 ft, 55 ton class', 192, 130, 66, 0, { U: 1 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic dozer ripper', desc: (v) => `Ripper, ${v.label}: a toolbar, parallelogram arms with pin bores, ${v.n} shank${v.n > 1 ? 's' : ''} with tips and a lift cylinder.`, build: (a, v) => ripper(a, v),
    vs: [['single shank, 25 ton class', 36, 96, 66, 0, { n: 1 }], ['three shank, 55 ton class', 100, 120, 80, 0, { n: 3 }]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic pallet forks, earthworks', desc: (v) => `Pallet forks, ${v.label}: a carriage frame with a load backrest and two tapered tines with heel blocks.`, build: (a, v) => forks(a),
    vs: [['48 in tines, skid steer', 48, 48, 40, 0, {}], ['60 in tines, loader', 60, 60, 48, 0, {}], ['72 in tines, wheel loader', 72, 72, 56, 0, {}]] }),
  fam({ cat: 'earthmoving/attachments', title: 'Generic angle broom', desc: (v) => `Angle broom, ${v.label}: a bristle roller with fins, end plates, a hood, a mounting block and a drive arm.`, build: (a, v) => sweeper(a),
    vs: [['72 in, skid steer', 76, 40, 34, 0, {}], ['96 in, loader', 100, 44, 38, 0, {}]] }),
];
export default [...EXC, ...LOADERS, ...HAUL, ...COMP, ...ATT];
