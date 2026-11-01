/* SPDX-License-Identifier: Apache-2.0 */
/**
 * telecom.js — towers, radio links and fibre routes (0.8 EG.28). No DOM, no strings, no imports. SI inside (m, km, MHz, dB, dBm); the UI converts. Tested by
 * bin/test-civilcraft-telecom.mjs. A planning aid: a link or a tower is designed and signed by a competent engineer; antenna patterns, rain fade and the
 * regulator's licence conditions are not modelled.
 *
 * Published maths (nothing copied):
 *  - Free-space path loss FSPL = 20·log10(d_km) + 20·log10(f_MHz) + 32.44 dB (ITU-R P.525).
 *  - First Fresnel zone radius F1 = 17.32·√(d1·d2 / (f·D)) metres, d in km, f in GHz (ITU-R P.526); the usual clearance is 60 % of F1.
 *  - Earth bulge at a point d1, d2 km from the ends: h = d1·d2 / (12.74·k) metres, effective earth radius factor k (4/3 standard atmosphere; ITU-R P.834).
 *  - Link budget: received power Pr = Pt + Gt + Gr − Lcables − FSPL − other losses; fade margin = Pr − receiver sensitivity.
 *  - Fibre loss budget: loss = length·α + splices·Ls + connectors·Lc + margin; the longest run for a given budget follows from it (ITU-T G.652 fibre ~0.35 dB/km at 1310 nm,
 *    0.22 dB/km at 1550 nm are typical user inputs, not defaults that ship).
 *  - Tower: self-supporting or guyed, the wind pressure on antennas q = 0.5·ρ·V²·Cd·A; overturning moment M = Σ F·h.
 *
 *   fspl(dKm, fMHz) · fresnel(d1Km, d2Km, fGHz, n=1) · earthBulge(d1Km, d2Km, k)
 *   losProfile(terrain[{ d (km from A), z (m) }], { hA, hB (antenna heights above ground), f (GHz), k, clutter }) → { clear, min: { d, clearance, ratio }, samples[] }
 *   linkBudget({ pt, gt, gr, lossCableA, lossCableB, dKm, fMHz, other, sensitivity }) → { fspl, pr, margin }
 *   mastHeightFor(terrain, { hB, f, k, fraction }) → the tower height at A that clears fraction·F1 along the path
 *   fibreBudget({ lengthKm, alpha, splices, spliceLoss, connectors, connectorLoss, margin, budget }) → { loss, headroom, maxKm }
 *   fibreRoute(points, { slack: 0.02, spare: 50, spliceEvery: 2000 }) → { length, cable, splices, handholes }
 *   windLoad(antennas[{ area, h, cd }], { v, rho }) → { forces[], moment, shear }
 *   towerBase({ height, width, solidity, cf, antennas, v, rho, weight, footing }) → { shaft, antennas, shear, moment, vertical, fsOverturn }   the shaft's wind (q·Cf·solidity·width per metre, 10 slices)
 *        added to the antennas' and the overturning of a square footing; Cf and solidity are the user's (a standard's table fixes them), nothing here is a code check
 *   availability({ dKm, fGHz, fadeMargin, terrain }) → { worstMonth, annual, secondsPerYear }   Vigants–Barnett multipath outage for an unprotected hop: P = 2.5e-6·C·f·d³·10^(−F/10)
 *        (worst month) and 6e-7·C·f·d³·10^(−F/10) (annual) (Freeman, Radio System Design for Telecommunications, ch. 10); C = 4 smooth/over water, 1 average, 0.25 mountainous or dry.
 *        Rain outage is not in it (it needs the rain climate of the site: give the specific attenuation and use rainMargin).
 *   coverage(ground, tx, { f, pt, gt, gr, sensitivity, rxH, radius, step, k }) → grid of received power: free-space loss + the worst knife edge (ITU-R P.526 J(v)); knifeEdgeLoss(v), diffractionV(h, d1, d2, λ)
 *   towerLegs({ legs 3|4, width, moment, vertical, legCapacity, loadFactor, E, I, L, K }) → leg forces from the wind moment, utilisation against the person's capacity, Euler buckling
 *   rainMargin({ dKm, k, alpha, rainRate }) → dB    path attenuation of the rain rate R (mm/h): γ = k·R^α dB/km (ITU-R P.838's form; k and α are the user's, from the table for the frequency) times d
 */
