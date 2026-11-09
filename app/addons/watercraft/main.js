/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the WaterCraft add-on for CivilCraft (0.9 WN.7, add-on API 1.4). Off until the person switches it on (Settings › Add-ons).
 * The engine (lib/, a byte-identical copy of lib/waternet, `node tools/waternet-engine/sync.mjs`) is handed CivilCraft's own water solver
 * once; the add-on adds one right-panel tab that works on the Water mains already in the project. Nothing is sent anywhere.
 */
import * as WN from './lib/index.js';
import * as water from '../../water.js';
import { mountPanel } from './panel.js';
import { ensureStyle, removeStyle, el } from './ui.js';

export async function activate(api) {
  WN.configure(water);
  ensureStyle();
  const ctx = {
    api, WN, t: api.t, water,
    project: () => window.civilcraft && window.civilcraft.project,
    units: () => (window.civilcraft?.project?.state?.units === 'm' ? 'm' : 'ft'),
    model: () => window.civilcraft?.project?.state?.water || null,
  };
  api.ui.panelTab({
    id: 'watercraft', title: api.t('wn.name'),
    render: (body) => { const root = el('div', { className: 'wn-panel', 'data-wn-panel': '' }); body.append(root); mountPanel(ctx, root); },
  });
  window.ccWaterCraft = ctx;   // the tests and the lab pass reach the add-on here
  api.onDeactivate(() => { removeStyle(); if (window.ccWaterCraft === ctx) delete window.ccWaterCraft; });
}
