/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hazop.js — HAZOP and What-If on P&ID nodes (0.8 Track CH, CH.14; DOM-free). Method names follow the public vocabulary of IEC 61882 (guide words
 * NO/NOT, MORE, LESS, AS WELL AS, PART OF, REVERSE, OTHER THAN; parameters; node; deviation; cause; consequence; safeguard; recommendation). The risk matrix is
 * DATA: the default is an EXAMPLE 5 x 5 matrix, labelled so, because a company's matrix is its own; replace it with `setMatrix`.
 *
 *   node  { id, name, intent, equipment: [tags], lines: [line numbers], conditions: {text}, marks: [{ sheet, box:[x0,y0,x1,y1] }] (MarkupCraft), region: [[x,y]…] (CadCraft) }
 *   row   { id, node, guideword, parameter, question (What-If), deviation, causes[], consequences[], safeguards[], S, L, risk, actions[], status, by, who, note }
 *           status: draft | suggested (an assistant's, waiting for the team) | accepted | rejected;  by: person | assistant
 *   action { id, row, text, owner, due, status: open | done | rejected, closed: { by, date, note } }
 *
 *   newHazop · cleanHazop · addNode · proposeNodes(pid) · addRow · updateRow · acceptRows · rejectRows · suggestRows · addAction · closeAction
 *   riskRank(h, S, L) · coverage(h, nodeId) · check(h, { today, pid? }) · report(h, { today, title }) · toCsv(rep) · toHtml(rep) · toSheets(rep)
 *
 * Worksheets are never hard-deleted: a rejected row stays with its reason. Text from a file or an assistant is data, never instructions (rule 36).
 */
import { str, num, list, oneOf, isoDate, clone, nextId, problem, DISCLAIMER } from './common.js';

export const SOURCES = {
  guidewords: 'IEC 61882 guide words (vocabulary only): NO or NOT, MORE, LESS, AS WELL AS, PART OF, REVERSE, OTHER THAN; for sequence studies EARLY, LATE, BEFORE, AFTER',
  parameters: 'The parameter list is generic process practice (flow, pressure, temperature, level, composition, phase, reaction, corrosion, utilities, maintenance); edit it per study',
  matrix: 'EXAMPLE risk matrix: severity and likelihood 1 to 5, rank by their product (<=4 low, <=9 medium, <=16 high, above that extreme). A placeholder: use your own',
};
export const REVIEW_NOTE = 'Guide words and parameters are vocabulary; the matrix is an example. Nothing here replaces a facilitated team study.';

export const GUIDEWORDS = [
  { id: 'no', name: 'No or not', hint: 'The intention is not achieved at all' },
  { id: 'more', name: 'More', hint: 'A quantitative increase' },
  { id: 'less', name: 'Less', hint: 'A quantitative decrease' },
  { id: 'as-well-as', name: 'As well as', hint: 'Something extra happens or is present' },
  { id: 'part-of', name: 'Part of', hint: 'Only part of the intention is achieved' },
  { id: 'reverse', name: 'Reverse', hint: 'The opposite of the intention' },
  { id: 'other-than', name: 'Other than', hint: 'Something different from the intention' },
  { id: 'early', name: 'Early', hint: 'Sooner than the clock time (sequence)' },
  { id: 'late', name: 'Late', hint: 'Later than the clock time (sequence)' },
  { id: 'before', name: 'Before', hint: 'Earlier in a sequence' },
  { id: 'after', name: 'After', hint: 'Later in a sequence' },
];
export const PARAMETERS = ['flow', 'pressure', 'temperature', 'level', 'composition', 'phase', 'viscosity', 'reaction', 'corrosion or erosion', 'utilities', 'maintenance'];
/** The usual meaningful pairs for a continuous process node (a team adds or drops pairs). */
export const PAIRS = [
  ['no', 'flow'], ['more', 'flow'], ['less', 'flow'], ['reverse', 'flow'], ['part-of', 'flow'],
  ['more', 'pressure'], ['less', 'pressure'], ['more', 'temperature'], ['less', 'temperature'],
  ['more', 'level'], ['less', 'level'], ['no', 'level'],
  ['other-than', 'composition'], ['as-well-as', 'composition'], ['part-of', 'composition'], ['other-than', 'phase'],
  ['more', 'reaction'], ['no', 'reaction'], ['other-than', 'reaction'], ['more', 'corrosion or erosion'], ['no', 'utilities'], ['other-than', 'maintenance'],
];
const GW = Object.fromEntries(GUIDEWORDS.map((g) => [g.id, g]));
const STATUS = ['draft', 'suggested', 'accepted', 'rejected'];
const LIM = { nodes: 400, rows: 6000, actions: 3000, marks: 20, per: 12 };

export const EXAMPLE_MATRIX = Object.freeze({
  source: 'example', name: 'Example 5 x 5 (not your company\'s)',
  S: ['1 minor', '2 moderate', '3 serious', '4 major', '5 catastrophic'], L: ['1 rare', '2 unlikely', '3 possible', '4 likely', '5 frequent'],
  bands: [{ upTo: 4, rank: 'low' }, { upTo: 9, rank: 'medium' }, { upTo: 16, rank: 'high' }, { upTo: 25, rank: 'extreme' }],
});
export function riskRank(h, S, L) {
  if (!(S >= 1 && L >= 1)) return null;
  const m = h.matrix || EXAMPLE_MATRIX, v = S * L;
  for (const b of m.bands) if (v <= b.upTo) return b.rank;
  return m.bands[m.bands.length - 1].rank;
}

export function newHazop() {
  return { method: 'hazop', title: '', team: [], session: '', matrix: clone(EXAMPLE_MATRIX), nodes: [], rows: [], actions: [] };
}
const cleanMarks = (v) => (Array.isArray(v) ? v : []).slice(0, LIM.marks).filter((m) => m && typeof m === 'object').map((m) => ({ sheet: str(m.sheet, 40), box: (Array.isArray(m.box) ? m.box : []).slice(0, 4).map((x) => num(x) ?? 0) })).filter((m) => m.box.length === 4);
const cleanRegion = (v) => (Array.isArray(v) ? v : []).slice(0, 200).map((p) => (Array.isArray(p) ? [num(p[0]) ?? 0, num(p[1]) ?? 0] : null)).filter(Boolean);
function cleanNode(n, i) {
  return { id: str(n.id, 16) || 'N' + (i + 1), name: str(n.name, 80), intent: str(n.intent, 400), equipment: list(n.equipment, 40, 24), lines: list(n.lines, 60, 40),
    conditions: str(n.conditions?.text ?? n.conditions, 300), marks: cleanMarks(n.marks), region: cleanRegion(n.region) };
}
export function cleanMatrix(m) {
  if (!m || typeof m !== 'object') return clone(EXAMPLE_MATRIX);
  const S = list(m.S, 8, 40), L = list(m.L, 8, 40), bands = (Array.isArray(m.bands) ? m.bands : []).slice(0, 8).map((b) => ({ upTo: num(b?.upTo), rank: str(b?.rank, 20) })).filter((b) => b.upTo > 0 && b.rank).sort((a, b) => a.upTo - b.upTo);
  if (S.length < 2 || L.length < 2 || !bands.length) return clone(EXAMPLE_MATRIX);
  return { source: m.source === 'example' ? 'example' : 'own', name: str(m.name, 80), S, L, bands };
}
function cleanRow(r, ids) {
  const o = { id: str(r.id, 16), node: str(r.node, 16), guideword: GW[r.guideword] ? r.guideword : '', parameter: str(r.parameter, 40), question: str(r.question, 240), deviation: str(r.deviation, 160),
    causes: list(r.causes, LIM.per), consequences: list(r.consequences, LIM.per), safeguards: list(r.safeguards, LIM.per), actions: list(r.actions, LIM.per, 16),
    status: oneOf(r.status, STATUS, 'draft'), by: r.by === 'assistant' ? 'assistant' : 'person', who: str(r.who, 80), note: str(r.note, 300) };
  const S = Math.round(num(r.S) ?? 0), L = Math.round(num(r.L) ?? 0); if (S >= 1 && S <= 8) o.S = S; if (L >= 1 && L <= 8) o.L = L;
  if (!o.deviation) o.deviation = o.question || ((GW[o.guideword]?.name || '') + ' ' + o.parameter).trim();
  if (r.rejectedReason) o.rejectedReason = str(r.rejectedReason, 300);
  if (r.reviewedBy) o.reviewedBy = str(r.reviewedBy, 80);
  void ids; return o;
}
export function cleanHazop(raw) {
  const h = newHazop(); if (!raw || typeof raw !== 'object') return h;
  h.method = raw.method === 'whatif' ? 'whatif' : 'hazop'; h.title = str(raw.title, 120); h.team = list(raw.team, 30, 80); h.session = str(raw.session, 120); h.matrix = cleanMatrix(raw.matrix);
  h.nodes = (Array.isArray(raw.nodes) ? raw.nodes : []).slice(0, LIM.nodes).filter((n) => n && typeof n === 'object').map(cleanNode);
  const nid = new Set(h.nodes.map((n) => n.id));
  h.rows = (Array.isArray(raw.rows) ? raw.rows : []).slice(0, LIM.rows).filter((r) => r && typeof r === 'object').map((r) => cleanRow(r)).filter((r) => r.id && nid.has(r.node));
  for (const r of h.rows) if (r.S && r.L) r.risk = riskRank(h, r.S, r.L);
  const rid = new Set(h.rows.map((r) => r.id));
  h.actions = (Array.isArray(raw.actions) ? raw.actions : []).slice(0, LIM.actions).filter((a) => a && typeof a === 'object').map((a) => {
    const o = { id: str(a.id, 16), row: str(a.row, 16), text: str(a.text, 400), owner: str(a.owner, 80), due: isoDate(a.due), status: oneOf(a.status, ['open', 'done', 'rejected'], 'open') };
    if (a.closed && typeof a.closed === 'object') o.closed = { by: str(a.closed.by, 80), date: isoDate(a.closed.date), note: str(a.closed.note, 300) };
    return o;
  }).filter((a) => a.id && rid.has(a.row));
  return h;
}

export function setMatrix(h, m) { h.matrix = cleanMatrix(m); for (const r of h.rows) if (r.S && r.L) r.risk = riskRank(h, r.S, r.L); return h; }
export function addNode(h, n) {
  if (h.nodes.length >= LIM.nodes) throw new Error('At most ' + LIM.nodes + ' nodes.');
  const c = cleanNode({ ...n, id: n.id || nextId('N', h.nodes) }, h.nodes.length); if (h.nodes.some((x) => x.id === c.id)) throw new Error('Node ' + c.id + ' exists.');
  h.nodes.push(c); return c;
}

/**
 * Propose nodes from a neutral P&ID description { equipment: [{ tag, type }], lines: [{ ln, from: [labels], to: [labels] }] } (the add-on builds it from its own model).
 * One node per equipment item; a pump or compressor joins the node of the item it draws from; a line belongs to the node of the item it leaves
 * (a feed with no source belongs to the item it enters). A PROPOSAL: the team merges, splits and renames.
 */
export function proposeNodes(pid) {
  const eq = (pid?.equipment || []).map((e) => ({ tag: str(e.tag, 24), type: str(e.type, 24).toLowerCase() })).filter((e) => e.tag);
  const norm = (s) => String(s).replace(/\s*\(.*\)\s*$/, '').trim().toUpperCase();
  const byTag = new Map(eq.map((e) => [norm(e.tag), e])), lines = (pid?.lines || []).filter((l) => l && l.ln);
  const MOVER = /pump|compressor|blower|fan|ejector/;
  const home = new Map(eq.map((e) => [norm(e.tag), norm(e.tag)]));
  for (const e of eq) if (MOVER.test(e.type)) {
    const src = lines.filter((l) => (l.to || []).some((t) => norm(t) === norm(e.tag))).flatMap((l) => (l.from || []).map(norm)).find((t) => byTag.has(t) && !MOVER.test(byTag.get(t).type));
    if (src) home.set(norm(e.tag), src);
  }
  const root = (t) => { let c = t, n = 0; while (home.get(c) !== c && n++ < 20) c = home.get(c); return c; };
  const nodes = new Map();
  for (const e of eq) { const r = root(norm(e.tag)); if (!nodes.has(r)) nodes.set(r, { equipment: [], lines: [] }); nodes.get(r).equipment.push(e.tag); }
  for (const l of lines) {
    const from = (l.from || []).map(norm).find((t) => byTag.has(t)), to = (l.to || []).map(norm).find((t) => byTag.has(t)), t = from || to; if (!t) continue;
    nodes.get(root(t)).lines.push(str(l.ln, 40));
  }
  let i = 0;
  return [...nodes.entries()].map(([r, v]) => ({ id: 'N' + (++i), name: byTag.get(r).tag + (v.equipment.length > 1 ? ' and ' + (v.equipment.length - 1) + ' more' : ''), intent: '', equipment: v.equipment, lines: v.lines, proposed: true }));
}

function find(h, kind, id) { const x = h[kind].find((r) => r.id === id); if (!x) throw new Error('No ' + kind.slice(0, -1) + ' ' + id + '.'); return x; }
/** A person's row. `status` is draft until the team accepts it. */
export function addRow(h, row, { by = 'person', who = '' } = {}) {
  if (h.rows.length >= LIM.rows) throw new Error('At most ' + LIM.rows + ' rows.');
  if (!h.nodes.some((n) => n.id === row.node)) throw new Error('No node ' + row.node + '. Add the node first.');
  const c = cleanRow({ ...row, id: nextId('R', h.rows), status: by === 'assistant' ? 'suggested' : (row.status === 'accepted' ? 'accepted' : 'draft'), by, who });
  if (c.S && c.L) c.risk = riskRank(h, c.S, c.L);
  h.rows.push(c); return c;
}
export function updateRow(h, id, patch) {
  const r = find(h, 'rows', id), c = cleanRow({ ...r, ...patch, id: r.id, node: r.node, status: r.status, by: r.by, who: r.who });
  Object.assign(r, c); delete r.risk; if (r.S && r.L) r.risk = riskRank(h, r.S, r.L); if (r.by === 'assistant' && r.status === 'suggested') { /* an edit by a person keeps it a suggestion until accepted */ }
  return r;
}
/** The team accepts rows: a named person is required. Returns the rows changed. */
export function acceptRows(h, ids, who) {
  if (!str(who, 80)) throw new Error('Say who accepted the rows.');
  return ids.map((id) => { const r = find(h, 'rows', id); r.status = 'accepted'; r.reviewedBy = str(who, 80); delete r.rejectedReason; return r; });
}
export function rejectRows(h, ids, who, reason = '') {
  if (!str(who, 80)) throw new Error('Say who rejected the rows.');
  return ids.map((id) => { const r = find(h, 'rows', id); r.status = 'rejected'; r.reviewedBy = str(who, 80); r.rejectedReason = str(reason, 300); return r; });
}
const key = (r) => [r.node, r.guideword || r.question.toLowerCase(), r.parameter.toLowerCase(), (r.causes[0] || '').toLowerCase()].join('|');
/**
 * Rows an assistant drafted (CH.30). Always status 'suggested', by 'assistant'; duplicates (same node, pair and first cause) are skipped; at most `limit` per call.
 * → { added: [rows], skipped: [{ index, why }] }.  Nothing here accepts anything.
 */
export function suggestRows(h, rows, { limit = 25, who = 'assistant', dryRun = false } = {}) {
  const added = [], skipped = [], seen = new Set(h.rows.map(key)), target = dryRun ? clone(h) : h;
  (rows || []).forEach((r, index) => {
    if (added.length >= limit) { skipped.push({ index, why: 'over the limit of ' + limit + ' rows per call' }); return; }
    if (!r || typeof r !== 'object') { skipped.push({ index, why: 'not a row' }); return; }
    if (!target.nodes.some((n) => n.id === r.node)) { skipped.push({ index, why: 'no node ' + str(r.node, 16) }); return; }
    if (r.guideword && !GW[r.guideword]) { skipped.push({ index, why: 'unknown guide word ' + str(r.guideword, 20) }); return; }
    if (target.method === 'hazop' && (!r.guideword || !r.parameter)) { skipped.push({ index, why: 'a HAZOP row needs a guide word and a parameter' }); return; }
    if (target.method === 'whatif' && !str(r.question)) { skipped.push({ index, why: 'a What-If row needs a question' }); return; }
    if (!list(r.causes).length && !list(r.consequences).length) { skipped.push({ index, why: 'no cause or consequence' }); return; }
    const c = cleanRow({ ...r, id: 'tmp', status: 'suggested', by: 'assistant', who }); const k = key(c);
    if (seen.has(k)) { skipped.push({ index, why: 'already in the worksheet' }); return; }
    seen.add(k); added.push(addRow(target, r, { by: 'assistant', who }));
  });
  return { added, skipped };
}

export function addAction(h, rowId, a) {
  find(h, 'rows', rowId); if (h.actions.length >= LIM.actions) throw new Error('At most ' + LIM.actions + ' actions.');
  const o = { id: nextId('A', h.actions), row: rowId, text: str(a.text, 400), owner: str(a.owner, 80), due: isoDate(a.due), status: 'open' };
  if (!o.text) throw new Error('An action needs text.');
  h.actions.push(o); const r = find(h, 'rows', rowId); r.actions = [...r.actions, o.id].slice(0, LIM.per); return o;
}
export function closeAction(h, id, { by, date, note = '', status = 'done' }) {
  if (!str(by, 80)) throw new Error('Say who closed the action.');
  const a = find(h, 'actions', id); a.status = status === 'rejected' ? 'rejected' : 'done'; a.closed = { by: str(by, 80), date: isoDate(date), note: str(note, 300) }; return a;
}

/** Which usual pairs a node has rows for (accepted, draft or suggested; rejected rows still count as considered). */
export function coverage(h, nodeId, pairs = PAIRS) {
  const rows = h.rows.filter((r) => r.node === nodeId);
  const done = new Set(rows.map((r) => r.guideword + '|' + r.parameter.toLowerCase()));
  const items = pairs.map(([g, p]) => ({ guideword: g, parameter: p, covered: done.has(g + '|' + p), rows: rows.filter((r) => r.guideword === g && r.parameter.toLowerCase() === p).map((r) => r.id) }));
  return { node: nodeId, total: items.length, covered: items.filter((i) => i.covered).length, items };
}

/** Problems (shared shape): what the worksheet itself says is unfinished. `today` as YYYY-MM-DD turns on the overdue test. */
export function check(h, { today = '', pid = null } = {}) {
  const out = [], T = isoDate(today);
  for (const n of h.nodes) {
    const rows = h.rows.filter((r) => r.node === n.id), about = [{ kind: 'hazop-node', id: n.id, label: n.name }];
    if (!rows.length) { out.push(problem('hazop.node.empty', 'warning', `Node ${n.id} (${n.name || 'unnamed'}) has no rows yet.`, about)); continue; }
    if (h.method === 'hazop') { const c = coverage(h, n.id), miss = c.items.filter((i) => !i.covered); if (miss.length) out.push(problem('hazop.node.coverage', 'note', `Node ${n.id}: ${miss.length} of ${c.total} usual guide word and parameter pairs have no row (${miss.slice(0, 4).map((i) => i.guideword + ' ' + i.parameter).join(', ')}${miss.length > 4 ? ' …' : ''}).`, about, { req: { op: '>=', value: c.total, unit: 'pairs' }, found: { value: c.covered, unit: 'pairs' } })); }
    if (!n.intent) out.push(problem('hazop.node.intent', 'note', `Node ${n.id} has no design intent written down.`, about));
  }
  const pend = h.rows.filter((r) => r.status === 'suggested');
  if (pend.length) out.push(problem('hazop.suggested', 'note', `${pend.length} row${pend.length > 1 ? 's' : ''} suggested by an assistant wait for the team to accept or reject.`, pend.slice(0, 20).map((r) => ({ kind: 'hazop-row', id: r.id }))));
  for (const r of h.rows) {
    if (r.status === 'rejected') continue;
    const about = [{ kind: 'hazop-row', id: r.id }], rank = r.risk;
    if (r.consequences.length && !r.safeguards.length && !r.actions.length) out.push(problem('hazop.row.unprotected', 'warning', `Row ${r.id} (${r.deviation}) has a consequence but no safeguard and no action.`, about));
    if ((rank === 'high' || rank === 'extreme') && !r.actions.some((id) => h.actions.find((a) => a.id === id && a.status !== 'rejected'))) out.push(problem('hazop.row.risk', rank === 'extreme' ? 'error' : 'warning', `Row ${r.id} is ${rank} risk and has no recommendation.`, about, { req: { op: '<=', value: 9, unit: 'S x L' }, found: { value: r.S * r.L, unit: 'S x L' } }));
    if (r.consequences.length && !(r.S && r.L)) out.push(problem('hazop.row.unrated', 'note', `Row ${r.id} has a consequence but no severity and likelihood.`, about));
  }
  for (const a of h.actions) {
    const about = [{ kind: 'hazop-action', id: a.id }];
    if (a.status !== 'open') continue;
    if (!a.owner) out.push(problem('hazop.action.owner', 'note', `Action ${a.id} has no owner.`, about));
    if (T && a.due && a.due < T) out.push(problem('hazop.action.overdue', 'warning', `Action ${a.id} was due ${a.due} and is still open.`, about));
  }
  if (pid) {
    const tags = new Set((pid.equipment || []).map((e) => String(e.tag).toUpperCase())), lns = new Set((pid.lines || []).map((l) => String(l.ln).toUpperCase()));
    for (const n of h.nodes) {
      for (const t of n.equipment) if (!tags.has(t.toUpperCase())) out.push(problem('hazop.node.equipment', 'warning', `Node ${n.id} lists ${t}, which is not on the P&ID any more.`, [{ kind: 'hazop-node', id: n.id }]));
      for (const l of n.lines) if (!lns.has(l.toUpperCase())) out.push(problem('hazop.node.line', 'warning', `Node ${n.id} lists line ${l}, which is not on the P&ID any more.`, [{ kind: 'hazop-node', id: n.id }]));
    }
    const used = new Set(h.nodes.flatMap((n) => n.equipment.map((t) => t.toUpperCase())));
    const left = [...tags].filter((t) => !used.has(t)); if (left.length) out.push(problem('hazop.equipment.unassigned', 'warning', `${left.length} equipment item${left.length > 1 ? 's are' : ' is'} in no node (${left.slice(0, 4).join(', ')}${left.length > 4 ? ' …' : ''}).`, [{ kind: 'hazop', id: 'nodes' }]));
  }
  return out;
}

/** The report as plain data. Every sheet says what it is not; rows not yet accepted are marked so a reader cannot take them for the team's. */
export function report(h, { today = '', title = '' } = {}) {
  const rows = h.rows.filter((r) => r.status !== 'rejected');
  const nodes = h.nodes.map((n) => ({ ...n, rows: rows.filter((r) => r.node === n.id).map((r) => ({ ...r, actionItems: r.actions.map((id) => h.actions.find((a) => a.id === id)).filter(Boolean) })) }));
  const acts = h.actions;
  return {
    title: str(title || h.title || (h.method === 'whatif' ? 'What-If study' : 'HAZOP study'), 120), method: h.method, date: isoDate(today), team: h.team, session: h.session, matrix: h.matrix.name + (h.matrix.source === 'example' ? ' (example)' : ''),
    disclaimers: [DISCLAIMER, REVIEW_NOTE], nodes, actions: acts,
    summary: { nodes: h.nodes.length, rows: rows.length, accepted: rows.filter((r) => r.status === 'accepted').length, notAccepted: rows.filter((r) => r.status !== 'accepted').length, rejected: h.rows.length - rows.length,
      high: rows.filter((r) => r.risk === 'high' || r.risk === 'extreme').length, actionsOpen: acts.filter((a) => a.status === 'open').length, actionsDone: acts.filter((a) => a.status === 'done').length },
  };
}
const COLS = ['Node', 'Row', 'Guide word', 'Parameter', 'Deviation', 'Causes', 'Consequences', 'Safeguards', 'S', 'L', 'Risk', 'Recommendations', 'Status', 'Drafted by'];
const cell = (s) => { let t = String(s ?? ''); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };   // spreadsheet formula injection guarded
export function toSheets(rep) {
  const rows = [COLS];
  for (const n of rep.nodes) for (const r of n.rows) rows.push([n.id + ' ' + n.name, r.id, GW[r.guideword]?.name || '', r.parameter, r.deviation, r.causes.join('; '), r.consequences.join('; '), r.safeguards.join('; '), r.S ?? '', r.L ?? '', r.risk || '',
    r.actionItems.map((a) => a.id + ': ' + a.text).join('; '), r.status === 'accepted' ? 'accepted' : r.status + ' (not accepted by the team)', r.by === 'assistant' ? 'assistant (suggestion)' : (r.who || 'person')]);
  const acts = [['Action', 'Row', 'Text', 'Owner', 'Due', 'Status', 'Closed by', 'Closed on']].concat(rep.actions.map((a) => [a.id, a.row, a.text, a.owner, a.due, a.status, a.closed?.by || '', a.closed?.date || '']));
  return { Worksheet: rows, Actions: acts, About: [[rep.title], [rep.method === 'whatif' ? 'What-If' : 'HAZOP'], ['Date', rep.date], ['Team', rep.team.join(', ')], ['Risk matrix', rep.matrix], ...rep.disclaimers.map((d) => [d])] };
}
export function toCsv(rep) {
  const s = toSheets(rep);
  return [rep.title, ...rep.disclaimers, '', ...s.Worksheet.map((r) => r.map(cell).join(',')), '', ...s.Actions.map((r) => r.map(cell).join(','))].map((l, i) => (i < 1 + rep.disclaimers.length ? cell(l) : l)).join('\r\n') + '\r\n';
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** A printable page (the host turns it into a PDF). Text is escaped; nothing from the worksheet is ever markup. */
export function toHtml(rep) {
  const s = toSheets(rep), row = (r, tag = 'td') => '<tr>' + r.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('') + '</tr>';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rep.title)}</title></head><body><h1>${esc(rep.title)}</h1>` +
    rep.disclaimers.map((d) => `<p><strong>${esc(d)}</strong></p>`).join('') +
    `<p>${esc(rep.method === 'whatif' ? 'What-If' : 'HAZOP')}, ${esc(rep.date)}. Team: ${esc(rep.team.join(', '))}. Risk matrix: ${esc(rep.matrix)}. Rows: ${rep.summary.rows} (${rep.summary.accepted} accepted, ${rep.summary.notAccepted} not yet accepted by the team).</p>` +
    `<table border="1" cellspacing="0" cellpadding="3">${row(s.Worksheet[0], 'th')}${s.Worksheet.slice(1).map((r) => row(r)).join('')}</table><h2>Actions</h2>` +
    `<table border="1" cellspacing="0" cellpadding="3">${row(s.Actions[0], 'th')}${s.Actions.slice(1).map((r) => row(r)).join('')}</table></body></html>`;
}
