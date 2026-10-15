/* SPDX-License-Identifier: Apache-2.0 */
// Concrete (0.5 TK.2): slabs, footings, walls with rebar and forms, piers, columns, flatwork. CC0-1.0 data.
import { pack, twin } from './common.mjs';

// Rebar weights (ASTM A615): #3 0.376 lb/ft (0.560 kg/m), #4 0.668 lb/ft (0.994 kg/m), #5 1.043 lb/ft (1.552 kg/m).
// CY = cubic feet / 27; metric twins work in m³ directly. Depths: item height H is the slab depth (area items).
const items = [];
const CONC_WASTE = 'Concrete: 5% for over-excavation, uneven subgrade and spillage (a starting figure).';

for (const [inch, mm] of [[4, 100], [5, 125], [6, 150]]) {
  items.push(twin({
    key: `sog-${inch}-wwr`, csi: '03 30 00', group: 'Slabs', type: 'area', src: ['irc-r506', 'aci-302', 'geometry'],
    assume: [CONC_WASTE, 'Base course: 4 in of clean graded gravel or sand (IRC R506.2.2).', 'Vapor retarder: 6-mil polyethylene (IRC R506.2.3), 10% for laps.', 'Welded wire reinforcement 6x6 W1.4xW1.4 sheets, 10% for laps.', 'Edge forms on the whole perimeter (lower the formula where the slab meets existing work).'],
    note: 'Measure the slab area; the item depth is the slab thickness.',
    name: [`Slab on grade ${inch} in, WWR, vapor retarder, 4 in base`, `Slab on grade ${mm} mm, welded wire mesh, vapor retarder, 100 mm base`],
    unit: ['SF', 'm²'], h: [inch / 12, mm / 1000],
    c: [
      ['Concrete', ['CY', 'm³'], 'A*H/27', 'A*H', 500],
      ['Base course gravel 4 in', ['CY', 'm³'], 'A*(4/12)/27', 'A*0.1016', 1000],
      ['Vapor retarder 6 mil', ['SF', 'm²'], 'A', 'A', 1000],
      ['Welded wire reinforcement 6x6 W1.4xW1.4', ['SF', 'm²'], 'A', 'A', 1000],
      ['Edge forms', ['LF', 'm'], 'P', 'P', 500],
    ],
  }));
}
items.push(twin({
  key: 'sog-5-rebar', csi: '03 30 00', group: 'Slabs', type: 'area', src: ['irc-r506', 'aci-302', 'astm-a615', 'geometry'],
  assume: [CONC_WASTE, 'Rebar #4 at 18 in o.c. each way: 2 / 1.5 = 1.333 LF per SF (metric #13 at 457 mm: 4.374 m per m²), 10% for laps.', 'Chairs: one per 9 SF (bars supported about 3 ft each way).', 'Vapor retarder 6-mil (IRC R506.2.3), 10% for laps; base 4 in.'],
  note: 'Measure the slab area; the item depth is the slab thickness.',
  name: ['Slab on grade 5 in, #4 at 18 in each way, vapor retarder, 4 in base', 'Slab on grade 125 mm, #13 bars at 457 mm each way, vapor retarder, 100 mm base'],
  unit: ['SF', 'm²'], h: [5 / 12, 0.125],
  c: [
    ['Concrete', ['CY', 'm³'], 'A*H/27', 'A*H', 500],
    ['Base course gravel 4 in', ['CY', 'm³'], 'A*(4/12)/27', 'A*0.1016', 1000],
    ['Vapor retarder 6 mil', ['SF', 'm²'], 'A', 'A', 1000],
    [['Rebar #4', 'Rebar #13'], ['LF', 'm'], 'A*2/1.5', 'A*2/0.4572', 1000],
    [['Rebar #4 (weight)', 'Rebar #13 (weight)'], ['lb', 'kg'], 'A*2/1.5*0.668', 'A*2/0.4572*0.994', 1000],
    ['Bar chairs', 'EA', 'ceil(A/9)', 'ceil(A/0.8361)', 500],
    ['Edge forms', ['LF', 'm'], 'P', 'P', 500],
  ],
}));

