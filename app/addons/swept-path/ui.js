/* SPDX-License-Identifier: Apache-2.0 */
/** ui.js — small DOM helpers of the Swept path add-on: el() (text only, never HTML), a labelled field, a table, a download, the picture of a run. */
import { el } from '../../ui-util.js';
export { el };

export const field = (label, input) => el('label', { className: 'sp-field' }, el('span', {}, label), input);
export const numInput = (value, attrs = {}) => el('input', { type: 'number', value: String(value), step: 'any', ...attrs });
export function select(options, value) { const s = el('select', {}, ...options.map(([v, l]) => el('option', { value: String(v) }, l))); if (value !== undefined) s.value = String(value); return s; }
export function table(head, rows) {
  return el('table', { className: 'sp-table' }, el('thead', {}, el('tr', {}, ...head.map((h) => el('th', {}, h)))),
    el('tbody', {}, ...rows.map((r) => el('tr', { className: r.cls || '' }, ...r.cells.map((c) => el('td', {}, c == null ? '–' : String(c)))))));
}
export function download(name, text, type = 'text/csv') {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a); a.click(); a.remove();
}
const NS = 'http://www.w3.org/2000/svg';
const sv = (name, attrs = {}) => { const n = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
const pts = (P) => P.map((p) => p.x.toFixed(3) + ',' + p.y.toFixed(3)).join(' ');
/** A plan picture of a run: the path, the obstacles, every few bodies faint, the one at `index` bold, conflicts marked. y is flipped so north is up. */
export function runPicture(res, { path = [], obstacles = [], conflicts = [], index = 0 } = {}) {
  const all = [...path, ...obstacles.flatMap((o) => o.pts), ...res.frames.flatMap((f) => f.bodies.flat())];
  if (!all.length) return el('div');
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const p of all) { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); }
  const w = Math.max(c - a, 1e-6), h = Math.max(d - b, 1e-6), pad = Math.max(w, h) * 0.04, lw = Math.max(w, h) / 400;
  const svg = sv('svg', { viewBox: `${a - pad} ${-(d + pad)} ${w + 2 * pad} ${h + 2 * pad}`, class: 'sp-pic', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  const g = sv('g', { transform: 'scale(1,-1)', 'stroke-width': lw, fill: 'none' }); svg.append(g);
  for (const o of obstacles) g.append(sv(o.closed ? 'polygon' : 'polyline', { points: pts(o.pts), stroke: 'currentColor', opacity: 0.55, 'stroke-width': lw * 1.5 }));
  if (path.length) g.append(sv('polyline', { points: pts(path), stroke: '#2f6fda', 'stroke-dasharray': `${lw * 6} ${lw * 4}` }));
  const k = Math.max(1, Math.ceil(res.frames.length / 40));
  res.frames.forEach((f, i) => { if (i % k === 0) for (const B of f.bodies) g.append(sv('polygon', { points: pts(B), stroke: '#888', opacity: 0.35 })); });
  const f = res.frames[Math.min(index, res.frames.length - 1)];
  if (f) for (const B of f.bodies) g.append(sv('polygon', { points: pts(B), stroke: '#d9822b', 'stroke-width': lw * 2.2, fill: 'rgba(217,130,43,.18)' }));
  for (const cf of conflicts) g.append(sv('circle', { cx: cf.at.x, cy: cf.at.y, r: Math.max(w, h) / 90, fill: '#c0392b', stroke: 'none' }));
  return svg;
}
const CSS = `
.sp-panel{display:grid;gap:.6rem;font-size:.9em}
.sp-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.sp-panel summary{cursor:pointer;font-weight:600}
.sp-field{display:grid;gap:.15rem;margin:.3rem 0}
.sp-field input,.sp-field select,.sp-field textarea{width:100%;box-sizing:border-box}
.sp-note{opacity:.8;font-size:.9em;margin:.2rem 0}
.sp-warn{color:var(--bad,#c0392b);font-weight:600}
.sp-table{width:100%;border-collapse:collapse;font-size:.85em;margin:.4rem 0}
.sp-table th,.sp-table td{border-bottom:1px solid var(--line,#7a8796);padding:.15rem .3rem;text-align:left}
.sp-table tr.bad td{color:var(--bad,#c0392b)}
.sp-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
.sp-pic{width:100%;height:14rem;background:var(--paper,transparent);border:1px solid var(--line,#7a8796);border-radius:4px;color:var(--ink,#222)}
`;
let styled = false;
export function ensureStyle() { if (styled) return; const s = document.createElement('style'); s.id = 'sp-style'; s.textContent = CSS; document.head.append(s); styled = true; }
export function removeStyle() { document.getElementById('sp-style')?.remove(); styled = false; }
