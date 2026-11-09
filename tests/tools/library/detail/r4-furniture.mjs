/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4 furniture (2026-11-03): restaurants, airports, shopping centres and retail. 150 variants. Original geometry from boxes, tubes and ellipsoids. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const fams = [];
const P = (f) => { fams.push(fam(f)); };
const cushion = FU.cushion;
const IN = 25.4;
const cnt = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const legsAt = (a, pts, z0, z1, r) => { for (const [x, y] of pts) { a.leg(x, y, z0, z1, r); a.circ(x, y, r, 'EQUIP-HIDDEN'); } };
const ring = (a, cx, cy, r0, r1, z0, z1, an0, an1, n, planLayer = 'EQUIP-DETAIL') => {   // a curved band built from convex quads
  for (let i = 0; i < n; i++) {
    const g0 = (an0 + ((an1 - an0) * i) / n) * Math.PI / 180, g1 = (an0 + ((an1 - an0) * (i + 1)) / n) * Math.PI / 180;
    const q = [[cx + Math.cos(g0) * r0, cy + Math.sin(g0) * r0], [cx + Math.cos(g1) * r0, cy + Math.sin(g1) * r0], [cx + Math.cos(g1) * r1, cy + Math.sin(g1) * r1], [cx + Math.cos(g0) * r1, cy + Math.sin(g0) * r1]];
    a.prism(q, z0, z1);
    if (planLayer) a.poly(q, planLayer);
  }
};

/** A four-leg side chair. o: sh (seat height mm) · back slat|ladder|pad · arms · pad (upholstered seat) · stretch */
function chair(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1 } = a;
  const sh = Z0 + (o.sh ?? 460), ix = 30, r = o.r ?? 15;
  const fx0 = X0 + ix, fx1 = X1 - ix, fy = YF + ix, by = YB - ix;
  a.outline();
  legsAt(a, [[fx0, fy], [fx1, fy]], Z0, sh - 20, r);
  for (const x of [fx0, fx1]) { a.box(x - 13, by - 11, Z0, x + 13, by + 11, Z1 - 10); a.rect(x - 13, by - 11, x + 13, by + 11, 'EQUIP-HIDDEN'); }
  a.box(fx0, fy - 10, sh - 75, fx1, fy + 10, sh - 25).box(fx0, by - 10, sh - 75, fx1, by + 10, sh - 25);
  a.box(fx0 - 8, fy, sh - 75, fx0 + 8, by, sh - 25).box(fx1 - 8, fy, sh - 75, fx1 + 8, by, sh - 25);
  if (o.stretch !== false) { a.xcyl(fx0, fx1, fy, Z0 + 160, 7, 6); a.xcyl(fx0, fx1, by, Z0 + 160, 7, 6); a.ycyl(fy, by, fx0, Z0 + 160, 7, 6); a.ycyl(fy, by, fx1, Z0 + 160, 7, 6); }
  if (o.pad) cushion(a, X0 + 18, YF + 18, X1 - 18, YB - 40, sh - 25, sh + 45); else a.box(X0 + 16, YF + 16, sh - 25, X1 - 16, YB - 38, sh);
  a.rect(X0 + 16, YF + 16, X1 - 16, YB - 38, 'EQUIP-DETAIL');
  const top = Z1 - 10, bk = o.back ?? 'slat';
  if (bk === 'pad') { a.box(fx0 + 10, by - 12, sh + 120, fx1 - 10, by + 12, top - 15); a.ell(a.cx, by - 14, (sh + 120 + top - 15) / 2, (fx1 - fx0) / 2 - 12, 18, (top - 15 - sh - 120) / 2, 14, 6); }
  else {
    const n = bk === 'ladder' ? 4 : 3, th = bk === 'ladder' ? 30 : 55, z0 = sh + 130, span = top - z0;
    for (let i = 0; i < n; i++) { const z = z0 + (span - th) * (i / (n - 1)); a.box(fx0, by - 8, z, fx1, by + 8, z + th); }
  }
  a.rect(fx0, by - 12, fx1, by + 12, 'EQUIP-DETAIL');
  if (o.arms) for (const x of [fx0, fx1]) { a.box(x - 15, fy + 30, sh + 150, x + 15, by, sh + 180); a.box(x - 9, fy + 30, sh - 25, x + 9, fy + 50, sh + 150); a.rect(x - 15, fy + 30, x + 15, by, 'EQUIP-DETAIL'); }
}

/** A stool on four legs or a pedestal. o: sh · round · back · arms · ring (foot ring) · swivel (pedestal + disc foot) · pad */
function stool(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a;
  const sh = Z0 + o.sh, r = Math.min(W, D) / 2 - 10;
  a.outline();
  if (o.swivel) {
    a.ell(cx, cy, Z0 + 16, r * 0.82, r * 0.82, 16, 18, 4); a.cone(cx, cy, Z0 + 16, sh - 90, 28, 22, 12);
    a.tube([[cx, cy, o.ringZ ?? Z0 + sh * 0.35], [cx, cy, (o.ringZ ?? Z0 + sh * 0.35) + 2]], [r * 0.7, r * 0.7], 20);
    a.circ(cx, cy, r * 0.82, 'EQUIP-HIDDEN');
  } else {
    const k = r * 0.72;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const lx = cx + sx * k * 0.85, ly = cy + sy * k * 0.85; a.tube([[lx * 0.94 + cx * 0.06, ly * 0.94 + cy * 0.06, sh - 30], [lx, ly, Z0]], [14, 11], 8); a.circ(lx, ly, 12, 'EQUIP-HIDDEN'); }
    if (o.ring !== false) { const rz = Z0 + sh * 0.38; a.tube([[cx, cy, rz], [cx, cy, rz + 2]], [r * 0.62, r * 0.62], 20); a.circ(cx, cy, r * 0.62, 'EQUIP-HIDDEN'); }
  }
  a.box(cx - 40, cy - 40, sh - 50, cx + 40, cy + 40, sh - 15);
  if (o.pad) { a.ell(cx, cy, sh - 20, r, r, 55, 20, 5); a.cyl(cx, cy, sh - 40, sh - 10, r * 0.92, 20); } else a.cyl(cx, cy, sh - 45, sh, r, 24);
  a.circ(cx, cy, r, 'EQUIP-DETAIL');
  if (o.back) {
    const bh = o.backH ?? 220;
    for (const dx of [-1, 1]) a.tube([[cx + dx * r * 0.8, cy + r * 0.55, sh], [cx + dx * r * 0.8, cy + r * 0.72, sh + bh]], [8, 8], 6);
    a.ell(cx, cy + r * 0.7, sh + bh - 30, r * 0.9, 22, 55, 16, 6);
    a.rect(cx - r * 0.9, cy + r * 0.55, cx + r * 0.9, cy + r * 0.85, 'EQUIP-DETAIL');
  }
  if (o.arms) for (const dx of [-1, 1]) { a.tube([[cx + dx * r * 0.95, cy + r * 0.6, sh + 190], [cx + dx * r * 0.95, cy - r * 0.2, sh + 190]], [10, 10], 6); a.tube([[cx + dx * r * 0.95, cy - r * 0.2, sh], [cx + dx * r * 0.95, cy - r * 0.2, sh + 190]], [8, 8], 6); }
}

/** Seat run for a booth or banquette: plinth, seat cushions, back with channels. o: sh · back (top height) · channels n · tufted · twoSided */
function bench(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a;
  const sh = Z0 + (o.sh ?? 440), n = o.channels ?? Math.max(1, Math.round(W / 610)), bd = o.backD ?? 110;
  a.outline();
  a.box(X0, YF + 40, Z0, X1, YB, Z0 + 90);
  a.box(X0, YF + 40, Z0 + 90, X1, YB - bd, sh - 70);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + (W * i) / n + 3, x1 = X0 + (W * (i + 1)) / n - 3;
    cushion(a, x0, YF + 30, x1, YB - bd - 6, sh - 70, sh + 55);
    a.rect(x0, YF + 30, x1, YB - bd - 6, 'EQUIP-DETAIL');
    const bz0 = sh + 60, bz1 = Z1;
    a.box(x0, YB - bd, bz0, x1, YB, bz1);
    a.ell((x0 + x1) / 2, YB - bd - 2, (bz0 + bz1) / 2, (x1 - x0) / 2 - 4, 20, (bz1 - bz0) / 2 - 6, 14, 6);
    if (o.tufted) for (let k = 1; k < 3; k++) for (const bx of [x0 + (x1 - x0) * 0.25, x0 + (x1 - x0) * 0.75]) a.cyl(bx, YB - bd - 18, bz0 + (bz1 - bz0) * (k / 3), bz0 + (bz1 - bz0) * (k / 3) + 3, 9, 6);
    a.line((x0 + x1) / 2, YB - bd, (x0 + x1) / 2, YB, 'EQUIP-DETAIL');
  }
  a.box(X0, YF + 40, sh - 70, X0 + 10, YB, Z1).box(X1 - 10, YF + 40, sh - 70, X1, YB, Z1);
  a.line(X0, YB - bd, X1, YB - bd, 'EQUIP-DETAIL');
}

