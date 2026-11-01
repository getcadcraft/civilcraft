/* SPDX-License-Identifier: Apache-2.0 */
/**
 * design.js — one truss design end to end (DOM-free; pure): geometry → load cases → method of joints → combinations → sizes → heel and stub → cut list,
 * member list, joints, deflection, bearings.
 *   designTruss(spec, { loads, combos, species, spacing, duration, braceLen, fixed, stock, plates, pointLoads, momentDiv, Fb, deflLimit, fixity })
 *     → { ok, error?, g, nodal, res, cases, combos, sizes, rows, sizingOk, heel, cut, list, joints, defl, bearing, frame, ... }
 * spec: a named type (generate) or { span, profile: [[x, z]...], form } (profileTruss). `spacing` is the width of roof one truss carries.
 * `combos` = [{ name, fD, fS, fW, fU, CD }]: the person's factors; with none given, one combination "Gravity" D + S with `duration`.
 * `pointLoads` = [{ x, D, S, W, U }] kN downward at a top-chord joint (the reactions of the jack trusses a girder carries).
 * `fixed` = { top, bottom, web } keeps the sizes the person chose and only checks them; without it the smallest sizes that pass are chosen.
 * `fixity`: the attic's room corners — 'rigid' (default, stated) or 'pinned' (the box is then a mechanism and is reported as one) or a spring kN·m/rad.
 */
import { generate, mark, heelInfo, addStubs } from './geometry.js';
import { profileTruss } from './profile.js';
import { caseLoads, chordLoads } from './analysis.js';
import { solve, autoSize, checkMembers, deflection } from './analysis.js';
import { solveFrame } from './frame.js';
import { cutList, memberList, jointSchedule } from './cutlist.js';
import { sizeById, DEFAULT_LOADS } from './tables.js';

/** A heel raised by less than this is a heel block in the drawing, not a member of its own. */
export const STUB_MIN = 60;
const CASES = ['D', 'S', 'W', 'U'];
const FKEY = { D: 'fD', S: 'fS', W: 'fW', U: 'fU' };

export function activeCombos(combos, duration = 1) {
  const list = (Array.isArray(combos) ? combos : []).filter((c) => c && CASES.some((k) => Math.abs(Number(c[FKEY[k]]) || 0) > 0)).map((c) => ({ name: String(c.name || 'Combination').slice(0, 40), fD: Number(c.fD) || 0, fS: Number(c.fS) || 0, fW: Number(c.fW) || 0, fU: Number(c.fU) || 0, CD: Number(c.CD) > 0 ? Number(c.CD) : 1 }));
  return list.length ? list : [{ name: 'Gravity', fD: 1, fS: 1, fW: 0, fU: 0, CD: duration > 0 ? duration : 1 }];
}

function inject(cases, g, pointLoads) {
  const tops = [...new Set(g.members.filter((m) => m.role === 'top').flatMap((m) => [m.a, m.b]))];
  for (const pl of pointLoads || []) {
    let best = null;
    for (const id of tops) { const d = Math.abs(g.nodes[id].x - pl.x); if (!best || d < best.d) best = { id, d }; }
    if (!best || best.d > 80) continue;
    for (const k of CASES) {
      const P = Number(pl[k]) || 0;
      if (!P) continue;
      const v = cases[k].get(best.id);
      if (k === 'D' || k === 'S') cases[k].set(best.id, (typeof v === 'number' ? v : 0) + P);
      else cases[k].set(best.id, { fx: (v && v.fx) || 0, fz: ((v && v.fz) || 0) - P });
    }
  }
}

const sumForces = (maps, f) => { const out = new Map(); for (const k of CASES) if (f[FKEY[k]]) for (const [id, v] of maps[k].forces) out.set(id, (out.get(id) || 0) + f[FKEY[k]] * v); return out; };

/** Combinations by linear sum of the case solutions (a determinate truss). */
function combosFromCases(g, caseRes, chordW, combos, momentDiv) {
  return combos.map((c) => {
    const forces = sumForces(caseRes, c), moments = new Map();
    for (const [id, w] of chordW) {
      const wn = CASES.reduce((a, k) => a + (c[FKEY[k]] || 0) * (w[k] || 0), 0), m = g.members[id];
      if (wn) moments.set(id, (Math.abs(wn) * Math.pow(m.len / 1000, 2)) / momentDiv);
    }
    const rl = [0, 0], rr = [0, 0];
    for (const k of CASES) { const f = c[FKEY[k]] || 0, r = caseRes[k].reactions; if (f && r) { rl[0] += f * r.left[0]; rl[1] += f * r.left[1]; rr[1] += f * r.right[1]; } }
    return { ...c, forces, moments, reactions: { left: rl, right: rr } };
  });
}

