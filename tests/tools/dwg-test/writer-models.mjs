/* SPDX-License-Identifier: Apache-2.0 */
/**
 * writer-models.mjs — builder W's test drawings, as library models (docs/DWG-LIB-SPEC.md):
 *   kitchenSink()  every entity type the writer supports, in model space, a block with attributes, an
 *                  anonymous dimension block, a second layout with a viewport, layers in every state,
 *                  a dashed linetype, a second text style and dimension style, true colours, lineweights
 *   civil(name)    CivilCraft's three test drawings through fromCivilList (fixture needs the CivilCraft modules)
 */
export function kitchenSink() {
  const P = (x, y, z = 0) => ({ x, y, z });
  const dimBlock = {
    name: '*D1', base: P(0, 0), entities: [
      { type: 'LINE', layer: '0', start: P(0, 0), end: P(0, 6) },
      { type: 'LINE', layer: '0', start: P(10, 0), end: P(10, 6) },
      { type: 'LINE', layer: '0', start: P(0, 5), end: P(10, 5) },
      { type: 'SOLID', layer: '0', points: [P(0, 5), P(0.8, 5.2), P(0.8, 4.8), P(0.8, 4.8)] },
      { type: 'MTEXT', layer: '0', insert: P(5, 5.3), height: 0.5, attach: 8, value: '10.00', width: 0 },
      { type: 'POINT', layer: 'Defpoints', position: P(0, 0) },
    ],
  };
  const tagBlock = {
    name: 'Door tag', base: P(0, 0), entities: [
      { type: 'CIRCLE', layer: '0', center: P(0, 0), radius: 1 },
      { type: 'ATTDEF', layer: '0', insert: P(0, 0), align: P(0, 0), hAlign: 1, vAlign: 2, height: 0.6, tag: 'NUMBER', prompt: 'Door number', value: '000' },
      { type: 'ATTDEF', layer: '0', insert: P(0, -1.5), height: 0.3, tag: 'TYPE', prompt: 'Type', value: 'A', flags: 1 },
    ],
  };
  const ms = [
    { type: 'LINE', layer: 'Walls', start: P(0, 0), end: P(100, 0), lineweight: 50 },
    { type: 'LINE', layer: 'Walls', start: P(0, 0, 1), end: P(0, 50, 2.5), color: { index: 1 }, linetype: 'DASHED', ltscale: 2 },
    { type: 'CIRCLE', layer: 'Fixtures', center: P(20, 20), radius: 5, color: { rgb: 0x3366CC } },
    { type: 'ARC', layer: 'Fixtures', center: P(40, 20), radius: 6, startAngle: 0.25, endAngle: 2.75 },
    { type: 'ELLIPSE', layer: 'Fixtures', center: P(60, 20), majorAxis: P(8, 2), ratio: 0.4, startParam: 0, endParam: Math.PI * 2 },
    { type: 'POINT', layer: 'Survey', position: P(5, 5, 12.5) },
    { type: 'LWPOLYLINE', layer: 'Walls', vertices: [{ x: 0, y: 60 }, { x: 30, y: 60, bulge: 0.5 }, { x: 40, y: 70 }, { x: 0, y: 70 }], closed: true, elevation: 3 },
    { type: 'LWPOLYLINE', layer: 'Walls', vertices: [{ x: 50, y: 60, startWidth: 0.2, endWidth: 0.5 }, { x: 60, y: 62 }], constantWidth: 0 },
    { type: 'POLYLINE_2D', layer: 'Walls', vertices: [{ x: 70, y: 60 }, { x: 80, y: 60, bulge: -0.3 }, { x: 80, y: 70 }], closed: true, elevation: 1.5 },
    { type: 'POLYLINE_3D', layer: 'Survey', vertices: [P(0, 80, 1), P(10, 85, 2), P(20, 80, 1.5)] },
    { type: 'POLYLINE_PFACE', layer: 'Mesh', vertices: [P(0, 90), P(5, 90), P(5, 95, 2), P(0, 95, 2)], faces: [[1, 2, 3, 4]] },
    { type: 'POLYLINE_MESH', layer: 'Mesh', m: 2, n: 3, vertices: [P(10, 90), P(12, 90, 1), P(14, 90), P(10, 92), P(12, 92, 1), P(14, 92)] },
    { type: 'TEXT', layer: 'Text', insert: P(0, -10), height: 2.5, value: 'Plain text Ω € 12°', style: 'Standard' },
    { type: 'TEXT', layer: 'Text', insert: P(50, -10), align: P(50, -10), hAlign: 1, vAlign: 2, height: 2, rotation: 0.5, value: 'Centred', style: 'Notes' },
    { type: 'TEXT', layer: 'Text', insert: P(90, -10), align: P(90, -10), hAlign: 2, height: 2, widthFactor: 0.8, value: 'Right' },
    { type: 'MTEXT', layer: 'Text', insert: P(0, -20), height: 1.8, width: 40, attach: 1, value: 'Multi-line\\Psecond line {\\fArial|b1;bold}', style: 'Notes' },
    { type: 'INSERT', layer: 'Doors', block: 'Door tag', insert: P(30, 30), scale: P(2, 2, 2), rotation: 0.3, attribs: [
      { type: 'ATTRIB', layer: 'Doors', insert: P(30, 30), align: P(30, 30), hAlign: 1, vAlign: 2, height: 1.2, tag: 'NUMBER', value: '101' },
      { type: 'ATTRIB', layer: 'Doors', insert: P(30, 27), height: 0.6, tag: 'TYPE', value: 'B', flags: 1 },
    ] },
    { type: 'INSERT', layer: 'Doors', block: 'Door tag', insert: P(60, 30) },
    { type: 'DIMENSION', dimType: 0 | 32, layer: 'Dims', block: '*D1', style: 'Arch', defPoint: P(10, 5), textMid: P(5, 5.3), xline1: P(0, 0), xline2: P(10, 0), angle: 0, measurement: 10, text: '' },
    { type: 'SOLID', layer: 'Fill', points: [P(0, 100), P(10, 100), P(0, 110), P(10, 110)], color: { index: 3 } },
    { type: 'TRACE', layer: 'Fill', points: [P(20, 100), P(30, 100), P(20, 102), P(30, 102)] },
    { type: '3DFACE', layer: 'Mesh', points: [P(40, 100), P(50, 100, 2), P(50, 110, 2), P(40, 110)] },
    { type: 'HATCH', layer: 'Fill', solid: true, pattern: 'SOLID', loops: [{ flags: 1, polyline: { vertices: [{ x: 60, y: 100 }, { x: 70, y: 100 }, { x: 70, y: 110 }, { x: 60, y: 110 }], closed: true } }] },
    { type: 'HATCH', layer: 'Fill', solid: false, pattern: 'ANSI31', patternType: 1, angle: 0, scale: 1, lines: [{ angle: Math.PI / 4, base: P(0, 0), offset: P(-2.2450640303, 2.2450640303), dashes: [] }],
      loops: [{ flags: 1, edges: [{ type: 'line', start: P(80, 100), end: P(90, 100) }, { type: 'arc', center: P(90, 105), radius: 5, startAngle: -Math.PI / 2, endAngle: Math.PI / 2, ccw: true }, { type: 'line', start: P(90, 110), end: P(80, 110) }, { type: 'line', start: P(80, 110), end: P(80, 100) }] }] },
    { type: 'SPLINE', layer: 'Curves', degree: 3, flags: 8, knots: [0, 0, 0, 0, 1, 2, 2, 2, 2], control: [P(0, 120), P(10, 130), P(20, 115), P(30, 130), P(40, 120)] },
    { type: 'SPLINE', layer: 'Curves', degree: 3, flags: 8, fit: [P(50, 120), P(60, 128), P(70, 118), P(80, 125)] },
    { type: 'RAY', layer: 'Construction', start: P(0, 140), direction: P(1, 0.5) },
    { type: 'XLINE', layer: 'Construction', start: P(0, 145), direction: P(0, 1) },
  ];
  const ps = [
    { type: 'VIEWPORT', layer: '0', center: P(148.5, 105), width: 297, height: 210, viewCenter: P(148.5, 105), viewHeight: 210, status: 0x8060, id: 1 },
    { type: 'VIEWPORT', layer: 'Viewports', center: P(140, 110), width: 200, height: 150, viewCenter: P(50, 50), viewHeight: 160, status: 0x8060, id: 2 },
    { type: 'TEXT', layer: 'Text', insert: P(20, 15), height: 5, value: 'Sheet title' },
  ];
  return {
    version: 'AC1015',
    header: { INSUNITS: 4, MEASUREMENT: 1, LUNITS: 2, LUPREC: 2 },
    tables: {
      layers: [
        { name: '0', color: { index: 7 } },
        { name: 'Walls', color: { index: 1 }, lineweight: 35 },
        { name: 'Fixtures', color: { rgb: 0xFF8800 } },
        { name: 'Survey', color: { index: 3 }, off: true },
        { name: 'Mesh', color: { index: 8 }, frozen: true },
        { name: 'Text', color: { index: 2 }, locked: true },
        { name: 'Doors', color: { index: 4 } },
        { name: 'Dims', color: { index: 6 } },
        { name: 'Fill', color: { index: 5 } },
        { name: 'Curves', color: { index: 30 }, linetype: 'DASHED' },
        { name: 'Construction', color: { index: 9 }, plot: false },
        { name: 'Viewports', color: { index: 7 }, plot: false },
        { name: 'Defpoints', color: { index: 7 }, plot: false },
      ],
      linetypes: [{ name: 'DASHED', description: '__ __ __', patternLength: 0.75, elements: [{ length: 0.5 }, { length: -0.25 }] }],
      styles: [{ name: 'Standard', font: 'txt' }, { name: 'Notes', font: 'romans.shx', widthFactor: 0.9 }],
      dimstyles: [{ name: 'Standard' }, { name: 'Arch', vars: { DIMSCALE: 2, DIMTXT: 0.5, DIMASZ: 0.4, DIMDEC: 2 } }],
      appids: [{ name: 'CADCRAFT' }],
    },
    blocks: [
      { name: '*Model_Space', entities: ms },
      { name: '*Paper_Space', entities: ps },
      tagBlock,
      dimBlock,
    ],
    layouts: [
      { name: 'Model', tabOrder: 0 },
      { name: 'Plan sheet', tabOrder: 1, paper: { name: 'ISO_A4_(297.00_x_210.00_MM)', w: 297, h: 210, units: 1 }, limits: { min: { x: 0, y: 0 }, max: { x: 297, y: 210 } } },
    ],
  };
}
