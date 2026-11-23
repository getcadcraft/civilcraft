/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — what a concrete shell dome is made from (0.11 DOME.1; brief docs/0.11-DOME-SPEC.md). Host-free: no DOM, no app imports.
 *
 * A dome is a plain object of numbers (millimetres unless the name says otherwise). cleanDome() makes one from whatever a person typed;
 * resolve() fills the figures a set of norms governs (shell thickness, cover, concrete strength, steel ratio) from, in order: the person's own
 * figure, the spec pack in force (a side add-on: DOME.4 United States, DOME.5 Europe), and last a STARTING FIGURE.
 *
 * STARTING FIGURES ARE NOT FROM ANY STANDARD. They are round numbers so that the generator draws something before a spec is added; the
 * panel and every report say where each figure came from (`basis`: yours | spec | start). No norm value is typed into this engine.
 *
 * The dimensions are those of the FORM: the diameter and the height describe the inflated form's own surface (the outside of the foam). The
 * foam and then the concrete are sprayed on its inside, so the clear inside is smaller; the report gives it.
 */

export const SHAPES = ['sphere', 'ellipse'];
export const OPENING_KINDS = ['door', 'window'];
export const MAX_OPENINGS = 12;

/** The figures a spec governs: param → { start, rules (spec rule ids; the largest wins), how: 'min' | 'value', check?: 'min' | 'max' (which way a figure of your own breaks it), unit }. */
export const GOVERNED = {
  shell: { start: 75, rules: ['shell.thickness.min'], how: 'min', unit: 'mm' },
  cover: { start: 25, rules: ['shell.cover.min'], how: 'min', unit: 'mm' },
  coverEarth: { start: 75, rules: ['footing.cover.min.earth'], how: 'min', unit: 'mm' },
  concreteMPa: { start: 30, rules: ['shell.concrete.strength.min', 'shotcrete.strength.min'], how: 'min', unit: 'MPa' },
  rebarRatio: { start: 0.002, rules: ['shell.rebar.ratio.min'], how: 'min', unit: 'ratio' },
  // load factors: with no spec they are 1 (the forces are then unfactored, and say so); a spec's factor is taken as it is
  gammaDeadAlone: { start: 1, rules: ['load.factor.dead.alone'], how: 'value', check: 'min', unit: 'factor' },
  gammaDead: { start: 1, rules: ['load.factor.dead'], how: 'value', check: 'min', unit: 'factor' },
  gammaDeadMin: { start: 1, rules: ['load.factor.dead.min'], how: 'value', check: 'max', unit: 'factor' },
  gammaSnow: { start: 1, rules: ['load.factor.snow'], how: 'value', check: 'min', unit: 'factor' },
  gammaWind: { start: 1, rules: ['load.factor.wind'], how: 'value', check: 'min', unit: 'factor' },
  gammaSeismic: { start: 1, rules: ['load.factor.seismic'], how: 'value', check: 'min', unit: 'factor' },
};
export const FACTORS = ['gammaDeadAlone', 'gammaDead', 'gammaDeadMin', 'gammaSnow', 'gammaWind', 'gammaSeismic'];
export const BASES = ['fixed', 'pinned', 'ring'];
export const UNITS = ['metric', 'imperial'];

/** Everything else a person can set, with the value a new dome starts from. */
export const DEFAULTS = {
  name: 'Dome', shape: 'sphere',
  diameter: 10000, height: 5000, stem: 0,
  thicken: 50, foam: 75, membrane: 1,
  footingWidth: 600, footingDepth: 400, slab: 100,
  density: 2400, finishLoad: 0, snow: 0, steelStress: 0,
  wind: 0, seismic: 0, modulus: 30000, poisson: 0.2, baseFix: 'fixed', knockdown: 0,
  waste: 0.1, headroom: 2000, units: 'metric',
  frameWidth: 0, frameExtra: 0, barDia: 0, barSpacing: 0,
};
export const DEFAULT_OPENINGS = [{ kind: 'door', az: 0, width: 1000, height: 2100, sill: 0 }];

const LIMITS = {
  diameter: [2000, 100000], height: [500, 100000], stem: [0, 20000], thicken: [0, 500], foam: [0, 400], membrane: [0, 10],
  footingWidth: [200, 3000], footingDepth: [150, 3000], slab: [0, 600],
  density: [1200, 2800], finishLoad: [0, 10], snow: [0, 20], steelStress: [0, 600], waste: [0, 0.6], headroom: [1000, 5000],
  wind: [0, 10], seismic: [0, 2], modulus: [5000, 60000], poisson: [0, 0.35], knockdown: [0, 1],
  frameWidth: [0, 1500], frameExtra: [0, 500], barDia: [0, 40], barSpacing: [0, 600],
  shell: [40, 600], cover: [10, 100], coverEarth: [15, 150], concreteMPa: [15, 80], rebarRatio: [0, 0.03],
  gammaDeadAlone: [0.5, 3], gammaDead: [0.5, 3], gammaDeadMin: [0.5, 1.5], gammaSnow: [0, 3], gammaWind: [0, 3], gammaSeismic: [0, 3],
};
const ENUMS = { shape: SHAPES, baseFix: BASES, units: UNITS };
const OPEN_LIMITS = { az: [0, 360], width: [300, 12000], height: [300, 12000], sill: [0, 20000] };

