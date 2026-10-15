/* SPDX-License-Identifier: Apache-2.0 */
// Siding (0.5 TK.3): vinyl and fiber-cement lap siding, water-resistive barrier, trim, soffit and fascia. CC0-1.0 data.
import { pack, twin } from './common.mjs';

const items = [];
const WRB = 'Water-resistive barrier over the whole wall (IRC R703.2), 10% for laps; cap fasteners about 1 per 2 SF (a starting figure: use the barrier maker’s schedule).';
items.push(twin({
  key: 'vinyl-d4', csi: '07 46 33', group: 'Lap siding', type: 'area', src: ['vsi', 'irc-r703', 'geometry'],
  assume: ['Panels by the square (100 SF), 10% waste; double 4 in panels, 8 in per course.', 'Nails 16 in o.c. along each course (VSI manual): 1.5 courses per ft x 0.75 nails per ft = 1.125 per SF.', WRB],
  note: 'Measure each wall elevation; cut out openings over 4 SF (or lower the waste).',
  name: ['Vinyl siding, double 4 in, on water-resistive barrier', 'Vinyl siding, double 102 mm, on water-resistive barrier'], unit: ['SF', 'm²'],
  c: [
    ['Vinyl siding', 'SQ', 'A/100', 'A/9.2903', 1000],
    ['Siding nails', 'EA', 'ceil(A*1.125)', 'ceil(A*12.1094)', 500],
    ['Water-resistive barrier', ['SF', 'm²'], 'A', 'A', 1000],
    ['Cap fasteners', 'EA', 'ceil(A/2)', 'ceil(A/0.1858)', 500],
  ],
}));
items.push(twin({
  key: 'fc-lap', csi: '07 46 46', group: 'Lap siding', type: 'area', src: ['irc-r703', 'pds', 'geometry'],
  assume: ['Planks 8-1/4 in x 12 ft at 7 in exposure: 12 / 7 = 1.714 LF per SF, so one 12 ft plank per 7 SF; 10% waste.', 'One blind nail per stud crossing, studs 16 in o.c.: 1.714 x 0.75 = 1.29 per SF (the maker’s guide and IRC Table R703.3(1) give the fastening).', WRB],
  note: 'Measure each wall elevation.',
  name: ['Fiber-cement lap siding 8-1/4 in, 7 in exposure', 'Fiber-cement lap siding 210 mm, 178 mm exposure'], unit: ['SF', 'm²'],
  c: [
    [['Lap planks 8-1/4 in x 12 ft', 'Lap planks 210 mm x 3.66 m'], 'EA', 'ceil(A/7)', 'ceil(A/0.6503)', 1000],
    ['Siding nails', 'EA', 'ceil(A*1.29)', 'ceil(A*13.885)', 500],
    ['Water-resistive barrier', ['SF', 'm²'], 'A', 'A', 1000],
    ['Cap fasteners', 'EA', 'ceil(A/2)', 'ceil(A/0.1858)', 500],
  ],
}));
items.push(twin({
  key: 'jchannel', csi: '07 46 33', group: 'Trim', type: 'linear', src: ['vsi', 'geometry'],
  assume: ['J-channel in 12-1/2 ft lengths, one extra per run for laps.'],
  note: 'Measure around windows and doors and along rakes.',
  name: ['J-channel at openings and rakes', 'J-channel at openings and rakes'], unit: ['LF', 'm'],
  c: [[['J-channel, 12-1/2 ft lengths', 'J-channel, 3.81 m lengths'], 'EA', 'ceil(L/12.5)+N', 'ceil(L/3.81)+N', 500]],
}));
items.push(twin({
  key: 'corner-post', csi: '07 46 33', group: 'Trim', type: 'linear', src: ['vsi', 'geometry'],
  assume: ['Corner posts in 10 ft lengths; a corner taller than one post takes two.'],
  note: 'Draw each outside and inside corner, eave to grade.',
  name: ['Corner posts (outside and inside)', 'Corner posts (outside and inside)'], unit: ['LF', 'm'],
  c: [[['Corner post, 10 ft', 'Corner post, 3.05 m'], 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 500]],
}));
items.push(twin({
  key: 'starter', csi: '07 46 33', group: 'Trim', type: 'linear', src: ['vsi', 'geometry'],
  assume: ['Starter strip in 12 ft lengths along the bottom of the siding.'],
  note: 'Measure along the base of the siding.',
  name: ['Starter strip', 'Starter strip'], unit: ['LF', 'm'],
  c: [[['Starter strip, 12 ft', 'Starter strip, 3.66 m'], 'EA', 'ceil(L/12)+N', 'ceil(L/3.6576)+N', 500]],
}));
items.push(twin({
  key: 'soffit', csi: '07 46 33', group: 'Soffit and fascia', type: 'area', src: ['vsi', 'irc-r806', 'geometry'],
  assume: ['Vented soffit panels by area, 10% waste; check the net free area against the attic ventilation required (IRC R806).', 'F-channel or J-channel at the wall: the soffit outline P counts both edges, so half of it.'],
  note: 'Measure the soffit area as a strip along each eave.',
  name: ['Vented soffit with channel', 'Vented soffit with channel'], unit: ['SF', 'm²'],
  c: [['Vented soffit panels', ['SF', 'm²'], 'A', 'A', 1000], ['F-channel at the wall', ['LF', 'm'], 'P/2', 'P/2', 1000]],
}));
items.push(twin({
  key: 'fascia', csi: '07 46 33', group: 'Soffit and fascia', type: 'linear', src: ['vsi', 'geometry'],
  assume: ['Aluminum fascia cover 6 in in 12 ft lengths; trim nails 1 per 16 in.'],
  note: 'Measure the eaves and rakes.',
  name: ['Fascia cover, aluminum 6 in', 'Fascia cover, aluminum 152 mm'], unit: ['LF', 'm'],
  c: [[['Fascia cover, 12 ft', 'Fascia cover, 3.66 m'], 'EA', 'ceil(L/12)+N', 'ceil(L/3.6576)+N', 500], ['Trim nails', 'EA', 'ceil(L*0.75)', 'ceil(L/0.4064)', 1000]],
}));

export default pack({
  id: 'trade.siding', name: 'Siding', trade: 'Siding',
  description: 'Vinyl and fiber-cement lap siding with water-resistive barrier and fasteners, J-channel, corner posts, starter strip, vented soffit and fascia. Assemblies only: set your own rates.',
  csi: ['07 46 33', '07 46 46'],
  items,
});
