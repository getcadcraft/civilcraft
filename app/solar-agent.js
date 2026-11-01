/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page (AGENTS-SPEC §5) */
/**
 * solar-agent.js — assistant tools for ground PV arrays on terrain (0.8 EG.15, round 3 session civil_PART_3), in the shape eg-agent.js uses
 * (host.control.tool(def)); civilcraft.js registers them and tools/cli/headless/civil.mjs can load them. Lengths in the project's unit unless a name says metres.
 * Every result is a calculation aid.
 *
 *   solar_list    read  the saved arrays with their numbers
 *   solar_plan    read  lay tables out on the ground inside a parcel, pad or corners (a saved array by id, or the fields given): count, kWp, row pitch, what was left empty
 *   solar_yield   read  the year's energy of an array (clear-sky upper bound; tables shade one another, hills on the horizon take beam)
 *   solar_save    edit  save or replace an array — one undo step
 */
import { cleanSolarArray } from './solar-state.js';
import { planArray, summaryOf, groundOf } from './solar-run.js';
import { yieldGround } from './solar.js';
import { DEFAULTS } from './solar.js';

class ToolErr extends Error {
  constructor(code, message, next = [], retry = 'never') { super(message); this.name = 'ToolError'; this.code = code; this.next = next; this.retry = retry; }
}
const r2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null);
const AID = 'A calculation aid for early design, not a stamped design or a yield report: an engineer checks every result.';
const PT = { type: 'object', properties: { x: { type: 'number', minimum: -1e9, maximum: 1e9 }, y: { type: 'number', minimum: -1e9, maximum: 1e9 } }, required: ['x', 'y'], additionalProperties: false };
const WORDS = {
  'solar.err.module': 'The module numbers are not usable (power, size, voltage and current must be positive).', 'solar.err.noground': 'There is no ground surface yet: build the existing ground from points first.',
  'solar.err.region': 'The region has fewer than three corners, or the parcel or pad id is unknown.', 'solar.err.nosite': 'Give latitude and longitude so the sun can be placed.',
  'pv.err.polar': 'The sun does not rise at the winter solstice there: the no-shade row rule has no answer.', 'solar.err.noarray': 'No tables to work from.',
  'solar.note.starter': 'The module numbers are generic starter values, not a maker datasheet.', 'solar.note.steep': 'Places were left empty: the ground is steeper than the slope limit.',
  'solar.note.pile': 'Places were left empty: the piles would be taller than the limit.', 'solar.note.cap': 'Stopped at the table cap.',
};
const say = (n) => (WORDS[n.key || n] || String(n.key || n)) + (n.vars ? ' (' + Object.entries(n.vars).map(([k, v]) => k + ' ' + v).join(', ') + ')' : '');
const FIELDS = {
  region: { type: 'object', description: 'Where: { kind: "parcel" | "pad", ref: its id } or { kind: "poly", pts: [{x, y}, …] } in the project units.', properties: { kind: { enum: ['parcel', 'pad', 'poly'] }, ref: { type: 'string', maxLength: 40 }, pts: { type: 'array', minItems: 3, maxItems: 2000, items: PT } }, required: ['kind'], additionalProperties: false },
  latitude: { type: 'number', minimum: -90, maximum: 90, description: 'Degrees north of the array. Needed: the sun depends on it.' }, longitude: { type: 'number', minimum: -180, maximum: 180, description: 'Degrees east.' },
  options: { type: 'object', description: 'tilt ° (25), azimuth ° (blank = toward the equator), perRow and stack (modules across and up a table), orient portrait|landscape, gap m, colGap m (0.5), clearance m (0.6), setback m (3), maxSlope ° (15), maxPile m (2), hours (sun hours from noon for the row rule, 0).', additionalProperties: true },
  module: { type: 'object', description: 'A module row: wp, voc, vmp, isc, imp, lengthMm, widthMm (and the temperature coefficients). Leave out for the generic starter module.', additionalProperties: true },
  keep: { type: 'array', description: 'Ids of pads or parcels to leave empty.', maxItems: 200, items: { type: 'string', maxLength: 40 } },
  ground: { enum: ['auto', 'eg', 'fg'], description: 'Which ground: graded when there is one (auto), existing (eg) or graded (fg).' },
};
const SHAPE = { type: 'object', properties: { id: { type: 'string', maxLength: 40, description: 'A saved array to work on (solar_list shows them); then the other fields only change what you give.' }, name: { type: 'string', maxLength: 80, description: 'The array\'s name.' }, region: FIELDS.region, latitude: FIELDS.latitude, longitude: FIELDS.longitude, options: FIELDS.options, module: FIELDS.module, keep: FIELDS.keep, ground: FIELDS.ground }, additionalProperties: false };

