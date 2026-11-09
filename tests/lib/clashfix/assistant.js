/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page */
/**
 * assistant.js — the connected assistant's way in (cc-clashfix, 0.9 EG.42). Two tools for the host's connector layer
 * (host.control.tool(def), docs/AI-CONNECT-SPEC.md § 2): an assistant the person connected reads the clashes and the limits of the
 * discipline it works for, and files proposals. A proposal is judged in the sandbox like the built-in ones and waits in the person's
 * review list; nothing in the model changes until the person accepts it there. Nothing here calls an assistant or the network.
 *
 *   clashTools(session, { ToolError }) → [tool definition]
 *     session.result()          the coordinator's result (null when no review list is open)
 *     session.model()           the sandbox model it was made from
 *     session.add(proposal)     → scored proposal (places it in the review list and redraws it)
 *   clashes_list    group read, untrusted (element names come from the file)
 *   clash_fix_add   group read: it files a proposal; it never edits the model (the person's accept is the edit, one undo step)
 */
import { DISCIPLINE_IDS, DISCIPLINES } from './disciplines.js';
import { brief } from './coordinator.js';

const OPS = ['shift', 'crossover', 'resize', 'move_column', 'move_wall', 'opening'];
const mm = (d) => ({ type: 'number', minimum: -100000, maximum: 100000, description: d });
const cut = (e) => (e && e.path && e.path.length > 40 ? { ...e, path: e.path.slice(0, 40), pathCut: true } : e);

export function clashTools(session, { ToolError = Error } = {}) {
  const need = () => {
    const r = session.result(), m = session.model();
    if (!r || !m) throw new ToolError('not_open', 'No clash review list is open.', { next: ['Ask the person to run the Clash check and click Propose fixes.'], retry: 'after_change' });
    return { r, m };
  };
  return [
    {
      name: 'clashes_list', group: 'read', title: 'List clashes to settle', untrusted: true,
      description: 'Lists the clashes in the open review list with both elements (kind, discipline, box or centre line in mm, z up), the fixes already proposed and how they scored. With discipline: only the clashes that discipline owns a side of, its tools and their limits. Use clash_fix_add to propose a fix.',
      inputSchema: {
        type: 'object', additionalProperties: false,
        properties: {
          discipline: { type: 'string', enum: DISCIPLINE_IDS, description: 'The discipline you work for; its elements are the only ones you may change.' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50, description: 'How many clashes to return.' },
          offset: { type: 'integer', minimum: 0, maximum: 100000, default: 0, description: 'How many to skip.' },
        },
      },
      run: async (a) => {
        const { r, m } = need();
        const limit = a.limit || 50, offset = a.offset || 0;
        const scored = (it) => it.proposals.slice(0, 8).map((p) => ({ id: p.id, discipline: p.discipline, by: p.by, title: p.title, resolved: p.resolved, newClashes: p.newClashes.length, ruleBreaks: p.breaks.map((b) => b.rule), cost: p.cost }));
        if (a.discipline) {
          const b = brief(m, r, a.discipline), page = b.clashes.slice(offset, offset + limit);
          return { discipline: a.discipline, units: b.units, tools: b.tools, limits: b.limits, gap: b.gap, checks: b.checks, total: b.clashes.length, returned: page.length, ...(offset + limit < b.clashes.length ? { next: offset + limit } : {}),
            clashes: page.map((c) => ({ ...c, mine: c.mine.map(cut), other: c.other.map(cut), proposed: scored(r.items.find((it) => it.clash.id === c.clash)) })),
            notes: ['Change only the elements under "mine". Each proposal is checked again here and the person accepts or rejects it.'] };
        }
        const by = new Map(m.elements.map((e) => [e.id, e]));
        const sum = (e) => e && ({ id: e.id, name: e.name || e.id, kind: e.kind, discipline: e.discipline });
        const page = r.items.slice(offset, offset + limit);
        return { total: r.items.length, returned: page.length, ...(offset + limit < r.items.length ? { next: offset + limit } : {}),
          disciplines: Object.fromEntries(DISCIPLINE_IDS.map((d) => [d, { tools: DISCIPLINES[d].tools }])),
          clashes: page.map((it) => ({ clash: it.clash.id, depth: Math.round(it.clash.depth || 0), a: sum(by.get(it.clash.a)), b: sum(by.get(it.clash.b)), proposed: scored(it) })) };
      },
    },
    {
      name: 'clash_fix_add', group: 'read', title: 'Propose a clash fix',
      description: 'Files a proposed fix for one clash on behalf of one discipline and returns how it scored in a sandbox copy: whether it settles the clash, new clashes, rules broken, a cost proxy. It never changes the model: the person accepts or rejects it in the review list. Get clash ids and limits from clashes_list.',
      inputSchema: {
        type: 'object', additionalProperties: false, required: ['clash', 'discipline', 'actions'],
        properties: {
          clash: { type: 'string', maxLength: 300, description: 'The clash id from clashes_list.' },
          discipline: { type: 'string', enum: DISCIPLINE_IDS, description: 'The discipline you propose for; you may change only its elements.' },
          actions: {
            type: 'array', minItems: 1, maxItems: 6, description: 'What to change, applied in order.',
            items: {
              type: 'object', additionalProperties: false, required: ['op', 'element'],
              properties: {
                op: { type: 'string', enum: OPS, description: 'shift (a whole run), crossover (a detour on one leg), resize (a rectangular duct), move_column, move_wall, opening (in a beam, slab or wall for a run).' },
                element: { type: 'string', maxLength: 200, description: 'The element id.' },
                through: { type: 'string', maxLength: 200, description: 'opening: the run that passes.' },
                segment: { type: 'integer', minimum: 0, maximum: 1000, description: 'crossover: the leg, 0 = from the first point.' },
                from: mm('crossover: millimetres along the leg (plan) where the detour starts.'), to: mm('crossover: where it ends.'),
                dx: mm('Millimetres east.'), dy: mm('Millimetres north.'), dz: mm('Millimetres up (negative: down).'),
                w: { type: 'number', minimum: 10, maximum: 10000, description: 'resize or opening: width in millimetres.' },
                h: { type: 'number', minimum: 10, maximum: 10000, description: 'resize or opening: height in millimetres.' },
              },
            },
          },
          why: { type: 'string', maxLength: 400, description: 'One or two sentences for the person: why this fix, what it costs.' },
        },
      },
      run: async (a, ctx = {}) => {
        const { r } = need();
        if (!r.items.some((it) => it.clash.id === a.clash)) throw new ToolError('not_found', 'There is no clash ' + a.clash + ' in the review list.', { next: ['Call clashes_list to see the clash ids.'], retry: 'never' });
        const p = session.add({ clash: a.clash, discipline: a.discipline, by: 'assistant', client: (ctx && ctx.client) || 'assistant', why: a.why || '', title: { key: 'p.assistant', vars: {} }, actions: a.actions });
        if (!p.ok) return { added: false, refused: p.refused, notes: ['Not filed: the reasons are in refused (codes: not_yours = another discipline\'s element; too_far = over the tool\'s limit; drain_detour = a gravity drain may not rise or dip).'] };
        return { added: true, id: p.id, resolved: p.resolved, newClashes: p.newClashes.map((c) => c.id), ruleBreaks: p.breaks.map((b) => ({ rule: b.rule, element: b.element, ...b.vars })), cost: p.cost, moved: p.moved, added_length: p.added,
          notes: ['Nothing in the model changed. The person accepts or rejects this fix in the review list.'] };
      },
    },
  ];
}
