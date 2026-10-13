/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pipes.js — a gravity pipe network (storm or sanitary): structures, pipes, inverts and the checks
 * against the user's rules. No DOM.
 *
 * net = { name, type: 'storm'|'sanitary', rules: { minSlope (fraction), minCover, minDrop },
 *         structures: [{ id, name, x, y, rim (null = from the surface), sumpDepth, dia }],
 *         pipes: [{ id, name, from, to, dia, invUp, invDn }] }        (flow runs from → to)
 * Lengths, rims, inverts and cover are in project units; pipe and structure diameters are in
 * inches for feet projects and millimetres for metre projects (as LandXML's diameterUnit).
 *
 *   analyzeNetwork(net, surface, units) → { structs: Map, pipes: Map, problems: [{ id, kind, msg }] }
 *     pipe: { len, slope, cover: min cover along the pipe (ground − crown), coverAt (0…1), ground: sampled }
 *     structure: { rim, rimFrom: 'set'|'surface'|null, sump, ins, outs }
 *   autoInverts(net, surface, units, { only }) → pipes with inverts set: each run starts at minimum cover,
 *     falls at least the minimum slope, stays at least minimum cover under the ground all along, and drops
 *     at least minDrop through each structure. `only` (a Set of pipe ids) limits which pipes change.
 *
 * Cover is measured from the ground (the surface given) down to the pipe's crown = invert + inside
 * diameter; wall thickness is not counted. Rules are the user's; the defaults are placeholders.
 */

import { t } from "./i18n.js";

export const DIA_UNIT = { ft: { name: 'in', perUnit: 12 }, m: { name: 'mm', perUnit: 1000 } };
export function defaultNetwork(units = 'ft') {
  return {
    name: t('pipes.default'), type: 'storm',
    rules: units === 'm' ? { minSlope: 0.005, minCover: 0.6, minDrop: 0.03 } : { minSlope: 0.005, minCover: 2, minDrop: 0.1 },
    structures: [], pipes: [],
  };
}
export const defaultPipeDia = (units) => (units === 'm' ? 300 : 12);
export const defaultStructDia = (units) => (units === 'm' ? 1200 : 48);

export function analyzeNetwork(net, surface, units = 'ft') {
  const problems = [], structs = new Map(), pipes = new Map();
  const D = (dia) => (Number(dia) || 0) / DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit;
  const R = net.rules || {};
  for (const s of net.structures) {
    const g = surface ? surface.elevationAt(s.x, s.y, 1e-6) : null;
    const rim = Number.isFinite(s.rim) ? s.rim : g;
    structs.set(s.id, { s, rim, rimFrom: Number.isFinite(s.rim) ? 'set' : g !== null ? 'surface' : null, ins: [], outs: [], sump: null });
    if (rim === null) problems.push({ id: s.id, kind: 'structure', msg: t('pipes.p.offsurf', { name: s.name }) });
  }
  for (const p of net.pipes) {
    const a = structs.get(p.from), b = structs.get(p.to);
    if (!a || !b || p.from === p.to) { problems.push({ id: p.id, kind: 'pipe', msg: t('pipes.p.unconnected', { name: p.name }) }); continue; }
    a.outs.push(p.id); b.ins.push(p.id);
    const len = Math.hypot(b.s.x - a.s.x, b.s.y - a.s.y);
    const info = { p, len, slope: null, cover: null, coverAt: null, ground: [] };
    pipes.set(p.id, info);
    if (!Number.isFinite(p.invUp) || !Number.isFinite(p.invDn)) { problems.push({ id: p.id, kind: 'pipe', msg: t('pipes.p.noinv', { name: p.name }) }); continue; }
    info.slope = len > 0 ? (p.invUp - p.invDn) / len : 0;
    if (info.slope <= 0) problems.push({ id: p.id, kind: 'pipe', msg: t(info.slope < 0 ? 'pipes.p.uphill' : 'pipes.p.flat', { name: p.name, slope: pctTxt(info.slope) }) });
    else if (R.minSlope > 0 && info.slope < R.minSlope - 1e-9) problems.push({ id: p.id, kind: 'pipe', msg: t('pipes.p.flatter', { name: p.name, slope: pctTxt(info.slope), min: pctTxt(R.minSlope) }) });
    // cover along the pipe
    const n = Math.max(2, Math.min(200, Math.ceil(len / 2)));
    let minC = Infinity, at = null, off = 0;
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = a.s.x + (b.s.x - a.s.x) * t, y = a.s.y + (b.s.y - a.s.y) * t;
      let g = surface ? surface.elevationAt(x, y, 1e-6) : null;
      if (k === 0 && a.rimFrom === 'set') g = a.rim;
      if (k === n && b.rimFrom === 'set') g = b.rim;
      const crown = p.invUp + (p.invDn - p.invUp) * t + D(p.dia);
      info.ground.push({ t, g, crown });
      if (g === null) { off++; continue; }
      if (g - crown < minC) { minC = g - crown; at = t; }
    }
    if (Number.isFinite(minC)) { info.cover = minC; info.coverAt = at; }
    if (off) problems.push({ id: p.id, kind: 'pipe', msg: t('pipes.p.partoff', { name: p.name }) });
    if (Number.isFinite(minC) && R.minCover > 0 && minC < R.minCover - 1e-9) problems.push({ id: p.id, kind: 'pipe', msg: at <= 0 ? t('pipes.p.cover.up', { name: p.name, cover: minC.toFixed(2), min: R.minCover }) : at >= 1 ? t('pipes.p.cover.down', { name: p.name, cover: minC.toFixed(2), min: R.minCover }) : t('pipes.p.cover.along', { name: p.name, cover: minC.toFixed(2), at: Math.round(at * len), min: R.minCover }) });
  }
  // structures: drops, sumps, splits
  for (const [id, st] of structs) {
    const inv = [];
    for (const pid of st.ins) { const p = pipes.get(pid)?.p; if (Number.isFinite(p?.invDn)) inv.push(p.invDn); }
    for (const pid of st.outs) { const p = pipes.get(pid)?.p; if (Number.isFinite(p?.invUp)) inv.push(p.invUp); }
    st.sump = inv.length ? Math.min(...inv) - (Number(st.s.sumpDepth) || 0) : null;
    if (st.outs.length > 1) problems.push({ id, kind: 'structure', msg: t('pipes.s.outs', { name: st.s.name, n: st.outs.length }) });
    for (const o of st.outs) {
      const po = pipes.get(o)?.p;
      if (!Number.isFinite(po?.invUp)) continue;
      for (const i of st.ins) {
        const pi = pipes.get(i)?.p;
        if (!Number.isFinite(pi?.invDn)) continue;
        if (po.invUp > pi.invDn - (R.minDrop || 0) + 1e-9) problems.push({ id, kind: 'structure', msg: po.invUp > pi.invDn ? t('pipes.s.drop.above', { name: st.s.name, out: po.name, outInv: po.invUp.toFixed(2), in: pi.name, inInv: pi.invDn.toFixed(2) }) : t('pipes.s.drop.less', { name: st.s.name, out: po.name, outInv: po.invUp.toFixed(2), drop: R.minDrop, in: pi.name, inInv: pi.invDn.toFixed(2) }) });
      }
    }
    if (st.rim !== null) for (const pid of [...st.ins, ...st.outs]) {
      const p = pipes.get(pid)?.p; if (!p) continue;
      const inv = st.ins.includes(pid) ? p.invDn : p.invUp;
      if (Number.isFinite(inv) && inv + D(p.dia) > st.rim + 1e-9) problems.push({ id, kind: 'structure', msg: t('pipes.s.crown', { pipe: p.name, name: st.s.name }) });
    }
  }
  if (hasCycle(net)) problems.push({ id: null, kind: 'network', msg: t('pipes.loop') });
  return { structs, pipes, problems };
}

