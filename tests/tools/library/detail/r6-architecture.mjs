/* SPDX-License-Identifier: Apache-2.0 */
/** Round 6, architecture: facade and envelope elements, stairs and circulation, architectural details, massing models. Original geometry; generic building parts, not particular buildings. */
import { fam } from './r4-kit.mjs';

const IN = 25.4, m = Math, PI = Math.PI;
const area2 = (p) => p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0);
/** extrude a convex polygon of [y, z] points between x0 and x1 (winding fixed here) */
function prismX(a, poly, x0, x1) {
  if (area2(poly) < 0) poly = poly.slice().reverse();
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[x0, ...poly[0]], [x0, ...poly[i + 1]], [x0, ...poly[i]]], [[x1, ...poly[0]], [x1, ...poly[i]], [x1, ...poly[i + 1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[x0, ...p], [x0, ...q], [x1, ...q]], [[x0, ...p], [x1, ...q], [x1, ...p]]); }
  return a;
}
/** extrude a convex polygon of [x, z] points between y0 and y1 */
function prismY(a, poly, y0, y1) {
  if (area2(poly) > 0) poly = poly.slice().reverse();
  const n = poly.length;
  for (let i = 1; i < n - 1; i++) { a.t.push([[poly[0][0], y0, poly[0][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [poly[i][0], y0, poly[i][1]]], [[poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]]]); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a.t.push([[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]]], [[p[0], y0, p[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]]); }
  return a;
}
/** a moulding or bracket profile: samples [v, u] (v up 0..1, u out from the wall 0..1), extruded along x. Wall is at y = 0. */
function profile(a, pts, x0, x1, D, z0, H) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [va, ua] = pts[i], [vb, ub] = pts[i + 1];
    if (vb - va < 0.0005) continue;
    prismX(a, [[0, z0 + va * H], [-ua * D, z0 + va * H], [-ub * D, z0 + vb * H], [0, z0 + vb * H]], x0, x1);
  }
}
/** a hollow-looking lathe turned part: [dz, r] samples above z0 */
function lathe(a, cx, cy, z0, prof, seg = 16) { a.tube(prof.map(([dz]) => [cx, cy, z0 + dz]), prof.map(([, r]) => r), seg); }
/** a straight flight of steps with stringers, treads and a rail on each side. Climbs from ya (low) to yb (high); returns nothing */
function flight(a, xc, w, ya, yb, za, n, r, o = {}) {
  const dir = yb > ya ? 1 : -1, g = m.abs(yb - ya) / n, yTop = yb;
  const line = (f) => [ya + dir * g * f, za + r * (f + 1)];   // nosing line: tread i at f = i
  const sl = o.stringer ?? 240;
  for (const sx of [-1, 1]) {
    const x0 = xc + sx * (w / 2) - (sx > 0 ? 0 : 0), xa = sx > 0 ? xc + w / 2 : xc - w / 2 - 40, xb = xa + 40;
    const A = line(0), B = line(n - 1);
    const poly = [[A[0], m.max(a.Z0, A[1] - sl)], [A[0], A[1] - 25], [B[0] + dir * g, B[1] - 25], [B[0] + dir * g, B[1] - sl]];
    prismX(a, poly, xa, xb);
  }
  for (let i = 0; i < n; i++) {
    const y1 = ya + dir * g * (i + 1), y0 = ya + dir * g * i - dir * (i ? 25 : 0), z = za + r * (i + 1);
    a.box(xc - w / 2, m.min(y0, y1), z - 45, xc + w / 2, m.max(y0, y1), z);
    if (o.risers !== false) a.box(xc - w / 2, m.min(y0, y0 + dir * 12), z - r, xc + w / 2, m.max(y0, y0 + dir * 12), z - 45);
  }
  if (o.rail !== false) for (const sx of [-1, 1]) {
    const x = xc + sx * (w / 2 + 20);
    const p0 = [x, ya + dir * g * 0.5, za + r + 900], p1 = [x, ya + dir * g * (n - 0.5), za + r * n + 900];
    a.tube([p0, p1], [22, 22], 8);
    const nb = m.max(2, m.round(n / 2));
    for (let i = 0; i <= nb; i++) { const f = (i / nb) * (n - 1) + 0.5, yy = ya + dir * g * f, zz = za + r * (f + 0.5); a.tube([[x, yy, zz], [x, yy, zz + 900 - 25]], [9, 9], 6); }
    a.tube([[x, ya + dir * g * 0.5, za + r + 900], [x, ya + dir * g * 0.5, za + r]], [11, 11], 6);
  }
  const x0 = xc - w / 2 - 40, x1 = xc + w / 2 + 40;
  a.rect(x0, m.min(ya, yb), x1, m.max(ya, yb), 'EQUIP-DETAIL');
  for (let i = 1; i < n; i++) a.line(xc - w / 2, ya + dir * g * i, xc + w / 2, ya + dir * g * i, 'EQUIP-DETAIL');
  a.line(xc, ya + dir * g * 0.3, xc, ya + dir * g * (n - 0.3), 'EQUIP-DETAIL');
}

