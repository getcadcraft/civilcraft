/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-reasons.js — design reasons in every app (round 2, session shell_PART_2, EG.34; map docs/apps/shell-modules.md § Design reasons): the page
 * side of reasons.js. Loaded by app-shell.inc for a build whose manifest says "reasons": true (AppBuilds::extras; dev builds only).
 * Reads #cc-reasons {app, appName}.
 *
 * A record per element — the requirement it meets, the load it carries, the calc sheet row that sizes it (read live from ccCalc, never pasted),
 * the rule and the decision note. The panel shows the record of whatever the app has selected, and the list of every record. As with calc
 * sheets, the shell never touches the app's file:
 *
 *   window.ccReasons = {
 *     attach({ selection, onSelection, select, expected, persist, step }) → reasons
 *        selection()      → { kind, id, label } | null     what is selected now (the first one when several)
 *        onSelection(fn)  → off                            fn() when the selection changes
 *        select(element)  the panel asks the app to select + zoom to an element (a click on a record in the list)
 *        expected()       → [{ kind, id, label }]          optional: elements that should have a reason (every beam); the missing ones
 *                                                           become notes in Problems
 *        persist(json)    the app stores `json` inside its own file (debounced)
 *        step(label, fn)  the app's ONE undo step
 *     load(json) · save() → json | null · reasons (the store) · open() · close() · toggle()
 *     registerTools(control, opts)   reasons_get / list / set / delete for an app's host.control
 *   }
 * Apps that load before this module wait for it: `window.ccReasons ? go() : addEventListener('cc-reasons-ready', go, { once: true })`.
 * Gaps go to the shared Problems panel (rule 29) when it is there: a reason whose calc row is gone or in error is a warning, an expected element
 * without a reason is a note. Words: shell.reasons.* in assets/lang/shell.
 */
import { createReasons } from './reasons.js';
import { T, h, readCfg, makePanel, palette, registerTools } from './app-tools-ui.js';

const cfg = readCfg('cc-reasons');
if (cfg && cfg.app && !window.ccReasons) boot();

