/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sides-ui.js — 0.7.1 71.22: the "Sides and retaining walls" block of a pad's (civilcraft.js padProps) or a Landscape platform's /
 * berm's (landscape/grade-ui.js) Properties. The maths and the data are sides.js; this only shows and edits them. Every change is
 * one undo step (the caller's `change(label, sides)`).
 *
 *   sidesBlock({ el, numInput, units, n (sides), sides, cut, fill (the object's own slopes), info (its graded result: walls,
 *     warnings), change(label, sides), idp (id prefix) }) → [elements]
 *   slopeInput(numInput, value, onH, { id, label, blank }) → a box that takes 3, 3:1, 33%, 18.4° (H:1 shown)
 */

import { parseSlope, setSide, sideDefaults, wallQuantities, MAX_SLOPE_H } from './sides.js';
import { t } from './i18n.js';
import { fixed } from './units.js';

export function slopeInput(numInput, value, onH, { id, label, blank = false } = {}) {
  return numInput(value > 0 ? fixed(value, 2) : '', (v) => {
    if (v.trim() === '') return blank ? onH(null) : false;
    const h = parseSlope(v);
    if (!(h > 0 && h <= MAX_SLOPE_H)) return false;
    return onH(h);
  }, { id, label, calc: false, width: '5rem' });
}

export function sidesBlock({ el, numInput, units, n, sides, cut, fill, info, change, idp = 'cv-sd' }) {
  const S = { ...sideDefaults(units), ...(sides || {}) }, E = sides?.edges || [];
  const u = units === 'm' ? 'm' : 'ft', out = [];
  const edgeMode = (k) => (E[k]?.wall ? 'wall' : E[k]?.cut || E[k]?.fill ? 'own' : 'pad');
  const modes = Array.from({ length: n }, (_, k) => edgeMode(k));
  const allMode = modes.every((m) => m === 'wall') ? 'wall' : modes.every((m) => m === 'pad') ? 'slope' : 'mixed';
  out.push(el('h3', { className: 'cv-h3' }, t('sides.head')));
  // all sides at once
  const all = el('select', { className: 'cv-select', id: idp + '-all', 'data-sides-all': '' },
    el('option', { value: 'slope' }, t('sides.all.slope')), el('option', { value: 'wall' }, t('sides.all.wall')), el('option', { value: 'mixed', disabled: true }, t('sides.all.mixed')));
  all.value = allMode;
  all.addEventListener('change', () => change(t(all.value === 'wall' ? 'sides.undo.wall' : 'sides.undo.slope'), setSide(sides, 'all', all.value === 'wall' ? { wall: true } : null, n, units)));
  out.push(el('div', { className: 'cv-props' }, el('label', { for: idp + '-all' }, t('sides.all')), all));
  // one row per side
  const rows = [];
  for (let k = 0; k < n; k++) {
    const sel = el('select', { className: 'cv-select', id: `${idp}-m${k}`, 'aria-label': t('sides.side.n', { n: k + 1 }), 'data-side-mode': String(k) },
      el('option', { value: 'pad' }, t('sides.mode.pad')), el('option', { value: 'own' }, t('sides.mode.own')), el('option', { value: 'wall' }, t('sides.mode.wall')));
    sel.value = modes[k];
    sel.addEventListener('change', () => {
      const p = sel.value === 'wall' ? { wall: true } : sel.value === 'pad' ? null : { cut: E[k]?.cut || cut, fill: E[k]?.fill || fill };
      change(t(sel.value === 'wall' ? 'sides.undo.wall1' : 'sides.undo.slope1', { n: k + 1 }), setSide(sides, k, p, n, units));
    });
    const box = (key) => modes[k] === 'own'
      ? slopeInput(numInput, E[k]?.[key] || (key === 'cut' ? cut : fill), (h) => change(t('sides.undo.slope1', { n: k + 1 }), setSide(sides, k, { [key]: h }, n, units)), { id: `${idp}-${key}${k}`, label: t(key === 'cut' ? 'sides.cut.n' : 'sides.fill.n', { n: k + 1 }) })
      : el('span', { className: 'cv-note' }, modes[k] === 'wall' ? '—' : fixed(key === 'cut' ? cut : fill, 2));
    rows.push(el('tr', { dataset: { side: String(k) } }, el('td', { className: 'num' }, String(k + 1)), el('td', {}, sel), el('td', {}, box('cut')), el('td', {}, box('fill'))));
  }
  out.push(el('table', { className: 'cv-groups', 'data-sides-table': '' },
    el('caption', { className: 'cv-note' }, t('sides.table.cap')),
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '#'), el('th', { scope: 'col' }, t('sides.col.side')), el('th', { scope: 'col' }, t('sides.col.cut')), el('th', { scope: 'col' }, t('sides.col.fill')))),
    el('tbody', {}, ...rows)));
  out.push(el('p', { className: 'cv-note' }, t('sides.slope.note')));
  // wall thickness, the height that warns, the steepest slope the soil stands
  const num = (key, label, id, unit, ok) => [el('label', { for: id }, label), el('div', { className: 'cv-row' }, numInput(S[key] == null ? '' : fixed(S[key], 2), (v) => {
    const x = v.trim() === '' ? null : Number(v);
    if (!ok(x)) return false;
    change(t('sides.undo.set'), { ...cleanCopy(sides, units, n), [key]: x });
  }, { id, label }), el('span', { className: 'cv-unit' }, unit))];
  out.push(el('div', { className: 'cv-props' },
    ...num('wallT', t('sides.thick'), idp + '-t', u, (x) => x > 0 && x <= 100),
    ...num('wallLimit', t('sides.limit'), idp + '-lim', u, (x) => x > 0 && x <= 1000),
    el('label', { for: idp + '-max' }, t('sides.max')), el('div', { className: 'cv-row' }, slopeInput(numInput, S.maxSlope, (h) => change(t('sides.undo.set'), { ...cleanCopy(sides, units, n), maxSlope: h }), { id: idp + '-max', label: t('sides.max'), blank: true }), el('span', { className: 'cv-unit' }, ': 1'))));
  // the walls' quantities and the warnings
  const q = wallQuantities(info?.walls || []);
  if (q.n) out.push(el('div', { className: 'cv-props', 'data-wall-qty': '' },
    el('span', { className: 'k' }, t('sides.q.length')), el('span', { className: 'v' }, fixed(q.length, 2) + ' ' + u),
    el('span', { className: 'k' }, t('sides.q.face')), el('span', { className: 'v' }, fixed(q.faceArea, 2) + ' ' + u + '²'),
    el('span', { className: 'k' }, t('sides.q.maxh')), el('span', { className: 'v' }, fixed(q.maxH, 2) + ' ' + u),
    el('span', { className: 'k' }, t('sides.q.avgh')), el('span', { className: 'v' }, fixed(q.avgH, 2) + ' ' + u)));
  for (const w of info?.warnings || []) out.push(el('div', { className: 'cv-report', 'data-sides-warning': w.code }, el('p', {}, w.text)));
  return out;
}

/** The settings as stored (cleanSides keeps them), for a change of one of the numbers. */
function cleanCopy(sides, units, n) {
  const d = sideDefaults(units);
  return { edges: [...(sides?.edges || [])].slice(0, n), wallT: sides?.wallT ?? d.wallT, wallLimit: sides?.wallLimit ?? d.wallLimit, maxSlope: sides?.maxSlope ?? null };
}
