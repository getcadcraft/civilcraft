/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — clause names, symbols and term ids; the words a person reads come from the app's language file (rc.*) */
/**
 * anchorage.js — development (anchorage) lengths and lap splice lengths of deformed bars, by the clause they come from (cc-rc,
 * 0.9 RC.1, session rc-09). No DOM, no words: every result carries `clause` and `terms` (symbol → value) for the app to print.
 * Millimetres and MPa. Results are for checking by an engineer.
 *
 *   develop(bar, o) → { value, clause, method, terms, min }        straight bar in tension (o.compression for compression)
 *   hookDevelop(bar, o) → { value, clause, terms }                  standard hook in tension (ACI only; EN: α1 in develop)
 *   lap(bar, o) → { value, clause, terms, cls }                      tension (Class A / B, or EN l0) or compression lap
 *
 * bar = { db (mm), area (mm²) }. o = {
 *   code: 'aci' | 'ec2',  fc (MPa: ACI f'c, EN fck),  fy (MPa: ACI fy, EN fyk),
 *   lambda (ACI λ, 1 normal-weight, 0.75 lightweight),  coating: 'none' | 'epoxy' | 'galvanized',
 *   top (horizontal bar with more than 300 mm of fresh concrete cast below it: ACI ψt; EN: poor bond, η1 = 0.7),
 *   cover (clear cover, mm), clear (clear spacing between the bars developed or lapped, mm), confined (ACI: stirrups or ties
 *   through ld at the code minimum — the "easy" row of Table 25.4.2.3; EN α3 is taken as 1.0 either way),
 *   compression, hooked (EN α1), lapClass ('A' | 'B', ACI), lapPct (EN: % of bars lapped at one section, Table 8.3),
 *   gammaC, gammaS, alphaCt (EN NDPs; recommended values 1.5, 1.15, 1.0), stress (σsd / fyd, EN; 1 = the bar at its design strength)
 * }
 *
 * ACI 318-19 (SI units, ACI 318M-19):
 *   25.4.1.4  √f'c not more than 8.3 MPa
 *   25.4.2.1  ld ≥ 300 mm
 *   25.4.2.3  Table: ld = fy·ψt·ψe·ψg / (k·λ·√f'c) · db, k = 2.1 (No. 19 and smaller) / 1.7 (No. 22 and larger) when the clear
 *             spacing is at least db, the clear cover at least db and stirrups or ties run through ld (or the clear spacing is at
 *             least 2·db and the clear cover at least db); otherwise k = 1.4 / 1.1. (These are the inch-pound 25, 20, 50/3, 40/3
 *             converted: the test checks the conversion.)
 *   25.4.2.5  ψt 1.3 / 1.0; ψe 1.5 (epoxy, cover < 3·db or clear spacing < 6·db), 1.2 (other epoxy), 1.0; ψt·ψe ≤ 1.7;
 *             ψg 1.0 (Grade 280, 420), 1.15 (Grade 550), 1.3 (Grade 690)
 *   25.4.3.1  ldh = max(fy·ψe·ψr·ψo·ψc / (23·λ·√f'c) · db^1.5, 8·db, 150 mm); ψe 1.2 epoxy / 1.0; ψr 1.0 confined / 1.6;
 *             ψo 1.0 inside a column core / 1.25; ψc = f'c/105 + 0.6 below 40 MPa, else 1.0 (25.4.3.2). Not known here →
 *             the conservative ψr = 1.6, ψo = 1.25 unless the caller says otherwise.
 *   25.4.9.2  ldc = max(0.24·fy·ψr/(λ·√f'c)·db, 0.043·fy·ψr·db) ≥ 200 mm (25.4.9.1), ψr 1.0 (0.75 with ties per 25.4.9.3: not taken)
 *   25.5.2.1  tension lap: Class A = max(1.0·ld, 300), Class B = max(1.3·ld, 300), ld from 25.4.2.1(a) (without its 300 mm floor)
 *   25.5.5.1  compression lap: fy ≤ 420: 0.071·fy·db; fy > 420: (0.13·fy − 24)·db; ≥ 300 mm; f'c < 21 MPa: one third more (25.5.5.2)
 *   25.5.1.1  bars larger than No. 36 are not lap spliced (said as `noLap`)
 * EN 1992-1-1:2004 (recommended values of the nationally determined parameters):
 *   3.1.2 Table 3.1  fctm = 0.30·fck^(2/3) (≤ C50/60), 2.12·ln(1 + fcm/10) above (fcm = fck + 8); fctk,0.05 = 0.7·fctm
 *   3.1.6 (2)        fctd = αct·fctk,0.05 / γc
 *   8.4.2 (2)        fbd = 2.25·η1·η2·fctd; η1 = 1.0 good bond / 0.7 otherwise; η2 = 1.0 (φ ≤ 32), (132 − φ)/100 above; fctk,0.05
 *                    taken no higher than C60/75's
 *   8.4.3 (8.3)      lb,rqd = (φ/4)·(σsd/fbd)
 *   8.4.4 (8.4)      lbd = α1·α2·α3·α4·α5·lb,rqd ≥ lb,min; Table 8.2: α1 = 0.7 for a hook with cd > 3φ (else 1.0), α2 = 1 − 0.15·(cd − φ)/φ
 *                    within 0.7…1.0 (straight bars in tension; 1.0 in compression), α3 = α4 = α5 = 1.0 here; α2·α3·α5 ≥ 0.7 (8.5)
 *   8.4.4 (8.6/8.7)  lb,min = max(0.3·lb,rqd, 10φ, 100 mm) in tension; max(0.6·lb,rqd, 10φ, 100 mm) in compression
 *   8.7.3 (8.10)     l0 = α1·α2·α3·α5·α6·lb,rqd ≥ l0,min = max(0.3·α6·lb,rqd, 15φ, 200 mm) (8.11);
 *                    α6 = (ρ1/25)^0.5 within 1.0…1.5 (Table 8.3), ρ1 = % of bars lapped within 0.65·l0 of the lap's middle
 */

