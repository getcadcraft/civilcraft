/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-members.js — a frame model from a list of straight members (0.10 SU.1811, session engineering-10): what a weldment (PartCraft's Structural member feature) or
 * a drawn frame (DetailCraft) hands over, turned into the plain-data model of frame-model.js with supports, equipment loads and weld groups at the joints. DOM-free,
 * imports frame-model.js and frame-weld.js; the section table comes in as an argument (`shapes` = { findSection, outline } of lib/shapes/sections.js) so the file
 * stays free of an app's folder layout. An aid until an engineer has reviewed it.
 *
 *   input = { name?, members: [{ id, a: [x, y, z], b: [x, y, z], section, roll?, rel?, from? }],      mm, +Z up; section = a name of the section table
 *             supports: [{ at: [x, y, z], fix: 'fixed' | 'pinned' | 'roller' | [6 booleans] }],
 *             equipment: [{ id, name, mass (kg), cg: [x, y, z], mounts: [[x, y, z], …], h?, push?: [Fx, Fy, Fz] N at the CG, case?: id (default 'dead') }],
 *             nodeLoads: [{ at: [x, y, z], F: [Fx Fy Fz Mx My Mz], case? }],
 *             selfWeight: 1 (factor on the steel's own weight; 0 = none), code: 'asce-aisc' | 'en' (makes the load combinations; none when absent) }
 *   buildFrame(input, shapes, { tol = 0.5 }) → { ok, model, warnings, equipment: [{ id, mounts: [{ node, Fz, Fx, Fy }], cgOutside }] } | { ok: false, error }
 *   A member end that lands on another member's middle splits that member there (a T joint); mounts and supports on a member's line split it too.
 *   Equipment: the weight (mass × g) and the push at the CG, h above the mounts' plane, are carried to the mounts as a rigid body: the vertical forces satisfy
 *   ΣFz = −W + Fz, and the two moments of the wrench; the least-norm set does it (one mount takes it all; two mounts on a line cannot take a moment across the line:
 *   said as `equipment-moment`). A negative force (uplift) at a mount is kept and said as `equipment-uplift`. The horizontal push is shared equally.
 *   jointWelds(model, { size, parts }) → weld groups (frame-weld.js shape) at every member end that meets another member: all round for an RHS / CHS / I section.
 */
import { cleanFrame, sectionOf, STEEL, G_ACC } from './frame-model.js';
import { perimeterSegments } from './frame-weld.js';
import { generateCombos } from './frame-combos.js';

const FIX = { fixed: [1, 1, 1, 1, 1, 1], pinned: [1, 1, 1, 0, 0, 0], roller: [0, 0, 1, 0, 0, 0] };
const fin3 = (p) => Array.isArray(p) && p.length === 3 && p.every((v) => typeof v === 'number' && Number.isFinite(v));
const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];

/** The model's section record (A, Iy, Iz, J, shape) of a table section, or null. */
export function sectionRecord(name, shapes) {
  const p = shapes.findSection(name);
  if (!p) return null;
  const s = sectionOf({ ...p, loops: shapes.outline(p, 16) });
  const shape = p.kind === 'I' ? { kind: 'I', d: p.d, bf: p.bf, tw: p.tw, tf: p.tf, r: p.r || 0 }
    : p.kind === 'RHS' ? { kind: 'RHS', h: p.h, b: p.b, t: p.t, ro: p.ro ?? 2 * p.t, hot: /^(SHS|RHS)\d/i.test(p.name) }     // UK hot finished (EN 10210) names carry no CF; AISC HSS are cold formed
    : p.kind === 'CHS' ? { kind: 'CHS', D: p.D, t: p.t, hot: /^CHS\d/i.test(p.name) }
    : null;
  return { name: p.name, A: s.A, Iy: s.Iy, Iz: s.Iz, J: s.J, roll: s.roll || 0, ...(shape ? { shape } : {}) };
}

export function buildFrame(input, shapes, { tol = 0.5 } = {}) {
  const warnings = [];
  const warn = (code, extra = {}) => warnings.push({ code, ...extra });
  const mem = (input?.members || []).filter((m) => m && fin3(m.a) && fin3(m.b) && Math.hypot(...sub(m.b, m.a)) > tol);
  if (!mem.length) return { ok: false, error: 'no-members' };
  const supports = (input.supports || []).filter((s) => fin3(s?.at));
  const equipment = (input.equipment || []).filter((e) => e && Number.isFinite(e.mass) && e.mass >= 0 && fin3(e.cg) && Array.isArray(e.mounts) && e.mounts.length && e.mounts.every(fin3));
  const nodeLoads = (input.nodeLoads || []).filter((l) => fin3(l?.at) && Array.isArray(l.F) && l.F.length === 6 && l.F.every(Number.isFinite));
  // points that must be nodes: member ends, supports, mounts, point loads
  const pts = [];
  const nodeAt = (p) => {
    for (let i = 0; i < pts.length; i++) if (Math.hypot(...sub(pts[i], p)) <= tol) return i;
    pts.push(p.slice()); return pts.length - 1;
  };
  for (const m of mem) { nodeAt(m.a); nodeAt(m.b); }
  const extra = [...supports.map((s) => s.at), ...equipment.flatMap((e) => e.mounts), ...nodeLoads.map((l) => l.at)];
  for (const p of extra) nodeAt(p);
  // split every member at the points that lie on its line, strictly inside it
  const pieces = [];
  for (const m of mem) {
    const d = sub(m.b, m.a), L = Math.hypot(...d), u = d.map((v) => v / L);
    const on = [0, L];
    for (const p of pts) {
      const r = sub(p, m.a), t = dot(r, u);
      if (t <= tol || t >= L - tol) continue;
      const off = Math.hypot(...sub(r, u.map((v) => v * t)));
      if (off <= tol) on.push(t);
    }
    on.sort((x, y) => x - y);
    const ts = on.filter((t, k) => k === 0 || t - on[k - 1] > tol);
    for (let k = 0; k + 1 < ts.length; k++) pieces.push({ m, a: m.a.map((v, i) => v + u[i] * ts[k]), b: m.a.map((v, i) => v + u[i] * ts[k + 1]), k, n: ts.length - 1 });
  }
  const nodes = pts.map((p, i) => ({ id: 'n' + (i + 1), x: p[0], y: p[1], z: p[2] }));
  const secs = new Map(), sections = [];
  const members = [];
  for (const pc of pieces) {
    const key = String(pc.m.section).toUpperCase();
    if (!secs.has(key)) {
      const rec = sectionRecord(pc.m.section, shapes);
      if (!rec) { warn('unknown-section', { member: pc.m.id, section: pc.m.section }); secs.set(key, null); }
      else { const { roll, ...r } = rec; secs.set(key, { id: 's' + (sections.length + 1), ...r, roll }); sections.push(secs.get(key)); }
    }
    const sec = secs.get(key);
    if (!sec) continue;
    const id = pc.n > 1 ? pc.m.id + '.' + (pc.k + 1) : String(pc.m.id);
    members.push({ id, i: nodes[nodeAt(pc.a)].id, j: nodes[nodeAt(pc.b)].id, section: sec.id, material: 'steel', roll: (pc.m.roll || 0) + sec.roll, ...(pc.m.rel ? { rel: pc.m.rel } : {}), from: pc.m.from || { app: 'members', ref: String(pc.m.id) } });
  }
  if (!members.length) return { ok: false, error: 'no-sections', warnings };
  const sup = [];
  for (const s of supports) {
    const fix = typeof s.fix === 'string' ? FIX[s.fix] : s.fix;
    if (!fix) { warn('bad-support'); continue; }
    sup.push({ node: nodes[nodeAt(s.at)].id, fix: fix.map((v) => (v ? 1 : 0)) });
  }
  if (!sup.length) warn('no-supports');
  const used = new Set(members.flatMap((m) => [m.i, m.j]));
  for (const e of equipment) for (const p of e.mounts) if (!used.has(nodes[nodeAt(p)].id)) warn('mount-off-frame', { equipment: e.id, at: p });
  const cases = [{ id: 'dead', name: 'Dead (steel + equipment)', kind: 'dead', selfWeight: Number.isFinite(input.selfWeight) ? input.selfWeight : 1, loads: [] }];
  const caseOf = (id) => { id = id || 'dead'; let c = cases.find((x) => x.id === id); if (!c) { c = { id, name: id, kind: id === 'dead' ? 'dead' : 'other', selfWeight: 0, loads: [] }; cases.push(c); } return c; };
  const eqOut = [];
  for (const e of equipment) {
    const r = distribute(e, nodeAt, nodes, warn);
    for (const m of r.mounts) caseOf(e.case).loads.push({ type: 'node', node: m.node, F: [m.Fx, m.Fy, m.Fz, 0, 0, 0] });
    eqOut.push({ id: e.id, mounts: r.mounts, cgOutside: r.cgOutside });
  }
  for (const l of nodeLoads) caseOf(l.case).loads.push({ type: 'node', node: nodes[nodeAt(l.at)].id, F: l.F });
  const raw = { format: 'cadcraft-frame', version: 1, name: String(input.name || 'frame'), nodes, materials: [{ id: 'steel', name: 'steel', ...STEEL }], sections: sections.map(({ roll, ...s }) => s), members, supports: sup, cases, combos: [] };
  if (input.code === 'asce-aisc' || input.code === 'en') raw.combos = generateCombos(input.code, cases).combos;
  const { model, warnings: w2 } = cleanFrame(raw);
  return { ok: true, model, warnings: [...warnings, ...w2], equipment: eqOut };
}

/** The wrench of one piece of equipment carried to its mounts (see the header). */
function distribute(e, nodeAt, nodes, warn) {
  const W = e.mass * G_ACC;                                            // N (kg × m/s²)
  const mounts = e.mounts, n = mounts.length, zm = mounts.reduce((s, p) => s + p[2], 0) / n;
  const [Fx = 0, Fy = 0, Fz = 0] = e.push || [];
  const h = Number.isFinite(e.h) ? e.h : e.cg[2] - zm;
  const FzT = -W + Fz;                                                 // total vertical force on the frame (down is negative)
  const x = e.cg[0], y = e.cg[1];
  // Σ Fz_i = FzT;  Σ y_i Fz_i = y FzT − h Fy;  Σ x_i Fz_i = x FzT − h Fx   (moments of the wrench about the mounts' plane origin), written about the mounts' centroid
  // and scaled by their extent so the 3 × 3 system is well conditioned (the equations then decouple; the regularisation only acts when the mounts are collinear)
  const xc = mounts.reduce((s, p) => s + p[0], 0) / n, yc = mounts.reduce((s, p) => s + p[1], 0) / n;
  const S = Math.max(1, ...mounts.map((p) => Math.hypot(p[0] - xc, p[1] - yc)));
  const b = [FzT, ((y - yc) * FzT - h * Fy) / S, ((x - xc) * FzT - h * Fx) / S];
  const A = [mounts.map(() => 1), mounts.map((p) => (p[1] - yc) / S), mounts.map((p) => (p[0] - xc) / S)];
  const Gm = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < n; k++) Gm[i][j] += A[i][k] * A[j][k];
  const lam = solve3(Gm, b, 1e-12 * (Gm[0][0] + Gm[1][1] + Gm[2][2]));
  const f = mounts.map((_, k) => A[0][k] * lam[0] + A[1][k] * lam[1] + A[2][k] * lam[2]);
  const res = [0, 1, 2].map((i) => A[i].reduce((s, a, k) => s + a * f[k], 0) - b[i]);
  const scale = Math.max(Math.abs(FzT) * Math.max(1, Math.hypot(x - xc, y - yc) / S), 1);
  if (Math.hypot(...res) > 1e-6 * scale) warn('equipment-moment', { equipment: e.id });
  if (f.some((v) => v > 1e-9 * Math.abs(FzT) && FzT < 0)) warn('equipment-uplift', { equipment: e.id });
  const xs = mounts.map((p) => p[0]), ys = mounts.map((p) => p[1]);
  const cgOutside = x < Math.min(...xs) - 1e-9 || x > Math.max(...xs) + 1e-9 || y < Math.min(...ys) - 1e-9 || y > Math.max(...ys) + 1e-9;
  if (cgOutside) warn('equipment-cg-outside', { equipment: e.id });
  return { mounts: mounts.map((p, k) => ({ node: nodes[nodeAt(p)].id, Fx: Fx / n, Fy: Fy / n, Fz: f[k] })), cgOutside };
}

/** Tikhonov-regularised 3 × 3 solve (Gaussian elimination with partial pivoting): the least-norm answer when the mounts are collinear. */
function solve3(G, b, eps) {
  const M = G.map((r, i) => [...r.map((v, j) => v + (i === j ? eps : 0)), b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-300) continue;
    for (let r = c + 1; r < 3; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = [0, 0, 0];
  for (let r = 2; r >= 0; r--) { let s = M[r][3]; for (let k = r + 1; k < 3; k++) s -= M[r][k] * x[k]; x[r] = Math.abs(M[r][r]) < 1e-300 ? 0 : s / M[r][r]; }
  return x;
}

/** Weld groups at every member end that meets another member (or a support): all round the section, leg `size` (default the wall, at most 8 mm). */
export function jointWelds(model, { size = null, kind = 'fillet' } = {}) {
  const at = new Map();
  for (const m of model.members) for (const n of [m.i, m.j]) at.set(n, (at.get(n) || 0) + 1);
  const sup = new Set(model.supports.map((s) => s.node));
  const secs = new Map(model.sections.map((s) => [s.id, s]));
  const out = [];
  for (const m of model.members) {
    const sh = secs.get(m.section)?.shape;
    if (!sh) continue;
    for (const end of ['i', 'j']) {
      const node = m[end];
      if (at.get(node) < 2 && !sup.has(node)) continue;
      const t = sh.kind === 'RHS' || sh.kind === 'CHS' ? sh.t : Math.min(sh.tf, sh.tw);
      const w = size ?? Math.min(t, 8);
      out.push({ id: m.id + ':' + end, member: m.id, end, ref: m.from?.ref || '', segments: perimeterSegments(sh, w, { t, kind }) });
    }
  }
  return out;
}
