/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words of its own: it only moves an element's own title text into a Bootstrap tooltip. */
/**
 * app-tooltips.js — every tooltip is a Bootstrap tooltip (owner rule 2026-11-09: no browser-native title bubbles). One delegated initialiser,
 * Bootstrap 5.3 from /assets/js/bootstrap/current (loaded by app-shell.inc, never a CDN).
 *
 * How: nothing is wired per button. On the first pointer-over or keyboard focus of an element that has a title="…", this takes the text out of
 * `title` (so the browser never shows its own bubble), keeps it in data-bs-title, makes the element a Bootstrap tooltip (trigger "manual", driven here)
 * and shows it. So a button an app draws later, or whose title it rewrites (b.title = …), is covered with no code of its own.
 *   - icon-only buttons / links keep an accessible name: when an element has no text of its own and no aria-label, aria-label = the title;
 *   - shown after a short delay on hover, at once on KEYBOARD focus (:focus-visible), never on touch;
 *   - hidden on leave, blur, click / pointer-down, Escape, scroll of the page and when the element goes away (no tooltip left stuck after a click);
 *   - removed elements are disposed (a sweep after DOM changes); a tooltip inside an open <dialog> is placed in that dialog (the top layer);
 *   - text comes from, in order: data-ws-reason (why a tool is unavailable), title, data-bs-title on an old data-bs-toggle="tooltip" element;
 *   - skipped: form fields (title is their validation hint), SVG, and anything with data-native-title (an explicit opt-out).
 * THE ONLY tooltip engine (0.9.1, owner 2026-11-09): nothing else may build a bootstrap.Tooltip, draw a CSS ::after bubble or keep its own
 * tooltip <div>. Code that needs a tip it computes (cut-off text, "Copied") calls window.ccTooltips.showText(el, text).
 * window.ccTooltips = { count(), tipOf(el), hide(), showText(el, text, delay), attach(win), provide(fn), hover(view, fn), rollover() }.
 * 0.10 BK.33 (session bk-r3-shell-10), still the one engine and still Bootstrap tooltips:
 *   - TWO STAGES for a control that runs a command. provide(fn) registers fn(el) → null | { name, keys: ['W'], typed: 'WALL', desc }
 *     (app-input-ui.js answers from the command registry: nothing is written per button). Stage 1, almost at once: the name, its
 *     shortcut and the typed word. Stage 2, a moment later while the pointer stays: the one-line description under it. A control
 *     that is off keeps its own text (the reason). The element's own title stays its accessible text.
 *   - ROLLOVER on things in a drawing. hover(view, fn) → stop(): fn(pointerEvent) → null | { key, title, lines: ['Level: Level 1', …] }
 *     is asked when the pointer rests on `view` (a canvas) with no button down; the answer shows as a tooltip beside the pointer
 *     (anchored to a 1 px marker this engine moves), and goes when the pointer leaves that thing, on a press, a wheel turn, a key
 *     or when the view is left. The app's adapter only does the hit test and the words. rollover() → what is showing (tests).
 * Popped-out windows: attach(win) loads Bootstrap + this file into them (each window has its own engine, so its own Bootstrap).
 */
