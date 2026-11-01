/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-propgrid.js — the shared property grid (0.7 PANEL-COMPACT item 4). Map: docs/apps/app-propgrid.md.
 * Loaded by app-shell.inc only for a build whose manifest says "propgrid": true (AppBuilds::propgrid); an app's Properties
 * panel (or any panel) hands it rows and gets changes back. The grid draws, the app decides what a change means.
 *
 *   var g = ccPropGrid.create(hostElement, {
 *     label: 'Properties',            // the group's accessible name
 *     key: 'properties',              // remembers collapsed categories, the sort and the divider (localStorage cc-propgrid:<app>:<key>)
 *     rows: [{ id, category, label, type, value, ... }],
 *     onChange: function (id, value, info) {},   // info.live is true while a slider is dragged
 *   });
 *
 * Row: id (unique), label, category (default "General"), type = text | number | checkbox | select | slider | color | readonly,
 * value, options [{value, label}] (select), min / max / step / unit (number, slider), maxLength (text), hint (tooltip),
 * readonly (shown, not editable), mixed (several objects disagree: shows "Varies" and takes no value until edited).
 * 0.8: a number row may carry parse(text) → { ok: true, value } | { ok: false, ... } (a function, not data: the app's own reader, e.g. DetailCraft's
 * arithmetic 2*450); the box is then text, the value is what parse returned (min / max still hold it), and a refusal marks the box
 * aria-invalid and calls create's onInvalid(id, result, text) so the app can say where it went wrong.
 * Everything an app passes in is data: it reaches the DOM by textContent / value only, never as markup.
 *
 * Sort by category (collapsible groups, in the order given) or A–Z (one flat list); a small filter box; Expand / Collapse all;
 * a draggable divider between the label and value columns (arrows, Home resets). Rows are rem-sized: Compact density
 * (html[data-cc-density="compact"]) makes them denser, touch keeps 2.75 rem targets.
 */
