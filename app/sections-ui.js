/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sections-ui.js — sample lines and the section view in the page (0.4 V13). Everything it computes comes from
 * project.sections(a) (sections.js); this file only shows it. civilcraft.js creates one with createSections(ctx):
 *
 *   ctx = { root, el, project: () => Project, units: () => 'ft'|'m', say, download, fileStem, numInput, row, layout (after
 *           the panel opens or closes), focusAlignment(id) (select it), otherPanel(false) (close the profile view) }
 *   → { show(on, alId), toggle(), isOpen(), render(), props(a) → nodes for the alignment's Properties,
 *       sceneItems(alignments) → plan items (layer C-ROAD-SCTN), overlay(ctx, toScreen, colors) (the current section),
 *       current() → { alignment id, index, section } for tests }
 *
 * The panel ([data-sections-panel], ui.inc): alignment select, previous / station select / next, exaggeration
 * (fit, 1×, 2×, 5×, 10×), the readout (this section's cut and fill areas; the alignment's end-area volumes), CSV.
 * Keys on the section canvas: ← → previous / next, Home / End first / last.
 */

import { t } from './i18n.js';
import { SectionView } from './section-view.js';
import { SAMPLE_DEFAULTS, cleanSampling, sectionsCsv } from './sections.js';
import { sectionSheets, SHEET_VEXES } from './section-sheets.js';   // 0.4 V17
import { massHaulDialog } from './masshaul-ui.js';   // 0.4 V24
import { PAPERS, scalesFor, toPdfPages } from './plot.js';
import { formatStation, parseStation, fixed, volumeText, unitOf } from './units.js';

