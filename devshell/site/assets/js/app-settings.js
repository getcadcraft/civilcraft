/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-settings.js — Settings for every app's browser UI (app-shell.inc loads it; the dialog is
 * core/components/app-settings.inc, the gear button is in app-bar.inc).
 *
 *   theme         paper / model / match the system — site-wide, the same localStorage cc-space and
 *                 cc_space cookie the Paper/Model toggle writes ("system" clears both)
 *   panel zoom    text size of the side panels (CSS zoom on main > aside, so rem sizes scale too)
 *   left / right  side panel widths in rem; also dragged at each panel's inner edge (a role=separator
 *                 handle; arrows nudge, Home/double-click resets). Only while the app's grid has three
 *                 columns — narrow layouts stack the panels and keep their own sizes.
 *   tips          a Bootstrap tooltip with the full text of anything cut off with an ellipsis
 *   screen        the screen mode the app opens in (normal / full / autohide; app-shell.js does the
 *                 switching). Full screen needs a gesture, so it starts on the first click or key press
 *                 outside a control; "autohide" hides the bars in the window right away.
 *   tb, tbGroups  toolbar buttons: icons and labels / icons only / labels only; group names on or off
 *   tbTouch       on a touch screen (html.cc-touch, app-phone.js): the toolbar is one row that swipes ('row') or wraps ('wrap')
 *   order         toolbar order: "Arrange the toolbar…" lets tools be dragged within their group and
 *                 groups by their name (arrow keys move the focused one). Saved as keys (data-* of each
 *                 item, aria-label of each group); new items keep their place, gone ones are ignored.
 *   units         0.7 UNITS: Settings › General › Units, filled by the build's copy of lib/units (unit-settings.js, loaded on
 *                 the first open); site-wide like the theme (localStorage cc-units), never part of this app's Reset.
 *
 * An app may add its own fieldsets (build folder settings.inc; app-settings.inc includes it) — they get a tab of
 * their own, named after the app, beside "General" (last tab used remembered: s.tab). Its JS owns those fields and
 * resets them on the dialog's "cc-settings-reset" event.
 * Everything but the theme is per app: localStorage "cc-app-settings:<slug>". Ctrl+, opens the dialog.
 *
 * 0.6 layout tools (session shell-ui; DF.8 / DF.27 / DF.28), only where app-settings.inc printed data-shell-ui on the dialog
 * (dev builds and releases from 0.6 on — the 0.5 releases in /use load this same file and stay as they were):
 *   Reset the layout  Settings › General › Layout ([data-layout-reset]): toolbar order, lock and buttons, panel widths and places
 *                     (app-panels.js), screen mode (now and on open), the menu style (app-input-ui.js: the app's own, or the
 *                     family chosen for every app), the phone toolbar (app-phone.js). Not the theme, language, text sizes or
 *                     the app's own settings. The Studio hub's "Reset the layout in every app" writes localStorage
 *                     cc-layout-reset {at}: an app opened later (or open now: the storage event) resets once (s.layoutAt).
 *   window.ccShellLayout = { reset() } (the hub's reset, the palette, tests).
 *   Interface size    DF.28: s.ui 0.8–1.4 (Settings › General › Sizes and panels, beside the panel text size): the root font size
 *                     × s.ui (html.shell-ui-sized + --shell-ui; app-shell.css), so every rem of the bars, toolbars, panels and
 *                     dialogs scales and the drawing keeps its own zoom. app-settings.inc applies it before the app's scripts run;
 *                     panels windows follow (app-panels.js). Settings' own Reset puts it back; Reset the layout leaves it.
 *   Toolbar menu      DF.27: a right-click (long press, the context-menu key, Shift+F10) on the toolbar or a menu style's bar opens
 *                     .shell-ctx: Arrange the toolbar / Done arranging, Lock / Unlock the toolbar (s.tbLock: no arranging and no
 *                     reset of the order while locked; also a Settings checkbox), Reset the toolbar, Collapse the ribbon / Pin
 *                     the ribbon open (a ribbon style: app-input-ui.js ccInput.ribbon / setRibbon), Toolbar settings…. Text
 *                     fields keep the browser's own menu.
 * 0.7 PANEL-COMPACT (session shell-07), only where app-settings.inc printed data-shell-07 (dev builds and releases from 0.7 on):
 *   Layout density    item 1: s.density 'comfortable' (default, today's look) | 'compact' → html[data-cc-density="compact"] (set before
 *                     first paint by app-settings.inc; app-shell.css § Compact density). Settings › General › Sizes and panels. Reading
 *                     choice like the interface size: Reset the layout leaves it, Settings' own Reset puts it back.
 * The toolbar is <main>'s direct-child role=toolbar (BimCraft: the [data-toolbar] one in its stage);
 * groups are its role=group children, tools the children of each group's *-tool-row.
 * The panels are found by shape, not by name: <main>'s direct-child <aside>s whose class ends in
 * -left / -right (every app's ui.inc follows that). Apps redraw through their ResizeObserver.
 */
(function () {
  'use strict';
  var body = document.body;
  var dlg = document.querySelector('[data-app-settings]');
  var main = document.querySelector('body.app-shell > main');
  if (!body.classList.contains('app-shell') || !dlg || !main) return;

  var root = document.documentElement;
  var form = dlg.querySelector('form');
  var KEY = 'cc-app-settings:' + dlg.getAttribute('data-app');
  var DEFAULTS = { zoom: 1, left: null, right: null, tips: true, screen: 'normal', tb: 'both', tbGroups: true, tbTouch: 'row', order: null, tab: 'app', secs: null, layoutAt: 0, tbLock: false, ui: 1, density: 'comfortable' };
  var UI = dlg.hasAttribute('data-shell-ui');   // 0.6 layout tools (see the header)
  var DENSITY = dlg.hasAttribute('data-shell-07');   // 0.7 PANEL-COMPACT (dev builds and releases from 0.7 on)
  var RESET_KEY = 'cc-layout-reset';
  var MIN_W = 10, MAX_W = 40, MIN_STAGE = 20;   // rem
  function T(k, v) { return window.ccShellT ? window.ccShellT(k, v) : k; }

  var s = load();

  function load() {
    var out = Object.assign({}, DEFAULTS);
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (typeof v.zoom === 'number' && v.zoom >= 0.5 && v.zoom <= 2) out.zoom = v.zoom;
      if (typeof v.left === 'number') out.left = v.left;
      if (typeof v.right === 'number') out.right = v.right;
      if (typeof v.tips === 'boolean') out.tips = v.tips;
      if (['normal', 'full', 'autohide'].indexOf(v.screen) !== -1) out.screen = v.screen;
      if (['both', 'icons', 'labels'].indexOf(v.tb) !== -1) out.tb = v.tb;
      if (typeof v.tbGroups === 'boolean') out.tbGroups = v.tbGroups;
      if (v.tbTouch === 'row' || v.tbTouch === 'wrap') out.tbTouch = v.tbTouch;
      if (v.order && typeof v.order === 'object') out.order = v.order;
      if (v.tab === 'app' || v.tab === 'general') out.tab = v.tab;
      if (v.secs && typeof v.secs === 'object') ['app', 'general'].forEach(function (k) { var n = v.secs[k]; if (typeof n === 'number' && n >= 0 && n < 200 && n % 1 === 0) { out.secs = out.secs || {}; out.secs[k] = n; } });
      if (typeof v.layoutAt === 'number' && v.layoutAt > 0) out.layoutAt = v.layoutAt;
      if (v.tbLock === true) out.tbLock = true;
      if (typeof v.ui === 'number' && v.ui >= 0.8 && v.ui <= 1.4) out.ui = Math.round(v.ui * 100) / 100;
      if (v.density === 'compact') out.density = 'compact';
    } catch (e) {}
    return out;
  }
  function save() {
    try {
      // app-panels.js keeps its layout in the same entry ("panels"); keep it.
      var cur = JSON.parse(localStorage.getItem(KEY) || '{}');
      localStorage.setItem(KEY, JSON.stringify(cur && cur.panels ? Object.assign({}, s, { panels: cur.panels }) : s));
    } catch (e) {}
  }
  function remPx() { return parseFloat(getComputedStyle(root).fontSize) || 16; }
  function round(n) { return Math.round(n * 2) / 2; }

  /* ---------------- Theme ---------------- */
  var dark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;   // i18n-ignore (media query)

  function themeChoice() {
    var v = null;
    try { v = localStorage.getItem('cc-space'); } catch (e) {}
    if (v === 'paper' || v === 'model') return v;
    var m = /(?:^|;\s*)cc_space=(paper|model)/.exec(document.cookie || '');
    return m ? m[1] : 'system';
  }
  function setSpace(sp) {
    root.setAttribute('data-space', sp);
    document.querySelectorAll('.space-toggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.value === sp ? 'true' : 'false');
    });
  }
  function setTheme(v) {
    if (v === 'paper' || v === 'model') {
      try { localStorage.setItem('cc-space', v); } catch (e) {}
      try { document.cookie = 'cc_space=' + v + ';path=/;max-age=31536000;samesite=lax;secure'; } catch (e) {}
      setSpace(v);
    } else {
      try { localStorage.removeItem('cc-space'); } catch (e) {}
      try { document.cookie = 'cc_space=;path=/;max-age=0;samesite=lax;secure'; } catch (e) {}
      setSpace(dark && dark.matches ? 'model' : 'paper');
    }
  }
  if (dark && dark.addEventListener) dark.addEventListener('change', function () {
    if (themeChoice() === 'system') setSpace(dark.matches ? 'model' : 'paper');
  });

  /* ---------------- Panels: text size and widths ---------------- */
  function sidePanel(side) {
    for (var i = 0; i < main.children.length; i++) {
      var c = main.children[i];
      if (c.tagName === 'ASIDE' && new RegExp('-' + side + '(\\s|$)').test(c.className)) return c;
    }
    return null;
  }
  var panels = { left: sidePanel('left'), right: sidePanel('right') };
  var defaults = { left: 16, right: 18 };   // rem; measured from the app's own CSS in layout()
  var threeCols = false;

  function applyZoom() {
    main.style.setProperty('--shell-panel-zoom', String(s.zoom));
    body.classList.toggle('shell-zoomed', s.zoom !== 1);
  }
  /** 0.6 DF.28: the interface size (the root font size × s.ui; nothing for builds without the 0.6 layout tools). */
  function applyUi() {
    if (!UI) return;
    if (s.ui !== 1) root.style.setProperty('--shell-ui', String(s.ui)); else root.style.removeProperty('--shell-ui');
    root.classList.toggle('shell-ui-sized', s.ui !== 1);
    relayoutSoon();
    requestAnimationFrame(function () { try { window.dispatchEvent(new Event('resize')); } catch (e) {} });   // apps that size on window resize
  }

  /** 0.7 PANEL-COMPACT item 1: html[data-cc-density="compact"] (Comfortable sets no attribute = today's look). app-shell.css
   *  holds the rules; they apply to a fine pointer only, so a touch screen keeps its 2.75 rem targets. */
  function applyDensity() {
    if (!DENSITY) return;
    if (s.density === 'compact') root.setAttribute('data-cc-density', 'compact'); else root.removeAttribute('data-cc-density');
    relayoutSoon();
    requestAnimationFrame(function () { try { window.dispatchEvent(new Event('resize')); } catch (e) {} });
  }

  /** Clamp a width so the drawing keeps at least MIN_STAGE rem between the panels. */
  function clampW(side, w) {
    var total = main.clientWidth / remPx();
    var other = side === 'left' ? width('right') : width('left');
    var max = Math.min(MAX_W, total - other - MIN_STAGE);
    return round(Math.max(MIN_W, Math.min(max, w)));
  }
  function width(side) {
    if (!panels[side]) return 0;
    return s[side] != null ? s[side] : defaults[side];
  }

  /** Re-read the app's own column sizes (the inline override cleared), then apply ours on top.
   *  Clear + measure + set happen in one task, so the app's ResizeObserver sees one change. */
  function layout() {
    // Panels moved by app-panels.js: it owns <main>'s grid and its own dock handles until they are back home.
    if (main.classList.contains('shell-panels-managed')) {
      threeCols = false;
      dlg.querySelector('[data-wide-only]').hidden = true;
      placeHandles();
      return;
    }
    main.style.gridTemplateColumns = '';
    var cols = getComputedStyle(main).gridTemplateColumns.split(' ').filter(Boolean);
    threeCols = cols.length === 3 && !!(panels.left || panels.right);
    dlg.querySelector('[data-wide-only]').hidden = threeCols;
    if (threeCols) {
      var rp = remPx();
      defaults.left = round(parseFloat(cols[0]) / rp);
      defaults.right = round(parseFloat(cols[2]) / rp);
      if (s.left != null || s.right != null) {
        main.style.gridTemplateColumns = width('left') + 'rem minmax(0, 1fr) ' + width('right') + 'rem';   // i18n-ignore (CSS)
      }
    }
    placeHandles();
  }

  /* Drag handles: one per side panel, on its inner edge, positioned over <main> (out of the grid flow). */
  var handles = {};
  ['left', 'right'].forEach(function (side) {
    var p = panels[side];
    if (!p) return;
    var h = document.createElement('div');
    h.className = 'shell-split shell-split-' + side;
    h.setAttribute('role', 'separator');
    h.setAttribute('aria-orientation', 'vertical');
    h.setAttribute('aria-label', p.getAttribute('aria-label') ? T('shell.split.resize', { panel: p.getAttribute('aria-label') }) : T('shell.split.resize.' + side));
    h.setAttribute('aria-valuemin', String(MIN_W));
    h.setAttribute('aria-valuemax', String(MAX_W));
    h.tabIndex = 0;
    h.title = T('shell.split.title');
    main.appendChild(h);
    handles[side] = h;

    var startX = 0, startW = 0;
    h.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startW = width(side);
      body.classList.add('shell-resizing');
    });
    h.addEventListener('pointermove', function (e) {
      if (!h.hasPointerCapture(e.pointerId)) return;
      var d = (e.clientX - startX) / remPx();
      setWidth(side, startW + (side === 'left' ? d : -d), false);
    });
    function end(e) {
      if (!h.hasPointerCapture(e.pointerId)) return;
      h.releasePointerCapture(e.pointerId);
      body.classList.remove('shell-resizing');
      save();
      syncForm();
    }
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
    h.addEventListener('dblclick', function () { resetWidth(side); });
    h.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 2 : 0.5, d = 0;
      if (e.key === 'ArrowLeft') d = -step;
      else if (e.key === 'ArrowRight') d = step;
      else if (e.key === 'Home' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); resetWidth(side); return; }
      else return;
      e.preventDefault();
      e.stopPropagation();   // the apps pan the drawing with arrow keys
      setWidth(side, width(side) + (side === 'left' ? d : -d), true);
    });
  });

  function setWidth(side, w, persist) {
    s[side] = clampW(side, w);
    layout();
    if (persist) { save(); syncForm(); }
  }
  function resetWidth(side) {
    s[side] = null;
    layout();
    save();
    syncForm();
  }

  function placeHandles() {
    var mr = main.getBoundingClientRect();
    ['left', 'right'].forEach(function (side) {
      var h = handles[side];
      if (!h) return;
      var p = panels[side];
      h.hidden = !threeCols || p.hidden || p.offsetParent === null;
      if (h.hidden) return;
      var r = p.getBoundingClientRect();
      var x = side === 'left' ? r.right - mr.left : r.left - mr.left;
      h.style.left = x + 'px';
      h.style.top = (r.top - mr.top + main.scrollTop) + 'px';
      h.style.height = r.height + 'px';
      var w = width(side);
      h.setAttribute('aria-valuenow', String(w));
      h.setAttribute('aria-valuetext', T('shell.settings.width', { n: w }));
    });
  }

  var raf = 0;
  function relayoutSoon() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  }
  window.addEventListener('resize', relayoutSoon);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { requestAnimationFrame(placeHandles); });
    ro.observe(main);
    if (panels.left) ro.observe(panels.left);
    if (panels.right) ro.observe(panels.right);
  }
  // Toolbars that show/hide (screen modes, app state) move the panels without resizing <main>.
  new MutationObserver(relayoutSoon).observe(body, { attributes: true, attributeFilter: ['class'] });


  /* ---------------- Toolbar: display and order ---------------- */
  var tb = null;
  for (var ti = 0; ti < main.children.length; ti++) {
    if (main.children[ti].getAttribute('role') === 'toolbar') { tb = main.children[ti]; break; }
  }
  if (!tb) tb = main.querySelector('[role="toolbar"][data-toolbar]');
  if (tb) tb.classList.add('shell-tb');
  /** In the page and drawn (offsetParent is null for the fixed bars of the "bars hidden" screen mode, so not that). */
  function shown(el) { return !el.hidden && el.getClientRects().length > 0; }

  function groupsOf() {
    return tb ? Array.prototype.filter.call(tb.children, function (c) { return c.getAttribute('role') === 'group'; }) : [];
  }
  /** Containers whose children are tools: each group's row, or the toolbar itself when it has no groups. */
  function rowsOf() {
    var g = groupsOf();
    if (!g.length) return tb ? [tb] : [];
    return g.map(function (grp) { return grp.querySelector('[class$="-tool-row"]'); }).filter(Boolean);
  }
  /** A group's saved key: data-tb-key when the app gives one (stable across languages — give it the English group name,
   *  so orders saved before the app moved to language files still apply), else its aria-label. */
  function groupKey(g) { return 'g:' + (g.getAttribute('data-tb-key') || g.getAttribute('aria-label')); }
  function rowKey(row) {
    var g = row.closest('[role="group"]');
    return g && g !== row ? groupKey(g) : 'toolbar';
  }
  function toolsOf(row) {
    return Array.prototype.filter.call(row.children, function (c) {
      return c.tagName !== 'INPUT' && c.getAttribute('role') !== 'group';
    });
  }
  function dataKey(el) {
    var n = el.getAttributeNames().filter(function (a) { return a.indexOf('data-') === 0 && a.indexOf('data-bs-') !== 0; })[0];
    return n ? n + '=' + el.getAttribute(n) : null;
  }
  function itemKey(el, i, all) {
    if (el.getAttribute('role') === 'group') return groupKey(el);
    var k = dataKey(el);
    var inner = el.querySelectorAll('*');
    for (var j = 0; !k && j < inner.length; j++) k = dataKey(inner[j]);   // e.g. a label around a select
    if (k) return k;
    // Separators and other unnamed bits: by kind and position among their kind.
    var same = all.filter(function (x) { return x.className === el.className; });
    return 'c:' + el.className + ':' + same.indexOf(el);
  }
  function keysOf(list) { return list.map(function (el, i) { return itemKey(el, i, list); }); }

  /** Put `list` (children of `parent`) in saved order; items not in `saved` keep their slots. */
  function reorder(parent, list, saved) {
    if (!saved || !saved.length || !list.length) return;
    var keys = keysOf(list), byKey = {};
    list.forEach(function (el, i) { byKey[keys[i]] = el; });
    var known = saved.filter(function (k) { return byKey[k]; }).map(function (k) { return byKey[k]; });
    var savedSet = {};
    saved.forEach(function (k) { savedSet[k] = 1; });
    var out = [], ki = 0;
    list.forEach(function (el, i) { out.push(savedSet[keys[i]] ? known[ki++] : el); });
    var anchor = list[list.length - 1].nextSibling;
    out.forEach(function (el) { parent.insertBefore(el, anchor); });
  }
  var original = null;   // the server's order, for "Original order"
  function snapshot() {
    return { groups: groupsOf().slice(), rows: rowsOf().map(function (r) { return { row: r, items: toolsOf(r).slice() }; }) };
  }
  function applyOrder() {
    if (!tb || !s.order) return;
    if (s.order.groups) reorder(tb, groupsOf(), s.order.groups);
    rowsOf().forEach(function (r) {
      var saved = s.order.rows && s.order.rows[rowKey(r)];
      if (saved) reorder(r, toolsOf(r), saved);
    });
  }
  function saveOrder() {
    var rows = {};
    rowsOf().forEach(function (r) { rows[rowKey(r)] = keysOf(toolsOf(r)); });
    s.order = { groups: keysOf(groupsOf()), rows: rows };
    save();
  }
  function resetOrder(force) {
    if (!original || (UI && s.tbLock && force !== true)) return;
    original.groups.forEach(function (g) { tb.appendChild(g); });
    original.rows.forEach(function (o) { o.items.forEach(function (el) { o.row.appendChild(el); }); });
    s.order = null;
    save();
    relayoutSoon();
  }
  function applyTb() {
    if (!tb) return;
    body.setAttribute('data-shell-tb', s.tb);
    body.classList.toggle('shell-tb-nogroups', !s.tbGroups);
    body.setAttribute('data-shell-tb-touch', s.tbTouch);
    body.classList.toggle('shell-tb-locked', UI && !!s.tbLock);
    relayoutSoon();
  }

  /* Arrange mode: clicks on the toolbar do nothing; tools drag within their row, groups by their name. */
  var arranging = false, bar = null, drag = null;

  function startArrange() {
    if (!tb || arranging) return;
    if (UI && s.tbLock) {
      if (window.ccShellScreen) ccShellScreen.say(T('shell.tbmenu.why.locked'));
      return;
    }
    if (!shown(tb)) {
      if (window.ccShellScreen) ccShellScreen.say(T('shell.arrange.no_toolbar'));
      return;
    }
    arranging = true;
    body.classList.add('shell-arranging');
    if (window.ccShellScreen && ccShellScreen.reveal) ccShellScreen.reveal(true);   // bars hidden: out while arranging
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'shell-arrange-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', T('shell.arrange.aria'));
      bar.innerHTML = '<p><i class="bi bi-arrows-move" aria-hidden="true"></i> </p><button type="button" class="btn-line btn-sm-cc" data-a="reset"></button>' +
        '<button type="button" class="btn-plot btn-sm-cc" data-a="done"></button>';
      bar.firstChild.appendChild(document.createTextNode(T('shell.arrange.hint')));
      bar.querySelector('[data-a="reset"]').textContent = T('shell.settings.tb.original');
      bar.querySelector('[data-a="done"]').textContent = T('shell.settings.done');
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        if (b.getAttribute('data-a') === 'reset') resetOrder(); else stopArrange();
      });
      body.appendChild(bar);
    }
    bar.hidden = false;
    groupsOf().forEach(function (g) { var l = g.querySelector('[class$="-tool-label"]'); if (l) { l.tabIndex = 0; l.setAttribute('aria-hidden', 'false'); } });
    rowsOf().forEach(function (r) { toolsOf(r).forEach(function (el) { if (el.tagName === 'DETAILS') el.open = false; }); });
    relayoutSoon();
    var first = tb.querySelector('button, summary');
    if (first) first.focus();
  }
  function stopArrange() {
    if (!arranging) return;
    arranging = false;
    body.classList.remove('shell-arranging');
    if (window.ccShellScreen && ccShellScreen.reveal) ccShellScreen.reveal(true);   // hidden bars go again once the pointer leaves
    if (bar) bar.hidden = true;
    groupsOf().forEach(function (g) { var l = g.querySelector('[class$="-tool-label"]'); if (l) { l.removeAttribute('tabindex'); l.setAttribute('aria-hidden', 'true'); } });
    saveOrder();
    relayoutSoon();
  }
  /** The draggable thing under an event target: a group (by its name) or a tool in a row. */
  function dragTarget(t) {
    if (!tb || !t.closest) return null;
    var label = t.closest('[class$="-tool-label"]');
    if (label && tb.contains(label)) return { el: label.closest('[role="group"]'), parent: tb, list: groupsOf };
    var rows = rowsOf();
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var el = t;
      while (el && el.parentElement !== r) el = el.parentElement;
      if (el && toolsOf(r).indexOf(el) !== -1) return { el: el, parent: r, list: (function (row) { return function () { return toolsOf(row); }; })(r) };
    }
    return null;
  }
  function moveTo(d, x, y) {
    var items = d.list();
    var over = null;
    for (var i = 0; i < items.length; i++) {
      var rc = items[i].getBoundingClientRect();
      if (items[i] !== d.el && !items[i].hidden && x >= rc.left && x <= rc.right && y >= rc.top - 4 && y <= rc.bottom + 4) { over = items[i]; break; }
    }
    if (!over) return;
    var r = over.getBoundingClientRect();
    var after = x > r.left + r.width / 2;
    d.parent.insertBefore(d.el, after ? over.nextSibling : over);
  }
  if (tb) {
    tb.addEventListener('click', function (e) {
      if (!arranging) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    tb.addEventListener('pointerdown', function (e) {
      if (!arranging || e.button !== 0) return;
      var d = dragTarget(e.target);
      if (!d) return;
      e.preventDefault();
      e.stopPropagation();
      drag = d;
      d.el.classList.add('shell-dragging');
      tb.setPointerCapture(e.pointerId);
    }, true);
    tb.addEventListener('pointermove', function (e) {
      if (drag) moveTo(drag, e.clientX, e.clientY);
    });
    var endDrag = function (e) {
      if (!drag) return;
      drag.el.classList.remove('shell-dragging');
      drag = null;
      if (tb.hasPointerCapture(e.pointerId)) tb.releasePointerCapture(e.pointerId);
      saveOrder();
    };
    tb.addEventListener('pointerup', endDrag);
    tb.addEventListener('pointercancel', endDrag);
  }
  // Keys while arranging (capture: the apps use arrows and letters themselves).
  window.addEventListener('keydown', function (e) {
    if (!arranging) return;
    if (e.key === 'Escape' || e.key === 'Enter') {
      if (dlg.open) return;
      e.preventDefault(); e.stopPropagation(); stopArrange(); return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var d = document.activeElement && tb.contains(document.activeElement) ? dragTarget(document.activeElement) : null;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    var items = d.list(), i = items.indexOf(d.el);
    var j = i + (e.key === 'ArrowLeft' ? -1 : 1);
    if (j < 0 || j >= items.length) return;
    var f = document.activeElement;   // moving the node takes the focus away: give it back
    d.parent.insertBefore(d.el, e.key === 'ArrowLeft' ? items[j] : items[j].nextSibling);
    f.focus();
    saveOrder();
  }, true);

  /* ---------------- Screen mode on open ---------------- */
  var screenApi = window.ccShellScreen;
  function screenOnOpen() {
    if (!screenApi || s.screen === 'normal') return;
    if (s.screen === 'autohide') screenApi.goTo('autohide');   // the bars hide in the window at once
    if (!screenApi.canFull) return;
    screenApi.say(T('shell.screen.say.on_open', { app: dlg.getAttribute('data-app-name') }));
    var INTERACTIVE = 'button, a, input, select, textarea, label, summary, [contenteditable], [role="button"], [role="separator"], dialog';
    function first(e) {
      if (e.type === 'keydown' && (e.key === 'Escape' || /^(Control|Shift|Alt|Meta)$/.test(e.key) || (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')))) return;
      if (e.type === 'keydown' && e.ctrlKey && e.shiftKey && (e.code === 'KeyF')) { off(); return; }   // the user picked a mode
      if (e.type === 'pointerdown' && e.target.closest && e.target.closest(INTERACTIVE)) return;
      off();
      screenApi.goTo(s.screen);
    }
    function off() {
      window.removeEventListener('pointerdown', first, true);
      window.removeEventListener('keydown', first, true);
    }
    window.addEventListener('pointerdown', first, true);
    window.addEventListener('keydown', first, true);
  }

  /* ---------------- Tooltips for cut-off text ---------------- */
  var tipTimer = 0, tipEl = null, tip = null;
  var SKIP = 'input, select, textarea, [contenteditable], .shell-split';   // i18n-ignore (selector)

  function cutOff(el) {
    if (el.scrollWidth - el.clientWidth < 1) return false;
    var cs = getComputedStyle(el);
    return cs.textOverflow === 'ellipsis' && cs.overflowX !== 'visible';
  }
  function findCutOff(t) {
    for (var n = t, i = 0; n && n.nodeType === 1 && n !== main && n !== body && i < 4; n = n.parentElement, i++) {
      if (n.matches(SKIP)) return null;
      if (cutOff(n)) return n;
    }
    return null;
  }
  function hideTip() {
    clearTimeout(tipTimer);
    if (tip) { try { tip.dispose(); } catch (e) {} }
    tip = null;
    tipEl = null;
  }
  function showTip(el) {
    if (!window.bootstrap || !bootstrap.Tooltip || !el.isConnected) return;
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    var title = (el.getAttribute('title') || '').trim();
    if (title && title !== text && text.indexOf(title) === -1) text = title.indexOf(text) !== -1 ? title : text + ' — ' + title;
    if (!text) return;
    hideTip();
    tipEl = el;
    tip = new bootstrap.Tooltip(el, {
      title: text, trigger: 'manual', container: 'body', placement: 'top',
      fallbackPlacements: ['bottom', 'right', 'left'], customClass: 'shell-tip', animation: false
    });
    tip.show();
  }
  function consider(target, delay) {
    if (!s.tips) return;
    var el = findCutOff(target);
    if (el === tipEl) return;
    hideTip();
    if (el) tipTimer = setTimeout(function () { showTip(el); }, delay);
  }
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || body.classList.contains('shell-resizing')) return;
    if (dlg.contains(e.target)) return;
    consider(e.target, 300);
  });
  document.addEventListener('pointerout', function (e) {
    if (tipEl && (!e.relatedTarget || !tipEl.contains(e.relatedTarget))) hideTip();
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.closest && e.target.closest('[data-app-settings]')) return;
    consider(e.target, 0);
  });
  document.addEventListener('focusout', hideTip);
  ['pointerdown', 'wheel', 'keydown'].forEach(function (t) { document.addEventListener(t, hideTip, true); });
  document.addEventListener('scroll', hideTip, true);

  /* ---------------- The dialog ---------------- */
  var btn = document.querySelector('[data-settings-open]');

  /* First-time tours (0.7): site-wide like the theme (localStorage cc-tours = 'off'; on = no entry). Every app that has a
   * tour reads the same key before it starts one by itself; never part of this app's Reset. */
  var TOURS_KEY = 'cc-tours';
  function toursOn() { try { return localStorage.getItem(TOURS_KEY) !== 'off'; } catch (e) { return true; } }
  function setToursOn(on) { try { if (on) localStorage.removeItem(TOURS_KEY); else localStorage.setItem(TOURS_KEY, 'off'); } catch (e) {} }
  /* Workspace layout (0.7, owner 2026-10-24): one choice for every app, like the theme (localStorage cc-workspace: standard | docked |
   * toolbox; no entry = standard). An app that has the chosen layout (manifest "workspaces") listens for 'cc-workspace' on window
   * and reads window.ccShellWorkspace.get(); one without it keeps its standard layout. Another window's change arrives too. */
  /* 0.7 WS.17: a value is a built-in layout's id, addon:<id> (an add-on of kind workspace in this build) or file:<id> (a file the
   * person imported, kept in cc-workspace-files); the layout engine (assets/js/app-workspace.js) registers itself here with
   * register(api) so Settings can list its layouts, import, export and remove them. Without the engine the list stays hidden. */
  var WS_KEY = 'cc-workspace', WS_RE = /^(standard|(addon:|file:)?[a-z][a-z0-9-]{1,39})$/, wsApi = null;
  function wsChoice() { try { var v = localStorage.getItem(WS_KEY); return v && WS_RE.test(v) ? v : 'standard'; } catch (e) { return 'standard'; } }
  function wsTell() { window.dispatchEvent(new CustomEvent('cc-workspace', { detail: { layout: wsChoice() } })); }
  function wsMark() { var v = wsChoice(); form.querySelectorAll('input[name="workspace"]').forEach(function (r) { r.checked = r.value === v; }); }
  function setWs(v) {
    if (!v || !WS_RE.test(v)) v = 'standard';
    try { if (v === 'standard') localStorage.removeItem(WS_KEY); else localStorage.setItem(WS_KEY, v); } catch (e) {}
    wsMark();
    wsTell();
  }
  function wsSay(text) { var m = form.querySelector('[data-ws-io-msg]'); if (m) m.textContent = text || ''; }
  /** The layouts from add-ons and imported files, after the three built-ins (radios like theirs; an imported one can be removed). */
  function wsRender() {
    var box = form.querySelector('[data-ws-extra]'), list = form.querySelector('[data-ws-extra-list]');
    if (!box || !list || !wsApi) return;
    var rows = wsApi.layouts().filter(function (l) { return l.source !== 'builtin' && l.ok; });
    list.textContent = '';
    rows.forEach(function (l) {
      var lab = document.createElement('label'); lab.className = 'shell-ws-opt';
      var r = document.createElement('input'); r.type = 'radio'; r.name = 'workspace'; r.value = l.key;
      var ic = document.createElement('i'); ic.className = 'bi ' + (l.source === 'file' ? 'bi-file-earmark-code' : 'bi-puzzle'); ic.setAttribute('aria-hidden', 'true');
      var txt = document.createElement('span'), nm = document.createElement('span'); nm.className = 'shell-ws-name'; nm.textContent = l.name + ' ';
      var src = document.createElement('span'); src.className = 'shell-hint-text'; src.textContent = '(' + T(l.source === 'file' ? 'shell.ws.from.file' : 'shell.ws.from.addon') + ')'; nm.appendChild(src);
      txt.appendChild(nm);
      if (l.hint) { var h = document.createElement('span'); h.className = 'shell-hint-text shell-ws-hint'; h.textContent = ' ' + l.hint; txt.appendChild(h); }
      lab.appendChild(r); lab.appendChild(document.createTextNode(' ')); lab.appendChild(ic); lab.appendChild(document.createTextNode(' ')); lab.appendChild(txt);
      if (l.source === 'file') {
        var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'btn-link-cc shell-ws-remove'; rm.setAttribute('data-ws-remove', l.key);
        rm.setAttribute('aria-label', T('shell.ws.remove', { name: l.name })); rm.title = T('shell.ws.remove', { name: l.name });
        var x = document.createElement('i'); x.className = 'bi bi-x-lg'; x.setAttribute('aria-hidden', 'true'); rm.appendChild(x); lab.appendChild(rm);
      }
      list.appendChild(lab);
    });
    box.hidden = !rows.length;
    ['[data-ws-io]', '[data-ws-io-hint]'].forEach(function (sel) { var n = form.querySelector(sel); if (n) n.hidden = false; });
    var arr = form.querySelector('[data-ws-arrange-row]'); if (arr) arr.hidden = !wsApi.arrange;   // WS.25: the engine's own dialog
    wsMark();
  }
  function wsImport(text) {
    if (!wsApi) return;
    var r = wsApi.importText(text);
    wsSay(r.message);
    if (r.ok) wsRender();
  }
  window.ccShellWorkspace = { get: wsChoice, set: setWs,
    register: function (api) { wsApi = api; wsRender(); },
    importText: function (text) { if (!wsApi) return { ok: false }; var r = wsApi.importText(text); wsSay(r.message); if (r.ok) wsRender(); return r; } };
  if (window.ccWorkspaceEngine) { wsApi = window.ccWorkspaceEngine; }   // the app's layout engine started before this script
  (function () {
    var file = form.querySelector('[data-ws-file]');
    form.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-ws-import], [data-ws-export], [data-ws-remove], [data-ws-arrange]') : null;
      if (!t || !wsApi) return;
      if (t.hasAttribute('data-ws-arrange')) { if (wsApi.arrange) wsApi.arrange(); return; }
      if (t.hasAttribute('data-ws-import')) { if (file) file.click(); return; }
      if (t.hasAttribute('data-ws-remove')) { e.preventDefault(); wsApi.remove(t.getAttribute('data-ws-remove')); wsRender(); return; }
      var x = wsApi.exportText();
      if (!x) { wsSay(T('shell.ws.bad', { why: T('shell.ws.why.unknown') })); return; }
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([x.text], { type: 'application/json' })); a.download = x.name;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    if (file) file.addEventListener('change', function () { var f = file.files && file.files[0]; if (!f) return; f.text().then(wsImport); file.value = ''; });
    // a .ccworkspace.json dropped on the dialog is imported
    dlg.addEventListener('dragover', function (e) { if (wsApi && e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) e.preventDefault(); });
    dlg.addEventListener('drop', function (e) {
      var f = wsApi && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f || !/\.json$/i.test(f.name)) return;
      e.preventDefault(); f.text().then(wsImport);
    });
  })();
  /* Work environments (0.7 WS.24, Discord 2026-10-24: "save different workspace profiles"): the whole setup of every app in this browser —
   * the layout (cc-workspace, imported layouts), the menu style family and each app's menus and keys (<slug>.input), each app's toolbar style,
   * panels, widths and screen mode (cc-app-settings:<slug>), My tools and the ribbon's fold (cc-ws-mytools:, cc-ws-ribbon:) — saved under a
   * name in cc-environments (at most ENV_MAX), switched (the keys are written, the families' other keys removed, the page reloads so every
   * engine starts from them; an app with unsaved work asks first, as on any reload), exported and imported as .ccenv.json (read as untrusted:
   * only these keys, bounded sizes). The theme and the language stay as they are. */
  var ENV_KEY = 'cc-environments', ENV_NOW = 'cc-environment', ENV_MAX = 12, ENV_FORMAT = 'cadcraft-environment', ENV_BYTES = 1048576;
  var ENV_RE = /^(cc-workspace|cc-workspace-files|cc-input-family|cc-app-settings:[a-z]{2,24}|cc-ws-mytools:[a-z]{2,24}|cc-ws-ribbon:[a-z]{2,24}|[a-z]{2,24}\.input)$/;
  var envForm = form.querySelector('[data-env-set]');
  function envAll() { try { var v = JSON.parse(localStorage.getItem(ENV_KEY) || '[]'); return Array.isArray(v) ? v.filter(envOk) : []; } catch (e) { return []; } }
  function envOk(x) { return !!x && typeof x.name === 'string' && x.name.length > 0 && x.keys && typeof x.keys === 'object'; }
  function envSave(list) { try { localStorage.setItem(ENV_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  function envClean(name) { return String(name || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40); }
  /** The keys of this browser's setup, now. */
  function envCapture() {
    var keys = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && ENV_RE.test(k)) keys[k] = localStorage.getItem(k); } } catch (e) {}
    return keys;
  }
  /** A file's or the store's entry, bounded: only the setup's keys, string values, ≤ ENV_BYTES in all. null = not an environment. */
  function envRead(obj) {
    if (!obj || typeof obj !== 'object' || obj.format !== ENV_FORMAT || obj.version !== 1 || !obj.keys || typeof obj.keys !== 'object') return null;
    var name = envClean(obj.name); if (!name) return null;
    var keys = {}, bytes = 0;
    Object.keys(obj.keys).forEach(function (k) {
      var v = obj.keys[k];
      if (!ENV_RE.test(k) || typeof v !== 'string') return;
      bytes += k.length + v.length; if (bytes <= ENV_BYTES) keys[k] = v;
    });
    return bytes <= ENV_BYTES ? { name: name, saved: typeof obj.saved === 'string' ? obj.saved.slice(0, 40) : '', keys: keys } : null;
  }
  function envSay(text) { var m = envForm && envForm.querySelector('[data-env-msg]'); if (m) m.textContent = text || ''; }
  function envRender() {
    if (!envForm) return;
    var sel = envForm.querySelector('[data-env-list]'), keep = sel.value, now = '';
    try { now = localStorage.getItem(ENV_NOW) || ''; } catch (e) {}
    while (sel.options.length > 1) sel.remove(1);
    envAll().forEach(function (x) { var o = document.createElement('option'); o.value = x.name; o.textContent = x.name + (x.name === now ? ' ' + T('shell.env.current') : ''); sel.appendChild(o); });
    sel.value = [].some.call(sel.options, function (o) { return o.value === keep; }) ? keep : (now && [].some.call(sel.options, function (o) { return o.value === now; }) ? now : '');
    envPicked();
  }
  function envPicked() {
    var on = !!envForm.querySelector('[data-env-list]').value;
    ['[data-env-use]', '[data-env-remove]', '[data-env-export]'].forEach(function (q) { envForm.querySelector(q).disabled = !on; });
  }
  function envAdd(entry, said) {
    var list = envAll().filter(function (x) { return x.name !== entry.name; });
    var replaced = list.length < envAll().length;
    if (!replaced && list.length >= ENV_MAX) { envSay(T('shell.env.full', { n: ENV_MAX })); return false; }
    list.push(entry);
    if (!envSave(list)) { envSay(T('shell.env.nostore')); return false; }
    envSay(T(said, { name: entry.name })); envRender();
    envForm.querySelector('[data-env-list]').value = entry.name; envPicked();
    return true;
  }
  function envUse(name) {
    var x = envAll().filter(function (e) { return e.name === name; })[0]; if (!x) return;
    try {
      var drop = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && ENV_RE.test(k) && !(k in x.keys)) drop.push(k); }
      drop.forEach(function (k) { localStorage.removeItem(k); });
      Object.keys(x.keys).forEach(function (k) { localStorage.setItem(k, x.keys[k]); });
      localStorage.setItem(ENV_NOW, x.name);
    } catch (e) { envSay(T('shell.env.nostore')); return; }
    envSay(T('shell.env.using', { name: x.name }));
    window.ccShellEnvironments._reload();
  }
  if (envForm) {
    var envFile = envForm.querySelector('[data-env-file]');
    envForm.querySelector('[data-env-list]').addEventListener('change', envPicked);
    envForm.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null; if (!b || b.disabled) return;
      var name = envForm.querySelector('[data-env-list]').value;
      if (b.hasAttribute('data-env-save')) {
        var input = envForm.querySelector('[data-env-name]'), n = envClean(input.value || name);
        if (!n) { envSay(T('shell.env.noname')); input.focus(); return; }
        var replacing = envAll().some(function (x) { return x.name === n; });
        if (envAdd({ name: n, saved: new Date().toISOString(), keys: envCapture() }, replacing ? 'shell.env.replaced' : 'shell.env.saved')) {
          try { localStorage.setItem(ENV_NOW, n); } catch (err) {}
          input.value = ''; envRender();
        }
      } else if (b.hasAttribute('data-env-use')) envUse(name);
      else if (b.hasAttribute('data-env-remove')) {
        envSave(envAll().filter(function (x) { return x.name !== name; }));
        try { if (localStorage.getItem(ENV_NOW) === name) localStorage.removeItem(ENV_NOW); } catch (err) {}
        envSay(T('shell.env.removed', { name: name })); envRender();
      } else if (b.hasAttribute('data-env-export')) {
        var x = envAll().filter(function (z) { return z.name === name; })[0]; if (!x) return;
        var text = JSON.stringify({ format: ENV_FORMAT, version: 1, name: x.name, saved: x.saved, keys: x.keys }, null, 2) + '\n';
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        a.download = (x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'environment') + '.ccenv.json';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      } else if (b.hasAttribute('data-env-import')) envFile.click();
    });
    envFile.addEventListener('change', function () {
      var f = envFile.files && envFile.files[0]; envFile.value = ''; if (!f) return;
      if (f.size > ENV_BYTES * 2) { envSay(T('shell.env.bad')); return; }
      f.text().then(function (text) {
        var entry = null; try { entry = envRead(JSON.parse(text)); } catch (e) { entry = null; }
        if (!entry) { envSay(T('shell.env.bad')); return; }
        envAdd(entry, 'shell.env.imported');
      });
    });
    envRender();
  }
  window.ccShellEnvironments = { list: function () { return envAll().map(function (x) { return x.name; }); }, capture: envCapture, read: envRead,
    use: envUse, _reload: function () { location.reload(); } };   // tests replace _reload

  /* Hardware specs (owner 2026-10-24): shared for building more efficient engines, anonymous and aggregated. One switch for every
   * app: localStorage cc-hw-share = 'on' | 'off'; no entry = the default — on in the browser (opt out), off in the desktop app
   * (opt in; window.cadcraftDesktop is the desktop bridge). The apps' compute/report.js asks window.ccShellHardware.allowed(). */
  var HW_KEY = 'cc-hw-share';
  var hwDesktop = function () { return !!window.cadcraftDesktop; };
  function hwAllowed() { try { var v = localStorage.getItem(HW_KEY); if (v === 'on') return true; if (v === 'off') return false; } catch (e) {} return !hwDesktop(); }
  function setHw(on) { try { localStorage.setItem(HW_KEY, on ? 'on' : 'off'); } catch (e) {} syncHw(); }
  function syncHw() {
    var box = form.querySelector('[data-hw-noshare]'); if (box) box.checked = !hwAllowed();
    var d = form.querySelector('[data-hw-default]'); if (d) d.textContent = T(hwDesktop() ? 'shell.hw.default.desktop' : 'shell.hw.default.web');
  }
  window.ccShellHardware = { allowed: hwAllowed, set: setHw, desktop: hwDesktop };
  window.addEventListener('storage', function (e) { if (e.key === WS_KEY) { wsMark(); wsTell(); } if (e.key === 'cc-workspace-files') wsRender(); });
  function syncForm() {
    wsRender();
    if (wsApi && wsApi.notice && wsApi.notice()) wsSay(wsApi.notice());   // a layout that could not be used: why
    if (form.elements.toursAll) form.elements.toursAll.checked = toursOn();
    syncHw();
    wsMark();
    var th = themeChoice();
    form.querySelectorAll('input[name="theme"]').forEach(function (r) { r.checked = r.value === th; });
    if (form.elements.ui) form.elements.ui.value = String(s.ui);
    if (form.elements.density) form.elements.density.value = s.density;
    var z = form.elements.zoom;
    z.value = String(s.zoom);
    if (z.value !== String(s.zoom)) z.value = '1';
    ['left', 'right'].forEach(function (side) {
      var r = form.elements[side], out = form.querySelector('[data-out="' + side + '"]');
      var row = r.closest('.shell-row');
      row.hidden = !panels[side];
      r.disabled = !threeCols;
      r.value = String(width(side));
      out.textContent = s[side] == null ? T('shell.settings.width.default', { n: width(side) }) : T('shell.settings.width', { n: width(side) });
    });
    form.elements.tips.checked = s.tips;
    form.elements.screen.value = s.screen;
    var tbSet = form.querySelector('[data-tb-set]');
    tbSet.hidden = !tb;
    form.querySelectorAll('input[name="tb"]').forEach(function (r) { r.checked = r.value === s.tb; });
    form.elements.tbGroups.checked = s.tbGroups;
    form.querySelectorAll('input[name="tbTouch"]').forEach(function (r) { r.checked = r.value === s.tbTouch; });
    var touchRow = form.querySelector('[data-tb-touch-row]');
    if (touchRow) { var coarse = false; try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) {} touchRow.hidden = !coarse; }   // i18n-ignore (CSS)
    form.querySelector('[data-tb-arrange]').disabled = !!tb && (!shown(tb) || (UI && s.tbLock));
    form.querySelector('[data-tb-order-reset]').disabled = UI && s.tbLock;
    if (form.elements.tbLock) form.elements.tbLock.checked = !!s.tbLock;
    form.querySelector('[data-tb-groups-row]').hidden = !groupsOf().length;
  }

  /* ---------------- Tabs: the app's own panel and General ----------------
   * Only when the build brings settings.inc. The last tab used is remembered per app (s.tab). */
  var tabs = [].slice.call(dlg.querySelectorAll('[data-settings-tab]'));
  function showTab(name, focus) {
    if (!tabs.length) return;
    if (!tabs.some(function (t) { return t.getAttribute('data-settings-tab') === name; })) name = 'app';
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-settings-tab') === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var pane = dlg.querySelector('[data-settings-pane="' + t.getAttribute('data-settings-tab') + '"]');
      if (pane) pane.hidden = !on;
      if (on && focus) t.focus();
    });
  }
  if (tabs.length) {
    dlg.querySelector('[data-settings-tabs]').hidden = false;
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { s.tab = t.getAttribute('data-settings-tab'); save(); showTab(s.tab); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, j = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
        if (j === null) return;
        e.preventDefault();
        var n = tabs[(j + tabs.length) % tabs.length];
        s.tab = n.getAttribute('data-settings-tab'); save(); showTab(s.tab, true);
      });
    });
    showTab(s.tab);
  }

  /* ---------------- Sections (0.7, data-shell-07): the tabs pick the list on the left, one section on the right ----------------
   * The tabs stay (<App> | Global); the list on the left holds the picked tab's sections — every fieldset straight inside its
   * pane — and the right shows the one picked. The list follows the fieldsets (add-ons add and remove theirs, the pen and
   * add-on sets show themselves later). The section picked last on each tab is remembered per app (s.secs {app, general}). */
  var nav = null, navBusy = false;
  if (dlg.hasAttribute('data-shell-07')) {
    var secBody = dlg.querySelector('.shell-dlg-body'), panes = [].slice.call(dlg.querySelectorAll('[data-settings-pane]'));
    // A section is a fieldset.shell-set straight inside the pane, or a wrapper holding one that a script mounts later
    // (host.js puts Assistants into the app's <div data-assistants-settings>).
    var isSet = function (n) { return !!n && n.tagName === 'FIELDSET' && n.classList.contains('shell-set'); };
    var secsOf = function (pane) { return [].slice.call(pane.children).filter(function (c) { return isSet(c) || (c.tagName === 'DIV' && isSet(c.firstElementChild)); }); };
    var secShown = function (fs) { return !fs.hidden && !(fs.tagName === 'DIV' && fs.firstElementChild.hidden); };
    var paneName = function (p) { return p.getAttribute('data-settings-pane'); };
    var paneFor = function (name) { return panes.filter(function (p) { return paneName(p) === name; })[0] || panes[0]; };
    var tabSelect = showTab;
    nav = document.createElement('nav');
    nav.className = 'shell-sec-nav';
    nav.setAttribute('aria-label', T('shell.settings.sections'));
    secBody.insertBefore(nav, secBody.firstChild);
    dlg.classList.add('shell-settings-secs');
    var showSec = function (fs, focus) {
      if (!fs) return;
      var pane = fs.parentElement;
      if (nav.ccPane !== pane) { s.tab = paneName(pane); tabSelect(s.tab); buildNav(pane, fs); return; }
      s.secs = Object.assign({}, s.secs, (function (o) { o[paneName(pane)] = secsOf(pane).indexOf(fs); return o; })({}));
      secsOf(pane).forEach(function (f) { f.classList.toggle('shell-sec-off', f !== fs); });
      [].forEach.call(nav.querySelectorAll('button'), function (b) {
        var on = b.ccSet === fs;
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        if (on && focus) b.focus();
        if (on) try { b.scrollIntoView({ block: 'nearest' }); } catch (e) {}
      });
      pane.scrollTop = 0;
    };
    var buildNav = function (pane, pick) {
      navBusy = true;
      pane = pane || paneFor(s.tab);
      nav.ccPane = pane;
      // Add-ons' own sections (addons.js settingsSection: .shell-addon-set) come last, under an "Add-ons" eyebrow.
      var isAddon = function (fs) { return fs.classList.contains('shell-addon-set'); };
      var ul = document.createElement('ul'), ulAdd = document.createElement('ul'), list = secsOf(pane).filter(secShown);
      list = list.filter(function (fs) { return !isAddon(fs); }).concat(list.filter(isAddon));
      list.forEach(function (fs) {
        var lg = fs.querySelector('legend'), b = document.createElement('button');
        b.type = 'button';
        b.textContent = (lg ? lg.textContent : '').replace(/\s+/g, ' ').trim();
        b.ccSet = fs;
        b.addEventListener('click', function () { showSec(fs); save(); });
        var li = document.createElement('li');
        li.appendChild(b);
        (isAddon(fs) ? ulAdd : ul).appendChild(li);
      });
      if (ulAdd.children.length) {
        var eb = document.createElement('p');
        eb.className = 'shell-sec-eyebrow';
        eb.setAttribute('aria-hidden', 'true');
        eb.innerHTML = '<i class="bi bi-puzzle" aria-hidden="true"></i> ';
        eb.appendChild(document.createTextNode(T('shell.addons')));
        ulAdd.setAttribute('aria-label', T('shell.addons'));
        nav.replaceChildren(ul, eb, ulAdd);
      } else nav.replaceChildren(ul);
      var n = s.secs && s.secs[paneName(pane)], all = secsOf(pane);
      if (!pick || list.indexOf(pick) === -1) pick = list.indexOf(all[n]) !== -1 ? all[n] : list[0];
      showSec(pick);
      navBusy = false;
    };
    nav.addEventListener('keydown', function (e) {
      var bs = [].slice.call(nav.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
      if (i < 0) return;
      var k = e.key, j = k === 'ArrowDown' ? i + 1 : k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? bs.length - 1 : null;
      if (j === null) return;
      e.preventDefault();
      bs[(j + bs.length) % bs.length].click();
      bs[(j + bs.length) % bs.length].focus();
    });
    // Only a section coming, going, showing or hiding rebuilds the list (not the panes the tabs hide, not a section's own contents).
    var mo = new MutationObserver(function (recs) {
      if (navBusy) return;
      var pane = nav.ccPane, top = function (n) { return n === pane || (n.parentElement === pane) || (n.parentElement && n.parentElement.parentElement === pane && n.tagName === 'FIELDSET'); };
      if (recs.some(function (r) { return r.type === 'childList' ? r.target === pane || r.target.parentElement === pane : top(r.target) && r.target !== pane; })) {
        var cur = nav.querySelector('button[aria-current="true"]');
        buildNav(nav.ccPane, cur && cur.ccSet);
      }
    });
    panes.forEach(function (p) { mo.observe(p, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] }); });
    showTab = function (name, focus) { s.tab = paneName(paneFor(name)); tabSelect(s.tab, focus); buildNav(paneFor(s.tab)); };
    /** Show the section a control sits in, on its tab (the palette and the toolbar menu jump to a setting). */
    dlg.ccShowSetting = function (el) { var fs = el; while (fs && fs.parentElement && !fs.parentElement.hasAttribute('data-settings-pane')) fs = fs.parentElement; if (fs && fs.parentElement && secsOf(fs.parentElement).indexOf(fs) !== -1) showSec(fs); };
    showTab(s.tab);
  }

  /* ---------------- Units (0.7 UNITS; site-wide like the theme) ----------------
   * [data-units-set] carries the URL of the build's copy of lib/units/unit-settings.js (app-settings.inc prints it only for
   * builds that have one); it is loaded on the first open and fills the lists itself (localStorage cc-units). */
  var unitsBox = dlg.querySelector('[data-units-set][data-units-src]'), unitsLoaded = false;
  function loadUnits() {
    if (!unitsBox || unitsLoaded) return;
    unitsLoaded = true;
    // resolved against the page: in an edition or Studio the src is relative to the page, and import() in this classic script would
    // resolve it against this file's folder (assets/js/) instead (closing part 2)
    import(new URL(unitsBox.getAttribute('data-units-src'), document.baseURI).href).then(function (m) { m.mountUnitSettings(unitsBox, T); }).catch(function () { unitsBox.hidden = true; });
  }

  function open() {
    layout();
    syncForm();
    loadUnits();
    showTab(s.tab);
    if (!dlg.open) dlg.showModal();
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'theme') setTheme(t.value);
    else if (t.name === 'workspace') setWs(t.value);
    else if (t.name === 'hwNoShare') setHw(!t.checked);
    else if (t.name === 'zoom') { s.zoom = parseFloat(t.value) || 1; applyZoom(); requestAnimationFrame(placeHandles); save(); }
    else if (t.name === 'ui') { var u = parseFloat(t.value); s.ui = u >= 0.8 && u <= 1.4 ? u : 1; applyUi(); save(); if (window.ccShellScreen) ccShellScreen.say(T('shell.settings.ui.now', { pct: Math.round(s.ui * 100) })); }
    else if (t.name === 'density') { s.density = t.value === 'compact' ? 'compact' : 'comfortable'; applyDensity(); save(); if (window.ccShellScreen) ccShellScreen.say(T('shell.settings.density.now', { density: (s.density === 'compact' ? T('shell.settings.density.compact') : T('shell.settings.density.comfortable')) })); }
    else if (t.name === 'toursAll') setToursOn(t.checked);
    else if (t.name === 'tips') { s.tips = t.checked; if (!s.tips) hideTip(); save(); }
    else if (t.name === 'screen') { s.screen = t.value; save(); }
    else if (t.name === 'tb') { s.tb = t.value; applyTb(); save(); }
    else if (t.name === 'tbGroups') { s.tbGroups = t.checked; applyTb(); save(); }
    else if (t.name === 'tbTouch') { s.tbTouch = t.value; applyTb(); save(); }
    else if (t.name === 'tbLock') { setLock(t.checked); syncForm(); }
    else if (t.name === 'left' || t.name === 'right') { setWidth(t.name, parseFloat(t.value), true); }
    else if (t.name === 'lang') setLang(t.value);
  });

  /* ---------------- Language (site-wide, like the theme) ----------------
   * The server picks the strings (cookie cc_lang first; docs/LANG.md), so a new language needs a reload: the choice is
   * written at once (the same cookie i18n.js setLocale writes; "" = automatic) and a Reload button is offered. */
  function setLang(v) {
    var ok = !v || /^[a-z]{2,3}(-([A-Z]{2}|[0-9]{3}|[A-Z][a-z]{3}))?$/.test(v);
    if (!ok) return;
    document.cookie = 'cc_lang=' + (v ? encodeURIComponent(v) : '') + '; path=/; SameSite=Lax; max-age=' + (v ? 31536000 : 0);
    var row = form.querySelector('[data-lang-reload-row]');
    if (row) row.hidden = false;
  }
  var reloadBtn = form.querySelector('[data-lang-reload]');
  if (reloadBtn) reloadBtn.addEventListener('click', function () {
    // ?lang= would win over nothing (the cookie is read first), but drop it so the address matches the choice.
    var u = new URL(location.href);
    if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); location.assign(u.href); } else location.reload();
  });
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (t.name === 'left' || t.name === 'right') {
      setWidth(t.name, parseFloat(t.value), false);
      form.querySelector('[data-out="' + t.name + '"]').textContent = T('shell.settings.width', { n: width(t.name) });
    }
  });
  dlg.querySelector('[data-settings-reset]').addEventListener('click', function () {
    resetOrder(true);
    dlg.dispatchEvent(new CustomEvent('cc-settings-reset'));   // the app's own settings (its settings.inc)
    s = Object.assign({}, DEFAULTS);
    try { localStorage.removeItem(KEY); } catch (e) {}
    applyZoom();
    applyUi();
    applyDensity();
    applyTb();
    layout();
    syncForm();
  });
  dlg.querySelector('[data-tb-arrange]').addEventListener('click', function () { dlg.close(); startArrange(); });
  dlg.querySelector('[data-tb-order-reset]').addEventListener('click', resetOrder);

  /* ---------------- 0.6 DF.8: Reset the layout ----------------
   * Everything that can hide or move a bar, a menu or a panel goes back to how the app starts; the theme, language, text
   * sizes and the app's own settings stay. `at` = the Studio hub's reset being applied (else now). */
  function resetLayout(at, quiet) {
    stopArrange();
    resetOrder(true);
    s.tbLock = false;
    if (window.ccInput && ccInput.setRibbon) ccInput.setRibbon(false);
    s.tb = DEFAULTS.tb; s.tbGroups = DEFAULTS.tbGroups; s.tbTouch = DEFAULTS.tbTouch;
    s.left = null; s.right = null; s.screen = 'normal';
    s.layoutAt = at || Date.now();
    save();
    if (window.ccShellPanels && ccShellPanels.reset) ccShellPanels.reset();
    if (window.ccInput && ccInput.resetLayout) ccInput.resetLayout();
    if (window.ccShellPhone) { try { ccShellPhone.tools(true); ccShellPhone.toolbarAt('top'); } catch (e) {} }
    if (window.ccShellScreen && ccShellScreen.mode() !== 'normal') ccShellScreen.goTo('normal');
    applyTb();
    layout();
    syncForm();
    if (!quiet && window.ccShellScreen) ccShellScreen.say(T('shell.layout.done', { app: dlg.getAttribute('data-app-name') }));
  }
  function hubReset() {   // the Studio hub's "Reset the layout in every app" ({at}), applied once per app
    var v = null;
    try { v = JSON.parse(localStorage.getItem(RESET_KEY) || 'null'); } catch (e) { v = null; }
    if (v && typeof v.at === 'number' && v.at > (s.layoutAt || 0) && v.at <= Date.now() + 60000) resetLayout(v.at, false);
  }
  if (UI) {
    var layoutBtn = dlg.querySelector('[data-layout-reset]');
    if (layoutBtn) layoutBtn.addEventListener('click', function () { resetLayout(0, false); });
    window.addEventListener('storage', function (e) { if (e.key === RESET_KEY) hubReset(); });
    window.ccShellLayout = { reset: function () { resetLayout(0, false); } };
  }

  /* ---------------- 0.6 DF.27: the toolbar's own menu (right-click) and the lock ---------------- */
  function setLock(on) {
    s.tbLock = !!on;
    if (s.tbLock) stopArrange();
    save();
    applyTb();
    if (window.ccShellScreen) ccShellScreen.say(T(s.tbLock ? 'shell.tb.locked' : 'shell.tb.unlocked'));
  }
  var ctx = null, ctxBack = null;
  function closeCtx(refocus) {
    if (!ctx || ctx.hidden) return;
    ctx.hidden = true;
    if (refocus && ctxBack && ctxBack.isConnected) ctxBack.focus();
  }
  function ctxItems() {
    var styled = !!(tb && tb.classList.contains('cc-in-styled'));
    var rib = window.ccInput && ccInput.ribbon ? ccInput.ribbon() : null;
    var out = [];
    if (arranging) out.push({ k: 'done', icon: 'bi-check2', label: T('shell.tbmenu.done'), run: stopArrange });
    else out.push({ k: 'arrange', icon: 'bi-arrows-move', label: T('shell.tbmenu.arrange'), run: startArrange,
      why: s.tbLock ? T('shell.tbmenu.why.locked') : styled ? T('shell.tbmenu.why.style') : !shown(tb) ? T('shell.arrange.no_toolbar') : '' });
    out.push(s.tbLock
      ? { k: 'unlock', icon: 'bi-unlock', label: T('shell.tbmenu.unlock'), run: function () { setLock(false); } }
      : { k: 'lock', icon: 'bi-lock', label: T('shell.tbmenu.lock'), run: function () { setLock(true); } });
    out.push({ k: 'reset', icon: 'bi-arrow-counterclockwise', label: T('shell.tbmenu.reset'), run: function () { resetOrder(); },
      why: s.tbLock ? T('shell.tbmenu.why.locked') : styled ? T('shell.tbmenu.why.style') : !s.order ? T('shell.tbmenu.why.original') : '' });
    if (rib && rib.on) {
      out.push('-');
      out.push(rib.collapsed
        ? { k: 'pin', icon: 'bi-pin-angle', label: T('shell.tbmenu.pin'), run: function () { ccInput.setRibbon(false); } }
        : { k: 'collapse', icon: 'bi-chevron-bar-up', label: T('shell.tbmenu.collapse'), run: function () { ccInput.setRibbon(true); } });
    }
    out.push('-');
    out.push({ k: 'settings', icon: 'bi-gear', label: T('shell.tbmenu.settings'), run: function () {
      s.tab = 'general'; open();
      var set = form.querySelector('[data-tb-set]');
      if (set && dlg.ccShowSetting) dlg.ccShowSetting(set);
      if (set) { set.scrollIntoView({ block: 'nearest' }); var f = set.querySelector('input, button'); if (f) f.focus(); }
    } });
    return out;
  }
  function openCtx(x, y, back) {
    if (!ctx) {
      ctx = document.createElement('div');
      ctx.className = 'shell-ctx';
      ctx.setAttribute('role', 'menu');
      ctx.setAttribute('data-tb-menu', '');
      ctx.setAttribute('aria-label', T('shell.tbmenu'));
      ctx.addEventListener('click', function (e) {
        var b = e.target.closest('[role="menuitem"]');
        if (!b || b.getAttribute('aria-disabled') === 'true') return;
        var it = b.__ccItem;
        closeCtx(true);
        if (it) it.run();
      });
      ctx.addEventListener('keydown', function (e) {
        var items = [].slice.call(ctx.querySelectorAll('[role="menuitem"]'));
        var i = items.indexOf(document.activeElement);
        e.stopPropagation();   // the apps take arrows, letters and Enter on the document
        if (e.key === 'Escape') { e.preventDefault(); closeCtx(true); }
        else if (e.key === 'Tab') { closeCtx(false); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
        else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (document.activeElement && ctx.contains(document.activeElement)) document.activeElement.click(); }
      });
      document.addEventListener('pointerdown', function (e) { if (ctx && !ctx.hidden && !ctx.contains(e.target)) closeCtx(false); }, true);
      window.addEventListener('blur', function () { closeCtx(false); });
      window.addEventListener('resize', function () { closeCtx(false); });
      body.appendChild(ctx);
    }
    ctx.replaceChildren();
    ctxItems().forEach(function (it) {
      if (it === '-') { ctx.appendChild(document.createElement('hr')); return; }
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      b.setAttribute('data-tb-menu-item', it.k);
      b.tabIndex = -1;
      var i = document.createElement('i');
      i.className = 'bi ' + it.icon;
      i.setAttribute('aria-hidden', 'true');
      var sp = document.createElement('span');
      sp.textContent = it.label;
      b.append(i, sp);
      if (it.why) { b.setAttribute('aria-disabled', 'true'); b.title = it.why; }
      b.__ccItem = it;
      ctx.appendChild(b);
    });
    ctxBack = back;
    ctx.hidden = false;
    var r = ctx.getBoundingClientRect();
    ctx.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 4)) + 'px';
    ctx.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 4)) + 'px';
    var first = ctx.querySelector('[role="menuitem"]:not([aria-disabled="true"])') || ctx.querySelector('[role="menuitem"]');
    if (first) first.focus();
  }
  if (UI && tb) {
    tb.addEventListener('contextmenu', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;   // the browser's own menu for text
      e.preventDefault();
      e.stopPropagation();
      var x = e.clientX, y = e.clientY;
      if (!x && !y) { var r = (e.target.getBoundingClientRect ? e.target : tb).getBoundingClientRect(); x = r.left; y = r.bottom; }   // the context-menu key
      openCtx(x, y, document.activeElement && document.activeElement !== body ? document.activeElement : null);
    });
    // Shift+F10 and the menu key, before the apps (CadCraft takes F10 for polar tracking)
    window.addEventListener('keydown', function (e) {
      if (!(e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey))) return;
      var a = document.activeElement;
      if (!a || !tb.contains(a) || (a.closest && a.closest('input, textarea, select, [contenteditable="true"]'))) return;
      e.preventDefault();
      e.stopPropagation();
      var r = a.getBoundingClientRect();
      openCtx(r.left, r.bottom, a);
    }, true);
  }
  dlg.addEventListener('close', function () {
    if (btn) { btn.setAttribute('aria-expanded', 'false'); if (!arranging) btn.focus(); }   // Arrange put the focus on the first tool
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // backdrop
  // The apps listen for keys and wheel on the window (shortcuts, zoom): stop them at the dialog's edge.
  ['keydown', 'keyup', 'wheel'].forEach(function (t) {
    dlg.addEventListener(t, function (e) { if (!(t === 'keydown' && e.key === 'Escape')) e.stopPropagation(); });
  });

  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', open);
  }
  // Capture phase, like Ctrl+Shift+F: the apps send typing to their own command lines.
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === ',' || e.code === 'Comma')) {
      e.preventDefault();
      e.stopPropagation();
      if (dlg.open) dlg.close(); else open();
    }
  }, true);

  if (tb) { original = snapshot(); applyOrder(); }
  applyTb();
  applyZoom();
  applyUi();
  applyDensity();
  layout();
  screenOnOpen();
  // Apps may finish building their panels after this script; place the handles again once they have.
  window.addEventListener('load', relayoutSoon);
  // A reset the Studio hub asked for while this app was closed: once app-panels.js and the menu style (a module that loads
  // its registry) are up.
  if (UI) window.addEventListener('load', function () {
    if (document.getElementById('cc-input') && !window.ccInput) window.addEventListener('cc-input-ready', hubReset, { once: true });
    else hubReset();
  });
})();
