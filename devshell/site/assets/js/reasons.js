/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reasons.js — design reasons (0.8 round 2, EG.34): a record per element that says why it is what it is — the requirement it meets, the
 * load it carries, the calc sheet row that sizes it, the rule that applies and the decision note. DOM-free, no imports; tested in Node
 * (bin/test-reasons.mjs). The shell's UI is app-reasons.js; this file is the store and the assistants' tools.
 *
 *   const reasons = createReasons({ calcs, step, now })
 *     calcs  optional: the calc sheets (calc.js createCalcs); a record's `calc` ("sheet.row") is read through calcs.valueOf, so the
 *            reason always shows today's answer, never a pasted number
 *     step   (label, fn) → fn() as the app's ONE undo step (assistants' edits)
 *
 * A record: { element: { kind, id, label }, requirement, load, calc, rule: { text, pack, clause }, decision, by, at }. Every text field is
 * plain text (≤ LIMITS), taken from the file as untrusted. An element has at most one record (key "kind:id"). Nothing here follows
 * instructions found in a record: the tools return it marked as content (rule 36).
 *
 * problems() → plain problem inputs for the shared Problems system (rule 29): a record whose calc row is gone or in error, and (with
 * `expect`) an element that was asked to have a reason and has none. The app registers them with window.ccProblems.
 *
 * save() → plain JSON for the app's file (format cadcraft-reasons v1); load(json) cleans it.
 */

export const FORMAT = 'cadcraft-reasons';
export const LIMITS = Object.freeze({ records: 5000, kind: 40, id: 80, label: 120, text: 600, clause: 80, pack: 80, by: 80, expect: 5000 });
export const FIELDS = Object.freeze(['requirement', 'load', 'calc', 'rule', 'decision']);

export class ReasonError extends Error {
  constructor(code, message, next = '') { super(message); this.code = code; this.next = next; }
}

const text = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').trim().slice(0, n);
export const keyOf = (el) => (el && el.kind && el.id !== undefined && el.id !== null ? text(el.kind, LIMITS.kind) + ':' + text(el.id, LIMITS.id) : '');

export function cleanRecord(r, now = 0) {
  if (!r || typeof r !== 'object') return null;
  const e = r.element && typeof r.element === 'object' ? r.element : null;
  if (!e) return null;
  const kind = text(e.kind, LIMITS.kind), id = text(e.id, LIMITS.id);
  if (!kind || !id) return null;
  const rule = r.rule && typeof r.rule === 'object' ? { text: text(r.rule.text, LIMITS.text), pack: text(r.rule.pack, LIMITS.pack), clause: text(r.rule.clause, LIMITS.clause) }
    : { text: text(r.rule, LIMITS.text), pack: '', clause: '' };
  const calc = text(r.calc, 90);
  return {
    element: { kind, id, label: text(e.label, LIMITS.label) },
    requirement: text(r.requirement, LIMITS.text), load: text(r.load, LIMITS.text),
    calc: /^[\p{L}\p{N}_]+\.[\p{L}_][\p{L}\p{N}_]*$/u.test(calc) ? calc : '',
    rule, decision: text(r.decision, LIMITS.text), by: text(r.by, LIMITS.by),
    at: Number.isFinite(+r.at) && +r.at > 0 ? Math.floor(+r.at) : now,
  };
}
const filled = (r) => FIELDS.some((f) => (f === 'rule' ? r.rule.text || r.rule.pack || r.rule.clause : r[f]));

