/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r5-people.mjs — round 5, block people (2026-11-03): scale figures for hospitals, construction, mining, excavation and aviation. 250 variants.
 * Every figure is a generic scale figure (a stand-in for a person, not a person's measurements). Singles use the lofted figure2; groups, seated and
 * lying figures use `mini`, a lighter figure built from tubes and ellipsoids so a group stays a sensible size.
 */
import { fam, Acc } from './r4-kit.mjs';
import { figure2 } from './figure.mjs';
import { loft } from './com-core.mjs';

const IN = 25.4;
const HT = [61, 67, 73];
const hv = (cfgs, hts = HT) => cfgs.flatMap(([lab, w, d, ex = 0, p = {}]) => hts.map((ht) => [`${lab}, ${ht} in tall`, w, d, Math.round((ht * (p.k ?? 1) + ex) * 2) / 2, 0, { ...p, ht }]));

function planOf(a, plan) {
  for (const sh of plan) {
    if (sh.kind === 'ellipse') a.ellp(sh.x, sh.y, sh.rx, sh.ry); else if (sh.kind === 'circle') a.circ(sh.x, sh.y, sh.r);
    else if (sh.kind === 'rect') a.rect(sh.x0, sh.y0, sh.x1, sh.y1); else if (sh.kind === 'line') a.line(sh.x1, sh.y1, sh.x2, sh.y2);
  }
}

/** A lofted figure (standing or walking), ht in inches, offset dx/dy in mm. Returns the scale and the hand position. */
function fig(a, ht, o = {}) {
  const h = ht * IN, s = h / 1732, cx = a.cx + (o.dx ?? 0), cy = a.cy + (o.dy ?? 0), pose = o.pose ?? 'stand';
  const f = figure2({ pose, scale: s, cx, cy, hi: !o.lo });
  a.add(f.tris); planOf(a, f.plan);
  const hz = 1630 * s;
  if (o.hat === 'toque') { a.cyl(cx, cy, hz - 20 * s, hz + 120 * s, 105 * s, 16); a.ell(cx, cy, hz + 120 * s, 130 * s, 130 * s, 90 * s, 16, 6); a.circ(cx, cy, 120 * s, 'EQUIP-DETAIL'); }
  if (o.hat === 'cap') { a.cyl(cx, cy, hz - 10 * s, hz + 60 * s, 100 * s, 16); a.box(cx - 90 * s, cy - 190 * s, hz - 5 * s, cx + 90 * s, cy - 90 * s, hz + 15 * s); }
  if (o.hat === 'hardhat') { a.ell(cx, cy, hz + 10 * s, 120 * s, 130 * s, 90 * s, 16, 6); a.box(cx - 130 * s, cy - 160 * s, hz + 5 * s, cx + 130 * s, cy + 130 * s, hz + 22 * s); }
  if (o.hat === 'peaked') { a.cyl(cx, cy, hz - 10 * s, hz + 90 * s, 112 * s, 18); a.cyl(cx, cy, hz + 90 * s, hz + 100 * s, 128 * s, 18); a.box(cx - 100 * s, cy - 215 * s, hz - 5 * s, cx + 100 * s, cy - 105 * s, hz + 14 * s); a.cyl(cx, cy, hz + 5 * s, hz + 28 * s, 114 * s, 18); }
  if (o.vest) { a.ell(cx, cy, 1160 * s, 192 * s, 118 * s, 270 * s, 14, 7); a.box(cx - 170 * s, cy - 122 * s, 1020 * s, cx + 170 * s, cy - 112 * s, 1050 * s); a.box(cx - 170 * s, cy - 122 * s, 1180 * s, cx + 170 * s, cy - 112 * s, 1210 * s); }
  return { s, cx, cy, hand: [cx + 240 * s, cy - 30 * s, 920 * s], lhand: [cx - 215 * s, cy - (pose === 'walk' ? 260 : 40) * s, 900 * s] };
}

function torso(a, x, y, zp, P) {   // pelvis centre height zp up to the neck: lofted sections, wider at the chest
  const S = [[0, 150, 95], [100, 165, 100], [220, 178, 108], [350, 182, 110], [470, 170, 100], [520, 90, 70], [560, 52, 52]];
  a.add(loft(S.map(([dz, rx, ry]) => ({ z: zp + P(dz), x, y, rx: P(rx), ry: P(ry) })), 14));
}

/** A light figure: stand | walk | sit | lie. (x, y) plan centre in mm, h the standing height in mm, z0 the floor (or bench top) height. */
function mini(a, o) {
  const { x, y, h } = o, pose = o.pose ?? 'stand', u = h / 1700, P = (v) => v * u, z0 = o.z ?? a.Z0, seg = 8;
  const head = (hx, hy, hz) => { a.ell(hx, hy, hz, P(85), P(100), P(115), 10, 7); a.cyl(hx, hy + P(8), hz - P(150), hz - P(60), P(48), 8); };
  if (pose === 'lie') {   // along y, head at the back
    const z = z0 + P(110);
    a.ell(x, y, z, P(190), P(150), P(100), 10, 6); a.ell(x, y + P(300), z + P(10), P(200), P(260), P(110), 12, 6);
    a.ell(x, y + P(760), z + P(20), P(100), P(115), P(85), 10, 6);
    for (const s of [-1, 1]) {
      a.tube([[x + s * P(90), y - P(40), z], [x + s * P(95), y - P(480), z - P(10)], [x + s * P(95), y - P(900), z - P(20)]], [P(78), P(58), P(45)], seg);
      a.box(x + s * P(95) - P(45), y - P(1010), z - P(60), x + s * P(95) + P(45), y - P(880), z + P(25));
      a.tube([[x + s * P(215), y + P(380), z + P(30)], [x + s * P(240), y + P(100), z + P(30)], [x + s * P(220), y - P(150), z + P(10)]], [P(42), P(36), P(30)], 6);
    }
    a.ellp(x, y + P(300), P(210), P(260)); a.circ(x, y + P(760), P(100)); a.rect(x - P(190), y - P(1010), x + P(190), y - P(40), 'EQUIP-DETAIL');
    return;
  }
  if (pose === 'sit') {
    const seat = o.seat ?? P(450), hz = z0 + seat, fz = o.feet ?? z0, th = o.facing ?? -1;   // thighs forward (−y)
    torso(a, x, y, hz, P);
    head(x, y - P(10), hz + P(670));
    for (const s of [-1, 1]) {
      a.tube([[x + s * P(90), y, hz + P(70)], [x + s * P(95), y - P(380), hz + P(80)]], [P(78), P(56)], seg);
      a.tube([[x + s * P(95), y - P(390), hz + P(70)], [x + s * P(95), y - P(420), fz + P(70)]], [P(52), P(38)], seg);
      a.box(x + s * P(95) - P(48), y - P(560), fz, x + s * P(95) + P(48), y - P(390), fz + P(60));
      a.tube([[x + s * P(190), y, hz + P(610)], [x + s * P(215), y - P(60), hz + P(290)], [x + s * P(185), y - P(330), hz + P(250)]], [P(44), P(38), P(30)], 6);
    }
    a.ellp(x, y, P(190), P(105)); a.circ(x, y - P(10), P(92));
    for (const s of [-1, 1]) a.rect(x + s * P(95) - P(55), y - P(560), x + s * P(95) + P(55), y, 'EQUIP-DETAIL');
    return;
  }
  const hip = P(900), step = pose === 'walk' ? P(150) : 0;
  for (const s of [-1, 1]) {
    const f = pose === 'walk' ? (s < 0 ? -1 : 1) * step : 0;
    a.tube([[x + s * P(95), y + f, z0 + P(70)], [x + s * P(95), y + f * 0.4, z0 + hip]], [P(50), P(80)], seg);
    a.box(x + s * P(95) - P(55), y + f - P(190), z0, x + s * P(95) + P(55), y + f + P(40), z0 + P(70));
    const sw = pose === 'walk' ? -f * 0.7 : 0;
    a.tube([[x + s * P(195), y, z0 + P(1390)], [x + s * P(215), y + sw * 0.5, z0 + P(1130)], [x + s * P(215), y + sw, z0 + P(880)]], [P(46), P(38), P(30)], 6);
  }
  torso(a, x, y, z0 + P(880), P);
  head(x, y - P(5), z0 + P(1610));
  a.ellp(x, y, P(190), P(105)); a.circ(x, y - P(5), P(92));
  if (pose === 'walk') for (const s of [-1, 1]) a.line(x + s * P(95), y + (s < 0 ? -1 : 1) * step - P(190), x + s * P(95), y + (s < 0 ? -1 : 1) * step + P(40), 'EQUIP-DETAIL');
}

// ---- props ----
function tray(a, x, y, z, r, items = 3) {
  a.cyl(x, y, z, z + 18, r, 20); a.circ(x, y, r, 'EQUIP-DETAIL');
  for (let i = 0; i < items; i++) { const an = (i / items) * 6.28 + 0.4, px = x + Math.cos(an) * r * 0.5, py = y + Math.sin(an) * r * 0.5; if (i % 2) { a.cyl(px, py, z + 18, z + 140, 32, 10); a.circ(px, py, 32, 'EQUIP-DETAIL'); } else { a.cyl(px, py, z + 18, z + 36, 80, 14); a.ell(px, py, z + 36, 70, 70, 28, 12, 4); a.circ(px, py, 80, 'EQUIP-DETAIL'); } }
}
function roller(a, x, y, wd, dp, hg, z = 0) {
  a.box(x - wd / 2, y - dp / 2, z + 60, x + wd / 2, y + dp / 2, z + 60 + hg);
  a.box(x - wd * 0.4, y - dp / 2 - 14, z + 60 + hg * 0.12, x + wd * 0.4, y - dp / 2, z + 60 + hg * 0.55);
  for (const sx of [-1, 1]) { a.cyl(x + sx * wd * 0.28, y + dp * 0.3, z + 60 + hg, z + 60 + hg + 300, 9, 8); a.xcyl(x + sx * wd * 0.5 - 10, x + sx * wd * 0.5 + 10, y + dp * 0.3, z + 60 + hg * 0.5, 4, 4); a.xcyl(x + sx * wd * 0.35 - 12, x + sx * wd * 0.35 + 12, y - dp * 0.3, z + 32, 32, 12); }
  a.box(x - wd * 0.3, y + dp * 0.2, z + 60 + hg + 300, x + wd * 0.3, y + dp * 0.4, z + 60 + hg + 330);
  a.box(x - 60, y - dp * 0.2, z + 60 + hg, x + 60, y + dp * 0.2, z + 60 + hg + 30);
  a.rect(x - wd / 2, y - dp / 2, x + wd / 2, y + dp / 2); a.line(x - wd * 0.4, y - dp / 2 - 14, x + wd * 0.4, y - dp / 2 - 14);
}
function pack(a, x, y, z, wd, dp, hg) {
  a.box(x - wd / 2, y - dp / 2, z, x + wd / 2, y + dp / 2, z + hg); a.ell(x, y, z + hg, wd / 2, dp / 2, hg * 0.08, 12, 4);
  a.box(x - wd * 0.38, y - dp / 2 - 40, z + hg * 0.1, x + wd * 0.38, y - dp / 2, z + hg * 0.5);
  a.box(x - 25, y - dp / 2 - 6, z + hg * 0.55, x + 25, y - dp / 2, z + hg * 0.95);
  a.rect(x - wd / 2, y - dp / 2, x + wd / 2, y + dp / 2); a.rect(x - wd * 0.38, y - dp / 2 - 40, x + wd * 0.38, y - dp / 2, 'EQUIP-DETAIL');
}
function bag(a, x, y, z, wd, dp, hg) {   // a shopping bag with two handles
  a.box(x - wd / 2, y - dp / 2, z, x + wd / 2, y + dp / 2, z + hg);
  for (const k of [-1, 1]) a.tube([[x + k * wd * 0.3, y, z + hg], [x + k * wd * 0.12, y, z + hg + hg * 0.35], [x - k * wd * 0.05, y, z + hg + hg * 0.45]], [6, 6, 6], 6);
  a.rect(x - wd / 2, y - dp / 2, x + wd / 2, y + dp / 2); a.line(x - wd / 2, y, x + wd / 2, y, 'EQUIP-DETAIL');
}
function cartProp(a, x, y0, wd, dp, full) {   // a shopping cart seen from above; y0 is the front edge (−y)
  const z = 380;
  a.box(x - wd / 2, y0, z, x + wd / 2, y0 + dp, z + 14);
  for (const sx of [-1, 1]) a.box(x + sx * wd / 2 - (sx > 0 ? 8 : 0), y0, z, x + sx * wd / 2 + (sx > 0 ? 0 : 8), y0 + dp, z + 440);
  a.box(x - wd / 2, y0, z, x + wd / 2, y0 + 8, z + 440); a.box(x - wd / 2, y0 + dp - 8, z + 200, x + wd / 2, y0 + dp, z + 440);
  for (let i = 1; i < 6; i++) a.box(x - wd / 2, y0 + 2, z + i * 75, x + wd / 2, y0 + 6, z + i * 75 + 8);
  a.box(x - wd / 2 - 20, y0 + dp, z + 780 - 340, x + wd / 2 + 20, y0 + dp + 25, z + 440 + 40);
  a.box(x - wd / 2 + 20, y0 + 30, z - 120, x + wd / 2 - 20, y0 + 50, z - 100); a.box(x - wd / 2 + 20, y0 + dp - 50, z - 120, x + wd / 2 - 20, y0 + dp - 30, z - 100);
  for (const [px, py] of [[x - wd / 2 + 40, y0 + 50], [x + wd / 2 - 40, y0 + 50], [x - wd / 2 + 40, y0 + dp - 50], [x + wd / 2 - 40, y0 + dp - 50]]) { a.xcyl(px - 8, px + 8, py, 60, 60, 12); a.box(px - 8, py - 8, 60, px + 8, py + 8, z - 100); }
  if (full) { a.box(x - wd * 0.35, y0 + dp * 0.15, z + 14, x + wd * 0.35, y0 + dp * 0.5, z + 260); a.ell(x, y0 + dp * 0.72, z + 120, wd * 0.28, dp * 0.12, 110, 10, 5); a.line(x - wd * 0.35, y0 + dp * 0.5, x + wd * 0.35, y0 + dp * 0.5); }
  a.rect(x - wd / 2, y0, x + wd / 2, y0 + dp); a.rect(x - wd / 2 + 20, y0 + 20, x + wd / 2 - 20, y0 + dp - 20, 'EQUIP-DETAIL');
}
function chair(a, x, y, sz = 450, w = 430, d = 430) {   // a dining or gate chair, seat at sz, back at +y
  a.box(x - w / 2, y - d / 2, sz - 40, x + w / 2, y + d / 2, sz);
  a.box(x - w / 2, y + d / 2 - 30, sz, x + w / 2, y + d / 2, sz + 440);
  for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(x + px * (w / 2 - 20) - 15, y + py * (d / 2 - 20) - 15, 0, x + px * (w / 2 - 20) + 15, y + py * (d / 2 - 20) + 15, sz - 40);
  a.rect(x - w / 2, y - d / 2, x + w / 2, y + d / 2); a.rect(x - w / 2, y + d / 2 - 30, x + w / 2, y + d / 2, 'EQUIP-DETAIL');
}
function wheelchair(a, x, y, o = {}) {   // seat centre (x, y); front is −y
  const sw = 440, sd = 420;
  a.box(x - sw / 2, y - sd / 2, 440, x + sw / 2, y + sd / 2, 470); a.box(x - sw / 2, y + sd / 2 - 20, 470, x + sw / 2, y + sd / 2, 900);
  for (const s of [-1, 1]) {
    a.xcyl(x + s * (sw / 2 + 25) - 12, x + s * (sw / 2 + 25) + 12, y + 60, 305, 305, 24); a.xcyl(x + s * (sw / 2 + 25) - 6, x + s * (sw / 2 + 25) + 6, y + 60, 305, 262, 24);
    a.box(x + s * (sw / 2) - 8, y - sd / 2, 470, x + s * (sw / 2) + 8, y + sd / 2, 650);
    a.xcyl(x + s * (sw / 2 - 20) - 9, x + s * (sw / 2 - 20) + 9, y - sd / 2 - 90, 90, 90, 14);
    a.box(x + s * (sw / 2 - 25) - 10, y - sd / 2 - 100, 90, x + s * (sw / 2 - 25) + 10, y - sd / 2 + 10, 450);
    a.cyl(x + s * (sw / 2 - 10), y + sd / 2 + 30, 880, 960, 12, 8);
    a.rect(x + s * (sw / 2 + 25) - 12, y + 60 - 305, x + s * (sw / 2 + 25) + 12, y + 60 + 305, 'EQUIP-DETAIL');
  }
  a.box(x - sw / 2 + 20, y - sd / 2 - 230, 120, x + sw / 2 - 20, y - sd / 2 - 90, 150);
  a.rect(x - sw / 2, y - sd / 2, x + sw / 2, y + sd / 2); a.rect(x - sw / 2 + 20, y - sd / 2 - 230, x + sw / 2 - 20, y - sd / 2 - 90, 'EQUIP-DETAIL');
}
function stanchion(a, x, y, h = 960) { a.cyl(x, y, 0, 14, 170, 18); a.cyl(x, y, 14, h, 24, 10); a.cyl(x, y, h, h + 40, 38, 10); a.circ(x, y, 170); a.circ(x, y, 24, 'EQUIP-DETAIL'); }
function beltBetween(a, x1, y1, x2, y2, z = 900) { a.tube([[x1, y1, z], [x2, y2, z]], [14, 14], 6); a.line(x1, y1, x2, y2, 'EQUIP-DETAIL'); }
function counterProp(a, cx, y0, wd, dp, h) { a.box(cx - wd / 2, y0, 0, cx + wd / 2, y0 + dp, h); a.box(cx - wd / 2 - 20, y0 - 20, h, cx + wd / 2 + 20, y0 + dp + 20, h + 40); a.rect(cx - wd / 2 - 20, y0 - 20, cx + wd / 2 + 20, y0 + dp + 20); a.rect(cx - wd / 2, y0, cx + wd / 2, y0 + dp, 'EQUIP-DETAIL'); }

// ================= round 5 helpers =================
const AH = [64, 70];
const sz = (ht) => (ht * IN) / 1732;
const done = (a, t) => a.log(t);
const ring = (x, y, z, r, n = 12, tilt = 0) => Array.from({ length: n + 1 }, (_, i) => { const an = (i / n) * 6.2832; return [x + Math.cos(an) * r, y + Math.sin(an) * r * Math.cos(tilt) , z + Math.sin(an) * r * Math.sin(tilt)]; });

/** clothing and headgear on a lofted figure (f from fig()) */
function gear(a, f, o = {}) {
  const { s, cx, cy } = f;
  if (o.scrub) a.ell(cx, cy - 2 * s, 1668 * s, 100 * s, 120 * s, 88 * s, 14, 6);
  if (o.mask) a.box(cx - 62 * s, cy - 138 * s, 1535 * s, cx + 62 * s, cy - 108 * s, 1625 * s);
  if (o.hood) { a.box(cx - 120 * s, cy - 175 * s, 1530 * s, cx + 120 * s, cy + 125 * s, 1770 * s); a.box(cx - 100 * s, cy - 183 * s, 1600 * s, cx + 100 * s, cy - 175 * s, 1690 * s); }
  if (o.lamp) { a.box(cx - 28 * s, cy - 182 * s, 1700 * s, cx + 28 * s, cy - 140 * s, 1745 * s); a.tube([[cx, cy + 130 * s, 1690 * s], [cx + 150 * s, cy + 140 * s, 1500 * s], [cx + 230 * s, cy + 60 * s, 1020 * s]], [7 * s, 7 * s, 7 * s], 6); a.box(cx + 150 * s, cy + 20 * s, 880 * s, cx + 310 * s, cy + 115 * s, 1020 * s); }
  if (o.ears) { for (const k of [-1, 1]) a.box(cx + k * 112 * s - 20 * s, cy - 55 * s, 1560 * s, cx + k * 112 * s + 20 * s, cy + 45 * s, 1670 * s); a.tube([[cx - 105 * s, cy - 5 * s, 1660 * s], [cx, cy - 5 * s, 1750 * s], [cx + 105 * s, cy - 5 * s, 1660 * s]], [7 * s, 7 * s, 7 * s], 6); }
  if (o.gown) { a.ell(cx, cy, 1130 * s, 198 * s, 120 * s, 340 * s, 14, 7); a.ell(cx, cy, 760 * s, 205 * s, 126 * s, 300 * s, 14, 5); }
  if (o.apron) { a.box(cx - 178 * s, cy - 128 * s, 700 * s, cx + 178 * s, cy - 112 * s, 1330 * s); a.ell(cx, cy - 10 * s, 1470 * s, 118 * s, 100 * s, 40 * s, 12, 4); }
  if (o.belt) a.ell(cx, cy, 950 * s, 172 * s, 110 * s, 30 * s, 14, 3);
  if (o.steth) a.tube(ring(cx, cy - 70 * s, 1380 * s, 105 * s, 10, 1.2).slice(0, 10), Array(10).fill(6 * s), 5);
  if (o.robe) { a.ell(cx, cy, 1130 * s, 198 * s, 120 * s, 340 * s, 14, 7); a.ell(cx, cy, 700 * s, 215 * s, 130 * s, 330 * s, 14, 6); }
}
/** an arm reaching an absolute point from a figure's shoulder */
function armTo(a, f, side, to, rad = 1) {
  const { s, cx, cy } = f, sh = [cx + side * 200 * s, cy, 1380 * s];
  const el = [(sh[0] + to[0]) / 2 + side * 70 * s, (sh[1] + to[1]) / 2 - 60 * s, (sh[2] + to[2]) / 2];
  a.tube([sh, el, to], [58 * s * rad, 46 * s * rad, 34 * s * rad], 8); a.ell(to[0], to[1], to[2], 42 * s, 38 * s, 52 * s, 8, 5);
  return to;
}
function wand(a, from, dir, len, r = 16) { const n = Math.hypot(...dir) || 1; const e = [from[0] + dir[0] / n * len, from[1] + dir[1] / n * len, from[2] + dir[2] / n * len]; a.tube([from, e], [r, r * 1.35], 8); a.line(from[0], from[1], e[0], e[1], 'EQUIP-DETAIL'); return e; }

/** headgear / clothing for a light figure from mini() */
function mgear(a, x, y, h, o = {}) {
  const u = h / 1700, z0 = o.z ?? 0, sit = o.pose === 'sit';
  const zt = sit ? z0 + (o.seat ?? 450 * u) : z0 + 880 * u, hz = sit ? zt + 670 * u : z0 + 1610 * u, hy = y - (sit ? 10 : 5) * u;
  if (o.hard) { a.ell(x, hy, hz + 28 * u, 102 * u, 118 * u, 88 * u, 12, 5); a.box(x - 112 * u, hy - 168 * u, hz + 22 * u, x + 112 * u, hy - 92 * u, hz + 42 * u); }
  if (o.scrub) a.ell(x, hy + 10 * u, hz + 30 * u, 96 * u, 112 * u, 90 * u, 12, 5);
  if (o.mask) a.box(x - 60 * u, hy - 128 * u, hz - 92 * u, x + 60 * u, hy - 102 * u, hz - 4 * u);
  if (o.lamp) a.box(x - 25 * u, hy - 168 * u, hz + 62 * u, x + 25 * u, hy - 128 * u, hz + 108 * u);
  if (o.cap) { a.cyl(x, hy, hz + 20 * u, hz + 80 * u, 98 * u, 14); a.box(x - 90 * u, hy - 190 * u, hz + 25 * u, x + 90 * u, hy - 90 * u, hz + 42 * u); }
  if (o.vest) { a.ell(x, y, zt + 270 * u, 194 * u, 120 * u, 270 * u, 14, 7); a.box(x - 170 * u, y - 124 * u, zt + 120 * u, x + 170 * u, y - 114 * u, zt + 150 * u); a.box(x - 170 * u, y - 124 * u, zt + 300 * u, x + 170 * u, y - 114 * u, zt + 330 * u); }
  if (o.gown) { a.ell(x, y, zt + 250 * u, 198 * u, 122 * u, 300 * u, 14, 7); if (!sit) a.ell(x, y, zt - 100 * u, 206 * u, 128 * u, 270 * u, 14, 5); }
  if (o.pack) { a.ell(x, y + 150 * u, zt + 280 * u, 150 * u, 80 * u, 210 * u, 10, 5); }
}
function man(a, o, g = {}) { mini(a, o); mgear(a, o.x, o.y, o.h, { ...g, pose: o.pose, seat: o.seat, z: o.z }); }

// ---------- hospital props ----------
function ivPole(a, x, y, h = 1900, bags = 1, pump = false) {
  for (let i = 0; i < 5; i++) { const an = i * 1.2566 + 0.3, ex = x + Math.cos(an) * 290, ey = y + Math.sin(an) * 290; a.tube([[x, y, 90], [ex, ey, 70]], [18, 14], 6); a.cyl(ex, ey, 0, 60, 24, 8); }
  a.cyl(x, y, 80, 160, 40, 10); a.cyl(x, y, 160, h, 12, 8); a.box(x - 130, y - 12, h - 10, x + 130, y + 12, h + 12);
  for (let i = 0; i < bags; i++) { const bx = x + (bags === 1 ? 0 : (i ? 1 : -1) * 115); a.tube([[bx, y, h - 8], [bx, y, h - 110]], [3, 3], 4); a.ell(bx, y, h - 230, 52, 20, 112, 10, 6); }
  if (pump) a.box(x - 90, y - 75, h - 820, x + 90, y + 45, h - 560);
  a.circ(x, y, 290, 'EQUIP-DETAIL'); a.circ(x, y, 14);
}
function bedProp(a, x, y0, L, W, o = {}) {   // foot end at y0 (front), head end at y0 + L
  const gur = o.gurney;
  a.box(x - W / 2 + 90, y0 + 160, 130, x + W / 2 - 90, y0 + L - 160, 250); a.box(x - W / 2 + 40, y0 + 120, 250, x + W / 2 - 40, y0 + L - 120, 330);
  for (const px of [-1, 1]) for (const py of [y0 + 200, y0 + L - 200]) { a.xcyl(x + px * (W / 2 - 80) - 18, x + px * (W / 2 - 80) + 18, py, 85, 85, 12); a.cyl(x + px * (W / 2 - 80), py, 85, 250, 18, 8); }
  const dk = gur ? 700 : 560;
  a.box(x - W / 2, y0, dk, x + W / 2, y0 + L, dk + 70); a.box(x - W / 2 + 30, y0 + 40, dk + 70, x + W / 2 - 30, y0 + L - 40, dk + (gur ? 150 : 200));
  if (!gur) { a.box(x - W / 2, y0 + L - 50, dk, x + W / 2, y0 + L, 1150); a.box(x - W / 2, y0, dk, x + W / 2, y0 + 50, 960); }
  if (o.rails) for (const k of [-1, 1]) { const xr = x + k * (W / 2 + (gur ? 10 : 0)); a.box(xr - 15, y0 + L * 0.18, dk + 200, xr + 15, y0 + L * 0.82, dk + 245); a.box(xr - 15, y0 + L * 0.18, dk + 460, xr + 15, y0 + L * 0.82, dk + 500); for (const t of [0.18, 0.5, 0.82]) a.box(xr - 15, y0 + L * t - 15, dk + 200, xr + 15, y0 + L * t + 15, dk + 500); }
  if (o.straps) for (const t of [0.35, 0.62]) a.box(x - W / 2 - 20, y0 + L * t, dk + 150, x + W / 2 + 20, y0 + L * t + 50, dk + 175);
  a.rect(x - W / 2, y0, x + W / 2, y0 + L); a.rect(x - W / 2 + 30, y0 + 40, x + W / 2 - 30, y0 + L - 40, 'EQUIP-DETAIL'); a.line(x - W / 2, y0 + L * 0.35, x + W / 2, y0 + L * 0.35, 'EQUIP-DETAIL');
  return dk + (gur ? 150 : 200);   // mattress top
}
function opTable(a, x, y0, L = 2000, W = 560) {
  a.box(x - 320, y0 + L / 2 - 300, 0, x + 320, y0 + L / 2 + 300, 70); a.cyl(x, y0 + L / 2, 70, 660, 120, 14);
  a.box(x - W / 2, y0 + L - 520, 660, x + W / 2, y0 + L, 720); a.box(x - W / 2, y0 + L - 1160, 665, x + W / 2, y0 + L - 520, 735); a.box(x - W / 2, y0, 650, x + W / 2, y0 + L - 1160, 710);
  for (const k of [-1, 1]) a.box(x + k * (W / 2 + 25) - 12, y0 + 150, 700, x + k * (W / 2 + 25) + 12, y0 + L - 150, 730);
  a.rect(x - W / 2, y0, x + W / 2, y0 + L); a.line(x - W / 2, y0 + L - 520, x + W / 2, y0 + L - 520, 'EQUIP-DETAIL'); a.line(x - W / 2, y0 + L - 1160, x + W / 2, y0 + L - 1160, 'EQUIP-DETAIL'); a.circ(x, y0 + L / 2, 320, 'EQUIP-HIDDEN');
  return 735;
}
function backTable(a, x, y, w = 1200, d = 600, z = 900) {
  a.box(x - w / 2, y - d / 2, z - 30, x + w / 2, y + d / 2, z);
  for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(x + px * (w / 2 - 40) - 20, y + py * (d / 2 - 40) - 20, 0, x + px * (w / 2 - 40) + 20, y + py * (d / 2 - 40) + 20, z - 30);
  a.box(x - w / 2 + 30, y - d / 2 + 30, 250, x + w / 2 - 30, y + d / 2 - 30, 270);
  for (let i = 0; i < 5; i++) a.box(x - w / 2 + 90 + i * (w - 200) / 4, y - 60, z, x - w / 2 + 90 + i * (w - 200) / 4 + 60, y + 60, z + 14 + (i % 2) * 26);
  a.rect(x - w / 2, y - d / 2, x + w / 2, y + d / 2); a.rect(x - w / 2 + 60, y - 130, x + w / 2 - 60, y + 130, 'EQUIP-DETAIL');
}
function medCart(a, x, yb, type, o = {}) {   // back edge at yb, extends toward −y; returns top height
  const w = o.w ?? 600, d = o.d ?? 520, h = o.h ?? 1000;
  for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = x + px * (w / 2 - 50), cy = yb - d / 2 + py * (d / 2 - 50); a.cyl(cx, cy, 60, 150, 14, 8); a.xcyl(cx - 12, cx + 12, cy, 52, 52, 12); }
  a.tube([[x - w / 2 + 40, yb, h - 140], [x - w / 2 + 40, yb + 130, h + 20], [x + w / 2 - 40, yb + 130, h + 20], [x + w / 2 - 40, yb, h - 140]], [10, 10, 10, 10], 6);
  if (type === 'med') {
    a.box(x - w / 2, yb - d, 150, x + w / 2, yb, h - 30); a.box(x - w / 2 - 15, yb - d - 15, h - 30, x + w / 2 + 15, yb + 15, h);
    for (let i = 0; i < 5; i++) { const z0 = 190 + i * ((h - 260) / 5); a.box(x - w / 2 + 25, yb - d - 8, z0, x + w / 2 - 25, yb - d, z0 + (h - 260) / 5 - 14); a.box(x - 50, yb - d - 24, z0 + 40, x + 50, yb - d - 8, z0 + 54); }
    a.box(x - 130, yb - d + 40, h, x + 130, yb - d + 260, h + 90);   // locked bin on top
  } else if (type === 'linen') {
    for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(x + px * (w / 2 - 15) - 15, yb - d / 2 + py * (d / 2 - 15) - 15, 150, x + px * (w / 2 - 15) + 15, yb - d / 2 + py * (d / 2 - 15) + 15, h);
    for (let i = 0; i < 4; i++) { const z0 = 160 + i * ((h - 200) / 3.2); a.box(x - w / 2, yb - d, z0, x + w / 2, yb, z0 + 20); a.box(x - w / 2 + 40, yb - d + 40, z0 + 20, x - 20, yb - 40, z0 + 190); a.box(x + 20, yb - d + 40, z0 + 20, x + w / 2 - 40, yb - 40, z0 + 150 + (i % 2) * 40); }
  } else {   // computer on wheels
    a.cyl(x, yb - d / 2, 150, h + 100, 28, 10); a.box(x - w / 2, yb - d + 40, 150, x + w / 2, yb - 40, 190);
    a.box(x - 230, yb - d / 2 - 15, h + 100, x + 230, yb - d / 2 + 15, h + 400); a.box(x - 200, yb - d / 2 - 140, h - 10, x + 200, yb - d / 2 - 10, h + 10); a.box(x - 150, yb - d / 2 + 30, h - 330, x + 150, yb - d / 2 + 170, h - 180);
  }
  a.rect(x - w / 2, yb - d, x + w / 2, yb); a.rect(x - w / 2 + 30, yb - d + 30, x + w / 2 - 30, yb - 30, 'EQUIP-DETAIL');
  return h;
}
function deskProp(a, x, y, w, d, hz, o = {}) {   // desk or counter centred at (x, y)
  a.box(x - w / 2, y - d / 2, hz - 40, x + w / 2, y + d / 2, hz);
  if (o.closed) { a.box(x - w / 2 + 20, y - d / 2 + 20, 0, x + w / 2 - 20, y - d / 2 + 60, hz - 40); a.box(x - w / 2, y - d / 2, hz, x + w / 2, y - d / 2 + 120, hz + 60); }
  else for (const k of [-1, 1]) a.box(x + k * (w / 2 - 30) - 25, y - d / 2 + 30, 0, x + k * (w / 2 - 30) + 25, y + d / 2 - 30, hz - 40);
  a.box(x - 160, y, hz, x + 160, y + 30, hz + 20); a.box(x - 190, y - 20, hz + 20, x + 190, y + 10, hz + 380); a.box(x - 150, y - 200, hz, x + 150, y - 90, hz + 22);
  a.rect(x - w / 2, y - d / 2, x + w / 2, y + d / 2); a.rect(x - 190, y - 20, x + 190, y + 10, 'EQUIP-DETAIL');
}
function wchair(a, x, y, h = 1700) {   // office swivel chair, seat 480
  a.cyl(x, y, 100, 440, 25, 8); for (let i = 0; i < 5; i++) { const an = i * 1.2566; a.tube([[x, y, 100], [x + Math.cos(an) * 270, y + Math.sin(an) * 270, 60]], [20, 14], 6); a.cyl(x + Math.cos(an) * 270, y + Math.sin(an) * 270, 0, 60, 22, 8); }
  a.box(x - 230, y - 230, 440, x + 230, y + 230, 500); a.box(x - 220, y + 200, 500, x + 220, y + 240, 960); a.circ(x, y, 270, 'EQUIP-DETAIL'); a.rect(x - 230, y - 230, x + 230, y + 240);
}
function standSign(a, x, y, w = 300, hh = 620) {   // A-frame floor sign, stepped wedge
  const n = 6; for (let i = 0; i < n; i++) { const t = 280 * (1 - i / n) + 24; a.box(x - w / 2, y - t / 2, i * hh / n, x + w / 2, y + t / 2, (i + 1) * hh / n); }
  a.rect(x - w / 2, y - 140, x + w / 2, y + 140); a.line(x - w / 2, y, x + w / 2, y, 'EQUIP-DETAIL');
}
function kitBag(a, x, y, z, w, d, h, strap = false) {
  a.box(x - w / 2, y - d / 2, z, x + w / 2, y + d / 2, z + h); a.box(x - w / 2 - 10, y - d / 2 - 10, z + h * 0.45, x + w / 2 + 10, y - d / 2 + 4, z + h * 0.6);
  a.tube([[x - w * 0.22, y, z + h], [x - w * 0.12, y, z + h + 70], [x + w * 0.12, y, z + h + 70], [x + w * 0.22, y, z + h]], [7, 7, 7, 7], 6);
  if (strap) a.tube([[x - w / 2, y, z + h * 0.8], [x - w / 2 - 60, y + 40, z + h + 260], [x + w / 2 + 60, y + 40, z + h + 260], [x + w / 2, y, z + h * 0.8]], [6, 6, 6, 6], 5);
  a.rect(x - w / 2, y - d / 2, x + w / 2, y + d / 2); a.line(x - w / 2, y, x + w / 2, y, 'EQUIP-DETAIL');
}
function cone(a, x, y, h = 700) { a.box(x - 190, y - 190, 0, x + 190, y + 190, 25); a.cone(x, y, 25, h, 130, 22, 14); a.cyl(x, y, h * 0.55, h * 0.62, 90, 14); a.rect(x - 190, y - 190, x + 190, y + 190); a.circ(x, y, 110, 'EQUIP-DETAIL'); }
function chock(a, x, y, w = 260, len = 400) { for (let i = 0; i < 4; i++) a.box(x - w / 2, y - len / 2 + i * len / 4, 0, x + w / 2, y - len / 2 + (i + 1) * len / 4, 40 + i * 55); a.rect(x - w / 2, y - len / 2, x + w / 2, y + len / 2); }
function suitcase(a, x, y, z, w, d, h) { a.box(x - w / 2, y - d / 2, z, x + w / 2, y + d / 2, z + h); a.box(x - w * 0.1, y - d / 2 - 6, z + h * 0.35, x + w * 0.1, y - d / 2 + 2, z + h * 0.65); a.rect(x - w / 2, y - d / 2, x + w / 2, y + d / 2); a.line(x - w / 2, y, x + w / 2, y, 'EQUIP-DETAIL'); }
function wheelbarrow(a, x, y0, L = 1250, load = 0) {   // y0 is the wheel end (front), handles at +y
  a.xcyl(x - 25, x + 25, y0 + 80, 230, 230, 16); a.tube([[x - 40, y0 + 80, 230], [x - 230, y0 + 520, 560]], [12, 12], 6); a.tube([[x + 40, y0 + 80, 230], [x + 230, y0 + 520, 560]], [12, 12], 6);
  a.prism([[x - 330, y0 + 120], [x + 330, y0 + 120], [x + 230, y0 + 900], [x - 230, y0 + 900]], 480, 700);
  a.tube([[x - 230, y0 + 520, 520], [x - 260, y0 + L, 900]], [14, 14], 6); a.tube([[x + 230, y0 + 520, 520], [x + 260, y0 + L, 900]], [14, 14], 6);
  for (const k of [-1, 1]) { a.tube([[x + k * 235, y0 + 760, 520], [x + k * 235, y0 + 800, 0]], [12, 12], 6); a.box(x + k * 235 - 25, y0 + 740, 0, x + k * 235 + 25, y0 + 860, 25); }
  if (load) a.ell(x, y0 + 520, 690, 270, 330, load === 1 ? 120 : 170, 12, 5);
  if (load === 2) for (let i = 0; i < 3; i++) a.box(x - 190 + i * 40, y0 + 380 + i * 30, 690, x - 190 + i * 40 + 200, y0 + 380 + i * 30 + 100, 760 + i * 70);
  a.poly([[x - 330, y0 + 120], [x + 330, y0 + 120], [x + 230, y0 + 900], [x - 230, y0 + 900]]); a.line(x - 260, y0 + L, x - 230, y0 + 520, 'EQUIP-DETAIL'); a.line(x + 260, y0 + L, x + 230, y0 + 520, 'EQUIP-DETAIL');
}

