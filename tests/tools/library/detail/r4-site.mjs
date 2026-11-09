/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4, site: aircraft and airport ground support, airfield and curbside, restaurant patios and drive-thru, mall entrances, parking and plaza. Original geometry; scale shapes, not particular vehicles. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const IN = 25.4, FT = 304.8, m = Math;

/** extrude a convex polygon given as [y, z] points between x0 and x1 (a fin, a stair stringer, a boom) */
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** a wheel on a lateral axle at (x, y) with radius r resting on the floor, width w */
function whl(a, x, y, r, w = 150) { a.xcyl(x - w / 2, x + w / 2, y, a.Z0 + r, r, 18); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); a.xcyl(x - w / 2 - 4, x + w / 2 + 4, y, a.Z0 + r, r * 0.45, 10); }
/** wheels on both sides at each y */
function wheelPairs(a, ys, r, w = 150, inset = 10) { for (const y of ys) for (const sx of [a.X0 + inset + w / 2, a.X1 - inset - w / 2]) whl(a, sx, y, r, w); }
/** vertical rails (a handrail) from (x0,y0) to (x1,y1) at z, as a post-and-rail */
function rail(a, x0, y0, x1, y1, z0, z1, t = 14, posts = 3) {
  a.tube([[x0, y0, z1], [x1, y1, z1]], [t, t], 6);
  for (let i = 0; i < posts; i++) { const f = posts === 1 ? 0 : i / (posts - 1); a.tube([[x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z0], [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, z1]], [t * 0.8, t * 0.8], 6); }
  a.line(x0, y0, x1, y1, 'EQUIP-DETAIL');
}



/** a thin ring of tube (a loop) */
function ring(a, cx, cy, z, r, t = 4, n = 24) { const pts = []; for (let i = 0; i <= n; i++) { const g = (i / n) * m.PI * 2; pts.push([cx + m.cos(g) * r, cy + m.sin(g) * r, z]); } a.tube(pts, pts.map(() => t), 5); }
/** a square pyramid frustum canopy: apex ring at zt (half width hw*0.08), base at zb (half width hw) */
function pyramid(cx, cy, zb, zt, hw) {
  const t = [], b = [[cx - hw, cy - hw, zb], [cx + hw, cy - hw, zb], [cx + hw, cy + hw, zb], [cx - hw, cy + hw, zb]], k = hw * 0.06, c = [[cx - k, cy - k, zt], [cx + k, cy - k, zt], [cx + k, cy + k, zt], [cx - k, cy + k, zt]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push([b[i], b[j], c[j]], [b[i], c[j], c[i]]); }
  t.push([c[0], c[2], c[1]], [c[0], c[3], c[2]], [b[0], b[1], b[2]], [b[0], b[2], b[3]]);
  return t;
}

/** a truck front: frame rails, cab block with hood, windscreen, bumper, lamps and wheel pairs. o: cabL, cabH, ground, wr, axles (offsets from the nose) */
function cabTruck(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, gz = Z0 + (o.ground ?? 450);
  a.box(X0 + 110, YF + 60, gz, X1 - 110, YB - 40, gz + 260);
  const nose = o.nose ?? 650;
  a.box(X0 + 80, YF + nose, gz + 140, X1 - 80, YF + o.cabL, Z0 + o.cabH); a.box(X0 + 120, YF + 30, gz + 140, X1 - 120, YF + nose, gz + 800);
  a.frame(X0 + 140, Z0 + o.cabH * 0.55, X1 - 140, Z0 + o.cabH - 160, YF + nose - 6, YF + nose + 20, 40);
  for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 80) - 8 * (sx > 0 ? 0 : 1) - (sx > 0 ? 0 : 0), YF + nose + 300, Z0 + o.cabH * 0.55, cx + sx * (W / 2 - 80) + 8, YF + o.cabL - 200, Z0 + o.cabH - 160); a.box(cx + sx * (W / 2 + 10) - 12, YF + nose + 120, Z0 + o.cabH * 0.6, cx + sx * (W / 2 + 10) + 12, YF + nose + 200, Z0 + o.cabH * 0.6 + 400); }
  a.box(X0 + 60, YF, gz, X1 - 60, YF + 70, gz + 220); for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 330) - 110, YF + 22, gz + 480, cx + sx * (W / 2 - 330) + 110, YF + 40, gz + 600);
  a.rect(X0 + 80, YF + 30, X1 - 80, YF + o.cabL, 'EQUIP-DETAIL'); a.line(X0 + 80, YF + nose, X1 - 80, YF + nose, 'EQUIP-DETAIL');
  wheelPairs(a, o.axles.map((y) => YF + y), o.wr, 300, 20);
  return a;
}

// ---------------------------------------------------------------------------------------- aircraft
/** A generic aircraft from a fuselage tube, swept wings, engines, tail and gear. Nose at −Y. o: fd (mm), gear, wing {r, c0, c1, sw}, eng 'wing'|'aft'|'prop', ne, hi, tt (T-tail) */
function plane(a, o) {
  const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, L = a.D, R = o.fd / 2, zc = Z0 + o.gear + R, S2 = W / 2;
  const st = [[0, 0.1], [0.025, 0.5], [0.07, 0.82], [0.12, 0.97], [0.18, 1], [0.6, 1], [0.78, 0.8], [0.92, 0.45], [1, 0.1]];
  a.tube(st.map(([f]) => [cx, YF + f * L, zc + (f > 0.6 ? ((f - 0.6) / 0.4) * R * 0.4 : 0)]), st.map(([, r]) => R * r), 20);
  a.ellp(cx, (YF + YB) / 2, R, L / 2); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
  for (const sx of [-1, 1]) a.box(cx + sx * (R - 3) - 4, YF + L * 0.22, zc + R * 0.18, cx + sx * (R - 3) + 4, YF + L * 0.62, zc + R * 0.32);
  a.box(cx - R * 0.7, YF + L * 0.045, zc + R * 0.3, cx + R * 0.7, YF + L * 0.075, zc + R * 0.55);
  // wings
  const w = o.wing, yr = YF + L * w.r, zw = o.hi ? zc + R * 0.85 : zc - R * 0.55, ws = S2 - R * 0.8;
  const sweep = w.sw * L;
  for (const s of [-1, 1]) {
    const pts = [[cx + s * R * 0.8, yr], [cx + s * S2, yr + sweep], [cx + s * S2, yr + sweep + w.c1 * L], [cx + s * R * 0.8, yr + w.c0 * L]];
    a.prism(s > 0 ? pts : pts.slice().reverse(), zw, zw + 90 * (o.hi ? 0.8 : 1));
    a.poly(pts);
    if (o.winglet) a.box(cx + s * S2 - 14, yr + sweep, zw + 90, cx + s * S2, yr + sweep + w.c1 * L, zw + 90 + 420);   // winglet
  }
  // engines
  const er = o.er ?? R * 0.32;
  if (o.eng === 'wing' || o.eng === 'prop') {
    const xs = o.ne === 4 ? [0.33, 0.62] : [0.38];
    for (const f of xs) for (const s of [-1, 1]) {
      const x = cx + s * S2 * f, y0 = yr + sweep * f - er * (o.eng === 'prop' ? 1.8 : 2.8), len = er * (o.eng === 'prop' ? 5.5 : 5), zE = o.hi ? zw - er * 0.2 : zw - er * 1.1;
      a.tube([[x, y0, zE], [x, y0 + len * 0.15, zE], [x, y0 + len * 0.9, zE], [x, y0 + len, zE]], [er * 0.85, er, er, er * 0.5], 16);
      a.box(x - 20, y0 + len * 0.25, o.hi ? zE - er : zE + er * 0.5, x + 20, y0 + len * 0.85, o.hi ? zw : zw + 5);
      a.rect(x - er, y0, x + er, y0 + len, 'EQUIP'); a.circ(x, y0, er, 'EQUIP-DETAIL');
      if (o.eng === 'prop') { const pr = er * 2.2; a.box(x - 25, y0 - 40, zE - pr, x + 25, y0 - 10, zE + pr); a.box(x - pr, y0 - 40, zE - 25, x + pr, y0 - 10, zE + 25); a.ell(x, y0 - 40, zE, 70, 70, 70, 8, 5); a.line(x - pr, y0 - 25, x + pr, y0 - 25, 'EQUIP-DETAIL'); }
    }
  } else if (o.eng === 'aft') {
    for (const s of [-1, 1]) { const x = cx + s * (R + er * 0.9), y0 = YF + L * 0.62, len = er * 5.2, zE = zc + R * 0.35; a.tube([[x, y0, zE], [x, y0 + len * 0.2, zE], [x, y0 + len * 0.9, zE], [x, y0 + len, zE]], [er * 0.8, er, er, er * 0.45], 14); a.box(x - 18 * s, y0 + len * 0.2, zE - er * 0.2, cx + s * R * 0.7, y0 + len * 0.8, zE + er * 0.2); a.rect(x - er, y0, x + er, y0 + len, 'EQUIP'); a.circ(x, y0, er, 'EQUIP-DETAIL'); }
  }
  // tail: fin and stabilisers
  const fy0 = YB - L * 0.2, fy1 = YB - L * 0.03, zf0 = zc + R * 0.6, zTop = Z1;
  prismX(a, [[fy0 - L * 0.012, zf0 - 40], [fy1 + 0, zf0 - 40], [fy1 + L * 0.0, zTop - 20], [fy0 + (fy1 - fy0) * 0.35, zTop]], cx - 38, cx + 38);
  a.rect(cx - 38, fy0, cx + 38, fy1, 'EQUIP-DETAIL');
  const sz = o.tt ? zTop - 40 : zc + R * 0.55, ss = o.stab ?? S2 * 0.36, sy = YB - L * 0.13;
  for (const s of [-1, 1]) { const pts = [[cx + s * 30, sy], [cx + s * ss, sy + L * 0.04], [cx + s * ss, sy + L * 0.085], [cx + s * 30, sy + L * 0.105]]; a.prism(s > 0 ? pts : pts.slice().reverse(), sz, sz + 50); a.poly(pts); }
  // gear
  const gz = Z0 + o.gear;
  for (const s of [-1, 1]) { const x = cx + s * R * 1.3, y = yr + L * 0.075 + sweep * (R * 1.3 / S2); a.tube([[x, y, gz + 150], [x, y, zw]], [28, 28], 8); a.xcyl(x - 150, x + 150, y, Z0 + 330, 330, 16); a.rect(x - 150, y - 330, x + 150, y + 330, 'EQUIP-DETAIL'); }
  a.tube([[cx, YF + L * 0.1, gz + 120], [cx, YF + L * 0.1, zc - R * 0.5]], [24, 24], 8); a.xcyl(cx - 110, cx + 110, YF + L * 0.1, Z0 + 260, 260, 14);
  a.log('Added the fuselage, cockpit and window bands, swept wings, engines, fin, tailplanes and landing gear (plan and 3D).');
}
const PLANE_VS = (rows) => rows.map(([label, len, span, tail, p]) => [label, len * 12, span * 12, tail * 12, 0, p]);

