/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-docinfo.js — "Drawing details" in every app (0.9 DI.1; map docs/apps/shell-modules.md § Drawing details): the page side of docinfo.js. Loaded by
 * app-shell.inc for a build whose manifest says "docinfo": true (AppBuilds::extras; dev builds only). Reads #cc-docinfo {app, appName}.
 *
 * The panel shows what the person wrote (title, subject, author, company, keywords, comments — kept in the app's own file) and what the app
 * counts (size, units, entities, triangles, elements, layers …, the file's size). The shell never touches the app's file:
 *
 *   window.ccDocInfo = {
 *     attach({ read, persist, step, name, onChange }) → store
 *        read()         → { units, extents: { min: [x, y, z?], max: [x, y, z?] }, counts: { entities, triangles, elements, layers, … },
 *                           extra: [{ label, value }], bytes, path }   every part optional; leave out what the app cannot count (never 0)
 *        persist(json)  the app stores `json` inside its own file (debounced)
 *        step(label, fn)  the app's ONE undo step (assistants' edits)
 *        name()         → the person's name for "Last saved by" (default: the signed-in account's)
 *        onChange(fn)   → off   fn() when the drawing changes (default: the panel re-reads every 2 s while open)
 *     load(json) · save() → json | null   save() stamps the save time + revision: call it where the app serializes the file
 *     open() · close() · toggle() · refresh()
 *     registerTools(control, opts)   docinfo_get / docinfo_set for an app's host.control
 *   }
 * Apps that load before this module wait for it: `window.ccDocInfo ? go() : addEventListener('cc-docinfo-ready', go, { once: true })`.
 * Words: shell.docinfo.* in assets/lang/shell.
 */
import { createDocInfo, summarize, formatBytes, formatCount, docinfoTools, FIELDS, LIMITS, STAGES, SIGNOFF_KINDS } from './docinfo.js';
import { T, h, readCfg, makePanel, palette, registerTools } from './app-tools-ui.js';

const cfg = readCfg('cc-docinfo');
if (cfg && cfg.app && !window.ccDocInfo) boot();

