/* SPDX-License-Identifier: Apache-2.0 */
/**
 * adjust.js — least-squares adjustment of survey networks (0.8 EG.11): distances, directions (with an unknown orientation per set), angles, azimuths and GNSS
 * vectors in plan; height differences in levelling. Parametric (observation-equation) adjustment by Gauss–Newton, weighted by each observation's standard
 * deviation. Reports adjusted coordinates, residuals, standardised residuals (Baarda's w-test), redundancy numbers, the a posteriori variance factor with its
 * χ² test, and 95 % error ellipses. No DOM, no strings, no imports. Plan units are the caller's; angles in radians inside (the parser turns degrees into
 * radians). Tested by bin/test-civilcraft-adjust.mjs. A calculation aid: the adjustment of a network that matters is checked by a surveyor.
 *
 * Published maths (nothing copied): Ghilani and Wolf, Adjustment Computations, 6th ed., ch. 11–16 (observation equations x̂ = (AᵀPA)⁻¹AᵀPℓ, Qxx = (AᵀPA)⁻¹,
 * σ̂₀² = vᵀPv / r, Q_vv = P⁻¹ − A·Qxx·Aᵀ, error ellipse from the 2×2 block of Qxx); Baarda 1968 (data snooping: w = v / (σ·√r), critical 3.29 at α = 0.001).
 *
 *   points   { id: { x, y, fixed?: bool, sx?, sy? } }      fixed = control (held); sx/sy = weighted control (its standard deviation); the rest are free
 *   obs      [{ type: 'dist', from, to, value, sd }
 *             { type: 'dir', at, to, value (rad), sd, set }       directions in one `set` share an unknown orientation
 *             { type: 'angle', at, back, fore, value (rad, clockwise back→fore), sd }
 *             { type: 'az', from, to, value (rad from north, clockwise), sd }
 *             { type: 'vec', from, to, dx, dy, sdx, sdy }]
 *   adjustNetwork(points, obs, { iterations, tol, alpha }) → { points, obs: [{ …, v, w, r, flag }], sigma0, dof, chi2: { value, lo, hi, pass }, ellipses, iterations, converged, problems }
 *   adjustLevels(heights, obs) → heights adjusted    obs: [{ from, to, dh, length | sd }]   (σ² ∝ length)
 *   minimalConstraints(points, obs) → points      a FREE network: no control, so the datum is held by the least that fixes it (one point; a second point's coordinate across the line,
 *        both of its coordinates if there is no distance to give the scale). Residuals, σ̂₀, χ² and the w-test do not depend on this choice; coordinates and ellipses do (datum defect).
 *   bowditch(start, legs, { end }) → closing traverse by the compass rule   legs: [{ dist, az (rad from north, clockwise) }]; with `end` (the known last point) the misclosure is against it,
 *        else the traverse is taken as a loop back to `start`. → { points[], misclosure: {dx,dy,len}, perimeter, precision (1 : n) }  (Ghilani and Wolf, ch. 10 and 19)
 *   adjustedCsv(result) → text    id,x,y,semi-major,semi-minor,azimuth (one adjusted point a line)
 */

const TAU = Math.PI * 2;
const wrap = (a) => { a %= TAU; if (a > Math.PI) a -= TAU; if (a <= -Math.PI) a += TAU; return a; };

/** Solve A x = b (dense, n small) by Gauss–Jordan with partial pivoting; returns the inverse when `inverse`. */
export function invert(M) {
  const n = M.length, a = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-14) return null;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c]; for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = a[r][c]; if (f) for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j]; }
  }
  return a.map((r) => r.slice(n));
}

// χ² quantiles for the variance test: Wilson–Hilferty approximation (accurate to a fraction of a percent above 2 degrees of freedom); 1 d.o.f. exact table
const Z = { 0.975: 1.959964, 0.025: -1.959964 };
export function chi2Quantile(p, k) {
  if (k === 1) return { 0.025: 0.000982, 0.975: 5.0239 }[p] ?? NaN;
  if (k === 2) return -2 * Math.log(1 - p);
  const z = Z[p] ?? 0, t = 1 - 2 / (9 * k) + z * Math.sqrt(2 / (9 * k));
  return k * t * t * t;
}

