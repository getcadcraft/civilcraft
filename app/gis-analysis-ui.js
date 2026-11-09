/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-analysis-ui.js — the GIS analysis panel (0.9 SU.1080), the thin adapter over gis-analysis-run.js. gis-ui.js installs it:
 * install(host). Command 'gis-analysis' (GIS group; typed GISANALYSIS or ANALYZE) opens a panel with five tabs: Buffer, Overlay
 * (intersect, union, erase, dissolve), Join (spatial join), Select (attribute and geometry queries, selection on the plan) and
 * Measure (AREA / LENGTH fields, totals, statistics). Text only goes in through textContent (layer names and values are untrusted).
 * Registers through host.reg: commands, overlay (the selected features drawn on the plan), extents untouched.
 * host.analysis = { open(tab), selection: {layer, indices}, last } for tests.
 */

import { gisOf, layerOf, featuresOf, layerBounds } from './gis-layers.js';
import * as R from './gis-analysis-run.js';
import { measureFeature } from './gis-analysis.js';
import { t } from './i18n.js';

const KIND_KEY = { pt: 'vec.kind.pt', ln: 'vec.kind.ln', pg: 'vec.kind.pg' };
const MAX_ROWS = 100, MAX_DRAW = 5000;

export async function install(host) {
  const { reg, el } = host;
  const P = () => host.project;
  const api = { last: null, selection: { layer: null, indices: [] }, open: null };
  const n = (v, d = 3) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: d }));
  let uid = 0, dlg = null, rebuild = null;

  // ------------------------------------------------------------------------------------------- the selection, drawn on the plan
  (reg.overlay ||= []).push((ctx, v) => {
    const s = api.selection, l = s.layer && layerOf(P(), s.layer);
    if (!l || !l.visible || !s.indices.length) return;
    const fs = featuresOf(P(), l.id), C = v.colors, S = (p) => v.toScreen(p[0], p[1]);
    ctx.save();
    ctx.strokeStyle = C.action; ctx.fillStyle = C.action; ctx.lineWidth = 4; ctx.globalAlpha = 0.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const i of s.indices.slice(0, MAX_DRAW)) {
      const g = fs[i]?.g;
      if (!g) continue;
      if (g.t === 'pt') { const q = S(g.c); ctx.beginPath(); ctx.arc(q.x, q.y, 6, 0, Math.PI * 2); ctx.stroke(); continue; }
      ctx.beginPath();
      for (const r of g.t === 'ln' ? g.c : g.c.flat()) r.forEach((p, k) => { const q = S(p); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      ctx.stroke();
    }
    ctx.restore();
  });
  function setSelection(layer, indices) { api.selection = { layer, indices }; host.refresh(); }

  // ------------------------------------------------------------------------------------------------------------- small helpers
  const layers = () => gisOf(P()).layers;
  const kindOf = (l) => t(KIND_KEY[l.geom]);
  function layerSelect(id, { only = null, none = null } = {}) {
    const sel = el('select', { className: 'cv-select', id });
    sel.refill = () => {
      const keep = sel.value;
      sel.replaceChildren(...(none ? [el('option', { value: '' }, none)] : []), ...layers().filter((l) => !only || only.includes(l.geom)).map((l) => el('option', { value: l.id }, t('gisa.layer.opt', { layer: l.name, kind: kindOf(l), count: featuresOf(P(), l.id).length }))));
      if ([...sel.options].some((o) => o.value === keep)) sel.value = keep;
    };
    sel.refill();
    return sel;
  }
  function fieldSelect(id, layerSel, { type = null, none }) {
    const sel = el('select', { className: 'cv-select', id });
    sel.refill = () => {
      const keep = sel.value, l = layerOf(P(), layerSel.value);
      sel.replaceChildren(el('option', { value: '' }, none), ...(l ? l.fields.filter((f) => !type || f.type === type).map((f) => el('option', { value: f.name }, f.name)) : []));
      if ([...sel.options].some((o) => o.value === keep)) sel.value = keep;
    };
    layerSel.addEventListener('change', sel.refill);
    sel.refill();
    return sel;
  }
  const row = (label, input, id) => el('div', { className: 'cv-props' }, el('label', { for: id }, label), input);
  const numInput = (id, value) => el('input', { type: 'number', className: 'cv-input', id, value: String(value), step: 'any' });
  const check = (id, label, on = false) => { const c = el('input', { type: 'checkbox', id, checked: on }); return [c, el('label', { className: 'cv-check', for: id }, c, ' ' + label)]; };
  const msgBox = () => el('p', { className: 'cv-note', role: 'status', 'data-gisa-msg': '' });
  function say(box, r, extra = []) {
    api.last = r;
    box.replaceChildren();
    if (!r.ok) { box.textContent = R.describe(r.error); box.classList.add('cv-gisa-err'); return; }
    box.classList.remove('cv-gisa-err');
    const l = layerOf(P(), r.id);
    box.append(t('gisa.done', { layer: l?.name ?? '', count: r.count }));
    for (const note of r.notes || []) box.append(' ', t('gisa.note.' + note.code, { n: note.n ?? 0 }));
    for (const x of extra) box.append(x);
    host.say(t('gisa.done', { layer: l?.name ?? '', count: r.count }));
  }
  const runBtn = (label, fn) => el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-gisa-run': '', onclick: fn }, label);

  // ----------------------------------------------------------------------------------------------------------------------- tabs
  function tabBuffer() {
    const a = layerSelect('gisa-b-l'), dist = numInput('gisa-b-d', 50), f = fieldSelect('gisa-b-f', a, { type: 'number', none: t('gisa.buffer.nofield') });
    const q = el('select', { className: 'cv-select', id: 'gisa-b-q' }, ...[[4, 'gisa.buffer.q.coarse'], [8, 'gisa.buffer.q.normal'], [16, 'gisa.buffer.q.fine']].map(([v, k]) => el('option', { value: v }, t(k))));
    q.value = '8';
    const [dis, disRow] = check('gisa-b-dis', t('gisa.buffer.dissolve'));
    const msg = msgBox();
    const body = [el('p', { className: 'cv-note' }, t('gisa.buffer.lead')),
      row(t('gisa.layer'), a, 'gisa-b-l'), row(t('gisa.buffer.dist', { unit: P().state.units }), dist, 'gisa-b-d'), row(t('gisa.buffer.field'), f, 'gisa-b-f'), row(t('gisa.buffer.q'), q, 'gisa-b-q'), disRow,
      el('p', { className: 'cv-note' }, t('gisa.buffer.note')), runBtn(t('gisa.buffer.run'), () => say(msg, R.buffer(P(), a.value, { dist: parseFloat(dist.value), field: f.value || null, dissolve: dis.checked, quarter: parseInt(q.value, 10) }))), msg];
    return { body, refill: () => { a.refill(); f.refill(); } };
  }
  function tabOverlay() {
    const op = el('select', { className: 'cv-select', id: 'gisa-o-op' }, ...['intersect', 'union', 'erase', 'dissolve'].map((o) => el('option', { value: o }, t('gisa.op.' + o))));
    const a = layerSelect('gisa-o-a'), b = layerSelect('gisa-o-b', { only: ['pg'] }), f = fieldSelect('gisa-o-f', a, { none: t('gisa.dissolve.all') });
    const rb = row(t('gisa.overlay.b'), b, 'gisa-o-b'), rf = row(t('gisa.dissolve.field'), f, 'gisa-o-f'), ra = row(t('gisa.overlay.a'), a, 'gisa-o-a');
    const lead = el('p', { className: 'cv-note' });
    const show = () => { const d = op.value === 'dissolve'; rb.hidden = d; rf.hidden = !d; lead.textContent = t('gisa.overlay.lead.' + op.value); };
    op.addEventListener('change', show); show();
    const msg = msgBox();
    const go = runBtn(t('gisa.overlay.run'), () => say(msg, op.value === 'dissolve' ? R.dissolve(P(), a.value, f.value || null) : R.overlay(P(), a.value, b.value, op.value)));
    return { body: [row(t('gisa.overlay.op'), op, 'gisa-o-op'), lead, ra, rb, rf, go, msg], refill: () => { a.refill(); b.refill(); f.refill(); } };
  }
  function tabJoin() {
    const tg = layerSelect('gisa-j-t'), sr = layerSelect('gisa-j-s');
    const rel = el('select', { className: 'cv-select', id: 'gisa-j-r' }, ...['intersects', 'within', 'contains', 'nearest', 'within-distance'].map((o) => el('option', { value: o }, t('gisa.join.rel.' + o))));
    const dist = numInput('gisa-j-d', 0);
    const mode = el('select', { className: 'cv-select', id: 'gisa-j-m' }, el('option', { value: 'first' }, t('gisa.join.mode.first')), el('option', { value: 'summary' }, t('gisa.join.mode.summary')));
    const [keep, keepRow] = check('gisa-j-k', t('gisa.join.keep'), true);
    const rd = row(t('gisa.join.dist', { unit: P().state.units }), dist, 'gisa-j-d');
    const showD = () => { rd.hidden = !['nearest', 'within-distance'].includes(rel.value); };
    rel.addEventListener('change', showD); showD();
    const msg = msgBox();
    const go = runBtn(t('gisa.join.run'), () => say(msg, R.join(P(), tg.value, sr.value, { relation: rel.value, distance: parseFloat(dist.value) || 0, mode: mode.value, keep: keep.checked })));
    return { body: [el('p', { className: 'cv-note' }, t('gisa.join.lead')), row(t('gisa.join.target'), tg, 'gisa-j-t'), row(t('gisa.join.source'), sr, 'gisa-j-s'), row(t('gisa.join.rel'), rel, 'gisa-j-r'), rd, row(t('gisa.join.mode'), mode, 'gisa-j-m'), keepRow, go, msg], refill: () => { tg.refill(); sr.refill(); } };
  }
  function tabSelect() {
    const a = layerSelect('gisa-s-l');
    const q = el('textarea', { className: 'cv-input', id: 'gisa-s-q', rows: 3, spellcheck: false, placeholder: t('gisa.select.ph') });
    const msg = msgBox(), table = el('div', { className: 'cv-table-wrap', 'data-gisa-rows': '' }), tot = el('p', { className: 'cv-note', 'data-gisa-sum': '' });
    let current = [];
    function showRows() {
      const l = layerOf(P(), a.value), fs = featuresOf(P(), a.value);
      table.replaceChildren(); tot.textContent = '';
      if (!l || !current.length) return;
      const cols = l.fields.slice(0, 6);
      table.append(el('table', { className: 'cv-table' }, el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '#'), ...cols.map((c) => el('th', { scope: 'col' }, c.name)))),
        el('tbody', {}, ...current.slice(0, MAX_ROWS).map((i) => el('tr', {}, el('td', { className: 'num' }, String(i + 1)), ...cols.map((c) => el('td', { className: c.type === 'number' ? 'num' : '' }, fs[i].p[c.name] === null || fs[i].p[c.name] === undefined ? '—' : String(fs[i].p[c.name]))))))));
      const m = R.measureSelection(P(), a.value, current);
      tot.textContent = t('gisa.select.total.' + l.geom, { count: n(m.count, 0), area: n(m.area, 2), perimeter: n(m.perimeter, 2), length: n(m.length, 2), unit: P().state.units }) + (current.length > MAX_ROWS ? ' ' + t('gisa.select.more', { n: MAX_ROWS }) : '');
    }
    const sel = runBtn(t('gisa.select.run'), () => {
      const r = R.select(P(), a.value, q.value);
      api.last = r;
      msg.classList.toggle('cv-gisa-err', !r.ok);
      if (!r.ok) { msg.textContent = R.describe(r.error); return; }
      current = r.indices; setSelection(a.value, current); showRows();
      msg.textContent = t('gisa.select.found', { count: r.indices.length, total: r.total });
    });
    const mk = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-gisa-make': '', onclick: () => { if (!current.length) { msg.textContent = t('gisa.err.empty.sel'); return; } say(msg, R.fromSelection(P(), a.value, current)); } }, t('gisa.select.make'));
    const zoom = el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => { const fs = featuresOf(P(), a.value); const b = layerBounds(current.map((i) => fs[i]).filter(Boolean)); if (b && Number.isFinite(b.minX)) { const pad = Math.max(b.maxX - b.minX, b.maxY - b.minY, 10) * 0.15; host.view.fit({ minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad }); } } }, t('gisa.select.zoom'));
    const clear = el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => { current = []; setSelection(null, []); showRows(); msg.textContent = ''; } }, t('gisa.select.clear'));
    a.addEventListener('change', () => { current = []; setSelection(null, []); showRows(); });
    return { body: [el('p', { className: 'cv-note' }, t('gisa.select.lead')), row(t('gisa.layer'), a, 'gisa-s-l'), row(t('gisa.select.where'), q, 'gisa-s-q'), el('p', { className: 'cv-note' }, t('gisa.select.help')),
      el('div', { className: 'cv-actions' }, sel, mk, zoom, clear), msg, tot, table], refill: () => { a.refill(); } };
  }
  function tabMeasure() {
    const a = layerSelect('gisa-m-l'), f = fieldSelect('gisa-m-f', a, { type: 'number', none: t('gisa.stats.count') }), by = fieldSelect('gisa-m-by', a, { none: t('gisa.stats.nogroup') });
    const msg = msgBox(), out = el('div', { className: 'cv-table-wrap', 'data-gisa-stats': '' });
    const calc = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-gisa-calc': '', onclick: () => {
      const r = R.calcGeometry(P(), a.value); api.last = r;
      msg.classList.toggle('cv-gisa-err', !r.ok);
      msg.textContent = r.ok ? t('gisa.measure.added', { fields: r.fields.join(', ') }) : R.describe(r.error);
    } }, t('gisa.measure.calc'));
    const run = runBtn(t('gisa.stats.run'), () => {
      const r = R.stats(P(), a.value, f.value, by.value); api.last = r;
      out.replaceChildren(); msg.classList.toggle('cv-gisa-err', !!r.error);
      if (r.error) { msg.textContent = R.describe(r.error); return; }
      msg.textContent = '';
      const hasF = !!f.value, head = [by.value || t('gisa.stats.all'), t('gisa.stats.n'), ...(hasF ? [t('gisa.stats.sum'), t('gisa.stats.mean'), t('gisa.stats.min'), t('gisa.stats.max')] : [])];
      const line = (s, label) => el('tr', {}, el('th', { scope: 'row' }, label), el('td', { className: 'num' }, n(s.count, 0)), ...(hasF ? [s.sum, s.mean, s.min, s.max].map((v) => el('td', { className: 'num' }, n(v))) : []));
      out.append(el('table', { className: 'cv-table' }, el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...r.rows.slice(0, MAX_ROWS).map((s) => line(s, s.key === '' ? t('gisa.stats.blank') : s.key)), ...(r.rows.length > 1 ? [line(r.total, t('gisa.stats.total'))] : []))));
    });
    const sum = el('p', { className: 'cv-note', 'data-gisa-geom': '' });
    const refreshSum = () => {
      const l = layerOf(P(), a.value), fs = featuresOf(P(), a.value);
      if (!l) { sum.textContent = ''; return; }
      let area = 0, per = 0, len = 0;
      for (const x of fs) { const m = measureFeature(x.g); area += m.area || 0; per += m.perimeter || 0; len += m.length || 0; }
      sum.textContent = t('gisa.select.total.' + l.geom, { count: n(fs.length, 0), area: n(area, 2), perimeter: n(per, 2), length: n(len, 2), unit: P().state.units });
    };
    a.addEventListener('change', () => { refreshSum(); out.replaceChildren(); });
    refreshSum();
    return { body: [el('p', { className: 'cv-note' }, t('gisa.measure.lead')), row(t('gisa.layer'), a, 'gisa-m-l'), sum, el('div', { className: 'cv-actions' }, calc), el('h3', { className: 'cv-h3' }, t('gisa.stats.head')),
      row(t('gisa.stats.field'), f, 'gisa-m-f'), row(t('gisa.stats.by'), by, 'gisa-m-by'), run, msg, out], refill: () => { a.refill(); f.refill(); by.refill(); refreshSum(); } };
  }

  // ---------------------------------------------------------------------------------------------------------------------- panel
  function open(tabName = 'buffer') {
    if (dlg?.isConnected) { dlg.querySelector(`[data-gisa-tab="${tabName}"]`)?.click(); return dlg; }
    if (!layers().length) { host.say(t('gisa.nolayers')); }
    const tabs = [['buffer', tabBuffer], ['overlay', tabOverlay], ['join', tabJoin], ['select', tabSelect], ['measure', tabMeasure]].map(([k, mk]) => ({ k, ...mk() }));
    const id = 'cv-gisa-h-' + (++uid);
    const bar = el('div', { className: 'cv-gisa-tabs', role: 'tablist', 'aria-label': t('gisa.title') });
    const panes = tabs.map((tb) => el('div', { className: 'cv-gisa-pane', role: 'tabpanel', hidden: tb.k !== tabName, 'data-gisa-pane': tb.k }, ...tb.body));
    tabs.forEach((tb, i) => {
      const b = el('button', { type: 'button', role: 'tab', className: 'btn-line btn-sm-cc', 'aria-selected': String(tb.k === tabName), 'data-gisa-tab': tb.k, onclick: () => {
        bar.querySelectorAll('[role=tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        panes.forEach((p, j) => { p.hidden = j !== i; });
      } }, t('gisa.tab.' + tb.k));
      bar.append(b);
    });
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('vec.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const undo = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-gisa-undo': '', onclick: () => { P().undo(); } }, t('gisa.undo'));
    const help = el('a', { className: 'btn-line btn-sm-cc', href: '#', 'data-gisa-help': '', onclick: (e) => { e.preventDefault(); window.cadcraftHelp?.open('gis-analysis'); } }, t('gisa.help'));
    dlg = el('dialog', { className: 'cv-dialog cv-gisv cv-gisa', 'aria-labelledby': id, 'data-gisa': '' },
      el('div', { className: 'cv-dlg' }, el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id }, t('gisa.title')), close), el('div', { className: 'cv-dlg-body' }, bar, ...panes), el('div', { className: 'cv-dlg-foot' }, help, undo)));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { off?.(); dlg.remove(); dlg = null; host.refocus(); });
    rebuild = () => tabs.forEach((tb) => tb.refill());
    const off = P().on(() => { if (!dlg?.contains(dlg.ownerDocument.activeElement) || dlg.ownerDocument.activeElement.tagName !== 'TEXTAREA') rebuild(); });
    host.root.append(dlg);
    dlg.show();   // not modal: the plan, and the selection drawn on it, stay in view
    dlg.querySelector('select, textarea, button')?.focus();
    return dlg;
  }
  reg.commands.set('gis-analysis', async () => { open(); });
  api.open = open;
  host.analysis = api;
  reg.onProject.push(() => { api.selection = { layer: null, indices: [] }; });
}
