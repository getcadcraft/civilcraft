/* SPDX-License-Identifier: Apache-2.0 */
/**
 * super-ui.js — the corridor's Superelevation block in the alignment's Properties (0.4 V18): on/off, the maximum
 * relative gradient Δ, the rate table (radius ≥ → e, or normal crown), each curve's rate, runoff, runout and key
 * stations, problems, and the superelevation diagram (left and right lane slopes along the stations, on a canvas).
 * Every change is one undo step (project.change on alignment.corridor.super).
 *
 *   superProps(ctx, a, item) → nodes      ctx = { el, project: () => Project, units: () => 'ft'|'m', numInput, row, say }
 *                                         item = the corridor's graded item (its info.super = superPlan) or null
 *   drawDiagram(canvas, plan, { start, end, nc, units, colors })   (exported for tests)
 */

import { t } from './i18n.js';
import { SUPER_DEFAULTS, slopesAt } from './superelev.js';
import { formatStation, fixed } from './units.js';

export function superProps(ctx, a, item) {
  const { el } = ctx, P = ctx.project(), U = ctx.units();
  const out = [el('h3', { className: 'cv-h3' }, t('se.head'))];
  const cur = a.corridor?.super || null;
  const set = (label, fn) => P.change(label, (s) => { const c = s.alignments.find((x) => x.id === a.id).corridor; c.super = { ...SUPER_DEFAULTS(U), ...(c.super || {}) }; fn(c.super); });
  const on = el('input', { type: 'checkbox', id: 'cv-se-on', checked: !!cur?.on, 'data-se-on': '' });
  on.addEventListener('change', () => set(t(on.checked ? 'se.undo.on' : 'se.undo.off'), (sp) => { sp.on = on.checked; }));
  out.push(el('label', { className: 'cv-check', for: 'cv-se-on' }, on, ' ', t('se.on')));
  if (!cur?.on) { out.push(el('p', { className: 'cv-note' }, t('se.off.note'))); return out; }
  const delta = ctx.numInput((cur.delta * 100).toFixed(2), (v) => { const x = Number(v) / 100; if (!(x > 0 && x <= 0.05)) return false; set(t('se.undo.delta'), (sp) => { sp.delta = x; }); return true; }, { id: 'cv-se-delta', min: 0 });
  out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('se.delta'), el('div', { className: 'cv-row' }, delta, el('span', { className: 'cv-unit' }, '%')), 'cv-se-delta')));
  // rate table
  const tbody = el('tbody', { 'data-se-rate': '' });
  cur.rate.forEach(([r, e], i) => {
    const rIn = ctx.numInput(String(r), (v) => { const x = Number(v); if (!(x >= 0) || v === '') return false; set(t('se.undo.rate'), (sp) => { sp.rate[i][0] = x; sp.rate.sort((m, n) => n[0] - m[0]); }); return true; }, { label: t('se.rate.r.of', { n: i + 1 }), width: '6rem' });
    const eIn = ctx.numInput(e === null ? '' : (e * 100).toFixed(1), (v) => { const s = String(v).trim(); const x = s === '' ? null : Number(s) / 100; if (x !== null && !(x >= 0 && x <= 0.2)) return false; set(t('se.undo.rate'), (sp) => { sp.rate[i][1] = x; }); return true; }, { label: t('se.rate.e.of', { n: i + 1 }), text: true, calc: false, width: '5rem' });
    tbody.append(el('tr', {}, el('td', {}, rIn), el('td', {}, eIn),
      el('td', {}, cur.rate.length > 1 ? el('button', { type: 'button', className: 'cv-x', 'aria-label': t('se.rate.remove', { n: i + 1 }), onclick: () => set(t('se.undo.rate'), (sp) => { sp.rate.splice(i, 1); }) }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })) : '')));
  });
  out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' },
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('se.rate.r', { u: U === 'm' ? 'm' : 'ft' })), el('th', { scope: 'col' }, t('se.rate.e')), el('th', {}, el('span', { className: 'visually-hidden' }, t('se.rate.remove.col'))))), tbody)));
  out.push(el('button', { type: 'button', className: 'cv-linkbtn', 'data-se-add': '', onclick: () => set(t('se.undo.rate'), (sp) => { sp.rate.push([0, 0.06]); sp.rate.sort((m, n) => n[0] - m[0]); }) }, t('se.rate.add')));
  out.push(el('p', { className: 'cv-note' }, t('se.rate.note')));
  // each curve
  const plan = item?.super || null;
  if (plan?.problems?.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...plan.problems.map((m) => el('li', {}, m)))));
  if (plan?.curves?.length) {
    const st = (v) => formatStation(v, U);
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-se-curves': '' },
      el('thead', {}, el('tr', {}, ...['#', t('se.c.r'), 'e', t('se.c.lr'), t('se.c.lt'), t('se.c.full')].map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...plan.curves.map((c) => el('tr', {}, el('td', {}, String(c.i)), el('td', { className: 'num' }, fixed(c.R, 0)), el('td', { className: 'num' }, fixed(c.e * 100, 1) + '%'),
        el('td', { className: 'num' }, fixed(c.Lr, 1)), el('td', { className: 'num' }, fixed(c.Lt, 1)), el('td', {}, st(c.stations.fs0) + ' – ' + st(c.stations.fs1))))))));
    const cv = el('canvas', { className: 'cv-se-diagram', 'data-se-diagram': '', width: 600, height: 200, role: 'img', 'aria-label': t('se.diagram.label') });
    out.push(el('h3', { className: 'cv-h3' }, t('se.diagram')), cv);
    const al = P.alignment(a), nc = a.corridor.laneSlope;
    requestAnimationFrame(() => drawDiagram(cv, plan, { start: al.start, end: al.end, nc, units: U }));
  } else out.push(el('p', { className: 'cv-note' }, t('se.none')));
  return out;
}

