/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vessel.js — pressure vessel formulas (0.8 Track CH, CH.9; DOM-free). The equations of ASME BPVC Section VIII Division 1 as printed in public secondary sources,
 * cited by paragraph. A drafting and study aid, "to be checked by an engineer" (O7): NOT an engineering approval and no representation of code compliance.
 * Allowable stress S, joint efficiency E and corrosion allowance are the caller's: they come from Section II-D, which this file does not reproduce.
 * Units SI: mm, MPa, N, N·mm (stress in MPa = N/mm²).
 *
 *   shell({P, R|D, S, E, ca}) UG-27   head({type, P, D, S, E, ca}) UG-32   cone({P, D, alpha, S, E, ca}) UG-32(g)   mawp({...})   hydrotest(...)
 *   externalCylinder({Do, t, L, E, nu, Sy}) UG-28 (elastic range only)   nozzleReinforcement({...}) UG-37   saddle({...}) Zick   skirt({...})   windPressure({...}) seismicBase({...})
 *   dataSheet(spec) → { text, rows, problems }
 */
export const SOURCES = {
  shell: 'ASME VIII-1 UG-27(c): circumferential t = PR/(SE − 0.6P), longitudinal t = PR/(2SE + 0.4P)',
  heads: 'ASME VIII-1 UG-32: 2:1 ellipsoidal t = PD/(2SE − 0.2P); torispherical t = 0.885 PL/(SE − 0.1P); hemispherical t = PL/(2SE − 0.2P)',
  cone: 'ASME VIII-1 UG-32(g): t = PD/(2 cos(alpha)(SE − 0.6P))',
  external: 'classical elastic buckling (Windenburg & Trilling; Bresse) with the ASME design factor of 4; inelastic range needs the Section II-D charts: not built',
  nozzle: 'ASME VIII-1 UG-37 area replacement (E1 = 1, F = 1)',
  saddle: 'Zick (1951) longitudinal bending at midspan and at the saddle, K = 1 (simplified)',
  wind: 'ASCE 7-10 velocity pressure qz = 0.613 Kz Kzt Kd V² I (N/m², V m/s)',
};
const SC = (v, name) => { if (!(v > 0)) throw new Error(name + ' must be positive'); return v; };

/** Cylindrical shell: R inside radius (or D inside diameter). → { tCirc, tLong, t (governing), tNominalMin (+ ca), governs } */
export function shell({ P, R, D, S, E = 1, ca = 0 }) {
  R = R ?? D / 2; SC(S, 'S'); SC(E, 'E');
  const tCirc = P * R / (S * E - 0.6 * P), tLong = P * R / (2 * S * E + 0.4 * P), t = Math.max(tCirc, tLong);
  return { tCirc, tLong, t, tMin: t + ca, governs: tCirc >= tLong ? 'circumferential' : 'longitudinal', notes: P > 0.385 * S * E ? ['P exceeds 0.385 S E: UG-27 thin-wall equations do not apply (Appendix 1-2)'] : [], source: SOURCES.shell };
}
/** Formed head. type: 'ellipsoidal' (2:1; other ratios use K = (2 + (D/2h)²)/6), 'torispherical' (L, r given), 'hemispherical' (R inside radius). */
export function head({ type = 'ellipsoidal', P, D, S, E = 1, ca = 0, h = null, L = null, r = null }) {
  let t, notes = [];
  if (type === 'ellipsoidal') { const K = h ? (2 + Math.pow(D / (2 * h), 2)) / 6 : 1; t = P * D * K / (2 * S * E - 0.2 * P); }
  else if (type === 'torispherical') {
    L = L ?? D; r = r ?? 0.06 * D; const M = 0.25 * (3 + Math.sqrt(L / r)); t = P * L * M / (2 * S * E - 0.2 * P);
    if (r < 0.06 * L) notes.push('knuckle radius below 6 % of L: outside UG-32 limits'); if (r < 3 * t) notes.push('knuckle radius under 3t');
  } else if (type === 'hemispherical') t = P * (D / 2) / (2 * S * E - 0.2 * P);
  else throw new Error('head type: ellipsoidal | torispherical | hemispherical');
  return { t, tMin: t + ca, notes, source: SOURCES.heads };
}
export function cone({ P, D, alpha, S, E = 1, ca = 0 }) {
  const a = alpha * Math.PI / 180, notes = alpha > 30 ? ['half-apex angle above 30 degrees: needs a special analysis (UG-33 / Appendix 1-5)'] : [];
  const t = P * D / (2 * Math.cos(a) * (S * E - 0.6 * P)); return { t, tMin: t + ca, notes, source: SOURCES.cone };
}
/** Maximum allowable working pressure of a shell of corroded thickness t (inverse of UG-27). */
export function mawp({ t, R, S, E = 1 }) { const Pc = S * E * t / (R + 0.6 * t), Pl = 2 * S * E * t / (R - 0.4 * t); return { P: Math.min(Pc, Pl), governs: Pc <= Pl ? 'circumferential' : 'longitudinal' }; }
/** Hydrostatic test pressure (UG-99(b)): 1.3 × MAWP × (S at test temperature / S at design temperature). */
export const hydrotest = ({ mawp: m, Sratio = 1 }) => 1.3 * m * Sratio;

