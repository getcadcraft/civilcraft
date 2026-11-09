/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5 plumbing (2026-11-03): hospital, construction-site, mine and aviation water, waste and gas fixtures and equipment. */
import { fam, F, M, S, C, O, A } from './r4-kit.mjs';

const I = 25.4;
/** A gooseneck or deck spout. */
function spout(a, x, y, z, rise = 200, reach = 120, r = 11) {
  a.tube([[x, y, z], [x, y, z + rise], [x, y - reach, z + rise + 10]], [r, r, r * 0.85], 8);
  a.cyl(x, y - reach, z + rise - 35, z + rise + 10, r * 0.8, 8);
  a.circ(x, y, r * 1.3, 'EQUIP-DETAIL');
}
/** An open basin: floor and four thin walls, rim at zTop, a drain. */
function basin(a, x0, y0, x1, y1, zTop, depth, t = 10) {
  a.box(x0, y0, zTop - depth, x1, y1, zTop - depth + t);
  a.box(x0, y0, zTop - depth, x0 + t, y1, zTop); a.box(x1 - t, y0, zTop - depth, x1, y1, zTop);
  a.box(x0, y0, zTop - depth, x1, y0 + t, zTop); a.box(x0, y1 - t, zTop - depth, x1, y1, zTop);
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  a.circ(cx, cy, 22, 'EQUIP-DETAIL'); a.cyl(cx, cy, zTop - depth - 100, zTop - depth + 2, 20, 8);
}
const legs = (a, pts, z0, z1, r = 20) => { for (const [x, y] of pts) { a.leg(x, y, z0, z1, r); a.circ(x, y, r, 'EQUIP-HIDDEN'); } };
const lever = (a, x, y, z, len = 80) => { a.xcyl(x - len / 2, x + len / 2, y, z, 6, 6); a.ell(x - len / 2, y, z, 9, 9, 9, 8, 4); };
const wheel = (a, x, y, z, r, t = 60) => { a.xcyl(x - t / 2, x + t / 2, y, z, r, 16); a.xcyl(x - t / 2 - 8, x + t / 2 + 8, y, z, r * 0.4, 10); };
const flangeY = (a, x, y, z, r) => { a.ycyl(y - 14, y, x, z, r * 1.5, 14); };
/** Horizontal tank lying along x. */
const hTank = (a, x0, x1, y, z, r) => { a.xcyl(x0 + r * 0.3, x1 - r * 0.3, y, z, r, 24); a.ell(x0 + r * 0.3, y, z, r * 0.3, r, r, 12, 8); a.ell(x1 - r * 0.3, y, z, r * 0.3, r, r, 12, 8); };
/** Skid base: two runners and cross members. */
function skid(a, x0, y0, x1, y1, z0, h = 90) {
  a.box(x0, y0, z0, x1, y0 + 70, z0 + h); a.box(x0, y1 - 70, z0, x1, y1, z0 + h);
  const n = Math.max(2, Math.round((x1 - x0) / 700)); for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0 - 60) * i) / n; a.box(x, y0 + 70, z0 + 10, x + 60, y1 - 70, z0 + h - 10); }
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL');
}
/** Control or electrical box with a door and a window. */
const panel = (a, x0, y, z0, x1, z1, dy = 120) => { a.box(x0, y - dy, z0, x1, y, z1); a.box(x0 + 20, y - dy - 8, z0 + 20, x1 - 20, y - dy, z1 - 20); a.box((x0 + x1) / 2 - 40, y - dy - 14, (z0 + z1) / 2, (x0 + x1) / 2 + 40, y - dy - 8, (z0 + z1) / 2 + 60); a.rect(x0, y - dy, x1, y, 'EQUIP-DETAIL'); };
/** Hose reel with its axis along y: drum, flanges, hose wraps and a guide arm. */
function hoseReel(a, x, y, z, r, len = 150) {
  a.ycyl(y - len, y, x, z, r * 0.45, 14); a.ycyl(y - len, y - len + 14, x, z, r, 18); a.ycyl(y - 14, y, x, z, r, 18);
  a.ycyl(y - len + 14, y - 14, x, z, r * 0.85, 18); a.circ(x, y, 10, 'EQUIP-DETAIL');
  a.tube([[x + r * 0.85, y - len, z], [x + r * 1.2, y - len - 60, z - r], [x + r * 1.1, y - len - 60, z - r * 1.6]], [10, 10, 10], 8);
}
/** Slatted grate over a trench in plan and 3D. */
function trenchGrate(a, x0, y0, x1, y1, z) {
  a.box(x0, y0, z - 30, x1, y0 + 20, z); a.box(x0, y1 - 20, z - 30, x1, y1, z);
  for (let x = x0; x < x1 - 12; x += 40) a.box(x, y0 + 20, z - 22, x + 14, y1 - 20, z);
  a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); for (let x = x0 + 40; x < x1 - 12; x += 120) a.line(x, y0, x, y1, 'EQUIP-DETAIL');
}
const ring = (a, cx, cy, r, z, n, rr, h = 20) => { for (let i = 0; i < n; i++) { const g = (i / n) * Math.PI * 2; a.cyl(cx + Math.cos(g) * r, cy + Math.sin(g) * r, z, z + h, rr, 8); } };
const wallPlate = (a, x0, x1, z0, z1, t = 8) => { a.box(x0, -t, z0, x1, 0, z1); };

