/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-shell.js — screen modes for every app's browser UI (app-shell.inc loads it; app-bar.inc has the button).
 *
 * One button (and Ctrl+Shift+F) cycles three modes:
 *   normal      the window as it is
 *   full        browser full screen; the app bar and the app's toolbar stay
 *   autohide    full screen and the bars slide away; they come back while the pointer is at the
 *               top edge (or a tap there, or keyboard focus inside them) and hide again after
 * Without the Fullscreen API (iPhone Safari) the cycle is normal → autohide → normal.
 * Esc (the browser's own full-screen exit) drops back to normal. Nothing is remembered:
 * full screen needs a click or key press every time.
 *
 * The bars are the app bar plus any toolbar that is a direct child of <main> (CadCraft,
 * MarkupCraft, TakeoffCraft); every app redraws through its ResizeObserver when they go. A workspace layout that puts the
 * toolbar in the drawing area (.ws-toolbar-strip, app-workspace.js) keeps it a bar: it hides with the others.
 *
 * 0.6 DF.8 (dev builds and releases from 0.6: the Settings dialog carries data-shell-ui): while the bars are hidden a small
 * "Show bars" tab stays at the top middle of the window (.shell-showbars), so a person who never found the top edge still
 * sees the way back; a click (or Enter) shows the bars, and from the keyboard puts the focus in the app bar so they stay.
 */
/* Shell strings (0.4 item 0.2; docs/LANG.md): assets/lang/shell/<locale>.json, embedded in the page with the app's
 * strings as #cc-lang by Lang::bootTag() (app-shell.inc). window.ccShellT(key, vars) is the shell's t() for its classic
 * scripts (app-settings.js, app-panels.js, app-offline.js) and help-panel.js: the same fills and plurals as i18n.js,
 * read from the same tag, so it works before (or without) any module loading i18n.js. A key with no string comes back
 * as the key (bin/test-shell-lang.mjs fails on any). */
(function () {
  'use strict';
  if (window.ccShellT) return;
  var cat = null, rules = {};
  function catalog() {
    if (cat) return cat;
    try { var tag = document.getElementById('cc-lang'); cat = tag ? JSON.parse(tag.textContent || 'null') : null; } catch (e) { cat = null; }
    if (!cat || typeof cat.strings !== 'object' || !cat.strings) cat = { locale: 'en', strings: {} };
    return cat;
  }
  function plural(forms, n, loc) {
    if (n !== undefined && n !== null && typeof forms['=' + n] === 'string') return forms['=' + n];
    var c = 'other';
    if (n !== undefined && n !== null) {
      try { rules[loc] = rules[loc] || new Intl.PluralRules(loc); c = rules[loc].select(Number(n)); } catch (e) { c = 'other'; }
    }
    return typeof forms[c] === 'string' ? forms[c] : forms.other;
  }
  window.ccShellT = function (key, vars) {
    var c = catalog(), v = c.strings[key];
    vars = vars || {};
    if (v === undefined || v === null) return key;
    var text = typeof v === 'string' ? v : plural(v, vars.n, c.locale);
    return String(text === undefined ? key : text).replace(/\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g, function (m, k) {
      if (m === '{{') return '{';
      if (m === '}}') return '}';
      return Object.prototype.hasOwnProperty.call(vars, k) && vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m;
    });
  };
  window.ccShellT.locale = function () { return catalog().locale; };
  // header.inc writes lang="en"; the page's text is in the catalog's language.
  if (document.getElementById('cc-lang') && document.documentElement.lang !== catalog().locale) document.documentElement.lang = catalog().locale;
  window.ccShellT.has = function (key) { var c = catalog(); return Object.prototype.hasOwnProperty.call(c.strings, key); };
})();

/* The desktop app (window.cadcraftDesktop, set by the desktop shell before the page loads) runs the browser edition
 * unchanged: its area chip says "Desktop", not "Browser edition" (desktop.md W.4 request). */
(function () {
  'use strict';
  if (!window.cadcraftDesktop) return;
  document.documentElement.classList.add('is-desktop');
  var chip = document.querySelector('.app-bar-area');
  if (chip && window.ccShellT && window.ccShellT.has('shell.bar.desktop')) chip.textContent = window.ccShellT('shell.bar.desktop');
})();

(function () {
  'use strict';
  var T = window.ccShellT;
  var body = document.body;
  var btn = document.querySelector('[data-fs-cycle]');
  if (!body.classList.contains('app-shell') || !btn) return;

  var root = document.documentElement;
  var canFull = !!(root.requestFullscreen && document.fullscreenEnabled !== false);
  var ORDER = canFull ? ['normal', 'full', 'autohide'] : ['normal', 'autohide'];
  var NEXT_LABEL = { full: T('shell.screen.next.full'), autohide: T('shell.screen.next.autohide'), normal: canFull ? T('shell.screen.next.exit') : T('shell.screen.next.show') };
  var NOW_LABEL = { normal: T('shell.screen.now.normal'), full: T('shell.screen.now.full'), autohide: canFull ? T('shell.screen.now.autohide') : T('shell.screen.now.hidden') };
  var ICON = { full: 'bi-fullscreen', autohide: 'bi-window-fullscreen', normal: 'bi-fullscreen-exit' };

  var mode = 'normal';
  var hideTimer = 0;
  var hintTimer = 0;
  var icon = btn.querySelector('.bi');
  var label = btn.querySelector('.app-bar-fs-label');

  var edge = document.createElement('div');
  edge.className = 'shell-edge';
  edge.setAttribute('aria-hidden', 'true');
  var hint = document.createElement('p');
  hint.className = 'shell-hint';
  hint.setAttribute('role', 'status');
  body.append(edge, hint);

  // 0.6 DF.8: the always-visible way back while the bars are hidden
  var tab = null;
  if (document.querySelector('[data-app-settings][data-shell-ui]')) {
    tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'shell-showbars';
    tab.setAttribute('data-show-bars', '');
    tab.title = T('shell.showbars.title', { key: 'Ctrl+Shift+F' });
    var ti = document.createElement('i');
    ti.className = 'bi bi-chevron-bar-down';
    ti.setAttribute('aria-hidden', 'true');
    tab.append(ti, document.createTextNode(' ' + T('shell.showbars')));
    // no reveal on hover: the bars would slide in under the pointer and take the click meant for the tab
    tab.addEventListener('click', function (e) {
      if (mode !== 'autohide') return;
      reveal(true);
      if (e.detail === 0) {   // keyboard: into the app bar, where the focus keeps the bars shown
        var first = document.querySelector('.app-bar button:not([hidden]), .app-bar summary, .app-bar a');
        if (first) first.focus();
      } else hideSoon();
    });
    // Enter / Space here, not on the document: several apps take Enter for their own command line
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      tab.click();
    });
    body.append(tab);
  }

  function bars() {
    var out = [];
    var bar = document.querySelector('.app-bar');
    if (bar) out.push(bar);
    var main = document.querySelector('body.app-shell > main');
    if (main) for (var i = 0; i < main.children.length; i++) {
      if (main.children[i].getAttribute('role') === 'toolbar' && !main.children[i].hidden) out.push(main.children[i]);
    }
    // a workspace layout moved the toolbar into the drawing area (app-workspace.js: .ws-toolbar-strip in a stage region): still a bar
    var strip = main && main.querySelector('.ws-region > .ws-toolbar-strip');
    if (strip && !strip.hidden && out.indexOf(strip) === -1) out.push(strip);
    return out;
  }

  /** Stack the bars at the top (fixed) and remember how tall they are together. */
  function place() {
    var top = 0;
    bars().forEach(function (b) {
      b.classList.add('shell-bar');
      b.style.setProperty('--bar-top', top + 'px');
      top += b.getBoundingClientRect().height;
    });
    body.style.setProperty('--bars-h', top + 'px');
  }

  function unplace() {
    document.querySelectorAll('.shell-bar').forEach(function (b) {
      b.classList.remove('shell-bar');
      b.style.removeProperty('--bar-top');
    });
    body.style.removeProperty('--bars-h');
  }

  function reveal(on) {
    clearTimeout(hideTimer);
    body.classList.toggle('shell-reveal', !!on);
  }

  function hideSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      var a = document.activeElement;
      var busy = body.classList.contains('shell-arranging') || bars().some(function (b) { return b.matches(':hover') || (a && b.contains(a)) || b.querySelector('details[open]'); });
      if (busy) hideSoon(); else reveal(false);
    }, 700);
  }

  function say(text) {
    clearTimeout(hintTimer);
    hint.textContent = text;
    body.classList.add('shell-hinting');
    hintTimer = setTimeout(function () { body.classList.remove('shell-hinting'); }, 3200);
  }

  function render() {
    var next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    if (icon) icon.className = 'bi ' + ICON[next];
    if (label) label.textContent = NEXT_LABEL[next];
    btn.setAttribute('aria-label', T('shell.screen.btn.aria', { next: NEXT_LABEL[next], now: NOW_LABEL[mode] }));
    btn.title = T('shell.screen.btn.title', { now: NOW_LABEL[mode], next: NEXT_LABEL[next], key: 'Ctrl+Shift+F' });
    btn.setAttribute('aria-pressed', mode === 'normal' ? 'false' : 'true');
  }

  function apply(m) {
    mode = m;
    body.classList.toggle('shell-full', m !== 'normal');
    if (m === 'autohide') {
      place();
      body.classList.add('shell-autohide');
      reveal(false);
      say(document.fullscreenElement ? T('shell.screen.say.hidden_full') : T('shell.screen.say.hidden'));
    } else {
      body.classList.remove('shell-autohide');
      reveal(false);
      unplace();
      if (m === 'full') say(T('shell.screen.say.full', { key: 'Ctrl+Shift+F' }));
    }
    render();
  }

  function cycle() {
    var next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    if (next === 'full' || (next === 'autohide' && canFull && !document.fullscreenElement)) {
      var p = root.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) {
        p.then(function () { apply(next); }, function () { say(T('shell.screen.say.refused')); });
        return;
      }
      apply(next);
    } else if (next === 'normal') {
      apply('normal');
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } else {
      apply(next);
    }
  }

  /** Go straight to a mode (app-settings.js: the "when the app opens" default). Full screen needs a
   *  click or key press, so call it from one; 'autohide' without one hides the bars in the window. */
  function goTo(m) {
    if (ORDER.indexOf(m) === -1) return;
    if (m === 'normal') { if (mode !== 'normal') cycleTo('normal'); return; }
    if (canFull && !document.fullscreenElement && navigator.userActivation && navigator.userActivation.isActive) {
      var p = root.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) { p.then(function () { apply(m); }, function () { if (m === 'autohide') apply(m); }); return; }
    }
    if (m === 'autohide' || document.fullscreenElement) apply(m);
  }
  function cycleTo(m) {
    apply(m);
    if (m === 'normal' && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
  }
  // reveal(true) shows hidden bars until the pointer leaves them (app-settings.js: Arrange the toolbar keeps them out meanwhile)
  window.ccShellScreen = { goTo: goTo, mode: function () { return mode; }, canFull: canFull, say: say, reveal: function (on) { if (mode !== 'autohide') return; reveal(on); if (!on) return; hideSoon(); } };

  btn.hidden = false;
  render();
  btn.addEventListener('click', function () { cycle(); });

  // Capture phase: the apps send typing to their own command lines; this combination is ours.
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && (e.code === 'KeyF' || e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      e.stopPropagation();
      cycle();
    }
  }, true);

  // Esc or the browser's own controls left full screen: back to normal.
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && mode !== 'normal' && canFull) apply('normal');
  });

  edge.addEventListener('pointerenter', function () { reveal(true); });
  edge.addEventListener('pointerdown', function () { reveal(true); hideSoon(); });
  document.addEventListener('pointerover', function (e) {
    if (mode !== 'autohide' || !body.classList.contains('shell-reveal')) return;
    if (!e.target.closest || !e.target.closest('.shell-bar, .shell-edge, .shell-showbars')) hideSoon();
  });
  document.addEventListener('pointerdown', function (e) {
    if (mode === 'autohide' && !body.classList.contains('shell-arranging') && e.target.closest && !e.target.closest('.shell-bar, .shell-edge, .shell-showbars')) reveal(false);
  });
  document.addEventListener('focusin', function (e) {
    if (mode !== 'autohide') return;
    if (e.target.closest && e.target.closest('.shell-bar')) reveal(true); else hideSoon();
  });
  window.addEventListener('resize', function () { if (mode === 'autohide') place(); });
})();

