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
  const l = document.createElement('link'); l.id = 'cc-app-block-css'; l.rel = 'stylesheet'; l.href = new URL('../css/app-block.css', import.meta.url).href;   // relative: a packed edition in a subfolder (FX.403) document.head.append(l);
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

// ---------------------------------------------------------------- the title bar block (0.11 UI.8, UI.24, UI.20) ----------------------------------------------------------------
/**
 * titlebarBlock(E, o): the `titlebar` block of app-block-titlebar.js drawn instead of the engine's own title bar, ONLY for a layout whose titlebar block asks for one of
 * its new options (`menus`, `find`, `pins`; `switcher` is read but never drawn: owner 2026-11-15, no layout picker in a layout's chrome). No released layout asks, so none changes (rule 62).
 * It also registers the Craft menu (Settings, Full screen, Help, Save for offline, About, the site, Account) from the shell's own buttons, hands the sun and moon in as the theme row,
 * and returns { el, dock, part, gone } where `dock` is the element the menu bar sits in once the module has loaded.
 */
export const wantsTitlebarBlock = (o) => !!(o && (o.menus || o.find || o.pins));
const aliasOf = (find, id) => (['', 'file.', 'edit.'].map((p) => p + id).find(find)) || (id === 'print' ? 'file.plot' : null);
const accountInfo = () => { try { return JSON.parse(document.getElementById('cc-account')?.textContent || 'null'); } catch (e) { return null; } };
const link = (href) => { const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.hidden = true; document.body.append(a); a.click(); a.remove(); };
const setSpace = (s) => {
  const root = document.documentElement; root.setAttribute('data-space', s);
  try { localStorage.setItem('cc-space', s); } catch (e) { /* private window */ }
  try { document.cookie = 'cc_space=' + s + ';path=/;max-age=31536000;samesite=lax;secure'; } catch (e) { /* blocked */ }
  document.querySelectorAll('.space-toggle button').forEach((b) => b.setAttribute('aria-pressed', b.value === s ? 'true' : 'false'));
};

export function titlebarBlock(E, o, region) {
  const holder = { el: null, dock: null, part: null, gone: false, ready: null, onReady: null };
  const header = document.createElement('header'); header.className = 'ws-titlebar ws-block ws-titlebar-blk'; header.setAttribute('data-ws-blk', 'titlebar');
  region.append(header); holder.el = header;
  holder.ready = Promise.all([import('./app-block-index.js'), import('./app-block-craft.js'), import('./app-block-theme.js'), import('./app-workspace-icons.js')]).then(([idx, craftM, themeM, icons]) => {
    if (holder.gone) return;
    css(); craftM.install();
    const base = blockHost(E), T = E.T;
    const find = (id) => !!(reg()?.commands.find((c) => c.id === id));
    const host = Object.create(base);
    const area = /^\/lab(\/|$)/.test(location.pathname) ? 'Lab' : '';
    const put = (v) => { for (const [k, x] of Object.entries(v)) Object.defineProperty(host, k, { value: x, writable: true, configurable: true, enumerable: true }); };
    const mk = document.querySelector('.app-bar .app-bar-mark');
    const acct = accountInfo();
    const craft = craftM.createCraft({ app: E.A.app, T, user: () => acct, site: () => link('/'), account: () => link('/account'), signIn: () => link('/login'), signOut: () => link('/logout') });
    craft.say = E.say; craft.themeRow = themeM.themeToggle({ T, system: false });
    craft.themeRow.addEventListener('click', (ev) => { const b = ev.target.closest('button[name="space"]'); if (b) { ev.preventDefault(); setSpace(b.value); } });
    setSpace(document.documentElement.getAttribute('data-space') || 'paper');
    const shellBtn = (sel, id, label, shortcut) => { const n = document.querySelector(sel); if (n && label) craft.option({ id, label, shortcut, run: () => n.click() }); };
    shellBtn('[data-settings-open]', 'settings', T('shell.ws.settings'), 'Ctrl+,');
    shellBtn('[data-fs-cycle]', 'fullscreen', T('shell.screen.next.full'));
    shellBtn('[data-help-open]', 'help', T('shell.ws.help'), 'F1');
    shellBtn('[data-about-open]', 'about', document.querySelector('[data-about-open]')?.textContent?.trim() || 'About');
    shellBtn('[data-offline]:not([hidden])', 'offline', document.querySelector('[data-offline-label]')?.textContent?.trim() || '');
    craftM.install().optionTarget?.(craft);
    put({
      appName: E.appName, area, markNode: () => (mk ? mk.cloneNode(true) : ''),
      craft, addons: E.addons !== false,
      cmd: (id) => { const r = aliasOf(find, id), c = r ? base.cmd(r) : null; if (!c) return null;
        return { ...c, icon: typeof c.icon === 'string' ? icons.blockIcon({ id: r, label: c.label, bi: c.icon, block: 'titlebar' }) : c.icon }; },
      run: (id) => reg()?.run?.(aliasOf(find, id) || id),
    });
    holder.part = idx.mountBlock('titlebar', host, header, { ...o, switcher: false });
    holder.dock = holder.part?.dock || null;
    E.soon?.();
    holder.onReady?.(holder);
  }).catch((e) => { console.error('titlebar block', e); });
  return holder;
}