// ================================================================================== ENVELOPE
function windowUnit(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, t = 48, n = v.units, uw = (W - 24) / n;
  const fy0 = YF + D * 0.28, fy1 = YB - D * 0.08, gy = (fy0 + fy1) / 2, zb = Z0 + 60, zt = Z1 - 55;
  a.outline();
  a.box(X0, YF, Z0, X1, fy0 + 80, Z0 + 52);                     // sill, projecting
  a.box(X0 + 10, YF + D * 0.1, Z0 + 52, X1 - 10, fy0 + 40, Z0 + 62);
  a.box(X0 + 6, YF + D * 0.18, zt, X1 - 6, fy1, Z1);            // head trim
  for (let u = 0; u < n; u++) {
    const ux0 = X0 + 12 + u * uw, ux1 = ux0 + uw;
    a.frame(ux0, zb, ux1, zt, fy0, fy1, t);
    if (v.type === 'dh') {
      const zm = (zb + zt) / 2;
      a.frame(ux0 + t, zm - 25, ux1 - t, zt - t, fy0 - 14, fy0 + 22, 34);        // upper sash, outer
      a.frame(ux0 + t, zb + t, ux1 - t, zm + 25, fy0 + 24, fy0 + 60, 34);        // lower sash, inner
      a.box(ux0 + t, fy0 - 14, zm - 30, ux1 - t, fy0 + 60, zm + 30);              // meeting rail
      a.box((ux0 + ux1) / 2 - 40, fy0 - 26, zm - 54, (ux0 + ux1) / 2 + 40, fy0 - 14, zm - 40);   // sash lock
    } else if (v.type === 'casement') {
      a.frame(ux0 + t, zb + t, ux1 - t, zt - t, fy0 - 10, fy0 + 40, 36);
      const hx = u % 2 ? ux0 + t + 20 : ux1 - t - 20;
      a.box(hx - 8, fy0 - 40, (zb + zt) / 2 - 60, hx + 8, fy0 - 10, (zb + zt) / 2 + 60);
      a.line(u % 2 ? ux1 - t : ux0 + t, gy, u % 2 ? ux1 - t : ux0 + t, gy - uw * 0.55, 'EQUIP-SWING');
    } else if (v.type === 'awning') {
      a.frame(ux0 + t, zb + t, ux1 - t, zt - t, fy0 - 10, fy0 + 40, 36);
      a.box((ux0 + ux1) / 2 - 70, fy0 - 40, zb + t + 20, (ux0 + ux1) / 2 + 70, fy0 - 10, zb + t + 40);
    }
    a.box(ux0 + t, gy - 4, zb + t, ux1 - t, gy + 4, zt - t);                  // glass
    const gx0 = ux0 + t, gx1 = ux1 - t;
    for (let c = 1; c < v.cols; c++) { const x = gx0 + ((gx1 - gx0) * c) / v.cols; a.box(x - 8, fy0 - 20, zb + t, x + 8, fy0 - 8, zt - t); }
    for (let r = 1; r < v.rows; r++) { const z = zb + t + ((zt - zb - 2 * t) * r) / v.rows; a.box(gx0, fy0 - 20, z - 8, gx1, fy0 - 8, z + 8); }
    if (u) a.line(ux0, fy0, ux0, fy1, 'EQUIP-DETAIL');
  }
  a.line(X0, gy, X1, gy, 'EQUIP-DETAIL'); a.line(X0 + 12, fy0, X1 - 12, fy0, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, fy0 + 80, 'EQUIP-DETAIL');
  a.log('Added the sill, head trim, frames, sashes or casements, glass and muntin bars (plan and 3D).');
}
function curtainWall(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, n = v.bays, bw = W / n;
  a.outline();
  const y0 = YF + D * 0.3, y1 = YB - 20, gy = (y0 + y1) / 2;
  const rows = v.rows, spH = v.spandrel ?? 0, vh = (Z1 - Z0 - spH) / rows;
  for (let i = 0; i <= n; i++) { const x = X0 + i * bw; a.box(x - 30, YF + D * 0.1, Z0, x + 30, y1, Z1); a.box(x - 24, YF, Z0 + 20, x + 24, YF + D * 0.1, Z1 - 20); a.line(x, YF, x, YB, 'EQUIP-DETAIL'); }
  for (let r = 0; r <= rows; r++) { const z = Z0 + r * vh; a.box(X0, y0, z - 30, X1, y1, z + 30); if (r > 0 && r < rows) a.box(X0, YF + D * 0.1, z - 20, X1, y0, z + 20); }
  for (let i = 0; i < n; i++) for (let r = 0; r < rows; r++) { const gx0 = X0 + i * bw + 36, gx1 = X0 + (i + 1) * bw - 36; a.box(gx0, gy - 5, Z0 + r * vh + 36, gx1, gy + 5, Z0 + (r + 1) * vh - 36); }
  if (spH) { a.box(X0, y0 - 40, Z0 + rows * vh, X1, y1, Z1); for (let i = 1; i < n; i++) a.line(X0 + i * bw, y0 - 40, X0 + i * bw, y1, 'EQUIP-DETAIL'); a.box(X0, YF + D * 0.15, Z1 - 70, X1, y0 - 40, Z1); }
  if (v.vent) for (let i = 0; i < n; i += 2) a.box(X0 + i * bw + bw * 0.25, YF + D * 0.1 - 6, Z0 + vh * 0.5 - 8, X0 + i * bw + bw * 0.75, YF + D * 0.1, Z0 + vh * 0.5 + 8);
  a.line(X0, gy, X1, gy, 'EQUIP-DETAIL');
  a.log('Added the mullions with pressure caps, transoms, glass lites' + (spH ? ', an opaque spandrel panel' : '') + ' (plan and 3D).');
}
function louvre(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  a.outline();
  if (v.dir === 'horizontal') {
    for (const sx of [-1, 1]) a.box(cx + sx * (W / 2 - 25) - 25, YF, Z0, cx + sx * (W / 2 - 25) + 25, YB, Z1);
    a.box(X0, YF, Z0, X1, YB, Z0 + 30); a.box(X0, YF, Z1 - 30, X1, YB, Z1);
    for (let i = 0; i < v.n; i++) {
      const z = Z0 + 60 + ((Z1 - Z0 - 120) * (i + 0.5)) / v.n, bd = D * 0.9 * (v.deep ?? 1), th = v.blade ?? 28;
      prismX(a, [[-D * 0.5 - bd / 2, z - th], [-D * 0.5 + bd / 2, z + th * 0.2], [-D * 0.5 + bd / 2, z + th * 0.2 + th / 2], [-D * 0.5 - bd / 2, z - th / 2]].map(([y, zz]) => [y, zz]), X0 + 50, X1 - 50);
    }
    a.line(X0, YF, X0, YB); a.line(X0 + 50, YF + D * 0.05, X1 - 50, YF + D * 0.05, 'EQUIP-DETAIL');
  } else {
    a.box(X0, YB - 40, Z0, X1, YB, Z1);
    for (let i = 0; i < v.n; i++) {
      const x = X0 + 50 + ((W - 100) * (i + 0.5)) / v.n, fw = (W - 100) / v.n * 0.62;
      const tilt = v.tilt ?? 0;
      a.prism([[x - fw / 2, YB - 40], [x + fw / 2, YB - 40], [x + fw / 2 + tilt, YF + 30], [x - fw / 2 + tilt, YF + 30]], Z0 + 30, Z1 - 30);
      a.poly([[x - fw / 2, YB - 40], [x + fw / 2, YB - 40], [x + fw / 2 + tilt, YF + 30], [x - fw / 2 + tilt, YF + 30]], 'EQUIP-DETAIL');
    }
    a.box(X0, YF, Z0, X1, YF + 30, Z0 + 30); a.box(X0, YF, Z1 - 30, X1, YF + 30, Z1);
  }
  a.log('Added the side frame, head and sill rails and ' + v.n + ' ' + (v.dir === 'horizontal' ? 'angled horizontal blades' : 'vertical fins on a back rail') + ' (plan and 3D).');
}
function parapet(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, D, H } = a;
  a.outline();
  const P = {
    coping: [[0, 0.7], [0.55, 0.7], [0.55, 0.62], [0.82, 0.62], [0.82, 0.66], [0.87, 0.66], [0.87, 1], [1, 1], [1, 0.62]].map(([v1, u]) => [v1, u]),
    flat: [[0, 0.78], [0.78, 0.78], [0.78, 0.9], [0.9, 0.9], [0.9, 0.74], [0.92, 1], [1, 1]],
    cornice: [[0, 0.55], [0.34, 0.55], [0.34, 0.66], [0.4, 0.66], [0.4, 0.6], [0.5, 0.6], [0.5, 0.82], [0.55, 0.82], [0.55, 0.7], [0.7, 0.74], [0.8, 0.9], [0.9, 1], [0.96, 1], [0.96, 0.9], [1, 0.9]],
    stepped: [[0, 0.4], [0.2, 0.4], [0.2, 0.55], [0.4, 0.55], [0.4, 0.7], [0.6, 0.7], [0.6, 0.85], [0.8, 0.85], [0.8, 1], [1, 1]],
  }[v.prof];
  profile(a, P, X0, X1, D, Z0, H);
  if (v.brackets) { const k = m.round(a.W / 360); for (let i = 0; i <= k; i++) { const x = X0 + 60 + ((a.W - 120) * i) / k; prismX(a, [[0, Z0 + H * 0.5], [-D * 0.7, Z0 + H * 0.5], [-D * 0.7, Z0 + H * 0.3], [-D * 0.3, Z0 + H * 0.28], [0, Z0 + H * 0.45]], x - 25, x + 25); } }
  if (v.cap) a.box(X0, YF, Z0, X1, YB, Z0 + 20);
  a.line(X0, YF + D * 0.1, X1, YF + D * 0.1, 'EQUIP-DETAIL');
  if (v.brackets) for (let i = 0; i <= m.round(a.W / 360); i++) { const x = X0 + 60 + ((a.W - 120) * i) / m.round(a.W / 360); a.rect(x - 25, YF + D * 0.3, x + 25, YB, 'EQUIP-DETAIL'); }
  a.log('Added the stepped profile of the ' + v.prof + ' extruded along its length' + (v.brackets ? ', with bracket blocks' : '') + ' (plan and 3D).');
}
function canopy(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  a.outline();
  const top = Z1, th = v.th ?? 170;
  if (v.type === 'glass') {
    for (let i = 0; i < v.panes; i++) { const x0 = X0 + 40 + ((W - 80) * i) / v.panes, x1 = X0 + 40 + ((W - 80) * (i + 1)) / v.panes; prismX(a, [[YB - 20, top], [YF + 80, top - D * 0.1], [YF + 80, top - D * 0.1 - 20], [YB - 20, top - 20]], x0 + 15, x1 - 15); a.rect(x0 + 15, YF + 80, x1 - 15, YB - 20, 'EQUIP-DETAIL'); a.box((x0 + x1) / 2 - 40, YF + 60, top - D * 0.1 - 60, (x0 + x1) / 2 + 40, YF + 120, top - D * 0.1 + 10); }
    a.box(X0, YB - 80, top - 60, X1, YB, top + 0.01 + 60 > Z1 ? Z1 : top + 60);
    for (let i = 0; i <= 1; i++) { const x = i ? X1 - 70 : X0 + 70; a.tube([[x, YB - 40, top - 50], [x, YF + 100, top - D * 0.1 - 30]], [14, 14], 6); a.tube([[x, YB - 40, top - 50], [x, YB - 40, Z0 + 200]], [14, 14], 6); }
  } else if (v.type === 'slab') {
    a.box(X0, YF, top - th, X1, YB, top); a.box(X0, YF, top - th - 60, X1, YF + 60, top);
    for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 160); a.tube([[x, YF + 140, top - th], [x, YF + 140, Z0]], [60, 60], 12); a.circ(x, YF + 140, 60, 'EQUIP-DETAIL'); }
    a.line(X0, YF + 60, X1, YF + 60, 'EQUIP-DETAIL');
  } else {    // rod hung
    a.box(X0, YB - 90, top - 160, X1, YB, top); prismX(a, [[YB - 90, top - 40], [YF, top - 160], [YF, top - 200], [YB - 90, top - 140]], X0, X1);
    for (const sx of [-1, 1]) { const x = cx + sx * (W / 2 - 120); a.tube([[x, YF + 40, top - 190], [x, YB - 50, top - 20]], [10, 10], 6); a.tube([[x, YF + 40, top - 190], [x, YB - 50, top - 80]], [6, 6], 6); }
    a.line(X0, YF + 40, X1, YF + 40, 'EQUIP-DETAIL');
  }
  a.log('Added the ' + (v.type === 'glass' ? 'glass panes in a steel carrier with rods' : v.type === 'slab' ? 'concrete slab with a drip edge on two columns' : 'sloped soffit hung from the wall on rods') + ' (plan and 3D).');
}
function skylight(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, k = 150, rise = Z1 - Z0 - k;
  a.outline();
  a.box(X0, YF, Z0, X1, YF + 90, Z0 + k); a.box(X0, YB - 90, Z0, X1, YB, Z0 + k); a.box(X0, YF, Z0, X0 + 90, YB, Z0 + k); a.box(X1 - 90, YF, Z0, X1, YB, Z0 + k);
  const ix0 = X0 + 90, ix1 = X1 - 90, iy0 = YF + 90, iy1 = YB - 90, zk = Z0 + k;
  if (v.type === 'pyramid') {
    const px = cx, py = cy;
    const tri = (A, B, C) => a.t.push([A, B, C]);
    const apex = [px, py, Z1], c = [[ix0, iy0, zk], [ix1, iy0, zk], [ix1, iy1, zk], [ix0, iy1, zk]];
    for (let i = 0; i < 4; i++) tri(c[i], c[(i + 1) % 4], apex);
    a.line(ix0, iy0, px, py, 'EQUIP-DETAIL'); a.line(ix1, iy0, px, py, 'EQUIP-DETAIL'); a.line(ix1, iy1, px, py, 'EQUIP-DETAIL'); a.line(ix0, iy1, px, py, 'EQUIP-DETAIL');
    for (let i = 0; i < 4; i++) a.tube([c[i], apex], [11, 11], 5);
  } else if (v.type === 'ridge') {
    prismX(a, [[iy0, zk], [iy1, zk], [(iy0 + iy1) / 2, Z1]], ix0, ix1);
    a.box(ix0 - 5, iy0, zk, ix0 + 20, iy1, zk + 10); a.box(ix1 - 20, iy0, zk, ix1 + 5, iy1, zk + 10);
    const nb = m.max(1, m.round((ix1 - ix0) / 500)); for (let i = 1; i < nb; i++) { const x = ix0 + ((ix1 - ix0) * i) / nb; a.tube([[x, iy0, zk], [x, (iy0 + iy1) / 2, Z1]], [9, 9], 5); a.tube([[x, iy1, zk], [x, (iy0 + iy1) / 2, Z1]], [9, 9], 5); a.line(x, iy0, x, iy1, 'EQUIP-DETAIL'); }
    a.line(ix0, (iy0 + iy1) / 2, ix1, (iy0 + iy1) / 2, 'EQUIP-DETAIL');
  } else if (v.type === 'dome') {
    { const Rd = m.min(ix1 - ix0, iy1 - iy0) / 2, pr = []; for (let k = 0; k <= 8; k++) { const t = (k / 8) * PI / 2 * 0.98; pr.push([rise * m.sin(t), Rd * m.cos(t) + 10]); } lathe(a, cx, cy, zk, pr, 20); } a.ellp(cx, cy, (ix1 - ix0) / 2, (iy1 - iy0) / 2, 'EQUIP-DETAIL');
    a.box(ix0, iy0, zk, ix1, iy1, zk + 12);
  } else {   // flat glass
    a.box(ix0, iy0, zk, ix1, iy1, zk + 20); a.box(ix0 + 40, iy0 + 40, zk + 20, ix1 - 40, iy1 - 40, zk + 70); a.frame(ix0, zk + 70, ix1, zk + 70.5, iy0, iy1, 1);
    a.frame(ix0 + 20, zk, ix1 - 20, zk + 80, iy0 + 20, iy1 - 20, 40);
  }
  a.rect(ix0, iy0, ix1, iy1, 'EQUIP-DETAIL');
  a.log('Added the insulated curb and a ' + v.type + ' glazed roof light with glazing bars (plan and 3D).');
}

