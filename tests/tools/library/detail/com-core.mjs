/* SPDX-License-Identifier: Apache-2.0 */
/**
 * com-core.mjs — shared pieces for the commercial block objects (the *-3.csv blocks, 2026-11-03).
 *
 * An `Acc` collects triangles (mm, z up, plan front at −Y, back at y = 0), plan shapes and clearances for one object, from its body
 * box. `cab` and `tbl` are the two parametric builders that most casework, equipment cabinets, counters, desks and tables are made from.
 * All geometry is original, built from boxes, tubes, ellipsoids and extruded outlines. Nothing is copied from a maker's model.
 */
import { box, tube, ellipsoid, loft } from './figure.mjs';
export { box, tube, ellipsoid, loft };

export const T = 19;     // door and drawer-front thickness
export const GAP = 3;    // reveal between a front and its opening

const mn = Math.min, mx = Math.max;

export class Acc {
  constructor(b) {
    this.b = b;
    this.t = []; this.p = []; this.cl = []; this.msg = '';
    this.X0 = b.x; this.X1 = b.x + b.w; this.YF = b.y; this.YB = 0;
    this.Z0 = b.z; this.Z1 = b.z + b.h;
    this.W = b.w; this.D = -b.y; this.H = b.h;
    this.cx = b.x + b.w / 2; this.cy = b.y / 2;
  }
  // ---- 3D ----
  add(list) { for (const t of list) this.t.push(t); return this; }
  box(x0, y0, z0, x1, y1, z1) {
    if (x1 - x0 <= 0 || y1 - y0 <= 0 || z1 - z0 <= 0) { [x0, x1] = [mn(x0, x1), mx(x0, x1)]; [y0, y1] = [mn(y0, y1), mx(y0, y1)]; [z0, z1] = [mn(z0, z1), mx(z0, z1)]; }
    if (x1 - x0 < 0.01 || y1 - y0 < 0.01 || z1 - z0 < 0.01) return this;
    return this.add(box(x0, y0, z0, x1, y1, z1));
  }
  cyl(cx, cy, z0, z1, r, seg = 14) { return this.add(tube([[cx, cy, z0], [cx, cy, z1]], [r, r], seg)); }
  cone(cx, cy, z0, z1, r0, r1, seg = 14) { return this.add(tube([[cx, cy, z0], [cx, cy, z1]], [r0, r1], seg)); }
  xcyl(x0, x1, y, z, r, seg = 12) { return this.add(tube([[x0, y, z], [x1, y, z]], [r, r], seg)); }
  ycyl(y0, y1, x, z, r, seg = 12) { return this.add(tube([[x, y0, z], [x, y1, z]], [r, r], seg)); }
  tube(pts, rads, seg = 10) { return this.add(tube(pts, rads, seg)); }
  ell(cx, cy, cz, rx, ry, rz, nu = 14, nv = 8) { return this.add(ellipsoid(cx, cy, cz, rx, ry, rz, nu, nv)); }
  /** Extrude a convex outline [[x,y],…] between z0 and z1. */
  prism(poly, z0, z1) {
    const n = poly.length;
    for (let i = 1; i < n - 1; i++) {
      this.t.push([[...poly[0], z0], [...poly[i + 1], z0], [...poly[i], z0]]);
      this.t.push([[...poly[0], z1], [...poly[i], z1], [...poly[i + 1], z1]]);
    }
    for (let i = 0; i < n; i++) {
      const a = poly[i], c = poly[(i + 1) % n];
      this.t.push([[...a, z0], [...c, z0], [...c, z1]], [[...a, z0], [...c, z1], [...a, z1]]);
    }
    return this;
  }
  /** A rectangular frame in the X–Z plane (a window, a glazed door): outer box, border t, depth y0..y1. */
  frame(x0, z0, x1, z1, y0, y1, t) {
    this.box(x0, y0, z0, x0 + t, y1, z1).box(x1 - t, y0, z0, x1, y1, z1).box(x0 + t, y0, z1 - t, x1 - t, y1, z1).box(x0 + t, y0, z0, x1 - t, y1, z0 + t);
    return this;
  }
  /** A caster: a stem and a wheel. */
  caster(x, y, h) {
    this.cyl(x, y, this.Z0 + h * 0.45, this.Z0 + h * 0.8, 6, 6);
    this.xcyl(x - 7, x + 7, y, this.Z0 + h * 0.3, h * 0.3, 10);
    return this;
  }
  /** A round leg or post. */
  leg(x, y, z0, z1, r) { return this.cyl(x, y, z0, z1, r, 10); }
  // ---- plan ----
  rect(x0, y0, x1, y1, layer = 'EQUIP') { this.p.push({ kind: 'rect', layer, x0, y0, x1, y1 }); return this; }
  circ(x, y, r, layer = 'EQUIP') { this.p.push({ kind: 'circle', layer, x, y, r }); return this; }
  line(x1, y1, x2, y2, layer = 'EQUIP-DETAIL') { this.p.push({ kind: 'line', layer, x1, y1, x2, y2 }); return this; }
  ellp(x, y, rx, ry, layer = 'EQUIP') { this.p.push({ kind: 'ellipse', layer, x, y, rx, ry }); return this; }
  arc(x, y, r, a0, a1, layer = 'EQUIP-SWING') { this.p.push({ kind: 'arc', layer, x, y, r, a0, a1 }); return this; }
  outline(layer = 'EQUIP') { return this.rect(this.X0, this.YF, this.X1, this.YB, layer); }
  poly(pts, layer = 'EQUIP') { this.p.push({ kind: 'poly', layer, pts }); return this; }
  clear(name, x0, y0, x1, y1, h = 80) { this.cl.push({ name, x: x0, y: y0, z: 0, w: x1 - x0, d: y1 - y0, h }); return this; }
  log(s) { this.msg = s; return this; }
  out() { return { tris: this.t, plan: this.p, clear: this.cl, changelog: this.msg }; }
}