function boot() {
  let adapter = { read: null, persist: null, step: null, name: null, onChange: null };
  let attached = false, persistTimer = null, offChange = () => {}, poll = null;
  const lang = document.documentElement.lang || undefined;
  const who = () => { try { const n = adapter.name ? adapter.name() : null; if (n) return String(n); } catch { /* the app's own trouble */ } try { return JSON.parse(document.getElementById('cc-account')?.textContent || 'null')?.name || ''; } catch { return ''; } };
  const stepProxy = (label, fn) => (typeof adapter.step === 'function' ? adapter.step(label, fn) : fn());
  const info = createDocInfo();

  const P = makePanel({ key: 'docinfo', icon: 'info-circle', titleKey: 'shell.docinfo.title', onOpen: () => { render(); startPoll(); }, onClose: () => stopPoll() });
  P.btn.title = T('shell.docinfo.button.title');

  const read = () => { try { return adapter.read ? adapter.read() : null; } catch (e) { return null; } };
  function queuePersist() {
    if (!adapter.persist) return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { try { adapter.persist(info.save()); } catch (e) { /* the app's own trouble */ } }, 250);
  }
  info.on((why) => { if (why === 'set' || why === 'signoff') queuePersist(); });

  const date = (ms) => { try { return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms)); } catch { return new Date(ms).toISOString(); } };
  const row = (k, v) => (v === '' || v === null || v === undefined ? null : [h('dt', { text: k }), h('dd', { text: v })]);
  const countLabel = (id, extra) => { const k = 'shell.docinfo.count.' + id; const t = T(k); return t === k ? (extra && extra[id]) || id : t; };

  function facts() {
    const s = summarize(read(), lang), p = info.get();
    const rows = [];
    const push = (r) => { if (r) rows.push(...r); };
    push(row(T('shell.docinfo.path'), s.path));
    push(row(T('shell.docinfo.bytes'), s.bytes === null ? '' : formatBytes(s.bytes)));
    push(row(T('shell.docinfo.size'), s.size ? s.size.text : ''));
    push(row(T('shell.docinfo.units'), s.units));
    for (const c of s.counts) push(row(countLabel(c.id), formatCount(c.n, lang)));
    for (const e of s.extra) push(row(e.label, e.value));
    push(row(T('shell.docinfo.created'), p.created ? date(p.created) : ''));
    push(row(T('shell.docinfo.modified'), p.modified ? date(p.modified) : ''));
    push(row(T('shell.docinfo.modifiedby'), p.modified ? p.modifiedBy : ''));
    push(row(T('shell.docinfo.revision'), p.revision ? formatCount(p.revision, lang) : ''));
    return rows.length ? h('dl', { class: 'cct-facts', 'data-k': 'facts' }, rows) : h('p', { class: 'cct-empty', text: T('shell.docinfo.nothing') });
  }

  const LABEL = { title: 'shell.docinfo.f.title', subject: 'shell.docinfo.f.subject', author: 'shell.docinfo.f.author', company: 'shell.docinfo.f.company', keywords: 'shell.docinfo.f.keywords', comments: 'shell.docinfo.f.comments' };
  function field(k, value) {
    const area = k === 'comments', id = 'cct-di-' + k;
    const input = h(area ? 'textarea' : 'input', { id, class: 'cct-in', 'data-k': k, rows: area ? 3 : null, value: area ? null : value || '', spellcheck: 'true', maxlength: String(LIMITS[k]) });
    if (area) input.value = value || '';
    return h('div', { class: 'cct-f' }, h('label', { for: id, text: T(LABEL[k]) }), input);
  }

  // BK.144: a person signs off an estimate or an audit (who and when stay in the file); no tool can. BK.143: the apps' unverified elements, which only a person clears.
  function signoffBlock() {
    const rows = SIGNOFF_KINDS.map((kind) => {
      const st = info.signoff(kind);
      const name = h('input', { class: 'cct-in', 'data-k': 'so-by-' + kind, value: who(), maxlength: String(LIMITS.by), 'aria-label': T('shell.docinfo.signoff.by') });
      const note = h('input', { class: 'cct-in', 'data-k': 'so-note-' + kind, maxlength: String(LIMITS.note), placeholder: T('shell.docinfo.signoff.note'), 'aria-label': T('shell.docinfo.signoff.note') });
      const line = !st.signed ? T('shell.docinfo.signoff.none') : T(st.stale ? 'shell.docinfo.signoff.stale' : 'shell.docinfo.signoff.done', { who: st.by, when: date(st.at) });
      return h('div', { class: 'cct-f', 'data-k': 'signoff-' + kind },
        h('strong', { text: T('shell.docinfo.signoff.' + kind) }),
        h('p', { class: 'cct-snip ' + (st.signed && !st.stale ? 'is-ok' : 'is-warn'), 'data-k': 'so-line-' + kind, text: line }),
        h('div', { class: 'cct-bar' }, name, note,
          h('button', { type: 'button', class: 'cct-btn', 'data-k': 'so-sign-' + kind, onclick: () => { stepProxy(T('shell.docinfo.undo'), () => info.sign(kind, { by: name.value || who(), note: note.value })); render(); } }, T('shell.docinfo.signoff.sign')),
          st.signed ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'so-undo-' + kind, onclick: () => { info.unsign(kind); render(); } }, T('shell.docinfo.signoff.take')) : null));
    });
    return h('section', { 'data-k': 'signoff' }, h('h3', { class: 'cct-sub', text: T('shell.docinfo.signoff.title') }), ...rows);
  }
  function unverifiedBlock() {
    const u = window.ccUnverified;
    let n = 0;
    try { n = u && typeof u.count === 'function' ? u.count() | 0 : 0; } catch (e) { n = 0; }
    if (!u) return null;
    return h('section', { 'data-k': 'unverified' }, h('h3', { class: 'cct-sub', text: T('shell.docinfo.unverified.title') }),
      h('p', { class: 'cct-snip ' + (n ? 'is-warn' : 'is-ok'), 'data-k': 'uv-line', text: n ? T('shell.docinfo.unverified.n', { n: formatCount(n, lang) }) : T('shell.docinfo.unverified.none') }),
      n ? h('div', { class: 'cct-bar' },
        typeof u.select === 'function' ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'uv-show', onclick: () => { try { u.select(); } catch (e) { /* the app's own trouble */ } } }, T('shell.docinfo.unverified.show')) : null,
        typeof u.clear === 'function' ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'uv-clear', onclick: () => { try { u.clear(); } catch (e) { /* the app's own trouble */ } render(); } }, T('shell.docinfo.unverified.clear')) : null) : null);
  }

  let factsEl = null;
  function render() {
    P.btn.dataset.has = info.empty() ? '' : '1';
    if (P.panel.hidden) return;
    const p = info.get();
    const kids = [];
    if (!attached) kids.push(h('p', { class: 'cct-note', text: T('shell.docinfo.unattached') }));
    const form = h('form', { class: 'cct-form', 'data-k': 'form', onsubmit: (e) => { e.preventDefault(); save(form); } },
      ...FIELDS.map((k) => field(k, p[k])),
      // BK.168: the project stage, kept with the details in the file; an assistant reads it (stage_get) to pitch its help
      h('div', { class: 'cct-f' }, h('label', { for: 'cct-di-stage', text: T('shell.docinfo.f.stage') }),
        h('select', { id: 'cct-di-stage', class: 'cct-in', 'data-k': 'stage', title: T('shell.docinfo.f.stage.title') },
          h('option', { value: '', selected: !p.stage, text: T('shell.docinfo.stage.none') }), ...STAGES.map((k) => h('option', { value: k, selected: p.stage === k, text: T('shell.docinfo.stage.' + k) })))),
      h('div', { class: 'cct-bar' },
        h('button', { type: 'submit', class: 'cct-btn cct-primary', 'data-k': 'save' }, T('shell.docinfo.save')),
        who() && !p.author ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'me', onclick: () => { form.querySelector('[data-k="author"]').value = who(); } }, T('shell.docinfo.me')) : null));
    kids.push(form, signoffBlock(), unverifiedBlock(), h('h3', { class: 'cct-sub', text: T('shell.docinfo.facts') }));
    factsEl = facts();
    kids.push(factsEl);
    P.body.replaceChildren(...kids.filter(Boolean));
  }
  function renderFacts() {   // only the numbers: what the person is typing is never redrawn
    if (P.panel.hidden || !factsEl || !factsEl.isConnected) return;
    const next = facts();
    if (next.outerHTML !== factsEl.outerHTML) { factsEl.replaceWith(next); factsEl = next; }
  }
  function startPoll() {
    stopPoll();
    offChange = adapter.onChange ? (adapter.onChange(renderFacts) || (() => {})) : () => {};
    if (!adapter.onChange) poll = setInterval(renderFacts, 2000);
  }
  function stopPoll() { clearInterval(poll); poll = null; offChange(); offChange = () => {}; }

  function save(form) {
    const val = (k) => form.querySelector('[data-k="' + k + '"]').value;
    const patch = { ...Object.fromEntries(FIELDS.map((k) => [k, val(k)])), stage: val('stage') };
    stepProxy(T('shell.docinfo.undo'), () => info.set(patch, { by: who() }));
    render();
  }

  const api = {
    info,
    attach(a = {}) {
      stopPoll();
      adapter = { read: a.read || null, persist: a.persist || null, step: a.step || null, name: a.name || null, onChange: a.onChange || null };
      attached = !!adapter.persist;
      if (P.isOpen) startPoll();
      render(); return info;
    },
    load(json) { info.load(json); render(); },
    /** Called where the app serializes the file: stamps the save and returns the JSON to write (null while nothing was ever written, so an untouched file stays byte-identical). */
    save() { if (info.empty()) return null; info.stamp(who()); return info.save(); },   // a file nobody wrote details into stays as it was
    refresh() { render(); },
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    registerTools(control, opts = {}) { return registerTools(control, docinfoTools({ info, read: () => read(), step: opts.step || adapter.step }), opts.skip); },
    tools: (opts = {}) => docinfoTools({ info, read: () => read(), step: opts.step || adapter.step }),
    state: () => ({ attached, open: P.isOpen, written: !info.empty() }),
  };
  window.ccDocInfo = api;
  palette({ id: 'cc-docinfo-open', label: T('shell.docinfo.palette'), group: T('shell.docinfo.title'), keywords: 'properties details info size author entities triangles count units created', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-docinfo-ready'));
  render();
}
