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
 * The × gets a Bootstrap tooltip from app-tooltips.js (its title). Dev builds only (app-shell.inc). Words: shell.hint.* (en only).
 */
(function () {
  'use strict';
  var app = (document.querySelector('[data-app-settings]') || document.body).getAttribute('data-app') || (location.pathname.split('/')[2] || 'app');
  var KEY = 'cc-hint-closed:' + app;
  var T = function (k) { return typeof window.ccShellT === 'function' ? window.ccShellT(k) : k; };
  var st = document.createElement('style');
  st.textContent = '[data-hint][data-hint-dismissed] { display: none !important; } [data-hint]:has(> .shell-hint-x) { position: relative; padding-right: 2.25rem; } .shell-hint-x { position: absolute; top: .4rem; right: .4rem; }' +
    '[data-hint] [data-hint-close] { pointer-events: auto; z-index: 1; }';   // the card lets clicks through to the drawing; its × must take them
  (document.head || document.documentElement).appendChild(st);
  var mem = false;
  function stored() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function store(v) { try { if (v) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) { /* blocked: closed for this page only */ } }
  function cards() { return document.querySelectorAll('main [data-hint], [data-hint]'); }
  function close(card) { card.setAttribute('data-hint-dismissed', ''); mem = true; store(true); }
  function wire(card) {
    if (card.__tip) return; card.__tip = true;
    var x = card.querySelector('[data-hint-close]');
    if (x) { x.classList.add('shell-x'); if (!x.title) x.title = T('shell.hint.close'); }
    else {
      x = document.createElement('button'); x.type = 'button'; x.className = 'shell-x shell-hint-x'; x.setAttribute('data-hint-close', ''); x.title = T('shell.hint.close'); x.setAttribute('aria-label', T('shell.hint.close'));
      x.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>'; card.insertBefore(x, card.firstChild);
    }
    x.addEventListener('click', function () { close(card); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); close(card); } });
    if (stored() || mem) card.setAttribute('data-hint-dismissed', '');
  }
  function again() { store(false); mem = false; cards().forEach(function (c) { c.removeAttribute('data-hint-dismissed'); }); if (window.ccShellScreen && window.ccShellScreen.say) try { window.ccShellScreen.say(T('shell.hint.again.said')); } catch (e) { /* ok */ } }
  function scan() { cards().forEach(wire); }
  scan();
  new MutationObserver(function () { scan(); }).observe(document.documentElement, { childList: true, subtree: true });
  function reg() { if (window.ccPalette && window.ccPalette.register) window.ccPalette.register([{ id: 'start-tip-again', label: T('shell.hint.again'), group: 'shell', keywords: 'start tip hint help card welcome empty again show', run: again }]); }
  if (window.ccPalette) reg(); else window.addEventListener('load', reg);
  window.ccStartTip = { again: again, close: function () { cards().forEach(close); } };
})();
