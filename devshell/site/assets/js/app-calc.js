/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-calc.js — calc sheets in every app (round 2, session shell_PART_2, EG.18; map docs/apps/shell-modules.md § Calc sheets): the page side of calc.js.
 * Loaded by app-shell.inc for a build whose manifest says "calc": true (AppBuilds::extras; dev builds only). Reads #cc-calc {app, appName}.
 *
 * The shell never touches an app's file. The app hands over what it has and keeps what comes back (one shell API, eight savers):
 *
 *   window.ccCalc = {
 *     attach({ units, params, step, persist, names }) → calcs
 *        units    the build's unit-table.js namespace (byte-identical copy of lib/units); without it only built-in lengths and SI units are known
 *        params   { get(name) → number | { value, unit } | null, set(name, value, unit) → boolean, list() → [name] }  the app's parameters
 *        step     (label, fn) → fn() as the app's ONE undo step (a drive applied from the panel, an assistant's edit)
 *        persist  (json) → void   called, debounced, whenever the sheets change: the app stores `json` inside its own file
 *     load(json)   the app opened a file: give back what persist() was last given (a file is untrusted; calc.js cleans it)
 *     save() → json  the app is saving: what to put in the file (null when there are no sheets, so old files stay unchanged)
 *     touch()      a parameter or a unit setting changed outside the sheet: recompute
 *     calcs        the engine (calc.js createCalcs): valueOf('sheet.row') for the reasons module, tools()
 *     open() · close() · toggle()
 *     registerTools(control, opts)   the five assistant tools for an app's host.control (calcs_list/get/run/set/delete); opts.skip, opts.step
 *   }
 * Apps that load before this module wait for it: `window.ccCalc ? go() : addEventListener('cc-calc-ready', go, { once: true })`.
 * Until an app attaches, the panel says sheets last until the file is closed (nothing is saved anywhere else). Words: shell.calc.* in assets/lang/shell.
 */
import { createCalcs, printHtml } from './calc.js';
import { T, h, readCfg, store, makePanel, palette, registerTools } from './app-tools-ui.js';

const cfg = readCfg('cc-calc');
if (cfg && cfg.app && !window.ccCalc) boot();

