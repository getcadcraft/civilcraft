/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, hobby: craft tools and workshop, scale models, collecting and display, outdoor hobbies. Original geometry; generic shapes, no maker or model. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, TAU = m.PI * 2;

// ------------------------------------------------------------------------------------------ helpers
const MAP = { z: (u, v, w) => [u, v, w], y: (u, v, w) => [u, w, v], x: (u, v, w) => [w, u, v] };
/** a ring, arc ring or disc (ri = 0) about an axis through (c1, c2), between l0 and l1 */
function ring(a, ax, c1, c2, l0, l1, ri, ro, seg = 14, a0 = 0, a1 = TAU) {
  const M = MAP[ax], full = m.abs(a1 - a0 - TAU) < 1e-6, n = full ? seg : m.max(2, m.ceil((seg * (a1 - a0)) / TAU));
  const P = (r, k, w) => { const t = a0 + ((a1 - a0) * k) / n; return M(c1 + r * m.cos(t), c2 + r * m.sin(t), w); };
  for (let k = 0; k < n; k++) {
    a.t.push([P(ro, k, l0), P(ro, k + 1, l0), P(ro, k + 1, l1)], [P(ro, k, l0), P(ro, k + 1, l1), P(ro, k, l1)]);
    if (ri > 0) a.t.push([P(ri, k, l0), P(ri, k + 1, l1), P(ri, k + 1, l0)], [P(ri, k, l0), P(ri, k, l1), P(ri, k + 1, l1)]);
    a.t.push([P(ri, k, l1), P(ro, k, l1), P(ro, k + 1, l1)], [P(ri, k, l1), P(ro, k + 1, l1), P(ri, k + 1, l1)]);
    a.t.push([P(ri, k, l0), P(ro, k + 1, l0), P(ro, k, l0)], [P(ri, k, l0), P(ri, k + 1, l0), P(ro, k + 1, l0)]);
  }
  if (!full) for (const k of [0, n]) a.t.push([P(ri, k, l0), P(ro, k, l0), P(ro, k, l1)], [P(ri, k, l0), P(ro, k, l1), P(ri, k, l1)]);
}
function prismX(a, poly, x0, x1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
function prismY(a, poly, y0, y1) {
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a wheel on a lateral axle with hub */
const whl = (a, x, y, r, w, z = null) => { const zz = z ?? a.Z0 + r; a.xcyl(x - w / 2, x + w / 2, y, zz, r, 14); a.xcyl(x - w / 2 - 0.5, x + w / 2 + 0.5, y, zz, r * 0.4, 8); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-DETAIL'); };
/** a rail: tube from p to q */
const bar = (a, p, q, r, seg = 6) => a.tube([p, q], [r, r], seg);
/** a small dome / cup lathe shape: radii [r0..rn] over z0..z1 at (x, y) */
function lathe(a, x, y, z0, z1, rads, seg = 12) { const n = rads.length; a.tube(rads.map((_, i) => [x, y, z0 + ((z1 - z0) * i) / (n - 1)]), rads, seg); }

// ------------------------------------------------------------------------------------------ craft
function sewing(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, bh = H * 0.16, colW = W * 0.2, armZ0 = Z0 + H * 0.66, long = v.long;
  a.outline();
  // bed with rounded front edge and the throat plate
  a.box(X0, YF + D * 0.1, Z0, X1, YB - D * 0.1, Z0 + bh); a.box(X0 + W * 0.03, YF, Z0 + 2, X1 - W * 0.03, YB, Z0 + 4);
  a.box(X0 + W * 0.03, YF, Z0, X1 - W * 0.03, YB, Z0 + bh * 0.4);
  a.box(X0 + W * 0.06, YF + D * 0.25, Z0 + bh, X0 + W * (long ? 0.2 : 0.3), YB - D * 0.25, Z0 + bh + 3);   // plate
  for (const sx of [-1, 1]) for (const y of [YF + D * 0.2, YB - D * 0.2]) a.cyl(cx + sx * (W / 2 - 25), y, Z0 - 0 + 0, Z0 + 2, 10, 6);
  // column and arm
  a.box(X1 - colW, YF + D * 0.18, Z0 + bh, X1, YB - D * 0.18, armZ0 + H * 0.3);
  a.box(X0 + W * 0.04, YF + D * 0.2, armZ0, X1, YB - D * 0.2, armZ0 + H * 0.3);
  a.ell(X1 - colW * 0.9, cy, armZ0 + H * 0.15, colW * 0.9, (D - D * 0.4) / 2, H * 0.17, 14, 6);
  // head: needle bar housing, needle, presser foot
  const hx = X0 + W * 0.1 + (long ? 0 : W * 0.05);
  a.box(hx - W * 0.05, YF + D * 0.2, armZ0 - H * 0.1, hx + W * 0.05, YB - D * 0.25, armZ0 + H * 0.3);
  a.cyl(hx, YF + D * 0.21, armZ0 - H * 0.2, armZ0 - H * 0.1, 5, 8); a.cyl(hx, YF + D * 0.21, armZ0 - H * 0.42, armZ0 - H * 0.2, 1.5, 6);
  a.box(hx - 8, YF + D * 0.2, Z0 + bh + 6, hx + 8, YF + D * 0.2 + 18, Z0 + bh + 18); a.cyl(hx + W * 0.07, cy, armZ0 + H * 0.3, armZ0 + H * 0.4, 3, 6);
  // top: thread spool pin with spool, take-up guide, stitch dial
  const px = cx + W * 0.05; a.cyl(px, cy, armZ0 + H * 0.3, armZ0 + H * 0.52, 3, 6); a.cyl(px, cy, armZ0 + H * 0.3, armZ0 + H * 0.46, 11, 10); a.cyl(px, cy, armZ0 + H * 0.3, armZ0 + H * 0.31, 13, 10);
  a.box(hx - 5, cy - 5, armZ0 + H * 0.3, hx + 5, cy + 5, armZ0 + H * 0.42);
  // handwheel on the right end and a stitch dial on the column
  const hwr = H * 0.14; a.xcyl(X1 - 28, X1, cy, armZ0 + H * 0.15, hwr, 16); a.xcyl(X1 - 34, X1 - 26, cy, armZ0 + H * 0.15, hwr * 0.42, 10);
  a.xcyl(X1 - colW, X1 - colW + 5, YF + D * 0.16, armZ0 + H * 0.05, 9, 10);
  a.rect(X0 + W * 0.04, YF + D * 0.2, X1, YB - D * 0.2, 'EQUIP-DETAIL'); a.circ(px, cy, 11, 'EQUIP-DETAIL'); a.rect(hx - W * 0.05, YF + D * 0.2, hx + W * 0.05, YB - D * 0.25, 'EQUIP-DETAIL');
  a.log('Added the base bed with throat plate, the column and arm, needle bar head with needle and presser foot, a thread spool on its pin and the handwheel (plan and 3D).');
}

function floorLoom(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, p = 55, hy = YF + D * 0.5;
  a.outline();
  // two side frames: front and back posts joined by rails; castle on top
  for (const sx of [-1, 1]) {
    const x = cx + sx * (W / 2 - p / 2);
    for (const y of [YF + p / 2, hy, YB - p / 2]) a.box(x - p / 2, y - p / 2, Z0, x + p / 2, y + p / 2, y === hy ? Z0 + H * 0.82 : (y < hy ? Z0 + H * 0.52 : Z0 + H * 0.82));
    for (const z of [Z0 + H * 0.1, Z0 + H * 0.5]) a.box(x - p / 2, YF, z, x + p / 2, YB, z + p * 0.6);
    a.box(x - p / 2, hy - p / 2, Z0 + H * 0.82, x + p / 2, hy + p / 2, Z1);
  }
  a.box(X0, hy - p / 2, Z1 - p, X1, hy + p / 2, Z1);                                                 // castle top beam
  a.box(X0, YB - p, Z0 + H * 0.82 - p, X1, YB, Z0 + H * 0.82);                                    // back beam
  a.xcyl(X0, X1, YB - p, Z0 + H * 0.74, 30, 12); a.xcyl(X0, X1, YF + p, Z0 + H * 0.5, 22, 10);  // warp beam and breast beam
  a.xcyl(X0 + p, X1 - p, YF + p * 2.2, Z0 + H * 0.38, 28, 12); a.line(X0, YF + p, X1, YF + p, 'EQUIP-DETAIL');
  // beater: swinging frame with a reed
  const by = hy + 160; for (const sx of [-1, 1]) bar(a, [cx + sx * (W / 2 - p * 1.8), hy + 40, Z0 + H * 0.46], [cx + sx * (W / 2 - p * 1.8), by, Z0 + H * 0.88], 14, 6);
  a.box(X0 + p * 1.3, by - 14, Z0 + H * 0.88 - 20, X1 - p * 1.3, by + 14, Z0 + H * 0.88); a.box(X0 + p * 1.3, by - 8, Z0 + H * 0.58, X1 - p * 1.3, by + 8, Z0 + H * 0.66);
  for (let i = 0; i <= 14; i++) a.box(X0 + p * 1.6 + ((W - p * 3.2) * i) / 14 - 1.5, by - 4, Z0 + H * 0.66, X0 + p * 1.6 + ((W - p * 3.2) * i) / 14 + 1.5, by + 4, Z0 + H * 0.88 - 20);
  // heddle frames and treadles
  for (let i = 0; i < 4; i++) { const y = hy - 30 - i * 26; a.frame(X0 + p * 1.5, Z0 + H * 0.55, X1 - p * 1.5, Z0 + H * 0.82, y - 6, y + 6, 12); }
  for (let i = 0; i < 4; i++) { const x = X0 + W * (0.28 + i * 0.15); a.box(x - 22, YF + 20, Z0 + H * 0.06, x + 22, hy + 20, Z0 + H * 0.06 + 14); }
  a.box(X0 + p, YF - 0, Z0 + H * 0.5, X1 - p, YF + p * 0.6 + 40, Z0 + H * 0.5 + 8);
  a.xcyl(X0 + p, X1 - p, hy + 20, Z0 + H * 0.06 + 7, 10, 8);
  // warp threads as a sheet of thin lines between the beams
  for (let i = 0; i < 26; i++) { const x = X0 + p * 2 + ((W - p * 4) * i) / 25; bar(a, [x, YB - p, Z0 + H * 0.76], [x, YF + p * 1.2, Z0 + H * 0.52], 0.8, 3); }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.rect(X0 + p * 1.3, by - 14, X1 - p * 1.3, by + 14, 'EQUIP-DETAIL');
  a.log('Added four posts per side with rails, the castle beam and back beam, warp and breast beams with the cloth roller, a swinging beater with reed, four heddle frames, four treadles and a sheet of warp threads (plan and 3D).');
}

function tableLoom(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, cy = (YF + YB) / 2, p = 22, n = v.warp;
  a.outline();
  for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - p / 2); a.box(x - p / 2, YF, Z0, x + p / 2, YB, Z0 + p); a.box(x - p / 2, YF, Z0, x + p / 2, YF + p, Z1 - 20); a.box(x - p / 2, YB - p, Z0, x + p / 2, YB, Z1 - 40); a.box(x - p / 2, YF, Z1 - 20 - p, x + p / 2, YB, Z1 - 20); }
  a.xcyl(X0, X1, YB - p, Z1 - 40, 14, 10); a.xcyl(X0, X1, YF + p, Z1 - 20, 14, 10); a.xcyl(X0, X1, YB - p - 80, Z0 + p + 40, 10, 8);
  // heddle block: two uprights and a reed, held on a frame
  const hy = cy; a.frame(X0 + p * 1.4, Z0 + p + 20, X1 - p * 1.4, Z1 - 30, hy - 8, hy + 8, 18);
  for (let i = 0; i <= n; i++) { const x = X0 + p * 2.4 + ((W - p * 4.8) * i) / n; a.box(x - 1.2, hy - 6, Z0 + p + 38, x + 1.2, hy + 6, Z1 - 48); bar(a, [x, YB - p, Z1 - 40], [x, YF + p, Z1 - 20], 0.7, 3); }
  a.box(cx + W * 0.1 - 10, hy - 30, Z1 - 30, cx + W * 0.1 + 10, hy + 30, Z1 + 0); a.line(X0, hy, X1, hy, 'EQUIP-DETAIL');
  for (const x of [X0 + p, X1 - p]) a.cyl(x, YB - p - 80, Z0 + p, Z0 + p + 55, 12, 8);
  a.log('Added two side frames with feet, the back and front beams, a lower cloth roller, a heddle frame with reed holding ' + n + ' warp threads and a lift lever (plan and 3D).');
}

function potterWheel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, hr = v.head * IN / 2, panR = m.min(W, D) * 0.46, kick = v.kick;
  a.outline(); a.circ(cx, cy, panR, 'EQUIP-DETAIL'); a.circ(cx, cy, hr, 'EQUIP-DETAIL');
  const panZ = Z0 + H * (v.bench ? 0.55 : 0.78);
  if (v.bench) { a.box(X0, YF, Z0, X1, YB, Z0 + H * 0.5); a.box(X0 + 20, YF + 20, Z0 + H * 0.5, X1 - 20, YB - 20, Z0 + H * 0.55); }
  else {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bar(a, [cx + sx * W * 0.4, cy + sy * D * 0.4, Z0 + 20], [cx + sx * W * 0.2, cy + sy * D * 0.2, panZ - 40], 22, 8);
    for (const sx of [-1, 1]) a.box(cx + sx * W * 0.4 - 20, YF + 20, Z0, cx + sx * W * 0.4 + 20, YB - 20, Z0 + 40);
    a.box(X0 + W * 0.25, cy - D * 0.2, Z0 + H * 0.3, X1 - W * 0.25, cy + D * 0.2, Z0 + H * 0.3 + 30);
    a.cyl(cx, cy, Z0 + H * 0.3 + 30, panZ - 20, 50, 12);
  }
  // splash pan: base disc plus wall ring, open front lip
  ring(a, 'z', cx, cy, panZ - 20, panZ, 0, panR, 28); ring(a, 'z', cx, cy, panZ, panZ + H * 0.07, panR - 12, panR, 28, 0.4, TAU - 0.4);
  a.box(cx - panR * 0.5, YF, panZ - 20, cx + panR * 0.5, YF + panR * 0.25, panZ);
  a.cyl(cx, cy, panZ, panZ + 40, 36, 12); ring(a, 'z', cx, cy, panZ + 40, panZ + 54, 0, hr, 28); a.cyl(cx, cy, panZ + 54, panZ + 58, hr * 0.6, 20);
  if (kick) { const fr = D * 0.34; a.ycyl(cy - 20, cy + 20, cx, Z0 + fr + 20, fr, 20); a.ycyl(cy - 14, cy + 14, cx, Z0 + fr + 20, 28, 10); bar(a, [cx, cy, Z0 + fr + 20], [cx, cy, panZ - 20], 14, 8); a.box(cx - W * 0.22, YB - D * 0.3, Z0 + H * 0.38, cx + W * 0.22, YB - 20, Z0 + H * 0.38 + 36); }
  else { a.box(cx + W * 0.1, YF + 10, Z0 + (v.bench ? 0 : 0), X1 - 10, YF + D * 0.25, Z0 + (v.bench ? 30 : 40)); a.box(X0 + 20, YF + 10, Z0 + H * (v.bench ? 0.2 : 0.2), X0 + 60, YF + 30, Z0 + H * 0.2 + 40); }
  a.log('Added the base or legs, a drain pan with splash wall and front lip, the shaft with wheel head disc' + (kick ? ', a heavy flywheel with a seat plank' : ' and a foot pedal') + ' (plan and 3D).');
}

