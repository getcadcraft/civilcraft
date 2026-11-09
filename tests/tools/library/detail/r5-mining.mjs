/* SPDX-License-Identifier: Apache-2.0 */
/** Round 5, block "mining": surface, underground, processing and support (2026-11-03). Generic machines by type and size class; original geometry. */
import { fam } from './r4-kit.mjs';

const IN = 25.4;
const D2R = Math.PI / 180;
// ---------------------------------------------------------------- helpers (mm) ----------------------------------------------------------
const fr = (a) => ({ X: (f) => a.X0 + f * a.W, Y: (f) => a.YF * (1 - f), Z: (f) => a.Z0 + f * a.H });   // fractions: X left to right, Y front (0) to back (1), Z up
/** convex outline in the Y-Z plane [[y,z],...] extruded along X */
function profX(a, pts, x0, x1) { const n0 = a.t.length; a.prism(pts, x0, x1); for (let i = n0; i < a.t.length; i++) a.t[i] = a.t[i].map((p) => [p[2], p[0], p[1]]); return a; }
/** convex outline in the X-Z plane [[x,z],...] extruded along Y */
function profY(a, pts, y0, y1) { const n0 = a.t.length; a.prism([...pts].reverse(), y0, y1); for (let i = n0; i < a.t.length; i++) a.t[i] = a.t[i].map((p) => [p[0], p[2], p[1]]); return a; }
const beam = (a, p, q, r = 20, seg = 8) => a.tube([p, q], [r, r], seg);
/** two-rail ladder on a vertical plane facing y: rails at x and x+w */
function ladder(a, x, y, z0, z1, w = 400, r = 12) { a.cyl(x, y, z0, z1, r, 6); a.cyl(x + w, y, z0, z1, r, 6); for (let z = z0 + 150; z < z1; z += 260) a.xcyl(x, x + w, y, z, r * 0.8, 6); }
/** handrail between two floor points: posts and a top rail */
function rail(a, x0, y0, x1, y1, z, h = 1000, r = 18, n = 4) { for (let i = 0; i <= n; i++) { const t = i / n; a.cyl(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z, z + h, r * 0.7, 6); } beam(a, [x0, y0, z + h], [x1, y1, z + h], r * 0.8, 6); beam(a, [x0, y0, z + h * 0.5], [x1, y1, z + h * 0.5], r * 0.6, 6); }
/** a tyre with hub, axis along X; plan rectangle */
function tire(a, x, y, r, wd, zc = null) { const z = zc ?? a.Z0 + r; a.xcyl(x - wd / 2, x + wd / 2, y, z, r, 22); a.xcyl(x - wd / 2 - 25, x + wd / 2 + 25, y, z, r * 0.52, 14); a.rect(x - wd / 2, y - r, x + wd / 2, y + r, 'EQUIP-DETAIL'); }
/** a cab block with a windscreen frame on the front face (smaller y) */
function cabin(a, x0, x1, y0, y1, z0, z1, t = 30) { a.box(x0, y0, z0, x1, y1, z1); a.frame(x0 + t, z0 + (z1 - z0) * 0.4, x1 - t, z1 - t, y0 - 8, y0 + 6, t); a.box(x0 - 8, y0 + (y1 - y0) * 0.2, z0 + (z1 - z0) * 0.45, x0 + 4, y1 - (y1 - y0) * 0.15, z1 - t * 1.2); a.box(x1 - 4, y0 + (y1 - y0) * 0.2, z0 + (z1 - z0) * 0.45, x1 + 8, y1 - (y1 - y0) * 0.15, z1 - t * 1.2); a.rect(x0, y0, x1, y1, 'EQUIP-DETAIL'); }
/** a crawler track on one side (X from x0 to x1, Y from ya to yb), with idler, sprocket and rollers */
function crawler(a, x0, x1, ya, yb, h, rr = null) { const r = rr ?? h * 0.5, z0 = a.Z0; a.box(x0, ya + r, z0, x1, yb - r, z0 + h); a.xcyl(x0, x1, ya + r, z0 + r, r, 18); a.xcyl(x0, x1, yb - r, z0 + r, r, 18); a.box(x0 + (x1 - x0) * 0.15, ya + r, z0 + h, x1 - (x1 - x0) * 0.15, yb - r, z0 + h + 40); for (let y = ya + r * 2; y < yb - r * 1.5; y += r * 1.2) a.xcyl(x0 - 15, x1 + 15, y, z0 + r * 0.5, r * 0.4, 8); a.rect(x0, ya, x1, yb, 'EQUIP-DETAIL'); }
/** hydraulic cylinder between two points */
function hyd(a, p, q, r = 40) { const m = [p[0] + (q[0] - p[0]) * 0.5, p[1] + (q[1] - p[1]) * 0.5, p[2] + (q[2] - p[2]) * 0.5]; a.tube([p, m], [r, r], 10); a.tube([m, q], [r * 0.55, r * 0.55], 8); }
/** lamp bar (front) */
function lamps(a, xs, y, z, w = 120) { for (const x of xs) a.box(x - w / 2, y - 14, z, x + w / 2, y + 6, z + w * 0.45); }
/** horizontal cylindrical tank along Y with end domes */
function ytank(a, cx, y0, y1, zc, r) { a.ycyl(y0, y1, cx, zc, r, 24); a.ell(cx, y0, zc, r, 0.0001 + r * 0.08, r, 18, 6); a.ell(cx, y1, zc, r, r * 0.08, r, 18, 6); a.rect(cx - r, y0, cx + r, y1); }
/** truck chassis shared by the surface trucks. returns geometry numbers */
function chassis(a, o = {}) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = o.r ?? H * 0.21, wd = o.wd ?? W * 0.1, fy = Y(o.fa ?? 0.15), ry = Y(o.ra ?? 0.78), inset = W * 0.02 + wd / 2;
  a.outline();
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.2 - W * 0.035, Y(0.04), Z0 + r * 1.05, cx + s * W * 0.2 + W * 0.035, Y(0.98), Z0 + r * 1.05 + H * 0.07); a.line(cx + s * W * 0.2, Y(0.04), cx + s * W * 0.2, Y(0.98), 'EQUIP-DETAIL'); }
  for (const f of [0.07, 0.3, 0.55, 0.9]) a.box(cx - W * 0.22, Y(f) - D * 0.012, Z0 + r * 1.05 + H * 0.01, cx + W * 0.22, Y(f) + D * 0.012, Z0 + r * 1.05 + H * 0.06);
  a.xcyl(X0 + inset, X1 - inset, fy, Z0 + r, r * 0.16, 10); a.xcyl(X0 + inset, X1 - inset, ry, Z0 + r, r * 0.16, 10);
  for (const x of [X0 + inset, X1 - inset]) tire(a, x, fy, r, wd);
  const dual = o.dual !== false;
  for (const x of [X0 + inset, X1 - inset]) { tire(a, x, ry, r, wd); if (dual) tire(a, x + (x < cx ? 1 : -1) * (wd * 1.12), ry, r, wd); }
  a.box(cx - W * 0.3, Y(0.0), Z0 + r * 0.9, cx + W * 0.3, Y(0.035), Z0 + r * 1.5);   // bumper
  return { r, wd, fy, ry };
}

