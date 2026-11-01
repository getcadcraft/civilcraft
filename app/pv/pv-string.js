/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pv-string.js — how many modules in a string and how many strings on an inverter (0.8 EG.15, session `energy_PART_2`). No DOM, no model. The module and
 * inverter are the person's rows (pv.js STARTER_* are labelled placeholders); the temperatures and the safety factors are typed.
 *
 *   vocAt(module, T) = Voc · (1 + βVoc (T − 25))            the same for Vmp with βVmp        (temperature coefficients as fractions per kelvin)
 *   stringWindow(module, inverter, { tMin, tHot, vSys, vocFactor }) → { vocCold, vmpCold, vmpHot, nMax, nMin, byVoc, byMppt, vLimit }
 *       nMax = floor(min(Vdc max, system limit) / (Voc,cold · vocFactor)) and also floor(MPPT max / Vmp,cold);  nMin = ceil(MPPT min / Vmp,hot)
 *   designStrings({ modules, module, inverter, ... }) → { n, count, leftover, mppts, perMppt, ok, checks, problems, window }
 *       the longest string that divides the modules evenly inside the window (else the one that leaves the fewest over); strings spread over the MPPT inputs
 *       so that each carries at most floor(I max / (Imp or Isc)) strings; DC ÷ AC power judged against typed bounds.
 * Safety factors are parameters (vocFactor 1.0 by default; many codes want 1.25 on Voc at the coldest temperature; Isc factors are in pv-oneline.js): the
 * numbers shown are the person's, not a statement of compliance.
 */
export const vocAt = (m, T) => m.voc * (1 + m.betaVoc * (T - 25));
export const vmpAt = (m, T) => m.vmp * (1 + (m.betaVmp ?? m.betaVoc) * (T - 25));
export const DEFAULT_STRING = Object.freeze({ tMin: -10, tHot: 70, vSys: 1000, vocFactor: 1, dcacMin: 1.0, dcacMax: 1.5, label: 'starter values — replace with your site\'s record low, hot-cell temperature and the code\'s limits' });
const r2 = (x) => Math.round(x * 100) / 100;

export function stringWindow(module, inv, o = {}) {
  const O = { ...DEFAULT_STRING, ...o };
  const vocCold = vocAt(module, O.tMin), vmpCold = vmpAt(module, O.tMin), vmpHot = vmpAt(module, O.tHot);
  const vLimit = Math.min(inv.vdcMax, O.vSys);
  const byVoc = Math.floor(vLimit / (vocCold * O.vocFactor) + 1e-9);
  const byMppt = inv.mpptMax > 0 ? Math.floor(inv.mpptMax / vmpCold + 1e-9) : Infinity;
  return { vocCold: r2(vocCold), vmpCold: r2(vmpCold), vmpHot: r2(vmpHot), vLimit, nMax: Math.min(byVoc, byMppt), byVoc, byMppt, nMin: Math.ceil(inv.mpptMin / vmpHot - 1e-9), O };
}

