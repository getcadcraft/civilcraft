/* SPDX-License-Identifier: Apache-2.0 */
/**
 * membrane.js — membrane units for water treatment (0.11 CH.37, session water-b-11; DOM-free). Every coefficient is the person's input; the typical ranges the
 * Problems quote are from documents read (docs/refs/water-treatment-ch35-38.md § R5), and a value outside them is a warning, never a refusal.
 *
 *   mbr(input)   membrane bioreactor separation stage: membrane area from a design flux, permeate and retentate flows, the solids balance across the membrane
 *   ro(input)    reverse osmosis by the solution-diffusion model: water and salt flux, recovery, permeate and concentrate, the pressure needed
 *
 * SOURCES
 *   MBR_TYPICAL  Lousada Ferreira (2012), "Membrane BioReactors", CIE4485 lecture 4a, TU Delft OpenCourseWare, slide "Relevant operational parameters": submerged MBR
 *                TMP about 20 kPa, sustainable long-term flux 15-30 L/m2/h, SRT > 20 d, HRT 1-9 h; MLSS usually 8-15 g/L. US EPA (2010) EPA/600/R-10/100 p. 11-15:
 *                Qp = Fw A (Eq. 11-6), immersed membranes 16-24 gpd/ft2 (WEF 2006). US EPA (2007) EPA 832-F-07-015 p. 2-3: peak flows beyond 1.5-2 x the average
 *                design flow need more membrane or equalization.
 *   RO           Li and Li (2025), Chem. Eng. Res. Des., doi 10.1016/j.cherd.2025.01.012 (accepted manuscript, NSF PAR): Jw = Lp [(Pr - Pp) - (pi_w - pi_p)] (Eq. 1),
 *                Js = Bs (Cw - Cp) (Eq. 2), pi = f_os C at low concentration, mean bulk concentration [-ln(1 - Y)/Y] C0 (Eq. 5); one commercial seawater element at
 *                35,000 ppm and 27 C: pi0 25-26 bar, Lp 1.06-1.51 L/m2/h/bar, Bs 0.044-0.126 L/m2/h. Brackish membranes differ and none were read.
 * A study aid, not a process design approval.
 */
import { problem as baseProblem } from '../report.js';

const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, id = 'membrane') => { const p = baseProblem('membrane.' + code, severity, text, [{ kind: 'unit', id }]); p.source = SRC; return p; };
export const GPD_FT2_TO_LMH = 3.785411784 / 0.09290304 / 24;   // US gal/ft2/d → L/m2/h (exact unit definitions)
export const MBR_TYPICAL = Object.freeze({ flux: [15, 30], tmp_kPa: 20, mlss: [8, 15], srt: 20, hrt: [1, 9], immersedGfd: [16, 24], peak: [1.5, 2],
  source: 'Lousada Ferreira 2012 (TU Delft OCW CIE4485 lecture 4a); US EPA 2010 EPA/600/R-10/100 p. 11-15; US EPA 2007 EPA 832-F-07-015 p. 2-3' });
export const RO_TYPICAL = Object.freeze({ Lp: [1.06, 1.51], Bs: [0.044, 0.126], fos: 26 / 35, source: 'Li and Li 2025, one seawater RO element (35,000 ppm TDS, 27 C: pi0 about 26 bar, so f_os about 26/35 bar per g/L)' });
const num = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * MBR stage. input { Qp (m3/d, net permeate = plant flow less waste), flux (L/m2/h, design net flux), peakFactor? (peak / average flow), fluxPeak? (L/m2/h allowed at
 * peak; default = flux), recycle (retentate return as a multiple of Qp), mlss (g/L in the membrane tank feed), rejection? (fraction of solids kept, default 1),
 * tmp? (kPa, for permeability), volume? (m3 of the biological tanks, for HRT), srt? (d) }
 * → { area, areaPeak, areaUsed, feed, retentate, permeateSolids, retentateMLSS, permeability, hrt, lines, problems }
 */
