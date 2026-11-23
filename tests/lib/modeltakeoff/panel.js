/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the model takeoff panel every host shows (0.11 MT.1). Plain DOM, no app imports: the host hands over its words, the read model
 * and what happens to the quantities (0.11 MT.3 adds the 3D picture, MT.4 the material, layer and size groupings and the CSV files). One panel, so a model is taken off the same way in TakeoffCraft and in SuperCad Studio.
 *
 *   mountModelPanel(root, host) → { render(), state, file() → quantities file | null, add(), view() → the 3D view | null, select(row id | null), csv(), openingsCsv() }
 *   host = {
 *     t(key, vars)                 words from the host's language file (keys mt.*, lib/modeltakeoff/lang/en.json)
 *     model                        read.js readModel() result
 *     fileName                     the file the person opened ('Tower 60 percent.rvt')
 *     source?                      { kind: 'rvt', release, boxes, fabric, elements } when a converter stood between the file and the model
 *     booleans?                    false when the reader could not cut openings out of walls (said in the panel)
 *     units                        'imperial' | 'metric' to start with
 *     names?() → [text]            model names already in the takeoff (offered, so a newer copy updates the same quantities)
 *     existing() → [{ name, unit, qty, origin: { app, project, key } }]   the takeoff's typed quantities now
 *     add(file) → void             bring the quantities file in (the host's own import: one undo step)
 *     close()                      the host closes its dialog
 *     app?                         the origin label on every quantity (default 'Model')
 *     save?(name, text, mime)      the host's own way to save a CSV (default: a download link)
 *     view3d?                      false: no 3D picture (default: shown, one colour for each row; click a part to find its row, click a row to light its parts)
 *     cls? { button, primary, input, table, note }   class names (the host's own look)
 *     locale?
 *   }
 */
import { groupRows, quantitiesFile, compare, groupLabel, sizeText, rowsCsv, openingsSchedule, openingsCsv, rowLabel, BY, KIND_UNITS, MAX_ITEMS } from './rows.js';
import { mountModelView } from './view3d.js';

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'className') n.className = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') n.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'indeterminate') n[k] = !!v;
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}

const CSS = `.mt-panel{font-size:.85rem;display:flex;flex-direction:column;gap:.5rem;min-height:0}.mt-panel p{margin:0}
.mt-top{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:flex-end}.mt-field{display:flex;flex-direction:column;gap:.2rem;font-weight:600;font-size:.8rem}
.mt-field input,.mt-field select{font-weight:400;background:#fff;color:#111}.mt-field.mt-grow{flex:1 1 14rem}
.mt-scroll{overflow:auto;max-height:46vh;border:1px solid rgba(128,128,128,.4);border-radius:.25rem}
.mt-panel table{width:100%;border-collapse:collapse;font-size:.8rem;font-variant-numeric:tabular-nums}
.mt-panel th,.mt-panel td{padding:.2rem .45rem;border-bottom:1px solid rgba(128,128,128,.3);text-align:right;white-space:nowrap;vertical-align:top}
.mt-panel th{position:sticky;top:0;z-index:1;background:var(--sheet-2,#f4f4f4)}
.mt-panel table th.mt-l,.mt-panel table td.mt-l{text-align:left;white-space:normal}.mt-panel table td.mt-l{min-width:13rem}
.mt-panel table th:first-child,.mt-panel table td:first-child{min-width:0;width:2rem;text-align:left}
.mt-panel tr.mt-head td{font-weight:700;background:rgba(128,128,128,.12);text-align:left}
.mt-sub{display:block;font-size:.72rem;opacity:.8}.mt-warn{border-left:3px solid #b26a00;padding:.35rem .6rem}.mt-info{border-left:3px solid currentColor;padding:.35rem .6rem;opacity:.9}
.mt-part{text-decoration:underline dotted;cursor:help}.mt-foot{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:space-between}
.mt-3d .mt-scroll{max-height:28vh}.mt-panel tr[data-mt-row]{cursor:pointer}.mt-panel tr.mt-sel td{background:rgba(255,200,0,.28)}
.mt-chip{display:inline-block;width:.7rem;height:.7rem;border-radius:.15rem;margin-right:.35rem;vertical-align:-.05rem;border:1px solid rgba(0,0,0,.35)}.mt-check{display:flex;align-items:center;gap:.4rem;font-weight:600;font-size:.8rem}
.mt-gone{font-size:.78rem;margin:.2rem 0 0 1rem;padding:0}`;
function style() {
  if (typeof document === 'undefined' || document.getElementById('cc-modeltakeoff-style')) return;
  const s = document.createElement('style'); s.id = 'cc-modeltakeoff-style'; s.textContent = CSS; document.head.append(s);
}

