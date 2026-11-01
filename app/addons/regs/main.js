/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Building regulations add-on for CivilCraft (0.8 REG.1 step 4, session `regs_PART_3`; add-on API 1.4). Off until the person switches it
 * on (Settings › Add-ons). The same screens as BimCraft's (lib/ui.js) and the same Problems source (lib/adapter.js); CivilCraft's own are lib/check.js
 * (zoning of the lots' building masses, and crest curve sight distance by design speed) and where a project keeps its ticks: `shell.regs` in the project
 * file (outside the undo steps, like the calc sheets). The pack's setback, height, floor area ratio and coverage limits are asked of zoning.js; the
 * ones a person typed in the Zoning panel stay theirs. A guide only: the registered professional and the local authority decide.
 */
import { startRegs } from './lib/adapter.js';
import { zoneRows, roadRows } from './lib/check.js';

export async function activate(api) {
  await startRegs(api, {
    applies: ['zone', 'road'],
    trades: ['zone', 'road'],
    rows: (prof) => api.model.read((p) => [...zoneRows(p, prof, api.t), ...roadRows(p, prof, api.t)]),
    about: (r) => (r.kind === 'alignment' ? { kind: 'alignment', id: r.ref, label: r.where } : { kind: r.kind === 'mass' ? 'mass' : 'parcel', id: r.ref, label: r.where }),
    host: {
      lenText: (mm) => (mm >= 1000 ? (Math.round(mm / 10) / 100) + ' m' : Math.round(mm) + ' mm'),
      areaText: (m2) => (Math.round(m2 * 100) / 100) + ' m²',
      drawing: {
        read: () => api.model.read((p) => (typeof p.shell.regs === 'string' ? p.shell.regs : null)),
        write: (label, json) => api.model.read((p) => { p.shell.regs = json; p.touch('shell'); return true; }),
      },
    },
  });
}
