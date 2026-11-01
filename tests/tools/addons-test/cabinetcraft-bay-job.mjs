/* SPDX-License-Identifier: Apache-2.0 */
// The bay-window kitchen of the CabinetCraft round 3 tests and the /lab owner steps: a slanted wall, a curved bay wall, a curved-front cabinet and a corner cabinet at 135 degrees.
export const BAY_JOB = {
  cabinetcraft: 1, name: 'Bay window kitchen', unit: 'mm',
  room: { shape: 'free', pts: [[0, 0], [4200, 0], [4200, 2400], [2997.92, 3602.08], [1202.08, 3602.08], [0, 2400]], arcs: [{ i: 3, sweep: 50 }], h: 2400 },
  openings: [{ id: 'W1', kind: 'window', wall: 'P4', at: 650, w: 500, h: 1100, sill: 1000 }],
  runs: [
    { id: 'A', wall: 'P2', base: [{ kind: 'cab', tpl: 'base-door', w: 600 }, { kind: 'cab', tpl: 'base-drawers3', w: 600 }, { kind: 'cab', tpl: 'base-sink', w: 900 }, { kind: 'cab', tpl: 'base-door', w: 300 }] },
    { id: 'B', wall: 'P3', base: [{ kind: 'cab', tpl: 'base-door', w: 600 }, { kind: 'cab', tpl: 'base-door', w: 650 }] },
    { id: 'C', wall: 'P4', base: [{ kind: 'cab', tpl: 'base-door', w: 450 }, { kind: 'cab', tpl: 'base-curved-front', w: 600 }, { kind: 'cab', tpl: 'base-door', w: 350 }] },
    { id: 'D', wall: 'P5', base: [{ kind: 'cab', tpl: 'base-door', w: 570 }, { kind: 'cab', tpl: 'base-corner-diag', w: 850 }] },
    { id: 'E', wall: 'P6', base: [{ kind: 'cab', tpl: 'base-door', w: 600 }, { kind: 'cab', tpl: 'base-drawers3', w: 600 }] },
  ],
};
