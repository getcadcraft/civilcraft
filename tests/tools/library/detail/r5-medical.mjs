/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, block medical (medical/*): hospital patient-care, surgical, imaging, laboratory and sterile-processing equipment, 250 variants. Plain equipment shapes, no clinical claims. */
import { fam, cab, tbl, pull, T, GAP } from './r4-kit.mjs';

const IN = 25.4;
const PC = 'medical/patientcare', SU = 'medical/surgical', IM = 'medical/imaging', LB = 'medical/laboratory', SP = 'medical/support';

// ---- shared pieces ------------------------------------------------------------------------------------------------------------------
function quad(a, p, q, r, s) { a.t.push([p, q, r], [p, r, s]); }
function hexa(a, b, t) { quad(a, b[0], b[3], b[2], b[1]); quad(a, t[0], t[1], t[2], t[3]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(a, b[i], b[j], t[j], t[i]); } }
/** A slab tilted along y: bottom at (y0, za) rising to (y1, zb), thickness t, spanning x0..x1. */
function slabY(a, x0, x1, y0, za, y1, zb, t) { hexa(a, [[x0, y0, za], [x1, y0, za], [x1, y1, zb], [x0, y1, zb]], [[x0, y0, za + t], [x1, y0, za + t], [x1, y1, zb + t], [x0, y1, zb + t]]); }
function wheel(a, x, y, r, w = 22) { a.xcyl(x - w / 2, x + w / 2, y, a.Z0 + r, r, 14); a.rect(x - w / 2, y - r, x + w / 2, y + r, 'EQUIP-HIDDEN'); }
function casters4(a, inx, iny, h = 130) { for (const x of [a.X0 + inx, a.X1 - inx]) for (const y of [a.YF + iny, a.YB - iny]) { a.caster(x, y, h); a.circ(x, y, 24, 'EQUIP-HIDDEN'); } }
function star(a, cx, cy, z, rad, n = 5, th = 22, ch = 0) { for (let i = 0; i < n; i++) { const g = (i / n) * Math.PI * 2 + Math.PI / 2; const x = cx + Math.cos(g) * rad, y = cy + Math.sin(g) * rad; a.box(Math.min(cx, x) - th / 2, Math.min(cy, y) - th / 2, z, Math.max(cx, x) + th / 2, Math.max(cy, y) + th / 2, z + 34); a.line(cx, cy, x, y, 'EQUIP-DETAIL'); if (ch) { a.caster(x, y, ch); a.circ(x, y, 24, 'EQUIP-HIDDEN'); } } }
function screenBox(a, x0, z0, x1, z1, y, t = 30) { a.box(x0, y - t, z0, x1, y, z1); a.box(x0 + 14, y - t - 5, z0 + 14, x1 - 14, y - t, z1 - 14); a.rect(x0, y - t, x1, y, 'EQUIP-DETAIL'); }
function handle(a, x0, x1, y, z, r = 14) { a.xcyl(x0, x1, y, z, r, 8); }
function trayBox(a, x0, y0, x1, y1, z0, z1, t = 8) { a.box(x0, y0, z0, x1, y1, z0 + t); a.box(x0, y0, z0, x0 + t, y1, z1); a.box(x1 - t, y0, z0, x1, y1, z1); a.box(x0, y0, z0, x1, y0 + t, z1); a.box(x0, y1 - t, z0, x1, y1, z1); }
function dial(a, x, y, z, r = 18, dir = -1) { a.ycyl(y, y + dir * 10, x, z, r, 12); a.circ(x, y, r, 'EQUIP-DETAIL'); }

/** A general trolley: posts, shelves, optional closed sides/back, doors, drawers, push handle, casters. */
function cart(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const ch = o.caster ?? 110, zb = Z0 + ch, top = o.top ?? Z1 - (o.handleH ?? 0);
  if (ch) casters4(a, 55, 55, ch);
  if (!o.solid) for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 24, YB - 24]) a.box(x - 14, y - 14, zb, x + 14, y + 14, top);
  a.box(X0 + 10, YF + 10, zb, X1 - 10, YB - 10, zb + 30);                                    // base tray
  const n = o.shelves ?? 2;
  for (let i = 0; i <= n; i++) {
    const z = zb + 30 + ((top - zb - 60) * i) / n;
    if (o.solid && i > 0 && i < n) continue;
    a.box(X0 + 6, YF + 6, z, X1 - 6, YB - 6, z + 14);
    if (o.lip) { a.box(X0 + 6, YF + 6, z + 14, X1 - 6, YF + 14, z + 14 + o.lip); a.box(X0 + 6, YB - 14, z + 14, X1 - 6, YB - 6, z + 14 + o.lip); a.box(X0 + 6, YF + 6, z + 14, X0 + 14, YB - 6, z + 14 + o.lip); a.box(X1 - 14, YF + 6, z + 14, X1 - 6, YB - 6, z + 14 + o.lip); }
  }
  if (o.solid) { a.box(X0 + 6, YF + 6, zb + 30, X0 + 18, YB - 6, top); a.box(X1 - 18, YF + 6, zb + 30, X1 - 6, YB - 6, top); a.box(X0 + 6, YB - 18, zb + 30, X1 - 6, YB - 6, top); }
  if (o.back && !o.solid) a.box(X0 + 8, YB - 10, zb + 30, X1 - 8, YB - 6, top);
  if (o.doors) {
    const dz0 = zb + 40, dz1 = o.doorTop ?? top - 20, dw = (W - 40) / o.doors;
    for (let i = 0; i < o.doors; i++) { const x0 = X0 + 20 + i * dw + 3, x1 = X0 + 20 + (i + 1) * dw - 3; a.box(x0, YF, dz0, x1, YF + 16, dz1); pull(a, 'bar', (x0 + x1) / 2, (dz0 + dz1) / 2 + (dz1 - dz0) * 0.25); a.line(x0, YF, x0, YF + 40, 'EQUIP-DETAIL'); }
  }
  if (o.drawers) {
    const dz1 = o.drawTop ?? top - 20, dh = (o.drawH ?? (dz1 - zb - 60)) / o.drawers;
    for (let i = 0; i < o.drawers; i++) { const z1 = dz1 - i * dh, z0 = z1 - dh + 5; a.box(X0 + 22, YF, z0, X1 - 22, YF + 16, z1); pull(a, 'bar', cx, z1 - Math.min(50, dh * 0.5)); }
  }
  if (o.handle) { const hz = Z1 - 40; for (const x of [X0 + 24, X1 - 24]) a.box(x - 12, YB - 36, top, x + 12, YB - 12, hz); a.xcyl(X0 + 24, X1 - 24, YB - 24, hz, 15, 10); a.line(X0 + 24, YB - 24, X1 - 24, YB - 24, 'EQUIP-DETAIL'); }
  return { zb, top };
}
const cartDesc = (bits) => `Wheeled trolley on four casters, ${bits}.`;

// ===== PATIENT CARE =====================================================================================================================
function bed(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zd = Z0 + (v.deck ?? 560), ang = ((v.head ?? 0) * Math.PI) / 180;
  const fy = YF + 150, by = YB - 150, ix = W * 0.2;
  if (v.low) { a.box(X0 + W * 0.12, YF + 120, Z0 + 45, X1 - W * 0.12, YB - 120, Z0 + 110); for (const x of [X0 + ix, X1 - ix]) for (const y of [fy, by]) { a.cyl(x, y, Z0, Z0 + 45, 30, 10); a.circ(x, y, 30, 'EQUIP-HIDDEN'); } }
  else { for (const x of [X0 + ix, X1 - ix]) for (const y of [fy, by]) { a.caster(x, y, 140); a.circ(x, y, 25, 'EQUIP-HIDDEN'); } a.box(X0 + W * 0.12, YF + 120, Z0 + 100, X1 - W * 0.12, YB - 120, Z0 + 170); }
  for (const y of [YF + D * 0.3, YB - D * 0.3]) a.box(cx - 70, y - 60, Z0 + (v.low ? 110 : 170), cx + 70, y + 60, zd - 60);
  a.box(X0 + 25, YF + 70, zd - 60, X1 - 25, YB - 70, zd);                                      // deck frame
  const lh = D * 0.36, yp = YB - 70 - lh, ye = yp + lh * Math.cos(ang), ze = zd + lh * Math.sin(ang);
  a.box(X0 + 40, YF + 80, zd, X1 - 40, yp, zd + 150);                                          // seat and foot mattress
  if (ang > 0.01) { slabY(a, X0 + 40, X1 - 40, yp, zd, ye, ze, 150); a.line(X0 + 40, yp, X1 - 40, yp); }
  else a.box(X0 + 40, yp, zd, X1 - 40, YB - 80, zd + 150);
  a.line(X0 + 40, YF + D * 0.28, X1 - 40, YF + D * 0.28, 'EQUIP-DETAIL');
  a.box(X0 + 30, YF, zd - 50, X1 - 30, YF + 40, zd + 430);                                     // foot board
  a.box(X0 + 30, YB - 40, zd - 50, X1 - 30, YB, zd + 520);                                     // head board
  a.rect(X0 + 40, YF + 80, X1 - 40, YB - 80, 'EQUIP-DETAIL');
  const rt = zd + 150 + (v.slats ? 520 : 330);
  for (const x of [X0 + 12, X1 - 12]) {
    if (v.rails === 'none') break;
    const ya = YF + 220, yb = v.rails === 'half' ? YF + D * 0.5 : yp;
    a.box(x - 8, ya, rt - 16, x + 8, yb, rt); a.box(x - 8, ya, zd + 150, x + 8, yb, zd + 170);
    if (v.slats) for (let y = ya; y <= yb; y += 70) a.box(x - 5, y - 5, zd + 170, x + 5, y + 5, rt - 16);
    else for (const y of [ya, yb]) a.box(x - 8, y - 8, zd + 150, x + 8, y + 8, rt);
    a.line(x, ya, x, yb, 'EQUIP-DETAIL');
    if (ang > 0.01 && v.rails !== 'half') a.tube([[x, yp + 20, zd + 150 + 280], [x, ye, ze + 150 + 250]], [10, 10], 8);
  }
  a.box(X0 + 150, YF + 60, zd - 160, X0 + 220, YF + 130, zd - 60);                            // control box
  a.log(`Added the base frame, the lifting columns, the ${ang > 0.01 ? 'raised head section' : 'three-part deck'}, mattress, head and foot boards${v.rails === 'none' ? '' : ', side rails'} and casters (plan and 3D).`);
}
const bedDesc = (v) => `Hospital-type bed frame with a ${v.head ? `head section raised to ${v.head} degrees` : 'flat deck'}, mattress, head and foot boards${v.rails === 'none' ? '' : (v.slats ? ', tall slatted side rails' : (v.rails === 'half' ? ', half-length side rails' : ', side rails'))} on ${v.low ? 'a low frame with short feet' : 'four casters'}.`;

function stretcher(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  casters4(a, W * 0.2, 170, 160);
  a.box(X0 + W * 0.12, YF + 150, Z0 + 150, X1 - W * 0.12, YB - 150, Z0 + 220);
  for (const y of [YF + D * 0.25, YB - D * 0.25]) a.box(cx - 55, y - 55, Z0 + 220, cx + 55, y + 55, Z0 + (v.deck ?? 640) - 40);
  const zd = Z0 + (v.deck ?? 640), ang = ((v.back ?? 0) * Math.PI) / 180, lb = D * 0.32, yp = YB - 40 - lb;
  a.box(X0 + 20, YF + 50, zd - 50, X1 - 20, YB - 50, zd);
  a.box(X0 + 30, YF + 60, zd, X1 - 30, yp, zd + 90);
  if (ang > 0.01) slabY(a, X0 + 30, X1 - 30, yp, zd, yp + lb * Math.cos(ang), zd + lb * Math.sin(ang), 90); else a.box(X0 + 30, yp, zd, X1 - 30, YB - 60, zd + 90);
  a.line(X0 + 30, yp, X1 - 30, yp);
  a.rect(X0 + 30, YF + 60, X1 - 30, YB - 60, 'EQUIP-DETAIL');
  for (const x of [X0 + 12, X1 - 12]) { if (!v.rails) break; a.box(x - 8, YF + 260, zd + 440, x + 8, yp, zd + 456); for (const y of [YF + 260, yp]) a.box(x - 8, y - 8, zd + 90, x + 8, y + 8, zd + 456); a.line(x, YF + 260, x, yp, 'EQUIP-DETAIL'); }
  for (const x of [X0 + W * 0.28, X1 - W * 0.28]) a.box(x - 12, YB - 30, zd, x + 12, YB, zd + 330);   // push handles
  a.xcyl(X0 + W * 0.28, X1 - W * 0.28, YB - 15, zd + 330, 14, 10);
  a.cyl(X1 - 30, YF + 90, zd, zd + 300, 15, 8); a.circ(X1 - 30, YF + 90, 15, 'EQUIP-DETAIL');       // pole socket and stub
  a.log(`Added the wheeled base, the two lift columns, the deck with ${ang > 0.01 ? 'a raised back section' : 'a flat mattress'}${v.rails ? ', side rails' : ''}, push handles and a pole stub (plan and 3D).`);
}

function wheelchair(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const sw = W - 160, sx0 = cx - sw / 2, sx1 = cx + sw / 2, sz = Z0 + (v.seat ?? 500);
  const rr = v.small ? 130 : 305, ry = YB - D * 0.34;
  for (const x of [X0 + 30, X1 - 30]) { wheel(a, x, ry, rr, 30); if (!v.small) { a.xcyl(x - 8, x + 8, ry, Z0 + rr, rr - 24, 14); a.xcyl(x + (x < cx ? 22 : -22) - 3, x + (x < cx ? 22 : -22) + 3, ry, Z0 + rr, rr - 30, 14); } }
  for (const x of [X0 + 55, X1 - 55]) { wheel(a, x, YF + 130, 100, 24); a.cyl(x, YF + 130, Z0 + 100, sz - 60, 12, 8); }
  a.box(sx0 - 20, YF + D * 0.25, sz - 40, sx1 + 20, YB - 120, sz - 20);
  a.box(sx0, YF + D * 0.25, sz, sx1, YB - 130, sz + 30);                                       // seat
  const bh = v.back ?? 450;
  a.box(sx0, YB - 125, sz, sx1, YB - 100, sz + bh);                                            // back
  for (const x of [sx0 - 15, sx1 + 15]) { a.box(x - 11, YB - 120, sz, x + 11, YB - 100, sz + bh + 60); a.box(x - 11, YB - 130, sz + bh + 20, x + 11, YB - 20, sz + bh + 60); a.box(x - 11, YF + D * 0.3, sz + 190, x + 11, YB - 150, sz + 215); a.box(x - 11, YF + D * 0.3, sz + 30, x + 11, YF + D * 0.3 + 22, sz + 215); }
  if (v.recline) { a.box(sx0 + 40, YB - 110, sz + bh, sx1 - 40, YB - 85, sz + bh + 230); for (const x of [sx0 + 40, sx1 - 40]) a.box(x - 8, YB - 85, sz + bh, x + 8, YB - 40, sz + bh + 8); }
  for (const x of [sx0 + 30, sx1 - 30]) { a.tube([[x, YF + D * 0.3, sz - 20], [x, YF + 120, Z0 + 260]], [12, 12], 8); a.box(x - 60, YF + 20, Z0 + 215, x + 60, YF + 150, Z0 + 235); }   // leg rests and footplates
  for (const x of [sx0 - 30, sx1 + 30]) a.xcyl(x - 8, x + 8, ry, sz + 90, 60, 10);
  a.rect(sx0, YF + D * 0.25, sx1, YB - 130, 'EQUIP-DETAIL');
  a.log(`Added ${v.small ? 'the small rear wheels' : 'two large rear wheels with hand rims'}, front casters, seat, back, arm rests, leg rests with foot plates and push handles (plan and 3D).`);
}

function incubator(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  casters4(a, W * 0.18, 90, 120);
  a.box(X0 + 30, YF + 40, Z0 + 120, X1 - 30, YB - 40, Z0 + 170);                              // base plate
  if (v.drawers) { a.box(X0 + 40, YF + 40, Z0 + 170, X1 - 40, YB - 40, Z0 + 170 + v.drawers * 150); for (let i = 0; i < v.drawers; i++) { a.box(X0 + 55, YF, Z0 + 180 + i * 150, X1 - 55, YF + 18, Z0 + 300 + i * 150); pull(a, 'bar', cx, Z0 + 270 + i * 150); } }
  const zs = Z0 + 170 + (v.drawers ?? 0) * 150;
  a.box(cx - 60, YB - D * 0.55, zs, cx + 60, YB - D * 0.3, zs + (v.col ?? 330));              // lift column
  const zc = zs + (v.col ?? 330);
  a.box(X0 + 20, YF + 40, zc, X1 - 20, YB - 40, zc + 70);                                      // chamber floor
  a.box(X0 + 40, YF + 70, zc + 70, X1 - 40, YB - 70, zc + 100);                                // mattress tray
  const hz = Z1 - 20;
  a.frame(X0 + 20, zc + 70, X1 - 20, hz, YF + 40, YF + 60, 24); a.frame(X0 + 20, zc + 70, X1 - 20, hz, YB - 60, YB - 40, 24);
  a.box(X0 + 20, YF + 40, zc + 70, X0 + 44, YB - 40, hz); a.box(X1 - 44, YF + 40, zc + 70, X1 - 20, YB - 40, hz); a.box(X0 + 20, YF + 40, hz - 24, X1 - 20, YB - 40, hz);
  for (let i = 0; i < 2; i++) { const px = cx + (i ? 1 : -1) * W * 0.2; a.ycyl(YF + 20, YF + 40, px, zc + 70 + (hz - zc - 70) * 0.5, 55, 14); a.circ(px, YF + 30, 55, 'EQUIP-DETAIL'); }   // access ports
  a.box(X0 + 20, YF + 40, zc + 70, X1 - 20, YF + 60, zc + 90);
  screenBox(a, cx - W * 0.18, zs - 8 + 120, cx + W * 0.18, zs + 120 + 120, YF + 40, 24);
  if (v.trans) { a.box(X0 + 30, YB - 120, zc + 100, X1 - 30, YB - 70, zc + 130); handle(a, X0 + 40, X1 - 40, YB - 30, zs + 130, 12); a.box(X0 + 40, YB - 50, zs, X0 + 60, YB - 30, zs + 130); a.box(X1 - 60, YB - 50, zs, X1 - 40, YB - 30, zs + 130); }
  a.rect(X0 + 40, YF + 70, X1 - 40, YB - 70, 'EQUIP-DETAIL'); a.ellp(cx - W * 0.2, YF + 30, 55, 12, 'EQUIP-DETAIL'); a.ellp(cx + W * 0.2, YF + 30, 55, 12, 'EQUIP-DETAIL');
  a.log(`Added the casters, base${v.drawers ? ' with drawers' : ''}, lift column, mattress tray, framed clear hood with two round access ports and a control display${v.trans ? ', and a push bar for transport' : ''} (plan and 3D).`);
}

function warmer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  casters4(a, W * 0.12, 90, 120);
  const zb = Z0 + 120, zt = Z0 + (v.deckz ?? 760);
  a.box(X0 + 20, YF + 40, zb, X1 - 20, YB - 40, zt - 60);
  for (let i = 0; i < (v.drawers ?? 2); i++) { const dz = (zt - 60 - zb - 40) / (v.drawers ?? 2); a.box(X0 + 35, YF + 20, zb + 20 + i * dz, X1 - 35, YF + 40, zb + 20 + (i + 1) * dz - 8); pull(a, 'bar', cx, zb + 20 + i * dz + dz * 0.5); }
  a.box(X0 + 10, YF + 20, zt - 60, X1 - 10, YB - 20, zt);
  a.box(X0 + 40, YF + 60, zt, X1 - 40, YB - 100, zt + 50);                                     // mattress
  for (const [x0, x1, y0, y1] of [[X0 + 20, X1 - 20, YF + 40, YF + 54], [X0 + 20, X1 - 20, YB - 114, YB - 100], [X0 + 20, X0 + 34, YF + 40, YB - 100], [X1 - 34, X1 - 20, YF + 40, YB - 100]]) a.box(x0, y0, zt, x1, y1, zt + 230);
  a.box(X0 + 8, YB - 80, zt, X1 - 8, YB - 20, zt + 200);                                       // back panel
  a.box(X1 - 80, YB - 70, zt, X1 - 20, YB - 20, Z1 - 120);                                    // mast
  a.box(X0 + W * 0.2, YB - 150, Z1 - 150, X1 - 20, YB - 30, Z1 - 100);
  a.box(X0 + W * 0.2, YF + D * 0.2, Z1 - 140, X1 - 40, YB - 140, Z1 - 100);                  // heater head
  a.box(X0 + W * 0.2 + 20, YF + D * 0.2 + 20, Z1 - 100, X1 - 60, YB - 160, Z1 - 80);
  if (v.lamp) { a.cyl(X1 - 150, YB - 40, Z1 - 100, Z1, 18, 8); a.ell(X1 - 150, YB - 120, Z1 - 70, 70, 60, 30, 12, 6); }
  screenBox(a, X0 + 60, zt + 240, X0 + 60 + W * 0.3, zt + 360, YB - 80, 24);
  a.rect(X0 + 40, YF + 60, X1 - 40, YB - 100, 'EQUIP-DETAIL'); a.rect(X0 + W * 0.2, YF + D * 0.2, X1 - 40, YB - 140, 'EQUIP-DETAIL');
  a.log(`Added the cabinet with ${v.drawers ?? 2} drawers, the mattress bed with clear side walls, the rear mast and the overhead heater head${v.lamp ? ' with an exam lamp' : ''} (plan and 3D).`);
}