/** n leaf spans across [a, b]; hinge side per leaf (left for the first half). */
export function leaves(a, b, n) {
  const w = (b - a) / n;
  return Array.from({ length: n }, (_, i) => ({ a: a + i * w + (i ? GAP : 0), b: a + (i + 1) * w - (i < n - 1 ? GAP : 0), hinge: n === 1 || i < n / 2 ? 'L' : 'R' }));
}

/** A pull on a front panel at (cx, z) facing −Y. kind: bar | vbar | knob | lock | recess | none. */
export function pull(a, kind, cx, zc, y = a.YF) {
  if (kind === 'none') return;
  if (kind === 'knob') { a.cyl(cx, y - 14, zc - 0, zc + 0.01, 0.01, 3); a.ycyl(y - 24, y, cx, zc, 9, 8); a.circ(cx, y - 14, 9, 'EQUIP-DETAIL'); return; }
  if (kind === 'lock') { a.ycyl(y - 8, y, cx, zc, 14, 10); a.circ(cx, y - 4, 14, 'EQUIP-DETAIL'); return; }
  if (kind === 'recess') { a.box(cx - 45, y, zc - 14, cx + 45, y + 6, zc + 14); a.line(cx - 45, y + 4, cx + 45, y + 4); return; }
  if (kind === 'vbar') { a.box(cx - 6, y - 36, zc - 130, cx + 6, y - 22, zc + 130); a.box(cx - 6, y - 24, zc - 130, cx + 6, y, zc - 118); a.box(cx - 6, y - 24, zc + 118, cx + 6, y, zc + 130); a.rect(cx - 6, y - 36, cx + 6, y, 'EQUIP-DETAIL'); return; }
  // bar
  a.box(cx - 70, y - 34, zc - 6, cx + 70, y - 22, zc + 6); a.box(cx - 70, y - 24, zc - 6, cx - 58, y, zc + 6); a.box(cx + 58, y - 24, zc - 6, cx + 70, y, zc + 6);
  a.rect(cx - 70, y - 34, cx + 70, y, 'EQUIP-DETAIL');
}