/** External pressure on a plain cylinder (no stiffening rings): critical P by the smaller of Windenburg's short-cylinder and Bresse's long-cylinder relations, divided by 4. */
export function externalCylinder({ Do, t, L, E = 2.0e5, nu = 0.3, Sy = 250 }) {
  const rr = t / Do, long = 2 * E * Math.pow(rr, 3) / (1 - nu * nu);
  const short = 2.42 * E * Math.pow(rr, 2.5) / (Math.pow(1 - nu * nu, 0.75) * (L / Do - 0.45 * Math.sqrt(rr)));
  const Pcr = Math.max(Math.min(long, short > 0 ? short : long), 0), Pa = Pcr / 4, sigma = Pcr * Do / (2 * t), notes = [];
  if (sigma > 0.5 * Sy) notes.push('the buckling stress exceeds half the yield strength: the elastic formula over-predicts; the Section II-D chart (not built) governs. Do not use this Pa.');
  return { Pcr, Pa, sigmaCr: sigma, notes, source: SOURCES.external };
}

/** Limits of reinforcement, UG-40: half-width along the vessel wall = the larger of the finished opening diameter d and (Rn + tn + t) (Rn = d/2), height normal to the wall = the smaller of 2.5 t and 2.5 tn + te. mm. */
export function reinforcementLimits({ d, t, tn, te = 0, Rn = null }) {
  Rn = Rn ?? d / 2;
  return { alongWall: Math.max(d, Rn + tn + t), normal: Math.min(2.5 * t, 2.5 * tn + te), source: 'ASME VIII-1 UG-40(b), (c)' };
}
/**
 * Opening reinforcement, UG-37. Areas in mm². vessel = { t (shell nominal, corroded), tr (required shell thickness), S, E1: 1 }, nozzle = { d (finished opening diameter, corroded),
 * tn (nozzle wall, corroded), trn (required nozzle wall), Sn, fr1?, leg41?, pad?: {Dp, te, fr4} }. F = 1.
 */
export function nozzleReinforcement({ vessel: v, nozzle: n }) {
  const fr1 = n.fr1 ?? Math.min(1, n.Sn / v.S), fr2 = fr1, E1 = v.E1 ?? 1, d = n.d;
  const A = d * v.tr + 2 * n.tn * v.tr * (1 - fr1);
  const x = E1 * v.t - v.tr, A1 = Math.max(d * x - 2 * n.tn * x * (1 - fr1), 2 * (v.t + n.tn) * x - 2 * n.tn * x * (1 - fr1));
  const A2 = Math.min(5 * (n.tn - n.trn) * fr2 * v.t, 5 * (n.tn - n.trn) * fr2 * n.tn);
  const lim = reinforcementLimits({ d, t: v.t, tn: n.tn, te: n.pad ? n.pad.te : 0 }), notes = [];
  // UG-40: material counts only inside the limits; a pad wider than the limit is cut to it
  const padW = n.pad ? Math.min(n.pad.Dp, 2 * lim.alongWall) : 0;
  if (n.pad && n.pad.Dp > 2 * lim.alongWall) notes.push('the pad is wider than the UG-40 limit of ' + (2 * lim.alongWall).toFixed(0) + ' mm: only that width is counted');
  const A41 = (n.leg41 ?? 0) ** 2 * fr2, A5 = n.pad ? (padW - d - 2 * n.tn) * n.pad.te * (n.pad.fr4 ?? fr2) : 0;
  const avail = Math.max(A1, 0) + Math.max(A2, 0) + A41 + Math.max(A5, 0);
  notes.push('limits of reinforcement (UG-40): along the wall ' + lim.alongWall.toFixed(0) + ' mm each side of the centreline, normal to it ' + lim.normal.toFixed(1) + ' mm; the areas above use them (A1 and A2 as UG-37 prints them, the pad cut to the limit)');
  return { A, A1: Math.max(A1, 0), A2: Math.max(A2, 0), A41, A5: Math.max(A5, 0), available: avail, ok: avail >= A, margin: avail / A - 1, limits: lim, source: SOURCES.nozzle, notes };
}

