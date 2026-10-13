/* SPDX-License-Identifier: Apache-2.0 */
/* CadCraft — progressive enhancement only. Every page works without this file. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---- Paper / model space toggle: instant switch, remembered in localStorage + cookie ---- */
  function setSpace(s) {
    root.setAttribute('data-space', s);
    try { localStorage.setItem('cc-space', s); } catch (e) {}
    try { document.cookie = 'cc_space=' + s + ';path=/;max-age=31536000;samesite=lax;secure'; } catch (e) {}
    syncToggle();
  }
  function syncToggle() {
    var s = root.getAttribute('data-space');
    document.querySelectorAll('.space-toggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.value === s ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.space-toggle').forEach(function (f) {
    f.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[name="space"]');
      if (!b) return;
      ev.preventDefault();
      setSpace(b.value);
    });
  });
  syncToggle();

  /* ---- <details> menus: close on outside click and on Escape ---- */
  var menus = document.querySelectorAll('details.nav-dd, details.nav-mobile, details.app-bar-ver');
  document.addEventListener('click', function (ev) {
    menus.forEach(function (d) { if (d.open && !d.contains(ev.target)) d.open = false; });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    menus.forEach(function (d) {
      if (d.open) { d.open = false; var s = d.querySelector('summary'); if (s) s.focus(); }
    });
  });

  /* ---- Hero crosshair: fine pointers only. Plan units: 10 = 1 ft; origin = grid A / 4 ---- */
  var wrap = document.getElementById('hero-plan');
  if (wrap && window.matchMedia && matchMedia('(pointer: fine)').matches) {
    var svg = wrap.querySelector('svg');
    var h = document.getElementById('xh-h'), v = document.getElementById('xh-v'), box = document.getElementById('xh-box');
    var ox = document.getElementById('cc-x'), oy = document.getElementById('cc-y');
    if (svg && h && v && box && svg.createSVGPoint) {
      wrap.classList.add('xhair-on');
      var pt = svg.createSVGPoint(), raf = 0, last = null;
      var fmt = function (units) {
        var ft = units / 10, neg = ft < 0; ft = Math.abs(ft);
        var whole = Math.floor(ft), inches = Math.round((ft - whole) * 12);
        if (inches === 12) { whole += 1; inches = 0; }
        return (neg ? '-' : '') + whole + "'-" + inches + '"';
      };
      var draw = function () {
        raf = 0;
        if (!last) return;
        var m = svg.getScreenCTM();
        if (!m) return;
        pt.x = last.clientX; pt.y = last.clientY;
        var p = pt.matrixTransform(m.inverse());
        var x = Math.round(p.x), y = Math.round(p.y);
        h.setAttribute('y1', y); h.setAttribute('y2', y);
        v.setAttribute('x1', x); v.setAttribute('x2', x);
        box.setAttribute('x', x - 6); box.setAttribute('y', y - 6);
        if (ox) ox.textContent = fmt(x - 150);
        if (oy) oy.textContent = fmt(470 - y);
      };
      wrap.addEventListener('pointermove', function (ev) {
        if (ev.pointerType && ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return;
        last = ev; wrap.classList.add('is-hovering');
        if (!raf) raf = requestAnimationFrame(draw);
      });
      wrap.addEventListener('pointerleave', function () { wrap.classList.remove('is-hovering'); });
    }
  }
})();
