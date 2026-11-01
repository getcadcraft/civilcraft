/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-ai-activity.js — the assistants' activity log in plain words (round 2, session ai-trust_PART_2, AC.13; map docs/AI-TRUST-SPEC.md § 2): the page side of ai-activity.js. Loaded by
 * app-shell.inc for a build whose manifest says "ai-activity": true (AppBuilds::extras; dev builds only). Reads #cc-ai-activity {app, appName}.
 *
 * Every call an assistant makes in this window — reads, previews, suggestions, accepted and rejected ones, edits, saves, exports, refusals — is a
 * sentence ("Claude added 3 objects in CadCraft — done."). The panel filters by assistant and kind, takes a change back through the undo
 * step it made, opens the file's history at that moment, and exports what it shows as CSV, JSON or plain text. In Studio the hub window
 * adds every app's entries (`merge`), so one list spans the suite. Settings › Assistants › Activity keeps its short per-window list.
 *
 *   window.ccActivity = {
 *     attach({ control, rev, document, undoTo, history, version }) → log
 *        control      the app's host.control: its 'call' events feed the log
 *        rev()        optional: the undo stack depth now (linked to each change)
 *        document()   optional → { name }: the file the app shows
 *        undoTo(i)    optional: undo until the stack is at depth i (a change's `undoIndex`); without it "Undo" is not offered
 *        history(doc, version)  optional: open the file's history at that version (browser: version history; Studio: the cloud copy)
 *        version()    optional → the file's current version id, kept on each change so history can open it
 *     add(entry) · merge(entries) · log · open() · close() · toggle() · export(format)
 *   }
 * Apps that load before this module wait for it: `window.ccActivity ? go() : addEventListener('cc-activity-ready', go, { once: true })`.
 */
import { createActivityLog } from './ai-activity.js';
import { T, h, readCfg, makePanel, palette } from './app-tools-ui.js';
import { aiStyles } from './app-ai-ui.js';

const cfg = readCfg('cc-ai-activity');
if (cfg && cfg.app && !window.ccActivity) boot();

const KEY = 'cadcraft.activity.';
function boot() {
  aiStyles();
  const log = createActivityLog({});
  try { const saved = localStorage.getItem(KEY + cfg.app); if (saved) log.load(saved); } catch (e) { /* private window */ }
  let adapter = { control: null, rev: null, document: null, undoTo: null, history: null, version: null };
  let filter = { client: '', kind: 'changes', q: '' };
  let off = () => {}, saveTimer = null, hasSuggest = () => !!(window.ccSuggest && window.ccSuggest.store);
  const P = makePanel({ key: 'activity', icon: 'journal-text', titleKey: 'shell.activity.title', buttonKey: 'shell.activity.button', hidden: true, onOpen: () => render() });
  P.btn.title = T('shell.activity.button.title');

  const persist = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(KEY + cfg.app, log.save()); } catch (e) { /* full or private */ } }, 400); };
  log.on((why) => { persist(); if (why !== 'load') render(); });

  const docName = () => { try { const d = adapter.document ? adapter.document() : null; return d && d.name ? d.name : null; } catch (e) { return null; } };
  function fromDispatcher(e) {
    if (!e || typeof e !== 'object') return;
    if (e.outcome === 'suggested' && hasSuggest()) return;   // the Suggest store logs it with its change set and summary
    // read the entry after every other 'call' listener has run: Studio Live tags `entry.live` in its own listener on the same object (studio/hub/live/window-live.js)
    Promise.resolve().then(() => log.add({ app: cfg.app, ...e, document: docName(), version: adapter.version ? adapter.version() : undefined, undoIndex: e.undo && adapter.rev ? adapter.rev() : undefined }));
  }

  const fmt = (t) => new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  function rowEl(r) {
    const w = log.words(r), lk = log.link(r);
    const canUndo = lk.canUndo && typeof adapter.undoTo === 'function' && lk.undoIndex !== null;
    return h('li', { class: 'cct-ac-row is-' + r.outcome + ' k-' + r.kind, 'data-n': r.n },
      h('small', { class: 'cct-snip', text: fmt(r.time) }), ' ',
      h('span', { class: 'cct-ac-text', text: w.text }),
      lk.document ? h('small', { class: 'cct-snip', text: ' ' + T('shell.activity.in.file', { file: lk.document }) }) : null,
      lk.undo ? h('small', { class: 'cct-snip', text: ' ' + T('shell.assistants.undo', { label: lk.undo }) }) : null,
      canUndo ? h('button', { type: 'button', class: 'cct-ib', 'data-k': 'undo', title: T('shell.activity.undo.title'), onclick: () => { try { adapter.undoTo(lk.undoIndex - 1); } catch (e) { /* the app says why */ } } }, T('shell.activity.undo')) : null,
      lk.document && lk.version && typeof adapter.history === 'function' ? h('button', { type: 'button', class: 'cct-ib', 'data-k': 'history', title: T('shell.activity.history.title'), onclick: () => adapter.history(lk.document, lk.version) }, T('shell.activity.history')) : null);
  }

  function download(format) {
    const x = log.export(format, filterNow());
    const url = URL.createObjectURL(new Blob([x.text], { type: x.type }));
    const a = h('a', { href: url, download: x.name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const filterNow = () => ({ client: filter.client || undefined, kind: filter.kind, q: filter.q || undefined });

  function render() {
    P.btn.dataset.n = String(log.size);
    P.show(!!adapter.control && (log.size > 0 || P.isOpen || adapter.control.enabled));
    if (P.panel.hidden) return;
    const rows = log.list(filterNow());
    P.sum.textContent = T('shell.activity.sum', { n: rows.length });
    const clients = log.clients();
    const sel = h('select', { class: 'cct-in', 'data-k': 'client', 'aria-label': T('shell.activity.who'), onchange: (e) => { filter.client = e.target.value; render(); } },
      h('option', { value: '', text: T('shell.activity.who.all') }), ...clients.map((c) => h('option', { value: c, selected: c === filter.client, text: c })));
    const kind = h('select', { class: 'cct-in', 'data-k': 'kind', 'aria-label': T('shell.activity.kind'), onchange: (e) => { filter.kind = e.target.value; render(); } },
      ...['changes', 'reads', 'all'].map((k) => h('option', { value: k, selected: k === filter.kind, text: T('shell.activity.kind.' + k) })));
    const q = h('input', { class: 'cct-in', type: 'search', 'data-k': 'q', value: filter.q, placeholder: T('shell.activity.search'), 'aria-label': T('shell.activity.search'), oninput: (e) => { filter.q = e.target.value; clearTimeout(q._t); q._t = setTimeout(render, 200); } });
    const kids = [h('div', { class: 'cct-bar' }, sel, kind, q)];
    const sm = log.summary(filterNow());
    if (sm.length) kids.push(h('ul', { class: 'cct-list cct-ac-sum' }, sm.map((s) => h('li', { text: T('shell.activity.sum.line', { who: s.client, changes: s.changes, suggestions: s.suggestions, reads: s.reads }) }))));
    kids.push(rows.length ? h('ol', { class: 'cct-list cct-ac-list', 'data-k': 'list' }, rows.slice(0, 300).map(rowEl)) : h('p', { class: 'cct-empty', text: T('shell.activity.empty') }));
    if (rows.length > 300) kids.push(h('p', { class: 'cct-note', text: T('shell.activity.more', { n: rows.length - 300 }) }));
    kids.push(h('div', { class: 'cct-bar' },
      ...['csv', 'json', 'txt'].map((f) => h('button', { type: 'button', class: 'cct-btn', 'data-k': 'export-' + f, onclick: () => download(f) }, T('shell.activity.export.' + f))),
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'clear', onclick: () => { log.clear(); } }, T('shell.activity.clear'))));
    kids.push(h('p', { class: 'cct-note', text: T('shell.activity.note') }));
    P.body.replaceChildren(...kids);
  }

  const api = {
    attach(a = {}) {
      off(); adapter = { control: a.control || null, rev: a.rev || null, document: a.document || null, undoTo: a.undoTo || null, history: a.history || null, version: a.version || null };
      off = adapter.control && typeof adapter.control.on === 'function' ? adapter.control.on('call', fromDispatcher) || (() => {}) : () => {};
      render(); return log;
    },
    add(e) { return log.add(e); },
    merge(list) { return log.merge(list); },
    get log() { return log; },
    export: (f) => log.export(f, filterNow()),
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    state: () => ({ attached: !!adapter.control, open: P.isOpen, entries: log.size }),
  };
  window.ccActivity = api;
  palette({ id: 'cc-activity-open', label: T('shell.activity.palette'), group: T('shell.activity.title'), keywords: 'activity log assistant ai history export what did', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-activity-ready'));
  render();
}
