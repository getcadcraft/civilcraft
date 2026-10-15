/* SPDX-License-Identifier: Apache-2.0 */
// Masonry (0.5 TK.2): brick veneer, concrete block walls, flashing and weeps, lintels, adhered stone. CC0-1.0 data.
import { pack, twin } from './common.mjs';

// Modular brick 3-5/8 x 2-1/4 x 7-5/8 in with 3/8 in joints: an 8 x 2-2/3 in module = 6.75 brick per SF (72.66 per m²).
// Mortar from the geometry (full bed and head joints, no waste): joint share of the face = 1 - 6.75 x 2.25 x 7.625 / 144 = 0.1958;
//   x 3.625 / 12 ft deep = 0.0592 CF per SF (0.01803 m³ per m²).
// Concrete block 7-5/8 x 7-5/8 x 15-5/8 in on a 16 x 8 in module = 1.125 units per SF (12.11 per m²).
// Block mortar, face-shell bedding, 3/8 in joints, two 1-1/4 in face shells: bed joints 1.5 LF per SF x 12 x 2.5 x 0.375 = 16.88 cu in,
//   head joints 1.125 x 7.625 x 2.5 x 0.375 = 8.04 cu in → 24.9 cu in = 0.0144 CF per SF (0.00439 m³ per m²).
const items = [];
items.push(twin({
  key: 'brick-veneer', csi: '04 21 13', group: 'Brick', type: 'area', src: ['bia-tn10', 'irc-r703', 'tms-402', 'geometry'],
  assume: ['Brick: modular, 6.75 per SF with 3/8 in joints (BIA Technical Note 10), 5% waste.', 'Mortar: 0.0592 CF per SF from the joint volume, plus 25% for waste and droppings (a starting figure).', 'Ties: one per 2.67 SF of wall (IRC R703.8.4.1 limit).', 'No deduction for openings: draw them as cut-outs.'],
  note: 'Measure the veneer area on the elevations. Metric twin: the same US modular brick; local bricks differ in size, so change 72.66 for yours.',
  name: ['Brick veneer, modular, 3/8 in joints, with ties', 'Brick veneer, modular (US), 10 mm joints, with ties'], unit: ['SF', 'm²'],
  c: [
    ['Face brick, modular', 'EA', 'ceil(A*6.75)', 'ceil(A*72.66)', 500],
    ['Mortar (type N)', ['CF', 'm³'], 'A*0.0592', 'A*0.01803', 2500],
    ['Veneer ties', 'EA', 'ceil(A/2.67)', 'ceil(A/0.24805)', 500],
  ],
}));
for (const [t, tm, shell] of [[8, 200, 1.25], [12, 300, 1.5]]) {
  const cf = +(((1.5 * 12 * 2 * shell * 0.375) + (1.125 * 7.625 * 2 * shell * 0.375)) / 1728).toFixed(5);
  const m3 = +(cf * 0.028316846592 / 0.09290304).toFixed(5);
  items.push(twin({
    key: `cmu-${t}`, csi: '04 22 00', group: 'Concrete block', type: 'area', src: ['ncma-tek', 'tms-402', 'geometry'],
    assume: [`Block: 1.125 per SF on a 16 x 8 in module, 5% waste.`, `Mortar: face-shell bedding, ${shell} in shells, 3/8 in joints = ${cf} CF per SF, plus 25% for waste (a starting figure).`, 'Ladder joint reinforcement every second course (16 in): 0.75 LF per SF, 10% for laps.', 'Grout and vertical bars are per the drawings: add them as their own items.'],
    note: 'Measure the wall area on the elevations.',
    name: [`Concrete block wall ${t} in, face-shell bedding, joint reinforcement 16 in o.c.`, `Concrete block wall ${tm} mm, face-shell bedding, joint reinforcement 406 mm o.c.`], unit: ['SF', 'm²'],
    c: [
      [[`Concrete block ${t} x 8 x 16 in`, `Concrete block ${tm} x 200 x 400 mm`], 'EA', 'ceil(A*1.125)', 'ceil(A*12.109)', 500],
      ['Mortar (type S)', ['CF', 'm³'], `A*${cf}`, `A*${m3}`, 2500],
      ['Joint reinforcement, ladder', ['LF', 'm'], 'A*0.75', 'A/0.4064', 1000],
    ],
  }));
}
items.push(twin({
  key: 'flashing-weeps', csi: '04 05 19', group: 'Flashing and accessories', type: 'linear', src: ['irc-r703', 'tms-402', 'geometry'],
  assume: ['Through-wall flashing 10% for laps and end dams.', 'Weeps at 33 in o.c. at most (IRC R703.8.6), one extra per run.'],
  note: 'Measure the base of the veneer and the heads of openings.',
  name: ['Through-wall flashing with weeps 33 in o.c.', 'Through-wall flashing with weeps 838 mm o.c.'], unit: ['LF', 'm'],
  c: [['Through-wall flashing', ['LF', 'm'], 'L', 'L', 1000], ['Weep vents', 'EA', 'ceil(L*12/33)+N', 'ceil(L/0.8382)+N', 500]],
}));
items.push(twin({
  key: 'lintel-4', csi: '05 50 00', group: 'Flashing and accessories', type: 'count', src: ['tms-402', 'astm-a615'],
  assume: ['Opening 4 ft with 8 in bearing each end: 5.33 LF of angle per lintel (size the angle from the drawings).'],
  note: 'Count each opening in the veneer.',
  name: ['Loose steel lintel angle, 4 ft opening', 'Loose steel lintel angle, 1.22 m opening'], unit: ['EA', 'EA'],
  c: [[['Steel angle 3-1/2 x 3-1/2 x 1/4 in', 'Steel angle 89 x 89 x 6.4 mm'], ['LF', 'm'], 'N*(4+2*8/12)', 'N*(1.2192+2*0.2032)', 0]],
}));
items.push(twin({
  key: 'stone-adhered', csi: '04 73 00', group: 'Stone', type: 'area', src: ['irc-r703', 'pds', 'geometry'],
  assume: ['Manufactured stone 10% waste; corners measured as their own run.', 'Lath and scratch coat on the whole area (IRC R703.12); mortar: one 80 lb bag per 25 SF for scratch and setting beds (a starting figure).'],
  note: 'Measure the veneer area.',
  name: ['Adhered stone veneer on lath and scratch coat', 'Adhered stone veneer on lath and scratch coat'], unit: ['SF', 'm²'],
  c: [['Stone veneer flats', ['SF', 'm²'], 'A', 'A', 1000], ['Metal lath', ['SF', 'm²'], 'A', 'A', 1000], ['Mortar, 80 lb bags', 'bag', 'ceil(A/25)', 'ceil(A/2.3226)', 500]],
}));

export default pack({
  id: 'trade.masonry', name: 'Masonry', trade: 'Masonry',
  description: 'Modular brick veneer with ties, 8 in and 12 in concrete block walls with joint reinforcement, through-wall flashing and weeps, loose lintels and adhered stone veneer. Units and mortar follow from the module geometry. Assemblies only: set your own rates.',
  csi: ['04 05 19', '04 21 13', '04 22 00', '04 73 00', '05 50 00'],
  items,
});