function boot() {
  const PREF = 'cc-calc:' + cfg.app;
  const prefs = (() => { try { return { auto: false, sheet: '', ...JSON.parse(store.get(PREF) || '{}') }; } catch (e) { return { auto: false, sheet: '' }; } })();
  const savePrefs = () => store.set(PREF, JSON.stringify(prefs));

  let adapter = { units: null, params: null, step: null, persist: null };
  let attached = false;
  let msg = '';            // the last problem a person caused (a bad name, a bad drive), shown under the table
  let persistTimer = null;
  const paramsProxy = {
    get: (n) => (adapter.params && adapter.params.get ? adapter.params.get(n) : null),
    set: (n, v, u) => (adapter.params && adapter.params.set ? adapter.params.set(n, v, u) : false),
    list: () => (adapter.params && adapter.params.list ? adapter.params.list() : []),
  };
  const stepProxy = (label, fn) => (typeof adapter.step === 'function' ? adapter.step(label, fn) : fn());
  let calcs, off = () => {};
  function make(json) {
    off(); calcs = createCalcs({ units: adapter.units || null, params: paramsProxy, step: stepProxy });
    if (json) calcs.load(json, { quiet: true });
    off = calcs.on((why) => { if (why !== 'load' && why !== 'touch') queuePersist(); render(); if (prefs.auto && why !== 'touch') autoApply(); });
    api.calcs = calcs;
  }
  function queuePersist() {
    if (!adapter.persist) return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { try { adapter.persist(calcs.empty() ? null : calcs.save()); } catch (e) { /* the app's own trouble */ } }, 250);
  }
  function autoApply() { try { calcs.apply({ label: T('shell.calc.undo.apply') }); } catch (e) { /* shown by the next render */ } }

  // ---- panel ----
  const P = makePanel({ key: 'calc', icon: 'calculator', titleKey: 'shell.calc.title', onOpen: () => render() });
  P.btn.title = T('shell.calc.button.title');

  /** Print the sheets (every one) through a hidden frame: no pop-up to block, nothing sent anywhere. */
  function printSheets() {
    const words = { title: T('shell.calc.print.title'), name: T('shell.calc.col.name'), formula: T('shell.calc.col.formula'), unit: T('shell.calc.col.unit'), answer: T('shell.calc.col.answer'), error: T('shell.calc.err'), empty: T('shell.calc.empty') };
    const html = printHtml(calcs.view({}), { heading: document.title || cfg.appName || '', words, when: new Date().toLocaleDateString() });
    const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    f.onload = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } finally { setTimeout(() => f.remove(), 2000); } };
    f.srcdoc = html; document.body.append(f);
  }
  const sel = () => calcs.sheets().find((s) => s.id === prefs.sheet) || calcs.sheets()[0] || null;
  const guard = (fn) => { try { fn(); msg = ''; } catch (e) { msg = (e && e.message ? e.message : String(e)) + (e && e.next ? ' ' + e.next : ''); render(); } };

  function render() {
    P.btn.dataset.has = calcs.empty() ? '' : '1';
    if (P.panel.hidden) return;
    const at = document.activeElement; const keep = at && P.body.contains(at) ? at.getAttribute('data-k') : null;
    const sheets = calcs.sheets(); const s = sel(); if (s) prefs.sheet = s.id;
    const view = s ? calcs.view({ sheet: s.id })[0] : null;
    P.sum.textContent = sheets.length ? T('shell.calc.sum', { sheets: sheets.length, rows: sheets.reduce((n, x) => n + x.rows.length, 0) }) : '';
    const kids = [];
    if (!attached) kids.push(h('p', { class: 'cct-note', text: T('shell.calc.unattached') }));
    // sheet bar
    kids.push(h('div', { class: 'cct-bar' },
      sheets.length ? h('select', { class: 'cct-in', 'data-k': 'sheet', 'aria-label': T('shell.calc.sheet'), onchange: (e) => { prefs.sheet = e.target.value; savePrefs(); render(); } },
        sheets.map((x) => h('option', { value: x.id, selected: x.id === (s && s.id) }, x.title || x.id))) : null,
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'addsheet', onclick: () => guard(() => { const n = calcs.addSheet({ title: T('shell.calc.sheet.new', { n: sheets.length + 1 }) }); prefs.sheet = n.id; savePrefs(); }) }, T('shell.calc.sheet.add')),
      s ? h('button', { type: 'button', class: 'cct-btn', onclick: () => { const t = window.prompt(T('shell.calc.sheet.rename'), s.title || s.id); if (t !== null) guard(() => calcs.renameSheet(s.id, t)); } }, T('shell.calc.sheet.rename')) : null,
      s ? h('button', { type: 'button', class: 'cct-btn', onclick: () => { if (window.confirm(T('shell.calc.sheet.confirm', { name: s.title || s.id }))) guard(() => calcs.removeSheet(s.id)); } }, T('shell.calc.sheet.delete')) : null,
      s ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'print', title: T('shell.calc.print.tip'), onclick: () => printSheets() }, T('shell.calc.print')) : null));
    if (!s) kids.push(h('p', { class: 'cct-empty', text: T('shell.calc.empty') }));
    else {
      const rows = h('div', { class: 'cct-rows', role: 'table', 'aria-label': s.title || s.id });
      rows.append(h('div', { class: 'cct-r cct-rh', role: 'row' }, ['name', 'formula', 'unit', 'answer'].map((k) => h('span', { role: 'columnheader', text: T('shell.calc.col.' + k) })), h('span')));
      const drives = calcs.drives();
      for (const r of view.rows) {
        const id = s.id + '.' + r.name; const mine = drives.filter((d) => d.row === id);
        const field = (k, val, label) => h('input', { class: 'cct-in', value: val || '', 'data-k': r.id + k, 'aria-label': label, spellcheck: 'false', autocomplete: 'off',
          onchange: (e) => guard(() => calcs.setRow(s.id, r.id, { name: k === 'n' ? e.target.value : r.name, expr: k === 'e' ? e.target.value : r.expr, unit: k === 'u' ? e.target.value : r.unit, note: r.note })) });
        rows.append(h('div', { class: 'cct-r' + (r.error ? ' is-bad' : ''), role: 'row' },
          field('n', r.name, T('shell.calc.col.name')), field('e', r.expr, T('shell.calc.col.formula')), field('u', r.unit, T('shell.calc.col.unit')),
          h('span', { class: 'cct-ans', role: 'cell', 'data-k': r.id + 'a', title: r.kind && !r.error ? r.kind : null }, r.error ? h('span', { class: 'cct-err' }, errText(r.error)) : (r.text || '')),
          h('span', { class: 'cct-act' },
            h('button', { type: 'button', class: 'cct-ib', title: T('shell.calc.drive'), 'aria-label': T('shell.calc.drive'), 'data-k': r.id + 'd', onclick: () => driveForm(s, r) }, h('i', { class: 'bi bi-link-45deg', 'aria-hidden': 'true' })),
            h('button', { type: 'button', class: 'cct-ib', title: T('shell.calc.row.delete'), 'aria-label': T('shell.calc.row.delete'), onclick: () => guard(() => calcs.removeRow(s.id, r.id)) }, h('i', { class: 'bi bi-trash', 'aria-hidden': 'true' })))));
        for (const d of mine) rows.append(h('div', { class: 'cct-drv' }, h('span', { text: T('shell.calc.drives', { param: d.param, unit: d.unit || '' }) }),
          h('button', { type: 'button', class: 'cct-ib', 'aria-label': T('shell.calc.drive.remove'), title: T('shell.calc.drive.remove'), onclick: () => guard(() => calcs.removeDrive(d.param)) }, h('i', { class: 'bi bi-x', 'aria-hidden': 'true' }))));
      }
      kids.push(rows);
      kids.push(h('div', { class: 'cct-bar' }, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'addrow', onclick: () => guard(() => { const n = nextName(s); calcs.setRow(s.id, null, { name: n, expr: '0' }); setTimeout(() => P.body.querySelector('[data-k$="e"]:last-of-type')?.focus?.(), 0); }) }, T('shell.calc.row.add'))));
    }
    // drives
    const plan = calcs.drives().length ? calcs.plan() : null;
    if (plan) {
      const todo = plan.set.filter((x) => x.change);
      kids.push(h('div', { class: 'cct-apply' },
        h('span', { text: todo.length ? T('shell.calc.apply.n', { n: todo.length }) : T('shell.calc.apply.none') }),
        h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'apply', disabled: !todo.length, onclick: () => guard(() => { const r = calcs.apply({ label: T('shell.calc.undo.apply') }); msg = r.skipped.length ? r.skipped.map((x) => x.why).join(' ') : ''; render(); }) }, T('shell.calc.apply')),
        h('label', { class: 'cct-check' }, h('input', { type: 'checkbox', checked: prefs.auto, onchange: (e) => { prefs.auto = e.target.checked; savePrefs(); if (prefs.auto) autoApply(); } }), ' ' + T('shell.calc.apply.auto'))));
      for (const x of plan.skipped) kids.push(h('p', { class: 'cct-err', text: x.why }));
    }
    if (msg) kids.push(h('p', { class: 'cct-err', role: 'alert', text: msg }));
    kids.push(h('p', { class: 'cct-help', text: T('shell.calc.help') }));
    P.body.replaceChildren(...kids);
    if (keep) P.body.querySelector('[data-k="' + CSS.escape(keep) + '"]')?.focus?.();
  }
  const errText = (e) => (typeof e === 'string' ? e : e && e.message ? e.message + (e.next ? ' ' + e.next : '') : T('shell.calc.err'));
  const nextName = (s) => { for (let i = 1; i < 999; i++) { const n = 'x' + i; if (!s.rows.some((r) => r.name === n)) return n; } return 'x'; };

  function driveForm(s, r) {
    const names = paramsProxy.list();
    const param = window.prompt(T('shell.calc.drive.ask', { row: s.id + '.' + r.name }) + (names.length ? '\n' + names.slice(0, 20).join(', ') : ''), (calcs.drives().find((d) => d.row === s.id + '.' + r.name) || {}).param || '');
    if (param === null) return;
    if (!param.trim()) return;
    const unit = window.prompt(T('shell.calc.drive.unit'), r.unit || '');
    if (unit === null) return;
    guard(() => calcs.setDrive(s.id + '.' + r.name, param.trim(), unit.trim()));
  }

  const api = {
    calcs: null, attach(a = {}) {
      const unitsChanged = (a.units || null) !== (adapter.units || null);
      adapter = { units: a.units || null, params: a.params || null, step: a.step || null, persist: a.persist || null };
      attached = !!adapter.persist;
      if (unitsChanged || !calcs) make(calcs ? calcs.save() : null); else calcs.touch();
      render(); return calcs;
    },
    load(json) { calcs.load(json); render(); },
    save() { return calcs.empty() ? null : calcs.save(); },
    touch() { calcs.touch(); },
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    registerTools(control, opts = {}) { return registerTools(control, calcs.tools({ step: opts.step || adapter.step }), opts.skip); },
    tools: (opts = {}) => calcs.tools({ step: opts.step || adapter.step }),
    state: () => ({ attached, open: P.isOpen, sheets: calcs.sheets().length, auto: prefs.auto }),
  };
  make(null);
  window.ccCalc = api;
  palette({ id: 'cc-calc-open', label: T('shell.calc.palette'), group: T('shell.calc.title'), keywords: 'calculation formula units parameters spreadsheet', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-calc-ready'));
  render();
}
