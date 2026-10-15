/* SPDX-License-Identifier: Apache-2.0 */
// Electrical (0.5 TK.2): branch circuits in cable and in EMT, devices, lighting, panels, data. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';

const items = [];
const MAKEUP = 'Conductor length: the run plus 1 ft per run (6 in of free conductor at each end, NEC 300.14); add your own allowance for drops to devices that are not drawn.';

for (const [k, size, met] of [['14-2', '14/2', '2 x 2.08 mm²'], ['12-2', '12/2', '2 x 3.31 mm²'], ['12-3', '12/3', '3 x 3.31 mm²'], ['10-2', '10/2', '2 x 5.26 mm²']]) {
  items.push(twin({
    key: 'nm-' + k, csi: '26 05 19', group: 'Branch circuits', type: 'linear', src: ['nec-334', 'nec-300', 'geometry'],
    assume: [MAKEUP, 'Staples: one within 12 in of each box (2 per run) and one every 4-1/2 ft along the run (NEC 334.30).', 'Waste on cable: 10%.'],
    note: 'Draw each home run or circuit run; N = number of runs drawn.',
    name: [`Branch circuit, NM-B ${size} with ground`, `Branch circuit, NM-B cable ${met} with ground`], unit: ['LF', 'm'],
    c: [
      [[`NM-B cable ${size} with ground`, `NM-B cable ${met} with ground`], ['LF', 'm'], 'L+N*1', 'L+N*0.3048', 1000],
      ['Cable staples', 'EA', 'ceil(L/4.5)+N*2', 'ceil(L/1.4)+N*2', 500],
    ],
  }));
}

for (const [k, emt, emtM, n, awg, mm2] of [['emt-12-3', '1/2 in', '16 mm (1/2)', 3, '#12', '3.31 mm²'], ['emt-34-4', '3/4 in', '21 mm (3/4)', 4, '#10', '5.26 mm²'], ['emt-1-4', '1 in', '27 mm (1)', 4, '#8', '8.37 mm²']]) {
  items.push(twin({
    key: k, csi: '26 05 33', group: 'Raceways', type: 'linear', src: ['nec-358', 'nec-300', 'geometry'],
    assume: [
      'EMT in 10 ft lengths (metric twin 3.05 m): one coupling per length.',
      'Straps: within 3 ft of each box (2 per run) and every 10 ft (NEC 358.30).',
      'Connectors: one at each end of a run.',
      `Wire: ${n} conductors x (run + 1 ft per run for 6 in free conductor at each box, NEC 300.14). Pulling allowance: 10% waste.`,
    ],
    note: 'Draw each conduit run; N = number of runs. Fittings for offsets and bends are not counted.',
    name: [`EMT ${emt} with ${n} ${awg} THHN`, `EMT ${emtM} with ${n} THHN ${mm2}`], unit: ['LF', 'm'],
    c: [
      [[`EMT ${emt}`, `EMT ${emtM}`], ['LF', 'm'], 'L', 'L', 500],
      [[`EMT couplings ${emt}`, `EMT couplings ${emtM}`], 'EA', 'ceil(L/10)', 'ceil(L/3.048)', 500],
      [[`EMT connectors ${emt}`, `EMT connectors ${emtM}`], 'EA', 'N*2', 'N*2', 500],
      [[`One-hole straps ${emt}`, `One-hole straps ${emtM}`], 'EA', 'ceil(L/10)+N*2', 'ceil(L/3)+N*2', 500],
      [[`THHN ${awg}`, `THHN ${mm2}`], ['LF', 'm'], `(L+N*1)*${n}`, `(L+N*0.3048)*${n}`, 1000],
    ],
  }));
}

const device = (key, name, parts, note) => one({
  key, csi: '26 27 26', group: 'Devices', type: 'count', src: ['nec-314'],
  assume: ['One box per device, sized for its box fill (NEC 314.16): check it for the conductors you bring in.'],
  note: note || 'Count each device on the plans.', name, unit: 'EA',
  c: parts.map(([n, f]) => [n, 'EA', f || 'N']),
});
items.push(device('recep-duplex-20', 'Duplex receptacle 20 A, new-work box', [['Device box, single gang'], ['Duplex receptacle 20 A'], ['Cover plate, single gang'], ['Ground pigtail with wire nut']]));
items.push(device('recep-gfci', 'GFCI receptacle 20 A, new-work box', [['Device box, single gang'], ['GFCI receptacle 20 A'], ['Cover plate, decorator'], ['Ground pigtail with wire nut']]));
items.push(device('recep-wr', 'Weather-resistant GFCI receptacle with in-use cover', [['Weatherproof box, single gang'], ['WR GFCI receptacle 20 A'], ['In-use cover'], ['Ground pigtail with wire nut']]));
items.push(device('switch-sp', 'Single-pole switch, new-work box', [['Device box, single gang'], ['Single-pole switch 20 A'], ['Cover plate, single gang']]));
items.push(device('switch-3w', 'Three-way switch, new-work box', [['Device box, single gang'], ['Three-way switch 20 A'], ['Cover plate, single gang']], 'Count each three-way switch (a pair controls one light).'));
items.push(device('switch-dimmer', 'Dimmer switch, new-work box', [['Device box, single gang'], ['Dimmer, LED rated'], ['Cover plate, decorator']]));
items.push(device('jbox', 'Junction box 4 in square with cover', [['Box 4 in square'], ['Blank cover'], ['Ground screw and pigtail']]));

