/* SPDX-License-Identifier: Apache-2.0 */
/**
 * alignment-table-ui.js — 0.11 FX.369: the alignment's elements table in the alignment's properties, with the CSV in the French
 * spreadsheet format (semicolons, decimal commas) and the plain one. The numbers are alignment-table.js's; this is the panel.
 */
import { t } from './i18n.js';
import { el } from './ui-util.js';
import { elementRows, elementsCsv } from './alignment-table.js';
import { formatStation, fixed } from './units.js';

export function elementsBlock(a, al, { units, download, fileStem, say }) {
  const rows = elementRows(al);
  if (!rows.length) return [];
  const d = (v, n = 3) => (v === null || v === undefined ? '' : fixed(v, n)), K = { line: 'cv.al.el.line', arc: 'cv.al.el.arc', spiral: 'cv.al.el.spiral', cspiral: 'cv.al.el.cspiral' };
  const head = ['cv.al.el.n', 'cv.al.el.type', 'cv.al.el.sta0', 'cv.al.el.sta1', 'cv.al.el.len', 'cv.al.el.r', 'cv.al.el.r2', 'cv.al.el.a', 'cv.al.el.gis', 'cv.al.el.x', 'cv.al.el.y'].map((k) => t(k));
  const save = (locale) => {
    const csv = elementsCsv(rows, { locale, head, kinds: Object.fromEntries(Object.entries(K).map(([k, v]) => [k, t(v)])) });
    const name = fileStem() + '-' + (a.name || 'alignment').replace(/[^\w.-]+/g, '_') + '-elements.csv';
    download(csv, name, 'text/csv;charset=utf-8');
    say(t('cv.al.el.saved', { name }));
  };
  return [
    el('h3', { className: 'cv-h3' }, t('cv.al.el.head')),
    el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-al-elements': '' },
      el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...rows.map((r) => el('tr', { 'data-el-kind': r.kind },
        el('td', {}, String(r.n)), el('td', {}, t(K[r.kind])), el('td', {}, formatStation(r.sta0, units())), el('td', {}, formatStation(r.sta1, units())),
        el('td', {}, d(r.len)), el('td', {}, d(r.R)), el('td', {}, d(r.R2)), el('td', {}, d(r.A)), el('td', {}, d(r.gisement, 4)), el('td', {}, d(r.x)), el('td', {}, d(r.y))))))),
    el('p', { className: 'cv-note' }, t('cv.al.el.note')),
    el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-al-csv': 'fr', title: t('cv.al.el.csv.fr.title'), onclick: () => save('fr') }, el('i', { className: 'bi bi-filetype-csv', 'aria-hidden': 'true' }), ' ', t('cv.al.el.csv.fr')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-al-csv': 'en', onclick: () => save('en') }, el('i', { className: 'bi bi-filetype-csv', 'aria-hidden': 'true' }), ' ', t('cv.al.el.csv.en'))),
  ];
}
