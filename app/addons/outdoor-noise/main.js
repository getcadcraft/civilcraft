/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Outdoor noise add-on for CivilCraft (0.11 XE.3 S4, add-on API 1.4). Off until the person adds it (Settings › Add-ons).
 * The engine (lib/, byte-identical copies of lib/acoustics: `node tools/acoustics/sync.mjs civilcraft-noise`) is CNOSSOS-EU (Directive (EU) 2015/996 Annex II as
 * amended by Delegated Directive (EU) 2021/1226). CivilCraft gives the terrain (its existing ground) and the geometry; the add-on adds one right-panel tab.
 * Nothing is sent anywhere.
 */
import * as TS from '../../terrain-section.js';
import { roadEmission } from './lib/road.js';
import { computeNoise, toCsv, PERIODS } from './model.js';
import { mountPanel } from './panel.js';
import { ensureStyle, removeStyle, el } from './ui.js';

export async function activate(api) {
  ensureStyle();
  let railEmission = null;
  try { railEmission = (await import('./lib/rail.js')).railEmission; } catch { railEmission = null; }   // the railway model joins when its file is in lib/
  const ctx = {
    api, t: api.t, computeNoise, toCsv, PERIODS, last: null,
    terrain: { cutSection: TS.cutSection, crossing: TS.crossing, flatten: TS.flatten },
    emission: { road: roadEmission, rail: railEmission ? (input) => railEmission(input) : null },
    project: () => window.civilcraft && window.civilcraft.project,
    units: () => (window.civilcraft?.project?.state?.units === 'm' ? 'm' : 'ft'),
    problemsSource: api.problems.source({ id: 'outdoor-noise', label: api.t('nz.name') }),
    // a starting point for the trains-and-track box (the person's own numbers replace it): Table 2.3.a type letters, Appendix G keys
    railTemplate: () => ({ track: { roughness: 'M', transfer: 'MM' }, day: { trains: [{ type: 'p', count: 40, v: 120, axles: 4, brake: 'disc', wheel: 'd920', contact: 'w50-d920', traction: 'emu' }] },
      evening: { trains: [{ type: 'p', count: 16, v: 120, axles: 4, brake: 'disc', wheel: 'd920', contact: 'w50-d920', traction: 'emu' }] }, night: { trains: [{ type: 'a', count: 20, v: 80, axles: 4, brake: 'cast-iron', wheel: 'd920', contact: 'w50-d920' }] } }),
  };
  api.ui.panelTab({
    id: 'outdoor-noise', title: api.t('nz.name'),
    render: (body) => { const root = el('div', { className: 'nz-panel', 'data-nz-panel': '' }); body.append(root); mountPanel(ctx, root); },
  });
  window.ccOutdoorNoise = ctx;   // the tests and the lab pass reach the add-on here
  api.onDeactivate(() => { removeStyle(); try { ctx.problemsSource.set([]); } catch { /* the shell's Problems are gone */ } if (window.ccOutdoorNoise === ctx) delete window.ccOutdoorNoise; });
}
