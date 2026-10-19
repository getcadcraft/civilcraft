/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sewer.js — sanitary design flows on a gravity network (0.6 LC.16 step S1, spike docs/spikes/LC.16_PART_2.md). No DOM; the
 * Node test drives it (bin/test-civilcraft-sewer.mjs, checked against a published design sheet).
 *
 *   structure.sew = { pop, area }   people (or equivalent people for commercial land) and tributary area that enter there
 *                                   (area in hectares for metre projects, acres for feet projects)
 *   net.sewer = { perCap, infil, peak: 'harmon'|'babbitt', pfMin, pfMax, n, vMin, vMax, maxFull }   placeholders, not a standard
 *     perCap   average flow per person a day: L (metre projects) | US gallons (feet projects)
 *     infil    infiltration allowance: L/s per ha | US gallons a day per acre
 *     peak     Harmon 1 + 14 / (4 + √P) | Babbitt 5 / P^0.2, P in thousands, held between pfMin and pfMax
 *     maxFull  the most of a pipe's full capacity the peak may use (0.8 = 80 %)
 *     vMin / vMax  the actual (part-full) velocity at the peak flow, m/s | ft/s
 *
 *   sewerFlows(net, units) → { pipes: Map(id → { P, area, pf, qDom, qInf, Q, S, len, cap, vFull, ratio, yn, V }),
 *                              structs: Map(id → { P, area }), problems: [{ id, kind, msg }], sewer }
 *     In flow order (a loop is refused): each pipe carries everything that enters at or above its upper structure. Flows in
 *     project units (m³/s | cfs); qDom = P × perCap × pf; Q = qDom + qInf. cap and vFull: Manning full (hydro.js); yn and V:
 *     the normal depth and the velocity there (V = Q / part-full area; null yn = more than the pipe carries).
 *     Problems: over (Q above maxFull × cap, or more than it carries), slow (V < vMin), fast (V > vMax), flat (no fall).
 *   sizeSewers(net, flows, units, { sizes }) → [{ id, dia, ok }]   the smallest size whose capacity × maxFull carries Q
 *   peakingFactor(pop, sewer) · cleanSewer(o, units) · cleanSewLoad(o) · SEWER_DEFAULTS(units) · SEWER_SIZES · flowText(q, units)
 */

import { t } from './i18n.js';
import { manningFull, normalDepth, partFull } from './hydro.js';
import { DIA_UNIT, flowOrder } from './pipes.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const GAL_FT3 = 0.133680556;          // one US gallon in cubic feet
export const SEWER_SIZES = { ft: [8, 10, 12, 15, 18, 21, 24, 27, 30, 36, 42, 48, 54, 60], m: [200, 250, 300, 375, 450, 525, 600, 675, 750, 825, 900, 1050, 1200, 1350, 1500] };

export function SEWER_DEFAULTS(units = 'ft') {
  return units === 'm'
    ? { perCap: 350, infil: 0.2, peak: 'harmon', pfMin: 1.5, pfMax: 4, n: 0.013, vMin: 0.6, vMax: 3, maxFull: 0.8 }
    : { perCap: 100, infil: 200, peak: 'harmon', pfMin: 1.5, pfMax: 4, n: 0.013, vMin: 2, vMax: 10, maxFull: 0.8 };
}
export function cleanSewer(o, units = 'ft') {
  const d = SEWER_DEFAULTS(units);
  if (!o || typeof o !== 'object') return { ...d };
  const pos = (v, dv, max) => (fin(v) && v > 0 && v < max ? v : dv);
  const non = (v, dv, max) => (fin(v) && v >= 0 && v < max ? v : dv);
  const pfMin = pos(o.pfMin, d.pfMin, 100), pfMax = pos(o.pfMax, d.pfMax, 100);
  return {
    perCap: non(o.perCap, d.perCap, 1e5), infil: non(o.infil, d.infil, 1e6), peak: o.peak === 'babbitt' ? 'babbitt' : 'harmon',
    pfMin: Math.min(pfMin, pfMax), pfMax: Math.max(pfMin, pfMax), n: pos(o.n, d.n, 1),
    vMin: non(o.vMin, d.vMin, 100), vMax: pos(o.vMax, d.vMax, 100), maxFull: fin(o.maxFull) && o.maxFull > 0 && o.maxFull <= 1 ? o.maxFull : d.maxFull,
  };
}
/** A structure's sanitary load, clean, or null (nothing enters there). */
export function cleanSewLoad(o) {
  if (!o || typeof o !== 'object') return null;
  const pop = fin(o.pop) && o.pop >= 0 && o.pop < 1e9 ? o.pop : 0, area = fin(o.area) && o.area >= 0 && o.area < 1e9 ? o.area : 0;
  return pop || area ? { pop, area } : null;
}

