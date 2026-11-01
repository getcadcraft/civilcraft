/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-tools-ui.js — what app-calc.js, app-reasons.js, app-totals.js and app-lessons.js share (round 2, session shell_PART_2): the element helper,
 * the shell's translator, and one themed panel with an app-bar button. Opening one of these panels closes the others, so they never stack.
 * Not loaded on its own: each of the four imports it.
 */
export const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);

export const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
};

export const readCfg = (id) => { try { return JSON.parse(document.getElementById(id)?.textContent || 'null'); } catch (e) { return null; } };
export const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window: this page keeps it */ } },
};

const panels = new Set();
/** A panel docked right under the bars, with a button in the app bar before Settings. `key` names the CSS hooks (cct-<key>). */
export function makePanel({ key, icon, titleKey, buttonKey, hidden = false, onOpen = null, onClose = null }) {
  const id = 'cct-' + key;
  const btn = h('button', { type: 'button', class: 'app-bar-btn app-bar-' + key, 'data-tool-open': key, 'aria-expanded': 'false', 'aria-controls': id, hidden,
    title: T(titleKey) }, h('i', { class: 'bi bi-' + icon, 'aria-hidden': 'true' }), h('span', { class: 'app-bar-btn-label', text: T(buttonKey || titleKey) }));
  const body = h('div', { class: 'cct-body' });
  const closeBtn = h('button', { type: 'button', class: 'cct-x', 'aria-label': T('shell.tools.close'), title: T('shell.tools.close') }, h('i', { class: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const head = h('div', { class: 'cct-head' }, h('h2', { class: 'cct-title', text: T(titleKey) }), h('span', { class: 'cct-sum', 'data-cct-sum': true }), closeBtn);
  const panel = h('section', { id, class: 'cct cct-' + key, role: 'dialog', 'aria-label': T(titleKey), hidden: true }, head, body);
  document.body.append(panel);
  const bar = document.querySelector('.app-bar');
  if (bar) bar.insertBefore(btn, bar.querySelector('.app-bar-settings, [data-settings-open]') || bar.querySelector('.app-bar-fs') || null);
  // Narrow screens (≤ 47.5rem, app-shell.css): the bar keeps only a few buttons and the rest live in "More", so each panel also has an item there
  // (app-tools.css hides the bar button at that width); it follows the button's hidden state.
  const menu = document.querySelector('.app-bar-more-menu');
  const more = menu ? h('button', { type: 'button', class: 'app-bar-more-item app-bar-more-tool', 'data-tool-more': key, hidden }, h('i', { class: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ' + T(buttonKey || titleKey)) : null;
  if (more) { const after = menu.querySelector('.app-bar-more-find'); if (after) after.after(more); else menu.prepend(more); }
  const top = () => { let y = 0; for (const el of document.querySelectorAll('.app-bar, .ws-top, .ws-titlebar')) { const r = el.getBoundingClientRect(); if (r.height && r.top < 4) y = Math.max(y, r.bottom); } return y || 52; };
  const api = {
    key, btn, panel, body, head, sum: head.querySelector('[data-cct-sum]'),
    get isOpen() { return !panel.hidden; },
    open() { for (const p of panels) if (p !== api && p.isOpen) p.close(); panel.style.setProperty('--cct-top', top() + 'px'); panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); if (onOpen) onOpen(); },
    close() { if (panel.hidden) return; panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (onClose) onClose(); btn.focus?.(); },
    toggle() { if (panel.hidden) api.open(); else api.close(); },
    show(on = true) { btn.hidden = !on; if (more) more.hidden = !on; },
  };
  panels.add(api);
  btn.addEventListener('click', () => api.toggle());
  if (more) more.addEventListener('click', () => { const d = more.closest('details'); if (d) d.open = false; api.toggle(); });
  closeBtn.addEventListener('click', () => api.close());
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); api.close(); } });
  return api;
}

/** Register one palette command, if the palette is there. */
export const palette = (cmd) => window.ccPalette?.register?.([cmd]);

/** The assistants' tools for an app's host.control (the same call Problems makes): every dev/agents.js with the module calls it. */
export function registerTools(control, defs, skip = []) {
  const s = new Set(skip); const offs = [];
  for (const d of defs) if (!s.has(d.name)) offs.push(control.tool(d));
  return () => offs.forEach((f) => f && f());
}
