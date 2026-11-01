/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lopa.js — layer of protection analysis and SIL arithmetic (0.8 Track CH, CH.15; DOM-free). The arithmetic is the published one: the mitigated event frequency is
 * the initiating-event frequency times the conditional modifiers times the PFD of each independent protection layer (IPL); a safety instrumented function (SIF) is
 * verified by its average probability of failure on demand (PFDavg) for the architecture (1oo1, 1oo2, 2oo2, 1oo3, 2oo3), the proof-test interval and the common-cause beta,
 * as in the public simplified equations of IEC 61508-6 Annex B / ISA TR84.00.02. The SIL bands are typed (SOURCES) and not confirmed.
 *
 * NO frequency, PFD, failure rate or target is typed here: every one is an input from the person, with the source they name. (Tables of generic values in
 * LOPA books are not reproduced; a company brings its own, as data.) A drafting and study aid, not an engineering approval.
 *
 *   scenario { id, name, hazopRow?, consequence, target (per year), initiating: [{ id, name, f (per year), tag? }], modifiers: [{ name, p }],
 *              ipls: [{ id, name, kind, pfd, tag?, shares?: [tags], source }], sif?: sifId }
 *   sif      { id, name, subsystems: [{ name, arch, lambdaDU (per hour), beta, TI (hours), PTC (0..1), LT (hours), tag? }], demand: 'low' | 'high' }
 *
 *   scenarioResult(sc) · requiredPfd(sc) · silBand(pfd) · silBandHigh(pfh) · pfdChannel · pfdAvgFormula(sub) · pfdAvgNumeric(sub) · verifySif(sif) · check(lopa)
 */
import { str, num, pos, oneOf, nextId, problem, clone } from './common.js';

export const SOURCES = {
  lopaFormula: 'f_mitigated = f_IE x prod(P_modifier) x prod(PFD_IPL) (the LOPA form of the CCPS method, as a public formula)',
  silLow: 'IEC 61508-1 Table 2 / IEC 61511-1 Table 3 low demand mode: SIL4 1e-5 to <1e-4, SIL3 1e-4 to <1e-3, SIL2 1e-3 to <1e-2, SIL1 1e-2 to <1e-1 (PFDavg)',
  silHigh: 'IEC 61508-1 Table 3 high demand or continuous mode: SIL4 1e-9 to <1e-8, SIL3 1e-8 to <1e-7, SIL2 1e-7 to <1e-6, SIL1 1e-6 to <1e-5 (PFH per hour)',
  pfd: 'Simplified PFDavg: 1oo1 lDU TI/2; 1oo2 ((1-b) lDU TI)^2/3 + b lDU TI/2; 2oo2 lDU TI; 1oo3 ((1-b) lDU TI)^3/4 + b lDU TI/2; 2oo3 ((1-b) lDU TI)^2 + b lDU TI/2',
};
export const REVIEW = { state: 'not confirmed', note: 'SIL bands and the simplified equations were typed without IEC 61508 / 61511 open. Architectural constraints (hardware fault tolerance, safe failure fraction) are NOT checked.' };
export const SIL_LOW = [{ sil: 4, lo: 1e-5, hi: 1e-4 }, { sil: 3, lo: 1e-4, hi: 1e-3 }, { sil: 2, lo: 1e-3, hi: 1e-2 }, { sil: 1, lo: 1e-2, hi: 1e-1 }];
export const SIL_HIGH = [{ sil: 4, lo: 1e-9, hi: 1e-8 }, { sil: 3, lo: 1e-8, hi: 1e-7 }, { sil: 2, lo: 1e-7, hi: 1e-6 }, { sil: 1, lo: 1e-6, hi: 1e-5 }];
const ARCH = { '1oo1': [1, 1], '1oo2': [1, 2], '2oo2': [2, 2], '1oo3': [1, 3], '2oo3': [2, 3] };
export const ARCHITECTURES = Object.keys(ARCH);
const KINDS = ['bpcs', 'alarm', 'relief', 'sif', 'mechanical', 'procedure', 'other'];

