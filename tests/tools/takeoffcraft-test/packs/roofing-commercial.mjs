/* SPDX-License-Identifier: Apache-2.0 */
// Commercial (low-slope) roofing (0.5 TK.3): single-ply and modified bitumen systems, insulation, edges, penetrations. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';

const items = [];
const ISO = 'Polyisocyanurate boards 4 x 8 ft (32 SF), 5% waste.';
const FAST = 'Insulation fasteners and plates: 8 per 4 x 8 board in the field (a starting figure: the membrane maker’s attachment pattern and the wind design, FM 1-29 / ASCE 7, set the real count; corners and perimeters take more).';
items.push(twin({
  key: 'tpo-ma', csi: '07 54 23', group: 'Single-ply', type: 'area', src: ['ibc-1507', 'nrca', 'fm-1-29', 'pds', 'geometry'],
  assume: ['Membrane: 10% for side and end laps and flashings.', ISO, FAST, 'Membrane fasteners in the laps: rows every 10 ft (10 ft sheets) with fasteners 12 in o.c. = 0.1 per SF (a starting figure; set by the attachment pattern).'],
  note: 'Measure the roof area (low slope: plan area is close enough below 2:12).',
  name: ['TPO 60 mil, mechanically attached, over polyiso', 'TPO 1.5 mm, mechanically attached, over polyiso'], unit: ['SF', 'm²'],
  c: [
    ['TPO membrane', ['SF', 'm²'], 'A', 'A', 1000],
    [['Polyiso insulation 4 x 8 ft', 'Polyiso insulation 1220 x 2440 mm'], 'board', 'ceil(A/32)', 'ceil(A/2.9768)', 500],
    ['Insulation fasteners and plates', 'EA', 'ceil(A/32)*8', 'ceil(A/2.9768)*8', 500],
    ['Membrane fasteners and seam plates', 'EA', 'ceil(A*0.1)', 'ceil(A*1.0764)', 500],
  ],
}));
items.push(twin({
  key: 'epdm-fa', csi: '07 53 23', group: 'Single-ply', type: 'area', src: ['ibc-1507', 'nrca', 'pds', 'geometry'],
  assume: ['Membrane: 10% for laps and flashings.', ISO, FAST, 'Bonding adhesive: 60 SF of finished surface per gallon, both surfaces coated (a starting figure: use the adhesive’s data sheet).', 'Seam tape on the laps: 0.1 LF per SF (10 ft sheets).'],
  note: 'Measure the roof area.',
  name: ['EPDM 60 mil, fully adhered, over polyiso', 'EPDM 1.5 mm, fully adhered, over polyiso'], unit: ['SF', 'm²'],
  c: [
    ['EPDM membrane', ['SF', 'm²'], 'A', 'A', 1000],
    [['Polyiso insulation 4 x 8 ft', 'Polyiso insulation 1220 x 2440 mm'], 'board', 'ceil(A/32)', 'ceil(A/2.9768)', 500],
    ['Insulation fasteners and plates', 'EA', 'ceil(A/32)*8', 'ceil(A/2.9768)*8', 500],
    ['Bonding adhesive', ['gal', 'L'], 'A/60', 'A/1.4726', 500],
    ['Seam tape', ['LF', 'm'], 'A*0.1', 'A*0.3281', 1000],
  ],
}));
items.push(twin({
  key: 'modbit-2ply', csi: '07 52 00', group: 'Modified bitumen', type: 'area', src: ['ibc-1507', 'nrca', 'pds', 'geometry'],
  assume: ['Base sheet and cap sheet rolls cover one square (100 SF) each after laps (a starting figure: read the roll’s net coverage).', 'Cover board 4 x 8 ft over the insulation, 5% waste.', ISO],
  note: 'Measure the roof area.',
  name: ['Modified bitumen, two-ply (base + cap), cover board, polyiso', 'Modified bitumen, two-ply (base + cap), cover board, polyiso'], unit: ['SF', 'm²'],
  c: [
    ['Base sheet rolls', 'roll', 'ceil(A/100)', 'ceil(A/9.2903)', 500],
    ['Cap sheet rolls', 'roll', 'ceil(A/100)', 'ceil(A/9.2903)', 500],
    [['Cover board 4 x 8 ft', 'Cover board 1220 x 2440 mm'], 'board', 'ceil(A/32)', 'ceil(A/2.9768)', 500],
    [['Polyiso insulation 4 x 8 ft', 'Polyiso insulation 1220 x 2440 mm'], 'board', 'ceil(A/32)', 'ceil(A/2.9768)', 500],
  ],
}));
items.push(twin({
  key: 'taper', csi: '07 22 00', group: 'Insulation', type: 'area', src: ['nrca', 'pds', 'geometry'],
  assume: ['Tapered insulation at 1/4 in per foot over the drained area: the average added thickness is set by the layout; this item counts the area to be tapered so you can price it per SF from the supplier’s layout.'],
  note: 'Measure the area that gets tapered insulation or crickets.',
  name: ['Tapered insulation and crickets (area)', 'Tapered insulation and crickets (area)'], unit: ['SF', 'm²'],
  c: [['Tapered insulation, by layout', ['SF', 'm²'], 'A', 'A', 500]],
}));
items.push(twin({
  key: 'edge-metal', csi: '07 71 00', group: 'Edges and flashing', type: 'linear', src: ['ibc-1507', 'nrca', 'geometry'],
  assume: ['Edge metal in 10 ft lengths, one splice plate per joint; wood nailer 2 x 6 continuous under it (two plies).', 'Membrane strip-in flashing 12 in wide.'],
  note: 'Measure the roof edges.',
  name: ['Roof edge: metal edge / gravel stop on wood nailer', 'Roof edge: metal edge / gravel stop on wood nailer'], unit: ['LF', 'm'],
  c: [
    [['Edge metal, 10 ft lengths', 'Edge metal, 3.05 m lengths'], 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 500],
    [['Wood nailer 2 x 6 (two plies)', 'Wood nailer 38 x 140 mm (two plies)'], ['LF', 'm'], 'L*2', 'L*2', 1000],
    ['Membrane strip-in flashing', ['SF', 'm²'], 'L*1', 'L*0.3048', 1000],
  ],
}));
items.push(twin({
  key: 'coping', csi: '07 71 00', group: 'Edges and flashing', type: 'linear', src: ['ibc-1507', 'nrca', 'geometry'],
  assume: ['Coping in 10 ft lengths with a cleat each side; parapet membrane flashing up the inside face and over the top: 3 ft of membrane per LF (a starting figure for a 2 ft parapet).'],
  note: 'Measure the parapet walls.',
  name: ['Parapet: metal coping and membrane wall flashing', 'Parapet: metal coping and membrane wall flashing'], unit: ['LF', 'm'],
  c: [
    [['Coping, 10 ft lengths', 'Coping, 3.05 m lengths'], 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 500],
    ['Coping cleat', ['LF', 'm'], 'L*2', 'L*2', 500],
    ['Membrane wall flashing', ['SF', 'm²'], 'L*3', 'L*0.9144', 1000],
  ],
}));
items.push(one({
  key: 'drain', csi: '07 71 00', group: 'Penetrations', type: 'count', src: ['ibc-1507', 'nrca'],
  assume: ['A retrofit or new roof drain with its clamping ring and a target sheet of membrane.'],
  note: 'Count each roof drain and overflow.', name: 'Roof drain flashing with target sheet', unit: 'EA',
  c: [['Drain clamping ring and strainer', 'EA', 'N'], ['Target sheet', 'EA', 'N']],
}));
items.push(one({
  key: 'pipe-pen', csi: '07 71 00', group: 'Penetrations', type: 'count', src: ['nrca'],
  assume: ['A prefabricated pipe boot per penetration, with a stainless clamp and sealant.'],
  note: 'Count each pipe or conduit through the roof.', name: 'Pipe penetration flashing (prefabricated boot)', unit: 'EA',
  c: [['Pipe boot', 'EA', 'N'], ['Stainless clamp', 'EA', 'N'], ['Sealant tube', 'EA', 'ceil(N/4)']],
}));
items.push(twin({
  key: 'curb', csi: '07 71 00', group: 'Penetrations', type: 'count', src: ['nrca', 'geometry'],
  assume: ['Equipment curb about 4 x 6 ft, 14 in high: 20 LF of perimeter x 2 ft of membrane flashing = 40 SF per curb (a starting figure).'],
  note: 'Count each rooftop unit or skylight curb.',
  name: ['Curb flashing at rooftop equipment', 'Curb flashing at rooftop equipment'], unit: ['EA', 'EA'],
  c: [['Membrane curb flashing', ['SF', 'm²'], 'N*40', 'N*3.7161', 1000], ['Inside / outside corners', 'EA', 'N*4', 'N*4', 0]],
}));
items.push(twin({
  key: 'walkpad', csi: '07 71 00', group: 'Edges and flashing', type: 'linear', src: ['nrca', 'pds'],
  assume: ['Walkway pads 30 x 30 in with 6 in gaps: one pad per 3 ft of path.'],
  note: 'Draw the service paths to equipment.',
  name: ['Walkway pads to rooftop equipment', 'Walkway pads to rooftop equipment'], unit: ['LF', 'm'],
  c: [['Walkway pads 30 x 30 in', 'EA', 'ceil(L/3)+N', 'ceil(L/0.9144)+N', 500]],
}));

export default pack({
  id: 'trade.roofing-commercial', name: 'Roofing, commercial', trade: 'Roofing (low slope)',
  description: 'TPO (mechanically attached), EPDM (fully adhered) and two-ply modified bitumen systems over polyiso, tapered areas, roof edges and copings, drains, pipe and curb flashings, walkway pads. Attachment counts are starting figures for the wind design to replace. Assemblies only: set your own rates.',
  csi: ['07 22 00', '07 52 00', '07 53 23', '07 54 23', '07 71 00'],
  items,
});
