/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-craft.js: the Craft menu and the Add-ons list (UI.24; owner 2026-11-09: "condense OUR buttons that extend the site's functions").
 * One registration, `ccShell.option(spec)`, that every module and add-on calls instead of inserting a button into the app bar; the menu that
 * opens from the app mark and name at the far left of the absolute top (UI.8) lists them; Add-ons (the panels) is the last item of the
 * menu bar, or a title-bar button where a layout has none. Up to six options can be pinned as buttons in the absolute top; badges ride on a
 * pinned button or on the mark; Alt+O opens the menu. The app's tools are not touched.
 *
 *   option({ id, label, group: 'main'|'addon', order, run(), toggle(), isOpen(), badge(), shortcut, icon, pinnable })   → remove()
 *     label is the translated words (the caller's T), never a key: a module knows its own words. group 'addon' = a panel of the Add-ons list.
 *   registry = createCraft({ app, T, user(), signIn(), account(), signOut(), site() })      the menu, its pins and its items
 *   registry.menuFor(button)        popMenu on the mark; registry.addonsFor(button) popMenu of the panels; registry.pinned() → specs
 *   registry.mountPins(box)         the pinned buttons (up to six), kept in step through refresh(); registry.keys(doc) installs Alt+O
 *   registry.themeRow = node        the sun and moon row (app-block-theme.js) the host hands in; never list items
 * Words (shell.craft.*) are the host's T; the menu never writes a bare string. Storage: cc-ws-craft-pins:<app>.
 */
import { el, store, popMenu, menuItem } from './app-block-core.js';

export const MAIN_ORDER = ['settings', 'fullscreen', 'help', 'support', 'about', 'offline', 'site'];
export const MAX_PINS = 6;
const ID_RE = /^[a-z][a-z0-9._-]{0,39}$/;

export function createCraft({ app = '', T = (k) => k, user = () => null, signIn, account, signOut, site } = {}) {
  const st = store(app);
  const opts = new Map();
  let pins = (() => { const v = st.get('craft-pins', []); return Array.isArray(v) ? v.filter((x) => typeof x === 'string' && ID_RE.test(x)).slice(0, MAX_PINS) : []; })();
  const listeners = new Set();
  const changed = () => listeners.forEach((f) => { try { f(); } catch (e) { /* a listener never stops the others */ } });
  const reg = {
    themeRow: null,
    /** Register one option; returns a remover. A second option with the same id replaces the first (a module reloading). */
    option(spec) {
      if (!spec || !ID_RE.test(spec.id || '') || typeof spec.label !== 'string' || !spec.label) throw new TypeError('craft option: id and label are required');
      const o = { group: 'main', order: 50, pinnable: true, ...spec };
      if (o.group !== 'main' && o.group !== 'addon') throw new TypeError('craft option: group is main or addon');
      opts.set(o.id, o); changed();
      return () => { if (opts.get(o.id) === o) { opts.delete(o.id); changed(); } };
    },
    list(group) {
      return [...opts.values()].filter((o) => o.group === group)
        .sort((a, b) => (group === 'main' ? ((MAIN_ORDER.indexOf(a.id) + 1 || 99) - (MAIN_ORDER.indexOf(b.id) + 1 || 99)) : 0) || a.order - b.order || a.label.localeCompare(b.label));
    },
    get: (id) => opts.get(id) || null,
    pinned: () => pins.map((id) => opts.get(id)).filter(Boolean),
    isPinned: (id) => pins.includes(id),
    /** Pin or unpin; at the sixth pin a seventh is refused (returns false), the layout file carries the same list (format v2). */
    pin(id, on = true) {
      const o = opts.get(id); if (!o || o.pinnable === false) return false;
      if (on && !pins.includes(id)) { if (pins.length >= MAX_PINS) return false; pins = [...pins, id]; }
      if (!on) pins = pins.filter((x) => x !== id);
      st.set('craft-pins', pins); changed(); return true;
    },
    setPins(list) { pins = (Array.isArray(list) ? list : []).filter((x) => typeof x === 'string' && ID_RE.test(x)).slice(0, MAX_PINS); st.set('craft-pins', pins); changed(); },
    /** The number or word on the mark: the sum of the pinned and unpinned options' badges that are numbers, or '' when there is none. */
    badgeTotal() { let n = 0; for (const o of opts.values()) { const b = typeof o.badge === 'function' ? o.badge() : 0; if (Number.isFinite(b)) n += b; } return n ? String(n > 99 ? '99+' : n) : ''; },
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
    /** Items of the menu in their order, as data (the test reads this): [{ id, label, kind: 'item'|'theme'|'sep', … }]. */
    items() {
      const out = [];
      for (const o of this.list('main')) out.push({ id: o.id, label: o.label, kind: 'item', shortcut: o.shortcut, badge: typeof o.badge === 'function' ? o.badge() : 0 });
      if (site) out.push({ id: 'site', label: T('shell.craft.site'), kind: 'item', native: true });
      out.push({ kind: 'sep' }, { id: 'theme', kind: 'theme' }, { kind: 'sep' });
      if (user()) out.push({ id: 'account', label: T('shell.craft.account'), kind: 'item', native: true }, { id: 'signout', label: T('shell.craft.signout'), kind: 'item', native: true, indent: true });
      else out.push({ id: 'signin', label: T('shell.craft.signin'), kind: 'item', native: true });
      return out;
    },
    menuFor(button) {
      return popMenu(button, (box, close) => {
        for (const it of this.items()) {
          if (it.kind === 'sep') { box.append(el('hr', { className: 'blk-menu-sep', role: 'separator' })); continue; }
          if (it.kind === 'theme') { box.append(el('div', { className: 'blk-menu-theme', role: 'group', 'aria-label': T('shell.craft.theme') }, this.themeRow || '')); continue; }
          const o = opts.get(it.id);
          const run = () => { close(false); if (o) o.run?.(); else if (it.id === 'site') site?.(); else if (it.id === 'account') account?.(); else if (it.id === 'signout') signOut?.(); else if (it.id === 'signin') signIn?.(); };
          const b = menuItem(it.label, run, { hint: it.shortcut });
          if (it.indent) b.classList.add('is-indent');
          if (it.badge) b.append(el('span', { className: 'blk-badge' }, String(it.badge)));
          if (o && o.pinnable !== false) {
            const pb = el('button', { type: 'button', className: 'blk-menu-pin', 'aria-pressed': String(this.isPinned(o.id)), title: T(this.isPinned(o.id) ? 'shell.craft.unpin' : 'shell.craft.pin'), 'aria-label': T(this.isPinned(o.id) ? 'shell.craft.unpin' : 'shell.craft.pin') }, '●');
            pb.addEventListener('click', (e) => { e.stopPropagation(); if (!this.pin(o.id, !this.isPinned(o.id))) this.say?.(T('shell.craft.pins.full')); close(false); });
            box.append(el('div', { className: 'blk-menu-row' }, b, pb));
          } else box.append(b);
        }
      }, { cls: 'blk-craft-menu' });
    },
    /** The Add-ons list: every add-on and panel, a tick when open; picking toggles it, closing a panel returns it here. */
    addonsFor(button) {
      return popMenu(button, (box, close) => {
        const list = this.list('addon');
        if (!list.length) box.append(el('div', { className: 'blk-menu-empty' }, T('shell.craft.addons.none')));
        for (const o of list) box.append(menuItem(o.label, () => { close(false); (o.toggle || o.run)?.(); }, { checked: typeof o.isOpen === 'function' ? !!o.isOpen() : false }));
      }, { cls: 'blk-addons-menu' });
    },
    mountPins(box) {
      const draw = () => {
        box.replaceChildren(...this.pinned().map((o) => {
          const b = el('button', { type: 'button', className: 'blk-pin', 'data-craft': o.id, title: o.label, 'aria-label': o.label, 'aria-pressed': typeof o.isOpen === 'function' ? String(!!o.isOpen()) : null }, o.icon instanceof Node ? o.icon.cloneNode(true) : (o.icon || o.label.slice(0, 1)));
          const n = typeof o.badge === 'function' ? o.badge() : 0; if (n) b.append(el('span', { className: 'blk-badge' }, String(n)));
          b.addEventListener('click', () => (o.toggle || o.run)?.());
          return b;
        }));
      };
      draw(); const off = this.onChange(draw);
      return { redraw: draw, destroy() { off(); box.replaceChildren(); } };
    },
    /** Alt+O opens the menu (options keep their own shortcuts). Returns the remover. */
    keys(doc, open) {
      const h = (e) => { if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'o' || e.key === 'O' || e.code === 'KeyO')) { e.preventDefault(); open(); } };
      doc.addEventListener('keydown', h); return () => doc.removeEventListener('keydown', h);
    },
  };
  return reg;
}

/** The page-wide registration the modules call: ccShell.option({...}). Calls made before the menu exists are kept and replayed. */
export function install(win = window) {
  const shell = (win.ccShell = win.ccShell || {});
  if (shell.option && shell.option.__craft) return shell;
  const early = [];
  let target = null;
  const option = (spec) => { if (target) return target.option(spec); early.push(spec); return () => {}; };
  option.__craft = true;
  shell.option = option;
  shell.optionTarget = (registry) => { target = registry; for (const s of early.splice(0)) registry.option(s); };
  return shell;
}
