/* SPDX-License-Identifier: Apache-2.0 */
/*
 * app-newhere.js — "I'm new…": a short guided tour for someone opening the app for the first time (core/components/app-newhere.inc).
 * Five steps — welcome, the eight apps, Settings, the Help and information areas, done. It is a card beside the work, not a modal:
 * a ring marks the real button it is talking about and "Show me" presses it. The card is a top-layer popover so it stays above the
 * app's own dialogs; while a modal dialog of the shell is open (Settings, About) the card steps aside and comes back when it closes.
 *
 * Opens from any [data-newhere-open] button (the Help panel and the Vector Help menu carry one), window event 'cc-newhere-open', or by
 * itself once, as a one-line offer, the first time a person opens any app (unless Settings › Global › First-time tours is off).
 * localStorage cc-newhere = 'done' | 'skipped' (shared by every app, like cc-tours); Settings' Reset does not touch it.
 * window.cadcraftNewHere = { open(step?), close() }. Words: shell.newhere.* in assets/lang/shell. Nothing is sent anywhere.
 */
(function () {
  var root = document.querySelector('[data-newhere]');
  if (!root) return;
  var T = function (k, v) { return window.ccShellT ? window.ccShellT(k, v) : k; };
  var KEY = 'cc-newhere', TOURS = 'cc-tours';
  var SITE = ((document.querySelector('[data-help-panel]') || { dataset: {} }).dataset.site || '').replace(/\/+$/, '');
  var APP = root.dataset.app || '';
  // the area this page lives in (/try, /lab …): the other apps are its neighbours
  var AREA = SITE ? '/try' : '/' + (location.pathname.split('/')[1] || 'try');
  var APPS = ['cadcraft', 'bimcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft'];
  var NAMES = { cadcraft: 'CadCraft', bimcraft: 'BimCraft', modelcraft: 'ModelCraft', markupcraft: 'MarkupCraft', takeoffcraft: 'TakeoffCraft', civilcraft: 'CivilCraft', detailcraft: 'DetailCraft', partcraft: 'PartCraft' };
  var TASKS = ['draft', 'building', 'model', 'markup', 'takeoff', 'civil', 'detail', 'parts'];   // same order as APPS

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* private window: this visit only */ } }
  function h(tag, attrs) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
    });
    var add = function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) c.forEach(add); else n.append(c.nodeType ? c : document.createTextNode(c));
    };
    for (var i = 2; i < arguments.length; i++) add(arguments[i]);
    return n;
  }
  function icon(name) { return h('i', { class: 'bi bi-' + name, 'aria-hidden': 'true' }); }
  function siteHref(p) { return SITE && p.charAt(0) === '/' ? SITE + p : p; }

  var body = root.querySelector('[data-newhere-body]'), titleEl = root.querySelector('[data-newhere-title]');
  var stepEl = root.querySelector('[data-newhere-step]'), dots = root.querySelector('[data-newhere-dots]');
  var backBtn = root.querySelector('[data-newhere-back]'), nextBtn = root.querySelector('[data-newhere-next]'), skipBtn = root.querySelector('[data-newhere-skip]');
  var ring = document.querySelector('[data-newhere-ring]');
  var at = 0, task = 0, returnFocus = null, offer = null, away = false;

  /* ---------------- the ring on the real button ---------------- */
  function target(sel) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) { var r = list[i].getBoundingClientRect(); if (r.width > 0 && r.height > 0) return list[i]; }
    return null;
  }
  function mark(sel) {
    var el = sel && target(sel);
    if (!ring) return;
    if (!el) { unmark(); return; }
    var r = el.getBoundingClientRect(), pad = 4;
    ring.style.cssText = 'left:' + (r.left - pad) + 'px;top:' + (r.top - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px';
    try { if (!ring.matches(':popover-open')) ring.showPopover(); } catch (e) { ring.hidden = false; }
  }
  function unmark() { if (!ring) return; try { if (ring.matches(':popover-open')) ring.hidePopover(); } catch (e) { ring.hidden = true; } }

  /* ---------------- show / hide the card ---------------- */
  function lift() { try { if (root.matches(':popover-open')) root.hidePopover(); root.showPopover(); } catch (e) { root.hidden = false; } }
  function shown() { try { return root.matches(':popover-open'); } catch (e) { return !root.hidden; } }
  function hide() { try { if (root.matches(':popover-open')) root.hidePopover(); } catch (e) { root.hidden = true; } unmark(); }

  /* Press a real control and let the card step aside while a modal dialog of the shell is open. */
  function press(sel, modalSel) {
    var el = target(sel); if (!el) return false;
    var dlg = modalSel && document.querySelector(modalSel);
    if (dlg && dlg.tagName === 'DIALOG') {
      away = true; hide();
      dlg.addEventListener('close', function back() { dlg.removeEventListener('close', back); away = false; if (root.dataset.open === '1') { lift(); mark(ringFor(at)); } });
    }
    if (!dlg && el.getAttribute('aria-expanded') === 'true') { setTimeout(function () { lift(); }, 60); return true; }   // a panel already open stays open
    el.click();
    if (!dlg) setTimeout(function () { lift(); }, 60);   // a side panel (Help) stays open beside the card
    return true;
  }

  /* ---------------- the steps ---------------- */
  function welcome() {
    var sel = h('select', { id: 'nh-task', 'aria-label': T('shell.newhere.welcome.ask'), onchange: function (e) { task = +e.target.value; put(KEY + '.task', String(task)); } });
    TASKS.forEach(function (t, i) { sel.append(h('option', { value: String(i), selected: i === task }, T('shell.newhere.task.' + t))); });
    return [
      h('p', { text: T('shell.newhere.welcome.p', { app: root.dataset.name || '' }) }),
      h('ul', { class: 'nh-list' },
        h('li', {}, icon('grid-3x3-gap'), ' ', T('shell.newhere.welcome.apps')),
        h('li', {}, icon('gear'), ' ', T('shell.newhere.welcome.settings')),
        h('li', {}, icon('question-circle'), ' ', T('shell.newhere.welcome.help'))),
      h('label', { class: 'nh-field', for: 'nh-task' }, h('span', { text: T('shell.newhere.welcome.ask') }), sel),
      h('p', { class: 'nh-note', text: T('shell.newhere.welcome.skip') }),
    ];
  }
  function apps() {
    var pick = APPS[task];
    return [
      h('p', { text: T('shell.newhere.apps.p') }),
      h('ul', { class: 'nh-apps' }, APPS.map(function (s) {
        var here = s === APP, rec = s === pick;
        return h('li', { class: 'nh-app' + (rec ? ' nh-rec' : '') + (here ? ' nh-here' : '') },
          h('span', { class: 'nh-app-name' }, NAMES[s],
            here ? h('em', { text: T('shell.newhere.apps.here') }) : rec ? h('em', { text: T('shell.newhere.apps.pick') }) : null),
          h('span', { class: 'nh-app-what', text: T('shell.newhere.app.' + s) }),
          here ? null : h('a', { href: siteHref(AREA + '/' + s), target: '_blank', rel: 'noopener', 'aria-label': T('shell.newhere.apps.open.aria', { app: NAMES[s] }) }, T('shell.newhere.apps.open'), ' ', icon('box-arrow-up-right')));
      })),
      h('p', { class: 'nh-note', text: T('shell.newhere.apps.note') }),
    ];
  }
  function settings() {
    var kids = [h('p', { text: T('shell.newhere.settings.p') })];
    var ws = window.ccShellWorkspace, engine = window.ccWorkspaceEngine || document.documentElement.hasAttribute('data-cc-ws-boot');
    if (ws && engine) {
      var sel = h('select', { id: 'nh-layout', onchange: function (e) { ws.set(e.target.value); } });
      ['standard', 'docked', 'toolbox'].forEach(function (v) { sel.append(h('option', { value: v, selected: ws.get() === v }, T('shell.newhere.layout.' + v))); });
      kids.push(h('label', { class: 'nh-field', for: 'nh-layout' }, h('span', { text: T('shell.newhere.settings.layout') }), sel),
        h('p', { class: 'nh-note', text: T('shell.newhere.settings.layout.what') }));
    }
    kids.push(h('label', { class: 'nh-check' },
      h('input', { type: 'checkbox', checked: get(TOURS) !== 'off', onchange: function (e) { put(TOURS, e.target.checked ? null : 'off'); } }), ' ', T('shell.newhere.settings.tours')));
    kids.push(h('ul', { class: 'nh-list' },
      h('li', {}, icon('app-indicator'), ' ', T('shell.newhere.settings.l1', { app: root.dataset.name || '' })),
      h('li', {}, icon('globe2'), ' ', T('shell.newhere.settings.l2')),
      h('li', {}, icon('palette'), ' ', T('shell.newhere.settings.l3')),
      h('li', {}, icon('keyboard'), ' ', T('shell.newhere.settings.l4'))));
    var open = target('[data-settings-open]');
    kids.push(h('p', {}, open
      ? h('button', { type: 'button', class: 'nh-btn', 'data-k': 'settings', onclick: function () { press('[data-settings-open]', '[data-app-settings]'); } }, icon('gear'), ' ', T('shell.newhere.settings.open'), ' ', h('kbd', { text: 'Ctrl+,' }))
      : h('span', { class: 'nh-note', text: T('shell.newhere.settings.none') })));
    return kids;
  }
  function row(ico, name, what, action) {
    return h('li', { class: 'nh-row' }, icon(ico), h('span', { class: 'nh-row-t' }, h('strong', { text: name }), h('small', { text: what })), action || null);
  }
  function help() {
    var rows = [];
    var show = function (sel, modalSel) { return target(sel) ? h('button', { type: 'button', class: 'nh-btn nh-sm', onclick: function () { press(sel, modalSel); } }, T('shell.newhere.help.show')) : null; };
    var link = function (path, label) { return h('a', { class: 'nh-btn nh-sm', href: siteHref(path), target: '_blank', rel: 'noopener' }, label || T('shell.newhere.help.visit'), ' ', icon('box-arrow-up-right')); };
    rows.push(row('question-circle', T('shell.newhere.help.panel'), T('shell.newhere.help.panel.what', { key: 'F1' }), show('[data-help-open]')));
    rows.push(row('search', T('shell.newhere.help.find'), T('shell.newhere.help.find.what'), show('[data-palette-open]', '[data-palette]')));
    if (target('.app-bar-lessons, [data-lessons-open], [data-cct-key="lessons"]')) rows.push(row('mortarboard', T('shell.newhere.help.lessons'), T('shell.newhere.help.lessons.what'), show('.app-bar-lessons, [data-lessons-open], [data-cct-key="lessons"]')));
    rows.push(row('journal-text', T('shell.newhere.help.tutorials'), T('shell.newhere.help.tutorials.what'), link('/tutorials')));
    rows.push(row('patch-question', T('shell.newhere.help.faq'), T('shell.newhere.help.faq.what'), link('/faq')));
    rows.push(row('life-preserver', T('shell.newhere.help.support'), T('shell.newhere.help.support.what'), link('/support')));
    rows.push(row('newspaper', T('shell.newhere.help.news'), T('shell.newhere.help.news.what'), link('/news')));
    rows.push(row('info-circle', T('shell.newhere.help.about'), T('shell.newhere.help.about.what'), show('[data-about-open]', '[data-about]')));
    return [h('p', { text: T('shell.newhere.help.p') }), h('ul', { class: 'nh-rows' }, rows)];
  }
  function done() {
    var pick = APPS[task];
    return [
      h('p', { text: T('shell.newhere.done.p') }),
      h('ul', { class: 'nh-list' },
        h('li', {}, icon('question-circle'), ' ', T('shell.newhere.done.help', { key: 'F1' })),
        h('li', {}, icon('gear'), ' ', T('shell.newhere.done.settings', { key: 'Ctrl+,' })),
        h('li', {}, icon('arrow-repeat'), ' ', T('shell.newhere.done.again'))),
      pick !== APP ? h('p', {}, h('a', { class: 'nh-btn', href: siteHref(AREA + '/' + pick), target: '_blank', rel: 'noopener' }, T('shell.newhere.done.try', { app: NAMES[pick] }), ' ', icon('box-arrow-up-right'))) : null,
    ];
  }
  var STEPS = [
    { id: 'welcome', make: welcome },
    { id: 'apps', make: apps },
    { id: 'settings', make: settings, ring: '[data-settings-open]' },
    { id: 'help', make: help, ring: '[data-help-open]' },
    { id: 'done', make: done },
  ];
  function ringFor(i) { return STEPS[i] && STEPS[i].ring; }

  function render() {
    var s = STEPS[at];
    titleEl.textContent = T('shell.newhere.' + s.id + '.h');
    stepEl.textContent = T('shell.newhere.step', { n: at + 1, total: STEPS.length });
    dots.replaceChildren.apply(dots, STEPS.map(function (x, i) { return h('li', { class: i === at ? 'on' : i < at ? 'past' : '', 'aria-hidden': 'true' }); }));
    body.replaceChildren.apply(body, s.make());
    backBtn.hidden = at === 0;
    nextBtn.textContent = at === STEPS.length - 1 ? T('shell.newhere.finish') : T('shell.newhere.next');
    skipBtn.hidden = at === STEPS.length - 1;
    body.scrollTop = 0;
    mark(s.ring);
  }

  /* ---------------- open / close ---------------- */
  function open(step) {
    removeOffer();
    if (root.dataset.open !== '1') returnFocus = document.activeElement;
    root.dataset.open = '1';
    at = Math.max(0, Math.min(STEPS.length - 1, step | 0));
    var t = parseInt(get(KEY + '.task'), 10); if (t >= 0 && t < APPS.length) task = t; else task = Math.max(0, APPS.indexOf(APP));
    render(); lift();
    (nextBtn || root).focus({ preventScroll: true });
  }
  function close(how) {
    if (how) put(KEY, how);
    root.dataset.open = '0'; hide();
    try { if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true }); } catch (e) { /* gone */ }
  }
  nextBtn.addEventListener('click', function () { if (at >= STEPS.length - 1) close('done'); else { at++; render(); } });
  backBtn.addEventListener('click', function () { if (at > 0) { at--; render(); } });
  skipBtn.addEventListener('click', function () { close('skipped'); });
  root.querySelector('[data-newhere-close]').addEventListener('click', function () { close(get(KEY) ? null : 'skipped'); });
  root.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); close(get(KEY) ? null : 'skipped'); } });   // typing here never reaches the app's keys
  window.addEventListener('resize', function () { if (shown()) mark(ringFor(at)); });
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-newhere-open]'); if (b) { e.preventDefault(); open(0); } });
  window.addEventListener('cc-newhere-open', function (e) { open(e && e.detail && e.detail.step); });

  /* ---------------- the one-time offer ---------------- */
  function removeOffer() { if (offer) { offer.remove(); offer = null; } }
  function maybeOffer() {
    if (get(KEY) || get(TOURS) === 'off' || root.dataset.open === '1') return;
    if (document.querySelector('dialog[open]')) { setTimeout(maybeOffer, 4000); return; }
    offer = h('div', { class: 'nh-offer', role: 'region', 'aria-label': T('shell.newhere.title') },
      h('p', { text: T('shell.newhere.offer', { app: root.dataset.name || '' }) }),
      h('div', { class: 'nh-offer-bar' },
        h('button', { type: 'button', class: 'nh-btn', 'data-k': 'start', onclick: function () { open(0); } }, T('shell.newhere.offer.start')),
        h('button', { type: 'button', class: 'nh-btn nh-quiet', 'data-k': 'no', onclick: function () { put(KEY, 'skipped'); removeOffer(); } }, T('shell.newhere.offer.no'))));
    offer.setAttribute('popover', 'manual'); document.body.append(offer);
    try { offer.showPopover(); } catch (e) { /* no popover support: it sits in the page */ }
  }
  // after the app has settled; never while the person is in the middle of something modal
  if (!/[?&]nonewhere\b/.test(location.search)) setTimeout(maybeOffer, 3500);

  window.cadcraftNewHere = { open: open, close: function () { close(null); } };
})();
