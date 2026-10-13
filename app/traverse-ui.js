/* SPDX-License-Identifier: Apache-2.0 */
/**
 * traverse-ui.js — the Traverse dialog (0.4 V22): where it starts (a survey point, or a northing and easting), angles right
 * from a backsight (a survey point, or an azimuth) or bearings, the legs typed or pasted, where it ends (back at the start,
 * or on a survey point); read as you type: the angular and linear misclosure, the precision and the stations after the
 * compass adjustment. Add them as survey points (one undo step) or, for a loop, as a parcel; download the report (CSV).
 * The numbers are traverse.js's (bin/test-civilcraft-traverse.mjs).
 *
 *   createTraverse(ctx) → { block(), open() }
 *   ctx = { root, el, project: () => Project, units, say, refocus(), download(name, blob), fileStem(), addParcel(name, pts),
 *           afterPoints(numbers) }
 */

import { t } from './i18n.js';
import { parseTraverse, runTraverse, traverseReport } from './traverse.js';
import { parseAngle } from './parcels.js';
import { bearing, dms, fixed, grouped } from './units.js';

export function createTraverse(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), L = () => (U() === 'm' ? 'm' : 'ft');

  function block() {
    return [el('h3', { className: 'cv-h3' }, t('tv.head')),
      el('p', { className: 'cv-note' }, t('tv.lede')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-tv-open': '', onclick: () => open() },
        el('i', { className: 'bi bi-bezier2', 'aria-hidden': 'true' }), ' ', t('tv.open')))];
  }

  const pointBy = (n) => P().points.find((q) => q.n === n.trim());
  function open() {
    const id = 'cv-tv';
    const inp = (sfx, attrs = {}) => el('input', { type: 'text', className: 'cv-input', id: id + '-' + sfx, ...attrs });
    const startPt = inp('pt', { maxLength: 40, style: 'width:7rem' }), north = inp('n', { inputMode: 'decimal', style: 'width:9rem' }), east = inp('e', { inputMode: 'decimal', style: 'width:9rem' });
    const mode = el('select', { className: 'cv-select', id: id + '-mode' }, el('option', { value: 'angles' }, t('tv.mode.angles')), el('option', { value: 'bearings' }, t('tv.mode.bearings')));
    const bsPt = inp('bs', { maxLength: 40, style: 'width:7rem' }), bsAz = inp('az', { style: 'width:9rem', placeholder: '90°00\'00"' });
    const ends = el('select', { className: 'cv-select', id: id + '-ends' }, el('option', { value: 'loop' }, t('tv.ends.loop')), el('option', { value: 'pt' }, t('tv.ends.pt')));
    const endPt = inp('end', { maxLength: 40, style: 'width:7rem', 'aria-label': t('tv.ends.pt.num') });
    const legs = el('textarea', { className: 'cv-input cv-calls', id: id + '-legs', rows: 9, spellcheck: false, 'data-tv-legs': '' });
    const report = el('div', { 'aria-live': 'polite', 'data-tv-report': '' });
    const addPts = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-tv-points': '', disabled: true }, t('tv.add.points'));
    const addPc = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-tv-parcel': '', disabled: true }, t('tv.add.parcel'));
    const csv = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-tv-csv': '', disabled: true }, el('i', { className: 'bi bi-download', 'aria-hidden': 'true' }), ' ', t('tv.csv'));
    const closeBtn = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const lab = (input, text) => el('label', { for: input.id }, text);
    const bsRow = el('div', { className: 'cv-row', 'data-tv-bs': '' }, lab(bsPt, t('tv.bs.pt')), bsPt, lab(bsAz, t('tv.bs.az')), bsAz);
    let res = null;
    function start() {
      if (startPt.value.trim()) { const q = pointBy(startPt.value); return q ? { x: q.x, y: q.y, n: q.n } : { error: t('pc.dlg.nopt', { n: startPt.value.trim() }) }; }
      if (!north.value.trim() && !east.value.trim()) return { error: t('pc.dlg.nostart') };
      const x = Number(east.value), y = Number(north.value);
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : { error: t('pc.dlg.badne') };
    }
    function update() {
      bsRow.hidden = mode.value !== 'angles';
      endPt.hidden = ends.value !== 'pt';
      legs.placeholder = mode.value === 'angles' ? '270°00\'00" 125.50 2\n89 59 50 98.20 3\n…\nclose 270°00\'05"' : 'N 0°00\'00" E 125.50 2\nN 89°59\'50" E 98.20 3\n…';
      res = null; addPts.disabled = addPc.disabled = csv.disabled = true;
      const s = start(), p = parseTraverse(legs.value, mode.value), errs = [];
      if (s.error) errs.push(s.error);
      let backsight = 0;
      if (mode.value === 'angles') {
        if (bsPt.value.trim()) { const q = pointBy(bsPt.value); if (!q) errs.push(t('pc.dlg.nopt', { n: bsPt.value.trim() })); else if (!s.error) { backsight = (90 - (Math.atan2(q.y - s.y, q.x - s.x) * 180) / Math.PI + 360) % 360; } }
        else if (bsAz.value.trim()) { const a = parseAngle(bsAz.value); if (a === null || a >= 360) errs.push(t('tv.err.bsaz')); else backsight = a; }
        else errs.push(t('tv.err.bs'));
      }
      let close = 'loop';
      if (ends.value === 'pt') { const q = pointBy(endPt.value || ''); if (!q) errs.push(endPt.value.trim() ? t('pc.dlg.nopt', { n: endPt.value.trim() }) : t('tv.err.end')); else close = { x: q.x, y: q.y }; }
      for (const e of p.errors.slice(0, 20)) errs.push(t('pc.dlg.line', { n: e.line }) + ' ' + e.msg);
      if (!p.legs.length && !p.errors.length) { report.replaceChildren(el('p', { className: 'cv-note' }, t(mode.value === 'angles' ? 'tv.help.angles' : 'tv.help.bearings'))); return; }
      if (p.legs.length < 2) errs.push(t('tv.few'));
      if (errs.length) { report.replaceChildren(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...errs.map((m) => el('li', {}, m))))); return; }
      res = runTraverse({ start: s, mode: mode.value, backsight, legs: p.legs, close, closingAngle: p.closingAngle });
      res.startPoint = s;
      const row = (k, v, attr) => [el('span', { className: 'k' }, k), el('span', { className: 'v', ...(attr ? { [attr]: '' } : {}) }, v)];
      const am = res.angular.misclosure;
      const facts = el('div', { className: 'cv-props' },
        ...row(t('tv.r.angular'), am === null ? t(mode.value === 'angles' ? 'tv.noclose' : 'tv.nobearing') : (am < 0 ? '−' : '+') + dms(Math.abs(am)) + ' ' + t('tv.per', { a: (res.angular.perAngle < 0 ? '−' : '+') + dms(Math.abs(res.angular.perAngle)) }), 'data-tv-ang'),
        ...row(t('tv.r.linear', { u: L() }), fixed(res.linear.dist, 3) + ' ' + L() + (res.linear.dist > 1e-9 ? ', ' + bearing(res.linear.dir) : ''), 'data-tv-lin'),
        ...row(t('tv.r.length', { u: L() }), fixed(res.length, 2) + ' ' + L()),
        ...row(t('tv.r.precision'), Number.isFinite(res.precision) && res.precision < 1e9 ? '1 : ' + grouped(res.precision, 0) : t('tv.r.exact'), 'data-tv-prec'));
      const shown = res.stations.slice(0, 60);
      const table = el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tv-table': '' },
        el('thead', {}, el('tr', {}, ...[t('tv.r.station'), t('tv.r.an'), t('tv.r.ae'), t('tv.r.corr', { u: L() })].map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...shown.map((st, i) => el('tr', {}, el('td', {}, st.name || String(i + 1)), el('td', { className: 'num' }, fixed(st.ay, 3)), el('td', { className: 'num' }, fixed(st.ax, 3)), el('td', { className: 'num' }, fixed(Math.hypot(st.cx, st.cy), 3)))))));
      report.replaceChildren(facts, table, ...(res.stations.length > shown.length ? [el('p', { className: 'cv-note' }, t('tv.more', { n: res.stations.length - shown.length }))] : []), el('p', { className: 'cv-note' }, t('tv.compass')));
      addPts.disabled = csv.disabled = false;
      addPc.disabled = close !== 'loop';
    }
    for (const x of [startPt, north, east, bsPt, bsAz, endPt, legs]) x.addEventListener('input', update);
    for (const x of [mode, ends]) x.addEventListener('change', update);
    const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-tv-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('tv.title')), closeBtn),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-row' }, lab(startPt, t('pc.dlg.pt')), startPt, lab(north, t('pc.dlg.n')), north, lab(east, t('pc.dlg.e')), east),
          el('div', { className: 'cv-row' }, lab(mode, t('tv.mode')), mode),
          bsRow,
          el('div', { className: 'cv-row' }, lab(ends, t('tv.ends')), ends, endPt),
          el('label', { for: legs.id, className: 'cv-block-label' }, t('tv.legs')), legs,
          report),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pc.dlg.cancel')), csv, addPc, addPts)));
    closeBtn.onclick = () => dlg.close();
    csv.onclick = () => { if (res) ctx.download(ctx.fileStem() + ' - traverse.csv', new Blob(['﻿' + traverseReport(res, { units: U() })], { type: 'text/csv' })); };
    addPts.onclick = () => {
      if (!res) return;
      const taken = new Set(P().points.map((q) => q.n));
      let next = P().points.reduce((m, q) => (/^\d+$/.test(q.n) ? Math.max(m, Number(q.n)) : m), 0) + 1;
      const fresh = () => { while (taken.has(String(next))) next++; return String(next++); };
      const sts = res.close === 'loop' ? res.stations.slice(0, -1) : res.stations;   // a loop's last station is its start
      const pts = sts.map((st) => { const n = st.name && !taken.has(st.name) ? st.name : fresh(); taken.add(n); return { n, x: st.ax, y: st.ay, z: null, d: 'TRAV' }; });
      P().editPoints(t('tv.undo.points', { n: pts.length }), (all) => all.concat(pts));
      dlg.close();
      ctx.afterPoints(pts.map((q) => q.n));
      ctx.say(t('tv.added', { n: pts.length, first: pts[0].n, last: pts.at(-1).n }));
    };
    addPc.onclick = () => {
      if (!res || res.close !== 'loop') return;
      const pts = [{ x: res.startPoint.x, y: res.startPoint.y }, ...res.stations.slice(0, -1).map((st) => ({ x: st.ax, y: st.ay }))];
      dlg.close();
      ctx.addParcel(t('tv.parcel'), pts, res.startPoint.n ? t('pc.dlg.from.pt', { n: res.startPoint.n }) : null);
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    update();
    dlg.showModal();
    startPt.focus();
  }
  return { block, open };
}
