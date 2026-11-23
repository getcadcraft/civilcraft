/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: numbers only; no words reach a person from this file. */
/**
 * measure.js — what one model element measures, from its triangles alone (0.11 MT.1). DOM-free; host-neutral (lib/modeltakeoff).
 *
 * The frame is the one cc-ifc streams: METRES, Y UP. An element is fed piece by piece (one placed geometry at a time), then closed:
 *
 *   const m = new Measure();
 *   m.add(verts, stride, indices, matrix)   verts: x y z (+ anything) every `stride` numbers; matrix: column-major 4×4 or null
 *   m.done() → {
 *     tris, bbox: { min: [x,y,z], max: [x,y,z] },
 *     surface   m²  every face
 *     volume    m³  the closed shells' volume, or null when a piece is not closed (an open shell has no volume: nothing is guessed)
 *     open      how many pieces were not closed
 *     plan      m²  the faces that look up (within 60° of straight up), projected on the ground: a floor's or a roof's plan area
 *     slope     m²  the same faces at their true size: a roof's surface
 *     side      m²  one side of a wall-like element: the upright faces measured square to its main face, halved (ends and opening reveals add nothing)
 *     sideExact false when a good part of the upright faces is neither along nor across the main face (a curved or cornered element):
 *               `side` is then half of all upright faces, ends and reveals included
 *     run       m   the element's extent in plan along its main face (a wall's length, end to end)
 *     thick     m   its extent in plan across the main face
 *     height    m   its extent upward
 *     long      m   its extent along its own long axis in space (a beam, a column, a sloped pipe)
 *   }
 *
 * Everything is 64-bit; triangles of no area are skipped. The closed test welds vertices that sit within WELD of each other and asks that
 * every edge is used once in each direction.
 */

export const WELD = 1e-5;          // m: vertices nearer than this are one (cc-ifc repeats a vertex per face for its normal)
const UP_COS = 0.5;                // a face within 60° of straight up counts as looking up
const UPRIGHT = 0.5;               // |ny| below this: an upright face (within 30° of vertical)
const OBLIQUE_SHARE = 0.1;         // more than this share of the upright faces neither along nor across the main face → not a straight wall

export class Measure {
  constructor() {
    this.tris = 0; this.surface = 0; this.vol = 0; this.open = 0; this.plan = 0; this.slope = 0;
    this.min = [Infinity, Infinity, Infinity]; this.max = [-Infinity, -Infinity, -Infinity];
    this.cxx = 0; this.cxz = 0; this.czz = 0;            // area-weighted covariance of the upright faces' horizontal normals
    this.up = [];                                        // upright faces: hx, hz (unit horizontal normal × its length), area
    this.pts = [];                                       // every (transformed) vertex once per piece, for the extents
    // the surface's second moments, for the long axis
    this.sA = 0; this.sx = 0; this.sy = 0; this.sz = 0; this.mxx = 0; this.mxy = 0; this.mxz = 0; this.myy = 0; this.myz = 0; this.mzz = 0;
  }

