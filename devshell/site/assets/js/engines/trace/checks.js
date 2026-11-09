/* SPDX-License-Identifier: Apache-2.0 */
/**
 * checks.js — what the traceability asks (0.8 XE.7). Coverage, the verification matrix, impact of a change, the design history file index.
 * Nothing here decides that a product is safe or compliant: it shows what is linked and what is not (`DISCLAIMER`).
 */
import { problem, clean } from './model.js';
export const DISCLAIMER = 'Traceability shows what is linked and what has a recorded result. It does not show that a requirement is right, that a test is good enough, or that a product complies with any standard.';
const about = (r) => [{ kind: 'requirement', id: r.id }];

/**
 * Per requirement: its children, the elements that satisfy it, the tests that verify it and each test's newest outcome.
 * state: 'verified' (every direct test passes, at least one), 'failed' (a test failed), 'untested' (no test linked), 'pending' (tests linked, not all passed or run),
 * 'parent' (a requirement decomposed into children takes the weakest child state, see rollup).
 */
export function matrix(spec) {
  const rows = [];
  for (const r of spec.requirements()) {
    const tests = spec.related(r.id, 'verifies', 'in').map((t) => ({ id: t.id, title: t.title, outcome: spec.latest(t.id)?.outcome || 'not-run', at: spec.latest(t.id)?.at || null }));
    const elements = spec.related(r.id, 'satisfies', 'in').map((e) => ({ id: e.id, title: e.title }));
    const children = spec.children(r.id).map((c) => c.id).concat(spec.related(r.id, 'derives', 'in').filter((c) => c.kind === 'requirement').map((c) => c.id));
    let state;
    if (tests.some((t) => t.outcome === 'fail')) state = 'failed';
    else if (!tests.length) state = 'untested';
    else if (tests.every((t) => t.outcome === 'pass')) state = 'verified';
    else state = 'pending';
    rows.push({ id: r.id, title: r.title, status: r.status, tests, elements, children: [...new Set(children)], state });
  }
  return rows;
}
/** Parents verified through their children: the weakest child state wins. Returns Map id → state. */
export function rollup(spec) {
  const rows = new Map(matrix(spec).map((r) => [r.id, r])), memo = new Map(), order = ['failed', 'untested', 'pending', 'verified'];
  const go = (id, seen) => {
    if (memo.has(id)) return memo.get(id); const r = rows.get(id); if (!r) return 'untested';
    if (seen.has(id)) return r.state; seen.add(id);
    const states = [r.tests.length ? r.state : null, ...r.children.filter((c) => rows.has(c)).map((c) => go(c, seen))].filter(Boolean);
    const out = states.length ? states.sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] : 'untested';
    memo.set(id, out); return out;
  };
  for (const id of rows.keys()) go(id, new Set());
  return memo;
}
export function coverage(spec) {
  const m = matrix(spec), roll = rollup(spec), n = m.length, c = (f) => m.filter(f).length;
  const states = {}; for (const id of roll.keys()) states[roll.get(id)] = (states[roll.get(id)] || 0) + 1;
  return { requirements: n, satisfied: c((r) => r.elements.length || r.children.length), tested: c((r) => r.tests.length), verified: states.verified || 0, failed: states.failed || 0, untested: states.untested || 0, pending: states.pending || 0 };
}
/** Problems: a requirement nothing satisfies, nothing verifies, a failed test, a link to something missing, a cycle, a verified-looking status with no passing test. */
export function check(spec, { requireSatisfy = true } = {}) {
  const P = [], roll = rollup(spec), ids = new Set(spec.items.keys());
  for (const r of matrix(spec)) {
    const leaf = !r.children.length;
    if (r.status === 'rejected') continue;
    if (leaf && !r.tests.length) P.push(problem('untested', 'warning', `${r.id}${r.title ? ' (' + r.title + ')' : ''} has no test that verifies it.`, about(r)));
    if (leaf && requireSatisfy && !r.elements.length && r.status !== 'draft') P.push(problem('unsatisfied', 'warning', `${r.id} is not satisfied by any element, design or document.`, about(r)));
    for (const t of r.tests) {
      if (t.outcome === 'fail') P.push(problem('failed', 'error', `Test ${t.id} failed for ${r.id}.`, about(r)));
      else if (t.outcome === 'blocked') P.push(problem('blocked', 'warning', `Test ${t.id} is blocked, so ${r.id} is not verified.`, about(r)));
    }
    if (r.status === 'verified' && roll.get(r.id) !== 'verified') P.push(problem('status', 'warning', `${r.id} says "verified" but its linked tests do not all pass (${roll.get(r.id)}).`, about(r), { found: roll.get(r.id), req: { op: '=', value: 'verified' } }));
  }
  for (const l of spec.links) for (const end of [l.from, l.to]) if (!ids.has(end)) P.push(problem('dangling', 'error', `A ${l.type} link points at "${end}", which is not in the specification.`, [{ kind: 'link', id: end }]));
  for (const i of spec.live()) if (i.parent && !ids.has(i.parent)) P.push(problem('orphan', 'error', `${i.id} names a parent "${i.parent}" that is not in the specification.`, [{ kind: i.kind, id: i.id }]));
  for (const cyc of cycles(spec)) P.push(problem('cycle', 'error', 'Requirements form a loop: ' + cyc.join(' → ') + '.', [{ kind: 'requirement', id: cyc[0] }]));
  const retiredLinked = spec.links.filter((l) => spec.items.get(l.from)?.retired || spec.items.get(l.to)?.retired);
  for (const l of retiredLinked) P.push(problem('retired', 'info', `${l.from} ${l.type} ${l.to}: one end is retired.`, [{ kind: 'link', id: l.from }]));
  return P;
}
/** Loops in parent / derives / refines. Returns arrays of ids. */
export function cycles(spec) {
  const next = new Map();
  const add = (a, b) => { if (!next.has(a)) next.set(a, new Set()); next.get(a).add(b); };
  for (const i of spec.items.values()) if (i.parent) add(i.id, i.parent);
  for (const l of spec.links) if (l.type === 'derives' || l.type === 'refines') add(l.from, l.to);
  const out = [], state = new Map(), stack = [];
  const dfs = (v) => {
    state.set(v, 1); stack.push(v);
    for (const w of next.get(v) || []) { if (state.get(w) === 1) out.push([...stack.slice(stack.indexOf(w)), w]); else if (!state.get(w)) dfs(w); }
    stack.pop(); state.set(v, 2);
  };
  for (const v of next.keys()) if (!state.get(v)) dfs(v);
  return out;
}
/** What a change to `id` touches: requirements it satisfies/verifies (up), and what hangs under it (down), through every link. Bounded. */
export function impact(spec, id, { max = 500 } = {}) {
  const adj = new Map(); const put = (a, b) => { if (!adj.has(a)) adj.set(a, new Set()); adj.get(a).add(b); };
  for (const l of spec.links) { put(l.from, l.to); put(l.to, l.from); }
  for (const i of spec.items.values()) if (i.parent) { put(i.id, i.parent); put(i.parent, i.id); }
  const seen = new Map([[id, 0]]), q = [id];
  while (q.length && seen.size < max) { const v = q.shift(); for (const w of adj.get(v) || []) if (!seen.has(w)) { seen.set(w, seen.get(v) + 1); q.push(w); } }
  seen.delete(id);
  return [...seen].map(([k, d]) => ({ id: k, distance: d, kind: spec.items.get(k)?.kind || null, title: spec.items.get(k)?.title || '' })).sort((a, b) => a.distance - b.distance || (a.id < b.id ? -1 : 1));
}
const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
/** The verification matrix as CSV (formula-looking cells get a leading quote). */
export function matrixCsv(spec) {
  const roll = rollup(spec), head = ['Requirement', 'Title', 'Status', 'Satisfied by', 'Verified by', 'Test results', 'State'];
  const lines = [head.join(',')];
  for (const r of matrix(spec)) lines.push([r.id, r.title, r.status, r.elements.map((e) => e.id).join('; '), r.tests.map((t) => t.id).join('; '), r.tests.map((t) => t.id + '=' + t.outcome).join('; '), roll.get(r.id)].map(cell).join(','));
  return lines.join('\r\n') + '\r\n';
}
/**
 * Design history file index: the list of documents a regulated product keeps, built from the 'document' items and the requirements they support.
 * Sections come from the document's attrs.section (e.g. "Design input", "Design output", "Verification", "Risk"); missing sections are named.
 */
