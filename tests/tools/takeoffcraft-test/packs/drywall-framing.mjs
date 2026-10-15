/* SPDX-License-Identifier: Apache-2.0 */
// Drywall and framing (0.5 TK.2). Walls by height and layers, ceilings, corner bead, wood framing. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';

// The numbers every gypsum assembly below shares (each one listed in the items' `assume`):
//   4 x 8 ft sheets = 32 SF (metric twin: 1220 x 2440 mm = 2.9768 m², the same sheet).
//   Wall screws 16 in o.c. on studs 16 in o.c.: 4 studs x 7 screws = 28 per 4 x 8 sheet = 0.875 per SF (9.42 per m²).
//   Ceiling screws 12 in o.c., sheets across joists 16 in o.c.: 7 crossings x 5 screws = 35 per sheet = 1.094 per SF (11.76 per m²).
//   Joints: one 8 ft long edge + one 4 ft end per sheet = 12 LF per 32 SF = 0.375 LF/SF of tape (1.23 m/m²).
//   Joint compound: 0.01 gal per SF of finished board (0.407 L/m²) — a starting figure; use your product's data sheet.
const FT = { 8: 2.44, 9: 2.74, 10: 3.05, 12: 3.66 };
const BOARD = { '1/2': ['1/2 in', '12.7 mm'], '5/8X': ['5/8 in type X', '15.9 mm type X'] };
const SHEET = (b) => [`Gypsum board ${BOARD[b][0]}, 4 x 8 ft sheets`, `Gypsum board ${BOARD[b][1]}, 1220 x 2440 mm sheets`];
const BOARD_ASSUME = [
  'Sheets: 4 x 8 ft (32 SF); the metric twin uses 1220 x 2440 mm (2.98 m²). Change the 32 / 2.98 for other sheet sizes.',
  'Screws: 0.875 per SF of board on walls (28 per sheet: studs 16 in o.c., screws 16 in o.c.).',
  'Tape: 0.375 LF per SF of finished board (12 LF of joint per 4 x 8 sheet).',
  'Joint compound: 0.01 gal per SF of finished board — a starting figure; take the coverage from your product data sheet.',
  'No deduction for openings: draw door and window openings as deducts on the run, or lower the waste.',
];

/** A partition: framing (steel or wood) + gypsum board `layers` per side on `sides` sides, H = wall height. */
function partition({ key, frame, board, layers, sides, ft }) {
  const m = FT[ft];
  const faces = layers * sides;             // board layers in all
  const tapeFaces = sides;                  // only the face layer is taped and finished
  const lay = layers === 1 ? 'one layer' : 'two layers';
  const side = sides === 2 ? 'each side' : 'one side';
  const fr = frame === 'steel' ? ['steel studs 3-5/8 in at 16 in o.c.', 'steel studs 92 mm at 406 mm o.c.'] : ['wood studs 2x4 at 16 in o.c.', 'wood studs 38 x 89 mm at 406 mm o.c.'];
  const c = [];
  if (frame === 'steel') {
    c.push([['Steel track 3-5/8 in (top and bottom)', 'Steel track 92 mm (top and bottom)'], ['LF', 'm'], 'L*2', 'L*2', 500]);
    c.push([['Steel studs 3-5/8 in, cut to wall height', 'Steel studs 92 mm, cut to wall height'], 'EA', 'ceil(L*0.75)+N', 'ceil(L/0.4064)+N', 500]);
  } else if (frame === 'wood') {
    c.push([['Wood plates 2x4 (one bottom, two top)', 'Wood plates 38 x 89 mm (one bottom, two top)'], ['LF', 'm'], 'L*3', 'L*3', 1000]);
    c.push([['Wood studs 2x4, wall height', 'Wood studs 38 x 89 mm, wall height'], 'EA', 'ceil(L*0.75)+N', 'ceil(L/0.4064)+N', 1000]);
  }
  c.push([SHEET(board), 'sheet', `ceil(A*${faces}/32)`, `ceil(A*${faces}/2.9768)`, 1000]);
  c.push([['Drywall screws', 'Drywall screws'], 'EA', `ceil(A*${faces}*0.875)`, `ceil(A*${faces}*9.42)`, 1000]);
  c.push([['Joint tape', 'Joint tape'], ['LF', 'm'], `A*${tapeFaces}*0.375`, `A*${tapeFaces}*1.2303`, 1000]);
  c.push([['Joint compound, ready-mixed', 'Joint compound, ready-mixed'], ['gal', 'L'], `A*${tapeFaces}*0.01`, `A*${tapeFaces}*0.4074`, 1000]);
  const bName = BOARD[board];
  const what = frame ? [`, ${fr[0]}`, `, ${fr[1]}`] : ['', ''];
  return twin({
    key, csi: frame === 'wood' ? '06 11 00' : '09 21 16', group: frame ? 'Partitions' : 'Wall linings', type: 'linear',
    src: ['ga-216', 'irc-r702', ...(frame === 'steel' ? ['astm-c754'] : frame === 'wood' ? ['irc-r602'] : []), 'geometry'],
    assume: [
      ...(frame ? ['Studs at 16 in o.c.: ceil(0.75 x length) + one end stud per run; no extra studs for corners, intersections or openings (count those as rough openings).'] : []),
      ...(frame === 'wood' ? ['Plates: one bottom plate and a double top plate (IRC R602.3.2).'] : []),
      ...BOARD_ASSUME,
      ...(layers === 2 ? ['Two layers: both layers screwed at the face-layer spacing; only the face layer is taped and finished.'] : []),
    ],
    note: 'Measure the wall run (linear); the item height is the wall height (A = run x height, one side). Set your rates: none are included.',
    name: [`Gypsum ${frame ? 'partition' : 'lining'}, ${bName[0]}, ${lay} ${side}${what[0]}, ${ft} ft high`, `Gypsum ${frame ? 'partition' : 'lining'}, ${bName[1]}, ${lay} ${side}${what[1]}, ${m} m high`],
    unit: ['LF', 'm'], h: [ft, m], c,
  });
}