export function createSections(ctx) {
  const { root, el } = ctx;
  const $ = (s) => root.querySelector(s);
  const panel = $('[data-sections-panel]');
  const ui = { al: $('[data-sec-al]'), sta: $('[data-sec-sta]'), prev: $('[data-sec-prev]'), next: $('[data-sec-next]'), ve: $('[data-sec-ve]'), read: $('[data-sec-read]'), csv: $('[data-sec-csv]'), close: $('[data-sec-close]'), cv: $('[data-sec]') };
  const sv = new SectionView(ui.cv);
  let want = null, idx = 0, ve = 0;
  const P = () => ctx.project();
  const U = () => ctx.units();
  const sta = (s) => formatStation(s, U());
  const areaU = () => unitOf(U()).area;

  const alignment = () => { const s = P().state; return s.alignments.find((a) => a.id === want) || s.alignments.find((a) => a.sampling) || s.alignments[0] || null; };
  const setOf = (a) => (a ? P().sections(a) : null);

  function show(on, alId) {
    if (alId) want = alId;
    if (on) ctx.otherPanel?.(false);
    panel.hidden = !on;
    render();
    ctx.layout?.();
  }
  const isOpen = () => !panel.hidden;

  function render() {
    if (panel.hidden) return;
    const s = P().state, a = alignment();
    ui.al.replaceChildren(...s.alignments.map((x) => el('option', { value: x.id }, x.name)));
    ui.al.disabled = s.alignments.length < 2;
    if (a) ui.al.value = a.id;
    const set = setOf(a);
    const n = set?.sections.length || 0;
    if (idx >= n) idx = Math.max(0, n - 1);
    ui.sta.replaceChildren(...(set?.sections || []).map((x, i) => el('option', { value: String(i) }, sta(x.sta))));
    ui.sta.disabled = !n; ui.prev.disabled = idx <= 0; ui.next.disabled = idx >= n - 1; ui.csv.disabled = !n;
    if (n) ui.sta.value = String(idx);
    const sec = set?.sections[idx];
    if (!sec) {
      ui.read.textContent = '';
      sv.set({ empty: !a ? t('sec.empty.alignment') : !a.sampling ? t('sec.empty.sampling') : t('sec.empty.none') });
      return;
    }
    const tot = set.totals;
    ui.read.textContent = t('sec.read', { cut: volumeText(tot.cut, U()), fill: volumeText(tot.fill, U()) });
    sv.set({ section: sec, station: t('sec.station', { sta: sta(sec.sta) }), exaggeration: ve || null,
      labels: { cut: t('sec.area.cut', { a: fixed(sec.cut, 2), u: areaU() }), fill: t('sec.area.fill', { a: fixed(sec.fill, 2), u: areaU() }), ve: t('sec.ve', { ve: sv.ve >= 10 ? Math.round(sv.ve) : fixed(sv.ve || 1, 1) }) } });
    // the exaggeration is known only after fitting: draw the label again with it
    sv.data.labels.ve = t('sec.ve', { ve: sv.ve >= 10 ? Math.round(sv.ve) : fixed(sv.ve, 1) });
    sv.draw();
  }
  function go(i) { const set = setOf(alignment()); if (!set) return; idx = Math.max(0, Math.min(set.sections.length - 1, i)); render(); ctx.redraw?.(); }

  ui.al.addEventListener('change', () => { want = ui.al.value; idx = 0; ctx.focusAlignment?.(want); render(); });
  ui.sta.addEventListener('change', () => go(Number(ui.sta.value)));
  ui.prev.addEventListener('click', () => go(idx - 1));
  ui.next.addEventListener('click', () => go(idx + 1));
  ui.ve.addEventListener('change', () => { ve = Number(ui.ve.value) || 0; render(); });
  ui.close.addEventListener('click', () => show(false));
  ui.csv.addEventListener('click', () => {
    const a = alignment(), set = setOf(a);
    if (!set) return;
    ctx.download('﻿' + sectionsCsv(set, { units: U(), station: sta }), ctx.fileStem() + ' ' + a.name + ' sections.csv', 'text/csv');
    ctx.say(t('sec.csv.done', { n: set.sections.length }));
  });
  ui.cv.addEventListener('keydown', (e) => {
    const k = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (k) { e.preventDefault(); go(idx + k); return; }
    if (e.key === 'Home') { e.preventDefault(); go(0); } else if (e.key === 'End') { e.preventDefault(); go(1e9); }
  });

  /** "Sample lines" in the alignment's Properties. */
  function props(a) {
    const out = [el('h3', { className: 'cv-h3' }, t('sec.props.head'))];
    const p = P(), U0 = unitOf(U());
    if (!a.sampling) {
      out.push(el('p', { className: 'cv-note' }, t('sec.props.none')));
      out.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sec-add': '', onclick: () => { p.change(t('sec.undo.add'), (s) => { const x = s.alignments.find((q) => q.id === a.id); x.sampling = cleanSampling(SAMPLE_DEFAULTS(U()), U()); }); show(true, a.id); } }, t('sec.props.add')));
      return out;
    }
    const smp = a.sampling;
    const set = (k) => (v) => { const x = Number(v); if (!(x > 0) || v === '') return false; p.change(t('sec.undo.' + k), (s) => { s.alignments.find((q) => q.id === a.id).sampling[k] = x; }); return true; };
    out.push(el('div', { className: 'cv-props', 'data-sec-props': '' },
      ...ctx.row(t('sec.props.step'), el('div', { className: 'cv-row' }, ctx.numInput(smp.step, set('step'), { id: 'cv-sec-step', min: 0 }), el('span', { className: 'cv-unit' }, U0.short)), 'cv-sec-step'),
      ...ctx.row(t('sec.props.left'), el('div', { className: 'cv-row' }, ctx.numInput(smp.left, set('left'), { id: 'cv-sec-left', min: 0 }), el('span', { className: 'cv-unit' }, U0.short)), 'cv-sec-left'),
      ...ctx.row(t('sec.props.right'), el('div', { className: 'cv-row' }, ctx.numInput(smp.right, set('right'), { id: 'cv-sec-right', min: 0 }), el('span', { className: 'cv-unit' }, U0.short)), 'cv-sec-right'),
      ...ctx.row(t('sec.props.extra'), ctx.numInput('', (v) => {
        const x = parseStation(v, U());
        if (x === null) return false;
        p.change(t('sec.undo.extra'), (s) => { const q = s.alignments.find((m) => m.id === a.id).sampling; q.extra = [...new Set([...q.extra, x])].sort((m, n) => m - n); });
        return true;
      }, { id: 'cv-sec-extra', text: true, station: true }), 'cv-sec-extra')));
    if (smp.extra.length) {
      out.push(el('ul', { className: 'cv-plainlist cv-note' }, ...smp.extra.map((x) => el('li', {}, sta(x), ' ', el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('sec.props.extra.remove', { sta: sta(x) }), onclick: () => p.change(t('sec.undo.extra.remove'), (s) => { const q = s.alignments.find((m) => m.id === a.id).sampling; q.extra = q.extra.filter((y) => y !== x); }) }, t('sec.props.remove'))))));
    }
    const ss = p.sections(a);
    if (ss) {
      const vi = p.volumes()?.items?.find((x) => x.id === a.id);
      out.push(el('p', { className: 'cv-note', 'data-sec-facts': '' }, t('sec.props.facts', { n: ss.sections.length, cut: volumeText(ss.totals.cut, U()), fill: volumeText(ss.totals.fill, U()) })
        + (vi ? ' ' + t('sec.props.grid', { cut: volumeText(vi.cut, U()), fill: volumeText(vi.fill, U()) }) : '')));
    }
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sec-open': '', onclick: () => show(true, a.id) }, el('i', { className: 'bi bi-distribute-vertical', 'aria-hidden': 'true' }), ' ', t('sec.props.view')),
      ss?.sections.length ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-xs-open': '', onclick: () => sheetsDialog(a) }, el('i', { className: 'bi bi-file-earmark-pdf', 'aria-hidden': 'true' }), ' ', t('xs.ui.open')) : null,   // 0.4 V17
      ss?.sections.length > 1 ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-mh-open': '', onclick: () => massHaulDialog({ root: ctx.root, el, units: () => U(), download: ctx.download, fileStem: ctx.fileStem, say: ctx.say }, a, setOf(a)) }, el('i', { className: 'bi bi-graph-up-arrow', 'aria-hidden': 'true' }), ' ', t('mh.open')) : null,   // 0.4 V24
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => p.change(t('sec.undo.remove'), (s) => { s.alignments.find((q) => q.id === a.id).sampling = null; }) }, t('sec.props.remove.all'))));
    return out;
  }

  /** 0.4 V17: the cross-section sheets dialog (paper, scale, exaggeration, live page count) → one PDF. */
  let xsUid = 0;
  function sheetsDialog(a) {
    const set = setOf(a);
    if (!set?.sections.length) return;
    const U0 = U(), id = 'cv-xs-' + (++xsUid), scales = scalesFor(U0);
    const sel = (key, opts, value) => { const s = el('select', { className: 'cv-select', id: id + '-' + key, ['data-xs-' + key]: '' }, ...opts.map(([v, l]) => el('option', { value: v }, l))); s.value = value; return s; };
    const paper = sel('paper', PAPERS.map((x) => [x.key, x.name]), U0 === 'm' ? 'a3' : 'tabloid');
    const scale = sel('scale', scales.map((x) => [x.label, x.label]), U0 === 'm' ? '1:200' : '1" = 20\'');
    const vex = sel('vex', SHEET_VEXES.map((v) => [String(v), v + '×']), '5');
    const info = el('p', { className: 'cv-note', 'data-xs-info': '' });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-xs-go': '' }, t('xs.ui.go'));
    const row = (label, input) => [el('label', { for: input.id }, label), input];
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('pp.ui.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': id + '-h', 'data-xs-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('xs.ui.title', { name: a.name })), close),
        el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('xs.ui.lede')),
          el('div', { className: 'cv-props' }, ...row(t('pp.ui.paper'), paper), ...row(t('pp.ui.scale'), scale), ...row(t('pp.ui.vex'), vex)), info),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pp.ui.cancel')), go)));
    close.onclick = () => dlg.close();
    const build = () => sectionSheets(set, { paper: paper.value, scale: scales.find((x) => x.label === scale.value), vex: Number(vex.value), units: U0, title: P().state.name, name: a.name });
    const update = () => { const r = build(); info.textContent = [t('xs.ui.info', { n: r.sheets.length, sections: set.sections.length, per: r.perPage }), ...r.notes].join(' '); };
    for (const x of [paper, scale, vex]) x.addEventListener('change', update);
    go.onclick = async () => {
      const r = build();
      const { bytes } = await toPdfPages(r.sheets, { title: P().state.name + ' ' + a.name });
      const file = t('xs.ui.file', { stem: ctx.fileStem(), name: a.name });
      ctx.download(bytes, file, 'application/pdf');
      dlg.close();
      ctx.say([t('xs.ui.done', { n: r.sheets.length, file }), ...r.notes].join(' '));
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.redraw?.(); });
    ctx.root.append(dlg);
    update();
    dlg.showModal();
    go.focus();
  }

  function sceneItems(alignments) {
    const items = [];
    for (const a of alignments) {
      const set = setOf(a);
      if (!set) continue;
      for (const s of set.sections) items.push({ layer: 'C-ROAD-SCTN', kind: 'poly', pts: [s.a, s.b] });
    }
    return items;
  }
  function overlay(c2d, toScreen, color) {
    if (panel.hidden) return;
    const sec = setOf(alignment())?.sections[idx];
    if (!sec) return;
    const a = toScreen(sec.a.x, sec.a.y), b = toScreen(sec.b.x, sec.b.y);
    c2d.strokeStyle = color; c2d.lineWidth = 3; c2d.setLineDash([]); c2d.beginPath(); c2d.moveTo(a.x, a.y); c2d.lineTo(b.x, b.y); c2d.stroke();
  }
  return { show, toggle: () => show(panel.hidden), isOpen, render, props, sceneItems, overlay, current: () => ({ id: alignment()?.id, index: idx, section: setOf(alignment())?.sections[idx] || null }), view: sv };
}
