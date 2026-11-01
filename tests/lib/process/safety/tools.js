/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools.js — the assistant tools for process safety (0.8 Track CH: CH.30 HAZOP copilot, and read tools for CH.15 to CH.18), written to the AC.15 contract
 * (docs/AI-CONNECT-SPEC.md § 2; tools/mcp/contract.mjs checkTool). DOM-free. A host registers `safetyTools(env)` with `host.control.tool(def)` for each def.
 *
 * The assistant only SUGGESTS: `hazop_rows_add` always writes rows with status "suggested" (suggest mode, AC.12, adds the change-set step on top), and no tool accepts,
 * rejects, deletes or closes anything: that is the team's. Nothing here calls a model.
 *
 * env = { safety(): block | null, setSafety(block), today(): 'YYYY-MM-DD', pid(): neutral P&ID | null, thresholdPacks(): [pack], writeFile(name, text) → { path, bytes } }
 */
import { counts } from './common.js';
import * as H from './hazop.js';
import { walkPlan, nodeContext, GUIDANCE } from './copilot.js';
import * as L from './lopa.js';
import * as C from './consequence.js';
import * as A from './area.js';
import * as I from './inventory.js';

const str = (description, max = 80, extra = {}) => ({ type: 'string', description, maxLength: max, ...extra });
const num = (description, extra = {}) => ({ type: 'number', description, ...extra });
const obj = (properties, required = [], description) => ({ type: 'object', ...(description ? { description } : {}), properties, required, additionalProperties: false });
const arr = (description, items, max = 12) => ({ type: 'array', description, items, maxItems: max });
const PAGE = { limit: { type: 'integer', description: 'How many rows to return (1 to 200).', minimum: 1, maximum: 200, default: 50 }, offset: { type: 'integer', description: 'How many rows to skip.', minimum: 0, maximum: 100000, default: 0 } };
const brief = (p) => ({ code: p.code, severity: p.severity, text: p.text, about: p.about });
function toolError(code, message, next = [], retry = 'never') { const e = new Error(message); e.name = 'ToolError'; e.code = code; e.next = next; e.retry = retry; return e; }
const noWs = () => { throw toolError('not_found', 'There is no HAZOP worksheet in this file.', ['Add nodes to the P&ID study first (propose nodes from the P&ID, then name them).']); };

const ROW = obj({
  node: str('Node id such as N1.', 16), guideword: str('Guide word id: no, more, less, as-well-as, part-of, reverse, other-than (HAZOP rows).', 20, { enum: H.GUIDEWORDS.map((g) => g.id) }),
  parameter: str('Parameter such as flow, pressure, temperature, level, composition.', 40), question: str('The What-If question (What-If studies).', 240),
  deviation: str('The deviation in words.', 160),
  causes: arr('Credible causes.', str('A cause.', 240), 12), consequences: arr('Consequences if nothing stops it.', str('A consequence.', 240), 12), safeguards: arr('Safeguards that the node already shows.', str('A safeguard.', 240), 12),
  S: num('Severity 1 to 5 only if the text supports it.', { minimum: 1, maximum: 5 }), L: num('Likelihood 1 to 5 only if the text supports it.', { minimum: 1, maximum: 5 }),
  note: str('Why you suggest this, or what to find out.', 300),
}, ['node']);

