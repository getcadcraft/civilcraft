/* SPDX-License-Identifier: Apache-2.0 */
/**
 * storm-route-ui.js — "Route a storm" under the storm drainage results (0.8 LC.16, session oltl2-b_PART_3). The numbers come from storm-route.js (DOM-free,
 * bin/test-civilcraft-storm-route.mjs); this file is the block in the network's Properties: rain duration and intensity (blank = the rainfall curve), the table per pipe,
 * the outlet's hydrograph as a small plan-sheet chart, and its CSV. Nothing here changes the project: the settings last for the session, the result is worked out
 * again on every redraw while it is switched on.
 *
 *   createRoute(ctx) → { block(net) }       ctx = { el, project: () => Project, units: () => 'ft'|'m', numInput, row, say, select(sel), refresh() }
 */
import { t } from './i18n.js';
import { route, hydrographCsv } from './storm-route.js';
import { fixed } from './units.js';

export function createRoute(ctx) {
  const { el } = ctx;
  const U = () => ctx.units(), qU = () => (U() === 'm' ? 'm³/s' : 'cfs'), iU = () => (U() === 'm' ? 'mm/h' : 'in/h');
  const st = { on: false, duration: '', rain: '' };
  const num = (s) => { const x = Number(String(s).trim()); return String(s).trim() !== '' && Number.isFinite(x) && x > 0 ? x : undefined; };

  function chart(r, o) {
    const W = 300, H = 110, m = 4, ns = 'http://www.w3.org/2000/svg', tMax = r.t[r.t.length - 1] || 1, qMax = Math.max(o.peak, 1e-9);
    const pts = r.t.map((tt, j) => `${(m + (tt / tMax) * (W - 2 * m)).toFixed(1)},${(H - m - (o.q[j] / qMax) * (H - 2 * m)).toFixed(1)}`).join(' ');
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'cv-chart'); svg.setAttribute('role', 'img'); svg.setAttribute('data-rt-chart', '');
    svg.setAttribute('aria-label', t('rt.chart', { q: fixed(o.peak, 2), u: qU(), m: fixed(o.tPeak, 0) }));
    const line = document.createElementNS(ns, 'polyline');
    line.setAttribute('points', pts); line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'currentColor'); line.setAttribute('stroke-width', '1.5'); line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(line);
    return svg;
  }
  function csvDownload(r, id, name) {
    const a = el('a', { href: URL.createObjectURL(new Blob(['﻿' + hydrographCsv(r, id, U())], { type: 'text/csv' })), download: (name || 'outlet').replace(/[^\w.-]+/g, '-') + '-hydrograph.csv' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); ctx.say(t('rt.saved'));
  }

  function block(net) {
    if (!net || !net.pipes.length || !(net.catchments || []).length) return [];
    const out = [el('h3', { className: 'cv-h3', 'data-rt-head': '' }, t('rt.head')), el('p', { className: 'cv-note' }, t('rt.lead'))];
    const dur = ctx.numInput(st.duration, (s) => { if (String(s).trim() !== '' && !num(s)) return false; st.duration = String(s).trim(); if (st.on) ctx.refresh(); return true; }, { id: 'cv-rt-dur', width: '5rem' });
    const rain = ctx.numInput(st.rain, (s) => { if (String(s).trim() !== '' && !num(s)) return false; st.rain = String(s).trim(); if (st.on) ctx.refresh(); return true; }, { id: 'cv-rt-rain', width: '5rem' });
    dur.placeholder = t('rt.auto'); rain.placeholder = t('rt.idf');
    out.push(el('div', { className: 'cv-props', 'data-rt-settings': '' },
      ...ctx.row(t('rt.dur'), el('div', { className: 'cv-row' }, dur, el('span', { className: 'cv-unit' }, 'min')), 'cv-rt-dur'),
      ...ctx.row(t('rt.rain'), el('div', { className: 'cv-row' }, rain, el('span', { className: 'cv-unit' }, iU())), 'cv-rt-rain')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-rt-run': '', 'aria-pressed': String(st.on),
      onclick: () => { st.on = !st.on; ctx.refresh(); } }, t(st.on ? 'rt.hide' : 'rt.run'))));
    if (!st.on) return out;
    const r = route(net, U(), { duration: num(st.duration), rain: num(st.rain) });
    if (!r.steps) { out.push(el('p', { className: 'cv-note', 'data-rt-none': '' }, t('rt.none'))); return out; }
    out.push(el('p', { className: 'cv-note', 'data-rt-storm': '' }, t('rt.storm', { d: fixed(r.duration, 0), i: fixed(r.rain, 2), u: iU() })));
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-rt-results': '' },
      el('thead', {}, el('tr', {}, ...[t('dr.r.pipe'), t('rt.r.in', { u: qU() }), t('rt.r.out', { u: qU() }), t('rt.r.att'), t('rt.r.ratio'), t('rt.r.when')].map((x) => el('th', { scope: 'col' }, x)))),
      el('tbody', {}, ...net.pipes.map((p) => {
        const f = r.pipes.get(p.id);
        return el('tr', { className: f?.over ? 'is-warn' : '' },
          el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'pipe', id: p.id }) }, p.name)),
          el('td', { className: 'num' }, f ? fixed(f.peakIn, 2) : '—'), el('td', { className: 'num' }, f ? fixed(f.peakOut, 2) : '—'),
          el('td', { className: 'num' }, f ? fixed(f.att * 100, 0) + ' %' : '—'), el('td', { className: 'num' }, f ? fixed(f.ratio * 100, 0) + ' %' : '—'),
          el('td', { className: 'num' }, f ? fixed(f.tPeakOut, 0) + ' min' : '—'));
      })))));
    for (const o of r.outlets) {
      const name = net.structures.find((s) => s.id === o.id)?.name || o.id;
      out.push(el('div', { className: 'cv-rt-outlet', 'data-rt-outlet': o.id },
        el('p', { className: 'cv-note' }, t('rt.outlet', { name, q: fixed(o.peak, 2), u: qU(), m: fixed(o.tPeak, 0) })), chart(r, o),
        el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-rt-csv': '', onclick: () => csvDownload(r, o.id, name) }, t('rt.csv')))));
    }
    if (r.problems.length) out.push(el('div', { className: 'cv-report is-error', 'data-rt-problems': '' }, el('ul', {}, ...r.problems.slice(0, 40).map((q) => el('li', {}, q.msg)))));
    out.push(el('p', { className: 'cv-note' }, t('rt.method')));
    return out;
  }
  return { block };
}