function ivpole(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const R = Math.min(W, D) / 2 - 30;
  a.circ(cx, cy, R, 'EQUIP-DETAIL');
  if (v.wall) { a.box(cx - 40, YB - 20, Z0, cx + 40, YB, Z0 + 120); a.box(cx - 12, YB - 36, Z0 + 20, cx + 12, YB - 20, Z1 - 200); }
  else { star(a, cx, cy, Z0 + 40, R, v.legs ?? 5, 34, 55); a.cyl(cx, cy, Z0 + 74, Z0 + 150, 26, 12); a.cyl(cx, cy, Z0 + 150, Z1 - 40, 14, 12); }
  const topz = Z1 - 40;
  if (v.wall) a.cyl(cx, YB - 36, Z1 - 200, Z1 - 40, 14, 12);
  const hn = v.hooks ?? 4;
  a.cyl(cx, v.wall ? YB - 36 : cy, topz - 10, topz + 10, 36, 12);                              // hook hub
  for (let i = 0; i < hn; i++) { const g = (i / hn) * Math.PI * 2 + 0.6, hx = cx + Math.cos(g) * (R * 0.8), hy = (v.wall ? YB - 36 : cy) + Math.sin(g) * (R * 0.8); a.box(Math.min(cx, hx) - 7, Math.min(cy, hy) - 7, topz - 6, Math.max(cx, hx) + 7, Math.max(cy, hy) + 7, topz + 8); a.cyl(hx, hy, topz - 70, topz, 6, 6); a.line(cx, cy, hx, hy, 'EQUIP-DETAIL'); }
  if (v.handle) a.xcyl(cx - 90, cx + 90, cy, Z0 + 1000, 12, 8);
  a.log(`Added ${v.wall ? 'the wall mounting plate' : `the ${v.legs ?? 5}-leg base with casters`}, the pole and a hub with ${hn} drop hooks${v.handle ? ' and a push handle' : ''} (plan and 3D).`);
}

function infusion(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const R = Math.min(W, D) / 2 - 20;
  star(a, cx, cy, Z0 + 40, R, 5, 34, 55); a.cyl(cx, cy, Z0 + 74, Z0 + 150, 26, 12); a.cyl(cx, cy, Z0 + 150, Z1 - 30, 15, 12);
  const n = v.pumps;
  for (let i = 0; i < n; i++) {
    const z0 = Z0 + (v.pz ?? 950) + i * 190;
    a.box(cx - 110, cy - 130, z0, cx + 110, cy + 110, z0 + 180);
    screenBox(a, cx - 90, z0 + 70, cx + 90, z0 + 160, cy - 130, 22);
    for (let k = 0; k < 3; k++) a.box(cx - 80 + k * 55, cy - 140, z0 + 20, cx - 40 + k * 55, cy - 130, z0 + 50);
    a.box(cx - 30, cy + 110, z0 + 60, cx + 30, cy + 135, z0 + 120);                          // clamp
  }
  const topz = Z1 - 30;
  a.cyl(cx, cy, topz - 10, topz + 10, 32, 12); for (let i = 0; i < 3; i++) { const g = i * 2.09 + 0.5, hx = cx + Math.cos(g) * 240, hy = cy + Math.sin(g) * 240; a.box(Math.min(cx, hx) - 6, Math.min(cy, hy) - 6, topz - 6, Math.max(cx, hx) + 6, Math.max(cy, hy) + 6, topz + 6); a.cyl(hx, hy, topz - 60, topz, 5, 6); a.line(cx, cy, hx, hy, 'EQUIP-DETAIL'); }
  a.rect(cx - 110, cy - 130, cx + 110, cy + 110, 'EQUIP-DETAIL');
  a.log(`Added the five-leg base with casters, the pole, ${n} pump housing${n > 1 ? 's' : ''} with display and keys on pole clamps, and a three-hook head (plan and 3D).`);
}

function lift(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const legX = [X0 + 40, X1 - 40], by = YB - D * 0.22;
  for (const x of legX) { a.box(x - 35, YF + 60, Z0 + 60, x + 35, by + 60, Z0 + 130); a.caster(x, YF + 110, 130); a.caster(x, by, 130); a.circ(x, YF + 110, 24, 'EQUIP-HIDDEN'); a.circ(x, by, 24, 'EQUIP-HIDDEN'); a.rect(x - 35, YF + 60, x + 35, by + 60, 'EQUIP-DETAIL'); }
  a.box(legX[0], by - 60, Z0 + 60, legX[1], by + 60, Z0 + 130);                                // cross member
  a.box(cx - 90, by - 80, Z0 + 130, cx + 90, by + 90, Z0 + 330);                               // motor housing
  const mz = Z1 - 60;
  if (v.stand) {
    a.tube([[cx, by + 20, Z0 + 330], [cx, by - 120, Z0 + (Z1 - Z0) * 0.75]], [50, 40], 10);
    const kz = Z0 + (Z1 - Z0) * 0.34; a.box(cx - 150, YF + 160, kz, cx + 150, by - 180, kz + 40);  // knee pad
    a.box(cx - 120, by - 190, kz - 40, cx + 120, by - 110, kz + 140);
    const sz = Z0 + (Z1 - Z0) * 0.75; a.box(cx - 200, by - 150, sz, cx + 200, by - 100, sz + 50); for (const x of [cx - 190, cx + 190]) a.box(x - 12, by - 150, sz + 50, x + 12, by - 100, sz + 150);
  } else {
    a.cyl(cx, by + 20, Z0 + 330, mz, 55, 12);
    a.tube([[cx, by + 20, mz - 30], [cx, YF + D * 0.18, mz - 120]], [40, 40], 10);          // boom
    a.cyl(cx, YF + D * 0.18, mz - 300, mz - 120, 14, 8);
    a.box(cx - 280, YF + D * 0.18 - 20, mz - 340, cx + 280, YF + D * 0.18 + 20, mz - 300);   // spreader bar
    for (const x of [cx - 260, cx + 260]) a.ycyl(YF + D * 0.18 - 25, YF + D * 0.18 + 25, x, mz - 360, 14, 8);
    a.line(cx - 280, YF + D * 0.18, cx + 280, YF + D * 0.18, 'EQUIP-DETAIL');
  }
  a.box(cx - 60, by + 70, Z0 + 330, cx + 60, by + 100, Z0 + 520); a.box(cx - 70, by + 100, Z0 + 440, cx + 70, by + 130, Z0 + 520);   // controller
  a.log(`Added the two-legged base on casters, the motor housing, the mast${v.stand ? ', knee pad and chest support' : ', boom and spreader bar with sling hooks'} and a hand controller (plan and 3D).`);
}

function board(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const t = Z1 - Z0;
  a.box(X0 + 40, YF, Z0, X1 - 40, YB, Z1); a.box(X0, YF + 60, Z0, X0 + 40, YB - 60, Z1); a.box(X1 - 40, YF + 60, Z0, X1, YB - 60, Z1);
  a.box(X0 + 8, YF + 8, Z0 + t * 0.2, X1 - 8, YF + 36, Z1 + 0);
  const hn = v.holes ?? 0;
  for (let i = 0; i < hn; i++) { const y = YF + D * (0.25 + (0.5 * i) / Math.max(1, hn - 1)); a.ellp(cx, y, W * 0.28, 40, 'EQUIP-DETAIL'); }
  for (let i = 0; i < 4; i++) a.line(X0 + 30, YF + D * (0.15 + i * 0.23), X1 - 30, YF + D * (0.15 + i * 0.23), 'EQUIP-DETAIL');
  if (v.grip) for (const y of [YF + D * 0.3, YB - D * 0.3]) a.box(cx - W * 0.3, y - 12, Z1, cx + W * 0.3, y + 12, Z1 + 6);
  a.log(`Added the flat board with rounded-off edge bars${hn ? `, ${hn} hand-hold slots drawn in plan` : ''}${v.grip ? ' and grip strips' : ''} (plan and 3D).`);
}

function walker(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const hz = Z1 - 30, fx = [X0 + 30, X1 - 30];
  if (v.rollator) {
    for (const x of fx) for (const y of [YF + 120, YB - 120]) { wheel(a, x, y, v.wr ?? 100, 24); a.cyl(x, y, Z0 + (v.wr ?? 100), Z0 + 360, 12, 8); }
    for (const x of fx) { a.tube([[x, YF + 120, Z0 + 360], [x, YB - 100, Z0 + 620]], [12, 12], 8); a.tube([[x, YB - 100, Z0 + 620], [x, YB - 60, hz]], [14, 14], 8); a.box(x - 15, YB - 90, hz - 5, x + 15, YB - 20, hz + 5 > Z1 ? Z1 : hz + 5); a.box(x - 15, YB - 100, hz - 100, x + 15, YB - 60, hz); }
    a.box(fx[0], YB - 260, Z0 + 520, fx[1], YB - 100, Z0 + 550);                               // seat
    a.xcyl(fx[0], fx[1], YB - 60, hz - 60, 10, 8);
    a.box(fx[0] + 20, YF + 60, Z0 + 300, fx[1] - 20, YB - 280, Z0 + 330); for (const x of [fx[0] + 20, fx[1] - 20]) a.box(x - 4, YF + 60, Z0 + 330, x + 4, YB - 280, Z0 + 440);   // basket
    a.rect(fx[0], YB - 260, fx[1], YB - 100, 'EQUIP-DETAIL');
  } else {
    for (const x of fx) { a.tube([[x, YF + 60, Z0 + 10], [x, YF + 60, hz]], [12, 12], 8); a.tube([[x, YB - 60, Z0 + 10], [x, YB - 60, hz]], [12, 12], 8); a.tube([[x, YF + 60, hz], [x, YB - 60, hz]], [13, 13], 8); if (v.wheels) { wheel(a, x, YF + 60, 55, 20); } else { a.cyl(x, YF + 60, Z0, Z0 + 14, 18, 8); } a.cyl(x, YB - 60, Z0, Z0 + 14, 18, 8); a.circ(x, YB - 60, 18, 'EQUIP-HIDDEN'); }
    a.xcyl(fx[0], fx[1], YB - 60, hz - 10, 12, 8); a.xcyl(fx[0], fx[1], YB - 60, Z0 + 300, 10, 8);
  }
  a.line(fx[0], YF + 120, fx[0], YB - 60, 'EQUIP-DETAIL'); a.line(fx[1], YF + 120, fx[1], YB - 60, 'EQUIP-DETAIL');
  a.log(`Added the ${v.rollator ? 'four wheels, tubular frame, seat, basket and loop handles' : 'tubular side frames, cross bars and rubber feet' + (v.wheels ? ' with front wheels' : '')} (plan and 3D).`);
}

function commode(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const sz = Z0 + (v.seat ?? 520);
  if (v.casters) casters4(a, 50, 60, 100); else for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 50, YB - 50]) { a.cyl(x, y, Z0, sz - 30, 14, 8); a.circ(x, y, 14, 'EQUIP-HIDDEN'); }
  a.box(X0 + 20, YF + 20, sz - 40, X1 - 20, YB - 20, sz - 15); a.box(X0 + 20, YF + 20, sz - 15, X1 - 20, YB - 20, sz + 25);
  a.ell(cx, a.cy, sz + 28, W * 0.26, D * 0.26, 4, 18, 3); a.ellp(cx, a.cy, W * 0.26, D * 0.26, 'EQUIP-DETAIL');
  a.box(X0 + 40, YB - 50, sz + 25, X1 - 40, YB - 30, sz + 470);
  for (const x of [X0 + 20, X1 - 20]) { a.box(x - 12, YB - 50, sz + 25, x + 12, YB - 30, sz + 250); a.box(x - 12, YF + D * 0.28, sz + 250, x + 12, YB - 30, sz + 275); a.box(x - 12, YF + D * 0.28, sz + 25, x + 12, YF + D * 0.28 + 24, sz + 250); }
  if (v.bucket) { a.box(cx - W * 0.25, a.cy - D * 0.2, sz - 260, cx + W * 0.25, a.cy + D * 0.2, sz - 40); a.line(cx - W * 0.25, a.cy - D * 0.2, cx + W * 0.25, a.cy - D * 0.2, 'EQUIP-HIDDEN'); }
  if (v.foot) { for (const x of [cx - W * 0.2, cx + W * 0.2]) a.box(x - 60, YF, Z0 + 150, x + 60, YF + 120, Z0 + 170); }
  a.log(`Added the frame, padded seat with an oval opening, back, arm rests${v.bucket ? ', a removable bucket drawn under the seat' : ''}${v.foot ? ', foot plates' : ''}${v.casters ? ' and four casters' : ' and rubber feet'} (plan and 3D).`);
}

const bedH = (deck, head, d) => Math.ceil(Math.max((deck + 520), (deck + 150 + 330 + 20), head ? deck + 150 + 170 + (d * 25.4 * 0.36) * Math.sin((head * Math.PI) / 180) + 20 : 0, 0) / IN) + 1;

const PATIENT = [
  fam({ cat: PC, title: 'Generic hospital bed frame', desc: bedDesc,
    vs: [
      ['standard, 36 x 84 in, flat deck', 36, 84, bedH(560, 0, 84), 0, { deck: 560 }],
      ['standard, 36 x 84 in, head raised 30 degrees', 36, 84, bedH(560, 30, 84), 0, { deck: 560, head: 30 }],
      ['standard, 36 x 84 in, head raised 45 degrees', 36, 84, bedH(560, 45, 84), 0, { deck: 560, head: 45 }],
      ['bariatric, 42 x 88 in, flat deck', 42, 88, bedH(580, 0, 88), 0, { deck: 580 }],
      ['bariatric, 48 x 90 in, head raised 30 degrees', 48, 90, bedH(580, 30, 90), 0, { deck: 580, head: 30 }],
      ['low frame, 36 x 84 in, floor-level deck', 36, 84, bedH(330, 0, 84), 0, { deck: 330, low: true }],
      ['without side rails, 36 x 80 in', 36, 80, bedH(560, 0, 80), 0, { deck: 560, rails: 'none' }],
      ['child size, 30 x 66 in, tall slatted sides', 30, 66, 50, 0, { deck: 520, slats: true }] ], build: bed }),
  fam({ cat: PC, title: 'Generic patient transport stretcher', desc: (v) => `Wheeled stretcher with two lift columns, a mattress deck${v.back ? ` with the back section raised to ${v.back} degrees` : ''}${v.rails ? ', side rails' : ''} and push handles at the head.`,
    vs: [
      ['flat deck, 27 x 78 in, no rails', 27, 78, 42, 0, { deck: 640 }],
      ['flat deck, 27 x 78 in, side rails', 27, 78, 52, 0, { deck: 640, rails: true }],
      ['back raised 30 degrees, 27 x 78 in', 27, 78, 52, 0, { deck: 640, rails: true, back: 30 }],
      ['back raised 60 degrees, 30 x 80 in', 30, 80, 56, 0, { deck: 640, rails: true, back: 60 }],
      ['bariatric, 38 x 84 in, back raised 30 degrees', 38, 84, 54, 0, { deck: 680, rails: true, back: 30 }] ], build: stretcher }),
  fam({ cat: PC, title: 'Generic hospital wheelchair', desc: (v) => `Folding-style wheelchair with ${v.small ? 'four small wheels' : 'two large rear wheels with hand rims'}, front casters, a sling seat and back${v.recline ? ', a head extension on a reclined back' : ''}, arm rests and swing-away leg rests.`,
    vs: [
      ['18 in seat', 26, 42, 36, 0, { seat: 500 }],
      ['20 in seat', 28, 42, 36, 0, { seat: 500 }],
      ['22 in seat, wide', 30, 43, 36, 0, { seat: 500 }],
      ['26 in seat, bariatric', 34, 44, 37, 0, { seat: 520 }],
      ['16 in seat, narrow', 24, 40, 36, 0, { seat: 500 }],
      ['reclining back with head extension, 20 in seat', 28, 46, 52, 0, { seat: 500, back: 600, recline: true }],
      ['transport chair, small wheels, 18 in seat', 24, 38, 36, 0, { seat: 480, small: true }],
      ], build: wheelchair }),
  fam({ cat: PC, title: 'Generic infant incubator', desc: (v) => `Infant incubator on casters with a framed clear hood, two round access ports, a mattress tray, a control display${v.drawers ? ` and ${v.drawers} drawers in the base` : ''}${v.trans ? ' and a push bar' : ''}.`,
    vs: [
      ['stationary, 32 x 22 in', 32, 22, 60, 0, { col: 330 }],
      ['stationary with base drawers, 36 x 24 in', 36, 24, 64, 0, { col: 300, drawers: 2 }],
      ['transport, 34 x 20 in, push bar', 34, 20, 44, 0, { col: 220, trans: true }],
      ['wide, 40 x 26 in, one drawer', 40, 26, 62, 0, { col: 300, drawers: 1 }] ], build: incubator }),
  fam({ cat: PC, title: 'Generic infant radiant warmer', desc: (v) => `Open infant bed on a cabinet with ${v.drawers ?? 2} drawers, clear side walls, a rear mast and an overhead heater head${v.lamp ? ' with a task lamp' : ''}.`,
    vs: [
      ['two drawers, 30 x 26 in', 30, 26, 76, 0, { drawers: 2 }],
      ['three drawers with task lamp, 34 x 28 in', 34, 28, 80, 0, { drawers: 3, lamp: true, deckz: 800 }],
      ['one drawer, 28 x 24 in, low', 28, 24, 70, 0, { drawers: 1, deckz: 700 }] ], build: warmer }),
  fam({ cat: PC, title: 'Generic wheeled IV pole', desc: (v) => `${v.wall ? 'Wall-plate' : 'Wheeled'} IV pole with a ${v.hooks ?? 4}-hook head${v.handle ? ' and a push handle' : ''}, ${v.wall ? 'one pole on a wall plate' : `${v.legs ?? 5} legs on casters`}.`,
    vs: [
      ['four hooks, 5-leg base, 80 in', 26, 26, 80, 0, { hooks: 4, legs: 5 }],
      ['two hooks, 5-leg base, 72 in', 24, 24, 72, 0, { hooks: 2, legs: 5 }],
      ['four hooks with push handle, 84 in', 26, 26, 84, 0, { hooks: 4, legs: 5, handle: true }],
      ['four hooks, 4-leg base, 78 in', 24, 24, 78, 0, { hooks: 4, legs: 4 }],
      ['two hooks, wall plate, 78 in', 12, 6, 78, 0, { hooks: 2, wall: true }] ], build: ivpole }),
  fam({ cat: PC, title: 'Generic infusion pump stand', desc: (v) => `Five-leg pole stand carrying ${v.pumps} stacked pump housing${v.pumps > 1 ? 's' : ''} with displays and keys, and a three-hook head.`,
    vs: [['one pump, 76 in', 26, 26, 76, 0, { pumps: 1 }], ['two pumps, 78 in', 26, 26, 78, 0, { pumps: 2 }], ['three pumps, 80 in', 26, 26, 80, 0, { pumps: 3 }], ['four pumps, 84 in', 28, 28, 84, 0, { pumps: 4, pz: 880 }]], build: infusion }),
  fam({ cat: PC, title: 'Generic mobile patient lift', desc: (v) => v.stand ? 'Sit-to-stand lift on a two-legged base with casters, a motor housing, a mast, a knee pad, a chest support and a hand controller.' : 'Floor lift on a two-legged base with casters, a motor housing, a mast and boom with a spreader bar and sling hooks, and a hand controller.',
    vs: [['floor lift, 400 lb class', 28, 46, 70, 0, {}], ['floor lift, 600 lb class, wide base', 34, 50, 72, 0, {}], ['floor lift, 1000 lb class, bariatric', 40, 54, 74, 0, {}], ['sit-to-stand, 400 lb class', 26, 44, 52, 0, { stand: true }], ['sit-to-stand, 600 lb class', 30, 46, 54, 0, { stand: true }]], build: lift }),
  fam({ cat: PC, title: 'Generic patient transfer board', desc: (v) => `Flat transfer board with rounded-off end bars${v.holes ? ` and ${v.holes} hand-hold slots` : ''}${v.grip ? ' and grip strips' : ''}.`,
    vs: [['24 in, plain', 8, 24, 0.5, 0, {}], ['30 in, two hand slots', 9, 30, 0.5, 0, { holes: 2 }], ['36 in, four hand slots', 10, 36, 0.6, 0, { holes: 4 }], ['40 in, bariatric, grip strips', 12, 40, 0.7, 0, { holes: 2, grip: true }]], build: board }),
  fam({ cat: PC, title: 'Generic hospital walking frame', desc: (v) => v.rollator ? 'Four-wheel rollator with a tubular frame, loop handles, a padded seat and a basket.' : `Tubular walking frame with side frames, cross bars and rubber feet${v.wheels ? ' and front wheels' : ''}.`,
    vs: [['standard, 24 in wide', 24, 18, 34, 0, {}], ['front-wheeled, 24 in wide', 24, 18, 35, 0, { wheels: true }], ['four-wheel rollator, 25 in wide', 25, 27, 36, 0, { rollator: true }], ], build: walker }),
  fam({ cat: PC, title: 'Generic bedside commode chair', desc: (v) => `Commode chair frame with a padded seat and oval opening, back and arm rests${v.bucket ? ', a bucket under the seat' : ''}${v.casters ? ', on four casters' : ', on rubber feet'}.`,
    vs: [['fixed arms, rubber feet, 20 in wide', 20, 22, 36, 0, { bucket: true }], ['on casters with bucket, 21 in wide', 21, 24, 38, 0, { bucket: true, casters: true }], ['bariatric, 26 in wide, rubber feet', 26, 26, 38, 0, { bucket: true, seat: 540 }], ], build: commode }),
];

