/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools.js — the assistant tools for the process model (0.8 Track CH: CH.29 describe it / get a plant, CH.31 optimise overnight, CH.4 line changes,
 * CH.28 control export), written to the AC.15 contract (docs/AI-CONNECT-SPEC.md § 2; tools/mcp/contract.mjs checkTool). DOM-free; a host registers the
 * list with `host.control.tool(def)` for each def of `processTools(env)`.
 *
 * Suggest mode (AC.12) needs nothing from this file: `plant_add`, `line_set` are edit tools with a native preview; the dispatcher records an edit as a
 * change set the person accepts or rejects. Each tool does what the menu does (rule 34): the same build(), applyChange(), exportAll() and optimise().
 *
 * env = { model(): the living model | null, setModel(m), ctx(): { pid, plant } | {}, studyLib, jobs (createJobs), controlsInput(): neutral P&ID for controls.js | null,
 *         applyBuild(built): draws the P&ID items and the 3D plant (one undo step) → { pidItems, equipment, runs },
 *         applyEdits(edits): carries a size change to the drawings, writeFile(name, text) → { path, bytes } }
 */
import { build, STEP_TYPES } from './synth.js';
import { applyChange, run as runModel, cleanModel, streamTable } from './model.js';
import { exportAll, toCsvAll, check as controlsCheck } from './controls.js';
import { optimise, makeStudy } from './optimise.js';

const str = (description, max = 80, extra = {}) => ({ type: 'string', description, maxLength: max, ...extra });
const num = (description, extra = {}) => ({ type: 'number', description, ...extra });
const obj = (properties, required = [], description) => ({ type: 'object', ...(description ? { description } : {}), properties, required, additionalProperties: false });
const flowMap = (what) => ({ type: 'object', description: what, additionalProperties: { type: 'number', minimum: 0, maximum: 1e9 } });
const PAGE = { limit: { type: 'integer', description: 'How many rows to return (1 to 200).', minimum: 1, maximum: 200, default: 50 }, offset: { type: 'integer', description: 'How many rows to skip.', minimum: 0, maximum: 100000, default: 0 } };

const PLANT_SPEC = obj({
  name: str('A short name for the plant.', 60),
  components: { type: 'array', description: 'Component ids from the package (for example methanol, water, hydrogen, co, co2).', items: str('A component id.', 40), minItems: 1, maxItems: 20 },
  model: { type: 'string', description: 'Property model.', enum: ['pr', 'srk', 'ideal'], default: 'pr' },
  feed: obj({ flows: flowMap('Mole flows by component in mol/s.'), massFlows: flowMap('Mass flows by component in kg/s (use flows or massFlows).'), T: num('Feed temperature in kelvin.', { minimum: 100, maximum: 2000 }), P: num('Feed pressure in pascal (absolute).', { minimum: 1000, maximum: 1e9 }) }, ['T', 'P'], 'The feed stream.'),
  steps: { type: 'array', description: 'The units in order, each taking the stream before it.', minItems: 1, maxItems: 40, items: obj({
    type: { type: 'string', description: 'Unit kind.', enum: STEP_TYPES },
    id: str('Optional tag such as P-101.', 24),
    p: { type: 'object', description: 'Unit parameters (mixer: none; splitter: fractions [continues, other]; pump: Pout in Pa; heater/cooler: Tout in K; compressor: Pout; valve: Pout; flash: P in Pa and T in K; reactor: reactions [{nu, key, X}]; column: lightKey, heavyKey, recLK, recHK, P).', additionalProperties: true },
    use: { type: 'integer', description: 'Which outlet to continue with: 0 or 1 (flash: 0 vapour, 1 liquid).', minimum: 0, maximum: 1 },
    with: { type: 'array', description: 'Mixer only: more streams to take in besides the one before it. A stream id, or @name for a recycle a splitter makes further on.', maxItems: 4, items: { type: 'string', maxLength: 24 } },
    recycleAs: str('Splitter only: names its second outlet, so a mixer can take it back with @name. The loop is solved by iteration.', 24),
  }, ['type']) },
  scale: obj({ stream: str('Stream id to scale to, or last.', 24), comp: str('Component id whose rate is set.', 40), tPerDay: num('Tonnes per day of that component in the stream.', { minimum: 0.001, maximum: 1e7 }) }, ['comp', 'tPerDay'], 'Rescale the feed so a stream carries this rate of a component.'),
}, ['components', 'feed', 'steps'], 'The plant: components, feed and the units in order.');