export function adjustNetwork(points0, obs0, { iterations = 20, tol = 1e-9, alpha = 0.001, confidence = 0.95 } = {}) {
  const problems = [], pts = {};
  for (const [id, p] of Object.entries(points0)) pts[id] = { ...p };
  const free = Object.keys(pts).filter((id) => !pts[id].fixed);
  // weighted control counts as a pseudo-observation of each coordinate
  const obs = obs0.map((o) => ({ ...o }));
  for (const id of Object.keys(pts)) { const p = pts[id]; if (!(p.sx || p.sy)) continue; if (p.fixed) { p.fixed = false; free.push(id); } obs.push({ type: 'ctrl', at: id, x0: p.x, y0: p.y, sx: p.sx || 1e-6, sy: p.sy || 1e-6 }); }   // an Infinity standard deviation leaves that coordinate out (minimalConstraints)   // weighted control: a point that carries standard deviations is observed at its stated place
  for (const o of obs) for (const k of ['from', 'to', 'at', 'back', 'fore']) if (o[k] !== undefined && !pts[o[k]]) problems.push({ code: 'adj.nopoint', point: o[k] });
  if (problems.length) return { points: pts, obs, problems, converged: false, dof: 0 };
  // orientation unknowns: one per (station, set)
  const sets = [], setIdx = new Map();
  for (const o of obs) if (o.type === 'dir') { const key = o.at + '|' + (o.set ?? 0); if (!setIdx.has(key)) { setIdx.set(key, sets.length); sets.push({ key, at: o.at, z: 0, n: 0, sum: 0 }); } o._set = setIdx.get(key); }
  const col = new Map(); free.forEach((id, i) => col.set(id, 2 * i));
  const nP = 2 * free.length, nu = nP + sets.length;
  // observation list as rows: each `rows(obs)` returns [{ misclosure, partials: [[col, value]…], sd }]
  const dirTo = (a, b) => Math.atan2(pts[b].y - pts[a].y, pts[b].x - pts[a].x);   // math direction; observations are compared as azimuths
  const az = (a, b) => Math.atan2(pts[b].x - pts[a].x, pts[b].y - pts[a].y);
  const dist = (a, b) => Math.hypot(pts[b].x - pts[a].x, pts[b].y - pts[a].y);
  const part = (rows, id, dx, dy) => { const c = col.get(id); if (c !== undefined) { rows.push([c, dx]); rows.push([c + 1, dy]); } };
  // initial orientations: mean of (computed azimuth − observed direction)
  for (const o of obs) if (o.type === 'dir') { const s = sets[o._set]; const d = wrap(az(o.at, o.to) - o.value); s.sum += Math.cos(d); s.n++; s._s = (s._s || 0) + Math.sin(d); }
  for (const s of sets) s.z = Math.atan2(s._s || 0, s.sum || 1);
  const eq = (o) => {
    const rows = [];
    switch (o.type) {
      case 'dist': { const d = dist(o.from, o.to), ux = (pts[o.to].x - pts[o.from].x) / d, uy = (pts[o.to].y - pts[o.from].y) / d; part(rows, o.from, -ux, -uy); part(rows, o.to, ux, uy); return { l: o.value - d, rows, sd: o.sd }; }
      case 'az': case 'dir': case 'angle': {
        const aOf = (a, b) => { const d = dist(a, b), dx = pts[b].x - pts[a].x, dy = pts[b].y - pts[a].y; return { ex: dy / (d * d), ey: -dx / (d * d) }; };   // ∂az/∂x_b, ∂az/∂y_b (az = atan2(dx, dy))
        const addAz = (a, b, sgn) => { const { ex, ey } = aOf(a, b); part(rows, b, sgn * ex, sgn * ey); part(rows, a, -sgn * ex, -sgn * ey); };
        if (o.type === 'az') { addAz(o.from, o.to, 1); return { l: wrap(o.value - az(o.from, o.to)), rows, sd: o.sd }; }
        if (o.type === 'dir') { addAz(o.at, o.to, 1); rows.push([nP + o._set, -1]); return { l: wrap(o.value - (az(o.at, o.to) - sets[o._set].z)), rows, sd: o.sd }; }
        addAz(o.at, o.fore, 1); addAz(o.at, o.back, -1);
        return { l: wrap(o.value - wrap(az(o.at, o.fore) - az(o.at, o.back))), rows, sd: o.sd };
      }
      case 'vec': {
        const rx = [], ry = []; part(rx, o.from, -1, 0); part(rx, o.to, 1, 0); part(ry, o.from, 0, -1); part(ry, o.to, 0, 1);
        return [{ l: o.dx - (pts[o.to].x - pts[o.from].x), rows: rx, sd: o.sdx }, { l: o.dy - (pts[o.to].y - pts[o.from].y), rows: ry, sd: o.sdy }];
      }
      case 'ctrl': {
        const rx = [], ry = []; const c = col.get(o.at); rx.push([c, 1]); ry.push([c + 1, 1]);
        return [...(Number.isFinite(o.sx) ? [{ l: o.x0 - pts[o.at].x, rows: rx, sd: o.sx }] : []), ...(Number.isFinite(o.sy) ? [{ l: o.y0 - pts[o.at].y, rows: ry, sd: o.sy }] : [])];
      }
      default: return null;
    }
  };
  const build = () => {
    const E = [];
    obs.forEach((o, k) => { const r = eq(o); if (!r) { problems.push({ code: 'adj.type', type: o.type }); return; } for (const q of Array.isArray(r) ? r : [r]) E.push({ ...q, k, w: 1 / (q.sd * q.sd) }); });
    return E;
  };
  let converged = false, it = 0, E = [], Ninv = null;
  for (; it < iterations; it++) {
    E = build();
    if (E.length < nu) { problems.push({ code: 'adj.underdetermined', observations: E.length, unknowns: nu }); break; }
    const N = Array.from({ length: nu }, () => new Array(nu).fill(0)), u = new Array(nu).fill(0);
    for (const e of E) { for (const [i, a] of e.rows) { u[i] += a * e.w * e.l; for (const [j, b] of e.rows) N[i][j] += a * e.w * b; } }
    Ninv = invert(N);
    if (!Ninv) { problems.push({ code: 'adj.singular' }); break; }
    const dx = Ninv.map((row) => row.reduce((s, v, j) => s + v * u[j], 0));
    free.forEach((id, i) => { pts[id].x += dx[2 * i]; pts[id].y += dx[2 * i + 1]; });
    sets.forEach((s, i) => { s.z = wrap(s.z + dx[nP + i]); });
    if (Math.max(...dx.map(Math.abs)) < tol) { converged = true; it++; break; }
  }
  if (!Ninv) return { points: pts, obs, problems, converged: false, dof: 0 };
  E = build();
  const dof = E.length - nu;
  const vtpv = E.reduce((s, e) => s + e.w * e.l * e.l, 0);
  const sigma0 = dof > 0 ? Math.sqrt(vtpv / dof) : NaN;
  // redundancy numbers r_i = 1 − w_i·a_iᵀ Qxx a_i
  const res = E.map((e) => {
    let q = 0; for (const [i, a] of e.rows) for (const [j, b] of e.rows) q += a * Ninv[i][j] * b;
    const r = 1 - e.w * q, v = -e.l;   // residual = adjusted − observed; what remains of (observed − computed) after the last step, with the sign turned
    return { k: e.k, sd: e.sd, v, r, w: r > 1e-6 ? v / (e.sd * Math.sqrt(r)) : 0 };
  });
  const crit = zCrit(alpha);
  const flagged = res.map((x) => (Math.abs(x.w) > crit && x.r > 0.05 ? { k: x.k, w: x.w } : null)).filter(Boolean);
  const outObs = obs.map((o, k) => { const rs = res.filter((x) => x.k === k); if (!rs.length) return o; const worst = rs.reduce((a, b) => (Math.abs(b.w) > Math.abs(a.w) ? b : a)); return { ...o, v: rs.length > 1 ? rs.map((x) => x.v) : rs[0].v, w: worst.w, r: rs.reduce((s, x) => s + x.r, 0) / rs.length, flag: Math.abs(worst.w) > crit && worst.r > 0.05 }; });
  // confidence ellipses scaled by σ̂₀ and the 2-d.o.f. χ² factor
  const k95 = Math.sqrt(-2 * Math.log(1 - confidence)), ell = {};
  free.forEach((id, i) => {
    const qxx = Ninv[2 * i][2 * i], qyy = Ninv[2 * i + 1][2 * i + 1], qxy = Ninv[2 * i][2 * i + 1], s0 = Number.isFinite(sigma0) && dof > 0 ? sigma0 : 1;
    const t = Math.sqrt((qxx - qyy) ** 2 + 4 * qxy * qxy), l1 = (qxx + qyy + t) / 2, l2 = (qxx + qyy - t) / 2, th = 0.5 * Math.atan2(2 * qxy, qxx - qyy);
    ell[id] = { semiMajor: k95 * s0 * Math.sqrt(Math.max(l1, 0)), semiMinor: k95 * s0 * Math.sqrt(Math.max(l2, 0)), azimuth: wrap(Math.PI / 2 - th), sx: s0 * Math.sqrt(qxx), sy: s0 * Math.sqrt(qyy) };
  });
  const lo = dof > 0 ? chi2Quantile(0.025, dof) : NaN, hi = dof > 0 ? chi2Quantile(0.975, dof) : NaN;
  const chi2 = { value: vtpv, lo, hi, pass: dof > 0 ? vtpv >= lo && vtpv <= hi : null };
  if (!converged && !problems.length) problems.push({ code: 'adj.noconverge' });
  if (chi2.pass === false) problems.push({ code: 'adj.chi2', value: vtpv, lo, hi, dof });
  for (const f of flagged) problems.push({ code: 'adj.blunder', obs: f.k, w: f.w });
  return { points: pts, obs: outObs, sigma0, dof, chi2, ellipses: ell, iterations: it, converged, flagged, problems, orientations: sets.map((s) => ({ at: s.at, z: s.z })) };
}

