/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pipestress.js — pipe stress on lib/frame (0.8 Track CH, CH.11; DOM-free). A routed run (the `plant` shape: `points: [[x, y, z] mm]`) becomes a lib/frame model
 * (beam members, anchors/guides/rests/springs at chosen distances along the run), weight and thermal expansion are solved by the frame solver, and the end
 * moments are checked with the B31.3 stress equations: sustained (para. 320.2 / eq. 23a), displacement range (para. 319.4.4 / eq. 17), occasional (323.2.? 1.33 Sh).
 * Stress intensification by Appendix D: elbow i_i = 0.9/h^(2/3), i_o = 0.75/h^(2/3), h = t R1 / r². A drafting and study aid, "to be checked by an engineer" (O7):
 * NOT an engineering approval. Allowable stresses Sh, Sc come from the caller (the code's Table A-1 is not reproduced).
 * Opt-in refinements (0.8 CH.11, owner 2026-10-29: ship in /lab marked "not engineer-reviewed"):
 *   flexibility: true   every bend becomes its two tangent points and a chord member whose bending stiffness is divided by the flexibility factor k = 1.65/h (B31.3 App. D)
 *   tees: [{ s, kind }] the stress intensification of a welding, reinforced or unreinforced tee at s (App. D, h = 4.4 T/r, (T + Te/2)^2.5/(T^1.5 r), T/r; i_i = 0.75 i_o + 0.25)
 *   nonlinear rests: a rest that would have to pull the pipe down in the operating case (weight + thermal) lifts off and is released; `mu` (Coulomb friction) opposes the sliding
 *                     of the pipe on each rest that stays in contact (iterated). Both are reported.
 * Not modelled: gaps and one-way stops other than rests, cold spring, branches of tees (the tee is a stress point on the run only), pressure thrust (Bourdon), dynamic loads.
 * Units: mm, N, MPa, °C. Global Z up.
 */
import { cleanFrame, FORMAT, VERSION, memberAxes } from '../../frame/frame-model.js';
import { solveFrame, memberExtremes } from '../../frame/frame-solve.js';
import { insideDiameter, NPS_SCH40, npsKey } from '../hydraulics.js';

export const SOURCES = {
  eq: 'ASME B31.3 para. 320.2 (sustained), 319.4.4 (displacement stress range S_E = sqrt(S_b² + 4 S_t²)), Appendix D (SIF, h = t R1 / r²); equations typed from public secondary sources, check',
};
const SRC = { kind: 'engine', name: 'process' };
const G = 9.80665;

/** Pipe section properties from NPS text (schedule 40) or {D, t} in mm. */
export function pipeSection(size) {
  let D, t;
  if (size && typeof size === 'object') { D = size.D; t = size.t; }
  else { const k = npsKey(size); if (!k) throw new Error('pipe size not understood: ' + size); D = NPS_SCH40[k][0] * 25.4; t = NPS_SCH40[k][1] * 25.4; }
  const d = D - 2 * t, A = Math.PI / 4 * (D * D - d * d), I = Math.PI / 64 * (D ** 4 - d ** 4);
  return { D, t, d, A, I, J: 2 * I, Z: I / (D / 2) };
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = (v) => Math.hypot(v[0], v[1], v[2]), unit = (v) => { const l = len(v); return [v[0] / l, v[1] / l, v[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * spec = { points, size, material: { E (MPa), alpha (1/K), rho (kg/m³ = 7850), Sh, Sc (MPa), nu? }, P (MPa gauge), Thot (°C), Tinstall (20), contentsRho (kg/m³), insulationKgPerM,
 *          supports: [{ s (mm along the run), type: 'anchor'|'rest'|'guide'|'spring', k? (N/mm for a spring) }], bendRadius? (mm, default 1.5 D), wind?: { w (N/mm), dir: 'X'|'Y' } }
 * → { model (a lib/frame model), nodes: [{ id, s, point }], section }
 */
/** Appendix D stress intensification of a tee at the run: { h, ii, io }. kind 'welding' (h = 4.4 T/r), 'unreinforced' (h = T/r), 'reinforced' (h = (T + Te/2)^2.5 / (T^1.5 r)). Typed from the code's table: check. */
export function teeSIF({ D, t, kind = 'welding', Te = 0 }) {
  const r = (D - t) / 2, T = t;
  const h = kind === 'welding' ? 4.4 * T / r : kind === 'unreinforced' ? T / r : kind === 'reinforced' ? Math.pow(T + Te / 2, 2.5) / (Math.pow(T, 1.5) * r) : null;
  if (h == null) throw new Error('tee kind: welding | unreinforced | reinforced');
  const io = Math.max(0.9 / Math.pow(h, 2 / 3), 1), ii = Math.max(0.75 * io + 0.25, 1);
  return { h, io, ii };
}
/** Replace each bend of the polyline by its two tangent points (radius R1): a chord between them is the bend. Returns the new points, the bend ranges and a map from the old distance to the new. */
function roundBends(pts, R1) {
  const out = [pts[0]], ranges = [], knots = [[0, 0]], notes = []; let cumOld = 0, cumNew = 0;
  const push = (p, oldS) => { cumNew += len(sub(p, out[out.length - 1])); out.push(p); knots.push([oldS, cumNew]); return cumNew; };
  for (let i = 1; i < pts.length - 1; i++) {
    const l1 = len(sub(pts[i], pts[i - 1])), l2 = len(sub(pts[i + 1], pts[i])); cumOld += l1;
    const u1 = unit(sub(pts[i], pts[i - 1])), u2 = unit(sub(pts[i + 1], pts[i])), th = Math.acos(Math.max(-1, Math.min(1, dot(u1, u2))));
    if (th < 1e-3 || th > Math.PI - 1e-3) { push(pts[i], cumOld); continue; }
    const a = R1 * Math.tan(th / 2);
    if (a > 0.5 * Math.min(l1, l2)) { notes.push('the bend at point ' + (i + 1) + ' is too tight for its neighbours at radius ' + R1.toFixed(0) + ' mm: left as a stiff corner'); push(pts[i], cumOld); continue; }
    const P1 = pts[i].map((v, k) => v - u1[k] * a), P2 = pts[i].map((v, k) => v + u2[k] * a);
    const s1 = push(P1, cumOld - a), s2 = push(P2, cumOld + a); ranges.push([s1, s2]);
  }
  cumOld += len(sub(pts[pts.length - 1], pts[pts.length - 2]));
  // the last point: offset between old and new distances at the end
  push(pts[pts.length - 1], cumOld);
  return { pts: out, ranges, notes, mapS: (s) => { for (let k = 0; k + 1 < knots.length; k++) if (s <= knots[k + 1][0] + 1e-9) { const [a0, b0] = knots[k], [a1, b1] = knots[k + 1]; return a1 === a0 ? b0 : b0 + (b1 - b0) * (s - a0) / (a1 - a0); } return knots[knots.length - 1][1]; } };
}

export function buildModel(spec) {
  const sec = pipeSection(spec.size), m = spec.material;
  let pts = spec.points, supportsIn = spec.supports || [], teesIn = spec.tees || [], bendRanges = [], flexNotes = [];
  if (!Array.isArray(pts) || pts.length < 2) throw new Error('a run needs at least two points');
  const R1 = spec.bendRadius ?? 1.5 * sec.D, kflex = spec.flexibility ? bendSIF({ D: sec.D, t: sec.t, R1 }).k : 1;
  if (spec.flexibility && pts.length > 2) {
    const rb = roundBends(pts, R1); pts = rb.pts; bendRanges = rb.ranges; flexNotes = rb.notes;
    supportsIn = supportsIn.map((sp) => ({ ...sp, s: rb.mapS(sp.s) })); teesIn = teesIn.map((tt) => ({ ...tt, s: rb.mapS(tt.s) }));
  }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1])));
  const marks = new Map(); pts.forEach((p, i) => marks.set(+cum[i].toFixed(3), { point: p, corner: i > 0 && i < pts.length - 1 }));
  const place = (sNeed) => {
    const s = Math.min(Math.max(sNeed, 0), cum[cum.length - 1]); const key = +s.toFixed(3);
    if (!marks.has(key)) { let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const a = pts[i - 1], b = pts[i], f = (s - cum[i - 1]) / (cum[i] - cum[i - 1]); marks.set(key, { point: a.map((v, k) => v + f * (b[k] - v)), corner: false }); }
    return key;
  };
  for (const sp of supportsIn) place(sp.s);
  for (const tt of teesIn) { const key = place(tt.s); marks.get(key).tee = teeSIF({ D: sec.D, t: sec.t, kind: tt.kind, Te: tt.Te }); }
  const order = [...marks.keys()].sort((x, y) => x - y), nodes = order.map((s, k) => ({ id: 'N' + k, s, point: marks.get(s).point, corner: marks.get(s).corner, tee: marks.get(s).tee }));
  const fm = { format: FORMAT, version: VERSION, name: 'pipe run', nodes: nodes.map((n) => ({ id: n.id, x: n.point[0], y: n.point[1], z: n.point[2] })),
    materials: [{ id: 'M', name: 'pipe', E: m.E, G: m.E / (2 * (1 + (m.nu ?? 0.3))), rho: m.rho ?? 7850 }],
    sections: [{ id: 'S', name: 'pipe', A: sec.A, Iy: sec.I, Iz: sec.I, J: sec.J }].concat(kflex > 1 ? [{ id: 'B', name: 'bend (flexibility factor ' + kflex.toFixed(2) + ')', A: sec.A, Iy: sec.I / kflex, Iz: sec.I / kflex, J: sec.J }] : []),
    members: nodes.slice(1).map((n, k) => { const mid = (nodes[k].s + n.s) / 2; return { id: 'E' + k, i: nodes[k].id, j: n.id, section: bendRanges.some(([a, b]) => mid > a + 1e-6 && mid < b - 1e-6) ? 'B' : 'S', material: 'M' }; }), supports: [], cases: [], combos: [] };
  // supports
  const dirOf = (k) => unit(sub(nodes[Math.min(k + 1, nodes.length - 1)].point, nodes[Math.max(k - 1, 0)].point));
  const warnings = flexNotes.slice();
  for (const sp of supportsIn) {
    const k = nodes.findIndex((n) => Math.abs(n.s - sp.s) < 1e-2 || (sp.s <= 0 && n.s === 0) || (sp.s >= nodes[nodes.length - 1].s && n.s === nodes[nodes.length - 1].s)); if (k < 0) continue;
    const id = nodes[k].id; let fix, kk;
    if (sp.type === 'anchor') fix = [1, 1, 1, 1, 1, 1];
    else if (sp.type === 'rest') fix = [0, 0, 1, 0, 0, 0];
    else if (sp.type === 'spring') { fix = [0, 0, 0, 0, 0, 0]; kk = [0, 0, sp.k ?? 10, 0, 0, 0]; }
    else if (sp.type === 'guide') {
      const d = dirOf(k); fix = [0, 0, 1, 0, 0, 0];
      if (Math.abs(d[2]) > 0.9) fix = [1, 1, 0, 0, 0, 0]; else if (Math.abs(d[0]) > 0.9) fix[1] = 1; else if (Math.abs(d[1]) > 0.9) fix[0] = 1; else warnings.push('guide at s=' + sp.s + ' on a diagonal run holds only the vertical direction');
    } else throw new Error('support type: anchor | rest | guide | spring');
    fm.supports.push({ node: id, fix, ...(kk ? { k: kk } : {}) });
  }
  // weight case: self weight + contents + insulation (N/mm along each member, downward)
  const dI = sec.d, wContents = (spec.contentsRho || 0) * 1e-9 * Math.PI / 4 * dI * dI * G, wIns = (spec.insulationKgPerM || 0) / 1000 * G;
  const W = { id: 'W', name: 'Weight', kind: 'dead', selfWeight: 1, loads: fm.members.map((e) => ({ type: 'udl', member: e.id, dir: 'Z', w: -(wContents + wIns) })).filter((l) => l.w !== 0) };
  // thermal: equivalent nodal loads of the free expansion along each member
  const dT = (spec.Thot ?? 20) - (spec.Tinstall ?? 20), eps = m.alpha * dT, Fax = m.E * sec.A * eps, nodeF = new Map();
  fm.members.forEach((e, k) => { const u = unit(sub(nodes[k + 1].point, nodes[k].point)); const add = (id, s) => { const f = nodeF.get(id) || [0, 0, 0, 0, 0, 0]; for (let q = 0; q < 3; q++) f[q] += s * Fax * u[q]; nodeF.set(id, f); }; add(nodes[k].id, -1); add(nodes[k + 1].id, 1); });
  const T = { id: 'T', name: 'Thermal expansion', kind: 'other', selfWeight: 0, loads: [...nodeF].map(([node, F]) => ({ type: 'node', node, F })) };
  fm.cases.push(W, T);
  if (spec.wind) fm.cases.push({ id: 'Wd', name: 'Wind', kind: 'wind', selfWeight: 0, loads: fm.members.map((e) => ({ type: 'udl', member: e.id, dir: spec.wind.dir || 'X', w: spec.wind.w })) });
  const clean = cleanFrame(fm);
  return { model: clean.model, nodes, section: sec, warnings: warnings.concat(clean.warnings.map((w) => 'frame: ' + w.code)), dT, bends: bendRanges.length, kflex, supportsUsed: supportsIn };
}

/** Appendix D stress intensification for a bend: { h, ii, io, k (flexibility, NOT applied) }. R1 bend radius (mm). */
export function bendSIF({ D, t, R1 }) {
  const r = (D - t) / 2, h = t * R1 / (r * r); return { h, ii: Math.max(0.9 / Math.pow(h, 2 / 3), 1), io: Math.max(0.75 / Math.pow(h, 2 / 3), 1), k: Math.max(1.65 / h, 1) };
}

/** Solve and check. → { cases, stresses: [{ node, S_L, ratioSustained, S_E, SA, ratioExpansion, ... }], reactions, problems } */
export function analyse(spec) {
  const b = buildModel(spec), sec = b.section, m = spec.material, R1 = spec.bendRadius ?? 1.5 * sec.D;
  const nl = solveNonlinear(b, spec), res = nl.res, model = nl.model;
  if (!res.ok) throw new Error('frame solve failed: ' + JSON.stringify(res.error));
  const prep = res.prep, nn = b.nodes.length, problems = [];
  const sif = bendSIF({ D: sec.D, t: sec.t, R1 });
  const ends = (R, e) => { const o = 12 * e, E = R.ends; return { i: [...E.subarray(o, o + 6)], j: [...E.subarray(o + 6, o + 12)] }; };
  const getMoment = (R, k, which) => {
    // moments of members meeting at node k in global coordinates (local My about ey, Mz about ez), as vectors
    const out = [];
    for (let e = 0; e < b.model.members.length; e++) {
      const left = e === k - 1 && which !== 'i', right = e === k && which !== 'j'; if (!left && !right) continue;
      const ax = memberAxes(b.model, b.model.members[e]), en = ends(R, e), a = left ? en.j : en.i;
      const ey = ax.ey, ez = ax.ez;
      out.push({ M: [a[4] * ey[0] + a[5] * ez[0], a[4] * ey[1] + a[5] * ez[1], a[4] * ey[2] + a[5] * ez[2]], T: Math.abs(a[3]), N: a[0], ex: ax.ex });
    }
    return out;
  };
  const rowsFor = (R, kind) => {
    const rows = [];
    for (let k = 0; k < nn; k++) {
      const ms = getMoment(R, k); if (!ms.length) continue;
      let n = null; if (b.nodes[k].corner && ms.length === 2) { const c = cross(ms[0].ex, ms[1].ex); if (len(c) > 1e-6) n = unit(c); }
      let worst = null;
      for (const a of ms) {
        const Mb = len(a.M), Mo = n ? Math.abs(dot(a.M, n)) : 0, Mi = Math.sqrt(Math.max(Mb * Mb - Mo * Mo, 0));
        const tee = b.nodes[k].tee, ii = tee ? tee.ii : (n ? sif.ii : 1), io = tee ? tee.io : (n ? sif.io : 1);
        const tors = a.T;
        let val;
        if (kind === 'S') { const Isi = Math.max(0.75 * ii, 1), Iso = Math.max(0.75 * io, 1); val = Math.sqrt((Isi * Mi) ** 2 + (Iso * Mo) ** 2) / sec.Z + Math.abs(a.N) / sec.A; }
        else if (kind === 'O') val = Math.sqrt((Math.max(0.75 * ii, 1) * Mi) ** 2 + (Math.max(0.75 * io, 1) * Mo) ** 2) / sec.Z + Math.abs(a.N) / sec.A;
        else { const Sb = Math.sqrt((ii * Mi) ** 2 + (io * Mo) ** 2) / sec.Z, St = tors / (2 * sec.Z); val = Math.sqrt(Sb * Sb + 4 * St * St); }
        if (!worst || val > worst.val) worst = { val, Mi, Mo, tors };
      }
      rows.push({ node: b.nodes[k].id, s: b.nodes[k].s, point: b.nodes[k].point, val: worst.val, Mi: worst.Mi, Mo: worst.Mo, T: worst.tors });
    }
    return rows;
  };
  const pressureLong = (spec.P || 0) * sec.D / (4 * sec.t), Sh = m.Sh, Sc = m.Sc ?? m.Sh, f = spec.f ?? 1, SAbase = f * (1.25 * Sc + 0.25 * Sh);
  const sust = rowsFor(res.results['case:W'], 'S').map((r) => ({ ...r, S_L: r.val + pressureLong }));
  const exp = rowsFor(res.results['case:T'], 'E');
  const occ = res.results['case:Wd'] ? rowsFor(res.results['case:Wd'], 'O') : null;
  const stresses = b.nodes.map((n, k) => {
    const sL = sust.find((r) => r.node === n.id), sE = exp.find((r) => r.node === n.id), sO = occ?.find((r) => r.node === n.id);
    const SL = sL?.S_L ?? pressureLong, SE = sE?.val ?? 0, SA = SAbase + Math.max(0, Sh - SL), occTotal = sO ? SL + sO.val : null;
    return { node: n.id, s: n.s, point: n.point, S_L: SL, ratioSustained: SL / Sh, S_E: SE, SA, ratioExpansion: SE / SA, ...(occTotal != null ? { S_occ: occTotal, ratioOccasional: occTotal / (1.33 * Sh) } : {}) };
  });
  for (const r of stresses) {
    const about = [{ id: r.node }];
    if (r.ratioSustained > 1) problems.push({ id: 'process:stress.sustained:' + r.node, code: 'stress.sustained', severity: 'error', text: `Sustained stress at ${r.node} is ${(100 * r.ratioSustained).toFixed(0)} % of Sh (${r.S_L.toFixed(1)} MPa): add a support or change the layout.`, about, source: SRC });
    if (r.ratioExpansion > 1) problems.push({ id: 'process:stress.expansion:' + r.node, code: 'stress.expansion', severity: 'error', text: `Displacement stress range at ${r.node} is ${(100 * r.ratioExpansion).toFixed(0)} % of the allowable (${r.S_E.toFixed(1)} of ${r.SA.toFixed(1)} MPa): add flexibility (a loop or offset).`, about, source: SRC });
    if (r.ratioOccasional > 1) problems.push({ id: 'process:stress.occasional:' + r.node, code: 'stress.occasional', severity: 'error', text: `Occasional stress at ${r.node} is above 1.33 Sh.`, about, source: SRC });
  }
  const reactions = {};
  for (const [key, label] of [['case:W', 'weight'], ['case:T', 'thermal']]) {
    const R = res.results[key], rr = {};
    for (const sup of model.supports) { const idx = model.nodes.findIndex((n) => n.id === sup.node); rr[sup.node] = [...R.reactions.subarray(6 * idx, 6 * idx + 6)]; }
    reactions[label] = rr;
  }
  const growth = b.dT * m.alpha * (b.nodes[nn - 1].s - b.nodes[0].s);
  for (const r of nl.released) problems.push({ id: 'process:support.lift:' + r.node, code: 'support.lift', severity: 'info', text: `The rest at ${r.node} (s = ${r.s.toFixed(0)} mm) would have to pull the pipe down in the operating case, so it lifts off and is treated as free.`, about: [{ id: r.node }], source: SRC });
  for (const w of b.warnings) problems.push({ id: 'process:pipestress.warning:' + problems.length, code: 'pipestress.warning', severity: 'info', text: w, source: SRC });
  const notes = [b.bends && spec.flexibility ? `${b.bends} bend(s) modelled with the flexibility factor k = ${b.kflex.toFixed(2)}` : 'bend flexibility factor not applied: corners are stiff (conservative for expansion stress, not for supports); set flexibility: true', 'to be checked by an engineer; allowable stresses are the caller\'s (B31.3 Table A-1 is not reproduced)'];
  return { stresses, reactions, problems, bend: sif, section: sec, thermalGrowth: growth, warnings: b.warnings, model, released: nl.released, friction: nl.friction, notes };
}

/** Lift-off of rests and Coulomb friction (opt-in through supports of type 'rest' and `mu`). The operating case is weight + thermal; a rest with a negative reaction there is released and the run solved again. */
function solveNonlinear(b, spec) {
  const mu = spec.mu ?? 0, released = [], friction = [];
  const restNodes = (b.model.supports || []).filter((sp) => sp.fix[2] && !sp.fix[0] && !sp.fix[1] && !sp.fix[3] && !sp.fix[4] && !sp.fix[5]).map((sp) => sp.node);
  let off = new Set(), fric = new Map(), model = b.model, res = null;
  const make = () => {
    const mdl = JSON.parse(JSON.stringify(b.model)); mdl.supports = mdl.supports.filter((sp) => !off.has(sp.node));
    if (fric.size) { const T = mdl.cases.find((c) => c.id === 'T'); for (const [node, F] of fric) T.loads.push({ type: 'node', node, F: [F[0], F[1], 0, 0, 0, 0] }); }
    return mdl;
  };
  for (let it = 0; it < 12; it++) {
    model = make(); res = solveFrame(model);
    if (!res.ok) { if (off.size) { off = new Set([...off].slice(0, -1)); model = make(); res = solveFrame(model); } break; }
    const idx = (id) => model.nodes.findIndex((n) => n.id === id), Rw = res.results['case:W'].reactions, Rt = res.results['case:T'].reactions;
    let changed = false;
    for (const node of restNodes) {
      if (off.has(node)) continue;
      const i = idx(node), op = Rw[6 * i + 2] + Rt[6 * i + 2];
      if (op < -1e-6) { off.add(node); changed = true; }
    }
    if (changed) { fric = new Map(); continue; }
    if (mu > 0) {
      const u = res.results['case:T'].u; let moved = false; const next = new Map();
      for (const node of restNodes) {
        if (off.has(node)) continue;
        const i = idx(node), N = Rw[6 * i + 2] + Rt[6 * i + 2], ux = u[6 * i], uy = u[6 * i + 1], h = Math.hypot(ux, uy);
        if (h < 1e-6 || N <= 0) continue;
        const F = [-mu * N * ux / h, -mu * N * uy / h], prev = fric.get(node) || [0, 0], relaxed = [prev[0] + 0.6 * (F[0] - prev[0]), prev[1] + 0.6 * (F[1] - prev[1])];
        if (Math.hypot(relaxed[0] - prev[0], relaxed[1] - prev[1]) > 1e-3 * Math.max(1, Math.hypot(...F))) moved = true;
        next.set(node, relaxed);
      }
      fric = next; if (moved) continue;
    }
    break;
  }
  for (const node of off) { const nd = b.nodes.find((n) => n.id === node); released.push({ node, s: nd ? nd.s : 0 }); }
  for (const [node, F] of fric) friction.push({ node, F: Math.hypot(F[0], F[1]), mu });
  return { res, model, released, friction };
}

/** Loads a nozzle/anchor passes to the equipment (CH.9): the reaction at a support node, per case, in N and N·mm, and the same against a limit the caller gets from the vessel check. */
export function nozzleLoads(analysis, node, limit = null) {
  const out = {}; for (const [c, r] of Object.entries(analysis.reactions)) out[c] = r[node] || null;
  if (limit && out.thermal) { const F = Math.hypot(...out.thermal.slice(0, 3)), M = Math.hypot(...out.thermal.slice(3)); out.check = { F, M, ok: (!limit.F || F <= limit.F) && (!limit.M || M <= limit.M) }; }
  return out;
}
/** Plant run (BimCraft `plant` shape: { points, size, valves }) → spec skeleton; the caller adds material, temperatures and supports. */
export const fromPlantRun = (run, extra = {}) => ({ points: run.points, size: run.size, ...extra });
export { memberExtremes };
