/* SPDX-License-Identifier: Apache-2.0 */
// Residential (steep-slope) roofing (0.5 TK.3). CC0-1.0 data. Give the area item the roof's pitch (TakeoffCraft measures the
// sloped surface from the plan), or measure on a roof plan drawn true to slope.
import { pack, twin, one } from './common.mjs';

const SLOPE_NOTE = 'Measure each roof plane on the plan and give the item the roof pitch (Roofs and slopes): A is then the sloped surface; P is the plane’s outline.';
const items = [];
items.push(twin({
  key: 'shingle-arch', csi: '07 31 13', group: 'Shingles', type: 'area', src: ['irc-r905', 'nrca', 'geometry'],
  assume: [
    'Shingles: 3 bundles per square of 100 SF (most architectural and three-tab shingles; check the wrapper), 10% waste for hips, valleys and starter cuts.',
    'Synthetic underlayment over the whole deck (IRC R905.1.1), 10% for laps.',
    'Drip edge at eaves and rakes (IRC R905.2.8.5): the plane’s whole outline P, in 10 ft lengths; lower it where planes meet hips and valleys.',
    'Starter strip along eaves and rakes: P.',
    'Nails: about 320 per square (4 per shingle, IRC R905.2.6 minimum; 6 in high-wind areas).',
  ],
  note: SLOPE_NOTE,
  name: ['Asphalt shingles, architectural, synthetic underlayment, drip edge', 'Asphalt shingles, architectural, synthetic underlayment, drip edge'], unit: ['SF', 'm²'],
  c: [
    ['Shingles', 'bundle', 'ceil(A/100*3)', 'ceil(A/9.2903*3)', 1000],
    ['Synthetic underlayment', ['SF', 'm²'], 'A', 'A', 1000],
    [['Drip edge, 10 ft lengths', 'Drip edge, 3.05 m lengths'], 'EA', 'ceil(P/10)', 'ceil(P/3.048)', 500],
    ['Starter strip', ['LF', 'm'], 'P', 'P', 500],
    ['Roofing nails 1-1/4 in', 'EA', 'ceil(A/100*320)', 'ceil(A/9.2903*320)', 500],
  ],
}));
items.push(twin({
  key: 'tearoff', csi: '02 41 19', group: 'Tear-off', type: 'area', src: ['nrca', 'geometry'],
  assume: ['One layer of asphalt shingles weighs about 250 lb per square (a starting figure: heavier shingles and extra layers weigh more).', 'Dumpster loads are counted from the debris volume: 1 CY per square of one layer (a starting figure).'],
  note: SLOPE_NOTE,
  name: ['Tear off one layer of asphalt shingles', 'Tear off one layer of asphalt shingles'], unit: ['SF', 'm²'],
  c: [['Debris weight', ['lb', 'kg'], 'A/100*250', 'A*12.207', 0], ['Debris volume', ['CY', 'm³'], 'A/100', 'A*0.0823', 0]],
}));
items.push(twin({
  key: 'ice-barrier', csi: '07 31 13', group: 'Underlayment', type: 'linear', src: ['irc-r905', 'geometry'],
  assume: ['Self-adhered ice barrier from the eave to 24 in inside the exterior wall (IRC R905.1.2): two 3 ft courses = 6 ft up the slope (change 6 for your overhang and pitch).', '10% for laps.'],
  note: 'Draw along the eaves where the climate calls for an ice barrier.',
  name: ['Ice barrier at eaves, two 3 ft courses', 'Ice barrier at eaves, two 0.91 m courses'], unit: ['LF', 'm'],
  c: [['Self-adhered ice barrier', ['SF', 'm²'], 'L*6', 'L*1.8288', 1000]],
}));
items.push(twin({
  key: 'ridge-cap', csi: '07 31 13', group: 'Hips and ridges', type: 'linear', src: ['irc-r905', 'irc-r806', 'pds', 'geometry'],
  assume: ['Hip and ridge cap shingles: about 33 LF per bundle (check the wrapper).', 'Ridge vent on ridges only (where the attic ventilation calls for it, IRC R806): leave it out for hips.'],
  note: 'Draw ridges and hips; give the item the roof pitch and set the segments as hips where they are (Roofs and slopes).',
  name: ['Ridge and hip cap with ridge vent', 'Ridge and hip cap with ridge vent'], unit: ['LF', 'm'],
  c: [['Hip and ridge cap shingles', 'bundle', 'ceil(L/33)', 'ceil(L/10.058)', 500], ['Ridge vent', ['LF', 'm'], 'L', 'L', 500]],
}));
items.push(twin({
  key: 'valley', csi: '07 62 00', group: 'Flashing', type: 'linear', src: ['irc-r905', 'nrca', 'geometry'],
  assume: ['Open metal valley 24 in wide in 10 ft lengths (IRC R905.2.8.2), over a 36 in self-adhered underlayment strip.'],
  note: 'Draw each valley; give the item the pitch and set the segments as valleys (hip) so they measure along the slope.',
  name: ['Valley: metal valley flashing over self-adhered underlayment', 'Valley: metal valley flashing over self-adhered underlayment'], unit: ['LF', 'm'],
  c: [[['Valley metal 24 in, 10 ft lengths', 'Valley metal 610 mm, 3.05 m lengths'], 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 500], ['Self-adhered underlayment 36 in strip', ['SF', 'm²'], 'L*3', 'L*0.9144', 1000]],
}));
items.push(twin({
  key: 'step-flashing', csi: '07 62 00', group: 'Flashing', type: 'linear', src: ['irc-r905', 'geometry'],
  assume: ['One step flashing per shingle course: 5 in exposure = 2.4 pieces per LF of wall (IRC R905.2.8.3).'],
  note: 'Draw where a roof plane meets a wall, along the slope.',
  name: ['Step flashing at sidewalls, 5 in exposure', 'Step flashing at sidewalls, 127 mm exposure'], unit: ['LF', 'm'],
  c: [['Step flashing pieces', 'EA', 'ceil(L*12/5)', 'ceil(L/0.127)', 500]],
}));
items.push(one({
  key: 'pipe-boot', csi: '07 62 00', group: 'Flashing', type: 'count', src: ['nrca'], assume: ['One boot per pipe through the roof.'],
  note: 'Count each plumbing vent through the roof.', name: 'Pipe boot flashing', unit: 'EA', c: [['Pipe boot', 'EA', 'N'], ['Sealant tube', 'EA', 'ceil(N/4)']],
}));
items.push(twin({
  key: 'metal-panel', csi: '07 41 13', group: 'Metal roofing', type: 'area', src: ['ibc-1507', 'nrca', 'pds', 'geometry'],
  assume: ['Standing-seam panels 16 in wide, 10% waste.', 'Clips at 24 in along each seam: 16 / 12 x 2 = 2.67 SF per clip, so 0.375 clips per SF (spacing is set by the panel maker and the wind design).', 'High-temperature underlayment over the whole deck, 10% for laps.', 'Eave and rake trim on the outline P.'],
  note: SLOPE_NOTE,
  name: ['Standing-seam metal roof panels 16 in, clips, underlayment', 'Standing-seam metal roof panels 406 mm, clips, underlayment'], unit: ['SF', 'm²'],
  c: [['Metal roof panels', ['SF', 'm²'], 'A', 'A', 1000], ['Panel clips', 'EA', 'ceil(A*0.375)', 'ceil(A*4.0365)', 500], ['High-temperature underlayment', ['SF', 'm²'], 'A', 'A', 1000], ['Eave and rake trim', ['LF', 'm'], 'P', 'P', 1000]],
}));

export default pack({
  id: 'trade.roofing-residential', name: 'Roofing, residential', trade: 'Roofing (steep slope)',
  description: 'Architectural asphalt shingles with underlayment, drip edge, starter and nails; tear-off; ice barrier at eaves; ridge and hip cap with ridge vent; valleys; step flashing; pipe boots; standing-seam metal panels. Use the pitch on the item so areas are true roof surfaces. Assemblies only: set your own rates.',
  csi: ['02 41 19', '07 31 13', '07 41 13', '07 62 00'],
  items,
});