  add(verts, stride, indices, m = null) {
    const n = Math.floor(verts.length / stride);
    const p = new Float64Array(n * 3);
    for (let i = 0, k = 0; i < n; i++, k += 3) {
      const x = verts[i * stride], y = verts[i * stride + 1], z = verts[i * stride + 2];
      if (m) { p[k] = m[0] * x + m[4] * y + m[8] * z + m[12]; p[k + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; p[k + 2] = m[2] * x + m[6] * y + m[10] * z + m[14]; }
      else { p[k] = x; p[k + 1] = y; p[k + 2] = z; }
    }
    let vol = 0, used = 0;
    const edges = new Map(), ids = new Map(), weld = new Int32Array(n).fill(-1);
    const idOf = (i) => {
      if (weld[i] >= 0) return weld[i];
      const k = Math.round(p[i * 3] / WELD) + ',' + Math.round(p[i * 3 + 1] / WELD) + ',' + Math.round(p[i * 3 + 2] / WELD);
      let v = ids.get(k);
      if (v === undefined) { v = ids.size; ids.set(k, v); }
      return (weld[i] = v);
    };
    const edge = (a, b) => { if (a === b) return; const k = a < b ? a + '_' + b : b + '_' + a, d = a < b ? 1 : -1, e = edges.get(k); edges.set(k, e === undefined ? [d, 1] : [e[0] + d, e[1] + 1]); };
    for (let t = 0; t + 2 < indices.length; t += 3) {
      const a = indices[t] * 3, b = indices[t + 1] * 3, c = indices[t + 2] * 3;
      const ax = p[a], ay = p[a + 1], az = p[a + 2], bx = p[b], by = p[b + 1], bz = p[b + 2], cx = p[c], cy = p[c + 1], cz = p[c + 2];
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz);
      if (!(l > 1e-14)) continue;
      const A = l / 2, ux1 = nx / l, uy1 = ny / l, uz1 = nz / l;
      used++;
      this.surface += A;
      vol += (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;
      if (uy1 > UP_COS) { this.plan += A * uy1; this.slope += A; }
      if (Math.abs(uy1) < UPRIGHT) {
        const h = Math.hypot(ux1, uz1), hx = ux1 / h, hz = uz1 / h;
        this.cxx += A * hx * hx; this.cxz += A * hx * hz; this.czz += A * hz * hz;
        this.up.push(hx, hz, A);
      }
      const gx = (ax + bx + cx) / 3, gy = (ay + by + cy) / 3, gz = (az + bz + cz) / 3;
      this.sA += A; this.sx += A * gx; this.sy += A * gy; this.sz += A * gz;
      // the triangle's exact second moment: A/12 · (aaᵀ + bbᵀ + ccᵀ + ssᵀ), s = a + b + c  (so a box's axes come out as its own, whatever the triangulation)
      const k = A / 12, sx = ax + bx + cx, sy = ay + by + cy, sz = az + bz + cz;
      this.mxx += k * (ax * ax + bx * bx + cx * cx + sx * sx); this.mxy += k * (ax * ay + bx * by + cx * cy + sx * sy); this.mxz += k * (ax * az + bx * bz + cx * cz + sx * sz);
      this.myy += k * (ay * ay + by * by + cy * cy + sy * sy); this.myz += k * (ay * az + by * bz + cy * cz + sy * sz); this.mzz += k * (az * az + bz * bz + cz * cz + sz * sz);
      const ia = idOf(indices[t]), ib = idOf(indices[t + 1]), ic = idOf(indices[t + 2]);
      edge(ia, ib); edge(ib, ic); edge(ic, ia);
    }
    if (!used) return;
    this.tris += used;
    for (let i = 0; i < n; i++) {
      if (weld[i] < 0) continue;                          // a vertex no triangle with area uses
      for (let k = 0; k < 3; k++) { const v = p[i * 3 + k]; if (v < this.min[k]) this.min[k] = v; if (v > this.max[k]) this.max[k] = v; }
    }
    this.pts.push(p, weld);
    let closed = true;
    for (const e of edges.values()) if (e[0] !== 0 || e[1] % 2) { closed = false; break; }
    if (closed && this.vol !== null) this.vol += Math.abs(vol);
    else { this.open++; }
  }

  done() {
    if (!this.tris) return null;
    // the main face's normal in plan: the larger eigenvector of the upright faces' normal covariance
    let dx = 1, dz = 0, side = null, sideExact = true;
    const { cxx, cxz, czz } = this;
    const upright = cxx + czz;
    if (upright > 1e-12) {
      const ang = 0.5 * Math.atan2(2 * cxz, cxx - czz);
      dx = Math.cos(ang); dz = Math.sin(ang);
      let along = 0, oblique = 0;
      for (let i = 0; i < this.up.length; i += 3) {
        const c = Math.abs(this.up[i] * dx + this.up[i + 1] * dz), A = this.up[i + 2];
        along += A * c;
        if (c > 0.17 && c < 0.985) oblique += A;         // neither across (c ≈ 0) nor along (c ≈ 1) the main face: within 10°
      }
      sideExact = oblique <= OBLIQUE_SHARE * upright;
      side = (sideExact ? along : upright) / 2;
    }
    // extents in plan along and across the main face
    let rmin = Infinity, rmax = -Infinity, tmin = Infinity, tmax = -Infinity;
    const [ax, ay, az] = longAxis(this);
    let lmin = Infinity, lmax = -Infinity;
    for (let k = 0; k < this.pts.length; k += 2) {
      const p = this.pts[k], w = this.pts[k + 1];
      for (let i = 0; i < w.length; i++) {
        if (w[i] < 0) continue;
        const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
        const r = -dz * x + dx * z, t = dx * x + dz * z, l = ax * x + ay * y + az * z;
        if (r < rmin) rmin = r; if (r > rmax) rmax = r;
        if (t < tmin) tmin = t; if (t > tmax) tmax = t;
        if (l < lmin) lmin = l; if (l > lmax) lmax = l;
      }
    }
    return {
      tris: this.tris, bbox: { min: [...this.min], max: [...this.max] },
      surface: this.surface, volume: this.open ? null : this.vol, open: this.open,
      plan: this.plan, slope: this.slope, side, sideExact,
      run: rmax - rmin, thick: tmax - tmin, height: this.max[1] - this.min[1], long: lmax - lmin,
    };
  }
}

/** The long axis: the eigenvector of the largest eigenvalue of the surface's covariance (Jacobi rotations on a 3×3). */
function longAxis(s) {
  if (!(s.sA > 0)) return [1, 0, 0];
  const mx = s.sx / s.sA, my = s.sy / s.sA, mz = s.sz / s.sA;
  const a = [[s.mxx / s.sA - mx * mx, s.mxy / s.sA - mx * my, s.mxz / s.sA - mx * mz], [0, s.myy / s.sA - my * my, s.myz / s.sA - my * mz], [0, 0, s.mzz / s.sA - mz * mz]];
  a[1][0] = a[0][1]; a[2][0] = a[0][2]; a[2][1] = a[1][2];
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 24; sweep++) {
    let off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
    if (off < 1e-18) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), sn = t * c;
      for (let k = 0; k < 3; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - sn * akq; a[k][q] = sn * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - sn * aqk; a[q][k] = sn * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - sn * vkq; v[k][q] = sn * vkp + c * vkq; }
    }
  }
  let best = 0;
  for (let k = 1; k < 3; k++) if (a[k][k] > a[best][best]) best = k;
  return [v[0][best], v[1][best], v[2][best]];
}

/** A box, a prism or any test shape as { verts (x y z), indices } helpers live in the tests; this one measures a ready mesh in one call. */
export function measureMesh(verts, indices, { stride = 3, matrix = null } = {}) {
  const m = new Measure();
  m.add(verts, stride, indices, matrix);
  return m.done();
}