// ===== SURGICAL =========================================================================================================================
function optable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const tw = W * (v.topw ?? 0.8), tx0 = cx - tw / 2, tx1 = cx + tw / 2, zt = Z0 + (v.deck ?? 900);
  a.box(X0 + W * 0.05, YF + D * 0.28, Z0 + 55, X1 - W * 0.05, YB - D * 0.28, Z0 + 135);       // base plate
  for (const x of [X0 + W * 0.12, X1 - W * 0.12]) for (const y of [YF + D * 0.3, YB - D * 0.3]) { a.cyl(x, y, Z0, Z0 + 55, 28, 10); a.circ(x, y, 28, 'EQUIP-HIDDEN'); }
  a.box(cx - 130, a.cy - 130 + (v.off ?? 0), Z0 + 135, cx + 130, a.cy + 130 + (v.off ?? 0), Z0 + 420);   // lower column
  a.box(cx - 100, a.cy - 100 + (v.off ?? 0), Z0 + 420, cx + 100, a.cy + 100 + (v.off ?? 0), zt - 130);
  a.box(cx - 200, a.cy - 200 + (v.off ?? 0), zt - 130, cx + 200, a.cy + 200 + (v.off ?? 0), zt - 60);   // top carriage
  const secs = v.secs ?? 4, l0 = YF + 40, l1 = YB - 40, sl = (l1 - l0) / secs;
  for (let i = 0; i < secs; i++) {
    const y0 = l0 + i * sl + 2, y1 = l0 + (i + 1) * sl - 2;
    if (i === 0 && v.legDrop) slabY(a, tx0, tx1, y0, zt - 140, y1, zt - 60, 60); else a.box(tx0, y0, zt - 60, tx1, y1, zt);
    a.box(tx0 + 12, y0, zt, tx1 - 12, y1, zt + 55);                                           // pad
    a.rect(tx0, y0, tx1, y1, 'EQUIP-DETAIL');
  }
  for (const x of [tx0 - 8, tx1 + 8]) { a.box(x - 8, l0 + sl, zt - 60, x + 8, l1 - sl * 0.6, zt - 20); a.box(x - 6, l0 + sl, zt - 30, x + 6, l1 - sl * 0.6, zt - 10); a.line(x, l0 + sl, x, l1 - sl * 0.6, 'EQUIP-DETAIL'); }
  if (v.headrest) { a.box(cx - 120, YB - 40 - 20, zt, cx + 120, YB - 10, zt + 120); }
  a.box(X0 + W * 0.04, YB - D * 0.25, Z0 + 140, X0 + W * 0.04 + 80, YB - D * 0.25 + 40, Z0 + 330);    // foot pedal housing
  a.log(`Added the floor base plate with feet, the two-stage column, the carriage, ${secs} top sections with pads and side accessory rails${v.legDrop ? ', a lowered leg section' : ''}${v.headrest ? ' and a head rest' : ''} (plan and 3D).`);
}

function slight(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const n = v.heads, rad = v.hd / 2;
  a.cyl(cx, cy, Z1 - 40, Z1, 150, 20); a.cyl(cx, cy, Z1 - 140, Z1 - 40, 70, 14); a.circ(cx, cy, 150, 'EQUIP-DETAIL');
  const pos = n === 1 ? [[cx, cy]] : n === 2 ? [[cx - (W / 2 - rad - 20), cy], [cx + (W / 2 - rad - 20), cy]] : [[cx - (W / 2 - rad - 20), cy], [cx + (W / 2 - rad - 20), cy], [cx, YF + rad + 20]];
  for (const [hx, hy] of pos) {
    const z0 = Z0;
    if (Math.hypot(hx - cx, hy - cy) > 20) { a.tube([[cx, cy, Z1 - 100], [hx, hy, Z1 - 100]], [45, 45], 10); a.line(cx, cy, hx, hy, 'EQUIP-DETAIL'); }
    a.cyl(hx, hy, z0 + 160, Z1 - 100, 32, 12);                                                // spring arm
    a.cyl(hx, hy, z0 + 100, z0 + 160, 60, 14);
    a.cyl(hx, hy, z0 + 25, z0 + 85, rad, 28); a.ell(hx, hy, z0 + 85, rad, rad, 40, 28, 5);   // head
    a.circ(hx, hy, rad); a.circ(hx, hy, rad * 0.62, 'EQUIP-DETAIL'); a.circ(hx, hy, 40, 'EQUIP-DETAIL');
    for (let k = 0; k < 8; k++) { const g = (k / 8) * Math.PI * 2, lx = hx + Math.cos(g) * rad * 0.78, ly = hy + Math.sin(g) * rad * 0.78; a.cyl(lx, ly, z0, z0 + 25, 22, 8); }
    a.cyl(hx, hy, z0, z0 + 25, 32, 10);                                                         // handle
  }
  a.log(`Added the ceiling plate, ${n > 1 ? 'the horizontal arms, ' : ''}${n} spring arm${n > 1 ? 's' : ''} and ${n} round lamp head${n > 1 ? 's' : ''} with a ring of lamp lenses and a centre handle (plan and 3D).`);
}

function anaes(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  const r = cart(a, { caster: 120, solid: false, shelves: 1, top: Z0 + (v.topz ?? 900), drawers: v.drawers, drawTop: Z0 + (v.topz ?? 900) - 40, drawH: v.drawers * 140, handle: true, handleH: 0, lip: 25 });
  const t = r.top;
  for (let i = 0; i < (v.cyl ?? 2); i++) { const x = X1 - 90 - i * 110; a.cyl(x, YB - 60, Z0 + 150, Z0 + 750, 45, 14); a.cyl(x, YB - 60, Z0 + 750, Z0 + 790, 18, 8); a.circ(x, YB - 60, 45, 'EQUIP-DETAIL'); }
  a.box(X0 + 40, YF + 60, t + 14, X1 - 40, YB - 130, t + 40);
  a.box(cx - 25, YB - 90, t, cx + 25, YB - 60, Z1 - 60); screenBox(a, cx - W * 0.28, Z1 - 380, cx + W * 0.28, Z1 - 60, YB - 90, 40);
  for (let k = 0; k < 3; k++) { dial(a, X0 + 100 + k * 90, YF + 40, t + 120 - 70, 26, -1); }
  a.log(`Added the casters, a work surface with a raised lip, ${v.drawers} drawers, ${v.cyl ?? 2} gas cylinders on the back, a monitor on a post and flow dials (plan and 3D).`);
}

function mayo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0 + 20, YB - 70, Z0 + 40, X1 - 20, YB, Z0 + 110); a.box(X0 + 20, YF, Z0 + 40, X0 + 90, YB, Z0 + 110); a.box(X1 - 90, YF, Z0 + 40, X1 - 20, YB, Z0 + 110);  // U base
  for (const [x, y] of [[X0 + 55, YF + 40], [X1 - 55, YF + 40], [cx, YB - 40]]) { a.caster(x, y, 100); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
  a.cyl(cx, YB - 50, Z0 + 110, Z1 - 110, 26, 12);
  a.box(cx - 40, YB - 90, Z1 - 150, cx + 40, YB - 10, Z1 - 100);
  const tx0 = X0 + 10, tx1 = X1 - 10, ty0 = YF + 10, ty1 = YB - 10;
  a.box(tx0 + 30, ty0 + 30, Z1 - 100, tx1 - 30, ty1 - 30, Z1 - 70);
  trayBox(a, tx0, ty0, tx1, ty1, Z1 - 70, Z1, 8);
  a.rect(tx0, ty0, tx1, ty1, 'EQUIP-DETAIL'); a.rect(X0 + 20, YF, X0 + 90, YB, 'EQUIP-HIDDEN'); a.rect(X1 - 90, YF, X1 - 20, YB, 'EQUIP-HIDDEN');
  a.log('Added the U-shaped base on three casters, the single post, and the shallow instrument tray with raised edge (plan and 3D).');
}

function backtable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zt = Z1 - 8;
  a.box(X0, YF, zt - 30, X1, YB, zt + 8);
  if (v.rim) { a.box(X0, YF, zt + 8, X1, YF + 12, zt + 8 + v.rim); a.box(X0, YB - 12, zt + 8, X1, YB, zt + 8 + v.rim); a.box(X0, YF, zt + 8, X0 + 12, YB, zt + 8 + v.rim); a.box(X1 - 12, YF, zt + 8, X1, YB, zt + 8 + v.rim); }
  if (v.casters) casters4(a, 40, 40, 110); else for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) { a.cyl(x, y, Z0, zt - 30, 18, 10); a.circ(x, y, 18, 'EQUIP-HIDDEN'); }
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) a.cyl(x, y, Z0 + (v.casters ? 110 : 0), zt - 30, 18, 10);
  const sz = Z0 + (v.shelfz ?? 220); a.box(X0 + 40, YF + 40, sz, X1 - 40, YB - 40, sz + 20); a.rect(X0 + 40, YF + 40, X1 - 40, YB - 40, 'EQUIP-HIDDEN');
  a.box(X0 + 40, YF + 36, zt - 130, X1 - 40, YF + 44, zt - 30); a.box(X0 + 40, YB - 44, zt - 130, X1 - 40, YB - 36, zt - 30);
  a.log(`Added the sheet top${v.rim ? ' with a raised rim' : ''}, ${v.casters ? 'four casters' : 'four legs'}, an under-shelf and apron rails (plan and 3D).`);
}

function sboom(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.cyl(cx, cy, Z1 - 50, Z1, 200, 24); a.cyl(cx, cy, Z1 - 400, Z1 - 50, 90, 16); a.circ(cx, cy, 200, 'EQUIP-DETAIL');
  const arms = v.arms;
  for (let i = 0; i < arms; i++) {
    const sd = arms === 1 ? 1 : (i ? 1 : -1), ex = cx + sd * (W / 2 - 420);
    a.box(Math.min(cx, ex) - 0, cy - 80, Z1 - 400, Math.max(cx, ex), cy + 80, Z1 - 250);   // horizontal arm
    a.line(cx, cy, ex, cy, 'EQUIP-DETAIL');
    const hh = v.hh;
    a.cyl(ex, cy, Z0 + hh, Z1 - 400, 60, 14);
    if (v.type === 'service' || (v.type === 'mixed' && i === 0)) {
      a.box(ex - 180, cy - 120, Z0 + 80, ex + 180, cy + 120, Z0 + hh);                         // service head
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { a.ycyl(cy - 150, cy - 120, ex - 120 + k * 80, Z0 + 170 + r * 120, 26, 10); }
      a.box(ex - 200, cy - 125, Z0 + 40, ex + 200, cy + 125, Z0 + 80);
      for (let k = 0; k < 4; k++) a.circ(ex - 120 + k * 80, cy - 135, 26, 'EQUIP-DETAIL');
      a.rect(ex - 180, cy - 120, ex + 180, cy + 120, 'EQUIP-DETAIL');
    } else {
      a.box(ex - 30, cy - 30, Z0 + 340, ex + 30, cy + 30, Z0 + hh);
      screenBox(a, ex - 380, Z0 + 20, ex + 380, Z0 + 340, cy - 30, 40);
      a.rect(ex - 380, cy - 70, ex + 380, cy - 30, 'EQUIP-DETAIL');
    }
  }
  a.log(`Added the ceiling plate and drum, ${arms} horizontal arm${arms > 1 ? 's' : ''} and ${arms > 1 ? 'drop columns' : 'a drop column'} carrying ${v.type === 'service' ? 'service heads with a grid of round outlet faces' : v.type === 'monitor' ? 'a wide monitor' : 'a service head and a monitor'} (plan and 3D).`);
}

function scrub(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const n = v.stations, zt = Z0 + 900;
  a.box(X0, YF + 20, Z0 + 100, X1, YB, zt - 150);                                              // apron cabinet body
  a.box(X0 + 20, YF, Z0, X1 - 20, YF + 60, Z0 + 100);
  a.box(X0, YF, zt - 150, X1, YB, zt);                                                         // trough deck
  a.box(X0, YB - 30, zt, X1, YB, Z1);                                                          // back splash
  const sw = W / n;
  for (let i = 0; i < n; i++) {
    const x = X0 + sw * (i + 0.5);
    a.box(x - sw * 0.38, YF + D * 0.18, zt, x + sw * 0.38, YF + D * 0.18 + 8, zt + 40); a.ellp(x, YF + D * 0.45, sw * 0.36, D * 0.28, 'EQUIP-DETAIL');
    a.tube([[x, YB - 60, zt], [x, YB - 60, zt + 380], [x, YB - 200, zt + 440]], [20, 18, 16], 10);        // spout
    a.box(x - 10, YB - 36, zt + 150, x + 10, YB - 30, zt + 230);
    a.box(x - 60, YF + 30, Z0 + 120, x + 60, YF + 70, Z0 + 200);                               // knee panel
    a.ycyl(YF, YF + 30, x, Z0 + 160, 24, 10); a.circ(x, YF + 15, 24, 'EQUIP-DETAIL');
  }
  if (v.shield) { a.box(X0, YF + 10, zt + 700, X1, YF + 24, Z1); a.box(X0, YF + 10, zt + 680, X1, YF + 24, zt + 700); }
  a.line(X0, YF + D * 0.18, X1, YF + D * 0.18, 'EQUIP-DETAIL');
  a.log(`Added the apron cabinet, the sloped trough deck with ${n} basin${n > 1 ? 's' : ''}, tall gooseneck spouts, knee panels with round pushers and a back splash${v.shield ? ' and a splash shield' : ''} (plan and 3D).`);
}

function kickbucket(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  if (v.rack) {
    a.box(cx - 220, cy - 220, Z0 + 70, cx + 220, cy + 220, Z0 + 100); star(a, cx, cy, Z0 + 40, Math.min(W, D) / 2 - 40, 4, 40, 70);
    a.cyl(cx, cy, Z0 + 100, Z1 - 20, 20, 12);
    for (let i = 0; i < v.rack; i++) { const z = Z1 - 60 - i * 160; a.ell(cx, cy, z, 160, 160, 12, 18, 3); a.circ(cx, cy, 160, 'EQUIP-DETAIL'); a.xcyl(cx - 160, cx + 160, cy, z, 10, 8); }
    a.log(`Added the cross base on casters, the centre post and ${v.rack} rings with cross bars for sponge buckets (plan and 3D).`); return;
  }
  const r = Math.min(W, D) / 2 - 20;
  for (const g of [0.8, 2.37, 3.94, 5.5]) { a.caster(cx + Math.cos(g) * r * 0.7, cy + Math.sin(g) * r * 0.7, 80); }
  a.cone(cx, cy, Z0 + 80, Z1 - 20, r * 0.8, r, 24); a.cyl(cx, cy, Z1 - 20, Z1, r, 24); a.circ(cx, cy, r); a.circ(cx, cy, r * 0.82, 'EQUIP-DETAIL');
  if (v.handle) { a.tube([[cx + r * 0.9, cy, Z0 + 200], [cx + r * 1.0, cy, Z1 - 60]], [10, 10], 8); }
  a.log('Added the round bucket body, rim, and four casters (plan and 3D).');
}

function step(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const n = v.steps, rise = (Z1 - Z0 - 60) / n;
  for (let i = 0; i < n; i++) { const ya = YF + (D * i) / n, yb = YF + (D * (i + 1)) / n, z1 = Z0 + 30 + rise * (i + 1); a.box(X0 + 10, ya, z1 - 25, X1 - 10, yb, z1); a.box(X0 + 10, ya, Z0 + 30, X1 - 10, ya + 14, z1 - 25); a.line(X0 + 10, yb, X1 - 10, yb, 'EQUIP-DETAIL'); for (let k = 1; k < 5; k++) a.line(X0 + 10 + ((W - 20) * k) / 5, ya + 20, X0 + 10 + ((W - 20) * k) / 5, yb - 20, 'EQUIP-DETAIL'); }
  for (const x of [X0 + 30, X1 - 30]) { a.box(x - 12, YF + 20, Z0 + 20, x + 12, YB - 20, Z0 + 50); }
  for (let i = 0; i < 4; i++) { const x = i < 2 ? X0 + 40 : X1 - 40, y = i % 2 ? YB - 40 : YF + 40; a.cyl(x, y, Z0, Z0 + 20, 22, 8); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
  if (v.rail) for (const x of [X0 + 20, X1 - 20]) { a.box(x - 10, YB - 50, Z0 + 30, x + 10, YB - 30, Z1 + 0); }
  a.log(`Added ${n} stepped platforms with a ribbed edge line, side rails under the frame and rubber feet${v.rail ? ' and a back handrail' : ''} (plan and 3D).`);
}

function ringstand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  star(a, cx, cy, Z0 + 40, Math.min(W, D) / 2 - 30, 4, 40, 90);
  a.cyl(cx, cy, Z0 + 74, Z0 + 400, 40, 12); a.cyl(cx, cy, Z0 + 400, Z1 - 150, 25, 12);
  const n = v.rings; for (let i = 0; i < n; i++) { const rr = v.r - i * 20, z = Z1 - 100 - i * 20; a.cone(cx, cy + i * 30, z - 140, z, rr * 0.7, rr, 24); a.tube([[cx, cy, z - 120 - (n - 1 - i) * 0], [cx, cy + i * 30, z - 140]], [20, 20], 8); a.circ(cx, cy + i * 30, rr, i ? 'EQUIP-DETAIL' : 'EQUIP'); }
  a.log(`Added the cross base on casters, the telescoping post and ${n} basin ring${n > 1 ? 's' : ''} (plan and 3D).`);
}

function mastcart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0 + 20, YF + 30, Z0 + 70, X1 - 20, YB - 30, Z0 + 140);
  for (const x of [X0 + 70, X1 - 70]) for (const y of [YF + 70, YB - 70]) { a.caster(x, y, 100); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
  a.box(cx - 50, YB - 90, Z0 + 140, cx + 50, YB - 20, Z1 - 50);
  for (let i = 0; i < v.screens; i++) { const sx = cx + (i - (v.screens - 1) / 2) * (W / v.screens); screenBox(a, sx - W / v.screens / 2 + 25, Z1 - (v.sh ?? 480), sx + W / v.screens / 2 - 25, Z1 - 20, YB - 90, 40); }
  a.box(cx - W * 0.4, YF + 100, Z0 + 700, cx + W * 0.4, YB - 100, Z0 + 740);                  // shelf
  if (v.cpu) { a.box(cx - 230, YF + 120, Z0 + 140, cx + 230, YB - 120, Z0 + 620); a.rect(cx - 230, YF + 120, cx + 230, YB - 120, 'EQUIP-DETAIL'); }
  a.rect(cx - W * 0.4, YF + 100, cx + W * 0.4, YB - 100, 'EQUIP-DETAIL');
  a.log(`Added the wheeled base, the mast, a shelf, ${v.cpu ? 'a closed equipment housing, ' : ''}and ${v.screens} display screen${v.screens > 1 ? 's' : ''} (plan and 3D).`);
}

function ceilarm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.cyl(X0 + 200, YB - 200, Z1 - 40, Z1, 160, 20); a.cyl(X0 + 200, YB - 200, Z1 - 600, Z1 - 40, 60, 14);
  const sx = X1 - Math.max(W * 0.3, 350) - 20;
  a.box(X0 + 200, YB - 260, Z1 - 650, sx, YB - 140, Z1 - 560);
  a.cyl(sx, YB - 200, Z1 - 1000, Z1 - 650, 40, 12);
  a.box(sx - 300, YB - 240, Z1 - 1050, sx + 300, YB - 160, Z1 - 1000);
  a.box(sx - 30, YB - 280, Z1 - 1060, sx + 30, YB - 120, Z1 - 1000);
  if (v.arms > 1) { a.box(sx - 350, YB - 220, Z1 - 650, sx + 350, YB - 180, Z1 - 610); }
  const mz = Z0;
  screenBox(a, sx - W * 0.3, mz + 20, sx + W * 0.3, mz + (v.mh ?? 520), YB - 200, 50);
  a.line(X0 + 200, YB - 200, sx, YB - 200, 'EQUIP-DETAIL'); a.rect(sx - W * 0.3, YB - 250, sx + W * 0.3, YB - 200, 'EQUIP-DETAIL');
  a.log(`Added the ceiling drum, the horizontal arm, the drop column with a swivel yoke and a wide monitor${v.arms > 1 ? ' on a second cross arm' : ''} (plan and 3D).`);
}

