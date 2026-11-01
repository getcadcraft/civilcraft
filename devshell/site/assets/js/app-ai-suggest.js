/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-ai-suggest.js — Suggest mode in every app (round 2, session ai-trust_PART_2, AC.12; map docs/AI-TRUST-SPEC.md § 1): the page side of ai-suggest.js. Loaded by app-shell.inc for a
 * build whose manifest says "ai-suggest": true (AppBuilds::extras; dev builds only). Reads #cc-ai-suggest {app, appName}.
 *
 * An assistant allowed to Suggest (not Edit) leaves its changes here as a change set. The panel lists each set — who, what, how much — and
 * lets the person look at it on the drawing (the app's ghost adapter draws it, or highlights the objects), then accept or reject it whole or
 * item by item. Accepting is ONE undo step labelled "Assistant: …". "This project" narrows what assistants may do in the open file.
 *
 *   window.ccSuggest = {
 *     attach({ control, ghost, rev, step, document, perms }) → store
 *        control   the app's host.control (configure, apply, tool, step) — the same call each app makes for the shell's other tools
 *        ghost     optional { show(items, {focus}), clear(), focus(item) }: draws pending items over the drawing or model
 *        rev()     optional: a number that changes whenever the document does (the undo stack length)
 *        step      optional (label, fn): the app's ONE undo step (defaults to control.step)
 *        document  optional () → { docId, path, name }: the open file, for the project key
 *        perms     optional { get() → the stored record, set(record) }: the app's assistants record (cadcraft.assistants.<app>)
 *     reset(why)   the app opened another file: pending suggestions close instead of applying to it
 *     store · open() · close() · toggle() · counts()
 *     registerTools(control)   suggestions_list for an assistant
 *   }
 * Apps that load before this module wait for it: `window.ccSuggest ? go() : addEventListener('cc-suggest-ready', go, { once: true })`.
 */
import { createSuggestions, registerTools as suggestTools } from './ai-suggest.js';
import { effective, setProject, projectKey, editMode } from './assist-perms.js';
import { T, h, readCfg, makePanel, palette } from './app-tools-ui.js';
import { aiStyles } from './app-ai-ui.js';

const cfg = readCfg('cc-ai-suggest');
if (cfg && cfg.app && !window.ccSuggest) boot();

function boot() {
  aiStyles();
  let adapter = { control: null, ghost: null, rev: null, step: null, document: null, perms: null };
  let sug = null, offStore = () => {};
  let open = new Set();   // set ids shown expanded
  const P = makePanel({ key: 'suggest', icon: 'lightbulb', titleKey: 'shell.suggest.title', buttonKey: 'shell.suggest.button', hidden: true, onOpen: () => render() });
  P.btn.title = T('shell.suggest.button.title');

  const stepOf = (label, fn) => (adapter.step ? adapter.step(label, fn) : adapter.control && adapter.control.step ? adapter.control.step(label, fn) : fn());
  const say = (e) => (window.ccActivity && window.ccActivity.add ? window.ccActivity.add({ app: cfg.app, ...e, undoIndex: adapter.rev ? adapter.rev() : undefined, document: docName() }) : null);
  const docName = () => { try { const d = adapter.document ? adapter.document() : null; return d && d.name ? d.name : null; } catch (e) { return null; } };

  function make() {
    sug = createSuggestions({
      app: cfg.app,
      rev: () => (adapter.rev ? adapter.rev() : null),
      step: (label, fn) => stepOf(label, fn),
      log: say,
      ghost: adapter.ghost,
      apply: async (item, set) => {
        const c = adapter.control;
        if (!c || typeof c.apply !== 'function') { const e = new Error(T('shell.suggest.noapply')); throw e; }
        const r = await c.apply(item.tool, item.args, { client: { name: set.client || T('shell.assistants.someone') } });
        if (r && r.isError) throw new Error(r.structuredContent && r.structuredContent.error ? r.structuredContent.error.message : T('shell.suggest.failed'));
        return r && r.structuredContent !== undefined ? r.structuredContent : r;
      },
    });
    offStore = sug.on(() => { badge(); render(); });
  }

  function badge() {
    const n = sug ? sug.counts().items : 0;
    P.btn.dataset.count = n ? String(n) : '';
    P.btn.querySelector('.app-bar-btn-label').textContent = n ? T('shell.suggest.button.n', { n }) : T('shell.suggest.button');
    P.show(!!(adapter.control && (n || P.isOpen || adapter.control.groups.includes('suggest'))));
  }

  const when = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  function words(item) {
    const s = item.summary || {};
    const parts = [];
    if (s.added) parts.push(T('shell.suggest.n.added', { n: s.added }));
    if (s.changed) parts.push(T('shell.suggest.n.changed', { n: s.changed }));
    if (s.removed) parts.push(T('shell.suggest.n.removed', { n: s.removed }));
    return item.title + (parts.length ? ' — ' + parts.join(', ') : '');
  }

  function itemRow(set, it) {
    const done = it.state !== 'pending';
    return h('li', { class: 'cct-sg-item is-' + it.state + (it.stale ? ' is-stale' : ''), 'data-item': it.id },
      h('button', { type: 'button', class: 'cct-link', 'data-k': 'show', onclick: () => sug.focus(it.id), title: T('shell.suggest.show.title') }, words(it)),
      it.stale ? h('small', { class: 'cct-note', text: ' ' + T('shell.suggest.stale') }) : null,
      done ? h('small', { class: it.state === 'failed' ? 'cct-err' : 'cct-snip', text: ' ' + T('shell.suggest.state.' + it.state) + (it.error ? ': ' + it.error : '') }) : h('span', { class: 'cct-act' },
        h('button', { type: 'button', class: 'cct-ib', 'data-k': 'accept-item', title: T('shell.suggest.accept.item'), 'aria-label': T('shell.suggest.accept.item'), onclick: () => run(() => sug.accept(set.id, [it.id])) }, h('i', { class: 'bi bi-check-lg', 'aria-hidden': 'true' })),
        h('button', { type: 'button', class: 'cct-ib', 'data-k': 'reject-item', title: T('shell.suggest.reject.item'), 'aria-label': T('shell.suggest.reject.item'), onclick: () => sug.reject(set.id, [it.id]) }, h('i', { class: 'bi bi-x-lg', 'aria-hidden': 'true' }))));
  }

  let busy = false, msg = '';
  async function run(fn) { if (busy) return; busy = true; msg = ''; render(); try { const r = await fn(); if (r && r.failed) msg = T('shell.suggest.some.failed', { n: r.failed }); } catch (e) { msg = e.message; } busy = false; render(); }

  function projectBox() {
    const p = adapter.perms; if (!p) return null;
    let rec = null, key = null;
    try { rec = p.get(); const d = adapter.document ? adapter.document() : null; key = d ? projectKey(d, rec && rec.folders) : null; } catch (e) { return null; }
    if (!key) return h('p', { class: 'cct-note', text: T('shell.suggest.project.none') });
    const eff = effective(rec, key), app = effective(rec, null);
    const mode = !rec.projects || !rec.projects[key] ? 'same' : editMode(eff) === 'edit' ? 'same' : editMode(eff) === 'suggest' ? 'suggest' : 'read';
    const pick = (m) => {
      let r2;
      if (m === 'same') r2 = setProject(rec, key, null);
      else r2 = setProject(rec, key, { groups: m === 'suggest' ? ['read', 'suggest'] : ['read'] });
      p.set(r2); render();
    };
    const opts = [['same', T('shell.suggest.project.same', { groups: app.groups.join(', ') })], ['suggest', T('shell.suggest.project.suggest')], ['read', T('shell.suggest.project.read')]];
    return h('fieldset', { class: 'cct-f cct-sg-project' }, h('legend', { text: T('shell.suggest.project') }),
      ...opts.map(([v, l]) => h('label', { class: 'cct-check' }, h('input', { type: 'radio', name: 'cct-sg-project', value: v, checked: mode === v, 'data-k': 'project-' + v, onchange: () => pick(v) }), ' ' + l)),
      h('small', { class: 'cct-note', text: T('shell.suggest.project.hint') }));
  }

  function render() {
    badge();
    if (P.panel.hidden || !sug) return;
    const sets = sug.list().slice().reverse();
    const c = sug.counts();
    P.sum.textContent = c.items ? T('shell.suggest.sum', { n: c.items }) : '';
    const kids = [];
    if (!adapter.control) kids.push(h('p', { class: 'cct-note', text: T('shell.suggest.unattached') }));
    if (!sets.length) kids.push(h('p', { class: 'cct-empty', text: T('shell.suggest.empty') }));
    if (c.stale) kids.push(h('p', { class: 'cct-note', text: T('shell.suggest.stale.some', { n: c.stale }) }));
    for (const s of sets) {
      const pending = s.items.filter((i) => i.state === 'pending').length;
      kids.push(h('section', { class: 'cct-sg-set is-' + s.state, 'data-set': s.id },
        h('h3', { class: 'cct-sub' }, h('strong', { text: s.client || T('shell.assistants.someone') }), ' ', h('small', { class: 'cct-snip', text: when(s.createdAt) }), ' ', h('small', { text: T('shell.suggest.state.' + s.state) })),
        h('p', { class: 'cct-el', text: s.title }),
        h('ul', { class: 'cct-list' }, s.items.map((i) => itemRow(s, i))),
        pending ? h('div', { class: 'cct-bar' },
          h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'accept', disabled: busy, onclick: () => run(() => sug.accept(s.id)) }, pending === s.items.length ? T('shell.suggest.accept.all') : T('shell.suggest.accept.rest', { n: pending })),
          h('button', { type: 'button', class: 'cct-btn', 'data-k': 'reject', disabled: busy, onclick: () => sug.reject(s.id) }, T('shell.suggest.reject.all'))) : null));
    }
    if (msg) kids.push(h('p', { class: 'cct-err', role: 'alert', text: msg }));
    if (sets.some((s) => s.state !== 'pending' && s.state !== 'partial')) kids.push(h('div', { class: 'cct-bar' }, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'clear', onclick: () => sug.clearDone() }, T('shell.suggest.clear'))));
    const pb = projectBox(); if (pb) kids.push(pb);
    P.body.replaceChildren(...kids);
  }

  const api = {
    attach(a = {}) {
      offStore(); adapter = { control: a.control || null, ghost: a.ghost || null, rev: a.rev || null, step: a.step || null, document: a.document || null, perms: a.perms || null };
      make();
      if (adapter.control && typeof adapter.control.configure === 'function') {
        adapter.control.configure({ suggest: sug.suggest });
        // the per-file rule is enforced by the dispatcher itself (host.js ruleOf), not only shown here (ai_PART_3)
        if (adapter.perms) adapter.control.configure({ rules: () => {
          const rec = adapter.perms.get(), d = adapter.document ? adapter.document() : null;
          const e = effective(rec, d ? projectKey(d, rec && rec.folders) : null);
          return e.enabled ? { groups: e.groups, folders: e.folders } : null;   // a record that is off is not a project rule: the dispatcher's own switch decides (a script's configure() that never saved prefs stays enabled)
        } });
      }
      if (adapter.control && typeof adapter.control.on === 'function') adapter.control.on('change', () => badge());
      badge(); render(); return sug;
    },
    reset(why) { return sug ? sug.reset(why) : 0; },
    get store() { return sug; },
    counts: () => (sug ? sug.counts() : { sets: 0, items: 0, stale: 0 }),
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    registerTools(control) { return suggestTools(control, sug); },
    state: () => ({ attached: !!adapter.control, open: P.isOpen, pending: api.counts().items }),
  };
  window.ccSuggest = api;
  palette({ id: 'cc-suggest-open', label: T('shell.suggest.palette'), group: T('shell.suggest.title'), keywords: 'suggestions assistant ai change set accept reject', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-suggest-ready'));
}
