/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages for a malformed spec; scripts build specs through cs-lib-field.js, which checks first */
/**
 * field.js — fields as plain data, and the compiler that turns them into sampling functions (0.8 CE.1, D1/D2).
 *
 * A field is a JSON-able tree: { t:'sphere', c:[x,y,z], r } … { t:'union', a:[…] }. Plain data so it can be sent to a worker, stored
 * in a part file and hashed. `compile(spec)` gives { f(x,y,z) (signed distance, negative inside), cls(cx,cy,cz,r,band) (is a
 * ball wholly outside/inside the band, so bake can skip it), bounds [x0,y0,z0,x1,y1,z1] (may be ±Infinity) }.
 * Only textbook formulas: primitive distances, min/max booleans, polynomial smooth minimum, offset, shell, rigid + uniform
 * scale transforms, triply periodic minimal surfaces (gyroid, Schwarz P, diamond). No clocks, no Math.random, no Math.sin.
 */
import { dsin, dcos } from './detmath.js';
import { unpackGrid, FieldError } from './grid.js';

const OUT = 1, IN = -1, MIX = 0;                        // cls results
const INF = Infinity;

// ---- constructors (each returns a spec) -----------------------------------------------------------------------------------
export const sphere = (c, r) => ({ t: 'sphere', c: [...c], r });
/** Box centred on c with half sizes `half`; `round` rounds its edges and corners with that radius. */
export const box = (c, half, round = 0) => ({ t: 'box', c: [...c], half: [...half], round });
/** Round cone from a (radius r0) to b (radius r1); r1 omitted = a capsule. */
export const capsule = (a, b, r0, r1 = r0) => ({ t: 'beam', a: [...a], b: [...b], r0, r1 });
export const cylinder = (a, b, r) => ({ t: 'cylinder', a: [...a], b: [...b], r });
/** Torus about the z axis through c: ring radius R, tube radius r. */
/**
 * Solid of revolution about the x axis: the region under the profile r(x) given as points [[x, r], …] with x increasing (a nozzle, a bottle,
 * a vase). Flat ends at the first and last x. Exact: the distance to the profile as drawn, which a chain of round cones is not (the ball at each
 * joint of `beams` bulges past a profile that narrows fast). Move or turn it with translate / rotate.
 */
export function revolve(pts) {
  if (!Array.isArray(pts) || pts.length < 2) throw new FieldError('profile', 'field: a profile needs at least two points');
  for (let i = 0; i < pts.length; i++) if (!(pts[i][1] >= 0) || (i && !(pts[i][0] > pts[i - 1][0]))) throw new FieldError('profile', 'field: a profile has x increasing and radius not negative');
  return { t: 'revolve', pts: pts.map((p) => [p[0], p[1]]) };
}
export const torus = (c, R, r) => ({ t: 'torus', c: [...c], R, r });
/** Half space: the side opposite n is inside; n·p = d is the plane. */
export const halfspace = (n, d) => ({ t: 'plane', n: [...n], d });
/**
 * Triply periodic minimal surface. kind 'gyroid' | 'schwarzp' | 'diamond'; cell = length of one period (a number or a scalar
 * field spec); wall = thickness of the sheet (mode 'sheet') — or mode 'network' makes one of the two labyrinths solid (iso shifts
 * the wall). The distance is the first-order estimate g/|∇g|, accurate at the surface. `bounds` [x0,y0,z0,x1,y1,z1] intersects it with that box (a field with no finite box cannot be baked).
 */