const C = 299.792458;   // m per µs → used only for wavelength: λ(m) = 299.79 / f(MHz)
export const wavelength = (fMHz) => C / fMHz;

export const fspl = (dKm, fMHz) => 20 * Math.log10(dKm) + 20 * Math.log10(fMHz) + 32.44;
export const fresnel = (d1, d2, fGHz, n = 1) => 17.32 * Math.sqrt((n * d1 * d2) / (fGHz * (d1 + d2)));
export const earthBulge = (d1, d2, k = 4 / 3) => (d1 * d2) / (12.74 * k);

/**
 * terrain: samples from A to B { d (km), z (m above datum) }. Antennas at A and B stand hA and hB above their ground. The line of sight is a straight line between the antenna
 * tops; the terrain is raised by the earth bulge (and `clutter` metres for trees or buildings). Clearance = line − (terrain + bulge); the ratio to F1 is what a planner reads.
 */
export function losProfile(terrain, { hA, hB, f, k = 4 / 3, clutter = 0 }) {
  const D = terrain[terrain.length - 1].d - terrain[0].d, zA = terrain[0].z + hA, zB = terrain[terrain.length - 1].z + hB, samples = [];
  let min = null;
  for (const p of terrain) {
    const d1 = p.d - terrain[0].d, d2 = D - d1, line = zA + ((zB - zA) * d1) / D;
    const obstruction = p.z + clutter + (d1 > 0 && d2 > 0 ? earthBulge(d1, d2, k) : 0), clearance = line - obstruction;
    const F1 = d1 > 0 && d2 > 0 ? fresnel(d1, d2, f) : 0, ratio = F1 > 0 ? clearance / F1 : Infinity;
    samples.push({ d: p.d, line, obstruction, clearance, F1, ratio });
    if (d1 > 0 && d2 > 0 && (!min || ratio < min.ratio)) min = { d: p.d, clearance, ratio, F1 };
  }
  return { clear: !!min && min.clearance >= 0.6 * min.F1, min, samples, length: D };
}

export function linkBudget({ pt, gt, gr, lossCableA = 0, lossCableB = 0, dKm, fMHz, other = 0, sensitivity = -90 }) {
  const L = fspl(dKm, fMHz), pr = pt + gt + gr - lossCableA - lossCableB - L - other;
  return { fspl: L, pr, margin: pr - sensitivity };
}

/** The tower height at A that makes the path clear `fraction` of F1 everywhere (a plain search up to 300 m in 0.5 m steps). */
export function mastHeightFor(terrain, { hB, f, k = 4 / 3, fraction = 0.6, clutter = 0, max = 300, hA0 = 2 }) {
  for (let h = hA0; h <= max; h += 0.5) { const r = losProfile(terrain, { hA: h, hB, f, k, clutter }); if (r.min && r.min.clearance >= fraction * r.min.F1) return h; }
  return null;
}

export function fibreBudget({ lengthKm, alpha, splices = 0, spliceLoss = 0.1, connectors = 2, connectorLoss = 0.5, margin = 3, budget = null }) {
  const loss = lengthKm * alpha + splices * spliceLoss + connectors * connectorLoss + margin;
  const out = { loss, headroom: budget === null ? null : budget - loss };
  if (budget !== null && alpha > 0) out.maxKm = Math.max(0, (budget - connectors * connectorLoss - margin - splices * spliceLoss) / alpha);
  return out;
}

/** A fibre route along a polyline in metres: length, cable to order (slack and a spare loop at each end), splice and hand-hole counts. */
export function fibreRoute(points, { slack = 0.02, spare = 50, spliceEvery = 2000, handholeEvery = 150 } = {}) {
  let length = 0; for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return { length, cable: length * (1 + slack) + 2 * spare, splices: Math.max(0, Math.ceil(length / spliceEvery) - 1), handholes: Math.max(2, Math.ceil(length / handholeEvery) + 1) };
}