(function () {
  'use strict';
  if (window.ccTooltips) return;
  var SKIP = 'input, textarea, select, option, iframe, html, body, svg, [data-native-title], [data-bs-toggle="dropdown"]';
  var STAGE1 = 120, STAGE2 = 900, DWELL = 400;   // ms: a command's name and shortcut · its description · the pointer resting on a thing in a drawing
  var providers = [], timer2 = 0, roll = null;
  var tips = new Map(), adhoc = new WeakSet(), timer = 0, lastHide = 0, current = null, quietUntil = 0;   // quietUntil: focus handed back by a closing dialog / palette (after Esc, Enter, a click) does not pop a tip
  var st = document.createElement('style');
  st.textContent = '.tooltip.cc-tip { z-index: 100100; pointer-events: none; --bs-tooltip-bg: var(--ink, #212529); --bs-tooltip-color: var(--sheet, #fff); --bs-tooltip-opacity: 1;' +
    ' --bs-tooltip-font-size: var(--fs-sm, .875rem); --bs-tooltip-border-radius: var(--radius, .375rem); } .tooltip.cc-tip .tooltip-inner { max-width: 22rem; text-align: left; overflow-wrap: anywhere; }' +
    ' .cc-tip .cc-tip-name { font-weight: 600; } .cc-tip kbd, .cc-tip .cc-tip-typed { display: inline-block; margin-left: .5rem; padding: 0 .3125rem; border: 1px solid currentColor; border-radius: .1875rem; background: transparent; color: inherit; font: inherit; font-size: .8125em; opacity: .85; }' +
    ' .cc-tip .cc-tip-typed { border-style: dashed; font-family: var(--font-mono, ui-monospace, monospace); } .cc-tip .cc-tip-desc, .cc-tip .cc-tip-line { display: block; margin-top: .125rem; opacity: .9; }' +
    ' .cc-tip-anchor { position: fixed; width: 1px; height: 1px; pointer-events: none; opacity: 0; }';
  (document.head || document.documentElement).appendChild(st);

  function ok() { return !!(window.bootstrap && window.bootstrap.Tooltip); }
  /* Owner 2026-11-22: the cursor's arrow hangs down and right from where it points, so a tip just below a small control sat under it.
     Below stays the default; when the pointer is in the lower part of the control (or the control is short) and there is room above,
     the tip goes on top. Keyboard focus (no recent pointer over it) keeps below. Popper still flips at the window edges. */
  var ptr = null;
  document.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') ptr = { x: e.clientX, y: e.clientY, t: Date.now() }; }, { capture: true, passive: true });
  var CURSOR_H = 24, ROOM = 44;
  /* In a ribbon or tool row the tip sits under the whole bar (owner 2026-11-22): it never covers the tools beside the one you point at. */
  var BAR = '.ws-ribbon, .tr-rows, .tr-row';
  function bar(el) { return el && el.closest ? el.closest(BAR) : null; }
  function overPtr(el) { if (!ptr || Date.now() - ptr.t > 4000) return null; var r = el.getBoundingClientRect(); return ptr.x >= r.left - 2 && ptr.x <= r.right + 2 && ptr.y >= r.top - 2 && ptr.y <= r.bottom + 2 ? ptr : null; }
  /** Popper's distance: past the bar's edge for a bar control, and always past the cursor's arrow when it points at the control. */
  function gap(o, el) {
    var r = el.getBoundingClientRect(), b = bar(el), p = overPtr(el), d = 6, below = String(o.placement).indexOf('bottom') === 0, above = String(o.placement).indexOf('top') === 0;
    if (below) { if (b) d = Math.max(d, b.getBoundingClientRect().bottom - r.bottom + 6); if (p) d = Math.max(d, p.y + CURSOR_H - r.bottom); }
    else if (above && b) d = Math.max(d, r.top - b.getBoundingClientRect().top + 6);
    return [0, Math.round(d)];
  }
  function side(_inst, _tip, el) {
    if (bar(el)) return 'bottom';   // under the bar; Popper flips it above the bar when the window has no room below
    if (!ptr || Date.now() - ptr.t > 4000 || !el || !el.getBoundingClientRect) return 'bottom';
    var r = el.getBoundingClientRect();
    if (ptr.x < r.left - 2 || ptr.x > r.right + 2 || ptr.y < r.top - 2 || ptr.y > r.bottom + 2) return 'bottom';   // not over it: focus or a programmatic show
    var underCursor = r.bottom - ptr.y < CURSOR_H;   // a tip below would start inside the cursor's arrow
    if (underCursor && r.top > ROOM) return 'top';
    return 'bottom';
  }
  /** The words an element wants shown: its reason, its title, or the data-bs-title of an old data-bs-toggle="tooltip" element. */
  function textOf(el) {
    var r = el.getAttribute('data-ws-reason'); if (r && r.trim() !== '') return r;
    var t = el.getAttribute('title'); if (t && t.trim() !== '') return t;
    if (el.getAttribute('data-bs-toggle') === 'tooltip') { var b = el.getAttribute('data-bs-title'); if (b && b.trim() !== '') return b; }
    return '';
  }
  function has(el) { return el && el.nodeType === 1 && !el.matches(SKIP) && textOf(el) !== ''; }
  /** The element a pointer / focus event is on that carries a title (the nearest one up the tree), or one we already own. */
  function find(t) {
    for (var el = t && t.nodeType === 1 ? t : t && t.parentElement; el && el !== document.documentElement; el = el.parentElement) {
      if ((tips.has(el) && !adhoc.has(el)) || has(el)) return el;   // adhoc = shown by showText(): its caller decides when it goes
    }
    return null;
  }
  function own(el) {
    var text = textOf(el);
    if (el.hasAttribute('title')) el.removeAttribute('title');
    if (text !== '') {
      el.setAttribute('data-bs-title', text);
      // accessible name for an icon-only control
      if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') && !(el.textContent || '').trim()) el.setAttribute('aria-label', text);
    }
    var tip = tips.get(el);
    if (!tip) {
      var dlg = el.closest && el.closest('dialog[open]');
      tip = new window.bootstrap.Tooltip(el, { trigger: 'manual', container: dlg || 'body', customClass: 'cc-tip', placement: side, fallbackPlacements: ['top', 'bottom', 'right', 'left'], offset: gap, delay: 0, html: false });
      tips.set(el, tip);
    } else if (text !== '') {
      try { tip.setContent({ '.tooltip-inner': text }); } catch (e) { /* the next show reads data-bs-title */ }
    }
    return tip;
  }
  // ---- 0.10 BK.33: what a tooltip says beyond its title (text nodes only, never HTML) ----
  function describe(el) {
    if (!providers.length || el.disabled || el.getAttribute('aria-disabled') === 'true' || (el.getAttribute('data-ws-reason') || '').trim() !== '') return null;
    for (var i = 0; i < providers.length; i++) { try { var r = providers[i](el); if (r && r.name) return r; } catch (e) { /* a provider's fault never costs the tooltip */ } }
    return null;
  }
  function tipEl(tip) { try { return tip.tip || (tip._getTipElement ? tip._getTipElement() : null); } catch (e) { return null; } }
  function span(cls, text, tag) { var n = document.createElement(tag || 'span'); if (cls) n.className = cls; n.textContent = text; return n; }
  function fill(tip, nodes, stage) {
    var t = tipEl(tip), box = t && t.querySelector('.tooltip-inner'); if (!box) return false;
    box.replaceChildren.apply(box, nodes); t.setAttribute('data-cc-stage', String(stage));
    try { tip.update(); } catch (e) { /* placed at the next show */ }
    return true;
  }
  function infoNodes(info, withDesc) {
    var out = [span('cc-tip-name', info.name)];
    (info.keys || []).slice(0, 2).forEach(function (k) { if (k) out.push(span('', k, 'kbd')); });
    if (info.typed) out.push(span('cc-tip-typed', info.typed));
    if (withDesc && info.desc) out.push(span('cc-tip-desc', info.desc));
    return out;
  }
  function stages(tip, el, info) {
    clearTimeout(timer2);
    if (!info) {   // not a command (any more): its plain text back
      var t = tipEl(tip);
      if (t && t.hasAttribute('data-cc-stage')) { t.removeAttribute('data-cc-stage'); var b = t.querySelector('.tooltip-inner'); if (b) b.textContent = el.getAttribute('data-bs-title') || ''; }
      return;
    }
    if (!fill(tip, infoNodes(info, false), 1) || !info.desc) return;
    timer2 = setTimeout(function () { if (current === tip && el.isConnected) fill(tip, infoNodes(info, true), 2); }, STAGE2);
  }
  function hide() { clearTimeout(timer); clearTimeout(timer2); if (roll) roll.shown = null; if (current) { lastHide = Date.now(); try { current.hide(); } catch (e) { /* gone */ } current = null; } }
  function show(el, delay) {
    if (!ok()) return;
    clearTimeout(timer);
    var go = function () {
      if (!el.isConnected) return;
      var tip = own(el); if (current && current !== tip) hide();
      current = tip; try { tip.show(); } catch (e) { current = null; return; }
      stages(tip, el, describe(el));
    };
    var wait = Math.max(delay || 0, 250 - (Date.now() - lastHide));   // a show() while Bootstrap is still fading the last tip out gets removed with it
    if (wait > 0) timer = setTimeout(go, wait); else go();
  }
  // an element that went away: hide its tooltip, dispose a moment later (disposing while Bootstrap's hide transition is still queued throws inside Bootstrap)
  function release(el) { var t = tips.get(el); if (t) { try { t.hide(); } catch (e) { /* ok */ } setTimeout(function () { try { t.dispose(); } catch (e) { /* ok */ } }, 500); tips.delete(el); if (current === t) current = null; } }

  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || e.buttons) return;   // a button held (a panel or window drag, a drawing gesture): no tooltips
    var el = find(e.target); if (!el) return;
    if (textOf(el) !== '') own(el);   // take the native title away before the browser draws its bubble
    show(el, describe(el) ? STAGE1 : 350);   // BK.33: a command's name and shortcut come almost at once
  }, true);
  document.addEventListener('pointerout', function (e) {
    var el = find(e.target); if (!el) return;
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;
    var t = tips.get(el); if (t && t === current) hide(); else clearTimeout(timer);
  }, true);
  document.addEventListener('focusin', function (e) {
    var el = find(e.target); if (!el) return;
    var vis = true; try { vis = el.matches(':focus-visible'); } catch (x) { /* old engine: show */ }
    if (textOf(el) !== '') own(el);
    if (vis && Date.now() > quietUntil) show(el, 0);
  }, true);
  document.addEventListener('focusout', hide, true);
  document.addEventListener('pointerdown', function () { quietUntil = Date.now() + 600; hide(); }, true);
  document.addEventListener('click', function () { quietUntil = Date.now() + 600; hide(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { quietUntil = Date.now() + 600; hide(); } }, true);
  window.addEventListener('scroll', hide, true);
  window.addEventListener('blur', hide);

  var swept = false;
  new MutationObserver(function () {
    if (swept) return; swept = true;
    requestAnimationFrame(function () { swept = false; tips.forEach(function (t, el) { if (!el.isConnected) release(el); }); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /** A tip whose words the caller computes (text cut off with …, "Copied"): same look, same one tooltip at a time. */
  function showText(el, text, delay) {
    if (!el || !text) return;
    if (textOf(el) === '' && !tips.has(el)) adhoc.add(el);
    el.setAttribute('data-bs-title', text);
    if (!ok()) return;
    clearTimeout(timer);
    var go = function () {
      if (!el.isConnected) return;
      var tip = own(el); try { tip.setContent({ '.tooltip-inner': text }); } catch (e) { /* ok */ }
      if (current && current !== tip) hide();
      current = tip; try { tip.show(); } catch (e) { current = null; }
    };
    var wait = Math.max(delay || 0, 250 - (Date.now() - lastHide));   // a show() while Bootstrap is still fading the last tip out gets removed with it
    if (wait > 0) timer = setTimeout(go, wait); else go();
  }
  /** A window this page opens (a popped-out ribbon / panel / dialog, same origin): loads Bootstrap and this engine into it, so its tips
   *  are the same Bootstrap tooltips. Call once, after the window has a head and a body. */
  function attach(w) {
    if (!w || w.closed || w === window || w.ccTooltips || w.__ccTipAttach) return;
    w.__ccTipAttach = true;
    var d = w.document, src = [];
    document.querySelectorAll('script[src]').forEach(function (s) { if (/\/bootstrap\.bundle[^/]*\.js(\?|$)/.test(s.src)) src.unshift(s.src); else if (/\/app-tooltips\.js(\?|$)/.test(s.src)) src.push(s.src); });
    src.forEach(function (u) { var n = d.createElement('script'); n.src = u; n.async = false; (d.head || d.documentElement).appendChild(n); });   // in order: Bootstrap, then the engine
  }
  // ---- 0.10 BK.33: rollover information on things in a drawing ----
  function anchorAt(x, y) {
    if (!roll) { var a = document.createElement('span'); a.className = 'cc-tip-anchor'; a.setAttribute('aria-hidden', 'true'); a.setAttribute('data-native-title', ''); roll = { a: a, tip: null, shown: null, x: 0, y: 0 }; }
    if (!roll.a.isConnected) document.body.appendChild(roll.a);
    roll.a.style.left = x + 'px'; roll.a.style.top = y + 'px'; roll.x = x; roll.y = y;
    return roll;
  }
  function rollShow(x, y, info) {
    if (!ok()) return;
    var R = anchorAt(x, y), text = [info.title].concat(info.lines || []).join('\n');
    R.a.setAttribute('data-bs-title', text);
    if (!R.tip) R.tip = new window.bootstrap.Tooltip(R.a, { trigger: 'manual', container: 'body', customClass: 'cc-tip cc-tip-roll', placement: 'right', fallbackPlacements: ['left', 'bottom', 'top'], offset: [12, 14], delay: 0, html: false, animation: false });
    if (current && current !== R.tip) hide();
    current = R.tip;
    try { R.tip.show(); } catch (e) { current = null; return; }
    var nodes = [span('cc-tip-name', info.title)];
    (info.lines || []).forEach(function (l) { if (l) nodes.push(span('cc-tip-line', l)); });
    fill(R.tip, nodes, 'roll');
    R.shown = { key: info.key === undefined ? text : info.key, title: info.title, lines: (info.lines || []).slice(), x: x, y: y };
  }
  /** fn(pointerEvent) → null | { key, title, lines } for what is under the pointer on `view`; → stop(). */
  function hover(view, fn) {
    if (!view || typeof fn !== 'function') return function () {};
    var t = 0, last = null;
    var ask = function (e) { try { return fn(e) || null; } catch (x) { return null; } };
    var off = function () { clearTimeout(t); t = 0; if (roll && roll.shown && current === roll.tip) hide(); };
    var move = function (e) {
      if (e.pointerType === 'touch' || e.buttons) { off(); return; }
      last = e;
      if (roll && roll.shown && current === roll.tip) {   // showing: it stays while the pointer is on the same thing, and follows it
        var info = ask(e);
        if (info && (info.key === undefined ? info.title : info.key) === roll.shown.key) { if (Math.abs(e.clientX - roll.x) + Math.abs(e.clientY - roll.y) > 24) { anchorAt(e.clientX, e.clientY); try { roll.tip.update(); } catch (x) { /* ok */ } } return; }
        off();
      }
      clearTimeout(t);
      t = setTimeout(function () { t = 0; if (!last || !view.isConnected || Date.now() < quietUntil) return; var info = ask(last); if (info && info.title) rollShow(last.clientX, last.clientY, info); }, DWELL);
    };
    var down = function () { clearTimeout(t); t = 0; };   // the engine's own pointerdown hides what shows
    view.addEventListener('pointermove', move); view.addEventListener('pointerleave', off); view.addEventListener('pointerdown', down);
    view.addEventListener('wheel', off, { passive: true });
    return function () { off(); view.removeEventListener('pointermove', move); view.removeEventListener('pointerleave', off); view.removeEventListener('pointerdown', down); view.removeEventListener('wheel', off); };
  }
  document.addEventListener('keydown', function () { if (roll && roll.shown && current === roll.tip) hide(); }, true);
  window.ccTooltips = { attach: attach, count: function () { return tips.size; }, tipOf: function (el) { return tips.get(el) || null; }, hide: hide, showText: showText,
    provide: function (fn) { if (typeof fn === 'function' && providers.indexOf(fn) < 0) providers.push(fn); }, hover: hover,
    rollover: function () { return roll && roll.shown && current === roll.tip ? { key: roll.shown.key, title: roll.shown.title, lines: roll.shown.lines.slice() } : null; } };
})();