export function tpms(kind, cell, wall, { mode = 'sheet', iso = 0, bounds = null } = {}) {
  const raw = { t: 'tpms', kind, cell, wall, mode, iso };
  if (!bounds) return raw;
  return intersect(raw, box([(bounds[0] + bounds[3]) / 2, (bounds[1] + bounds[4]) / 2, (bounds[2] + bounds[5]) / 2], [(bounds[3] - bounds[0]) / 2, (bounds[4] - bounds[1]) / 2, (bounds[5] - bounds[2]) / 2]));
}
export const grid = (g) => ({ t: 'grid', g });
export const union = (...a) => ({ t: 'union', a: a.flat() });
export const intersect = (...a) => ({ t: 'intersect', a: a.flat() });
export const subtract = (a, ...b) => ({ t: 'subtract', a, b: b.flat() });
/** Smooth union / intersection / subtraction with blend radius k (Quilez's polynomial smooth minimum). */
export const blend = (a, b, k) => ({ t: 'smooth', op: 'union', a, b, k });
export const blendIntersect = (a, b, k) => ({ t: 'smooth', op: 'intersect', a, b, k });
export const blendSubtract = (a, b, k) => ({ t: 'smooth', op: 'subtract', a, b, k });
/** Grow (d > 0) or shrink (d < 0) by d. */
export const offset = (a, d) => ({ t: 'offset', a, d });
/** Hollow shell of thickness `th`: side 'in' (default, wall inside the shape), 'out' or 'mid'. */
export const shell = (a, th, side = 'in') => ({ t: 'shell', a, th, side });
export const invert = (a) => ({ t: 'invert', a });
/** Rigid motion + uniform scale: p → s·R·p + move. `rot` is a 3×3 row-major array. */
export const transform = (a, { rot = IDENT, scale = 1, move = [0, 0, 0] } = {}) => ({ t: 'xf', a, rot: [...rot], scale, move: [...move] });
export const translate = (a, v) => transform(a, { move: v });
export const scale = (a, s, about = [0, 0, 0]) => transform(a, { scale: s, move: about.map((c) => c - s * c) });
export function rotate(a, axis, angle, about = [0, 0, 0]) {
  const R = rotationMatrix(axis, angle);
  const m = [0, 1, 2].map((r) => about[r] - (R[r * 3] * about[0] + R[r * 3 + 1] * about[1] + R[r * 3 + 2] * about[2]));
  return transform(a, { rot: R, move: m });
}
const IDENT = [1, 0, 0, 0, 1, 0, 0, 0, 1];
export function rotationMatrix(axis, angle) {
  let [x, y, z] = axis; const n = Math.sqrt(x * x + y * y + z * z); x /= n; y /= n; z /= n;
  const c = dcos(angle), s = dsin(angle), t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
}
/** A ramp or radial profile for cell size / wall (instead of a plain number): spec objects read by `scalar()`. */
export const ramp = (axis, a, b, v0, v1) => ({ t: 'ramp', axis, a, b, v0, v1 });
export const radial = (c, r0, r1, v0, v1) => ({ t: 'radialramp', c: [...c], r0, r1, v0, v1 });
/**
 * A number that follows a density map: `data` (nx·ny·nz values in 0…1 at cell centres, x fastest) over the box [x0,y0,z0,x1,y1,z1], linearly interpolated
 * between centres and held at the edge value outside; the profile is v0 + (v1 − v0)·density. For a wall that thickens where a topology result is solid.
 */
export const density = (data, n, box, v0, v1) => ({ t: 'dens', data: Float32Array.from(data), n: [...n], box: [...box], v0, v1 });
/** Beams (struts): [[ax,ay,az, bx,by,bz, r0, r1], …] unioned; binned so a big lattice stays fast. */
export const beams = (list) => ({ t: 'beams', list });

// ---- scalar profiles ------------------------------------------------------------------------------------------------------
export function scalar(s) {
  if (typeof s === 'number') return () => s;
  if (s.t === 'ramp') { const ax = s.axis, a = s.a, b = s.b, v0 = s.v0, v1 = s.v1; return (x, y, z) => { const p = ax === 0 ? x : ax === 1 ? y : z; const u = clamp01((p - a) / (b - a)); return v0 + (v1 - v0) * u; }; }
  if (s.t === 'radialramp') { const [cx, cy, cz] = s.c, r0 = s.r0, r1 = s.r1, v0 = s.v0, v1 = s.v1; return (x, y, z) => { const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz)); const u = clamp01((d - r0) / (r1 - r0)); return v0 + (v1 - v0) * u; }; }
  if (s.t === 'dens') {
    const [nx, ny, nz] = s.n, D = s.data, [x0, y0, z0, x1, y1, z1] = s.box, v0 = s.v0, v1 = s.v1;
    const ax = (x, lo, hi, n) => { const u = n > 1 ? (x - lo) / (hi - lo) * n - 0.5 : 0; const c = u < 0 ? 0 : u > n - 1 ? n - 1 : u; const i = Math.min(n - 2 < 0 ? 0 : n - 2, Math.floor(c)); return [i, n > 1 ? c - i : 0]; };
    return (x, y, z) => {
      const [i, fx] = ax(x, x0, x1, nx), [j, fy] = ax(y, y0, y1, ny), [k, fz] = ax(z, z0, z1, nz);
      const i1 = nx > 1 ? i + 1 : 0, j1 = ny > 1 ? j + 1 : 0, k1 = nz > 1 ? k + 1 : 0, at = (a, b, c) => D[a + nx * (b + ny * c)];
      const d00 = at(i, j, k) * (1 - fx) + at(i1, j, k) * fx, d10 = at(i, j1, k) * (1 - fx) + at(i1, j1, k) * fx, d01 = at(i, j, k1) * (1 - fx) + at(i1, j, k1) * fx, d11 = at(i, j1, k1) * (1 - fx) + at(i1, j1, k1) * fx;
      const d = (d00 * (1 - fy) + d10 * fy) * (1 - fz) + (d01 * (1 - fy) + d11 * fy) * fz;
      return v0 + (v1 - v0) * d;
    };
  }
  if (s.t === 'sampled') { const g = s.g || unpacked(s); return (x, y, z) => g.sample(x, y, z); }   // a Grid used as a scalar map (density → cell size)
  throw new Error('field: unknown scalar profile ' + s.t);
}
/** A grid leaf may carry its bricks as plain data (`pack`, from a script value or a saved part): unpack once per spec object. */
const UNPACKED = new WeakMap();
function unpacked(spec) { let g = UNPACKED.get(spec); if (!g) UNPACKED.set(spec, (g = unpackGrid(spec.pack))); return g; }
const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);