for (const [w, d, wm, dm] of [[16, 8, 406, 203], [20, 10, 508, 254], [24, 12, 610, 305]]) {
  const cf = (w / 12) * (d / 12);
  const m2 = (wm / 1000) * (dm / 1000);
  items.push(twin({
    key: `ftg-${w}x${d}`, csi: '03 30 00', group: 'Footings', type: 'linear', src: ['irc-r403', 'aci-318', 'aci-347', 'astm-a615', 'geometry'],
    assume: [CONC_WASTE, 'Two #4 bars continuous (size the footing and its steel from IRC R403.1 or the drawings), 10% for laps.', 'Side forms both sides, full depth.'],
    note: 'Measure the footing centerline.',
    name: [`Continuous footing ${w} x ${d} in, 2 #4 continuous`, `Continuous footing ${wm} x ${dm} mm, 2 #13 continuous`], unit: ['LF', 'm'],
    c: [
      ['Concrete', ['CY', 'm³'], `L*${+cf.toFixed(6)}/27`, `L*${+m2.toFixed(6)}`, 500],
      ['Footing forms (both sides)', ['SF', 'm²'], `L*2*${+(d / 12).toFixed(6)}`, `L*2*${dm / 1000}`, 500],
      [['Rebar #4', 'Rebar #13'], ['LF', 'm'], 'L*2', 'L*2', 1000],
      [['Rebar #4 (weight)', 'Rebar #13 (weight)'], ['lb', 'kg'], 'L*2*0.668', 'L*2*0.994', 1000],
    ],
  }));
}

for (const [t, tm] of [[8, 203], [10, 254]]) {
  for (const [ft, m] of [[4, 1.22], [8, 2.44]]) {
    items.push(twin({
      key: `wall-${t}-${ft}`, csi: '03 30 00', group: 'Walls', type: 'linear', src: ['irc-r404', 'aci-318', 'aci-347', 'astm-a615', 'geometry'],
      assume: [CONC_WASTE, 'Forms both faces, full height (SFCA = 2 x wall area).', 'Rebar #4 verticals at 48 in o.c. and horizontals at 24 in o.c. (a starting layout: take the steel from IRC R404.1 tables or the drawings), 10% for laps.'],
      note: 'Measure the wall centerline; the item height is the wall height.',
      name: [`Foundation wall ${t} in, ${ft} ft high, #4 at 48 in vert. / 24 in horiz.`, `Foundation wall ${tm} mm, ${m} m high, #13 at 1219 mm vert. / 610 mm horiz.`],
      unit: ['LF', 'm'], h: [ft, m],
      c: [
        ['Concrete', ['CY', 'm³'], `A*${+(t / 12).toFixed(6)}/27`, `A*${tm / 1000}`, 500],
        ['Wall forms (both faces)', ['SF', 'm²'], 'A*2', 'A*2', 500],
        [['Rebar #4 verticals', 'Rebar #13 verticals'], ['LF', 'm'], '(ceil(L/4)+N)*H', '(ceil(L/1.2192)+N)*H', 1000],
        [['Rebar #4 horizontals', 'Rebar #13 horizontals'], ['LF', 'm'], 'L*ceil(H/2)', 'L*ceil(H/0.6096)', 1000],
      ],
    }));
  }
}

