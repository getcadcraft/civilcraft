/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-start-tip.js — the start / empty-state tip card on the drawing area ("Start a model", "Open a plan set", "Start drawing", …) can be closed (owner 2026-11-09).
 * Every app marks that card [data-hint]. This gives each one the shell's small × (.shell-x, the same as a row-remove ×) at its top-right, unless the app drew its own
 * [data-hint-close] (CadCraft, ModelCraft, CivilCraft: that one is restyled to .shell-x and now remembers too). Closing hides the card (data-hint-dismissed) and
 * remembers it per app in localStorage (cc-hint-closed:<app>); with storage blocked it stays closed for the page and the card renders normally next time.
 *   - Enter / Space on the × (it is a button), Escape while focus is inside the card, a click: all close it;
 *   - nothing needed to start work is hidden: the card only repeats what the toolbar/menus do (Open, New, Sample…), the card has no action of its own;
 *   - it comes back through the command palette (Ctrl+K): "Show the start tip again" (shell.hint.again), which also forgets the choice;
 *   - the app still hides the card itself when a file is opened or a model started (their own code; unchanged).
 * The card is hidden until this file has run (FX.270, app-shell.inc's head style + data-hint-ready), so it never flashes before the choice is read.
 * The × gets a Bootstrap tooltip from app-tooltips.js (its title). Dev builds only (app-shell.inc). Words: shell.hint.* (en only).
 */
(function () {
  'use strict';
  var app = (document.querySelector('[data-app-settings]') || document.body).getAttribute('data-app') || (location.pathname.split('/')[2] || 'app');
  var KEY = 'cc-hint-closed:' + app;
  var T = function (k) { return typeof window.ccShellT === 'function' ? window.ccShellT(k) : k; };
  var st = document.createElement('style');
  st.textContent = '[data-hint][data-hint-dismissed] { display: none !important; } [data-hint]:has(> .shell-hint-x) { position: relative; padding-right: 2.25rem; } .shell-hint-x { position: absolute; top: .4rem; right: .4rem; }' +
    '[data-hint] [data-hint-close], [data-hint] .shell-hint-never { pointer-events: auto; z-index: 1; } ' +
    '[data-hint] .shell-hint-pair, [data-empty] .shell-hint-pair { display: flex; justify-content: space-between; align-items: center; gap: .5rem; flex: 1 1 100%; width: 100%; margin: .6rem 0 0; } ' +
    '.shell-hint-pair .shell-hint-tiny { display: inline-flex; align-items: center; gap: .35rem; margin: 0; padding: .15rem .55rem; min-height: 0; font-size: .75rem; line-height: 1.3; white-space: nowrap; pointer-events: auto; z-index: 1; } .shell-hint-pair .bi { font-size: .8rem; } ' +
    '.shell-hint-never { display: flex; align-items: center; gap: .5rem; margin: .75rem 0 0; font-size: .875rem; line-height: 1.2; cursor: pointer; } .shell-hint-never input { flex: none; width: 1rem; height: 1rem; margin: 0; }';   // the card lets clicks through to the drawing; its x must take them
  (document.head || document.documentElement).appendChild(st);
  var mem = false;
  function stored() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function store(v) { try { if (v) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) { /* blocked: closed for this page only */ } }
  function cards() { return document.querySelectorAll('main [data-hint], [data-hint]'); }
  function close(card) { card.setAttribute('data-hint-dismissed', ''); mem = true; }   // the x: gone for this visit, back next time
  function never(card) { close(card); store(true); }   // "Don't show this again": remembered per app (2026-11-12)
  function wire(card) {
    if (card.__tip) return; card.__tip = true;
    var x = card.querySelector('[data-hint-close]');
    if (x) { x.classList.add('shell-x'); if (!x.title) x.title = T('shell.hint.close'); }
    else {
      x = document.createElement('button'); x.type = 'button'; x.className = 'shell-x shell-hint-x'; x.setAttribute('data-hint-close', ''); x.title = T('shell.hint.close'); x.setAttribute('aria-label', T('shell.hint.close'));
      x.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>'; card.insertBefore(x, card.firstChild);
    }
    x.addEventListener('click', function () { close(card); });
    if (!card.querySelector('[data-hint-never]')) {   // "Don't show this again" at the foot of every start card
      var lab = document.createElement('label'); lab.className = 'shell-check shell-hint-never';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.setAttribute('data-hint-never', '');
      cb.addEventListener('change', function () { if (cb.checked) never(card); });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(T('shell.hint.never')));
      var slot = card.querySelector('[data-hint-never-slot]'); if (slot) slot.appendChild(lab); else card.appendChild(lab);   // a long card (BimCraft) puts it under its buttons
    }
    card.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); close(card); } });
    if (stored() || mem) card.setAttribute('data-hint-dismissed', '');   // no setting = the card shows
  }
  function again() { store(false); mem = false; cards().forEach(function (c) { c.removeAttribute('data-hint-dismissed'); }); if (window.ccShellScreen && window.ccShellScreen.say) try { window.ccShellScreen.say(T('shell.hint.again.said')); } catch (e) { /* ok */ } }
  /* 2026-11-12 (owner): "Try a sample file" at the far left and "Take the tour" at the far right of ONE line, both tiny outline buttons, identical in all eight apps.
   * An app keeps its own tour button where it has one (CadCraft, ModelCraft); every other app's gets the shared "I'm new" tour (app-newhere.js). Both are moved into one row. */
  var SAMPLE = '[data-hint-sample], [data-sample], [data-sample-open]', TOUR = '[data-hint-tour], [data-guide-open], [data-newhere-open]';
  function tiny(b) { b.classList.remove('btn-plot', 'btn-sm-cc'); b.classList.add('btn-line', 'shell-hint-tiny'); }
  function pair() {
    document.querySelectorAll(SAMPLE).forEach(function (sb) {
      if (sb.__pair) return; sb.__pair = true;
      var box = sb.closest('[data-hint], [data-empty]') || sb.parentNode;
      var tb = box.querySelector(TOUR);
      if (!tb || tb.closest('[role=menu]')) {   // a menu item of the same name is not the card's button
        tb = document.createElement('button'); tb.type = 'button'; tb.setAttribute('data-newhere-open', '');
        tb.innerHTML = '<i class="bi bi-signpost-2" aria-hidden="true"></i> '; tb.appendChild(document.createTextNode(T('shell.hint.tour')));
      } else if (!tb.querySelector('.bi')) { var ic = document.createElement('i'); ic.className = 'bi bi-signpost-2'; ic.setAttribute('aria-hidden', 'true'); tb.insertBefore(ic, tb.firstChild); tb.insertBefore(document.createTextNode(' '), ic.nextSibling); }
      var row = document.createElement('div'); row.className = 'shell-hint-pair';
      sb.parentNode.insertBefore(row, sb); row.appendChild(sb); row.appendChild(tb); tiny(sb); tiny(tb);
    });
  }
  // FX.270: only now may a card be seen (app-shell.inc hides [data-hint] without data-hint-ready from the first paint): dressed, its buttons in
  // their row, and already put away if the person chose "Don't show this again". Before, the plain card flashed and then changed or vanished.
  function scan() { cards().forEach(wire); pair(); cards().forEach(function (c) { if (!c.hasAttribute('data-hint-ready')) c.setAttribute('data-hint-ready', ''); }); }
  scan();
  new MutationObserver(function () { scan(); }).observe(document.documentElement, { childList: true, subtree: true });
  function reg() { if (window.ccPalette && window.ccPalette.register) window.ccPalette.register([{ id: 'start-tip-again', label: T('shell.hint.again'), group: 'shell', keywords: 'start tip hint help card welcome empty again show', run: again }]); }
  if (window.ccPalette) reg(); else window.addEventListener('load', reg);
  /* Settings > Global > "Show the start tip" reads and writes the same per-app choice */
  function setShown(on) { if (on) again(); else cards().forEach(never); }
  window.addEventListener('cc-start-tip-set', function (e) { setShown(!!(e.detail && e.detail.on)); });
  window.ccStartTip = { again: again, close: function () { cards().forEach(close); }, never: function () { cards().forEach(never); }, shown: function () { return !stored(); } };
})();