export const ACI = 'ACI 318-19';
export const EC2 = 'EN 1992-1-1';
const r1 = (v) => Math.round(v * 10) / 10;
const r3 = (v) => Math.round(v * 1000) / 1000;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const DEFAULTS = Object.freeze({ code: 'aci', fc: 28, fy: 420, lambda: 1, coating: 'none', gammaC: 1.5, gammaS: 1.15, alphaCt: 1.0, stress: 1, lapClass: 'B', lapPct: 100 });

/** ACI 318-19 25.4.2.5 ψg by the bar's grade (fy, MPa). */
export function psiG(fy) { return fy <= 420 + 1e-9 ? 1.0 : fy <= 550 + 1e-9 ? 1.15 : 1.3; }
/** ACI 318-19 25.4.2.5 ψe. */
export function psiE(coating, db, cover, clear) {
  if (coating !== 'epoxy') return 1.0;
  return cover < 3 * db || clear < 6 * db ? 1.5 : 1.2;
}
const sqrtFc = (fc) => Math.min(Math.sqrt(fc), 8.3);   // ACI 318-19 25.4.1.4

/** EN 1992-1-1 Table 3.1 fctm (MPa). */
export function fctm(fck) { return fck <= 50 ? 0.30 * Math.pow(fck, 2 / 3) : 2.12 * Math.log(1 + (fck + 8) / 10); }
/** EN 1992-1-1 8.4.2 (2) fbd (MPa). */
export function fbd(bar, o) {
  const eta1 = o.top ? 0.7 : 1.0, eta2 = bar.db <= 32 ? 1.0 : (132 - bar.db) / 100;
  const fctk = 0.7 * fctm(Math.min(o.fc, 60));
  const fctd = (o.alphaCt ?? 1) * fctk / (o.gammaC ?? 1.5);
  return { value: 2.25 * eta1 * eta2 * fctd, eta1, eta2, fctd, fctk };
}
/** EN 1992-1-1 8.4.3 (8.3) lb,rqd (mm), with σsd = stress·fyk/γs. */
export function lbRqd(bar, o) {
  const f = fbd(bar, o), sigma = (o.stress ?? 1) * o.fy / (o.gammaS ?? 1.15);
  return { value: bar.db / 4 * sigma / f.value, sigma, fbd: f };
}
const cdOf = (bar, o) => Math.max(0, Math.min((o.clear ?? Infinity) / 2, o.cover ?? Infinity));
const alpha2 = (bar, o) => (o.compression ? 1.0 : clamp(1 - 0.15 * (Math.min(cdOf(bar, o), 1e6) - bar.db) / bar.db, 0.7, 1.0));