/**
 * A dome from loose input. → { dome, problems: [{ field, why, … }] }. A figure out of range is refused (the default stands) and named in problems;
 * a governed figure left empty stays null (resolve() fills it). Never throws.
 */
export function cleanDome(raw = {}) {
  const dome = {}, problems = [];
  const src = raw && typeof raw === 'object' ? raw : {};
  for (const [k, d] of Object.entries(DEFAULTS)) {
    const v = src[k];
    if (v === undefined || v === null || v === '') { dome[k] = d; continue; }
    if (ENUMS[k]) { if (ENUMS[k].includes(v)) dome[k] = v; else { dome[k] = d; problems.push({ field: k, why: 'choice' }); } continue; }
    if (typeof d === 'string') { dome[k] = String(v).slice(0, 80); continue; }
    const n = Number(v), [lo, hi] = LIMITS[k];
    if (!Number.isFinite(n) || n < lo || n > hi) { dome[k] = d; problems.push({ field: k, why: 'range', lo, hi }); } else dome[k] = n;
  }
  for (const k of Object.keys(GOVERNED)) {
    const v = src[k];
    if (v === undefined || v === null || v === '') { dome[k] = null; continue; }
    const n = Number(v), [lo, hi] = LIMITS[k];
    if (!Number.isFinite(n) || n < lo || n > hi) { dome[k] = null; problems.push({ field: k, why: 'range', lo, hi }); } else dome[k] = n;
  }
  // a spherical segment is at most a hemisphere; an ellipse may be flatter (oblate) or taller (prolate) than one, up to twice the diameter
  const a = dome.diameter / 2;
  if (dome.shape === 'sphere' && dome.height > a) { dome.height = a; problems.push({ field: 'height', why: 'sphere', hi: a }); }
  if (dome.shape === 'ellipse' && dome.height > 2 * dome.diameter) { dome.height = 2 * dome.diameter; problems.push({ field: 'height', why: 'tall', hi: 2 * dome.diameter }); }
  if (dome.height < dome.diameter / 20) { dome.height = dome.diameter / 20; problems.push({ field: 'height', why: 'flat', lo: dome.diameter / 20 }); }
  // openings: a list of { kind, az (degrees round the dome, 0 = +x), width, height, sill }
  const list = Array.isArray(src.openings) ? src.openings : src.openings === undefined || src.openings === null ? DEFAULT_OPENINGS : [];
  dome.openings = [];
  list.slice(0, MAX_OPENINGS).forEach((o, i) => {
    if (!o || typeof o !== 'object') { problems.push({ field: 'openings', why: 'opening', n: i + 1 }); return; }
    const kind = OPENING_KINDS.includes(o.kind) ? o.kind : 'door', out = { kind };
    for (const [k, [lo, hi]] of Object.entries(OPEN_LIMITS)) {
      const n = Number(o[k] ?? (k === 'az' || k === 'sill' ? 0 : NaN));
      if (!Number.isFinite(n) || n < lo || n > hi) { problems.push({ field: 'openings', why: 'opening', n: i + 1, part: k, lo, hi }); return; }
      out[k] = n;
    }
    if (kind === 'door') out.sill = 0;
    out.az = out.az % 360;
    dome.openings.push(out);
  });
  if (Array.isArray(src.openings) && src.openings.length > MAX_OPENINGS) problems.push({ field: 'openings', why: 'many', hi: MAX_OPENINGS });
  return { dome, problems };
}

/** The usable record a spec holds for one of a figure's rules: the one with the largest number (every rule here is a minimum). */
export function lookup(spec, rules) {
  if (!spec) return null;
  let best = null;
  for (const rule of rules) { const r = spec.values[rule]; if (r && Number.isFinite(r.number) && (!best || r.number > best.number)) best = r; }
  return best;
}

/**
 * Fill the governed figures. spec = a cleaned spec pack (spec.js cleanSpec) or null. → { design (a dome with every figure set), basis: { param:
 * { from: 'yours' | 'spec' | 'start', value, rule, limit (the spec's number or null), source (the spec value's record or null) } } }.
 * The larger of the starting figure and the spec's minimum is used; a load factor ('value') is taken from the spec as it is. A person's own figure always stands (check() in spec.js then says when it
 * breaks the spec).
 */
export function resolve(dome, spec = null) {
  const design = { ...dome, openings: dome.openings.map((o) => ({ ...o })) }, basis = {};
  for (const [k, g] of Object.entries(GOVERNED)) {
    const rec = lookup(spec, g.rules);
    const limit = rec ? rec.number : null, rule = rec ? rec.rule : g.rules[0];
    if (dome[k] !== null && dome[k] !== undefined) { basis[k] = { from: 'yours', value: dome[k], rule, limit, source: rec }; continue; }
    let v = g.start, from = 'start';
    if (rec && (g.how === 'value' || limit > v)) { v = limit; from = 'spec'; }
    design[k] = v; basis[k] = { from, value: v, rule, limit, source: rec };
  }
  return { design, basis };
}
