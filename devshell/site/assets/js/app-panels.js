/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-panels.js — movable panels and the panels window (multiple monitors) for an app's browser UI.
 * Loaded by app-shell.inc only for a build whose manifest says "panels": ["move", "window"]
 * (AppBuilds::panels); every other build — every frozen release without the flag — never loads it.
 * Spec: docs/3D-SPEC.md section E. Map: docs/apps/app-panels.md.
 *
 * Panels are found by shape, like the settings panel widths: <main>'s direct-child <aside> whose class
 * ends in -left / -right (or -bottom). Each gets a grip (a slim header the shell adds as its first child):
 * drag it to dock left, right or bottom, or drop it over the drawing to float it (moved by the grip,
 * resized at its corner, kept on screen). Its menu (keyboard) offers the same plus "Move to a new window".
 *
 *   docked at home   nothing changes: the app's own grid (and the Settings widths) lay it out
 *   anything else    "managed": the shell rewrites <main>'s grid from the app's own template —
 *                    the side columns go, dock columns/row are added; both panels may share a dock
 *                    (stacked or side by side, a splitter between); floating panels sit over <main>
 *   window           ONE same-origin pop-up (about:blank, opened inside the click); the panels'
 *                    DOM moves into it with adoptNode, so listeners and the app's references survive;
 *                    stylesheets, theme, layer, panel text size are copied and kept in step; keys that are
 *                    not typing in a field are sent on to the main document, so shortcuts work there too.
 *                    Closing it docks the panels back; closing or reloading the main window closes it.
 *                    Window Management API (Chromium): "Put it on my other screen" (asks permission only
 *                    on that click) and the screen is remembered; else the last position and size.
 *
 * Remembered per app in localStorage "cc-app-settings:<slug>" → panels (app-settings.js keeps the field).
 * A window can only be opened from a click, so after a reload the shell offers "Open it" instead.
 * Settings › General: "Reset layout" (and Settings' own Reset) put everything back.
 * window.ccShellPanels is the small API the tests and app-settings.js use.
 */
(function () {
  'use strict';
  var body = document.body;
  var main = document.querySelector('body.app-shell > main');
  var dlg = document.querySelector('[data-app-settings]');
  if (!main || !dlg || !body.classList.contains('app-shell')) return;

  var FEAT = (dlg.getAttribute('data-panels') || '').split(/\s+/);   // app-settings.inc, from AppBuilds::panels()
  var CAN_MOVE = FEAT.indexOf('move') !== -1;
  var CAN_WIN = FEAT.indexOf('window') !== -1;
  if (!CAN_MOVE && !CAN_WIN) return;

  var SLUG = dlg.getAttribute('data-app');
  var APP_NAME = dlg.getAttribute('data-app-name') || 'App';
  var KEY = 'cc-app-settings:' + SLUG;
  var SIDES = ['left', 'right', 'bottom'];
  var DOCKS = ['left', 'right', 'bottom'];
  var MIN_W = 10, MAX_W = 40, MIN_STAGE = 20, MIN_H = 6;   // rem
  var MAX_WINS = 4;   // panels windows at once (1.6)
  var HAS_WM = typeof window.getScreenDetails === 'function';
  var root = document.documentElement;
  /* 0.5 VP.5: floating panels stay between the toolbar and the command line, and the bottom dock gives way when the window
   * shrinks. This file is shared by every build, released ones too, so the new places apply to dev and to builds from 0.5
   * on; a 0.4 release (or older) keeps the places it shipped with until the owner releases a newer one. */
  var FIT = (function () {
    var s = document.querySelector('script[type="module"][src*="/assets/apps/"]');
    var m = s && /\/assets\/apps\/[^\/]+\/([^\/?#]+)\//.exec(s.getAttribute('src') || '');
    var v = m && /^(\d+)\.(\d+)(\.|$)/.exec(m[1]);
    return !v || +v[1] > 0 || +v[2] >= 5;
  })();
  var FLOAT_H = 28, FLOAT_STAGE = 0.5;        // a new floating panel: at most 28 rem, at most half the drawing's height
  var BAND_FOOT = 2.5;                         // rem kept free at the band's foot when it is that short (a strip of sheet tabs)
  var DOCK_MAX = 0.35, STAGE_KEEP = 10, STAGE_MIN = 6, DOCK_MIN = 3;   // bottom dock: share of <main>; rem (see dockCapNow)

  function remPx() { return parseFloat(getComputedStyle(root).fontSize) || 16; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function round(n) { return Math.round(n * 4) / 4; }
  function say(t) { if (window.ccShellScreen && ccShellScreen.say) ccShellScreen.say(t); }
  function T(k, v) { return window.ccShellT ? window.ccShellT(k, v) : k; }

  /* ---------------- The panels ---------------- */
  var panels = [];   // {id (home side), el, name, homeArea, grip, mo}
  for (var i = 0; i < main.children.length; i++) {
    var c = main.children[i];
    if (c.tagName !== 'ASIDE') continue;
    for (var j = 0; j < SIDES.length; j++) {
      if (new RegExp('-' + SIDES[j] + '(\\s|$)').test(c.className) && !byId(SIDES[j])) {
        panels.push({ id: SIDES[j], el: c, name: c.getAttribute('aria-label') || (SIDES[j] + ' panel') });
      }
    }
  }
  if (!panels.length) return;
  function byId(id) { for (var k = 0; k < panels.length; k++) if (panels[k].id === id) return panels[k]; return null; }
  panels.forEach(function (p) {
    var a = getComputedStyle(p.el).gridRowStart;
    p.homeArea = a && a !== 'auto' && !/^\d/.test(a) && !/^span/.test(a) ? a : null;
  });

  /* ---------------- State ---------------- */
  function freshState() {
    var st = { p: {}, docks: { left: {}, right: {}, bottom: {} }, wins: {} };
    panels.forEach(function (p, n) { st.p[p.id] = { dock: p.id, order: n }; });
    return st;
  }
  function readAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function load() {
    var st = freshState();
    var v = readAll().panels;
    if (!v || typeof v !== 'object') return st;
    panels.forEach(function (p) {
      var q = v.p && v.p[p.id];
      if (!q) return;
      var t = st.p[p.id];
      if (['left', 'right', 'bottom', 'float', 'window'].indexOf(q.dock) !== -1) t.dock = q.dock;
      if (t.dock === 'window' && !CAN_WIN) t.dock = p.id;
      if (t.dock === 'window') t.win = typeof q.win === 'number' && q.win >= 1 && q.win <= MAX_WINS ? Math.round(q.win) : 1;
      if (t.dock !== 'window' && t.dock !== p.id && !CAN_MOVE) t.dock = p.id;
      if (typeof q.order === 'number') t.order = q.order;
      if (['left', 'right', 'bottom', 'float'].indexOf(q.prev) !== -1) t.prev = q.prev;
      if (q.float && ['x', 'y', 'w', 'h'].every(function (k) { return typeof q.float[k] === 'number' && isFinite(q.float[k]); })) t.float = q.float;
    });
    DOCKS.forEach(function (d) {
      var q = v.docks && v.docks[d];
      if (!q) return;
      if (typeof q.w === 'number') st.docks[d].w = clamp(q.w, MIN_W, MAX_W);
      if (typeof q.h === 'number') st.docks[d].h = clamp(q.h, MIN_H, 60);
      if (typeof q.split === 'number') st.docks[d].split = clamp(q.split, 0.15, 0.85);
    });
    // Window places per window number (1.6); "win" is the one-window layout of 0.3/0.4 part 1 = window 1.
    var ws = v.wins && typeof v.wins === 'object' ? v.wins : (v.win && typeof v.win === 'object' ? { 1: v.win } : {});
    Object.keys(ws).forEach(function (n) {
      var q = ws[n], k2 = parseInt(n, 10);
      if (!q || typeof q !== 'object' || !(k2 >= 1 && k2 <= MAX_WINS)) return;
      var o = {};
      ['x', 'y', 'w', 'h'].forEach(function (k) { if (typeof q[k] === 'number' && isFinite(q[k])) o[k] = Math.round(q[k]); });
      if (typeof q.screen === 'string') o.screen = q.screen.slice(0, 200);
      st.wins[k2] = o;
    });
    return st;
  }
  function isDefault(st) {
    return panels.every(function (p) { return st.p[p.id].dock === p.id; }) &&
      DOCKS.every(function (d) { return st.docks[d].w == null && st.docks[d].h == null && st.docks[d].split == null; }) &&
      Object.keys(st.wins).every(function (n) { return !st.wins[n].x && !st.wins[n].screen; });
  }
  function save() {
    var all = readAll();
    if (isDefault(S)) delete all.panels; else all.panels = S;
    try {
      if (Object.keys(all).length) localStorage.setItem(KEY, JSON.stringify(all)); else localStorage.removeItem(KEY);
    } catch (e) {}
  }
  var S = load();

  /* ---------------- The app's own grid template (read off a hidden copy of <main>) ---------------- */
  function tracks(s) {
    var out = [], depth = 0, cur = '';
    for (var k = 0; k < s.length; k++) {
      var ch = s[k];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  }
  function declared() {
    var c = main.cloneNode(false);
    c.removeAttribute('id');
    c.removeAttribute('style');
    c.style.display = 'none';
    main.parentNode.insertBefore(c, main);
    var cs = getComputedStyle(c);
    var r = { areas: cs.gridTemplateAreas, rows: cs.gridTemplateRows, cols: cs.gridTemplateColumns };
    c.remove();
    var m = [], re = /"([^"]*)"/g, x;
    while ((x = re.exec(r.areas || ''))) m.push(x[1].trim().split(/\s+/));
    return { matrix: m, rows: r.rows && r.rows !== 'none' ? tracks(r.rows) : [], cols: r.cols && r.cols !== 'none' ? tracks(r.cols) : [] };
  }
  /** Can this layout be managed? Three columns, and every side cell a panel (else we'd drop something). */
  function plan() {
    var d = declared();
    if (d.cols.length !== 3) return null;
    var center = null;
    if (!d.matrix.length) {
      // No named areas (BimCraft): one row, the panels auto-placed beside one stage element.
      var flow = [].filter.call(main.children, function (ch) {
        if (panels.some(function (p) { return p.el === ch; })) return false;
        var cs = getComputedStyle(ch);
        return cs.display !== 'none' && cs.position !== 'absolute' && cs.position !== 'fixed';
      });
      if (flow.length !== 1) return null;
      center = flow[0];
      d.matrix = [['shell-home-a', 'shell-center', 'shell-home-b']];
      if (!d.rows.length) d.rows = ['minmax(0px, 1fr)'];
    } else {
      if (d.matrix.some(function (r) { return r.length !== 3; })) return null;
      if (d.rows.length !== d.matrix.length) return null;
    }
    var homes = panels.map(function (p) { return p.homeArea; }).filter(Boolean);
    var body_ = [];
    for (var r = 0; r < d.matrix.length; r++) {
      var row = d.matrix[r];
      var sideIsPanel = function (n) { return homes.indexOf(n) !== -1 || n === 'shell-home-a' || n === 'shell-home-b'; };
      if (sideIsPanel(row[0]) || sideIsPanel(row[2])) body_.push(r);
      else if (row[0] !== row[1] || row[2] !== row[1]) return null;   // something lives only at a side
    }
    if (!body_.length) return null;
    return { matrix: d.matrix, rows: d.rows, body: body_, center: center };
  }

  /* ---------------- Layout ---------------- */
  var managed = false, narrow = false;
  var base = { left: 16, right: 18, bottom: 12 };   // rem; measured from the app's own layout
  var handles = [];   // dock size / split handles over <main>
  var centerEl = null;

  function measureBase() {
    if (managed) return;
    var cols = getComputedStyle(main).gridTemplateColumns.split(' ').filter(Boolean);
    if (cols.length === 3) {
      base.left = round(parseFloat(cols[0]) / remPx());
      base.right = round(parseFloat(cols[2]) / remPx());
    }
    base.bottom = round(clamp(main.clientHeight / remPx() * 0.3, MIN_H, 18));
  }
  /** Where a panel shows in this window: one waiting for its window (after a reload) shows at its previous place. */
  function eff(p) {
    var st = S.p[p.id];
    if (st.dock === 'window' && p.el.ownerDocument === document) return st.prev && st.prev !== 'window' ? st.prev : p.id;
    return st.dock;
  }
  function inDock(d) {
    return panels.filter(function (p) { return eff(p) === d && p.el.ownerDocument === document; })
      .sort(function (a, b) { return S.p[a.id].order - S.p[b.id].order; });
  }
  function dockW(d) {
    if (S.docks[d].w != null) return S.docks[d].w;
    var first = inDock(d)[0];
    return first && (first.id === 'left' || first.id === 'right') ? base[first.id] : base[d] || 16;
  }
  function dockH() { return S.docks.bottom.h != null ? S.docks.bottom.h : base.bottom; }
  function wantsManaged() {
    return panels.some(function (p) { return eff(p) !== p.id; });
  }

  function clearInline() {
    main.style.removeProperty('grid-template-areas');
    main.style.removeProperty('grid-template-rows');
    main.style.removeProperty('grid-template-columns');
    panels.forEach(function (p) {
      ['grid-area', 'align-self', 'justify-self', 'height', 'width', 'left', 'top', 'min-height'].forEach(function (k) { p.el.style.removeProperty(k); });
      p.el.classList.remove('shell-float', 'shell-docked');
      p.el.removeAttribute('data-shell-dock');
    });
    if (centerEl) { centerEl.style.removeProperty('grid-area'); centerEl = null; }
  }

  function layout() {
    var want = wantsManaged();
    // The phone layout (app-phone.js, html.cc-phone) turns panels into sheets of its own: stand aside as on narrow layouts.
    var pl = want && !(FIT && root.classList.contains('cc-phone')) ? plan() : null;
    if (want && !pl) {
      // Narrow layouts (one column) keep the app's own arrangement; panels in the window stay there.
      narrow = true;
      if (managed) { managed = false; clearInline(); setManagedFlag(false); }
      hideSizers();
      main.classList.add('shell-panels-narrow');
      placeHandles();
      return;
    }
    narrow = false;
    main.classList.remove('shell-panels-narrow');
    if (!want) {
      if (managed) { managed = false; clearInline(); setManagedFlag(false); }
      hideSizers();
      placeHandles();
      return;
    }
    if (!managed) measureBase();
    managed = true;
    clearInline();
    setManagedFlag(true);

    var L = inDock('left'), R = inDock('right'), B = inDock('bottom');
    var rows = pl.rows.slice(), m = pl.matrix.map(function (r) { return r.slice(); });
    var bodyRows = pl.body.slice();
    var at = -1;
    if (B.length) {
      at = bodyRows[bodyRows.length - 1] + 1;
      rows.splice(at, 0, (FIT ? dockShown(dockCap) : dockH()) + 'rem');
      m.splice(at, 0, ['shell-dock-bottom', 'shell-dock-bottom', 'shell-dock-bottom']);
      bodyRows.push(at);
    }
    bandRows = { stage: pl.body.slice(), dock: at };
    var areas = m.map(function (row, r) {
      var isBody = bodyRows.indexOf(r) !== -1;
      var mid = row[1];
      var cells = [];
      if (L.length) cells.push(isBody ? 'shell-dock-left' : mid);
      cells.push(mid);
      if (R.length) cells.push(isBody ? 'shell-dock-right' : mid);
      return '"' + cells.join(' ') + '"';
    });
    var cols = [];
    var total = main.clientWidth / remPx();
    var lw = L.length ? dockW('left') : 0, rw = R.length ? dockW('right') : 0;
    if (lw + rw > total - MIN_STAGE) {   // keep the drawing at least MIN_STAGE wide
      var k = Math.max(0, total - MIN_STAGE) / (lw + rw);
      lw = Math.max(MIN_W, lw * k); rw = Math.max(MIN_W, rw * k);
    }
    if (L.length) cols.push(lw + 'rem');
    cols.push('minmax(0, 1fr)');
    if (R.length) cols.push(rw + 'rem');
    main.style.gridTemplateColumns = cols.join(' ');
    main.style.gridTemplateRows = rows.join(' ');
    main.style.gridTemplateAreas = areas.join(' ');
    if (pl.center) { centerEl = pl.center; centerEl.style.gridArea = 'shell-center'; }

    [['left', L], ['right', R], ['bottom', B]].forEach(function (dl) {
      var d = dl[0], list = dl[1];
      list.forEach(function (p, n) {
        p.el.classList.add('shell-docked');
        p.el.setAttribute('data-shell-dock', d);
        p.el.style.gridArea = 'shell-dock-' + d;
        if (list.length > 1) {
          var f = S.docks[d].split != null ? S.docks[d].split : 0.5;
          var part = n === 0 ? f : 1 - f;
          if (d === 'bottom') {
            p.el.style.justifySelf = n === 0 ? 'start' : 'end';
            p.el.style.width = (part * 100) + '%';
          } else {
            p.el.style.alignSelf = n === 0 ? 'start' : 'end';
            p.el.style.height = (part * 100) + '%';
          }
        }
      });
    });
    // Every floating panel out of the grid before any is measured against it (band, dock cap).
    if (FIT) panels.forEach(function (p) { if (eff(p) === 'float' && p.el.ownerDocument === document) p.el.classList.add('shell-float'); });
    panels.forEach(function (p) {
      if (eff(p) === 'float' && p.el.ownerDocument === document) placeFloat(p);
    });
    if (FIT && B.length) {
      // The bottom dock gives way when the window is short (dockCapNow); what the person set comes back when it grows.
      // Measured once every panel has its place (a panel not yet placed would sit in an implicit row).
      var cap = dockCapNow();
      if (cap !== dockCap) {
        dockCap = cap; rows[at] = dockShown(cap) + 'rem'; main.style.gridTemplateRows = rows.join(' ');
        panels.forEach(function (p) { if (eff(p) === 'float' && p.el.ownerDocument === document) placeFloat(p); });
      }
    }
    hideSizers();
    placeHandles();
  }
  function setManagedFlag(on) {
    main.classList.toggle('shell-panels-managed', on);
    body.classList.toggle('shell-panels-moved', on);   // app-settings.js re-lays out on body class changes
  }

  /* 0.5 VP.5: the rows the drawing and the docks share (the "band"), from <main>'s used row sizes. */
  var bandRows = null;   // {stage: [row indexes], dock: row index of the bottom dock or -1}, set by layout()
  var dockCap = null;    // rem: the most the bottom dock may take in this window (null until measured)
  function usedRows() {
    var cs = getComputedStyle(main);
    var px = tracks(cs.gridTemplateRows).filter(function (t) { return /px$/.test(t); }).map(parseFloat);
    return { px: px, gap: parseFloat(cs.rowGap) || 0, pad: parseFloat(cs.paddingTop) || 0 };
  }
  function rowTop(u, i) { var y = u.pad; for (var k = 0; k < i; k++) y += (u.px[k] || 0) + u.gap; return y; }
  /** In rem from <main>'s top-left: top and height of the band (stage rows + bottom dock), and the stage rows' height. */
  function band() {
    var rp = remPx(), mh = main.clientHeight / rp;
    if (!managed || !bandRows || !bandRows.stage.length) return { top: 0, h: mh, stage: mh };
    var u = usedRows();
    var rs = bandRows.stage.concat(bandRows.dock >= 0 ? [bandRows.dock] : []);
    var a = Math.min.apply(null, rs), b = Math.max.apply(null, rs);
    if (b >= u.px.length) return { top: 0, h: mh, stage: mh };
    var top = rowTop(u, a), bot = rowTop(u, b) + u.px[b];
    var sa = Math.min.apply(null, bandRows.stage), sb = Math.max.apply(null, bandRows.stage);
    var stage = rowTop(u, sb) + u.px[sb] - rowTop(u, sa);
    return { top: top / rp, h: Math.max(0, bot - top) / rp, stage: Math.max(0, stage) / rp };
  }
  /** The bottom dock's cap in this window (rem), from the rows' used sizes. */
  function dockCapNow() {
    var rp = remPx(), mh = main.clientHeight / rp;
    if (!bandRows || bandRows.dock < 0) return null;
    var u = usedRows();
    if (bandRows.dock >= u.px.length) return null;
    var other = 0;   // the rows that are neither the drawing nor the dock: toolbar, command line, status bar …
    u.px.forEach(function (h, i) { if (i !== bandRows.dock && bandRows.stage.indexOf(i) === -1) other += h; });
    var avail = mh - other / rp - u.gap * Math.max(0, u.px.length - 1) / rp;
    // Room to spare: the dock may grow while the drawing keeps STAGE_KEEP. Short: 35 % of <main>, less if the drawing would
    // keep under STAGE_MIN (its sheet tabs and a strip of drawing), not under DOCK_MIN (the grip and a line). No room for
    // both (a window under ~300 CSS px tall): the drawing's tabs come first and the dock shrinks, to nothing if it must.
    if (avail < STAGE_MIN + DOCK_MIN) return round(Math.max(0, avail - STAGE_MIN));
    return round(Math.max(DOCK_MIN, Math.max(avail - STAGE_KEEP, Math.min(mh * DOCK_MAX, avail - STAGE_MIN))));
  }
  function dockShown(cap) { return cap == null ? dockH() : Math.min(dockH(), cap); }
  /** A new floating panel's place: beside the middle, near the top of the drawing, half its height at most (28 rem). */
  function floatDefault(mw, b, p) {
    return { w: Math.min(20, mw * 0.4), h: Math.max(gh(p), Math.min(FLOAT_H, b.stage * FLOAT_STAGE)), x: mw * 0.5, y: b.top + Math.min(2, b.stage * 0.1) };
  }
  /** A floating panel's least height: its grip and a little of its content (rem). */
  function gh(p) { return (p && p.grip && p.grip.offsetHeight ? p.grip.offsetHeight / remPx() : 2) + 0.5; }
  /** Where a floating panel shows: its remembered place, kept inside the band (above the command line and status bar).
   *  A short window only changes where it shows; the remembered place changes when the person moves or sizes it. */
  function placeFit(p, commit) {
    var st = S.p[p.id];
    var rp = remPx(), mw = main.clientWidth / rp;
    var b = band();
    var wish = st.float || floatDefault(mw, b, p);
    var hi = Math.max(gh(p), b.h);
    // Never taller than the band (unless it can't show its grip); never shorter than 6 rem when the person sizes it, but a
    // default place on a short window may be (down to the grip), so it doesn't cover the sheet tabs at the drawing's foot.
    var lo = commit ? Math.min(MIN_H, hi) : Math.min(Math.max(gh(p), Math.min(MIN_H, wish.h)), hi);
    var f = { w: clamp(wish.w, MIN_W, Math.max(MIN_W, mw - 1)), h: clamp(wish.h, lo, hi) };
    f.x = clamp(wish.x, 0, Math.max(0, mw - f.w));
    if (b.h < Math.min(MIN_H, Math.max(gh(p), lo)) + BAND_FOOT) {
      // No room (the drawing is about one strip of sheet tabs tall): just its grip, at the top over the toolbar — never over
      // the tabs (whose strip may even rise above so short a drawing), the command line or the status bar.
      f.h = Math.min(f.h, gh(p));
      f.y = 0;
    } else {
      f.y = clamp(wish.y, b.top, b.top + b.h - f.h);
    }
    if (commit) st.float = { x: f.x, y: f.y, w: f.w, h: f.h };
    p.shown = f;
    p.el.classList.add('shell-float');
    p.el.style.left = f.x + 'rem';
    p.el.style.top = f.y + 'rem';
    p.el.style.width = f.w + 'rem';
    p.el.style.height = f.h + 'rem';
    p.el.style.minHeight = Math.min(MIN_H, f.h) + 'rem';
    sizer(p).hidden = false;
    placeSizer(p);
  }
  /** The person takes hold of a floating panel: what shows becomes what is remembered. */
  function adopt(p) { if (FIT && p.shown) S.p[p.id].float = { x: p.shown.x, y: p.shown.y, w: p.shown.w, h: p.shown.h }; }

  /* Floating: absolutely placed over <main>, kept inside it. Stored in rem from <main>'s top-left. */
  function placeFloat(p, commit) {
    if (FIT) { placeFit(p, commit); return; }
    var st = S.p[p.id];
    var rp = remPx(), mw = main.clientWidth / rp, mh = main.clientHeight / rp;
    var f = st.float || { w: Math.min(20, mw * 0.4), h: Math.min(28, mh * 0.7), x: mw * 0.5, y: 2 };
    f.w = clamp(f.w, MIN_W, Math.max(MIN_W, mw - 1));
    f.h = clamp(f.h, MIN_H, Math.max(MIN_H, mh - 1));
    f.x = clamp(f.x, 0, Math.max(0, mw - f.w));
    f.y = clamp(f.y, 0, Math.max(0, mh - f.h));
    st.float = f;
    p.el.classList.add('shell-float');
    p.el.style.left = f.x + 'rem';
    p.el.style.top = f.y + 'rem';
    p.el.style.width = f.w + 'rem';
    p.el.style.height = f.h + 'rem';
    sizer(p).hidden = false;
    placeSizer(p);
  }

  /* A floating panel's corner: a handle over <main> (pointer events, so touch and pen resize too; 1.6). */
  function sizer(p) {
    if (p.sizer) return p.sizer;
    var h = document.createElement('div');
    h.className = 'shell-float-size';
    h.setAttribute('role', 'separator');
    h.setAttribute('aria-label', T('shell.panels.float.resize', { panel: p.name }));
    h.title = T('shell.panels.float.resize.title');
    h.tabIndex = 0;
    h.hidden = true;
    main.appendChild(h);
    var start = null;
    h.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      try { h.setPointerCapture(e.pointerId); } catch (err) {}
      adopt(p);
      var f = S.p[p.id].float;
      start = { x: e.clientX, y: e.clientY, w: f.w, h: f.h, id: e.pointerId };
      body.classList.add('shell-resizing');
    });
    h.addEventListener('pointermove', function (e) {
      if (!start || e.pointerId !== start.id) return;
      var rp = remPx(), f = S.p[p.id].float;
      f.w = start.w + (e.clientX - start.x) / rp;
      f.h = start.h + (e.clientY - start.y) / rp;
      placeFloat(p, true);
    });
    function end(e) {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      try { h.releasePointerCapture(e.pointerId); } catch (err) {}
      body.classList.remove('shell-resizing');
      save();
    }
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
    h.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) !== -1) adopt(p);
      var f = S.p[p.id].float, step = e.shiftKey ? 2 : 0.5;
      if (e.key === 'ArrowRight') f.w += step; else if (e.key === 'ArrowLeft') f.w -= step;
      else if (e.key === 'ArrowDown') f.h += step; else if (e.key === 'ArrowUp') f.h -= step;
      else return;
      e.preventDefault(); e.stopPropagation();
      placeFloat(p, true); save();
    });
    p.sizer = h;
    return h;
  }
  function placeSizer(p) {
    var f = (FIT && p.shown) || S.p[p.id].float, h = p.sizer;
    if (!h || !f) return;
    h.style.left = 'calc(' + (f.x + f.w) + 'rem - 1.1rem)';   // i18n-ignore (CSS)
    h.style.top = 'calc(' + (f.y + f.h) + 'rem - 1.1rem)';   // i18n-ignore (CSS)
  }
  function hideSizers() {
    panels.forEach(function (p) { if (p.sizer && !(eff(p) === 'float' && p.el.ownerDocument === document && managed)) p.sizer.hidden = true; });
  }

  /* Handles: dock sizes (inner edge of a side dock, top edge of the bottom dock) and the split between
   * two panels sharing a dock. Placed over <main> like app-settings.js's own width handles. */
  function makeHandle(kind, dock) {
    var h = document.createElement('div');
    h.className = 'shell-dock-split shell-dock-split-' + kind;
    h.setAttribute('role', 'separator');
    var vertical = (kind === 'size' && dock !== 'bottom') || (kind === 'stack' && dock === 'bottom');
    h.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    h.setAttribute('aria-label', T(kind === 'size' ? 'shell.panels.dock.resize.' + dock : 'shell.panels.dock.share.' + dock));
    h.tabIndex = 0;
    h.title = T('shell.split.title');
    h.setAttribute('data-kind', kind);
    h.setAttribute('data-dock', dock);
    h.classList.toggle('is-vertical', vertical);
    main.appendChild(h);
    var start = null;
    h.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      start = { x: e.clientX, y: e.clientY, w: dockW(dock), h: FIT && dock === 'bottom' ? dockShown(dockCap) : dockH(), split: S.docks[dock].split != null ? S.docks[dock].split : 0.5, rect: dockRect(dock) };
      body.classList.add('shell-resizing');
    });
    h.addEventListener('pointermove', function (e) {
      if (!start || !h.hasPointerCapture(e.pointerId)) return;
      var rp = remPx();
      if (kind === 'size') {
        if (dock === 'bottom') S.docks.bottom.h = round(clamp(start.h - (e.clientY - start.y) / rp, MIN_H, main.clientHeight / rp - 8));
        else S.docks[dock].w = round(clamp(start.w + (dock === 'left' ? 1 : -1) * (e.clientX - start.x) / rp, MIN_W, MAX_W));
      } else {
        var r = start.rect;
        var f = dock === 'bottom' ? (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
        S.docks[dock].split = clamp(f, 0.15, 0.85);
      }
      layout();
    });
    function end(e) {
      if (!h.hasPointerCapture(e.pointerId)) return;
      h.releasePointerCapture(e.pointerId);
      start = null;
      body.classList.remove('shell-resizing');
      save();
    }
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
    h.addEventListener('dblclick', function () {
      if (kind === 'size') { delete S.docks[dock].w; delete S.docks[dock].h; } else delete S.docks[dock].split;
      layout(); save();
    });
    h.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 2 : 0.5, d = 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') d = -1;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') d = 1;
      else if (e.key === 'Home') { e.preventDefault(); e.stopPropagation(); h.dispatchEvent(new MouseEvent('dblclick')); return; }
      else return;
      e.preventDefault();
      e.stopPropagation();   // the apps pan the drawing with arrow keys
      if (kind === 'size') {
        if (dock === 'bottom') S.docks.bottom.h = round(clamp((FIT ? dockShown(dockCap) : dockH()) - d * step, MIN_H, 60));
        else S.docks[dock].w = round(clamp(dockW(dock) + (dock === 'left' ? d : -d) * step, MIN_W, MAX_W));
      } else {
        var cur = S.docks[dock].split != null ? S.docks[dock].split : 0.5;
        S.docks[dock].split = clamp(cur + d * 0.05, 0.15, 0.85);
      }
      layout(); save();
      h.focus();
    });
    return h;
  }
  function dockRect(d) {
    var list = inDock(d);
    if (!list.length) return null;
    var r = null;
    list.forEach(function (p) {
      var b = p.el.getBoundingClientRect();
      r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    });
    r.width = r.right - r.left;
    r.height = r.bottom - r.top;
    return r;
  }
  var handleSet = {};
  function handle(kind, dock) {
    var k = kind + ':' + dock;
    if (!handleSet[k]) { handleSet[k] = makeHandle(kind, dock); handles.push(handleSet[k]); }
    return handleSet[k];
  }
  function placeHandles() {
    var mr = main.getBoundingClientRect();
    var used = {};
    if (managed) DOCKS.forEach(function (d) {
      var list = inDock(d);
      if (!list.length) return;
      var r = dockRect(d);
      var h = handle('size', d);
      used['size:' + d] = 1;
      if (d === 'bottom') {
        h.style.left = (r.left - mr.left) + 'px'; h.style.top = (r.top - mr.top) + 'px';
        h.style.width = r.width + 'px'; h.style.height = '';
        h.setAttribute('aria-valuenow', String(FIT ? dockShown(dockCap) : dockH()));
      } else {
        h.style.left = ((d === 'left' ? r.right : r.left) - mr.left) + 'px'; h.style.top = (r.top - mr.top) + 'px';
        h.style.height = r.height + 'px'; h.style.width = '';
        h.setAttribute('aria-valuenow', String(dockW(d)));
      }
      if (list.length > 1) {
        var s = handle('stack', d);
        used['stack:' + d] = 1;
        var b0 = list[0].el.getBoundingClientRect();
        if (d === 'bottom') {
          s.style.left = (b0.right - mr.left) + 'px'; s.style.top = (r.top - mr.top) + 'px';
          s.style.height = r.height + 'px'; s.style.width = '';
        } else {
          s.style.left = (r.left - mr.left) + 'px'; s.style.top = (b0.bottom - mr.top) + 'px';
          s.style.width = r.width + 'px'; s.style.height = '';
        }
      }
    });
    Object.keys(handleSet).forEach(function (k) { handleSet[k].hidden = !used[k]; });
  }

  /* ---------------- Grips and menus ---------------- */
  function grip(p) {
    var d = p.el.ownerDocument;
    var g = d.createElement('div');
    g.className = 'shell-grip';
    g.setAttribute('data-shell-grip', p.id);
    var hd = d.createElement('span');
    hd.className = 'shell-grip-handle';
    hd.title = CAN_MOVE ? T('shell.panels.grip.title') : '';
    hd.innerHTML = '<i class="bi bi-grip-vertical" aria-hidden="true"></i>';
    var nm = d.createElement('span');
    nm.className = 'shell-grip-name';
    nm.textContent = p.name;
    hd.appendChild(nm);
    var mb = d.createElement('button');
    mb.type = 'button';
    mb.className = 'shell-grip-menu';
    mb.setAttribute('aria-haspopup', 'menu');
    mb.setAttribute('aria-expanded', 'false');
    mb.setAttribute('aria-label', T('shell.panels.menu.aria', { panel: p.name }));
    mb.title = T('shell.panels.menu.title');
    mb.innerHTML = '<i class="bi bi-three-dots" aria-hidden="true"></i>';
    g.append(hd, mb);
    mb.addEventListener('click', function (e) { e.stopPropagation(); openMenu(p, mb); });
    // Our own keys: some apps take Enter/Space on the document (CadCraft's command line) before a button acts.
    mb.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); openMenu(p, mb); }
    });
    if (CAN_MOVE) hd.addEventListener('pointerdown', function (e) { startDrag(p, e); });
    hd.addEventListener('dblclick', function () {
      if (CAN_MOVE && p.el.ownerDocument === document) moveTo(p, S.p[p.id].dock === 'float' ? (S.p[p.id].prev && S.p[p.id].prev !== 'float' ? S.p[p.id].prev : p.id) : 'float');
    });
    return g;
  }
  function ensureGrip(p) {
    if (!p.grip) p.grip = grip(p);
    if (p.el.firstElementChild !== p.grip) p.el.insertBefore(p.grip, p.el.firstChild);
  }

  var menu = null;
  function closeMenu(focusBack) {
    if (!menu) return;
    var m = menu;
    menu = null;
    m.btn.setAttribute('aria-expanded', 'false');
    m.el.remove();
    m.doc.removeEventListener('pointerdown', m.away, true);
    if (focusBack) m.btn.focus();
  }
  function menuItems(p) {
    var st = S.p[p.id], out = [];
    var here = p.el.ownerDocument === document;
    if (CAN_MOVE || !here) {
      [['left', T('shell.panels.dock.left'), 'bi-layout-sidebar'], ['right', T('shell.panels.dock.right'), 'bi-layout-sidebar-reverse'], ['bottom', T('shell.panels.dock.bottom'), 'bi-layout-split']].forEach(function (x) {
        if (!CAN_MOVE && x[0] !== p.id) return;
        if (here && st.dock === x[0]) return;
        out.push({ label: x[1], icon: x[2], run: function () { moveTo(p, x[0]); } });
      });
      if (CAN_MOVE && (st.dock !== 'float' || !here)) out.push({ label: T('shell.panels.float'), icon: 'bi-window-stack', run: function () { moveTo(p, 'float'); } });
    }
    if (CAN_WIN) {
      var mine = here ? 0 : st.win;
      var open = openWins().filter(function (n) { return n !== mine; });
      open.forEach(function (n) {
        out.push({ label: openWins().length === 1 ? T('shell.panels.to_window') : T('shell.panels.to_window_n', { n: n }), icon: 'bi-box-arrow-up-right', run: function () { toWindow([p], false, n); } });
      });
      if (openWins().length < MAX_WINS && (here || inWin(mine).length > 1)) out.push({ label: T('shell.panels.to_new_window'), icon: 'bi-window-plus', run: function () { toWindow([p], false, 'new'); } });
      if (here && panels.length > 1) out.push({ label: T('shell.panels.all_to_window'), icon: 'bi-window-split', run: function () { toWindow(panels, false, 'new'); } });
      if (here && HAS_WM && window.screen && screen.isExtended) out.push({ label: T('shell.panels.other_screen'), icon: 'bi-display', run: function () { toWindow(panels, true); } });
    }
    if (!here) out.push({ label: T('shell.panels.all_back'), icon: 'bi-box-arrow-in-down-left', run: function () { closeWindow(st.win); } });
    if (here && CAN_MOVE && st.dock !== p.id) out.push({ label: T('shell.panels.put_back'), icon: 'bi-arrow-counterclockwise', run: function () { moveTo(p, p.id); } });
    return out;
  }
  function openMenu(p, btn) {
    var again = menu && menu.btn === btn;
    closeMenu(false);
    if (again) return;
    var d = btn.ownerDocument;
    var ul = d.createElement('ul');
    ul.className = 'shell-panel-menu';
    ul.setAttribute('role', 'menu');
    ul.setAttribute('aria-label', T('shell.panels.menu.aria', { panel: p.name }));
    menuItems(p).forEach(function (it) {
      var li = d.createElement('li');
      li.setAttribute('role', 'none');
      var b = d.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      b.tabIndex = -1;
      b.innerHTML = '<i class="bi ' + it.icon + '" aria-hidden="true"></i>';
      b.appendChild(d.createTextNode(' ' + it.label));
      b.addEventListener('click', function (e) { e.stopPropagation(); closeMenu(false); it.run(); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    d.body.appendChild(ul);
    var r = btn.getBoundingClientRect(), vw = d.defaultView.innerWidth, vh = d.defaultView.innerHeight;
    var mr = ul.getBoundingClientRect();
    ul.style.left = clamp(r.right - mr.width, 4, vw - mr.width - 4) + 'px';
    ul.style.top = (r.bottom + mr.height + 4 > vh ? Math.max(4, r.top - mr.height - 2) : r.bottom + 2) + 'px';
    var items = [].slice.call(ul.querySelectorAll('[role="menuitem"]'));
    ul.addEventListener('keydown', function (e) {
      var i = items.indexOf(d.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus(); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeMenu(true); }
      e.stopPropagation();
    });
    ul.addEventListener('keyup', function (e) { e.stopPropagation(); });
    var away = function (e) { if (!ul.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closeMenu(false); };
    d.addEventListener('pointerdown', away, true);
    menu = { el: ul, btn: btn, doc: d, away: away };
    btn.setAttribute('aria-expanded', 'true');
    if (items[0]) items[0].focus();
  }

  /* ---------------- Moving ---------------- */
  var orderSeq = Date.now();
  function moveTo(p, dock, at) {
    var st = S.p[p.id];
    if (p.el.ownerDocument !== document) {
      st.dock = dock;
      if (dock === 'float' && at) st.float = at;
      st.order = ++orderSeq;
      var from = st.win;
      delete st.win;
      bringBack(p);
      if (!inWin(from).length) closeWindow(from, true);
      layout(); save();
      announce(T('shell.panels.moved', { panel: p.name, where: where(dock) }));
      return;
    }
    if (st.dock !== dock && st.dock !== 'window') st.prev = st.dock;
    st.dock = dock;
    delete st.win;
    st.order = ++orderSeq;
    if (dock === 'float' && at) st.float = at;
    layout();
    save();
    announce(T('shell.panels.moved', { panel: p.name, where: where(dock) }));
  }
  function where(d) {
    return ['left', 'right', 'bottom', 'float', 'window'].indexOf(d) !== -1 ? T('shell.panels.where.' + d) : d;
  }
  var live = document.createElement('p');
  live.className = 'visually-hidden';
  live.setAttribute('role', 'status');
  body.appendChild(live);
  function announce(t) { live.textContent = t; }

  /* Dragging by the grip: drop zones on <main>'s left, right and bottom; anywhere else floats it. */
  var drag = null, zones = null;
  function buildZones() {
    zones = document.createElement('div');
    zones.className = 'shell-drop';
    zones.setAttribute('aria-hidden', 'true');
    ['left', 'right', 'bottom'].forEach(function (d) {
      var z = document.createElement('div');
      z.className = 'shell-drop-zone';
      z.setAttribute('data-zone', d);
      z.textContent = T('shell.panels.dock.' + d);
      zones.appendChild(z);
    });
    main.appendChild(zones);
  }
  function zoneAt(x, y) {
    if (!zones) return null;
    var hit = null;
    [].forEach.call(zones.children, function (z) {
      var r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hit = z.getAttribute('data-zone');
    });
    return hit;
  }
  /* Across windows (1.6): the pointer stays captured while it leaves the window, so its screen position says where it was
   * let go — over the main window (dock by zone, else float there), over another panels window (move there), or nowhere
   * (stay). Each window's client area on screen comes from the last real pointer event seen in it (screenX − clientX),
   * else from its outer/inner sizes. */
  function origin(w) {
    if (w.__ccOrigin) return w.__ccOrigin;
    var bx = Math.max(0, (w.outerWidth - w.innerWidth) / 2);
    return { x: w.screenX + bx, y: w.screenY + Math.max(0, w.outerHeight - w.innerHeight - bx) };
  }
  function screenRect(w) {
    try { var o = origin(w); return { x: o.x, y: o.y, w: w.innerWidth, h: w.innerHeight }; } catch (e) { return null; }
  }
  function inRect(r, sx, sy) { return !!r && sx >= r.x && sx < r.x + r.w && sy >= r.y && sy < r.y + r.h; }
  function trackOrigin(w) {
    w.document.addEventListener('pointermove', function (e) { if (e.isTrusted) w.__ccOrigin = { x: e.screenX - e.clientX, y: e.screenY - e.clientY }; }, { capture: true, passive: true });
  }
  trackOrigin(window);
  /** Where a screen point lands: {kind: 'self'} (the window the drag started in), {kind: 'win', n}, {kind: 'main', x, y}
   *  (client coords in the main window), or {kind: 'none'}. */
  function targetAt(sx, sy, fromWin) {
    // Panels windows are pop-ups, usually on top of the main window: from the main window they are checked first; from a
    // panels window its own area wins, then the other panels windows, then the main window.
    var own = fromWin ? winOf(fromWin) : null;
    if (own && inRect(screenRect(own), sx, sy)) return { kind: 'self' };
    var ns = openWins();
    for (var k = 0; k < ns.length; k++) if (ns[k] !== fromWin && inRect(screenRect(winOf(ns[k])), sx, sy)) return { kind: 'win', n: ns[k] };
    var mr = screenRect(window);
    if (inRect(mr, sx, sy)) return fromWin ? { kind: 'main', x: sx - mr.x, y: sy - mr.y } : { kind: 'self' };
    return { kind: fromWin ? 'none' : 'self' };   // from the main window, outside every window: as before (float / dock)
  }
  function markWin(n) {
    openWins().forEach(function (m) { var w = winOf(m); if (w) w.document.body.classList.toggle('shell-pw-drop', m === n); });
  }
  function startDrag(p, e) {
    var here = p.el.ownerDocument === document;
    if (e.button !== 0 || (here && narrow)) return;
    if (!here && !CAN_MOVE && openWins().length < 2) return;
    var hd = e.currentTarget;
    e.preventDefault();
    try { hd.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer */ }
    var r = p.el.getBoundingClientRect();
    drag = { p: p, hd: hd, here: here, from: here ? 0 : S.p[p.id].win, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height, moved: false, zone: null, ghost: null, target: { kind: 'self' } };
    hd.addEventListener('pointermove', onDragMove);
    hd.addEventListener('pointerup', onDragEnd);
    hd.addEventListener('pointercancel', onDragEnd);
  }
  function showZones(on) {
    if (on && !zones) buildZones();
    if (!zones) return;
    zones.hidden = !on;
    body.classList.toggle('shell-panel-dragging', on);
    if (!on) [].forEach.call(zones.children, function (el) { el.classList.remove('is-hot'); });
  }
  function hot(z) {
    if (!zones) return;
    [].forEach.call(zones.children, function (el) { el.classList.toggle('is-hot', el.getAttribute('data-zone') === z); });
  }
  function onDragMove(e) {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) < 5) return;
      drag.moved = true;
      drag.hd.ownerDocument.body.classList.add('shell-panel-dragging');
      if (drag.here) {
        showZones(CAN_MOVE);
        if (S.p[drag.p.id].dock !== 'float') {
          drag.ghost = document.createElement('div');
          drag.ghost.className = 'shell-drag-ghost';
          drag.ghost.style.width = Math.min(drag.w, 20 * remPx()) + 'px';
          drag.ghost.style.height = (FIT ? Math.min(drag.h, floatDefault(main.clientWidth / remPx(), band(), drag.p).h * remPx()) : Math.min(drag.h, main.clientHeight * 0.7)) + 'px';
          drag.ghost.textContent = drag.p.name;
          main.appendChild(drag.ghost);
          drag.dx = Math.min(drag.dx, parseFloat(drag.ghost.style.width) - 8);
        }
      }
    }
    var t = CAN_WIN ? targetAt(e.screenX, e.screenY, drag.from) : { kind: 'self' };
    drag.target = t;
    markWin(t.kind === 'win' ? t.n : 0);
    if (drag.here) {
      if (!CAN_MOVE) return;
      var mr = main.getBoundingClientRect();
      var x = e.clientX - mr.left - drag.dx, y = e.clientY - mr.top - drag.dy;
      if (drag.ghost) { drag.ghost.style.left = x + 'px'; drag.ghost.style.top = y + 'px'; drag.ghost.hidden = t.kind === 'win'; }
      else if (t.kind !== 'win') { var rp = remPx(); adopt(drag.p); S.p[drag.p.id].float.x = x / rp; S.p[drag.p.id].float.y = y / rp; placeFloat(drag.p, true); }
      var z = t.kind === 'win' ? null : zoneAt(e.clientX, e.clientY);
      if (z !== drag.zone) { drag.zone = z; hot(z); }
    } else {
      // From a panels window: the main window shows its drop zones while the pointer is over it.
      var over = t.kind === 'main' && CAN_MOVE;
      showZones(over);
      var z2 = over ? zoneAt(t.x, t.y) : null;
      if (z2 !== drag.zone) { drag.zone = z2; hot(z2); }
    }
  }
  function onDragEnd(e) {
    if (!drag) return;
    var d = drag;
    drag = null;
    d.hd.removeEventListener('pointermove', onDragMove);
    d.hd.removeEventListener('pointerup', onDragEnd);
    d.hd.removeEventListener('pointercancel', onDragEnd);
    try { if (d.hd.hasPointerCapture(e.pointerId)) d.hd.releasePointerCapture(e.pointerId); } catch (err) {}
    d.hd.ownerDocument.body.classList.remove('shell-panel-dragging');
    showZones(false);
    markWin(0);
    if (!d.moved || e.type === 'pointercancel') { if (d.ghost) d.ghost.remove(); return; }
    var t = d.target || { kind: 'self' };
    if (t.kind === 'win') { if (d.ghost) d.ghost.remove(); toWindow([d.p], false, t.n); return; }
    if (!d.here) {
      if (t.kind === 'main' && CAN_MOVE) {
        if (d.zone) { moveTo(d.p, d.zone); return; }
        var rp0 = remPx(), mr0 = main.getBoundingClientRect();
        moveTo(d.p, 'float', { x: (t.x - mr0.left) / rp0 - 1, y: (t.y - mr0.top) / rp0 - 0.6, w: Math.min(20, d.w / rp0), h: Math.min(28, d.h / rp0) });
      }
      return;   // let go in its own window or off every window: it stays
    }
    var rp = remPx(), mr = main.getBoundingClientRect();
    if (d.zone) {
      if (d.ghost) d.ghost.remove();
      moveTo(d.p, d.zone);
      return;
    }
    if (d.ghost) {
      var g = d.ghost.getBoundingClientRect();
      d.ghost.remove();
      moveTo(d.p, 'float', { x: (g.left - mr.left) / rp, y: (g.top - mr.top) / rp, w: g.width / rp, h: g.height / rp });
    } else {
      placeFloat(d.p, true);
      save();
    }
  }
  // A floating panel's size (CSS resize: both at its corner) is remembered.
  if (window.ResizeObserver) {
    var fro = new ResizeObserver(function () {
      var changed = false;
      panels.forEach(function (p) {
        var st = S.p[p.id];
        if (st.dock !== 'float' || !st.float || p.el.ownerDocument !== document || !p.el.classList.contains('shell-float')) return;
        var rp = remPx(), w = p.el.offsetWidth / rp, h = p.el.offsetHeight / rp;
        if (FIT) {   // a CSS corner resize: compared with what shows, not with the remembered place
          var sh = p.shown || st.float;
          if (Math.abs(w - sh.w) > 0.05 || Math.abs(h - sh.h) > 0.05) { st.float = { x: sh.x, y: sh.y, w: w, h: h }; sh.w = w; sh.h = h; changed = true; }
          return;
        }
        if (Math.abs(w - st.float.w) > 0.05 || Math.abs(h - st.float.h) > 0.05) { st.float.w = w; st.float.h = h; changed = true; }
      });
      if (changed) { clearTimeout(fro.t); fro.t = setTimeout(save, 200); }
    });
    panels.forEach(function (p) { fro.observe(p.el); });
  }

  /* ---------------- The panels windows (several since 1.6: numbered 1, 2, …) ---------------- */
  var W = {};   // n → {w, main, poll, mos}
  function winOf(n) { var x = W[n]; return x && x.w && !x.w.closed ? x.w : null; }
  function openWins() { return Object.keys(W).map(Number).filter(function (n) { return !!winOf(n); }).sort(function (a, b) { return a - b; }); }
  function win() { var ns = openWins(); return ns.length ? winOf(ns[0]) : null; }   // the first (0.3 callers, tests)
  function inWin(n) { return panels.filter(function (p) { return S.p[p.id].dock === 'window' && S.p[p.id].win === n; }); }
  function nextNum() { for (var n = 1; n <= MAX_WINS; n++) if (!winOf(n)) return n; return 0; }
  function place(n) { return S.wins[n] || (S.wins[n] = {}); }
  function features(n) {
    var q = place(n);
    var w = q.w || Math.round(Math.min(screen.availWidth * 0.3, 34 * remPx())) || 480;
    var h = q.h || Math.round((screen.availHeight || 800) * 0.8);
    var f = 'popup=yes,width=' + w + ',height=' + h;
    if (q.x != null && q.y != null && q.x !== 0) f += ',left=' + q.x + ',top=' + q.y;
    else if (n > 1) f += ',left=' + ((screen.availLeft || 0) + 40 * (n - 1)) + ',top=' + ((screen.availTop || 0) + 40 * (n - 1));
    return f;
  }
  function winTitle(n) { return n > 1 ? T('shell.panels.window.title_n', { app: APP_NAME, n: n }) : T('shell.panels.window.title', { app: APP_NAME }); }
  /** Move `list` into panels window n (an open one), 'new' (a new one), or by default the first open window else a new
   *  one. Opening needs a click (pop-up rules). Windows left empty close. */
  function toWindow(list, otherScreen, n) {
    if (!CAN_WIN) return;
    if (n === undefined) n = openWins()[0] || 'new';
    var w = n === 'new' ? null : winOf(n);
    if (!w) {
      if (n === 'new' || !n) n = nextNum();
      if (!n) { say(T('shell.panels.max_windows', { n: MAX_WINS })); return false; }
      w = window.open('', 'cc-panels-' + SLUG + (n > 1 ? '-' + n : ''), features(n));
      if (!w) {
        say(T('shell.panels.blocked'));
        announce(T('shell.panels.blocked.short'));
        return false;
      }
      try { setupWindow(w, n); } catch (err) { try { w.close(); } catch (e2) {} delete W[n]; say(T('shell.panels.cannot_open')); return false; }
    }
    var froms = {};
    list.forEach(function (p) {
      var st = S.p[p.id];
      if (p.el.ownerDocument === w.document) return;
      if (st.dock === 'window' && st.win) froms[st.win] = 1;
      if (st.dock !== 'window') st.prev = st.dock;
      st.dock = 'window';
      st.win = n;
      st.order = ++orderSeq;
      clearPanelInline(p);
      if (p.sizer) p.sizer.hidden = true;
      W[n].main.appendChild(w.document.adoptNode(p.el));
    });
    Object.keys(froms).map(Number).forEach(function (m) { if (m !== n && !inWin(m).length) closeWindow(m, true); });
    hideOffer();
    layout();
    save();
    if (otherScreen) placeOnOtherScreen(true, n);
    else rememberedScreen(n);
    try { w.focus(); } catch (e) {}
    announce(T('shell.panels.moved_window'));
    return true;
  }
  function clearPanelInline(p) {
    ['grid-area', 'align-self', 'justify-self', 'height', 'width', 'left', 'top', 'min-height'].forEach(function (k) { p.el.style.removeProperty(k); });
    p.el.classList.remove('shell-float', 'shell-docked');
    p.el.removeAttribute('data-shell-dock');
  }
  function setupWindow(w, n) {
    var d = w.document;
    // The initial about:blank document (same origin as this page); no document.write — stylesheets added
    // to a written document never load in Chromium.
    if (!d.head) d.documentElement.appendChild(d.createElement('head'));
    if (!d.body) d.documentElement.appendChild(d.createElement('body'));
    var vp = d.createElement('meta');
    vp.name = 'viewport';
    vp.content = 'width=device-width, initial-scale=1';
    d.head.appendChild(vp);
    d.title = winTitle(n);
    var de = d.documentElement;
    de.lang = root.lang || 'en';
    document.querySelectorAll('head link[rel~="stylesheet"][href], head style').forEach(function (node) {
      var c;
      if (node.tagName === 'LINK') { c = d.createElement('link'); c.rel = 'stylesheet'; c.href = node.href; }
      else { c = d.createElement('style'); c.textContent = node.textContent; }
      d.head.appendChild(c);
    });
    var icon = document.querySelector('link[rel~="icon"]');
    if (icon) { var ic = d.createElement('link'); ic.rel = 'icon'; ic.href = icon.href; d.head.appendChild(ic); }
    var b = d.body;
    b.className = 'app-shell shell-pw ' + [].filter.call(body.classList, function (c) { return /^layer-/.test(c); }).join(' ');
    b.setAttribute('data-pw', String(n));
    var bar = d.createElement('header');
    bar.className = 'shell-pw-bar';
    bar.innerHTML = '<p class="shell-pw-title"><i class="bi bi-window-split" aria-hidden="true"></i> </p>';
    bar.firstChild.appendChild(d.createTextNode(winTitle(n)));
    if (HAS_WM && w.screen && w.screen.isExtended) {   // a second screen is connected (no permission needed to know)
      var other = d.createElement('button');
      other.type = 'button';
      other.className = 'btn-line btn-sm-cc';
      other.setAttribute('data-pw-other', '');
      other.innerHTML = '<i class="bi bi-display" aria-hidden="true"></i> ';
      other.appendChild(d.createTextNode(T('shell.panels.window.other_screen')));
      other.addEventListener('click', function () { placeOnOtherScreen(true, n); });
      bar.appendChild(other);
    }
    var back = d.createElement('button');
    back.type = 'button';
    back.className = 'btn-plot btn-sm-cc';
    back.setAttribute('data-pw-back', '');
    back.innerHTML = '<i class="bi bi-box-arrow-in-down-left" aria-hidden="true"></i> ';
    back.appendChild(d.createTextNode(T('shell.panels.window.back')));
    back.addEventListener('click', function () { closeWindow(n); });
    bar.appendChild(back);
    var orphan = d.createElement('p');
    orphan.className = 'shell-pw-orphan';
    orphan.setAttribute('role', 'alert');
    orphan.textContent = T('shell.panels.window.orphan', { app: APP_NAME });
    var m = main.cloneNode(false);
    m.removeAttribute('id');
    m.removeAttribute('style');
    m.classList.add('shell-pw-main');
    m.classList.remove('shell-panels-managed', 'shell-panels-narrow');
    b.append(bar, orphan, m);
    // The pop-up notices a lost opener on its own (this script runs in the pop-up).
    var sc = d.createElement('script');
    sc.textContent = 'setInterval(function(){try{if(!window.opener||window.opener.closed||!window.opener.ccShellPanels)document.body.classList.add("shell-pw-lost");}catch(e){document.body.classList.add("shell-pw-lost");}},1000);';
    b.appendChild(sc);
    // Keys typed in a panels window that are not typing in a field go on to the main document.
    ['keydown', 'keyup'].forEach(function (t) {
      d.addEventListener(t, function (e) { forwardKey(e); });
    });
    trackOrigin(w);
    var rec = { w: w, main: m, poll: 0, mos: [] };
    W[n] = rec;
    syncTheme();
    syncZoom();
    w.addEventListener('pagehide', function () { if (W[n] === rec) onWindowGone(n); });
    w.addEventListener('resize', function () { rememberWindow(n); });
    rec.poll = setInterval(function () {
      if (W[n] !== rec) return clearInterval(rec.poll);
      if (w.closed) onWindowGone(n); else rememberWindow(n);
    }, 1000);
    if (!mosOn) {
      mosOn = [new MutationObserver(syncTheme), new MutationObserver(syncZoom), new MutationObserver(syncZoom)];
      mosOn[0].observe(root, { attributes: true, attributeFilter: ['data-space', 'class', 'style'] });   // + the interface size (0.6 DF.28)
      mosOn[1].observe(main, { attributes: true, attributeFilter: ['style'] });
      mosOn[2].observe(body, { attributes: true, attributeFilter: ['class'] });
    }
  }
  var mosOn = null;
  function stopObservers() { if (mosOn && !openWins().length) { mosOn.forEach(function (o) { o.disconnect(); }); mosOn = null; } }
  function syncTheme() {
    var sp = root.getAttribute('data-space');
    openWins().forEach(function (n) {
      var de = winOf(n).document.documentElement;
      if (sp) de.setAttribute('data-space', sp); else de.removeAttribute('data-space');
      // 0.6 DF.28: the interface size (app-settings.js: --shell-ui + html.shell-ui-sized) follows into the panels windows
      var ui = root.style.getPropertyValue('--shell-ui');
      if (ui) de.style.setProperty('--shell-ui', ui); else de.style.removeProperty('--shell-ui');
      de.classList.toggle('shell-ui-sized', root.classList.contains('shell-ui-sized'));
    });
  }
  function syncZoom() {
    var z = main.style.getPropertyValue('--shell-panel-zoom');
    openWins().forEach(function (n) {
      var m = W[n].main;
      if (z) m.style.setProperty('--shell-panel-zoom', z); else m.style.removeProperty('--shell-panel-zoom');
      winOf(n).document.body.classList.toggle('shell-zoomed', body.classList.contains('shell-zoomed'));
    });
  }
  var TYPING = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]):not([type="color"]), textarea, select, [contenteditable=""], [contenteditable="true"]';
  function forwardKey(e) {
    if (e.isComposing || e.key === 'Tab') return;
    var t = e.target;
    if (t && t.closest && (t.closest(TYPING) || t.closest('.shell-panel-menu'))) return;
    if (/^(Control|Shift|Alt|Meta|AltGraph|CapsLock)$/.test(e.key)) return;
    // Space and Enter on a focused button act on that button, as in any window.
    if ((e.key === ' ' || e.key === 'Enter') && t && t.closest && t.closest('button, a[href], summary, [role="button"], [role="menuitem"], [role="tab"]')) return;
    // To the main page's body: "nothing focused there", which is what the apps expect for their shortcuts
    // (a focused field in the main window would otherwise take the key as typing).
    var target = body;
    var ev = new KeyboardEvent(e.type, {
      key: e.key, code: e.code, location: e.location, repeat: e.repeat,
      ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
      bubbles: true, cancelable: true, composed: true
    });
    if (!target.dispatchEvent(ev)) e.preventDefault();
  }
  function rememberWindow(n) {
    var w = winOf(n);
    if (!w) return;
    try {
      var q = place(n), x = w.screenX, y = w.screenY, iw = w.innerWidth, ih = w.innerHeight;
      if (iw > 100 && ih > 100 && (x !== q.x || y !== q.y || iw !== q.w || ih !== q.h)) {
        q.x = x; q.y = y; q.w = iw; q.h = ih;
        clearTimeout(rememberWindow.t);
        rememberWindow.t = setTimeout(save, 300);
      }
    } catch (e) {}
  }
  function screenKey(s) { return (s.label || 'screen') + '@' + s.left + ',' + s.top + ',' + s.width + 'x' + s.height; }
  /** Window Management API: ask (only on this click) for the screens and put window n on another one. */
  function placeOnOtherScreen(ask, n) {
    n = n || openWins()[0];
    var w = winOf(n);
    if (!w || !HAS_WM) return;
    window.getScreenDetails().then(function (det) {
      var cur = det.currentScreen;
      var others = det.screens.filter(function (s) { return screenKey(s) !== screenKey(cur); });
      if (!others.length) { say(T('shell.panels.one_screen')); return; }
      var s = others[0], q = place(n);
      if (q.screen) others.forEach(function (o) { if (screenKey(o) === q.screen) s = o; });
      fit(w, s, q);
      q.screen = screenKey(s);
      save();
    }, function () {
      if (ask) say(T('shell.panels.no_permission'));
    });
  }
  function fit(w, s, q) {
    var ww = Math.min(q.w || Math.round(s.availWidth * 0.3), s.availWidth);
    var hh = Math.min(s.availHeight, q.h || s.availHeight);
    try { w.moveTo(s.availLeft, s.availTop); w.resizeTo(ww, hh); } catch (e) {}
  }
  /** Reopening: when permission was granted before, go back to the remembered screen without asking. */
  function rememberedScreen(n) {
    if (!HAS_WM || !place(n).screen || !navigator.permissions) return;
    navigator.permissions.query({ name: 'window-management' }).then(function (r) {
      if (r.state === 'granted') placeOnOtherScreen(false, n);
    }, function () {});
  }
  function bringBack(p) {
    if (p.el.ownerDocument === document) return;
    var a = document.adoptNode(p.el);
    // Back into <main> in the app's own order: before the first later sibling we know of.
    var anchor = null;
    var ids = panels.map(function (q) { return q.id; });
    for (var k = ids.indexOf(p.id) + 1; k < panels.length && !anchor; k++) {
      if (panels[k].el.ownerDocument === document && panels[k].el.parentNode === main) anchor = panels[k].el;
    }
    if (!anchor && p.id === 'left') {
      // the left panel goes before the stage, i.e. after the toolbar
      for (var c2 = 0; c2 < main.children.length; c2++) {
        var ch = main.children[c2];
        if (ch.tagName !== 'H1' && ch.getAttribute('role') !== 'toolbar') { anchor = ch; break; }
      }
    }
    if (!anchor) {
      // the right panel: after the stage (before the first thing that comes after the stage in the app)
      var last = null;
      [].forEach.call(main.children, function (ch) { if (/(^|\s)\S*-stage(\s|$)/.test(ch.className) || ch === centerEl) last = ch; });
      anchor = last ? last.nextSibling : null;
    }
    main.insertBefore(a, anchor);
    ensureGrip(p);
  }
  /** Window n closed (or reloaded, or put back): its panels come home to where they were before. */
  function onWindowGone(n) {
    var rec = W[n];
    if (!rec) return;
    delete W[n];
    clearInterval(rec.poll);
    closeMenu(false);
    panels.forEach(function (p) {
      var st = S.p[p.id];
      if ((st.dock === 'window' && st.win === n) || p.el.ownerDocument === rec.w.document) {
        st.dock = st.prev && st.prev !== 'window' ? st.prev : p.id;
        delete st.win;
        bringBack(p);
      }
    });
    stopObservers();
    layout();
    if (!unloading) save();
    announce(T('shell.panels.back_here'));
  }
  /** Close window n (all of them when n is not given); its panels come back. */
  function closeWindow(n, silent) {
    if (n === undefined || n === null) {
      var ns = openWins();
      if (!ns.length && !silent) panels.forEach(function (p) { if (S.p[p.id].dock === 'window') { S.p[p.id].dock = S.p[p.id].prev && S.p[p.id].prev !== 'window' ? S.p[p.id].prev : p.id; delete S.p[p.id].win; } });
      ns.forEach(function (m) { closeWindow(m, silent); });
      if (!ns.length && !silent) { layout(); save(); }
      return;
    }
    var w = winOf(n);
    if (w) { onWindowGone(n); try { w.close(); } catch (e) {} }
    else if (W[n]) onWindowGone(n);
  }
  // Closing or reloading the main window closes the panels windows; the layout remembers them.
  var unloading = false;
  window.addEventListener('pagehide', function () {
    var ns = openWins();
    if (!ns.length) return;
    unloading = true;
    save();   // panels still marked "window" (with their numbers): the next load offers to open them again
    ns.forEach(function (n) { var w = winOf(n); delete W[n]; try { w.close(); } catch (e) {} });
  });

  /* After a reload: a window can only be opened from a click, so offer it (one click per window). */
  var offer = null;
  function pendingWins() {
    var out = [];
    panels.forEach(function (p) { var st = S.p[p.id]; if (st.dock === 'window' && p.el.ownerDocument === document && out.indexOf(st.win || 1) === -1) out.push(st.win || 1); });
    return out.sort(function (a, b) { return a - b; });
  }
  function showOffer() {
    if (!CAN_WIN) return;
    if (!offer) {
      offer = document.createElement('div');
      offer.className = 'shell-pw-offer';
      offer.setAttribute('role', 'region');
      offer.setAttribute('aria-label', T('shell.panels.offer.aria'));
      offer.innerHTML = '<p><i class="bi bi-window-split" aria-hidden="true"></i> <span data-pw-offer-text></span></p>' +
        '<button type="button" class="btn-plot btn-sm-cc" data-pw-open></button>' +
        '<button type="button" class="btn-line btn-sm-cc" data-pw-keep></button>';
      offer.querySelector('[data-pw-keep]').textContent = T('shell.panels.offer.keep');
      offer.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var pend = pendingWins();
        if (b.hasAttribute('data-pw-open')) {
          // One window per click (pop-up rules); toWindow() marks them again. The others wait for the next click.
          var n = pend[0];
          if (n && toWindow(panels.filter(function (p) { return S.p[p.id].dock === 'window' && (S.p[p.id].win || 1) === n && p.el.ownerDocument === document; }), false, n) !== false) {
            if (pendingWins().length) showOffer(); else hideOffer();
          }
        } else {
          panels.forEach(function (p) { var st = S.p[p.id]; if (st.dock === 'window' && p.el.ownerDocument === document) { st.dock = st.prev && st.prev !== 'window' ? st.prev : p.id; delete st.win; } });
          hideOffer(); layout(); save();
        }
      });
      body.appendChild(offer);
    }
    var left = pendingWins().length;
    offer.querySelector('[data-pw-offer-text]').textContent = T('shell.panels.offer.text', { n: left });
    offer.querySelector('[data-pw-open]').textContent = T('shell.panels.offer.open', { n: left });
    offer.hidden = false;
  }
  function hideOffer() { if (offer) offer.hidden = true; }

  /* ---------------- Reset (Settings › General "Reset layout", and Settings' own Reset) ---------------- */
  function reset(persist) {
    closeWindow(null, true);
    S = freshState();
    panels.forEach(function (p) { bringBack(p); });
    hideOffer();
    layout();
    if (persist) save();
    announce(T('shell.panels.reset_done'));
  }
  dlg.addEventListener('cc-settings-reset', function () { reset(false); });
  var resetBtn = dlg.querySelector('[data-panels-reset]');
  if (resetBtn) resetBtn.addEventListener('click', function () { reset(true); });
  var winBtn = dlg.querySelector('[data-panels-window]');
  if (winBtn) {
    if (!CAN_WIN) winBtn.hidden = true;
    winBtn.addEventListener('click', function () { dlg.close(); toWindow(panels, false, 'new'); });
  }

  /* ---------------- Start ---------------- */
  body.classList.add('shell-panels');
  panels.forEach(function (p) {
    ensureGrip(p);
    // Some apps rebuild a panel's contents; keep the grip first.
    p.mo = new MutationObserver(function () { if (p.grip && p.el.firstElementChild !== p.grip) ensureGrip(p); });
    p.mo.observe(p.el, { childList: true });
  });
  layout();
  if (panels.some(function (p) { return S.p[p.id].dock === 'window'; })) {
    // The desktop app opens windows without a click (desktop.md W.4b): reopen each saved panel window straight away,
    // and offer the rest only if one can't open.
    var opened = !!window.cadcraftDesktop && CAN_WIN;
    if (opened) pendingWins().forEach(function (n) {
      if (!opened) return;
      opened = toWindow(panels.filter(function (p) { return S.p[p.id].dock === 'window' && (S.p[p.id].win || 1) === n && p.el.ownerDocument === document; }), false, n) !== false;
    });
    if (!opened || pendingWins().length) showOffer();
  }

  var raf = 0;
  function relayoutSoon() { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); }
  window.addEventListener('resize', relayoutSoon);
  window.addEventListener('load', relayoutSoon);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { requestAnimationFrame(FIT ? refit : placeHandles); });
    ro.observe(main);
    panels.forEach(function (p) { ro.observe(p.el); });
    // 0.5 VP.5: an app's own bars change height without <main> resizing (CadCraft's toolbar wraps or goes compact).
    if (FIT) [].forEach.call(main.children, function (ch) { if (ch.tagName !== 'ASIDE') ro.observe(ch); });
  }
  // Toolbars showing/hiding (screen modes) move the docks without resizing <main>.
  new MutationObserver(function () { requestAnimationFrame(FIT ? refit : placeHandles); }).observe(body, { attributes: true, attributeFilter: ['class'] });
  if (FIT) {   // app-phone.js switching the phone layout on or off
    var wasPhone = root.classList.contains('cc-phone');
    new MutationObserver(function () {
      var on = root.classList.contains('cc-phone');
      if (on !== wasPhone) { wasPhone = on; relayoutSoon(); }
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
  }
  /** 0.5 VP.5: after a size change, re-cap the bottom dock and put floating panels back inside the band. */
  var recaps = [], recapLater = 0;   // an app whose bars follow the drawing's height can't loop: 6 re-caps a second, then one later
  function refit() {
    if (managed && !drag) {
      if (bandRows && bandRows.dock >= 0 && dockCapNow() !== dockCap) {
        var now = Date.now();
        recaps = recaps.filter(function (t) { return now - t < 1000; });
        if (recaps.length < 6) { recaps.push(now); layout(); return; }
        clearTimeout(recapLater);
        recapLater = setTimeout(function () { requestAnimationFrame(refit); }, 1000);
      }
      panels.forEach(function (p) { if (eff(p) === 'float' && p.el.ownerDocument === document) placeFloat(p); });
    }
    placeHandles();
  }
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu) { e.preventDefault(); e.stopPropagation(); closeMenu(true); } }, true);

  window.ccShellPanels = {
    managed: function () { return managed; },
    state: function () {
      var o = JSON.parse(JSON.stringify(S));
      // 0.5 VP.5: a floating panel at its default place has no remembered place yet; report where it shows.
      if (FIT) panels.forEach(function (p) { var q = o.p[p.id]; if (q.dock === 'float' && !q.float && p.shown) q.float = { x: p.shown.x, y: p.shown.y, w: p.shown.w, h: p.shown.h }; });
      return o;
    },
    panels: function () { return panels.map(function (p) { return { id: p.id, name: p.name, dock: S.p[p.id].dock, win: S.p[p.id].win || null, inWindow: p.el.ownerDocument !== document }; }); },
    move: function (id, dock) { var p = byId(id); if (p) moveTo(p, dock); },
    openWindow: function (ids, n) { return toWindow(ids ? panels.filter(function (p) { return ids.indexOf(p.id) !== -1; }) : panels, false, n); },
    closeWindow: function (n) { closeWindow(n); },
    window: function (n) { return n ? winOf(n) : win(); },
    windows: function () { return openWins(); },
    screenRects: function () { var o = { main: screenRect(window) }; openWins().forEach(function (n) { o[n] = screenRect(winOf(n)); }); return o; },
    reset: function () { reset(true); },
    layout: relayoutSoon,
    offerShown: function () { return !!offer && !offer.hidden; }
  };
})();