const light = (key, name, parts, note) => one({
  key, csi: '26 51 00', group: 'Lighting', type: 'count', src: ['nec-314'], assume: ['Lamps are integral (LED) unless a lamp line is listed.'],
  note: note || 'Count each fixture.', name, unit: 'EA', c: parts.map(([n, f]) => [n, 'EA', f || 'N']),
});
items.push(light('lt-troffer-2x4', 'LED troffer 2 x 4, lay-in', [['LED troffer 2 x 4'], ['Fixture whip, 6 ft flexible'], ['Seismic / support wires (2 per fixture)', 'N*2']], 'Count each troffer; the whip ties it to the junction box above.'));
items.push(light('lt-troffer-2x2', 'LED troffer 2 x 2, lay-in', [['LED troffer 2 x 2'], ['Fixture whip, 6 ft flexible'], ['Support wires (2 per fixture)', 'N*2']]));
items.push(light('lt-downlight', 'LED downlight 6 in, new construction', [['Recessed housing / canless downlight 6 in'], ['Ceiling box or junction box']]));
items.push(light('lt-surface', 'Surface-mounted ceiling fixture', [['Ceiling fixture'], ['Ceiling box, fan/fixture rated']]));
items.push(light('lt-exit', 'Exit sign with battery backup', [['Exit sign, LED, battery'], ['Ceiling box']]));
items.push(light('lt-wallpack', 'Exterior LED wall pack', [['LED wall pack'], ['Weatherproof box']]));
items.push(one({
  key: 'panel-42', csi: '26 24 16', group: 'Distribution', type: 'count', src: ['nec-314'],
  assume: ['Breakers by the panel schedule: add them as their own items or components.'],
  note: 'Count each panelboard.', name: 'Panelboard 42 circuits, surface or flush', unit: 'EA',
  c: [['Panelboard 42 circuits', 'EA', 'N'], ['Panel directory and labels', 'EA', 'N']],
}));
items.push(one({
  key: 'data-outlet', csi: '27 15 00', group: 'Communications', type: 'count', src: ['tia-568'],
  assume: ['One jack per outlet; add a second jack line for dual outlets.'],
  note: 'Count each data outlet.', name: 'Data outlet, Cat 6, single jack', unit: 'EA',
  c: [['Low-voltage mounting bracket / mud ring', 'EA', 'N'], ['Cat 6 jack', 'EA', 'N'], ['Faceplate, 1 port', 'EA', 'N'], ['Patch panel port', 'EA', 'N']],
}));
items.push(twin({
  key: 'cat6-run', csi: '27 15 00', group: 'Communications', type: 'linear', src: ['tia-569', 'tia-568', 'geometry'],
  assume: ['J-hooks at 5 ft spacing at most (ANSI/TIA-569), plus one per run.', 'Cable: run + 10 ft per run for the service loops at the rack and outlet (a starting figure).'],
  note: 'Draw each cable run from the rack to the outlet.',
  name: ['Cat 6 cable run on J-hooks', 'Cat 6 cable run on J-hooks'], unit: ['LF', 'm'],
  c: [['Cat 6 cable', ['LF', 'm'], 'L+N*10', 'L+N*3.048', 1000], ['J-hooks', 'EA', 'ceil(L/5)+N', 'ceil(L/1.524)+N', 500]],
}));

export default pack({
  id: 'trade.electrical', name: 'Electrical', trade: 'Electrical',
  description: 'Branch circuits in NM cable and in EMT with their conductors, straps and fittings; receptacles, switches and boxes; light fixtures; panelboards; data outlets and Cat 6 runs. Assemblies only: set your own rates.',
  csi: ['26 05 19', '26 05 33', '26 24 16', '26 27 26', '26 51 00', '27 15 00'],
  sources: {
    'tia-568': { title: 'ANSI/TIA-568, Commercial Building Telecommunications Cabling Standard', publisher: 'Telecommunications Industry Association', url: 'https://tiaonline.org/' },
    'tia-569': { title: 'ANSI/TIA-569, Telecommunications Pathways and Spaces', publisher: 'Telecommunications Industry Association', url: 'https://tiaonline.org/' },
  },
  items,
});