/** a seated operator position: floor, posts, roof, seat. Returns { seatY, zf }. */
function cabProp(a, x, y, o) {
  const { w, d, h } = o, zf = 100, yb = y + d / 2, yf = y - d / 2;
  a.box(x - w / 2, yf, 0, x + w / 2, yb, zf);
  for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(x + px * (w / 2 - 30) - 30, y + py * (d / 2 - 30) - 30, zf, x + px * (w / 2 - 30) + 30, y + py * (d / 2 - 30) + 30, h);
  a.box(x - w / 2 - 40, yf - 40, h, x + w / 2 + 40, yb + 40, h + 60);
  if (o.closed) {
    for (const k of [-1, 1]) { a.box(x + k * (w / 2 - 30) - 20, yf + 30, zf, x + k * (w / 2 - 30) + 20, yb - 30, zf + 760); a.box(x + k * (w / 2 - 30) - 15, yf + 30, h - 120, x + k * (w / 2 - 30) + 15, yb - 30, h); }
    a.box(x - w / 2 + 30, yb - 50, zf, x + w / 2 - 30, yb - 20, h - 60); a.box(x - w / 2 + 30, yf + 20, h - 120, x + w / 2 - 30, yf + 50, h);
  } else { for (const k of [-1, 1]) a.box(x + k * (w / 2 - 30) - 15, yf + 30, zf + 560, x + k * (w / 2 - 30) + 15, yb - 30, zf + 600); }
  const sy = yb - 520;
  a.cyl(x, sy, zf, zf + 390, 90, 10); a.box(x - 215, sy - 230, zf + 390, x + 215, sy + 230, zf + 440); a.box(x - 205, sy + 190, zf + 440, x + 205, sy + 240, zf + 1040);
  a.box(x - w / 2 + 40, yf + 40, zf, x + w / 2 - 40, yf + 280, zf + 640);   // dash and floor housing
  for (const k of [-1, 1]) a.box(x + k * 90 - 45, sy - 480, zf, x + k * 90 + 45, sy - 380, zf + 40);
  if (o.wheel) { const wy = sy - 520; a.tube([[x, wy + 80, zf + 700], [x, wy - 60, zf + 980]], [26, 26], 8); a.tube(ring(x, wy - 60, zf + 980, 200, 14, 0.6), Array(15).fill(14), 6); a.circ(x, wy - 60, 200, 'EQUIP-DETAIL'); }
  if (o.sticks) for (const k of [-1, 1]) { const jx = x + k * 360; a.box(jx - 45, sy - 300, zf + 350, jx + 45, sy + 50, zf + 480); a.tube([[jx, sy - 150, zf + 480], [jx, sy - 190, zf + 800]], [18, 24], 8); a.ell(jx, sy - 195, zf + 830, 38, 34, 38, 8, 5); a.circ(jx, sy - 190, 40, 'EQUIP-DETAIL'); }
  if (o.stick1) { const jx = x + 360; a.box(jx - 50, sy - 300, zf + 350, jx + 50, sy + 50, zf + 470); a.tube([[jx, sy - 160, zf + 470], [jx, sy - 200, zf + 780]], [18, 24], 8); a.ell(jx, sy - 205, zf + 810, 40, 34, 40, 8, 5); }
  a.rect(x - w / 2, yf, x + w / 2, yb); a.rect(x - w / 2 + 40, yf + 40, x + w / 2 - 40, yf + 280, 'EQUIP-DETAIL'); a.rect(x - 215, sy - 230, x + 215, sy + 240, 'EQUIP-DETAIL');
  return { sy, zf };
}