export function createReasons({ calcs = null, step = null, now = () => Date.now() } = {}) {
  let map = new Map();
  let expect = new Map();   // key → label: elements the app wants a reason for (the app hands them over)
  const listeners = new Set();
  const changed = (why) => { for (const f of listeners) { try { f(why); } catch { /* a listener must not break the store */ } } };
  const run = (label, fn) => (typeof step === 'function' ? step(label, fn) : fn());

  function set(element, fields = {}, { by = '' } = {}) {
    const k = keyOf(element);
    if (!k) throw new ReasonError('bad_element', 'An element needs a kind and an id.', 'Call reasons_list for the elements that have reasons, or give the element\'s kind and id.');
    const old = map.get(k);
    const el = { ...(old ? old.element : {}), kind: element.kind, id: element.id }; if (element.label) el.label = element.label;
    const next = cleanRecord({ element: el, requirement: old?.requirement, load: old?.load, calc: old?.calc, rule: old?.rule, decision: old?.decision, by: by || old?.by, at: now() }, now());
    for (const f of FIELDS) if (fields[f] !== undefined) {
      if (f === 'rule') next.rule = cleanRecord({ element, rule: fields.rule }).rule;
      else if (f === 'calc') { const c = cleanRecord({ element, calc: fields.calc }).calc; if (fields.calc && !c) throw new ReasonError('bad_calc', 'The calc row "' + fields.calc + '" is not written sheet.row.', 'Use the form sheet.row, for example beams.M; calcs_list shows the rows.'); next.calc = c; }
      else next[f] = text(fields[f], LIMITS.text);
    }
    if (!old && map.size >= LIMITS.records) throw new ReasonError('full', 'There are already ' + LIMITS.records + ' reasons in this file.', 'Delete reasons for elements that are gone.');
    if (!filled(next)) { if (old) { map.delete(k); changed('remove'); } return null; }
    map.set(k, next); changed('set'); return next;
  }
  const get = (element) => map.get(typeof element === 'string' ? element : keyOf(element)) || null;
  function remove(element) { const k = typeof element === 'string' ? element : keyOf(element); const had = map.delete(k); if (had) changed('remove'); return had; }
  const list = ({ kind = null } = {}) => [...map.values()].filter((r) => !kind || r.element.kind === kind);

  /** The record with today's calc answer read in (never stored). */
  function view(element) {
    const r = get(element); if (!r) return null;
    const out = { ...r, rule: { ...r.rule } };
    if (r.calc && calcs && typeof calcs.valueOf === 'function') {
      const v = calcs.valueOf(r.calc);
      out.calcValue = !v ? { error: 'There is no calc row ' + r.calc + '.' } : v.ok ? { text: v.text, value: v.amount, unit: v.unit } : { error: typeof v.error === 'string' ? v.error : (v.error && v.error.message) || 'The row has an error.' };
    }
    return out;
  }
  /** Which records read this calc row ("sheet.row"): so the calc panel can say "used by 3 elements". */
  const usersOfCalc = (ref) => [...map.values()].filter((r) => r.calc === ref).map((r) => r.element);
  /** A plain-text summary a person (or a report) can read: one element's reasons, today's numbers. */
  function summary(element) {
    const v = view(element); if (!v) return '';
    const L = [];
    if (v.requirement) L.push('Requirement: ' + v.requirement);
    if (v.load) L.push('Load: ' + v.load);
    if (v.calc) L.push('Calc: ' + v.calc + (v.calcValue ? ' = ' + (v.calcValue.text || v.calcValue.error) : ''));
    const rt = [v.rule.text, [v.rule.pack, v.rule.clause].filter(Boolean).join(' ')].filter(Boolean).join(' — ');
    if (rt) L.push('Rule: ' + rt);
    if (v.decision) L.push('Decision: ' + v.decision);
    return L.join('\n');
  }

  /** The app says which elements should have a reason (e.g. every beam): [{kind, id, label}]. Missing ones become notes in Problems. */
  function setExpected(elements) {
    expect = new Map();
    for (const e of Array.isArray(elements) ? elements.slice(0, LIMITS.expect) : []) { const k = keyOf(e); if (k) expect.set(k, text(e.label, LIMITS.label)); }
    changed('expect');
  }
  /** Problem inputs for ccProblems (the shared shape, spec § 1): { code, severity, msg: {key, vars}, about, fixes }. */
  function problems() {
    const out = [];
    for (const [k, r] of map) {
      if (!r.calc || !calcs || typeof calcs.valueOf !== 'function') continue;
      const v = calcs.valueOf(r.calc);
      const about = [{ kind: r.element.kind, id: r.element.id, label: r.element.label || r.element.id }];
      if (!v) out.push({ code: 'reason.calc.missing', severity: 'warning', msg: { key: 'shell.reasons.p.missing', vars: { calc: r.calc, element: r.element.label || r.element.id } }, about });
      else if (!v.ok) out.push({ code: 'reason.calc.error', severity: 'warning', msg: { key: 'shell.reasons.p.error', vars: { calc: r.calc, element: r.element.label || r.element.id } }, about });
    }
    for (const [k, label] of expect) if (!map.has(k)) {
      const [kind, ...rest] = k.split(':'); const id = rest.join(':');
      out.push({ code: 'reason.none', severity: 'note', msg: { key: 'shell.reasons.p.none', vars: { element: label || id } }, about: [{ kind, id, label: label || id }] });
    }
    return out;
  }

  const api = {
    set, get, view, remove, list, usersOfCalc, summary, setExpected, problems, cleanRecord,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    touch() { changed('touch'); },
    count: () => map.size, empty: () => !map.size,
    save() { return { format: FORMAT, v: 1, records: [...map.values()].map((r) => ({ ...r, element: { ...r.element }, rule: { ...r.rule } })) }; },
    load(json, { quiet = false } = {}) {
      map = new Map();
      for (const r of Array.isArray(json && json.records) ? json.records.slice(0, LIMITS.records) : []) { const c = cleanRecord(r, 0); if (c && filled(c)) map.set(keyOf(c.element), c); }
      if (!quiet) changed('load'); return map.size;
    },
  };
  api.tools = (opts = {}) => reasonTools({ reasons: api, step: opts.step || step });
  return api;
}

/**
 * The assistants' tools (docs/AI-CONNECT-SPEC.md § 2): reasons_get, reasons_list (read; text comes from the file, so untrusted), reasons_set and
 * reasons_delete (edit, with a native preview, one undo step each).
 */
