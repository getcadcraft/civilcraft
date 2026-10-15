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
 *
 * An app may add its own fieldsets (build folder settings.inc; app-settings.inc includes it) — they get a tab of
 * their own, named after the app, beside "General" (last tab used remembered: s.tab). Its JS owns those fields and
 * resets them on the dialog's "cc-settings-reset" event.
 * Everything but the theme is per app: localStorage "cc-app-settings:<slug>". Ctrl+, opens the dialog.
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
  var DEFAULTS = { zoom: 1, left: null, right: null, tips: true, screen: 'normal', tb: 'both', tbGroups: true, tbTouch: 'row', order: null, tab: 'app' };
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
  function resetOrder() {
    if (!original) return;
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
    relayoutSoon();
  }

  /* Arrange mode: clicks on the toolbar do nothing; tools drag within their row, groups by their name. */
  var arranging = false, bar = null, drag = null;

  function startArrange() {
    if (!tb || arranging) return;
    if (tb.hidden || tb.offsetParent === null) {
      if (window.ccShellScreen) ccShellScreen.say(T('shell.arrange.no_toolbar'));
      return;
    }
    arranging = true;
    body.classList.add('shell-arranging');
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
    d.parent.insertBefore(d.el, e.key === 'ArrowLeft' ? items[j] : items[j].nextSibling);
    document.activeElement.focus();
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

  function syncForm() {
    var th = themeChoice();
    form.querySelectorAll('input[name="theme"]').forEach(function (r) { r.checked = r.value === th; });
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
    form.querySelector('[data-tb-arrange]').disabled = !!tb && (tb.hidden || tb.offsetParent === null);
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

  function open() {
    layout();
    syncForm();
    showTab(s.tab);
    if (!dlg.open) dlg.showModal();
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'theme') setTheme(t.value);
    else if (t.name === 'zoom') { s.zoom = parseFloat(t.value) || 1; applyZoom(); requestAnimationFrame(placeHandles); save(); }
    else if (t.name === 'tips') { s.tips = t.checked; if (!s.tips) hideTip(); save(); }
    else if (t.name === 'screen') { s.screen = t.value; save(); }
    else if (t.name === 'tb') { s.tb = t.value; applyTb(); save(); }
    else if (t.name === 'tbGroups') { s.tbGroups = t.checked; applyTb(); save(); }
    else if (t.name === 'tbTouch') { s.tbTouch = t.value; applyTb(); save(); }
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
    resetOrder();
    dlg.dispatchEvent(new CustomEvent('cc-settings-reset'));   // the app's own settings (its settings.inc)
    s = Object.assign({}, DEFAULTS);
    try { localStorage.removeItem(KEY); } catch (e) {}
    applyZoom();
    applyTb();
    layout();
    syncForm();
  });
  dlg.querySelector('[data-tb-arrange]').addEventListener('click', function () { dlg.close(); startArrange(); });
  dlg.querySelector('[data-tb-order-reset]').addEventListener('click', resetOrder);
  dlg.addEventListener('close', function () {
    if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
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
  layout();
  screenOnOpen();
  // Apps may finish building their panels after this script; place the handles again once they have.
  window.addEventListener('load', relayoutSoon);
})();
