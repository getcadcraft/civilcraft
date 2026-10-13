/* SPDX-License-Identifier: Apache-2.0 */
/**
 * staking-ui.js — the Staking report dialog (0.4 V23), opened from an alignment's Properties: stakes at stations and
 * offsets (from, to, every, the offsets typed or the corridor's edges, key stations, numbering) or the survey points near
 * the alignment; a preview, then the report as CSV or PDF pages. Design elevations come from the corridor (the graded
 * surface) where the alignment has one, else from its design profile on the centerline; ground from the existing surface.
 * The numbers are staking.js's (bin/test-civilcraft-staking.mjs).
 *
 *   createStaking(ctx) → { button(a), open(a) }
 *   ctx = { root, el, project: () => Project, units, say, refocus(), download(name, blob), fileStem() }
 */

import { t } from './i18n.js';
import { stakeStations, stakeRows, pointRows, parseOffsets, stakingCsv, stakingSheets, cutFillText, offsetText } from './staking.js';
import { toPdfPages, PAPERS } from './plot.js';
import { formatStation, parseStation, fixed } from './units.js';

export function createStaking(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), L = () => (U() === 'm' ? 'm' : 'ft');

  const button = (a) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sk-open': '', onclick: () => open(a) },
    el('i', { className: 'bi bi-pin-map', 'aria-hidden': 'true' }), ' ', t('sk.open'));

  /** design(sta, off, x, y): the graded surface inside the corridor, else the design profile on the centerline. */
  function designFor(a) {
    const prof = P().designProfile(a), corr = a.corridor?.on ? P().graded() : null;
    const item = corr?.items?.find((x) => x.id === a.id && x.kind === 'corridor');
    const region = item && !item.problems?.length ? item.region : null;   // the daylight outline: lanes, shoulders and side slopes
    return (sta, off, x, y) => {
      if (region && corr.surface && inPoly(x, y, region)) { const z = corr.surface.elevationAt(x, y, 1e-6); if (z !== null) return z; }
      if (Math.abs(off) < 1e-9 && prof?.ok) { const z = prof.elevationAt(sta); return Number.isFinite(z) ? z : null; }
      return null;
    };
  }

  function open(a) {
    const al = P().alignment(a);
    if (!al.ok) { ctx.say(t('sk.noal')); return; }
    const id = 'cv-sk', U0 = U();
    const inp = (sfx, value, attrs = {}) => el('input', { type: 'text', className: 'cv-input', id: id + '-' + sfx, value, ...attrs });
    const src = el('select', { className: 'cv-select', id: id + '-src' }, el('option', { value: 'grid' }, t('sk.src.grid')), el('option', { value: 'pts' }, t('sk.src.pts')));
    const from = inp('from', formatStation(al.start, U0), { style: 'width:8rem' }), to = inp('to', formatStation(al.end, U0), { style: 'width:8rem' });
    const step = inp('step', U0 === 'm' ? '20' : '50', { inputMode: 'decimal', style: 'width:6rem' });
    const c = a.corridor;
    const edges = c?.on ? [-(c.lane + c.shoulder), -c.lane, 0, c.lane, c.lane + c.shoulder] : [0];
    const offs = inp('offs', edges.map(offsetText).join(', '), { style: 'width:18rem' });
    const keys = el('input', { type: 'checkbox', id: id + '-keys', checked: true });
    const first = inp('first', '1', { inputMode: 'numeric', style: 'width:6rem' }), prefix = inp('prefix', '', { maxLength: 8, style: 'width:5rem' });
    const near = inp('near', U0 === 'm' ? '15' : '50', { inputMode: 'decimal', style: 'width:6rem' });
    const paper = el('select', { className: 'cv-select', id: id + '-paper' }, ...PAPERS.map((p) => el('option', { value: p.key }, p.name)));
    paper.value = U0 === 'm' ? 'a4' : 'letter';
    const report = el('div', { 'aria-live': 'polite', 'data-sk-report': '' });
    const csvB = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sk-csv': '', disabled: true }, el('i', { className: 'bi bi-download', 'aria-hidden': 'true' }), ' CSV');
    const pdfB = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-sk-pdf': '', disabled: true }, el('i', { className: 'bi bi-file-earmark-pdf', 'aria-hidden': 'true' }), ' PDF');
    const closeBtn = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const lab = (input, text) => el('label', { for: input.id }, text);
    const gridBox = el('div', { 'data-sk-grid': '' },
      el('div', { className: 'cv-row' }, lab(from, t('sk.from')), from, lab(to, t('sk.to')), to, lab(step, t('sk.every', { u: L() })), step),
      el('div', { className: 'cv-row' }, lab(offs, t('sk.offs', { u: L() })), offs),
      el('label', { className: 'cv-check', for: keys.id }, keys, ' ', t('sk.keys')),
      el('div', { className: 'cv-row' }, lab(first, t('sk.first')), first, lab(prefix, t('sk.prefix')), prefix));
    const ptsBox = el('div', { 'data-sk-ptsbox': '' }, el('div', { className: 'cv-row' }, lab(near, t('sk.near', { u: L() })), near), el('p', { className: 'cv-note' }, t('sk.pts.note')));
    let rows = null;
    function update() {
      gridBox.hidden = src.value !== 'grid'; ptsBox.hidden = src.value !== 'pts';
      rows = null; csvB.disabled = pdfB.disabled = true;
      const errs = [], design = designFor(a), egS = P().eg().surface, ground = (x, y) => egS?.elevationAt(x, y, 1e-6) ?? null;
      let notes = [];
      if (src.value === 'grid') {
        const f = parseStation(from.value), tt = parseStation(to.value), s = Number(step.value), o = parseOffsets(offs.value), n0 = Number(first.value);
        if (!Number.isFinite(f) || !Number.isFinite(tt)) errs.push(t('sk.err.sta'));
        if (!(s > 0)) errs.push(t('sk.err.step'));
        if (o.error !== undefined) errs.push(t('sk.err.off', { tok: o.error }));
        else if (!o.length) errs.push(t('sk.err.nooff'));
        if (!Number.isInteger(n0) || n0 < 0) errs.push(t('sk.err.first'));
        if (!errs.length) {
          const st = stakeStations(al, { from: f, to: tt, step: s, keys: keys.checked });
          if (st.length * o.length > 20000) errs.push(t('sk.err.many', { n: st.length * o.length }));
          else rows = stakeRows(al, { stations: st, offsets: o, design, ground, first: n0, prefix: prefix.value.replace(/[\u0000-\u001f\u007f,"]/g, '').trim() });
        }
      } else {
        const d = Number(near.value);
        if (!(d > 0)) errs.push(t('sk.err.near'));
        else {
          const cand = P().points.filter((q) => { const so = al.stationOffset(q.x, q.y); return so && !so.outside && Math.abs(so.off) <= d; });
          const r = pointRows(al, cand, { design });
          rows = r.rows;
          if (!rows.length) errs.push(t('sk.err.nopts'));
        }
      }
      if (errs.length) { rows = null; report.replaceChildren(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...errs.map((m) => el('li', {}, m))))); return; }
      const withDesign = rows.filter((r) => r.design !== null).length;
      if (withDesign < rows.length) notes.push(t('sk.nodesign', { n: rows.length - withDesign }));
      const shown = rows.slice(0, 12);
      report.replaceChildren(
        el('p', { className: 'cv-note', 'data-sk-count': '' }, t('sk.count', { n: rows.length })),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-sk-table': '' },
          el('thead', {}, el('tr', {}, ...[t('sk.c.point'), t('sk.c.sta'), t('sk.c.off', { u: L() }), t('sk.c.design'), t('sk.c.ground'), t('sk.c.cf', { u: L() })].map((h) => el('th', { scope: 'col' }, h)))),
          el('tbody', {}, ...shown.map((r) => el('tr', {}, el('td', {}, String(r.id)), el('td', {}, formatStation(r.sta, U())), el('td', { className: 'num' }, offsetText(r.off)),
            el('td', { className: 'num' }, r.design === null ? '—' : fixed(r.design, 2)), el('td', { className: 'num' }, r.ground === null ? '—' : fixed(r.ground, 2)), el('td', { className: 'num' }, cutFillText(r.cf) || '—')))))),
        ...(rows.length > shown.length ? [el('p', { className: 'cv-note' }, t('sk.more', { n: rows.length - shown.length }))] : []),
        ...notes.map((m) => el('p', { className: 'cv-note' }, m)));
      csvB.disabled = pdfB.disabled = false;
    }
    for (const x of [from, to, step, offs, first, prefix, near]) x.addEventListener('input', update);
    for (const x of [src, keys]) x.addEventListener('change', update);
    const stem = () => ctx.fileStem() + ' - ' + a.name.replace(/[\\/:*?"<>|]/g, '_') + ' staking';
    csvB.onclick = () => { if (rows) { ctx.download(stem() + '.csv', new Blob(['﻿' + stakingCsv(rows, { units: U(), title: a.name + ' ' + t('sk.title') })], { type: 'text/csv' })); ctx.say(t('sk.saved.csv', { n: rows.length })); } };
    pdfB.onclick = async () => {
      if (!rows) return;
      const { sheets } = stakingSheets(rows, { paper: paper.value, landscape: true, units: U(), title: a.name + ' ' + t('sk.title'), name: a.name });
      const { bytes, report: rep } = await toPdfPages(sheets, { title: a.name + ' ' + t('sk.title') });
      ctx.download(stem() + '.pdf', new Blob([bytes], { type: 'application/pdf' }));
      ctx.say(t('sk.saved.pdf', { n: rows.length, p: rep.pages }));
    };
    const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-sk-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('sk.dlg', { name: a.name })), closeBtn),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-row' }, lab(src, t('sk.src')), src),
          gridBox, ptsBox,
          el('div', { className: 'cv-row' }, lab(paper, t('sk.paper')), paper),
          el('p', { className: 'cv-note' }, t(a.corridor?.on ? 'sk.design.corr' : 'sk.design.prof')),
          report),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pc.dlg.cancel')), csvB, pdfB)));
    closeBtn.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    update();
    dlg.showModal();
    from.focus();
  }
  return { button, open };
}

function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
