/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pinch.js — pinch analysis and heat-integration targets (0.8 Track CH, CH.22; DOM-free).
 * Problem Table algorithm: Linnhoff & Flower, AIChE J. 24 (1978) 633; composite curves: Umeda et al. (1979); area target: Townsend &
 * Linnhoff, AIChE J. 29 (1983) 742 (vertical heat transfer, uniform film coefficients); minimum units: Hohmann (1971) / Linnhoff.
 * A stream is { name, Ts, Tt, CP } (CP = mass flow × heat capacity in W/K, constant over the span), hot if Ts > Tt. `h` (W/m2K) is optional.
 */
const sum = (a) => a.reduce((s, v) => s + v, 0);

/** Stream segments of a process stream from enthalpies (handles latent heat): [{ Ts, Tt, CP }] from nSeg equal temperature steps, using H(T). */
export function segmentsFromEnthalpy(th, sIn, sOut, nSeg = 12) {
  const segs = [], F = sIn.F, dir = Math.sign(sOut.T - sIn.T) || 1, N = nSeg; let prev = sIn;
  for (let k = 1; k <= N; k++) {
    const T = sIn.T + (sOut.T - sIn.T) * k / N, f = th.flashPT(T, sIn.P, sIn.z), q = F * (f.H - prev.H);
    if (Math.abs(T - prev.T) > 1e-9) segs.push({ Ts: prev.T, Tt: T, CP: Math.abs(q / (T - prev.T)) * (dir > 0 ? 1 : 1), duty: q });
    prev = { T, H: f.H };
  }
  return segs;
}