// ---------------------------------------------------------------- SURFACE ----------------------------------------------------------
function haulTruck(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const c = chassis(a, { fa: 0.14, ra: 0.8, r: H * 0.22, wd: W * 0.11 });
  const bz = Z(0.5);
  // deck, engine hood and left-hand cab under a full-width canopy
  a.box(X(0.1), Y(0.02), Z(0.4), X(0.9), Y(0.3), Z(0.5));
  a.box(X(0.36), Y(0.04), Z(0.5), X(0.8), Y(0.26), Z(0.66));
  cabin(a, X(0.1), X(0.33), Y(0.05), Y(0.2), Z(0.5), Z(0.76), H * 0.008);
  a.box(X(0.06), Y(0.02), Z(0.76), X(0.94), Y(0.4), Z(0.79));
  for (const x of [X(0.1), X(0.9)]) a.cyl(x, Y(0.08), Z(0.5), Z(0.76), W * 0.008, 6);
  ladder(a, X(0.12), Y(0.0) + 8, Z0 + c.r * 1.0, Z(0.5), W * 0.07);
  rail(a, X(0.1), Y(0.2), X(0.1), Y(0.0), Z(0.5), H * 0.1, 14, 3);
  a.cyl(X(0.62), Y(0.2), Z(0.66), Z(0.74), W * 0.012, 8);
  lamps(a, [X(0.12), X(0.3), X(0.7), X(0.88)], Y(0.0), Z(0.37), W * 0.04);
  // dump body: floor, side walls and front wall, with a tail lip and hoist cylinders
  const y0 = Y(0.3), y1 = Y(0.99), t = W * 0.015;
  profX(a, [[y0, Z(0.5)], [y1, Z(0.44)], [y1, Z(0.47)], [y0, Z(0.53)]], X(0.14), X(0.86));
  for (const [xa, xb] of [[X(0.12), X(0.12) + t], [X(0.88) - t, X(0.88)]]) profX(a, [[y0, Z(0.5)], [y1, Z(0.44)], [y1, Z(0.74)], [y0, Z(0.88)]], xa, xb);
  a.box(X(0.12), y0 - D * 0.02, Z(0.5), X(0.88), y0 + D * 0.015, Z(0.88));   // canopy-side front wall
  a.box(X(0.12), y0, Z(0.86), X(0.88), y0 - D * 0.1, Z(0.89));   // protective visor over the cab
  a.box(X(0.1), y1 - 20, Z(0.42), X(0.9), y1, Z(0.48));
  for (const s of [-1, 1]) hyd(a, [cx + s * W * 0.2, Y(0.52), Z(0.4)], [cx + s * W * 0.2, Y(0.62), Z(0.55)], W * 0.018);
  a.rect(X(0.12), y0, X(0.88), y1, 'EQUIP-DETAIL'); a.line(X(0.12), Y(0.65), X(0.88), Y(0.65), 'EQUIP-DETAIL');
  a.log('Added the frame, hood and canopy, left cab with ladder and rail, dump body with side walls, hoist cylinders, the front axle and dual rear wheels (plan and 3D).');
}
function miningExcavator(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  crawler(a, X(0.0), X(0.24), Y(0.42), Y(1.0), H * 0.2); crawler(a, X(0.76), X(1.0), Y(0.42), Y(1.0), H * 0.2);
  a.box(X(0.2), Y(0.5), Z(0.1), X(0.8), Y(0.92), Z(0.2));
  a.cyl(cx, Y(0.7), Z(0.2), Z(0.24), W * 0.3, 24);
  a.box(X(0.06), Y(0.45), Z(0.24), X(0.94), Y(1.0), Z(0.52));       // house
  a.box(X(0.1), Y(0.97), Z(0.22), X(0.9), Y(1.0), Z(0.45));         // counterweight
  a.box(X(0.1), Y(0.7), Z(0.52), X(0.6), Y(0.95), Z(0.58));         // roof deck
  a.cyl(X(0.2), Y(0.85), Z(0.58), Z(0.7), W * 0.015, 8);
  cabin(a, X(0.02), X(0.2), Y(0.42), Y(0.57), Z(0.24), Z(0.5), H * 0.01);
  const bw = W * (v.kind === 'face' ? 0.34 : 0.3), py = Y(0.5), pz = Z(0.34);
  const ey = Y(0.2), ez = Z(0.85), ty = Y(0.04), tz = v.kind === 'face' ? Z(0.5) : Z(0.18);
  for (const s of [-1, 1]) { beam(a, [cx + s * W * 0.05, py, pz], [cx + s * W * 0.05, ey, ez], H * 0.035, 10); beam(a, [cx + s * W * 0.05, ey, ez], [cx + s * W * 0.05, ty, tz + H * 0.08], H * 0.03, 10); }
  hyd(a, [cx + W * 0.1, Y(0.55), Z(0.3)], [cx + W * 0.1, Y(0.3), Z(0.68)], H * 0.025); hyd(a, [cx - W * 0.1, Y(0.55), Z(0.3)], [cx - W * 0.1, Y(0.3), Z(0.68)], H * 0.025);
  hyd(a, [cx, Y(0.26), Z(0.96)], [cx, Y(0.12), Z(0.78)], H * 0.022);
  if (v.kind === 'face') { a.box(cx - bw / 2, Y(0.0), tz - H * 0.1, cx + bw / 2, Y(0.1), tz + H * 0.12); a.box(cx - bw / 2, Y(0.1), tz - H * 0.1, cx + bw / 2, Y(0.14), tz + H * 0.12); for (let i = 0; i < 5; i++) a.box(cx - bw / 2 + (bw / 5) * (i + 0.2), Y(-0.01), tz - H * 0.1, cx - bw / 2 + (bw / 5) * (i + 0.8), Y(0.0), tz - H * 0.02); }
  else { a.ell(cx, Y(0.04), tz + H * 0.02, bw / 2, D * 0.05, H * 0.1, 14, 6); for (let i = 0; i < 5; i++) a.box(cx - bw / 2 + (bw / 5) * (i + 0.25), Y(0.0), tz - H * 0.07, cx - bw / 2 + (bw / 5) * (i + 0.75), Y(0.02), tz - H * 0.02); }
  a.rect(cx - bw / 2, Y(0.0), cx + bw / 2, Y(0.1), 'EQUIP-DETAIL'); a.circ(cx, Y(0.7), W * 0.3, 'EQUIP-DETAIL');
  a.log('Added the two crawler tracks, the swing ring and upper housing with counterweight and cab, the boom and stick with their cylinders and the ' + (v.kind === 'face' ? 'face-shovel bucket with teeth' : 'backhoe bucket with teeth') + ' (plan and 3D).');
}
function ropeShovel(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  crawler(a, X(0.0), X(0.2), Y(0.3), Y(0.98), H * 0.1); crawler(a, X(0.8), X(1.0), Y(0.3), Y(0.98), H * 0.1);
  a.box(X(0.15), Y(0.4), Z(0.04), X(0.85), Y(0.9), Z(0.1));
  a.cyl(cx, Y(0.65), Z(0.1), Z(0.15), W * 0.34, 28);
  a.box(X(0.12), Y(0.4), Z(0.15), X(0.88), Y(0.98), Z(0.4));                       // machinery housing
  a.box(X(0.2), Y(0.5), Z(0.4), X(0.8), Y(0.95), Z(0.46)); a.box(X(0.1), Y(0.95), Z(0.2), X(0.9), Y(1.0), Z(0.34));
  cabin(a, X(0.0), X(0.16), Y(0.34), Y(0.5), Z(0.3), Z(0.46), H * 0.007);
  const px = [cx - W * 0.1, cx + W * 0.1], bpy = Y(0.45), bpz = Z(0.2), tpy = Y(0.02), tpz = Z(0.78);
  for (const x of px) beam(a, [x, bpy, bpz], [x, tpy, tpz], H * 0.018, 8);
  beam(a, [px[0], tpy, tpz], [px[1], tpy, tpz], H * 0.018, 8);
  a.cyl(cx, tpy, tpz - H * 0.01, tpz + H * 0.02, H * 0.03, 12);
  for (const x of [cx - W * 0.06, cx + W * 0.06]) { beam(a, [x, Y(0.7), Z(0.46)], [x, Y(0.5), Z(0.98)], H * 0.012, 6); beam(a, [x, Y(0.5), Z(0.98)], [x, tpy, tpz], H * 0.005, 5); }
  beam(a, [cx - W * 0.06, Y(0.5), Z(0.98)], [cx + W * 0.06, Y(0.5), Z(0.98)], H * 0.012, 6);
  beam(a, [cx, bpy, Z(0.3)], [cx, Y(0.06), Z(0.38)], H * 0.014, 8);                  // dipper handle
  a.box(cx - W * 0.2, Y(0.0), Z(0.27), cx + W * 0.2, Y(0.12), Z(0.44)); for (let i = 0; i < 6; i++) a.box(cx - W * 0.2 + (W * 0.4 / 6) * (i + 0.2), Y(-0.005), Z(0.27), cx - W * 0.2 + (W * 0.4 / 6) * (i + 0.8), Y(0.0), Z(0.32));
  beam(a, [cx, tpy, tpz], [cx, Y(0.05), Z(0.44)], H * 0.004, 5);
  a.circ(cx, Y(0.65), W * 0.34, 'EQUIP-DETAIL'); a.rect(cx - W * 0.2, Y(0.0), cx + W * 0.2, Y(0.12), 'EQUIP-DETAIL');
  a.log('Added the two crawlers, swing ring and machinery housing with counterweight and cab, the A-frame boom with hoist ropes, the dipper handle and the toothed dipper (plan and 3D).');
}
function dragline(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  a.cyl(cx, Y(0.88), Z0, Z(0.06), W * 0.5, 36); a.circ(cx, Y(0.88), W * 0.5);
  a.cyl(cx, Y(0.88), Z(0.06), Z(0.08), W * 0.46, 32);
  a.box(X(0.18), Y(0.8), Z(0.08), X(0.82), Y(0.99), Z(0.2)); a.box(X(0.12), Y(0.7), Z(0.2), X(0.88), Y(0.99), Z(0.27));
  cabin(a, X(0.1), X(0.28), Y(0.62), Y(0.72), Z(0.2), Z(0.3), H * 0.006);
  const by = Y(0.8), bz = Z(0.17), tx = [cx - W * 0.05, cx + W * 0.05], ty = Y(0.0), tz = Z(0.72);
  for (const x of tx) beam(a, [x, by, bz], [x, ty, tz], H * 0.012, 8);
  for (let i = 1; i < 10; i++) { const t = i / 10, t2 = (i + 0.5) / 10; beam(a, [tx[0], by + (ty - by) * t, bz + (tz - bz) * t], [tx[1], by + (ty - by) * t2, bz + (tz - bz) * t2], H * 0.004, 5); }
  beam(a, [tx[0], ty, tz], [tx[1], ty, tz], H * 0.012, 6);
  const mz = Z(0.96), my = Y(0.78);
  for (const x of [cx - W * 0.2, cx + W * 0.2]) { beam(a, [x, Y(0.95), Z(0.27)], [cx, my, mz], H * 0.01, 8); }
  beam(a, [cx, Y(0.62), Z(0.27)], [cx, my, mz], H * 0.01, 8); beam(a, [cx, my, mz], [cx, ty, tz], H * 0.003, 5); beam(a, [cx, my, mz], [cx, Y(0.12), Z(0.12)], H * 0.003, 5);
  a.box(cx - W * 0.12, Y(0.07), Z(0.02), cx + W * 0.12, Y(0.18), Z(0.16)); beam(a, [cx, ty, tz], [cx, Y(0.12), Z(0.15)], H * 0.003, 5);
  a.rect(cx - W * 0.12, Y(0.07), cx + W * 0.12, Y(0.18), 'EQUIP-DETAIL'); a.line(cx, Y(0.8), cx, Y(0.0), 'EQUIP-DETAIL');
  a.log('Added the round tub, the machinery housing and cab, the lattice boom, the mast with its rope stays and the hanging bucket (plan and 3D).');
}
function blastDrill(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  const th = Math.min(H * 0.12, 450);
  crawler(a, X(0.0), X(0.24), Y(0.1), Y(1.0), th); crawler(a, X(0.76), X(1.0), Y(0.1), Y(1.0), th);
  const dz = Z0 + th + 100;
  a.box(X(0.1), Y(0.15), dz, X(0.9), Y(1.0), dz + 160);
  a.box(X(0.1), Y(0.6), dz + 160, X(0.9), Y(1.0), dz + 160 + Math.min(900, H * 0.15));                  // compressor housing
  cabin(a, X(0.12), X(0.45), Y(0.35), Y(0.58), dz + 160, dz + 160 + Math.min(850, H * 0.14), 25);
  rail(a, X(0.1), Y(0.15), X(0.9), Y(0.15), dz + 160, 800, 14, 6);
  const mt = Math.min(H * 0.97, H - 40);
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) beam(a, [cx + dx * W * 0.1, Y(0.1) + dy * 90, dz + 160], [cx + dx * W * 0.1, Y(0.1) + dy * 90, Z0 + mt], 22, 6);
  for (let z = dz + 500; z < Z0 + mt - 200; z += 600) { beam(a, [cx - W * 0.1, Y(0.1) - 90, z], [cx + W * 0.1, Y(0.1) + 90, z + 450], 10, 5); }
  a.box(cx - W * 0.12, Y(0.1) - 130, Z0 + mt - 220, cx + W * 0.12, Y(0.1) + 130, Z0 + mt);
  a.cyl(cx, Y(0.1), dz + 160, Z0 + mt - 220, v.rod ?? 80, 10);
  a.cyl(cx, Y(0.1), dz + 160, dz + 500, 150, 12);
  a.circ(cx, Y(0.1), 150, 'EQUIP-DETAIL'); a.rect(X(0.1), Y(0.6), X(0.9), Y(1.0), 'EQUIP-DETAIL');
  a.log('Added the two crawlers, the deck, the compressor housing and cab, the lattice mast with its head, the drill string and the deck rail (plan and 3D).');
}
function trackDozer(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  const th = H * 0.42;
  crawler(a, X(0.08), X(0.28), Y(0.2), Y(0.98), th, th * 0.5); crawler(a, X(0.72), X(0.92), Y(0.2), Y(0.98), th, th * 0.5);
  a.box(X(0.26), Y(0.3), Z(0.28), X(0.74), Y(0.92), Z(0.52));
  a.box(X(0.3), Y(0.2), Z(0.42), X(0.7), Y(0.46), Z(0.62));        // hood
  cabin(a, X(0.25), X(0.75), Y(0.5), Y(0.84), Z(0.52), Z(0.9), H * 0.012);
  a.cyl(X(0.4), Y(0.3), Z(0.62), Z(0.82), H * 0.018, 8);
  // blade, push arms, tilt cylinder
  a.box(X(0.0), Y(0.0), Z(0.1), X(1.0), Y(0.045), Z(0.5)); a.box(X(0.0), Y(0.0), Z(0.5), X(1.0), Y(0.06), Z(0.54)); a.box(X(0.0), Y(-0.0), Z(0.08), X(1.0), Y(0.01), Z(0.12));
  for (const x of [X(0.1), X(0.9)]) { beam(a, [x, Y(0.04), Z(0.25)], [x, Y(0.35), Z(0.3)], H * 0.025, 8); }
  hyd(a, [X(0.4), Y(0.35), Z(0.55)], [X(0.4), Y(0.05), Z(0.46)], H * 0.018);
  // ripper
  a.box(X(0.3), Y(0.98), Z(0.22), X(0.7), Y(1.0), Z(0.46));
  beam(a, [cx, Y(0.98), Z(0.4)], [cx, Y(1.0), Z(0.04)], H * 0.04, 6); a.box(cx - W * 0.03, Y(0.99), Z(0.0), cx + W * 0.03, Y(1.0), Z(0.08));
  a.rect(X(0.0), Y(0.0), X(1.0), Y(0.06), 'EQUIP-DETAIL');
  a.log('Added the two crawlers, hood and cab with exhaust stack, the straight blade with push arms and tilt cylinder and the rear ripper shank (plan and 3D).');
}
function wheelDozer(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.28, wd = W * 0.2; a.outline();
  for (const y of [Y(0.4), Y(0.8)]) for (const x of [X(0.14), X(0.86)]) tire(a, x, y, r, wd);
  a.xcyl(X(0.14), X(0.86), Y(0.4), Z0 + r, r * 0.15, 10); a.xcyl(X(0.14), X(0.86), Y(0.8), Z0 + r, r * 0.15, 10);
  a.box(X(0.3), Y(0.12), Z(0.3), X(0.7), Y(0.55), Z(0.52)); a.box(X(0.28), Y(0.55), Z(0.3), X(0.72), Y(0.98), Z(0.62));
  cabin(a, X(0.3), X(0.7), Y(0.55), Y(0.82), Z(0.62), Z(0.96), H * 0.012);
  a.box(X(0.0), Y(0.0), Z(0.18), X(1.0), Y(0.04), Z(0.52)); for (const x of [X(0.12), X(0.88)]) beam(a, [x, Y(0.04), Z(0.35)], [x, Y(0.35), Z(0.4)], H * 0.025, 8);
  a.rect(X(0.0), Y(0.0), X(1.0), Y(0.04), 'EQUIP-DETAIL');
  a.log('Added the four large tyres, the articulated frame with engine hood, the cab, the straight blade and its push arms (plan and 3D).');
}
function waterTruck(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const c = chassis(a, { fa: 0.14, ra: 0.8, r: H * 0.22, wd: W * 0.11 });
  a.box(X(0.1), Y(0.02), Z(0.4), X(0.9), Y(0.28), Z(0.5)); a.box(X(0.36), Y(0.04), Z(0.5), X(0.8), Y(0.25), Z(0.64));
  cabin(a, X(0.1), X(0.33), Y(0.05), Y(0.2), Z(0.5), Z(0.78), H * 0.008);
  ladder(a, X(0.12), Y(0.0) + 8, Z0 + c.r, Z(0.5), W * 0.07); lamps(a, [X(0.12), X(0.3), X(0.7), X(0.88)], Y(0.0), Z(0.37), W * 0.04);
  const r = Math.min(W * 0.4, H * 0.22), zc = Z(0.5) + r;
  ytank(a, cx, Y(0.3), Y(0.97), zc, r);
  a.cyl(cx, Y(0.6), zc + r, zc + r + 60, W * 0.06, 14); a.cyl(cx, Y(0.8), zc + r, zc + r + 60, W * 0.06, 14);
  for (const f of [0.4, 0.55, 0.7, 0.85]) a.ycyl(Y(f) - 18, Y(f) + 18, cx, zc, r + 12, 24);
  rail(a, cx - r * 0.5, Y(0.35), cx - r * 0.5, Y(0.95), zc + r, 700, 14, 4);
  beam(a, [X(0.12), Y(0.0) + 30, Z0 + c.r * 1.1], [X(0.88), Y(0.0) + 30, Z0 + c.r * 1.1], 28, 8);   // front spray bar
  for (let i = 0; i < 7; i++) a.cone(X(0.15 + i * 0.1), Y(0.0) + 22, Z0 + c.r * 1.1 - 50, Z0 + c.r * 1.1 - 10, 6, 20, 6);
  a.box(X(0.2), Y(0.97), Z(0.45), X(0.8), Y(1.0), Z(0.55));
  a.log('Added the frame and wheels, left cab with ladder, the horizontal water tank with baffle bands, hatches and walkway rail, the front spray bar with nozzles and the rear spray box (plan and 3D).');
}
function serviceTruck(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const c = chassis(a, { fa: 0.16, ra: 0.8, r: H * 0.25, wd: W * 0.12, dual: true });
  cabin(a, X(0.08), X(0.92), Y(0.04), Y(0.24), Z(0.43), Z(0.88), H * 0.012); a.box(X(0.1), Y(0.0), Z(0.38), X(0.9), Y(0.06), Z(0.5));
  ladder(a, X(0.15), Y(0.0) + 6, Z0 + c.r, Z(0.43), W * 0.2); lamps(a, [X(0.14), X(0.86)], Y(0.0), Z(0.4), W * 0.1);
  const bz = Z(0.43);
  if (v.kind === 'crane') {
    a.box(X(0.06), Y(0.27), bz - 20, X(0.94), Y(0.98), bz + H * 0.04);
    for (const s of [-1, 1]) a.box(cx + s * W * 0.33 - W * 0.08, Y(0.55), bz + H * 0.04, cx + s * W * 0.33 + W * 0.08, Y(0.96), bz + H * 0.16);   // side toolboxes
    a.cyl(cx, Y(0.34), bz + H * 0.04, bz + H * 0.4, W * 0.07, 12);
    beam(a, [cx, Y(0.34), bz + H * 0.38], [cx, Y(0.58), bz + H * 0.5], W * 0.03, 8); beam(a, [cx, Y(0.58), bz + H * 0.5], [cx, Y(0.76), bz + H * 0.3], W * 0.025, 8);
    a.cyl(cx, Y(0.76), bz + H * 0.3, bz + H * 0.22, 10, 5);
    a.rect(X(0.06), Y(0.27), X(0.94), Y(0.98), 'EQUIP-DETAIL'); a.circ(cx, Y(0.34), W * 0.07, 'EQUIP-DETAIL');
  } else {
    ytank(a, cx - W * 0.2, Y(0.3), Y(0.9), bz + H * 0.2, W * 0.19); ytank(a, cx + W * 0.22, Y(0.3), Y(0.9), bz + H * 0.2, W * 0.17);
    a.box(X(0.08), Y(0.9), bz + H * 0.02, X(0.92), Y(0.99), bz + H * 0.4);
    for (const x of [X(0.25), X(0.5), X(0.75)]) { a.ycyl(Y(0.89), Y(0.86), x, bz + H * 0.24, W * 0.08, 14); }
    a.box(X(0.05), Y(0.27), bz - 20, X(0.95), Y(0.98), bz + H * 0.03); a.rect(X(0.08), Y(0.9), X(0.92), Y(0.99), 'EQUIP-DETAIL');
  }
  a.log('Added the cab with ladder, the chassis and wheels and ' + (v.kind === 'crane' ? 'the flatbed with toolboxes and a slewing knuckle crane' : 'two horizontal tanks over a flatbed with hose reels at the rear') + ' (plan and 3D).');
}
function lightPlant(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  const bh = Math.min(H * 0.22, 1000);
  a.box(X(0.1), Y(0.1), Z0 + 300, X(0.9), Y(0.9), Z0 + 300 + bh);                 // engine and generator housing
  a.box(X(0.14), Y(0.06), Z0 + 150, X(0.86), Y(0.94), Z0 + 300);
  for (const x of [X(0.1), X(0.9)]) { a.xcyl(x - 30, x + 30, Y(0.5), Z0 + 150, 150, 14); }
  a.ycyl(Y(0.0), Y(0.12), cx, Z0 + 180, 20, 6);
  for (const [x, y] of [[X(0.0), Y(0.0)], [X(1.0), Y(0.0)], [X(0.0), Y(1.0)], [X(1.0), Y(1.0)]]) { a.cyl(x, y, Z0 + 100, Z0 + 320, 20, 6); a.box(x - 80, y - 80, Z0, x + 80, y + 80, Z0 + 30); }
  a.rect(X(0.1), Y(0.1), X(0.9), Y(0.9), 'EQUIP-DETAIL');
  const mz = Z0 + 300 + bh, mt = Z0 + H - 150;
  a.cyl(cx, Y(0.5), mz, mz + (mt - mz) * 0.34, 70, 10); a.cyl(cx, Y(0.5), mz + (mt - mz) * 0.34, mz + (mt - mz) * 0.67, 55, 10); a.cyl(cx, Y(0.5), mz + (mt - mz) * 0.67, mt, 40, 10);
  for (const s of [-1, 1]) beam(a, [cx, Y(0.5), mz + 200], [cx + s * W * 0.4, Y(0.5) + s * 20, Z0 + 340], 6, 5);
  a.box(cx - W * 0.45, Y(0.5) - 40, mt, cx + W * 0.45, Y(0.5) + 40, mt + 60);
  const n = v.lamps; for (let i = 0; i < n; i++) { const x = cx - W * 0.4 + (W * 0.8 * (i + 0.5)) / n; a.box(x - 130, Y(0.5) - 180, mt + 60, x + 130, Y(0.5) + 60, mt + 150); }
  a.circ(cx, Y(0.5), 70, 'EQUIP-DETAIL');
  a.log(`Added the engine and generator housing on a skid with wheels and jack feet, the telescoping mast and ${n} lamp heads on a cross bar (plan and 3D).`);
}
function markerPost(a, v) {
  const { X0, X1, Z0, W, D, H, cx, cy } = a;
  a.outline(); a.box(cx - W * 0.45, cy - D * 0.45, Z0, cx + W * 0.45, cy + D * 0.45, Z0 + H * 0.05);
  if (v.kind === 'stake') { a.box(cx - W * 0.2, cy - D * 0.2, Z0 + H * 0.05, cx + W * 0.2, cy + D * 0.2, Z0 + H); a.box(cx - W * 0.22, cy - D * 0.22, Z0 + H * 0.7, cx + W * 0.22, cy + D * 0.22, Z0 + H * 0.85); }
  else { a.cyl(cx, cy, Z0 + H * 0.05, Z0 + H, W * 0.1, 10); a.box(cx - W * 0.45, cy - 6, Z0 + H * 0.6, cx + W * 0.45, cy + 6, Z0 + H * 0.97); for (let i = 0; i < 3; i++) a.box(cx - W * 0.45, cy - 8, Z0 + H * (0.65 + i * 0.1), cx + W * 0.45, cy + 8, Z0 + H * (0.68 + i * 0.1)); if (v.kind === 'flag') a.box(cx, cy - 4, Z0 + H * 0.97, cx + W * 0.45, cy + 4, Z0 + H); }
  a.circ(cx, cy, W * 0.1, 'EQUIP-DETAIL');
  a.log('Added the base plate and ' + (v.kind === 'stake' ? 'a square stake with a reflective band' : 'a round post with a reflective sign panel') + ' (plan and 3D).');
}
function berm(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  profY(a, [[X0, Z0], [X1, Z0], [X(0.7), Z0 + H], [X(0.3), Z0 + H]], YF, 0);
  a.line(X(0.3), YF, X(0.3), 0, 'EQUIP-DETAIL'); a.line(X(0.7), YF, X(0.7), 0, 'EQUIP-DETAIL');
  for (let i = 0; i < 3; i++) { const y = YF + (D * (i + 0.5)) / 3; a.box(X(0.45), y - 20, Z0 + H, X(0.55), y + 20, Z0 + H + 0.001 * H); }
  a.log('Added the sloped-sided berm section with a flat crest and plan lines at the toe and crest (plan and 3D).');
}
function explosivesTruck(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const c = chassis(a, { fa: 0.15, ra: 0.82, r: H * 0.22, wd: W * 0.12, dual: true });
  cabin(a, X(0.08), X(0.92), Y(0.04), Y(0.22), Z(0.45), Z(0.88), H * 0.012); ladder(a, X(0.15), Y(0.0) + 6, Z0 + c.r, Z(0.45), W * 0.2);
  a.box(X(0.06), Y(0.25), Z(0.45), X(0.94), Y(0.98), Z(0.5));
  for (let i = 0; i < v.bins; i++) { const x = X(0.5) + (i - (v.bins - 1) / 2) * W * (0.8 / v.bins); a.cyl(x, Y(0.5), Z(0.5), Z(0.82), W * 0.36 / v.bins, 16); a.cone(x, Y(0.5), Z(0.82), Z(0.92), W * 0.36 / v.bins, W * 0.08 / v.bins, 16); a.circ(x, Y(0.5), W * 0.36 / v.bins); }
  a.box(X(0.1), Y(0.2), Z(0.5), X(0.9), Y(0.28), Z(0.86));
  a.box(X(0.1), Y(0.88), Z(0.5), X(0.9), Y(0.97), Z(0.75));
  beam(a, [cx, Y(0.95), Z(0.72)], [cx, Y(0.99), Z(0.98)], 40, 8); a.cyl(X(0.88), Y(0.9), Z(0.75), Z(0.92), 50, 10);
  a.log(`Added the cab and chassis, ${v.bins} upright bulk bins with cone bottoms, the pump and hose cabinet and a swing boom with a hose reel at the rear (plan and 3D).`);
}
function magazine(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline(); a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.06);
  a.box(X0, YF, Z0 + H * 0.06, X1, 0, Z0 + H);
  for (const s of [-1, 1]) { a.box(cx + s * W * 0.25 - W * 0.22, YF - 12, Z0 + H * 0.12, cx + s * W * 0.25 + W * 0.22, YF, Z0 + H * 0.88); a.box(cx + s * W * 0.25 + (s > 0 ? -W * 0.03 : W * 0.03), YF - 28, Z0 + H * 0.45, cx + s * W * 0.25 + (s > 0 ? -W * 0.03 : W * 0.03) + 30, YF - 12, Z0 + H * 0.55); }
  a.box(cx - 60, YF - 24, Z0 + H * 0.4, cx + 60, YF - 12, Z0 + H * 0.5);
  for (let x = X0 + W * 0.1; x < X1; x += W * 0.2) a.box(x, 0 - 14, Z0 + H * 0.12, x + 20, 0, Z0 + H * 0.9);
  for (const x of [X0 + W * 0.2, X1 - W * 0.2]) a.box(x - 100, YF + 10, Z0 + H - 4, x + 100, YF + 140, Z0 + H + 0);
  a.line(cx, YF, cx, 0, 'EQUIP-DETAIL'); a.arc(cx - W * 0.25, YF, W * 0.22, 0, 90); a.arc(cx + W * 0.25, YF, W * 0.22, 90, 180);
  a.log('Added the steel box with a ribbed rear wall, double doors with a hasp and padlock, roof vents and plan door swings (plan and 3D).');
}
function tireHandler(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.2; a.outline();
  for (const y of [Y(0.55), Y(0.88)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.14);
  a.box(X(0.22), Y(0.4), Z(0.28), X(0.78), Y(1.0), Z(0.5)); cabin(a, X(0.45), X(0.78), Y(0.55), Y(0.85), Z(0.5), Z(0.9), H * 0.01);
  a.box(X(0.26), Y(0.7), Z(0.5), X(0.44), Y(0.98), Z(0.65));
  beam(a, [X(0.2), Y(0.45), Z(0.4)], [X(0.2), Y(0.1), Z(0.5)], H * 0.04, 8); beam(a, [X(0.8), Y(0.45), Z(0.4)], [X(0.8), Y(0.1), Z(0.5)], H * 0.04, 8);
  for (const x of [X(0.0), X(1.0)]) a.box(x - (x < cx ? -1 : 1) * W * 0.0, Y(0.0), Z(0.3), x + (x < cx ? W * 0.07 : -W * 0.07), Y(0.2), Z(0.7));
  a.box(X(0.0), Y(0.0), Z(0.65), X(1.0), Y(0.03), Z(0.7));
  a.rect(X(0.0), Y(0.0), X(0.07), Y(0.2), 'EQUIP-DETAIL'); a.rect(X(0.93), Y(0.0), X(1.0), Y(0.2), 'EQUIP-DETAIL');
  a.log('Added four large tyres, the chassis and cab, the two lift arms with their pads and the cross beam for gripping a haul-truck tyre (plan and 3D).');
}
function mineGrader(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.22; a.outline();
  for (const y of [Y(0.7), Y(0.88)]) for (const x of [X(0.12), X(0.88)]) tire(a, x, y, r, W * 0.14);
  for (const x of [X(0.12), X(0.88)]) tire(a, x, Y(0.12), r * 0.9, W * 0.14);
  a.xcyl(X(0.12), X(0.88), Y(0.12), Z0 + r * 0.9, 25, 8);
  beam(a, [cx, Y(0.1), Z(0.4)], [cx, Y(0.62), Z(0.5)], H * 0.05, 8);                    // long frame
  a.box(X(0.25), Y(0.62), Z(0.32), X(0.75), Y(0.98), Z(0.62)); cabin(a, X(0.3), X(0.7), Y(0.55), Y(0.78), Z(0.62), Z(0.98), H * 0.01);
  a.box(X(0.0), Y(0.28), Z(0.25), X(1.0), Y(0.36), Z(0.5)); beam(a, [X(0.1), Y(0.4), Z(0.3)], [cx, Y(0.12), Z(0.46)], 25, 6); beam(a, [X(0.9), Y(0.4), Z(0.3)], [cx, Y(0.12), Z(0.46)], 25, 6);
  a.cyl(cx, Y(0.3), Z(0.4), Z(0.5), W * 0.2, 16);
  a.rect(X(0.0), Y(0.28), X(1.0), Y(0.36), 'EQUIP-DETAIL');
  a.log('Added the long frame with the drawbar and circle, the full-width blade, the front steering wheels, tandem rear wheels and the cab (plan and 3D).');
}

const sz = (arr, f) => arr.map(f);

const SURFACE = [
  fam({ cat: 'mining/surface', title: 'Generic rigid haul truck',
    desc: (v) => `Rigid mine haul truck, ${v.t} ton class: frame with front axle and dual rear wheels, left cab and canopy with ladder and rail, dump body with side walls, visor and hoist cylinders.`,
    vs: [[40, 160, 300, 160], [60, 180, 335, 178], [100, 215, 400, 205], [150, 250, 445, 228], [220, 285, 500, 255], [300, 315, 540, 275], [400, 350, 590, 300]].map(([t, w, d, h]) => [`${t} ton class`, w, d, h, 0, { t }]),
    build: haulTruck }),
  fam({ cat: 'mining/surface', title: 'Generic mining hydraulic excavator',
    desc: (v) => `Hydraulic mining excavator with a ${v.bucket} m3 ${v.kind === 'face' ? 'face-shovel bucket' : 'backhoe bucket'}: two crawlers, swing ring, upper housing with counterweight and cab, boom and stick with cylinders and a toothed bucket.`,
    vs: [['face', 2, 130, 300, 140], ['face', 5, 170, 400, 180], ['face', 10, 220, 520, 230], ['face', 15, 270, 640, 280], ['face', 22, 310, 720, 320], ['backhoe', 3, 150, 340, 150], ['backhoe', 6, 185, 420, 185], ['backhoe', 12, 235, 540, 235]]
      .map(([kind, bucket, w, d, h]) => [`${kind === 'face' ? 'face shovel' : 'backhoe'}, ${bucket} m3 bucket`, w, d, h, 0, { kind, bucket }]),
    build: miningExcavator }),
  fam({ cat: 'mining/surface', title: 'Generic electric rope shovel',
    desc: (v) => `Electric rope shovel with a ${v.m3} m3 dipper: two crawlers, a round swing ring, machinery housing with counterweight and cab, an A-frame boom with hoist ropes, a dipper handle and a toothed dipper.`,
    vs: [[12, 340, 560, 420], [20, 420, 680, 520], [30, 500, 800, 600], [50, 560, 900, 680]].map(([m3, w, d, h]) => [`dipper ${m3} m3`, w, d, h, 0, { m3 }]),
    build: ropeShovel }),
  fam({ cat: 'mining/surface', title: 'Generic walking dragline',
    desc: (v) => `Dragline with a ${v.m3} m3 bucket: round tub base, machinery housing and cab, a lattice boom ${v.boom} m long, a mast with rope stays and a hanging bucket.`,
    vs: [[20, 60, 700, 2500, 1300], [40, 80, 900, 3300, 1700], [80, 100, 1200, 4100, 2100]].map(([m3, boom, w, d, h]) => [`bucket ${m3} m3, ${boom} m boom`, w, d, h, 0, { m3, boom }]),
    build: dragline }),
  fam({ cat: 'mining/surface', title: 'Generic blast-hole drill rig',
    desc: (v) => `Crawler blast-hole drill rig with a ${v.mast} ft mast for ${v.hole} in holes: two crawlers, deck with rail, compressor housing, cab, lattice mast with head and a drill string.`,
    vs: [[4.5, 25, 100, 260, 330, 40], [5, 30, 110, 280, 420, 45], [6.5, 40, 120, 300, 560, 55], [9, 60, 150, 380, 800, 75], [12, 80, 180, 440, 1050, 90]].map(([hole, mast, w, d, h, rod]) => [`${hole} in hole, ${mast} ft mast`, w, d, h, 0, { hole, mast, rod }]),
    build: blastDrill }),
  fam({ cat: 'mining/surface', title: 'Generic mine track dozer',
    desc: (v) => `Track dozer, ${v.t} ton class, for the mine: two crawlers, hood with exhaust stack, cab, straight blade with push arms and tilt cylinder and a rear ripper shank.`,
    vs: [[25, 125, 210, 115], [40, 160, 240, 135], [50, 185, 260, 155], [70, 205, 300, 180], [100, 225, 350, 195]].map(([t, w, d, h]) => [`${t} ton class`, w, d, h, 0, { t }]),
    build: trackDozer }),
  fam({ cat: 'mining/surface', title: 'Generic mine wheel dozer',
    desc: (v) => `Wheel dozer, ${v.t} ton class: four large tyres on an articulated frame, engine hood, cab, a straight blade and its push arms.`,
    vs: [[30, 150, 230, 125], [55, 185, 280, 150], [75, 210, 320, 170]].map(([t, w, d, h]) => [`${t} ton class`, w, d, h, 0, { t }]),
    build: wheelDozer }),
  fam({ cat: 'mining/surface', title: 'Generic mine water truck',
    desc: (v) => `Rigid water truck, ${v.gal} gal tank: frame, wheels, left cab with ladder, a horizontal tank with baffle bands and hatches, a walkway rail, a front spray bar with nozzles and a rear spray box.`,
    vs: [[8000, 160, 330, 150], [14000, 185, 370, 170], [26000, 215, 430, 200], [42000, 260, 490, 235]].map(([gal, w, d, h]) => [`${gal} gal tank`, w, d, h, 0, { gal }]),
    build: waterTruck }),
  fam({ cat: 'mining/surface', title: 'Generic mine service truck',
    desc: (v) => v.kind === 'crane' ? `Mine service truck with a flatbed, side toolboxes and a slewing knuckle crane, ${v.cls} duty: cab with ladder, chassis and dual rear wheels.` : `Mine fuel and lube truck, ${v.gal} gal: cab with ladder, chassis and dual rear wheels, two horizontal tanks over a flatbed and a rear hose-reel cabinet.`,
    vs: [['fuel', 4000, 100, 300, 125], ['fuel', 8000, 110, 340, 135], ['crane', 'medium', 100, 300, 125], ['crane', 'heavy', 112, 345, 142]].map(([kind, x, w, d, h]) => [kind === 'fuel' ? `fuel and lube, ${x} gal` : `knuckle crane, ${x} duty`, w, d, h, 0, kind === 'fuel' ? { kind, gal: x } : { kind, cls: x }]),
    build: serviceTruck }),
  fam({ cat: 'mining/surface', title: 'Generic mine light plant',
    desc: (v) => `Trailer-style diesel light plant with a ${v.mast} ft telescoping mast carrying ${v.lamps} lamp heads: engine and generator housing, wheels, jack feet and stay lines.`,
    vs: [[20, 4, 70, 140], [30, 4, 80, 160], [30, 6, 90, 170], [40, 6, 96, 180]].map(([mast, lamps, w, d]) => [`${mast} ft mast, ${lamps} lamps`, w, d, mast * 12 + 50, 0, { mast, lamps }]),
    build: lightPlant }),
  fam({ cat: 'mining/surface', title: 'Generic highwall marker post',
    desc: (v) => `Highwall and bench edge marker: a base plate and ${v.kind === 'stake' ? 'a square stake with a reflective band' : v.kind === 'flag' ? 'a round post with a reflective panel and a flag' : 'a round post with a reflective sign panel'}.`,
    vs: [['stake', 'stake, 24 in', 8, 8, 24], ['post', 'post, 48 in', 16, 8, 48], ['post', 'post, 72 in', 20, 10, 72], ['flag', 'post with flag, 96 in', 20, 10, 96]].map(([kind, l, w, d, h]) => [l, w, d, h, 0, { kind }]),
    build: markerPost }),
  fam({ cat: 'mining/surface', title: 'Generic dump edge berm section',
    desc: (v) => `Tipping-point berm section, ${v.h} ft high and ${v.len} ft long: a continuous bank with sloped faces, a flat crest and plan lines at the toe and crest.`,
    vs: [[3, 12], [4, 20], [6, 30], [8, 40]].map(([h, len]) => [`${h} ft high, ${len} ft long`, h * 12 * 2.4, len * 12, h * 12, 0, { h, len, posts: 3 }]),
    build: berm }),
  fam({ cat: 'mining/surface', title: 'Generic bulk explosives truck',
    desc: (v) => `Bulk explosives truck, ${v.t} ton load: cab with ladder, chassis and dual rear wheels, ${v.bins} upright bulk bins with cone bottoms, a pump cabinet and a swing boom with a hose reel.`,
    vs: [[6, 2, 100, 290, 130], [12, 2, 120, 340, 150], [20, 3, 140, 400, 165]].map(([t, bins, w, d, h]) => [`${t} ton load, ${bins} bins`, w, d, h, 0, { t, bins }]),
    build: explosivesTruck }),
  fam({ cat: 'mining/surface', title: 'Generic explosives magazine container',
    desc: (v) => `Steel explosives magazine, ${v.ft} ft long: a box with a ribbed rear wall, double doors with hasp and padlock, roof vents and plan door swings.`,
    vs: [[10, 118, 96], [20, 236, 96], [40, 472, 96]].map(([ft, d, w]) => [`${ft} ft container`, w, d, 102, 0, { ft }]),
    build: magazine }),
  fam({ cat: 'mining/surface', title: 'Generic mine tire handler',
    desc: (v) => `Tyre handler for ${v.t} ton class haul trucks: four large tyres, chassis and cab, two lift arms with gripping pads and a cross beam.`,
    vs: [[60, 150, 270, 140], [150, 200, 340, 175], [300, 270, 420, 215]].map(([t, w, d, h]) => [`${t} ton class trucks`, w, d, h, 0, { t }]),
    build: tireHandler }),
  fam({ cat: 'mining/surface', title: 'Generic mine haul-road grader',
    desc: (v) => `Motor grader with a ${v.blade} ft blade: long frame with drawbar and circle, full-width blade, front steering wheels, tandem rear wheels and a cab.`,
    vs: [[14, 100, 360, 135], [18, 110, 420, 145], [24, 135, 500, 165]].map(([blade, w, d, h]) => [`${blade} ft blade`, w, d, h, 0, { blade }]),
    build: mineGrader }),
];

// ---------------------------------------------------------------- UNDERGROUND ----------------------------------------------------------
function lhd(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.3; a.outline();
  for (const y of [Y(0.3), Y(0.74)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.2);
  a.box(X(0.22), Y(0.14), Z(0.28), X(0.78), Y(0.5), Z(0.55));            // front frame
  a.box(X(0.2), Y(0.5), Z(0.28), X(0.8), Y(1.0), Z(0.6)); a.box(X(0.25), Y(0.8), Z(0.6), X(0.75), Y(1.0), Z(0.74));   // rear frame and engine hood
  a.box(X(0.2), Y(0.52), Z(0.6), X(0.36), Y(0.72), Z(0.95)); a.box(X(0.17), Y(0.5), Z(0.93), X(0.78), Y(0.76), Z(0.97));   // operator station canopy
  for (const x of [X(0.2), X(0.6), X(0.75)]) a.cyl(x, Y(0.52), Z(0.6), Z(0.93), 14, 6);
  for (const s of [-1, 1]) { beam(a, [cx + s * W * 0.26, Y(0.46), Z(0.5)], [cx + s * W * 0.26, Y(0.1), Z(0.5)], H * 0.04, 8); hyd(a, [cx + s * W * 0.2, Y(0.45), Z(0.7)], [cx + s * W * 0.22, Y(0.16), Z(0.55)], H * 0.03); }
  a.box(X(0.06), Y(0.0), Z(0.1), X(0.94), Y(0.14), Z(0.5)); a.box(X(0.06), Y(0.0), Z(0.1), X(0.94), Y(0.03), Z(0.02 + 0.5));
  a.box(X(0.06), Y(-0.0), Z(0.04), X(0.94), Y(0.02), Z(0.12));       // bucket lip
  for (let i = 0; i < 5; i++) a.box(X(0.1 + i * 0.17), Y(-0.0), Z(0.0), X(0.16 + i * 0.17), Y(0.02), Z(0.1));
  a.rect(X(0.06), Y(0.0), X(0.94), Y(0.14), 'EQUIP-DETAIL'); a.line(X(0.0), Y(0.5), X(1.0), Y(0.5), 'EQUIP-DETAIL');
  a.log('Added the four tyres, the front frame with the boom arms and tilt cylinders, the wide bucket with teeth, the rear frame with hood and the operator canopy (plan and 3D).');
}
function ugTruck(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.27; a.outline();
  for (const y of [Y(0.22), Y(0.62), Y(0.82)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.18);
  a.box(X(0.2), Y(0.04), Z(0.26), X(0.8), Y(1.0), Z(0.36));
  a.box(X(0.3), Y(0.04), Z(0.36), X(0.78), Y(0.26), Z(0.58));        // engine hood
  cabin(a, X(0.1), X(0.34), Y(0.08), Y(0.22), Z(0.36), Z(0.8), H * 0.012);
  profX(a, [[Y(0.28), Z(0.4)], [Y(0.99), Z(0.36)], [Y(0.99), Z(0.39)], [Y(0.28), Z(0.43)]], X(0.1), X(0.9));
  for (const [xa, xb] of [[X(0.08), X(0.12)], [X(0.88), X(0.92)]]) profX(a, [[Y(0.28), Z(0.4)], [Y(0.99), Z(0.36)], [Y(0.99), Z(0.88)], [Y(0.28), Z(0.98)]], xa, xb);
  a.box(X(0.08), Y(0.28), Z(0.4), X(0.92), Y(0.31), Z(0.98));
  for (const s of [-1, 1]) hyd(a, [cx + s * W * 0.25, Y(0.5), Z(0.3)], [cx + s * W * 0.25, Y(0.62), Z(0.45)], W * 0.025);
  a.line(X(0.0), Y(0.27), X(1.0), Y(0.27), 'EQUIP-DETAIL'); a.rect(X(0.08), Y(0.28), X(0.92), Y(0.99), 'EQUIP-DETAIL');
  lamps(a, [X(0.14), X(0.3)], Y(0.0), Z(0.3), W * 0.07);
  a.log('Added the three axles with six tyres, the chassis with hood and cab, the tipping body with side walls and front wall and the hoist cylinders (plan and 3D).');
}
function roofBolter(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.22; a.outline();
  for (const y of [Y(0.3), Y(0.74)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.2);
  a.box(X(0.2), Y(0.12), Z(0.22), X(0.8), Y(1.0), Z(0.46)); a.box(X(0.24), Y(0.72), Z(0.46), X(0.76), Y(1.0), Z(0.6));
  for (const x of [X(0.12), X(0.88)]) { a.cyl(x, Y(0.55), Z(0.46), Z(0.82), 16, 6); a.cyl(x, Y(0.95), Z(0.46), Z(0.82), 16, 6); }
  a.box(X(0.1), Y(0.5), Z(0.82), X(0.9), Y(1.0), Z(0.86));
  const n = v.booms;
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? cx : X(i === 0 ? 0.28 : 0.72), tz = Z0 + H * 0.97;
    beam(a, [x, Y(0.35), Z(0.46)], [x, Y(0.12), Z(0.6)], H * 0.03, 8); a.box(x - W * 0.05, Y(0.14), Z(0.3), x + W * 0.05, Y(0.09), tz);
    a.box(x - W * 0.06, Y(0.17), Z(0.6), x + W * 0.06, Y(0.08), Z(0.66)); a.cyl(x, Y(0.12), Z(0.66), tz, H * 0.012, 8); a.cyl(x, Y(0.12), tz, tz + 0, 3, 4);
    a.circ(x, Y(0.12), W * 0.05, 'EQUIP-DETAIL');
  }
  a.log(`Added the four tyres, the chassis with hood, the four-post canopy and ${n === 1 ? 'one boom' : 'two booms'} with feed rails, drill steels and canopy-height supports (plan and 3D).`);
}
function jumbo(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.25; a.outline();
  for (const y of [Y(0.45), Y(0.8)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.18);
  a.box(X(0.2), Y(0.3), Z(0.22), X(0.8), Y(1.0), Z(0.45)); a.box(X(0.7), Y(0.55), Z(0.45), X(0.94), Y(0.95), Z(0.62));
  cabin(a, X(0.08), X(0.3), Y(0.5), Y(0.72), Z(0.45), Z(0.8), H * 0.012);
  a.box(X(0.1), Y(0.3), Z(0.8), X(0.9), Y(0.75), Z(0.83));           // canopy
  const n = v.booms;
  for (let i = 0; i < n; i++) {
    const x = X(n === 1 ? 0.5 : 0.25 + (0.5 * i) / (n - 1)), fx = X(n === 1 ? 0.5 : 0.1 + (0.8 * i) / (n - 1)), fz = Z(0.5 + 0.38 * (i % 2));
    beam(a, [x, Y(0.4), Z(0.4)], [fx, Y(0.1), fz], H * 0.04, 8); a.cyl(x, Y(0.4), Z(0.38), Z(0.46), H * 0.06, 10);
    beam(a, [fx, Y(0.1) + 60, fz - H * 0.1], [fx, Y(0.0), fz + H * 0.12], H * 0.025, 8); a.box(fx - W * 0.02, Y(0.0), fz - H * 0.1, fx + W * 0.02, Y(0.1), fz + H * 0.14);
  }
  a.rect(X(0.1), Y(0.0), X(0.9), Y(0.3), 'EQUIP-DETAIL');
  a.log(`Added four tyres, the carrier with cab and canopy and ${n} drill ${n === 1 ? 'boom' : 'booms'} at different heights, each with a feed rail and drifter (plan and 3D).`);
}
function personnelCarrier(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.22; a.outline();
  for (const y of [Y(0.12), Y(0.88)]) for (const x of [X(0.08), X(0.92)]) tire(a, x, y, r, W * 0.17);
  a.box(X(0.14), Y(0.02), Z(0.26), X(0.86), Y(0.99), Z(0.38));
  a.box(X(0.2), Y(0.03), Z(0.38), X(0.8), Y(0.14), Z(0.56));
  const rows = Math.ceil(v.seats / 2);
  for (let i = 0; i < rows; i++) { const y = Y(0.2 + 0.74 * (i / rows)); a.box(X(0.2), y - D * 0.01, Z(0.38), X(0.8), y + D * 0.05, Z(0.5)); a.box(X(0.2), y + D * 0.05, Z(0.38), X(0.8), y + D * 0.07, Z(0.65)); a.rect(X(0.2), y, X(0.8), y + D * 0.06, 'EQUIP-DETAIL'); }
  for (const x of [X(0.1), X(0.9)]) for (const f of [0.14, 0.5, 0.96]) a.cyl(x, Y(f), Z(0.38), Z(0.9), 14, 6);
  a.box(X(0.08), Y(0.02), Z(0.9), X(0.92), Y(0.98), Z(0.94));
  lamps(a, [X(0.2), X(0.8)], Y(0.0), Z(0.4), W * 0.1);
  a.log(`Added four tyres, the chassis, a front hood, ${rows} bench rows for ${v.seats} seats, the open canopy on posts and the headlamps (plan and 3D).`);
}
function chargeVehicle(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.2; a.outline();
  for (const y of [Y(0.25), Y(0.78)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.18);
  a.box(X(0.2), Y(0.04), Z(0.2), X(0.8), Y(0.99), Z(0.36)); cabin(a, X(0.2), X(0.55), Y(0.12), Y(0.3), Z(0.36), Z(0.6), H * 0.01);
  a.box(X(0.5), Y(0.5), Z(0.36), X(0.9), Y(0.98), Z(0.5)); a.cyl(X(0.3), Y(0.7), Z(0.36), Z(0.55), W * 0.14, 12);
  const sy = Y(0.45), sx0 = X(0.2), sx1 = X(0.55);
  for (const s of [0, 1]) { beam(a, [sx0, sy, Z(0.37)], [sx1, sy, Z(0.6 + s * 0.0)], 14, 5); }
  a.box(X(0.14), Y(0.3), Z(0.36), X(0.58), Y(0.62), Z(0.4)); beam(a, [X(0.16), Y(0.32), Z(0.4)], [X(0.56), Y(0.6), Z(0.78)], 14, 5); beam(a, [X(0.56), Y(0.32), Z(0.4)], [X(0.16), Y(0.6), Z(0.78)], 14, 5);
  a.box(X(0.12), Y(0.3), Z(0.78), X(0.6), Y(0.64), Z(0.8)); rail(a, X(0.12), Y(0.3), X(0.6), Y(0.3), Z(0.8), H * 0.16, 12, 5); rail(a, X(0.12), Y(0.64), X(0.6), Y(0.64), Z(0.8), H * 0.16, 12, 5);
  a.log('Added four tyres, the chassis with cab, the hose reel and pressure vessel, a scissor lift with a railed basket platform and the hose cabinet (plan and 3D).');
}
function shotcreteRig(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = H * 0.22; a.outline();
  for (const y of [Y(0.25), Y(0.78)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.18);
  a.box(X(0.2), Y(0.04), Z(0.22), X(0.8), Y(0.99), Z(0.38)); cabin(a, X(0.1), X(0.35), Y(0.1), Y(0.3), Z(0.38), Z(0.72), H * 0.01);
  a.ycyl(Y(0.35), Y(0.95), cx + W * 0.1, Z(0.56), W * 0.26, 18); a.ell(cx + W * 0.1, Y(0.35), Z(0.56), W * 0.26, D * 0.02, W * 0.26, 14, 5);
  for (let f = 0.42; f < 0.9; f += 0.12) a.ycyl(Y(f) - 8, Y(f) + 8, cx + W * 0.1, Z(0.56), W * 0.27, 18);
  beam(a, [cx, Y(0.34), Z(0.42)], [cx, Y(0.1), Z(0.9)], H * 0.035, 8); beam(a, [cx, Y(0.1), Z(0.9)], [cx, Y(0.0), Z(0.62)], H * 0.025, 8); a.cone(cx, Y(0.0), Z(0.62), Z(0.5), 20, 50, 8);
  a.log('Added four tyres, the chassis and cab, the tilted mixer drum with ribs, and the folding spray boom with a nozzle (plan and 3D).');
}
function ringDrill(a, v) {
  const { X0, X1, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline(); const r = H * 0.2;
  for (const y of [Y(0.3), Y(0.78)]) for (const x of [X(0.1), X(0.9)]) tire(a, x, y, r, W * 0.2);
  a.box(X(0.2), Y(0.15), Z(0.2), X(0.8), Y(1.0), Z(0.4)); a.box(X(0.14), Y(0.55), Z(0.4), X(0.5), Y(0.8), Z(0.42));
  for (const x of [X(0.14), X(0.5)]) { a.cyl(x, Y(0.58), Z(0.4), Z(0.8), 12, 6); a.cyl(x, Y(0.78), Z(0.4), Z(0.8), 12, 6); }
  a.box(X(0.12), Y(0.55), Z(0.8), X(0.52), Y(0.8), Z(0.83));
  beam(a, [X(0.6), Y(0.4), Z(0.4)], [X(0.6), Y(0.3), Z(0.6)], H * 0.05, 8); a.cyl(X(0.6), Y(0.3), Z(0.6), Z(0.64), W * 0.12, 10);
  a.box(X(0.52), Y(0.4), Z(0.5), X(0.68), Y(0.28), Z(0.98)); a.cyl(X(0.6), Y(0.34), Z(0.98), Z(0.99), 20, 6);
  a.circ(X(0.6), Y(0.3), W * 0.12, 'EQUIP-DETAIL');
  a.log('Added four tyres, the chassis, the operator canopy and a rotating boom carrying a long drill feed for upward holes (plan and 3D).');
}
function axialFan(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = Math.min(W, H) * 0.34, zc = Z0 + H * 0.5; a.outline();
  a.ycyl(YF, 0, cx, zc, r, 28); a.ycyl(YF, YF + D * 0.1, cx, zc, r * 1.12, 28); a.ycyl(0 - D * 0.1, 0, cx, zc, r * 1.12, 28);
  a.ycyl(Y(0.35), Y(0.65), cx, zc, r * 0.32, 14);
  for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2; a.box(cx + Math.cos(an) * r * 0.2 - 12, Y(0.42), zc + Math.sin(an) * r * 0.2 - 12, cx + Math.cos(an) * r * 0.9 + 12, Y(0.58), zc + Math.sin(an) * r * 0.9 + 12); }
  for (const f of [0.15, 0.85]) { a.box(X0, Y(f) - 30, Z0, X1, Y(f) + 30, Z0 + H * 0.12); a.box(cx - r * 0.9, Y(f) - 20, Z0 + H * 0.12, cx - r * 0.5, Y(f) + 20, zc - r * 0.7); a.box(cx + r * 0.5, Y(f) - 20, Z0 + H * 0.12, cx + r * 0.9, Y(f) + 20, zc - r * 0.7); }
  a.box(cx + r * 0.9, Y(0.4), zc - r * 0.2, cx + r * 1.3, Y(0.6), zc + r * 0.3);   // motor box
  a.circ(cx, a.cy, r * 0.32, 'EQUIP-DETAIL'); a.line(cx - r, a.cy, cx + r, a.cy, 'EQUIP-DETAIL');
  a.log('Added the cylindrical casing with inlet and outlet flanges, the eight-blade rotor and hub, two saddle supports on skids and the side motor box (plan and 3D).');
}
function ductSpool(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y } = fr(a);
  const r = v.dia * IN / 2, zc = Z0 + H - r - 120 * (v.hang ? 1 : 0); a.outline();
  a.ycyl(YF, 0, cx, zc, r, 26);
  for (const y of [YF + 20, -20]) a.ycyl(y - 20, y + 20, cx, zc, r * 1.1, 26);
  for (let f = 0.25; f < 1; f += 0.5) a.ycyl(Y(f) - 8, Y(f) + 8, cx, zc, r * 1.04, 24);
  for (const f of [0.25, 0.75]) { a.cyl(cx - r * 0.7, Y(f), zc + r * 0.7, Z0 + H, 8, 5); a.cyl(cx + r * 0.7, Y(f), zc + r * 0.7, Z0 + H, 8, 5); a.box(cx - r * 0.8, Y(f) - 30, Z0 + H - 14, cx + r * 0.8, Y(f) + 30, Z0 + H); a.ycyl(Y(f) - 14, Y(f) + 14, cx, zc, r * 1.03, 24); }
  a.circ(cx, a.cy, r, 'EQUIP-DETAIL');
  a.log('Added the round duct spool with flanges at both ends, a middle stiffening band and two hanger straps with rods to a ceiling bar (plan and 3D).');
}
function flexDuct(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y } = fr(a);
  const r = v.dia * IN / 2, zc = Z0 + H - r - 90; a.outline();
  a.ycyl(YF, 0, cx, zc, r, 20);
  for (let y = YF + 60; y < 0; y += 150) a.ycyl(y - 4, y + 4, cx, zc, r * 1.05, 20);
  const n = Math.max(2, Math.round(D / 1500)); for (let i = 0; i <= n; i++) { const y = YF + 80 + ((D - 160) * i) / n; beam(a, [cx - r * 0.8, y, zc + r * 0.6], [cx - r * 0.3, y, Z0 + H], 6, 4); beam(a, [cx + r * 0.8, y, zc + r * 0.6], [cx + r * 0.3, y, Z0 + H], 6, 4); a.box(cx - r * 0.5, y - 14, Z0 + H - 16, cx + r * 0.5, y + 14, Z0 + H); }
  a.ycyl(YF - 6, YF + 30, cx, zc, r * 1.12, 20); a.ycyl(-30, 6, cx, zc, r * 1.12, 20);
  a.circ(cx, a.cy, r, 'EQUIP-DETAIL');
  a.log('Added the fabric duct run drawn as a ribbed tube with end collars and hanger wires to a suspended line at each support (plan and 3D).');
}
function refuge(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  const r = W * 0.46, zc = Z0 + H * 0.52; a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.08);                          // skid base
  a.ycyl(YF, 0, cx, zc, r, 30); a.ell(cx, 0, zc, r, D * 0.01, r, 20, 6);
  for (let f = 0.12; f < 1; f += 0.15) a.ycyl(Y(f) - 15, Y(f) + 15, cx, zc, r * 1.04, 30);
  a.box(cx - r * 0.55, YF - 40, zc - r * 0.7, cx + r * 0.55, YF, zc + r * 0.45);   // airlock door
  a.cyl(cx, YF - 40, zc - r * 0.1, zc + r * 0.08, r * 0.12, 12); a.box(cx - r * 0.25, YF - 60, zc + r * 0.25, cx + r * 0.25, YF - 40, zc + r * 0.4);
  a.cyl(cx + r * 0.2, Y(0.6), zc + r, zc + r + 120, 40, 8); a.cyl(cx - r * 0.2, Y(0.3), zc + r, zc + r + 100, 40, 8);
  a.rect(cx - r * 0.55, YF, cx + r * 0.55, YF + 40, 'EQUIP-DETAIL'); a.line(X0, Y(0.5), X1, Y(0.5), 'EQUIP-DETAIL');
  a.log(`Added the skid base, the round steel hull with stiffening rings, an airlock door with a wheel and a window, and two roof vent pipes, sized for ${v.n} people (plan and 3D).`);
}
function cage(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline(); const dh = (H * 0.86) / v.decks;
  for (const x of [X0, X1]) for (const y of [YF, -1]) a.cyl(x + (x === X0 ? 20 : -20), y === YF ? YF + 20 : -20, Z0, Z0 + H * 0.94, 20, 8);
  for (let d = 0; d < v.decks; d++) { const z = Z0 + 40 + d * dh; a.box(X0, YF, z, X1, 0, z + 24); for (const f of [0.0, 1.0]) a.box(X0, Y(f) === YF ? YF : -24, z + 24, X1, Y(f) === YF ? YF + 24 : 0, z + dh * 0.5); if (d < v.decks) { a.box(X0, YF, z + dh - 24, X1, YF + 24, z + dh); a.box(X0, -24, z + dh - 24, X1, 0, z + dh); } for (let k = 1; k < 5; k++) { a.box(X0 + (W * k) / 5 - 6, YF, z + 24, X0 + (W * k) / 5 + 6, YF + 12, z + dh - 24); } }
  for (const x of [X0, X1]) a.box(x - 10, YF, Z0, x + 10, 0, Z0 + 24);
  a.box(X0, YF, Z0 + H * 0.92, X1, 0, Z0 + H * 0.95);
  beam(a, [X0 + 30, YF + 30, Z0 + H * 0.95], [cx, a.cy, Z0 + H], 14, 6); beam(a, [X1 - 30, YF + 30, Z0 + H * 0.95], [cx, a.cy, Z0 + H], 14, 6); beam(a, [X0 + 30, -30, Z0 + H * 0.95], [cx, a.cy, Z0 + H], 14, 6); beam(a, [X1 - 30, -30, Z0 + H * 0.95], [cx, a.cy, Z0 + H], 14, 6);
  for (const x of [X0 - 6, X1 - 6]) a.box(x, a.cy - 120, Z0 + H * 0.2, x + 12, a.cy + 120, Z0 + H * 0.4);
  a.line(X0, a.cy, X1, a.cy, 'EQUIP-DETAIL'); a.rect(X0, YF, X1, 0, 'EQUIP-DETAIL');
  a.log(`Added the corner posts, ${v.decks} deck floors with mesh side guards and gates, the roof canopy with the four-leg suspension to the rope, and the guide shoes (plan and 3D).`);
}
function skip(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  profX(a, [[Y(0.0), Z(0.18)], [Y(1.0), Z(0.18)], [Y(1.0), Z(0.62)], [Y(0.0), Z(0.62)]], X(0.04), X(0.96));
  profX(a, [[Y(0.1), Z(0.0)], [Y(0.9), Z(0.0)], [Y(1.0), Z(0.18)], [Y(0.0), Z(0.18)]], X(0.04), X(0.96));
  a.box(X(0.02), Y(0.0), Z(0.62), X(0.98), Y(1.0), Z(0.65));
  for (const x of [X(0.04), X(0.96)]) { beam(a, [x, Y(0.5), Z(0.62)], [cx, Y(0.5), Z(0.97)], 14, 6); a.cyl(x, Y(0.0), Z0, Z(0.62), 18, 6); a.cyl(x, Y(1.0), Z0, Z(0.62), 18, 6); }
  a.cyl(cx, Y(0.5), Z(0.95), Z(0.99), 40, 10);
  for (const x of [X(0.0), X(1.0)]) a.box(x - (x < cx ? 0 : 20), Y(0.1), Z(0.5), x + (x < cx ? 20 : 0), Y(0.9), Z(0.6));
  a.line(X(0.04), Y(0.1), X(0.96), Y(0.1), 'EQUIP-DETAIL');
  a.log('Added the rectangular body with a sloped bottom, the top rim, the two side bails with the rope shackle and the guide shoes (plan and 3D).');
}
function grizzly(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  for (const x of [X0 + 20, X1 - 20]) for (const y of [YF + 20, -20]) a.cyl(x, y, Z0, Z0 + H * 0.7, 22, 8);
  a.box(X0, YF, Z0 + H * 0.7, X0 + 40, 0, Z0 + H); a.box(X1 - 40, YF, Z0 + H * 0.7, X1, 0, Z0 + H);
  const n = Math.round(W / 120); for (let i = 1; i < n; i++) { const x = X0 + (W * i) / n; a.box(x - 25, YF, Z0 + H * 0.75, x + 25, 0, Z0 + H * 0.95); a.line(x, YF, x, 0, 'EQUIP-DETAIL'); }
  a.box(X0, YF, Z0 + H * 0.7, X1, YF + 40, Z0 + H); a.box(X0, -40, Z0 + H * 0.7, X1, 0, Z0 + H);
  for (const x of [X0, X1]) a.box(x - 15, YF, Z0 + H * 0.4, x + 15, 0, Z0 + H * 0.7);
  a.log(`Added the corner posts, the perimeter frame and ${n - 1} parallel bars forming the ore-pass grizzly (plan and 3D).`);
}
function orePassChute(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  profY(a, [[X0, Z(1.0)], [X1, Z(1.0)], [cx + W * 0.2, Z(0.45)], [cx - W * 0.2, Z(0.45)]], Y(0.9), Y(0.1));
  profX(a, [[Y(0.9), Z(1.0)], [Y(0.1), Z(1.0)], [Y(0.1), Z(0.6)], [Y(0.9), Z(0.6)]], X0, X0 + 40); profX(a, [[Y(0.9), Z(1.0)], [Y(0.1), Z(1.0)], [Y(0.1), Z(0.6)], [Y(0.9), Z(0.6)]], X1 - 40, X1);
  a.box(cx - W * 0.2, Y(0.9), Z(0.28), cx + W * 0.2, Y(0.1), Z(0.45));
  a.box(cx - W * 0.28, Y(0.8), Z(0.04), cx + W * 0.28, Y(0.2), Z(0.3)); a.box(cx - W * 0.32, Y(0.85), Z(0.0), cx + W * 0.32, Y(0.15), Z(0.06));
  hyd(a, [cx - W * 0.3, Y(0.5), Z(0.5)], [cx - W * 0.1, Y(0.5), Z(0.34)], H * 0.04); hyd(a, [cx + W * 0.3, Y(0.5), Z(0.5)], [cx + W * 0.1, Y(0.5), Z(0.34)], H * 0.04);
  a.rect(cx - W * 0.28, Y(0.8), cx + W * 0.28, Y(0.2), 'EQUIP-DETAIL');
  a.log('Added the hopper with sloped throat and side plates, the steel framework, a sector gate with two hydraulic cylinders and the discharge lip (plan and 3D).');
}
function archSet(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  const n = v.ribs, rr = W * 0.48, zc = Z0 + H - rr;
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? a.cy : YF + 30 + ((D - 60) * i) / (n - 1);
    for (const s of [-1, 1]) a.box(cx + s * rr - 40 - (s > 0 ? -0 : 0), y - 40, Z0, cx + s * rr + 40, y + 40, zc);
    const seg = 10; for (let k = 0; k < seg; k++) { const a0 = (Math.PI * k) / seg, a1 = (Math.PI * (k + 1)) / seg; beam(a, [cx + Math.cos(a0) * rr, y, zc + Math.sin(a0) * rr], [cx + Math.cos(a1) * rr, y, zc + Math.sin(a1) * rr], 55, 6); }
    a.box(cx - rr - 120, y - 60, Z0, cx - rr + 80, y + 60, Z0 + 30); a.box(cx + rr - 80, y - 60, Z0, cx + rr + 120, y + 60, Z0 + 30);
  }
  for (let k = 1; k < 10; k++) { const a0 = (Math.PI * k) / 10; a.box(cx + Math.cos(a0) * rr - 14, YF + 10, zc + Math.sin(a0) * rr - 14, cx + Math.cos(a0) * rr + 14, -10, zc + Math.sin(a0) * rr + 14); }
  a.line(cx - rr, YF, cx - rr, 0, 'EQUIP-DETAIL'); a.line(cx + rr, YF, cx + rr, 0, 'EQUIP-DETAIL');
  a.log(`Added ${n} arch ribs with straight legs and footplates, joined along the drift by spreader bars across the crown (plan and 3D).`);
}
function roofProp(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a;
  a.outline(); a.box(cx - W * 0.5, cy - D * 0.5, Z0, cx + W * 0.5, cy + D * 0.5, Z0 + H * 0.03);
  a.cyl(cx, cy, Z0 + H * 0.03, Z0 + H * 0.5, W * 0.26, 16); a.cyl(cx, cy, Z0 + H * 0.5, Z0 + H * 0.95, W * 0.17, 14);
  a.cyl(cx, cy, Z0 + H * 0.5, Z0 + H * 0.54, W * 0.3, 16); a.cyl(cx + W * 0.26, cy, Z0 + H * 0.2, Z0 + H * 0.28, W * 0.06, 8);
  a.box(cx - W * 0.5, cy - D * 0.5, Z0 + H * 0.95, cx + W * 0.5, cy + D * 0.5, Z0 + H);
  a.circ(cx, cy, W * 0.26, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.17, 'EQUIP-DETAIL');
  a.log('Added the base plate, the outer barrel, the inner ram with its collar, the valve stub and the head plate (plan and 3D).');
}
function longwallSupport(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  for (const x of [X(0.06), X(0.72)]) profX(a, [[Y(0.1), Z(0.0)], [Y(0.9), Z(0.0)], [Y(0.9), Z(0.14)], [Y(0.2), Z(0.14)]], x, x + W * 0.22);
  a.box(X(0.06), Y(0.5), Z(0.0), X(0.94), Y(0.6), Z(0.1));
  for (const x of [X(0.16), X(0.84)]) for (const y of [Y(0.4), Y(0.62)]) a.cyl(x, y, Z(0.14), Z(0.82), W * 0.05, 10);
  profX(a, [[Y(0.0), Z(0.82)], [Y(0.7), Z(0.9)], [Y(0.7), Z(1.0)], [Y(0.0), Z(0.94)]], X(0.04), X(0.96));
  profX(a, [[Y(0.6), Z(0.9)], [Y(0.98), Z(0.1)], [Y(1.0), Z(0.1)], [Y(0.68), Z(1.0)]], X(0.06), X(0.94));
  hyd(a, [cx, Y(0.2), Z(0.14)], [cx, Y(0.1), Z(0.84)], W * 0.04);
  a.rect(X(0.04), Y(0.0), X(0.96), Y(0.7), 'EQUIP-DETAIL'); a.line(X(0.04), Y(0.7), X(0.96), Y(0.7), 'EQUIP-DETAIL');
  a.log('Added the two base skids, four hydraulic legs, the canopy with a front visor and the sloped rear shield for a powered roof support (plan and 3D).');
}
function batteryLoco(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline(); const r = H * 0.14;
  for (const y of [Y(0.2), Y(0.8)]) for (const x of [X(0.1), X(0.9)]) { a.xcyl(x - 20, x + 20, y, Z0 + r, r, 18); }
  a.xcyl(X(0.1), X(0.9), Y(0.2), Z0 + r, 14, 8); a.xcyl(X(0.1), X(0.9), Y(0.8), Z0 + r, 14, 8);
  a.box(X(0.14), Y(0.05), Z(0.22), X(0.86), Y(0.95), Z(0.4));                   // chassis and battery box
  a.box(X(0.2), Y(0.5), Z(0.4), X(0.8), Y(0.95), Z(0.66)); a.box(X(0.25), Y(0.1), Z(0.4), X(0.75), Y(0.38), Z(0.55));
  cabin(a, X(0.22), X(0.78), Y(0.36), Y(0.52), Z(0.4), Z(0.92), H * 0.01);
  a.box(X(0.1), Y(0.0), Z(0.3), X(0.9), Y(0.05), Z(0.36)); a.box(X(0.1), Y(0.95), Z(0.3), X(0.9), Y(1.0), Z(0.36));
  lamps(a, [X(0.25), X(0.75)], Y(0.0), Z(0.38), W * 0.12);
  a.line(X(0.1), YF, X(0.1), 0, 'EQUIP-DETAIL'); a.line(X(0.9), YF, X(0.9), 0, 'EQUIP-DETAIL');
  a.log('Added the four rail wheels with axles, the chassis with battery box, a rear hood, the canopy cab with a windscreen, bumpers and headlamps (plan and 3D).');
}
function oreCar(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline(); const r = H * 0.14;
  for (const y of [Y(0.2), Y(0.8)]) for (const x of [X(0.14), X(0.86)]) a.xcyl(x - 20, x + 20, y, Z0 + r, r, 18);
  a.box(X(0.1), Y(0.0), Z(0.22), X(0.9), Y(1.0), Z(0.3));
  profX(a, [[Y(0.02), Z(0.7)], [Y(0.1), Z(0.3)], [Y(0.9), Z(0.3)], [Y(0.98), Z(0.7)]], X(0.04), X(0.12)); profX(a, [[Y(0.02), Z(0.7)], [Y(0.1), Z(0.3)], [Y(0.9), Z(0.3)], [Y(0.98), Z(0.7)]], X(0.88), X(0.96));
  a.box(X(0.04), Y(0.0), Z(0.3), X(0.96), Y(0.03), Z(0.7)); a.box(X(0.04), Y(0.97), Z(0.3), X(0.96), Y(1.0), Z(0.7)); a.box(X(0.12), Y(0.1), Z(0.3), X(0.88), Y(0.9), Z(0.34));
  for (const f of [0.3, 0.5, 0.7]) a.box(X(0.03), Y(f) - 10, Z(0.7), X(0.97), Y(f) + 10, Z(0.74));
  a.box(cx - 20, Y(0.0) - 20, Z(0.2), cx + 20, Y(0.0), Z(0.26)); a.box(cx - 20, 0, Z(0.2), cx + 20, 20, Z(0.26));
  a.log(`Added the four rail wheels, the underframe, the tub with sloped ends and top rim ribs and the couplers, ${v.m3} m3 (plan and 3D).`);
}
function stopping(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.05);
  for (const x of [X0 + 25, X1 - 25]) a.cyl(x, a.cy, Z0, Z0 + H, 25, 8);
  a.box(X0, a.cy - 20, Z0 + H * 0.94, X1, a.cy + 20, Z0 + H);
  a.box(X0 + 40, a.cy - 20, Z0 + H * 0.05, cx - W * 0.02, a.cy + 20, Z0 + H * 0.94);
  a.box(cx + W * 0.02, a.cy - 20, Z0 + H * 0.35, X1 - 40, a.cy + 20, Z0 + H * 0.94); a.box(cx + W * 0.02, a.cy - 20, Z0 + H * 0.05, X1 - 40, a.cy + 20, Z0 + H * 0.35);
  a.frame(cx + W * 0.05, Z0 + H * 0.38, X1 - 70, Z0 + H * 0.9, a.cy - 26, a.cy + 26, 40);
  for (let z = Z0 + H * 0.15; z < Z0 + H * 0.9; z += H * 0.25) a.box(X1 - 120, a.cy - 34, z, X1 - 90, a.cy - 20, z + 60);
  a.arc(X1 - 40, a.cy, (X1 - cx) * 0.7, 180, 270); a.line(X0, a.cy, X1, a.cy, 'EQUIP-DETAIL');
  a.log('Added the base sill, the two end posts, the header beam, the sheet panels with a framed door with hinges and the door swing (plan and 3D).');
}

const UNDER = [
  fam({ cat: 'mining/underground', title: 'Generic load-haul-dump machine',
    desc: (v) => `Underground load-haul-dump loader, ${v.bk} m3 bucket: four tyres, front and rear frames, boom arms with tilt cylinders, a wide toothed bucket, rear engine hood and an operator canopy.`,
    vs: [[1, 48, 200, 60], [2, 60, 250, 68], [3.5, 80, 320, 78], [5, 95, 360, 84], [8, 120, 420, 95]].map(([bk, w, d, h]) => [`bucket ${bk} m3`, w, d, h, 0, { bk }]), build: lhd }),
  fam({ cat: 'mining/underground', title: 'Generic underground articulated truck',
    desc: (v) => `Underground haul truck, ${v.t} ton: six tyres on three axles, chassis with hood and left cab, a tipping body with side walls and hoist cylinders.`,
    vs: [[20, 100, 330, 95], [30, 110, 370, 100], [40, 120, 400, 105], [50, 132, 430, 112]].map(([t, w, d, h]) => [`${t} ton`, w, d, h, 0, { t }]), build: ugTruck }),
  fam({ cat: 'mining/underground', title: 'Generic roof bolter rig',
    desc: (v) => `Rubber-tyred roof bolter with ${v.booms === 1 ? 'one boom' : 'two booms'}: chassis with four tyres, hood, a four-post canopy and feed rails with drill steels reaching the roof.`,
    vs: [[1, 'single boom, low seam', 60, 220, 62], [1, 'single boom, standard', 66, 240, 84], [2, 'twin boom, low seam', 76, 260, 66], [2, 'twin boom, standard', 90, 290, 96], [2, 'twin boom, high roof', 100, 300, 120]].map(([booms, l, w, d, h]) => [l, w, d, h, 0, { booms }]), build: roofBolter }),
  fam({ cat: 'mining/underground', title: 'Generic drill jumbo',
    desc: (v) => `Rubber-tyred drill jumbo with ${v.booms} ${v.booms === 1 ? 'boom' : 'booms'}: carrier with four tyres, cab and canopy and boom arms at different heights, each with a feed rail and drifter.`,
    vs: [[1, 80, 330, 80], [2, 100, 420, 95], [3, 120, 470, 105]].map(([booms, w, d, h]) => [`${['', 'one', 'two', 'three'][booms]} boom${booms > 1 ? 's' : ''}`, w, d, h, 0, { booms }]), build: jumbo }),
  fam({ cat: 'mining/underground', title: 'Generic underground personnel carrier',
    desc: (v) => `Underground personnel carrier for ${v.seats} people: four tyres, chassis with front hood, bench rows, an open canopy on posts and headlamps.`,
    vs: [[4, 60, 170, 65], [8, 64, 220, 70], [12, 70, 290, 75], [16, 76, 370, 80]].map(([seats, w, d, h]) => [`${seats} seats`, w, d, h, 0, { seats }]), build: personnelCarrier }),
  fam({ cat: 'mining/underground', title: 'Generic explosives charging vehicle',
    desc: (v) => `Underground explosives charging vehicle, ${v.cls}: four tyres, chassis with cab, a pressure vessel and hose reel and a scissor lift with a railed basket.`,
    vs: [['compact', 72, 230, 100], [' standard'.trim(), 84, 280, 112], ['high lift', 90, 320, 135]].map(([cls, w, d, h]) => [cls, w, d, h, 0, { cls }]), build: chargeVehicle }),
  fam({ cat: 'mining/underground', title: 'Generic shotcrete spraying rig',
    desc: (v) => `Shotcrete spraying rig, ${v.m3} m3 drum: four tyres, chassis with cab, a ribbed mixer drum and a folding spray boom with a nozzle.`,
    vs: [[3, 80, 280, 95], [5, 92, 330, 105], [7, 100, 370, 115]].map(([m3, w, d, h]) => [`${m3} m3 drum`, w, d, h, 0, { m3 }]), build: shotcreteRig }),
  fam({ cat: 'mining/underground', title: 'Generic ring drill production rig',
    desc: (v) => `Production ring drill rig for upward holes, ${v.cls}: four tyres, chassis, operator canopy and a rotating boom carrying a long feed.`,
    vs: [['compact', 70, 250, 90], ['standard', 84, 300, 105], ['large', 96, 350, 120]].map(([cls, w, d, h]) => [cls, w, d, h, 0, { cls }]), build: ringDrill }),
  fam({ cat: 'mining/underground', title: 'Generic mine axial fan',
    desc: (v) => `Axial mine ventilation fan, ${v.dia} in diameter: cylindrical casing with inlet and outlet flanges, an eight-blade rotor and hub, two saddle supports on skids and a side motor box.`,
    vs: [24, 30, 36, 48, 60, 72].map((dia) => [`${dia} in casing`, dia * 1.6 + 20, dia * 1.5 + 20, dia * 1.2 + 14, 0, { dia }]), build: axialFan }),
  fam({ cat: 'mining/underground', title: 'Generic mine ventilation duct spool',
    desc: (v) => `Rigid ventilation duct spool, ${v.dia} in diameter and 10 ft long: flanged ends, a middle stiffening band and two hanger straps with rods to a ceiling bar.`,
    vs: [24, 30, 36, 48, 60].map((dia) => [`${dia} in diameter`, dia * 1.2 + 6, 120, dia + 30, 0, { dia, hang: true }]), build: ductSpool }),
  fam({ cat: 'mining/underground', title: 'Generic underground refuge chamber',
    desc: (v) => `Steel refuge chamber for ${v.n} people: a skid base, a round hull with stiffening rings, an airlock door with a wheel and a window and two roof vent pipes.`,
    vs: [[8, 78, 144, 90], [12, 84, 180, 96], [16, 90, 216, 100], [24, 96, 276, 106]].map(([n, w, d, h]) => [`${n} person`, w, d, h, 0, { n }]), build: refuge }),
  fam({ cat: 'mining/underground', title: 'Generic shaft conveyance cage',
    desc: (v) => `Shaft cage with ${v.decks} ${v.decks === 1 ? 'deck' : 'decks'}: corner posts, deck floors with mesh guards and gates, a roof canopy with four-leg rope suspension and guide shoes.`,
    vs: [[1, 80, 120, 110], [2, 80, 120, 200], [3, 80, 120, 290]].map(([decks, w, d, h]) => [`${decks} deck${decks > 1 ? 's' : ''}`, w, d, h, 0, { decks }]), build: cage }),
  fam({ cat: 'mining/underground', title: 'Generic shaft skip',
    desc: (v) => `Shaft skip, ${v.t} ton: a rectangular body with a sloped bottom, a top rim, two side bails meeting at a rope shackle and guide shoes.`,
    vs: [[5, 50, 70, 120], [10, 60, 90, 150], [15, 70, 100, 180]].map(([t, w, d, h]) => [`${t} ton`, w, d, h, 0, { t }]), build: skip }),
  fam({ cat: 'mining/underground', title: 'Generic ore pass loading chute',
    desc: (v) => `Ore pass loading chute, ${v.cls}: a hopper with a sloped throat and side plates, a steel framework, a sector gate with two hydraulic cylinders and a discharge lip.`,
    vs: [['small', 72, 72, 96], ['medium', 96, 96, 120], ['large', 132, 108, 150]].map(([cls, w, d, h]) => [cls, w, d, h, 0, { cls }]), build: orePassChute }),
  fam({ cat: 'mining/underground', title: 'Generic steel arch support set',
    desc: (v) => `Steel arch ground support, ${v.ft} ft span: ${v.ribs} arch ribs with straight legs and footplates joined by crown spreader bars.`,
    vs: [[10, 3], [12, 3], [14, 4], [16, 4], [18, 5]].map(([ft, ribs]) => [`${ft} ft span, ${ribs} ribs`, ft * 12 + 20, 40 * (ribs - 1) + 10, ft * 6 + 50, 0, { ft, ribs }]), build: archSet }),
  fam({ cat: 'mining/underground', title: 'Generic hydraulic mine roof prop',
    desc: (v) => `Hydraulic roof prop, ${v.ft} ft extended: a base plate, an outer barrel with a collar, an inner ram, a valve stub and a head plate.`,
    vs: [[4, 10], [6, 11], [8, 12]].map(([ft, w]) => [`${ft} ft extended`, w, w, ft * 12, 0, { ft }]), build: roofProp }),
  fam({ cat: 'mining/underground', title: 'Generic longwall powered roof support',
    desc: (v) => `Longwall powered roof support, ${v.cls}: two base skids, four hydraulic legs, a canopy with a front visor and a sloped rear shield.`,
    vs: [['1.75 m seam', 68, 150, 70], ['2.5 m seam', 68, 170, 98], ['3.5 m seam', 72, 200, 138]].map(([cls, w, d, h]) => [cls, w, d, h, 0, { cls }]), build: longwallSupport }),
  fam({ cat: 'mining/underground', title: 'Generic mine battery locomotive',
    desc: (v) => `Battery rail locomotive, ${v.t} ton: four rail wheels with axles, a chassis and battery box, a canopy cab with a windscreen, bumpers and headlamps.`,
    vs: [[4, 40, 120, 60], [8, 48, 150, 66], [15, 56, 190, 72]].map(([t, w, d, h]) => [`${t} ton`, w, d, h, 0, { t }]), build: batteryLoco }),
  fam({ cat: 'mining/underground', title: 'Generic mine ore car',
    desc: (v) => `Rail ore car, ${v.m3} m3: four rail wheels, an underframe, a tub with sloped ends, rim ribs and couplers.`,
    vs: [[1.5, 36, 90, 46], [3, 44, 120, 54], [6, 52, 160, 62]].map(([m3, w, d, h]) => [`${m3} m3`, w, d, h, 0, { m3 }]), build: oreCar }),
];

// ---------------------------------------------------------------- PROCESSING ----------------------------------------------------------
function skidBase(a, h = 0.08) { const { X0, X1, YF, Z0, H } = a; a.box(X0, YF, Z0, X1, 0, Z0 + H * h); a.rect(X0, YF, X1, 0, 'EQUIP-DETAIL'); }
function motor(a, x, y, z, len, r, ax = 'y') { if (ax === 'y') { a.ycyl(y, y + len, x, z, r, 14); a.box(x - r * 0.9, y + len * 0.1, z - r * 1.3, x + r * 0.9, y + len * 0.9, z - r * 0.5); a.cyl(x, y + len * 0.5, z + r, z + r * 1.3, r * 0.3, 6); } else { a.xcyl(x, x + len, y, z, r, 14); a.box(x + len * 0.1, y - r * 0.9, z - r * 1.3, x + len * 0.9, y + r * 0.9, z - r * 0.5); } }
function jawCrusher(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline(); skidBase(a, 0.07);
  a.box(X(0.14), Y(0.12), Z(0.07), X(0.86), Y(0.88), Z(0.55));                                  // frame
  profY(a, [[X(0.06), Z(1.0)], [X(0.94), Z(1.0)], [X(0.8), Z(0.55)], [X(0.2), Z(0.55)]], Y(0.15), Y(0.85));  // feed hopper
  a.box(X(0.06), Y(0.15), Z(0.95), X(0.94), Y(0.17), Z(1.0)); a.box(X(0.06), Y(0.83), Z(0.95), X(0.94), Y(0.85), Z(1.0));
  const fr_ = H * 0.18; for (const x of [X(0.04), X(0.96)]) { a.xcyl(x - 25, x + 25, Y(0.5), Z(0.4), fr_, 22); a.xcyl(x - 40, x + 40, Y(0.5), Z(0.4), fr_ * 0.3, 10); }
  a.xcyl(X(0.04), X(0.96), Y(0.5), Z(0.4), fr_ * 0.12, 10);
  motor(a, X(0.7), Y(0.9), Z(0.3), D * 0.1, H * 0.1, 'y'); a.box(X(0.9), Y(0.6), Z(0.28), X(1.0), Y(0.8), Z(0.55));
  a.box(X(0.35), Y(0.4), Z(0.0), X(0.65), Y(0.6), Z(0.08));
  a.rect(X(0.14), Y(0.12), X(0.86), Y(0.88), 'EQUIP-DETAIL'); a.circ(X(0.04), Y(0.5), H * 0.18, 'EQUIP-DETAIL');
  a.log('Added the skid, the box frame, the feed hopper with its lips, the two flywheels with the shaft, the motor with belt guard and the discharge opening (plan and 3D).');
}
function coneCrusher(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline(); skidBase(a, 0.06);
  a.cyl(cx, cy, Z(0.06), Z(0.3), W * 0.36, 28);                                                    // base shell
  a.cone(cx, cy, Z(0.3), Z(0.7), W * 0.34, W * 0.28, 28); a.cyl(cx, cy, Z(0.5), Z(0.54), W * 0.38, 28);   // main shell and adjusting ring
  a.cone(cx, cy, Z(0.7), Z(0.98), W * 0.4, W * 0.22, 28); a.cyl(cx, cy, Z(0.98), Z(1.0), W * 0.5, 28);   // bowl and hopper rim
  a.cone(cx, cy, Z(0.78), Z(0.92), W * 0.12, 0.1, 14);
  for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI * 2; a.cyl(cx + Math.cos(an) * W * 0.4, cy + Math.sin(an) * W * 0.4, Z(0.5), Z(0.58), 22, 6); }
  motor(a, cx, Y(0.1) + 0, Z(0.2), D * 0.18, H * 0.07, 'y'); a.box(cx + W * 0.34, cy - W * 0.08, Z(0.1), cx + W * 0.5, cy + W * 0.08, Z(0.28));
  a.circ(cx, cy, W * 0.36); a.circ(cx, cy, W * 0.5, 'EQUIP-DETAIL'); a.circ(cx, cy, W * 0.22, 'EQUIP-DETAIL');
  a.log('Added the skid, base shell, main shell with adjusting ring and lock bolts, the feed bowl with hopper rim and mantle, the motor and the side drive guard (plan and 3D).');
}
function gyratory(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  a.cyl(cx, cy, Z0, Z(0.25), W * 0.42, 28); a.cone(cx, cy, Z(0.25), Z(0.62), W * 0.42, W * 0.3, 28);
  a.cone(cx, cy, Z(0.62), Z(0.95), W * 0.36, W * 0.46, 28); a.cyl(cx, cy, Z(0.95), Z(1.0), W * 0.5, 28);
  for (const an of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) a.box(cx + Math.cos(an) * W * 0.25 - 20 + (Math.abs(Math.cos(an)) > 0.5 ? 0 : 0), cy + Math.sin(an) * W * 0.25 - 20, Z(0.82), cx + Math.cos(an) * W * 0.46 + 20, cy + Math.sin(an) * W * 0.46 + 20, Z(0.9));
  a.cone(cx, cy, Z(0.82), Z(0.97), W * 0.08, 0.1, 12);
  a.box(cx + W * 0.4, cy - W * 0.1, Z(0.05), cx + W * 0.5, cy + W * 0.1, Z(0.3));
  a.circ(cx, cy, W * 0.46); a.circ(cx, cy, W * 0.08, 'EQUIP-DETAIL'); a.line(cx - W * 0.46, cy, cx + W * 0.46, cy, 'EQUIP-DETAIL'); a.line(cx, cy - W * 0.46, cx, cy + W * 0.46, 'EQUIP-DETAIL');
  a.log('Added the lower shell, the tapered main shell, the upper shell with its top rim, a four-arm spider carrying the central cone and the side drive housing (plan and 3D).');
}
function impactCrusher(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline(); skidBase(a, 0.08);
  a.box(X(0.14), Y(0.2), Z(0.08), X(0.86), Y(0.85), Z(0.6));
  profY(a, [[X(0.1), Z(1.0)], [X(0.9), Z(1.0)], [X(0.8), Z(0.6)], [X(0.2), Z(0.6)]], Y(0.08), Y(0.5));
  a.xcyl(X(0.14), X(0.86), Y(0.55), Z(0.38), H * 0.17, 22); for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2; a.box(X(0.2), Y(0.55) - 30 + Math.cos(an) * H * 0.2, Z(0.38) + Math.sin(an) * H * 0.17 - 20, X(0.8), Y(0.55) + 30 + Math.cos(an) * H * 0.2, Z(0.38) + Math.sin(an) * H * 0.17 + 20); }
  for (const x of [X(0.04), X(0.96)]) { a.xcyl(x - 30, x + 30, Y(0.55), Z(0.38), H * 0.2, 22); }
  motor(a, X(0.3), Y(0.9), Z(0.25), D * 0.1, H * 0.1, 'y');
  a.rect(X(0.14), Y(0.2), X(0.86), Y(0.85), 'EQUIP-DETAIL'); a.circ(X(0.04), Y(0.55), H * 0.2, 'EQUIP-DETAIL');
  a.log('Added the skid, the housing, a sloped feed hopper, the horizontal rotor with its blow bars, flywheels at both ends and the motor (plan and 3D).');
}
function vibScreen(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  for (const x of [X(0.1), X(0.9)]) for (const f of [0.2, 0.8]) { a.cyl(x, Y(f), Z0, Z(0.25), W * 0.03, 8); a.cyl(x, Y(f), Z(0.22), Z(0.3), W * 0.05, 8); }
  const side = [[Y(0.0), Z(0.4)], [Y(1.0), Z(0.25)], [Y(1.0), Z(0.25 + 0.5 / v.decks)], [Y(0.0), Z(0.4 + 0.5 / v.decks)]];
  const hh = 0.45 + 0.1 * v.decks;
  for (const [xa, xb] of [[X(0.06), X(0.1)], [X(0.9), X(0.94)]]) profX(a, [[Y(0.0), Z(0.38)], [Y(1.0), Z(0.26)], [Y(1.0), Z(0.26 + hh * 0.7)], [Y(0.0), Z(0.38 + hh * 0.7)]], xa, xb);
  for (let d = 0; d < v.decks; d++) { const dz = (0.5 / v.decks) * d; profX(a, [[Y(0.1), Z(0.4 + dz * 0.7)], [Y(0.9), Z(0.28 + dz * 0.7)], [Y(0.9), Z(0.29 + dz * 0.7)], [Y(0.1), Z(0.41 + dz * 0.7)]], X(0.1), X(0.9)); a.line(X(0.1), Y(0.5), X(0.9), Y(0.5), 'EQUIP-DETAIL'); }
  a.box(X(0.04), Y(0.0), Z(0.38), X(0.96), Y(0.1), Z(0.45 + hh * 0.5)); a.box(X(0.2), Y(0.3), Z(0.33 + hh * 0.7) + 0, X(0.8), Y(0.6), Z(0.37 + hh * 0.7));
  motor(a, X(0.5), Y(0.4), Z(0.97) - H * 0.03, D * 0.2, H * 0.03, 'y');
  a.xcyl(X(0.04), X(0.96), Y(0.5), Z(0.33 + hh * 0.5), H * 0.03, 12);
  a.rect(X(0.06), Y(0.0), X(0.94), Y(1.0), 'EQUIP-DETAIL');
  a.log(`Added the four spring posts, the two side plates sloping down the screen, ${v.decks} deck frames, the feed box, the shaft with exciter and the motor on top (plan and 3D).`);
}
function beltConveyor(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a);
  a.outline(); const bw = v.belt * IN, hs = H - 700, zlo = Z0 + 350, zhi = Z0 + H - 450 + 0;
  const zy = (f) => zlo + (zhi - zlo) * f;
  for (const x of [cx - bw / 2 - 40, cx + bw / 2 + 40]) profX(a, [[Y(0.0), zy(0) - 150], [Y(1.0), zy(1) - 150], [Y(1.0), zy(1) + 120], [Y(0.0), zy(0) + 120]], x - 15, x + 15);
  const n = Math.max(2, Math.round(D / 1800)); const idlers = Math.round(D / 1200);
  for (let i = 0; i <= idlers; i++) { const f = i / idlers, z = zy(f); beam(a, [cx - bw / 2, Y(f), z + 40], [cx, Y(f), z + 0], 40, 8); beam(a, [cx, Y(f), z], [cx + bw / 2, Y(f), z + 40], 40, 8); }
  profX(a, [[Y(0.0), zy(0) + 120], [Y(1.0), zy(1) + 120], [Y(1.0), zy(1) + 150], [Y(0.0), zy(0) + 150]], cx - bw / 2, cx + bw / 2);   // loaded belt
  profX(a, [[Y(0.0), zy(0) - 130], [Y(1.0), zy(1) - 130], [Y(1.0), zy(1) - 150], [Y(0.0), zy(0) - 150]], cx - bw / 2, cx + bw / 2);    // return belt
  a.xcyl(cx - bw / 2 - 60, cx + bw / 2 + 60, Y(0.0), zy(0), 150, 18); a.xcyl(cx - bw / 2 - 60, cx + bw / 2 + 60, Y(1.0), zy(1), 220, 18);
  for (let i = 0; i <= n; i++) { const f = i / n, z = zy(f) - 150; a.cyl(cx - bw / 2 - 40, Y(f), Z0, z, 40, 6); a.cyl(cx + bw / 2 + 40, Y(f), Z0, z, 40, 6); if (i < n) beam(a, [cx - bw / 2 - 40, Y(f), Z0 + (z - Z0) * 0.5], [cx + bw / 2 + 40, Y(f), Z0 + (z - Z0) * 0.5], 20, 5); }
  a.box(cx + bw / 2 + 60, Y(1.0) - 380, zy(1) - 250, cx + bw / 2 + 700, Y(1.0) + 0, zy(1) + 250);          // head-end motor and gearbox
  a.box(cx - bw / 2 - 600, Y(0.0), zy(0) + 100, cx - bw / 2 - 100, Y(0.0) + 20, zy(0) + 200);
  { const rx = cx + bw / 2 + 120, np = Math.max(3, Math.round(D / 900)); for (let i = 0; i <= np; i++) { const f = 0.03 + 0.94 * (i / np); a.cyl(rx, Y(f), zy(f) - 150, zy(f) + 900, 12, 6); } beam(a, [rx, Y(0.03), zy(0.03) + 900], [rx, Y(0.97), zy(0.97) + 900], 12, 6); beam(a, [rx, Y(0.03), zy(0.03) + 450], [rx, Y(0.97), zy(0.97) + 450], 9, 6); }
  a.rect(cx - bw / 2 - 40, YF, cx + bw / 2 + 40, 0, 'EQUIP-DETAIL'); a.line(cx - bw / 2, YF, cx - bw / 2, 0, 'EQUIP-DETAIL'); a.line(cx + bw / 2, YF, cx + bw / 2, 0, 'EQUIP-DETAIL');
  a.log(`Added the two stringer plates, troughed idler stations, the loaded and return belt, head and tail pulleys, a motor and gearbox, support legs with cross ties and a one-side handrail for a ${v.belt} in belt (plan and 3D).`);
}
function stacker(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  for (const x of [X(0.1), X(0.9)]) { a.xcyl(x - 40, x + 40, Y(0.9), Z0 + H * 0.06, H * 0.06, 14); a.xcyl(x - 40, x + 40, Y(0.78), Z0 + H * 0.06, H * 0.06, 14); }
  a.box(X(0.12), Y(0.74), Z(0.1), X(0.88), Y(0.95), Z(0.2));
  a.cyl(cx, Y(0.85), Z(0.2), Z(0.5), W * 0.05, 10);
  beam(a, [cx, Y(0.85), Z(0.32)], [cx, Y(0.02), Z(0.92)], H * 0.025, 8); beam(a, [cx, Y(0.85), Z(0.32)], [cx, Y(0.02), Z(0.99)], H * 0.025, 8);
  for (const s of [-1, 1]) { beam(a, [cx + s * W * 0.18, Y(0.85), Z(0.32)], [cx + s * W * 0.18, Y(0.02), Z(0.95)], H * 0.012, 6); }
  for (let i = 1; i < 8; i++) { const f = 0.85 - 0.83 * i / 8; beam(a, [cx - W * 0.18, Y(1 - f), Z(0.32 + 0.63 * i / 8)], [cx + W * 0.18, Y(1 - f), Z(0.32 + 0.63 * i / 8)], H * 0.008, 5); }
  a.box(cx - W * 0.2, Y(0.0), Z(0.9), cx + W * 0.2, Y(0.05), Z(1.0));
  a.box(X(0.2), Y(0.9), Z(0.2), X(0.8), Y(1.0), Z(0.45)); beam(a, [cx, Y(0.9), Z(0.45)], [cx, Y(0.98), Z(0.7)], H * 0.02, 6);
  a.line(cx, Y(0.85), cx, Y(0.0), 'EQUIP-DETAIL'); a.circ(cx, Y(0.85), W * 0.05, 'EQUIP-DETAIL');
  a.log('Added the wheeled bogie, the pivot column, the inclined stacking boom with truss rails and cross frames, the discharge head and the rear feed hopper (plan and 3D).');
}
function apronFeeder(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X(0.06), Y(0.02), Z(0.0), X(0.94), Y(0.98), Z(0.4));
  for (let i = 0; i < 12; i++) a.box(X(0.1), Y(0.04 + i * 0.075), Z(0.4), X(0.9), Y(0.04 + i * 0.075 + 0.06), Z(0.44));
  for (const x of [X(0.06), X(0.94)]) profX(a, [[Y(0.0), Z(0.4)], [Y(0.0), Z(1.0)], [Y(0.8), Z(1.0)], [Y(0.8), Z(0.4)]], x - (x < cx ? 0 : 30), x + (x < cx ? 30 : 0));
  profX(a, [[Y(0.8), Z(0.4)], [Y(0.8), Z(1.0)], [Y(0.84), Z(1.0)], [Y(0.84), Z(0.4)]], X(0.06), X(0.94));
  a.xcyl(X(0.06), X(0.94), Y(0.02), Z(0.2), H * 0.2, 18); a.xcyl(X(0.06), X(0.94), Y(0.98), Z(0.2), H * 0.2, 18);
  motor(a, X(0.5), Y(0.98), Z(0.2), D * 0.01, H * 0.03, 'y');
  a.rect(X(0.06), Y(0.0), X(0.94), Y(0.84), 'EQUIP-DETAIL');
  a.log('Added the base frame, the chain apron of overlapping pans, the side skirt plates, the rear hopper wall, the two end sprockets and the drive (plan and 3D).');
}
function vibFeeder(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  for (const x of [X(0.1), X(0.9)]) for (const f of [0.2, 0.8]) { a.cyl(x, Y(f), Z0, Z(0.25), W * 0.03, 8); }
  profX(a, [[Y(0.0), Z(0.38)], [Y(1.0), Z(0.3)], [Y(1.0), Z(0.34)], [Y(0.0), Z(0.42)]], X(0.1), X(0.9));
  for (const [xa, xb] of [[X(0.08), X(0.12)], [X(0.88), X(0.92)]]) profX(a, [[Y(0.0), Z(0.38)], [Y(1.0), Z(0.3)], [Y(1.0), Z(0.6)], [Y(0.0), Z(0.68)]], xa, xb);
  a.box(X(0.1), Y(0.0), Z(0.38), X(0.9), Y(0.02), Z(0.68));
  for (const x of [X(0.1), X(0.9)]) beam(a, [x, Y(0.0), Z(0.68)], [x, Y(0.1), Z(1.0)], 25, 6);
  a.box(X(0.06), Y(0.0), Z(0.96), X(0.94), Y(0.1), Z(1.0)); a.box(X(0.2), Y(0.3), Z(0.62), X(0.8), Y(0.6), Z(0.78));
  motor(a, X(0.2), Y(0.7), Z(0.5), D * 0.1, H * 0.06, 'y');
  a.rect(X(0.08), Y(0.0), X(0.92), Y(1.0), 'EQUIP-DETAIL');
  a.log('Added the four spring posts, the vibrating pan with side walls, the hopper throat with hanger rods, the exciter housing and the motor (plan and 3D).');
}
function mill(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const r = Math.min(W * 0.36, H * 0.36), zc = Z0 + H * 0.62;
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.06);
  a.ycyl(Y(0.15), Y(0.8), cx, zc, r, 30); for (const f of [0.15, 0.8]) { a.ycyl(Y(f) - 40, Y(f) + 40, cx, zc, r * 1.06, 30); }
  a.ycyl(Y(0.35), Y(0.4), cx, zc, r * 1.14, 30);
  a.cone(cx, Y(0.8) - 0, zc, zc, 1, 1, 6);
  a.ycyl(Y(0.05), Y(0.15), cx, zc, r * 0.45, 20); a.ycyl(Y(0.8), Y(0.95), cx, zc, r * 0.45, 20);
  for (const f of [0.05, 0.95]) { a.box(cx - r * 0.5, Y(f) - D * 0.04, Z0 + H * 0.06, cx + r * 0.5, Y(f) + D * 0.04, zc - r * 0.3); }
  a.ycyl(Y(0.8), Y(0.99), cx, zc, r * 0.7, 20);
  motor(a, cx + r * 1.0, Y(0.3), zc - r * 0.4, D * 0.18, r * 0.28, 'y'); a.box(cx + r * 0.65, Y(0.38), Z0 + H * 0.06, cx + r * 1.0, Y(0.5), zc - r * 0.7);
  a.rect(X0, YF, X1, 0, 'EQUIP-DETAIL'); a.line(X0, Y(0.38), X1, Y(0.38), 'EQUIP-DETAIL');
  a.log(`Added the base, the cylindrical ${v.kind === 'sag' ? 'semi-autogenous' : 'ball'} shell with end flanges and the ring gear, two trunnion bearings on pedestals, the feed spout, the discharge trommel and the side motor (plan and 3D).`);
}
function cyclone(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.04);
  const n = v.n, rr = n === 1 ? 0 : Math.min(W, D) * 0.28, cr = n === 1 ? W * 0.36 : Math.min(W, D) * (n === 2 ? 0.2 : 0.17);
  for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + 0.3, x = cx + Math.cos(an) * rr, y = a.cy + Math.sin(an) * rr;
    a.cyl(x, y, Z(0.55), Z(0.88), cr, 20); a.cone(x, y, Z(0.2), Z(0.55), cr * 0.2, cr, 20); a.cone(x, y, Z(0.88), Z(0.92), cr, cr * 0.5, 14); a.cyl(x, y, Z(0.92), Z(1.0), cr * 0.24, 10);
    a.cyl(x + cr * 0.6, y, Z(0.6), Z(0.8), cr * 0.25, 8); a.circ(x, y, cr);
    a.cyl(x, y, Z(0.1), Z(0.2), cr * 0.22, 10); a.cyl(x, y, Z(0.04), Z(0.1), cr * 0.34, 10); }
  if (n > 1) { a.cyl(cx, a.cy, Z(0.2), Z(0.6), 40, 8); for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + 0.3; beam(a, [cx, a.cy, Z(0.7)], [cx + Math.cos(an) * rr, a.cy + Math.sin(an) * rr, Z(0.7)], 28, 6); a.cyl(cx + Math.cos(an) * rr * 1.2, a.cy + Math.sin(an) * rr * 1.2, Z(0.04), Z(0.55), 20, 6); } a.ycyl(YF + 40, -40, cx, Z(0.04) + 20, 36, 8); }
  a.rect(X0, YF, X1, 0, 'EQUIP-DETAIL');
  a.log(`Added the base frame and ${n === 1 ? 'a single' : n} hydrocyclone${n > 1 ? 's' : ''} with a cylindrical head, a tangential feed inlet, a vortex-finder pipe, a conical body and an apex spigot${n > 1 ? ', with a feed manifold and support legs' : ''} (plan and 3D).`);
}
function thickener(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  const r = W * 0.5; a.cyl(cx, cy, Z0, Z(0.85), r, 40); a.cyl(cx, cy, Z(0.85), Z(0.9), r * 1.02, 40); a.cyl(cx, cy, Z(0.5), Z(0.85), r * 0.96, 4 + 36);
  a.box(X0, cy - 80, Z(0.9), X1, cy + 80, Z(0.95)); a.box(X0, cy - 140, Z(0.95), X1, cy - 120, Z(1.0)); a.box(X0, cy + 120, Z(0.95), X1, cy + 140, Z(1.0));
  a.cyl(cx, cy, Z(0.95), Z(1.0), r * 0.07, 14); a.box(cx - r * 0.08, cy - r * 0.08, Z(0.95), cx + r * 0.08, cy + r * 0.08, Z(0.99));
  a.cyl(cx, cy, Z(0.7), Z(0.9), r * 0.12, 14); a.cyl(cx, cy, Z(0.4), Z(0.9), 40, 8);
  for (const s of [-1, 1]) a.box(cx + s * r * 0.5 - 60, cy - 60, Z(0.9), cx + s * r * 0.5 + 60, cy + 60, Z(0.92));
  a.box(cx - r * 1.0, cy - 80, Z(0.5), cx - r * 0.96, cy + 80, Z(0.7)); a.cyl(cx + r * 0.2, cy + r * 0.8, Z(0.0), Z(0.04), r * 0.06, 8);
  a.circ(cx, cy, r * 0.12, 'EQUIP-DETAIL'); a.circ(cx, cy, r * 0.96, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the round tank wall with a rim launder, the full-diameter access bridge with its handrails, the centre drive head, the feedwell and the rake shaft, plus an underflow outlet (plan and 3D).');
}
function leachTank(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  const r = W * 0.5; a.cyl(cx, cy, Z0, Z(0.9), r, 36);
  for (const an of [0, 1.57, 3.14, 4.71]) a.box(cx + Math.cos(an) * r * 0.95 - 12, cy + Math.sin(an) * r * 0.95 - 12, Z(0.04), cx + Math.cos(an) * r * 0.95 + 12, cy + Math.sin(an) * r * 0.95 + 12, Z(0.9));
  a.cyl(cx, cy, Z(0.9), Z(0.93), r * 1.02, 36);
  a.box(X0, cy - 100, Z(0.93), X1, cy + 100, Z(0.97)); rail(a, X0, cy - 100, X1, cy - 100, Z(0.97), H * 0.04, 12, 6); rail(a, X0, cy + 100, X1, cy + 100, Z(0.97), H * 0.04, 12, 6);
  a.box(cx - 400, cy - 400, Z(0.97), cx + 400, cy + 400, Z(1.0)); a.cyl(cx, cy, Z(0.97), Z(1.0), 350, 14);
  a.cyl(cx, cy, Z(0.1), Z(0.93), 55, 10); for (const z of [Z(0.15), Z(0.55)]) a.box(cx - r * 0.3, cy - 20, z, cx + r * 0.3, cy + 20, z + 30);
  ladder(a, cx + r - 30, cy - 200, Z0, Z(0.9), 400, 14);
  a.circ(cx, cy, r); a.circ(cx, cy, 55, 'EQUIP-DETAIL'); a.line(X0, cy, X1, cy, 'EQUIP-DETAIL');
  a.log('Added the round tank with vertical baffles and a rim ring, the bridge with handrails, the agitator motor, the shaft with two impellers and a wall ladder (plan and 3D).');
}
function roundBin(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  const r = W * 0.46;
  for (const an of [0.78, 2.36, 3.93, 5.5]) { const x = cx + Math.cos(an) * r * 0.85, y = cy + Math.sin(an) * r * 0.85; a.cyl(x, y, Z0, Z(0.5), 45, 8); a.box(x - 120, y - 120, Z0, x + 120, y + 120, Z0 + 20); }
  for (const an of [0, 1.57, 3.14, 4.71]) beam(a, [cx + Math.cos(an) * r * 0.85, cy + Math.sin(an) * r * 0.85, Z(0.35)], [cx + Math.cos(an + 1.57) * r * 0.85, cy + Math.sin(an + 1.57) * r * 0.85, Z(0.2)], 20, 5);
  a.cone(cx, cy, Z(0.28), Z(0.55), r * 0.14, r, 28); a.cyl(cx, cy, Z(0.55), Z(0.92), r, 28); a.cone(cx, cy, Z(0.92), Z(0.97), r, r * 0.55, 20);
  a.cyl(cx, cy, Z(0.97), Z(1.0), r * 0.4, 14); a.cyl(cx, cy, Z(0.2), Z(0.28), r * 0.14, 12);
  ladder(a, cx + r - 30, cy - 200, Z(0.0), Z(0.92), 400, 12); a.cyl(cx - r * 0.7, cy, Z(0.92), Z(0.97), r * 0.12, 10);
  a.circ(cx, cy, r); a.circ(cx, cy, r * 0.14, 'EQUIP-DETAIL');
  a.log('Added the four support legs with bracing, the conical hopper with a discharge gate, the cylindrical bin wall, the shallow roof with a hatch and a side ladder (plan and 3D).');
}
function overband(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  for (const x of [X(0.04), X(0.96)]) for (const y of [Y(0.12), Y(0.88)]) a.cyl(x, y, Z0, Z(0.5), 30, 8);
  a.box(X(0.0), Y(0.04), Z(0.5), X(1.0), Y(0.96), Z(0.55));
  a.box(X(0.12), Y(0.16), Z(0.3), X(0.88), Y(0.84), Z(0.5));              // magnet
  a.xcyl(X(0.1), X(0.9), Y(0.16), Z(0.7), H * 0.1, 16); a.xcyl(X(0.1), X(0.9), Y(0.84), Z(0.7), H * 0.1, 16);
  a.box(X(0.12), Y(0.16), Z(0.8), X(0.88), Y(0.84), Z(0.84));
  a.box(X(0.12), Y(0.12), Z(0.55), X(0.88), Y(0.16), Z(0.8)); a.box(X(0.12), Y(0.84), Z(0.55), X(0.88), Y(0.88), Z(0.8));
  motor(a, X(0.5), Y(0.88), Z(0.9), D * 0.08, H * 0.05, 'y');
  a.rect(X(0.12), Y(0.16), X(0.88), Y(0.84), 'EQUIP-DETAIL');
  a.log(`Added four posts and a top frame, the suspended magnet body, the two end rollers carrying the cleaning belt, side plates and a belt motor, for ${v.belt} in belts (plan and 3D).`);
}
function drumMagnet(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const r = H * 0.28; a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.06);
  for (const x of [X(0.08), X(0.92)]) for (const y of [Y(0.15), Y(0.85)]) a.cyl(x, y, Z0 + H * 0.06, Z(0.6), 30, 8);
  a.xcyl(X(0.1), X(0.9), Y(0.5), Z(0.5), r, 28); a.xcyl(X(0.04), X(0.96), Y(0.5), Z(0.5), r * 0.2, 12);
  profY(a, [[X(0.1), Z(0.98)], [X(0.9), Z(0.98)], [X(0.8), Z(0.78)], [X(0.2), Z(0.78)]], Y(0.15), Y(0.5));
  profY(a, [[X(0.1), Z(0.3)], [X(0.9), Z(0.3)], [X(0.6), Z(0.08)], [X(0.4), Z(0.08)]], Y(0.5), Y(0.95)); a.box(X(0.05), Y(0.5), Z(0.1), X(0.95), Y(0.52), Z(0.35));
  motor(a, X(0.96) - 10, Y(0.2), Z(0.3), D * 0.1, H * 0.05, 'y');
  a.rect(X(0.1), Y(0.15), X(0.9), Y(0.95), 'EQUIP-DETAIL'); a.line(X(0.1), Y(0.5), X(0.9), Y(0.5), 'EQUIP-DETAIL');
  a.log('Added the base, four posts, the horizontal drum with axle, a feed hopper over the drum, a split discharge hopper below and a drive motor (plan and 3D).');
}
function flotation(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const n = v.cells, cw = D / n;
  for (let i = 0; i < n; i++) { const yc = -D + cw * (i + 0.5); a.box(X0, yc - cw * 0.5, Z(0.1), X1, yc + cw * 0.5, Z(0.78)); a.box(X0 + 30, yc - cw * 0.5 + 30, Z(0.78), X1 - 30, yc + cw * 0.5 - 30, Z(0.82)); a.box(X0 - 0, yc - cw * 0.5, Z(0.78), X0 + 40, yc + cw * 0.5, Z(0.86)); a.box(X1 - 40, yc - cw * 0.5, Z(0.78), X1, yc + cw * 0.5, Z(0.86));
    a.cyl(cx, yc, Z(0.82), Z(0.97), 60, 10); motor(a, cx, yc - 150, Z(0.97), 300, 140, 'y'); a.circ(cx, yc, W * 0.3, 'EQUIP-DETAIL'); a.line(X0, yc - cw * 0.5, X1, yc - cw * 0.5, 'EQUIP-DETAIL'); }
  for (const x of [X0 + 100, X1 - 100]) for (let i = 0; i <= n; i++) a.cyl(x, YF + cw * i + (i === 0 ? 100 : i === n ? -100 : 0), Z0, Z(0.1), 40, 6);
  a.box(X0, YF, Z0, X1, YF + 30, Z(0.1)); a.box(X0, -30, Z0, X1, 0, Z(0.1));
  a.log(`Added ${n} open-top tank ${n === 1 ? 'cell' : 'cells'} with froth lips, a mixer shaft and motor on each cell and the support legs (plan and 3D).`);
}
function dumpHopper(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  profX(a, [[Y(0.0), Z(0.2)], [Y(0.38), Z(0.2)], [Y(0.38), Z(0.78)], [Y(0.0), Z(0.2)]], X(0.0), X(1.0));   // approach ramp
  a.box(X(0.0), Y(0.38), Z(0.0), X(1.0), Y(1.0), Z(0.2));
  a.box(X(0.0), Y(0.9), Z(0.2), X(1.0), Y(1.0), Z(0.65)); for (const x of [X(0.0), X(1.0)]) profX(a, [[Y(0.38), Z(0.2)], [Y(1.0), Z(0.2)], [Y(1.0), Z(0.65)], [Y(0.38), Z(0.5)]], x - (x < cx ? 0 : 40), x + (x < cx ? 40 : 0));
  profX(a, [[Y(0.4), Z(0.55)], [Y(0.9), Z(0.28)], [Y(0.9), Z(0.32)], [Y(0.4), Z(0.59)]], X(0.04), X(0.96));
  const n = Math.round(W / 140); for (let i = 1; i < n; i++) { const x = X0 + (W * i) / n; a.box(x - 12, Y(0.42), Z(0.52), x + 12, Y(0.88), Z(0.58)); }
  a.box(X(0.0), Y(0.0), Z(0.1), X(1.0), Y(0.38), Z(0.22));
  a.box(X(0.0), Y(0.0), Z(0.2), X(0.04), Y(0.38), Z(0.78));
  a.rect(X(0.0), Y(0.38), X(1.0), Y(1.0), 'EQUIP-DETAIL'); a.line(X(0.0), Y(0.38), X(1.0), Y(0.38), 'EQUIP-DETAIL');
  a.log('Added the sloped approach ramp, the retaining walls, the back wall, the grid of bars over the receiving hopper and the sloped chute below (plan and 3D).');
}
function bucketElevator(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X(0.1), Y(0.08), Z(0.02), X(0.9), Y(0.92), Z(0.92)); a.box(X(0.06), Y(0.04), Z(0.0), X(0.94), Y(0.96), Z(0.1));
  a.box(X(0.0), Y(0.0), Z(0.8), X(1.0), Y(1.0), Z(1.0)); a.xcyl(X(0.0), X(1.0), Y(0.5), Z(0.9), H * 0.06, 18);
  a.box(X(0.22), Y(0.0), Z(0.04), X(0.78), Y(0.08), Z(0.12)); a.box(X(0.35), Y(0.92), Z(0.8), X(0.65), Y(1.0), Z(0.9));
  for (const z of [0.25, 0.5, 0.7]) a.box(X(0.2), Y(0.05), Z(z), X(0.8), Y(0.08), Z(z + 0.08));
  motor(a, X(0.96), Y(0.4), Z(0.9), D * 0.2, H * 0.03, 'x');
  ladder(a, X(0.1), Y(1.0) + 0, Z(0.0), Z(0.8), W * 0.2, 12); a.rect(X(0.1), Y(0.08), X(0.9), Y(0.92), 'EQUIP-DETAIL');
  a.log('Added the base plate, the tall casing with boot and head sections, the head pulley shaft and drive motor, inspection doors and a rear ladder (plan and 3D).');
}
function baghouse(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const n = v.cells;
  for (const x of [X(0.04), X(0.96)]) for (const y of [Y(0.1), Y(0.9)]) a.cyl(x, y, Z0, Z(0.35), 55, 8);
  for (let i = 0; i < n; i++) { const x0 = X0 + (W * i) / n, x1 = X0 + (W * (i + 1)) / n; profY(a, [[x0 + 30, Z(0.35)], [x1 - 30, Z(0.35)], [(x0 + x1) / 2 + 80, Z(0.1)], [(x0 + x1) / 2 - 80, Z(0.1)]], Y(0.08), Y(0.92)); a.cyl((x0 + x1) / 2, a.cy, Z(0.05), Z(0.1), 120, 10); }
  a.box(X(0.0), Y(0.0), Z(0.35), X(1.0), Y(1.0), Z(0.82));
  for (let i = 0; i < n; i++) a.box(X0 + (W * (i + 0.15)) / n, YF - 14, Z(0.45), X0 + (W * (i + 0.85)) / n, YF, Z(0.75));
  profY(a, [[X(0.0), Z(0.82)], [X(1.0), Z(0.82)], [X(0.9), Z(0.9)], [X(0.1), Z(0.9)]], Y(0.0), Y(1.0));
  a.box(X(0.3), Y(0.3), Z(0.9), X(0.7), Y(0.7), Z(0.96)); a.cyl(cx, a.cy, Z(0.96), Z(1.0), W * 0.12, 14); a.box(X(0.1), Y(0.4), Z(0.2), X(0.0), Y(0.0), Z(0.3)) ;
  a.rect(X(0.0), Y(0.0), X(1.0), Y(1.0), 'EQUIP-DETAIL'); a.circ(cx, a.cy, W * 0.12, 'EQUIP-DETAIL');
  a.log(`Added the four legs, ${n} cell hoppers with discharge valves, the filter box with a hinged door per cell, the plenum and the roof fan stack (plan and 3D).`);
}
function stockpile(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  a.cone(cx, cy, Z0, Z(0.82), W * 0.5, W * 0.05, 36); a.cyl(cx, cy, Z(0.82), Z(0.9), W * 0.05, 12);
  beam(a, [cx, YF, Z(0.5)], [cx, cy, Z(0.95)], H * 0.012, 8); a.box(cx - 60, cy - 60, Z(0.9), cx + 60, cy + 60, Z(1.0));
  for (let i = 0; i < 4; i++) a.cyl(cx, YF + (cy - YF) * (i / 3.2), Z0, Z(0.5) + (Z(0.95) - Z(0.5)) * (i / 3.2), H * 0.012, 6);
  a.box(cx - 100, YF, Z(0.4), cx + 100, YF + 200, Z(0.5));
  a.circ(cx, cy, W * 0.5); a.circ(cx, cy, W * 0.05, 'EQUIP-DETAIL'); a.line(cx, YF, cx, cy, 'EQUIP-DETAIL');
  a.log('Added the conical pile and the feed conveyor boom rising on trestle legs to a discharge head over the apex (plan and 3D).');
}