function easelA(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 22;
  a.outline();
  const top = [cx, YF + D * 0.28, Z1 - 80];
  for (const sx of [-1, 1]) bar(a, top, [cx + sx * W * 0.46, YF + D * 0.04, Z0], t * 0.6, 8);
  bar(a, [cx, YF + D * 0.32, Z1 - 120], [cx, YB - 30, Z0], t * 0.6, 8);
  for (const sx of [-1, 1]) a.box(cx + sx * W * 0.46 - 20, YF, Z0, cx + sx * W * 0.46 + 20, YF + 50, Z0 + 20);
  a.box(cx - 25, YF + D * 0.1, Z0 + H * 0.2, cx + 25, YF + D * 0.1 + 26, Z1);              // mast
  a.box(cx - W * 0.45, YF + D * 0.1 - 40, Z0 + H * 0.33, cx + W * 0.45, YF + D * 0.1 + 14, Z0 + H * 0.33 + 24);   // ledge
  a.box(cx - 70, YF + D * 0.1 - 6, Z1 - 140, cx + 70, YF + D * 0.1 + 24, Z1 - 100);        // top clamp
  a.box(cx - W * 0.4, YF + D * 0.1 - 6, Z0 + H * 0.36, cx + W * 0.4, YF + D * 0.1 - 0, Z0 + H * 0.36 + H * 0.55);  // canvas
  a.rect(cx - W * 0.45, YF + D * 0.1 - 40, cx + W * 0.45, YF + D * 0.1 + 14, 'EQUIP-DETAIL'); a.line(cx, YF + D * 0.28, cx - W * 0.46, YF + D * 0.04); a.line(cx, YF + D * 0.28, cx + W * 0.46, YF + D * 0.04); a.line(cx, YF + D * 0.28, cx, YB - 30);
  a.log('Added the two front legs and one rear leg meeting at the top, the mast with canvas ledge and top clamp, and a canvas resting on the ledge (plan and 3D).');
}

function easelH(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 50;
  a.outline();
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.42; a.box(x - t / 2, YF + D * 0.25, Z0 + 70, x + t / 2, YF + D * 0.25 + t, Z1); a.box(x - t / 2, YF, Z0 + 70, x + t / 2, YB, Z0 + 70 + t); for (const y of [YF + 40, YB - 40]) a.caster(x, y, 70); }
  a.box(cx - W * 0.42, YF + D * 0.25, Z0 + H * 0.55, cx + W * 0.42, YF + D * 0.25 + t, Z0 + H * 0.55 + t * 0.7);
  a.box(cx - W * 0.42, YF + D * 0.25, Z1 - t, cx + W * 0.42, YF + D * 0.25 + t, Z1);
  a.box(cx - t / 2, YF + D * 0.25 - 40, Z0 + H * 0.2, cx + t / 2, YF + D * 0.25, Z1 - 30);                  // mast
  a.box(cx - W * 0.4, YF + D * 0.05, Z0 + H * 0.3, cx + W * 0.4, YF + D * 0.25 + 10, Z0 + H * 0.3 + 30);   // ledge
  a.box(cx - 90, YF + D * 0.25 - 60, Z1 - 160, cx + 90, YF + D * 0.25, Z1 - 120);
  if (v.crank) { a.xcyl(cx + W * 0.42 + t / 2, cx + W * 0.42 + t / 2 + 50, YF + D * 0.25 + t / 2, Z0 + H * 0.45, 8, 8); a.xcyl(cx + W * 0.42 + t / 2 + 50, cx + W * 0.42 + t / 2 + 56, YF + D * 0.25 + t / 2, Z0 + H * 0.45, 30, 12); }
  a.box(cx - W * 0.3, YF + D * 0.25 - 46, Z0 + H * 0.3 + 30, cx + W * 0.3, YF + D * 0.25 - 40, Z0 + H * 0.3 + 30 + H * 0.5);
  a.line(cx - W * 0.42, YF + D * 0.25, cx + W * 0.42, YF + D * 0.25, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, YF + D * 0.05, cx + W * 0.4, YF + D * 0.25 + 10, 'EQUIP-DETAIL');
  a.log('Added two uprights on cross feet with casters, cross rails, the sliding mast, a canvas ledge, a top clamp' + (v.crank ? ' and a hand crank wheel' : '') + ' (plan and 3D).');
}

function craftBench(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, topZ = Z0 + H * 0.45, tt = 45, lt = 60;
  a.outline();
  a.box(X0, YF, topZ - tt, X1, YB, topZ);
  for (const [x, y] of [[X0, YF], [X1 - lt, YF], [X0, YB - lt], [X1 - lt, YB - lt]]) a.box(x, y, Z0, x + lt, y + lt, topZ - tt);
  a.box(X0 + lt, YF + 10, Z0 + H * 0.12, X1 - lt, YB - 10, Z0 + H * 0.12 + 25);
  for (let i = 0; i < 3; i++) { const z = Z0 + H * 0.06 + i * 0; void z; }
  const dx1 = X0 + lt + W * 0.22; a.box(X0 + lt, YF + lt, topZ - tt - 340, dx1, YB - lt, topZ - tt);   // drawer pedestal
  for (let i = 0; i < 3; i++) { a.box(X0 + lt + 5, YF + lt - 8, topZ - tt - 335 + i * 110, dx1 - 5, YF + lt - 2, topZ - tt - 235 + i * 110); a.box(X0 + lt + (dx1 - X0 - lt) / 2 - 40, YF + lt - 18, topZ - tt - 290 + i * 110, X0 + lt + (dx1 - X0 - lt) / 2 + 40, YF + lt - 8, topZ - tt - 280 + i * 110); }
  // vice on the right front corner
  const vx = X1 - 140; a.box(vx - 60, YF + 90, topZ, vx + 60, YF + 170, topZ + 80); a.box(vx - 60, YF + 30, topZ + 15, vx + 60, YF + 70, topZ + 80); bar(a, [vx, YF + 30, topZ + 45], [vx, YF + 8, topZ + 45], 9, 8); bar(a, [vx - 50, YF + 8, topZ + 45], [vx + 50, YF + 8, topZ + 45], 6, 6);
  // pegboard back and hooks
  a.box(X0 + 20, YB - 25, topZ + 100, X1 - 20, YB, Z1);
  const nh = m.floor(W / 140);
  for (let i = 0; i < nh; i++) { const x = X0 + 110 + ((W - 220) * i) / (nh - 1); bar(a, [x, YB - 25, topZ + 260], [x, YB - 140, topZ + 260], 5, 6); a.box(x - 5, YB - 140, topZ + 260, x + 5, YB - 128, topZ + 300); }
  a.box(X0 + 20, YB - 90, topZ + 100, X1 - 20, YB - 25, topZ + 118); a.box(X0 + 20, YB - 90, topZ + 100, X1 - 20, YB - 80, topZ + 150);
  a.rect(vx - 60, YF + 8, vx + 60, YF + 170, 'EQUIP-DETAIL'); a.rect(X0 + 20, YB - 25, X1 - 20, YB, 'EQUIP-DETAIL'); a.rect(X0 + lt, YF + lt, dx1, YB - lt, 'EQUIP-DETAIL');
  a.log('Added the thick top on four legs with a lower shelf, a three-drawer pedestal, a vice with screw handle at the front right, and a pegboard back with a tool shelf and hooks (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ models
/** a rail truck bogie: frame, two axles with wheels */
function bogie(a, cy, w, r, wb, z0) { for (const dy of [-wb / 2, wb / 2]) { whl(a, a.cx - w * 0.32, cy + dy, r, w * 0.09, z0 + r); whl(a, a.cx + w * 0.32, cy + dy, r, w * 0.09, z0 + r); a.xcyl(a.cx - w * 0.32, a.cx + w * 0.32, cy + dy, z0 + r, r * 0.12, 6); } a.box(a.cx - w * 0.36, cy - wb / 2 - r * 0.3, z0 + r * 1.6, a.cx + w * 0.36, cy + wb / 2 + r * 0.3, z0 + r * 2.05); }
function steamLoco(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, loco = D * 0.62, dr = H * 0.2, bz = Z0 + dr * 1.2, br = H * 0.24, tw = W * 0.9;
  a.outline();
  const by = YF + 0.0 * D; // locomotive occupies the front
  // frame, boiler, smokebox, chimney, domes, cab, cylinders, wheels with rods
  a.box(cx - W * 0.4, YF + D * 0.01, Z0 + dr * 1.05, cx + W * 0.4, YF + loco, Z0 + dr * 1.35);
  a.ycyl(YF + D * 0.04, YF + loco - D * 0.14, cx, bz + br, br, 16); a.ycyl(YF + D * 0.01, YF + D * 0.1, cx, bz + br, br * 1.05, 16);
  a.cyl(cx, YF + D * 0.05, bz + br * 1.9, bz + br * 2.5, br * 0.22, 10); a.cone(cx, YF + D * 0.05, bz + br * 2.5, bz + br * 2.75, br * 0.22, br * 0.4, 10);
  a.cyl(cx, YF + loco * 0.42, bz + br * 1.95, bz + br * 2.4, br * 0.3, 12); a.cyl(cx, YF + loco * 0.64, bz + br * 1.95, bz + br * 2.2, br * 0.2, 10);
  a.box(cx - W * 0.4, YF + loco - D * 0.15, bz + dr * 0.1, cx + W * 0.4, YF + loco, Z1 - H * 0.04); a.box(cx - W * 0.46, YF + loco - D * 0.17, Z1 - H * 0.12, cx + W * 0.46, YF + loco + D * 0.01, Z1 - H * 0.04);
  for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.42 - 1, YF + loco - D * 0.12, bz + H * 0.35, cx + sx * W * 0.42 + 1, YF + loco - D * 0.06, bz + H * 0.52); a.ycyl(YF + D * 0.05, YF + D * 0.15, cx + sx * W * 0.34, bz + br * 0.1, br * 0.3, 8); }
  const ys = [YF + loco * 0.34, YF + loco * 0.54, YF + loco * 0.74];
  for (const y of ys) for (const sx of [-1, 1]) whl(a, cx + sx * W * 0.36, y, dr, W * 0.08, Z0 + dr);
  for (const sx of [-1, 1]) { bar(a, [cx + sx * W * 0.4, ys[0], Z0 + dr * 1.1], [cx + sx * W * 0.4, ys[2], Z0 + dr * 1.1], H * 0.012, 5); a.line(cx + sx * W * 0.4, ys[0], cx + sx * W * 0.4, ys[2], 'EQUIP-DETAIL'); }
  for (const sx of [-1, 1]) whl(a, cx + sx * W * 0.36, YF + D * 0.12, dr * 0.55, W * 0.07, Z0 + dr * 0.55);
  // tender
  const ty0 = YF + loco + D * 0.03; a.box(cx - W * 0.44, ty0, Z0 + dr * 1.05, cx + W * 0.44, YB - D * 0.01, Z0 + H * 0.52); a.box(cx - W * 0.3, ty0 + D * 0.03, Z0 + H * 0.52, cx + W * 0.3, YB - D * 0.05, Z0 + H * 0.64);
  for (const y of [ty0 + (YB - ty0) * 0.25, ty0 + (YB - ty0) * 0.5, ty0 + (YB - ty0) * 0.75]) for (const sx of [-1, 1]) whl(a, cx + sx * W * 0.36, y, dr * 0.62, W * 0.07, Z0 + dr * 0.62);
  a.rect(cx - W * 0.44, ty0, cx + W * 0.44, YB - D * 0.01, 'EQUIP-DETAIL'); a.circ(cx, YF + D * 0.05, br * 0.22, 'EQUIP-DETAIL'); a.rect(cx - W * 0.4, YF + loco - D * 0.15, cx + W * 0.4, YF + loco, 'EQUIP-DETAIL');
  a.log('Added the frame, boiler with smokebox, chimney, steam dome and sand dome, cab with roof, cylinders, three driving wheels per side with coupling rods, pony wheels and a coal tender on three axles (plan and 3D).');
}