/**
 * A cabinet, counter base, equipment cabinet, locker bank, kiosk or tall unit.
 * o: doors (n) · swing · hinge · glass · louver · drawers (rows) · drawerCols · drawerH (mm height of the drawer zone, 0 = whole front) ·
 *    toe (recess height) · legs (height) · casters (height) · topT (counter slab thickness) · splash {h, t} · open (shelves, no doors) ·
 *    shelves (n) · pull · hidden (dashed plan outline, for wall units) · inset (carcass set in from the sides) · lock · sloped · cols (open bays)
 */
export function cab(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a;
  const toe = o.toe ?? 0, legH = o.legs ?? 0, casH = o.casters ?? 0;
  const lift = mx(toe, legH, casH);
  const base = Z0 + lift;
  const splash = o.splash || null;
  const topT = o.topT ?? 0;
  const bodyTop = Z1 - (splash ? splash.h : 0);
  const pullKind = o.pull ?? 'bar';
  if (o.hidden) a.outline('EQUIP-HIDDEN'); else a.outline();
  // supports
  if (legH) {
    const r = mx(10, mn(22, W * 0.02));
    for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 40, YF + 40], [X0 + 40, YB - 40], [X1 - 40, YB - 40]]) { a.leg(x, y, Z0, base, r); a.circ(x, y, r, 'EQUIP-HIDDEN'); }
  }
  if (casH) for (const [x, y] of [[X0 + 50, YF + 50], [X1 - 50, YF + 50], [X0 + 50, YB - 50], [X1 - 50, YB - 50]]) { a.caster(x, y, casH); a.circ(x, y, 22, 'EQUIP-HIDDEN'); }
  if (toe) { a.box(X0, YF + 75, Z0, X1, YB, base); a.line(X0, YF + 75, X1, YF + 75, 'EQUIP-HIDDEN'); }
  // carcass
  const nDoors = o.doors ?? 0, rows = o.drawers ?? 0;
  const ins = o.inset ?? 0;
  const cx0 = X0 + ins, cx1 = X1 - ins;
  if (o.open) {
    const bays = o.cols ?? 1;
    a.box(cx0, YF, base, cx0 + T, YB - T, bodyTop).box(cx1 - T, YF, base, cx1, YB - T, bodyTop);
    a.box(cx0, YF, bodyTop - T, cx1, YB - T, bodyTop).box(cx0, YF, base, cx1, YB - T, base + T).box(cx0, YB - T, base, cx1, YB, bodyTop);
    for (let i = 1; i < bays; i++) { const x = cx0 + ((cx1 - cx0) * i) / bays; a.box(x - T / 2, YF, base, x + T / 2, YB - T, bodyTop); a.line(x, YF, x, YB - T); }
    const sh = o.shelves ?? 0;
    for (let i = 1; i <= sh; i++) { const z = base + ((bodyTop - base) * i) / (sh + 1); a.box(cx0 + T, YF, z, cx1 - T, YB - T, z + T); }
    a.line(cx0, YB - T, cx1, YB - T, 'EQUIP-HIDDEN');
  } else {
    a.box(cx0, YF + T, base, cx1, YB, bodyTop);
  }
  if (topT) a.box(X0, YF, bodyTop - topT, X1, YB, bodyTop);
  if (splash) { a.box(X0, YB - splash.t, bodyTop, X1, YB, Z1); a.line(X0, YB - splash.t, X1, YB - splash.t); }
  // fronts: a drawer zone at the top, doors below (or the whole front)
  const fz0 = base + GAP, fz1 = bodyTop - (topT ? topT : 0) - GAP;
  if (!o.open) {
    const dz = rows ? (o.drawerH ? mn(o.drawerH, fz1 - fz0) : fz1 - fz0) : 0;
    const doorTop = fz1 - dz, doorBot = fz0;
    if (rows) {
      const zTop = fz1, rh = dz / rows, cols = o.drawerCols ?? 1;
      for (let i = 0; i < rows; i++) {
        const z1 = zTop - i * rh, z0 = z1 - rh + GAP;
        for (let c = 0; c < cols; c++) {
          const aa = cx0 + GAP + c * ((cx1 - cx0) / cols), bb = cx0 + (c + 1) * ((cx1 - cx0) / cols) - GAP;
          a.box(aa, YF, z0, bb, YF + T, z1);
          pull(a, pullKind === 'vbar' ? 'bar' : pullKind, (aa + bb) / 2, z1 - mn(60, rh * 0.5));
        }
      }
    }
    if (nDoors && doorTop - doorBot > 40) {
      const L = leaves(cx0, cx1, nDoors);
      for (const lf of L) {
        const w = lf.b - lf.a;
        if (o.glass) {
          a.frame(lf.a, doorBot, lf.b, doorTop, YF, YF + T, 45);
          a.box(lf.a + 45, YF + T / 2 - 1.5, doorBot + 45, lf.b - 45, YF + T / 2 + 1.5, doorTop - 45);
          a.rect(lf.a + 45, YF + 4, lf.b - 45, YF + 12, 'EQUIP-DETAIL');
        } else a.box(lf.a, YF, doorBot, lf.b, YF + T, doorTop);
        if (o.louver) for (let z = doorBot + 80; z < doorTop - 60; z += 28) a.box(lf.a + 40, YF - 11, z, lf.b - 40, YF, z + 8);
        const edge = lf.hinge === 'L' ? lf.b - 40 : lf.a + 40, hing = lf.hinge === 'L' ? lf.a : lf.b;
        if (o.lock) pull(a, 'lock', edge, (doorBot + doorTop) / 2);
        if (pullKind !== 'none') pull(a, pullKind === 'bar' && doorTop - doorBot > 700 ? 'vbar' : pullKind, edge, o.pullZ ?? ((doorBot + doorTop) / 2));
        if (o.swing) {
          a.line(hing, YF, hing, YF - w, 'EQUIP-SWING');
          a.arc(hing, YF, w, lf.hinge === 'L' ? 270 : 180, lf.hinge === 'L' ? 360 : 270);
          a.circ(hing, YF + 20, 9);
        } else { a.line(lf.a, YF + 50, lf.a, YF, 'EQUIP-DETAIL'); a.line(lf.b, YF + 50, lf.b, YF, 'EQUIP-DETAIL'); }
      }
      if (o.swing) a.clear('door swing', X0, YF - mx(...L.map((l) => l.b - l.a)), X1, YF, 80);
    }
    if (o.panel) { // a control strip: {z0, z1, keys}
      const p = o.panel;
      a.box(cx0 + 40, YF - 6, p.z0, cx1 - 40, YF, p.z1);
      const keys = p.keys ?? 4;
      for (let i = 0; i < keys; i++) { const x = cx0 + 80 + ((cx1 - cx0 - 160) * (i + 0.5)) / keys; a.ycyl(YF - 22, YF - 6, x, (p.z0 + p.z1) / 2, 12, 8); a.circ(x, YF - 14, 12, 'EQUIP-DETAIL'); }
    }
  }
  return a;
}

