/* SPDX-License-Identifier: Apache-2.0 */
import { blockIcon } from './app-workspace-icons.js';
/**
 * app-workspace-popout.js — put a block of a workspace layout into its own window and back (the toolbox; the ribbon's own tear-off
 * in app-workspace.js works the same way). Moved from bimcraft/dev/workspace/popout.js (0.7 WS.6). One same-origin pop-up opened inside the click; the nodes move into it (their handlers and state go along);
 * the page's stylesheets, theme, interface size and toolbar style are copied and kept in step; keys there reach the main
 * window (shortcuts, Esc); closing it, or back(), brings the nodes home. A "…" menu like a panel's grip opens it (menuButton).
 *
 *   const p = popout({ name, title, nodes: [el…], listeners: [[type, fn, capture]…], onChange(open) })
 *   p.open() · p.back() · p.isOpen() · p.box (the window's wrapper while open)
 *   menuButton({ t, label, isOpen, open, back, extra }) → a "…" button whose menu offers Move to a new window / Put … back
 *   openMenu(btn, label, items) → { ul, close() }: the one "…" menu (items [[text, bi, run]]); menuButton, the one head (app-dock.js) and, with the
 *                                  owner's switch, the panels' grip menu (app-panels.js) all draw it
 *
 * 0.10 (session ui-dock2-10; only while html[data-cc-ws-edit="1"], the owner's switch, off: rule 62):
 *   windows.openWindow(name, features)   the one window.open of the interface: the panels window (app-panels.js) opens through it (UI.2)
 *   windows.register(name, unit)         a unit whose window someone else draws (the panels window) joins the registry, so units() is the one answer
 *   windows.remember(key)                UI.3: each torn-off block keeps { screen, x, y, w, h, out } under key() = cc-ws-windows:<app>:<layout>;
 *   windows.pending() · restore()        those that were out when the page closed, and "Restore my windows" (opens them inside one click)
 */
const isTyping = (t) => !!t?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
const switchOn = () => { try { return document.documentElement.getAttribute('data-cc-ws-edit') === '1'; } catch (e) { return false; } };

