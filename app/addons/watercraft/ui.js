/* SPDX-License-Identifier: Apache-2.0 */
/** ui.js — small DOM helpers of the WaterCraft add-on: el() (text only, never HTML), a labelled field, a table, a download. */
import { el } from '../../ui-util.js';
export { el };

export const field = (label, input) => el('label', { className: 'wn-field' }, el('span', {}, label), input);
export const numInput = (value, attrs = {}) => el('input', { type: 'number', value: String(value), step: 'any', ...attrs });
export function select(options, value) { const s = el('select', {}, ...options.map(([v, l]) => el('option', { value: String(v) }, l))); s.value = String(value); return s; }
export function table(head, rows) {
  return el('table', { className: 'wn-table' }, el('thead', {}, el('tr', {}, ...head.map((h) => el('th', {}, h)))),
    el('tbody', {}, ...rows.map((r) => el('tr', { className: r.cls || '' }, ...r.cells.map((c) => el('td', {}, c == null ? '–' : String(c)))))));
}
export function download(name, text, type = 'text/csv') {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a); a.click(); a.remove();
}
const CSS = `
.wn-panel{display:grid;gap:.6rem;font-size:.9em}
.wn-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.wn-panel summary{cursor:pointer;font-weight:600}
.wn-field{display:grid;gap:.15rem;margin:.3rem 0}
.wn-field input,.wn-field select,.wn-field textarea{width:100%;box-sizing:border-box}
.wn-note{opacity:.8;font-size:.9em;margin:.2rem 0}
.wn-table{width:100%;border-collapse:collapse;font-size:.85em;margin:.4rem 0}
.wn-table th,.wn-table td{border-bottom:1px solid var(--line,#7a8796);padding:.15rem .3rem;text-align:left}
.wn-table tr.bad td{color:var(--bad,#c0392b)}
.wn-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
`;
let styled = false;
export function ensureStyle() {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const s = document.createElement('style'); s.setAttribute('data-wn-style', ''); s.textContent = CSS; document.head.append(s);
}
export function removeStyle() { document.querySelector('style[data-wn-style]')?.remove(); styled = false; }
