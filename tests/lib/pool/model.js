/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — what a pool is made from (0.11 POOL.1; brief docs/0.11-POOL-SPEC.md). Host-free: no DOM, no app imports.
 *
 * A pool is a plain object of numbers (millimetres unless the name says otherwise). cleanPool() makes one from whatever a person typed;
 * resolve() fills the figures a set of norms governs (thicknesses, cover, steel, turnover, filter rate, velocities, skimmers) from, in order:
 * the person's own figure, the spec pack in force (a side add-on: POOL.4 Europe, POOL.5 United States), and last a STARTING FIGURE.
 *
 * STARTING FIGURES ARE NOT FROM ANY STANDARD. They are round numbers so that the generator draws something before a spec is added; the
 * panel and every report say where each figure came from (`basis`: yours | spec | start). No norm value is typed into this engine.
 * The equipment and pipe series are generic size steps, marked unverified: they are not any maker's catalogue.
 */

export const KINDS = ['pool', 'fountain'];
export const SETTINGS = ['outdoor', 'indoor'];
export const USES = ['private', 'public'];
export const OVERFLOWS = ['skimmer', 'gutter'];
export const SIDES = ['x+', 'x-', 'y+', 'y-'];

/** The figures a spec governs: param → { start, rule (spec rule id), how: 'min' | 'max' | 'value', unit }. */
export const GOVERNED = {
  wall: { start: 250, rule: 'shell.wall.thickness.min', how: 'min', unit: 'mm' },
  floor: { start: 250, rule: 'shell.floor.thickness.min', how: 'min', unit: 'mm' },
  coverWater: { start: 50, rule: 'shell.cover.min.water', how: 'min', unit: 'mm' },
  coverEarth: { start: 75, rule: 'shell.cover.min.earth', how: 'min', unit: 'mm' },
  concreteMPa: { start: 30, rule: 'shell.concrete.class.min', how: 'min', unit: 'MPa' },
  rebarRatio: { start: 0.003, rule: 'shell.rebar.ratio.min', how: 'min', unit: 'ratio' },
  turnoverH: { start: 6, rule: 'water.turnover.{use}.max', how: 'max', unit: 'h' },
  filterRate: { start: 30, rule: 'water.filter.rate.max', how: 'max', unit: 'm/h' },
  vSuction: { start: 1.5, rule: 'water.velocity.suction.max', how: 'max', unit: 'm/s' },
  vReturn: { start: 2, rule: 'water.velocity.return.max', how: 'max', unit: 'm/s' },
  skimmerArea: { start: 25, rule: 'water.skimmer.area.max', how: 'max', unit: 'm2' },
  barrierHeight: { start: 0, rule: 'safety.barrier.height.min', how: 'min', unit: 'mm' },
  barSpacing: { start: 300, rule: 'shell.rebar.spacing.max', how: 'max', unit: 'mm' },
};

/** Everything else a person can set, with the value a new pool starts from. */
export const DEFAULTS = {
  kind: 'pool', setting: 'outdoor', use: 'private', overflow: 'skimmer', name: 'Pool',
  length: 8000, width: 4000, depthShallow: 1200, depthDeep: 1800,
  freeboard: 150, finish: 20,
  steps: 'side', stepWidth: 1500, riser: 200, tread: 300,
  tileL: 250, tileW: 125, joint: 3, waste: 0.08,
  copingWidth: 300, copingThickness: 40, pavingWidth: 1500, pavingThickness: 50, paverL: 400, paverW: 400,
  gutterWidth: 300, gutterDepth: 300, gutterWall: 150, balancePct: 5,
  pumpHeadMode: 'given', hwC: 140, fittingK: 0.5, equipLoss: 5,
  inletFlow: 5, pumpHead: 12, pumpEff: 0.6, surfaceShare: 0.5,
  jets: 5, jetFlow: 4,
  roomSide: 'x+', roomGap: 1500, roomHeight: 2400, roomWall: 200,
  // 0.11 POOL.8: other shapes, steps and benches on any side, a gate, bars, feet and inches
  shape: 'rect', notchL: 3000, notchW: 2000, corners: '',
  stepsEdge: 0, stepsAt: 0, benches: '', benchSeat: 500, benchDepth: 450,
  gateWidth: 1000, gateSide: 'x-',
  rebarMode: 'ratio', barDia: 12, lapDia: 40,
  units: 'metric',
};
/** Text fields and how long they may be. */
const TEXTS = { name: 80, corners: 6000, benches: 2000 };

