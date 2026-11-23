/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hydraulics.js — the water side of a pool (0.11 POOL.1): volume, circulation flow from the turnover time, filter area and size, pump duty,
 * pipe sizes from a velocity limit, and how many skimmers and inlets. Host-free. Plain 64-bit arithmetic, SI inside (m, m², m³, m³/h, m/s, kW).
 *
 * What it is NOT: a head-loss calculation (the pump head is the person's figure), a filter or pump selection from a maker's curve, a balance
 * tank design, or water chemistry. The size steps come from model.js SERIES (generic, unverified).
 */
import { SERIES } from './model.js';

const RHO = 1000, G = 9.80665;

/**
 * Water volume in m³ of a pool design (mm in): the prism under the water line less the steps (and benches). plan = { area mm², cx mm } of a
 * non-rectangular outline (plan.js): the floor falls along x, so the mean depth is the depth at the outline's centroid x.
 */
export function waterVolume(d, stepsVolume = 0, plan = null) {
  if (plan) return Math.max(0, (plan.area * (d.depthShallow + (d.depthDeep - d.depthShallow) * (plan.cx / d.length))) / 1e9 - stepsVolume);
  const L = d.length / 1000, B = d.width / 1000;
  return Math.max(0, L * B * ((d.depthShallow + d.depthDeep) / 2000) - stepsVolume);
}

/** The smallest size in a rising series that is at least `need`, or the largest with fits: false. */
export function pick(series, need) {
  for (const s of series) if (s >= need) return { size: s, fits: true };
  return { size: series[series.length - 1], fits: false };
}

/** A pipe for flow q (m³/h) at no more than v (m/s): → { dn (mm, nominal), need (mm bore), velocity (m/s in the chosen size), fits }. */
export function pipeFor(q, v, series = SERIES.pipes) {
  const need = q > 0 && v > 0 ? Math.sqrt((4 * (q / 3600)) / (Math.PI * v)) * 1000 : 0;
  const p = pick(series, need);
  const a = Math.PI * (p.size / 1000) ** 2 / 4;
  return { dn: p.size, need, velocity: q > 0 ? q / 3600 / a : 0, fits: p.fits };
}

/**
 * The circulation of a resolved design. → {
 *   volume m³, surface m², flow m³/h, turnoverH,
 *   filter: { areaNeed m², count, diameter mm, area m² (all filters), rate m/h (in the chosen filters), fits },
 *   pump: { count, flowEach m³/h, head m, hydraulicKw, shaftKw, motorKw, fits },
 *   skimmers, inlets, drains, jets,
 *   lines: { surface, drain, ret, jet? } each { flow, dn, need, velocity, fits } }
 */
export function circulation(d, stepsVolume = 0, series = SERIES, plan = null) {
  const volume = waterVolume(d, stepsVolume, plan);
  const surface = plan ? plan.area / 1e6 : (d.length / 1000) * (d.width / 1000);
  const fountain = d.kind === 'fountain';
  const jetFlowAll = fountain ? d.jets * d.jetFlow : 0;
  const flow = Math.max(volume / d.turnoverH, jetFlowAll);
  // filters: one filter until the largest step is too small, then two, three, four
  const areaNeed = flow / d.filterRate;
  let count = 1, chosen = null;
  for (; count <= 4; count++) {
    const dNeed = Math.sqrt((4 * areaNeed) / (count * Math.PI)) * 1000;
    chosen = pick(series.filters, dNeed);
    if (chosen.fits) break;
  }
  count = Math.min(count, 4);
  const area = count * Math.PI * (chosen.size / 1000) ** 2 / 4;
  const filter = { areaNeed, count, diameter: chosen.size, area, rate: flow / area, fits: chosen.fits };
  // pumps: one per filter
  const flowEach = flow / count;
  const hydraulicKw = (RHO * G * (flowEach / 3600) * d.pumpHead) / 1000;
  const shaftKw = hydraulicKw / d.pumpEff;
  const motor = pick(series.motorsKw, shaftKw);
  const pump = { count, flowEach, head: d.pumpHead, hydraulicKw, shaftKw, motorKw: motor.size, fits: motor.fits };
  const share = d.overflow === 'gutter' ? 1 : fountain ? 0 : d.surfaceShare;
  const skimmers = fountain || d.overflow === 'gutter' ? 0 : Math.max(1, Math.ceil(surface / d.skimmerArea - 1e-9));
  const inlets = fountain ? 0 : Math.max(2, Math.ceil(flow / d.inletFlow - 1e-9));
  const drains = fountain ? 1 : 2;
  const line = (q, v) => ({ flow: q, ...pipeFor(q, v, series.pipes) });
  const lines = {
    surface: line(flow * share, d.vSuction),
    drain: line(flow * Math.max(1 - share, fountain ? 1 : 0), d.vSuction),
    ret: line(fountain ? Math.max(0, flow - jetFlowAll) : flow, d.vReturn),
  };
  if (fountain) lines.jet = line(jetFlowAll, d.vReturn);
  return { volume, surface, flow, turnoverH: volume / flow, filter, pump, skimmers, inlets, drains, jets: fountain ? d.jets : 0, lines };
}

/** The pump for a flow each (m³/h) at a head (m) and efficiency: the same arithmetic circulation() uses. */
export function pumpFor(count, flowEach, head, eff, series = SERIES) {
  const hydraulicKw = (RHO * G * (flowEach / 3600) * head) / 1000, shaftKw = hydraulicKw / eff;
  const motor = pick(series.motorsKw, shaftKw);
  return { count, flowEach, head, hydraulicKw, shaftKw, motorKw: motor.size, fits: motor.fits };
}

/**
 * Loss in one routed pipe (m of water): Hazen-Williams friction h = 10.67 L Q^1.852 / (C^1.852 D^4.871) (SI: L, D in m, Q in m³/s; the same closed
 * form lib/waternet/sizing.js minDiameter solves for D) plus K v²/2g for each bend. The bore is the nominal size (a plain pipe's inside is smaller,
 * so this under-reads a little); C and K are the person's figures, starting figures that are not from a standard.
 */
export function pipeLoss(p, c, k) {
  const L = pathLen3(p.pts) / 1000, D = p.dn / 1000, Q = (p.flow || 0) / 3600;
  if (!(Q > 0) || !(L > 0)) return { friction: 0, bends: 0, velocity: 0, length: L };
  const friction = (10.67 * L * Q ** 1.852) / (c ** 1.852 * D ** 4.871);
  const v = Q / (Math.PI * D * D / 4), bends = Math.max(0, p.pts.length - 2) * k * v * v / (2 * G);
  return { friction, bends, velocity: v, length: L };
}
const pathLen3 = (pts) => pts.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1], (q[2] ?? 0) - (pts[i - 1][2] ?? 0)) : 0), 0);

