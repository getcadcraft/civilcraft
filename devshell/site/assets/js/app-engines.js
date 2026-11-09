/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-engines.js — the Engines panel in every app and in SuperCad Studio (0.8 XE.1, 2, 4–13; rule 39: one panel, built for every host; map
 * docs/apps/shell-modules.md § Engines). The page side of engines.js. Loaded by app-shell.inc for a build whose manifest says "engines": true
 * (AppBuilds::extras; dev builds only). Reads #cc-engines {app, appName}.
 *
 * A panel with a button in the app bar, a menu item in "More" on narrow screens and a command-palette entry. Pick an engine (schematics, pipe networks and
 * power, motion, queues, schedule and cost, requirements, risk, live data, circuits, boards, systems, PLC), load one of its worked examples or paste your
 * own model, press Run: tables of results, the engine's own problems and its stated limits. Problems also go to the shell's Problems panel (source
 * "engine-<id>", rule 29) when the build has one. Nothing is sent anywhere: the engines run in this page.
 *
 *   window.ccEngines = {
 *     engines                         the core (engines.js createEngines)
 *     list() → [{ id, rows, name, summary, kind }]
 *     run(id, text?) → Promise<result>   runs the engine on `text` (default: the open example) and shows it when the panel is open
 *     select(id) · open(id?) · close() · toggle()
 *   }
 * Apps that load before this module wait for it: `window.ccEngines ? go() : addEventListener('cc-engines-ready', go, { once: true })`. Words: shell.engines.*.
 */
import { createEngines } from './engines.js';
import { T, h, readCfg, store, makePanel, palette } from './app-tools-ui.js';

const cfg = readCfg('cc-engines');
if (cfg && cfg.app && !window.ccEngines) boot();