/** The superelevation diagram: station across, lane cross slope up (positive = falls away from the crown is drawn DOWN,
 *  as on a typical diagram the low side is below the centre line): left lane solid, right lane dashed, key stations ticked. */
export function drawDiagram(cv, plan, { start, end, nc, units = 'ft', colors = null } = {}) {
  const dpr = globalThis.devicePixelRatio || 1, w = cv.clientWidth || 600, h = cv.clientHeight || 200;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cs = globalThis.getComputedStyle ? getComputedStyle(document.documentElement) : null, tok = (n, d) => cs?.getPropertyValue(n).trim() || d;
  const C = colors || { bg: tok('--sheet-2', '#fff'), ink: tok('--ink', '#17202b'), grid: tok('--grid', '#d5dde5'), L: tok('--layer-red', '#b3122e'), R: tok('--layer-blue', '#1e48c8') };
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  const emax = Math.max(nc, ...plan.curves.map((c) => c.e)) * 1.25;
  const pad = { l: 40, r: 8, t: 10, b: 22 };
  const X = (s) => pad.l + ((s - start) / Math.max(end - start, 1e-9)) * (w - pad.l - pad.r), Y = (v) => pad.t + ((v + emax) / (2 * emax)) * (h - pad.t - pad.b);
  ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = C.ink; ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (const v of [-emax / 1.25, -nc, 0, nc, emax / 1.25]) { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText((v > 0 ? '−' : v < 0 ? '+' : '') + fixed(Math.abs(v) * 100, 1) + '%', pad.l - 4, Y(v)); }
  const n = 400, line = (side, dash) => { ctx.strokeStyle = C[side]; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= n; i++) { const s = start + ((end - start) * i) / n, v = slopesAt(plan, s, nc)[side]; i ? ctx.lineTo(X(s), Y(v)) : ctx.moveTo(X(s), Y(v)); } ctx.stroke(); ctx.setLineDash([]); };
  line('L', []); line('R', [6, 4]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = C.ink;
  for (const c of plan.curves) for (const k of ['lc0', 'fs0', 'fs1', 'lc1']) { const x = X(c.stations[k]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, h - pad.b); ctx.lineTo(x, h - pad.b + 4); ctx.stroke(); }
  ctx.textAlign = 'left'; ctx.fillText(formatStation(start, units, 0), pad.l, h - pad.b + 6); ctx.textAlign = 'right'; ctx.fillText(formatStation(end, units, 0), w - pad.r, h - pad.b + 6);
}
