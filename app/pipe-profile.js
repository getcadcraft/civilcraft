/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pipe-profile.js — 0.11 SU.1937: the profile of a pipe run. No DOM, no new maths: the network's own rims, inverts and sampled ground
 * (pipes.js), and, when asked for, the hydraulic grade line the storm table already shows (hydro.js hydraulicGrade).
 *
 *   outletsOf(net) → [structure id]                 the structures nothing flows out of
 *   pipeRun(net, startId) → { ok, structs: [id], pipes: [id], why }   from a structure down to an outlet; at a fork the way with the
 *       longer run below it (ties: the first pipe), so the profile is one run
 *   pipeProfile(net, surface, units, { start, hgl, step }) → {
 *       ok, why, length, run: { structs, pipes },
 *       ground [{ sta, z | null }], crown [{ sta, z }], invert [{ sta, z }] (a polyline: each pipe from its upper to its lower end),
 *       structs [{ id, name, sta, rim, rimFrom, floor (the sump: lowest invert − sump depth), dia, invIn [{ pipe, inv }], invOut, depth (rim − floor) }],
 *       pipes [{ id, name, sta0, sta1, len, slope, dia (typed, in or mm), D (in project units), invUp, invDn, cover, label }],
 *       hgl [{ sta, z }] | null }
 *   station = distance along the plan from the first structure's centre. A pipe's length is the plan distance between its two structures
 *   (as pipes.js analyzeNetwork). Inverts that are not set refuse the run (why 'noinv'): nothing is guessed.
 *   hgl = hydraulicGrade's result (pipes: Map(id → { hglUp, hglDn }), structs): drawn from each pipe's upper to its lower HGL.
 */
import { analyzeNetwork, DIA_UNIT } from './pipes.js';

export function outletsOf(net) {
  const from = new Set((net?.pipes || []).map((p) => p.from));
  return (net?.structures || []).filter((s) => !from.has(s.id)).map((s) => s.id);
}

export function pipeRun(net, startId) {
  const outs = new Map();
  for (const p of net?.pipes || []) { if (!outs.has(p.from)) outs.set(p.from, []); outs.get(p.from).push(p); }
  if (!(net?.structures || []).some((s) => s.id === startId)) return { ok: false, structs: [], pipes: [], why: 'nostart' };
  const memo = new Map(), busy = new Set();
  const depth = (id) => {   // pipes below a structure along its longest way
    if (memo.has(id)) return memo.get(id);
    if (busy.has(id)) return 0;
    busy.add(id);
    let best = 0;
    for (const p of outs.get(id) || []) best = Math.max(best, 1 + depth(p.to));
    busy.delete(id); memo.set(id, best);
    return best;
  };
  const structs = [startId], pipes = [], seen = new Set([startId]);
  for (let id = startId; ;) {
    const list = (outs.get(id) || []).filter((p) => !seen.has(p.to));
    if (!list.length) break;
    const p = list.reduce((b, q) => (1 + depth(q.to) > 1 + depth(b.to) ? q : b));
    pipes.push(p.id); structs.push(p.to); seen.add(p.to); id = p.to;
  }
  return pipes.length ? { ok: true, structs, pipes, why: '' } : { ok: false, structs, pipes, why: 'nopipe' };
}

export function pipeProfile(net, surface, units = 'ft', { start, hgl = null, step } = {}) {
  const fail = (why) => ({ ok: false, why, length: 0, run: { structs: [], pipes: [] }, ground: [], crown: [], invert: [], structs: [], pipes: [], hgl: null });
  const run = pipeRun(net, start);
  if (!run.ok) return fail(run.why);
  const an = analyzeNetwork(net, surface, units), D = (dia) => (Number(dia) || 0) / DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit;
  const byPipe = new Map(net.pipes.map((p) => [p.id, p]));
  const pipes = [], ground = [], crown = [], invert = [], hglLine = [];
  let sta = 0;
  const stas = new Map([[run.structs[0], 0]]);
  for (const pid of run.pipes) {
    const p = byPipe.get(pid), info = an.pipes.get(pid);
    if (!info) return fail('unconnected');
    if (!Number.isFinite(p.invUp) || !Number.isFinite(p.invDn)) return fail('noinv');
    const Dm = D(p.dia), sta0 = sta, sta1 = sta + info.len, n = Math.max(2, Math.min(400, step > 0 ? Math.ceil(info.len / step) : (info.ground || []).length - 1));
    for (let k = 0; k <= n; k++) {
      const u = k / n, g = info.ground[Math.min(info.ground.length - 1, Math.round(u * (info.ground.length - 1)))]?.g ?? null, at = sta0 + info.len * u;
      ground.push({ sta: at, z: g });
    }
    invert.push({ sta: sta0, z: p.invUp }, { sta: sta1, z: p.invDn });
    crown.push({ sta: sta0, z: p.invUp + Dm }, { sta: sta1, z: p.invDn + Dm });
    const h = hgl?.pipes?.get(pid);
    if (h && Number.isFinite(h.hglUp) && Number.isFinite(h.hglDn)) hglLine.push({ sta: sta0, z: h.hglUp }, { sta: sta1, z: h.hglDn });
    pipes.push({ id: pid, name: p.name, sta0, sta1, len: info.len, slope: info.slope, dia: p.dia, D: Dm, invUp: p.invUp, invDn: p.invDn, cover: info.cover, label: '' });
    sta = sta1; stas.set(p.to, sta1);
  }
  const structs = run.structs.map((id) => {
    const st = an.structs.get(id), s = st.s;
    const invIn = st.ins.map((pid) => ({ pipe: pid, inv: byPipe.get(pid)?.invDn })).filter((x) => Number.isFinite(x.inv));
    const outP = run.pipes.map((pid) => byPipe.get(pid)).find((p) => p.from === id);
    return { id, name: s.name, sta: stas.get(id), rim: st.rim, rimFrom: st.rimFrom, floor: st.sump, dia: s.dia, invIn, invOut: outP ? outP.invUp : null, depth: st.rim !== null && st.sump !== null ? st.rim - st.sump : null, side: st.ins.filter((pid) => !run.pipes.includes(pid)).length };
  });
  return { ok: true, why: '', length: sta, run, ground, crown, invert, structs, pipes, hgl: hglLine.length ? hglLine : null, units };
}
