/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scan-check.js — the scale and level check made on a scan when it comes in (0.10 SU.1809). DOM-free, no app imports.
 * A phone scan has no survey behind it: its unit may be metres, millimetres or feet, its up axis may be Y (the common phone and game
 * convention) and its floor may lean by a degree or two. Comparing such a scan with a model without saying so gives a wall of red, so this
 * says it first, as SUGGESTIONS the person accepts (nothing is changed here).
 *
 *   checkScan({ pos, n, modelBounds?, unit? }) → {
 *     extent: [dx, dy, dz],                    of the points as given
 *     up: { axis: 'x'|'y'|'z', sign: 1|-1, confidence: 0..1, scores: [sx, sy, sz] }   the axis along which the points lie in the sharpest layers (floor, ceiling)
 *     matrix: [16] column-major   a rotation (and the unit scale) taking the scan to Z up, metres, floor level, or null when nothing needs doing
 *     unit: { guess: 'm'|'mm'|'cm'|'ft'|'in', factor, basis: 'model'|'size'|'given', confidence }
 *     level: { tiltDeg, axisDeg, floorZ, ceilingZ, height }   the leaning of the floor layer (after the up axis is set) and the room height
 *     notes: [{ code, data }]                  codes the panel words: 'unit_suggested', 'up_axis', 'tilted', 'no_floor', 'size_odd', 'ok'
 *   }
 *   The guesses are heuristics and say so (`confidence`): a unit is guessed from the model's size when there is one (the ratio of the two
 *   extents closest to 1, 3.281, 12, 100 or 1000), else from the scan's size alone (a building is some metres to a few hundred metres across).
 *   The up axis is the one whose histogram of the points has the strongest two peaks (a floor and a ceiling, or one big floor).
 *   Not claimed: a real phone scan was not available (SU.1809 log); the thresholds are set on synthetic scans of known tilt and unit.
 */
const UNITS = [['m', 1], ['ft', 0.3048], ['in', 0.0254], ['cm', 0.01], ['mm', 0.001]];

const ext = (pos, n) => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const v = pos[3 * i + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; }
  return { mn, mx };
};

/** How layered the points are along `axis`: the share held by the two fullest bins (each `bin` wide), and where they are. */
function layers(pos, n, axis, mn, mx, bin, step) {
  const nb = Math.max(2, Math.min(20000, Math.ceil((mx[axis] - mn[axis]) / bin) + 1)), h = new Uint32Array(nb);
  let m = 0;
  for (let i = 0; i < n; i += step) { h[Math.min(nb - 1, Math.floor((pos[3 * i + axis] - mn[axis]) / bin))]++; m++; }
  // two fullest bins at least 1 m (of this scale) apart, taken with their neighbours
  const win = (b) => (h[b] + (h[b - 1] || 0) + (h[b + 1] || 0));
  let b1 = 0; for (let b = 1; b < nb; b++) if (win(b) > win(b1)) b1 = b;
  const gap = Math.max(2, Math.round(1 / bin * 0.7));
  let b2 = -1; for (let b = 0; b < nb; b++) if (Math.abs(b - b1) >= gap && (b2 < 0 || win(b) > win(b2))) b2 = b;
  const s1 = win(b1) / m, s2 = b2 >= 0 ? win(b2) / m : 0;
  return { score: s1 + s2, lo: Math.min(b1, b2 < 0 ? b1 : b2), hi: Math.max(b1, b2 < 0 ? b1 : b2), z1: mn[axis] + (b1 + 0.5) * bin, z2: b2 >= 0 ? mn[axis] + (b2 + 0.5) * bin : null, share: [s1, s2], bins: h, mn: mn[axis] };
}