/** Wind on antennas and the tower's base moment: q = ½ρV²; force = q·Cd·A at the antenna's height. */
export function windLoad(antennas, { v = 40, rho = 1.225 } = {}) {
  const q = 0.5 * rho * v * v, forces = antennas.map((a) => ({ ...a, F: q * (a.cd ?? 1.2) * a.area }));
  return { q, forces, shear: forces.reduce((s, f) => s + f.F, 0), moment: forces.reduce((s, f) => s + f.F * f.h, 0) };
}

/** Sample a ground surface (function (x, y) → z) along A→B at `n` points into the terrain list losProfile reads. */
export function terrainAlong(ground, A, B, n = 100) {
  const L = Math.hypot(B.x - A.x, B.y - A.y) / 1000, out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, z = ground(A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t); out.push({ d: L * t, z: Number.isFinite(z) ? z : 0 }); }
  return out;
}


export const TERRAIN_C = { water: 4, smooth: 4, average: 1, mountain: 0.25, dry: 0.25 };
export function availability({ dKm, fGHz, fadeMargin, terrain = 'average' }) {
  const C = typeof terrain === 'number' ? terrain : TERRAIN_C[terrain] ?? 1, core = C * fGHz * dKm ** 3 * Math.pow(10, -fadeMargin / 10), wm = Math.min(1, 2.5e-6 * core), an = Math.min(1, 6e-7 * core);
  return { worstMonth: wm, annual: an, secondsPerYear: an * 365.25 * 86400, C };
}
export function rainMargin({ dKm, k, alpha, rainRate }) { return k * Math.pow(rainRate, alpha) * dKm; }

/** Wind on the tower's shaft plus its antennas, and the overturning of a square footing (side `footing`, m, and the weight in kN). */
export function towerBase({ height, width, solidity = 0.3, cf = 2.5, antennas = [], v = 40, rho = 1.225, weight = 0, footing = 0 }) {
  const q = 0.5 * rho * v * v, n = 10, dz = height / n; let sf = 0, sm = 0;
  for (let i = 0; i < n; i++) { const F = q * cf * solidity * width * dz, z = (i + 0.5) * dz; sf += F; sm += F * z; }
  const a = windLoad(antennas, { v, rho });
  const moment = sm + a.moment, shear = sf + a.shear;
  return { q, shaft: { force: sf, moment: sm }, antennas: { force: a.shear, moment: a.moment }, shear, moment, vertical: weight, fsOverturn: moment > 0 && footing > 0 && weight > 0 ? (weight * 1000 * footing / 2) / moment : null };
}

// ------------------------------------------------------------------ 0.8 EG.28 (civil_PART_4): coverage over the terrain and a tower leg check

/**
 * Single knife-edge diffraction loss, ITU-R P.526 (the closed approximation): v = h·√(2(d1+d2)/(λ·d1·d2)); J(v) = 6.9 + 20·log10(√((v − 0.1)² + 1) + v − 0.1) dB for v > −0.78, else 0.
 * h = how far the obstruction rises above the straight line (m, negative when the line clears it), d1, d2 in metres.
 */
export function diffractionV(h, d1, d2, lambda) { return h * Math.sqrt((2 * (d1 + d2)) / (lambda * d1 * d2)); }
export function knifeEdgeLoss(v) { return v > -0.78 ? 6.9 + 20 * Math.log10(Math.sqrt((v - 0.1) ** 2 + 1) + v - 0.1) : 0; }

/**
 * The received power from a transmitter at every point of a square grid around it, over the terrain. `ground(x, y)` → m or NaN (unknown: the cell is left out).
 * Each cell: free-space loss + the knife-edge loss of the worst obstruction on the straight path (the main-edge method; several edges add more loss in
 * reality, so the picture is a little optimistic where the path crosses many ridges). Antennas stand `tx.h` and `rxH` above the ground, the earth bulge uses k.
 *   coverage(ground, tx{x,y,h}, { f (GHz), pt, gt, gr (dBi), sensitivity (dBm), rxH, radius (m), step (m), k, clutter, samples, other }) → { nx, ny, x0, y0, step, pr: Float32Array (NaN unknown), covered (fraction of known cells), cells }
 */
