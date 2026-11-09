/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, block other (other/other): hospital ward and corridor equipment, construction site signs, barriers and plant, mine safety equipment,
 *  excavation safety gear and aviation ground and hangar items, 250 variants. Plain objects at their real size. */
import { fam } from './r4-kit.mjs';

const CAT = 'other/other';

// ---- shared pieces -------------------------------------------------------------------------------------------------------------------
const fy = (a, f) => a.YF + a.D * f;                      // a fraction of the depth from the front (0) to the back (1)
function casters(a, pts, h = 90) { for (const [x, y] of pts) { a.caster(x, y, h); a.circ(x, y, h * 0.3, 'EQUIP-HIDDEN'); } }
function tray(a, x0, y0, x1, y1, z0, z1, t = 6) { a.box(x0, y0, z0, x1, y1, z0 + t); a.box(x0, y0, z0, x0 + t, y1, z1); a.box(x1 - t, y0, z0, x1, y1, z1); a.box(x0, y0, z0, x1, y0 + t, z1); a.box(x0, y1 - t, z0, x1, y1, z1); }
/** A plate on the plane y facing the front: thin box plus a plan line. */
function plate(a, x0, z0, x1, z1, y, t = 6) { a.box(x0, y - t, z0, x1, y, z1); }
/** A radial star base of n legs with casters; returns nothing. */
function star(a, cx, cy, R, zLeg, n = 5, ch = 80) {
  for (let i = 0; i < n; i++) { const t = (i * 2 * Math.PI) / n + Math.PI / 2, ex = cx + R * Math.cos(t), ey = cy + R * Math.sin(t); a.tube([[cx, cy, zLeg], [ex, ey, zLeg]], [16, 12], 6); a.caster(ex, ey, ch); a.line(cx, cy, ex, ey, 'EQUIP-DETAIL'); a.circ(ex, ey, 20, 'EQUIP-HIDDEN'); }
  a.cyl(cx, cy, zLeg - 22, zLeg + 50, 38, 12);
}
/** Diagonal hazard stripes drawn as thin raised bars on the plane y (front face): n bars between x0..x1, z0..z1. */
function stripes(a, x0, z0, x1, z1, y, n) { const w = (x1 - x0) / n; for (let i = 0; i < n; i += 2) a.box(x0 + i * w, y - 4, z0, x0 + (i + 1) * w, y, z1); }
function arrowR(a, cx, cz, w, h, dir, y) {
  a.box(cx - (w / 2) * dir, y - 4, cz - h * 0.12, cx + w * 0.1 * dir, y, cz + h * 0.12);
  for (let i = 0; i < 4; i++) { const hh = (h / 2) * (1 - i / 4), x0 = cx + (w * 0.1 + (w * 0.4 * i) / 4) * dir, x1 = cx + (w * 0.1 + (w * 0.4 * (i + 1)) / 4) * dir; a.box(Math.min(x0, x1), y - 4, cz - hh, Math.max(x0, x1), y, cz + hh); }
}
function bars(a, x0, z0, x1, z1, y, n, t = 4) { for (let i = 0; i < n; i++) { const z = z0 + ((z1 - z0) * (i + 0.5)) / n; a.box(x0, y - t, z - 5, x1, y, z + 5); } }
function framePlan(a, x0, y0, x1, y1) { a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); }

// ================================================================ HOSPITAL ==========================================================
function handHyg(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.n || 1;
  if (v.kind === 'stand') {
    const r = Math.min(W, D) / 2 - 8; a.cyl(cx, cy, Z0, Z0 + 22, r, 20); a.circ(cx, cy, r, 'EQUIP-DETAIL');
    const hz = Z1 - (v.sign ? 480 : 270), hw = Math.min(W - 40, 150 * n + 50), hy = cy - D * 0.25;
    a.cyl(cx, cy, Z0 + 22, hz, 22, 12); a.cyl(cx, cy, Z0 + 22, Z0 + 60, 40, 12);
    a.box(cx - hw / 2, hy, hz, cx + hw / 2, cy + D * 0.25, hz + 200); a.rect(cx - hw / 2, hy, cx + hw / 2, cy + D * 0.25, 'EQUIP-DETAIL');
    for (let i = 0; i < n; i++) { const x = cx - hw / 2 + (hw * (i + 0.5)) / n; a.box(x - 40, hy - 30, hz + 120, x + 40, hy, hz + 150); a.ycyl(hy - 40, hy, x, hz + 60, 8, 8); a.box(x - 60, hy - 60, hz - 12, x + 60, hy - 6, hz); }
    if (v.sign) { a.box(cx - hw / 2, cy - 6, hz + 200, cx + hw / 2, cy + 6, Z1); a.frame(cx - hw / 2 + 12, hz + 214, cx + hw / 2 - 12, Z1 - 14, cy - 12, cy - 6, 10); }
  } else {
    const hw = 120 * n + 30 * (n - 1), z = Z0 + (Z1 - Z0) * 0.5;
    a.box(cx - hw / 2 - 30, YB - 14, Z0, cx + hw / 2 + 30, YB, Z1); a.rect(cx - hw / 2 - 30, YB - 14, cx + hw / 2 + 30, YB, 'EQUIP-DETAIL');
    for (let i = 0; i < n; i++) { const x = cx - hw / 2 + 60 + i * 150; a.box(x - 60, YB - 100, z - 30, x + 60, YB - 14, Z1 - 40); a.box(x - 35, YB - 140, z - 8, x + 35, YB - 100, z + 18); a.box(x - 60, YB - 150, Z0 + 20, x + 60, YB - 14, Z0 + 40); a.ycyl(YB - 130, YB - 100, x, z + 70, 8, 8); }
    if (v.towel) a.box(cx + hw / 2 - 5, YB - 120, Z0 + 150, cx + hw / 2 + 5, YB - 14, Z0 + 160);
  }
  a.log(`Added the ${v.kind === 'stand' ? 'weighted base, the column' + (v.sign ? ', a poster panel' : '') : 'back plate'} and ${n} dispenser${n > 1 ? 's' : ''} with lever, nozzle and drip tray (plan and 3D).`);
}

function wasteCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.n, bw = (W - 80) / n, bz = Z0 + 120;
  a.box(X0 + 20, YF + 20, Z0 + 70, X1 - 20, YB - 20, Z0 + 100); casters(a, [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]], 80);
  for (const x of [X0 + 30, X1 - 30]) a.box(x - 12, YB - 36, Z0 + 100, x + 12, YB - 12, Z1 - 20);
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 40 + i * bw + 8, x1 = X0 + 40 + (i + 1) * bw - 8, mx = (x0 + x1) / 2, top = bz + (Z1 - bz) * 0.78;
    a.box(x0, YF + 40, bz, x1, YB - 50, top); a.box(x0 - 6, YF + 34, top, x1 + 6, YB - 44, top + 40);                  // bin and lid
    const r = Math.min((x1 - x0) * 0.28, 70); a.cyl(mx, cy + 10, top + 40, top + 52, r, 16); a.rect(x0, YF + 40, x1, YB - 50, 'EQUIP-DETAIL'); a.circ(mx, cy + 10, r, 'EQUIP-DETAIL');
    a.ycyl(YF + 20, YF + 40, x1 - 40, bz + 20, 6, 6); a.box(x0 + 10, YF + 32, bz + 30, x1 - 10, YF + 40, bz + 90);      // label plate and pedal link
    if (v.sharps) { a.box(mx - 55, YF + 20, top + 52, mx + 55, YF + 56, top + 140); a.box(mx - 40, YF + 12, top + 100, mx + 40, YF + 20, top + 110); }
  }
  a.box(X0 + 30, YB - 40, Z1 - 20, X1 - 30, YB - 8, Z1); a.xcyl(X0 + 30, X1 - 30, YB - 24, Z1 - 10, 14, 10);
  a.log(`Added a wheeled chassis with ${n} lidded bin${n > 1 ? 's' : ''}, label plates, a push handle${v.sharps ? ' and sharps containers with slot lids on top of the bins' : ''} (plan and 3D).`);
}

function linenCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const pts = [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]];
  if (v.kind === 'bag') {
    const n = v.n, bw = (W - 40) / n;
    a.box(X0 + 20, YF + 20, Z0 + 70, X1 - 20, YB - 20, Z0 + 95); casters(a, pts, 80);
    for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.cyl(x, y, Z0 + 95, Z1, 11, 8);
    a.frame(X0 + 30, Z1 - 50, X1 - 30, Z1, YF + 30, YF + 44, 14); a.frame(X0 + 30, Z1 - 50, X1 - 30, Z1, YB - 44, YB - 30, 14);
    for (let i = 0; i < n; i++) { const mx = X0 + 20 + bw * (i + 0.5); a.ell(mx, cy, Z0 + 95 + (Z1 - Z0 - 150) * 0.42, bw * 0.46, D * 0.4, (Z1 - Z0 - 150) * 0.42, 14, 8); }
    a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
  } else if (v.kind === 'closed') {
    a.box(X0 + 10, YF + 10, Z0 + 80, X1 - 10, YB - 10, Z1); casters(a, pts, 80);
    const dw = (W - 40) / 2;
    for (let i = 0; i < 2; i++) { const x0 = X0 + 20 + i * dw + 2, x1 = X0 + 20 + (i + 1) * dw - 2; a.box(x0, YF, Z0 + 100, x1, YF + 10, Z1 - 20); a.box(i ? x0 + 14 : x1 - 28, YF - 14, Z0 + 400, i ? x0 + 28 : x1 - 14, YF, Z0 + 700); a.line(x0, YF, x0, YF + 10); }
    a.box(X0 + 10, YF - 4, Z1 - 8, X1 - 10, YB + 4, Z1);
    a.rect(X0 + 20, YF, X1 - 20, YF + 10, 'EQUIP-DETAIL'); a.arc(X0 + 20, YF, dw, 270, 360); a.arc(X1 - 20, YF, dw, 180, 270);
    a.box(X0 + 20, YB - 30, Z1, X1 - 20, YB - 6, Z1 + 0.5);
  } else {
    const n = v.shelves; a.box(X0 + 20, YF + 20, Z0 + 70, X1 - 20, YB - 20, Z0 + 95); casters(a, pts, 80);
    for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.cyl(x, y, Z0 + 95, Z1, 11, 8);
    for (let i = 0; i < n; i++) { const z = Z0 + 130 + ((Z1 - Z0 - 160) * i) / Math.max(1, n - 1); a.box(X0 + 20, YF + 20, z, X1 - 20, YB - 20, z + 16); a.box(X0 + 20, YF + 20, z + 16, X1 - 20, YF + 30, z + 80); a.box(X0 + 20, YB - 30, z + 16, X1 - 20, YB - 20, z + 80); for (let k = 0; k < 3; k++) { const x = X0 + 60 + ((W - 160) * (k + 0.5)) / 3; a.box(x - 100, YF + 40, z + 16, x + 100, YB - 40, z + 150 - (i % 2) * 30); } }
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
  }
  a.log(v.kind === 'bag' ? `Added a frame on four swivel wheels with ${v.n} hanging linen bag${v.n > 1 ? 's' : ''} in top rings (plan and 3D).` : v.kind === 'closed' ? 'Added an enclosed cart body on four swivel wheels with two doors, handles and a top lip (plan and 3D).' : `Added an open cart of ${v.shelves} shelves with front and back rails and stacked linen blocks (plan and 3D).`);
}

function medCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const base = Z0 + 90, top = Z1 - (v.pc ? 300 : 60), n = v.n;
  casters(a, [[X0 + 45, YF + 45], [X1 - 45, YF + 45], [X0 + 45, YB - 45], [X1 - 45, YB - 45]], 80);
  a.box(X0 + 20, YF + 20, base - 20, X1 - 20, YB - 20, top); a.box(X0, YF, top, X1, YB, top + 36); a.box(X0, YF, top + 36, X1, YF + 12, top + 70); a.box(X0, YB - 12, top + 36, X1, YB, top + 70); a.box(X0, YF, top + 36, X0 + 12, YB, top + 70); a.box(X1 - 12, YF, top + 36, X1, YB, top + 70);
  for (let i = 0; i < n; i++) { const hh = (top - base - 40) / n, z0 = base + 10 + i * hh + 4, z1 = base + 10 + (i + 1) * hh - 4; a.box(X0 + 30, YF, z0, X1 - 30, YF + 20, z1); a.box(cx - 80, YF - 14, (z0 + z1) / 2 - 8, cx + 80, YF, (z0 + z1) / 2 + 8); }
  a.box(X1 - 4, YF + 30, base + 40, X1 + 0, YB - 30, top - 40);
  a.box(cx + W * 0.2, YF - 20, top - 120, cx + W * 0.2 + 60, YF, top - 60);                                                       // lock
  if (v.pc) { a.cyl(X1 - 70, YB - 60, top + 70, top + 70 + 220, 18, 8); a.box(X0 + 30, YB - 80, top + 70 + 200, X1 - 30, YB - 20, top + 70 + 235); a.box(X0 + 30, YF + 60, top + 70 + 235, X1 - 30, YB - 20, top + 70 + 250); }
  a.rect(X0 + 30, YF, X1 - 30, YF + 20, 'EQUIP-DETAIL'); for (let i = 1; i < n; i++) a.line(X0 + 30, YF + 10, X1 - 30, YF + 10, 'EQUIP-DETAIL');
  a.log(`Added a boothet on four swivel wheels with ${n} drawers and pulls, a lock, a worktop with a raised rim${v.pc ? ' and a computer arm with a shelf' : ''} (plan and 3D).`);
}

function crashCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const base = Z0 + 90, top = Z0 + (Z1 - Z0) * 0.7;
  casters(a, [[X0 + 45, YF + 45], [X1 - 45, YF + 45], [X0 + 45, YB - 45], [X1 - 45, YB - 45]], 80);
  const bx1 = v.o2 ? X1 - 120 : X1;
  a.box(X0 + 10, YF + 10, base - 20, bx1 - 10, YB - 10, top); a.box(X0, YF, top, bx1, YB, top + 30); a.box(X0, YF, top + 30, bx1, YF + 12, top + 90); a.box(X0, YB - 12, top + 30, bx1, YB, top + 90);
  const hh = (top - base - 30) / v.n; for (let i = 0; i < v.n; i++) { const z0 = base + 6 + i * hh + 3, z1 = base + 6 + (i + 1) * hh - 3; a.box(X0 + 20, YF, z0, bx1 - 20, YF + 10, z1); a.box(cx - 100, YF - 14, (z0 + z1) / 2 - 8, cx + 100, YF, (z0 + z1) / 2 + 8); }
  a.box(X0 + 20, YF + 60, top + 90, bx1 - 20, YF + 140, top + 120);
  a.cyl(X0 + 60, YB - 60, top + 30, Z1, 14, 8);                                                                                   // IV pole socket
  if (v.o2) { a.box(bx1, YF + 20, base + 100, X1, YB - 20, base + 130); a.cyl((bx1 + X1) / 2 + 20, cy, base + 130, base + 130 + (Z1 - base) * 0.6, 55, 14); a.circ((bx1 + X1) / 2 + 20, cy, 55); a.box(bx1 + 10, cy - 70, base + 130 + (Z1 - base) * 0.34, X1, cy + 70, base + 130 + (Z1 - base) * 0.4); }
  if (v.board) { a.box(X0 + 20, YB - 28, base, bx1 - 20, YB - 12, Z1 - 120); a.rect(X0 + 20, YB - 28, bx1 - 20, YB - 12, 'EQUIP-DETAIL'); }
  a.rect(X0, YF, bx1, YB, 'EQUIP-DETAIL');
  a.log(`Added a boothet on four swivel wheels with ${v.n} drawers and pulls, a top shelf with a raised rim${v.o2 ? ', a side cylinder holder with a gauge bracket' : ''}${v.board ? ', a rear board' : ''} and a pole socket (plan and 3D).`);
}

function screenFold(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const n = v.n, pw = (W - 40) / n, z0 = Z0 + 90, z1 = Z1;
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 20 + i * pw, x1 = x0 + pw - 6, y = i % 2 ? cy + D * 0.28 : cy - D * 0.28;
    a.frame(x0, z0, x1, z1, y - 12, y + 12, 18); a.box(x0 + 18, y - 4, z0 + 18, x1 - 18, y + 4, z1 - 18 - (z1 - z0) * 0.3);
    for (let k = 0; k < 6; k++) a.box(x0 + 18 + k * ((x1 - x0 - 36) / 6), y - 3, z1 - 18 - (z1 - z0) * 0.3, x0 + 18 + k * ((x1 - x0 - 36) / 6) + 6, y + 3, z1 - 18);
    a.box(x0 + 8, y - 12, z0 - 16, x1 - 8, y + 12, z0); casters(a, [[x0 + 24, y], [x1 - 24, y]], 74);
    a.rect(x0, y - 12, x1, y + 12, 'EQUIP');
    if (i) a.cyl(x0 - 3, cy, z0 + 100, z1 - 100, 7, 6);
  }
  a.log(`Added ${n} hinged frames set in a zigzag with a solid fabric panel, a mesh strip at the top and a pair of swivel wheels under each (plan and 3D).`);
}

function trackCurtain(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  a.box(X0, cy - 18, Z1 - 30, X1, cy + 18, Z1); a.line(X0, cy, X1, cy);
  const n = Math.round(W / 85); for (let i = 0; i < n; i++) { const x = X0 + 30 + ((W - 60) * i) / (n - 1); a.box(x - 6, cy - 4, Z1 - 80, x + 6, cy + 4, Z1 - 30); }
  const mz = Z1 - 80 - (v.mesh ? 400 : 0);
  if (v.mesh) { a.box(X0 + 10, cy - 3, mz, X1 - 10, cy + 3, Z1 - 80); for (let i = 0; i < 24; i++) a.box(X0 + 10 + i * ((W - 20) / 24), cy - 4, mz, X0 + 10 + i * ((W - 20) / 24) + 4, cy + 4, Z1 - 80); }
  for (let i = 0; i < n * 2; i++) { const x0 = X0 + 10 + i * ((W - 20) / (n * 2)), y = cy + (i % 2 ? 1 : -1) * D * 0.28; a.box(x0, y - 5, Z0, x0 + (W - 20) / (n * 2) - 2, y + 5, mz); }
  a.log(`Added a ceiling track with ${n} carriers and a pleated fabric curtain${v.mesh ? ' with a mesh band at the top' : ''} that stops short of the floor (plan and 3D).`);
}

function ivPole(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = Math.min(W, D) / 2 - 40, bz = Z0 + 68; a.circ(cx, cy, R + 20, 'EQUIP'); star(a, cx, cy, R, bz, 5, 80);
  const mid = Z0 + (Z1 - Z0) * 0.5; a.cyl(cx, cy, bz + 50, mid, 16, 10); a.cyl(cx, cy, mid - 40, mid + 70, 22, 10); a.cyl(cx, cy, mid, Z1 - 70, 11, 10);
  const hz = Z1 - 70; a.cyl(cx, cy, hz, hz + 70, 20, 10);
  for (let i = 0; i < v.hooks; i++) { const t = (i * 2 * Math.PI) / v.hooks + 0.6, ex = cx + 130 * Math.cos(t), ey = cy + 130 * Math.sin(t); a.tube([[cx, cy, hz + 40], [ex, ey, hz + 40]], [10, 8], 6); a.cyl(ex, ey, hz - 30, hz + 40, 6, 6); a.line(cx, cy, ex, ey, 'EQUIP-DETAIL'); }
  for (let k = 0; k < (v.pumps || 0); k++) { const z = mid - 330 - k * 360; a.box(cx - 100, cy - 70, z, cx + 100, cy - 16, z + 280); a.box(cx - 16, cy - 16, z + 100, cx + 16, cy, z + 180); }
  if (v.basket) tray(a, cx - 120, cy + 20, cx + 120, cy + 100, mid - 40, mid + 80, 4);
  a.log(`Added a five-leg base on swivel wheels, a telescoping pole with a locking collar and a ${v.hooks}-hook top${v.pumps ? ', ' + v.pumps + ' pump clamp bracket' + (v.pumps > 1 ? 's' : '') : ''}${v.basket ? ' and a basket' : ''} (plan and 3D).`);
}

function monitorStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = Math.min(W, D) / 2 - 35, bz = Z0 + 68; a.circ(cx, cy, R + 20); star(a, cx, cy, R, bz, 5, 80);
  const sh = v.screen, hz = Z1 - sh - 80;
  a.cyl(cx, cy, bz + 50, hz, 20, 10); a.box(cx - 30, cy - 30, hz - 40, cx + 30, cy + 30, hz);
  a.box(cx - sh * 0.75, cy - 28, hz, cx + sh * 0.75, cy + 22, hz + sh); a.frame(cx - sh * 0.75 + 10, hz + 10, cx + sh * 0.75 - 10, hz + sh - 10, cy - 36, cy - 28, 24); a.box(cx - sh * 0.75 + 34, cy - 32, hz + 34, cx + sh * 0.75 - 34, cy - 28, hz + sh - 34);
  a.box(cx - 90, cy - 38, hz + sh - 18, cx + 90, cy - 28, hz + sh - 8);
  if (v.shelf) { a.box(cx - 170, cy - 130, bz + 360, cx + 170, cy + 130, bz + 380); a.box(cx - 170, cy - 130, bz + 380, cx + 170, cy - 120, bz + 420); }
  if (v.module) { a.box(cx + sh * 0.75, cy - 20, hz + sh * 0.2, cx + sh * 0.75 + 110, cy + 40, hz + sh * 0.8); }
  a.rect(cx - sh * 0.75, cy - 36, cx + sh * 0.75, cy + 22, 'EQUIP-DETAIL');
  a.log(`Added a five-leg base on swivel wheels, a column, a bracket and a ${v.module ? 'monitor with a side module' : 'wide monitor'} on its mount${v.shelf ? ' and a lower shelf with a front lip' : ''} (plan and 3D).`);
}