// ================================================================================== CIRCULATION
function straightStair(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W } = a, up = a.H - 960, n = v.steps, r = up / n;
  a.outline('EQUIP-HIDDEN');
  flight(a, cx, W - 140, YF, YB, Z0, n, r, { risers: v.closed !== false });
  if (v.landing) { a.box(X0, YB - 10, Z0 + up - 160, X1, YB, Z0 + up); }
  a.log('Added ' + n + ' treads with ' + (v.closed !== false ? 'closed risers, ' : 'open risers, ') + 'two stringers, balusters and handrails (plan and 3D).');
}
function switchback(a, v) {
  const { X0, X1, YF, YB, Z0, cx, W, D } = a, up = a.H - 960, n = v.steps, r = up / n, h = n / 2, ld = 1100, gap = 80;
  const fw = (W - gap) / 2 - 80, ym = YB - ld;
  a.outline('EQUIP-HIDDEN');
  const xL = X0 + 60 + fw / 2 + 40, xR = X1 - 60 - fw / 2 - 40;
  flight(a, xL, fw, YF, ym, Z0, h, r);
  a.box(X0 + 20, ym, Z0 + r * h - 180, X1 - 20, YB, Z0 + r * h);
  flight(a, xR, fw, ym, YF, Z0 + r * h, h, r);
  a.rect(X0 + 20, ym, X1 - 20, YB, 'EQUIP-DETAIL');
  a.log('Added two ' + h + '-tread flights, a landing slab, stringers and rails on both flights (plan and 3D).');
}
function spiral(a, v) {
  const { cx, cy, Z0, W } = a, R = W / 2 - 20, n = v.steps, up = a.H - 1000, r = up / n, step = (v.turn * PI) / 180 / n, c0 = 90;
  a.circ(cx, cy, R, 'EQUIP'); a.circ(cx, cy, c0, 'EQUIP-DETAIL');
  a.cyl(cx, cy, Z0, Z0 + up + 1000, c0, 16);
  const A0 = -PI / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const th = A0 + i * step, z = Z0 + r * (i + 1), d = step * 0.5 + 0.015;
    const q = (rr, t2) => [cx + rr * m.cos(t2), cy + rr * m.sin(t2)];
    const poly = [q(c0 - 20, th - d), q(R - 60, th - d * 0.9), q(R - 60, th + d * 0.9), q(c0 - 20, th + d)];
    a.prism(poly, z - 45, z);
    a.poly(poly, 'EQUIP-DETAIL');
    const ob = q(R - 50, th);
    a.tube([[ob[0], ob[1], z], [ob[0], ob[1], z + 900]], [8, 8], 6);
    pts.push([ob[0], ob[1], z + 900]);
  }
  a.tube(pts, pts.map(() => 20), 8);
  a.line(cx, cy, cx + R * m.cos(A0), cy + R * m.sin(A0), 'EQUIP-DETAIL');
  a.log('Added the centre column, ' + n + ' wedge treads turning ' + v.turn + ' degrees, balusters and a helical handrail (plan and 3D).');
}
function ramp(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, up = a.H - 1000;
  a.outline();
  prismX(a, [[YF, Z0], [YB, Z0], [YB, Z0 + up], [YF, Z0 + 30]], X0, X1);
  for (const sx of [-1, 1]) {
    const x = cx + sx * (W / 2 - 60);
    a.box(x - 60, YF, Z0, x + 60, YB, Z0 + 30 + 100);   // curb strip along the sides
    for (let k = 0; k < 2; k++) { const zz = k ? 900 : 650; a.tube([[x, YF + 60, Z0 + 30 + zz], [x, YB - 60, Z0 + up + zz]], [18, 18], 8); }
    const np = m.max(3, m.round(a.D / 1200)); for (let i = 0; i <= np; i++) { const f = i / np, y = YF + 60 + (a.D - 120) * f; a.tube([[x, y, Z0 + 30 + (up - 30) * f], [x, y, Z0 + 30 + (up - 30) * f + 900]], [12, 12], 6); }
    a.line(x, YF, x, YB, 'EQUIP-DETAIL');
  }
  const nl = m.round(a.D / 400); for (let i = 1; i < nl; i++) a.line(X0 + 100, YF + (a.D * i) / nl, X1 - 100, YF + (a.D * i) / nl, 'EQUIP-DETAIL');
  a.line(cx, YF + 200, cx, YB - 200, 'EQUIP-DETAIL'); a.line(cx - 120, YB - 500, cx, YB - 200, 'EQUIP-DETAIL'); a.line(cx + 120, YB - 500, cx, YB - 200, 'EQUIP-DETAIL');
  a.log('Added the sloped ramp deck, side kerbs and two-line handrails on posts, with a slope arrow in plan (plan and 3D).');
}
function balustrade(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cy } = a, hr = 50;
  a.outline();
  const np = m.max(2, m.round(W / 1200) + 1);
  for (let i = 0; i < np; i++) { const x = X0 + 40 + ((W - 80) * i) / (np - 1); a.box(x - 40, cy - 40, Z0, x + 40, cy + 40, Z1 - hr); a.rect(x - 40, cy - 40, x + 40, cy + 40, 'EQUIP-DETAIL'); }
  a.box(X0, cy - 45, Z1 - hr, X1, cy + 45, Z1); a.box(X0 + 20, cy - 35, Z0, X1 - 20, cy + 35, Z0 + 60);
  if (v.type === 'baluster') { const nb = m.floor(W / 120); for (let i = 1; i < nb; i++) { const x = X0 + (W * i) / nb; a.cyl(x, cy, Z0 + 60, Z1 - hr, 14, 8); } }
  else if (v.type === 'glass') { for (let i = 0; i < np - 1; i++) { const x0 = X0 + 40 + ((W - 80) * i) / (np - 1) + 60, x1 = X0 + 40 + ((W - 80) * (i + 1)) / (np - 1) - 60; a.box(x0, cy - 8, Z0 + 90, x1, cy + 8, Z1 - hr - 30); } }
  else { for (let k = 1; k <= 8; k++) { const z = Z0 + 60 + ((Z1 - hr - Z0 - 90) * k) / 9; a.tube([[X0 + 40, cy, z], [X1 - 40, cy, z]], [4, 4], 5); } }
  a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added posts, a top handrail, a bottom rail and ' + (v.type === 'baluster' ? 'turned balusters' : v.type === 'glass' ? 'glass infill panels' : 'horizontal stainless cables') + ' (plan and 3D).');
}
function cageLadder(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, cx } = a, w = 450, y = YB - 60;
  a.outline();
  a.box(cx - W / 2, YB - 10, Z0, cx + W / 2, YB, Z0 + 5);
  for (const s of [-1, 1]) { a.box(cx + s * w / 2 - 15, y - 25, Z0, cx + s * w / 2 + 15, y + 25, Z1); a.box(cx + s * w / 2 - 15, y - 25, Z0, cx + s * w / 2 + 15, YB, Z0 + 60); }
  const nr = m.floor((Z1 - Z0 - 300) / 300); for (let i = 0; i <= nr; i++) a.ycyl(y - 14, y + 14, cx, Z0 + 250 + i * 300, 15, 8) && a.xcyl(cx - w / 2, cx + w / 2, y, Z0 + 250 + i * 300, 13, 8);
  for (const s of [-1, 1]) { for (const z of [Z0 + 900, Z0 + 2400, Z1 - 100]) a.box(cx + s * w / 2 - 15, y, z - 30, cx + s * w / 2 + 15, YB, z + 30); }
  if (v.cage) {
    const R = 400, zs = []; for (let z = Z0 + 2300; z < Z1 - 100; z += 750) zs.push(z);
    for (const z of zs) { const pts = []; for (let k = 0; k <= 12; k++) { const th = PI + 0.5 + (k / 12) * (2 * PI - 1); pts.push([cx + R * m.sin(th), y - 90 - R * 0.55 - R * 0.55 * m.cos(th), z]); } a.tube(pts, pts.map(() => 9), 5); }
    for (const th of [PI + 0.5, PI + 1.5, PI + 2.5, PI + 3.5, PI + 4.5, PI + 5.5 - 0.0]) { if (th > 3 * PI - 0.5) continue; const px = cx + R * m.sin(th), py = y - 90 - R * 0.55 - R * 0.55 * m.cos(th); a.tube([[px, py, Z0 + 2300], [px, py, Z1 - 100]], [8, 8], 5); }
    a.ellp(cx, y - 90 - R * 0.55, R, R * 0.55, 'EQUIP-DETAIL');
  }
  a.rect(cx - w / 2 - 20, y - 25, cx + w / 2 + 20, y + 25, 'EQUIP-DETAIL');
  a.log('Added two stiles, rungs, wall brackets' + (v.cage ? ' and a safety cage of hoops with vertical straps' : '') + ' (plan and 3D).');
}
function liftShaft(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, t = 200, n = v.stops;
  const oh = 1500, pitH = 0, hs = Z1 - oh - Z0;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 150);
  a.box(X0, YB - t, Z0, X1, YB, Z1 - oh); a.box(X0, YF, Z0, X0 + t, YB, Z1 - oh); a.box(X1 - t, YF, Z0, X1, YB, Z1 - oh);
  const dw = m.min(W * 0.45, 1300), dh = 2100;
  // front wall with door openings: jambs and lintel strips for each landing
  for (let i = 0; i < n; i++) {
    const z = Z0 + 150 + ((hs - 150 - dh - 400) * i) / m.max(1, n - 1);
    a.box(X0 + t, YF, z + dh, X1 - t, YF + t, z + dh + 260 + (i < n - 1 ? 0 : 0));
    a.box(X0 + t, YF, z, cx - dw / 2, YF + t, z + dh); a.box(cx + dw / 2, YF, z, X1 - t, YF + t, z + dh);
    a.box(cx - dw / 2 + 20, YF + 40, z, cx - 10, YF + 90, z + dh - 20); a.box(cx + 10, YF + 40, z, cx + dw / 2 - 20, YF + 90, z + dh - 20);
    if (i < n - 1) a.box(X0 + t, YF, z + dh + 260, X1 - t, YF + t, Z0 + 150 + ((hs - 150 - dh - 400) * (i + 1)) / (n - 1));
    a.box(cx + dw / 2 + 40, YF - 0.01 + 5, z + 1000, cx + dw / 2 + 120, YF + 15, z + 1100);
  }
  a.box(X0 + t, YF, Z0 + 150 + ((hs - 150 - dh - 400)) + dh + 260 - 0.01, X1 - t, YF + t, Z1 - oh);
  // car and rails inside
  const cz = Z0 + 150 + (hs - 150 - dh - 400) * 0.5;
  a.box(X0 + t + 150, YF + t + 150, cz, X1 - t - 150, YB - t - 220, cz + dh + 150);
  for (const s of [-1, 1]) a.box(cx + s * (W / 2 - t - 60) - 25, YF + t + 100, Z0 + 150, cx + s * (W / 2 - t - 60) + 25, YF + t + 160, Z1 - oh);
  a.box(X0 + t + 20, YB - t - 190, Z0 + 150, X0 + t + 70, YB - t - 90, Z1 - oh);
  // overrun / machine room
  a.box(X0 - 0, YF, Z1 - oh, X1, YB, Z1 - 120); a.box(X0 + 40, YF + 40, Z1 - 120, X1 - 40, YB - 40, Z1);
  a.box(cx - 400, YF + D * 0.35, Z1 - oh - 260, cx + 400, YF + D * 0.35 + 500, Z1 - oh);
  a.rect(X0 + t, YF + t, X1 - t, YB - t, 'EQUIP-DETAIL'); a.rect(X0 + t + 150, YF + t + 150, X1 - t - 150, YB - t - 220, 'EQUIP-DETAIL');
  a.line(cx - dw / 2, YF, cx - dw / 2, YF + t, 'EQUIP-DETAIL'); a.line(cx + dw / 2, YF, cx + dw / 2, YF + t, 'EQUIP-DETAIL');
  a.line(X0 + t + 150, YF + t + 150, X1 - t - 150, YB - t - 220, 'EQUIP-DETAIL');
  a.log('Added the shaft walls, a landing door opening and call button at each of the ' + n + ' stops, the car, guide rails and the overrun above (plan and 3D).');
}