/** Horizontal vessel on two saddles (Zick). W total weight (N), L tangent-to-tangent length, R mean radius, H head depth, a saddle distance from the tangent line, t shell thickness. → stresses in MPa. */
export function saddle({ W, L, R, H, a, t }) {
  const Q = W / 2, k = (R * R - H * H) / (2 * a * L);
  const M1 = Q * a * (1 - (1 - a / L + k) / (1 + 4 * H / (3 * L)));
  const M2 = Q * L / 4 * ((1 + 2 * (R * R - H * H) / (L * L)) / (1 + 4 * H / (3 * L)) - 4 * a / L);
  const s1 = M1 / (Math.PI * R * R * t), s2 = M2 / (Math.PI * R * R * t);
  return { M1, M2, sigmaSaddle: s1, sigmaMid: s2, notes: ['a / R should be at most 0.5 (head stiffening at the saddle); circumferential and web stresses are not included'], source: SOURCES.saddle };
}
/** Wind velocity pressure (N/m²). */
export const windPressure = ({ V, Kz = 1, Kzt = 1, Kd = 0.95, I = 1 }) => 0.613 * Kz * Kzt * Kd * V * V * I;
/** Static seismic base shear (N) = Cs W; overturning at 2/3 of the height as a first estimate. */
export const seismicBase = ({ Cs, W, H }) => ({ V: Cs * W, M: Cs * W * 2 * H / 3 });
/** Skirt-supported vertical vessel: compressive stress at the skirt-to-shell junction from weight + overturning, and the tension side. D outside mean diameter (mm), t skirt thickness. */
export function skirt({ W, M, D, t }) {
  const A = Math.PI * D * t, Z = Math.PI * D * D * t / 4;
  return { sigmaComp: W / A + M / Z, sigmaTens: M / Z - W / A, notes: ['buckling allowable of the skirt (ASME / Brownell & Young) is the engineer\'s: not computed'] };
}
/** Wind overturning of a vertical vessel: F = q Cf D_eff H, moment at the base F H/2 (uniform pressure). Units N, mm. */
export const windOnVessel = ({ q, Cf = 0.7, D, H }) => { const F = q * 1e-6 * Cf * D * H; return { F, M: F * H / 2 }; };

/** Data sheet: rows of label / value / unit + the lines every sheet must carry. */
export function dataSheet(spec) {
  const rows = [['Design pressure', spec.P, 'MPa'], ['Design temperature', spec.T, '°C'], ['Inside diameter', spec.D, 'mm'], ['Shell thickness required', spec.shellT?.toFixed(2), 'mm'], ['Shell thickness provided (nominal)', spec.tNom, 'mm'], ['Corrosion allowance', spec.ca, 'mm'], ['Allowable stress S', spec.S, 'MPa'], ['Joint efficiency E', spec.E, ''], ['Head', spec.headType, ''], ['Head thickness required', spec.headT?.toFixed(2), 'mm'], ['MAWP (corroded)', spec.mawp?.toFixed(3), 'MPa'], ['Hydrotest pressure', spec.hydro?.toFixed(3), 'MPa']];
  const text = rows.map(([a, b, c]) => `${a}: ${b ?? '-'} ${c}`).join('\n') + '\n\nDrafting and study aid, not an engineering approval. To be checked by an engineer. No representation of ASME Code compliance; no U-stamp. Allowable stress and materials are the user\'s input.';
  return { rows, text, problems: [] };
}

