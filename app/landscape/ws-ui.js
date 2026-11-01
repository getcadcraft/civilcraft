/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ws-ui.js — worksheets on the page (0.8 LA.8, session `landscape-arch_PART_4`): Landscape › More › Worksheets opens the saved worksheets of
 * the project (the plant and hardscape schedules are made the first time, as one undo step), an editor (rows from, columns from any field
 * or a formula, totals, group by, only rows where, on the sheets) and a live preview that is worked out from the objects each time; CSV and
 * XLSX out. Every edit is one undo step. The engine is worksheet.js (lib/worksheet), the rows ws-sources.js.
 *
 *   createWsUi(ctx, { edit, LS, rows(source) → [row] }) → { open(), results() → [{ ws, res }] for the sheets }
 */
import { cleanWorksheet, runWorksheet, toCsv, toXlsxSheet, fieldsOf, TOTALS, parseExpr } from './worksheet.js';
import { WS_SOURCES, defaultWorksheets } from './ws-sources.js';
import { t } from '../i18n.js';

const PREVIEW = 200;

export function createWsUi(ctx, { edit, LS, rows }) {
  const { el, root } = ctx;
  const list = () => (LS().worksheets || []).map((w) => cleanWorksheet(w, WS_SOURCES)).filter(Boolean);
  const results = () => list().map((ws) => ({ ws, res: runWorksheet(ws, rows(ws.source)) }));
  const nextId = () => 'w' + (Math.max(0, ...list().map((w) => Number(w.id.slice(1)))) + 1);
  const save = (label, id, fn) => edit(label, (l) => { const w = (l.worksheets || []).find((x) => x.id === id); if (w) fn(w); });

  function open(sel = null) {
    if (!LS().worksheets) edit(t('ls.ws.undo.defaults'), (l) => { l.worksheets = defaultWorksheets(t); });
    let cur = sel || list()[0]?.id || null;
    const side = el('ul', { className: 'cv-ls-wslist', 'data-ws-list': '' }), main = el('div', { className: 'cv-ls-wsmain', 'data-ws-main': '' });
    function render() {
      const L = list();
      side.replaceChildren(...L.map((w) => el('li', {}, el('button', { type: 'button', className: 'cv-linkbtn' + (w.id === cur ? ' is-cur' : ''), 'aria-current': String(w.id === cur), dataset: { wsPick: w.id }, onclick: () => { cur = w.id; render(); } }, w.name))),
        el('li', {}, el('select', { className: 'cv-select', 'data-ws-new': '', 'aria-label': t('ls.ws.new') }, el('option', { value: '' }, t('ls.ws.new')), ...WS_SOURCES.map((s) => el('option', { value: s }, t('ls.ws.src.' + s))))));
      side.querySelector('[data-ws-new]').addEventListener('change', (e) => {
        const s = e.target.value;
        if (!s) return;
        const fields = fieldsOf(rows(s)).slice(0, 6), id = nextId();
        edit(t('ls.ws.undo.new'), (l) => { l.worksheets = [...(l.worksheets || []), { id, name: t('ls.ws.src.' + s), source: s, columns: (fields.length ? fields : ['name']).map((f) => ({ label: f, expr: f, total: '' })), group: '', filter: '', sort: null, onSheet: false }]; });
        cur = id; render();
      });
      const ws = L.find((w) => w.id === cur);
      if (!ws) { main.replaceChildren(el('p', { className: 'cv-note' }, t('ls.ws.none'))); return; }
      const R = rows(ws.source), res = runWorksheet(ws, R), fields = fieldsOf(R);
      const txt = (id, value, label, onChange, check = false) => {
        const i = el('input', { type: 'text', className: 'cv-input', id, value, 'aria-label': label, maxLength: 500 });
        i.addEventListener('change', () => { if (check && i.value.trim()) { try { parseExpr(i.value); } catch (e) { i.setCustomValidity(t('ls.ws.bad', { why: e.message })); i.reportValidity(); return; } } i.setCustomValidity(''); onChange(i.value); render(); });
        return i;
      };
      const name = txt('cv-ws-name', ws.name, t('ls.b.name'), (v) => save(t('ls.ws.undo.edit'), ws.id, (w) => { w.name = v.slice(0, 120) || w.name; }));
      const src = el('select', { className: 'cv-select', id: 'cv-ws-src', 'data-ws-source': '' }, ...WS_SOURCES.map((s) => el('option', { value: s }, t('ls.ws.src.' + s))));
      src.value = ws.source;
      src.addEventListener('change', () => { save(t('ls.ws.undo.edit'), ws.id, (w) => { w.source = src.value; }); render(); });
      const onSheet = el('input', { type: 'checkbox', id: 'cv-ws-sheet', checked: ws.onSheet, 'data-ws-onsheet': '' });
      onSheet.addEventListener('change', () => save(t('ls.ws.undo.edit'), ws.id, (w) => { w.onSheet = onSheet.checked; }));
      const fieldList = el('datalist', { id: 'cv-ws-fields' }, ...fields.map((f) => el('option', { value: f })));
      const colRows = ws.columns.map((c, i) => {
        const tot = el('select', { className: 'cv-select', 'aria-label': t('ls.ws.total'), dataset: { wsTotal: String(i) } }, ...TOTALS.map((x) => el('option', { value: x }, t('ls.ws.t.' + (x || 'none')))));
        tot.value = c.total;
        tot.addEventListener('change', () => { save(t('ls.ws.undo.edit'), ws.id, (w) => { w.columns[i].total = tot.value; }); render(); });
        const ex = txt('cv-ws-ex-' + i, c.expr, t('ls.ws.expr'), (v) => save(t('ls.ws.undo.edit'), ws.id, (w) => { w.columns[i].expr = v; }), true);
        ex.setAttribute('list', 'cv-ws-fields'); ex.dataset.wsExpr = String(i);
        return el('tr', {}, el('td', {}, txt('cv-ws-lb-' + i, c.label, t('ls.ws.label'), (v) => save(t('ls.ws.undo.edit'), ws.id, (w) => { w.columns[i].label = v.slice(0, 60); }))), el('td', {}, ex), el('td', {}, tot),
          el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('ls.b.remove'), disabled: ws.columns.length < 2, onclick: () => { save(t('ls.ws.undo.edit'), ws.id, (w) => { w.columns.splice(i, 1); }); render(); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }))));
      });
      const grp = txt('cv-ws-group', ws.group, t('ls.ws.group'), (v) => save(t('ls.ws.undo.edit'), ws.id, (w) => { w.group = v; }), true); grp.setAttribute('list', 'cv-ws-fields');
      const flt = txt('cv-ws-filter', ws.filter, t('ls.ws.filter'), (v) => save(t('ls.ws.undo.edit'), ws.id, (w) => { w.filter = v; }), true);
      const cell = (v) => (typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v ?? ''));
      main.replaceChildren(
        el('div', { className: 'cv-props' }, el('label', { for: 'cv-ws-name' }, t('ls.b.name')), name, el('label', { for: 'cv-ws-src' }, t('ls.ws.source')), src,
          el('label', { for: 'cv-ws-group' }, t('ls.ws.group')), grp, el('label', { for: 'cv-ws-filter' }, t('ls.ws.filter')), flt),
        el('label', { className: 'cv-check', for: 'cv-ws-sheet' }, onSheet, ' ', t('ls.ws.onsheet')), fieldList,
        el('table', { className: 'cv-groups', 'data-ws-cols': '' }, el('caption', { className: 'cv-note' }, t('ls.ws.cols')),
          el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('ls.ws.label')), el('th', { scope: 'col' }, t('ls.ws.expr')), el('th', { scope: 'col' }, t('ls.ws.total')), el('th', {}))), el('tbody', {}, ...colRows)),
        el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ws-addcol': '', disabled: ws.columns.length >= 40, onclick: () => { const f = fields.find((x) => !ws.columns.some((c) => c.expr === x)) || 'name'; save(t('ls.ws.undo.edit'), ws.id, (w) => { w.columns.push({ label: f, expr: f, total: '' }); }); render(); } }, t('ls.ws.addcol'))),
        el('p', { className: 'cv-note' }, t('ls.ws.help')),
        res.errors.length ? el('p', { className: 'cv-report is-error', 'data-ws-errors': '' }, res.errors.map((e) => t('ls.ws.bad', { why: e.msg })).join(' ')) : '',
        el('p', { className: 'cv-note', 'data-ws-count': '' }, t('ls.ws.count', { n: res.count })),
        el('div', { className: 'cv-ls-schwrap' }, el('table', { className: 'cv-groups', 'data-ws-preview': '' },
          el('thead', {}, el('tr', {}, ...res.head.map((h) => el('th', { scope: 'col' }, h)))),
          el('tbody', {}, ...res.body.slice(0, PREVIEW).map((b) => el('tr', { className: b.kind === 'row' ? '' : 'is-sub' }, ...b.cells.map((v) => el(b.kind === 'row' ? 'td' : 'th', { className: typeof v === 'number' ? 'num' : '' }, cell(v)))))),
          res.totals ? el('tfoot', {}, el('tr', { 'data-ws-totals': '' }, ...res.totals.map((v, i) => el(i ? 'td' : 'th', { className: typeof v === 'number' ? 'num' : '' }, i === 0 && v === '' ? t('ls.st.total') : cell(v))))) : '')),
        el('div', { className: 'cv-actions' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ws-csv': '', onclick: () => { ctx.download(new TextEncoder().encode('﻿' + toCsv(res, { totalLabel: t('ls.st.total') })), ctx.fileStem() + '-' + ws.name.replace(/[^\w-]+/g, '-').toLowerCase() + '.csv', 'text/csv'); ctx.say(t('ls.ws.saved')); } }, t('ls.sch.csv')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ws-xlsx': '', onclick: async () => { const { writeXlsx } = await import('./xlsx.js'); const bytes = await writeXlsx([toXlsxSheet(res, { name: ws.name, totalLabel: t('ls.st.total') })], { title: ws.name }); ctx.download(bytes, ctx.fileStem() + '-' + ws.name.replace(/[^\w-]+/g, '-').toLowerCase() + '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); ctx.say(t('ls.ws.saved')); } }, t('ls.sch.xlsx')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', 'data-ws-delete': '', onclick: () => { edit(t('ls.ws.undo.delete'), (l) => { l.worksheets = (l.worksheets || []).filter((x) => x.id !== ws.id); }); cur = list()[0]?.id || null; render(); } }, t('ls.ws.delete'))));
    }
    const dlg = el('dialog', { className: 'cv-dialog cv-ls-wsdlg', 'aria-labelledby': 'cv-ws-h', 'data-ls-worksheets': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ws-h' }, t('ls.ws.head'))),
        el('div', { className: 'cv-dlg-body cv-ls-wsbody' }, side, main),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ws-close': '', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); ctx.refresh(); });
    root.append(dlg);
    render();
    dlg.showModal();
  }

  return { open, results, list };
}
