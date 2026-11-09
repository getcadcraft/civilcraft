/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r4-people.mjs — round 4, group people (2026-11-03): scale figures for restaurants, airports and shopping centres. 150 variants.
 * Every figure is a generic scale figure (a stand-in for a person, not a person's measurements). Singles use the lofted figure2; groups, seated,
 * lying and wheelchair figures use `mini`, a lighter figure built from tubes and ellipsoids so a group stays a sensible size.
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

const LOGS = {
  fig: 'Added the lofted figure with its props (plan and 3D).',
};
const done = (a, t) => a.log(t);
const sz = (ht) => (ht * IN) / 1732;

const FAMS = [
  // ---------------- restaurants ----------------
  fam({ cat: 'people/entourage', title: 'Generic server carrying a tray',
    desc: (v) => `Walking scale figure ${v.ht} in tall carrying a round tray with plates and glasses ${v.high ? 'at shoulder height' : 'at waist height'}. A stand-in, not a person.`,
    vs: hv([['tray at shoulder height', 34, 32, 3.5, { high: true }], ['tray at waist height', 34, 32, 0, { high: false }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk', dx: -150 * s, dy: 0 }); const z = v.high ? 1500 * s : 1000 * s; tray(a, f.cx + 330 * s, f.cy - 60 * s, z, 230 * s); a.cyl(f.cx + 250 * s, f.cy - 30 * s, z - 80 * s, z, 20 * s, 8); done(a, 'Added the walking figure, the round tray with plates and glasses on the raised hand, and the plan footprints.'); } }),
  fam({ cat: 'people/entourage', title: 'Generic host at a stand',
    desc: (v) => `Standing scale figure ${v.ht} in tall behind a ${v.menus ? 'host stand holding a stack of menus' : 'host stand with a sloped top'}. A stand-in, not a person.`,
    vs: hv([['at a host stand', 30, 28, 0, { menus: false }], ['at a host stand with menus', 30, 28, 0, { menus: true }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { dy: 110 }); const y0 = f.cy - 520, y1 = f.cy - 240; a.box(f.cx - 300, y0, 0, f.cx + 300, y1, 1000); a.prism([[f.cx - 320, y0 - 20], [f.cx + 320, y0 - 20], [f.cx + 320, y1 + 20], [f.cx - 320, y1 + 20]], 1000, 1050); a.box(f.cx - 300, y0 + 10, 40, f.cx + 300, y0 + 40, 600); a.rect(f.cx - 320, y0 - 20, f.cx + 320, y1 + 20); a.rect(f.cx - 300, y0, f.cx + 300, y1, 'EQUIP-DETAIL'); if (v.menus) { for (let i = 0; i < 4; i++) a.box(f.cx + 40 + i * 6, y0 + 40, 1050 + i * 6, f.cx + 220 + i * 6, y0 + 230, 1060 + i * 6); a.rect(f.cx + 40, y0 + 40, f.cx + 240, y0 + 230, 'EQUIP-DETAIL'); } done(a, 'Added the standing figure behind a host stand with its sloped top and kick panel' + (v.menus ? ', and a stack of menus (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic bartender behind a bar',
    desc: (v) => `Standing scale figure ${v.ht} in tall behind a ${v.bar} in bar section with a foot rail and back-bar shelf. A stand-in, not a person.`,
    vs: hv([['behind a 48 in bar', 50, 34, 0, { bar: 48 }], ['behind a 72 in bar', 74, 34, 0, { bar: 72 }]]),
    build: (a, v) => { const f = fig(a, v.ht, { dy: 280 }); const W = v.bar * IN; const y0 = f.cy - 760, y1 = f.cy - 420; a.box(a.cx - W / 2, y0, 0, a.cx + W / 2, y1, 1040); a.box(a.cx - W / 2 - 30, y0 - 50, 1040, a.cx + W / 2 + 30, y1 + 20, 1090); a.xcyl(a.cx - W / 2 + 40, a.cx + W / 2 - 40, y0 - 30, 160, 28, 10); const by = f.cy + 560; a.box(a.cx - W / 2, by - 120, 900, a.cx + W / 2, by, 1000); for (let i = 0; i < Math.floor(v.bar / 12); i++) a.cyl(a.cx - W / 2 + 120 + i * 300, by - 60, 1000, 1240, 32, 8); a.rect(a.cx - W / 2 - 30, y0 - 50, a.cx + W / 2 + 30, y1 + 20); a.rect(a.cx - W / 2, by - 120, a.cx + W / 2, by, 'EQUIP-DETAIL'); done(a, 'Added the standing figure, the bar front with its top rail and foot rail, and the back-bar shelf with bottles (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic line cook',
    desc: (v) => `Standing scale figure ${v.ht} in tall wearing a ${v.hat === 'toque' ? 'tall chef hat' : 'flat cap'} at a work counter with a pan on it. A stand-in, not a person.`,
    vs: hv([['in a chef hat at a counter', 40, 32, 7.5, { hat: 'toque', k: 1.0 }], ['in a cap at a counter', 40, 32, 1.5, { hat: 'cap' }]]),
    build: (a, v) => { const f = fig(a, v.ht, { hat: v.hat, dy: 140 }); counterProp(a, f.cx, f.cy - 760, 900, 520, 910); a.box(f.cx - 130, f.cy - 640, 950, f.cx + 130, f.cy - 400, 990); a.box(f.cx + 130, f.cy - 540, 960, f.cx + 290, f.cy - 500, 975); a.cyl(f.cx - 340, f.cy - 560, 950, 1050, 90, 14); a.circ(f.cx - 340, f.cy - 560, 90, 'EQUIP-DETAIL'); done(a, 'Added the standing figure with its hat, the work counter, a sauté pan with handle and a stock pot (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic diner seated at a table',
    desc: (v) => `Seated scale figure at a ${v.round ? '36 in round' : '30 in square'} table with a chair and place setting, sized for a ${v.ht} in adult. A stand-in, not a person.`,
    vs: hv([['at a 30 in square table', 36, 44, 0, { round: false, k: 0.64 }], ['at a 36 in round table', 40, 48, 0, { round: true, k: 0.64 }]], [61, 67, 73]),
    build: (a, v) => { const h = v.ht * IN, cx = a.cx, tz = 740, tw = v.round ? 914 : 762; mini(a, { x: cx, y: a.cy + 330, h, pose: 'sit', feet: 0 }); chair(a, cx, a.cy + 340, 450, 430, 420); const ty = a.cy - 330 - tw / 2 + 80; if (v.round) { a.ell(cx, ty, tz - 18, tw / 2, tw / 2, 18, 24, 4); a.cyl(cx, ty, 40, tz - 36, 40, 12); a.cyl(cx, ty, 0, 40, 260, 16); a.circ(cx, ty, tw / 2); a.circ(cx, ty, 260, 'EQUIP-HIDDEN'); } else { a.box(cx - tw / 2, ty - tw / 2, tz - 36, cx + tw / 2, ty + tw / 2, tz); for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(cx + px * (tw / 2 - 40) - 25, ty + py * (tw / 2 - 40) - 25, 0, cx + px * (tw / 2 - 40) + 25, ty + py * (tw / 2 - 40) + 25, tz - 36); a.rect(cx - tw / 2, ty - tw / 2, cx + tw / 2, ty + tw / 2); } a.cyl(cx, ty + tw * 0.2, tz, tz + 16, 130, 16); a.cyl(cx + 190, ty + tw * 0.2, tz, tz + 110, 32, 10); a.circ(cx, ty + tw * 0.2, 130, 'EQUIP-DETAIL'); done(a, 'Added the seated figure, a dining chair, the table with legs and a plate and glass as a place setting (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic party seated at a table',
    desc: (v) => `${v.n} seated scale figures around a ${v.tbl}. Chairs, a table with legs or a pedestal, and place settings are drawn; figures are stand-ins, not people.`,
    vs: [['2 at a 30 in square table', 56, 56, 46, 0, { n: 2, shape: 'sq', tw: 30, tbl: '30 in square table' }], ['4 at a 36 in square table', 66, 66, 46, 0, { n: 4, shape: 'sq', tw: 36, tbl: '36 in square table' }], ['4 at a 42 in round table', 72, 72, 46, 0, { n: 4, shape: 'rd', tw: 42, tbl: '42 in round table' }], ['5 at a 54 in round table', 90, 90, 46, 0, { n: 5, shape: 'rd', tw: 54, tbl: '54 in round table' }], ['6 at a 60 in round table', 96, 96, 46, 0, { n: 6, shape: 'rd', tw: 60, tbl: '60 in round table' }], ['8 at a 72 in round table', 108, 108, 46, 0, { n: 8, shape: 'rd', tw: 72, tbl: '72 in round table' }]],
    build: (a, v) => { const cx = a.cx, cy = a.cy, tw = v.tw * IN, tz = 740; if (v.shape === 'rd') { a.ell(cx, cy, tz - 18, tw / 2, tw / 2, 18, 28, 4); a.cyl(cx, cy, 40, tz - 36, 45, 12); a.cyl(cx, cy, 0, 40, 280, 18); a.circ(cx, cy, tw / 2); a.circ(cx, cy, 280, 'EQUIP-HIDDEN'); } else { a.box(cx - tw / 2, cy - tw / 2, tz - 36, cx + tw / 2, cy + tw / 2, tz); for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(cx + px * (tw / 2 - 40) - 25, cy + py * (tw / 2 - 40) - 25, 0, cx + px * (tw / 2 - 40) + 25, cy + py * (tw / 2 - 40) + 25, tz - 36); a.rect(cx - tw / 2, cy - tw / 2, cx + tw / 2, cy + tw / 2); }
      const n = v.n, R = tw / 2 + 330; for (let i = 0; i < n; i++) { const an = (i / n) * 6.2832 + (n === 2 ? 1.5708 : 0.7854 * (n === 4 && v.shape === 'sq' ? 0 : 0)); const x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R; mini(a, { x, y, h: 1680, pose: 'sit', feet: 0 }); a.cyl(x - Math.cos(an) * (R - tw / 2 - 90), y - Math.sin(an) * (R - tw / 2 - 90), tz, tz + 14, 100, 12); a.box(x - 200, y - 200 + 0, 440, x + 200, y + 200, 470); a.rect(x - 200, y - 200, x + 200, y + 200, 'EQUIP-DETAIL'); } done(a, `Added ${n} light seated figures, a seat under each, the table with its legs or pedestal and a plate at each place (plan and 3D).`); } }),

  // ---------------- airports ----------------
  fam({ cat: 'people/entourage', title: 'Generic traveller with a roller bag',
    desc: (v) => `Walking scale figure ${v.ht} in tall pulling a ${v.bagH}-inch roller bag on its extended handle. The bag is a box on wheels. A stand-in, not a person.`,
    vs: hv([['with a 22 in cabin bag', 30, 36, 0, { bagH: 22, bw: 360, bd: 230 }], ['with a 28 in checked bag', 32, 38, 0, { bagH: 28, bw: 450, bd: 290 }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk', dx: -150 * s }); const bx = f.cx + 400 * s, by = f.cy + 80 * s; roller(a, bx, by, v.bw * s * 1.1, v.bd * s * 1.1, v.bagH * IN * s * 1.0 * 0.9); a.tube([[bx - v.bw * 0.28 * s * 1.1, by + 0.3 * v.bd * s * 1.1, v.bagH * IN * s * 0.9 + 60 + 300], [f.hand[0], f.hand[1], f.hand[2]]], [8, 8], 6); done(a, 'Added the walking figure and a roller bag with its telescoping handle, front pocket, two fixed wheels and two spinner wheels (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic traveller with a backpack',
    desc: (v) => `Walking scale figure ${v.ht} in tall wearing a ${v.big ? 'large trekking pack with a bedroll on top' : 'small day pack'} on the back with shoulder straps. A stand-in, not a person.`,
    vs: hv([['with a day pack', 30, 36, 0, { big: false }], ['with a trekking pack', 32, 38, 5, { big: true }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk', dy: -30 * s }); const bx = f.cx, by = f.cy + 230 * s; if (v.big) { pack(a, bx, by, 840 * s, 400 * s, 260 * s, 800 * s); a.xcyl(bx - 190 * s, bx + 190 * s, by, 1700 * s, 80 * s, 14); } else pack(a, bx, by, 960 * s, 320 * s, 200 * s, 500 * s); for (const k of [-1, 1]) a.tube([[bx + k * 120 * s, by - 100 * s, 1300 * s], [bx + k * 140 * s, f.cy - 100 * s, 1340 * s], [bx + k * 140 * s, f.cy - 60 * s, 1000 * s]], [8, 8, 8], 6); done(a, 'Added the walking figure and a pack on its back with a front pocket, shoulder straps' + (v.big ? ' and a rolled bedroll (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic parent pushing a stroller',
    desc: (v) => `Walking scale figure ${v.ht} in tall pushing a ${v.dbl ? 'double' : 'single'} stroller with canopy, seat, push bar and four wheels. A stand-in, not a person.`,
    vs: hv([['with a single stroller', 28, 62, 0, { dbl: false }], ['with a double stroller', 36, 62, 0, { dbl: true }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk', dy: 300 }); const sw = v.dbl ? 680 : 440, y0 = f.cy - 1000 * s - 100; const x = f.cx; a.box(x - sw / 2, y0, 280, x + sw / 2, y0 + 760, 300); for (const sx of [-1, 1]) { a.xcyl(x + sx * (sw / 2) - 9, x + sx * sw / 2 + 9, y0 + 90, 110, 110, 16); a.xcyl(x + sx * (sw / 2) - 8, x + sx * sw / 2 + 8, y0 + 680, 125, 125, 16); a.box(x + sx * (sw / 2) - 8, y0 + 680 - 8, 125, x + sx * (sw / 2) + 8, y0 + 680 + 8, 300); a.box(x + sx * (sw / 2) - 8, y0 + 90 - 8, 110, x + sx * (sw / 2) + 8, y0 + 90 + 8, 300); a.tube([[x + sx * (sw / 2), y0 + 700, 300], [x + sx * (sw / 2), y0 + 760, 1020]], [10, 10], 6); } const n = v.dbl ? 2 : 1; for (let i = 0; i < n; i++) { const xc = x + (n === 2 ? (i ? 1 : -1) * 170 : 0), sw2 = n === 2 ? 320 : 380; a.ell(xc, y0 + 380, 420, sw2 / 2, 260, 120, 12, 6); a.ell(xc, y0 + 520, 660, sw2 / 2, 200, 300, 12, 6); a.ell(xc, y0 + 300, 780, sw2 / 2, 300, 160, 12, 6); a.circ(xc, y0 + 380, sw2 / 2, 'EQUIP-DETAIL'); } a.tube([[x - sw / 2, y0 + 760, 1020], [x + sw / 2, y0 + 760, 1020]], [14, 14], 8); a.rect(x - sw / 2, y0, x + sw / 2, y0 + 760); done(a, 'Added the walking figure, a stroller with its base, four wheels, seat, canopy and push bar' + (v.dbl ? ' for two children, side by side (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic flight crew member with a roller bag',
    desc: (v) => `Walking scale figure ${v.ht} in tall ${v.pilot ? 'in a peaked cap with a flight bag on a roller handle' : 'with a roller bag and a small tote over the shoulder'}. Uniform detail is not drawn; a stand-in, not a person.`,
    vs: hv([['pilot with a flight bag', 30, 40, 2.5, { pilot: true }], ['cabin crew with a roller bag', 30, 40, 0, { pilot: false }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk', dx: -140 * s, hat: v.pilot ? 'peaked' : undefined }); const bx = f.cx + 400 * s, by = f.cy + 60 * s; roller(a, bx, by, 400 * s, 250 * s, (v.pilot ? 520 : 480) * s * 1.2); if (!v.pilot) bag(a, f.cx + 250 * s, f.cy + 40 * s, 640 * s, 260 * s, 110 * s, 280 * s); done(a, 'Added the walking figure, a roller bag with handle and wheels' + (v.pilot ? ' and a peaked cap.' : ' and a tote bag at the hip (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic screening officer',
    desc: (v) => `Standing scale figure ${v.ht} in tall ${v.wand ? 'holding a hand wand beside a lane divider post' : 'beside a divest table with two empty bins'}. Uniform detail is not drawn; a stand-in, not a person.`,
    vs: hv([['at a divest table', 40, 36, 0, { wand: false }], ['with a hand wand', 30, 30, 0, { wand: true }]]),
    build: (a, v) => { const s = sz(v.ht); if (v.wand) { const f = fig(a, v.ht, { hat: 'peaked', dx: -60 * s }); a.box(f.cx + 200 * s, f.cy - 60 * s, 880 * s, f.cx + 250 * s, f.cy - 30 * s, 1060 * s); a.box(f.cx + 195 * s, f.cy - 62 * s, 1040 * s, f.cx + 255 * s, f.cy - 28 * s, 1120 * s); a.rect(f.cx + 195 * s, f.cy - 62 * s, f.cx + 255 * s, f.cy - 28 * s); stanchion(a, f.cx + 520 * s, f.cy, 1000 * s); } else { const f = fig(a, v.ht, { hat: 'peaked', dx: -280 * s + 0 }); const x0 = f.cx + 220 * s; a.box(x0, f.cy - 450, 780, x0 + 760, f.cy + 450, 810); for (const [px, py] of [[0, -440], [750, -440], [0, 440], [750, 440]]) a.box(x0 + px - 12, f.cy + py - 12, 0, x0 + px + 12, f.cy + py + 12, 780); for (const k of [0, 1]) { const bx = x0 + 90 + k * 330; a.box(bx, f.cy - 300, 810, bx + 300, f.cy + 300, 830); for (const [sx, sy, ex, ey] of [[bx, f.cy - 300, bx + 300, f.cy - 300], [bx, f.cy + 300, bx + 300, f.cy + 300]]) a.box(sx, sy - 10, 830, ex, sy + 10, 960); a.box(bx, f.cy - 300, 830, bx + 20, f.cy + 300, 960); a.box(bx + 280, f.cy - 300, 830, bx + 300, f.cy + 300, 960); a.rect(bx, f.cy - 300, bx + 300, f.cy + 300, 'EQUIP-DETAIL'); } a.rect(x0, f.cy - 450, x0 + 760, f.cy + 450); } done(a, 'Added the standing figure with a peaked cap, ' + (v.wand ? 'a hand wand and a lane post with its base (plan and 3D).' : 'a divest table on four legs and two empty screening bins (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic ramp agent in a safety vest',
    desc: (v) => `Standing scale figure ${v.ht} in tall in a hard hat and a vest with two reflective bands, ${v.wands ? 'holding two signal wands' : 'holding a clipboard'}. A stand-in, not a person.`,
    vs: hv([['with signal wands', 34, 26, 4, { wands: true }], ['with a clipboard', 28, 26, 4, { wands: false }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { hat: 'hardhat', vest: true }); if (v.wands) { for (const k of [-1, 1]) { const hx = k > 0 ? f.hand[0] : f.lhand[0], hy = k > 0 ? f.hand[1] : f.lhand[1]; a.tube([[hx, hy, 900 * s], [hx + k * 160 * s, hy - 60 * s, 1250 * s]], [16 * s, 22 * s], 8); a.circ(hx + k * 160 * s, hy - 60 * s, 22 * s, 'EQUIP-DETAIL'); } } else a.box(f.hand[0] - 130 * s, f.hand[1] - 70 * s, 880 * s, f.hand[0] + 110 * s, f.hand[1] - 52 * s, 1160 * s); a.cyl(f.cx - 60 * s, f.cy + 100 * s, 880 * s, 960 * s, 90 * s, 12); done(a, 'Added the standing figure, a hard hat, a vest with reflective bands, hearing protection at the belt and ' + (v.wands ? 'two signal wands (plan and 3D).' : 'a clipboard (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic wheelchair passenger with attendant',
    desc: (v) => `A seated scale figure in a manual wheelchair, pushed by a standing ${v.ht} in attendant${v.bag ? ', with a carry-on bag on the passenger lap' : ''}. Large rear wheels, casters and footplate are drawn.`,
    vs: hv([['attendant pushing', 30, 76, 0, { bag: false }], ['attendant pushing, carry-on on lap', 30, 76, 0, { bag: true }]]),
    build: (a, v) => { const s = sz(v.ht); const cx = a.cx; const sy = a.cy + 150; wheelchair(a, cx, sy); mini(a, { x: cx, y: sy + 20, h: 1620, pose: 'sit', seat: 470, z: 0, feet: 150 }); if (v.bag) a.box(cx - 150, sy - 230, 880, cx + 150, sy - 20, 1110); fig(a, v.ht, { pose: 'walk', dy: 150 + 560, lo: true }); done(a, 'Added the wheelchair with large rear wheels, casters, armrests, footplate and push handles, a seated figure, and a standing attendant behind it.'); } }),
  fam({ cat: 'people/entourage', title: 'Generic queue of travellers at check-in',
    desc: (v) => `${v.n} standing scale figures in single file between belt stanchions, one behind the other. Each is a light figure, not a person.`,
    vs: [2, 3, 4, 5, 6, 8].map((n) => [`${n} in a line`, 30, 30 + (n - 1) * 30, 70, 0, { n }]),
    build: (a, v) => { const n = v.n, step = 30 * IN * 0.95 * 1.0; const gap = 30 * IN; for (let i = 0; i < n; i++) mini(a, { x: a.cx, y: a.cy + ((n - 1) / 2 - i) * gap, h: 1650 + (i % 3) * 40, pose: i === 0 ? 'walk' : 'stand' }); const ya = a.cy - ((n - 1) / 2) * gap - 330, yb = a.cy + ((n - 1) / 2) * gap + 330; for (const sx of [-1, 1]) { stanchion(a, a.cx + sx * 330, ya); stanchion(a, a.cx + sx * 330, yb); beltBetween(a, a.cx + sx * 330, ya, a.cx + sx * 330, yb); } done(a, `Added ${n} light standing figures in single file and a belt stanchion at each end of both rails (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic passenger seated at a gate',
    desc: (v) => `Seated scale figure about ${v.ht} in tall on a gate seat with an arm rest ${v.cfg === 0 ? 'and hands on the lap' : v.cfg === 1 ? 'and a carry-on bag on the floor at the side' : 'and a laptop open on the knees'}. A stand-in, not a person.`,
    vs: [0, 1, 2].flatMap((c) => [63, 71].map((ht) => [`${['upright', 'with a bag at the feet', 'with a laptop'][c]}, ${ht} in adult`, c === 1 ? 36 : 26, 36, 41, 0, { cfg: c, ht }])),
    build: (a, v) => { const h = v.ht * IN, x = a.cx - (v.cfg === 1 ? 130 : 0), y = a.cy; a.box(x - 240, y - 230, 410, x + 240, y + 250, 450); a.box(x - 240, y + 215, 450, x + 240, y + 250, 840); for (const k of [-1, 1]) a.box(x + k * 250 - 12, y - 220, 450, x + k * 250 + 12, y + 150, 640); a.box(x - 300, y - 40, 0, x - 270, y + 40, 410); a.box(x + 270, y - 40, 0, x + 300, y + 40, 410); a.rect(x - 250, y - 230, x + 250, y + 250); mini(a, { x, y: y + 10, h, pose: 'sit', seat: 450, feet: 0 }); if (v.cfg === 1) { a.box(x + 330, y - 240, 0, x + 600, y - 20, 480); a.rect(x + 330, y - 240, x + 600, y - 20); } if (v.cfg === 2) { a.box(x - 170, y - 360, 700, x + 170, y - 120, 725); a.box(x - 170, y - 130, 725, x + 170, y - 120, 940); a.rect(x - 170, y - 360, x + 170, y - 120, 'EQUIP-DETAIL'); } done(a, 'Added the seated figure, a single gate seat with back, arm rests and legs' + (v.cfg === 1 ? ', and a carry-on bag standing on the floor (plan and 3D).' : v.cfg === 2 ? ', and an open laptop (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic traveller asleep on a bench',
    desc: (v) => `A scale figure lying on a ${v.seats}-seat bench, ${v.pack ? 'head on a backpack' : 'under a blanket'}. The bench has a seat beam, arm rests and legs. A stand-in, not a person.`,
    vs: [3, 4, 5].flatMap((n) => [true, false].map((p) => [`on a ${n}-seat bench, ${p ? 'head on a pack' : 'under a blanket'}`, 24, n * 20 + 4, 30, 0, { seats: n, pack: p }])),
    build: (a, v) => { const n = v.seats, L = n * 20 * IN, w = 560, x = a.cx, y0 = a.cy - L / 2; a.box(x - w / 2, y0, 400, x + w / 2, y0 + L, 440); for (let i = 0; i <= n; i++) a.box(x - w / 2, y0 + i * (L - 40) / n, 440, x + w / 2, y0 + i * (L - 40) / n + 40, 470); for (const yy of [y0 + 80, y0 + L - 80]) for (const k of [-1, 1]) a.box(x + k * (w / 2 - 40) - 20, yy - 20, 0, x + k * (w / 2 - 40) + 20, yy + 20, 400); a.rect(x - w / 2, y0, x + w / 2, y0 + L); for (let i = 1; i < n; i++) a.line(x - w / 2, y0 + i * L / n, x + w / 2, y0 + i * L / n, 'EQUIP-DETAIL'); mini(a, { x, y: y0 + L * 0.5 - 60, h: 1700 * Math.min(1, (L - 100) / 1900) + 0, pose: 'lie', z: 470 }); if (v.pack) pack(a, x, y0 + L - 160, 470, 380, 160, 300); else { a.box(x - 280, y0 + L * 0.5 - 600, 480, x + 280, y0 + L * 0.5 + 40, 520); a.rect(x - 280, y0 + L * 0.5 - 600, x + 280, y0 + L * 0.5 + 40, 'EQUIP-DETAIL'); } done(a, 'Added the bench beam, seat dividers and legs, a lying figure' + (v.pack ? ' with a backpack under its head (plan and 3D).' : ' and a folded blanket over its legs (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic family group waiting at a gate',
    desc: (v) => `${v.ad} adult${v.ad > 1 ? 's' : ''} and ${v.ch} ${v.ch > 1 ? 'children' : 'child'} standing together as light scale figures, children drawn at 42 and 50 in. Stand-ins, not people.`,
    vs: [[1, 1], [1, 2], [2, 1], [2, 2], [2, 3], [1, 3]].map(([ad, ch]) => [`${ad} adult${ad > 1 ? 's' : ''}, ${ch} ${ch > 1 ? 'children' : 'child'}`, 24 + (ad + ch) * 14, 30, 70, 0, { ad, ch }]),
    build: (a, v) => { const n = v.ad + v.ch, gap = 560, x0 = a.cx - ((n - 1) * gap) / 2; let k = 0; for (let i = 0; i < v.ad; i++) mini(a, { x: x0 + (k++) * gap, y: a.cy, h: 1680 - i * 70, pose: 'stand' }); for (let i = 0; i < v.ch; i++) mini(a, { x: x0 + (k++) * gap, y: a.cy - 60, h: i % 2 ? 1270 : 1070, pose: 'stand' }); roller(a, x0 + (n - 1) * gap + 440, a.cy - 40, 340, 220, 440); done(a, `Added ${v.ad} adult and ${v.ch} child light standing figures side by side, and a small roller bag at the end (plan and 3D).`); } }),

  // ---------------- shopping centres and retail ----------------
  fam({ cat: 'people/entourage', title: 'Generic shopper carrying bags',
    desc: (v) => `Walking scale figure ${v.ht} in tall carrying ${v.n} shopping bag${v.n > 1 ? 's' : ''} with handles. A stand-in, not a person.`,
    vs: [1, 2, 3].flatMap((n) => [63, 71].map((ht) => [`with ${n} bag${n > 1 ? 's' : ''}, ${ht} in tall`, 28 + n * 4, 32, ht + 0, 0, { n, ht }])),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk' }); const hs = [f.hand, f.lhand]; for (let i = 0; i < v.n; i++) { const h = hs[i % 2], k = i % 2 ? -1 : 1, off = Math.floor(i / 2) * 120 * s; bag(a, h[0] + k * 70 * s + k * off, h[1] + 30 * s - off, 480 * s - 40 * s * (i % 2), 240 * s, 130 * s, 320 * s); } done(a, `Added the walking figure and ${v.n} shopping bag${v.n > 1 ? 's' : ''} with handles hanging from the hands (plan and 3D).`); } }),
  fam({ cat: 'people/entourage', title: 'Generic shopper pushing a cart',
    desc: (v) => `Walking scale figure ${v.ht} in tall pushing a shopping cart ${v.full ? 'with a few items in the basket' : 'with an empty basket'}. The cart has a basket, handle, child seat and four casters. A stand-in, not a person.`,
    vs: hv([['with an empty cart', 28, 62, 0, { full: false }], ['with a loaded cart', 28, 62, 0, { full: true }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { pose: 'walk', dy: 440 }); cartProp(a, f.cx, f.cy - 1050, 560, 900, v.full); a.tube([[f.cx - 260, f.cy - 1050 + 900, 1030], [f.hand[0] - 20, f.hand[1] - 10, 950 * s]], [8, 8], 6); done(a, 'Added the walking figure, a shopping cart with basket rails, push handle, fold-down child seat and four casters' + (v.full ? ', and groceries in the basket (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic window shopper',
    desc: (v) => `Standing scale figure ${v.ht} in tall looking at a ${v.win} in wide display window with a mullion frame and sill, a phone held at chest height. A stand-in, not a person.`,
    vs: hv([['at a 60 in display window', 66, 22, 0, { win: 60 }], ['at a 96 in display window', 102, 22, 0, { win: 96 }]]),
    build: (a, v) => { const f = fig(a, v.ht, { dy: -150 }); const W = v.win * IN, x = a.cx, y = f.cy + 330, TOP = 2400; a.frame(x - W / 2, 120, x + W / 2, TOP, y, y + 70, 70); a.box(x - W / 2, y, 0, x + W / 2, y + 70, 120); a.box(x - W / 2 - 40, y - 40, 100, x + W / 2 + 40, y + 70, 130); for (let k = 1; k < Math.round(v.win / 36); k++) { const mx = x - W / 2 + (W * k) / Math.round(v.win / 36); a.box(mx - 20, y, 120, mx + 20, y + 70, TOP); } a.box(x - W / 2 + 70, y + 20, 180, x + W / 2 - 70, y + 24, TOP - 70); a.rect(x - W / 2 - 40, y - 40, x + W / 2 + 40, y + 70); a.rect(x - W / 2, y, x + W / 2, y + 70, 'EQUIP-DETAIL'); a.box(f.hand[0] - 40, f.hand[1] - 40, 1120 * sz(v.ht), f.hand[0] + 40, f.hand[1] - 24, 1260 * sz(v.ht)); done(a, 'Added the standing figure with a phone in hand, a window frame with mullions, glass and a sill (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic kiosk vendor behind a cart',
    desc: (v) => `Standing scale figure ${v.ht} in tall behind a ${v.cw} in cart counter with a canopy frame and display shelf. A stand-in, not a person.`,
    vs: hv([['behind a 48 in cart', 52, 44, 28, { cw: 48 }], ['behind a 72 in cart', 76, 44, 28, { cw: 72 }]]),
    build: (a, v) => { const f = fig(a, v.ht, { dy: 150 }); const W = v.cw * IN, x = a.cx, y1 = f.cy - 300, y0 = y1 - 780; a.box(x - W / 2, y0, 120, x + W / 2, y1, 1000); a.box(x - W / 2 - 20, y0 - 20, 1000, x + W / 2 + 20, y1 + 20, 1040); for (const sx of [-1, 1]) a.xcyl(x + sx * (W / 2 - 80) - 10, x + sx * (W / 2 - 80) + 10, y0 + 80, 100, 100, 16); for (const sx of [-1, 1]) a.cyl(x + sx * (W / 2 - 20), y0 + 20, 1040, 2280, 18, 8); a.box(x - W / 2, y0 - 20, 2250, x + W / 2, y1 + 20, 2290); a.box(x - W / 2 + 60, y0 + 10, 1040, x + W / 2 - 60, y0 + 200, 1260); a.rect(x - W / 2 - 20, y0 - 20, x + W / 2 + 20, y1 + 20); a.rect(x - W / 2 + 60, y0 + 10, x + W / 2 - 60, y0 + 200, 'EQUIP-DETAIL'); done(a, 'Added the standing figure, the cart base with wheels, the counter top, two canopy posts with a roof frame and a display shelf (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic child',
    desc: (v) => `Standing scale figure of a child, ${v.ht} in tall, in adult proportions scaled down. Use it to set a counter, rail or seat height beside a person. A stand-in, not a child.`,
    vs: [36, 42, 48, 54, 60, 66].map((ht) => [`standing, ${ht} in tall`, 18, 14, ht, 0, { ht }]),
    build: (a, v) => { fig(a, v.ht, { lo: true }); done(a, 'Added the standing figure scaled to the stated height (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic security guard',
    desc: (v) => `${v.walk ? 'Walking' : 'Standing'} scale figure ${v.ht} in tall in a peaked cap${v.walk ? ' on patrol' : ' at a post, hands at the sides'}, with a belt radio. Uniform detail is not drawn; a stand-in, not a person.`,
    vs: hv([['standing at a post', 28, 26, 2.5, { walk: false }], ['on patrol, walking', 28, 32, 2.5, { walk: true }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht, { hat: 'peaked', pose: v.walk ? 'walk' : 'stand' }); a.box(f.cx - 260 * s, f.cy + 40 * s, 900 * s, f.cx - 190 * s, f.cy + 130 * s, 1050 * s); a.tube([[f.cx - 230 * s, f.cy + 80 * s, 1050 * s], [f.cx - 230 * s, f.cy + 80 * s, 1190 * s]], [6 * s, 6 * s], 6); a.rect(f.cx - 260 * s, f.cy + 40 * s, f.cx - 190 * s, f.cy + 130 * s, 'EQUIP-DETAIL'); a.box(f.cx - 195 * s, f.cy - 105 * s, 1180 * s, f.cx - 120 * s, f.cy - 95 * s, 1260 * s); done(a, 'Added the figure with a peaked cap, a radio on the belt with its aerial and a chest badge (plan and 3D).'); } }),
  fam({ cat: 'people/entourage', title: 'Generic mall walkers',
    desc: (v) => `${v.n} walking scale figures side by side, ${v.bags ? 'each with a shopping bag' : 'strolling at an even pace'}. Light figures, not people.`,
    vs: [[2, false], [3, false], [4, false], [5, false], [2, true], [3, true]].map(([n, b]) => [`${n} abreast${b ? ' with bags' : ''}`, 6 + n * 22, 34, 70, 0, { n, bags: b }]),
    build: (a, v) => { const n = v.n, gap = 22 * IN, x0 = a.cx - ((n - 1) * gap) / 2; for (let i = 0; i < n; i++) { const x = x0 + i * gap; mini(a, { x, y: a.cy + (i % 2 ? 60 : 0), h: 1640 + ((i * 37) % 120), pose: 'walk' }); if (v.bags) bag(a, x + 330, a.cy + (i % 2 ? 60 : 0), 480, 220, 110, 300); } done(a, `Added ${n} light walking figures with alternating strides` + (v.bags ? ' and a shopping bag for each (plan and 3D).' : ' (plan and 3D).')); } }),
  fam({ cat: 'people/entourage', title: 'Generic shop assistant at a garment rack',
    desc: (v) => `Standing scale figure ${v.ht} in tall beside a ${v.rack} in garment rack with a hanging rail, base feet and five garments. A stand-in, not a person.`,
    vs: hv([['at a 36 in garment rack', 48, 28, 0, { rack: 36 }], ['at a 48 in garment rack', 60, 28, 0, { rack: 48 }]]),
    build: (a, v) => { const s = sz(v.ht); const f = fig(a, v.ht); const W = v.rack * IN, y = f.cy - 80; const xa = f.cx + 340, xb = xa + W; a.cyl(xa + 40, y, 0, 1500, 14, 8); a.cyl(xb - 40, y, 0, 1500, 14, 8); a.xcyl(xa + 40, xb - 40, y, 1500, 14, 10); a.box(xa, y - 330, 0, xa + 80, y + 330, 40); a.box(xb - 80, y - 330, 0, xb, y + 330, 40); a.box(xa + 40, y - 12, 150, xb - 40, y + 12, 170); for (let i = 0; i < 5; i++) { const gx = xa + 120 + i * (W - 240) / 4; a.prism([[gx - 18, y - 120], [gx + 18, y - 120], [gx + 18, y + 120], [gx - 18, y + 120]], 800 + (i % 2) * 60, 1480); } a.rect(xa, y - 330, xb, y + 330); a.line(xa + 40, y, xb - 40, y, 'EQUIP-DETAIL'); done(a, 'Added the standing figure, a garment rack with its hanging rail, uprights, base feet and five hanging garments (plan and 3D).'); } }),
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