export function checkScan({ pos, n, modelBounds = null, unit = null }) {
  const notes = [];
  if (!n) return { ok: false, notes: [{ code: 'empty' }] };
  const { mn, mx } = ext(pos, n), e = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
  // ---- the unit
  let uf = 1, uguess = 'm', basis = 'size', uconf = 0.5;
  if (unit && UNITS.some((u) => u[0] === unit)) { uguess = unit; uf = UNITS.find((u) => u[0] === unit)[1]; basis = 'given'; uconf = 1; }
  else {
    const big = Math.max(...e);
    if (modelBounds) {
      const me = Math.max(modelBounds.max[0] - modelBounds.min[0], modelBounds.max[1] - modelBounds.min[1], modelBounds.max[2] - modelBounds.min[2]);
      if (me > 0 && big > 0) {
        let best = null;
        for (const [name, f] of UNITS) { const r = big * f / me, err = Math.abs(Math.log(r)); if (!best || err < best.err) best = { name, f, err }; }
        uguess = best.name; uf = best.f; basis = 'model'; uconf = best.err < 0.25 ? 0.9 : best.err < 0.7 ? 0.5 : 0.2;
      }
    } else {
      // a building scan is 2 m to 600 m across in metres: pick the unit that lands there, preferring metres
      for (const [name, f] of UNITS) { const m = big * f; if (m >= 2 && m <= 600) { uguess = name; uf = f; break; } }
      uconf = uguess === 'm' ? 0.6 : 0.4;
    }
  }
  const metres = e.map((v) => v * uf);
  if (uguess !== 'm') notes.push({ code: 'unit_suggested', data: { unit: uguess, factor: uf, confidence: uconf, basis } });
  if (Math.max(...metres) < 1 || Math.max(...metres) > 2000) notes.push({ code: 'size_odd', data: { metres: Math.max(...metres) } });
  // ---- the up axis (in metres; bins of 100 mm and a window of three, so a floor that leans a few degrees still counts as one layer)
  const bin = 0.1 / uf, step = Math.max(1, Math.floor(n / 400000));
  const L = [0, 1, 2].map((a) => layers(pos, n, a, mn, mx, bin, step));
  const scores = L.map((l) => l.score);
  let axis = 2; for (let a = 0; a < 3; a++) if (scores[a] > scores[axis] + 1e-9) axis = a;
  // a tie (a flat scan along z that is nearly as layered as another axis) keeps z: change only when another axis is clearly sharper
  if (axis !== 2 && scores[axis] < scores[2] * 1.25 + 0.02) axis = 2;
  const best = Math.max(...scores);
  let conf = Math.max(0, Math.min(1, (scores[axis] - Math.max(...scores.filter((_, a) => a !== axis))) / Math.max(scores[axis], 1e-9)));
  // A room has layers on every axis (two walls each way as well as a floor), so the layers alone can mislead. Among the axes that are nearly as
  // layered as the best, a room is shorter than it is wide: the vertical axis is the one with the SMALLEST extent, when it is clearly smaller.
  const order = [0, 1, 2].filter((a) => scores[a] >= 0.6 * best).sort((p, q) => e[p] - e[q]);
  if (order.length > 1 && order[0] !== axis && e[order[0]] <= 0.85 * e[order[1]]) { axis = order[0]; conf = Math.max(conf, 0.6); }
  else if (order.length > 1 && order[0] === axis) conf = Math.max(conf, 0.5);
  // which end is the floor: the bigger of the two layers is the floor (a ceiling is cut by lights and openings), else the lower one
  const l = L[axis];
  let sign = 1;
  if (l.z2 != null) {
    const lowIsFirst = l.z1 <= l.z2, firstShare = l.share[0], secondShare = l.share[1];
    const floorIsLow = lowIsFirst ? firstShare >= secondShare * 0.7 : secondShare >= firstShare * 0.7;
    sign = floorIsLow ? 1 : -1;
  }
  // ---- a rotation to Z up, and the metres
  // R: row-major 3×3, scan (x, y, z) → Z up. Each is a proper rotation (determinant +1).
  let R = null;
  if (axis === 1) R = sign > 0 ? [1, 0, 0, 0, 0, -1, 0, 1, 0] : [1, 0, 0, 0, 0, 1, 0, -1, 0];      // Y up → Z up: (x, y, z) → (x, −z, y)
  else if (axis === 0) R = sign > 0 ? [0, 1, 0, 0, 0, 1, 1, 0, 0] : [0, 1, 0, 0, 0, -1, -1, 0, 0];  // X up → Z up
  else if (sign < 0) R = [1, 0, 0, 0, -1, 0, 0, 0, -1];                                              // Z down → Z up
  if (axis !== 2) notes.push({ code: 'up_axis', data: { axis: 'xyz'[axis], sign, confidence: conf } });
  // ---- the floor's lean (after the up axis is Z): a plane fitted through the points in the floor layer
  const up = (i) => { const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2]; return R ? [R[0] * x + R[1] * y + R[2] * z, R[3] * x + R[4] * y + R[5] * z, R[6] * x + R[7] * y + R[8] * z] : [x, y, z]; };
  const floorUp = sign > 0 ? (l.z2 == null ? l.z1 : Math.min(l.z1, l.z2)) : (l.z2 == null ? l.z1 : Math.max(l.z1, l.z2));
  // the floor plane: start from everything within 150 mm (of the scan's unit) of the floor layer, fit z' = a x' + b y' + c, then keep only the
  // points within 30 mm of that plane and fit again (three rounds), so a floor that leans across the room is followed, not cut to a strip
  const wide = 0.15 / uf, near = 0.03 / uf, cand = [];
  for (let i = 0; i < n; i += step) { const v = pos[3 * i + axis]; if (Math.abs(v - floorUp) <= wide * 1.5) cand.push(i); }
  let tiltDeg = 0, axisDeg = 0, floorZ = null, ceilingZ = null, height = null, tiltMatrix = null;
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const fit = (idx) => {
    let sxx = 0, sxy = 0, syy = 0, sx1 = 0, sy1 = 0, s1 = 0, sxz = 0, syz = 0, sz1 = 0;
    // centre first: the fit then is well conditioned however far from the origin the scan sits
    let cx = 0, cy = 0;
    for (const i of idx) { const p = up(i); cx += p[0]; cy += p[1]; }
    cx /= idx.length; cy /= idx.length;
    for (const i of idx) { const p = up(i), x = p[0] - cx, y = p[1] - cy; sxx += x * x; sxy += x * y; syy += y * y; sx1 += x; sy1 += y; s1++; sxz += x * p[2]; syz += y * p[2]; sz1 += p[2]; }
    const A = [[sxx, sxy, sx1], [sxy, syy, sy1], [sx1, sy1, s1]], b = [sxz, syz, sz1], D = det(A);
    if (!(Math.abs(D) > 1e-18)) return null;
    const col = (k) => A.map((r, i) => r.map((v, j) => (j === k ? b[i] : v)));
    return { a: det(col(0)) / D, b: det(col(1)) / D, c: det(col(2)) / D, cx, cy, n: s1 };
  };
  let plane = cand.length >= 50 ? fit(cand) : null;
  for (let round = 0; plane && round < 3; round++) {
    const keep = [];
    for (const i of cand) { const p = up(i); if (Math.abs(p[2] - (plane.a * (p[0] - plane.cx) + plane.b * (p[1] - plane.cy) + plane.c)) <= near) keep.push(i); }
    if (keep.length < 50) break;
    const f = fit(keep); if (!f) break; plane = f;
  }
  if (plane) {
    const a = plane.a, bb = plane.b;
    tiltDeg = Math.atan(Math.hypot(a, bb)) * 180 / Math.PI; axisDeg = Math.atan2(bb, a) * 180 / Math.PI;
    floorZ = plane.c * uf;
    if (tiltDeg > 0.3) {
      // rotate about the horizontal axis k = n × z so the plane's normal n = (−a, −b, 1) becomes (0, 0, 1) (Rodrigues' formula)
      const nx = -a, ny = -bb, nz = 1, nl = Math.hypot(nx, ny, nz), ux = nx / nl, uy = ny / nl, uz = nz / nl;
      const ax = uy, ay = -ux, al = Math.hypot(ax, ay) || 1, kx = ax / al, ky = ay / al, cth = uz, sth = Math.hypot(ux, uy);
      tiltMatrix = [cth + kx * kx * (1 - cth), kx * ky * (1 - cth), ky * sth, kx * ky * (1 - cth), cth + ky * ky * (1 - cth), -kx * sth, -ky * sth, kx * sth, cth];   // row-major
      notes.push({ code: 'tilted', data: { tiltDeg, axisDeg } });
    }
  } else notes.push({ code: 'no_floor' });
  if (l.z2 != null) { height = Math.abs(l.z2 - l.z1) * uf; ceilingZ = (floorUp === l.z1 ? l.z2 : l.z1) * uf; }
  // ---- one matrix: scale to metres, then the up rotation, then the level correction (column-major 4×4)
  let M = null;
  const needs = R || tiltMatrix || uf !== 1;
  if (needs) {
    const Rr = R || [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const T = tiltMatrix || [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const C = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) C[3 * i + j] += T[3 * i + k] * Rr[3 * k + j];
    M = [C[0] * uf, C[3] * uf, C[6] * uf, 0, C[1] * uf, C[4] * uf, C[7] * uf, 0, C[2] * uf, C[5] * uf, C[8] * uf, 0, 0, 0, 0, 1];
  }
  if (!notes.length) notes.push({ code: 'ok' });
  return {
    ok: true, extent: e, up: { axis: 'xyz'[axis], sign, confidence: conf, scores }, matrix: M,
    unit: { guess: uguess, factor: uf, basis, confidence: uconf }, level: { tiltDeg, axisDeg, floorZ, ceilingZ, height }, notes,
  };
}

/** Apply a column-major 4×4 to a Float64Array/Float32Array of points; returns a new Float64Array. */
export function applyMatrix(pos, n, M) {
  const o = new Float64Array(3 * n);
  for (let i = 0; i < n; i++) {
    const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
    o[3 * i] = M[0] * x + M[4] * y + M[8] * z + M[12]; o[3 * i + 1] = M[1] * x + M[5] * y + M[9] * z + M[13]; o[3 * i + 2] = M[2] * x + M[6] * y + M[10] * z + M[14];
  }
  return o;
}