export function mbr(input) {
  const ps = [], i = input || {};
  for (const k of ['Qp', 'flux', 'recycle', 'mlss']) if (!num(i[k])) ps.push(problem('input', 'error', `MBR needs ${k} (a number).`, 'MBR'));
  if (ps.length) return { problems: ps, lines: [] };
  if (!(i.Qp > 0)) ps.push(problem('qp', 'error', 'The permeate flow must be above 0 m3/d.', 'MBR'));
  if (!(i.flux > 0)) ps.push(problem('flux', 'error', 'The design flux must be above 0 L/m2/h.', 'MBR'));
  if (!(i.recycle > 0)) ps.push(problem('recycle', 'error', 'The retentate recycle must be above 0 (a multiple of the permeate flow): with none the membrane tank would fill with solids.', 'MBR'));
  if (!(i.mlss > 0)) ps.push(problem('mlss', 'error', 'The mixed liquor solids must be above 0 g/L.', 'MBR'));
  const rej = i.rejection ?? 1;
  if (!(rej > 0 && rej <= 1)) ps.push(problem('rejection', 'error', 'Solids rejection is a fraction above 0 and at most 1.', 'MBR'));
  if (ps.some((p) => p.severity === 'error')) return { problems: ps, lines: [] };
  const T = MBR_TYPICAL, m3m2d = (lmh) => lmh * 24 / 1000;
  if (i.flux < T.flux[0] || i.flux > T.flux[1]) ps.push(problem('flux.range', 'warning', `Design flux ${i.flux} L/m2/h is outside the sustainable long-term 15-30 L/m2/h for submerged MBRs (Lousada Ferreira 2012).`, 'MBR'));
  if (i.mlss < T.mlss[0] || i.mlss > T.mlss[1]) ps.push(problem('mlss.range', 'warning', `MLSS ${i.mlss} g/L is outside the usual 8-15 g/L of MBRs (Lousada Ferreira 2012).`, 'MBR'));
  const peak = i.peakFactor ?? 1;
  if (!(peak >= 1)) ps.push(problem('peak', 'error', 'The peak factor is peak flow over average flow: 1 or more.', 'MBR'));
  else if (peak > T.peak[1]) ps.push(problem('peak.high', 'warning', `A peak of ${peak} x the average is above the 1.5-2 x membranes are usually sized for: add membrane or equalization (US EPA 2007, EPA 832-F-07-015).`, 'MBR'));
  const area = i.Qp / m3m2d(i.flux), fluxPeak = i.fluxPeak ?? i.flux, areaPeak = peak * i.Qp / m3m2d(fluxPeak), areaUsed = Math.max(area, areaPeak);
  // solids across the membrane: feed Qf = Qp (1 + R) at X; permeate carries (1 - rejection) X; retentate Qr = R Qp carries the rest
  const Qf = i.Qp * (1 + i.recycle), Qr = i.Qp * i.recycle, Xp = (1 - rej) * i.mlss, Xr = (Qf * i.mlss - i.Qp * Xp) / Qr;
  const permeability = num(i.tmp) && i.tmp > 0 ? i.flux / i.tmp : null;
  if (num(i.tmp) && Math.abs(i.tmp - T.tmp_kPa) > T.tmp_kPa) ps.push(problem('tmp.range', 'info', `TMP ${i.tmp} kPa is far from the about 20 kPa of submerged MBRs (Lousada Ferreira 2012).`, 'MBR'));
  const hrt = num(i.volume) && i.volume > 0 ? i.volume / i.Qp * 24 : null;
  if (hrt != null && (hrt < T.hrt[0] || hrt > T.hrt[1])) ps.push(problem('hrt.range', 'info', `Hydraulic retention ${hrt.toFixed(1)} h is outside the 1-9 h typical of MBRs (Lousada Ferreira 2012).`, 'MBR'));
  if (num(i.srt) && i.srt < T.srt) ps.push(problem('srt.range', 'info', `Sludge age ${i.srt} d is below the > 20 d typical of MBRs (Lousada Ferreira 2012).`, 'MBR'));
  if (Xr / i.mlss > 1.5) ps.push(problem('retentate', 'warning', `The retentate leaves at ${Xr.toFixed(1)} g/L (${(Xr / i.mlss).toFixed(2)} x the feed): raise the recycle to keep the membrane tank from thickening.`, 'MBR'));
  const r = { area, areaPeak, areaUsed, flux: i.flux, feed: Qf, retentate: Qr, permeate: i.Qp, permeateSolids: Xp, retentateMLSS: Xr, permeability, hrt };
  const lines = [
    { k: 'membrane area (average flow)', v: +area.toPrecision(6), u: 'm2' }, { k: 'membrane area (peak flow)', v: +areaPeak.toPrecision(6), u: 'm2' }, { k: 'membrane area to install', v: +areaUsed.toPrecision(6), u: 'm2' },
    { k: 'membrane tank feed', v: +Qf.toPrecision(6), u: 'm3/d' }, { k: 'retentate return', v: +Qr.toPrecision(6), u: 'm3/d' }, { k: 'permeate', v: +i.Qp.toPrecision(6), u: 'm3/d' },
    { k: 'retentate solids', v: +Xr.toPrecision(5), u: 'g/L' }, { k: 'permeate solids', v: +(Xp * 1000).toPrecision(4), u: 'mg/L' },
  ];
  if (permeability != null) lines.push({ k: 'permeability', v: +permeability.toPrecision(4), u: 'L/m2/h/kPa' });
  if (hrt != null) lines.push({ k: 'hydraulic retention', v: +hrt.toPrecision(4), u: 'h' });
  return { ...r, lines, problems: ps };
}