const sc = (rows, f) => rows.map(f);
const PROC = [
  fam({ cat: 'mining/processing', title: 'Generic jaw crusher',
    desc: (v) => `Jaw crusher with a ${v.open} in feed opening: skid, box frame, sloped feed hopper, two flywheels on a shaft, a motor with belt guard and a discharge opening.`,
    vs: [['24 by 36', 80, 110, 90], ['32 by 42', 100, 140, 110], ['42 by 56', 130, 180, 140], ['50 by 62', 160, 220, 170]].map(([o, w, d, h]) => [`${o} in opening`, w, d, h, 0, { open: o }]), build: jawCrusher }),
  fam({ cat: 'mining/processing', title: 'Generic cone crusher',
    desc: (v) => `Cone crusher, ${v.dia} in head: skid, base shell, main shell with adjusting ring and lock bolts, a feed bowl with hopper rim, a motor and a side drive guard.`,
    vs: [[36, 80, 110], [48, 100, 140], [60, 130, 170], [84, 170, 220]].map(([dia, w, h]) => [`${dia} in head`, w, w, h, 0, { dia }]), build: coneCrusher }),
  fam({ cat: 'mining/processing', title: 'Generic gyratory crusher',
    desc: (v) => `Primary gyratory crusher, ${v.gape} in gape: lower shell, tapered main shell, an upper shell with top rim, a four-arm spider carrying the central cone and a side drive housing.`,
    vs: [[42, 200, 330], [54, 240, 400], [60, 300, 480]].map(([gape, w, h]) => [`${gape} in gape`, w, w, h, 0, { gape }]), build: gyratory }),
  fam({ cat: 'mining/processing', title: 'Generic horizontal impact crusher',
    desc: (v) => `Horizontal-shaft impact crusher, ${v.rotor} in rotor: skid, housing, sloped feed hopper, a rotor with blow bars, flywheels at both ends and a motor.`,
    vs: [[30, 90, 120, 90], [40, 120, 150, 110], [50, 150, 190, 135]].map(([rotor, w, d, h]) => [`${rotor} in rotor`, w, d, h, 0, { rotor }]), build: impactCrusher }),
  fam({ cat: 'mining/processing', title: 'Generic vibrating screen',
    desc: (v) => `Inclined vibrating screen, ${v.decks} ${v.decks === 1 ? 'deck' : 'decks'}, ${v.size} ft: four spring posts, sloping side plates, deck frames, a feed box, an exciter shaft and a motor on top.`,
    vs: [[1, '4 by 10', 74, 140, 70], [1, '5 by 12', 90, 170, 80], [2, '6 by 16', 100, 220, 100], [2, '8 by 20', 126, 280, 118], [3, '8 by 20', 126, 280, 132]].map(([decks, size, w, d, h]) => [`${decks === 1 ? 'single' : decks === 2 ? 'double' : 'triple'} deck, ${size} ft`, w, d, h, 0, { decks, size }]), build: vibScreen }),
  fam({ cat: 'mining/processing', title: 'Generic belt conveyor',
    desc: (v) => `Inclined belt conveyor, ${v.belt} in belt, ${v.len} ft long: stringer plates, troughed idlers, loaded and return belt, head and tail pulleys, a motor and gearbox, legs with cross ties and a handrail.`,
    vs: [[24, 40, 6], [30, 60, 10], [36, 80, 16], [48, 120, 25], [60, 150, 30], [72, 100, 20]].map(([belt, len, rise]) => [`${belt} in belt, ${len} ft long`, belt + 50, len * 12, rise * 12 + 34, 0, { belt, len }]), build: beltConveyor }),
  fam({ cat: 'mining/processing', title: 'Generic radial stacker',
    desc: (v) => `Radial stacking conveyor, ${v.boom} ft boom: a wheeled bogie, a pivot column, an inclined boom with truss rails and cross frames, a discharge head and a rear feed hopper.`,
    vs: [[60, 100, 780, 230], [100, 120, 1280, 360], [150, 150, 1860, 480]].map(([boom, w, d, h]) => [`${boom} ft boom`, w, d, h, 0, { boom }]), build: stacker }),
  fam({ cat: 'mining/processing', title: 'Generic apron feeder',
    desc: (v) => `Apron feeder with a ${v.pan} in wide pan: base frame, a chain apron of overlapping pans, side skirt plates, a rear hopper wall, two end sprockets and a drive.`,
    vs: [[48, 76, 200, 70], [72, 108, 280, 90]].map(([pan, w, d, h]) => [`${pan} in pan`, w, d, h, 0, { pan }]), build: apronFeeder }),
  fam({ cat: 'mining/processing', title: 'Generic grizzly vibrating feeder',
    desc: (v) => `Vibrating feeder with a ${v.pan} in pan: four spring posts, the pan with side walls, a hopper throat with hanger rods, an exciter housing and a motor.`,
    vs: [[36, 56, 140, 60], [48, 68, 170, 72], [60, 80, 200, 84]].map(([pan, w, d, h]) => [`${pan} in pan`, w, d, h, 0, { pan }]), build: vibFeeder }),
  fam({ cat: 'mining/processing', title: 'Generic grinding mill',
    desc: (v) => `${v.kind === 'sag' ? 'Semi-autogenous' : 'Ball'} grinding mill, ${v.size} ft: a base, the cylindrical shell with end flanges and a ring gear, two trunnion bearings on pedestals, a feed spout, a discharge trommel and a side motor.`,
    vs: [['ball', '10 by 14', 170, 300, 190], ['ball', '14 by 20', 230, 420, 250], ['ball', '18 by 28', 290, 560, 310], ['sag', '24 by 12', 360, 430, 380], ['sag', '34 by 18', 500, 580, 520]].map(([kind, size, w, d, h]) => [`${kind === 'sag' ? 'semi-autogenous' : 'ball'}, ${size} ft`, w, d, h, 0, { kind, size }]), build: mill }),
  fam({ cat: 'mining/processing', title: 'Generic hydrocyclone unit',
    desc: (v) => v.n === 1 ? `Single hydrocyclone, ${v.dia} in: base frame, cylindrical head with a tangential feed inlet, a vortex-finder pipe, a conical body and an apex spigot.` : `Hydrocyclone cluster of ${v.n}, ${v.dia} in each: base frame, feed manifold, support legs and cyclones with feed inlets, vortex-finder pipes, cones and apex spigots.`,
    vs: [[1, 10, 40, 40, 90], [1, 26, 70, 70, 150], [4, 15, 120, 120, 130], [6, 26, 190, 190, 170]].map(([n, dia, w, d, h]) => [n === 1 ? `single, ${dia} in` : `cluster of ${n}, ${dia} in`, w, d, h, 0, { n, dia }]), build: cyclone }),
  fam({ cat: 'mining/processing', title: 'Generic bridge-drive thickener',
    desc: (v) => `Thickener tank, ${v.ft} ft diameter: a round wall with a rim launder, a full-diameter access bridge with handrails, a centre drive head, a feedwell and a rake shaft with an underflow outlet.`,
    vs: [[30, 360, 170], [60, 720, 240], [90, 1080, 300]].map(([ft, w, h]) => [`${ft} ft diameter`, w, w, h, 0, { ft }]), build: thickener }),
  fam({ cat: 'mining/processing', title: 'Generic agitated leach tank',
    desc: (v) => `Agitated process tank, ${v.ft} ft diameter: a round tank with vertical baffles and a rim ring, a bridge with handrails, an agitator motor, a shaft with two impellers and a wall ladder.`,
    vs: [[20, 24], [30, 32], [40, 40], [50, 44]].map(([ft, h]) => [`${ft} ft diameter`, ft * 12, ft * 12, h * 12 + 30, 0, { ft }]), build: leachTank }),
  fam({ cat: 'mining/processing', title: 'Generic round ore surge bin',
    desc: (v) => `Round steel ore bin, ${v.t} ton: four support legs with bracing, a conical hopper with a discharge gate, a cylindrical wall, a shallow roof with a hatch and a side ladder.`,
    vs: [[50, 120, 260], [150, 170, 330], [400, 240, 420]].map(([t, w, h]) => [`${t} ton`, w, w, h, 0, { t }]), build: roundBin }),
  fam({ cat: 'mining/processing', title: 'Generic overband magnet',
    desc: (v) => `Overband magnet for a ${v.belt} in belt: four posts and a top frame, the suspended magnet body, two end rollers for the cleaning belt, side plates and a belt motor.`,
    vs: [[36, 110, 100, 70], [48, 124, 110, 80], [60, 136, 120, 90]].map(([belt, w, d, h]) => [`${belt} in belt`, w, d, h, 0, { belt }]), build: overband }),
  fam({ cat: 'mining/processing', title: 'Generic magnetic drum separator',
    desc: (v) => `Magnetic drum separator, ${v.dia} in drum: base, four posts, the horizontal drum on its axle, a feed hopper over the drum, a split discharge hopper below and a motor.`,
    vs: [[30, 76, 110, 80], [48, 100, 130, 100]].map(([dia, w, d, h]) => [`${dia} in drum`, w, d, h, 0, { dia }]), build: drumMagnet }),
  fam({ cat: 'mining/processing', title: 'Generic flotation cell bank',
    desc: (v) => `Flotation bank of ${v.cells} open-top ${v.cells === 1 ? 'cell' : 'cells'}, ${v.m3} m3 each: tank bodies with froth lips, a mixer shaft and motor on each cell and support legs.`,
    vs: [[1, 10, 90, 90, 80], [2, 10, 90, 180, 80], [3, 10, 90, 270, 80], [2, 50, 160, 320, 130]].map(([cells, m3, w, d, h]) => [`${cells} cell${cells > 1 ? 's' : ''}, ${m3} m3`, w, d, h, 0, { cells, m3 }]), build: flotation }),
  fam({ cat: 'mining/processing', title: 'Generic run-of-mine dump hopper',
    desc: (v) => `Tipping hopper for ${v.t} ton class trucks: a sloped approach ramp, side retaining walls, a back wall, a grid of bars over the receiving hopper and a sloped chute below.`,
    vs: [[40, 168, 360, 150], [100, 300, 540, 240], [220, 420, 760, 330]].map(([t, w, d, h]) => [`${t} ton class trucks`, w, d, h, 0, { t }]), build: dumpHopper }),
  fam({ cat: 'mining/processing', title: 'Generic bucket elevator',
    desc: (v) => `Bucket elevator, ${v.ft} ft tall: a base plate, a tall casing with boot and head sections, a head pulley shaft with drive motor, inspection doors and a rear ladder.`,
    vs: [[30, 46, 360], [50, 60, 600], [80, 80, 960]].map(([ft, w, h]) => [`${ft} ft tall`, w, w, h, 0, { ft }]), build: bucketElevator }),
  fam({ cat: 'mining/processing', title: 'Generic baghouse dust collector',
    desc: (v) => `Baghouse dust collector with ${v.cells} cells: four legs, a hopper with a discharge valve per cell, the filter box with a hinged door per cell, a plenum and a roof fan stack.`,
    vs: [[2, 120, 100, 190], [4, 220, 100, 200], [6, 320, 110, 210]].map(([cells, w, d, h]) => [`${cells} cells`, w, d, h, 0, { cells }]), build: baghouse }),
  fam({ cat: 'mining/processing', title: 'Generic conical ore stockpile',
    desc: (v) => `Conical stockpile, ${v.ft} ft high: a round pile with a feed conveyor boom on trestle legs rising to a discharge head over the apex.`,
    vs: [[20, 640, 260], [40, 1280, 500], [60, 1900, 740]].map(([ft, w, h]) => [`${ft} ft high`, w, w, h, 0, { ft }]), build: stockpile }),
];

