/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, electrical: hospital, construction-site, mine and airfield/hangar lighting, power and low-voltage devices. Original geometry; sizes are generic. */
import { fam, cab, tbl, pull, T, GAP, leaves, F, FU, M, S, C, O, A } from './r4-kit.mjs';

const IN = 25.4;
const m = Math;

/** a thin ring (a closed loop of tube) at height z */
function ring(a, cx, cy, z, r, t = 3, n = 28) {
  const pts = []; for (let i = 0; i <= n; i++) { const g = (i / n) * m.PI * 2; pts.push([cx + m.cos(g) * r, cy + m.sin(g) * r, z]); }
  a.tube(pts, pts.map(() => t), 5);
}
/** a row of small round dots on a circle (lens dots, bolts) */
function dots(a, cx, cy, z0, z1, R, n, r, seg = 6) { for (let i = 0; i < n; i++) { const g = (i / n) * m.PI * 2; a.cyl(cx + m.cos(g) * R, cy + m.sin(g) * R, z0, z1, r, seg); } }
/** a duplex receptacle face on the −Y side: plate + two round sockets */
function rcpt(a, x, z, w = 70, h = 115, y = a.YF) {
  a.box(x - w / 2, y, z - h / 2, x + w / 2, y + 8, z + h / 2);
  for (const dz of [-h * 0.22, h * 0.22]) { a.ycyl(y - 3, y + 8, x, z + dz, w * 0.27, 12); }
  a.rect(x - w / 2, y, x + w / 2, y + 8, 'EQUIP-DETAIL');
}
/** a push button / lamp lens on the −Y face */
const lamp = (a, x, z, r, y = a.YF, t = 10) => { a.ycyl(y, y + t, x, z, r, 14); a.circ(x, y + t / 2, r, 'EQUIP-DETAIL'); };
/** a rectangular window / display on the −Y face */
const win = (a, x0, z0, x1, z1, y = a.YF, t = 6) => { a.box(x0, y, z0, x1, y + t, z1); a.rect(x0, y, x1, y + t, 'EQUIP-DETAIL'); };
/** a swing door seen from the front: a door leaf in front of a body, a handle, a hinge side and its swing arc */
function doorFront(a, x0, z0, x1, z1, hingeRight = false, t = 20) {
  a.box(x0, a.YF, z0, x1, a.YF + t, z1); a.rect(x0, a.YF, x1, a.YF + t, 'EQUIP-DETAIL');
  const hx = hingeRight ? x1 : x0, gx = hingeRight ? x0 + 70 : x1 - 70, zc = (z0 + z1) / 2;
  a.box(gx - 12, a.YF - 24, zc - 90, gx + 12, a.YF, zc + 90);
  a.arc(hx, a.YF, x1 - x0, hingeRight ? 180 : 270, hingeRight ? 270 : 360);
}
/** five-spoke caster star */
function star(a, cx, cy, z, R, n = 5, t = 20, ch = 70) {
  for (let i = 0; i < n; i++) {
    const g = (i / n) * m.PI * 2 + 0.3, x = cx + m.cos(g) * (R - 30), y = cy + m.sin(g) * (R - 30);
    a.tube([[cx, cy, z], [x, y, z]], [t, t], 8); a.caster(x, y, ch); a.line(cx, cy, x, y);
  }
}
/** round plan outline with rings (for pole-mounted things) */
const cplan = (a, r) => { a.circ(a.cx, a.cy, r); a.circ(a.cx, a.cy, r * 0.6, 'EQUIP-DETAIL'); };