function dieselLoco(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, rr = H * 0.14, deck = Z0 + H * 0.3;
  a.outline();
  a.box(cx - W * 0.46, YF, deck - H * 0.06, cx + W * 0.46, YB, deck);
  a.box(cx - W * 0.44, YF + D * 0.04, deck, cx + W * 0.44, YB - D * 0.04, deck + H * 0.12);   // walkway under the hood
  a.box(cx - W * 0.38, YF + D * 0.06, deck + H * 0.12, cx + W * 0.38, YF + D * 0.64, Z0 + H * 0.74);    // long hood
  a.box(cx - W * 0.44, YF + D * 0.64, deck, cx + W * 0.44, YF + D * 0.88, Z1 - H * 0.02);               // cab
  a.box(cx - W * 0.46, YF + D * 0.62, Z1 - H * 0.08, cx + W * 0.46, YF + D * 0.9, Z1);                  // cab roof
  a.box(cx - W * 0.38, YF + D * 0.88, deck, cx + W * 0.38, YB - D * 0.05, Z0 + H * 0.6);                // short hood
  for (const y of [YF + D * 0.2, YF + D * 0.38, YF + D * 0.54]) a.cyl(cx, y, Z0 + H * 0.74, Z0 + H * 0.82, W * 0.2, 14);   // roof fans
  for (const sx of [-1, 1]) for (const y of [YF + D * 0.7, YF + D * 0.8]) a.box(cx + sx * W * 0.44 - 0.5, y, deck + H * 0.25, cx + sx * W * 0.44 + 0.5, y + D * 0.06, deck + H * 0.5);
  a.box(cx - W * 0.28, YF + D * 0.3, Z0 + H * 0.12, cx + W * 0.28, YF + D * 0.7, deck - H * 0.06);       // fuel tank
  for (const y of [YF + D * 0.2, YB - D * 0.2]) bogie(a, y, W, rr, D * 0.2, Z0);
  for (const sx of [-1, 1]) { bar(a, [cx + sx * W * 0.45, YF + D * 0.02, deck + H * 0.12], [cx + sx * W * 0.45, YF + D * 0.58, deck + H * 0.2], H * 0.012, 5); }
  a.box(cx - W * 0.1, YF - 0, deck - H * 0.04, cx + W * 0.1, YF + D * 0.02, deck + 3);
  a.rect(cx - W * 0.38, YF + D * 0.06, cx + W * 0.38, YF + D * 0.64, 'EQUIP-DETAIL'); a.rect(cx - W * 0.44, YF + D * 0.64, cx + W * 0.44, YF + D * 0.88, 'EQUIP-DETAIL');
  for (const y of [YF + D * 0.2, YF + D * 0.38, YF + D * 0.54]) a.circ(cx, y, W * 0.2, 'EQUIP-DETAIL');
  a.log('Added the underframe with fuel tank, long hood with three roof fans, the cab with window openings, a short hood, side handrails, couplers and two bogies with wheels (plan and 3D).');
}

function wagon(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, rr = H * 0.14, fz = Z0 + rr * 2.2, kind = v.kind;
  a.outline();
  a.box(cx - W * 0.46, YF, fz - H * 0.06, cx + W * 0.46, YB, fz);
  for (const y of [YF + D * 0.18, YB - D * 0.18]) bogie(a, y, W, rr, D * 0.14, Z0);
  a.box(cx - W * 0.08, YF - 0, fz - H * 0.03, cx + W * 0.08, YF + D * 0.015, fz); a.box(cx - W * 0.08, YB - D * 0.015, fz - H * 0.03, cx + W * 0.08, YB, fz);
  if (kind === 'box') {
    a.box(cx - W * 0.44, YF + D * 0.04, fz, cx + W * 0.44, YB - D * 0.04, Z1 - H * 0.1);
    prismX(a, [[YF + D * 0.04, Z1 - H * 0.1], [YB - D * 0.04, Z1 - H * 0.1], [YB - D * 0.1, Z1], [YF + D * 0.1, Z1]], cx - W * 0.44, cx + W * 0.44);
    for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.445 - 1, cy0(a) - D * 0.1, fz + H * 0.06, cx + sx * W * 0.445 + 1, cy0(a) + D * 0.1, Z1 - H * 0.16); a.box(cx + sx * W * 0.446 - 1.5, cy0(a) - D * 0.1, Z1 - H * 0.18, cx + sx * W * 0.446 + 1.5, cy0(a) + D * 0.1, Z1 - H * 0.16); for (const y of [YF + D * 0.05, YB - D * 0.05]) bar(a, [cx + sx * W * 0.46, y, fz + H * 0.02], [cx + sx * W * 0.46, y, Z1 - H * 0.14], 0.9, 4); }
  } else if (kind === 'tank') {
    a.ycyl(YF + D * 0.06, YB - D * 0.06, cx, fz + H * 0.3, H * 0.3, 20); a.cone(cx, YF + D * 0.06, fz + H * 0.3, fz + H * 0.3, 1, 1, 3);
    a.cyl(cx, cy0(a), fz + H * 0.55, Z1 - H * 0.08, W * 0.12, 12); a.cyl(cx, cy0(a), Z1 - H * 0.08, Z1, W * 0.14, 12);
    a.box(cx - W * 0.3, YF + D * 0.2, fz, cx + W * 0.3, YB - D * 0.2, fz + H * 0.08); a.box(cx - W * 0.46, cy0(a) - D * 0.35, Z1 - H * 0.1, cx + W * 0.46, cy0(a) + D * 0.35, Z1 - H * 0.09 + 0.01);
    for (const sx of [-1, 1]) bar(a, [cx + sx * W * 0.34, YF + D * 0.08, fz + H * 0.1], [cx + sx * W * 0.34, YF + D * 0.08, Z1 - H * 0.3], 0.8, 4);
    a.circ(cx, cy0(a), W * 0.14, 'EQUIP-DETAIL');
  } else {
    const wt = W * 0.03; a.box(cx - W * 0.44, YF + D * 0.04, fz, cx + W * 0.44, YB - D * 0.04, fz + H * 0.04);
    a.box(cx - W * 0.44, YF + D * 0.04, fz, cx - W * 0.44 + wt, YB - D * 0.04, Z1 - H * 0.04); a.box(cx + W * 0.44 - wt, YF + D * 0.04, fz, cx + W * 0.44, YB - D * 0.04, Z1 - H * 0.04);
    a.box(cx - W * 0.44, YF + D * 0.04, fz, cx + W * 0.44, YF + D * 0.04 + wt, Z1 - H * 0.04); a.box(cx - W * 0.44, YB - D * 0.04 - wt, fz, cx + W * 0.44, YB - D * 0.04, Z1 - H * 0.04);
    for (let i = 0; i < 4; i++) { const y = YF + D * (0.15 + i * 0.2); a.box(cx - W * 0.44 - 0.6, y, fz, cx - W * 0.44, y + 1.5, Z1 - H * 0.04); a.box(cx + W * 0.44, y, fz, cx + W * 0.44 + 0.6, y + 1.5, Z1 - H * 0.04); }
    ell0(a, cx, YF + D * 0.5, fz + H * 0.14, W * 0.38, D * 0.4, H * 0.2);
  }
  a.rect(cx - W * 0.44, YF + D * 0.04, cx + W * 0.44, YB - D * 0.04, 'EQUIP-DETAIL');
  a.log('Added the underframe with couplers and two bogies, ' + (kind === 'box' ? 'the closed body with roof, sliding door with rail and ladders' : kind === 'tank' ? 'a round tank on a saddle frame with dome, walkway and ladders' : 'an open body with ribbed side walls and a heaped load') + ' (plan and 3D).');
}
const cy0 = (a) => (a.YF + a.YB) / 2;
const ell0 = (a, x, y, z, rx, ry, rz) => a.ell(x, y, z, rx, ry, rz, 12, 5);

/** a small propeller aircraft: monoplane or biplane */
function modelPlane(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, R = H * 0.11, zc = Z0 + H * 0.36, bi = v.bi;
  a.outline();
  const st = [[0, 0.5], [0.06, 0.95], [0.2, 1], [0.5, 0.85], [0.8, 0.5], [0.97, 0.22]];
  a.tube(st.map(([f]) => [cx, YF + D * (0.1 + f * 0.86), zc + (f > 0.5 ? (f - 0.5) * R * 1.6 : 0)]), st.map(([, r]) => R * r), 14);
  a.ycyl(YF + D * 0.05, YF + D * 0.14, cx, zc, R * 0.95, 14); a.cone(cx, YF + D * 0.04, zc, zc, 1, 1, 3); a.ell(cx, YF + D * 0.04, zc, R * 0.3, D * 0.012, R * 0.3, 8, 4);
  a.box(cx - 8, YF + D * 0.02, zc - H * 0.2, cx + 8, YF + D * 0.035, zc + H * 0.2);     // propeller
  a.box(cx - R * 0.5, YF + D * 0.22, zc + R * 0.7, cx + R * 0.5, YF + D * 0.38, zc + R * 1.35);   // canopy
  const wy = YF + D * 0.3, ch = D * 0.2;
  const wing = (z, span, ch2, th) => { for (const s of [-1, 1]) { const pts = [[cx + s * R * 0.4, wy], [cx + s * span, wy + ch2 * 0.12], [cx + s * span, wy + ch2 * 0.12 + ch2 * 0.6], [cx + s * R * 0.4, wy + ch2]]; a.prism(s > 0 ? pts : pts.slice().reverse(), z, z + th); a.poly(pts); } };
  if (bi) {
    wing(zc + R * 1.1 + H * 0.22, W / 2 - 3, ch * 0.95, 4); wing(zc - R * 0.4, W / 2 - 8, ch * 0.95, 4);
    for (const s of [-1, 1]) for (const f of [0.4, 0.8]) { const x = cx + s * (W / 2 - 8) * f; bar(a, [x, wy + ch * 0.2, zc - R * 0.4 + 4], [x, wy + ch * 0.2, zc + R * 1.1 + H * 0.22], 2.4, 5); bar(a, [x, wy + ch * 0.8, zc - R * 0.4 + 4], [x, wy + ch * 0.8, zc + R * 1.1 + H * 0.22], 2.4, 5); }
    for (const s of [-1, 1]) bar(a, [cx + s * R * 0.5, wy + ch * 0.5, zc + R * 0.5], [cx + s * R * 0.5, wy + ch * 0.5, zc + R * 1.1 + H * 0.22], 2.4, 5);
  } else wing(zc - R * 0.2, W / 2 - 3, ch, 5);
  // tail
  const ty = YB - D * 0.12; a.box(cx - 2.5, ty, zc + R * 0.1, cx + 2.5, YB - 3, zc + R * 2.4);
  for (const s of [-1, 1]) { const pts = [[cx + s * 3, ty], [cx + s * W * 0.17, ty + D * 0.02], [cx + s * W * 0.17, ty + D * 0.07], [cx + s * 3, ty + D * 0.1]]; a.prism(s > 0 ? pts : pts.slice().reverse(), zc + R * 0.3, zc + R * 0.3 + 3); a.poly(pts); }
  // gear
  for (const s of [-1, 1]) { const x = cx + s * W * 0.1, y = wy + ch * 0.4; bar(a, [x, y, zc - R * 0.5], [x + s * 3, y, Z0 + H * 0.12], 2.5, 5); whl(a, x + s * 3, y, H * 0.12, 6, Z0 + H * 0.12); }
  bar(a, [cx, YB - D * 0.07, zc], [cx, YB - D * 0.07, Z0 + 8], 1.5, 4); whl(a, cx, YB - D * 0.07, 7, 3, Z0 + 7);
  a.line(cx, YF + D * 0.04, cx, YB, 'EQUIP-DETAIL');
  a.log('Added the fuselage, nose cowl with propeller and canopy, ' + (bi ? 'two staggered wings with interplane and cabane struts' : 'a low wing') + ', fin, tailplanes and main and tail wheels (plan and 3D).');
}

