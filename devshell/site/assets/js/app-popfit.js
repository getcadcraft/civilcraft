// SPDX-License-Identifier: Apache-2.0
/**
 * app-popfit.js: a menu or pop-up panel never falls off an edge (owner 2026-11-20: "sweep all the menus/panels to make sure they don't fall off the edges
 * (left, right, top, bottom) - they should respond/calculate to the closeness of the viewport edge"; first report: Discord, unsaph3, CadCraft on Linux,
 * Layers > Tools ran off the panel's left edge).
 *
 * One rule for every app: when a pop-up opens, measure it against what can show it (the window, and every box above it that clips or scrolls) and
 *   - too wide or too tall for that room: narrow it / give it a scrolling height,
 *   - past the left or right edge: slide it back in,
 *   - past the bottom: open it above its button when there is more room there, else slide it up,
 * using only inline `translate`, `width`, `max-height` (never the app's own left/top), and only when something is actually out. What it set is taken
 * back before each new measure, so a menu that fits again returns to where its app put it.
 *
 * Found by itself: a <details> menu's list ('toggle', caught on the way down since it does not bubble), and any absolutely or fixed placed element that is
 * added, shown or opened and looks like a menu (role="menu" / "listbox" / "dialog", or a class named *menu*, *ctx*, *popover*, *flyout*, *popup*).
 * Anything else: window.ccPopFit(el, { anchor }) after showing it. An element with data-popfit="off" is left alone.
 */