function boot() {
  let adapter = { selection: null, onSelection: null, select: null, expected: null, persist: null, step: null };
  let attached = false, persistTimer = null, offSel = () => {}, msg = '';
  const stepProxy = (label, fn) => (typeof adapter.step === 'function' ? adapter.step(label, fn) : fn());
  const calcsNow = () => (window.ccCalc && window.ccCalc.calcs) || null;
  // the store reads calc rows through a proxy, so it follows ccCalc whenever that attaches or is rebuilt
  const calcsProxy = { valueOf: (ref) => { const c = calcsNow(); return c ? c.valueOf(ref) : null; } };
  const reasons = createReasons({ calcs: calcsProxy, step: stepProxy });
  let src = null;

  const P = makePanel({ key: 'reasons', icon: 'chat-left-text', titleKey: 'shell.reasons.title', onOpen: () => render() });
  P.btn.title = T('shell.reasons.button.title');

  function queuePersist() {
    if (!adapter.persist) return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { try { adapter.persist(reasons.empty() ? null : reasons.save()); } catch (e) { /* the app's own trouble */ } }, 250);
  }
  function syncProblems() {
    const pr = window.ccProblems;
    if (!pr || !pr.source) return;
    const list = reasons.problems();
    if (!src && !list.length) return;   // a source with nothing to say would show the ⚠ button in every app
    if (!src) src = pr.source({ id: 'design-reasons', kind: 'check', label: T('shell.reasons.title') });
    src.set(list);
  }
  reasons.on((why) => { if (why !== 'load' && why !== 'touch' && why !== 'expect') queuePersist(); syncProblems(); render(); });
  document.addEventListener('cc-problems-ready', syncProblems, { once: true });
  window.addEventListener('cc-calc-ready', () => reasons.touch(), { once: true });

  const current = () => { try { return adapter.selection ? adapter.selection() : null; } catch (e) { return null; } };
  const keyOf = (el) => el.kind + ':' + el.id;

  function field(label, k, value, { area = false, list = null } = {}) {
    const id = 'cct-r-' + k;
    const input = h(area ? 'textarea' : 'input', { id, class: 'cct-in', 'data-k': k, rows: area ? 2 : null, value: area ? null : value || '', list, spellcheck: 'true', maxlength: '600' });
    if (area) input.value = value || '';
    return h('div', { class: 'cct-f' }, h('label', { for: id, text: label }), input);
  }

  function render() {
    P.btn.dataset.has = reasons.empty() ? '' : '1';
    if (P.panel.hidden) return;
    const sel = current();
    P.sum.textContent = reasons.count() ? T('shell.reasons.sum', { n: reasons.count() }) : '';
    const kids = [];
    if (!attached) kids.push(h('p', { class: 'cct-note', text: T('shell.reasons.unattached') }));
    if (!sel) kids.push(h('p', { class: 'cct-empty', text: T('shell.reasons.pick') }));
    else {
      const v = reasons.view(sel) || { element: sel, rule: {} };
      const rows = (calcsNow() && calcsNow().sheets().flatMap((s) => s.rows.filter((r) => r.name).map((r) => s.id + '.' + r.name))) || [];
      const dl = h('datalist', { id: 'cct-r-calcs' }, rows.slice(0, 300).map((r) => h('option', { value: r })));
      const form = h('form', { class: 'cct-form', 'data-k': 'form', onsubmit: (e) => { e.preventDefault(); save(sel, form); } },
        h('p', { class: 'cct-el' }, h('strong', { text: sel.label || sel.id }), ' ', h('small', { text: sel.kind })),
        field(T('shell.reasons.requirement'), 'requirement', v.requirement, { area: true }),
        field(T('shell.reasons.load'), 'load', v.load, { area: true }),
        field(T('shell.reasons.calc'), 'calc', v.calc, { list: 'cct-r-calcs' }), dl,
        v.calc && v.calcValue ? h('p', { class: v.calcValue.error ? 'cct-err' : 'cct-val', text: v.calcValue.error ? v.calcValue.error : v.calc + ' = ' + v.calcValue.text }) : null,
        field(T('shell.reasons.rule'), 'rule', v.rule && v.rule.text, {}),
        h('div', { class: 'cct-row2' }, field(T('shell.reasons.pack'), 'pack', v.rule && v.rule.pack), field(T('shell.reasons.clause'), 'clause', v.rule && v.rule.clause)),
        field(T('shell.reasons.decision'), 'decision', v.decision, { area: true }),
        h('div', { class: 'cct-bar' }, h('button', { type: 'submit', class: 'cct-btn cct-primary', 'data-k': 'save' }, T('shell.reasons.save')),
          reasons.get(sel) ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'remove', onclick: () => { stepProxy(T('shell.reasons.undo.delete'), () => reasons.remove(sel)); } }, T('shell.reasons.remove')) : null));
      kids.push(form);
    }
    if (msg) kids.push(h('p', { class: 'cct-err', role: 'alert', text: msg }));
    const all = reasons.list();
    if (all.length) {
      kids.push(h('h3', { class: 'cct-sub', text: T('shell.reasons.all') }));
      kids.push(h('ul', { class: 'cct-list' }, all.slice(0, 200).map((r) => h('li', {}, h('button', { type: 'button', class: 'cct-link', 'data-reason': keyOf(r.element), onclick: () => { if (adapter.select) adapter.select(r.element); else render(); } },
        h('strong', { text: r.element.label || r.element.id }), ' ', h('small', { text: r.element.kind }), r.decision ? h('span', { class: 'cct-snip', text: ' — ' + r.decision.slice(0, 80) }) : null)))));
    }
    P.body.replaceChildren(...kids);
  }

  function save(sel, form) {
    const val = (k) => form.querySelector('[data-k="' + k + '"]').value;
    try {
      stepProxy(T('shell.reasons.undo.set', { name: sel.label || sel.id }), () => reasons.set(sel, { requirement: val('requirement'), load: val('load'), calc: val('calc').trim(), rule: { text: val('rule'), pack: val('pack'), clause: val('clause') }, decision: val('decision') }));
      msg = '';
    } catch (e) { msg = e.message + (e.next ? ' ' + e.next : ''); }
    render();
  }

  const api = {
    reasons,
    attach(a = {}) {
      offSel(); adapter = { selection: a.selection || null, onSelection: a.onSelection || null, select: a.select || null, expected: a.expected || null, persist: a.persist || null, step: a.step || null };
      attached = !!adapter.persist;
      offSel = adapter.onSelection ? (adapter.onSelection(() => render()) || (() => {})) : () => {};
      if (adapter.expected) { try { reasons.setExpected(adapter.expected()); } catch (e) { /* the app's own trouble */ } }
      render(); return reasons;
    },
    load(json) { reasons.load(json); render(); },
    save() { return reasons.empty() ? null : reasons.save(); },
    refresh() { if (adapter.expected) { try { reasons.setExpected(adapter.expected()); } catch (e) { /* ignore */ } } render(); },
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    registerTools(control, opts = {}) { return registerTools(control, reasons.tools({ step: opts.step || adapter.step }), opts.skip); },
    tools: (opts = {}) => reasons.tools({ step: opts.step || adapter.step }),
    state: () => ({ attached, open: P.isOpen, records: reasons.count() }),
    // 0.8 LC.2: the Team panel pins issues to what the app has selected, and shows an issue's element, through the same adapter (no second mount in the app)
    selected: () => current(),
    selectElement: (el) => { if (adapter.select) adapter.select(el); return !!adapter.select; },
  };
  window.ccReasons = api;
  palette({ id: 'cc-reasons-open', label: T('shell.reasons.palette'), group: T('shell.reasons.title'), keywords: 'why decision requirement load rule design reasons', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-reasons-ready'));
  syncProblems(); render();
}