/** Modules `modules` on `inverters` identical inverters (default 1). */
export function designStrings({ modules, module, inverter, inverters = 1, ...opts }) {
  const W = stringWindow(module, inverter, opts), O = W.O;
  const problems = [], checks = [];
  if (!(W.nMax >= 1)) { problems.push({ code: 'string.voc', severity: 'error', vars: { vocCold: W.vocCold, limit: W.vLimit }, req: { op: '<=', value: W.vLimit, unit: 'V' }, found: { value: r2(W.vocCold * O.vocFactor), unit: 'V' } }); return { ok: false, n: 0, count: 0, leftover: modules, window: W, checks, problems }; }
  if (W.nMin > W.nMax) problems.push({ code: 'string.window', severity: 'error', vars: { nMin: W.nMin, nMax: W.nMax }, req: { op: '<=', value: W.nMax, unit: 'modules' }, found: { value: W.nMin, unit: 'modules' } });
  let best = null;
  for (let n = Math.min(W.nMax, modules); n >= Math.max(1, W.nMin); n--) {
    const count = Math.floor(modules / n), left = modules - count * n;
    if (count < 1) continue;
    if (!best || left < best.left) best = { n, count, left };
    if (left === 0) break;
  }
  if (!best) { best = { n: Math.min(W.nMax, modules), count: 1, left: Math.max(0, modules - Math.min(W.nMax, modules)) }; problems.push({ code: 'string.mppt.low', severity: 'error', vars: { n: best.n, nMin: W.nMin }, req: { op: '>=', value: W.nMin, unit: 'modules' }, found: { value: best.n, unit: 'modules' } }); }
  const { n, count, left } = best;
  const vocString = r2(n * W.vocCold * O.vocFactor), vmpHotString = r2(n * W.vmpHot), vmpColdString = r2(n * W.vmpCold);
  checks.push({ key: 'voc', value: vocString, limit: W.vLimit, op: '<=', unit: 'V', ok: vocString <= W.vLimit });
  checks.push({ key: 'mpptMax', value: vmpColdString, limit: inverter.mpptMax, op: '<=', unit: 'V', ok: !(inverter.mpptMax > 0) || vmpColdString <= inverter.mpptMax });
  checks.push({ key: 'mpptMin', value: vmpHotString, limit: inverter.mpptMin, op: '>=', unit: 'V', ok: vmpHotString >= inverter.mpptMin });
  if (!checks[0].ok) problems.push({ code: 'string.voc', severity: 'error', vars: { vocCold: vocString, limit: W.vLimit }, req: { op: '<=', value: W.vLimit, unit: 'V' }, found: { value: vocString, unit: 'V' } });
  if (!checks[1].ok) problems.push({ code: 'string.mppt.high', severity: 'warning', vars: { v: vmpColdString, max: inverter.mpptMax }, req: { op: '<=', value: inverter.mpptMax, unit: 'V' }, found: { value: vmpColdString, unit: 'V' } });
  if (!checks[2].ok) problems.push({ code: 'string.mppt.low', severity: 'warning', vars: { v: vmpHotString, min: inverter.mpptMin }, req: { op: '>=', value: inverter.mpptMin, unit: 'V' }, found: { value: vmpHotString, unit: 'V' } });
  // strings per MPPT input from the current limits; inputs available
  const mppts = Math.max(1, (inverter.mppts || 1) * inverters);
  const perMpptImp = inverter.idcMax > 0 ? Math.floor(inverter.idcMax / module.imp + 1e-9) : Infinity;
  const perMpptIsc = inverter.iscMax > 0 ? Math.floor(inverter.iscMax / module.isc + 1e-9) : Infinity;
  const perMppt = Math.min(perMpptImp, perMpptIsc);
  const needMppts = perMppt >= 1 ? Math.ceil(count / perMppt) : Infinity;
  checks.push({ key: 'current', value: r2(module.imp), limit: inverter.idcMax, op: '<=', unit: 'A', ok: perMppt >= 1 });
  if (perMppt < 1) problems.push({ code: 'string.current', severity: 'error', vars: { imp: module.imp, max: inverter.idcMax }, req: { op: '<=', value: inverter.idcMax, unit: 'A' }, found: { value: module.imp, unit: 'A' } });
  else if (needMppts > mppts) problems.push({ code: 'string.inputs', severity: 'error', vars: { count, perMppt, mppts }, req: { op: '<=', value: mppts * perMppt, unit: 'strings' }, found: { value: count, unit: 'strings' } });
  checks.push({ key: 'inputs', value: count, limit: mppts * (Number.isFinite(perMppt) ? perMppt : count), op: '<=', unit: 'strings', ok: needMppts <= mppts });
  if (left > 0) problems.push({ code: 'string.uneven', severity: 'note', vars: { left, n, count }, found: { value: left, unit: 'modules' } });
  // DC ÷ AC
  const kwp = n * count * module.wp / 1000, ac = inverter.pacKw * inverters, dcac = ac > 0 ? kwp / ac : 0;
  checks.push({ key: 'dcac', value: r2(dcac), limit: O.dcacMax, op: '<=', unit: '', ok: dcac >= O.dcacMin && dcac <= O.dcacMax });
  if (ac > 0 && dcac > O.dcacMax) problems.push({ code: 'string.dcac.high', severity: 'warning', vars: { ratio: r2(dcac), max: O.dcacMax }, req: { op: '<=', value: O.dcacMax }, found: { value: r2(dcac) } });
  if (ac > 0 && dcac < O.dcacMin) problems.push({ code: 'string.dcac.low', severity: 'note', vars: { ratio: r2(dcac), min: O.dcacMin }, req: { op: '>=', value: O.dcacMin }, found: { value: r2(dcac) } });
  const stringsPerMppt = Number.isFinite(needMppts) ? distribute(count, Math.min(mppts, Math.max(1, needMppts))) : [count];
  return { ok: !problems.some((p) => p.severity === 'error'), n, count, leftover: left, mppts, mpptsUsed: stringsPerMppt.length, stringsPerMppt, perMppt: Number.isFinite(perMppt) ? perMppt : null, kwp: r2(kwp), acKw: ac, dcac: r2(dcac),
    vocString, vmpHotString, vmpColdString, window: W, checks, problems, inputs: { ...O } };
}
const distribute = (total, bins) => { const base = Math.floor(total / bins), extra = total - base * bins; return Array.from({ length: bins }, (_, i) => base + (i < extra ? 1 : 0)); };