/** Two-sided standard-normal critical value for α (0.001 → 3.29; 0.05 → 1.96): rational approximation (Abramowitz and Stegun 26.2.23). */
export function zCrit(alpha) {
  const p = alpha / 2, t = Math.sqrt(-2 * Math.log(p));
  return t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t);
}

/** Levelling network: heights of the free points from height differences, weights 1/length (or 1/sd²). Fixed points have `fixed: true`. */
export function adjustLevels(heights0, obs) {
  const ids = Object.keys(heights0), free = ids.filter((i) => !heights0[i].fixed), idx = new Map(free.map((id, i) => [id, i]));
  const n = free.length, N = Array.from({ length: n }, () => new Array(n).fill(0)), u = new Array(n).fill(0), rows = [];
  for (const o of obs) {
    const w = o.sd ? 1 / (o.sd * o.sd) : 1 / (o.length || 1), a = idx.get(o.from), b = idx.get(o.to);
    let l = o.dh; if (a === undefined) l += heights0[o.from].h; if (b === undefined) l -= heights0[o.to].h;   // dh = h_to − h_from
    const r = []; if (b !== undefined) r.push([b, 1]); if (a !== undefined) r.push([a, -1]);
    for (const [i, x] of r) { u[i] += x * w * l; for (const [j, y] of r) N[i][j] += x * w * y; }
    rows.push({ o, w, l, r });
  }
  const Q = invert(N); if (!Q) return { ok: false, problems: [{ code: 'adj.singular' }] };
  const h = Q.map((row) => row.reduce((s, v, j) => s + v * u[j], 0)), out = {};
  for (const id of ids) out[id] = idx.has(id) ? { ...heights0[id], h: h[idx.get(id)] } : { ...heights0[id] };
  const vv = rows.map((x) => { const calc = (x.r.find((q) => q[1] === 1)?.[0] !== undefined ? h[x.r.find((q) => q[1] === 1)[0]] : 0) - (x.r.find((q) => q[1] === -1)?.[0] !== undefined ? h[x.r.find((q) => q[1] === -1)[0]] : 0); return calc - x.l; });
  const dof = obs.length - n, vtpv = rows.reduce((s, x, i) => s + x.w * vv[i] * vv[i], 0);
  return { ok: true, heights: out, residuals: vv, dof, sigma0: dof > 0 ? Math.sqrt(vtpv / dof) : NaN, sd: Object.fromEntries(free.map((id, i) => [id, Math.sqrt(Q[i][i]) * (dof > 0 ? Math.sqrt(vtpv / dof) : 1)])) };
}