const SURGICAL = [
  fam({ cat: SU, title: 'Generic operating room table', desc: (v) => `Floor-standing table with a base plate, a two-stage column, a carriage and ${v.secs ?? 4} padded top sections with side accessory rails${v.legDrop ? ' and a lowered leg section' : ''}${v.headrest ? ' and a head rest' : ''}.`,
    vs: [['four-section top, 24 in wide, 80 in long', 24, 80, 40, 0, { secs: 4, deck: 880 }], ['four-section, 28 in wide, with head rest', 30, 84, 44, 0, { secs: 4, headrest: true, deck: 900 }], ['five-section, 24 in wide, 90 in long', 26, 94, 40, 0, { secs: 5, deck: 880 }], ['bariatric, 32 in wide, 84 in long', 40, 88, 44, 0, { secs: 4, topw: 0.8, deck: 940 }], ['short child size, 20 in wide, 60 in long', 24, 64, 36, 0, { secs: 3, deck: 780 }], ['leg section lowered, 24 in wide', 26, 84, 40, 0, { secs: 4, legDrop: true, deck: 900 }]], build: optable }),
  fam({ cat: SU, title: 'Generic operating room ceiling light', desc: (v) => `Ceiling-mounted surgical lamp with a drum plate, ${v.heads > 1 ? 'horizontal arms, ' : ''}${v.heads} spring arm${v.heads > 1 ? 's' : ''} and round heads of ${v.hd / IN} in with a ring of lenses and a centre handle.`,
    vs: [['one head, 22 in', 26, 26, 36, 78, { heads: 1, hd: 22 * IN }], ['one head, 28 in', 32, 32, 38, 76, { heads: 1, hd: 28 * IN }], ['two heads, 22 in each', 56, 28, 36, 78, { heads: 2, hd: 22 * IN }], ['two heads, 28 in each', 70, 34, 38, 76, { heads: 2, hd: 28 * IN }], ['three heads, 20 in each', 66, 56, 36, 78, { heads: 3, hd: 20 * IN }], ['two heads, 32 in each, wide track', 80, 38, 40, 74, { heads: 2, hd: 32 * IN }]], build: slight }),
  fam({ cat: SU, title: 'Generic anaesthesia machine cart', desc: (v) => `Wheeled cart with a work surface and raised lip, ${v.drawers} drawers, ${v.cyl ?? 2} gas cylinders on the back, a post-mounted monitor and flow dials.`,
    vs: [['two drawers, 30 x 28 in', 30, 28, 60, 0, { drawers: 2, topz: 900 }], ['three drawers, 32 x 30 in', 32, 30, 64, 0, { drawers: 3, topz: 920 }], ['four drawers, three cylinders, 34 x 30 in', 34, 30, 66, 0, { drawers: 4, cyl: 3, topz: 940 }]], build: anaes }),
  fam({ cat: SU, title: 'Generic operating room Mayo-type tray stand', desc: 'Instrument tray stand with a U-shaped base on three casters, a single post and a shallow tray with a raised edge.',
    vs: [['tray 16 x 12 in, 36 in high', 16, 24, 36, 0, {}], ['tray 20 x 16 in, 40 in high', 20, 28, 40, 0, {}], ['tray 24 x 16 in, 44 in high', 24, 28, 44, 0, {}], ['large tray 30 x 20 in, 44 in high', 30, 32, 44, 0, {}]], build: mayo }),
  fam({ cat: SU, title: 'Generic operating room back table', desc: (v) => `Stainless-style instrument table with a sheet top${v.rim ? ' and raised rim' : ''}, an under-shelf, apron rails and ${v.casters ? 'four casters' : 'four legs'}.`,
    vs: [['48 x 24 in, on casters', 48, 24, 36, 0, { casters: true }], ['60 x 30 in, on casters, raised rim', 60, 30, 36, 0, { casters: true, rim: 25 }], ['72 x 30 in, on casters', 72, 30, 36, 0, { casters: true, shelfz: 260 }], ['36 x 24 in, on legs', 36, 24, 34, 0, {}], ['84 x 30 in, on legs, raised rim', 84, 30, 36, 0, { rim: 25 }]], build: backtable }),
  fam({ cat: SU, title: 'Generic operating room equipment boom', desc: (v) => `Ceiling-hung boom with a drum plate, ${v.arms} horizontal arm${v.arms > 1 ? 's' : ''} and drop columns carrying ${v.type === 'service' ? 'service heads with a grid of round outlet faces' : v.type === 'monitor' ? 'a wide monitor' : 'a service head and a monitor'}.`,
    vs: [['one arm, service head', 64, 36, 56, 52, { arms: 1, type: 'service', hh: 700 }], ['two arms, service heads', 100, 36, 56, 52, { arms: 2, type: 'service', hh: 700 }], ['one arm, monitor', 70, 28, 48, 60, { arms: 1, type: 'monitor', hh: 600 }], ['two arms, service head and monitor', 100, 36, 56, 52, { arms: 2, type: 'mixed', hh: 700 }]], build: sboom }),
  fam({ cat: SU, title: 'Generic sterile case cart', desc: (v) => cartDesc(`closed side and back panels, ${v.doors} front doors with bar pulls and a top deck`),
    vs: [['two doors, 36 x 24 in', 36, 24, 68, 0, { doors: 2 }], ['two doors, 48 x 28 in', 48, 28, 72, 0, { doors: 2 }], ['one door, 24 x 24 in', 24, 24, 68, 0, { doors: 1 }], ['open sides, 36 x 24 in', 36, 24, 68, 0, { doors: 0, open: true }]],
    build: (a, v) => { cart(a, { solid: !v.open, shelves: 3, doors: v.doors, handle: true, handleH: 0, caster: 120 }); a.log(`Added the wheeled body${v.open ? ' with open wire sides' : ' with closed panels'}${v.doors ? `, ${v.doors} door${v.doors > 1 ? 's' : ''} with pulls` : ''} and a push handle (plan and 3D).`); } }),
  fam({ cat: SU, title: 'Generic operating room scrub trough', desc: (v) => `Wall-backed scrub trough with an apron cabinet, a sloped deck with ${v.stations} basin${v.stations > 1 ? 's' : ''}, tall gooseneck spouts, knee panels with round pushers and a back splash${v.shield ? ' and a splash shield' : ''}.`,
    vs: [['one station, 36 in', 36, 24, 62, 0, { stations: 1 }], ['two stations, 66 in', 66, 24, 62, 0, { stations: 2 }], ['three stations, 96 in, splash shield', 96, 26, 74, 0, { stations: 3, shield: true }], ['two stations, 72 in, splash shield', 72, 26, 74, 0, { stations: 2, shield: true }]], build: scrub }),
  fam({ cat: SU, title: 'Generic operating room bucket and sponge stand', desc: (v) => v.rack ? `Cross-base stand on casters with a centre post and ${v.rack} rings for buckets.` : 'Round bucket with a rim and four casters.',
    vs: [['kick bucket, 16 in round', 16, 16, 15, 0, {}], ['kick bucket with handle, 18 in round', 20, 18, 22, 0, { handle: true }], ['sponge stand, two rings', 24, 24, 44, 0, { rack: 2 }], ['sponge stand, three rings', 26, 26, 54, 0, { rack: 3 }]], build: kickbucket }),
  fam({ cat: SU, title: 'Generic operating room step platform', desc: (v) => `Stepped platform with ${v.steps} treads, rubber feet${v.rail ? ' and a back handrail' : ''}.`,
    vs: [['two steps, 24 x 20 in', 24, 20, 14, 0, { steps: 2 }], ['two steps with handrail, 28 x 24 in', 28, 24, 36, 0, { steps: 2, rail: true }]], build: step }),
  fam({ cat: SU, title: 'Generic operating room basin ring stand', desc: (v) => `Cross-base stand on casters with a telescoping post and ${v.rings} basin ring${v.rings > 1 ? 's' : ''}.`,
    vs: [['single ring, 36 in high', 22, 22, 36, 0, { rings: 1, r: 190 }], ['double ring, 40 in high', 26, 26, 40, 0, { rings: 2, r: 190 }], ], build: ringstand }),
  fam({ cat: SU, title: 'Generic operating room monitor stand', desc: (v) => `Wheeled stand with a mast, a shelf${v.cpu ? ', a closed equipment housing' : ''} and ${v.screens} display screen${v.screens > 1 ? 's' : ''}.`,
    vs: [['one screen, 24 in wide', 28, 28, 60, 0, { screens: 1 }], ['two screens with housing, 40 in wide', 40, 28, 64, 0, { screens: 2, cpu: true }], ['one wide screen with housing, 34 in', 34, 28, 66, 0, { screens: 1, cpu: true, sh: 560 }]], build: mastcart }),
  fam({ cat: SU, title: 'Generic operating room ceiling monitor arm', desc: (v) => `Ceiling drum with a horizontal arm, a drop column with a swivel yoke and a wide monitor${v.arms > 1 ? ' on a second cross arm' : ''}.`,
    vs: [['one arm, 40 in monitor', 60, 24, 60, 52, { arms: 1, mh: 560 }], ['two arms, 50 in monitor', 76, 24, 66, 48, { arms: 2, mh: 640 }], ['one arm, 32 in monitor', 50, 22, 54, 56, { arms: 1, mh: 440 }]], build: ceilarm }),
];

// ===== IMAGING ==========================================================================================================================
/** A ring in the x-z plane (axis along y): centre (cx, cz), radii r0..r1, between y0 and y1. */
function ringY(a, cx, cz, r0, r1, y0, y1, n = 28) {
  for (let i = 0; i < n; i++) {
    const g0 = (i / n) * Math.PI * 2, g1 = ((i + 1) / n) * Math.PI * 2;
    const P = (r, g, y) => [cx + Math.cos(g) * r, y, cz + Math.sin(g) * r];
    hexa(a, [P(r0, g0, y0), P(r1, g0, y0), P(r1, g1, y0), P(r0, g1, y0)], [P(r0, g0, y1), P(r1, g0, y1), P(r1, g1, y1), P(r0, g1, y1)]);
  }
}
function arcTube(a, cx, cz, r, g0, g1, y, tr, n = 14) { const pts = []; for (let i = 0; i <= n; i++) { const g = ((g0 + ((g1 - g0) * i) / n) * Math.PI) / 180; pts.push([cx + Math.cos(g) * r, y, cz + Math.sin(g) * r]); } a.tube(pts, pts.map(() => tr), 8); }

function ctscan(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const R = Math.min(W / 2 - 40, (Z1 - Z0) / 2 - 20), rb = v.bore / 2, zc = Z0 + (Z1 - Z0) * 0.56 + 40 > Z1 - R ? Z1 - R : Z0 + (Z1 - Z0) * 0.56 + 40, gd = v.gd;
  const y1 = YB - 60, y0 = y1 - gd;
  ringY(a, cx, zc, rb, R, y0, y1); ringY(a, cx, zc, rb, rb + 25, y0 - 40, y0); ringY(a, cx, zc, R * 0.97, R, y0 - 30, y0);
  a.box(cx - R * 0.8, y0 + 30, Z0 + 40, cx + R * 0.8, y1, zc - R * 0.7);                       // base housing
  for (const x of [cx - R * 0.7, cx + R * 0.7]) a.box(x - 80, y0 + 30, Z0, x + 80, y1, Z0 + 40);
  a.box(cx - R * 0.3, y0, zc + R, cx + R * 0.3, y1, zc + R + 20 > Z1 ? Z1 : zc + R + 20);
  a.circ(cx, a.cy, 0.1, 'EQUIP-DETAIL'); a.rect(cx - R, y0, cx + R, y1, 'EQUIP'); a.line(cx - rb, y0, cx + rb, y0, 'EQUIP-DETAIL'); a.line(cx - rb, y1, cx + rb, y1, 'EQUIP-DETAIL');
  const tz = Z0 + (v.tz ?? 750);
  a.box(cx - 400, y0 - 200, Z0 + 60, cx + 400, y0 - 700, tz - 120);                            // table pedestal
  a.box(cx - 450, y0 - 750, Z0, cx + 450, y0 - 200, Z0 + 60);
  a.box(cx - 220, YF + 30, tz - 80, cx + 220, y0 + 200, tz); a.box(cx - 200, YF + 30, tz, cx + 200, y0 + 200, tz + 30);   // couch
  a.rect(cx - 220, YF + 30, cx + 220, y0 + 200, 'EQUIP-DETAIL'); a.rect(cx - 450, y0 - 750, cx + 450, y0 - 200, 'EQUIP-HIDDEN');
  screenBox(a, cx + R * 0.35, zc + R * 0.4 - 80, cx + R * 0.35 + 220, zc + R * 0.4 + 70, y0 - 40, 30);
  a.log(`Added the ring gantry with a ${Math.round(v.bore / 10)} cm bore, the base housing and feet, a couch on a pedestal reaching into the bore, and a status display (plan and 3D).`);
}

function mriscan(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const R = Math.min(W / 2 - 40, (Z1 - Z0) / 2 - 40), rb = v.bore / 2, zc = Z0 + R + 220 + 40;
  const y1 = YB - 30, y0 = y1 - v.len;
  ringY(a, cx, zc, R * 0.97, R, y0 + 200, y1, 30);                                             // magnet shell
  ringY(a, cx, zc, rb, R, y0 + 150, y0 + 200, 30); ringY(a, cx, zc, rb, rb + 20, y0 + 200, y1, 30); ringY(a, cx, zc, rb + 20, R * 0.97, y1 - 40, y1, 30);
  ringY(a, cx, zc, rb, rb + 140, y0, y0 + 150, 30); ringY(a, cx, zc, rb + 130, rb + 150, y0, y0 + 150, 30);                  // front flare
  a.box(cx - R * 0.6, y0 + 200, Z0 + 40, cx + R * 0.6, y1, zc - R * 0.8);
  a.box(cx - R * 0.8, y0 + 160, Z0, cx - R * 0.5, y1, Z0 + 60); a.box(cx + R * 0.5, y0 + 160, Z0, cx + R * 0.8, y1, Z0 + 60);
  a.rect(cx - R, y0, cx + R, y1, 'EQUIP'); a.line(cx - rb, y0, cx - rb, y1, 'EQUIP-DETAIL'); a.line(cx + rb, y0, cx + rb, y1, 'EQUIP-DETAIL');
  const tz = Z0 + 800;
  a.box(cx - 380, y0 - 600, Z0 + 60, cx + 380, y0 - 100, tz - 140); a.box(cx - 420, y0 - 650, Z0, cx + 420, y0 - 80, Z0 + 60);
  a.box(cx - 270, YF + 30, tz - 100, cx + 270, y0 + 500, tz); a.box(cx - 250, YF + 30, tz, cx + 250, y0 + 500, tz + 30);
  a.rect(cx - 270, YF + 30, cx + 270, y0 + 500, 'EQUIP-DETAIL');
  a.log(`Added the long barrel shell with a ${Math.round(v.bore / 10)} cm bore and a flared front, the cradle feet and a couch on a pedestal (plan and 3D).`);
}

function tubestand(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const rl = v.rail;
  if (v.floor) { a.box(cx - 150, YF + 60, Z0, cx + 150, YB - 60, Z0 + 60); a.box(cx - 60, YB - 150, Z0 + 60, cx + 60, YB - 60, Z1 - 120); }
  for (const x of [cx - W * 0.4, cx + W * 0.4]) { a.box(x - 40, YF, Z1 - 120, x + 40, YB, Z1); a.line(x, YF, x, YB, 'EQUIP-DETAIL'); }      // ceiling rails
  a.box(cx - W * 0.4, a.cy - 120, Z1 - 200, cx + W * 0.4, a.cy + 120, Z1 - 120);              // cross carriage
  const cz = Z1 - 200, sec = v.stages;
  for (let i = 0; i < sec; i++) { const rr = 90 - i * 14; a.cyl(cx, a.cy, Z0 + v.drop + (i * (cz - Z0 - v.drop - 300)) / sec * 0 , cz - (i * (cz - Z0 - v.drop - 300)) / sec, rr, 14); }
  a.box(cx - 180, a.cy - 180, Z0 + v.drop, cx + 180, a.cy + 180, Z0 + v.drop + 300);          // tube head
  a.box(cx - 150, a.cy - 150, Z0 + v.drop - 90, cx + 150, a.cy + 150, Z0 + v.drop);            // collimator
  a.box(cx - 190, a.cy - 150, Z0 + v.drop + 80, cx - 150, a.cy + 150, Z0 + v.drop + 240);
  a.circ(cx, a.cy, 180, 'EQUIP-DETAIL'); a.rect(cx - 180, a.cy - 180, cx + 180, a.cy + 180, 'EQUIP-DETAIL');
  a.log(`Added two ceiling rails, the cross carriage, a ${sec}-stage telescopic column, the tube head and the collimator box (plan and 3D).`);
}

function bucky(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YF + D * 0.2, Z0, X1, YB, Z0 + 60);
  for (const x of [cx - W * 0.3, cx + W * 0.3]) a.box(x - 40, YB - 130, Z0 + 60, x + 40, YB - 40, Z1 - 20);
  a.box(cx - W * 0.4, YB - 130, Z1 - 60, cx + W * 0.4, YB - 40, Z1);
  const pz = Z0 + v.pz, ph = v.ph;
  a.box(cx - W * 0.36, YB - 250, pz, cx + W * 0.36, YB - 130, pz + ph);                        // detector carriage
  a.box(cx - W * 0.3, YB - 262, pz + 50, cx + W * 0.3, YB - 250, pz + ph - 50); a.rect(cx - W * 0.3, YB - 262, cx + W * 0.3, YB - 250, 'EQUIP-DETAIL');
  for (let i = 0; i < 3; i++) a.xcyl(cx - W * 0.2, cx + W * 0.2, YB - 270, pz + ph * (0.25 + i * 0.25), 6, 6);   // grip bars
  if (v.pad) a.box(cx - 300, YF + 40, Z0 + 60, cx + 300, YF + D * 0.2, Z0 + 150);
  a.rect(cx - W * 0.36, YB - 250, cx + W * 0.36, YB - 130, 'EQUIP-DETAIL');
  a.log(`Added the floor plate, two uprights, the top rail, the sliding detector carriage with grip bars${v.pad ? ' and a foot platform' : ''} (plan and 3D).`);
}

function carm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  casters4(a, 110, 110, 130);
  a.box(X0 + 60, YB - D * 0.55, Z0 + 130, X1 - 60, YB - 40, Z0 + 520);                         // base cabinet
  a.rect(X0 + 60, YB - D * 0.55, X1 - 60, YB - 40, 'EQUIP-DETAIL');
  a.box(cx - 70, YB - D * 0.4, Z0 + 520, cx + 70, YB - D * 0.4 + 120, Z0 + 1050);             // column
  const zc = Z0 + (Z1 - Z0) * 0.58, R = v.r, yc = YB - D * 0.4 + 60;
  a.box(cx - 90, yc - 90, zc - 90, cx + 90, yc + 90, zc + 90);
  arcTube(a, cx, zc, R, 150, 390, yc - 40, 34, 18); arcTube(a, cx, zc, R, 150, 390, yc + 40, 34, 18);
  const sx = cx + Math.cos((90 * Math.PI) / 180) * R, sz = zc + R;
  a.box(cx - 140, yc - 130, zc + R - 130, cx + 140, yc + 130, zc + R + 130 > Z1 ? Z1 : zc + R + 130);      // detector at top
  a.box(cx - 90, yc - 100, zc - R - 90, cx + 90, yc + 100, zc - R + 100);                      // source at bottom
  a.cyl(cx, yc, zc + 80, zc + R - 130, 18, 8);
  a.circ(cx, yc, 140, 'EQUIP-DETAIL'); a.rect(cx - 140, yc - 130, cx + 140, yc + 130, 'EQUIP-DETAIL');
  if (v.tower) { a.box(X1 + 0 - 520, YF + 60, Z0 + 130, X1 - 40, YF + 560, Z0 + 1100); screenBox(a, X1 - 500, Z0 + 800, X1 - 60, Z0 + 1400 > Z1 ? Z1 : Z0 + 1400, YF + 60, 40); }
  a.log(`Added the casters, the cabinet, the column, the C-shaped double arc with a detector at one end and a source at the other${v.tower ? ', and a separate monitor tower' : ''} (plan and 3D).`);
}

function mobxray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  for (const x of [X0 + 120, X1 - 120]) { wheel(a, x, YB - D * 0.3, v.wr, 60); a.caster(x, YF + 120, 130); }
  a.box(X0 + 90, YF + 60, Z0 + 150, X1 - 90, YB - 60, Z0 + 750);                               // body
  a.box(X0 + 70, YF + 40, Z0 + 750, X1 - 70, YB - 40, Z0 + 800);
  a.rect(X0 + 90, YF + 60, X1 - 90, YB - 60, 'EQUIP-DETAIL');
  a.tube([[cx, YB - 120, Z0 + 800], [cx, YB - 120, Z1 - 350]], [60, 50], 12);              // mast
  a.box(cx - 40, YB - 160, Z1 - 380, cx + 40, YF + 120, Z1 - 320);                              // boom
  a.box(cx - 140, YF + 100, Z1 - 520, cx + 140, YF + 340, Z1 - 200);                           // tube head
  a.box(cx - 120, YF + 100, Z1 - 580, cx + 120, YF + 340, Z1 - 520);
  a.box(cx - W * 0.3, YB - 20, Z0 + 800, cx + W * 0.3, YB, Z0 + 1050); a.xcyl(cx - W * 0.3, cx + W * 0.3, YB + 0 - 12, Z0 + 1050, 14, 8);   // push handle
  a.line(cx, YB - 120, cx, YF + 120, 'EQUIP-DETAIL'); a.rect(cx - 140, YF + 100, cx + 140, YF + 340, 'EQUIP-DETAIL');
  a.log(`Added the wheeled body with two rear wheels and two front casters, the mast, a horizontal boom, the tube head with collimator and a rear push handle (plan and 3D).`);
}