/** Attic: the room box is a rigid frame (stated). One frame solve per combination; sizes iterated because the stiffness depends on them. */
function atticCombos(g, spec, loads, spacing, combos, sp, sizesOf, fixity, floorLive) {
  const beams = new Set(g.members.filter((m) => m.room).map((m) => m.id)), s = spacing / 1000;
  const out = [];
  for (const c of combos) {
    const parts = caseLoads(g, { ...loads, ceilingDead: 0 }, spacing);
    const load = new Map(), wBeam = new Map();
    const addN = (id, v) => { const p = load.get(id) || { fx: 0, fz: 0 }; if (typeof v === 'number') p.fz -= v; else { p.fx += v.fx || 0; p.fz += v.fz || 0; } load.set(id, p); };
    for (const k of CASES) { const f = c[FKEY[k]] || 0; if (f) for (const [id, v] of parts[k]) addN(id, typeof v === 'number' ? f * v : { fx: f * v.fx, fz: f * v.fz }); }
    for (const m of g.members.filter((x) => x.role === 'bottom')) {
      const dx = Math.abs(g.nodes[m.b].x - g.nodes[m.a].x) / 1000, w = (c.fD || 0) * (loads.ceilingDead || 0) * s + (beams.has(m.id) ? (c.fS || 0) * (floorLive || 0) * s : 0);
      if (!w) continue;
      if (beams.has(m.id)) wBeam.set(m.id, w); else for (const id of [m.a, m.b]) addN(id, (w * dx) / 2);
    }
    const r = solveFrame(g, load, { beams, size: sizesOf, E: sp.E, fixity, wBeam });
    if (r.status !== 'ok') return { status: 'unstable', combos: [] };
    out.push({ ...c, forces: r.forces, moments: r.moments, reactions: r.reactions });
  }
  return { status: 'ok', combos: out };
}