// ================================================================================== DETAILS
function column(a, v) {
  const { cx, cy, Z0, Z1, W } = a, H = a.H, ab = W - 10, sh = v.shaft, R = sh / 2;
  const capH = v.order === 'plain' ? 0 : v.order === 'ionic' ? H * 0.1 : H * 0.075, baseH = v.order === 'plain' ? H * 0.04 : H * 0.055, plH = H * 0.035;
  a.outline(); a.circ(cx, cy, R, 'EQUIP-DETAIL'); a.circ(cx, cy, R * 1.25, 'EQUIP-DETAIL');
  a.box(cx - R * 1.45, cy - R * 1.45, Z0, cx + R * 1.45, cy + R * 1.45, Z0 + plH);
  lathe(a, cx, cy, Z0 + plH, [[0, R * 1.3], [baseH * 0.4, R * 1.28], [baseH * 0.5, R * 1.12], [baseH * 0.8, R * 1.2], [baseH, R * 1.06]], 24);
  const sz0 = Z0 + plH + baseH, sz1 = Z1 - capH - H * 0.02;
  lathe(a, cx, cy, sz0, [[0, R * 1.0], [(sz1 - sz0) * 0.35, R * 1.0], [(sz1 - sz0) * 0.7, R * 0.93], [sz1 - sz0, R * 0.82]], 24);
  if (v.order === 'fluted') for (let k = 0; k < 14; k++) { const th = (k / 14) * 2 * PI, px = cx + R * 0.9 * m.cos(th), py = cy + R * 0.9 * m.sin(th); const k2 = 0.82 / 1.0; a.tube([[cx + R * 0.93 * m.cos(th), cy + R * 0.93 * m.sin(th), sz0 + 30], [cx + R * 0.93 * m.cos(th), cy + R * 0.93 * m.sin(th), sz0 + (sz1 - sz0) * 0.35], [cx + R * 0.86 * m.cos(th), cy + R * 0.86 * m.sin(th), sz0 + (sz1 - sz0) * 0.7], [cx + R * 0.76 * m.cos(th), cy + R * 0.76 * m.sin(th), sz1 - 30]], [R * 0.07, R * 0.07, R * 0.07, R * 0.07], 5); }
  if (v.order === 'plain') { a.box(cx - ab / 2, cy - ab / 2, sz1, cx + ab / 2, cy + ab / 2, Z1); a.rect(cx - ab / 2, cy - ab / 2, cx + ab / 2, cy + ab / 2, 'EQUIP-DETAIL'); }
  else {
    const z = sz1;
    lathe(a, cx, cy, z, [[0, R * 0.82], [H * 0.02, R * 0.88], [H * 0.02 + 10, R * 0.8]], 24);
    if (v.order === 'ionic') {
      a.box(cx - ab * 0.42, cy - ab * 0.2, Z1 - capH * 0.55, cx + ab * 0.42, cy + ab * 0.2, Z1 - capH * 0.3);
      for (const sx of [-1, 1]) { a.ycyl(cy - ab * 0.2, cy + ab * 0.2, cx + sx * ab * 0.4, Z1 - capH * 0.45, capH * 0.28, 14); a.ycyl(cy - ab * 0.22, cy + ab * 0.22, cx + sx * ab * 0.4, Z1 - capH * 0.45, capH * 0.12, 8); }
      a.cone(cx, cy, z + H * 0.02, Z1 - capH * 0.7, R * 0.88, R * 0.92, 24);
      a.box(cx - ab / 2, cy - ab * 0.25, Z1 - capH * 0.2, cx + ab / 2, cy + ab * 0.25, Z1);
    } else {
      a.cone(cx, cy, z + H * 0.02, Z1 - capH * 0.3, R * 0.82, ab * 0.5, 24);
      a.box(cx - ab / 2, cy - ab / 2, Z1 - capH * 0.3, cx + ab / 2, cy + ab / 2, Z1);
    }
  }
  a.log('Added the plinth, moulded base, tapered ' + (v.order === 'fluted' ? 'fluted ' : '') + 'shaft and ' + (v.order === 'plain' ? 'square block' : v.order + ' capital') + ' (plan and 3D).');
}
function arch(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a, pw = v.pier * IN, s = W - 2 * pw, vt = v.ring * IN, H = a.H;
  a.outline();
  const rise = v.type === 'segmental' ? s * 0.22 : v.type === 'pointed' ? s * 0.85 : s / 2;
  const zs = Z0 + (v.spring ?? 0.5) * (H - rise - vt - 100);        // springing height
  const sp = m.max(Z0 + 600, zs);
  let I = [];   // intrados [x,z] and outward normal
  const nSeg = 14;
  if (v.type === 'round') { for (let i = 0; i <= nSeg; i++) { const t = PI - (i / nSeg) * PI; I.push([cx + (s / 2) * m.cos(t), sp + (s / 2) * m.sin(t), m.cos(t), m.sin(t)]); } }
  else if (v.type === 'segmental') { const R = (s * s / 4 + rise * rise) / (2 * rise), zc = sp + rise - R, t0 = m.asin(s / 2 / R); for (let i = 0; i <= nSeg; i++) { const t = PI / 2 + t0 - (i / nSeg) * 2 * t0; I.push([cx + R * m.cos(t), zc + R * m.sin(t), m.cos(t), m.sin(t)]); } }
  else { const R = s, ap = m.acos(0.5); for (let i = 0; i <= nSeg; i++) { const f = i / nSeg, left = f < 0.5, u = left ? f * 2 : (f - 0.5) * 2; const cxc = left ? cx + s / 2 : cx - s / 2; const t = left ? PI - u * (PI - (PI - ap)) * 1 : ap + (1 - u) * 0; let th; if (left) th = PI - u * ap; else th = ap - u * ap; I.push([cxc + R * m.cos(th), sp + R * m.sin(th) - 0, m.cos(th), m.sin(th)]); } I = I.map((p, i) => p); I.sort((p, q) => p[0] - q[0]); }
  const Q = I.map(([x, z, nx, nz]) => [x + nx * vt, z + nz * vt]);
  if (v.type === 'pointed') { Q[0][0] = I[0][0] - vt; }
  for (let i = 0; i < I.length - 1; i++) {
    const key = i === m.floor((I.length - 1) / 2) && v.key;
    { const gx = 8, mid = (p, q) => [p[0] + (q[0] - p[0]) * 0.02, p[1] + (q[1] - p[1]) * 0.02], P0 = [I[i][0], I[i][1]], P1 = [I[i + 1][0], I[i + 1][1]]; prismY(a, [P0, P1, Q[i + 1], Q[i]].map((p, k, arr) => { const c = [(P0[0] + P1[0] + Q[i][0] + Q[i + 1][0]) / 4, (P0[1] + P1[1] + Q[i][1] + Q[i + 1][1]) / 4], d = m.hypot(p[0] - c[0], p[1] - c[1]) || 1; return [p[0] - (p[0] - c[0]) * (gx / d), p[1] - (p[1] - c[1]) * (gx / d)]; }), YF + (key ? 0 : 20), YB - 0); }
  }
  if (v.key) { const k = m.floor((I.length - 1) / 2); a.box(I[k][0] - vt * 0.3, YF, I[k][1] - 20, I[k][0] + vt * 0.3, YF + 40, Q[k][1] + 80); }
  a.box(X0, YF + 70, Z0, X0 + pw, YB, sp); a.box(X1 - pw, YF + 70, Z0, X1, YB, sp);
  for (const sx of [-1, 1]) a.box(cx + sx * (s / 2 + pw / 2) - pw / 2 - 30, YF + 20, sp - 80, cx + sx * (s / 2 + pw / 2) + pw / 2 + 30, YB, sp);    // impost
  const ns = 28;
  for (let k = 0; k < ns; k++) {
    const x0 = X0 + (W * k) / ns, x1 = X0 + (W * (k + 1)) / ns, xm = (x0 + x1) / 2;
    let zb = sp;
    if (xm > Q[0][0] && xm < Q[Q.length - 1][0]) for (let i = 0; i < Q.length - 1; i++) if (xm >= Q[i][0] && xm <= Q[i + 1][0]) zb = Q[i][1] + ((Q[i + 1][1] - Q[i][1]) * (xm - Q[i][0])) / (Q[i + 1][0] - Q[i][0] || 1);
    zb = m.max(zb, sp) - 20;
    if (Z1 - zb > 10) a.box(x0, YF + 70, zb, x1, YB, Z1);
  }
  a.line(X0 + pw, YF, X0 + pw, YB, 'EQUIP-DETAIL'); a.line(X1 - pw, YF, X1 - pw, YB, 'EQUIP-DETAIL'); a.rect(X0, YF + 40, X1, YB, 'EQUIP-DETAIL');
  a.log('Added two piers with imposts, ' + (I.length - 1) + ' wedge voussoirs' + (v.key ? ' with a projecting keystone' : '') + ' and the wall mass above (plan and 3D).');
}
function corbel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, D, H, W } = a;
  a.outline();
  const P = v.type === 'stepped' ? [[0, 0.2], [0.2, 0.2], [0.2, 0.42], [0.45, 0.42], [0.45, 0.68], [0.7, 0.68], [0.7, 1], [1, 1]]
    : v.type === 'scroll' ? [[0, 0.1], [0.1, 0.12], [0.2, 0.2], [0.3, 0.3], [0.4, 0.44], [0.5, 0.58], [0.6, 0.7], [0.7, 0.82], [0.8, 0.92], [0.9, 0.98], [1, 1]]
    : [[0, 0.3], [0.15, 0.3], [0.3, 0.38], [0.5, 0.55], [0.7, 0.8], [0.85, 0.95], [1, 1]];
  profile(a, P, X0 + W * 0.15, X1 - W * 0.15, D, Z0, H);
  a.box(X0, YF, Z1 - H * 0.12, X1, YB, Z1);
  if (v.type === 'scroll') { for (const sx of [0.15, 0.85]) a.ycyl(YF + D * 0.1, YB, X0 + W * sx, Z0 + H * 0.2, H * 0.12, 12); }
  if (v.type === 'stepped') a.box(X0 + W * 0.15, YF + D * 0.15, Z0 - 0.01 + 5, X1 - W * 0.15, YB, Z0 + 20);
  a.line(X0 + W * 0.15, YF, X0 + W * 0.15, YB, 'EQUIP-DETAIL'); a.line(X1 - W * 0.15, YF, X1 - W * 0.15, YB, 'EQUIP-DETAIL');
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the ' + v.type + ' corbel profile projecting from the wall under a top slab (plan and 3D).');
}
function moulding(a, v) {
  const { X0, X1, YF, YB, Z0, D, H } = a;
  a.outline();
  const sm = (n, f) => Array.from({ length: n + 1 }, (_, i) => [i / n, f(i / n)]);
  const P = {
    crown: [[0, 0], ...sm(10, (t) => 0.82 * m.sin(t * PI / 2)).map(([t, u]) => [0.3 + t * 0.7, u]).slice(0, 11), [1, 0]],
    base: [[0, 0.7], [0.6, 0.7], [0.65, 0.82], [0.72, 0.82], [0.75, 0.7], [0.8, 0.74], [0.92, 0.86], [0.96, 1], [1, 1]].map(([v1, u]) => [v1, u * 0.8]),
    architrave: [[0, 0.35], [0.1, 0.35], [0.1, 0.6], [0.14, 0.6], [0.14, 0.4], [0.3, 0.4], [0.3, 0.55], [0.38, 0.55], [0.38, 0.8], [0.45, 0.8], [0.5, 1], [0.55, 1], [0.6, 0.8], [0.7, 0.8], [0.7, 0.45], [1, 0.45]],
    dado: [[0, 0.5], [0.15, 0.5], [0.15, 0.65], [0.3, 0.65], [0.3, 0.5], [0.7, 0.5], [0.7, 1], [0.9, 1], [0.95, 0.8], [1, 0.8]],
    picture: [[0, 0.3], [0.1, 0.3], [0.4, 1], [0.6, 1], [0.9, 0.3], [1, 0.3]],
  }[v.prof];
  const pts = v.prof === 'crown' ? [[0, 0.1], [0.3, 0.1], ...P.slice(1, 11).map(([t, u]) => [t, u]), [1, 0.82], [1, 0.75]] : P;
  profile(a, pts, X0, X1, D, Z0, H);
  a.line(X0, YF + D * 0.1, X1, YF + D * 0.1, 'EQUIP-DETAIL');
  a.log('Added the ' + v.prof + ' moulding profile extruded along its length, shown mounted to a wall (plan and 3D).');
}
function entranceSteps(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a, n = v.steps, cheek = v.cheek * IN, up = a.H - 200 - (v.rail ? 900 : 0), r = up / n, g = D / (n + (v.land ? 1 : 0));
  a.outline();
  for (let i = 0; i < n; i++) a.box(X0 + cheek, YF + g * i, Z0, X1 - cheek, YB, Z0 + r * (i + 1));
  if (v.land) a.box(X0 + cheek, YB - g, Z0, X1 - cheek, YB, Z0 + up);
  for (let i = 0; i < n; i++) a.box(X0 + cheek, YF + g * i - 25 < YF ? YF : YF + g * i - 25, Z0 + r * (i + 1) - 30, X1 - cheek, YF + g * i + 15, Z0 + r * (i + 1));
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? X0 : X1 - cheek, x1 = sx < 0 ? X0 + cheek : X1;
    prismX(a, [[YF, Z0], [YB, Z0], [YB, Z0 + up + 200], [YF, Z0 + r + 200]], x0, x1);
    a.rect(x0, YF, x1, YB, 'EQUIP-DETAIL');
    if (v.rail) { const x = (x0 + x1) / 2; a.tube([[x, YF + 100, Z0 + r + 200 + 900], [x, YB - 100, Z0 + up + 200 + 900]], [20, 20], 8); for (let k = 0; k <= 3; k++) { const f = k / 3, y = YF + 100 + (D - 200) * f, z = Z0 + r + 200 + (up - r) * f; a.tube([[x, y, z], [x, y, z + 900]], [12, 12], 6); } }
  }
  for (let i = 1; i <= n; i++) a.line(X0 + cheek, YF + g * i, X1 - cheek, YF + g * i, 'EQUIP-DETAIL');
  a.log('Added ' + n + ' solid steps with bullnose edges, ' + (v.land ? 'a landing, ' : '') + 'sloped cheek walls' + (v.rail ? ' and a handrail on each cheek' : '') + ' (plan and 3D).');
}
function pedestal(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy, H } = a, bh = H * 0.2, ch = H * 0.12, ins = (i) => W * 0.5 * (1 - i);
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + bh * 0.5); a.box(X0 + 20, YF + 20, Z0 + bh * 0.5, X1 - 20, YB - 20, Z0 + bh * 0.8); a.box(X0 + 45, YF + 45, Z0 + bh * 0.8, X1 - 45, YB - 45, Z0 + bh);
  const dz0 = Z0 + bh, dz1 = Z1 - ch, di = W * 0.08;
  a.box(X0 + di, YF + di, dz0, X1 - di, YB - di, dz1);
  if (v.panel) a.frame(X0 + di + 30, dz0 + 80, X1 - di - 30, dz1 - 80, YF + di - 8, YF + di, 28);
  a.box(X0 + 45, YF + 45, dz1, X1 - 45, YB - 45, dz1 + ch * 0.3); a.box(X0 + 20, YF + 20, dz1 + ch * 0.3, X1 - 20, YB - 20, dz1 + ch * 0.65); a.box(X0, YF, dz1 + ch * 0.65, X1, YB, Z1);
  if (v.urn) { lathe(a, cx, cy, Z1 - 0.01, [[0, 1]], 6); }
  a.rect(X0 + di, YF + di, X1 - di, YB - di, 'EQUIP-DETAIL'); a.rect(X0 + 45, YF + 45, X1 - 45, YB - 45, 'EQUIP-DETAIL');
  a.log('Added the stepped base, die' + (v.panel ? ' with a raised panel' : '') + ' and capping cornice (plan and 3D).');
}
function lintel(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx } = a;
  a.outline();
  if (v.type === 'plain') { a.box(X0, YF, Z0, X1, YB, Z1); a.box(X0 - 0, YF, Z1 - 40, X1, YF + 30, Z1); a.box(X0 + 40, YF - 0.01 + 6, Z0 - 0.01 + 4, X1 - 40, YF + 30, Z0 + 30); }
  else {
    const n = v.n, sk = 250;
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n, xa = X0 + 140 + (W - 280) * f0, xb = X0 + 140 + (W - 280) * f1, ca = (cx - xa) / (W / 2), cb = (cx - xb) / (W / 2);
      const pa = (xa - cx) * 0.18, pb = (xb - cx) * 0.18;
      prismY(a, [[xa + 6, Z0], [xb - 6, Z0], [xb - 6 + (xb - cx) * 0.12, Z1], [xa + 6 + (xa - cx) * 0.12, Z1]].map(([x, z]) => [m.max(X0, m.min(X1, x)), z]), YF + (i === m.floor(n / 2) && v.key ? 0 : 0), YB);
    }
    a.box(X0, YF + 60, Z0, X0 + 140, YB, Z1); a.box(X1 - 140, YF + 60, Z0, X1, YB, Z1);
    if (v.key) a.box(cx - W * 0.04, YF, Z0 - 0.01 + 4, cx + W * 0.04, YF + 30, Z1);
    if (v.hood) { a.box(X0 - 0.01 + 4, YF, Z1 - 70, X1, YB, Z1); }
    for (let i = 1; i < n; i++) { const x = X0 + 140 + ((W - 280) * i) / n; a.line(x, YF + 20, x, YB, 'EQUIP-DETAIL'); }
  }
  a.line(X0, YF + 20, X1, YF + 20, 'EQUIP-DETAIL');
  a.log('Added the ' + (v.type === 'plain' ? 'stone lintel block with a drip groove and a projecting cap' : v.n + ' tapered voussoir blocks of a flat arch between end blocks' + (v.key ? ' with a deeper keystone' : '')) + ' (plan and 3D).');
}