/** A free network: hold the datum with the least constraints (see the header). `points` need approximate coordinates; nothing in it is marked fixed. */
export function minimalConstraints(points0, obs) {
  const ids = Object.keys(points0), pts = {}; for (const id of ids) pts[id] = { ...points0[id] };
  if (!ids.length) return pts;
  const a = ids[0], scale = obs.some((o) => o.type === 'dist' || o.type === 'vec');
  let b = null, best = -1; for (const id of ids.slice(1)) { const d = Math.hypot(pts[id].x - pts[a].x, pts[id].y - pts[a].y); if (d > best) { best = d; b = id; } }
  pts[a] = { ...pts[a], fixed: true };
  if (b) {
    const acrossY = Math.abs(pts[b].x - pts[a].x) >= Math.abs(pts[b].y - pts[a].y);
    pts[b] = scale ? (acrossY ? { ...pts[b], sx: Infinity, sy: 1e-6 } : { ...pts[b], sx: 1e-6, sy: Infinity }) : { ...pts[b], fixed: true };
  }
  return pts;
}

/** Closed or connecting traverse by the compass (Bowditch) rule: each coordinate difference is corrected in proportion to the leg's length. */
export function bowditch(start, legs, { end = null } = {}) {
  const raw = [{ x: start.x, y: start.y }]; let perimeter = 0;
  for (const l of legs) { const p = raw[raw.length - 1]; raw.push({ x: p.x + l.dist * Math.sin(l.az), y: p.y + l.dist * Math.cos(l.az) }); perimeter += l.dist; }
  const last = raw[raw.length - 1], target = end || start, dx = target.x - last.x, dy = target.y - last.y, len = Math.hypot(dx, dy);
  let acc = 0; const points = raw.map((p, i) => { if (i > 0) acc += legs[i - 1].dist; const f = perimeter > 0 ? acc / perimeter : 0; return { x: p.x + dx * f, y: p.y + dy * f }; });
  return { points, raw, misclosure: { dx: -dx, dy: -dy, len }, perimeter, precision: len > 0 ? perimeter / len : Infinity };
}

export function adjustedCsv(r) {
  const rows = ['id,x,y,semi-major,semi-minor,azimuth']; const f = (v) => (Number.isFinite(v) ? String(Math.round(v * 1e4) / 1e4) : '');
  for (const [id, p] of Object.entries(r.points || {})) { const e = r.ellipses?.[id]; rows.push([String(id).replace(/[",\n]/g, ' '), f(p.x), f(p.y), f(e?.semiMajor), f(e?.semiMinor), f(e?.azimuth)].join(',')); }
  return rows.join('\n') + '\n';
}
