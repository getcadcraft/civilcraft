/* SPDX-License-Identifier: Apache-2.0 */
/**
 * exchanger.js — heat exchanger rating (0.8 Track CH, CH.8; DOM-free). Our own code from published correlations. A drafting and study aid,
 * "to be checked by an engineer": not an engineering approval. Every correlation carries its source in `sources`; constants typed without the
 * book open are marked `check`.
 *
 *   lmtd(Th1, Th2, Tc1, Tc2)  fFactor(R, P)  effectiveness(type, NTU, Cr)  ntuFor(type, eps, Cr)  rateEpsNtu({type, UA, Ch, Cc, Thin, Tcin})
 *   tubeSideH(fluid, di, v)   kernShellH(…)   overallU({ho, hi, do, di, kw, Rfo, Rfi})   tubeLayout({Ds, do, pitch, layout, passes, limit})
 *   rateShellTube(spec)       airCooler(spec) plateExchanger(spec)  vibration(spec)      tubeSheetSVG(layout)
 * Units SI: m, K, W, Pa, kg, s. Fluid = { rho, cp, k, mu, muw? } (properties are the caller's: the process engine's thermo supplies them).
 */
export const sources = {
  lmtd: 'log-mean temperature difference, any heat-transfer text',
  fFactor: 'Bowman, Mueller & Nagle (1940): one shell pass, 2, 4, … tube passes',
  epsNtu: 'Kays & London (1984) effectiveness-NTU relations',
  gnielinski: 'Gnielinski (1976): turbulent tube flow, Petukhov friction factor',
  kern: 'Kern (1950): shell-side coefficient and pressure drop (a screening method; Bell–Delaware is NOT built)',
  connors: 'Connors (1970) fluidelastic instability; K = 3.0 as in the Pettigrew & Taylor (2003) guideline (check)',
  addedMass: 'Blevins (1990): confined added mass; effective diameter ratios of Rogers & Taylor (check)',
};

export const lmtd = (Th1, Th2, Tc1, Tc2) => {
  const d1 = Th1 - Tc2, d2 = Th2 - Tc1;     // counter-current ends: hot in vs cold out, hot out vs cold in
  if (!(d1 > 0 && d2 > 0)) return NaN;
  return Math.abs(d1 - d2) < 1e-9 * Math.max(d1, d2) ? (d1 + d2) / 2 : (d1 - d2) / Math.log(d1 / d2);
};
/** Correction factor of one shell pass with an even number of tube passes. R = (Th1−Th2)/(Tc2−Tc1), P = (Tc2−Tc1)/(Th1−Tc1). NaN when the temperatures cross. */
export function fFactor(R, P) {
  if (!(P > 0) || P >= 1) return NaN;
  const S = Math.sqrt(R * R + 1);
  if (Math.abs(R - 1) < 1e-9) { const a = 2 - P * (2 - Math.SQRT2), b = 2 - P * (2 + Math.SQRT2); if (!(a / b > 0)) return NaN; return (P * Math.SQRT2 / (1 - P)) / Math.log(a / b); }
  const num = S / (R - 1) * Math.log((1 - P) / (1 - R * P)), a = 2 - P * (R + 1 - S), b = 2 - P * (R + 1 + S);
  if (!(a / b > 0) || !((1 - P) / (1 - R * P) > 0)) return NaN; return num / Math.log(a / b);
}

