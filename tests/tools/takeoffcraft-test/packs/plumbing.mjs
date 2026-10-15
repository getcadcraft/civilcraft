/* SPDX-License-Identifier: Apache-2.0 */
// Plumbing (0.5 TK.3): drain-waste-vent and water piping with hangers, fixtures with their trim. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';

const items = [];
const FIT = 'Fittings are not counted from the length: add them from the riser diagram or as an allowance.';
for (const [k, size, mm] of [['2', '2 in', '50 mm'], ['3', '3 in', '75 mm'], ['4', '4 in', '100 mm']]) {
  items.push(twin({
    key: 'pvc-dwv-' + k, csi: '22 13 16', group: 'Drain, waste and vent', type: 'linear', src: ['ipc-308', 'geometry'],
    assume: ['Pipe 10% waste.', 'Hangers at 4 ft at most on horizontal PVC (IPC Table 308.5), plus one per run.', FIT],
    note: 'Draw horizontal runs; risers as their own runs.',
    name: [`PVC DWV pipe ${size}, horizontal, hung`, `PVC DWV pipe ${mm}, horizontal, hung`], unit: ['LF', 'm'],
    c: [[`PVC DWV pipe ${size}`, ['LF', 'm'], 'L', 'L', 1000], [`Pipe hangers ${size}`, 'EA', 'ceil(L/4)+N', 'ceil(L/1.2192)+N', 500]],
  }));
}
for (const [k, size, mm] of [['12', '1/2 in', '15 mm'], ['34', '3/4 in', '22 mm'], ['1', '1 in', '28 mm']]) {
  items.push(twin({
    key: 'copper-l-' + k, csi: '22 11 16', group: 'Water', type: 'linear', src: ['ipc-308', 'geometry'],
    assume: ['Tube 10% waste.', 'Hangers at 6 ft at most on copper tubing 1-1/4 in and smaller (IPC Table 308.5), plus one per run.', FIT],
    note: 'Draw the water lines.',
    name: [`Copper tube type L ${size}, hung`, `Copper tube type L ${mm}, hung`], unit: ['LF', 'm'],
    c: [[`Copper tube type L ${size}`, ['LF', 'm'], 'L', 'L', 1000], [`Copper hangers ${size}`, 'EA', 'ceil(L/6)+N', 'ceil(L/1.8288)+N', 500]],
  }));
  items.push(twin({
    key: 'pex-' + k, csi: '22 11 16', group: 'Water', type: 'linear', src: ['ipc-308', 'geometry'],
    assume: ['Tubing 10% waste.', 'Supports at 32 in at most on horizontal PEX (IPC Table 308.5), plus one per run.', FIT],
    note: 'Draw the water lines.',
    name: [`PEX tubing ${size}, supported`, `PEX tubing ${mm}, supported`], unit: ['LF', 'm'],
    c: [[`PEX tubing ${size}`, ['LF', 'm'], 'L', 'L', 1000], [`PEX supports ${size}`, 'EA', 'ceil(L*12/32)+N', 'ceil(L/0.8128)+N', 500]],
  }));
}
const fixture = (key, name, parts, note) => one({
  key, csi: '22 40 00', group: 'Fixtures', type: 'count', src: ['ipc-4'], assume: ['Rough-in piping is measured as runs; the parts here are the fixture and its trim.'],
  note: note || 'Count each fixture.', name, unit: 'EA', c: parts.map(([n, f]) => [n, 'EA', f || 'N']),
});
items.push(fixture('wc', 'Water closet, floor mounted, with supply', [['Water closet (bowl and tank)'], ['Wax ring'], ['Closet bolts (set)'], ['Angle stop'], ['Supply line']]));
items.push(fixture('lav', 'Lavatory with faucet, trap and supplies', [['Lavatory'], ['Faucet'], ['P-trap'], ['Angle stops', 'N*2'], ['Supply lines', 'N*2']]));
items.push(fixture('sink-kitchen', 'Kitchen sink, double bowl, with faucet and trap', [['Kitchen sink, double bowl'], ['Kitchen faucet'], ['Basket strainers', 'N*2'], ['P-trap with continuous waste'], ['Angle stops', 'N*2'], ['Supply lines', 'N*2']]));
items.push(fixture('shower-valve', 'Tub / shower valve with trim', [['Pressure-balancing valve'], ['Trim kit'], ['Shower head and arm']]));
items.push(fixture('floor-drain', 'Floor drain with trap primer', [['Floor drain'], ['Trap'], ['Trap primer connection']]));
items.push(fixture('hose-bibb', 'Frost-free hose bibb', [['Frost-free hose bibb'], ['Vacuum breaker']]));
items.push(fixture('water-heater', 'Water heater, 50 gal (190 L), with connections', [['Water heater'], ['Expansion tank'], ['Water heater connectors', 'N*2'], ['T&P discharge pipe and fitting'], ['Drain pan']], 'Count each water heater.'));

export default pack({
  id: 'trade.plumbing', name: 'Plumbing', trade: 'Plumbing',
  description: 'PVC drain, waste and vent pipe; copper and PEX water lines with hangers at the code spacing; water closets, lavatories, kitchen sinks, shower valves, floor drains, hose bibbs and water heaters with their trim. Assemblies only: set your own rates.',
  csi: ['22 11 16', '22 13 16', '22 40 00'],
  items,
});