/** UI.2: every unit that can go to a window registers here, so "what is out right now" has one answer (windows.units()). */
const registry = new Map();
let memKey = null;   // UI.3: () => 'cc-ws-windows:<app>:<layout>' | null, set by the engine while the switch is on
const memRead = () => { const k = memKey?.(); if (!k) return null; try { const o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
const memWrite = (o) => { const k = memKey?.(); if (!k) return; try { if (Object.keys(o).length) localStorage.setItem(k, JSON.stringify(o)); else localStorage.removeItem(k); } catch (e) { /* this page only */ } };
const num = (v) => (typeof v === 'number' && isFinite(v) ? Math.round(v) : null);
/** The screen a window is on, by the Window Management API where it was granted before (never asked here), else null. */
async function screenOf(w) {
  try {
    if (typeof window.getScreenDetails !== 'function' || !navigator.permissions) return null;
    const p = await navigator.permissions.query({ name: 'window-management' }); if (p.state !== 'granted') return null;
    const d = await window.getScreenDetails(), cx = w.screenX + w.outerWidth / 2, cy = w.screenY + w.outerHeight / 2;
    const s = d.screens.find((x) => cx >= x.left && cx < x.left + x.width && cy >= x.top && cy < x.top + x.height);
    return s ? (s.label || 'screen') + '@' + s.left + ',' + s.top + ',' + s.width + 'x' + s.height : null;
  } catch (e) { return null; }
}
export const windows = {
  /** [{ name, out }] for every unit that has been made tearable on this page. */
  units: () => [...registry.entries()].map(([name, p]) => ({ name, out: p.isOpen(), title: p.title() })),
  /** UI.3 (studio-10): open the unit whose window title is `title` (the shell keys a window's place by app + title); true when one was found and opened. */
  openByTitle: (title) => { for (const p of registry.values()) if (p.title() === title) return p.open(); return false; },
  isOpen: (name) => !!registry.get(name)?.isOpen(),
  open: (name) => registry.get(name)?.open() ?? false,
  back: (name) => { registry.get(name)?.back(); },
  /** Every unit that is out comes home (a layout switch, a reset). */
  backAll: () => { for (const p of registry.values()) if (p.isOpen()) p.back(); },
  /** 0.10 UI.2: the one window.open (same-origin about:blank pop-up); null when the browser refused. */
  openWindow: (name, features) => window.open('', name, features),
  /** 0.10 UI.2: a unit drawn by its own code (the panels window) joins the registry: { open() → bool, back(), isOpen() → bool, title() → text }. */
  register: (name, unit) => { if (!switchOn() || !unit || typeof unit.open !== 'function') return false; registry.set(name, { open: unit.open, back: unit.back, isOpen: unit.isOpen, title: () => { try { return unit.title(); } catch (e) { return ''; } }, external: true }); return true; },
  menu: (btn, label, items) => openMenu(btn, label, items),
  /** 0.10 UI.3: where torn-off blocks are remembered (the engine passes () => 'cc-ws-windows:<app>:<layout>'; null = nothing remembered). */
  remember: (fn) => { memKey = typeof fn === 'function' ? fn : null; },
  /** UI.3: the units that were out when the page last closed (in this app and layout) and are not out now. */
  pending: () => { const m = memRead(); if (!m) return []; return Object.keys(m).filter((n) => m[n]?.out && registry.has(n) && !registry.get(n).isOpen()); },
  /** UI.3: "Restore my windows": opens every pending one inside one click; → { opened, blocked } (a browser may allow one pop-up per click). */
  restore: () => { let opened = 0, blocked = 0; for (const n of windows.pending()) { if (registry.get(n).open()) opened++; else blocked++; } return { opened, blocked }; },
  /** UI.3: forget the pending ones ("Keep them here"). */
  forget: () => { const m = memRead(); if (!m) return; for (const n of Object.keys(m)) if (m[n]) m[n].out = false; memWrite(m); },
};

try { window.ccWindows = windows; window.dispatchEvent(new Event('cc-windows')); } catch (e) { /* no window object (a test importing the file) */ }

export function popout({ name, title, nodes, listeners = [], onChange = () => {}, size = null, cls = '', boxCls = '', skipKeys = '' }) {
  let win = null, box = null, obs = null, poll = 0;
  const home = document.createComment('popout home: ' + name);   // i18n-ignore: a comment node
  /** UI.3: the window's place now ({ screen, x, y, w, h }), kept while it is out; `out` says whether it was out when the page closed. */
  const keep = async (out) => {
    const m = memRead(); if (!m || !win || win.closed) return;
    const q = m[name] || {}, w = win, x = num(w.screenX), y = num(w.screenY), iw = num(w.innerWidth), ih = num(w.innerHeight);
    if (iw > 100 && ih > 60) Object.assign(q, { x, y, w: iw, h: ih });
    q.out = out; const s = await screenOf(w); if (s) q.screen = s;
    m[name] = q; memWrite(m);
  };
  function open() {
    if (win && !win.closed) { win.focus(); return true; }
    const r = size ? size() : { w: 420, h: 640 };
    const q = memRead()?.[name];   // UI.3: the place it had last time (null while the switch is off)
    let f = 'popup,width=' + Math.round(q?.w || r.w) + ',height=' + Math.round(q?.h || r.h);
    if (q && num(q.x) !== null && num(q.y) !== null) f += ',left=' + q.x + ',top=' + q.y;
    const w = windows.openWindow('cc-' + name, f);
    if (!w) return false;
    win = w;
    const d = w.document;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body></body></html>'); d.close();   // i18n-ignore: markup
    d.title = title();
    try { window.ccTooltips && window.ccTooltips.attach(w); } catch (e) { /* the window keeps the browser's own tips */ }
    for (const l of document.querySelectorAll('link[rel="stylesheet"], style')) { const c = d.importNode(l, true); if (l.href) c.href = l.href; d.head.append(c); }
    const sync = () => {
      for (const a of ['data-space', 'data-theme', 'style', 'lang', 'dir']) { const v = document.documentElement.getAttribute(a); if (v === null) d.documentElement.removeAttribute(a); else d.documentElement.setAttribute(a, v); }
      d.body.className = document.body.className + ' ws-popout ' + cls;
      for (const a of ['data-shell-tb', 'data-shell-tb-touch']) { const v = document.body.getAttribute(a); if (v === null) d.body.removeAttribute(a); else d.body.setAttribute(a, v); }
    };
    sync(); obs = new MutationObserver(sync); obs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-shell-tb', 'data-shell-tb-touch'] }); obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-space', 'data-theme', 'style', 'lang', 'dir'] });   // PERF.56 (0.11): the attributes sync() copies, no others
    box = d.createElement('div'); box.className = 'ws-popout-box' + (boxCls ? ' ' + boxCls : '');
    for (const [type, fn, capture] of listeners) box.addEventListener(type, fn, capture);
    nodes[0].before(home);
    d.body.append(box); box.append(...nodes);
    d.addEventListener('keydown', (e) => {
      if (isTyping(e.target) || (skipKeys && e.target.closest?.(skipKeys))) return;
      const ev = new KeyboardEvent('keydown', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, bubbles: true, cancelable: true });
      document.body.dispatchEvent(ev); if (ev.defaultPrevented) e.preventDefault();
    });
    w.addEventListener('pagehide', () => back(true));
    if (memKey?.()) { keep(true); w.addEventListener('resize', () => keep(true)); poll = setInterval(() => { if (win === w && !w.closed) keep(true); }, 1000); }   // UI.3: moving a window has no event; poll as the panels window does
    onChange(true);
    return true;
  }
  function back(closing = false) {
    if (!box) return;
    obs?.disconnect(); obs = null; clearInterval(poll); poll = 0;
    if (!pageGoing) { const m = memRead(); if (m?.[name]) { m[name].out = false; memWrite(m); } }   // put back by a person: not "out" next time
    if (home.parentNode) { home.after(...nodes); home.remove(); }
    const w = win; win = null; box = null;
    if (!closing && w && !w.closed) w.close();
    onChange(false);
  }
  window.addEventListener('pagehide', () => { pageGoing = true; if (win && !win.closed) win.close(); });
  const unit = { open, back, isOpen: () => !!win && !win.closed, get box() { return box; }, title: () => { try { return title(); } catch (e) { return ''; } } };
  registry.set(name, unit);
  return unit;
}
let pageGoing = false;   // the page itself is closing: windows that close with it stay "out" for UI.3's Restore

