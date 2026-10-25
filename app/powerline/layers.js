/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/layers.js — the Power lines workspace's plan layers (0.7 Track PL), NCS-style C-POWR- (civil, power) names.
 * Importing this module adds them to scene.js LAYERS once (the list the screen, DXF, DWG and PDF all draw by), as the
 * Landscape workspace's layers.js does.
 */
import { LAYERS } from '../scene.js';
import { t } from '../i18n.js';

export const PL_LAYERS = [
  { name: 'C-POWR-OVHD', token: 'red', aci: 1, key: 'ovhd' },      // overhead spans
  { name: 'C-POWR-POLE', token: 'major', aci: 7, key: 'pole' },     // supports
  { name: 'C-POWR-UNDG', token: 'magenta', aci: 6, key: 'undg' },   // underground routes
  { name: 'C-POWR-EQPM', token: 'blue', aci: 5, key: 'eqpm' },      // equipment
  { name: 'C-POWR-OBST', token: 'ochre', aci: 42, key: 'obst' },    // obstacles and crossings
  { name: 'C-POWR-TEXT', token: 'ink2', aci: 8, key: 'text' },      // names and labels
];
for (const l of PL_LAYERS) {
  if (LAYERS.some((x) => x.name === l.name)) continue;
  LAYERS.push({ name: l.name, token: l.token, aci: l.aci, get label() { return t('pl.layer.' + l.key); } });
}