/**
 * A table, desk, counter or bench on legs, panel ends, a pedestal or trestles.
 * o: topT · base ('legs' | 'panels' | 'pedestal' | 'trestle' | 'cabinet') · shelf (undershelf z) · apron · splash {h,t} · drawers (rows) ·
 *    round · modesty · casters · edge (rim height) · legR
 */
export function tbl(a, o = {}) {
  const { X0, X1, YF, YB, Z0, Z1, W, D } = a;
  const topT = o.topT ?? 40;
  const splash = o.splash || null;
  const zTop = Z1 - (splash ? splash.h : 0);
  const base = o.base ?? 'legs';
  const legR = o.legR ?? mx(14, mn(30, W * 0.012));
  if (o.round) {
    const rad = W / 2, cx = a.cx, cy = a.cy;
    a.ell(cx, cy, zTop - topT / 2, rad, rad, topT / 2, 28, 4);
    if (base === 'pedestal') {
      a.cone(cx, cy, Z0 + 30, zTop - topT, legR * 1.6, legR * 1.2, 14); a.ell(cx, cy, Z0 + 15, rad * 0.4, rad * 0.4, 15, 18, 4);
      a.circ(cx, cy, rad * 0.4, 'EQUIP-HIDDEN');
    } else {
      for (const ang of [0.8, 2.37, 3.94, 5.5]) { const x = cx + Math.cos(ang) * rad * 0.72, y = cy + Math.sin(ang) * rad * 0.72; a.leg(x, y, Z0, zTop - topT, legR); a.circ(x, y, legR, 'EQUIP-HIDDEN'); }
    }
    a.circ(cx, cy, rad); a.circ(cx, cy, rad - 25, 'EQUIP-DETAIL');
    return a;
  }
  a.outline();
  a.box(X0, YF, zTop - topT, X1, YB, zTop);
  if (o.edge) { a.box(X0, YF, zTop, X1, YF + 12, zTop + o.edge); a.box(X0, YB - 12, zTop, X1, YB, zTop + o.edge); a.box(X0, YF, zTop, X0 + 12, YB, zTop + o.edge); a.box(X1 - 12, YF, zTop, X1, YB, zTop + o.edge); }
  if (splash) { a.box(X0, YB - splash.t, zTop, X1, YB, Z1); a.line(X0, YB - splash.t, X1, YB - splash.t); }
  a.rect(X0 + 12, YF + 12, X1 - 12, YB - 12, 'EQUIP-DETAIL');
  if (base === 'legs') {
    const ap = o.apron ?? 80;
    a.box(X0 + 60, YF + 60, zTop - topT - ap, X1 - 60, YB - 60, zTop - topT);
    for (const [x, y] of [[X0 + 60, YF + 60], [X1 - 60, YF + 60], [X0 + 60, YB - 60], [X1 - 60, YB - 60]]) { a.leg(x, y, Z0, zTop - topT, legR); a.circ(x, y, legR, 'EQUIP-HIDDEN'); }
    if (o.casters) for (const [x, y] of [[X0 + 60, YF + 60], [X1 - 60, YF + 60], [X0 + 60, YB - 60], [X1 - 60, YB - 60]]) a.caster(x, y, o.casters);
  } else if (base === 'panels') {
    for (const [xa, xb] of [[X0 + 60, X0 + 60 + T], [X1 - 60 - T, X1 - 60]]) { a.box(xa, YF + 80, Z0, xb, YB - 80, zTop - topT); a.rect(xa, YF + 80, xb, YB - 80, 'EQUIP-HIDDEN'); }
    if (o.modesty !== false) { a.box(X0 + 60, YB - 80 - T, Z0 + 150, X1 - 60, YB - 80, zTop - topT - 10); a.line(X0 + 60 + T, YB - 80, X1 - 60 - T, YB - 80, 'EQUIP-HIDDEN'); }
  } else if (base === 'trestle') {
    for (const x of [X0 + W * 0.15, X1 - W * 0.15 - 40]) { a.box(x, YF + D * 0.2, Z0, x + 40, YB - D * 0.2, zTop - topT); a.box(x - 120, YF + D * 0.15, Z0, x + 160, YF + D * 0.15 + 40, Z0 + 40); a.box(x - 120, YB - D * 0.15 - 40, Z0, x + 160, YB - D * 0.15, Z0 + 40); }
    a.box(X0 + W * 0.15 + 40, a.cy - 20, Z0 + 250, X1 - W * 0.15 - 40, a.cy + 20, Z0 + 290);
  } else if (base === 'cabinet') {
    a.box(X0 + 20, YF + 20, Z0, X1 - 20, YB, zTop - topT);
  }
  if (o.shelf) { a.box(X0 + 90, YF + 90, Z0 + o.shelf, X1 - 90, YB - 90, Z0 + o.shelf + 18); a.rect(X0 + 90, YF + 90, X1 - 90, YB - 90, 'EQUIP-HIDDEN'); }
  if (o.drawers) {
    const dw = mn(460, W * 0.5), rh = (zTop - topT - Z0 - 220) / o.drawers;
    for (let i = 0; i < o.drawers; i++) { const z1 = zTop - topT - 60 - i * rh; a.box(X1 - 60 - dw, YF + 50, z1 - rh + 8, X1 - 60, YF + 50 + T, z1); pull(a, 'bar', X1 - 60 - dw / 2, z1 - rh / 2, YF + 50); }
  }
  return a;
}