export const newLopa = () => ({ scenarios: [], sifs: [] });
export function cleanLopa(raw) {
  const l = newLopa(); if (!raw || typeof raw !== 'object') return l;
  l.scenarios = (Array.isArray(raw.scenarios) ? raw.scenarios : []).slice(0, 1000).filter((s) => s && typeof s === 'object').map((s, i) => ({
    id: str(s.id, 16) || 'L' + (i + 1), name: str(s.name, 120), hazopRow: str(s.hazopRow, 16), consequence: str(s.consequence, 300), target: pos(s.target),
    initiating: (Array.isArray(s.initiating) ? s.initiating : []).slice(0, 12).map((e, k) => ({ id: str(e?.id, 16) || 'IE' + (k + 1), name: str(e?.name, 120), f: pos(e?.f), tag: str(e?.tag, 24), source: str(e?.source, 200) })),
    modifiers: (Array.isArray(s.modifiers) ? s.modifiers : []).slice(0, 12).map((m) => ({ name: str(m?.name, 120), p: num(m?.p) >= 0 && num(m?.p) <= 1 ? m.p : undefined, source: str(m?.source, 200) })),
    ipls: (Array.isArray(s.ipls) ? s.ipls : []).slice(0, 20).map((p, k) => ({ id: str(p?.id, 16) || 'IPL' + (k + 1), name: str(p?.name, 120), kind: oneOf(p?.kind, KINDS, 'other'), pfd: num(p?.pfd) > 0 && num(p?.pfd) <= 1 ? p.pfd : undefined, tag: str(p?.tag, 24), shares: (Array.isArray(p?.shares) ? p.shares : []).slice(0, 8).map((x) => str(x, 24)).filter(Boolean), source: str(p?.source, 200) })),
    sif: str(s.sif, 16) })).filter((s) => s.id);
  l.sifs = (Array.isArray(raw.sifs) ? raw.sifs : []).slice(0, 500).filter((s) => s && typeof s === 'object').map((s, i) => ({
    id: str(s.id, 16) || 'SIF' + (i + 1), name: str(s.name, 120), demand: s.demand === 'high' ? 'high' : 'low',
    subsystems: (Array.isArray(s.subsystems) ? s.subsystems : []).slice(0, 6).map((u) => ({ name: str(u?.name, 80), arch: oneOf(u?.arch, ARCHITECTURES, '1oo1'), lambdaDU: num(u?.lambdaDU) >= 0 ? u.lambdaDU : undefined, beta: num(u?.beta) >= 0 && num(u?.beta) <= 0.5 ? u.beta : 0,
      TI: pos(u?.TI), PTC: num(u?.PTC) > 0 && num(u?.PTC) <= 1 ? u.PTC : 1, LT: pos(u?.LT), tag: str(u?.tag, 24), source: str(u?.source, 200) })) }));
  return l;
}
export function addScenario(l, sc) { const c = cleanLopa({ scenarios: [{ ...sc, id: sc.id || nextId('L', l.scenarios) }] }).scenarios[0]; if (l.scenarios.some((x) => x.id === c.id)) throw new Error('Scenario ' + c.id + ' exists.'); l.scenarios.push(c); return c; }

/** From a HAZOP row: a scenario shell with the consequence text and the row's safeguards listed as candidate layers (no PFD: the person gives each one). */
export function scenarioFromRow(h, rowId) {
  const r = h.rows.find((x) => x.id === rowId); if (!r) throw new Error('No row ' + rowId + '.');
  return { name: r.deviation, hazopRow: r.id, consequence: r.consequences.join('; '), initiating: r.causes.map((c, i) => ({ id: 'IE' + (i + 1), name: c })), modifiers: [], ipls: r.safeguards.map((s, i) => ({ id: 'IPL' + (i + 1), name: s, kind: 'other' })) };
}

/** Mitigated frequency per year: sum over initiating events of f x prod(modifier p) x prod(IPL PFD). Missing inputs are listed, never assumed. */
export function scenarioResult(sc) {
  const missing = [];
  if (!sc.initiating.length) missing.push('an initiating event');
  for (const e of sc.initiating) if (!(e.f > 0)) missing.push('frequency of ' + (e.name || e.id));
  for (const m of sc.modifiers) if (m.p === undefined) missing.push('probability of ' + (m.name || 'a modifier'));
  for (const p of sc.ipls) if (!(p.pfd > 0)) missing.push('PFD of ' + (p.name || p.id));
  const fIE = sc.initiating.reduce((s, e) => s + (e.f > 0 ? e.f : 0), 0), pm = sc.modifiers.reduce((a, m) => a * (m.p ?? 1), 1), pi = sc.ipls.reduce((a, p) => a * (p.pfd > 0 ? p.pfd : 1), 1);
  const f = fIE * pm * pi, t = sc.target;
  const out = { id: sc.id, complete: !missing.length, missing, fIE, modifiers: pm, ipls: pi, fMitigated: f, target: t ?? null };
  if (t > 0) { out.meets = f <= t; out.gap = f / t; out.rrf = f > t ? f / t : 1; out.requiredPfd = f > t ? t / f : 1; }
  return out;
}
/** The PFD a new layer (a SIF) must reach: target / (mitigated frequency without it). */
export function requiredPfd(sc, withoutSifId) {
  const copy = clone(sc); copy.ipls = copy.ipls.filter((p) => p.id !== withoutSifId); const r = scenarioResult(copy);
  return { requiredPfd: r.requiredPfd ?? null, silTarget: r.requiredPfd ? silBand(r.requiredPfd) : null, fWithout: r.fMitigated };
}