// ---- compile --------------------------------------------------------------------------------------------------------------
const leaf = (f, lip, bounds) => ({
  f, bounds,
  cls(cx, cy, cz, r, band) { const v = f(cx, cy, cz), d = lip * r; return v - d > band ? OUT : v + d < -band ? IN : MIX; },
});
const boxBounds = (c, e) => [c[0] - e, c[1] - e, c[2] - e, c[0] + e, c[1] + e, c[2] + e];
const mergeBounds = (list) => { const b = [INF, INF, INF, -INF, -INF, -INF]; for (const q of list) for (let a = 0; a < 3; a++) { if (q[a] < b[a]) b[a] = q[a]; if (q[a + 3] > b[a + 3]) b[a + 3] = q[a + 3]; } return b; };
const cutBounds = (list) => { const b = [-INF, -INF, -INF, INF, INF, INF]; for (const q of list) for (let a = 0; a < 3; a++) { if (q[a] > b[a]) b[a] = q[a]; if (q[a + 3] < b[a + 3]) b[a + 3] = q[a + 3]; } return b; };

export function compile(spec) {
  switch (spec.t) {
    case 'sphere': {
      const [cx, cy, cz] = spec.c, r = spec.r;
      return leaf((x, y, z) => Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz)) - r, 1, boxBounds(spec.c, r));
    }
    case 'box': {
      const [cx, cy, cz] = spec.c, [hx, hy, hz] = spec.half, rd = spec.round || 0;
      const ix = hx - rd, iy = hy - rd, iz = hz - rd;
      return leaf((x, y, z) => {
        const qx = Math.abs(x - cx) - ix, qy = Math.abs(y - cy) - iy, qz = Math.abs(z - cz) - iz;
        const ox = qx > 0 ? qx : 0, oy = qy > 0 ? qy : 0, oz = qz > 0 ? qz : 0;
        const inner = Math.max(qx, qy, qz);
        return Math.sqrt(ox * ox + oy * oy + oz * oz) + (inner < 0 ? inner : 0) - rd;
      }, 1, [cx - hx, cy - hy, cz - hz, cx + hx, cy + hy, cz + hz]);
    }
    case 'beam': return beamNode(spec);
    case 'cylinder': {
      const [ax, ay, az] = spec.a, [bx, by, bz] = spec.b, r = spec.r;
      const dx = bx - ax, dy = by - ay, dz = bz - az, L2 = dx * dx + dy * dy + dz * dz, L = Math.sqrt(L2), hl = L / 2;
      const ux = dx / L, uy = dy / L, uz = dz / L, mx = (ax + bx) / 2, my = (ay + by) / 2, mz = (az + bz) / 2;
      return leaf((x, y, z) => {
        const px = x - mx, py = y - my, pz = z - mz, t = px * ux + py * uy + pz * uz;
        const rx = px - t * ux, ry = py - t * uy, rz = pz - t * uz;
        const dr = Math.sqrt(rx * rx + ry * ry + rz * rz) - r, dt = Math.abs(t) - hl;
        const o1 = dr > 0 ? dr : 0, o2 = dt > 0 ? dt : 0;
        return Math.sqrt(o1 * o1 + o2 * o2) + Math.min(Math.max(dr, dt), 0);
      }, 1, boxBounds([mx, my, mz], hl + r));
    }
    case 'torus': {
      const [cx, cy, cz] = spec.c, R = spec.R, r = spec.r;
      return leaf((x, y, z) => { const px = x - cx, py = y - cy, pz = z - cz; const q = Math.sqrt(px * px + py * py) - R; return Math.sqrt(q * q + pz * pz) - r; }, 1,
        [cx - R - r, cy - R - r, cz - r, cx + R + r, cy + R + r, cz + r]);
    }
    case 'plane': {
      let [nx, ny, nz] = spec.n; const n = Math.sqrt(nx * nx + ny * ny + nz * nz); nx /= n; ny /= n; nz /= n; const d = spec.d / n;
      return leaf((x, y, z) => nx * x + ny * y + nz * z - d, 1, [-INF, -INF, -INF, INF, INF, INF]);
    }
    case 'grid': {
      const g = spec.g || unpacked(spec), wb = g.worldBox();
      const pad = g.bw;
      return { f: (x, y, z) => g.sample(x, y, z), bounds: wb ? [wb[0] - pad, wb[1] - pad, wb[2] - pad, wb[3] + pad, wb[4] + pad, wb[5] + pad] : [INF, INF, INF, -INF, -INF, -INF],
        cls(cx, cy, cz, r, band) { if (!wb) return OUT; const v = g.sample(cx, cy, cz); return v - r > band ? OUT : v + r < -band ? IN : MIX; } };
    }
    case 'revolve': {
      const P = spec.pts, n = P.length;
      let rmax = 0; for (const q of P) rmax = Math.max(rmax, q[1]);
      const segs = [[P[0][0], 0, P[0][0], P[0][1]]];                                 // the flat first end
      for (let i = 0; i + 1 < n; i++) segs.push([P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]]);
      segs.push([P[n - 1][0], P[n - 1][1], P[n - 1][0], 0]);                         // the flat last end
      const f = (x, y, z) => {
        const rho = Math.sqrt(y * y + z * z);
        let d2 = INF;
        for (let i = 0; i < segs.length; i++) {
          const s0 = segs[i], ax = s0[0], ay = s0[1], dx = s0[2] - ax, dy = s0[3] - ay, L2 = dx * dx + dy * dy;
          const px = x - ax, py = rho - ay;
          let t = L2 > 0 ? (px * dx + py * dy) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const qx = px - t * dx, qy = py - t * dy, q2 = qx * qx + qy * qy;
          if (q2 < d2) d2 = q2;
        }
        let inside = false;
        if (x >= P[0][0] && x <= P[n - 1][0]) {
          let i = 0; while (i + 2 < n && x > P[i + 1][0]) i++;
          const u = (x - P[i][0]) / (P[i + 1][0] - P[i][0]), r = P[i][1] + (P[i + 1][1] - P[i][1]) * u;
          inside = rho <= r;
        }
        const d = Math.sqrt(d2);
        return inside ? -d : d;
      };
      return leaf(f, 1, [P[0][0], -rmax, -rmax, P[n - 1][0], rmax, rmax]);
    }
    case 'tpms': return tpmsNode(spec);
    case 'beams': return beamsNode(spec);
    case 'union': {
      const k = spec.a.map(compile), fs = k.map((n) => n.f), n = fs.length;
      return {
        f: n === 2 ? (x, y, z) => Math.min(fs[0](x, y, z), fs[1](x, y, z)) : (x, y, z) => { let m = INF; for (let i = 0; i < n; i++) { const v = fs[i](x, y, z); if (v < m) m = v; } return m; },
        bounds: mergeBounds(k.map((q) => q.bounds)),
        cls(cx, cy, cz, r, band) { let allOut = true; for (let i = 0; i < n; i++) { const c = k[i].cls(cx, cy, cz, r, band); if (c === IN) return IN; if (c !== OUT) allOut = false; } return allOut ? OUT : MIX; },
      };
    }
    case 'intersect': {
      const k = spec.a.map(compile), fs = k.map((n) => n.f), n = fs.length;
      return {
        f: (x, y, z) => { let m = -INF; for (let i = 0; i < n; i++) { const v = fs[i](x, y, z); if (v > m) m = v; } return m; },
        bounds: cutBounds(k.map((q) => q.bounds)),
        cls(cx, cy, cz, r, band) { let allIn = true; for (let i = 0; i < n; i++) { const c = k[i].cls(cx, cy, cz, r, band); if (c === OUT) return OUT; if (c !== IN) allIn = false; } return allIn ? IN : MIX; },
      };
    }
    case 'subtract': {
      const a = compile(spec.a), bs = spec.b.map(compile), fb = bs.map((n) => n.f), nb = fb.length, fa = a.f;
      return {
        f: (x, y, z) => { let m = fa(x, y, z); for (let i = 0; i < nb; i++) { const v = -fb[i](x, y, z); if (v > m) m = v; } return m; },
        bounds: a.bounds,
        cls(cx, cy, cz, r, band) {
          const ca = a.cls(cx, cy, cz, r, band); if (ca === OUT) return OUT;
          let allIn = ca === IN;
          for (let i = 0; i < nb; i++) { const c = bs[i].cls(cx, cy, cz, r, band); if (c === IN) return OUT; if (c !== OUT) allIn = false; }
          return allIn ? IN : MIX;
        },
      };
    }
    case 'smooth': {
      const A = compile(spec.a), B = compile(spec.b), fa = A.f, fb = B.f, k = spec.k, op = spec.op;
      const f = op === 'union'
        ? (x, y, z) => smin(fa(x, y, z), fb(x, y, z), k)
        : op === 'intersect' ? (x, y, z) => -smin(-fa(x, y, z), -fb(x, y, z), k) : (x, y, z) => -smin(-fa(x, y, z), fb(x, y, z), k);
      const grow = k * 0.25;                             // a smooth union dips at most k/4 below the plain one
      return {
        f,
        bounds: op === 'union' ? mergeBounds([A.bounds, B.bounds]).map((v, i) => (i < 3 ? v - grow : v + grow)) : A.bounds,
        cls(cx, cy, cz, r, band) {
          const ca = A.cls(cx, cy, cz, r, band + grow), cb = B.cls(cx, cy, cz, r, band + grow);
          if (op === 'union') return ca === OUT && cb === OUT ? OUT : MIX;
          if (op === 'intersect') return ca === OUT || cb === OUT ? OUT : MIX;
          return ca === OUT ? OUT : MIX;
        },
      };
    }
    case 'offset': {
      const A = compile(spec.a), fa = A.f, d = spec.d;
      return { f: (x, y, z) => fa(x, y, z) - d, bounds: A.bounds.map((v, i) => (i < 3 ? v - d : v + d)), cls: (cx, cy, cz, r, band) => A.cls(cx, cy, cz, r, band + d) };
    }
    case 'shell': {
      const A = compile(spec.a), fa = A.f, th = spec.th, side = spec.side || 'in';
      const f = side === 'mid' ? (x, y, z) => Math.abs(fa(x, y, z)) - th / 2 : side === 'out' ? (x, y, z) => { const v = fa(x, y, z); return Math.max(-v, v - th); } : (x, y, z) => { const v = fa(x, y, z); return Math.max(v, -v - th); };
      const pad = side === 'out' ? th : side === 'mid' ? th / 2 : 0;
      return { f, bounds: A.bounds.map((v, i) => (i < 3 ? v - pad : v + pad)), cls(cx, cy, cz, r, band) {
        // outside the shape by more than the wall, or deep inside it (for every side the wall's value there is |v| − something, past the band): not near the surface.
        // Without the deep-inside case the whole cavity of a hollow part was baked brick by brick (8.9 million bricks, 18 GB, for a 200 mm ball at 0.1 mm).
        const c = A.cls(cx, cy, cz, r, band + th + pad); return c === OUT || c === IN ? OUT : MIX;
      } };
    }
    case 'invert': {
      const A = compile(spec.a), fa = A.f;
      return { f: (x, y, z) => -fa(x, y, z), bounds: [-INF, -INF, -INF, INF, INF, INF], cls(cx, cy, cz, r, band) { const c = A.cls(cx, cy, cz, r, band); return c === OUT ? IN : c === IN ? OUT : MIX; } };
    }
    case 'xf': {
      const A = compile(spec.a), fa = A.f, s = spec.scale, R = spec.rot, m = spec.move;
      const inv = (x, y, z) => { const px = x - m[0], py = y - m[1], pz = z - m[2]; return [(R[0] * px + R[3] * py + R[6] * pz) / s, (R[1] * px + R[4] * py + R[7] * pz) / s, (R[2] * px + R[5] * py + R[8] * pz) / s]; };
      const fwd = (x, y, z) => [s * (R[0] * x + R[1] * y + R[2] * z) + m[0], s * (R[3] * x + R[4] * y + R[5] * z) + m[1], s * (R[6] * x + R[7] * y + R[8] * z) + m[2]];
      const b = A.bounds; let nb;
      if (b.every(Number.isFinite)) {
        nb = [INF, INF, INF, -INF, -INF, -INF];
        for (let i = 0; i < 8; i++) { const p = fwd(b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]); for (let a = 0; a < 3; a++) { if (p[a] < nb[a]) nb[a] = p[a]; if (p[a] > nb[a + 3]) nb[a + 3] = p[a]; } }
      } else nb = [-INF, -INF, -INF, INF, INF, INF];
      return {
        f: (x, y, z) => { const p = inv(x, y, z); return fa(p[0], p[1], p[2]) * s; }, bounds: nb,
        cls(cx, cy, cz, r, band) { const p = inv(cx, cy, cz); return A.cls(p[0], p[1], p[2], r / s, band / s); },
      };
    }
    default: throw new Error('field: unknown field type ' + spec.t);
  }
}

