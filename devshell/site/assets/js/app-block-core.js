/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-core.js: what every interface block of 0.10 shares (UI.8 to UI.12, UI.16, UI.20, UI.24, UI.29, BK.123; session ui-blocks-10).
 * New files only: the engine (app-workspace.js) is `ui-layouts-10`'s, so a block here is a self-contained module that the engine mounts
 * through app-block-index.js (Inbox line to that session). The pattern every block follows is docs/INTERFACE-PATTERN.md.
 *
 * A block module exports `block = { kind, family, places, opts, needs, mount(host, region, opts) }`:
 *   kind     the block's name in a layout file (format v2 adds it to BLOCKS)         family  one of the pattern's families (section 2)
 *   places   where it may go (the first is its default)                              opts    { key: reader(value) → bounded value | undefined }
 *   needs    what the app's adapter must offer, as in resolveLayout (caps)            mount   builds the block in `region` (an element the engine
 *            owns) and returns { el, refresh(state), destroy() }; destroy() leaves nothing behind
 * `host` is the engine's adapter plus its ctx, and every member is optional (a block degrades, it never throws):
 *   app, T(key, vars) words, say(text), state() → { name, dirty, selection[], … }, cmd(id) → { label, icon, group, pressed, enabled } | null,
 *   run(id), commands() → [id], views() → { list, current, go }, layouts() → [{ key, name }], layout() → key, setLayout(key), find(text),
 *   view3d() → { orient, named }, nav() → { pan, zoom, window, orbit, extents }, units, scale() → { value, options, set }.
 * Storage: every key starts `cc-ws-` (pattern section 9) and is only touched inside try/catch.
 */
export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'className') e.className = v; else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) e.append(c instanceof Node ? c : String(c));
  return e;
}
export const svgEl = (tag, attrs = {}, ...kids) => {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) e.setAttribute(k, String(v));
  for (const c of kids.flat(Infinity)) if (c) e.append(c);
  return e;
};
export const FAMILIES = ['menus and title', 'ribbons and tool rows', 'toolboxes', 'palettes and panels', 'bars', 'overlays', 'views'];

/** A key of the `cc-ws-` family, per app; every read and write is guarded (private windows throw). */
export function store(app = '') {
  const k = (name) => 'cc-ws-' + name + (app ? ':' + app : '');
  return {
    key: k,
    get(name, fallback = null) { try { const v = localStorage.getItem(k(name)); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(name, value) { try { localStorage.setItem(k(name), JSON.stringify(value)); return true; } catch (e) { return false; } },
    drop(name) { try { localStorage.removeItem(k(name)); } catch (e) { /* nothing stored */ } },
  };
}
/** The block's words: the host's T, never a bare string. A missing key shows the key (the words test lists them). */
export const words = (host) => (key, vars) => (host && typeof host.T === 'function' ? host.T(key, vars) : key);
export const clampInt = (v, lo, hi, d) => (Number.isInteger(v) && v >= lo && v <= hi ? v : d);
export const oneOf = (list) => (v) => (list.includes(v) ? v : undefined);
export const bool = (v) => (v === true ? true : undefined);
export const idList = (max) => (v) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && /^[A-Za-z][A-Za-z0-9._:-]{0,47}$/.test(x)))].slice(0, max) : undefined);

/** A menu that opens under a button (the shell's popup look: role=menu, arrows, Esc closes and gives focus back). Returns { open, close, box }. */
export function popMenu(button, build, { cls = '' } = {}) {
  let box = null;
  const doc = () => button.ownerDocument;
  function close(back = true) {
    if (!box) return;
    box.remove(); box = null; button.setAttribute('aria-expanded', 'false');
    doc().removeEventListener('pointerdown', away, true); doc().removeEventListener('keydown', keys, true);
    if (back) button.focus?.();
  }
  function away(e) { if (box && !box.contains(e.target) && !button.contains(e.target)) close(false); }
  function keys(e) {
    if (!box) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    const items = [...box.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"])')];
    const i = items.indexOf(doc().activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
  }
  function open() {
    if (box) { close(); return; }
    box = el('div', { className: 'blk-menu ' + cls, role: 'menu' });
    build(box, close);
    const r = button.getBoundingClientRect();
    const vw = doc().defaultView?.innerWidth || 1024, vh = doc().defaultView?.innerHeight || 768;
    doc().body.append(box); button.setAttribute('aria-expanded', 'true');
    // opens under the button, or ABOVE it when there is no room below (the status bar's menus); never off the window
    const bh = box.offsetHeight, bw = box.offsetWidth;
    const below = r.bottom + 2, top = below + bh <= vh - 4 ? below : Math.max(4, r.top - bh - 2);
    box.style.left = Math.max(4, Math.min(r.left, vw - bw - 4)) + 'px'; box.style.top = top + 'px';
    doc().addEventListener('pointerdown', away, true); doc().addEventListener('keydown', keys, true);
    box.querySelector('[role^="menuitem"]')?.focus();
  }
  button.setAttribute('aria-haspopup', 'menu'); button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', open);
  return { open, close, get box() { return box; } };
}
export const menuItem = (label, onPick, { checked, disabled, kind = 'menuitem', hint } = {}) => {
  const b = el('button', { type: 'button', role: checked === undefined ? kind : 'menuitemcheckbox', 'aria-checked': checked === undefined ? null : String(!!checked), 'aria-disabled': disabled ? 'true' : null, className: 'blk-menu-item' },
    el('span', { className: 'blk-menu-label' }, label), hint ? el('kbd', {}, hint) : null);
  b.addEventListener('click', () => { if (!disabled) onPick(); });
  return b;
};
/** Run `fn` again when a box changes width (a bar that folds, never wraps). Falls back to the window's resize. */
export function onWidth(node, fn) {
  if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(() => fn(node.getBoundingClientRect().width)); ro.observe(node); return () => ro.disconnect(); }
  const h = () => fn(node.getBoundingClientRect().width); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h);
}
/** The one way a block says "I am here": a data attribute the layout checker and the tests find. */
export const mark = (node, kind) => { node.setAttribute('data-blk', kind); return node; };
