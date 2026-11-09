/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5 casework (2026-11-03): hospital, construction-site, earthmoving-yard, mine and aviation casework. 250 variants. */
import { fam, cab as cab0, pull, T, GAP, leaves, Acc, tbl as tbl0 } from './r4-kit.mjs';

const fams = [];
const P = (f) => { fams.push(fam(f)); };
const IN = 25.4;
const cnt = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const ft = (inch) => `${inch / 12} ft`;
/** cab() for a lower part only: h mm tall from the unit's floor, merged into a. */
function cab(a, o = {}, h = 0) {
  if (!h || h >= a.H) return cab0(a, o);
  const s = new Acc({ x: a.X0, y: a.YF, z: a.Z0, w: a.W, h }); cab0(s, o); a.t.push(...s.t); a.p.push(...s.p); a.cl.push(...s.cl); return a;
}
function tbl(a, o = {}, h = 0) {
  if (!h || h >= a.H) return tbl0(a, o);
  const s = new Acc({ x: a.X0, y: a.YF, z: a.Z0, w: a.W, h }); tbl0(s, o); a.t.push(...s.t); a.p.push(...s.p); a.cl.push(...s.cl); return a;
}
const D = 'EQUIP-DETAIL', HID = 'EQUIP-HIDDEN';

/** Extrude a convex outline given in (y, z) between x0 and x1. */
function prismX(a, poly, x0, x1) {
  let s = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; }
  const pl = s < 0 ? [...poly].reverse() : poly, n = pl.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x1, ...pl[0]], [x1, ...pl[i]], [x1, ...pl[i + 1]]]); a.t.push([[x0, ...pl[0]], [x0, ...pl[i + 1]], [x0, ...pl[i]]]); }
  for (let i = 0; i < n; i++) { const p = pl[i], q = pl[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
}
/** A thin plate lying on a sloped panel running from p0=[y,z] to p1=[y,z]; t0..t1 along it, th thick, off proud of it. */
function sl(a, x0, x1, p0, p1, t0, t1, th = 6, off = 0) {
  const dy = p1[0] - p0[0], dz = p1[1] - p0[1], len = Math.hypot(dy, dz), ny = -dz / len, nz = dy / len;
  const pt = (t, o) => [p0[0] + dy * t + ny * o, p0[1] + dz * t + nz * o];
  prismX(a, [pt(t0, off), pt(t1, off), pt(t1, off + th), pt(t0, off + th)], x0, x1);
}
/** A flat monitor on a post at (x, y), base z. */
function monitor(a, x, y, z, w = 340, h = 220) {
  a.box(x - 60, y - 40, z, x + 60, y + 40, z + 12); a.cyl(x, y, z + 12, z + 150, 14, 8);
  a.box(x - w / 2, y - 22, z + 150, x + w / 2, y + 4, z + 150 + h); a.rect(x - w / 2, y - 22, x + w / 2, y + 4, D);
}
/** Rolling wheels under a unit: four casters of height h. */
function wheels(a, h) { for (const [x, y] of [[a.X0 + 60, a.YF + 60], [a.X1 - 60, a.YF + 60], [a.X0 + 60, a.YB - 60], [a.X1 - 60, a.YB - 60]]) { a.caster(x, y, h); a.circ(x, y, 24, HID); } }
/** Pigeonhole / shelf grid, open front: cols x rows, set in a frame. */
function grid(a, x0, x1, y0, y1, z0, z1, cols, rows, t = 14) {
  a.box(x0, y1 - 8, z0, x1, y1, z1);
  for (let i = 0; i <= cols; i++) { const x = i === 0 ? x0 : i === cols ? x1 - t : x0 + ((x1 - x0 - t) * i) / cols; a.box(x, y0, z0, x + t, y1, z1); if (i > 0 && i < cols) a.line(x + t / 2, y0, x + t / 2, y1, D); }
  for (let j = 0; j <= rows; j++) { const z = j === 0 ? z0 : j === rows ? z1 - t : z0 + ((z1 - z0 - t) * j) / rows; a.box(x0, y0, z, x1, y1, z + t); }
}
/** Locker bank. o: cols, tiers (1|2), toe, vent, sloped (slope top), hook (door number plates), seat */
function lockers(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, tiers = o.tiers ?? 1, cols = o.cols, toe = o.toe ?? 100, topZ = o.sloped ? Z1 - 120 : Z1;
  a.outline(); a.box(X0, YF + 60, Z0, X1, YB, Z0 + toe); a.line(X0, YF + 60, X1, YF + 60, HID);
  a.box(X0, YF + 19, Z0 + toe, X1, YB, topZ);
  if (o.sloped) prismX(a, [[YF + 19, topZ], [YB, topZ], [YB, Z1], [YF + 19, topZ + 15]], X0, X1);
  const cw = W / cols, th = (topZ - Z0 - toe) / tiers;
  for (let c = 0; c < cols; c++) for (let k = 0; k < tiers; k++) {
    const x0 = X0 + cw * c + GAP, x1 = X0 + cw * (c + 1) - GAP, z0 = Z0 + toe + th * k + GAP, z1 = Z0 + toe + th * (k + 1) - GAP;
    a.box(x0, YF, z0, x1, YF + 19, z1); a.rect(x0, YF, x1, YF + 19, D);
    if (o.vent) for (let s = 0; s < 4; s++) { const z = z1 - 60 - s * 24; a.box(x0 + 30, YF - 3, z, x1 - 30, YF, z + 8); }
    if (o.vent) for (let s = 0; s < 3; s++) { const z = z0 + 60 + s * 24; a.box(x0 + 30, YF - 3, z, x1 - 30, YF, z + 8); }
    a.box(x1 - 55, YF - 14, (z0 + z1) / 2 - 40, x1 - 40, YF, (z0 + z1) / 2 + 40);
    a.box(x0 + 25, YF - 2, z1 - 180, x0 + 25 + 60, YF, z1 - 150);
    if (o.hook) a.box(x0 + 40, YF - 2, z1 - 120, x1 - 100, YF, z1 - 100);
  }
  for (let c = 1; c < cols; c++) a.line(X0 + cw * c, YF, X0 + cw * c, YB, D);
}
/** Four-post shelving: posts, shelves, optional wire rods, doors. o: shelves, wire, casters, solid (solid shelves), back */
function posts(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1 } = a, base = Z0 + (o.casters ?? 60), n = o.shelves ?? 5, pr = 16;
  a.outline();
  for (const [x, y] of [[X0 + 22, YF + 22], [X1 - 22, YF + 22], [X0 + 22, YB - 22], [X1 - 22, YB - 22]]) { a.cyl(x, y, o.casters ? Z0 + o.casters : Z0, Z1, pr, 8); a.circ(x, y, pr, D); }
  if (o.casters) wheels(a, o.casters);
  for (let i = 0; i < n; i++) {
    const z = base + ((Z1 - 40 - base) * i) / (n - 1 || 1);
    if (o.wire) {
      a.box(X0 + 10, YF + 10, z, X1 - 10, YF + 20, z + 14); a.box(X0 + 10, YB - 20, z, X1 - 10, YB - 10, z + 14);
      for (let x = X0 + 40; x < X1 - 30; x += 60) a.ycyl(YF + 14, YB - 14, x, z + 4, 3, 5);
    } else a.box(X0 + 10, YF + 10, z, X1 - 10, YB - 10, z + 18);
  }
  a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, D);
  if (o.back) a.box(X0 + 10, YB - 8, base, X1 - 10, YB, Z1);
}
/** Cockpit-style console surface helper handled in the family. */
/** Workbench. o: pegboard, vise, shelf, drawers, topT, power, heavy */
function bench(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, D: dep } = a, tz = o.topZ ?? Z0 + 900, tt = o.topT ?? 50, ls = o.heavy ? 50 : 40;
  a.outline();
  for (const x of [X0 + 40, X1 - 40 - ls]) for (const y of [YF + 40, YB - 40 - ls]) { a.box(x, y, Z0, x + ls, y + ls, tz - tt); a.rect(x, y, x + ls, y + ls, HID); }
  for (const y of [YF + 40, YB - 40 - ls / 2]) a.box(X0 + 40, y, tz - tt - 100, X1 - 40, y + ls / 2, tz - tt);
  a.box(X0 + 40, YF + 40 + ls, tz - tt - 100, X0 + 40 + ls / 2, YB - 40 - ls, tz - tt);
  a.box(X1 - 40 - ls / 2, YF + 40 + ls, tz - tt - 100, X1 - 40, YB - 40 - ls, tz - tt);
  a.box(X0, YF, tz - tt, X1, YB, tz);
  a.box(X0 + 40, YF + 40, Z0 + 180, X1 - 40, YB - 40, Z0 + 180 + (o.heavy ? 30 : 20)); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, HID);
  if (o.drawers) { const dw = Math.min(520, W * 0.4), x1 = X1 - 60; a.box(x1 - dw, YF + 30, Z0 + 250, x1, YB - 30, tz - tt - 20); for (let i = 0; i < o.drawers; i++) { const z1 = tz - tt - 30 - i * ((tz - tt - Z0 - 320) / o.drawers), z0 = z1 - (tz - tt - Z0 - 320) / o.drawers + 10; a.box(x1 - dw + 6, YF + 14, z0, x1 - 6, YF + 30, z1); pull(a, 'bar', x1 - dw / 2, (z0 + z1) / 2, YF + 14); } a.rect(x1 - dw, YF + 30, x1, YB - 30, D); }
  if (o.pegboard) { const ph = o.pegboard; a.box(X0 + 20, YB - 40, tz, X1 - 20, YB - 25, tz + ph); a.rect(X0 + 20, YB - 40, X1 - 20, YB - 25, D); for (let z = tz + 100; z < tz + ph - 60; z += 100) for (let x = X0 + 100; x < X1 - 80; x += 100) a.cyl(x, YB - 41, z, z + 0.01, 0.01, 3); a.box(X0 + 20, YB - 25, tz + ph - 60, X1 - 20, YB - 10, tz + ph - 40); for (let x = X0 + 160; x < X1 - 200; x += 360) a.box(x, YB - 50, tz + 200, x + 130, YB - 40, tz + 330); }
  if (o.vise) { const x = X0 + 260; a.box(x - 70, YF + 10, tz, x + 70, YF + 120, tz + 60); a.box(x - 20, YF - 90, tz + 10, x + 20, YF + 10, tz + 40); a.xcyl(x - 70, x + 70, YF - 90, tz + 25, 9, 8); a.rect(x - 70, YF + 10, x + 70, YF + 120, D); }
  if (o.power) { a.box(X0 + 600, YB - 80, tz, X1 - 600, YB - 30, tz + 50); a.rect(X0 + 600, YB - 80, X1 - 600, YB - 30, D); }
}
/** Drawer chest on casters. o: n drawers, casters, handle, foam, top (sloped lid), ribs */
function chest(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, cs = o.casters ?? 120, n = o.n, topH = o.lid ? 120 : 0, base = Z0 + cs;
  a.outline(); wheels(a, cs);
  a.box(X0, YF + T, base, X1, YB, Z1 - topH);
  if (o.lid) { a.box(X0 - 0, YF, Z1 - topH, X1, YB, Z1 - 20); a.box(X0 + 20, YF + 80, Z1 - 20, X1 - 20, YB - 80, Z1); a.rect(X0 + 20, YF + 80, X1 - 20, YB - 80, D); a.box(X0 + 120, YF - 30, Z1 - topH + 30, X1 - 120, YF, Z1 - topH + 60); }
  const fh = (Z1 - topH - base - 20) / n;
  for (let i = 0; i < n; i++) {
    const z1 = Z1 - topH - 10 - i * fh, z0 = z1 - fh + GAP * 2;
    a.box(X0 + 10, YF, z0, X1 - 10, YF + T, z1);
    if (o.foam) { a.box(X0 + 40, YF - 3, z0 + 12, X1 - 40, YF, z1 - 12); a.rect(X0 + 40, YF - 3, X1 - 40, YF, D); } else pull(a, 'bar', a.cx, (z0 + z1) / 2, YF);
    a.line(X0 + 10, YF, X1 - 10, YF, D);
  }
  a.box(X0 - 20, YF - 20, base + 30, X0, YF + 10, Z1 - topH - 60); a.box(X1, YF - 20, base + 30, X1 + 20, YF + 10, Z1 - topH - 60);
}