/**
 * Reverse osmosis, one stage, by the solution-diffusion model with the mean bulk concentration of Li and Li (2025) Eq. 5.
 * input { Qf (m3/d feed), C0 (g/L salt in the feed), recovery Y (0-1), Lp (L/m2/h/bar), Bs (L/m2/h), fos (bar per g/L), area? (m2) OR flux? (L/m2/h design),
 *         cpf? (concentration polarization factor, wall / bulk, default 1 = none), Pp? (bar permeate pressure, default 0), maxPressure? (bar, the pump or housing limit) }
 * → { area, flux, Cbulk, Cwall, Cp, Cc, Qp, Qc, rejection, piWall, piPermeate, TMP, Pfeed, saltFlux, lines, problems }
 */
export function ro(input) {
  const ps = [], i = input || {};
  for (const k of ['Qf', 'C0', 'recovery', 'Lp', 'Bs', 'fos']) if (!num(i[k])) ps.push(problem('input', 'error', `RO needs ${k} (a number; every coefficient is yours, see the help for the ranges read).`, 'RO'));
  if (ps.length) return { problems: ps, lines: [] };
  if (!(i.Qf > 0)) ps.push(problem('qf', 'error', 'The feed flow must be above 0 m3/d.', 'RO'));
  if (!(i.C0 >= 0)) ps.push(problem('c0', 'error', 'The feed concentration cannot be negative.', 'RO'));
  if (!(i.recovery > 0 && i.recovery < 1)) ps.push(problem('recovery', 'error', 'Recovery is the permeate share of the feed: above 0 and below 1.', 'RO'));
  if (!(i.Lp > 0)) ps.push(problem('lp', 'error', 'The water permeability Lp must be above 0 L/m2/h/bar.', 'RO'));
  if (!(i.Bs >= 0)) ps.push(problem('bs', 'error', 'The salt permeability Bs cannot be negative.', 'RO'));
  if (!(i.fos > 0)) ps.push(problem('fos', 'error', 'The osmotic coefficient f_os must be above 0 bar per g/L.', 'RO'));
  if (!(num(i.area) && i.area > 0) && !(num(i.flux) && i.flux > 0)) ps.push(problem('size', 'error', 'Give the membrane area (m2) or a design flux (L/m2/h).', 'RO'));
  const cpf = i.cpf ?? 1;
  if (!(cpf >= 1)) ps.push(problem('cpf', 'error', 'The polarization factor is wall over bulk concentration: 1 or more.', 'RO'));
  if (ps.some((p) => p.severity === 'error')) return { problems: ps, lines: [] };
  const R = RO_TYPICAL, Y = i.recovery, Qp = Y * i.Qf, Qc = i.Qf - Qp;
  if (i.Lp < R.Lp[0] || i.Lp > R.Lp[1]) ps.push(problem('lp.range', 'info', `Lp ${i.Lp} L/m2/h/bar is outside 1.06-1.51, the one seawater element read (Li and Li 2025); brackish membranes are more permeable and none were read: use your membrane's sheet.`, 'RO'));
  if (i.Bs < R.Bs[0] || i.Bs > R.Bs[1]) ps.push(problem('bs.range', 'info', `Bs ${i.Bs} L/m2/h is outside 0.044-0.126, the one seawater element read (Li and Li 2025): use your membrane's sheet.`, 'RO'));
  if (Y > 0.5 && i.C0 > 20) ps.push(problem('recovery.high', 'warning', `Recovery ${Y} on a ${i.C0} g/L feed: the concentrate reaches about ${(i.C0 / (1 - Y)).toFixed(0)} g/L, and the mean bulk value of Eq. 5 is meant for a single element at low recovery (Li and Li 2025).`, 'RO'));
  const area = num(i.area) && i.area > 0 ? i.area : Qp / (i.flux * 24 / 1000), Jw = Qp * 1000 / 24 / area;   // L/m2/h
  const Cbulk = -Math.log(1 - Y) / Y * i.C0, Cw = cpf * Cbulk, Cp = i.Bs * Cw / (Jw + i.Bs);                 // Js = Bs (Cw - Cp), Cp = Js / Jw
  const piW = i.fos * Cw, piP = i.fos * Cp, TMP = Jw / i.Lp + (piW - piP), Pfeed = TMP + (i.Pp ?? 0), Cc = (i.Qf * i.C0 - Qp * Cp) / Qc;
  if (num(i.maxPressure) && Pfeed > i.maxPressure) ps.push(problem('pressure', 'error', `The feed needs ${Pfeed.toFixed(1)} bar, above your limit of ${i.maxPressure} bar: lower the recovery or the flux, or add membrane.`, 'RO'));
  if (Jw / i.Lp < 0.1 * (piW - piP)) ps.push(problem('netdrive', 'info', 'The net driving pressure is small next to the osmotic pressure: the flux is very sensitive to the feed pressure here.', 'RO'));
  const lines = [
    { k: 'permeate', v: +Qp.toPrecision(6), u: 'm3/d' }, { k: 'concentrate', v: +Qc.toPrecision(6), u: 'm3/d' }, { k: 'membrane area', v: +area.toPrecision(6), u: 'm2' },
    { k: 'water flux Jw', v: +Jw.toPrecision(5), u: 'L/m2/h' }, { k: 'salt flux Js', v: +(i.Bs * (Cw - Cp)).toPrecision(5), u: 'g/m2/h' },
    { k: 'mean bulk concentration', v: +Cbulk.toPrecision(5), u: 'g/L' }, { k: 'wall concentration', v: +Cw.toPrecision(5), u: 'g/L' },
    { k: 'permeate concentration', v: +(Cp * 1000).toPrecision(5), u: 'mg/L' }, { k: 'concentrate concentration', v: +Cc.toPrecision(5), u: 'g/L' },
    { k: 'salt rejection', v: +(1 - Cp / i.C0 || 0).toPrecision(5) }, { k: 'osmotic pressure at the wall', v: +piW.toPrecision(5), u: 'bar' },
    { k: 'transmembrane pressure needed', v: +TMP.toPrecision(5), u: 'bar' }, { k: 'feed pressure', v: +Pfeed.toPrecision(5), u: 'bar' },
  ];
  return { area, flux: Jw, Cbulk, Cwall: Cw, Cp, Cc, Qp, Qc, rejection: i.C0 > 0 ? 1 - Cp / i.C0 : null, piWall: piW, piPermeate: piP, TMP, Pfeed, saltFlux: i.Bs * (Cw - Cp), lines, problems: ps };
}
