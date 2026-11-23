/* SPDX-License-Identifier: Apache-2.0 */
/**
 * membrane.js — first figures for the engineer: the membrane forces in a dome under its own weight and a snow load (0.11 DOME.3). Host-free.
 *
 * Membrane theory of a shell of revolution under loads that are the same all the way round (Timoshenko and Woinowsky-Krieger, Theory of
 * Plates and Shells, the chapter on shells of revolution loaded symmetrically; any shell text). On the concrete's mid-surface, at the parallel
 * where the normal makes the angle φ with the axis, with r0 the radius of that parallel and r1, r2 the principal radii of curvature:
 *   N_φ = −W / (2π r0 sin φ)              W = every vertical load above the parallel
 *   N_φ / r1 + N_θ / r2 = −Z               Z = the load per area pressing inward along the normal
 * Own weight q per area of shell gives Z = q cos φ; snow p per area of plan gives Z = p cos² φ. Negative = compression, positive = tension.
 * For a sphere of radius R under own weight alone these reduce to the textbook N_φ = −qR / (1 + cos φ), N_θ = qR (1 / (1 + cos φ) − cos φ),
 * and under snow alone to N_φ = −pR / 2, N_θ = −(pR / 2) cos 2φ: the tests check both.
 *
 * Loads carry the load factors of the design (1 with no spec: unfactored, and every table says which).
 *
 * Wind and earthquake vary round the dome as cos θ. For such a load the membrane forces of ANY shell of revolution follow from statics alone:
 * cut the dome at a parallel; the part above is pushed sideways by F and turned over by M (about the parallel's own centre). With
 * N_φ = n cos θ and N_φθ = s sin θ on the cut,   n = −M / (π r0² sin φ),   s = n cos φ + F / (π r0),   and N_θ again from the normal
 * equation. For a sphere under the textbook wind pattern p sin φ cos θ this is Timoshenko's closed form
 * N_φ = −(pR/3) cos θ cos φ (2 + cos φ)(1 − cos φ) / ((1 + cos φ) sin φ): the tests check it. The wind pattern is that simple one (pressure on
 * the windward side fading to suction on the leeward); codes put more suction over the crown. Earthquake is a sideways force of a share of the
 * weight.
 *
 * Buckling: the classical pressure a perfect elastic shell buckles at, 2E t² / (√(3(1 − ν²)) r1 r2) (Zoelly 1915 for the sphere), against the
 * load pressing on the shell. Real concrete shells buckle far below it (imperfections, creep, cracking): the reduction is the engineer's, typed.
 *
 * WHAT THIS IS NOT. Membrane theory leaves out the bending near the base, at openings and where the thickness or the
 * curvature changes; shellfe.js adds the bending for loads that are the same all the way round, not for wind or earthquake. Nothing here covers uneven snow,
 * temperature, shrinkage, cracking or creep. These are the figures an engineer starts from, not a design. The steel areas are only force ÷ the stress the person typed.
 */
import { thicknessAt } from './geometry.js';

export const G = 9.80665;   // standard gravity, m/s² (the defined value)

/** The concrete's mid-surface from the crown down to the springline, then down the stem wall to the floor: points with everything the statics need (m, kN). */
export function midline(d, m, steps = 2000) {
  const gamma = (d.density * G) / 1000, hs = d.stem, tb = d.shell + d.thicken;   // kN/m³
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = 1 - i / steps, p = m.point(s), t = thicknessAt(d, p.z), off = d.foam + t / 2, z = p.z - off * p.nz;
    if (z < 0 && pts.length) { pts[pts.length - 1].last = true; break; }   // a low dome's mid-surface dips under the springline: stop there
    pts.push({ part: 'dome', s, phi: p.phi, sin: p.nr, cos: p.nz, r: Math.max(0, p.r - off * p.nr) / 1000, z: (z + hs) / 1000, zf: p.z, rf: p.r / 1000,
      r1: (p.r1 - off) / 1000, r2: (p.r2 - off) / 1000, t, q: gamma * (t / 1000) + d.finishLoad });
  }
  const domeEnd = pts.length - 1;
  if (hs > 0) {
    const rc = (d.diameter / 2 - d.foam - tb / 2) / 1000, n = Math.max(8, Math.ceil(hs / 25));
    for (let i = 1; i <= n; i++) pts.push({ part: 'stem', s: 0, phi: Math.PI / 2, sin: 1, cos: 0, r: rc, z: (hs * (1 - i / n)) / 1000, zf: 0, rf: d.diameter / 2000, r1: Infinity, r2: rc, t: tb, q: gamma * (tb / 1000) + d.finishLoad });
  }
  return { pts, domeEnd, gamma };
}