// ================================================================================== MASSING
function tower(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, fl = v.floor * IN;
  let z = Z0;
  const tiers = v.tiers;
  const totalH = tiers.reduce((s, t) => s + t[2], 0);
  a.outline();
  for (const [wf, df, nF, kind] of tiers) {
    const h = nF * fl, w = W * wf, d = D * df, x0 = cx - w / 2, x1 = cx + w / 2, y0 = YB - d, y1 = YB - (kind === 'frontflush' ? 0 : 0);
    const yb = YB - D * (1 - 0) + (D - d);   // keep back-aligned
    const yFront = YF + (D - d) / 2, yBack = YB - (D - d) / 2;
    a.box(x0 + 10, yFront + 120, z, x1 - 10, yBack - 120, z + h);
    for (let f = 0; f <= nF; f++) { const zz = z + f * fl; a.box(x0, yFront, zz - 40 < Z0 ? Z0 : zz - 40, x1, yBack, m.min(zz + 40, z + h)); }
    const nb = m.max(2, m.round(w / 1500));
    for (let b = 0; b < nb; b++) { const bx0 = x0 + 100 + ((w - 200) * b) / nb + 40, bx1 = x0 + 100 + ((w - 200) * (b + 1)) / nb - 40; a.box(bx0, yFront + 60, z + 120, bx1, yFront + 125, z + h - 40); }
    const nbs = m.max(1, m.round(d / 2500));
    for (const sx of [-1, 1]) for (let b = 0; b < nbs; b++) { const by0 = yFront + 100 + ((d - 200) * b) / nbs + 40, by1 = yFront + 100 + ((d - 200) * (b + 1)) / nbs - 40; a.box(sx < 0 ? x0 + 60 : x1 - 125, by0, z + 120, sx < 0 ? x0 + 125 : x1 - 60, by1, z + h - 40); }
    a.rect(x0, yFront, x1, yBack, 'EQUIP-DETAIL');
    z += h;
  }
  if (v.crown === 'plant') { const t = tiers[tiers.length - 1]; a.box(cx - W * t[0] * 0.3, YB - D * 0.5 - D * t[1] * 0.25, z, cx + W * t[0] * 0.3, YB - D * 0.5 + D * t[1] * 0.25, m.min(Z1, z + 2400)); }
  if (v.crown === 'spire') { a.cone(cx, (YF + YB) / 2, z, Z1, 400, 15, 10); }
  a.log('Added ' + tiers.length + ' stacked ' + (tiers.length > 1 ? 'tiers' : 'tier') + ' with floor-slab bands and window bays on the front and both sides' + (v.crown ? ', and a roof ' + (v.crown === 'plant' ? 'plant enclosure' : 'spire') : '') + ' (plan and 3D).');
}
function courtyard(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, wing = v.wing * IN, fl = 156 * IN / IN * 1, nF = v.floors, fh = (v.glass ? a.H - 1600 : a.H) / nF;
  a.outline();
  const top = Z0 + nF * fh;
  const wings = [[X0, YF, X1, YF + wing], [X0, YB - wing, X1, YB], [X0, YF + wing, X0 + wing, YB - wing], [X1 - wing, YF + wing, X1, YB - wing]];
  for (const [x0, y0, x1, y1] of wings) { a.box(x0, y0, Z0, x1, y1, top); }
  for (let f = 1; f <= nF; f++) { const z = Z0 + f * fh; a.box(X0 + wing - 0.01 + 0, YF + wing - 60, z - 40, X1 - wing, YF + wing, z - 0.01 + 40 > Z1 ? Z1 : z + 40); a.box(X0 + wing - 60, YF + wing, z - 40, X0 + wing, YB - wing, z + 40); a.box(X1 - wing, YF + wing, z - 40, X1 - wing + 60, YB - wing, z + 40); a.box(X0 + wing, YB - wing, z - 40, X1 - wing, YB - wing + 60, z + 40); }
  for (let f = 0; f < nF; f++) { const z = Z0 + f * fh + fh * 0.25; for (let b = 1; b < m.round(W / 1700); b++) a.box(X0 + (W * b) / m.round(W / 1700) - 450, YF - 0.01 + 4, z, X0 + (W * b) / m.round(W / 1700) + 450, YF + 20, z + fh * 0.5); }
  if (v.glass) {
    const iw = W - 2 * wing, id = D - 2 * wing;
    a.frame(X0 + wing, Z0 + 0, X1 - wing, Z0 + 0.5, YF + wing, YB - wing, 1);
    prismX(a, [[YF + wing, top], [YB - wing, top], [(YF + YB) / 2, Z1]], X0 + wing, X1 - wing);
    for (let i = 1; i < 6; i++) { const x = X0 + wing + (iw * i) / 6; a.tube([[x, YF + wing, top], [x, (YF + YB) / 2, Z1]], [9, 9], 5); a.tube([[x, YB - wing, top], [x, (YF + YB) / 2, Z1]], [9, 9], 5); }
    a.line(X0 + wing, cy, X1 - wing, cy, 'EQUIP-DETAIL');
  } else { a.box(X0 + wing, YF + wing, Z0, X1 - wing, YB - wing, Z0 + 80); const nt = v.trees ?? 0; for (let i = 0; i < nt; i++) { const x = X0 + wing + ((W - 2 * wing) * (i + 0.5)) / nt; a.cyl(x, cy, Z0, Z0 + 1600, 90, 8); a.ell(x, cy, Z0 + 2200, 700, 700, 800, 10, 6); a.circ(x, cy, 700, 'EQUIP-DETAIL'); } }
  a.rect(X0 + wing, YF + wing, X1 - wing, YB - wing, 'EQUIP-DETAIL');
  a.log('Added four wings of ' + nF + ' floors with floor bands and window strips around a ' + (v.glass ? 'central void closed with a ridged glazed roof' : 'open court with a paved floor and trees') + ' (plan and 3D).');
}
function roofForm(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, wh = v.wall * IN, zw = Z0 + wh, rise = Z1 - zw;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, zw);
  for (let b = 1; b < m.round(W / 1500); b++) { const x = X0 + (W * b) / m.round(W / 1500); a.box(x - 350, YF - 0.01 + 3, Z0 + wh * 0.3, x + 350, YF + 18, Z0 + wh * 0.85); }
  a.box(cx - 450, YF - 0.01 + 3, Z0, cx + 450, YF + 22, Z0 + wh * 0.8);
  const o = 200;   // eave overhang is kept inside the body: roofs run to the wall faces
  switch (v.type) {
    case 'gable': prismY(a, [[X0, zw], [X1, zw], [cx, Z1]], YF, YB); a.line(cx, YF, cx, YB); break;
    case 'monopitch': prismY(a, [[X0, zw], [X1, zw], [X1, Z1], [X0, zw + rise * 0.2]], YF, YB); break;
    case 'gambrel': prismY(a, [[X0, zw], [X1, zw], [X1 - W * 0.12, zw + rise * 0.65], [X0 + W * 0.12, zw + rise * 0.65]], YF, YB); prismY(a, [[X0 + W * 0.12, zw + rise * 0.65], [X1 - W * 0.12, zw + rise * 0.65], [cx + W * 0.06, Z1], [cx - W * 0.06, Z1]], YF, YB); a.line(X0 + W * 0.12, YF, X0 + W * 0.12, YB, 'EQUIP-DETAIL'); a.line(X1 - W * 0.12, YF, X1 - W * 0.12, YB, 'EQUIP-DETAIL'); break;
    case 'butterfly': prismY(a, [[X0, zw + rise], [cx, zw], [cx, zw + 120], [X0, Z1]], YF, YB); prismY(a, [[X1, zw + rise], [cx, zw], [cx, zw + 120], [X1, Z1]], YF, YB); a.line(cx, YF, cx, YB, 'EQUIP-DETAIL'); break;
    case 'sawtooth': { const k = v.teeth; for (let i = 0; i < k; i++) { const x0 = X0 + (W * i) / k, x1 = X0 + (W * (i + 1)) / k; prismY(a, [[x0, zw], [x1, zw], [x1, Z1], [x0, zw + rise * 0.12]], YF, YB); a.box(x1 - 20, YF, zw + rise * 0.12, x1, YB, Z1 - rise * 0.45); a.line(x1, YF, x1, YB, 'EQUIP-DETAIL'); } break; }
    case 'barrel': { const k = 14; for (let i = 0; i < k; i++) { const t0 = PI * i / k, t1 = PI * (i + 1) / k; const R = W / 2; const p = (t) => [cx - R * m.cos(t), zw + rise * m.sin(t)]; prismY(a, [[...p(t0)], [...p(t1)], [cx, zw]], YF, YB); } a.line(cx, YF, cx, YB, 'EQUIP-DETAIL'); break; }
    case 'hip': {
      const r1 = m.min(W, D) * 0.5, rx = m.max(0, (W - D) / 2) * (v.ridge ?? 1);
      const A = [X0, YF, zw], B = [X1, YF, zw], C = [X1, YB, zw], Dd = [X0, YB, zw], P = [cx - rx, cy, Z1], Q = [cx + rx, cy, Z1];
      const tr = (p, q, r) => a.t.push([p, q, r]);
      tr(A, B, Q); tr(A, Q, P); tr(B, C, Q); tr(C, Dd, P); tr(C, P, Q); tr(Dd, A, P); tr(A, Dd, C); tr(A, C, B);
      a.line(X0, YF, cx - rx, cy); a.line(X0, YB, cx - rx, cy); a.line(X1, YF, cx + rx, cy); a.line(X1, YB, cx + rx, cy); a.line(cx - rx, cy, cx + rx, cy);
      break;
    }
    case 'flat': a.box(X0, YF, zw, X1, YB, Z1); a.box(X0, YF, Z1 - 60, X1, YF + 60, Z1 + 0); a.box(cx - W * 0.2, cy - D * 0.2, Z1 - 0.01, cx + W * 0.2, cy + D * 0.2, Z1); break;
  }
  a.log('Added the walled block with door and window openings under a ' + v.type + ' roof form (plan and 3D).');
}
function pavilion(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, cols = v.cols, bays = cols - 1;
  a.outline();
  a.box(X0, YF, Z0, X1, YB, Z0 + 250);
  const cz1 = Z1 - v.roofH * IN;
  const nx = v.cols, ny = v.rowsC;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = X0 + 300 + ((W - 600) * i) / (nx - 1), y = YF + 300 + ((D - 600) * j) / (ny - 1);
    if (v.round) a.cyl(x, y, Z0 + 250, cz1, 120, 14); else a.box(x - 100, y - 100, Z0 + 250, x + 100, y + 100, cz1);
    a.circ(x, y, 120, 'EQUIP-DETAIL');
  }
  if (v.roof === 'flat') { a.box(X0, YF, cz1, X1, YB, Z1 - 40); a.box(X0 + 40, YF + 40, Z1 - 40, X1 - 40, YB - 40, Z1); }
  else if (v.roof === 'hip') { const tr = (p, q, r) => a.t.push([p, q, r]); const z = cz1, A = [X0, YF, z], B = [X1, YF, z], C = [X1, YB, z], Dd = [X0, YB, z], P = [cx, cy, Z1]; a.box(X0, YF, z - 120, X1, YB, z); tr(A, B, P); tr(B, C, P); tr(C, Dd, P); tr(Dd, A, P); }
  else prismY(a, [[X0, cz1], [X1, cz1], [X1, cz1 + (Z1 - cz1) * 0.35], [cx, Z1], [X0, cz1 + (Z1 - cz1) * 0.35]], YF, YB);
  if (v.glass) { for (const y of [YF + 300, YB - 300]) a.box(X0 + 300, y - 8, Z0 + 250, X1 - 300, y + 8, cz1 - 200); for (const x of [X0 + 300, X1 - 300]) a.box(x - 8, YF + 300, Z0 + 250, x + 8, YB - 300, cz1 - 200); }
  if (v.bench) { a.box(cx - W * 0.2, cy - 300, Z0 + 250, cx + W * 0.2, cy + 300, Z0 + 250 + 450); }
  a.rect(X0, YF, X1, YB, 'EQUIP-DETAIL');
  a.log('Added the raised platform, ' + nx * ny + ' ' + (v.round ? 'round' : 'square') + ' columns and a ' + v.roof + ' roof' + (v.glass ? ' with glass walls' : '') + ' (plan and 3D).');
}
function bridge(a, v) {
  const { X0, X1, YF, YB, Z0, Z1, W, D, cx, cy } = a, dk = 200, zd = Z0 + v.under * IN;
  a.outline();
  const wd = D - 200;
  a.box(X0, YF + 100, zd, X1, YB - 100, zd + dk);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    a.box(sx < 0 ? X0 - 0 : X1 - 400, cy + sy * (wd / 2 - 40) - 40, zd + dk, sx < 0 ? X0 + 400 : X1, cy + sy * (wd / 2 - 40) + 40, Z1 - 0.01 - (v.type === 'beam' ? 800 : 0) + 0);
  }
  // abutments
  for (const sx of [-1, 1]) a.box(sx < 0 ? X0 : X1 - 600, YF + 60, Z0, sx < 0 ? X0 + 600 : X1, YB - 60, zd);
  if (v.type === 'beam') {
    for (const sy of [-1, 1]) { const y = cy + sy * (wd / 2 - 40); a.tube([[X0 + 600, y, zd + 1000], [X1 - 600, y, zd + 1000]], [30, 30], 8); a.tube([[X0 + 600, y, zd + 500], [X1 - 600, y, zd + 500]], [18, 18], 8); const np = m.round(W / 1200); for (let i = 0; i <= np; i++) { const x = X0 + 600 + ((W - 1200) * i) / np; a.tube([[x, y, zd + dk], [x, y, zd + 1000]], [14, 14], 6); } }
    if (v.piers) for (let i = 1; i <= v.piers; i++) { const x = X0 + (W * i) / (v.piers + 1); a.box(x - 200, cy - wd / 2 + 100, Z0, x + 200, cy + wd / 2 - 100, zd - 0.01); }
    a.box(X0 + 600, YF + 150, zd - 450, X1 - 600, YF + 250, zd); a.box(X0 + 600, YB - 250, zd - 450, X1 - 600, YB - 150, zd);
  } else if (v.type === 'truss') {
    const h = Z1 - (zd + dk), pan = v.panels, pw = (W - 1200) / pan;
    for (const sy of [-1, 1]) {
      const y = cy + sy * (wd / 2 - 40);
      a.tube([[X0 + 600, y, zd + dk], [X1 - 600, y, zd + dk]], [40, 40], 8); a.tube([[X0 + 600, y, Z1 - 40], [X1 - 600, y, Z1 - 40]], [40, 40], 8);
      for (let i = 0; i <= pan; i++) { const x = X0 + 600 + pw * i; a.tube([[x, y, zd + dk], [x, y, Z1 - 40]], [26, 26], 6); if (i < pan) a.tube(i % 2 ? [[x, y, Z1 - 40], [x + pw, y, zd + dk]] : [[x, y, zd + dk], [x + pw, y, Z1 - 40]], [24, 24], 6); }
      a.line(X0 + 600, y, X1 - 600, y, 'EQUIP-DETAIL');
    }
    for (let i = 0; i <= pan; i++) { const x = X0 + 600 + pw * i; a.tube([[x, cy - wd / 2 + 40, Z1 - 40], [x, cy + wd / 2 - 40, Z1 - 40]], [16, 16], 6); }
    a.box(X0 + 600, YF + 150, zd - 400, X1 - 600, YF + 250, zd); a.box(X0 + 600, YB - 250, zd - 400, X1 - 600, YB - 150, zd);
  } else {  // arch
    const R = (W - 1200) / 2, rise = Z1 - (zd + dk) - 60, n = 16;
    for (const sy of [-1, 1]) {
      const y = cy + sy * (wd / 2 - 40), pts = [];
      for (let i = 0; i <= n; i++) { const t = PI * i / n; const f = (i / n) * 2 - 1; pts.push([cx + R * -m.cos(t), y, zd + dk + rise * m.sin(t) * 1]); }
      a.tube(pts, pts.map(() => 55), 8);
      for (let i = 1; i < n; i++) { a.tube([[pts[i][0], y, pts[i][2]], [pts[i][0], y, zd + dk]], [8, 8], 5); }
      a.line(X0 + 600, y, X1 - 600, y, 'EQUIP-DETAIL');
    }
    a.tube([[cx - R, cy - wd / 2 + 40, zd + dk + 40], [cx + R, cy - wd / 2 + 40, zd + dk + 40]], [35, 35], 6); a.tube([[cx - R, cy + wd / 2 - 40, zd + dk + 40], [cx + R, cy + wd / 2 - 40, zd + dk + 40]], [35, 35], 6);
  }
  a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the deck, abutments, handrails with posts and a ' + v.type + ' structure along the span (plan and 3D).');
}