const COLS = ['length', 'side', 'plan', 'slope', 'volume'];

export function mountModelPanel(root, host) {
  style();
  const t = host.t, cls = host.cls || {};
  const base = String(host.fileName || '').replace(/\.[^.]+$/, '');
  const state = { by: 'type', units: host.units === 'metric' ? 'metric' : 'imperial', name: base, filter: '', rows: [], pick: new Set(), touched: false, sel: null, show3d: host.view3d !== false };
  const drawable = host.model.elements.filter((e) => e.mesh && e.cls !== 'IfcSpace');
  const capped = drawable.filter((e) => e.capped).length;
  let view = null;
  const viewRoot = el('div', { 'data-mt-view-root': '' });
  let rowOf = new Map();                       // element id → [row ids]
  const hue = (i) => { const h = ((i * 137.508) % 360) / 60, c = 0.55 * (1 - Math.abs(2 * 0.54 - 1)), x = c * (1 - Math.abs((h % 2) - 1)), m = 0.54 - c / 2; const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6]; return [r + m, g + m, b + m]; };
  const colorOf = (rowIndex) => hue(rowIndex);
  const css = (c) => 'rgb(' + c.map((x) => Math.round(x * 255)).join(',') + ')';
  const fmt = (v) => v.toLocaleString(host.locale || undefined, { maximumFractionDigits: v >= 100 ? 1 : 2 });
  const regroup = () => {
    state.rows = groupRows(host.model, { by: state.by });
    state.pick = new Set(state.rows.map((r) => r.id));
    state.sel = null;
    rowOf = new Map();
    for (const r of state.rows) for (const id of r.ids) { const l = rowOf.get(id); if (l) l.push(r.id); else rowOf.set(id, [r.id]); }
  };
  regroup();
  const shown = () => { const f = state.filter.trim().toLowerCase(); return f ? state.rows.filter((r) => (groupLabel(r, t) + ' ' + r.type + ' ' + r.storey).toLowerCase().includes(f)) : state.rows; };
  const file = () => (state.pick.size ? quantitiesFile(state.rows, { t, units: state.units, pick: state.pick, project: state.name.trim() || base, app: host.app || 'Model' }) : null);   // i18n-ignore: the origin label default

  /** Send the picks, the colours and the lit row to the 3D picture. */
  function paint() {
    if (!view) return;
    const colors = new Map(), hidden = new Set(), index = new Map(state.rows.map((r, i) => [r.id, i]));
    let lit = null;
    const selRow = state.sel ? state.rows.find((r) => r.id === state.sel) : null;
    if (selRow) lit = new Set(selRow.ids);
    for (const e of drawable) {
      const ids = (rowOf.get(e.id) || []).filter((id) => state.pick.has(id));
      if (!ids.length) { hidden.add(e.id); continue; }
      colors.set(e.id, colorOf(index.get(selRow && ids.includes(selRow.id) ? selRow.id : ids[0])));
    }
    view.update({ colors, hidden, lit });
  }

  /** Pick a row (null: none): its parts light up in the picture and its line is marked. */
  function select(id, { focus = true } = {}) {
    state.sel = id && state.rows.some((r) => r.id === id) ? id : null;
    if (state.sel && !shown().some((r) => r.id === state.sel)) state.filter = '';
    render();
    if (state.sel && focus) view?.focus?.(new Set(state.rows.find((r) => r.id === state.sel).ids));
    root.querySelector('tr.mt-sel')?.scrollIntoView?.({ block: 'nearest' });
  }
  /** A click on a part in the picture: its row (a layered wall is in several: the next click on the same part takes the next). */
  function pickedPart(id) {
    const rows = id === null ? [] : (rowOf.get(id) || []).filter((r) => state.pick.has(r));
    if (!rows.length) { select(null); return; }
    const at = rows.indexOf(state.sel);
    select(rows[(at + 1) % rows.length], { focus: false });
  }
  function ensureView() {
    if (!state.show3d || view || !drawable.length) return;
    view = mountModelView(viewRoot, { elements: host.model.elements, t, onPick: pickedPart });
    paint();
  }

  const download = (name, text, mime) => {
    if (host.save) { host.save(name, text, mime); return; }
    const a = el('a', { href: URL.createObjectURL(new Blob([text], { type: mime })), download: name });
    document.body.append(a); a.click(); a.remove();
  };
  const stem = () => (state.name.trim() || base || 'model').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'model';
  const csv = () => { const text = rowsCsv(state.rows.filter((r) => state.pick.has(r.id)), { t, units: state.units }); download(stem() + '-takeoff.csv', text, 'text/csv;charset=utf-8'); return text; };
  const opening = () => { const text = openingsCsv(openingsSchedule(host.model), { t, units: state.units }); download(stem() + '-openings.csv', text, 'text/csv;charset=utf-8'); return text; };

  function add() {
    const f = file();
    if (!f || f.items.length > MAX_ITEMS) return null;
    host.add(f);
    host.close?.();
    return f;
  }

  function cell(r, k) {
    if (!r.kinds.includes(k)) return el('td', {}, '');
    const a = r.q[k];
    if (!a.counted) return el('td', { title: t('mt.cell.none') }, '—');
    const [unit, f] = KIND_UNITS[state.units][k];
    const text = fmt(a.sum * f) + ' ' + unit;
    const why = [];
    if (Math.min(a.counted, r.count) < r.count) why.push(t('mt.note.some', { n: Math.min(a.counted, r.count), of: r.count }));
    if (a.rough) why.push(t('mt.note.rough', { n: a.rough }));
    if (a.layered) why.push(t('mt.note.layer', { n: a.layered }));
    if (k === 'volume' && r.open) why.push(t('mt.note.open', { n: r.open }));
    return el('td', { 'data-mt-kind': k }, why.length ? el('span', { className: 'mt-part', title: why.join(' ') }, text + ' *') : text);
  }

  function render() {
    const m = host.model, rows = shown();
    const elements = m.elements.length - m.spaces;
    const f = file();
    const n = f ? f.items.length : 0;
    const cmp = f ? compare(host.existing(), f) : null;
    const over = n > MAX_ITEMS;
    const names = [...new Set((host.names?.() || []).filter(Boolean))];
    const allOn = rows.length > 0 && rows.every((r) => state.pick.has(r.id)), someOn = rows.some((r) => state.pick.has(r.id));
    const src = host.source;
    const boxes = m.elements.filter((e) => e.box).length;
    const body = [];
    let last = null;
    for (const r of rows) {
      const g = groupLabel(r, t);
      if (g !== last && state.by !== 'class') { body.push(el('tr', { className: 'mt-head' }, el('td', { colspan: String(3 + COLS.length) }, g))); last = g; }
      const from = r.kinds.reduce((s, k) => s + r.q[k].file, 0);
      const idx = state.rows.indexOf(r);
      body.push(el('tr', { 'data-mt-row': r.id, className: state.sel === r.id ? 'mt-sel' : null, 'aria-selected': state.sel === r.id ? 'true' : null, onclick: (ev) => { if (ev.target.closest('input,select,button,a')) return; select(state.sel === r.id ? null : r.id); } },
        el('td', {}, el('input', { type: 'checkbox', checked: state.pick.has(r.id), 'aria-label': t('mt.pick.row', { name: r.type || g }), onchange: (e) => { if (e.target.checked) state.pick.add(r.id); else state.pick.delete(r.id); state.touched = true; render(); } })),
        el('td', { className: 'mt-l' }, state.show3d && drawable.length ? el('span', { className: 'mt-chip', style: 'background:' + css(colorOf(idx)), 'aria-hidden': 'true' }) : null,
          state.by === 'class' ? g : (r.type || t(state.by === 'material' || state.by === 'layer' ? 'mt.material.none' : 'mt.type.none')), r.size ? el('span', { className: 'mt-sub', 'data-mt-size': '' }, sizeText(r.size, state.units)) : null, r.storey ? el('span', { className: 'mt-sub' }, r.storey) : null,
          r.boxes ? el('span', { className: 'mt-sub', 'data-mt-boxes': String(r.boxes) }, t('mt.row.boxes', { n: r.boxes, of: r.count })) : null,
          from ? el('span', { className: 'mt-sub' }, t('mt.row.file')) : null),
        el('td', { 'data-mt-kind': 'count' }, fmt(r.count)),
        ...COLS.map((k) => cell(r, k))));
    }
    const head = el('tr', {},
      el('th', {}, el('input', { type: 'checkbox', checked: allOn, indeterminate: !allOn && someOn, 'aria-label': t('mt.pick.all'), 'data-mt-all': '', onchange: (e) => { for (const r of rows) { if (e.target.checked) state.pick.add(r.id); else state.pick.delete(r.id); } state.touched = true; render(); } })),
      el('th', { className: 'mt-l' }, t(state.by === 'class' ? 'mt.col.category' : state.by === 'material' || state.by === 'layer' ? 'mt.col.material' : 'mt.col.type')), el('th', {}, t('mt.col.count')), ...COLS.map((k) => el('th', {}, t('mt.col.' + k))));
    const focus = document.activeElement?.getAttribute?.('data-mt-input'), caret = document.activeElement?.selectionStart;
    root.replaceChildren(el('div', { className: 'mt-panel' + (state.show3d && drawable.length ? ' mt-3d' : ''), 'data-mt-panel': '' },
      el('p', { 'data-mt-summary': '' }, t('mt.summary', { file: host.fileName, n: elements, rooms: m.spaces, levels: m.storeys.length, schema: m.schema })),
      src?.kind === 'rvt' ? el('p', { className: 'mt-warn ' + (cls.note || ''), role: 'note', 'data-mt-rvt': '' }, t(src.fabric ? 'mt.rvt.note' : 'mt.rvt.nofabric', { release: src.release || '', n: src.elements, boxes: src.boxes })) : null,
      boxes ? el('p', { className: 'mt-warn ' + (cls.note || ''), role: 'note', 'data-mt-boxnote': String(boxes) }, t('mt.boxes.note', { n: boxes })) : null,
      host.booleans === false ? el('p', { className: 'mt-warn ' + (cls.note || ''), role: 'note' }, t('mt.openings.note')) : null,
      el('div', { className: 'mt-top' },
        el('label', { className: 'mt-field mt-grow' }, t('mt.name'), el('input', { className: cls.input || '', type: 'text', maxlength: '120', value: state.name, list: names.length ? 'mt-names' : null, 'data-mt-input': 'name', oninput: (e) => { state.name = e.target.value; render(); } }),
          names.length ? el('datalist', { id: 'mt-names' }, ...names.map((x) => el('option', { value: x }))) : null),
        el('label', { className: 'mt-field' }, t('mt.by'), (() => { const s = el('select', { className: cls.input || '', 'data-mt-by': '', onchange: (e) => { state.by = e.target.value; regroup(); render(); } }, ...BY.map((b) => el('option', { value: b }, t('mt.by.' + b)))); s.value = state.by; return s; })()),
        el('label', { className: 'mt-field' }, t('mt.units'), (() => { const s = el('select', { className: cls.input || '', 'data-mt-units': '', onchange: (e) => { state.units = e.target.value; render(); } }, el('option', { value: 'imperial' }, t('mt.units.imperial')), el('option', { value: 'metric' }, t('mt.units.metric'))); s.value = state.units; return s; })()),
        el('label', { className: 'mt-field mt-grow' }, t('mt.filter'), el('input', { className: cls.input || '', type: 'search', value: state.filter, 'data-mt-input': 'filter', oninput: (e) => { state.filter = e.target.value; render(); } }))),
      el('p', { className: 'mt-sub' }, t('mt.name.help')),
      drawable.length ? el('label', { className: 'mt-check' }, el('input', { type: 'checkbox', checked: state.show3d, 'data-mt-show3d': '', onchange: (e) => { state.show3d = e.target.checked; if (!state.show3d && view) { view.destroy(); view = null; viewRoot.replaceChildren(); } render(); } }), t('mt.view.show')) : null,
      state.show3d && drawable.length ? viewRoot : null,
      state.show3d && drawable.length && capped ? el('p', { className: 'mt-sub', 'data-mt-capped': String(capped) }, t('mt.view.cap', { n: capped })) : null,
      state.show3d && drawable.length && state.sel ? el('p', { className: 'mt-sub', 'data-mt-lit': state.sel }, t('mt.view.lit', { name: rowLabel(state.rows.find((r) => r.id === state.sel), t, state.units), n: state.rows.find((r) => r.id === state.sel).ids.length })) : null,
      el('div', { className: 'mt-scroll' }, el('table', { className: cls.table || '' }, el('thead', {}, head), el('tbody', {}, ...body))),
      el('p', { className: 'mt-info ' + (cls.note || ''), role: 'note' }, t('mt.how')),
      cmp && (cmp.updated || cmp.same || cmp.gone.length) ? el('div', { className: 'mt-info ' + (cls.note || ''), role: 'note', 'data-mt-compare': '' },
        t('mt.compare', { added: cmp.added, updated: cmp.updated, same: cmp.same }),
        cmp.changes.length ? el('ul', { className: 'mt-gone' }, ...cmp.changes.slice(0, 8).map((c) => el('li', {}, t('mt.compare.change', { name: c.name, from: fmt(c.from) + ' ' + c.unitFrom, to: fmt(c.to) + ' ' + c.unit }))), cmp.changes.length > 8 ? el('li', {}, t('mt.more', { n: cmp.changes.length - 8 })) : null) : null,
        cmp.gone.length ? el('p', {}, t('mt.compare.gone', { n: cmp.gone.length })) : null,
        cmp.gone.length ? el('ul', { className: 'mt-gone' }, ...cmp.gone.slice(0, 8).map((x) => el('li', {}, x)), cmp.gone.length > 8 ? el('li', {}, t('mt.more', { n: cmp.gone.length - 8 })) : null) : null) : null,
      el('div', { className: 'mt-foot' },
        el('span', { 'data-mt-count': String(n), className: over ? 'mt-warn' : '' }, over ? t('mt.over', { n, max: MAX_ITEMS }) : t('mt.count', { n, rows: state.pick.size })),
        el('span', {},
          el('button', { type: 'button', className: cls.button || '', disabled: !n, 'data-mt-csv': '', onclick: () => csv() }, t('mt.csv')), ' ',
          openingsSchedule(m).length ? el('button', { type: 'button', className: cls.button || '', 'data-mt-openings': '', onclick: () => opening() }, t('mt.csv.openings')) : null, ' ',
          el('button', { type: 'button', className: cls.primary || cls.button || '', disabled: !n || over, 'data-mt-add': '', onclick: () => add() }, t('mt.add')), ' ',
          el('button', { type: 'button', className: cls.button || '', onclick: () => host.close?.() }, t('mt.close'))))));
    ensureView();
    paint();
    if (focus) { const i = root.querySelector('[data-mt-input="' + focus + '"]'); if (i) { i.focus(); try { i.setSelectionRange(caret, caret); } catch (e) { /* a search box in some browsers */ } } }
  }
  render();
  return { render, state, file, add, view: () => view, select, csv, openingsCsv: opening };
}