export default [
  // ===================================================================== HOSPITAL
  fam({ cat: 'plumbing/fixtures', title: 'Generic hospital scrub sink',
    desc: (v) => `Wall-backed stainless scrub trough with ${v.n} wash station${v.n > 1 ? 's' : ''}, a high splash, a gooseneck spout above each, ${v.ctl === 'knee' ? 'a knee-operated bar under the front apron' : v.ctl === 'foot' ? 'a foot pedal at each station' : 'a sensor eye at each station'} and a deep apron on a wall frame.`,
    vs: [
      ['1 station, knee bar', 30, 24, 58, 0, { n: 1, ctl: 'knee' }], ['2 stations, knee bar', 56, 24, 58, 0, { n: 2, ctl: 'knee' }],
      ['2 stations, sensors', 56, 24, 58, 0, { n: 2, ctl: 'eye' }], ['3 stations, foot pedals', 84, 24, 58, 0, { n: 3, ctl: 'foot' }],
      ['3 stations, sensors', 84, 24, 58, 0, { n: 3, ctl: 'eye' }], ['4 stations, knee bar', 112, 26, 58, 0, { n: 4, ctl: 'knee' }],
    ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, top = Z0 + 34 * I; a.outline();
      basin(a, X0 + 10, YF + 10, X1 - 10, YB - 60, top, 330, 10); a.box(X0, YF, top - 60, X1, YF + 10, top); a.box(X0, YF, top - 330, X1, YF + 10, top - 260);
      a.box(X0, YB - 40, Z0 + 500, X1, YB, Z1);
      legs(a, [[X0 + 40, YF + 60], [X1 - 40, YF + 60]], Z0, top - 330, 18); a.box(X0 + 20, YB - 120, Z0 + 700, X1 - 20, YB - 40, top - 330);
      const pitch = W / v.n;
      for (let i = 0; i < v.n; i++) {
        const x = X0 + pitch * (i + 0.5); spout(a, x, YB - 120, top + 160, 220, 220, 14);
        if (v.ctl === 'eye') { a.box(x - 25, YB - 40, top + 420, x + 25, YB - 20, top + 450); a.circ(x, YB - 40, 12, 'EQUIP-DETAIL'); }
        if (v.ctl === 'foot') { a.box(x - 60, YF + 20, Z0 + 20, x + 60, YF + 140, Z0 + 50); a.box(x - 12, YF + 150, Z0 + 20, x + 12, YF + 180, Z0 + 300); a.rect(x - 60, YF + 20, x + 60, YF + 140, 'EQUIP-HIDDEN'); }
        a.circ(x, (YF + YB) / 2 - 30, 24, 'EQUIP-DETAIL');
      }
      if (v.ctl === 'knee') a.box(X0 + 60, YF - 0, top - 250, X1 - 60, YF + 20, top - 215);
      a.log('Added the deep trough, the high splash, the wall frame and apron, a gooseneck spout per station and the knee bar, foot pedals or sensor eyes (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic clinic hand-wash basin',
    desc: (v) => `Wall-hung hand-wash basin ${v.l} in wide with a back splash, ${v.f === 'wrist' ? 'a faucet with long wrist blades' : v.f === 'eye' ? 'a deck faucet with a sensor eye' : 'a gooseneck faucet and a lever'}, a soap dispenser on the wall, a paper-towel box and an exposed trap with a cover.`,
    vs: [
      ['18 in, wrist blades', 18, 18, 44, 30, { l: 18, f: 'wrist' }], ['20 in, wrist blades', 20, 19, 44, 30, { l: 20, f: 'wrist' }],
      ['20 in, sensor', 20, 19, 44, 30, { l: 20, f: 'eye' }], ['24 in, sensor', 24, 20, 44, 30, { l: 24, f: 'eye' }],
      ['22 in, gooseneck', 22, 19, 44, 30, { l: 22, f: 'neck' }], ['30 in, gooseneck, accessible', 30, 22, 44, 30, { l: 30, f: 'neck' }],
    ],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, top = Z0 + 340; a.outline();
      a.box(X0 + 20, YB - 10, Z0 + 150, X1 - 20, YB, Z1); a.box(X0, YF, top - 150, X1, YB - 20, top);
      basin(a, X0 + 30, YF + 30, X1 - 30, YB - 110, top - 4, 120, 10); a.box(X0, YB - 90, top, X1, YB - 20, top + 70);
      if (v.f === 'wrist') { spout(a, cx, YB - 120, top, 160, 110, 11); a.box(cx - 200, YB - 130, top + 180, cx + 200, YB - 110, top + 200); a.xcyl(cx - 330, cx - 200, YB - 120, top + 190, 7, 6); a.xcyl(cx + 200, cx + 330, YB - 120, top + 190, 7, 6); }
      else if (v.f === 'eye') { spout(a, cx, YB - 120, top, 110, 100, 11); a.box(cx - 20, YB - 100, top + 100, cx + 20, YB - 80, top + 130); }
      else { spout(a, cx, YB - 120, top, 230, 150, 12); lever(a, cx + 50, YB - 120, top + 90, 90); }
      a.box(X0 + 40, YB - 50, top + 330, X0 + 100, YB - 4, top + 480); a.cyl(X0 + 70, YB - 28, top + 480, top + 510, 8, 6);
      a.box(X1 - 190, YB - 60, top + 300, X1 - 30, YB - 4, top + 520); a.rect(X1 - 190, YB - 60, X1 - 30, YB, 'EQUIP-DETAIL');
      a.cyl(cx, YB - 150, Z0 + 150, top - 150, 20, 8); a.box(cx - 70, YB - 190, Z0 + 150, cx + 70, YB - 100, top - 150); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the basin, the splash, the faucet, the soap dispenser, the towel box, the trap cover and the wall plate (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic medical gas wall outlet box',
    desc: (v) => `Surface wall box ${v.n} quick-connect outlets wide with a face plate, a round port with a collar at each outlet, a label strip under each and a shut-off key slot at the top.`,
    vs: [2, 3, 4, 5, 6, 8, 10].map((n) => [`${n} outlets`, n * 3.2 + 2, 4, 8, 54, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline();
      a.box(X0, YB - 70, Z0, X1, YB, Z1); a.box(X0 + 12, YF + 0, Z0 + 10, X1 - 12, YB - 70, Z1 - 10); a.box(X0 + 20, YF, Z1 - 45, X1 - 20, YF + 8, Z1 - 30);
      const p = (W - 40) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 20 + p * (i + 0.5); a.ycyl(YF - 4, YF + 30, x, Z0 + 105, 22, 14); a.ycyl(YF - 12, YF - 4, x, Z0 + 105, 12, 10); a.box(x - 25, YF, Z0 + 20, x + 25, YF + 6, Z0 + 38); a.circ(x, YF + 30, 22, 'EQUIP-DETAIL'); }
      a.rect(X0 + 12, YF, X1 - 12, YB - 70, 'EQUIP-DETAIL');
      a.log('Added the wall box, the face plate, one collared port and label strip per outlet and the key slot (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic ward headwall gas rail',
    desc: (v) => `Horizontal aluminium rail ${v.l} in long on wall brackets with ${v.n} gas outlets, ${v.sw} electrical switch plates, two vacuum regulator mounts and a hook strip along the top.`,
    vs: [[48, 4, 1], [72, 5, 2], [96, 6, 2], [120, 8, 3]].map(([l, n, sw]) => [`${l} in long, ${n} outlets`, l, 6, 16, 52, { l, n, sw }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
      a.box(X0, YB - 60, Z0 + 30, X1, YB - 0, Z1 - 70); a.box(X0, YF + 30, Z1 - 70, X1, YB, Z1 - 30); a.box(X0, YF, Z1 - 30, X1, YB - 30, Z1); a.box(X0 + 20, YF + 10, Z0 + 20, X1 - 20, YF + 40, Z0 + 40);
      for (const x of [X0 + 80, X1 - 80]) a.box(x - 20, YB - 100, Z0 + 20, x + 20, YB, Z1 - 20);
      const pt = (W - 400) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 200 + pt * (i + 0.5); a.ycyl(YF + 0, YB - 60, x, Z0 + 190, 20, 12); a.ycyl(YF - 10, YF + 0, x, Z0 + 190, 28, 12); a.circ(x, YF, 20, 'EQUIP-DETAIL'); }
      for (let i = 0; i < v.sw; i++) { const x = X1 - 160 - i * 130; a.box(x - 40, YF + 20, Z0 + 60, x + 40, YF + 36, Z0 + 150); }
      for (const x of [X0 + 100, X0 + 240]) { a.ycyl(YF - 60, YF + 20, x, Z0 + 280, 26, 12); a.circ(x, YF - 30, 26, 'EQUIP-DETAIL'); }
      for (let x = X0 + 400; x < X1 - 300; x += 220) a.box(x, YF - 20, Z1 - 20, x + 20, YF + 0, Z1);
      a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the rail body, the wall brackets, the gas outlets, the switch plates, the two regulator mounts and the hook strip (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hospital eyewash station',
    desc: (v) => `${v.kind === 'wall' ? 'Wall-mounted eyewash with a bowl, two spray heads under dust caps and a push-flag valve' : v.kind === 'pedestal' ? 'Floor pedestal eyewash with a bowl, two spray heads, a push-flag valve and a round base plate' : v.kind === 'dual' ? 'Eyewash with a bowl and two pull-out hand-held spray hoses on a wall plate' : 'Portable gravity-fed eyewash with a tank on a stand, a bowl, two spray heads and a push flag'}.`,
    vs: [['wall bowl', 16, 14, 14, 36, { kind: 'wall' }], ['floor pedestal', 20, 20, 44, 0, { kind: 'pedestal' }], ['dual hand-held hoses', 24, 10, 22, 36, { kind: 'dual' }], ['portable tank, 16 gal', 24, 24, 44, 0, { kind: 'tank' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      const bowl = (x, y, z, r) => { a.ell(x, y, z, r, r, 55, 16, 6); a.circ(x, y, r, 'EQUIP-DETAIL'); for (const s of [-1, 1]) { a.cyl(x + s * r * 0.45, y, z + 20, z + 120, 10, 8); a.cone(x + s * r * 0.45, y, z + 120, z + 150, 10, 22, 8); } a.box(x - 60, y - r - 40, z + 20, x + 60, y - r, z + 40); };
      if (v.kind === 'wall') { wallPlate(a, X0, X1, Z0, Z1); bowl(cx, YB - 200, Z0 + 170, 160); a.cyl(cx, YB - 40, Z0 + 100, Z0 + 200, 18, 8); a.ycyl(YB - 180, YB - 40, cx, Z0 + 100, 14, 8); }
      else if (v.kind === 'pedestal') { a.cyl(cx, cy, Z0, Z0 + 30, 220, 20); a.cyl(cx, cy, Z0 + 30, Z1 - 160, 40, 12); bowl(cx, cy, Z1 - 160, 200); a.circ(cx, cy, 220, 'EQUIP-DETAIL'); }
      else if (v.kind === 'dual') { wallPlate(a, X0, X1, Z0, Z1); a.box(X0 + 20, YB - 100, Z0 + 20, X1 - 20, YB - 8, Z1 - 20); for (const s of [-1, 1]) { const x = cx + s * 190; a.ycyl(YB - 230, YB - 100, x, Z0 + 150, 30, 12); a.tube([[x, YB - 230, Z0 + 150], [x, YB - 260, Z0 + 60], [x + s * 30, YB - 200, Z0 + 20]], [10, 10, 10], 8); a.cone(x + s * 30, YB - 200, Z0 + 20, Z0 + 60, 24, 14, 8); a.circ(x, YB - 230, 28, 'EQUIP-DETAIL'); } }
      else { a.box(cx - 280, cy - 230, Z0, cx - 240, cy + 230, Z0 + 20); a.box(cx + 240, cy - 230, Z0, cx + 280, cy + 230, Z0 + 20); a.leg(cx - 260, cy - 200, Z0, Z1 - 500, 14); a.leg(cx + 260, cy - 200, Z0, Z1 - 500, 14); a.leg(cx - 260, cy + 200, Z0, Z1 - 500, 14); a.leg(cx + 260, cy + 200, Z0, Z1 - 500, 14); a.box(cx - 290, cy - 240, Z1 - 520, cx + 290, cy + 240, Z1 - 490); a.cyl(cx, cy + 10, Z1 - 490, Z1 - 80, 240, 20); a.cone(cx, cy + 10, Z1 - 80, Z1, 240, 80, 20); a.circ(cx, cy + 10, 240, 'EQUIP-DETAIL'); }
      a.log(v.kind === 'tank' ? 'Added the frame, the tank, the bowl, the two spray heads and the push flag (plan and 3D).' : 'Added the bowl or hoses, the spray heads, the push-flag valve and the mounting (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hospital emergency drench shower',
    desc: (v) => `Floor-standing drench shower with a round base plate, a vertical riser, a ${v.hd} in shower head, a pull rod with a triangular handle${v.eye ? ', an eyewash bowl with two spray heads and a push flag' : ''}${v.hose ? ' and a hand-held spray hose on a hook' : ''}.`,
    vs: [['shower only, 10 in head', 24, 24, 100, 0, { hd: 10, eye: 0, hose: 0 }], ['with eyewash, 10 in head', 30, 30, 100, 0, { hd: 10, eye: 1, hose: 0 }],
      ['with eyewash and hose, 12 in head', 30, 30, 100, 0, { hd: 12, eye: 1, hose: 1 }], ['with hose, 12 in head', 28, 28, 100, 0, { hd: 12, eye: 0, hose: 1 }], ['large 14 in head', 30, 30, 102, 0, { hd: 14, eye: 1, hose: 0 }]],
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, hr = (v.hd * I) / 2; a.outline('EQUIP-HIDDEN'); a.circ(cx, cy, a.W / 2 - 10);
      a.cyl(cx, cy, Z0, Z0 + 25, a.W / 2 - 40, 24); a.cyl(cx, cy, Z0 + 25, Z1 - 330, 32, 12); a.tube([[cx, cy, Z1 - 330], [cx, cy, Z1 - 200], [cx - 140, cy, Z1 - 150]], [32, 32, 28], 10);
      a.cone(cx - 140, cy, Z1 - 150, Z1 - 100, 30, hr, 20); a.circ(cx - 140, cy, hr, 'EQUIP-DETAIL');
      a.tube([[cx - 140, cy, Z1 - 150], [cx - 140, cy + 40, Z1 - 700], [cx - 90, cy + 40, Z1 - 800]], [5, 5, 5], 6); a.tube([[cx - 90, cy + 40, Z1 - 800], [cx - 190, cy + 40, Z1 - 800], [cx - 140, cy + 40, Z1 - 900], [cx - 90, cy + 40, Z1 - 800]], [12, 12, 12, 12], 6);
      if (v.eye) { const z = Z0 + 1050, x = cx + 50; a.ell(x, cy - 120, z, 130, 130, 50, 14, 6); a.tube([[cx, cy - 8, z - 20], [x, cy - 100, z]], [22, 20], 8); for (const s of [-1, 1]) a.cyl(x + s * 55, cy - 120, z, z + 110, 8, 8); a.box(x - 50, cy - 270, z + 10, x + 50, cy - 250, z + 40); a.circ(x, cy - 120, 130, 'EQUIP-DETAIL'); }
      if (v.hose) { a.box(cx + 20, cy + 28, Z0 + 1300, cx + 120, cy + 56, Z0 + 1330); a.tube([[cx + 70, cy + 40, Z0 + 1320], [cx + 150, cy + 60, Z0 + 1100], [cx + 120, cy + 60, Z0 + 800]], [8, 8, 8], 6); }
      a.log('Added the base plate, the riser, the shower head, the pull rod and handle' + (v.eye ? ', the eyewash bowl' : '') + (v.hose ? ' and the hand-held hose' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hospital water-treatment skid',
    desc: (v) => `Frame skid carrying ${v.n} vertical media tanks, ${v.ro} horizontal membrane housings, a feed pump, a header with valves and a control panel with a window.`,
    vs: [['2 tanks, 2 housings', 96, 36, 76, 0, { n: 2, ro: 2 }], ['2 tanks, 4 housings', 120, 40, 80, 0, { n: 2, ro: 4 }], ['3 tanks, 4 housings', 144, 44, 84, 0, { n: 3, ro: 4 }], ['4 tanks, 6 housings', 192, 48, 84, 0, { n: 4, ro: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W } = a; a.outline(); skid(a, X0, YF, X1, YB, Z0, 110);
      const tr = Math.min(260, (a.D - 200) / 2 - 20), tp = (W - 700) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 130 + tp * (i + 0.5); M.tank(a, x, YB - tr - 120, Z0 + 110, Z1 - 100, tr * 0.8); a.cyl(x, YB - tr - 120, Z1 - 100, Z1 - 60, 40, 10); a.tube([[x, YB - tr - 120 + tr * 0.8, Z0 + 500], [x, YB - 60, Z0 + 500]], [18, 18], 8); }
      for (let j = 0; j < v.ro; j++) { const z = Z0 + 200 + (j % 2) * 130; a.xcyl(X0 + 60, X0 + 60 + 0, YF + 150, z, 1, 4); }
      const rl = Math.min(900, W - 1000);
      for (let j = 0; j < v.ro; j++) { const z = Z0 + 180 + (j % 2) * 150, y = YF + 130 + Math.floor(j / 2) * 130; a.xcyl(X0 + 100, X0 + 100 + rl, y, z, 55, 14); a.xcyl(X0 + 100 - 24, X0 + 100, y, z, 62, 14); a.xcyl(X0 + 100 + rl, X0 + 100 + rl + 24, y, z, 62, 14); }
      M.pumpSet(a, X1 - 480, YF + 200, Z0 + 110, 400);
      a.xcyl(X0 + 60, X1 - 60, YB - 90, Z0 + 650, 30, 10); panel(a, X1 - 330, YF + 30 + 10, Z0 + 600, X1 - 60, Z1 - 80, 120);
      a.log('Added the skid frame, the media tanks, the membrane housings, the feed pump, the header and the control panel (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic laboratory sink',
    desc: (v) => `Stainless laboratory sink top with ${v.n} bowl${v.n > 1 ? 's' : ''}${v.board ? ' and a drainboard' : ''}, a splash, a swing gooseneck faucet and a pair of taps for ${v.n > 1 ? 'each bowl' : 'the bowl'}.`,
    vs: [['1 bowl, 24 in', 24, 24, 30, 33, { n: 1, board: 0 }], ['1 bowl, 30 in', 30, 24, 30, 33, { n: 1, board: 0 }], ['1 bowl with drainboard, 42 in', 42, 24, 30, 33, { n: 1, board: 1 }],
      ['2 bowls, 48 in', 48, 24, 30, 33, { n: 2, board: 0 }], ['2 bowls with drainboard, 66 in', 66, 24, 30, 33, { n: 2, board: 1 }], ['2 bowls, 60 in', 60, 26, 30, 33, { n: 2, board: 0 }],
      ['3 bowls, 78 in', 78, 26, 30, 33, { n: 3, board: 0 }], ['3 bowls with drainboards, 108 in', 108, 26, 30, 33, { n: 3, board: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; const top = Z0 + 260; a.outline(); a.box(X0, YF, Z0, X1, YB, top); a.box(X0, YB - 60, top, X1, YB, Z1 - 100);
      const bw = (W - (v.board ? 600 : 0)) / v.n;
      for (let i = 0; i < v.n; i++) { const x0 = X0 + i * bw + 40, x1 = X0 + (i + 1) * bw - 40; basin(a, x0, YF + 50, x1, YB - 110, top, 150, 10); const x = (x0 + x1) / 2; spout(a, x, YB - 80, top, 330, 180, 12); for (const s of [-1, 1]) { a.cyl(x + s * 110, YB - 80, top, top + 60, 14, 8); a.cyl(x + s * 110, YB - 80, top + 60, top + 80, 22, 8); } }
      if (v.board) { a.rect(X1 - 600, YF, X1, YB, 'EQUIP-DETAIL'); for (let x = X1 - 560; x < X1 - 30; x += 50) a.box(x, YF + 30, top, x + 18, YB - 80, top + 12); }
      a.box(X0, YF, top - 30, X1, YF + 20, top);
      a.log('Added the sink top, the bowls, the splash, a swing gooseneck faucet and taps per bowl' + (v.board ? ', and the ribbed drainboard' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hospital clinical flushing sink',
    desc: (v) => `${v.mount === 'wall' ? 'Wall-hung' : 'Floor-standing'} deep rim sink with a hinged splash lid, a flush valve with a handle, a hose spray on a bracket${v.rack ? ' and a rack for holding vessels beside the bowl' : ''}.`,
    vs: [['floor-standing', 24, 26, 40, 0, { mount: 'floor', rack: 0 }], ['wall-hung', 24, 24, 40, 12, { mount: 'wall', rack: 0 }], ['floor-standing, with vessel rack', 36, 26, 40, 0, { mount: 'floor', rack: 1 }], ['wall-hung, with vessel rack', 36, 24, 40, 12, { mount: 'wall', rack: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, bx = v.rack ? X0 + 340 : cx, bw = 300; a.outline();
      a.box(X0, YB - 30, Z0, X1, YB, Z1);
      if (v.mount === 'floor') { a.ell(bx, YB - 280, Z0 + 250, bw, 250, 250, 18, 8); a.box(bx - bw * 0.8, YB - 400, Z0, bx + bw * 0.8, YB - 150, Z0 + 150); }
      else { a.ell(bx, YB - 250, Z0 + 250, bw, 230, 200, 18, 8); a.box(bx - 150, YB - 200, Z0, bx + 150, YB - 40, Z0 + 150); }
      a.ell(bx, YB - 270, Z0 + 440, bw - 5, 240, 18, 18, 4); a.box(bx - bw, YB - 40, Z0 + 440, bx + bw, YB - 20, Z0 + 620);
      a.tube([[bx - bw, YB - 40, Z0 + 460], [bx, YB - 520, Z0 + 700], [bx + bw, YB - 40, Z0 + 460]], [8, 8, 8], 6);
      const px = bx + 200; a.ycyl(YB - 110, YB - 30, px, Z1 - 450, 24, 12); lever(a, px, YB - 110, Z1 - 450, 60); a.cyl(px, YB - 60, Z1 - 450, Z1 - 150, 14, 8);
      a.box(bx - 250, YB - 70, Z1 - 330, bx - 110, YB - 30, Z1 - 290); a.tube([[bx - 180, YB - 70, Z1 - 310], [bx - 180, YB - 160, Z1 - 520], [bx - 120, YB - 150, Z1 - 650]], [7, 7, 7], 6);
      if (v.rack) { for (let i = 0; i < 4; i++) a.cyl(X1 - 120 - i * 130, YB - 130, Z0 + 500, Z0 + 520, 55, 12); a.box(X1 - 600, YB - 240, Z0 + 440, X1 - 20, YB - 30, Z0 + 460); for (const x of [X1 - 580, X1 - 40]) a.box(x - 10, YB - 240, Z0 + 460, x + 10, YB - 220, Z0 + 520); a.rect(X1 - 600, YB - 240, X1 - 20, YB - 30, 'EQUIP-DETAIL'); }
      a.ellp(bx, YB - 270, bw - 5, 240, 'EQUIP-DETAIL'); a.circ(bx, YB - 270, 40, 'EQUIP-DETAIL');
      a.log('Added the deep bowl, the hinged splash lid, the flush valve and handle' + (v.rack ? ', the vessel rack' : '') + ' and the hose spray bracket (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hospital vacuum and air plant skid',
    desc: (v) => `Skid with a horizontal receiver tank and ${v.n} ${v.kind === 'air' ? 'compressor' : 'vacuum pump'} heads on motors, a manifold with ${v.kind === 'air' ? 'an air dryer column and ' : ''}valves and a control cabinet.`,
    vs: [['vacuum, 2 pumps', 100, 44, 64, 0, { n: 2, kind: 'vac' }], ['vacuum, 3 pumps', 136, 44, 64, 0, { n: 3, kind: 'vac' }], ['vacuum, 4 pumps', 172, 46, 64, 0, { n: 4, kind: 'vac' }],
      ['air, 2 compressors', 112, 48, 72, 0, { n: 2, kind: 'air' }], ['air, 3 compressors', 148, 48, 72, 0, { n: 3, kind: 'air' }], ['air, 4 compressors', 184, 50, 72, 0, { n: 4, kind: 'air' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W } = a; a.outline(); skid(a, X0, YF, X1, YB, Z0, 100);
      const r = 260; hTank(a, X0 + 60, X1 - (v.kind === 'air' ? 560 : 400), YB - r - 80, Z0 + 100 + r + 40, r);
      const pw = (W - 480) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 160 + pw * (i + 0.5); a.box(x - 190, YF + 60, Z0 + 100, x + 190, YF + 420, Z0 + 150); a.xcyl(x - 170, x + 20, YF + 240, Z0 + 330, 140, 16); a.ell(x + 110, YF + 240, Z0 + 340, 120, 130, 130, 14, 8); a.circ(x + 110, YF + 240, 130, 'EQUIP-DETAIL'); a.tube([[x + 110, YF + 340, Z0 + 440], [x + 110, YB - r * 2 - 80, Z0 + 600]], [20, 20], 8); a.rect(x - 190, YF + 60, x + 190, YF + 420, 'EQUIP-DETAIL'); }
      if (v.kind === 'air') { M.tank(a, X1 - 330, YB - 200, Z0 + 100, Z1 - 100, 150); a.cyl(X1 - 330, YB - 200, Z1 - 100, Z1 - 60, 40, 10); }
      panel(a, X1 - 250, YF + 140, Z0 + 140, X1 - 40, Z0 + 940, 130);
      a.log('Added the skid, the receiver tank, the pump or compressor heads with motors, the manifold' + (v.kind === 'air' ? ', the dryer column' : '') + ' and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic sterile processing decontamination sink',
    desc: (v) => `Stainless ${v.n}-compartment decontamination sink with a splash, ${v.n} deep bowls, a spray hose on a swivel arm over the first bowl, a deck faucet and ${v.dr ? 'a drainboard at the end' : 'a flat shelf at the end'}.`,
    vs: [['2 compartments, 60 in', 60, 30, 68, 0, { n: 2, dr: 0 }], ['2 compartments with drainboard, 84 in', 84, 30, 68, 0, { n: 2, dr: 1 }], ['3 compartments, 90 in', 90, 30, 68, 0, { n: 3, dr: 0 }], ['3 compartments with drainboard, 114 in', 114, 30, 68, 0, { n: 3, dr: 1 }], ['4 compartments, 120 in', 120, 32, 68, 0, { n: 4, dr: 0 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, top = Z0 + 36 * I; a.outline();
      const bw = (W - (v.dr ? 600 : 0)) / v.n;
      for (let i = 0; i < v.n; i++) basin(a, X0 + i * bw + 40, YF + 50, X0 + (i + 1) * bw - 30, YB - 100, top, 400, 10);
      a.box(X0, YF, top - 40, X1, YB, top - 0 + 0); a.box(X0, YB - 50, top, X1, YB, Z1);
      const sw = X0 + (v.dr ? W - 600 : W), ex = v.dr ? X1 - 600 : X1; if (!v.dr) a.box(X0, YF, top - 60, X0 + 1, YB, top);
      legs(a, [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 120], [X1 - 50, YB - 120]], Z0, top - 400, 24); a.xcyl(X0 + 50, X1 - 50, YF + 50, Z0 + 180, 12, 8);
      spout(a, X0 + bw / 2, YB - 70, top, 300, 200, 14); a.tube([[X0 + bw * 0.9, YB - 70, top + 800], [X0 + bw * 0.9 + 80, YB - 200, top + 700], [X0 + bw * 0.9 + 40, YB - 300, top + 400]], [10, 10, 10], 6);
      if (v.dr) { a.box(X1 - 600, YF, top - 20, X1, YB - 50, top); for (let x = X1 - 560; x < X1 - 30; x += 55) a.box(x, YF + 40, top, x + 22, YB - 120, top + 12); }
      a.log('Added the deep bowls, the splash, the frame and legs, the deck faucet, the spray hose on its arm and the end shelf or drainboard (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hospital medical gas zone valve box',
    desc: (v) => `Recessed-style wall cabinet with a hinged window door, ${v.n} ball valves with long handles in a row, a gauge under each and labels above.`,
    vs: [2, 3, 4, 5, 6].map((n) => [`${n} valves`, 6 + n * 4, 6, 20, 48, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
      a.box(X0, YB - 50, Z0, X1, YB, Z1); a.box(X0, YF + 6, Z0, X0 + 12, YB - 50, Z1); a.box(X1 - 12, YF + 6, Z0, X1, YB - 50, Z1); a.box(X0, YF + 6, Z0, X1, YB - 50, Z0 + 12); a.box(X0, YF + 6, Z1 - 12, X1, YB - 50, Z1);
      a.box(X0 + 12, YF, Z0 + 12, X1 - 12, YF + 6, Z1 - 12); a.box(X0 + 40, YF - 4, Z0 + 40, X1 - 40, YF, Z1 - 40); a.box(X1 - 40, YF - 12, Z0 + 150, X1 - 20, YF, Z0 + 330);
      const p = (W - 100) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 50 + p * (i + 0.5); a.ycyl(YF + 30, YB - 50, x, Z0 + 290, 14, 10); a.xcyl(x - 70, x + 70, YF + 40, Z0 + 290, 6, 6); a.ell(x, YB - 80, Z0 + 150, 18, 8, 18, 10, 5); a.circ(x, YF + 30, 14, 'EQUIP-HIDDEN'); a.box(x - 30, YF + 6, Z1 - 70, x + 30, YF + 12, Z1 - 50); }
      a.rect(X0 + 12, YF, X1 - 12, YB - 50, 'EQUIP-DETAIL');
      a.log('Added the cabinet, the hinged window door, a valve with handle and gauge for each line and the label strips (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hospital gas cylinder manifold',
    desc: (v) => `Wall-mounted manifold with ${v.n} cylinders in two banks standing on a floor rail, each with a valve and a pigtail hose to a common header, a pressure regulator and a gauge panel.`,
    vs: [['2 + 2 cylinders', 48, 20, 60, 0, { n: 4 }], ['3 + 3 cylinders', 66, 20, 60, 0, { n: 6 }], ['4 + 4 cylinders', 84, 20, 60, 0, { n: 8 }], ['5 + 5 cylinders', 102, 20, 60, 0, { n: 10 }], ['6 + 6 cylinders', 120, 20, 60, 0, { n: 12 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a, r = 115; a.outline(); a.box(X0, YB - 20, Z0 + 100, X1, YB, Z1);
      a.box(X0, YB - 260, Z0, X1, YB - 40, Z0 + 40); a.box(X0, YB - 280, Z0 + 40, X1, YB - 260, Z0 + 700);
      const half = v.n / 2, p = (W - 240) / half;
      for (let b = 0; b < 2; b++) for (let i = 0; i < half; i++) { const x = X0 + 120 + p * (i + 0.5), y = YB - 150 - (b ? 0 : 0); if (b) continue; a.cyl(x, y, Z0 + 40, Z1 - 520, r, 18); a.ell(x, y, Z1 - 520, r, r, r * 0.6, 16, 5); a.cyl(x, y, Z1 - 450, Z1 - 380, 28, 8); a.circ(x, y, r); a.tube([[x, y, Z1 - 380], [x, YB - 50, Z1 - 300], [x, YB - 50, Z1 - 200]], [8, 8, 8], 6); }
      a.xcyl(X0 + 40, X1 - 40, YB - 50, Z1 - 200, 18, 10);
      a.box(X0 + W * 0.4 - 160, YB - 70, Z1 - 160, X0 + W * 0.4 + 160, YB - 20, Z1 - 20); a.cyl(X0 + W * 0.4, YB - 70, Z1 - 100, Z1 - 80, 50, 12);
      a.line(X0, YB - 280, X1, YB - 280, 'EQUIP-DETAIL');
      a.log('Added the floor rail and restraint rail, the cylinders with valves and pigtail hoses, the header and the regulator panel (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hospital floor sink',
    desc: (v) => `Floor-set service sink ${v.s} in square with a raised curb, a removable grate over the bowl, an offset drain and a splash hose bib on the wall${v.rim ? ', and a flushing rim' : ''}.`,
    vs: [['24 in', 24, 24, 12, 0, { s: 24, rim: 0 }], ['32 in', 32, 32, 14, 0, { s: 32, rim: 0 }], ['36 in, flushing rim', 36, 36, 16, 0, { s: 36, rim: 1 }], ['24 in, flushing rim', 24, 24, 12, 0, { s: 24, rim: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YF, Z0 + 60, X0 + 70, YB, Z1); a.box(X1 - 70, YF, Z0 + 60, X1, YB, Z1); a.box(X0 + 70, YF, Z0 + 60, X1 - 70, YF + 70, Z1); a.box(X0 + 70, YB - 70, Z0 + 60, X1 - 70, YB, Z1);
      trenchGrate(a, X0 + 90, YF + 90, X1 - 90, YB - 90, Z1 - 20); a.circ(cx + 40, cy - 20, 40, 'EQUIP-DETAIL');
      if (v.rim) a.box(X0, YB - 20, Z1, X1, YB, Z1 + 60 > a.Z1 ? Z1 : Z1 + 60);
      a.box(X1 - 80, YB - 50, Z1 - 80, X1 - 20, YB, Z1 - 10); a.circ(X1 - 50, YB - 25, 20, 'EQUIP-DETAIL');
      a.log('Added the curbed body, the grate over the bowl, the offset drain and the hose bib (plan and 3D).');
    } }),
  // ===================================================================== CONSTRUCTION SITE
  fam({ cat: 'plumbing/fixtures', title: 'Generic construction site wash station',
    desc: (v) => `Site hand-wash trough ${v.l} in long on a welded frame with ${v.n} tap${v.n > 1 ? 's' : ''} over a stainless basin, a ${v.tank ? 'fresh-water tank with a fill cap above and a waste tank below' : 'supply pipe with a hose connection and a drain outlet'}, a soap dispenser and a towel hook${v.n > 1 ? ' at each station' : ''}.`,
    vs: [['2 taps, 48 in', 48, 24, 50, 0, { n: 2, l: 48, tank: 0 }], ['4 taps, 84 in', 84, 24, 50, 0, { n: 4, l: 84, tank: 0 }], ['6 taps, 120 in', 120, 24, 50, 0, { n: 6, l: 120, tank: 0 }],
      ['8 taps, 168 in', 168, 26, 50, 0, { n: 8, l: 168, tank: 0 }], ['2 taps, with tanks', 48, 28, 66, 0, { n: 2, l: 48, tank: 1 }], ['4 taps, with tanks', 84, 28, 66, 0, { n: 4, l: 84, tank: 1 }],
      ['6 taps, with tanks', 120, 30, 66, 0, { n: 6, l: 120, tank: 1 }], ['10 taps, with tanks', 192, 30, 66, 0, { n: 10, l: 192, tank: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, top = Z0 + 34 * I - (v.tank ? 0 : 0); a.outline();
      const by0 = v.tank ? YF + 40 : YF + 30, by1 = v.tank ? YB - 380 : YB - 120;
      basin(a, X0 + 30, by0, X1 - 30, by1, top, 180, 10);
      legs(a, [[X0 + 50, by0], [X1 - 50, by0], [X0 + 50, by1], [X1 - 50, by1]], Z0, top - 180, 22);
      for (let x = X0 + 400; x < X1 - 300; x += 600) { a.leg(x, by0, Z0, top - 180, 22); a.leg(x, by1, Z0, top - 180, 22); }
      a.xcyl(X0 + 50, X1 - 50, by0, Z0 + 150, 10, 8); a.box(X0 + 30, by0, top - 190, X1 - 30, by1, top - 170);
      const p = (W - 120) / v.n; a.xcyl(X0 + 60, X1 - 60, YB - 90, top + 260, 20, 10);
      for (let i = 0; i < v.n; i++) { const x = X0 + 60 + p * (i + 0.5); a.tube([[x, YB - 90, top + 260], [x, YB - 90, top + 160], [x, by1 - 40, top + 130]], [11, 11, 11], 8); a.cyl(x, by1 - 40, top + 100, top + 130, 12, 8); a.box(x + 80, YB - 70, top + 300, x + 130, YB - 40, top + 400); }
      if (v.tank) { const r = 300; hTank(a, X0 + 100, X1 - 100 - (a.W > 1500 ? 0 : 0), YB - 160, top + 570, 0.0 + 150); a.cyl(X0 + 300, YB - 160, top + 570 + 150, top + 570 + 190, 40, 10); a.box(X0 + 40, YB - 340, Z0 + 150, X1 - 40, YB - 40, Z0 + 330); a.rect(X0 + 40, YB - 340, X1 - 40, YB - 40, 'EQUIP-HIDDEN'); }
      else a.box(X0, YB - 40, top, X1, YB - 20, Z1);
      a.log('Added the frame and legs, the basin, a tap and soap dispenser per station, the supply pipe' + (v.tank ? ', the fresh-water tank and the waste tank' : ' and the drain outlet') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic portable site toilet unit',
    desc: (v) => `Upright moulded unit ${v.w} in wide with a hinged door with a latch and a vent slot, a roof with a vent stack, a seat and bowl inside${v.ur ? ', a urinal on the side wall' : ''}${v.hw ? ' and a foot-pump hand wash with a tank on the front' : ''}${v.acc ? ', and a wide accessible interior with a grab bar' : ''}.`,
    vs: [['standard', 44, 44, 92, 0, { ur: 0, hw: 0, acc: 0, w: 44 }], ['with urinal', 44, 44, 92, 0, { ur: 1, hw: 0, acc: 0, w: 44 }], ['with hand wash', 44, 48, 92, 0, { ur: 0, hw: 1, acc: 0, w: 44 }],
      ['with urinal and hand wash', 44, 48, 92, 0, { ur: 1, hw: 1, acc: 0, w: 44 }], ['accessible, wide', 64, 64, 96, 0, { ur: 0, hw: 1, acc: 1, w: 64 }], ['accessible, wide, no wash', 64, 64, 96, 0, { ur: 0, hw: 0, acc: 1, w: 64 }],
      ['crane-lift, steel base', 48, 48, 100, 0, { ur: 1, hw: 0, acc: 0, w: 48 }], ['standard, tall', 44, 44, 100, 0, { ur: 0, hw: 0, acc: 0, w: 44 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W, D } = a, t = 40, fy = v.hw ? YF + 260 : YF; a.outline();
      a.box(X0, fy, Z0, X1, YB, Z0 + 150); a.box(X0, YB - t, Z0 + 150, X1, YB, Z1 - 80); a.box(X0, fy, Z0 + 150, X0 + t, YB - t, Z1 - 80); a.box(X1 - t, fy, Z0 + 150, X1, YB - t, Z1 - 80);
      a.box(X0, fy, Z1 - 80, X1, YB, Z1); a.box(X0 + t, fy, Z1 - 200, X1 - t, fy + t, Z1 - 80);
      a.box(X0 + t, fy, Z0 + 150, cx - 60, fy + t, Z1 - 200); a.box(cx + 60, fy, Z0 + 150, X1 - t, fy + t, Z1 - 200);
      a.box(cx - 60, fy - 30, Z0 + 170, X1 - t - 30, fy, Z1 - 210); a.box(X1 - t - 120, fy - 40, Z0 + 1000, X1 - t - 60, fy - 30, Z0 + 1060); for (let z = Z1 - 400; z < Z1 - 220; z += 50) a.box(cx - 30, fy - 34, z, X1 - t - 60, fy - 30, z + 14);
      a.box(X0 + t + 60, YB - 520, Z0 + 150, X1 - t - 60, YB - t, Z0 + 520); a.ell(cx, YB - 360, Z0 + 540, 190, 230, 30, 14, 5); a.cyl(cx, YB - t - 40, Z0 + 520, Z0 + 1050, 8, 6);
      a.cyl(X1 - 150, YB - 100, Z1, Z1 + 0, 1, 4); a.cyl(X1 - 150, YB - 120, Z1 - 160, Z1, 36, 10);
      if (v.ur) { a.box(X0 + t, YB - 420, Z0 + 600, X0 + t + 90, YB - 280, Z0 + 1000); }
      if (v.acc) { a.xcyl(X0 + t + 20, X0 + t + 700, YB - 150, Z0 + 850, 18, 8); a.rect(X0 + t, YB - 800, X0 + t + 20, YB, 'EQUIP-DETAIL'); }
      if (v.hw) { a.box(X0 + 50, YF + 20, Z0 + 150, X1 - 50, YF + 240, Z0 + 850); a.box(X1 - 250, YF + 10, Z0 + 170, X1 - 130, YF + 70, Z0 + 230); a.tube([[cx - 100, YF + 120, Z0 + 850], [cx - 100, YF + 120, Z0 + 960], [cx - 100, YF + 60, Z0 + 960]], [14, 14, 12], 8); a.rect(X0 + 50, YF + 20, X1 - 50, YF + 240, 'EQUIP-DETAIL'); }
      a.rect(X0 + t, fy, X1 - t, YB - t, 'EQUIP-DETAIL'); a.circ(cx, YB - 360, 190, 'EQUIP-DETAIL'); a.arc(cx - 60, fy, 600, 0, 90);
      a.log('Added the base, the walls, the hinged door with latch and vent slot, the roof vent stack, the seat and bowl' + (v.ur ? ', the urinal' : '') + (v.hw ? ', the hand-wash tank and pump' : '') + (v.acc ? ' and the grab bar' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic site shower trailer',
    desc: (v) => `Towable shower trailer with ${v.n} stalls behind a row of doors, a roof tank, a hot-water heater box at the front, a drawbar with a coupler, two wheels with fenders and an entry step${v.n > 4 ? ' and a second entry step' : ''}.`,
    vs: [2, 4, 6, 8].map((n) => [`${n} stalls`, n * 30 + 80, 90, 112, 0, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, by0 = YF + 20; a.outline();
      const x0 = X0 + 500; a.box(x0, YF + 120, Z0 + 420, X1, YB, Z1 - 380); a.box(x0 + 30, YF + 110, Z0 + 440, X1 - 30, YF + 120, Z1 - 420);
      a.box(x0, YF + 100, Z0 + 330, X1, YB, Z0 + 420);
      for (let i = 0; i < v.n; i++) { const x = x0 + 60 + (i * (X1 - x0 - 120)) / v.n; a.box(x, YF + 90, Z0 + 520, x + (X1 - x0 - 120) / v.n - 50, YF + 110, Z1 - 560); a.box(x + 50, YF + 80, Z0 + 1050, x + 110, YF + 90, Z0 + 1110); a.rect(x, YF + 90, x + (X1 - x0 - 120) / v.n - 50, YF + 110, 'EQUIP-DETAIL'); }
      hTank(a, x0 + 100, X1 - 100, YB - 380, Z1 - 190, 190); a.box(x0 + 80, YB - 700, Z1 - 380, X1 - 80, YB - 50, Z1 - 370);
      a.box(X0, YB - 650, Z0 + 330, x0, YB - 120, Z1 - 580); a.rect(X0, YB - 650, x0, YB - 120, 'EQUIP-DETAIL'); a.tube([[X0 + 250, YB - 380, Z1 - 580], [X0 + 250, YB - 380, Z1 - 480]], [30, 30], 10);
      a.tube([[X0, YB - 400, Z0 + 350], [X0 - 0 + 60, YB - 400, Z0 + 400], [X0 + 500, YB - 400, Z0 + 400]], [30, 30, 30], 8);
      for (const x of [X1 - 650, X1 - 1350]) { for (const y of [YF + 70, YB - 70]) a.ycyl(y - 50, y + 50, x, Z0 + 330, 330, 18); a.box(x - 430, YF + 20, Z0 + 620, x + 430, YF + 160, Z0 + 650); }
      a.box(x0 + 200, YF - 0, Z0 + 330, x0 + 700, YF + 100, Z0 + 360); a.rect(x0 + 200, YF, x0 + 700, YF + 100, 'EQUIP-HIDDEN');
      if (v.n > 4) a.box(x0 + 1700, YF, Z0 + 330, x0 + 2100, YF + 100, Z0 + 360);
      a.log('Added the trailer deck, the cabin with stall doors, the roof tank, the heater box, the drawbar, the wheels with fenders and the entry steps (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic wheel-wash water supply skid',
    desc: (v) => `Skid with a ${v.gal} gal horizontal supply tank, a ${v.hp} hp pump set with a suction line and a discharge line to a spray header with ${v.n} nozzles, a float box and a control cabinet.`,
    vs: [['1,000 gal, 3 hp', 120, 54, 72, 0, { gal: '1,000', hp: 3, n: 4 }], ['2,000 gal, 5 hp', 156, 60, 80, 0, { gal: '2,000', hp: 5, n: 6 }], ['3,000 gal, 7.5 hp', 192, 66, 84, 0, { gal: '3,000', hp: 7.5, n: 8 }], ['5,000 gal, 10 hp', 240, 78, 92, 0, { gal: '5,000', hp: 10, n: 10 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, D } = a, r = (D - 500) / 2; a.outline(); skid(a, X0, YF, X1, YB, Z0, 120);
      hTank(a, X0 + 60, X1 - 800, YB - r - 60, Z0 + 120 + r + 20, r); a.cyl(X0 + 400, YB - r - 60, Z0 + 120 + 2 * r + 20, Z0 + 120 + 2 * r + 60, 80, 12); a.circ(X0 + 400, YB - r - 60, 80, 'EQUIP-DETAIL');
      M.pumpSet(a, X1 - 560, YF + 260, Z0 + 120, 400); a.xcyl(X1 - 760, X1 - 100, YF + 260, Z0 + 520, 36, 12); a.xcyl(X1 - 960, X1 - 760, YF + 260, Z0 + 320, 40, 10);
      a.ycyl(YF + 260, YF - 0 + 0, X1 - 100, Z0 + 520, 36, 12);
      const hp = (X1 - 1800 - X0 - 100) / v.n; a.xcyl(X0 + 100, X1 - 100, YF + 70, Z1 - 120, 24, 10);
      for (let i = 0; i < v.n; i++) { const x = X0 + 100 + hp * (i + 0.5) * 0 + (i * (W - 400)) / v.n + 60; a.cyl(x, YF + 70, Z1 - 120, Z1 - 60, 22, 8); a.cone(x, YF + 70, Z1 - 60, Z1, 22, 10, 8); a.circ(x, YF + 70, 22, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 100, X1 - 100]) a.cyl(x, YF + 70, Z0 + 120, Z1 - 120, 22, 8);
      panel(a, X1 - 330, YB, Z0 + 140, X1 - 40, Z0 + 920, 130);
      a.log('Added the skid, the supply tank, the pump set with suction and discharge, the spray header with nozzles and the control cabinet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic temporary site water tank on stand',
    desc: (v) => `Vertical polyethylene tank of ${v.gal} gal on a ${v.stand}-leg steel stand with a ladder, a top fill hatch with a lid, a bottom outlet with a ball valve and a level sight tube.`,
    vs: [['500 gal', 54, 54, 104, 0, { gal: 500, r: 0.9, stand: 4, sh: 480 }], ['1,000 gal', 66, 66, 118, 0, { gal: '1,000', r: 1, stand: 4, sh: 520 }], ['2,000 gal', 84, 84, 130, 0, { gal: '2,000', r: 1, stand: 4, sh: 560 }],
      ['3,000 gal', 96, 96, 136, 0, { gal: '3,000', r: 1, stand: 6, sh: 560 }], ['5,000 gal', 114, 114, 148, 0, { gal: '5,000', r: 1, stand: 6, sh: 600 }], ['10,000 gal', 144, 144, 172, 0, { gal: '10,000', r: 1, stand: 8, sh: 700 }]],
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2 - 30, sh = v.sh; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0 + sh, Z0 + sh + 40, r + 15, 24); const top = Z1 - 150; a.cyl(cx, cy, Z0 + sh + 40, top, r, 32); a.cone(cx, cy, top, Z1 - 70, r, r * 0.45, 24);
      a.cyl(cx, cy, Z1 - 70, Z1 - 30, r * 0.4, 16); a.cyl(cx, cy, Z1 - 30, Z1, r * 0.46, 16); a.circ(cx, cy, r * 0.4, 'EQUIP-DETAIL');
      for (let i = 0; i < v.stand; i++) { const g = (i / v.stand) * Math.PI * 2 + Math.PI / v.stand, x = cx + Math.cos(g) * (r * 0.85), y = cy + Math.sin(g) * (r * 0.85); a.leg(x, y, Z0, Z0 + sh, 32); a.circ(x, y, 32, 'EQUIP-HIDDEN'); }
      a.cyl(cx, cy, Z0 + sh - 50, Z0 + sh, 20, 8); a.tube([[cx, cy, Z0 + sh - 50], [cx, cy - r - 80, Z0 + sh - 120]], [24, 24], 8); a.ell(cx, cy - r - 80, Z0 + sh - 120, 40, 40, 40, 10, 5);
      const lx = cx + r + 40; a.cyl(lx, cy - 120, Z0 + sh + 100, top - 100, 10, 6); a.cyl(lx, cy + 120, Z0, top - 80, 10, 6); for (let z = Z0 + 300; z < Z0 + sh + 300; z += 300) a.xcyl(lx - 0, lx + 0 + 1, cy + 120, z, 10, 4);
      for (let z = Z0 + 250; z < top - 100; z += 330) a.box(lx - 130, cy + 100, z, lx - 0, cy + 130, z + 25);
      a.log('Added the stand legs, the tank shell with its dome and top hatch, the bottom outlet valve, the ladder and the level tube (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic site trash pump skid',
    desc: (v) => `${v.dia} in self-priming trash pump coupled to an engine on a steel skid frame with a lifting bail, a suction hose connection with a strainer basket, a discharge elbow, a fuel tank and an exhaust stack.`,
    vs: [['2 in', 40, 24, 30, 0, { dia: 2 }], ['3 in', 46, 26, 34, 0, { dia: 3 }], ['4 in', 56, 28, 38, 0, { dia: 4 }], ['6 in', 72, 34, 48, 0, { dia: 6 }], ['8 in', 90, 40, 56, 0, { dia: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, D } = a, pr = v.dia * 22; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); for (const y of [YF + 20, YB - 20]) a.box(X0, y - 20, Z0 - 0, X1, y + 20, Z0 + 90);
      const ex = X1 - W * 0.45; a.box(ex, YF + 60, Z0 + 60, X1 - 40, YB - 60, Z1 - 160); a.box(ex + 30, YF + 40, Z1 - 160, X1 - 70, YB - 40, Z1 - 80); a.ell(X1 - 120, cy, Z1 - 120, 70, 70, 40, 10, 5);
      a.cyl(X1 - 120, YB - 80, Z1 - 160, Z1, 24, 8); a.box(ex + 60, YF + 40, Z0 + 60, ex + 300, YF + 90, Z0 + 260);
      a.xcyl(X0 + 60, ex, cy, Z0 + 60 + pr, pr, 20); a.ell(X0 + pr + 100, cy, Z0 + 60 + pr, pr * 1.1, pr * 1.1, pr * 1.1, 16, 8); a.circ(X0 + pr + 100, cy, pr * 1.1);
      a.ycyl(YF - 0, cy - pr, X0 + pr + 100, Z0 + 60 + pr * 0.5, pr * 0.4, 12); a.cyl(X0 + pr + 100, cy, Z0 + 60 + pr * 2, Z0 + 60 + pr * 2 + 80, pr * 0.4, 12);
      a.xcyl(X0, X0 + 90, cy, Z0 + 60 + pr, pr * 0.42, 12); a.tube([[X0 + 20, cy, Z0 + 60 + pr], [X0 - 0 + 20, cy, Z0 + 60 + pr]], [pr * 0.5, pr * 0.5], 10);
      a.tube([[ex + 100, YF + 60, Z1 - 40], [ex + 100, YF + 60, Z1 - 0], [ex + W * 0.2, YF + 60, Z1 - 0]], [10, 10, 10], 6); a.tube([[ex + 60, YF + 90, Z1 - 160], [ex + 60, YF + 60, Z1 - 20]], [10, 10], 6);
      a.rect(ex, YF + 60, X1 - 40, YB - 60, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the skid and runners, the engine with fuel tank and exhaust stack, the pump casing, the suction and discharge connections and the lifting bail (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hydrant meter standpipe',
    desc: (v) => `Portable standpipe ${v.s} in with a hydrant connection at the foot, a meter body, ${v.bf ? 'a double-check backflow assembly, ' : ''}a gate valve, two hose outlets with caps and a protective frame with a lifting handle.`,
    vs: [['2.5 in', 22, 22, 40, 0, { s: 2.5, bf: 0 }], ['3 in, with backflow', 30, 22, 44, 0, { s: 3, bf: 1 }], ['4 in, with backflow', 36, 26, 48, 0, { s: 4, bf: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, r = v.s * 10; a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 60, r * 2.2, 16); a.cyl(cx, cy, Z0 + 60, Z0 + 360, r, 12); a.box(cx - r * 2, cy - r * 1.4, Z0 + 360, cx + r * 2, cy + r * 1.4, Z0 + 560); a.circ(cx, cy, r * 2.2, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0 + 560, Z0 + 700, r, 12);
      if (v.bf) { a.xcyl(cx - 300, cx + 300, cy, Z0 + 800, r * 1.3, 14); a.cyl(cx - 150, cy, Z0 + 800, Z0 + 960, 40, 10); a.cyl(cx + 150, cy, Z0 + 800, Z0 + 960, 40, 10); a.tube([[cx, cy, Z0 + 700], [cx, cy, Z0 + 800]], [r, r], 10); }
      const zt = v.bf ? Z0 + 960 : Z0 + 760; a.cyl(cx, cy, Z0 + (v.bf ? 800 : 700), zt, r * 0.9, 12); a.cyl(cx, cy, zt, zt + 80, 70, 12); a.xcyl(cx - 20, cx + 20, cy, zt + 120, 6, 6);
      for (const s of [-1, 1]) { a.xcyl(cx + s * r, cx + s * (r + 180), cy, zt - 70, r * 0.6, 10); a.cyl(cx + s * (r + 180), cy, zt - 120, zt - 20, r * 0.8, 10); }
      for (const s of [-1, 1]) { a.leg(cx + s * r * 2.3, cy - r * 1.8, Z0, Z1 - 40, 14); a.leg(cx + s * r * 2.3, cy + r * 1.8, Z0, Z1 - 40, 14); }
      a.xcyl(cx - r * 2.3, cx + r * 2.3, cy - r * 1.8, Z1 - 40, 14, 8); a.xcyl(cx - r * 2.3, cx + r * 2.3, cy + r * 1.8, Z1 - 40, 14, 8); a.ycyl(cy - r * 1.8, cy + r * 1.8, cx, Z1 - 40, 14, 8);
      a.log('Added the hydrant foot, the meter body, ' + (v.bf ? 'the backflow assembly, ' : '') + 'the gate valve, the two capped hose outlets and the protective frame with a handle (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic site drinking-water station',
    desc: (v) => `Floor-standing water station with a ${v.gal} gal tank under a hinged lid, ${v.n} push taps with drip trays on the front, a paper-cup holder and a ${v.wheels ? 'two-wheel handle frame' : 'base frame with forklift pockets'}.`,
    vs: [['2 taps, 10 gal', 24, 30, 44, 0, { gal: 10, n: 2, wheels: 1 }], ['4 taps, 20 gal', 36, 32, 48, 0, { gal: 20, n: 4, wheels: 1 }], ['4 taps, 50 gal, forklift base', 40, 38, 52, 0, { gal: 50, n: 4, wheels: 0 }], ['6 taps, 100 gal, forklift base', 60, 40, 54, 0, { gal: 100, n: 6, wheels: 0 }]],
    build: (a, v) => {
      const { X0, X1, YB, Z0, Z1, cx, W } = a, YF = a.YF + 150; a.outline();
      const bh = v.wheels ? 200 : 140; a.box(X0, YF, Z0 + (v.wheels ? 100 : 0), X1, YB, Z0 + bh); if (!v.wheels) { for (const x of [X0 + W * 0.2, X1 - W * 0.4]) a.box(x, YF, Z0, x + W * 0.2, YB, Z0 + 140); }
      a.box(X0 + 20, YF + 20, Z0 + bh, X1 - 20, YB - 20, Z1 - 70); a.box(X0, YF, Z1 - 70, X1, YB, Z1 - 30); a.box(X0 + 20, YB - 40, Z1 - 30, X1 - 20, YB, Z1);
      a.cyl(X1 - 80, YF + 80, Z1 - 30, Z1, 40, 10);
      const p = (W - 160) / v.n; for (let i = 0; i < v.n; i++) { const x = X0 + 80 + p * (i + 0.5); a.ycyl(YF - 70, YF + 20, x, Z0 + bh + 400, 14, 8); a.box(x - 12, YF - 70, Z0 + bh + 330, x + 12, YF - 40, Z0 + bh + 400); a.box(x - 60, YF - 140, Z0 + bh + 160, x + 60, YF + 20, Z0 + bh + 180); a.circ(x, YF - 40, 14, 'EQUIP-DETAIL'); }
      a.box(X0 + 20, YF - 0, Z1 - 330, X0 + 160, YF + 20, Z1 - 100);
      if (v.wheels) { for (const s of [-1, 1]) { wheel(a, cx + s * (W / 2 - 60), YB - 190, Z0 + 150, 150, 50); } a.tube([[X0 + 80, YB - 14, Z0 + bh + 200], [X0 + 80, YB - 14, Z1 - 80]], [14, 14], 6); }
      a.log('Added the tank body with its hinged lid, the taps with drip trays, the cup holder and the ' + (v.wheels ? 'wheels and handle' : 'forklift base') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic concrete washout bin',
    desc: (v) => `Open steel washout container ${v.l} in long with a sloped ramp at one end, a perforated drain plate and a catch trough, and two lifting lugs and four corner feet.`,
    vs: [['4 ft', 48, 48, 30, 0, { l: 48 }], ['6 ft', 72, 48, 34, 0, { l: 72 }], ['8 ft', 96, 54, 40, 0, { l: 96 }], ['10 ft, with ramp', 120, 60, 44, 0, { l: 120 }], ['14 ft, with ramp', 168, 72, 52, 0, { l: 168 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, t = 14; a.outline();
      a.box(X0, YF, Z0 + 60, X1, YB, Z0 + 60 + t); a.box(X0, YF, Z0 + 60, X1, YF + t, Z1); a.box(X0, YB - t, Z0 + 60, X1, YB, Z1); a.box(X0, YF, Z0 + 60, X0 + t, YB, Z1); a.box(X1 - t, YF + t, Z0 + 60, X1, YB - t, Z0 + 60 + (Z1 - Z0) * 0.5);
      a.box(X0 + 200, YF + t, Z0 + 60 + t, X1 - 100, YB - t, Z0 + 150); a.rect(X0 + 200, YF + t, X1 - 100, YB - t, 'EQUIP-DETAIL');
      for (let x = X0 + 260; x < X1 - 140; x += 90) a.line(x, YF + t, x, YB - t, 'EQUIP-DETAIL');
      for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) a.box(x - 40, y - 40, Z0, x + 40, y + 40, Z0 + 60);
      for (const x of [X0 + W * 0.3, X1 - W * 0.3]) { a.xcyl(x - 25, x + 25, YF - 20, Z1 - 80, 22, 8); a.box(x - 25, YF - 20, Z1 - 100, x + 25, YF, Z1 - 60); }
      a.tube([[X1 - t, cy, Z0 + 60 + (Z1 - Z0) * 0.5], [X1 + 0, cy, Z0 + 60], [X1 - 80, cy, Z0 + 60]], [12, 12, 12], 6);
      a.log('Added the floor and walls, the sloped end ramp, the perforated drain plate, the lifting lugs and the corner feet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic dewatering well-point header',
    desc: (v) => `Header pipe ${v.l} in long on skids with ${v.n} riser connections each with a ball valve and a swing connector, a pump connection with a flange at one end and an air-release valve at the other.`,
    vs: [['10 ft, 6 risers', 120, 24, 22, 0, { l: 120, n: 6 }], ['20 ft, 12 risers', 240, 24, 22, 0, { l: 240, n: 12 }], ['30 ft, 18 risers', 360, 26, 24, 0, { l: 360, n: 18 }], ['40 ft, 24 risers', 480, 26, 24, 0, { l: 480, n: 24 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a, hr = 100; a.outline('EQUIP-HIDDEN');
      a.xcyl(X0 + 40, X1 - 40, cy, Z0 + 180, hr, 18); a.xcyl(X1 - 140, X1, cy, Z0 + 180, hr * 1.4, 16); a.cyl(X0 + 200, cy, Z0 + 180, Z1, 18, 8);
      for (let x = X0 + 150; x < X1 - 100; x += 900) { a.box(x, YF + 40, Z0, x + 90, YB - 40, Z0 + 70); a.box(x + 100, cy - 100, Z0 + 70, x + 180, cy + 100, Z0 + 110); }
      const p = (W - 500) / v.n;
      for (let i = 0; i < v.n; i++) { const x = X0 + 250 + p * (i + 0.5); a.ycyl(cy - hr, YF + 40, x, Z0 + 180, 28, 10); a.ell(x, YF + 100, Z0 + 180, 34, 34, 34, 8, 5); a.xcyl(x - 50, x + 50, YF + 100, Z0 + 180 + 40, 6, 6); a.tube([[x, YF + 40, Z0 + 180], [x, YF + 20, Z0 + 100], [x, YF + 0 + 5, Z0 + 20]], [24, 24, 24], 8); a.circ(x, YF + 40, 24, 'EQUIP-DETAIL'); }
      a.rect(X0 + 40, cy - hr, X1 - 40, cy + hr, 'EQUIP-DETAIL');
      a.log('Added the header pipe on skids, a ball valve and swing connector for each riser, the pump flange and the air-release valve (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic site foot-pump hand-wash stand',
    desc: (v) => `Free-standing portable wash stand with a ${v.gal} gal fresh tank above a basin and a waste tank below, a foot pump${v.n > 1 ? ', two taps' : ', one tap'}, a soap pump and a towel holder.`,
    vs: [['1 tap, 5 gal', 20, 18, 40, 0, { gal: 5, n: 1 }], ['1 tap, 10 gal', 22, 20, 42, 0, { gal: 10, n: 1 }], ['2 taps, 15 gal', 34, 20, 42, 0, { gal: 15, n: 2 }], ['2 taps, 20 gal, with wheels', 38, 22, 44, 0, { gal: 20, n: 2, wh: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YF, Z0 + 80, X1, YB, Z0 + 500); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-HIDDEN'); a.box(X0 + 20, YF - 0, Z0 + 500, X1 - 20, YB - 0, Z0 + 520);
      basin(a, X0 + 40, YF + 20, X1 - 40, YF + 280, Z0 + 840, 160, 8); a.box(X0 + 20, YF + 20, Z0 + 520, X0 + 40, YF + 280, Z0 + 840); a.box(X1 - 40, YF + 20, Z0 + 520, X1 - 20, YF + 280, Z0 + 840);
      a.box(X0, YB - 260, Z0 + 840, X1, YB, Z1 - 40); a.cyl(cx, YB - 130, Z1 - 40, Z1, 60, 14);
      for (let i = 0; i < v.n; i++) { const x = v.n > 1 ? cx + (i ? 1 : -1) * W * 0.22 : cx; spout(a, x, YB - 270, Z0 + 840, 40, 100, 10); a.box(x - 40, YF + 0, Z0 + 30, x + 40, YF + 180, Z0 + 70); a.rect(x - 40, YF, x + 40, YF + 180, 'EQUIP-HIDDEN'); }
      a.box(X0 + 20, YB - 280, Z0 + 960, X0 + 90, YB - 260, Z0 + 1100); a.box(X1 - 140, YB - 280, Z0 + 900, X1 - 40, YB - 260, Z0 + 1080);
      if (v.wh) for (const x of [X0 + 70, X1 - 70]) wheel(a, x, YB - 40, Z0 + 100, 100, 40);
      else for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) a.leg(x, y, Z0, Z0 + 80, 18);
      a.log('Added the base, the waste tank, the basin, the fresh tank with its cap, the taps, the foot pumps, the soap pump and the towel holder (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic towable site water bowser',
    desc: (v) => `Single-axle towable tank trailer of ${v.gal} gal with an oval tank, a top manway, a rear outlet valve with a hose connector, a drawbar with a coupler and a jockey wheel, two wheels with fenders and a side hand pump.`,
    vs: [['250 gal', 90, 52, 52, 0, { gal: 250, r: 20 }], ['500 gal', 108, 60, 58, 0, { gal: 500, r: 24 }], ['1,000 gal', 150, 66, 62, 0, { gal: '1,000', r: 26 }], ['1,500 gal', 180, 72, 66, 0, { gal: '1,500', r: 28 }], ['2,000 gal, tandem', 216, 78, 72, 0, { gal: '2,000', r: 30, tan: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, tl = W - 450, tx0 = X0 + 450, r = Math.min(v.r * I, (Z1 - Z0 - 400) / 2); a.outline();
      a.box(tx0, YF + 80, Z0 + 330, X1, YB - 80, Z0 + 380); a.xcyl(tx0 + 40, X1 - 40, cy, Z0 + 380 + r + 40, r, 24); a.ell(tx0 + 40, cy, Z0 + 380 + r + 40, 60, r, r, 12, 8); a.ell(X1 - 40, cy, Z0 + 380 + r + 40, 60, r, r, 12, 8);
      a.cyl(cx + 200, cy, Z0 + 380 + 2 * r + 20, Z0 + 380 + 2 * r + 80, 150, 16); a.circ(cx + 200, cy, 150, 'EQUIP-DETAIL');
      a.tube([[X0 + 40, cy, Z0 + 340], [tx0 + 100, cy + 50, Z0 + 340]], [30, 30], 8); a.box(X0, cy - 60, Z0 + 340, X0 + 140, cy + 60, Z0 + 380); a.cyl(X0 + 70, cy, Z0 + 380, Z0 + 440, 40, 10);
      a.leg(X0 + 220, cy, Z0, Z0 + 340, 14); a.xcyl(X0 + 200, X0 + 240, cy, Z0 + 10, 40, 10);
      for (const x of (v.tan ? [X1 - 500, X1 - 950] : [X1 - 650])) { a.ycyl(YF + 20, YF + 80, x, Z0 + 300, 300, 18); a.ycyl(YB - 80, YB - 20, x, Z0 + 300, 300, 18); a.box(x - 380, YF, Z0 + 600, x + 380, YF + 110, Z0 + 630); a.box(x - 380, YB - 110, Z0 + 600, x + 380, YB, Z0 + 630); a.circ(x, YF + 50, 300, 'EQUIP-HIDDEN'); }
      a.xcyl(X1 - 30, X1 + 0 - 1, cy, Z0 + 420, 22, 8); a.ycyl(cy - 30, cy + 30, X1 - 30, Z0 + 460, 24, 10); a.box(X1 - 140, YB - 160, Z0 + 430, X1 - 40, YB - 90, Z0 + 520);
      a.log('Added the chassis, the oval tank with its manway, the rear outlet valve, the drawbar with coupler and jockey wheel, the wheels with fenders and the hand pump (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic site frac tank',
    desc: (v) => `Rectangular steel storage tank of ${v.gal} gal on two skid runners with a rounded roof with two hatches, a manifold with ${v.n} valves at one end, a side ladder and a stair platform at the roof.`,
    vs: [['10,000 gal', 240, 96, 118, 0, { gal: '10,000', n: 2 }], ['15,000 gal', 300, 96, 124, 0, { gal: '15,000', n: 3 }], ['20,000 gal', 360, 102, 132, 0, { gal: '20,000', n: 3 }], ['21,000 gal, tall', 360, 102, 140, 0, { gal: '21,000', n: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline(); a.box(X0, YF + 100, Z0, X1, YF + 260, Z0 + 140); a.box(X0, YB - 260, Z0, X1, YB - 100, Z0 + 140);
      a.box(X0 + 10, YF + 20, Z0 + 140, X1 - 10, YB - 20, Z1 - 250); a.ell(cx, cy, Z1 - 250, W / 2 - 10, D / 2 - 20, 250, 20, 6);
      for (let x = X0 + 400; x < X1 - 300; x += 700) a.box(x, YF + 10, Z0 + 140, x + 30, YF + 20, Z1 - 250);
      for (const x of [cx - W * 0.2, cx + W * 0.2]) { a.cyl(x, cy, Z1 - 50, Z1, 220, 16); a.circ(x, cy, 220, 'EQUIP-DETAIL'); }
      for (let i = 0; i < v.n; i++) { const y = YF + 120 + ((D - 240) / v.n) * (i + 0.5); a.xcyl(X1 - 10, X1 + 0, y, Z0 + 460, 60, 12); a.ell(X1 - 60, y, Z0 + 460, 70, 70, 70, 10, 5); a.circ(X1 - 40, y, 60, 'EQUIP-DETAIL'); }
      a.cyl(X0 + 200, YF + 10, Z0 + 140, Z1 - 250, 12, 6); for (let z = Z0 + 300; z < Z1 - 300; z += 300) a.box(X0 + 120, YF - 30, z, X0 + 280, YF + 20, z + 22);
      a.rect(X0, YF + 100, X1, YF + 260, 'EQUIP-HIDDEN'); a.rect(X0, YB - 260, X1, YB - 100, 'EQUIP-HIDDEN');
      a.log('Added the skid runners, the tank body with its ribs and rounded roof, the hatches, the end manifold with valves and the side ladder (plan and 3D).');
    } }),
  // ===================================================================== MINING
  fam({ cat: 'plumbing/equipment', title: 'Generic mine submersible dewatering pump',
    desc: (v) => `Upright submersible pump for a ${v.d} in discharge: a cylindrical motor housing, a volute casing with a ring of inlet slots, a bottom strainer ring on feet, a discharge elbow with a hose coupling, a lifting bail and a cable gland on top.`,
    vs: [['2 in', 12, 12, 24, 0, { d: 2 }], ['3 in', 14, 14, 28, 0, { d: 3 }], ['4 in', 16, 16, 34, 0, { d: 4 }], ['6 in', 22, 22, 46, 0, { d: 6 }], ['8 in', 28, 28, 58, 0, { d: 8 }], ['10 in', 34, 34, 70, 0, { d: 10 }]],
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, R = (X1 - X0) / 2 - 10, H = Z1 - Z0; a.circ(cx, cy, R); a.outline('EQUIP-HIDDEN');
      for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a.box(cx + x * R * 0.7 - 20, cy + y * R * 0.7 - 20, Z0, cx + x * R * 0.7 + 20, cy + y * R * 0.7 + 20, Z0 + H * 0.08);
      a.cyl(cx, cy, Z0 + H * 0.08, Z0 + H * 0.2, R * 0.9, 24); for (let i = 0; i < 12; i++) { const g = (i / 12) * Math.PI * 2; a.box(cx + Math.cos(g) * R * 0.9 - 8, cy + Math.sin(g) * R * 0.9 - 8, Z0 + H * 0.09, cx + Math.cos(g) * R * 0.9 + 8, cy + Math.sin(g) * R * 0.9 + 8, Z0 + H * 0.19); }
      a.cyl(cx, cy, Z0 + H * 0.2, Z0 + H * 0.38, R, 24); a.ell(cx, cy, Z0 + H * 0.29, R * 1.0, R * 1.0, H * 0.1, 18, 6);
      a.cyl(cx, cy, Z0 + H * 0.38, Z0 + H * 0.82, R * 0.82, 24); for (let z = Z0 + H * 0.45; z < Z0 + H * 0.8; z += H * 0.12) a.cyl(cx, cy, z, z + 10, R * 0.86, 24);
      a.tube([[cx + R * 0.5, cy, Z0 + H * 0.3], [cx + R + 40, cy, Z0 + H * 0.3], [cx + R + 40, cy, Z0 + H * 0.45]], [v.d * 8, v.d * 8, v.d * 8], 12);
      a.cone(cx, cy, Z0 + H * 0.82, Z0 + H * 0.88, R * 0.82, R * 0.5, 20); a.cyl(cx, cy, Z0 + H * 0.88, Z0 + H * 0.92, R * 0.5, 16); a.cyl(cx - R * 0.2, cy, Z0 + H * 0.92, Z0 + H * 0.97, 14, 8);
      a.tube([[cx - R * 0.5, cy, Z0 + H * 0.92], [cx - R * 0.5, cy, Z1 - 5], [cx + R * 0.5, cy, Z1 - 5], [cx + R * 0.5, cy, Z0 + H * 0.92]], [8, 8, 8, 8], 6);
      a.log('Added the strainer ring on feet, the volute casing, the ribbed motor housing, the discharge elbow with its coupling, the cable gland and the lifting bail (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine slurry pump set',
    desc: (v) => `Horizontal slurry pump for a ${v.d} in discharge on a steel baseplate with a thick-walled volute casing, a pedestal bearing housing, a belt drive under a guard, an electric motor on a slide base, a flanged suction inlet at the front and a flanged discharge on top.`,
    vs: [['4 in', 84, 36, 44, 0, { d: 4 }], ['6 in', 108, 44, 56, 0, { d: 6 }], ['8 in', 132, 52, 66, 0, { d: 8 }], ['10 in', 156, 60, 76, 0, { d: 10 }], ['12 in', 180, 68, 86, 0, { d: 12 }], ['14 in', 204, 76, 96, 0, { d: 14 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, D } = a, pr = Math.min(v.d * 36, D * 0.3), zc = Z0 + 140 + pr; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 100); a.box(X0 + 20, YF + 20, Z0 + 100, X1 - 20, YB - 20, Z0 + 140);
      const px = X0 + pr + 200; a.ell(px, cy, zc, pr, pr * 0.8, pr, 20, 10); a.ycyl(cy - pr * 0.8, cy + pr * 0.8, px, zc, pr * 0.95, 20); a.circ(px, cy, pr);
      a.ycyl(YF + 20, cy - pr * 0.8, px, zc, pr * 0.5, 16); a.ycyl(YF + 10, YF + 40, px, zc, pr * 0.7, 16); a.circ(px, YF + 20, pr * 0.6, 'EQUIP-DETAIL');
      a.cyl(px + pr * 0.4, cy, zc + pr * 0.8, Z1 - 20, pr * 0.45, 14); a.cyl(px + pr * 0.4, cy, Z1 - 40, Z1, pr * 0.62, 14);
      a.box(px + pr * 1.05, cy - pr * 0.5, Z0 + 140, px + pr * 2.2, cy + pr * 0.5, zc + pr * 0.4); a.xcyl(px + pr * 0.9, px + pr * 2.2, cy, zc, pr * 0.22, 12);
      const mx = X1 - W * 0.3; a.box(mx - W * 0.2, YF + 40, Z0 + 140, mx + W * 0.2, YB - 40, Z0 + 190); a.xcyl(mx - W * 0.2, mx + W * 0.2, cy, Z0 + 190 + pr * 0.9, pr * 0.9, 20); a.box(mx - W * 0.2, cy - pr * 0.5, Z0 + 190, mx + W * 0.2, cy + pr * 0.5, Z0 + 190 + pr * 0.9);
      a.box(px + pr * 2.2, cy - pr * 0.9, zc - pr * 0.5, mx - W * 0.2, cy + pr * 0.9, zc + pr * 1.2); a.rect(px + pr * 2.2, cy - pr * 0.9, mx - W * 0.2, cy + pr * 0.9, 'EQUIP-DETAIL');
      a.rect(mx - W * 0.2, cy - pr * 0.9, mx + W * 0.2, cy + pr * 0.9, 'EQUIP-DETAIL');
      a.log('Added the baseplate, the thick volute casing, the suction and discharge flanges, the bearing housing, the belt guard and the motor on its slide base (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine process water tank',
    desc: (v) => `Vertical flat-bottom steel tank ${v.dia} ft across with a roof manway and vent, a rim handrail and a roof platform, a spiral-free side ladder with a cage, a bottom outlet with a gate valve, an overflow pipe down the side and a level gauge board.`,
    vs: [['10 ft across, 12 ft tall', 126, 126, 160, 0, { dia: 10, tall: 12 }], ['15 ft across, 16 ft tall', 186, 186, 214, 0, { dia: 15, tall: 16 }], ['20 ft across, 20 ft tall', 246, 246, 264, 0, { dia: 20, tall: 20 }], ['30 ft across, 24 ft tall', 366, 366, 316, 0, { dia: 30, tall: 24 }],
      ['40 ft across, 28 ft tall', 486, 486, 366, 0, { dia: 40, tall: 28 }], ['50 ft across, 32 ft tall', 606, 606, 416, 0, { dia: 50, tall: 32 }], ['20 ft across, 32 ft tall', 246, 246, 416, 0, { dia: 20, tall: 32 }], ['30 ft across, 36 ft tall', 366, 366, 452, 0, { dia: 30, tall: 36 }]],
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, r = (X1 - X0) / 2 - 150, sh = Z1 - Z0 - 150; a.circ(cx, cy, r); a.outline('EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0, Z0 + 30, r + 40, 36); a.cyl(cx, cy, Z0 + 30, Z0 + sh, r, 48); for (let z = Z0 + 300; z < Z0 + sh - 100; z += 600) a.cyl(cx, cy, z, z + 14, r + 12, 48);
      a.cone(cx, cy, Z0 + sh, Z0 + sh + 70, r, r * 0.12, 36); a.cyl(cx, cy, Z0 + sh + 70, Z0 + sh + 110, r * 0.12, 12); a.cyl(cx + r * 0.45, cy, Z0 + sh + 8, Z0 + sh + 50, 120, 12); a.circ(cx + r * 0.45, cy, 120, 'EQUIP-DETAIL');
      const hr = r - 25; for (let i = 0; i < 24; i++) { const g = (i / 24) * Math.PI * 2; a.cyl(cx + Math.cos(g) * hr, cy + Math.sin(g) * hr, Z0 + sh - 30, Z0 + sh + 90, 6, 4); } a.tube(Array.from({ length: 25 }, (_, i) => [cx + Math.cos((i / 24) * Math.PI * 2) * hr, cy + Math.sin((i / 24) * Math.PI * 2) * hr, Z0 + sh + 90]), Array(25).fill(8), 6);
      const lx = cx, ly = cy - r - 40; a.leg(lx - 150, ly, Z0 + 100, Z0 + sh + 90, 12); a.leg(lx + 150, ly, Z0 + 100, Z0 + sh + 90, 12); for (let z = Z0 + 300; z < Z0 + sh; z += 300) a.xcyl(lx - 150, lx + 150, ly, z, 8, 6);
      for (let z = Z0 + 2400; z < Z0 + sh; z += 700) a.tube([[lx - 220, ly, z], [lx - 220, ly + 120, z + 300], [lx + 220, ly + 120, z + 300], [lx + 220, ly, z]], [6, 6, 6, 6], 4);
      a.xcyl(cx + r - 10, cx + r + 400, cy, Z0 + 350, 90, 14); a.ell(cx + r + 250, cy, Z0 + 350, 60, 120, 120, 10, 6); a.circ(cx + r + 400, cy, 90, 'EQUIP-DETAIL');
      a.tube([[cx - r - 10, cy, Z0 + sh - 100], [cx - r - 120, cy, Z0 + sh - 100], [cx - r - 120, cy, Z0 + 200], [cx - r - 20, cy, Z0 + 200]], [50, 50, 50, 50], 8);
      a.log('Added the base ring, the shell with its stiffener rings, the roof with vent and manway, the rim handrail, the caged ladder, the bottom outlet valve and the overflow pipe (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine water pipe manifold',
    desc: (v) => `Header pipe ${v.l} in long on two saddle stands with ${v.n} branch outlets on the front, each with a flanged gate valve and a hand wheel, an inlet flange at one end and a drain valve at the other.`,
    vs: [[2, 72], [3, 96], [4, 132], [5, 168], [6, 204]].map(([n, l]) => [`${n} outlets, ${l} in`, l, 36, 48, 0, { n, l }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W } = a, hr = 120, zc = Z0 + 330; a.outline('EQUIP-HIDDEN');
      for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { a.box(x - 120, YB - 300, Z0, x + 120, YB - 40, Z0 + 40); a.box(x - 120, YB - 300, Z0 + 40, x - 90, YB - 40, zc - hr * 0.7); a.box(x + 90, YB - 300, Z0 + 40, x + 120, YB - 40, zc - hr * 0.7); }
      a.xcyl(X0 + 40, X1 - 40, YB - 170, zc, hr, 20); a.xcyl(X0, X0 + 40, YB - 170, zc, hr * 1.5, 20); a.xcyl(X1 - 40, X1, YB - 170, zc, hr * 1.5, 20); a.circ(X0 + 20, YB - 170, hr * 1.5, 'EQUIP-DETAIL');
      const p = (W - 400) / v.n; for (let i = 0; i < v.n; i++) { const x = X0 + 200 + p * (i + 0.5); a.ycyl(YF + 150, YB - 170, x, zc, 55, 14); a.ycyl(YF + 150, YF + 175, x, zc, 85, 14); a.box(x - 90, YF + 180, zc - 90, x + 90, YF + 300, zc + 90); a.cyl(x, YF + 240, zc + 90, zc + 300, 12, 6); a.xcyl(x - 60, x + 60, YF + 240, zc + 300, 10, 8); a.circ(x, YF + 150, 55, 'EQUIP-DETAIL'); a.ycyl(YF + 20, YF + 150, x, zc, 70, 14); }
      a.cyl(X1 - 200, YB - 170, Z0 + 120, zc, 30, 8); a.xcyl(X1 - 260, X1 - 140, YB - 170, Z0 + 120, 8, 6);
      a.log('Added the header, the two saddle stands, the end flanges, a flanged branch outlet with a gate valve and hand wheel at each position and the drain valve (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic mine change-house shower bank',
    desc: (v) => `Row of ${v.n} open shower stalls with full-height dividers, a shower head on a curved arm in each, a mixing valve with two knobs, a tiled floor lip with a drain grate in each stall and a bench rail along the back.`,
    vs: [['4 stalls', 144, 36, 92, 0, { n: 4 }], ['6 stalls', 216, 36, 92, 0, { n: 6 }], ['8 stalls', 288, 36, 92, 0, { n: 8 }], ['12 stalls', 432, 36, 92, 0, { n: 12 }], ['6 stalls, double-sided', 216, 72, 92, 0, { n: 6, dbl: 1 }], ['10 stalls, double-sided', 360, 72, 92, 0, { n: 10, dbl: 1 }], ['16 stalls, double-sided', 576, 72, 92, 0, { n: 16, dbl: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, D } = a, nn = v.dbl ? v.n / 2 : v.n, pw = W / nn; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40);
      const rows = v.dbl ? [[YF, cy - 20, 1], [cy + 20, YB, -1]] : [[YF, YB, 1]];
      for (const [y0, y1, s] of rows) {
        const wy = s > 0 ? y1 - 14 : y0 + 14, hy = s > 0 ? y1 - 50 : y0 + 50;
        a.box(X0, wy - 14, Z0 + 40, X1, wy + 14, Z1 - 100);
        for (let i = 0; i <= nn; i++) { const px = Math.min(X0 + i * pw, X1 - 18); a.box(px, y0, Z0 + 40, px + 18, y1, Z0 + 1800); }
        for (let i = 0; i < nn; i++) { const x = X0 + pw * (i + 0.5); a.tube([[x, hy, Z0 + 1300], [x, hy, Z0 + 1900], [x, hy + s * -220, Z0 + 1950]], [12, 12, 12], 8); a.cone(x, hy - s * 220, Z0 + 1900, Z0 + 1950, 25, 60, 12); for (const k of [-80, 80]) a.ycyl(hy - s * 40, hy, x + k, Z0 + 1200, 22, 8); trenchGrate(a, x - 120, (y0 + y1) / 2 - 120, x + 120, (y0 + y1) / 2 + 120, Z0 + 48); }
      }
      a.log('Added the tiled floor, the full-height dividers, a shower head on its arm, the two-knob mixing valve and the drain grate for each stall (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic mine boot wash and hand wash station',
    desc: (v) => `Floor trough ${v.l} in long with ${v.n} rotating brush rollers between two side guard rails, a spray bar over the brushes, a grated drain and a ${v.hw ? 'wall-mounted hand-wash basin with a lever tap at the end' : 'push-button water valve on a post'}.`,
    vs: [['1 bay', 48, 24, 44, 0, { l: 48, n: 2, hw: 0 }], ['2 bays, with hand wash', 84, 28, 44, 0, { l: 84, n: 4, hw: 1 }], ['3 bays, with hand wash', 120, 28, 44, 0, { l: 120, n: 6, hw: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, D } = a; a.outline(); const bw = v.hw ? W - 500 : W - 300;
      a.box(X0, YF, Z0, X0 + bw, YB, Z0 + 90); a.box(X0, YF, Z0 + 90, X0 + bw, YF + 20, Z0 + 150); a.box(X0, YB - 20, Z0 + 90, X0 + bw, YB, Z0 + 150); trenchGrate(a, X0 + 60, YF + 80, X0 + bw - 60, YB - 80, Z0 + 90);
      for (let i = 0; i < v.n; i++) { const x = X0 + 80 + ((bw - 160) * (i + 0.5)) / v.n; a.ycyl(YF + 100, YB - 100, x, Z0 + 150, 45, 12); for (let y = YF + 140; y < YB - 130; y += 40) a.ycyl(y, y + 12, x, Z0 + 150, 58, 10); }
      for (const y of [YF + 20, YB - 20]) { a.box(X0, y - 10, Z0 + 150, X0 + bw, y + 10, Z0 + 900); a.xcyl(X0, X0 + bw, y, Z0 + 900, 20, 8); }
      for (let x = X0 + 150; x < X0 + bw - 100; x += 500) for (const y of [YF + 20, YB - 20]) a.leg(x, y, Z0 + 150, Z0 + 900, 16);
      a.xcyl(X0 + 60, X0 + bw - 60, YB - 60, Z0 + 700, 14, 8);
      for (let x = X0 + 150; x < X0 + bw - 100; x += 300) a.cyl(x, YB - 60, Z0 + 700, Z0 + 740, 12, 6);
      if (v.hw) { const x = X1 - 250; a.box(x - 220, YB - 40, Z0 + 700, x + 220, YB, Z1 - 100); a.box(x - 200, YB - 380, Z0 + 700, x + 200, YB - 40, Z0 + 850); basin(a, x - 160, YB - 360, x + 160, YB - 80, Z0 + 850, 120, 8); spout(a, x, YB - 60, Z0 + 850, 160, 120, 10); }
      else { a.leg(X0 + bw + 100, YB - 60, Z0, Z0 + 1000, 25); a.box(X0 + bw + 40, YB - 120, Z0 + 1000, X0 + bw + 160, YB - 0, Z0 + 1100); }
      a.log('Added the trough with its grate, the brush rollers, the side guard rails, the spray bar' + (v.hw ? ' and the hand-wash basin with its tap' : ' and the push-button post') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine vertical sump pump',
    desc: (v) => `Vertical sump pump with a ${v.l} in column pipe hung from a mounting plate over a sump cover: a motor on a stand above the plate, a coupling guard, a discharge pipe with a flange and elbow, a bottom strainer and a bearing bracket.`,
    vs: [['6 ft column', 36, 30, 120, 0, { l: 72 }], ['10 ft column', 36, 30, 160, 0, { l: 120 }], ['14 ft column', 40, 34, 200, 0, { l: 168 }], ['20 ft column', 44, 38, 270, 0, { l: 240 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, pz = Z0 + 450; a.outline(); a.box(X0, YF, pz - 40, X1, YB, pz); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL'); a.circ(cx, cy, 90, 'EQUIP-HIDDEN');
      a.cyl(cx, cy, Z0 + 20, pz - 40, 50, 14); a.ell(cx, cy, Z0 + 80, 100, 100, 70, 14, 6); for (let i = 0; i < 10; i++) { const g = (i / 10) * Math.PI * 2; a.cyl(cx + Math.cos(g) * 85, cy + Math.sin(g) * 85, Z0 + 10, Z0 + 150, 7, 4); }
      const nb = Math.round((pz - Z0 - 150) / 900); for (let i = 1; i <= nb; i++) a.cyl(cx, cy, Z0 + 150 + i * ((pz - Z0 - 150) / (nb + 1)) - 14, Z0 + 150 + i * ((pz - Z0 - 150) / (nb + 1)) + 14, 70, 12);
      a.cyl(cx, cy, pz, pz + 180, 130, 16); a.cyl(cx, cy, pz + 180, Z1 - 330, 90, 14); a.cyl(cx, cy, Z1 - 330, Z1 - 40, 140, 20); a.ell(cx, cy, Z1 - 40, 140, 140, 40, 16, 5); for (const dx of [-80, 80]) a.cyl(cx + dx, cy, Z1 - 40, Z1, 8, 6);
      for (const s of [-1, 1]) { a.leg(cx + s * 120, cy - 100, pz, pz + 300, 12); }
      a.tube([[cx + 100, cy + 60, pz - 20], [cx + 260, cy + 60, pz - 20], [cx + 260, cy + 60, pz + 280], [cx + 260, YB - 60, pz + 280]], [40, 40, 40, 40], 12); a.cyl(cx + 260, cy + 60, pz - 20, pz - 60, 70, 12);
      a.log('Added the mounting plate, the column pipe with its bearing brackets, the bottom strainer, the motor on its stand, the coupling guard and the discharge pipe with flange (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine hose cabinet and fire water station',
    desc: (v) => `Wall cabinet ${v.w} in wide with a hinged door with a window, a hose reel with ${v.len} ft of hose, a nozzle on a bracket, an inlet valve with a hand wheel and a pressure gauge${v.ext ? ', and a second compartment holding a portable extinguisher on a hook' : ''}.`,
    vs: [['hose reel, 30 in', 30, 12, 34, 20, { w: 30, len: 100, ext: 0 }], ['hose reel, 36 in with extinguisher', 36, 14, 36, 20, { w: 36, len: 100, ext: 1 }], ['hose reel, 42 in with extinguisher', 42, 16, 40, 18, { w: 42, len: 150, ext: 1 }], ['hose reel, 24 in, short hose', 24, 12, 30, 24, { w: 24, len: 50, ext: 0 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline();
      const bx1 = v.ext ? X0 + W * 0.58 : X1; a.box(X0, YB - 40, Z0, X1, YB, Z1); a.box(X0, YF + 20, Z0, X1, YF + 40, Z0 + 20); a.box(X0, YF + 20, Z1 - 20, X1, YF + 40, Z1); a.box(X0, YF + 20, Z0, X0 + 20, YB - 40, Z1); a.box(X1 - 20, YF + 20, Z0, X1, YB - 40, Z1); if (v.ext) a.box(bx1, YF + 20, Z0, bx1 + 20, YB - 40, Z1);
      const rr = Math.min((bx1 - X0) * 0.32, 230), rx = (X0 + bx1) / 2 - 20; hoseReel(a, rx, YB - 50, Z0 + (Z1 - Z0) * 0.5, rr, Math.min(140, YB - YF - 120)); a.ycyl(YF + 40, YF + 60, rx, Z0 + (Z1 - Z0) * 0.5, rr * 0.2, 8);
      a.box(bx1 - 120, YF + 20, Z1 - 200, bx1 - 20, YF + 60, Z1 - 100); a.cone(bx1 - 70, YF + 40, Z1 - 330, Z1 - 200, 20, 10, 8);
      a.xcyl(X0 + 40, X0 + 140, YB - 120, Z0 + 100, 16, 8); a.cyl(X0 + 90, YB - 120, Z0 + 100, Z0 + 160, 30, 10); a.ycyl(YB - 150, YB - 100, X0 + 90, Z0 + 230, 22, 10);
      if (v.ext) { a.cyl(bx1 + (X1 - bx1) / 2, YB - 130, Z0 + 40, Z1 - 250, 55, 14); a.cyl(bx1 + (X1 - bx1) / 2, YB - 130, Z1 - 250, Z1 - 150, 25, 10); a.box(bx1 + 40, YB - 100, Z1 - 140, X1 - 40, YB - 40, Z1 - 100); }
      a.frame(X0 + 5, Z0 + 20, X1 - 5, Z1 - 20, YF, YF + 20, 60); a.box(bx1 - 15, YF, Z0 + 20, bx1 + 15, YF + 20, Z1 - 20); a.box(bx1 - 70, YF, (Z0 + Z1) / 2 - 80, bx1 - 40, YF + 30, (Z0 + Z1) / 2 + 80); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
      a.log('Added the cabinet shell, the hose reel and hose, the nozzle bracket, the inlet valve with hand wheel and the gauge' + (v.ext ? ', the extinguisher compartment' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine portal dust-suppression spray arch',
    desc: (v) => `Steel arch ${v.sw} ft wide over a haul road with a spray pipe over its top and down both legs carrying ${v.n} nozzles, a supply riser with a valve and gauge, two concrete foot blocks and a small control box.`,
    vs: [['10 ft opening', 144, 36, 156, 0, { sw: 10, n: 8 }], ['15 ft opening', 204, 36, 192, 0, { sw: 15, n: 12 }], ['20 ft opening', 264, 36, 228, 0, { sw: 20, n: 16 }], ['30 ft opening', 384, 40, 264, 0, { sw: 30, n: 22 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline('EQUIP-HIDDEN');
      for (const x of [X0 + 100, X1 - 100]) { a.box(x - 100, cy - 160, Z0, x + 100, cy + 160, Z0 + 150); a.rect(x - 100, cy - 160, x + 100, cy + 160); a.cyl(x, cy, Z0 + 150, Z1 - 160, 50, 12); }
      a.box(X0 + 40, cy - 60, Z1 - 160, X1 - 40, cy + 60, Z1 - 100);
      const rows = [Z1 - 280, Z1 - 160]; a.xcyl(X0 + 100, X1 - 100, cy - 130, Z1 - 120, 30, 12); for (const x of [X0 + 100, X1 - 100]) a.cyl(x, cy - 130, Z0 + 700, Z1 - 120, 28, 10);
      const n1 = Math.round(v.n / 2); for (let i = 0; i < n1; i++) { const x = X0 + 200 + ((W - 400) * (i + 0.5)) / n1; a.cyl(x, cy - 130, Z1 - 120, Z1 - 70, 14, 6); a.cone(x, cy - 130, Z1 - 70, Z1 - 20, 14, 5, 6); a.circ(x, cy - 130, 14, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 100, X1 - 100]) for (let z = Z0 + 900; z < Z1 - 400; z += 600) { a.xcyl(x - 60 * (x < cx ? -1 : 1), x, cy - 130, z, 10, 6); }
      a.cyl(X0 + 280, cy - 130, Z0, Z0 + 700, 30, 8); a.cyl(X0 + 280, cy - 130, Z0 + 500, Z0 + 640, 55, 10); a.xcyl(X0 + 280, X0 + 280 + 140, cy - 130, Z0 + 700, 10, 6);
      a.box(X1 - 500, cy + 160, Z0 + 500, X1 - 300, cy + 260 > 0 ? 0 : cy + 260, Z0 + 1100);
      a.log('Added the foot blocks, the steel legs and top beam, the spray pipe with its nozzles, the supply riser with valve and gauge and the control box (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine water-truck fill stand',
    desc: (v) => `Fill stand with a ${v.h} ft tall column, an overhead swing arm with a ${v.d} in loading pipe and a drop hose, a gate valve and a hand wheel at the foot, a concrete pad and two bollards.`,
    vs: [['top fill, 15 ft', 96, 96, 192, 0, { h: 15, d: 6 }], ['top fill, 18 ft', 108, 108, 228, 0, { h: 18, d: 8 }], ['top fill, 22 ft, 8 in', 120, 120, 276, 0, { h: 22, d: 8 }], ['bottom fill, ground hydrant', 72, 72, 60, 0, { h: 0, d: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 40);
      for (const [x, y] of [[X0 + 80, YF + 80], [X1 - 80, YF + 80]]) { a.cyl(x, y, Z0 + 40, Z0 + 140 > Z1 ? Z1 : Z0 + 140, 18, 8); a.circ(x, y, 18, 'EQUIP-DETAIL'); }
      if (!v.h) { a.cyl(cx, cy, Z0 + 40, Z1 - 70, 80, 14); a.cyl(cx, cy, Z1 - 70, Z1, 100, 14); a.xcyl(cx - 120, cx + 120, cy, Z1 - 35, 12, 6); a.ycyl(cy, cy - 200, cx, Z0 + 140, 50, 12); a.circ(cx, cy, 80, 'EQUIP-DETAIL'); }
      else { a.cyl(cx, cy, Z0 + 40, Z1 - 260, 90, 16); a.cyl(cx, cy, Z1 - 300, Z1 - 240, 130, 16); a.cone(cx, cy, Z0 + 40, Z0 + 250, 140, 90, 16); a.circ(cx, cy, 140, 'EQUIP-DETAIL'); a.ycyl(cy, cy - 200, cx, Z0 + 340, 50, 12); a.box(cx - 40, cy - 280, Z0 + 330, cx + 40, cy - 200, Z0 + 350); a.ell(cx, cy - 240, Z0 + 340, 50, 50, 50, 10, 5);
        a.tube([[cx, cy, Z1 - 250], [cx, cy, Z1 - 100], [cx - 420, cy, Z1 - 100], [cx - 420, cy, Z1 - 70]], [v.d * 7, v.d * 7, v.d * 7, v.d * 7], 12); a.tube([[cx - 420, cy, Z1 - 70], [cx - 440, cy - 40, Z1 - 220], [cx - 420, cy - 60, Z1 - 330]], [v.d * 6, v.d * 6, v.d * 6], 10); a.ell(cx, cy, Z1 - 100, v.d * 9, v.d * 9, v.d * 9, 10, 6); }
      a.log('Added the concrete pad, the bollards, the ' + (v.h ? 'tall column with its swing arm and drop hose' : 'short hydrant column') + ' and the foot gate valve with hand wheel (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine pond pump barge',
    desc: (v) => `Floating work barge ${v.l} in long on ${v.pt} pontoons with a deck frame, a submerged-intake pump set with a suction hose, a discharge hose reel, a handrail around the deck, two mooring cleats and a lifting eye.`,
    vs: [['2 pontoons, 10 ft', 120, 72, 58, 0, { l: 120, pt: 2 }], ['2 pontoons, 14 ft', 168, 84, 62, 0, { l: 168, pt: 2 }], ['3 pontoons, 18 ft', 216, 108, 66, 0, { l: 216, pt: 3 }], ['4 pontoons, 24 ft', 288, 132, 70, 0, { l: 288, pt: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, pw = (D - 120) / (v.pt + (v.pt - 1) * 0.6); a.outline();
      for (let i = 0; i < v.pt; i++) { const y0 = YF + 60 + i * pw * 1.6, yc = y0 + pw / 2; a.xcyl(X0 + pw * 0.3, X1 - pw * 0.3, yc, Z0 + pw / 2, pw / 2, 18); a.ell(X0 + pw * 0.3, yc, Z0 + pw / 2, pw * 0.3, pw / 2, pw / 2, 10, 6); a.ell(X1 - pw * 0.3, yc, Z0 + pw / 2, pw * 0.3, pw / 2, pw / 2, 10, 6); }
      const dz = Z0 + pw + 60; a.box(X0, YF + 30, dz, X1, YB - 30, dz + 40); for (let x = X0 + 100; x < X1; x += 400) a.box(x, YF + 40, dz - 40, x + 40, YB - 40, dz);
      for (const y of [YF + 40, YB - 40]) { a.xcyl(X0 + 40, X1 - 40, y, Z1 - 100, 14, 8); for (let x = X0 + 40; x < X1; x += 500) a.cyl(x, y, dz + 40, Z1 - 100, 12, 6); } for (const x of [X0 + 40, X1 - 40]) a.ycyl(YF + 40, YB - 40, x, Z1 - 100, 14, 8);
      M.pumpSet(a, X0 + 320, cy, dz + 40, 360); a.tube([[X0 + 180, cy, dz + 100], [X0 + 100, cy, dz], [X0 + 100, cy, Z0 - 0]], [40, 40, 40], 10);
      hoseReel(a, X1 - 250, cy + 100, dz + 240, 190, 180); a.xcyl(X1 - 250 - 200, X1 - 250 + 200, cy + 160 - 120, dz + 40, 6, 6);
      for (const [x, y] of [[X1 - 80, YF + 80], [X1 - 80, YB - 80]]) { a.box(x - 40, y - 15, dz + 40, x + 40, y + 15, dz + 70); }
      a.cyl(cx, cy, dz + 40, Z1 - 80, 14, 8); a.ell(cx, cy, Z1 - 60, 40, 8, 40, 10, 4);
      a.log('Added the pontoons, the deck frame, the pump set and suction hose, the discharge hose reel, the handrail, the cleats and the lifting eye (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic mine duplex dewatering pump station',
    desc: (v) => `Skid-mounted station with two ${v.d} in horizontal pumps and motors side by side, a suction header with two gate valves, a discharge header with check valves and a gate valve each, a pressure gauge on each pump and a control cabinet.`,
    vs: [['4 in pumps', 96, 54, 64, 0, { d: 4 }], ['6 in pumps', 132, 66, 72, 0, { d: 6 }], ['8 in pumps', 168, 78, 82, 0, { d: 8 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, pr = v.d * 14; a.outline(); skid(a, X0, YF, X1, YB, Z0, 100);
      for (const [y, k] of [[YF + D * 0.28, 0], [YF + D * 0.62, 1]]) { M.pumpSet(a, X0 + 380, y, Z0 + 100, 480); a.xcyl(X0 + 650, X0 + 1000, y, Z0 + 300, 80, 16); a.box(X0 + 1000, y - 130, Z0 + 100, X1 - 700, y + 130, Z0 + 440); a.ell(X1 - 800, y, Z0 + 260, 70, 70, 70, 10, 5); a.box(X1 - 800, y - 20, Z0 + 330, X1 - 760, y + 20, Z0 + 380); }
      a.ycyl(YF + 40, YB - 40, X0 + 120, Z0 + 330, pr * 0.5, 16); a.ycyl(YF + 40, YB - 40, X0 + 1100, Z0 + 650, pr * 0.5, 16);
      for (const y of [YF + D * 0.28, YF + D * 0.62]) { a.cyl(X0 + 120, y, Z0 + 330, Z0 + 430, pr * 0.45, 12); a.cyl(X0 + 1100, y, Z0 + 650, Z0 + 770, pr * 0.45, 12); a.circ(X0 + 120, y, pr * 0.45, 'EQUIP-DETAIL'); a.xcyl(X0 + 1060, X0 + 1140, y, Z0 + 800, 8, 6); }
      panel(a, X1 - 360, YB, Z0 + 140, X1 - 40, Z1 - 60, 140);
      a.log('Added the skid, two pump and motor sets, the suction header, the discharge header with check and gate valves, the gauges and the control cabinet (plan and 3D).');
    } }),
  // ===================================================================== AVIATION
  fam({ cat: 'plumbing/equipment', title: 'Generic hangar aircraft wash rack',
    desc: (v) => `Concrete wash pad ${v.w} ft by ${v.l} ft with a sloped slab, a perimeter drain channel under a grate on all four sides, a sump with a cover at one corner, ${v.n} hose reel posts around the edge and a chemical dosing cabinet.`,
    vs: [['40 ft by 40 ft', 480, 480, 40, 0, { w: 40, l: 40, n: 2 }], ['60 ft by 60 ft', 720, 720, 40, 0, { w: 60, l: 60, n: 3 }], ['80 ft by 60 ft', 960, 720, 40, 0, { w: 80, l: 60, n: 4 }], ['120 ft by 100 ft', 1440, 1200, 40, 0, { w: 120, l: 100, n: 6 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 150); const g = 200;
      trenchGrate(a, X0, YF, X1, YF + g, Z0 + 150); trenchGrate(a, X0, YB - g, X1, YB, Z0 + 150); trenchGrate(a, X0, YF + g, X0 + g, YB - g, Z0 + 150); trenchGrate(a, X1 - g, YF + g, X1, YB - g, Z0 + 150);
      a.box(X1 - 700, YB - 700, Z0 + 150, X1 - g - 20, YB - g - 20, Z0 + 190); a.circ(X1 - 450, YB - 450, 120, 'EQUIP-DETAIL'); a.rect(X1 - 700, YB - 700, X1 - g - 20, YB - g - 20, 'EQUIP-DETAIL');
      for (let i = 0; i < v.n; i++) { const t = (i + 0.5) / v.n, x = X0 + g + 400 + (X1 - X0 - 2 * g - 800) * t, y = YF + g + 250; a.cyl(x, y, Z0 + 150, Z0 + 1300, 30, 8); hoseReel(a, x, y + 160, Z0 + 1050, 230, 160); a.circ(x, y, 30, 'EQUIP-DETAIL'); }
      a.box(X0 + g + 60, YB - 500, Z0 + 150, X0 + g + 560, YB - g - 30, Z0 + 1300); a.box(X0 + g + 100, YB - 500 - 12, Z0 + 700, X0 + g + 520, YB - 500, Z0 + 1200); a.rect(X0 + g + 60, YB - 500, X0 + g + 560, YB - g - 30, 'EQUIP-DETAIL');
      a.line(X0 + g, YF + g, X1 - g, YB - g, 'EQUIP-HIDDEN');
      a.log('Added the slab, the grated drain channel on all four sides, the sump with its cover, the hose reel posts and the dosing cabinet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic aircraft lavatory service panel cabinet',
    desc: (v) => `Floor cabinet with a hinged door and a recessed deck holding a ${v.dia} in drain port with a cap, a rinse hose connection, a drain flush valve and a waste tank sight window${v.fw ? ', and a fresh-water fill hose with a reel above' : ''}.`,
    vs: [['drain and rinse', 36, 24, 48, 0, { dia: 4, fw: 0 }], ['drain, rinse and fresh water', 48, 24, 60, 0, { dia: 4, fw: 1 }], ['double, two aircraft positions', 72, 28, 60, 0, { dia: 4, fw: 1, two: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline();
      a.box(X0, YF + 40, Z0, X1, YB, Z0 + 900); a.box(X0 - 0, YF, Z0 + 900, X1, YB, Z0 + 940); a.box(X0 + 30, YF + 60, Z0 + 940, X1 - 30, YB - 30, Z0 + 1000);
      const nn = v.two ? 2 : 1;
      for (let i = 0; i < nn; i++) { const x = X0 + (W / nn) * (i + 0.5), w2 = W / nn; a.box(x - w2 * 0.4, YF + 30, Z0 + 60, x + w2 * 0.4, YF + 42, Z0 + 840); a.box(x + w2 * 0.28, YF + 20, Z0 + 440, x + w2 * 0.34, YF + 30, Z0 + 560); a.box(x - w2 * 0.2, YF + 32, Z0 + 600, x + w2 * 0.2, YF + 42, Z0 + 780);
        a.cyl(x - w2 * 0.2, YF + 130, Z0 + 940, Z0 + 1100, v.dia * 8, 14); a.cyl(x - w2 * 0.2, YF + 130, Z0 + 1100, Z0 + 1130, v.dia * 11, 14); a.circ(x - w2 * 0.2, YF + 130, v.dia * 11, 'EQUIP-DETAIL');
        a.cyl(x + w2 * 0.05, YF + 200, Z0 + 940, Z0 + 1180, 14, 8); a.xcyl(x + w2 * 0.05, x + w2 * 0.15, YF + 200, Z0 + 1180, 14, 8); a.cyl(x + w2 * 0.15, YF + 200, Z0 + 1100, Z0 + 1180, 14, 8); a.xcyl(x + w2 * 0.05 - 60, x + w2 * 0.05 + 60, YF + 200, Z0 + 1260, 7, 6); a.cyl(x + w2 * 0.05, YF + 200, Z0 + 1180, Z0 + 1260, 10, 6); }
      a.box(X0, YB - 40, Z0 + 940, X1, YB, Z1);
      if (v.fw) hoseReel(a, cx + W * 0.2, YB - 40, Z1 - 200, 190, 130);
      a.log('Added the cabinet and hinged door, the recessed deck, the capped drain port, the rinse connection, the flush valve and sight window' + (v.fw ? ', the back panel and the fresh-water hose reel' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic aircraft potable water service cart',
    desc: (v) => `Wheeled service cart with a ${v.gal} gal tank on a frame, a pump and engine at the rear, a hose reel with a fill coupling, a push handle, two large wheels, a front castor and a fill cap on top.`,
    vs: [['50 gal', 48, 28, 48, 0, { gal: 50, r: 11 }], ['100 gal', 60, 30, 52, 0, { gal: 100, r: 13 }], ['200 gal', 78, 34, 56, 0, { gal: 200, r: 15 }], ['300 gal, two-axle', 96, 38, 60, 0, { gal: 300, r: 17 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = v.r * I; a.outline('EQUIP-HIDDEN');
      a.box(X0 + 120, YF + 40, Z0 + 200, X1 - 60, YB - 40, Z0 + 240); hTank(a, X0 + 220, X1 - 600, cy, Z0 + 240 + r + 30, Math.min(r, D / 2 - 60)); a.cyl(cx - 100, cy, Z0 + 240 + 2 * Math.min(r, D / 2 - 60) + 20, Z0 + 240 + 2 * Math.min(r, D / 2 - 60) + 60, 60, 12);
      a.box(X1 - 560, YF + 60, Z0 + 240, X1 - 80, YB - 60, Z0 + 640); a.box(X1 - 540, YF + 80, Z0 + 640, X1 - 100, YB - 80, Z0 + 700); a.cyl(X1 - 200, YB - 100, Z0 + 700, Z0 + 840, 24, 8);
      hoseReel(a, cx - W * 0.1, YB - 30, Z0 + 520, 180, Math.min(160, D - 80));
      for (const y of [YF + 20, YB - 20]) { a.ycyl(y - 25, y + 25, X1 - 400, Z0 + 230, 230, 18); if (v.gal > 250) a.ycyl(y - 25, y + 25, X1 - 800, Z0 + 230, 230, 18); }
      a.ycyl(cy - 25, cy + 25, X0 + 100, Z0 + 80, 80, 12);
      a.tube([[X0 + 120, YF + 80, Z0 + 240], [X0 + 20, YF + 80, Z0 + 700], [X0 + 20, YB - 80, Z0 + 700], [X0 + 120, YB - 80, Z0 + 240]], [14, 14, 14, 14], 8);
      a.rect(X0 + 120, YF + 40, X1 - 60, YB - 40, 'EQUIP-DETAIL');
      a.log('Added the frame, the tank with its fill cap, the pump and engine, the hose reel, the handle, the large wheels and the front castor (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic de-icing fluid supply tank skid',
    desc: (v) => `Horizontal ${v.gal} gal fluid tank on a bunded skid with a roof hatch, a fill connection and a vent at the top, a transfer pump and motor, a metered delivery line to a hose reel, a heater box and a level gauge on the end.`,
    vs: [['1,000 gal', 120, 54, 80, 0, { gal: '1,000' }], ['2,000 gal', 168, 66, 90, 0, { gal: '2,000' }], ['5,000 gal', 216, 84, 108, 0, { gal: '5,000' }], ['6,000 gal', 252, 90, 112, 0, { gal: '6,000' }], ['8,000 gal', 300, 96, 118, 0, { gal: '8,000' }], ['10,000 gal', 336, 102, 124, 0, { gal: '10,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, wall = 140; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0, YF, Z0 + 60, X1, YF + 40, Z0 + wall + 60); a.box(X0, YB - 40, Z0 + 60, X1, YB, Z0 + wall + 60); a.box(X0, YF, Z0 + 60, X0 + 40, YB, Z0 + wall + 60); a.box(X1 - 40, YF, Z0 + 60, X1, YB, Z0 + wall + 60);
      const r = Math.min((D - 400) / 2, (Z1 - Z0 - 500) / 2), tz = Z0 + wall + 160 + r; hTank(a, X0 + 100, X1 - 700, cy, tz, r);
      for (const x of [X0 + 250, X1 - 950]) a.box(x, cy - r * 0.8, Z0 + wall, x + 60, cy + r * 0.8, tz - r * 0.5);
      a.cyl(cx - 400, cy, tz + r, tz + r + 70, 90, 12); a.cyl(cx + 200, cy, tz + r, tz + r + 90, 28, 8); a.cone(cx + 200, cy, tz + r + 90, tz + r + 130, 28, 40, 8);
      a.circ(cx - 400, cy, 90, 'EQUIP-DETAIL'); a.ycyl(cy - r, cy - r - 60, X0 + 500, tz, 40, 10);
      M.pumpSet(a, X1 - 460, cy - 60, Z0 + 60, 420); a.box(X1 - 220, cy + 80, Z0 + 60, X1 - 60, cy + 420, Z0 + 700); a.rect(X1 - 220, cy + 80, X1 - 60, cy + 420, 'EQUIP-DETAIL');
      hoseReel(a, X1 - 460, YB - 80, Z0 + 700, 210, 150);
      a.tube([[X1 - 460, cy - 60, Z0 + 300], [X1 - 460, cy - 60, Z0 + 460], [X1 - 700, cy - 60, Z0 + 460], [X1 - 700, cy, tz]], [28, 28, 28, 28], 8);
      a.box(X1 - 60, cy - 60, tz - 200, X1, cy + 60, tz + 200); a.cyl(X0 + 30, cy, Z0 + wall + 10, Z0 + wall + 80, 20, 6);
      a.log('Added the skid with its bund walls, the horizontal tank with hatch, fill and vent, the transfer pump, the heater box, the hose reel with delivery line and the level gauge (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hangar trench drain',
    desc: (v) => `Channel drain ${v.l} ft long and ${v.wd} in wide set in the floor with a slotted cover in sections, a steel edge rail on both sides, a sump box with a cover at one end and an outlet pipe.`,
    vs: [['10 ft long, 12 in wide', 120, 12, 6, 0, { l: 10, wd: 12 }], ['20 ft long, 12 in wide', 240, 12, 6, 0, { l: 20, wd: 12 }], ['40 ft long, 12 in wide', 480, 12, 6, 0, { l: 40, wd: 12 }], ['40 ft long, 18 in wide', 480, 18, 8, 0, { l: 40, wd: 18 }], ['80 ft long, 18 in wide', 960, 18, 8, 0, { l: 80, wd: 18 }], ['60 ft long, 12 in wide', 720, 12, 6, 0, { l: 60, wd: 12 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0, YF, Z0, X1, YF + 14, Z1 - 20); a.box(X0, YB - 14, Z0, X1, YB, Z1 - 20);
      const sw = Math.min(900, (X1 - X0) / 3); for (let x = X0 + 150; x < X1 - 300; x += 900) a.box(x, YF + 14, Z1 - 60, x + 60, YB - 14, Z1 - 20);
      a.box(X1 - 600, YF - 0, Z0, X1, YB, Z0 + 140 > Z1 ? Z1 - 20 : Z0 + 140);
      trenchGrate(a, X0 + 10, YF + 14, X1 - 600, YB - 14, Z1); for (let x = X0; x <= X1 - 600; x += 900) a.line(x, YF, x, YB, 'EQUIP-DETAIL');
      a.box(X1 - 600, YF, Z0, X1, YB, Z1 - 10); a.rect(X1 - 600, YF, X1, YB, 'EQUIP-DETAIL'); a.circ(X1 - 300, cy, 40, 'EQUIP-DETAIL'); a.cyl(X1 - 300, cy, Z0, Z1, 40, 8);
      a.log('Added the channel body, the edge rails, the slotted cover sections, the sump box with its cover and the outlet (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hangar hose reel station',
    desc: (v) => `${v.kind === 'wall' ? 'Wall-mounted' : v.kind === 'pedestal' ? 'Pedestal-mounted' : v.kind === 'cabinet' ? 'Enclosed cabinet' : 'Wall-mounted twin'} hose reel station with ${v.kind === 'twin' ? 'two reels' : 'a reel'} holding ${v.len} ft of ${v.sz} in hose, a supply valve, a guide arm and a nozzle on a bracket.`,
    vs: [['wall, 50 ft', 24, 18, 26, 36, { kind: 'wall', len: 50, sz: 0.5 }], ['wall, 100 ft', 30, 20, 32, 36, { kind: 'wall', len: 100, sz: 0.75 }], ['pedestal, 100 ft', 28, 28, 52, 0, { kind: 'pedestal', len: 100, sz: 0.75 }], ['pedestal, 150 ft', 32, 32, 56, 0, { kind: 'pedestal', len: 150, sz: 1 }], ['cabinet, 75 ft', 30, 18, 34, 36, { kind: 'cabinet', len: 75, sz: 0.5 }], ['twin wall, 100 ft each', 54, 20, 32, 36, { kind: 'twin', len: 100, sz: 0.75 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a; a.outline();
      const one = (x, y, z, rr, ln) => { hoseReel(a, x, y, z, rr, ln); a.cyl(x - rr * 1.1, y - ln / 2, z - 40, z + 40, 16, 8); };
      if (v.kind === 'pedestal') { a.cyl(cx, cy, Z0, Z0 + 30, 250, 20); a.cyl(cx, cy, Z0 + 30, Z0 + 700, 60, 12); a.box(cx - 100, cy - 100, Z0 + 700, cx + 100, cy + 100, Z0 + 760); a.circ(cx, cy, 250, 'EQUIP-DETAIL'); hoseReel(a, cx, cy + 100, Z0 + 1000, 280, 200); a.tube([[cx + 280, cy - 100, Z0 + 1000], [cx + 330, cy - 200, Z0 + 700], [cx + 330, cy - 200, Z0 + 550]], [10, 10, 10], 6); }
      else if (v.kind === 'cabinet') { a.box(X0, YB - 30, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YF + 20, 40); a.box(X0, YF + 20, Z0, X0 + 20, YB - 30, Z1); a.box(X1 - 20, YF + 20, Z0, X1, YB - 30, Z1); a.box(X0, YF + 20, Z0, X1, YB - 30, Z0 + 20); a.box(X0, YF + 20, Z1 - 20, X1, YB - 30, Z1); hoseReel(a, cx, YB - 40, (Z0 + Z1) / 2, Math.min(W * 0.3, 250), 200); }
      else { a.box(X0, YB - 20, Z0, X1, YB, Z1); const k = v.kind === 'twin' ? 2 : 1; for (let i = 0; i < k; i++) { const x = X0 + (W / k) * (i + 0.5), rr = Math.min(W / k * 0.4, 300); hoseReel(a, x, YB - 20, Z0 + (Z1 - Z0) * 0.55, rr, 200); a.box(x - 60, YB - 90, Z0 + 40, x + 60, YB - 20, Z0 + 140); a.cyl(x + rr, YF + 130, Z0 + 40, Z0 + 140, 16, 6); } }
      a.log('Added the mounting, the hose reel with its hose, the guide arm, the supply valve and the nozzle bracket (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic aircraft lavatory waste dump station pit',
    desc: (v) => `In-ground ${v.w} in square pit with a hinged steel lid, a cleanout hatch, a rinse hose bib on a post, a drain connector with a flap, a flushing hose with a spray nozzle and a bollard at each corner${v.hd ? ' and a lamp head on a post' : ''}.`,
    vs: [['36 in', 36, 36, 36, 0, { w: 36, hd: 0 }], ['48 in', 48, 48, 40, 0, { w: 48, hd: 0 }], ['48 in, with lamp post', 48, 48, 80, 0, { w: 48, hd: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, ph = 140; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 20);
      a.box(X0, YF, Z0, X1, YF + 30, Z0 + ph); a.box(X0, YB - 30, Z0, X1, YB, Z0 + ph); a.box(X0, YF, Z0, X0 + 30, YB, Z0 + ph); a.box(X1 - 30, YF, Z0, X1, YB, Z0 + ph);
      a.box(X0 + 30, YF + 30, Z0 + ph - 20, cx - 20, YB - 30, Z0 + ph); a.box(cx + 20, YF + 30, Z0 + ph - 20, X1 - 30, YB - 30, Z0 + ph); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL'); a.line(cx, YF + 30, cx, YB - 30, 'EQUIP-DETAIL');
      a.circ(cx - 200, cy, 60, 'EQUIP-DETAIL'); a.cyl(cx - 200, cy, Z0 + ph, Z0 + ph + 40, 60, 12); a.xcyl(cx + 30, cx + 140, cy, Z0 + ph + 30, 8, 6);
      a.cyl(X1 - 120, YB - 120, Z0 + ph, Z0 + ph + 500, 24, 8); a.ycyl(YB - 120, YB - 220, X1 - 120, Z0 + ph + 440, 14, 8); a.tube([[X1 - 120, YB - 220, Z0 + ph + 440], [X1 - 200, YB - 300, Z0 + ph + 200], [cx, cy, Z0 + ph + 20]], [8, 8, 8], 6); a.cone(cx, cy, Z0 + ph + 20, Z0 + ph + 70, 12, 8, 6);
      for (const x of [X0 + 50, X1 - 50]) { a.cyl(x, YF + 50, Z0 + ph, Z0 + ph + 330 > Z1 ? Z1 : Z0 + ph + 330, 22, 8); a.circ(x, YF + 50, 22, 'EQUIP-DETAIL'); }
      if (v.hd) { a.cyl(X0 + 120, YB - 100, Z0 + ph, Z1 - 100, 25, 8); a.ell(X0 + 120, YB - 100, Z1 - 60, 80, 60, 40, 10, 5); }
      a.log('Added the curb, the hinged lid in two leaves, the cleanout hatch, the rinse bib on its post, the flushing hose and nozzle and the corner bollards (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hangar oil-water separator',
    desc: (v) => `Horizontal steel separator rated ${v.gpm} gpm lying on saddles with a hatch and riser for the inlet chamber, a hatch on the oil chamber, an outlet chamber with a sample port, two ladder rungs at each riser and an oil outlet pipe.`,
    vs: [['25 gpm', 96, 40, 52, 0, { gpm: 25 }], ['100 gpm', 144, 52, 64, 0, { gpm: 100 }], ['250 gpm', 204, 66, 78, 0, { gpm: 250 }], ['500 gpm', 264, 84, 96, 0, { gpm: 500 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W, D } = a, r = D / 2 - 40, zc = Z0 + 90 + r; a.outline('EQUIP-HIDDEN');
      for (const x of [X0 + W * 0.2, X1 - W * 0.2]) a.box(x - 60, cy - r * 0.8, Z0, x + 60, cy + r * 0.8, zc - r * 0.5);
      hTank(a, X0 + 20, X1 - 20, cy, zc, r); a.line(X0 + 20, cy - r, X1 - 20, cy - r); a.line(X0 + 20, cy + r, X1 - 20, cy + r);
      for (const [f, rr] of [[0.2, 190], [0.5, 190], [0.82, 150]]) { const x = X0 + W * f; a.cyl(x, cy, zc + r - 20, Z1 - 60, rr, 16); a.cyl(x, cy, Z1 - 60, Z1, rr + 25, 16); a.circ(x, cy, rr + 25, 'EQUIP-DETAIL'); a.xcyl(x - 25, x + 25, cy, Z0 + 600, 2, 3); for (let z = zc + r; z < Z1 - 100; z += 150) a.xcyl(x - rr - 10, x - rr + 40, cy, z, 5, 4); }
      a.line(X0 + W * 0.35, cy - r, X0 + W * 0.35, cy + r, 'EQUIP-HIDDEN'); a.line(X0 + W * 0.68, cy - r, X0 + W * 0.68, cy + r, 'EQUIP-HIDDEN');
      a.xcyl(X0 - 0, X0 + 60, cy, zc + r * 0.3, 36, 10); a.xcyl(X1 - 60, X1, cy, zc - r * 0.3, 36, 10); a.cyl(X0 + W * 0.82 + 220, cy, zc + r * 0.2, zc + r * 0.9, 14, 6);
      a.log('Added the cylindrical shell on saddles, three risers with covers and ladder rungs, the inlet and outlet connections, the chamber baffles (dashed) and the sample port (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hangar service sink',
    desc: (v) => `Floor-set ${v.kind === 'mop' ? 'mop service basin with a rolled rim, a wall faucet with a vacuum breaker, a hose hook and a mop hanger rail' : v.kind === 'utility' ? 'deep utility sink on legs with a back splash, a swing spout, a drainboard and a lower shelf' : 'two-compartment sink with a high splash, a swing spout, a drainboard at each end and a lower shelf'}.`,
    vs: [['mop basin, 24 in', 24, 24, 48, 0, { kind: 'mop' }], ['mop basin, 36 in', 36, 24, 48, 0, { kind: 'mop' }], ['utility, 30 in', 30, 24, 46, 0, { kind: 'utility' }], ['two compartments, 60 in', 60, 26, 46, 0, { kind: 'two' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      if (v.kind === 'mop') { a.box(X0, YF, Z0, X1, YB, Z0 + 250); a.box(X0 + 40, YF + 40, Z0 + 250, X1 - 40, YB - 20, Z0 + 270); a.box(X0, YF, Z0 + 250, X1, YF + 40, Z0 + 300); a.box(X0, YB - 20, Z0 + 250, X1, YB, Z0 + 300); a.box(X0, YF, Z0 + 250, X0 + 40, YB, Z0 + 300); a.box(X1 - 40, YF, Z0 + 250, X1, YB, Z0 + 300); a.cyl(cx, YF + 280, Z0 + 270, Z0 + 275, 40, 10); a.circ(cx, (YF + YB) / 2, 50, 'EQUIP-DETAIL'); a.box(X0, YB - 30, Z0 + 300, X1, YB, Z0 + 1000); a.cyl(cx, YB - 50, Z0 + 950, Z0 + 1010, 14, 8); a.ycyl(YB - 140, YB - 30, cx, Z0 + 950, 14, 8); a.ycyl(YB - 140, YB - 130, cx, Z0 + 950, 22, 8); lever(a, cx, YB - 100, Z0 + 1060, 120); a.xcyl(X0 + 60, X1 - 60, YB - 40, Z0 + 1150, 7, 6); for (let x = X0 + 100; x < X1 - 80; x += 160) a.box(x, YB - 70, Z0 + 1130, x + 24, YB - 40, Z0 + 1180); a.box(X1 - 100, YB - 60, Z0 + 1000, X1 - 80, YB - 30, Z1 - 20); a.box(X0, YB - 14, Z0 + 1000, X1, YB, Z1); }
      else { const n = v.kind === 'two' ? 2 : 1, top = Z0 + 34 * I, bw = (W - (v.kind === 'two' ? 700 : 450)) / n; a.box(X0, YB - 60, top, X1, YB, Z1 - 200);
        for (let i = 0; i < n; i++) { const x0 = X0 + 330 * (v.kind === 'two' ? 1 : 0) + 0 + i * bw; basin(a, v.kind === 'two' ? X0 + 350 + i * bw : X0 + 20, YF + 40, v.kind === 'two' ? X0 + 350 + (i + 1) * bw - 20 : X0 + bw + 20, YB - 120, top, 380, 10); }
        if (v.kind === 'two') { a.box(X0, YF, top - 30, X0 + 330, YB - 60, top); a.box(X1 - 330, YF, top - 30, X1, YB - 60, top); for (let x = X0 + 20; x < X0 + 310; x += 50) a.box(x, YF + 20, top, x + 20, YB - 80, top + 12); for (let x = X1 - 310; x < X1 - 20; x += 50) a.box(x, YF + 20, top, x + 20, YB - 80, top + 12); }
        else { a.box(X0 + bw + 20, YF, top - 30, X1, YB - 60, top); for (let x = X0 + bw + 50; x < X1 - 20; x += 50) a.box(x, YF + 20, top, x + 20, YB - 80, top + 12); }
        a.box(X0, YF, top - 30, X0 + 20, YB - 60, top); a.box(X0, YF + 0, top - 400, X1, YF + 30, top - 380);
        legs(a, [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 110], [X1 - 40, YB - 110]], Z0, top - 30, 22); a.box(X0 + 40, YF + 40, Z0 + 200, X1 - 40, YB - 110, Z0 + 220);
        spout(a, v.kind === 'two' ? X0 + 350 + bw / 2 : X0 + bw / 2, YB - 80, top, 350, 220, 13); }
      a.log('Added the basin, the splash, the faucet or spout' + (v.kind === 'mop' ? ', the hose hook and the mop hanger rail' : ', the drainboards, the legs and the lower shelf') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic apron water hydrant pit',
    desc: (v) => `Ground pit ${v.w} in across with a hinged cast cover, a ${v.d} in riser inside with a valve and a quick coupling, a drain below and a hose bib on the kerb. Mounted flush with the apron.`,
    vs: [['24 in, 2 in riser', 24, 24, 12, 0, { w: 24, d: 2 }], ['36 in, 3 in riser', 36, 36, 16, 0, { w: 36, d: 3 }], ['48 in, 4 in riser, with hose bib', 48, 48, 20, 0, { w: 48, d: 4 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a, ph = (Z1 - Z0) - 30; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(X0, YF, Z0, X1, YF + 40, Z1 - 20); a.box(X0, YB - 40, Z0, X1, YB, Z1 - 20); a.box(X0, YF, Z0, X0 + 40, YB, Z1 - 20); a.box(X1 - 40, YF, Z0, X1, YB, Z1 - 20);
      a.box(X0 + 40, YF + 40, Z1 - 20, X1 - 40, YB - 40, Z1); a.box(X0 + 40, YF + 40, Z1 - 20, cx, YB - 40, Z1); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0 + 20, Z1 - 120, v.d * 9, 14); a.cyl(cx, cy, Z1 - 180, Z1 - 60, v.d * 13, 14); a.xcyl(cx - 70, cx + 70, cy, Z1 - 20, 6, 6); a.xcyl(cx + v.d * 9, cx + v.d * 9 + 100, cy, Z0 + 100, v.d * 8, 10);
      a.circ(cx, cy, v.d * 13, 'EQUIP-DETAIL'); a.cyl(X0 + 100, YB - 100, Z0 + 20, Z0 + 60, 24, 8);
      a.log('Added the pit walls, the hinged cover, the riser with valve and quick coupling and the drain (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/fixtures', title: 'Generic hangar parts-wash sink',
    desc: (v) => `Stainless parts-wash sink ${v.w} in wide with a deep tray, a perforated work grate, a flexible spout on a swivel pipe, a foot pedal, a back splash, a drum-ready lower shelf and four legs with adjustable feet${v.lid ? ', and a hinged solvent lid' : ''}.`,
    vs: [['36 in', 36, 28, 48, 0, { w: 36, lid: 0 }], ['48 in', 48, 28, 48, 0, { w: 48, lid: 0 }], ['48 in, with lid', 48, 30, 54, 0, { w: 48, lid: 1 }], ['60 in, with lid', 60, 32, 54, 0, { w: 60, lid: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a, top = Z0 + 34 * I; a.outline();
      basin(a, X0 + 20, YF + 20, X1 - 20, YB - 120, top, 260, 12); a.box(X0, YF, top - 30, X1, YB, top); a.box(X0 + 40, YF + 40, top - 100, X1 - 40, YB - 140, top - 90); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 140, 'EQUIP-DETAIL'); for (let x = X0 + 60; x < X1 - 60; x += 40) a.line(x, YF + 40, x, YB - 140, 'EQUIP-DETAIL');
      a.box(X0, YB - 50, top, X1, YB, Z1 - (v.lid ? 0 : 0) - 0 - (v.lid ? 0 : 0)); a.tube([[cx + 80, YB - 100, top], [cx + 80, YB - 100, top + 300], [cx - 100, YB - 250, top + 360], [cx - 200, YB - 400, top + 300]], [14, 14, 10, 8], 8);
      legs(a, [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]], Z0, top - 30, 22); a.box(X0 + 40, YF + 40, Z0 + 200, X1 - 40, YB - 40, Z0 + 220);
      a.box(cx - 80, YF - 0, Z0 + 20, cx + 80, YF + 150, Z0 + 50); a.box(cx - 12, YF + 150, Z0 + 20, cx + 12, YF + 180, Z0 + 500);
      if (v.lid) { a.box(X0, YB - 130, top, X1, YB - 100, top + 260); a.box(X0 + 20, YB - 130, top + 260, X1 - 20, YB - 100, top + 330); a.box(X0 + 80, YF + 20, top + 20, X1 - 80, YF + 40, top + 40); }
      a.log('Added the deep tray, the work grate, the swivel spout, the foot pedal, the splash, the lower shelf and the legs' + (v.lid ? ', and the hinged lid' : '') + ' (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic hangar overhead air and water drop',
    desc: (v) => `Ceiling-hung drop with a ${v.h} in reel box on a pipe column: a compressed-air hose reel and a water hose reel side by side, a regulator and a gauge, a ball valve for each line, a coiled lead, a ceiling plate and a drip pan under the water reel.`,
    vs: [['10 ft drop', 36, 24, 120, 0, { h: 120 }], ['14 ft drop', 36, 24, 168, 0, { h: 168 }], ['18 ft drop', 36, 24, 216, 0, { h: 216 }], ['24 ft drop, with third reel', 54, 24, 288, 0, { h: 288, three: 1 }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline('EQUIP-HIDDEN'); a.box(X0 + 50, YF + 50, Z1 - 20, X1 - 50, YB - 50, Z1);
      a.cyl(cx, cy, Z0 + 1500, Z1 - 20, 40, 10); a.cyl(cx, cy, Z1 - 120, Z1 - 20, 80, 12);
      const k = v.three ? 3 : 2, zc = Z0 + 1050; a.box(cx - W / 2 + 60, cy - 200, Z0 + 1400, cx + W / 2 - 60, cy + 200, Z0 + 1480);
      for (let i = 0; i < k; i++) { const x = cx - W / 2 + 60 + ((W - 120) * (i + 0.5)) / k, rr = Math.min(260, ((W - 120) / k) * 0.42); a.ycyl(cy - 180, cy + 180, x, zc, rr, 20); a.ycyl(cy - 180, cy - 160, x, zc, rr * 1.15, 20); a.ycyl(cy + 160, cy + 180, x, zc, rr * 1.15, 20); a.ycyl(cy - 160, cy - 20, x, zc, rr * 0.5, 12); a.circ(x, cy, rr * 1.15, 'EQUIP-DETAIL'); a.cyl(x, cy, zc + rr, Z0 + 1400, 14, 8); a.box(x - rr * 0.6, cy - 160, Z0 + 100, x + rr * 0.6, cy + 160, Z0 + 125); a.tube([[x + rr * 0.4, cy - 170, zc - rr], [x + rr * 0.5, cy - 190, Z0 + 300], [x + rr * 0.3, cy - 150, Z0 + 140]], [8, 8, 8], 6); }
      a.ycyl(cy - 200, cy - 150, cx, zc + 380, 26, 10); a.ell(cx, cy - 200, zc + 380, 30, 14, 30, 10, 5);
      a.log('Added the ceiling plate, the pipe column, the reel box with its hose reels, the regulator and gauge, the valves and the drip pan (plan and 3D).');
    } }),
  fam({ cat: 'plumbing/equipment', title: 'Generic aircraft wash-water recycling skid',
    desc: (v) => `Skid with a settling tank, a filter vessel ${v.f}, a transfer pump, a clean-water holding tank, a pressure washer pump with a hose reel, interconnecting pipes with valves and a control cabinet.`,
    vs: [['1 filter, 500 gal', 120, 54, 84, 0, { f: 1, gal: 500 }], ['2 filters, 1,000 gal', 168, 60, 88, 0, { f: 2, gal: '1,000' }], ['2 filters, 2,000 gal', 216, 66, 96, 0, { f: 2, gal: '2,000' }], ['3 filters, 3,000 gal', 264, 72, 104, 0, { f: 3, gal: '3,000' }]],
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W, D } = a; a.outline(); skid(a, X0, YF, X1, YB, Z0, 100);
      const tr = (D - 300) / 2.3; M.tank(a, X0 + tr + 80, YB - tr - 80, Z0 + 100, Z1 - 150, tr); M.tank(a, X0 + tr * 3 + 160, YB - tr - 80, Z0 + 100, Z1 - 250, tr * 0.9);
      for (let i = 0; i < v.f; i++) { const x = X0 + tr * 4.6 + 300 + i * 360; M.tank(a, x, YB - 200, Z0 + 100, Z0 + 1300, 140); a.cyl(x, YB - 200, Z0 + 1300, Z0 + 1360, 40, 8); a.ell(x, YB - 200, Z0 + 700, 150, 150, 8, 12, 3); }
      M.pumpSet(a, X1 - 700, YF + 200, Z0 + 100, 420); M.pumpSet(a, X1 - 1250, YF + 200, Z0 + 100, 420);
      a.xcyl(X0 + 200, X1 - 300, YF + 400, Z0 + 500, 24, 10); a.xcyl(X0 + 200, X1 - 300, YF + 400, Z0 + 800, 24, 10); for (let x = X0 + 600; x < X1 - 500; x += 900) a.cyl(x, YF + 400, Z0 + 500, Z0 + 800, 24, 8);
      hoseReel(a, X1 - 320, YF + 100, Z0 + 600, 220, 150); panel(a, X1 - 360, YB, Z0 + 140, X1 - 40, Z1 - 120, 130);
      a.log('Added the skid, the settling tank, the clean-water tank, the filter vessels, the pumps, the connecting pipes with valves, the hose reel and the control cabinet (plan and 3D).');
    } }),
];
