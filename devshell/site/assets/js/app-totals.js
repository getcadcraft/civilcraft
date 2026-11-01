/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-totals.js — running totals in the status bar (round 2, session shell_PART_2, EG.30; map docs/apps/shell-modules.md § Running totals): the
 * page side of totals.js. Loaded by app-shell.inc for a build whose manifest says "totals": true (AppBuilds::extras; dev builds only).
 * Reads #cc-totals {app, appName}.
 *
 * Each app feeds numbers through ONE hook and never draws them:
 *
 *   window.ccTotals = {
 *     source({ id, measure, label, read }) → { invalidate(), remove() }
 *        measure  'cost' | 'carbon' | 'weight' | 'time'      read() → number | { value, currency?, note?, parts? } | null
 *                 in base units: cost in `currency` (a 3-letter code), carbon in kg CO₂e, weight in kg, time in hours. null = no number yet:
 *                 the source is left out and counted as "waiting", never as 0
 *     invalidate()     every source's numbers may have changed
 *     mount(el)        draw the chips in a span the shell adds at the end of the app's own status bar element `el` (the app owns the place); without it the shell draws a thin
 *                      strip along the bottom edge of the window
 *     snapshot() · measures() · tools() · registerTools(control)   totals_get for an app's host.control
 *   }
 * Apps that load before this module wait for it: `window.ccTotals ? go() : addEventListener('cc-totals-ready', go, { once: true })`.
 * Honest by construction: a measure no source feeds is not shown, a chip says "n of m" while some source has no number yet, costs in two
 * currencies are shown side by side and never added. A person turns a measure off with its chip's menu (kept per app). Words: shell.totals.*.
 */
import { createTotals, totalsTools, MEASURES } from './totals.js';
import { T, h, readCfg, store, palette, registerTools } from './app-tools-ui.js';

const cfg = readCfg('cc-totals');
if (cfg && cfg.app && !window.ccTotals) boot();

function boot() {
  const PREF = 'cc-totals:' + cfg.app;
  const prefs = (() => { try { return { off: [], ...JSON.parse(store.get(PREF) || '{}') }; } catch (e) { return { off: [] }; } })();
  const save = () => store.set(PREF, JSON.stringify(prefs));
  const totals = createTotals();
  const ICON = { cost: 'currency-dollar', carbon: 'cloud', weight: 'box-seam', time: 'clock' };
  let host = null, own = null;

  function ensureHost() {
    if (host && host.isConnected) return host;
    if (!own) { own = h('div', { class: 'cct-totals cct-totals-own', role: 'status', 'aria-live': 'polite', 'aria-label': T('shell.totals.title') }); document.body.append(own); }
    return (host = own);
  }
  function why(m) {
    const bits = [];
    if (m.waiting) bits.push(T('shell.totals.waiting', { n: m.waiting, total: m.sources }));
    if (m.failed && m.failed.length) bits.push(T('shell.totals.failed', { names: m.failed.map((f) => f.label).join(', ') }));
    if (m.mixed) bits.push(T('shell.totals.mixed'));
    return bits.join(' ');
  }
  function render(snap) {
    const list = (snap || []).filter((m) => m.text);
    const el = ensureHost();
    const shown = list.filter((m) => !prefs.off.includes(m.measure));
    el.dataset.n = String(shown.length);
    el.hidden = !list.length;
    el.replaceChildren(...shown.map((m) => {
      const note = why(m);
      const tip = [T('shell.totals.' + m.measure), m.sinceText ? T('shell.totals.since', { delta: m.sinceText }) : '', ...m.parts.map((p) => p.label + ': ' + totals.format(m.measure, p.value, { currency: p.currency })), note].filter(Boolean).join('\n');
      return h('span', { class: 'cct-chip cct-chip-' + m.measure + (note ? ' is-partial' : ''), 'data-measure': m.measure, title: tip, tabindex: '0' },
        h('i', { class: 'bi bi-' + ICON[m.measure], 'aria-hidden': 'true' }), h('span', { class: 'cct-chip-v', text: m.text }),
        m.sinceText ? h('small', { class: 'cct-chip-d', 'data-since': m.since > 0 ? 'up' : 'down', text: m.sinceText, title: T('shell.totals.since', { delta: m.sinceText }) }) : null,
        m.waiting || (m.failed && m.failed.length) ? h('small', { class: 'cct-chip-n', text: T('shell.totals.of', { n: m.counted || 0, total: m.sources }) }) : null);
    }), ...(list.length ? [h('button', { type: 'button', class: 'cct-chip cct-chip-menu', 'aria-label': T('shell.totals.menu'), title: T('shell.totals.menu'), onclick: () => menu(list) }, h('i', { class: 'bi bi-three-dots', 'aria-hidden': 'true' }))] : []));
  }
  function menu(list) {
    const dlg = h('dialog', { class: 'cct-dlg', 'aria-label': T('shell.totals.menu') },
      h('h2', { text: T('shell.totals.title') }),
      ...MEASURES.filter((m) => totals.measures().includes(m)).map((m) => h('label', { class: 'cct-check' }, h('input', { type: 'checkbox', checked: !prefs.off.includes(m), onchange: (e) => { prefs.off = prefs.off.filter((x) => x !== m); if (!e.target.checked) prefs.off.push(m); save(); render(totals.last()); } }), ' ' + T('shell.totals.' + m))),
      h('button', { type: 'button', class: 'cct-btn', onclick: () => dlg.close() }, T('shell.tools.close')));
    dlg.addEventListener('close', () => dlg.remove());
    document.body.append(dlg); dlg.showModal();
  }
  totals.on(render);

  const api = {
    source: (def) => totals.source(def),
    invalidate: () => totals.invalidate(),
    markSaved: () => totals.markSaved(),
    reset: () => totals.reset(),
    mount(el) { if (el && el.nodeType === 1) { host = h('span', { class: 'cct-totals', role: 'status', 'aria-live': 'polite', 'aria-label': T('shell.totals.title') }); el.append(host); if (own) own.hidden = true; render(totals.last() || totals.snapshot()); } },
    snapshot: () => totals.snapshot(),
    measures: () => totals.measures(),
    tools: () => totalsTools({ totals }),
    registerTools(control, opts = {}) { return registerTools(control, totalsTools({ totals }), opts.skip); },
    state: () => ({ off: prefs.off.slice(), measures: totals.measures() }),
  };
  window.ccTotals = api;
  palette({ id: 'cc-totals-menu', label: T('shell.totals.palette'), group: T('shell.totals.title'), keywords: 'cost carbon weight time status bar totals', run: () => menu(totals.snapshot()) });
  document.dispatchEvent(new CustomEvent('cc-totals-ready'));
}
