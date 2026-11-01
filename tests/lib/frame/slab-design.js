/* SPDX-License-Identifier: Apache-2.0 */
/**
 * slab-design.js — reinforcement for a concrete slab from the plate moments (0.8 round 3, SU.1056 next step). DOM-free; imports rc-aci318.js and plate-solve.js only.
 * An aid until an engineer has reviewed it, like the rest of the concrete checks.
 *
 *   woodArmer(Mx, My, Mxy) → { bx, by, tx, ty }   the design moments of the two bar layers (bottom x, bottom y, top x, top y; N·mm per mm, ≥ 0) that carry the
 *       bending and the twisting moment together: R. H. Wood, "The reinforcement of slabs in accordance with a pre-determined field of moments", Concrete 2 (1968) 69–76,
 *       and W. L. Armer's comment on it in the same volume, in the form of the textbooks (Park and Gamble, Reinforced Concrete Slabs; Eurocode 2 Annex LL
 *       informative): Mx* = Mx + |Mxy|, My* = My + |Mxy|; if one is negative it is set to zero and the other raised by Mxy²/|that one|. Top layers: the same with the moments
 *       turned over. Positive Mx / My = tension on the bottom face (the plate sign: a slab sagging under gravity is positive).
 *   slabDesign(model, sol, slab, { sets }) → { ok, plates, max, rows, checks }   every plate's centre resultants in every strength combination, the required steel
 *       per metre in each layer (flexure: requiredAs from rc-aci318.js, minimum steel ACI 318-19 24.4.3.2 / 7.6.1.1, depth to each layer from the cover and the bar size),
 *       one-way shear against φVc (22.5.5.1 through beamShear), against the bars given.
 *   slab = { h (mm; default: the plate thickness), cover, fc, fy, fyt?, lambda, bottomX: { d, s }, bottomY: { d, s }, topX: { d, s }, topY: { d, s } }  bars in mm and spacing mm
 *   cleanSlab(x) → slab | null
 *
 * Plate axes: a horizontal plate has x = global X, y = global Y (plate.js). The x layer lies outermost (its depth is h − cover − d/2), the y layer inside it.
 * Not covered: deflection (the thickness is yours), punching at columns (the plates give a nodal reaction, not a punching check), openings' trimmer bars, detailing
 * of curtailment and laps, and the slab as part of a lateral system (chapter 18). Support moments over a column converge slowly with four-node plates: refine the mesh.
 */
import { requiredAs, beamShear, PHI_SHEAR } from './rc-aci318.js';
import { plateCentre } from './plate-solve.js';

const PHI_FLEX = 0.9;
const n = (v, d, lo, hi) => { const x = typeof v === 'string' && v.trim() !== '' ? Number(v) : v; return typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : d; };
const bar = (b, d) => ({ d: n(b?.d, d.d, 6, 40), s: n(b?.s, d.s, 50, 600) });

export function cleanSlab(x) {
  if (!x || typeof x !== 'object') return null;
  const def = { d: 12, s: 200 };
  return { h: n(x.h, 0, 0, 2000), cover: n(x.cover, 25, 10, 100), fc: n(x.fc, 28, 10, 120), fy: n(x.fy, 420, 200, 700), lambda: n(x.lambda, 1, 0.75, 1),
    bottomX: bar(x.bottomX, def), bottomY: bar(x.bottomY, def), topX: bar(x.topX, def), topY: bar(x.topY, def) };
}

/** Bottom and top design moments of the two layers for the plate moments Mx, My, Mxy (all per unit width, any consistent units). */
export function woodArmer(Mx, My, Mxy) {
  const t = Math.abs(Mxy);
  const layer = (a, b) => {                                    // a, b = the moments in the direction of each layer, tension on the face this layer is on
    let xa = a + t, yb = b + t;
    if (xa < 0) { yb = b + (t * t) / Math.abs(a); xa = 0; }     // here a < −t ≤ 0, so a is not zero
    else if (yb < 0) { xa = a + (t * t) / Math.abs(b); yb = 0; }
    return [Math.max(0, xa), Math.max(0, yb)];
  };
  const [bx, by] = layer(Mx, My), [tx, ty] = layer(-Mx, -My);
  return { bx, by, tx, ty };
}

const area = (d) => Math.PI * d * d / 4;

