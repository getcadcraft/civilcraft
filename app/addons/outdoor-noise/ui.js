/* SPDX-License-Identifier: Apache-2.0 */
/** ui.js — small DOM helpers of the Outdoor noise add-on: el() (text only, never HTML), fields, a table, a download, the style. */
import { el } from '../../ui-util.js';
export { el };
export const field = (label, input) => el('label', { className: 'nz-field' }, el('span', {}, label), input);
export const num = (value, attrs = {}) => el('input', { type: 'number', value: value == null ? '' : String(value), step: 'any', ...attrs });
export function select(options, value, attrs = {}) { const s = el('select', attrs, ...options.map(([v, l]) => el('option', { value: String(v) }, l))); if (value !== undefined && value !== null) s.value = String(value); return s; }
export function table(head, rows, attrs = {}) {
  return el('div', { className: 'nz-scroll' }, el('table', { className: 'nz-table', ...attrs }, el('thead', {}, el('tr', {}, ...head.map((h) => el('th', {}, h)))),
    el('tbody', {}, ...rows.map((r) => el('tr', r.attrs || {}, ...r.cells.map((c) => (c instanceof Node ? el('td', {}, c) : el('td', {}, c == null ? '–' : String(c)))))))));
}
export function download(name, text, type = 'text/csv') {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a); a.click(); a.remove();
}
const CSS = `
.nz-panel{display:grid;grid-template-columns:minmax(0,1fr);gap:.6rem;font-size:.9em;min-width:0;max-width:100%}
.nz-panel>*,.nz-panel details>*{min-width:0;max-width:100%}
.nz-panel p{overflow-wrap:anywhere}
.nz-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.nz-panel summary{cursor:pointer;font-weight:600}
.nz-field{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;justify-content:space-between;margin:.25rem 0}
.nz-field input,.nz-field select,.nz-field textarea{max-width:9rem;min-width:0}
.nz-field textarea{max-width:100%;width:100%}
.nz-row input{width:5.5rem;min-width:0}
.nz-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0}
.nz-note{color:var(--ink-2,#5b6470);margin:.25rem 0}
.nz-warn{color:var(--danger,#b3261e)}
.nz-scroll{overflow-x:auto}
.nz-table{border-collapse:collapse;width:100%}
.nz-table th,.nz-table td{border-bottom:1px solid var(--line,#c8ced6);padding:.15rem .25rem;text-align:left;white-space:nowrap}
.nz-table input{width:4.2rem}
`;
let styleEl = null;
export function ensureStyle() { if (styleEl) return; styleEl = el('style', { 'data-nz-style': '' }); styleEl.textContent = CSS; document.head.append(styleEl); }
export function removeStyle() { styleEl?.remove(); styleEl = null; }