/** Flat head or cover, UG-34(c)(2) (circular, attachment factor C from Figure UG-34, the caller's): t = d sqrt(C P / (S E)) + corrosion allowance. d diameter mm, P MPa, S MPa. */
export function flatHead({ P, d, S, E = 1, C = 0.33, ca = 0 }) {
  SC(S, 'S'); SC(E, 'E'); SC(C, 'C');
  const t = d * Math.sqrt(C * P / (S * E));
  return { t, tMin: t + ca, C, notes: Math.abs(C - 0.33) < 1e-12 ? ['C = 0.33 is the plain-plate value; the attachment detail of Figure UG-34 sets the real C (0.17 to 0.33 and others): give it'] : [], source: 'ASME VIII-1 UG-34(c)(2), t = d sqrt(C P / S E)' };
}

/**
 * Minimum design metal temperature (MDMT), UCS-66, with the figures left to the person. The base temperature of the material curve (Figure UCS-66, curves A to D, by thickness) and the
 * temperature reduction against the stress ratio (Figure UCS-66.1) are READ FROM THE BOOK by the caller: `baseMDMT` in °C, `reduction` = [[ratio, deltaT °C], …] ascending in ratio.
 * This function forms the ratio  tr E* / (tn − c)  (UCS-66(b)(1)(b)), interpolates the reduction and subtracts it. A ratio at or below 0.35 is the UCS-66(b)(3) exemption
 * (−105 °C; typed from memory: check it). Nothing is looked up for you and a missing figure is said, never guessed.
 */
export function mdmt({ baseMDMT = null, tr, tn, E = 1, ca = 0, reduction = null }) {
  const ratio = tr * E / (tn - ca), notes = [], src = 'ASME VIII-1 UCS-66(b)';
  if (!(tn - ca > 0) || !(tr > 0)) throw new Error('give the required thickness tr and the nominal thickness tn (> corrosion allowance)');
  if (ratio <= 0.35) return { ratio, mdmt: -105, exempt: true, notes: ['stress ratio ≤ 0.35: UCS-66(b)(3) lets the MDMT go to −105 °C without impact testing (typed from memory: check against the book)'], source: src };
  if (!Array.isArray(reduction) || reduction.length < 2 || baseMDMT == null) return { ratio, mdmt: null, exempt: false, notes: ['type the base temperature of the material curve (Figure UCS-66) and the reduction points of Figure UCS-66.1 as [[ratio, deltaT °C], …]; none are built in'], source: src };
  const pts = reduction.slice().sort((a, b) => a[0] - b[0]);
  if (ratio > pts[pts.length - 1][0]) return { ratio, mdmt: baseMDMT, exempt: false, notes: ['the ratio is above the last reduction point: no reduction is taken'], source: src };
  let dT = pts[0][1];
  if (ratio >= pts[0][0]) { for (let k = 0; k + 1 < pts.length; k++) if (ratio >= pts[k][0] && ratio <= pts[k + 1][0]) { const f = (ratio - pts[k][0]) / ((pts[k + 1][0] - pts[k][0]) || 1); dT = pts[k][1] + f * (pts[k + 1][1] - pts[k][1]); break; } }
  else notes.push('the ratio is below the first reduction point: the first reduction is used');
  return { ratio, mdmt: baseMDMT - dT, reduction: dT, exempt: false, notes, source: src };
}

