/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages; the script layer maps the error code to words (cs-lib-field.js) */
/**
 * mesh-sdf.js — a closed triangle mesh → a Grid (0.8 CE.1).
 *
 * Distance: exact point–triangle distance (closest point by Voronoi regions, Ericson, Real-Time Collision Detection 5.1.5),
 * for every node within the band of a triangle. Sign: the angle-weighted pseudo-normal of the closest feature (face, edge or
 * vertex), Bærentzen & Aanæs 2005 — right on a closed manifold mesh, however sharp. Bricks that no triangle comes near are
 * inside or outside by parity of a ray along +x (the same inside test voxel.js uses, one ray per row of bricks).
 * Vertices are welded by position first, so a mesh with split vertices (flat shading, per-face normals) still has edges.
 */
import { Grid, keyOf, BN, FieldError } from './grid.js';

function weld(mesh) {
  const P = mesh.positions, I = mesh.indices, map = new Map(), pos = [], idx = new Int32Array(I.length);
  for (let n = 0; n < I.length; n++) {
    const v = I[n], x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2], key = x + ',' + y + ',' + z;
    let w = map.get(key);
    if (w === undefined) { w = pos.length / 3; map.set(key, w); pos.push(x, y, z); }
    idx[n] = w;
  }
  return { P: Float64Array.from(pos), I: idx };
}