// ---------------------------------------------------------------- SUPPORT ----------------------------------------------------------
function headframe(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, Y(0.2), Z0, X1, Y(0.7), Z(0.05));
  const tp = Z(0.9), bs = H * 0.015;
  for (const s of [-1, 1]) { beam(a, [cx + s * W * 0.42, Y(0.35), Z(0.05)], [cx + s * W * 0.14, Y(0.4), tp], bs * 1.2, 8); beam(a, [cx + s * W * 0.42, Y(0.6), Z(0.05)], [cx + s * W * 0.14, Y(0.5), tp], bs * 1.2, 8); beam(a, [cx + s * W * 0.14, Y(0.5), tp], [cx + s * W * 0.2, Y(1.0), Z(0.05)], bs, 8); }
  const nb = 6; for (let i = 0; i < nb; i++) { const f0 = i / nb, f1 = (i + 1) / nb, xw = (f) => W * (0.42 - 0.28 * f); const z0 = Z(0.05 + 0.85 * f0), z1 = Z(0.05 + 0.85 * f1); beam(a, [cx - xw(f0), Y(0.35), z0], [cx + xw(f1), Y(0.4), z1], bs * 0.5, 5); beam(a, [cx + xw(f0), Y(0.35), z0], [cx - xw(f1), Y(0.4), z1], bs * 0.5, 5); beam(a, [cx - xw(f1), Y(0.4), z1], [cx + xw(f1), Y(0.4), z1], bs * 0.5, 5); }
  a.box(cx - W * 0.25, Y(0.3), tp, cx + W * 0.25, Y(0.6), tp + H * 0.02);
  for (const x of [cx - W * 0.1, cx + W * 0.1]) { a.xcyl(x - 30, x + 30, Y(0.45), tp + H * 0.06, H * 0.05, 20); }
  a.box(cx - W * 0.18, Y(0.4), tp + H * 0.02, cx + W * 0.18, Y(0.5), tp + H * 0.04);
  a.box(cx - W * 0.2, Y(0.35), Z(0.05), cx + W * 0.2, Y(0.55), Z(0.12));
  a.cyl(cx, Y(0.45), Z(0.0), Z(0.05), W * 0.12, 14); a.circ(cx, Y(0.45), W * 0.12, 'EQUIP-DETAIL'); a.line(cx, Y(0.45), cx, Y(1.0), 'EQUIP-DETAIL');
  a.log('Added the base slab and shaft collar, four converging legs with diagonal bracing and rope-side back stays, the top platform with two sheave wheels and the loading bin below (plan and 3D).');
}
function hoist(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z(0.08));
  const n = v.drums, r = Math.min(D * 0.4, H * 0.36), zc = Z(0.08) + r + 60, dl = (W * 0.62) / n;
  for (let i = 0; i < n; i++) { const x0 = X(0.1) + (W * 0.62 * i) / n + 30, x1 = x0 + dl - 60; a.xcyl(x0, x1, Y(0.5), zc, r, 28); a.xcyl(x0 - 20, x0 + 30, Y(0.5), zc, r * 1.18, 28); a.xcyl(x1 - 30, x1 + 20, Y(0.5), zc, r * 1.18, 28); a.xcyl(x0, x1, Y(0.5), zc, r * 0.2, 12); }
  for (const x of [X(0.1), X(0.72)]) a.box(x - 60, Y(0.6), Z(0.08), x + 60, Y(0.4), zc - r * 0.2);
  a.box(X(0.74), Y(0.35), Z(0.08), X(0.9), Y(0.65), zc + r * 0.2);
  motor(a, X(0.9) + 10, Y(0.5), zc, W * 0.1, r * 0.3, 'x');
  cabin(a, X(0.1), X(0.35), Y(0.02), Y(0.22), Z(0.08), Z(0.45), H * 0.01);
  a.rect(X(0.1), Y(0.35), X(0.72), Y(0.65), 'EQUIP-DETAIL');
  a.log(`Added the base frame, ${n} grooved ${n === 1 ? 'drum' : 'drums'} with flanges on bearing pedestals, the gearbox, the drive motor and the operator cab (plan and 3D).`);
}
function portal(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const ow = v.ow * 12 * IN, oh = v.oh * 12 * IN;
  a.box(X0, Y(1.0), Z0, X1, YF + 0, Z0 + 20);
  a.box(X0 + 60, Y(0.12), Z0, cx - ow / 2, Y(0.0), Z0 + H * 0.88); a.box(cx + ow / 2, Y(0.12), Z0, X1 - 60, Y(0.0), Z0 + H * 0.88);
  a.box(X0 + 60, Y(0.12), Z0 + oh, X1 - 60, Y(0.0), Z0 + H * 0.88);
  profY(a, [[cx - ow / 2, Z0 + oh - 100], [cx - ow / 2 + 100, Z0 + oh], [cx - ow / 2, Z0 + oh]], Y(0.12), Y(0.0));
  profY(a, [[cx + ow / 2, Z0 + oh - 100], [cx + ow / 2, Z0 + oh], [cx + ow / 2 - 100, Z0 + oh]], Y(0.12), Y(0.0));
  profX(a, [[Y(0.12), Z0], [Y(0.12), Z0 + H * 0.7], [Y(0.55), Z0]], X0, X0 + 50); profX(a, [[Y(0.12), Z0], [Y(0.12), Z0 + H * 0.7], [Y(0.55), Z0]], X1 - 50, X1);
  a.box(X0, Y(0.0), Z0 + H * 0.88, X1, Y(0.12), Z0 + H * 0.92);
  a.box(cx - ow / 2 + 20, Y(0.12), Z0 + H * 0.93, cx + ow / 2 - 20, Y(0.12) - 0, Z0 + H); a.box(cx - ow * 0.3, Y(0.0) - 12, Z0 + H * 0.93, cx + ow * 0.3, Y(0.0), Z0 + H * 0.99);
  for (const s of [-1, 1]) a.box(cx + s * (ow / 2 + 40) - 20, Y(0.0), Z0, cx + s * (ow / 2 + 40) + 20, Y(0.05), Z0 + 60);
  a.line(cx - ow / 2, Y(0.0), cx - ow / 2, Y(0.5), 'EQUIP-DETAIL'); a.line(cx + ow / 2, Y(0.0), cx + ow / 2, Y(0.5), 'EQUIP-DETAIL');
  a.log(`Added the floor slab, two pillars and a header over the ${v.ow} ft wide opening with corner haunches, splayed wing walls, a top sign panel and base bollards (plan and 3D).`);
}
function weighbridge(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const dw = W * (v.kiosk ? 0.72 : 1.0), x0 = X0, x1 = X0 + dw;
  profX(a, [[Y(0.0), Z0], [Y(0.0) + 0, Z0 + H * 0.4], [Y(0.1), Z0 + H * 0.4], [Y(0.1), Z0]], x0, x1);
  profX(a, [[Y(0.9), Z0], [Y(0.9), Z0 + H * 0.4], [Y(1.0), Z0 + H * 0.4], [Y(1.0), Z0]], x0, x1);
  a.box(x0, Y(0.1), Z0 + H * 0.3, x1, Y(0.9), Z0 + H * 0.42);
  for (let i = 0; i <= 8; i++) a.line(x0, Y(0.1 + 0.8 * i / 8), x1, Y(0.1 + 0.8 * i / 8), 'EQUIP-DETAIL');
  for (const x of [x0, x1 - 40]) a.box(x, Y(0.1), Z0 + H * 0.42, x + 40, Y(0.9), Z0 + H * 0.6);
  for (const x of [x0 + dw * 0.2, x1 - dw * 0.2]) for (const f of [0.15, 0.5, 0.85]) a.box(x - 20, Y(f) - 20, Z0, x + 20, Y(f) + 20, Z0 + H * 0.3);
  profX(a, [[Y(0.0), Z0], [Y(0.1), Z0 + H * 0.4], [Y(0.1), Z0 + H * 0.3], [Y(0.0), Z0]], x0, x1);
  if (v.kiosk) { const kx = x1 + W * 0.04; a.box(kx, Y(0.45), Z0, X1, Y(0.6), Z0 + H * 0.95); a.frame(kx + 6, Z0 + H * 0.5, X1 - 6, Z0 + H * 0.85, Y(0.45) - 6, Y(0.45) + 4, 8); a.box(kx - 6, Y(0.43), Z0 + H * 0.95, X1 + 0, Y(0.62), Z0 + H); a.cyl(x1 + W * 0.05, Y(0.1), Z0, Z0 + H * 0.8, 15, 6); a.box(x1 + W * 0.05 - 40, Y(0.1) - 10, Z0 + H * 0.8, x1 + W * 0.05 + 40, Y(0.1) + 10, Z0 + H * 0.9); }
  a.rect(x0, Y(0.1), x1, Y(0.9), 'EQUIP-DETAIL');
  a.log('Added the steel deck with load-cell pedestals underneath, the side kerbs, an entry ramp at each end' + (v.kiosk ? ', a scale kiosk with a window and a signal post at the side' : '') + ' (plan and 3D).');
}
function fuelBay(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.02);
  const n = v.lanes, lw = W / n;
  for (let i = 0; i <= n; i++) { const x = X0 + lw * i; const xx = Math.min(Math.max(x, X0 + 40), X1 - 40); a.cyl(xx, Y(0.2), Z0 + H * 0.02, Z(0.86), 28, 8); a.cyl(xx, Y(0.8), Z0 + H * 0.02, Z(0.86), 28, 8); }
  a.box(X0, Y(0.1), Z(0.86), X1, Y(0.9), Z(0.94)); a.box(X0 - 0, Y(0.1), Z(0.94), X1, Y(0.9) , Z(0.96));
  for (let i = 0; i < n; i++) { const xc = X0 + lw * (i + 0.5);
    a.box(xc - lw * 0.45, Y(0.35), Z0 + H * 0.02, xc - lw * 0.45 + 24, Y(0.65), Z0 + H * 0.02 + 60);
    a.box(xc - 30, Y(0.4), Z0 + H * 0.02, xc + 30, Y(0.6), Z(0.44)); a.box(xc - 40, Y(0.45), Z(0.28), xc + 40, Y(0.55), Z(0.4)); a.box(xc - 28, Y(0.4) - 2, Z(0.36), xc + 28, Y(0.4), Z(0.43));
    a.line(xc - lw * 0.4, Y(0.35), xc - lw * 0.4, Y(0.65), 'EQUIP-DETAIL'); a.rect(xc - 30, Y(0.4), xc + 30, Y(0.6), 'EQUIP-DETAIL'); a.cyl(xc + lw * 0.3, Y(0.5), Z0 + H * 0.02, Z0 + H * 0.12, 12, 6); }
  a.box(X0, Y(0.1), Z(0.78), X1, Y(0.1) - 0, Z(0.86));
  a.log(`Added the slab, canopy columns, the roof with a fascia, and a dispenser pedestal with hose and display on a kerbed island for each of the ${n} lanes (plan and 3D).`);
}
function washBay(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + 12);
  for (const x of [X0, X1 - 30]) a.box(x, Y(0.05), Z0, x + 30, Y(1.0), Z(0.3 + v.hi * 0.4));
  a.box(X0, Y(1.0) + 0, Z0, X1, 0 + 0, Z(0.9)); a.box(X0, -30, Z0, X1, 0, Z(0.9));
  a.box(X(0.2), Y(0.6), Z0 + 12, X(0.8), Y(0.7), Z0 + 25); for (let i = 0; i < 8; i++) a.line(X(0.2) + (W * 0.6 * i) / 7, Y(0.6), X(0.2) + (W * 0.6 * i) / 7, Y(0.7), 'EQUIP-DETAIL');
  const gz = Z(0.8); for (const f of [0.3, 0.8]) { a.cyl(X(0.1), Y(f), Z0, gz, 30, 8); a.cyl(X(0.9), Y(f), Z0, gz, 30, 8); a.box(X(0.1), Y(f) - 30, gz, X(0.9), Y(f) + 30, gz + H * 0.04); beam(a, [X(0.1), Y(f), gz - H * 0.1], [X(0.9), Y(f), gz - H * 0.1], 20, 6); for (let i = 0; i < 9; i++) a.cone(X(0.15 + i * 0.087), Y(f), gz - H * 0.18, gz - H * 0.1, 6, 18, 6); a.cone(X(0.1), Y(f), gz - H * 0.3, gz - H * 0.1, 8, 14, 6); a.cone(X(0.9), Y(f), gz - H * 0.3, gz - H * 0.1, 8, 14, 6); }
  a.box(X(0.1), Y(0.3), gz + H * 0.04, X(0.9), Y(0.8), gz + H * 0.05);
  a.rect(X(0.2), Y(0.6), X(0.8), Y(0.7), 'EQUIP-DETAIL');
  a.log('Added the concrete slab, the side kerb walls, the back wall, a sump grating and two spray arches with a pipe, nozzles and side lances (plan and 3D).');
}
function dryBuilding(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.1);
  a.box(X0, YF, Z0 + H * 0.1, X1, 0, Z0 + H * 0.9); profX(a, [[YF, Z0 + H * 0.9], [0, Z0 + H * 0.9], [0, Z0 + H * 0.97], [YF, Z0 + H]], X0, X1);
  a.box(cx + W * 0.1, YF - 20, Z0 + H * 0.1, cx + W * 0.4, YF, Z0 + H * 0.78); a.box(cx + W * 0.34, YF - 34, Z0 + H * 0.4, cx + W * 0.37, YF - 20, Z0 + H * 0.48);
  a.frame(X0 + W * 0.1, Z0 + H * 0.4, X0 + W * 0.4, Z0 + H * 0.76, YF - 14, YF, 8);
  a.box(cx + W * 0.1, YF - 140, Z0 + H * 0.1 - 20, cx + W * 0.4, YF - 20, Z0 + H * 0.1);
  rail(a, cx + W * 0.1, YF - 140, cx + W * 0.4, YF - 140, Z0 + H * 0.1, H * 0.3, 10, 3);
  const nw = Math.max(3, Math.round(v.ft / 6)); for (let i = 0; i < nw; i++) { const y = YF + 150 + ((D - 300) * i) / (nw - 1); a.frame(X1 - 0, Z0 + H * 0.45, X1 + 0.1, Z0 + H * 0.75, y, y + 120, 0.1); a.box(X1, y, Z0 + H * 0.45, X1 + 12, y + 140, Z0 + H * 0.75); a.line(X1, y, X1, y + 140, 'EQUIP-DETAIL'); }
  a.box(X(0.1), Y(0.5), Z0 + H * 0.97, X(0.3), Y(0.6), Z0 + H);
  a.rect(cx + W * 0.1, YF - 140, cx + W * 0.4, YF, 'EQUIP-DETAIL');
  a.log(`Added the skid base, the ${v.ft} ft modular body with a sloped roof, an end door with steps and rail, an end window, a row of side windows and a roof vent (plan and 3D).`);
}
function minePower(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z(0.06)); a.box(X0, YF, Z(0.06), X0 + 14, 0, Z(0.14)); a.box(X1 - 14, YF, Z(0.06), X1, 0, Z(0.14));
  a.box(X(0.2), Y(0.5), Z(0.06), X(0.66), Y(0.85), Z(0.55)); a.box(X(0.17), Y(0.47), Z(0.55), X(0.69), Y(0.88), Z(0.6));
  for (let i = 0; i < 3; i++) { const x = X(0.28 + i * 0.16); a.cone(x, Y(0.68), Z(0.6), Z(0.78), W * 0.035, W * 0.015, 10); a.cyl(x, Y(0.68), Z(0.78), Z(0.82), W * 0.02, 8); for (let k = 0; k < 3; k++) a.cyl(x, Y(0.68), Z(0.62 + k * 0.05), Z(0.64 + k * 0.05), W * 0.05, 10); }
  for (const s of [0, 1]) { const x = s ? X(0.8) : X(0.06); for (let i = 0; i < 6; i++) a.box(x + i * 14 * (s ? 1 : 1), Y(0.55), Z(0.1), x + i * 14 + 8, Y(0.8), Z(0.5)); }
  a.ycyl(Y(0.35), Y(0.48), X(0.3), Z(0.7), W * 0.05, 12); a.cyl(X(0.3), Y(0.42), Z(0.55), Z(0.65), 20, 6);
  a.box(X(0.2), Y(0.05), Z(0.06), X(0.8), Y(0.28), Z(0.55)); a.frame(X(0.24), Z(0.15), X(0.46), Z(0.5), Y(0.05) - 8, Y(0.05) + 4, 8); a.frame(X(0.54), Z(0.15), X(0.76), Z(0.5), Y(0.05) - 8, Y(0.05) + 4, 8);
  a.line(cx, Y(0.05), cx, Y(0.28), 'EQUIP-DETAIL'); a.rect(X(0.2), Y(0.5), X(0.66), Y(0.85), 'EQUIP-DETAIL');
  a.log(`Added the oil-containment base, the transformer tank with three high-voltage bushings with fins, a radiator bank at each end, a conservator tank and a low-voltage switch cabinet with two doors, ${v.kva} kVA (plan and 3D).`);
}
function minePlantShed(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + 12);
  a.box(X0, YF, Z0 + 12, X0 + 14, 0, Z(0.78)); a.box(X1 - 14, YF, Z0 + 12, X1, 0, Z(0.78)); a.box(X0, -14, Z0 + 12, X1, 0, Z(0.78));
  profY(a, [[X0 - 20, Z(0.78)], [X1 + 20, Z(0.78)], [cx, Z(1.0)]], YF, 0);
  const n = v.bays, bw = W / n;
  a.box(X0, YF, Z(0.74), X1, YF + 14, Z(0.82)); 
  for (let i = 0; i < n; i++) { const xa = X0 + bw * i + bw * 0.1, xb = X0 + bw * (i + 1) - bw * 0.1; a.box(xa, YF - 10, Z0 + 12, xb, YF, Z(0.68)); for (let z = Z0 + 40; z < Z(0.68); z += H * 0.05) a.line(xa, YF, xb, YF, 'EQUIP-DETAIL'); for (let z = Z0 + 80; z < Z(0.66); z += 70) a.box(xa, YF - 14, z, xb, YF - 10, z + 10); a.box(xa - 20, YF - 16, Z0 + 12, xa, YF - 10, Z(0.7)); a.box(xb, YF - 16, Z0 + 12, xb + 20, YF - 10, Z(0.7)); a.box(xa, YF - 16, Z(0.68), xb, YF - 10, Z(0.7)); }
  for (const k of [0.3, 0.6]) a.box(X0 - 8, Y(k), Z(0.4), X0, Y(k) + 100, Z(0.55));
  a.line(X0, Y(0.5), X1, Y(0.5), 'EQUIP-DETAIL');
  a.log(`Added the slab, side and rear walls, the gabled roof, a header band and ${n === 1 ? 'one tall roller door' : n + ' tall roller doors'} with slat lines and door frames, plus side vents (plan and 3D).`);
}
function campUnit(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  for (const f of [0.1, 0.5, 0.9]) a.box(X0, Y(f) - 20, Z0, X1, Y(f) + 20, Z(0.1));
  a.box(X0, YF, Z(0.1), X1, 0, Z(0.94)); a.box(X0 - 6, YF - 6, Z(0.94), X1 + 0, 6, Z(0.98));
  a.box(X(0.1), YF - 8, Z(0.1), X(0.38), YF, Z(0.8)); a.box(X(0.32), YF - 14, Z(0.42), X(0.35), YF - 8, Z(0.5));
  a.frame(X(0.5), Z(0.4), X(0.9), Z(0.75), YF - 8, YF, 6);
  const nw = Math.max(1, v.rooms); for (let i = 0; i < nw; i++) { const y = YF + (D * (i + 0.5)) / nw; a.frame(X1, Z(0.4), X1 + 4, Z(0.75), y - 40, y + 40, 6); a.box(X1, y - 36, Z(0.4), X1 + 6, y + 36, Z(0.75)); }
  a.box(X(0.3), YF - 120, Z(0.1) - 14, X(0.62), YF, Z(0.1)); rail(a, X(0.3), YF - 120, X(0.62), YF - 120, Z(0.1), H * 0.3, 8, 3);
  for (let i = 0; i < Math.max(1, v.rooms >> 1); i++) a.box(X(0.35) + i * 100, -24, Z(0.5), X(0.35) + i * 100 + 90, 0, Z(0.78));
  a.rect(X(0.3), YF - 120, X(0.62), YF, 'EQUIP-DETAIL');
  a.log(`Added the skid beams, the box body with a roof overhang, an end door with steps and a rail, an end window, ${nw} side window${nw > 1 ? 's' : ''} and rear air-conditioning units (plan and 3D).`);
}
function signBoard(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  for (const x of [X(0.04), X(0.96)]) { a.cyl(x, a.cy, Z0, Z(0.9), 30, 8); a.box(x - 80, a.cy - 80, Z0, x + 80, a.cy + 80, Z0 + 20); }
  const n = v.panels, pw = (W * 0.9) / n;
  a.box(X(0.03), a.cy - 30, Z(0.3), X(0.97), a.cy - 6, Z(0.92)); a.box(X(0.03), a.cy - 8, Z(0.85), X(0.97), a.cy + 20, Z(0.92));
  for (let i = 0; i < n; i++) { const x0 = X(0.05) + pw * i; a.box(x0 + 8, a.cy - 40, Z(0.38), x0 + pw - 8, a.cy - 30, Z(0.82)); a.box(x0 + 20, a.cy - 44, Z(0.46), x0 + pw - 20, a.cy - 40, Z(0.58)); a.box(x0 + 20, a.cy - 44, Z(0.64), x0 + pw - 20, a.cy - 40, Z(0.76)); }
  a.box(X(0.1), a.cy - 52, Z(0.93), X(0.9), a.cy + 0, Z(1.0)); a.line(X0, a.cy - 6, X1, a.cy - 6, 'EQUIP-DETAIL');
  a.log(`Added two posts on footing plates, the backing frame with ${n} sign panels with text bars and a header board (plan and 3D).`);
}
function coreRack(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx } = a, { Y, X, Z } = fr(a); a.outline();
  const n = v.bays, bw = W / n, lev = v.levels;
  for (let i = 0; i <= n; i++) for (const y of [YF + 30, -30]) a.box(X0 + bw * i - (i === n ? 36 : 0), y - 18, Z0, X0 + bw * i + (i === n ? 0 : 36), y + 18, Z0 + H);
  for (let l = 0; l <= lev; l++) { const z = Z0 + 120 + ((H - 160) * l) / lev; for (const y of [YF + 30, -30]) a.box(X0, y - 20, z - 20, X1, y + 20, z + 20); if (l < lev) for (let i = 0; i < n; i++) { for (let t = 0; t < 4; t++) a.box(X0 + bw * i + 60 + t * (bw - 120) / 4, YF + 70, z + 20, X0 + bw * i + 60 + (t + 0.8) * (bw - 120) / 4, -70, z + (H - 160) / lev * 0.55); } }
  a.line(X0, a.cy, X1, a.cy, 'EQUIP-DETAIL');
  a.log(`Added the uprights, ${lev} shelf levels of paired beams in ${n} bays and rows of core trays on every level (plan and 3D).`);
}
function fuelTank(a, v) {
  const { X0, X1, YF, Z0, W, D, H, cx, cy } = a, { Y, X, Z } = fr(a); a.outline();
  a.box(X0, YF, Z0, X1, 0, Z0 + H * 0.04); for (const x of [X0, X1 - 30]) a.box(x, YF, Z0, x + 30, 0, Z0 + H * 0.2); for (const y of [YF, -30]) a.box(X0, y, Z0, X1, y + 30, Z0 + H * 0.2);
  if (v.kind === 'horizontal') { const r = Math.min(W * 0.3, H * 0.3), zc = Z0 + H * 0.2 + r + 80; ytank(a, cx, YF + D * 0.1, -D * 0.1, zc, r); for (const f of [0.25, 0.75]) a.box(cx - r * 0.8, Y(f) - 30, Z0 + H * 0.04, cx + r * 0.8, Y(f) + 30, zc - r * 0.6); a.cyl(cx, a.cy, zc + r, zc + r + 120, r * 0.2, 12); ladder(a, X0 + 60, YF + D * 0.1 + 50, Z0 + H * 0.04, zc + r * 0.3, 360, 10); a.box(X1 - 240, Y(0.9), Z0 + H * 0.04, X1 - 40, Y(0.7), Z0 + H * 0.55); }
  else { const r = W * 0.34; a.cyl(cx, cy, Z0 + H * 0.06, Z(0.82), r, 30); a.cone(cx, cy, Z(0.82), Z(0.95), r, r * 0.3, 24); a.cyl(cx, cy, Z(0.95), Z(1.0), r * 0.15, 10); ladder(a, cx + r - 30, cy - 180, Z0 + H * 0.06, Z(0.82), 360, 10); a.cyl(cx + r * 1.2, cy, Z0 + H * 0.04, Z0 + H * 0.15, 100, 8); a.circ(cx, cy, r); }
  a.line(X0, YF, X1, 0, 'EQUIP-DETAIL');
  a.log(`Added the bund slab and walls, ${v.kind === 'horizontal' ? 'a horizontal cylindrical tank on two saddles with a hatch, ladder and a pump pad' : 'a vertical cylindrical tank with a conical roof, ladder and a pump pad'} (plan and 3D).`);
}

