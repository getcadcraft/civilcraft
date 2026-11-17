/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-ribbonx.js: what the ribbon block lacks (UI.11, ribbons). The engine's ribbon (app-workspace.js, `ui-layouts-10`'s now)
 * draws each group's large and stacked small tools with the group's name under it and throws the DOM away on every tab change; this file
 * adds, as a decorator that survives that (a MutationObserver on the panel), the four things the row asks for, from the same adapter data:
 *   more     a group with `more: [ids]` gets a caret on its title that opens the rest of the group (the tool rows' details.tr-more look)
 *   slots    a group with `slots: [names]` holds the adapter's slot controls moved in (layer drop-down, colour / linetype / lineweight pickers
 *            "ByLayer" in a Properties group, a measure field), moved never copied, given back when the group goes
 *   context  the contextual tab is lit in the app's colour (`--layer`) and carries a one-line label of what is selected ("3 walls")
 *   keys     Alt shows the tab letters, Alt+<letter> picks the tab (letters are the first free letter of each tab's name)
 * A ribbon GROUP has no collapse control (owner, 2026-11-09): collapsing belongs to palettes and floating panels (UI.26) and a unit dropped
 * into a ribbon zone opens; the ribbon as a whole minimizes to its tab strip from the tab strip (DF.27), never per group. enhance() never
 * adds a collapse button to a group, and the test says so.
 *
 *   enhance(host, tabsEl, panelEl) → { destroy() }       tabsEl: nav.ws-ribbon-tabs, panelEl: .ws-ribbon (the engine's two elements)
 *   tabLetters(labels) → [letter | '']  ·  selectionLabel(state, T) → string  ·  moreIds(group, shown) → ids
 */
import { el, words, popMenu, menuItem } from './app-block-core.js';

/** The first letter of each label that no earlier tab took (case-insensitive); '' when none is left. */
export function tabLetters(labels) {
  const used = new Set();
  return labels.map((s) => { for (const ch of String(s || '').toUpperCase()) if (/[A-Z0-9]/.test(ch) && !used.has(ch)) { used.add(ch); return ch; } return ''; });
}
/** "3 walls", "1 door", "Nothing selected" ('' when the host says nothing): the contextual tab's one-line label. */
export function selectionLabel(state, T) {
  const sel = Array.isArray(state?.selection) ? state.selection : [];
  if (!sel.length) return '';
  const kinds = new Map();
  for (const s of sel) { const k = typeof s === 'string' ? s : (s?.kind || s?.type || ''); kinds.set(k, (kinds.get(k) || 0) + 1); }
  if (kinds.size === 1 && [...kinds.keys()][0]) return T('shell.rb.sel.kind', { n: sel.length, kind: [...kinds.keys()][0] });
  return T('shell.rb.sel.n', { n: sel.length });
}
/** The ids of a group's "more" list that the app really has (the rest is left out, never greyed). */
export const moreIds = (group, has) => (Array.isArray(group?.more) ? group.more.filter((id) => typeof id === 'string' && has(id)) : []);

export function enhance(host, tabsEl, panelEl) {
  const T = words(host), offs = [], held = [];   // held: [[node, home placeholder]] of slot controls moved in
  function decorate() {
    const data = (host.ribbon?.() || []);
    const tab = data.find((t) => panelEl.getAttribute('aria-label') === t.label) || null;
    const groups = [...panelEl.querySelectorAll(':scope > .ws-group')];
    groups.forEach((sec, i) => {
      const g = tab?.groups?.[i]; if (!g) return;
      sec.querySelector('.blk-more')?.remove();
      const ids = moreIds(g, (id) => !!host.tool?.(id, 'ribbon'));
      const title = sec.querySelector('.ws-group-title');
      if (ids.length && title && !title.querySelector('.blk-more')) {
        const b = el('button', { type: 'button', className: 'blk-more', 'aria-label': T('shell.rb.more', { group: g.label }), title: T('shell.rb.more', { group: g.label }) }, '▾');
        popMenu(b, (m, close) => ids.forEach((id) => { const t = host.tool(id, 'ribbon') || {}; m.append(menuItem(t.label || id, () => { close(false); host.run?.(id, 'ribbon'); }, { disabled: host.can?.(id, 'ribbon')?.enabled === false })); }), { cls: 'blk-more-menu' });
        title.append(b);
      }
      for (const name of g.slots || []) {
        const slot = host.slots?.[name]; if (!slot || sec.querySelector('[data-blk-slot="' + name + '"]')) continue;
        const holder = el('div', { className: 'blk-slot', 'data-blk-slot': name, role: 'group', 'aria-label': slot.label || name });
        for (const n of slot.nodes()) { const home = document.createComment('ribbon slot home'); if (n.parentNode) { n.before(home); held.push([n, home]); } holder.append(n); }
        sec.querySelector('.ws-group-tools')?.append(holder);
      }
      if (sec.querySelector('.blk-collapse')) sec.querySelector('.blk-collapse').remove();   // a group never collapses
    });
    // the contextual tab: lit in the app's colour, with what is selected
    const ctx = tabsEl.querySelector('.ws-context-tab');
    if (ctx) {
      ctx.classList.add('blk-context-lit');
      const label = selectionLabel(host.state?.() || {}, T);
      let sub = ctx.querySelector('.blk-context-label');
      if (label) { if (!sub) { sub = el('span', { className: 'blk-context-label' }); ctx.append(sub); } sub.textContent = label; } else sub?.remove();
    }
    // Alt letters
    const tabs = [...tabsEl.querySelectorAll('[data-ws-tab]')];
    const letters = tabLetters(tabs.map((b) => b.textContent));
    tabs.forEach((b, i) => { if (letters[i]) b.setAttribute('data-blk-key', letters[i]); else b.removeAttribute('data-blk-key'); });
  }
  const giveBack = () => { while (held.length) { const [n, home] = held.pop(); if (home.parentNode) { home.after(n); home.remove(); } } };
  let queued = 0;
  const later = () => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; observer.disconnect(); try { decorate(); } finally { watch(); } }); };
  const observer = new MutationObserver((muts) => { if (muts.some((m) => ![...m.addedNodes, ...m.removedNodes].every((n) => n.nodeType === 1 && /blk-/.test(n.className || '')))) { giveBack(); later(); } });
  const watch = () => { observer.observe(panelEl, { childList: true }); observer.observe(tabsEl, { childList: true }); };
  const doc = tabsEl.ownerDocument;
  const keydown = (e) => {
    if (e.key === 'Alt') { tabsEl.classList.add('blk-keys'); return; }
    if (!e.altKey || e.ctrlKey || e.metaKey || e.key.length !== 1) return;
    const b = tabsEl.querySelector('[data-blk-key="' + e.key.toUpperCase() + '"]');
    if (b) { e.preventDefault(); b.click(); b.focus(); }
  };
  const keyup = (e) => { if (e.key === 'Alt') tabsEl.classList.remove('blk-keys'); };
  doc.addEventListener('keydown', keydown); doc.addEventListener('keyup', keyup);
  decorate(); watch();
  return { decorate, destroy() { observer.disconnect(); doc.removeEventListener('keydown', keydown); doc.removeEventListener('keyup', keyup); giveBack(); panelEl.querySelectorAll('.blk-more,.blk-slot').forEach((n) => n.remove()); tabsEl.querySelectorAll('.blk-context-label').forEach((n) => n.remove()); offs.forEach((f) => f()); } };
}