(function () {
  'use strict';
  if (window.ccPopFit) return;
  var PAD = 4, GAP = 4;
  var mine = new WeakMap();   // element -> what we set on it
  var open = new Set();       // fitted elements, refitted on resize
  var NAME = /(^|[\s_-])(menu|ctx|popover|flyout|popup)([\s_-]|$)|menu-list|-menu\b/;

  function take(el) {
    var m = mine.get(el); if (!m) return;
    for (var k in m) el.style[k] = m[k];
    mine.delete(el);
  }
  function set(el, k, v) {
    var m = mine.get(el); if (!m) { m = {}; mine.set(el, m); }
    if (!(k in m)) m[k] = el.style[k];
    el.style[k] = v;
  }
  // the room an element may use: the window, cut by every ancestor that clips. A fixed element is cut by the window only; an absolute one by the boxes
  // from its containing block upward (a box between it and that block does not clip it).
  function room(el, cs) {
    var de = document.documentElement, b = { l: 0, t: 0, r: de.clientWidth, b: de.clientHeight };
    if (cs.position === 'fixed') return b;
    for (var p = el.offsetParent || el.parentElement; p && p !== de && p !== document.body; p = p.parentElement) {
      var s = getComputedStyle(p), x = s.overflowX !== 'visible', y = s.overflowY !== 'visible';
      if (x || y) {
        var r = p.getBoundingClientRect(), l = r.left + p.clientLeft, t = r.top + p.clientTop;
        if (x) { b.l = Math.max(b.l, l); b.r = Math.min(b.r, l + p.clientWidth); }
        if (y) { b.t = Math.max(b.t, t); b.b = Math.min(b.b, t + p.clientHeight); }
      }
      if (s.position === 'fixed') break;
    }
    return b;
  }
  function fit(el, opts) {
    if (!el || el.nodeType !== 1 || el.dataset.popfit === 'off') return;
    take(el);
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || (cs.position !== 'absolute' && cs.position !== 'fixed')) { open.delete(el); return; }
    var r = el.getBoundingClientRect(); if (!r.width || !r.height) { open.delete(el); return; }
    open.add(el);
    var b = room(el, cs), w = b.r - b.l - 2 * PAD, h = b.b - b.t - 2 * PAD; if (w <= 0 || h <= 0) return;
    if (r.width > w + .5) { set(el, 'boxSizing', 'border-box'); set(el, 'minWidth', '0'); set(el, 'maxWidth', 'none'); set(el, 'width', Math.floor(w) + 'px'); r = el.getBoundingClientRect(); }
    var dx = r.left < b.l + PAD ? b.l + PAD - r.left : r.right > b.r - PAD ? b.r - PAD - r.right : 0, dy = 0;
    if (r.top < b.t + PAD || r.bottom > b.b - PAD) {
      var a = opts && opts.anchor && opts.anchor.getBoundingClientRect ? opts.anchor.getBoundingClientRect() : null, cap = 0;
      if (a && a.height && r.top >= a.bottom - 1 && r.bottom > b.b - PAD) {
        // it hangs under its button and runs past the bottom: above the button when it fits there or there is more room there, else what fits below
        var below = b.b - PAD - r.top, above = a.top - GAP - (b.t + PAD);
        if (r.height <= above || above > below) { cap = Math.min(r.height, above); dy = a.top - GAP - cap - r.top; }
        else cap = below;
      } else if (r.height > h) { cap = h; dy = b.t + PAD - r.top; }
      else dy = r.top < b.t + PAD ? b.t + PAD - r.top : b.b - PAD - r.bottom;
      if (cap && cap < r.height - .5) {
        set(el, 'boxSizing', 'border-box'); set(el, 'maxHeight', Math.max(64, Math.floor(cap)) + 'px');
        if (cs.overflowY === 'visible') { set(el, 'overflowY', 'auto'); set(el, 'flexWrap', 'nowrap'); }
      }
    }
    if (dx || dy) {
      var t = cs.translate && cs.translate !== 'none' ? cs.translate.split(' ') : [];
      set(el, 'translate', (Math.round(dx) + (parseFloat(t[0]) || 0)) + 'px ' + (Math.round(dy) + (parseFloat(t[1]) || 0)) + 'px');
    }
  }
  window.ccPopFit = fit;
  window.ccPopFit.release = function (el) { take(el); open.delete(el); };
  if (window.ccPopFitOff) return;   // tests: measure the apps as they are without it

  // PERF.56 (0.11, perf-finish-11): the observer below sees every change in the document, so it only does the cheap name test (role, class) and
  // keeps the element; the style question (is it placed absolute / fixed?) and the anchor lookup wait for the frame, asked once per element there,
  // after the change is done. Asking getComputedStyle inside the callback forced a style pass per added menu item while the DOM was still changing
  // (52 ms in 8 s of CadCraft drafting with menus opening). fit() answers the same question again, so what gets fitted is unchanged.
  function namedLikeMenu(el) {
    if (el.nodeType !== 1 || (el.dataset && el.dataset.popfit === 'off')) return false;
    var role = el.getAttribute('role');
    return role === 'menu' || role === 'listbox' || role === 'dialog' || NAME.test(typeof el.className === 'string' ? el.className : '');
  }
  function looksLikeMenu(el) {
    if (!namedLikeMenu(el)) return false;
    var p = getComputedStyle(el).position; return p === 'absolute' || p === 'fixed';
  }
  var queued = new Map(), raf = 0;   // element -> anchor (undefined: look it up in the frame)
  function later(el, anchor) {
    if (!queued.has(el) || anchor !== undefined) queued.set(el, anchor);
    if (!raf) raf = requestAnimationFrame(function () {
      raf = 0; var q = Array.from(queued); queued.clear();
      q.forEach(function (x) { var el = x[0]; if (el.isConnected && looksLikeMenu(el)) fit(el, { anchor: x[1] === undefined ? anchorOf(el) : x[1] }); });
    });
  }
  function anchorOf(el) {
    var d = el.parentElement; if (d && d.tagName === 'DETAILS') return d.querySelector(':scope > summary');
    var id = el.id && document.querySelector('[aria-controls="' + CSS.escape(el.id) + '"]'); if (id) return id;
    var prev = el.previousElementSibling; return prev && prev.getAttribute('aria-haspopup') ? prev : null;
  }
  // a <details> menu: its placed children, hung from the summary
  document.addEventListener('toggle', function (e) {
    var d = e.target; if (!d || d.tagName !== 'DETAILS') return;
    var sum = d.querySelector(':scope > summary');
    for (var c = d.firstElementChild; c; c = c.nextElementSibling) {
      if (c === sum) continue;
      if (!d.open) { take(c); open.delete(c); continue; }
      var p = getComputedStyle(c).position; if (p === 'absolute' || p === 'fixed') fit(c, { anchor: sum });
    }
  }, true);
  // menus made or shown by script
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'attributes') { if (namedLikeMenu(m.target)) later(m.target); continue; }
      for (var j = 0; j < m.addedNodes.length; j++) { var n = m.addedNodes[j]; if (n.nodeType === 1 && namedLikeMenu(n)) later(n); }
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open', 'aria-hidden'] });
  var rz = 0;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(function () { Array.from(open).forEach(function (el) { if (el.isConnected) fit(el, { anchor: anchorOf(el) }); else open.delete(el); }); });
  });
})();
