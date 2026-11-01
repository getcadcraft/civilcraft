/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-concrete.js — what the Analysis panel needs around the concrete checks and the seismic loads (0.8 SU.1056, session
 * concrete-08): the settings kept in the analysis, the rigid floors by height, the seismic load cases made from them, the drift
 * rows, the report tables and the shared Problems. DOM-free; imports rc-design.js, rc-section.js and loads-asce7.js (all
 * already tested in Node). An aid until an engineer has reviewed it.
 *
 * analysis.concrete (kept in the model file; absent in older files) =
 *   { mat:  { fc, fy, fyt, lambda, sway, k, betaDns, cracked },                           f'c, bar and tie yield (MPa), λ, sway frame, K, cracked stiffness
 *     forms: { <section name, upper case>: { b, h, cover, top: { n, d }, bottom: { n, d }, side: { n, d },
 *                cage: { ny, nz, d } | null, tie: { legs, d, s }, role, spiral } },   mm; bars by count and diameter
 *     floors: [{ id, name, z, w }],                                              z mm, w = seismic weight of the floor (kN)
 *     slab?: { h, cover, fc, fy, lambda, bottomX, bottomY, topX, topY: { d, s } }    the bars of a slab made of plates (slab-design.js)
 *     wcases: { <case id>: factor },                                              the cases (and factors) the floors' weights are read from
 *     seismic: { SDS, SD1, S1, R, Ie, Cd, TL, system, risk, dir,
 *                useT, Tx, Ty }  }                                                 useT: the period from the analysis (Rayleigh, rayleighPeriods) in place of the approximate Ta; Tx, Ty in s
 *   The concrete section forms are turned into bars by `rcOf` (a member section's name picks its form), so the file keeps what
 *   the person typed and the bars follow.
 *
 *   cleanConcrete(x) → clean | null · rcOf(concrete, model) → rc settings for checkRcFrame
 *   concreteMaterial(mat) → { E, G, rho } (ACI 318-19 19.2.2.1.b: E = 4700 √f'c; ν = 0.2; 2400 kg/m³) · stiffnessFactor(mat, vertical) → 0.70 columns / 0.35 beams
 *      (Table 6.6.3.1.1(a), the analysis for lateral loads) when `cracked`, else 1
 *   suggestFloors(model) → [{ id, name, z, w: 0 }] · diaphragmsOf(floors) → model.diaphragms for the raw frame
 *   seismicCases(frame, concrete, { name }) → { ok, error?, elf, cases, skipped }   cases in the analysis shape (node loads `at`)
 *   rayleighPeriods(frame, sol, concrete) → { ok, X?, Y? } each { T, Σ…, floors }   the period of the analysed frame (ASCE 7-22 12.8.2, eq. C12.8-1 in the commentary; 0.8 round 3)
 *   driftRows(frame, sol, concrete) → [{ id, name, dir, set, … driftCheck row }] for each seismic case made here
 *   floorWeights(model, entries, floors) → { ok, weights: { <floor id>: N }, total, ground } the seismic weight of each floor from the vertical loads of cases
 *       (entries [{ id, f }]: own weight when the case has it, member and node loads, plates' own weight and area loads): each node's vertical load
 *       goes to the floor at or above it (below the first floor: that floor; the base level's own share goes to the ground, not to a floor), so a column
 *       between two floors gives half its weight to each (the half-storey rule)
 *   problemsOf({ rc, drift, label, t }) → [problem] (the shared shape, docs/0.8-PROBLEMS-SPEC.md § 1)
 *   concreteTables({ rc, elf, drift, concrete }, t) → report tables
 */
import { rectBars, perimeterBars } from './rc-section.js';
import { cleanRc } from './rc-design.js';
import { elf, floorCase, driftCheck, PERIOD_SYSTEMS, DRIFT_LIMITS, EDITION as ASCE } from './loads-asce7.js';
import { EDITION as ACI } from './rc-aci318.js';
import { storyDrifts } from './plate-solve.js';
import { cleanSlab } from './slab-design.js';
import { prepare, loadSet, equivalentLoads } from './frame-solve.js';
import { G_ACC } from './frame-model.js';

export const SYSTEMS = Object.keys(PERIOD_SYSTEMS);
export const RISKS = Object.keys(DRIFT_LIMITS).filter((r) => r !== 'I');
export const ROLES = ['auto', 'beam', 'column'];
export const GEN = 'elf';          // the mark on a seismic case this module made (a regeneration replaces them)

const n = (v, d, lo, hi) => { const x = typeof v === 'string' && v.trim() !== '' ? Number(v) : v; return typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : d; };
const txt = (s, max = 60) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const row = (r, d) => ({ n: Math.round(n(r?.n, d.n, 0, 40)), d: n(r?.d, d.d, 6, 60) });
const area = (d) => Math.PI * d * d / 4;

export const DEFAULT_SEISMIC = Object.freeze({ SDS: 1, SD1: 0.6, S1: 0.5, R: 5, Ie: 1, Cd: 4.5, TL: 8, system: 'concrete-mf', risk: 'II', dir: 'both' });

/** Untrusted → clean, or null when there is nothing (so an older file and a clean one stay as they are). */
export function cleanConcrete(x) {
  if (!x || typeof x !== 'object') return null;
  const m = x.mat || {}, s = x.seismic || {};
  const out = {
    mat: { fc: n(m.fc, 28, 10, 120), fy: n(m.fy, 420, 200, 700), fyt: n(m.fyt, 420, 200, 700), lambda: n(m.lambda, 1, 0.75, 1), sway: m.sway !== false, k: n(m.k, 1, 0.5, 5), betaDns: n(m.betaDns, 0.6, 0, 1), cracked: m.cracked !== false },
    forms: {}, floors: [], wcases: {},
    seismic: { SDS: n(s.SDS, 1, 0, 5), SD1: n(s.SD1, 0.6, 0, 3), S1: n(s.S1, 0.5, 0, 3), R: n(s.R, 5, 1, 12), Ie: n(s.Ie, 1, 1, 1.5), Cd: n(s.Cd, 4.5, 1, 8), TL: n(s.TL, 8, 1, 30),
      system: SYSTEMS.includes(s.system) ? s.system : 'concrete-mf', risk: RISKS.includes(s.risk) ? s.risk : 'II', dir: ['X', 'Y', 'both'].includes(s.dir) ? s.dir : 'both',
      useT: s.useT === true, Tx: n(s.Tx, null, 0.01, 30), Ty: n(s.Ty, null, 0.01, 30) },
  };
  if (x.forms && typeof x.forms === 'object') {
    for (const [name, f] of Object.entries(x.forms).slice(0, 500)) {
      if (!f || typeof f !== 'object') continue;
      const b = n(f.b, null, 50, 5000), h = n(f.h, null, 50, 5000);
      if (b === null || h === null) continue;
      const form = { b, h, cover: n(f.cover, 50, 10, Math.min(b, h) / 2 - 1), top: row(f.top, { n: 2, d: 20 }), bottom: row(f.bottom, { n: 3, d: 20 }), side: row(f.side, { n: 0, d: 12 }),
        cage: f.cage && typeof f.cage === 'object' ? { ny: Math.round(n(f.cage.ny, 3, 2, 20)), nz: Math.round(n(f.cage.nz, 3, 2, 20)), d: n(f.cage.d, 25, 6, 60) } : null,
        tie: { legs: Math.round(n(f.tie?.legs, 2, 0, 12)), d: n(f.tie?.d, 10, 6, 32), s: n(f.tie?.s, 150, 20, 1000) }, role: ROLES.includes(f.role) ? f.role : 'auto', spiral: f.spiral === true };
      out.forms[txt(name, 40).toUpperCase()] = form;
    }
  }
  const slab = cleanSlab(x.slab);   // 0.8 round 3: the bars given to a slab (slab-design.js); absent until the person sets them
  if (slab) out.slab = slab;
  if (x.wcases && typeof x.wcases === 'object') for (const [id, f] of Object.entries(x.wcases).slice(0, 100)) { const v = n(f, null, 0, 10); if (v !== null) out.wcases[txt(id, 20)] = v; }
  const ids = new Set();
  for (const fl of (Array.isArray(x.floors) ? x.floors : []).slice(0, 200)) {
    const id = txt(fl?.id, 20), z = n(fl?.z, null, -1e6, 1e6);
    if (!id || ids.has(id) || z === null) continue;
    ids.add(id);
    out.floors.push({ id, name: txt(fl.name, 40) || id, z, w: n(fl.w, 0, 0, 1e9) });
  }
  return out;
}

/** The bars and ties of every form whose name a model section carries → the `rc` settings checkRcFrame reads (keyed by section id). */
export function rcOf(concrete, model) {
  const c = cleanConcrete(concrete) || cleanConcrete({});
  const sections = {};
  for (const s of model?.sections || []) {
    const f = c.forms[String(s.name).toUpperCase()];
    if (!f) continue;
    const bars = f.cage
      ? perimeterBars({ b: f.b, h: f.h, cover: f.cover, ny: f.cage.ny, nz: f.cage.nz, A: area(f.cage.d) })
      : rectBars({ b: f.b, h: f.h, top: f.top.n ? { n: f.top.n, A: area(f.top.d), cover: f.cover } : null, bottom: f.bottom.n ? { n: f.bottom.n, A: area(f.bottom.d), cover: f.cover } : null,
        side: f.side.n ? { n: f.side.n, A: area(f.side.d), cover: f.cover } : null });
    const sec = { b: f.b, h: f.h, bars, role: f.role, spiral: f.spiral };
    if (f.tie.legs > 0) sec.ties = { Av: f.tie.legs * area(f.tie.d), s: f.tie.s };
    sections[s.id] = sec;
  }
  return cleanRc({ code: 'aci318', ...c.mat, sections });
}

/** Heights where at least two beam/brace ends meet (above the lowest support): the floors a plan would have. */
export function suggestFloors(model) {
  const at = new Map(model.nodes.map((q) => [q.id, q]));
  const base = Math.min(...model.supports.map((s) => at.get(s.node)?.z ?? 0), Infinity);
  const levels = [];
  for (const m of model.members) {
    const a = at.get(m.i), b = at.get(m.j);
    if (Math.abs(a.z - b.z) > 1) continue;                                   // only members lying in a level
    const z = (a.z + b.z) / 2, hit = levels.find((l) => Math.abs(l.z - z) <= 1);
    if (hit) hit.nodes.add(m.i).add(m.j); else levels.push({ z, nodes: new Set([m.i, m.j]) });
  }
  return levels.filter((l) => Number.isFinite(base) && l.z > base + 1 && l.nodes.size >= 2).sort((p, q) => p.z - q.z)
    .map((l, k) => ({ id: 'F' + (k + 1), name: 'F' + (k + 1), z: Math.round(l.z * 10) / 10, w: 0 }));
}

export function concreteMaterial(mat) { const E = 4700 * Math.sqrt(mat.fc); return { E, G: E / 2.4, rho: 2400 }; }
export const stiffnessFactor = (mat, vertical) => (mat.cracked ? (vertical ? 0.7 : 0.35) : 1);

export const diaphragmsOf = (floors) => (floors || []).map((f) => ({ id: f.id, name: f.name, z: f.z, tol: 1 }));

/**
 * Seismic load cases from the floors' weights: ELF (rc ASCE 7-22 12.8) → forces on the floors → one case per direction and sign of the
 * accidental torsion. `frame` = frameOf's result (its model carries the diaphragms the floors made).
 */
export function seismicCases(frame, concrete, { name = (dir, sign) => `E${dir}${sign > 0 ? '+' : '-'}` } = {}) {
  const c = cleanConcrete(concrete);
  if (!c || !c.floors.length) return { ok: false, error: 'no-floors' };
  const model = frame.model, have = new Set((model.diaphragms || []).map((d) => d.id));
  const floors = c.floors.filter((f) => have.has(f.id));
  const skipped = c.floors.filter((f) => !have.has(f.id)).map((f) => f.id);
  if (!floors.length) return { ok: false, error: 'no-floors', skipped };
  if (!floors.some((f) => f.w > 0)) return { ok: false, error: 'no-weights', skipped };
  const at = new Map(model.nodes.map((q) => [q.id, q]));
  const sup = model.supports.map((s) => at.get(s.node)?.z).filter((z) => z !== undefined);
  if (!sup.length) return { ok: false, error: 'no-base' };
  const s = c.seismic;
  const levels = floors.filter((f) => f.w > 0).map((f) => ({ id: f.id, z: f.z, w: f.w * 1000 }));
  const dirs = s.dir === 'both' ? ['X', 'Y'] : [s.dir];
  // one ELF per direction: the period from the analysis can differ between X and Y (12.8.2: T never above Cu·Ta)
  const elfBy = {};
  for (const dir of dirs) elfBy[dir] = elf({ levels, base: Math.min(...sup), SDS: s.SDS, SD1: s.SD1, S1: s.S1, R: s.R, Ie: s.Ie, T: s.useT ? (dir === 'X' ? s.Tx : s.Ty) : null, TL: s.TL, system: s.system });
  const r = elfBy[dirs[0]];
  const cases = [];
  for (const dir of dirs) for (const sign of [1, -1]) {
    const id = 'E' + dir + (sign > 0 ? '1' : '2');
    const forces = Object.fromEntries(elfBy[dir].levels.map((l) => [l.id, l.Fx]));
    const fc = floorCase(model, { id, name: name(dir, sign), kind: 'seismic', dir, forces, sign });
    cases.push({ id, name: fc.name, kind: 'seismic', selfWeight: 0, gen: GEN, dir,
      loads: fc.loads.map((l) => { const q = at.get(l.node); return { type: 'node', at: [q.x, q.y, q.z], F: l.F }; }) });
  }
  return { ok: true, elf: r, elfBy, cases, skipped };
}

/**
 * The period of the analysed frame by Rayleigh's method, T = 2π √( Σ wᵢ δᵢ² / ( g Σ fᵢ δᵢ ) ) (ASCE/SEI 7-22 12.8.2: "the fundamental period shall be established using the
 * structural properties and deformational characteristics of the resisting elements in a properly substantiated analysis"; Rayleigh's quotient is the textbook form, e.g. Chopra,
 * Dynamics of Structures, the Rayleigh quotient): wᵢ the seismic weight of each floor (the floors' w), fᵢ the forces the seismic case put on it, δᵢ the floor's
 * elastic displacement under them (the sum of the storey drifts up from the base, at the floor's centre). It is an upper bound of the true fundamental period; 12.8.2 then caps the
 * period used at Cu·Ta, which `elf` does. One result per direction that has a solved seismic case (EX1 / EY1).
 *   → { ok, X?: { T, floors: [{ id, w, f, delta }] }, Y?: … } | { ok: false, error: 'no-cases' | 'no-weights' | 'no-motion' }
 */
export function rayleighPeriods(frame, sol, concrete) {
  const c = cleanConcrete(concrete);
  if (!c || !sol?.ok || !frame?.model?.diaphragms?.length) return { ok: false, error: 'no-cases' };
  const out = { ok: false };
  const model = frame.model, floorOf = new Map();
  for (const d of model.diaphragms) for (const nd of d.nodes || []) floorOf.set(nd, d.id);
  let weights = false;
  for (const dir of ['X', 'Y']) {
    const R = sol.results['case:E' + dir + '1'], cs = model.cases.find((q) => q.id === 'E' + dir + '1');
    if (!R || !cs) continue;
    const idx = dir === 'X' ? 0 : 1;
    const f = new Map();
    for (const l of cs.loads || []) if (l.type === 'node' && floorOf.has(l.node)) f.set(floorOf.get(l.node), (f.get(floorOf.get(l.node)) || 0) + Math.abs(l.F[idx]));
    const drifts = storyDrifts(sol.prep, R);
    let cum = 0, sw = 0, sf = 0;
    const floors = [];
    for (const d of drifts) {   // ascending in z
      cum += idx === 0 ? d.dx : d.dy;
      const fl = c.floors.find((q) => q.id === d.id), w = (fl ? fl.w : 0) * 1000, ff = f.get(d.id) || 0, delta = cum / 1000;   // N, N, m
      floors.push({ id: d.id, w, f: ff, delta });
      if (w > 0) { weights = true; sw += w * delta * delta; }
      sf += ff * delta;
    }
    if (!(sw > 0) || !(sf > 0)) continue;
    out[dir] = { T: 2 * Math.PI * Math.sqrt(sw / (G_ACC * sf)), floors };
    out.ok = true;
  }
  if (!out.ok) out.error = weights ? 'no-motion' : 'no-weights';
  return out;
}

/** The weight of each floor from cases (see the header): downward N per floor, what went to the ground, and the total applied. */
export function floorWeights(model, entries, floors) {
  const prep = prepare(model);
  if (!prep || prep.error) return { ok: false, error: prep?.error?.code || 'no-solution' };
  const list = entries.map(({ id, f }) => ({ c: model.cases.find((q) => q.id === id), f })).filter((e) => e.c && e.f);
  const { nodeF, memLoads } = loadSet(prep, list.map(({ c, f }) => ({ c: { ...c, loads: c.loads.filter((l) => l.type !== 'area') }, f })));      // area loads are the plates' (below)
  const nn = prep.nn, Fz = new Float64Array(nn);                      // vertical load at each node, N, up positive
  for (let k = 0; k < nn; k++) Fz[k] = nodeF[6 * k + 2];
  prep.mem.forEach((e, k) => {
    const p = new Float64Array(12);
    for (const pz of memLoads[k]) equivalentLoads(pz, e.ax.L, p);
    const { ex, ey, ez } = e.ax;
    Fz[e.i] += ex[2] * p[0] + ey[2] * p[1] + ez[2] * p[2];
    Fz[e.j] += ex[2] * p[6] + ey[2] * p[7] + ez[2] * p[8];
  });
  for (const p of prep.shell?.pl || []) {
    for (const { c, f } of list) {
      let q = c.selfWeight ? -c.selfWeight * f * p.rho * 1e-9 * G_ACC * p.t : 0;     // N/mm² along z
      for (const l of c.loads) if (l.type === 'area' && l.plate === p.id) q += l.dir === 'Z' ? l.p * f : l.dir === 'n' ? l.p * f * p.el.ax.ez[2] : 0;
      if (q) p.nodes.forEach((nd, k) => { Fz[nd] += p.ca[k] * q; });
    }
  }
  const fl = [...floors].sort((a, b) => a.z - b.z);
  const base = Math.min(...model.supports.map((s) => prep.P[prep.idx.get(s.node)][2]));
  const weights = Object.fromEntries(fl.map((f) => [f.id, 0]));
  let ground = 0, total = 0;
  for (let k = 0; k < nn; k++) {
    const z = prep.P[k][2], w = -Fz[k];
    total += w;
    if (!fl.length || z <= base + 1) { ground += w; continue; }
    const up = fl.find((f) => f.z >= z - 1) || fl[fl.length - 1];
    weights[up.id] += w;
  }
  return { ok: true, weights, total, ground };
}

/** Storey drifts of each seismic case made here (the worst node in the case's direction), checked with Cd/Ie and Table 12.12-1. */
export function driftRows(frame, sol, concrete) {
  const c = cleanConcrete(concrete);
  if (!c || !sol?.ok || !frame.model.diaphragms?.length) return [];
  const out = [];
  for (const [key, R] of Object.entries(sol.results)) {
    if (!key.startsWith('case:') || !/^E[XY][12]$/.test(R.id)) continue;
    const dir = R.id[1];
    for (const d of driftCheck(storyDrifts(sol.prep, R), { Cd: c.seismic.Cd, Ie: c.seismic.Ie, risk: c.seismic.risk, dir })) out.push({ ...d, dir, set: R.id, setName: R.name });
  }
  return out;
}

const pc = (v) => (v === null || v === undefined || !Number.isFinite(v) ? '' : (Math.round(v * 1000) / 10).toFixed(1) + ' %');
const f2 = (v, d = 2) => (Number.isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toFixed(d) : '');

/**
 * Failed and unfinished concrete checks and the drift as shared problems. `label(id)` names a drawn member (the panel knows the map from
 * analysed pieces to drawn members: `drawn(pieceId)` → drawn id). Ids are stable: code + object (+ combination for drift).
 */
export function problemsOf({ rc, drift, drawn = (id) => id, label = () => '', t }) {
  const out = [];
  const src = { name: 'detailcraft.frame' };
  const seen = new Set();
  if (rc?.ok) for (const m of rc.members) {
    const id = drawn(m.id);
    if (m.status === 'fail') {
      const key = 'rc.fail|' + id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: 'rc.fail:' + id, code: 'rc.fail', severity: 'warning', source: src, about: [{ kind: 'member', id, label: label(id) }],
        msg: { key: 'frame.rc.prob.fail', vars: { util: Math.round(m.util * 1000) / 10, check: m.check.id, clause: m.check.clause } },
        text: t('frame.rc.prob.fail', { util: f2(m.util * 100, 1), check: t('frame.rc.check.' + m.check.id), clause: m.check.clause }),
        req: { op: '<=', value: 1, unit: 'ratio' }, found: { value: Math.round(m.util * 1e4) / 1e4, unit: 'ratio' } });
    } else if (m.status === 'partial') {
      const key = 'rc.partial|' + id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: 'rc.partial:' + id, code: 'rc.partial', severity: 'note', source: src, about: [{ kind: 'member', id, label: label(id) }],
        msg: { key: 'frame.rc.prob.partial', vars: { why: m.partial[0] } }, text: t('frame.rc.prob.partial', { why: t('frame.rc.why.' + m.partial[0]) }) });
    }
  }
  for (const d of drift || []) {
    if (d.ratio <= 1) continue;
    out.push({ id: 'drift:' + d.set + ':' + d.id, code: 'seismic.drift', severity: 'warning', source: src, about: [],
      msg: { key: 'frame.eq.prob.drift', vars: { floor: d.name, ratio: Math.round(d.ratio * 1000) / 10 } },
      text: t('frame.eq.prob.drift', { floor: d.name, set: d.setName, design: f2(d.design, 1), allowed: f2(d.allowed, 1), ratio: f2(d.ratio * 100, 1) }),
      req: { op: '<=', value: Math.round(d.allowed * 100) / 100, unit: 'mm' }, found: { value: Math.round(d.design * 100) / 100, unit: 'mm' } });
  }
  return out;
}