function uscart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  casters4(a, 55, 55, 110);
  a.box(X0 + 20, YF + 40, Z0 + 110, X1 - 20, YB - 40, Z0 + 170);
  a.box(X0 + 50, YB - 360, Z0 + 170, X1 - 50, YB - 60, Z0 + 650);                              // equipment housing
  a.rect(X0 + 50, YB - 360, X1 - 50, YB - 60, 'EQUIP-DETAIL');
  a.box(X0 + 20, YF + 40, Z0 + 700, X1 - 20, YB - 380, Z0 + 740);                              // keyboard shelf
  for (let i = 0; i < 7; i++) a.box(X0 + 70 + i * ((W - 140) / 7), YF + 60, Z0 + 740, X0 + 70 + i * ((W - 140) / 7) + 36, YF + 300, Z0 + 755);
  a.box(cx - 25, YB - 120, Z0 + 650, cx + 25, YB - 60, Z0 + 1000);
  screenBox(a, cx - W * 0.4, Z0 + 920, cx + W * 0.4, Z1 - 20, YB - 120, 50);
  for (let i = 0; i < v.probes; i++) { const x = X0 + 70 + i * 90; a.cyl(x, YB - 400, Z0 + 650, Z0 + 760, 28, 10); }
  for (const x of [X0 + 30, X1 - 30]) a.box(x - 12, YB - 36, Z0 + 740, x + 12, YB - 12, Z0 + 900);
  a.xcyl(X0 + 30, X1 - 30, YB - 24, Z0 + 900, 14, 8);
  a.log(`Added the casters, the equipment housing, a keyboard shelf, ${v.probes} probe holder cups, a monitor on a post and a rear handle (plan and 3D).`);
}

function mammo(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0 + 30, YF + D * 0.45, Z0, X1 - 30, YB - 30, Z0 + 100);
  a.box(cx - 150, YB - D * 0.45, Z0 + 100, cx + 150, YB - 120, Z1 - 200);                      // column
  a.box(cx - 200, YF + 120, Z0 + 1150, cx + 200, YB - D * 0.45, Z1 - 100);                     // arm head (tube side)
  a.box(cx - 220, YF + 60, Z0 + 1000, cx + 220, YF + 130, Z0 + 1250);                           // compression paddle housing
  a.box(cx - 220, YF + 60, Z0 + 650, cx + 220, YF + 190, Z0 + 700);                            // detector plate
  a.box(cx - 140, YB - D * 0.45, Z0 + 700, cx + 140, YF + 190, Z0 + 1000);
  a.box(cx - 220, YF + 100, Z0 + 700, cx + 220, YF + 130, Z0 + 1000);
  screenBox(a, cx - W * 0.3, Z0 + 1300, cx + W * 0.3, Z0 + 1300 + v.mh, YB - 120, 40);
  a.rect(cx - 220, YF + 60, cx + 220, YF + 190, 'EQUIP-DETAIL'); a.rect(cx - 150, YB - D * 0.45, cx + 150, YB - 120, 'EQUIP-DETAIL');
  a.log('Added the floor plate, the column, the C-shaped arm with a source head, a compression plate housing, a detector plate and a display (plan and 3D).');
}

function leadscreen(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + (v.feet ? 90 : 120);
  for (const x of [X0 + 40, X1 - 40]) { if (v.feet) { a.box(x - 40, YF, Z0, x + 40, YB, Z0 + 60); a.rect(x - 40, YF, x + 40, YB, 'EQUIP-HIDDEN'); } else { a.caster(x, a.cy, 120); a.box(x - 40, YF, Z0 + 120, x + 40, YB, Z0 + 170); } }
  a.box(X0 + 20, YF + D * 0.35, zb, X0 + 70, YB - D * 0.35, Z1); a.box(X1 - 70, YF + D * 0.35, zb, X1 - 20, YB - D * 0.35, Z1);
  a.box(X0 + 20, YF + D * 0.35, Z1 - 60, X1 - 20, YB - D * 0.35, Z1); a.box(X0 + 20, YF + D * 0.35, zb, X1 - 20, YB - D * 0.35, zb + 60);
  a.box(X0 + 70, YF + D * 0.4, zb + 60, X1 - 70, YB - D * 0.4, Z1 - 60);                       // lead panel
  if (v.win) a.frame(cx - v.win / 2, zb + (Z1 - zb) * 0.55, cx + v.win / 2, zb + (Z1 - zb) * 0.55 + 380, YF + D * 0.35 - 6, YB - D * 0.35 + 6, 30);
  a.rect(X0 + 20, YF + D * 0.35, X1 - 20, YB - D * 0.35, 'EQUIP');
  a.log(`Added the frame, the lead-core panel${v.win ? ' with a framed viewing window' : ''}, ${v.feet ? 'two floor feet' : 'two casters on cross bars'} and a top rail (plan and 3D).`);
}

function shdoor(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline('EQUIP-HIDDEN');
  const fw = 110;
  a.box(X0, YF, Z0, X0 + fw, YB, Z1); a.box(X1 - fw, YF, Z0, X1, YB, Z1); a.box(X0 + fw, YF, Z1 - fw, X1 - fw, YB, Z1);
  const dw = W - 2 * fw - 12, dx0 = X0 + fw + 6, dz0 = Z0 + 10, dz1 = Z1 - fw - 6;
  if (v.slide) {
    a.box(dx0 + (v.open ? dw * 0.6 : 0), YB - 90, dz0, dx0 + (v.open ? dw * 0.6 : 0) + dw, YB - 40, dz1);
    a.box(X0 + fw, YB - 130, Z1 - fw - 10, X1 - fw, YB - 80, Z1 - 20); a.rect(dx0 + (v.open ? dw * 0.6 : 0), YB - 90, dx0 + (v.open ? dw * 0.6 : 0) + dw, YB - 40);
    a.line(X0 + fw, YB - 105, X1 - fw, YB - 105, 'EQUIP-DETAIL');
  } else {
    a.box(dx0, YB - 80, dz0, dx0 + dw, YB - 20, dz1); a.rect(dx0, YB - 80, dx0 + dw, YB - 20);
    a.line(dx0, YB - 80, dx0, YB - 80 - dw, 'EQUIP-SWING'); a.arc(dx0, YB - 80, dw, 90, 180); a.clear('door swing', dx0, YB - 80 - dw, dx0 + dw, YB - 80, 80);
    for (const z of [dz0 + 300, (dz0 + dz1) / 2, dz1 - 300]) a.box(dx0 - 4, YB - 100, z - 60, dx0 + 20, YB - 80, z + 60);
  }
  const hx = v.slide ? dx0 + (v.open ? dw * 0.6 : 0) + dw - 120 : dx0 + dw - 100;
  a.box(hx - 8, YB - 130, (dz0 + dz1) / 2 - 150, hx + 8, YB - 90, (dz0 + dz1) / 2 + 150);   // pull handle
  if (v.view) { const wx = (v.slide ? dx0 + (v.open ? dw * 0.6 : 0) : dx0) + dw * 0.5; a.frame(wx - 150, dz0 + (dz1 - dz0) * 0.55, wx + 150, dz0 + (dz1 - dz0) * 0.55 + 450, YB - 94, YB - 36, 30); }
  a.rect(X0, YF, X0 + fw, YB, 'EQUIP'); a.rect(X1 - fw, YF, X1, YB, 'EQUIP');
  a.log(`Added the frame with head, jambs and sill, ${v.slide ? 'a sliding door leaf on a top track' : 'a swinging door leaf with three hinges and a swing arc'}, a pull handle${v.view ? ' and a framed viewing window' : ''} (plan and 3D).`);
}

function radtable(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zt = Z1 - 60;
  a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + W * 0.1, YF + D * 0.2, Z0 + 60, X1 - W * 0.1, YB - D * 0.2, Z0 + 240);
  a.box(cx - 200, a.cy - 200, Z0 + 240, cx + 200, a.cy + 200, zt - 140);
  a.box(X0 + 20, YF + 40, zt - 140, X1 - 20, YB - 40, zt - 60);
  a.box(X0 + 10, YF + 20, zt - 60, X1 - 10, YB - 20, zt); a.box(X0 + 50, YF + 40, zt, X1 - 50, YB - 40, zt + 60);
  for (const x of [X0 + 6, X1 - 6]) a.box(x - 6, YF + 60, zt - 40, x + 6, YB - 60, zt - 20);
  a.box(X0 + 60, YB - D * 0.35, zt - 150, X1 - 60, YB - D * 0.35 + 160, zt - 140);
  if (v.bucky) { a.box(X0 + 90, a.cy - 250, zt - 200, X1 - 90, a.cy + 250, zt - 140); a.rect(X0 + 90, a.cy - 250, X1 - 90, a.cy + 250, 'EQUIP-HIDDEN'); }
  a.rect(X0 + 50, YF + 40, X1 - 50, YB - 40, 'EQUIP-DETAIL');
  a.log(`Added the floor frame, the base cover, the column, the side rails and a flat padded top${v.bucky ? ' with a detector tray under it' : ''} (plan and 3D).`);
}

function aprons(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const n = v.n;
  if (v.floor) { a.box(X0, YF, Z0, X1, YB, Z0 + 60); a.box(X0 + 10, YF + 10, Z0 + 60, X0 + 60, YB - 10, Z1); a.box(X1 - 60, YF + 10, Z0 + 60, X1 - 10, YB - 10, Z1); }
  else a.box(X0, YB - 40, Z1 - 150, X1, YB, Z1);
  a.box(X0 + 10, YF + D * 0.2, Z1 - 80, X1 - 10, YB - D * 0.2, Z1 - 30);
  const pitch = (W - 160) / n;
  for (let i = 0; i < n; i++) { const x = X0 + 80 + pitch * (i + 0.5); a.box(x - 12, YF + D * 0.2 + 10, Z1 - 110, x + 12, YB - D * 0.2 - 10, Z1 - 80); a.box(x - pitch * 0.34, YB - D * 0.5 - 8, Z1 - 1000 > Z0 ? Z1 - 1000 : Z0, x + pitch * 0.34, YB - D * 0.5 + 8, Z1 - 110); a.rect(x - pitch * 0.34, YB - D * 0.5 - 8, x + pitch * 0.34, YB - D * 0.5 + 8, 'EQUIP-DETAIL'); }
  a.log(`Added the ${v.floor ? 'floor stand with two end posts' : 'wall mounting bar'}, a hanging rail with ${n} hangers and ${n} flat apron shapes (plan and 3D).`);
}

function pano(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0 + 30, YB - D * 0.45, Z0, X1 - 30, YB - 30, Z0 + 80);
  a.box(cx - 120, YB - D * 0.4, Z0 + 80, cx + 120, YB - 80, Z1 - 350);
  a.box(cx - 100, YB - D * 0.4 - 30, Z1 - 350, cx + 100, YB - 60, Z1 - 250);
  a.box(cx - W * 0.45, YB - D * 0.4 - 120, Z1 - 330, cx + W * 0.45, YB - D * 0.4 - 40, Z1 - 150);       // rotating arm
  a.box(cx - W * 0.45, YB - D * 0.4 - 220, Z1 - 700, cx - W * 0.45 + 160, YB - D * 0.4 - 40, Z1 - 150);
  a.box(cx + W * 0.45 - 160, YB - D * 0.4 - 220, Z1 - 700, cx + W * 0.45, YB - D * 0.4 - 40, Z1 - 150);
  a.box(cx - 80, YF + 100, Z0 + v.bite, cx + 80, YF + 220, Z0 + v.bite + 100);                    // chin rest
  a.cyl(cx, YF + 160, Z0 + 150, Z0 + v.bite, 30, 10);
  a.circ(cx, a.cy, W * 0.45, 'EQUIP-DETAIL'); a.rect(cx - W * 0.45, YB - D * 0.4 - 220, cx + W * 0.45, YB - D * 0.4 - 40, 'EQUIP-DETAIL');
  a.log('Added the floor plate, the column, the rotating arm with a source head at one end and a detector at the other, and a chin rest on a post (plan and 3D).');
}

function console_(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  tbl(a, { topT: 40, base: 'panels', drawers: 0 });
  const zt = Z0 + 740;
  const n = v.screens;
  for (let i = 0; i < n; i++) { const w = (W - 200) / n, x0 = X0 + 100 + i * w; a.box(x0 + w / 2 - 25, YB - 160, zt, x0 + w / 2 + 25, YB - 100, zt + 160); screenBox(a, x0 + 15, zt + 140, x0 + w - 15, Z1 - 20, YB - 120, 40); }
  for (let i = 0; i < 4; i++) a.box(X0 + 120 + i * 60, YF + 160, zt, X0 + 150 + i * 60, YF + 320, zt + 10);
  a.box(cx - 200, YF + 100, zt, cx + 200, YF + 300, zt + 14); a.rect(cx - 200, YF + 100, cx + 200, YF + 300, 'EQUIP-DETAIL');
  a.log(`Added the panel-ended desk with ${n} monitor${n > 1 ? 's' : ''}, a keyboard and a control pad (plan and 3D).`);
}

function viewbox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YB - D, Z0, X1, YB, Z1);
  const n = v.panels, pw = (W - 80) / n;
  for (let i = 0; i < n; i++) { const x0 = X0 + 40 + i * pw; a.frame(x0 + 8, Z0 + 60, x0 + pw - 8, Z1 - 60, YF - 4, YF + 8, 14); a.box(x0 + 22, YF - 8, Z0 + 74, x0 + pw - 22, YF, Z1 - 74); a.rect(x0 + 8, YF - 4, x0 + pw - 8, YF + 8, 'EQUIP-DETAIL'); }
  a.log(`Added the wall-mounted housing with ${n} framed light panel${n > 1 ? 's' : ''} for film sheets (plan and 3D).`);
}

const IMAGING = [
  fam({ cat: IM, title: 'Generic imaging suite ring scanner', desc: (v) => `Ring-shaped scanner gantry with a ${Math.round(v.bore / 10)} cm round bore, a base housing, a couch on a pedestal reaching into the bore and a status display.`,
    vs: [['70 cm bore, short gantry', 120, 150, 82, 0, { bore: 700, gd: 650 }], ['78 cm bore', 126, 156, 84, 0, { bore: 780, gd: 750 }], ['85 cm bore, deep gantry', 132, 160, 86, 0, { bore: 850, gd: 900 }], ['90 cm bore, wide-bore', 138, 164, 88, 0, { bore: 900, gd: 950, tz: 800 }]], build: ctscan }),
  fam({ cat: IM, title: 'Generic imaging suite barrel scanner', desc: (v) => `Long barrel scanner shell with a ${Math.round(v.bore / 10)} cm bore and a flared front, cradle feet and a couch on a pedestal.`,
    vs: [['60 cm bore, 160 cm long', 90, 176, 86, 0, { bore: 600, len: 1600 }], ['70 cm bore, 150 cm long, wide', 100, 168, 90, 0, { bore: 700, len: 1500 }], ['70 cm bore, 180 cm long', 100, 192, 90, 0, { bore: 700, len: 1800 }]], build: mriscan }),
  fam({ cat: IM, title: 'Generic radiography ceiling tube stand', desc: (v) => `Ceiling-rail tube support with two rails, a cross carriage, a ${v.stages}-stage telescopic column, a tube head and a collimator box${v.floor ? ', with a floor-fixed column beside it' : ''}.`,
    vs: [['two-stage column, 140 x 90 in', 140, 90, 108, 0, { stages: 2, rail: 1, drop: 950 }], ['three-stage column, 160 x 100 in', 160, 100, 108, 0, { stages: 3, rail: 1, drop: 700 }], ['three-stage column, 180 x 90 in, floor column', 180, 90, 108, 0, { stages: 3, rail: 1, drop: 700, floor: true }]], build: tubestand }),
  fam({ cat: IM, title: 'Generic radiography wall stand', desc: (v) => `Floor plate with two uprights and a top rail carrying a sliding detector carriage with grip bars${v.pad ? ' and a foot platform' : ''}.`,
    vs: [['detector 17 x 17 in, 80 in tall', 30, 24, 80, 0, { pz: 450, ph: 500 }], ['detector 14 x 17 in, 84 in tall', 28, 24, 84, 0, { pz: 500, ph: 440 }], ['with foot platform, 36 x 30 in', 36, 30, 84, 0, { pz: 500, ph: 500, pad: true }]], build: bucky }),
  fam({ cat: IM, title: 'Generic mobile C-arm', desc: (v) => `Mobile unit on casters with a cabinet, a column and a C-shaped double arc carrying a detector at one end and a source at the other${v.tower ? ', plus a separate monitor tower' : ''}.`,
    vs: [['small gap, 40 x 30 in', 40, 30, 70, 0, { r: 380 }], ['standard gap, 48 x 32 in', 48, 32, 78, 0, { r: 430 }], ['large gap, 54 x 34 in', 54, 34, 84, 0, { r: 500 }], ['standard with monitor tower, 66 x 34 in', 66, 34, 78, 0, { r: 430, tower: true }]], build: carm }),
  fam({ cat: IM, title: 'Generic mobile radiography unit', desc: 'Wheeled body with two rear wheels and two front casters, a mast, a horizontal boom with a tube head and collimator, and a rear push handle.',
    vs: [['compact, 26 x 52 in', 26, 52, 80, 0, { wr: 150 }], ['standard, 30 x 56 in', 30, 56, 86, 0, { wr: 170 }], ['tall mast, 32 x 58 in', 32, 58, 92, 0, { wr: 190 }]], build: mobxray }),
  fam({ cat: IM, title: 'Generic ultrasound exam cart', desc: (v) => `Cart on casters with an equipment housing, a keyboard shelf, ${v.probes} probe cups, a monitor on a post and a rear handle.`,
    vs: [['two probe cups, 22 x 32 in', 22, 32, 60, 0, { probes: 2 }], ['three probe cups, 24 x 34 in', 24, 34, 62, 0, { probes: 3 }], ['four probe cups, 26 x 36 in', 26, 36, 64, 0, { probes: 4 }], ['one probe cup, compact, 20 x 28 in', 20, 28, 58, 0, { probes: 1 }]], build: uscart }),
  fam({ cat: IM, title: 'Generic breast imaging stand', desc: 'Floor stand with a column, a C-shaped arm with a source head, a compression plate housing and a detector plate, and a display on the column.',
    vs: [['compact, 36 x 54 in', 36, 54, 76, 0, { mh: 260 }], ['standard, 40 x 58 in', 40, 58, 80, 0, { mh: 330 }], ['tall, 44 x 62 in', 44, 62, 84, 0, { mh: 330 }]], build: mammo }),
  fam({ cat: IM, title: 'Generic imaging room lead screen', desc: (v) => `Floor screen with a frame, a lead-core panel${v.win ? ' and a framed viewing window' : ''} on ${v.feet ? 'two floor feet' : 'casters'}.`,
    vs: [['24 in wide, 72 in high, feet', 24, 14, 72, 0, { feet: true }], ['36 in wide, 72 in high, window, casters', 36, 16, 74, 0, { win: 500 }], ['48 in wide, 72 in high, window, casters', 48, 18, 74, 0, { win: 700 }], ['30 in wide, 60 in high, feet', 30, 14, 60, 0, { feet: true, win: 400 }]], build: leadscreen }),
  fam({ cat: IM, title: 'Generic shielded imaging room door', desc: (v) => `Shielded door in a frame with head, jambs and sill, ${v.slide ? 'a sliding leaf on a top track' : 'a swinging leaf with three hinges and a swing arc'}, a pull handle${v.view ? ' and a framed viewing window' : ''}.`,
    vs: [['single swing, 42 x 84 in', 48, 6, 90, 0, {}], ['single swing, viewing window, 48 x 84 in', 54, 6, 90, 0, { view: true }], ['sliding leaf, closed, 48 x 84 in', 54, 6, 90, 0, { slide: true }], ['sliding leaf, viewing window, 60 x 84 in', 66, 6, 90, 0, { slide: true, view: true, slide2: 1 }]], build: shdoor }),
  fam({ cat: IM, title: 'Generic radiography table', desc: (v) => `Floor-standing table with a base cover, a column, side rails and a flat padded top${v.bucky ? ' with a detector tray under it' : ''}.`,
    vs: [['fixed top, 28 x 84 in', 28, 84, 36, 0, {}], ['with detector tray, 30 x 88 in', 30, 88, 38, 0, { bucky: true }], ['wide, 34 x 90 in', 34, 90, 38, 0, { bucky: true }]], build: radtable }),
  fam({ cat: IM, title: 'Generic imaging room apron rack', desc: (v) => `${v.floor ? 'Floor stand with end posts' : 'Wall mounting bar'} and a hanging rail with ${v.n} hangers and ${v.n} flat apron shapes.`,
    vs: [['wall mounted, 4 hangers, 36 in', 36, 12, 48, 0, { n: 4 }], ['wall mounted, 6 hangers, 54 in', 54, 12, 48, 0, { n: 6 }], ['floor stand, 4 hangers, 36 in', 36, 18, 72, 0, { n: 4, floor: true }], ['floor stand, 8 hangers, 72 in', 72, 18, 72, 0, { n: 8, floor: true }]], build: aprons }),
  fam({ cat: IM, title: 'Generic panoramic dental imaging stand', desc: 'Floor stand with a column and a rotating arm with a source head at one end and a detector at the other, and a chin rest on a post.',
    vs: [['compact, 36 x 48 in', 36, 48, 84, 0, { bite: 1100 }], ['standard, 40 x 52 in', 40, 52, 88, 0, { bite: 1200 }], ['tall, 44 x 56 in', 44, 56, 92, 0, { bite: 1250 }]], build: pano }),
  fam({ cat: IM, title: 'Generic imaging control desk', desc: (v) => `Panel-ended desk with ${v.screens} monitor${v.screens > 1 ? 's' : ''}, a keyboard and a control pad.`,
    vs: [['one monitor, 48 x 30 in', 48, 30, 54, 0, { screens: 1 }], ['two monitors, 72 x 30 in', 72, 30, 54, 0, { screens: 2 }], ['three monitors, 96 x 32 in', 96, 32, 54, 0, { screens: 3 }]], build: console_ }),
  fam({ cat: IM, title: 'Generic film viewing light box', desc: (v) => `Wall-mounted housing with ${v.panels} framed light panel${v.panels > 1 ? 's' : ''} for film sheets.`,
    vs: [['one panel, 20 x 18 in', 20, 4, 18, 54, { panels: 1 }], ['two panels, 40 x 18 in', 40, 4, 18, 54, { panels: 2 }], ], build: viewbox }),
];