/** Effectiveness. Types: counter, parallel, shell1 (one shell pass, 2+ tube passes), cross-unmixed (both unmixed, series approximation), cross-cmax-mixed, cross-cmin-mixed. */
export function effectiveness(type, NTU, Cr) {
  if (Cr < 1e-12) return 1 - Math.exp(-NTU);
  switch (type) {
    case 'counter': return Math.abs(Cr - 1) < 1e-9 ? NTU / (1 + NTU) : (1 - Math.exp(-NTU * (1 - Cr))) / (1 - Cr * Math.exp(-NTU * (1 - Cr)));
    case 'parallel': return (1 - Math.exp(-NTU * (1 + Cr))) / (1 + Cr);
    case 'shell1': { const s = Math.sqrt(1 + Cr * Cr), e = Math.exp(-NTU * s); return 2 / (1 + Cr + s * (1 + e) / (1 - e)); }
    case 'cross-unmixed': return 1 - Math.exp(Math.pow(NTU, 0.22) / Cr * (Math.exp(-Cr * Math.pow(NTU, 0.78)) - 1));
    case 'cross-cmax-mixed': return (1 / Cr) * (1 - Math.exp(-Cr * (1 - Math.exp(-NTU))));
    case 'cross-cmin-mixed': return 1 - Math.exp(-(1 / Cr) * (1 - Math.exp(-Cr * NTU)));
    default: throw new Error('unknown exchanger type ' + type);
  }
}
/** NTU for a wanted effectiveness (closed forms where they exist, else bisection). */
export function ntuFor(type, eps, Cr) {
  if (!(eps > 0) || eps >= 1 && Cr <= 1) return Infinity;
  if (Cr < 1e-12) return -Math.log(1 - eps);
  if (type === 'counter') return Math.abs(Cr - 1) < 1e-9 ? eps / (1 - eps) : Math.log((1 - eps * Cr) / (1 - eps)) / (1 - Cr);
  let lo = 0, hi = 1; while (effectiveness(type, hi, Cr) < eps && hi < 1e6) hi *= 2;
  if (effectiveness(type, hi, Cr) < eps) return Infinity;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (effectiveness(type, m, Cr) < eps) lo = m; else hi = m; } return (lo + hi) / 2;
}
/** Rate an exchanger of known UA: duty and outlet temperatures. Ch, Cc in W/K. */
export function rateEpsNtu({ type = 'counter', UA, Ch, Cc, Thin, Tcin }) {
  const Cmin = Math.min(Ch, Cc), Cmax = Math.max(Ch, Cc), Cr = Cmin / Cmax, NTU = UA / Cmin, eps = effectiveness(type, NTU, Cr);
  const Q = eps * Cmin * (Thin - Tcin); return { eps, NTU, Cr, Q, Thout: Thin - Q / Ch, Tcout: Tcin + Q / Cc };
}

/** Tube-side film coefficient. Laminar: fully developed Nu = 3.66 (constant wall temperature; the entrance effect is ignored, conservative). Turbulent: Gnielinski. */
export function tubeSideH(fl, di, v) {
  const Re = fl.rho * v * di / fl.mu, Pr = fl.cp * fl.mu / fl.k; let Nu, f;
  if (Re < 2300) Nu = 3.66;
  else {
    f = Math.pow(0.79 * Math.log(Re) - 1.64, -2);
    const g = (f / 8) * (Math.max(Re, 3000) - 1000) * Pr / (1 + 12.7 * Math.sqrt(f / 8) * (Math.pow(Pr, 2 / 3) - 1));
    Nu = Re >= 4000 ? g : 3.66 + (g - 3.66) * (Re - 2300) / 1700;
  }
  return { h: Nu * fl.k / di, Re, Pr, Nu, f: f ?? 64 / Re, notes: Re >= 2300 && Re < 4000 ? ['transition range: interpolated, uncertain'] : [] };
}
/** Overall U referred to the outside area: 1/U = 1/ho + Rfo + do ln(do/di)/(2 kw) + Rfi do/di + do/(di hi). */
export const overallU = ({ ho, hi, do: d0, di, kw = 45, Rfo = 0, Rfi = 0 }) => 1 / (1 / ho + Rfo + d0 * Math.log(d0 / di) / (2 * kw) + Rfi * d0 / di + d0 / (di * hi));