const sizes = (list) => list;
export default [
  // ---------------------------------------------------------------- envelope
  fam({ cat: 'architecture/envelope', title: 'Generic punched window unit', desc: (v) => `Window ${v.units > 1 ? v.units + ' units across' : 'unit'} with sill, head trim, frame and glass${v.type === 'dh' ? ', upper and lower sashes with a meeting rail' : v.type === 'casement' ? ', side-hung casements with handles' : v.type === 'awning' ? ', top-hung sashes with stays' : ''} and ${v.cols}x${v.rows} muntins.`,
    vs: [['fixed picture, 48 x 48 in', 48, 6, 48, 36, { type: 'fixed', units: 1, cols: 1, rows: 1 }], ['double hung, 30 x 60 in', 30, 6, 60, 30, { type: 'dh', units: 1, cols: 2, rows: 3 }],
      ['double hung pair, 60 x 60 in', 60, 6, 60, 30, { type: 'dh', units: 2, cols: 1, rows: 2 }], ['casement pair, 48 x 54 in', 48, 6, 54, 32, { type: 'casement', units: 2, cols: 1, rows: 1 }], ['awning ribbon, 72 x 24 in', 72, 6, 24, 66, { type: 'awning', units: 3, cols: 1, rows: 1 }]],
    build: windowUnit }),
  fam({ cat: 'architecture/envelope', title: 'Generic curtain wall module', desc: (v) => `Curtain wall section ${v.bays} bays wide and ${v.rows} lites high with mullions, transoms, glass${v.spandrel ? ' and an opaque spandrel band' : ''}${v.vent ? ' and vent flaps' : ''}.`,
    vs: [['2 bays, 1 storey, 120 in', 120, 8, 156, 0, { bays: 2, rows: 2, spandrel: 1100 }], ['3 bays, 1 storey, 180 in', 180, 8, 156, 0, { bays: 3, rows: 2, spandrel: 1100, vent: true }], ['4 bays, 2 storeys, 240 in', 240, 8, 312, 0, { bays: 4, rows: 4, spandrel: 1100 }], ],
    build: curtainWall }),
  fam({ cat: 'architecture/envelope', title: 'Generic brise-soleil louvre panel', desc: (v) => `Sun-shading panel with ${v.n} ${v.dir === 'horizontal' ? 'angled horizontal blades between side rails' : 'vertical fins on a back rail'}.`,
    vs: [['horizontal blades, 60 x 48 in', 60, 12, 48, 0, { dir: 'horizontal', n: 8, deep: 1 }], ['horizontal blades, deep, 96 x 72 in', 96, 20, 72, 0, { dir: 'horizontal', n: 9, deep: 1.1, blade: 40 }], ['vertical fins, 72 x 96 in', 72, 18, 96, 0, { dir: 'vertical', n: 12 }], ['angled fins, 96 x 120 in', 96, 22, 120, 0, { dir: 'vertical', n: 16, tilt: 160 }], ],
    build: louvre }),
  fam({ cat: 'architecture/envelope', title: 'Generic parapet and cornice length', desc: (v) => `Building edge piece, 4 ft long, with a ${v.prof} profile${v.brackets ? ' and bracket blocks' : ''} drawn as a stepped extrusion.`,
    vs: [['coping, 48 in', 48, 12, 18, 0, { prof: 'coping' }], ['flat parapet, 48 in', 48, 10, 30, 0, { prof: 'flat', cap: true }], ['bracketed cornice, 48 in', 48, 18, 30, 0, { prof: 'cornice', brackets: true }], ['stepped cornice, 48 in', 48, 14, 24, 0, { prof: 'stepped' }]],
    build: parapet }),
  fam({ cat: 'architecture/envelope', title: 'Generic entrance canopy', desc: (v) => `${v.type === 'glass' ? 'Glass canopy with ' + v.panes + ' panes on rods and wall plate' : v.type === 'slab' ? 'Cantilevered concrete slab canopy with two round columns' : 'Sloped soffit canopy hung from the wall on rods'}.`,
    vs: [['glass, 72 x 40 in', 72, 40, 36, 96, { type: 'glass', panes: 2 }], ['glass, 120 x 48 in', 120, 48, 40, 102, { type: 'glass', panes: 3 }], ['slab on columns, 144 x 72 in', 144, 72, 120, 0, { type: 'slab' }], ['rod hung, 84 x 36 in', 84, 36, 24, 100, { type: 'rod' }]],
    build: canopy }),
  fam({ cat: 'architecture/envelope', title: 'Generic roof light', desc: (v) => `Roof light on an insulated curb: ${v.type} glazing with bars, drawn over the curb.`,
    vs: [['pyramid, 48 x 48 in', 48, 48, 30, 0, { type: 'pyramid' }], ['pyramid, 72 x 72 in', 72, 72, 42, 0, { type: 'pyramid' }], ['ridge, 48 x 96 in', 48, 96, 30, 0, { type: 'ridge' }], ['dome, 48 x 48 in', 48, 48, 24, 0, { type: 'dome' }], ['flat glass, 60 x 60 in', 60, 60, 12, 0, { type: 'flat' }]],
    build: skylight }),
  // ---------------------------------------------------------------- circulation
  fam({ cat: 'architecture/circulation', title: 'Generic straight stair', desc: (v) => `Straight flight of ${v.steps} treads between stringers, ${v.closed === false ? 'open' : 'closed'} risers, balusters and two handrails.`,
    vs: [['9 treads, 36 in rise', 48, 108, 72, 0, { steps: 6, closed: true }], ['13 treads, 7 ft rise', 48, 156, 120, 0, { steps: 12, closed: true }], ['open risers, 15 treads, 9 ft rise', 48, 192, 144, 0, { steps: 15, closed: false }], ['steel open, 10 treads, 6 ft rise', 40, 120, 108, 0, { steps: 10, closed: false }]],
    build: straightStair }),
  fam({ cat: 'architecture/circulation', title: 'Generic switchback stair', desc: (v) => `Two ${v.steps / 2}-tread flights with a half landing, stringers, balusters and a handrail on both flights.`,
    vs: [['10 treads, 5 ft rise', 96, 120, 96, 0, { steps: 10 }], ['16 treads, 8 ft rise', 108, 168, 132, 0, { steps: 16 }], ['22 treads, 11 ft rise', 120, 216, 168, 0, { steps: 22 }]],
    build: switchback }),
  fam({ cat: 'architecture/circulation', title: 'Generic spiral stair', desc: (v) => `Spiral stair of ${v.steps} wedge treads turning ${v.turn} degrees round a centre column, with balusters and a helical handrail.`,
    vs: [['48 in diameter, 9 treads', 48, 48, 118, 0, { steps: 11, turn: 270 }], ['60 in diameter, 12 treads', 60, 60, 128, 0, { steps: 13, turn: 360 }], ['72 in diameter, 14 treads', 72, 72, 138, 0, { steps: 15, turn: 360 }], ['84 in diameter, 18 treads', 84, 84, 166, 0, { steps: 20, turn: 450 }]],
    build: spiral }),
  fam({ cat: 'architecture/circulation', title: 'Generic access ramp', desc: 'Sloped deck on a wedge with side kerbs and two-line handrails on posts and a slope arrow.',
    vs: [['1:12, 30 in rise', 48, 360, 66, 0, {}], ['1:12, 18 in rise, short', 48, 216, 54, 0, {}], ['wide 1:15, 24 in rise', 72, 360, 60, 0, {}], ],
    build: ramp }),
  fam({ cat: 'architecture/circulation', title: 'Generic balustrade panel', desc: (v) => `Guard panel with end posts, a top handrail, a bottom rail and ${v.type === 'baluster' ? 'turned balusters' : v.type === 'glass' ? 'glass infill panels' : 'eight horizontal cables'}.`,
    vs: [['balusters, 72 in', 72, 6, 42, 0, { type: 'baluster' }], ['balusters, 120 in', 120, 6, 42, 0, { type: 'baluster' }], ['glass, 96 in', 96, 5, 42, 0, { type: 'glass' }], ['cable, 96 in', 96, 5, 42, 0, { type: 'cable' }]],
    build: balustrade }),
  fam({ cat: 'architecture/circulation', title: 'Generic fixed ladder', desc: (v) => `Fixed wall ladder with stiles, rungs and brackets${v.cage ? ', a safety cage of hoops and straps' : ''}.`,
    vs: [['10 ft, no cage', 24, 12, 120, 0, { cage: false }], ['16 ft, caged', 36, 24, 192, 0, { cage: true }], ['24 ft, caged', 36, 24, 288, 0, { cage: true }]],
    build: cageLadder }),
  fam({ cat: 'architecture/circulation', title: 'Generic lift shaft mass', desc: (v) => `Lift shaft with ${v.stops} stops: walls, door openings and call buttons, a car with guide rails, and the overrun with machine above.`,
    vs: [['2 stops, passenger', 90, 100, 276, 0, { stops: 2 }], ['4 stops, passenger', 90, 100, 420, 0, { stops: 4 }], ['6 stops, bed lift', 110, 130, 600, 0, { stops: 6 }], ['10 stops, passenger', 100, 110, 960, 0, { stops: 10 }]],
    build: liftShaft }),
  // ---------------------------------------------------------------- details
  fam({ cat: 'architecture/details', title: 'Generic classical column', desc: (v) => `${v.order === 'plain' ? 'Plain column with a square block capital' : v.order === 'ionic' ? 'Ionic style column with volutes' : v.order === 'fluted' ? 'Fluted column with echinus capital' : 'Round column'}, a plinth, moulded base and tapering shaft.`,
    vs: [['Tuscan order, 96 in', 24, 24, 96, 0, { order: 'tuscan', shaft: 16 * IN }], ['fluted order, 120 in', 26, 26, 120, 0, { order: 'fluted', shaft: 18 * IN }], ['fluted order, 180 in', 34, 34, 180, 0, { order: 'fluted', shaft: 26 * IN }], ['Ionic order, 144 in', 30, 30, 144, 0, { order: 'ionic', shaft: 22 * IN }], ['plain block capital, 108 in', 22, 22, 108, 0, { order: 'plain', shaft: 14 * IN }]],
    build: column }),
  fam({ cat: 'architecture/details', title: 'Generic masonry arch', desc: (v) => `${v.type} arch of wedge voussoirs${v.key ? ' with a keystone' : ''}, on two piers with imposts, under the wall mass.`,
    vs: [['round, 48 in span', 84, 16, 96, 0, { type: 'round', pier: 18, ring: 8, key: true }], ['round, 72 in span', 108, 16, 120, 0, { type: 'round', pier: 18, ring: 9, key: true }], ['segmental, 72 in span', 108, 14, 84, 0, { type: 'segmental', pier: 18, ring: 8, key: false }], ['pointed, 60 in span', 96, 16, 120, 0, { type: 'pointed', pier: 18, ring: 8, key: false }], ],
    build: arch }),
  fam({ cat: 'architecture/details', title: 'Generic corbel', desc: (v) => `${v.type} corbel projecting from the wall under a capping slab${v.type === 'scroll' ? ' with end scrolls' : ''}.`,
    vs: [['stepped, 8 in', 8, 8, 12, 60, { type: 'stepped' }], ['scroll, 10 in', 10, 10, 16, 60, { type: 'scroll' }], ['curved, 12 in', 12, 12, 18, 60, { type: 'curved' }]],
    build: corbel }),
  fam({ cat: 'architecture/details', title: 'Generic moulding length', desc: (v) => `Four-foot length of ${v.prof} moulding with its wall profile extruded along the run.`,
    vs: [['crown, 4 in', 48, 5, 5, 96, { prof: 'crown' }], ['base, 6 in', 48, 1, 6, 0, { prof: 'base' }], ['architrave, 4 in', 48, 1, 4, 0, { prof: 'architrave' }], ['dado rail, 4 in', 48, 2, 4, 36, { prof: 'dado' }], ],
    build: moulding }),
  fam({ cat: 'architecture/details', title: 'Generic entrance steps', desc: (v) => `Solid steps, ${v.steps} risers, ${v.land ? 'with a landing, ' : ''}sloped cheek walls${v.rail ? ' and a handrail on each side' : ''}.`,
    vs: [['3 steps, 48 in wide', 60, 54, 30, 0, { steps: 3, cheek: 6, land: false }], ['4 steps, handrail, 54 in wide', 66, 72, 66, 0, { steps: 4, cheek: 6, land: true, rail: true }], ['6 steps, handrail, 72 in wide', 84, 96, 90, 0, { steps: 6, cheek: 9, land: true, rail: true }], ],
    build: entranceSteps }),
  fam({ cat: 'architecture/details', title: 'Generic stone plinth', desc: (v) => `Square plinth with a stepped base, a die${v.panel ? ' with a raised panel' : ''} and a capping cornice.`,
    vs: [['24 in tall', 18, 18, 24, 0, { panel: false }], ['36 in tall, panelled', 20, 20, 36, 0, { panel: true }], ['48 in tall, panelled', 24, 24, 48, 0, { panel: true }]],
    build: pedestal }),
  fam({ cat: 'architecture/details', title: 'Generic lintel', desc: (v) => `${v.type === 'plain' ? 'Single stone lintel with a projecting cap' : 'Flat arch of ' + v.n + ' tapered blocks between end blocks' + (v.key ? ' and a deeper keystone' : '')}.`,
    vs: [['plain, 60 in', 60, 9, 12, 84, { type: 'plain' }], ['flat arch, 5 blocks, 60 in', 60, 9, 14, 84, { type: 'arch', n: 5, key: true }], ['flat arch, 7 blocks, 84 in', 84, 9, 16, 84, { type: 'arch', n: 7, key: true, hood: true }]],
    build: lintel }),
  // ---------------------------------------------------------------- massing
  fam({ cat: 'architecture/massing', title: 'Generic mid-rise block massing', desc: (v) => `Massing model of a ${v.tiers.reduce((s, t) => s + t[2], 0)}-storey block with floor-slab bands and window bays on the front and sides.`,
    vs: [['4 storeys, 120 x 60 ft', 1440, 720, 800, 0, { floor: 144, tiers: [[1, 1, 4]] }], ['8 storeys, 100 x 60 ft', 1200, 720, 1400, 0, { floor: 144, tiers: [[1, 1, 8]], crown: 'plant' }], ['12 storeys, 90 x 70 ft', 1080, 840, 2000, 0, { floor: 144, tiers: [[1, 1, 12]], crown: 'plant' }]],
    build: tower }),
  fam({ cat: 'architecture/massing', title: 'Generic stepped tower massing', desc: 'Tower massing with a wide podium and stacked setback tiers, each with floor bands and window bays.',
    vs: [['podium and 2 tiers, 20 storeys', 1000, 800, 3000, 0, { floor: 144, tiers: [[1, 1, 4], [0.7, 0.8, 8], [0.45, 0.6, 8]], crown: 'spire' }], ['3 setbacks, 30 storeys', 1000, 800, 4500, 0, { floor: 144, tiers: [[1, 1, 6], [0.8, 0.85, 10], [0.6, 0.7, 8], [0.4, 0.5, 6]], crown: 'spire' }], ['tower on podium, 24 storeys', 1200, 800, 3600, 0, { floor: 144, tiers: [[1, 1, 3], [0.45, 0.6, 21]], crown: 'plant' }]],
    build: tower }),
  fam({ cat: 'architecture/massing', title: 'Generic atrium building massing', desc: (v) => `${v.floors}-storey courtyard building with four wings and a ${v.glass ? 'central void roofed in glass with a ridge' : 'paved open court with trees'}.`,
    vs: [['open court, 3 storeys, 120 ft', 1440, 1440, 480, 0, { wing: 360, floors: 3, glass: false, trees: 3 }], ['glazed atrium, 5 storeys, 150 ft', 1800, 1440, 960, 0, { wing: 360, floors: 5, glass: true }], ['glazed atrium, 8 storeys, 180 ft', 2160, 1800, 1400, 0, { wing: 420, floors: 8, glass: true }]],
    build: courtyard }),
  fam({ cat: 'architecture/massing', title: 'Generic roof form model', desc: (v) => `Walled block with window and door openings under a ${v.type} roof form${v.type === 'sawtooth' ? ' with ' + v.teeth + ' teeth' : ''}.`,
    vs: [['gable, 30 x 24 ft', 360, 288, 216, 0, { type: 'gable', wall: 108 }], ['hip, 30 x 24 ft', 360, 288, 216, 0, { type: 'hip', wall: 108 }], ['gambrel, 30 x 24 ft', 360, 288, 240, 0, { type: 'gambrel', wall: 108 }], ['butterfly, 30 x 24 ft', 360, 288, 204, 0, { type: 'butterfly', wall: 108 }], ['sawtooth, 4 teeth, 60 x 36 ft', 720, 432, 270, 0, { type: 'sawtooth', wall: 144, teeth: 4 }], ['barrel vault, 40 x 30 ft', 480, 360, 270, 0, { type: 'barrel', wall: 108 }], ['flat, 36 x 24 ft', 432, 288, 126, 0, { type: 'flat', wall: 108 }]],
    build: roofForm }),
  fam({ cat: 'architecture/massing', title: 'Generic open pavilion', desc: (v) => `Pavilion on a raised platform: ${v.cols * v.rowsC} ${v.round ? 'round' : 'square'} columns under a ${v.roof} roof${v.glass ? ', glass walls' : ''}${v.bench ? ', a bench' : ''}.`,
    vs: [['4 columns, flat roof, 12 ft', 144, 144, 126, 0, { cols: 2, rowsC: 2, roof: 'flat', roofH: 8 }], ['4 columns, hip roof, 16 ft', 192, 192, 156, 0, { cols: 2, rowsC: 2, roof: 'hip', roofH: 30 }], ['8 columns, gable, 40 x 20 ft', 480, 240, 168, 0, { cols: 4, rowsC: 2, roof: 'gable', roofH: 38, round: true }], ['glazed, flat roof, 24 x 16 ft', 288, 192, 126, 0, { cols: 3, rowsC: 2, roof: 'flat', roofH: 8, glass: true }]],
    build: pavilion }),
  fam({ cat: 'architecture/massing', title: 'Generic footbridge model', desc: (v) => `${v.type === 'beam' ? 'Girder' : v.type === 'truss' ? 'Truss' : 'Tied arch'} footbridge with a deck, abutments and handrail posts${v.type === 'truss' ? ' and ' + v.panels + ' truss panels' : ''}.`,
    vs: [['girder, 40 ft span', 480, 90, 120, 0, { type: 'beam', under: 36 }], ['girder with piers, 80 ft span', 960, 90, 150, 0, { type: 'beam', under: 60, piers: 1 }], ['truss, 60 ft span, 8 panels', 720, 100, 160, 0, { type: 'truss', under: 36, panels: 8 }], ['truss, 100 ft span, 12 panels', 1200, 110, 200, 0, { type: 'truss', under: 48, panels: 12 }], ['tied arch, 80 ft span', 960, 100, 230, 0, { type: 'arch', under: 36 }]],
    build: bridge }),
];