/** Development (anchorage) length of a straight bar (mm). */
export function develop(bar, oIn = {}) {
  const o = { ...DEFAULTS, ...oIn };
  if (o.code === 'ec2') {
    const lb = lbRqd(bar, o);
    const a1 = o.hooked && !o.compression && cdOf(bar, o) > 3 * bar.db ? 0.7 : 1.0;
    const a2 = alpha2(bar, o), a3 = 1, a4 = 1, a5 = 1;
    const prod = Math.max(a2 * a3 * a5, 0.7);
    const min = o.compression ? Math.max(0.6 * lb.value, 10 * bar.db, 100) : Math.max(0.3 * lb.value, 10 * bar.db, 100);
    const value = Math.max(a1 * a4 * prod * lb.value, min);
    return { value, clause: EC2 + ' 8.4.4 (8.4)', method: o.compression ? 'ec2-comp' : 'ec2', min: r1(min),
      terms: { 'lb,rqd': r1(lb.value), fbd: r3(lb.fbd.value), η1: lb.fbd.eta1, η2: r3(lb.fbd.eta2), fctd: r3(lb.fbd.fctd), σsd: r1(lb.sigma), α1: a1, α2: r3(a2), α3: a3, α4: a4, α5: a5 } };
  }
  const sq = sqrtFc(o.fc), lam = o.lambda || 1;
  if (o.compression) {
    const psiR = 1.0;
    const a = 0.24 * o.fy * psiR / (lam * sq) * bar.db, b = 0.043 * o.fy * psiR * bar.db;
    return { value: Math.max(a, b, 200), clause: ACI + ' 25.4.9.2', method: 'aci-comp', min: 200, terms: { ψr: psiR, λ: lam, '√fc': r3(sq) } };
  }
  const pe = psiE(o.coating, bar.db, o.cover ?? Infinity, o.clear ?? Infinity), pt = o.top ? 1.3 : 1.0, pg = psiG(o.fy);
  const pte = Math.min(pt * pe, 1.7);
  const small = bar.db <= 19.1 + 1e-6;   // No. 19 and smaller
  const easy = (o.clear ?? 0) >= bar.db - 1e-6 && (o.cover ?? 0) >= bar.db - 1e-6 && (o.confined || (o.clear ?? 0) >= 2 * bar.db - 1e-6);
  const k = easy ? (small ? 2.1 : 1.7) : (small ? 1.4 : 1.1);
  const raw = o.fy * pte * pg / (k * lam * sq) * bar.db;
  return { value: Math.max(raw, 300), raw, clause: ACI + ' 25.4.2.3', method: 'aci', min: 300,
    terms: { ψt: pt, ψe: pe, 'ψt·ψe': r3(pte), ψg: pg, λ: lam, '√fc': r3(sq), k, row: easy ? 'spacing ≥ db' : 'other' } };
}

/** Development of a standard hook in tension (ACI 318-19 25.4.3.1), mm. */
export function hookDevelop(bar, oIn = {}) {
  const o = { ...DEFAULTS, ...oIn };
  if (o.code === 'ec2') { const d = develop(bar, { ...o, hooked: true }); return { ...d, clause: EC2 + ' 8.4.4 (8.4), Table 8.2 α1' }; }
  const sq = sqrtFc(o.fc), lam = o.lambda || 1;
  const pe = o.coating === 'epoxy' ? 1.2 : 1.0;
  const pr = o.confinedHook ? 1.0 : 1.6, po = o.inCore ? 1.0 : 1.25;
  const pc = o.fc < 40 ? o.fc / 105 + 0.6 : 1.0;
  const a = o.fy * pe * pr * po * pc / (23 * lam * sq) * Math.pow(bar.db, 1.5);
  return { value: Math.max(a, 8 * bar.db, 150), clause: ACI + ' 25.4.3.1', min: r1(Math.max(8 * bar.db, 150)), terms: { ψe: pe, ψr: pr, ψo: po, ψc: r3(pc), λ: lam, '√fc': r3(sq) } };
}

/** Lap splice length (mm). Tension unless o.compression. */
export function lap(bar, oIn = {}) {
  const o = { ...DEFAULTS, ...oIn };
  if (o.code === 'ec2') {
    const lb = lbRqd(bar, o);
    const a1 = 1.0, a2 = alpha2(bar, o), a3 = 1, a5 = 1;
    const a6 = clamp(Math.sqrt(Math.max(o.lapPct, 0) / 25), 1.0, 1.5);
    const prod = Math.max(a2 * a3 * a5, 0.7);
    const min = Math.max(0.3 * a6 * lb.value, 15 * bar.db, 200);
    const value = Math.max(a1 * prod * a6 * lb.value, min);
    return { value, clause: EC2 + ' 8.7.3 (8.10)', min: r1(min), terms: { 'lb,rqd': r1(lb.value), fbd: r3(lb.fbd.value), η1: lb.fbd.eta1, α1: a1, α2: r3(a2), α3: a3, α5: a5, α6: r3(a6), 'ρ1 %': o.lapPct } };
  }
  const noLap = bar.db > 36;   // ACI 318-19 25.5.1.1: not for bars larger than No. 36
  if (o.compression) {
    let v = o.fy <= 420 ? 0.071 * o.fy * bar.db : (0.13 * o.fy - 24) * bar.db;
    v = Math.max(v, 300);
    if (o.fc < 21) v *= 4 / 3;
    return { value: v, clause: ACI + ' 25.5.5.1', min: 300, noLap, terms: { fy: o.fy, "f'c < 21": o.fc < 21 ? 'yes' : 'no' } };
  }
  const d = develop(bar, { ...o, compression: false });
  const f = o.lapClass === 'A' ? 1.0 : 1.3;
  return { value: Math.max(f * d.raw, 300), clause: ACI + ' 25.5.2.1', cls: o.lapClass === 'A' ? 'A' : 'B', min: 300, noLap, terms: { ...d.terms, ld: r1(d.raw), class: o.lapClass === 'A' ? 'A' : 'B', factor: f } };
}

/** Rounds a length up to the next 25 mm (what a detail would carry). */
export const roundUp = (v, step = 25) => Math.ceil(v / step - 1e-9) * step;
