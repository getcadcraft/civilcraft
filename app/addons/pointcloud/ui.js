/* SPDX-License-Identifier: Apache-2.0 */
/** ui.js — small DOM helpers of the point cloud add-on: el() (text only, never HTML), a dialog, a labelled field, a progress row, a download. */
import { el } from '../../ui-util.js';
export { el };

export function field(label, input, hint) {
  return el('label', { className: 'pc-field' }, el('span', { className: 'pc-field-l' }, label), input, hint ? el('small', { className: 'pc-hint' }, hint) : null);
}
export function select(options, value, attrs = {}) {
  const s = el('select', attrs, ...options.map(([v, l]) => el('option', { value: String(v) }, l)));
  s.value = String(value);
  return s;
}
export function numInput(value, attrs = {}) { return el('input', { type: 'number', value: String(value), step: 'any', ...attrs }); }

/** A modal dialog in the app's own look. buttons: [{ label, kind: 'plot'|'line', attr, onClick(close) }]. Returns { dlg, body, close }. */
export function dialog({ title, body, buttons = [], attr = 'data-pc-dialog', cls = '' }) {
  const dlg = el('dialog', { className: 'cv-dialog pc-dialog ' + cls, [attr]: '' });
  const close = () => { try { dlg.close(); } catch { /* closed */ } dlg.remove(); };
  const head = el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h' }, title));
  const foot = el('div', { className: 'cv-dlg-foot' }, ...buttons.map((b) => el('button', { type: 'button', className: 'btn-' + (b.kind || 'line'), ...(b.attr ? { [b.attr]: '' } : {}), onclick: () => b.onClick(close) }, b.label)));
  const bodyEl = el('div', { className: 'cv-dlg-body' }, body);
  dlg.append(el('div', { className: 'cv-dlg' }, head, bodyEl, foot));
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  document.body.append(dlg);
  dlg.showModal();
  return { dlg, body: bodyEl, close };
}

export function progressRow(cancelLabel, onCancel) {
  const bar = el('progress', { max: 1, value: 0, className: 'pc-progress' });
  const txt = el('span', { className: 'pc-progress-t' });
  const cancel = el('button', { type: 'button', className: 'btn-line', onclick: onCancel }, cancelLabel);
  const row = el('div', { className: 'pc-progress-row', hidden: true }, bar, txt, cancel);
  return { row, set(f, text) { row.hidden = false; bar.value = f; txt.textContent = text || ''; }, hide() { row.hidden = true; }, cancel };
}

export function download(name, data, type = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = el('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

export function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
export const csv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';

const CSS = `
.pc-panel{display:grid;gap:.6rem;font-size:.9em}
.pc-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.pc-panel summary{cursor:pointer;font-weight:600}
.pc-field{display:grid;gap:.15rem;margin:.3rem 0}
.pc-field-l{font-size:.85em}
.pc-hint{opacity:.75}
.pc-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin:.3rem 0}
.pc-note{opacity:.8;font-size:.85em;margin:.2rem 0}
.pc-progress{width:100%}
.pc-progress-row{display:grid;gap:.2rem;margin:.3rem 0}
.pc-table{border-collapse:collapse;width:100%}
.pc-table td,.pc-table th{padding:.1rem .3rem;text-align:left;border-bottom:1px solid var(--line,#7a8796)}
.pc-table td.num{text-align:right}
.pc-list{list-style:none;margin:0;padding:0}
.pc-list li{display:flex;gap:.4rem;align-items:center;justify-content:space-between;padding:.15rem 0}
.pc-overlay{position:fixed;z-index:60;cursor:crosshair;touch-action:none}
.pc-dialog{width:min(36rem,calc(100vw - 2rem))}
.pc-strip{display:block;width:100%;background:var(--sheet,#fff);border:1px solid var(--line,#7a8796)}
`;
let styled = false;
export function ensureStyle() {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const s = document.createElement('style');
  s.setAttribute('data-pc-style', '');
  s.textContent = CSS;
  document.head.append(s);
}
export function removeStyle() { document.querySelector('style[data-pc-style]')?.remove(); styled = false; }
