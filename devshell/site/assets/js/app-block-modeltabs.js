/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-modeltabs.js: the Model / Layout tabs under the drawing (UI.11, footer): a tab for every view the app has (viewtabs mode "all")
 * at view-bottom, with a "+" when the app can add a view (CadCraft paper space, BimCraft sheets). A new block rather than a second
 * `viewtabs` in the layout: the format takes a block kind once (validateLayout), and Drafting needs open files above and every view below.
 * The tabs scroll along their strip and never wrap (owner UI rule); a tab's own close button only where the app lets a view close.
 *   host.views = { list() → [{ id, kind, name, icon, closable }], current() → id, go(id), add?() → id, close?(id) }
 */
import { el, words, mark } from './app-block-core.js';

export const block = {
  kind: 'modeltabs', family: 'bars', places: ['view-bottom', 'view-top'], needs: ['views'], opts: {},
  mount(host, region) {
    const T = words(host), V = host.views || {};
    const nav = mark(el('nav', { className: 'blk-mtabs', role: 'tablist', 'aria-label': T('shell.mt.tabs') }), 'modeltabs');
    const strip = el('div', { className: 'blk-mtabs-strip' });
    nav.append(strip);
    const plus = typeof V.add === 'function' ? el('button', { type: 'button', className: 'blk-mtab-add', 'aria-label': T('shell.mt.add'), title: T('shell.mt.add') }, '+') : null;
    if (plus) { plus.addEventListener('click', () => { const id = V.add(); if (id) V.go?.(id); draw(); }); nav.append(plus); }
    function draw() {
      const cur = V.current?.();
      strip.replaceChildren(...(V.list?.() || []).map((v) => {
        const b = el('button', { type: 'button', role: 'tab', className: 'blk-mtab', 'data-view': v.id, 'aria-selected': String(v.id === cur), tabindex: v.id === cur ? 0 : -1 }, v.name);
        b.addEventListener('click', () => { V.go?.(v.id); draw(); });
        if (v.closable && V.close) { const x = el('button', { type: 'button', className: 'blk-mtab-x', 'aria-label': T('shell.mt.close', { name: v.name }), title: T('shell.mt.close', { name: v.name }) }, '×'); x.addEventListener('click', (e) => { e.stopPropagation(); V.close(v.id); draw(); }); return el('span', { className: 'blk-mtab-wrap' }, b, x); }
        return b;
      }));
    }
    nav.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const tabs = [...strip.querySelectorAll('[role="tab"]')], i = tabs.indexOf(nav.ownerDocument.activeElement); if (i < 0) return;
      e.preventDefault(); const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click();
    });
    draw(); region.append(nav);
    return { el: nav, refresh: draw, destroy() { nav.remove(); } };
  },
};
