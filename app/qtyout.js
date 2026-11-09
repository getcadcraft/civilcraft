/* SPDX-License-Identifier: Apache-2.0 */
/**
 * qtyout.js — the earthwork as a quantities file for TakeoffCraft (0.6 TK.5+). No DOM.
 *
 *   earthworkFile({ name, units, volumes, made }) → { ok: true, json, cut, fill, unit } | { ok: false, why }
 *
 * `volumes` is project.volumes() (grid method: cut and fill in project units cubed, + .items, .cell, .cells). The file is
 * TakeoffCraft's plain quantities format (format "cadcraft-quantities", version 1, the same reader takes any app's): two
 * items, keys "earthwork:cut" and "earthwork:fill", in cubic yards for a feet project (÷ 27, the same numbers the Earthwork
 * panel shows) or cubic metres. Bank volumes as measured: no shrink or swell (that is the estimator's waste or a formula).
 * Totals only, so nothing is counted twice; each pad's and corridor's own cut and fill go in the note.
 * 0.9 SU.1110 + WB.6: `materials` (project.materials(), names already in words) adds one item per material the templates place
 * (corridor components, terrain template layers): key "material:<source>:<item id>:<n>", the same volume units. A project with
 * materials but nothing graded writes the materials alone.
 */

import { unitOf } from './units.js';
import { t } from './i18n.js';

export const QTY_FORMAT = 'cadcraft-quantities';
export const QTY_VERSION = 1;
export const QTY_EXT = '.quantities.json';   // i18n-ignore: a file name ending

const r2 = (v) => Math.round(v * 100) / 100;

export function earthworkFile({ name, units, volumes, materials = [], made = new Date().toISOString().replace(/\.\d+Z$/, 'Z') }) {
  const u = unitOf(units), per = u.volPer, unit = u.key === 'm' ? 'm³' : 'CY';
  const mats = (materials || []).filter((m) => m.volume > 0).map((m, i) => ({ key: 'material:' + m.source + ':' + m.id + ':' + (i + 1), name: t('tpl.qty.item', { name: m.name || m.kind, material: m.material || '-', item: m.item }), unit, qty: r2(m.volume / per), note: t('tpl.qty.note') }));
  if (!volumes || !(volumes.cells > 0)) {
    if (!mats.length) return { ok: false, why: t('cv.qty.none') };
    return { ok: true, json: { format: QTY_FORMAT, version: QTY_VERSION, app: 'CivilCraft', project: String(name || '').slice(0, 200), made, items: mats }, cut: 0, fill: 0, unit };   // i18n-ignore: the app's name in the file
  }
  const cut = r2(volumes.cut / per), fill = r2(volumes.fill / per);
  const cellText = String(+volumes.cell.toFixed(3)) + ' ' + u.short;
  const parts = (volumes.items || []).map((it) => t('cv.qty.part', { name: it.name, cut: r2(it.cut / per), fill: r2(it.fill / per), unit }));
  const note = [t('cv.qty.note', { n: volumes.cells, cell: cellText }), ...parts].join(' ');
  const json = {
    format: QTY_FORMAT, version: QTY_VERSION, app: 'CivilCraft', project: String(name || '').slice(0, 200), made,   // i18n-ignore: the app's name in the file
    items: [
      { key: 'earthwork:cut', name: t('cv.qty.cut'), unit, qty: cut, note },
      { key: 'earthwork:fill', name: t('cv.qty.fill'), unit, qty: fill, note },
      ...mats,
    ],
  };
  return { ok: true, json, cut, fill, unit };
}