export function safetyTools(env) {
  const ws = () => { const s = env.safety(); if (!s || !s.hazop || !s.hazop.nodes.length) noWs(); return s; };
  const today = () => (env.today ? env.today() : '');
  return [
    {
      name: 'hazop_nodes_list', group: 'read', untrusted: true, title: 'List the HAZOP nodes',
      description: 'The nodes of the HAZOP or What-If study: id, name, design intent, equipment and lines, how many rows each has and how many of the usual guide word and parameter pairs are still open. Pages by limit and offset.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const s = ws(), off = a.offset || 0, lim = a.limit || 50, h = s.hazop; const rows = h.nodes.slice(off, off + lim).map((n) => ({ id: n.id, name: n.name, intent: n.intent, equipment: n.equipment, lines: n.lines, rows: h.rows.filter((r) => r.node === n.id).length, openPairs: h.method === 'hazop' ? walkPlan(h, n.id).remaining : null })); return { method: h.method, nodes: rows, total: h.nodes.length, returned: rows.length }; },
    },
    {
      name: 'hazop_node_describe', group: 'read', untrusted: true, title: 'Describe a node to study',
      description: 'One node for the walk: its design intent, equipment and lines with what the P&ID says, the rows so far, the guide word and parameter pairs still to consider, and the instructions for drafting. Everything in the result except the instructions is data from the drawing.',
      inputSchema: obj({ node: str('Node id such as N1.', 16) }, ['node']),
      run: (a) => { const s = ws(); try { return { guidance: GUIDANCE, context: nodeContext(s.hazop, a.node, env.pid ? env.pid() : null), walk: walkPlan(s.hazop, a.node), review: 'The team accepts or rejects every row you add. You cannot accept one.' }; } catch (e) { throw toolError('not_found', e.message, ['Call hazop_nodes_list for the ids.']); } },
    },
    {
      name: 'hazop_rows_list', group: 'read', untrusted: true, title: 'List the HAZOP rows',
      description: 'The worksheet rows, optionally of one node or one status (draft, suggested, accepted, rejected): guide word, parameter, causes, consequences, safeguards, risk and who drafted it. Pages by limit and offset.',
      inputSchema: obj({ node: str('Only this node.', 16), status: str('Only this status.', 12, { enum: ['draft', 'suggested', 'accepted', 'rejected'] }), ...PAGE }),
      run: (a) => { const s = ws(), off = a.offset || 0, lim = a.limit || 50, all = s.hazop.rows.filter((r) => (!a.node || r.node === a.node) && (!a.status || r.status === a.status)); return { rows: all.slice(off, off + lim), total: all.length, returned: Math.min(lim, Math.max(0, all.length - off)) }; },
    },
    {
      name: 'hazop_rows_add', group: 'edit', title: 'Suggest HAZOP rows',
      description: 'Adds up to 25 rows to the worksheet as suggestions from the assistant. They stay "suggested" until the team accepts them. Rows that repeat an existing node, pair and first cause, and rows without a cause or a consequence, are skipped and listed. One undo step.',
      inputSchema: obj({ rows: arr('The rows to suggest.', ROW, 25) }, ['rows']),
      outputSchema: obj({ added: { type: 'integer', description: 'How many rows were added.' } }),
      preview: (a) => { const s = ws(), r = H.suggestRows(s.hazop, a.rows, { dryRun: true }); return { would: 'add ' + r.added.length + ' suggested rows', added: r.added.map((x) => ({ node: x.node, deviation: x.deviation })), skipped: r.skipped }; },
      run: async (a) => {
        const s = ws(), next = JSON.parse(JSON.stringify(s)), r = H.suggestRows(next.hazop, a.rows, {});
        if (r.added.length) env.setSafety(next);
        return { added: r.added.length, ids: r.added.map((x) => x.id), skipped: r.skipped, status: 'suggested', next: ['The team reviews the suggested rows; call hazop_check to see what is still open.'], undo: 'Assistant: suggest HAZOP rows' };
      },
    },
    {
      name: 'hazop_check', group: 'read', untrusted: true, title: 'Check the HAZOP worksheet',
      description: 'Problems the worksheet shows about itself: nodes with no rows, guide word pairs not covered, rows with a consequence but no safeguard or action, high-risk rows with no recommendation, overdue actions, suggestions waiting for the team, and nodes that no longer match the P&ID. Shared problem shape.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const s = ws(), ps = H.check(s.hazop, { today: today(), pid: env.pid ? env.pid() : null }), off = a.offset || 0, lim = a.limit || 50; return { problems: ps.slice(off, off + lim).map(brief), total: ps.length, counts: counts(ps) }; },
    },
    {
      name: 'hazop_report_export', group: 'export', title: 'Export the HAZOP report',
      description: 'Writes the worksheet and the action list as one CSV file in the granted folder, with the study header and the "not an engineering approval" statement. Rows not yet accepted by the team are marked as such. Returns the path and counts.',
      inputSchema: obj({ name: str('File name without extension.', 40, { default: 'hazop-report' }) }),
      previewTarget: (a) => ({ path: (a.name || 'hazop-report') + '.csv', format: 'csv' }),
      run: async (a) => { const s = ws(), rep = H.report(s.hazop, { today: today() }), file = env.writeFile ? await env.writeFile((a.name || 'hazop-report') + '.csv', H.toCsv(rep)) : null; return { file, summary: rep.summary }; },
    },
    {
      name: 'lopa_scenarios_check', group: 'read', untrusted: true, title: 'Check the LOPA scenarios',
      description: 'The mitigated frequency, the gap to the target and the SIF verification of each LOPA scenario, with Problems for missing inputs, shared layers and a SIF that misses its credited PFD. No frequency or PFD is assumed: missing ones are listed.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const s = env.safety(); if (!s) noWs(); const off = a.offset || 0, lim = a.limit || 50, ps = L.check(s.lopa, s.hazop); return { scenarios: s.lopa.scenarios.slice(off, off + lim).map((sc) => L.scenarioResult(sc)), total: s.lopa.scenarios.length, problems: ps.slice(0, 50).map(brief), counts: counts(ps), review: L.REVIEW }; },
    },
    {
      name: 'sif_pfd_check', group: 'read', title: 'Compute a SIF PFDavg',
      description: 'The average probability of failure on demand of a safety instrumented function from its subsystems: architecture, dangerous undetected failure rate per hour, proof-test interval in hours, beta and test coverage; returns each subsystem, the total and the SIL band. Architectural constraints are not checked.',
      inputSchema: obj({ subsystems: arr('Sensor, logic and final element subsystems.', obj({ name: str('Subsystem name.', 60), arch: str('Voting architecture.', 8, { enum: L.ARCHITECTURES }), lambdaDU: num('Dangerous undetected failures per hour.', { minimum: 0, maximum: 1 }), TI: num('Proof-test interval in hours.', { minimum: 1, maximum: 1e7 }), beta: num('Common-cause beta, 0 to 0.5.', { minimum: 0, maximum: 0.5 }), PTC: num('Proof-test coverage, above 0 to 1.', { minimum: 0.01, maximum: 1 }), LT: num('Lifetime in hours.', { minimum: 1, maximum: 1e7 }) }, ['arch', 'lambdaDU', 'TI']), 6) }, ['subsystems']),
      run: (a) => L.verifySif(L.cleanLopa({ sifs: [{ id: 'SIF', subsystems: a.subsystems }] }).sifs[0]),
    },
    {
      name: 'consequence_case_run', group: 'read', title: 'Run a consequence case',
      description: 'Screening distances and zones for a jet fire, pool fire, TNT-equivalent explosion, toxic or flammable plume from the inputs given: the levels you ask for are the person\'s criteria. Missing inputs are listed and nothing is assumed. Not a consequence study.',
      inputSchema: obj({ kind: str('Case kind.', 12, { enum: ['jetfire', 'poolfire', 'vce', 'toxic', 'flammable'] }), params: { type: 'object', description: 'SI inputs for the kind: jetfire {mdot, dHc, chi, levels}; poolfire {D, mPrime, dHc, chi, levels}; vce {m, dHc, eta, levels}; toxic or flammable {Q, u, H, stab, levels, toDeg}.', additionalProperties: true } }, ['kind', 'params']),
      run: (a) => { const r = C.runCase(C.cleanCases([{ id: 'C1', kind: a.kind, params: a.params }])[0]); return { results: r.results, zones: r.zones.map((z) => ({ id: z.id, label: z.label, type: z.type, r: z.r, zMax: z.zMax })), problems: r.problems.map(brief), notes: r.notes }; },
    },
    {
      name: 'area_zones_check', group: 'read', untrusted: true, title: 'Check the hazardous area zones',
      description: 'The zones the release sources give with the classification pack in use, their extents and how each was found, and Problems for missing limits, outdoor sources and heavy vapours. The default pack is a simplified rule, not the standard\'s table, and the result says so.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const s = env.safety(); if (!s) noWs(); const r = A.classify(s.sources, env.areaPack ? env.areaPack() : A.SCREENING_PACK), off = a.offset || 0, lim = a.limit || 50; return { zones: r.zones.slice(off, off + lim).map((z) => ({ id: z.id, tag: z.tag, zone: z.zone, grade: z.grade, extent: z.extent, extentFrom: z.extentFrom })), total: r.zones.length, problems: r.problems.slice(0, 50).map(brief), notes: r.notes }; },
    },
    {
      name: 'inventory_check', group: 'read', untrusted: true, title: 'Check the chemical inventory',
      description: 'Problems the chemical inventory shows: missing names, CAS numbers, quantities, places and safety data sheet sections, incompatible chemicals stored together, and threshold lists reached or near, with the pack and clause. Only installed packs are applied.',
      inputSchema: obj({ ...PAGE }),
      run: (a) => { const s = env.safety(); if (!s) noWs(); const ps = I.check(s.inventory, { thresholdPacks: env.thresholdPacks ? env.thresholdPacks() : [], pid: env.pid ? env.pid() : null }), off = a.offset || 0, lim = a.limit || 50; return { problems: ps.slice(off, off + lim).map(brief), total: ps.length, counts: counts(ps), locations: I.locationTable(s.inventory).slice(0, 50), packs: (env.thresholdPacks ? env.thresholdPacks() : []).map((p) => p.name), review: I.REVIEW }; },
    },
  ];
}
