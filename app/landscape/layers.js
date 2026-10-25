/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layers.js — the Landscape workspace's plan layers (0.7 Track LD, session `landscape`), NCS-style L- (landscape) names.
 * Importing this module adds them to scene.js LAYERS once (the list the screen, DXF, DWG and PDF all draw by), so scene.js
 * itself needs no edit. Every landscape module imports it.
 */
import { LAYERS } from '../scene.js';
import { t } from '../i18n.js';

export const LS_LAYERS = [
  { name: 'L-PLNT-TREE', token: 'green', aci: 3, key: 'tree' },
  { name: 'L-PLNT-SHRB', token: 'green', aci: 94, key: 'shrb' },
  { name: 'L-PLNT-HDGE', token: 'green', aci: 92, key: 'hdge' },
  { name: 'L-PLNT-BEDS', token: 'ochre', aci: 42, key: 'beds' },
  { name: 'L-PLNT-TEXT', token: 'green', aci: 3, key: 'ptext' },
  { name: 'L-GRAD-SPOT', token: 'magenta', aci: 6, key: 'spot' },
  { name: 'L-GRAD-SLOP', token: 'red', aci: 1, key: 'slop' },
  { name: 'L-GRAD-FLOW', token: 'cyan', aci: 4, key: 'flow' },
  { name: 'L-HARD-PAVE', token: 'ink2', aci: 8, key: 'pave' },
  { name: 'L-HARD-WALL', token: 'major', aci: 7, key: 'wall' },
  { name: 'L-HARD-STEP', token: 'major', aci: 7, key: 'step' },
  { name: 'L-HARD-TEXT', token: 'ink2', aci: 8, key: 'htext' },
  { name: 'L-IRRG-HEAD', token: 'blue', aci: 5, key: 'head' },
  { name: 'L-IRRG-COVR', token: 'cyan', aci: 4, key: 'covr' },
  { name: 'L-IRRG-PIPE', token: 'blue', aci: 5, key: 'pipe' },
  { name: 'L-IRRG-VALV', token: 'blue', aci: 5, key: 'valv' },
  { name: 'L-IRRG-TEXT', token: 'blue', aci: 5, key: 'itext' },
];
for (const l of LS_LAYERS) {
  if (LAYERS.some((x) => x.name === l.name)) continue;
  LAYERS.push({ name: l.name, token: l.token, aci: l.aci, get label() { return t('ls.layer.' + l.key); } });
}