/**
 * → { cases: { dead, snow?, wind?, seismic? }, weights, factors, unfactored, buckling, openings }.
 * dead / snow (the same all the way round) = { label { dead, snow }, stations: [{ s, phiDeg, z (mm above the springline), t (mm), nPhi, nTheta (kN/m),
 *   sPhi, sTheta (MPa) }], maxCompression { n (kN/m), stress (MPa), phiDeg }, maxHoopTension { n, phiDeg } | null, hoopZeroDeg | null,
 *   base { phiDeg, nPhi, thrust (kN/m outward), vertical (kN/m), ringTension (kN), radius (mm) }, floor { vertical (kN/m at the floor) },
 *   domeLoad (kN), ringSteel (mm²) | null, hoopSteel (mm²/m) | null, bearing (kPa under the ring beam) }.
 * wind / seismic (cos θ round the dome) = { label, baseShear (kN), overturning (kN·m), stations: [{ z (mm above the floor), phiDeg, n, s, nTheta
 *   (kN/m amplitudes: N_φ = n cos θ, N_φθ = s sin θ, N_θ = nTheta cos θ) }], floor { n (± kN/m), withDead { max, min (kN/m; positive = uplift) } },
 *   maxAlong, maxRound, maxShear (kN/m, with the dead load's share in maxAlong / maxRound as tension +, compression −), upliftSteel (mm²/m) | null }.
 */