function tallShip(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, hh = H * 0.22, layers = 6, nm = v.masts;
  a.outline();
  for (let k = 0; k < layers; k++) {
    const f0 = k / layers, f1 = (k + 1) / layers, wf = 0.55 + 0.45 * f0 ** 0.7, z0 = Z0 + hh * f0, z1 = Z0 + hh * f1, hw = (W * 0.42) * wf;
    a.prism([[cx - hw * 0.05, YF + D * 0.05], [cx + hw * 0.05, YF + D * 0.05], [cx + hw * 0.55, YF + D * 0.2], [cx + hw, YF + D * 0.42], [cx + hw, YB - D * 0.14], [cx + hw * 0.8, YB - D * 0.03], [cx - hw * 0.8, YB - D * 0.03], [cx - hw, YB - D * 0.14], [cx - hw, YF + D * 0.42], [cx - hw * 0.55, YF + D * 0.2]], z0, z1);
  }
  const dz = Z0 + hh;
  a.box(cx - W * 0.34, YB - D * 0.28, dz, cx + W * 0.34, YB - D * 0.04, dz + H * 0.08);          // aft castle
  a.box(cx - W * 0.28, YF + D * 0.1, dz, cx + W * 0.28, YF + D * 0.2, dz + H * 0.05);              // forecastle
  bar(a, [cx, YF + D * 0.08, dz + H * 0.03], [cx, YF - 0 + 0.5, dz + H * 0.2], 3, 6);                // bowsprit
  for (let i = 0; i < nm; i++) {
    const y = YF + D * (nm === 1 ? 0.5 : 0.28 + (0.4 * i) / (nm - 1)), mh = (H - hh) * (i === 1 || nm === 1 ? 1 : 0.88);
    a.cyl(cx, y, dz, dz + mh, 4, 8);
    for (const [fz, fw] of [[0.28, 0.9], [0.55, 0.72], [0.78, 0.52]]) { const zz = dz + mh * fz, hw = W * 0.5 * fw * 0.95; a.xcyl(cx - hw, cx + hw, y, zz, 2.2, 6); a.box(cx - hw * 0.92, y - 4.5, zz - mh * 0.2, cx + hw * 0.92, y - 1.5, zz - 3); }
  }
  a.rect(cx - W * 0.4, YF + D * 0.05, cx + W * 0.4, YB - D * 0.03, 'EQUIP-DETAIL'); for (let i = 0; i < nm; i++) a.circ(cx, YF + D * (nm === 1 ? 0.5 : 0.28 + (0.4 * i) / (nm - 1)), 5, 'EQUIP-DETAIL');
  a.log('Added the layered hull with forecastle and aft castle, a bowsprit, ' + nm + ' masts each with three yards and a square sail, on the hull (plan and 3D).');
}

function diorama(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bt = H * 0.08;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bt);
  a.box(X0 + 8, YF + 8, Z0 + bt, X1 - 8, YB - 8, Z0 + bt + H * 0.04);
  // rolling hill and cliff stack of prisms on the left rear
  const hx = X0 + W * 0.28, hy = YB - D * 0.32;
  for (let k = 0; k < 6; k++) { const r = 1 - k * 0.16, z0 = Z0 + bt + H * 0.04 + k * H * 0.07; a.prism(Array.from({ length: 14 }, (_, i) => [hx + W * 0.24 * r * m.cos((i * TAU) / 14), hy + D * 0.26 * r * m.sin((i * TAU) / 14)]), z0, z0 + H * 0.07); }
  a.circ(hx, hy, W * 0.24, 'EQUIP-DETAIL');
  // a track strip crossing the front
  a.box(X0 + 8, YF + D * 0.22, Z0 + bt + H * 0.04, X1 - 8, YF + D * 0.4, Z0 + bt + H * 0.075);
  for (let i = 0; i < W / 70; i++) a.box(X0 + 20 + i * 14 * 5, YF + D * 0.23, Z0 + bt + H * 0.075, X0 + 20 + i * 14 * 5 + 4, YF + D * 0.39, Z0 + bt + H * 0.085);
  for (const y of [YF + D * 0.27, YF + D * 0.35]) a.box(X0 + 8, y - 1.5, Z0 + bt + H * 0.085, X1 - 8, y + 1.5, Z0 + bt + H * 0.1);
  // building and trees
  const bx = X1 - W * 0.26, by = YB - D * 0.3; a.box(bx - W * 0.1, by - D * 0.14, Z0 + bt + H * 0.04, bx + W * 0.1, by + D * 0.14, Z0 + bt + H * 0.42);
  prismX(a, [[by - D * 0.15, Z0 + bt + H * 0.42], [by + D * 0.15, Z0 + bt + H * 0.42], [by, Z0 + bt + H * 0.6]], bx - W * 0.11, bx + W * 0.11);
  for (let i = 0; i < v.trees; i++) { const x = X0 + W * (0.12 + 0.76 * ((i * 0.37) % 1)), y = YF + D * (0.5 + 0.4 * ((i * 0.53) % 1)) * 0.9 + D * 0.06; if (m.abs(x - hx) < W * 0.2 && y > hy - D * 0.25) continue; a.cyl(x, y, Z0 + bt + H * 0.04, Z0 + bt + H * 0.15, 3, 6); a.cone(x, y, Z0 + bt + H * 0.1, Z0 + bt + H * 0.3, W * 0.03, 2, 8); a.cone(x, y, Z0 + bt + H * 0.24, Z0 + bt + H * 0.4, W * 0.022, 1, 8); a.circ(x, y, W * 0.03, 'EQUIP-DETAIL'); }
  a.rect(bx - W * 0.1, by - D * 0.14, bx + W * 0.1, by + D * 0.14, 'EQUIP-DETAIL'); a.rect(X0 + 8, YF + D * 0.22, X1 - 8, YF + D * 0.4, 'EQUIP-DETAIL');
  a.log('Added the base board with ground layer, a stepped hill, a railway track strip with sleepers and rails, a gabled building and ' + v.trees + ' trees (plan and 3D).');
}

function sprue(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = H * 0.3, fr = 5;
  a.outline();
  a.box(X0, YF, Z0, X1, YF + fr, Z0 + t); a.box(X0, YB - fr, Z0, X1, YB, Z0 + t); a.box(X0, YF, Z0, X0 + fr, YB, Z0 + t); a.box(X1 - fr, YF, Z0, X1, YB, Z0 + t);
  const nx = v.cols, ny = v.rows;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = X0 + fr + ((W - 2 * fr) * (i + 0.5)) / nx, y = YF + fr + ((D - 2 * fr) * (j + 0.5)) / ny, k = (i + j * 3) % 4, sw = (W - 2 * fr) / nx * 0.5, sd = (D - 2 * fr) / ny * 0.5;
    a.box(x - 1.5, y - (D - 2 * fr) / ny * 0.5, Z0, x + 1.5, y + (D - 2 * fr) / ny * 0.5, Z0 + t * 0.6);
    if (k === 0) { a.box(x - sw / 2, y - sd / 2, Z0, x + sw / 2, y + sd / 2, Z0 + H * 0.7); a.cyl(x, y, Z0 + H * 0.7, Z0 + H, sw * 0.18, 8); }
    else if (k === 1) { a.cyl(x, y, Z0, Z0 + H * 0.8, sw * 0.35, 12); ring(a, 'z', x, y, Z0 + H * 0.8, Z0 + H, sw * 0.12, sw * 0.35, 12); }
    else if (k === 2) { prismY(a, [[x - sw / 2, Z0], [x + sw / 2, Z0], [x, Z0 + H * 0.9]], y - sd * 0.4, y + sd * 0.4); }
    else { a.box(x - sw / 2, y - sd * 0.1, Z0, x + sw / 2, y + sd * 0.1, Z0 + H * 0.5); a.box(x - sw * 0.1, y - sd / 2, Z0, x + sw * 0.1, y + sd / 2, Z0 + H * 0.5); }
    a.rect(x - sw / 2, y - sd / 2, x + sw / 2, y + sd / 2, 'EQUIP-DETAIL');
  }
  a.box(X0 + 4, YF + fr, Z0 + t, X0 + 14, YF + fr + 10, Z0 + t + 3);
  a.log('Added the sprue frame with a gate to each of ' + nx * ny + ' kit parts: blocks, round pegs with a hole, a tapered fin and cross pieces (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ collecting
function vitrine(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, bh = H * 0.32, t = 14;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bh); a.box(X0 - 3, YF - 3, Z0 + bh * 0.9, X1 + 3, YB, Z0 + bh);
  a.box(X0 + 8, YF + 4, Z0 + bh * 0.3, X1 - 8, YF + 7, Z0 + bh * 0.8); a.box(X0 + 30, YF + 2, Z0 + bh * 0.45, X0 + 70, YF + 8, Z0 + bh * 0.55);
  const gz0 = Z0 + bh;
  for (const [x, y] of [[X0, YF + 3], [X1 - t, YF + 3], [X0, YB - t], [X1 - t, YB - t]]) a.box(x, y, gz0, x + t, y + t, Z1);
  a.frame(X0, Z1 - t, X1, Z1, YF + 3, YB, t); a.box(X0, YF + 3, Z1 - t, X1, YB, Z1 - t + 0.01);
  for (const y of [YF + 3, YB - t]) { a.box(X0, y, gz0, X1, y + t, gz0 + t); a.box(X0, y, Z1 - t, X1, y + t, Z1); }
  for (const x of [X0, X1 - t]) { a.box(x, YF + 3, gz0, x + t, YB, gz0 + t); a.box(x, YF + 3, Z1 - t, x + t, YB, Z1); }
  const sh = v.shelves; for (let i = 1; i <= sh; i++) { const z = gz0 + ((Z1 - gz0) * i) / (sh + 1); a.box(X0 + t, YF + 6, z, X1 - t, YB - 4, z + 6); }
  const sy = (YF + YB) / 2, n = m.max(3, m.floor(W / 140));
  for (let i = 0; i < n; i++) { const x = X0 + t + 50 + ((W - 2 * t - 100) * i) / (n - 1); const z = gz0 + 3; if (i % 3 === 0) lathe(a, x, sy, z, z + (Z1 - gz0) / (sh + 1) * 0.6, [14, 9, 14, 20, 24]); else if (i % 3 === 1) a.box(x - 25, sy - 18, z, x + 25, sy + 18, z + 28); else { a.ell(x, sy, z + 16, 24, 24, 16, 10, 5); } }
  for (let k = 1; k <= sh; k++) { const z = gz0 + ((Z1 - gz0) * k) / (sh + 1) + 6; for (let i = 0; i < n; i++) { const x = X0 + t + 40 + ((W - 2 * t - 80) * i) / (n - 1); a.box(x - 16, sy - 12, z, x + 16, sy + 12, z + 18); } }
  a.rect(X0 + t, YF + 6, X1 - t, YB - 4, 'EQUIP-DETAIL'); for (const [x, y] of [[X0, YF + 3], [X1 - t, YF + 3], [X0, YB - t], [X1 - t, YB - t]]) a.rect(x, y, x + t, y + t, 'EQUIP-DETAIL');
  a.log('Added the cabinet base with a front panel and lock, four corner posts with top and bottom frames forming the open glass case, ' + sh + ' glass shelf level' + (sh > 1 ? 's' : '') + ' and display pieces on them (plan and 3D).');
}