function boot() {
  const PREF = 'cc-engines:' + cfg.app;
  const prefs = (() => { try { return { id: 'schematic', ...JSON.parse(store.get(PREF) || '{}') }; } catch (e) { return { id: 'schematic' }; } })();
  const savePrefs = () => store.set(PREF, JSON.stringify(prefs));
  const E = createEngines();
  const P = makePanel({ key: 'engines', icon: 'cpu', titleKey: 'shell.engines.title', onOpen: () => render() });
  P.btn.title = T('shell.engines.button.title');
  const words = (id, part, fallback) => { const k = 'shell.engines.' + id + '.' + part; const w = T(k); return w && w !== k ? w : fallback; };
  const texts = {};          // the text in each engine's box, kept while the panel stays on the page
  const last = {};           // the last result per engine
  let exampleId = '';
  let busy = false;

  async function run(id, text) {
    id = id || prefs.id;
    if (text === undefined) { text = texts[id] !== undefined ? texts[id] : (await E.example(id, exampleId)).text; }
    texts[id] = text; busy = true; render();
    const res = await E.run(id, text);
    busy = false; last[id] = res;
    sendProblems(id, res);
    render();
    return res;
  }
  function sendProblems(id, res) {
    const pr = window.ccProblems;
    if (!pr || !pr.source) return;
    try {
      const src = pr.source({ id: 'engine-' + id, kind: 'engine', label: words(id, 'name', id) });
      src.set(res.problems.map((p) => ({ code: p.code, severity: p.severity, text: p.text })));
    } catch (e) { /* the Problems panel does not take it: the list below still shows it */ }
  }
  function select(id) {
    if (!E.list().some((e) => e.id === id)) return false;
    prefs.id = id; exampleId = ''; savePrefs(); render(); return true;
  }
  const tableEl = (t) => h('div', { class: 'cct-tbl', 'data-table': t.title },
    t.title ? h('strong', { text: t.title }) : null,
    h('div', { class: 'cct-scroll' }, h('table', { class: 'cct-table' },
      t.head.length ? h('thead', {}, h('tr', {}, t.head.map((c) => h('th', { text: c })))) : null,
      h('tbody', {}, t.rows.map((r) => h('tr', {}, r.map((c) => h('td', { text: c }))))))),
    t.more ? h('p', { class: 'cct-note', text: T('shell.engines.more', { n: t.more }) }) : null);

  async function render() {
    if (P.panel.hidden) return;
    const id = prefs.id, list = E.list(), meta = list.find((e) => e.id === id) || list[0];
    let desc = null; try { desc = await E.descriptor(meta.id); } catch (e) { desc = { examples: [] }; }
    const ex = (desc.examples || []);
    if (texts[meta.id] === undefined && ex.length) texts[meta.id] = (ex.find((x) => x.id === exampleId) || ex[0]).text;
    const res = last[meta.id];
    P.sum.textContent = res ? T(res.ok ? 'shell.engines.sum.ok' : 'shell.engines.sum.bad', { ms: res.ms }) : '';
    const pick = h('select', { class: 'cct-in select-cc', 'data-k': 'engine', 'aria-label': T('shell.engines.pick'), onchange: (ev) => select(ev.target.value) },
      list.map((e) => h('option', { value: e.id, selected: e.id === meta.id }, words(e.id, 'name', e.name))));
    const kids = [
      h('p', { class: 'cct-note', text: T('shell.engines.what') }),
      h('div', { class: 'cct-bar' }, pick),
      h('p', { class: 'cct-note', 'data-k': 'summary', text: words(meta.id, 'summary', meta.summary) }),
    ];
    if (ex.length > 1) {
      kids.push(h('div', { class: 'cct-bar' }, h('label', { for: 'cct-engines-ex', text: T('shell.engines.example') }),
        h('select', { id: 'cct-engines-ex', class: 'cct-in select-cc', 'data-k': 'example', onchange: (ev) => { exampleId = ev.target.value; texts[meta.id] = (ex.find((x) => x.id === exampleId) || ex[0]).text; render(); } },
          ex.map((x) => h('option', { value: x.id, selected: x.id === (exampleId || ex[0].id) }, x.name)))));
    }
    kids.push(h('label', { class: 'cct-f', for: 'cct-engines-in' }, h('span', { text: T('shell.engines.input.' + meta.kind.toLowerCase()) }),
      h('textarea', { id: 'cct-engines-in', class: 'cct-in cct-code', rows: 12, spellcheck: 'false', 'data-k': 'input', oninput: (ev) => { texts[meta.id] = ev.target.value; } }, texts[meta.id] || '')));
    kids.push(h('div', { class: 'cct-bar' },
      h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'run', disabled: busy, onclick: () => run(meta.id, texts[meta.id]) }, T('shell.engines.run')),
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'reset', onclick: () => { texts[meta.id] = (ex.find((x) => x.id === exampleId) || ex[0] || { text: '' }).text; delete last[meta.id]; render(); } }, T('shell.engines.reset'))));
    if (busy) kids.push(h('p', { class: 'cct-note', role: 'status', text: T('shell.engines.busy') }));
    if (res) {
      kids.push(h('div', { 'data-k': 'result', 'aria-live': 'polite' },
        ...res.problems.map((p) => h('p', { class: p.severity === 'error' ? 'cct-err' : 'cct-note', 'data-problem': p.code, text: T('shell.engines.sev.' + p.severity) + ': ' + p.text })),
        ...res.tables.map(tableEl),
        ...res.notes.map((n) => h('p', { class: 'cct-note', text: n }))));
    }
    P.body.replaceChildren(...kids);
  }

  const api = {
    engines: E,
    list: () => E.list(),
    run: async (id, text) => { const r = await run(id, text); return r; },
    select, open(id) { if (id) select(id); P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
  };
  window.ccEngines = api;
  palette({ id: 'cc-engines-open', label: T('shell.engines.palette'), group: T('shell.engines.title'), keywords: 'engine schematic network power motion robot queue schedule requirements risk modbus circuit spice board pcb plc modelica', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-engines-ready'));
}
