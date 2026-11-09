/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-tabs-scroll.js — a panel's tab strip never hides a tab without a visible way to reach it (owner 2026-11-09: MarkupCraft's "Markup panels" strip showed
 * "Properties … Fi" and "Field" / "Tool chest" could not be seen).
 *
 * For every [role=tablist] whose tabs are wider than the strip (labels never wrap: white-space nowrap, also in app-shell.css):
 *   - a chevron button at each end (left / right), disabled at the ends: a click scrolls by about one tab, holding repeats; an edge fade on the cut side;
 *   - the selected tab (aria-selected) and a tab that takes focus are scrolled into view, only the strip moves;
 *   - mouse wheel and touch (native overflow) scroll it; Arrow Left / Right, Home and End move focus between tabs when the app does not, and the focused tab scrolls into view.
 * A strip that fits is left alone (no chevrons). Re-measured on resize, tab changes and layout moves. The chevrons are decorative for assistive technology (the tabs are the
 * keyboard route) and carry a title (a Bootstrap tooltip through app-tooltips.js). Words: shell.tabs.left / .right. Loaded by app-shell.inc (dev builds).
 */
(function () {
  'use strict';
  if (window.ccTabsScroll) return;
  var T = function (k) { return typeof window.ccShellT === 'function' ? window.ccShellT(k) : k; };
  var CSS = '[role="tablist"] > :is([role="tab"], button) { white-space: nowrap; }' +
    '.shell-tabs-scroll { display: flex !important; grid-template-columns: none !important; overflow-x: auto !important; overflow-y: hidden; flex-wrap: nowrap !important; scrollbar-width: none !important; overscroll-behavior-x: contain; scroll-behavior: smooth; padding-inline: 1.6rem !important; scroll-padding-inline: 1.6rem; box-sizing: border-box; }' +
    '.shell-tabs-scroll::-webkit-scrollbar { display: none; } .shell-tabs-scroll > * { flex: 0 0 auto !important; }' +
    '.shell-tabs-scroll[data-more="end"] { -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 2.6rem), transparent calc(100% - 1.6rem)); mask-image: linear-gradient(90deg, #000 calc(100% - 2.6rem), transparent calc(100% - 1.6rem)); }' +
    '.shell-tabs-scroll[data-more="start"] { -webkit-mask-image: linear-gradient(270deg, #000 calc(100% - 2.6rem), transparent calc(100% - 1.6rem)); mask-image: linear-gradient(270deg, #000 calc(100% - 2.6rem), transparent calc(100% - 1.6rem)); }' +
    '.shell-tabs-scroll[data-more="both"] { -webkit-mask-image: linear-gradient(90deg, transparent 1.6rem, #000 2.6rem, #000 calc(100% - 2.6rem), transparent calc(100% - 1.6rem)); mask-image: linear-gradient(90deg, transparent 1.6rem, #000 2.6rem, #000 calc(100% - 2.6rem), transparent calc(100% - 1.6rem)); }' +
    '.shell-tabs-nav { position: absolute; z-index: 5; pointer-events: none; display: flex; justify-content: space-between; align-items: stretch; }' +
    '.shell-tabs-chev { pointer-events: auto; width: 1.6rem; min-width: 0; margin: 0; padding: 0; display: grid; place-items: center; border: 0; background: color-mix(in srgb, var(--ws-panel-bg, var(--sheet-2, #f4f4f4)) 92%, transparent); color: var(--ink, inherit); cursor: pointer; font-size: .85rem; line-height: 1; }' +
    '.shell-tabs-chev:hover:not(:disabled) { color: var(--action, #1e48c8); } .shell-tabs-chev:disabled { opacity: .3; cursor: default; }' +
    '.shell-tabs-chev[hidden] { display: none; }';
  var st = document.createElement('style'); st.setAttribute('data-shell-tabs-scroll', ''); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);

  var strips = new Map(), ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (es) { es.forEach(function (e) { measure(e.target); }); }) : null;
  function slot(el) { return strips.get(el); }
  function place(el) {
    var s = slot(el); if (!s) return;
    var host = s.nav.parentElement; if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    s.nav.style.left = el.offsetLeft + 'px'; s.nav.style.top = el.offsetTop + 'px'; s.nav.style.width = el.offsetWidth + 'px'; s.nav.style.height = el.offsetHeight + 'px';
  }
  function more(el) {
    var s = slot(el), l = el.scrollLeft > 2, r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2, over = el.classList.contains('shell-tabs-scroll');
    var v = l && r ? 'both' : l ? 'start' : r ? 'end' : '';
    if (v) el.setAttribute('data-more', v); else el.removeAttribute('data-more');
    if (s) { s.nav.hidden = !over; s.left.disabled = !l; s.right.disabled = !r; if (over) place(el); }
  }
  function tabStep(el) { var t = [].filter.call(el.children, function (c) { return c.offsetWidth; }); return t.length ? Math.max(48, Math.round(el.scrollWidth / t.length)) : 80; }
  function measure(el) {
    if (!el.isConnected) { var s0 = slot(el); if (s0) s0.nav.remove(); strips.delete(el); if (ro) ro.unobserve(el); return; }
    var was = el.classList.contains('shell-tabs-scroll');
    var over = el.scrollWidth > el.clientWidth + 1;
    if (over !== was) { el.classList.toggle('shell-tabs-scroll', over); }
    more(el);
    if (over) reveal(el);
  }
  function show(el, tab) {
    var er = el.getBoundingClientRect(), tr = tab.getBoundingClientRect(), pad = el.classList.contains('shell-tabs-scroll') ? 4 : 0;
    if (tr.left < er.left + pad) el.scrollLeft += tr.left - er.left - pad;
    else if (tr.right > er.right - pad) el.scrollLeft += tr.right - er.right + pad;
  }
  function reveal(el) { var t = el.querySelector('[aria-selected="true"]'); if (t) { var b = el.style.scrollBehavior; el.style.scrollBehavior = 'auto'; show(el, t); el.style.scrollBehavior = b; } more(el); }
  function chev(el, dir) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'shell-tabs-chev'; b.setAttribute('aria-hidden', 'true'); b.tabIndex = -1;
    b.title = T(dir < 0 ? 'shell.tabs.left' : 'shell.tabs.right'); b.innerHTML = '<i class="bi bi-chevron-' + (dir < 0 ? 'left' : 'right') + '" aria-hidden="true"></i>';
    var timer = 0, rep = 0;
    var go = function () { el.scrollBy({ left: dir * tabStep(el), behavior: 'smooth' }); };
    b.addEventListener('pointerdown', function (e) { if (b.disabled) return; e.preventDefault(); go(); timer = setTimeout(function () { rep = setInterval(function () { if (b.disabled) { clearInterval(rep); return; } el.scrollBy({ left: dir * tabStep(el) * 0.5, behavior: 'auto' }); }, 90); }, 380); });
    var stop = function () { clearTimeout(timer); clearInterval(rep); };
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (n) { b.addEventListener(n, stop); });
    b.addEventListener('click', function (e) { e.preventDefault(); });
    return b;
  }
  function add(el) {
    if (strips.has(el)) return;
    var nav = document.createElement('div'); nav.className = 'shell-tabs-nav'; nav.hidden = true; nav.setAttribute('data-shell-tabs-nav', '');
    var left = chev(el, -1), right = chev(el, 1); nav.append(left, right); el.after(nav);
    strips.set(el, { nav: nav, left: left, right: right });
    if (ro) ro.observe(el);
    el.addEventListener('scroll', function () { more(el); }, { passive: true });
    el.addEventListener('wheel', function (e) {
      if (!el.classList.contains('shell-tabs-scroll') || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var before = el.scrollLeft; el.style.scrollBehavior = 'auto'; el.scrollLeft += e.deltaY; el.style.scrollBehavior = '';
      if (el.scrollLeft !== before) e.preventDefault();
    }, { passive: false });
    el.addEventListener('focusin', function (e) { if (e.target !== el && el.classList.contains('shell-tabs-scroll')) { show(el, e.target); more(el); } });
    el.addEventListener('keydown', function (e) {   // Arrow keys / Home / End between tabs, unless the app's own handler already moved the focus
      if (!/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key) || !e.target.matches || !e.target.matches('[role="tab"], button')) return;
      var before = document.activeElement;
      setTimeout(function () {
        if (document.activeElement !== before) return;
        var tabs = [].filter.call(el.querySelectorAll('[role="tab"], :scope > button'), function (t) { return t.offsetWidth && !t.disabled; }), i = tabs.indexOf(before); if (i < 0) return;
        var n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus(); show(el, tabs[n]);
      }, 0);
    });
    new MutationObserver(function () { measure(el); if (el.classList.contains('shell-tabs-scroll')) reveal(el); }).observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected', 'hidden'] });
    measure(el);
  }
  function scan() { document.querySelectorAll('[role="tablist"]').forEach(add); strips.forEach(function (s, el) { measure(el); }); }
  var queued = false; function later() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; scan(); }); }
  new MutationObserver(function (m) { if (m.some(function (r) { return !(r.target.closest && r.target.closest('[data-shell-tabs-nav]')); })) later(); }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', later); window.addEventListener('load', later);
  window.ccTabsScroll = { scan: scan };
  scan();
})();