/** A bench-seat row on a beam (airport gate and concourse seating). o.pat like 'SSSS' or 'SSTSS' (S seat, T tray table); b2b mirrored; power; arms */
function beamRow(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a;
  const pat = o.pat, sh = Z0 + 440, units = [...pat].map((c) => (c === 'S' ? 1 : 0.62)), tot = units.reduce((s, u) => s + u, 0);
  const aw = 44, usable = W - aw * (pat.length + 1) * 0 - 2 * 20, unit = usable / tot;
  a.outline();
  const sides = o.b2b ? [-1, 1] : [-1];
  const spineT = 70;
  // beam and uprights
  a.box(X0 + 30, cy - spineT / 2, sh - 140, X1 - 30, cy + spineT / 2, sh - 60);
  const nLeg = pat.length > 4 ? 3 : 2, xs = [];
  for (let i = 0; i < nLeg; i++) xs.push(X0 + 90 + ((W - 180) * i) / (nLeg - 1));
  for (const x of xs) { a.box(x - 25, cy - 25, Z0 + 40, x + 25, cy + 25, sh - 140); a.box(x - 45, YF + 25, Z0, x + 45, YB - 25, Z0 + 40); a.rect(x - 45, YF + 25, x + 45, YB - 25, 'EQUIP-HIDDEN'); }
  let x = X0 + 20;
  const slots = [];
  [...pat].forEach((c, i) => {
    const w = units[i] * unit;
    if (c === 'S') slots.push(['S', x, x + w]); else slots.push(['T', x, x + w]);
    x += w;
  });
  for (const sd of sides) {
    const yS = sd < 0 ? YF : cy, yE = sd < 0 ? cy : YB;   // this face's depth range
    for (const [k, x0, x1] of slots) {
      if (k === 'S') {
        const s0 = sd < 0 ? yS + 12 : cy + spineT / 2, s1 = sd < 0 ? cy - spineT / 2 : yE - 12;
        a.box(x0 + 4, s0, sh - 40, x1 - 4, s1, sh + 15); a.ell((x0 + x1) / 2, (s0 + s1) / 2, sh + 15, (x1 - x0) / 2 - 4, (s1 - s0) / 2, 22, 12, 4);
        a.rect(x0 + 4, s0, x1 - 4, s1, 'EQUIP-DETAIL');
        const bz0 = sh + 40, by0 = sd < 0 ? cy - spineT / 2 - 36 : cy + spineT / 2, by1 = sd < 0 ? cy - spineT / 2 : cy + spineT / 2 + 36;
        a.box(x0 + 4, by0, bz0, x1 - 4, by1, Z1);
        a.line(x0 + 4, by0, x1 - 4, by0, 'EQUIP-DETAIL');
      } else {
        const t0 = sd < 0 ? yS + 70 : cy + spineT / 2, t1 = sd < 0 ? cy - spineT / 2 : yE - 70;
        a.box(x0, t0, sh + 150, x1, t1, sh + 180); a.box((x0 + x1) / 2 - 20, cy - 25, sh - 60, (x0 + x1) / 2 + 20, cy + 25, sh + 150);
        a.rect(x0, t0, x1, t1, 'EQUIP-DETAIL');
        if (o.power) { a.cyl((x0 + x1) / 2, (t0 + t1) / 2, sh + 180, sh + 188, 22, 12); a.circ((x0 + x1) / 2, (t0 + t1) / 2, 22, 'EQUIP-DETAIL'); a.box((x0 + x1) / 2 - 30, (t0 + t1) / 2 + (sd < 0 ? -70 : 55), sh + 180, (x0 + x1) / 2 + 30, (t0 + t1) / 2 + (sd < 0 ? -55 : 70), sh + 186); }
      }
    }
  }
  // armrests at the boundaries next to a seat
  for (let i = 0; i <= slots.length; i++) {
    const left = slots[i - 1], right = slots[i];
    if (!(left && left[0] === 'S') && !(right && right[0] === 'S')) continue;
    if (left && right && left[0] === 'T' && right[0] === 'S' && false) continue;
    const ax = i === 0 ? slots[0][1] : i === slots.length ? slots[i - 1][2] : (left[2] + right[1]) / 2;
    for (const sd of sides) {
      const a0 = sd < 0 ? YF + 100 : cy + spineT / 2, a1 = sd < 0 ? cy - spineT / 2 : YB - 100;
      a.box(ax - 18, a0, sh + 150, ax + 18, a1, sh + 185); a.box(ax - 12, sd < 0 ? a0 : a1 - 24, sh + 10, ax + 12, sd < 0 ? a0 + 24 : a1, sh + 150);
      a.rect(ax - 18, a0, ax + 18, a1, 'EQUIP-DETAIL');
    }
  }
}

