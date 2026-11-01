/* SPDX-License-Identifier: Apache-2.0 */
/**
 * assembly-ui.js — the corridor's assembly editor in the alignment's Properties (0.7 D7.35): build each side from parts
 * (lane, shoulder, gutter, curb, planting strip, walk, daylight), different left and right; starting points (rural road, urban
 * street), copy or mirror one side to the other. Every change is one undo step (project.change on alignment.corridor.parts).
 * The geometry is corridor.js (walkSide); this file only edits the list.
 * 0.7.1 71.24: a part with a width carries its pavement courses (layers: name, material, thickness, kind; corridor.js
 * cleanLayers), edited in a row under it; the courses' areas and volumes (courseQuantities) are listed after the sides.
 *
 *   assemblyProps(ctx, a) → nodes     ctx = { el, project: () => Project, units: () => 'ft'|'m', numInput, say }
 */

import { t } from './i18n.js';
import { PART_TYPES, MAX_PARTS, defaultPart, presetParts, cleanParts, COURSE_KINDS, MAX_LAYERS, defaultLayer, courseQuantities } from './corridor.js';
import { fixed } from './units.js';

const SIDES = ['L', 'R'];

export function assemblyProps(ctx, a) {
  const { el } = ctx, P = ctx.project(), U = ctx.units();
  const out = [];
  const parts = a.corridor?.parts || null;
  const edit = (label, fn) => P.change(label, (s) => { const c = s.alignments.find((x) => x.id === a.id).corridor; fn(c); });
  const on = el('input', { type: 'checkbox', id: 'cv-as-on', checked: !!parts, 'data-as-on': '' });
  on.addEventListener('change', () => edit(t(on.checked ? 'as.undo.on' : 'as.undo.off'), (c) => {
    if (!on.checked) { delete c.parts; return; }
    const lane = { type: 'lane', w: c.lane, slope: c.laneSlope }, shoulder = { type: 'shoulder', w: c.shoulder, slope: c.shoulderSlope }, day = { type: 'daylight', cut: c.cut, fill: c.fill };
    c.parts = { L: cleanParts([lane, shoulder, day], U), R: cleanParts([lane, shoulder, day], U) };   // what the simple assembly already is
  }));
  out.push(el('h3', { className: 'cv-h3' }, t('as.head')), el('label', { className: 'cv-check', for: 'cv-as-on' }, on, ' ', t('as.on')));
  if (!parts) { out.push(el('p', { className: 'cv-note' }, t('as.off.note'))); return out; }

  const setSide = (side, label, fn) => edit(label, (c) => { const list = (c.parts[side] ||= []); fn(list); c.parts[side] = cleanParts(list, U) || []; });
  const label = (q) => t('as.type.' + q.type);
  const num = (v, lo, hi) => { const x = Number(v); return v !== '' && Number.isFinite(x) && x >= lo && x <= hi ? x : null; };

  for (const side of SIDES) {
    const list = parts[side] || [];
    out.push(el('h3', { className: 'cv-h3', 'data-as-side': side }, t(side === 'L' ? 'as.left' : 'as.right')));
    const tbody = el('tbody');
    list.forEach((q, i) => {
      const nm = (k) => t('as.of', { part: label(q), n: i + 1, side: t(side === 'L' ? 'as.left' : 'as.right'), what: t(k) });
      const cells = [];
      if (q.type === 'daylight') {
        cells.push(el('td', { colSpan: 2 }, el('div', { className: 'cv-row' },
          ctx.numInput(String(q.cut), (v) => { const x = num(v, 0.05, 1000); if (x === null || x === 0) return false; setSide(side, t('as.undo.set'), (L) => { L[i].cut = x; }); return true; }, { label: nm('as.col.cut'), width: '4rem' }), el('span', { className: 'cv-unit' }, t('as.cut')),
          ctx.numInput(String(q.fill), (v) => { const x = num(v, 0.05, 1000); if (x === null || x === 0) return false; setSide(side, t('as.undo.set'), (L) => { L[i].fill = x; }); return true; }, { label: nm('as.col.fill'), width: '4rem' }), el('span', { className: 'cv-unit' }, t('as.fill')))));
      } else if (q.type === 'curb') {
        cells.push(el('td', {}, el('div', { className: 'cv-row' }, ctx.numInput(fixed(q.w, 3), (v) => { const x = num(v, 0, 10); if (x === null) return false; setSide(side, t('as.undo.set'), (L) => { L[i].w = x; }); return true; }, { label: nm('as.col.top'), width: '5rem' }), el('span', { className: 'cv-unit' }, U === 'm' ? 'm' : 'ft'))));
        cells.push(el('td', {}, el('div', { className: 'cv-row' }, ctx.numInput(fixed(q.h, 3), (v) => { const x = num(v, 0, 5); if (x === null) return false; setSide(side, t('as.undo.set'), (L) => { L[i].h = x; }); return true; }, { label: nm('as.col.height'), width: '5rem' }), el('span', { className: 'cv-unit' }, t('as.high')))));
      } else {
        cells.push(el('td', {}, el('div', { className: 'cv-row' }, ctx.numInput(fixed(q.w, 3), (v) => { const x = num(v, 0, 100); if (x === null) return false; setSide(side, t('as.undo.set'), (L) => { L[i].w = x; }); return true; }, { label: nm('as.col.width'), width: '5rem' }), el('span', { className: 'cv-unit' }, U === 'm' ? 'm' : 'ft'))));
        cells.push(el('td', {}, el('div', { className: 'cv-row' }, ctx.numInput(fixed(q.slope * 100, 2), (v) => { const y = Number(v); if (v === '' || !Number.isFinite(y) || y < -50 || y > 50) return false; setSide(side, t('as.undo.set'), (L) => { L[i].slope = y / 100; }); return true; }, { label: nm('as.col.slope'), width: '4.5rem' }), el('span', { className: 'cv-unit' }, '%'))));
      }
      const btn = (icon, title, disabled, fn) => el('button', { type: 'button', className: 'cv-x', 'aria-label': title, title, disabled, onclick: fn }, el('i', { className: 'bi ' + icon, 'aria-hidden': 'true' }));
      const movable = q.type !== 'daylight';
      tbody.append(el('tr', { 'data-as-part': q.type },
        el('td', {}, label(q)), ...cells,
        el('td', { style: 'white-space:nowrap' },
          btn('bi-arrow-up', t('as.up', { part: label(q) }), !movable || i === 0, () => setSide(side, t('as.undo.move'), (L) => { [L[i - 1], L[i]] = [L[i], L[i - 1]]; })),
          btn('bi-arrow-down', t('as.down', { part: label(q) }), !movable || i >= list.length - 1 || list[i + 1].type === 'daylight', () => setSide(side, t('as.undo.move'), (L) => { [L[i + 1], L[i]] = [L[i], L[i + 1]]; })),
          btn('bi-x', t('as.remove', { part: label(q), n: i + 1 }), false, () => setSide(side, t('as.undo.remove'), (L) => { L.splice(i, 1); })))));
      if (q.type !== 'daylight' && q.type !== 'curb') tbody.append(coursesRow(side, q, i, nm));
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-as-table': side },
      el('thead', {}, el('tr', {}, ...[t('as.col.part'), t('as.col.width'), t('as.col.slope')].map((h) => el('th', { scope: 'col' }, h)), el('th', {}, el('span', { className: 'visually-hidden' }, t('as.col.actions'))))), tbody)));
    // add a part, starting points, copy
    const sel = el('select', { className: 'cv-select', 'aria-label': t('as.add.type', { side: t(side === 'L' ? 'as.left' : 'as.right') }), 'data-as-add-type': side },
      ...PART_TYPES.filter((ty) => ty !== 'daylight' || !list.some((q) => q.type === 'daylight')).map((ty) => el('option', { value: ty }, t('as.type.' + ty))));
    const add = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-as-add': side, disabled: list.length >= MAX_PARTS, onclick: () => setSide(side, t('as.undo.add'), (L) => { const q = defaultPart(sel.value, U); if (q.type === 'daylight') L.push(q); else { const di = L.findIndex((x) => x.type === 'daylight'); L.splice(di < 0 ? L.length : di, 0, q); } }) }, t('as.add'));
    const other = side === 'L' ? 'R' : 'L';
    out.push(el('div', { className: 'cv-actions' }, sel, add,
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-as-preset': 'rural', onclick: () => setSide(side, t('as.undo.preset'), (L) => { L.splice(0, L.length, ...presetParts('rural', U)); }) }, t('as.preset.rural')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-as-preset': 'urban', onclick: () => setSide(side, t('as.undo.preset'), (L) => { L.splice(0, L.length, ...presetParts('urban', U)); }) }, t('as.preset.urban')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-as-copy': side, onclick: () => edit(t('as.undo.copy'), (c) => { c.parts[other] = JSON.parse(JSON.stringify(c.parts[side] || [])); }) }, t(side === 'L' ? 'as.copy.lr' : 'as.copy.rl'))));
  }
  out.push(el('p', { className: 'cv-note' }, t('as.note')));
  out.push(...courseTable());
  return out;

  // 0.7.1 71.24: the courses under one part (top down), one undo step per change
  function coursesRow(side, q, i, nm) {
    const layers = q.layers || [], setL = (label, fn) => setSide(side, label, (L) => { const ly = (L[i].layers ||= []); fn(ly); if (!ly.length) delete L[i].layers; });
    const rows = layers.map((ly, k) => {
      const what = (key) => t('as.course.of', { n: k + 1, part: nm(key) });
      const text = (key, v, max, prop) => { const inp = el('input', { type: 'text', className: 'cv-input', value: v, maxLength: max, 'aria-label': what(key), placeholder: t(key), style: 'width:7rem' }); inp.addEventListener('change', () => setL(t('as.undo.course'), (ly2) => { ly2[k][prop] = inp.value; })); return inp; };
      const kind = el('select', { className: 'cv-select', 'aria-label': what('as.course.kind'), 'data-as-course-kind': '' }, ...COURSE_KINDS.map((c) => el('option', { value: c, selected: c === ly.course }, t('as.course.k.' + c))));
      kind.addEventListener('change', () => setL(t('as.undo.course'), (ly2) => { ly2[k].course = kind.value; }));
      return el('div', { className: 'cv-row', 'data-as-course': k },
        text('as.course.name', ly.name, 60, 'name'), text('as.course.material', ly.material, 60, 'material'),
        ctx.numInput(fixed(ly.t, 3), (v) => { const x = num(v, 1e-6, U === 'm' ? 5 : 16); if (x === null) return false; setL(t('as.undo.course'), (ly2) => { ly2[k].t = x; }); return true; }, { label: what('as.course.t'), width: '4.5rem' }),
        el('span', { className: 'cv-unit' }, U === 'm' ? 'm' : 'ft'), kind,
        el('button', { type: 'button', className: 'cv-x', 'aria-label': t('as.course.remove', { n: k + 1, part: label(q) }), onclick: () => setL(t('as.undo.course'), (ly2) => { ly2.splice(k, 1); }) }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })));
    });
    const add = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-as-course-add': side + i, disabled: layers.length >= MAX_LAYERS, onclick: () => setL(t('as.undo.course'), (ly2) => { ly2.push(defaultLayer(U)); }) }, t('as.course.add'));
    return el('tr', { 'data-as-courses': q.type }, el('td', { colSpan: 4 }, el('div', { className: 'cv-courses' }, ...(layers.length ? [el('span', { className: 'cv-unit' }, t('as.courses'))] : []), ...rows, add)));
  }
  // the courses' areas and volumes from the corridor as graded (or on its stand-in ground)
  function courseTable() {
    const it = (P.graded().items || []).find((x) => x.kind === 'corridor' && x.id === a.id) || (P.standInCorridors?.() || []).find((x) => x.id === a.id);
    const q = courseQuantities(it);
    if (!q.length) return [];
    const area = U === 'm' ? 'sq m' : 'sq ft', vol = U === 'm' ? 'cu m' : 'cu ft';   // i18n-ignore: unit abbreviations as the app writes them
    return [el('h3', { className: 'cv-h3' }, t('as.q.head')), el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-as-quantities': '' },
      el('thead', {}, el('tr', {}, ...[t('as.q.course'), t('as.q.t', { u: U === 'm' ? 'm' : 'ft' }), t('as.q.area', { u: area }), t('as.q.vol', { u: vol })].map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...q.map((r) => el('tr', {}, el('td', {}, t('as.q.name', { name: r.name || t('as.course.k.' + r.course), part: t('as.type.' + r.part), side: t(r.side === 'L' ? 'as.left' : 'as.right') })),
        el('td', { className: 'num' }, fixed(r.t, 3)), el('td', { className: 'num' }, fixed(r.area, 1)), el('td', { className: 'num' }, fixed(r.volume, 1))))))),
      el('p', { className: 'cv-note' }, t('as.q.note'))];
  }
}