export function fromMesh(mesh, { h, band = 3 } = {}) {
  if (!(h > 0)) throw new FieldError('h', 'field: voxel size must be positive');
  const { P, I } = weld(mesh), nt = I.length / 3, bw = band * h;
  // face normals, vertex angle-weighted pseudo-normals, edge pseudo-normals
  const FN = new Float64Array(nt * 3), VN = new Float64Array(P.length), EN = new Map();
  const ekey = (a, b) => (a < b ? a * 4294967296 + b : b * 4294967296 + a);
  const degenerate = new Uint8Array(nt);
  for (let t = 0; t < nt; t++) {
    const a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2];
    const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
    const vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (!(l > 0)) { degenerate[t] = 1; continue; }
    nx /= l; ny /= l; nz /= l; FN[t * 3] = nx; FN[t * 3 + 1] = ny; FN[t * 3 + 2] = nz;
    const tri = [a, b, c];
    for (let q = 0; q < 3; q++) {
      const p0 = tri[q], p1 = tri[(q + 1) % 3], p2 = tri[(q + 2) % 3];
      const e1x = P[p1 * 3] - P[p0 * 3], e1y = P[p1 * 3 + 1] - P[p0 * 3 + 1], e1z = P[p1 * 3 + 2] - P[p0 * 3 + 2];
      const e2x = P[p2 * 3] - P[p0 * 3], e2y = P[p2 * 3 + 1] - P[p0 * 3 + 1], e2z = P[p2 * 3 + 2] - P[p0 * 3 + 2];
      const l1 = Math.sqrt(e1x * e1x + e1y * e1y + e1z * e1z), l2 = Math.sqrt(e2x * e2x + e2y * e2y + e2z * e2z);
      const cs = (e1x * e2x + e1y * e2y + e1z * e2z) / (l1 * l2);
      const ang = Math.acos(cs < -1 ? -1 : cs > 1 ? 1 : cs);        // only the weight of the vertex normal; any monotone weight is fine for the sign
      VN[p0 * 3] += ang * nx; VN[p0 * 3 + 1] += ang * ny; VN[p0 * 3 + 2] += ang * nz;
      const k = ekey(p0, p1); let e = EN.get(k); if (!e) EN.set(k, (e = [0, 0, 0]));
      e[0] += nx; e[1] += ny; e[2] += nz;
    }
  }
  // bin triangles by brick
  const lists = new Map();
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let t = 0; t < nt; t++) {
    if (degenerate[t]) continue;
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let c = 0; c < 3; c++) for (let a = 0; a < 3; a++) { const v = P[I[t * 3 + c] * 3 + a]; if (v < mn[a]) mn[a] = v; if (v > mx[a]) mx[a] = v; }
    const b0 = [0, 1, 2].map((a) => Math.floor((mn[a] - bw) / h / 8)), b1 = [0, 1, 2].map((a) => Math.floor((mx[a] + bw) / h / 8));
    for (let a = 0; a < 3; a++) { if (b0[a] < lo[a]) lo[a] = b0[a]; if (b1[a] > hi[a]) hi[a] = b1[a]; }
    for (let bx = b0[0]; bx <= b1[0]; bx++) for (let by = b0[1]; by <= b1[1]; by++) for (let bz = b0[2]; bz <= b1[2]; bz++) {
      const k = keyOf(bx, by, bz); let l = lists.get(k); if (!l) lists.set(k, (l = [])); l.push(t);
    }
  }
  const g = new Grid(h, band);
  if (!lists.size) return g;
  const keys = [...lists.keys()].sort((a, b) => a - b);
  const q = [0, 0, 0, 0, 0, 0, 0];
  for (const key of keys) {
    const tris = lists.get(key), bz = key % 131072, rest = (key - bz) / 131072, by = rest % 131072, bx = (rest - by) / 131072;
    const x0 = (bx - 65536) * 8, y0 = (by - 65536) * 8, z0 = (bz - 65536) * 8;
    const arr = new Float32Array(BN);
    let n = 0;
    for (let k = 0; k < 8; k++) for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++, n++) {
      const px = (x0 + i) * h, py = (y0 + j) * h, pz = (z0 + k) * h;
      let best = Infinity, bt = -1, bq = 0;
      for (const t of tris) {
        closest(px, py, pz, P, I[t * 3] * 3, I[t * 3 + 1] * 3, I[t * 3 + 2] * 3, q);
        if (q[0] < best) { best = q[0]; bt = t; bq = q[1]; }
      }
      if (bt < 0 || !(best < Infinity)) { arr[n] = bw; continue; }
      const d = Math.sqrt(best);
      // pseudo-normal of the feature the closest point lies on
      const a = I[bt * 3], b = I[bt * 3 + 1], c = I[bt * 3 + 2];
      let nx, ny, nz;
      switch (bq) {
        case 1: nx = VN[a * 3]; ny = VN[a * 3 + 1]; nz = VN[a * 3 + 2]; break;
        case 2: nx = VN[b * 3]; ny = VN[b * 3 + 1]; nz = VN[b * 3 + 2]; break;
        case 3: nx = VN[c * 3]; ny = VN[c * 3 + 1]; nz = VN[c * 3 + 2]; break;
        case 4: { const e = EN.get(ekey(a, b)); nx = e[0]; ny = e[1]; nz = e[2]; break; }
        case 5: { const e = EN.get(ekey(b, c)); nx = e[0]; ny = e[1]; nz = e[2]; break; }
        case 6: { const e = EN.get(ekey(c, a)); nx = e[0]; ny = e[1]; nz = e[2]; break; }
        default: nx = FN[bt * 3]; ny = FN[bt * 3 + 1]; nz = FN[bt * 3 + 2];
      }
      // vector from the closest point to the node = p − closest; recompute the closest point once for the winner
      closest(px, py, pz, P, a * 3, b * 3, c * 3, q);
      const dx = px - q[4], dy = py - q[5], dz = pz - q[6];
      const sgn = dx * nx + dy * ny + dz * nz;
      const v = sgn < 0 ? -d : d;
      arr[n] = v > bw ? bw : v < -bw ? -bw : v;
    }
    g.setBrick(key, arr);
  }
  // bricks that no triangle comes near: inside or outside by parity of an +x ray, one ray per row of bricks
  const rowTris = new Map();
  const rowKey = (by, bz) => (by + 65536) * 131072 + (bz + 65536);
  for (let t = 0; t < nt; t++) {
    if (degenerate[t]) continue;
    let y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let c = 0; c < 3; c++) { const v = I[t * 3 + c] * 3; y0 = Math.min(y0, P[v + 1]); y1 = Math.max(y1, P[v + 1]); z0 = Math.min(z0, P[v + 2]); z1 = Math.max(z1, P[v + 2]); }
    const rows = (r0, r1) => { const out = []; for (let by = Math.floor(r0 / h / 8 - 0.5); by <= Math.floor(r1 / h / 8 + 0.5); by++) out.push(by); return out; };
    for (const by of rows(y0, y1)) for (const bz of rows(z0, z1)) { const k = rowKey(by, bz); let l = rowTris.get(k); if (!l) rowTris.set(k, (l = [])); l.push(t); }
  }
  const xs = [];
  for (let by = lo[1]; by <= hi[1]; by++) for (let bz = lo[2]; bz <= hi[2]; bz++) {
    const l = rowTris.get(rowKey(by, bz));
    if (!l) continue;
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      const y = (by * 8 + 3.5 + [1.2345e-3, -3.14159e-3, 5.7721e-3][attempt]) * h, z = (bz * 8 + 3.5 + [2.71828e-3, 1.41421e-3, -4.6692e-3][attempt]) * h;
      xs.length = 0;
      for (const t of l) {
        const a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3;
        const ay = P[a + 1] - y, az = P[a + 2] - z, byy = P[b + 1] - y, bzz = P[b + 2] - z, cy = P[c + 1] - y, cz = P[c + 2] - z;
        const w0 = byy * cz - bzz * cy, w1 = cy * az - cz * ay, w2 = ay * bzz - az * byy;
        if ((w0 > 0 && w1 > 0 && w2 > 0) || (w0 < 0 && w1 < 0 && w2 < 0)) xs.push((w0 * P[a] + w1 * P[b] + w2 * P[c]) / (w0 + w1 + w2));
      }
      ok = xs.length % 2 === 0;
    }
    if (!xs.length || xs.length % 2) continue;
    xs.sort((p, q2) => p - q2);
    for (let bx = lo[0]; bx <= hi[0]; bx++) {
      const key = keyOf(bx, by, bz);
      if (g.bricks.has(key) || lists.has(key)) continue;
      const cx = (bx * 8 + 3.5) * h;
      let c = 0; while (c < xs.length && xs[c] < cx) c++;
      if (c % 2) g.bricks.set(key, -1);
    }
  }
  return g;
}

