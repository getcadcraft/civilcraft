/* SPDX-License-Identifier: Apache-2.0 */
// Landscape (0.5 TK.3): sod, seed, beds and mulch, edging, trees and shrubs, irrigation, pavers. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';

const items = [];
items.push(twin({
  key: 'sod', csi: '32 92 23', group: 'Lawns', type: 'area', src: ['ansi-z60', 'geometry'],
  assume: ['Sod 5% waste; pallets of about 450 SF (ask the farm: 400 to 500 SF).', 'Topsoil 2 in under the sod: CY = A x 2 / 12 / 27.', 'Starter fertilizer: one 50 lb bag per 5,000 SF (a starting figure: read the bag).'],
  note: 'Measure the lawn area.',
  name: ['Sod on 2 in topsoil', 'Sod on 50 mm topsoil'], unit: ['SF', 'm²'],
  c: [['Sod', ['SF', 'm²'], 'A', 'A', 500], ['Sod pallets', 'EA', 'ceil(A*1.05/450)', 'ceil(A*1.05/41.806)', 0], ['Topsoil 2 in', ['CY', 'm³'], 'A*2/12/27', 'A*0.0508', 1000], ['Starter fertilizer, 50 lb bags', 'bag', 'ceil(A/5000)', 'ceil(A/464.52)', 0]],
}));
items.push(twin({
  key: 'seed', csi: '32 92 19', group: 'Lawns', type: 'area', src: ['pds', 'geometry'],
  assume: ['Seed at 5 lb per 1,000 SF (a starting figure: the seed tag gives the rate for its mix).', 'Straw mulch: one bale per 1,000 SF.'],
  note: 'Measure the seeded area.',
  name: ['Lawn seed with straw mulch', 'Lawn seed with straw mulch'], unit: ['SF', 'm²'],
  c: [['Grass seed', ['lb', 'kg'], 'A/1000*5', 'A*0.02441', 500], ['Straw bales', 'EA', 'ceil(A/1000)', 'ceil(A/92.903)', 0]],
}));
items.push(twin({
  key: 'bed-mulch', csi: '32 93 00', group: 'Planting beds', type: 'area', src: ['ansi-z60', 'geometry'],
  assume: ['Mulch 3 in deep: CY = A x 3 / 12 / 27; 10% for settling.', 'Landscape fabric under it, 10% for laps; staples one per 4 SF.', 'Planting soil 6 in: CY = A x 6 / 12 / 27.'],
  note: 'Measure each planting bed.',
  name: ['Planting bed: 6 in planting soil, fabric, 3 in mulch', 'Planting bed: 150 mm planting soil, fabric, 75 mm mulch'], unit: ['SF', 'm²'],
  c: [['Planting soil 6 in', ['CY', 'm³'], 'A*6/12/27', 'A*0.1524', 1000], ['Landscape fabric', ['SF', 'm²'], 'A', 'A', 1000], ['Fabric staples', 'EA', 'ceil(A/4)', 'ceil(A/0.3716)', 0], ['Mulch 3 in', ['CY', 'm³'], 'A*3/12/27', 'A*0.0762', 1000]],
}));
items.push(twin({
  key: 'edging', csi: '32 94 13', group: 'Planting beds', type: 'linear', src: ['pds', 'geometry'],
  assume: ['Steel or aluminum edging in 10 ft pieces; stakes at 30 in plus one per run (a starting figure: the maker’s spacing).'],
  note: 'Draw the bed edges.',
  name: ['Landscape edging, metal, staked', 'Landscape edging, metal, staked'], unit: ['LF', 'm'],
  c: [[['Edging, 10 ft pieces', 'Edging, 3.05 m pieces'], 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 500], ['Edging stakes', 'EA', 'ceil(L/2.5)+N', 'ceil(L/0.762)+N', 0]],
}));
items.push(twin({
  key: 'tree-2in', csi: '32 93 43', group: 'Plants', type: 'count', src: ['ansi-z60', 'geometry'],
  assume: ['Balled-and-burlapped tree, 2 in caliper (ANSI Z60.1 sizes).', 'Two stakes and ties per tree (where staking is specified).', 'Mulch ring 6 ft across, 3 in deep: 3.1416 x 3² x 0.25 / 27 = 0.262 CY per tree.'],
  note: 'Count each tree on the planting plan.',
  name: ['Tree, 2 in caliper B&B, staked, mulch ring', 'Tree, 50 mm caliper B&B, staked, mulch ring'], unit: ['EA', 'EA'],
  c: [['Tree 2 in caliper', 'EA', 'N', 'N', 0], ['Tree stakes and ties', 'EA', 'N*2', 'N*2', 0], ['Mulch ring', ['CY', 'm³'], 'N*3.1416*9*0.25/27', 'N*3.1416*0.9144*0.9144*0.0762', 1000]],
}));
items.push(twin({
  key: 'shrub-5', csi: '32 93 33', group: 'Plants', type: 'count', src: ['ansi-z60', 'geometry'],
  assume: ['Container shrub, #5 container (ANSI Z60.1).', 'Backfill amendment 1 cu ft per shrub (a starting figure).'],
  note: 'Count each shrub.',
  name: ['Shrub, #5 container, with amended backfill', 'Shrub, #5 container (19 L), with amended backfill'], unit: ['EA', 'EA'],
  c: [['Shrub #5', 'EA', 'N', 'N', 0], ['Soil amendment', ['CF', 'm³'], 'N*1', 'N*0.0283168', 1000]],
}));
items.push(twin({
  key: 'irrigation-spray', csi: '32 84 00', group: 'Irrigation', type: 'area', src: ['pds', 'geometry'],
  assume: ['Spray heads at 12 ft head-to-head spacing on a square grid: one per 144 SF (layouts at the edges add heads: a starting figure).', 'Lateral pipe: one line per 12 ft row = A / 12 LF; 10% for fittings and swing joints.', 'One swing joint per head.'],
  note: 'Measure each irrigated lawn or bed zone.',
  name: ['Irrigation, spray zone, heads 12 ft head-to-head', 'Irrigation, spray zone, heads 3.66 m head-to-head'], unit: ['SF', 'm²'],
  c: [['Spray heads with nozzles', 'EA', 'ceil(A/144)', 'ceil(A/13.378)', 0], ['Lateral pipe 3/4 in', ['LF', 'm'], 'A/12', 'A/3.6576', 1000], ['Swing joints', 'EA', 'ceil(A/144)', 'ceil(A/13.378)', 0]],
}));
items.push(one({
  key: 'irrigation-zone', csi: '32 84 00', group: 'Irrigation', type: 'count', src: ['pds'],
  assume: ['One valve per zone in a valve box; controller station wire by the run.'],
  note: 'Count each irrigation zone.', name: 'Irrigation zone valve in valve box', unit: 'EA',
  c: [['Zone valve 1 in', 'EA', 'N'], ['Valve box', 'EA', 'N'], ['Waterproof wire connectors', 'EA', 'N*2']],
}));
items.push(twin({
  key: 'pavers', csi: '32 14 13', group: 'Paving', type: 'area', src: ['icpi', 'geometry'],
  assume: ['Concrete pavers 5% waste.', 'Aggregate base 6 in compacted for a patio or walk (ICPI Tech Spec 2 gives the base by use and soil): CY = A x 6 / 12 / 27, 15% for compaction.', 'Bedding sand 1 in: CY = A / 12 / 27.', 'Edge restraint on the whole outline P.', 'Joint sand: one 50 lb bag per 50 SF (a starting figure).'],
  note: 'Measure the paved area.',
  name: ['Concrete pavers on 6 in base and 1 in sand', 'Concrete pavers on 150 mm base and 25 mm sand'], unit: ['SF', 'm²'],
  c: [['Concrete pavers', ['SF', 'm²'], 'A', 'A', 500], ['Aggregate base 6 in', ['CY', 'm³'], 'A*6/12/27', 'A*0.1524', 1500], ['Bedding sand 1 in', ['CY', 'm³'], 'A/12/27', 'A*0.0254', 1000], ['Edge restraint', ['LF', 'm'], 'P', 'P', 500], ['Joint sand, 50 lb bags', 'bag', 'ceil(A/50)', 'ceil(A/4.6452)', 0]],
}));

export default pack({
  id: 'trade.landscape', name: 'Landscape', trade: 'Landscape',
  description: 'Sod on topsoil, seed with straw, planting beds with soil, fabric and mulch, metal edging, trees and shrubs, spray irrigation zones and valves, concrete pavers on base and sand. Assemblies only: set your own rates.',
  csi: ['32 14 13', '32 84 00', '32 92 19', '32 92 23', '32 93 00', '32 93 33', '32 93 43', '32 94 13'],
  items,
});