function dirBoard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 50); a.box(X0 + 50, YF + 30, Z0 + 50, X1 - 50, YB - 30, Z1 - 80); a.box(X0 + 20, YF + 10, Z1 - 80, X1 - 20, YB - 10, Z1);
  const rows = v.rows, hh = (Z1 - 80 - Z0 - 200) / rows, sides = v.dbl ? [YF + 30, YB - 30] : [YF + 30];
  for (const y of sides) { const f = y < cy ? -1 : 1; for (let i = 0; i < rows; i++) { const z0 = Z1 - 80 - 40 - (i + 1) * hh + 14, z1 = z0 + hh - 14; a.box(X0 + 80, f < 0 ? y - 14 : y, z0, X1 - 80, f < 0 ? y : y + 14, z1); arrowR(a, X0 + 150, (z0 + z1) / 2, 90, Math.min(70, hh - 40), i % 2 ? 1 : -1, f < 0 ? y - 14 : y + 18); for (let k = 0; k < 2; k++) a.box(X0 + 250, f < 0 ? y - 18 : y, (z0 + z1) / 2 - 20 + k * 36, X0 + 250 + W * (0.35 + 0.1 * k), f < 0 ? y : y + 18, (z0 + z1) / 2 + k * 36); a.box(X1 - 140, f < 0 ? y - 18 : y, z0 + 14, X1 - 90, f < 0 ? y : y + 18, z1 - 14); } }
  a.rect(X0 + 50, YF + 30, X1 - 50, YB - 30, 'EQUIP-DETAIL');
  a.log(`Added the base, the slab body, a header and ${rows} department rows with arrows, text bars and level tabs${v.dbl ? ' on both faces' : ''} (plan and 3D).`);
}

function wetFloor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const t = 14, tw = W - 30;
  for (const s of [-1, 1]) {
    const yb = cy + s * (D / 2 - 20), yt = cy + s * 24, n = 7;
    for (let i = 0; i < n; i++) { const f0 = i / n, f1 = (i + 1) / n; const ya = yb + (yt - yb) * f0, yz = yb + (yt - yb) * f1; a.box(cx - tw / 2, Math.min(ya, yz) - t / 2, Z0 + (Z1 - Z0) * f0, cx + tw / 2, Math.max(ya, yz) + t / 2, Z0 + (Z1 - Z0) * f1); }
    a.box(cx - tw / 2 + 24, yb - 2 - 6, Z0, cx + tw / 2 - 24, yb + 6, Z0 + 30);
    a.line(cx - tw / 2, yb, cx + tw / 2, yb); a.line(cx - tw / 2, yt, cx - tw / 2, yb); a.line(cx + tw / 2, yt, cx + tw / 2, yb);
  }
  a.box(cx - tw / 2, cy - 30, Z1 - 30, cx + tw / 2, cy + 30, Z1);
  if (v.handle) { a.box(cx - 80, cy - 34, Z1 - 20, cx + 80, cy + 34, Z1); a.box(cx - 70, cy - 20, Z1, cx - 56, cy + 20, Z1 + 0.5); }
  a.log('Added two folding panel faces with a sign plate area, a hinge top and rubber feet' + (v.handle ? ' and a carry handle' : '') + ' (plan and 3D).');
}

function bladeSignHosp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YB - 14, Z0, X0 + 70, YB, Z1);                                                          // wall bracket
  const n = v.plates, ph = (Z1 - Z0 - 120) / n;
  for (const z of [Z1 - 60, Z0 + 60]) a.box(X0 + 70, YB - 40, z - 10, X1, YB - 20, z + 10);
  for (let i = 0; i < n; i++) { const z0 = Z0 + 60 + i * ph + 10, z1 = Z0 + 60 + (i + 1) * ph - 10; a.box(X0 + 90, YB - 60, z0, X1 - 10, YB - 40, z1); a.frame(X0 + 100, z0 + 10, X1 - 20, z1 - 10, YB - 66, YB - 60, 8); arrowR(a, X0 + 220, (z0 + z1) / 2, 120, Math.min(90, ph - 60), v.dir, YB - 66); a.box(X0 + 340, YB - 70, (z0 + z1) / 2 - 24, X1 - 60, YB - 66, (z0 + z1) / 2 + 24); }
  a.rect(X0 + 70, YB - 60, X1, YB - 20, 'EQUIP-DETAIL');
  a.log(`Added a wall bracket, two arms and ${n} framed sign plate${n > 1 ? 's' : ''} with an arrow and text bar each (plan and 3D).`);
}

function evacFrame(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YB - 14, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YB - 40, YB - 14, 26);
  a.box(X0 + 26, YB - 18, Z0 + 26, X1 - 26, YB - 14, Z1 - 26);
  const gx = (X1 - X0 - 120) / 8, gz = (Z1 - Z0 - 120) / 6;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) if ((r * 7 + c * 3) % 5 < 3) a.box(X0 + 60 + c * gx * 1.3, YB - 24, Z0 + 60 + r * gz * 1.4, X0 + 60 + c * gx * 1.3 + gx * 1.0, YB - 18, Z0 + 60 + r * gz * 1.4 + gz * 0.9);
  a.box(X0 + 40, YB - 26, Z1 - 120, X0 + 40 + W * 0.3, YB - 18, Z1 - 70); a.cyl(X1 - 110, YB - 24, Z0 + 70, Z0 + 71, 30, 12); a.cyl(X1 - 110, YB - 25, Z0 + 71, Z0 + 72, 12, 12);
  a.rect(X0, YB - 40, X1, YB, 'EQUIP-DETAIL');
  a.log('Added a wall plate with a frame, a plan area with room blocks, a title strip and a location marker (plan and 3D).');
}