// ---------------------------------------------------------------- seating
P({ cat: 'furniture/seating', title: 'Generic restaurant dining chair',
  desc: (v) => `Four-leg dining chair with ${v.back === 'pad' ? 'an upholstered back panel' : v.back === 'ladder' ? 'a four-rail ladder back' : 'a three-slat back'}${v.arms ? ', arms' : ''}${v.pad ? ', a padded seat' : ' and a plain seat'}, rails and stretchers.`,
  vs: [
    ['slat back', 17, 19, 34, 0, { back: 'slat' }],
    ['ladder back', 17, 19, 35, 0, { back: 'ladder' }],
    ['upholstered back and seat', 18, 20, 35, 0, { back: 'pad', pad: true }],
    ['slat back with arms', 21, 21, 34, 0, { back: 'slat', arms: true }],
    ['upholstered armchair', 22, 22, 35, 0, { back: 'pad', pad: true, arms: true }] ],
  build: (a, v) => { chair(a, v); a.log('Added the legs and stretchers, the seat rails, the seat, the back and any arms (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic backless stool',
  desc: (v) => `${v.swivel ? 'Swivel stool on a pedestal and disc base' : 'Four-leg stool with a foot ring'}, ${v.pad ? 'padded round seat' : 'flat round seat'}; seat height ${v.sh / IN} in.`,
  vs: [
    ['kiosk seat, 18 in', 15, 15, 19, 0, { sh: 18 * IN, ring: false }],
    ['counter height, 24 in', 16, 16, 25, 0, { sh: 24 * IN }],
    ['counter height padded, 26 in', 17, 17, 27, 0, { sh: 26 * IN, pad: true }],
    ['bar height, 30 in', 17, 17, 31, 0, { sh: 30 * IN }],
    ['bar height swivel, 30 in', 19, 19, 31, 0, { sh: 30 * IN, swivel: true, pad: true }] ],
  build: (a, v) => { stool(a, v); a.log('Added the seat, the legs or pedestal, the foot ring or disc base and the seat cushion (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic stool with back',
  desc: (v) => `Round-seat stool, seat height ${v.sh / IN} in, with a curved back rail${v.arms ? ' and arms' : ''}, ${v.swivel ? 'on a swivel pedestal' : 'on four legs with a foot ring'}.`,
  vs: [
    ['counter height, 24 in', 18, 19, 40, 0, { sh: 24 * IN, back: true, pad: true }],
    ['bar height, 30 in', 18, 19, 46, 0, { sh: 30 * IN, back: true, pad: true, backH: 260 }],
    ['counter height with arms, 26 in', 22, 21, 42, 0, { sh: 26 * IN, back: true, arms: true, pad: true, swivel: true }],
    ['bar height with arms, 30 in', 22, 21, 47, 0, { sh: 30 * IN, back: true, arms: true, pad: true, swivel: true, backH: 260 }] ],
  build: (a, v) => { stool(a, v); a.log('Added the seat, the legs or pedestal, the back and any arms (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic restaurant booth bench',
  desc: (v) => `Wall booth bench ${v.w} in long: base, ${cnt(v.channels, 'seat cushion', 'seat cushions')}, a ${v.h} in back with channel seams${v.tufted ? ' and button tufting' : ''} and end panels.`,
  vs: [
    ['48 in, low back', 48, 24, 36, 0, { channels: 2, sh: 440 }],
    ['60 in, low back', 60, 24, 36, 0, { channels: 2, sh: 440 }],
    ['72 in, high back', 72, 24, 48, 0, { channels: 3, sh: 440 }],
    ['84 in, high back, tufted', 84, 24, 48, 0, { channels: 3, tufted: true, sh: 440 }],
    ['96 in, high back, tufted', 96, 24, 54, 0, { channels: 4, tufted: true, sh: 440 }] ],
  build: (a, v) => { bench(a, v); a.log('Added the plinth, the seat base and cushions, the channelled back and the end panels (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic banquette',
  desc: (v) => `Straight banquette ${v.w} in long with a ${v.h} in back, ${cnt(v.channels, 'cushion bay', 'cushion bays')}, a plinth and end panels; seat height ${Math.round(v.sh / IN)} in.`,
  vs: [
    ['8 ft, standard', 96, 22, 38, 0, { channels: 4, sh: 450, backD: 90 }],
    ['10 ft, standard', 120, 22, 38, 0, { channels: 5, sh: 450, backD: 90 }],
    ['12 ft, high back', 144, 22, 46, 0, { channels: 6, sh: 450, backD: 100 }] ],
  build: (a, v) => { bench(a, v); a.line(a.X0, a.YF + 40, a.X1, a.YF + 40, 'EQUIP-DETAIL'); a.log('Added the plinth, the bay cushions, the back and the end panels (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic curved booth',
  desc: (v) => `Curved booth seat sweeping ${v.sweep} degrees: plinth, seat band and raised back band built from ${v.seg} segments, with a ${v.h} in back.`,
  vs: [
    ['quarter circle, 4 ft radius', 48, 48, 40, 0, { sweep: 90, seg: 9 }],
    ['half circle, 5 ft diameter', 60, 30, 42, 0, { sweep: 180, seg: 14 }],
    ['half circle, 6 ft diameter, high back', 72, 36, 48, 0, { sweep: 180, seg: 16 }] ],
  build: (a, v) => {
    const R = v.sweep === 180 ? a.W / 2 : a.W, cx = v.sweep === 180 ? a.cx : a.X0, cy = a.YF, sd = 540;
    a.outline('EQUIP-HIDDEN');
    ring(a, cx, cy, R - sd, R, a.Z0, a.Z0 + 90, 0, v.sweep, v.seg, null);
    ring(a, cx, cy, R - sd, R, a.Z0 + 90, a.Z0 + 400, 0, v.sweep, v.seg, 'EQUIP');
    ring(a, cx, cy, R - sd + 25, R - 120, a.Z0 + 400, a.Z0 + 470, 0, v.sweep, v.seg, 'EQUIP-DETAIL');
    ring(a, cx, cy, R - 120, R, a.Z0 + 400, a.Z1, 0, v.sweep, v.seg, 'EQUIP-DETAIL');
    a.arc(cx, cy, R - sd, 0, v.sweep, 'EQUIP-DETAIL');
    a.log('Added the segmented plinth, seat band, seat cushion and raised back (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic booth unit with table',
  desc: (v) => `Dining booth: two facing bench seats with ${v.h > 48 ? 'high' : 'low'} backs and a fixed table on a pedestal between them, seating ${v.seats}.`,
  vs: [
    ['seats 4, 48 in table', 48, 66, 42, 0, { seats: 4, tw: 30 }],
    ['seats 4, 60 in table', 60, 66, 42, 0, { seats: 4, tw: 30 }],
    ['seats 6, 72 in table', 72, 66, 48, 0, { seats: 6, tw: 30 }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, sd = 450, tz = Z0 + 740;
    a.outline();
    for (const s of [-1, 1]) {
      const y0 = s < 0 ? YF : YB - 300, y1 = s < 0 ? YF + 300 : YB;
      const seat0 = s < 0 ? YF + 40 : YB - 40 - sd * 0.0 - 320, seat1 = s < 0 ? YF + 320 : YB - 40;
      a.box(X0, y0, Z0, X1, y1, Z0 + 90);
      a.box(X0 + 20, seat0, Z0 + 90, X1 - 20, seat1, Z0 + 380);
      for (let i = 0; i < v.seats / 2; i++) { const x0 = X0 + 20 + ((X1 - X0 - 40) * i) / (v.seats / 2) + 3, x1 = X0 + 20 + ((X1 - X0 - 40) * (i + 1)) / (v.seats / 2) - 3; cushion(a, x0, seat0, x1, seat1, Z0 + 380, Z0 + 440); a.rect(x0, seat0, x1, seat1, 'EQUIP-DETAIL'); }
      const by0 = s < 0 ? YF : YB - 90, by1 = s < 0 ? YF + 90 : YB; a.box(X0 + 20, by0, Z0 + 440, X1 - 20, by1, Z1);
    }
    a.box(cx - 25, cy - 25, Z0 + 40, cx + 25, cy + 25, tz - 38); a.box(cx - 220, cy - 160, Z0, cx + 220, cy + 160, Z0 + 40);
    a.box(X0 + 120, cy - 330 + 0, tz - 38, X1 - 120, cy + 330, tz); a.rect(X0 + 120, cy - 330, X1 - 120, cy + 330);
    a.log('Added the two bench seats with backs and end panels and the fixed pedestal table (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic wooden high chair',
  desc: (v) => `Child high chair on splayed legs with a footrest, a back, side rails and a restraint bar${v.tray ? ' and a removable tray' : ''}.`,
  vs: [
    ['with tray', 20, 24, 40, 0, { tray: true }],
    ['without tray', 20, 24, 40, 0, { tray: false }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, sh = Z0 + 520, x0 = X0 + 40, x1 = X1 - 40;
    a.outline();
    for (const [x, y, bx, by] of [[x0, YF + 30, x0 + 20, YF + 70], [x1, YF + 30, x1 - 20, YF + 70], [x0, YB - 25, x0 + 20, YB - 90], [x1, YB - 25, x1 - 20, YB - 90]]) { a.tube([[x, y, Z0], [bx, by, sh - 30]], [11, 11], 8); a.circ(x, y, 11, 'EQUIP-HIDDEN'); }
    a.box(x0, YF + 70, sh - 60, x1, YB - 100, sh - 30); a.box(x0 + 10, YF + 60, Z0 + 180, x1 - 10, YF + 90, Z0 + 205);
    a.box(x0 + 10, YF + 85, sh - 30, x1 - 10, YB - 100, sh); a.rect(x0 + 10, YF + 85, x1 - 10, YB - 100, 'EQUIP-DETAIL');
    for (const x of [x0 + 8, x1 - 8]) { a.box(x - 8, YF + 85, sh, x + 8, YB - 95, sh + 220); a.box(x - 8, YB - 105, sh, x + 8, YB - 85, Z1); }
    a.box(x0, YB - 105, sh + 200, x1, YB - 80, Z1);
    for (let i = 0; i < 3; i++) a.box(x0 + 20, YB - 100, sh + 60 + i * 120, x1 - 20, YB - 90, sh + 80 + i * 120);
    a.tube([[cx, YF + 80, sh], [cx, YF + 80, sh + 180]], [10, 10], 6);
    if (v.tray) { a.box(x0 - 10, YF + 5, sh + 160, x1 + 10, YF + 300, sh + 185); a.box(x0 - 10, YF + 5, sh + 185, x1 + 10, YF + 20, sh + 215); a.rect(x0 - 10, YF + 5, x1 + 10, YF + 300, 'EQUIP-DETAIL'); }
    a.log('Added the splayed legs, footrest, seat, side rails, slatted back, restraint bar and the tray if listed (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic gate seating, beam mounted',
  desc: (v) => `Airport seating on a steel beam: ${cnt(v.seats, 'padded seat', 'padded seats')} with backs, ${v.seats + 1} armrests, two or three uprights with floor feet.`,
  vs: [
    ['3 seats', 68, 25, 36, 0, { pat: 'SSS', seats: 3 }],
    ['4 seats', 90, 25, 36, 0, { pat: 'SSSS', seats: 4 }],
    ['5 seats', 112, 25, 36, 0, { pat: 'SSSSS', seats: 5 }],
    ['6 seats', 134, 25, 36, 0, { pat: 'SSSSSS', seats: 6 }] ],
  build: (a, v) => { beamRow(a, { ...v }); a.log('Added the beam, the uprights with feet, the seat pads, backs and armrests (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic gate seating with tray tables',
  desc: (v) => `Beam-mounted airport seating with ${v.seats} seats and ${v.tables} fixed tray ${v.tables === 1 ? 'table' : 'tables'} between seat pairs${v.power ? ', each with a charging puck' : ''}.`,
  vs: [
    ['4 seats, 1 table', 100, 25, 36, 0, { pat: 'SSTSS', seats: 4, tables: 1 }],
    ['4 seats, 1 table, charging', 100, 25, 36, 0, { pat: 'SSTSS', seats: 4, tables: 1, power: true }],
    ['6 seats, 2 tables, charging', 148, 25, 36, 0, { pat: 'SSTSSTSS', seats: 6, tables: 2, power: true }] ],
  build: (a, v) => { beamRow(a, { ...v }); a.log('Added the beam, the seat pads and backs, the armrests, the tray tables and the charging pucks if listed (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic gate seating, back to back',
  desc: (v) => `Double-sided airport seating on a central spine: ${v.seats} seats, ${v.seats / 2} facing each side, with armrests${v.tables ? ' and tray tables' : ''} and floor feet.`,
  vs: [
    ['4 seats', 46, 36, 36, 0, { pat: 'SS', seats: 4, b2b: true }],
    ['8 seats', 90, 36, 36, 0, { pat: 'SSSS', seats: 8, b2b: true }],
    ['8 seats with tray tables', 100, 36, 36, 0, { pat: 'SSTSS', seats: 8, b2b: true, tables: true }] ],
  build: (a, v) => { beamRow(a, { ...v }); a.log('Added the central spine, seat pads and backs on both faces, armrests and the feet (plan and 3D).'); } });

/** Sofa, lounge chair, modular piece. o: n cushions · sh · arm (arm width mm, 0 none) · armH · backD · backH(top) · wing · corner · noBack · legs */
function sofa(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a;
  const sh = Z0 + (o.sh ?? 400), arm = o.arm ?? 140, n = o.n ?? 1, bd = o.backD ?? 170, leg = o.legs ?? 90, armH = o.armH ?? 230;
  a.outline();
  for (const [x, y] of [[X0 + 45, YF + 45], [X1 - 45, YF + 45], [X0 + 45, YB - 45], [X1 - 45, YB - 45]]) { a.cone(x, y, Z0, Z0 + leg, 14, 20, 8); a.circ(x, y, 18, 'EQUIP-HIDDEN'); }
  a.box(X0, YF, Z0 + leg, X1, YB, sh - 70);
  const sx0 = X0 + (o.corner ? bd : arm), sx1 = X1 - arm, sy1 = o.noBack ? YB : YB - bd;
  if (arm) for (const x0 of [X0, X1 - arm]) { a.box(x0, YF, sh - 70, x0 + arm, YB, sh + armH); a.ell(x0 + arm / 2, (YF + YB) / 2, sh + armH, arm / 2, (YB - YF) / 2, 18, 10, 3); a.rect(x0, YF, x0 + arm, YB, 'EQUIP-DETAIL'); }
  if (!o.noBack) { a.box(X0 + (arm && !o.corner ? arm : 0), YB - bd, sh - 70, X1 - (arm || 0), YB, Z1); a.rect(X0, YB - bd, X1, YB, 'EQUIP-DETAIL'); }
  if (o.corner) { a.box(X0, YF, sh - 70, X0 + bd, YB, Z1); a.rect(X0, YF, X0 + bd, YB, 'EQUIP-DETAIL'); }
  if (o.wing) for (const x0 of [X0, X1 - arm]) a.box(x0, YB - 260, sh + armH, x0 + arm, YB, Z1 - 60);
  const lx0 = o.corner ? X0 + bd : X0 + arm, lx1 = X1 - arm;
  for (let i = 0; i < n; i++) {
    const x0 = lx0 + ((lx1 - lx0) * i) / n + 3, x1 = lx0 + ((lx1 - lx0) * (i + 1)) / n - 3;
    cushion(a, x0, YF + 10, x1, sy1 - 4, sh - 70, sh + 85); a.rect(x0, YF + 10, x1, sy1 - 4, 'EQUIP-DETAIL');
    if (!o.noBack) { const bz0 = sh + 90, bz1 = Z1 - 40; a.ell((x0 + x1) / 2, YB - bd - 40, (bz0 + bz1) / 2, (x1 - x0) / 2 - 4, 55, (bz1 - bz0) / 2, 14, 7); }
  }
}

P({ cat: 'furniture/seating', title: 'Generic lounge chair',
  desc: (v) => `Upholstered lounge chair on short legs with a ${v.wing ? 'wing back and side wings' : 'tall back'}, a loose seat cushion and ${v.arm ? 'padded arms' : 'no arms'}.`,
  vs: [
    ['low back, 28 in', 28, 30, 31, 0, { arm: 120, n: 1, backD: 150, armH: 200, sh: 400 }],
    ['wing back, 32 in', 32, 33, 42, 0, { arm: 150, n: 1, wing: true, backD: 200, armH: 230, sh: 420 }],
    ['armless slipper, 26 in', 26, 30, 32, 0, { arm: 0, n: 1, backD: 160, sh: 380 }] ],
  build: (a, v) => { sofa(a, v); a.log('Added the legs and frame, the arms, the back, the seat and back cushions (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic lounge sofa',
  desc: (v) => `Upholstered sofa with ${cnt(v.n, 'seat cushion', 'seat cushions')}, matching back cushions, padded arms and short legs; ${v.w} in long.`,
  vs: [
    ['two seat, 60 in', 60, 34, 32, 0, { n: 2 }],
    ['three seat, 84 in', 84, 36, 33, 0, { n: 3 }],
    ['four seat, 108 in', 108, 36, 33, 0, { n: 4 }] ],
  build: (a, v) => { sofa(a, v); a.log('Added the legs and frame, the arms, the back, the seat and back cushions (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic modular lounge seat',
  desc: (v) => v.noBack ? `Backless upholstered ottoman module, ${v.w} by ${v.d} in, on short feet, with a seat cushion.` : v.corner ? `Corner module with a back along two sides, one seat cushion and short feet, ${v.w} by ${v.d} in.` : `Armless straight module with a back, ${cnt(v.n, 'seat cushion', 'seat cushions')} and short feet, ${v.w} in long.`,
  vs: [
    ['straight, 36 in', 36, 36, 32, 0, { arm: 0, n: 1, backD: 150 }],
    ['straight, 60 in', 60, 36, 32, 0, { arm: 0, n: 2, backD: 150 }],
    ['corner, 36 in', 36, 36, 32, 0, { arm: 0, n: 1, corner: true, backD: 150 }],
    ['ottoman, 30 in', 30, 30, 17, 0, { arm: 0, n: 1, noBack: true, sh: 380 }] ],
  build: (a, v) => { sofa(a, v); a.log('Added the feet and frame, the back or backs and the seat cushions (plan and 3D).'); } });

P({ cat: 'furniture/seating', title: 'Generic mall bench',
  desc: (v) => `Public bench ${v.w / 12} ft long with ${v.back ? 'a slatted back, ' : 'no back, '}slatted seat, steel end frames${v.mid ? ' with a centre support' : ''}${v.armN ? ` and ${v.armN} intermediate armrests` : ''}.`,
  vs: [
    ['4 ft, with back', 48, 24, 34, 0, { back: true }],
    ['6 ft, with back', 72, 24, 34, 0, { back: true, mid: true, armN: 1 }],
    ['8 ft, with back and armrests', 96, 24, 34, 0, { back: true, mid: true, armN: 2 }],
    ['6 ft, backless', 72, 18, 18, 0, { back: false, mid: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, sh = Z0 + 440, fr = v.back ? 12 : 30;
    a.outline();
    const posts = v.mid ? [X0 + 70, (X0 + X1) / 2, X1 - 70] : [X0 + 70, X1 - 70];
    for (const x of posts) {
      a.box(x - 15, YF + 30, Z0, x + 15, YF + 60, sh - 30); a.box(x - 15, YB - (v.back ? 70 : 60), Z0, x + 15, YB - (v.back ? 40 : 30), sh - 30);
      a.box(x - 15, YF + 30, sh - 50, x + 15, YB - 30, sh - 25);
      a.box(x - 40, YF + 20, Z0, x + 40, YF + 80, 18); a.box(x - 40, YB - 80, Z0, x + 40, YB - 20, 18);
      a.rect(x - 15, YF + 30, x + 15, YB - 30, 'EQUIP-HIDDEN');
    }
    const n = 5, span = (YB - 40 - (YF + 20 + fr)), sw = span / n;
    for (let i = 0; i < n; i++) { const y0 = YF + 20 + fr + i * sw + 3; a.box(X0 + 20, y0, sh - 25, X1 - 20, y0 + sw - 6, sh); a.line(X0 + 20, y0, X1 - 20, y0, 'EQUIP-DETAIL'); }
    if (v.back) {
      for (const x of [X0 + 70, X1 - 70]) a.box(x - 15, YB - 70, sh, x + 15, YB - 40, Z1);
      for (let i = 0; i < 3; i++) { const z = sh + 120 + i * 140; a.box(X0 + 55, YB - 66, z, X1 - 55, YB - 44, z + 100); }
      a.rect(X0 + 55, YB - 66, X1 - 55, YB - 44, 'EQUIP-DETAIL');
    }
    for (let k = 1; k <= (v.armN || 0); k++) { const x = X0 + (W * k) / ((v.armN || 0) + 1); a.box(x - 15, YF + 60, sh, x + 15, YB - 70, sh + 160); a.rect(x - 15, YF + 60, x + 15, YB - 70, 'EQUIP-DETAIL'); }
    a.rect(X0 + 20, YF + 20 + fr, X1 - 20, YB - 40, 'EQUIP');
    a.log('Added the end and centre frames with floor plates, the seat slats and the back slats or armrests (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic pouf',
  desc: (v) => `${v.round ? 'Round' : 'Square'} upholstered pouf, ${v.w} in ${v.round ? 'across' : 'by ' + v.d + ' in'}, ${v.h} in high, on a low base${v.tufted ? ' with button tufting' : ''}.`,
  vs: [
    ['round, 16 in', 16, 16, 16, 0, { round: true }],
    ['round, 20 in, tufted', 20, 20, 17, 0, { round: true, tufted: true }],
    ['round, 28 in', 28, 28, 17, 0, { round: true }],
    ['square, 18 in', 18, 18, 17, 0, { round: false }],
    ['square, 24 in, tufted', 24, 24, 17, 0, { round: false, tufted: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a;
    if (v.round) { const r = W / 2; a.outline(); a.cyl(cx, cy, Z0, Z0 + 40, r * 0.85, 24); a.cyl(cx, cy, Z0 + 40, Z1 - 40, r, 24); a.ell(cx, cy, Z1 - 40, r, r, 40, 24, 5); a.circ(cx, cy, r * 0.85, 'EQUIP-HIDDEN'); a.circ(cx, cy, r - 25, 'EQUIP-DETAIL'); }
    else { a.outline(); a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB - 20, Z0 + 40); a.box(X0, YF, Z0 + 40, X1, YB, Z1 - 40); a.ell(cx, cy, Z1 - 40, W / 2, D / 2, 40, 18, 5); a.rect(X0 + 25, YF + 25, X1 - 25, YB - 25, 'EQUIP-DETAIL'); }
    if (v.tufted) for (const [dx, dy] of [[0, 0], [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]]) { const x = cx + dx * W * 0.7, y = cy + dy * D * 0.7; a.cyl(x, y, Z1 - 2, Z1 + 4, 14, 8); a.circ(x, y, 8, 'EQUIP-DETAIL'); }
    a.log('Added the base, the padded body and the top cushion with any tufting buttons (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic fitting room bench',
  desc: (v) => `Wall-fixed fitting room bench ${v.w} in long: padded seat on a frame, ${v.shelf ? 'a lower shelf, ' : ''}a wall cleat and ${v.hooks} coat hooks on a rail above.`,
  vs: [
    ['24 in, with hooks', 24, 14, 60, 0, { hooks: 2, shelf: false }],
    ['36 in, with shelf and hooks', 36, 16, 60, 0, { hooks: 3, shelf: true }],
    ['48 in, with shelf and hooks', 48, 16, 60, 0, { hooks: 4, shelf: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, sh = Z0 + 450;
    a.outline();
    for (const x of [X0 + 40, X1 - 60]) { a.box(x, YF + 30, Z0 + 40, x + 20, YB - 20, sh - 50); a.box(x - 20, YF + 20, Z0, x + 40, YF + 50, Z0 + 40); a.rect(x, YF + 30, x + 20, YB - 20, 'EQUIP-HIDDEN'); }
    cushion(a, X0 + 10, YF + 10, X1 - 10, YB - 30, sh - 50, sh + 40); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 30, 'EQUIP-DETAIL');
    if (v.shelf) { a.box(X0 + 60, YF + 40, Z0 + 150, X1 - 60, YB - 25, Z0 + 175); a.rect(X0 + 60, YF + 40, X1 - 60, YB - 25, 'EQUIP-HIDDEN'); }
    a.box(X0, YB - 20, sh - 50, X1, YB, Z1);   // wall-fixed backing board
    a.box(X0, YB - 30, Z1 - 120, X1, YB - 20, Z1 - 80);
    for (let i = 0; i < v.hooks; i++) { const x = X0 + (W * (i + 0.5)) / v.hooks; a.tube([[x, YB - 30, Z1 - 100], [x, YB - 90, Z1 - 100], [x, YB - 120, Z1 - 60]], [8, 7, 7], 6); a.circ(x, YB - 90, 8, 'EQUIP-DETAIL'); }
    a.log('Added the wall cleat, the frame legs, the padded seat, the optional shelf and the hook rail (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic soft play seat',
  desc: (v) => `Foam-core soft seating for a children's area: ${v.kind === 'step' ? 'three stepped levels' : v.kind === 'bench' ? 'a rounded bench' : 'a rounded cube'}, upholstered all round with a plain base.`,
  vs: [
    ['cube, 14 in', 14, 14, 14, 0, { kind: 'cube' }],
    ['cube, 18 in', 18, 18, 18, 0, { kind: 'cube' }],
    ['three-step block, 36 in', 36, 24, 24, 0, { kind: 'step' }],
    ['rounded bench, 48 in', 48, 16, 14, 0, { kind: 'bench' }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a;
    a.outline();
    if (v.kind === 'step') { for (let i = 0; i < 3; i++) { const x0 = X0 + (W * i) / 3, x1 = X0 + (W * (i + 1)) / 3, hh = Z0 + (H * (i + 1)) / 3; a.box(x0 + 10, YF + 10, Z0, x1 - 10, YB - 10, hh - 25); a.ell((x0 + x1) / 2, cy, hh - 25, (x1 - x0) / 2 - 6, D / 2 - 6, 25, 12, 4); a.rect(x0 + 6, YF + 6, x1 - 6, YB - 6, 'EQUIP-DETAIL'); } }
    else { a.box(X0 + 12, YF + 12, Z0, X1 - 12, YB - 12, Z1 - 30); a.ell(cx, cy, Z1 - 30, W / 2 - 8, D / 2 - 8, 30, 14, 5); a.rect(X0 + 8, YF + 8, X1 - 8, YB - 8, 'EQUIP-DETAIL'); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); }
    a.log('Added the stepped or rounded foam blocks with their upholstered tops (plan and 3D).');
  } });

P({ cat: 'furniture/seating', title: 'Generic folding chair',
  desc: (v) => `Folding chair with a tubular frame, ${v.pad ? 'padded seat and back' : 'molded seat and back panels'} and a cross brace under the seat.`,
  vs: [
    ['steel, molded panels', 18, 20, 33, 0, { pad: false }],
    ['steel, padded seat and back', 19, 21, 34, 0, { pad: true, padBack: true }] ],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a, sh = Z0 + 445, lx = [X0 + 30, X1 - 30];
    a.outline();
    for (const x of lx) {
      a.tube([[x, YF + 40, Z0], [x, YF + 70, sh - 30]], [9, 9], 6); a.circ(x, YF + 40, 10, 'EQUIP-HIDDEN');
      a.tube([[x, YB - 70, Z0], [x, YB - 80, sh], [x, YB - 50, Z1 - 20]], [9, 9, 9], 6); a.circ(x, YB - 70, 10, 'EQUIP-HIDDEN');
      a.tube([[x, YF + 70, sh - 30], [x, YB - 60, sh - 30]], [8, 8], 6);
    }
    a.xcyl(lx[0], lx[1], YF + 120, Z0 + 200, 7, 6);
    a.box(X0 + 16, YF + 20, sh - 30, X1 - 16, YB - 60, sh - 30 + (v.pad ? 18 : 10));
    if (v.pad) cushion(a, X0 + 24, YF + 26, X1 - 24, YB - 66, sh - 12, sh + 40);
    a.box(X0 + 30, YB - 70, sh + 150, X1 - 30, YB - 50, Z1 - 35); if (v.padBack) a.ell(cx, YB - 78, (sh + 150 + Z1 - 35) / 2, (X1 - X0) / 2 - 36, 14, (Z1 - 35 - sh - 150) / 2, 14, 5);
    a.rect(X0 + 16, YF + 20, X1 - 16, YB - 60, 'EQUIP-DETAIL'); a.rect(X0 + 30, YB - 74, X1 - 30, YB - 50, 'EQUIP-DETAIL');
    a.log('Added the tubular side frames, the cross brace, the seat and the back panel (plan and 3D).');
  } });

// ---------------------------------------------------------------- tables
/** Add a stretcher ring or a foot rail to a table body. */
function footRail(a, z, r = 22) { const { X0, X1, YF, YB } = a; a.xcyl(X0 + 80, X1 - 80, YF + 80, z, r / 2, 8); a.line(X0 + 80, YF + 80, X1 - 80, YF + 80, 'EQUIP-HIDDEN'); }

P({ cat: 'furniture/tables', title: 'Generic restaurant dining table',
  desc: (v) => `${v.w === v.d ? 'Square' : 'Rectangular'} dining table, ${v.w} by ${v.d} in: a ${v.h > 29 ? 'hardwood' : 'laminate'} top with edge, an apron frame and four legs${v.rail ? ' joined by an end stretcher' : ''}.`,
  vs: [
    ['24 by 24 in', 24, 24, 30, 0, {}],
    ['30 by 30 in', 30, 30, 30, 0, {}],
    ['30 by 48 in', 48, 30, 30, 0, {}],
    ['30 by 60 in', 60, 30, 30, 0, { rail: true }] ],
  build: (a, v) => {
    tbl(a, { topT: 36, base: 'legs', apron: 70, legR: v.w > 50 ? 28 : 22 });
    if (v.rail) { a.xcyl(a.X0 + 60, a.X1 - 60, a.cy, a.Z0 + 200, 10, 8); a.line(a.X0 + 60, a.cy, a.X1 - 60, a.cy, 'EQUIP-HIDDEN'); a.ycyl(a.YF + 60, a.YB - 60, a.X0 + 60, a.Z0 + 200, 10, 8); a.ycyl(a.YF + 60, a.YB - 60, a.X1 - 60, a.Z0 + 200, 10, 8); }
    a.log('Added the top, the apron frame, the four legs and any stretchers (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic round pedestal table',
  desc: (v) => `Round table ${v.w} in across with a ${v.h} in height top, a column and a round floor foot.`,
  vs: [
    ['24 in', 24, 24, 29, 0, {}], ['30 in', 30, 30, 30, 0, {}], ['36 in', 36, 36, 30, 0, {}], ['48 in', 48, 48, 30, 0, {}] ],
  build: (a, v) => { tbl(a, { round: true, base: 'pedestal', topT: 34 }); a.log('Added the round top, the column and the foot (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic cafe table, cross base',
  desc: (v) => `Round ${v.w} in cafe table: a disc top, a central column and a two-bar cross foot with levelling pads.`,
  vs: [['24 in', 24, 24, 29, 0, {}], ['28 in', 28, 28, 30, 0, {}], ['32 in', 32, 32, 30, 0, {}]],
  build: (a, v) => {
    const { cx, cy, Z0, Z1, W } = a, r = W / 2, fl = W * 0.36;
    a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, r);
    a.ell(cx, cy, Z1 - 17, r, r, 17, 28, 4); a.circ(cx, cy, r - 20, 'EQUIP-DETAIL');
    a.cone(cx, cy, Z0 + 60, Z1 - 34, 24, 18, 12); a.cyl(cx, cy, Z0 + 50, Z0 + 90, 40, 12);
    for (const [dx, dy] of [[1, 0], [0, 1]]) { a.box(cx - (dx ? fl : 22), cy - (dy ? fl : 22), Z0 + 25, cx + (dx ? fl : 22), cy + (dy ? fl : 22), Z0 + 60); for (const s of [-1, 1]) a.cyl(cx + s * dx * fl, cy + s * dy * fl, Z0, Z0 + 25, 22, 8); }
    a.line(cx - fl, cy, cx + fl, cy, 'EQUIP-HIDDEN'); a.line(cx, cy - fl, cx, cy + fl, 'EQUIP-HIDDEN');
    a.log('Added the disc top, the column and the two-bar cross foot with pads (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic high-top table',
  desc: (v) => `${v.round ? 'Round' : 'Rectangular'} bar-height table, ${v.w}${v.round ? ' in across' : ' by ' + v.d + ' in'}, 42 in to the top, ${v.round ? 'on a column and foot' : 'on four legs with a foot rail'}.`,
  vs: [
    ['round, 30 in', 30, 30, 42, 0, { round: true }],
    ['round, 36 in', 36, 36, 42, 0, { round: true }],
    ['square, 30 in', 30, 30, 42, 0, { round: false }],
    ['rectangular, 30 by 60 in', 60, 30, 42, 0, { round: false }] ],
  build: (a, v) => {
    if (v.round) tbl(a, { round: true, base: 'pedestal', topT: 36 });
    else { tbl(a, { topT: 36, base: 'legs', apron: 60, legR: 22 }); footRail(a, a.Z0 + 200, 28); a.xcyl(a.X0 + 80, a.X1 - 80, a.YB - 80, a.Z0 + 200, 14, 8); }
    a.log('Added the top, the legs or column and the foot rail or foot (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic communal table',
  desc: (v) => `Long plank-top communal table, ${v.w / 12} ft long, on ${v.tr} trestle bases with a stretcher beam between them.`,
  vs: [['8 ft', 96, 36, 30, 0, { tr: 2 }], ['10 ft', 120, 36, 30, 0, { tr: 2 }], ['12 ft', 144, 40, 30, 0, { tr: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a, zt = Z1, tt = 50;
    a.outline(); a.box(X0, YF, zt - tt, X1, YB, zt);
    const np = Math.round(D / 150); for (let i = 1; i < np; i++) a.line(X0, YF + (D * i) / np, X1, YF + (D * i) / np, 'EQUIP-DETAIL');
    a.box(X0, YF + 40, zt - tt - 70, X0 + 60, YB - 40, zt - tt); a.box(X1 - 60, YF + 40, zt - tt - 70, X1, YB - 40, zt - tt);
    const xs = Array.from({ length: v.tr }, (_, i) => X0 + 180 + ((W - 360) * i) / (v.tr - 1));
    for (const x of xs) { a.box(x - 30, YF + D * 0.25, Z0 + 40, x + 30, YB - D * 0.25, zt - tt - 70); a.box(x - 40, YF + 60, Z0, x + 40, YF + 100, Z0 + 60); a.box(x - 40, YB - 100, Z0, x + 40, YB - 60, Z0 + 60); a.box(x - 40, YF + 60, Z0, x + 40, YB - 60, Z0 + 28); a.rect(x - 40, YF + 60, x + 40, YB - 60, 'EQUIP-HIDDEN'); }
    a.box(xs[0], a.cy - 25, Z0 + 260, xs[xs.length - 1], a.cy + 25, Z0 + 330);
    a.log('Added the plank top with end caps, the trestle bases with feet and the stretcher beam (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic picnic table with benches',
  desc: (v) => `Outdoor table with two attached benches on A-frame legs, ${v.w / 12} ft long; plank top and plank seats.`,
  vs: [['6 ft', 72, 60, 30, 0, {}], ['8 ft', 96, 60, 30, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, tt = 45;
    a.outline(); a.box(X0 + 20, cy - 380, Z1 - tt, X1 - 20, cy + 380, Z1);
    for (const s of [-1, 1]) { const y0 = s < 0 ? YF + 20 : YB - 20 - 300, y1 = y0 + 300; a.box(X0, y0, Z0 + 410, X1, y1, Z0 + 460); a.rect(X0, y0, X1, y1, 'EQUIP-DETAIL'); }
    a.rect(X0 + 20, cy - 380, X1 - 20, cy + 380);
    for (const x of [X0 + 170, X1 - 170]) {
      for (const s of [-1, 1]) a.tube([[x, cy + s * 360, Z1 - tt], [x, cy + s * (D / 2 - 60), Z0 + 20]], [28, 28], 4);
      a.box(x - 25, YF + 40, Z0 + 400, x + 25, YB - 40, Z0 + 410); a.box(x - 25, cy - 360, Z1 - tt - 50, x + 25, cy + 360, Z1 - tt);
      a.rect(x - 25, YF + 40, x + 25, YB - 40, 'EQUIP-HIDDEN');
    }
    a.log('Added the plank top, the two plank benches and the A-frame legs with ties (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic patio table with umbrella hole',
  desc: (v) => `Outdoor ${v.w} in round slatted-top table with a centre umbrella hole and collar, on a four-leg base.`,
  vs: [['round, 30 in', 30, 30, 29, 0, {}], ['round, 36 in', 36, 36, 29, 0, {}], ['round, 48 in', 48, 48, 29, 0, {}]],
  build: (a, v) => {
    const { cx, cy, Z0, Z1, W } = a, r = W / 2, tt = 28;
    a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, r);
    a.ell(cx, cy, Z1 - tt / 2, r, r, tt / 2, 28, 3);
    for (const k of [-0.6, -0.2, 0.2, 0.6]) { const h = Math.sqrt(1 - k * k) * r; a.line(cx - h, cy + k * r, cx + h, cy + k * r, 'EQUIP-DETAIL'); }
    a.tube([[cx, cy, Z1 - tt - 120], [cx, cy, Z1 + 0.5]], [34, 34], 10); a.circ(cx, cy, 34); a.circ(cx, cy, 24, 'EQUIP-DETAIL');
    for (const g of [0.78, 2.36, 3.93, 5.5]) { const x = cx + Math.cos(g) * r * 0.62, y = cy + Math.sin(g) * r * 0.62; a.tube([[cx + (x - cx) * 0.5, cy + (y - cy) * 0.5, Z1 - tt - 60], [x, y, Z0]], [14, 12], 6); a.circ(x, y, 12, 'EQUIP-HIDDEN'); }
    a.tube([[cx - r * 0.62, cy, Z1 - tt - 60], [cx + r * 0.62, cy, Z1 - tt - 60]], [11, 11], 6); a.tube([[cx, cy - r * 0.62, Z1 - tt - 60], [cx, cy + r * 0.62, Z1 - tt - 60]], [11, 11], 6);
    a.log('Added the slatted top with its umbrella hole and collar, the leg base and the under frame (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic food court table with fixed stools',
  desc: (v) => `Food court table with ${v.seats} fixed stools on swing arms, ${v.seats / 2} on each long side, a laminate top and one or two floor-fixed columns.`,
  vs: [['seats 4', 48, 60, 30, 0, { seats: 4 }], ['seats 6', 72, 60, 30, 0, { seats: 6 }], ['seats 8', 96, 60, 30, 0, { seats: 8 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, zt = Z1, per = v.seats / 2, tw = 330;
    a.outline('EQUIP-HIDDEN'); a.box(X0 + 20, cy - tw, zt - 38, X1 - 20, cy + tw, zt); a.rect(X0 + 20, cy - tw, X1 - 20, cy + tw);
    const cols = per > 2 ? 2 : 1;
    for (let c = 0; c < cols; c++) { const x = cols === 1 ? cx : X0 + W * (0.25 + 0.5 * c); a.box(x - 35, cy - 35, Z0 + 20, x + 35, cy + 35, zt - 38); a.cyl(x, cy, Z0, Z0 + 20, 170, 14); a.circ(x, cy, 170, 'EQUIP-HIDDEN'); }
    a.box(X0 + 120, cy - 20, Z0 + 380, X1 - 120, cy + 20, Z0 + 410);
    for (let i = 0; i < per; i++) for (const s of [-1, 1]) {
      const x = X0 + (W * (i + 0.5)) / per, y = cy + s * (tw + 80);
      a.box(x - 20, Math.min(cy, y), Z0 + 380, x + 20, Math.max(cy, y), Z0 + 410); a.cyl(x, y, Z0 + 410, Z0 + 460, 170, 18); a.circ(x, y, 170);
      a.cyl(x, y, Z0 + 30, Z0 + 410, 14, 8);
    }
    a.log('Added the top, the floor columns, the swing arms and the fixed round stools (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic booth table',
  desc: (v) => `Fixed ${v.w} by ${v.d} in booth table: a laminate top with edge band on a single floor-mounted column and base plate.`,
  vs: [['24 by 36 in', 36, 24, 29, 0, {}], ['30 by 42 in', 42, 30, 29, 0, {}], ['30 by 48 in', 48, 30, 29, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, tt = 36;
    a.outline(); a.box(X0, YF, Z1 - tt, X1, YB, Z1); a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
    a.box(X0, YF, Z1 - tt - 12, X1, YF + 14, Z1 - tt); a.box(X0, YB - 14, Z1 - tt - 12, X1, YB, Z1 - tt);
    a.box(cx - 28, cy - 28, Z0 + 20, cx + 28, cy + 28, Z1 - tt - 12); a.cyl(cx, cy, Z0, Z0 + 20, 120, 14); a.circ(cx, cy, 120, 'EQUIP-HIDDEN'); a.box(cx - 120, cy - 40, Z1 - tt - 22, cx + 120, cy + 40, Z1 - tt - 12);
    a.log('Added the edge-banded top, the column and the floor base plate (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic retail display table',
  desc: (v) => `${v.w === v.d ? 'Square' : 'Rectangular'} merchandise display table, ${v.w} by ${v.d} in, ${v.h} in high, on four legs${v.shelf ? ' with a lower shelf' : ''}.`,
  vs: [['square, 24 in', 24, 24, 30, 0, {}], ['square, 30 in, lower shelf', 30, 30, 32, 0, { shelf: 190 }], ['rectangular, 24 by 48 in, lower shelf', 48, 24, 32, 0, { shelf: 190 }], ['long, 36 by 72 in, lower shelf', 72, 36, 34, 0, { shelf: 230 }]],
  build: (a, v) => { tbl(a, { topT: 30, base: 'legs', apron: 50, legR: 16, shelf: v.shelf }); a.log('Added the top, apron, four legs and the lower shelf if listed (plan and 3D).'); } });

P({ cat: 'furniture/tables', title: 'Generic nesting display tables',
  desc: (v) => `Set of ${v.n} square-top display tables, stepped in height from ${v.h} in down, side by side on four legs each.`,
  vs: [['set of 2', 48, 24, 30, 0, { n: 2 }], ['set of 3', 72, 24, 30, 0, { n: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline('EQUIP-HIDDEN');
    for (let i = 0; i < v.n; i++) {
      const x0 = X0 + (W * i) / v.n + 6, x1 = X0 + (W * (i + 1)) / v.n - 6, zt = Z1 - i * 130;
      a.box(x0, YF + 6, zt - 28, x1, YB - 6, zt); a.rect(x0, YF + 6, x1, YB - 6);
      for (const [x, y] of [[x0 + 30, YF + 36], [x1 - 30, YF + 36], [x0 + 30, YB - 36], [x1 - 30, YB - 36]]) { a.leg(x, y, Z0, zt - 28, 14); a.circ(x, y, 14, 'EQUIP-HIDDEN'); }
      a.box(x0 + 20, YF + 26, zt - 80, x1 - 20, YB - 26, zt - 28);
    }
    a.log('Added each stepped top with its apron and four legs (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic folding utility table',
  desc: (v) => v.round ? 'Round folding table, 60 in across, a molded top on two folding leg frames with a cross bar.' : `Folding table, ${v.w} by ${v.d} in: a molded top, two folding leg frames and a cross brace.`,
  vs: [['6 ft by 30 in', 72, 30, 29, 0, {}], ['8 ft by 30 in', 96, 30, 29, 0, {}], ['seminar, 6 ft by 18 in', 72, 18, 29, 0, {}], ['round, 60 in', 60, 60, 29, 0, { round: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, tt = 30;
    if (v.round) a.ell(cx, cy, Z1 - tt / 2, W / 2, W / 2, tt / 2, 28, 3), a.circ(cx, cy, W / 2), a.circ(cx, cy, W / 2 - 25, 'EQUIP-DETAIL');
    else { a.outline(); a.box(X0, YF, Z1 - tt, X1, YB, Z1); a.rect(X0 + 15, YF + 15, X1 - 15, YB - 15, 'EQUIP-DETAIL'); }
    const lxs = v.round ? [cx - W * 0.3, cx + W * 0.3] : [X0 + W * 0.14, X1 - W * 0.14];
    const half = v.round ? W * 0.3 : D / 2 - 50;
    for (const x of lxs) { for (const s of [-1, 1]) a.tube([[x, cy + s * half, Z0 + 20], [x, cy + s * half * 0.6, Z1 - tt - 10]], [14, 14], 6); a.xcyl(x - 12, x + 12, cy - half, Z0 + 20, 12, 6); a.tube([[x, cy - half, Z0 + 20], [x, cy + half, Z0 + 20]], [11, 11], 6); a.rect(x - 12, cy - half, x + 12, cy + half, 'EQUIP-HIDDEN'); }
    a.xcyl(lxs[0], lxs[1], cy, Z0 + 250, 10, 6);
    a.log('Added the molded top, the two folding leg frames and the cross brace (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic lounge coffee table',
  desc: (v) => v.power ? 'Round side table, 18 in across, on a pedestal and disc foot with a power and charging puck set into the top.' : `Low ${v.round ? 'round' : 'rectangular'} lounge table, ${v.w}${v.round ? ' in across' : ' by ' + v.d + ' in'}, ${v.h} in high, with a top and four legs.`,
  vs: [['round, 24 in', 24, 24, 16, 0, { round: true }], ['round, 30 in', 30, 30, 16, 0, { round: true }], ['rectangular, 24 by 48 in', 48, 24, 16, 0, {}], ['side table with charging puck, 18 in', 18, 18, 22, 0, { round: true, power: true }]],
  build: (a, v) => {
    const { cx, cy, Z0, Z1, W } = a;
    if (v.power) {
      a.outline('EQUIP-HIDDEN'); a.ell(cx, cy, Z1 - 15, W / 2, W / 2, 15, 22, 3); a.circ(cx, cy, W / 2); a.cone(cx, cy, Z0 + 20, Z1 - 30, 32, 24, 12); a.cyl(cx, cy, Z0, Z0 + 20, W * 0.32, 16);
      a.cyl(cx, cy + W * 0.14, Z1 - 1, Z1 + 6, 36, 14); a.circ(cx, cy + W * 0.14, 36, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.32, 'EQUIP-HIDDEN');
    } else tbl(a, v.round ? { round: true, base: 'legs', topT: 30 } : { topT: 30, base: 'legs', apron: 50, legR: 20 });
    a.log('Added the top, the legs or pedestal and the charging puck if listed (plan and 3D).');
  } });

P({ cat: 'furniture/tables', title: 'Generic children table',
  desc: (v) => `Child-height activity table, ${v.round ? v.w + ' in round' : v.w + ' by ' + v.d + ' in'}, ${v.h} in high, with a rounded-edge top and four legs.`,
  vs: [['square, 24 in', 24, 24, 20, 0, {}], ['round, 36 in', 36, 36, 20, 0, { round: true }], ['rectangular, 24 by 48 in', 48, 24, 22, 0, {}]],
  build: (a, v) => { tbl(a, v.round ? { round: true, base: 'legs', topT: 36, legR: 22 } : { topT: 36, base: 'legs', apron: 40, legR: 22 }); a.log('Added the top and the four legs (plan and 3D).'); } });

// ---------------------------------------------------------------- desks
P({ cat: 'furniture/desks', title: 'Generic staff office desk',
  desc: (v) => `Office desk, ${v.w} by ${v.d} in, with a laminate top, a side pedestal of ${v.dr} drawers, a leg panel on the open side and a modesty panel.`,
  vs: [['48 by 24 in', 48, 24, 29, 0, { dr: 2 }], ['60 by 30 in', 60, 30, 29, 0, { dr: 3 }], ['72 by 30 in', 72, 30, 29, 0, { dr: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, zt = Z1, tt = 30, pw = Math.min(430, a.W * 0.4);
    a.outline(); a.box(X0, YF, zt - tt, X1, YB, zt); a.rect(X0 + 8, YF + 8, X1 - 8, YB - 8, 'EQUIP-DETAIL');
    a.box(X1 - 30 - pw, YF + 40, Z0 + 40, X1 - 30, YB - 20, zt - tt); a.box(X1 - 30 - pw, YF + 40, Z0, X1 - 30, YB - 20, Z0 + 40);
    const rh = (zt - tt - Z0 - 80) / v.dr;
    for (let i = 0; i < v.dr; i++) { const z1 = zt - tt - 20 - i * rh; a.box(X1 - 22 - pw, YF + 20, z1 - rh + 10, X1 - 38, YF + 40, z1); pull(a, 'bar', X1 - 30 - pw / 2, z1 - rh / 2, YF + 20); }
    a.box(X0 + 30, YF + 60, Z0, X0 + 30 + 20, YB - 20, zt - tt); a.rect(X0 + 30, YF + 60, X0 + 50, YB - 20, 'EQUIP-HIDDEN');
    a.box(X0 + 50, YB - 40, Z0 + 180, X1 - 30 - pw, YB - 20, zt - tt - 20);
    a.rect(X1 - 30 - pw, YF + 40, X1 - 30, YB - 20, 'EQUIP-HIDDEN');
    a.log('Added the top, the drawer pedestal with fronts and pulls, the leg panel and the modesty panel (plan and 3D).');
  } });

P({ cat: 'furniture/desks', title: 'Generic lounge worktop with power',
  desc: (v) => `Standing-height lounge worktop, ${v.w / 12} ft long, ${v.d} in deep, on end panels with a ${v.sockets}-position power strip on the front edge and a lower foot rail.`,
  vs: [['6 ft', 72, 16, 42, 0, { sockets: 3 }], ['8 ft', 96, 18, 42, 0, { sockets: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tt = 40;
    a.outline(); a.box(X0, YF, Z1 - tt, X1, YB, Z1); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
    for (const x of [X0 + 60, X1 - 60 - 30]) { a.box(x, YF + 30, Z0, x + 30, YB - 30, Z1 - tt); a.rect(x, YF + 30, x + 30, YB - 30, 'EQUIP-HIDDEN'); }
    a.box(X0 + 90, YB - 30, Z0 + 150, X1 - 90, YB - 10, Z1 - tt - 60);
    a.xcyl(X0 + 90, X1 - 90, YF + 50, Z0 + 220, 18, 10); a.line(X0 + 90, YF + 50, X1 - 90, YF + 50, 'EQUIP-HIDDEN');
    a.box(X0 + 200, YF, Z1 - tt - 70, X1 - 200, YF + 22, Z1 - tt);
    for (let i = 0; i < v.sockets; i++) { const x = X0 + 200 + ((W - 400) * (i + 0.5)) / v.sockets; a.cyl(x, YF + 11, Z1 - tt - 50, Z1 - tt - 49, 12, 8); a.circ(x, YF + 11, 12, 'EQUIP-DETAIL'); }
    a.log('Added the top, the end panels, the back panel, the foot rail and the power strip (plan and 3D).');
  } });

// ---------------------------------------------------------------- storage
P({ cat: 'furniture/storage', title: 'Generic staff locker bank',
  desc: (v) => `Steel locker bank: ${v.cols} columns of ${v.tiers} ${v.tiers === 1 ? 'tier' : 'tiers'} (${v.cols * v.tiers} doors), vented doors with number plates and handles, on a base and with a sloped top.`,
  vs: [['3 columns, single tier', 36, 18, 72, 0, { cols: 3, tiers: 1 }], ['4 columns, 2 tiers', 48, 18, 72, 0, { cols: 4, tiers: 2 }], ['3 columns, 3 tiers', 36, 15, 72, 0, { cols: 3, tiers: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, base = Z0 + 100, top = Z1 - 60;
    a.outline(); a.box(X0, YF + 40, Z0, X1, YB, base); a.line(X0, YF + 40, X1, YF + 40, 'EQUIP-HIDDEN');
    a.box(X0, YF + 6, base, X1, YB, top);
    a.prism([[X0, YF + 6], [X1, YF + 6], [X1, YB], [X0, YB]], top, top + 30); a.prism([[X0, YF + 40], [X1, YF + 40], [X1, YB], [X0, YB]], top + 30, Z1);
    const cw = W / v.cols, th = (top - base) / v.tiers;
    for (let c = 0; c < v.cols; c++) for (let t = 0; t < v.tiers; t++) {
      const x0 = X0 + c * cw + 3, x1 = X0 + (c + 1) * cw - 3, z0 = base + t * th + 3, z1 = base + (t + 1) * th - 3;
      a.box(x0, YF, z0, x1, YF + 6, z1);
      for (let k = 0; k < 4; k++) a.box(x0 + 30, YF - 4, z1 - 120 + k * 22, x1 - 30, YF, z1 - 112 + k * 22);
      a.box(x0 + 30, YF - 6, z0 + (z1 - z0) * 0.55, x1 - 30, YF, z0 + (z1 - z0) * 0.55 + 6);
      a.box(x1 - 70, YF - 8, z0 + (z1 - z0) * 0.5, x1 - 40, YF, z0 + (z1 - z0) * 0.5 + 60);
      a.box(x0 + 20, YF - 3, z0 + 20, x0 + 70, YF, z0 + 40);
    }
    for (let c = 1; c < v.cols; c++) a.line(X0 + c * cw, YF, X0 + c * cw, YB, 'EQUIP-DETAIL');
    for (let c = 0; c < v.cols; c++) a.line(X0 + c * cw + 6, YF - 4, X0 + (c + 1) * cw - 6, YF - 4, 'EQUIP-DETAIL');
    a.log('Added the base, the carcass, the sloped top and each door with vents, number plate and handle (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic dining service sideboard',
  desc: (v) => `Restaurant service sideboard, ${v.w} by ${v.d} in: ${v.dr} drawers over ${v.doors} doors with bar pulls, a toe kick and a top with a back upstand.`,
  vs: [['48 in, 2 doors', 48, 20, 36, 0, { doors: 2, dr: 2 }], ['60 in, 3 doors', 60, 20, 36, 0, { doors: 3, dr: 3 }], ['72 in, 4 doors', 72, 20, 36, 0, { doors: 4, dr: 4 }]],
  build: (a, v) => { cab(a, { toe: 90, drawers: 1, drawerH: 160, drawerCols: v.dr, doors: v.doors, pull: 'bar', topT: 32, splash: { h: 70, t: 20 }, swing: true }); a.log('Added the drawer row over the doors, the toe kick and the top with its upstand (plan and 3D).'); } });

P({ cat: 'furniture/storage', title: 'Generic stockroom shelving unit',
  desc: (v) => `Open steel shelving, ${v.w} by ${v.d} in, ${v.h} in high: four corner posts, ${v.sh} adjustable shelves and diagonal back bracing.`,
  vs: [['36 by 18 in, 72 in high', 36, 18, 72, 0, { sh: 5 }], ['48 by 24 in, 84 in high', 48, 24, 84, 0, { sh: 6 }], ['60 by 24 in, 84 in high', 60, 24, 84, 0, { sh: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; a.outline();
    for (const [x, y] of [[X0 + 20, YF + 20], [X1 - 20, YF + 20], [X0 + 20, YB - 20], [X1 - 20, YB - 20]]) { a.box(x - 20, y - 20, Z0, x + 20, y + 20, Z1); a.rect(x - 20, y - 20, x + 20, y + 20, 'EQUIP-DETAIL'); }
    for (let i = 0; i < v.sh; i++) { const z = Z0 + 120 + ((Z1 - Z0 - 160) * i) / (v.sh - 1); a.box(X0 + 20, YF + 20, z, X1 - 20, YB - 20, z + 25); a.box(X0 + 20, YF + 12, z, X1 - 20, YF + 20, z + 55); }
    a.tube([[X0 + 40, YB - 24, Z0 + 150], [X1 - 40, YB - 24, Z1 - 150]], [7, 7], 6); a.tube([[X1 - 40, YB - 24, Z0 + 150], [X0 + 40, YB - 24, Z1 - 150]], [7, 7], 6);
    a.rect(X0 + 40, YF + 12, X1 - 40, YB - 40, 'EQUIP-DETAIL');
    a.log('Added the corner posts, the shelves with front lips and the back bracing (plan and 3D).');
  } });

P({ cat: 'furniture/storage', title: 'Generic standing coat rack',
  desc: (v) => `Free-standing coat rack: a weighted round base, a central pole and ${v.hooks} hooks on two tiers, ${v.h} in high.`,
  vs: [['8 hooks', 24, 24, 72, 0, { hooks: 8 }]],
  build: (a, v) => {
    const { cx, cy, Z0, Z1, W } = a, r = W / 2; a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, r);
    a.cyl(cx, cy, Z0, Z0 + 30, r * 0.8, 20); a.cyl(cx, cy, Z0 + 30, Z1 - 20, 16, 10); a.ell(cx, cy, Z1 - 20, 28, 28, 20, 10, 4);
    for (let i = 0; i < v.hooks; i++) { const g = (i / v.hooks) * Math.PI * 2, z = Z1 - (i % 2 ? 220 : 90); const x = cx + Math.cos(g) * r * 0.82, y = cy + Math.sin(g) * r * 0.82; a.tube([[cx, cy, z], [x, y, z + 25]], [9, 8], 6); a.line(cx, cy, x, y, 'EQUIP-DETAIL'); a.cyl(x, y, z + 25, z + 60, 8, 6); }
    a.log('Added the base, the pole, the finial and the two tiers of hooks (plan and 3D).');
  } });

// ---------------------------------------------------------------- beds
P({ cat: 'furniture/beds', title: 'Generic hotel bed',
  desc: (v) => `${v.name} bed frame ${v.w} by ${v.d} in: a mattress on a rail frame with short legs, an upholstered headboard and ${v.pillows} pillows.`,
  vs: [['twin', 39, 75, 40, 0, { name: 'Twin', pillows: 1 }], ['full', 54, 75, 40, 0, { name: 'Full', pillows: 2 }], ['queen', 60, 80, 42, 0, { name: 'Queen', pillows: 2 }], ['king', 76, 80, 44, 0, { name: 'King', pillows: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, mz = Z0 + 560;
    a.outline();
    for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) { a.cone(x, y, Z0, Z0 + 150, 25, 35, 8); a.circ(x, y, 30, 'EQUIP-HIDDEN'); }
    a.box(X0 + 20, YF + 20, Z0 + 150, X1 - 20, YB - 100, mz - 220); a.box(X0 + 20, YB - 100, Z0 + 150, X1 - 20, YB - 40, mz - 220);
    a.box(X0 + 30, YF + 30, mz - 220, X1 - 30, YB - 120, mz - 80); cushion(a, X0 + 30, YF + 30, X1 - 30, YB - 120, mz - 220, mz);
    a.box(X0 + 10, YB - 90, Z0 + 150, X1 - 10, YB - 50, Z1); a.rect(X0 + 10, YB - 90, X1 - 10, YB - 50, 'EQUIP-DETAIL');
    const pw = (W - 160) / v.pillows;
    for (let i = 0; i < v.pillows; i++) { const x = X0 + 80 + pw * (i + 0.5); a.ell(x, YB - 280, mz + 5, pw / 2 - 14, 230, 60, 12, 5); a.rect(x - pw / 2 + 14, YB - 510, x + pw / 2 - 14, YB - 130, 'EQUIP-DETAIL'); }
    a.line(X0 + 30, YF + 550, X1 - 30, YF + 550, 'EQUIP-DETAIL');
    a.rect(X0 + 30, YF + 30, X1 - 30, YB - 120, 'EQUIP-DETAIL');
    a.log('Added the legs, the rail frame, the mattress, the headboard and the pillows (plan and 3D).');
  } });

P({ cat: 'furniture/beds', title: 'Generic stacked bunk bed',
  desc: (v) => `Twin-over-${v.lower} bunk bed with four posts, two mattresses, a guard rail on the upper bunk and a ladder at the foot.`,
  vs: [['twin over twin', 41, 78, 66, 0, { lower: 'twin' }], ['crew rest, twin over twin with curtain rail', 36, 80, 72, 0, { lower: 'twin', rail: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
    for (const [x, y] of [[X0 + 25, YF + 25], [X1 - 25, YF + 25], [X0 + 25, YB - 25], [X1 - 25, YB - 25]]) { a.box(x - 25, y - 25, Z0, x + 25, y + 25, Z1); a.rect(x - 25, y - 25, x + 25, y + 25, 'EQUIP-DETAIL'); }
    for (const [z, ph] of [[Z0 + 280, 0], [Z0 + 1200, 1]]) { a.box(X0 + 25, YF + 25, z - 90, X1 - 25, YB - 25, z - 50); cushion(a, X0 + 50, YF + 50, X1 - 50, YB - 50, z - 50, z + 110); if (ph) { a.box(X0 + 25, YF + 25, z + 100, X1 - 25, YF + 40, z + 330); a.box(X0 + 25, YB - 40, z + 100, X1 - 25, YB - 25, z + 330); a.box(X0 + 25, YB - 40, z + 100, X0 + 40, YB - 25, z + 380); } }
    a.box(X0 + 25, YF + 25, Z0 + 1200 + 330, X1 - 25, YF + 40, Z0 + 1200 + 340);
    for (let i = 0; i < 5; i++) a.box(X1 - 65, YF + 15, Z0 + 250 + i * 230, X1 - 25, YF + 30, Z0 + 275 + i * 230);
    a.box(X1 - 65, YF + 10, Z0 + 250, X1 - 55, YF + 30, Z0 + 1400); a.box(X1 - 35, YF + 10, Z0 + 250, X1 - 25, YF + 30, Z0 + 1400);
    if (v.rail) { a.xcyl(X0 + 30, X1 - 30, YF + 28, Z1 - 12, 8, 8); a.xcyl(X0 + 30, X1 - 30, YF + 28, Z0 + 1010, 8, 8); }
    a.rect(X0 + 50, YF + 50, X1 - 50, YB - 50, 'EQUIP-DETAIL'); a.line(X1 - 65, YF + 20, X1 - 25, YF + 20);
    a.log('Added the four posts, both bunks with mattresses, the guard rail, the ladder and the curtain rail if listed (plan and 3D).');
  } });

P({ cat: 'furniture/beds', title: 'Generic rest lounge daybed',
  desc: (v) => `Upholstered daybed ${v.w} by ${v.d} in with a padded base, a back panel and two arms, for rest areas and lounges.`,
  vs: [['single, 39 in', 39, 80, 30, 0, {}], ['double, 54 in', 54, 80, 30, 0, {}], ['reclining pod, 30 in', 30, 78, 40, 0, { pod: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
    a.box(X0, YF, Z0 + 90, X1, YB, Z0 + 330); for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) a.cone(x, y, Z0, Z0 + 90, 16, 24, 8);
    cushion(a, X0 + 70, YF + 20, X1 - 70, YB - 100, Z0 + 330, Z0 + 470); a.rect(X0 + 70, YF + 20, X1 - 70, YB - 100, 'EQUIP-DETAIL');
    a.box(X0, YB - 90, Z0 + 330, X1, YB, Z1 - (v.pod ? 0 : 160)); a.box(X0, YF + 300, Z0 + 330, X0 + 70, YB - 90, Z0 + 560); a.box(X1 - 70, YF + 300, Z0 + 330, X1, YB - 90, Z0 + 560);
    if (v.pod) a.ell(cx, YB - 120, Z0 + 780, (X1 - X0) / 2 - 40, 60, 260, 14, 6);
    a.log('Added the legs, the base, the mattress, the back and the two arms (plan and 3D).');
  } });

// ---------------------------------------------------------------- other furniture
P({ cat: 'furniture/other', title: 'Generic phone booth pod',
  desc: (v) => `Freestanding acoustic booth for ${v.seats} ${v.seats === 1 ? "person" : "people"}: a framed enclosure with glass sides, a framed hinged door, a bench seat, a worktop and a roof vent.`,
  vs: [['1 person', 40, 40, 90, 0, { seats: 1 }], ['2 person', 60, 44, 90, 0, { seats: 2 }], ['4 person', 90, 60, 92, 0, { seats: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, fr = 40, bz = Z0 + 90;
    a.outline(); a.box(X0, YF, Z0, X1, YB, bz);
    for (const [x, y] of [[X0, YF], [X1 - fr, YF], [X0, YB - fr], [X1 - fr, YB - fr]]) { a.box(x, y, bz, x + fr, y + fr, Z1 - 60); a.rect(x, y, x + fr, y + fr, 'EQUIP-DETAIL'); }
    a.box(X0, YF, Z1 - 100, X1, YB, Z1 - 60); a.box(X0 - 0, YF, Z1 - 60, X1, YB, Z1); a.cyl(cx, cy, Z1, Z1 + 0.5, 4, 4);
    a.box(X0 + fr, YB - 14, bz + 40, X1 - fr, YB - 4, Z1 - 100);   // back panel
    for (const x of [X0 + 5, X1 - 14]) a.box(x, YF + fr, bz + 40, x + 9, YB - fr, Z1 - 100);   // glass sides
    a.frame(X0 + fr, bz + 40, X1 - fr, Z1 - 100, YF + 6, YF + 30, 40); a.box(X1 - fr - 90, YF, bz + 900, X1 - fr - 70, YF + 6, bz + 1100);   // door frame and handle
    a.box(X0 + fr, YB - 380, bz + 380, X1 - fr, YB - 14, bz + 410); // worktop
    const sd = Math.min(380, D - 200);
    cushion(a, X0 + fr + 20, YB - 14 - sd, X1 - fr - 20, YB - 14, bz + 40, bz + 190); a.rect(X0 + fr + 20, YB - 14 - sd, X1 - fr - 20, YB - 14, 'EQUIP-DETAIL');
    a.arc(X0 + fr, YF, W - 2 * fr, 270, 360); a.line(X0 + fr, YF, X0 + fr, YF - (W - 2 * fr), 'EQUIP-SWING'); a.clear('door swing', X0 + fr, YF - (W - 2 * fr), X1 - fr, YF, 80);
    a.log('Added the plinth, the corner posts, the glass sides, the door frame, the bench, the worktop, the roof and the door swing (plan and 3D).');
  } });

P({ cat: 'furniture/other', title: 'Generic folding screen',
  desc: (v) => `Free-standing screen of ${v.n} hinged panels in a zigzag, each a framed fabric panel ${v.h} in high, on small feet.`,
  vs: [['3 panels', 54, 12, 66, 0, { n: 3 }], ['4 panels', 72, 12, 72, 0, { n: 4 }], ['6 panels', 108, 12, 72, 0, { n: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, pw = W / v.n, amp = 100, th = 28;
    a.outline('EQUIP-HIDDEN');
    for (let i = 0; i < v.n; i++) {
      const xa = X0 + pw * i + 6, xb = X0 + pw * (i + 1) - 6, ya = cy + (i % 2 ? amp / 2 : -amp / 2) * 0.8, yb = cy + (i % 2 ? -amp / 2 : amp / 2) * 0.8;
      const dx = xb - xa, dy = yb - ya, L = Math.hypot(dx, dy), nx = -dy / L * th / 2, ny = dx / L * th / 2;
      const quad = (t) => [[xa - nx * t, ya - ny * t], [xb - nx * t, yb - ny * t], [xb + nx * t, yb + ny * t], [xa + nx * t, ya + ny * t]];
      a.prism(quad(1), Z0 + 40, Z1 - 30); a.prism(quad(1.4), Z0 + 40, Z0 + 100); a.prism(quad(1.4), Z1 - 100, Z1 - 30);
      a.prism(quad(1.2), Z0 + 20, Z0 + 40); a.poly(quad(1.4));
      a.cyl(xa + dx * 0.1, ya + dy * 0.1, Z0, Z0 + 20, 12, 6); a.cyl(xb - dx * 0.1, yb - dy * 0.1, Z0, Z0 + 20, 12, 6);
    }
    a.log('Added each framed panel with its rails and feet, set out in a zigzag (plan and 3D).');
  } });

P({ cat: 'furniture/other', title: 'Generic floor mirror',
  desc: (v) => v.wings ? `Three-panel fitting mirror: a ${v.w} in centre mirror with two angled wings, each framed, on a bottom rail with feet.` : `Free-standing full-length mirror in a frame with two floor feet and a rear prop strut, ${v.w} by ${v.h} in.`,
  vs: [['full length, 24 by 70 in', 24, 14, 70, 0, {}], ['full length, 30 by 72 in', 30, 14, 72, 0, {}], ['three-panel fitting mirror, 48 in', 48, 22, 70, 0, { wings: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline('EQUIP-HIDDEN');
    if (v.wings) {
      const cw = W * 0.4, ww = (W - cw) / 2;
      a.box(cx - cw / 2, YB - 30, Z0 + 60, cx + cw / 2, YB, Z1); a.rect(cx - cw / 2, YB - 30, cx + cw / 2, YB);
      for (const s of [-1, 1]) {
        const x0 = cx + s * cw / 2, x1 = cx + s * (cw / 2 + ww - 10), y0 = YB, y1 = YB - 190;
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * 15, ny = dx / L * 15;
        const q = [[x0 - nx, y0 - ny], [x1 - nx, y1 - ny], [x1 + nx, y1 + ny], [x0 + nx, y0 + ny]]; a.prism(q, Z0 + 60, Z1); a.poly(q);
        a.cyl(x1, y1, Z0, Z0 + 60, 18, 8);
      }
      a.box(cx - cw / 2 - 5, YB - 120, Z0, cx + cw / 2 + 5, YB - 60, Z0 + 60);
    } else {
      a.frame(X0, Z0 + 60, X1, Z1, YB - 28, YB, 40); a.box(X0 + 40, YB - 12, Z0 + 100, X1 - 40, YB - 8, Z1 - 40); a.rect(X0, YB - 28, X1, YB);
      for (const x of [X0 + 60, X1 - 60]) a.box(x - 20, YB - 120, Z0, x + 20, YB - 20, Z0 + 60);
      a.tube([[a.cx, YB - 30, Z1 - 300], [a.cx, YF + 20, Z0]], [9, 9], 6); a.line(a.cx, YB - 30, a.cx, YF + 20, 'EQUIP-DETAIL');
    }
    a.log('Added the mirror panels with their frames, the feet and the prop strut or wings (plan and 3D).');
  } });

P({ cat: 'furniture/other', title: 'Generic planter divider',
  desc: (v) => `Planter box ${v.w} by ${v.d} in with soil and foliage, topped by a slatted screen of vertical battens, used to separate seating areas.`,
  vs: [['36 in', 36, 16, 60, 0, {}], ['48 in', 48, 16, 60, 0, {}], ['72 in', 72, 18, 66, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a, bh = 400; a.outline();
    a.box(X0, YF, Z0 + 30, X1, YB, Z0 + bh); a.box(X0 + 30, YF + 30, Z0, X1 - 30, YB - 30, Z0 + 30); a.rect(X0 + 25, YF + 25, X1 - 25, YB - 25, 'EQUIP-DETAIL');
    for (let i = 0; i < Math.round(W / 220); i++) { const x = X0 + 110 + i * 220; if (x < X1 - 60) a.ell(x, cy, Z0 + bh + 40, 100, 90, 70, 10, 5); }
    a.box(X0 + 20, cy - 12, Z0 + bh, X1 - 20, cy + 12, Z0 + bh + 40);
    const n = Math.floor((W - 80) / 55);
    for (let i = 0; i < n; i++) { const x = X0 + 40 + ((W - 80) * (i + 0.5)) / n; a.box(x - 14, cy - 10, Z0 + bh + 40, x + 14, cy + 10, Z1); }
    a.box(X0 + 20, cy - 14, Z1 - 30, X1 - 20, cy + 14, Z1); a.line(X0 + 20, cy, X1 - 20, cy, 'EQUIP-DETAIL');
    a.log('Added the planter box with soil and plants and the slatted screen above it (plan and 3D).');
  } });

export default fams;
