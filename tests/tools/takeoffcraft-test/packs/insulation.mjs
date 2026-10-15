/* SPDX-License-Identifier: Apache-2.0 */
// Insulation (0.5 TK.3): batts in walls by height, attic blown-in, rigid board, spray foam, vapor retarder, sound batts. CC0-1.0 data.
import { pack, twin } from './common.mjs';

const items = [];
const FT = { 8: 2.44, 9: 2.74, 10: 3.05 };
const RV = 'R-value by climate zone: IRC Table N1102.1.2 (IECC R402.1.2); choose the product that meets it.';
for (const [r, stud, studM] of [['13', '2x4', '38 x 89 mm'], ['21', '2x6', '38 x 140 mm']]) {
  for (const ft of [8, 9, 10]) {
    items.push(twin({
      key: `batt-r${r}-${ft}`, csi: '07 21 16', group: 'Walls', type: 'linear', src: ['irc-n1102', 'pds', 'geometry'],
      assume: [RV, 'Batts on the gross wall area (A = run x height), no deduction for studs and plates (they offset the cutting waste); 5% waste.', 'Packages by the coverage printed on the bag: change the SF per package (40 here) to yours.'],
      note: 'Draw exterior wall runs; the item height is the wall height. Leave openings as deducts.',
      name: [`Wall batts R-${r}, ${stud} at 16 in o.c., ${ft} ft`, `Wall batts R-${r}, ${studM} at 406 mm o.c., ${FT[ft]} m`], unit: ['LF', 'm'], h: [ft, FT[ft]],
      c: [['Batt insulation', ['SF', 'm²'], 'A', 'A', 500], ['Batt packages', 'EA', 'ceil(A/40)', 'ceil(A/3.7161)', 500]],
    }));
  }
}
items.push(twin({
  key: 'blown-r49', csi: '07 21 26', group: 'Attics', type: 'area', src: ['irc-n1102', 'pds', 'geometry'],
  assume: [RV, 'Loose-fill cellulose at about R-3.7 per inch: R-49 is about 13.25 in settled (use the bag chart’s thickness for your product).', 'Bags: about 1 per 40 SF at R-49 (a starting figure: read the bag chart for "bags per 1,000 SF").', 'Attic rulers: one per 300 SF.', 'Baffles at each rafter bay along the eaves are counted as their own run.'],
  note: 'Measure the attic floor area.',
  name: ['Blown-in attic insulation R-49', 'Blown-in attic insulation R-49 (RSI-8.6)'], unit: ['SF', 'm²'],
  c: [['Loose-fill insulation bags', 'bag', 'ceil(A/40)', 'ceil(A/3.7161)', 500], ['Attic rulers', 'EA', 'ceil(A/300)', 'ceil(A/27.871)', 0]],
}));
items.push(twin({
  key: 'baffles', csi: '07 21 26', group: 'Attics', type: 'linear', src: ['irc-r806', 'geometry'],
  assume: ['One baffle per rafter bay, rafters 24 in o.c.: 0.5 per LF of eave.'],
  note: 'Measure along the eaves.',
  name: ['Rafter vent baffles at eaves, rafters 24 in o.c.', 'Rafter vent baffles at eaves, rafters 610 mm o.c.'], unit: ['LF', 'm'],
  c: [['Vent baffles', 'EA', 'ceil(L/2)+N', 'ceil(L/0.6096)+N', 500]],
}));
for (const [inch, mm] of [[1, 25], [2, 51]]) {
  items.push(twin({
    key: `board-${inch}`, csi: '07 21 13', group: 'Board', type: 'area', src: ['irc-n1102', 'pds', 'geometry'],
    assume: [RV, 'Boards 4 x 8 ft (32 SF), 5% waste.', 'Cap fasteners about 1 per 2 SF where the board is mechanically fastened (a starting figure).'],
    note: 'Measure the insulated wall or foundation area.',
    name: [`Rigid foam board ${inch} in, 4 x 8 ft`, `Rigid foam board ${mm} mm, 1220 x 2440 mm`], unit: ['SF', 'm²'],
    c: [[[`Foam board ${inch} in, 4 x 8 ft`, `Foam board ${mm} mm, 1220 x 2440 mm`], 'board', 'ceil(A/32)', 'ceil(A/2.9768)', 500], ['Cap fasteners', 'EA', 'ceil(A/2)', 'ceil(A/0.1858)', 500]],
  }));
}
items.push(twin({
  key: 'spf-cc-2', csi: '07 21 19', group: 'Spray foam', type: 'area', src: ['irc-n1102', 'pds', 'geometry'],
  assume: ['Closed-cell spray foam 2 in: board feet = area x thickness in inches (metric: m³ = m² x 0.0508).', 'Yield per set is the maker’s (it drops with temperature): add your own allowance as waste.'],
  note: 'Measure the sprayed area.',
  name: ['Closed-cell spray foam, 2 in', 'Closed-cell spray foam, 51 mm'], unit: ['SF', 'm²'],
  c: [['Spray foam', ['BF', 'm³'], 'A*2', 'A*0.0508', 1000]],
}));
items.push(twin({
  key: 'vapor-poly', csi: '07 26 00', group: 'Vapor retarders', type: 'area', src: ['irc-n1102', 'pds', 'geometry'],
  assume: ['6-mil polyethylene where the climate zone calls for a Class I vapor retarder (IRC R702.7); 10% for laps; acoustical sealant at the laps: one tube per 100 SF (a starting figure).'],
  note: 'Measure the wall or ceiling area that gets the retarder.',
  name: ['Polyethylene vapor retarder 6 mil', 'Polyethylene vapor retarder 0.15 mm'], unit: ['SF', 'm²'],
  c: [['Polyethylene 6 mil', ['SF', 'm²'], 'A', 'A', 1000], ['Acoustical sealant tubes', 'EA', 'ceil(A/100)', 'ceil(A/9.2903)', 0]],
}));
for (const ft of [8, 9, 10]) {
  items.push(twin({
    key: `sound-${ft}`, csi: '07 21 16', group: 'Walls', type: 'linear', src: ['pds', 'geometry'],
    assume: ['Sound attenuation batts 3-1/2 in in one side of the cavity, the gross partition area, 5% waste.'],
    note: 'Draw the partition runs; the item height is the wall height.',
    name: [`Sound attenuation batts in partitions, 3-1/2 in, ${ft} ft`, `Sound attenuation batts in partitions, 89 mm, ${FT[ft]} m`], unit: ['LF', 'm'], h: [ft, FT[ft]],
    c: [['Sound attenuation batts', ['SF', 'm²'], 'A', 'A', 500]],
  }));
}

export default pack({
  id: 'trade.insulation', name: 'Insulation', trade: 'Insulation',
  description: 'Wall batts by height (R-13, R-21), blown-in attic R-49 with baffles and rulers, rigid foam board, closed-cell spray foam by board feet, polyethylene vapor retarder and sound batts. R-values follow your climate zone. Assemblies only: set your own rates.',
  csi: ['07 21 13', '07 21 16', '07 21 19', '07 21 26', '07 26 00'],
  items,
});