/**
 * The head of the circulation loop from the routed pipes (build().layout.pipes, each { system, dn, pts, flow, role }): the worse of the two suction
 * paths (skimmers or overflow channel, main drains), plus the worse of the return and jet paths, plus the person's equipment figure. A path is its
 * worst branch plus every trunk length. A trunk is taken at the whole line flow along its length (a collector's flow falls toward its end, so this
 * over-reads). Not counted: height of the pump above or below the water, a dirty filter, valve throttling, water temperature.
 * → { suction, ret, friction, bends, equip, total (m), paths: { system: m } }.
 */
export function loopHead(pipes, d) {
  const by = {};
  for (const p of pipes) {
    const l = pipeLoss(p, d.hwC, d.fittingK), h = l.friction + l.bends;
    const s = (by[p.system] ||= { branch: 0, trunk: 0, friction: 0, bends: 0 });
    if (p.role === 'branch') s.branch = Math.max(s.branch, h); else s.trunk += h;
    s.friction += l.friction; s.bends += l.bends;
  }
  const path = (k) => (by[k] ? by[k].branch + by[k].trunk : 0);
  const paths = { surface: path('surface') + path('overflow'), drain: path('drain'), ret: path('ret'), jet: path('jet') };
  const suction = Math.max(paths.surface, paths.drain), ret = Math.max(paths.ret, paths.jet);
  const sum = (f) => Object.values(by).reduce((s, x) => s + x[f], 0);
  return { suction, ret, friction: sum('friction'), bends: sum('bends'), equip: d.equipLoss, total: suction + ret + d.equipLoss, paths };
}