function curio(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 20, pl = H * 0.08, cr = H * 0.04;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + pl); a.box(X0 - 6, YF - 6, Z1 - cr, X1 + 6, YB, Z1); a.box(X0 + 4, YF + 4, Z1 - cr * 1.9, X1 - 4, YB, Z1 - cr);
  a.box(X0, YF + 10, Z0 + pl, X0 + t, YB, Z1 - cr * 1.9); a.box(X1 - t, YF + 10, Z0 + pl, X1, YB, Z1 - cr * 1.9); a.box(X0 + t, YB - 8, Z0 + pl, X1 - t, YB, Z1 - cr * 1.9);
  a.box(X0 + t, YF + 10, Z0 + pl, X1 - t, YB - 8, Z0 + pl + 20);
  const doors = v.doors, iw = (W - 2 * t) / doors;
  for (let d = 0; d < doors; d++) { const x0 = X0 + t + d * iw + 2, x1 = X0 + t + (d + 1) * iw - 2; a.frame(x0, Z0 + pl + 24, x1, Z1 - cr * 1.9 - 4, YF - 2, YF + 14, 24); const hx = d % 2 === 0 ? x1 - 36 : x0 + 36; a.box(hx - 4, YF - 14, (Z0 + Z1) / 2 - 50, hx + 4, YF - 2, (Z0 + Z1) / 2 + 50); a.arc(d % 2 === 0 ? x0 : x1, YF, x1 - x0, d % 2 === 0 ? 270 : 180, d % 2 === 0 ? 360 : 270); }
  const sh = v.shelves, top = Z1 - cr * 1.9 - 24, bot = Z0 + pl + 24;
  for (let i = 1; i < sh; i++) { const z = bot + ((top - bot) * i) / sh; a.box(X0 + t, YF + 16, z, X1 - t, YB - 8, z + 8); }
  const sy = (YF + YB) / 2 + 6;
  for (let i = 0; i <= sh; i++) { const z = i === 0 ? bot + 20 : bot + ((top - bot) * i) / sh + 8; const hgt = (top - bot) / sh * 0.5; for (let k = 0; k < doors * 2; k++) { const x = X0 + t + 40 + ((W - 2 * t - 80) * k) / (doors * 2 - 1); if (k % 2) lathe(a, x, sy, z, z + hgt, [16, 24, 30, 24, 14, 10]); else a.box(x - 24, sy - 20, z, x + 24, sy + 20, z + hgt * 0.5); } }
  a.rect(X0, YF, X1, YB, 'EQUIP'); for (let d = 0; d < doors; d++) a.line(X0 + t + d * iw, YF, X0 + t + d * iw, YB, 'EQUIP-DETAIL');
  a.log('Added the plinth, carcass sides and mirror back, a crown moulding, ' + doors + ' framed glass door' + (doors > 1 ? 's' : '') + ' with handles, ' + (sh - 1) + ' glass shelves and display vases and boxes (plan and 3D).');
}

function drawerCabinet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, leg = H * 0.1, cols = v.cols, rows = v.rows, t = 14;
  a.outline();
  for (const [x, y] of [[X0 + 10, YF + 10], [X1 - 10, YF + 10], [X0 + 10, YB - 10], [X1 - 10, YB - 10]]) a.box(x - 12, y - 12, Z0, x + 12, y + 12, Z0 + leg);
  a.box(X0, YF, Z0 + leg, X1, YB, Z1 - t); a.box(X0 - 4, YF - 4, Z1 - t, X1 + 4, YB, Z1);
  const dw = (W - 2 * t) / cols, dh = (Z1 - t - Z0 - leg - 2 * t) / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const x0 = X0 + t + c * dw + 3, x1 = X0 + t + (c + 1) * dw - 3, z0 = Z0 + leg + t + r * dh + 3, z1 = Z0 + leg + t + (r + 1) * dh - 3;
    a.box(x0, YF - 8, z0, x1, YF, z1); a.box((x0 + x1) / 2 - 18, YF - 16, (z0 + z1) / 2 - 3, (x0 + x1) / 2 + 18, YF - 8, (z0 + z1) / 2 + 3);
    a.box((x0 + x1) / 2 - (x1 - x0) * 0.28, YF - 10, z1 - (z1 - z0) * 0.4, (x0 + x1) / 2 + (x1 - x0) * 0.28, YF - 8, z1 - 3);
  }
  a.line(X0 + t, YF, X0 + t, YB, 'EQUIP-DETAIL'); for (let c = 1; c < cols; c++) a.line(X0 + t + c * dw, YF, X0 + t + c * dw, YB, 'EQUIP-DETAIL');
  a.log('Added the carcass on four short legs with a moulded top, ' + cols * rows + ' shallow drawer fronts each with a pull and a label slot (plan and 3D).');
}

function trophyStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, n = v.tiers, th = H / (n + 0.6);
  a.outline();
  for (let i = 0; i < n; i++) {
    const f = 1 - i * (0.55 / n), hw = W / 2 * f, hd = D / 2 * f, z0 = Z0 + i * th * 0.78, z1 = z0 + th * 0.78;
    a.prism([[cx - hw, cy - hd], [cx + hw, cy - hd], [cx + hw, cy + hd], [cx - hw, cy + hd]], z0, z1); a.rect(cx - hw, cy - hd, cx + hw, cy + hd, 'EQUIP-DETAIL');
    a.box(cx - hw - 3, cy - hd - 3, z1 - 8, cx + hw + 3, cy + hd + 3, z1);
  }
  const topZ = Z0 + n * th * 0.78, ph = Z1 - topZ;
  // cups on the top and a few on lower tiers
  const cup = (x, y, z, s) => { lathe(a, x, y, z, z + s * 0.12, [s * 0.18, s * 0.18]); lathe(a, x, y, z + s * 0.12, z + s * 0.3, [s * 0.04, s * 0.04]); lathe(a, x, y, z + s * 0.3, z + s * 0.95, [s * 0.06, s * 0.22, s * 0.32, s * 0.36, s * 0.34]); for (const sx of [-1, 1]) bar(a, [x + sx * s * 0.34, y, z + s * 0.8], [x + sx * s * 0.46, y, z + s * 0.6], s * 0.022, 5); };
  cup(cx, cy, topZ, ph * 0.98);
  for (let i = 0; i < n - 1; i++) { const f = 1 - i * (0.55 / n), z1 = Z0 + i * th * 0.78 + th * 0.78, nf = 1 - (i + 1) * (0.55 / n); for (const sx of [-1, 1]) cup(cx + sx * (W / 2 * (f + nf) / 2) * 0.85, cy, z1, th * 0.9); }
  a.log('Added ' + n + ' stepped tiers with trim and a large cup on a base on top, plus smaller cups on the lower tiers (plan and 3D).');
}

function vinylRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 16, cols = v.cols, rows = v.rows, cw = (W - t) / cols, ch = (H - t) / rows;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + t); a.box(X0, YF, Z1 - t, X1, YB, Z1);
  for (let c = 0; c <= cols; c++) a.box(X0 + (W - t) * c / cols, YF, Z0, X0 + (W - t) * c / cols + t, YB, Z1);
  for (let r = 1; r < rows; r++) a.box(X0, YF, Z0 + (H - t) * r / rows, X1, YB, Z0 + (H - t) * r / rows + t);
  a.box(X0, YB - 6, Z0, X1, YB, Z1);
  const colours = 0;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const x0 = X0 + (W - t) * c / cols + t, z0 = Z0 + (H - t) * r / rows + t, n = m.max(8, m.floor((cw - t) / 9));
    for (let k = 0; k < n; k++) { const x = x0 + 3 + ((cw - t - 8) * k) / n; const lean = (k % 5) * 0; a.box(x, YF + 6, z0, x + 5, YB - 8, z0 + ch * 0.94 - t - (k % 3) * 6 - lean); }
    a.rect(x0, YF, x0 + cw - t, YB, 'EQUIP-DETAIL');
  }
  void colours;
  a.log('Added the cube frame of ' + cols + ' by ' + rows + ' with a back panel and rows of upright record sleeves in every cube (plan and 3D).');
}

function wallShelf(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 24, rail = v.rail;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + t);
  a.box(X0, YB - 12, Z0 + t, X1, YB, Z1);
  const nb = m.max(2, m.floor(W / 300)); for (let i = 0; i < nb; i++) { const x = X0 + 90 + ((W - 180) * i) / (nb - 1); prismX(a, [[YF + D * 0.15, Z0], [YB, Z0 - 0 - 60 < Z0 ? Z0 : Z0], [YB, Z0 - 0]], x - 6, x + 6); }
  if (rail) { a.box(X0, YF + 12, Z0 + t + 10, X1, YF + 18, Z0 + t + 40); a.box(X0, YF + 8, Z0 + t + 10, X1, YF + 12, Z0 + t + 25); }
  const sy = (YF + YB) / 2, n = m.floor(W / 150);
  for (let i = 0; i < n; i++) { const x = X0 + 75 + ((W - 150) * i) / (n - 1), z = Z0 + t; if (rail) { ring(a, 'y', x, z + 160 * 0 + (H - t) * 0.4, YB - 20, YB - 12, 0, (H - t) * 0.38 > 90 ? 90 : (H - t) * 0.38, 20); } else if (i % 2) lathe(a, x, sy, z, z + (H - t) * 0.7, [20, 28, 36, 28, 18, 12]); else { a.box(x - 30, sy - 28, z, x + 30, sy + 28, z + (H - t) * 0.3); a.ell(x, sy, z + (H - t) * 0.3 + 25, 24, 24, 25, 10, 5); } }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the shelf board on wall brackets with a back panel' + (rail ? ', a plate rail lip and standing plates' : ' and display pieces: vases, boxes and round objects') + ' (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ outdoor
function tackleBox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 6, cy = (YF + YB) / 2, n = v.trays;
  a.outline();
  // lower body
  const bz = Z0 + H * 0.34, y0 = YF + n * D * 0.07; a.box(X0, y0, Z0, X1, YB, bz); a.box(X0 + 4, y0 - 2, Z0 + H * 0.05, X1 - 4, y0, bz - 6);
  // trays fanned forward on two arms
  for (let i = 0; i < n; i++) { const z = bz + i * H * 0.17, fy = y0 - (i + 1) * D * 0.07 + 6; a.box(X0 + 10, fy, z, X1 - 10, YB - 6, z + 4); a.box(X0 + 10, fy, z + 4, X0 + 10 + t, YB - 6, z + H * 0.14); a.box(X1 - 10 - t, fy, z + 4, X1 - 10, YB - 6, z + H * 0.14); a.box(X0 + 10, fy, z + 4, X1 - 10, fy + t, z + H * 0.14); }
  a.box(X0, YF, Z1 - H * 0.12, X1, YB, Z1 - H * 0.06); a.box(X0 + 6, YF + 6, Z1 - H * 0.06, X1 - 6, YB - 6, Z1 - H * 0.03);
  bar(a, [cx - W * 0.3, cy, Z1 - H * 0.03], [cx - W * 0.3, cy, Z1], 6, 6); bar(a, [cx + W * 0.3, cy, Z1 - H * 0.03], [cx + W * 0.3, cy, Z1], 6, 6); bar(a, [cx - W * 0.3, cy, Z1], [cx + W * 0.3, cy, Z1], 6, 6);
  for (const sx of [-1, 1]) { a.box(cx + sx * W * 0.38 - 12, y0 - 6, bz - H * 0.15, cx + sx * W * 0.38 + 12, y0, bz); a.box(cx + sx * W * 0.38 - 12, y0 - 6, Z1 - H * 0.25, cx + sx * W * 0.38 + 12, y0, Z1 - H * 0.12); }
  a.rect(X0 + 10, YF + 6, X1 - 10, YB - 6, 'EQUIP-DETAIL');
  a.log('Added the lower body with front panel, ' + n + ' cantilever trays on the front, a lid with a carrying handle and two latches (plan and 3D).');
}

function rodRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.n, bt = 18;
  a.outline();
  a.box(X0, YB - bt, Z0 + H * 0.12, X1, YB, Z0 + H * 0.12 + 70); a.box(X0, YB - bt, Z1 - H * 0.35, X1, YB, Z1 - H * 0.35 + 70);
  for (let i = 0; i < n; i++) {
    const x = X0 + W * (i + 0.5) / n, hy = YB - bt - 20;
    for (const z of [Z0 + H * 0.12, Z1 - H * 0.35]) { a.box(x - 22, YB - bt - 36, z, x + 22, YB - bt, z + 36); a.box(x - 22, YB - bt - 36, z + 36, x - 10, YB - bt, z + 70); a.box(x + 10, YB - bt - 36, z + 36, x + 22, YB - bt, z + 70); }
    a.cyl(x, hy, Z0 + H * 0.04, Z1 - H * 0.04, 6, 6);       // blank
    a.cyl(x, hy, Z0 + H * 0.04, Z0 + H * 0.2, 11, 8);       // butt grip
    a.cyl(x, hy, Z0 + H * 0.36, Z0 + H * 0.39, 14, 8);      // reel seat
    for (let g = 0; g < 4; g++) ring(a, 'y', x + 6, Z0 + H * (0.45 + g * 0.12), hy - 3, hy + 3, 3.5, 6, 8);
    a.circ(x, hy, 11, 'EQUIP-DETAIL');
  }
  for (const x of [X0 + 25, X1 - 25]) for (const z of [Z0 + H * 0.12 + 35]) a.cyl(x, YB - bt - 2, z, z + 1, 1, 3);
  a.rect(X0, YB - bt, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the wall rail with two rows of notched cradles and ' + n + ' fishing rods standing in them, each with a grip, a reel seat and line guides (plan and 3D).');
}

function domeTent(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, R = m.min(W, D) / 2 - 4;
  a.circ(cx, cy, R); a.outline('EQUIP-DETAIL');
  const lv = 10, rads = [], pts = [];
  for (let i = 0; i <= lv; i++) { const tt = i / lv, ang = (tt * m.PI) / 2; pts.push([cx, cy, Z0 + 6 + (H - 6) * m.sin(ang)]); rads.push(m.max(2, R * m.cos(ang))); }
  a.ring0 = 0; ring(a, 'z', cx, cy, Z0, Z0 + 6, 0, R, 28);
  a.tube(pts, rads, 28);
  for (const ang of [0.3, 0.3 + m.PI / 2]) { const arc = []; for (let i = 0; i <= 14; i++) { const t = -m.PI / 2 + (m.PI * i) / 14; arc.push([cx + R * 1.001 * m.sin(t) * m.cos(ang), cy + R * 1.001 * m.sin(t) * m.sin(ang), Z0 + 6 + (H - 6) * m.cos(t) * 0.99]); } a.tube(arc, arc.map(() => 5), 6); a.line(cx - R * m.cos(ang), cy - R * m.sin(ang), cx + R * m.cos(ang), cy + R * m.sin(ang), 'EQUIP-DETAIL'); }
  // door arch on the front and a vestibule
  a.frame(cx - R * 0.3, Z0 + 6, cx + R * 0.3, Z0 + H * 0.55, YF + R * 0.02, YF + R * 0.2, 10);
  a.log('Added the groundsheet, the round dome canopy, two crossing pole arcs and a framed front door (plan and 3D).');
}

function tunnelTent(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.hoops, R = W / 2 - 3;
  a.outline();
  a.box(X0 + 3, YF + 2, Z0, X1 - 3, YB - 2, Z0 + 4);
  const y0 = YF + D * 0.12, y1 = YB - 2;
  ring(a, 'y', cx, Z0 + 4, y0, y1, R - 5, R, 24, 0, m.PI);
  const vh = D * 0.12; ring(a, 'y', cx, Z0 + 4, YF + 2, y0, R * 0.7 - 5, R * 0.7, 20, 0, m.PI);
  for (let i = 0; i < n; i++) { const y = y0 + ((y1 - y0 - 10) * i) / (n - 1) + 5; ring(a, 'y', cx, Z0 + 4, y - 4, y + 4, R - 14, R + 2, 24, 0, m.PI); a.line(cx - R, y, cx + R, y, 'EQUIP-DETAIL'); }
  a.box(cx - R * 0.3, y0 - 2, Z0 + 4, cx + R * 0.3, y0 + 2, Z0 + 4 + R * 0.9); void vh;
  for (const sx of [-1, 1]) for (const y of [YF + 4, YB - 6]) bar(a, [cx + sx * (R + 10), y, Z0 + 3], [cx + sx * (R + 40), y + (y < (YF + YB) / 2 ? -0 : 0), Z0 + 1], 2, 4);
  a.log('Added the groundsheet, a half-round tunnel shell with ' + n + ' hoops and a smaller front porch with a door panel (plan and 3D).');
}

function campStove(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 10, bh = H * 0.34, nb = v.burners;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 6); a.box(X0, YF, Z0, X1, YF + t, Z0 + bh); a.box(X0, YB - t, Z0, X1, YB, Z0 + bh); a.box(X0, YF, Z0, X0 + t, YB, Z0 + bh); a.box(X1 - t, YF, Z0, X1, YB, Z0 + bh);
  a.box(X0 + 4, YF - 10, Z0 + bh * 0.25, X0 + 70, YF, Z0 + bh * 0.55);
  for (let i = 0; i < nb; i++) {
    const x = X0 + W * (i + 0.5) / nb, y = (YF + YB) / 2, br = m.min(D * 0.24, W / nb * 0.3);
    ring(a, 'z', x, y, Z0 + 6, Z0 + bh * 0.8, 0, br, 16); ring(a, 'z', x, y, Z0 + bh * 0.8, Z0 + bh, br * 0.45, br * 0.8, 16);
    for (let k = 0; k < 4; k++) { const g = (k * m.PI) / 2 + 0.78; a.box(x + m.cos(g) * br * 1.05 - 6, y + m.sin(g) * br * 1.05 - 6, Z0 + bh, x + m.cos(g) * br * 1.05 + 6, y + m.sin(g) * br * 1.05 + 6, Z0 + bh + 14); }
    a.box(x - br * 1.3, y - 3, Z0 + bh + 12, x + br * 1.3, y + 3, Z0 + bh + 17); a.box(x - 3, y - br * 1.3, Z0 + bh + 12, x + 3, y + br * 1.3, Z0 + bh + 17);
    a.xcyl(x - 8, x + 8, YF - 4, Z0 + bh * 0.45, 9, 10); a.circ(x, y, br, 'EQUIP-DETAIL');
  }
  a.box(X0, YB - 6, Z0 + bh, X1, YB, Z1); a.box(X0, YB - 6, Z1 - 8, X1, YB, Z1);
  for (const sx of [-1, 1]) prismX(a, [[YB - 6, Z0 + bh], [YB - 6, Z1 - 8], [YB - 70, Z0 + bh]], cx + sx * (W / 2 - 6) - 3, cx + sx * (W / 2 - 6) + 3);
  a.log('Added the suitcase tray with a front panel, ' + nb + ' burner' + (nb > 1 ? 's' : '') + ' with grates and pot supports, control knobs, a standing back windscreen with side wings (plan and 3D).');
}

function packStove(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, cr = m.min(W, D) * 0.2;
  a.circ(cx, cy, W / 2 - 1); a.outline('EQUIP-DETAIL');
  a.cyl(cx, cy, Z0, Z0 + H * 0.4, cr, 20); ring(a, 'z', cx, cy, Z0 + H * 0.4, Z0 + H * 0.44, 0, cr * 0.8, 16);   // canister
  a.cyl(cx, cy, Z0 + H * 0.44, Z0 + H * 0.56, 5, 8); a.cone(cx, cy, Z0 + H * 0.56, Z0 + H * 0.64, 6, cr * 0.5, 12); ring(a, 'z', cx, cy, Z0 + H * 0.64, Z0 + H * 0.67, cr * 0.28, cr * 0.5, 12);
  for (let k = 0; k < 4; k++) { const g = (k * m.PI) / 2 + 0.78, r = W / 2 - 4; bar(a, [cx + m.cos(g) * cr * 0.4, cy + m.sin(g) * cr * 0.4, Z0 + H * 0.66], [cx + m.cos(g) * r, cy + m.sin(g) * r, Z0 + H * 0.68], 2.5, 5); a.line(cx, cy, cx + m.cos(g) * r, cy + m.sin(g) * r, 'EQUIP-DETAIL'); }
  bar(a, [cx + cr * 0.6, cy, Z0 + H * 0.46], [cx + W * 0.4, cy, Z0 + H * 0.46], 2, 5); a.xcyl(cx + W * 0.4, cx + W * 0.4 + 3, cy, Z0 + H * 0.46, 9, 8);
  if (v.pot) { ring(a, 'z', cx, cy, Z0 + H * 0.69, Z1, W * 0.37, W * 0.4, 24); ring(a, 'z', cx, cy, Z0 + H * 0.69, Z0 + H * 0.72, 0, W * 0.4, 24); bar(a, [cx - W * 0.4, cy, Z1 - 10], [cx - W * 0.4 - 0, cy, Z1], 2, 4); }
  a.log('Added the gas canister, the burner head with its stem, four fold-out pot supports and a flame control valve' + (v.pot ? ', and a cooking pot sitting on the supports' : '') + ' (plan and 3D).');
}

function kayakRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, n = v.n, post = 60, ar = D - 20, gap = (H - 160) / n;
  a.outline();
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.3; a.box(x - post / 2, YB - 40, Z0, x + post / 2, YB, Z1); a.box(x - 80, YB - 50, Z0, x + 80, YB, Z0 + 20); }
  a.box(cx - W * 0.3, YB - 40, Z0 + 200, cx + W * 0.3, YB - 20, Z0 + 260);
  for (let i = 0; i < n; i++) {
    const z = Z0 + 90 + gap * i;
    for (const sx of [-1, 1]) { const x = cx + sx * W * 0.3; bar(a, [x, YB - 40, z], [x, YF + 40, z + 30], 18, 8); bar(a, [x, YB - 40, z + 90], [x, YF + 40, z + 40], 12, 6); a.box(x - 45, YF + 12, z + 24, x + 45, YF + 56, z + 44); }
    const kz = z + 44 + 38; a.ell(cx, YF + 34, kz, W * 0.46, 26, 38, 16, 8); a.ell(cx + W * 0.1, YF + 34, kz + 26, 24, 14, 12, 10, 5);
    a.rect(cx - W * 0.46, YF + 8, cx + W * 0.46, YF + 60, 'EQUIP-DETAIL');
  }
  a.rect(cx - W * 0.3 - 30, YB - 40, cx - W * 0.3 + 30, YB, 'EQUIP'); a.rect(cx + W * 0.3 - 30, YB - 40, cx + W * 0.3 + 30, YB, 'EQUIP');
  a.log('Added two wall posts on base plates with a cross brace, ' + n + ' pairs of padded cradle arms and a kayak shape lying on each pair (plan and 3D).');
}

function birdBox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx } = a, t = 14, hr = v.hole * IN / 2, bh = H * 0.8;
  a.outline();
  a.box(X0 + t * 0.5, YB - t, Z0, X1 - t * 0.5, YB, Z1);                                                 // back plate to the wall
  a.box(X0 + t * 0.5, YF + t, Z0 + t, X0 + t * 1.5, YB - t, Z0 + bh); a.box(X1 - t * 1.5, YF + t, Z0 + t, X1 - t * 0.5, YB - t, Z0 + bh);
  a.box(X0 + t * 0.5, YF + t, Z0, X1 - t * 0.5, YB - t, Z0 + t);
  // front board with the entrance hole
  const fz1 = Z0 + bh * 0.96, hz = Z0 + bh * 0.68; const m0 = X0 + t * 0.5, m1 = X1 - t * 0.5;
  a.box(m0, YF, Z0 + t, m1, YF + t, hz - hr * 1.15); a.box(m0, YF, hz + hr * 1.15, m1, YF + t, fz1);
  a.box(m0, YF, hz - hr * 1.15, cx - hr * 1.15, YF + t, hz + hr * 1.15); a.box(cx + hr * 1.15, YF, hz - hr * 1.15, m1, YF + t, hz + hr * 1.15);
  ring(a, 'y', cx, hz, YF, YF + t, hr, hr * 1.15 * 1.45, 14);
  bar(a, [cx, YF - 2, hz - hr * 1.7], [cx, YF - 28, hz - hr * 1.7], 3, 6);
  // sloped roof with overhang
  prismX(a, [[YF - 26, Z0 + bh], [YB, Z1 - H * 0.02], [YB, Z1], [YF - 26, Z0 + bh + t]], X0, X1);
  a.circ(cx, YF + 5, hr, 'EQUIP-DETAIL'); a.rect(m0, YF, m1, YB - t, 'EQUIP-DETAIL');
  a.log('Added the back plate, side walls and floor, a front board with a ' + v.hole + ' in entrance hole and a perch, and a sloped overhanging roof (plan and 3D).');
}

