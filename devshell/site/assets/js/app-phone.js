/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-phone.js — every app on a phone and a fold phone (docs/0.5-FINAL.md Track PH; owner, 2026-10-15: "we should be phone
 * layout aware — while not a primary device"). Classic deferred script, loaded by app-shell.inc after app-panels.js for
 * builds whose manifest has "phone" (every dev build; frozen releases have no flag, so they never load it and look as they
 * did). Every CSS rule it needs hangs off a class it adds (app-shell.css § "Phones and fold phones"), so nothing changes
 * until it decides the screen is a phone.
 *
 * Found by markup, like app-panels.js: `<main>`'s direct-child `<aside>` whose class ends -left / -right / -bottom (the
 * panels), its `section[class$="-stage"]` (the drawing), other direct-child `<section>`s (bottom panels such as quantities or
 * reports), `[role=toolbar]` (the toolbar) and `<footer>` (the status line). A manifest may add, as CSS selectors inside
 * `<main>`: "phone": {"stage", "toolbar", "options" (tool-option bars), "hint" (start / tool hints), "keep" (sections that stay
 * in the page), "sheets" (more elements that become sheets)}.
 *
 * Size classes from the width only (never the device model): compact < 600 px, medium 600–839, expanded ≥ 840
 * (`html[data-cc-size]`). The phone layout (`html.cc-phone`) applies up to 760 px wide (where the apps' own CSS used to stack
 * every panel into one long page) and on short sideways touch screens (≤ 520 px tall, ≤ 1000 px wide, pointer: coarse);
 * `html.cc-compact` adds the
 * phone-sized rules (small toolbar labels, sheets from the bottom when upright) for widths under 600 px and short sideways
 * screens. A fold phone's inner screen (medium) keeps tablet-like side sheets; at 840 px and more the app's own layout.
 *
 * On a phone: the drawing keeps the space under the app bar; panels are sheets opened from a bar at the bottom (from the
 * bottom when upright on a compact screen, from their own side otherwise), one at a time, put away by their Close, Esc or a
 * tap on the drawing; toolbars are one row that scrolls sideways with icons first; the toolbar can be hidden ("Tools") and put
 * at the top or the bottom (remembered per app, localStorage `cc-phone:<slug>`); tool-option bars are one line; hints are
 * one line that a tap opens; the view cube sits small in the drawing's lower corner; dialogs fit the screen; the page's
 * height follows the visible viewport (so a command line stays above the on-screen keyboard).
 *
 * Fold phones: everything is classes over the same DOM, so folding (outer ↔ inner screen) or turning only re-runs the
 * layout — the drawing, selection, open dialogs and unsaved work stay. Where the browser reports two viewport segments (a
 * hinge: `window.viewportSegments`), dialogs and the command line keep to one segment (`html.cc-fold-h` / `cc-fold-v`); the
 * drawing may span it.
 *
 * Tablets (one mechanism with the phone sheets; 0.5 final sweep): a host that knows it runs on a tablet — Studio's
 * window.js on Android / iPad — calls `ccShellPhone.tablet(true)`. From then on the width decides, never both at once:
 * under 600 px the phone layout above; held upright and narrower than 1000 px, the tablet sheets (`html.cc-sheets`): the
 * side panels float (ccShellPanels, app-panels.js) and slide in from their edge from a button each in the app bar
 * (`.app-bar-sheet`), a tap on the drawing or Esc puts them away; turned sideways, the panels it floated dock back home.
 *
 * Pen and touch (0.6 DC.102, session studio-extra_PART_2; dev builds and releases from 0.6 only: the Settings dialog carries
 * data-shell-ui). What every app gets from the shell, on the drawing (the stage) only — the app's own handling is unchanged:
 * - A pen is noticed the first time one is used (`html.cc-pen`, remembered for the device). From then on, **palm
 *   rejection**: a touch that lands while the pen is down, within 0.6 s of it (lifting, or hovering above the screen), or
 *   with a palm-sized contact (over 40 px) never reaches the app.
 * - **Fingers with a pen** (`fingers`): "draw" (as before) or "view": one finger on the drawing does nothing; when a second
 *   finger lands the first is handed to the app after all (a pointerdown at where it is now), so the app's own two-finger
 *   pan and zoom work.
 * - **Taps**: two fingers tapped together = Undo, three = Redo (the app's own commands, window.ccInput.run).
 * - **The pen's side (barrel) button and eraser end**: "app" (what the app does: a right click; ModelCraft's eraser) or Undo
 *   / Redo.
 * - `window.ccShellPen` → { seen(), down(), state() (pressure, tiltX, tiltY, twist, hover of the last pen event), prefs(),
 *   set(key, value) } for apps that want pressure or hover. Settings › General › Pen and touch (shown with a touch screen or
 *   once a pen was seen); the choices are the device's, for every app (localStorage `cc-pen`).
 *
 *   window.ccShellPhone → { on(), size(), compact(), open(id), close(), sheets(), tools(show?), toolbarAt('top'|'bottom'),
 *                           layout(), segments(rects|null) (tests: pretend a hinge), tablet(on?) (the host: a tablet),
 *                           tabletSheets() (true while the tablet sheets are on) }
 */