export function coverage(ground, tx, { f = 2, pt = 30, gt = 10, gr = 0, sensitivity = -90, rxH = 2, radius = 5000, step = 100, k = 4 / 3, clutter = 0, samples = 40, other = 0 } = {}) {
  const lam = C / (f * 1000), n = Math.max(1, Math.floor(radius / step)), nx = 2 * n + 1, pr = new Float32Array(nx * nx).fill(NaN), x0 = tx.x - n * step, y0 = tx.y - n * step;
  const gz = ground(tx.x, tx.y); if (!Number.isFinite(gz)) return { nx, ny: nx, x0, y0, step, pr, covered: 0, cells: 0 };
  const zA = gz + tx.h; let known = 0, ok = 0;
  for (let j = 0; j < nx; j++) for (let i = 0; i < nx; i++) {
    const x = x0 + i * step, y = y0 + j * step, D = Math.hypot(x - tx.x, y - tx.y);
    if (D > radius + 1e-9) continue;
    const z = ground(x, y); if (!Number.isFinite(z)) continue;
    known++;
    const dKm = Math.max(D, step / 4) / 1000, zB = z + rxH, m = Math.max(2, Math.min(samples, Math.ceil(D / step * 2)));
    let vmax = -Infinity;
    for (let s = 1; s < m; s++) {
      const u = s / m, px = tx.x + (x - tx.x) * u, py = tx.y + (y - tx.y) * u, gp = ground(px, py); if (!Number.isFinite(gp)) continue;
      const d1 = D * u, d2 = D - d1, line = zA + (zB - zA) * u;
      const bulge = ((d1 / 1000) * (d2 / 1000)) / (12.74 * k), hh = gp + clutter + bulge - line, v = diffractionV(hh, d1, d2, lam);
      if (v > vmax) vmax = v;
    }
    const loss = fspl(dKm, f * 1000) + (vmax > -Infinity ? knifeEdgeLoss(vmax) : 0) + other, p = pt + gt + gr - loss;
    pr[i + nx * j] = p; if (p >= sensitivity) ok++;
  }
  return { nx, ny: nx, x0, y0, step, pr, covered: known ? ok / known : 0, cells: known };
}

/**
 * A lattice tower's legs under the wind moment and the dead weight, and each leg's buckling as a column. Statics only (equal legs): a tower of `legs` 4 (square, wind on a face) has
 * the windward leg pair carrying M/(2·w) each; a triangular tower of 3 (wind on a face) has an apex leg M/h with h = w·√3/2 (the leg positions from the centroid, Σx² = 2h²/3).
 * Dead weight W is shared by the legs. Capacity checks use the person's numbers: `legCapacity` kN (0 = unknown, no check), `loadFactor` (a code's factor: NOT typed in here), and
 * Euler buckling Pcr = π²·E·I/(K·L)² with E in GPa, I in cm⁴, L unbraced length in m. Diagonal wind, torsion, bracing and joint design are not covered. A planning aid, not a code check.
 *   towerLegs({ legs, width, moment (N·m), vertical (kN), legCapacity (kN), loadFactor, E (GPa), I (cm4), L (m), K }) → { compression, tension, utilization, pcr, bucklingUtil } (kN)
 */
export function towerLegs({ legs = 4, width, moment, vertical = 0, legCapacity = 0, loadFactor = 1, E = 200, I = 0, L = 0, K = 1 }) {
  const w = width, M = moment / 1000, W = vertical;   // kN·m, kN
  const lever = legs === 3 ? (w * Math.sqrt(3)) / 2 : 2 * w, n = legs === 3 ? 3 : 4;
  const wind = M > 0 && w > 0 ? M / lever : 0, share = W / n;
  const compression = (wind + share) * loadFactor, tension = Math.max(0, wind - share) * loadFactor;
  const pcr = I > 0 && L > 0 ? (Math.PI ** 2 * E * 1e9 * I * 1e-8) / (K * L) ** 2 / 1000 : null;   // kN
  return { compression, tension, utilization: legCapacity > 0 ? compression / legCapacity : null, pcr, bucklingUtil: pcr ? compression / pcr : null };
}
