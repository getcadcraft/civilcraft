/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-titlebar.js: the title bar block, the ABSOLUTE TOP of every app and layout (UI.8; owner 2026-11-09). One row, nothing else in it:
 *   [ app mark + name + area chip (opens the Craft menu, UI.24) ] [ dock zone: the menu bar sits here by default ] [ quick-access tools ]
 *   [ workspace switcher ] [ document name, dirty mark, path as a tooltip ] [ pinned Craft options ] [ Add-ons, where no menu bar has it ] [ Find ]
 * The quick-access tools take ANY registry command id and a person adds or removes them by right-click (the My tools picker); undo and redo
 * get a caret with the last steps when the host's history offers them; Find is the command finder inline (Ctrl+K), folded to its
 * magnifying glass when room is short. The menu bar can dock underneath instead (a second row of the same zone) or tear off like any unit
 * (UI.21): the block only offers `dock`, the element the engine puts the menu bar in. One brand, once (pattern section 11).
 *
 *   mount(host, region, opts) → { el, dock, craft, refresh(state), destroy() }
 *   opts: quick [command ids, 12 at most], menus: true (the menu bar is part of this block's dock), switcher: true, find: true, pins: true
 * host: app, appName, area ('Browser' | 'Lab' | 'Studio'), version, T, state(), cmd(id), run(id), commands(), history() → [{ label }], jump(n),
 *   layouts(), layout(), setLayout(key), find(text), craft (a createCraft registry), addons: true when no menu bar carries the Add-ons list.
 */
import { el, store, words, popMenu, menuItem, onWidth, mark, idList, bool } from './app-block-core.js';

export const QUICK_MAX = 12;
export const FOLD_FIND = 560;   // px of bar width under which the search box folds to its glass
/** The quick list: the person's own (stored), else the layout's, else the well-known six; ids the app does not have are left out. */
export function quickResolve(stored, layoutList, has) {
  const base = Array.isArray(stored) ? stored : (Array.isArray(layoutList) && layoutList.length ? layoutList : ['new', 'open', 'save', 'undo', 'redo']);
  return [...new Set(base.filter((id) => typeof id === 'string' && has(id)))].slice(0, QUICK_MAX);
}
/** Add or remove a tool in a quick list (what the right-click picker does); a thirteenth is refused. */
export function quickToggle(list, id) {
  const i = list.indexOf(id);
  if (i >= 0) return { list: list.filter((x) => x !== id), ok: true };
  if (list.length >= QUICK_MAX) return { list, ok: false };
  return { list: [...list, id], ok: true };
}
export const nameLabel = (name, dirty, fallback) => (name || fallback) + (dirty ? ' •' : '');

export const block = {
  kind: 'titlebar', family: 'menus and title', places: ['top'], needs: [],
  opts: { quick: idList(QUICK_MAX), menus: bool, switcher: bool, find: bool, pins: bool, inventory: bool },
  mount(host, region, o = {}) {
    const T = words(host), app = host.app || '', st = store(app);
    const has = (id) => !!(host.cmd && host.cmd(id));
    let quick = quickResolve(st.get('quick', null), o.quick, has);
    const bar = mark(el('div', { className: 'blk-tb', role: 'banner', 'data-blk-app': app }), 'titlebar');
    const mk = el('span', { className: 'blk-tb-mark', 'aria-hidden': 'true' }, host.markNode ? host.markNode() : '');
    const nm = el('span', { className: 'blk-tb-name' }, host.appName || app);
    const chip = el('span', { className: 'blk-tb-chip' }, [host.area, host.version].filter(Boolean).join(' '));
    const brand = el('button', { type: 'button', className: 'blk-tb-brand', 'aria-label': T('shell.craft.open'), title: T('shell.craft.open') }, mk, nm, chip, el('span', { className: 'blk-badge blk-tb-badge', hidden: true }));
    const dock = el('div', { className: 'blk-tb-dock', 'data-ws-dock': 'menubar' });
    const qbox = el('div', { className: 'blk-tb-quick', role: 'toolbar', 'aria-label': T('shell.tb.quick') });
    const sw = o.switcher !== false && host.layouts ? el('select', { className: 'blk-tb-switch', 'aria-label': T('shell.tb.switch'), title: T('shell.tb.switch') }) : null;
    const doc = el('span', { className: 'blk-tb-doc', 'aria-live': 'polite' });
    const pins = el('div', { className: 'blk-tb-pins' });
    const addons = el('button', { type: 'button', className: 'blk-tb-addons', hidden: !host.addons }, T('shell.craft.addons'));
    const find = o.find !== false ? el('form', { className: 'blk-tb-find', role: 'search' }) : null;
    const glass = find && el('button', { type: 'button', className: 'blk-tb-glass', 'aria-label': T('shell.tb.find'), title: T('shell.tb.find') }, '⌕');
    const box = find && el('input', { type: 'search', className: 'blk-tb-findbox', placeholder: T('shell.tb.find.ph'), 'aria-label': T('shell.tb.find'), autocomplete: 'off' });
    if (find) find.append(box, glass);
    bar.append(brand, dock, qbox, sw, doc, pins, addons, find);

    // ---- the Craft menu on the mark (UI.24) ----
    const craft = host.craft || null;
    const offs = [];
    let craftMenu = null, addonMenu = null;
    if (craft) {
      craftMenu = craft.menuFor(brand); craft.say = host.say;
      offs.push(craft.keys(brand.ownerDocument, () => craftMenu.open()));
      if (o.pins !== false) { const p = craft.mountPins(pins); offs.push(() => p.destroy()); }
      if (host.addons) addonMenu = craft.addonsFor(addons);
      const upd = () => { const n = craft.badgeTotal(), b = brand.querySelector('.blk-tb-badge'); b.hidden = !n; b.textContent = n; };
      upd(); offs.push(craft.onChange(upd));
    }

    // ---- quick-access tools ----
    function drawQuick() {
      qbox.replaceChildren(...quick.map((id) => {
        const c = host.cmd(id) || {}, label = c.label || id;
        const b = el('button', { type: 'button', className: 'blk-tool', 'data-cmd': id, title: label, 'aria-label': label, 'aria-pressed': c.pressed ? 'true' : null, 'aria-disabled': c.enabled === false ? 'true' : null }, c.icon instanceof Node ? c.icon.cloneNode(true) : (c.icon || label.slice(0, 2)));
        b.addEventListener('click', () => { if (c.enabled !== false) host.run?.(id); });
        if ((id === 'undo' || id === 'redo') && typeof host.history === 'function') {
          const car = el('button', { type: 'button', className: 'blk-tool blk-caret', 'aria-label': T('shell.tb.steps', { name: label }), title: T('shell.tb.steps', { name: label }) }, '▾');
          popMenu(car, (m, close) => {
            const steps = (host.history(id) || []).slice(0, 12);
            if (!steps.length) m.append(el('div', { className: 'blk-menu-empty' }, T('shell.tb.steps.none')));
            steps.forEach((s, i) => m.append(menuItem(s.label, () => { close(false); host.jump?.(id, i + 1); })));
          });
          return el('span', { className: 'blk-tool-pair' }, b, car);
        }
        return b;
      }));
    }
    qbox.addEventListener('contextmenu', (e) => { e.preventDefault(); picker(e); });
    function picker(e) {
      const anchor = el('button', { type: 'button', className: 'blk-picker-anchor' }); anchor.style.cssText = 'position:fixed;left:' + (e.clientX || 0) + 'px;top:' + ((e.clientY || 0) - 2) + 'px;width:1px;height:1px;opacity:0';
      bar.append(anchor);
      const m = popMenu(anchor, (menu, close) => {
        menu.classList.add('blk-picker');
        menu.append(el('div', { className: 'blk-menu-head' }, T('shell.tb.picker')));
        for (const id of (host.commands ? host.commands() : [])) {
          const c = host.cmd(id); if (!c) continue;
          menu.append(menuItem(c.label || id, () => { const r = quickToggle(quick, id); if (!r.ok) host.say?.(T('shell.tb.picker.full', { n: QUICK_MAX })); else { quick = r.list; st.set('quick', quick); drawQuick(); } close(false); anchor.remove(); }, { checked: quick.includes(id) }));
        }
      });
      m.open();
      anchor.ownerDocument.addEventListener('pointerdown', () => setTimeout(() => anchor.remove(), 0), { once: true, capture: true });
    }

    // ---- the workspace switcher ----
    function drawSwitch() {
      if (!sw) return;
      const cur = host.layout?.() || 'standard';
      sw.replaceChildren(...(host.layouts() || []).map((l) => el('option', { value: l.key, selected: l.key === cur ? '' : null }, l.name)));
      sw.value = cur;
    }
    sw?.addEventListener('change', () => host.setLayout?.(sw.value));

    // ---- Find: the command finder inline, folded to its glass when the bar is narrow ----
    function ask(text) {
      const q = String(text || '').trim();
      if (host.find) return host.find(q);
      if (window.ccPalette?.open) { window.ccPalette.open(); const b = document.querySelector('.shell-palette-input'); if (b && q) { b.value = q; b.dispatchEvent(new Event('input', { bubbles: true })); } }
    }
    find?.addEventListener('submit', (e) => { e.preventDefault(); ask(box.value); });
    glass?.addEventListener('click', () => { if (bar.classList.contains('is-find-folded')) { bar.classList.add('is-find-open'); box.focus(); } else ask(box.value); });
    box?.addEventListener('blur', () => bar.classList.remove('is-find-open'));
    const offW = onWidth(bar, (w) => bar.classList.toggle('is-find-folded', w > 0 && w < FOLD_FIND));

    addons.addEventListener('click', () => {});   // popMenu owns the click
    function refresh(s = (host.state?.() || {})) {
      doc.textContent = nameLabel(s.name, s.dirty, T('shell.tb.untitled'));
      doc.title = s.path || s.name || '';
      doc.classList.toggle('is-dirty', !!s.dirty);
      qbox.querySelectorAll('[data-cmd]').forEach((b) => {
        const c = host.cmd(b.getAttribute('data-cmd')) || {};
        if (c.pressed) b.setAttribute('aria-pressed', 'true'); else b.removeAttribute('aria-pressed');
        if (c.enabled === false) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      });
      drawSwitch();
    }
    drawQuick(); refresh();
    region.append(bar);
    return {
      el: bar, dock, craft, craftMenu, addonMenu, refresh, quick: () => quick.slice(),
      destroy() { offs.forEach((f) => f()); offW(); craftMenu?.close(false); addonMenu?.close(false); bar.remove(); },
    };
  },
};
