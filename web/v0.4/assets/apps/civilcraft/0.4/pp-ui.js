/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pp-ui.js — the "Plan and profile sheets" dialog (0.4 V15): paper, plan scale, vertical exaggeration, station range,
 * ink; a live count of the sheets; Download PDF = one PDF, a page per sheet (pp-sheets.js + plot.js toPdfPages).
 *
 *   createSheetsDialog(ctx)   ctx = { root, el, project: () => Project, units: () => 'ft'|'m', buildScene(mmPerUnit),
 *                                     download, fileStem, say, refocus }
 *   → { open(alignmentId) }   window.civilcraft.sheets for tests (open, last)
 * The dialog is built here (dialog.cv-dialog[data-pp-dialog]); its fields: [data-pp-paper|scale|vex|from|to|ink],
 * [data-pp-info], [data-pp-go].
 */

import { t } from './i18n.js';
import { PAPERS, scalesFor } from './plot.js';
import { toPdfPages } from './plot.js';
import { sheetPlan, planProfileSheets, VEXES } from './pp-sheets.js';
import { formatStation, parseStation } from './units.js';

export function createSheetsDialog(ctx) {
  const { el } = ctx;
  const api = { last: null };
  let uid = 0;

  function open(alId) {
    const p = ctx.project(), a = p.state.alignments.find((x) => x.id === alId);
    const al = a && p.alignment(a);
    if (!al?.ok) { ctx.say(t('pp.ui.no.alignment')); return; }
    const U = ctx.units(), id = 'cv-pp-' + (++uid);
    const sel = (key, opts, value) => { const s = el('select', { className: 'cv-select', id: id + '-' + key, ['data-pp-' + key]: '' }, ...opts.map(([v, l]) => el('option', { value: v }, l))); if (value !== undefined) s.value = value; return s; };
    const paper = sel('paper', PAPERS.map((x) => [x.key, x.name]), U === 'm' ? 'a3' : 'tabloid');
    const scales = scalesFor(U);
    const scale = sel('scale', scales.map((s) => [s.label, s.label]), U === 'm' ? '1:500' : '1" = 40\'');
    const vex = sel('vex', VEXES.map((v) => [String(v), v + '×']), '10');
    const ink = sel('ink', [['color', t('pp.ui.ink.color')], ['mono', t('pp.ui.ink.mono')]], 'color');
    const from = el('input', { type: 'text', className: 'cv-input', id: id + '-from', 'data-pp-from': '', value: formatStation(al.start, U) });
    const to = el('input', { type: 'text', className: 'cv-input', id: id + '-to', 'data-pp-to': '', value: formatStation(al.end, U) });
    const info = el('p', { className: 'cv-note', 'data-pp-info': '' });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-pp-go': '' }, t('pp.ui.go'));
    const row = (label, input) => [el('label', { for: input.id }, label), input];
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('pp.ui.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': id + '-h', 'data-pp-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('pp.ui.title', { name: a.name })), close),
        el('div', { className: 'cv-dlg-body' },
          el('p', { className: 'cv-note' }, t('pp.ui.lede')),
          el('div', { className: 'cv-props' }, ...row(t('pp.ui.paper'), paper), ...row(t('pp.ui.scale'), scale), ...row(t('pp.ui.vex'), vex),
            ...row(t('pp.ui.from'), from), ...row(t('pp.ui.to'), to), ...row(t('pp.ui.ink'), ink)),
          info),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pp.ui.cancel')), go)));
    close.onclick = () => dlg.close();
    const range = () => {
      const f = parseStation(from.value, U), e = parseStation(to.value, U);
      if (f === null || e === null || !(e > f)) return null;
      return [Math.max(al.start, f), Math.min(al.end, e)];
    };
    const sc = () => scales.find((s) => s.label === scale.value);
    const update = () => {
      const r = range();
      for (const x of [from, to]) { if (r) x.removeAttribute('aria-invalid'); else x.setAttribute('aria-invalid', 'true'); }
      if (!r) { info.textContent = t('pp.ui.bad.range'); go.disabled = true; return; }
      const pl = sheetPlan(al, { paper: paper.value, scale: sc(), from: r[0], to: r[1], units: U });
      info.textContent = t('pp.ui.info', { n: pl.stations.length, len: String(+pl.length.toFixed(2)), u: U === 'm' ? 'm' : 'ft' });
      go.disabled = !pl.stations.length;
    };
    for (const x of [paper, scale, vex, from, to]) x.addEventListener(x.tagName === 'INPUT' ? 'input' : 'change', update);
    go.onclick = async () => {
      const r = range(); if (!r) return;
      const s = sc();
      const out = planProfileSheets(ctx.buildScene(s.mmPerUnit), { alignment: al, eg: p.egProfile(a), profile: a.pvis?.length >= 2 ? p.designProfile(a) : null, paper: paper.value, scale: s, vex: Number(vex.value), units: U, title: p.state.name, name: a.name, from: r[0], to: r[1] });
      const { bytes, report } = await toPdfPages(out.sheets, { mono: ink.value === 'mono', title: p.state.name + ' ' + a.name });
      const file = t('pp.ui.file', { stem: ctx.fileStem(), name: a.name });
      ctx.download(bytes, file, 'application/pdf');
      api.last = { sheets: out.sheets.length, vex: out.vex, notes: out.notes, bytes: bytes.length, file };
      dlg.close();
      ctx.say([t('pp.ui.done', { n: out.sheets.length, file }), ...out.notes, ...(report.missing ? [t('pp.ui.missing', { n: report.missing })] : [])].join(' '));
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    update();
    dlg.showModal();
    go.focus();
  }
  api.open = open;
  return api;
}
