/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-statusx.js: the status bar's toggles (UI.11, footer bars). The reference footer holds the mode toggles (grid, snap, ortho, polar,
 * object snap, tracking, lineweight, transparency, selection cycling, annotation scale, workspace, isolate) as small buttons lit when on,
 * a scale slot, and a gear that chooses which toggles show. This block is that strip: `statustoggles`, a bar for `bottom` (beside or in
 * place of the engine's `statusbar`; the engine's statusbar takes it as its own part once ui-layouts-10 mounts it, Inbox line).
 *
 *   toggles   registry commands with a pressed state, drawn as icon buttons lit when on; the app says which it has through host.cmd(id).pressed
 *             (an app without the command simply has no button, nothing greyed); a click runs host.run(id)
 *   scale     host.scale() → { value, options: [..], set(v) }: a drop-down of the annotation scales (1:1 ...) shown only where the app has one
 *   gear      a menu that ticks toggles on and off; the choice is saved in the person's layout (cc-ws-status:<app>), the layout file's own list
 *             is only the start (format v2: toggles [ids], at most 16)
 *
 *   mount(host, region, opts) → { el, shown(), setShown(ids), refresh(), destroy() };   opts.toggles: [command ids]
 */
import { el, store, words, popMenu, menuItem, idList, mark } from './app-block-core.js';

export const TOGGLES = ['grid', 'snap', 'ortho', 'polar', 'osnap', 'track', 'lineweight', 'transparency', 'cycle', 'isolate', 'annoscale', 'workspace'];
export const MAX_TOGGLES = 16;
/** What a toggle says when the app has no icon for it (the app's own `short` wins): short, plain words. */
export const SHORT = { grid: 'GRID', snap: 'SNAP', ortho: 'ORTHO', polar: 'POLAR', osnap: 'OBJ', track: 'TRACK', lineweight: 'WT', transparency: 'TRANS', cycle: 'CYCLE', isolate: 'ISO', annoscale: 'ANN', workspace: 'WS' };
/** Which toggles show: the person's choice if saved, else the layout's list, else the standard set; only ones the app has, in the layout's order. */
export function shownToggles(saved, layoutList, has) {
  const base = Array.isArray(saved) ? saved : (Array.isArray(layoutList) && layoutList.length ? layoutList : TOGGLES);
  return [...new Set(base.filter((id) => typeof id === 'string' && has(id)))].slice(0, MAX_TOGGLES);
}

export const block = {
  kind: 'statustoggles', family: 'bars', places: ['bottom'], needs: [],
  opts: { toggles: idList(MAX_TOGGLES) },
  mount(host, region, o = {}) {
    const T = words(host), st = store(host.app || '');
    const has = (id) => !!host.cmd?.(id);
    const all = [...new Set([...(o.toggles || []), ...TOGGLES, ...(host.commands?.() || []).filter((id) => host.cmd(id)?.toggle)])].filter(has);
    let shown = shownToggles(st.get('status', null), o.toggles, has);
    const bar = mark(el('div', { className: 'blk-status', role: 'toolbar', 'aria-label': T('shell.sb.toggles') }), 'statustoggles');
    const tg = el('div', { className: 'blk-st-toggles' });
    const scaleBox = el('span', { className: 'blk-st-scale' });
    const gear = el('button', { type: 'button', className: 'blk-st-gear', 'aria-label': T('shell.sb.customize'), title: T('shell.sb.customize') }, '⚙');
    bar.append(tg, scaleBox, gear);
    function draw() {
      tg.replaceChildren(...shown.map((id) => {
        const c = host.cmd(id) || {}, label = c.label || id;
        const b = el('button', { type: 'button', className: 'blk-toggle', 'data-toggle': id, title: label, 'aria-label': label, 'aria-pressed': String(!!c.pressed), 'aria-disabled': c.enabled === false ? 'true' : null },
          c.icon instanceof Node ? c.icon.cloneNode(true) : (c.short || SHORT[id] || label.slice(0, 4).toUpperCase()));
        b.addEventListener('click', () => { if (c.enabled !== false) { host.run?.(id); refresh(); } });
        return b;
      }));
      const sc = host.scale?.();
      scaleBox.hidden = !sc;
      if (sc) {
        const sel = el('select', { className: 'blk-st-select', 'aria-label': T('shell.sb.scale') }, (sc.options || []).map((v) => el('option', { value: v, selected: v === sc.value ? '' : null }, v)));
        sel.addEventListener('change', () => sc.set?.(sel.value));
        scaleBox.replaceChildren(sel);
      }
    }
    popMenu(gear, (m, close) => {
      m.append(el('div', { className: 'blk-menu-head' }, T('shell.sb.customize.head')));
      for (const id of all) m.append(menuItem(host.cmd(id)?.label || id, () => { shown = shown.includes(id) ? shown.filter((x) => x !== id) : [...shown, id].slice(0, MAX_TOGGLES); st.set('status', shown); draw(); close(false); }, { checked: shown.includes(id) }));
      m.append(menuItem(T('shell.sb.customize.reset'), () => { st.drop('status'); shown = shownToggles(null, o.toggles, has); draw(); close(false); }));
    }, { cls: 'blk-status-menu' });
    function refresh() {
      tg.querySelectorAll('[data-toggle]').forEach((b) => { const c = host.cmd(b.getAttribute('data-toggle')) || {}; b.setAttribute('aria-pressed', String(!!c.pressed)); if (c.enabled === false) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled'); });
    }
    draw(); region.append(bar);
    return { el: bar, shown: () => shown.slice(), setShown(ids) { shown = shownToggles(ids, null, has); st.set('status', shown); draw(); }, refresh, destroy() { bar.remove(); } };
  },
};