function smin(a, b, k) {                                 // polynomial smooth minimum
  if (!(k > 0)) return Math.min(a, b);
  const h0 = 0.5 + 0.5 * (b - a) / k, hh = h0 < 0 ? 0 : h0 > 1 ? 1 : h0;
  return b + (a - b) * hh - k * hh * (1 - hh);
}

function beamNode(spec) {
  const [ax, ay, az] = spec.a, [bx, by, bz] = spec.b, r0 = spec.r0, r1 = spec.r1;
  const dx = bx - ax, dy = by - ay, dz = bz - az, L2 = dx * dx + dy * dy + dz * dz;
  const f = L2 === 0 ? (x, y, z) => Math.sqrt((x - ax) * (x - ax) + (y - ay) * (y - ay) + (z - az) * (z - az)) - Math.max(r0, r1)
    : (x, y, z) => {
      const px = x - ax, py = y - ay, pz = z - az;
      let t = (px * dx + py * dy + pz * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = px - t * dx, qy = py - t * dy, qz = pz - t * dz;
      return Math.sqrt(qx * qx + qy * qy + qz * qz) - (r0 + (r1 - r0) * t);   // exact for a capsule, a close estimate for a cone
    };
  const R = Math.max(r0, r1);
  return leaf(f, 1.0 + Math.abs(r1 - r0) / Math.sqrt(L2 || 1), [Math.min(ax, bx) - R, Math.min(ay, by) - R, Math.min(az, bz) - R, Math.max(ax, bx) + R, Math.max(ay, by) + R, Math.max(az, bz) + R]);
}

/** Many beams, binned on a coarse lattice so each sample only looks at the nearby ones. */
function beamsNode(spec) {
  const list = spec.list, n = list.length;
  if (!n) return { f: () => INF, bounds: [INF, INF, INF, -INF, -INF, -INF], cls: () => OUT };
  const bb = [INF, INF, INF, -INF, -INF, -INF];
  let maxR = 0;
  for (const s of list) { const R = Math.max(s[6], s[7]); maxR = Math.max(maxR, R); for (let a = 0; a < 3; a++) { bb[a] = Math.min(bb[a], s[a], s[a + 3]); bb[a + 3] = Math.max(bb[a + 3], s[a], s[a + 3]); } }
  let meanLen = 0; for (const s of list) meanLen += Math.sqrt((s[3] - s[0]) ** 2 + (s[4] - s[1]) ** 2 + (s[5] - s[2]) ** 2);
  const cell = Math.max(meanLen / n, maxR * 2, 1e-9) * 2;     // bin size ≈ two typical beam lengths
  const reach = cell;                                         // a sample looks at the 27 bins around it; beams are entered in every bin they touch ± reach
  const bins = new Map();
  const bkey = (i, j, k) => (i + 4096) * 16777216 + (j + 4096) * 4096 + (k + 4096);
  list.forEach((s, idx) => {
    const lo = [0, 1, 2].map((a) => Math.floor((Math.min(s[a], s[a + 3]) - Math.max(s[6], s[7]) - reach) / cell));
    const hi = [0, 1, 2].map((a) => Math.floor((Math.max(s[a], s[a + 3]) + Math.max(s[6], s[7]) + reach) / cell));
    for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) { const q = bkey(i, j, k); let l = bins.get(q); if (!l) bins.set(q, (l = [])); l.push(idx); }
  });
  const dist = (s, x, y, z) => {
    const ax = s[0], ay = s[1], az = s[2], dx = s[3] - ax, dy = s[4] - ay, dz = s[5] - az, L2 = dx * dx + dy * dy + dz * dz;
    const px = x - ax, py = y - ay, pz = z - az;
    let t = L2 ? (px * dx + py * dy + pz * dz) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = px - t * dx, qy = py - t * dy, qz = pz - t * dz;
    return Math.sqrt(qx * qx + qy * qy + qz * qz) - (s[6] + (s[7] - s[6]) * t);
  };
  const far = reach;                                          // beyond this from every beam: report +far (a valid lower bound inside the band checks below)
  const f = (x, y, z) => {
    const l = bins.get(bkey(Math.floor(x / cell), Math.floor(y / cell), Math.floor(z / cell)));
    if (!l) return far;
    let m = far;
    for (let i = 0; i < l.length; i++) { const v = dist(list[l[i]], x, y, z); if (v < m) m = v; }
    return m;
  };
  return {
    f, bounds: [bb[0] - maxR, bb[1] - maxR, bb[2] - maxR, bb[3] + maxR, bb[4] + maxR, bb[5] + maxR],
    cls(cx, cy, cz, r, band) { return band + r < reach && !bins.get(bkey(Math.floor(cx / cell), Math.floor(cy / cell), Math.floor(cz / cell))) ? OUT : MIX; },
  };
}