/** Generic equipment steps (NOT a maker's catalogue; verified false). Filters by tank diameter (mm), motors by rated kW, pipes by nominal size (mm). */
export const SERIES = {
  verified: false,
  note: 'Generic size steps. Not any maker\'s catalogue: set the sizes from the equipment you will buy.',
  filters: [400, 500, 600, 750, 900, 1050, 1200, 1400, 1600, 1800, 2000, 2350],
  motorsKw: [0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45],
  pipes: [40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400],
};

const LIMITS = {
  length: [1000, 100000], width: [1000, 60000], depthShallow: [100, 6000], depthDeep: [100, 6000], freeboard: [0, 500], finish: [0, 100],
  stepWidth: [600, 60000], riser: [100, 300], tread: [200, 600], tileL: [10, 1500], tileW: [10, 1500], joint: [0, 20], waste: [0, 0.5],
  copingWidth: [100, 1000], copingThickness: [10, 150], pavingWidth: [0, 20000], pavingThickness: [10, 300], paverL: [50, 2000], paverW: [50, 2000],
  gutterWidth: [150, 800], gutterDepth: [150, 800], gutterWall: [100, 400], balancePct: [0, 50],
  hwC: [60, 160], fittingK: [0, 5], equipLoss: [0, 40], inletFlow: [0.5, 50], pumpHead: [2, 60], pumpEff: [0.2, 0.9], surfaceShare: [0, 1], jets: [1, 200], jetFlow: [0.1, 200],
  roomGap: [500, 30000], roomHeight: [1800, 5000], roomWall: [100, 500],
  notchL: [0, 100000], notchW: [0, 60000], stepsEdge: [0, 200], stepsAt: [0, 200000], benchSeat: [200, 1500], benchDepth: [250, 1200],
  gateWidth: [0, 3000], barDia: [6, 40], lapDia: [0, 100], barSpacing: [50, 600],
  wall: [100, 1000], floor: [100, 1000], coverWater: [15, 150], coverEarth: [15, 150], concreteMPa: [15, 80], rebarRatio: [0, 0.03],
  turnoverH: [0.25, 24], filterRate: [1, 80], vSuction: [0.2, 5], vReturn: [0.2, 5], skimmerArea: [2, 200], barrierHeight: [0, 3000],
};
export const UNIT_SYSTEMS = ['metric', 'imperial'];
const ENUMS = { kind: KINDS, setting: SETTINGS, use: USES, overflow: OVERFLOWS, roomSide: SIDES, steps: ['none', 'side', 'full'], pumpHeadMode: ['given', 'calculated'],
  shape: ['rect', 'L', 'round', 'free'], gateSide: SIDES, rebarMode: ['ratio', 'bars'], units: UNIT_SYSTEMS };

/**
 * A pool from loose input. → { pool, problems: [{ field, why }] }. A figure out of range is refused (the default stands) and named in problems;
 * a governed figure left empty stays null (resolve() fills it). Never throws.
 */