function hasCycle(net) {
  const out = new Map();
  for (const p of net.pipes) { if (!out.has(p.from)) out.set(p.from, []); out.get(p.from).push(p.to); }
  const state = new Map();
  const visit = (v) => {
    if (state.get(v) === 1) return true;
    if (state.get(v) === 2) return false;
    state.set(v, 1);
    for (const w of out.get(v) || []) if (visit(w)) return true;
    state.set(v, 2);
    return false;
  };
  return net.structures.some((s) => visit(s.id));
}

/** Pipes in flow order (every pipe after the pipes that flow into its upper structure), or null on a loop. */
export function flowOrder(net) {
  const into = new Map();
  for (const p of net.pipes) { if (!into.has(p.to)) into.set(p.to, []); into.get(p.to).push(p); }
  const done = new Set(), order = [], busy = new Set();
  const visit = (p) => {
    if (done.has(p.id)) return true;
    if (busy.has(p.id)) return false;
    busy.add(p.id);
    for (const q of into.get(p.from) || []) if (!visit(q)) return false;
    busy.delete(p.id); done.add(p.id); order.push(p);
    return true;
  };
  for (const p of net.pipes) if (!visit(p)) return null;
  return order;
}

export function autoInverts(net, surface, units = 'ft', { only = null } = {}) {
  const order = flowOrder(net);
  if (!order) return { pipes: net.pipes, problems: [t('pipes.loop.inv')] };
  const R = net.rules || {}, c = Number(R.minCover) || 0, s = Number(R.minSlope) || 0, drop = Number(R.minDrop) || 0;
  const per = DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit;
  const byId = new Map(net.structures.map((x) => [x.id, x]));
  const ground = (x, y, st) => (st && Number.isFinite(st.rim) ? st.rim : surface ? surface.elevationAt(x, y, 1e-6) : null);
  const res = new Map(net.pipes.map((p) => [p.id, { ...p }]));
  const problems = [];
  for (const p0 of order) {
    const p = res.get(p0.id);
    if (only && !only.has(p.id)) continue;
    const a = byId.get(p.from), b = byId.get(p.to);
    if (!a || !b) continue;
    const Dm = (Number(p.dia) || 0) / per, len = Math.hypot(b.x - a.x, b.y - a.y);
    const ga = ground(a.x, a.y, a);
    const incoming = net.pipes.filter((q) => q.to === p.from).map((q) => res.get(q.id).invDn).filter(Number.isFinite);
    let up = ga === null ? null : ga - c - Dm;
    if (incoming.length) { const v = Math.min(...incoming) - drop; up = up === null ? v : Math.min(up, v); }
    if (up === null) { problems.push(t('pipes.noground', { name: p.name, at: a.name })); continue; }
    // the lowest downstream invert that keeps the slope ≥ minimum and the cover ≥ minimum all along
    let dn = up - s * len;
    const n = Math.max(2, Math.min(200, Math.ceil(len / 2)));
    for (let k = 1; k <= n; k++) {
      const t = k / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      const g = k === n ? ground(b.x, b.y, b) : ground(x, y, null);
      if (g === null) continue;
      const lim = up + (g - c - Dm - up) / t;   // invert line under (ground − cover − D) at t
      if (lim < dn) dn = lim;
    }
    p.invUp = round2(up); p.invDn = round2(Math.min(dn, up - s * len));
    if (p.invDn > p.invUp - s * len + 1e-9) p.invDn = round2(p.invUp - s * len);
  }
  return { pipes: net.pipes.map((p) => res.get(p.id)), problems };
}

const round2 = (v) => Math.floor(v * 100 + 1e-7) / 100;   // round down: never shallower than computed
const pctTxt = (g) => (g * 100).toFixed(2) + '%';