export function designTruss(spec, { loads = DEFAULT_LOADS, combos: comboIn = null, species, spacing = 600, duration, braceLen = 600, fixed = null, stock = 6000, plates = null, pointLoads = [], momentDiv = 8, Fb = null, Fcp = null, deflLimit = 0, fixity = 'rigid' } = {}) {
  const g = spec && spec.profile ? profileTruss(spec) : generate(spec);
  if (!g.ok) return { ok: false, error: g.error };
  mark(g);
  const combos = activeCombos(comboIn, duration ?? loads.duration ?? 1);
  const cases = caseLoads(g, loads, spacing);
  inject(cases, g, pointLoads);
  const caseRes = {};
  for (const k of CASES) caseRes[k] = solve(g, cases[k]);
  const status = caseRes.D.status;
  const fb = Number.isFinite(Fb) && Fb > 0 ? Fb : species && species.Fb ? species.Fb : null;
  const opts = { duration: combos[0].CD, braceLen, Fb: fb };
  let combosOut = [], frame = null, sizes, rows, sizingOk, res;
  const chordW = chordLoads(g, loads, spacing);
  if (status === 'ok') {
    combosOut = combosFromCases(g, caseRes, chordW, combos, momentDiv);
    res = { status: 'ok', forces: combosOut[0].forces, reactions: combosOut[0].reactions, residual: caseRes.D.residual };
  } else if (status === 'mechanism' && g.type === 'attic' && fixity !== 'pinned') {
    // stable idealisation: the room's corners are rigid (the person's statement)
    let sz = { top: '2x6', bottom: '2x6', web: '2x4' };
    const sizesOf = (m) => sizeById(sz[m.role === 'post' || m.role === 'stub' ? 'web' : m.role === 'tail' ? 'top' : m.role]) || sizeById('2x4');
    let last = null;
    for (let it = 0; it < 4; it++) {
      last = atticCombos(g, spec, loads, spacing, combos, species, sizesOf, fixity, loads.floorLive || 0);
      if (last.status !== 'ok') break;
      if (fixed && sizeById(fixed.top) && sizeById(fixed.bottom) && sizeById(fixed.web)) { sz = { top: fixed.top, bottom: fixed.bottom, web: fixed.web }; break; }
      const a = autoSize(g, last.combos, species, opts);
      if (a.sizes.top === sz.top && a.sizes.bottom === sz.bottom && a.sizes.web === sz.web) break;
      sz = a.sizes;
    }
    if (last && last.status === 'ok') {
      combosOut = last.combos; frame = { fixity: typeof fixity === 'number' ? 'spring ' + fixity + ' kN·m/rad' : 'rigid', room: [...g.members.filter((m) => m.room).map((m) => m.mark || m.id)] };
      res = { status: 'ok', forces: combosOut[0].forces, reactions: combosOut[0].reactions, residual: 0, frame: true };
    } else res = { status: 'unstable', forces: new Map(), reactions: null, residual: NaN };
  } else {
    res = { status, forces: new Map(), reactions: null, residual: NaN, dof: caseRes.D.dof, extra: caseRes.D.extra };
  }
  if (res.status === 'ok') {
    if (fixed && sizeById(fixed.top) && sizeById(fixed.bottom) && sizeById(fixed.web)) {
      sizes = { top: fixed.top, bottom: fixed.bottom, web: fixed.web };
      rows = checkMembers(g, combosOut, sizes, species, opts);
      sizingOk = rows.every((r) => r.util <= 1);
    } else { const a = autoSize(g, combosOut, species, opts); sizes = a.sizes; rows = a.rows; sizingOk = a.ok && a.rows.every((r) => r.util <= 1); }
  } else { sizes = fixed && sizeById(fixed.top) ? { top: fixed.top, bottom: fixed.bottom, web: fixed.web } : { top: '2x6', bottom: '2x4', web: '2x4' }; rows = []; sizingOk = false; }
  const heel = heelInfo(g, { dTop: sizeById(sizes.top).d, dBottom: sizeById(sizes.bottom).d, heel: spec.heel });
  g.raise = heel.raise;
  const closed = g.profile ? g.nodes.find((n) => n.x === 0 && n.z === 0) : true;
  if (res.status === 'ok' && heel.raise >= STUB_MIN && closed) {
    addStubs(g, heel.raise); mark(g);
    const stubs = g.members.filter((m) => m.role === 'stub');
    for (const c of combosOut) for (const st of stubs) {
      const left = g.nodes[st.a].x < g.span / 2;
      const Rz = left ? c.reactions.left[1] : c.reactions.right[1];
      c.forces.set(st.id, -Rz);   // the stub carries the vertical bearing reaction (compression when the support pushes up)
    }
    rows = checkMembers(g, combosOut, sizes, species, opts);
  }
  // governing forces for the joints and the drawing: the largest magnitude over the combinations
  const env = new Map();
  for (const c of combosOut) for (const [id, v] of c.forces) if (!env.has(id) || Math.abs(v) > Math.abs(env.get(id))) env.set(id, v);
  const jres = { forces: env };
  const plateSet = plates && plates.list && plates.list.length ? { list: plates.list, label: plates.label, placeholder: false } : null;
  const defl = res.status === 'ok' && !frame ? (() => { const sv = new Map(); for (const k of ['D', 'S']) for (const [id, v] of caseRes[k].forces) sv.set(id, (sv.get(id) || 0) + v); return deflection(g, sv, sizes, species); })() : null;
  const reac = combosOut.map((c) => ({ name: c.name, left: c.reactions.left, right: c.reactions.right }));
  const bearing = reac.length ? { maxLeft: Math.max(...reac.map((r) => r.left[1])), maxRight: Math.max(...reac.map((r) => r.right[1])), minLeft: Math.min(...reac.map((r) => r.left[1])), minRight: Math.min(...reac.map((r) => r.right[1])), thrust: Math.max(...reac.map((r) => Math.abs(r.left[0]))), perCombo: reac, Fcp: Fcp || (species && species.Fcp) || null } : null;
  const nodal = cases.D;
  return { ok: true, g, nodal, res, cases, caseRes, combos: combosOut, comboDefs: combos, sizes, rows, sizingOk, heel, species, opts, spacing, loads, deflLimit, defl, bearing, frame, fb, momentDiv,
    cut: cutList(g, sizes, { stock }), list: memberList(g, rows), joints: jointSchedule(g, sizes, jres, plateSet), plates: plateSet };
}
