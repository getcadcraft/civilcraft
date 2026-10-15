/* SPDX-License-Identifier: Apache-2.0 */
// Flooring (0.5 TK.2): tile, resilient, carpet, wood, base, floor preparation. CC0-1.0 data.
import { pack, twin } from './common.mjs';

const items = [];
const TILE_ASSUME = [
  'Tile: 10% waste for cuts and breakage (straight lay; diagonal patterns take more).',
  'Thin-set: one 50 lb bag per 95 SF with a 1/4 x 1/4 in square-notch trowel (a starting figure: use the bag’s coverage chart for your trowel).',
  'Grout from the joint volume: 12 x 12 in tile, 1/8 in joints, 3/8 in deep = 1.13 cu in per SF, about 0.08 lb per SF (use the grout maker’s calculator for other sizes).',
];
items.push(twin({
  key: 'tile-floor-conc', csi: '09 30 13', group: 'Tile', type: 'area', src: ['tcna', 'pds', 'geometry'],
  assume: TILE_ASSUME, note: 'Measure the tiled floor area.',
  name: ['Ceramic / porcelain floor tile on concrete, thin-set', 'Ceramic / porcelain floor tile on concrete, thin-set'], unit: ['SF', 'm²'],
  c: [
    ['Floor tile', ['SF', 'm²'], 'A', 'A', 1000],
    ['Thin-set mortar, 50 lb bags', 'bag', 'ceil(A/95)', 'ceil(A/8.826)', 500],
    ['Sanded grout', ['lb', 'kg'], 'A*0.08', 'A*0.3906', 1000],
  ],
}));
items.push(twin({
  key: 'tile-floor-wood', csi: '09 30 13', group: 'Tile', type: 'area', src: ['tcna', 'pds', 'geometry'],
  assume: [...TILE_ASSUME, 'Cement backer board 3 x 5 ft (15 SF) over the wood subfloor, 10% waste; backer screws 8 in o.c. about 1.5 per SF; alkali-resistant mesh tape on the board joints (0.4 LF per SF).'],
  note: 'Measure the tiled floor area.',
  name: ['Floor tile on wood subfloor, cement backer board, thin-set', 'Floor tile on wood subfloor, cement backer board, thin-set'], unit: ['SF', 'm²'],
  c: [
    ['Floor tile', ['SF', 'm²'], 'A', 'A', 1000],
    [['Cement backer board 3 x 5 ft', 'Cement backer board 914 x 1524 mm'], 'sheet', 'ceil(A/15)', 'ceil(A/1.3935)', 1000],
    ['Backer board screws', 'EA', 'ceil(A*1.5)', 'ceil(A*16.146)', 1000],
    ['Mesh tape, alkali resistant', ['LF', 'm'], 'A*0.4', 'A*1.3123', 1000],
    ['Thin-set mortar, 50 lb bags', 'bag', 'ceil(A*2/95)', 'ceil(A*2/8.826)', 500],
    ['Sanded grout', ['lb', 'kg'], 'A*0.08', 'A*0.3906', 1000],
  ],
}));
items.push(twin({
  key: 'tile-wall', csi: '09 30 13', group: 'Tile', type: 'area', src: ['tcna', 'pds', 'geometry'],
  assume: ['Wall tile 10% waste; thin-set one 50 lb bag per 95 SF; grout 0.08 lb per SF (starting figures).', 'Backer board 3 x 5 ft in wet areas.'],
  note: 'Measure the tiled wall area.',
  name: ['Wall tile on cement backer board', 'Wall tile on cement backer board'], unit: ['SF', 'm²'],
  c: [
    ['Wall tile', ['SF', 'm²'], 'A', 'A', 1000],
    [['Cement backer board 3 x 5 ft', 'Cement backer board 914 x 1524 mm'], 'sheet', 'ceil(A/15)', 'ceil(A/1.3935)', 1000],
    ['Thin-set mortar, 50 lb bags', 'bag', 'ceil(A/95)', 'ceil(A/8.826)', 500],
    ['Sanded grout', ['lb', 'kg'], 'A*0.08', 'A*0.3906', 1000],
  ],
}));
items.push(twin({
  key: 'lvp-float', csi: '09 65 19', group: 'Resilient', type: 'area', src: ['astm-f710', 'pds', 'geometry'],
  assume: ['Plank 10% waste (straight lay).', 'Underlayment where the product calls for one, 5% waste.', 'Transitions are counted by doorway as their own item.'],
  note: 'Measure the floor area.',
  name: ['Luxury vinyl plank, floating, with underlayment', 'Luxury vinyl plank, floating, with underlayment'], unit: ['SF', 'm²'],
  c: [['Luxury vinyl plank', ['SF', 'm²'], 'A', 'A', 1000], ['Underlayment', ['SF', 'm²'], 'A', 'A', 500]],
}));
items.push(twin({
  key: 'vct', csi: '09 65 19', group: 'Resilient', type: 'area', src: ['astm-f710', 'pds', 'geometry'],
  assume: ['Tile 5% waste.', 'Adhesive at 150 SF per gallon (a starting figure: use the adhesive’s data sheet for its trowel).'],
  note: 'Measure the floor area.',
  name: ['Vinyl composition tile 12 x 12 in, adhesive', 'Vinyl composition tile 305 x 305 mm, adhesive'], unit: ['SF', 'm²'],
  c: [['Vinyl composition tile', ['SF', 'm²'], 'A', 'A', 500], ['Flooring adhesive', ['gal', 'L'], 'A/150', 'A/3.681', 500]],
}));
items.push(twin({
  key: 'carpet-broadloom', csi: '09 68 16', group: 'Carpet', type: 'area', src: ['cri-105', 'geometry'],
  assume: ['Carpet and pad 10% waste for seams and pattern (12 ft rolls: plan the seams and adjust).', 'Tack strip along the whole perimeter of each room (P).'],
  note: 'Measure each carpeted room as an area in square yards.',
  name: ['Broadloom carpet with pad and tack strip', 'Broadloom carpet with pad and tack strip'], unit: ['SY', 'm²'],
  c: [['Carpet', ['SY', 'm²'], 'A', 'A', 1000], ['Carpet pad', ['SY', 'm²'], 'A', 'A', 1000], ['Tack strip', ['LF', 'm'], 'P', 'P', 500]],
}));
items.push(twin({
  key: 'carpet-tile', csi: '09 68 13', group: 'Carpet', type: 'area', src: ['cri-105', 'pds', 'geometry'],
  assume: ['Carpet tile 24 x 24 in (4 SF), 5% waste.', 'Release adhesive at 200 SF per gallon (a starting figure: use the data sheet).'],
  note: 'Measure the floor area.',
  name: ['Carpet tile 24 x 24 in, release adhesive', 'Carpet tile 610 x 610 mm, release adhesive'], unit: ['SF', 'm²'],
  c: [['Carpet tile', 'EA', 'ceil(A/4)', 'ceil(A/0.3716)', 500], ['Release adhesive', ['gal', 'L'], 'A/200', 'A/4.909', 500]],
}));
items.push(twin({
  key: 'hardwood-solid', csi: '09 64 00', group: 'Wood', type: 'area', src: ['nwfa', 'geometry'],
  assume: ['Solid strip flooring 3/4 in, 7% waste (straight lay; more for diagonals and short boards).', 'Underlayment paper on the whole area, 10% for laps.', 'Cleats or staples: about 1.25 per SF (one every 8 to 10 in along each 2-1/4 in strip; use the NWFA schedule for your width).'],
  note: 'Measure the floor area.',
  name: ['Solid hardwood strip 3/4 in, nail-down, with underlayment', 'Solid hardwood strip 19 mm, nail-down, with underlayment'], unit: ['SF', 'm²'],
  c: [['Hardwood flooring', ['SF', 'm²'], 'A', 'A', 700], ['Underlayment paper', ['SF', 'm²'], 'A', 'A', 1000], ['Flooring cleats', 'EA', 'ceil(A*1.25)', 'ceil(A*13.455)', 500]],
}));
items.push(twin({
  key: 'rubber-base', csi: '09 65 13', group: 'Base', type: 'linear', src: ['pds', 'geometry'],
  assume: ['Rubber or vinyl base, 4 in, 5% waste.', 'Base adhesive: one cartridge per 25 LF (a starting figure).'],
  note: 'Measure the base run along the walls; leave out door openings.',
  name: ['Resilient wall base 4 in', 'Resilient wall base 100 mm'], unit: ['LF', 'm'],
  c: [['Resilient base 4 in', ['LF', 'm'], 'L', 'L', 500], ['Base adhesive cartridges', 'EA', 'ceil(L/25)', 'ceil(L/7.62)', 0]],
}));
items.push(twin({
  key: 'transition', csi: '09 65 19', group: 'Base', type: 'count', src: ['pds'],
  assume: ['One 3 ft (914 mm) transition strip per doorway.'],
  note: 'Count each doorway where floor finishes change.',
  name: ['Floor transition strip at doorway', 'Floor transition strip at doorway'], unit: ['EA', 'EA'],
  c: [['Transition strip', ['LF', 'm'], 'N*3', 'N*0.9144', 0]],
}));
items.push(twin({
  key: 'self-level', csi: '03 54 16', group: 'Floor preparation', type: 'area', src: ['astm-f710', 'pds', 'geometry'],
  assume: ['Average thickness 1/4 in (change the 0.25 / 6.35).', 'One 50 lb bag yields about 0.5 CF (0.0142 m³): a starting figure, use the bag’s yield.', 'Primer at 300 SF per gallon (a starting figure).'],
  note: 'Measure the area to be leveled.',
  name: ['Self-leveling underlayment, 1/4 in average', 'Self-leveling underlayment, 6 mm average'], unit: ['SF', 'm²'],
  c: [['Self-leveling underlayment, 50 lb bags', 'bag', 'ceil(A*(0.25/12)/0.5)', 'ceil(A*0.00635/0.014158)', 500], ['Underlayment primer', ['gal', 'L'], 'A/300', 'A/7.363', 500]],
}));

export default pack({
  id: 'trade.flooring', name: 'Flooring', trade: 'Flooring',
  description: 'Floor and wall tile (on concrete or on backer board), luxury vinyl plank, VCT, broadloom carpet and carpet tile, solid hardwood, resilient base, transitions and self-leveling underlayment. Coverage figures are starting points to replace with your products’ data sheets. Assemblies only: set your own rates.',
  csi: ['03 54 16', '09 30 13', '09 64 00', '09 65 13', '09 65 19', '09 68 13', '09 68 16'],
  items,
});