export function problemTable(streams, dTmin) {
  const sh = streams.map((s) => { const hot = s.Ts > s.Tt, d = dTmin / 2; return { ...s, hot, a: s.Ts + (hot ? -d : d), b: s.Tt + (hot ? -d : d) }; });
  const temps = [...new Set(sh.flatMap((s) => [s.a, s.b]))].sort((x, y) => y - x);
  const ints = [];
  for (let k = 0; k < temps.length - 1; k++) {
    const hi = temps[k], lo = temps[k + 1]; let net = 0;                      // net surplus of the interval (hot releases, cold needs)
    for (const s of sh) { const top = Math.max(s.a, s.b), bot = Math.min(s.a, s.b); if (top >= hi - 1e-12 && bot <= lo + 1e-12) net += (s.hot ? 1 : -1) * s.CP * (hi - lo); }
    ints.push({ hi, lo, net });
  }
  let cum = 0, minCum = 0; const cascade = [{ T: temps[0], heat: 0 }];
  for (const it of ints) { cum += it.net; cascade.push({ T: it.lo, heat: cum }); minCum = Math.min(minCum, cum); }
  const QH = 0 - minCum, cascade2 = cascade.map((c) => ({ T: c.T, heat: c.heat + QH })), QC = cascade2[cascade2.length - 1].heat;
  const pinchRow = cascade2.find((c) => Math.abs(c.heat) < 1e-9 * (1 + QH)) || cascade2[0];
  return { dTmin, QHmin: QH, QCmin: QC, pinchShifted: pinchRow.T, pinchHot: pinchRow.T + dTmin / 2, pinchCold: pinchRow.T - dTmin / 2, intervals: ints, cascade: cascade2, grand: cascade2.map((c) => ({ T: c.T, H: c.heat })) };
}
/** Composite curves as [H, T] point lists (actual temperatures), cold curve shifted by the utility targets. */
export function compositeCurves(streams, dTmin) {
  const pt = problemTable(streams, dTmin);
  const build = (list) => {
    const T = [...new Set(list.flatMap((s) => [s.Ts, s.Tt]))].sort((a, b) => a - b); let H = 0; const pts = [[0, T[0]]];
    for (let k = 0; k < T.length - 1; k++) { let cp = 0; for (const s of list) { const lo = Math.min(s.Ts, s.Tt), hi = Math.max(s.Ts, s.Tt); if (lo <= T[k] + 1e-12 && hi >= T[k + 1] - 1e-12) cp += s.CP; } H += cp * (T[k + 1] - T[k]); pts.push([H, T[k + 1]]); }
    return pts;
  };
  const hot = build(streams.filter((s) => s.Ts > s.Tt)), cold = build(streams.filter((s) => s.Ts < s.Tt)).map(([H, T]) => [H + pt.QCmin, T]);
  return { hot, cold, targets: pt };
}
/** Minimum area (m2) by vertical heat transfer between the composites; h defaults to 1000 W/m2K per stream unless the stream gives its own. */
export function areaTarget(streams, dTmin, hDefault = 1000) {
  const { hot, cold } = compositeCurves(streams, dTmin);
  const at = (curve, H) => { for (let k = 0; k < curve.length - 1; k++) { const [h0, t0] = curve[k], [h1, t1] = curve[k + 1]; if (H >= h0 - 1e-9 && H <= h1 + 1e-9) return h1 === h0 ? t0 : t0 + (t1 - t0) * (H - h0) / (h1 - h0); } return null; };
  const Hs = [...new Set([...hot, ...cold].map((p) => p[0]))].sort((a, b) => a - b); let A = 0;
  for (let k = 0; k < Hs.length - 1; k++) {
    const H0 = Hs[k], H1 = Hs[k + 1], q = H1 - H0; if (q <= 0) continue;
    const th0 = at(hot, H0), th1 = at(hot, H1), tc0 = at(cold, H0), tc1 = at(cold, H1); if ([th0, th1, tc0, tc1].some((v) => v == null)) continue;
    const d0 = th0 - tc0, d1 = th1 - tc1; if (d0 <= 0 || d1 <= 0) continue;
    const lm = Math.abs(d0 - d1) < 1e-9 ? d0 : (d0 - d1) / Math.log(d0 / d1);
    // film term: sum over streams present in the interval of q_i / h_i with q_i = CP_i * dT_i
    let film = 0; const tmid = (a, b) => 0.5 * (a + b);
    for (const s of streams) { const lo = Math.min(s.Ts, s.Tt), hi = Math.max(s.Ts, s.Tt), hot_ = s.Ts > s.Tt, t = hot_ ? tmid(th0, th1) : tmid(tc0, tc1), dT = hot_ ? Math.abs(th1 - th0) : Math.abs(tc1 - tc0); if (t >= lo - 1e-9 && t <= hi + 1e-9) film += s.CP * dT / (s.h || hDefault); }
    A += film / lm;
  }
  return A;
}
/** Targets over a range of ΔTmin: [{ dTmin, QHmin, QCmin, area }] — the trade-off between energy and area. */
export function tradeoff(streams, dTs, hDefault) { return dTs.map((d) => { const t = problemTable(streams, d); return { dTmin: d, QHmin: t.QHmin, QCmin: t.QCmin, pinchHot: t.pinchHot, area: areaTarget(streams, d, hDefault) }; }); }
/** Minimum number of units for maximum energy recovery: above and below the pinch, N_streams + N_utilities - 1 each (Hohmann). */
export function minUnits(streams, dTmin) {
  const pt = problemTable(streams, dTmin), d = dTmin / 2, above = [], below = [], P = pt.pinchShifted;
  for (const s of streams) { const hot = s.Ts > s.Tt, a = s.Ts + (hot ? -d : d), b = s.Tt + (hot ? -d : d), hi = Math.max(a, b), lo = Math.min(a, b); if (hi > P + 1e-9) above.push(s); if (lo < P - 1e-9) below.push(s); }
  const uA = above.length + (pt.QHmin > 1e-9 ? 1 : 0) - 1, uB = below.length + (pt.QCmin > 1e-9 ? 1 : 0) - 1;
  return { above: Math.max(uA, 0), below: Math.max(uB, 0), total: Math.max(uA, 0) + Math.max(uB, 0) };
}
