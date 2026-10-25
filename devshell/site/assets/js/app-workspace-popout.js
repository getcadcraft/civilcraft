/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-popout.js — put a block of a workspace layout into its own window and back (the toolbox; the ribbon's own tear-off
 * in app-workspace.js works the same way). Moved from bimcraft/dev/workspace/popout.js (0.7 WS.6). One same-origin pop-up opened inside the click; the nodes move into it (their handlers and state go along);
 * the page's stylesheets, theme, interface size and toolbar style are copied and kept in step; keys there reach the main
 * window (shortcuts, Esc); closing it, or back(), brings the nodes home. A "…" menu like a panel's grip opens it (menuButton).
 *
 *   const p = popout({ name, title, nodes: [el…], listeners: [[type, fn, capture]…], onChange(open) })
 *   p.open() · p.back() · p.isOpen() · p.box (the window's wrapper while open)
 *   menuButton({ t, label, isOpen, open, back }) → a "…" button whose menu offers Move to a new window / Put … back
 */
const isTyping = (t) => !!t?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

export function popout({ name, title, nodes, listeners = [], onChange = () => {}, size = null, cls = '' }) {
  let win = null, box = null, obs = null;
  const home = document.createComment('popout home: ' + name);   // i18n-ignore: a comment node
  function open() {
    if (win && !win.closed) { win.focus(); return true; }
    const r = size ? size() : { w: 420, h: 640 };
    const w = window.open('', 'cc-' + name, 'popup,width=' + Math.round(r.w) + ',height=' + Math.round(r.h));
    if (!w) return false;
    win = w;
    const d = w.document;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body></body></html>'); d.close();   // i18n-ignore: markup
    d.title = title();
    for (const l of document.querySelectorAll('link[rel="stylesheet"], style')) { const c = d.importNode(l, true); if (l.href) c.href = l.href; d.head.append(c); }
    const sync = () => {
      for (const a of ['data-space', 'data-theme', 'style', 'lang', 'dir']) { const v = document.documentElement.getAttribute(a); if (v === null) d.documentElement.removeAttribute(a); else d.documentElement.setAttribute(a, v); }
      d.body.className = document.body.className + ' ws-popout ' + cls;
      for (const a of ['data-shell-tb', 'data-shell-tb-touch']) { const v = document.body.getAttribute(a); if (v === null) d.body.removeAttribute(a); else d.body.setAttribute(a, v); }
    };
    sync(); obs = new MutationObserver(sync); obs.observe(document.body, { attributes: true }); obs.observe(document.documentElement, { attributes: true });
    box = d.createElement('div'); box.className = 'ws-popout-box';
    for (const [type, fn, capture] of listeners) box.addEventListener(type, fn, capture);
    nodes[0].before(home);
    d.body.append(box); box.append(...nodes);
    d.addEventListener('keydown', (e) => {
      if (isTyping(e.target)) return;
      const ev = new KeyboardEvent('keydown', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, bubbles: true, cancelable: true });
      document.body.dispatchEvent(ev); if (ev.defaultPrevented) e.preventDefault();
    });
    w.addEventListener('pagehide', () => back(true));
    onChange(true);
    return true;
  }
  function back(closing = false) {
    if (!box) return;
    obs?.disconnect(); obs = null;
    if (home.parentNode) { home.after(...nodes); home.remove(); }
    const w = win; win = null; box = null;
    if (!closing && w && !w.closed) w.close();
    onChange(false);
  }
  window.addEventListener('pagehide', () => { if (win && !win.closed) win.close(); });
  return { open, back, isOpen: () => !!win && !win.closed, get box() { return box; } };
}

/** A "…" button whose menu (built like a panel grip's, assets/js/app-panels.js openMenu) moves the piece out or back. */
export function menuButton({ t, label, isOpen, open, back, backLabel }) {
  let menu = null;
  const close = () => { if (!menu) return; menu.ul.remove(); menu.btn.setAttribute('aria-expanded', 'false'); menu.d.removeEventListener('pointerdown', menu.away, true); menu = null; };
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'shell-grip-btn ws-popout-menu'; btn.title = label; btn.setAttribute('aria-label', label);
  btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<i class="bi bi-three-dots" aria-hidden="true"></i>';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const again = menu?.btn === btn; close(); if (again) return;
    const d = btn.ownerDocument, out = isOpen();
    const items = out ? [[backLabel, 'bi-box-arrow-in-down-left', back]] : [[t('shell.ws.tear'), 'bi-window-plus', open]];
    const ul = d.createElement('ul'); ul.className = 'shell-panel-menu'; ul.setAttribute('role', 'menu'); ul.setAttribute('aria-label', label);
    for (const [text, ic, run] of items) {
      const li = d.createElement('li'); li.setAttribute('role', 'none');
      const b = d.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.tabIndex = -1;
      const i = d.createElement('i'); i.className = 'bi ' + ic; i.setAttribute('aria-hidden', 'true'); b.append(i, ' ' + text);
      b.addEventListener('click', (ev) => { ev.stopPropagation(); close(); run(); });
      li.append(b); ul.append(li);
    }
    d.body.append(ul);
    const rb = btn.getBoundingClientRect(), mr = ul.getBoundingClientRect(), vw = d.defaultView.innerWidth;
    ul.style.left = Math.max(4, Math.min(rb.left, vw - mr.width - 4)) + 'px'; ul.style.top = (rb.bottom + 2) + 'px';
    const list = [...ul.querySelectorAll('[role="menuitem"]')];
    ul.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); btn.focus(); } });
    const away = (ev) => { if (!ul.contains(ev.target) && !btn.contains(ev.target)) close(); };
    d.addEventListener('pointerdown', away, true);
    menu = { ul, btn, d, away }; btn.setAttribute('aria-expanded', 'true'); list[0]?.focus();
  });
  return btn;
}