/** SIL for a PFDavg: the band it falls in; 0 when above SIL1's upper edge (no SIL), null when below SIL4's lower edge ("better than SIL4": not claimed). */
export function silBand(pfd) {
  if (!(pfd > 0)) return null;
  if (pfd >= 1e-1) return 0;
  for (const b of SIL_LOW) if (pfd >= b.lo && pfd < b.hi) return b.sil;
  return pfd < 1e-5 ? 4 : 0;
}
export function silBandHigh(pfh) {
  if (!(pfh > 0)) return null;
  if (pfh >= 1e-5) return 0;
  for (const b of SIL_HIGH) if (pfh >= b.lo && pfh < b.hi) return b.sil;
  return pfh < 1e-9 ? 4 : 0;
}

/** Unavailability of ONE channel at time t since new: dangerous undetected failures that the proof test finds (rate PTC lDU) are cleared every TI; the rest (1-PTC) stay until the end of life LT. */
export function pfdChannel(t, { lambdaDU, TI, PTC = 1, beta = 0 }) {
  const lt = (1 - beta) * lambdaDU * PTC, ln = (1 - beta) * lambdaDU * (1 - PTC), tau = t % TI;
  return 1 - Math.exp(-lt * tau - ln * t);
}
const choose = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; };
/** PFDavg by the closed forms (needs PTC = 1). */
export function pfdAvgFormula({ arch, lambdaDU, TI, beta = 0 }) {
  const l = lambdaDU * TI, a = (1 - beta) * l, c = beta * l / 2;
  switch (arch) { case '1oo1': return l / 2; case '1oo2': return a * a / 3 + c; case '2oo2': return l; case '1oo3': return a ** 3 / 4 + c; case '2oo3': return a * a + c; default: throw new Error('Unknown architecture ' + arch); }
}
/** PFDavg by averaging the exact channel unavailability over the life (Simpson), with KooN voting and the beta part as a common-cause element added. Handles PTC < 1. */
export function pfdAvgNumeric({ arch, lambdaDU, TI, beta = 0, PTC = 1, LT }) {
  if (!ARCH[arch]) throw new Error('Unknown architecture ' + arch);
  const [K, N] = ARCH[arch]; if (K === N) beta = 0;   // beta has no meaning with one channel, and in a 2oo2 any single failure already defeats the function
  const life = LT && LT >= TI ? LT : TI, steps = Math.max(200, Math.ceil(life / TI) * 400) & ~1, h = life / steps;
  const f = (t) => {
    const u = pfdChannel(Math.min(t, life - 1e-9), { lambdaDU, TI, PTC, beta });
    let p = 0; for (let j = N - K + 1; j <= N; j++) p += choose(N, j) * u ** j * (1 - u) ** (N - j);   // at least N-K+1 channels failed dangerously
    const ccf = N > 1 ? beta * lambdaDU * (PTC * (t % TI) + (1 - PTC) * t) : 0;   // first order common-cause term
    return p + ccf;
  };
  let s = f(0) + f(life); for (let i = 1; i < steps; i++) s += f(i * h) * (i % 2 ? 4 : 2);
  const v = s * h / 3 / life;
  return v;
}

/** A SIF: PFDavg per subsystem and in total (sum), the SIL of the total and of the weakest subsystem; notes list what was not checked. */
export function verifySif(sif, { target = null } = {}) {
  const subs = sif.subsystems.map((u) => {
    const ok = u.lambdaDU >= 0 && u.TI > 0;
    if (!ok) return { name: u.name, arch: u.arch, pfd: null, missing: [u.lambdaDU >= 0 ? '' : 'dangerous undetected failure rate', u.TI > 0 ? '' : 'proof-test interval'].filter(Boolean) };
    const pfd = pfdAvgNumeric({ arch: u.arch, lambdaDU: u.lambdaDU, TI: u.TI, beta: u.beta || 0, PTC: u.PTC ?? 1, LT: u.LT });
    return { name: u.name, arch: u.arch, pfd, formula: (u.PTC ?? 1) === 1 ? pfdAvgFormula({ arch: u.arch, lambdaDU: u.lambdaDU, TI: u.TI, beta: u.beta || 0 }) : null, sil: silBand(pfd), HFT: ARCH[u.arch][1] - ARCH[u.arch][0] };
  });
  const complete = subs.length > 0 && subs.every((s) => s.pfd != null), total = complete ? subs.reduce((a, s) => a + s.pfd, 0) : null;
  const out = { id: sif.id, complete, subsystems: subs, pfdAvg: total, sil: total == null ? null : silBand(total), demand: sif.demand,
    notes: ['Architectural constraints (hardware fault tolerance, safe failure fraction, route 1H or 2H) and systematic capability are not checked.', 'Failure rates and test intervals are the person\'s inputs; none is assumed.', REVIEW.note] };
  if (sif.demand === 'high') out.notes.push('High-demand mode needs PFH, not PFDavg: not computed here.');
  if (target != null && total != null) { out.meetsTarget = total <= target; out.targetPfd = target; }
  return out;
}