const items = [];
for (const ft of [8, 9, 10, 12]) {
  items.push(partition({ key: `part-steel-12-1x1-${ft}`, frame: 'steel', board: '1/2', layers: 1, sides: 2, ft }));
  items.push(partition({ key: `part-steel-58x-1x1-${ft}`, frame: 'steel', board: '5/8X', layers: 1, sides: 2, ft }));
  items.push(partition({ key: `part-steel-58x-2x2-${ft}`, frame: 'steel', board: '5/8X', layers: 2, sides: 2, ft }));
  items.push(partition({ key: `part-wood-12-1x1-${ft}`, frame: 'wood', board: '1/2', layers: 1, sides: 2, ft }));
  items.push(partition({ key: `lining-12-1-${ft}`, frame: null, board: '1/2', layers: 1, sides: 1, ft }));
}

for (const b of ['1/2', '5/8X']) {
  items.push(twin({
    key: 'ceiling-' + (b === '1/2' ? '12' : '58x'), csi: '09 21 16', group: 'Ceilings', type: 'area',
    src: ['ga-216', 'irc-r702', 'geometry'],
    assume: [
      'Sheets: 4 x 8 ft (32 SF), metric 1220 x 2440 mm (2.98 m²).',
      'Screws: 1.094 per SF (35 per sheet: sheets across framing 16 in o.c., screws 12 in o.c. on ceilings, IRC Table R702.3.5).',
      'Tape: 0.375 LF per SF; joint compound 0.01 gal per SF (a starting figure: use your product data sheet).',
      'Framing or furring is not included: add it as its own item.',
    ],
    note: 'Measure the ceiling area. Set your rates: none are included.',
    name: [`Gypsum board ceiling, ${BOARD[b][0]}, on framing 16 in o.c.`, `Gypsum board ceiling, ${BOARD[b][1]}, on framing 406 mm o.c.`],
    unit: ['SF', 'm²'],
    c: [
      [SHEET(b), 'sheet', 'ceil(A/32)', 'ceil(A/2.9768)', 1000],
      ['Drywall screws', 'EA', 'ceil(A*1.094)', 'ceil(A*11.776)', 1000],
      ['Joint tape', ['LF', 'm'], 'A*0.375', 'A*1.2303', 1000],
      ['Joint compound, ready-mixed', ['gal', 'L'], 'A*0.01', 'A*0.4074', 1000],
    ],
  }));
}