/** The one "…" menu (the shape of a panel grip's menu, assets/js/app-panels.js openMenu): items [[text, bi, run]] under `btn`. → { ul, close(), onClose }. */
export function openMenu(btn, label, items) {
  const d = btn.ownerDocument;
  const ul = d.createElement('ul'); ul.className = 'shell-panel-menu'; ul.setAttribute('role', 'menu'); ul.setAttribute('aria-label', label);
  const m = { ul, onClose: null, close: () => { if (!ul.isConnected) return; ul.remove(); btn.setAttribute('aria-expanded', 'false'); d.removeEventListener('pointerdown', away, true); m.onClose?.(); } };
  for (const [text, ic, run] of items) {
    const li = d.createElement('li'); li.setAttribute('role', 'none');
    const b = d.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.tabIndex = -1;
    b.append(blockIcon({ bi: ic, block: 'popout' }), ' ' + text);
    b.addEventListener('click', (ev) => { ev.stopPropagation(); m.close(); run(); });   // inside the click: a window may open
    li.append(b); ul.append(li);
  }
  d.body.append(ul);
  const rb = btn.getBoundingClientRect(), mr = ul.getBoundingClientRect(), vw = d.defaultView.innerWidth, vh = d.defaultView.innerHeight;
  ul.style.left = Math.max(4, Math.min(rb.left, vw - mr.width - 4)) + 'px';
  ul.style.top = (rb.bottom + mr.height + 4 > vh ? Math.max(4, rb.top - mr.height - 2) : rb.bottom + 2) + 'px';
  const list = [...ul.querySelectorAll('[role="menuitem"]')];
  ul.addEventListener('keydown', (ev) => {
    const k = list.indexOf(d.activeElement);
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); list[(k + (ev.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus(); }
    else if (ev.key === 'Home' || ev.key === 'End') { ev.preventDefault(); list[ev.key === 'Home' ? 0 : list.length - 1]?.focus(); }
    else if (ev.key === 'Escape' || ev.key === 'Tab') { ev.preventDefault(); m.close(); btn.focus(); }
    ev.stopPropagation();   // the apps pan the drawing with arrow keys
  });
  const away = (ev) => { if (!ul.contains(ev.target) && !btn.contains(ev.target)) m.close(); };
  d.addEventListener('pointerdown', away, true);
  btn.setAttribute('aria-expanded', 'true'); list[0]?.focus();
  return m;
}

/** A "…" button whose menu (built like a panel grip's, assets/js/app-panels.js openMenu) moves the piece out or back. */
export function menuButton({ t, label, isOpen, open, back, backLabel, extra = [], noTear = false }) {
  let menu = null;
  const close = () => { if (!menu) return; menu.ul.remove(); menu.btn.setAttribute('aria-expanded', 'false'); menu.d.removeEventListener('pointerdown', menu.away, true); menu = null; };
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'shell-grip-btn ws-popout-menu'; btn.title = label; btn.setAttribute('aria-label', label);
  btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false');
  btn.append(blockIcon({ bi: 'bi-three-dots', block: 'popout' }));
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const again = menu?.btn === btn; close(); if (again) return;
    const d = btn.ownerDocument, out = isOpen();
    const items = [...extra, ...(noTear ? [] : out ? [[backLabel, 'bi-box-arrow-in-down-left', back]] : [[t('shell.ws.tear'), 'bi-window-plus', open]])];   // extra: [text, icon, run] rows the piece adds (the toolbox's Collapse all / Expand all)
    const ul = d.createElement('ul'); ul.className = 'shell-panel-menu'; ul.setAttribute('role', 'menu'); ul.setAttribute('aria-label', label);
    for (const [text, ic, run] of items) {
      const li = d.createElement('li'); li.setAttribute('role', 'none');
      const b = d.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.tabIndex = -1;
      b.append(blockIcon({ bi: ic, block: 'popout' }), ' ' + text);
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