// ===== LABORATORY =======================================================================================================================
function bottles(a, x0, x1, y, z, n, r, h) { for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * (i + 0.5)) / n; a.cyl(x, y, z, z + h, r, 8); a.cyl(x, y, z + h, z + h + 12, r * 0.5, 6); } }

function labbench(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  const zt = Z0 + 900;
  cab(a, { doors: v.doors, drawers: v.drawers, drawerCols: v.cols ?? 1, drawerH: v.drawerH, toe: 100, topT: 38, pull: 'bar', swing: false });
  a.box(X0 - 0, YF, zt - 38, X1, YB, zt);
  a.rect(X0, YF, X1, YB, 'EQUIP');
  if (v.riser) {
    for (const x of [X0 + 40, cx, X1 - 40]) a.box(x - 20, YB - 180, zt, x + 20, YB - 140, Z1);
    for (const z of [zt + 360, zt + 700]) { a.box(X0 + 20, YB - 240, z, X1 - 20, YB - 60, z + 22); bottles(a, X0 + 100, X1 - 100, YB - 150, z + 22, Math.max(3, Math.round(W / 220)), 40, 150); }
    a.rect(X0 + 20, YB - 240, X1 - 20, YB - 60, 'EQUIP-DETAIL');
  }
  if (v.sink) { a.box(cx - 220, YF + 100, zt - 90, cx + 220, YF + 450, zt); a.ellp(cx, YF + 275, 190, 150, 'EQUIP-DETAIL'); a.tube([[cx, YB - 60, zt], [cx, YB - 60, zt + 300], [cx, YB - 200, zt + 340]], [18, 18, 14], 10); }
  a.log(`Added the base cabinet${v.doors ? ' with doors' : ''}${v.drawers ? ' and drawers' : ''}, a slab top${v.riser ? ', a reagent riser with two shelves and bottles' : ''}${v.sink ? ' and an inset sink with a tall spout' : ''} (plan and 3D).`);
}

function fumehood(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + 760;
  a.box(X0, YF + 60, Z0 + 90, X1, YB, zb - 40); a.box(X0 + 20, YF + 40, Z0, X1 - 20, YF + 100, Z0 + 90);
  const L = W / v.doors; for (let i = 0; i < v.doors; i++) { a.box(X0 + i * L + 8, YF + 20, Z0 + 100, X0 + (i + 1) * L - 8, YF + 60, zb - 50); pull(a, 'bar', X0 + i * L + L / 2, zb - 160, YF + 20); a.line(X0 + i * L, YF + 60, X0 + i * L, YF + 20, 'EQUIP-DETAIL'); }
  a.box(X0, YF, zb - 40, X1, YB, zb);                                                          // work surface
  a.box(X0, YB - 40, zb, X0 + 70, YB, Z1 - 250); a.box(X1 - 70, YB - 40, zb, X1, YB, Z1 - 250);   // enclosure sides
  a.box(X0, YF + 30, zb, X0 + 70, YB - 40, Z1 - 250); a.box(X1 - 70, YF + 30, zb, X1, YB - 40, Z1 - 250);
  a.box(X0, YF + 30, Z1 - 330, X1, YB, Z1 - 250);                                              // head
  a.box(X0 + 70, YB - 60, zb, X1 - 70, YB - 40, Z1 - 330);                                     // baffle back
  a.frame(X0 + 70, zb + 120, X1 - 70, Z1 - 330, YF + 10, YF + 34, 34);                         // sash frame
  a.box(X0 + 100, YF + 18, zb + 150, X1 - 100, YF + 26, Z1 - 360); a.box(X0 + 70, YF + 6, zb + 120, X1 - 70, YF + 34, zb + 150);
  a.box(cx - 24, YF, zb + 400, cx + 24, YF + 12, zb + 700);
  a.box(X0 + 30, YF + 30, Z1 - 250, X1 - 30, YB - 30, Z1 - 150);                                // exhaust plenum
  a.cyl(cx, a.cy, Z1 - 150, Z1, 150, 24); a.circ(cx, a.cy, 150, 'EQUIP-DETAIL');
  a.rect(X0 + 70, YF + 30, X1 - 70, YB - 40, 'EQUIP-DETAIL'); a.line(X0 + 70, YF + 18, X1 - 70, YF + 18, 'EQUIP-DETAIL');
  a.box(X1 - 160, YF + 4, zb + 160, X1 - 80, YF + 34, zb + 260);                                // airflow monitor
  a.log(`Added the base cabinet with ${v.doors} doors, the work surface, enclosure sides, a framed sash with a pull, the exhaust plenum and round duct collar (plan and 3D).`);
}

function centrifuge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const zb = Z0 + (v.feet ?? 20);
  for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { a.cyl(x, y, Z0, zb, 22, 8); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
  const bh = Z1 - zb - (v.lid ?? 120);
  a.box(X0, YF, zb, X1, YB, zb + bh);
  const R = Math.min(W, D) * 0.4, zr = zb + bh;
  a.box(X0, YF, zr, X1, YB, zr + 20); a.box(X0, YF, zr + 20, X0 + 30, YB, Z1); a.box(X1 - 30, YF, zr + 20, X1, YB, Z1); a.box(X0, YF, zr + 20, X1, YF + 30, Z1); a.box(X0, YB - 30, zr + 20, X1, YB, Z1);
  a.cyl(cx, cy, zr + 20, zr + 40, R * 0.95, 24); a.cyl(cx, cy, zr + 40, zr + 60, 40, 12);        // chamber bowl and spindle
  for (let i = 0; i < v.slots; i++) { const g = (i / v.slots) * Math.PI * 2; a.box(cx + Math.cos(g) * R * 0.65 - 24, cy + Math.sin(g) * R * 0.65 - 24, zr + 40, cx + Math.cos(g) * R * 0.65 + 24, cy + Math.sin(g) * R * 0.65 + 24, zr + 100); }
  if (v.lid !== 0) a.box(X0, YB - 40, zr + 20, X1, YB, Z1);
  a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 0.65, 'EQUIP-DETAIL'); a.circ(cx, cy, 40, 'EQUIP-DETAIL');
  screenBox(a, X0 + 60, zb + bh * 0.25, X0 + 60 + W * 0.3, zb + bh * 0.25 + 150, YF + 2, 20);
  for (let i = 0; i < 2; i++) dial(a, X1 - 120 - i * 90, YF, zb + bh * 0.35, 28, -1);
  a.log(`Added the housing on rubber feet, an open lid bowl showing a ${v.slots}-bucket rotor with spindle, a control panel with display and two knobs (plan and 3D).`);
}

function analyser(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + (v.stand ?? 0);
  if (v.stand) { for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { a.caster(x, y, 100); a.circ(x, y, 24, 'EQUIP-HIDDEN'); } a.box(X0 + 20, YF + 20, Z0 + 100, X1 - 20, YB - 20, zb); a.box(X0 + 40, YF, Z0 + 130, X1 - 40, YF + 20, zb - 30); a.line(X0 + 40, YF + 20, X1 - 40, YF + 20, 'EQUIP-DETAIL'); }
  const bh = Z1 - zb - v.hscreen;
  a.box(X0 + 10, YF + 30, zb, X1 - 10, YB, zb + bh);
  a.box(X0 + 30, YF, zb + bh * 0.3, X1 - 30, YF + 30, zb + bh * 0.7);                           // sample drawer
  a.box(cx - 150, YF - 0, zb + bh * 0.5 - 20, cx + 150, YF + 30, zb + bh * 0.5 + 20);
  for (let i = 0; i < v.slots; i++) a.box(X0 + 70 + i * ((W - 140) / v.slots), YF + 40, zb + bh * 0.7, X0 + 70 + i * ((W - 140) / v.slots) + 40, YF + 90, zb + bh * 0.7 + 120);
  a.box(cx - 40, YB - 60, zb + bh, cx + 40, YB - 20, Z1 - 40);
  screenBox(a, cx - W * 0.3, Z1 - v.hscreen, cx + W * 0.3, Z1 - 10, YB - 30, 36);
  a.rect(X0 + 70, YF + 40, X1 - 70, YF + 90, 'EQUIP-DETAIL'); a.rect(X0 + 10, YF + 30, X1 - 10, YB, 'EQUIP-DETAIL');
  a.log(`Added the analyser housing${v.stand ? ' on a wheeled stand with a drawer front' : ''}, a sample drawer, ${v.slots} tube holders, a handle and a screen on a post (plan and 3D).`);
}

function bsc(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const sz = Z0 + 760;
  a.box(X0 + 20, YF + 40, Z0, X1 - 20, YB - 40, Z0 + 60); for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 100, YB - 100]) a.box(x - 30, y - 30, Z0 + 60, x + 30, y + 30, sz - 30);
  a.box(X0 + 30, YF + 40, sz - 30, X1 - 30, YB - 40, sz);                                      // frame top
  a.box(X0, YF + 20, sz, X1, YB, sz + 60);                                                     // work tray
  a.box(X0, YB - 40, sz + 60, X0 + 60, YB, Z1 - 380); a.box(X1 - 60, YB - 40, sz + 60, X1, YB, Z1 - 380);
  a.box(X0, YB - 60, sz + 60, X1, YB, Z1 - 380);
  a.box(X0, YF + 20, sz + 60, X0 + 60, YB, Z1 - 380); a.box(X1 - 60, YF + 20, sz + 60, X1, YB, Z1 - 380);
  a.box(X0, YF + 20, sz + 60, X1, YF + 60, sz + 200);                                          // front grille
  for (let i = 0; i < 12; i++) a.box(X0 + 70 + i * ((W - 140) / 12), YF + 14, sz + 80, X0 + 70 + i * ((W - 140) / 12) + 20, YF + 20, sz + 190);
  a.frame(X0 + 40, sz + 220, X1 - 40, Z1 - 380, YF + 10, YF + 34, 36); a.box(X0 + 76, YF + 18, sz + 256, X1 - 76, YF + 26, Z1 - 416);
  a.box(X0, YF + 20, Z1 - 380, X1, YB, Z1 - 260);                                              // head
  a.box(X0 + 80, YB - 360, Z1 - 260, X1 - 80, YB - 40, Z1);                                     // filter and exhaust housing
  a.cyl(cx, YB - 200, Z1 - 10, Z1 + 0, 1, 4);
  screenBox(a, X1 - 260, Z1 - 370, X1 - 80, Z1 - 270, YF + 10, 18);
  a.rect(X0 + 40, YF + 20, X1 - 40, YF + 60, 'EQUIP-DETAIL'); a.rect(X0 + 80, YB - 360, X1 - 80, YB - 40, 'EQUIP-DETAIL');
  a.log(`Added the stand, the tray with a front grille, the enclosure with a sloped-looking framed sash, the head, the filter housing on top and a display (plan and 3D).`);
}

function labinc(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + (v.legs ?? 120);
  for (const x of [X0 + 50, X1 - 50]) for (const y of [YF + 50, YB - 50]) { a.cyl(x, y, Z0, zb, 24, 8); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
  const n = v.units, uh = (Z1 - zb) / n;
  for (let i = 0; i < n; i++) {
    const z0 = zb + i * uh;
    a.box(X0, YF + 40, z0, X1, YB, z0 + uh - 6);
    a.box(X0 + 14, YF, z0 + 14, X1 - 14, YF + 40, z0 + uh - 20);
    a.frame(X0 + 40, z0 + 40, X1 - 40, z0 + uh - 46, YF - 4, YF, 24);
    a.box(X0 + 64, YF - 3, z0 + 64, X1 - 64, YF - 1, z0 + uh - 70);
    a.box(X1 - 40, YF - 20, z0 + uh * 0.35, X1 - 24, YF, z0 + uh * 0.65);
    screenBox(a, X0 + 40, z0 + uh - 40 + 0, X0 + 40 + W * 0.25, z0 + uh - 10, YF + 40, 1);
  }
  a.rect(X0 + 14, YF, X1 - 14, YF + 40, 'EQUIP-DETAIL');
  a.log(`Added the legs, ${n} chamber${n > 1 ? 's' : ''} each with a framed glass inner door, a handle and a control strip (plan and 3D).`);
}

function freezer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  if (v.chest) {
    const zb = Z0 + 100;
    for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) { a.caster(x, y, 100); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
    a.box(X0, YF, zb, X1, YB, Z1 - 120);
    a.box(X0 - 0, YF, Z1 - 120, X1, YB, Z1 - 70); a.box(X0 + 20, YF + 20, Z1 - 70, X1 - 20, YB - 20, Z1);                // lid and raised centre
    if (v.lids === 2) a.line(cx, YF, cx, YB, 'EQUIP-DETAIL');
    for (const x of v.lids === 2 ? [X0 + W * 0.25, X0 + W * 0.75] : [cx]) a.box(x - 120, YF - 20, Z1 - 100, x + 120, YF, Z1 - 80);
    a.box(X0 + 60, YB - 24, Z1 - 120, X0 + 160, YB, Z1 - 40); a.box(X1 - 160, YB - 24, Z1 - 120, X1 - 60, YB, Z1 - 40);
    a.rect(X0 + 20, YF + 20, X1 - 20, YB - 20, 'EQUIP-DETAIL');
    a.log(`Added the casters, the chest body, a ${v.lids === 2 ? 'two-part ' : ''}lid with hinges and handle${v.lids === 2 ? 's' : ''} (plan and 3D).`); return;
  }
  const zb = Z0 + 80;
  for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) { a.cyl(x, y, Z0, zb, 24, 8); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
  a.box(X0, YF + 60, zb, X1, YB, Z1);
  const dn = v.doors, dw = W / dn;
  for (let i = 0; i < dn; i++) {
    const x0 = X0 + i * dw + 6, x1 = X0 + (i + 1) * dw - 6;
    a.box(x0, YF, zb + 80, x1, YF + 60, Z1 - 60); a.box(i % 2 ? x0 + 20 : x1 - 56, YF - 20, zb + (Z1 - zb) * 0.35, i % 2 ? x0 + 36 : x1 - 40, YF, zb + (Z1 - zb) * 0.65); a.box(i % 2 ? x0 + 20 : x1 - 80, YF - 6, zb + (Z1 - zb) * 0.5 - 40, i % 2 ? x0 + 60 : x1 - 20, YF, zb + (Z1 - zb) * 0.5 + 40);
    a.line(x0, YF + 60, x0, YF, 'EQUIP-DETAIL');
  }
  screenBox(a, X0 + 40, Z1 - 55, X1 - 40, Z1 - 10, YF + 60, 20);
  a.rect(X0, YF, X1, YF + 60, 'EQUIP-DETAIL');
  a.log(`Added the feet, the cabinet and ${dn} insulated door${dn > 1 ? 's' : ''} with handles, locks and a temperature display strip (plan and 3D).`);
}

function specart(a, v) {
  const r = cart(a, { shelves: v.shelves, caster: 110, lip: 30, handle: true, handleH: 0 });
  const { X0, X1, YF, YB, Z0, Z1 } = a; 
  for (let s = 0; s < v.shelves; s++) { const z = r.zb + 30 + ((r.top - r.zb - 60) * s) / v.shelves + 14; for (let i = 0; i < v.racks; i++) { const x0 = X0 + 40 + i * ((X1 - X0 - 80) / v.racks); a.box(x0, YF + 50, z, x0 + (X1 - X0 - 80) / v.racks - 20, YB - 90, z + 20); for (let k = 0; k < 4; k++) for (let m = 0; m < 3; m++) a.cyl(x0 + 30 + k * 35, YF + 90 + m * ((YB - YF - 240) / 3), z + 20, z + 120, 11, 6); } }
  a.log(`Added the casters, the shelves with lips, ${v.racks} tube rack${v.racks > 1 ? 's' : ''} per shelf with upright tubes, and a push handle (plan and 3D).`);
}

function waterbath(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const zb = Z0 + 24;
  for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) a.cyl(x, y, Z0, zb, 18, 8);
  a.box(X0, YF, zb, X1, YB, Z1 - (v.shaker ? 100 : 60));
  if (v.shaker) { a.box(X0 + 30, YF + 30, Z1 - 100, X1 - 30, YB - 120, Z1 - 80); for (let i = 0; i < 5; i++) for (let k = 0; k < 3; k++) a.cyl(X0 + 90 + i * ((W - 180) / 4), YF + 80 + k * ((D - 330) / 2), Z1 - 80, Z1 - 20, 22, 10); a.rect(X0 + 30, YF + 30, X1 - 30, YB - 120, 'EQUIP-DETAIL'); }
  else { a.box(X0 + 20, YF + 20, Z1 - 60, X1 - 20, YB - 100, Z1 - 40); for (let i = 0; i < v.wells; i++) a.cyl(X0 + 80 + i * ((W - 160) / Math.max(1, v.wells - 1)), (YF + YB - 100) / 2, Z1 - 40, Z1 - 20, 40, 14); a.box(X0 + 10, YF + 10, Z1 - 20, X1 - 10, YB - 90, Z1); }
  a.box(X0, YB - 100, zb, X1, YB, Z1);
  screenBox(a, X0 + 50, Z1 - 80, X0 + 50 + W * 0.3, Z1 - 20, YB - 100, 20);
  dial(a, X1 - 110, YB - 100, Z1 - 50, 26, -1); dial(a, X1 - 200, YB - 100, Z1 - 50, 26, -1);
  a.rect(X0 + 20, YF + 20, X1 - 20, YB - 100, 'EQUIP-DETAIL');
  a.log(`Added the housing on feet, ${v.shaker ? 'a shaker platform with round flask clamps' : `a covered bath top with ${v.wells} round wells`}, a rear control strip with display and two knobs (plan and 3D).`);
}

function reagent(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline('EQUIP-HIDDEN');
  a.box(X0, YB - 24, Z0, X1, YB, Z1);
  const n = v.shelves;
  for (let i = 0; i < n; i++) { const z = Z0 + ((Z1 - Z0 - 24) * (i + 0.5)) / n; a.box(X0, YF, z, X1, YB - 24, z + 22); a.box(X0, YF, z + 22, X1, YF + 8, z + 70); bottles(a, X0 + 60, X1 - 60, YB - D * 0.4, z + 22, Math.round(W / 170), v.br, v.bh); }
  for (const x of [X0, X1 - 20]) a.box(x, YF, Z0, x + 20, YB - 24, Z1);
  a.rect(X0, YF, X1, YB, 'EQUIP'); 
  a.log(`Added the back panel, ${n} shelves with front rails and rows of round bottles, and two end plates (plan and 3D).`);
}

function microscope(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  tbl(a, { topT: 38, base: v.base ?? 'legs', shelf: undefined });
  const zt = Z0 + 740; const mx = cx;
  a.box(mx - 120, YF + 200, zt, mx + 120, YF + 420, zt + 40);                                  // microscope foot
  a.box(mx - 30, YF + 380, zt + 40, mx + 30, YF + 430, zt + 440);                              // arm
  a.tube([[mx, YF + 400, zt + 400], [mx, YF + 330, zt + 520]], [40, 30], 10);                  // head
  a.tube([[mx, YF + 330, zt + 520], [mx, YF + 250, zt + 560]], [24, 24], 10);                  // eyepiece tube
  a.box(mx - 100, YF + 240, zt + 200, mx + 100, YF + 400, zt + 230);                           // stage
  for (let i = 0; i < 3; i++) a.cyl(mx - 30 + i * 30, YF + 300, zt + 150, zt + 200, 14, 8);
  if (v.second) { const x2 = cx + W * 0.28; a.box(x2 - 150, YB - 250, zt, x2 + 150, YB - 90, zt + 20); screenBox(a, x2 - 200, zt + 40, x2 + 200, zt + 400, YB - 100, 30); }
  a.circ(mx, YF + 300, 100, 'EQUIP-DETAIL'); a.rect(mx - 120, YF + 200, mx + 120, YF + 420, 'EQUIP-DETAIL');
  a.log(`Added the table, a microscope with foot, arm, stage, objectives and eyepiece${v.second ? ' and a camera monitor' : ''} (plan and 3D).`);
}