/** An elevation drawing (SVG, numbers only) of a vessel: vertical on a skirt or legs, or horizontal on two saddles. spec { orientation, D, T (tangent-to-tangent length), support height, nozzles [{ name, at (mm along the shell from the bottom/left tangent), side }] , shellT } mm. */
export function vesselSvg(spec) {
  const D = +spec.D || 1000, L = +spec.L || 2 * D, sup = +spec.support || 0.3 * D, vertical = (spec.orientation || 'vertical') !== 'horizontal', f = (v) => +v.toFixed(1);
  const W = 420, Hh = 320, m = 50, headH = D / 4, total = vertical ? L + 2 * headH + sup : L + 2 * headH, span = vertical ? Hh - 2 * m : W - 2 * m, k = span / (vertical ? total : total), pad = 8;
  const shape = (cx, cy) => vertical ? { w: D * k, h: L * k } : { w: L * k, h: D * k };
  const sh = shape(); let g = '';
  const line = (x1, y1, x2, y2, extra = '') => '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="currentColor" stroke-width="1.4"' + extra + '/>';
  const txt = (x, y, s, anchor = 'middle') => '<text x="' + f(x) + '" y="' + f(y) + '" font-size="9" text-anchor="' + anchor + '" fill="currentColor">' + String(s).replace(/[<>&"]/g, '') + '</text>';
  if (vertical) {
    const cx = W / 2, yBot = Hh - m, x0 = cx - sh.w / 2, x1 = cx + sh.w / 2, yTan0 = yBot - sup * k, yTan1 = yTan0 - sh.h, hh = headH * k;
    g += '<path d="M ' + f(x0) + ' ' + f(yTan0) + ' A ' + f(sh.w / 2) + ' ' + f(hh) + ' 0 0 0 ' + f(x1) + ' ' + f(yTan0) + '" fill="none" stroke="currentColor" stroke-width="1.4"/>';
    g += '<path d="M ' + f(x0) + ' ' + f(yTan1) + ' A ' + f(sh.w / 2) + ' ' + f(hh) + ' 0 0 1 ' + f(x1) + ' ' + f(yTan1) + '" fill="none" stroke="currentColor" stroke-width="1.4"/>';
    g += line(x0, yTan0, x0, yTan1) + line(x1, yTan0, x1, yTan1);
    g += line(x0 + 0.1 * sh.w, yTan0 + hh * 0.9, x0 + 0.1 * sh.w, yBot) + line(x1 - 0.1 * sh.w, yTan0 + hh * 0.9, x1 - 0.1 * sh.w, yBot) + line(x0 - 6, yBot, x1 + 6, yBot);
    g += line(x1 + 14, yTan0, x1 + 14, yTan1, ' stroke-dasharray="3 2"') + txt(x1 + 18, (yTan0 + yTan1) / 2, 'TL ' + f(L), 'start');
    g += line(x0, yTan1 - hh - 10, x1, yTan1 - hh - 10, ' stroke-dasharray="3 2"') + txt(cx, yTan1 - hh - 14, 'ID ' + f(D));
    for (const n of spec.nozzles || []) { const y = yTan0 - Math.min(Math.max(+n.at || 0, 0), L) * k, right = n.side !== 'left', x = right ? x1 : x0; g += line(x, y, x + (right ? 22 : -22), y) + txt(x + (right ? 24 : -24), y + 3, n.name || '', right ? 'start' : 'end'); }
  } else {
    const cy = Hh / 2, yTop = cy - sh.h / 2, yBot = cy + sh.h / 2, xl = m + headH * k, xr = xl + sh.w, hh = headH * k;
    g += line(xl, yTop, xr, yTop) + line(xl, yBot, xr, yBot);
    g += '<path d="M ' + f(xl) + ' ' + f(yTop) + ' A ' + f(hh) + ' ' + f(sh.h / 2) + ' 0 0 0 ' + f(xl) + ' ' + f(yBot) + '" fill="none" stroke="currentColor" stroke-width="1.4"/>';
    g += '<path d="M ' + f(xr) + ' ' + f(yTop) + ' A ' + f(hh) + ' ' + f(sh.h / 2) + ' 0 0 1 ' + f(xr) + ' ' + f(yBot) + '" fill="none" stroke="currentColor" stroke-width="1.4"/>';
    for (const fr of [0.2, 0.8]) { const x = xl + sh.w * fr; g += line(x - 12, yBot + 16, x + 12, yBot + 16) + line(x - 8, yBot, x - 12, yBot + 16) + line(x + 8, yBot, x + 12, yBot + 16); }
    g += line(xl, yTop - 12, xr, yTop - 12, ' stroke-dasharray="3 2"') + txt((xl + xr) / 2, yTop - 16, 'TL ' + f(L));
    g += txt(xr + hh + 6, cy, 'ID ' + f(D), 'start');
    for (const n of spec.nozzles || []) { const x = xl + Math.min(Math.max(+n.at || 0, 0), L) * k; g += line(x, yTop, x, yTop - 22) + txt(x, yTop - 25, n.name || ''); }
  }
  void pad;
  g += txt(W / 2, Hh - 10, 'NOT ENGINEER-REVIEWED' + (spec.shellT ? ' · shell ' + f(spec.shellT) + ' mm' : ''));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '">' + g + '</svg>';
}
/** The vessel as BimCraft Plant equipment: its type and dimension parameters (mm). */
export function plantParams({ orientation = 'vertical', D, L, support }) {
  return orientation === 'horizontal' ? { type: 'vessel-h', params: { d: Math.round(D), len: Math.round(L), leg: Math.round(support || 500) } } : { type: 'vessel-v', params: { d: Math.round(D), h: Math.round(L), leg: Math.round(support || 600) } };
}
