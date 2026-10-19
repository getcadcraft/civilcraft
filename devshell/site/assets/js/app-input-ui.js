/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-input-ui.js — menu styles, keys and mouse on the page, for every app (0.5 track IP: IP.2 moved BimCraft's
 * input-ui.js here; IP.4 "use this style in every app"; IP.5 export / import; WL.18's carry). The engine is app-input.js.
 * Map: docs/apps/app-input.md.
 *
 * app-shell.inc loads this module only for builds whose manifest says "input": "<registry module>" (AppBuilds::input), with
 * <script type="application/json" id="cc-input">{ app, appName, registry }</script>. Released builds never load it.
 *
 * The registry module (each app's input-<slug>.js; app-input.js header) brings the commands and styles; optionally
 * `hooks(ctx)` → { toolbar(), why(cmd, button, generic), prepare(cmd) (async; '' = ready, else why not), keepKey(combo,
 * plain) (true = a running tool keeps this key), mouse(m) (the views follow it), runText(text) (WL.18 text keys),
 * commandLine: 'own' (the app has its own command line: no second one), keysIn(node) (true = keys still apply although the
 * focus is in this field: an app's own command line while nothing is typed in it) }, ctx = { root, t }. The app's own code may set
 * window.ccInputHooks = { status(text, isError), download(name, text, type), busy() } whenever it is ready (read at each use).
 *
 * The style's bar (a menu bar or a ribbon, plus a command line for styles that have one) is the first child of the app's
 * toolbar (<main>'s direct-child role=toolbar, or hooks.toolbar()); the toolbar's own buttons are hidden by CSS
 * (.cc-in-styled) but stay in the page, and every command runs by clicking its own button, so the app keeps one code
 * path for every style. Keys: one listener on window in the capture phase (before the app's): the profile's keys run
 * their commands, keys the profile keeps as the app's own pass through untouched, and the app's own keys for commands the
 * profile moved are swallowed with a word on where they went. Typing in fields, dialogs, the help panel and Settings is
 * never touched; neither are Esc, Enter, Tab, Delete, Backspace, Space and the arrows.
 * Settings › <App> › Menus, keys and mouse ([data-input-settings], printed by app-settings.inc): style cards, "Use this
 * style in every app", Customize…, Export, Import, Delete.
 * Stored: localStorage <registry STORE or '<slug>.input'> (app-input.js readState); the family for every app in
 * 'cc-input-family' (one origin: every app and the Studio hub read it; a change in another window follows at once).
 * window.ccInput = { current, setStyle, run, state, styles, commands, keysOf, paletteItems, covers, macros, setMacros,
 * family, useEverywhere, resetLayout, ribbon, setRibbon } for the palette, tests and the console.
 * 0.6 DF.27 (only where the Settings dialog carries data-shell-ui: dev builds and releases from 0.6 on): a ribbon style can
 * collapse to its tab names (S.collapsed, stored with the style): a click on a tab opens its panels over the drawing (.cc-in-peek)
 * until a command runs, a click lands elsewhere or Esc; a double-click on a tab, the pin button at the end of the tab row, or the
 * toolbar's right-click menu (app-settings.js) collapses it or pins it open. Phones keep their one-row ribbon (CSS).
 * Words: shell strings shell.input.*; the registry's own (input.cmd.*, input.grp.*, input.m.*, input.style.*) from the app.
 */
import * as IP from './app-input.js';

const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const has = (k) => !!(window.ccShellT && window.ccShellT.has && window.ccShellT.has(k));
const tx = (k) => (k && has(k) ? T(k) : String(k || ''));
const PASS = new Set(['Escape', 'Enter', 'Tab', 'Delete', 'Backspace', 'Space', 'Shift+Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
const UI06 = () => !!document.querySelector('[data-app-settings][data-shell-ui]');   // 0.6 layout tools (DF.27)
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* this tab keeps it */ } } };

/** el(tag, props, ...children): text only (never HTML); null children skipped. */
function el(tag, props, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'className') n.className = v;
    else if (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'value' || k === 'tabIndex' || k === 'type' || k === 'maxLength' || k === 'colSpan' || k === 'placeholder') n[k] = v;
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : String(c));
  return n;
}

async function boot() {
  const tag = document.getElementById('cc-input');
  if (!tag) return;
  let cfg;
  try { cfg = JSON.parse(tag.textContent || 'null'); } catch (e) { cfg = null; }
  if (!cfg || typeof cfg.registry !== 'string') return;
  let reg;
  // the registry's URL is the page's (the browser edition writes it relative to index.html), not this module's
  try { reg = await import(new URL(cfg.registry, document.baseURI).href); } catch (e) { console.warn('input: the registry did not load', e); return; }
  if (!Array.isArray(reg.COMMANDS) || !reg.STYLES || !Array.isArray(reg.STYLE_ORDER)) return;
  mount(cfg, reg);
}

function mount(cfg, reg) {
  const root = document.querySelector('body > main') || document.body;
  const COMMANDS = reg.COMMANDS, STYLES = reg.STYLES, GROUPS = reg.GROUPS || [...new Set(COMMANDS.map((c) => c.group))];
  const OWN = reg.STYLE_ORDER[0];
  const STORE = typeof reg.STORE === 'string' ? reg.STORE : cfg.app + '.input';
  const OPTS = { macros: !!reg.MACROS };
  const byId = new Map(COMMANDS.map((c) => [c.id, c]));
  const H = typeof reg.hooks === 'function' ? (reg.hooks({ root, t: T }) || {}) : {};
  const appHooks = () => window.ccInputHooks || {};
  const status = (text, bad) => { const f = appHooks().status; if (f) f(text, bad); else if (window.ccShellScreen && text) window.ccShellScreen.say(text); };
  const download = (name, text, type) => {
    const f = appHooks().download;
    if (f) return f(name, text, type);
    const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
    document.body.append(a); a.click(); a.remove();
  };
  const toolbar = (H.toolbar && H.toolbar()) || [...root.children].find((n) => n.getAttribute('role') === 'toolbar') || null;

  // ---- state (app-input.js) ----
  let S = IP.readState(store.get(STORE), reg);
  if (reg.CARRY) {   // WL.18: an older key store carried into the person's own profile once
    const r = IP.carryInto(S, reg, store.get(reg.CARRY.from), T('shell.input.carry.name', { app: cfg.appName }));
    if (r.state !== S) { S = r.state; save(); }
    if (r.carried) setTimeout(() => status(T('shell.input.carry.done', { n: Object.keys(r.carried.macros).length, style: r.carried.name })), 0);
  }
  S = IP.applyFamily(S, reg, IP.readFamily(store.get(IP.FAMILY_KEY)));
  function save() { store.set(STORE, IP.writeState(S)); }
  save();

  let prof = null, matcher = null, last = null, waitTimer = 0, recording = null, peek = false, rbody = null;
  const hist = [];
  const raw = (id) => IP.rawStyle(S, reg, id);
  const nameOf = (p) => (p.builtin ? tx(p.name) : p.name);
  const label = (id) => tx((prof && prof.labels && prof.labels[id]) || byId.get(id)?.label || id);

  // ---- running a command: click the app's own button ----
  const target = (c) => (c && c.sel ? root.querySelector(c.sel) || document.querySelector(c.sel) : null);
  function generic(c, b) {
    if (!b) return T('shell.input.why.nothere');
    if (b.disabled || b.getAttribute('aria-disabled') === 'true') return b.getAttribute('title') || T('shell.input.why.off');
    if (b.closest('[hidden]') && !b.closest('details')) return T('shell.input.why.off');
    return '';
  }
  const why = (c, b) => (H.why ? H.why(c, b, generic) : generic(c, b));
  async function run(id) {
    const c = byId.get(id);
    if (!c) return false;
    closeMenus();
    const w = why(c, target(c));
    if (w) { status(T('shell.input.cant', { cmd: label(id), why: w }), true); return false; }
    if (H.prepare) {
      const p = await H.prepare(c);
      if (p) { status(T('shell.input.cant', { cmd: label(id), why: p }), true); return false; }
    }
    target(c)?.click();
    last = id;
    syncStates();
    return true;
  }
  async function runText(text) {
    if (!H.runText) { status(T('shell.input.cant', { cmd: text, why: T('shell.input.why.nothere') }), true); return; }
    status(T('shell.input.key.text', { text }));
    await H.runText(text);
  }

  // ---- the bar ----
  const bar = el('div', { className: 'cc-inbar', 'data-input-bar': '' });
  const cmdInput = el('input', { type: 'text', className: 'cc-in-input cc-in-cmdinput', 'data-input-cmdline': '', autocomplete: 'off', spellcheck: 'false', 'aria-label': T('shell.input.cl.label') });
  const cmdMsg = el('span', { className: 'cc-in-cmdmsg', 'aria-live': 'polite' });
  if (toolbar) toolbar.prepend(bar);

  const kbdFor = (id) => { const k = matcher?.keysOf(id)[0]; return k ? el('kbd', {}, IP.showSeq(k)) : null; };
  function menuItem(id) {
    const c = byId.get(id);
    return el('button', { type: 'button', role: 'menuitem', 'data-cmd': id, className: 'cc-in-item' },
      el('i', { className: 'bi ' + (c.icon || 'bi-dot'), 'aria-hidden': 'true' }), el('span', {}, label(id)), kbdFor(id));
  }
  function menu(lbl, items, cls = '') {
    const list = el('div', { className: 'cc-in-list', role: 'menu', 'aria-label': tx(lbl) });
    for (const x of items) {
      if (x === '-') { if (list.lastChild && list.lastChild.tagName !== 'HR') list.append(el('hr')); continue; }
      const c = byId.get(x);
      if (!c || (c.optional && !target(c))) continue;
      list.append(menuItem(x));
    }
    if (list.lastChild?.tagName === 'HR') list.lastChild.remove();
    if (!list.children.length) return null;
    return el('details', { className: 'cc-in-menu ' + cls, 'data-in-menu': '' }, el('summary', { className: 'cc-in-mtitle' }, tx(lbl)), list);
  }
  function toolBtn(id, big) {
    const c = byId.get(id);
    if (!c || (c.optional && !target(c))) return null;
    const k = matcher?.keysOf(id)[0];
    return el('button', { type: 'button', className: big ? 'cc-in-tool cc-in-big' : 'cc-in-tool', 'data-cmd': id, title: label(id) + (k ? ' (' + IP.showSeq(k) + ')' : '') },
      el('i', { className: 'bi ' + (c.icon || 'bi-dot'), 'aria-hidden': 'true' }), el('span', {}, label(id)));
  }
  /** Toolbar buttons no command knows (an add-on's exporter, …): offered in a More menu / an Add-ons tab. */
  const dataKey = (n) => { const a = n.getAttributeNames().find((x) => x.startsWith('data-')); return a ? a + '=' + n.getAttribute(a) : null; };
  function extras() {
    if (!toolbar) return [];
    // a button is known when it does what a command's button does: the same first data-* attribute
    const known = new Set(COMMANDS.map((c) => target(c)).filter(Boolean).map(dataKey).filter(Boolean));
    return [...toolbar.querySelectorAll('button, [role="menuitem"]')].filter((b) => !bar.contains(b) && !b.closest('summary')
      && !known.has(dataKey(b)) && (b.textContent || b.title || '').trim());
  }
  function extraBtn(b, asItem) {
    const name = (b.querySelector('span')?.textContent || b.textContent || b.title || '').trim();
    const n = el('button', { type: 'button', className: asItem ? 'cc-in-item' : 'cc-in-tool cc-in-big', role: asItem ? 'menuitem' : null, title: b.title || name },
      el('i', { className: 'bi ' + ((b.querySelector('i.bi')?.className.match(/bi-[\w-]+/) || ['bi-puzzle'])[0]), 'aria-hidden': 'true' }), el('span', {}, name));
    n.addEventListener('click', () => { closeMenus(); b.click(); queueSync(); });
    return n;
  }

  function render() {
    prof = IP.resolve(raw(S.style) || STYLES[OWN], STYLES);
    matcher = new IP.KeyMatcher(prof, COMMANDS);
    if (H.mouse) H.mouse(prof.mouse);
    window.dispatchEvent(new CustomEvent('cc-input-mouse', { detail: prof.mouse }));
    root.dataset.inputStyle = prof.id;
    const styled = prof.layout !== 'toolbar';
    toolbar?.classList.toggle('cc-in-styled', styled);
    const cl = !!prof.commandLine && H.commandLine !== 'own';
    bar.hidden = !styled && !cl;
    bar.replaceChildren();
    bar.className = 'cc-inbar cc-inbar-' + prof.layout;
    if (prof.layout === 'menubar') {
      const row = el('div', { className: 'cc-in-menus', role: 'menubar', 'aria-label': T('shell.input.menus') });
      for (const mm of prof.menus || []) { const d = menu(mm.label, mm.items); if (d) row.append(d); }
      const ex = extras();
      if (ex.length) row.append(el('details', { className: 'cc-in-menu', 'data-in-menu': '' }, el('summary', { className: 'cc-in-mtitle' }, T('shell.input.more')), el('div', { className: 'cc-in-list', role: 'menu' }, ex.map((b) => extraBtn(b, true)))));
      bar.append(row);
      if ((prof.bar || []).length) {
        const q = el('div', { className: 'cc-in-quickbar', role: 'group', 'aria-label': T('shell.input.quickbar', { app: cfg.appName }) });
        for (const x of prof.bar) { const b = x === '-' ? el('span', { className: 'cc-in-sep', 'aria-hidden': 'true' }) : toolBtn(x); if (b) q.append(b); }
        bar.append(q);
      }
    } else if (prof.layout === 'ribbon') {
      const tabs = prof.tabs || [];
      const ex = extras();
      const coll = UI06() && !!S.collapsed;
      if (!coll) peek = false;
      const all = ex.length ? [...tabs, { label: 'shell.input.addons', panels: [{ label: 'shell.input.addons', extra: true }] }] : tabs;
      if (S.tab >= all.length) S.tab = 0;
      const head = el('div', { className: 'cc-in-rhead' });
      const fileM = (prof.menus || [])[0] ? menu(prof.menus[0].label, prof.menus[0].items, 'cc-in-file') : null;
      if (fileM) head.append(fileM);
      const tl = el('div', { className: 'cc-in-tabs', role: 'tablist', 'aria-label': T('shell.input.tabs') });
      all.forEach((tb, i) => {
        const b = el('button', { type: 'button', role: 'tab', className: 'cc-in-tab', 'aria-selected': i === S.tab ? 'true' : 'false', tabIndex: i === S.tab ? 0 : -1, 'aria-expanded': coll ? (peek && i === S.tab ? 'true' : 'false') : null }, tx(tb.label));
        b.addEventListener('click', () => {
          if (coll) peek = !(peek && i === S.tab);   // collapsed: a tab opens its panels over the drawing; the same tab again closes them
          S.tab = i; save(); render(); bar.querySelector('[role="tab"][aria-selected="true"]')?.focus();
        });
        if (UI06()) b.addEventListener('dblclick', () => setRibbon(!S.collapsed));
        tl.append(b);
      });
      tl.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); e.stopPropagation();
        S.tab = (S.tab + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length; save(); render();
        bar.querySelector('[role="tab"][aria-selected="true"]')?.focus();
      });
      head.append(tl);
      const quick = el('div', { className: 'cc-in-quick', role: 'group', 'aria-label': T('shell.input.quick') });
      for (const x of prof.quick || []) { const b = toolBtn(x); if (b) { b.classList.add('cc-in-icon'); quick.append(b); } }
      head.append(quick);
      if (UI06()) {
        const pin = el('button', { type: 'button', className: 'cc-in-pin', 'data-ribbon-pin': '', 'aria-pressed': coll ? 'false' : 'true',
          title: T(coll ? 'shell.input.ribbon.pin' : 'shell.input.ribbon.collapse'), 'aria-label': T(coll ? 'shell.input.ribbon.pin' : 'shell.input.ribbon.collapse') },
          el('i', { className: 'bi ' + (coll ? 'bi-pin-angle' : 'bi-chevron-bar-up'), 'aria-hidden': 'true' }));
        pin.addEventListener('click', () => setRibbon(!S.collapsed));
        head.append(pin);
      }
      bar.append(head);
      const body = el('div', { className: 'cc-in-rbody' + (coll && !peek ? ' cc-in-folded' : ''), role: 'tabpanel', 'aria-label': tx(all[S.tab]?.label) });
      rbody = body;
      bar.classList.toggle('cc-in-collapsed', coll);
      bar.classList.toggle('cc-in-peek', coll && peek);
      for (const pn of (all[S.tab]?.panels || [])) {
        const btns = pn.extra ? ex.map((b) => extraBtn(b, false)) : pn.items.map((x) => toolBtn(x, true)).filter(Boolean);
        if (!btns.length) continue;
        body.append(el('div', { className: 'cc-in-panel', role: 'group', 'aria-label': tx(pn.label) }, el('div', { className: 'cc-in-pbtns' }, btns), el('div', { className: 'cc-in-plabel' }, tx(pn.label))));
      }
      bar.append(body);
    }
    if (cl) {
      cmdMsg.textContent = cmdMsg.textContent || T('shell.input.cl.ready');
      bar.append(el('div', { className: 'cc-in-cmd' }, el('label', { className: 'cc-in-cmdlabel' }, el('span', {}, T('shell.input.cl.prompt')), cmdInput), cmdMsg));
    }
    syncStates();
    renderSettings();
  }

  // pressed / unavailable states follow the app's own buttons
  function syncStates() {
    for (const b of bar.querySelectorAll('[data-cmd]')) {
      const c = byId.get(b.dataset.cmd), mine = target(c);
      const pressed = mine?.getAttribute('aria-pressed');
      if (pressed) b.setAttribute('aria-pressed', pressed); else b.removeAttribute('aria-pressed');
      const w = why(c, mine);
      b.setAttribute('aria-disabled', w ? 'true' : 'false');
      if (b.getAttribute('role') === 'menuitem') b.title = w || '';
    }
  }
  let syncQueued = false;
  function queueSync() { if (syncQueued) return; syncQueued = true; requestAnimationFrame(() => { syncQueued = false; syncStates(); }); }
  new MutationObserver((recs) => { if (recs.some((r) => !bar.contains(r.target))) queueSync(); })
    .observe(root, { subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-disabled', 'disabled', 'hidden'] });

  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cmd]');
    if (b && bar.contains(b)) { e.preventDefault(); if (peek) fold(); run(b.dataset.cmd); }
  });
  /** A collapsed ribbon's open panels go away again (a command ran, a click elsewhere, Esc). */
  function fold() {
    if (!peek) return;
    peek = false;
    bar.classList.remove('cc-in-peek');
    rbody?.classList.add('cc-in-folded');
    for (const t of bar.querySelectorAll('.cc-in-tab')) t.setAttribute('aria-expanded', 'false');
  }
  bar.addEventListener('keydown', (e) => { if (peek && e.key === 'Escape' && !e.target.closest('details[data-in-menu]')) { e.preventDefault(); e.stopPropagation(); fold(); bar.querySelector('[role="tab"][aria-selected="true"]')?.focus(); } });
  /** DF.27: collapse a ribbon style to its tab names (true) or pin it open (false). */
  function setRibbon(c) {
    if (!!S.collapsed === !!c) return;
    S = { ...S, collapsed: c ? true : undefined };
    peek = false;
    save(); render();
    if (prof?.layout === 'ribbon') status(T(c ? 'shell.input.ribbon.collapsed' : 'shell.input.ribbon.pinned'));
  }
  // menus: one open at a time, a click elsewhere or Esc closes, arrows move between items and menus
  function closeMenus(except) { for (const d of bar.querySelectorAll('details[open]')) if (d !== except) d.open = false; }
  bar.addEventListener('toggle', (e) => { if (e.target.open) { closeMenus(e.target); syncStates(); } }, true);
  document.addEventListener('pointerdown', (e) => { if (!bar.contains(e.target)) { closeMenus(); fold(); } }, true);
  bar.addEventListener('pointerover', (e) => {   // a menu bar: moving over the next title opens it while one is open
    const s = e.target.closest('summary');
    if (!s || !bar.querySelector('details[open]')) return;
    const d = s.parentElement;
    if (!d.open) { closeMenus(); d.open = true; }
  });
  bar.addEventListener('keydown', (e) => {
    const d = e.target.closest('details[data-in-menu]');
    if (!d) return;
    const items = [...d.querySelectorAll('[role="menuitem"]')];
    const menus = [...bar.querySelectorAll('details[data-in-menu]')];
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); d.open = false; d.querySelector('summary').focus(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation();
      if (!d.open) d.open = true;
      const i = items.indexOf(document.activeElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1 + (i < 0 ? 1 : 0))) % items.length]?.focus();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); e.stopPropagation();
      const j = (menus.indexOf(d) + (e.key === 'ArrowRight' ? 1 : menus.length - 1)) % menus.length;
      const wasOpen = d.open;
      closeMenus();
      menus[j].querySelector('summary').focus();
      if (wasOpen) { menus[j].open = true; menus[j].querySelector('[role="menuitem"]')?.focus(); }
    }
  });

  // ---- keys ----
  const inField = (n) => n?.closest?.('input, textarea, select, [contenteditable="true"], dialog, [data-help-panel], [data-app-settings]');
  window.addEventListener('keydown', (e) => {
    if (!prof || e.defaultPrevented || e.isComposing || recording) return;
    if (prof.id === OWN && !matcher.text.size) return;   // the app's own style, unchanged: nothing at all happens
    // hooks.keysIn(node): the app's own command line takes a style's keys while it is empty (CadCraft; 0.5 IP.3)
    if (e.target === cmdInput || (inField(e.target) && !(H.keysIn && H.keysIn(e.target))) || document.querySelector('dialog[open]')) return;
    const combo = IP.eventCombo(e);
    if (!combo) return;
    if (PASS.has(combo)) { matcher.reset(); return; }
    // a running tool keeps its own keys (the app says which: placing, walking, typed lengths …)
    const plain = !/^(Ctrl|Alt)\+/.test(combo) && !/^F\d/.test(combo);
    if (plain && appHooks().busy && appHooks().busy()) return;
    if (H.keepKey && H.keepKey(combo, plain)) return;
    if (prof.commandLine && H.commandLine !== 'own' && plain && IP.isTyping(combo) && !matcher.buf.length) {
      e.preventDefault(); e.stopImmediatePropagation();
      cmdInput.focus();
      cmdInput.value += e.key.length === 1 ? e.key.toUpperCase() : '';
      return;
    }
    const r = matcher.press(combo);
    clearTimeout(waitTimer);
    if (!r || r.native) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (r.wait) {
      status(T('shell.input.key.wait', { keys: IP.showSeq(r.wait) }));
      waitTimer = setTimeout(() => { matcher.reset(); status(''); }, 1500);
      return;
    }
    if (r.text) { runText(r.text); return; }
    if (r.run) { status(''); run(r.run); return; }
    if (r.blocked) {
      const k = matcher.keysOf(r.blocked)[0];
      status(k ? T('shell.input.key.moved', { cmd: label(r.blocked), keys: IP.showSeq(k), style: nameOf(prof) })
        : T('shell.input.key.none', { cmd: label(r.blocked), style: nameOf(prof), app: cfg.appName }));
    }
  }, true);

  // ---- the command line (styles with one) ----
  let hi = -1;
  cmdInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); cmdInput.value = ''; cmdInput.blur(); cmdMsg.textContent = T('shell.input.cl.ready'); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!hist.length) return;
      hi = e.key === 'ArrowUp' ? Math.max(0, (hi < 0 ? hist.length : hi) - 1) : Math.min(hist.length, hi + 1);
      cmdInput.value = hist[hi] || '';
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const word = cmdInput.value.trim();
    cmdInput.value = '';
    hi = -1;
    const id = word ? IP.matchTyped(prof, word) : last;   // Enter on nothing repeats the last command
    if (!id) { cmdMsg.textContent = word ? T('shell.input.cl.unknown', { word: word.toUpperCase().slice(0, 30) }) : T('shell.input.cl.ready'); return; }
    if (word) { hist.push(word.toUpperCase()); if (hist.length > 50) hist.shift(); }
    cmdMsg.textContent = label(id);
    cmdInput.blur();
    run(id);
  });

  // ---- Settings › <App> › Menus, keys and mouse ----
  const setHost = document.querySelector('[data-input-settings]');
  const fileIn = el('input', { type: 'file', accept: IP.EXT + ',.json,application/json', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true' });
  const sharedFamily = () => IP.readFamily(store.get(IP.FAMILY_KEY));
  function renderSettings() {
    if (!setHost) return;
    const cards = el('div', { className: 'cc-in-cards', role: 'radiogroup', 'aria-label': T('shell.input.legend') });
    const list = [...reg.STYLE_ORDER.map((id) => STYLES[id]), ...S.custom];
    for (const p of list) {
      const r = IP.resolve(p, STYLES);
      const on = p.id === S.style;
      cards.append(el('label', { className: 'cc-in-card' + (on ? ' is-on' : '') },
        el('input', { type: 'radio', name: 'ccInputStyle', value: p.id, checked: on }),
        el('span', { className: 'cc-in-thumb cc-in-thumb-' + r.layout + (r.commandLine ? ' has-cmd' : ''), 'aria-hidden': 'true' }, el('i'), el('i'), el('i')),
        el('span', { className: 'cc-in-cname' }, nameOf(p))));
    }
    const cur = IP.resolve(raw(S.style) || STYLES[OWN], STYLES);
    const desc = cur.builtin ? tx('input.style.' + cur.id + '.hint') : T('shell.input.custom.hint', { base: cur.base ? tx(STYLES[cur.base].name) : '' });
    const btn = (k, fn, extra = {}) => { const b = el('button', { type: 'button', className: 'btn-line btn-sm-cc', ...extra }, T(k)); b.addEventListener('click', fn); return b; };
    // IP.4: one family for every app
    const fam = IP.familyOf(reg, S, S.style), sh = sharedFamily();
    const every = el('input', { type: 'checkbox', 'data-input-every': '', checked: !!(fam && sh && sh.family === fam), disabled: !fam });
    every.addEventListener('change', () => useEverywhere(every.checked));
    setHost.replaceChildren(
      cards,
      el('p', { className: 'shell-hint-text' }, desc),
      el('label', { className: 'shell-check' }, every, ' ', T('shell.input.every')),
      el('p', { className: 'shell-hint-text', 'data-input-every-hint': '' }, fam ? T('shell.input.every.hint', { family: T('shell.input.family.' + fam) }) : T('shell.input.every.none')),
      el('div', { className: 'cc-in-setbtns' },
        btn('shell.input.customize', () => customize()),
        btn('shell.input.export', () => exportCur()),
        btn('shell.input.import', () => fileIn.click()),
        cur.builtin ? null : btn('shell.input.delete', () => removeCur())),
      fileIn);
  }
  setHost?.addEventListener('change', (e) => {
    if (e.target.name !== 'ccInputStyle') return;
    e.stopPropagation();
    setStyle(e.target.value);
  });
  function setStyle(id) {
    if (!raw(id)) return false;
    S = IP.pickStyle(S, reg, id, Date.now());
    save(); render();
    status(T('shell.input.now', { style: nameOf(raw(id)) }));
    return true;
  }
  /** IP.4: this style's family for every app (on), or every app keeps its own (off). */
  function useEverywhere(on) {
    const fam = IP.familyOf(reg, S, S.style);
    if (on && fam) {
      const at = Date.now();
      store.set(IP.FAMILY_KEY, IP.writeFamily(fam, at));
      S = { ...S, family: fam, familyAt: at, mine: { ...S.mine, [fam]: S.style } };
      save();
      status(T('shell.input.every.on', { family: T('shell.input.family.' + fam) }));
    } else {
      try { localStorage.removeItem(IP.FAMILY_KEY); } catch (e) { /* nothing stored */ }
      status(T('shell.input.every.off'));
    }
    renderSettings();
    return true;
  }
  // another window (another app, or the Studio hub) chose a family for every app: follow it now
  window.addEventListener('storage', (e) => {
    if (e.key === STORE && e.newValue) { S = IP.readState(e.newValue, reg); render(); return; }
    if (e.key !== IP.FAMILY_KEY) return;
    const next = IP.applyFamily(S, reg, IP.readFamily(e.newValue));
    if (next !== S) { S = next; save(); render(); } else renderSettings();
  });
  function exportCur() {
    const p = IP.resolve(raw(S.style), STYLES);
    download(IP.exportName(nameOf(p)), IP.exportProfile({ ...p, name: nameOf(p), base: p.builtin ? p.id : p.base }), 'application/json');
  }
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files && fileIn.files[0];
    fileIn.value = '';
    if (!f) return;
    if (f.size > IP.LIMITS.bytes) { status(T('shell.input.import.big'), true); return; }
    importText(await f.text());
  });
  /** IP.5: a .ccinput.json (a file, or an input add-on's data) → one of the person's own styles. */
  function importText(text) {
    const r = IP.importProfile(text, COMMANDS, STYLES, OPTS);
    if (!r.ok) { status(T('shell.input.import.bad'), true); return null; }
    if (!r.profile.name) r.profile.name = T('shell.input.import.unnamed');
    const a = IP.addCustom(S, r.profile);
    S = a.state;
    setStyle(a.profile.id);
    status(r.problems.length ? T('shell.input.import.some', { name: a.profile.name, n: r.problems.length }) : T('shell.input.import.ok', { name: a.profile.name }), r.problems.length > 0);
    return a.profile;
  }
  function removeCur() {
    const i = S.custom.findIndex((c) => c.id === S.style);
    if (i < 0) return;
    const base = S.custom[i].base || OWN;
    const mine = Object.fromEntries(Object.entries(S.mine).filter(([, v]) => v !== S.style));
    S = { ...S, custom: S.custom.filter((_, j) => j !== i), mine };
    setStyle(Object.prototype.hasOwnProperty.call(STYLES, base) ? base : OWN);
  }
  /** WL.18: the current profile's text keys, and setting them (a built-in gets a person's own copy first). */
  function macros() { return IP.macroMap(prof); }
  function setMacros(map) {
    let p = IP.resolve(raw(S.style), STYLES);
    const builtin = !!p.builtin;
    p = { ...p, macros: undefined };
    for (const [k, v] of map) p = IP.setMacro(p, k, v) || p;
    const q = { ...p, builtin: false, base: builtin ? p.id : p.base, labels: undefined, name: builtin ? T('shell.input.carry.name', { app: cfg.appName }) : p.name };
    if (builtin) { const a = IP.addCustom(S, q); S = IP.pickStyle(a.state, reg, a.profile.id, Date.now()); }
    else S = { ...S, custom: S.custom.map((c) => (c.id === S.style ? { ...q, id: S.style } : c)) };
    save(); render();
  }

  // ---- Customize… ----
  function customize() {
    let draft = IP.resolve(raw(S.style), STYLES);
    const builtin = !!draft.builtin;
    const dlg = el('dialog', { className: 'cc-in-dlg', 'aria-labelledby': 'cc-in-dlg-h' });
    const nameIn = el('input', { type: 'text', className: 'cc-in-input', maxLength: IP.LIMITS.name, value: builtin ? T('shell.input.my', { style: nameOf(draft) }) : draft.name, 'aria-label': T('shell.input.dlg.name') });
    const filter = el('input', { type: 'search', className: 'cc-in-input', placeholder: T('shell.input.dlg.filter'), 'aria-label': T('shell.input.dlg.filter') });
    const warn = el('div', { className: 'cc-in-warn', 'aria-live': 'polite' });
    const tbody = el('tbody');
    const places = () => {
      const o = [['', T('shell.input.dlg.nowhere')]];
      if (draft.layout === 'menubar') (draft.menus || []).forEach((mm, i) => o.push([String(i), tx(mm.label)]));
      if (draft.layout === 'ribbon') {
        (draft.menus || []).forEach((mm, i) => o.push(['m' + i, tx(mm.label)]));
        (draft.tabs || []).forEach((tb, ti) => tb.panels.forEach((pn, pi) => o.push([ti + '/' + pi, tx(tb.label) + ' › ' + tx(pn.label)])));
      }
      return o;
    };
    const placeVal = (id) => {
      if (draft.layout === 'menubar') { const i = (draft.menus || []).findIndex((mm) => mm.items.includes(id)); return i < 0 ? '' : String(i); }
      if (draft.layout === 'ribbon') {
        const mi = (draft.menus || []).findIndex((mm) => mm.items.includes(id));
        if (mi >= 0) return 'm' + mi;
        for (let ti = 0; ti < (draft.tabs || []).length; ti++) for (let pi = 0; pi < draft.tabs[ti].panels.length; pi++) if (draft.tabs[ti].panels[pi].items.includes(id)) return ti + '/' + pi;
      }
      return '';
    };
    function rows() {
      const q = filter.value.trim().toLowerCase();
      tbody.replaceChildren();
      for (const g of GROUPS) {
        const cmds = COMMANDS.filter((c) => c.group === g && (!q || label(c.id).toLowerCase().includes(q) || c.id.includes(q)));
        if (!cmds.length) continue;
        tbody.append(el('tr', { className: 'cc-in-grp' }, el('th', { colSpan: 3, scope: 'colgroup' }, tx('input.grp.' + g))));
        for (const c of cmds) {
          const keys = (draft.keys && draft.keys[c.id]) || [];
          const kcell = el('td', { className: 'cc-in-keys' });
          if (c.fixed) kcell.append(el('kbd', {}, (c.defKeys || []).map(IP.showSeq).join(', ')), ' ', el('span', { className: 'cc-in-sub' }, T('shell.input.dlg.fixed')));
          else {
            keys.forEach((k, i) => {
              const x = el('button', { type: 'button', className: 'cc-in-chip', title: T('shell.input.dlg.removekey', { keys: IP.showSeq(k) }) }, IP.showSeq(k), el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }));
              x.addEventListener('click', () => { draft = IP.setKeys(draft, c.id, keys.filter((_, j) => j !== i)); rows(); checks(); });
              kcell.append(x);
            });
            if (keys.length < IP.LIMITS.keysPerCommand) {
              const add = el('button', { type: 'button', className: 'cc-in-link' }, T('shell.input.dlg.addkey'));
              add.addEventListener('click', () => record(add, (seq) => { draft = IP.setKeys(draft, c.id, [...keys, seq]); rows(); checks(); }));
              kcell.append(add);
            }
          }
          let pcell = el('td', {}, el('span', { className: 'cc-in-sub' }, draft.layout === 'toolbar' ? T('shell.input.dlg.toolbar') : '—'));
          if (draft.layout !== 'toolbar' && !c.keyOnly) {
            const sel = el('select', { className: 'select-cc cc-in-where', 'aria-label': T('shell.input.dlg.where', { cmd: label(c.id) }) }, places().map(([v, l]) => el('option', { value: v }, l)));
            sel.value = placeVal(c.id);
            sel.addEventListener('change', () => { draft = IP.moveCommand(draft, c.id, sel.value || null); checks(); });
            pcell = el('td', {}, sel);
          }
          tbody.append(el('tr', {}, el('td', {}, el('i', { className: 'bi ' + (c.icon || 'bi-dot'), 'aria-hidden': 'true' }), ' ', label(c.id)), pcell, kcell));
        }
      }
    }
    function checks() {
      const cs = IP.conflicts(draft, COMMANDS);
      const un = IP.unplaced(draft, COMMANDS);
      const lab = (x) => (x.startsWith('text:') ? x.slice(5) : label(x));
      warn.replaceChildren(
        ...cs.slice(0, 6).map((c) => el('p', { className: 'cc-in-bad' }, el('i', { className: 'bi bi-exclamation-triangle', 'aria-hidden': 'true' }), ' ',
          c.kind === 'prefix' ? T('shell.input.dlg.prefix', { keys: IP.showSeq(c.seq), longer: IP.showSeq(c.longer) })
            : T('shell.input.dlg.clash', { keys: IP.showSeq(c.seq), cmds: c.ids.map(lab).join(', ') }))),
        un.length ? el('p', { className: 'cc-in-sub' }, T('shell.input.dlg.unplaced', { n: un.length, cmds: un.slice(0, 5).map(label).join(', ') })) : null);
      saveBtn.disabled = cs.length > 0;
    }
    // keys are recorded by pressing them: one combination, or two in a row for a sequence ("W" then "A")
    function record(btn, done) {
      const got = [];
      btn.textContent = T('shell.input.dlg.press');
      const finish = (ok) => {
        dlg.removeEventListener('keydown', onKey, true);
        clearTimeout(recording);
        recording = null;
        if (ok && got.length) done(got.join(' ')); else rows();
      };
      const onKey = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.key === 'Escape' && !got.length) { finish(false); return; }
        const c = IP.eventCombo(e);
        if (!c) return;
        if (PASS.has(c) && c !== 'Delete' && c !== 'Backspace' && !got.length && c !== 'Space') { finish(false); return; }
        got.push(c);
        btn.textContent = got.map(IP.showSeq).join(' ') + '…';
        clearTimeout(recording);
        if (got.length >= 2 || /^(Ctrl|Alt)\+|^F\d/.test(c)) finish(true);
        else recording = setTimeout(() => finish(true), 900);   // a single key, unless a second follows quickly
      };
      recording = -1;
      dlg.addEventListener('keydown', onKey, true);
    }
    // mouse
    const mo = () => draft.mouse;
    const wheelSel = el('select', { className: 'select-cc', 'aria-label': T('shell.input.mouse.wheel') },
      el('option', { value: '1' }, T('shell.input.mouse.wheel.normal')), el('option', { value: '-1' }, T('shell.input.mouse.wheel.flip')));
    wheelSel.value = String(mo().wheel);
    wheelSel.addEventListener('change', () => { draft.mouse = { ...mo(), wheel: Number(wheelSel.value) }; });
    const speed = el('input', { type: 'range', min: '0.25', max: '4', step: '0.25', value: String(mo().zoomSpeed), 'aria-label': T('shell.input.mouse.speed') });
    const speedOut = el('output', { className: 'tabular' }, mo().zoomSpeed + '×');
    speed.addEventListener('input', () => { draft.mouse = { ...mo(), zoomSpeed: Number(speed.value) }; speedOut.textContent = speed.value + '×'; });
    const panBoxes = IP.BUTTONS.map((b) => {
      const i = el('input', { type: 'checkbox', checked: mo().pan2d.includes(b) });
      i.addEventListener('change', () => { const s = new Set(mo().pan2d); if (i.checked) s.add(b); else s.delete(b); draft.mouse = { ...mo(), pan2d: IP.BUTTONS.filter((x) => s.has(x)) }; });
      return el('label', { className: 'shell-check' }, i, ' ', T('shell.input.mouse.' + b));
    });
    const ownBtns = el('input', { type: 'checkbox', checked: !mo().orbit3d });
    const sel3 = IP.BUTTONS.map((b) => {
      const s = el('select', { className: 'select-cc', 'aria-label': T('shell.input.mouse.3d.of', { button: T('shell.input.mouse.' + b) }) }, IP.ACTIONS_3D.map((a) => el('option', { value: a }, T('shell.input.mouse.act.' + a))));
      s.value = (mo().orbit3d || IP.MOUSE_DEFAULT.orbit3d)[b];
      s.disabled = !mo().orbit3d;
      s.addEventListener('change', () => { draft.mouse = { ...mo(), orbit3d: { ...(mo().orbit3d || IP.MOUSE_DEFAULT.orbit3d), [b]: s.value } }; });
      return el('label', { className: 'cc-in-m3' }, el('span', {}, T('shell.input.mouse.' + b)), s);
    });
    ownBtns.addEventListener('change', () => {
      draft.mouse = { ...mo(), orbit3d: ownBtns.checked ? null : { ...IP.MOUSE_DEFAULT.orbit3d } };
      sel3.forEach((l, i) => { const s = l.querySelector('select'); s.disabled = ownBtns.checked; s.value = (draft.mouse.orbit3d || IP.MOUSE_DEFAULT.orbit3d)[IP.BUTTONS[i]]; });
    });

    const saveBtn = el('button', { type: 'button', className: 'btn-plot btn-sm-cc' }, T('shell.input.dlg.save'));
    const cancel = el('button', { type: 'button', className: 'btn-line btn-sm-cc' }, T('shell.input.dlg.cancel'));
    const tabsEl = el('div', { className: 'cc-in-dtabs', role: 'tablist' });
    const paneKeys = el('div', { role: 'tabpanel', className: 'cc-in-pane' }, el('div', { className: 'cc-in-filter' }, filter), warn,
      el('div', { className: 'cc-in-tablewrap' }, el('table', { className: 'cc-in-table' }, el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, T('shell.input.dlg.cmd')), el('th', { scope: 'col' }, T('shell.input.dlg.place')), el('th', { scope: 'col' }, T('shell.input.dlg.keys')))), tbody)));
    const paneMouse = el('div', { role: 'tabpanel', className: 'cc-in-pane cc-in-mouse', hidden: true },
      el('fieldset', { className: 'shell-set' }, el('legend', {}, T('shell.input.mouse.wheel')), wheelSel, el('label', { className: 'cc-in-speed' }, el('span', {}, T('shell.input.mouse.speed')), el('span', { className: 'shell-range' }, speed, speedOut))),
      el('fieldset', { className: 'shell-set' }, el('legend', {}, T('shell.input.mouse.pan2d')), el('div', { className: 'cc-in-row' }, panBoxes), el('p', { className: 'shell-hint-text' }, T('shell.input.mouse.pan2d.hint'))),
      el('fieldset', { className: 'shell-set' }, el('legend', {}, T('shell.input.mouse.3d')), el('label', { className: 'shell-check' }, ownBtns, ' ', T('shell.input.mouse.3d.own')), el('div', { className: 'cc-in-row' }, sel3), el('p', { className: 'shell-hint-text' }, T('shell.input.mouse.3d.hint'))));
    [['keys', paneKeys], ['mouse', paneMouse]].forEach(([k, pane], i) => {
      const b = el('button', { type: 'button', role: 'tab', className: 'cc-in-dtab', 'aria-selected': i ? 'false' : 'true' }, T('shell.input.dlg.tab.' + k));
      b.addEventListener('click', () => { tabsEl.querySelectorAll('[role="tab"]').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false')); paneKeys.hidden = k !== 'keys'; paneMouse.hidden = k !== 'mouse'; });
      tabsEl.append(b);
    });
    dlg.append(
      el('h2', { className: 'cc-in-h', id: 'cc-in-dlg-h' }, T('shell.input.dlg.title', { style: nameOf(draft) })),
      el('p', { className: 'cc-in-sub' }, builtin ? T('shell.input.dlg.copy') : T('shell.input.dlg.edit')),
      el('label', { className: 'cc-in-name' }, el('span', {}, T('shell.input.dlg.name')), nameIn),
      tabsEl, paneKeys, paneMouse,
      el('div', { className: 'cc-in-dfoot' }, cancel, saveBtn));
    filter.addEventListener('input', rows);
    cancel.addEventListener('click', () => dlg.close());
    saveBtn.addEventListener('click', () => {
      const name = nameIn.value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, IP.LIMITS.name) || T('shell.input.my', { style: nameOf(draft) });
      const p = { ...draft, name, builtin: false, base: builtin ? draft.id : draft.base, labels: undefined };
      if (builtin) { const a = IP.addCustom(S, p); S = IP.pickStyle(a.state, reg, a.profile.id, Date.now()); }
      else S = { ...S, custom: S.custom.map((c) => (c.id === S.style ? { ...p, id: S.style } : c)) };
      save(); dlg.close(); render();
      status(T('shell.input.dlg.saved', { style: name }));
    });
    dlg.addEventListener('close', () => dlg.remove());
    rows(); checks();
    // opens over the Settings dialog (modal dialogs stack); Esc or Cancel goes back to it
    document.body.append(dlg);
    dlg.showModal();
    filter.focus();
  }

  // ---- the command palette (app-palette.js): each command with the key of the style in use ----
  function paletteItems() {
    // the app bar's own buttons (Help, Settings, the palette itself) are listed by the palette as the shell's
    return COMMANDS.filter((c) => !(c.optional && !target(c)) && !target(c)?.closest('.app-bar')).map((c) => {
      const w = why(c, target(c));
      const k = matcher?.keysOf(c.id)[0] || '';
      const place = IP.placeOf(prof, c.id);
      const where = place === '@bar' || place === '@quick' || !place ? '' : place.split('\u0000').map(tx).join(' › ');
      return { id: 'input:' + c.id, label: label(c.id), group: where || tx('input.grp.' + c.group), key: k ? IP.showSeq(k) : '', disabled: !!w, hint: w || '', run: () => run(c.id) };
    });
  }
  /** Is this toolbar element one the palette should leave to paletteItems() (a command's own button, or the bar)? */
  const ownButtons = () => new Set(COMMANDS.map(target).filter(Boolean));
  function covers(node) { return bar.contains(node) || ownButtons().has(node); }

  render();
  // the toolbar's own content changes (an add-on adds a button, the DetailCraft hand-off appears): offer it
  if (toolbar) new MutationObserver((recs) => { if (prof.layout !== 'toolbar' && recs.some((r) => !bar.contains(r.target) && r.target !== bar)) render(); }).observe(toolbar, { childList: true });
  const api = {
    app: cfg.app, current: () => prof, setStyle, run, get state() { return S; }, styles: STYLES, commands: COMMANDS,
    keysOf: (id) => (matcher ? matcher.keysOf(id).map(IP.showSeq) : []), paletteItems, covers, macros, setMacros,
    family: () => IP.familyOf(reg, S, S.style), useEverywhere, importText,
    // 0.6 DF.8 (app-settings.js "Reset the layout"): the style this app starts with; the person's own styles stay listed
    resetLayout() { S = { ...IP.resetStyle(S, reg, sharedFamily(), Date.now()), collapsed: undefined }; peek = false; save(); render(); },
    ribbon: () => ({ on: UI06() && prof?.layout === 'ribbon', collapsed: !!S.collapsed, open: peek }),
    setRibbon,
  };
  window.ccInput = api;
  window.dispatchEvent(new CustomEvent('cc-input-ready', { detail: { app: cfg.app } }));
  return api;
}

boot();
