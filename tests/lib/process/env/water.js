/* SPDX-License-Identifier: Apache-2.0 */
/**
 * water.js — water and wastewater treatment unit processes (0.8 Track CH, CH.20; DOM-free, imports only lib/process).
 * The activated sludge model is the published IAHR/IAWQ ASM1 (Henze, Grady, Gujer, Marais and Matsuo, 1987): 13 components, 8 processes, the Petersen matrix
 * below. Parameter values are the usual 20 C set quoted with the model; they were typed WITHOUT the report open (SOURCES, REVIEW): the tests prove the matrix
 * conserves COD and nitrogen and that a chemostat matches its closed form, not that each number is the report's. A drafting and study aid, not a process
 * design approval.
 *
 *   ASM1          COMP · STOICH · rates(c, par) · derivs(c, par)           the matrix as data and the rate vector
 *   Plant         activatedSludge(plant) → { tanks, effluent, waste, balances, notes, problems }   N tanks in series, internal and sludge recycle, a clarifier by capture
 *   Unit ops      screenLoss · idealClarifier · filterLoss · chickWatson · ctFor · srtOf · oxygenReport
 *   Site          siteLinks(plant, depths)      plan footprints and volumes for CivilCraft
 *   Engines       WATERTAP_ENGINE               held until its licence text is confirmed (engines.js pattern)
 * NOT built: the Takacs settler, temperature correction, ASM2/ASM3, anaerobic digestion, membrane units, chemical dosing, alkalinity in the rates beyond the matrix.
 */
import { solveLinear } from '../numeric.js';
import { problem as baseProblem } from '../report.js';

export const COMP = ['SI', 'SS', 'XI', 'XS', 'XBH', 'XBA', 'XP', 'SO', 'SNO', 'SNH', 'SND', 'XND', 'SALK'];
export const COMP_INFO = { SI: 'soluble inert COD', SS: 'readily biodegradable COD', XI: 'particulate inert COD', XS: 'slowly biodegradable COD', XBH: 'heterotrophic biomass', XBA: 'autotrophic biomass', XP: 'particulate products of decay', SO: 'dissolved oxygen', SNO: 'nitrate and nitrite N', SNH: 'ammonium N', SND: 'soluble organic N', XND: 'particulate organic N', SALK: 'alkalinity (mol HCO3/m3)' };
const PARTICULATE = ['XI', 'XS', 'XBH', 'XBA', 'XP', 'XND'], COD_SPECIES = ['SI', 'SS', 'XI', 'XS', 'XBH', 'XBA', 'XP'], SOLIDS = ['XI', 'XS', 'XBH', 'XBA', 'XP'];
export const SOURCES = {
  matrix: 'ASM1 Petersen matrix (Henze et al. 1987): aerobic and anoxic growth of heterotrophs, aerobic growth of autotrophs, decay of both, ammonification of soluble organic N, hydrolysis of entrained organics and of organic N',
  params: 'ASM1 parameters at 20 C as usually quoted with the model: YA 0.24, YH 0.67, fP 0.08, iXB 0.08, iXP 0.06, muH 4.0 /d, KS 10, KOH 0.2, KNO 0.5, bH 0.3, etag 0.8, etah 0.8, kh 3.0, KX 0.1, muA 0.5 /d, KNH 1.0, bA 0.05, KOA 0.4, ka 0.05',
  oxygen: '2.86 g COD per g nitrate-N (to nitrogen gas) and 4.57 g O2 per g N nitrified, the ASM1 conversion constants',
  kozeny: 'Carman-Kozeny laminar filter head loss h/L = 180 nu (1-eps)^2 v / (g eps^3 d^2)',
  kirschmer: 'Kirschmer bar-screen loss h = beta (w/b)^(4/3) (v^2/2g) sin(theta), beta = bar shape factor (the person\'s)',
  hazen: 'Ideal rectangular settling basin (Hazen): overflow rate vo = Q/A; a particle settling at vs >= vo is removed completely, otherwise a fraction vs/vo',
  chick: 'Chick-Watson disinfection: N/N0 = exp(-k C^n t); the person supplies k and n for the organism and disinfectant',
};
export const REVIEW = { state: 'not confirmed', note: 'Typed without the ASM1 report or a textbook open. A person with the report must compare the matrix and the parameter set before any design use.' };
export const PAR = Object.freeze({ YA: 0.24, YH: 0.67, fP: 0.08, iXB: 0.08, iXP: 0.06, muH: 4.0, KS: 10, KOH: 0.2, KNO: 0.5, bH: 0.3, etag: 0.8, etah: 0.8, kh: 3.0, KX: 0.1, muA: 0.5, KNH: 1.0, bA: 0.05, KOA: 0.4, ka: 0.05 });
export const SO_SAT = 8;          // g/m3, dissolved oxygen saturation used for the aeration term (a convention of the benchmark; the person may change it)
const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('water.' + code, severity, text, about, extra); p.source = SRC; return p; };