/** Kern shell side: ho = 0.36 (k/De) Re^0.55 Pr^(1/3) (mu/muw)^0.14 and dP = f Gs² Ds (Nb+1) / (2 rho De phi), f = exp(0.576 − 0.19 ln Re). Valid for Re 2e3–1e6 (published range). */
export function kernShell(fl, { Ds, do: d0, pitch, layout = 'triangular', baffleSpacing: B, mdot, baffles }) {
  const Pt = pitch, Cc = Pt - d0, As = Ds * Cc * B / Pt, Gs = mdot / As;
  const De = layout === 'square' ? 4 * (Pt * Pt - Math.PI * d0 * d0 / 4) / (Math.PI * d0) : 4 * (0.43 * Pt * Pt - Math.PI * d0 * d0 / 8) / (Math.PI * d0 / 2);
  const Re = De * Gs / fl.mu, Pr = fl.cp * fl.mu / fl.k, phi = Math.pow(fl.mu / (fl.muw ?? fl.mu), 0.14), notes = [];
  if (Re < 2e3 || Re > 1e6) notes.push(`Re ${Re.toExponential(1)} is outside Kern's published range 2e3–1e6: the shell-side figures are not trustworthy`);
  const h = 0.36 * fl.k / De * Math.pow(Re, 0.55) * Math.pow(Pr, 1 / 3) * phi;
  const Nb = baffles ?? 0, f = Math.exp(0.576 - 0.19 * Math.log(Re)), dP = f * Gs * Gs * Ds * (Nb + 1) / (2 * fl.rho * De * phi);
  return { h, dP, Re, Pr, De, As, Gs, f, notes };
}

/**
 * Tube layout in a shell: every tube centre (m) inside the circle Ds/2 − limit (the outer tube limit, default 0.015 m + do/2), on a triangular (30°, 60°) / square /
 * rotated square lattice, with a pass-partition lane. Returns { n, tubes: [{x, y, pass}], pitch, radius }.
 */