export function solarTools(app) {
  const P = () => app.project();
  const changed = () => app.changed?.();
  const merge = (a) => {
    const saved = a.id ? (P().state.solar?.arrays || []).find((x) => x.id === a.id) : null;
    if (a.id && !saved) throw new ToolErr('not_found', 'There is no solar array ' + a.id + '.', ['Call solar_list to see the saved arrays.']);
    const base = saved ? JSON.parse(JSON.stringify(saved)) : { id: null, name: 'Solar array', region: null, keep: [], ground: 'auto', site: null, module: null, options: {} };
    if (a.name) base.name = a.name;
    if (a.region) base.region = a.region;
    if (Number.isFinite(a.latitude) || Number.isFinite(a.longitude)) base.site = { ...(base.site || {}), ...(Number.isFinite(a.latitude) ? { lat: a.latitude } : {}), ...(Number.isFinite(a.longitude) ? { lon: a.longitude } : {}) };
    if (a.options) base.options = { ...base.options, ...a.options };
    if (a.module) base.module = a.module;
    if (a.keep) base.keep = a.keep;
    if (a.ground) base.ground = a.ground;
    return base;
  };
  const build = (a) => {
    const raw = merge(a);
    if (!raw.region) throw new ToolErr('invalid_argument', 'No region: say a parcel, a pad or the corners.', ['Pass region: { kind: "poly", pts: [...] }, or a parcel or pad id from site_describe.']);
    const c = cleanSolarArray({ ...raw, id: raw.id || 'sa0' }, (v, p) => p + '0');
    if (!c) throw new ToolErr('invalid_argument', 'That region is not usable.', ['A polygon needs at least three corners with numeric x and y.']);
    return c;
  };
  const summary = (plan) => plan.ok ? { tables: plan.count, modules: plan.modules, kWp: plan.kwp, rowPitch: { min: r2(plan.pitch.min / (P().state.units === 'm' ? 1 : 0.3048)), mean: r2(plan.pitch.mean / (P().state.units === 'm' ? 1 : 0.3048)), max: r2(plan.pitch.max / (P().state.units === 'm' ? 1 : 0.3048)), flat: r2(plan.flatPitch / (P().state.units === 'm' ? 1 : 0.3048)) }, tallestPile: plan.tables.length ? r2(Math.max(...plan.tables.map((t) => t.pileMax))) : null, leftEmpty: plan.skipped, notes: plan.notes.map(say) }
    : { error: say(plan.error) };
  return [
    { name: 'solar_list', group: 'read', title: 'List solar arrays',
      description: 'The ground solar arrays saved in the project: name, where, place, module power, layout options and the last numbers. ' + AID,
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      outputSchema: { type: 'object', properties: { arrays: { type: 'array', items: { type: 'object' } } } },
      run: () => ({ note: AID, arrays: (P().state.solar?.arrays || []).map((a) => ({ id: a.id, name: a.name, region: a.region.kind === 'poly' ? { kind: 'poly', corners: a.region.pts.length } : a.region, ground: a.ground, site: a.site, modulePowerWp: a.module.wp, options: a.options, summary: a.summary || null })) }) },
    { name: 'solar_plan', group: 'read', title: 'Lay out solar tables on the ground',
      description: 'Lays ground-mounted PV tables on the terrain inside a parcel, pad or corners, with the row spacing worked out on the ground each row really stands on (the winter-solstice no-shade rule), steep or kept-out ground left empty and the table base raised so the lowest sample is clear of the ground. Changes nothing. Latitude and longitude are required. ' + AID,
      inputSchema: SHAPE,
      outputSchema: { type: 'object', properties: { tables: { type: 'number' }, modules: { type: 'number' }, kWp: { type: 'number' }, rowPitch: { type: 'object' }, tallestPile: { type: 'number' }, leftEmpty: { type: 'object' }, notes: { type: 'array', items: { type: 'string' } } } },
      run: (a) => ({ note: AID, defaults: { tilt: DEFAULTS.tilt, setback: DEFAULTS.setback, maxSlope: DEFAULTS.maxSlope }, ...summary(planArray(P(), build(a))) }) },
    { name: 'solar_yield', group: 'read', title: 'Energy of a solar array in a year',
      description: 'The year\'s AC energy of a ground array: plane-of-array light on a clear sky (an upper bound), cell temperature, the tables shading one another and hills on the horizon taking beam, the typed losses. Same inputs as solar_plan. Changes nothing. ' + AID,
      inputSchema: SHAPE,
      outputSchema: { type: 'object', properties: { acKwh: { type: 'number' }, specificKwhPerKwp: { type: 'number' }, performanceRatio: { type: 'number' }, shadeLossPercent: { type: 'number' }, highestHorizonDegrees: { type: 'number' } } },
      run: (a) => {
        const c = build(a), plan = planArray(P(), c);
        if (!plan.ok) throw new ToolErr('invalid_argument', say(plan.error), ['Give latitude and longitude, a region and a ground surface.']);
        if (!plan.count) throw new ToolErr('invalid_argument', 'No tables fit there, so there is no energy to work out.', ['Widen the region, reduce the setback or raise maxSlope.']);
        const y = yieldGround(plan, { ground: groundOf(P(), c) });
        if (!y.ok) throw new ToolErr('invalid_argument', say(y.error));
        const t = y.res.total;
        return { note: AID + ' The sky is a clear-sky model.', ...summary(plan), acKwh: Math.round(t.acKwh), specificKwhPerKwp: Math.round(t.specificKwhKwp), performanceRatio: r2(t.pr), shadeLossPercent: r2(t.shadeLossPct ?? 0), highestHorizonDegrees: y.shade.horizon?.el?.length ? r2(Math.max(...y.shade.horizon.el)) : null, notes: [...plan.notes.map(say), ...y.notes.map((n) => String(n.key || n))] };
      } },
    { name: 'solar_save', group: 'edit', rollbackPreview: true, title: 'Save a solar array',
      description: 'Save a ground solar array in the project (a new one, or change the one with `id`). Only the inputs are kept; the tables are worked out again from the ground. Shows on the plan and in 3D. One undo step.',
      inputSchema: SHAPE,
      outputSchema: { type: 'object', properties: { array: { type: 'string' }, tables: { type: 'number' }, kWp: { type: 'number' } } },
      run: (a) => {
        const c = build(a), p = P(), plan = planArray(p, c);
        if (!plan.ok) throw new ToolErr('invalid_argument', say(plan.error), ['Give latitude and longitude, a region and a ground surface.']);
        const id = c.id !== 'sa0' && (p.state.solar?.arrays || []).some((x) => x.id === c.id) ? c.id : p.nextId('sa');
        const rec = { ...c, id, summary: summaryOf(plan) };
        p.change('Assistant: save a solar array', (st) => { st.solar ||= { arrays: [] }; const i = st.solar.arrays.findIndex((x) => x.id === id); if (i >= 0) st.solar.arrays[i] = rec; else st.solar.arrays.push(rec); });
        changed();
        return { array: id, name: rec.name, tables: plan.count, kWp: plan.kwp };
      } },
  ];
}