items.push(twin({
  key: 'pad-24', csi: '03 30 00', group: 'Footings', type: 'count', src: ['irc-r403', 'astm-a615', 'geometry'],
  assume: [CONC_WASTE, 'Three #4 bars each way, 20 in long (6 bars, 10 LF per footing).'],
  note: 'Count each pad footing.',
  name: ['Pad footing 24 x 24 x 12 in, 3 #4 each way', 'Pad footing 610 x 610 x 305 mm, 3 #13 each way'], unit: ['EA', 'EA'],
  c: [
    ['Concrete', ['CY', 'm³'], 'N*2*2*1/27', 'N*0.6096*0.6096*0.3048', 500],
    [['Rebar #4', 'Rebar #13'], ['LF', 'm'], 'N*10', 'N*3.048', 1000],
  ],
}));
items.push(twin({
  key: 'pier-12', csi: '03 30 00', group: 'Footings', type: 'count', src: ['irc-r403', 'aci-347', 'geometry'],
  assume: [CONC_WASTE, 'Round pier 12 in diameter, 4 ft deep, in a fiber tube form; volume = 3.1416 x 0.5² x 4 = 3.14 CF.'],
  note: 'Count each pier.',
  name: ['Round pier 12 in x 4 ft, tube form', 'Round pier 305 mm x 1.22 m, tube form'], unit: ['EA', 'EA'],
  c: [['Concrete', ['CY', 'm³'], 'N*3.1416*0.25*4/27', 'N*3.1416*0.1524*0.1524*1.2192', 500], ['Tube form 12 in', ['LF', 'm'], 'N*4', 'N*1.2192', 500]],
}));
items.push(twin({
  key: 'col-12', csi: '03 30 00', group: 'Columns', type: 'count', src: ['aci-318', 'aci-347', 'astm-a615', 'geometry'],
  assume: [CONC_WASTE, 'Column 12 x 12 in, 10 ft high (change 10 for your height); forms on four faces.', 'Four #5 verticals, 10 ft each; ties are per the drawings.'],
  note: 'Count each column.',
  name: ['Concrete column 12 x 12 in, 10 ft, 4 #5 verticals', 'Concrete column 305 x 305 mm, 3.05 m, 4 #16 verticals'], unit: ['EA', 'EA'],
  c: [
    ['Concrete', ['CY', 'm³'], 'N*1*1*10/27', 'N*0.3048*0.3048*3.048', 500],
    ['Column forms (four faces)', ['SF', 'm²'], 'N*4*1*10', 'N*4*0.3048*3.048', 500],
    [['Rebar #5 (weight)', 'Rebar #16 (weight)'], ['lb', 'kg'], 'N*4*10*1.043', 'N*4*3.048*1.552', 1000],
  ],
}));
items.push(twin({
  key: 'flatwork-4', csi: '32 13 13', group: 'Flatwork', type: 'area', src: ['aci-302', 'geometry'],
  assume: [CONC_WASTE, 'Base 4 in.', 'Saw-cut or tooled control joints: 0.2 LF per SF (a 5 ft wide walk jointed every 5 ft, plus none along the length).', 'Edge forms on the whole perimeter.'],
  note: 'Measure walks and pads.',
  name: ['Exterior flatwork 4 in, broom finish, control joints', 'Exterior flatwork 100 mm, broom finish, control joints'], unit: ['SF', 'm²'], h: [4 / 12, 0.1],
  c: [
    ['Concrete', ['CY', 'm³'], 'A*H/27', 'A*H', 500],
    ['Base course gravel 4 in', ['CY', 'm³'], 'A*(4/12)/27', 'A*0.1016', 1000],
    ['Control joints', ['LF', 'm'], 'A*0.2', 'A*0.6562', 0],
    ['Edge forms', ['LF', 'm'], 'P', 'P', 500],
  ],
}));
items.push(twin({
  key: 'cure', csi: '03 39 00', group: 'Finishing and curing', type: 'area', src: ['aci-302', 'pds'],
  assume: ['Curing compound at 200 SF per gallon (a starting figure: use the product data sheet).'],
  note: 'Measure the slab area to be cured.',
  name: ['Curing compound, one coat', 'Curing compound, one coat'], unit: ['SF', 'm²'],
  c: [['Curing compound', ['gal', 'L'], 'A/200', 'A/4.909', 500]],
}));

export default pack({
  id: 'trade.concrete', name: 'Concrete', trade: 'Concrete',
  description: 'Slabs on grade (with mesh or rebar, vapor retarder and base), continuous footings, foundation walls with rebar and forms, pad footings, piers, columns, flatwork and curing. Assemblies only: set your own rates.',
  csi: ['03 30 00', '03 39 00', '32 13 13'],
  items,
});