/**
 * The phase map of a graded TPMS: world point → the point (X, Y, Z) in the surface's own period-2π coordinates. A plain number
 * is X = 2π·p/cell. A ramp (cell size changing along one axis) integrates the local frequency along that axis and scales the
 * other two by it; a radial ramp does the same along the radius. The cell size is interpolated in 1/cell (so the frequency is linear
 * and the integral needs no logarithm): the end values are exact, the sizes between are harmonic. Anything else (a sampled
 * map) falls back to scaling by the local frequency, which is crude where it changes fast.
 */
function phaseMap(cell) {
  const TWO_PI = 2 * 3.141592653589793;
  if (typeof cell === 'number') return { fixed: true, cellAt: () => cell, psi(x, y, z, o) { const k = TWO_PI / cell; o[0] = x * k; o[1] = y * k; o[2] = z * k; } };
  if (cell.t === 'ramp') {
    const ax = cell.axis, a = cell.a, b = cell.b, k0 = TWO_PI / cell.v0, k1 = TWO_PI / cell.v1, L = b - a;
    return {
      fixed: false,
      cellAt(x, y, z) { const p = ax === 0 ? x : ax === 1 ? y : z, u = clamp01((p - a) / L); return TWO_PI / (k0 + (k1 - k0) * u); },
      psi(x, y, z, o) {
        const p = ax === 0 ? x : ax === 1 ? y : z, u = clamp01((p - a) / L), k = k0 + (k1 - k0) * u;
        // phase along the axis: ∫k dp, with k constant outside the ramp
        const q = p < a ? k0 * (p - a) : p > b ? 0.5 * (k0 + k1) * L + k1 * (p - b) : k0 * (p - a) + 0.5 * (k1 - k0) * (p - a) * (p - a) / L;
        o[ax] = q; o[(ax + 1) % 3] = (ax === 0 ? y : ax === 1 ? z : x) * k; o[(ax + 2) % 3] = (ax === 0 ? z : ax === 1 ? x : y) * k;
      },
    };
  }
  if (cell.t === 'radialramp') {
    const [cx, cy, cz] = cell.c, r0 = cell.r0, r1 = cell.r1, k0 = TWO_PI / cell.v0, k1 = TWO_PI / cell.v1, L = r1 - r0;
    return {
      fixed: false,
      cellAt(x, y, z) { const r = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz)), u = clamp01((r - r0) / L); return TWO_PI / (k0 + (k1 - k0) * u); },
      psi(x, y, z, o) {
        const dx = x - cx, dy = y - cy, dz = z - cz, r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const q = r < r0 ? k0 * r : r > r1 ? k0 * r0 + 0.5 * (k0 + k1) * L + k1 * (r - r1) : k0 * r0 + k0 * (r - r0) + 0.5 * (k1 - k0) * (r - r0) * (r - r0) / L;
        const s = r > 1e-12 ? q / r : k0;
        o[0] = dx * s; o[1] = dy * s; o[2] = dz * s;
      },
    };
  }
  const cf = scalar(cell);
  return { fixed: false, cellAt: cf, psi(x, y, z, o) { const k = TWO_PI / cf(x, y, z); o[0] = x * k; o[1] = y * k; o[2] = z * k; } };
}