/** The stoichiometric matrix as 8 rows (processes) of 13 coefficients, for the parameter set `par`. */
export function STOICH(par = PAR) {
  const { YA, YH, fP, iXB, iXP } = par, z = () => Object.fromEntries(COMP.map((k) => [k, 0]));
  const rows = [];
  let r;
  r = z(); Object.assign(r, { SS: -1 / YH, XBH: 1, SO: -(1 - YH) / YH, SNH: -iXB, SALK: -iXB / 14 }); rows.push(r);                                     // 1 aerobic growth, heterotrophs
  r = z(); Object.assign(r, { SS: -1 / YH, XBH: 1, SNO: -(1 - YH) / (2.86 * YH), SNH: -iXB, SALK: (1 - YH) / (14 * 2.86 * YH) - iXB / 14 }); rows.push(r);   // 2 anoxic growth
  r = z(); Object.assign(r, { XBA: 1, SNO: 1 / YA, SO: -(4.57 - YA) / YA, SNH: -iXB - 1 / YA, SALK: -iXB / 14 - 1 / (7 * YA) }); rows.push(r);          // 3 aerobic growth, autotrophs
  r = z(); Object.assign(r, { XP: fP, XS: 1 - fP, XBH: -1, XND: iXB - fP * iXP }); rows.push(r);                                                     // 4 decay, heterotrophs
  r = z(); Object.assign(r, { XP: fP, XS: 1 - fP, XBA: -1, XND: iXB - fP * iXP }); rows.push(r);                                                     // 5 decay, autotrophs
  r = z(); Object.assign(r, { SNH: 1, SND: -1, SALK: 1 / 14 }); rows.push(r);                                                                         // 6 ammonification
  r = z(); Object.assign(r, { SS: 1, XS: -1 }); rows.push(r);                                                                                         // 7 hydrolysis, organics
  r = z(); Object.assign(r, { SND: 1, XND: -1 }); rows.push(r);                                                                                       // 8 hydrolysis, organic N
  return rows;
}
const pos = (v) => (v > 0 ? v : 0);
/** The 8 process rates (g/m3/d) at concentrations c (object by COMP name). */
export function rates(c, par = PAR) {
  const p = par, SS = pos(c.SS), SO = pos(c.SO), SNO = pos(c.SNO), SNH = pos(c.SNH), SND = pos(c.SND), XS = pos(c.XS), XBH = pos(c.XBH), XBA = pos(c.XBA), XND = pos(c.XND);
  const fS = SS / (p.KS + SS), fO = SO / (p.KOH + SO), fAn = p.KOH / (p.KOH + SO), fNO = SNO / (p.KNO + SNO);
  const r1 = p.muH * fS * fO * XBH, r2 = p.muH * fS * fAn * fNO * p.etag * XBH, r3 = p.muA * SNH / (p.KNH + SNH) * SO / (p.KOA + SO) * XBA;
  const r4 = p.bH * XBH, r5 = p.bA * XBA, r6 = p.ka * SND * XBH;
  const xr = XBH > 1e-12 ? XS / XBH : 0, r7 = p.kh * (xr / (p.KX + xr)) * (fO + p.etah * fAn * fNO) * XBH, r8 = XS > 1e-12 ? r7 * XND / XS : 0;
  return [r1, r2, r3, r4, r5, r6, r7, r8];
}
/** Reaction rate of every component (object), g/m3/d. */
export function derivs(c, par = PAR) {
  const rho = rates(c, par), M = STOICH(par), out = {}; for (const k of COMP) { let s = 0; for (let j = 0; j < 8; j++) s += M[j][k] * rho[j]; out[k] = s; } return out;
}