const FAMS = [
  // ===================================================== hospitals: lights, headwalls, columns =====================================================
  fam({ cat: 'electrical/fixtures', title: 'Generic operating room ceiling surgical light',
    desc: (v) => `Ceiling-mounted operating room light on a ceiling plate and a column with a horizontal arm, carrying ${v.heads.length} round lamp head${v.heads.length > 1 ? 's' : ''} (${v.heads.join(' and ')} in across), each with a rim ring, a ring of lens dots and a centre handle.`,
    vs: [[22], [26], [30], [22, 22], [26, 22], [30, 26]].map((hd) => [hd.length === 1 ? `single head, ${hd[0]} in` : `two heads, ${hd[0]} and ${hd[1]} in`, hd.length === 1 ? hd[0] + 40 : hd[0] + hd[1] + 10, m.max(...hd) + 2, 64, 56, { heads: hd }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cy } = a, r = v.heads.map((h) => h * IN / 2);
      const hub = v.heads.length === 1 ? X0 + 200 : a.cx, xs = v.heads.length === 1 ? [X1 - r[0] - 10] : [X0 + r[0] + 10, X1 - r[1] - 10];
      a.outline(); a.circ(hub, cy, 150); a.line(hub, cy, xs[0], cy);
      a.cyl(hub, cy, Z1 - 30, Z1, 150, 22); a.cyl(hub, cy, Z1 - 330, Z1 - 30, 55, 14); a.cyl(hub, cy, Z1 - 400, Z1 - 330, 85, 14);
      const za = Z1 - 360, lo = m.min(hub, ...xs), hi = m.max(hub, ...xs);
      a.box(lo, cy - 38, za - 32, hi, cy + 38, za + 32);
      xs.forEach((x, i) => {
        a.circ(x, cy, r[i]); a.circ(x, cy, r[i] * 0.6, 'EQUIP-DETAIL');
        a.cone(x, cy, Z0 + 30, Z0 + 150, r[i] * 0.97, r[i] * 0.88, 30); a.cone(x, cy, Z0 + 150, Z0 + 190, r[i] * 0.88, r[i] * 0.45, 24);
        a.cyl(x, cy, Z0 + 190, za - 32, 30, 10); a.cyl(x, cy, Z0, Z0 + 32, 26, 10); ring(a, x, cy, Z0 + 34, r[i] * 0.96, 5);
        dots(a, x, cy, Z0 + 22, Z0 + 36, r[i] * 0.78, 18, 14); dots(a, x, cy, Z0 + 22, Z0 + 36, r[i] * 0.45, 10, 14);
      });
      a.log('Added the ceiling plate, column, horizontal arm, lamp head(s) with rim rings, lens dots and centre handles (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic examination lamp on floor stand',
    desc: (v) => `Examination lamp on a five-spoke caster base with a column and a bent gooseneck to a ${v.dia} in lamp head with a lens ring${v.twin ? ', plus a second gooseneck and head on the opposite side' : ''}.`,
    vs: [['one head, 8 in, exam room', 8, false], ['one head, 10 in, exam room', 10, false], ['one head, 12 in, treatment room', 12, false], ['two heads, 10 in, treatment room', 10, true]]
      .map(([l, dia, twin]) => [l, 28, 28, twin ? 74 : 68, 0, { dia, twin }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, R = a.W / 2, r = v.dia * IN / 2, dx = R - r - 15;
      a.circ(cx, cy, R, 'EQUIP-HIDDEN'); star(a, cx, cy, Z0 + 75, R); a.circ(cx, cy, 45);
      a.cone(cx, cy, Z0 + 60, Z0 + 140, 70, 40, 16); a.cyl(cx, cy, Z0 + 140, Z1 - 420, 26, 12);
      for (const s of v.twin ? [1, -1] : [1]) {
        const hx = cx + s * dx;
        a.tube([[cx, cy, Z1 - 420], [cx, cy, Z1 - 320], [cx + s * dx * 0.45, cy, Z1 - 220], [hx, cy, Z1 - 160]], [14, 11, 11, 11], 8);
        a.cone(hx, cy, Z1 - 150, Z1 - 40, r * 0.85, r, 24); a.cyl(hx, cy, Z1 - 40, Z1, r * 0.6, 20); ring(a, hx, cy, Z1 - 148, r * 0.9, 4);
        a.cyl(hx, cy, Z1 - 160, Z1 - 148, 24, 8); a.circ(hx, cy, r, 'EQUIP-DETAIL');
      }
      a.log('Added the five-spoke caster base, column, gooseneck arm' + (v.twin ? 's' : '') + ' and the lamp head' + (v.twin ? 's' : '') + ' with lens ring (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic patient room horizontal headwall',
    desc: (v) => `Horizontal wall-mounted headwall, ${v.len} ft long, with an extruded housing, ${v.gas} round gas outlet bodies with rings, ${v.pw} duplex receptacles, a top light bar and a lower equipment rail.`,
    vs: [[4, 3, 2], [6, 4, 4], [8, 6, 4], [10, 8, 6], [12, 10, 8]].map(([len, gas, pw]) => [`${len} ft, ${gas} gas outlets`, len * 12, 7, 16, 52, { len, gas, pw }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
      a.box(X0, YF + 40, Z0, X1, YB, Z1); a.box(X0 + 30, YF + 20, Z0 + 150, X1 - 30, YF + 40, Z1 - 100);
      a.box(X0 + 40, YF, Z1 - 80, X1 - 40, YF + 40, Z1 - 10); a.rect(X0 + 40, YF, X1 - 40, YF + 40, 'EQUIP-DETAIL');
      a.xcyl(X0 + 20, X1 - 20, YF + 8, Z0 + 55, 14, 10); a.box(X0 + 20, YF + 8, Z0 + 20, X1 - 20, YF + 40, Z0 + 55);
      const n = v.gas + v.pw, sp = (W - 200) / n;
      for (let i = 0; i < n; i++) {
        const x = X0 + 100 + sp * (i + 0.5), zc = Z0 + (Z1 - Z0) * 0.5;
        if (i < v.gas) { a.ycyl(YF - 10, YF + 20, x, zc, 42, 16); a.ycyl(YF - 14, YF - 8, x, zc, 22, 12); a.circ(x, YF + 5, 40, 'EQUIP-DETAIL'); }
        else rcpt(a, x, zc, 90, 130, YF - 4);
      }
      a.log('Added the housing, light bar, equipment rail, ' + v.gas + ' gas outlet bodies and ' + v.pw + ' duplex receptacles (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic ceiling service column',
    desc: (v) => `${v.kind} ceiling service column on a ceiling plate and a round column, with ${v.out} outlet rings and receptacles on the face${v.arm ? ', and a swing arm carrying an equipment shelf' : ''}${v.shelf ? ', and a fixed equipment shelf' : ''}.`,
    vs: [['fixed, 6 outlets', 'Fixed', 6, false, false], ['fixed, 8 outlets with shelf', 'Fixed', 8, false, true], ['swing arm, 8 outlets', 'Single-arm', 8, true, false], ['swing arm, 10 outlets', 'Single-arm', 10, true, false], ['swing arm, 12 outlets, shelf', 'Single-arm', 12, true, true]]
      .map(([l, kind, out, arm, shelf]) => [l, arm ? 54 : 18, 18, 96, 24, { kind, out, arm, shelf }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, hx = v.arm ? X0 + 230 : cx; a.outline(); a.circ(hx, cy, 200); a.circ(hx, cy, 160, 'EQUIP-DETAIL');
      a.cyl(hx, cy, Z1 - 40, Z1, 230, 24); a.cyl(hx, cy, Z0 + 150, Z1 - 40, 160, 22); a.cone(hx, cy, Z0, Z0 + 150, 120, 160, 20);
      for (let i = 0; i < v.out; i++) { const z = Z0 + 260 + (i % 4) * 330 + 30, ang = (i < 4 ? 0 : i < 8 ? 1 : 2) * 0.9 - 0.9; const px = hx + m.sin(ang) * 160, py = cy - m.cos(ang) * 160; a.ycyl(py - 12, py + 12, px, z, 48, 14); }
      if (v.shelf) { a.box(hx - 220, cy - 170, Z0 + 650, hx + 220, cy + 170, Z0 + 700); a.rect(hx - 220, cy - 170, hx + 220, cy + 170, 'EQUIP-DETAIL'); }
      if (v.arm) { const za = Z1 - 400; a.box(hx, cy - 50, za - 45, X1 - 120, cy + 50, za + 45); a.cyl(X1 - 170, cy, Z0 + 200, za, 55, 14); a.cone(X1 - 170, cy, Z0 + 100, Z0 + 200, 60, 140, 16); a.box(X1 - 330, cy - 160, Z0 + 600, X1 - 10, cy + 160, Z0 + 650); a.line(hx, cy, X1 - 170, cy); a.rect(X1 - 330, cy - 160, X1 - 10, cy + 160, 'EQUIP-DETAIL'); }
      a.log('Added the ceiling plate, column, outlet rings' + (v.arm ? ', the swing arm with its post' : '') + (v.arm || v.shelf ? ' and the equipment shelf' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic ward corridor dome light',
    desc: (v) => `Corridor dome light for a ward door: a wall plate, a short bracket and ${v.n} stacked dome lens segments${v.sounder ? ', with a sounder grille on the base' : ''}.`,
    vs: [['one segment', 1, false], ['two segments', 2, false], ['three segments', 3, false], ['four segments with sounder', 4, true]].map(([l, n, sounder]) => [l, 5, 5, 3 + n * 3, 84, { n, sounder }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a, r = a.W / 2 - 4, cy = YB - r - 10; a.outline();
      a.box(X0, YB - 14, Z0, X1, YB, Z1); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL');
      a.cyl(cx, cy, Z0, Z0 + 30, r * 0.8, 20); const sh = (Z1 - Z0 - 30 - 20) / v.n;
      for (let i = 0; i < v.n; i++) { const z = Z0 + 30 + i * sh; a.cyl(cx, cy, z, z + sh - 6, r, 22); a.cyl(cx, cy, z + sh - 6, z + sh, r * 0.78, 20); }
      a.cone(cx, cy, Z1 - 20, Z1, r * 0.7, r * 0.3, 14); a.box(cx - 30, cy, Z0 + 10, cx + 30, YB - 14, Z0 + 40);
      if (v.sounder) for (let i = 0; i < 4; i++) a.box(cx - r * 0.5, cy - r * 0.4 + i * r * 0.27, Z0 - 0.01, cx + r * 0.5, cy - r * 0.34 + i * r * 0.27, Z0 + 6);
      a.log('Added the wall plate, bracket and ' + v.n + ' stacked dome lens segments' + (v.sounder ? ' with the sounder grille' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic bedside nurse-call station',
    desc: (v) => `Bedside wall station in a ${v.w} in plate with ${v.items.join(', ')}.`,
    vs: [['call button and cancel', ['a call button', 'a cancel button', 'a status lamp']], ['call and speaker grille', ['a call button', 'a speaker grille of slots', 'a status lamp']], ['call, speaker and code button', ['a call button', 'a speaker grille of slots', 'a recessed code button', 'a status lamp']], ['two bed jacks and call', ['a call button', 'two cord jacks', 'a status lamp']], ['bath pull-cord', ['a pull-cord bar', 'a hanging cord with a pull ring', 'a reset button']]]
      .map(([l, items], i) => [l, 4.5, 1.5, 7, 48, { items, kind: i }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 20, Z0, X1, YB, Z1); a.frame(X0 + 4, Z0 + 4, X1 - 4, Z1 - 4, YF + 8, YB - 20, 8);
      const k = v.kind;
      if (k === 4) { a.box(X0 + 20, YF + 4, Z1 - 70, X1 - 20, YF + 28, Z1 - 30); lamp(a, cx + 30, Z1 - 100, 12, YF + 5, 6); a.tube([[cx - 30, YF + 20, Z1 - 70], [cx - 30, YF + 20, Z0 + 60]], [3, 3], 6); a.cyl(cx - 30, YF + 20, Z0 + 40, Z0 + 62, 14, 10); a.circ(cx - 30, YF + 20, 14, 'EQUIP-DETAIL'); }
      else {
        lamp(a, cx, Z1 - 55, 22, YF + 4, 20); lamp(a, cx, Z1 - 120, 8, YF + 6, 6);
        if (k === 1 || k === 2) for (let i = 0; i < 5; i++) a.box(cx - 30, YF + 6, Z0 + 70 + i * 12, cx + 30, YF + 12, Z0 + 76 + i * 12);
        if (k === 2) lamp(a, cx + 25, Z0 + 34, 9, YF + 8, 4);
        if (k === 3) for (const s of [-1, 1]) { a.ycyl(YF + 2, YF + 20, cx + s * 28, Z0 + 55, 9, 10); a.circ(cx + s * 28, YF + 10, 9, 'EQUIP-DETAIL'); }
        if (k === 0) lamp(a, cx, Z0 + 55, 14, YF + 4, 10);
      }
      a.log('Added the wall plate, frame and ' + v.items.join(', ') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic isolated power panel for an operating room',
    desc: (v) => `Wall-mounted isolated power panel, ${v.ckt} branch circuits, with a hinged door, ${v.ckt} breakers in two columns, a monitor window with a bar of indicator lamps, an alarm lamp and a nameplate.`,
    vs: [[8, 20, 24], [12, 22, 28], [16, 24, 34], [24, 26, 40]].map(([ckt, w, h]) => [`${ckt} circuit`, w, 8, h, 42, { ckt }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YB - 90, Z0, X1, YB, Z1); a.frame(X0 + 6, Z0 + 6, X1 - 6, Z1 - 6, YF + 30, YB - 90, 14);
      a.box(X0 + 16, YF + 10, Z0 + 16, X1 - 16, YF + 40, Z1 - 16); a.rect(X0 + 16, YF + 10, X1 - 16, YF + 40, 'EQUIP-DETAIL');
      const mz1 = Z1 - 50, mz0 = mz1 - 150; win(a, X0 + 50, mz0, X1 - 50, mz1, YF + 4, 8);
      for (let i = 0; i < 6; i++) lamp(a, X0 + 100 + i * ((W - 200) / 5), mz0 + 40, 10, YF - 4, 8);
      lamp(a, X1 - 70, mz1 + 0 - 20, 14, YF - 4, 8);
      const rows = v.ckt / 2, bh = (mz0 - Z0 - 110) / rows;
      for (let r = 0; r < rows; r++) for (const c of [0, 1]) { const x0 = c ? cx + 30 : X0 + 50, x1 = c ? X1 - 50 : cx - 30; a.box(x0, YF, Z0 + 60 + r * bh, x1, YF + 10, Z0 + 60 + r * bh + bh * 0.7); }
      a.box(cx - 120, YF, Z0 + 20, cx + 120, YF + 10, Z0 + 46);
      a.log('Added the enclosure, hinged door, monitor window with indicator lamps, ' + v.ckt + ' breakers, alarm lamp and nameplate (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic emergency power transfer switch cabinet',
    desc: (v) => `Floor-standing ${v.amps} A automatic transfer switch cabinet with a hinged front door, a handle with a lock hasp, a window over a switch bank, two source indicator lamps, a nameplate${v.louv ? ', side louvers' : ''} and a conduit entry at the top, with the front working space.`,
    vs: [[100, 24, 16, 48], [200, 28, 18, 56], [400, 32, 22, 66], [800, 40, 28, 78], [1200, 48, 32, 90]].map(([amps, w, d, h]) => [`${amps} A`, w, d, h, 0, { amps, louv: amps >= 400 }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 10, YF + 10, Z0 + 60, X1 - 10, YB - 10, Z1 - 60); a.box(X0, YF, Z1 - 60, X1, YB, Z1);
      a.box(X0 + 40, YF - 6, Z0 + 110, X1 - 40, YF + 10, Z1 - 120); a.rect(X0 + 40, YF - 6, X1 - 40, YF + 10, 'EQUIP-DETAIL');
      win(a, X0 + 100, Z1 - 520 > Z0 + 300 ? Z1 - 520 : Z0 + 300, X1 - 100, Z1 - 260, YF - 10, 6);
      a.box(X1 - 110, YF - 40, (Z0 + Z1) / 2 - 90, X1 - 80, YF - 6, (Z0 + Z1) / 2 + 90); a.box(X1 - 120, YF - 44, (Z0 + Z1) / 2 - 20, X1 - 70, YF - 40, (Z0 + Z1) / 2 + 20);
      lamp(a, X0 + 160, Z1 - 200, 18, YF - 6, 6); lamp(a, X0 + 260, Z1 - 200, 18, YF - 6, 6); a.box(X0 + 120, YF - 8, Z0 + 150, X0 + 360, YF - 6, Z0 + 230);
      if (v.louv) for (let z = Z0 + 300; z < Z1 - 300; z += 55) { a.box(X0 - 0, YF + 60, z, X0 + 10, YB - 60, z + 22); a.box(X1 - 10, YF + 60, z, X1, YB - 60, z + 22); }
      a.cyl(X0 + W * 0.3, a.cy, Z1 - 60, Z1, 40, 12);
      a.arc(X0, YF, W - 100, 270, 360); a.clear('working space', X0, YF - 1070, X1, YF, 40);
      a.log('Added the base, enclosure, hinged door with swing, handle and lock hasp, switch window, source lamps, nameplate and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic operating room wall control panel',
    desc: (v) => `Flush wall control panel in a frame with ${v.items.join(', ')}.`,
    vs: [['clock and timer', ['a round clock', 'a timer display']], ['clock, timer and switch bank', ['a round clock', 'a timer display', 'a bank of rocker switches']], ['clock, timer and two gauges', ['a round clock', 'a timer display', 'two round gauges']], ['clock, timer, gauges and switch bank', ['a round clock', 'a timer display', 'two round gauges', 'a bank of rocker switches']]]
      .map(([l, items], i) => [l, 12 + i * 4, 3, 16, 56, { items, k: i }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF + 10, YB - 40, 24); a.box(X0 + 24, YF + 20, Z0 + 24, X1 - 24, YB - 40, Z1 - 24);
      const zt = Z1 - 150, cw = (W - 100) / (v.k + 1);
      a.ycyl(YF + 4, YF + 24, X0 + 70 + 90, zt, 90, 28); a.ycyl(YF, YF + 4, X0 + 160, zt, 78, 28); a.circ(X0 + 160, YF + 12, 90, 'EQUIP-DETAIL');
      win(a, X0 + 290, zt - 55, X1 - 50, zt + 55, YF + 6, 8);
      if (v.k >= 2) for (const s of [0, 1]) { a.ycyl(YF + 4, YF + 30, X0 + 130 + s * 180, Z0 + 130, 55, 22); a.circ(X0 + 130 + s * 180, YF + 12, 55, 'EQUIP-DETAIL'); }
      if (v.k === 1 || v.k === 3) for (let i = 0; i < 4; i++) a.box(X1 - 340 + i * 80, YF, Z0 + 70, X1 - 290 + i * 80, YF + 20, Z0 + 190);
      a.log('Added the frame, back box and ' + v.items.join(', ') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic medical gas area alarm panel',
    desc: (v) => `Wall alarm panel with ${v.n} gas channels, each a labelled window with a status lamp and a pressure read-out, plus a buzzer grille and a silence button in a flush frame.`,
    vs: [2, 3, 4, 6].map((n) => [`${n} gas channels`, n <= 3 ? 9 : 12, 3, n <= 3 ? 8 : 11, 54, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF + 10, YB - 40, 14);
      const cols = v.n > 3 ? 2 : 1, rows = m.ceil(v.n / cols), aw = (W - 120) / cols, bz = Z0 + 160, ah = (Z1 - bz - 40) / rows;
      for (let i = 0; i < v.n; i++) { const c = i % cols, r = m.floor(i / cols), x0 = X0 + 60 + c * aw, z0 = bz + r * ah; win(a, x0 + 6, z0 + 8, x0 + aw - 6, z0 + ah - 8, YF + 4, 8); lamp(a, x0 + 30, z0 + ah / 2, 11, YF - 2, 6); a.box(x0 + 60, YF - 2, z0 + ah / 2 - 14, x0 + aw - 20, YF + 4, z0 + ah / 2 + 14); }
      for (let i = 0; i < 4; i++) a.box(X0 + 50, YF + 2, Z0 + 40 + i * 20, X0 + 140, YF + 8, Z0 + 50 + i * 20); lamp(a, X1 - 70, Z0 + 80, 16, YF + 2, 14);
      a.log('Added the frame, ' + v.n + ' gas channel windows with lamps and read-outs, the buzzer grille and the silence button (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic imaging room door warning lamp',
    desc: (v) => ({ one: 'Wall-mounted door warning lamp: a back box and a round lens with a rim.', sign: 'Wall-mounted door warning lamp: a back box, a round lens above a sign plate with a border.', bar: 'Wall-mounted door warning lamp: a back box, a long light bar with an end lens at each side and a small sign plate below.' }[v.kind]),
    vs: [['one lens', 'one', 6, 6], ['lens with sign plate', 'sign', 8, 12], ['light bar with sign plate', 'bar', 16, 10]].map(([l, kind, w, h]) => [l, w, 3, h, 78, { kind }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YB - 40, Z0, X1, YB, Z1);
      if (v.kind === 'bar') { a.box(X0 + 10, YF + 20, Z1 - 100, X1 - 10, YB - 40, Z1 - 20); lamp(a, X0 + 60, Z1 - 60, 36, YF + 10, 14); lamp(a, X1 - 60, Z1 - 60, 36, YF + 10, 14); win(a, X0 + 130, Z1 - 85, X1 - 130, Z1 - 35, YF + 16, 4); a.box(cx - 70, YF + 30, Z0 + 20, cx + 70, YB - 40, Z0 + 100); }
      else { const r = (W - 40) / 2; lamp(a, cx, Z1 - r - 20, r, YF + 10, 22); a.ycyl(YF + 6, YF + 12, cx, Z1 - r - 20, r * 1.08, 20); if (v.kind === 'sign') { a.box(X0 + 20, YF + 30, Z0 + 20, X1 - 20, YB - 40, Z0 + 120); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 40, 'EQUIP-DETAIL'); } }
      a.log('Added the back box, lens' + (v.kind === 'bar' ? ' bar with two end lenses' : '') + (v.kind !== 'one' ? ' and the sign plate' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic patient room overbed wall light',
    desc: (v) => `Wall-mounted overbed light ${v.len} in long: a back channel with a down lens and an up-light slot${v.arm ? ', a pivoting reading-lamp arm on one end' : ''}${v.exam ? ' and a small exam lamp on a short arm on the other' : ''}.`,
    vs: [['48 in, up and down', 48, false, false], ['60 in, with reading arm', 60, true, false], ['72 in, with reading arm', 72, true, false], ['72 in, reading arm and exam lamp', 72, true, true]]
      .map(([l, len, arm, exam]) => [l, len, 10, arm ? 16 : 7, 68, { len, arm, exam }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline();
      const zb = Z0 + (v.arm ? 120 : 0); a.box(X0, YB - 80, zb, X1, YB, zb + 160); a.box(X0 + 10, YB - 120, zb + 40, X1 - 10, YB - 80, zb + 130); a.box(X0 + 30, YB - 100, zb + 160, X1 - 30, YB - 80, zb + 190 > Z1 ? Z1 : zb + 170);
      a.box(X0 + 40, YB - 86, zb - 0, X1 - 40, YB - 74, zb + 10); a.rect(X0, YB - 120, X1, YB, 'EQUIP-DETAIL');
      if (v.arm) { const ax = X0 + 160; a.cyl(ax, YB - 100, zb + 160, zb + 190, 24, 10); a.tube([[ax, YB - 100, zb + 190], [ax, YB - 160, zb + 280], [ax, YB - 190, zb + 120]], [10, 8, 8], 8); a.cone(ax, YB - 190, zb + 20, zb + 120, 55, 20, 14); a.tube([[ax, YB - 100, zb + 190], [ax, YB - 100, Z1 - 5]], [1, 1], 4); a.circ(ax, YB - 190, 55, 'EQUIP-DETAIL'); }
      if (v.exam) { const ex = X1 - 200; a.tube([[ex, YB - 100, zb + 100], [ex, YB - 170, zb + 100]], [10, 10], 8); a.ell(ex, YB - 190, zb + 100, 40, 40, 40, 12, 6); a.circ(ex, YB - 190, 40, 'EQUIP-DETAIL'); }
      a.log('Added the back channel, down lens and up-light slot' + (v.arm ? ', the pivoting reading arm' : '') + (v.exam ? ' and the exam lamp arm' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic staff-alert wall station',
    desc: (v) => `Staff-alert wall station: a back plate, ${v.items.join(', ')}.`,
    vs: [['guarded push button', ['a push button under a hinged guard', 'a status lamp']], ['push button and strobe', ['a push button', 'a square strobe lens above it']], ['key reset and strobe', ['a push button under a guard', 'a key switch', 'a square strobe lens above it']]]
      .map(([l, items], i) => [l, 4.5, 2.5, i ? 8 : 5, 48, { items, k: i }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0, YB - 25, Z0, X1, YB, Z1); a.frame(X0 + 3, Z0 + 3, X1 - 3, Z1 - 3, YF + 15, YB - 25, 8);
      const zb = Z0 + 100;
      if (v.k) { win(a, cx - 45, Z1 - 140, cx + 45, Z1 - 40, YF + 6, 10); a.ycyl(YF + 6, YF + 22, cx, zb + 30, 24, 14); a.circ(cx, YF + 14, 24, 'EQUIP-DETAIL'); } else { a.ycyl(YF + 4, YF + 26, cx, zb, 28, 14); lamp(a, cx, Z1 - 30, 10, YF + 6, 6); }
      if (v.k === 2) { a.ycyl(YF + 4, YF + 14, cx, Z0 + 28, 14, 10); a.circ(cx, YF + 9, 14, 'EQUIP-DETAIL'); }
      a.box(cx - 40, YF + 2, zb - 40, cx + 40, YF + 24, zb - 36 > zb ? zb : zb - 28);
      a.log('Added the back plate, frame and ' + v.items.join(', ') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic isolation room anteroom status panel',
    desc: (v) => `Wall status panel for an isolation room anteroom, with ${v.items.join(', ')}.`,
    vs: [['one gauge and three lamps', ['a round differential gauge', 'three lamp lenses']], ['gauge, display and three lamps', ['a round differential gauge', 'a numeric display window', 'three lamp lenses']], ['two gauges, display and four lamps', ['two round differential gauges', 'a numeric display window', 'four lamp lenses']]]
      .map(([l, items], i) => [l, 6 + i * 3, 2.5, 8, 56, { items, k: i }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0, YB - 35, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF + 10, YB - 35, 12);
      const ng = v.k === 2 ? 2 : 1, gw = ng * 140; const gx = (i) => X0 + 25 + 60 + i * 130;
      for (let i = 0; i < ng; i++) { a.ycyl(YF + 6, YF + 30, gx(i), Z1 - 90, 52, 24); a.ycyl(YF + 2, YF + 6, gx(i), Z1 - 90, 44, 24); a.circ(gx(i), YF + 18, 52, 'EQUIP-DETAIL'); }
      if (v.k) win(a, gx(ng - 1) + 70, Z1 - 140, X1 - 25, Z1 - 40, YF + 6, 8);
      const nl = v.k === 2 ? 4 : 3; for (let i = 0; i < nl; i++) lamp(a, X0 + 50 + i * ((W - 100) / (nl - 1 || 1)), Z0 + 50, 14, YF + 4, 8);
      a.log('Added the frame and ' + v.items.join(', ') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic operating room monitor wall arm',
    desc: (v) => `Wall-mounted ${v.dia} in flat display on a two-link arm: a wall plate, an arm with an elbow and a swivel, a mounting plate and a thin screen with a bezel.`,
    vs: [24, 32, 43, 55].map((s) => [`${s} in display`, m.round(s * 0.87 + 4), 20, m.round(s * 0.49 + 8), 60, { dia: s }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx, cy } = a; a.outline();
      const zc = (Z0 + Z1) / 2; a.box(cx - 90, YB - 20, zc - 160, cx + 90, YB, zc + 160);
      a.cyl(cx, YB - 50, zc - 60, zc + 60, 30, 12); a.tube([[cx, YB - 50, zc], [cx, YB - 200, zc], [cx - 0, YF + 120, zc]], [24, 22, 22], 10);
      a.cyl(cx, YB - 200, zc - 50, zc + 50, 34, 12); a.box(cx - 70, YF + 80, zc - 70, cx + 70, YF + 120, zc + 70);
      a.box(X0, YF + 30, Z0, X1, YF + 80, Z1); a.frame(X0, Z0, X1, Z1, YF, YF + 30, 14); a.box(X0 + 14, YF + 4, Z0 + 14, X1 - 14, YF + 30, Z1 - 14);
      a.rect(X0 + 14, YF + 4, X1 - 14, YF + 30, 'EQUIP-DETAIL'); a.line(cx, YB - 200, cx, YB, 'EQUIP-DETAIL'); a.circ(cx, YB - 200, 34, 'EQUIP-DETAIL');
      a.log('Added the wall plate, two-link arm with elbow and swivel, mounting plate, screen and bezel (plan and 3D).');
    } }),


  fam({ cat: 'electrical/equipment', title: 'Generic hospital backup power cabinet',
    desc: (v) => `Floor-standing backup power cabinet for a clinical area, ${v.kva} kVA: a plinth, a hinged front door with a handle and lock, a display window with a lamp column, a vent band at the top and bottom, a battery drawer behind a lower panel and a conduit entry on top.`,
    vs: [[3, 14, 24, 36], [6, 16, 26, 42], [10, 20, 28, 48], [20, 24, 30, 60], [40, 30, 32, 68], [80, 40, 34, 74]].map(([kva, w, d, h]) => [`${kva} kVA`, w, d, h, 0, { kva }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 10, YF + 20, Z0 + 60, X1 - 10, YB - 10, Z1 - 30); a.box(X0, YF + 10, Z1 - 30, X1, YB, Z1);
      a.box(X0 + 40, YF - 2, Z0 + 330, X1 - 40, YF + 20, Z1 - 110); a.rect(X0 + 40, YF - 2, X1 - 40, YF + 20, 'EQUIP-DETAIL');
      a.box(X1 - 100, YF - 28, (Z0 + Z1) / 2 - 80, X1 - 70, YF - 2, (Z0 + Z1) / 2 + 80); a.ycyl(YF - 36, YF - 28, X1 - 85, (Z0 + Z1) / 2 + 30, 12, 8);
      win(a, X0 + 70, Z1 - 330, X1 - 160, Z1 - 200, YF - 10, 8);       for (let i = 0; i < 4; i++) lamp(a, X0 + 110 + i * 60, Z1 - 150, 12, YF - 4, 8);
      for (const z of [Z0 + 110, Z1 - 80]) for (let k = 0; k < 4; k++) a.box(X0 + 70, YF - 4, z + k * 14, X1 - 70, YF + 0, z + 8 + k * 14 > Z1 ? Z1 : z + 8 + k * 14);
      a.box(X0 + 40, YF - 2, Z0 + 70, X1 - 40, YF + 20, Z0 + 310); a.rect(X0 + 40, YF - 2, X1 - 40, YF + 20, 'EQUIP-DETAIL'); a.box(cx - 50, YF - 14, Z0 + 270, cx + 50, YF - 2, Z0 + 290);
      a.arc(X0 + 40, YF - 2, W - 80, 270, 360); a.clear('working space', X0, YF - 1070, X1, YF, 40);
      a.log('Added the plinth, cabinet, door with swing, handle and lock, display window with lamps, vent bands, battery drawer panel and the working space (plan and 3D).');
    } }),
  // @@HOSP-END
  // ===================================================== construction sites =====================================================
  fam({ cat: 'electrical/equipment', title: 'Generic site power distribution box',
    desc: (v) => `Portable site distribution box on two skid rails, ${v.amps} A, with a hinged lid, a lifting handle, a main breaker handle and ${v.out} round outlets with caps in two rows on the front panel.`,
    vs: [[60, 4, 16, 10, 14], [100, 6, 20, 12, 16], [200, 8, 26, 14, 20], [400, 10, 32, 16, 24], [600, 12, 38, 18, 28]].map(([amps, out, w, d, h]) => [`${amps} A, ${out} outlets`, w, d, h, 0, { amps, out }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline();
      for (const y of [YF + 40, YB - 90]) a.box(X0, y, Z0, X1, y + 50, Z0 + 50);
      a.box(X0 + 10, YF + 30, Z0 + 50, X1 - 10, YB - 20, Z1 - 40); a.box(X0, YF + 20, Z1 - 40, X1, YB - 10, Z1 - 30);
      a.box(cx - 100, YF + 60, Z1 - 30, cx + 100, YF + 90, Z1); a.box(cx - 100, YB - 90, Z1 - 30, cx + 100, YB - 60, Z1);
      a.xcyl(cx - 100, cx + 100, YF + 75, Z1 - 4, 4, 6);
      const cols = v.out / 2, cw = (W - 120) / cols, zr = (Z1 - Z0 - 220) / 4, zz = [Z0 + 110 + zr, Z0 + 110 + zr * 3];
      for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) { const x = X0 + 60 + cw * (c + 0.5), rr = m.min(cw * 0.35, 36); a.ycyl(YF + 10, YF + 40, x, zz[r], rr, 16); a.ycyl(YF - 3, YF + 10, x, zz[r], rr * 0.75, 14); a.circ(x, YF + 25, rr, 'EQUIP-DETAIL'); }
      a.box(X1 - 90, YF - 0.5, Z0 + 60, X1 - 20, YF + 30, Z0 + 130); a.rect(X0 + 10, YF + 30, X1 - 10, YB - 20, 'EQUIP-DETAIL');
      a.log('Added the skid rails, enclosure, hinged lid, lifting handle, main breaker handle and ' + v.out + ' round outlets (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic trailer light tower',
    desc: (v) => `Towable site light tower, ${v.mast} ft mast with ${v.lamps} lamp heads in two rows on a head frame, a telescoping mast of three tapered sections on a trailer with two wheels, a generator cabinet with two doors, a tongue and four outriggers with jack pads.`,
    vs: [[20, 4, 108], [25, 4, 120], [30, 4, 132], [30, 6, 132], [35, 6, 144]].map(([mast, lamps, L]) => [`${mast} ft mast, ${lamps} lamps`, L, 66, mast * 12 + 56, 0, { mast, lamps }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      const zd = Z0 + 300; a.box(X0 + 380, YF + 130, zd - 40, X1 - 40, YB - 130, zd);
      a.tube([[X0 + 40, cy, zd - 20], [X0 + 400, cy, zd - 20]], [30, 30], 6); a.line(X0 + 40, cy, X0 + 400, cy);
      a.cyl(X0 + 40, cy, Z0 + 190, zd - 20, 18, 8); a.cyl(X0 + 40, cy, Z0 + 160, Z0 + 190, 40, 10);
      for (const s of [-1, 1]) { const yw = cy + s * (a.D / 2 - 60); a.ycyl(yw - 50, yw + 50, cx + 200, Z0 + 200, 200, 22); a.ycyl(yw - 52, yw + 52, cx + 200, Z0 + 200, 80, 14); a.rect(cx, yw - 50, cx + 400, yw + 50, 'EQUIP-DETAIL'); }
      a.box(X0 + 400, YF + 150, zd, X1 - 60, YB - 150, zd + 520); a.rect(X0 + 400, YF + 150, X1 - 60, YB - 150, 'EQUIP-DETAIL');
      const dw = (X1 - X0 - 560) / 2;
      for (let i = 0; i < 2; i++) { const x0 = X0 + 430 + i * (dw + 10); a.box(x0, YF + 138, zd + 40, x0 + dw - 10, YF + 150, zd + 480); a.box(x0 + dw - 80, YF + 126, zd + 220, x0 + dw - 50, YF + 138, zd + 300); }
      for (const [px, py] of [[X1 - 100, YB - 60], [X0 + 440, YB - 60], [X1 - 100, YF + 60], [X0 + 440, YF + 60]]) {
        a.box(px - 60, py - 55, Z0, px + 60, py + 55, Z0 + 40); a.cyl(px, py, Z0 + 40, zd - 40, 16, 8);
        if (py > cy) a.box(px - 25, YB - 130, zd - 80, px + 25, py + 25, zd - 40); else a.box(px - 25, py - 25, zd - 80, px + 25, YF + 130, zd - 40);
        a.rect(px - 60, py - 55, px + 60, py + 55, 'EQUIP-DETAIL');
      }
      const mx = X0 + 620, zm = zd + 520, top = Z1 - 345, rows = v.lamps / 2, hw = rows * 220;
      a.cyl(mx, cy, zm, zm + (top - zm) * 0.34, 90, 14); a.cyl(mx, cy, zm + (top - zm) * 0.34, zm + (top - zm) * 0.68, 72, 14); a.cyl(mx, cy, zm + (top - zm) * 0.68, top, 54, 14);
      for (const f of [0.34, 0.68]) a.cyl(mx, cy, zm + (top - zm) * f - 20, zm + (top - zm) * f + 20, 100 - f * 40, 14);
      a.circ(mx, cy, 90, 'EQUIP-DETAIL');
      a.box(mx - 30, cy - hw / 2, top, mx + 30, cy + hw / 2, top + 40);
      for (let r = 0; r < 2; r++) for (let i = 0; i < rows; i++) { const y = cy - hw / 2 + (i + 0.5) * hw / rows; a.box(mx - 110, y - 100, top + 40 + r * 170, mx + 110, y + 100, top + 40 + r * 170 + 130); if (!r) a.rect(mx - 110, y - 100, mx + 110, y + 100, 'EQUIP-DETAIL'); }
      a.log('Added the trailer, wheels, tongue, generator cabinet, three telescoping mast sections, lamp head frame with ' + v.lamps + ' lamps and four outriggers (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic towable site generator',
    desc: (v) => `Towable site generator, ${v.kw} kW, a canopy enclosure on a trailer frame with two wheels, a tongue, two hinged service doors with handles, a louvered radiator end, an exhaust stack, a control panel window, lifting eyes and four jack stands.`,
    vs: [[20, 96, 54, 60], [45, 120, 60, 68], [100, 150, 70, 80], [200, 180, 80, 90], [400, 220, 90, 100]].map(([kw, L, w, h]) => [`${kw} kW`, L, w, h, 0, { kw }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      const zd = Z0 + 340; a.box(X0 + 300, YF + 60, zd - 90, X1 - 20, YB - 60, zd);
      a.tube([[X0 + 30, cy, zd - 45], [X0 + 320, cy, zd - 45]], [38, 38], 6); a.cyl(X0 + 30, cy, Z0 + 250, zd - 45, 20, 8); a.cyl(X0 + 30, cy, Z0 + 230, Z0 + 260, 50, 10); a.line(X0 + 30, cy, X0 + 320, cy);
      for (const s of [-1, 1]) { const yw = cy + s * (a.D / 2 - 90); a.ycyl(yw - 60, yw + 60, cx + W * 0.1, Z0 + 230, 230, 24); a.ycyl(yw - 62, yw + 62, cx + W * 0.1, Z0 + 230, 90, 14); }
      a.box(X0 + 320, YF + 90, zd, X1 - 40, YB - 90, Z1 - 80); a.box(X0 + 300, YF + 70, Z1 - 80, X1 - 20, YB - 70, Z1 - 55); a.rect(X0 + 320, YF + 90, X1 - 40, YB - 90, 'EQUIP-DETAIL');
      const dw = (X1 - X0 - 800) / 2;
      for (let i = 0; i < 2; i++) { const x0 = X0 + 380 + i * (dw + 14); a.box(x0, YF + 76, zd + 70, x0 + dw, YF + 90, Z1 - 150); a.box(x0 + dw - 90, YF + 64, (zd + Z1) / 2 - 80, x0 + dw - 60, YF + 76, (zd + Z1) / 2 + 80); a.line(x0, YF + 76, x0, YF + 90); }
      win(a, X1 - 420, zd + 200, X1 - 110, zd + 380, YF + 76, 12);
      for (let z = zd + 150; z < Z1 - 250; z += 46) a.box(X1 - 60, YF + 140, z, X1 - 40, YB - 140, z + 22);
      a.cyl(X0 + 520, YB - 170, Z1 - 80, Z1 - 5, 55, 14); a.cyl(X0 + 520, YB - 170, Z1 - 20, Z1, 75, 14); a.circ(X0 + 520, YB - 170, 55, 'EQUIP-DETAIL');
      for (const x of [X0 + 400, X1 - 120]) { a.cyl(x, cy, Z1 - 55, Z1 - 20, 26, 8); }
      for (const [px, py] of [[X1 - 140, YB - 60], [X1 - 140, YF + 60], [X0 + 340, YB - 60], [X0 + 340, YF + 60]]) { a.box(px - 50, py - 45, Z0, px + 50, py + 45, Z0 + 30); a.cyl(px, py, Z0 + 30, zd - 90, 14, 8); }
      a.log('Added the trailer frame, wheels, tongue, canopy with two service doors, radiator louvers, exhaust stack, control window, lifting eyes and jack stands (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic engine-driven site welder',
    desc: (v) => `Engine-driven welder rated ${v.amps} A on a skid frame, with a louvered enclosure, a control panel carrying two dials, two weld lugs and an outlet, an exhaust pipe, a fuel cap and a lifting eye${v.wheels ? ', on a pair of wheels with a tow handle' : ''}.`,
    vs: [['300 A, skid', 300, 48, 26, 40, false], ['400 A, skid', 400, 54, 28, 44, false], ['600 A, wheeled', 600, 66, 32, 54, true]].map(([l, amps, L, d, h, wheels]) => [l, L, d, h, 0, { amps, wheels }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); const zs = Z0 + (v.wheels ? 120 : 60);
      for (const y of [YF + 40, YB - 90]) a.box(X0, y, zs - 60, X1, y + 50, zs);
      a.box(X0 + 20, YF + 40, zs, X1 - 20, YB - 40, Z1 - 90); a.box(X0 + 10, YF + 30, Z1 - 90, X1 - 10, YB - 30, Z1 - 70);
      a.box(X0 + 120, YF + 18, zs + 100, cx + (X1 - X0) * 0.15, YF + 40, Z1 - 170); for (let z = zs + 140; z < Z1 - 200; z += 36) a.box(X0 + 150, YF + 12, z, cx + (X1 - X0) * 0.12, YF + 18, z + 14);
      const px0 = cx + (X1 - X0) * 0.18; a.box(px0, YF + 12, zs + 90, X1 - 60, YF + 40, Z1 - 120); a.rect(px0, YF + 12, X1 - 60, YF + 40, 'EQUIP-DETAIL');
      for (const dx of [0.3, 0.7]) a.ycyl(YF + 0.5, YF + 12, px0 + (X1 - 60 - px0) * dx, Z1 - 230, 45, 18);
      for (const dx of [0.25, 0.75]) { a.ycyl(YF - 3, YF + 12, px0 + (X1 - 60 - px0) * dx, zs + 170, 18, 12); }
      lamp(a, px0 + (X1 - 60 - px0) * 0.5, zs + 170, 22, YF + 3, 9);
      a.cyl(X0 + 140, YB - 100, Z1 - 70, Z1, 28, 10); a.cyl(X1 - 140, YB - 100, Z1 - 70, Z1 - 30, 20, 10); a.tube([[cx, cy, Z1 - 70], [cx, cy, Z1 - 20], [cx + 40, cy, Z1 - 5]], [16, 16, 12], 8);
      if (v.wheels) { for (const s of [-1, 1]) { const yy = cy + s * (a.D / 2 - 50); a.ycyl(yy - 35, yy + 35, X1 - 200, Z0 + 120, 120, 18); } a.tube([[X0, cy, zs - 30], [X0 - 0.01, cy, zs + 120]], [20, 20], 6); a.box(X0, YF + 60, zs + 100, X0 + 25, YB - 60, zs + 130); }
      a.log('Added the skid, enclosure with louvers, control panel with dials, weld lugs and outlet, exhaust, fuel cap and lifting eye' + (v.wheels ? ', wheels and the tow handle' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic temporary site service pole',
    desc: (v) => v.pedestal ? `Temporary service pedestal on a ground base, ${v.amps} A, with a lockable enclosure, a meter window, a main breaker, ${v.out} receptacles under weather covers and a ground rod.` : `Temporary service pole, ${v.hft} ft above grade, ${v.amps} A, with a pole shaft, a weatherhead, a meter window, a main breaker enclosure, ${v.out} receptacles under weather covers and two diagonal braces.`,
    vs: [['10 ft pole, 100 A', 100, 2, 10, false], ['12 ft pole, 200 A', 200, 4, 12, false], ['14 ft pole, 200 A, 6 outlets', 200, 6, 14, false], ['pedestal, 100 A', 100, 2, 4, true], ['pedestal, 200 A, 4 outlets', 200, 4, 4.5, true]]
      .map(([l, amps, out, hft, pedestal]) => [l, pedestal ? 24 : 30, pedestal ? 14 : 20, hft * 12, 0, { amps, out, hft, pedestal }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      const bw = v.pedestal ? W - 80 : 500, bz0 = v.pedestal ? Z0 + 300 : Z0 + 1300, bz1 = v.pedestal ? Z1 - 40 : bz0 + 800;
      if (!v.pedestal) { a.cyl(cx, cy, Z0, Z1 - 120, 85, 16); a.cyl(cx, cy, Z1 - 120, Z1, 60, 12); a.tube([[cx, cy, Z1 - 120], [cx, cy, Z1 - 30], [cx + 150, cy, Z1 - 60]], [30, 30, 24], 8); a.circ(cx, cy, 85); for (const s of [-1, 1]) { a.tube([[cx + s * 85, cy, Z0 + 500], [cx + s * 330, cy, Z0]], [14, 14], 6); a.box(cx + s * 330 - 60, cy - 60, Z0, cx + s * 330 + 60, cy + 60, Z0 + 30); a.line(cx + s * 85, cy, cx + s * 330, cy); } a.cyl(cx, cy, bz1, Z1 - 120, 85, 16); a.box(cx - bw / 2 - 30, YF + 110, bz0 - 30, cx + bw / 2 + 30, YB - 110, bz1 + 30); }
      else { a.box(X0, YF, Z0, X1, YB, Z0 + 80); a.box(cx - 70, cy - 70, Z0 + 80, cx + 70, cy + 70, bz0); }
      a.box(cx - bw / 2, YF + (v.pedestal ? 20 : 120), bz0, cx + bw / 2, YB - (v.pedestal ? 20 : 120), bz1); a.rect(cx - bw / 2, YF + (v.pedestal ? 20 : 120), cx + bw / 2, YB - (v.pedestal ? 20 : 120), 'EQUIP-DETAIL');
      const yf = YF + (v.pedestal ? 20 : 120); win(a, cx - bw / 2 + 40, bz1 - 260, cx - bw / 2 + 40 + bw * 0.4, bz1 - 60, yf, 10); a.ycyl(yf - 6, yf + 4, cx - bw / 2 + 40 + bw * 0.2, bz1 - 160, bw * 0.12, 16); a.box(cx + bw * 0.1, yf - 12, bz1 - 240, cx + bw * 0.3, yf, bz1 - 100);
      const cw = (bw - 60) / v.out; for (let i = 0; i < m.min(v.out, 6); i++) { const x = cx - bw / 2 + 30 + cw * (i + 0.5), rr = m.min(cw * 0.3, 40), zr = bz0 + 200; a.ycyl(yf - 12, yf + 4, x, zr, rr, 14); a.box(x - rr - 4, yf - 26, zr + rr, x + rr + 4, yf - 12, zr + rr + 20); }
      if (v.pedestal) a.cyl(cx + 260, YB - 40, Z0, Z0 + 20, 25, 8);
      a.log('Added the ' + (v.pedestal ? 'ground base and pedestal' : 'pole shaft, weatherhead and diagonal braces') + ', the lockable enclosure, meter window, breaker and ' + v.out + ' receptacles (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic site tool battery charging rack',
    desc: (v) => `Site charging rack for cordless-tool batteries: an open steel frame with ${v.rows} shelves and ${v.n} charger bays, each bay a charger body with a battery slot and a small status light, a power strip on the back panel and a bottom shelf for spare packs.`,
    vs: [[4, 2], [8, 2], [12, 3], [16, 4]].map(([n, rows]) => [`${n} bays`, n / rows * 9 + 6, 18, rows * 12 + 18, 0, { n, rows }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline();
      for (const x of [X0 + 20, X1 - 20]) for (const y of [YF + 20, YB - 20]) a.cyl(x, y, Z0, Z1, 18, 8);
      a.box(X0 + 20, YB - 25, Z0 + 60, X1 - 20, YB - 15, Z1 - 20); const cols = v.n / v.rows, cw = (W - 60) / cols, rh = (Z1 - Z0 - 160) / v.rows;
      for (let r = 0; r <= v.rows; r++) { const z = Z0 + 90 + r * rh; a.box(X0 + 10, YF + 10, z - 10, X1 - 10, YB - 10, z); }
      for (let r = 0; r < v.rows; r++) for (let c = 0; c < cols; c++) { const x = X0 + 30 + cw * c, z = Z0 + 90 + r * rh; a.box(x + 12, YF + 70, z, x + cw - 12, YB - 70, z + rh * 0.55); a.box(x + cw * 0.25, YF + 60, z + rh * 0.12, x + cw * 0.75, YF + 70, z + rh * 0.3); a.ycyl(YF + 58, YF + 70, x + cw * 0.5, z + rh * 0.42, 6, 8); a.rect(x + 12, YF + 70, x + cw - 12, YB - 70, 'EQUIP-DETAIL'); }
      a.box(X0 + 40, YB - 45, Z0 + 20, X1 - 40, YB - 25, Z0 + 60);
      a.log('Added the frame, shelves, ' + v.n + ' charger bays with slots and status lights, the power strip and the spare-pack shelf (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic tripod LED work light stand',
    desc: (v) => `Tripod work light, ${v.hft} ft high, with three splayed legs and a spreader, a telescoping mast of two sections and ${v.heads === 2 ? 'two flat LED panel heads on a cross bar' : 'one flat LED panel head'}, with a carry handle on the head.`,
    vs: [['4 ft, one head', 4, 1], ['6 ft, one head', 6, 1], ['6 ft, two heads', 6, 2], ['8 ft, two heads', 8, 2], ['10 ft, two heads', 10, 2]].map(([l, hft, heads]) => [l, 36 + hft * 3, 36 + hft * 3, hft * 12, 0, { hft, heads }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, R = a.W / 2 - 40; cplan(a, R);
      for (let i = 0; i < 3; i++) { const g = (i / 3) * m.PI * 2 + 0.5, x = cx + m.cos(g) * R, y = cy + m.sin(g) * R; a.tube([[cx, cy, Z0 + (Z1 - Z0) * 0.62], [x, y, Z0 + 12]], [14, 12], 8); a.cyl(x, y, Z0, Z0 + 16, 24, 8); a.tube([[cx + m.cos(g) * R * 0.45, cy + m.sin(g) * R * 0.45, Z0 + (Z1 - Z0) * 0.3], [cx + m.cos(g + 2.09) * R * 0.45, cy + m.sin(g + 2.09) * R * 0.45, Z0 + (Z1 - Z0) * 0.3]], [4, 4], 6); a.line(cx, cy, x, y); }
      a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.5, Z0 + (Z1 - Z0) * 0.75, 28, 12); a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.75, Z1 - 300, 20, 12);
      const hw = v.heads === 2 ? 220 : 0; if (v.heads === 2) a.box(cx - 320, cy - 18, Z1 - 330, cx + 320, cy + 18, Z1 - 300);
      for (const s of v.heads === 2 ? [-1, 1] : [0]) { const x = cx + s * 220; a.box(x - 150, cy - 28, Z1 - 300, x + 150, cy + 28, Z1); a.rect(x - 150, cy - 28, x + 150, cy + 28, 'EQUIP-DETAIL'); a.box(x - 120, cy - 34, Z1 - 270, x + 120, cy - 28, Z1 - 30); }
      a.log('Added the three splayed legs with spreader, the two-section mast and the LED panel head' + (v.heads === 2 ? 's on a cross bar' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic site cable protector ramp',
    desc: (v) => `Cable protector ${v.len} in long with ${v.ch} channels under hinged lids, sloped ramp ends on both ends, a rubber base and a raised centre rib.`,
    vs: [['2 channel, light duty', 36, 2, 9, 1.5], ['3 channel', 36, 3, 14, 2], ['4 channel', 36, 4, 18, 2.5], ['5 channel, heavy duty', 36, 5, 22, 3], ['5 channel, heavy duty, 60 in long', 60, 5, 22, 3]]
      .map(([l, len, ch, d, h]) => [l, len, d, h, 0, { len, ch }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); const rw = 130, hz = Z1;
      a.box(X0 + rw, YF, Z0, X1 - rw, YB, hz); a.prism([[X0, YF], [X0 + rw, YF], [X0 + rw, YB], [X0, YB]], Z0, Z0 + 0.01 + (Z1 - Z0) * 0.12); a.prism([[X0 + rw, YF], [X0, YF], [X0, YB], [X0 + rw, YB]], Z0, Z0 + (Z1 - Z0) * 0.5);
      a.prism([[X1, YF], [X1 - rw, YF], [X1 - rw, YB], [X1, YB]], Z0, Z0 + (Z1 - Z0) * 0.12); a.prism([[X1 - rw, YF], [X1, YF], [X1, YB], [X1 - rw, YB]], Z0, Z0 + (Z1 - Z0) * 0.5);
      const cw = (a.D - 40) / v.ch;
      for (let i = 0; i < v.ch; i++) { const y0 = YF + 20 + i * cw; a.box(X0 + rw + 40, y0 + 6, hz, X1 - rw - 40, y0 + cw - 6, hz + 0.01); a.rect(X0 + rw + 40, y0 + 6, X1 - rw - 40, y0 + cw - 6, 'EQUIP-DETAIL'); a.box(X0 + rw + 40, y0 + cw - 8, hz - (Z1 - Z0) * 0.2, X1 - rw - 40, y0 + cw - 4, hz); }
      a.box(X0 + rw, YF, Z0, X1 - rw, YF + 10, hz); a.box(X0 + rw, YB - 10, Z0, X1 - rw, YB, hz);
      for (const x of [X0 + rw + 60, X1 - rw - 60]) a.box(x - 20, YF - 0.5, hz - 25, x + 20, YF + 10, hz);
      a.log('Added the base, the sloped ramp ends, ' + v.ch + ' lidded channels and the hinge tabs (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic extension cord reel on stand',
    desc: (v) => `Cord reel for ${v.ft} ft of cable: a drum with two flanges and wound cable turns, a crank handle, a receptacle box with four outlets, on an A-frame stand with two feet and a carry handle.`,
    vs: [['50 ft', 50, 14, 16, 20], ['100 ft', 100, 18, 20, 24], ['150 ft', 150, 22, 24, 28]].map(([l, ft, w, d, h]) => [l, w, d, h, 0, { ft }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); const rr = (a.D * 0.4), zc = Z0 + 140 + rr;
      for (const y of [YF + 20, YB - 20]) { a.tube([[cx - 100, y, Z0 + 15], [cx - 20, y, zc], [cx + 100, y, Z0 + 15]], [14, 12, 14], 8); a.box(cx - 140, y - 20, Z0, cx + 140, y + 20, Z0 + 28); }
      a.xcyl(cx - W * 0.4, cx + W * 0.4, cy, zc, 12, 8);
      for (const s of [-1, 1]) { const x = cx + s * (W * 0.36); a.tube([[x - 9, cy, zc], [x + 9, cy, zc]], [rr, rr], 20); }
      a.tube([[cx - W * 0.28, cy, zc], [cx + W * 0.28, cy, zc]], [rr * 0.45, rr * 0.45], 18); a.tube([[cx - W * 0.28, cy, zc], [cx + W * 0.28, cy, zc]], [rr * 0.82, rr * 0.82], 18);
      a.box(cx - 90, cy - 70, Z0 + 28, cx + 90, cy + 70, Z0 + 140); for (const s of [-1, 1]) a.ycyl(cy + 70, cy + 72, cx + s * 40, Z0 + 90, 18, 10);
      a.tube([[cx + W * 0.4, cy, zc], [cx + W * 0.4, cy + rr * 0.8, zc], [cx + W * 0.4 + 0.01, cy + rr * 0.8, zc + 60]], [6, 6, 6], 6);
      a.ellp(cx, cy, W * 0.38, rr * 0.9, 'EQUIP-DETAIL'); a.line(cx - W * 0.4, cy, cx + W * 0.4, cy, 'EQUIP-DETAIL');
      a.log('Added the A-frame stand, drum with two flanges and wound cable, crank handle and the four-outlet receptacle box (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic skid-mounted site transformer',
    desc: (v) => `Skid-mounted temporary site transformer, ${v.kva} kVA, with a base skid and lifting eyes, a finned tank with radiator fins on both ends, three high-side bushings with skirts on the lid, a low-side terminal cabinet with a hinged door and a nameplate, and the front working space.`,
    vs: [[25, 40, 30, 46], [75, 54, 36, 54], [150, 66, 42, 60], [300, 84, 50, 70], [500, 96, 56, 78]].map(([kva, L, d, h]) => [`${kva} kVA`, L, d, h, 0, { kva }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      for (const y of [YF + 40, YB - 100]) a.box(X0, y, Z0, X1, y + 60, Z0 + 70); a.box(X0 + 60, YF + 40, Z0 + 20, X1 - 60, YB - 40, Z0 + 70);
      for (const x of [X0 + 50, X1 - 50]) a.ell(x, cy, Z0 + 70, 28, 28, 28, 10, 5);
      const tx0 = X0 + 80, tx1 = X1 - 80, tz1 = Z1 - 230; a.box(tx0 + 120, YF + 110, Z0 + 70, tx1 - 120, YB - 110, tz1); a.box(tx0 + 100, YF + 90, tz1, tx1 - 100, YB - 90, tz1 + 30);
      for (const s of [-1, 1]) { const fx = s < 0 ? tx0 + 60 : tx1 - 60; for (let i = 0; i < 8; i++) { const y = YF + 130 + i * ((a.D - 260) / 8); a.box(s < 0 ? tx0 : tx1 - 120, y, Z0 + 150, s < 0 ? tx0 + 120 : tx1, y + (a.D - 260) / 8 - 14, tz1 - 60); } a.rect(s < 0 ? tx0 : tx1 - 120, YF + 130, s < 0 ? tx0 + 120 : tx1, YB - 130, 'EQUIP-DETAIL'); }
      for (let i = 0; i < 3; i++) { const x = cx + (i - 1) * 190, y = cy; a.cyl(x, y, tz1 + 30, tz1 + 60, 40, 12); for (let k = 0; k < 4; k++) a.cone(x, y, tz1 + 60 + k * 40, tz1 + 90 + k * 40, 55 - k * 6, 40 - k * 6, 12); a.cyl(x, y, tz1 + 220 - 20 > Z1 ? Z1 - 10 : tz1 + 210, Z1, 10, 8); a.circ(x, y, 50, 'EQUIP-DETAIL'); }
      a.box(tx0 + 120, YF + 40, Z0 + 150, tx1 - 120, YF + 110, tz1 - 30); a.box(tx0 + 145, YF + 28, Z0 + 180, tx1 - 145, YF + 40, tz1 - 60); a.rect(tx0 + 145, YF + 28, tx1 - 145, YF + 40, 'EQUIP-DETAIL');
      a.box(tx1 - 190, YF + 18, (Z0 + tz1) / 2 - 80, tx1 - 160, YF + 28, (Z0 + tz1) / 2 + 80); a.box(tx0 + 180, YF + 22, tz1 - 130, tx0 + 360, YF + 28, tz1 - 80);
      a.arc(tx0 + 145, YF + 28, tx1 - tx0 - 290, 270, 360); a.clear('working space', X0, YF - 900, X1, YF, 40);
      a.log('Added the skid with lifting eyes, finned tank with end radiators, three high-side bushings with skirts, the low-side terminal cabinet with door and nameplate, and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic site hazard beacon on stand',
    desc: (v) => `Site hazard beacon on a weighted base: ${v.kind}, a telescoping pole of two sections on a ballast block, and a base plate with a carry handle.`,
    vs: [['amber dome, 6 ft pole', 'a rotating amber dome lens in a cage, ', 72, false], ['amber dome with solar panel', 'an amber dome lens with a tilted solar panel on the pole, ', 84, true], ['twin strobe bar on 8 ft pole', 'a twin strobe bar with two lenses and a hood, ', 96, false]]
      .map(([l, kind, h, solar], i) => [l, 22, 22, h, 0, { kind, solar, bar: i === 2 }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a; cplan(a, 260);
      a.box(cx - 270, cy - 270, Z0, cx + 270, cy + 270, Z0 + 90); a.cyl(cx, cy, Z0 + 90, Z0 + 140, 80, 14); a.tube([[cx + 220, cy, Z0 + 95], [cx + 220, cy, Z0 + 150], [cx + 100, cy, Z0 + 150]], [8, 8, 8], 6);
      a.cyl(cx, cy, Z0 + 140, Z1 - 330, 30, 12); a.cyl(cx, cy, Z0 + 140 + (Z1 - Z0 - 470) / 2, Z1 - 330, 22, 12);
      if (v.bar) { a.box(cx - 250, cy - 40, Z1 - 330, cx + 250, cy + 40, Z1 - 250); for (const s of [-1, 1]) { a.ycyl(cy - 60, cy - 40, cx + s * 130, Z1 - 290, 55, 16); } a.box(cx - 260, cy - 50, Z1 - 250, cx + 260, cy + 50, Z1 - 230); a.rect(cx - 250, cy - 40, cx + 250, cy + 40, 'EQUIP-DETAIL'); }
      else { a.cyl(cx, cy, Z1 - 330, Z1 - 290, 70, 16); a.ell(cx, cy, Z1 - 290, 80, 80, 130, 14, 7); for (let i = 0; i < 6; i++) { const g = (i / 6) * m.PI * 2; a.tube([[cx + m.cos(g) * 90, cy + m.sin(g) * 90, Z1 - 290], [cx + m.cos(g) * 40, cy + m.sin(g) * 40, Z1 - 150]], [3, 3], 5); } ring(a, cx, cy, Z1 - 230, 82, 3, 16); }
      if (v.solar) a.prism([[cx - 120, cy - 20], [cx + 120, cy - 20], [cx + 120, cy + 90], [cx - 120, cy + 90]], Z1 - 900, Z1 - 880);
      a.log('Added the ballast base with carry handle, two-section pole and ' + v.kind.replace(/, $/, '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic lockable site power cabinet',
    desc: (v) => `Lockable steel site power cabinet on two skid rails, ${v.w} in wide, with two hinged doors with swings and handles, a padlock hasp, side vents, a roof rain hood and ${v.out} outlets mounted inside on a back plate.`,
    vs: [[36, 18, 60, 4], [48, 20, 72, 6], [60, 24, 72, 8], [72, 24, 84, 12]].map(([w, d, h, out]) => [`${w} in wide`, w, d, h, 0, { w, out }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      for (const y of [YF + 20, YB - 70]) a.box(X0, y, Z0, X1, y + 50, Z0 + 70); a.box(X0 + 20, YF + 20, Z0 + 70, X1 - 20, YB - 20, Z1 - 60);
      a.box(X0, YF, Z1 - 60, X1, YB, Z1 - 30); a.prism([[X0 - 0, YF], [X1, YF], [X1, YB], [X0, YB]], Z1 - 30, Z1 - 10);
      for (const s of [-1, 1]) { const x0 = s < 0 ? X0 + 30 : cx + 8, x1 = s < 0 ? cx - 8 : X1 - 30; a.box(x0, YF - 12, Z0 + 100, x1, YF + 20, Z1 - 100); a.rect(x0, YF - 12, x1, YF + 20, 'EQUIP-DETAIL'); a.box(s < 0 ? cx - 90 : cx + 40, YF - 38, (Z0 + Z1) / 2 - 80, s < 0 ? cx - 40 : cx + 90, YF - 12, (Z0 + Z1) / 2 + 80); a.arc(s < 0 ? X0 + 30 : X1 - 30, YF - 12, (x1 - x0), s < 0 ? 270 : 180, s < 0 ? 360 : 270); }
      for (let z = Z0 + 300; z < Z1 - 300; z += 60) { a.box(X0 + 10, YF + 80, z, X0 + 20, YB - 80, z + 25); a.box(X1 - 20, YF + 80, z, X1 - 10, YB - 80, z + 25); }
      a.ycyl(YF - 55, YF - 38, cx, (Z0 + Z1) / 2, 18, 10); a.box(cx - 25, YF - 50, (Z0 + Z1) / 2 - 60, cx + 25, YF - 38, (Z0 + Z1) / 2 + 60);
      const cw = (W - 200) / v.out; for (let i = 0; i < v.out; i++) a.ycyl(YB - 100, YB - 80, X0 + 100 + cw * (i + 0.5), Z1 - 400, m.min(cw * 0.3, 30), 12);
      a.log('Added the skid rails, enclosure, two doors with swings, handles and padlock hasp, side vents, rain hood and inside outlet plate (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic camp power pedestal',
    desc: (v) => `Camp power pedestal with a base plate, a post, a weather hood over ${v.out} round receptacles with spring flaps, a breaker panel behind a lift flap and a vertical cable hook, for a site camp or trailer pad.`,
    vs: [2, 4, 6, 8].map((out) => [`${out} receptacles`, out <= 4 ? 10 : 16, 10, 40 + out * 2, 0, { out }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 20); a.box(cx - 100, cy - 100, Z0 + 20, cx + 100, cy + 100, Z0 + 500); a.box(X0 + 20, YF + 20, Z0 + 500, X1 - 20, YB - 20, Z1 - 60); a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
      a.prism([[X0, YF + 10], [X1, YF + 10], [X1 - 10, YB - 10], [X0 + 10, YB - 10]], Z1 - 60, Z1);
      const cols = m.min(v.out, 4), rows = v.out / cols, cw = (W - 80) / cols, rh = (Z1 - Z0 - 700) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = X0 + 40 + cw * (c + 0.5), z = Z0 + 560 + rh * (r + 0.5); a.ycyl(YF + 10, YF + 30, x, z, m.min(cw * 0.3, 36), 14); a.ycyl(YF - 4, YF + 10, x, z, m.min(cw * 0.24, 28), 14); a.box(x - 30, YF - 4, z + 30, x + 30, YF + 6, z + 40); }
      a.box(X0 + 30, YF - 6, Z0 + 500, X1 - 30, YF + 20, Z0 + 520); a.tube([[X1 - 30, YF + 4, Z0 + 150], [X1 + 0.01 - 30, YF - 30, Z0 + 150], [X1 - 30, YF - 30, Z0 + 250]], [5, 5, 5], 6);
      a.log('Added the base plate, post, weather hood, ' + v.out + ' receptacles with flaps, the breaker flap and the cable hook (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic temporary festoon light string on stands',
    desc: (v) => `Temporary festoon lighting: two stands with bases, poles and top brackets and a drooping cable carrying a globe lamp every 40 in over a ${v.ft} ft span.`,
    vs: [20, 30, 40, 60].map((ft) => [`${ft} ft span`, ft * 12 + 20, 20, 120, 0, { ft }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cy, W } = a; a.outline();
      for (const x of [X0 + 250, X1 - 250]) { a.box(x - 250, cy - 250 > YF ? cy - 250 : YF, Z0, x + 250, cy + 250 < YB ? cy + 250 : YB, Z0 + 60); a.cyl(x, cy, Z0 + 60, Z1 - 20, 26, 10); a.box(x - 40, cy - 14, Z1 - 60, x + 40, cy + 14, Z1 - 20); a.line(x - 250, cy, x + 250, cy); }
      const n = m.floor((X1 - X0 - 500) / 1016), pts = [], rad = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24, x = X0 + 250 + t * (X1 - X0 - 500); pts.push([x, cy, Z1 - 45 - 4 * 450 * t * (1 - t) * 0.9]); rad.push(3); }
      a.tube(pts, rad, 5);
      for (let i = 1; i < n * 1.0 + 24; i++) { if (i > 24) break; if (i % 1) continue; const t = i / 24; const x = X0 + 250 + t * (X1 - X0 - 500), z = Z1 - 45 - 4 * 450 * t * (1 - t) * 0.9; if (i % 2 === 0) a.ell(x, cy, z - 50, 32, 32, 40, 8, 5); }
      a.log('Added the two weighted stands with poles and brackets, the drooping cable and the globe lamps along it (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic hoist push-button control station',
    desc: (v) => `Pendant-style control station for a material hoist or crane: a hanging housing ${v.btn} buttons (up, down${v.btn > 2 ? ', a second speed' : ''}), a red mushroom emergency stop, a strain relief and a hook bracket${v.key ? ', and a key switch' : ''}.`,
    vs: [['two buttons and stop', 2, false], ['four buttons and stop', 4, false], ['four buttons, stop and key', 4, true]].map(([l, btn, key]) => [l, 5, 4, 14 + (btn - 2) + (key ? 1 : 0), 40, { btn, key }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      a.cyl(cx, cy, Z1 - 60, Z1, 16, 10); a.box(cx - 40, cy - 25, Z1 - 80, cx + 40, cy + 25, Z1 - 60); a.cyl(cx, cy, Z1 - 120, Z1 - 80, 22, 10);
      a.box(X0 + 10, YF + 10, Z0, X1 - 10, YB - 10, Z1 - 120); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
      const n = v.btn, rows = m.ceil(n / 2);
      for (let i = 0; i < n; i++) { const r = m.floor(i / 2), x = n === 2 ? cx + (i ? 26 : -26) : cx + (i % 2 ? 26 : -26); a.ycyl(YF, YF + 18, x, Z1 - 210 - r * 62, 13, 14); }
      a.ycyl(YF, YF + 18, cx, Z0 + 62, 20, 16); a.ycyl(YF + 0.5, YF + 8, cx, Z0 + 62, 25, 16);
      if (v.key) a.ycyl(YF + 4, YF + 14, cx + 38, Z0 + 140, 12, 10);
      a.log('Added the hanging housing, strain relief, hook bracket, ' + v.btn + ' push buttons, the emergency stop mushroom' + (v.key ? ' and the key switch' : '') + ' (plan and 3D).');
    } }),

  // @@CONSTRUCTION
  // ===================================================== mines =====================================================
  fam({ cat: 'electrical/equipment', title: 'Generic mine cap-lamp charging rack',
    desc: (v) => `Wall rack for ${v.n} cap lamps in ${v.rows} rows of ${v.cols}: a back panel, a shelf rail per row, a cradle slot per lamp with a lamp body, a round lens and a charge light, a cord loop below each slot, a header rail and a number strip.`,
    vs: [[12, 2, 6], [24, 4, 6], [36, 3, 12], [48, 4, 12], [60, 5, 12]].map(([n, rows, cols]) => [`${n} lamps`, cols * 3.2 + 4, 8, rows * 9 + 10, 36, { n, rows, cols }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YB - 30, Z0, X1, YB, Z1); a.box(X0, YF + 20, Z1 - 70, X1, YB - 30, Z1); a.box(X0 + 20, YF + 10, Z0, X1 - 20, YB - 30, Z0 + 50);
      const cw = (W - 80) / v.cols, rh = (Z1 - Z0 - 150) / v.rows;
      for (let r = 0; r < v.rows; r++) { const z = Z0 + 60 + r * rh; a.box(X0 + 20, YF + 40, z, X1 - 20, YB - 30, z + 14); for (let c = 0; c < v.cols; c++) { const x = X0 + 40 + cw * (c + 0.5); a.box(x - cw * 0.3, YF + 100, z + 14, x + cw * 0.3, YB - 30, z + rh * 0.75); a.ycyl(YF + 90, YF + 100, x, z + rh * 0.5, cw * 0.18, 12); lamp(a, x + cw * 0.15, z + rh * 0.66, 6, YF + 90, 8); a.tube([[x, YF + 100, z + 14], [x + 0.01, YF + 130, z - 4], [x - 0.01, YF + 140, z + 14]], [3, 3, 3], 5); } a.rect(X0 + 20, YF + 40, X1 - 20, YB - 30, 'EQUIP-DETAIL'); }
      a.log('Added the back panel, ' + v.rows + ' shelf rails, ' + v.n + ' lamp cradles with lamp bodies, lenses and charge lights, the header rail and the foot rail (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine mobile substation skid',
    desc: (v) => `Mobile mine substation, ${v.kva} kVA, on a heavy skid with lifting eyes: a finned transformer tank with radiator banks on the sides, three bushings and surge arresters on the lid, a high-side cabinet and a low-side cabinet at the ends each with a hinged door, and a front working space.`,
    vs: [[500, 144, 72, 84], [1000, 168, 84, 96], [2000, 204, 96, 108], [3000, 240, 108, 120]].map(([kva, L, w, h]) => [`${kva} kVA`, L, w, h, 0, { kva }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      for (const y of [YF + 60, YB - 170]) a.box(X0, y, Z0, X1, y + 110, Z0 + 150); a.box(X0 + 80, YF + 60, Z0 + 60, X1 - 80, YB - 60, Z0 + 150);
      for (const x of [X0 + 120, X1 - 120]) for (const y of [YF + 100, YB - 100]) { a.tube([[x, y, Z0 + 150], [x, y, Z0 + 200], [x, y + 40, Z0 + 230]], [20, 20, 20], 8); }
      const cw = 520, tx0 = X0 + cw, tx1 = X1 - cw, tz1 = Z1 - 420;
      a.box(tx0, YF + 200, Z0 + 150, tx1, YB - 200, tz1); a.box(tx0 - 20, YF + 180, tz1, tx1 + 20, YB - 180, tz1 + 40);
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const y = YF + 240 + i * ((a.D - 480) / 6); a.box(s < 0 ? tx0 - 130 : tx1, y, Z0 + 250, s < 0 ? tx0 : tx1 + 130, y + (a.D - 480) / 6 - 18, tz1 - 100); }
      a.rect(tx0 - 130, YF + 240, tx0, YB - 240, 'EQUIP-DETAIL'); a.rect(tx1, YF + 240, tx1 + 130, YB - 240, 'EQUIP-DETAIL');
      for (let i = 0; i < 3; i++) { const y = cy + (i - 1) * 300, x = cx; a.cyl(x, y, tz1 + 40, tz1 + 90, 45, 12); for (let k = 0; k < 5; k++) a.cone(x, y, tz1 + 90 + k * 45, tz1 + 130 + k * 45, 65 - k * 6, 48 - k * 5, 12); a.circ(x, y, 60, 'EQUIP-DETAIL'); a.cyl(x + 150, y, tz1 + 40, tz1 + 300, 28, 10); }
      for (const [x0, x1, sgn] of [[X0 + 40, tx0 - 150, -1], [tx1 + 150, X1 - 40, 1]]) { a.box(x0, YF + 180, Z0 + 150, x1, YB - 180, Z1 - 200); a.rect(x0, YF + 180, x1, YB - 180, 'EQUIP-DETAIL'); a.box(x0 + 30, YF + 160, Z0 + 230, x1 - 30, YF + 180, Z1 - 280); a.rect(x0 + 30, YF + 160, x1 - 30, YF + 180, 'EQUIP-DETAIL'); a.box(sgn < 0 ? x1 - 90 : x0 + 40, YF + 130, (Z0 + Z1) / 2 - 90, sgn < 0 ? x1 - 50 : x0 + 80, YF + 160, (Z0 + Z1) / 2 + 90); a.box(x0 - 0, YF + 170, Z1 - 200, x1, YB - 170, Z1 - 170); }
      a.clear('working space', X0, YF - 1200, X1, YF, 40);
      a.log('Added the skid with lifting eyes, finned tank with radiator banks, three bushings with arresters, the two end cabinets with doors and handles, and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic flameproof junction box',
    desc: (v) => `Flameproof (hazardous-area) junction box, ${v.w} in across, a cast body with cooling ribs, a flanged cover held by ${v.bolts} bolts, two cable-entry hubs at the top and two at the bottom, and two mounting feet.`,
    vs: [[6, 8], [8, 8], [10, 10], [12, 12]].map(([w, bolts]) => [`${w} in, ${bolts} bolts`, w, 5, w + 3, 48, { w, bolts }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.box(X0 + 40, YB - 14, Z0 + 20, X1 - 40, YB, Z1 - 20); a.box(X0 + 20, YF + 40, Z0 + 40, X1 - 20, YB - 14, Z1 - 40);
      for (let i = 1; i < 6; i++) { a.box(X0 + 14, YF + 50, Z0 + 40 + i * ((Z1 - Z0 - 80) / 6), X1 - 14, YB - 20, Z0 + 46 + i * ((Z1 - Z0 - 80) / 6)); }
      a.box(X0 + 10, YF + 10, Z0 + 30, X1 - 10, YF + 40, Z1 - 30); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 14, 'EQUIP-DETAIL');
      for (let i = 0; i < v.bolts; i++) { const f = i / v.bolts, per = 4, side = m.floor(f * per), t = (f * per) % 1; const px = [X0 + 30 + (W - 60) * t, X1 - 30, X1 - 30 - (W - 60) * t, X0 + 30][side], pz = [Z1 - 38, Z1 - 38 - (Z1 - Z0 - 76) * t, Z0 + 38, Z0 + 38 + (Z1 - Z0 - 76) * t][side]; a.ycyl(YF, YF + 14, px, pz, 9, 8); }
      for (const s of [-1, 1]) { a.cyl(cx + s * W * 0.2, cy, Z1 - 40, Z1, 24, 10); a.cyl(cx + s * W * 0.2, cy, Z0, Z0 + 40, 24, 10); }
      a.log('Added the ribbed body, flanged cover with ' + v.bolts + ' bolts, four cable-entry hubs and the mounting feet (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic flameproof bulkhead light with guard',
    desc: (v) => v.shape === 'round' ? `Flameproof bulkhead light, ${v.dia} in round, with a cast base, a glass globe, a wire guard of ${v.ribs} ribs and two rings, and two cable-entry hubs.` : `Flameproof linear light, ${v.len} ft long, with a cast base, a glass tube cover, a wire guard of ribs and end caps with cable-entry hubs.`,
    vs: [['round, 6 in', 'round', 6, 6, 8], ['round, 9 in', 'round', 9, 8, 12], ['linear, 2 ft', 'linear', 2, 6, 10], ['linear, 4 ft', 'linear', 4, 6, 10]]
      .map(([l, shape, n, ribs]) => [l, shape === 'round' ? n : n * 12 + 4, shape === 'round' ? n + 4 : 6, shape === 'round' ? n + 4 : 6, 90, { shape, dia: n, len: n, ribs }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      if (v.shape === 'round') {
        const r = a.W / 2 - 10, zc = (Z0 + Z1) / 2; a.box(cx - r * 0.8, YB - 40, zc - r * 0.8, cx + r * 0.8, YB, zc + r * 0.8);
        a.ycyl(YB - 130, YB - 40, cx, zc, r * 0.8, 24); a.ell(cx, YB - 130, zc, r * 0.7, 80, r * 0.7, 20, 10); a.ycyl(YF + 20, YB - 130, cx, zc, r * 0.7, 24);
        for (let i = 0; i < v.ribs; i++) { const g = (i / v.ribs) * m.PI * 2; a.tube([[cx + m.cos(g) * r * 0.75, YB - 130, zc + m.sin(g) * r * 0.75], [cx + m.cos(g) * r * 0.9, YF + 40, zc + m.sin(g) * r * 0.9]], [3, 3], 5); }
        for (const y of [YB - 100, YF + 40]) { const pts = []; for (let i = 0; i <= 20; i++) { const g = i / 20 * m.PI * 2; pts.push([cx + m.cos(g) * r * 0.88, y, zc + m.sin(g) * r * 0.88]); } a.tube(pts, pts.map(() => 3), 5); }
        a.circ(cx, cy, r * 0.8, 'EQUIP-DETAIL');
      } else {
        const zc = (Z0 + Z1) / 2; a.box(X0 + 120, YB - 90, zc - 60, X1 - 120, YB, zc + 60);
        a.xcyl(X0 + 120, X1 - 120, YB - 120, zc, 70, 18); for (const x of [X0 + 120, X1 - 120]) { a.box(x - 120, YB - 190, zc - 80, x, YB - 20, zc + 80); a.cyl(x - 60, YB - 100, zc + 80, zc + 120 > Z1 ? Z1 : zc + 120, 22, 8); }
        for (let i = 0; i <= v.ribs; i++) { const x = X0 + 160 + i * ((W - 320) / v.ribs); a.tube([[x, YB - 90, zc - 90], [x, YF + 30, zc], [x, YB - 90, zc + 90]], [3, 3, 3], 5); }
        a.rect(X0 + 120, YB - 190, X1 - 120, YB, 'EQUIP-DETAIL');
      }
      a.log('Added the cast base, glass cover, wire guard and cable-entry hubs (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic flameproof motor starter enclosure',
    desc: (v) => `Flameproof motor starter, ${v.kw} kW rating: a heavy enclosure with a flanged door held by ${v.bolts} bolts, an isolator handle with a lock hasp, a window with two lamps, a bottom row of ${v.glands} cable glands, a rain hood and mounting feet.`,
    vs: [[30, 20, 24, 28, 12, 2], [75, 24, 26, 34, 14, 3], [150, 30, 28, 40, 16, 3], [300, 36, 30, 48, 18, 4], [500, 44, 32, 56, 22, 4]].map(([kw, w, d, h, bolts, glands]) => [`${kw} kW`, w, d, h, 12, { kw, bolts, glands }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      for (const x of [X0 + 40, X1 - 100]) a.box(x, YB - 25, Z0, x + 60, YB, Z1);
      a.box(X0 + 20, YF + 70, Z0 + 20, X1 - 20, YB - 25, Z1 - 60); a.box(X0, YF + 30, Z1 - 60, X1, YB - 15, Z1 - 20); a.prism([[X0 - 0, YF + 20], [X1, YF + 20], [X1, YB - 10], [X0, YB - 10]], Z1 - 20, Z1);
      a.box(X0 + 30, YF + 10, Z0 + 50, X1 - 30, YF + 70, Z1 - 90); a.rect(X0 + 30, YF + 10, X1 - 30, YF + 70, 'EQUIP-DETAIL');
      for (let i = 0; i < v.bolts; i++) { const f = i / v.bolts, side = m.floor(f * 4), t = (f * 4) % 1; const px = [X0 + 45 + (W - 90) * t, X1 - 45, X1 - 45 - (W - 90) * t, X0 + 45][side], pz = [Z1 - 105, Z1 - 105 - (Z1 - Z0 - 190) * t, Z0 + 65, Z0 + 65 + (Z1 - Z0 - 190) * t][side]; a.ycyl(YF - 6, YF + 10, px, pz, 11, 8); }
      win(a, cx - 130, Z1 - 330, cx + 130, Z1 - 210, YF + 0, 10); lamp(a, cx - 60, Z1 - 150, 14, YF + 0, 12); lamp(a, cx + 60, Z1 - 150, 14, YF + 0, 12);
      a.box(cx - 25, YF - 50, (Z0 + Z1) / 2 - 90, cx + 25, YF + 10, (Z0 + Z1) / 2 + 90); a.box(cx - 40, YF - 54, (Z0 + Z1) / 2 + 60, cx + 40, YF - 50, (Z0 + Z1) / 2 + 100);
      for (let i = 0; i < v.glands; i++) a.cyl(X0 + 120 + i * ((W - 240) / m.max(1, v.glands - 1)), a.cy, Z0 - 0.01 > Z0 ? Z0 : Z0 + 0.1, Z0 + 20, 22, 10);
      a.log('Added the enclosure, flanged door with ' + v.bolts + ' bolts, isolator handle with lock hasp, lamp window, cable glands, rain hood and mounting feet (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine trailing cable reel',
    desc: (v) => `Skid-mounted trailing cable reel for ${v.ft} ft of cable: a drum with two flanges and wound turns, a drive motor and gearbox at one end, a spooling guide on a cross bar, a fairlead roller at the front, a guard over the drive and a lockable slip-ring box.`,
    vs: [['500 ft', 500, 120, 84, 84], ['800 ft', 800, 144, 96, 96], ['1200 ft', 1200, 168, 108, 108]].map(([l, ft, L, d, h]) => [l, L, d, h, 0, { ft }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      for (const y of [YF + 100, YB - 200]) a.box(X0, y, Z0, X1, y + 100, Z0 + 160);
      const rr = a.H * 0.4 - 40, zc = Z0 + 200 + rr, L0 = X0 + 320, L1 = X1 - 1000;
      a.box(X0 + 100, YF + 100, Z0 + 160, X1 - 100, YB - 100, Z0 + 200);
      for (const x of [L0 - 60, L1 + 60]) a.box(x - 25, cy - 320, Z0 + 200, x + 25, cy + 320, zc + 40);
      a.xcyl(X0 + 60, L1 + 450, cy, zc, 45, 12);
      for (const x of [L0, L1]) a.tube([[x - 14, cy, zc], [x + 14, cy, zc]], [rr, rr], 24);
      a.tube([[L0, cy, zc], [L1, cy, zc]], [rr * 0.45, rr * 0.45], 20); a.tube([[L0 + 14, cy, zc], [L1 - 14, cy, zc]], [rr * 0.82, rr * 0.82], 20);
      a.box(L1 + 100, cy - 260, Z0 + 200, X1 - 100, cy + 260, zc + 220); a.xcyl(L1 + 110, X1 - 110, cy, zc + 0.01, 160, 14); a.rect(L1 + 100, cy - 260, X1 - 100, cy + 260, 'EQUIP-DETAIL');
      a.box(X0 + 120, cy - 150, zc - 110, L0 - 100, cy + 150, zc + 110); a.rect(X0 + 120, cy - 150, L0 - 100, cy + 150, 'EQUIP-DETAIL');
      a.xcyl(L0, L1, cy - 0, zc + rr + 60, 14, 8); a.xcyl(L0, L1, YF + 80, Z0 + 330, 40, 12);
      a.rect(L0, cy - rr, L1, cy + rr, 'EQUIP-DETAIL');
      a.log('Added the skid, two-flange drum with wound turns, drive motor and guard, spooling bar, fairlead roller and the slip-ring box (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine shaft signal panel',
    desc: (v) => `Wall signal panel for a mine shaft station: a steel cabinet with ${v.lamps} level indicator lamps in a column, ${v.lamps} push buttons beside them, a bell or horn grille, a hinged guard over a stop button and a nameplate strip.`,
    vs: [4, 6, 8].map((n) => [`${n} levels`, 14, 6, 12 + n * 4, 48, { lamps: n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); a.box(X0, YB - 50, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF + 20, YB - 50, 16);
      a.box(X0 + 16, YF + 28, Z0 + 16, X1 - 16, YB - 50, Z1 - 16); a.rect(X0 + 16, YF + 28, X1 - 16, YB - 50, 'EQUIP-DETAIL');
      const top = Z1 - 190, step = (top - Z0 - 150) / v.lamps;
      for (let i = 0; i < v.lamps; i++) { const z = top - step * (i + 0.5); lamp(a, X0 + 90, z, 18, YF + 8, 20); a.ycyl(YF + 8, YF + 28, X0 + 190, z, 18, 14); a.box(X0 + 140, YF + 20, z - 4, X0 + 150, YF + 28, z + 4); }
      for (let i = 0; i < 5; i++) a.box(X1 - 140, YF + 14, Z1 - 160 + i * 18, X1 - 60, YF + 28, Z1 - 150 + i * 18);
      win(a, cx - 70, Z1 - 60 > Z0 + 100 ? Z0 + 30 : Z0 + 30, cx + 70, Z0 + 75, YF + 10, 18); a.box(X1 - 140, YF - 6, Z0 + 40, X1 - 40, YF + 28, Z0 + 140); a.arc(X1 - 40, YF - 6, 100, 180, 270); a.ycyl(YF - 14, YF + 4, X1 - 90, Z0 + 90, 22, 14);
      a.log('Added the cabinet, frame, ' + v.lamps + ' level lamps with push buttons, the horn grille, nameplate strip and the guarded stop button (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic mine pit-top floodlight pole',
    desc: (v) => `Steel floodlight pole, ${v.ft} ft high, tapered from a base plate with anchor bolts and a handhole door to a head ring carrying ${v.lamps} floodlights, with a ladder-style climbing rung set on one side.`,
    vs: [[30, 4], [40, 6], [50, 8], [60, 10]].map(([ft, lamps]) => [`${ft} ft, ${lamps} lights`, 40, 40, ft * 12, 0, { ft, lamps }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, R = a.W / 2; cplan(a, R * 0.3); a.circ(cx, cy, R * 0.9, 'EQUIP-DETAIL'); a.outline();
      a.box(cx - 330, cy - 330, Z0, cx + 330, cy + 330, Z0 + 50); dots(a, cx, cy, Z0 + 50, Z0 + 90, 280, 8, 14, 6);
      const top = Z1 - 400; a.tube([[cx, cy, Z0 + 50], [cx, cy, top]], [150, 60], 12);
      a.box(cx - 55, cy - 150, Z0 + 250, cx + 55, cy - 100, Z0 + 700); a.rect(cx - 55, cy - 150, cx + 55, cy - 100, 'EQUIP-DETAIL');
      for (let z = Z0 + 800; z < top - 200; z += 300) a.xcyl(cx - 40, cx + 40, cy + 90 - 40 * (z - Z0) / (top - Z0), z, 6, 6);
      ring(a, cx, cy, top, R * 0.85, 12, 20); a.cone(cx, cy, top - 60, top, 90, 60, 12);
      for (let i = 0; i < v.lamps; i++) { const g = (i / v.lamps) * m.PI * 2, x = cx + m.cos(g) * R * 0.78, y = cy + m.sin(g) * R * 0.78; a.tube([[cx + m.cos(g) * R * 0.6, cy + m.sin(g) * R * 0.6, top], [x, y, top + 60]], [8, 8], 6); a.box(x - 100, y - 60, top + 40, x + 100, y + 60, top + 300); }
      a.log('Added the base plate with anchor bolts, tapered pole with handhole door and rungs, the head ring and ' + v.lamps + ' floodlights (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine surface ring main unit',
    desc: (v) => `Mine surface ring main unit with ${v.ways} ways in one steel tank, a cable box and a front panel per way, each with a switch handle, a position indicator window and a cable cover, a lifting eye and a plinth.`,
    vs: [2, 3, 4].map((ways) => [`${ways} way`, ways * 14 + 10, 36, 56, 0, { ways }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 120); a.box(X0 + 20, YF + 30, Z0 + 120, X1 - 20, YB - 20, Z1 - 40); a.box(X0 + 10, YF + 20, Z1 - 40, X1 - 10, YB - 10, Z1);
      const cw = (W - 80) / v.ways; for (let i = 0; i < v.ways; i++) { const x0 = X0 + 40 + i * cw; a.box(x0 + 10, YF + 10, Z0 + 140, x0 + cw - 10, YF + 30, Z1 - 70); a.rect(x0 + 10, YF + 10, x0 + cw - 10, YF + 30, 'EQUIP-DETAIL'); win(a, x0 + 40, Z1 - 330, x0 + cw - 40, Z1 - 250, YF + 6, 6); a.ycyl(YF - 24, YF + 10, x0 + cw / 2, Z1 - 450, 28, 12); a.box(x0 + 30, YF - 6, Z0 + 150, x0 + cw - 30, YF + 10, Z0 + 340); lamp(a, x0 + cw / 2, Z1 - 560, 10, YF + 6, 6); }
      a.ell((X0 + X1) / 2, a.cy, Z1 + 0.01 > Z1 ? Z1 - 22 : Z1 - 22, 26, 12, 22, 10, 5); a.clear('working space', X0, YF - 900, X1, YF, 40);
      a.log('Added the plinth, tank, ' + v.ways + ' front panels with switch handles, indicator windows and cable covers, the lifting eye and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic haul road proximity beacon post',
    desc: (v) => `Roadside beacon post, ${v.hft} ft high, with a weighted base block, a post with reflective bands, ${v.kind}.`,
    vs: [['4 ft, one amber lens', 4, 'one amber lens on top with a hood'], ['6 ft, strobe and solar panel', 6, 'a strobe lens on top and a tilted solar panel below it'], ['8 ft, two lenses and aerial', 8, 'two opposed lenses on a head box and a short aerial']]
      .map(([l, hft, kind]) => [l, 18, 18, hft * 12, 0, { hft, kind }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a; cplan(a, 100); a.outline();
      a.box(cx - 220, cy - 220, Z0, cx + 220, cy + 220, Z0 + 150); a.cyl(cx, cy, Z0 + 150, Z1 - 250, 40, 12);
      for (let z = Z0 + 300; z < Z1 - 350; z += 260) a.cyl(cx, cy, z, z + 90, 44, 12);
      if (v.hft === 8) { a.box(cx - 140, cy - 50, Z1 - 250, cx + 140, cy + 50, Z1 - 100); for (const s of [-1, 1]) a.ycyl(cy - 50 - 20, cy - 50, cx + s * 70, Z1 - 175, 38, 14); a.tube([[cx, cy, Z1 - 100], [cx, cy, Z1]], [6, 3], 6); }
      else { a.cyl(cx, cy, Z1 - 250, Z1 - 210, 55, 14); a.ell(cx, cy, Z1 - 210, 60, 60, 100, 12, 6); }
      if (v.hft === 6) a.prism([[cx - 140, cy], [cx + 140, cy], [cx + 140, cy + 80], [cx - 140, cy + 80]], Z1 - 500, Z1 - 470);
      a.log('Added the weighted base, post with reflective bands and ' + v.kind + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic conveyor emergency stop station',
    desc: (v) => `Conveyor emergency stop station: a cast box on a bracket with ${v.kind}, a red mushroom stop button inside a guard ring, a reset button and two cable hubs${v.cord ? ', and a pull-cord eye bolt on each side with the cord running out both ways' : ''}.`,
    vs: [['wall box', 'a flat back plate and two mounting ears', false], ['box with pull cord', 'a flat back plate and two mounting ears', true], ['box with pull cord and lamp', 'a flat back plate, two mounting ears and a status lamp', true]]
      .map(([l, kind, cord], i) => [l, cord ? 120 : 11, 6, 10, 40, { kind, cord, lamp: i === 2 }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      const bx = v.cord ? cx : cx, hw = 100; a.box(bx - hw, YB - 60, Z0, bx + hw, YB, Z1); a.box(bx - hw - 30, YB - 14, Z0 + 30, bx - hw, YB, Z1 - 30); a.box(bx + hw, YB - 14, Z0 + 30, bx + hw + 30, YB, Z1 - 30);
      a.box(bx - hw + 10, YF + 20, Z0 + 10, bx + hw - 10, YB - 60, Z1 - 10); a.rect(bx - hw + 10, YF + 20, bx + hw - 10, YB - 60, 'EQUIP-DETAIL');
      a.ycyl(YF, YF + 20, bx, Z1 - 90, 55, 18); a.ycyl(YF - 10, YF, bx, Z1 - 90, 38, 18); a.ycyl(YF + 10, YF + 20, bx, Z1 - 90, 66, 18); a.ycyl(YF + 18, YF + 22, bx, Z0 + 70, 20, 12);
      if (v.lamp) lamp(a, bx + 70, Z0 + 70, 15, YF + 18, 8);
      for (const s of [-1, 1]) a.cyl(bx + s * 55, cy, Z0, Z0 + 14, 12, 8);
      if (v.cord) for (const s of [-1, 1]) { const ex = bx + s * (hw + 30); a.ell(ex, YB - 20, (Z0 + Z1) / 2, 14, 14, 14, 8, 5); a.tube([[ex, YB - 20, (Z0 + Z1) / 2], [bx + s * (W / 2 - 4), YB - 20, (Z0 + Z1) / 2]], [3, 3], 5); }
      a.log('Added the cast box with mounting ears, guarded mushroom stop, reset button, cable hubs' + (v.cord ? ', the eye bolts and the pull cord' : '') + (v.lamp ? ' and the status lamp' : '') + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine battery charger bay',
    desc: (v) => `Floor charger bay for a ${v.cls} battery: a heavy cabinet with a hinged door, a meter and lamp panel, a charge-lead reel on a swing arm and a drip tray with rails, with the front working space.`,
    vs: [['small, 12 kW', 'small', 36, 28, 66], ['medium, 30 kW', 'medium', 48, 34, 72], ['large, 60 kW', 'large', 60, 40, 80]].map(([l, cls, w, d, h]) => [l, w, d, h, 0, { cls }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YF + 200, Z0, X1, YB, Z0 + 100); a.box(X0 + 20, YF + 220, Z0 + 100, X1 - 20, YB - 20, Z1 - 60); a.box(X0, YF + 200, Z1 - 60, X1, YB, Z1);
      doorFront(a, X0 + 60, Z0 + 150, cx + 60, Z1 - 200, false, 24); a.box(X0 + 60, YF + 200 - 22, Z0 + 150, cx + 60, YF + 200, Z1 - 200);
      win(a, cx + 120, Z1 - 330, X1 - 80, Z1 - 160, YF + 190, 12); for (const x of [cx + 180, X1 - 160]) lamp(a, x, Z1 - 420, 18, YF + 190, 12);
      a.tube([[X1 - 20, YB - 60, Z1 - 200], [X1 + 0.01 - 80, YB - 300, Z1 - 150], [X1 - 220, YF + 260, Z1 - 330]], [14, 14, 14], 8); a.cyl(X1 - 120, YB - 100, Z1 - 350, Z1 - 200, 100, 16);
      a.box(X0, YF, Z0, X1, YF + 200, Z0 + 40); for (const y of [YF, YF + 190]) a.box(X0, y, Z0 + 40, X1, y + 10, Z0 + 100); a.rect(X0, YF, X1, YF + 200, 'EQUIP-DETAIL');
      a.log('Added the cabinet with door and swing, meter and lamp panel, charge-lead reel on its swing arm and the drip tray with rails (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine surface drive cabinet lineup',
    desc: (v) => `Lineup of ${v.n} drive cabinets for a mine conveyor or fan: a base plinth, a hinged door per section with a handle, a vent panel at the top of each door, a ${v.n > 2 ? 'door-mounted keypad and display on the first section, ' : ''}lifting eyes and the front working space.`,
    vs: [2, 3, 4].map((n) => [`${n} sections`, n * 32, 36, 90, 0, { n }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 100);
      for (let i = 0; i < v.n; i++) { const x0 = X0 + (i * W) / v.n, x1 = X0 + ((i + 1) * W) / v.n; a.box(x0, YF + 30, Z0 + 100, x1, YB, Z1); a.line(x0, YF, x0, YB); a.box(x0 + 30, YF, Z0 + 140, x1 - 30, YF + 30, Z1 - 60); a.rect(x0 + 30, YF, x1 - 30, YF + 30, 'EQUIP-DETAIL'); a.box(x1 - 110, YF - 30, (Z0 + Z1) / 2 - 90, x1 - 70, YF, (Z0 + Z1) / 2 + 90); for (let k = 0; k < 7; k++) a.box(x0 + 80, YF - 4, Z1 - 140 + k * 10, x1 - 80, YF, Z1 - 134 + k * 10); a.ell((x0 + x1) / 2, a.cy, Z1 + 0, 24, 10, 20, 8, 4); }
      if (v.n > 2) { win(a, X0 + 100, Z1 - 400, X0 + 400, Z1 - 280, YF - 8, 8); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) a.box(X0 + 140 + c * 60, YF - 10, Z1 - 520 + r * 40, X0 + 180 + c * 60, YF, Z1 - 495 + r * 40); }
      a.clear('working space', X0, YF - 1070, X1, YF, 40);
      a.log('Added the plinth, ' + v.n + ' sections with hinged doors, handles and vent panels, lifting eyes' + (v.n > 2 ? ', the keypad and display' : '') + ' and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine overhead line pole',
    desc: (v) => `Wood-style overhead line pole, ${v.hft} ft above grade: a tapered pole with a base collar, a ${v.arm} in crossarm on two braces carrying three pin insulators, a top pin, a ground wire strap and a step bolt ladder on one side.`,
    vs: [[30, 72], [35, 96], [45, 120]].map(([hft, arm]) => [`${hft} ft, ${arm} in crossarm`, arm, 24, hft * 12, 0, { hft, arm }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); cplan(a, 150);
      a.cyl(cx, cy, Z0, Z0 + 150, 190, 14); a.tube([[cx, cy, Z0 + 150], [cx, cy, Z1 - 60]], [170, 110], 14);
      const za = Z1 - 400; a.box(X0 + 10, cy - 50, za, X1 - 10, cy + 50, za + 100); a.rect(X0 + 10, cy - 50, X1 - 10, cy + 50, 'EQUIP-DETAIL');
      for (const s of [-1, 1]) { a.tube([[cx + s * 20, cy, za - 650], [cx + s * 600 > 0 ? cx + s * 0 + s * (v.arm * IN / 2 - 150) : cx + s * (v.arm * IN / 2 - 150), cy, za + 20]], [14, 14], 6); }
      for (const x of [X0 + 120, cx, X1 - 120]) { a.cyl(x, cy, za + 100, za + 130, 30, 10); for (let k = 0; k < 3; k++) a.cone(x, cy, za + 130 + k * 50, za + 170 + k * 50, 55 - k * 6, 38 - k * 6, 12); a.cyl(x, cy, za + 280, za + 320, 10, 8); }
      a.cyl(cx, cy, Z1 - 60, Z1, 14, 8); a.cone(cx, cy, Z1 - 60, Z1 - 20, 40, 30, 10);
      for (let z = Z0 + 1800; z < Z1 - 700; z += 400) a.xcyl(cx - 90, cx + 90, cy - 150, z, 8, 6);
      a.box(cx + 120, cy - 25, Z0 + 150, cx + 150, cy + 25, Z1 - 600);
      a.log('Added the base collar, tapered pole, crossarm with braces, three pin insulators, top pin, ground strap and step bolts (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic mine telephone station',
    desc: (v) => `Mine telephone station in a ${v.kind} box: a hinged lid, a handset on a hook with a coiled cord, a keypad, a speaker grille and a flashing lamp on the top.`,
    vs: [['wall box', 'wall-mounted steel', 11, 14], ['wall box with beacon', 'wall-mounted steel', 11, 18], ['post box with beacon', 'post-mounted steel', 12, 22]].map(([l, kind, w, h], i) => [l, w, 7, h, i === 2 ? 36 : 48, { kind, beacon: i > 0, post: i === 2 }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      const zb = Z0 + (v.beacon ? 120 : 0); if (v.post) { a.cyl(cx, a.cy, Z0, zb + 40, 28, 10); a.box(X0 + 10, YB - 30, zb, X1 - 10, YB, zb + 400); }
      a.box(X0 + 10, YB - 60, zb, X1 - 10, YB, Z1 - (v.beacon ? 120 : 0)); a.box(X0, YF + 40, zb + 10, X1, YB - 60, Z1 - (v.beacon ? 130 : 10));
      a.rect(X0, YF + 40, X1, YB - 60, 'EQUIP-DETAIL');
      a.box(X0 + 40, YF + 20, zb + 40, X0 + 90, YF + 40, zb + (Z1 - zb) * 0.5); a.box(X0 + 90, YF + 30, zb + 40 + 90, X1 - 40, YF + 40, zb + 40 + 140);
      for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) a.box(cx - 10 + i * 40, YF + 24, zb + 40 + k * 36, cx + 20 + i * 40, YF + 40, zb + 66 + k * 36);
      a.tube([[X0 + 65, YF + 20, zb + 60], [X0 + 20, YF + 10, zb + 40], [X0 + 60, YF + 18, zb + 30]], [3, 3, 3], 5);
      if (v.beacon) { a.cyl(cx, a.cy, Z1 - 130, Z1 - 100, 50, 14); a.ell(cx, a.cy, Z1 - 100, 55, 55, 90, 12, 6); }
      a.log('Added the box, hinged lid, handset on its hook, keypad, speaker grille' + (v.beacon ? ' and the flashing lamp' : '') + (v.post ? ' on a post' : '') + ' (plan and 3D).');
    } }),
  // @@MINING
  // ===================================================== airfield, apron and hangar =====================================================
  fam({ cat: 'electrical/fixtures', title: 'Generic airfield elevated edge light',
    desc: (v) => `Elevated airfield edge light on a frangible stem, ${v.stem} in tall: a round base flange with bolts, a breakable coupling, a slim stem and a lens head with ${v.lens}.`,
    vs: [['taxiway, 14 in stem', 14, 'one all-round lens under a cap'], ['taxiway, 24 in stem', 24, 'one all-round lens under a cap'], ['runway edge, 14 in stem, two-way', 14, 'two opposed lens windows'], ['runway edge, 30 in stem, two-way', 30, 'two opposed lens windows'], ['threshold, 14 in stem, one-way', 14, 'one lens window facing forward and a back shield'], ['threshold, 24 in stem, one-way', 24, 'one lens window facing forward and a back shield']]
      .map(([l, stem, lens]) => [l, 12, 12, stem + 8, 0, { stem, lens, kind: l.split(',')[0] }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, R = a.W / 2; cplan(a, R * 0.5); a.outline();
      a.cyl(cx, cy, Z0, Z0 + 12, R * 0.95, 20); dots(a, cx, cy, Z0 + 12, Z0 + 20, R * 0.75, 8, 8, 6); a.cyl(cx, cy, Z0 + 12, Z0 + 60, R * 0.4, 14);
      a.cone(cx, cy, Z0 + 60, Z0 + 90, R * 0.25, R * 0.17, 12); a.cyl(cx, cy, Z0 + 90, Z1 - 75, R * 0.14, 10);
      const zl = Z1 - 75; a.cyl(cx, cy, zl, zl + 20, R * 0.35, 16);
      if (v.kind.startsWith('taxiway')) { a.cyl(cx, cy, zl + 20, zl + 70, R * 0.32, 16); a.cone(cx, cy, zl + 70, Z1, R * 0.34, R * 0.1, 16); }
      else { a.box(cx - R * 0.3, cy - R * 0.3, zl + 20, cx + R * 0.3, cy + R * 0.3, Z1 - 5); for (const s of v.kind.startsWith('runway') ? [-1, 1] : [-1]) a.ycyl(cy + s * R * 0.3, cy + s * (R * 0.3 + 12), cx, zl + 50, 28, 12); a.ycyl(cy + R * 0.3, cy + R * 0.3 + 10, cx, zl + 50, 28, 12); if (v.kind.startsWith('threshold')) a.box(cx - R * 0.34, cy + R * 0.3, zl + 15, cx + R * 0.34, cy + R * 0.3 + 6, Z1 - 2); }
      a.log('Added the base flange with bolts, breakable coupling, stem and the lens head with ' + v.lens + ' (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic runway inset light',
    desc: (v) => `In-pavement airfield light, ${v.dia} in across: a flange ring with ${v.bolts} bolts, a low domed top, ${v.win} prism lens windows on the rim and a base can below with a cable gland.`,
    vs: [['centreline, 8 in, two lenses', 8, 6, 2], ['centreline, 12 in, two lenses', 12, 8, 2], ['stop bar, 8 in, one lens', 8, 6, 1], ['touchdown zone, 12 in, one lens', 12, 8, 1]].map(([l, dia, bolts, win]) => [l, dia + 4, dia + 4, 12, 0, { dia, bolts, win }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, R = v.dia * IN / 2; a.circ(cx, cy, R + 40); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.outline();
      a.cyl(cx, cy, Z0, Z0 + 150, R * 0.85, 22); a.cyl(cx, cy, Z0 + 150, Z0 + 200, R + 40, 28); dots(a, cx, cy, Z0 + 200, Z0 + 215, R * 0.88, v.bolts, 9, 6);
      a.cone(cx, cy, Z0 + 200, Z1 - 20, R * 0.8, R * 0.45, 22); a.cyl(cx, cy, Z1 - 20, Z1, R * 0.4, 18);
      for (let i = 0; i < v.win; i++) { const sx = v.win === 2 ? (i ? 1 : -1) : 1; a.box(cx + sx * R * 0.6 - 40, cy - 55, Z0 + 205, cx + sx * R * 0.6 + 40, cy + 55, Z0 + 270); a.rect(cx + sx * R * 0.6 - 40, cy - 55, cx + sx * R * 0.6 + 40, cy + 55, 'EQUIP-DETAIL'); }
      a.cyl(cx + R * 0.5, cy, Z0 - 0.01 + 0.01, Z0 + 20, 14, 8);
      a.log('Added the base can, flange ring with ' + v.bolts + ' bolts, domed top and ' + v.win + ' prism lens window(s) (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic approach light crossbar',
    desc: (v) => `Approach lighting crossbar on a frangible pole, ${v.hft} ft high: a base plate, a pole with a breakable coupling, a horizontal bar and ${v.n} lamp housings along it, each with a lens and a hood.`,
    vs: [['5 lamps, 4 ft', 5, 4], ['5 lamps, 8 ft', 5, 8], ['7 lamps, 10 ft', 7, 10], ['9 lamps, 14 ft', 9, 14]].map(([l, n, hft]) => [l, n * 14 + 10, 14, hft * 12 + 12, 0, { n, hft }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.box(cx - 150, cy - 150, Z0, cx + 150, cy + 150, Z0 + 30); a.cyl(cx, cy, Z0 + 30, Z0 + 200, 40, 12); a.cone(cx, cy, Z0 + 200, Z0 + 260, 55, 30, 12); a.cyl(cx, cy, Z0 + 260, Z1 - 110, 30, 12);
      a.box(X0 + 30, cy - 30, Z1 - 110, X1 - 30, cy + 30, Z1 - 80); a.tube([[cx, cy, Z1 - 110], [cx, cy, Z1 - 80]], [40, 40], 8);
      const sp = (W - 80) / v.n; for (let i = 0; i < v.n; i++) { const x = X0 + 40 + sp * (i + 0.5); a.box(x - 120, cy - 90, Z1 - 80, x + 120, cy + 90, Z1 - 10); a.ycyl(cy - 110, cy - 90, x, Z1 - 45, 50, 16); a.box(x - 125, cy - 120, Z1 - 20, x + 125, cy - 85, Z1); a.rect(x - 120, cy - 90, x + 120, cy + 90, 'EQUIP-DETAIL'); }
      a.log('Added the base plate, breakable coupling, pole, crossbar and ' + v.n + ' lamp housings with lenses and hoods (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic apron high-mast light pole',
    desc: (v) => `Apron high-mast pole, ${v.ft} ft high: a base plate with a ring of anchor bolts, a tapered pole with a handhole door, a lowering-ring head and a ring of ${v.lamps} floodlights, with a small cable block on the head.`,
    vs: [[40, 6], [60, 8], [80, 10], [100, 12]].map(([ft, lamps]) => [`${ft} ft, ${lamps} lights`, 66, 66, ft * 12, 0, { ft, lamps }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a, R = a.W / 2; cplan(a, 200); a.outline();
      a.cyl(cx, cy, Z0, Z0 + 50, R * 0.85, 20); dots(a, cx, cy, Z0 + 50, Z0 + 100, R * 0.7, 12, 20, 6); const top = Z1 - 600;
      a.tube([[cx, cy, Z0 + 50], [cx, cy, top]], [R * 0.3, R * 0.1], 16); a.box(cx - 100, cy - R * 0.28, Z0 + 250, cx + 100, cy - R * 0.2, Z0 + 900); a.rect(cx - 100, cy - R * 0.28, cx + 100, cy - R * 0.2, 'EQUIP-DETAIL');
      ring(a, cx, cy, top - 80, R * 0.7, 25, 24); a.cone(cx, cy, top - 40, top + 30, 160, 60, 12);
      for (let i = 0; i < v.lamps; i++) { const g = (i / v.lamps) * m.PI * 2, x = cx + m.cos(g) * R * 0.66, y = cy + m.sin(g) * R * 0.66; a.tube([[cx + m.cos(g) * 150, cy + m.sin(g) * 150, top - 80], [x, y, top - 80]], [14, 14], 6); a.box(x - 120, y - 50, top - 20, x + 120, y + 50, top + 420); a.rect(x - 120, y - 50, x + 120, y + 50, 'EQUIP-DETAIL'); }
      a.log('Added the base plate with anchor bolts, tapered pole with handhole door, lowering ring and ' + v.lamps + ' floodlights (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic apron ground-power pedestal',
    desc: (v) => `Apron ground-power pedestal, ${v.kva} kVA: a base plate, a cabinet with a hinged door and handle, ${v.cables} stowed cable${v.cables > 1 ? 's' : ''} looped on side hooks, ${v.cables} connector holster${v.cables > 1 ? 's' : ''}, a status lamp and a vent grille, with two guard bollards in front.`,
    vs: [[90, 1], [90, 2], [180, 1], [180, 2]].map(([kva, cables]) => [`${kva} kVA, ${cables} cable${cables > 1 ? 's' : ''}`, 30 + cables * 6, 24, 54, 0, { kva, cables }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0 + 20, YF + 140, Z0, X1 - 20, YB, Z0 + 60); a.box(X0 + 120, YF + 160, Z0 + 60, X1 - 120, YB - 20, Z1 - 20); a.box(X0 + 100, YF + 150, Z1 - 20, X1 - 100, YB - 10, Z1);
      doorFront(a, X0 + 160, Z0 + 140, X1 - 160, Z1 - 160, false, 20); a.box(X0 + 160, YF + 138, Z0 + 140, X1 - 160, YF + 160, Z1 - 160);
      lamp(a, cx, Z1 - 100, 20, YF + 138, 14); for (let k = 0; k < 4; k++) a.box(X0 + 200, YF + 130, Z0 + 180 + k * 20, X0 + 340, YF + 138, Z0 + 190 + k * 20);
      for (let i = 0; i < v.cables; i++) { const x = i ? X1 - 60 : X0 + 60; a.box(x - 25, YF + 160, Z0 + 300, x + 25, YF + 260, Z0 + 340); const pts = []; for (let k = 0; k <= 16; k++) { const t = k / 16 * m.PI * 2; pts.push([x + m.cos(t) * 40, YF + 200 - m.sin(t) * 0, Z0 + 520 + m.sin(t) * 150]); } a.tube(pts, pts.map(() => 14), 8); a.box(x - 35, YF + 20, Z0 + 840, x + 35, YF + 140, Z0 + 940); a.circ(x, YF + 80, 40, 'EQUIP-DETAIL'); }
      for (const x of [X0 + 120, X1 - 120]) { a.cyl(x, YF + 60, Z0, Z0 + 600, 40, 12); a.circ(x, YF + 60, 40); }
      a.log('Added the base plate, cabinet with door and swing, status lamp, vent grille, ' + v.cables + ' stowed cable(s) with holster(s) and the guard bollards (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic apron ground-power pit',
    desc: (v) => `Flush apron ground-power pit with a ${v.w} in cover: a steel frame in the slab, ${v.lids} hinged tread-plate lid${v.lids > 1 ? 's' : ''} with a lifting recess and a hinge, and a drain slot, over a box below with two cable hubs.`,
    vs: [['one lid, 30 in', 30, 24, 1], ['two lids, 36 in', 36, 30, 2], ['two lids, 48 in', 48, 30, 2]].map(([l, w, d, lids]) => [l, w, d, 14, -10, { w, lids }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); const zt = Z1 - 150;
      a.box(X0 + 40, YF + 40, Z0, X1 - 40, YB - 40, Z1 - 60); a.frame(X0, zt - 20, X1, Z1, YF, YB, 0.01);
      a.box(X0, YF, Z1 - 60, X1, YF + 40, Z1); a.box(X0, YB - 40, Z1 - 60, X1, YB, Z1); a.box(X0, YF, Z1 - 60, X0 + 40, YB, Z1); a.box(X1 - 40, YF, Z1 - 60, X1, YB, Z1);
      const lw = (W - 80) / v.lids; for (let i = 0; i < v.lids; i++) { const x0 = X0 + 40 + i * lw; a.box(x0 + 4, YF + 44, Z1 - 80, x0 + lw - 4, YB - 44, Z1 - 20); for (let k = 0; k < 8; k++) a.box(x0 + 40 + k * ((lw - 80) / 8), YF + 60, Z1 - 20, x0 + 40 + k * ((lw - 80) / 8) + 12, YB - 60, Z1 - 12); a.rect(x0 + 4, YF + 44, x0 + lw - 4, YB - 44, 'EQUIP-DETAIL'); a.box(x0 + lw / 2 - 50, YF + 120, Z1 - 24, x0 + lw / 2 + 50, YF + 160, Z1 - 20); a.box(x0 + 30, YB - 46, Z1 - 60, x0 + 90, YB - 40, Z1 - 20); }
      for (const x of [cx - 60, cx + 60]) a.cyl(x, YB - 40, Z0 - 0.01 > Z0 ? Z0 : Z0, Z0 + 60, 22, 8);
      a.log('Added the in-slab frame, ' + v.lids + ' hinged tread-plate lid(s) with lifting recesses and hinges, the box below and the cable hubs (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic hangar linear high-bay luminaire',
    desc: (v) => `Hangar linear high-bay luminaire, ${v.len} ft long: a ribbed reflector with two end caps, a driver box on top, a lens strip below and two chain hangers to a ceiling plate, hung at hangar height.`,
    vs: [4, 6, 8, 10].map((len) => [`${len} ft`, len * 12 + 3, 14, 30, 400, { len }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      a.prism([[X0 + 20, cy - 70], [X1 - 20, cy - 70], [X1 - 20, cy + 70], [X0 + 20, cy + 70]], Z0, Z0 + 20); for (let i = 0; i < 5; i++) { const t = i / 4; a.box(X0 + 20, cy - 175 + t * 100, Z0 + 20 + t * 5, X1 - 20, cy - 165 + t * 100, Z0 + 140 - t * 20); }
      a.box(X0 + 20, cy - 175, Z0 + 140, X1 - 20, cy + 175, Z0 + 160);
      for (const s of [-1, 1]) a.box(X0 + 20, cy - 175, Z0 + 20, X1 - 20, cy - 155, Z0 + 160 > Z1 ? Z1 : Z0 + 160);
      a.box(X0 + 20, cy + 155, Z0 + 20, X1 - 20, cy + 175, Z0 + 160); a.box(X0 + 10, cy - 150, Z0 + 0, X0 + 20, cy + 150, Z0 + 140); a.box(X1 - 20, cy - 150, Z0, X1 - 10, cy + 150, Z0 + 140);
      a.box(cx - 220, cy - 80, Z0 + 160, cx + 220, cy + 80, Z0 + 240);
      for (const x of [X0 + 350, X1 - 350]) { a.tube([[x, cy, Z0 + 160], [x, cy, Z1 - 20]], [6, 6], 6); a.box(x - 50, cy - 50, Z1 - 20, x + 50, cy + 50, Z1); }
      a.rect(X0 + 20, cy - 175, X1 - 20, cy + 175, 'EQUIP-DETAIL');
      a.log('Added the lens strip, ribbed reflector, end caps, driver box and two chain hangers with ceiling plates (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic PAPI light bar unit',
    desc: (v) => `Precision approach path indicator assembly of ${v.boxes} light housing${v.boxes > 1 ? 's' : ''} on frangible legs: each housing is a box with a hood and two lens openings on the front, mounted on a bar over three legs with base plates.`,
    vs: [['one housing', 1], ['two housings', 2], ['four housings', 4]].map(([l, boxes]) => [l, boxes * 26 + 10, 20, 44, 0, { boxes }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline();
      const zb = Z0 + 560, bw = (W - 80) / v.boxes;
      for (const f of v.boxes === 1 ? [0.2, 0.8] : [0.08, 0.5, 0.92]) { const x = X0 + W * f; a.box(x - 80, cy - 80, Z0, x + 80, cy + 80, Z0 + 20); a.cyl(x, cy, Z0 + 20, zb, 25, 10); a.cone(x, cy, Z0 + 120, Z0 + 170, 30, 40, 10); }
      a.box(X0 + 10, cy - 20, zb - 25, X1 - 10, cy + 20, zb);
      for (let i = 0; i < v.boxes; i++) { const x0 = X0 + 40 + i * bw; a.box(x0 + 10, YF + 30, zb, x0 + bw - 10, YB - 30, Z1 - 40); a.box(x0 + 0, YF + 20, Z1 - 40, x0 + bw, YB - 20, Z1 - 20); a.rect(x0 + 10, YF + 30, x0 + bw - 10, YB - 30, 'EQUIP-DETAIL'); for (const s of [-1, 1]) a.ycyl(YF + 18, YF + 32, x0 + bw / 2 + s * bw * 0.22, zb + 190, bw * 0.17, 16); a.box(x0 - 5, YF, Z1 - 20, x0 + bw + 5, YF + 40, Z1); }
      a.log('Added the base plates, three frangible legs, the bar and ' + v.boxes + ' light housing(s) with hoods and paired lens openings (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic rotating airfield beacon',
    desc: (v) => `Rotating airfield beacon: ${v.kind}, a lamp head with two opposed lens bells and a rotating base, a catwalk ring and a lightning rod on top.`,
    vs: [['on a 6 ft stand', 'a short stand with base plate', 72, 20], ['on a 12 ft mast', 'a tapered mast with step rungs', 144, 24], ['on a 20 ft tower', 'a lattice tower with a ladder and a platform', 240, 40]].map(([l, kind, h, w]) => [l, w, w, h + 30, 0, { kind, hh: h, tower: h > 200, mast: h > 100 && h < 200 }]),
    build: (a, v) => {
      const { X0, X1, Z0, Z1, cx, cy } = a, R = a.W / 2; cplan(a, R * 0.4); a.outline();
      const zt = Z1 - 600; a.box(cx - R * 0.9, cy - R * 0.9, Z0, cx + R * 0.9, cy + R * 0.9, Z0 + 40);
      if (v.tower) { for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) a.tube([[cx + sx * R * 0.85, cy + sy * R * 0.85, Z0 + 40], [cx + sx * R * 0.4, cy + sy * R * 0.4, zt]], [20, 16], 8); for (let z = Z0 + 500; z < zt - 100; z += 500) { const f = 0.85 - 0.45 * (z - Z0) / (zt - Z0); a.box(cx - R * f, cy - R * f - 6, z, cx + R * f, cy - R * f + 6, z + 20); a.box(cx - R * f, cy + R * f - 6, z, cx + R * f, cy + R * f + 6, z + 20); } a.box(cx - R * 0.55, cy - R * 0.55, zt - 30, cx + R * 0.55, cy + R * 0.55, zt); }
      else a.tube([[cx, cy, Z0 + 40], [cx, cy, zt]], [v.mast ? R * 0.35 : R * 0.2, v.mast ? R * 0.18 : R * 0.15], 12);
      a.cyl(cx, cy, zt, zt + 90, R * 0.35, 18); ring(a, cx, cy, zt + 90, R * 0.5, 8, 20);
      a.box(cx - 150, cy - 40, zt + 90, cx + 150, cy + 40, zt + 260);
      for (const s of [-1, 1]) { a.tube([[cx + s * 150, cy, zt + 175], [cx + s * 260, cy, zt + 175]], [90, 70], 16); }
      a.tube([[cx, cy, zt + 260], [cx, cy, Z1]], [14, 4], 6);
      a.log('Added the base, ' + v.kind + ', the lamp head with two lens bells, the catwalk ring and the lightning rod (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic lit airfield wind cone',
    desc: (v) => `Lit wind cone on a pole: a base plate, a ${v.hft} ft pole, a swivel arm, a ring frame and a ${v.cone} ft tapered sock of alternating bands, with ${v.fl} small floodlights on brackets at the top of the pole.`,
    vs: [[12, 6, 2], [15, 8, 4], [20, 12, 4]].map(([hft, cone, fl]) => [`${cone} ft sock, ${hft} ft pole`, cone * 12 + 40, 44, hft * 12 + 30, 0, { hft, cone, fl }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline();
      const px = X0 + 220, zt = Z1 - 500, R = 360; a.box(px - 300, cy - 300, Z0, px + 300, cy + 300, Z0 + 40); a.tube([[px, cy, Z0 + 40], [px, cy, zt]], [60, 36], 12);
      a.cyl(px, cy, zt, zt + 60, 70, 14); a.xcyl(px, px + 160, cy, zt + 90, 20, 8);
      const n = v.cone, L = (X1 - X0) - 440, zc = zt + 90; const rr = (t) => R * (1 - 0.65 * t);
      const ring0 = []; for (let i = 0; i <= 16; i++) { const g = i / 16 * m.PI * 2; ring0.push([px + 160, cy + m.cos(g) * R, zc + m.sin(g) * R]); }
      a.tube(ring0, ring0.map(() => 8), 5);
      for (let k = 0; k < 5; k++) { const t0 = k / 5, t1 = (k + 1) / 5; a.tube([[px + 160 + L * t0, cy, zc], [px + 160 + L * t1, cy, zc]], [rr(t0), rr(t1)], 20); }
      for (let i = 0; i < v.fl; i++) { const g = (i / v.fl) * m.PI * 2, x = px + m.cos(g) * 130, y = cy + m.sin(g) * 130; a.tube([[px, cy, zt - 20], [x, y, zt - 20]], [5, 5], 5); a.box(x - 30, y - 30, zt - 20, x + 30, y + 30, zt + 60); }
      a.circ(px, cy, 60); a.line(px, cy, X1 - 150, cy); a.ellp(X1 - 220, cy, 220, 330, 'EQUIP-DETAIL');
      a.log('Added the base plate, pole, swivel arm, ring frame, five-band tapered sock and the ' + v.fl + ' small floodlights (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic lit airfield guidance sign',
    desc: (v) => `Lit airfield guidance sign, ${v.mod} module${v.mod > 1 ? 's' : ''} wide and ${v.hh} in high: a sheet-metal cabinet with a front face panel and legend blocks, a rim, two or three frangible legs and a base plate, set on a low skirt.`,
    vs: [['1 module, 18 in', 1, 18], ['2 modules, 18 in', 2, 18], ['3 modules, 18 in', 3, 18], ['2 modules, 24 in', 2, 24], ['3 modules, 24 in', 3, 24]].map(([l, mod, hh]) => [l, mod * 24 + 4, 10, hh + 22, 0, { mod, hh }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); const zb = Z0 + 560;
      a.box(X0, YF + 30, zb, X1, YB - 20, Z1); a.box(X0 + 20, YF, zb + 20, X1 - 20, YF + 30, Z1 - 20); a.frame(X0 + 10, zb + 10, X1 - 10, Z1 - 10, YF - 4, YF + 4, 12);
      const mw = (W - 80) / v.mod; for (let i = 0; i < v.mod; i++) { const x0 = X0 + 40 + i * mw; a.line(x0, YF, x0, YB); a.box(x0 + 40, YF - 2, zb + 70, x0 + mw - 40, YF + 4, Z1 - 70); a.box(x0 + mw * 0.3, YF - 6, zb + 110, x0 + mw * 0.5, YF - 2, Z1 - 110); a.box(x0 + mw * 0.55, YF - 6, zb + 110, x0 + mw * 0.7, YF - 2, Z1 - 110); }
      a.box(X0 + 20, YF + 20, zb - 40, X1 - 20, YB - 30, zb); const legs = v.mod === 1 ? [0.3, 0.7] : [0.1, 0.5, 0.9];
      for (const f of legs) { const x = X0 + W * f; a.cyl(x, a.cy, Z0 + 40, zb - 40, 18, 8); a.cone(x, a.cy, Z0 + 20, Z0 + 40, 40, 30, 8); a.box(x - 70, a.cy - 70, Z0, x + 70, a.cy + 70, Z0 + 20); }
      a.log('Added the cabinet, front face panel, ' + v.mod + ' legend block pair(s), rim, frangible legs and base plates (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic hangar ceiling power and air reel drop',
    desc: (v) => `Hangar ceiling drop for aircraft work: a ceiling plate and a drop pipe carrying ${v.kind}, with a guide arm, a hook for the hose and a weighted handle.`,
    vs: [['one power reel', 1, false], ['power reel and air hose reel', 2, false], ['power, air and data reels', 3, true]].map(([l, n, data]) => [l, 14 + n * 16, 18, 60, 60, { n, data, kind: n === 1 ? 'one cord reel' : n === 2 ? 'a power cord reel and an air hose reel' : 'a power cord reel, an air hose reel and a data cable reel' }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy, W } = a; a.outline(); a.box(X0 + 30, cy - 120, Z1 - 30, X1 - 30, cy + 120, Z1);
      a.tube([[cx, cy, Z1 - 30], [cx, cy, Z1 - 400]], [40, 40], 12); a.box(X0 + 20, cy - 50, Z1 - 430, X1 - 20, cy + 50, Z1 - 400);
      const sp = (W - 40) / v.n; for (let i = 0; i < v.n; i++) { const x = X0 + 20 + sp * (i + 0.5), zc = Z1 - 600, rr = m.min(sp * 0.42, 180); a.tube([[x, cy - 70, zc], [x, cy + 70, zc]], [rr, rr], 20); a.tube([[x, cy - 40, zc], [x, cy + 40, zc]], [rr * 0.5, rr * 0.5], 14); a.ycyl(cy - 80, cy + 80, x, zc, rr * 0.2, 8); a.box(x - 8, cy - 80, Z1 - 430, x + 8, cy + 80, zc + rr * 0.9 > Z1 - 440 ? Z1 - 440 : zc + rr * 0.9); a.tube([[x, cy - 70, zc - rr], [x, cy - 70, Z0 + 180]], [8, 8], 6); a.box(x - 30, cy - 100, Z0 + 60, x + 30, cy - 40, Z0 + 190); }
      a.log('Added the ceiling plate, drop pipe, cross bar, ' + v.n + ' reel(s) with hubs, hanging cord(s) and the weighted handles (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic airfield obstruction light on mast',
    desc: (v) => `Obstruction light on a mast, ${v.hft} ft high: a base plate, a tubular mast with a ladder side rail, ${v.kind}, a lightning rod on top and a cable conduit down the side.`,
    vs: [['single red, 20 ft', 20, 'a single red lamp under a domed lens'], ['twin red, 20 ft', 20, 'two red lamps under domed lenses on a short crossarm'], ['twin red, 40 ft', 40, 'two red lamps under domed lenses on a short crossarm'], ['strobe head, 40 ft', 40, 'a strobe head with a clear lens and a guard ring']].map(([l, hft, kind], i) => [l, 24, 24, hft * 12, 0, { hft, kind, two: i === 1 || i === 2, strobe: i === 3 }]),
    build: (a, v) => {
      const { Z0, Z1, cx, cy } = a; cplan(a, 100); a.outline();
      a.box(cx - 250, cy - 250, Z0, cx + 250, cy + 250, Z0 + 30); a.tube([[cx, cy, Z0 + 30], [cx, cy, Z1 - 330]], [50, 32], 12);
      a.tube([[cx + 80, cy, Z0 + 30], [cx + 80, cy, Z1 - 380]], [10, 10], 6); a.xcyl(cx + 30, cx + 80, cy, Z0 + 600, 6, 5);
      for (let z = Z0 + 600; z < Z1 - 500; z += 400) a.xcyl(cx - 50, cx - 120, cy, z, 6, 6);
      const zl = Z1 - 330;
      if (v.strobe) { a.cyl(cx, cy, zl, zl + 60, 60, 14); a.cyl(cx, cy, zl + 60, zl + 200, 55, 16); ring(a, cx, cy, zl + 220, 70, 4, 16); a.cyl(cx, cy, zl + 200, zl + 220, 62, 14); }
      else if (v.two) { a.box(cx - 200, cy - 20, zl, cx + 200, cy + 20, zl + 40); for (const s of [-1, 1]) { a.cyl(cx + s * 170, cy, zl + 40, zl + 80, 50, 14); a.ell(cx + s * 170, cy, zl + 80, 50, 50, 70, 12, 6); } }
      else { a.cyl(cx, cy, zl, zl + 50, 60, 14); a.ell(cx, cy, zl + 50, 62, 62, 90, 12, 6); }
      a.tube([[cx, cy, zl + 220], [cx, cy, Z1]], [8, 3], 6);
      a.log('Added the base plate, mast with ladder rail and conduit, ' + v.kind + ' and the lightning rod (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic airfield lighting regulator cabinet',
    desc: (v) => `Floor-standing airfield lighting constant-current regulator cabinet, ${v.kw} kW: a plinth, a hinged front door with a handle, two round meters, a brightness selector knob, three lamps, side louvers and a conduit entry at the top, with the front working space.`,
    vs: [[4, 24, 24, 60], [7.5, 28, 26, 66], [15, 32, 28, 72], [30, 40, 30, 78], [70, 48, 32, 84]].map(([kw, w, d, h]) => [`${kw} kW`, w, d, h, 0, { kw }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline();
      a.box(X0, YF, Z0, X1, YB, Z0 + 80); a.box(X0 + 10, YF + 20, Z0 + 80, X1 - 10, YB - 10, Z1 - 40); a.box(X0, YF + 10, Z1 - 40, X1, YB, Z1);
      doorFront(a, X0 + 50, Z0 + 140, X1 - 50, Z1 - 120, false, 20); a.box(X0 + 50, YF - 2, Z0 + 140, X1 - 50, YF + 18, Z1 - 120);
      for (const f of [0.28, 0.72]) { a.ycyl(YF - 22, YF - 2, X0 + W * f, Z1 - 290, 60, 20); a.ycyl(YF - 26, YF - 22, X0 + W * f, Z1 - 290, 48, 20); }
      a.ycyl(YF - 22, YF - 2, cx, Z1 - 520, 36, 18); a.box(cx - 8, YF - 28, Z1 - 520 - 8, cx + 8, YF - 22, Z1 - 470);
      for (const dx of [-80, 0, 80]) lamp(a, cx + dx, Z1 - 680, 14, YF - 4, 14);
      for (let z = Z0 + 400; z < Z1 - 800; z += 50) { a.box(X0, YF + 100, z, X0 + 10, YB - 100, z + 22); a.box(X1 - 10, YF + 100, z, X1, YB - 100, z + 22); }
      a.clear('working space', X0, YF - 1070, X1, YF, 40);
      a.log('Added the plinth, cabinet, door with swing and handle, two meters, selector knob, three lamps, side louvers and the working space (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic aircraft ground-power converter cabinet',
    desc: (v) => `Floor-standing ground-power converter cabinet, ${v.kva} kVA, with a plinth, two hinged front doors, a vent grille band on each door, a cooling fan hood on top, a front status panel and two cable entry hubs.`,
    vs: [90, 180, 360].map((kva) => [`${kva} kVA`, kva === 90 ? 36 : kva === 180 ? 48 : 66, 30, 72, 0, { kva }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 80); a.box(X0 + 10, YF + 20, Z0 + 80, X1 - 10, YB - 10, Z1 - 150); a.box(X0, YF + 10, Z1 - 150, X1, YB, Z1 - 130);
      for (const s of [-1, 1]) { const x0 = s < 0 ? X0 + 40 : cx + 6, x1 = s < 0 ? cx - 6 : X1 - 40; a.box(x0, YF - 4, Z0 + 120, x1, YF + 20, Z1 - 200); a.rect(x0, YF - 4, x1, YF + 20, 'EQUIP-DETAIL'); for (let k = 0; k < 8; k++) a.box(x0 + 40, YF - 8, Z1 - 520 + k * 34, x1 - 40, YF - 4, Z1 - 505 + k * 34); a.box(s < 0 ? cx - 70 : cx + 30, YF - 30, Z0 + 700, s < 0 ? cx - 30 : cx + 70, YF - 4, Z0 + 940); a.arc(s < 0 ? X0 + 40 : X1 - 40, YF - 4, x1 - x0, s < 0 ? 270 : 180, s < 0 ? 360 : 270); }
      a.cyl(cx, a.cy, Z1 - 130, Z1 - 60, W * 0.22, 20); a.cyl(cx, a.cy, Z1 - 60, Z1 - 40, W * 0.24, 20); for (let i = 0; i < 4; i++) a.box(cx - W * 0.2, a.cy - 6 + (i - 1.5) * 0, Z1 - 100 - i * 0, cx + W * 0.2, a.cy + 6, Z1 - 100);
      win(a, X0 + 80, Z1 - 380, X0 + 320, Z1 - 280, YF - 8, 8); a.cyl(X1 - 220, YB - 120, Z1 - 130, Z1, 20, 8); a.cyl(X1 - 140, YB - 120, Z1 - 130, Z1 - 60, 20, 8);
      a.clear('working space', X0, YF - 1070, X1, YF, 40);
      a.log('Added the plinth, cabinet, two doors with swings, vent bands, handles, fan hood, status panel and cable entry hubs (plan and 3D).');
    } }),

  fam({ cat: 'electrical/equipment', title: 'Generic hangar wall utility drop box',
    desc: (v) => `Hangar wall utility box: a steel back box with ${v.items}, each under a spring flap, with a hinged cover, a label strip and mounting ears.`,
    vs: [['two power outlets and one air coupling', 'two round power outlets and one quick air coupling', 2, 1], ['three power outlets and two air couplings', 'three round power outlets and two quick air couplings', 3, 2], ['four power outlets, two air couplings and a data jack', 'four round power outlets, two quick air couplings and a data jack', 4, 2]]
      .map(([l, items, pw, air], i) => [l, 14 + i * 6, 6, 14, 48, { items, pw, air, data: i === 2 }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, W } = a; a.outline(); a.box(X0, YB - 50, Z0, X1, YB, Z1); a.frame(X0 + 10, Z0 + 10, X1 - 10, Z1 - 10, YF + 10, YB - 50, 12);
      a.box(X0 + 30, YF + 30, Z0 + 30, X1 - 30, YB - 50, Z1 - 30); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 50, 'EQUIP-DETAIL');
      const n = v.pw + v.air + (v.data ? 1 : 0), sp = (W - 120) / n; let k = 0;
      for (let i = 0; i < n; i++) { const x = X0 + 60 + sp * (i + 0.5); if (i < v.pw) { a.ycyl(YF + 10, YF + 30, x, Z0 + 220, m.min(sp * 0.35, 40), 14); a.ycyl(YF - 4, YF + 10, x, Z0 + 220, m.min(sp * 0.26, 30), 14); } else if (i < v.pw + v.air) { a.ycyl(YF - 10, YF + 30, x, Z0 + 220, 18, 12); a.ycyl(YF - 20, YF - 10, x, Z0 + 220, 28, 12); } else { a.box(x - 22, YF + 20, Z0 + 195, x + 22, YF + 32, Z0 + 245); } }
      a.box(X0 + 40, YF + 20, Z1 - 100, X1 - 40, YF + 30, Z1 - 60); a.box(X0 - 30, YB - 14, Z0 + 40, X0, YB, Z1 - 40); a.box(X1, YB - 14, Z0 + 40, X1 + 0.5, YB, Z1 - 40);
      a.log('Added the back box, frame, hinged cover, ' + v.pw + ' power outlets' + (v.air ? ', ' + v.air + ' air couplings' : '') + (v.data ? ', the data jack' : '') + ' and the label strip (plan and 3D).');
    } }),

  fam({ cat: 'electrical/fixtures', title: 'Generic runway guard light pair',
    desc: (v) => `Runway guard light assembly: a post${v.sign ? ' with a lit sign face above' : ''} carrying a bar with two round lamp housings that flash in turn, each with a lens, a hood and a back plate, on a base plate with a handhole.`,
    vs: [['two lamps on a 4 ft post', 48, false, 28], ['two lamps on a 6 ft post', 72, false, 28], ['two lamps with sign face, 6 ft', 72, true, 36], ['elevated pair, 10 ft post', 120, false, 28]].map(([l, h, sign, w]) => [l, w, 14, h + 30, 0, { sign }]),
    build: (a, v) => {
      const { X0, X1, YF, YB, Z0, Z1, cx, cy } = a; a.outline(); a.box(cx - 180, cy - 180, Z0, cx + 180, cy + 180, Z0 + 30); a.cyl(cx, cy, Z0 + 30, Z1 - 520, 45, 12); a.box(cx - 40, cy - 50, Z0 + 150, cx + 40, cy - 45, Z0 + 400);
      const zb = Z1 - 360; if (v.sign) { a.box(cx - 150, cy - 20, zb - 330, cx + 150, cy + 20, zb - 20); a.box(cx - 130, cy - 24, zb - 310, cx + 130, cy - 20, zb - 40); }
      a.box(X0 + 20, cy - 25, zb - 5, X1 - 20, cy + 25, zb + 25);
      for (const s of [-1, 1]) { const x = cx + s * (a.W / 2 - 20 - 150); a.box(x - 140, cy + 20, zb - 100, x + 140, cy + 45, zb + 140); a.ycyl(cy - 90, cy + 20, x, zb + 20, 130, 22); a.ycyl(cy - 100, cy - 90, x, zb + 20, 100, 22); a.box(x - 140, cy - 100, zb + 120, x + 140, cy + 20, zb + 150); a.circ(x, cy - 30, 130, 'EQUIP-DETAIL'); }
      a.log('Added the base plate, post with handhole, the bar and the two round lamp housings with lenses, hoods and back plates' + (v.sign ? ' and the lit sign face' : '') + ' (plan and 3D).');
    } }),
  // @@AVIATION
];

export default FAMS;