(function () {
  'use strict';
  var FALLBACK = {
    'shell.propgrid.category': 'By category', 'shell.propgrid.name': 'A to Z', 'shell.propgrid.expand': 'Expand all',
    'shell.propgrid.collapse': 'Collapse all', 'shell.propgrid.filter': 'Filter properties', 'shell.propgrid.filter.ph': 'Filter',
    'shell.propgrid.tools': 'Property grid tools', 'shell.propgrid.divider': 'Width of the property names', 'shell.propgrid.varies': 'Varies',
    'shell.propgrid.empty': 'Nothing to show.', 'shell.propgrid.none': 'No property matches.', 'shell.propgrid.default': 'General',
    'shell.propgrid.group': '{category}, {n} properties', 'shell.propgrid.number': '{label} (number)', 'shell.propgrid.slider': '{label} (slider)',
    'shell.propgrid.color': '{label} (colour)'
  };
  function T(k, v) {
    var r = window.ccShellT ? window.ccShellT(k, v) : k;
    if (r !== k && r != null) return r;
    r = FALLBACK[k] || k;
    if (v) Object.keys(v).forEach(function (n) { r = r.split('{' + n + '}').join(String(v[n])); });
    return r;
  }
  var SLUG = (function () { var d = document.querySelector('[data-app-settings]'); return (d && d.getAttribute('data-app')) || 'app'; })();
  var LABEL_MIN = 4, LABEL_DEFAULT = 9, uid = 0;
  var TYPES = ['text', 'number', 'checkbox', 'select', 'slider', 'color', 'readonly'];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function icon(name) { var i = el('i', 'bi bi-' + name); i.setAttribute('aria-hidden', 'true'); return i; }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fix(v, step) {   // no 0.30000000000000004 in a box
    var dec = String(step || 1).indexOf('.') === -1 ? 0 : String(step).split('.')[1].length;
    return Number(Number(v).toFixed(Math.min(dec + 2, 8)));
  }

  /** One row, checked: what an app (or a file it read) gave is never trusted to be well formed. */
  function cleanRow(r) {
    if (!r || typeof r !== 'object' || r.id == null) return null;
    var o = { id: String(r.id).slice(0, 120), label: String(r.label != null ? r.label : r.id).slice(0, 200), category: String(r.category || '').slice(0, 120),
      type: TYPES.indexOf(r.type) !== -1 ? r.type : 'text', hint: r.hint ? String(r.hint).slice(0, 400) : '', readonly: !!r.readonly, mixed: !!r.mixed };
    if (r.mixed) o.value = null;
    else if (o.type === 'checkbox') o.value = !!r.value;
    else if (o.type === 'number' || o.type === 'slider') o.value = r.value == null || r.value === '' ? null : num(r.value, null);
    else if (o.type === 'color') o.value = /^#[0-9a-f]{6}$/i.test(String(r.value)) ? String(r.value).toLowerCase() : '#000000';
    else o.value = r.value == null ? '' : String(r.value).slice(0, 4000);
    if (o.type === 'number' || o.type === 'slider') {
      o.min = r.min == null ? null : num(r.min, null); o.max = r.max == null ? null : num(r.max, null);
      o.step = r.step > 0 ? num(r.step, 1) : (o.type === 'slider' ? 1 : null);
      o.unit = r.unit ? String(r.unit).slice(0, 12) : '';
      if (o.type === 'number' && typeof r.parse === 'function') o.parse = r.parse;
      if (o.type === 'slider' && (o.min == null || o.max == null || o.max <= o.min)) { o.min = 0; o.max = 100; }
    }
    if (o.type === 'select') {
      o.options = (Array.isArray(r.options) ? r.options : []).slice(0, 500).map(function (x) {
        return x && typeof x === 'object' ? { value: String(x.value), label: String(x.label != null ? x.label : x.value).slice(0, 200) } : { value: String(x), label: String(x) };
      });
    }
    if (o.type === 'text') o.maxLength = r.maxLength > 0 ? Math.min(+r.maxLength, 4000) : 500;
    return o;
  }

  function create(host, opts) {
    opts = opts || {};
    var id = ++uid, storeKey = 'cc-propgrid:' + SLUG + ':' + (opts.key || 'default');
    var rows = [], saved = load(), filter = '', ctl = {};   // ctl: row id → {row, el(s), set(v)}
    var onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};
    var onInvalid = typeof opts.onInvalid === 'function' ? opts.onInvalid : function () {};

    function load() {
      var o = { collapsed: {}, sort: 'category', label: LABEL_DEFAULT };
      try {
        var v = JSON.parse(localStorage.getItem(storeKey) || 'null');
        if (v && typeof v === 'object') {
          if (v.sort === 'name') o.sort = 'name';
          if (typeof v.label === 'number' && isFinite(v.label)) o.label = clamp(v.label, LABEL_MIN, 40);
          if (v.collapsed && typeof v.collapsed === 'object') Object.keys(v.collapsed).forEach(function (k) { if (v.collapsed[k] === true) o.collapsed[k] = true; });
        }
      } catch (e) { /* private window: no memory */ }
      return o;
    }
    function save() {
      try {
        var def = saved.sort === 'category' && saved.label === LABEL_DEFAULT && !Object.keys(saved.collapsed).length;
        if (def) localStorage.removeItem(storeKey); else localStorage.setItem(storeKey, JSON.stringify(saved));
      } catch (e) { /* ignore */ }
    }

    /* ---- the frame ---- */
    var root = el('div', 'pg');
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', opts.label || 'Properties');
    var bar = el('div', 'pg-bar');
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', T('shell.propgrid.tools'));
    function tool(name, label, ic) {
      var b = el('button', 'pg-tool');
      b.type = 'button'; b.title = label; b.setAttribute('aria-label', label);
      b.appendChild(icon(ic));
      bar.appendChild(b);
      return b;
    }
    var bCat = tool('category', T('shell.propgrid.category'), 'list-nested'), bName = tool('name', T('shell.propgrid.name'), 'sort-alpha-down');
    bCat.setAttribute('aria-pressed', 'false'); bName.setAttribute('aria-pressed', 'false');
    var sep = el('span', 'pg-bar-sep'); sep.setAttribute('aria-hidden', 'true'); bar.appendChild(sep);
    var bExp = tool('expand', T('shell.propgrid.expand'), 'arrows-expand'), bCol = tool('collapse', T('shell.propgrid.collapse'), 'arrows-collapse');
    var fi = el('input', 'pg-filter');
    fi.type = 'search'; fi.placeholder = T('shell.propgrid.filter.ph'); fi.setAttribute('aria-label', T('shell.propgrid.filter')); fi.autocomplete = 'off';
    bar.appendChild(fi);
    var bodyEl = el('div', 'pg-body');
    var list = el('div', 'pg-list');
    var div = el('div', 'pg-divider');
    div.setAttribute('role', 'separator'); div.setAttribute('aria-orientation', 'vertical'); div.tabIndex = 0;
    div.setAttribute('aria-label', T('shell.propgrid.divider')); div.title = T('shell.propgrid.divider');
    bodyEl.append(list, div);
    root.append(bar, bodyEl);
    host.appendChild(root);

    function applyLabel() {
      root.style.setProperty('--pg-label', saved.label + 'rem');
      div.setAttribute('aria-valuenow', String(Math.round(saved.label * 10) / 10));
      div.setAttribute('aria-valuemin', String(LABEL_MIN));
    }
    applyLabel();

    /* ---- controls ---- */
    function emit(r, v, live) { try { onChange(r.id, v, { live: !!live }); } catch (e) { if (window.console) console.error(e); } }
    function control(r, cid) {
      var wrap = el('div', 'pg-value'), c = { row: r, wrap: wrap }, ro = r.readonly || r.type === 'readonly';
      var name = r.label;
      function field(tag) { var f = el(tag, 'pg-input'); f.id = cid; f.setAttribute('data-pg-row', r.id); return f; }   // data-pg-row: an app that rebuilds the grid puts focus back by row id
      if (r.type === 'readonly') {
        var sp = el('span', 'pg-ro', r.mixed ? T('shell.propgrid.varies') : String(r.value == null ? '' : r.value));
        sp.id = cid; sp.setAttribute('role', 'textbox'); sp.setAttribute('aria-readonly', 'true'); sp.tabIndex = 0; sp.title = sp.textContent;
        wrap.appendChild(sp);
        c.focusEl = sp;
        c.set = function (v) { sp.textContent = String(v == null ? '' : v); sp.title = sp.textContent; };
      } else if (r.type === 'checkbox') {
        var cb = field('input'); cb.type = 'checkbox'; cb.className = 'pg-check'; cb.checked = !!r.value; cb.indeterminate = r.mixed; cb.disabled = ro;
        cb.addEventListener('change', function () { cb.indeterminate = false; emit(r, cb.checked); });
        wrap.appendChild(cb); c.focusEl = cb;
        c.set = function (v) { cb.indeterminate = false; cb.checked = !!v; };
      } else if (r.type === 'select') {
        var se = field('select'); se.className = 'pg-input pg-select'; se.disabled = ro;
        if (r.mixed) { var o0 = el('option', '', T('shell.propgrid.varies')); o0.value = ''; o0.disabled = true; se.appendChild(o0); }
        r.options.forEach(function (x) { var o = el('option', '', x.label); o.value = x.value; se.appendChild(o); });
        se.value = r.mixed ? '' : String(r.value);
        se.addEventListener('change', function () { emit(r, se.value); });
        wrap.appendChild(se); c.focusEl = se;
        c.set = function (v) { se.value = String(v); };
      } else if (r.type === 'color') {
        var co = field('input'); co.type = 'color'; co.className = 'pg-input pg-color'; co.value = r.value; co.disabled = ro;
        co.setAttribute('aria-label', T('shell.propgrid.color', { label: name }));
        var tx = el('input', 'pg-input pg-colortext'); tx.type = 'text'; tx.value = r.mixed ? '' : r.value; tx.placeholder = r.mixed ? T('shell.propgrid.varies') : ''; tx.maxLength = 7; tx.disabled = ro;
        tx.setAttribute('aria-label', name); tx.spellcheck = false;
        co.addEventListener('input', function () { tx.value = co.value; emit(r, co.value, true); });
        co.addEventListener('change', function () { tx.value = co.value; emit(r, co.value); });
        tx.addEventListener('change', function () {
          var v = tx.value.trim(); if (v[0] !== '#') v = '#' + v;
          if (/^#[0-9a-f]{6}$/i.test(v)) { co.value = v.toLowerCase(); tx.value = co.value; emit(r, co.value); } else tx.value = co.value;
        });
        wrap.append(co, tx); c.focusEl = co;
        c.set = function (v) { if (/^#[0-9a-f]{6}$/i.test(String(v))) { co.value = String(v).toLowerCase(); tx.value = co.value; } };
      } else if (r.type === 'slider') {
        var sl = el('input', 'pg-range'); sl.type = 'range'; sl.min = r.min; sl.max = r.max; sl.step = r.step; sl.disabled = ro;
        sl.setAttribute('aria-label', T('shell.propgrid.slider', { label: name }));
        var nb = field('input'); nb.type = 'number'; nb.className = 'pg-input pg-num'; nb.min = r.min; nb.max = r.max; nb.step = r.step; nb.disabled = ro;
        nb.setAttribute('aria-label', T('shell.propgrid.number', { label: name }));
        var put = function (v) { if (v == null) { sl.value = r.min; nb.value = ''; } else { sl.value = v; nb.value = String(fix(v, r.step)); } };
        put(r.mixed ? null : r.value);
        if (r.mixed) nb.placeholder = T('shell.propgrid.varies');
        sl.addEventListener('input', function () { var v = fix(sl.value, r.step); nb.value = String(v); emit(r, v, true); });
        sl.addEventListener('change', function () { emit(r, fix(sl.value, r.step)); });
        nb.addEventListener('change', function () {
          var v = Number(nb.value);
          if (nb.value === '' || !isFinite(v)) { put(r.value); return; }
          v = fix(clamp(v, r.min, r.max), r.step); put(v); emit(r, v);
        });
        wrap.append(sl, nb);
        if (r.unit) wrap.appendChild(el('span', 'pg-unit', r.unit));
        c.focusEl = nb;
        c.set = function (v) { put(v == null ? null : num(v, r.min)); };
      } else if (r.type === 'number') {
        var ni = field('input'); ni.type = r.parse ? 'text' : 'number'; ni.className = 'pg-input pg-num'; ni.disabled = ro;
        if (r.parse) { ni.setAttribute('inputmode', 'decimal'); ni.autocomplete = 'off'; ni.spellcheck = false; }
        if (r.min != null) ni.min = r.min; if (r.max != null) ni.max = r.max; if (r.step) ni.step = r.step; else ni.step = 'any';
        ni.value = r.mixed || r.value == null ? '' : String(r.value);
        if (r.mixed) ni.placeholder = T('shell.propgrid.varies');
        ni.addEventListener('change', function () {
          var v;
          if (r.parse) {
            var pr = null;
            try { pr = ni.value.trim() === '' ? { ok: false, empty: true } : r.parse(ni.value); } catch (e) { pr = { ok: false }; }
            if (!pr || !pr.ok || !isFinite(pr.value)) { ni.setAttribute('aria-invalid', 'true'); try { onInvalid(r.id, pr, ni.value); } catch (e) { if (window.console) console.error(e); } return; }
            ni.removeAttribute('aria-invalid');
            v = Number(pr.value);
          } else {
            v = Number(ni.value);
            if (ni.value === '' || !isFinite(v)) { ni.value = r.value == null ? '' : String(r.value); return; }
          }
          if (r.min != null) v = Math.max(r.min, v);
          if (r.max != null) v = Math.min(r.max, v);
          ni.value = String(v); emit(r, v);
        });
        wrap.appendChild(ni);
        if (r.unit) wrap.appendChild(el('span', 'pg-unit', r.unit));
        c.focusEl = ni;
        c.set = function (v) { ni.value = v == null ? '' : String(v); };
      } else {
        var ti = field('input'); ti.type = 'text'; ti.maxLength = r.maxLength; ti.disabled = ro; ti.spellcheck = false;
        ti.value = r.mixed ? '' : r.value;
        if (r.mixed) ti.placeholder = T('shell.propgrid.varies');
        ti.addEventListener('change', function () { emit(r, ti.value); });
        wrap.appendChild(ti); c.focusEl = ti;
        c.set = function (v) { ti.value = v == null ? '' : String(v); };
      }
      return c;
    }

    /* ---- build ---- */
    function matches(r) { return !filter || (r.label + ' ' + r.category).toLowerCase().indexOf(filter) !== -1; }
    function build() {
      var focusId = null, a = document.activeElement;
      if (a && list.contains(a)) { var rw = a.closest('[data-pg-id]'); if (rw) focusId = rw.getAttribute('data-pg-id'); }
      list.textContent = '';
      ctl = {};
      var shown = rows.filter(matches);
      bCat.setAttribute('aria-pressed', saved.sort === 'category' ? 'true' : 'false');
      bName.setAttribute('aria-pressed', saved.sort === 'name' ? 'true' : 'false');
      root.setAttribute('data-pg-sort', saved.sort);
      bExp.hidden = bCol.hidden = saved.sort !== 'category';
      sep.hidden = saved.sort !== 'category';
      if (!rows.length) { list.appendChild(el('p', 'pg-empty', T('shell.propgrid.empty'))); return; }
      if (!shown.length) { list.appendChild(el('p', 'pg-empty', T('shell.propgrid.none'))); return; }
      function addRow(parent, r) {
        var cid = 'pg' + id + '-' + (++uid), row = el('div', 'pg-row'), lb = el('label', 'pg-label', r.label);
        row.setAttribute('data-pg-id', r.id); row.setAttribute('data-pg-type', r.type);
        lb.htmlFor = cid; lb.title = r.hint || r.label;
        var c = control(r, cid);
        row.append(lb, c.wrap);
        parent.appendChild(row);
        ctl[r.id] = c;
      }
      if (saved.sort === 'name') {
        var flat = el('div', 'pg-rows'); flat.setAttribute('role', 'group');
        shown.slice().sort(function (x, y) { return x.label.localeCompare(y.label, undefined, { numeric: true, sensitivity: 'base' }); }).forEach(function (r) { addRow(flat, r); });
        list.appendChild(flat);
      } else {
        var cats = [], by = {};
        shown.forEach(function (r) { var k = r.category || T('shell.propgrid.default'); if (!by[k]) { by[k] = []; cats.push(k); } by[k].push(r); });
        cats.forEach(function (k, i) {
          var open = !!filter || !saved.collapsed[k], sec = el('section', 'pg-cat'), h = el('h3', 'pg-cat-h'), b = el('button', 'pg-cat-b');
          var rid = 'pg' + id + '-c' + i;
          b.type = 'button'; b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-controls', rid); b.setAttribute('data-pg-cat', k);
          b.setAttribute('aria-label', T('shell.propgrid.group', { category: k, n: by[k].length }));
          b.append(icon(open ? 'chevron-down' : 'chevron-right'), el('span', 'pg-cat-n', k), el('span', 'pg-cat-c', String(by[k].length)));
          var rs = el('div', 'pg-rows'); rs.id = rid; rs.setAttribute('role', 'group'); rs.setAttribute('aria-label', k); rs.hidden = !open;
          b.addEventListener('click', function () { toggle(k, !(saved.collapsed[k] !== true)); });
          b.addEventListener('keydown', function (e) {
            var hs = [].slice.call(list.querySelectorAll('.pg-cat-b')), j = hs.indexOf(b);
            if (e.key === 'ArrowDown' && hs[j + 1]) hs[j + 1].focus();
            else if (e.key === 'ArrowUp' && hs[j - 1]) hs[j - 1].focus();
            else if (e.key === 'ArrowRight' && b.getAttribute('aria-expanded') === 'false') toggle(k, false, true);
            else if (e.key === 'ArrowLeft' && b.getAttribute('aria-expanded') === 'true') toggle(k, true, true);
            else if (e.key === 'Home') hs[0].focus();
            else if (e.key === 'End') hs[hs.length - 1].focus();
            else return;
            e.preventDefault(); e.stopPropagation();   // the apps pan with arrow keys
          });
          h.appendChild(b); sec.append(h, rs);
          by[k].forEach(function (r) { addRow(rs, r); });
          list.appendChild(sec);
        });
      }
      if (focusId && ctl[focusId]) ctl[focusId].focusEl.focus();
    }
    function toggle(cat, collapse, keepFocus) {
      if (collapse) saved.collapsed[cat] = true; else delete saved.collapsed[cat];
      save(); build();
      { var b = list.querySelector('.pg-cat-b[data-pg-cat="' + (window.CSS && CSS.escape ? CSS.escape(cat) : cat.replace(/"/g, '\\"')) + '"]'); if (b) b.focus(); }
    }

    /* ---- the toolbar ---- */
    bCat.addEventListener('click', function () { saved.sort = 'category'; save(); build(); });
    bName.addEventListener('click', function () { saved.sort = 'name'; save(); build(); });
    bExp.addEventListener('click', function () { saved.collapsed = {}; save(); build(); });
    bCol.addEventListener('click', function () { rows.forEach(function (r) { saved.collapsed[r.category || T('shell.propgrid.default')] = true; }); save(); build(); });
    fi.addEventListener('input', function () { filter = fi.value.trim().toLowerCase(); build(); });
    fi.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fi.value) { fi.value = ''; filter = ''; build(); e.stopPropagation(); e.preventDefault(); } });
    [bCat, bName, bExp, bCol].forEach(function (b) { b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); b.click(); } }); });

    /* ---- the divider ---- */
    var drag = null;
    div.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault(); div.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, w: saved.label, rem: parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 };
    });
    div.addEventListener('pointermove', function (e) {
      if (!drag || !div.hasPointerCapture(e.pointerId)) return;
      saved.label = clamp(drag.w + (e.clientX - drag.x) / drag.rem, LABEL_MIN, Math.max(LABEL_MIN, bodyEl.clientWidth / drag.rem - 5));
      applyLabel();
    });
    function endDrag(e) { if (!drag) return; drag = null; try { div.releasePointerCapture(e.pointerId); } catch (x) { /* ignore */ } saved.label = Math.round(saved.label * 4) / 4; applyLabel(); save(); }
    div.addEventListener('pointerup', endDrag); div.addEventListener('pointercancel', endDrag);
    div.addEventListener('dblclick', function () { saved.label = LABEL_DEFAULT; applyLabel(); save(); });
    div.addEventListener('keydown', function (e) {
      var d = 0, step = e.shiftKey ? 2 : 0.5;
      if (e.key === 'ArrowLeft') d = -step; else if (e.key === 'ArrowRight') d = step;
      else if (e.key === 'Home') { saved.label = LABEL_DEFAULT; applyLabel(); save(); e.preventDefault(); e.stopPropagation(); return; } else return;
      e.preventDefault(); e.stopPropagation();
      saved.label = clamp(saved.label + d, LABEL_MIN, Math.max(LABEL_MIN, bodyEl.clientWidth / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) - 5));
      applyLabel(); save();
    });

    /* ---- the object ---- */
    function setRows(next) {
      var seen = {};
      rows = (Array.isArray(next) ? next : []).map(cleanRow).filter(function (r) { if (!r || seen[r.id]) return false; seen[r.id] = 1; return true; }).slice(0, 2000);
      build();
    }
    setRows(opts.rows);
    return {
      el: root,
      setRows: setRows,
      rows: function () { return rows.map(function (r) { return { id: r.id, label: r.label, category: r.category, type: r.type, value: r.value }; }); },
      /** Update one value without a rebuild (not while the person is typing in it). */
      setValue: function (rid, v) {
        var c = ctl[rid];
        for (var k = 0; k < rows.length; k++) if (rows[k].id === rid) { rows[k].value = v; rows[k].mixed = false; }
        if (c && document.activeElement !== c.focusEl) c.set(v);
      },
      getValue: function (rid) { for (var k = 0; k < rows.length; k++) if (rows[k].id === rid) return rows[k].value; return undefined; },
      sort: function (m) { if (m === 'category' || m === 'name') { saved.sort = m; save(); build(); } return saved.sort; },
      expandAll: function () { saved.collapsed = {}; save(); build(); },
      collapseAll: function () { rows.forEach(function (r) { saved.collapsed[r.category || T('shell.propgrid.default')] = true; }); save(); build(); },
      focus: function (rid) { if (ctl[rid]) { ctl[rid].focusEl.focus(); return true; } return false; },
      destroy: function () { root.remove(); }
    };
  }

  window.ccPropGrid = { create: create, version: 1 };
})();