(function () {
  'use strict';
  var root = document.documentElement, body = document.body;
  if (!body || !body.classList.contains('app-shell') || window.ccShellPhone) return;
  var main = document.querySelector('body.app-shell > main');
  if (!main) return;

  var cfg = {};
  try { cfg = JSON.parse((document.getElementById('cc-phone') || {}).textContent || '{}') || {}; } catch (e) { cfg = {}; }
  var slug = String(cfg.app || (location.pathname.split('/')[2] || 'app'));
  var opt = cfg.phone && typeof cfg.phone === 'object' ? cfg.phone : {};

  function T(k, v) { return window.ccShellT ? window.ccShellT(k, v) : k; }   // shell.phone.* in assets/lang/shell

  // ---- remembered per app: the toolbar shown or hidden, at the top or the bottom ----
  var KEY = 'cc-phone:' + slug;
  var prefs = { tb: 'open', at: 'top' };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || '{}'); if (saved.tb === 'closed') prefs.tb = 'closed'; if (saved.at === 'bottom') prefs.at = 'bottom'; } catch (e) { /* defaults */ }
  function savePrefs() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* private mode: this visit only */ } }

  // ---- the screen ----
  function coarse() { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } }   // i18n-ignore (CSS)
  function sizeOf(w) { return w < 600 ? 'compact' : w < 840 ? 'medium' : 'expanded'; }
  var tabletHost = false;   // ccShellPhone.tablet(true): the host knows this is a tablet (Studio on Android / iPad)
  function decide() {
    // the layout viewport (what media queries see), not innerWidth: a page that zooms out on a phone would read wide
    var de = document.documentElement, w = de.clientWidth || window.innerWidth, h = de.clientHeight || window.innerHeight;
    // a short sideways screen is a phone only with a touch screen as its main pointer: a laptop window at 150 % (911 × 512)
    // keeps its desktop layout
    var short = h <= 520 && w <= 1000 && coarse();
    // on a tablet the width decides between the two kinds of sheets: phone under 600 px, the tablet sheets otherwise
    var on = tabletHost ? w < 600 || short : w <= 760 || short;
    return { w: w, h: h, size: sizeOf(w), on: on, compact: w < 600 || short, land: w > h, tablet: tabletHost && !on && h > w && w < 1000 };
  }

  var state = decide();
  var bar = null, btnTools = null, btnPos = null;
  var sheetBtns = new Map();     // sheet element → its bar button
  var openSheet = null;

  function q(sel) { if (!sel) return []; try { return Array.prototype.slice.call(main.querySelectorAll(sel)); } catch (e) { return []; } }
  function sideOf(el) {
    var c = el.classList;
    for (var i = 0; i < c.length; i++) { var m = /-(left|right|bottom)$/.exec(c[i]); if (m) return m[1]; }
    return null;
  }
  function nameOf(el, side) {
    var n = el.getAttribute('aria-label') || '';
    if (!n) { var h = el.querySelector('h2, h3, [class$="-title"]'); n = h ? (h.textContent || '').trim() : ''; }
    if (!n || n.length > 28) n = T(side === 'left' ? 'shell.phone.left' : side === 'right' ? 'shell.phone.right' : 'shell.phone.bottom');
    return n.replace(/\s+/g, ' ');
  }
  function iconOf(side) { return side === 'left' ? 'bi-layout-sidebar' : side === 'right' ? 'bi-layout-sidebar-reverse' : 'bi-window-dock'; }
  function idOf(el, side) {
    if (side !== 'bottom') return side;
    var c = el.className && String(el.className).split(/\s+/)[0] || 'bottom';
    return c.replace(/^[a-z]+-/, '') || 'bottom';
  }

  /** Which of <main>'s children is what. */
  function classify() {
    var kids = Array.prototype.slice.call(main.children);
    var stage = q(opt.stage)[0] || kids.filter(function (k) { return k.tagName === 'SECTION' && /-stage$/.test(String(k.className).split(/\s+/)[0] || ''); })[0]
      || kids.filter(function (k) { return k.tagName === 'SECTION' && /(^|\s)[a-z]+-stage(\s|$)/.test(k.className); })[0] || null;
    var keep = q(opt.keep);
    var sheets = [];
    kids.forEach(function (k) {
      if (k === stage || k === bar || keep.indexOf(k) >= 0) return;
      if (k.tagName === 'ASIDE' && sideOf(k)) sheets.push({ el: k, side: sideOf(k) });
      else if (k.tagName === 'SECTION' && k.getAttribute('data-phone') !== 'keep') sheets.push({ el: k, side: 'bottom' });
    });
    q(opt.sheets).forEach(function (k) { if (!sheets.some(function (s) { return s.el === k; })) sheets.push({ el: k, side: sideOf(k) || 'bottom' }); });
    var tbs = kids.filter(function (k) { return k !== bar && k.getAttribute('role') === 'toolbar'; }).concat(q(opt.toolbar));
    var status = kids.filter(function (k) { return k.tagName === 'FOOTER'; });
    var whole = kids.filter(function (k) {
      return k !== stage && k !== bar && tbs.indexOf(k) < 0 && status.indexOf(k) < 0 && !sheets.some(function (s) { return s.el === k; })
        && !/^(DIALOG|TEMPLATE|SCRIPT|H1|ASIDE)$/.test(k.tagName) && !k.classList.contains('shell-split') && !k.classList.contains('shell-dock-split')
        && !!k.querySelector('input, textarea');
    });
    return { stage: stage, sheets: sheets, tbs: tbs, status: status, whole: whole };
  }

  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    return e;
  }
  function iconLabel(btn, icon, text) {
    btn.textContent = '';
    var i = el('i', 'bi ' + icon, { 'aria-hidden': 'true' });
    var s = el('span', 'shell-phone-btn-label');
    s.textContent = text;
    btn.append(i, s);
  }

  function ensureBar(parts) {
    if (!bar) {
      bar = el('div', 'shell-phone-bar', { role: 'toolbar', 'aria-label': T('shell.phone.bar'), 'data-phone-bar': '' });
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        if (b === btnTools) { tools(prefs.tb !== 'open'); return; }
        if (b === btnPos) { toolbarAt(prefs.at === 'top' ? 'bottom' : 'top'); return; }
        sheetBtns.forEach(function (btn, sheet) { if (btn === b) toggle(sheet); });
      });
    }
    if (bar.parentNode !== main) main.append(bar);
    // the toolbar's two buttons (only when the app has a toolbar)
    var hasTb = parts.tbs.length > 0;
    if (hasTb && !btnTools) {
      btnTools = el('button', 'shell-phone-btn', { type: 'button', 'data-phone-tools': '' });
      btnPos = el('button', 'shell-phone-btn shell-phone-btn-pos', { type: 'button', 'data-phone-tbpos': '' });
      bar.prepend(btnTools, btnPos);
    }
    if (btnTools) { btnTools.hidden = !hasTb; btnPos.hidden = !hasTb; }
    paintToolButtons();
    // one button per sheet, in the app's order
    var seen = new Set();
    parts.sheets.forEach(function (s) {
      seen.add(s.el);
      var b = sheetBtns.get(s.el);
      if (!b) {
        b = el('button', 'shell-phone-btn', { type: 'button', 'aria-pressed': 'false', 'aria-expanded': 'false', 'data-phone-sheet': idOf(s.el, s.side) });
        iconLabel(b, iconOf(s.side), nameOf(s.el, s.side));
        b.title = nameOf(s.el, s.side);
        sheetBtns.set(s.el, b);
      }
      bar.append(b);
      b.classList.toggle('is-side-panel', s.side !== 'bottom');
    });
    sheetBtns.forEach(function (b, sheet) { if (!seen.has(sheet)) { b.remove(); sheetBtns.delete(sheet); } });
  }

  function paintToolButtons() {
    if (!btnTools) return;
    var open = prefs.tb === 'open';
    iconLabel(btnTools, open ? 'bi-chevron-bar-up' : 'bi-tools', T('shell.phone.tools'));
    btnTools.setAttribute('aria-pressed', open ? 'true' : 'false');
    btnTools.title = T(open ? 'shell.phone.tools.hide' : 'shell.phone.tools.show');
    btnTools.setAttribute('aria-label', btnTools.title);
    iconLabel(btnPos, prefs.at === 'top' ? 'bi-arrow-down-square' : 'bi-arrow-up-square', T('shell.phone.tb.move'));
    btnPos.title = T(prefs.at === 'top' ? 'shell.phone.tb.bottom' : 'shell.phone.tb.top');
    btnPos.setAttribute('aria-label', btnPos.title);
    btnPos.disabled = !open;
  }

  function ensureClose(sheet, side) {
    var c = sheet.querySelector(':scope > [data-phone-close]');
    if (c) return;
    var name = nameOf(sheet, side);
    c = el('button', 'shell-sheet-close', { type: 'button', 'data-phone-close': '', 'aria-label': T('shell.phone.close', { panel: name }), title: T('shell.phone.close', { panel: name }) });
    var s = el('span');
    s.textContent = name;
    c.append(s, el('i', 'bi bi-x-lg', { 'aria-hidden': 'true' }));
    c.addEventListener('click', function () { var b = sheetBtns.get(sheet); close(); if (b) b.focus(); });
    sheet.prepend(c);
  }

  // ---- sheets ----
  function close() {
    if (openSheet) openSheet.classList.remove('shell-sheet-open');
    openSheet = null;
    sheetBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-expanded', 'false'); });
  }
  function open(sheet) {
    close();
    if (!sheet) return;
    sheet.classList.add('shell-sheet-open');
    openSheet = sheet;
    var b = sheetBtns.get(sheet);
    if (b) { b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-expanded', 'true'); }
  }
  function toggle(sheet) { if (openSheet === sheet) close(); else open(sheet); }

  // ---- the toolbar ----
  function tools(show) {
    prefs.tb = show === undefined ? (prefs.tb === 'open' ? 'closed' : 'open') : (show ? 'open' : 'closed');
    savePrefs();
    root.classList.toggle('cc-tb-closed', prefs.tb === 'closed');
    paintToolButtons();
    nudge();
    return prefs.tb === 'open';
  }
  function toolbarAt(where) {
    prefs.at = where === 'bottom' ? 'bottom' : 'top';
    savePrefs();
    root.classList.toggle('cc-tb-bottom', prefs.at === 'bottom');
    paintToolButtons();
    nudge();
    return prefs.at;
  }
  // apps redraw through their ResizeObservers; a resize event helps the ones that listen to the window
  function nudge() { requestAnimationFrame(function () { try { window.dispatchEvent(new Event('resize')); } catch (e) { /* old browsers */ } }); }

  // A toolbar's own menus (details) would be clipped by the sideways scroll: on a phone or touch tablet they open as a fixed pop-over.
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d || d.tagName !== 'DETAILS' || !d.closest('.shell-phone-tb, .shell-touch-tb')) return;
    var menu = d.querySelector(':scope > :not(summary)');
    if (!menu) return;
    if (!d.open || !(root.classList.contains('cc-phone') || root.classList.contains('cc-touch'))) { menu.classList.remove('shell-phone-pop'); menu.style.removeProperty('--pop-x'); menu.style.removeProperty('--pop-y'); return; }
    var s = d.querySelector(':scope > summary').getBoundingClientRect();
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    menu.classList.add('shell-phone-pop');
    var mw = Math.min(menu.offsetWidth || 240, vw - 8);
    menu.style.setProperty('--pop-x', Math.max(4, Math.min(s.left, vw - mw - 4)) + 'px');
    if (s.top > vh / 2) { menu.style.setProperty('--pop-y', 'auto'); menu.style.setProperty('--pop-b', (vh - s.top + 4) + 'px'); }
    else { menu.style.setProperty('--pop-y', (s.bottom + 4) + 'px'); menu.style.setProperty('--pop-b', 'auto'); }
  }, true);

  // A hint is one line; a tap opens the whole of it (and closes it again).
  main.addEventListener('click', function (e) {
    var h = e.target.closest && e.target.closest('.shell-phone-hint');
    if (!h || !root.classList.contains('cc-compact') || e.target.closest('a, button, input, select, textarea, kbd')) return;
    h.classList.toggle('is-expanded');
  });

  // A tap on the drawing (not on a sheet, the bar or a dialog) puts the open sheet away; so does Esc.
  main.addEventListener('pointerdown', function (e) {
    if (!openSheet || !root.classList.contains('cc-phone')) return;
    if (e.target.closest('.shell-sheet, [data-phone-bar], dialog, .shell-phone-pop')) return;
    close();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openSheet) close(); });

  // ---- the hinge ----
  var fakeSegs = null;
  function segments() {
    var segs = fakeSegs || window.viewportSegments || null;
    root.classList.remove('cc-fold-h', 'cc-fold-v');
    if (!segs || segs.length !== 2) { root.style.removeProperty('--cc-seg-x'); return null; }
    var a = segs[0], b = segs[1];
    var side = Math.abs(a.x - b.x) > Math.abs(a.y - b.y);   // side by side = a vertical hinge
    // dialogs and the command line go to the larger segment (the second when they are the same)
    var s = (a.width * a.height > b.width * b.height) ? a : b;
    root.classList.add(side ? 'cc-fold-h' : 'cc-fold-v');
    root.style.setProperty('--cc-seg-x', s.x + 'px');
    root.style.setProperty('--cc-seg-y', s.y + 'px');
    root.style.setProperty('--cc-seg-w', s.width + 'px');
    root.style.setProperty('--cc-seg-h', s.height + 'px');
    root.style.setProperty('--cc-seg-r', Math.max(0, window.innerWidth - s.x - s.width) + 'px');
    root.style.setProperty('--cc-seg-b', Math.max(0, window.innerHeight - s.y - s.height) + 'px');
    return s;
  }

  // ---- tablets: the side panels as sheets from their edge, a button each in the app bar (html.cc-sheets) ----
  var floated = new Set();       // panels these sheets floated (only those go back home)
  var tabBtns = new Map();       // aside → its app-bar button
  var tabOpen = null;
  function tabAsides() { return Array.prototype.slice.call(main.children).filter(function (k) { var s = k.tagName === 'ASIDE' && sideOf(k); return s === 'left' || s === 'right'; }); }
  function tabClose() {
    if (tabOpen) tabOpen.classList.remove('cc-open');
    tabOpen = null;
    tabBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
  }
  function tabToggle(a) {
    var was = tabOpen === a;
    tabClose();
    if (was || !a) return;
    a.classList.add('cc-open');
    tabOpen = a;
    var b = tabBtns.get(a);
    if (b) b.setAttribute('aria-pressed', 'true');
  }
  function tabletSheets(on) {
    var api = window.ccShellPanels;
    var can = !!(api && typeof api.panels === 'function');
    on = on && can;
    if (can) {
      api.panels().forEach(function (p) {
        if (on && !p.inWindow && p.dock !== 'float') { floated.add(p.id); api.move(p.id, 'float'); }
        if (!on && floated.has(p.id) && p.dock === 'float') { floated.delete(p.id); api.move(p.id, p.id); }
      });
    }
    var had = root.classList.contains('cc-sheets');
    root.classList.toggle('cc-sheets', on);
    if (!on) tabClose();
    if (!on && !had) return;
    var appBar = document.querySelector('.app-bar');
    tabAsides().forEach(function (a) {
      var side = sideOf(a);
      a.classList.toggle('cc-sheet', on);
      a.classList.toggle('cc-left', on && side === 'left');
      a.classList.toggle('cc-right', on && side === 'right');
      var b = tabBtns.get(a);
      if (!b && on && appBar) {
        var name = nameOf(a, side);
        b = el('button', 'app-bar-btn app-bar-sheet', { type: 'button', 'aria-pressed': 'false', 'aria-label': name, title: name, 'data-tablet-sheet': side });
        b.append(el('i', 'bi ' + iconOf(side), { 'aria-hidden': 'true' }));
        b.addEventListener('click', function () { tabToggle(a); });
        var before = appBar.querySelector('[data-studio-hub], .app-bar-help, [data-help-open]');
        if (before) before.parentNode.insertBefore(b, before); else appBar.append(b);
        tabBtns.set(a, b);
      }
      if (b) b.hidden = !on;
    });
    if (on) {
      var r = main.getBoundingClientRect();
      root.style.setProperty('--cc-sheet-top', Math.max(0, r.top) + 'px');
      root.style.setProperty('--cc-sheet-bottom', Math.max(0, window.innerHeight - r.bottom) + 'px');
    }
  }
  // a tap on the drawing (outside a tablet sheet) or Esc puts the tablet sheet away
  main.addEventListener('pointerdown', function (e) {
    if (tabOpen && root.classList.contains('cc-sheets') && !e.target.closest('aside.cc-sheet, dialog')) tabClose();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tabOpen) tabClose(); });

  // ---- the visible height (the on-screen keyboard) ----
  function viewport() {
    var vv = window.visualViewport;
    if (!root.classList.contains('cc-phone') || !vv) { root.style.removeProperty('--cc-vvh'); root.classList.remove('cc-kbd'); return; }
    root.style.setProperty('--cc-vvh', Math.round(vv.height) + 'px');
    var typing = document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    root.classList.toggle('cc-kbd', !!typing && vv.height < window.innerHeight - 120);
  }

  // ---- the layout pass ----
  var marked = [];
  function mark(e, cls) { if (!e.classList.contains(cls)) { e.classList.add(cls); marked.push([e, cls]); } }
  function unmarkAll() { marked.forEach(function (m) { m[0].classList.remove(m[1]); }); marked = []; }

  function layout() {
    state = decide();
    root.setAttribute('data-cc-size', state.size);
    var was = root.classList.contains('cc-phone');
    root.classList.toggle('cc-phone', state.on);
    root.classList.toggle('cc-compact', state.on && state.compact);
    root.classList.toggle('cc-land', state.on && state.land);
    root.classList.toggle('cc-tb-closed', state.on && prefs.tb === 'closed');
    root.classList.toggle('cc-tb-bottom', state.on && prefs.at === 'bottom');
    var folded = !!segments();
    tabletSheets(!!state.tablet);   // never with the phone layout: decide() makes them exclusive
    // an app bar too full for its window (tablets turned sideways) takes the narrow "More" layout instead of pushing its last
    // buttons off the edge; measured with the class off, so it comes back as soon as the bar fits
    var appBar = document.querySelector('.app-bar');
    if (appBar) {
      root.classList.remove('cc-bar-narrow');
      if (!state.on && appBar.scrollWidth > appBar.clientWidth + 1) root.classList.add('cc-bar-narrow');
    }
    // a touch tablet keeps its own layout, but its toolbars are one row that scrolls sideways (Warren, 2026-10-15: on an 11.5"
    // tablet ModelCraft's wrapped to three lines, nearly half the screen; the button styles could not win the space back)
    var touchTb = !state.on && coarse();
    root.classList.toggle('cc-touch', touchTb);
    if (!state.on) {
      if (was) { close(); unmarkAll(); }
      var nonPhone = touchTb || folded ? classify() : null;
      // top toolbars only: floating ones (over a drawing) keep wrapping inside their box
      if (touchTb) nonPhone.tbs.forEach(function (t) { if (t.parentNode === main) mark(t, 'shell-touch-tb'); });
      if (folded) nonPhone.whole.forEach(function (w) { mark(w, 'shell-phone-whole'); });
      viewport();
      return;
    }
    var parts = classify();
    if (parts.stage) mark(parts.stage, 'shell-phone-stage');
    parts.tbs.forEach(function (t) {
      mark(t, 'shell-phone-tb');
      if (t.parentNode !== main) mark(t, 'shell-phone-tb-over');
    });
    parts.status.forEach(function (s) { mark(s, 'shell-phone-status'); });
    parts.whole.forEach(function (w) { mark(w, 'shell-phone-whole'); });
    parts.sheets.forEach(function (s) {
      mark(s.el, 'shell-sheet');
      s.el.setAttribute('data-sheet-side', s.side);
      ensureClose(s.el, s.side);
    });
    q(opt.options).forEach(function (o) { mark(o, 'shell-phone-opts'); });
    q(opt.hint).forEach(function (h) { mark(h, 'shell-phone-hint'); if (!h.title) h.title = T('shell.phone.hint.more'); });
    ensureBar(parts);
    if (openSheet && parts.sheets.every(function (s) { return s.el !== openSheet; })) close();
    viewport();
  }

  // Apps rebuild parts of the page (hints, option bars, panels' contents): mark again, at most once a frame.
  var pending = false;
  function later() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; if (root.classList.contains('cc-phone') || window.viewportSegments) layout(); }); }
  var mo = new MutationObserver(function (list) {
    if (!root.classList.contains('cc-phone')) return;
    for (var i = 0; i < list.length; i++) { if (list[i].type === 'childList') { later(); return; } }
  });
  mo.observe(main, { childList: true, subtree: true });

  window.addEventListener('resize', function () { requestAnimationFrame(layout); });
  window.addEventListener('orientationchange', function () { requestAnimationFrame(layout); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', viewport);
  document.addEventListener('focusin', viewport);
  document.addEventListener('focusout', function () { setTimeout(viewport, 50); });
  layout();
  if (document.readyState !== 'complete') window.addEventListener('load', layout, { once: true });

  // ---- Pen and touch (0.6 DC.102; see the header) ----
  if (document.querySelector('[data-app-settings][data-shell-ui]')) penAndTouch();
  function penAndTouch() {
    var PKEY = 'cc-pen';
    var P = { palm: true, fingers: 'draw', taps: true, side: 'app', eraser: 'app', seen: false };
    var CHOICES = { fingers: ['draw', 'view'], side: ['app', 'undo', 'redo'], eraser: ['app', 'undo', 'redo'] };
    try {
      var v = JSON.parse(localStorage.getItem(PKEY) || '{}') || {};
      ['palm', 'taps', 'seen'].forEach(function (k) { if (typeof v[k] === 'boolean') P[k] = v[k]; });
      Object.keys(CHOICES).forEach(function (k) { if (CHOICES[k].indexOf(v[k]) >= 0) P[k] = v[k]; });
    } catch (e) { /* defaults */ }
    function savePen() { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) { /* private mode: this visit only */ } }
    var PALM_MS = 600, PALM_PX = 40, TAP_MS = 400, TAP_LAND_MS = 200, TAP_MOVE = 12;
    var penDown = false, penAt = -1e9, last = { pressure: 0, tiltX: 0, tiltY: 0, twist: 0, hover: false };
    var dropped = new Set(), penOwn = new Set(), held = new Map(), passed = new Set();
    var tap = null, eatMenuAt = -1e9, replaying = false;
    var now = function () { return performance.now(); };
    var stageOf = function () { return classify().stage; };
    function inStage(t) { var st = stageOf(); return !!(st && t && t.nodeType === 1 && st.contains(t)); }
    function swallow(e) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }
    function seen() {
      root.classList.add('cc-pen');
      if (!P.seen) { P.seen = true; savePen(); }
      syncSet();
    }
    if (P.seen) root.classList.add('cc-pen');
    function act(what) {
      var id = what === 'undo' ? 'edit.undo' : what === 'redo' ? 'edit.redo' : null;
      if (!id) return;
      if (window.ccInput && typeof window.ccInput.run === 'function') {
        Promise.resolve(window.ccInput.run(id)).then(function (ok) { if (ok && window.ccShellScreen && ccShellScreen.say) ccShellScreen.say(T(what === 'undo' ? 'shell.pen.did.undo' : 'shell.pen.did.redo')); });
      }
    }
    function record(e) {
      penAt = now();
      last = { pressure: e.pressure || 0, tiltX: e.tiltX || 0, tiltY: e.tiltY || 0, twist: e.twist || 0, hover: e.buttons === 0 };
    }
    function palmSized(e) { return (e.width || 0) > PALM_PX || (e.height || 0) > PALM_PX; }
    function replay(h) {
      var o = h.ev;
      var init = { bubbles: true, cancelable: true, composed: true, pointerId: o.pointerId, pointerType: 'touch', isPrimary: o.isPrimary,
        clientX: o.clientX, clientY: o.clientY, screenX: o.screenX, screenY: o.screenY, button: 0, buttons: 1, width: o.width, height: o.height,
        pressure: o.pressure || 0.5 };
      replaying = true;
      try { (h.target.isConnected ? h.target : stageOf() || main).dispatchEvent(new PointerEvent('pointerdown', init)); } finally { replaying = false; }
    }
    // taps: two or three fingers landing together and lifting soon, without moving
    function tapDown(e) {
      var t = now();
      if (!tap) tap = { ids: new Map(), max: 0, t0: t, moved: false, late: false, active: 0 };
      else if (t - tap.t0 > TAP_LAND_MS) tap.late = true;
      tap.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
      tap.active++;
      if (tap.active > tap.max) tap.max = tap.active;
    }
    function tapMove(e) {
      var d = tap && tap.ids.get(e.pointerId);
      if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP_MOVE) tap.moved = true;
    }
    function tapUp(e) {
      if (!tap || !tap.ids.has(e.pointerId)) return;
      tap.active--;
      if (tap.active > 0) return;
      var t = tap;
      tap = null;
      if (P.taps && !t.moved && !t.late && now() - t.t0 < TAP_MS && (t.max === 2 || t.max === 3)) act(t.max === 2 ? 'undo' : 'redo');
    }

    window.addEventListener('pointerdown', function (e) {
      if (replaying) return;
      if (e.pointerType === 'pen') {
        seen(); record(e); penDown = true;
        if (!inStage(e.target)) return;
        var eraser = e.button === 5 || (e.buttons & 32) !== 0, barrel = e.button === 2;
        var what = eraser ? P.eraser : barrel ? P.side : 'app';
        if (what !== 'app') { swallow(e); penOwn.add(e.pointerId); if (barrel) eatMenuAt = now(); act(what); }
        return;
      }
      if (e.pointerType !== 'touch' || !inStage(e.target)) return;
      if (P.seen && P.palm && (penDown || now() - penAt < PALM_MS || palmSized(e))) { dropped.add(e.pointerId); swallow(e); return; }
      tapDown(e);
      if (P.seen && P.fingers === 'view') {
        if (!held.size && !passed.size) { held.set(e.pointerId, { target: e.target, ev: e }); swallow(e); return; }
        held.forEach(function (h, id) { replay(h); passed.add(id); });
        held.clear();
        passed.add(e.pointerId);
      }
    }, true);
    window.addEventListener('pointermove', function (e) {
      if (replaying) return;
      if (e.pointerType === 'pen') { record(e); if (penOwn.has(e.pointerId)) swallow(e); return; }
      if (e.pointerType !== 'touch') return;
      if (dropped.has(e.pointerId)) { swallow(e); return; }
      tapMove(e);
      var h = held.get(e.pointerId);
      if (h) { h.ev = e; swallow(e); }
    }, true);
    function ended(e) {
      if (replaying) return;
      if (e.pointerType === 'pen') {
        record(e); penDown = false;
        if (penOwn.delete(e.pointerId)) swallow(e);
        return;
      }
      if (e.pointerType !== 'touch') return;
      if (dropped.delete(e.pointerId)) { swallow(e); return; }
      tapUp(e);
      if (held.delete(e.pointerId)) { swallow(e); return; }   // one finger alone, with "only move the view": nothing happened
      passed.delete(e.pointerId);
    }
    window.addEventListener('pointerup', ended, true);
    window.addEventListener('pointercancel', ended, true);
    // the side button's own right click, after the shell took the press
    window.addEventListener('contextmenu', function (e) { if (now() - eatMenuAt < 800) { eatMenuAt = -1e9; swallow(e); } }, true);
    // a pen hovering out of range: the palm window starts from then
    window.addEventListener('pointerleave', function (e) { if (e.pointerType === 'pen') penAt = now(); }, true);

    // Settings › General › Pen and touch (app-settings.inc prints it on 0.6 builds; hidden without a touch screen or a pen)
    var set = document.querySelector('[data-app-settings] [data-pen-set]');
    function anyCoarse() { try { return matchMedia('(any-pointer: coarse)').matches; } catch (e) { return false; } }   // i18n-ignore (CSS)
    function syncSet() {
      if (!set) return;
      set.hidden = !(anyCoarse() || P.seen);
      set.querySelectorAll('input, select').forEach(function (f) {
        var k = f.getAttribute('data-pen');
        if (!k) return;
        if (f.type === 'checkbox') f.checked = !!P[k];
        else if (f.type === 'radio') f.checked = f.value === P[k];
        else f.value = P[k];
      });
    }
    function setPref(k, val) {
      if (k === 'palm' || k === 'taps') P[k] = !!val;
      else if (CHOICES[k] && CHOICES[k].indexOf(val) >= 0) P[k] = val;
      else return false;
      savePen(); syncSet();
      return true;
    }
    if (set) {
      set.addEventListener('change', function (e) {
        var f = e.target, k = f.getAttribute && f.getAttribute('data-pen');
        if (k) setPref(k, f.type === 'checkbox' ? f.checked : f.value);
      });
      var dlg = set.closest('dialog');
      if (dlg) new MutationObserver(function () { if (dlg.open) syncSet(); }).observe(dlg, { attributes: true, attributeFilter: ['open'] });
      syncSet();
    }
    Object.defineProperty(window, 'ccShellPen', {
      value: {
        seen: function () { return P.seen; },
        down: function () { return penDown; },
        state: function () { return Object.assign({ at: penAt }, last); },
        prefs: function () { return Object.assign({}, P); },
        set: setPref,
        forget: function () { P.seen = false; root.classList.remove('cc-pen'); savePen(); syncSet(); },   // tests, and "no pen here any more"
      },
    });
  }

  Object.defineProperty(window, 'ccShellPhone', {
    value: {
      on: function () { return state.on; },
      size: function () { return state.size; },
      compact: function () { return state.on && state.compact; },
      open: function (id) { var hit = null; sheetBtns.forEach(function (b, s) { if (b.getAttribute('data-phone-sheet') === id) hit = s; }); open(hit); return !!hit; },
      close: close,
      sheets: function () { var out = []; sheetBtns.forEach(function (b, s) { out.push({ id: b.getAttribute('data-phone-sheet'), name: b.title, open: s === openSheet }); }); return out; },
      tools: tools,
      toolbarAt: toolbarAt,
      prefs: function () { return { tb: prefs.tb, at: prefs.at }; },
      layout: layout,
      segments: function (rects) { fakeSegs = rects && rects.length === 2 ? rects : null; layout(); return segments(); },
      tablet: function (on) { if (on !== undefined) { tabletHost = !!on; layout(); } return tabletHost; },
      tabletSheets: function () { return root.classList.contains('cc-sheets'); },
    },
  });
})();