export function forces(d, m, kept = [], steps = 2000) {
  const { pts, domeEnd, gamma } = midline(d, m, steps), last = pts.length - 1;
  const len = (i) => Math.hypot(pts[i].r - pts[i - 1].r, pts[i].z - pts[i - 1].z);
  // the shell's own load above each point, from the crown down (trapezoid along the mid-surface)
  const Wd = [0];
  for (let i = 1; i <= last; i++) Wd.push(Wd[i - 1] + Math.PI * (pts[i - 1].q * pts[i - 1].r + pts[i].q * pts[i].r) * len(i));
  const tb = d.shell + d.thicken, rc = pts[last].r;
  const footingLoad = gamma * (d.footingWidth / 1000) * (d.footingDepth / 1000) * 2 * Math.PI * rc;
  const footingArea = 2 * Math.PI * rc * (d.footingWidth / 1000);
  const fs = d.steelStress > 0 ? d.steelStress : null;
  const snowAt = (i) => (pts[i].part === 'dome' ? pts[i].rf : pts[domeEnd].rf);
  /** The symmetric membrane forces at point i under gd × own weight + gs × snow. */
  const sym = (i, gd, ps) => {
    const k = pts[i], W = gd * Wd[i] + ps * Math.PI * snowAt(i) ** 2;
    if (k.part === 'stem') { const nPhi = -W / (2 * Math.PI * k.r); return { nPhi, nTheta: 0 }; }
    const Z = gd * k.q * k.cos + ps * k.cos * k.cos;
    if (k.r < 1e-9 || k.sin < 1e-9) { const n = -(gd * k.q + ps) * k.r2 / 2; return { nPhi: n, nTheta: n }; }
    const nPhi = -W / (2 * Math.PI * k.r * k.sin);
    return { nPhi, nTheta: -k.r2 * (Z + nPhi / k.r1) };
  };
  const run = (gd, ps, label) => {
    const at = (i) => { const k = pts[i], f = sym(i, gd, ps); return { s: k.s, phiDeg: (k.phi * 180) / Math.PI, z: k.zf, t: k.t, ...f, sPhi: f.nPhi / k.t, sTheta: f.nTheta / k.t }; };
    let maxC = null, maxT = null, zero = null, prev = null;
    for (let i = 0; i <= domeEnd; i++) {
      const x = at(i);
      for (const [n, st] of [[x.nPhi, x.sPhi], [x.nTheta, x.sTheta]]) if (!maxC || st < maxC.stress) maxC = { n, stress: st, phiDeg: x.phiDeg };
      if (x.nTheta > 0 && (!maxT || x.nTheta > maxT.n)) maxT = { n: x.nTheta, phiDeg: x.phiDeg };
      if (prev && prev.nTheta < 0 && x.nTheta >= 0 && zero === null) zero = prev.phiDeg + ((0 - prev.nTheta) / (x.nTheta - prev.nTheta)) * (x.phiDeg - prev.phiDeg);
      prev = x;
    }
    const b = at(domeEnd), kb = pts[domeEnd];
    const thrust = -b.nPhi * kb.cos, vertical = -b.nPhi * kb.sin, ringTension = thrust * kb.r;
    const domeLoad = gd * Wd[domeEnd] + ps * Math.PI * kb.rf * kb.rf, total = gd * Wd[last] + ps * Math.PI * kb.rf * kb.rf;
    return {
      label,
      stations: Array.from({ length: 9 }, (_, j) => at(Math.round((j * domeEnd) / 8))),
      maxCompression: { n: maxC.n, stress: -maxC.stress, phiDeg: maxC.phiDeg }, maxHoopTension: maxT, hoopZeroDeg: zero,
      base: { phiDeg: b.phiDeg, nPhi: b.nPhi, thrust, vertical, ringTension, radius: kb.r * 1000 },
      floor: { vertical: total / (2 * Math.PI * rc) },
      domeLoad,
      ringSteel: fs && ringTension > 0 ? (ringTension * 1000) / fs : null,
      hoopSteel: fs && maxT ? (maxT.n * 1000) / fs : null,
      bearing: (total + gd * footingLoad) / footingArea,
    };
  };
  const ps = d.snow * d.gammaSnow;
  const cases = { dead: run(d.gammaDeadAlone, 0, { dead: d.gammaDeadAlone, snow: 0 }) };
  if (d.snow > 0) cases.snow = run(d.gammaDead, ps, { dead: d.gammaDead, snow: d.gammaSnow });

  /** A load that varies as cos θ: fr, ft, fz (kPa amplitudes of the radial, round and upward parts) at each point → the membrane amplitudes. */
  const lateral = (load, factor, label) => {
    let A = 0, Bm = 0, Cm = 0, prev = null;
    const rows = [];
    for (let i = 0; i <= last; i++) {
      const k = pts[i], f = load(k), ring = { fx: Math.PI * k.r * (f.fr - f.ft), mz: Math.PI * k.r * k.r * f.fz, z: k.z };
      if (prev) { const l = len(i); A += ((prev.fx + ring.fx) / 2) * l; Bm += ((prev.fx * prev.z + ring.fx * ring.z) / 2) * l; Cm += ((prev.mz + ring.mz) / 2) * l; }
      prev = ring;
      const M = Bm - k.z * A - Cm;
      let n = 0, s = 0, nTheta = 0;
      if (k.r > 1e-9 && k.sin > 1e-9) {
        n = -M / (Math.PI * k.r * k.r * k.sin); s = n * k.cos + A / (Math.PI * k.r);
        nTheta = -k.r2 * (-(f.fr * k.sin + f.fz * k.cos) + (Number.isFinite(k.r1) ? n / k.r1 : 0));
      }
      rows.push({ i, z: k.z * 1000, phiDeg: (k.phi * 180) / Math.PI, n: n * factor, s: s * factor, nTheta: nTheta * factor, F: A * factor, M: M * factor });
    }
    const end = rows[last];
    // with the dead load: tension is worst with the least dead load, compression with the most
    let maxAlong = { tension: -Infinity, compression: Infinity }, maxRound = { tension: -Infinity, compression: Infinity }, maxShear = 0;
    for (const r of rows) {
      const lo = sym(r.i, d.gammaDeadMin, 0), hi = sym(r.i, d.gammaDead, 0);
      maxAlong.tension = Math.max(maxAlong.tension, lo.nPhi + Math.abs(r.n)); maxAlong.compression = Math.min(maxAlong.compression, hi.nPhi - Math.abs(r.n));
      maxRound.tension = Math.max(maxRound.tension, Math.max(lo.nTheta, hi.nTheta) + Math.abs(r.nTheta)); maxRound.compression = Math.min(maxRound.compression, Math.min(lo.nTheta, hi.nTheta) - Math.abs(r.nTheta));
      maxShear = Math.max(maxShear, Math.abs(r.s));
    }
    const lo = sym(last, d.gammaDeadMin, 0), hi = sym(last, d.gammaDead, 0), up = lo.nPhi + Math.abs(end.n);
    return {
      label, baseShear: Math.abs(end.F), overturning: Math.abs(end.M),
      stations: Array.from({ length: 9 }, (_, j) => { const r = rows[Math.round((j * last) / 8)]; return { z: r.z, phiDeg: r.phiDeg, n: r.n, s: r.s, nTheta: r.nTheta }; }),
      floor: { n: Math.abs(end.n), withDead: { max: up, min: hi.nPhi - Math.abs(end.n) } },
      maxAlong, maxRound, maxShear,
      upliftSteel: fs && up > 0 ? (up * 1000) / fs : null,
    };
  };
  if (d.wind > 0) cases.wind = lateral((k) => ({ fr: -d.wind * k.sin * k.sin, ft: 0, fz: -d.wind * k.sin * k.cos }), d.gammaWind, { dead: d.gammaDead, deadMin: d.gammaDeadMin, wind: d.gammaWind });
  if (d.seismic > 0) cases.seismic = lateral((k) => ({ fr: d.seismic * k.q, ft: -d.seismic * k.q, fz: 0 }), d.gammaSeismic, { dead: d.gammaDead, deadMin: d.gammaDeadMin, seismic: d.gammaSeismic });

  // ---- buckling: the classical pressure of the perfect shell against the load pressing on it, where that ratio is smallest
  const gd = cases.snow ? d.gammaDead : d.gammaDeadAlone, pp = cases.snow ? ps : 0;
  let buckling = null;
  for (let i = 0; i <= domeEnd; i++) {
    const k = pts[i], Z = gd * k.q * k.cos + pp * k.cos * k.cos;   // kPa pressing inward
    if (!(Z > 1e-9)) continue;
    const pcr = ((2 * d.modulus * (k.t / 1000) ** 2) / (Math.sqrt(3 * (1 - d.poisson * d.poisson)) * k.r1 * k.r2)) * 1000;   // MPa → kPa
    if (!buckling || pcr / Z < buckling.ratio) buckling = { ratio: pcr / Z, classical: pcr, pressure: Z, phiDeg: (k.phi * 180) / Math.PI, t: k.t };
  }
  if (buckling) buckling.reduced = d.knockdown > 0 ? buckling.ratio * d.knockdown : null;

  // ---- openings: what each one interrupts, under the heavier of the two symmetric cases
  const hs = d.stem / 1000, openings = kept.map((o) => {
    const z0 = o.sill / 1000, z1 = o.head / 1000;
    let round = 0, top = null;
    for (let i = 1; i <= last; i++) {
      const a = pts[i - 1], b = pts[i], hi = Math.min(a.z, z1), lo = Math.max(b.z, z0);
      if (hi > lo && a.z > b.z) { const fa = sym(i - 1, gd, pp).nTheta, fb = sym(i, gd, pp).nTheta; round += ((fa + fb) / 2) * len(i) * ((hi - lo) / (a.z - b.z)); }
      if (top === null && b.z <= z1) top = i;
    }
    const k = pts[top ?? last], width = (o.a1 - o.a0) * k.r, along = sym(top ?? last, gd, pp).nPhi * width;
    void hs;
    return { n: o.n, kind: o.kind, along, alongEachSide: along / 2, round, roundSteel: fs && round > 0 ? (round * 1000) / fs : null, width: width * 1000 };
  });

  const f = { dead: d.gammaDead, deadAlone: d.gammaDeadAlone, deadMin: d.gammaDeadMin, snow: d.gammaSnow, wind: d.gammaWind, seismic: d.gammaSeismic };
  return { cases, weights: { dome: Wd[domeEnd], stem: Wd[last] - Wd[domeEnd], footing: footingLoad }, factors: f, unfactored: Object.values(f).every((v) => v === 1), buckling, openings };
}