/** Report tables: assumptions and results of the concrete checks, the seismic forces and the drift. */
export function concreteTables({ rc, elf: E, drift, concrete, slab }, tr) {
  const T = [];
  const c = cleanConcrete(concrete) || cleanConcrete({});
  /* i18n-ignore-start: column heads that are symbols / units */
  if (rc?.ok) {
    T.push({ title: tr('frame.rc.title'), head: [tr('frame.rep.item'), tr('frame.rep.value')], numeric: [], rows: [
      [tr('frame.rc.not-reviewed'), ''], [tr('frame.des.code'), ACI],
      [tr('frame.rc.materials'), `f'c ${c.mat.fc} MPa, fy ${c.mat.fy} MPa, fyt ${c.mat.fyt} MPa, λ ${c.mat.lambda}`],
      [tr('frame.rc.assume'), tr('frame.rc.assume-text', { k: c.mat.k, sway: tr(c.mat.sway ? 'frame.rc.sway' : 'frame.rc.nonsway'), stiff: tr(c.mat.cracked ? 'frame.rc.stiff-cracked' : 'frame.rc.stiff-gross') })],
      [tr('frame.des.not-built'), tr('frame.rc.not-built-text')],
      [tr('frame.des.counts'), tr('frame.des.counts-text', { n: rc.counts.checked, partial: rc.counts.partial, bad: rc.counts.failed, skip: rc.counts.notChecked, combos: rc.combos })],
    ] });
    T.push({ title: tr('frame.rc.summary'), head: [tr('frame.rep.member'), tr('frame.rep.part'), tr('frame.rep.section'), tr('frame.des.util'), tr('frame.des.state'), tr('frame.des.governs'), tr('frame.des.set')], numeric: [3],
      rows: rc.members.map((m) => [m.id, m.ref, m.section, pc(m.util), tr('frame.des.st.' + m.status),
        m.status === 'not-checked' ? tr('frame.rc.why.' + m.why) : tr('frame.rc.check.' + m.check.id) + ' · ' + m.check.clause + (m.partial?.length ? ' · ' + tr('frame.des.partial', { why: tr('frame.rc.why.' + m.partial[0]) }) : ''),
        m.set ? (m.sets.find((s) => s.set === m.set)?.name || '') : '']) });
    const slender = rc.members.filter((m) => m.mag && (m.mag.y || m.mag.z));
    if (slender.length) T.push({ title: tr('frame.rc.slender-title'), head: [tr('frame.rep.member'), tr('frame.rc.axis'), 'kℓu/r', tr('frame.rc.limit'), 'Pc (kN)', 'Cm', 'δns', 'M2,min (kN·m)', 'Mc (kN·m)'], numeric: [2, 3, 4, 5, 6, 7, 8],
      rows: slender.flatMap((m) => ['y', 'z'].filter((ax) => m.mag[ax]).map((ax) => { const g = m.mag[ax]; return g.unstable ? [m.id, ax, f2(g.kLr, 1), f2(g.limit, 1), f2(g.Pc / 1e3, 0), '', '', '', tr('frame.rc.buckles')] : [m.id, ax, f2(g.kLr, 1), f2(g.limit, 1), f2(g.Pc / 1e3, 0), f2(g.Cm, 2), f2(g.delta, 3), f2(g.M2min / 1e6, 1), f2(g.Mc / 1e6, 1)]; })) });
    T.push({ title: tr('frame.des.clauses'), head: [tr('frame.des.clause')], numeric: [], rows: rc.clauses.map((x) => [x]) });
  }
  if (slab?.ok) {
    /* i18n-ignore-start: symbols and units */
    T.push({ title: tr('frame.slab.title'), head: [tr('frame.slab.layer'), 'Mu (kN·m/m)', 'd (mm)', tr('frame.slab.need'), tr('frame.slab.prov'), tr('frame.des.util'), tr('frame.slab.where')], numeric: [1, 2, 3, 4, 5],
      rows: slab.rows.map((r) => [tr('frame.slab.l.' + r.key), f2(r.Mu, 1), f2(r.d, 0), f2(r.need, 0), f2(r.prov, 0) + ' (' + r.bar + ' @ ' + r.s + ')', pc(r.ratio), r.plate + ' · ' + r.set])
        .concat(slab.checks.map((c) => [tr('frame.slab.shear'), '', f2(c.d, 0), f2(c.demand / 1000, 1) + ' kN/m', f2(c.capacity / 1000, 1) + ' kN/m', pc(c.ratio), c.plate + ' · ' + c.set])) });
    /* i18n-ignore-end */
  }
  if (E) {
    const s = c.seismic;
    T.push({ title: tr('frame.eq.title'), head: [tr('frame.rep.item'), tr('frame.rep.value')], numeric: [], rows: [
      [tr('frame.rc.not-reviewed'), ''], [tr('frame.des.code'), ASCE],
      [tr('frame.eq.params'), `SDS ${s.SDS} g, SD1 ${s.SD1} g, S1 ${s.S1} g, R ${s.R}, Ie ${s.Ie}, Cd ${s.Cd}, TL ${s.TL} s`],
      [tr('frame.eq.system'), tr('frame.eq.sys-' + s.system) + ' · ' + tr('frame.eq.risk', { risk: s.risk })],
      [tr('frame.eq.period'), tr('frame.eq.period-text', { Ta: f2(E.Ta, 3), T: f2(E.T, 3), hn: f2(E.hn / 1000, 2), k: f2(E.k, 2) })],
      [tr('frame.eq.base'), tr('frame.eq.base-text', { Cs: f2(E.Cs, 4), eq: E.csEq, W: f2(E.W / 1000, 0), V: f2(E.V / 1000, 1) })],
      [tr('frame.des.not-built'), tr('frame.eq.not-built-text')],
    ] });
    T.push({ title: tr('frame.eq.forces'), head: [tr('frame.eq.floor'), 'z (mm)', 'w (kN)', 'Cvx', 'Fx (kN)', 'Vx (kN)'], numeric: [1, 2, 3, 4, 5],
      rows: E.levels.map((l) => [l.id, f2(l.hx, 0), f2(l.w / 1000, 1), f2(l.Cvx, 4), f2(l.Fx / 1000, 1), f2(l.Vx / 1000, 1)]) });
    T.push({ title: tr('frame.des.clauses'), head: [tr('frame.des.clause')], numeric: [], rows: [...E.clauses, 'ASCE/SEI 7-22 12.8.4.2'].map((x) => [x]) });
  }
  if (drift?.length) T.push({ title: tr('frame.eq.drift'), head: [tr('frame.eq.floor'), tr('frame.des.set'), 'h (mm)', 'δxe (mm)', 'Cd δxe/Ie (mm)', tr('frame.eq.allowed'), tr('frame.des.util')], numeric: [2, 3, 4, 5, 6],
    rows: drift.map((d) => [d.name, d.setName, f2(d.h, 0), f2(d.elastic, 2), f2(d.design, 2), f2(d.allowed, 1), pc(d.ratio)]) });
  /* i18n-ignore-end */
  return T;
}