function tubeStation(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YB - D, Z0, X1, YB, Z1);
  a.box(X0 + 30, YF, Z0 + 140, X1 - 30, YF + 40, Z1 - 140); a.cyl(cx, YF + 100, Z0 + (Z1 - Z0) * 0.5 - 20, Z0 + (Z1 - Z0) * 0.5 + 80, 60, 16);
  a.frame(cx - 90, Z0 + 150, cx + 90, Z0 + 330, YF - 10, YF + 20, 14);
  a.cyl(cx, cy, Z1, Z1 + 0.5, 1, 4);
  if (v.panel) { a.box(X0 + 30, YF - 20, Z1 - 130, X1 - 30, YF + 6, Z1 - 20); for (let i = 0; i < 4; i++) a.box(X0 + 60 + i * 60, YF - 28, Z1 - 100, X0 + 100 + i * 60, YF - 20, Z1 - 60); }
  for (let i = 0; i < v.tubes; i++) { const x = X0 + (W * (i + 0.5)) / v.tubes; a.cyl(x, YB - D * 0.2, Z1 - 140, Z1, 28, 10); a.circ(x, YB - D * 0.2, 28, 'EQUIP-DETAIL'); }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added the wall box, a door recess with a carrier chamber and a viewing window${v.panel ? ', a keypad panel' : ''} and ${v.tubes} transfer tube stub${v.tubes > 1 ? 's' : ''} on top (plan and 3D).`);
}

const HOSP = [
  fam({ cat: CAT, title: 'Generic hospital hand-hygiene station',
    desc: (v) => v.kind === 'stand' ? `Floor stand with a weighted round base, a column and a head with ${v.n} dispenser${v.n > 1 ? 's' : ''} with lever and drip tray${v.sign ? ' under a poster panel' : ''}.` : `Wall back plate with ${v.n} dispenser${v.n > 1 ? 's' : ''} with levers and drip trays${v.towel ? ' and a towel slot' : ''}.`,
    vs: [['floor stand, 42 in', 16, 16, 42, 0, { kind: 'stand', n: 1 }], ['floor stand with poster, 54 in', 16, 16, 54, 0, { kind: 'stand', n: 1, sign: true }], ['floor stand, two dispensers, 46 in', 22, 16, 46, 0, { kind: 'stand', n: 2 }],
      ['wall pair at bed head', 14, 6, 16, 44, { kind: 'wall', n: 1 }], ['wall row of three', 28, 6, 16, 44, { kind: 'wall', n: 3, towel: true }]], build: handHyg }),
  fam({ cat: CAT, title: 'Generic ward sharps and waste cart',
    desc: (v) => `Wheeled cart with ${v.n} lidded bin${v.n > 1 ? 's' : ''}, a push handle${v.sharps ? ' and a sharps container on the lid of each bin' : ''}.`,
    vs: [['one bin', 24, 22, 38, 0, { n: 1 }], ['two bins', 40, 22, 38, 0, { n: 2 }], ['three bins', 58, 22, 38, 0, { n: 3 }], ['one bin with sharps box', 24, 22, 46, 0, { n: 1, sharps: true }], ['two bins with sharps boxes', 40, 22, 46, 0, { n: 2, sharps: true }]], build: wasteCart }),
  fam({ cat: CAT, title: 'Generic hospital linen cart',
    desc: (v) => v.kind === 'bag' ? `Frame on four swivel wheels holding ${v.n} hanging linen bag${v.n > 1 ? 's' : ''}.` : v.kind === 'closed' ? 'Enclosed two-door cart body on four swivel wheels with handles.' : `Open cart with ${v.shelves} shelves with rails and stacked linen.`,
    vs: [['single bag frame', 28, 24, 38, 0, { kind: 'bag', n: 1 }], ['double bag frame', 52, 24, 38, 0, { kind: 'bag', n: 2 }], ['closed two-door, 66 in', 40, 26, 66, 0, { kind: 'closed' }], ['open three shelf', 36, 24, 62, 0, { kind: 'shelf', shelves: 3 }], ['open four shelf', 36, 24, 72, 0, { kind: 'shelf', shelves: 4 }]], build: linenCart }),
  fam({ cat: CAT, title: 'Generic ward medication cart',
    desc: (v) => `Cabinet on four swivel wheels with ${v.n} drawers, a lock and a worktop with a raised rim${v.pc ? ', and a computer arm with a shelf' : ''}.`,
    vs: [['four drawers', 22, 20, 40, 0, { n: 4 }], ['six drawers', 24, 20, 44, 0, { n: 6 }], ['eight drawers', 26, 22, 48, 0, { n: 8 }], ['ten drawers', 28, 24, 52, 0, { n: 10 }], ['eight drawers with computer arm', 26, 22, 70, 0, { n: 8, pc: true }]], build: medCart }),
  fam({ cat: CAT, title: 'Generic emergency department crash cart',
    desc: (v) => `Drawer cart on four swivel wheels with ${v.n} drawers, a top shelf with a rim and a pole socket${v.o2 ? ', a side cylinder holder' : ''}${v.board ? ' and a rear board' : ''}.`,
    vs: [['four drawers', 30, 21, 38, 0, { n: 4 }], ['five drawers with cylinder holder', 36, 21, 40, 0, { n: 5, o2: true }], ['six drawers with rear board', 30, 21, 42, 0, { n: 6, board: true }], ['two drawers compact', 26, 18, 34, 0, { n: 2 }]], build: crashCart }),
  fam({ cat: CAT, title: 'Generic ward privacy screen',
    desc: (v) => `Folding screen of ${v.n} hinged frames set in a zigzag, each with a fabric panel, a mesh strip and two wheels.`,
    vs: [['two panels, 48 in wide', 48, 14, 66, 0, { n: 2 }], ['three panels, 66 in wide', 66, 14, 66, 0, { n: 3 }], ['four panels, 88 in wide', 88, 14, 66, 0, { n: 4 }]], build: screenFold }),
  fam({ cat: CAT, title: 'Generic ward ceiling track curtain',
    desc: (v) => `Ceiling track with carriers and a pleated fabric curtain${v.mesh ? ' with a mesh band at the top' : ''} that stops short of the floor.`,
    vs: [['6 ft solid', 72, 4, 78, 12, { mesh: false }], ['8 ft with mesh', 96, 4, 78, 12, { mesh: true }], ['10 ft with mesh', 120, 4, 78, 12, { mesh: true }]], build: trackCurtain }),
  fam({ cat: CAT, title: 'Generic ward IV pole',
    desc: (v) => `Telescoping pole on a five-leg wheeled base with a ${v.hooks}-hook top${v.pumps ? ' and ' + v.pumps + ' pump clamp bracket' + (v.pumps > 1 ? 's' : '') : ''}${v.basket ? ' and a basket' : ''}.`,
    vs: [['two hooks, 64 in', 26, 26, 64, 0, { hooks: 2 }], ['four hooks, 80 in', 26, 26, 80, 0, { hooks: 4 }], ['with pump bracket, 76 in', 26, 26, 76, 0, { hooks: 4, pumps: 1 }], ['with two pump brackets and basket, 84 in', 28, 28, 84, 0, { hooks: 4, pumps: 2, basket: true }]], build: ivPole }),
  fam({ cat: CAT, title: 'Generic bedside monitor stand',
    desc: (v) => `Five-leg wheeled stand with a column and a ${v.module ? 'monitor with a side module' : 'wide monitor on a bracket'}${v.shelf ? ' and a lower shelf' : ''}.`,
    vs: [['compact monitor, 56 in', 24, 24, 56, 0, { screen: 260 }], ['wide monitor with shelf, 60 in', 26, 26, 60, 0, { screen: 340, shelf: true }], ['monitor with module, 62 in', 26, 26, 62, 0, { screen: 340, module: true }]], build: monitorStand }),
  fam({ cat: CAT, title: 'Generic hospital directory board',
    desc: (v) => `Floor sign with a base, a slab and ${v.rows} department rows with arrows and text bars${v.dbl ? ' on both faces' : ''}.`,
    vs: [['six rows, single sided', 32, 8, 84, 0, { rows: 6 }], ['six rows, double sided', 32, 10, 84, 0, { rows: 6, dbl: true }], ['eight rows, double sided', 36, 10, 96, 0, { rows: 8, dbl: true }]], build: dirBoard }),
  fam({ cat: CAT, title: 'Generic hospital wet-floor sign',
    desc: (v) => `Folding two-face floor sign with feet and a hinge top${v.handle ? ' and a carry handle' : ''}.`,
    vs: [['24 in', 12, 12, 24, 0, {}], ['32 in with handle', 13, 14, 32, 0, { handle: true }]], build: wetFloor }),
  fam({ cat: CAT, title: 'Generic hospital corridor wall sign',
    desc: (v) => `Wall bracket with two arms and ${v.plates} framed sign plate${v.plates > 1 ? 's' : ''} with an arrow and a text bar each.`,
    vs: [['one plate, 8 in', 24, 4, 8, 90, { plates: 1, dir: 1 }], ['two plates, 16 in', 24, 4, 16, 84, { plates: 2, dir: -1 }], ['three plates, 24 in', 26, 4, 24, 78, { plates: 3, dir: 1 }]], build: bladeSignHosp }),
  fam({ cat: CAT, title: 'Generic hospital evacuation plan frame',
    desc: 'Wall plate in a frame with a plan area of room blocks, a title strip and a location marker.',
    vs: [['A3 size', 16.5, 2, 12, 54, {}], ['A2 size', 23.4, 2, 16.5, 54, {}]], build: evacFrame }),
  fam({ cat: CAT, title: 'Generic hospital specimen tube station',
    desc: (v) => `Wall box with a door recess, a carrier chamber and viewing window${v.panel ? ', a keypad panel' : ''} and ${v.tubes} transfer tube stub${v.tubes > 1 ? 's' : ''} on top.`,
    vs: [['single tube', 12, 8, 24, 36, { tubes: 1 }], ['single tube with keypad', 14, 8, 28, 36, { tubes: 1, panel: true }], ['two tubes with keypad', 20, 8, 28, 36, { tubes: 2, panel: true }]], build: tubeStation }),
];

// ================================================================ CONSTRUCTION =======================================================
function quad(a, p, q, r, s) { a.t.push([p, q, r], [p, r, s]); }
function hexa(a, b, t) { quad(a, b[0], b[3], b[2], b[1]); quad(a, t[0], t[1], t[2], t[3]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(a, b[i], b[j], t[j], t[i]); } }
/** A slab tapering along y: bottom y range at z0, top y range at z1, over x0..x1. */
function taper(a, x0, x1, yb0, yb1, z0, yt0, yt1, z1) { hexa(a, [[x0, yb0, z0], [x1, yb0, z0], [x1, yb1, z0], [x0, yb1, z0]], [[x0, yt0, z1], [x1, yt0, z1], [x1, yt1, z1], [x0, yt1, z1]]); }
/** A slab rising along y: low edge at y0 (thickness t), high edge at y1 (height zh). */
function rampY(a, x0, x1, y0, y1, z0, zh) { hexa(a, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [[x0, y0, z0 + 20], [x1, y0, z0 + 20], [x1, y1, z0 + zh], [x0, y1, z0 + zh]]); }

function siteBoard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const bh = v.rows * 330 + 90, bz0 = Z1 - bh - (v.hood ? 120 : 0);
  for (const x of [X0 + 90, X1 - 90]) { a.box(x - 120, cy - D * 0.4, Z0, x + 120, cy + D * 0.4, Z0 + 30); a.box(x - 35, cy - 35, Z0 + 30, x + 35, cy + 35, Z1 - (v.hood ? 100 : 0)); a.rect(x - 120, cy - D * 0.4, x + 120, cy + D * 0.4, 'EQUIP-DETAIL'); }
  a.box(X0 + 40, cy - 25, bz0, X1 - 40, cy + 25, bz0 + bh); a.frame(X0 + 30, bz0 - 10, X1 - 30, bz0 + bh + 10, cy - 45, cy - 25, 22);
  const gw = (W - 240) / v.cols;
  for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const x0 = X0 + 120 + c * gw + 14, x1 = X0 + 120 + (c + 1) * gw - 14, z0 = bz0 + 40 + r * 330 + 10, z1 = z0 + 280; a.box(x0, cy - 36, z0, x1, cy - 25, z1); a.box(x0 + 20, cy - 42, z0 + 20, x1 - 20, cy - 36, z0 + 60); a.box(x0 + 20, cy - 42, z0 + 100, x0 + (x1 - x0) * 0.6, cy - 36, z0 + 130); }
  if (v.hood) { a.box(X0, cy - D * 0.32, Z1 - 100, X1, cy + D * 0.32, Z1); a.rect(X0, cy - D * 0.32, X1, cy + D * 0.32, 'EQUIP-DETAIL'); }
  a.log(`Added two posts on base plates, a framed board with ${v.cols * v.rows} sign plates${v.hood ? ' and a hood over the top' : ''} (plan and 3D).`);
}

function trafficCone(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const bt = v.weighted ? 70 : 32, zb = Z0 + bt, r0 = W * 0.34, r1 = W * 0.065;
  a.box(X0, YF, Z0, X1, YB, Z0 + bt); if (v.weighted) a.cyl(cx, cy, Z0 + bt, Z0 + bt + 12, W * 0.38, 20); a.circ(cx, cy, W * 0.34, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.065, 'EQUIP-DETAIL');
  a.cone(cx, cy, zb, Z1, r0, r1, 22); const rad = (z) => r0 + ((r1 - r0) * (z - zb)) / (Z1 - zb);
  for (const [f0, f1] of v.bands) { const z0 = zb + (Z1 - zb) * f0, z1 = zb + (Z1 - zb) * f1; a.cone(cx, cy, z0, z1, rad(z0) + 4, rad(z1) + 4, 22); }
  a.cyl(cx, cy, Z1 - 12, Z1, r1 + 8, 10);
  a.log(`Added a square base${v.weighted ? ' with a ring weight' : ''}, a tapered body and ${v.bands.length} reflective collar${v.bands.length > 1 ? 's' : ''} (plan and 3D).`);
}

function aBarricade(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const lz = v.lamp ? 130 : 0, top = Z1 - lz;
  for (const x of [X0 + 60, X1 - 60]) { for (const y of [YF + 40, YB - 40]) { a.tube([[x, cy, top], [x, y, Z0 + 20]], [20, 20], 6); a.box(x - 35, y - 40, Z0, x + 35, y + 40, Z0 + 20); a.line(x, cy, x, y, 'EQUIP-DETAIL'); } a.box(x - 30, cy - 25, top - 60, x + 30, cy + 25, top); }
  const h = 190, gap = 40;
  for (let i = 0; i < v.rails; i++) { const z1 = top - 30 - i * (h + gap), z0 = z1 - h; a.box(X0 + 30, cy - 28, z0, X1 - 30, cy - 4, z1); stripes(a, X0 + 30, z0, X1 - 30, z1, cy - 28, 14 + Math.round(W / 300)); }
  a.rect(X0 + 30, cy - 28, X1 - 30, cy - 4, 'EQUIP');
  if (v.lamp) { const lx = X0 + 60; a.box(lx - 40, cy - 40, top, lx + 40, cy + 40, top + 40); a.cyl(lx, cy, top + 40, top + 110, 55, 14); a.cyl(lx, cy, top + 110, Z1, 30, 12); a.circ(lx, cy, 55, 'EQUIP-DETAIL'); }
  a.log(`Added two A-frame ends with foot pads and ${v.rails} striped rail board${v.rails > 1 ? 's' : ''}${v.lamp ? ' and a warning lamp on a bracket' : ''} (plan and 3D).`);
}

function fencePanel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const n = v.n, pw = W / n;
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * pw + 6, x1 = X0 + (i + 1) * pw - 6;
    a.frame(x0, Z0 + 60, x1, Z1, cy - 14, cy + 14, 30);
    for (let k = 1; k < 24; k++) { const x = x0 + ((x1 - x0) * k) / 24; a.box(x - 3, cy - 4, Z0 + 90, x + 3, cy + 4, Z1 - 30); }
    for (let k = 1; k < 6; k++) { const z = Z0 + 60 + ((Z1 - Z0 - 60) * k) / 6; a.box(x0 + 30, cy - 4, z - 3, x1 - 30, cy + 4, z + 3); }
    if (v.cloth) a.box(x0 + 30, cy - 18, Z0 + 120, x1 - 30, cy - 14, Z1 - 30);
    a.rect(x0, cy - 14, x1, cy + 14, 'EQUIP');
  }
  for (let i = 0; i <= n; i++) { const x = i === 0 ? X0 + 80 : i === n ? X1 - 80 : X0 + i * pw; a.box(x - 90, YF, Z0, x + 90, YB, Z0 + 60); a.rect(x - 90, YF, x + 90, YB, 'EQUIP-DETAIL'); for (const z of [Z1 - 150, Z0 + (Z1 - Z0) * 0.5]) a.cyl(x, cy, z - 40, z + 40, 30, 10); }
  a.log(`Added ${n} tube-framed mesh panel${n > 1 ? 's' : ''} with ${v.cloth ? 'a screen cloth, ' : ''}coupling clamps and block feet (plan and 3D).`);
}

function waterBarrier(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const H = Z1 - Z0, e = 60;
  a.box(X0 + e, YF, Z0, X1 - e, YB, Z0 + H * 0.14); taper(a, X0 + e, X1 - e, YF, YB, Z0 + H * 0.14, cy - D * 0.3, cy + D * 0.3, Z0 + H * 0.44); taper(a, X0 + e, X1 - e, cy - D * 0.3, cy + D * 0.3, Z0 + H * 0.44, cy - D * 0.22, cy + D * 0.22, Z0 + H * 0.9); a.box(X0 + e, cy - D * 0.26, Z0 + H * 0.9, X1 - e, cy + D * 0.26, Z1 - (v.posts ? 80 : 0));
  for (const x of [X0, X1 - e]) { a.box(x, cy - D * 0.2, Z0 + H * 0.2, x + e, cy + D * 0.2, Z0 + H * 0.7); }
  for (const x of [X0 + W * 0.12, X1 - W * 0.12]) { a.box(x - 120, YF + 4, Z0 + 12, x + 120, YF + 14, Z0 + H * 0.12); a.cyl(x, cy, Z1 - 30, Z1 - 24, 34, 10); }
  if (v.posts) for (const x of [X0 + W * 0.22, X1 - W * 0.22]) { a.cyl(x, cy, Z1 - 80, Z1, 40, 10); a.circ(x, cy, 40, 'EQUIP-DETAIL'); }
  a.line(X0, cy, X1, cy);
  a.log(`Added a stepped, tapered water-fillable body on a foot, end interlocks, a fill cap, lift slots${v.posts ? ' and two fence post sockets on top' : ''} (plan and 3D).`);
}

function scaffoldStair(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const rise = Z1 - Z0 - 1000, n = Math.max(4, Math.round(rise / 190)), rs = rise / n, ld = 1000, run = W - ld, tr = run / n, yl = YF + 30, yr = YB - 30;
  for (const y of [yl, yr]) { a.tube([[X0, y, Z0 + 120], [X0 + run, y, Z0 + rise + 40]], [28, 28], 6); a.line(X0, y, X0 + run, y, 'EQUIP-DETAIL'); }
  for (let i = 0; i < n; i++) { const x = X0 + i * tr; a.box(x, YF + 15, Z0 + (i + 1) * rs - 28, x + tr + 12, YB - 15, Z0 + (i + 1) * rs); a.line(x, YF + 15, x, YB - 15, 'EQUIP-DETAIL'); }
  a.box(X0 + run, YF, Z0 + rise - 40, X1, YB, Z0 + rise);
  for (const [x, y] of [[X1 - 50, yl], [X1 - 50, yr], [X0 + run, yl], [X0 + run, yr]]) { a.cyl(x, y, Z0, Z0 + rise + 1000, 24, 8); a.box(x - 60, y - 60, Z0, x + 60, y + 60, Z0 + 20); a.circ(x, y, 24, 'EQUIP-DETAIL'); }
  for (const y of [yl, yr]) { a.tube([[X1 - 50, y, Z0 + 40], [X0 + run, y, Z0 + rise - 40]], [14, 14], 6); a.tube([[X0, y, Z0 + rs + 1000], [X0 + run, y, Z0 + rise + 1000], [X1 - 50, y, Z0 + rise + 1000]], [20, 20, 20], 6); a.tube([[X0, y, Z0 + rs + 500], [X0 + run, y, Z0 + rise + 500], [X1 - 50, y, Z0 + rise + 500]], [14, 14, 14], 6); a.cyl(X0 + 30, y, Z0 + 120, Z0 + rs + 1000, 20, 6); }
  a.tube([[X1 - 50, yl, Z0 + rise + 1000], [X1 - 50, yr, Z0 + rise + 1000]], [20, 20], 6); a.tube([[X1 - 50, yl, Z0 + rise + 500], [X1 - 50, yr, Z0 + rise + 500]], [14, 14], 6); a.box(X1 - 80, yl, Z0 + rise, X1, yr, Z0 + rise + 150);
  a.log(`Added ${n} treads on two stringers, a landing deck with four standards, base plates, handrails with mid rails and a toe board (plan and 3D).`);
}

function siteToilet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.n, cw = (W - (v.wash ? 520 : 0)) / n, base = Z0 + 90, roof = Z1 - 80;
  a.box(X0, YF, Z0, X1, YB, base); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  for (let i = 0; i < n; i++) {
    const x0 = X0 + i * cw + 20, x1 = X0 + (i + 1) * cw - 20;
    a.box(x0, YF + 40, base, x1, YB - 20, roof); a.box(x0 - 20, YF + 20, roof, x1 + 20, YB, roof + 80); a.box(x0 + 40, YF + 20, base + 40, x1 - 40, YF + 40, roof - 160);  // door
    a.box(x1 - 120, YF + 10, base + 900, x1 - 90, YF + 20, base + 1000);                                                                                                  // handle
    for (let k = 0; k < 5; k++) a.box(x0 + 60, YF + 38, roof - 140 + k * 24, x1 - 60, YF + 42, roof - 124 + k * 24);
    a.cyl((x0 + x1) / 2 + 100, YB - 70, roof + 80, Z1, 30, 8); a.box(x0 + 20, YF + 36, base + 30, x0 + 40, YF + 40, roof - 30);
    a.arc(x0 + 40, YF + 20, x1 - x0 - 80, 270, 360);
  }
  if (v.wash) { const x0 = X1 - 480; a.box(x0, YF + 80, base, X1 - 20, YB - 80, base + 760); a.box(x0 + 40, YF + 20, base + 760, X1 - 60, YB - 60, base + 860); a.cyl(x0 + 220, YF + 80, base + 860, base + 960, 14, 8); a.box(x0 + 40, YF + 40, base + 330, X1 - 60, YB - 120, base + 360); a.rect(x0, YF + 80, X1 - 20, YB - 80, 'EQUIP-DETAIL'); }
  if (v.ramp) rampY(a, X0 + 80, X0 + 80 + cw - 160, YF, YF + 20, Z0, 90);
  a.log(`Added ${n} booth${n > 1 ? 's' : ''} on a base frame with a door, handle, louvers, a roof overhang and a vent stack${v.wash ? ', and a hand-wash unit on the side' : ''} (plan and 3D).`);
}

function siteLocker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a; a.outline();
  const cols = v.cols, tiers = v.tiers, base = Z0 + 100, lw = W / cols, bz = base, top = Z1 - 80;
  a.box(X0 + 30, YF + 40, Z0, X1 - 30, YB - 20, base); a.box(X0, YF + 20, bz, X1, YB, top); rampY(a, X0, X1, YF + 20, YB, top, 80);
  for (let c = 0; c < cols; c++) for (let t = 0; t < tiers; t++) {
    const x0 = X0 + c * lw + 5, x1 = X0 + (c + 1) * lw - 5, hh = (top - bz) / tiers, z0 = bz + t * hh + 5, z1 = bz + (t + 1) * hh - 5;
    a.box(x0, YF, z0, x1, YF + 20, z1); for (let k = 0; k < 4; k++) a.box(x0 + 30, YF - 3, z1 - 140 + k * 26, x1 - 30, YF, z1 - 126 + k * 26); a.ycyl(YF - 10, YF, x1 - 50, (z0 + z1) / 2, 14, 8); a.box(x1 - 90, YF - 4, z0 + 26, x1 - 20, YF, z0 + 70); a.line(x0, YF, x0, YF + 20, 'EQUIP-DETAIL');
  }
  if (v.bench) { a.box(X0 + 20, YF - 0, Z0 + 120, X1 - 20, YF + 10, Z0 + 150); }
  a.line(X0, YF, X1, YF);
  a.log(`Added ${cols * tiers} steel doors with louvers, handles and number plates on a plinth under a sloped top (plan and 3D).`);
}

function wheelbarrow(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = Math.min(200, (Z1 - Z0) * 0.3), wy = YF + R + 40, tz0 = Z0 + (Z1 - Z0) * 0.4, ty0 = YF + R * 0.8, ty1 = YB - D * 0.3, hw = W * 0.4;
  const wx = v.two ? [cx - hw * 0.75, cx + hw * 0.75] : [cx];
  for (const x of wx) { a.xcyl(x - 24, x + 24, wy, Z0 + R, R, 20); a.xcyl(x - 8, x + 8, wy, Z0 + R, R * 0.5, 12); a.rect(x - 24, wy - R, x + 24, wy + R, 'EQUIP-DETAIL'); }
  a.xcyl(wx[0] - (v.two ? 40 : 90), wx[wx.length - 1] + (v.two ? 40 : 90), wy, Z0 + R, 8, 6);
  const layers = [[0.0, 0.5], [0.3, 0.7], [0.6, 0.86], [0.8, 1.0]];
  for (let i = 0; i < 4; i++) { const f = 0.62 + i * 0.13, z0 = tz0 + (Z1 - tz0) * (i / 4), z1 = tz0 + (Z1 - tz0) * ((i + 1) / 4); a.prism([[cx - hw * f * 0.7, ty0 + 60 * i], [cx + hw * f * 0.7, ty0 + 60 * i], [cx + hw * f, ty1], [cx - hw * f, ty1]], z0, z1); }
  a.box(cx - hw * 0.5, ty0 + 20, tz0 - 20, cx + hw * 0.5, ty1, tz0);
  for (const s of [-1, 1]) { const x = cx + s * hw * 0.62; a.tube([[x, ty0 + 150, tz0 - 10], [x * 0.98 + cx * 0.02, YB - 60, Z0 + (Z1 - Z0) * 0.52]], [14, 12], 6); a.cyl(x * 0.98 + cx * 0.02, YB - 60, Z0 + (Z1 - Z0) * 0.52 - 120, Z0 + (Z1 - Z0) * 0.52 + 40, 20, 8); a.tube([[x, ty1 - 120, tz0 - 10], [x, YB - 160, Z0]], [14, 14], 6); a.box(x - 60, YB - 220, Z0, x + 60, YB - 100, Z0 + 20); a.tube([[x * 0.98 + cx * 0.02, YB - 60, Z0 + (Z1 - Z0) * 0.52], [x, ty0 + 150, tz0 - 10]], [14, 14], 6); }
  a.line(cx - hw, ty1, cx + hw, ty1); a.line(cx - hw * 0.62, ty0, cx + hw * 0.62, ty0);
  a.log(`Added the ${v.two ? 'two wheels with an axle' : 'wheel and axle'}, a tapered pressed tray with a rim, two tube handles with grips and two legs with feet (plan and 3D).`);
}

function cylTrolley(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const n = v.n, cr = Math.min(D * 0.4, (W - 120) / n / 2 - 6), wy = YB - 120, wr = Math.min(180, W * 0.28);
  for (const x of [X0 + 40, X1 - 40]) { a.xcyl(x - 20, x + 20, wy, Z0 + wr, wr, 18); a.rect(x - 20, wy - wr, x + 20, wy + wr, 'EQUIP-DETAIL'); a.tube([[x * 0.8 + cx * 0.2, YB - 40, Z1 - 100], [x * 0.8 + cx * 0.2, wy, Z0 + wr + 20]], [12, 12], 6); }
  a.xcyl(X0 + 40, X1 - 40, wy, Z0 + wr, 8, 6); a.box(X0 + 60, YF + 20, Z0 + 140, X1 - 60, YB - 150, Z0 + 170);
  a.tube([[X0 + 70, YB - 40, Z1 - 100], [X0 + 70, YB - 40, Z1], [X1 - 70, YB - 40, Z1], [X1 - 70, YB - 40, Z1 - 100]], [14, 14, 14, 14], 6);
  for (let i = 0; i < n; i++) { const x = X0 + 60 + ((W - 120) * (i + 0.5)) / n; a.cyl(x, cy - D * 0.05, Z0 + 170, Z1 - 120, cr, 16); a.cone(x, cy - D * 0.05, Z1 - 120, Z1 - 60, cr, cr * 0.4, 14); a.cyl(x, cy - D * 0.05, Z1 - 60, Z1 - 40, cr * 0.4, 10); a.circ(x, cy - D * 0.05, cr); }
  a.box(X0 + 60, cy + cr * 0.4, Z0 + (Z1 - Z0) * 0.55, X1 - 60, YB - 130, Z0 + (Z1 - Z0) * 0.55 + 20);
  a.box(X0 + 60, YB - 150, Z0 + 170, X1 - 60, YB - 120, Z1 - 140);
  a.log(`Added a frame with two wheels, a toe plate, ${n} standing gas cylinder${n > 1 ? 's' : ''} with domed shoulders and a restraint bar, and a top handle (plan and 3D).`);
}

function materialRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const nu = v.up, arms = v.arms, ah = (Z1 - Z0 - 200) / arms;
  for (let i = 0; i < nu; i++) { const x = X0 + 60 + ((W - 120) * i) / (nu - 1); a.box(x - 30, YB - 120, Z0 + 20, x + 30, YB - 60, Z1); a.box(x - 30, YF + 20, Z0, x + 30, YB, Z0 + 30); a.rect(x - 30, YF + 20, x + 30, YB, 'EQUIP-DETAIL');
    for (let k = 0; k < arms; k++) { const z = Z0 + 130 + k * ah; a.box(x - 25, YF + 40, z, x + 25, YB - 120, z + 30); a.tube([[x, YB - 120, z - 80], [x, YF + 200, z]], [14, 14], 6); } }
  for (let i = 0; i < nu - 1; i++) { const x0 = X0 + 60 + ((W - 120) * i) / (nu - 1), x1 = X0 + 60 + ((W - 120) * (i + 1)) / (nu - 1); a.tube([[x0, YB - 90, Z0 + 30], [x1, YB - 90, Z1 - 100]], [10, 10], 6); a.tube([[x1, YB - 90, Z0 + 30], [x0, YB - 90, Z1 - 100]], [10, 10], 6); }
  if (v.load) for (let k = 0; k < arms; k += 2) { const z = Z0 + 130 + k * ah + 30; if (v.load === 'pipe') for (let p = 0; p < 4; p++) a.xcyl(X0 + 20, X1 - 20, YF + 140 + p * 105, z + 50, 50, 10); else for (let p = 0; p < 3; p++) a.box(X0 + 20, YF + 120 + p * 140, z, X1 - 20, YF + 120 + p * 140 + 120, z + 80); }
  a.log(`Added ${nu} uprights on base beams with ${arms} cantilever arm levels each, diagonal braces${v.load ? ' and a stack of ' + (v.load === 'pipe' ? 'pipe lengths' : 'timber') + ' on the lower arms' : ''} (plan and 3D).`);
}

function sawhorse(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const bt = v.steel ? 70 : 90;
  a.box(X0, cy - bt, Z1 - bt * 1.6, X1, cy + bt, Z1);
  for (const x of [X0 + W * 0.12, X1 - W * 0.12]) { for (const y of [YF + 50, YB - 50]) { a.tube([[x, cy, Z1 - bt], [x, y, Z0 + 12]], [v.steel ? 16 : 32, v.steel ? 16 : 32], 6); a.box(x - 30, y - 30, Z0, x + 30, y + 30, Z0 + 14); } a.line(x, YF + 50, x, YB - 50, 'EQUIP-DETAIL'); a.box(x - 36, cy - 30, Z0 + (Z1 - Z0) * 0.4, x + 36, cy + 30, Z0 + (Z1 - Z0) * 0.4 + 40); }
  if (v.shelf) a.box(X0 + W * 0.12, YF + 80, Z0 + (Z1 - Z0) * 0.32, X1 - W * 0.12, YB - 80, Z0 + (Z1 - Z0) * 0.32 + 24);
  a.rect(X0, cy - bt, X1, cy + bt, 'EQUIP');
  a.log(`Added a top ${v.steel ? 'channel' : 'beam'} with two pairs of splayed ${v.steel ? 'tube' : 'timber'} legs, foot pads and gussets${v.shelf ? ' and a lower shelf' : ''} (plan and 3D).`);
}

function stepLadder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const yTop = cy - 60, n = v.steps, lx = [X0 + 40, X1 - 40], topH = Z1 - 40;
  const yAt = (z) => (YF + 30) + (yTop - (YF + 30)) * ((z - Z0) / (topH - Z0));
  for (const x of lx) { a.tube([[x, yTop, topH], [x, YF + 30, Z0 + 10]], [20, 20], 6); a.tube([[x, yTop + 60, topH], [x, YB - 30, Z0 + 10]], [16, 16], 6); a.box(x - 22, YF + 10, Z0, x + 22, YF + 50, Z0 + 14); a.box(x - 20, YB - 50, Z0, x + 20, YB - 10, Z0 + 14); }
  for (let i = 0; i < n; i++) { const z = Z0 + 250 + ((topH - Z0 - 450) * i) / Math.max(1, n - 1), y = yAt(z); a.box(X0 + 40, y - 40, z - 14, X1 - 40, y + 40, z + 14); a.line(X0 + 40, y, X1 - 40, y, 'EQUIP-DETAIL'); }
  a.box(X0 + 20, yTop - 60, topH, X1 - 20, yTop + 160, Z1); a.rect(X0 + 20, yTop - 60, X1 - 20, yTop + 160, 'EQUIP');
  for (const x of lx) a.tube([[x, yAt(Z0 + (Z1 - Z0) * 0.35), Z0 + (Z1 - Z0) * 0.35], [x, YB - 30 - (YB - 30 - yTop - 60) * 0.35, Z0 + (Z1 - Z0) * 0.35]], [8, 8], 6);
  a.log(`Added two front rails and two rear rails, ${n} steps, spreader bars, rubber feet and a top platform with a rim (plan and 3D).`);
}

const CONSTR = [
  fam({ cat: CAT, title: 'Generic construction site notice board',
    desc: (v) => `Two posts on base plates carrying a framed board with ${v.cols * v.rows} sign plates${v.hood ? ' and a hood over the top' : ''}.`,
    vs: [['two plates by one, 4 ft', 48, 18, 84, 0, { cols: 2, rows: 1 }], ['three by two with hood, 6 ft', 72, 24, 108, 0, { cols: 3, rows: 2, hood: true }], ['four by two, 8 ft', 96, 24, 108, 0, { cols: 4, rows: 2 }], ['four by three with hood, 10 ft', 120, 30, 120, 0, { cols: 4, rows: 3, hood: true }]], build: siteBoard }),
  fam({ cat: CAT, title: 'Generic site traffic cone',
    desc: (v) => `Tapered cone on a square base${v.weighted ? ' with a ring weight' : ''} with ${v.bands.length} reflective collar${v.bands.length > 1 ? 's' : ''}.`,
    vs: [['18 in', 11, 11, 18, 0, { bands: [[0.4, 0.62]] }], ['28 in two collars', 14, 14, 28, 0, { bands: [[0.36, 0.52], [0.62, 0.74]] }], ['36 in two collars', 16, 16, 36, 0, { bands: [[0.36, 0.52], [0.62, 0.74]] }], ['28 in weighted base', 16, 16, 28, 0, { bands: [[0.36, 0.52], [0.62, 0.74]], weighted: true }]], build: trafficCone }),
  fam({ cat: CAT, title: 'Generic site A-frame barricade',
    desc: (v) => `Two A-frame ends with foot pads and ${v.rails} striped rail board${v.rails > 1 ? 's' : ''}${v.lamp ? ' and a warning lamp on a bracket' : ''}.`,
    vs: [['4 ft, two rails', 48, 24, 42, 0, { rails: 2 }], ['6 ft, three rails', 72, 24, 54, 0, { rails: 3 }], ['8 ft, three rails', 96, 26, 54, 0, { rails: 3 }], ['6 ft with lamp', 72, 24, 66, 0, { rails: 3, lamp: true }]], build: aBarricade }),
  fam({ cat: CAT, title: 'Generic site temporary fence panel',
    desc: (v) => `${v.n} tube-framed mesh panel${v.n > 1 ? 's' : ''} with ${v.cloth ? 'a screen cloth, ' : ''}coupling clamps and block feet.`,
    vs: [['single panel, 6 ft by 8 ft', 96, 24, 72, 0, { n: 1 }], ['two panels coupled', 192, 24, 72, 0, { n: 2 }], ['panel with screen cloth', 96, 24, 72, 0, { n: 1, cloth: true }], ['three panels coupled, 6.5 ft high', 288, 24, 78, 0, { n: 3 }]], build: fencePanel }),
  fam({ cat: CAT, title: 'Generic site water-filled barrier',
    desc: (v) => `Stepped tapered water-fillable body on a foot with end interlocks, a fill cap and lift slots${v.posts ? ' and two fence post sockets on top' : ''}.`,
    vs: [['6 ft long, 32 in high', 72, 18, 32, 0, {}], ['8 ft long, 32 in high', 96, 20, 32, 0, {}], ['12 ft long, 42 in high', 144, 24, 42, 0, {}], ['6 ft long, 18 in low', 72, 16, 18, 0, {}], ['8 ft with fence sockets, 42 in', 96, 24, 42, 0, { posts: true }]], build: waterBarrier }),
  fam({ cat: CAT, title: 'Generic scaffold stair tower',
    desc: 'Stair of treads on two stringers to a landing deck with four standards, base plates, handrails with mid rails and a toe board.',
    vs: [['4 ft rise', 88, 36, 88, 0, {}], ['6 ft rise', 116, 36, 112, 0, {}], ['8 ft rise', 144, 36, 136, 0, {}], ['12 ft rise', 200, 36, 184, 0, {}]], build: scaffoldStair }),
  fam({ cat: CAT, title: 'Generic site portable toilet',
    desc: (v) => `${v.n} booth${v.n > 1 ? 's' : ''} on a base frame with a door, handle, louvers, a roof overhang and a vent stack${v.wash ? ' and a hand-wash unit on the side' : ''}${v.ramp ? ', with a wheelchair ramp' : ''}.`,
    vs: [['single booth', 44, 44, 92, 0, { n: 1 }], ['single with hand-wash unit', 64, 44, 92, 0, { n: 1, wash: true }], ['accessible, wide booth with ramp', 72, 60, 92, 0, { n: 1, ramp: true }], ['two booths in a row', 88, 44, 92, 0, { n: 2 }], ['three-booth trailer', 138, 48, 96, 0, { n: 3, wash: true }]], build: siteToilet }),
  fam({ cat: CAT, title: 'Generic construction site locker unit',
    desc: (v) => `${v.cols * v.tiers} steel doors with louvers, handles and number plates on a plinth under a sloped top.`,
    vs: [['two single doors', 24, 18, 72, 0, { cols: 2, tiers: 1 }], ['three single doors', 36, 18, 72, 0, { cols: 3, tiers: 1 }], ['four single doors', 48, 18, 72, 0, { cols: 4, tiers: 1 }], ['six doors in two tiers', 36, 18, 72, 0, { cols: 3, tiers: 2 }]], build: siteLocker }),
  fam({ cat: CAT, title: 'Generic site wheelbarrow',
    desc: (v) => `${v.two ? 'Two-wheel' : 'Single-wheel'} barrow with a tapered pressed tray, two tube handles with grips and two legs with feet.`,
    vs: [['one wheel, 4 cu ft', 24, 56, 28, 0, {}], ['one wheel, 6 cu ft', 26, 60, 30, 0, {}], ['two wheels, 8 cu ft', 30, 62, 30, 0, { two: true }]], build: wheelbarrow }),
  fam({ cat: CAT, title: 'Generic site gas cylinder trolley',
    desc: (v) => `Two-wheel frame with a toe plate, ${v.n} standing gas cylinder${v.n > 1 ? 's' : ''} with domed shoulders, a restraint bar and a top handle.`,
    vs: [['one cylinder', 16, 16, 60, 0, { n: 1 }], ['two cylinders', 26, 16, 60, 0, { n: 2 }], ['two large cylinders', 30, 18, 66, 0, { n: 2 }]], build: cylTrolley }),
  fam({ cat: CAT, title: 'Generic site cantilever material rack',
    desc: (v) => `${v.up} uprights on base beams with ${v.arms} cantilever arm levels each and diagonal braces${v.load ? ', carrying ' + (v.load === 'pipe' ? 'pipe lengths' : 'timber') : ''}.`,
    vs: [['two uprights, 4 ft', 48, 40, 72, 0, { up: 2, arms: 3 }], ['three uprights with timber', 96, 40, 84, 0, { up: 3, arms: 4, load: 'timber' }], ['three uprights with pipe', 96, 44, 84, 0, { up: 3, arms: 4, load: 'pipe' }]], build: materialRack }),
  fam({ cat: CAT, title: 'Generic site sawhorse',
    desc: (v) => `Top ${v.steel ? 'channel' : 'beam'} with two pairs of splayed ${v.steel ? 'tube' : 'timber'} legs, foot pads and gussets${v.shelf ? ' and a lower shelf' : ''}.`,
    vs: [['timber, 24 in high', 42, 20, 24, 0, {}], ['timber, 32 in high with shelf', 42, 20, 32, 0, { shelf: true }], ['steel tube, 28 in high', 40, 22, 28, 0, { steel: true }]], build: sawhorse }),
  fam({ cat: CAT, title: 'Generic site step ladder',
    desc: (v) => `A-frame with two front rails, two rear rails, ${v.steps} steps, spreader bars, rubber feet and a top platform with a rim.`,
    vs: [['4 ft, four steps', 20, 28, 50, 0, { steps: 4 }], ['6 ft, six steps', 22, 36, 74, 0, { steps: 6 }], ['8 ft, eight steps', 24, 46, 98, 0, { steps: 8 }], ['3 step stool', 20, 22, 40, 0, { steps: 3 }]], build: stepLadder }),
];

// ================================================================ MINING ============================================================
function mineSign(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(cx - W * 0.35, YF, Z0, cx + W * 0.35, YB, Z0 + 40); a.rect(cx - W * 0.35, YF, cx + W * 0.35, YB, 'EQUIP-DETAIL'); a.box(cx - 32, cy - 32, Z0 + 40, cx + 32, cy + 32, Z1); a.rect(cx - 32, cy - 32, cx + 32, cy + 32, 'EQUIP-DETAIL');
  const n = v.shapes.length, ph = Math.min(W * (v.wide ? 0.5 : 0.8), (Z1 - Z0 - 220) / n - 40), pw = v.wide ? W * 0.9 : ph;
  for (let i = 0; i < n; i++) {
    const zt = Z1 - 60 - i * (ph + 40), zb = zt - ph, y1 = cy - 32, y0 = y1 - 8;
    if (v.shapes[i] === 'round') { a.ycyl(y0, y1, cx, (zt + zb) / 2, ph / 2, 26); a.ycyl(y0 - 6, y0, cx, (zt + zb) / 2, ph * 0.38, 26); a.box(cx - ph * 0.28, y0 - 10, (zt + zb) / 2 - 18, cx + ph * 0.28, y0 - 6, (zt + zb) / 2 + 18); }
    else { a.box(cx - pw / 2, y0, zb, cx + pw / 2, y1, zt); a.frame(cx - pw / 2 + 14, zb + 14, cx + pw / 2 - 14, zt - 14, y0 - 4, y0, 12); a.box(cx - pw * 0.34, y0 - 8, zb + ph * 0.22, cx - pw * 0.04, y0 - 4, zt - ph * 0.22); a.box(cx + pw * 0.04, y0 - 8, zb + ph * 0.3, cx + pw * 0.34, y0 - 4, zb + ph * 0.45); a.box(cx + pw * 0.04, y0 - 8, zb + ph * 0.55, cx + pw * 0.28, y0 - 4, zb + ph * 0.7); }
    a.line(cx - pw / 2, y0, cx + pw / 2, y0, 'EQUIP-DETAIL');
  }
  a.cyl(cx, cy, Z1, Z1 + 0.5, 1, 4);
  a.log(`Added a base plate, a square post and ${n} sign plate${n > 1 ? 's' : ''} (${v.shapes.join(' and ')}) with pictogram bars (plan and 3D).`);
}

function tagBoard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YB - 36, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YB - 80, YB - 36, 26);
  const parts = v.split ? 2 : 1, gap = v.split ? 60 : 0, pw = (W - 80 - gap) / parts;
  if (v.split) a.box(cx - 30, YB - 80, Z0 + 26, cx + 30, YB - 36, Z1 - 26);
  for (let p = 0; p < parts; p++) {
    const px0 = X0 + 40 + p * (pw + gap), cw = pw / v.cols, rh = (Z1 - Z0 - 240) / v.rows;
    a.box(px0, YB - 52, Z1 - 150, px0 + pw, YB - 36, Z1 - 60); a.box(px0 + 30, YB - 58, Z1 - 135, px0 + pw * 0.45, YB - 52, Z1 - 75);
    for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) { const x = px0 + cw * (c + 0.5), z = Z0 + 90 + rh * (r + 0.5); a.ycyl(YB - 52, YB - 40, x, z, 5, 6); if ((r + c * 2) % 3) a.ycyl(YB - 58, YB - 52, x, z, Math.min(cw, rh) * 0.34, 12); }
  }
  a.rect(X0, YB - 80, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added a backboard with a frame${v.split ? ', a centre divider' : ''}, ${parts > 1 ? 'two ' : ''}header strip${parts > 1 ? 's' : ''} and ${v.cols * v.rows * parts} pegs, many with round tags (plan and 3D).`);
}

