/* SPDX-License-Identifier: Apache-2.0 */
/** Round 4 plumbing (2026-11-03): restaurant and bar sinks, restroom banks for airports and malls, drains, drinking and bottle-filling, fountain features, water heaters, pumps, backflow, interceptors. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const I = 25.4;
const P = (a, pts, r = 10, seg = 8) => a.tube(pts, pts.map(() => r), seg);
/** A gooseneck or deck spout: stem rising at (x, y), arm reaching toward the front. */
function spout(a, x, y, z, rise = 200, reach = 120, r = 11) {
  a.tube([[x, y, z], [x, y, z + rise], [x, y - reach, z + rise + 10]], [r, r, r * 0.85], 8);
  a.cyl(x, y - reach, z + rise - 35, z + rise + 10, r * 0.8, 8);
  a.circ(x, y, r * 1.3, 'EQUIP-DETAIL');
}
/** A basin: floor and four thin walls, rim at zTop. */
function basin(a, x0, y0, x1, y1, zTop, depth, t = 10) {
  a.box(x0, y0, zTop - depth, x1, y1, zTop - depth + t);
  a.box(x0, y0, zTop - depth, x0 + t, y1, zTop); a.box(x1 - t, y0, zTop - depth, x1, y1, zTop);
  a.box(x0, y0, zTop - depth, x1, y0 + t, zTop); a.box(x0, y1 - t, zTop - depth, x1, y1, zTop);
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  a.circ(cx, cy, 22, 'EQUIP-DETAIL'); a.cyl(cx, cy, zTop - depth - 120, zTop - depth + 2, 20, 8);
}
const legs = (a, x0, y0, x1, y1, z0, z1, r = 18, mid = []) => { for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], ...mid]) { a.leg(x, y, z0, z1, r); a.circ(x, y, r, 'EQUIP-HIDDEN'); } };
const lever = (a, x, y, z, len = 80) => { a.xcyl(x - len / 2, x + len / 2, y, z, 6, 6); a.ell(x - len / 2, y, z, 9, 9, 9, 8, 4); };
const grate = (a, cx, cy, r, z, n = 5) => { a.cyl(cx, cy, z - 6, z, r, 20); for (let i = -n; i <= n; i++) { const o = (i / n) * r * 0.8; const hw = Math.sqrt(Math.max(0, r * r * 0.9 - o * o)); a.line(cx - hw, cy + o, cx + hw, cy + o, 'EQUIP-DETAIL'); } a.circ(cx, cy, r); };
const sq = (n, w) => ({ one: n === 1 });

