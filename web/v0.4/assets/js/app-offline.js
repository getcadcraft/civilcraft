/* SPDX-License-Identifier: Apache-2.0 */
/*
 * app-offline.js — "Save for offline" in the app bar (app-bar.inc [data-offline]).
 * Registers /sw.js, asks it whether this app (key "<area>/<slug>") is saved, and on a click hands
 * it every URL the app needs: the server's list (#cc-offline: build files, libraries, fonts,
 * shell modules — AppBuilds::offlineFiles) plus what this page's own tags load (stylesheets,
 * scripts, the import map, icons). States: Save for offline → Saving 40 of 212 → Offline ready
 * (click again: refresh or remove) / Could not save. No service worker (private windows, some
 * managed computers, plain http) → the button says offline saving is not available here.
 */
(function () {
  'use strict';
  var btn = document.querySelector('[data-offline]');
  var label = document.querySelector('[data-offline-label]');
  var dataEl = document.getElementById('cc-offline');
  if (!btn || !label || !dataEl) return;
  // The desktop app is already local, and a service worker can't register on the shell's own origin: no button there.
  if (window.cadcraftDesktop) { btn.hidden = true; return; }
  function T(k, v) { return window.ccShellT ? window.ccShellT(k, v) : k; }
  var data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var icon = btn.querySelector('.bi');
  var state = 'unknown';
  var savedAt = null;

  function set(s, text, title, iconName) {
    state = s;
    label.textContent = text;
    btn.title = title || '';
    btn.dataset.state = s;
    if (icon && iconName) icon.className = 'bi ' + iconName;
  }

  btn.hidden = false;
  if (!('serviceWorker' in navigator) || !window.caches) {
    set('unavailable', T('shell.offline.unavailable'), T('shell.offline.unavailable.title'), 'bi-cloud-slash');
    btn.disabled = true;
    return;
  }

  function pageUrls() {
    var out = [];
    document.querySelectorAll('link[rel~="stylesheet"][href], link[rel~="icon"][href], link[rel="apple-touch-icon"][href], script[src]').forEach(function (n) {
      out.push(n.getAttribute('href') || n.getAttribute('src'));
    });
    var map = document.querySelector('script[type="importmap"]');
    if (map) {
      try {
        var imports = JSON.parse(map.textContent).imports || {};
        Object.keys(imports).forEach(function (k) { if (!/\/$/.test(imports[k])) out.push(imports[k]); });
      } catch (e) {}
    }
    return out.map(function (u) {
      try { var x = new URL(u, location.href); return x.origin === location.origin ? x.pathname + x.search : null; } catch (e) { return null; }
    }).filter(Boolean);
  }

  var sw = null;
  function send(msg) {
    if (!sw) return;
    var ch = new MessageChannel();
    ch.port1.onmessage = function (e) { onReply(e.data || {}); };
    sw.postMessage(msg, [ch.port2]);
  }

  function savedText() {
    var when = savedAt ? new Date(savedAt) : null;
    if (!when) return T('shell.offline.saved');
    var loc = window.ccShellT ? window.ccShellT.locale() : undefined;
    var date, time;
    try { date = when.toLocaleDateString(loc); time = when.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' }); }
    catch (e) { date = when.toLocaleDateString(); time = when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    return T('shell.offline.saved_on', { date: date, time: time });
  }
  function readyText() { return savedText() + ' ' + T('shell.offline.ready.hint'); }
  /** "Keep this app … (about 7.5 MB) …" when the page says how big the copy is. */
  function saveTitle() {
    if (typeof data.bytes !== 'number' || !(data.bytes > 0)) return T('shell.offline.save.title');
    var loc = window.ccShellT ? window.ccShellT.locale() : undefined, mb = data.bytes / 1e6, size;
    try { size = new Intl.NumberFormat(loc, { style: 'unit', unit: 'megabyte', unitDisplay: 'short', maximumFractionDigits: mb < 10 ? 1 : 0 }).format(mb); }
    catch (e) { size = (Math.round(mb * 10) / 10) + ' MB'; }
    return T('shell.offline.save.title_size', { size: size });
  }

  function onReply(m) {
    if (m.key !== data.key) return;
    if (m.type === 'status') {
      savedAt = m.when;
      if (m.saved) set('ready', T('shell.offline.ready'), readyText(), 'bi-cloud-check');
      else set('idle', T('shell.offline.save'), saveTitle(), 'bi-cloud-arrow-down');
    } else if (m.type === 'progress') {
      set('saving', T('shell.offline.progress', { done: m.done, total: m.total }), T('shell.offline.saving.title'), 'bi-cloud-arrow-down');
    } else if (m.type === 'saved') {
      savedAt = new Date().toISOString();
      set('ready', T('shell.offline.ready'), readyText(), 'bi-cloud-check');
    } else if (m.type === 'failed') {
      set('failed', T('shell.offline.failed'), T('shell.offline.failed.title', { n: m.count }), 'bi-exclamation-triangle');
    } else if (m.type === 'removed') {
      savedAt = null;
      set('idle', T('shell.offline.save'), T('shell.offline.removed') + ' ' + saveTitle(), 'bi-cloud-arrow-down');
    }
  }

  function save() {
    if (!navigator.onLine) { set(state, label.textContent, T('shell.offline.needs_net')); return; }
    set('saving', T('shell.offline.saving'), T('shell.offline.saving.title'), 'bi-cloud-arrow-down');
    var urls = data.urls.concat(pageUrls());
    send({ type: 'save', key: data.key, page: data.page, urls: urls });
  }

  function menu() {
    // A small choice without a library: refresh or remove.
    var old = document.querySelector('.offline-menu');
    if (old) { old.remove(); return; }
    var box = document.createElement('div');
    box.className = 'offline-menu';
    box.setAttribute('role', 'menu');
    var p = document.createElement('p');
    p.textContent = savedText();
    var a = document.createElement('button');
    a.type = 'button'; a.setAttribute('role', 'menuitem'); a.textContent = T('shell.offline.menu.again');
    a.addEventListener('click', function () { box.remove(); save(); });
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'menuitem'); b.textContent = T('shell.offline.menu.remove');
    b.addEventListener('click', function () { box.remove(); send({ type: 'remove', key: data.key }); });
    box.append(p, a, b);
    var r = btn.getBoundingClientRect();
    box.style.top = Math.round(r.bottom + 6) + 'px';
    box.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + 'px';
    document.body.appendChild(box);
    a.focus();
    function away(e) {
      if (box.contains(e.target) || e.target === btn || btn.contains(e.target)) return;
      box.remove(); document.removeEventListener('pointerdown', away, true);
    }
    document.addEventListener('pointerdown', away, true);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); box.remove(); btn.focus(); } });
  }

  btn.addEventListener('click', function () {
    if (state === 'saving' || state === 'unavailable') return;
    if (state === 'ready') menu(); else save();
  });

  set('unknown', T('shell.offline.save'), T('shell.offline.checking'), 'bi-cloud-arrow-down');
  // The site's worker is /sw.js for the whole origin; the browser edition (static files in any folder) names its own,
  // folder-scoped worker in #cc-offline (sw, scope) and sends relative page/urls, which that worker resolves.
  var swUrl = new URL(data.sw || '/sw.js', location.href).href;
  var swScope = new URL(data.scope || '/', location.href).href;
  navigator.serviceWorker.register(swUrl, { scope: swScope }).then(function () {
    return navigator.serviceWorker.ready;
  }).then(function (reg) {
    sw = reg.active;
    send({ type: 'status', key: data.key });
  }).catch(function () {
    set('unavailable', T('shell.offline.unavailable'), T('shell.offline.unavailable.title'), 'bi-cloud-slash');
    btn.disabled = true;
  });

  window.addEventListener('offline', function () { btn.classList.add('is-offline'); });
  window.addEventListener('online', function () { btn.classList.remove('is-offline'); });
  if (!navigator.onLine) btn.classList.add('is-offline');
})();