items.push(twin({
  key: 'corner-bead', csi: '09 21 16', group: 'Trim and accessories', type: 'linear', src: ['ga-216', 'geometry'],
  assume: ['Bead in 8 ft lengths (metric 2.44 m): one piece per started length on each run.', 'Finishing the bead is in the walls’ compound allowance.'],
  note: 'Measure each outside corner as a run, floor to ceiling.',
  name: ['Outside corner bead, metal, 8 ft lengths', 'Outside corner bead, metal, 2.44 m lengths'], unit: ['LF', 'm'],
  c: [['Corner bead', 'EA', 'ceil(L/8)+N', 'ceil(L/2.44)+N', 500]],
}));
items.push(twin({
  key: 'jbead', csi: '09 21 16', group: 'Trim and accessories', type: 'linear', src: ['ga-216', 'geometry'],
  assume: ['Trim in 10 ft lengths (metric 3.05 m).'],
  note: 'Measure where board ends against another material.',
  name: ['J-bead or L-bead trim, 10 ft lengths', 'J-bead or L-bead trim, 3.05 m lengths'], unit: ['LF', 'm'],
  c: [['J-bead / L-bead', 'EA', 'ceil(L/10)+N', 'ceil(L/3.05)+N', 500]],
}));

for (const ft of [8, 9, 10]) {
  const m = FT[ft];
  items.push(twin({
    key: `ext-wall-2x6-${ft}`, csi: '06 11 00', group: 'Wood framing', type: 'linear', src: ['irc-r602', 'irc-r703', 'geometry'],
    assume: [
      'Studs 2x6 at 16 in o.c.: ceil(0.75 x length) + one per run; corners, intersections and openings extra (rough openings).',
      'Plates: one bottom (treated where on concrete) and a double top plate (IRC R602.3.2).',
      'Sheathing 4 x 8 ft (32 SF) panels on one side; water-resistive barrier on the wall area (IRC R703.2), 10% for laps.',
    ],
    note: 'Measure the exterior wall run; the item height is the plate height. Set your rates: none are included.',
    name: [`Exterior wall, wood studs 2x6 at 16 in o.c., 7/16 in sheathing, ${ft} ft`, `Exterior wall, wood studs 38 x 140 mm at 406 mm o.c., 11 mm sheathing, ${m} m`],
    unit: ['LF', 'm'], h: [ft, m],
    c: [
      [['Bottom plate 2x6, treated', 'Bottom plate 38 x 140 mm, treated'], ['LF', 'm'], 'L', 'L', 1000],
      [['Top plates 2x6, double', 'Top plates 38 x 140 mm, double'], ['LF', 'm'], 'L*2', 'L*2', 1000],
      [['Studs 2x6, wall height', 'Studs 38 x 140 mm, wall height'], 'EA', 'ceil(L*0.75)+N', 'ceil(L/0.4064)+N', 1000],
      [['Wall sheathing 7/16 in, 4 x 8 ft', 'Wall sheathing 11 mm, 1220 x 2440 mm'], 'sheet', 'ceil(A/32)', 'ceil(A/2.9768)', 1000],
      ['Water-resistive barrier', ['SF', 'm²'], 'A', 'A', 1000],
    ],
  }));
}

items.push(one({
  key: 'rough-opening', csi: '06 11 00', group: 'Wood framing', type: 'count', src: ['irc-r602'],
  assume: ['Per opening up to 4 ft wide in a stud wall: 2 king studs, 2 jack studs, a two-ply header (size it from IRC Table R602.7(1) or the drawings), 2 cripples and a sill for windows.'],
  note: 'Count each door or window opening.',
  name: 'Rough opening framing, opening up to 4 ft (1.2 m)', unit: 'EA',
  c: [['King studs', 'EA', 'N*2'], ['Jack studs', 'EA', 'N*2'], ['Header plies, opening width + 3 in', 'EA', 'N*2'], ['Cripple studs', 'EA', 'N*2']],
}));

export default pack({
  id: 'trade.drywall-framing', name: 'Drywall and framing', trade: 'Drywall and framing',
  description: 'Gypsum board partitions by height (8, 9, 10, 12 ft) and layers on steel or wood studs, wall linings, ceilings, corner bead and trim, exterior 2x6 walls and rough openings. Assemblies only: set your own rates.',
  csi: ['06 11 00', '09 21 16', '09 22 16'],
  items,
});