const vec = (o) => COMP.map((k) => o[k] ?? 0), obj = (v) => Object.fromEntries(COMP.map((k, i) => [k, v[i]]));
/**
 * Steady state of tanks in series with an internal recycle and a sludge-return clarifier, by integrating the ASM1 balances until nothing moves.
 * plant { tanks: [{ id, V (m3), aerated?: bool, KLa? (1/d), SOfixed? }], Qin (m3/d), influent: { SI, SS, XI, XS, XBH, XBA, XP, SO, SNO, SNH, SND, XND, SALK },
 *         Qint (m3/d, last tank back to the first), Qr (return sludge), Qw (waste sludge, taken from the underflow), capture (0..1 of every particulate captured by the clarifier — the person's number),
 *         par?, init?, tol? }
 * → { tanks: [{ id, c }], effluent: c, waste: c, flows, srt (d), balances, converged, iterations, problems, notes }
 */
export function activatedSludge(plant) {
  const par = { ...PAR, ...(plant.par || {}) }, T = plant.tanks || [];
  if (!T.length) throw new Error('A plant needs at least one tank.');
  const { Qin, Qint = 0, Qr, Qw } = plant;
  if (!(Qin > 0 && Qr >= 0 && Qw >= 0 && Qw < Qin)) throw new Error('Flows: Qin > 0, Qr >= 0 and 0 <= Qw < Qin (the effluent is Qin - Qw).');
  if (!(plant.capture >= 0 && plant.capture <= 1)) throw new Error('Give the clarifier capture of particulates (0 to 1); no default is assumed.');
  for (const t of T) if (!(t.V > 0)) throw new Error('Tank ' + t.id + ' needs a volume.');
  const infl = vec(plant.influent || {}), Qt = Qin + Qr + Qint, Qc = Qin + Qr, Qe = Qin - Qw, Qu = Qr + Qw, n = T.length, M = STOICH(par);
  const isP = COMP.map((k) => PARTICULATE.includes(k));
  const clarify = (cf) => {                                   // feed concentration vector → { eff, und }
    const eff = cf.map((v, i) => (isP[i] ? (1 - plant.capture) * v : v)), und = cf.map((v, i) => (isP[i] && Qu > 0 ? (Qc * v - Qe * eff[i]) / Qu : v));
    return { eff, und };
  };
  const f = (_t, y) => {
    const c = Array.from({ length: n }, (_, i) => y.slice(i * 13, i * 13 + 13)), { und } = clarify(c[n - 1]);
    const dy = new Array(y.length).fill(0);
    for (let i = 0; i < n; i++) {
      const o = obj(c[i]), rho = rates(o, par), t = T[i], q = Qt / t.V;
      for (let k = 0; k < 13; k++) {
        const key = COMP[k]; let tr;
        if (i === 0) tr = (Qin * infl[k] + Qr * und[k] + Qint * c[n - 1][k] - Qt * c[0][k]) / t.V; else tr = q * (c[i - 1][k] - c[i][k]);
        let rx = 0; for (let j = 0; j < 8; j++) rx += M[j][key] * rho[j];
        let aer = 0; if (key === 'SO' && t.aerated) aer = (t.KLa || 0) * (SO_SAT - c[i][k]);
        dy[i * 13 + k] = tr + rx + aer;
        if (key === 'SO' && t.SOfixed != null) dy[i * 13 + k] = 0;
      }
    }
    return dy;
  };
  let y = plant.init ? plant.init.flatMap((o) => vec(o)) : T.flatMap((t) => vec({ ...plant.influent, XBH: (plant.influent?.XBH ?? 0) + 1000, XBA: (plant.influent?.XBA ?? 0) + 50, SO: t.SOfixed ?? (t.aerated ? 2 : 0) }));
  T.forEach((t, i) => { if (t.SOfixed != null) y[i * 13 + 7] = t.SOfixed; });
  // pseudo-transient continuation: implicit steps (I/h - J) dy = F with a finite-difference Jacobian; h grows while the residual falls. Stiff-safe and deterministic.
  const N = y.length, scale = (v) => Math.abs(v) + 1, resid = (yy) => { const d = f(0, yy); let m = 0; for (let i = 0; i < N; i++) m = Math.max(m, Math.abs(d[i]) / scale(yy[i])); return m; };
  const maxIter = 4000, tol = plant.tol ?? 1e-7; let day = 0, conv = false, h = 1e-5, r0 = resid(y), it = 0;
  while (it < maxIter) {
    const F = f(0, y), Jm = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let j = 0; j < N; j++) { const e = 1e-6 * Math.max(1, Math.abs(y[j])), yp = y.slice(); yp[j] += e; const Fp = f(0, yp); for (let i = 0; i < N; i++) Jm[i][j] = (Fp[i] - F[i]) / e; }
    const A = Jm.map((row, i) => row.map((v, j) => (i === j ? 1 / h : 0) - v));
    let dy; try { dy = solveLinear(A, F); } catch { h /= 4; it++; continue; }
    let ch = 0; for (let i = 0; i < N; i++) ch = Math.max(ch, Math.abs(dy[i]) / scale(y[i]));
    if (ch > 0.2 && h > 1e-9) { h /= 2; it++; continue; }
    y = y.map((v, i) => (COMP[i % 13] === 'SALK' ? v + dy[i] : Math.max(0, v + dy[i]))); day += h; if (ch < 0.05) h = Math.min(h * 2, 1e9);
    r0 = resid(y); it++;
    if (r0 < tol) { conv = true; break; }
  }
  const c = Array.from({ length: n }, (_, i) => obj(y.slice(i * 13, i * 13 + 13)));
  const { eff, und } = clarify(y.slice((n - 1) * 13));
  const effluent = obj(eff), waste = obj(und);
  // balances from the reaction rates and the transported flows, independently of the integration
  let reactCOD = 0, oxygenUsed = 0, n2 = 0, supplied = 0;
  T.forEach((t, i) => {
    const rho = rates(c[i], par);
    for (let j = 0; j < 8; j++) { let s = 0; for (const k of COD_SPECIES) s += M[j][k]; reactCOD += t.V * rho[j] * s; oxygenUsed += t.V * rho[j] * -M[j].SO; }
    n2 += t.V * rho[1] * (1 - par.YH) / (2.86 * par.YH);
    if (t.aerated) supplied += t.V * (t.KLa || 0) * (SO_SAT - c[i].SO);
  });
  const codOf = (o) => COD_SPECIES.reduce((s, k) => s + (o[k] ?? 0), 0), nOf = (o) => (o.SNO ?? 0) + (o.SNH ?? 0) + (o.SND ?? 0) + (o.XND ?? 0) + par.iXB * ((o.XBH ?? 0) + (o.XBA ?? 0)) + par.iXP * (o.XP ?? 0);
  const codIn = Qin * codOf(plant.influent || {}), codOut = Qe * codOf(effluent) + Qw * codOf(waste);
  const nIn = Qin * nOf(plant.influent || {}), nOut = Qe * nOf(effluent) + Qw * nOf(waste);
  const codRes = codIn - codOut + reactCOD, nRes = nIn - nOut - n2;
  const balances = { cod: { in: codIn, out: codOut, reaction: reactCOD, residual: codRes, rel: codRes / (Math.abs(codIn) + 1e-12) }, n: { in: nIn, out: nOut, n2Lost: n2, residual: nRes, rel: nRes / (Math.abs(nIn) + 1e-12) }, oxygen: { used: oxygenUsed, supplied, residual: supplied - oxygenUsed } };
  const solids = (o) => SOLIDS.reduce((s, k) => s + o[k], 0), inv = c.reduce((s, ci, i) => s + T[i].V * solids(ci), 0), leaving = Qw * solids(waste) + Qe * solids(effluent);
  const srt = leaving > 0 ? inv / leaving : Infinity;
  const problems = [], about = [{ kind: 'plant', id: 'plant' }];
  if (!conv) problems.push(problem('notsteady', 'warning', `The plant had not settled after ${it} Newton steps (the largest relative rate was above ${tol}); the numbers are the last state, not a steady state.`, about));
  if (conv && Math.abs(balances.cod.rel) > 1e-3) problems.push(problem('balance.cod', 'error', `COD balance does not close (${(balances.cod.rel * 100).toFixed(3)} %).`, about));
  if (conv && Math.abs(balances.n.rel) > 1e-3) problems.push(problem('balance.n', 'error', `Nitrogen balance does not close (${(balances.n.rel * 100).toFixed(3)} %).`, about));
  if (Math.min(...c.map((ci) => ci.XBA)) < 1e-3) problems.push(problem('washout', 'warning', 'Autotrophs have washed out of at least one tank: the sludge age is too short to nitrify.', about));
  const notes = ['ASM1 at the parameter set in SOURCES.params (20 C, no temperature correction); the clarifier captures the fraction of particulates you gave, there is no settling model.', 'Typed values are not confirmed against the ASM1 report.'];
  return { tanks: T.map((t, i) => ({ id: t.id, c: c[i] })), effluent, waste, flows: { Qin, Qint, Qr, Qw, Qe, Qu, Qt }, srt, volume: T.reduce((s, t) => s + t.V, 0), balances, converged: conv, iterations: it, problems, notes };
}