function refractor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, tr = v.ap * IN / 2, th = H * 0.66, pivot = [cx, cy, Z0 + H * 0.55];
  a.circ(cx, cy, W / 2); a.outline('EQUIP-DETAIL');
  for (let k = 0; k < 3; k++) { const g = (k * TAU) / 3 + 1.57; const fx = cx + m.cos(g) * W * 0.46, fy = cy + m.sin(g) * D * 0.46; bar(a, [cx + m.cos(g) * 20, cy + m.sin(g) * 20, Z0 + H * 0.5], [fx, fy, Z0 + 4], 12, 8); a.line(cx, cy, fx, fy); a.cyl(fx, fy, Z0, Z0 + 8, 14, 8); }
  a.cyl(cx, cy, Z0 + H * 0.44, Z0 + H * 0.5, 55, 16); ring(a, 'z', cx, cy, Z0 + H * 0.24, Z0 + H * 0.28, 0, W * 0.2, 3 * 5);
  for (let k = 0; k < 3; k++) { const g = (k * TAU) / 3 + 1.57; bar(a, [cx + m.cos(g) * W * 0.34, cy + m.sin(g) * D * 0.34, Z0 + H * 0.26], [cx + m.cos(g) * 20, cy + m.sin(g) * 20, Z0 + H * 0.26], 5, 5); }
  a.box(cx - 50, cy - 30, pivot[2] - 70, cx + 50, cy + 30, Z0 + H * 0.5); a.ell(cx, cy, pivot[2], 55, 55, 55, 12, 6);
  const ax = [0, -m.cos(0.8), m.sin(0.8)], len = th, t0 = [cx, cy - ax[1] * 0 + len * 0.2 * ax[1] * -1 * 0, pivot[2]];
  const a0 = [cx, cy + 0.65 * len * m.cos(0.8) * 0 + len * 0.36 * m.cos(0.8) * 1, pivot[2] - len * 0.36 * m.sin(0.8)], a1 = [cx, cy - len * 0.64 * m.cos(0.8), pivot[2] + len * 0.64 * m.sin(0.8)];
  a.tube([a0, [a0[0], a0[1] - (a0[1] - a1[1]) * 0.1, a0[2] + (a1[2] - a0[2]) * 0.1], a1], [tr * 0.55, tr * 0.5, tr * 0.5], 16);
  const e0 = [a1[0], a1[1] + (a1[1] - a0[1]) * 0.02, a1[2]]; a.tube([a1, [a1[0], a1[1] - (a0[1] - a1[1]) * 0.12, a1[2] + (a1[2] - a0[2]) * 0.12]], [tr * 1.12, tr * 1.12], 16); void e0;
  a.tube([[cx, a0[1] + (a1[1] - a0[1]) * 0.18, a0[2] + (a1[2] - a0[2]) * 0.18], [cx, a1[1] + (a0[1] - a1[1]) * 0.02, a1[2] + (a0[2] - a1[2]) * 0.02 + 0]], [tr * 0.6, tr * 0.6], 10);
  a.tube([[cx, a0[1] + (a1[1] - a0[1]) * 0.9, a0[2] + (a1[2] - a0[2]) * 0.9 + tr * 1.8], [cx, a0[1] + (a1[1] - a0[1]) * 0.55, a0[2] + (a1[2] - a0[2]) * 0.55 + tr * 1.8]], [tr * 0.32, tr * 0.32], 8);
  a.tube([a0, [a0[0], a0[1] + 40, a0[2] - 22]], [tr * 0.28, tr * 0.2], 8);
  a.line(cx, cy, cx, cy + 0.01, 'EQUIP-DETAIL');
  a.log('Added the three splayed tripod legs with feet and an accessory tray, a mount head with pivot, the refractor tube with dew shield, focuser with eyepiece and a finder scope (plan and 3D).');
}

function dobsonian(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, H, cx, cy } = a, ap = v.ap * IN, tr = ap * 0.62, bh = H * 0.34, t = 20;
  a.outline();
  // ground board on three feet and a rocker box with two side bearings
  ring(a, 'z', cx, cy, Z0 + 20, Z0 + 20 + t, 0, W * 0.45, 28); for (let k = 0; k < 3; k++) { const g = (k * TAU) / 3 + 1.57; a.cyl(cx + m.cos(g) * W * 0.34, cy + m.sin(g) * D * 0.34, Z0, Z0 + 20, 22, 8); }
  const bx0 = cx - W * 0.4, bx1 = cx + W * 0.4, by0 = cy - D * 0.3, by1 = cy + D * 0.3;
  a.box(bx0, by0, Z0 + 20 + t, bx1, by1, Z0 + 20 + t + 18);
  for (const sx of [-1, 1]) { const x = cx + sx * W * 0.4; a.box(x - t / 2, by0, Z0 + 20 + t, x + t / 2, by1, Z0 + bh); a.box(x - t / 2 - 2, by0 + (by1 - by0) * 0.3, Z0 + bh - 70, x + t / 2 + 2, by1 - (by1 - by0) * 0.3, Z0 + bh); }
  a.box(bx0, by1 - t, Z0 + 20 + t, bx1, by1, Z0 + bh * 0.6);
  const pz = Z0 + bh + tr * 0.3 + 40, ty0 = cy - D * 0.5 + 10, ty1 = cy + D * 0.5 - 10;
  // optical tube: body, secondary cage at the open end, focuser and finder
  const mid = ty0 + (ty1 - ty0) * 0.5; a.ycyl(ty0, ty1 - 0, cx, pz + tr * 0.0 + 0, tr, 24);
  a.ycyl(ty0, ty0 + 6, cx, pz, tr * 1.04, 24);
  for (const sx of [-1, 1]) a.xcyl(cx + sx * tr, cx + sx * (W * 0.4 - t / 2), mid + (ty1 - ty0) * 0.0, pz, ap * 0.16, 14);
  ring(a, 'x', mid, pz, cx - tr - 60, cx - tr, ap * 0.16, ap * 0.2, 14);
  a.box(cx - 10, ty0 + 20, pz + tr, cx + 10, ty0 + 70, pz + tr + 50); a.cyl(cx, ty0 + 45, pz + tr + 50, pz + tr + 110, 12, 8);
  a.ycyl(ty0 + (ty1 - ty0) * 0.18, ty0 + (ty1 - ty0) * 0.5, cx + tr * 0.7, pz + tr * 1.2, 16, 8); bar(a, [cx + tr * 0.5, ty0 + (ty1 - ty0) * 0.3, pz + tr * 0.85], [cx + tr * 0.7, ty0 + (ty1 - ty0) * 0.3, pz + tr * 1.2], 4, 4);
  a.circ(cx, cy, W * 0.45, 'EQUIP-DETAIL'); a.rect(bx0, by0, bx1, by1, 'EQUIP-DETAIL'); a.rect(cx - tr, ty0, cx + tr, ty1, 'EQUIP');
  a.log('Added the round ground board on three feet, a rocker box with two bearing cheeks, a large tube with its mirror end, two altitude trunnions, a focuser with eyepiece and a finder scope (plan and 3D).');
}

