/* SPDX-License-Identifier: Apache-2.0 */
// Decking (0.5 TK.3): deck surface on joists, ledger, footings and posts, guards, stairs. CC0-1.0 data.
import { pack, twin } from './common.mjs';

const items = [];
// Board coverage: a 5-1/2 in board with a 1/8 in gap covers 5-5/8 in, so 12 / 5.625 = 2.133 LF of board per SF (7.0 m per m²).
// Joists at 16 in o.c.: 0.75 LF of joist per SF (2.4606 m per m²); at 12 in o.c.: 1 LF per SF (3.2808 m per m²).
// Screws: 2 per board at each joist: 2.133 x 0.75 x 2 = 3.2 per SF (16 in o.c.), 2.133 x 1 x 2 = 4.267 per SF (12 in o.c.).
for (const [k, label, labelM, js, jsM, joist, joistM, screws, screwsM] of [
  ['wood-16', '5/4 x 6 wood decking, joists 2x8 at 16 in o.c.', '25 x 140 mm wood decking, joists 38 x 184 mm at 406 mm o.c.', 16, 406, 0.75, 2.4606, 3.2, 34.4445],
  ['composite-12', 'composite decking, joists 2x8 at 12 in o.c.', 'composite decking, joists 38 x 184 mm at 305 mm o.c.', 12, 305, 1, 3.2808, 4.2667, 45.9264],
]) {
  items.push(twin({
    key: 'deck-' + k, csi: '06 10 00', group: 'Deck surface', type: 'area', src: ['irc-r507', 'awc-dca6', 'geometry'],
    assume: ['Boards 5-1/2 in wide with 1/8 in gaps: 2.133 LF per SF, 10% waste.', `Joists at ${js} in o.c. (span them from IRC Table R507.6): ${joist} LF per SF, 10% waste.`, `Two screws per board at each joist: ${screws} per SF (hidden fasteners per their maker).`, 'Joist hangers: two per joist, counted from the joist length at 12 ft average: hangers = joist LF / 12 x 2.', 'Rim joists on the outline P (doubled where the drawings say).'],
    note: 'Measure the deck area on the plan.',
    name: ['Deck surface: ' + label, 'Deck surface: ' + labelM], unit: ['SF', 'm²'],
    c: [
      ['Deck boards', ['LF', 'm'], 'A*2.1333', 'A*7.0', 1000],
      [['Joists 2x8', 'Joists 38 x 184 mm'], ['LF', 'm'], `A*${joist}`, `A*${joistM}`, 1000],
      ['Deck screws', 'EA', `ceil(A*${screws})`, `ceil(A*${screwsM})`, 500],
      ['Joist hangers', 'EA', `ceil(A*${joist}/12*2)`, `ceil(A*${joistM}/3.6576*2)`, 500],
      [['Rim joist 2x8', 'Rim joist 38 x 184 mm'], ['LF', 'm'], 'P', 'P', 1000],
    ],
  }));
}
items.push(twin({
  key: 'ledger', csi: '06 10 00', group: 'Framing', type: 'linear', src: ['irc-r507', 'awc-dca6', 'geometry'],
  assume: ['Ledger 2x8 treated; two 1/2 in lag screws or bolts every 16 in staggered = 1.5 per LF (IRC Table R507.9.1.3(1) sets the spacing by joist span: check yours).', 'Flashing over the ledger, 10% for laps.'],
  note: 'Draw the ledger along the house.',
  name: ['Ledger board with fasteners and flashing', 'Ledger board with fasteners and flashing'], unit: ['LF', 'm'],
  c: [[['Ledger 2x8, treated', 'Ledger 38 x 184 mm, treated'], ['LF', 'm'], 'L', 'L', 1000], ['Ledger lag screws or bolts 1/2 in', 'EA', 'ceil(L*1.5)', 'ceil(L*4.9213)', 0], ['Ledger flashing', ['LF', 'm'], 'L', 'L', 1000]],
}));
items.push(twin({
  key: 'beam', csi: '06 10 00', group: 'Framing', type: 'linear', src: ['irc-r507', 'awc-dca6', 'geometry'],
  assume: ['Beam of two 2x10 plies (size it from IRC Table R507.5); posts are counted with the footings.'],
  note: 'Draw each beam.',
  name: ['Beam, two 2x10 plies', 'Beam, two 38 x 235 mm plies'], unit: ['LF', 'm'],
  c: [[['2x10 treated', '38 x 235 mm treated'], ['LF', 'm'], 'L*2', 'L*2', 1000], ['Carriage bolts / structural screws', 'EA', 'ceil(L/1.333)*2', 'ceil(L/0.4064)*2', 0]],
}));
items.push(twin({
  key: 'footing-post', csi: '03 30 00', group: 'Footings and posts', type: 'count', src: ['irc-r507', 'awc-dca6', 'geometry'],
  assume: ['Footing 12 in diameter x 3 ft deep in a tube form (depth below the frost line: IRC R507.3; size from Table R507.3.1): 3.1416 x 0.5² x 3 / 27 = 0.0873 CY.', 'Post 6x6 treated, one per footing, with a post base and a post cap.'],
  note: 'Count each footing.',
  name: ['Deck footing 12 in x 3 ft with 6x6 post', 'Deck footing 305 mm x 0.91 m with 140 x 140 mm post'], unit: ['EA', 'EA'],
  c: [['Concrete', ['CY', 'm³'], 'N*3.1416*0.25*3/27', 'N*3.1416*0.1524*0.1524*0.9144', 1000], ['Tube form 12 in', ['LF', 'm'], 'N*3', 'N*0.9144', 500], ['Post 6x6 treated', 'EA', 'N', 'N', 0], ['Post base', 'EA', 'N', 'N', 0], ['Post cap', 'EA', 'N', 'N', 0]],
}));
items.push(twin({
  key: 'guard', csi: '06 10 00', group: 'Guards and stairs', type: 'linear', src: ['irc-r312', 'awc-dca6', 'geometry'],
  assume: ['Guard 36 in high (IRC R312.1.2), balusters 1-1/2 in with less than 4 in between them (R312.1.3): 5-1/4 in o.c.', 'Posts at 6 ft at most plus one per run (a starting figure: the guard system’s maker and DCA 6 set it).', 'Top and bottom rails the length of the run.'],
  note: 'Draw each guard run.',
  name: ['Guard: wood posts, rails and balusters, 36 in', 'Guard: wood posts, rails and balusters, 914 mm'], unit: ['LF', 'm'],
  c: [['Top rail', ['LF', 'm'], 'L', 'L', 1000], ['Bottom rail', ['LF', 'm'], 'L', 'L', 1000], ['Balusters', 'EA', 'ceil(L*12/5.25)', 'ceil(L/0.13335)', 500], ['Guard posts 4x4', 'EA', 'ceil(L/6)+N', 'ceil(L/1.8288)+N', 0]],
}));
items.push(twin({
  key: 'stair', csi: '06 10 00', group: 'Guards and stairs', type: 'count', src: ['irc-r507', 'awc-dca6', 'geometry'],
  assume: ['Per riser of a stair 3 ft wide: three stringers share the risers (a stringer is about 1.3 LF per riser), two treads of 5/4 x 6 x 3 ft, one riser board.', 'Graspable handrail and guards are their own runs (IRC R311.7.8).'],
  note: 'Count the risers of each stair.',
  name: ['Deck stair, 3 ft wide, per riser', 'Deck stair, 0.91 m wide, per riser'], unit: ['EA', 'EA'],
  c: [[['Stringer 2x12', 'Stringer 38 x 286 mm'], ['LF', 'm'], 'N*1.3*3', 'N*0.39624*3', 1000], ['Tread boards', ['LF', 'm'], 'N*2*3', 'N*2*0.9144', 1000], ['Riser board', ['LF', 'm'], 'N*3', 'N*0.9144', 1000]],
}));

export default pack({
  id: 'trade.decking', name: 'Decking', trade: 'Decking',
  description: 'Wood or composite deck surface with joists, screws, hangers and rim; ledger with fasteners and flashing; beams; footings with posts; guards with balusters; stairs by riser. Spans and sizes come from the IRC deck section or DCA 6. Assemblies only: set your own rates.',
  csi: ['03 30 00', '06 10 00'],
  items,
});
