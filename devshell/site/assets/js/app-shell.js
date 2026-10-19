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
 * MarkupCraft, TakeoffCraft); every app redraws through its ResizeObserver when they go.
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