function glovebox(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + 780;
  a.box(X0 + 20, YF + 60, Z0, X1 - 20, YB - 60, zb - 40); a.box(X0, YF, zb - 40, X1, YB, zb);   // stand
  const ch = Z1 - zb - 60;
  a.box(X0 + 20, YF + 20, zb, X1 - 20, YB, zb + 60); a.box(X0 + 20, YB - 20, zb + 60, X1 - 20, YB, zb + ch + 60); a.box(X0 + 20, YF + 20, zb + ch, X1 - 20, YB, zb + ch + 60);
  a.box(X0 + 20, YF + 20, zb + 60, X0 + 60, YB, zb + ch); a.box(X1 - 60, YF + 20, zb + 60, X1 - 20, YB, zb + ch);
  a.frame(X0 + 60, zb + 60, X1 - 60, zb + ch, YF + 14, YF + 34, 40);
  const gw = (W - 120) / v.ports;
  for (let i = 0; i < v.ports; i++) { const x = X0 + 60 + gw * (i + 0.5); a.ycyl(YF - 40, YF + 14, x, zb + 60 + (ch - 60) * 0.45, 70, 16); a.ycyl(YF - 90, YF - 40, x, zb + 60 + (ch - 60) * 0.45, 52, 14); a.circ(x, YF - 25, 70, 'EQUIP-DETAIL'); }
  if (v.ante) { a.cyl(X1 + 0 - 140, a.cy, zb + 60, zb + 60 + 300, 120, 20); a.circ(X1 - 140, a.cy, 120, 'EQUIP-DETAIL'); }
  a.box(cx - 120, YB - 60, zb + ch + 60, cx + 120, YB, Z1);
  a.rect(X0 + 20, YF + 14, X1 - 20, YB, 'EQUIP-DETAIL');
  a.log(`Added the stand, the sealed chamber with a framed window, ${v.ports} glove ports with sleeves${v.ante ? ', a round transfer chamber' : ''} and a filter box on top (plan and 3D).`);
}

function balance(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  const zt = Z0 + 800 > Z1 - 200 ? Z1 - 200 : Z0 + 800;
  for (const x of [X0 + 70, X1 - 70]) for (const y of [YF + 70, YB - 70]) { a.box(x - 40, y - 40, Z0 + 40, x + 40, y + 40, zt - 120); a.box(x - 50, y - 50, Z0, x + 50, y + 50, Z0 + 40); }
  a.box(X0 + 20, YF + 20, zt - 120, X1 - 20, YB - 20, zt - 60); a.box(X0, YF, zt - 60, X1, YB, zt);
  a.box(X0 + 90, YF + 90, Z0 + 260, X1 - 90, YB - 90, Z0 + 300); a.rect(X0 + 90, YF + 90, X1 - 90, YB - 90, 'EQUIP-HIDDEN');
  const bx = cx, hh = Z1 - zt;
  a.box(bx - 150, cy - 150, zt, bx + 150, cy + 150, zt + hh * 0.35);
  a.frame(bx - 140, zt + hh * 0.35, bx + 140, zt + hh * 0.35 + (hh * 0.65 - 20), cy - 150, cy + 150, 14);
  a.cyl(bx, cy, zt + hh * 0.35, zt + hh * 0.35 + 14, 55, 14);
  a.rect(bx - 150, cy - 150, bx + 150, cy + 150, 'EQUIP-DETAIL'); a.circ(bx, cy, 55, 'EQUIP-DETAIL');
  a.log('Added the four heavy piers, the slab top over a lower damping shelf, and a draft-shielded balance with a round pan (plan and 3D).');
}

const LAB = [
  fam({ cat: LB, title: 'Generic laboratory bench', desc: (v) => `Bench with a slab top on a toe-kick base with ${v.drawers ? `${v.drawers} drawers` : ''}${v.drawers && v.doors ? ' and ' : ''}${v.doors ? `${v.doors} doors` : ''}${v.riser ? ', a reagent riser with two shelves and bottles' : ''}${v.sink ? ' and an inset sink with a tall spout' : ''}.`,
    vs: [['wall bench, 48 in, doors', 48, 30, 36, 0, { doors: 2 }], ['wall bench, 72 in, drawers and doors', 72, 30, 36, 0, { doors: 2, drawers: 3, drawerH: 400, cols: 1 }], ['wall bench with reagent riser, 72 in', 72, 30, 84, 0, { doors: 2, drawers: 2, drawerH: 300, riser: true }], ['island bench, 96 in, drawers', 96, 42, 36, 0, { doors: 0, drawers: 4, drawerH: 700, cols: 2 }], ['sink bench, 60 in', 60, 30, 48, 0, { doors: 2, sink: true }], ['island bench, 120 in, riser and doors', 120, 54, 84, 0, { doors: 4, riser: true }]], build: labbench }),
  fam({ cat: LB, title: 'Generic laboratory fume hood', desc: (v) => `Bench-height fume hood with ${v.doors} base doors, a work surface, a framed sash with a pull, an exhaust plenum and a round duct collar.`,
    vs: [['4 ft wide', 48, 32, 108, 0, { doors: 2 }], ['5 ft wide', 60, 32, 108, 0, { doors: 2 }], ['6 ft wide', 72, 34, 112, 0, { doors: 3 }], ['8 ft wide', 96, 34, 112, 0, { doors: 4 }]], build: fumehood }),
  fam({ cat: LB, title: 'Generic laboratory centrifuge', desc: (v) => `Centrifuge housing on rubber feet with an open lid bowl showing a ${v.slots}-bucket rotor on a spindle, a control display and two knobs.`,
    vs: [['benchtop, 6 buckets, 18 x 22 in', 18, 22, 14, 0, { slots: 6 }], ['benchtop, 8 buckets, 24 x 28 in', 24, 28, 18, 0, { slots: 8 }], ['floor model, 12 buckets, 30 x 34 in', 30, 34, 36, 0, { slots: 12, feet: 60, lid: 140 }], ['compact micro model, 10 x 13 in', 10, 13, 9, 0, { slots: 6 }]], build: centrifuge }),
  fam({ cat: LB, title: 'Generic laboratory analyser', desc: (v) => `Analyser housing${v.stand ? ' on a wheeled stand' : ''} with a sample drawer, ${v.slots} tube holders and a screen on a post.`,
    vs: [['benchtop, 30 x 26 in', 30, 26, 32, 0, { slots: 4, hscreen: 250 }], ['benchtop, 40 x 28 in', 40, 28, 34, 0, { slots: 6, hscreen: 280 }], ['on stand, 36 x 30 in', 36, 30, 60, 0, { stand: 600, slots: 5, hscreen: 300 }], ['on stand, 48 x 32 in', 48, 32, 64, 0, { stand: 640, slots: 8, hscreen: 300 }]], build: analyser }),
  fam({ cat: LB, title: 'Generic laboratory biosafety cabinet', desc: 'Cabinet with a stand, a work tray with a front grille, an enclosure with a framed sash, a head, a filter housing on top and a display.',
    vs: [['3 ft wide', 36, 32, 90, 0, {}], ['4 ft wide', 48, 32, 90, 0, {}], ['5 ft wide', 60, 34, 92, 0, {}], ['6 ft wide', 72, 34, 92, 0, {}]], build: bsc }),
  fam({ cat: LB, title: 'Generic laboratory incubator', desc: (v) => `Incubator on legs with ${v.units} chamber${v.units > 1 ? 's' : ''} each with a framed glass inner door, a handle and a control strip.`,
    vs: [['single chamber, 24 x 24 in', 24, 24, 38, 0, { units: 1 }], ['single chamber, 30 x 28 in', 30, 28, 48, 0, { units: 1 }], ['double stack, 24 x 24 in', 24, 24, 60, 0, { units: 2 }]], build: labinc }),
  fam({ cat: LB, title: 'Generic laboratory freezer', desc: (v) => v.chest ? `Chest freezer on casters with ${v.lids === 2 ? 'a two-part lid' : 'a single lid'}, hinges and handles.` : `Upright freezer on feet with ${v.doors} insulated door${v.doors > 1 ? 's' : ''}, handles, locks and a temperature display strip.`,
    vs: [['upright, one door, 28 x 30 in', 28, 30, 78, 0, { doors: 1 }], ['upright, two doors, 56 x 32 in', 56, 32, 80, 0, { doors: 2 }], ['chest, one lid, 48 x 28 in', 48, 28, 36, 0, { chest: true, lids: 1 }], ['chest, two lids, 72 x 30 in', 72, 30, 36, 0, { chest: true, lids: 2 }]], build: freezer }),
  fam({ cat: LB, title: 'Generic laboratory specimen cart', desc: (v) => `Cart on casters with ${v.shelves} lipped shelves, ${v.racks} tube rack${v.racks > 1 ? 's' : ''} per shelf with upright tubes and a push handle.`,
    vs: [['two shelves, 24 x 18 in', 24, 18, 36, 0, { shelves: 2, racks: 2 }], ['three shelves, 30 x 20 in', 30, 20, 40, 0, { shelves: 3, racks: 2 }], ['three shelves, 36 x 22 in', 36, 22, 42, 0, { shelves: 3, racks: 3 }]], build: specart }),
  fam({ cat: LB, title: 'Generic laboratory water bath and shaker', desc: (v) => v.shaker ? 'Shaker housing on feet with a platform carrying round flask clamps and a rear control strip with display and two knobs.' : `Water bath housing on feet with a covered top with ${v.wells} round wells and a rear control strip.`,
    vs: [['water bath, 2 wells, 16 x 12 in', 16, 12, 8, 0, { wells: 2 }], ['water bath, 4 wells, 24 x 14 in', 24, 14, 9, 0, { wells: 4 }], ['orbital shaker, 20 x 20 in', 20, 20, 12, 0, { shaker: true }]], build: waterbath }),
  fam({ cat: LB, title: 'Generic laboratory reagent shelf unit', desc: (v) => `Wall shelf unit with a back panel, ${v.shelves} shelves with front rails, rows of round bottles and two end plates.`,
    vs: [['two shelves, 36 in', 36, 10, 24, 54, { shelves: 2, br: 40, bh: 150 }], ['three shelves, 48 in', 48, 10, 36, 48, { shelves: 3, br: 40, bh: 150 }], ['four shelves, 60 in', 60, 12, 48, 40, { shelves: 4, br: 45, bh: 170 }], ], build: reagent }),
  fam({ cat: LB, title: 'Generic laboratory microscope station', desc: (v) => `Work table with a microscope with foot, arm, stage, objectives and eyepiece${v.second ? ' and a camera monitor' : ''}.`,
    vs: [['table 48 in', 48, 28, 52, 0, {}], ['table 60 in with camera monitor', 60, 30, 56, 0, { second: true }], ['table 72 in with camera monitor', 72, 30, 56, 0, { second: true, base: 'panels' }]], build: microscope }),
  fam({ cat: LB, title: 'Generic laboratory glove box', desc: (v) => `Sealed chamber on a stand with a framed window, ${v.ports} glove ports with sleeves${v.ante ? ', a round transfer chamber' : ''} and a filter box on top.`,
    vs: [['two ports, 36 in', 36, 28, 66, 0, { ports: 2 }], ['two ports with transfer chamber, 48 in', 48, 28, 66, 0, { ports: 2, ante: true }], ['four ports, 72 in', 72, 30, 68, 0, { ports: 4 }]], build: glovebox }),
  fam({ cat: LB, title: 'Generic laboratory balance table', desc: 'Four-pier table with a slab top over a lower damping shelf, carrying a draft-shielded balance with a round pan.',
    vs: [['30 x 24 in', 30, 24, 54, 0, {}], ['36 x 28 in', 36, 28, 54, 0, {}], ['48 x 30 in', 48, 30, 56, 0, {}]], build: balance }),
  fam({ cat: LB, title: 'Generic laboratory slide and block cabinet', desc: (v) => `Tall cabinet with ${v.rows} shallow drawers each with a pull and a plinth.`,
    vs: [['10 drawers, 24 in wide', 24, 22, 48, 0, { rows: 10 }], ['16 drawers, 30 in wide', 30, 24, 60, 0, { rows: 16 }], ['20 drawers, 36 in wide', 36, 24, 66, 0, { rows: 20 }]],
    build: (a, v) => { cab(a, { drawers: v.rows, drawerCols: 1, toe: 90, pull: 'bar', topT: 30 }); a.log(`Added the plinth, the case, a top slab and ${v.rows} shallow drawers with pulls (plan and 3D).`); } }),
];

// ===== SUPPORT: sterile processing, pharmacy, supply ====================================================================================
function sterilizer(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + 120;
  a.box(X0 + 20, YF + 40, Z0, X1 - 20, YB - 20, zb);                                           // plinth
  a.box(X0, YF + 40, zb, X1, YB, Z1);
  const dw = W * 0.7, dz0 = zb + 160, dz1 = Z1 - 200, dcx = cx;
  if (v.round) { const rr = Math.min(dw, dz1 - dz0) / 2; a.ycyl(YF + 10, YF + 40, dcx, (dz0 + dz1) / 2, rr + 40, 28); a.ycyl(YF - 30, YF + 10, dcx, (dz0 + dz1) / 2, rr, 28); a.circ(dcx, YF - 10, rr, 'EQUIP-DETAIL'); for (let i = 0; i < 8; i++) { const g = (i / 8) * Math.PI * 2; a.ycyl(YF - 50, YF - 30, dcx + Math.cos(g) * (rr - 30), (dz0 + dz1) / 2 + Math.sin(g) * (rr - 30), 16, 8); } a.ycyl(YF - 100, YF - 30, dcx, (dz0 + dz1) / 2, 16, 8); a.xcyl(dcx - 110, dcx + 110, YF - 100, (dz0 + dz1) / 2, 14, 8); }
  else { a.frame(dcx - dw / 2 - 30, dz0 - 30, dcx + dw / 2 + 30, dz1 + 30, YF + 6, YF + 40, 30); a.box(dcx - dw / 2, YF - 30, dz0, dcx + dw / 2, YF + 6, dz1); a.box(dcx + dw / 2 - 90, YF - 70, (dz0 + dz1) / 2 - 150, dcx + dw / 2 - 60, YF - 30, (dz0 + dz1) / 2 + 150); a.rect(dcx - dw / 2, YF - 30, dcx + dw / 2, YF + 6, 'EQUIP-DETAIL'); }
  if (v.second) a.box(X0 + 10, YB - 30, zb + 160, X1 - 10, YB, Z1 - 200);                     // rear door of a pass-through
  screenBox(a, X0 + 60, Z1 - 170, X0 + 60 + W * 0.35, Z1 - 40, YF + 40, 24);
  for (let i = 0; i < 3; i++) a.box(X1 - 260 + i * 70, YF + 14, Z1 - 140, X1 - 220 + i * 70, YF + 40, Z1 - 100);
  a.rect(X0, YF + 40, X1, YB, 'EQUIP');
  a.log(`Added the plinth, the cabinet front with a ${v.round ? 'round chamber door with a ring of locking lugs and a handwheel' : 'framed rectangular chamber door with a long handle'}, a display and three buttons${v.second ? ' and a rear door of a pass-through unit' : ''} (plan and 3D).`);
}

function washerdis(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zb = Z0 + (v.under ? 80 : 120);
  for (const x of [X0 + 60, X1 - 60]) for (const y of [YF + 60, YB - 60]) { a.cyl(x, y, Z0, zb, 24, 8); a.circ(x, y, 24, 'EQUIP-HIDDEN'); }
  a.box(X0, YF + 30, zb, X1, YB, Z1);
  const dn = v.doors, dw = (W - 80) / dn;
  for (let i = 0; i < dn; i++) { const x0 = X0 + 40 + i * dw + 6, x1 = X0 + 40 + (i + 1) * dw - 6; a.frame(x0, zb + 100, x1, Z1 - 260, YF, YF + 30, 40); a.box(x0 + 40, YF + 10, zb + 140, x1 - 40, YF + 18, Z1 - 300); a.box((x0 + x1) / 2 - 150, YF - 24, Z1 - 330 + 0, (x0 + x1) / 2 + 150, YF, Z1 - 300); a.rect(x0, YF, x1, YF + 30, 'EQUIP-DETAIL'); }
  screenBox(a, X0 + 60, Z1 - 230, X0 + 60 + W * 0.3, Z1 - 60, YF + 30, 22);
  for (let i = 0; i < 3; i++) dial(a, X1 - 200 + i * 70, YF + 30, Z1 - 140, 24, -1);
  a.log(`Added the feet, the cabinet, ${dn} framed glass-panel door${dn > 1 ? 's' : ''} with pull bars, a display and three knobs (plan and 3D).`);
}

function insttray(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  trayBox(a, X0, YF, X1, YB, Z0, Z1 - (v.lid ? 30 : 0), 8);
  const nx = Math.round(W / 40), ny = Math.round(D / 40);
  for (let i = 1; i < nx; i++) for (let j = 1; j < ny; j += 2) a.rect(X0 + (W * i) / nx - 7, YF + (D * j) / ny - 7, X0 + (W * i) / nx + 7, YF + (D * j) / ny + 7, 'EQUIP-DETAIL');
  for (let i = 1; i < nx; i += 2) for (let j = 1; j < ny; j += 2) a.box(X0 + (W * i) / nx - 7, YF + (D * j) / ny - 7, Z0, X0 + (W * i) / nx + 7, YF + (D * j) / ny + 7, Z0 + 8);
  for (const x of [X0 + W * 0.3, X1 - W * 0.3]) { a.box(x - 25, YF - 20, Z1 - 60, x + 25, YF, Z1 - 20); a.box(x - 25, YB, Z1 - 60, x + 25, YB + 0, Z1 - 20); }
  for (let k = 0; k < v.dividers; k++) { const y = YF + (D * (k + 1)) / (v.dividers + 1); a.box(X0 + 8, y - 3, Z0, X1 - 8, y + 3, Z0 + (Z1 - Z0) * 0.7); a.line(X0, y, X1, y, 'EQUIP-DETAIL'); }
  if (v.lid) { a.box(X0 - 4, YF - 4, Z1 - 30, X1 + 4, YB, Z1); a.box(cx - 100, YF - 6, Z1 - 30, cx + 100, YF - 2, Z1 - 8); a.rect(X0 - 4, YF - 4, X1 + 4, YB, 'EQUIP-DETAIL'); }
  a.log(`Added the perforated tray walls and floor with drawn slots, end handles${v.dividers ? `, ${v.dividers} dividers` : ''}${v.lid ? ' and a lid' : ''} (plan and 3D).`);
}

function wirerack(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  if (v.casters) casters4(a, 50, 50, 110);
  const zb = Z0 + (v.casters ? 110 : 40);
  for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 24, YB - 24]) a.box(x - 14, y - 14, zb - (v.casters ? 0 : 40), x + 14, y + 14, Z1);
  const n = v.shelves;
  for (let i = 0; i < n; i++) {
    const z = zb + ((Z1 - zb - 40) * i) / n + 20;
    for (let k = 0; k <= 8; k++) a.box(X0 + 10 + (W - 20) * k / 8 - 3, YF + 10, z, X0 + 10 + (W - 20) * k / 8 + 3, YB - 10, z + 6);
    a.box(X0 + 10, YF + 10, z, X1 - 10, YF + 16, z + 20); a.box(X0 + 10, YB - 16, z, X1 - 10, YB - 10, z + 20);
    if (v.loaded && i < n) { const th = Math.min(100, (Z1 - zb) / n - 70); for (let t = 0; t < 2; t++) trayBox(a, X0 + 40 + t * ((W - 80) / 2), YF + 40, X0 + 40 + (t + 1) * ((W - 80) / 2) - 20, YB - 40, z + 20, z + 20 + th, 6); }
  }
  a.rect(X0 + 10, YF + 10, X1 - 10, YB - 10, 'EQUIP-DETAIL');
  a.log(`Added the corner posts${v.casters ? ' with casters' : ''}, ${n} wire shelves with edge rails${v.loaded ? ' and open instrument trays on each' : ''} (plan and 3D).`);
}

function carousel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z1);
  const fw = W - 200, wz0 = Z0 + v.sill, wz1 = wz0 + v.win;
  a.box(X0 + 100, YF - 20, wz0 - 60, X1 - 100, YF + 10, wz0); a.frame(X0 + 100, wz0, X1 - 100, wz1, YF - 30, YF + 10, 30);
  a.box(X0 + 130, YF + 2, wz0 + 30, X1 - 130, YF + 8, wz1 - 30);
  a.box(X0 + 30, YF - 20, Z0 + 100, X0 + 90, YF, Z1 - 200);                                    // control pillar
  screenBox(a, X0 + 20, wz1 + 80, X0 + 130, wz1 + 260, YF - 2, 24);
  for (let i = 0; i < 4; i++) a.box(X1 - 90 - i * 0, YF - 14, wz0 - 140 + i * 0, X1 - 30, YF, wz0 - 100);
  for (let z = Z0 + 300; z < Z1 - 200; z += 220) a.line(X0, YF, X1, YF, 'EQUIP-DETAIL');
  a.rect(X0 + 100, YF - 30, X1 - 100, YF + 10, 'EQUIP-DETAIL'); a.ellp(cx, a.cy, W * 0.38, D * 0.38, 'EQUIP-HIDDEN');
  a.box(X0 + 20, YB - 40, Z1 - 20, X1 - 20, YB, Z1);
  a.log('Added the tall enclosure, a framed pick window with a counter ledge, a control pillar with a display and a dashed carousel ring in plan (plan and 3D).');
}