/** out = [d², region, 0, 0, cx, cy, cz]; region 0 face, 1/2/3 vertex a/b/c, 4/5/6 edge ab/bc/ca. */
function closest(px, py, pz, P, a, b, c, out) {
  const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b], by = P[b + 1], bz = P[b + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  let reg = 0, qx, qy, qz;
  if (d1 <= 0 && d2 <= 0) { reg = 1; qx = ax; qy = ay; qz = az; }
  else {
    const bpx = px - bx, bpy = py - by, bpz = pz - bz, d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) { reg = 2; qx = bx; qy = by; qz = bz; }
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) { reg = 4; const v = d1 / (d1 - d3); qx = ax + v * abx; qy = ay + v * aby; qz = az + v * abz; }
      else {
        const cpx = px - cx, cpy = py - cy, cpz = pz - cz, d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
        if (d6 >= 0 && d5 <= d6) { reg = 3; qx = cx; qy = cy; qz = cz; }
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) { reg = 6; const w = d2 / (d2 - d6); qx = ax + w * acx; qy = ay + w * acy; qz = az + w * acz; }
          else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { reg = 5; const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); qx = bx + w * (cx - bx); qy = by + w * (cy - by); qz = bz + w * (cz - bz); }
            else { const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; qx = ax + abx * v + acx * w; qy = ay + aby * v + acy * w; qz = az + abz * v + acz * w; }
          }
        }
      }
    }
  }
  const dx = px - qx, dy = py - qy, dz = pz - qz;
  out[0] = dx * dx + dy * dy + dz * dz; out[1] = reg; out[4] = qx; out[5] = qy; out[6] = qz;
}
