/* SPDX-License-Identifier: Apache-2.0 */
// Painting (0.5 TK.2): walls by height, ceilings, repaints, doors and frames, trim, exterior, floors. CC0-1.0 data.
import { pack, twin } from './common.mjs';

// Spread rates are the product's (its data sheet). The starting figures below are listed in each item's `assume`:
//   SF per gallon → m² per litre: x 0.092903 / 3.785412 (350 → 8.590, 300 → 7.363, 250 → 6.136, 200 → 4.909, 400 → 9.817).
const M2L = { 400: 9.817, 350: 8.590, 300: 7.363, 250: 6.136, 200: 4.909 };
const FT = { 8: 2.44, 9: 2.74, 10: 3.05, 12: 3.66 };
const coats = (n) => (n === 1 ? 'one coat' : n === 2 ? 'two coats' : n + ' coats');
const gal = (name, per, k, rate) => [name, ['gal', 'L'], `A*${k}/${rate}`, `A*${k}/${M2L[rate]}`, 500];

const items = [];
const ASSUME = (primer, finish, n) => [
  ...(primer ? [`Primer: ${primer} SF per gallon, one coat (a starting figure: use the primer's data sheet).`] : []),
  `Finish: ${finish} SF per gallon per coat, ${coats(n)} (a starting figure: use the paint's data sheet).`,
  'No deduction for openings under 100 SF; sundries (tape, masking, caulk) are not counted.',
];
for (const ft of [8, 9, 10, 12]) {
  items.push(twin({
    key: `walls-new-${ft}`, csi: '09 91 23', group: 'Interior walls', type: 'linear', src: ['mpi', 'pds', 'geometry'],
    assume: ASSUME(300, 350, 2), note: 'Measure the wall run (one side); the item height is the painted height (A = run x height).',
    name: [`Paint walls, new gypsum board, primer + two finish coats, ${ft} ft`, `Paint walls, new gypsum board, primer + two finish coats, ${FT[ft]} m`],
    unit: ['LF', 'm'], h: [ft, FT[ft]],
    c: [gal('Primer, PVA / latex', 1, 1, 300), gal('Interior latex, finish', 1, 2, 350)],
  }));
  items.push(twin({
    key: `walls-repaint-${ft}`, csi: '09 91 23', group: 'Interior walls', type: 'linear', src: ['mpi', 'pds', 'geometry'],
    assume: ASSUME(0, 400, 2), note: 'Repaint over sound paint in a similar color: no primer. Measure the run, one side.',
    name: [`Repaint walls, two coats, ${ft} ft`, `Repaint walls, two coats, ${FT[ft]} m`], unit: ['LF', 'm'], h: [ft, FT[ft]],
    c: [gal('Interior latex, finish', 1, 2, 400)],
  }));
}
items.push(twin({
  key: 'walls-area', csi: '09 91 23', group: 'Interior walls', type: 'area', src: ['mpi', 'pds', 'geometry'],
  assume: ASSUME(300, 350, 2), note: 'For walls measured as areas (elevations).',
  name: ['Paint wall area, primer + two finish coats', 'Paint wall area, primer + two finish coats'], unit: ['SF', 'm²'],
  c: [gal('Primer, PVA / latex', 1, 1, 300), gal('Interior latex, finish', 1, 2, 350)],
}));
items.push(twin({
  key: 'ceilings', csi: '09 91 23', group: 'Ceilings', type: 'area', src: ['mpi', 'pds', 'geometry'],
  assume: ASSUME(300, 350, 2), note: 'Measure the ceiling area.',
  name: ['Paint gypsum ceilings, primer + two coats flat', 'Paint gypsum ceilings, primer + two coats flat'], unit: ['SF', 'm²'],
  c: [gal('Primer, PVA / latex', 1, 1, 300), gal('Ceiling latex, flat', 1, 2, 350)],
}));
items.push(twin({
  key: 'door-frame', csi: '09 91 23', group: 'Doors and trim', type: 'count', src: ['mpi', 'pds'],
  assume: ['About 50 SF of painted surface per door and frame, both sides (a 3 x 7 ft door is 21 SF a side, plus the frame).', 'Primer 300 SF/gal, finish 350 SF/gal per coat, two finish coats (starting figures: use the data sheets).'],
  note: 'Count each door with its frame.',
  name: ['Paint door and frame, both sides, primer + two coats', 'Paint door and frame, both sides, primer + two coats'], unit: ['EA', 'EA'],
  c: [['Primer, enamel undercoat', ['gal', 'L'], 'N*50/300', 'N*4.645/7.363', 500], ['Enamel, semi-gloss', ['gal', 'L'], 'N*50*2/350', 'N*4.645*2/8.590', 500]],
}));
items.push(twin({
  key: 'trim', csi: '09 91 23', group: 'Doors and trim', type: 'linear', src: ['mpi', 'pds', 'geometry'],
  assume: ['Trim girth about 6 in (0.5 SF per LF; metric 0.1524 m² per m).', 'Two coats of enamel at 350 SF/gal (a starting figure).'],
  note: 'Measure base, casing and other trim runs.',
  name: ['Paint trim and base, two coats enamel', 'Paint trim and base, two coats enamel'], unit: ['LF', 'm'],
  c: [['Enamel, semi-gloss', ['gal', 'L'], 'L*0.5*2/350', 'L*0.1524*2/8.590', 500]],
}));
items.push(twin({
  key: 'ext-siding', csi: '09 91 13', group: 'Exterior', type: 'area', src: ['mpi', 'pds', 'geometry'],
  assume: ['Exterior primer and finish at 250 SF/gal per coat on siding (rough and lapped surfaces take more: a starting figure).', 'Primer + two finish coats.'],
  note: 'Measure the wall area of each elevation.',
  name: ['Paint exterior siding, primer + two coats', 'Paint exterior siding, primer + two coats'], unit: ['SF', 'm²'],
  c: [gal('Exterior primer', 1, 1, 250), gal('Exterior acrylic latex', 1, 2, 250)],
}));
items.push(twin({
  key: 'ext-cmu', csi: '09 91 13', group: 'Exterior', type: 'area', src: ['mpi', 'pds', 'geometry'],
  assume: ['Block filler at 200 SF/gal, finish at 250 SF/gal per coat, two coats (starting figures: porous block takes more).'],
  note: 'Measure the masonry wall area.',
  name: ['Paint concrete block, block filler + two coats', 'Paint concrete block, block filler + two coats'], unit: ['SF', 'm²'],
  c: [gal('Block filler', 1, 1, 200), gal('Exterior acrylic latex', 1, 2, 250)],
}));
items.push(twin({
  key: 'floor-epoxy', csi: '09 67 23', group: 'Floors', type: 'area', src: ['pds', 'geometry'],
  assume: ['Two coats of epoxy at 200 SF/gal per coat (a starting figure; film thickness decides it: use the data sheet).', 'Surface preparation is labor in the item rate.'],
  note: 'Measure the floor area.',
  name: ['Epoxy floor coating, two coats', 'Epoxy floor coating, two coats'], unit: ['SF', 'm²'],
  c: [gal('Epoxy floor coating', 1, 2, 200)],
}));
items.push(twin({
  key: 'caulk', csi: '07 92 00', group: 'Doors and trim', type: 'linear', src: ['pds', 'geometry'],
  assume: ['About 25 LF of 1/4 in bead per 10.1 oz cartridge (metric 7.62 m) — a starting figure.'],
  note: 'Measure caulked joints (trim to wall, frames).',
  name: ['Caulk joints before painting, 1/4 in bead', 'Caulk joints before painting, 6 mm bead'], unit: ['LF', 'm'],
  c: [['Paintable acrylic caulk, 10.1 oz cartridges', 'EA', 'ceil(L/25)', 'ceil(L/7.62)', 1000]],
}));

export default pack({
  id: 'trade.painting', name: 'Painting', trade: 'Painting',
  description: 'Interior walls by height (new and repaint), wall areas, ceilings, doors and frames, trim, caulk, exterior siding and block, epoxy floors. Spread rates are starting figures to replace with your products’ data sheets. Assemblies only: set your own rates.',
  csi: ['07 92 00', '09 67 23', '09 91 13', '09 91 23'],
  items,
});