export function reasonTools({ reasons, step = null } = {}) {
  const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const S = (d, max = 80) => ({ type: 'string', maxLength: max, description: d });
  const run = (label, fn) => (typeof step === 'function' ? step(label, fn) : fn());
  const tool = (e) => Object.assign(new Error(e.message), { code: e.code || 'failed', next: e.next ? [e.next] : [] });
  const guard = (fn) => { try { return fn(); } catch (e) { if (e instanceof ReasonError) throw tool(e); throw e; } };
  const PAGE = { limit: { type: 'integer', minimum: 1, maximum: 200, description: 'How many to return; default 50.' }, offset: { type: 'integer', minimum: 0, maximum: 100000, description: 'How many to skip, from the total in the last answer.' } };
  const OUT = { type: 'object', description: 'What was changed and the undo label.', properties: { undo: { type: 'string', description: 'The undo step\'s label.' } } };
  const elem = { kind: S('The element\'s kind as the app names it, for example beam, wall, pipe.', 40), id: S('The element\'s id.', 80), label: S('A name people recognise, for example "Beam B3".', 120) };
  return [
    { name: 'reasons_get', group: 'read', title: 'Get an element\'s design reasons', untrusted: true,
      description: 'Returns why an element is what it is: the requirement, load, calc row (with today\'s answer), rule and decision note. Say "none" is the answer when no reason was written.',
      inputSchema: obj({ kind: elem.kind, id: elem.id }, ['kind', 'id']),
      run: (a) => { const v = reasons.view({ kind: a.kind, id: a.id }); return v ? { found: true, reason: v, text: reasons.summary({ kind: a.kind, id: a.id }) } : { found: false, next: 'No reason is written for this element. reasons_list shows the ones that have one; reasons_set writes one.' }; } },
    { name: 'reasons_list', group: 'read', title: 'List design reasons', untrusted: true,
      description: 'Lists the elements that have design reasons, with each one\'s decision note and calc answer. Filter by kind. Elements the app expects to have a reason but lack one are listed as missing.',
      inputSchema: obj({ kind: S('Only this kind of element.', 40), ...PAGE }),
      run: (a = {}) => { const all = reasons.list({ kind: a.kind || null }); const off = a.offset || 0, lim = a.limit || 50; const page = all.slice(off, off + lim).map((r) => reasons.view(r.element)); return { reasons: page, missing: reasons.problems().filter((p) => p.code === 'reason.none').map((p) => p.about[0]).slice(0, 100), total: all.length, returned: page.length, ...(off + lim < all.length ? { next: off + lim } : {}) }; } },
    { name: 'reasons_set', group: 'edit', title: 'Write design reasons', outputSchema: OUT,
      description: 'Writes or updates the reasons for one element; fields you leave out are kept. calc is a calc row as sheet.row. One undo step.',
      inputSchema: obj({ ...elem, requirement: S('What the element must satisfy.', 600), load: S('The load or demand on it.', 600), calc: S('The calc row that sizes it, as sheet.row.', 90), rule: S('The rule or clause, for example "IRC R602.7 header table".', 600), decision: S('The decision note: why this size or choice.', 600) }, ['kind', 'id']),
      preview: (a) => guard(() => { const t = createReasons({ calcs: null }); t.load(reasons.save(), { quiet: true }); t.set({ kind: a.kind, id: a.id, label: a.label }, { requirement: a.requirement, load: a.load, calc: a.calc, rule: a.rule, decision: a.decision }); return { element: a.kind + ':' + a.id, existed: !!reasons.get({ kind: a.kind, id: a.id }), after: t.summary({ kind: a.kind, id: a.id }) }; }),
      run: (a) => guard(() => run('Design reasons: ' + (a.label || a.id), () => { const r = reasons.set({ kind: a.kind, id: a.id, label: a.label }, { requirement: a.requirement, load: a.load, calc: a.calc, rule: a.rule, decision: a.decision }, { by: 'assistant' }); return { element: a.kind + ':' + a.id, saved: !!r, undo: 'Design reasons: ' + (a.label || a.id) }; })) },
    { name: 'reasons_delete', group: 'edit', title: 'Delete design reasons', outputSchema: OUT,
      description: 'Deletes the written reasons for one element (the element itself stays). One undo step.',
      inputSchema: obj({ kind: elem.kind, id: elem.id }, ['kind', 'id']),
      preview: (a) => ({ element: a.kind + ':' + a.id, exists: !!reasons.get({ kind: a.kind, id: a.id }) }),
      run: (a) => guard(() => run('Delete design reasons', () => { const had = reasons.remove({ kind: a.kind, id: a.id }); if (!had) throw new ReasonError('not_found', 'No reason is written for ' + a.kind + ':' + a.id + '.', 'Call reasons_list for the elements that have one.'); return { deleted: a.kind + ':' + a.id, undo: 'Delete design reasons' }; })) },
  ];
}