/** Problems for the LOPA and SIF set. `h` (the HAZOP) is optional: used to check the scenario's row exists. */
export function check(l, h = null) {
  const out = [];
  for (const sc of l.scenarios) {
    const about = [{ kind: 'lopa-scenario', id: sc.id, label: sc.name }], r = scenarioResult(sc);
    if (!r.complete) out.push(problem('lopa.incomplete', 'warning', `Scenario ${sc.id} is missing ${r.missing.slice(0, 3).join(', ')}${r.missing.length > 3 ? ' …' : ''}; no result is claimed.`, about));
    if (!(sc.target > 0)) out.push(problem('lopa.target', 'warning', `Scenario ${sc.id} has no target frequency (the company's risk criteria).`, about));
    if (r.complete && r.meets === false) out.push(problem('lopa.gap', 'error', `Scenario ${sc.id}: mitigated frequency ${r.fMitigated.toExponential(2)} per year is above the target ${sc.target.toExponential(2)}; the gap needs a risk reduction factor of ${r.rrf.toPrecision(3)}.`, about, { req: { op: '<=', value: sc.target, unit: '1/yr' }, found: { value: r.fMitigated, unit: '1/yr' } }));
    const tags = new Map();
    for (const p of sc.ipls) {
      const aboutP = about.concat([{ kind: 'lopa-ipl', id: p.id }]);
      for (const t of [p.tag, ...(p.shares || [])].filter(Boolean)) { if (tags.has(t) && tags.get(t) !== p.id) out.push(problem('lopa.independence', 'warning', `Layers ${tags.get(t)} and ${p.id} share ${t}; they are not independent, so credit only one.`, aboutP)); else tags.set(t, p.id); }
      for (const e of sc.initiating) if (p.tag && e.tag && p.tag === e.tag) out.push(problem('lopa.cause', 'error', `Layer ${p.id} uses ${p.tag}, which is also the initiating cause: it is not independent of it.`, aboutP));
      if (p.pfd > 0 && !p.source) out.push(problem('lopa.source', 'note', `Layer ${p.id} has a PFD with no source named.`, aboutP));
      if (p.kind === 'sif' && !sc.sif) out.push(problem('lopa.sif.link', 'note', `Layer ${p.id} is a SIF but the scenario names no SIF to verify it.`, aboutP));
    }
    for (const e of sc.initiating) if (e.f > 0 && !e.source) out.push(problem('lopa.source', 'note', `Initiating event ${e.id} has a frequency with no source named.`, about));
    if (h && sc.hazopRow && !h.rows.some((x) => x.id === sc.hazopRow)) out.push(problem('lopa.row', 'warning', `Scenario ${sc.id} points at HAZOP row ${sc.hazopRow}, which is not in the worksheet.`, about));
    if (sc.sif) {
      const sif = l.sifs.find((x) => x.id === sc.sif);
      if (!sif) out.push(problem('lopa.sif.missing', 'warning', `Scenario ${sc.id} names SIF ${sc.sif}, which is not defined.`, about));
      else {
        const layer = sc.ipls.find((p) => p.kind === 'sif'), v = verifySif(sif, { target: layer?.pfd });
        if (!v.complete) out.push(problem('sif.incomplete', 'warning', `SIF ${sif.id} is missing failure rates or a test interval; no PFDavg is claimed.`, [{ kind: 'lopa-sif', id: sif.id }]));
        else if (layer && layer.pfd > 0 && v.pfdAvg > layer.pfd) out.push(problem('sif.pfd', 'error', `SIF ${sif.id}: PFDavg ${v.pfdAvg.toExponential(2)} is above the ${layer.pfd.toExponential(2)} the scenario credits it.`, [{ kind: 'lopa-sif', id: sif.id }], { req: { op: '<=', value: layer.pfd, unit: 'PFDavg' }, found: { value: v.pfdAvg, unit: 'PFDavg' } }));
        else if (v.sil === 0) out.push(problem('sif.sil0', 'warning', `SIF ${sif.id}: PFDavg ${v.pfdAvg.toExponential(2)} is above the SIL 1 band.`, [{ kind: 'lopa-sif', id: sif.id }]));
      }
    }
  }
  return out;
}