// ------------------------------------------------------------------------------------------ families
const FAMS = [
  fam({ cat: 'hobby/craft', title: 'Generic sewing machine',
    desc: (v) => `Sewing machine shape ${v.len} in long with a bed and throat plate, a column and arm${v.long ? ' extended for quilting' : ''}, a needle bar head with needle and presser foot, a thread spool on its pin and a handwheel.`,
    vs: [['mini, 10 in', 10, 4.5, 8, 0, { len: 10 }], ['compact, 14 in', 14, 6, 11, 0, { len: 14 }], ['standard, 16 in', 16, 7, 12, 0, { len: 16 }], ['heavy duty, 18 in', 18, 8, 13.5, 0, { len: 18 }], ['long arm for quilting, 26 in', 26, 9, 13, 0, { len: 26, long: true }]],
    build: sewing }),
  fam({ cat: 'hobby/craft', title: 'Generic floor loom',
    desc: (v) => `Floor loom for ${v.ww} in weaving width: posts and rails with a castle beam, warp and breast beams, a swinging beater with reed, four heddle frames, four treadles and a sheet of warp threads.`,
    vs: [['24 in weaving width', 24, 40, 40, 60], ['32 in weaving width', 32, 48, 42, 62], ['40 in weaving width', 40, 56, 44, 64], ['48 in weaving width', 48, 64, 46, 66]].map(([l, ww, w, d, h]) => [l, w, d, h, 0, { ww }]),
    build: floorLoom }),
  fam({ cat: 'hobby/craft', title: 'Generic rigid heddle table loom',
    desc: (v) => `Table loom with two side frames and feet, back and front beams, a lower cloth roller and a heddle frame with reed holding ${v.warp} warp threads.`,
    vs: [['12 in', 12, 20, 14, 14, 18], ['20 in', 20, 28, 14, 14, 26], ['32 in', 32, 40, 16, 16, 38]].map(([l, ww, w, d, h, warp]) => [l, w, d, h, 0, { warp }]),
    build: tableLoom }),
  fam({ cat: 'hobby/craft', title: 'Generic potter\'s wheel',
    desc: (v) => `${v.kick ? 'Kick' : 'Electric'} potter's wheel with a ${v.head} in wheel head on a shaft, a drain pan with splash wall and front lip${v.kick ? ' and a heavy flywheel with a seat plank' : ' and a foot pedal'}.`,
    vs: [['benchtop, 10 in head', 20, 17, 11, 0, { head: 10, bench: true }], ['floor model, 12 in head', 26, 24, 32, 0, { head: 12 }], ['floor model, 14 in head', 30, 26, 33, 0, { head: 14 }], ['kick wheel, 14 in head', 34, 30, 34, 0, { head: 14, kick: true }]],
    build: potterWheel }),
  fam({ cat: 'hobby/craft', title: 'Generic A-frame easel',
    desc: 'A-frame easel with two front legs and a rear leg meeting at the top, a mast with a canvas ledge and top clamp, with a canvas resting on the ledge.',
    vs: [['tabletop, 24 in', 18, 18, 24], ['sketching, 60 in', 28, 30, 60], ['display, 72 in', 32, 34, 72]],
    build: easelA }),
  fam({ cat: 'hobby/craft', title: 'Generic studio easel',
    desc: (v) => `Studio easel with two uprights on cross feet with casters, cross rails, a sliding mast, a canvas ledge and a top clamp${v.crank ? ' and a hand crank wheel' : ''}.`,
    vs: [['H frame, 84 in', 30, 26, 84], ['H frame, 96 in', 34, 28, 96], ['crank, 108 in', 38, 30, 108, 0, { crank: true }]].map(([l, w, d, h, z = 0, p = {}]) => [l, w, d, h, z, p]),
    build: easelH }),
  fam({ cat: 'hobby/craft', title: 'Generic craft workbench',
    desc: 'Craft workbench with a thick top on four legs, a lower shelf, a three-drawer pedestal, a vice with screw handle and a pegboard back with a tool shelf and hooks.',
    vs: [['48 in', 48, 24, 60], ['60 in', 60, 26, 62], ['72 in', 72, 28, 64]],
    build: craftBench }),
  // models
  fam({ cat: 'hobby/models', title: 'Generic model steam locomotive',
    desc: (v) => `${v.scale} model steam locomotive with tender: frame, boiler, smokebox, chimney and domes, cab, cylinders, driving wheels with coupling rods and a tender on three axles.`,
    vs: [['HO scale, 4-6-0', 1.3, 10.5, 1.8, 0, { scale: 'HO scale' }], ['O scale, 4-6-0', 2.6, 20, 3.5, 0, { scale: 'O scale' }]],
    build: steamLoco }),
  fam({ cat: 'hobby/models', title: 'Generic model diesel locomotive',
    desc: (v) => `${v.scale} model diesel locomotive with a long hood and three roof fans, a cab, a short hood, handrails and two bogies with wheels.`,
    vs: [['N scale, road switcher', 0.7, 5.5, 1.0, 0, { scale: 'N scale' }], ['HO scale, road switcher', 1.2, 9.5, 1.65, 0, { scale: 'HO scale' }], ['O scale, road switcher', 2.5, 19, 3.4, 0, { scale: 'O scale' }]],
    build: dieselLoco }),
  fam({ cat: 'hobby/models', title: 'Generic model railway wagon',
    desc: (v) => `${v.scale} model railway wagon (${v.kind === 'box' ? 'closed box car' : v.kind === 'tank' ? 'tank car' : 'open gondola'}) on two bogies, with couplers and ${v.kind === 'box' ? 'a sliding door and roof' : v.kind === 'tank' ? 'a dome and walkway' : 'ribbed sides and a load'}.`,
    vs: [['HO box car', 1.2, 6.2, 1.5, 0, { kind: 'box', scale: 'HO scale' }], ['HO tank car', 1.2, 5.8, 1.5, 0, { kind: 'tank', scale: 'HO scale' }], ['HO open gondola', 1.2, 6.5, 1.3, 0, { kind: 'open', scale: 'HO scale' }], ['O box car', 2.4, 12, 3.0, 0, { kind: 'box', scale: 'O scale' }], ['O tank car', 2.4, 11.5, 3.0, 0, { kind: 'tank', scale: 'O scale' }], ['O open gondola', 2.4, 13, 2.6, 0, { kind: 'open', scale: 'O scale' }]],
    build: wagon }),
  fam({ cat: 'hobby/models', title: 'Generic model monoplane',
    desc: (v) => `Model propeller monoplane with a ${v.span} in wingspan: fuselage, nose cowl with propeller and canopy, a low wing, fin, tailplanes and main and tail wheels.`,
    vs: [['24 in span', 24, 18, 6, 0, { span: 24 }], ['40 in span', 40, 30, 9, 0, { span: 40 }], ['60 in span', 60, 44, 13, 0, { span: 60 }]],
    build: modelPlane }),
  fam({ cat: 'hobby/models', title: 'Generic model biplane',
    desc: (v) => `Model propeller biplane with a ${v.span} in wingspan: fuselage, cowl with propeller and canopy, two staggered wings with interplane and cabane struts, fin, tailplanes and wheels.`,
    vs: [['32 in span', 32, 26, 11, 0, { span: 32, bi: true }], ['48 in span', 48, 38, 16, 0, { span: 48, bi: true }]],
    build: modelPlane }),
  fam({ cat: 'hobby/models', title: 'Generic model tall ship',
    desc: (v) => `Model sailing ship with a layered hull, forecastle and aft castle, a bowsprit and ${v.masts} masts each carrying three yards with square sails.`,
    vs: [['two mast, 16 in', 7, 16, 14, 0, { masts: 2 }], ['three mast, 24 in', 10, 24, 22, 0, { masts: 3 }], ['three mast, 36 in', 14, 36, 32, 0, { masts: 3 }]],
    build: tallShip }),
  fam({ cat: 'hobby/models', title: 'Generic diorama base',
    desc: (v) => `Diorama base with a board, a ground layer, a stepped hill, a railway track strip with sleepers and rails, a gabled building and ${v.trees} trees.`,
    vs: [['12 x 8 in', 12, 8, 6, 0, { trees: 5 }], ['24 x 12 in', 24, 12, 9, 0, { trees: 9 }], ['36 x 18 in', 36, 18, 12, 0, { trees: 14 }]],
    build: diorama }),
  fam({ cat: 'hobby/models', title: 'Generic model kit sprue frame',
    desc: (v) => `Sprue frame with ${v.cols * v.rows} kit parts each on a gate: blocks, round pegs with a hole, tapered fins and cross pieces.`,
    vs: [['6 parts', 6, 4, 0.7, 0, { cols: 3, rows: 2 }], ['12 parts', 9, 6, 0.8, 0, { cols: 4, rows: 3 }], ['20 parts', 12, 8, 0.9, 0, { cols: 5, rows: 4 }]],
    build: sprue }),
  // collecting
  fam({ cat: 'hobby/collecting', title: 'Generic glass display case',
    desc: (v) => `Counter display case with a lockable base, four corner posts with top and bottom frames forming an open glass case, ${v.shelves} glass shelf level${v.shelves > 1 ? 's' : ''} and display pieces on them.`,
    vs: [['16 in tabletop', 16, 12, 14, 0, { shelves: 1 }], ['24 in counter', 24, 14, 36, 0, { shelves: 2 }], ['36 in counter', 36, 16, 38, 0, { shelves: 2 }], ['48 in counter, tall', 48, 18, 44, 0, { shelves: 3 }]],
    build: vitrine }),
  fam({ cat: 'hobby/collecting', title: 'Generic curio cabinet',
    desc: (v) => `Curio cabinet with a plinth, crown moulding, carcass with mirror back, ${v.doors} framed glass door${v.doors > 1 ? 's' : ''} with handles, ${v.shelves - 1} glass shelves and display vases and boxes.`,
    vs: [['24 in, one door', 24, 14, 60, 0, { doors: 1, shelves: 4 }], ['30 in, one door', 30, 16, 72, 0, { doors: 1, shelves: 5 }], ['36 in, two doors', 36, 16, 72, 0, { doors: 2, shelves: 5 }], ['48 in, two doors', 48, 18, 78, 0, { doors: 2, shelves: 6 }]],
    build: curio }),
  fam({ cat: 'hobby/collecting', title: 'Generic coin cabinet',
    desc: (v) => `Collector cabinet on four short legs with a moulded top and ${v.cols * v.rows} shallow drawer fronts, each with a pull and a label slot.`,
    vs: [['2 x 6 drawers', 14, 16, 30, 0, { cols: 2, rows: 6 }], ['3 x 8 drawers', 20, 16, 38, 0, { cols: 3, rows: 8 }], ['4 x 10 drawers', 26, 18, 46, 0, { cols: 4, rows: 10 }]],
    build: drawerCabinet }),
  fam({ cat: 'hobby/collecting', title: 'Generic stamp flat file cabinet',
    desc: (v) => `Flat file cabinet on four short legs with a moulded top and ${v.cols * v.rows} wide shallow drawer fronts, each with a pull and a label slot.`,
    vs: [['5 drawers', 40, 28, 18, 0, { cols: 1, rows: 5 }], ['10 drawers', 40, 28, 33, 0, { cols: 1, rows: 10 }], ['2 x 8 drawers', 60, 28, 28, 0, { cols: 2, rows: 8 }]],
    build: drawerCabinet }),
  fam({ cat: 'hobby/collecting', title: 'Generic trophy stand',
    desc: (v) => `Stepped trophy stand with ${v.tiers} tiers with trim and a large cup on a base on top, plus smaller cups on the lower tiers.`,
    vs: [['3 tiers', 16, 10, 20, 0, { tiers: 3 }], ['4 tiers', 24, 12, 26, 0, { tiers: 4 }], ['5 tiers', 32, 14, 32, 0, { tiers: 5 }]],
    build: trophyStand }),
  fam({ cat: 'hobby/collecting', title: 'Generic vinyl record rack',
    desc: (v) => `Cube rack of ${v.cols} by ${v.rows} with a back panel and rows of upright record sleeves in every cube.`,
    vs: [['one cube', 14, 13, 14, 0, { cols: 1, rows: 1 }], ['two cubes wide', 27, 13, 14, 0, { cols: 2, rows: 1 }], ['2 x 2 cubes', 27, 13, 27, 0, { cols: 2, rows: 2 }], ['4 x 2 cubes', 53, 13, 27, 0, { cols: 4, rows: 2 }], ['4 x 4 cubes', 53, 13, 53, 0, { cols: 4, rows: 4 }]],
    build: vinylRack }),
  fam({ cat: 'hobby/collecting', title: 'Generic wall display shelf',
    desc: (v) => v.rail ? 'Display shelf on wall brackets with a back panel, a plate rail lip and standing plates.' : 'Display shelf on wall brackets with a back panel and display pieces: vases, boxes and round objects.',
    vs: [['24 in ledge', 24, 6, 14, 0, { rail: false }], ['48 in ledge', 48, 8, 16, 0, { rail: false }], ['48 in with plate rail', 48, 8, 18, 0, { rail: true }]],
    build: wallShelf }),
  // outdoor
  fam({ cat: 'hobby/outdoor', title: 'Generic tackle box',
    desc: (v) => `Fishing tackle box with a lower body and front panel, ${v.trays} cantilever trays on the front, a lid with a carrying handle and two latches.`,
    vs: [['14 in, 2 trays', 14, 8, 8, 0, { trays: 2 }], ['17 in, 3 trays', 17, 9, 10, 0, { trays: 3 }], ['21 in, 4 trays', 21, 10, 12, 0, { trays: 4 }]],
    build: tackleBox }),
  fam({ cat: 'hobby/outdoor', title: 'Generic fishing rod rack',
    desc: (v) => `Wall rod rack with a rail with two rows of notched cradles and ${v.n} fishing rods standing in them, each with a grip, a reel seat and line guides.`,
    vs: [['3 rods', 12, 5, 84, 0, { n: 3 }], ['5 rods', 20, 5, 84, 0, { n: 5 }], ['8 rods', 32, 5, 84, 0, { n: 8 }]],
    build: rodRack }),
  fam({ cat: 'hobby/outdoor', title: 'Generic dome tent',
    desc: 'Round dome tent with a groundsheet, a round dome canopy, two crossing pole arcs and a framed front door.',
    vs: [['two person, 7 ft round', 84, 84, 48], ['four person, 9 ft round', 108, 108, 60], ['six person, 12 ft round', 144, 144, 72]],
    build: domeTent }),
  fam({ cat: 'hobby/outdoor', title: 'Generic tunnel tent',
    desc: (v) => `Tunnel tent with a groundsheet, a half-round shell with ${v.hoops} hoops and a smaller front porch with a door panel.`,
    vs: [['two person, 3 hoops', 60, 120, 42, 0, { hoops: 3 }], ['family, 5 hoops', 96, 192, 66, 0, { hoops: 5 }]],
    build: tunnelTent }),
  fam({ cat: 'hobby/outdoor', title: 'Generic camp stove',
    desc: (v) => `Camp stove tray with ${v.burners} burner${v.burners > 1 ? 's' : ''} with grates and pot supports, control knobs and a standing back windscreen with side wings.`,
    vs: [['one burner, 10 in', 10, 10, 8, 0, { burners: 1 }], ['two burner, 22 in', 22, 14, 14, 0, { burners: 2 }]],
    build: campStove }),
  fam({ cat: 'hobby/outdoor', title: 'Generic backpacking stove',
    desc: (v) => `Gas canister stove with a burner head, four fold-out pot supports and a flame control valve${v.pot ? ', with a cooking pot on the supports' : ''}.`,
    vs: [['canister, no pot', 5, 5, 4, 0, { pot: false }], ['canister with pot', 6, 6, 6, 0, { pot: true }]],
    build: packStove }),
  fam({ cat: 'hobby/outdoor', title: 'Generic kayak wall rack',
    desc: (v) => `Wall kayak rack with two wall posts on base plates, a cross brace, ${v.n} pairs of padded cradle arms and a kayak shape lying on each pair.`,
    vs: [['two kayaks', 132, 30, 66, 0, { n: 2 }], ['three kayaks', 132, 30, 90, 0, { n: 3 }], ['four kayaks', 132, 30, 114, 0, { n: 4 }]],
    build: kayakRack }),
  fam({ cat: 'hobby/outdoor', title: 'Generic bird nesting box',
    desc: (v) => `Bird nesting box with a back plate, side walls and floor, a front board with a ${v.hole} in entrance hole and a perch, and a sloped overhanging roof.`,
    vs: [['small, 1 in hole', 5, 7, 10, 0, { hole: 1 }], ['medium, 1.5 in hole', 6, 8, 12, 0, { hole: 1.5 }], ['large, 2.5 in hole', 8, 10, 15, 0, { hole: 2.5 }]],
    build: birdBox }),
  fam({ cat: 'hobby/outdoor', title: 'Generic refractor telescope on tripod',
    desc: (v) => `Refractor telescope with a ${v.ap} in lens on a tripod: three splayed legs with an accessory tray, a mount head, the tube with dew shield, focuser with eyepiece and a finder scope.`,
    vs: [['70 mm refractor', 36, 36, 52, 0, { ap: 2.75 }], ['102 mm refractor', 42, 42, 60, 0, { ap: 4 }]],
    build: refractor }),
  fam({ cat: 'hobby/outdoor', title: 'Generic Dobsonian telescope',
    desc: (v) => `${v.ap} in Dobsonian telescope with a round ground board on three feet, a rocker box with two bearing cheeks, a large tube with trunnions, a focuser with eyepiece and a finder scope.`,
    vs: [['8 in', 22, 38, 42, 0, { ap: 8 }], ['12 in', 32, 54, 58, 0, { ap: 12 }]],
    build: dobsonian }),
];
export default FAMS;