const counts = (ps) => ({ errors: ps.filter((p) => p.severity === 'error').length, warnings: ps.filter((p) => p.severity === 'warning').length, info: ps.filter((p) => p.severity === 'info').length });
const brief = (p) => ({ code: p.code, severity: p.severity, text: p.text, about: p.about });
/** The dispatcher accepts any error whose name is ToolError (tools/mcp/core.mjs), so this file imports nothing from there. */
function toolError(code, message, next = [], retry = 'never') { const e = new Error(message); e.name = 'ToolError'; e.code = code; e.next = next; e.retry = retry; return e; }
const noModel = () => { throw toolError('not_found', 'There is no process model open. Use plant_add to build one, or open a file that has one.', ['Call plant_add with the components, the feed and the steps.']); };

export function processTools(env) {
  const need = () => env.model() || noModel();
  return [
    {
      name: 'process_describe', group: 'read', untrusted: true, title: 'Describe the process model',
      description: 'The open process model: components and property model, each unit with its tag and streams, how much is linked to the P&ID and the 3D plant, and the counts of errors and warnings. Use plant_add first when there is no model.',
      inputSchema: obj({}),
      outputSchema: obj({ name: str('Model name.'), components: { type: 'array', description: 'Component ids.', items: str('A component id.', 40), maxItems: 20 } }),
      run: () => {
        const m = need(), r = runModel(m, env.ctx ? env.ctx() : {});
        return { name: m.name, components: m.flowsheet.thermo.components.map((c) => (typeof c === 'string' ? c : c.id)), model: m.flowsheet.thermo.model, converged: r.result.converged,
          units: m.flowsheet.units.map((u) => ({ id: u.id, type: u.type, tag: m.links[u.id]?.tag || u.id, in: u.in, out: u.out || [], plant: m.links[u.id]?.plant || null })),
          linkedStreams: Object.values(m.links).filter((l) => l.kind === 'stream' && l.ln).length, problems: counts(r.problems) };
      },
    },
    {
      name: 'streams_list', group: 'read', untrusted: true, title: 'List the streams',
      description: 'The stream table of the solved model, one row per stream: line number, from and to, temperature (C), pressure (bar), vapour fraction, flows, line velocity and drop where a line size is known, and the main mole fractions. Pages by limit and offset.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const m = need(), r = runModel(m, env.ctx ? env.ctx() : {}), t = r.table, off = a.offset || 0, lim = a.limit || 50; return { columns: t.columns, keys: t.keys, rows: t.rows.slice(off, off + lim), total: t.rows.length, returned: Math.min(lim, Math.max(0, t.rows.length - off)) }; },
    },
    {
      name: 'process_check', group: 'read', untrusted: true, title: 'Check the process model',
      description: 'Problems where the flowsheet, the P&ID and the 3D plant disagree (a size, a line that goes somewhere else, equipment missing) and where hydraulics are out of range (velocity, erosion, drop). Returns the shared problem shape; a size change in 3D shows up here.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const m = need(), r = runModel(m, env.ctx ? env.ctx() : {}), off = a.offset || 0, lim = a.limit || 50; return { problems: r.problems.slice(off, off + lim).map(brief), total: r.problems.length, counts: counts(r.problems) }; },
    },
    {
      name: 'plant_add', group: 'edit', title: 'Build a plant from a description',
      description: 'Builds a flowsheet from the described components, feed and units, solves it, sizes the lines, and draws a linked P&ID and 3D layout; one undo step. Returns tags, line numbers, product rates and problems. Use process_check afterwards; sizes are screening values.',
      inputSchema: obj({ spec: PLANT_SPEC }, ['spec']),
      outputSchema: obj({ units: { type: 'array', description: 'Unit tags in order.', items: str('A tag.', 24), maxItems: 40 } }),
      preview: (a) => { const b = build(a.spec); return { units: b.summary.units, lines: Object.values(b.sizes).map((s) => s.ln), products: b.summary.products, problems: counts(b.problems), would: 'draw ' + b.pid.items.length + ' P&ID objects and ' + b.plant.equipment.length + ' pieces of equipment in 3D' }; },
      run: async (a) => {
        const b = build(a.spec);
        const applied = env.applyBuild ? await env.applyBuild(b) : null;
        env.setModel(b.model);
        return { units: b.summary.units, lines: Object.values(b.sizes).map((s) => s.ln), products: b.summary.products, feedKgPerDay: b.summary.feedMassKgPerDay, problems: counts(b.problems), applied, undo: 'Assistant: plant from description',
          notes: ['Line sizes come from a velocity target and an assumed viscosity; a drafting and study aid, not an engineering approval.'] };
      },
    },
    {
      name: 'line_set', group: 'edit', title: 'Change a line',
      description: 'Sets the size (nominal inches such as 6, or millimetres such as 150mm), length or fittings of the line carrying a stream or line number, reruns the hydraulics, and updates the P&ID line data and the stream table. Returns the new velocity and drop and any new problems.',
      inputSchema: obj({ line: str('Line number such as 4"-PL-102-A1A.', 40), stream: str('Stream id such as S2 (use line or stream).', 24), size: str('New size: nominal inches (6) or millimetres (150mm).', 12), length: num('Length of line in metres.', { minimum: 0, maximum: 100000 }) }),
      outputSchema: obj({ line: str('Line number.', 40) }),
      preview: (a) => { const m = cleanModel(JSON.parse(JSON.stringify(need()))); const r = applyChange(m, { ln: a.line, stream: a.stream, size: a.size, L: a.length, by: '3d' }, env.ctx ? env.ctx() : {}); return { would: r.edits, problems: counts(r.problems) }; },
      run: async (a) => {
        const m = need(), r = applyChange(m, { ln: a.line, stream: a.stream, size: a.size, L: a.length, by: '3d' }, env.ctx ? env.ctx() : {});
        if (env.applyEdits) await env.applyEdits(r.edits);
        const h = r.hydraulics.find((x) => x.ln === a.line || x.id === a.stream);
        return { line: h?.ln || a.line || '', size: h?.size, velocity: h?.v, dropBar: h ? h.dp / 1e5 : null, problems: counts(r.problems), undo: 'Assistant: change line' };
      },
    },
    {
      name: 'controls_export', group: 'export', title: 'Export the control lists',
      description: 'Writes the tag list, instrument index, I/O list and loop list made from the P&ID as one CSV file in the granted folder. Returns the path, row counts and the I/O totals by type with 20 percent spare. Needs a P&ID with tagged instruments.',
      inputSchema: obj({ name: str('File name without extension.', 40, { default: 'control-lists' }), spare: num('Spare fraction on the I/O counts (0 to 1).', { minimum: 0, maximum: 1, default: 0.2 }) }),
      previewTarget: (a) => ({ path: (a.name || 'control-lists') + '.csv', format: 'csv' }),
      run: async (a) => {
        const pid = env.controlsInput ? env.controlsInput() : null;
        if (!pid || !((pid.instruments || []).length || (pid.valves || []).length)) throw toolError('unsupported', 'The P&ID has no tagged instruments or valves to export.', ['Draw and tag instruments with the P&ID add-on first.']);
        const lists = exportAll(pid, { spare: a.spare ?? 0.2 }), file = env.writeFile ? await env.writeFile((a.name || 'control-lists') + '.csv', toCsvAll(lists)) : null;
        return { file, lists: lists.map((l) => ({ name: l.name, rows: l.rows.length })), io: lists[2].summary, problems: controlsCheck(pid).map(brief) };
      },
    },
    {
      name: 'optimise_start', group: 'read', title: 'Start an optimisation',
      description: 'Starts a design study over flowsheet variables (a unit parameter between two values) judged by energy, cost or emissions, and returns a job handle that lasts 24 hours. Cost and emissions need prices and factors you give; nothing is assumed. Use optimise_status then optimise_result.',
      inputSchema: obj({
        title: str('Study title.', 60),
        variables: { type: 'array', description: 'What to vary.', minItems: 1, maxItems: 4, items: obj({ unit: str('Unit tag.', 24), param: str('Parameter name, for example Tout or Pout.', 24), from: num('Lowest value (the parameter\'s own unit).'), to: num('Highest value.'), steps: { type: 'integer', description: 'Values to try (2 to 12).', minimum: 2, maximum: 12 } }, ['unit', 'param', 'from', 'to']) },
        objectives: { type: 'array', description: 'What to judge by.', minItems: 1, maxItems: 4, items: obj({ key: str('Name of the result.', 24), metric: str('heat_kW, cool_kW, shaft_kW, energy_kW, operating_per_h or co2_kg_h.', 24, { enum: ['heat_kW', 'cool_kW', 'shaft_kW', 'energy_kW', 'operating_per_h', 'co2_kg_h'] }), goal: { type: 'string', description: 'min or max.', enum: ['min', 'max'] }, limit: num('Optional limit the result must stay within.', { minimum: -1e12, maximum: 1e12 }) }, ['key', 'metric', 'goal']) },
        prices: obj({ heat: num('Heat price in dollars per gigajoule.', { minimum: 0 }), cool: num('Cooling price in dollars per gigajoule.', { minimum: 0 }), power: num('Electricity price in dollars per kWh.', { minimum: 0 }) }, [], 'Prices, needed for operating_per_h.'),
        factors: obj({ heat: num('Kilograms CO2 per gigajoule of heat duty.', { minimum: 0 }), power: num('Kilograms CO2 per kWh.', { minimum: 0 }) }, [], 'Emission factors, needed for co2_kg_h.'),
      }, ['variables', 'objectives']),
      outputSchema: obj({ job: str('Job handle.', 40) }),
      run: (a) => { const m = need(); makeStudy(a); const job = env.jobs.start(m, a); return { job, state: 'running', expires: '24 hours', next: ['Call optimise_status {job}.'] }; },
    },
    {
      name: 'optimise_status', group: 'read', title: 'Optimisation status',
      description: 'The state of an optimisation job: running, done, cancelled or failed, with progress from 0 to 1 and how many variants are done. Returns not_found when the handle is older than 24 hours or unknown.',
      inputSchema: obj({ job: str('Job handle from optimise_start.', 40) }, ['job']),
      run: (a) => { const s = env.jobs.status(a.job); if (!s) throw toolError('not_found', 'No job with that handle.', ['Call optimise_start again.']); return s; },
    },
    {
      name: 'optimise_result', group: 'read', untrusted: true, title: 'Optimisation result',
      description: 'The finished optimisation: the trade-off front (variants nobody beats on every goal), the ranking, the best variant\'s settings and results, and problems. Returns needs_person while the job is still running; call optimise_status first.',
      inputSchema: obj({ job: str('Job handle from optimise_start.', 40) }, ['job']),
      run: (a) => {
        const r = env.jobs.result(a.job);
        if (!r) throw toolError('busy', 'The job is not finished.', ['Call optimise_status {job}.'], 'later');
        const rowOf = (x) => ({ id: x.id, set: x.set, values: x.values });
        return { variants: r.rows.length, failed: r.failed, front: r.front.slice(0, 50).map(rowOf), best: r.ranked[0] ? rowOf(r.rows.find((x) => x.id === r.ranked[0].id)) : null, problems: r.problems.map(brief) };
      },
    },
  ];
}
export { optimise, streamTable };