function galleyCart(a, x, yb, L, Wc, h, jug = false) {
  for (const px of [-1, 1]) for (const yy of [yb - 70, yb - L + 70]) { a.cyl(x + px * (Wc / 2 - 50), yy, 70, 130, 14, 8); a.xcyl(x + px * (Wc / 2 - 50) - 10, x + px * (Wc / 2 - 50) + 10, yy, 60, 60, 12); }
  a.box(x - Wc / 2, yb - L, 130, x + Wc / 2, yb, h - 20); a.box(x - Wc / 2 - 10, yb - L - 10, h - 20, x + Wc / 2 + 10, yb + 10, h);
  for (let i = 1; i < 4; i++) a.box(x - Wc / 2 + 10, yb - L - 6, 130 + i * (h - 150) / 4 - 4, x + Wc / 2 - 10, yb - L, 130 + i * (h - 150) / 4 + 4);
  a.box(x - Wc / 2 + 30, yb - L - 26, h * 0.55, x + Wc / 2 - 30, yb - L - 6, h * 0.55 + 24); a.box(x - 20, yb - L - 12, 190, x + 20, yb - L, 260);
  if (jug) { a.cyl(x - Wc * 0.12, yb - L * 0.45, h, h + 300, 85, 14); a.ell(x - Wc * 0.12, yb - L * 0.45, h + 300, 85, 85, 40, 12, 4); a.box(x - Wc * 0.12 - 15, yb - L * 0.45 - 110, h + 60, x - Wc * 0.12 + 15, yb - L * 0.45 - 80, h + 110); a.cyl(x + Wc * 0.2, yb - L * 0.7, h, h + 110, 40, 10); a.circ(x - Wc * 0.12, yb - L * 0.45, 85, 'EQUIP-DETAIL'); }
  a.rect(x - Wc / 2 - 10, yb - L - 10, x + Wc / 2 + 10, yb + 10); a.rect(x - Wc / 2 + 20, yb - L + 20, x + Wc / 2 - 20, yb - 20, 'EQUIP-DETAIL');
}
function toolCart(a, x, yb, w, d, h, n, topbox = false) {
  for (const px of [-1, 1]) for (const yy of [yb - 70, yb - d + 70]) { a.cyl(x + px * (w / 2 - 60), yy, 70, 170, 16, 8); a.xcyl(x + px * (w / 2 - 60) - 14, x + px * (w / 2 - 60) + 14, yy, 70, 70, 12); }
  const hb = topbox ? h - 330 : h; a.box(x - w / 2, yb - d, 170, x + w / 2, yb, hb - 25); a.box(x - w / 2 - 15, yb - d - 15, hb - 25, x + w / 2 + 15, yb + 15, hb);
  const dh = (hb - 230) / n; for (let i = 0; i < n; i++) { const z0 = 190 + i * dh; a.box(x - w / 2 + 25, yb - d - 12, z0 + 6, x + w / 2 - 25, yb - d, z0 + dh - 10); a.box(x - w * 0.3, yb - d - 32, z0 + dh * 0.55, x + w * 0.3, yb - d - 12, z0 + dh * 0.55 + 22); }
  if (topbox) { a.box(x - w / 2 + 40, yb - d + 40, hb, x + w / 2 - 40, yb - 40, h - 60); a.box(x - w / 2 + 30, yb - d + 25, h - 60, x + w / 2 - 30, yb - 25, h); a.tube([[x - w * 0.15, yb - d + 20, h], [x - w * 0.15, yb - d + 20, h + 40], [x + w * 0.15, yb - d + 20, h + 40], [x + w * 0.15, yb - d + 20, h]], [7, 7, 7, 7], 5); }
  a.tube([[x - w / 2 + 40, yb, hb - 160], [x - w / 2 + 40, yb + 170, hb + 30], [x + w / 2 - 40, yb + 170, hb + 30], [x + w / 2 - 40, yb, hb - 160]], [10, 10, 10, 10], 6);
  a.rect(x - w / 2 - 15, yb - d - 15, x + w / 2 + 15, yb + 15); a.rect(x - w / 2 + 25, yb - d + 25, x + w / 2 - 25, yb - 25, 'EQUIP-DETAIL');
}
const ringE = (x, y, z, rx, ry, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const an = (i / n) * 6.2832; return [x + Math.cos(an) * rx, y + Math.sin(an) * ry, z]; });

