/* SPDX-License-Identifier: Apache-2.0 */
// HVAC (0.5 TK.3): rectangular, round and flexible duct with hangers and insulation, air devices, equipment. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';

const items = [];
for (const [w, h, wm, hm] of [[12, 8, 305, 203], [20, 10, 508, 254], [24, 12, 610, 305]]) {
  const per = (2 * (w + h)) / 12;                 // SF of sheet metal per LF
  const perM = 2 * (wm + hm) / 1000;              // m² per m
  items.push(twin({
    key: `rect-${w}x${h}`, csi: '23 31 13', group: 'Ductwork', type: 'linear', src: ['smacna', 'imc-6', 'geometry'],
    assume: [`Sheet metal by surface: perimeter ${2 * (w + h)} in = ${+per.toFixed(4)} SF per LF; 15% for seams, joints and fittings (a starting figure).`, 'Hangers at 8 ft at most, plus one per run (check the SMACNA hanger table for the duct size).', 'Duct wrap 1-1/2 in on the perimeter, 20% for overlaps and corners.'],
    note: 'Draw the duct centerline.',
    name: [`Rectangular duct ${w} x ${h} in, galvanized, wrapped`, `Rectangular duct ${wm} x ${hm} mm, galvanized, wrapped`], unit: ['LF', 'm'],
    c: [
      ['Galvanized sheet metal duct', ['SF', 'm²'], `L*${+per.toFixed(6)}`, `L*${perM}`, 1500],
      ['Duct hangers (pairs)', 'EA', 'ceil(L/8)+N', 'ceil(L/2.4384)+N', 500],
      ['Duct wrap 1-1/2 in', ['SF', 'm²'], `L*${+per.toFixed(6)}`, `L*${perM}`, 2000],
    ],
  }));
}
for (const [d, dm] of [[8, 203], [12, 305]]) {
  const per = Math.PI * d / 12, perM = Math.PI * dm / 1000;
  items.push(twin({
    key: `spiral-${d}`, csi: '23 31 13', group: 'Ductwork', type: 'linear', src: ['smacna', 'imc-6', 'geometry'],
    assume: ['Spiral duct in 10 ft lengths with a coupling each; hangers at 10 ft at most plus one per run (check the SMACNA table).', `Surface for wrap: 3.1416 x ${d} in = ${+per.toFixed(4)} SF per LF, 20% for overlaps.`],
    note: 'Draw the duct centerline.',
    name: [`Round spiral duct ${d} in, wrapped`, `Round spiral duct ${dm} mm, wrapped`], unit: ['LF', 'm'],
    c: [
      [`Spiral duct ${d} in`, ['LF', 'm'], 'L', 'L', 1000],
      ['Couplings', 'EA', 'ceil(L/10)', 'ceil(L/3.048)', 500],
      ['Duct hangers', 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 500],
      ['Duct wrap 1-1/2 in', ['SF', 'm²'], `L*${+per.toFixed(6)}`, `L*${+perM.toFixed(6)}`, 2000],
    ],
  }));
}
for (const [d, dm] of [[6, 152], [8, 203]]) {
  items.push(twin({
    key: `flex-${d}`, csi: '23 33 46', group: 'Ductwork', type: 'linear', src: ['adc', 'imc-6', 'geometry'],
    assume: ['Insulated flexible duct in 25 ft boxes; runs pulled tight, no longer than the code and the device allow.', 'Supports at 5 ft at most (Air Diffusion Council), plus one per run; two clamps per run.'],
    note: 'Draw each flex run from the trunk to the device.',
    name: [`Flexible duct ${d} in, insulated`, `Flexible duct ${dm} mm, insulated`], unit: ['LF', 'm'],
    c: [
      [[`Flex duct ${d} in, 25 ft box`, `Flex duct ${dm} mm, 7.62 m box`], 'box', 'ceil(L/25)', 'ceil(L/7.62)', 0],
      ['Flex duct supports', 'EA', 'ceil(L/5)+N', 'ceil(L/1.524)+N', 500],
      ['Duct clamps', 'EA', 'N*2', 'N*2', 500],
    ],
  }));
}
const device = (key, name, parts, note) => one({
  key, csi: '23 37 13', group: 'Air devices', type: 'count', src: ['smacna', 'imc-6'], assume: ['Size each device from the air schedule; the parts here are per device.'],
  note: note || 'Count each device.', name, unit: 'EA', c: parts.map(([n, f]) => [n, 'EA', f || 'N']),
});
items.push(device('diffuser-2x2', 'Supply diffuser 24 x 24, lay-in, with plenum box', [['Supply diffuser 24 x 24'], ['Plenum box with collar'], ['Balancing damper']]));
items.push(device('register', 'Supply register with boot', [['Supply register'], ['Register boot']]));
items.push(device('return-grille', 'Return grille, lay-in', [['Return grille 24 x 24'], ['Return plenum box']]));
items.push(one({
  key: 'exhaust-fan', csi: '23 34 23', group: 'Equipment', type: 'count', src: ['imc-6'], assume: ['Duct to the outside is measured as a run.'],
  note: 'Count each exhaust fan.', name: 'Exhaust fan, ceiling mounted, with wall or roof cap', unit: 'EA',
  c: [['Ceiling exhaust fan', 'EA', 'N'], ['Wall or roof cap with damper', 'EA', 'N']],
}));
items.push(one({
  key: 'thermostat', csi: '23 09 00', group: 'Equipment', type: 'count', src: ['imc-6'], assume: ['Control wiring is measured as a run.'],
  note: 'Count each thermostat.', name: 'Thermostat', unit: 'EA', c: [['Programmable thermostat', 'EA', 'N'], ['Sub-base / wall plate', 'EA', 'N']],
}));
items.push(one({
  key: 'split-system', csi: '23 81 26', group: 'Equipment', type: 'count', src: ['imc-6'], assume: ['Refrigerant line set and condensate drain measured as runs or added per the layout.'],
  note: 'Count each split system.', name: 'Split system: furnace or air handler + condensing unit', unit: 'EA',
  c: [['Furnace / air handler', 'EA', 'N'], ['Condensing unit', 'EA', 'N'], ['Equipment pad', 'EA', 'N'], ['Disconnect', 'EA', 'N'], ['Filter rack', 'EA', 'N']],
}));

export default pack({
  id: 'trade.hvac', name: 'HVAC', trade: 'HVAC',
  description: 'Rectangular and spiral duct by size with hangers and wrap, insulated flexible duct with supports, supply diffusers, registers and return grilles, exhaust fans, thermostats and split systems. Assemblies only: set your own rates.',
  csi: ['23 09 00', '23 31 13', '23 33 46', '23 34 23', '23 37 13', '23 81 26'],
  items,
});
