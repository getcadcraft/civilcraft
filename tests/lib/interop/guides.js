/* SPDX-License-Identifier: Apache-2.0 */
/**
 * guides.js — "bring a job over": one short guide per TYPE of tool a job comes from (IND.8). Plain data, import-free; the hosts show it
 * in Help and the import dialog. Tools are described by what they are, never named (trademark rule); the file formats are the open ones
 * the tools publish. Words are English here; hosts put the same keys in their language files (`interop.guide.<id>.*`).
 *
 *   GUIDES → [{ id, tool, formats: [ext], reads: [what comes over], leaves: [what does not], steps: [text], check: [text] }]
 *   guideFor(kind) → the guide that reads a detected kind ('stream-table' | 'dexpi' | 'pcf' | 'ifc')
 */

export const GUIDES = [
  {
    id: 'process-simulator', tool: 'a process simulator or a datasheet that lists stream conditions', formats: ['csv', 'xlsx'], kind: 'stream-table',
    reads: ['stream names', 'temperature, pressure, vapour fraction', 'mass, mole and volume flow', 'composition (mole or mass fractions)', 'density, molecular weight, enthalpy where given'],
    leaves: ['the flowsheet itself (units and connections): a table has no topology', 'thermodynamic package and the simulator\'s own settings', 'anything calculated by a formula that was not saved as a value'],
    steps: [
      'In the other tool, export the stream (heat and material balance) table to CSV or Excel. One sheet, streams across or down; keep the unit in the label ("Temperature (°C)") or in a Units column.',
      'Open Bring a job over and pick the file. The reader says which way the table runs and lists each stream.',
      'Check the units line in the report: pressures marked gauge were made absolute; a column with no unit was read as °C and bar.',
      'Use the streams as reference data for a flowsheet\'s feeds, or as the stream table on a P&ID.',
    ],
    check: ['Compare two streams you know by hand: flow, temperature and the composition sum.', 'A warning that fractions do not add to 1 usually means a component column was left out of the export.'],
  },
  {
    id: 'pid-tool', tool: 'a P&ID or plant-design program that exports DEXPI', formats: ['xml'], kind: 'dexpi',
    reads: ['equipment with tags, class and nozzles', 'piping network systems and their segments, valves, reducers and other in-line components', 'instrumentation functions and loops', 'line data in the generic attributes (size, service, spec)', 'connections between items', 'positions where the file gives them'],
    leaves: ['the drawing graphics: symbols are drawn again by this tool\'s own library', 'shape catalogues and presentation (colours, line weights)', 'classes this tool has no symbol for are kept as items with their class and listed in the report'],
    steps: [
      'In the other tool, export the P&ID as DEXPI (ProteusXML). Export one drawing at a time.',
      'Open Bring a job over and pick the .xml file. The report counts equipment, lines, valves and instruments, and lists classes that had no symbol.',
      'Choose Place on the drawing. Items with positions are placed there; items without are laid out in a grid for you to move.',
      'Run the P&ID checks, then the line list: line numbers and sizes should match the source.',
    ],
    check: ['Compare the equipment list with the source\'s equipment list.', 'Open the Problems panel: connections that point nowhere are listed once.'],
  },
  {
    id: 'pipe-stress', tool: 'a pipe-stress program that reads and writes PCF', formats: ['pcf'], kind: 'pcf',
    reads: ['pipelines and their reference', 'straight pipe, elbows and bends, tees, reducers, valves, flanges and other components', 'end points with bore', 'centre and branch points', 'the component keys (SKEY) and the attributes that follow'],
    leaves: ['loads, restraints and the stress analysis itself: PCF holds geometry and components, not the analysis', 'supports are read as points but not designed'],
    steps: [
      'Export the piping model as PCF from the other tool (millimetres is simplest; other units are converted).',
      'Open Bring a job over and pick the .pcf file. The report lists each pipeline with its length and component counts.',
      'Choose Build as runs: straight pipe becomes runs in the model, fittings are laid by the model\'s own rules.',
      'To send work back, export PCF from the model\'s piping runs.',
    ],
    check: ['The report flags an elbow whose centre point is not the same distance from both ends, and pipe with no length.', 'Total pipe length per pipeline should match the source.'],
  },
  {
    id: 'isometrics', tool: 'an isometric-drawing program that reads PCF', formats: ['pcf'], kind: 'pcf',
    reads: ['what the model\'s steel pipe runs hold: pipe, elbows, tees, reducers, valves', 'each line\'s reference, spec and bore'],
    leaves: ['weld numbers, spool splits and material take-off codes the other program adds', 'drawing styles'],
    steps: [
      'In the model, choose Export piping as PCF. Pick the lines to send; each becomes a PIPELINE-REFERENCE.',
      'Open the .pcf file in the isometric program. Components arrive with their end points and bores.',
      'Set the program\'s own spec and item codes there: this tool writes geometry and the keys it knows.',
    ],
    check: ['Open the file in a text editor: every component starts at the left edge, its points are indented.', 'Run the export again after a change: the same line gives the same file.'],
  },
  {
    id: 'bim-model', tool: 'a BIM or plant-3D program that exports IFC', formats: ['ifc'], kind: 'ifc',
    reads: ['the model as IFC: piping segments and fittings, flow terminals, equipment, spaces and the rest of the building'],
    leaves: ['proprietary object data the exporter did not write into property sets'],
    steps: [
      'Export IFC 2x3 or IFC 4 from the other tool.',
      'Open Bring a job over and pick the .ifc file. The report shows the schema and counts of piping and equipment classes.',
      'Choose Open in the model viewer. Piping already in the file is read by the model; to draw P&ID or PCF from it, use the piping export there.',
    ],
    check: ['Compare element counts with the source\'s schedule.', 'Large files open in the viewer\'s own reader; this step only counts.'],
  },
];

export const guideFor = (kind) => GUIDES.filter((g) => g.kind === kind);
