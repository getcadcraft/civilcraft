/* SPDX-License-Identifier: Apache-2.0 */
// Finish carpentry (0.5 TK.3): base, shoe, chair rail, crown, door and window trim, closets, cabinets and tops. CC0-1.0 data.
import { pack, twin } from './common.mjs';

const items = [];
const trim = (key, name, met, waste, assume) => twin({
  key, csi: '06 22 00', group: 'Running trim', type: 'linear', src: ['awi', 'geometry'],
  assume: [assume, 'Finish nails: one pair per stud, studs 16 in o.c. (1.5 nails per LF).'],
  note: 'Measure the runs; door openings are deducts.',
  name: [name, met], unit: ['LF', 'm'],
  c: [[name.replace(/,.*$/, ''), ['LF', 'm'], 'L', 'L', waste], ['Finish nails', 'EA', 'ceil(L*1.5)', 'ceil(L*4.9213)', 1000]],
});
items.push(trim('base', 'Base molding, 3-1/4 in MDF', 'Base molding, 83 mm MDF', 1000, 'Base 10% waste for copes, miters and short pieces.'));
items.push(trim('shoe', 'Base shoe / quarter round', 'Base shoe / quarter round', 1000, 'Shoe 10% waste.'));
items.push(trim('chair-rail', 'Chair rail', 'Chair rail', 1000, 'Chair rail 10% waste.'));
items.push(trim('crown', 'Crown molding, 4-1/2 in', 'Crown molding, 114 mm', 1500, 'Crown 15% waste (compound cuts and copes).'));

items.push(twin({
  key: 'door-int', csi: '08 14 16', group: 'Doors and trim', type: 'count', src: ['awi'],
  assume: ['Prehung interior door 3 x 6-8 cased both sides: casing per side = 2 legs x 7 ft + a head of 3-1/2 ft = 17.5 LF, both sides 35 LF; 10% waste.', 'Hinges come with the prehung unit; one lockset and one door stop each.', 'Shims and finish nails are sundries.'],
  note: 'Count each interior door.',
  name: ['Interior door, prehung, cased both sides', 'Interior door, prehung, cased both sides'], unit: ['EA', 'EA'],
  c: [['Prehung interior door unit', 'EA', 'N', 'N', 0], ['Door casing', ['LF', 'm'], 'N*35', 'N*10.668', 1000], ['Lockset, passage or privacy', 'EA', 'N', 'N', 0], ['Door stop', 'EA', 'N', 'N', 0]],
}));
items.push(twin({
  key: 'window-trim', csi: '06 22 00', group: 'Doors and trim', type: 'count', src: ['awi'],
  assume: ['Window about 3 x 5 ft: casing 2 legs x 5-1/2 ft + head 3-1/2 ft = 14.5 LF; apron 3-1/2 ft; one stool each; 10% waste.'],
  note: 'Count each window that gets interior trim.',
  name: ['Window trim: casing, stool and apron', 'Window trim: casing, stool and apron'], unit: ['EA', 'EA'],
  c: [['Window casing', ['LF', 'm'], 'N*14.5', 'N*4.4196', 1000], ['Apron', ['LF', 'm'], 'N*3.5', 'N*1.0668', 1000], ['Window stool', 'EA', 'N', 'N', 0]],
}));
items.push(twin({
  key: 'closet', csi: '06 22 00', group: 'Closets and shelving', type: 'linear', src: ['awi', 'geometry'],
  assume: ['Shelf 12 in and closet rod the length of the run; supports at 4 ft at most plus one per run (a starting figure: heavy loads need closer brackets).', 'Cleat (ledger) on three walls: back + 2 ft returns = run + 2 ft per run.'],
  note: 'Draw each closet run.',
  name: ['Closet shelf and rod', 'Closet shelf and rod'], unit: ['LF', 'm'],
  c: [['Shelf board 12 in', ['LF', 'm'], 'L', 'L', 1000], ['Closet rod', ['LF', 'm'], 'L', 'L', 1000], ['Shelf and rod brackets', 'EA', 'ceil(L/4)+N', 'ceil(L/1.2192)+N', 0], ['Cleat 1 x 4', ['LF', 'm'], 'L+N*2', 'L+N*0.6096', 1000]],
}));
items.push(twin({
  key: 'cab-base', csi: '12 32 00', group: 'Cabinets and tops', type: 'linear', src: ['awi', 'geometry'],
  assume: ['Base cabinets by the linear foot along the wall; countertop 25-1/2 in deep = 2.125 SF per LF; backsplash 4 in = 0.333 SF per LF.', 'Count sink cutouts and end panels on their own.'],
  note: 'Draw the base cabinet runs along the wall.',
  name: ['Base cabinets with countertop and 4 in backsplash', 'Base cabinets with countertop and 102 mm backsplash'], unit: ['LF', 'm'],
  c: [['Base cabinets', ['LF', 'm'], 'L', 'L', 0], ['Countertop', ['SF', 'm²'], 'L*2.125', 'L*0.6477', 500], ['Backsplash', ['SF', 'm²'], 'L*0.333', 'L*0.1016', 500]],
}));
items.push(twin({
  key: 'cab-wall', csi: '12 32 00', group: 'Cabinets and tops', type: 'linear', src: ['awi', 'geometry'],
  assume: ['Wall cabinets by the linear foot; light rail and crown by the run if they are part of the design.'],
  note: 'Draw the wall cabinet runs.',
  name: ['Wall cabinets', 'Wall cabinets'], unit: ['LF', 'm'],
  c: [['Wall cabinets', ['LF', 'm'], 'L', 'L', 0]],
}));

export default pack({
  id: 'trade.finish-carpentry', name: 'Finish carpentry', trade: 'Finish carpentry',
  description: 'Base, shoe, chair rail and crown with nails; interior doors cased both sides; window casing, stool and apron; closet shelf and rod; base and wall cabinets with countertop and backsplash. Assemblies only: set your own rates.',
  csi: ['06 22 00', '08 14 16', '12 32 00'],
  items,
});