const FAMS = [
  // ================= hospitals and healthcare =================
  fam({ cat: 'people/entourage', title: 'Generic surgeon at an operating room table',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a scrub cap, mask and gown beside an operating table with a lying scale figure on it, ${v.light ? 'and a domed overhead light on its arm' : 'and a wheeled instrument back table behind'}. A stand-in, not a person.`,
    vs: hv([['table with an overhead light', 60, 90, 0, { light: true }], ['table with a back table', 90, 90, 0, { light: false }]]),
    build: (a, v) => { const f = fig(a, v.ht, { dx: -620 }); gear(a, f, { scrub: 1, mask: 1, gown: 1 }); const tx = a.cx, y0 = f.cy - 1000, top = opTable(a, tx, y0, 2000, 560);
      mini(a, { x: tx, y: y0 + 50 + 1010 * 0.97, h: 1650, pose: 'lie', z: top }); a.box(tx - 255, y0 + 70, top + 190, tx + 255, y0 + 860, top + 235);
      armTo(a, f, 1, [tx - 190, f.cy - 100, top + 330]);
      if (v.light) { a.ell(tx, y0 + 1100, 2100, 400, 400, 70, 18, 6); a.tube([[tx, y0 + 1100, 2170], [tx + 250, y0 + 1100, 2650]], [40, 50], 8); a.circ(tx, y0 + 1100, 400, 'EQUIP-HIDDEN'); }
      else backTable(a, f.cx - 900, f.cy + 50, 1200, 600, 900);
      done(a, 'Added the standing figure with scrub cap, mask and gown, an operating table with a lying figure and drape, and ' + (v.light ? 'a domed overhead light on its arm (plan and 3D).' : 'a back table with instruments (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic scrub team around an operating room table',
    desc: (v) => `${v.n} standing scale figures in scrub caps, masks and gowns around an operating table with a lying figure and a domed overhead light. Light figures, not people.`,
    vs: [3, 4, 5, 6].map((n) => [`${n} staff around the table`, 100, 150, 100, 0, { n }]),
    build: (a, v) => { const tx = a.cx, y0 = a.cy - 1000, top = opTable(a, tx, y0, 2000, 560);
      mini(a, { x: tx, y: y0 + 50 + 1010 * 0.97, h: 1650, pose: 'lie', z: top }); a.box(tx - 255, y0 + 70, top + 190, tx + 255, y0 + 860, top + 235);
      const P = [[-700, 700], [700, 700], [-700, 1300], [700, 1300], [0, 2350], [700, 100]];
      for (let i = 0; i < v.n; i++) man(a, { x: tx + P[i][0], y: y0 + P[i][1], h: 1600 + (i * 53) % 150, pose: 'stand' }, { scrub: 1, mask: 1, gown: 1 });
      backTable(a, tx - 1600, y0 + 700, 1000, 560, 900); a.ell(tx, y0 + 1100, 2100, 400, 400, 70, 18, 6); a.tube([[tx, y0 + 1100, 2170], [tx + 250, y0 + 1100, 2650]], [40, 50], 8); a.circ(tx, y0 + 1100, 400, 'EQUIP-HIDDEN');
      done(a, `Added ${v.n} light figures in scrub caps, masks and gowns, the operating table with a lying figure, a back table and a domed overhead light (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic surgeon scrubbing at a scrub sink',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a scrub cap and mask, forearms raised at a ${v.st}-station stainless scrub sink with a gooseneck spout and backsplash. A stand-in, not a person.`,
    vs: hv([['at a one-station sink', 40, 40, 0, { st: 1 }], ['at a two-station sink', 62, 40, 0, { st: 2 }]], AH),
    build: (a, v) => { const f = fig(a, v.ht, { dy: 420 }); gear(a, f, { scrub: 1, mask: 1 }); const W = v.st * 700 + 120, yb = f.cy - 300, x = f.cx + (v.st === 2 ? 350 : 0);
      a.box(x - W / 2, yb - 560, 0, x + W / 2, yb, 800); a.box(x - W / 2 - 20, yb - 580, 800, x + W / 2 + 20, yb + 20, 860); a.box(x - W / 2, yb - 640, 800, x + W / 2, yb - 580, 1060);
      for (let i = 0; i < v.st; i++) { const sx = x - W / 2 + 60 + 350 + i * 700; a.box(sx - 280, yb - 500, 860, sx + 280, yb - 40, 880); a.tube([[sx, yb - 540, 880], [sx, yb - 540, 1250], [sx, yb - 400, 1330], [sx, yb - 280, 1230]], [18, 18, 18, 14], 8); a.box(sx - 40, yb - 575, 1350, sx + 40, yb - 540, 1420); a.rect(sx - 280, yb - 500, sx + 280, yb - 40, 'EQUIP-DETAIL'); }
      armTo(a, f, 1, [f.cx + 200 * f.s, yb - 220, 1280 * f.s]); armTo(a, f, -1, [f.cx - 200 * f.s, yb - 220, 1280 * f.s]);
      a.rect(x - W / 2 - 20, yb - 640, x + W / 2 + 20, yb + 20);
      done(a, 'Added the standing figure with raised forearms, a stainless scrub sink with a basin rim per station, gooseneck spouts, sensor boxes and a tall backsplash (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic ward nurse with a cart',
    desc: (v) => `Walking scale figure ${v.ht} in tall pushing a ${v.cart === 'med' ? 'medication cart with a drawer stack, locked top bin and four casters' : v.cart === 'linen' ? 'linen cart with four open shelves of folded linen and four casters' : 'computer-on-wheels cart with a monitor on a pole and a keyboard tray'}. A stand-in, not a person.`,
    vs: hv([['pushing a medication cart', 40, 60, 0, { cart: 'med' }], ['pushing a linen cart', 40, 60, 0, { cart: 'linen' }], ['pushing a computer cart', 40, 60, 0, { cart: 'cow' }]], AH),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', dy: 450 }); gear(a, f, { steth: v.cart === 'med' }); const w = v.cart === 'cow' ? 520 : 600, h = v.cart === 'linen' ? 1250 : v.cart === 'med' ? 1000 : 1000, yb = f.cy - 300;
      medCart(a, f.cx, yb, v.cart, { w, d: 520, h }); a.tube([[f.hand[0], f.hand[1], f.hand[2]], [f.cx + w / 2 - 40, yb + 130, h + 20]], [8, 8], 6);
      done(a, 'Added the walking figure and a ' + (v.cart === 'med' ? 'medication cart with drawers, top bin, push bar and casters' : v.cart === 'linen' ? 'linen cart with shelves of folded linen, push bar and casters' : 'computer cart with pole, monitor and keyboard tray') + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic nurse at a ward station',
    desc: (v) => `${v.sit ? 'Seated' : 'Standing'} scale figure ${v.ht} in tall ${v.sit ? 'on a five-star swivel chair at a desk with a monitor, keyboard and phone' : 'behind a closed transaction counter with a monitor and keyboard'}. A stand-in, not a person.`,
    vs: hv([['standing at the counter', 74, 40, 0, { sit: false }], ['seated at a desk', 64, 56, 0, { sit: true }]], AH),
    build: (a, v) => { if (!v.sit) { const f = fig(a, v.ht, { dy: 520 }); gear(a, f, { steth: 1 }); deskProp(a, f.cx, f.cy - 700, 1800, 700, 1070, { closed: true }); }
      else { const h = v.ht * IN, yc = a.cy + 500; deskProp(a, a.cx, a.cy - 100, 1500, 750, 740); wchair(a, a.cx, yc); mini(a, { x: a.cx, y: yc, h, pose: 'sit', seat: 480, feet: 0 }); mgear(a, a.cx, yc, h, { pose: 'sit', seat: 480, z: 0, scrub: 0 }); }
      done(a, v.sit ? 'Added the seated figure, a swivel chair on five casters and a desk with monitor, keyboard and phone (plan and 3D).' : 'Added the standing figure with a stethoscope and a closed counter with monitor, keyboard and phone (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic patient lying in a ward bed',
    desc: (v) => `A lying scale figure about ${v.ht} in tall on a ward bed with a pillow, headboard and footboard${v.cfg === 0 ? ', side rails raised' : v.cfg === 1 ? ', a blanket over the legs and the side rails lowered' : ', an IV pole and an overbed table across the bed'}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((c) => AH.map((ht) => [`${['rails raised', 'blanket, rails lowered', 'IV pole and overbed table'][c]}, ${ht} in tall`, 130, 100, 60, 0, { cfg: c, ht }])),
    build: (a, v) => { const L = 2100, W = 950, x = a.cx, y0 = a.cy - 1000, mt = bedProp(a, x, y0, L, W, { rails: v.cfg === 0 }), h = v.ht * IN * 0.97, u = h / 1700;
      mini(a, { x, y: y0 + 60 + 1010 * u, h, pose: 'lie', z: mt }); a.ell(x, y0 + L - 240, mt + 60, 230, 170, 60, 12, 5);
      if (v.cfg !== 0) a.box(x - W * 0.42, y0 + 100, mt + 205, x + W * 0.42, y0 + 1250, mt + 250);
      if (v.cfg === 2) { ivPole(a, x - W / 2 - 330, y0 + L * 0.72, 1900, 1, true); a.box(x + W / 2 + 280, y0 + 300, 0, x + W / 2 + 420, y0 + 460, 60); a.cyl(x + W / 2 + 350, y0 + 380, 60, 980, 22, 8); a.box(x - 450, y0 + 330, 1000, x + W / 2 + 420, y0 + 700, 1035); a.tube([[x + W / 2 + 350, y0 + 380, 940], [x + 80, y0 + 515, 1000]], [18, 18], 6); a.rect(x - 450, y0 + 330, x + W / 2 + 420, y0 + 700, 'EQUIP-DETAIL'); }
      done(a, 'Added the bed (frame, casters, mattress, headboard, footboard' + (v.cfg === 0 ? ', raised side rails' : '') + '), a lying figure with a pillow' + (v.cfg === 1 ? ' and a blanket.' : v.cfg === 2 ? ', an IV pole with pump and an overbed table.' : '.')); } }),
  fam({ cat: 'people/entourage', title: 'Generic ward patient walking with an IV pole',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a long gown, one hand on a rolling pole with ${v.two ? 'two hanging bags and a pump' : 'one hanging bag'} on a five-leg base. A stand-in, not a person.`,
    vs: hv([['pole with one bag', 40, 40, 0, { two: false }], ['pole with two bags and a pump', 40, 40, 0, { two: true }]], AH),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', dx: -200 }); gear(a, f, { robe: 1 }); const px = f.cx + 420, py = f.cy - 60; ivPole(a, px, py, 1900, v.two ? 2 : 1, v.two); a.tube([f.hand, [px, py, 1150]], [30 * f.s, 24 * f.s], 8);
      done(a, 'Added the walking figure in a long gown and an IV pole with its five-leg base and casters, hooks, ' + (v.two ? 'two bags and a pump' : 'one bag') + ', with a hand on the pole (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic wheelchair patient on the ward',
    desc: (v) => `A seated scale figure about ${v.ht} in tall in a manual wheelchair with a blanket over the lap${v.cfg === 1 ? ', pushed by a standing orderly' : v.cfg === 2 ? ', with an IV pole standing beside it' : ''}. Large rear wheels, casters and footplate are drawn.`,
    vs: [0, 1, 2].flatMap((c) => AH.map((ht) => [`${['patient alone', 'orderly pushing', 'IV pole beside'][c]}, ${ht} in tall`, 40, 76, 60, 0, { cfg: c, ht }])),
    build: (a, v) => { const cx = a.cx, sy = a.cy + 150, h = v.ht * IN; wheelchair(a, cx, sy); mini(a, { x: cx, y: sy + 20, h: h * 0.95, pose: 'sit', seat: 470, z: 0, feet: 150 }); a.box(cx - 220, sy - 330, 600, cx + 220, sy - 60, 660); a.rect(cx - 220, sy - 330, cx + 220, sy - 60, 'EQUIP-DETAIL');
      if (v.cfg === 1) { const f = fig(a, 67, { pose: 'walk', dy: 150 + 560, lo: true }); a.tube([f.hand, [cx + 210, sy + 240, 920]], [8, 8], 6); }
      if (v.cfg === 2) ivPole(a, cx + 620, sy - 150, 1900, 1, false);
      done(a, 'Added the wheelchair with rear wheels, casters, armrests, footplate and push handles, a seated figure with a blanket' + (v.cfg === 1 ? ' and a standing orderly behind it (plan and 3D).' : v.cfg === 2 ? ' and an IV pole beside it (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic paramedics with an ambulance gurney',
    desc: (v) => `A wheeled gurney with raised side rails, straps and a lying scale figure, with ${v.n} standing paramedic figure${v.n > 1 ? 's' : ''}${v.ox ? ', an oxygen cylinder and a kit bag on the floor' : ''}. Light figures, not people.`,
    vs: [[1, false], [2, false], [3, false], [2, true]].map(([n, ox]) => [`${n} paramedic${n > 1 ? 's' : ''}${ox ? ' with oxygen and kit bag' : ''}`, 90, 140, 70, 0, { n, ox }]),
    build: (a, v) => { const L = 1900, W = 620, x = a.cx, y0 = a.cy - 950, mt = bedProp(a, x, y0, L, W, { gurney: true, rails: true, straps: true });
      mini(a, { x, y: y0 + 60 + 1010 * 0.95, h: 1620, pose: 'lie', z: mt }); a.box(x - W * 0.4, y0 + 60, mt + 190, x + W * 0.4, y0 + 1000, mt + 232);
      const P = [[0, L + 330], [0, -330], [W / 2 + 480, L * 0.5]];
      for (let i = 0; i < v.n; i++) man(a, { x: x + P[i][0], y: y0 + P[i][1], h: 1700 - i * 50, pose: 'stand' }, { cap: 1, vest: 1 });
      if (v.ox) { a.cyl(x - W / 2 - 400, y0 + 400, 0, 720, 78, 12); a.cyl(x - W / 2 - 400, y0 + 400, 720, 770, 30, 8); kitBag(a, x - W / 2 - 520, y0 + 900, 0, 520, 240, 300); }
      done(a, `Added the gurney (frame, scissor legs, casters, rails, straps), a lying figure with a blanket and ${v.n} light standing figure${v.n > 1 ? 's' : ''} in caps and vests` + (v.ox ? ', plus an oxygen cylinder and a kit bag (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic paramedic carrying kit bags',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a cap and vest carrying ${v.two ? 'a kit bag in one hand and a hard case in the other, with a strap bag on the shoulder' : 'a kit bag with two handles in one hand'}. A stand-in, not a person.`,
    vs: hv([['with a kit bag', 34, 30, 0, { two: false }], ['with a kit bag, case and shoulder bag', 44, 30, 0, { two: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', hat: 'cap', vest: true }); gear(a, f, { belt: 1 }); const s = f.s; kitBag(a, f.hand[0] + 60 * s, f.hand[1], f.hand[2] - 360 * s, 500 * s, 240 * s, 300 * s, v.two);
      if (v.two) { a.box(f.lhand[0] - 90 * s, f.lhand[1] - 60 * s, f.lhand[2] - 330 * s, f.lhand[0] + 90 * s, f.lhand[1] + 60 * s, f.lhand[2] - 70 * s); a.tube([[f.lhand[0] - 40 * s, f.lhand[1], f.lhand[2] - 70 * s], [f.lhand[0], f.lhand[1], f.lhand[2] - 10 * s], [f.lhand[0] + 40 * s, f.lhand[1], f.lhand[2] - 70 * s]], [5, 5, 5], 5); a.rect(f.lhand[0] - 90 * s, f.lhand[1] - 60 * s, f.lhand[0] + 90 * s, f.lhand[1] + 60 * s, 'EQUIP-DETAIL'); }
      done(a, 'Added the walking figure with cap, vest and belt, ' + (v.two ? 'a kit bag with strap, a hard case and a shoulder strap (plan and 3D).' : 'and a kit bag with handles and a front pocket (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic visitors in a hospital waiting room',
    desc: (v) => `A ${v.n}-seat beam bench with a seat and back on each place and ${Math.ceil(v.n / 2)} seated scale figures on alternate seats. Light figures, not people.`,
    vs: [2, 3, 4, 5].map((n) => [`${n}-seat bench, ${Math.ceil(n / 2)} seated`, n * 21 + 8, 28, 40, 0, { n }]),
    build: (a, v) => { const n = v.n, p = 530, x0 = a.cx - ((n - 1) * p) / 2, y = a.cy; a.tube([[x0 - 270, y, 360], [x0 + (n - 1) * p + 270, y, 360]], [32, 32], 8);
      for (let i = 0; i < n; i++) { const xi = x0 + i * p; a.box(xi - 240, y - 250, 440, xi + 240, y + 250, 490); a.box(xi - 240, y + 215, 490, xi + 240, y + 260, 900); a.rect(xi - 240, y - 250, xi + 240, y + 260); a.line(xi - 240, y - 250, xi - 240, y + 260, 'EQUIP-DETAIL'); }
      for (let i = 0; i <= Math.ceil(n / 2); i++) { const lx = x0 - 270 + Math.min(i * 2, n) * p; a.box(lx - 25, y - 25, 0, lx + 25, y + 25, 440); }
      let k = 0; for (let i = 0; i < n; i += 2) man(a, { x: x0 + i * p, y: y + 20, h: 1560 + (k++ * 90) % 200, pose: 'sit', seat: 470, feet: 0 }, {});
      done(a, `Added the beam bench with ${n} seats, backs and legs and ${Math.ceil(n / 2)} light seated figures (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic radiographer behind a lead screen',
    desc: (v) => `Standing scale figure ${v.ht} in tall in an apron and collar behind a ${v.sw} in wide mobile screen on two feet, with a solid lower panel and an open upper window frame. A stand-in, not a person.`,
    vs: [24, 36, 48].flatMap((sw) => AH.map((ht) => [`behind a ${sw} in screen, ${ht} in tall`, sw + 8, 36, 76, 0, { sw, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { dy: 420 }); gear(a, f, { apron: 1, belt: 1 }); const W = v.sw * IN, x = a.cx, yb = f.cy - 380;
      for (const k of [-1, 1]) { a.box(x + k * (W / 2 - 40) - 25, yb - 380, 0, x + k * (W / 2 - 40) + 25, yb + 380, 70); a.box(x + k * (W / 2) - 25, yb - 25, 70, x + k * (W / 2) + 25, yb + 25, 1950); }
      a.box(x - W / 2, yb - 30, 300, x + W / 2, yb + 30, 1150); a.box(x - W / 2, yb - 30, 1150, x + W / 2, yb + 30, 1190); a.box(x - W / 2, yb - 30, 1900, x + W / 2, yb + 30, 1960);
      a.rect(x - W / 2, yb - 30, x + W / 2, yb + 30); a.rect(x - W / 2 - 25, yb - 380, x + W / 2 + 25, yb + 380, 'EQUIP-DETAIL');
      done(a, 'Added the standing figure with a lead-style apron and neck collar, a mobile screen on two floor feet with a solid lower panel and an open upper window frame (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic child on a hospital exam table',
    desc: (v) => `A seated scale figure of a child ${v.ch} in tall with legs hanging over the front edge of a padded exam table with a paper roll at one end${v.doc ? ', and a standing adult beside the table with a stethoscope' : ''}. A stand-in, not a child.`,
    vs: [42, 48, 54].flatMap((ch) => [false, true].map((doc) => [`${ch} in child${doc ? ' with a standing clinician' : ''}`, 90, 40, 52, 0, { ch, doc }])),
    build: (a, v) => { const x = a.cx, tf = a.cy - 200, u = (v.ch * IN) / 1700; a.box(x - 850, tf + 40, 0, x + 850, tf + 600, 800); a.box(x - 900, tf, 800, x + 900, tf + 650, 890); a.ycyl(tf + 30, tf + 620, x - 820, 930, 70, 12); a.box(x - 900, tf + 650, 100, x + 900, tf + 700, 600);
      a.rect(x - 900, tf, x + 900, tf + 650); a.rect(x - 850, tf + 40, x + 850, tf + 600, 'EQUIP-DETAIL'); const z0 = 895 - 450 * u;
      mini(a, { x: x + 150, y: tf + 340 * u + 70, h: v.ch * IN, pose: 'sit', z: z0, feet: z0 });
      if (v.doc) { const f = fig(a, 67, { dx: x - a.cx + 1250, dy: -180 - 0, lo: true }); gear(a, f, { steth: 1 }); }
      done(a, 'Added the exam table with padded top, paper roll, cabinet base and back panel, the child figure with legs hanging' + (v.doc ? ' and a standing clinician beside it (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic ward cleaner with a mop bucket',
    desc: (v) => `Walking scale figure ${v.ht} in tall with a mop in one hand beside a wheeled mop bucket with a wringer${v.sign ? ' and a folding wet floor sign' : ''}. A stand-in, not a person.`,
    vs: hv([['with mop and bucket', 50, 60, 0, { sign: false }], ['with mop, bucket and floor sign', 70, 60, 0, { sign: true }]], AH),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', dy: 300 }); gear(a, f, { belt: 1 }); const s = f.s, bx = f.cx - 560, by = f.cy - 450;
      a.box(bx - 200, by - 300, 90, bx + 200, by + 300, 330); a.box(bx - 180, by + 90, 330, bx + 180, by + 300, 520); for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { a.cyl(bx + px * 160, by + py * 240, 30, 90, 14, 8); a.xcyl(bx + px * 160 - 10, bx + px * 160 + 10, by + py * 240, 35, 35, 10); }
      a.tube([[bx - 190, by + 280, 520], [bx - 190, by + 300, 800], [bx + 190, by + 300, 800], [bx + 190, by + 280, 520]], [8, 8, 8, 8], 6); a.rect(bx - 200, by - 300, bx + 200, by + 300); a.rect(bx - 180, by + 90, bx + 180, by + 300, 'EQUIP-DETAIL');
      const hx = f.hand[0], hy = f.hand[1]; a.tube([[hx, hy, 900 * s], [hx + 60, hy - 1000, 80]], [14, 14], 6); a.box(hx - 120, hy - 1250, 10, hx + 240, hy - 920, 85); a.line(hx, hy, hx + 60, hy - 1000, 'EQUIP-DETAIL');
      if (v.sign) standSign(a, f.cx + 800, f.cy - 700);
      done(a, 'Added the walking figure, a mop with its head on the floor, a mop bucket with wringer, casters and push bar' + (v.sign ? ' and a folding wet floor sign (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic ward patient with a walking aid',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a long gown using ${v.walker ? 'a four-leg walker frame with hand rails and front wheels' : 'a pair of underarm crutches with hand grips'}. A stand-in, not a person.`,
    vs: hv([['with a walker frame', 40, 42, 0, { walker: true }], ['with crutches', 40, 34, 0, { walker: false }]], AH),
    build: (a, v) => { const f = fig(a, v.ht, { dy: 400 }); gear(a, f, { robe: 1 }); const s = f.s;
      if (v.walker) { const yf = f.cy - 560, yr = f.cy - 120; for (const k of [-1, 1]) { for (const yy of [yf, yr]) a.tube([[f.cx + k * 300, yy, 40], [f.cx + k * 300, yy, 860]], [14, 14], 6); a.tube([[f.cx + k * 300, yr, 860], [f.cx + k * 300, yf, 860]], [17, 17], 6); } a.tube([[f.cx - 300, yf, 700], [f.cx + 300, yf, 700]], [14, 14], 6); a.tube([[f.cx - 300, yr, 500], [f.cx + 300, yr, 500]], [14, 14], 6); for (const k of [-1, 1]) a.xcyl(f.cx + k * 300 - 10, f.cx + k * 300 + 10, yf, 60, 60, 12); a.rect(f.cx - 300, yf, f.cx + 300, yr); a.line(f.cx - 300, yf, f.cx + 300, yf, 'EQUIP-DETAIL'); armTo(a, f, 1, [f.cx + 300, f.cy - 300, 880]); armTo(a, f, -1, [f.cx - 300, f.cy - 300, 880]); }
      else for (const k of [-1, 1]) { a.tube([[f.cx + k * 215 * s, f.cy - 10, 1350 * s], [f.cx + k * 340 * s, f.cy - 150, 700 * s], [f.cx + k * 380 * s, f.cy - 220, 30]], [18, 14, 12], 6); a.box(f.cx + k * 345 * s - 40, f.cy - 190, 860 * s, f.cx + k * 345 * s + 40, f.cy - 110, 900 * s); a.box(f.cx + k * 380 * s - 30, f.cy - 260, 0, f.cx + k * 380 * s + 30, f.cy - 190, 25); a.line(f.cx + k * 215 * s, f.cy - 10, f.cx + k * 380 * s, f.cy - 220, 'EQUIP-DETAIL'); }
      done(a, 'Added the standing figure in a long gown and ' + (v.walker ? 'a walker frame with four legs, hand rails, cross bars and front wheels (plan and 3D).' : 'two crutches with underarm pads, hand grips and rubber feet (plan and 3D).')); } }),

  // ================= construction =================
  fam({ cat: 'people/entourage', title: 'Generic site bricklayer at a block wall',
    desc: (v) => `Standing scale figure 67 in tall in a hard hat and vest with a trowel, beside a ${v.len} in long, ${v.hgt} in high brick wall laid in ${Math.round(v.hgt * IN / 75)} courses with staggered joints, a mortar board on legs and a stack of bricks. A stand-in, not a person.`,
    vs: [24, 36, 48].flatMap((hgt) => [48, 72].map((len) => [`${len} in long wall, ${hgt} in high`, len + 50, 50, 70, 0, { hgt, len }])),
    build: (a, v) => { const f = fig(a, 67, { dy: 300, hat: 'hardhat', vest: true }); const L = v.len * IN, n = Math.round((v.hgt * IN) / 75), yw = f.cy - 120, x0 = f.cx + 420;
      for (let i = 0; i < n; i++) { const o = i % 2 ? 107 : 0; a.box(x0 + o, yw - 50, i * 75, x0 + L, yw + 50, i * 75 + 65); }
      a.rect(x0, yw - 50, x0 + L, yw + 50); for (let k = 1; k < 6; k++) a.line(x0 + k * L / 6, yw - 50, x0 + k * L / 6, yw + 50, 'EQUIP-DETAIL');
      const mx = f.cx - 600, my = f.cy - 250; a.box(mx - 250, my - 250, 700, mx + 250, my + 250, 722); for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.tube([[mx + px * 220, my + py * 220, 700], [mx + px * 260, my + py * 260, 0]], [14, 14], 6); a.ell(mx, my, 740, 170, 150, 50, 12, 5); a.rect(mx - 250, my - 250, mx + 250, my + 250, 'EQUIP-DETAIL');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) a.box(f.cx - 900 + j * 120, f.cy + 350 + i * 230 - 100, 0, f.cx - 900 + j * 120 + 110, f.cy + 350 + i * 230 + 10, 70); a.box(f.cx - 900, f.cy + 250, 70, f.cx - 900 + 470, f.cy + 610, 150);
      a.tube([f.hand, [f.hand[0] + 130, f.hand[1] - 150, 1000 * f.s]], [10 * f.s, 10 * f.s], 6); a.box(f.hand[0] + 90, f.hand[1] - 330, 985 * f.s, f.hand[0] + 230, f.hand[1] - 140, 1000 * f.s);
      done(a, `Added the standing figure with a trowel, a ${v.len} in wall of ${n} courses with staggered joints, a mortar board on four legs and a stack of bricks (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic site welder',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a welding hood, apron and belt, ${v.bench ? 'holding a torch over a plate on a steel workbench with a lower shelf' : 'beside a two-cylinder gas trolley with regulators, hoses and a torch'}. A stand-in, not a person.`,
    vs: hv([['at a steel bench', 60, 50, 0, { bench: true }], ['with a gas trolley', 60, 50, 0, { bench: false }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { dy: 450, hat: undefined }); gear(a, f, { hood: 1, apron: 1, belt: 1 }); const s = f.s;
      if (v.bench) { const bx = f.cx + 40, by = f.cy - 800; a.box(bx - 700, by - 350, 860, bx + 700, by + 350, 900); for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(bx + px * 660 - 25, by + py * 310 - 25, 0, bx + px * 660 + 25, by + py * 310 + 25, 860); a.box(bx - 680, by - 330, 200, bx + 680, by + 330, 225); a.box(bx - 300, by - 150, 900, bx + 300, by + 150, 912); a.rect(bx - 700, by - 350, bx + 700, by + 350); a.rect(bx - 300, by - 150, bx + 300, by + 150, 'EQUIP-DETAIL');
        a.tube([f.hand, [bx + 100, by - 40, 960]], [13 * s, 13 * s], 6); a.tube([[bx + 100, by - 40, 960], [bx + 300, by + 100, 1010]], [11, 7], 6); a.tube([[bx + 300, by + 100, 1010], [bx + 500, by + 400, 300], [bx + 650, by + 520, 30]], [8, 8, 8], 6); }
      else { const tx = f.cx + 560, ty = f.cy - 100; a.box(tx - 260, ty - 220, 120, tx + 260, ty + 220, 160); a.xcyl(tx - 330, tx + 330, ty + 200, 130, 130, 14); a.box(tx - 260, ty - 220, 160, tx + 260, ty - 190, 1100); a.tube([[tx, ty - 200, 160], [tx + 60, ty + 330, 1000]], [12, 12], 6);
        for (const [cxo, hh] of [[-120, 1500], [120, 1300]]) { a.cyl(tx + cxo, ty - 20, 160, hh, 118, 14); a.ell(tx + cxo, ty - 20, hh, 118, 118, 60, 12, 4); a.box(tx + cxo - 50, ty - 70, hh + 40, tx + cxo + 50, ty + 30, hh + 130); a.circ(tx + cxo, ty - 20, 118, 'EQUIP-DETAIL'); }
        a.tube([[tx - 120, ty - 20, 1540], [tx - 380, ty - 120, 1300], [f.hand[0], f.hand[1], f.hand[2] + 60]], [9, 9, 9], 6); a.rect(tx - 330, ty - 220, tx + 330, ty + 220); a.box(f.hand[0] - 20, f.hand[1] - 20, f.hand[2] - 40, f.hand[0] + 20, f.hand[1] - 330 * s, f.hand[2] + 20); }
      done(a, 'Added the standing figure with a welding hood, apron and belt, ' + (v.bench ? 'a steel workbench with a lower shelf and plate, a torch and a trailing cable (plan and 3D).' : 'a gas trolley with two cylinders, regulators and hoses to a torch (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic site crane signaller',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat, hearing protection and vest with reflective bands, ${v.cfg === 0 ? 'one arm raised and a radio held in the other hand' : v.cfg === 1 ? 'both arms raised overhead' : 'both arms stretched out to the sides'}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((c) => AH.map((ht) => [`${['one arm up with radio', 'both arms up', 'arms out to the sides'][c]}, ${ht} in tall`, 40, 26, 4, 0, { cfg: c, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true }); gear(a, f, { ears: 1, belt: 1 }); const { s, cx, cy } = f;
      if (v.cfg === 0) { armTo(a, f, 1, [cx + 230 * s, cy - 60 * s, 2050 * s]); a.box(cx - 330 * s, cy - 60 * s, 1000 * s, cx - 250 * s, cy - 10 * s, 1170 * s); a.tube([[cx - 290 * s, cy - 30 * s, 1170 * s], [cx - 290 * s, cy - 30 * s, 1260 * s]], [5 * s, 5 * s], 5); }
      else if (v.cfg === 1) { armTo(a, f, 1, [cx + 330 * s, cy - 80 * s, 2080 * s]); armTo(a, f, -1, [cx - 330 * s, cy - 80 * s, 2080 * s]); }
      else { armTo(a, f, 1, [cx + 900 * s, cy - 100 * s, 1460 * s]); armTo(a, f, -1, [cx - 900 * s, cy - 100 * s, 1460 * s]); }
      a.box(cx - 110 * s, cy - 135 * s, 1180 * s, cx + 110 * s, cy - 118 * s, 1260 * s);
      done(a, 'Added the standing figure with hard hat, ear defenders and vest, ' + ['one raised arm and a hand-held radio', 'both arms raised overhead', 'both arms stretched out'][v.cfg] + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic site concrete finisher',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and vest ${v.bull ? 'pushing an 8 ft handled bull float with a 48 in blade' : 'steering a walk-behind power trowel with a 36 in ring guard, a gearbox, an engine and a tall handle'}. A stand-in, not a person.`,
    vs: hv([['with a bull float', 60, 150, 0, { bull: true }], ['with a power trowel', 50, 80, 0, { bull: false }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true, dy: 2000 }); const s = f.s, hx = f.hand[0], hy = f.hand[1];
      if (v.bull) { const by = hy - 2500; a.tube([[hx, hy, 1000 * s], [hx - 60, by + 260, 140]], [14, 14], 6); a.box(hx - 60 - 610, by, 0, hx - 60 + 610, by + 260, 25); a.box(hx - 60 - 610, by + 260, 0, hx - 60 + 610, by + 290, 90); a.box(hx - 100, by + 200, 25, hx + 100, by + 280, 140); a.rect(hx - 60 - 610, by, hx - 60 + 610, by + 290); a.line(hx, hy, hx - 60, by + 260, 'EQUIP-DETAIL'); a.tube([f.lhand, [hx - 20, hy, 1000 * s]], [12 * s, 12 * s], 6); }
      else { const mx = hx - 40, my = hy - 1150; a.tube(ring(mx, my, 70, 450, 18), Array(19).fill(16), 6); for (let k = 0; k < 3; k++) { const an = k * 2.094; a.tube([[mx, my, 90], [mx + Math.cos(an) * 450, my + Math.sin(an) * 450, 70]], [12, 12], 6); } a.cyl(mx, my, 90, 420, 150, 14); a.box(mx - 170, my - 100, 420, mx + 170, my + 280, 760); a.cyl(mx, my + 180, 760, 850, 50, 10);
        a.tube([[mx, my + 300, 450], [hx, hy - 150, 980 * s + 120], [hx, hy, 1000 * s]], [20, 20, 20], 8); a.tube([[hx - 250, hy - 40, 1000 * s], [hx + 250, hy - 40, 1000 * s]], [14, 14], 6); a.circ(mx, my, 450); a.circ(mx, my, 150, 'EQUIP-DETAIL'); }
      done(a, 'Added the standing figure with hard hat and vest, ' + (v.bull ? 'a bull float with a long handle, a 48 in blade with a turned-up edge and a mounting bracket (plan and 3D).' : 'a power trowel with a ring guard, spokes, gearbox, engine and a long handle (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic site labourer carrying materials',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a hard hat and vest ${v.cfg === 0 ? 'with an 8 ft plank on one shoulder' : v.cfg === 1 ? 'with a 12 ft plank on one shoulder' : v.cfg === 2 ? 'carrying a 4 x 8 ft plywood sheet on its edge' : 'carrying two 5 gallon buckets with wire handles'}. A stand-in, not a person.`,
    vs: [0, 1, 2, 3].flatMap((c) => AH.map((ht) => [`${['8 ft plank', '12 ft plank', 'plywood sheet', 'two buckets'][c]}, ${ht} in tall`, 40, 150, 0, 0, { cfg: c, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', hat: 'hardhat', vest: true }); const s = f.s, { cx, cy } = f;
      if (v.cfg < 2) { const L = [2440, 3660][v.cfg], px = cx + 150 * s; a.box(px - 118, cy - L * 0.4, 1480 * s, px + 118, cy + L * 0.6, 1480 * s + 40); a.rect(px - 118, cy - L * 0.4, px + 118, cy + L * 0.6, 'EQUIP-DETAIL'); armTo(a, f, 1, [px, cy - 200 * s, 1510 * s]); }
      else if (v.cfg === 2) { const px = cx + 300 * s, L = 2440; a.box(px - 10, cy - L * 0.5, 300, px + 10, cy + L * 0.5, 1520); a.rect(px - 10, cy - L * 0.5, px + 10, cy + L * 0.5); armTo(a, f, 1, [px - 20, cy - 100 * s, 880 * s]); }
      else for (const [h, k] of [[f.hand, 1], [f.lhand, -1]]) { a.cone(h[0], h[1], h[2] - 330, h[2] - 30, 125, 150, 14); a.tube(ring(h[0], h[1], h[2] - 30, 120, 8, 1.5708).slice(0, 5), Array(5).fill(4), 4); a.circ(h[0], h[1], 150, 'EQUIP-DETAIL'); }
      done(a, 'Added the walking figure with hard hat and vest and ' + ['an 8 ft plank on the shoulder', 'a 12 ft plank on the shoulder', 'a plywood sheet carried on its edge', 'two buckets with wire handles'][v.cfg] + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic site surveyor with an instrument',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and vest ${v.ts ? 'beside a total station on a three-leg tripod, one hand on the instrument' : 'holding a 16 ft levelling staff upright with a foot plate and a bubble'}. A stand-in, not a person.`,
    vs: hv([['at a tripod instrument', 70, 70, 0, { ts: true }], ['with a levelling staff', 30, 30, 0, { ts: false }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true, dx: 750 }); const s = f.s;
      if (v.ts) { const tx = f.cx - 800, ty = f.cy - 100, hh = 1500; for (let k = 0; k < 3; k++) { const an = k * 2.094 + 1.57; const ex = tx + Math.cos(an) * 700, ey = ty + Math.sin(an) * 700; a.tube([[tx, ty, hh], [ex, ey, 0]], [26, 18], 6); a.line(tx, ty, ex, ey, 'EQUIP-DETAIL'); a.cyl(ex, ey, 0, 20, 30, 8); }
        a.cyl(tx, ty, hh, hh + 50, 90, 12); a.box(tx - 85, ty - 90, hh + 50, tx + 85, ty + 90, hh + 360); a.xcyl(tx - 110, tx + 110, ty, hh + 300, 22, 8); a.tube([[tx, ty - 90, hh + 300], [tx, ty - 260, hh + 300]], [28, 40], 8); a.box(tx - 70, ty + 90, hh + 150, tx + 70, ty + 125, hh + 300); a.circ(tx, ty, 100); armTo(a, f, -1, [tx + 100, ty - 80, hh + 250]); }
      else { const hx = f.hand[0], hy = f.hand[1], segs = [[0, 1220, 18], [1220, 2440, 16], [2440, 3660, 14], [3660, 4880, 12]]; for (const [z0, z1, r] of segs) a.tube([[hx, hy, z0 + 40], [hx, hy, z1 + 40]], [r, r], 8); a.box(hx - 45, hy - 45, 0, hx + 45, hy + 45, 40); for (let i = 0; i < 8; i++) a.box(hx - 22, hy - 22 - 6, 200 + i * 560, hx + 22, hy + 22, 200 + i * 560 + 130); a.cyl(hx, hy - 30, 1500, 1540, 25, 10); a.circ(hx, hy, 40); a.circ(hx, hy, 18, 'EQUIP-DETAIL'); }
      done(a, 'Added the standing figure with hard hat and vest and ' + (v.ts ? 'a total station on a tripod with three legs, head plate, telescope and display (plan and 3D).' : 'a four-section staff with a foot plate, graduation bands and a bubble (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic road works flagger',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and vest holding a stop-slow paddle on a 7 ft pole${v.cones ? ', with two traffic cones set out beside' : ''}. A stand-in, not a person.`,
    vs: hv([['holding a paddle', 34, 28, 0, { cones: false }], ['holding a paddle, two cones', 70, 36, 0, { cones: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true }); const s = f.s, hx = f.hand[0], hy = f.hand[1]; a.tube([[hx, hy, 60], [hx, hy, 2050]], [16, 16], 8); a.ycyl(hy - 12, hy + 12, hx, 1940, 230, 8); a.ycyl(hy + 12, hy + 20, hx, 1940, 205, 8); a.box(hx - 25, hy - 14, 1100, hx + 25, hy + 14, 1140); a.line(hx - 230, hy, hx + 230, hy, 'EQUIP-DETAIL'); a.circ(hx, hy, 18, 'EQUIP-DETAIL');
      if (v.cones) { cone(a, f.cx - 650, f.cy - 350); cone(a, f.cx + 750, f.cy - 350); }
      done(a, 'Added the standing figure with hard hat and vest, a pole with an eight-sided paddle face and back' + (v.cones ? ', and two traffic cones with collars (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic site labourer with a wheelbarrow',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a hard hat pushing a single-wheel barrow with a steel tray, two legs and two handles${v.load === 1 ? ', loaded with soil' : v.load === 2 ? ', loaded with a heap of bricks' : ', empty'}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((l) => AH.map((ht) => [`${['empty barrow', 'barrow of soil', 'barrow of bricks'][l]}, ${ht} in tall`, 40, 80, 40, 0, { load: l, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', hat: 'hardhat', dy: 1250 }); const y0 = f.cy - 30 - 1250; wheelbarrow(a, f.cx, y0, 1250, v.load); a.tube([f.hand, [f.cx + 260, f.cy - 30, 900]], [8, 8], 6); a.tube([f.lhand, [f.cx - 260, f.cy - 30, 900]], [8, 8], 6);
      done(a, 'Added the walking figure with hard hat, a barrow with wheel, tray, legs and two handles' + (v.load ? (v.load === 1 ? ' and a heap of soil (plan and 3D).' : ' and a heap of bricks (plan and 3D).') : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic site worker on a stepladder',
    desc: (v) => `A scale figure about 67 in tall in a hard hat standing on the second step from the top of a ${v.lad} ft stepladder with a platform top, a roller held overhead. A stand-in, not a person.`,
    vs: [4, 6, 8].flatMap((lad) => AH.map((ht) => [`on a ${lad} ft stepladder, ${ht} in tall`, 40, 56, 100, 0, { lad, ht, k: lad === 4 ? 2 : lad === 6 ? 3 : 4 }])),
    build: (a, v) => { const H = v.lad * 304.8, x = a.cx, yf = a.cy - 300, yr = a.cy + 500, n = v.lad === 4 ? 3 : v.lad === 6 ? 4 : 5;
      for (const k of [-1, 1]) { a.tube([[x + k * 250, yf, 0], [x + k * 215, yf + 280, H]], [20, 18], 6); a.tube([[x + k * 270, yr, 0], [x + k * 215, yr - 260, H]], [18, 16], 6); a.line(x + k * 250, yf, x + k * 270, yr, 'EQUIP-DETAIL'); }
      for (let i = 1; i <= n; i++) { const t = i / (n + 0.4), zz = H * t, yy = yf + 280 * t, xw = 250 - 35 * t; a.box(x - xw, yy - 90, zz - 15, x + xw, yy + 90, zz + 15); }
      a.box(x - 230, yf + 250, H, x + 230, yf + 560, H + 28); a.rect(x - 280, yf, x + 280, yr); a.rect(x - 230, yf + 250, x + 230, yf + 560, 'EQUIP-DETAIL');
      const stepI = n - 1, zs = H * ((stepI) / (n + 0.4)) + 15, ys = yf + 280 * (stepI / (n + 0.4)) + 30, h = v.ht * IN, u = h / 1700;
      man(a, { x, y: ys + 80, h, pose: 'stand', z: zs }, { hard: 1 });
      a.tube([[x + 215 * u, ys + 80, zs + 1390 * u], [x + 215 * u, ys - 200, zs + 1850 * u], [x + 215 * u, ys - 150, zs + 2150 * u]], [30, 22, 20], 6); a.xcyl(x + 215 * u - 100, x + 215 * u + 100, ys - 150, zs + 2180 * u, 35, 10);
      done(a, `Added a ${v.lad} ft stepladder (A-frame legs, ${n} steps, platform top), a light figure on a step and a roller held up overhead (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic excavation spotter',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat, ear defenders and vest ${v.cfg === 0 ? 'speaking into a radio held at the mouth' : v.cfg === 1 ? 'holding a signal flag on a pole at arm\'s length' : 'holding a signal flag in each hand'}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((c) => AH.map((ht) => [`${['with a radio', 'with a signal flag', 'with two signal flags'][c]}, ${ht} in tall`, 50, 30, 4, 0, { cfg: c, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true }); gear(a, f, { ears: 1, belt: 1 }); const { s, cx, cy } = f;
      if (v.cfg === 0) { const h = armTo(a, f, 1, [cx + 100 * s, cy - 120 * s, 1480 * s]); a.box(h[0] - 30 * s, h[1] - 40 * s, h[2] - 80 * s, h[0] + 30 * s, h[1] + 20 * s, h[2] + 120 * s); }
      else { const ks = v.cfg === 1 ? [1] : [1, -1]; for (const k of ks) { const h = armTo(a, f, k, [cx + k * 560 * s, cy - 220 * s, 1350 * s]); a.tube([[h[0], h[1], h[2] - 250], [h[0], h[1], h[2] + 900]], [11, 11], 6); a.box(h[0] - 5, h[1] - 150, h[2] + 600, h[0] + 5, h[1] + 120, h[2] + 900); a.line(h[0], h[1] - 150, h[0], h[1] + 120, 'EQUIP-DETAIL'); } }
      done(a, 'Added the standing figure with hard hat, ear defenders and vest and ' + ['a radio at the mouth', 'one signal flag on a pole', 'a signal flag in each hand'][v.cfg] + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic plant operator seated in a cab',
    desc: (v) => `Seated scale figure ${v.ht} in tall in the operator's seat of a ${v.nm}: floor, four posts and roof${v.closed ? ', side and rear panels' : ', open sides'}${v.wheel ? ', a steering wheel on its column' : ''}${v.sticks ? ' and two joysticks on armrests' : v.stick1 ? ' and one side joystick' : ''}. Cab and seat only, not a machine. A stand-in, not a person.`,
    vs: [['excavator-style cab', 1050, 1500, 1950, { closed: true, sticks: true }], ['haul-truck-style cab', 1500, 1500, 2150, { closed: true, wheel: true }], ['dozer-style open canopy', 1200, 1500, 2050, { closed: false, sticks: true }], ['crane-style cab', 1300, 1600, 2100, { closed: true, wheel: true, stick1: true }], ['wheel-loader-style cab', 1300, 1500, 2000, { closed: true, wheel: true, stick1: true }]].flatMap(([nm, w, d, h, p]) => AH.map((ht) => [`${nm}, ${ht} in tall`, w / IN, d / IN, h / IN, 0, { ...p, nm, w, d, h, ht }])),
    build: (a, v) => { const c = cabProp(a, a.cx, a.cy, v), h = v.ht * IN; man(a, { x: a.cx, y: c.sy, h, pose: 'sit', seat: 440, z: c.zf, feet: c.zf }, { hard: 1, vest: 1 });
      done(a, 'Added the cab floor, posts and roof, the seat on a pedestal, the dash and pedals' + (v.wheel ? ', a steering wheel and column' : '') + (v.sticks || v.stick1 ? ', joysticks on armrests' : '') + ' and a seated figure with hard hat and vest (plan and 3D).'); } }),

  // ================= mining =================
  fam({ cat: 'people/entourage', title: 'Generic mine worker with a cap lamp',
    desc: (v) => `${v.walk ? 'Walking' : 'Standing'} scale figure ${v.ht} in tall in a hard hat with a cap lamp, a cable down to a battery on the belt, a vest and ${v.walk ? 'a self-rescuer case on the hip and a lunch box in one hand' : 'a self-rescuer case on the hip'}. A stand-in, not a person.`,
    vs: hv([['standing with lamp and battery', 40, 28, 0, { walk: false }], ['walking with lamp and lunch box', 40, 34, 0, { walk: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { pose: v.walk ? 'walk' : 'stand', hat: 'hardhat', vest: true }); gear(a, f, { lamp: 1, belt: 1 }); const s = f.s; a.box(f.cx - 280 * s, f.cy + 20 * s, 820 * s, f.cx - 190 * s, f.cy + 150 * s, 1020 * s); a.cyl(f.cx - 235 * s, f.cy + 85 * s, 1020 * s, 1070 * s, 20 * s, 8); a.rect(f.cx - 280 * s, f.cy + 20 * s, f.cx - 190 * s, f.cy + 150 * s, 'EQUIP-DETAIL');
      if (v.walk) { const h = f.hand; a.box(h[0] - 110 * s, h[1] - 50 * s, h[2] - 220 * s, h[0] + 110 * s, h[1] + 50 * s, h[2] - 20 * s); a.tube([[h[0] - 60 * s, h[1], h[2] - 20 * s], [h[0], h[1], h[2] + 20 * s], [h[0] + 60 * s, h[1], h[2] - 20 * s]], [4, 4, 4], 5); a.rect(h[0] - 110 * s, h[1] - 50 * s, h[0] + 110 * s, h[1] + 50 * s, 'EQUIP-DETAIL'); }
      done(a, 'Added the figure with hard hat, cap lamp, lamp cable, belt battery, vest and a self-rescuer case' + (v.walk ? ' and a lunch box (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic miner carrying drill steel',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a hard hat with a cap lamp carrying a bundle of five ${v.len} ft drill steels on one shoulder. A stand-in, not a person.`,
    vs: [6, 10, 14].flatMap((len) => AH.map((ht) => [`${len} ft steels, ${ht} in tall`, 40, len * 12 + 20, 0, 0, { len, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', hat: 'hardhat', vest: true }); gear(a, f, { lamp: 1 }); const s = f.s, L = v.len * 304.8, px = f.cx + 160 * s, pz = 1470 * s;
      for (const [dx, dz] of [[0, 0], [38, 0], [-38, 0], [19, 33], [-19, 33]]) a.tube([[px + dx, f.cy - L * 0.4, pz + dz], [px + dx, f.cy + L * 0.6, pz + dz]], [18, 18], 6);
      a.line(px - 40, f.cy - L * 0.4, px - 40, f.cy + L * 0.6, 'EQUIP-DETAIL'); a.line(px + 40, f.cy - L * 0.4, px + 40, f.cy + L * 0.6, 'EQUIP-DETAIL'); armTo(a, f, 1, [px, f.cy - 200 * s, pz - 30]);
      done(a, 'Added the walking figure with hard hat and cap lamp and a bundle of five hexagonal-bar style steels of the stated length on the shoulder, held by one hand (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic miner with an air-leg rock drill',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and ear defenders holding a hand-held rock drill on a telescoping air leg set to ${v.lg} in, with a drill steel pointing forward and up. A stand-in, not a person.`,
    vs: hv([['air leg at 36 in', 40, 90, 0, { lg: 36 }], ['air leg at 60 in', 40, 90, 0, { lg: 60 }]], AH),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true, dy: 300 }); gear(a, f, { ears: 1, lamp: 1 }); const s = f.s, zH = v.lg * IN, px = f.cx + 100 * s, py = f.cy - 380;
      a.tube([[px, py + 380, 0], [px, py + 130, zH - 80]], [34, 24], 8); a.box(px - 40, py + 340, 0, px + 40, py + 440, 40); a.tube([[px, py + 30, zH], [px, py - 650, zH + 260]], [75, 62], 8); a.tube([[px, py - 650, zH + 260], [px, py - 1450, zH + 620]], [15, 15], 6);
      a.tube([[px - 90, py + 60, zH + 30], [px - 90, py + 60, zH + 130], [px + 90, py + 60, zH + 130], [px + 90, py + 60, zH + 30]], [10, 10, 10, 10], 6);
      armTo(a, f, 1, [px + 90, py + 60, zH + 90]); armTo(a, f, -1, [px - 60, py + 330, zH * 0.55]); a.line(px, py + 380, px, py - 1450, 'EQUIP-DETAIL'); a.circ(px, py + 380, 50);
      done(a, 'Added the standing figure with hard hat, ear defenders and cap lamp, an air leg with its foot, a drill body with a handle and a steel pointing up and forward (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic miners walking in a mine drift',
    desc: (v) => `${v.n} walking scale figures in single file along a pair of rails with sleepers, each in a hard hat with a cap lamp and vest. Light figures, not people.`,
    vs: [2, 3, 4, 5].map((n) => [`${n} in single file on a track`, 40, 30 + n * 36, 70, 0, { n }]),
    build: (a, v) => { const n = v.n, gap = 1050, L = n * gap + 600, y0 = a.cy - L / 2; for (const k of [-1, 1]) a.box(a.cx + k * 380 - 28, y0, 0, a.cx + k * 380 + 28, y0 + L, 70);
      for (let i = 0; i * 420 < L; i++) a.box(a.cx - 520, y0 + i * 420, 0, a.cx + 520, y0 + i * 420 + 90, 40);
      for (let i = 0; i < n; i++) man(a, { x: a.cx + (i % 2 ? 90 : -90), y: y0 + 450 + i * gap, h: 1620 + (i * 60) % 160, pose: 'walk', z: 70 }, { hard: 1, lamp: 1, vest: 1 });
      a.rect(a.cx - 520, y0, a.cx + 520, y0 + L, 'EQUIP-DETAIL'); a.line(a.cx - 380, y0, a.cx - 380, y0 + L); a.line(a.cx + 380, y0, a.cx + 380, y0 + L);
      done(a, `Added ${n} light walking figures with hard hats, cap lamps and vests on a track of two rails and sleepers (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic mine rescue stretcher team',
    desc: (v) => `${v.n} standing scale figures in hard hats with lamps carrying a pole stretcher with a lying scale figure on a sheet and blanket. Light figures, not people.`,
    vs: [2, 4, 6].map((n) => [`${n} bearers`, 90, 150, 70, 0, { n }]),
    build: (a, v) => { const x = a.cx, y = a.cy, zs = 800; for (const k of [-1, 1]) a.tube([[x + k * 300, y - 1250, zs], [x + k * 300, y + 1250, zs]], [22, 22], 8); a.box(x - 290, y - 1000, zs - 8, x + 290, y + 1000, zs + 6);
      mini(a, { x, y: y - 100, h: 1650, pose: 'lie', z: zs + 6 }); a.box(x - 255, y - 1000, zs + 190, x + 255, y + 100, zs + 235);
      const pos = v.n === 2 ? [[0, -1500], [0, 1500]] : v.n === 4 ? [[-300, -1500], [300, -1500], [-300, 1500], [300, 1500]] : [[-300, -1500], [300, -1500], [-300, 1500], [300, 1500], [-650, 0], [650, 0]];
      pos.forEach(([px, py], i) => man(a, { x: x + px, y: y + py, h: 1650 + (i * 40) % 140, pose: 'stand' }, { hard: 1, lamp: 1, vest: 1 }));
      a.rect(x - 330, y - 1250, x + 330, y + 1250, 'EQUIP-DETAIL');
      done(a, `Added a pole stretcher with a sheet, a lying figure with a blanket and ${v.n} light bearers with hard hats, lamps and vests (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic haul road spotter at a mine',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat, ear defenders and vest ${v.cfg === 0 ? 'holding a stop-slow paddle on a pole' : v.cfg === 1 ? 'with a radio and a hand flag' : 'with a hand flag, standing behind a stepped dirt berm'}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((c) => AH.map((ht) => [`${['with a paddle', 'with radio and flag', 'with a flag at a berm'][c]}, ${ht} in tall`, 60, 40, 4, 0, { cfg: c, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true, dy: 100 }); gear(a, f, { ears: 1 }); const { s, cx, cy } = f;
      if (v.cfg === 0) { const hx = f.hand[0], hy = f.hand[1]; a.tube([[hx, hy, 60], [hx, hy, 2050]], [16, 16], 8); a.ycyl(hy - 12, hy + 12, hx, 1940, 230, 8); a.circ(hx, hy, 18, 'EQUIP-DETAIL'); }
      else { const h = armTo(a, f, 1, [cx + 380 * s, cy - 220 * s, 1350 * s]); a.tube([[h[0], h[1], h[2] - 250], [h[0], h[1], h[2] + 800]], [11, 11], 6); a.box(h[0] - 5, h[1] - 150, h[2] + 520, h[0] + 5, h[1] + 120, h[2] + 800); if (v.cfg === 1) { const r = armTo(a, f, -1, [cx - 120 * s, cy - 130 * s, 1480 * s]); a.box(r[0] - 30 * s, r[1] - 40 * s, r[2] - 80 * s, r[0] + 30 * s, r[1] + 20 * s, r[2] + 110 * s); } }
      if (v.cfg === 2) { const by = cy - 900; for (let i = 0; i < 5; i++) a.box(cx - 1500 + i * 60, by + i * 130, 0, cx + 1500 - i * 60, by + 520 + i * 130 > by + 900 ? by + 900 : by + 520 + i * 130, 220 + i * 220); a.rect(cx - 1500, by, cx + 1500, by + 900, 'EQUIP-DETAIL'); }
      done(a, 'Added the standing figure with hard hat, ear defenders and vest and ' + ['a pole paddle', 'a radio and a hand flag', 'a hand flag behind a stepped berm'][v.cfg] + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic mine rescue wearer with breathing apparatus',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and lamp wearing a full-face mask with a hose, a back frame carrying ${v.tw ? 'two' : 'one'} air cylinder${v.tw ? 's' : ''} and a chest regulator box. A stand-in, not a person.`,
    vs: hv([['with a one-cylinder set', 40, 30, 0, { tw: false }], ['with a two-cylinder set', 40, 30, 0, { tw: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true }); gear(a, f, { lamp: 1 }); const { s, cx, cy } = f; a.box(cx - 180 * s, cy + 105 * s, 1000 * s, cx + 180 * s, cy + 130 * s, 1480 * s);
      for (const dx of (v.tw ? [-85, 85] : [0])) { a.cyl(cx + dx * s, cy + 190 * s, 980 * s, 1560 * s, 78 * s, 12); a.ell(cx + dx * s, cy + 190 * s, 1560 * s, 78 * s, 78 * s, 60 * s, 12, 4); a.box(cx + dx * s - 25 * s, cy + 150 * s, 1600 * s, cx + dx * s + 25 * s, cy + 220 * s, 1650 * s); }
      a.ell(cx, cy - 118 * s, 1590 * s, 85 * s, 30 * s, 100 * s, 12, 6); a.tube([[cx - 60 * s, cy - 130 * s, 1530 * s], [cx - 220 * s, cy - 150 * s, 1420 * s], [cx - 130 * s, cy - 140 * s, 1300 * s]], [10 * s, 10 * s, 10 * s], 6); a.box(cx - 130 * s, cy - 150 * s, 1220 * s, cx + 20 * s, cy - 118 * s, 1330 * s); a.rect(cx - 180 * s, cy + 105 * s, cx + 180 * s, cy + 250 * s, 'EQUIP-DETAIL');
      done(a, 'Added the figure with hard hat and lamp, a full-face mask with hose, a chest regulator box and a back frame with ' + (v.tw ? 'two air cylinders' : 'one air cylinder') + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic miner shovelling at a muck pile',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and lamp with a long-handled shovel at the foot of a ${v.pile} in high heap of broken rock. A stand-in, not a person.`,
    vs: [18, 30, 42].flatMap((pile) => AH.map((ht) => [`${pile} in heap, ${ht} in tall`, 80, 90, 0, 0, { pile, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true, dy: 1100 }); gear(a, f, { lamp: 1 }); const s = f.s, H = v.pile * IN, px = f.cx, py = f.cy - 1500;
      a.cone(px, py, 0, H, 900, 150, 18); for (const [dx, dy, r] of [[-500, 200, 140], [450, 250, 160], [-200, -400, 120], [350, -300, 130], [0, 500, 110]]) a.ell(px + dx, py + dy, r * 0.5, r, r, r * 0.55, 8, 4);
      a.circ(px, py, 900, 'EQUIP-DETAIL'); const hx = f.hand[0], hy = f.hand[1]; a.tube([[hx, hy, 950 * s], [hx - 80, hy - 800, 150]], [14, 14], 6); a.box(hx - 80 - 180, hy - 1150, 60, hx - 80 + 180, hy - 780, 90); a.tube([f.lhand, [hx - 20, hy - 200, 900 * s]], [10 * s, 10 * s], 6);
      done(a, 'Added the standing figure with hard hat, lamp and vest, a long-handled shovel with a wide blade and a conical heap of rock pieces (plan and 3D).'); } }),

  // ================= aviation =================
  fam({ cat: 'people/entourage', title: 'Generic apron marshaller with wands',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat, ear defenders and vest with reflective bands, holding a lit signal wand in each hand${['', ' above the head', ' crossed over the head'][v.cfg] || ''}${v.cfg === 0 ? ', arms out to the sides' : ''}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((c) => AH.map((ht) => [`${['arms out, wands down', 'arms up', 'wands crossed overhead'][c]}, ${ht} in tall`, 60, 30, 4, 0, { cfg: c, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true }); gear(a, f, { ears: 1, belt: 1 }); const { s, cx, cy } = f;
      const T = [[[920, -80, 1400], [-920, -80, 1400]], [[330, -80, 2050], [-330, -80, 2050]], [[120, -90, 2150], [-120, -90, 2150]]][v.cfg], D = [[[1, 0, -0.6], [-1, 0, -0.6]], [[0.4, 0, 1], [-0.4, 0, 1]], [[1, 0, 0.6], [-1, 0, 0.6]]][v.cfg];
      const to = v.cfg === 2 ? [T[1], T[0]] : T;   // crossed: each hand on the opposite side
      [1, -1].forEach((k, i) => { const h = armTo(a, f, k, [cx + to[i][0] * s, cy + to[i][1] * s, to[i][2] * s]); wand(a, h, [D[i][0] * (v.cfg === 2 ? -1 : 1), D[i][1], D[i][2]], 520, 16); });
      done(a, 'Added the standing figure with hard hat, ear defenders and vest and two lit wands ' + ['held out to the sides', 'raised above the head', 'crossed overhead'][v.cfg] + ' (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic apron wing-walker with cones and chocks',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a hard hat, ear defenders and vest with a wand in one hand, ${v.ck ? 'a pair of stepped wheel chocks joined by a rope set down at its feet' : 'and two traffic cones set out on either side'}. A stand-in, not a person.`,
    vs: hv([['with a wand and two cones', 70, 30, 0, { ck: false }], ['with a wand and wheel chocks', 60, 36, 0, { ck: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', hat: 'hardhat', vest: true }); gear(a, f, { ears: 1 }); const { s, cx, cy } = f; const h = f.hand; wand(a, h, [0.3, -1, 0.5], 480, 16);
      if (v.ck) { chock(a, cx - 700, cy - 200); chock(a, cx - 700, cy - 800); a.tube([[cx - 700, cy - 200, 60], [cx - 650, cy - 500, 20], [cx - 700, cy - 800, 60]], [6, 6, 6], 5); }
      else { cone(a, cx - 650, cy - 300); cone(a, cx + 780, cy - 300); }
      done(a, 'Added the walking figure with hard hat, ear defenders and vest, a wand in the hand and ' + (v.ck ? 'a pair of stepped chocks with a rope between them (plan and 3D).' : 'two traffic cones with collars (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic apron baggage handler with a bag cart',
    desc: (v) => `Walking scale figure ${v.ht} in tall in a hard hat and vest carrying a suitcase beside a ${v.cl} in baggage cart with a deck, low side rails, two axles with four wheels, a drawbar and ${v.nb} suitcases laid flat. A stand-in, not a person.`,
    vs: [[72, 4], [100, 8], [128, 12]].flatMap(([cl, nb]) => AH.map((ht) => [`${cl} in cart with ${nb} bags, ${ht} in tall`, 90, cl + 40, 60, 0, { cl, nb, ht }])),
    build: (a, v) => { const L = v.cl * IN, W = 1100, x = a.cx + 300, y0 = a.cy - L / 2; a.box(x - W / 2, y0, 380, x + W / 2, y0 + L, 420);
      for (const k of [-1, 1]) { a.tube([[x + k * W / 2, y0 + 14, 700], [x + k * W / 2, y0 + L - 14, 700]], [14, 14], 6); for (const t of [0, 0.5, 1]) a.box(x + k * W / 2 - 14, y0 + t * (L - 28), 420, x + k * W / 2 + 14, y0 + t * (L - 28) + 28, 700); }
      for (const ay of [y0 + L * 0.18, y0 + L * 0.82]) { a.xcyl(x - W / 2 - 40, x + W / 2 + 40, ay, 190, 20, 8); for (const k of [-1, 1]) a.xcyl(x + k * (W / 2 + 20) - 30, x + k * (W / 2 + 20) + 30, ay, 190, 190, 16); }
      a.tube([[x, y0, 400], [x, y0 - 900, 250]], [18, 18], 8); a.tube(ringE(x, y0 - 940, 250, 45, 45, 8), Array(9).fill(10), 5);
      const rows = v.nb / 2, pitch = (L - 200) / rows; for (let r = 0; r < rows; r++) for (const c of [-1, 1]) suitcase(a, x + c * 260, y0 + 100 + pitch * (r + 0.5), 420, 470, Math.min(560, pitch - 40), 230 + ((r + (c > 0 ? 1 : 0)) % 3) * 45);
      a.rect(x - W / 2, y0, x + W / 2, y0 + L); a.line(x, y0, x, y0 - 940, 'EQUIP-DETAIL');
      const f = fig(a, v.ht, { pose: 'walk', hat: 'hardhat', vest: true, dx: -730, lo: true }); suitcase(a, f.hand[0] + 40 * f.s, f.hand[1], f.hand[2] - 620 * f.s, 450 * f.s, 230 * f.s, 560 * f.s); a.tube([[f.hand[0], f.hand[1], f.hand[2]], [f.hand[0] + 40 * f.s, f.hand[1], f.hand[2] - 40 * f.s]], [10, 10], 5);
      done(a, `Added a ${v.cl} in baggage cart (deck, rails, two axles with four wheels, drawbar), ${v.nb} suitcases laid flat and a walking figure with hard hat and vest carrying a suitcase (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic pilot seated on a flight deck',
    desc: (v) => `Seated scale figure ${v.ht} in tall in the pilot seat of ${v.nm}: floor, seat with cushion and back, ${v.type === 0 ? 'armrests, a yoke on a column, a centre pedestal, an instrument panel with glare shield and windscreen posts' : v.type === 1 ? 'a control column with a wheel, an instrument panel and door posts with a windshield arch' : 'a cyclic stick, a collective lever, pedals, an instrument panel and canopy arches'}. Seat and controls only, not an aircraft. A stand-in, not a person.`,
    vs: [['an airliner-style flight deck', 0], ['a light-aircraft-style cockpit', 1], ['a helicopter-style cockpit', 2]].flatMap(([nm, type]) => AH.map((ht) => [`${nm}, ${ht} in tall`, [1500, 1100, 1100][type] / IN, 1500 / IN, 76, 0, { nm, type, ht }])),
    build: (a, v) => { const t = v.type, x = a.cx, y = a.cy, W = [1500, 1100, 1100][t], D = [1500, 1300, 1300][t], zf = 40, sy = y + D / 2 - 450, h = v.ht * IN;
      a.box(x - W / 2, y - D / 2, 0, x + W / 2, y + D / 2, zf); a.cyl(x, sy, zf, zf + 400, 80, 10); const sw = t === 0 ? 500 : 440;
      a.box(x - sw / 2, sy - 240, zf + 400, x + sw / 2, sy + 240, zf + 440); a.box(x - sw / 2, sy + 200, zf + 440, x + sw / 2, sy + 260, zf + 1100); if (t < 2) a.box(x - 170, sy + 200, zf + 1100, x + 170, sy + 260, zf + 1300); a.rect(x - sw / 2, sy - 240, x + sw / 2, sy + 260, 'EQUIP-DETAIL');
      if (t === 0) { for (const k of [-1, 1]) a.box(x + k * (sw / 2 + 30) - 20, sy - 140, zf + 440, x + k * (sw / 2 + 30) + 20, sy + 120, zf + 600); a.box(x + 420, sy - 750, zf, x + 640, sy + 50, zf + 450);
        a.box(x - 680, sy - 1000, zf + 700, x + 680, sy - 880, zf + 1150); a.box(x - 680, sy - 1080, zf + 1150, x + 680, sy - 840, zf + 1210); a.tube([[x, sy - 880, zf + 800], [x, sy - 600, zf + 900]], [26, 26], 8); a.tube([[x - 200, sy - 600, zf + 1060], [x - 200, sy - 600, zf + 930], [x + 200, sy - 600, zf + 930], [x + 200, sy - 600, zf + 1060]], [16, 16, 16, 16], 8);
        for (const k of [-1, 1]) a.tube([[x + k * 680, sy - 1000, zf + 1210], [x + k * 560, sy - 560, zf + 1850]], [24, 20], 6); a.tube([[x - 560, sy - 560, zf + 1850], [x + 560, sy - 560, zf + 1850]], [22, 22], 6); a.circ(x, sy - 600, 220, 'EQUIP-DETAIL'); }
      if (t === 1) { a.box(x - 520, sy - 900, zf + 650, x + 520, sy - 780, zf + 1050); a.tube([[x, sy - 780, zf + 300], [x, sy - 540, zf + 760]], [24, 24], 8); a.tube([[x - 170, sy - 540, zf + 760], [x - 170, sy - 540, zf + 880], [x + 170, sy - 540, zf + 880], [x + 170, sy - 540, zf + 760]], [14, 14, 14, 14], 8);
        for (const k of [-1, 1]) { a.tube([[x + k * 520, sy - 900, zf + 1050], [x + k * 520, sy + 200, zf + 1750]], [22, 22], 6); a.tube([[x + k * 520, sy - 900, zf + 1050], [x + k * 440, sy - 560, zf + 1650]], [20, 18], 6); } a.tube([[x - 440, sy - 560, zf + 1650], [x + 440, sy - 560, zf + 1650]], [20, 20], 6); a.tube([[x - 520, sy + 200, zf + 1750], [x + 520, sy + 200, zf + 1750]], [20, 20], 6); a.circ(x, sy - 540, 170, 'EQUIP-DETAIL'); }
      if (t === 2) { a.box(x - 450, sy - 900, zf + 500, x + 450, sy - 780, zf + 950); a.tube([[x, sy - 330, zf + 60], [x, sy - 400, zf + 820]], [20, 24], 8); a.ell(x, sy - 405, zf + 850, 40, 36, 40, 8, 5); a.tube([[x - 380, sy - 40, zf + 300], [x - 380, sy - 470, zf + 470]], [24, 28], 8); for (const k of [-1, 1]) a.box(x + k * 190 - 70, sy - 680, zf, x + k * 190 + 70, sy - 520, zf + 90);
        for (const yy of [sy - 760, sy - 150, sy + 450]) { const pts = Array.from({ length: 9 }, (_, i) => { const th = (i / 8) * Math.PI; return [x + Math.cos(th) * 540, yy, zf + 250 + Math.sin(th) * 1700]; }); a.tube(pts, Array(9).fill(20), 6); } for (const th of [0.5, 1.571, 2.64]) a.tube([[x + Math.cos(th) * 540, sy - 760, zf + 250 + Math.sin(th) * 1700], [x + Math.cos(th) * 540, sy + 450, zf + 250 + Math.sin(th) * 1700]], [18, 18], 6); a.line(x - 380, sy - 40, x - 380, sy - 470, 'EQUIP-DETAIL'); a.circ(x, sy - 405, 40, 'EQUIP-DETAIL'); }
      a.rect(x - W / 2, y - D / 2, x + W / 2, y + D / 2, 'EQUIP-DETAIL');
      man(a, { x, y: sy, h, pose: 'sit', seat: 440, z: zf, feet: zf }, { cap: t === 0 ? 1 : 0, hard: 0 });
      done(a, 'Added the floor, the seat with cushion, back' + (t < 2 ? ' and headrest' : '') + ', ' + ['armrests, a yoke on a column, a centre pedestal, the instrument panel with glare shield and windscreen posts', 'a control column with a wheel, the instrument panel, door posts and a windshield arch', 'a cyclic stick, a collective lever, pedals, the panel and canopy arches'][t] + ' and a seated figure (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic flight attendant with a galley cart',
    desc: (v) => `Walking scale figure ${v.ht} in tall pushing a ${v.cl === 30 ? '30 in long' : '15 in long'} galley cart 12 in wide with door seams, a handle bar, four small casters${v.jug ? ' and a coffee jug on the top' : ''}. A stand-in, not a person.`,
    vs: hv([['with a full-length cart', 20, 46, 0, { cl: 30, jug: false }], ['with a half-length cart', 20, 34, 0, { cl: 15, jug: false }], ['with a full cart and coffee jug', 20, 46, 0, { cl: 30, jug: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { pose: 'walk', dy: 650 }); const L = v.cl * IN, yb = f.cy - 260, x = f.cx + 120 * f.s; galleyCart(a, x, yb, L, 305, 1020, v.jug); a.tube([f.hand, [x + 100, yb - 10, 1020]], [8, 8], 6);
      done(a, 'Added the walking figure and a galley cart with door seams, a handle bar, a pull latch and four casters' + (v.jug ? ', and a coffee jug with a lid and tap on the top (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic flight attendant giving a safety demonstration',
    desc: (v) => `Standing scale figure ${v.ht} in tall ${v.cfg === 0 ? 'with one arm stretched out to point and the other bent at the waist' : 'holding an oxygen mask cup in one raised hand on a hose that runs up to an overhead panel'}. A stand-in, not a person.`,
    vs: [0, 1].flatMap((c) => HT.map((ht) => [`${['pointing the way', 'holding up a mask on its hose'][c]}, ${ht} in tall`, 50, 30, 20, 0, { cfg: c, ht }])),
    build: (a, v) => { const f = fig(a, v.ht, {}); const { s, cx, cy } = f;
      if (v.cfg === 0) { armTo(a, f, 1, [cx + 950 * s, cy - 450 * s, 1420 * s]); armTo(a, f, -1, [cx - 330 * s, cy - 250 * s, 1080 * s]); }
      else { const h = armTo(a, f, 1, [cx + 150 * s, cy - 330 * s, 1500 * s]); a.cone(h[0], h[1] - 60, h[2] - 20, h[2] + 90, 50, 90, 12); a.tube([[h[0], h[1] - 60, h[2] + 90], [h[0] + 120, h[1] - 100, h[2] + 400], [h[0] + 60, h[1] - 80, 2150 * s]], [8, 8, 8], 6); a.box(h[0] - 250, h[1] - 300, 2150 * s, h[0] + 350, h[1] + 200, 2150 * s + 60); armTo(a, f, -1, [cx - 200 * s, cy - 150 * s, 1000 * s]); a.circ(h[0], h[1] - 60, 70, 'EQUIP-DETAIL'); }
      done(a, 'Added the standing figure with ' + (v.cfg === 0 ? 'one arm pointing and one arm bent (plan and 3D).' : 'a raised hand holding a mask cup, its hose and an overhead panel (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic aircraft mechanic on a maintenance platform',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a cap and vest on the deck of a rolling maintenance platform ${v.pl} in high with a ${v.ns}-step stair, handrails on the stair and three sides of the deck, four legs and four casters. A stand-in, not a person.`,
    vs: [36, 60, 84].flatMap((pl) => AH.map((ht) => [`${pl} in platform, ${ht} in tall`, 56, 80 + pl, pl + 80, 0, { pl, ht, ns: Math.ceil((pl * IN) / 200) }])),
    build: (a, v) => { const H = v.pl * IN, n = v.ns, x = a.cx, y0 = a.cy, DW = 1300, DD = 1100, rise = H / n, run = 260;
      a.box(x - DW / 2, y0, H - 40, x + DW / 2, y0 + DD, H);
      for (const [px, py] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) { const lx = x + px * (DW / 2 - 50), ly = y0 + 50 + py * (DD - 100); a.tube([[lx, ly, H - 40], [lx, ly, 100]], [24, 24], 6); a.xcyl(lx - 20, lx + 20, ly, 80, 80, 12); }
      a.tube([[x - DW / 2 + 50, y0 + 50, 150], [x + DW / 2 - 50, y0 + 50, 150]], [14, 14], 6); a.tube([[x - DW / 2 + 50, y0 + DD - 50, 150], [x + DW / 2 - 50, y0 + DD - 50, 150]], [14, 14], 6);
      for (let i = 1; i <= n; i++) a.box(x - 450, y0 - i * run, i * rise - 40, x + 450, y0 - (i - 1) * run, i * rise);
      for (const k of [-1, 1]) { const rx = x + k * 450; a.tube([[rx, y0 - n * run, 0], [rx, y0, H - 40]], [18, 18], 6); a.tube([[rx, y0 - n * run, 950], [rx, y0 - run, H + 950], [rx, y0 + DD, H + 1000]], [16, 16, 16], 6); a.tube([[rx, y0 - n * run, 450], [rx, y0 - run, H + 450]], [12, 12], 6); a.tube([[x + k * (DW / 2 - 10), y0 + DD, H + 1000], [x + k * (DW / 2 - 10), y0, H + 1000]], [16, 16], 6); }
      a.tube([[x - DW / 2 + 10, y0 + DD, H + 1000], [x + DW / 2 - 10, y0 + DD, H + 1000]], [16, 16], 6); for (const k of [-1, 1]) { a.tube([[x + k * (DW / 2 - 10), y0 + DD, H], [x + k * (DW / 2 - 10), y0 + DD, H + 1000]], [14, 14], 6); a.tube([[x + k * (DW / 2 - 10), y0, H], [x + k * (DW / 2 - 10), y0, H + 1000]], [14, 14], 6); }
      a.box(x + 300, y0 + 550, H, x + 750, y0 + 850, H + 280);
      a.rect(x - DW / 2, y0, x + DW / 2, y0 + DD); a.rect(x - 450, y0 - n * run, x + 450, y0, 'EQUIP-DETAIL'); for (let i = 1; i < n; i++) a.line(x - 450, y0 - i * run, x + 450, y0 - i * run, 'EQUIP-DETAIL');
      man(a, { x: x - 150, y: y0 + 500, h: v.ht * IN, pose: 'stand', z: H }, { cap: 1, vest: 1 });
      done(a, `Added the platform (deck, four legs with casters, ${n} stair treads, stringers, handrails on the stair and three sides of the deck), a toolbox and a standing figure with a cap and vest on the deck (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic hangar mechanic with a tool cart',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a cap and vest opening a drawer of a ${v.n}-drawer rolling tool cart ${v.cw} in wide${v.top ? ' with a lidded top chest' : ''}, with a push handle and four casters. A stand-in, not a person.`,
    vs: hv([['at a 4-drawer cart', 54, 40, 0, { n: 4, cw: 28, top: false }], ['at a 7-drawer cart with top chest', 62, 40, 0, { n: 7, cw: 40, top: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'cap', vest: true, dx: -(v.cw * IN / 2 + 330) + 0, dy: 300 }); const cw = v.cw * IN, x = f.cx + cw / 2 + 330, yb = f.cy - 150; const hh = v.top ? 1280 : 920; toolCart(a, x, yb, cw, 560, hh, v.n, v.top);
      armTo(a, f, 1, [x - cw * 0.3, yb - 620, 520]); a.box(x - 200, yb - 640, 420, x + 200, yb - 560, 470);
      done(a, `Added the standing figure with a cap and vest and a ${v.n}-drawer tool cart with drawer fronts and pulls, a push handle and four casters${v.top ? ', a lidded top chest' : ''} and one drawer pulled open (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic aircraft refuelling operator',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and vest ${v.reel ? 'with a nozzle in hand and a hose running to a reel cart with a drum on two wheels' : 'with a coiled hose over the shoulder and a nozzle in hand'}. A stand-in, not a person.`,
    vs: hv([['with a hose over the shoulder', 50, 40, 0, { reel: false }], ['at a hose-reel cart', 70, 70, 0, { reel: true }]], HT),
    build: (a, v) => { const f = fig(a, v.ht, { hat: 'hardhat', vest: true, dy: 400 }); gear(a, f, { ears: 1 }); const { s, cx, cy } = f, h = f.hand; a.tube([h, [h[0] + 20, h[1] - 330 * s, 780 * s]], [24 * s, 20 * s], 8); a.cone(h[0] + 20, h[1] - 330 * s, 700 * s, 790 * s, 14, 28, 8);
      if (!v.reel) { for (let k = 0; k < 3; k++) a.tube(ringE(cx, cy, (1200 + k * 90) * s, 250 * s, 190 * s, 16), Array(17).fill(22 * s), 6); a.tube([h, [cx + 250 * s, cy + 10, 1180 * s]], [20 * s, 20 * s], 6); }
      else { const rx = cx - 800, ry = cy - 400; a.box(rx - 330, ry - 220, 150, rx + 330, ry + 220, 190); a.xcyl(rx - 380, rx + 380, ry + 190, 150, 150, 14); a.xcyl(rx - 330, rx + 330, ry, 560, 190, 18); for (const k of [-1, 1]) a.xcyl(rx + k * 330 - 15, rx + k * 330 + 15, ry, 560, 290, 18); a.box(rx - 330, ry - 230, 190, rx - 280, ry + 230, 700); a.box(rx + 280, ry - 230, 190, rx + 330, ry + 230, 700); a.tube([[rx + 330, ry - 100, 360], [cx - 100, cy - 200, 220], [h[0], h[1], h[2] - 100]], [26, 26, 22], 8); a.circ(rx, ry, 290, 'EQUIP-DETAIL'); a.rect(rx - 380, ry - 230, rx + 380, ry + 230); }
      done(a, 'Added the standing figure with hard hat, ear defenders and vest, a nozzle in the hand and ' + (v.reel ? 'a hose reel cart with a drum, flanges, wheels and a hose run (plan and 3D).' : 'three coils of hose over the shoulder (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic apron ground crew in a line',
    desc: (v) => `${v.n} standing scale figures side by side in hard hats and vests, each with a lit wand in the right hand. Light figures, not people.`,
    vs: [3, 4, 5].map((n) => [`${n} in a line with wands`, n * 42, 30, 70, 0, { n }]),
    build: (a, v) => { const n = v.n, gap = 1050, x0 = a.cx - ((n - 1) * gap) / 2; for (let i = 0; i < n; i++) { const x = x0 + i * gap, h = 1620 + (i * 70) % 160, u = h / 1700; man(a, { x, y: a.cy + (i % 2 ? 90 : 0), h, pose: 'stand' }, { hard: 1, vest: 1 }); wand(a, [x + 215 * u, a.cy + (i % 2 ? 90 : 0), 880 * u], [0.4, -1, 0.5], 480, 14); }
      done(a, `Added ${n} light figures with hard hats and vests and a lit wand each, staggered slightly in plan (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic flight crew walking with roller bags',
    desc: (v) => `${v.n} walking scale figures side by side, each with a roller bag on its handle, alternate figures in peaked-style caps. Light figures, not people.`,
    vs: [2, 3, 4].map((n) => [`${n} abreast with bags`, n * 52, 34, 70, 0, { n }]),
    build: (a, v) => { const n = v.n, gap = 1250, x0 = a.cx - ((n - 1) * gap) / 2; for (let i = 0; i < n; i++) { const x = x0 + i * gap, y = a.cy + (i % 2 ? 80 : 0); man(a, { x, y, h: 1640 + (i * 55) % 120, pose: 'walk' }, { cap: i % 2 === 0 ? 1 : 0 }); roller(a, x + 480, y + 20, 360, 230, 480); a.tube([[x + 215, y, 880], [x + 330, y + 20, 1000]], [10, 10], 5); }
      done(a, `Added ${n} light walking figures with alternating strides, caps on alternate figures and a roller bag with handle and wheels beside each (plan and 3D).`); } }),
];
// ---- fit: every figure's footprint and height are measured from what its builder draws, then the drawing is centred on x and set flush to y = 0 ----
function recenter(a) {
  let x0 = 1e18, x1 = -1e18, y1 = -1e18;
  for (const t of a.t) for (const p of t) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  for (const sh of a.p) {
    const bx = sh.kind === 'rect' ? [sh.x0, sh.x1] : sh.kind === 'line' ? [sh.x1, sh.x2] : null;
    if (bx) { x0 = Math.min(x0, ...bx); x1 = Math.max(x1, ...bx); }
  }
  const dx = -(x0 + x1) / 2, dy = -y1, seen = new Set();
  for (const t of a.t) for (const p of t) if (!seen.has(p)) { seen.add(p); p[0] += dx; p[1] += dy; }
  for (const sh of a.p) {
    if (sh.kind === 'rect') { sh.x0 += dx; sh.x1 += dx; sh.y0 += dy; sh.y1 += dy; }
    else if (sh.kind === 'line') { sh.x1 += dx; sh.x2 += dx; sh.y1 += dy; sh.y2 += dy; }
    else if (sh.kind === 'poly') sh.pts = sh.pts.map(([x, y]) => [x + dx, y + dy]);
    else { sh.x += dx; sh.y += dy; }
  }
}
function measure(f, row) {
  let [, w, d, h, z] = row;
  for (let pass = 0; pass < 4; pass++) {
    const a = new Acc({ x: -w * IN / 2, y: -d * IN, z: z * IN, w: w * IN, d: d * IN, h: h * IN });
    f.build(a, { label: row[0], w, d, h, z, ...row[5] }); recenter(a);
    let x0 = 1e18, x1 = -1e18, y0 = 1e18, z1 = -1e18;
    for (const t of a.t) for (const p of t) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); z1 = Math.max(z1, p[2]); }
    const q = (v) => Math.ceil((v / IN) * 4) / 4;
    const nw = q(x1 - x0) + 0.25, nd = q(-y0) + 0.25, nh = q(z1) + 0.25;
    if (nw === w && nd === d && nh === h) break;
    w = nw; d = nd; h = nh;
  }
  return [row[0], w, d, h, z, row[5]];
}
export default FAMS.map((f) => {
  const g = { ...f, build: (a, v) => { f.build(a, v); recenter(a); } };
  g.vs = f.vs.map((r) => measure(g, r));
  return g;
});
