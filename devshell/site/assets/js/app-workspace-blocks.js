/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-blocks.js — mounts the interface blocks of ui-blocks-10 (app-block-*.js: view overlays, command line, status toggles, Model / Layout tabs, 0.10 UI.9, UI.10,
 * UI.11) in the layout engine (UI.6 registers them). The engine gives each block a HOST made from the app's adapter and the input registry (the contract is the header of
 * app-block-core.js: every member optional, a block degrades and never throws); the block module returns { el, refresh, destroy }.
 *
 *   KINDS                          the block kinds mounted here
 *   mountExtra(E, kind, o) → holder    E = engine helpers { A, T, say, stage, region(place), state(), ribbon(), layouts(), layout(), setLayout(key), views, soon() }
 *   refreshExtras(holders, state)  call each mounted block's refresh
 *   destroyExtras(holders)         take them all away
 * app-block.css (tokens only) is loaded once, with the first block.
 */
export const KINDS = Object.freeze(['viewlabel', 'viewcube', 'navbar', 'axes', 'commandline', 'statustoggles', 'modeltabs']);
const CORNER_KINDS = new Set(['viewlabel', 'viewcube', 'navbar', 'axes']);

function css() {
  if (document.getElementById('cc-app-block-css')) return;
  const l = document.createElement('link'); l.id = 'cc-app-block-css'; l.rel = 'stylesheet'; l.href = '/assets/css/app-block.css'; document.head.append(l);
}
const reg = () => window.ccInput || null;

/** The host a block gets: the adapter (prototype, so every member it has stays) plus the registry as commands. */
export function blockHost(E) {
  const I = () => reg();
  const find = (id) => I()?.commands.find((c) => c.id === id) || null;
  const target = (c) => (c && c.sel ? document.querySelector(c.sel) : null);
  const host = Object.create(E.A);
  const put = (o) => { for (const [k, v] of Object.entries(o)) Object.defineProperty(host, k, { value: v, writable: true, configurable: true, enumerable: true }); };   // the adapter's own run / tool / can are read-only on its prototype
  put({
    app: E.A.app, appName: E.appName, T: E.T, say: E.say, stage: E.stage, state: () => E.state(),
    ribbon: () => E.ribbon(),
    cmd: (id) => {
      const c = find(id), n = target(c); if (!c || !n) return null;
      const why = I()?.why ? I().why(id) : '';
      return { id, label: window.ccShellT?.has?.(c.label) ? window.ccShellT(c.label) : String(c.label || id), icon: c.icon || 'bi-dot', group: c.group, pressed: n.getAttribute('aria-pressed') === 'true', enabled: !why, toggle: n.hasAttribute('aria-pressed') };
    },
    ownCommandLine: () => !!document.querySelector('[data-cmd-bar]'),   // CadCraft's own command bar (UI.17: one command line)
    run: (id) => I()?.run?.(id),
    commands: () => (I()?.commands || []).map((c) => c.id),
    layouts: () => E.layouts(), layout: () => E.layout(), setLayout: (k) => E.setLayout(k),
  });
  if (E.A.views) put({ views: { list: () => E.A.views.list(), current: () => E.A.views.current(), go: (id) => E.A.views.go(id, 'open'), ...(typeof E.A.views.add === 'function' ? { add: () => E.A.views.add() } : {}) } });
  return host;
}

export function mountExtra(E, kind, o) {
  const holder = { kind, part: null, gone: false, failed: false };
  import('./app-block-index.js').then((m) => {
    if (holder.gone) return;
    css();
    const place = o.place, region = CORNER_KINDS.has(kind) ? E.stage : E.region(place);
    if (region?.dataset && !region.dataset.wsPlace) region.dataset.wsPlace = place;
    holder.part = m.mountBlock(kind, blockHost(E), region, { ...o, ...(CORNER_KINDS.has(kind) ? { corner: o.corner || place } : {}) });
    E.soon();
  }).catch((e) => { holder.failed = true; console.error('block ' + kind, e); });
  return holder;
}
export function refreshExtras(holders, state) { for (const h of holders) { try { h.part?.refresh?.(state); } catch (e) { /* a block never throws into the engine */ } } }
export function destroyExtras(holders) { for (const h of holders) { h.gone = true; try { h.part?.destroy?.(); } catch (e) { /* gone anyway */ } h.part = null; } }