// ---- other unit processes -------------------------------------------------------------------------------------------------------------
/** Bar-screen head loss (m) by Kirschmer: beta bar shape factor (the person's), w bar width, b clear spacing, v velocity through the bars (m/s), theta degrees from horizontal. */
export function screenLoss({ beta, w, b, v, theta = 60 }) { if (!(beta > 0 && w > 0 && b > 0 && v > 0)) throw new Error('Screen loss needs beta, bar width, clear spacing and velocity.'); return beta * Math.pow(w / b, 4 / 3) * v * v / (2 * 9.80665) * Math.sin(theta * Math.PI / 180); }
/** Ideal settling basin: removal fraction of particles settling at vs (m/d) in a basin of area A (m2) at flow Q (m3/d). */
export function idealClarifier({ Q, A, vs }) { if (!(Q > 0 && A > 0 && vs >= 0)) throw new Error('Clarifier needs Q, area and a settling velocity.'); const vo = Q / A; return { overflowRate: vo, removal: Math.min(1, vs / vo) }; }
/** Laminar granular-filter head loss (m of water) through depth L (m) at approach velocity v (m/s), grain diameter d (m), porosity eps, kinematic viscosity nu (m2/s). */
export function filterLoss({ L, v, d, eps, nu }) { if (!(L > 0 && v >= 0 && d > 0 && eps > 0 && eps < 1 && nu > 0)) throw new Error('Filter loss needs depth, velocity, grain size, porosity and viscosity.'); return L * 180 * nu * (1 - eps) ** 2 * v / (9.80665 * eps ** 3 * d * d); }
/** Chick-Watson: fraction surviving after contact time t with concentration C. → { surviving, log10 } (log10 removal). */
export function chickWatson({ k, n = 1, C, t }) { if (!(k >= 0 && C >= 0 && t >= 0)) throw new Error('Disinfection needs k, a concentration and a contact time.'); const s = Math.exp(-k * Math.pow(C, n) * t); return { surviving: s, log10: -Math.log10(s) }; }
/** Contact time needed for a log10 removal at concentration C. */
export function ctFor({ k, n = 1, C, log10 }) { if (!(k > 0 && C > 0 && log10 > 0)) throw new Error('Needs k, C and a log removal.'); return log10 * Math.LN10 / (k * Math.pow(C, n)); }
/** Sludge retention time (d): mass in the system over mass leaving. */
export function srtOf({ V, X, Qw, Xw, Qe = 0, Xe = 0 }) { const out = Qw * Xw + Qe * Xe; return out > 0 ? V * X / out : Infinity; }
/** Oxygen: requirement (kg/d) next to what the aerators supply, as Problems when they disagree. */
export function oxygenReport(res) {
  const used = res.balances.oxygen.used / 1000, supplied = res.balances.oxygen.supplied / 1000, ps = [];
  if (res.converged && supplied < 0.95 * used) ps.push(problem('oxygen', 'warning', `Aeration supplies ${supplied.toFixed(1)} kg O2/d but the reactions use ${used.toFixed(1)} kg/d.`, [{ kind: 'plant', id: 'plant' }]));
  return { usedKgPerDay: used, suppliedKgPerDay: supplied, problems: ps };
}
/** Plan footprints for the site (CivilCraft): each tank as an area from volume and water depth. depths { tankId: m } or one number. */
export function siteLinks(plant, depths = 4) {
  return (plant.tanks || []).map((t) => { const d = typeof depths === 'number' ? depths : (depths[t.id] ?? 4), area = t.V / d; return { id: t.id, kind: 'basin', volume: t.V, depth: d, area, side: Math.sqrt(area), aerated: !!t.aerated, note: 'Square footprint as a placeholder; the shape is the designer\'s.' }; });
}
/** WaterTAP (BSD-style terms with a DOE notice) as an optional engine: held like IDAES until the licence text is confirmed (engines.js). */
export const WATERTAP_ENGINE = { id: 'watertap', name: 'WaterTAP', license: 'WaterTAP (BSD-style terms with a DOE notice, not yet confirmed)', kind: 'program', program: { exe: 'python', script: 'cc_watertap_flowsheet.py', requires: ['watertap'] }, caps: ['water'], note: 'Held: licence text not yet confirmed to be permissive and no script is shipped.' };