export function cleanPool(raw = {}) {
  const pool = {}, problems = [];
  const src = raw && typeof raw === 'object' ? raw : {};
  for (const [k, d] of Object.entries(DEFAULTS)) {
    const v = src[k];
    if (v === undefined || v === null || v === '') { pool[k] = d; continue; }
    if (ENUMS[k]) { if (ENUMS[k].includes(v)) pool[k] = v; else { pool[k] = d; problems.push({ field: k, why: 'choice' }); } continue; }
    if (typeof d === 'string') { pool[k] = String(v).slice(0, TEXTS[k] || 80); continue; }
    const n = Number(v), [lo, hi] = LIMITS[k] || [-Infinity, Infinity];
    if (!Number.isFinite(n) || n < lo || n > hi) { pool[k] = d; problems.push({ field: k, why: 'range', lo, hi }); } else pool[k] = n;
  }
  for (const k of Object.keys(GOVERNED)) {
    const v = src[k];
    if (v === undefined || v === null || v === '') { pool[k] = null; continue; }
    const n = Number(v), [lo, hi] = LIMITS[k];
    if (!Number.isFinite(n) || n < lo || n > hi) { pool[k] = null; problems.push({ field: k, why: 'range', lo, hi }); } else pool[k] = n;
  }
  pool.jets = Math.round(pool.jets); pool.stepsEdge = Math.round(pool.stepsEdge);
  // a freeform outline: corners as text "x,y; x,y" in millimetres, or an array of [x, y]
  if (Array.isArray(src.corners)) pool.corners = src.corners.slice(0, 200).map((q) => (Array.isArray(q) ? q.slice(0, 2).map(Number).join(',') : '')).join('; ');
  if (pool.kind === 'fountain') { pool.depthDeep = pool.depthShallow; pool.steps = 'none'; pool.overflow = 'skimmer'; }
  if (pool.depthDeep < pool.depthShallow) { pool.depthDeep = pool.depthShallow; problems.push({ field: 'depthDeep', why: 'deeper' }); }
  if (pool.overflow === 'gutter') pool.freeboard = 0;
  if (pool.steps === 'full') pool.stepWidth = pool.width;
  pool.stepWidth = Math.min(pool.stepWidth, pool.width);
  return { pool, problems };
}

/** The spec rule id a governed figure reads for this pool (the turnover rule depends on the use). */
export const ruleOf = (param, pool) => GOVERNED[param].rule.replace('{use}', pool.use === 'public' ? 'public' : 'private');

/**
 * The record a spec holds for a rule and a use, or null: first the rule written for that use ('water.skimmer.area.max' →
 * 'water.skimmer.area.public.max'), then the general one unless the pack says it applies to the other use only. Only records with a usable number.
 */
export function lookup(spec, rule, use) {
  if (!spec) return null;
  const u = use === 'public' ? 'public' : 'private', at = rule.lastIndexOf('.');
  const names = rule.includes('.' + u + '.') ? [rule] : [rule.slice(0, at) + '.' + u + rule.slice(at), rule];
  for (const n of names) { const r = spec.values[n]; if (r && Number.isFinite(r.number) && (!r.applies || r.applies === u)) return r; }
  return null;
}

/**
 * Fill the governed figures. spec = a cleaned spec pack (spec.js cleanSpec) or null. → { design (a pool with every figure set), basis: { param:
 * { from: 'yours' | 'spec' | 'start', value, rule, limit (the spec's number or null), source (the spec value's record or null) } } }.
 * 'min' rules: the larger of the starting figure and the spec's minimum. 'max' rules: the smaller. A person's own figure always stands
 * (check() in spec.js then says when it breaks the spec).
 */
export function resolve(pool, spec = null) {
  const design = { ...pool }, basis = {};
  for (const [k, g] of Object.entries(GOVERNED)) {
    const rule = ruleOf(k, pool);
    const rec = lookup(spec, rule, pool.use);
    const limit = rec ? rec.number : null;
    if (pool[k] !== null && pool[k] !== undefined) { basis[k] = { from: 'yours', value: pool[k], rule, limit, source: rec }; continue; }
    let v = g.start, from = 'start';
    if (rec) {
      if (g.how === 'min' && limit > v) { v = limit; from = 'spec'; }
      else if (g.how === 'max' && limit < v) { v = limit; from = 'spec'; }
      else if (g.how === 'min' || g.how === 'max') from = 'start';
    }
    if (k === 'barrierHeight' && (pool.setting !== 'outdoor' || pool.kind !== 'pool')) { v = 0; from = 'start'; }
    design[k] = v; basis[k] = { from, value: v, rule, limit, source: rec };
  }
  return { design, basis };
}