export function tubeLayout({ Ds, do: d0, pitch, layout = 'triangular', passes = 1, limit = null, lane = 0 }) {
  const R = Ds / 2 - (limit ?? (0.0127 + d0 / 2)), tubes = [];
  if (!(R > 0)) return { n: 0, tubes, pitch, radius: R };
  const dx = layout === 'triangular' ? pitch : pitch, dy = layout === 'triangular' ? pitch * Math.sqrt(3) / 2 : pitch;
  const rows = Math.ceil(R / dy) + 1;
  for (let j = -rows; j <= rows; j++) {
    const y = j * dy, off = layout === 'triangular' && (j & 1) ? dx / 2 : 0, rot = layout === 'rotated' ? 1 : 0;
    for (let i = -Math.ceil(R / dx) - 1; i <= Math.ceil(R / dx) + 1; i++) {
      const x = i * dx + off; if (x * x + y * y > R * R + 1e-12) continue;
      if (passes > 1 && Math.abs(y) < lane / 2 + 1e-12 && lane > 0) continue;
      tubes.push({ x, y, pass: passes > 1 ? (y >= 0 ? 0 : 1) : 0 });
    }
  }
  return { n: tubes.length, tubes, pitch, radius: R, layout, passes };
}
/** SVG of the tube sheet (shell circle, tube circles) for CadCraft's sheet or a PDF; plain strings. */
export function tubeSheetSVG(lay, { Ds, do: d0 }) {
  const s = 1000, vb = (Ds * 1.1 * s).toFixed(0), o = (Ds * 0.55 * s);
  const c = lay.tubes.map((t) => `<circle cx="${(t.x * s + o).toFixed(1)}" cy="${(-t.y * s + o).toFixed(1)}" r="${(d0 / 2 * s).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}"><circle cx="${o.toFixed(1)}" cy="${o.toFixed(1)}" r="${(Ds / 2 * s).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2"/>${c}</svg>`;
}

/**
 * Shell-and-tube rating by the LMTD method with Kern's shell side. spec = { hot: {fluid, mdot, Tin, Tout?}, cold: {…}, tube: {do, di, L, nTubes?, passes, kw, v?}, shell: {Ds, baffleSpacing, pitch,
 *   layout}, hotInTubes?: false, foulingShell, foulingTube, duty? }. Either both outlets or one outlet + the other side's flow is given (the duty follows).
 * → { Q, LMTD, F, U, Areq, Aprov, overdesign, hi, ho, tubeDP, shellDP, problems }
 */
export function rateShellTube(spec) {
  const { hot, cold, tube, shell } = spec, problems = [], notes = [];
  const Ch = hot.mdot * hot.fluid.cp, Cc = cold.mdot * cold.fluid.cp;
  let Q = spec.duty;
  if (Q == null) { if (hot.Tout != null) Q = Ch * (hot.Tin - hot.Tout); else if (cold.Tout != null) Q = Cc * (cold.Tout - cold.Tin); else throw new Error('give a duty or one outlet temperature'); }
  const Thout = hot.Tin - Q / Ch, Tcout = cold.Tin + Q / Cc;
  const R = Ch / Cc, P = (Tcout - cold.Tin) / (hot.Tin - cold.Tin), F = (tube.passes > 1 || spec.shellPasses === 1) ? fFactor(R, P) : 1;
  const dTm = lmtd(hot.Tin, Thout, cold.Tin, Tcout);
  if (!(F > 0)) problems.push({ code: 'hx.cross', severity: 'error', text: 'The temperature cross is too large for one shell pass: use more shells in series or a counter-current exchanger.' });
  const tubeFl = spec.hotInTubes ? hot : cold, shellFl = spec.hotInTubes ? cold : hot;
  const n = tube.nTubes ?? tubeLayout({ Ds: shell.Ds, do: tube.do, pitch: shell.pitch, layout: shell.layout, passes: tube.passes }).n;
  const Aflow = n / tube.passes * Math.PI * tube.di * tube.di / 4, v = tubeFl.mdot / (tubeFl.fluid.rho * Aflow);
  const ti = tubeSideH(tubeFl.fluid, tube.di, v);
  const Nb = Math.max(0, Math.round(tube.L / shell.baffleSpacing) - 1);
  const sh = kernShell(shellFl.fluid, { Ds: shell.Ds, do: tube.do, pitch: shell.pitch, layout: shell.layout, baffleSpacing: shell.baffleSpacing, mdot: shellFl.mdot, baffles: Nb });
  const U = overallU({ ho: sh.h, hi: ti.h, do: tube.do, di: tube.di, kw: tube.kw, Rfo: spec.foulingShell || 0, Rfi: spec.foulingTube || 0 });
  const Areq = Q / (U * F * dTm), Aprov = n * Math.PI * tube.do * tube.L;
  const fT = ti.f, tubeDP = (fT * tube.L * tube.passes / tube.di + 4 * tube.passes) * tubeFl.fluid.rho * v * v / 2;
  if (v < 0.9 && tubeFl.fluid.rho > 500) problems.push({ code: 'hx.tube-velocity-low', severity: 'warning', text: `Tube velocity ${v.toFixed(2)} m/s is low for a liquid: fouling risk (a common guideline is 1–2 m/s).` });
  if (v > 3 && tubeFl.fluid.rho > 500) problems.push({ code: 'hx.tube-velocity-high', severity: 'warning', text: `Tube velocity ${v.toFixed(2)} m/s is high: erosion risk.` });
  if (Aprov < Areq) problems.push({ code: 'hx.undersized', severity: 'error', text: `The exchanger has ${Aprov.toFixed(1)} m² and needs ${Areq.toFixed(1)} m².` });
  return { Q, Thout, Tcout, LMTD: dTm, F, R, P, U, Areq, Aprov, overdesign: Aprov / Areq - 1, hi: ti.h, ho: sh.h, v, tubeRe: ti.Re, shellRe: sh.Re, nTubes: n, baffles: Nb, tubeDP, shellDP: sh.dP, notes: [...notes, ...ti.notes, ...sh.notes], problems: problems.map((p) => ({ ...p, source: { kind: 'engine', name: 'process' }, about: [] })), sources: [sources.lmtd, sources.fFactor, sources.gnielinski, sources.kern] };
}

/** Air cooler: finned tube bank, air cross-flow unmixed vs process stream; given the air-side UA per unit duty the rating is ε-NTU with the process side mixed in the tubes (cross-cmax-mixed… use unmixed/mixed pair). */
export function airCooler({ process, air, UA, type = 'cross-cmin-mixed' }) {
  const Ch = process.mdot * process.cp, Cc = air.mdot * air.cp;
  return rateEpsNtu({ type, UA, Ch, Cc, Thin: process.Tin, Tcin: air.Tin });
}
/** Plate exchanger: the film coefficient of a plate channel is Nu = C Re^n Pr^(1/3): C and n belong to the plate pattern and are the maker's (never defaulted). */
export function plateExchanger({ hot, cold, plate, Aplate, nPlates, kw = 16, thickness = 0.0006, Rf = 0 }) {
  if (!(plate && plate.C > 0 && plate.n > 0 && plate.De > 0)) throw new Error('a plate exchanger needs the plate pattern constants C, n and the equivalent diameter De from the maker');
  const ch = (side, mdot) => { const Nc = (nPlates - 1) / 2, area = Nc * plate.width * plate.gap, G = mdot / area, Re = G * plate.De / side.mu, Pr = side.cp * side.mu / side.k; return plate.C * Math.pow(Re, plate.n) * Math.pow(Pr, 1 / 3) * side.k / plate.De; };
  const hh = ch(hot.fluid, hot.mdot), hc = ch(cold.fluid, cold.mdot), U = 1 / (1 / hh + 1 / hc + thickness / kw + Rf);
  const A = (nPlates - 2) * Aplate, Ch = hot.mdot * hot.fluid.cp, Cc = cold.mdot * cold.fluid.cp;
  return { ...rateEpsNtu({ type: 'counter', UA: U * A, Ch, Cc, Thin: hot.Tin, Tcin: cold.Tin }), U, hHot: hh, hCold: hc, A };
}

/**
 * Flow-induced vibration screening of a tube span (not a design check): natural frequency of a pinned-pinned tube with contents and confined added mass;
 * vortex-shedding frequency; Connors' critical velocity. spec = { do, di, span, E, rhoTube, rhoIn, rhoOut, pitch, layout, Vgap (m/s), St?, zeta?, K? }.
 */
export function vibration(s) {
  const { do: d0, di, span: L, E = 2.0e11, rhoTube = 7850, rhoIn = 0, rhoOut, pitch, layout = 'triangular', Vgap } = s;
  const I = Math.PI * (d0 ** 4 - di ** 4) / 64, mTube = rhoTube * Math.PI * (d0 * d0 - di * di) / 4, mIn = rhoIn * Math.PI * di * di / 4;
  const De = d0 * (layout === 'square' ? 1.07 + 0.56 * pitch / d0 : 0.96 + 0.5 * pitch / d0), Cm = (De * De + d0 * d0) / (De * De - d0 * d0), mAdded = Cm * rhoOut * Math.PI * d0 * d0 / 4;
  const m = mTube + mIn + mAdded, fn = (Math.PI / 2) * Math.sqrt(E * I / (m * L ** 4));   // pinned-pinned: (λ²/2π) with λ = π
  const St = s.St ?? 0.2, fs = St * Vgap / d0, zeta = s.zeta ?? 0.01, K = s.K ?? 3.0;
  const Vc = K * fn * d0 * Math.sqrt(2 * Math.PI * zeta * (mTube + mIn + mAdded) / (rhoOut * d0 * d0));
  const problems = [];
  if (Vgap / Vc > 0.5) problems.push({ code: 'hx.vib.fluidelastic', severity: Vgap >= Vc ? 'error' : 'warning', text: `Gap velocity ${Vgap.toFixed(2)} m/s is ${(100 * Vgap / Vc).toFixed(0)} % of the Connors critical velocity ${Vc.toFixed(2)} m/s (guideline: stay below 50 %).` });
  if (Math.abs(fs / fn - 1) < 0.2 || Math.abs(fs / (2 * fn) - 1) < 0.2) problems.push({ code: 'hx.vib.resonance', severity: 'warning', text: `Vortex-shedding frequency ${fs.toFixed(1)} Hz is within 20 % of the tube's natural frequency ${fn.toFixed(1)} Hz (or twice it).` });
  return { fn, fs, Vc, ratio: Vgap / Vc, mass: m, Cm, problems: problems.map((p) => ({ ...p, source: { kind: 'engine', name: 'process' }, about: [] })), sources: [sources.connors, sources.addedMass] };
}
