/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Swept path add-on for CivilCraft (0.10 SW.1-SW.9, add-on API 1.4). Off until the person switches it on (Settings › Add-ons).
 * The engine (lib/, a byte-identical copy of lib/sweptpath, `node tools/sweptpath-engine/sync.mjs`) is handed CivilCraft's own swept path
 * solver once (swept.js: one road solver, never a second copy); the add-on adds one right-panel tab. Nothing is sent anywhere.
 */
import * as SP from './lib/index.js';
import * as core from '../../swept.js';
import * as feat from '../../featureline.js';
import { mountPanel } from './panel.js';
import { ensureStyle, removeStyle, el } from './ui.js';

const PACKS = ['road-classes', 'aircraft-classes', 'rail-classes'];

export async function activate(api) {
  SP.configure({ simulate: core.simulate, envelope: core.envelope, bodyOutline: core.bodyOutline });
  ensureStyle();
  const packs = [];
  const problems = [];
  for (const id of PACKS) {
    try {
      const r = await fetch(api.url('packs/' + id + '.json'));
      const c = SP.cleanPack(await r.json());
      if (c.ok) packs.push(c.pack); problems.push(...c.problems.map((p) => id + ': ' + p));
    } catch (err) { problems.push(id + ': ' + String(err && err.message || err)); }
  }
  const ctx = {
    api, SP, t: api.t, core, feat, packs, packProblems: problems, last: null,
    project: () => window.civilcraft && window.civilcraft.project,
    units: () => (window.civilcraft?.project?.state?.units === 'm' ? 'm' : 'ft'),
    problemsSource: api.problems.source({ id: 'clearance', label: api.t('sp.name') }),
  };
  api.ui.panelTab({
    id: 'swept-path', title: api.t('sp.name'),
    render: (body) => { const root = el('div', { className: 'sp-panel', 'data-sp-panel': '' }); body.append(root); mountPanel(ctx, root); },
  });
  window.ccSweptPath = ctx;   // the tests and the lab pass reach the add-on here
  api.onDeactivate(() => { removeStyle(); if (window.ccSweptPath === ctx) delete window.ccSweptPath; });
}