export function slabDesign(model, sol, slabIn, { sets = null } = {}) {
  const slab = cleanSlab(slabIn);
  if (!slab) return { ok: false, error: 'no-slab' };
  if (!sol?.ok || !model.plates?.length) return { ok: false, error: 'no-plates' };
  const combos = (sets || model.combos.filter((c) => c.limit === 'strength').map((c) => c.id)).filter((id) => sol.results['combo:' + id]);
  if (!combos.length) return { ok: false, error: 'no-combos' };
  const prep = sol.prep;
  const fc = slab.fc, fy = slab.fy;
  const rhoMin = fy < 420 ? 0.0020 : Math.max(0.0014, 0.0018 * 420 / fy);
  const out = { ok: true, slab, combos: combos.length, plates: model.plates.length, rows: [], checks: [], max: {} };
  const layers = [['bx', 'bottomX', 0], ['by', 'bottomY', 1], ['tx', 'topX', 0], ['ty', 'topY', 1]];
  const worst = Object.fromEntries(layers.map(([k]) => [k, { M: 0, plate: null, set: null }]));
  let shear = { V: 0, plate: null, set: null, dir: '' };
  const tOf = new Map(model.plates.map((p) => [p.id, p.t]));
  for (const id of combos) {
    const R = sol.results['combo:' + id];
    model.plates.forEach((p, k) => {
      const r = plateCentre(prep, R, k);          // [Nx Ny Nxy Mx My Mxy Qx Qy] per mm of width
      const wa = woodArmer(r[3], r[4], r[5]);
      for (const [key] of layers) if (wa[key] > worst[key].M) worst[key] = { M: wa[key], plate: p.id, set: id };
      for (const [dir, V] of [['x', Math.abs(r[6])], ['y', Math.abs(r[7])]]) if (V > shear.V) shear = { V, plate: p.id, set: id, dir };
    });
  }
  const h = slab.h || Math.max(...model.plates.map((p) => p.t));
  out.h = h;
  for (const [key, field, which] of layers) {
    const b = slab[field], top = key[0] === 't';
    // x layer outermost; for the top layers too (cover to the face)
    const d = which === 0 ? h - slab.cover - b.d / 2 : h - slab.cover - slab[layers[which === 0 ? 1 : 0][1]].d - b.d / 2;
    const Mu = worst[key].M * 1000;       // N·mm per m
    const req = Mu > 0 ? requiredAs({ b: 1000, d, fc, fy, Mu, phi: PHI_FLEX }) : 0;
    const min = rhoMin * 1000 * h;
    const prov = area(b.d) * 1000 / b.s;
    const row = { key, layer: field, bar: b.d, s: b.s, d, Mu: Mu / 1e6, req: req === null ? Infinity : req, min, need: req === null ? Infinity : Math.max(req, min), prov, ratio: req === null ? Infinity : Math.max(req, min) / prov, plate: worst[key].plate, set: worst[key].set,
      clause: 'ACI 318-19 22.3 + 7.6.1.1', top };
    out.rows.push(row);
    out.max[key] = row;
  }
  // shear: per metre, at the plate centre of the worst plate (no stirrups in a slab): φVc
  const dAvg = out.rows.reduce((a, r) => a + r.d, 0) / out.rows.length;
  const AsAvg = out.rows.reduce((a, r) => a + r.prov, 0) / out.rows.length;
  const bs = beamShear({ bw: 1000, d: dAvg, h, fc, fyt: 420, Av: 0, s: 0, Vu: shear.V * 1000, As: AsAvg * 1, lambda: slab.lambda });
  out.checks.push({ id: 'slab-shear', clause: 'ACI 318-19 22.5.5.1', demand: shear.V * 1000, capacity: bs.phiVn, ratio: bs.phiVn > 0 ? shear.V * 1000 / bs.phiVn : Infinity, unit: 'N/m', plate: shear.plate, set: shear.set, dir: shear.dir, d: dAvg });
  out.util = Math.max(...out.rows.map((r) => r.ratio), out.checks[0].ratio);
  out.thin = model.plates.some((p) => tOf.get(p.id) < h - 1e-6 || tOf.get(p.id) > h + 1e-6);
  void PHI_SHEAR;
  return out;
}

/** Failed slab checks as shared problems (rule 29). `t(key, vars)` words them; ids do not depend on the language. */
export function slabProblems(res, { t = (k) => k, name = 'slab' } = {}) {
  if (!res?.ok) return [];
  const out = [], fmt = (v) => String(Math.round(v * 10) / 10);
  for (const r of res.rows) if (r.ratio > 1 + 1e-9) {
    out.push({ id: 'concrete.slab:' + r.key, code: 'concrete.slab-flexure', severity: 'error', about: [], source: { kind: 'engine', name: 'detailcraft.frame' }, clause: r.clause,
      msg: { key: 'frame.slab.prob.flexure', vars: { layer: r.layer, need: fmt(r.need), prov: fmt(r.prov), bar: r.bar, s: r.s, plate: r.plate, set: r.set } },
      text: t('frame.slab.prob.flexure', { layer: r.layer, need: fmt(r.need), prov: fmt(r.prov), bar: r.bar, s: r.s, plate: r.plate, set: r.set }),
      req: { op: '<=', value: Math.round(r.prov * 10) / 10, unit: 'mm²/m' }, found: { value: Math.round(r.need * 10) / 10, unit: 'mm²/m' } });
  }
  for (const c of res.checks) if (c.ratio > 1 + 1e-9) {
    out.push({ id: 'concrete.slab:' + c.id, code: 'concrete.slab-shear', severity: 'error', about: [], source: { kind: 'engine', name: 'detailcraft.frame' }, clause: c.clause,
      msg: { key: 'frame.slab.prob.shear', vars: { Vu: fmt(c.demand / 1000), phiVc: fmt(c.capacity / 1000), plate: c.plate, set: c.set } },
      text: t('frame.slab.prob.shear', { Vu: fmt(c.demand / 1000), phiVc: fmt(c.capacity / 1000), plate: c.plate, set: c.set }),
      req: { op: '<=', value: Math.round(c.capacity / 100) / 10, unit: 'kN/m' }, found: { value: Math.round(c.demand / 100) / 10, unit: 'kN/m' } });
  }
  return out;
}
