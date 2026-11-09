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
 *   - skipped: elements that are already Bootstrap tooltips (data-bs-toggle), form fields (title is their validation hint), and anything with
 *     data-native-title (an explicit opt-out).
 * window.ccTooltips = { count(), tipOf(el) }.
 */
(function () {
  'use strict';
  if (window.ccTooltips) return;
  var SKIP = 'input, textarea, select, option, iframe, html, body, svg, [data-native-title], [data-bs-toggle="tooltip"], [data-bs-toggle="dropdown"]';
  var tips = new Map(), timer = 0, current = null, quietUntil = 0;   // quietUntil: focus handed back by a closing dialog / palette (after Esc, Enter, a click) does not pop a tip
  var st = document.createElement('style');
  st.textContent = '.tooltip.cc-tip { z-index: 100100; pointer-events: none; } .tooltip.cc-tip .tooltip-inner { max-width: 22rem; text-align: left; }';
  (document.head || document.documentElement).appendChild(st);

  function ok() { return !!(window.bootstrap && window.bootstrap.Tooltip); }
  function has(el) { return el && el.nodeType === 1 && el.hasAttribute('title') && el.getAttribute('title').trim() !== '' && !el.matches(SKIP); }
  /** The element a pointer / focus event is on that carries a title (the nearest one up the tree), or one we already own. */
  function find(t) {
    for (var el = t && t.nodeType === 1 ? t : t && t.parentElement; el && el !== document.documentElement; el = el.parentElement) {
      if (tips.has(el) || has(el)) return el;
    }
    return null;
  }
  function own(el) {
    var text = el.getAttribute('title');
    if (text != null && text.trim() !== '') {
      el.removeAttribute('title');
      el.setAttribute('data-bs-title', text);
      // accessible name for an icon-only control
      if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') && !(el.textContent || '').trim()) el.setAttribute('aria-label', text);
    }
    var tip = tips.get(el);
    if (!tip) {
      var dlg = el.closest && el.closest('dialog[open]');
      tip = new window.bootstrap.Tooltip(el, { trigger: 'manual', container: dlg || 'body', customClass: 'cc-tip', placement: 'bottom', fallbackPlacements: ['top', 'left', 'right'], delay: 0, html: false });
      tips.set(el, tip);
    } else if (text != null && text.trim() !== '') {
      try { tip.setContent({ '.tooltip-inner': text }); } catch (e) { /* the next show reads data-bs-title */ }
    }
    return tip;
  }
  function hide() { clearTimeout(timer); if (current) { try { current.hide(); } catch (e) { /* gone */ } current = null; } }
  function show(el, delay) {
    if (!ok()) return;
    clearTimeout(timer);
    var go = function () {
      if (!el.isConnected) return;
      var tip = own(el); if (current && current !== tip) hide();
      current = tip; try { tip.show(); } catch (e) { current = null; }
    };
    if (delay) timer = setTimeout(go, delay); else go();
  }
  // an element that went away: hide its tooltip, dispose a moment later (disposing while Bootstrap's hide transition is still queued throws inside Bootstrap)
  function release(el) { var t = tips.get(el); if (t) { try { t.hide(); } catch (e) { /* ok */ } setTimeout(function () { try { t.dispose(); } catch (e) { /* ok */ } }, 500); tips.delete(el); if (current === t) current = null; } }

  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || e.buttons) return;   // a button held (a panel or window drag, a drawing gesture): no tooltips
    var el = find(e.target); if (!el) return;
    if (el.hasAttribute('title')) own(el);   // take the native title away before the browser draws its bubble
    show(el, 350);
  }, true);
  document.addEventListener('pointerout', function (e) {
    var el = find(e.target); if (!el) return;
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;
    var t = tips.get(el); if (t && t === current) hide(); else clearTimeout(timer);
  }, true);
  document.addEventListener('focusin', function (e) {
    var el = find(e.target); if (!el) return;
    var vis = true; try { vis = el.matches(':focus-visible'); } catch (x) { /* old engine: show */ }
    if (el.hasAttribute('title')) own(el);
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

  window.ccTooltips = { count: function () { return tips.size; }, tipOf: function (el) { return tips.get(el) || null; }, hide: hide };
})();