/** The peaking factor for a population (people, not thousands), held between pfMin and pfMax. Zero people: pfMax. */
export function peakingFactor(pop, sw) {
  const P = Math.max(0, pop) / 1000;
  const f = !(P > 0) ? sw.pfMax : sw.peak === 'babbitt' ? 5 / Math.pow(P, 0.2) : 1 + 14 / (4 + Math.sqrt(P));
  return Math.min(sw.pfMax, Math.max(sw.pfMin, f));
}

/** Per person a day and infiltration per area → project flow units (m³/s | cfs). */
const domFlow = (pop, sw, units) => (units === 'm' ? (pop * sw.perCap) / 1000 / 86400 : (pop * sw.perCap * GAL_FT3) / 86400);
const infFlow = (area, sw, units) => (units === 'm' ? (area * sw.infil) / 1000 : (area * sw.infil * GAL_FT3) / 86400);
const diaOf = (p, units) => (Number(p.dia) || 0) / DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit;

/** A flow for people: L/s (metre projects) or gpm and cfs (feet projects). */
export function flowText(q, units) {
  return units === 'm' ? (q * 1000).toFixed(1) + ' L/s' : (q / GAL_FT3 * 60).toFixed(0) + ' gpm (' + q.toFixed(3) + ' cfs)';   // i18n-ignore: unit symbols
}

export function sewerFlows(net, units = 'ft') {
  const sw = cleanSewer(net?.sewer, units), problems = [];
  const structs = new Map((net?.structures || []).map((s) => { const l = cleanSewLoad(s.sew); return [s.id, { P: l?.pop || 0, area: l?.area || 0 }]; }));
  const pipes = new Map();
  const ord = flowOrder(net || { pipes: [] });
  if (!ord) { problems.push({ id: null, kind: 'network', msg: t('hy.loop') }); return { structs, pipes, problems, sewer: sw }; }
  const byId = new Map((net?.structures || []).map((x) => [x.id, x]));
  for (const p of ord) {
    const up = structs.get(p.from), dn = structs.get(p.to);
    if (!up || !dn) continue;
    const a = byId.get(p.from), b = byId.get(p.to), len = Math.hypot(b.x - a.x, b.y - a.y);
    const S = fin(p.invUp) && fin(p.invDn) && len > 0 ? (p.invUp - p.invDn) / len : 0;
    const pf = peakingFactor(up.P, sw), qDom = domFlow(up.P, sw, units) * pf, qInf = infFlow(up.area, sw, units), Q = qDom + qInf;
    const D = diaOf(p, units), full = manningFull(D, S, sw.n, units);
    const r = { P: up.P, area: up.area, pf, qDom, qInf, Q, S, len, cap: full.Q, vFull: full.V, ratio: full.Q > 0 ? Q / full.Q : null, yn: null, V: null };
    const name = p.name || p.id;
    if (!(S > 0)) problems.push({ id: p.id, kind: 'pipe', msg: t('san.p.flat', { name }) });
    else if (Q > 0) {
      r.yn = normalDepth(Q, D, S, sw.n, units);
      if (r.yn === null) problems.push({ id: p.id, kind: 'pipe', msg: t('san.p.over', { name, pct: Math.round(r.ratio * 100), max: Math.round(sw.maxFull * 100) }) });
      else {
        r.V = Q / partFull(r.yn, D).A;
        if (Q > sw.maxFull * full.Q + 1e-12) problems.push({ id: p.id, kind: 'pipe', msg: t('san.p.over', { name, pct: Math.round(r.ratio * 100), max: Math.round(sw.maxFull * 100) }) });
        if (r.V < sw.vMin) problems.push({ id: p.id, kind: 'pipe', msg: t('san.p.slow', { name, v: r.V.toFixed(2), min: sw.vMin }) });
        if (r.V > sw.vMax) problems.push({ id: p.id, kind: 'pipe', msg: t('san.p.fast', { name, v: r.V.toFixed(2), max: sw.vMax }) });
      }
    }
    pipes.set(p.id, r);
    dn.P += up.P; dn.area += up.area;
  }
  return { structs, pipes, problems, sewer: sw };
}

export function sizeSewers(net, flows, units = 'ft', { sizes = SEWER_SIZES[units === 'm' ? 'm' : 'ft'] } = {}) {
  const per = DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit, sw = flows.sewer || cleanSewer(net.sewer, units), out = [];
  for (const p of net.pipes) {
    const f = flows.pipes.get(p.id);
    if (!f || !(f.S > 0)) { out.push({ id: p.id, dia: p.dia, ok: false }); continue; }
    const d = sizes.find((x) => manningFull(x / per, f.S, sw.n, units).Q * sw.maxFull >= f.Q);
    out.push(d === undefined ? { id: p.id, dia: sizes[sizes.length - 1], ok: false } : { id: p.id, dia: d, ok: true });
  }
  return out;
}