const SUPPORT = [
  fam({ cat: 'mining/support', title: 'Generic shaft headframe',
    desc: (v) => `Steel headframe, ${v.ft} ft tall: base slab and shaft collar, four converging legs with diagonal bracing and rope-side back stays, a top platform with two sheave wheels and a loading bin below.`,
    vs: [[40, 150, 200], [60, 190, 280], [80, 230, 360], [100, 270, 440]].map(([ft, w, d]) => [`${ft} ft tall`, w, d, ft * 12 + 30, 0, { ft }]), build: headframe }),
  fam({ cat: 'mining/support', title: 'Generic mine hoist',
    desc: (v) => `${v.drums === 1 ? 'Single' : 'Double'}-drum mine hoist, ${v.ft} ft drum: base frame, grooved drum${v.drums > 1 ? 's' : ''} with flanges on bearing pedestals, a gearbox, a drive motor and an operator cab.`,
    vs: [[1, 6, 160, 140, 100], [2, 9, 230, 200, 150], [2, 12, 300, 260, 190]].map(([drums, ft, w, d, h]) => [`${drums === 1 ? 'single' : 'double'} drum, ${ft} ft`, w, d, h, 0, { drums, ft }]), build: hoist }),
  fam({ cat: 'mining/support', title: 'Generic decline portal',
    desc: (v) => `Decline portal headwall, ${v.ow} ft wide by ${v.oh} ft high opening: floor slab, two pillars and a header with corner haunches, splayed wing walls, a sign panel and base bollards.`,
    vs: [[14, 14], [18, 16], [22, 18]].map(([ow, oh]) => [`${ow} by ${oh} ft opening`, ow * 12 + 160, 240, oh * 12 + 70, 0, { ow, oh }]), build: portal }),
  fam({ cat: 'mining/support', title: 'Generic truck weighbridge',
    desc: (v) => `Truck weighbridge, ${v.ft} ft deck: steel deck with load-cell pedestals underneath, side kerbs, ramps at both ends${v.kiosk ? ' and a scale kiosk with a signal post at the side' : ''}.`,
    vs: [[40, 0], [60, 0], [80, 1], [100, 1]].map(([ft, kiosk]) => [`${ft} ft deck${kiosk ? ', with kiosk' : ''}`, kiosk ? 230 : 170, ft * 12 + 120, 40, 0, { ft, kiosk }]), build: weighbridge }),
  fam({ cat: 'mining/support', title: 'Generic mine fuel bay canopy',
    desc: (v) => `Fuel bay with ${v.lanes} ${v.lanes === 1 ? 'lane' : 'lanes'}: a slab, canopy columns, a roof with fascia and a dispenser pedestal with hose and display on a kerbed island in each lane.`,
    vs: [[1, 216, 360], [2, 360, 420], [3, 504, 480]].map(([lanes, w, d]) => [`${lanes} lane${lanes > 1 ? 's' : ''}`, w, d, 216, 0, { lanes }]), build: fuelBay }),
  fam({ cat: 'mining/support', title: 'Generic haul truck wash bay',
    desc: (v) => `Vehicle wash bay for ${v.cls}: concrete slab, side kerb walls, a back wall, a sump grating and two spray arches with a pipe, nozzles and side lances.`,
    vs: [['light vehicles', 160, 360, 140, 0.0], ['100 ton class trucks', 300, 600, 260, 0.3], ['220 ton class trucks', 420, 800, 340, 0.4]].map(([cls, w, d, h, hi]) => [cls, w, d, h, 0, { cls, hi }]), build: washBay }),
  fam({ cat: 'mining/support', title: 'Generic mine dry and change building',
    desc: (v) => `Modular dry building, ${v.ft} ft long: skid base, a box body with a sloped roof, an end door with steps and a rail, an end window, a row of side windows and a roof vent.`,
    vs: [[20], [40], [60]].map(([ft]) => [`${ft} ft module`, 96, ft * 12, 108, 0, { ft }]), build: dryBuilding }),
  fam({ cat: 'mining/support', title: 'Generic mine power skid substation',
    desc: (v) => `Skid substation, ${v.kva} kVA: oil-containment base, transformer tank with three finned high-voltage bushings, a radiator bank at each end, a conservator tank and a low-voltage cabinet with two doors.`,
    vs: [[1000, 120, 130, 110], [2500, 156, 160, 130], [5000, 196, 200, 156]].map(([kva, w, d, h]) => [`${kva} kVA`, w, d, h, 0, { kva }]), build: minePower }),
  fam({ cat: 'mining/support', title: 'Generic truck maintenance shed',
    desc: (v) => `Maintenance shed with ${v.bays} ${v.bays === 1 ? 'bay' : 'bays'}: slab, side and rear walls, a gabled roof, a header band and tall roller doors with slat lines and door frames.`,
    vs: [[1, 480], [2, 960], [3, 1440]].map(([bays, w]) => [`${bays} bay${bays > 1 ? 's' : ''}`, w, 1200, 480, 0, { bays }]), build: minePlantShed }),
  fam({ cat: 'mining/support', title: 'Generic mine camp accommodation module',
    desc: (v) => `Camp accommodation module with ${v.rooms} ${v.rooms === 1 ? 'room' : 'rooms'}: skid beams, a box body with roof overhang, an end door with steps and a rail, an end window, side windows and rear air-conditioning units.`,
    vs: [[1, 8, 20], [2, 10, 30], [4, 10, 40], [6, 12, 48]].map(([rooms, w, ft]) => [`${rooms} room${rooms > 1 ? 's' : ''}, ${ft} ft`, w * 12, ft * 12, 108, 0, { rooms }]), build: campUnit }),
  fam({ cat: 'mining/support', title: 'Generic mine entrance sign board',
    desc: (v) => `Entrance sign board with ${v.panels} sign panels: two posts on footing plates, a backing frame with panels carrying text bars and a header board.`,
    vs: [[2, 96], [4, 168]].map(([panels, w]) => [`${panels} panels`, w, 12, 120, 0, { panels }]), build: signBoard }),
  fam({ cat: 'mining/support', title: 'Generic drill core rack',
    desc: (v) => `Core storage rack with ${v.bays} bays and ${v.levels} levels: uprights, paired shelf beams and rows of core trays on every level.`,
    vs: [[3, 4, 144, 36, 108], [6, 5, 288, 36, 120]].map(([bays, levels, w, d, h]) => [`${bays} bays, ${levels} levels`, w, d, h, 0, { bays, levels }]), build: coreRack }),
  fam({ cat: 'mining/support', title: 'Generic mine bulk fuel tank',
    desc: (v) => v.kind === 'horizontal' ? `Bunded horizontal fuel tank, ${v.gal} gal: bund slab and walls, a cylindrical tank on two saddles with a hatch, a ladder and a pump pad.` : `Bunded vertical fuel tank, ${v.gal} gal: bund slab and walls, a cylindrical tank with a conical roof, a ladder and a pump pad.`,
    vs: [['horizontal', 10000, 150, 300, 150], ['vertical', 40000, 280, 280, 300]].map(([kind, gal, w, d, h]) => [`${kind}, ${gal} gal`, w, d, h, 0, { kind, gal }]), build: fuelTank }),
];

export default [...SURFACE, ...UNDER, ...PROC, ...SUPPORT];