/* Dialogs (0.7 D7.05, session studio-07; map docs/apps/app-dialogs.md): every in-page <dialog> can be moved by its title bar,
 * and a dialog that asks for it (data-popout) opens in a window of its own in Studio, as the panels do.
 *
 *   move      press and drag the dialog's title bar (the heading's row: a heading with only buttons beside it); a double-click
 *             on the bar centres it again; Alt+Shift+arrows move it from the keyboard (16 px, Shift+Alt+Ctrl 64 px). The
 *             place is remembered per dialog in localStorage "cc-dialog-places:<slug>" and brought back on screen when the
 *             window is smaller. Not on phones (up to 760 px wide: the dialogs are sheets there).
 *   own window  a dialog marked data-popout gets a button in its title bar when the page runs in the desktop shell
 *             (window.cadcraftDesktop: Studio and the desktop apps). The <dialog> moves into one same-origin pop-up with
 *             adoptNode, so its listeners and the app's references survive; it is shown there without the page behind it
 *             going inert. Closing the dialog (its own close button, or the app calling close()) closes the window and puts
 *             the element back; closing the window closes the dialog. showModal() on a dialog in its window just brings the
 *             window forward.
 * window.ccShellDialogs is the small API the tests use. */
(function () {
  'use strict';
  var meta = document.querySelector('[data-app-settings]');
  var SLUG = meta && meta.getAttribute('data-app');
  if (!SLUG || window.ccShellDialogs) return;
  var T = window.ccShellT || function (k) { return k; };
  var APP = (meta && meta.getAttribute('data-app-name')) || 'App';
  var KEY = 'cc-dialog-places:' + SLUG;
  var small = window.matchMedia ? window.matchMedia('(max-width: 760px)') : { matches: false };   // i18n-ignore (a media query)
  var ready = typeof WeakSet === 'function';
  if (!ready) return;
  var set = new WeakSet();
  var popped = [];   // [{d, w, home: {parent, next}, showModal, show}]
  var root = document.documentElement;
  var NO_DRAG = 'button, a, input, select, textarea, summary, label, [contenteditable], [role="button"], [role="tab"]';

  function load() { try { var m = JSON.parse(localStorage.getItem(KEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* private window: the place is just not kept */ } }
  function heading(d) {
    var id = d.getAttribute('aria-labelledby'), h = id && d.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id));
    return h || d.querySelector('h1, h2, h3, [role="heading"]');
  }
  /** The title bar: the heading's row when it holds little besides the heading (a close button, a chip), else the heading. */
  function barOf(d) {
    var h = heading(d);
    if (!h) return null;
    var p = h.parentElement;
    if (p && p !== d && p.querySelector('input, select, textarea') === null && (p.textContent || '').trim().length <= (h.textContent || '').trim().length + 40) return p;
    return h;
  }
  function nameOf(d) {
    var h = heading(d);
    return d.getAttribute('data-dialog') || d.id || (h && h.id) || d.getAttribute('aria-labelledby') || ((h && h.textContent) || 'dialog').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  }
  function clamp(d, x, y) {
    var w = d.ownerDocument.defaultView, r = d.getBoundingClientRect();
    var vw = w.innerWidth, vh = w.innerHeight, keep = 64;
    return { x: Math.round(Math.min(Math.max(x, keep - r.width), vw - keep)), y: Math.round(Math.min(Math.max(y, 0), vh - 40)) };
  }
  function put(d, x, y) {
    var c = clamp(d, x, y), s = d.style;
    s.position = 'fixed'; s.margin = '0'; s.inset = 'auto'; s.left = c.x + 'px'; s.top = c.y + 'px'; s.transform = 'none';
    return c;
  }
  function centre(d) {
    var s = d.style;
    ['position', 'margin', 'inset', 'left', 'top', 'transform'].forEach(function (k) { s.removeProperty(k); });
  }
  function remember(d, c) { var m = load(); m[nameOf(d)] = c ? { x: c.x, y: c.y } : undefined; save(JSON.parse(JSON.stringify(m))); }
  function restore(d) {
    if (small.matches || d.classList.contains('shell-dw-dialog')) return;
    var p = load()[nameOf(d)];
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) put(d, p.x, p.y); else centre(d);
  }
  function say(t) { if (window.ccShellScreen && ccShellScreen.say) ccShellScreen.say(t); }

  function setup(d) {
    if (set.has(d)) return;
    set.add(d);
    var bar = barOf(d);
    if (!bar) return;
    bar.classList.add('shell-dlg-bar');
    bar.setAttribute('title', bar.getAttribute('title') || T('shell.dialogs.bar.title'));
    var drag = null;
    bar.addEventListener('pointerdown', function (e) {
      if (small.matches || d.classList.contains('shell-dw-dialog') || (e.button !== undefined && e.button !== 0) || (e.target.closest && e.target.closest(NO_DRAG) && e.target !== bar)) return;
      var r = d.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      put(d, r.left, r.top);
      try { bar.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events: fine without */ }
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      put(d, e.clientX - drag.dx, e.clientY - drag.dy);
    });
    function end(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      drag = null;
      try { bar.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
      var r = d.getBoundingClientRect();
      remember(d, { x: Math.round(r.left), y: Math.round(r.top) });
    }
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
    bar.addEventListener('dblclick', function (e) {
      if (small.matches || d.classList.contains('shell-dw-dialog') || (e.target.closest && e.target.closest(NO_DRAG) && e.target !== bar)) return;
      centre(d); remember(d, null);
    });
    d.addEventListener('keydown', function (e) {
      if (!e.altKey || !e.shiftKey || small.matches || d.classList.contains('shell-dw-dialog')) return;
      var step = e.ctrlKey ? 64 : 16, dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      if (!dx && !dy) return;
      e.preventDefault(); e.stopPropagation();
      var r = d.getBoundingClientRect(), c = put(d, r.left + dx, r.top + dy);
      remember(d, c);
      say(T('shell.dialogs.moved'));
    });
    if (d.hasAttribute('data-popout') && window.cadcraftDesktop && typeof window.open === 'function') {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'shell-dlg-pop';
      b.setAttribute('aria-label', T('shell.dialogs.popout'));
      b.title = T('shell.dialogs.popout.title');
      b.innerHTML = '<i class="bi bi-window-stack" aria-hidden="true"></i>';
      b.addEventListener('click', function () { popOut(d); });
      var close = bar.querySelector('.cc-x, [data-close], [aria-label][class*="close"]');
      if (close && close.parentNode === bar) bar.insertBefore(b, close); else bar.appendChild(b);
    }
    d.addEventListener('close', function () { var p = popEntry(d); if (p) dock(p, false); });
    restore(d);
  }

  /* ---------------- Own window (Studio) ---------------- */
  function popEntry(d) { for (var i = 0; i < popped.length; i++) if (popped[i].d === d) return popped[i]; return null; }
  function syncLook(w) {
    ['data-space', 'data-cc-density', 'class', 'style', 'lang'].forEach(function (a) {
      var v = root.getAttribute(a);
      if (a === 'class') { w.document.documentElement.className = v || ''; return; }
      if (v === null) w.document.documentElement.removeAttribute(a); else w.document.documentElement.setAttribute(a, v);
    });
  }
  function setupWindow(w, title) {
    var doc = w.document;
    if (!doc.head) doc.documentElement.appendChild(doc.createElement('head'));
    if (!doc.body) doc.documentElement.appendChild(doc.createElement('body'));
    var vp = doc.createElement('meta'); vp.name = 'viewport'; vp.content = 'width=device-width, initial-scale=1'; doc.head.appendChild(vp);
    doc.title = title;
    document.querySelectorAll('head link[rel~="stylesheet"][href], head style').forEach(function (node) {
      var c;
      if (node.tagName === 'LINK') { c = doc.createElement('link'); c.rel = 'stylesheet'; c.href = node.href; } else { c = doc.createElement('style'); c.textContent = node.textContent; }
      doc.head.appendChild(c);
    });
    var icon = document.querySelector('link[rel~="icon"]');
    if (icon) { var ic = doc.createElement('link'); ic.rel = 'icon'; ic.href = icon.href; doc.head.appendChild(ic); }
    doc.body.className = 'app-shell shell-dw ' + [].filter.call(document.body.classList, function (c) { return /^layer-/.test(c); }).join(' ');
    syncLook(w);
  }
  function popOut(d) {
    if (popEntry(d)) { try { popEntry(d).w.focus(); } catch (e) { /* gone */ } return true; }
    var r = d.getBoundingClientRect();
    var feat = 'popup=yes,width=' + Math.round(Math.max(520, r.width + 32)) + ',height=' + Math.round(Math.max(360, Math.min(r.height + 56, (screen.availHeight || 900) * 0.9)));
    var w = window.open('', 'cc-dialog-' + SLUG + '-' + nameOf(d), feat);
    if (!w) { say(T('shell.dialogs.blocked')); return false; }
    var h = heading(d), title = T('shell.dialogs.window.title', { name: ((h && h.textContent) || '').trim() || APP, app: APP });
    try { setupWindow(w, title); } catch (err) { try { w.close(); } catch (e2) { /* nothing to close */ } say(T('shell.dialogs.blocked')); return false; }
    var entry = { d: d, w: w, home: { parent: d.parentNode, next: d.nextSibling }, own: { showModal: Object.prototype.hasOwnProperty.call(d, 'showModal'), show: Object.prototype.hasOwnProperty.call(d, 'show') }, mo: null, gone: false };
    popped.push(entry);
    ['left', 'top', 'position', 'margin', 'inset', 'transform'].forEach(function (k) { d.style.removeProperty(k); });
    d.classList.add('shell-dw-dialog');
    w.document.body.appendChild(w.document.adoptNode(d));
    // The page asking for the dialog again (PLOT, Layer manager …) brings the window forward instead.
    d.showModal = d.show = function () { try { w.focus(); } catch (e) { /* closed */ } };
    if (!d.open) d.setAttribute('open', '');
    w.document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); d.close(); } });
    w.addEventListener('pagehide', function () { if (!entry.gone) dock(entry, true); });
    entry.mo = new MutationObserver(function () { if (!w.closed) syncLook(w); });
    entry.mo.observe(root, { attributes: true, attributeFilter: ['data-space', 'data-cc-density', 'class', 'style', 'lang'] });
    try { w.focus(); } catch (e) { /* fine */ }
    return true;
  }
  /** Back into the page. `closeWindowToo`: the window is already going; else it is closed here. A dialog still open is closed
   *  (the window going away is the person closing the dialog). */
  function dock(entry, fromWindow) {
    if (entry.gone) return;
    entry.gone = true;
    popped.splice(popped.indexOf(entry), 1);
    var d = entry.d, w = entry.w;
    try { if (entry.mo) entry.mo.disconnect(); } catch (e) { /* ok */ }
    if (!entry.own.showModal) delete d.showModal;
    if (!entry.own.show) delete d.show;
    d.classList.remove('shell-dw-dialog');
    var wasOpen = d.open;
    var parent = entry.home.parent && entry.home.parent.isConnected ? entry.home.parent : document.body;
    var next = entry.home.next && entry.home.next.parentNode === parent ? entry.home.next : null;
    parent.insertBefore(document.adoptNode(d), next);
    if (wasOpen) { d.removeAttribute('open'); try { d.dispatchEvent(new Event('close')); } catch (e) { /* ok */ } }
    if (!fromWindow) { try { w.close(); } catch (e) { /* already gone */ } }
  }
  window.addEventListener('pagehide', function () { popped.slice().forEach(function (p) { try { p.w.close(); } catch (e) { /* ok */ } }); });

  /* ---------------- Watching for dialogs ---------------- */
  function visit(d) { if (d.tagName === 'DIALOG') { setup(d); if (d.open) restore(d); } }
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      if (m.type === 'attributes') { if (m.target.tagName === 'DIALOG' && m.target.open) visit(m.target); return; }
      m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { visit(n); if (n.querySelectorAll) n.querySelectorAll('dialog').forEach(visit); } });
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['open'], childList: true, subtree: true });
  document.querySelectorAll('dialog').forEach(setup);
  window.addEventListener('resize', function () {
    if (small.matches) return;
    document.querySelectorAll('dialog[open]').forEach(function (d) { if (d.style.position === 'fixed') { var r = d.getBoundingClientRect(); put(d, r.left, r.top); } });
  });

  window.ccShellDialogs = { popOut: popOut, popped: function () { return popped.map(function (p) { return p.d; }); }, places: load, nameOf: nameOf, barOf: barOf };
})();