/** One run of a nurse station: staff work surface at 30 in with drawer pedestals, plus a 42 in transaction ledge on the public side ('f' front, 'l' left). */
function nurseRun(a, x0, y0, x1, y1, side, mon) {
  const Z0 = a.Z0, wz = Z0 + 762, lz = Z0 + 1067, led = 300;
  a.box(x0 + 20, y0 + 20, Z0, x1 - 20, y1 - 20, Z0 + 100);
  const px0 = side === 'l' ? x0 + led : x0, py0 = side === 'f' ? y0 + led : y0;
  a.box(px0, py0, Z0 + 100, x1, y1, wz - 40); a.box(x0, y0, wz - 40, x1, y1, wz);
  if (side === 'f') { a.box(x0, y0, Z0 + 100, x1, y0 + led, lz - 40); a.box(x0, y0, lz - 40, x1, y0 + led, lz); a.line(x0, y0 + led, x1, y0 + led, D); const n = Math.max(2, Math.round((x1 - x0) / 600)); for (let i = 1; i < n; i++) a.line(x0 + ((x1 - x0) * i) / n, y0, x0 + ((x1 - x0) * i) / n, y0 + led, D); }
  else { a.box(x0, y0, Z0 + 100, x0 + led, y1, lz - 40); a.box(x0, y0, lz - 40, x0 + led, y1, lz); a.line(x0 + led, y0, x0 + led, y1, D); const n = Math.max(2, Math.round((y1 - y0) / 600)); for (let i = 1; i < n; i++) a.line(x0, y0 + ((y1 - y0) * i) / n, x0 + led, y0 + ((y1 - y0) * i) / n, D); }
  // drawer fronts on the staff side (behind the work surface)
  const stf = side === 'f' ? [x0, y1] : [x1, y0];
  if (side === 'f') { const n = Math.max(1, Math.round((x1 - x0) / 1200)); for (let i = 0; i < n; i++) { const xa = x0 + ((x1 - x0) * (i + 0.5)) / n; a.box(xa - 220, y1 - 19, wz - 230, xa + 220, y1, wz - 50); pull(a, 'bar', xa, wz - 140, y1); } }
  else { const n = Math.max(1, Math.round((y1 - y0) / 1200)); for (let i = 0; i < n; i++) { const ya = y0 + ((y1 - y0) * (i + 0.5)) / n; a.box(x1 - 19, ya - 220, wz - 230, x1, ya + 220, wz - 50); } }
  if (mon) for (const m of mon) monitor(a, m[0], m[1], wz, 340, 210);
  a.rect(x0, y0, x1, y1, 'EQUIP');
}
P({ cat: 'casework/base', title: 'Generic hospital nurse station',
  desc: (v) => `Nurse station counter ${ft(v.w)} long: a public side with a 42 in transaction ledge over panelled risers, a 30 in staff work surface behind it, ${cnt(v.mon, 'monitor', 'monitors')} and drawer pedestals on the staff side.`,
  vs: [['8 ft', 96, 30, 42, 0, { mon: 2 }], ['10 ft', 120, 30, 42, 0, { mon: 2 }], ['12 ft', 144, 30, 42, 0, { mon: 3 }], ['16 ft', 192, 30, 42, 0, { mon: 4 }], ['20 ft', 240, 30, 42, 0, { mon: 5 }], ['24 ft', 288, 30, 42, 0, { mon: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB } = a, mons = Array.from({ length: v.mon }, (_, i) => [X0 + ((X1 - X0) * (i + 0.5)) / v.mon, YB - 150]);
    nurseRun(a, X0, YF, X1, YB, 'f', mons);
    a.log('Added the plinth, the panelled ledge risers, the 42 in ledge, the 30 in work surface, the drawer fronts and the monitors (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic hospital nurse station',
  desc: (v) => `L-shaped nurse station, ${ft(v.w)} by ${ft(v.d)}: two runs meeting at a corner, each with a 42 in transaction ledge on the public face and a 30 in staff work surface, drawer fronts and ${cnt(v.mon, 'monitor', 'monitors')}.`,
  vs: [['L-shaped, 10 by 6 ft', 120, 72, 42, 0, { mon: 2 }], ['L-shaped, 12 by 8 ft', 144, 96, 42, 0, { mon: 3 }], ['L-shaped, 16 by 10 ft', 192, 120, 42, 0, { mon: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB } = a, ld = 762, mons = [];
    for (let i = 0; i < v.mon - 1; i++) mons.push([X0 + ld + ((X1 - X0 - ld) * (i + 0.5)) / (v.mon - 1), YF + ld - 160]);
    mons.push([X0 + ld - 160, YF + (YB - YF) * 0.55]);
    nurseRun(a, X0, YF, X1, YF + ld, 'f', mons.slice(0, v.mon - 1)); nurseRun(a, X0, YF + ld, X0 + ld, YB, 'l', mons.slice(v.mon - 1));
    a.log('Added the two runs of the L, each with its raised ledge, work surface, drawer fronts and monitors (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic nurse station back counter',
  desc: (v) => `Charting back counter ${v.w} in wide: a base with ${v.doors} doors and a drawer row, a 36 in top and a ${v.upper ? 'row of open pigeonholes and a closed upper cabinet above' : 'splash and a rail for a clipboard'}.`,
  vs: [['48 in', 48, 24, 42, 0, { doors: 2 }], ['72 in', 72, 24, 42, 0, { doors: 3 }], ['72 in with upper cabinets', 72, 24, 84, 0, { doors: 3, upper: true }], ['96 in with upper cabinets', 96, 24, 84, 0, { doors: 4, upper: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bt = Z0 + 36 * IN;
    cab(a, { toe: 100, drawers: 1, drawerH: 150, drawerCols: v.doors, doors: v.doors, pull: 'bar', topT: 38, swing: true }, 914);
    if (!v.upper) { a.box(X0, YB - 40, bt, X1, YB, bt + 120); a.box(X0 + 30, YB - 70, bt + 100, X1 - 30, YB - 40, bt + 112); }
    else {
      a.box(X0 + 10, YB - 300, bt + 450, X1 - 10, YB, Z1 - 450); grid(a, X0 + 10, X1 - 10, YB - 300, YB, bt + 450, bt + 450 + 420, Math.round(W / 300), 2);
      a.box(X0 + 10, YB - 300, Z1 - 450, X1 - 10, YB, Z1); const L = leaves(X0 + 10, X1 - 10, v.doors > 3 ? 4 : 3);
      for (const lf of L) { a.box(lf.a, YB - 300 - T, Z1 - 450 + GAP, lf.b, YB - 300, Z1 - GAP); pull(a, 'bar', lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, Z1 - 225, YB - 300 - T); }
      a.rect(X0 + 10, YB - 300, X1 - 10, YB, D);
    }
    a.log(v.upper ? 'Added the drawer and door base, the top, the pigeonhole row and the closed upper cabinet (plan and 3D).' : 'Added the drawer and door base, the top, the splash and the clipboard rail (plan and 3D).');
  } });
// medication room
P({ cat: 'casework/base', title: 'Generic medication room base cabinet',
  desc: (v) => `Medication room base cabinet ${v.w} in wide: ${v.rows} locking drawers over ${cnt(v.doors, 'locking door', 'locking doors')}, a toe kick and a solid-surface style top with a back splash.`,
  vs: [['24 in', 24, 24, 36, 0, { rows: 3, doors: 1 }], ['30 in', 30, 24, 36, 0, { rows: 3, doors: 1 }], ['36 in', 36, 24, 36, 0, { rows: 4, doors: 2 }], ['48 in', 48, 24, 36, 0, { rows: 4, doors: 2 }], ['60 in', 60, 24, 36, 0, { rows: 4, doors: 3 }], ['72 in', 72, 24, 36, 0, { rows: 4, doors: 4 }]],
  build: (a, v) => { cab(a, { toe: 100, drawers: v.rows, drawerH: v.rows * 130, drawerCols: 1, doors: v.doors, lock: true, pull: v.doors < 2 ? 'knob' : 'bar', topT: 32, splash: { h: 100, t: 20 }, swing: true }); a.log('Added the locking drawers, the locking doors, the toe kick and the top with its splash (plan and 3D).'); } });
P({ cat: 'casework/wall', title: 'Generic medication room wall cabinet',
  desc: (v) => `Wall cabinet ${v.w} in wide for a medication room: ${cnt(v.doors, 'locking door', 'locking doors')} with a bar pull and a lock, an inside shelf, and a hidden plan outline.`,
  vs: [['24 in', 24, 12, 30, 54, { doors: 1 }], ['30 in', 30, 12, 30, 54, { doors: 2 }], ['36 in', 36, 12, 30, 54, { doors: 2 }], ['48 in', 48, 12, 30, 54, { doors: 2 }], ['48 in, 36 in high', 48, 12, 36, 48, { doors: 3 }]],
  build: (a, v) => { cab(a, { hidden: true, doors: v.doors, lock: true, pull: 'bar', swing: true }); a.box(a.X0 + T, a.YB - 200, a.Z0 + a.H / 2, a.X1 - T, a.YB - 20, a.Z0 + a.H / 2 + 18); a.log('Added the locking doors with lock cylinders and bar pulls (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic medication dispensing cabinet',
  desc: (v) => `Floor-standing medication dispensing cabinet, ${cnt(v.dr, 'lidded drawer', 'lidded drawers')} behind a locking front: a plinth, a work top with a monitor, a keypad and a locking drawer face for each drawer${v.tower ? ', plus a tall locking auxiliary tower' : ''}.`,
  vs: [['3 drawers', 30, 26, 56, 0, { dr: 3 }], ['5 drawers', 30, 26, 56, 0, { dr: 5 }], ['6 drawers with tower', 52, 26, 72, 0, { dr: 6, tower: true }], ['8 drawers with tower', 52, 26, 72, 0, { dr: 8, tower: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, mw = v.tower ? W - 560 : W, mx1 = X0 + mw, tz = Z0 + 900;
    a.outline(); a.box(X0 + 20, YF + 40, Z0, X1 - 20, YB, Z0 + 90);
    a.box(X0, YF + 19, Z0 + 90, mx1, YB, tz - 40); a.box(X0, YF, tz - 40, mx1, YB, tz);
    const rh = (tz - 40 - Z0 - 110) / v.dr; for (let i = 0; i < v.dr; i++) { const z1 = tz - 50 - i * rh, z0 = z1 - rh + 6; a.box(X0 + 10, YF, z0, mx1 - 10, YF + 19, z1); a.box(X0 + mw / 2 - 40, YF - 12, (z0 + z1) / 2 - 8, X0 + mw / 2 + 40, YF, (z0 + z1) / 2 + 8); a.box(mx1 - 90, YF - 4, z1 - 40, mx1 - 30, YF, z1 - 25); }
    monitor(a, X0 + mw * 0.4, YB - 120, tz, 300, 220); a.box(mx1 - 220, YF + 60, tz, mx1 - 80, YF + 180, tz + 20); a.rect(mx1 - 220, YF + 60, mx1 - 80, YF + 180, D);
    if (v.tower) { a.box(mx1 + 20, YF + 19, Z0 + 90, X1, YB, Z1); const L = leaves(mx1 + 20, X1, 1); for (const lf of L) { a.box(lf.a + 10, YF, Z0 + 110, lf.b - 10, YF + 19, Z1 - 20); pull(a, 'lock', lf.a + 60, Z0 + 1000); pull(a, 'vbar', lf.b - 50, Z0 + 1000); a.rect(lf.a, YF, lf.b, YF + 19, D); } a.line(mx1 + 20, YF, mx1 + 20, YB, D); }
    a.line(X0, YF + 19, mx1, YF + 19, D);
    a.log('Added the plinth, the drawer faces with locks, the top with monitor and keypad, and the tower if listed (plan and 3D).');
  } });
// exam room
P({ cat: 'casework/base', title: 'Generic exam room sink base cabinet',
  desc: (v) => `Exam room sink cabinet ${v.w} in wide: ${v.doors} doors and a false drawer front under a top with a rectangular sink basin, a gooseneck faucet and a splash.`,
  vs: [['36 in', 36, 24, 48, 0, { doors: 2 }], ['48 in', 48, 24, 48, 0, { doors: 2 }], ['60 in', 60, 24, 48, 0, { doors: 3 }], ['72 in', 72, 24, 48, 0, { doors: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, tz = Z0 + 36 * IN;
    cab(a, { toe: 100, drawers: 1, drawerH: 130, doors: v.doors, pull: 'bar', topT: 40, swing: true }, 914);
    a.box(X0, YB - 20, tz, X1, YB, tz + 120); a.line(X0, YB - 20, X1, YB - 20);
    const bx = 260; a.box(cx - bx, YF + 160, tz - 1, cx + bx, YB - 160, tz + 1); a.rect(cx - bx, YF + 160, cx + bx, YB - 160, D); a.rect(cx - bx + 20, YF + 180, cx + bx - 20, YB - 180, D);
    a.cyl(cx, YB - 110, tz, tz + 190, 14, 8); a.tube([[cx, YB - 110, tz + 190], [cx, YB - 200, tz + 280], [cx, YB - 320, tz + 240]], [12, 11, 10], 8); a.circ(cx, YB - 110, 14, D);
    a.log('Added the doors, the false drawer front, the sink basin, the gooseneck faucet and the splash (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic exam room wall cabinet',
  desc: (v) => `Exam room wall cabinet ${v.w} in wide with ${cnt(v.doors, 'glass-panel door', 'glass-panel doors')} in a frame, a mid shelf and a drawn hidden outline in plan.`,
  vs: [['24 in', 24, 12, 30, 54, { doors: 1 }], ['30 in', 30, 12, 30, 54, { doors: 2 }], ['36 in', 36, 12, 30, 54, { doors: 2 }], ['48 in', 48, 12, 30, 54, { doors: 2 }]],
  build: (a, v) => { cab(a, { hidden: true, doors: v.doors, glass: true, pull: 'knob', swing: true }); a.box(a.X0 + T, a.YB - 220, a.Z0 + a.H / 2, a.X1 - T, a.YB - 20, a.Z0 + a.H / 2 + 14); a.log('Added the framed glass-panel doors and the mid shelf (plan and 3D).'); } });
// sterile storage
P({ cat: 'casework/tall', title: 'Generic sterile storage wire rack',
  desc: (v) => `Sterile storage rack ${v.w} by ${v.d} in: four posts, ${v.shelves} wire shelves on rods with a front rail, a solid back panel and a plan outline.`,
  vs: [['36 by 18 in, 5 shelves', 36, 18, 74, 0, { shelves: 5 }], ['48 by 18 in, 5 shelves', 48, 18, 74, 0, { shelves: 5 }], ['48 by 24 in, 5 shelves', 48, 24, 74, 0, { shelves: 5 }], ['60 by 24 in, 5 shelves', 60, 24, 74, 0, { shelves: 5 }], ['48 by 24 in, 6 shelves, 84 in', 48, 24, 84, 0, { shelves: 6 }], ['60 by 24 in, 6 shelves, 84 in', 60, 24, 84, 0, { shelves: 6 }], ['72 by 24 in, 6 shelves, 84 in', 72, 24, 84, 0, { shelves: 6 }]],
  build: (a, v) => { posts(a, { shelves: v.shelves, wire: true, casters: 0, back: false }); a.box(a.X0 + 10, a.YB - 6, a.Z0 + 200, a.X1 - 10, a.YB, a.Z1); a.log('Added the corner posts, the wire shelves with rods and rails, and the back panel (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic sterile storage cabinet',
  desc: (v) => `Closed sterile supply cabinet ${v.w} in wide, ${v.h} in high: ${cnt(v.doors, 'full-height door', 'full-height doors')} with lock pulls, a toe kick, a sloped top and ${v.sh} inside shelves.`,
  vs: [['30 in', 30, 24, 84, 0, { doors: 2, sh: 4 }], ['36 in', 36, 24, 84, 0, { doors: 2, sh: 5 }], ['48 in', 48, 24, 84, 0, { doors: 2, sh: 5 }], ['48 in, 90 in high', 48, 24, 90, 0, { doors: 2, sh: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; cab(a, { toe: 100, doors: v.doors, pull: 'vbar', lock: true, swing: true });
    for (let i = 1; i <= v.sh; i++) { const z = Z0 + 100 + ((Z1 - Z0 - 120) * i) / (v.sh + 1); a.line(X0, YF + 8, X1, YF + 8, HID); a.box(X0 + 20, YF + 2, z, X1 - 20, YF + 3, z + 1); }
    a.log('Added the full-height doors with lock pulls, the toe kick and the swing arcs (plan and 3D).');
  } });
// pharmacy
P({ cat: 'casework/base', title: 'Generic pharmacy will-call counter',
  desc: (v) => `Pharmacy counter ${ft(v.w)} long: a 42 in customer side with a raised ledge and a panelled front, a 34 in pharmacist work surface behind it, ${cnt(v.win, 'pass-through window', 'pass-through windows')} with a sliding shelf and a monitor at each.`,
  vs: [['6 ft', 72, 36, 56, 0, { win: 1 }], ['8 ft', 96, 36, 56, 0, { win: 2 }], ['10 ft', 120, 36, 56, 0, { win: 2 }], ['12 ft', 144, 36, 56, 0, { win: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, lz = Z0 + 1070, wz = Z0 + 860, led = 340;
    a.outline(); a.box(X0 + 20, YF + 40, Z0, X1 - 20, YB - 20, Z0 + 100);
    a.box(X0, YF, Z0 + 100, X1, YF + led, lz - 40); a.box(X0, YF, lz - 40, X1, YF + led, lz); a.box(X0, YF + led, Z0 + 100, X1, YB, wz - 40); a.box(X0, YF + led, wz - 40, X1, YB, wz);
    a.line(X0, YF + led, X1, YF + led, D);
    for (let i = 0; i < v.win; i++) {
      const x = X0 + (W * (i + 0.5)) / v.win, ww = Math.min(1100, W / v.win - 200);
      a.frame(x - ww / 2, lz + 20, x + ww / 2, Z1 - 100, YF + led - 40, YF + led - 20, 40); a.box(x - ww / 2 + 40, YF + led - 32, lz + 60, x + ww / 2 - 40, YF + led - 28, Z1 - 140);
      a.box(x - ww / 2 + 100, YF + 60, lz, x + ww / 2 - 100, YF + 280, lz + 18); a.rect(x - ww / 2, YF + led - 40, x + ww / 2, YF + led - 20, D);
      monitor(a, x + ww / 2 - 160, YB - 120, wz, 320, 200);
    }
    a.box(X0, YF + led - 40, lz + 20, X1, YF + led - 20, lz + 40); a.box(X0, YF + led - 40, Z1 - 100, X1, YF + led - 20, Z1);
    a.log('Added the customer ledge and risers, the pharmacist work surface, the framed pass-through windows with sliding shelves and the monitors (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic pharmacy shelving cabinet',
  desc: (v) => `Pharmacy stock cabinet ${v.w} in wide: a tall open frame of shelves with ${v.dr} pull-out stock drawers in the lower bay, a rail at each shelf edge, a toe kick and a back panel.`,
  vs: [['30 in', 30, 24, 84, 0, { dr: 3 }], ['36 in', 36, 24, 84, 0, { dr: 4 }], ['48 in', 48, 24, 84, 0, { dr: 4 }], ['60 in', 60, 24, 84, 0, { dr: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a, lowZ = Z0 + 900;
    a.outline(); a.box(X0, YF + 60, Z0, X1, YB, Z0 + 100); a.box(X0, YB - 8, Z0 + 100, X1, YB, Z1); a.box(X0, YF, Z0 + 100, X0 + T, YB, Z1); a.box(X1 - T, YF, Z0 + 100, X1, YB, Z1); a.box(X0, YF, Z1 - T, X1, YB, Z1);
    for (let i = 0; i < 5; i++) { const z = lowZ + (Z1 - lowZ - T) * i / 4; a.box(X0 + T, YF + 20, z, X1 - T, YB, z + T); a.box(X0 + T, YF + 20, z + T, X1 - T, YF + 32, z + 70); }
    const rh = (lowZ - Z0 - 120) / v.dr; for (let i = 0; i < v.dr; i++) { const z1 = lowZ - 10 - i * rh, z0 = z1 - rh + 8; a.box(X0 + T + 4, YF, z0, X1 - T - 4, YF + T, z1); pull(a, 'bar', a.cx, (z0 + z1) / 2, YF); }
    a.rect(X0 + T, YF + 20, X1 - T, YB, D);
    a.log('Added the open shelves with edge rails, the pull-out stock drawers, the toe kick and the back panel (plan and 3D).');
  } });
// headwall
P({ cat: 'casework/wall', title: 'Generic patient headwall casework',
  desc: (v) => `Patient headwall unit ${v.w} in wide, ${v.h} in high: a back panel with a horizontal equipment rail, a cabinet with ${v.doors} doors at one end, a shelf over the bed head and a recessed service strip with six outlet plates.`,
  vs: [['60 in', 60, 12, 30, 40, { doors: 1 }], ['72 in', 72, 12, 30, 40, { doors: 2 }], ['84 in', 84, 12, 30, 40, { doors: 2 }], ['96 in, with 36 in high cabinet end', 96, 12, 36, 40, { doors: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, cw = Math.min(W * 0.36, 800), bx = X0 + cw;
    a.outline(HID); a.box(X0, YB - 60, Z0, X1, YB, Z1); a.line(X0, YB - 60, X1, YB - 60, D);
    a.box(X0, YF + 80, Z0, bx, YB - 60, Z1); const L = leaves(X0, bx, v.doors); for (const lf of L) { a.box(lf.a, YF + 60, Z0 + GAP, lf.b, YF + 80, Z1 - GAP); pull(a, 'bar', lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, Z0 + 150, YF + 60); a.rect(lf.a, YF + 60, lf.b, YF + 80, D); }
    a.box(bx, YB - 130, Z0 + 20, X1, YB - 60, Z0 + 140); a.xcyl(bx, X1, YB - 100, Z0 + 700, 14, 8); a.box(bx, YB - 100, Z0 + 600, bx + 20, YB - 60, Z0 + 700); a.box(X1 - 20, YB - 100, Z0 + 600, X1, YB - 60, Z0 + 700);
    a.box(bx + 40, YB - 200, Z1 - 60, X1 - 40, YB - 60, Z1);
    for (let i = 0; i < 6; i++) { const x = bx + 160 + ((X1 - bx - 320) * i) / 5; a.box(x - 36, YB - 135, Z0 + 40, x + 36, YB - 130, Z0 + 110); a.rect(x - 36, YB - 130, x + 36, YB - 60, D); }
    a.rect(bx, YB - 130, X1, YB - 60, D);
    a.log('Added the back panel, the doored cabinet end, the equipment rail, the shelf and the service strip with outlet plates (plan and 3D).');
  } });
// lab
P({ cat: 'casework/base', title: 'Generic laboratory bench base cabinet',
  desc: (v) => `Laboratory bench ${v.w} in long: a base of ${v.dr} drawers and ${v.doors} doors with a toe kick, a thick resin-style top with a drip edge and a ${v.rs ? 'reagent shelf rack on two posts above' : 'low back splash'}.`,
  vs: [['48 in', 48, 30, 36, 0, { dr: 3, doors: 1, rs: false }], ['60 in', 60, 30, 36, 0, { dr: 3, doors: 2, rs: false }], ['72 in', 72, 30, 36, 0, { dr: 4, doors: 2, rs: false }], ['72 in, reagent shelf', 72, 30, 64, 0, { dr: 4, doors: 2, rs: true }], ['96 in, reagent shelf', 96, 30, 64, 0, { dr: 4, doors: 3, rs: true }], ['120 in, reagent shelf', 120, 30, 64, 0, { dr: 4, doors: 4, rs: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bt = Z0 + 36 * IN;
    cab(a, { toe: 100, drawers: v.dr, drawerH: v.dr * 120, drawerCols: 1, doors: v.doors, pull: 'bar', topT: 38, swing: false }, 914);
    a.box(X0, YF + 6, bt - 38, X1, YF + 14, bt);
    if (!v.rs) a.box(X0, YB - 25, bt, X1, YB, bt + 90);
    else { for (const x of [X0 + 60, X1 - 90]) a.box(x, YB - 60, bt, x + 30, YB - 30, Z1); for (const z of [bt + 340, bt + 640]) { a.box(X0 + 60, YB - 280, z, X1 - 60, YB - 30, z + 20); a.box(X0 + 60, YB - 290, z + 20, X1 - 60, YB - 280, z + 70); } a.rect(X0 + 60, YB - 280, X1 - 60, YB - 30, D); }
    a.log(v.rs ? 'Added the drawers, the doors, the top with drip edge and the reagent shelf on posts (plan and 3D).' : 'Added the drawers, the doors, the top with drip edge and the splash (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic laboratory wall cabinet',
  desc: (v) => `Laboratory wall cabinet ${v.w} in wide with ${v.doors} framed glass sliding doors on a track, two inside shelves and a plan outline.`,
  vs: [['36 in', 36, 12, 30, 54, { doors: 2 }], ['48 in', 48, 12, 30, 54, { doors: 2 }], ['60 in', 60, 12, 36, 48, { doors: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(HID);
    a.box(X0, YF + 40, Z0, X0 + T, YB, Z1); a.box(X1 - T, YF + 40, Z0, X1, YB, Z1); a.box(X0, YF + 40, Z0, X1, YB, Z0 + T); a.box(X0, YF + 40, Z1 - T, X1, YB, Z1); a.box(X0, YB - 8, Z0, X1, YB, Z1);
    for (let i = 1; i <= 2; i++) a.box(X0 + T, YF + 60, Z0 + (a.H * i) / 3, X1 - T, YB, Z0 + (a.H * i) / 3 + 14);
    const dw = (W + 60) / v.doors; for (let i = 0; i < v.doors; i++) { const x0 = X0 + i * (dw - 60 / v.doors), y0 = YF + (i % 2 ? 20 : 4); a.frame(x0, Z0 + 30, x0 + dw, Z1 - 30, y0, y0 + 14, 30); a.box(x0 + 30, y0 + 6, Z0 + 60, x0 + dw - 30, y0 + 8, Z1 - 60); a.rect(x0, y0, x0 + dw, y0 + 14, D); }
    a.log('Added the cabinet shell, the two shelves and the glass sliding doors on offset tracks (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic hospital linen cabinet',
  desc: (v) => `Linen cabinet ${v.w} in wide, ${v.h} in high: a toe kick, ${cnt(v.doors, 'full-height louvered door', 'full-height louvered doors')} and a vent band, with a slatted shelf drawn behind.`,
  vs: [['30 in', 30, 24, 84, 0, { doors: 2 }], ['36 in', 36, 24, 84, 0, { doors: 2 }], ['48 in', 48, 24, 84, 0, { doors: 2 }]],
  build: (a, v) => { cab(a, { toe: 100, doors: v.doors, louver: true, pull: 'vbar', swing: true }); for (let i = 1; i < 6; i++) a.box(a.X0 + 30, a.YB - 20, a.Z0 + 100 + i * 280, a.X1 - 30, a.YB, a.Z0 + 118 + i * 280); a.log('Added the louvered full-height doors, the toe kick and the rear shelf lines (plan and 3D).'); } });

// ================================================================ construction site
P({ cat: 'casework/base', title: 'Generic site office file cabinet',
  desc: (v) => `Site office ${v.kind} file cabinet, ${v.w} in wide: ${cnt(v.n, 'full-width drawer', 'full-width drawers')} with label holders and bar pulls, a lock bar at the top, a plinth and a flat top.`,
  vs: [['vertical, 2 drawer', 15, 25, 29, 0, { n: 2, kind: 'vertical' }], ['vertical, 3 drawer', 15, 25, 40, 0, { n: 3, kind: 'vertical' }], ['vertical, 4 drawer', 15, 25, 52, 0, { n: 4, kind: 'vertical' }], ['lateral, 3 drawer, 36 in', 36, 20, 40, 0, { n: 3, kind: 'lateral' }], ['lateral, 4 drawer, 36 in', 36, 20, 52, 0, { n: 4, kind: 'lateral' }], ['lateral, 4 drawer, 42 in', 42, 20, 52, 0, { n: 4, kind: 'lateral' }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0 + 10, YF + 30, Z0, X1 - 10, YB, Z0 + 60); a.box(X0, YF + T, Z0 + 60, X1, YB, Z1);
    const rh = (Z1 - Z0 - 90) / v.n; for (let i = 0; i < v.n; i++) { const z1 = Z1 - 20 - i * rh, z0 = z1 - rh + 6; a.box(X0 + 8, YF, z0, X1 - 8, YF + T, z1); a.box(cx - 70, YF - 8, z1 - 30, cx + 70, YF, z1 - 12); a.box(cx - 55, YF - 1, z1 - 90, cx + 55, YF, z1 - 60); a.rect(cx - 55, YF - 1, cx + 55, YF, D); a.line(X0 + 8, YF, X1 - 8, YF, D); }
    a.box(X1 - 60, YF - 6, Z1 - 12, X1 - 20, YF, Z1 - 4); a.rect(X0 + 8, YF, X1 - 8, YF + T, D);
    a.log('Added the plinth, the drawer fronts with bar pulls and label holders, and the lock bar (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic site trailer overhead cabinet',
  desc: (v) => `Overhead cabinet ${v.w} in wide for a site trailer: ${cnt(v.doors, 'flip-up door', 'flip-up doors')} hinged at the top with gas struts, a recessed pull at the bottom edge and a hidden plan outline.`,
  vs: [['24 in', 24, 14, 16, 60, { doors: 1 }], ['36 in', 36, 14, 16, 60, { doors: 1 }], ['48 in', 48, 14, 18, 60, { doors: 2 }], ['60 in', 60, 14, 18, 60, { doors: 2 }], ['72 in', 72, 14, 18, 60, { doors: 3 }], ['96 in', 96, 14, 18, 60, { doors: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(HID); a.box(X0, YF + T, Z0, X1, YB, Z1);
    const L = leaves(X0, X1, v.doors); for (const lf of L) { a.box(lf.a, YF, Z0 + GAP, lf.b, YF + T, Z1 - GAP); pull(a, 'recess', (lf.a + lf.b) / 2, Z0 + 40, YF); a.rect(lf.a, YF, lf.b, YF + T, D); a.cyl(lf.a + 40, YF + 60, Z0 + 20, Z1 - 20, 6, 6); }
    a.line(X0, YF + T, X1, YF + T, D); a.log('Added the flip-up doors with recessed pulls and the gas struts (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic site office plan drawer cabinet',
  desc: (v) => `Flat drawing cabinet for a site office, ${v.n} shallow drawers: a plinth, ${v.n} fronts with a pull and label holder each, a top with a rail and a lock stile.`,
  vs: [['5 drawers', 43, 32, 16, 0, { n: 5 }], ['10 drawers', 43, 32, 38, 0, { n: 10 }], ['15 drawers', 43, 32, 54, 0, { n: 15 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, cx } = a; a.outline(); a.box(X0 + 10, YF + 40, Z0, X1 - 10, YB, Z0 + 70); a.box(X0, YF + T, Z0 + 70, X1, YB, Z1);
    const rh = (Z1 - Z0 - 90) / v.n; for (let i = 0; i < v.n; i++) { const z1 = Z1 - 15 - i * rh, z0 = z1 - rh + 5; a.box(X0 + 8, YF, z0, X1 - 8, YF + T, z1); a.box(cx - 90, YF - 8, z1 - rh * 0.6, cx + 90, YF, z1 - rh * 0.6 + 12); a.line(X0 + 8, YF, X1 - 8, YF, D); }
    a.box(X0 + 10, YF + 10, Z1, X1 - 10, YF + 30, Z1 + 0.5); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, D);
    a.log('Added the plinth, the shallow drawer fronts with pulls and the top (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic tool crib cabinet',
  desc: (v) => `Tool crib cabinet ${v.w} in wide: a steel carcass with two locking doors, a perforated panel and hooks inside, and a lower shelf, a hasp bar and a plinth.`,
  vs: [['30 in', 30, 18, 72, 0, {}], ['36 in', 36, 18, 72, 0, {}], ['48 in', 48, 18, 78, 0, {}], ['60 in', 60, 24, 78, 0, {}], ['72 in', 72, 24, 78, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; cab(a, { toe: 100, doors: 2, lock: true, pull: 'vbar', swing: true });
    a.box(X0 + 20, YB - 20, Z0 + 500, X1 - 20, YB - 12, Z1 - 100); for (let z = Z0 + 600; z < Z1 - 160; z += 120) for (let x = X0 + 80; x < X1 - 60; x += 180) a.box(x, YB - 60, z, x + 8, YB - 20, z + 8);
    a.box(X0 + 20, YB - 250, Z0 + 350, X1 - 20, YB - 20, Z0 + 366); a.rect(X0 + 20, YB - 250, X1 - 20, YB - 20, D);
    a.log('Added the locking doors, the perforated panel with hooks, the lower shelf and the plinth (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic tool crib counter',
  desc: (v) => `Tool crib counter ${ft(v.w)} long: a steel base with a drawer row, a 42 in counter top and a roll-up shutter frame above it with a shutter drum at the head.`,
  vs: [['6 ft', 72, 30, 84, 0, { doors: 3 }], ['8 ft', 96, 30, 84, 0, { doors: 4 }], ['10 ft', 120, 30, 84, 0, { doors: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 1067; cab(a, { toe: 100, drawers: 1, drawerH: 150, drawerCols: v.doors, doors: v.doors, pull: 'bar', topT: 40, swing: false }, 1067);
    a.box(X0, YF, tz - 10, X1, YB, tz + 20);
    for (const x of [X0, X1 - 60]) a.box(x, YB - 120, tz, x + 60, YB, Z1);
    a.box(X0, YB - 120, Z1 - 160, X1, YB, Z1); a.xcyl(X0 + 60, X1 - 60, YB - 150, Z1 - 80, 60, 14);
    for (let z = tz + 200; z < Z1 - 200; z += 60) a.box(X0 + 60, YB - 70, z, X1 - 60, YB - 40, z + 40); a.rect(X0 + 60, YB - 70, X1 - 60, YB - 40, D);
    a.log('Added the drawer and door base, the counter top, the shutter frame, slats and drum (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic rolling toolbox chest',
  desc: (v) => `Rolling toolbox chest ${v.w} in wide with ${cnt(v.n, 'ball-bearing style drawer', 'drawers')}, a hinged lid, side handles and four casters.`,
  vs: [['5 drawers, 27 in', 27, 18, 36, 0, { n: 5 }], ['7 drawers, 36 in', 36, 20, 40, 0, { n: 7 }], ['9 drawers, 41 in', 41, 22, 44, 0, { n: 9 }], ['11 drawers, 56 in', 56, 24, 46, 0, { n: 11 }]],
  build: (a, v) => { chest(a, { n: v.n, lid: true, casters: 110 }); a.log('Added the drawers with bar pulls, the hinged lid, the side handles and the casters (plan and 3D).'); } });
P({ cat: 'casework/base', title: 'Generic work site gang box',
  desc: (v) => `Steel work site storage box ${v.w} by ${v.d} in: a hinged lid with a hasp, an inside tray, side lift handles, corner ribs and four short legs.`,
  vs: [['36 by 18 in', 36, 18, 24, 0, {}], ['48 by 20 in', 48, 20, 28, 0, {}], ['60 by 24 in', 60, 24, 30, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) { a.box(x - 30, y - 30, Z0, x + 30, y + 30, Z0 + 80); a.rect(x - 30, y - 30, x + 30, y + 30, HID); }
    a.box(X0, YF, Z0 + 80, X1, YB, Z1 - 120); a.box(X0 - 0, YF, Z1 - 120, X1, YB, Z1 - 100); a.box(X0 + 10, YF + 10, Z1 - 100, X1 - 10, YB - 10, Z1); a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, D);
    for (const x of [X0 + 25, X1 - 25]) a.box(x - 12, YF - 6, Z0 + 150, x + 12, YF, Z1 - 160); a.box(cx - 50, YF - 14, Z1 - 200, cx + 50, YF, Z1 - 80); a.box(cx - 20, YF - 6, Z1 - 130, cx + 20, YF, Z1 - 100);
    for (let i = 1; i < 5; i++) a.line(X0 + (W * i) / 5, YF, X0 + (W * i) / 5, YB, D); a.xcyl(X0 - 0 + 40, X1 - 40, YB - 8, Z1 - 100, 8, 6);
    a.log('Added the legs, the box, the lid with hasp, the side handles and the ribs (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic site workbench',
  desc: (v) => `Site workbench ${ft(v.w)} long: a thick plank top on a welded steel frame with a lower shelf, a bench vise at the left end, a perforated back panel with a hook rail${v.dr ? ' and a drawer stack under the right end' : ''}.`,
  vs: [['4 ft', 48, 24, 66, 0, { dr: 0 }], ['6 ft', 72, 28, 66, 0, { dr: 0 }], ['8 ft, with drawers', 96, 30, 66, 0, { dr: 3 }], ['10 ft, with drawers', 120, 30, 66, 0, { dr: 4 }], ['12 ft, with drawers', 144, 30, 66, 0, { dr: 4 }]],
  build: (a, v) => { bench(a, { pegboard: 760, vise: true, drawers: v.dr, power: false, topZ: a.Z0 + 900, heavy: true }); a.log('Added the steel frame, the plank top, the lower shelf, the vise, the perforated back panel and the drawer stack if listed (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic site locker bank',
  desc: (v) => `Site locker bank with ${cnt(v.cols, 'single locker', 'single lockers')}, each with a louvered door, a latch and a number plate, a plinth and a sloped top.`,
  vs: [['2 lockers', 24, 18, 72, 0, { cols: 2 }], ['3 lockers', 36, 18, 72, 0, { cols: 3 }], ['4 lockers', 48, 18, 72, 0, { cols: 4 }], ['6 lockers', 72, 18, 72, 0, { cols: 6 }], ['8 lockers', 96, 18, 72, 0, { cols: 8 }]],
  build: (a, v) => { lockers(a, { cols: v.cols, vent: true, hook: true, sloped: true }); a.log('Added the plinth, the doors with vents, latches and number plates, and the sloped top (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic site flammable storage cabinet',
  desc: (v) => `Double-wall flammable liquids cabinet, ${v.gal} gallon size: ${cnt(v.doors, 'self-closing door', 'self-closing doors')} with a three-point latch, a raised sill, two adjustable shelves, vent bungs on the side and a plinth.`,
  vs: [['22 gallon', 23, 18, 44, 0, { gal: 22, doors: 1 }], ['30 gallon', 43, 18, 44, 0, { gal: 30, doors: 2 }], ['45 gallon', 43, 18, 65, 0, { gal: 45, doors: 2 }], ['60 gallon', 34, 34, 65, 0, { gal: 60, doors: 2 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1 } = a; cab(a, { toe: 80, doors: v.doors, pull: 'vbar', lock: true, swing: true });
    a.box(X0, YF - 3, Z0 + 80, X1, YF, Z0 + 140); a.box(X0 - 0, YF - 4, Z1 - 20, X1, YF, Z1); for (const x of [X0 + 6, X1 - 18]) a.cyl(x + 6, YF + 60, Z1 - 70, Z1 - 40, 14, 8);
    for (let i = 1; i <= 2; i++) a.box(X0 + 30, YF + 60, Z0 + 80 + (a.H - 80) * i / 3, X1 - 30, YB - 20, Z0 + 94 + (a.H - 80) * i / 3);
    a.log('Added the self-closing doors, the three-point latch, the raised sill, the shelves and the vent bungs (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic site first aid wall cabinet',
  desc: (v) => `Wall cabinet ${v.w} in wide for site first aid supplies: ${cnt(v.doors, 'door', 'doors')} with a cross plate on each, a lock hasp, three inside shelves and a hidden plan outline.`,
  vs: [['16 in', 16, 8, 24, 52, { doors: 1 }], ['24 in', 24, 10, 30, 48, { doors: 2 }], ['36 in', 36, 12, 30, 48, { doors: 2 }]],
  build: (a, v) => {
    cab(a, { hidden: true, doors: v.doors, pull: 'knob', swing: true, lock: true });
    for (const lf of leaves(a.X0, a.X1, v.doors)) { const cx = (lf.a + lf.b) / 2, cz = a.Z0 + a.H * 0.55, s = Math.min(70, (lf.b - lf.a) * 0.3); a.box(cx - s, a.YF - 3, cz - s / 3, cx + s, a.YF, cz + s / 3); a.box(cx - s / 3, a.YF - 3, cz - s, cx + s / 3, a.YF, cz + s); }
    for (let i = 1; i <= 3; i++) a.box(a.X0 + T, a.YB - a.D * 0.8, a.Z0 + (a.H * i) / 4, a.X1 - T, a.YB - 20, a.Z0 + (a.H * i) / 4 + 12);
    a.log('Added the doors with cross plates and lock hasps and the three shelves (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic site document cabinet',
  desc: (v) => `Site document cabinet ${v.w} in wide with a roll-up tambour door ${v.lower ? 'over a lower pair of hinged doors' : 'down the full height'}, a lock bar, a plinth and fixed shelves inside.`,
  vs: [['36 in, full tambour', 36, 18, 72, 0, { lower: false }], ['48 in, full tambour', 48, 18, 72, 0, { lower: false }], ['36 in, tambour over doors', 36, 18, 72, 0, { lower: true }], ['48 in, tambour over doors', 48, 18, 72, 0, { lower: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, split = v.lower ? Z0 + 760 : Z0 + 100; a.outline(); a.box(X0, YF + 60, Z0, X1, YB, Z0 + 100); a.box(X0, YF + T, Z0 + 100, X1, YB, Z1);
    for (let z = split + 20; z < Z1 - 20; z += 10 * 3) { if (((z - split) / 30) % 1 === 0) a.box(X0 + 20, YF, z, X1 - 20, YF + T, z + 26); }
    a.box(X0 + 20, YF - 8, Z1 - 140, X1 - 20, YF, Z1 - 100); a.box(X1 - 90, YF - 10, split + 40, X1 - 50, YF, split + 160);
    if (v.lower) for (const lf of leaves(X0, X1, 2)) { a.box(lf.a, YF, Z0 + 110, lf.b, YF + T, split - 10); pull(a, 'bar', lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, split - 130); a.rect(lf.a, YF, lf.b, YF + T, D); }
    a.rect(X0 + 20, YF, X1 - 20, YF + T, D); a.line(X0, YF + 40, X1, YF + 40, HID);
    a.log('Added the tambour slats, the lock bar, the lower hinged doors if listed and the plinth (plan and 3D).');
  } });

/** Framed glass doors drawn as open frames (the contents show), z0..z1 default to the cabinet face. */
function glazed(a, n, z0 = a.Z0 + 110, z1 = a.Z1 - 20) {
  const { YF } = a;
  for (const lf of leaves(a.X0, a.X1, n)) { a.frame(lf.a, z0, lf.b, z1, YF, YF + T, 40); a.rect(lf.a, YF, lf.b, YF + T, D); pull(a, 'lock', lf.hinge === 'L' ? lf.b - 70 : lf.a + 70, (z0 + z1) / 2);
    const w = lf.b - lf.a, hg = lf.hinge === 'L' ? lf.a : lf.b; a.line(hg, YF, hg, YF - w, 'EQUIP-SWING'); a.arc(hg, YF, w, lf.hinge === 'L' ? 270 : 180, lf.hinge === 'L' ? 360 : 270); }
}
/** Open-front bins in a frame: cols x rows, each bin a tray with a lip and a label holder. */
function bins(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, base = Z0 + (o.toe ?? 80), cols = o.cols, rows = o.rows;
  a.outline(); if (o.toe !== 0) a.box(X0, YF + 40, Z0, X1, YB, base);
  a.box(X0, YB - 10, base, X1, YB, Z1); a.box(X0, YF + 20, base, X0 + T, YB, Z1); a.box(X1 - T, YF + 20, base, X1, YB, Z1); a.box(X0, YF + 20, Z1 - T, X1, YB, Z1);
  const bw = (W - 2 * T) / cols, bh = (Z1 - T - base) / rows;
  for (let r = 0; r < rows; r++) { const z0 = base + bh * r; a.box(X0 + T, YF + 20, z0, X1 - T, YB, z0 + 8); for (let c = 0; c < cols; c++) { const x0 = X0 + T + bw * c + 6, x1 = x0 + bw - 12; a.box(x0, YF + 30, z0 + 8, x1, YF + 40, z0 + 70); a.box(x0 + 4, YF + 40, z0 + 8, x1 - 4, YB - 20, z0 + 60); a.box(x0 + bw / 2 - 40, YF + 24, z0 + 30, x0 + bw / 2 + 40, YF + 30, z0 + 55); } }
  for (let c = 1; c < cols; c++) a.line(X0 + T + bw * c, YF + 20, X0 + T + bw * c, YB, D);
  a.rect(X0 + T, YF + 20, X1 - T, YB, D);
}
/** Grid of small labelled drawers. */
function smallDrawers(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W } = a, base = Z0 + (o.toe ?? 100), cols = o.cols, rows = o.rows;
  a.outline(); a.box(X0 + 10, YF + 50, Z0, X1 - 10, YB, base); a.box(X0, YF + T, base, X1, YB, Z1);
  const cw = (W - 40) / cols, rh = (Z1 - 20 - base - 20) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x0 = X0 + 20 + cw * c + 3, x1 = X0 + 20 + cw * (c + 1) - 3, z1 = Z1 - 20 - rh * r - 3, z0 = z1 - rh + 6; a.box(x0, YF, z0, x1, YF + T, z1); a.box((x0 + x1) / 2 - 20, YF - 6, z1 - rh * 0.4, (x0 + x1) / 2 + 20, YF, z1 - rh * 0.4 + 8); a.box(x0 + 8, YF - 1, z0 + 6, x1 - 8, YF, z0 + 20); }
  a.line(X0, YF + T, X1, YF + T, D); a.rect(X0, YF, X1, YF + T, D);
}
// ---------------- earthmoving and excavation yards
P({ cat: 'casework/base', title: 'Generic equipment yard parts counter',
  desc: (v) => `Parts counter ${ft(v.w)} long for an equipment yard: a steel base with doors and drawers, a 42 in counter top, a lift-up hatch at one end and a back board with ${v.rows} rows of label shelves.`,
  vs: [['8 ft', 96, 30, 84, 0, { rows: 2, doors: 3 }], ['12 ft', 144, 30, 84, 0, { rows: 3, doors: 4 }], ['16 ft', 192, 30, 84, 0, { rows: 3, doors: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 1067, hw = 800; cab(a, { toe: 100, drawers: 1, drawerH: 150, drawerCols: v.doors, doors: v.doors, pull: 'bar', topT: 45, swing: false }, 1067);
    a.box(X0, YB - 40, tz, X1, YB, Z1);
    for (let r = 0; r < v.rows; r++) { const z = tz + 150 + r * ((Z1 - tz - 300) / v.rows); a.box(X0 + 20, YB - 240, z, X1 - 20, YB - 40, z + 16); a.box(X0 + 20, YB - 250, z + 16, X1 - 20, YB - 240, z + 70); }
    a.box(X1 - hw, YF + 20, tz, X1, YF + 40, tz + 60); a.box(X1 - hw, YF + 20, tz + 60, X1 - hw + 30, YB - 20, tz + 300); a.line(X1 - hw, YF + 20, X1 - hw, YB, D); a.rect(X1 - hw, YF + 20, X1, YB, D);
    a.log('Added the drawer and door base, the counter top, the lift-up hatch, and the back board with label shelves (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic service body compartment cabinet',
  desc: (v) => `Compartment cabinet ${ft(v.w)} long in the style of a field service body: ${v.n} upper and ${v.n} lower hinged doors with recessed T pulls, a tread-plate style top with raised ribs and a plinth.`,
  vs: [['8 ft, 4 compartments', 96, 24, 48, 0, { n: 4 }], ['10 ft, 5 compartments', 120, 24, 48, 0, { n: 5 }], ['12 ft, 6 compartments', 144, 24, 48, 0, { n: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0 + 10, YF + 30, Z0, X1 - 10, YB, Z0 + 80); a.box(X0, YF + T, Z0 + 80, X1, YB, Z1 - 20); a.box(X0, YF, Z1 - 20, X1, YB, Z1);
    for (let x = X0 + 60; x < X1 - 40; x += 100) a.box(x, YF + 30, Z1, x + 8, YB - 30, Z1 + 0.01 + 6);
    const cw = W / v.n, mid = (Z0 + 80 + Z1 - 20) / 2;
    for (let i = 0; i < v.n; i++) for (const [z0, z1] of [[Z0 + 90, mid - 4], [mid + 4, Z1 - 30]]) { const x0 = X0 + cw * i + 5, x1 = X0 + cw * (i + 1) - 5; a.box(x0, YF, z0, x1, YF + T, z1); a.box((x0 + x1) / 2 - 50, YF - 10, z1 - 80, (x0 + x1) / 2 + 50, YF, z1 - 62); a.box((x0 + x1) / 2 - 6, YF - 10, z1 - 140, (x0 + x1) / 2 + 6, YF, z1 - 62); a.rect(x0, YF, x1, YF + T, D); }
    a.log('Added the plinth, the upper and lower compartment doors with T pulls, and the ribbed top (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic lubricant storage cabinet',
  desc: (v) => `Lubricant store cabinet for a service bay, ${cnt(v.drums, 'drum cradle', 'drum cradles')} side by side at the bottom: a steel frame with drums lying on cradles, a spill sill, and a locking cupboard above with two doors and a shelf.`,
  vs: [['1 drum bay', 36, 36, 72, 0, { drums: 1 }], ['2 drum bays', 60, 36, 72, 0, { drums: 2 }], ['3 drum bays', 84, 36, 72, 0, { drums: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, ch = 760, bw = W / v.drums; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.line(X0, YF + 40, X1, YF + 40, HID);
    for (let i = 0; i <= v.drums; i++) { const x = i === v.drums ? X1 - 30 : X0 + bw * i; a.box(x, YF + 20, Z0 + 60, x + 30, YB, Z1); }
    for (let i = 0; i < v.drums; i++) { const cx = X0 + bw * (i + 0.5); a.ycyl(YF + 70, YB - 70, cx, Z0 + 60 + 295, 285, 16); a.box(cx - 200, YF + 100, Z0 + 60, cx + 200, YF + 150, Z0 + 240); a.box(cx - 200, YB - 150, Z0 + 60, cx + 200, YB - 100, Z0 + 240); a.circ(cx, a.cy, 285, D); a.line(X0 + bw * i + 30, YF + 70, X0 + bw * i + 30, YB - 70, HID); }
    a.box(X0, YF + 20, Z0 + ch, X1, YB, Z0 + ch + 30); a.box(X0, YF + T, Z0 + ch + 30, X1, YB, Z1); a.box(X0, YF + 40, Z0 + ch - 20, X1, YF + 60, Z0 + ch);
    for (const lf of leaves(X0 + 30, X1 - 30, 2)) { a.box(lf.a, YF, Z0 + ch + 40, lf.b, YF + T, Z1 - 30); pull(a, 'vbar', lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, Z0 + ch + 450); a.rect(lf.a, YF, lf.b, YF + T, D); }
    a.log('Added the base sill, the corner posts, the drum cradles with drums and the locking cupboard (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic equipment yard parts bin rack',
  desc: (v) => `Open-front parts bin rack, ${v.cols} bins across and ${v.rows} high: a frame with sloped-lip bins, a label holder on each bin and a plinth.`,
  vs: [['3 by 4 bins', 36, 24, 48, 0, { cols: 3, rows: 4 }], ['4 by 6 bins', 48, 24, 72, 0, { cols: 4, rows: 6 }], ['5 by 6 bins', 60, 24, 72, 0, { cols: 5, rows: 6 }], ['6 by 7 bins', 72, 24, 84, 0, { cols: 6, rows: 7 }]],
  build: (a, v) => { bins(a, { cols: v.cols, rows: v.rows, toe: 80 }); a.log('Added the frame, the bin shelves, the bins with lips and the label holders (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic survey equipment cabinet',
  desc: (v) => `Survey equipment cabinet ${v.w} in wide: glazed door frames with a lock, ${v.tri} tripod legs standing in a lower bay with a rail, instrument case shelves above and a plinth.`,
  vs: [['30 in, 2 tripods', 30, 24, 78, 0, { tri: 2 }], ['36 in, 3 tripods', 36, 24, 78, 0, { tri: 3 }], ['48 in, 4 tripods', 48, 24, 78, 0, { tri: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; cab(a, { toe: 100, open: true, cols: 1 }); glazed(a, 2);
    for (let i = 0; i < v.tri; i++) { const x = X0 + 120 + ((W - 240) * i) / (v.tri - 1 || 1); a.cone(x, YB - 200, Z0 + 150, Z0 + 1200, 22, 14, 8); a.cone(x + 40, YB - 220, Z0 + 150, Z0 + 1200, 22, 14, 8); }
    a.box(X0 + 30, YB - 400, Z0 + 1250, X1 - 30, YB - 30, Z0 + 1266); a.box(X0 + 30, YB - 400, Z0 + 1600, X1 - 30, YB - 30, Z0 + 1616);
    for (let k = 0; k < Math.max(2, Math.round(W / 300)); k++) { const x = X0 + 60 + k * 280; if (x + 240 < X1 - 40) { a.box(x, YB - 380, Z0 + 1266, x + 240, YB - 60, Z0 + 1500); a.box(x, YB - 380, Z0 + 1616, x + 240, YB - 60, Z0 + 1850); } }
    a.box(X0 + 20, YB - 450, Z0 + 360, X1 - 20, YB - 20, Z0 + 376); a.rect(X0 + 30, YB - 400, X1 - 30, YB - 30, D);
    a.log('Added the glass doors, the tripod legs, the lower rail, the shelves and the instrument cases (plan and 3D).');
  } });
// ---------------- mining
function meshDoor(a, x0, x1, z0, z1, y0, y1) { a.frame(x0, z0, x1, z1, y0, y1, 22); for (let x = x0 + 70; x < x1 - 40; x += 70) a.box(x - 3, y0 + 4, z0 + 22, x + 3, y1 - 4, z1 - 22); for (let z = z0 + 120; z < z1 - 40; z += 120) a.box(x0 + 22, y0 + 4, z - 3, x1 - 22, y1 - 4, z + 3); }
P({ cat: 'casework/tall', title: 'Generic mine dry-house locker bank',
  desc: (v) => `Dry-house locker bank, ${cnt(v.cols, `single locker 12 in wide`, 'single lockers of 12 in')}: doors with vent slots at the top and bottom, a latch and a number plate each, a plinth and a sloped top.`,
  vs: [['4 lockers', 48, 18, 72, 0, { cols: 4 }], ['6 lockers', 72, 18, 72, 0, { cols: 6 }], ['8 lockers', 96, 18, 72, 0, { cols: 8 }], ['10 lockers', 120, 18, 72, 0, { cols: 10 }]],
  build: (a, v) => { lockers(a, { cols: v.cols, vent: true, hook: true, sloped: true, toe: 150 }); a.log('Added the raised plinth, the vented doors with latches and number plates, and the sloped top (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic mine dry-house two-tier locker bank',
  desc: (v) => `Two-tier locker bank: ${v.cols} columns of two stacked lockers (${v.cols * 2} in all), vented doors with latches and number plates, a plinth and a sloped top.`,
  vs: [['4 columns', 48, 18, 72, 0, { cols: 4 }], ['6 columns', 72, 18, 72, 0, { cols: 6 }], ['8 columns', 96, 18, 72, 0, { cols: 8 }], ['10 columns', 120, 18, 72, 0, { cols: 10 }]],
  build: (a, v) => { lockers(a, { cols: v.cols, tiers: 2, vent: true, hook: true, sloped: true, toe: 150 }); a.log('Added the plinth, both tiers of vented doors with latches and number plates, and the sloped top (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic mine dry-house mesh locker',
  desc: (v) => `Wire mesh clothes locker bank with ${cnt(v.cols, 'locker', 'lockers')} 15 in wide: each door is a frame filled with vertical and horizontal wires, with a hasp and a hat shelf strip over a raised base.`,
  vs: [['3 lockers', 45, 18, 72, 0, { cols: 3 }], ['5 lockers', 75, 18, 72, 0, { cols: 5 }], ['6 lockers', 90, 18, 72, 0, { cols: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, cw = W / v.cols; a.outline(); a.box(X0, YF + 40, Z0, X1, YB, Z0 + 200); a.line(X0, YF + 40, X1, YF + 40, HID);
    for (let i = 0; i <= v.cols; i++) { const x = i === v.cols ? X1 - 20 : X0 + cw * i; a.box(x, YF, Z0 + 200, x + 20, YB, Z1); a.line(x + 10, YF, x + 10, YB, D); }
    a.box(X0, YF, Z1 - 20, X1, YB, Z1); a.box(X0, YB - 10, Z0 + 200, X1, YB, Z1); a.box(X0, YF + 20, Z1 - 380, X1, YB - 20, Z1 - 360);
    for (let i = 0; i < v.cols; i++) { const x0 = X0 + cw * i + 22, x1 = X0 + cw * (i + 1) - 2; meshDoor(a, x0, x1, Z0 + 210, Z1 - 30, YF, YF + 14); a.box(x1 - 50, YF - 10, (Z0 + Z1) / 2 - 30, x1 - 22, YF, (Z0 + Z1) / 2 + 30); a.rect(x0, YF, x1, YF + 14, D); }
    a.log('Added the raised base, the posts, the wire mesh doors with hasps and the hat shelf strip (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic mine dry-house bench with boot rack',
  desc: (v) => `Dry-house bench ${ft(v.w)} long: a slatted seat on a steel frame, a lower slatted shelf with a boot rail and a wall rail at the back.`,
  vs: [['4 ft', 48, 14, 36, 0, {}], ['6 ft', 72, 14, 36, 0, {}], ['8 ft', 96, 14, 36, 0, {}], ['10 ft', 120, 14, 36, 0, {}]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, sz = Z0 + 460; a.outline();
    for (const x of [X0 + 60, X1 - 100, ...(W > 1800 ? [(X0 + X1) / 2] : [])]) { a.box(x, YF + 30, Z0, x + 40, YF + 70, sz); a.box(x, YB - 70, Z0, x + 40, YB - 30, sz); a.box(x, YB - 40, sz, x + 40, YB, Z1); a.box(x, YF + 30, sz - 60, x + 40, YB - 30, sz - 30); }
    for (let y = YF + 20; y < YB - 80; y += 100) a.box(X0, y, sz, X1, y + 80, sz + 30);
    for (let y = YF + 30; y < YB - 40; y += 80) a.box(X0 + 40, y, Z0 + 140, X1 - 40, y + 55, Z0 + 160);
    a.box(X0, YF + 50, Z0 + 160, X1, YF + 70, Z0 + 230); a.box(X0, YB - 20, sz + 100, X1, YB, Z1); a.rect(X0, YF + 20, X1, YB - 80, D);
    a.log('Added the slatted seat, the frame, the lower slatted shelf with its boot rail and the wall rail (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic mine cap lamp charging rack',
  desc: (v) => `Cap lamp charging rack for ${v.n} lamps: a wall cabinet frame with ${v.rows} rows of open cradles, a lamp head in each, an indicator strip along the top and a back panel.`,
  vs: [['12 lamps', 24, 8, 24, 54, { n: 12, rows: 2 }], ['24 lamps', 36, 8, 30, 54, { n: 24, rows: 3 }], ['36 lamps', 48, 8, 36, 54, { n: 36, rows: 3 }], ['48 lamps', 60, 8, 42, 48, { n: 48, rows: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, cols = v.n / v.rows; a.outline(HID); a.box(X0, YB - 12, Z0, X1, YB, Z1); a.box(X0, YF, Z0, X0 + T, YB, Z1); a.box(X1 - T, YF, Z0, X1, YB, Z1); a.box(X0, YF, Z1 - 120, X1, YB, Z1); a.box(X0, YF, Z0, X1, YB, Z0 + T);
    for (let i = 0; i < Math.min(cols, 16); i++) a.box(X0 + 60 + ((W - 120) * (i + 0.5)) / Math.min(cols, 16) - 10, YF - 3, Z1 - 70, X0 + 60 + ((W - 120) * (i + 0.5)) / Math.min(cols, 16) + 10, YF, Z1 - 50);
    const bh = (Z1 - 120 - Z0 - T) / v.rows, cw = (W - 2 * T) / cols;
    for (let r = 0; r < v.rows; r++) { const z0 = Z0 + T + bh * r; a.box(X0 + T, YF + 10, z0, X1 - T, YB - 12, z0 + 10); for (let c = 0; c < cols; c++) { const x = X0 + T + cw * (c + 0.5); a.box(x - cw * 0.35, YF + 20, z0 + 10, x + cw * 0.35, YB - 40, z0 + 40); a.ycyl(YF + 40, YF + 130, x, z0 + 90, Math.min(40, cw * 0.28), 8); } }
    a.rect(X0 + T, YF, X1 - T, YB - 12, D); a.log('Added the frame, the cradle rows with a lamp head in each, the indicator strip and the back panel (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic mine tag board cabinet',
  desc: (v) => `Mine tag board in a wall cabinet ${v.w} in wide: a glazed door frame with a lock, a back board with rows of numbered hooks and tags and a header strip.`,
  vs: [['24 in', 24, 4, 36, 48, { cols: 6 }], ['36 in', 36, 4, 36, 48, { cols: 9 }], ['48 in', 48, 4, 36, 48, { cols: 12 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(HID); a.box(X0, YB - 10, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YB - 10, 22);
    for (let r = 0; r < 4; r++) for (let c = 0; c < v.cols; c++) { const x = X0 + 60 + ((W - 120) * (c + 0.5)) / v.cols, z = Z0 + 130 + r * 180; a.cyl(x, YB - 10, z, z + 0.01, 0.01, 3); a.box(x - 3, YB - 30, z, x + 3, YB - 10, z + 6); a.box(x - 20, YB - 28, z - 70, x + 20, YB - 26, z - 20); }
    a.box(X0 + 22, YB - 25, Z1 - 80, X1 - 22, YB - 10, Z1 - 30); pull(a, 'lock', X1 - 11, (Z0 + Z1) / 2, YF); a.rect(X0, YF, X1, YB, D);
    a.log('Added the glazed door frame with its lock, the back board with rows of hooks and tags, and the header strip (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic mine self-rescuer storage cabinet',
  desc: (v) => `Self-rescuer storage cabinet ${v.w} in wide: glazed door frames with a lock, ${v.sh} shelves each holding a row of cylindrical canisters, a toe kick and a sloped top.`,
  vs: [['30 in', 30, 18, 72, 0, { sh: 3 }], ['36 in', 36, 18, 72, 0, { sh: 4 }], ['48 in', 48, 18, 72, 0, { sh: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; cab(a, { toe: 100, open: true, cols: 1 }); glazed(a, 2);
    for (let k = 0; k < v.sh; k++) { const z = Z0 + 200 + k * ((Z1 - Z0 - 400) / v.sh); a.box(X0 + 25, YF + 60, z, X1 - 25, YB - 20, z + 14); for (let x = X0 + 90; x < X1 - 70; x += 120) a.cyl(x, a.cy, z + 14, z + 14 + 200, 45, 10); }
    a.log('Added the glazed door frames with a lock, the shelves with canisters and the toe kick (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic mine core tray rack',
  desc: (v) => `Core tray rack, ${cnt(v.bays, 'bay', 'bays')} of ${v.levels} levels: a steel frame with a plain shelf rail at each level and a shallow core tray with a rim in every slot.`,
  vs: [['2 bays, 8 levels', 48, 48, 54, 0, { bays: 2, levels: 8 }], ['3 bays, 10 levels', 72, 48, 66, 0, { bays: 3, levels: 10 }], ['4 bays, 10 levels', 96, 48, 66, 0, { bays: 4, levels: 10 }], ['5 bays, 12 levels', 120, 48, 78, 0, { bays: 5, levels: 12 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bw = W / v.bays, ph = (Z1 - Z0 - 60) / v.levels; a.outline();
    for (let i = 0; i <= v.bays; i++) { const x = i === v.bays ? X1 - 40 : X0 + bw * i; for (const y of [YF, YB - 40]) a.box(x, y, Z0, x + 40, y + 40, Z1); a.line(x + 20, YF, x + 20, YB, HID); }
    for (let l = 0; l <= v.levels; l++) { const z = Z0 + 40 + ph * l; a.box(X0, YF, z - 12, X1, YF + 30, z); a.box(X0, YB - 30, z - 12, X1, YB, z); for (let i = 0; i < v.bays; i++) { a.box(X0 + bw * i + 40, YF + 30, z - 12, X0 + bw * (i + 1), YB - 30, z - 6); if (l < v.levels) { a.box(X0 + bw * i + 50, YF + 40, z - 6, X0 + bw * (i + 1) - 10, YB - 40, z + 6); a.box(X0 + bw * i + 50, YF + 40, z + 6, X0 + bw * i + 58, YB - 40, z + 36); a.box(X0 + bw * (i + 1) - 18, YF + 40, z + 6, X0 + bw * (i + 1) - 10, YB - 40, z + 36); a.box(X0 + bw * i + 58, YF + 40, z + 6, X0 + bw * (i + 1) - 18, YF + 48, z + 36); } } }
    a.rect(X0 + 40, YF + 30, X1 - 40, YB - 30, D); a.log('Added the frame posts, the level rails and a rimmed core tray in each slot (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic mine workshop bench',
  desc: (v) => `Heavy mine workshop bench ${ft(v.w)} long: a thick steel-faced top on a welded frame, a heavy lower shelf, a bench vise, ${cnt(v.dr, 'drawer', 'drawers')} under the right end and a perforated back panel with hooks.`,
  vs: [['6 ft', 72, 30, 66, 0, { dr: 2 }], ['8 ft', 96, 30, 66, 0, { dr: 3 }], ['10 ft', 120, 32, 66, 0, { dr: 4 }]],
  build: (a, v) => { bench(a, { pegboard: 760, vise: true, drawers: v.dr, topT: 70, heavy: true, topZ: a.Z0 + 900 }); a.log('Added the welded frame, the steel-faced top, the heavy shelf, the vise, the drawers and the hook panel (plan and 3D).'); } });
P({ cat: 'casework/base', title: 'Generic mine dispatch console',
  desc: (v) => `Dispatch console for a mine control room with ${cnt(v.n, 'operator position', 'operator positions')}: a 29 in desk on panel ends with a keyboard tray, a raised sloped monitor shelf carrying ${cnt(v.n * 2, 'screen', 'screens')} and a cable trough at the back.`,
  vs: [['1 position', 60, 36, 50, 0, { n: 1 }], ['2 positions', 108, 36, 50, 0, { n: 2 }], ['3 positions', 156, 36, 50, 0, { n: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, dz = Z0 + 740;
    tbl(a, { base: 'panels', topT: 40, modesty: true }, 740);
    a.box(X0 + 90, YF + 40, dz - 150, X1 - 90, YF + 340, dz - 125); a.rect(X0 + 90, YF + 40, X1 - 90, YF + 340, D);
    for (const x of [X0 + 120, X1 - 150]) a.box(x, YB - 260, dz, x + 30, YB - 220, Z0 + 1000);
    const p0 = [YB - 260, Z0 + 1000], p1 = [YB - 60, Z0 + 1180];
    prismX(a, [[YB - 260, Z0 + 960], [YB - 60, Z0 + 1140], [YB - 60, Z0 + 1180], [YB - 260, Z0 + 1000]], X0 + 100, X1 - 100);
    for (let i = 0; i < v.n * 2; i++) { const w = (W - 400) / (v.n * 2), x0 = X0 + 200 + w * i + 20, x1 = X0 + 200 + w * (i + 1) - 20; sl(a, x0, x1, p0, p1, 0.1, 0.95, 18, 0); a.rect(x0, YB - 260, x1, YB - 60, D); }
    a.box(X0 + 100, YB - 60, dz, X1 - 100, YB, dz + 150);
    a.log('Added the panel-end desk, the keyboard tray, the raised sloped monitor shelf with its screens and the cable trough (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic mine safety supply cabinet',
  desc: (v) => `Safety supply cabinet ${v.w} in wide: glazed door frames with a lock, ${v.sh} shelves holding rows of hard hat shells and glove boxes, a toe kick and a plan outline.`,
  vs: [['30 in', 30, 18, 72, 0, { sh: 4 }], ['36 in', 36, 18, 72, 0, { sh: 4 }], ['48 in', 48, 24, 78, 0, { sh: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; cab(a, { toe: 100, open: true, cols: 1 }); glazed(a, 2);
    for (let k = 0; k < v.sh; k++) { const z = Z0 + 180 + k * ((Z1 - Z0 - 360) / v.sh); a.box(X0 + 25, YF + 60, z, X1 - 25, YB - 20, z + 14); for (let x = X0 + 110; x < X1 - 90; x += 160) if (k % 2 === 0) a.ell(x, a.cy, z + 14 + 55, 80, 100, 55, 10, 5); else a.box(x - 60, a.cy - 90, z + 14, x + 60, a.cy + 90, z + 100); }
    a.log('Added the glazed door frames, the shelves and the hard hat shells and glove boxes (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic assay sample drawer cabinet',
  desc: (v) => `Sample storage cabinet with ${v.rows * 2} shallow drawers in two columns and ${v.rows} rows: a plinth, a card holder and a pull on each drawer and a flat top.`,
  vs: [['4 rows', 30, 24, 36, 0, { rows: 4 }], ['6 rows', 30, 24, 48, 0, { rows: 6 }], ['8 rows', 36, 24, 60, 0, { rows: 8 }]],
  build: (a, v) => { cab(a, { toe: 100, drawers: v.rows, drawerH: 0, drawerCols: 2, pull: 'bar', topT: 30 }); for (let r = 0; r < v.rows; r++) for (const c of [0, 1]) { const x = a.X0 + a.W * (c + 0.5) / 2, z = a.Z1 - 30 - (a.H - 160) * r / v.rows - 60; a.box(x - 60, a.YF - 2, z - 40, x + 60, a.YF, z - 15); } a.log('Added the plinth, the drawer fronts with pulls and card holders, and the top (plan and 3D).'); } });
P({ cat: 'casework/wall', title: 'Generic dry-house hat and hook shelf',
  desc: (v) => `Wall shelf ${ft(v.w)} long: a shelf with a front lip on brackets and a rail below with ${v.hooks} double hooks, over a back board.`,
  vs: [['4 ft', 48, 10, 16, 64, { hooks: 4 }], ['6 ft', 72, 10, 16, 64, { hooks: 6 }], ['8 ft', 96, 10, 16, 64, { hooks: 8 }], ['10 ft', 120, 10, 16, 64, { hooks: 10 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(HID); a.box(X0, YB - 18, Z0, X1, YB, Z1); a.box(X0, YF, Z1 - 20, X1, YB, Z1); a.box(X0, YF, Z1 - 50, X1, YF + 18, Z1 - 20);
    for (let i = 0; i < 3; i++) { const x = X0 + 100 + ((W - 200) * i) / 2; a.box(x - 10, YF + 30, Z1 - 200, x + 10, YB - 18, Z1 - 20); }
    a.box(X0, YB - 50, Z0 + 20, X1, YB - 18, Z0 + 70); for (let i = 0; i < v.hooks; i++) { const x = X0 + ((W) * (i + 0.5)) / v.hooks; a.box(x - 6, YB - 100, Z0 + 20, x + 6, YB - 50, Z0 + 50); a.box(x - 6, YB - 140, Z0 + 20, x + 6, YB - 100, Z0 + 40); a.box(x - 6, YB - 140, Z0 + 20, x + 6, YB - 124, Z0 + 90); a.circ(x, YB - 90, 6, D); }
    a.rect(X0, YF, X1, YB, D); a.log('Added the back board, the shelf with its lip on brackets, the hook rail and the double hooks (plan and 3D).');
  } });
// ---------------- aviation (hangars, crew rooms, flight decks)
P({ cat: 'casework/tall', title: 'Generic hangar tool control cabinet',
  desc: (v) => `Tool control cabinet ${v.w} in wide: two locking doors whose faces carry rows of tool silhouettes, a header label strip with a status light, a plinth and a lower drawer section with ${v.dr} drawers.`,
  vs: [['30 in', 30, 20, 78, 0, { dr: 2 }], ['36 in', 36, 20, 78, 0, { dr: 3 }], ['48 in', 48, 22, 78, 0, { dr: 3 }], ['60 in', 60, 22, 78, 0, { dr: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, dz = Z0 + 100 + v.dr * 130; a.outline(); a.box(X0 + 10, YF + 40, Z0, X1 - 10, YB, Z0 + 100); a.box(X0, YF + T, Z0 + 100, X1, YB, Z1);
    for (let i = 0; i < v.dr; i++) { const z0 = Z0 + 108 + i * 130, z1 = z0 + 122; a.box(X0 + 8, YF, z0, X1 - 8, YF + T, z1); pull(a, 'bar', a.cx, (z0 + z1) / 2, YF); }
    a.box(X0 + 20, YF - 6, Z1 - 140, X1 - 20, YF + T, Z1 - 20); a.box(X1 - 80, YF - 10, Z1 - 100, X1 - 50, YF, Z1 - 70); a.rect(X0 + 20, YF - 6, X1 - 20, YF + T, D);
    for (const lf of leaves(X0 + 8, X1 - 8, 2)) { a.box(lf.a, YF, dz + 10, lf.b, YF + T, Z1 - 150); pull(a, 'lock', lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, dz + 400); a.rect(lf.a, YF, lf.b, YF + T, D);
      for (let r = 0; r < 4; r++) { const z = Z1 - 220 - r * ((Z1 - 150 - dz - 260) / 3); for (let k = 0; k < 4; k++) { const x0 = lf.a + 40 + k * ((lf.b - lf.a - 80) / 4); a.box(x0, YF - 3, z - 20, x0 + (lf.b - lf.a - 80) / 4 - 25, YF, z + 20 - (k % 2) * 6); } } }
    a.line(a.cx, YF, a.cx, YB, D); a.log('Added the plinth, the drawers, the locking doors with tool silhouettes, the header strip and the status light (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic hangar tool chest with foam drawers',
  desc: (v) => `Hangar tool chest ${v.w} in wide with ${cnt(v.n, 'drawer', 'drawers')}, each lined with a recessed foam insert drawn on the front, side handles, a flat work top and four casters.`,
  vs: [['5 drawers, 28 in', 28, 22, 38, 0, { n: 5 }], ['7 drawers, 36 in', 36, 24, 42, 0, { n: 7 }], ['9 drawers, 41 in', 41, 24, 44, 0, { n: 9 }], ['11 drawers, 56 in', 56, 26, 46, 0, { n: 11 }]],
  build: (a, v) => { chest(a, { n: v.n, foam: true, casters: 125 }); a.log('Added the foam-insert drawer fronts, the side handles, the work top and the casters (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic aircraft hardware drawer cabinet',
  desc: (v) => `Small-parts cabinet ${v.w} in wide: ${v.cols} by ${v.rows} labelled drawers (${v.cols * v.rows} in all), each with a pull and a card holder, over a plinth.`,
  vs: [['4 by 10 drawers', 30, 18, 60, 0, { cols: 4, rows: 10 }], ['6 by 10 drawers', 36, 18, 60, 0, { cols: 6, rows: 10 }], ['6 by 14 drawers', 36, 18, 72, 0, { cols: 6, rows: 14 }], ['8 by 14 drawers', 48, 18, 72, 0, { cols: 8, rows: 14 }]],
  build: (a, v) => { smallDrawers(a, { cols: v.cols, rows: v.rows }); a.log('Added the plinth, the grid of small drawers with pulls and card holders (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic hangar parts shelving unit',
  desc: (v) => `Hangar parts shelving, ${cnt(v.bays, 'bay', 'bays')} of 36 in: steel uprights, ${v.sh} solid shelves per bay with front lips, diagonal back bracing and a base kick plate.`,
  vs: [['2 bays', 72, 24, 84, 0, { bays: 2, sh: 5 }], ['3 bays', 108, 24, 84, 0, { bays: 3, sh: 5 }], ['4 bays', 144, 24, 84, 0, { bays: 4, sh: 5 }], ['3 bays, 96 in high', 108, 30, 96, 0, { bays: 3, sh: 6 }], ['5 bays', 180, 24, 84, 0, { bays: 5, sh: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bw = W / v.bays; a.outline(); a.box(X0, YF + 10, Z0, X1, YF + 20, Z0 + 100);
    for (let i = 0; i <= v.bays; i++) { const x = i === v.bays ? X1 - 40 : X0 + bw * i; a.box(x, YF, Z0, x + 40, YF + 40, Z1); a.box(x, YB - 40, Z0, x + 40, YB, Z1); a.line(x + 20, YF, x + 20, YB, HID); }
    for (let k = 0; k < v.sh; k++) { const z = Z0 + 150 + k * ((Z1 - Z0 - 220) / (v.sh - 1)); a.box(X0 + 40, YF, z, X1 - 40, YB, z + 20); a.box(X0 + 40, YF, z + 20, X1 - 40, YF + 14, z + 60); }
    for (let i = 0; i < v.bays; i++) a.tube([[X0 + bw * i + 40, YB - 10, Z0 + 100], [X0 + bw * (i + 1), YB - 10, Z1 - 100]], [8, 8], 6);
    a.rect(X0 + 40, YF, X1 - 40, YB, D); a.log('Added the uprights, the solid shelves with lips, the back bracing and the kick plate (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic aircrew room kitchenette base',
  desc: (v) => `Crew room base run ${v.w} in long: ${v.doors} doors and a drawer row, a laminate-style top with a sink basin and faucet${v.fridge ? ' and a 24 in open bay holding an undercounter unit box with a door line' : ''}.`,
  vs: [['48 in', 48, 24, 46, 0, { doors: 2, fridge: false }], ['60 in', 60, 24, 46, 0, { doors: 3, fridge: false }], ['72 in, with unit bay', 72, 24, 46, 0, { doors: 2, fridge: true }], ['96 in, with unit bay', 96, 24, 46, 0, { doors: 3, fridge: true }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, bay = v.fridge ? 610 : 0, zt = Z0 + 965; cab(a, { toe: 100, drawers: 1, drawerH: 150, drawerCols: v.doors, doors: v.doors, pull: 'bar', topT: 38, swing: true }, 965);
    if (v.fridge) { a.box(X1 - bay, YF + 5, Z0 + 100, X1, YB, zt - 38); a.box(X1 - bay + 10, YF + 10, Z0 + 110, X1 - 10, YF + 60, zt - 60); a.rect(X1 - bay + 10, YF + 10, X1 - 10, YF + 60, D); a.line(X1 - bay, YF, X1 - bay, YB, D); }
    const sx = X0 + (W - bay) / 2; a.rect(sx - 250, YF + 140, sx + 250, YB - 140, D); a.cyl(sx, YB - 80, zt, zt + 150, 14, 8); a.tube([[sx, YB - 80, zt + 150], [sx, YB - 180, zt + 200]], [11, 10], 8);
    a.log('Added the drawer and door base, the top with its sink basin and faucet, and the unit bay if listed (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic aircrew room wall cabinet',
  desc: (v) => `Crew room wall cabinet ${v.w} in wide, ${v.h} in high: ${cnt(v.doors, 'door', 'doors')} with bar pulls, an inside shelf and a light bar under the front edge.`,
  vs: [['24 in', 24, 12, 30, 54, { doors: 1 }], ['36 in', 36, 12, 30, 54, { doors: 2 }], ['48 in', 48, 12, 36, 48, { doors: 2 }], ['72 in', 72, 12, 36, 48, { doors: 3 }]],
  build: (a, v) => { cab(a, { hidden: true, doors: v.doors, pull: 'bar', swing: true }); a.box(a.X0 + 30, a.YF + 10, a.Z0 - 14, a.X1 - 30, a.YF + 40, a.Z0); a.box(a.X0 + T, a.YB - 180, a.Z0 + a.H / 2, a.X1 - T, a.YB - 20, a.Z0 + a.H / 2 + 14); a.log('Added the doors with pulls, the inside shelf and the light bar under the front edge (plan and 3D).'); } });
P({ cat: 'casework/base', title: 'Generic cockpit style console',
  desc: (v) => `Floor-standing console in the style of a flight deck: a plinth and a body with a sloped instrument panel carrying ${v.n} screens and a row of knobs, a glare shield on top and a raised centre pedestal with three levers.`,
  vs: [['48 in, 2 screens', 48, 36, 42, 0, { n: 2 }], ['60 in, 3 screens', 60, 36, 42, 0, { n: 3 }], ['72 in, 4 screens', 72, 36, 42, 0, { n: 4 }], ['96 in, 5 screens', 96, 36, 42, 0, { n: 5 }], ['120 in, 6 screens', 120, 36, 42, 0, { n: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a; a.outline(); a.box(X0 + 20, YF + 200, Z0, X1 - 20, YB - 20, Z0 + 80); a.box(X0, YF + 220, Z0 + 80, X1, YB, Z0 + 560);
    const p0 = [YF + 220, Z0 + 560], p1 = [YB - 380, Z0 + 920]; prismX(a, [[YF + 220, Z0 + 560], [YB, Z0 + 560], [YB, Z0 + 920], [YB - 380, Z0 + 920]], X0, X1);
    prismX(a, [[YB - 380, Z0 + 920], [YB, Z0 + 920], [YB, Z1], [YB - 380, Z1 - 60]], X0, X1);
    const sw = (W - 300) / v.n;
    for (let i = 0; i < v.n; i++) { const x0 = X0 + 150 + sw * i + 20, x1 = X0 + 150 + sw * (i + 1) - 20; sl(a, x0, x1, p0, p1, 0.18, 0.8, 14, 0); a.rect(x0, YB - 380 - 200, x1, YB - 380, D); }
    for (let i = 0; i < v.n * 3; i++) { const x = X0 + 150 + ((W - 300) * (i + 0.5)) / (v.n * 3); sl(a, x - 8, x + 8, p0, p1, 0.08, 0.12, 14, 0); }
    a.box(cx - 170, YF, Z0 + 80, cx + 170, YF + 520, Z0 + 700); a.rect(cx - 170, YF, cx + 170, YF + 520, D);
    for (let i = -1; i <= 1; i++) { a.box(cx + i * 90 - 9, YF + 120, Z0 + 700, cx + i * 90 + 9, YF + 150, Z0 + 920); a.ell(cx + i * 90, YF + 135, Z0 + 940, 28, 28, 28, 8, 5); }
    a.log('Added the plinth, the body, the sloped instrument panel with screens and knobs, the glare shield and the centre pedestal with levers (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic flight planning desk',
  desc: (v) => `Flight planning desk ${v.w} in wide for an airfield office: a panel-end desk with a drawer pedestal, a shelf, ${cnt(v.n, 'monitor', 'monitors')} on posts and a sloped chart rest at the back.`,
  vs: [['60 in, 2 monitors', 60, 30, 48, 0, { n: 2 }], ['72 in, 2 monitors', 72, 30, 48, 0, { n: 2 }], ['96 in, 3 monitors', 96, 30, 48, 0, { n: 3 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, dz = Z0 + 740; tbl(a, { base: 'panels', topT: 40, drawers: 3 }, 740);
    a.box(X0 + 120, YF + 60, dz - 150, X1 - 520, YF + 360, dz - 130);
    const cw = W * 0.38; prismX(a, [[YB - 330, dz], [YB - 20, dz + 130], [YB - 20, dz + 150], [YB - 330, dz + 20]], X0 + 120, X0 + 120 + cw);
    for (let i = 0; i < v.n; i++) monitor(a, (X0 + cw + 460) + ((X1 - 290) - (X0 + cw + 460)) * i / Math.max(1, v.n - 1), YB - 100, dz, 260, 190);
    a.log('Added the panel-end desk with its drawer pedestal, the shelf, the monitors on posts and the sloped chart rest (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic aircraft manual rack',
  desc: (v) => `Wall rack of ${v.cols * v.rows} open pigeonholes, ${v.cols} across and ${v.rows} high, with a binder standing in each second slot, label strips and a back panel.`,
  vs: [['6 by 2 slots', 36, 10, 24, 54, { cols: 6, rows: 2 }], ['8 by 3 slots', 48, 10, 30, 48, { cols: 8, rows: 3 }], ['10 by 3 slots', 60, 10, 30, 48, { cols: 10, rows: 3 }], ['12 by 4 slots', 72, 10, 36, 48, { cols: 12, rows: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(HID); grid(a, X0, X1, YF, YB, Z0, Z1, v.cols, v.rows, 14);
    const cw = (W - 14) / v.cols, rh = (a.H - 14) / v.rows;
    for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const x = X0 + 7 + cw * c + cw / 2, z = Z0 + 14 + rh * r; if ((r + c) % 2 === 0) a.box(x - cw * 0.3, YF + 40, z, x + cw * 0.3, YB - 20, z + rh - 40); a.box(x - cw * 0.3, YF + 20, z + 2, x + cw * 0.3, YF + 24, z + 20); }
    a.rect(X0, YF, X1, YB, D); a.log('Added the pigeonhole frame, the binders in alternate slots, the label strips and the back panel (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic hangar workbench',
  desc: (v) => `Hangar workbench ${ft(v.w)} long: a laminate-style top on a steel frame with a lower shelf, a perforated back panel with hooks, a power strip rail and a bench vise${v.dr ? `, plus ${cnt(v.dr, 'drawer', 'drawers')} at the right end` : ''}.`,
  vs: [['6 ft', 72, 30, 72, 0, { dr: 0 }], ['8 ft', 96, 30, 72, 0, { dr: 3 }], ['10 ft', 120, 30, 72, 0, { dr: 4 }], ['12 ft', 144, 30, 72, 0, { dr: 4 }]],
  build: (a, v) => { bench(a, { pegboard: 880, vise: true, drawers: v.dr, power: true, topZ: a.Z0 + 900 }); a.log('Added the steel frame, the top, the lower shelf, the vise, the power strip rail, the hook panel and drawers if listed (plan and 3D).'); } });
P({ cat: 'casework/base', title: 'Generic avionics bench',
  desc: (v) => `Avionics bench ${ft(v.w)} long: a static-dissipating style top with a grounding socket, a riser shelf for test instruments on two posts, a lamp arm, a drawer stack and a lower shelf.`,
  vs: [['5 ft', 60, 30, 60, 0, { dr: 3 }], ['6 ft', 72, 30, 60, 0, { dr: 3 }], ['8 ft', 96, 30, 60, 0, { dr: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 900; bench(a, { drawers: v.dr, topT: 35, topZ: tz });
    for (const x of [X0 + 100, X1 - 130]) a.box(x, YB - 280, tz, x + 30, YB - 250, Z1); a.box(X0 + 90, YB - 300, Z0 + 1300, X1 - 90, YB - 40, Z0 + 1320); a.box(X0 + 90, YB - 300, Z0 + 1320, X1 - 90, YB - 290, Z0 + 1380);
    for (let k = 0; k < Math.max(2, Math.round(W / 700)); k++) a.box(X0 + 150 + k * 620, YB - 280, Z0 + 1320, X0 + 150 + k * 620 + 450, YB - 60, Z0 + 1560);
    a.cyl(X1 - 600, YF + 150, tz, tz + 24, 22, 8); a.tube([[X0 + 400, YB - 40, tz], [X0 + 400, YB - 100, tz + 400], [X0 + 700, YB - 300, tz + 520]], [10, 8, 8], 6); a.rect(X0 + 90, YB - 300, X1 - 90, YB - 40, D);
    a.log('Added the bench frame, the top with its grounding socket, the riser shelf with instruments, the lamp arm and the drawers (plan and 3D).');
  } });
P({ cat: 'casework/tall', title: 'Generic flight crew bag locker',
  desc: (v) => `Crew bag locker bank with ${v.cols} columns of two stacked lockers, each 24 in deep: solid doors with latches and label slots, a plinth and a flat top.`,
  vs: [['3 columns', 54, 24, 72, 0, { cols: 3 }], ['4 columns', 72, 24, 72, 0, { cols: 4 }], ['6 columns', 108, 24, 72, 0, { cols: 6 }], ['8 columns', 144, 24, 72, 0, { cols: 8 }]],
  build: (a, v) => { lockers(a, { cols: v.cols, tiers: 2, hook: true, toe: 120 }); a.log('Added the plinth, both tiers of solid doors with latches and label slots, and the flat top (plan and 3D).'); } });
P({ cat: 'casework/wall', title: 'Generic aircraft safety equipment cabinet',
  desc: (v) => `Wall cabinet ${v.w} in wide for flight safety equipment: a glazed door frame, ${v.items} vest-shaped pouches on hooks and a cylinder bracket for an extinguisher on one side.`,
  vs: [['24 in, 2 pouches', 24, 10, 36, 48, { items: 2 }], ['30 in, 3 pouches', 30, 10, 36, 48, { items: 3 }], ['36 in, 4 pouches', 36, 10, 36, 48, { items: 4 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(HID); a.box(X0, YB - 10, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YF, YB - 10, 22);
    for (let i = 0; i < v.items; i++) { const x = X0 + 80 + i * 130; a.ell(x, YB - 60, Z1 - 330, 50, 25, 140, 10, 6); a.box(x - 4, YB - 40, Z1 - 120, x + 4, YB - 10, Z1 - 100); }
    const ex = X1 - 90; a.cyl(ex, YB - 70, Z0 + 60, Z0 + 600, 55, 12); a.box(ex - 70, YB - 90, Z0 + 380, ex + 70, YB - 10, Z0 + 410); a.circ(ex, YB - 70, 55, D); pull(a, 'lock', X1 - 11, (Z0 + Z1) / 2, YF); a.rect(X0, YF, X1, YB, D);
    a.log('Added the glazed door frame with a lock, the pouches on hooks and the extinguisher cylinder with its bracket (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic crew briefing counter',
  desc: (v) => `Standing briefing counter ${ft(v.w)} long: a doored base with a toe kick and a 42 in top with a sloped lean-on writing surface, a lip and a clipboard rail along the back.`,
  vs: [['6 ft', 72, 28, 44, 0, { doors: 3 }], ['8 ft', 96, 28, 44, 0, { doors: 4 }], ['10 ft', 120, 28, 44, 0, { doors: 5 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a, tz = Z0 + 1000; cab(a, { toe: 100, doors: v.doors, pull: 'bar', swing: false }, 1000);
    prismX(a, [[YF, tz], [YB, tz], [YB, tz + 100], [YF, tz + 30]], X0, X1); a.box(X0, YF, tz, X1, YF + 20, tz + 50); a.box(X0, YB - 40, tz + 90, X1, YB, tz + 110); a.xcyl(X0 + 20, X1 - 20, YB - 60, tz + 130, 9, 8); a.line(X0, YF + 20, X1, YF + 20, D);
    a.log('Added the doored base, the sloped writing surface with its lip and the clipboard rail (plan and 3D).');
  } });
// ---------------- more hospital and construction
P({ cat: 'casework/tall', title: 'Generic patient room wardrobe',
  desc: (v) => `Patient room wardrobe ${v.w} in wide: ${cnt(v.doors, 'full-height door', 'full-height doors')} with a lock, an inside hanging rail, three inside drawers and a toe kick.`,
  vs: [['24 in', 24, 24, 78, 0, { doors: 1 }], ['30 in', 30, 24, 78, 0, { doors: 1 }], ['36 in', 36, 24, 78, 0, { doors: 2 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; cab(a, { toe: 100, doors: v.doors, lock: true, pull: 'vbar', swing: true });
    a.xcyl(X0 + 30, X1 - 30, a.cy, Z1 - 300, 14, 8); for (let i = 0; i < 3; i++) { const z = Z0 + 120 + i * 200; a.box(X0 + 40, YF + 80, z, X1 - 40, YB - 40, z + 170); a.rect(X0 + 40, YF + 80, X1 - 40, YB - 40, HID); }
    a.log('Added the full-height doors with lock, the toe kick, the hanging rail and the inside drawers (plan and 3D).');
  } });
P({ cat: 'casework/base', title: 'Generic patient bathroom vanity',
  desc: (v) => `Bathroom vanity ${v.w} in wide for a patient room: a base with ${v.doors} doors and a drawer, a top with an integral basin, a single-lever faucet and a back splash, mounted on a plinth.`,
  vs: [['24 in', 24, 20, 40, 0, { doors: 1 }], ['30 in', 30, 20, 40, 0, { doors: 2 }], ['36 in', 36, 20, 40, 0, { doors: 2 }], ['48 in', 48, 20, 40, 0, { doors: 2 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, tz = Z0 + 34 * IN; cab(a, { toe: 100, drawers: 1, drawerH: 130, doors: v.doors, pull: v.doors < 2 ? 'knob' : 'bar', topT: 35, swing: true }, 34 * IN);
    a.box(X0, YB - 20, tz, X1, YB, tz + 120); a.rect(cx - 220, YF + 90, cx + 220, YB - 90, D); a.rect(cx - 200, YF + 110, cx + 200, YB - 110, D);
    a.cyl(cx, YB - 60, tz, tz + 140, 13, 8); a.box(cx - 5, YB - 100, tz + 130, cx + 5, YB - 40, tz + 150); a.log('Added the doors, the drawer, the top with its basin, the faucet and the splash (plan and 3D).');
  } });
P({ cat: 'casework/wall', title: 'Generic isolation anteroom supply cabinet',
  desc: (v) => `Open-front supply cabinet ${v.w} in wide for an isolation anteroom: ${v.cols} pockets across and two rows with a label strip under each pocket and a back panel.`,
  vs: [['24 in', 24, 8, 24, 54, { cols: 3 }], ['36 in', 36, 8, 24, 54, { cols: 4 }], ['48 in', 48, 8, 30, 54, { cols: 6 }]],
  build: (a, v) => { a.outline(HID); bins(a, { cols: v.cols, rows: 2, toe: 0 }); a.log('Added the frame, the open pockets in two rows and the label strips (plan and 3D).'); } });
P({ cat: 'casework/tall', title: 'Generic site cable and hose rack',
  desc: (v) => `Open rack for ${v.reels} cable or hose coils on cross rods: two end frames, ${v.reels} horizontal rods each with a coil drawn on it, a floor sill and a side rail.`,
  vs: [['3 coils', 36, 24, 72, 0, { reels: 3 }], ['4 coils', 48, 24, 72, 0, { reels: 4 }], ['6 coils', 72, 24, 72, 0, { reels: 6 }]],
  build: (a, v) => {
    const { X0, X1, YF, YB, Z0, Z1, W } = a; a.outline(); a.box(X0, YF, Z0, X1, YB, Z0 + 60); for (const x of [X0, X1 - 40]) { a.box(x, YF, Z0 + 60, x + 40, YF + 40, Z1); a.box(x, YB - 40, Z0 + 60, x + 40, YB, Z1); a.box(x, YF + 40, Z1 - 40, x + 40, YB - 40, Z1); }
    const n = Math.ceil(v.reels / 2), rows = 2; for (let i = 0; i < v.reels; i++) { const col = i % n, row = Math.floor(i / n), z = Z0 + 500 + row * 800, x = X0 + 60 + ((W - 120) * (col + 0.5)) / n; a.ycyl(YF + 40, YB - 40, x, z, 12, 8); a.ycyl(YF + 90, YF + 300, x, z, 300 * Math.min(1, (W - 120) / n / 700) , 14); a.circ(x, YF + 195, 28, D); }
    a.line(X0, YF + 40, X1, YF + 40, D); a.log('Added the end frames, the cross rods, the coils and the floor sill (plan and 3D).');
  } });
export default fams;