function phshelf(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const bays = v.bays, n = v.shelves;
  const bw = W / bays;
  for (let i = 0; i <= bays; i++) a.box(X0 + i * bw - 15 + (i === 0 ? 15 : 0) - (i === bays ? 15 : 0), YF, Z0, X0 + i * bw + 15 + (i === 0 ? 15 : 0) - (i === bays ? 15 : 0), YB, Z1);
  a.box(X0, YB - 12, Z0 + 40, X1, YB, Z1 - 20);
  for (let s = 0; s <= n; s++) {
    const z = Z0 + 40 + ((Z1 - Z0 - 80) * s) / n;
    a.box(X0, YF, z, X1, YB, z + 16); if (s > 0) a.box(X0, YF, z + 16, X1, YF + 8, z + 60);
    if (s < n && s > 0) for (let b = 0; b < bays; b++) for (let k = 0; k < 3; k++) { const x0 = X0 + b * bw + 40 + k * ((bw - 80) / 3); a.box(x0, YF + 40, z + 16, x0 + (bw - 80) / 3 - 14, YB - 60, z + 16 + Math.min(260, (Z1 - Z0 - 80) / n - 70)); }
  }
  a.rect(X0, YF, X1, YB, 'EQUIP');
  for (let i = 1; i < bays; i++) a.line(X0 + i * bw, YF, X0 + i * bw, YB);
  a.log(`Added ${bays} bays of uprights, a back panel, ${n} levels of shelves with front rails and rows of storage bins (plan and 3D).`);
}

function medcart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  cab(a, { drawers: v.drawers, drawerCols: v.cols ?? 1, drawerH: Z1 - Z0 - 380, casters: 110, topT: 40, pull: 'bar', inset: 20, lock: false });
  a.box(X0 + 10, YF, Z1 - 40, X1 - 10, YB, Z1);
  a.box(X0 + 10, YF, Z1, X1 - 10, YF + 12, Z1 + 0); 
  for (const x of [X0 + 24, X1 - 24]) a.box(x - 12, YB - 36, Z0 + 700, x + 12, YB - 12, Z1 - 30);
  a.xcyl(X0 + 24, X1 - 24, YB - 24, Z0 + 700 + 60, 14, 8);
  a.box(X0 + 30, YF - 6, Z1 - 150, X0 + 120, YF, Z1 - 120);                                    // lock plate
  if (v.bins) { for (let i = 0; i < v.bins; i++) a.box(X1 + 0 - 140 + 0, YF + 20 + i * 90, Z0 + 500 + 0, X1, YF + 20 + i * 90 + 80, Z0 + 620); }
  a.log(`Added the casters, the drawer stack with ${v.drawers} drawers and bar pulls, a top with lock plate, and a rear push handle${v.bins ? ` and ${v.bins} side bins` : ''} (plan and 3D).`);
}

function linencart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  casters4(a, 70, 70, 110);
  a.box(X0 + 20, YF + 30, Z0 + 110, X1 - 20, YB - 30, Z0 + 150);
  if (v.bag) {
    for (const x of [X0 + 24, X1 - 24]) for (const y of [YF + 24, YB - 24]) a.box(x - 12, y - 12, Z0 + 150, x + 12, y + 12, Z1);
    a.box(X0 + 24, YF + 24, Z1 - 30, X1 - 24, YF + 40, Z1 - 15); a.box(X0 + 24, YB - 40, Z1 - 30, X1 - 24, YB - 24, Z1 - 15);
    a.cone(cx, a.cy, Z0 + 150, Z1 - 120, W * 0.4, W * 0.46, 20); a.cyl(cx, a.cy, Z1 - 120, Z1 - 60, W * 0.46, 20); a.circ(cx, a.cy, W * 0.4, 'EQUIP-DETAIL');
  } else {
    a.box(X0 + 10, YF + 20, Z0 + 150, X0 + 24, YB - 20, Z1); a.box(X1 - 24, YF + 20, Z0 + 150, X1 - 10, YB - 20, Z1); a.box(X0 + 10, YB - 24, Z0 + 150, X1 - 10, YB - 10, Z1);
    a.box(X0 + 10, YF + 20, Z0 + 150, X1 - 10, YF + 34, Z0 + 700);                            // front panel lower
    for (let i = 0; i < v.shelves; i++) a.box(X0 + 24, YF + 34, Z0 + 150 + ((Z1 - Z0 - 160) * (i + 1)) / (v.shelves + 1), X1 - 24, YB - 24, Z0 + 150 + ((Z1 - Z0 - 160) * (i + 1)) / (v.shelves + 1) + 14);
    a.rect(X0 + 24, YF + 34, X1 - 24, YB - 24, 'EQUIP-DETAIL');
  }
  a.box(X0 + 30, YB - 40, Z1 - 200, X1 - 30, YB - 24, Z1 - 160);
  a.log(`Added the casters, the base, ${v.bag ? 'corner posts with rim rails holding a round bag liner' : `three closed sides with a low front panel and ${v.shelves} shelves`} and a rear grip bar (plan and 3D).`);
}

function supcart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  const r = cart(a, { shelves: v.shelves, caster: 110, lip: v.lip ?? 40, handle: true, handleH: 0 });
  const per = (r.top - r.zb - 60) / v.shelves;
  for (let s = 0; s < v.shelves; s++) { const z = r.zb + 30 + per * s + 14 + (s === 0 ? 0 : 0); const bn = v.bins; for (let b = 0; b < bn; b++) { const x0 = X0 + 40 + b * ((W - 80) / bn); a.box(x0 + 4, YF + 40, z, x0 + (W - 80) / bn - 8, YB - 50, z + Math.min(per - 40, 160)); a.line(x0 + 4, YF + 40, x0 + 4, YB - 50, 'EQUIP-DETAIL'); } }
  a.log(`Added the casters, ${v.shelves} lipped shelves each holding ${v.bins} open bins and a rear push handle (plan and 3D).`);
}

function wastecart(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  casters4(a, 70, 70, 120);
  a.box(X0 + 20, YF + 30, Z0 + 120, X1 - 20, YB - 30, Z0 + 160);
  const n = v.bins, bw = (W - 80) / n;
  for (let i = 0; i < n; i++) {
    const x0 = X0 + 40 + i * bw, x1 = x0 + bw - 10;
    a.box(x0, YF + 40, Z0 + 160, x1, YB - 40, Z1 - 100);
    a.box(x0 - 6, YF + 34, Z1 - 100, x1 + 6, YB - 34, Z1 - 60);                                // lid
    a.box((x0 + x1) / 2 - 60, YF + 20, Z1 - 100, (x0 + x1) / 2 + 60, YF + 34, Z1 - 80);        // lid grip
    a.box(x0 + 10, YF + 30, Z0 + 170, x1 - 10, YF + 40, Z0 + 190); a.box((x0 + x1) / 2 - 40, YF - 6, Z0 + 190, (x0 + x1) / 2 + 40, YF + 30, Z0 + 230);   // pedal
    if (v.sharps) a.box(x1 - 120, YF + 36, Z1 - 450, x1 - 20, YF + 44, Z1 - 330);
    a.rect(x0, YF + 40, x1, YB - 40, 'EQUIP-DETAIL');
  }
  a.box(X0 + 20, YB - 28, Z1 - 400, X1 - 20, YB - 12, Z1 - 360); for (const x of [X0 + 30, X1 - 30]) a.box(x - 10, YB - 28, Z1 - 400, x + 10, YB - 12, Z1 - 60);
  a.log(`Added the casters, the base, ${n} lidded bin${n > 1 ? 's' : ''} with foot pedals${v.sharps ? ' and a small slot panel on each' : ''} and a rear handle (plan and 3D).`);
}

function deconshower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a; a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 60);
  for (const x of [X0 + 30, X1 - 30]) for (const y of [YF + 30, YB - 30]) a.box(x - 20, y - 20, Z0 + 60, x + 20, y + 20, Z1);
  a.box(X0 + 10, YF + 10, Z1 - 40, X1 - 10, YB - 10, Z1);
  a.box(X0 + 10, YB - 24, Z0 + 60, X1 - 10, YB - 8, Z1 - 40);
  if (v.curtain) { a.box(X0 + 10, YF + 10, Z0 + 700, X1 - 10, YF + 24, Z1 - 40); } else { a.box(X0 + 10, YF + 10, Z0 + 60, X0 + 30, YB - 10, Z1 - 40); a.box(X1 - 30, YF + 10, Z0 + 60, X1 - 10, YB - 10, Z1 - 40); }
  a.cyl(cx, cy, Z1 - 120, Z1 - 40, 20, 10); a.cyl(cx, cy, Z1 - 160, Z1 - 120, 120, 20); a.circ(cx, cy, 120, 'EQUIP-DETAIL');
  a.tube([[cx + 0, YB - 40, Z0 + 800], [cx, YB - 40, Z1 - 160], [cx, cy, Z1 - 160]], [14, 14, 14], 8);
  for (let i = 0; i < 3; i++) a.cyl(cx - 300 + i * 300 < X0 + 60 ? X0 + 60 : Math.min(cx - 300 + i * 300, X1 - 60), YB - 60, Z0 + 60, Z0 + 70, 14, 8);
  for (let i = 0; i < 5; i++) a.rect(X0 + 30 + i * ((W - 60) / 5), YF + 30, X0 + 30 + i * ((W - 60) / 5) + 10, YB - 30, 'EQUIP-HIDDEN');
  a.box(X1 - 60, YB - 60, Z0 + 1000, X1 - 20, YB - 24, Z0 + 1100); a.box(X1 - 40, YB - 60, Z0 + 1000, X1 - 20, YB - 100, Z0 + 1100);
  a.log(`Added the floor tray, four corner posts, a top frame, a back wall panel, ${v.curtain ? 'a front curtain rail and valance, ' : 'two side panels, '}a round rain head and a push-plate (plan and 3D).`);
}

function ultrasonic(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  const zt = Z0 + (v.stand ?? 0);
  if (v.stand) { for (const x of [X0 + 40, X1 - 40]) for (const y of [YF + 40, YB - 40]) { a.caster(x, y, 110); a.leg(x, y, Z0 + 110, zt, 18); a.circ(x, y, 24, 'EQUIP-HIDDEN'); } a.box(X0 + 20, YF + 20, zt - 60, X1 - 20, YB - 20, zt); a.box(X0 + 40, YF + 40, Z0 + 260, X1 - 40, YB - 40, Z0 + 290); }
  a.box(X0, YF, zt, X1, YB, Z1 - 140);
  trayBox(a, X0 + 30, YF + 30, X1 - 30, YB - 30, Z1 - 140, Z1 - 100, 10);
  a.box(X0 + 70, YF + 70, Z1 - 140, X1 - 70, YB - 70, Z1 - 120);                               // basket
  a.box(X0 - 4, YB - 40, Z1 - 100, X1 + 4, YB, Z1 - 60); a.box(X0 + 10, YF + 10, Z1 - 60, X1 - 10, YB, Z1);               // lid, hinged
  a.box(cx - 100, YF - 10, Z1 - 80, cx + 100, YF + 10, Z1 - 60);
  screenBox(a, X0 + 40, zt + (Z1 - 140 - zt) * 0.25, X0 + 40 + W * 0.3, zt + (Z1 - 140 - zt) * 0.25 + 120, YF, 24);
  dial(a, X1 - 100, YF, zt + (Z1 - 140 - zt) * 0.35, 30, -1);
  a.rect(X0 + 30, YF + 30, X1 - 30, YB - 30, 'EQUIP-DETAIL'); a.rect(X0 + 70, YF + 70, X1 - 70, YB - 70, 'EQUIP-DETAIL');
  a.log(`Added the tank housing${v.stand ? ' on a wheeled stand' : ''}, a lined tank, a mesh basket, a hinged lid, a display and a knob (plan and 3D).`);
}

function transportbin(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a; a.outline();
  if (v.wheels) { for (const x of [X0 + 60, X1 - 60]) { a.caster(x, YF + 70, 100); a.caster(x, YB - 70, 100); a.circ(x, YF + 70, 24, 'EQUIP-HIDDEN'); a.circ(x, YB - 70, 24, 'EQUIP-HIDDEN'); } }
  const zb = Z0 + (v.wheels ? 100 : 0);
  trayBox(a, X0, YF, X1, YB, zb, Z1 - 90, 12);
  a.box(X0 - 6, YF - 6, Z1 - 90, X1 + 6, YB + 0, Z1);                                           // lid
  a.box(X0 + 30, YF - 6, Z1 - 70, X1 - 30, YF - 2, Z1 - 50);
  for (const x of [X0 + W * 0.28, X1 - W * 0.28]) { a.box(x - 25, YF - 24, Z1 - 140, x + 25, YF - 6, Z1 - 70); }   // latches
  for (const x of [X0 + 100, X1 - 100]) a.box(x - 80, YF - 30, Z1 - 260, x + 80, YF - 6, Z1 - 230);
  a.rect(X0 - 6, YF - 6, X1 + 6, YB, 'EQUIP-DETAIL');
  a.log(`Added the walled body${v.wheels ? ' on four casters' : ''}, a lid, two latches and two end grips (plan and 3D).`);
}

const SUPPORT = [
  fam({ cat: SP, title: 'Generic sterile processing steam sterilizer', desc: (v) => `Sterilizer cabinet on a plinth with a ${v.round ? 'round chamber door with locking lugs and a handwheel' : 'framed rectangular chamber door with a long handle'}, a display and three buttons${v.second ? ' and a rear door of a pass-through unit' : ''}.`,
    vs: [['rectangular door, 24 x 36 x 38 in chamber', 40, 42, 76, 0, {}], ['rectangular door, 28 x 28 x 50 in chamber', 46, 48, 84, 0, {}], ['round door, small, 30 x 30 in', 32, 34, 62, 0, { round: true }], ['pass-through, two doors, 48 x 44 in', 52, 52, 86, 0, { second: true }]], build: sterilizer }),
  fam({ cat: SP, title: 'Generic instrument washer-disinfector', desc: (v) => `Washer housing on feet with ${v.doors} framed glass-panel door${v.doors > 1 ? 's' : ''} with pull bars, a display and three knobs.`,
    vs: [['under-counter, one door, 24 x 26 in', 24, 26, 34, 0, { doors: 1, under: true }], ['floor model, one door, 32 x 32 in', 32, 32, 80, 0, { doors: 1 }], ['double chamber, 56 x 34 in', 56, 34, 82, 0, { doors: 2 }]], build: washerdis }),
  fam({ cat: SP, title: 'Generic instrument processing tray', desc: (v) => `Perforated tray with drawn slots and end handles${v.dividers ? `, ${v.dividers} dividers` : ''}${v.lid ? ' and a lid' : ''}.`,
    vs: [['half size, 10 x 12 x 2.5 in', 10, 12, 2.5, 0, { dividers: 0 }], ['standard, 10 x 20 x 3 in', 20, 10, 3, 0, { dividers: 1 }], ['deep with lid, 11 x 21 x 5 in', 21, 11, 5, 0, { dividers: 2, lid: true }], ['wide, 12 x 24 x 4 in', 24, 12, 4, 0, { dividers: 2 }], ['half size with lid, 10 x 12 x 4 in', 12, 10, 4, 0, { dividers: 0, lid: true }]], build: insttray }),
  fam({ cat: SP, title: 'Generic sterile supply wire rack', desc: (v) => `Wire shelving rack with corner posts${v.casters ? ' on casters' : ''}, ${v.shelves} wire shelves with edge rails${v.loaded ? ' and open instrument trays on each' : ''}.`,
    vs: [['4 shelves on casters, 36 x 18 in', 36, 18, 66, 0, { shelves: 4, casters: true }], ['5 shelves, loaded, 48 x 24 in', 48, 24, 72, 0, { shelves: 5, loaded: true }], ['3 shelves, fixed feet, 48 x 18 in', 48, 18, 54, 0, { shelves: 3 }], ['2 shelves, loaded, on casters, 30 x 18 in', 30, 18, 40, 0, { shelves: 2, casters: true, loaded: true }], ['6 shelves, 60 x 24 in, casters', 60, 24, 80, 0, { shelves: 6, casters: true, loaded: true }]], build: wirerack }),
  fam({ cat: SP, title: 'Generic pharmacy vertical carousel', desc: 'Tall enclosure with a framed pick window and counter ledge, a control pillar with display, and a dashed carousel ring in plan.',
    vs: [['one window, 80 x 40 in, 90 in tall', 80, 40, 90, 0, { sill: 800, win: 560 }], ['one window, 100 x 48 in, 110 in tall', 100, 48, 110, 0, { sill: 800, win: 600 }], ['wide, 120 x 52 in, 120 in tall', 120, 52, 120, 0, { sill: 760, win: 600 }]], build: carousel }),
  fam({ cat: SP, title: 'Generic pharmacy shelving', desc: (v) => `Shelving with ${v.bays} bays of uprights, a back panel and ${v.shelves} levels of shelves with front rails and rows of storage bins.`,
    vs: [['two bays, 4 levels, 72 x 18 in', 72, 18, 84, 0, { bays: 2, shelves: 4 }], ['three bays, 5 levels, 108 x 18 in', 108, 18, 84, 0, { bays: 3, shelves: 5 }], ['two bays, 3 levels, low, 72 x 24 in', 72, 24, 48, 0, { bays: 2, shelves: 3 }], ['four bays, 6 levels, 144 x 20 in', 144, 20, 96, 0, { bays: 4, shelves: 6 }]], build: phshelf }),
  fam({ cat: SP, title: 'Generic medication cart', desc: (v) => `Cart on casters with a drawer stack of ${v.drawers} drawers with bar pulls, a lock plate on the top and a rear push handle${v.bins ? ` and ${v.bins} side bins` : ''}.`,
    vs: [['six drawers, 24 x 20 in', 24, 20, 50, 0, { drawers: 6 }], ['eight drawers, 26 x 22 in', 26, 22, 54, 0, { drawers: 8, bins: 2 }], ['ten drawers, 28 x 24 in', 28, 24, 56, 0, { drawers: 10, bins: 3 }], ['four drawers, compact, 20 x 18 in', 20, 18, 44, 0, { drawers: 4 }]], build: medcart }),
  fam({ cat: SP, title: 'Generic hospital linen cart', desc: (v) => v.bag ? 'Cart on casters with corner posts and rim rails holding a round bag liner, and a rear grip bar.' : `Cart on casters with three closed sides, a low front panel, ${v.shelves} shelves and a rear grip bar.`,
    vs: [['bag cart, 30 x 30 in', 30, 30, 48, 0, { bag: true }], ['closed three-shelf cart, 36 x 24 in', 36, 24, 62, 0, { shelves: 3 }], ['closed two-shelf cart, 30 x 24 in', 30, 24, 56, 0, { shelves: 2 }], ['bag cart, large, 36 x 32 in', 36, 32, 52, 0, { bag: true }]], build: linencart }),
  fam({ cat: SP, title: 'Generic hospital supply cart', desc: (v) => `Cart on casters with ${v.shelves} lipped shelves each holding ${v.bins} open bins and a rear push handle.`,
    vs: [['three shelves, 2 bins each, 24 x 18 in', 24, 18, 52, 0, { shelves: 3, bins: 2 }], ['four shelves, 3 bins each, 36 x 20 in', 36, 20, 60, 0, { shelves: 4, bins: 3 }], ['two shelves, 4 bins each, 48 x 22 in', 48, 22, 40, 0, { shelves: 2, bins: 4 }], ['five shelves, 3 bins each, 36 x 24 in', 36, 24, 68, 0, { shelves: 5, bins: 3 }]], build: supcart }),
  fam({ cat: SP, title: 'Generic hospital waste cart', desc: (v) => `Cart on casters with ${v.bins} lidded bin${v.bins > 1 ? 's' : ''} with foot pedals${v.sharps ? ' and a small slot panel on each' : ''} and a rear handle.`,
    vs: [['one bin, 24 x 26 in', 24, 26, 42, 0, { bins: 1 }], ['two bins, 40 x 26 in', 40, 26, 42, 0, { bins: 2 }], ['three bins, 56 x 26 in', 56, 26, 42, 0, { bins: 3 }], ['two bins with slot panels, 40 x 26 in', 40, 26, 44, 0, { bins: 2, sharps: true }]], build: wastecart }),
  fam({ cat: SP, title: 'Generic decontamination shower stall', desc: (v) => `Shower stall with a floor tray, four corner posts, a top frame, a back wall panel, ${v.curtain ? 'a front curtain rail' : 'two side panels'}, a round rain head and a push-plate.`,
    vs: [['curtain front, 36 x 36 in', 36, 36, 90, 0, { curtain: true }], ['panelled, 40 x 40 in', 40, 40, 90, 0, {}], ['wide, 48 x 40 in, curtain front', 48, 40, 92, 0, { curtain: true }]], build: deconshower }),
  fam({ cat: SP, title: 'Generic ultrasonic instrument cleaner', desc: (v) => `Tank housing${v.stand ? ' on a wheeled stand' : ''} with a lined tank, a mesh basket, a hinged lid, a display and a knob.`,
    vs: [['benchtop, 20 x 12 in', 20, 12, 14, 0, {}], ['benchtop, 30 x 16 in', 30, 16, 16, 0, {}], ['on stand, 36 x 20 in', 36, 20, 40, 0, { stand: 650 }]], build: ultrasonic }),
  fam({ cat: SP, title: 'Generic instrument transport case', desc: (v) => `Lidded bin${v.wheels ? ' on four casters' : ''} with two latches and two end grips.`,
    vs: [['hand carry, 24 x 16 x 10 in', 24, 16, 10, 0, {}], ['hand carry, 30 x 18 x 14 in', 30, 18, 14, 0, {}], ['on casters, 36 x 24 x 24 in', 36, 24, 28, 0, { wheels: true }]], build: transportbin }),
];

export default [...(typeof PATIENT !== 'undefined' ? PATIENT : []), ...(typeof SURGICAL !== 'undefined' ? SURGICAL : []), ...(typeof IMAGING !== 'undefined' ? IMAGING : []), ...(typeof LAB !== 'undefined' ? LAB : []), ...(typeof SUPPORT !== 'undefined' ? SUPPORT : [])];