function tpmsNode(spec) {
  const kind = spec.kind, wallF = scalar(spec.wall), mode = spec.mode, iso = spec.iso;
  if (!['gyroid', 'schwarzp', 'diamond'].includes(kind)) throw new Error('field: unknown TPMS ' + kind);
  const pm = phaseMap(spec.cell), O = [0, 0, 0], O1 = [0, 0, 0], O2 = [0, 0, 0];
  const G = [0, 0, 0, 0];                               // g − iso and its gradient in period coordinates, written by gev()
  const gev = (X, Y, Z) => {
    const sx = dsin(X), cx = dcos(X), sy = dsin(Y), cy = dcos(Y), sz = dsin(Z), cz = dcos(Z);
    if (kind === 'gyroid') { G[0] = sx * cy + sy * cz + sz * cx; G[1] = cx * cy - sz * sx; G[2] = -sx * sy + cy * cz; G[3] = -sy * sz + cz * cx; }
    else if (kind === 'schwarzp') { G[0] = cx + cy + cz; G[1] = -sx; G[2] = -sy; G[3] = -sz; }
    else {
      G[0] = sx * sy * sz + sx * cy * cz + cx * sy * cz + cx * cy * sz;
      G[1] = cx * sy * sz + cx * cy * cz - sx * sy * cz - sx * cy * sz;
      G[2] = sx * cy * sz - sx * sy * cz + cx * cy * cz - cx * sy * sz;
      G[3] = sx * sy * cz - sx * cy * sz - cx * sy * sz + cx * cy * cz;
    }
    G[0] -= iso;
  };
  const W = [0, 0, 0, 0];                               // g − iso and the gradient in world units, written by ev()
  const ev = (x, y, z) => {
    pm.psi(x, y, z, O); gev(O[0], O[1], O[2]);
    W[0] = G[0];
    if (pm.fixed) { const kk = 2 * 3.141592653589793 / pm.cellAt(); W[1] = G[1] * kk; W[2] = G[2] * kk; W[3] = G[3] * kk; return; }
    // chain rule through the phase map: ∇g(world) = Jᵀ ∇g(period), J by central differences
    const e = 0.01 * pm.cellAt(x, y, z), J = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    pm.psi(x + e, y, z, O1); pm.psi(x - e, y, z, O2); for (let r = 0; r < 3; r++) J[r * 3] = (O1[r] - O2[r]) / (2 * e);
    pm.psi(x, y + e, z, O1); pm.psi(x, y - e, z, O2); for (let r = 0; r < 3; r++) J[r * 3 + 1] = (O1[r] - O2[r]) / (2 * e);
    pm.psi(x, y, z + e, O1); pm.psi(x, y, z - e, O2); for (let r = 0; r < 3; r++) J[r * 3 + 2] = (O1[r] - O2[r]) / (2 * e);
    W[1] = J[0] * G[1] + J[3] * G[2] + J[6] * G[3]; W[2] = J[1] * G[1] + J[4] * G[2] + J[7] * G[3]; W[3] = J[2] * G[1] + J[5] * G[2] + J[8] * G[3];
  };
  const f = (x, y, z) => {
    const cell = pm.cellAt(x, y, z);
    ev(x, y, z);
    const g0 = W[0], gx = W[1], gy = W[2], gz = W[3], floor = 1e-3 * 2 * 3.141592653589793 / cell;
    let gm = Math.sqrt(gx * gx + gy * gy + gz * gz); if (gm < floor) gm = floor;
    let d = g0 / gm;
    const ad = d < 0 ? -d : d, lim = 0.3 * cell;
    if (ad < lim) {
      // Near a wall the first-order estimate g/|∇g| is off by a few percent (thin walls come out thin). Two projections onto the
      // surface (Newton steps along the gradient) give the distance to the nearest point of it; blended back to the first-order value
      // between 0.2 and 0.3 of a cell so the field stays continuous.
      let qx = x - g0 * gx / (gm * gm), qy = y - g0 * gy / (gm * gm), qz = z - g0 * gz / (gm * gm);
      ev(qx, qy, qz);
      let m2 = W[1] * W[1] + W[2] * W[2] + W[3] * W[3]; if (m2 < floor * floor) m2 = floor * floor;
      qx -= W[0] * W[1] / m2; qy -= W[0] * W[2] / m2; qz -= W[0] * W[3] / m2;
      const dx = x - qx, dy = y - qy, dz = z - qz, d2 = Math.sqrt(dx * dx + dy * dy + dz * dz) * (g0 < 0 ? -1 : 1);
      const s0 = (lim - ad) / (0.1 * cell), s = s0 > 1 ? 1 : s0;
      d += (d2 - d) * s;
    }
    return mode === 'sheet' ? Math.abs(d) - wallF(x, y, z) / 2 : d;
  };
  return { f, bounds: [-INF, -INF, -INF, INF, INF, INF], cls: () => MIX };
}

export { OUT, IN, MIX };