export default [
  // ===================================================================== restroom water closets
  fam({ cat: 'plumbing/fixtures', title: 'Generic floor-mounted tank toilet',
    desc: (v) => `Floor-mounted toilet with a ${v.long ? 'elongated' : 'round-front'} bowl, a ${v.seat} in seat height, a seat ring, a rear tank with lid and a side flush lever.`,
    vs: [
      ['elongated, 15 in seat', 15, 28, 30, 0, { long: 1, seat: 15 }],
      ['elongated, 17 in seat', 15, 28, 32, 0, { long: 1, seat: 17 }],
      
      ['round-front, 15 in seat', 15, 25, 30, 0, { long: 0, seat: 15 }],
      
    ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, w = X1 - X0, sz = Z0 + v.seat * I, tD = 200, bl = a.D - tD * 0.45;
      a.outline();
      a.ell(cx, YF + bl * 0.5, Z0 + (sz - Z0) * 0.5, w * 0.3, bl * 0.4, (sz - Z0) * 0.5, 16, 6);
      a.box(cx - w * 0.28, YB - tD - 60, Z0, cx + w * 0.28, YB - 20, sz - 30);
      a.ell(cx, YF + bl * 0.5, sz - 40, w / 2 - 6, bl * 0.5 - 6, 40, 18, 6);
      a.ell(cx, YF + bl * 0.5, sz + 8, w / 2 - 4, bl * 0.5 - 4, 14, 18, 4);
      a.box(cx - w * 0.4, YB - tD, sz + 20, cx + w * 0.4, YB, Z1 - 40); a.box(cx - w * 0.42, YB - tD - 10, Z1 - 40, cx + w * 0.42, YB + 0, Z1);
      lever(a, cx - w * 0.28, YB - tD - 14, Z1 - 150, 70);
      a.ellp(cx, YF + bl * 0.5, w / 2, bl * 0.5); a.ellp(cx, YF + bl * 0.5, w / 2 - 50, bl * 0.5 - 50, 'EQUIP-DETAIL'); a.rect(cx - w * 0.42, YB - tD - 10, cx + w * 0.42, YB, 'EQUIP-DETAIL');
      a.log('Added the pedestal, the bowl rim, the seat ring, the rear tank with its lid and the side flush lever (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic flushometer water closet',
    desc: (v) => `Floor-mounted ${v.long ? 'elongated' : 'round-front'} bowl at ${v.seat} in seat height with a seat ring, a rear trapway and an exposed flush valve with a handle on a supply riser.`,
    vs: [
      ['elongated, 15 in seat', 15, 28, 40, 0, { long: 1, seat: 15 }],
      ['elongated, 17 in seat', 15, 28, 42, 0, { long: 1, seat: 17 }],
      
      ['round-front, 15 in seat', 15, 25, 40, 0, { long: 0, seat: 15 }],
      
      ['elongated, 17 in seat, 18 in wide', 18, 29, 42, 0, { long: 1, seat: 17 }],
    ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, w = X1 - X0, sz = Z0 + v.seat * I, bl = a.D - 70;
      a.outline();
      a.ell(cx, YF + bl * 0.5, Z0 + (sz - Z0) * 0.5, w * 0.3, bl * 0.4, (sz - Z0) * 0.5, 16, 6);
      a.box(cx - w * 0.3, YB - 200, Z0, cx + w * 0.3, YB - 20, sz - 40);
      a.ell(cx, YF + bl * 0.5, sz - 40, w / 2 - 6, bl * 0.5 - 6, 40, 18, 6); a.ell(cx, YF + bl * 0.5, sz + 8, w / 2 - 4, bl * 0.5 - 4, 14, 18, 4);
      const px = cx + w * 0.18; a.cyl(px, YB - 40, sz, Z1 - 60, 14, 10);
      a.ycyl(YB - 130, YB - 40, px, sz + 330, 24, 12); a.ell(px, YB - 130, sz + 330, 26, 26, 26, 10, 5); a.xcyl(px - 70, px + 10, YB - 130, sz + 330, 10, 8); lever(a, px - 70, YB - 130, sz + 330, 60);
      a.cyl(px, YB - 40, Z1 - 60, Z1, 22, 10); a.circ(px, YB - 40, 22, 'EQUIP-DETAIL');
      a.ellp(cx, YF + bl * 0.5, w / 2, bl * 0.5); a.ellp(cx, YF + bl * 0.5, w / 2 - 50, bl * 0.5 - 50, 'EQUIP-DETAIL'); a.rect(cx - w * 0.3, YB - 200, cx + w * 0.3, YB, 'EQUIP-HIDDEN');
      a.log('Added the bowl, the seat ring, the trapway, the supply riser and the exposed flush valve with its handle (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic wall-hung water closet with carrier',
    desc: (v) => `Wall-hung bowl with its rim at ${v.rim} in, a seat ring, the concealed carrier shown dashed and a flush plate with two buttons on the wall.`,
    vs: [
      ['rim at 15 in', 14, 22, 40, 8, { rim: 15 }], ['rim at 17 in, accessible', 14, 26, 40, 10, { rim: 17 }],
      ['rim at 17 in, 28 in projection', 15, 28, 40, 10, { rim: 17 }], 
      
    ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, w = X1 - X0, bl = a.D - 20, top = Z0 + (v.rim - v.z) * I;
      a.outline();
      a.ell(cx, YF + bl * 0.5, top - 90, w / 2 - 6, bl * 0.5, 90, 18, 6);
      a.ell(cx, YF + bl * 0.5, top + 6, w / 2 - 2, bl * 0.5 - 2, 14, 18, 4);
      a.box(cx - w * 0.3, YB - 120, top - 180, cx + w * 0.3, YB, top - 60);
      a.box(cx - 150, YB - 8, top + 180, cx + 150, YB, top + 330); a.box(cx - 130, YB - 14, top + 230, cx - 10, YB - 8, top + 290); a.box(cx + 10, YB - 14, top + 230, cx + 130, YB - 8, top + 290);
      a.box(cx - w * 0.36, YB - 6, Z0, cx + w * 0.36, YB, Z1);
      a.ellp(cx, YF + bl * 0.5, w / 2, bl * 0.5); a.ellp(cx, YF + bl * 0.5, w / 2 - 50, bl * 0.5 - 50, 'EQUIP-DETAIL'); a.rect(cx - w * 0.36, YB - 120, cx + w * 0.36, YB, 'EQUIP-HIDDEN');
      a.log('Added the cantilevered bowl, the seat ring, the bracket at the wall, the carrier outline and the two-button flush plate (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic wall-hung urinal',
    desc: (v) => `Wall-hung urinal bowl with its rim at ${v.rim} in, a back plate, an exposed flush valve and an outlet${v.screens ? ', with a privacy screen each side' : ''}.`,
    vs: [
      ['rim at 24 in', 14, 14, 36, 5, { rim: 24, screens: 0 }], ['rim at 17 in, accessible', 14, 14, 30, 0, { rim: 17, screens: 0 }],
      ['rim at 24 in, with screens', 32, 18, 48, 5, { rim: 24, screens: 1 }], 
      
    ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, W = X1 - X0, bw = v.screens ? 14 * I : W - 0, rim = Z0 + (v.rim - v.z) * I, bh = rim - Z0 + 20;
      a.outline();
      a.ell(cx, YB - 170, (rim + Z0) / 2, bw / 2, 165, bh / 2, 16, 8); a.box(cx - bw / 2 + 30, YB - 50, Z0 + 40, cx + bw / 2 - 30, YB, Z1);
      a.cyl(cx, YB - 60, Z0, Z0 + 60, 24, 10);
      a.cyl(cx, YB - 50, rim + 80, Z1 - 30, 18, 10); a.ycyl(YB - 110, YB - 50, cx, rim + 140, 20, 10); lever(a, cx, YB - 110, rim + 140, 50);
      if (v.screens) for (const x of [X0 + 14, X1 - 14]) { a.box(x - 14, YB - 480, Z0 + 150, x + 14, YB, Z1 - 20); a.rect(x - 14, YB - 480, x + 14, YB, 'EQUIP-DETAIL'); }
      a.ellp(cx, YB - 170, bw / 2 - 10, 155, 'EQUIP-DETAIL');
      a.log(`Added the flared bowl, the back plate, the exposed flush valve and the outlet${v.screens ? ', and a privacy screen on each side' : ''} (plan and 3D).`);
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic trough urinal',
    desc: (v) => `Floor-standing stainless trough ${v.l} in long with a wall plate, a perforated spreader pipe along the wall, a front lip and a floor channel.`,
    vs: [36, 60, 84].map((l) => [`${l} in long`, l, 16, 58, 0, { l }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a;
      a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1); a.box(X0, YF, Z0, X1, YF + 40, Z0 + 140); a.box(X0, YF, Z0, X1, YB - 40, Z0 + 40);
      a.box(X0, YF + 40, Z0 + 140, X1, YB - 50, Z0 + 520); a.box(X0 + 10, YF + 50, Z0 + 150, X1 - 10, YB - 60, Z0 + 520 - 10);
      a.rect(X0 + 20, YF + 40, X1 - 20, YB - 50, 'EQUIP-DETAIL'); a.xcyl(X0 + 40, X1 - 40, YB - 90, Z0 + 1150, 14, 10);
      const n = Math.max(2, Math.round(v.l / 12)); for (let i = 0; i < n; i++) { const x = X0 + 80 + (i * (W - 160)) / (n - 1); a.circ(x, YB - 90, 6, 'EQUIP-DETAIL'); a.cyl(x, YB - 90, Z0 + 520, Z0 + 1150, 3, 4); }
      a.cyl(cx, YF + 120, Z0 - 0, Z0 + 40, 40, 12); a.circ(cx, YF + 120, 40, 'EQUIP-DETAIL');
      a.log('Added the trough with its front lip, the wall plate, the perforated spreader pipe and the floor drain (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic stall urinal',
    desc: (v) => `Floor-standing stall urinal ${v.w} in wide with a rolled lip, a back wall with a flush pipe and a floor drain.`,
    vs: [[`${18} in wide`, 18, 16, 48, 0, { w: 18 }], ['24 in wide', 24, 18, 54, 0, { w: 24 }], ['30 in wide, tall back', 30, 19, 66, 0, { w: 30 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YB - 40, Z0, X1, YB, Z1); a.ell(cx, YB - 200, Z0 + 330, W / 2 - 8, 190, 330, 16, 7); a.box(X0 + 12, YF + 20, Z0, X1 - 12, YB - 50, Z0 + 60);
      a.cyl(cx, YB - 50, Z1 - 150, Z1 - 20, 16, 8); a.cyl(cx, YF + 90, Z0, Z0 + 20, 30, 10); a.ellp(cx, YB - 200, W / 2 - 10, 180, 'EQUIP-DETAIL'); a.circ(cx, YF + 90, 30, 'EQUIP-DETAIL');
      a.log('Added the stall bowl with its lip, the back wall, the flush pipe and the floor drain (plan and 3D).');
    } }),
  // ===================================================================== lavatories and vanity banks
  fam({ cat: 'plumbing/fixtures', title: 'Generic wall-hung lavatory',
    desc: (v) => `Wall-hung basin ${v.l} in wide with a ${v.f === 'wrist' ? 'faucet with wrist blades' : 'single-lever faucet'}, wall brackets and a trap with a covered supply and drain.`,
    vs: [['18 in, lever faucet', 18, 15, 60, 30, { l: 18, f: 'lever' }], ['20 in, lever faucet', 20, 18, 60, 30, { l: 20, f: 'lever' }],
      ['22 in, wrist-blade faucet', 22, 19, 60, 30, { l: 22, f: 'wrist' }], 
      ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, top = Z0 + 31 * I * 0 + (Z1 - Z0) * 0.55; a.outline();
      a.box(cx - W * 0.42, YB - 8, Z0 + 260, cx + W * 0.42, YB, Z1);   // wall plate
      a.box(X0, YF, top - 160, X1, YB - 30, top); basin(a, X0 + 30, YF + 30, X1 - 30, YB - 120, top - 6, 120, 10);
      a.box(X0, YB - 90, top, X1, YB - 30, top + 40);
      spout(a, cx, YB - 70, top + 40, 150, 90, 11);
      if (v.f === 'wrist') { a.box(cx - 120, YB - 170, top + 170, cx + 120, YB - 150, top + 190); a.xcyl(cx - 200, cx - 120, YB - 160, top + 180, 7, 6); a.xcyl(cx + 120, cx + 200, YB - 160, top + 180, 7, 6); } else lever(a, cx + 40, YB - 70, top + 190, 80);
      a.box(cx - 90, YB - 70, Z0 + 260, cx + 90, YB - 20, top - 160); a.cyl(cx, YB - 50, Z0 + 260, top - 160, 40, 10);   // trap cover
      a.rect(X0, YF, X1, YB - 30, 'EQUIP-DETAIL');
      a.log('Added the basin, the wall plate, the faucet, the trap cover and the brackets (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic restroom vanity bank',
    desc: (v) => `Solid-surface vanity counter with ${v.n} integral bowl${v.n > 1 ? 's' : ''} on ${v.pitch} in centres, a deck faucet at each, a back splash and a front apron on wall brackets.`,
    vs: [1, 2, 4, 6].map((n) => [`${n} bowl${n > 1 ? 's' : ''}, 24 in centres`, n * 24 + 6, 22, 15, 28, { n, pitch: 24 }])
      .concat([[`4 bowls, 30 in centres`, 126, 22, 15, 28, { n: 4, pitch: 30 }], ['2 bowls, 36 in centres', 78, 22, 15, 28, { n: 2, pitch: 36 }]]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, top = Z0 + 190; a.outline();
      a.box(X0, YF, Z0, X1, YB - 20, Z0 + 20); const step = v.pitch * I, x00 = cx - ((v.n - 1) * step) / 2;
      a.box(X0, YF, Z0 + 20, X1, YF + 30, Z0 + 170);
      a.box(X0, YB - 80, Z0 + 20, X1, YB, Z1);   // back and splash
      for (let i = 0; i < v.n; i++) {
        const x = x00 + i * step, hw = Math.min(step, 22 * I) / 2 - 90;
        basin(a, x - hw, YF + 90, x + hw, YB - 170, Z0 + 170, 130, 10); spout(a, x, YB - 130, Z0 + 190, 160, 110, 10); a.box(x - hw - 20, YF + 60, Z0 + 170, x + hw + 20, YB - 80, Z0 + 190);
      }
      for (let x = X0 + 10; x < X1 - 20; x += (W - 20) / (v.n + 1)) a.box(x, YB - 8, Z0 + 20, x + 30, YB, Z0 + 170);
      a.box(X0, YF, Z0 + 170, X1, YB - 80, Z0 + 190);
      a.log('Added the counter slab, the integral bowls, one deck faucet per bowl, the splash and the front apron (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic handwash trough',
    desc: (v) => `Straight stainless handwash trough with ${v.n} faucet spouts and drains along a ${v.l} in basin, on a wall-mounted back panel with a front lip and legs.`,
    vs: [[2, 48], [4, 84], [6, 120]].map(([n, l]) => [`${n} stations, ${l} in`, l, 22, 44, 0, { n, l }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, top = Z0 + 34 * I; a.outline();
      basin(a, X0 + 10, YF + 10, X1 - 10, YB - 140, top, 200, 12); a.box(X0, YF, top - 20, X1, YF + 10, top); a.box(X0, YB - 140, top - 20, X1, YB, top + 0);
      a.box(X0, YB - 30, top, X1, YB, Z1);
      for (let i = 0; i < v.n; i++) { const x = X0 + ((i + 0.5) * W) / v.n; spout(a, x, YB - 60, top, 150, 150, 12); a.cyl(x, YB - 270 + 100, top - 180, top - 160, 24, 8); a.circ(x, YF + 140, 22, 'EQUIP-DETAIL'); }
      legs(a, X0 + 60, YF + 60, X1 - 60, YB - 150, Z0, top - 200, 22, v.n > 3 ? [[a.cx, YF + 60], [a.cx, YB - 150]] : []);
      a.xcyl(X0 + 60, X1 - 60, YF + 60, Z0 + 200, 10, 8);
      a.log('Added the trough basin, the faucet spout and drain at each station, the back panel, the legs and the foot rail (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic circular wash fountain',
    desc: (v) => `${v.semi ? 'Semicircular' : 'Circular'} wash fountain ${v.dia} in across with ${v.n} spray stations on a central column and a rim basin on a pedestal.`,
    vs: [['circular, 36 in, 3 stations', 36, 36, 64, 0, { dia: 36, n: 3, semi: 0 }], ['circular, 54 in, 5 stations', 54, 54, 64, 0, { dia: 54, n: 5, semi: 0 }],
      
      ['semicircular, 54 in, 5 stations', 54, 30, 64, 0, { dia: 54, n: 5, semi: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, D } = a, r = W / 2, top = Z0 + 34 * I, cx = a.cx, cy = v.semi ? YB : (YF + YB) / 2;
      const a0 = v.semi ? Math.PI : 0, a1 = Math.PI * 2, steps = 28; const ring = (rr) => { const pts = []; for (let i = 0; i <= steps; i++) { const t = v.semi ? Math.PI + (Math.PI * i) / steps : (Math.PI * 2 * i) / steps; pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]); } return pts; };
      a.outline('EQUIP-HIDDEN'); if (v.semi) a.poly([...ring(r), [cx - r, YB]]); else a.circ(cx, cy, r);
      const o = ring(r), inn = ring(r - 140);
      a.prism(v.semi ? [...o, ...[...o].slice(0, 0)] : o, top - 90, top);
      const cc = v.semi ? YB - 150 : cy; a.cone(cx, cc, Z0, top - 90, Math.min(r * 0.3, 130), Math.min(r * 0.45, 140), 16);
      a.cyl(cx, cc, top, top + 700, 60, 14); a.cone(cx, cc, top + 700, top + 800, 60, 120, 14);
      for (let i = 0; i < v.n; i++) { const t = v.semi ? Math.PI + (Math.PI * (i + 0.5)) / v.n : (Math.PI * 2 * i) / v.n; const x = cx + Math.cos(t) * (r - 200), y = cy + Math.sin(t) * (r - 200); a.circ(x, y, 25, 'EQUIP-DETAIL'); a.tube([[cx + Math.cos(t) * 60, cc + Math.sin(t) * 60, top + 650], [x, y, top + 600]], [14, 10], 6); a.cyl(x, y, top - 10, top + 20, 18, 8); }
      a.poly(inn, 'EQUIP-DETAIL');
      a.log('Added the rim basin, the pedestal, the central column with its spray head and the spray stations (plan and 3D).');
    } }),
  // ===================================================================== drinking water
  fam({ cat: 'plumbing/fixtures', title: 'Generic wall-mounted drinking fountain',
    desc: (v) => `Wall-mounted ${v.kind} drinking fountain with a basin, a bubbler, a push bar and a wall plate${v.filler ? ', and a bottle filler with a sensor above the basin' : ''}.`,
    vs: [['single basin, accessible', 20, 18, 14, 34, { kind: 'single-basin', filler: 0, bi: 0 }], ['single basin, with bottle filler', 20, 18, 50, 34, { kind: 'single-basin', filler: 1, bi: 0 }],
      ['bi-level, high and low', 20, 18, 48, 8, { kind: 'bi-level', filler: 0, bi: 1 }], 
      ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      const unit = (zb) => { a.box(X0 + 10, YB - 60, zb - 10, X1 - 10, YB, zb + 220); a.ell(cx, YF + 190, zb + 40, W / 2 - 25, 170, 55, 16, 6); a.box(X0 + 20, YB - 100, zb - 10, X1 - 20, YB - 60, zb + 60);
        a.tube([[cx, YB - 70, zb + 70], [cx, YB - 150, zb + 140], [cx, YB - 210, zb + 110]], [10, 10, 9], 8); a.box(X0 + 40, YF + 60, zb + 20, X1 - 40, YF + 80, zb + 70); a.circ(cx, YF + 190, 130, 'EQUIP-DETAIL'); };
      if (v.bi) { unit(Z0 + 20); unit(Z0 + 20 + 330); } else unit(Z0 + 10);
      if (v.filler) { const z = v.bi ? Z0 + 750 : Z0 + 380; a.box(X0 + 10, YB - 60, z, X1 - 10, YB, z + 360); a.ycyl(YB - 200, YB - 60, cx, z + 140, 26, 10); a.box(cx - 40, YB - 90, z + 240, cx + 40, YB - 60, z + 330); a.box(X0 + 30, YF + 110, z - 80 + 10, X1 - 30, YB - 60, z + 20); }
      a.log(`Added the wall plate, ${v.bi ? 'two basins at different heights' : 'the basin'}, the bubbler and push bar${v.filler ? ' and the bottle filler with its sensor' : ''} (plan and 3D).`);
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic bottle filling station',
    desc: (v) => `Wall-mounted bottle filling station with a ${v.n === 2 ? 'twin-spout' : 'single-spout'} bezel, a sensor window, a drip basin and ${v.cup ? 'a cup-height basin below' : 'a wall plate'}.`,
    vs: [['single spout', 15, 12, 44, 30, { n: 1, cup: 0 }], ['single spout, with cup basin', 18, 20, 42, 30, { n: 1, cup: 1 }], ['twin spout', 28, 12, 44, 30, { n: 2, cup: 0 }],
      ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YB - 60, Z0, X1, YB, Z1); a.box(X0 + 10, YB - 80, Z0 + 140, X1 - 10, YB - 60, Z1 - 60);
      for (let i = 0; i < v.n; i++) { const x = v.n === 1 ? cx : X0 + W * (0.28 + 0.44 * i); a.ycyl(YB - 200, YB - 80, x, Z0 + 330, 24, 10); a.ycyl(YB - 230, YB - 200, x, Z0 + 330, 12, 8); a.box(x - 60, YB - 90, Z0 + 460, x + 60, YB - 80, Z0 + 520); a.circ(x, YB - 215, 12, 'EQUIP-DETAIL'); }
      a.box(X0 + 20, YF + 40, Z0 + 140, X1 - 20, YB - 80, Z0 + 175); a.rect(X0 + 20, YF + 40, X1 - 20, YB - 80, 'EQUIP-DETAIL');
      if (v.cup) { a.ell(cx, YF + 130, Z0 + 60, W / 2 - 30, 100, 50, 14, 5); a.circ(cx, YF + 130, 70, 'EQUIP-DETAIL'); }
      a.log('Added the wall housing, the spout and sensor at each station, the drip basin' + (v.cup ? ' and the cup basin' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic pedestal drinking fountain',
    desc: (v) => `Free-standing pedestal drinking fountain with ${v.n === 2 ? 'two basins on opposite sides' : 'one basin'}, a bubbler at each, a column and a floor plate.`,
    vs: [['one basin, 36 in', 16, 16, 36, 0, { n: 1 }], ['two basins, 42 in', 28, 18, 42, 0, { n: 2 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); const top = Z1 - 60;
      a.cyl(cx, cy, Z0, Z0 + 30, Math.min(W, a.D) * 0.4, 20); a.cyl(cx, cy, Z0 + 30, top, Math.min(W, a.D) * 0.2, 16); a.circ(cx, cy, Math.min(W, a.D) * 0.4); a.circ(cx, cy, Math.min(W, a.D) * 0.2, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const dx = v.n === 1 ? 0 : (i ? 1 : -1) * W * 0.27; a.ell(cx + dx, cy, top, a.D * 0.4, a.D * 0.38, 55, 16, 6); a.circ(cx + dx, cy, a.D * 0.3, 'EQUIP-DETAIL'); a.tube([[cx + dx, cy + a.D * 0.2, top], [cx + dx, cy + a.D * 0.2, top + 80], [cx + dx, cy + a.D * 0.05, top + 100]], [8, 8, 7], 6); }
      if (v.n === 2) a.box(cx - 30, cy - 30, top - 20, cx + 30, cy + 30, top + 60);
      a.log('Added the floor plate, the column, the basin and bubbler at each side (plan and 3D).');
    } }),
  // ===================================================================== service and utility sinks
  fam({ cat: 'plumbing/fixtures', title: 'Generic floor mop sink',
    desc: (v) => `Floor-set service basin ${v.w} by ${v.d} in with a ${v.curb} in curb, a drain, a wall faucet with a hose hook, a mop hanger and a wall guard.`,
    vs: [['24 by 24 in, 6 in curb', 24, 24, 48, 0, { w: 24, d: 24, curb: 6 }], 
      ['32 by 32 in, 6 in curb', 32, 32, 48, 0, { w: 32, d: 32, curb: 6 }], 
      ['36 by 24 in, 6 in curb', 36, 24, 48, 0, { w: 36, d: 24, curb: 6 }], ['36 by 36 in, 10 in curb', 36, 36, 48, 0, { w: 36, d: 36, curb: 10 }], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, ch = v.curb * I; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 40); a.box(X0, YF, Z0, X1, YF + 70, Z0 + ch); a.box(X0, YB - 70, Z0, X1, YB, Z0 + ch); a.box(X0, YF, Z0, X0 + 70, YB, Z0 + ch); a.box(X1 - 70, YF, Z0, X1, YB, Z0 + ch);
      a.rect(X0 + 70, YF + 70, X1 - 70, YB - 70, 'EQUIP-DETAIL'); a.circ(cx, cy, 50, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0 + 38, Z0 + 42, 50, 12);
      a.box(X0 + 6, YB - 24, Z0 + ch, X1 - 6, YB, Z1);
      const zf = Z0 + 900; a.box(cx - 100, YB - 50, zf, cx + 100, YB, zf + 80); a.tube([[cx, YB - 40, zf + 40], [cx, YB - 120, zf + 20], [cx, YB - 150, zf - 30]], [14, 12, 12], 8);
      a.xcyl(cx - 30, cx + 30, YB - 160, zf + 150, 7, 6);
      a.box(cx - 220, YB - 40, Z1 - 100, cx + 220, YB - 24, Z1 - 60);
      for (let i = 0; i < 3; i++) a.cyl(cx - 150 + i * 150, YB - 52, Z1 - 100, Z1 - 30, 7, 6);
      a.log('Added the curbed basin, the drain, the wall guard, the wall faucet with a hose hook and the mop hanger (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic commercial compartment sink',
    desc: (v) => `Stainless sink with ${v.n} bowl${v.n > 1 ? 's' : ''} of ${v.bw} by ${v.bd} in${v.dbL ? ', a left drainboard' : ''}${v.dbR ? ', a right drainboard' : ''}, a back splash, a swing spout between bowls and legs with a cross rail.`,
    vs: [
      ['1 bowl, no drainboard, 24 in', 24, 24, 44, 0, { n: 1, bw: 18, bd: 18, dbL: 0, dbR: 0 }], 
      ['2 bowls, no drainboard, 36 in', 36, 24, 44, 0, { n: 2, bw: 16, bd: 20, dbL: 0, dbR: 0 }], 
      ['2 bowls, 2 drainboards, 72 in', 72, 27, 44, 0, { n: 2, bw: 20, bd: 20, dbL: 1, dbR: 1 }], ['2 bowls, 2 drainboards, 96 in', 96, 30, 44, 0, { n: 2, bw: 24, bd: 24, dbL: 1, dbR: 1 }],
      ['3 bowls, 1 drainboard, 72 in', 72, 27, 44, 0, { n: 3, bw: 16, bd: 20, dbL: 1, dbR: 0 }],
      ['3 bowls, 2 drainboards, 90 in', 90, 27, 44, 0, { n: 3, bw: 16, bd: 20, dbL: 1, dbR: 1 }], ['3 bowls, 2 drainboards, 108 in', 108, 30, 44, 0, { n: 3, bw: 18, bd: 24, dbL: 1, dbR: 1 }],
      ['3 bowls, 2 drainboards, 120 in', 120, 30, 46, 0, { n: 3, bw: 20, bd: 24, dbL: 1, dbR: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, top = Z0 + 34 * I; a.outline();
      const bwm = v.bw * I, rim = 45, divs = (v.n - 1) * 40; const free = W - v.n * bwm - divs; const board = (v.dbL + v.dbR) ? Math.max(0, free) / (v.dbL + v.dbR) : 0;
      const sx = X0 + (v.dbL ? board : Math.max(0, free) / 2); let x = sx;
      a.box(X0, YF, top - 30, X1, YB, top);
      const back = YB - 80;
      for (let i = 0; i < v.n; i++) { basin(a, x, YF + 90, x + bwm, back - 30, top - 6, 260, 8); x += bwm + 40; }
      a.box(X0, YB - 80, top, X1, YB - 40, Z1 - 160);
      x = sx; for (let i = 0; i < v.n - 1; i++) { x += bwm + 20; spout(a, x, YB - 60, Z1 - 160, 70, 140, 14); }
      if (v.n === 1) spout(a, sx + bwm / 2, YB - 60, Z1 - 160, 70, 140, 14);
      legs(a, X0 + 30, YF + 30, X1 - 30, YB - 30, Z0, top - 30, 20, v.n >= 2 ? [[a.cx, YF + 30], [a.cx, YB - 30]] : []);
      a.box(X0 + 30, YF + 30, Z0 + 180, X1 - 30, YF + 50, Z0 + 215); a.box(X0 + 30, YB - 50, Z0 + 180, X1 - 30, YB - 30, Z0 + 215);
      a.log('Added the deck, the pressed bowls with drains, the splash, the swing spouts, the legs and the cross rails (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic bar sink',
    desc: (v) => `Under-bar stainless sink with ${v.n} bowl${v.n > 1 ? 's' : ''}${v.ice ? ', an ice bin' : ''}${v.board ? ', a drainboard' : ''}, a splash with a gooseneck spout and legs with cross rails.`,
    vs: [['1 bowl, 18 in', 18, 21, 38, 0, { n: 1, ice: 0, board: 0 }], ['2 bowls, 36 in', 36, 21, 38, 0, { n: 2, ice: 0, board: 0 }], 
      
      ['3 bowls with ice bin and drainboard, 72 in', 72, 21, 38, 0, { n: 3, ice: 1, board: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, top = Z1 - 270; a.outline();
      const bw = 14 * I, seg = v.n + (v.ice ? 1 : 0) + (v.board ? 1 : 0), pitch = (W - 60) / seg; a.box(X0, YF, top - 30, X1, YB, top);
      a.box(X0 + 30, YB - 25, Z0, X1 - 30, YB - 5, top - 30); a.box(X0 + 30, YF + 25, Z0 + 100, X1 - 30, YF + 45, top - 30);
      legs(a, X0 + 30, YF + 30, X1 - 30, YB - 30, Z0, top - 30, 18);
      for (let i = 0; i < v.n; i++) { const x = X0 + 30 + pitch * (i + 0.5); basin(a, x - bw / 2 + 20, YF + 60, x + bw / 2 - 20, YB - 120, top - 6, 220, 8); }
      if (v.ice) { const x = X0 + 30 + pitch * (v.n + 0.5); a.box(x - pitch / 2 + 30, YF + 50, top, x + pitch / 2 - 30, YB - 110, top + 40); a.rect(x - pitch / 2 + 30, YF + 50, x + pitch / 2 - 30, YB - 110, 'EQUIP-DETAIL'); a.line(x - pitch / 2 + 50, YF + 70, x + pitch / 2 - 50, YF + 70); }
      if (v.board) { const x = X0 + 30 + pitch * (v.n + (v.ice ? 1 : 0) + 0.5); for (let k = -3; k <= 3; k++) a.box(x - pitch / 2 + 30, YF + 60 + (k + 3) * 25, top, x + pitch / 2 - 30, YF + 70 + (k + 3) * 25, top + 14); a.rect(x - pitch / 2 + 30, YF + 50, x + pitch / 2 - 30, YB - 110, 'EQUIP-DETAIL'); }
      a.box(X0, YB - 100, top, X1, YB, top + 120);
      spout(a, X0 + 30 + pitch * Math.max(1, v.n / 2), YB - 70, top + 120, 120, 120, 11);
      a.log('Added the deck, the pressed bowls' + (v.ice ? ', the ice bin' : '') + (v.board ? ', the drainboard' : '') + ', the splash with its gooseneck spout and the stand (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic restroom wall-hung hand sink',
    desc: (v) => `Wall-mounted stainless hand sink ${v.w} in wide with a ${v.ctl} control, a splash on three sides, a soap dispenser and a P-trap.`,
    vs: [['12 in, knee valve', 12, 12, 24, 38, { w: 12, ctl: 'knee-operated' }], ['16 in, lever faucet', 16, 15, 24, 38, { w: 16, ctl: 'lever' }],
      ['20 in, sensor faucet, wide bowl', 20, 17, 26, 38, { w: 20, ctl: 'sensor' }], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, top = Z0 + 260; a.outline();
      a.box(X0, YF, top - 120, X1, YB, top - 100); basin(a, X0 + 20, YF + 20, X1 - 20, YB - 20, top - 20, 100, 8);
      a.box(X0, YB - 24, top - 100, X1, YB, Z1); a.box(X0, YF, top - 100, X0 + 18, YB, top + 130); a.box(X1 - 18, YF, top - 100, X1, YB, top + 130);
      spout(a, cx, YB - 60, top - 20, v.ctl === 'sensor' ? 90 : 130, 110, 10);
      if (v.ctl === 'knee-operated') { a.ycyl(YB - 100, YB - 24, X0 + 70, Z0 + 20, 12, 8); a.box(X0 + 60, YF + 60, Z0 - 0, X0 + 90, YF + 90, Z0 + 40); a.tube([[cx, YB - 60, top - 20], [X0 + 70, YB - 90, Z0 + 20]], [4, 4], 6); }
      else if (v.ctl === 'lever') lever(a, cx + 30, YB - 60, top + 150, 70); else a.box(cx - 25, YB - 60, top + 40, cx + 25, YB - 40, top + 80);
      a.box(X1 - 90, YB - 70, top + 100, X1 - 40, YB - 24, top + 220);
      a.cyl(cx, YB - 50, Z0 + 40, top - 120, 20, 8);
      a.log('Added the bowl with three-sided splash, the faucet and its control, the soap dispenser and the trap (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic pre-rinse faucet unit',
    desc: (v) => `${v.mount === 'wall' ? 'Wall-mounted' : 'Deck-mounted'} pre-rinse unit with a spring arm, a spray valve on a hose, a ${v.rise} in riser${v.addon ? ' and an add-on faucet spout' : ''}.`,
    vs: [['deck mount, 8 in centres, 25 in riser', 10, 12, 36, 0, { mount: 'deck', rise: 25, addon: 0 }], 
      ['deck mount, add-on faucet', 14, 14, 40, 0, { mount: 'deck', rise: 28, addon: 1 }], ['wall mount, 30 in riser', 12, 12, 40, 0, { mount: 'wall', rise: 30, addon: 0 }], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); const rz = Z0 + 120;
      a.box(X0 + 10, YB - 30, Z0, X1 - 10, YB, Z0 + 70);
      for (const x of [cx - W * 0.3, cx + W * 0.3]) { a.cyl(x, YB - 60, Z0 + 70, rz + 80, 22, 10); }
      a.cyl(cx - W * 0.3, YB - 60, Z0 + 70, Z0 + 70 + 4, 40, 10);
      const rh = Z1 - 100; a.cyl(cx, YB - 60, Z0 + 70, rh, 12, 10); a.tube([[cx, YB - 60, rh], [cx, YB - 60, rh + 80], [cx, YB - 160, rh + 100]], [13, 13, 12], 8);
      a.tube([[cx, YB - 60, Z0 + 150], [cx + 90, YB - 90, Z0 + 250], [cx + 40, YB - 200, rh - 120], [cx + 20, YB - 150, rh - 20]], [5, 5, 5, 5], 6);
      a.cyl(cx + 20, YB - 150, rh - 40, rh + 20, 16, 8); a.ell(cx + 20, YB - 150, rh + 24, 22, 22, 12, 8, 4);
      a.box(cx - 45, YB - 70, Z0 + 140, cx + 45, YB - 40, Z0 + 180);
      if (v.addon) spout(a, cx - W * 0.3, YB - 60, rz + 80, 160, 140, 12);
      a.rect(X0 + 10, YB - 30, X1 - 10, YB, 'EQUIP-DETAIL'); a.circ(cx, YB - 60, 14, 'EQUIP-DETAIL');
      a.log('Added the base plate, the supply risers, the spring arm, the spray valve on its hose' + (v.addon ? ' and the add-on spout' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic pot filler faucet',
    desc: (v) => `${v.kind === 'wall' ? 'Wall-mounted' : 'Deck-mounted'} pot filler with a double-jointed arm ${v.reach} in long, two elbows, a shutoff valve and a ${v.kind === 'wall' ? 'wall flange' : 'deck flange'}.`,
    vs: [['wall mount, 12 in arm', 8, 20, 10, 60, { kind: 'wall', reach: 12 }], ['wall mount, 24 in arm', 8, 32, 10, 60, { kind: 'wall', reach: 24 }],
      ['deck mount, 8 in arm', 8, 14, 18, 36, { kind: 'deck', reach: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, L = v.reach * I; a.outline();
      if (v.kind === 'wall') { a.box(cx - 50, YB - 12, Z0, cx + 50, YB, Z0 + 60); a.ycyl(YB - 60, YB - 12, cx, Z0 + 30, 16, 10); a.ell(cx, YB - 60, Z0 + 30, 22, 22, 22, 10, 5); lever(a, cx, YB - 60, Z0 + 80, 60);
        const mid = YB - 60 - Math.min(L * 0.55, a.D - 140); a.tube([[cx, YB - 60, Z0 + 30], [cx, mid, Z0 + 30]], [12, 12], 8); a.ell(cx, mid, Z0 + 30, 16, 16, 16, 8, 4); a.tube([[cx, mid, Z0 + 30], [cx, YF + 40, Z0 + 30]], [10, 10], 8); a.cyl(cx, YF + 30, Z0 - 0, Z0 + 30, 11, 8); a.circ(cx, YF + 30, 11, 'EQUIP-DETAIL'); }
      else { a.cyl(cx, YB - 60, Z0, Z0 + 18, 50, 14); a.cyl(cx, YB - 60, Z0 + 18, Z0 + 250, 14, 10); a.tube([[cx, YB - 60, Z0 + 250], [cx, YB - 60 - L * 0.5, Z0 + 270], [cx, YF + 40, Z0 + 250]], [11, 11, 10], 8); a.cyl(cx, YF + 40, Z0 + 180, Z0 + 250, 9, 8); a.circ(cx, YB - 60, 50, 'EQUIP-DETAIL'); a.circ(cx, YF + 40, 9, 'EQUIP-DETAIL'); }
      a.line(cx, YB - 60, cx, YF + 40);
      a.log('Added the flange, the shutoff handle, the jointed arm with its elbow and the downturned spout (plan and 3D).');
    } }),
  // ===================================================================== drains
  fam({ cat: 'plumbing/fixtures', title: 'Generic floor sink',
    desc: (v) => `Floor sink ${v.w} in ${v.round ? 'round' : 'square'} with a ${v.grate === 'half' ? 'half grate' : 'full grate'}, a sediment bucket and a flanged rim set flush with the floor.`,
    vs: [['12 in square, full grate', 12, 12, 10, 0, { w: 12, round: 0, grate: 'full' }], ['20 in square, half grate', 20, 20, 12, 0, { w: 20, round: 0, grate: 'half' }],
      ['16 in round, half grate', 16, 16, 10, 0, { w: 16, round: 1, grate: 'half' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2, t = 6;
      if (v.round) { a.circ(cx, cy, r); a.cyl(cx, cy, Z0, Z0 + 20, r, 24); a.cyl(cx, cy, Z0 + 20, Z1, r * 0.82, 24); a.circ(cx, cy, r * 0.82, 'EQUIP-DETAIL'); }
      else { a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0, YF, Z0 + 20, X1, YF + 30, Z1); a.box(X0, YB - 30, Z0 + 20, X1, YB, Z1); a.box(X0, YF, Z0 + 20, X0 + 30, YB, Z1); a.box(X1 - 30, YF, Z0 + 20, X1, YB, Z1); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL'); }
      const gx0 = v.grate === 'half' ? cx : cx - r * 0.7;
      const n = 6; for (let i = 0; i <= n; i++) { const x = gx0 + ((cx + r * 0.7 - gx0) * i) / n; a.box(x - 4, cy - r * 0.7, Z1 - 8, x + 4, cy + r * 0.7, Z1); a.line(x, cy - r * 0.7, x, cy + r * 0.7); }
      a.box(gx0, cy - r * 0.7, Z1 - 8, cx + r * 0.7, cy - r * 0.7 + 8, Z1); a.box(gx0, cy + r * 0.7 - 8, Z1 - 8, cx + r * 0.7, cy + r * 0.7, Z1);
      a.cyl(cx - r * 0.2, cy, Z0 + 30, Z1 - 20, r * 0.35, 12);
      a.log(`Added the sink body, the flanged rim, the ${v.grate} grate and the sediment bucket (plan and 3D).`);
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic floor drain',
    desc: (v) => `${v.round ? 'Round' : 'Square'} floor drain with a ${v.dia} in strainer plate, ${v.round ? 'a ring of slots' : 'a grid of slots'}, a clamping collar and a trap outlet below.`,
    vs: [['round, 4 in', 4, 4, 6, 0, { dia: 4, round: 1 }], ['round, 6 in', 6, 6, 6, 0, { dia: 6, round: 1 }], ['round, 8 in', 8, 8, 8, 0, { dia: 8, round: 1 }], 
      ['square, 6 in', 6, 6, 6, 0, { dia: 6, round: 0 }], ['square, 12 in', 12, 12, 8, 0, { dia: 12, round: 0 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.outline();
      if (v.round) { a.cyl(cx, cy, Z0, Z1 - 8, r * 0.95, 20); a.cyl(cx, cy, Z1 - 8, Z1, r, 20); a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL'); const n = 8; for (let i = 0; i < n; i++) { const g = (i / n) * Math.PI; a.line(cx - Math.cos(g) * r * 0.75, cy - Math.sin(g) * r * 0.75, cx + Math.cos(g) * r * 0.75, cy + Math.sin(g) * r * 0.75, 'EQUIP-DETAIL'); } }
      else { a.box(X0, YF, Z1 - 8, X1, YB, Z1); a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z1 - 8); for (let i = 1; i < 6; i++) { const x = X0 + ((X1 - X0) * i) / 6; a.line(x, YF + 10, x, YB - 10, 'EQUIP-DETAIL'); const y = YF + ((YB - YF) * i) / 6; a.line(X0 + 10, y, X1 - 10, y, 'EQUIP-DETAIL'); } }
      a.cyl(cx, cy, Z0 - 0, Z0 + 20, r * 0.6, 14);
      a.log('Added the strainer plate with its slots, the clamping collar and the body with the trap outlet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic trench drain',
    desc: (v) => `Floor trench drain ${v.l} in long and ${v.w} in wide with a channel body, slotted grate sections, end caps and an outlet below.`,
    vs: [[24, 6], [48, 6], [96, 6], [72, 12], [120, 12]].map(([l, w]) => [`${l} in long, ${w} in wide`, l, w, 4, 0, { l, w }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0, YF, Z0, X1, YF + 20, Z1); a.box(X0, YB - 20, Z0, X1, YB, Z1); a.box(X0, YF, Z0, X0 + 20, YB, Z1); a.box(X1 - 20, YF, Z0, X1, YB, Z1);
      const seg = 24 * I; const n = Math.max(1, Math.round(W / seg)); for (let k = 0; k < n; k++) { const gx0 = X0 + 20 + (k * (W - 40)) / n, gx1 = X0 + 20 + ((k + 1) * (W - 40)) / n - 4; a.box(gx0, YF + 20, Z1 - 12, gx1, YB - 20, Z1); a.rect(gx0, YF + 20, gx1, YB - 20, 'EQUIP-DETAIL'); for (let x = gx0 + 30; x < gx1 - 30; x += 40) a.line(x, YF + 40, x, YB - 40, 'EQUIP-DETAIL'); }
      a.cyl(X0 + W * 0.5, cy, Z0 - 0, Z0 + 20, Math.min(40, (a.D - 40) / 2.2), 10);
      a.log('Added the channel body, the sections of slotted grate, the end caps and the outlet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic roof drain',
    desc: (v) => `Roof drain for a ${v.dia} in pipe with a domed strainer, a flat sump pan, a clamping ring and ${v.over ? 'a raised overflow weir' : 'a flashing flange'}.`,
    vs: [['4 in', 12, 12, 8, 0, { dia: 4, over: 0 }], ['6 in', 16, 16, 8, 0, { dia: 6, over: 0 }], 
      ['8 in, with overflow weir', 22, 22, 10, 0, { dia: 8, over: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 20, r, 28); a.cone(cx, cy, Z0 + 20, Z0 + 60, r * 0.7, r * 0.45, 20);
      a.cyl(cx, cy, Z0, Z0 + 50, v.dia * I / 2, 14); a.cyl(cx, cy, Z0 + 20, Z0 + 40, r * 0.85, 24);
      a.ell(cx, cy, Z1 - (Z1 - Z0 - 60) / 2, r * 0.42, r * 0.42, (Z1 - Z0 - 60) / 2, 18, 6);
      a.circ(cx, cy, r * 0.85, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.42, 'EQUIP-DETAIL');
      if (v.over) { a.cyl(cx, cy, Z0 + 60, Z1 - 20, r * 0.62, 20); a.cyl(cx, cy, Z1 - 20, Z1 - 10, r * 0.66, 20); a.circ(cx, cy, r * 0.62, 'EQUIP-DETAIL'); }
      a.log('Added the flashing flange, the sump pan, the clamping ring, the domed strainer' + (v.over ? ' and the overflow weir' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic floor cleanout',
    desc: (v) => `Floor cleanout for a ${v.dia} in line with a round access cover, a threaded plug with a square drive and a ${v.rect ? 'rectangular' : 'round'} adjustable top.`,
    vs: [['3 in, round top', 5, 5, 4, 0, { dia: 3, rect: 0 }], ['6 in, round top', 8, 8, 4, 0, { dia: 6, rect: 0 }], ['6 in, square top', 8, 8, 4, 0, { dia: 6, rect: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.outline();
      if (v.rect) a.box(X0, YF, Z1 - 10, X1, YB, Z1); else a.cyl(cx, cy, Z1 - 10, Z1, r, 22);
      a.cyl(cx, cy, Z0, Z1 - 10, r * 0.8, 18); a.cyl(cx, cy, Z1 - 16, Z1 - 4, r * 0.55, 14); a.box(cx - 10, cy - 10, Z1 - 4, cx + 10, cy + 10, Z1 + 0.5 > Z1 ? Z1 : Z1);
      a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL'); a.rect(cx - 10, cy - 10, cx + 10, cy + 10, 'EQUIP-DETAIL'); if (!v.rect) a.circ(cx, cy, r);
      a.log('Added the adjustable top, the body, the threaded plug and its square drive (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic service animal relief station',
    desc: (v) => `Service animal relief area ${v.w} by ${v.d} in with a raised curb, an artificial turf pad over a drain, a hose bibb and a wall panel with a waste bag station.`,
    vs: [['24 by 36 in', 24, 36, 40, 0, { }], ['48 by 60 in', 48, 60, 40, 0, {}], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      a.box(X0, YF, Z0, X1, YF + 60, Z0 + 150); a.box(X0, YB - 60, Z0, X1, YB, Z0 + 150); a.box(X0, YF, Z0, X0 + 60, YB, Z0 + 150); a.box(X1 - 60, YF, Z0, X1, YB, Z0 + 150);
      a.box(X0 + 60, YF + 60, Z0, X1 - 60, YB - 60, Z0 + 60); for (let y = YF + 90; y < YB - 80; y += 40) a.line(X0 + 80, y, X1 - 80, y, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0 + 60, Z0 + 66, 70, 14); a.circ(cx, cy, 70, 'EQUIP-DETAIL');
      a.box(X0 + 60, YB - 24, Z0 + 150, X1 - 60, YB, Z1); a.box(X1 - 340, YB - 130, Z0 + 700, X1 - 120, YB - 24, Z0 + 1000); a.rect(X1 - 340, YB - 130, X1 - 120, YB - 24, 'EQUIP-DETAIL');
      a.ycyl(YB - 110, YB - 24, X0 + 200, Z0 + 600, 12, 8); a.xcyl(X0 + 170, X0 + 240, YB - 110, Z0 + 600, 10, 8);
      a.log('Added the curbed enclosure, the turf pad over the drain, the wall panel with its hose bibb and waste bag station (plan and 3D).');
    } }),
  // ===================================================================== fountain features (atriums, plazas, terminals)
  fam({ cat: 'plumbing/fixtures', title: 'Generic tiered fountain',
    desc: (v) => `Round fountain with a ${v.dia} in basin wall, ${v.tiers} stacked ${v.tiers > 1 ? 'bowls' : 'bowl'} on a central column, a rim ledge and a water jet at the top.`,
    vs: [['1 tier, 72 in basin', 72, 72, 48, 0, { dia: 72, tiers: 1 }], ['2 tier, 96 in basin', 96, 96, 84, 0, { dia: 96, tiers: 2 }],
      ['3 tier, 120 in basin', 120, 120, 120, 0, { dia: 120, tiers: 3 }]],
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2, wall = 600; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 80, r, 36); a.cyl(cx, cy, Z0, Z0 + wall, r, 36); a.cyl(cx, cy, Z0 + wall - 60, Z0 + wall + 0.1 + 60, r - 0, 36);
      a.circ(cx, cy, r - 150, 'EQUIP-DETAIL'); const hh = Z1 - Z0 - wall;
      a.cyl(cx, cy, Z0 + 80, Z1 - 150, 70, 14);
      for (let t = 0; t < v.tiers; t++) { const rr = r * (0.55 - t * 0.18) , z = Z0 + wall + (hh - 150) * (t / v.tiers) * 0.85 + 100; a.cone(cx, cy, z, z + 120, rr * 0.35, rr, 28); a.cyl(cx, cy, z + 110, z + 140, rr, 28); a.circ(cx, cy, rr, 'EQUIP-DETAIL'); }
      a.tube([[cx, cy, Z1 - 150], [cx, cy, Z1 - 20]], [30, 12], 8);
      a.log('Added the basin wall with its ledge, the central column, the stacked bowls and the top jet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic linear water feature',
    desc: (v) => `Rectangular water feature ${v.l} in long with a basin wall, a still-water pool and a row of ${v.jets} jets rising from a grate along the centre line.`,
    vs: [['96 in, 5 jets', 96, 36, 30, 0, { l: 96, jets: 5 }], ['192 in, 9 jets', 192, 48, 32, 0, { l: 192, jets: 9 }], ['288 in, 13 jets', 288, 48, 32, 0, { l: 288, jets: 13 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W } = a, wh = 22 * I * 0 + 400; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YF, Z0, X1, YF + 90, Z0 + wh); a.box(X0, YB - 90, Z0, X1, YB, Z0 + wh); a.box(X0, YF, Z0, X0 + 90, YB, Z0 + wh); a.box(X1 - 90, YF, Z0, X1, YB, Z0 + wh);
      a.rect(X0 + 90, YF + 90, X1 - 90, YB - 90, 'EQUIP-DETAIL'); a.box(X0 + 150, cy - 60, Z0 + 60, X1 - 150, cy + 60, Z0 + 140); a.rect(X0 + 150, cy - 60, X1 - 150, cy + 60, 'EQUIP-DETAIL');
      for (let i = 0; i < v.jets; i++) { const x = X0 + 220 + (i * (W - 440)) / (v.jets - 1); a.cyl(x, cy, Z0 + 140, Z0 + 140 + (i % 2 ? 160 : 260), 10, 8); a.circ(x, cy, 10, 'EQUIP-DETAIL'); a.cone(x, cy, Z0 + 140 + (i % 2 ? 160 : 260), Z1 - (i % 2 ? 50 : 0), 10, 6, 6); }
      a.log('Added the basin walls and floor, the grate along the centre line and the row of jets (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic ground jet splash pad',
    desc: (v) => `Flat splash pad ${v.w} by ${v.w} in with a drain-pitched slab, a ring of ${v.n} flush ground jets, a centre nozzle and a perimeter drain channel.`,
    vs: [['72 in, 8 jets', 72, 72, 30, 0, { w: 72, n: 8 }], ['120 in, 12 jets', 120, 120, 36, 0, { w: 120, n: 12 }], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, r = W / 2 - 160; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YF, Z0 + 60, X1, YF + 80, Z0 + 80); a.box(X0, YB - 80, Z0 + 60, X1, YB, Z0 + 80); a.box(X0, YF + 80, Z0 + 60, X0 + 80, YB - 80, Z0 + 80); a.box(X1 - 80, YF + 80, Z0 + 60, X1, YB - 80, Z0 + 80);
      a.rect(X0 + 80, YF + 80, X1 - 80, YB - 80, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const g = (i / v.n) * Math.PI * 2, x = cx + Math.cos(g) * r, y = cy + Math.sin(g) * r; a.cyl(x, y, Z0 + 60, Z0 + 90, 22, 10); a.circ(x, y, 22, 'EQUIP-DETAIL'); a.tube([[x, y, Z0 + 90], [x - Math.cos(g) * 60, y - Math.sin(g) * 60, Z1 - 200]], [10, 6], 6); }
      a.cyl(cx, cy, Z0 + 60, Z1 - 30, 40, 12); a.cone(cx, cy, Z1 - 30, Z1, 40, 8, 8); a.circ(cx, cy, 40, 'EQUIP-DETAIL');
      a.log('Added the slab, the perimeter drain channel, the ring of ground jets with their spray arcs and the centre nozzle (plan and 3D).');
    } }),
  // ===================================================================== kitchen and restroom equipment
  fam({ cat: 'plumbing/equipment', title: 'Generic grease interceptor, under-sink',
    desc: (v) => `Under-counter grease trap rated ${v.gpm} gpm with a bolted lid, an inlet and an outlet connection, four lid bolts and a vent on a rectangular steel body.`,
    vs: [['20 gpm', 20, 14, 12, 0, { gpm: 20 }], ['50 gpm', 28, 18, 16, 0, { gpm: 50 }], ['75 gpm', 34, 20, 18, 0, { gpm: 75 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z1 - 50); a.box(X0 - 0, YF, Z1 - 50, X1, YB, Z1 - 30); a.line(cx, YF, cx, YB, 'EQUIP-HIDDEN');
      for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) { a.cyl(x, y, Z1 - 30, Z1 - 15, 10, 8); a.circ(x, y, 10, 'EQUIP-DETAIL'); }
      a.xcyl(X0 - 0, X0 + 90, cy, Z1 - 140, 26, 10); a.xcyl(X1 - 90, X1, cy, Z1 - 140, 26, 10); a.cyl(X0 + 40, cy, Z1 - 140, Z1 - 20, 20, 8); a.cyl(cx, cy, Z1 - 30, Z1 + 0, 30, 10);
      a.rect(X0 + 25, YF + 25, X1 - 25, YB - 25, 'EQUIP-DETAIL');
      a.log('Added the steel body, the baffle (dashed), the bolted lid, the inlet and outlet connections and the vent (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic in-floor grease interceptor',
    desc: (v) => `Recessed grease interceptor rated ${v.gpm} gpm with a bolted cover plate with four bolts, an internal baffle, inlet and outlet ports and a sampling port, set flush with the floor.`,
    vs: [['50 gpm', 30, 22, 22, 0, { gpm: 50 }], ['75 gpm', 36, 26, 24, 0, { gpm: 75 }], ['150 gpm', 54, 34, 32, 0, { gpm: 150 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 25); a.box(X0, YF, Z0, X1, YF + 25, Z1 - 30); a.box(X0, YB - 25, Z0, X1, YB, Z1 - 30); a.box(X0, YF, Z0, X0 + 25, YB, Z1 - 30); a.box(X1 - 25, YF, Z0, X1, YB, Z1 - 30);
      a.box(X0 - 0, YF, Z1 - 30, X1, YB, Z1); a.rect(X0 + 25, YF + 25, X1 - 25, YB - 25, 'EQUIP-DETAIL');
      for (const x of [X0 + 80, X1 - 80]) for (const y of [YF + 80, YB - 80]) { a.cyl(x, y, Z1, Z1 + 0.5, 14, 8); a.circ(x, y, 14, 'EQUIP-DETAIL'); }
      a.box(cx - 25, YF + 25, Z0 + 80, cx + 25, YB - 25, Z1 - 100); a.line(cx, YF + 25, cx, YB - 25, 'EQUIP-HIDDEN');
      a.xcyl(X0 - 60, X0 + 25, cy, Z1 - 150, 24, 10); a.xcyl(X1 - 25, X1 + 60, cy, Z1 - 150, 24, 10); a.ycyl(YF - 20, YF + 25, cx, Z0 + (Z1 - Z0) * 0.5, 20, 10); a.box(cx - 100, YF - 4, Z0 + 60, cx + 100, YF, Z0 + 140);
      a.log('Added the tank walls and floor, the internal baffle, the bolted cover with its screws, the inlet and outlet ports and the sampling port (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic buried grease tank',
    desc: (v) => `Horizontal underground grease tank of ${v.gal} gal lying along its length, with two risers up to cast covers, an inlet and outlet at the ends and a centre baffle.`,
    vs: [['1,000 gal', 120, 64, 78, 0, { gal: '1,000' }], ['2,000 gal', 180, 78, 92, 0, { gal: '2,000' }], ['3,000 gal', 216, 90, 104, 0, { gal: '3,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, rd = D / 2 - 20, zc = Z0 + rd + 20; a.outline();
      a.xcyl(X0 + 40, X1 - 40, cy, zc, rd, 24); a.ell(X0 + 40, cy, zc, 40, rd, rd, 16, 8); a.ell(X1 - 40, cy, zc, 40, rd, rd, 16, 8);
      for (const x of [X0 + W * 0.25, X1 - W * 0.25]) { a.cyl(x, cy, zc, Z1 - 30, 300, 18); a.cyl(x, cy, Z1 - 30, Z1, 340, 18); a.circ(x, cy, 340, 'EQUIP-DETAIL'); a.circ(x, cy, 300, 'EQUIP-HIDDEN'); }
      a.xcyl(X0, X0 + 60, cy, zc + rd * 0.5, 60, 12); a.xcyl(X1 - 60, X1, cy, zc + rd * 0.3, 60, 12);
      a.box(cx - 15, cy - rd, Z0 + 30, cx + 15, cy + rd, zc + rd * 0.7); a.line(cx, cy - rd, cx, cy + rd, 'EQUIP-HIDDEN'); a.line(X0 + 40, cy - rd, X1 - 40, cy - rd); a.line(X0 + 40, cy + rd, X1 - 40, cy + rd);
      a.log('Added the cylindrical tank with domed ends, two risers with cast covers, the inlet and outlet ports and the baffle (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic commercial tank water heater',
    desc: (v) => `Vertical insulated ${v.gal} gal tank on a base with a domed top, hot and cold connections with unions, a relief valve, a flue hood with a vent, a front control box and a drain.`,
    vs: [['50 gal', 22, 22, 56, 0, { gal: 50 }], ['100 gal', 30, 30, 62, 0, { gal: 100 }], ['119 gal', 30, 30, 74, 0, { gal: 119 }], ['200 gal', 36, 36, 78, 0, { gal: 200 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2, vent = 150, tz = Z1 - 60 - vent; a.outline(); a.circ(cx, cy, r);
      a.cyl(cx, cy, Z0, Z0 + 100, r - 60, 20); a.cyl(cx, cy, Z0 + 100, tz - 80, r - 8, 32); a.ell(cx, cy, tz - 80, r - 8, r - 8, 80, 28, 5);
      a.cyl(cx, cy, tz, Z1 - 60, 70, 14); a.cone(cx, cy, Z1 - 60, Z1, 70, 40, 14);
      for (const dx of [-r * 0.5, r * 0.15]) { a.cyl(cx + dx, cy + r * 0.2, tz - 60, tz + 100, 20, 8); a.cyl(cx + dx, cy + r * 0.2, tz + 20, tz + 50, 28, 8); }
      a.cyl(cx + r * 0.55, cy + r * 0.2, tz - 200, tz + 40, 12, 8); a.circ(cx - r * 0.5, cy + r * 0.2, 20, 'EQUIP-DETAIL');
      a.box(cx - 140, YF - 0, Z0 + 250, cx + 140, YF + 60, Z0 + 650); a.cyl(cx + r * 0.7, cy - r * 0.5, Z0 + 150, Z0 + 260, 14, 8); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
      a.log('Added the base, the insulated tank with its domed top, the connections and relief valve, the flue hood with its vent, the control box and the drain (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic tankless water heater bank',
    desc: (v) => `${v.n} wall-hung tankless heaters side by side on a common frame with a shared inlet manifold, a shared outlet manifold, a front display on each unit and a vent pipe from each.`,
    vs: [1, 2, 4].map((n) => [`${n} unit${n > 1 ? 's' : ''}`, 18 * n + 6, 12, 40, 30, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, pw = (W - 80) / v.n; a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1);
      for (let i = 0; i < v.n; i++) { const x0 = X0 + 40 + i * pw + 15, x1 = X0 + 40 + (i + 1) * pw - 15, cx = (x0 + x1) / 2;
        a.box(x0, YF + 20, Z0 + 260, x1, YB - 40, Z1 - 100); a.box(x0 + 40, YF, Z1 - 380, x1 - 40, YF + 20, Z1 - 240); a.rect(x0, YF + 20, x1, YB - 40, 'EQUIP-DETAIL');
        a.cyl(cx, YB - 100, Z1 - 100, Z1, 40, 12); a.circ(cx, YB - 100, 40, 'EQUIP-DETAIL'); a.cyl(cx - 60, YB - 90, Z0 + 140, Z0 + 260, 12, 8); a.cyl(cx + 60, YB - 90, Z0 + 140, Z0 + 260, 12, 8); }
      a.xcyl(X0 + 60, X1 - 60, YB - 90, Z0 + 140, 18, 10); a.xcyl(X0 + 60, X1 - 60, YB - 90, Z0 + 70, 18, 10); a.cyl(X0 + 60, YB - 90, Z0, Z0 + 140, 18, 8); a.cyl(X1 - 60, YB - 90, Z0, Z0 + 70, 18, 8);
      a.log('Added the back frame, one heater body with display and vent per unit, and the shared inlet and outlet manifolds (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hot water storage tank',
    desc: (v) => `Vertical ${v.gal} gal storage tank on three legs with domed ends, four side connections and a manway plate.`,
    vs: [['120 gal', 24, 24, 62, 0, { gal: 120 }], ['250 gal', 30, 30, 80, 0, { gal: 250 }], ['1,000 gal', 48, 48, 108, 0, { gal: '1,000' }]],
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2, leg = 250; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      for (let i = 0; i < 3; i++) { const g = (i / 3) * Math.PI * 2 + 0.5, x = cx + Math.cos(g) * r * 0.7, y = cy + Math.sin(g) * r * 0.7; a.leg(x, y, Z0, Z0 + leg, 22); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
      a.cyl(cx, cy, Z0 + leg + 80, Z1 - 80, r, 36); a.ell(cx, cy, Z1 - 80, r, r, 80, 28, 5); a.ell(cx, cy, Z0 + leg + 80, r, r, 80, 28, 5);
      for (let i = 0; i < 4; i++) { const g = i * 1.6 + 0.3, z = i % 2 ? Z1 - 350 : Z0 + leg + 350; a.tube([[cx + Math.cos(g) * r, cy + Math.sin(g) * r, z], [cx + Math.cos(g) * (r + 70), cy + Math.sin(g) * (r + 70), z]], [24, 24], 8); }
      a.cyl(cx + r * 0.3, cy, Z1, Z1 + 0.1, 5, 4); a.ycyl(cy, cy + r + 40, cx - r * 0.2, Z0 + leg + 900 < Z1 - 100 ? Z0 + leg + 900 : Z1 - 300, 50, 12); a.circ(cx - r * 0.2, cy + r, 50, 'EQUIP-DETAIL');
      a.log('Added the three legs, the cylindrical shell with domed ends, the connections and the manway plate (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic expansion tank',
    desc: (v) => `Vertical diaphragm expansion tank of ${v.gal} gal on a round stand with a connection at the base and an air valve cap on top.`,
    vs: [['2 gal', 8, 8, 14, 0, { gal: 2 }], ['8 gal', 12, 12, 24, 0, { gal: 8 }], ['20 gal', 16, 16, 34, 0, { gal: 20 }], ['30 gal', 18, 18, 38, 0, { gal: 30 }]],
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 20, r * 0.8, 20); a.cyl(cx, cy, Z0 + 20, Z0 + 70, r * 0.55, 16); a.cyl(cx, cy, Z0 + 70, Z1 - r * 0.35, r, 28); a.ell(cx, cy, Z1 - r * 0.35, r, r, r * 0.35, 24, 5);
      a.cyl(cx, cy, Z1 - 12, Z1, 10, 8); a.cyl(cx + r * 0.6, cy, Z0 + 70, Z0 + 50, 8, 6); a.circ(cx, cy, r * 0.55, 'EQUIP-DETAIL');
      a.xcyl(cx - r * 0.2, cx + r * 0.9, cy, Z0 + 45, 8, 8);
      a.log('Added the stand, the cylindrical shell with a domed top, the base connection and the air valve cap (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic booster pump set',
    desc: (v) => `Skid-mounted domestic booster set with ${v.n} pump${v.n > 1 ? 's' : ''} and motors in a row, suction and discharge manifolds, a diaphragm tank and a control panel.`,
    vs: [['simplex', 52, 28, 52, 0, { n: 1 }], ['duplex', 72, 34, 56, 0, { n: 2 }], ['triplex', 90, 40, 60, 0, { n: 3 }], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 70);
      const pitch = (W - 700) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 120 + pitch * (i + 0.5); M.pumpSet(a, x, cy, Z0 + 70, Math.min(360, pitch - 20)); }
      a.ycyl(YF + 60, YB - 60, X1 - 620, Z0 + 460, 45, 12); a.ycyl(YF + 60, YB - 60, X1 - 560, Z0 + 330, 45, 12);
      a.cyl(X1 - 280, cy, Z0 + 70, Z1 - 200, Math.min(200, D / 2 - 30), 22); a.ell(X1 - 280, cy, Z1 - 200, Math.min(200, D / 2 - 30), Math.min(200, D / 2 - 30), 80, 18, 5); a.circ(X1 - 280, cy, Math.min(200, D / 2 - 30), 'EQUIP-DETAIL');
      a.box(X1 - 140, YB - 90, Z0 + 70, X1 - 40, YB - 30, Z1 - 100); a.box(X1 - 160, YB - 100, Z0 + 700, X1 - 20, YB - 90, Z0 + 1000);
      a.log('Added the skid, a pump and motor set for each pump, the two manifolds, the diaphragm tank and the control panel (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic reduced pressure backflow assembly',
    desc: (v) => `${v.dia} in reduced pressure assembly: through pipe, two check valves in a body, a relief valve below, two shutoff valves and four test cocks.`,
    vs: [['3/4 in', 14, 6, 10, 0, { dia: 0.75 }], ['2 in', 28, 9, 14, 0, { dia: 2 }], ['4 in', 46, 14, 24, 0, { dia: 4 }], ['6 in', 60, 18, 30, 0, { dia: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.28, (Z1 - Z0) * 0.22), zc = Z0 + (Z1 - Z0) * 0.55; a.outline();
      a.xcyl(X0, X1, cy, zc, r, 16);
      for (const f of [0.17, 0.83]) { a.ell(X0 + W * f, cy, zc, r * 1.4, r * 1.4, r * 1.4, 12, 6); a.cyl(X0 + W * f, cy, zc + r * 1.2, Z1, r * 0.3, 8); a.xcyl(X0 + W * f - r * 0.8, X0 + W * f + r * 0.8, cy, Z1, r * 0.25, 6); }
      a.xcyl(X0 + W * 0.3, X0 + W * 0.7, cy, zc, r * 1.7, 20); a.cone(cx, cy, Z0 + (Z1 - Z0) * 0.12, zc - r, r * 0.5, r * 0.9, 12);
      for (const f of [0.4, 0.46, 0.54, 0.6]) { a.cyl(X0 + W * f, cy, zc + r, zc + r * 2, r * 0.15, 6); }
      a.circ(cx, cy, r * 1.5, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy);
      a.log('Added the through pipe, the two shutoff valves, the check valve body, the relief valve below and the test cocks (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic double check backflow assembly',
    desc: (v) => `${v.dia} in double check assembly: through pipe with two check bodies in line, two shutoff valves with handles and four test cocks.`,
    vs: [['2 in', 26, 8, 13, 0, { dia: 2 }], ['4 in', 42, 12, 20, 0, { dia: 4 }], ['8 in', 68, 20, 34, 0, { dia: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.28, (Z1 - Z0) * 0.2), zc = Z0 + (Z1 - Z0) * 0.4; a.outline();
      a.xcyl(X0, X1, cy, zc, r, 16);
      for (const f of [0.14, 0.86]) { a.ell(X0 + W * f, cy, zc, r * 1.4, r * 1.4, r * 1.4, 12, 6); a.cyl(X0 + W * f, cy, zc + r, zc + r * 2.6, r * 0.25, 6); a.xcyl(X0 + W * f - r * 1.0, X0 + W * f + r * 1.0, cy, zc + r * 2.6, r * 0.2, 6); }
      for (const f of [0.33, 0.67]) { a.ell(X0 + W * f, cy, zc + r * 0.3, r * 1.5, r * 1.5, r * 1.5, 12, 6); a.ell(X0 + W * f, cy, zc + r * 1.5, r * 0.9, r * 0.9, r * 0.5, 10, 4); }
      for (const f of [0.28, 0.38, 0.62, 0.72]) a.cyl(X0 + W * f, cy, zc + r * 1.2, Z1, r * 0.15, 6);
      a.circ(X0 + W * 0.33, cy, r * 1.5, 'EQUIP-DETAIL'); a.circ(X0 + W * 0.67, cy, r * 1.5, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy);
      a.log('Added the through pipe, the two shutoff valves with handles, the two check valve bodies and the test cocks (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic water meter set',
    desc: (v) => `${v.dia} in meter set with an inlet and outlet shutoff, a strainer, a disc meter body with a register head, a bypass loop and a pipe support.`,
    vs: [['1 in', 24, 8, 16, 0, { dia: 1 }], ['2 in', 36, 12, 20, 0, { dia: 2 }], ['4 in', 60, 20, 32, 0, { dia: 4 }], ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.17, 90), zc = Z0 + (Z1 - Z0) * 0.35, yb = YB - D * 0.25, yf = YF + D * 0.25; a.outline();
      a.xcyl(X0, X1, yb, zc, r, 14); a.xcyl(X0 + W * 0.2, X1 - W * 0.2, yf, zc, r, 14); a.ycyl(yf, yb, X0 + W * 0.2, zc, r, 12); a.ycyl(yf, yb, X1 - W * 0.2, zc, r, 12);
      a.ell(cx, yb, zc, r * 2.2, r * 1.7, r * 1.7, 14, 8); a.cyl(cx, yb, zc + r * 1.2, Z1 - r, r * 1.0, 14); a.ell(cx, yb, Z1 - r, r * 1.3, r * 1.3, r, 12, 6);
      for (const f of [0.1, 0.9]) { a.ell(X0 + W * f, yb, zc, r * 1.4, r * 1.4, r * 1.4, 10, 6); a.cyl(X0 + W * f, yb, zc + r, zc + r * 2.4, r * 0.25, 6); }
      a.ell(X0 + W * 0.28, yb, zc + r * 0.2, r * 1.3, r * 1.3, r * 1.3, 10, 6);
      a.box(cx - 40, yf - 40, Z0, cx + 40, yf + 40, zc - r); a.circ(cx, yb, r * 1.6, 'EQUIP-DETAIL'); a.line(X0, yb, X1, yb); a.line(X0 + W * 0.2, yf, X1 - W * 0.2, yf);
      a.log('Added the through pipe, the shutoff valves, the strainer, the meter body with its register head, the bypass loop and the pipe support (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hot water recirculation pump',
    desc: (v) => `Inline bronze circulator with a ${v.fl} in flanged body, a round motor on top with a terminal box, and a pair of flanges.`,
    vs: [['1 in flanged', 10, 8, 12, 0, { fl: 1 }], ['2 in flanged', 14, 10, 16, 0, { fl: 2 }], ['3 in flanged', 18, 13, 20, 0, { fl: 3 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.2, 60), zc = Z0 + (Z1 - Z0) * 0.3; a.outline();
      a.xcyl(X0, X1, cy, zc, r, 14); a.ell(cx, cy, zc, W * 0.18, r * 1.7, r * 1.7, 14, 8);
      for (const x of [X0 + 14, X1 - 14]) { a.xcyl(x - 14, x + 14, cy, zc, r * 1.7, 16); a.circ(x, cy, 0.1, 'EQUIP-DETAIL'); }
      a.cyl(cx, cy, zc + r * 1.2, Z1 - 40, Math.min(D * 0.38, W * 0.2), 20); a.cyl(cx, cy, Z1 - 40, Z1, Math.min(D * 0.38, W * 0.2) * 0.8, 20); a.box(cx + W * 0.05, cy - 30, zc + r * 2.5, cx + W * 0.2, cy + 30, zc + r * 2.5 + 70);
      a.circ(cx, cy, Math.min(D * 0.38, W * 0.2), 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy);
      a.log('Added the through body with its flanges, the volute, the motor housing and the terminal box (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic sewage ejector pit',
    desc: (v) => `${v.n === 2 ? 'Duplex' : 'Simplex'} below-floor sewage pit ${v.dia} in across with a gasketed cover, ${v.n} pump access plate${v.n > 1 ? 's' : ''}, a vent collar and a discharge riser.`,
    vs: [['simplex, 36 in', 36, 36, 6, 0, { n: 1, dia: 36 }], ['duplex, 48 in', 48, 48, 6, 0, { n: 2, dia: 48 }], ['duplex, 72 in', 72, 72, 8, 0, { n: 2, dia: 72 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2; a.circ(cx, cy, r);
      a.cyl(cx, cy, Z0, Z1 - 20, r * 0.98, 28); a.cyl(cx, cy, Z1 - 20, Z1, r, 28);
      for (let i = 0; i < v.n; i++) { const x = v.n === 1 ? cx : cx + (i ? 1 : -1) * r * 0.42; a.cyl(x, cy, Z1, Z1 + 0.5, r * 0.3, 18); a.circ(x, cy, r * 0.3, 'EQUIP-DETAIL'); for (let k = 0; k < 6; k++) { const g = (k / 6) * Math.PI * 2; a.circ(x + Math.cos(g) * r * 0.25, cy + Math.sin(g) * r * 0.25, 5, 'EQUIP-DETAIL'); } }
      a.cyl(cx, cy + r * 0.7, Z1, Z1, 1, 3); a.circ(cx, cy + r * 0.72, 40, 'EQUIP-DETAIL'); a.circ(cx, cy - r * 0.72, 30, 'EQUIP-DETAIL');
      a.log('Added the pit shell, the gasketed cover, the pump access plates and the vent and discharge collars (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic duplex water softener',
    desc: (v) => `Two resin tanks ${v.dia} in across with control heads, a brine tank between them with a lid, a bypass valve and a shared header on the back.`,
    vs: [['9 in tanks', 36, 24, 52, 0, { dia: 9 }], ['12 in tanks', 44, 26, 58, 0, { dia: 12 }], ['16 in tanks', 60, 30, 70, 0, { dia: 16 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(v.dia * I / 2, D * 0.3, W * 0.2); a.outline();
      const x1 = X0 + r + 60, x2 = X1 - r - 60, yy = YB - r - 60;
      for (const x of [x1, x2]) { a.cyl(x, yy, Z0, Z1 - 140, r, 22); a.ell(x, yy, Z1 - 140, r, r, 100, 18, 5); a.box(x - 70, yy - 70, Z1 - 140, x + 70, yy + 70, Z1 - 20); a.box(x - 50, yy - 80, Z1 - 100, x + 50, yy - 70, Z1 - 40); a.circ(x, yy, r); a.circ(x, yy, r * 0.5, 'EQUIP-DETAIL'); }
      a.ycyl(yy + r - 20, yy + r + 20, x1, Z1 - 200, 14, 8); a.xcyl(x1, x2, YB - 40, Z1 - 200, 16, 10); a.xcyl(x1, x2, YB - 40, Z0 + 400, 16, 10); a.cyl(x1, YB - 40, Z0 + 400, Z1 - 200, 16, 8); a.cyl(x2, YB - 40, Z0 + 400, Z1 - 200, 16, 8);
      a.box(cx - 150, YF + 40, Z0, cx + 150, cy + 60, Z0 + 600); a.box(cx - 160, YF + 30, Z0 + 600, cx + 160, cy + 70, Z0 + 640); a.rect(cx - 150, YF + 40, cx + 150, cy + 60);
      a.log('Added the two resin tanks with control heads, the brine tank and lid, the shared header and the bypass valve (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic pressure reducing valve station',
    desc: (v) => `${v.dia} in station with a reducing valve and a parallel bypass, an isolation valve each side, two gauges and a strainer on a common pipe frame.`,
    vs: [['1 in', 30, 14, 16, 0, { dia: 1 }], ['2 in', 42, 20, 20, 0, { dia: 2 }], ['4 in', 66, 32, 32, 0, { dia: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.1, 60), zc = Z0 + (Z1 - Z0) * 0.3, yb = YB - D * 0.22, yf = YF + D * 0.22; a.outline();
      a.xcyl(X0, X1, yb, zc, r, 14); a.xcyl(X0 + W * 0.1, X1 - W * 0.1, yf, zc, r, 14); a.ycyl(yf, yb, X0 + W * 0.1, zc, r, 10); a.ycyl(yf, yb, X1 - W * 0.1, zc, r, 10);
      a.ell(cx, yb, zc + r * 0.4, W * 0.07, r * 2.3, r * 2.3, 14, 8); a.cyl(cx, yb, zc + r * 1.8, Z1 - 120, r * 1.3, 14); a.ell(cx, yb, Z1 - 120, r * 1.5, r * 1.5, r * 0.6, 12, 5);
      for (const f of [0.22, 0.78]) { a.ell(X0 + W * f, yb, zc, r * 1.6, r * 1.6, r * 1.6, 10, 6); a.cyl(X0 + W * f, yb, zc + r, zc + r * 2.2, r * 0.25, 6); }
      for (const f of [0.35, 0.65]) { a.cyl(X0 + W * f, yb, zc + r, Z1 - 40, 6, 6); a.ell(X0 + W * f, yb, Z1 - 40, 40, 14, 40, 10, 5); }
      a.ell(X0 + W * 0.45, yf, zc, r * 1.6, r * 1.6, r * 1.6, 10, 6); a.circ(cx, yb, r * 1.8, 'EQUIP-DETAIL'); a.line(X0, yb, X1, yb); a.line(X0 + W * 0.1, yf, X1 - W * 0.1, yf);
      a.log('Added the main line with the reducing valve, the bypass loop, the isolation valves, the gauges and the strainer (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic water filter manifold',
    desc: (v) => `Wall-mounted filter manifold with ${v.n} cartridge housing${v.n > 1 ? 's' : ''}, a shared inlet and outlet head, pressure gauges and a mounting rail.`,
    vs: [1, 2, 4].map((n) => [`${n} housing${n > 1 ? 's' : ''}`, 10 * n + 8, 10, 28, 24, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 20, Z0, X1, YB, Z1); const pw = (W - 60) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 30 + pw * (i + 0.5), r = Math.min(pw * 0.38, 110); a.cyl(x, YB - r - 40, Z0 + 20, Z1 - 200, r, 18); a.cone(x, YB - r - 40, Z1 - 200, Z1 - 170, r, r * 0.6, 16); a.box(x - r * 0.7, YB - r - 40 - r * 0.7, Z1 - 170, x + r * 0.7, YB - r - 40 + r * 0.7, Z1 - 100); a.circ(x, YB - r - 40, r); a.circ(x, YB - r - 40, r * 0.5, 'EQUIP-DETAIL'); }
      a.xcyl(X0 + 20, X1 - 20, YB - 60, Z1 - 70, 14, 8); a.ell(X0 + 60, YB - 60, Z1 - 20, 20, 20, 20, 8, 4); a.ell(X1 - 60, YB - 60, Z1 - 20, 20, 20, 20, 8, 4);
      a.log('Added the mounting rail, a cartridge housing with its head for each position, the shared header and the gauges (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic gas meter set',
    desc: (v) => `Gas meter set for ${v.cfh} cfh with an inlet valve, a regulator, a diaphragm meter body with a dial, an outlet valve and an upright support.`,
    vs: [['250 cfh', 30, 14, 36, 0, { cfh: 250 }], ['2,000 cfh', 52, 24, 54, 0, { cfh: '2,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.07, 50), zc = Z1 - (Z1 - Z0) * 0.25; a.outline();
      a.box(cx - W * 0.17, cy - D * 0.3, Z0 + (Z1 - Z0) * 0.18, cx + W * 0.17, cy + D * 0.3, Z1 - (Z1 - Z0) * 0.3); a.ell(cx, cy, Z1 - (Z1 - Z0) * 0.3, W * 0.17, D * 0.3, 40, 14, 5); a.cyl(cx, cy - D * 0.1, Z1 - (Z1 - Z0) * 0.3, zc, r, 10);
      a.xcyl(X0, cx - W * 0.1, cy - D * 0.1, zc, r, 12); a.xcyl(cx + W * 0.1, X1, cy - D * 0.1, zc, r, 12);
      a.ell(X0 + W * 0.18, cy - D * 0.1, zc, r * 2.2, r * 2.2, r * 2.2, 12, 6); a.cyl(X0 + W * 0.18, cy - D * 0.1, zc + r, zc + r * 3, r * 0.5, 8);
      a.ell(X1 - W * 0.12, cy - D * 0.1, zc, r * 1.7, r * 1.7, r * 1.7, 12, 6); a.cyl(cx, cy - D * 0.3 - 10, Z0 + (Z1 - Z0) * 0.4, Z0 + (Z1 - Z0) * 0.4 + 0.1, 2, 4);
      a.ell(cx, YF + D * 0.2, Z1 - (Z1 - Z0) * 0.4, W * 0.07, 6, W * 0.07, 12, 5); a.box(X0 + W * 0.05, YB - 30, Z0, X0 + W * 0.05 + 40, YB, zc); a.box(X1 - W * 0.05 - 40, YB - 30, Z0, X1 - W * 0.05, YB, zc);
      a.circ(cx, cy, 0.1, 'EQUIP-DETAIL'); a.rect(cx - W * 0.17, cy - D * 0.3, cx + W * 0.17, cy + D * 0.3, 'EQUIP-DETAIL'); a.line(X0, cy - D * 0.1, X1, cy - D * 0.1);
      a.log('Added the inlet and outlet pipes, the regulator, the meter body with its dial and the wall supports (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic thermostatic mixing valve assembly',
    desc: (v) => `${v.dia} in mixing valve with a temperature dial, hot and cold ball valves with handles and a mixed outlet valve on a back rail.`,
    vs: [['3/4 in', 12, 7, 11, 24, { dia: 0.75 }], ['2 in', 28, 12, 18, 24, { dia: 2 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = Math.min(D * 0.12, 35); a.outline();
      a.box(X0, YB - 15, Z0, X1, YB, Z1);
      a.ell(cx, cy, Z0 + (Z1 - Z0) * 0.45, W * 0.12, D * 0.3, D * 0.3, 14, 8); a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.45, Z1 - 20, D * 0.2, 14); a.cyl(cx, cy, Z1 - 20, Z1, D * 0.25, 14); a.circ(cx, cy, D * 0.25, 'EQUIP-DETAIL');
      for (const [x, z] of [[X0, 0.2], [X1, 0.2], [cx, 0.8]]) { if (z < 0.5) { a.xcyl(x < cx ? X0 : cx + W * 0.1, x < cx ? cx - W * 0.1 : X1, cy, Z0 + (Z1 - Z0) * 0.45, r, 10); } }
      a.cyl(cx, cy, Z0, Z0 + (Z1 - Z0) * 0.3, r, 10);
      for (const x of [X0 + W * 0.15, X1 - W * 0.15]) { a.ell(x, cy, Z0 + (Z1 - Z0) * 0.45, r * 1.5, r * 1.5, r * 1.5, 10, 6); a.cyl(x, cy, Z0 + (Z1 - Z0) * 0.45 + r, Z0 + (Z1 - Z0) * 0.45 + r * 2.4, r * 0.25, 6); }
      a.ell(cx, cy, Z0 + (Z1 - Z0) * 0.1, r * 1.5, r * 1.5, r * 1.5, 10, 6); a.line(X0, cy, X1, cy);
      a.log('Added the wall rail, the valve body with its temperature dial, the hot and cold ball valves and the mixed outlet (plan and 3D).');
    } }),
];