const FAMS = [
  // ===================================================== aircraft (scale shapes) =====================================================
  fam({ cat: 'site/vehicles', title: 'Generic narrow-body airliner',
    desc: (v) => `Twin-engine narrow-body airliner shape, ${v.len} ft long with a ${v.span} ft span: a round fuselage with window bands, swept low wings, two underwing engines, a fin with tailplanes and tricycle landing gear.`,
    vs: [['100 ft fuselage', 100, 94, 36, 0], ['120 ft fuselage', 120, 112, 38, 0], ['130 ft fuselage', 130, 112, 39, 0], ['140 ft fuselage', 140, 112, 40, 0], ['150 ft fuselage', 150, 118, 41, 0]]
      .map(([l, len, span, tail]) => [l, span * 12, len * 12, tail * 12, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 3950, gear: 650, wing: { r: 0.37, c0: 0.1, c1: 0.035, sw: 0.095 }, eng: 'wing', ne: 2, er: 1000, winglet: true }) }),

  fam({ cat: 'site/vehicles', title: 'Generic regional jet',
    desc: (v) => `Regional jet shape, ${v.len} ft long with a ${v.span} ft span: a slim fuselage, low swept wings, two rear fuselage engines, a T-tail and tricycle landing gear.`,
    vs: [[70, 76], [85, 82], [95, 90]].map(([len, span]) => [`${len} ft fuselage`, span * 12, len * 12, 27 * 12 + (len - 70) * 2, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 2700, gear: 520, wing: { r: 0.36, c0: 0.12, c1: 0.045, sw: 0.1 }, eng: 'aft', ne: 2, tt: true, er: 420, stab: a.W * 0.2 }) }),

  fam({ cat: 'site/vehicles', title: 'Generic turboprop airliner',
    desc: (v) => `Twin turboprop airliner shape, ${v.len} ft long with a ${v.span} ft span: a high straight wing, two nacelles with four-blade propellers, a T-tail and tricycle landing gear.`,
    vs: [[56, 68], [66, 80], [76, 88]].map(([len, span]) => [`${len} ft fuselage`, span * 12, len * 12, 25 * 12, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 2650, gear: 480, wing: { r: 0.34, c0: 0.11, c1: 0.07, sw: 0.02 }, eng: 'prop', ne: 2, hi: true, tt: true, er: 330, stab: a.W * 0.17 }) }),

  fam({ cat: 'site/vehicles', title: 'Generic wide-body airliner',
    desc: (v) => `${v.ne === 4 ? 'Four' : 'Two'}-engine wide-body airliner shape, ${v.len} ft long with a ${v.span} ft span: a large round fuselage with window bands, swept wings, ${v.ne} underwing engines, a tall fin with tailplanes and multi-wheel landing gear.`,
    vs: [[170, 170, 2], [210, 197, 2], [240, 212, 2], [250, 211, 4]].map(([len, span, ne]) => [`${ne === 4 ? 'four' : 'twin'} engine, ${len} ft`, span * 12, len * 12, (len > 230 ? 60 : 54) * 12, 0, { len, span, ne }]),
    build: (a, v) => plane(a, { fd: 6000, gear: 900, wing: { r: 0.35, c0: 0.12, c1: 0.03, sw: 0.14 }, eng: 'wing', ne: v.ne, er: 1450, winglet: true }) }),

  fam({ cat: 'site/vehicles', title: 'Generic business jet',
    desc: (v) => `Business jet shape, ${v.len} ft long with a ${v.span} ft span: a small round fuselage, swept low wings, two rear engines, a T-tail and tricycle landing gear.`,
    vs: [[45, 46], [55, 55], [68, 68]].map(([len, span]) => [`${len} ft fuselage`, span * 12, len * 12, (len > 60 ? 21 : 18) * 12, 0, { len, span }]),
    build: (a, v) => plane(a, { fd: 1900, gear: 380, wing: { r: 0.4, c0: 0.12, c1: 0.045, sw: 0.1 }, eng: 'aft', ne: 2, tt: true, er: 300, stab: a.W * 0.22, winglet: true }) }),
  // ===================================================== ground support vehicles =====================================================
  fam({ cat: 'site/vehicles', title: 'Generic baggage tug',
    desc: (v) => ({ open: 'Electric baggage tug with an open two-seat canopy on four posts, a hood, a steering wheel, four small wheels with fenders and a rear tow hitch with pin.', cab: 'Baggage tug with an enclosed glazed cab, a hood, four small wheels with fenders, a beacon and a rear tow hitch with pin.', heavy: 'Heavy baggage tug with an enclosed cab, a front push bar, four wheels with fenders, a beacon and a rear tow hitch with pin.' }[v.kind]),
    vs: [['open canopy, two seat', 58, 138, 72, 0, { kind: 'open' }], ['enclosed cab', 60, 150, 76, 0, { kind: 'cab' }], ['heavy, push bar', 66, 172, 78, 0, { kind: 'heavy' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const wr = 300; wheelPairs(a, [YF + D * 0.2, YB - D * 0.2], wr, 170, 30);
      a.box(X0 + 80, YF + 80, Z0 + 220, X1 - 80, YB - 140, Z0 + 460);
      a.box(X0 + 90, YF + 40, Z0 + 460, X1 - 90, YF + D * 0.34, Z0 + 900); a.rect(X0 + 90, YF + 40, X1 - 90, YF + D * 0.34, 'EQUIP-DETAIL');
      for (const x of [cx - W * 0.28, cx + W * 0.28]) a.box(x - 120, YF + 25, Z0 + 700, x + 120, YF + 45, Z0 + 800);
      for (const y of [YF + D * 0.2, YB - D * 0.2]) for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 15) - 140 * sx - 5, y - wr - 30, Z0 + wr * 2 - 20, cx + sx * (W / 2 - 15) + 140 * sx + 5, y + wr + 30, Z0 + wr * 2 + 10);
      const cy0 = YF + D * 0.36, cy1 = YB - D * 0.2, zf = Z0 + 460, zt = Z1 - 60;
      a.box(X0 + 90, cy0, zf, X1 - 90, YB - 140, zf + 40);
      for (const [x, y] of [[X0 + 100, cy0 + 30], [X1 - 100, cy0 + 30], [X0 + 100, cy1], [X1 - 100, cy1]]) a.box(x - 18, y - 18, zf + 40, x + 18, y + 18, zt);
      a.box(X0 + 70, cy0 - 20, zt, X1 - 70, cy1 + 60, zt + 60);
      for (const sx of [-1, 1]) { const x = cx + sx * W * 0.2; a.box(x - 200, cy0 + 150, zf + 40, x + 200, cy0 + 600, zf + 120); a.box(x - 200, cy0 + 560, zf + 120, x + 200, cy0 + 620, zf + 520); a.rect(x - 200, cy0 + 150, x + 200, cy0 + 600, 'EQUIP-DETAIL'); }
      a.ycyl(cy0 - 10, cy0 + 40, cx - W * 0.2, zf + 800, 150, 14); a.circ(cx - W * 0.2, cy0 + 15, 150, 'EQUIP-DETAIL');
      if (v.kind !== 'open') { a.frame(X0 + 100, zf + 40, X1 - 100, zt, cy0 - 5, cy0 + 20, 40); a.box(X0 + 140, cy0 + 2, zf + 80, X1 - 140, cy0 + 12, zt - 40); for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 100) - 10, cy0 + 60, zf + 140, cx + sx * (W / 2 - 100) + 10, cy1 - 20, zt - 60); }
      if (v.kind === 'heavy') { a.tube([[X0 + 160, YF + 30, Z0 + 350], [X0 + 160, YF - 0, Z0 + 700], [X1 - 160, YF - 0, Z0 + 700], [X1 - 160, YF + 30, Z0 + 350]], [22, 22, 22, 22], 8); }
      a.ell(cx, cy0 + 300, zt + 90, 80, 80, 90, 10, 5);
      a.box(cx - 90, YB - 140, Z0 + 320, cx + 90, YB, Z0 + 420); a.cyl(cx, YB - 40, Z0 + 420, Z0 + 520, 22, 8); a.tube([[cx, YB - 40, Z0 + 520], [cx, YB - 70, Z0 + 600], [cx, YB - 20, Z0 + 640]], [14, 14, 14], 6);
      a.log('Added the chassis, hood, ' + (v.kind === 'open' ? 'open canopy with two seats' : 'glazed cab') + ', steering wheel, four wheels with fenders, beacon and the rear tow hitch (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic baggage cart train',
    desc: (v) => `Train of ${v.n} towed baggage cart${v.n > 1 ? 's' : ''}, each with a low deck, four small wheels, corner posts with side rails, roll-curtain hoops and a drawbar with a coupling eye.`,
    vs: [1, 2, 3, 4].map((n) => [`${n} cart${n > 1 ? 's' : ''}`, 64, 132 * n, 58, 0, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, D } = a, u = D / v.n; a.outline();
      for (let i = 0; i < v.n; i++) {
        const y0 = YF + i * u, y1 = y0 + u - 60, d0 = y0 + 900;   // deck from d0 to y1
        a.box(X0 + 40, d0, Z0 + 330, X1 - 40, y1, Z0 + 390); a.box(X0 + 40, d0, Z0 + 270, X0 + 90, y1, Z0 + 330); a.box(X1 - 90, d0, Z0 + 270, X1 - 40, y1, Z0 + 330);
        a.rect(X0 + 40, d0, X1 - 40, y1); a.line(cx, d0, cx, y1, 'EQUIP-DETAIL');
        for (const y of [d0 + 250, y1 - 250]) for (const sx of [-1, 1]) { const x = cx + sx * (X1 - X0) * 0.41; a.xcyl(x - 50, x + 50, y, Z0 + 170, 170, 14); a.rect(x - 50, y - 170, x + 50, y + 170, 'EQUIP-DETAIL'); }
        for (const [x, y] of [[X0 + 60, d0 + 20], [X1 - 60, d0 + 20], [X0 + 60, y1 - 20], [X1 - 60, y1 - 20]]) a.tube([[x, y, Z0 + 390], [x, y, Z1 - 20]], [14, 14], 6);
        for (const x of [X0 + 60, X1 - 60]) a.tube([[x, d0 + 20, Z1 - 20], [x, y1 - 20, Z1 - 20]], [12, 12], 6);
        for (let k = 0; k < 4; k++) { const y = d0 + 20 + ((y1 - d0 - 40) * k) / 3; a.tube([[X0 + 60, y, Z0 + 390], [X0 + 60, y, Z1 - 20], [cx, y, Z1 + 0 - 0], [X1 - 60, y, Z1 - 20], [X1 - 60, y, Z0 + 390]], [8, 8, 8, 8, 8], 6); }
        a.tube([[cx, d0, Z0 + 400], [cx, y0 + 60, Z0 + 320]], [18, 18], 8); a.ell(cx, y0 + 60, Z0 + 320, 50, 50, 16, 10, 4); a.circ(cx, y0 + 60, 40, 'EQUIP-DETAIL');
      }
      a.log('Added ' + v.n + ' cart' + (v.n > 1 ? 's' : '') + ' with decks, wheels, corner posts, side rails, roll-curtain hoops and drawbars with coupling eyes (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic belt loader',
    desc: (v) => `Self-propelled belt loader, ${v.belt} ft conveyor, with an inclined belt between side rails, a rubber bumper at the top end, an operator cab at the low front corner, four wheels and a drive chassis.`,
    vs: [[18, 'short'], [22, 'standard'], [26, 'long']].map(([belt, k]) => [`${belt} ft belt`, 96, belt * 12 + 48, 96, 0, { belt }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, D } = a; a.outline();
      wheelPairs(a, [YF + D * 0.25, YB - D * 0.18], 360, 220, 40);
      a.box(X0 + 120, YF + 100, Z0 + 300, X1 - 120, YB - 200, Z0 + 700);
      const bx0 = cx - 250, bx1 = cx + 750, yh = YF + 200, yl = YB - 200, zh = Z1 - 360, zl = Z0 + 760;
      prismX(a, [[yh, zh], [yl, zl], [yl, zl + 160], [yh, zh + 160]], bx0, bx1);
      for (const [x0, x1] of [[bx0 - 50, bx0], [bx1, bx1 + 50]]) prismX(a, [[yh, zh], [yl, zl], [yl, zl + 330], [yh, zh + 330]], x0, x1);
      for (let k = 1; k < 14; k++) { const t = k / 14; a.line(bx0, yh + (yl - yh) * t, bx1, yh + (yl - yh) * t, 'EQUIP-DETAIL'); }
      a.rect(bx0 - 50, yh, bx1 + 50, yl, 'EQUIP-DETAIL');
      a.box(bx0 - 50, yh - 60, zh - 20, bx1 + 50, yh, zh + 200); a.box(bx0 - 50, yh, zh + 330, bx1 + 50, yh + 400, zh + 360);
      a.tube([[cx + 120, yh + 600, zh - 50], [cx + 120, yh + 700, Z0 + 600]], [30, 30], 8);
      a.box(X0 + 40, YF + 160, Z0 + 700, X0 + 900, YF + 1350, Z0 + 1700); a.frame(X0 + 40, Z0 + 1000, X0 + 900, Z0 + 1700, YF + 150, YF + 175, 40); a.box(X0 + 40, YF + 1330, Z0 + 1700, X0 + 900, YF + 1360, Z0 + 1790);
      a.rect(X0 + 40, YF + 160, X0 + 900, YF + 1350, 'EQUIP-DETAIL');
      a.log('Added the chassis, the inclined belt with side rails, the rubber bumper, the operator cab and four wheels (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic aircraft pushback tractor',
    desc: (v) => `${v.kind === 'cradle' ? 'Towbarless pushback tractor with a nose-gear cradle of two paddles and rollers at the front' : 'Pushback tractor with a long A-frame towbar and a nose-gear coupling at the front'}, a low heavy chassis, an operator cab, big wheels and ballast weights.`,
    vs: [['towbar, narrow-body class', 98, 360, 100, 0, { kind: 'bar', heavy: false }], ['towbar, wide-body class', 118, 420, 112, 0, { kind: 'bar', heavy: true }], ['towbarless cradle', 108, 300, 104, 0, { kind: 'cradle', heavy: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const bar = v.kind === 'bar', ch = bar ? D * 0.62 : D, y0 = YB - ch;
      wheelPairs(a, [y0 + ch * 0.22, YB - ch * 0.24], 480, 300, 20);
      a.box(X0 + 130, y0, Z0 + 330, X1 - 130, YB, Z0 + 900); a.box(X0 + 200, y0 + 40, Z0 + 900, X1 - 200, YB - 300, Z0 + 1150);
      a.box(X0 + 130, YB - 400, Z0 + 900, X1 - 130, YB, Z0 + 1300); a.rect(X0 + 130, YB - 400, X1 - 130, YB, 'EQUIP-DETAIL');
      const cz0 = Z0 + 1150, cz1 = Z1 - 60; a.box(X0 + 40, y0 + ch * 0.28, cz0, X0 + W * 0.52, y0 + ch * 0.28 + ch * 0.34, cz1); a.frame(X0 + 40, cz0 + 80, X0 + W * 0.52, cz1 - 60, y0 + ch * 0.28 - 4, y0 + ch * 0.28 + 20, 40);
      a.rect(X0 + 40, y0 + ch * 0.28, X0 + W * 0.52, y0 + ch * 0.62, 'EQUIP-DETAIL'); a.ell(X0 + W * 0.26, y0 + ch * 0.45, cz1 + 40, 70, 70, 70, 8, 5);
      for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 100) - 60, y0 + 80, Z0 + 500, cx + sx * (W / 2 - 100) + 60, y0 + 400, Z0 + 700);
      if (bar) { const yk = YF + 100; a.tube([[X0 + 260, y0, Z0 + 560], [cx, yk, Z0 + 470]], [60, 60], 8); a.tube([[X1 - 260, y0, Z0 + 560], [cx, yk, Z0 + 470]], [60, 60], 8); a.cyl(cx, yk, Z0 + 380, Z0 + 560, 110, 14); a.circ(cx, yk, 110, 'EQUIP-DETAIL'); a.line(X0 + 260, y0, cx, yk); a.line(X1 - 260, y0, cx, yk); }
      else { for (const sx of [-1, 1]) { a.box(cx + sx * 640 - 120, YF + 40, Z0 + 380, cx + sx * 640 + 120, y0 + 600, Z0 + 740); a.xcyl(cx + sx * 640 - 110, cx + sx * 640 + 110, YF + 180, Z0 + 560, 160, 12); } a.box(cx - 640, y0 + 560, Z0 + 380, cx + 640, y0 + 680, Z0 + 760); a.rect(cx - 760, YF + 40, cx - 520, y0 + 600, 'EQUIP-DETAIL'); a.rect(cx + 520, YF + 40, cx + 760, y0 + 600, 'EQUIP-DETAIL'); }
      a.log('Added the chassis, ballast block, operator cab, wheels and ' + (bar ? 'the A-frame towbar with coupling' : 'the nose-gear cradle with paddles and rollers') + ' (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic aircraft refueler',
    desc: (v) => `Aircraft refueler truck, ${v.gal} gal nominal, with a cab, a cylindrical tank with ${v.gal > 4000 ? 'three' : 'two'} compartment bands, a top walkway with dome hatches and rails, a rear hose cabinet with reels and tandem rear axles.`,
    vs: [[2500, 25], [3000, 27], [5000, 31], [6000, 34], [9000, 40]].map(([gal, L]) => [`${gal} gal`, 100, L * 12, 126, 0, { gal }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      cabTruck(a, { cabL: 2000, cabH: 2900, ground: 500, wr: 520, axles: [900, D - 2100, D - 900] });
      const y0 = YF + 2300, y1 = YB - 700, zc = Z0 + 1900, r = 1010;
      a.ycyl(y0, y1, cx, zc, r, 26); a.ell(cx, y0, zc, r, 60, r, 18, 6); a.ell(cx, y1, zc, r, 60, r, 18, 6);
      a.rect(X0 + 200, y0, X1 - 200, y1, 'EQUIP'); a.circ(cx, a.cy, 0.1, 'EQUIP-DETAIL');
      const nb = v.gal > 4000 ? 3 : 2; for (let k = 1; k < nb + 1; k++) { const y = y0 + ((y1 - y0) * k) / (nb + 1); a.ycyl(y - 25, y + 25, cx, zc, r + 20, 26); a.line(X0 + 200, y, X1 - 200, y, 'EQUIP-DETAIL'); }
      a.box(cx - 300, y0 + 200, zc + r - 20, cx + 300, y1 - 200, zc + r + 80); for (const sx of [-1, 1]) { rail(a, cx + sx * 300, y0 + 200, cx + sx * 300, y1 - 200, zc + r + 80, zc + r + 520, 18, 5); }
      for (let k = 0; k < nb; k++) { const y = y0 + ((y1 - y0) * (k + 0.5 + 0.5 * 0)) / nb; a.cyl(cx, y, zc + r + 80, zc + r + 240, 190, 14); a.circ(cx, y, 190, 'EQUIP-DETAIL'); }
      a.box(X0 + 60, y1 - 100, Z0 + 700, X1 - 60, YB, Z0 + 2300); a.rect(X0 + 60, y1 - 100, X1 - 60, YB, 'EQUIP-DETAIL');
      for (const sx of [-1, 1]) { const x = cx + sx * (W * 0.3); a.ycyl(YB - 80, YB - 20, x, Z0 + 1500, 300, 18); a.circ(x, YB - 50, 300, 'EQUIP-DETAIL'); a.box(x - 60, YB - 90, Z0 + 800, x + 60, YB - 60, Z0 + 1050); }
      a.log('Added the cab, cylindrical tank with compartment bands, walkway with hatches and rails, rear hose cabinet with reels and the axles (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic hydrant fuel dispenser',
    desc: (v) => `${v.lift ? 'Hydrant fuel dispenser with a raised operator platform on a scissor lift' : 'Low hydrant fuel dispenser cart'} with a filter vessel, a hose reel, a hose bay, a coupler stowage and four wheels with a tow bar.`,
    vs: [['cart, low', 78, 190, 80, 0, { lift: false }], ['with lift deck, raised', 84, 220, 130, 0, { lift: true }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      wheelPairs(a, [YF + D * 0.28, YB - D * 0.2], 330, 190, 20);
      a.box(X0 + 80, YF + 500, Z0 + 330, X1 - 80, YB - 80, Z0 + 700);
      a.ycyl(YB - 1400, YB - 300, cx - W * 0.2, Z0 + 1050, 330, 20); a.rect(cx - W * 0.2 - 330, YB - 1400, cx - W * 0.2 + 330, YB - 300, 'EQUIP-DETAIL');
      a.xcyl(cx + 100, cx + 560, YB - 700, Z0 + 1000, 450, 24); a.circ(cx + 330, YB - 700, 450, 'EQUIP-DETAIL'); a.ycyl(YB - 700 - 80, YB - 700 + 80, cx + 330, Z0 + 1000, 120, 12);
      a.tube([[cx - 300, YF + 700, Z0 + 700], [cx - 300, YF + 100, Z0 + 500]], [40, 40], 8); a.box(X0 + 140, YF + 20, Z0 + 330, X1 - 140, YF + 80, Z0 + 430);
      a.tube([[cx, YF + 20, Z0 + 520], [cx, YF - 0, Z0 + 520]], [25, 25], 6);
      if (v.lift) { a.box(X0 + 120, YF + 500, Z1 - 160, X1 - 120, YB - 80, Z1 - 120); for (const s of [-1, 1]) { a.tube([[cx + s * W * 0.3, YF + 560, Z0 + 700], [cx - s * W * 0.3, YF + 560, Z1 - 160]], [35, 35], 8); a.tube([[cx - s * W * 0.3, YF + 560, Z0 + 700], [cx + s * W * 0.3, YF + 560, Z1 - 160]], [35, 35], 8); } rail(a, X0 + 140, YF + 520, X0 + 140, YB - 100, Z1 - 120, Z1, 18, 4); rail(a, X1 - 140, YF + 520, X1 - 140, YB - 100, Z1 - 120, Z1, 18, 4); }
      a.log('Added the chassis, wheels, filter vessel, hose reel, tow bar' + (v.lift ? ', the scissor lift and the raised platform with rails' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic catering high-lift truck',
    desc: (v) => `Catering high-lift truck with a cab, a ${v.box} ft insulated box raised on a scissor lift with four outrigger pads, a bridge platform with rails at the aircraft end and tandem rear axles.`,
    vs: [[14, 'standard'], [18, 'long'], [24, 'wide-body']].map(([box, k]) => [`${k}, ${box} ft box`, 98, (box + 8) * 12, 150 + (box > 20 ? 24 : 0), 0, { box }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      cabTruck(a, { cabL: 1900, cabH: 2600, ground: 500, wr: 480, axles: [900, D - 1400, D - 2400] });
      const y0 = YF + 2300, y1 = YB - 200, zb = Z0 + 2000 + (v.box > 20 ? 500 : 0), zt = Z1 - 100;
      a.box(X0 + 160, y0, Z0 + 700, X1 - 160, y1, Z0 + 1000);
      for (const [x, y] of [[X0 + 250, y0 + 400], [X1 - 250, y0 + 400], [X0 + 250, y1 - 400], [X1 - 250, y1 - 400]]) { a.tube([[x, y, Z0 + 1000], [x * 0.9, y, zb]], [40, 40], 8); a.box(x - 120, y - 120, Z0, x + 120, y + 120, Z0 + 40); a.circ(x, y, 120, 'EQUIP-HIDDEN'); }
      for (const s of [-1, 1]) { a.tube([[cx + s * 600, y0 + 700, Z0 + 1000], [cx - s * 600, y0 + 700, zb]], [45, 45], 8); a.tube([[cx - s * 600, y0 + 700, Z0 + 1000], [cx + s * 600, y0 + 700, zb]], [45, 45], 8); }
      a.box(X0 + 20, y0, zb, X1 - 20, y1, zt); a.rect(X0 + 20, y0, X1 - 20, y1, 'EQUIP-DETAIL'); a.frame(X0 + 40, zb + 100, X1 - 40, zt - 100, y0 - 4, y0 + 8, 40);
      for (let y = y0 + 800; y < y1 - 500; y += 1100) a.line(X0 + 20, y, X1 - 20, y, 'EQUIP-DETAIL');
      a.box(X0 + 120, y1, zb, X1 - 120, YB, zb + 60); rail(a, X0 + 120, y1, X0 + 120, YB, zb + 60, zb + 1000, 16, 3); rail(a, X1 - 120, y1, X1 - 120, YB, zb + 60, zb + 1000, 16, 3);
      a.log('Added the cab, chassis, scissor lift, four outrigger pads, the raised insulated box with its door and the bridge platform with rails (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic aircraft service truck',
    desc: (v) => ({ lav: `Lavatory service truck with a cab, a waste tank box on the chassis, a hose cabinet and a rear service platform with rails, ${v.cap} gal nominal.`, water: `Potable water truck with a cab, a horizontal cylindrical tank, a hose cabinet and a rear service platform with rails, ${v.cap} gal nominal.` }[v.kind]),
    vs: [['lavatory, 250 gal', 'lav', 250, 20], ['lavatory, 400 gal', 'lav', 400, 23], ['potable water, 500 gal', 'water', 500, 21], ['potable water, 1000 gal', 'water', 1000, 25]]
      .map(([l, kind, cap, L]) => [l, 92, L * 12, 112, 0, { kind, cap }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      cabTruck(a, { cabL: 1800, cabH: 2500, ground: 450, wr: 460, axles: [800, D - 1000] });
      const y0 = YF + 2100, y1 = YB - 900;
      if (v.kind === 'lav') { a.box(X0 + 100, y0, Z0 + 750, X1 - 100, y1, Z0 + 2100); a.rect(X0 + 100, y0, X1 - 100, y1, 'EQUIP-DETAIL'); a.box(X0 + 180, y0 + 120, Z0 + 2100, X1 - 180, y1 - 120, Z0 + 2160); a.cyl(cx, (y0 + y1) / 2, Z0 + 2160, Z0 + 2300, 170, 14); }
      else { a.ycyl(y0, y1, cx, Z0 + 1500, 880, 24); a.ell(cx, y0, Z0 + 1500, 880, 60, 880, 18, 6); a.ell(cx, y1, Z0 + 1500, 880, 60, 880, 18, 6); a.rect(X0 + 180, y0, X1 - 180, y1, 'EQUIP'); a.cyl(cx, (y0 + y1) / 2, Z0 + 2380, Z0 + 2500, 190, 14); a.box(X0 + 100, y0, Z0 + 650, X1 - 100, y1, Z0 + 700); }
      a.box(X0 + 80, y1, Z0 + 650, X1 - 80, YB - 300, Z0 + 1800); a.rect(X0 + 80, y1, X1 - 80, YB - 300, 'EQUIP-DETAIL');
      a.box(X0 + 100, YB - 300, Z0 + 650, X1 - 100, YB, Z0 + 720); rail(a, X0 + 100, YB - 300, X0 + 100, YB, Z0 + 720, Z0 + 1700, 16, 2); rail(a, X1 - 100, YB - 300, X1 - 100, YB, Z0 + 720, Z0 + 1700, 16, 2); rail(a, X0 + 100, YB, X1 - 100, YB, Z0 + 720, Z0 + 1700, 16, 3);
      a.log('Added the cab, ' + (v.kind === 'lav' ? 'the waste tank box' : 'the cylindrical water tank') + ', the hose cabinet and the rear service platform with rails (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic de-icing truck',
    desc: (v) => `De-icing truck with a cab, a fluid tank, a turret at the rear with a two-section boom raised to ${v.boom} ft carrying an operator basket and a spray nozzle, and four outrigger pads.`,
    vs: [[30, 28], [45, 32], [60, 36]].map(([boom, L]) => [`${boom} ft boom`, 102, L * 12, (boom + 14) * 12 * 0 + 12 * (boom * 0.62 + 12), 0, { boom }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      cabTruck(a, { cabL: 2000, cabH: 2800, ground: 500, wr: 520, axles: [900, D - 2400, D - 1100] });
      const y0 = YF + 2300, y1 = YB - 1400;
      a.ycyl(y0, y1, cx, Z0 + 1800, 880, 22); a.rect(X0 + 220, y0, X1 - 220, y1, 'EQUIP'); a.ell(cx, y0, Z0 + 1800, 880, 60, 880, 16, 6); a.ell(cx, y1, Z0 + 1800, 880, 60, 880, 16, 6);
      a.box(X0 + 100, y1, Z0 + 700, X1 - 100, YB, Z0 + 1100); a.cyl(cx, YB - 800, Z0 + 1100, Z0 + 1500, 450, 20); a.circ(cx, YB - 800, 450, 'EQUIP-DETAIL');
      const top = Z1 - 200, kz = Z0 + 1500, hy = YB - 800, ty = YF + 2400 + (D - 5000) * 0.0;
      a.tube([[cx, hy, kz], [cx, hy - (D * 0.22), kz + (top - kz) * 0.55]], [140, 120], 10);
      a.tube([[cx, hy - (D * 0.22), kz + (top - kz) * 0.55], [cx, hy - (D * 0.52), top - 160]], [110, 95], 10); a.ell(cx, hy - (D * 0.22), kz + (top - kz) * 0.55, 160, 160, 160, 10, 5);
      a.box(cx - 450, hy - (D * 0.52) - 450, top - 360, cx + 450, hy - (D * 0.52) + 450, top - 160); rail(a, cx - 450, hy - (D * 0.52) - 450, cx + 450, hy - (D * 0.52) - 450, top - 160, top + 500, 16, 3); rail(a, cx - 450, hy - (D * 0.52) + 450, cx + 450, hy - (D * 0.52) + 450, top - 160, top + 500, 16, 3);
      a.tube([[cx, hy - (D * 0.52) - 400, top - 100], [cx, hy - (D * 0.52) - 900, top - 50]], [40, 25], 8);
      a.line(cx, hy, cx, hy - (D * 0.52), 'EQUIP-DETAIL');
      for (const [x, y] of [[X0 + 80, y0 + 500], [X1 - 80, y0 + 500], [X0 + 80, YB - 500], [X1 - 80, YB - 500]]) { a.box(x - 160, y - 160, Z0, x + 160, y + 160, Z0 + 50); a.circ(x, y, 160, 'EQUIP-HIDDEN'); }
      a.log('Added the cab, fluid tank, turret, two-section boom with the basket, rails and nozzle, and four outrigger pads (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic passenger stair truck',
    desc: (v) => `Motorised passenger stair truck, door sill ${v.sill} ft, with a chassis, a front cab, a stair run with treads and side rails up to a covered top platform, four wheels and a canopy over the platform.`,
    vs: [[7, 'narrow-body'], [12, 'mid'], [17, 'wide-body upper deck']].map(([sill, k]) => [`sill ${sill} ft, ${k}`, 90, (sill * 12 * 1.6 + 130) , sill * 12 + 70, 0, { sill }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      wheelPairs(a, [YF + 700, YF + D * 0.5], 410, 200, 30);
      a.box(X0 + 120, YF + 80, Z0 + 330, X1 - 120, YB - 100, Z0 + 700); a.box(X0 + 100, YF + 40, Z0 + 700, X1 - 100, YF + 1400, Z0 + 1700); a.frame(X0 + 100, Z0 + 900, X1 - 100, Z0 + 1700, YF + 30, YF + 55, 40); a.rect(X0 + 100, YF + 40, X1 - 100, YF + 1400, 'EQUIP-DETAIL');
      const sy0 = YF + 1500, sy1 = YB - 1100, zl = Z0 + 760, zh = Z0 + v.sill * 304.8, sw = W * 0.55;
      for (const s of [-1, 1]) { const x = cx + s * sw / 2; prismX(a, [[sy0, zl], [sy1, zh], [sy1, zh + 80], [sy0, zl + 80]], s > 0 ? x - 30 : x, s > 0 ? x : x + 30); rail(a, x, sy0, x, sy1, zl + 80, zh + 900, 16, 5); }
      const n = m.round((zh - zl) / 180); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, y = sy0 + (sy1 - sy0) * t, z = zl + (zh - zl) * t; a.box(cx - sw / 2, y - 130, z, cx + sw / 2, y + 130, z + 30); a.line(cx - sw / 2, y, cx + sw / 2, y, 'EQUIP-DETAIL'); }
      a.box(X0 + 40, sy1, zh - 60, X1 - 40, YB - 100, zh + 20); rail(a, X0 + 40, sy1, X0 + 40, YB - 100, zh + 20, zh + 1000, 16, 3); rail(a, X1 - 40, sy1, X1 - 40, YB - 100, zh + 20, zh + 1000, 16, 3);
      for (const x of [X0 + 60, X1 - 60]) a.tube([[x, sy1 + 30, zh + 20], [x, sy1 + 30, zh + 1700]], [18, 18], 8);
      a.box(X0 + 20, sy1 - 100, zh + 1700, X1 - 20, YB - 100, zh + 1760); a.rect(X0 + 20, sy1 - 100, X1 - 20, YB - 100, 'EQUIP-DETAIL');
      a.tube([[cx, YB - 100, Z0 + 700], [cx, YB - 100, zh - 60]], [40, 40], 8); a.box(cx - 450, YB - 100, Z0 + 700, cx + 450, YB - 60, Z0 + 900);
      a.log('Added the chassis, cab, wheels, the stair run with treads and rails, the platform with a canopy and the leveling jack (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic towed passenger stair',
    desc: (v) => `Towed passenger stair, door sill ${v.sill} ft, on two large wheels and a front tow bar with a jack leg, with a stair run, treads, side handrails and a top platform with rails.`,
    vs: [[7], [10], [14]].map(([sill]) => [`sill ${sill} ft`, 54, sill * 12 * 1.5 + 70, sill * 12 + 50, 0, { sill }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const sy0 = YF + 900, sy1 = YB - 1000, zl = Z0 + 320, zh = Z0 + v.sill * 304.8;
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 110); a.xcyl(x - 70, x + 70, sy1 - 700, Z0 + 330, 330, 18); a.rect(x - 70, sy1 - 1030, x + 70, sy1 - 370, 'EQUIP-DETAIL'); }
      a.xcyl(X0 + 120, X1 - 120, sy1 - 700, Z0 + 330, 45, 10);
      for (const s of [-1, 1]) { const x = cx + s * (W / 2 - 60); prismX(a, [[sy0, zl], [sy1, zh], [sy1, zh + 90], [sy0, zl + 90]], s > 0 ? x - 35 : x, s > 0 ? x + 0 : x + 35); rail(a, x, sy0, x, sy1, zl + 90, zh + 900, 16, 5); }
      const n = m.round((zh - zl) / 190); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, y = sy0 + (sy1 - sy0) * t, z = zl + (zh - zl) * t; a.box(X0 + 70, y - 140, z, X1 - 70, y + 140, z + 30); a.line(X0 + 70, y, X1 - 70, y, 'EQUIP-DETAIL'); }
      a.box(X0 + 40, sy1, zh - 60, X1 - 40, YB, zh + 30); rail(a, X0 + 40, sy1, X0 + 40, YB, zh + 30, zh + 1000, 16, 3); rail(a, X1 - 40, sy1, X1 - 40, YB, zh + 30, zh + 1000, 16, 3); rail(a, X0 + 40, YB, X1 - 40, YB, zh + 30, zh + 1000, 16, 3);
      a.tube([[cx, sy0, zl + 40], [cx, YF + 60, Z0 + 520]], [30, 30], 8); a.cyl(cx, YF + 60, Z0 + 420, Z0 + 520, 70, 12); a.circ(cx, YF + 60, 70, 'EQUIP-DETAIL');
      a.tube([[cx, YB - 1500, zl + 40], [cx, YB - 1500, Z0 + 40]], [25, 25], 8); a.cyl(cx, YB - 1500, Z0, Z0 + 40, 90, 12);
      a.log('Added the two wheels, the tow bar with jack leg, the stair run with treads and handrails and the platform with rails (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic ground power unit',
    desc: (v) => `Towable ground power unit, ${v.kva} kVA nominal, with a louvered cabinet, two hinged service doors with swings, two wheels, a tow bar with eye, a cable reel and a coiled output cable.`,
    vs: [[30, 54, 90, 54], [60, 60, 110, 60], [90, 66, 130, 64], [180, 72, 150, 70]].map(([kva, w, d, h]) => [`${kva} kVA`, w, d, h, 0, { kva }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const bd = YF + D * 0.28;
      a.box(X0 + 20, bd, Z0 + 260, X1 - 20, YB, Z1); for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 80); a.xcyl(x - 80, x + 80, YB - D * 0.4, Z0 + 250, 250, 16); a.rect(x - 80, YB - D * 0.4 - 250, x + 80, YB - D * 0.4 + 250, 'EQUIP-DETAIL'); }
      a.rect(X0 + 20, bd, X1 - 20, YB, 'EQUIP-DETAIL');
      const nd = 2, dw = (W - 100) / nd; for (let i = 0; i < nd; i++) { const x0 = X0 + 40 + i * dw; for (let z = Z0 + 420; z < Z1 - 260; z += 40) a.box(x0 + 40, bd - 12, z, x0 + dw - 40, bd, z + 12); a.line(x0, bd, x0, bd - 12, 'EQUIP-DETAIL'); a.box(x0 + dw - 90, bd - 25, (Z0 + Z1) / 2 - 80, x0 + dw - 60, bd, (Z0 + Z1) / 2 + 80); a.arc(i ? x0 + dw : x0, bd, dw, i ? 180 : 270, i ? 270 : 360); }
      a.tube([[cx, bd, Z0 + 520], [cx, YF + 300, Z0 + 440], [cx, YF + 60, Z0 + 520]], [28, 28, 28], 8); a.cyl(cx, YF + 60, Z0 + 440, Z0 + 520, 70, 12); a.circ(cx, YF + 60, 70, 'EQUIP-DETAIL');
      a.box(cx - 200, bd - 200, Z0 + 260, cx + 200, bd, Z0 + 330);
      a.xcyl(X1 - 25, X1 + 0.01, bd + 300, Z0 + 700, 5, 4); a.ycyl(YB - 380, YB - 330, X1 - 150, Z1 - 200, 180, 20); a.circ(X1 - 150, YB - 355, 180, 'EQUIP-DETAIL');
      a.tube([[X1 - 150, YB - 380, Z1 - 200], [X1 - 100, bd + 200, Z0 + 350], [X1 - 150, bd + 20, Z0 + 270]], [18, 18, 18], 8);
      a.log('Added the louvered cabinet, two hinged doors with swings, two wheels, the tow bar with eye, a cable reel and the coiled output cable (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic passenger boarding bridge',
    desc: (v) => `Passenger boarding bridge, ${v.len} ft with ${v.secs} telescoping tunnel sections: a terminal rotunda, glazed tunnel sections stepping down in width, an adjustable cab with a canopy and bellows at the aircraft end and two drive columns with wheel bogies.`,
    vs: [[60, 2], [80, 2], [100, 3], [120, 3], [140, 3]].map(([len, secs]) => [`${len} ft, ${secs} section`, 150, len * 12, 200, 0, { len, secs }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const fz = Z0 + 2850 * 0 + 2200, tw = 2000, th = 2400; // floor height and tunnel size
      a.cyl(cx, YB - 1800, fz - 200, fz + th + 300, 1800, 28); a.circ(cx, YB - 1800, 1800); a.circ(cx, YB - 1800, 1500, 'EQUIP-DETAIL');
      const yEnd = YF + 1700, ySt = YB - 3300, n = v.secs, ln = (ySt - yEnd) / n;
      for (let i = 0; i < n; i++) {
        const y0 = ySt - (i + 1) * ln, y1 = ySt - i * ln - (i ? -120 : 0), w = tw + 250 - i * 200 + (n - 1 - i) * 0, h = th - i * 120 + 120;
        a.box(cx - w / 2, y0, fz - 150, cx + w / 2, y1, fz); a.box(cx - w / 2, y0, fz, cx - w / 2 + 40, y1, fz + h); a.box(cx + w / 2 - 40, y0, fz, cx + w / 2, y1, fz + h); a.box(cx - w / 2, y0, fz + h, cx + w / 2, y1, fz + h + 60);
        for (let y = y0 + 200; y < y1 - 400; y += 1100) { a.box(cx - w / 2 - 6, y, fz + 700, cx - w / 2 + 40, y + 800, fz + h - 250); a.box(cx + w / 2 - 40, y, fz + 700, cx + w / 2 + 6, y + 800, fz + h - 250); }
        a.rect(cx - w / 2, y0, cx + w / 2, y1, 'EQUIP-DETAIL');
      }
      a.box(cx - 1500, yEnd - 100, fz - 250, cx + 1500, yEnd + 1100, fz + th + 300); a.rect(cx - 1500, yEnd - 100, cx + 1500, yEnd + 1100); a.frame(cx - 1200, fz + 100, cx + 1200, fz + th + 100, yEnd - 160, yEnd - 100, 90); a.box(cx - 1400, yEnd - 260, fz + th + 300, cx + 1400, yEnd + 1100, fz + th + 400);
      for (let k = 0; k < 6; k++) a.box(cx - 1260 + k * 420, yEnd - 330, fz + 80, cx - 1200 + k * 420, yEnd - 160, fz + th + 120);
      const dy = yEnd + 900; for (const s of [-1, 1]) { const x = cx + s * 900; a.box(x - 120, dy - 120, Z0 + 700, x + 120, dy + 120, fz - 250); a.box(x - 300, dy - 60, Z0 + 340, x + 300, dy + 60, Z0 + 720); for (const sy of [-1, 1]) { a.xcyl(x - 80 - 0, x + 80, dy + sy * 240, Z0 + 330, 330, 16); } a.rect(x - 150, dy - 570, x + 150, dy + 570, 'EQUIP-DETAIL'); }
      a.box(cx - 1100, dy - 80, Z0 + 700, cx + 1100, dy + 80, Z0 + 800);
      a.log('Added the rotunda, ' + v.secs + ' glazed tunnel sections with windows, the cab with canopy and bellows frame, two drive columns with wheel bogies (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic transit bus',
    desc: (v) => `${v.art ? 'Articulated' : 'Single-body'} transit bus, ${v.len} ft, with a flat-roof body, a window band on both sides, two doors, a destination sign, a roof air unit and ${v.art ? 'a bellows joint and three axles' : 'two axles'}.`,
    vs: [[30, false], [35, false], [40, false], [60, true]].map(([len, art]) => [`${len} ft${art ? ', articulated' : ''}`, 102, len * 12, 126, 0, { len, art }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const axes = v.art ? [D * 0.08, D * 0.36, D * 0.9].map((f) => YF + f * 1) : [YF + D * 0.12, YB - D * 0.2];
      const gz = Z0 + 300;
      for (const y of axes) for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 150); a.xcyl(x - 150, x + 150, y, Z0 + 520, 520, 20); a.rect(x - 150, y - 520, x + 150, y + 520, 'EQUIP-DETAIL'); }
      const segs = v.art ? [[YF, YF + D * 0.5 - 300], [YF + D * 0.5 + 300, YB]] : [[YF, YB]];
      for (const [y0, y1] of segs) {
        a.box(X0 + 40, y0 + 30, gz, X1 - 40, y1 - 30, Z1 - 160); a.box(X0 + 90, y0 + 20, Z1 - 160, X1 - 90, y1 - 20, Z1 - 60);
        for (let y = y0 + 700; y < y1 - 900; y += 1250) { a.box(X0 + 36, y, Z0 + 1150, X0 + 42, y + 1000, Z0 + 2100); a.box(X1 - 42, y, Z0 + 1150, X1 - 36, y + 1000, Z0 + 2100); }
        a.rect(X0 + 40, y0 + 30, X1 - 40, y1 - 30);
      }
      a.box(X0 + 60, YF + 10, Z0 + 1100, X1 - 60, YF + 30, Z1 - 330); a.box(X0 + 600, YF + 4, Z1 - 330, X1 - 600, YF + 30, Z1 - 180);
      for (const x of [X0 + 220, X1 - 220]) a.box(x - 120, YF + 4, Z0 + 650, x + 120, YF + 30, Z0 + 800);
      a.box(cx - 700, (YF + YB) / 2 - 900, Z1 - 60, cx + 700, (YF + YB) / 2 + 900, Z1 + 0.5 - 0.5);
      for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2) - 8 * 1 - 20 * (sx > 0 ? 1 : 0), YF + 800, Z0 + 350, cx + sx * (W / 2) + 8, YF + 800 + 1250, Z0 + 2200); }
      for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 10) - 15, YF + D * 0.6, Z0 + 350, cx + sx * (W / 2 - 10) + 15, YF + D * 0.6 + 1250, Z0 + 2200);
      if (v.art) { const yb0 = YF + D * 0.5 - 300; a.box(X0 + 120, yb0, gz + 100, X1 - 120, yb0 + 600, Z1 - 260); for (let k = 0; k < 6; k++) a.line(X0 + 120, yb0 + k * 100, X1 - 120, yb0 + k * 100, 'EQUIP-DETAIL'); a.circ(cx, yb0 + 300, 700, 'EQUIP-DETAIL'); }
      a.log('Added the body, window bands, two doors, destination sign, roof air unit, wheels' + (v.art ? ' and the bellows joint' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'site/vehicles', title: 'Generic taxi car',
    desc: (v) => `Taxi ${v.kind} with a lower body, a glass greenhouse, wheels with arches, bumpers, head and tail lamps and a roof light bar${v.kind === 'minivan' ? ', with a sliding side door seam' : ''}.`,
    vs: [['sedan, 15 ft', 'sedan', 70, 180, 58], ['minivan, 17 ft', 'minivan', 78, 204, 70], ['wagon, 16 ft', 'wagon', 72, 192, 62]].map(([l, kind, w, d, h]) => [l, w, d, h, 0, { kind }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      const wr = 330, wb = [YF + D * 0.2, YB - D * 0.2], gz = Z0 + 150;
      wheelPairs(a, wb, wr, 230, 15);
      a.box(X0 + 15, YF + 20, gz + 110, X1 - 15, YB - 20, Z0 + 760); a.box(X0 + 15, YF + 20, Z0 + 520, X1 - 15, YF + D * 0.28, Z0 + 840);
      const c0 = v.kind === 'sedan' ? [YF + D * 0.3, YB - D * 0.24] : v.kind === 'minivan' ? [YF + D * 0.22, YB - D * 0.06] : [YF + D * 0.28, YB - D * 0.08];
      a.prism([[X0 + 70, c0[0] + 250], [X1 - 70, c0[0] + 250], [X1 - 90, c0[1] - (v.kind === 'sedan' ? 100 : 0)], [X0 + 90, c0[1] - (v.kind === 'sedan' ? 100 : 0)]], Z0 + 760, Z1 - 10);
      for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 60) - 4, c0[0] + 350, Z0 + 880, cx + sx * (W / 2 - 60) + 4, c0[1] - 200, Z1 - 140);
      a.frame(X0 + 120, Z0 + 840, X1 - 120, Z1 - 90, c0[0] + 190, c0[0] + 240, 30);
      a.box(cx - 300, (c0[0] + c0[1]) / 2 - 100, Z1 - 10, cx + 300, (c0[0] + c0[1]) / 2 + 100, Z1 + 0.5 - 0.5 + 0);
      a.box(X0 + 40, YF, gz, X1 - 40, YF + 70, gz + 200); a.box(X0 + 40, YB - 70, gz, X1 - 40, YB, gz + 200);
      for (const sx of [-1, 1]) { a.box(cx + sx * (W / 2 - 160) - 80, YF + 8, Z0 + 640, cx + sx * (W / 2 - 160) + 80, YF + 20, Z0 + 720); a.box(cx + sx * (W / 2 - 160) - 80, YB - 20, Z0 + 640, cx + sx * (W / 2 - 160) + 80, YB - 8, Z0 + 720); }
      if (v.kind === 'minivan') a.line(X1 - 15, c0[0] + 400, X1 - 15, c0[0] + 1300, 'EQUIP-DETAIL');
      a.line(X0 + 15, c0[0] + 250, X1 - 15, c0[0] + 250, 'EQUIP-DETAIL');
      a.log('Added the lower body, glazed cabin, wheels with arches, bumpers, lamps and the roof light bar (plan and 3D).');
    } }),
  // ===================================================== airfield and curbside =====================================================
  fam({ cat: 'site/landscape', title: 'Generic windsock',
    desc: (v) => `Airfield windsock on a ${v.pole} ft tapered pole: a footing, a pole, a ring frame at the top and a banded sock streaming ${v.sock} ft in the wind.`,
    vs: [[12, 8], [15, 10], [20, 12]].map(([pole, sock]) => [`${pole} ft pole, ${sock} ft sock`, sock * 12 + 20, 24, pole * 12 + 20, 0, { pole, sock }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, px = X0 + 160, zt = Z1 - 200;
      a.circ(px, cy, 260); a.circ(px, cy, 80, 'EQUIP-DETAIL'); a.cyl(px, cy, Z0, Z0 + 150, 260, 20);
      a.cone(px, cy, Z0 + 150, zt, 80, 45, 14);
      const L = X1 - px - 150; a.ycyl(cy - 160, cy + 160, px, zt + 100, 18, 8); ring(a, px + 60, cy, zt + 100, 190, 8);
      const pts = [], rads = []; for (let i = 0; i <= 8; i++) { const f = i / 8; pts.push([px + 120 + L * f, cy, zt + 100 - 60 * f * f * 2]); rads.push(190 * (1 - 0.62 * f)); }
      a.tube(pts, rads, 16); for (let i = 1; i < 8; i += 2) { const f = i / 8; ring(a, px + 120 + L * f, cy, zt + 100 - 120 * f * f, 190 * (1 - 0.62 * f) + 4, 6, 16); }
      a.line(px, cy, X1 - 40, cy, 'EQUIP-DETAIL'); a.rect(px + 100, cy - 190, X1 - 30, cy + 190, 'EQUIP-DETAIL');
      a.log('Added the footing, the tapered pole, the ring frame and the banded conical sock (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic airfield guidance sign',
    desc: (v) => `Airfield guidance sign with ${v.n} lit legend panel${v.n > 1 ? 's' : ''}, ${v.hgt} in tall, in a single frame on two frangible legs with a base footing and a black border bar.`,
    vs: [[1, 18], [2, 24], [3, 30], [4, 30]].map(([n, h]) => [`${n} panel, ${h} in`, n * 36 + 6, 8, h + 14, 0, { n, hgt: h }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60);
      for (const x of [X0 + 140, X1 - 140]) { a.cyl(x, a.cy, Z0 + 60, Z0 + 340, 40, 10); a.box(x - 60, a.cy - 60, Z0 + 330, x + 60, a.cy + 60, Z0 + 360); }
      const zb = Z0 + 340, zt = Z1; a.box(X0, YF + 10, zb, X1, YB - 10, zt); a.frame(X0, zb, X1, zt, YF, YF + 10, 22);
      const pw = (W - 60) / v.n; for (let i = 0; i < v.n; i++) { const x0 = X0 + 30 + i * pw + 12; a.box(x0, YF - 3, zb + 40, x0 + pw - 24, YF, zt - 40); a.rect(x0, YF - 3, x0 + pw - 24, YF, 'EQUIP-DETAIL'); a.box(x0 + 60, YF - 6, (zb + zt) / 2 - 40, x0 + pw - 100, YF - 3, (zb + zt) / 2 + 40); }
      a.log('Added the footing, two frangible legs, the framed sign with ' + v.n + ' legend panel' + (v.n > 1 ? 's' : '') + ' and legend bars (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic apron floodlight mast',
    desc: (v) => `Apron high-mast floodlight pole, ${v.hgt} ft tall, with a footing and bolt ring, a tapered twelve-sided shaft, a service platform ring and a head ring carrying ${v.lamps} floodlights, with a ladder base plate.`,
    vs: [[60, 6], [80, 8], [100, 12]].map(([hgt, lamps]) => [`${hgt} ft, ${lamps} lamps`, 40, 40, hgt * 12 + 24, 0, { hgt, lamps }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r0 = 330, r1 = 150;
      a.circ(cx, cy, 460); a.circ(cx, cy, r0, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0, Z0 + 300, 460, 20);
      for (let i = 0; i < 8; i++) { const g = (i / 8) * m.PI * 2; a.cyl(cx + m.cos(g) * 400, cy + m.sin(g) * 400, Z0 + 300, Z0 + 380, 20, 6); }
      a.cone(cx, cy, Z0 + 300, Z1 - 1300, r0, r1, 12); a.cone(cx, cy, Z0 + 300, Z0 + 400, r0 + 40, r0 + 10, 12);
      a.cyl(cx, cy, Z1 - 1500, Z1 - 1460, 620, 18); ring(a, cx, cy, Z1 - 1460 + 900, 620, 12, 20); for (let i = 0; i < 6; i++) { const g = (i / 6) * m.PI * 2; a.tube([[cx + m.cos(g) * 600, cy + m.sin(g) * 600, Z1 - 1460], [cx + m.cos(g) * 600, cy + m.sin(g) * 600, Z1 - 560]], [10, 10], 5); }
      a.cone(cx, cy, Z1 - 1300, Z1 - 1100, r1 + 40, r1 + 100, 12); a.circ(cx, cy, 620, 'EQUIP-DETAIL');
      const n = v.lamps; for (let i = 0; i < n; i++) { const g = (i / n) * m.PI * 2, x = cx + m.cos(g) * 560, y = cy + m.sin(g) * 560; a.tube([[cx, cy, Z1 - 1100], [x, y, Z1 - 1000]], [26, 26], 6); a.box(x - 170, y - 110, Z1 - 1120, x + 170, y + 110, Z1 - 800); a.box(x - 180, y - 120, Z1 - 800, x + 180, y + 120, Z1 - 780); }
      a.cone(cx, cy, Z1 - 1000, Z1, 40, 40, 6);
      a.log('Added the footing with bolt ring, the tapered shaft, the service platform ring, the head ring with ' + v.lamps + ' floodlights and the lightning rod (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic curbside departures canopy',
    desc: (v) => `Curbside canopy, ${v.len} ft long and ${v.dep} ft deep, with steel columns every 20 ft, a roof deck with parapet, a lit fascia band, glazed edge screens at the ends and a curb strip below.`,
    vs: [[40, 14], [60, 16], [80, 16], [100, 20]].map(([len, dep]) => [`${len} ft long`, len * 12, dep * 12, 168, 0, { len, dep }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      a.box(X0, YB - 450, Z0, X1, YB, Z0 + 150); a.line(X0, YB - 450, X1, YB - 450);
      const n = m.max(2, m.round((W / 6096)) + 1);
      for (let i = 0; i < n; i++) { const x = X0 + 250 + ((W - 500) * i) / (n - 1); a.cyl(x, YB - 700, Z0 + 150, Z1 - 450, 150, 16); a.circ(x, YB - 700, 150); a.box(x - 280, YB - 980, Z0 + 150, x + 280, YB - 420, Z0 + 230); }
      a.box(X0, YF, Z1 - 450, X1, YB, Z1 - 380);
      a.box(X0, YF, Z1 - 380, X1, YF + 30, Z1 - 100); a.box(X0, YB - 30, Z1 - 380, X1, YB, Z1 - 100); a.box(X0, YF, Z1 - 380, X0 + 30, YB, Z1 - 100); a.box(X1 - 30, YF, Z1 - 380, X1, YB, Z1 - 100);
      a.box(X0 + 20, YF - 40, Z1 - 380, X1 - 20, YF, Z1 - 120); a.rect(X0 + 20, YF - 40, X1 - 20, YF, 'EQUIP-DETAIL'); a.box(X0, YF, Z1 - 100, X1, YB, Z1);
      for (const x of [X0, X1 - 20]) a.frame(x, Z0 + 450, x + 20, Z1 - 450, YF + 300, YB - 300, 40);
      a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL');
      a.log('Added the curb strip, columns with footings every 20 ft, the roof deck with parapet, the lit fascia and the glazed end screens (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic curbside shelter with bench',
    desc: (v) => `Open-front curbside shelter, ${v.len} ft long, with four posts, a flat roof with a fascia, a glazed back panel, two glazed end screens, a slatted bench with arm dividers and a roof-mounted sign face.`,
    vs: [[8], [12], [16]].map(([len]) => [`${len} ft`, len * 12, 60, 120, 0, { len }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      for (const x of [X0 + 60, X1 - 60]) { a.cyl(x, YB - 60, Z0, Z1 - 100, 40, 10); a.cyl(x, YF + 100, Z0, Z1 - 100, 40, 10); }
      a.box(X0, YF, Z1 - 100, X1, YB, Z1 - 60); a.box(X0, YF, Z1 - 60, X1, YF + 30, Z1); a.box(X0, YF, Z1 - 60, X0 + 30, YB, Z1); a.box(X1 - 30, YF, Z1 - 60, X1, YB, Z1);
      a.frame(X0 + 60, Z0 + 300, X1 - 60, Z1 - 120, YB - 70, YB - 50, 40); a.box(X0 + 100, YB - 62, Z0 + 340, X1 - 100, YB - 58, Z1 - 160);
      for (const x of [X0 + 20, X1 - 20]) a.frame(x - 12, Z0 + 300, x + 12, Z1 - 120, YF + 140, YB - 110, 30);
      a.box(X0 + 200, YB - 500, Z0 + 440, X1 - 200, YB - 80, Z0 + 470); for (const x of [X0 + 260, X1 - 260]) a.box(x - 15, YB - 450, Z0, x + 15, YB - 120, Z0 + 440);
      for (let x = X0 + 200 + (W - 400) / 3; x < X1 - 250; x += (W - 400) / 3) a.box(x - 12, YB - 500, Z0 + 470, x + 12, YB - 80, Z0 + 700);
      a.box(X0 + 40, YF + 30, Z1 - 60, X0 + 840, YF + 60, Z1 + 0.5 - 0.5); a.rect(X0 + 200, YB - 500, X1 - 200, YB - 80, 'EQUIP-DETAIL');
      a.log('Added the four posts, flat roof with fascia, glazed back and end panels, the slatted bench with arm dividers and a sign face (plan and 3D).');
    } }),

  // ===================================================== restaurant patio and drive-thru =====================================================
  fam({ cat: 'site/landscape', title: 'Generic patio dining set',
    desc: (v) => `Outdoor round dining set: a ${v.top} in round table on a pedestal with a base plate and ${v.n} armless chairs, each with a seat, four legs and a slatted back, placed around the table.`,
    vs: [[24, 2], [30, 2], [36, 4], [42, 4], [48, 6]].map(([top, n]) => [`${top} in table, ${n} chairs`, top + 46, top + 46, 34, 0, { top, n }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, tr = (v.top * IN) / 2, R = a.W / 2; a.circ(cx, cy, R, 'EQUIP-HIDDEN'); a.circ(cx, cy, tr); a.circ(cx, cy, tr - 25, 'EQUIP-DETAIL');
      a.ell(cx, cy, Z0 + 740 - 14, tr, tr, 14, 24, 4); a.cone(cx, cy, Z0 + 30, Z0 + 720, 50, 40, 10); a.cyl(cx, cy, Z0, Z0 + 30, 260, 18); ring(a, cx, cy, Z0 + 725, tr - 20, 5, 24);
      const n = v.n; for (let i = 0; i < n; i++) {
        const g = (i / n) * m.PI * 2 + 0.4, ux = m.cos(g), uy = m.sin(g), d = tr + 120, x = cx + ux * d, y = cy + uy * d;
        const P = (lx, ly) => [x + ux * lx - uy * ly, y + uy * lx + ux * ly];
        const sq = (lx0, ly0, lx1, ly1, z0, z1) => a.prism([P(lx0, ly0), P(lx1, ly0), P(lx1, ly1), P(lx0, ly1)], z0, z1);
        sq(-210, -210, 210, 210, Z0 + 440, Z0 + 470);
        for (const [lx, ly] of [[-200, -200], [200, -200], [-200, 200], [200, 200]]) { const [px, py] = P(lx, ly); a.cyl(px, py, Z0, Z0 + 440, 12, 6); }
        sq(210, -210, 235, 210, Z0 + 470, Z0 + 880); for (let k = 0; k < 3; k++) sq(205, -190, 240, 190, Z0 + 600 + k * 90, Z0 + 640 + k * 90);
        a.poly([P(-210, -210), P(210, -210), P(210, 210), P(-210, 210)], 'EQUIP-DETAIL');
      }
      a.log('Added the round table with pedestal and base, and ' + n + ' chairs with legs, seats and slatted backs around it (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic cantilever patio umbrella',
    desc: (v) => `Cantilever patio umbrella, ${v.sq} ft square canopy, on an offset pole with a bent arm over a ${v.tbl} in square table with a pedestal; the pole stands in a cross base slab weighted with four pads.`,
    vs: [[8, 30], [9, 36], [10, 36], [11, 42]].map(([sq, tbl]) => [`${sq} ft canopy`, sq * 12 + 18, sq * 12 + 18, 104, 0, { sq, tbl }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      const c = (v.sq * FT) / 2, px = X0 + 300, py = cy;
      a.box(px - 400, py - 400, Z0, px + 400, py + 400, Z0 + 60); a.rect(px - 400, py - 400, px + 400, py + 400, 'EQUIP-DETAIL');
      a.cyl(px, py, Z0 + 60, Z1 - 700, 45, 10);
      a.tube([[px, py, Z1 - 700], [px, py, Z1 - 470], [px + 420, py, Z1 - 380]], [38, 34, 28], 10);
      const ux = px + 420 + c * 0.55, uz = Z1 - 380;
      a.add(pyramid(ux, py, uz, Z1, c)); a.rect(ux - c, py - c, ux + c, py + c, 'EQUIP'); a.line(ux - c, py - c, ux + c, py + c, 'EQUIP-DETAIL'); a.line(ux - c, py + c, ux + c, py - c, 'EQUIP-DETAIL');
      a.ell(ux, py, Z1 - 20, 40, 40, 20, 8, 4);
      const tw = (v.tbl * IN) / 2, tx = ux; a.box(tx - tw, py - tw, Z0 + 700, tx + tw, py + tw, Z0 + 740); a.cyl(tx, py, Z0 + 30, Z0 + 700, 45, 10); a.cyl(tx, py, Z0, Z0 + 30, 250, 14); a.rect(tx - tw, py - tw, tx + tw, py + tw, 'EQUIP-DETAIL');
      a.log('Added the cross base with pads, the offset pole and bent arm, the square canopy with ribs and the table with its pedestal (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic gas fire table',
    desc: (v) => `Outdoor gas fire table, ${v.label}, with a base cabinet with a vented door, a flat rim, a recessed burner trough with a ring burner and a bed of glass stones, and a burner control knob.`,
    vs: [['30 in square', 30, 30], ['36 in square', 36, 36], ['48 x 24 in rectangular', 48, 24]].map(([l, w, d]) => [l, w, d, 24, 0, { label: l }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
      a.box(X0, YF, Z0 + 20, X1, YB, Z1 - 70); a.box(X0 - 25 * 0, YF, Z1 - 70, X1, YB, Z1); a.box(X0 + 40, YF, Z0, X1 - 40, YB, Z0 + 20);
      a.box(X0 + 70, YF - 8, Z0 + 140, X1 - 70, YF, Z1 - 150); a.rect(X0 + 70, YF - 8, X1 - 70, YF, 'EQUIP-DETAIL'); for (let z = Z0 + 190; z < Z1 - 200; z += 34) a.box(X0 + 110, YF - 14, z, X1 - 110, YF - 8, z + 10);
      const tx = (W - 160) / 2, ty = (D - 160) / 2; a.box(cx - tx, cy - ty, Z1 - 40, cx + tx, cy + ty, Z1 + 0.0 + 0.001);
      a.rect(cx - tx, cy - ty, cx + tx, cy + ty, 'EQUIP-DETAIL'); ring(a, cx, cy, Z1 - 20, m.min(tx, ty) * 0.6, 20, 24); a.circ(cx, cy, m.min(tx, ty) * 0.6, 'EQUIP-DETAIL');
      for (let i = 0; i < 18; i++) { const g = (i / 18) * m.PI * 2; a.ell(cx + m.cos(g) * m.min(tx, ty) * 0.6, cy + m.sin(g) * m.min(tx, ty) * 0.6, Z1 - 30, 40, 40, 14, 6, 3); }
      a.ycyl(YF - 22, YF - 8, X1 - 120, Z1 - 100, 18, 10);
      a.log('Added the base cabinet with a vented door, the rim, the burner trough with a ring burner, glass stones and the control knob (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic drive-thru menu board',
    desc: (v) => `Drive-thru menu board: ${v.n === 1 ? 'one' : v.n === 2 ? 'two' : 'three'} lit menu panel${v.n > 1 ? 's' : ''} in a ${v.hood ? 'hooded ' : ''}frame with ${v.n + 1} menu bands per panel, a steel post, a concrete footing and a ${v.hood ? 'top hood with a light strip' : 'top light bar'}.`,
    vs: [[1, false], [2, false], [2, true], [3, true]].map(([n, hood]) => [`${n} panel${n > 1 ? 's' : ''}${hood ? ', hooded' : ''}`, n * 36 + 18, 14, 96, 0, { n, hood }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0 + 100, YF + 100, Z0, X1 - 100, YB - 20, Z0 + 150); for (const x of [cx - W * 0.28, cx + W * 0.28]) a.box(x - 60, YB - 220, Z0 + 150, x + 60, YB - 120, Z0 + 1100);
      const pw = (W - 80) / v.n, z0 = Z0 + 900, z1 = Z1 - (v.hood ? 160 : 90);
      for (let i = 0; i < v.n; i++) { const x0 = X0 + 40 + i * pw + 6, x1 = X0 + 40 + (i + 1) * pw - 6; a.box(x0, YF + 40, z0, x1, YB - 100, z1); a.frame(x0, z0, x1, z1, YF + 30, YF + 40, 36); a.box(x0 + 36, YF + 26, z0 + 36, x1 - 36, YF + 30, z1 - 36); a.rect(x0, YF + 30, x1, YB - 100, 'EQUIP-DETAIL'); for (let k = 1; k <= v.n + 1; k++) a.box(x0 + 70, YF + 22, z0 + 36 + ((z1 - z0 - 72) * k) / (v.n + 2), x1 - 70, YF + 26, z0 + 36 + ((z1 - z0 - 72) * k) / (v.n + 2) + 22); }
      if (v.hood) { a.prism([[X0, YF - 100], [X1, YF - 100], [X1, YB - 40], [X0, YB - 40]], Z1 - 160, Z1 - 110); a.box(X0 + 20, YF - 100, Z1 - 110, X1 - 20, YF - 80, Z1 - 60); a.line(X0, YF - 100, X1, YF - 100, 'EQUIP-DETAIL'); }
      else { a.box(X0 + 60, YF - 20, Z1 - 90, X1 - 60, YF + 10, Z1 - 50); }
      a.log('Added the footing, post, ' + v.n + ' lit menu panel' + (v.n > 1 ? 's' : '') + ' with bands and the ' + (v.hood ? 'hood' : 'light bar') + ' (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic drive-thru order post',
    desc: (v) => `Drive-thru order post: a ${v.kind}, with a base plate, a column, a speaker grille, an order screen${v.canopy ? ', a roof canopy over the screen' : ''}, a camera and a payment reader window.`,
    vs: [['speaker only', 'speaker post', false], ['with screen', 'post with order screen', false], ['with screen and canopy', 'post with order screen', true]].map(([l, kind, canopy]) => [l, canopy ? 30 : 20, canopy ? 30 : 20, canopy ? 96 : 60, 0, { kind, canopy }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(cx - 200, cy - 200, Z0 + 20, cx + 200, cy + 200, Z1 - (v.canopy ? 500 : 20)); const top = Z1 - (v.canopy ? 500 : 20);
      a.box(cx - 120, YF + 200 - 6, top - 450, cx + 120, YF + 202, top - 200);
      for (let i = 0; i < 5; i++) a.box(cx - 90, YF + 194, top - 430 + i * 34, cx + 90, YF + 200, top - 420 + i * 34);
      if (v.kind.includes('screen')) { a.box(cx - 200, cy - 220, top - 760, cx + 200, cy - 200, top - 500); a.box(cx - 170, cy - 226, top - 730, cx + 170, cy - 220, top - 530); a.rect(cx - 200, cy - 220, cx + 200, cy - 200, 'EQUIP-DETAIL'); a.ycyl(cy - 232, cy - 220, cx, top - 800, 25, 10); a.box(cx - 60, cy - 226, top - 850, cx + 60, cy - 220, top - 820); }
      a.ycyl(cy - 232, cy - 200, cx + 140, top - 180, 22, 10);
      if (v.canopy) { a.prism([[X0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 100, Z1); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); for (const x of [X0 + 60, X1 - 60]) a.cyl(x, cy + 180, Z0 + 20, Z1 - 100, 25, 8); a.box(cx - 200, cy - 200, top, cx + 200, cy + 200, Z1 - 100); }
      a.log('Added the base plate, column, speaker grille' + (v.kind.includes('screen') ? ', order screen' : '') + ', camera and payment reader' + (v.canopy ? ' and the roof canopy' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic drive-thru pickup window bay',
    desc: (v) => `Drive-thru pickup window bay in a wall section ${v.w} ft wide: ${v.kind}, a sliding glass window with a shelf, ${v.awning ? 'a projecting awning on posts, ' : ''}two bollards and a curb strip at the vehicle side.`,
    vs: [['single window', 8, false, false], ['double window', 12, true, false], ['single window with awning', 10, false, true]].map(([l, w, dbl, awning]) => [l, w * 12, 72, 120, 0, { w, kind: dbl ? 'two windows' : 'one window', dbl, awning }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YB - 250, Z0, X1, YB, Z1 - (v.awning ? 600 : 100)); a.box(X0, YF + 150, Z0, X1, YF + 450, Z0 + 150);
      const n = v.dbl ? 2 : 1, ww = 1300; for (let i = 0; i < n; i++) { const x = X0 + (W * (i + 0.5)) / n; a.frame(x - ww / 2, Z0 + 1050, x + ww / 2, Z0 + 2000, YB - 330, YB - 250, 70); a.box(x - ww / 2 + 70, YB - 300, Z0 + 1120, x + ww / 2 - 70, YB - 296, Z0 + 1930); a.box(x - ww / 2 - 60, YB - 600, Z0 + 1020, x + ww / 2 + 60, YB - 250, Z0 + 1060); a.line(x, YB - 330, x, YB - 250, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 400, X1 - 400]) { a.cyl(x, YF + 700, Z0, Z0 + 1000, 90, 12); a.circ(x, YF + 700, 90); }
      if (v.awning) { a.prism([[X0, YF + 900], [X1, YF + 900], [X1, YB - 250], [X0, YB - 250]], Z1 - 300, Z1 - 240); a.box(X0, YF + 900, Z1 - 240, X1, YF + 930, Z1); for (const x of [X0 + 80, X1 - 80]) a.cyl(x, YF + 960, Z0, Z1 - 300, 50, 10); a.rect(X0, YF + 900, X1, YB - 250, 'EQUIP-DETAIL'); }
      a.rect(X0, YF + 150, X1, YF + 450, 'EQUIP-DETAIL');
      a.log('Added the wall section, sliding glass window' + (v.dbl ? 's' : '') + ' with a shelf, ' + (v.awning ? 'the awning on posts, ' : '') + 'two bollards and the curb strip (plan and 3D).');
    } }),

  // ===================================================== mall entrances, parking and plaza =====================================================
  fam({ cat: 'site/landscape', title: 'Generic glazed entrance vestibule',
    desc: (v) => `Glazed entrance vestibule, ${v.w} ft wide, with a steel frame, glazed walls, a flat roof with a fascia and two pairs of ${v.pairs === 1 ? 'swing doors' : 'swing doors in each line'} with push bars and 90 degree swings.`,
    vs: [[8, 1], [10, 1], [12, 2], [16, 2]].map(([w, pairs]) => [`${w} ft wide`, w * 12, 108, 126, 0, { w, pairs }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20);
      const post = (x, y) => a.box(x - 40, y - 40, Z0 + 20, x + 40, y + 40, Z1 - 200);
      for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) post(x, y);
      a.box(X0 - 100 * 0, YF, Z1 - 200, X1, YB, Z1 - 120); a.box(X0, YF, Z1 - 120, X1, YB, Z1);
      for (const x of [X0, X1 - 30]) a.frame(x, Z0 + 20, x + 30, Z1 - 200, YF + 80, YB - 80, 50);
      for (const x of [X0 + 30, X1 - 30]) a.box(x - 6, YF + 140, Z0 + 80, x + 6, YB - 140, Z1 - 260);
      for (const y of [YF + 40, YB - 40]) { const pairs = v.pairs, tot = W - 160, pw = tot / (2 * pairs); for (let i = 0; i < 2 * pairs; i++) { const hx = X0 + 80 + i * pw, dir = i % 2 === 0 ? 1 : -1; O.swingLeaf(a, dir > 0 ? hx : hx + pw, y, pw - 8, dir, Z0 + 25, Z1 - 210, { bar: true }); } }
      a.log('Added the frame, glazed side walls, roof with fascia and two lines of swing doors with push bars and swings (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic shopping cart corral',
    desc: (v) => `Shopping cart corral for ${v.cap} carts: two side rails on posts with a bar top and low rail, a return-bar entry with a curved guide, a back stop bar and a sign face at the end.`,
    vs: [6, 10, 14, 20].map((cap) => [`${cap} carts`, 29, cap * 7 + 22, 40, 0, { cap }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
      const np = m.max(3, m.ceil(D / 1500) + 1);
      for (const x of [X0 + 40, X1 - 40]) { for (let i = 0; i < np; i++) { const y = YF + 80 + ((D - 160) * i) / (np - 1); a.cyl(x, y, Z0, Z1 - 80, 30, 10); a.circ(x, y, 30); a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z0 + 12); } a.tube([[x, YF + 80, Z1 - 80], [x, YB - 80, Z1 - 80]], [22, 22], 8); a.tube([[x, YF + 80, Z0 + 330], [x, YB - 80, Z0 + 330]], [16, 16], 8); a.line(x, YF + 80, x, YB - 80, 'EQUIP-DETAIL'); }
      a.tube([[X0 + 40, YB - 80, Z1 - 80], [X1 - 40, YB - 80, Z1 - 80]], [22, 22], 8); a.tube([[X0 + 40, YB - 80, Z0 + 330], [X1 - 40, YB - 80, Z0 + 330]], [16, 16], 8);
      a.tube([[X0 + 40, YF + 80, Z1 - 80], [X0 + 40 - 0, YF + 40, Z1 - 80], [cx - 150, YF + 20, Z1 - 80]], [22, 22, 22], 8); a.tube([[X1 - 40, YF + 80, Z1 - 80], [cx + 150, YF + 20, Z1 - 80]], [22, 22], 8);
      a.box(X0 + 20, YB - 100, Z1 - 80, X1 - 20, YB - 80, Z1 + 0.0 + 0.001); a.box(X0 + 140, YB - 120, Z1 - 460, X1 - 140, YB - 100, Z1 - 80); a.rect(X0 + 140, YB - 120, X1 - 140, YB - 100, 'EQUIP-DETAIL');
      a.log('Added the side rails on posts, the entry guide, the back bar and the sign face (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic inverted-U bike rack row',
    desc: (v) => `Row of ${v.n} inverted-U bike racks in steel tube, each with a flange foot with two anchor bolts, spaced 30 in on centre and ${v.n * 2} bikes wide.`,
    vs: [3, 4, 6, 8].map((n) => [`${n} loops`, n * 30 + 4, 12, 36, 0, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      for (let i = 0; i < v.n; i++) { const x = X0 + 380 + i * 762 - (v.n * 762 - a.W + 760) / 2 * 0; const xx = X0 + (a.W * (i + 0.5)) / v.n;
        a.tube([[xx, cy, Z0 + 30], [xx, cy, Z1 - 160], [xx, cy - 40 * 0, Z1 - 80], [xx, cy, Z1 - 20]], [18, 18, 18, 18], 8);
        a.tube([[xx, cy - 170, Z0 + 30], [xx, cy - 170, Z1 - 200], [xx, cy - 150, Z1 - 60], [xx, cy - 90, Z1 - 20], [xx, cy, Z1 - 20]], [18, 18, 18, 18, 18], 8);
        a.tube([[xx, cy + 170, Z0 + 30], [xx, cy + 170, Z1 - 200], [xx, cy + 150, Z1 - 60], [xx, cy + 90, Z1 - 20], [xx, cy, Z1 - 20]], [18, 18, 18, 18, 18], 8);
        for (const y of [cy - 170, cy + 170]) { a.cyl(xx, y, Z0, Z0 + 30, 55, 10); a.circ(xx, y, 55, 'EQUIP-DETAIL'); a.circ(xx, y, 18); }
        a.line(xx, cy - 170, xx, cy + 170, 'EQUIP-DETAIL'); }
      a.log('Added ' + v.n + ' inverted-U tube loops with flange feet and anchor bolts (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic parking gate arm',
    desc: (v) => `Parking gate barrier with a ${v.arm} ft striped arm on a hinge, a balanced counterweight, a floor-mounted housing with a service door and lock, a lamp on top and a footing plate.`,
    vs: [[8], [10], [12], [14]].map(([arm]) => [`${arm} ft arm`, arm * 12 + 14, 14, 48, 0, { arm }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      const hx = X0 + 180; a.box(X0 + 20, YF, Z0, X0 + 340, YB, Z0 + 30); a.box(hx - 150, YF + 30, Z0 + 30, hx + 150, YB - 30, Z0 + 1050); a.box(hx - 120, YF + 24, Z0 + 150, hx + 120, YF + 30, Z0 + 900); a.rect(hx - 120, YF + 24, hx + 120, YF + 30, 'EQUIP-DETAIL'); a.ycyl(YF + 14, YF + 24, hx + 80, Z0 + 620, 22, 8);
      a.cyl(hx, cy, Z0 + 1050, Z0 + 1090, 90, 14); a.ell(hx, cy, Z0 + 1110, 60, 60, 60, 10, 5);
      const zc = Z0 + 900, nb = 8, L = X1 - hx - 150; a.xcyl(hx + 150, hx + 220, cy, zc, 90, 12); a.ell(hx + 160, cy, zc, 120, 70, 70, 10, 5);
      for (let i = 0; i < nb; i++) { const x0 = hx + 220 + (L - 70) * i / nb, x1 = hx + 220 + (L - 70) * (i + 1) / nb; a.box(x0, cy - 30, zc - 40, x1, cy + 30, zc + 40); if (i % 2 === 0) a.box(x0 + 2, cy - 33, zc - 43, x1 - 2, cy + 33, zc + 43); }
      a.line(hx, cy, X1 - 20, cy, 'EQUIP-DETAIL'); a.box(hx - 380 * 0 - 100, YB - 10, Z0 + 1050, hx + 100, YB, Z0 + 1100);
      a.log('Added the footing plate, the housing with service door, the striped arm on its hinge and the lamp (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic parking pay station',
    desc: (v) => `Parking ${v.kind}: a freestanding steel cabinet with a ${v.screen} in colour screen, a keypad, a card reader, a coin and note slot, a receipt slot, a solar panel on a visor and a bolted base plate.`,
    vs: [['pay station', 'pay station', 7], ['pay-on-foot machine', 'pay-on-foot machine', 10], ['entry ticket post', 'entry ticket post', 0]].map(([l, kind, screen], i) => [l, i === 1 ? 24 : 14, i === 1 ? 14 : 12, i === 1 ? 62 : 58, 0, { kind, screen }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0 + 40, YF + 20, Z0 + 20, X1 - 40, YB - 20, Z1 - 120);
      a.box(X0 + 20, YF + 10, Z1 - 120, X1 - 20, YB - 10, Z1 - 20); a.box(X0 + 10, YF - 120, Z1 - 20, X1 - 10, YB, Z1);
      a.rect(X0 + 10, YF - 120, X1 - 10, YB, 'EQUIP-DETAIL');
      const f = YF + 10; let zz = Z1 - 150;
      if (v.screen) { a.box(cx - W * 0.25, f - 3, zz - 300, cx + W * 0.25, f, zz); a.rect(cx - W * 0.25, f - 3, cx + W * 0.25, f, 'EQUIP-DETAIL'); zz -= 340; }
      else a.box(cx - 90, f - 4, zz - 200, cx + 90, f, zz - 100);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) a.box(cx - 100 + c * 70, f - 4, zz - 40 - r * 60, cx - 50 + c * 70, f, zz - 10 - r * 60);
      a.box(cx - 90, f - 4, zz - 260, cx + 90, f, zz - 235); a.box(cx - 60, f - 6, zz - 340, cx + 60, f, zz - 320);
      a.add(pyramid(cx, cy, Z1, Z1 + 40, m.min(W, a.D) * 0.5 - 4)); 
      a.log('Added the base plate, cabinet, ' + (v.screen ? 'screen, ' : '') + 'keypad, card reader, slots and the solar visor (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic plaza retail kiosk',
    desc: (v) => `Freestanding retail kiosk, ${v.w} x ${v.d} ft, with a base counter with doors, glazed upper walls with a service opening, a flat roof with an overhang and sign band, and a roll shutter above the opening.`,
    vs: [[6, 6], [8, 8], [10, 8], [12, 10]].map(([w, d]) => [`${w} x ${d} ft`, w * 12, d * 12, 120, 0, { w, d }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a; a.outline();
      a.box(X0 + 120, YF + 120, Z0, X1 - 120, YB - 120, Z0 + 1000); a.rect(X0 + 120, YF + 120, X1 - 120, YB - 120, 'EQUIP-DETAIL');
      const n = m.max(2, m.round(W / 900)); const fw = (W - 240) / n; for (let i = 0; i < n; i++) { a.box(X0 + 120 + i * fw + 20, YF + 112, Z0 + 140, X0 + 120 + (i + 1) * fw - 20, YF + 120, Z0 + 960); a.line(X0 + 120 + i * fw, YF + 120, X0 + 120 + i * fw, YF + 150, 'EQUIP-DETAIL'); }
      a.box(X0 + 90, YF + 90, Z0 + 1000, X1 - 90, YB - 90, Z0 + 1040);
      for (const [x, y] of [[X0 + 140, YF + 140], [X1 - 140, YF + 140], [X0 + 140, YB - 140], [X1 - 140, YB - 140]]) a.cyl(x, y, Z0 + 1040, Z1 - 350, 40, 8);
      for (const [x0, y0, x1, y1] of [[X0 + 140, YF + 150, X0 + 160, YB - 150], [X1 - 160, YF + 150, X1 - 140, YB - 150], [X0 + 160, YB - 160, X1 - 160, YB - 140]]) a.box(x0, y0, Z0 + 1040, x1, y1, Z1 - 350);
      a.frame(X0 + 160, Z0 + 1300, X1 - 160, Z1 - 600, YF + 132, YF + 150, 50);
      a.box(X0 + 160, YF + 100, Z0 + 1090, X1 - 160, YF + 150, Z0 + 1300);
      a.box(X0 + 160, YF + 128, Z1 - 600, X1 - 160, YF + 150, Z1 - 350);
      a.prism([[X0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 350, Z1 - 290); a.box(X0, YF, Z1 - 290, X1, YF + 40, Z1 - 100); a.box(X0, YB - 40, Z1 - 290, X1, YB, Z1 - 100); a.box(X0, YF, Z1 - 290, X0 + 40, YB, Z1 - 100); a.box(X1 - 40, YF, Z1 - 290, X1, YB, Z1 - 100); a.box(X0 + 100, YF - 20, Z1 - 250, X1 - 100, YF, Z1 - 140);
      a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the base counter with door panels, counter top, glazed upper walls, service opening, roll shutter, roof with overhang and the sign band (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic vendor cart with umbrella',
    desc: (v) => `Vendor cart ${v.w} in wide with a cabinet base with two doors, a counter top, a pull handle, two large wheels and two casters, and a ${v.umbrella ? v.umbrella + ' ft round shade umbrella on a pole through the counter' : 'folding sun shade on two poles'}.`,
    vs: [[48, 6], [60, 7], [72, 8]].map(([w, um]) => [`${w} in cart`, m.max(w, um * 12 + 12), m.max(30, um * 12 + 12), 100, 0, { w, umbrella: um }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, cw = v.w * IN, cd = 760;
      a.circ(cx, cy, a.W / 2, 'EQUIP-HIDDEN'); a.rect(cx - cw / 2, cy - cd / 2, cx + cw / 2, cy + cd / 2);
      for (const sx of [-1, 1]) { a.xcyl(cx + sx * (cw / 2 - 40) - 25, cx + sx * (cw / 2 - 40) + 25, cy + 150, Z0 + 260, 260, 18); a.rect(cx + sx * (cw / 2 - 40) - 25, cy + 150 - 260, cx + sx * (cw / 2 - 40) + 25, cy + 150 + 260, 'EQUIP-DETAIL'); a.caster(cx + sx * (cw / 2 - 60), cy - 250, 130); }
      a.box(cx - cw / 2 + 20, cy - cd / 2 + 60, Z0 + 280, cx + cw / 2 - 20, cy + cd / 2 - 40, Z0 + 880); a.box(cx - cw / 2, cy - cd / 2 + 40, Z0 + 880, cx + cw / 2, cy + cd / 2, Z0 + 930);
      for (let i = 0; i < 2; i++) { const x0 = cx - cw / 2 + 40 + i * (cw / 2 - 20), x1 = x0 + cw / 2 - 60; a.box(x0, cy - cd / 2 + 52, Z0 + 320, x1, cy - cd / 2 + 60, Z0 + 840); a.box(x1 - 90 - (i ? 0 : 0), cy - cd / 2 + 40, Z0 + 640, x1 - 60, cy - cd / 2 + 52, Z0 + 720); }
      a.tube([[cx - cw / 2 + 30, cy + cd / 2 - 20, Z0 + 700], [cx - cw / 2 - 150, cy + cd / 2 + 120, Z0 + 850]], [14, 14], 8);
      const ur = (v.umbrella * FT) / 2; a.cyl(cx, cy, Z0 + 930, Z1 - 200, 26, 8); a.cone(cx, cy, Z1 - 330, Z1, ur, 18, 22); a.circ(cx, cy, ur, 'EQUIP-DETAIL'); a.ell(cx, cy, Z1 + 0.0, 30, 30, 20, 8, 4);
      a.log('Added the cabinet base with two doors, counter top, two wheels, casters, pull handle and the shade umbrella with its pole (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic plaza planter',
    desc: (v) => `Plaza planter, ${v.shape}, with concrete walls and a rim, a soil surface and ${v.n} plant clumps; the footprint is ${v.w} x ${v.d} in.`,
    vs: [['round, 30 in', 30, 30, 30, 'round', 3], ['round, 48 in', 48, 48, 32, 'round', 5], ['square, 36 in', 36, 36, 30, 'square', 4], ['long, 72 x 24 in', 72, 24, 28, 'long', 6]].map(([l, w, d, h, shape, n]) => [l, w, d, h, 0, { shape: l.split(',')[0], form: shape, n, w, d }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a;
      if (v.form === 'round') { const r = W / 2; a.circ(cx, cy, r); a.circ(cx, cy, r - 70, 'EQUIP-DETAIL'); a.tube([[cx, cy, Z0], [cx, cy, Z1 - 150]], [r * 0.96, r], 28); a.cyl(cx, cy, Z1 - 150, Z1 - 100, r + 8, 28); a.cyl(cx, cy, Z1 - 120, Z1 - 80, r - 70, 28); a.circ(cx, cy, r + 8, 'EQUIP'); }
      else { a.outline(); a.box(X0 + 8, YF + 8, Z0, X1 - 8, YB - 8, Z1 - 150); a.box(X0, YF, Z1 - 150, X1, YB, Z1 - 100); a.box(X0 + 70, YF + 70, Z1 - 140, X1 - 70, YB - 70, Z1 - 80); a.rect(X0 + 70, YF + 70, X1 - 70, YB - 70, 'EQUIP-DETAIL'); }
      const n = v.n, rr = v.form === 'long' ? m.min(D * 0.28, (W / n) * 0.5) : W * 0.14;
      for (let i = 0; i < n; i++) { const x = v.form === 'long' ? X0 + (W * (i + 0.5)) / n : cx + (n > 1 ? m.cos((i / (n - 1 || 1)) * 6.28 + 0.5) * W * 0.2 * (i ? 1 : 0) : 0), y = v.form === 'long' ? cy + (i % 2 ? 40 : -40) : cy + (n > 1 ? m.sin((i / (n - 1 || 1)) * 6.28 + 0.5) * D * 0.2 * (i ? 1 : 0) : 0); a.ell(x, y, Z1 - 210, rr, rr, 170, 12, 6); a.circ(x, y, rr, 'EQUIP-DETAIL'); }
      a.log('Added the planter walls with a rim, the soil surface and ' + n + ' plant clumps (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic backless plaza bench',
    desc: (v) => `Backless plaza bench, ${v.len} ft long, with ${v.slats} hardwood-style seat slats on two cast end frames${v.len > 6 ? ' and a middle frame' : ''}, anchor flanges at each foot and a centre stretcher.`,
    vs: [[4, 5], [6, 5], [8, 5]].map(([len, slats]) => [`${len} ft`, len * 12, 18, 17, 0, { len, slats }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      const sz = Z1 - 40, fr = v.len > 6 ? [X0 + 150, cx, X1 - 150] : [X0 + 150, X1 - 150];
      for (const x of fr) { a.box(x - 20, YF + 20, Z0, x + 20, YF + 90, Z0 + 20); a.box(x - 20, YB - 90, Z0, x + 20, YB - 20, Z0 + 20); a.box(x - 20, YF + 40, Z0 + 20, x + 20, YF + 70, sz); a.box(x - 20, YB - 70, Z0 + 20, x + 20, YB - 40, sz); a.box(x - 20, YF + 40, sz - 30, x + 20, YB - 40, sz); a.box(x - 20, YF + 60, Z0 + 20, x + 20, YB - 60, Z0 + 60); }
      const sw = (a.D - 20) / v.slats; for (let i = 0; i < v.slats; i++) { a.box(X0, YF + 10 + i * sw + 4, sz, X1, YF + 10 + (i + 1) * sw - 4, sz + 40); a.line(X0, YF + 10 + i * sw, X1, YF + 10 + i * sw, 'EQUIP-DETAIL'); }
      a.xcyl(fr[0], fr[fr.length - 1], a.cy, Z0 + 150, 20, 8);
      a.log('Added the cast end frames' + (fr.length > 2 ? ', the middle frame' : '') + ', ' + v.slats + ' seat slats and the stretcher (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic plaza fountain',
    desc: (v) => `Round plaza fountain, ${v.dia} ft across, with a raised curb wall and rim, a water surface, a ${v.tiers === 2 ? 'two-tier' : 'single'} centre bowl on a column and ${v.jets} ring jets with arcs of water.`,
    vs: [[6, 1, 6], [8, 1, 8], [10, 2, 10], [12, 2, 12]].map(([dia, tiers, jets]) => [`${dia} ft, ${tiers === 2 ? 'two tier' : 'single bowl'}`, dia * 12, dia * 12, 40 + tiers * 18, 0, { dia, tiers, jets }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, R = a.W / 2;
      a.circ(cx, cy, R); a.circ(cx, cy, R - 250, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0, Z0 + 480, R, 36); a.cyl(cx, cy, Z0 + 480, Z0 + 540, R + 40, 36); a.circ(cx, cy, R + 40, 'EQUIP');
      a.cyl(cx, cy, Z0 + 300, Z0 + 330, R - 250, 36); a.circ(cx, cy, R * 0.28, 'EQUIP-DETAIL');
      const tz = Z0 + 330, tH = (Z1 - tz) / (v.tiers + 1);
      for (let t = 0; t < v.tiers; t++) { const r = R * (0.26 - t * 0.1), z0 = tz + t * tH * 1.4 + 200 * t; a.cone(cx, cy, z0 + 120, z0 + 260, r * 0.3, r * 0.3, 14); a.tube([[cx, cy, z0 + 260], [cx, cy, z0 + 300], [cx, cy, z0 + 340]], [r, r * 0.95, r * 0.7], 24); }
      const n = v.jets; for (let i = 0; i < n; i++) { const g = (i / n) * m.PI * 2, jr = R * 0.58; a.cyl(cx + m.cos(g) * jr, cy + m.sin(g) * jr, Z0 + 320, Z0 + 380, 28, 8); a.tube([[cx + m.cos(g) * jr, cy + m.sin(g) * jr, Z0 + 380], [cx + m.cos(g) * jr * 0.8, cy + m.sin(g) * jr * 0.8, Z0 + 900], [cx + m.cos(g) * jr * 0.55, cy + m.sin(g) * jr * 0.55, Z0 + 700]], [6, 5, 4], 6); }
      a.log('Added the curb wall with rim, the water surface, the centre bowl' + (v.tiers === 2 ? 's' : '') + ' on a column and the ring of jets (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic plaza directory sign',
    desc: (v) => `Double-sided plaza directory sign, ${v.w} in wide, with two lit map panels in a framed cabinet with a header band, a concrete footing and two steel legs, and a lit legend strip on each face.`,
    vs: [[40, 72], [60, 78], [72, 84]].map(([w, h]) => [`${w} in wide`, w, 8, h, 0, { w }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0 + 40, YF - 100, Z0, X1 - 40, YB + 100 > YB ? YB : YB, Z0 + 150);
      for (const x of [X0 + 140, X1 - 140]) a.box(x - 50, a.cy - 40, Z0 + 150, x + 50, a.cy + 40, Z0 + 800);
      const zb = Z0 + 800, zt = Z1; a.box(X0, YF, zb, X1, YB, zt); a.frame(X0, zb, X1, zt, YF - 6, YF + 4, 50); a.frame(X0, zb, X1, zt, YB - 4, YB + 0, 50);
      a.box(X0 + 50, YF - 8, zb + 50, X1 - 50, YF - 3, zt - 280); a.box(X0 + 50, YB, zb + 50, X1 - 50, YB + 5, zt - 280);
      a.box(X0 + 50, YF - 8, zt - 220, X1 - 50, YF - 3, zt - 60); a.rect(X0 + 50, YF - 8, X1 - 50, YF, 'EQUIP-DETAIL');
      for (let i = 0; i < 5; i++) a.box(X0 + 90, YF - 12, zb + 90 + i * 70, X0 + 90 + (W - 180) * (0.35 + 0.1 * (i % 3)), YF - 8, zb + 90 + i * 70 + 24);
      a.log('Added the footing, two steel legs, the framed double-sided cabinet with lit map panels, the header band and the legend bars (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic plaza light pole',
    desc: (v) => `Plaza light pole, ${v.hgt} ft tall, with a bolt-on base plate and cover, a tapered round shaft, ${v.arms === 2 ? 'two curved arms each with a cutoff luminaire' : 'one curved arm with a cutoff luminaire'} and a banner bracket pair.`,
    vs: [[12, 1], [16, 1], [20, 2]].map(([hgt, arms]) => [`${hgt} ft, ${arms === 2 ? 'twin' : 'single'} arm`, 44, 14, hgt * 12 + 6, 0, { hgt, arms }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, ht = Z1 - Z0 - 150;
      a.circ(cx, cy, 190); a.circ(cx, cy, 70, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0, Z0 + 20, 190, 20); a.cone(cx, cy, Z0 + 20, Z0 + 360, 140, 90, 16); a.cone(cx, cy, Z0 + 360, Z1 - 150, 75, 45, 14);
      for (const s of v.arms === 2 ? [-1, 1] : [1]) { a.tube([[cx, cy, Z1 - 300], [cx + s * 130, cy, Z1 - 150], [cx + s * 290, cy, Z1 - 120]], [38, 28, 22], 8); a.prism([[cx + s * 290 - 240, cy - 120], [cx + s * 290 + 240, cy - 120], [cx + s * 290 + 240, cy + 120], [cx + s * 290 - 240, cy + 120]], Z1 - 150, Z1 - 100); a.ell(cx + s * 290, cy, Z1 - 150, 210, 90, 30, 12, 4); a.rect(cx + s * 290 - 240, cy - 120, cx + s * 290 + 240, cy + 120, 'EQUIP-DETAIL'); }
      for (const z of [Z1 - 900, Z1 - 1700]) { a.box(cx + 40, cy - 8, z - 6, cx + 330, cy + 8, z + 6); a.box(cx + 316, cy - 8, z - 6, cx + 330, cy + 8, z + 450); }
      a.log('Added the base plate and cover, the tapered shaft, ' + (v.arms === 2 ? 'two curved arms' : 'a curved arm') + ' with cutoff luminaires and the banner brackets (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic plaza tree in grate',
    desc: (v) => `Plaza tree, ${v.crown} ft crown, with a trunk, a layered foliage crown of clustered masses, and a square cast tree grate in the paving with a round opening and a root guard curb.`,
    vs: [[10, 4], [14, 5], [18, 6]].map(([crown, grate]) => [`${crown} ft crown`, crown * 12 + 10, crown * 12 + 10, crown * 12 * 1.6, 0, { crown, grate }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, cr = (v.crown * FT) / 2, g = (v.grate * FT) / 2; a.outline();
      a.box(cx - g, cy - g, Z0, cx + g, cy + g, Z0 + 40); a.rect(cx - g, cy - g, cx + g, cy + g); a.circ(cx, cy, 380, 'EQUIP-DETAIL'); a.circ(cx, cy, 160, 'EQUIP-DETAIL');
      for (let i = 1; i < 6; i++) { a.line(cx - g + (2 * g * i) / 6, cy - g + 30, cx - g + (2 * g * i) / 6, cy + g - 30, 'EQUIP-DETAIL'); }
      a.tube([[cx, cy, Z0 + 40], [cx + 20, cy, Z0 + cr * 0.9], [cx - 30, cy, Z0 + cr * 1.5]], [150, 110, 70], 12); a.tube([[cx - 10, cy, Z0 + cr * 1.0], [cx - cr * 0.4, cy, Z0 + cr * 1.5]], [50, 30], 8); a.tube([[cx + 10, cy, Z0 + cr * 1.0], [cx + cr * 0.4, cy, Z0 + cr * 1.55]], [50, 30], 8);
      const zc = Z1 - cr * 0.8; for (const [dx, dy, dz, k] of [[0, 0, 0, 0.85], [-0.38, 0.2, -0.1, 0.55], [0.38, -0.1, -0.12, 0.55], [0.1, -0.36, -0.05, 0.5], [-0.15, 0.38, -0.05, 0.5], [0, 0, 0.3, 0.55]]) a.ell(cx + dx * cr, cy + dy * cr, zc + dz * cr, cr * k, cr * k, cr * k * 0.78, 14, 7);
      a.circ(cx, cy, cr, 'EQUIP-DETAIL');
      a.log('Added the cast grate with its round opening, the trunk with two limbs and a crown of six foliage masses (plan and 3D).');
    } }),

  fam({ cat: 'site/landscape', title: 'Generic transit shelter with advertising panel',
    desc: (v) => `Transit shelter, ${v.len} ft long, with a sloped roof on four posts, a glazed back, a slatted bench and a lit double-face advertising panel at one end; the panel has a frame and a base shoe.`,
    vs: [[10], [14]].map(([len]) => [`${len} ft`, len * 12, 66, 114, 0, { len }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      const pw = 1000; for (const [x, y] of [[X0 + 60, YB - 60], [X0 + 60, YF + 120], [X1 - pw, YB - 60], [X1 - pw, YF + 120]]) a.cyl(x, y, Z0, Z1 - 160, 40, 10);
      a.prism([[X0, YF], [X1 - pw + 100, YF], [X1 - pw + 100, YB], [X0, YB]], Z1 - 160, Z1 - 120); a.box(X0, YF, Z1 - 120, X1 - pw + 100, YF + 30, Z1 - 40); a.rect(X0, YF, X1 - pw + 100, YB, 'EQUIP-DETAIL');
      a.frame(X0 + 60, Z0 + 300, X1 - pw - 60, Z1 - 180, YB - 70, YB - 50, 40); a.box(X0 + 200, YB - 500, Z0 + 440, X1 - pw - 200, YB - 80, Z0 + 470); for (const x of [X0 + 260, X1 - pw - 260]) a.box(x - 15, YB - 450, Z0, x + 15, YB - 120, Z0 + 440);
      const ax0 = X1 - pw + 100, ax1 = X1; a.box(ax0, a.cy - 50, Z0, ax1, a.cy + 50, Z0 + 100); a.box(ax0 + 30, a.cy - 90, Z0 + 100, ax1 - 30, a.cy + 90, Z1 - 120); a.box(ax0 + 60, a.cy - 98, Z0 + 180, ax1 - 60, a.cy - 90, Z1 - 200); a.box(ax0 + 60, a.cy + 90, Z0 + 180, ax1 - 60, a.cy + 98, Z1 - 200); a.rect(ax0 + 30, a.cy - 90, ax1 - 30, a.cy + 90, 'EQUIP-DETAIL');
      a.log('Added the sloped roof on four posts, the glazed back, the slatted bench and the lit double-face advertising panel on its base shoe (plan and 3D).');
    } }),
];

// each family lists every honest size; this keeps a spread so the group holds exactly 150 objects
const KEEP = {
  'Generic parking pay station': [0, 1], 'Generic shopping cart corral': [0, 1, 2], 'Generic inverted-U bike rack row': [0, 1, 3], 'Generic plaza fountain': [0, 2, 3],
  'Generic plaza planter': [0, 1, 3], 'Generic glazed entrance vestibule': [0, 1, 3], 'Generic plaza retail kiosk': [0, 1, 3],
};
export default FAMS.map((f) => (KEEP[f.title] ? { ...f, vs: KEEP[f.title].map((i) => f.vs[i]) } : f));