export const DHF_SECTIONS = ['Design plan', 'Design input', 'Design output', 'Design review', 'Verification', 'Validation', 'Risk management', 'Design transfer', 'Design changes'];
export function dhfIndex(spec, sections = DHF_SECTIONS) {
  const docs = spec.live().filter((i) => i.kind === 'document');
  const out = sections.map((s) => ({ section: s, documents: docs.filter((d) => d.attrs.section === s).map((d) => ({ id: d.id, title: d.title, version: d.attrs.version || '', approved: d.attrs.approved || '', supports: spec.links.filter((l) => l.from === d.id || l.to === d.id).map((l) => (l.from === d.id ? l.to : l.from)) })) }));
  const other = docs.filter((d) => !sections.includes(d.attrs.section));
  const problems = out.filter((s) => !s.documents.length).map((s) => problem('dhf-empty', 'info', `The design history file has no document under "${s.section}".`, [{ kind: 'section', id: clean(s.section, 60) }]));
  for (const d of docs) if (!d.attrs.version) problems.push(problem('dhf-version', 'info', `Document ${d.id} has no version.`, [{ kind: 'document', id: d.id }]));
  return { sections: out, unsectioned: other.map((d) => ({ id: d.id, title: d.title })), problems, disclaimer: DISCLAIMER };
}
