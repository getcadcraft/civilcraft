/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-table-ui.js — the attribute table of a GIS layer (0.9 SU.1080 round 2), the thin adapter over gis-table-run.js. gis-ui.js installs
 * it: install(host). Command 'gis-table' (typed ATTRIBUTES, ATTTABLE or TABLE; also "Attribute table" in a layer's menu) opens a
 * non-modal dialog (the plan stays usable) with the table of one layer: sortable columns, a filter (an expression, else words),
 * selection both ways with the plan (click a row / click a feature on the plan), cell edits with undo, add / rename / remove fields,
 * the field calculator and a CSV export. Only the rows in view are in the page (a few thousand features do not slow it down).
 * Text only goes in through textContent (layer names and values are untrusted).
 * host.table = { open(layerId), layer, rows (the shown row numbers), selection, filter(text), sort(field, dir), edit, last } for tests.
 */

import { gisOf, layerOf, featuresOf, layerBounds } from './gis-layers.js';
import * as R from './gis-table-run.js';
import { filterIndices, sortIndices } from './gis-table.js';
import { measureFeature } from './gis-analysis.js';
import { t } from './i18n.js';

const ROW_H = 28, BUFFER = 8, TYPES = ['text', 'number', 'date', 'bool'];

export async function install(host) {
  const { reg, el } = host;
  const P = () => host.project;
  const api = { layer: null, rows: [], selection: [], sort: { field: '', dir: 'asc' }, filterText: '', mode: 'all', last: null, open: null };
  let uid = 0, dlg = null, sel = new Set(), anchor = -1, editing = null, raf = 0, refs = null;
  const fmt = (v) => (v === null || v === undefined || v === '' ? '' : typeof v === 'boolean' ? (v ? t('gis.label.yes') : t('gis.label.no')) : typeof v === 'number' ? String(+v.toFixed(6)) : String(v));
  const L = () => (api.layer ? layerOf(P(), api.layer) : null);
  const eng = () => R.tableLayer(P(), api.layer);

  // ---------------------------------------------------------------------------------------------- selection (shared with the plan)
  function publish(refresh = true) {
    api.selection = [...sel].sort((a, b) => a - b);
    if (host.analysis) host.analysis.selection = { layer: api.selection.length ? api.layer : null, indices: api.selection };   // drawn by the analysis overlay
    if (refresh) host.refresh(); else host.view?.invalidate();
  }
  // the rows in the page stay as they are when the selection changes (a double-click needs the same cell under both clicks)
  function markRows() { if (!refs) return; for (const tr of refs.body.querySelectorAll('tr[data-i]')) { const on = sel.has(Number(tr.dataset.i)); tr.classList.toggle('is-sel', on); tr.setAttribute('aria-selected', String(on)); } }
  function setSel(indices, { refresh = true } = {}) { sel = new Set(indices); publish(refresh); markRows(); status(); }
  reg.onProject.push(() => { sel = new Set(); anchor = -1; if (dlg) { api.layer = gisOf(P()).layers[0]?.id || null; rebuildAll(); } });
  // a feature picked on the plan selects its row here (and scrolls to it)
  let planKey = '';   // the plan's own selection, so only a NEW pick on the plan changes the table's selection
  (reg.props ||= []).unshift((s) => {
    const key = s?.kind === 'gis' ? s.layer + ':' + s.i : '';
    const fresh = key !== planKey; planKey = key;
    if (fresh && dlg && s?.kind === 'gis' && s.layer === api.layer && !(sel.size === 1 && sel.has(s.i))) {
      sel = new Set([s.i]); anchor = s.i; publish(false); scrollToRow(s.i); paintRows(); markRows(); status();
    }
    return false;
  });

  // ---------------------------------------------------------------------------------------------- the rows in view
  function recompute() {
    const l = eng();
    if (!l) { api.rows = []; return; }
    const f = filterIndices(l, api.filterText);
    api.mode = f.mode;
    api.rows = api.sort.field ? sortIndices(l, api.sort.field, api.sort.dir, f.indices) : f.indices;
  }
  function status() {
    if (!refs) return;
    const l = L(), total = l ? featuresOf(P(), l.id).length : 0;
    refs.count.textContent = t('gist.count', { shown: api.rows.length, total, selected: sel.size }) + (api.mode === 'value' ? ' ' + t('gist.mode.value') : '');
    const m = l && sel.size ? sumOf(l) : '';
    refs.sum.textContent = m;
  }
  function sumOf(l) {
    const fs = featuresOf(P(), l.id);
    let area = 0, len = 0;
    for (const i of sel) { const m = measureFeature(fs[i]?.g); area += m.area || 0; len += m.length || 0; }
    return l.geom === 'pg' ? t('gist.sum.pg', { area: Number(area.toFixed(2)).toLocaleString('en-US'), unit: P().state.units }) : l.geom === 'ln' ? t('gist.sum.ln', { length: Number(len.toFixed(2)).toLocaleString('en-US'), unit: P().state.units }) : '';
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paintRows(); }); }
  function paintRows() {
    if (!refs || !L()) return;
    const l = L(), fs = featuresOf(P(), l.id), box = refs.scroll;
    const n = api.rows.length, h = box.clientHeight || 300;
    const first = Math.max(0, Math.floor(box.scrollTop / ROW_H) - BUFFER), last = Math.min(n, Math.ceil((box.scrollTop + h) / ROW_H) + BUFFER);
    refs.top.style.height = first * ROW_H + 'px';
    refs.bot.style.height = Math.max(0, n - last) * ROW_H + 'px';
    refs.table.setAttribute('aria-rowcount', String(n + 1));
    const rows = [];
    for (let k = first; k < last; k++) {
      const i = api.rows[k], f = fs[i];
      if (!f) continue;
      const tr = el('tr', { dataset: { i: String(i) }, 'aria-rowindex': String(k + 2), 'aria-selected': String(sel.has(i)), className: sel.has(i) ? 'is-sel' : '' },
        el('th', { scope: 'row', className: 'num cv-gist-n' }, String(i + 1)),
        ...l.fields.map((fl) => {
          const td = el('td', { className: fl.type === 'number' ? 'num' : '', tabIndex: -1, dataset: { f: fl.name }, title: fmt(f.p?.[fl.name]) }, fmt(f.p?.[fl.name]));
          return td;
        }));
      rows.push(tr);
    }
    refs.body.replaceChildren(refs.top, ...rows, refs.bot);
    if (editing) startEdit(editing.i, editing.f, editing.text, true);
  }
  function scrollToRow(i) {
    const k = api.rows.indexOf(i);
    if (k < 0 || !refs) return;
    const box = refs.scroll, y = k * ROW_H;
    if (y < box.scrollTop || y > box.scrollTop + box.clientHeight - ROW_H * 2) box.scrollTop = Math.max(0, y - box.clientHeight / 2);
  }

  // ---------------------------------------------------------------------------------------------- editing
  function startEdit(i, field, text = null, resume = false) {
    const td = refs.body.querySelector(`tr[data-i="${i}"] td[data-f="${CSS.escape(field)}"]`);
    if (!td) { if (!resume) editing = null; return; }
    const fl = L().fields.find((x) => x.name === field), cur = featuresOf(P(), api.layer)[i]?.p?.[field];
    const inp = el('input', { type: 'text', className: 'cv-input cv-gist-edit', value: text ?? (cur === null || cur === undefined ? '' : String(cur)), 'aria-label': t('gist.edit.label', { field, row: i + 1 }), inputMode: fl.type === 'number' ? 'decimal' : 'text', placeholder: fl.type === 'date' ? t('gist.date.ph') : '' });
    editing = { i, f: field, text: inp.value };
    td.replaceChildren(inp);
    inp.focus(); if (!resume) inp.select();
    let done = false;
    const finish = (commit) => {
      if (done) return; done = true;
      const val = inp.value; editing = null;
      if (!commit) { paintRows(); return; }
      const r = R.editCell(P(), api.layer, i, field, val);
      api.last = r;
      if (!r.ok) { say(R.describe(r.error), true); paintRows(); return; }
      say('', false);
    };
    inp.addEventListener('input', () => { editing.text = inp.value; });
    inp.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); finish(true); focusCell(i, field, 1, 0); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); focusCell(i, field, 0, 0); }
      else if (e.key === 'Tab') { finish(true); }
    });
    inp.addEventListener('blur', () => finish(true));
  }
  function focusCell(i, field, dRow, dCol) {
    const l = L(); if (!l) return;
    const k = api.rows.indexOf(i), c = l.fields.findIndex((x) => x.name === field);
    const nk = Math.max(0, Math.min(api.rows.length - 1, k + dRow)), nc = Math.max(0, Math.min(l.fields.length - 1, c + dCol));
    if (k < 0 || c < 0) return;
    const ni = api.rows[nk], nf = l.fields[nc].name;
    scrollToRow(ni); paintRows();
    refs.body.querySelector(`tr[data-i="${ni}"] td[data-f="${CSS.escape(nf)}"]`)?.focus();
  }
  function say(msg, bad) { if (!refs) return; refs.msg.textContent = msg; refs.msg.classList.toggle('cv-gisa-err', !!bad); }

  // ---------------------------------------------------------------------------------------------- the panel
  const btn = (label, fn, attrs = {}) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: fn, ...attrs }, label);
  const fieldOpts = (l, type = null) => (l ? l.fields.filter((f) => !type || f.type === type).map((f) => el('option', { value: f.name }, f.name)) : []);
  const typeSel = (id) => { const s = el('select', { className: 'cv-select', id, 'aria-label': t('gist.type') }, ...TYPES.map((x) => el('option', { value: x }, t('gist.type.' + x)))); return s; };

  function buildTable() {
    const l = L();
    const head = el('tr', {}, el('th', { scope: 'col', className: 'cv-gist-n' }, '#'), ...(l ? l.fields.map((f) => {
      const on = api.sort.field === f.name;
      const b = el('button', { type: 'button', className: 'cv-gist-sort', dataset: { sort: f.name }, onclick: () => sortBy(f.name) }, f.name, el('small', { className: 'cv-gist-type' }, ' ' + t('gist.type.' + f.type)), el('i', { className: 'bi ' + (on ? (api.sort.dir === 'asc' ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up'), 'aria-hidden': 'true' }));
      return el('th', { scope: 'col', 'aria-sort': on ? (api.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none' }, b);
    }) : []));
    const top = el('tr', { className: 'cv-gist-pad', 'aria-hidden': 'true' }, el('td', { colSpan: (l?.fields.length || 0) + 1 }));
    const bot = el('tr', { className: 'cv-gist-pad', 'aria-hidden': 'true' }, el('td', { colSpan: (l?.fields.length || 0) + 1 }));
    const body = el('tbody', {}, top, bot);
    const table = el('table', { className: 'cv-table cv-gist', role: 'grid', 'aria-label': t('gist.table', { layer: l?.name ?? '' }), 'aria-rowcount': '1', 'data-gist-table': '' }, el('thead', {}, head), body);
    const scroll = el('div', { className: 'cv-gist-scroll', 'data-gist-scroll': '', tabIndex: 0, 'aria-label': t('gist.scroll') }, table);
    scroll.addEventListener('scroll', schedule);
    body.addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-i]'); if (!tr || e.target.closest('input')) return;
      const i = Number(tr.dataset.i), k = api.rows.indexOf(i);
      if (e.shiftKey && anchor >= 0) { const a = api.rows.indexOf(anchor); const [x, y] = a < k ? [a, k] : [k, a]; setSel(new Set([...(e.ctrlKey || e.metaKey ? sel : []), ...api.rows.slice(x, y + 1)])); return; }
      if (e.ctrlKey || e.metaKey) { const n = new Set(sel); if (n.has(i)) n.delete(i); else n.add(i); anchor = i; setSel(n); return; }
      anchor = i; setSel([i]);
      const td = e.target.closest('td'); if (td) td.focus();
    });
    body.addEventListener('dblclick', (e) => { const td = e.target.closest('td[data-f]'); const tr = td?.closest('tr[data-i]'); if (td && tr && !e.target.closest('input')) startEdit(Number(tr.dataset.i), td.dataset.f); });
    body.addEventListener('keydown', (e) => {
      const td = e.target.closest?.('td[data-f]'); if (!td || e.target.tagName === 'INPUT') return;
      const i = Number(td.closest('tr').dataset.i), f = td.dataset.f;
      const mv = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1] }[e.key];
      if (mv) { e.preventDefault(); focusCell(i, f, mv[0], mv[1]); }
      else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(i, f); }
      else if (e.key === ' ') { e.preventDefault(); const n = new Set(sel); if (n.has(i)) n.delete(i); else n.add(i); anchor = i; setSel(n); }
    });
    return { scroll, table, body, top, bot };
  }

  function sortBy(field) {
    api.sort = api.sort.field === field ? (api.sort.dir === 'asc' ? { field, dir: 'desc' } : { field: '', dir: 'asc' }) : { field, dir: 'asc' };
    rebuildAll(); refs.scroll.scrollTop = 0; refs.scroll.querySelector(`[data-sort="${CSS.escape(field)}"]`)?.focus();
  }

  function rebuildAll() {
    if (!dlg) return;
    const l = L();
    refs.layerSel.replaceChildren(...gisOf(P()).layers.map((x) => el('option', { value: x.id }, t('gist.layer.opt', { layer: x.name, count: featuresOf(P(), x.id).length }))));
    if (l) refs.layerSel.value = l.id;
    refs.empty.hidden = !!l;
    refs.main.hidden = !l;
    if (!l) return;
    const keep = refs.scroll?.scrollTop || 0;
    const tb = buildTable();
    refs.scrollHost.replaceChildren(tb.scroll);
    Object.assign(refs, { scroll: tb.scroll, table: tb.table, body: tb.body, top: tb.top, bot: tb.bot });
    recompute();
    sel = new Set([...sel].filter((i) => i < featuresOf(P(), l.id).length));
    tb.scroll.scrollTop = keep;
    for (const s of [refs.fieldSel, refs.renSel, refs.calcTarget]) { const k = s.value; s.replaceChildren(...(s === refs.calcTarget ? [el('option', { value: '' }, t('gist.calc.new'))] : []), ...fieldOpts(l)); if ([...s.options].some((o) => o.value === k)) s.value = k; }
    refs.calcNew.hidden = refs.calcTarget.value !== '';
    paintRows(); status();
    publish(false);
  }

  function buildPanel() {
    const id = 'cv-gist-h-' + (++uid);
    const layerSel = el('select', { className: 'cv-select', id: id + '-l', 'aria-label': t('gisa.layer'), 'data-gist-layer': '' });
    layerSel.addEventListener('change', () => { api.layer = layerSel.value; sel = new Set(); anchor = -1; api.sort = { field: '', dir: 'asc' }; api.filterText = ''; refs.filter.value = ''; rebuildAll(); publish(); });
    let ft = 0;
    const filter = el('input', { type: 'text', className: 'cv-input', id: id + '-f', placeholder: t('gist.filter.ph'), 'aria-label': t('gist.filter'), spellcheck: false, 'data-gist-filter': '' });
    filter.addEventListener('input', () => { clearTimeout(ft); ft = setTimeout(() => { if (!refs) return; api.filterText = filter.value; recompute(); refs.scroll.scrollTop = 0; paintRows(); status(); }, 150); });
    const count = el('p', { className: 'cv-note', role: 'status', 'data-gist-count': '' }), sum = el('p', { className: 'cv-note', 'data-gist-sum': '' }), msg = el('p', { className: 'cv-note', role: 'status', 'data-gist-msg': '' });
    const scrollHost = el('div', { className: 'cv-gist-host' });

    // fields
    const nm = el('input', { type: 'text', className: 'cv-input', id: id + '-an', placeholder: t('gist.field.name'), 'aria-label': t('gist.field.name'), maxLength: 64, 'data-gist-newname': '' }), ty = typeSel(id + '-at');
    const addB = btn(t('gist.field.add'), () => { const r = R.addField(P(), api.layer, nm.value, ty.value); api.last = r; say(r.ok ? t('gist.field.added', { field: r.name }) : R.describe(r.error), !r.ok); if (r.ok) nm.value = ''; }, { 'data-gist-add': '' });
    const renSel = el('select', { className: 'cv-select', id: id + '-rs', 'aria-label': t('gist.field.pick') }), rn = el('input', { type: 'text', className: 'cv-input', id: id + '-rn', placeholder: t('gist.field.newname'), 'aria-label': t('gist.field.newname'), maxLength: 64, 'data-gist-renamed': '' });
    const renB = btn(t('gist.field.rename'), () => { const r = R.renameField(P(), api.layer, renSel.value, rn.value); api.last = r; say(r.ok ? t('gist.field.renamed', { field: r.name }) : R.describe(r.error), !r.ok); if (r.ok) rn.value = ''; }, { 'data-gist-rename': '' });
    const fieldSel = el('select', { className: 'cv-select', id: id + '-ds', 'aria-label': t('gist.field.pick') });
    const delB = btn(t('gist.field.remove'), () => { if (!fieldSel.value) return; const r = R.removeField(P(), api.layer, fieldSel.value); api.last = r; say(r.ok ? t('gist.field.removed') : R.describe(r.error), !r.ok); }, { 'data-gist-remove': '' });
    const fields = el('details', { className: 'cv-gist-sec' }, el('summary', {}, t('gist.fields')),
      el('div', { className: 'cv-gist-row' }, nm, ty, addB), el('div', { className: 'cv-gist-row' }, renSel, rn, renB), el('div', { className: 'cv-gist-row' }, fieldSel, delB));

    // calculator
    const calcTarget = el('select', { className: 'cv-select', id: id + '-ct', 'aria-label': t('gist.calc.target'), 'data-gist-target': '' });
    const cn = el('input', { type: 'text', className: 'cv-input', id: id + '-cn', placeholder: t('gist.field.name'), 'aria-label': t('gist.field.name'), maxLength: 64, 'data-gist-calcname': '' }), ct = typeSel(id + '-cty');
    const calcNew = el('span', { className: 'cv-gist-row-inline' }, cn, ct);
    calcTarget.addEventListener('change', () => { calcNew.hidden = calcTarget.value !== ''; });
    const expr = el('textarea', { className: 'cv-input', id: id + '-ex', rows: 2, spellcheck: false, placeholder: t('gist.calc.ph'), 'aria-label': t('gist.calc.expr'), 'data-gist-expr': '' });
    const only = el('input', { type: 'checkbox', id: id + '-os', 'data-gist-only': '' });
    const run = btn(t('gist.calc.run'), () => {
      const o = { indices: only.checked ? api.selection : null, create: calcTarget.value ? null : { name: cn.value, type: ct.value } };
      if (only.checked && !api.selection.length) { say(t('gisa.err.empty.sel'), true); return; }
      const r = R.calc(P(), api.layer, calcTarget.value, expr.value, o); api.last = r;
      say(r.ok ? t('gist.calc.done', { count: r.changed, field: r.target }) + (r.nulls ? ' ' + t('gist.calc.nulls', { n: r.nulls }) : '') : R.describe(r.error), !r.ok);
    }, { 'data-gist-calc': '' });
    const calc = el('details', { className: 'cv-gist-sec' }, el('summary', {}, t('gist.calc')),
      el('p', { className: 'cv-note' }, t('gist.calc.lead')),
      el('div', { className: 'cv-gist-row' }, el('label', { for: id + '-ct' }, t('gist.calc.target')), calcTarget, calcNew),
      expr, el('p', { className: 'cv-note' }, t('gist.calc.funcs')),
      el('div', { className: 'cv-gist-row' }, el('label', { className: 'cv-check', for: id + '-os' }, only, ' ' + t('gist.calc.only')), run));

    const bar = el('div', { className: 'cv-actions' },
      btn(t('gist.sel.shown'), () => { setSel(api.rows); }, { 'data-gist-selall': '' }),
      btn(t('gist.sel.invert'), () => { const n = new Set(); for (const i of api.rows) if (!sel.has(i)) n.add(i); setSel(n); }),
      btn(t('gisa.select.clear'), () => { anchor = -1; setSel([]); }, { 'data-gist-clear': '' }),
      btn(t('gisa.select.zoom'), () => { const fs = featuresOf(P(), api.layer); const b = layerBounds([...sel].map((i) => fs[i]).filter(Boolean)); if (b && Number.isFinite(b.minX)) { const pad = Math.max(b.maxX - b.minX, b.maxY - b.minY, 10) * 0.15; host.view.fit({ minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad }); } }, { 'data-gist-zoom': '' }),
      btn(t('gisa.select.make'), () => { if (!sel.size) { say(t('gisa.err.empty.sel'), true); return; } import('./gis-analysis-run.js').then((A) => { const r = A.fromSelection(P(), api.layer, api.selection); api.last = r; say(r.ok ? t('gisa.done', { layer: layerOf(P(), r.id)?.name ?? '', count: r.count }) : A.describe(r.error), !r.ok); }); }, { 'data-gist-make': '' }));

    const main = el('div', { className: 'cv-gist-main' },
      el('div', { className: 'cv-gist-row' }, filter, el('a', { href: '#', className: 'cv-gist-hint', onclick: (e) => { e.preventDefault(); window.cadcraftHelp?.open('gis-table'); } }, t('gist.filter.help'))),
      count, bar, sum, scrollHost, msg, fields, calc);
    const empty = el('p', { className: 'cv-note', 'data-gist-empty': '' }, t('gist.none'));
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('vec.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const csv = btn(t('gist.csv'), () => { const bytes = new TextEncoder().encode('﻿' + R.csv(P(), api.layer, api.rows)); host.download(bytes, (L()?.name || 'layer').replace(/[^\w.-]+/g, '_') + '.csv', 'text/csv'); say(t('gist.csv.done', { count: api.rows.length }), false); }, { 'data-gist-csv': '' });
    const undo = btn(t('gisa.undo'), () => { P().undo(); }, { 'data-gist-undo': '' }), redo = btn(t('gist.redo'), () => { P().redo(); }, { 'data-gist-redo': '' });
    const help = el('a', { className: 'btn-line btn-sm-cc', href: '#', 'data-gist-help': '', onclick: (e) => { e.preventDefault(); window.cadcraftHelp?.open('gis-table'); } }, t('gisa.help'));
    dlg = el('dialog', { className: 'cv-dialog cv-gisv cv-gist-dlg', 'aria-labelledby': id, 'data-gist': '' },
      el('div', { className: 'cv-dlg' }, el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id }, t('gist.title')), close),
        el('div', { className: 'cv-dlg-body' }, el('div', { className: 'cv-gist-row' }, el('label', { for: id + '-l' }, t('gisa.layer')), layerSel), empty, main),
        el('div', { className: 'cv-dlg-foot' }, help, csv, undo, redo)));
    close.onclick = () => dlg.close();
    refs = { layerSel, filter, count, sum, msg, scrollHost, main, empty, fieldSel, renSel, calcTarget, calcNew, scroll: null };
    dlg.addEventListener('close', () => { clearTimeout(ft); off?.(); dlg.remove(); dlg = null; refs = null; editing = null; sel = new Set(); publish(); host.refocus(); });
    const off = P().on(() => { if (!dlg) return; if (!layerOf(P(), api.layer)) api.layer = gisOf(P()).layers[0]?.id || null; rebuildAll(); });
    host.root.append(dlg);
    dlg.show();
  }

  function open(layerId = null) {
    const first = gisOf(P()).layers;
    const want = layerId && layerOf(P(), layerId) ? layerId : (host.sel?.kind === 'gis' && layerOf(P(), host.sel.layer) ? host.sel.layer : api.layer && layerOf(P(), api.layer) ? api.layer : first[0]?.id || null);
    if (!dlg?.isConnected) { api.sort = { field: '', dir: 'asc' }; api.filterText = ''; sel = new Set(); anchor = -1; api.layer = want; buildPanel(); }
    else if (want && want !== api.layer) { api.layer = want; sel = new Set(); refs.layerSel.value = want; }
    // adopt what the Select tab of the analysis panel picked on this layer
    const s = host.analysis?.selection;
    if (s?.layer === api.layer && s.indices.length) sel = new Set(s.indices);
    if (!first.length) host.say(t('gisa.nolayers'));
    rebuildAll();
    if (host.sel?.kind === 'gis') planKey = host.sel.layer + ':' + host.sel.i;
    if (host.sel?.kind === 'gis' && host.sel.layer === api.layer && !sel.size) { sel = new Set([host.sel.i]); paintRows(); status(); scrollToRow(host.sel.i); }
    dlg.querySelector('input, select, button')?.focus();
    return dlg;
  }
  reg.commands.set('gis-table', async () => { open(); });
  api.open = open;
  api.setFilter = (text) => { api.filterText = text; if (refs) { refs.filter.value = text; recompute(); paintRows(); status(); } };
  api.edit = (i, field) => startEdit(i, field);
  host.table = api;
}