function refuge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const sk = 100; for (const y of [cy - D * 0.3, cy + D * 0.3]) { a.box(X0, y - 60, Z0, X1, y + 60, Z0 + sk); a.rect(X0, y - 60, X1, y + 60, 'EQUIP-HIDDEN'); }
  if (v.box) {
    a.box(X0 + 20, YF + 80, Z0 + sk, X1 - 20, YB - 80, Z1 - 120); a.box(X0 + 10, YF + 70, Z1 - 120, X1 - 10, YB - 70, Z1 - 60);
    for (let i = 1; i < 8; i++) { const x = X0 + 20 + ((W - 40) * i) / 8; a.box(x - 20, YF + 60, Z0 + sk, x + 20, YF + 80, Z1 - 60); }
    a.ycyl(YF + 40, YF + 80, X0 + W * 0.22, Z0 + sk + (Z1 - Z0 - sk) * 0.48, 340, 24); a.ycyl(YF + 30, YF + 40, X0 + W * 0.22, Z0 + sk + (Z1 - Z0 - sk) * 0.48, 260, 24);
    a.cyl(X1 - W * 0.12, cy, Z1 - 60, Z1, 70, 12);
  } else {
    const R = Math.min(D / 2 - 70, (Z1 - Z0 - sk) / 2), zc = Z0 + sk + R; a.xcyl(X0 + R * 0.2, X1 - R * 0.2, cy, zc, R, 28); a.ell(X0 + R * 0.2, cy, zc, R * 0.4, R, R, 12, 10); a.ell(X1 - R * 0.2, cy, zc, R * 0.4, R, R, 12, 10);
    for (let i = 1; i < 10; i++) { const x = X0 + (W * i) / 10; a.xcyl(x - 15, x + 15, cy, zc, R + 20, 28); }
    const dx = X0 + W * 0.25; a.ycyl(cy - R - 50, cy - R + 20, dx, zc, R * 0.45, 24); a.ycyl(cy - R - 64, cy - R - 50, dx, zc, R * 0.34, 24);
    for (const x of [X1 - W * 0.2, X1 - W * 0.12]) a.ycyl(cy - R - 20, cy - R + 20, x, zc + R * 0.15, 80, 14);
  }
  for (const x of [X0 + W * 0.1, X1 - W * 0.1]) a.box(x - 50, cy - 40, Z1 - 60, x + 50, cy + 40, Z1 - 20);
  a.circ(X0 + W * (v.box ? 0.22 : 0.25), YF + 50, v.box ? 340 : 200, 'EQUIP-DETAIL');
  a.log(`Added two skids, a ${v.box ? 'ribbed steel box hull' : 'cylindrical hull with end domes and ribs'}, a round door with a sealing ring, viewing ports, lifting lugs and a vent stack (plan and 3D).`);
}

function lampRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const sides = v.stand ? [-1, 1] : [1];
  if (v.stand) { a.box(X0, YF, Z0, X1, YB, Z0 + 50); a.box(X0 + 60, cy - 30, Z0 + 50, X1 - 60, cy + 30, Z1 - 40); a.box(X0, cy - D * 0.4, Z1 - 40, X1, cy + D * 0.4, Z1); a.rect(X0 + 60, cy - 30, X1 - 60, cy + 30, 'EQUIP-DETAIL'); }
  else { a.box(X0, YB - 40, Z0, X1, YB, Z1); a.frame(X0, Z0, X1, Z1, YB - D, YB - 40, 24); }
  const cw = (W - 100) / v.cols, rh = (Z1 - Z0 - (v.stand ? 260 : 120)) / v.rows;
  for (const s of sides) for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) {
    const x = X0 + 50 + cw * (c + 0.5), z = Z0 + (v.stand ? 130 : 60) + rh * (r + 0.5), yb = v.stand ? cy + s * 30 : YB - 40, dir = v.stand ? s : -1;
    a.box(x - cw * 0.4, dir < 0 ? yb - 40 : yb, z - rh * 0.4, x + cw * 0.4, dir < 0 ? yb : yb + 40, z + rh * 0.4); a.ycyl(dir < 0 ? yb - 80 : yb + 40, dir < 0 ? yb - 40 : yb + 80, x, z, Math.min(cw, rh) * 0.2, 8); a.cyl(x + cw * 0.28, dir < 0 ? yb - 50 : yb + 50, z + rh * 0.3, z + rh * 0.36, 5, 6);
  }
  if (!v.stand) a.rect(X0, YB - D, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added ${v.stand ? 'a base, a centre spine with two rack faces and a top plate' : 'a wall backboard and frame'} with ${v.cols * v.rows * sides.length} lamp pockets, each with a cap lamp head and an indicator (plan and 3D).`);
}

function oreCar(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const g = D * 0.55, wr = 130, rz = Z0 + 40, ws = [X0 + W * 0.2, X1 - W * 0.2], zc = Z0 + 40 + 55 + wr * 2 - 10;
  for (const s of [-1, 1]) { a.box(X0, cy + s * g / 2 - 30, rz, X1, cy + s * g / 2 + 30, rz + 55); a.line(X0, cy + s * g / 2, X1, cy + s * g / 2, 'EQUIP-DETAIL'); }
  for (let x = X0 + 80; x < X1 - 40; x += 400) a.box(x - 40, cy - g / 2 - 100, Z0, x + 40, cy + g / 2 + 100, rz);
  for (const x of ws) { a.ycyl(cy - g / 2 - 20, cy + g / 2 + 20, x, rz + 55 + wr, 22, 8); for (const s of [-1, 1]) { a.ycyl(cy + s * g / 2 - 28, cy + s * g / 2 + 28, x, rz + 55 + wr, wr, 18); a.circ(x, cy + s * g / 2, 28, 'EQUIP-DETAIL'); } }
  a.box(X0 + 120, cy - D * 0.36, zc, X1 - 120, cy + D * 0.36, zc + 70); a.box(X0, cy - 40, zc + 10, X0 + 160, cy + 40, zc + 60); a.box(X1 - 160, cy - 40, zc + 10, X1, cy + 40, zc + 60); a.cyl(X0 + 40, cy, zc - 20, zc + 70, 16, 8); a.cyl(X1 - 40, cy, zc - 20, zc + 70, 16, 8);
  if (v.kind === 'tub') { taper(a, X0 + 100, X1 - 100, cy - D * 0.36, cy + D * 0.36, zc + 70, cy - D * 0.47, cy + D * 0.47, Z1 - 40); a.box(X0 + 90, cy - D * 0.5, Z1 - 40, X1 - 90, cy + D * 0.5, Z1); for (let i = 1; i < 5; i++) { const x = X0 + 100 + ((W - 200) * i) / 5; a.box(x - 25, cy - D * 0.48, zc + 90, x + 25, cy + D * 0.48, Z1 - 40); } if (v.dump) { a.box(X0 + W * 0.45, cy - D * 0.5 - 20 + 0, zc + 100, X0 + W * 0.55, cy - D * 0.5, Z1 - 100); } }
  else if (v.kind === 'flat') { a.box(X0 + 80, cy - D * 0.48, zc + 70, X1 - 80, cy + D * 0.48, zc + 130); for (let i = 0; i < 6; i++) { const x = X0 + 120 + ((W - 240) * i) / 5; a.box(x - 20, cy - D * 0.5, zc + 130, x + 20, cy - D * 0.5 + 40, zc + 420); a.box(x - 20, cy + D * 0.5 - 40, zc + 130, x + 20, cy + D * 0.5, zc + 420); } a.box(X0 + 80, cy - D * 0.5, zc + 400, X1 - 80, cy - D * 0.5 + 40, zc + 440); a.box(X0 + 80, cy + D * 0.5 - 40, zc + 400, X1 - 80, cy + D * 0.5, zc + 440); }
  else { a.box(X0 + 80, cy - D * 0.48, zc + 70, X1 - 80, cy + D * 0.48, zc + 120); const n = v.seats; for (let i = 0; i < n; i++) { const x = X0 + 120 + ((W - 240) * (i + 0.5)) / n; a.box(x - 120, cy - D * 0.4, zc + 120, x + 120, cy - D * 0.1, zc + 220); a.box(x - 120, cy - D * 0.45, zc + 220, x + 120, cy - D * 0.4, zc + 460); a.box(x - 120, cy + D * 0.1, zc + 120, x + 120, cy + D * 0.4, zc + 220); a.box(x - 120, cy + D * 0.4, zc + 220, x + 120, cy + D * 0.45, zc + 460); } for (const x of [X0 + 100, X1 - 100]) for (const y of [cy - D * 0.45, cy + D * 0.45]) a.cyl(x, y, zc + 120, Z1, 20, 8); a.box(X0 + 80, cy - D * 0.5, Z1 - 40, X1 - 80, cy + D * 0.5, Z1); }
  a.rect(X0 + 100, cy - D * 0.4, X1 - 100, cy + D * 0.4, 'EQUIP');
  a.log(`Added the rails on sleepers, four flanged wheels on two axles, a chassis with drawbar couplers and ${v.kind === 'tub' ? 'a tapered ore tub with a rim and ribs' : v.kind === 'flat' ? 'a flat deck with stakes and side rails' : 'a deck with ' + v.seats + ' facing bench seats and a roof frame'} (plan and 3D).`);
}

function roofProp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const r = W * 0.5 - 6; a.box(X0, YF, Z0, X1, YB, Z0 + 18); a.circ(cx, cy, r, 'EQUIP'); a.circ(cx, cy, r * 0.5, 'EQUIP-DETAIL');
  if (v.kind === 'timber') { a.cyl(cx, cy, Z0 + 18, Z1 - 20, W * 0.34, 14); a.box(X0 + 20, YF + 20, Z1 - 20, X1 - 20, YB - 20, Z1); a.box(cx - 50, cy - W * 0.34 - 18, Z0 + 18, cx + 50, cy - W * 0.34, Z0 + 180); a.box(cx - 50, cy + W * 0.34, Z0 + 18, cx + 50, cy + W * 0.34 + 18, Z0 + 180); a.circ(cx, cy, W * 0.34, 'EQUIP-DETAIL'); }
  else {
    const zm = Z0 + (Z1 - Z0) * (v.kind === 'friction' ? 0.5 : 0.52), ro = W * 0.22;
    a.cyl(cx, cy, Z0 + 18, zm, ro, 18); a.cyl(cx, cy, zm - 30, zm + 30, ro + 8, 18); a.cyl(cx, cy, zm, Z1 - 40, ro * 0.78, 18); a.cyl(cx, cy, Z1 - 40, Z1 - 24, ro * 1.3, 18); a.box(X0 + 10, YF + 10, Z1 - 24, X1 - 10, YB - 10, Z1);
    if (v.kind === 'hydraulic') { a.box(cx + ro, cy - 30, Z0 + (Z1 - Z0) * 0.22, cx + ro + 80, cy + 30, Z0 + (Z1 - Z0) * 0.3); a.ycyl(cy - 60, cy - 30, cx + ro + 40, Z0 + (Z1 - Z0) * 0.26, 24, 12); }
    else { a.box(cx - ro - 20, cy - 20, zm - 90, cx + ro + 20, cy + 20, zm - 50); a.box(cx - ro - 20, cy - 20, zm + 20, cx + ro + 20, cy + 20, zm + 60); a.cyl(cx, cy, zm - 60, zm + 60, ro * 0.9, 8); }
  }
  a.log(`Added a base plate${v.kind === 'timber' ? ', a round timber post with a head plate and two wedges' : ', an outer tube, a collar, an inner tube and a head plate' + (v.kind === 'hydraulic' ? ' with a valve block and gauge' : ' with a clamp block')} (plan and 3D).`);
}

function archSet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = D / 2 - 70, Rz = R * 0.92, zc = Z1 - 50 - Rz, n = v.sets;
  const prof = (x) => { const p = [[x, cy - R, Z0 + 18], [x, cy - R, zc]]; for (let k = 1; k < 14; k++) { const t = Math.PI - (Math.PI * k) / 14; p.push([x, cy + R * Math.cos(t), zc + Rz * Math.sin(t)]); } p.push([x, cy + R, zc], [x, cy + R, Z0 + 18]); return p; };
  const xs = []; for (let i = 0; i < n; i++) xs.push(X0 + 90 + ((W - 180) * i) / (n - 1));
  for (const x of xs) { const p = prof(x); a.tube(p, p.map(() => 42), 6); for (const y of [cy - R, cy + R]) { a.box(x - 80, y - 80, Z0, x + 80, y + 80, Z0 + 18); a.circ(x, y, 80, 'EQUIP-HIDDEN'); } a.line(x, cy - R, x, cy + R); }
  for (let i = 0; i < n - 1; i++) { const p0 = prof(xs[i]), p1 = prof(xs[i + 1]); for (let k = 2; k < p0.length - 2; k += 3) a.tube([p0[k], p1[k]], [14, 14], 6); }
  a.rect(X0, cy - R - 80, X1, cy + R + 80, 'EQUIP-DETAIL');
  a.log(`Added ${n} horseshoe steel arches on foot plates joined by spacer tubes along the drift (plan and 3D).`);
}

function ventDoor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ow = v.leaves * 900, ox0 = cx - ow / 2, ox1 = cx + ow / 2, oh = Z1 - Z0 - 500;
  a.box(X0, YF, Z0, ox0, YB, Z1); a.box(ox1, YF, Z0, X1, YB, Z1); a.box(ox0, YF, Z0 + oh, ox1, YB, Z1);
  for (let k = 1; k < 8; k++) { a.box(X0, YF - 4, Z0 + ((Z1 - Z0) * k) / 8 - 3, ox0, YF, Z0 + ((Z1 - Z0) * k) / 8 + 3); a.box(ox1, YF - 4, Z0 + ((Z1 - Z0) * k) / 8 - 3, X1, YF, Z0 + ((Z1 - Z0) * k) / 8 + 3); }
  a.frame(ox0, Z0, ox1, Z0 + oh, YF - 30, YF, 50);
  const lw = (ow - 100) / v.leaves;
  for (let i = 0; i < v.leaves; i++) { const x0 = ox0 + 50 + i * lw + 3, x1 = ox0 + 50 + (i + 1) * lw - 3; a.box(x0, YF + 30, Z0 + 30, x1, YF + 30 + 40, Z0 + oh - 50); a.frame(x0 + 20, Z0 + 50, x1 - 20, Z0 + oh - 70, YF + 20, YF + 30, 40); for (const z of [Z0 + 250, Z0 + oh - 300]) a.box(x0 + (i ? 0 : lw - 20), YF + 4, z, x0 + (i ? 20 : lw), YF + 30, z + 40); a.box(i ? x0 + 60 : x1 - 140, YF + 4, Z0 + oh * 0.45, i ? x0 + 140 : x1 - 60, YF + 30, Z0 + oh * 0.45 + 25); a.arc(i ? x1 : x0, YF + 30, lw, i ? 180 : 270, i ? 270 : 360); }
  if (v.reg) { const rx0 = ox0 + 120, rx1 = ox1 - 120, rz1 = Z0 + oh - 100; a.box(rx0, YF - 6, rz1 - 300, rx1, YF + 30, rz1); for (let k = 0; k < 6; k++) a.box(rx0 + 20, YF - 12, rz1 - 280 + k * 42, rx1 - 20, YF - 6, rz1 - 250 + k * 42); a.box(rx1 - 50, YF - 20, rz1 - 330, rx1, YF - 6, rz1 - 300); }
  a.rect(ox0, YF, ox1, YF + 30, 'EQUIP-DETAIL');
  a.log(`Added a block bulkhead wall with a steel door frame, ${v.leaves === 2 ? 'two' : 'a'} door leaf${v.leaves === 2 ? 'ves' : ''} with hinges and a pull bar${v.reg ? ' and an adjustable louver regulator over the door' : ''} (plan and 3D).`);
}

function drillRack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const nu = v.up, tiers = v.tiers, r = 20;
  for (let i = 0; i < nu; i++) { const x = X0 + 80 + ((W - 160) * i) / (nu - 1); a.box(x - 30, cy - D * 0.45, Z0, x + 30, cy + D * 0.45, Z0 + 40); a.box(x - 30, cy - 30, Z0 + 40, x + 30, cy + 30, Z1);
    for (let t = 0; t < tiers; t++) { const z = Z0 + 200 + ((Z1 - Z0 - 280) * t) / Math.max(1, tiers - 1); a.box(x - 25, cy - D * 0.45, z, x + 25, cy + D * 0.45, z + 25); a.box(x - 25, cy - D * 0.45, z + 25, x + 25, cy - D * 0.45 + 30, z + 120); a.box(x - 25, cy + D * 0.45 - 30, z + 25, x + 25, cy + D * 0.45, z + 120); } }
  for (let t = 0; t < tiers; t++) { const z = Z0 + 200 + ((Z1 - Z0 - 280) * t) / Math.max(1, tiers - 1) + 25 + r; const m = Math.floor((D * 0.9 - 60) / (r * 2.4)); for (let k = 0; k < m; k++) { const y = cy - D * 0.45 + 50 + k * r * 2.4 + r; a.xcyl(X0 + 40, X1 - 40, y, z, r, 6); a.xcyl(X0 + 40, X0 + 140, y, z, r + 8, 6); a.xcyl(X1 - 140, X1 - 40, y, z, r + 8, 6); } }
  for (let i = 0; i < nu - 1; i++) { const x0 = X0 + 80 + ((W - 160) * i) / (nu - 1), x1 = X0 + 80 + ((W - 160) * (i + 1)) / (nu - 1); a.tube([[x0, cy, Z0 + 60], [x1, cy, Z1 - 60]], [8, 8], 6); }
  a.line(X0 + 40, cy, X1 - 40, cy);
  a.log(`Added ${nu} uprights on cross feet with ${tiers} tiers of cradle arms and lying drill rods with thread collars, and diagonal braces (plan and 3D).`);
}

function stretcherBasket(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const fz = Z0 + (v.wheel ? 150 : 40), w2 = D * 0.46, top = fz + 200;
  for (const s of [-1, 1]) { const y = cy + s * w2; a.tube([[X0 + 40, y, fz], [X1 - 40, y, fz]], [14, 14], 6); a.tube([[X0 + 60, y, top], [X1 - 120, y, top], [X1 - 40, y * 0.5 + cy * 0.5, top - 50]], [12, 12, 12], 6); for (let i = 0; i <= 8; i++) { const x = X0 + 60 + ((W - 160) * i) / 8; a.tube([[x, y, fz], [x, y, top]], [8, 8], 6); } }
  for (let i = 0; i <= 14; i++) { const x = X0 + 40 + ((W - 80) * i) / 14; a.tube([[x, cy - w2, fz + 4], [x, cy + w2, fz + 4]], [6, 6], 6); a.line(x, cy - w2, x, cy + w2, 'EQUIP-DETAIL'); }
  a.box(X0 + 20, cy - w2, fz, X0 + 60, cy + w2, top - 40); a.box(X1 - 40, cy - w2 * 0.6, fz, X1 - 20, cy + w2 * 0.6, fz + 160);
  for (const x of [X0 + W * 0.3, X0 + W * 0.5, X0 + W * 0.7]) a.box(x - 25, cy - w2 - 6, fz + 20, x + 25, cy + w2 + 6, fz + 40);
  if (v.wheel) { a.xcyl(cx - 90, cx + 90, cy, Z0 + 90, 90, 14); a.box(cx - 100, cy - 20, Z0 + 140, cx + 100, cy + 20, fz); }
  if (v.bridle) { const hz = Z1; for (const [x, y] of [[X0 + 80, cy - w2], [X0 + 80, cy + w2], [X1 - 120, cy - w2], [X1 - 120, cy + w2]]) a.tube([[x, y, top], [cx, cy, hz - 30]], [6, 6], 6); a.cyl(cx, cy, hz - 40, hz, 50, 10); }
  a.rect(X0 + 40, cy - w2, X1 - 40, cy + w2, 'EQUIP-DETAIL');
  a.log(`Added a tube floor frame with cross ribs, raised side rails with posts, a head board, a foot guard and three straps${v.wheel ? ', and a single wheel under the middle' : ''}${v.bridle ? ' and a four-leg lifting bridle with a ring' : ''} (plan and 3D).`);
}

function delineator(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const r = W * 0.5 - 6;
  if (v.spring) { a.cyl(cx, cy, Z0, Z0 + 40, r, 18); for (let i = 0; i < 6; i++) a.cyl(cx, cy, Z0 + 40 + i * 24, Z0 + 52 + i * 24, r * 0.5, 12); } else { a.cyl(cx, cy, Z0, Z0 + 20, r, 18); a.cone(cx, cy, Z0 - 0.01, Z0 + 20, r, r, 4); }
  const pz = Z0 + (v.spring ? 190 : 20); a.cyl(cx, cy, pz, Z1 - 20, r * 0.34, 12); a.cyl(cx, cy, Z1 - 20, Z1, r * 0.4, 12);
  for (const [f0, f1] of v.bands) { const z0 = Z0 + (Z1 - Z0) * f0, z1 = Z0 + (Z1 - Z0) * f1; a.cyl(cx, cy, z0, z1, r * 0.4, 12); }
  a.circ(cx, cy, r); a.circ(cx, cy, r * 0.34, 'EQUIP-DETAIL');
  a.log(`Added ${v.spring ? 'a spring base with coils' : 'a ground plate'}, a round post, ${v.bands.length} reflective sleeve${v.bands.length > 1 ? 's' : ''} and a cap (plan and 3D).`);
}

function gantry(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  for (const x of [X0 + 120, X1 - 120]) { a.box(x - 150, YF, Z0, x + 150, YB, Z0 + 30); a.box(x - 50, cy - 50, Z0 + 30, x + 50, cy + 50, Z1 - 200); a.rect(x - 150, YF, x + 150, YB, 'EQUIP-DETAIL'); a.tube([[x, cy, Z1 - 900], [x + (x < cx ? 520 : -520), cy, Z1 - 200]], [18, 18], 6); }
  a.box(X0 + 60, cy - 120, Z1 - 200, X1 - 60, cy + 120, Z1); a.frame(X0 + 60, Z1 - 200, X1 - 60, Z1, cy - 150, cy - 120, 20);
  const n = v.signs, sw = (W - 600) / n;
  for (let i = 0; i < n; i++) { const x0 = X0 + 300 + i * sw + 20, x1 = X0 + 300 + (i + 1) * sw - 20; a.box(x0, cy - 140, Z1 - 1100, x1, cy - 120, Z1 - 200); a.frame(x0 + 24, Z1 - 1076, x1 - 24, Z1 - 224, cy - 150, cy - 140, 16); a.box(x0 + 80, cy - 156, Z1 - 800, x1 - 80, cy - 150, Z1 - 520); if (v.lights) a.box((x0 + x1) / 2 - 150, cy - 150, Z1 - 200, (x0 + x1) / 2 + 150, cy - 120, Z1 - 140); }
  a.log(`Added two columns on base plates with knee braces, a box-frame beam and ${n} framed sign panel${n > 1 ? 's' : ''} hung below it${v.lights ? ' with a light bar over each' : ''} (plan and 3D).`);
}

function grizzly(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const bw = 60; a.box(X0, YF, Z0, X1, YF + 120, Z1); a.box(X0, YB - 120, Z0, X1, YB, Z1); a.box(X0, YF, Z0, X0 + 120, YB, Z1); a.box(X1 - 120, YF, Z0, X1, YB, Z1);
  const n = Math.floor((W - 240) / v.pitch); for (let i = 0; i <= n; i++) { const x = X0 + 120 + ((W - 240 - bw) * i) / n; a.box(x, YF + 120, Z0 + 20, x + bw, YB - 120, Z1 - 10); a.line(x + bw / 2, YF + 120, x + bw / 2, YB - 120, 'EQUIP-DETAIL'); }
  for (const f of [0.33, 0.66]) a.box(X0 + 120, cy - D / 2 + (D - 240) * f + 120 - 30, Z0 + 20, X1 - 120, cy - D / 2 + (D - 240) * f + 120 + 30, Z0 + 70);
  if (v.curb) { a.box(X0 - 0, YB - 120, Z1, X1, YB, Z1 + 0.5); }
  a.rect(X0 + 120, YF + 120, X1 - 120, YB - 120, 'EQUIP-DETAIL');
  a.log(`Added a heavy frame ring and ${n + 1} parallel grizzly bars spaced ${(v.pitch / 25.4).toFixed(0)} in apart with two cross ties under them (plan and 3D).`);
}

const MINE = [
  fam({ cat: CAT, title: 'Generic mine hazard sign post',
    desc: (v) => `Base plate and square post carrying ${v.shapes.length} sign plate${v.shapes.length > 1 ? 's' : ''} (${v.shapes.join(' and ')}) with pictogram bars.`,
    vs: [['one square plate, 7 ft', 24, 8, 84, 0, { shapes: ['rect'] }], ['round and square plates, 8 ft', 24, 8, 96, 0, { shapes: ['round', 'rect'] }], ['three plates, 9 ft', 30, 8, 108, 0, { shapes: ['round', 'rect', 'rect'] }], ['wide portal board, 9 ft', 60, 10, 108, 0, { shapes: ['rect', 'rect'], wide: true }]], build: mineSign }),
  fam({ cat: CAT, title: 'Generic mine tag-in tag-out board',
    desc: (v) => `Backboard with a frame${v.split ? ', a centre divider' : ''}, header strips and ${v.cols * v.rows * (v.split ? 2 : 1)} pegs with round tags.`,
    vs: [['ten pegs, 2 by 5', 14, 4, 22, 48, { cols: 2, rows: 5 }], ['forty pegs, 5 by 8', 26, 4, 40, 48, { cols: 5, rows: 8 }], ['one hundred pegs, 10 by 10', 44, 4, 48, 48, { cols: 10, rows: 10 }], ['two hundred pegs, 10 by 20', 44, 4, 84, 36, { cols: 10, rows: 20 }], ['in and out boards, 100 each', 96, 4, 48, 48, { cols: 10, rows: 10, split: true }]], build: tagBoard }),
  fam({ cat: CAT, title: 'Generic underground refuge chamber',
    desc: (v) => v.box ? 'Ribbed steel box hull on two skids with a round door, viewing ports, lifting lugs and a vent stack.' : 'Cylindrical hull with end domes and ribs on two skids, a round door with a sealing ring, viewing ports, lifting lugs and a vent stack.',
    vs: [['round hull, 6 person, 10 ft', 120, 60, 66, 0, {}], ['round hull, 12 person, 14 ft', 168, 72, 78, 0, {}], ['round hull, 24 person, 21 ft', 252, 84, 90, 0, {}], ['box hull, 16 person, 15 ft', 180, 78, 84, 0, { box: true }]], build: refuge }),
  fam({ cat: CAT, title: 'Generic mine lamp room charging rack',
    desc: (v) => `${v.stand ? 'Free-standing double-faced rack' : 'Wall backboard and frame'} with ${v.cols * v.rows * (v.stand ? 2 : 1)} lamp pockets, each with a cap lamp head and an indicator.`,
    vs: [['wall rack, 20 lamps', 24, 6, 30, 48, { cols: 4, rows: 5 }], ['wall rack, 50 lamps', 48, 6, 48, 36, { cols: 10, rows: 5 }], ['wall rack, 100 lamps', 72, 6, 66, 24, { cols: 10, rows: 10 }], ['double-faced stand, 60 lamps', 72, 24, 66, 0, { cols: 6, rows: 5, stand: true }]], build: lampRack }),
  fam({ cat: CAT, title: 'Generic mine rail ore car',
    desc: (v) => v.kind === 'tub' ? 'Ore tub on a chassis with four flanged wheels, drawbar couplers, a tapered body with ribs and a rim, on rails and sleepers.' : v.kind === 'flat' ? 'Flat deck car on four flanged wheels with stakes and side rails, drawbar couplers, on rails and sleepers.' : `Personnel bench car with ${v.seats} facing seat pairs, a roof frame, four flanged wheels and drawbar couplers, on rails and sleepers.`,
    vs: [['one ton tub, 4 ft', 48, 28, 38, 0, { kind: 'tub' }], ['two ton tub, 5.5 ft', 66, 34, 42, 0, { kind: 'tub' }], ['four ton tub, 7.5 ft', 90, 40, 48, 0, { kind: 'tub', dump: true }], ['flat deck car, 8 ft', 96, 38, 40, 0, { kind: 'flat' }], ['personnel bench car, 8 seats', 120, 44, 60, 0, { kind: 'bench', seats: 4 }]], build: oreCar }),
  fam({ cat: CAT, title: 'Generic underground roof prop',
    desc: (v) => v.kind === 'timber' ? 'Round timber post with a head plate, a base plate and two wedges.' : `Base plate, an outer tube with a collar, an inner tube and a head plate${v.kind === 'hydraulic' ? ', with a valve block and gauge' : ', with a clamp block'}.`,
    vs: [['hydraulic, 36 in', 8, 8, 36, 0, { kind: 'hydraulic' }], ['hydraulic, 54 in', 8, 8, 54, 0, { kind: 'hydraulic' }], ['hydraulic, 72 in', 9, 9, 72, 0, { kind: 'hydraulic' }], ['friction prop, 60 in', 8, 8, 60, 0, { kind: 'friction' }], ['timber post, 72 in', 10, 10, 72, 0, { kind: 'timber' }]], build: roofProp }),
  fam({ cat: CAT, title: 'Generic underground steel arch set',
    desc: (v) => `${v.sets} horseshoe steel arches on foot plates joined by spacer tubes along the drift.`,
    vs: [['two sets, 8 ft span', 48, 96, 90, 0, { sets: 2 }], ['three sets, 10 ft span', 96, 120, 108, 0, { sets: 3 }], ['four sets, 14 ft span', 156, 168, 144, 0, { sets: 4 }]], build: archSet }),
  fam({ cat: CAT, title: 'Generic mine ventilation stopping door',
    desc: (v) => `Block bulkhead wall with a steel door frame and ${v.leaves === 2 ? 'two door leaves' : 'a door leaf'} with hinges and pull bars${v.reg ? ', and an adjustable louver regulator over the opening' : ''}.`,
    vs: [['single door, 36 in', 96, 12, 108, 0, { leaves: 1 }], ['double door, 72 in', 132, 12, 108, 0, { leaves: 2 }], ['double door with regulator', 132, 12, 120, 0, { leaves: 2, reg: true }]], build: ventDoor }),
  fam({ cat: CAT, title: 'Generic mine drill steel rack',
    desc: (v) => `${v.up} uprights on cross feet with ${v.tiers} tiers of cradle arms holding lying drill rods with thread collars, and diagonal braces.`,
    vs: [['6 ft rods, two tiers', 78, 36, 48, 0, { up: 2, tiers: 2 }], ['10 ft rods, three tiers', 126, 36, 60, 0, { up: 3, tiers: 3 }], ['16 ft rods, three tiers', 198, 40, 66, 0, { up: 4, tiers: 3 }], ['10 ft rods, four tiers', 126, 40, 78, 0, { up: 3, tiers: 4 }]], build: drillRack }),
  fam({ cat: CAT, title: 'Generic mine rescue basket stretcher',
    desc: (v) => `Tube floor frame with cross ribs, raised side rails with posts, a head board, a foot guard and three straps${v.wheel ? ' and a single wheel under the middle' : ''}${v.bridle ? ' and a four-leg lifting bridle with a ring' : ''}.`,
    vs: [['basket, 78 in', 78, 26, 10, 0, {}], ['basket with wheel, 84 in', 84, 26, 16, 0, { wheel: true }], ['basket with lifting bridle, 84 in', 84, 26, 40, 0, { bridle: true }]], build: stretcherBasket }),
  fam({ cat: CAT, title: 'Generic mine haul road delineator post',
    desc: (v) => `${v.spring ? 'Spring base with coils' : 'Ground plate'}, a round post, ${v.bands.length} reflective sleeve${v.bands.length > 1 ? 's' : ''} and a cap.`,
    vs: [['36 in, one sleeve', 6, 6, 36, 0, { bands: [[0.6, 0.85]] }], ['48 in, two sleeves', 6, 6, 48, 0, { bands: [[0.45, 0.6], [0.72, 0.9]] }], ['60 in, two sleeves', 6, 6, 60, 0, { bands: [[0.5, 0.62], [0.74, 0.92]] }], ['48 in, spring base', 8, 8, 48, 0, { spring: true, bands: [[0.55, 0.75]] }]], build: delineator }),
  fam({ cat: CAT, title: 'Generic mine road sign gantry',
    desc: (v) => `Two columns on base plates with knee braces, a box-frame beam and ${v.signs} framed sign panel${v.signs > 1 ? 's' : ''} hung below it${v.lights ? ' with a light bar over each' : ''}.`,
    vs: [['one sign, 18 ft span', 216, 24, 216, 0, { signs: 1 }], ['two signs, 24 ft span', 288, 24, 228, 0, { signs: 2 }], ['three signs with lights, 32 ft span', 384, 30, 240, 0, { signs: 3, lights: true }]], build: gantry }),
  fam({ cat: CAT, title: 'Generic mine ore pass grizzly',
    desc: (v) => `Heavy frame ring with parallel grizzly bars spaced ${(v.pitch / 25.4).toFixed(0)} in apart and two cross ties under them.`,
    vs: [['4 ft square, 8 in spacing', 48, 48, 14, 0, { pitch: 203 }], ['6 ft square, 10 in spacing', 72, 72, 16, 0, { pitch: 254 }], ['8 ft square, 12 in spacing', 96, 96, 18, 0, { pitch: 305 }]], build: grizzly }),
];

// ================================================================ EXCAVATION =========================================================
function rampX(a, xo, xi, y0, y1, z0, zh) { if (xo > xi) [y0, y1] = [y1, y0]; hexa(a, [[xo, y0, z0], [xi, y0, z0], [xi, y1, z0], [xo, y1, z0]], [[xo, y0, z0 + 15], [xi, y0, z0 + 15], [xi, y1, z0 + zh], [xo, y1, z0 + zh]]); }
function rampYo(a, x0, x1, yo, yi, z0, zh) { if (yo > yi) [x0, x1] = [x1, x0]; hexa(a, [[x0, yo, z0], [x1, yo, z0], [x1, yi, z0], [x0, yi, z0]], [[x0, yo, z0 + 15], [x1, yo, z0 + 15], [x1, yi, z0 + zh], [x0, yi, z0 + zh]]); }

function trenchShield(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const t = 150;
  for (const [ya, yb, dir] of [[YF, YF + t, 1], [YB - t, YB, -1]]) {
    a.box(X0, dir > 0 ? ya + 60 : ya, Z0, X1, dir > 0 ? yb : yb - 60, Z1 - 130);
    for (let i = 0; i <= 6; i++) { const x = X0 + 40 + ((W - 80) * i) / 6; a.box(x - 40, dir > 0 ? ya : yb - 60, Z0 + 20, x + 40, dir > 0 ? ya + 60 : yb, Z1 - 130); }
    for (let k = 0; k < 3; k++) { const z = Z0 + 120 + ((Z1 - Z0 - 400) * k) / 2; a.box(X0, dir > 0 ? ya : yb - 60, z, X1, dir > 0 ? ya + 60 : yb, z + 90); }
    for (const x of [X0 + W * 0.2, X1 - W * 0.2]) { a.box(x - 80, dir > 0 ? ya + 40 : yb - 80, Z1 - 130, x + 80, dir > 0 ? ya + 80 : yb - 40, Z1); a.frame(x - 80, Z1 - 130, x + 80, Z1, dir > 0 ? ya + 40 : yb - 80, dir > 0 ? ya + 80 : yb - 40, 36); }
    a.rect(X0, ya, X1, yb, 'EQUIP-DETAIL');
  }
  const rows = v.rows;
  for (const x of [X0 + W * 0.22, X1 - W * 0.22]) for (let r = 0; r < rows; r++) { const z = Z0 + (Z1 - Z0 - 130) * (rows === 1 ? 0.55 : 0.3 + 0.45 * r); a.ycyl(YF + t, YB - t, x, z, v.hyd ? 55 : 48, 12); a.box(x - 90, YF + t, z - 90, x + 90, YF + t + 20, z + 90); a.box(x - 90, YB - t - 20, z - 90, x + 90, YB - t, z + 90); if (v.hyd) { a.ycyl(cy - D * 0.12, cy + D * 0.12, x, z, 85, 14); } a.line(x, YF + t, x, YB - t, 'EQUIP-DETAIL'); }
  a.log(`Added two ribbed side panels with stiffeners and top lifting lugs, joined by ${rows * 2} ${v.hyd ? 'hydraulic' : 'screw'} spreader struts with end plates (plan and 3D).`);
}

function trenchLadder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const yb = YF + 50, yt = YB - 50, lerp = (z) => yb + (yt - yb) * ((z - Z0) / (Z1 - Z0));
  for (const x of [X0 + 40, X1 - 40]) { a.tube([[x, yb, Z0 + 10], [x, yt, Z1]], [22, 22], 6); a.box(x - 30, yb - 40, Z0, x + 30, yb + 40, Z0 + 14); a.line(x, yb, x, yt, 'EQUIP-DETAIL'); }
  const n = Math.floor((Z1 - Z0 - 300) / 305); for (let i = 0; i <= n; i++) { const z = Z0 + 200 + i * 305; if (z > Z1 - 60) break; const y = lerp(z); a.xcyl(X0 + 40, X1 - 40, y, z, 16, 8); }
  for (const x of [X0 + 40, X1 - 40]) { a.tube([[x, yt, Z1 - 300], [x, yt + 40, Z1 - 300]], [14, 14], 6); a.box(x - 22, yt - 10, Z1 - 120, x + 22, yt + 30, Z1 - 100); }
  a.rect(X0 + 40, yb, X1 - 40, yt, 'EQUIP-DETAIL');
  a.log(`Added two leaning side rails with foot plates, ${n + 1} round rungs about 12 in apart and top stiffeners (plan and 3D).`);
}

function edgeRail(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const n = v.bays, sp = (W - 300) / n;
  for (let i = 0; i <= n; i++) {
    const x = X0 + 150 + i * sp;
    if (v.spike) { a.cone(x, cy, Z0, Z0 + 250, 8, 28, 8); a.box(x - 60, cy - 40, Z0 + 250, x + 60, cy + 40, Z0 + 270); } else { a.box(x - 150, cy - 150, Z0, x + 150, cy + 150, Z0 + 90); a.rect(x - 150, cy - 150, x + 150, cy + 150, 'EQUIP'); a.box(x - 80, cy - 80, Z0 + 90, x + 80, cy + 80, Z0 + 130); }
    a.box(x - 25, cy - 25, Z0 + (v.spike ? 270 : 130), x + 25, cy + 25, Z1 - 20);
  }
  a.tube([[X0 + 150, cy, Z1 - 30], [X1 - 150, cy, Z1 - 30]], [22, 22], 8); a.tube([[X0 + 150, cy, Z0 + (Z1 - Z0) * 0.5], [X1 - 150, cy, Z0 + (Z1 - Z0) * 0.5]], [18, 18], 8); a.box(X0 + 150, cy - 14, Z0 + (v.spike ? 270 : 130), X1 - 150, cy + 14, Z0 + (v.spike ? 270 : 130) + 150);
  a.line(X0 + 150, cy, X1 - 150, cy);
  a.log(`Added ${n + 1} posts on ${v.spike ? 'ground spikes' : 'weighted base blocks'}, a top rail, a mid rail and a toe board across ${n} bay${n > 1 ? 's' : ''} (plan and 3D).`);
}

function trenchBridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const dz = Z0 + 170, ex = 260;
  for (const y of [cy - D * 0.32, cy + D * 0.32]) a.box(X0 + ex, y - 55, Z0, X1 - ex, y + 55, Z0 + 150);
  a.box(X0 + ex, YF + 50, Z0 + 150, X1 - ex, YB - 50, dz); rampX(a, X0, X0 + ex, YF + 50, YB - 50, Z0, 170); rampX(a, X1, X1 - ex, YF + 50, YB - 50, Z0, 170);
  for (let x = X0 + ex + 80; x < X1 - ex; x += 160) a.line(x, YF + 50, x, YB - 50, 'EQUIP-DETAIL');
  for (const y of [YF + 50, YB - 50]) { const s = y < cy ? 1 : -1; a.box(X0 + ex, y - (s > 0 ? 0 : 20), dz, X1 - ex, y + (s > 0 ? 20 : 0), dz + 120); const n = Math.max(2, Math.round((W - 2 * ex) / 1000) + 1); for (let i = 0; i < n; i++) { const x = X0 + ex + 40 + ((W - 2 * ex - 80) * i) / (n - 1); a.cyl(x, y + s * 18, dz, Z1 - 20, 20, 8); } a.tube([[X0 + ex, y + s * 18, Z1 - 30], [X1 - ex, y + s * 18, Z1 - 30]], [20, 20], 8); a.tube([[X0 + ex, y + s * 18, dz + (Z1 - dz) * 0.5], [X1 - ex, y + s * 18, dz + (Z1 - dz) * 0.5]], [16, 16], 8); }
  a.rect(X0 + ex, YF + 50, X1 - ex, YB - 50, 'EQUIP-DETAIL');
  a.log('Added two deck beams, a plank deck with sloped ends, side kick plates and handrails with a mid rail on posts (plan and 3D).');
}

function roadPlate(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const H = Z1 - Z0, rp = Math.max(H * 6, 140);
  a.box(X0 + rp, YF + rp, Z0, X1 - rp, YB - rp, Z0 + H * 0.7);
  rampX(a, X0, X0 + rp, YF + rp, YB - rp, Z0, H * 0.7); rampX(a, X1, X1 - rp, YF + rp, YB - rp, Z0, H * 0.7); rampYo(a, X0 + rp, X1 - rp, YF, YF + rp, Z0, H * 0.7); rampYo(a, X0 + rp, X1 - rp, YB, YB - rp, Z0, H * 0.7);
  const nx = Math.round(W / 120), ny = Math.round(D / 120);
  for (let i = 1; i < nx; i++) { const x = X0 + (W * i) / nx; a.box(x - 10, YF + rp, Z0 + H * 0.7, x + 10, YB - rp, Z1); a.line(x, YF + rp, x, YB - rp, 'EQUIP-DETAIL'); }
  for (const [x, y] of [[X0 + rp + 120, YF + rp + 120], [X1 - rp - 120, YF + rp + 120], [X0 + rp + 120, YB - rp - 120], [X1 - rp - 120, YB - rp - 120]]) { a.cyl(x, y, Z0 + H * 0.7, Z1, 36, 12); a.circ(x, y, 36, 'EQUIP-DETAIL'); }
  a.rect(X0 + rp, YF + rp, X1 - rp, YB - rp, 'EQUIP-DETAIL');
  a.log('Added a steel plate with sloped edges all round, raised tread bars and four lifting bosses at the corners (plan and 3D).');
}

function accessMat(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const H = Z1 - Z0;
  if (v.kind === 'timber') {
    const t = H / 3, bw = 280, nb = Math.max(2, Math.floor(D / bw)), bwy = D / nb, nm = Math.max(2, Math.floor(W / 300)), bwx = W / nm;
    for (const l of [0, 2]) for (let i = 0; i < nb; i++) a.box(X0, YF + i * bwy + 3, Z0 + l * t, X1, YF + (i + 1) * bwy - 3, Z0 + (l + 1) * t);
    for (let i = 0; i < nm; i++) a.box(X0 + i * bwx + 3, YF, Z0 + t, X0 + (i + 1) * bwx - 3, YB, Z0 + 2 * t);
    for (let i = 0; i < nb; i++) a.line(X0, YF + i * bwy, X1, YF + i * bwy, 'EQUIP-DETAIL');
    for (const f of [0.1, 0.5, 0.9]) for (const g of [0.2, 0.8]) a.cyl(X0 + W * f, YF + D * g, Z1 - 4, Z1 + 0.01, 18, 8);
    for (const x of [X0 + W * 0.25, X1 - W * 0.25]) { a.frame(x - 80, Z0 + t, x + 80, Z1 - 4, YF - 4, YF, 14); }
  } else {
    a.box(X0 + 30, YF, Z0, X1 - 30, YB, Z1 - 20); for (let i = 1; i < Math.round(W / 100); i++) { const x = X0 + 30 + ((W - 60) * i) / Math.round(W / 100); a.box(x - 12, YF + 10, Z1 - 20, x + 12, YB - 10, Z1); a.line(x, YF, x, YB, 'EQUIP-DETAIL'); }
    for (let k = 0; k < 4; k++) { const y = YF + (D * (k + 0.5)) / 4; a.box(X0, y - 60, Z0 + 10, X0 + 30, y + 60, Z0 + H * 0.6); a.box(X1 - 30, y - 40, Z0 + 10, X1, y + 40, Z0 + H * 0.6); }
  }
  a.log(v.kind === 'timber' ? 'Added three crossed layers of timber boards fastened with bolts, with four lift loops on one edge (plan and 3D).' : 'Added a single molded slab with raised tread bars and interlocking tabs on its short ends (plan and 3D).');
}

function gradeStake(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const pt = (x, y, z0, z1, w, d) => { a.box(x - w / 2, y - d / 2, z0 + 40, x + w / 2, y + d / 2, z1); a.cone(x, y, z0, z0 + 40, 2, Math.max(w, d) * 0.55, 6); a.rect(x - w / 2, y - d / 2, x + w / 2, y + d / 2); };
  if (v.kind === 'bundle') { for (let i = 0; i < 5; i++) pt(cx + (i - 2) * 22, cy + (i % 2 ? 24 : -24), Z0, Z1 - 20 + i * 4 - 8, 20, 6); a.box(cx - 70, cy - 50, Z0 + (Z1 - Z0) * 0.5, cx + 70, cy + 50, Z0 + (Z1 - Z0) * 0.5 + 24); }
  else if (v.kind === 'hub') { pt(cx, cy, Z0, Z0 + (Z1 - Z0) * 0.4, 50, 50); a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.4, Z0 + (Z1 - Z0) * 0.4 + 12, 38, 12); a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.4 + 12, Z0 + (Z1 - Z0) * 0.4 + 24, 4, 6); pt(cx + 90, cy + 40, Z0, Z1, 36, 10); a.box(cx + 90 - 20, cy + 40 - 6, Z1 - 160, cx + 90 + 20, cy + 40 + 6, Z1 - 60); }
  else { pt(cx, cy, Z0, Z1, v.kind === 'lath' ? 38 : 50, v.kind === 'lath' ? 8 : 25); a.box(cx + 10, cy - 3, Z1 - 200, cx + 140, cy + 3, Z1 - 40); a.box(cx + 10, cy - 3, Z1 - 40, cx + 140, cy + 3, Z1 - 30); }
  a.log(`Added ${v.kind === 'bundle' ? 'a bundle of five pointed laths tied with a band' : v.kind === 'hub' ? 'a square hub with a tack head and a flagged guard lath beside it' : 'a pointed ' + (v.kind === 'lath' ? 'lath' : 'stake') + ' with a ribbon flag at the top'} (plan and 3D).`);
}

function surveyTripod(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const R = Math.min(W, D) / 2 - 60, ih = v.laser ? 260 : 320, hz = Z1 - ih - 60;
  for (let i = 0; i < 3; i++) { const t = (i * 2 * Math.PI) / 3 + Math.PI / 2, ex = cx + R * Math.cos(t), ey = cy + R * Math.sin(t); a.tube([[cx + 40 * Math.cos(t), cy + 40 * Math.sin(t), hz], [ex, ey, Z0 + 50]], [22, 16], 6); a.cone(ex, ey, Z0, Z0 + 50, 3, 16, 6); a.box(ex - 20, ey - 20, Z0 + 50, ex + 20, ey + 20, Z0 + 60); a.line(cx, cy, ex, ey, 'EQUIP-DETAIL'); a.circ(ex, ey, 16, 'EQUIP-HIDDEN'); }
  a.cyl(cx, cy, hz - 20, hz + 20, 80, 16); a.circ(cx, cy, 80);
  a.cyl(cx, cy, hz + 20, hz + 50, 60, 12);
  if (v.laser) { a.cyl(cx, cy, hz + 50, Z1 - 60, 70, 14); a.cyl(cx, cy, Z1 - 60, Z1, 40, 12); a.box(cx - 40, cy - 110, hz + 90, cx + 40, cy - 70, hz + 150); }
  else { a.box(cx - 90, cy - 70, hz + 50, cx + 90, cy + 70, Z1 - 60); a.xcyl(cx - 160, cx + 160, cy - 90, hz + 50 + ih * 0.55, 32, 12); a.cyl(cx, cy, Z1 - 60, Z1, 30, 10); for (const s of [-1, 1]) a.ycyl(cy - 80, cy - 70, cx + s * 120, hz + 100, 24, 8); }
  if (v.pole) { const px = X1 - 90; a.tube([[px, cy + 100, Z0 + 20], [px, cy + 100, Z1 - 60]], [14, 12], 6); a.box(px - 70, cy + 100 - 12, Z1 - 120, px + 70, cy + 100 + 12, Z1 - 60); a.box(px - 40, cy + 100 - 6, Z1 - 60, px + 40, cy + 100 + 6, Z1 - 20); a.circ(px, cy + 100, 14); }
  a.log(`Added three splayed legs with spiked feet, a head plate, ${v.laser ? 'a rotating laser head with a receiver bracket' : 'an instrument body with a telescope and level knobs'}${v.pole ? ' and a leaning prism pole with a target' : ''} (plan and 3D).`);
}

function warnLamp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const lampAt = (x, z, r = 70) => { a.box(x - r - 10, cy - r - 10, z - 30, x + r + 10, cy + r + 10, z); a.cyl(x, cy, z, z + 110, r, 16); a.cone(x, cy, z + 110, z + 140, r, r * 0.6, 16); a.ycyl(cy - r - 12, cy - r, x, z + 60, r * 0.5, 14); };
  if (v.kind === 'tripod') { const R = Math.min(W, D) / 2 - 30; for (let i = 0; i < 3; i++) { const t = (i * 2 * Math.PI) / 3 + Math.PI / 2, ex = cx + R * Math.cos(t), ey = cy + R * Math.sin(t); a.tube([[cx, cy, Z0 + (Z1 - Z0) * 0.55], [ex, ey, Z0 + 10]], [14, 12], 6); a.box(ex - 30, ey - 30, Z0, ex + 30, ey + 30, Z0 + 12); a.line(cx, cy, ex, ey, 'EQUIP-DETAIL'); } a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.4, Z1 - 160, 20, 10); lampAt(cx, Z1 - 160); }
  else { a.box(X0, YF, Z0, X1, YB, Z0 + 110); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.cyl(cx, cy, Z0 + 110, Z1 - 160, 24, 10); lampAt(cx, Z1 - 160);
    if (v.two) { a.box(cx - 160, cy - 20, Z0 + (Z1 - Z0) * 0.55, cx + 160, cy + 20, Z0 + (Z1 - Z0) * 0.55 + 30); lampAt(cx + 160, Z0 + (Z1 - Z0) * 0.55 + 30, 55); }
    if (v.solar) { a.box(cx - 170, cy - 14, Z1 - 160 - 330, cx + 170, cy + 14, Z1 - 160 - 20); a.frame(cx - 170, Z1 - 160 - 330, cx + 170, Z1 - 160 - 20, cy - 24, cy - 14, 16); } }
  a.log(`Added ${v.kind === 'tripod' ? 'three splayed legs with foot pads' : 'a ballast block base'}, a pole and a lamp head with a lens, hood and battery box${v.two ? ', and a second lamp on a crossbar' : ''}${v.solar ? ', and a solar panel in a frame under the lamp' : ''} (plan and 3D).`);
}

function utilityMarker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const r = W * 0.5 - 8; a.cone(cx, cy, Z0, Z0 + 60, 3, r * 0.5, 8); a.cyl(cx, cy, Z0 + 60, Z1 - 30, r * 0.5, 12); a.ell(cx, cy, Z1 - 30, r * 0.5, r * 0.5, 30, 12, 6);
  a.cyl(cx, cy, Z0 + (Z1 - Z0) * 0.55, Z0 + (Z1 - Z0) * 0.68, r * 0.6, 12); a.box(cx - r * 0.7, cy - r * 0.5 - 8, Z0 + (Z1 - Z0) * 0.3, cx + r * 0.7, cy - r * 0.5, Z0 + (Z1 - Z0) * 0.45); a.box(cx - r * 0.7, cy - r * 0.5 - 4, Z1 - 150, cx + r * 0.7, cy - r * 0.5, Z1 - 90);
  a.circ(cx, cy, r * 0.5); a.circ(cx, cy, r * 0.6, 'EQUIP-DETAIL');
  a.log('Added a pointed ground anchor, a round flexible post with a domed cap, a warning band and two ID plates (plan and 3D).');
}

function sheetPile(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const n = v.n, pw = W / n, f = pw * 0.2, w = pw * 0.3, t = 40, yl = YF + 20, yh = YB - 20 - t;
  for (let i = 0; i < n; i++) { const x = X0 + i * pw; const seg = [[x, yl, x + f, yl], [x + f, yl, x + f + w, yh], [x + f + w, yh, x + 2 * f + w, yh], [x + 2 * f + w, yh, x + 2 * f + 2 * w, yl]];
    for (const [xa, ya, xb, yb] of seg) { a.prism([[xa, ya], [xb, yb], [xb, yb + t], [xa, ya + t]], Z0, Z1 - 150); a.poly([[xa, ya], [xb, yb], [xb, yb + t], [xa, ya + t]]); }
    a.cyl(x + f + w + f / 2, yh + t / 2, Z1 - 150, Z1 - 100, 30, 8); }
  a.box(X0, YF, Z1 - 150, X1, YF + 20, Z1 - 100); a.box(X0, YF, Z0 + (Z1 - Z0) * 0.5, X1, YF + 20, Z0 + (Z1 - Z0) * 0.5 + 80);
  a.log(`Added ${n} interlocking corrugated piles standing in a row with a top cap beam, a lifting boss on each and a waler beam across the face (plan and 3D).`);
}

function shoringStrut(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ro = D * 0.2, ri = ro * 0.78; a.box(X0, cy - D * 0.4, Z0, X0 + 25, cy + D * 0.4, Z1); a.box(X1 - 25, cy - D * 0.4, Z0, X1, cy + D * 0.4, Z1);
  const zc = Z0 + (Z1 - Z0) * 0.5; a.xcyl(X0 + 25, cx + W * 0.1, cy, zc, ro, 14); a.xcyl(cx + W * 0.1 - 20, X1 - 25, cy, zc, ri, 14); a.xcyl(cx + W * 0.1 - 40, cx + W * 0.1 + 40, cy, zc, ro + 10, 14);
  if (v.hyd) { a.box(cx - 150, cy - 120, zc + ro, cx + 150, cy + 120, zc + ro + 120); a.ycyl(cy - 140, cy - 120, cx, zc + ro + 60, 40, 14); a.box(X0 + W * 0.2, cy - 40, zc + ro, X0 + W * 0.2 + 70, cy + 40, zc + ro + 80); }
  else { a.xcyl(cx - 160, cx + 160, cy, zc, ro + 10, 10); a.ycyl(cy - 140, cy + 140, cx + 60, zc, 14, 8); a.cyl(cx + 60, cy - 140, zc - 20, zc + 20, 22, 8); a.cyl(cx + 60, cy + 140, zc - 20, zc + 20, 22, 8); }
  a.line(X0, cy, X1, cy); a.rect(X0, cy - D * 0.4, X0 + 25, cy + D * 0.4, 'EQUIP-DETAIL'); a.rect(X1 - 25, cy - D * 0.4, X1, cy + D * 0.4, 'EQUIP-DETAIL');
  a.log(`Added two end plates with swivel pads and a telescoping tube pair with a collar${v.hyd ? ', a hydraulic pump block with a gauge' : ', a screw collar and a cross handle'} (plan and 3D).`);
}

const EXC = [
  fam({ cat: CAT, title: 'Generic excavation trench shield',
    desc: (v) => `Two ribbed side panels with stiffeners and top lifting lugs joined by ${v.rows * 2} ${v.hyd ? 'hydraulic' : 'screw'} spreader struts with end plates.`,
    vs: [['8 ft long, 4 ft spread, 4 ft high', 96, 60, 48, 0, { rows: 1 }], ['8 ft long, 4 ft spread, 6 ft high', 96, 60, 72, 0, { rows: 2 }], ['10 ft long, 6 ft spread, 6 ft high', 120, 84, 72, 0, { rows: 2 }], ['12 ft long, 6 ft spread, 8 ft high', 144, 84, 96, 0, { rows: 2, hyd: true }], ['12 ft long, 8 ft spread, 8 ft high', 144, 108, 96, 0, { rows: 2, hyd: true }], ['16 ft long, 6 ft spread, 8 ft high', 192, 84, 96, 0, { rows: 2, hyd: true }], ['16 ft long, 8 ft spread, 10 ft high', 192, 108, 120, 0, { rows: 2, hyd: true }]], build: trenchShield }),
  fam({ cat: CAT, title: 'Generic excavation access ladder',
    desc: 'Two leaning side rails with foot plates, round rungs about 12 in apart and top stiffeners for leaving a trench.',
    vs: [['6 ft', 20, 18, 72, 0, {}], ['8 ft', 20, 24, 96, 0, {}], ['10 ft', 20, 30, 120, 0, {}], ['12 ft', 20, 36, 144, 0, {}]], build: trenchLadder }),
  fam({ cat: CAT, title: 'Generic excavation edge guardrail',
    desc: (v) => `${v.bays + 1} posts on ${v.spike ? 'ground spikes' : 'weighted base blocks'} with a top rail, a mid rail and a toe board across ${v.bays} bay${v.bays > 1 ? 's' : ''}.`,
    vs: [['one bay, 8 ft', 108, 14, 42, 0, { bays: 1 }], ['two bays, 8 ft each', 204, 14, 42, 0, { bays: 2 }], ['three bays, 8 ft each', 300, 14, 42, 0, { bays: 3 }], ['two bays, 10 ft, 48 in high', 252, 14, 48, 0, { bays: 2 }], ['two bays on ground spikes', 204, 12, 48, 0, { bays: 2, spike: true }]], build: edgeRail }),
  fam({ cat: CAT, title: 'Generic excavation walkway bridge',
    desc: 'Two deck beams under a plank deck with sloped ends, side kick plates and handrails with a mid rail on posts.',
    vs: [['6 ft span', 96, 38, 46, 0, {}], ['8 ft span', 120, 38, 46, 0, {}], ['10 ft span', 144, 38, 46, 0, {}], ['12 ft span', 168, 38, 46, 0, {}]], build: trenchBridge }),
  fam({ cat: CAT, title: 'Generic excavation road plate',
    desc: 'Steel plate with sloped edges all round, raised tread bars and four lifting bosses at the corners.',
    vs: [['4 ft by 8 ft, 1 in', 96, 48, 1.2, 0, {}], ['5 ft by 10 ft, 1.25 in', 120, 60, 1.5, 0, {}], ['6 ft by 12 ft, 1.5 in', 144, 72, 1.8, 0, {}], ['8 ft by 10 ft, 2 in', 120, 96, 2.3, 0, {}]], build: roadPlate }),
  fam({ cat: CAT, title: 'Generic excavation access mat',
    desc: (v) => v.kind === 'timber' ? 'Three crossed layers of timber boards fastened with bolts, with lift loops on one edge.' : 'Single molded slab with raised tread bars and interlocking tabs on its short ends.',
    vs: [['timber, 4 ft by 12 ft', 144, 48, 8, 0, { kind: 'timber' }], ['timber, 4 ft by 16 ft', 192, 48, 8, 0, { kind: 'timber' }], ['timber, 8 ft by 14 ft', 168, 96, 10, 0, { kind: 'timber' }], ['composite, 4 ft by 8 ft', 96, 48, 4, 0, { kind: 'composite' }]], build: accessMat }),
  fam({ cat: CAT, title: 'Generic excavation grade stake',
    desc: (v) => v.kind === 'bundle' ? 'Bundle of five pointed laths tied with a band.' : v.kind === 'hub' ? 'Square hub with a tack head and a flagged guard lath beside it.' : `Pointed ${v.kind} with a ribbon flag at the top.`,
    vs: [['lath, 36 in', 6, 4, 36, 0, { kind: 'lath' }], ['stake, 24 in', 6, 4, 24, 0, { kind: 'stake' }], ['hub with guard lath, 18 in', 6, 4, 18, 0, { kind: 'hub' }], ['bundle of five laths, 36 in', 6, 4, 36, 0, { kind: 'bundle' }]], build: gradeStake }),
  fam({ cat: CAT, title: 'Generic excavation survey tripod',
    desc: (v) => `Three splayed legs with spiked feet and a head plate carrying ${v.laser ? 'a rotating laser head with a receiver bracket' : 'an instrument body with a telescope and level knobs'}${v.pole ? ', with a leaning prism pole' : ''}.`,
    vs: [['instrument, 48 in', 36, 36, 48, 0, {}], ['instrument, 60 in', 40, 40, 60, 0, {}], ['instrument with prism pole, 66 in', 56, 48, 66, 0, { pole: true }], ['laser level, 54 in', 36, 36, 54, 0, { laser: true }]], build: surveyTripod }),
  fam({ cat: CAT, title: 'Generic excavation warning lamp stand',
    desc: (v) => `${v.kind === 'tripod' ? 'Three splayed legs' : 'Ballast block base'}, a pole and a lamp head with a lens, hood and battery box${v.two ? ' plus a second lamp on a crossbar' : ''}${v.solar ? ' and a solar panel in a frame' : ''}.`,
    vs: [['ballast base, 48 in', 16, 16, 48, 0, { kind: 'ballast' }], ['ballast base with two lamps, 72 in', 24, 16, 72, 0, { kind: 'ballast', two: true }], ['tripod stand, 60 in', 28, 28, 60, 0, { kind: 'tripod' }], ['solar flasher, 72 in', 24, 16, 72, 0, { kind: 'ballast', solar: true }]], build: warnLamp }),
  fam({ cat: CAT, title: 'Generic excavation utility marker post',
    desc: 'Pointed ground anchor, round flexible post with a domed cap, a warning band and two ID plates.',
    vs: [['36 in', 4, 4, 36, 0, {}], ['48 in', 4, 4, 48, 0, {}], ['60 in', 5, 5, 60, 0, {}]], build: utilityMarker }),
  fam({ cat: CAT, title: 'Generic excavation sheet pile wall panel',
    desc: (v) => `${v.n} interlocking corrugated piles standing in a row with a top cap beam, a lifting boss on each and a waler beam across the face.`,
    vs: [['three piles, 10 ft', 72, 12, 120, 0, { n: 3 }], ['five piles, 16 ft', 120, 12, 192, 0, { n: 5 }], ['eight piles, 20 ft', 192, 14, 240, 0, { n: 8 }]], build: sheetPile }),
  fam({ cat: CAT, title: 'Generic excavation shoring strut',
    desc: (v) => `Two end plates with swivel pads and a telescoping tube pair with a collar${v.hyd ? ', a hydraulic pump block with a gauge' : ', a screw collar and a cross handle'}.`,
    vs: [['screw jack, 2 to 3 ft', 36, 12, 10, 0, {}], ['screw jack, 4 to 6 ft', 72, 12, 10, 0, {}], ['hydraulic, 3 to 5 ft', 60, 14, 14, 0, { hyd: true }], ['hydraulic, 5 to 8 ft', 96, 14, 14, 0, { hyd: true }]], build: shoringStrut }),
];

// ================================================================ AVIATION ===========================================================
function chock(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const H = Z1 - Z0, cw = v.pair ? 300 : W;
  const one = (x0, x1) => {
    rampY(a, x0, x1, YF, YB, Z0, H); a.box(x0, YB - 40, Z0, x1, YB, Z1);
    for (let k = 0; k < 6; k++) { const y = YF + (D * (k + 0.6)) / 7, z = Z0 + 20 + (H - 20) * ((y - YF) / D); a.box(x0 + 20, y - 10, z, x1 - 20, y + 10, z + 8); }
    for (const x of [x0, x1 - 30]) a.box(x, YF, Z0, x + 30, YB, Z0 + 14); a.rect(x0, YF, x1, YB, 'EQUIP'); a.line(x0, YF + D * 0.5, x1, YF + D * 0.5, 'EQUIP-DETAIL');
    const mx = (x0 + x1) / 2; a.tube([[mx - 50, YB - 20, Z1 - 20], [mx - 50, YB - 20, Z1 - 4], [mx + 50, YB - 20, Z1 - 4], [mx + 50, YB - 20, Z1 - 20]], [9, 9, 9, 9], 6);
    return mx;
  };
  const m1 = one(X0, X0 + cw);
  if (v.pair) { const m2 = one(X1 - cw, X1); a.tube([[m1 + 50, YB - 20, Z1 - 20], [cx, YB - 20, Z0 + 30], [m2 - 50, YB - 20, Z1 - 20]], [8, 8, 8], 6); a.line(X0 + cw, YB - 20, X1 - cw, YB - 20, 'EQUIP-DETAIL'); }
  a.log(`Added ${v.pair ? 'two' : 'a'} wedge${v.pair ? 's' : ''} with ribbed sloped face${v.pair ? 's' : ''}, a back stop, side skirts and a rope handle${v.pair ? ', joined by a rope between them' : ''} (plan and 3D).`);
}

function towBar(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline('EQUIP-HIDDEN');
  const z = Z0 + (Z1 - Z0) * 0.5, r = Math.max(24, D * 0.06), wr = Math.min(110, (Z1 - Z0) * 0.4);
  for (const s of [-1, 1]) { a.tube([[X1 - 150, cy, z], [X0 + 90, cy + s * D * 0.4, z]], [r, r], 8); a.line(X1 - 150, cy, X0 + 90, cy + s * D * 0.4); }
  const bx = X0 + (X1 - X0) * 0.32, by = D * 0.4 * (1 - (bx - X0 - 90) / (X1 - 150 - X0 - 90)); a.tube([[bx, cy - by, z], [bx, cy + by, z]], [r * 0.8, r * 0.8], 8);
  a.box(X0, cy - D * 0.46, z - 45, X0 + 90, cy + D * 0.46, z + 45); a.cyl(X0 + 45, cy - D * 0.38, z - 70, z + 70, 20, 8); a.cyl(X0 + 45, cy + D * 0.38, z - 70, z + 70, 20, 8);
  a.cyl(X1 - 60, cy, z - 50, z + 50, 60, 16); a.circ(X1 - 60, cy, 60, 'EQUIP-DETAIL'); a.cyl(X1 - 60, cy, z - 50, z - 40, 85, 16);
  const hx = X1 - 330; a.ycyl(cy - D * 0.3, cy + D * 0.3, hx, z + (Z1 - z) * 0.6, 20, 8); for (const s of [-1, 1]) a.cyl(hx, cy + s * D * 0.3, z, z + (Z1 - z) * 0.6, 14, 8);
  const sx = bx + 120; for (const s of [-1, 1]) { a.ycyl(cy + s * (by + 30) - 15, cy + s * (by + 30) + 15, sx, Z0 + wr, wr, 16); }
  a.ycyl(cy - by - 30, cy + by + 30, sx, Z0 + wr, 10, 8); a.tube([[sx, cy, Z0 + wr], [sx, cy, z]], [12, 12], 6);
  a.log('Added an A-frame of two tubes with a cross tube, a fork head with two lock pins, a tow eye with a washer, a T handle and a pair of support wheels (plan and 3D).');
}

function windCone(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const R = (D - 160) / 2, px = X0 + Math.max(150, R * 0.5), zc = Z1 - R - 30, pr = Math.max(30, R * 0.12);
  a.box(px - 220, cy - Math.min(220, D / 2 - 10), Z0, px + 220, cy + Math.min(220, D / 2 - 10), Z0 + 30); a.rect(px - 220, cy - Math.min(220, D / 2 - 10), px + 220, cy + Math.min(220, D / 2 - 10), 'EQUIP-DETAIL'); a.circ(px, cy, pr, 'EQUIP');
  a.cyl(px, cy, Z0 + 30, zc - R + 30, pr, 12); a.cone(px, cy, Z0 + 30, Z0 + 330, pr * 1.6, pr, 12); a.cyl(px, cy, zc - R + 30, zc - R + 70, pr * 1.3, 12);
  const xr = px + 70, ring = []; for (let i = 0; i <= 24; i++) { const t = (i / 24) * 2 * Math.PI; ring.push([xr, cy + R * Math.cos(t), zc + R * Math.sin(t)]); } a.tube(ring, ring.map(() => 10), 6);
  a.tube([[px, cy, zc - R + 70], [xr, cy, zc - R]], [10, 10], 6);
  const n = 6, L = X1 - xr - 30; for (let i = 0; i < n; i++) { const xa = xr + (L * i) / n, xb = xr + (L * (i + 1)) / n, ra = R * (0.98 - 0.62 * (i / n)), rb = R * (0.98 - 0.62 * ((i + 1) / n)); a.tube([[xa, cy, zc], [xb, cy, zc]], [ra * (i % 2 ? 1.03 : 1), rb * (i % 2 ? 1.03 : 1)], 16); }
  a.line(xr, cy, X1 - 30, cy, 'EQUIP-DETAIL');
  if (v.lights) for (let i = 0; i < 8; i++) { const t = (i / 8) * 2 * Math.PI; a.xcyl(xr - 50, xr, cy + R * Math.cos(t), zc + R * Math.sin(t), 14, 8); }
  a.log(`Added a base plate, a tapered pole with a swivel head, a ring and ${n} fabric cone sections narrowing downwind${v.lights ? ' and eight lamps around the ring' : ''} (plan and 3D).`);
}

function toolCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const base = Z0 + 120, chest = v.chest ? 300 : 0, top = Z1 - chest - 40, n = v.n;
  casters(a, [[X0 + 60, YF + 60], [X1 - 60, YF + 60], [X0 + 60, YB - 60], [X1 - 60, YB - 60]], 100);
  a.box(X0 + 10, YF + 10, base - 20, X1 - 10, YB - 10, top); a.box(X0, YF, top, X1, YB, top + 40);
  const hh = (top - base - 20) / n;
  for (let i = 0; i < n; i++) { const z0 = base + i * hh + 4, z1 = base + (i + 1) * hh - 4; a.box(X0 + 20, YF, z0, X1 - 20, YF + 12, z1); a.box(X0 + 60, YF - 20, z1 - 55, X1 - 60, YF, z1 - 35); }
  a.box(X1 - 90, YF - 16, top - 110, X1 - 40, YF, top - 60);
  if (v.chest) { const cz = top + 40; a.box(X0 + 20, YF + 20, cz, X1 - 20, YB - 40, Z1 - 30); a.box(X0 + 10, YF + 10, Z1 - 30, X1 - 10, YB - 30, Z1); a.box(cx - 120, YF + 8, cz + 120, cx + 120, YF + 22, cz + 160); }
  a.tube([[X0 - 0, YF + 120, top - 60], [X0, YF + 120, top + 120 + chest * 0.3], [X0, YB - 120, top + 120 + chest * 0.3], [X0, YB - 120, top - 60]], [14, 14, 14, 14], 6);
  a.rect(X0 + 20, YF, X1 - 20, YF + 12, 'EQUIP-DETAIL');
  a.log(`Added a drawer cabinet of ${n} full-width drawers with bar pulls and a lock${v.chest ? ', a hinged top chest' : ''}, a side push handle and four swivel wheels (plan and 3D).`);
}

function extCart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const wr = (Z1 - Z0) * 0.2, n = v.n, cr = Math.min(D * 0.32, (W - 160) / n / 2 - 10), zb = Z0 + wr * 1.2, wy = YB - wr - 30;
  for (const x of [X0 + 40, X1 - 40]) { a.xcyl(x - 25, x + 25, wy, Z0 + wr, wr, 20); a.xcyl(x - 10, x + 10, wy, Z0 + wr, wr * 0.4, 12); a.rect(x - 25, wy - wr, x + 25, wy + wr, 'EQUIP-DETAIL'); }
  a.xcyl(X0 + 40, X1 - 40, wy, Z0 + wr, 12, 8); a.box(X0 + 70, YF + 40, zb - 40, X1 - 70, YB - 40, zb);
  for (const x of [X0 + 100, X1 - 100]) a.cyl(x, YF + 60, Z0, zb - 40, 16, 8);
  const cy0 = cy - D * 0.04;
  for (let i = 0; i < n; i++) { const x = X0 + 80 + ((W - 160) * (i + 0.5)) / n, ch = (Z1 - zb) * 0.72; a.cyl(x, cy0, zb, zb + ch, cr, 18); a.ell(x, cy0, zb + ch, cr, cr, cr * 0.5, 16, 6); a.cyl(x, cy0, zb + ch + cr * 0.4, zb + ch + cr * 0.4 + 70, 40, 10); a.box(x - 60, cy0 - 40, zb + ch + cr * 0.4 + 70, x + 60, cy0 + 40, zb + ch + cr * 0.4 + 100); a.ycyl(cy0 - 80, cy0 - 40, x + 30, zb + ch + cr * 0.4 + 40, 28, 10); a.circ(x, cy0, cr);
    if (v.hose) for (let k = 0; k < 3; k++) a.cyl(x, cy0, zb + ch * 0.35 + k * 40, zb + ch * 0.35 + k * 40 + 26, cr + 18, 18); }
  a.tube([[X0 + 120, YB - 40, zb + 60], [X0 + 120, YB - 40, Z1 - 20], [X1 - 120, YB - 40, Z1 - 20], [X1 - 120, YB - 40, zb + 60]], [14, 14, 14, 14], 6);
  a.log(`Added a chassis with two large rear wheels and two front stand legs, ${n} upright agent cylinder${n > 1 ? 's' : ''} with domed shoulders, valve heads and gauges${v.hose ? ', hose coils around the bodies' : ''} and a U handle (plan and 3D).`);
}

function airsideSign(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ph = v.ph * 25.4, n = v.n, pw = (W - 160) / n, pz0 = Z1 - ph - 40, y = cy;
  for (const x of [X0 + 60, X1 - 60]) { a.box(x - 100, YF, Z0, x + 100, YB, Z0 + 20); a.cyl(x, cy, Z0 + 20, pz0 + 60, 18, 8); a.cyl(x, cy, Z0 + (pz0 - Z0) * 0.45, Z0 + (pz0 - Z0) * 0.45 + 60, 28, 10); a.circ(x, cy, 18, 'EQUIP-DETAIL'); }
  for (let i = 0; i < n; i++) { const x0 = X0 + 80 + i * pw + 6, x1 = X0 + 80 + (i + 1) * pw - 6; a.box(x0, y - 10, pz0, x1, y + 30, Z1 - 40); a.frame(x0, pz0, x1, Z1 - 40, y - 24, y - 10, 24); a.box(x0 + 24, y - 28, pz0 + 24, x1 - 24, y - 24, Z1 - 64); arrowR(a, x0 + (x1 - x0) * 0.22, (pz0 + Z1 - 40) / 2, (x1 - x0) * 0.26, ph * 0.5, i % 2 ? -1 : 1, y - 28); for (let k = 0; k < 3; k++) a.box(x0 + (x1 - x0) * 0.46, y - 32, (pz0 + Z1 - 40) / 2 - 40 + k * 36, x1 - 40, y - 28, (pz0 + Z1 - 40) / 2 - 20 + k * 36); }
  a.rect(X0 + 74, y - 24, X1 - 74, y + 30, 'EQUIP-DETAIL');
  a.log(`Added two legs on foot plates with breakaway couplings and ${n} lit sign box${n > 1 ? 'es' : ''} with frame, arrow and text bars (plan and 3D).`);
}

function standSign(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const digit = (x, z, w, h, y) => { for (const [xa, za, xb, zb] of [[0, 0, 1, 0.14], [0, 0.43, 1, 0.57], [0, 0.86, 1, 1], [0, 0, 0.18, 1], [0.82, 0, 1, 1]]) a.box(x + xa * w, y - 14, z + za * h, x + xb * w, y, z + zb * h); };
  if (v.kind === 'arm') {
    a.box(X0, YF, Z0, X0 + 400, YB, Z0 + 30); a.cyl(X0 + 200, cy, Z0 + 30, Z1 - 60, 40, 12); a.tube([[X0 + 200, cy, Z1 - 60], [X1 - 100, cy, Z1 - 60]], [28, 28], 8); a.tube([[X0 + 200, cy, Z1 - 500], [X0 + 700, cy, Z1 - 70]], [16, 16], 6);
    const px0 = X0 + W * 0.45, px1 = X1 - 60; a.box(px0, cy - 15, Z1 - 800, px1, cy + 15, Z1 - 60); a.frame(px0, Z1 - 800, px1, Z1 - 60, cy - 28, cy - 15, 20); digit(px0 + (px1 - px0) * 0.28, Z1 - 650, (px1 - px0) * 0.18, 380, cy - 28); digit(px0 + (px1 - px0) * 0.56, Z1 - 650, (px1 - px0) * 0.18, 380, cy - 28);
  } else if (v.kind === 'frame') {
    for (const x of [X0 + 70, X1 - 70]) { a.box(x - 120, YF, Z0, x + 120, YB, Z0 + 20); a.cyl(x, cy, Z0 + 20, Z1 - 30, 28, 10); }
    const px0 = X0 + 100, px1 = X1 - 100; a.box(px0, cy - 18, Z1 - 1000, px1, cy + 18, Z1 - 100); a.frame(px0, Z1 - 1000, px1, Z1 - 100, cy - 34, cy - 18, 26); digit(cx - (px1 - px0) * 0.25, Z1 - 800, (px1 - px0) * 0.18, 480, cy - 34); digit(cx + (px1 - px0) * 0.07, Z1 - 800, (px1 - px0) * 0.18, 480, cy - 34);
  } else {
    a.box(cx - 220, YF, Z0, cx + 220, YB, Z0 + 20); a.cyl(cx, cy, Z0 + 20, Z1 - 80, 30, 12); const pw = W * 0.8, px0 = cx - pw / 2, px1 = cx + pw / 2;
    for (const s of (v.kind === 'dual' ? [-1, 1] : [-1])) { const yb = s < 0 ? cy - 30 : cy + 30; a.box(px0, s < 0 ? yb - 14 : yb, Z1 - 560, px1, s < 0 ? yb : yb + 14, Z1 - 60); digit(cx - pw * 0.3, Z1 - 480, pw * 0.22, 340, s < 0 ? yb - 14 : yb + 19); digit(cx + pw * 0.08, Z1 - 480, pw * 0.22, 340, s < 0 ? yb - 14 : yb + 19); }
    a.cyl(cx, cy, Z1 - 80, Z1 - 60, 40, 8);
  }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log(`Added ${v.kind === 'arm' ? 'a base, a mast with a cantilever arm and a hanging number plate' : v.kind === 'frame' ? 'two posts on foot plates carrying a framed number board' : v.kind === 'dual' ? 'a base, a post and a number plate on both faces' : 'a base, a post and a number plate'} with block numerals (plan and 3D).`);
}

function fodBin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.twin ? 2 : 1, bz = Z0 + (v.wheeled ? 90 : 220), r = Math.min(D / 2 - 30, (W - 60) / n / 2 - 10);
  for (let i = 0; i < n; i++) {
    const x = X0 + (W * (i + 0.5)) / n, top = Z1 - 150; a.cyl(x, cy, bz, top, r, 22); a.cone(x, cy, top, top + 90, r + 8, r * 0.75, 22); a.cyl(x, cy, top + 90, top + 110, r * 0.2, 8); a.box(x - r * 0.5, cy - r - 10, top - 30, x + r * 0.5, cy - r + 10, top + 30); a.box(x - r * 0.5, cy - r - 4, bz + (top - bz) * 0.3, x + r * 0.5, cy - r + 6, bz + (top - bz) * 0.5); a.cyl(x, cy, bz + (top - bz) * 0.12, bz + (top - bz) * 0.2, r + 6, 22); a.circ(x, cy, r); a.circ(x, cy, r + 8, 'EQUIP-DETAIL');
  }
  if (v.wheeled) { for (const x of [X0 + 30, X1 - 30]) { a.xcyl(x - 15, x + 15, cy + D * 0.3, Z0 + 80, 80, 14); a.rect(x - 15, cy + D * 0.3 - 80, x + 15, cy + D * 0.3 + 80, 'EQUIP-DETAIL'); } a.xcyl(X0 + 30, X1 - 30, cy + D * 0.3, Z0 + 80, 10, 6); a.tube([[X0 + 80, cy + r, Z1 - 330], [X0 + 80, YB - 30, Z1 - 150], [X1 - 80, YB - 30, Z1 - 150], [X1 - 80, cy + r, Z1 - 330]], [12, 12, 12, 12], 6); }
  else { for (let i = 0; i <= (v.twin ? 3 : 2); i++) { const x = X0 + 40 + ((W - 80) * i) / (v.twin ? 3 : 2); for (const y of [cy - D * 0.34, cy + D * 0.34]) { a.cyl(x, y, Z0, bz, 14, 8); } } a.box(X0 + 20, cy - D * 0.4, bz - 30, X1 - 20, cy + D * 0.4, bz); a.box(X0 + 20, cy - D * 0.4, Z0 + 110, X1 - 20, cy - D * 0.4 + 16, Z0 + 140); }
  a.log(`Added ${n === 2 ? 'two lidded round bins' : 'a lidded round bin'} with a domed lid, a slot, a label band and a plate, on ${v.wheeled ? 'two wheels with a tube handle' : 'a stand frame of legs'} (plan and 3D).`);
}

function spillPallet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ph = 230;
  for (const x of [X0 + 60, cx, X1 - 60]) a.box(x - 60, YF, Z0, x + 60, YB, Z0 + 80);
  a.box(X0, YF, Z0 + 80, X1, YB, Z0 + ph - 40); a.box(X0, YF, Z0 + ph - 40, X1, YF + 30, Z0 + ph + 30); a.box(X0, YB - 30, Z0 + ph - 40, X1, YB, Z0 + ph + 30); a.box(X0, YF, Z0 + ph - 40, X0 + 30, YB, Z0 + ph + 30); a.box(X1 - 30, YF, Z0 + ph - 40, X1, YB, Z0 + ph + 30);
  const nb = Math.floor((W - 60) / 70); for (let i = 0; i <= nb; i++) { const x = X0 + 30 + ((W - 60 - 14) * i) / nb; a.box(x, YF + 30, Z0 + ph - 40, x + 14, YB - 30, Z0 + ph + 20); }
  for (const f of [0.33, 0.66]) a.box(X0 + 30, YF + (D - 60) * f + 30 - 15, Z0 + ph - 60, X1 - 30, YF + (D - 60) * f + 30 + 15, Z0 + ph - 20);
  const nd = v.drums ? v.drums : 0, dr = 290; for (let i = 0; i < nd; i++) { const x = X0 + (W * (i + 0.5)) / (v.cols || nd), y = cy; a.cyl(x, y, Z0 + ph + 20, Z1, dr, 24); a.cyl(x, y, Z0 + ph + 20 + 60, Z0 + ph + 20 + 90, dr + 6, 24); a.cyl(x, y, Z0 + ph + 20 + 560, Z0 + ph + 20 + 590, dr + 6, 24); a.circ(x, y, dr); }
  a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL');
  a.log(`Added three skids with fork gaps, a deep sump with a raised lip and a bar grating with two support ties${nd ? ' and ' + nd + ' standing drums with rolling hoops' : ''} (plan and 3D).`);
}

function markerCone(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ch = v.flag ? (Z1 - Z0) * 0.55 : v.lamp ? (Z1 - Z0) - 150 : Z1 - Z0, zt = Z0 + ch, bt = 32, zb = Z0 + bt, r0 = W * 0.34, r1 = W * 0.07;
  a.box(X0, YF, Z0, X1, YB, Z0 + bt); a.circ(cx, cy, r0, 'EQUIP-DETAIL'); a.cone(cx, cy, zb, zt, r0, r1, 22); const rad = (z) => r0 + ((r1 - r0) * (z - zb)) / (zt - zb);
  for (const [f0, f1] of [[0.35, 0.5], [0.58, 0.7]]) { const z0 = zb + (zt - zb) * f0, z1 = zb + (zt - zb) * f1; a.cone(cx, cy, z0, z1, rad(z0) + 4, rad(z1) + 4, 22); }
  if (v.flag) { a.cyl(cx, cy, zt - 5, Z1 - 20, 8, 8); a.box(cx + 6, cy - 3, Z1 - 330, cx + 190, cy + 3, Z1 - 20); a.line(cx, cy, cx + 190, cy, 'EQUIP-DETAIL'); }
  if (v.lamp) { a.cyl(cx, cy, zt, zt + 20, r1 + 14, 12); a.cyl(cx, cy, zt + 20, Z1, 60, 16); a.ycyl(cy - 66, cy - 60, cx, zt + 80, 34, 12); }
  a.log(`Added a square base, a tapered cone with two reflective collars${v.flag ? ', a flag pole and a flag' : ''}${v.lamp ? ' and a flashing lamp head on top' : ''} (plan and 3D).`);
}

function partsTrolley(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.shelves, base = Z0 + 110, top = Z1 - (v.lid ? 260 : 60);
  casters(a, [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]], 100);
  for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.cyl(x, y, base - 20, top, 14, 8);
  for (let i = 0; i < n; i++) { const z = base + ((top - base - 30) * i) / Math.max(1, n - 1); a.box(X0 + 20, YF + 20, z, X1 - 20, YB - 20, z + 24); a.box(X0 + 20, YF + 20, z + 24, X1 - 20, YF + 34, z + 90); a.box(X0 + 20, YB - 34, z + 24, X1 - 20, YB - 20, z + 90); if (i < n - 1 || !v.lid) for (let k = 0; k < 3; k++) { const x = X0 + 50 + ((W - 100) * (k + 0.5)) / 3, bw = (W - 140) / 3 - 20; a.box(x - bw / 2, YF + 50, z + 24, x + bw / 2, YB - 50, z + 24 + Math.min((top - base) / n * 0.55, Z1 - 40 - (z + 24))); a.box(x - bw / 4, YF + 38, z + 40, x + bw / 4, YF + 50, z + 70); } }
  if (v.lid) { const z = top; a.box(X0 + 20, YF + 20, z, X1 - 20, YB - 20, z + 210); a.box(X0 + 10, YF + 10, z + 210, X1 - 10, YB - 10, z + 250); a.box(cx - 100, YF + 10, z + 100, cx + 100, YF + 20, z + 140); }
  a.tube([[X0 + 30, YB - 30, top], [X0 + 30, YB - 30, Z1 - 20 + 0], [X1 - 30, YB - 30, Z1 - 20 + 0], [X1 - 30, YB - 30, top]], [12, 12, 12, 12], 6);
  a.log(`Added four posts on swivel wheels, ${n} shelves with lips holding three parts bins each with label tabs${v.lid ? ', a lidded top box' : ''} and a push handle (plan and 3D).`);
}

function firePoint(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 30); a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL'); a.box(X0 + 40, YB - 50, Z0 + 30, X1 - 40, YB - 20, Z1 - 100); a.frame(X0 + 30, Z0 + 30, X1 - 30, Z1 - 100, YB - 90, YB - 50, 30);
  const n = v.n, sw = (W - 120) / n; for (let i = 0; i < n; i++) { const x = X0 + 60 + sw * (i + 0.5), z = Z0 + 120; a.cyl(x, YB - 135, z, z + 440, 62, 18); a.ell(x, YB - 135, z + 440, 62, 62, 40, 14, 6); a.cyl(x, YB - 135, z + 470, z + 520, 22, 10); a.box(x - 50, YB - 150, z + 520, x + 50, YB - 120, z + 545); a.tube([[x + 20, YB - 135, z + 500], [x + 90, YB - 135, z + 300], [x + 50, YB - 135, z + 120]], [8, 8, 8], 6); a.box(x - 66, YB - 195, z + 100, x + 66, YB - 175, z + 126); a.box(x - 66, YB - 195, z + 330, x + 66, YB - 175, z + 356); a.circ(x, YB - 135, 62); }
  a.box(X0 + 20, YB - 90, Z1 - 100, X1 - 20, YB - 40, Z1); a.box(X0 + 50, YB - 96, Z1 - 85, X1 - 50, YB - 90, Z1 - 15); if (v.call) { a.box(X1 - 170, YB - 130, Z0 + 700, X1 - 50, YB - 90, Z0 + 830); a.cyl(X1 - 110, YB - 130, Z0 + 740, Z0 + 745, 30, 12); }
  a.log(`Added a floor plate, a backboard with a frame, ${n} wall-mounted extinguisher${n > 1 ? 's' : ''} with straps and hose loops, and a header sign${v.call ? ' and a call point box' : ''} (plan and 3D).`);
}

function maintStand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const ch = 120, pd = 900, rise = Z1 - Z0 - ch - 1000, n = Math.max(3, Math.round(rise / 200)), rs = rise / n, run = W - pd - 80, tr = run / n, zd = Z0 + ch + rise;
  casters(a, [[X0 + 60, YF + 60], [X0 + 60, YB - 60], [X1 - 60, YF + 60], [X1 - 60, YB - 60]], ch);
  a.box(X0 + 30, YF + 30, Z0 + ch, X1 - 30, YF + 70, Z0 + ch + 40); a.box(X0 + 30, YB - 70, Z0 + ch, X1 - 30, YB - 30, Z0 + ch + 40);
  a.box(X1 - pd, YF + 30, zd - 40, X1 - 20, YB - 30, zd); for (const [x, y] of [[X1 - 50, YF + 40], [X1 - 50, YB - 40], [X1 - pd + 30, YF + 40], [X1 - pd + 30, YB - 40]]) a.cyl(x, y, Z0 + ch + 40, zd + 1000, 20, 8);
  for (const y of [YF + 40, YB - 40]) { a.tube([[X0 + 40, y, Z0 + ch + 40], [X1 - pd, y, zd - 20]], [24, 24], 6); a.tube([[X0 + 40, y, Z0 + ch + 40 + 950], [X1 - pd, y, zd + 950]], [16, 16], 6); a.tube([[X1 - pd, y, zd + 950], [X1 - 50, y, zd + 1000]], [16, 16], 6); a.tube([[X1 - pd + 30, y, zd + 500], [X1 - 50, y, zd + 500]], [14, 14], 6); }
  for (let i = 0; i < n; i++) { const x = X0 + 40 + i * tr; a.box(x, YF + 55, Z0 + ch + 40 + (i + 1) * rs - 26, x + tr + 10, YB - 55, Z0 + ch + 40 + (i + 1) * rs); a.line(x, YF + 55, x, YB - 55, 'EQUIP-DETAIL'); }
  a.tube([[X1 - 50, YF + 40, zd + 1000], [X1 - 50, YB - 40, zd + 1000]], [16, 16], 6); a.tube([[X1 - pd + 30, YF + 40, zd + 1000], [X1 - pd + 30, YB - 40, zd + 1000]], [16, 16], 6);
  a.log(`Added a wheeled base frame, ${n} stair treads on two stringers, a platform deck with four posts, handrails with mid rails and four swivel wheels (plan and 3D).`);
}

const AVI = [
  fam({ cat: CAT, title: 'Generic hangar aircraft wheel chock',
    desc: (v) => `${v.pair ? 'Two wedges joined by a rope' : 'Wedge'} with a ribbed sloped face, a back stop, side skirts and a rope handle.`,
    vs: [['light aircraft, 8 in', 8, 14, 5, 0, {}], ['turboprop, 10 in', 10, 18, 7, 0, {}], ['narrow-body, 12 in', 12, 24, 8, 0, {}], ['wide-body, 14 in', 14, 28, 10, 0, {}], ['narrow-body pair on a rope, 48 in', 48, 24, 8, 0, { pair: true }], ['wide-body pair on a rope, 60 in', 60, 28, 10, 0, { pair: true }]], build: chock }),
  fam({ cat: CAT, title: 'Generic hangar aircraft tow bar',
    desc: 'A-frame of two tubes with a cross tube, a fork head with two lock pins, a tow eye with a washer, a T handle and a pair of support wheels.',
    vs: [['light aircraft, 72 in', 72, 20, 10, 0, {}], ['regional aircraft, 120 in', 120, 28, 14, 0, {}], ['narrow-body, 156 in', 156, 32, 16, 0, {}], ['wide-body, 180 in', 180, 36, 18, 0, {}]], build: towBar }),
  fam({ cat: CAT, title: 'Generic airfield wind cone',
    desc: (v) => `Base plate, tapered pole with a swivel head, a ring and six fabric cone sections narrowing downwind${v.lights ? ' and eight lamps around the ring' : ''}.`,
    vs: [['18 in ring, 9 ft pole', 96, 26, 128, 0, {}], ['36 in ring, 15 ft pole', 150, 44, 220, 0, {}], ['48 in ring, 20 ft mast', 200, 56, 300, 0, {}], ['36 in ring with ring lamps, 15 ft pole', 150, 44, 220, 0, { lights: true }]], build: windCone }),
  fam({ cat: CAT, title: 'Generic hangar mechanic tool cart',
    desc: (v) => `Drawer cabinet of ${v.n} full-width drawers with bar pulls and a lock${v.chest ? ' under a hinged top chest' : ''}, a side push handle and four swivel wheels.`,
    vs: [['three drawers', 26, 18, 34, 0, { n: 3 }], ['five drawers', 28, 18, 38, 0, { n: 5 }], ['seven drawers', 30, 20, 42, 0, { n: 7 }], ['seven drawers with top chest', 30, 20, 52, 0, { n: 7, chest: true }]], build: toolCart }),
  fam({ cat: CAT, title: 'Generic hangar wheeled fire extinguisher cart',
    desc: (v) => `Chassis with two large rear wheels and two front stand legs carrying ${v.n} upright agent cylinder${v.n > 1 ? 's' : ''} with domed shoulders, valve heads and gauges${v.hose ? ' and hose coils' : ''}, and a U handle.`,
    vs: [['50 lb class', 24, 30, 44, 0, { n: 1 }], ['125 lb class', 28, 34, 52, 0, { n: 1 }], ['150 lb class with hose', 30, 36, 56, 0, { n: 1, hose: true }], ['twin cylinders', 44, 36, 52, 0, { n: 2, hose: true }]], build: extCart }),
  fam({ cat: CAT, title: 'Generic airside mandatory instruction sign',
    desc: (v) => `Two legs on foot plates with breakaway couplings and ${v.n} lit sign box${v.n > 1 ? 'es' : ''} with frame, arrow and text bars.`,
    vs: [['one panel, 18 in high', 48, 6, 32, 0, { n: 1, ph: 18 }], ['one panel, 24 in high', 60, 6, 38, 0, { n: 1, ph: 24 }], ['two panels, 24 in high', 100, 6, 38, 0, { n: 2, ph: 24 }], ['two panels, 30 in high', 112, 6, 44, 0, { n: 2, ph: 30 }], ['three panels, 36 in high', 168, 6, 50, 0, { n: 3, ph: 36 }]], build: airsideSign }),
  fam({ cat: CAT, title: 'Generic apron stand number sign',
    desc: (v) => v.kind === 'arm' ? 'Base, a mast with a cantilever arm and a hanging number plate with block numerals.' : v.kind === 'frame' ? 'Two posts on foot plates carrying a framed number board with block numerals.' : v.kind === 'dual' ? 'Base, post and a number plate with block numerals on both faces.' : 'Base, post and a number plate with block numerals.',
    vs: [['single post, 8 ft', 36, 12, 96, 0, { kind: 'post' }], ['two-post frame, 9 ft', 72, 12, 108, 0, { kind: 'frame' }], ['cantilever over the stand, 14 ft', 96, 14, 168, 0, { kind: 'arm' }], ['double sided on post, 8 ft', 36, 12, 96, 0, { kind: 'dual' }]], build: standSign }),
  fam({ cat: CAT, title: 'Generic apron foreign object debris bin',
    desc: (v) => `${v.twin ? 'Two lidded round bins' : 'Lidded round bin'} with a domed lid, a slot, a label band and a plate, on ${v.wheeled ? 'two wheels with a tube handle' : 'a stand frame of legs'}.`,
    vs: [['32 gal on a stand', 22, 22, 40, 0, {}], ['64 gal on wheels', 26, 30, 46, 0, { wheeled: true }], ['twin 32 gal on a frame', 44, 24, 40, 0, { twin: true }]], build: fodBin }),
  fam({ cat: CAT, title: 'Generic hangar spill containment pallet',
    desc: (v) => `Three skids with fork gaps, a deep sump with a raised lip and a bar grating with two support ties${v.drums ? ', with ' + v.drums + ' standing drums' : ''}.`,
    vs: [['two drum, 51 in', 51, 26, 9, 0, {}], ['four drum, 52 in square', 52, 52, 9, 0, {}], ['four drum with two drums on it', 52, 52, 44, 0, { drums: 2, cols: 2 }]], build: spillPallet }),
  fam({ cat: CAT, title: 'Generic apron marker cone',
    desc: (v) => `Square base and a tapered cone with two reflective collars${v.flag ? ', a flag pole and a flag' : ''}${v.lamp ? ' and a flashing lamp head on top' : ''}.`,
    vs: [['28 in', 14, 14, 28, 0, {}], ['28 in with flag, 52 in overall', 16, 16, 52, 0, { flag: true }], ['28 in with lamp, 34 in overall', 14, 14, 34, 0, { lamp: true }]], build: markerCone }),
  fam({ cat: CAT, title: 'Generic hangar parts trolley',
    desc: (v) => `Four posts on swivel wheels with ${v.shelves} shelves with lips holding three parts bins each with label tabs${v.lid ? ', a lidded top box' : ''} and a push handle.`,
    vs: [['two shelves', 36, 20, 34, 0, { shelves: 2 }], ['three shelves', 40, 22, 40, 0, { shelves: 3 }], ['two shelves with lidded box', 42, 22, 46, 0, { shelves: 2, lid: true }]], build: partsTrolley }),
  fam({ cat: CAT, title: 'Generic hangar fire point stand',
    desc: (v) => `Floor plate with a framed backboard, ${v.n} wall-mounted extinguisher${v.n > 1 ? 's' : ''} with straps and hose loops, and a header sign${v.call ? ' and a call point box' : ''}.`,
    vs: [['one extinguisher', 22, 14, 66, 0, { n: 1 }], ['two extinguishers', 36, 14, 66, 0, { n: 2 }], ['three extinguishers with call point', 50, 14, 66, 0, { n: 3, call: true }]], build: firePoint }),
  fam({ cat: CAT, title: 'Generic hangar maintenance step stand',
    desc: 'Wheeled base frame with stair treads on two stringers to a platform deck with four posts, handrails with mid rails and four swivel wheels.',
    vs: [['36 in platform', 96, 30, 82, 0, {}], ['48 in platform', 114, 30, 94, 0, {}], ['60 in platform', 132, 30, 106, 0, {}], ['72 in platform', 150, 30, 118, 0, {}]], build: maintStand }),
];
export default [...HOSP, ...CONSTR, ...MINE, ...EXC, ...AVI];
