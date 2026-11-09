/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui/pcb.js — the Engines panel's descriptor for lib/pcb (0.8 XE.11). Input: one JSON object
 *   { board { name, outline [[x,y]…] mm, copper 1|2|4…, rules {…} }, netlist { parts [{ ref, footprint, value }], nets [{ name, pins ['R1:1'] }] },
 *     place { seed, iterations } | false, route { passes } | false, date }
 * Footprints come from the engine's example library (chips R0402–R1206, SOIC, DIP, headers, SOT-23, QFP …); rules are the engine's EXAMPLE rules
 * unless the input gives its own: a shop's real fab rules are data it supplies. The output files are listed by name and size, not shown.
 */
const EXAMPLE = {
  board: { name: 'led-demo', outline: [[0, 0], [30, 0], [30, 20], [0, 20]], copper: 2 },
  netlist: {
    parts: [{ ref: 'J1', footprint: 'HDR-1x2' }, { ref: 'R1', footprint: 'R0805', value: '330' }, { ref: 'D1', footprint: 'R0805', value: 'LED' }],
    nets: [{ name: 'VIN', pins: ['J1:1', 'R1:1'] }, { name: 'N1', pins: ['R1:2', 'D1:1'] }, { name: 'GND', pins: ['D1:2', 'J1:2'] }],
  },
  place: { seed: 3, iterations: 20000 }, route: {}, date: '2026-10-29T00:00:00+00:00',
};
const BAD = { board: { name: 'tight', outline: [[0, 0], [20, 0], [20, 10], [0, 10]], copper: 1, rules: { clearance: 0.3 } },
  netlist: { parts: [{ ref: 'R1', footprint: 'R0805' }, { ref: 'R2', footprint: 'NOPE' }], nets: [{ name: 'A', pins: ['R1:1', 'R2:1', 'R1:9'] }] }, place: false, route: false };

export default {
  inputLabel: 'Board and netlist (JSON)',
  examples: [
    { id: 'led', name: 'An LED board: place, route, check, write files', text: JSON.stringify(EXAMPLE, null, 1) },
    { id: 'faults', name: 'A netlist with faults (named, not hidden)', text: JSON.stringify(BAD, null, 1) },
  ],
  load: () => import('../pcb/index.js'),
  run(P, text) {
    const o = JSON.parse(text);
    if (!o || typeof o !== 'object' || !o.netlist) throw new Error('The input needs a "netlist" with parts and nets (and optionally "board", "place", "route").');
    const b0 = o.board || {};
    const board = new P.Board({ name: String(b0.name || 'board'), outline: b0.outline || [[0, 0], [50, 0], [50, 40], [0, 40]], copper: b0.copper || 2, rules: b0.rules || {} });
    const lib = P.standardLibrary(), problems = [], notes = [], tables = [];
    const imp = P.fromNetlist(board, o.netlist, lib);
    problems.push(...imp.problems);
    const sum = [['Parts placed on the board', board.parts.length], ['Nets', board.nets.size]];
    if (o.place !== false && board.parts.length) {
      const pl = P.place(board, { seed: 1, iterations: 20000, ...(o.place || {}) });
      problems.push(...pl.problems);
      sum.push(['Wire length before placement (mm)', pl.before], ['Wire length after placement (mm)', pl.after], ['Overlaps', pl.overlaps]);
    }
    let routed = null;
    if (o.route !== false && board.parts.length) {
      routed = P.route(board, o.route || {});
      problems.push(...routed.problems);
      sum.push(['Nets routed', routed.routed.length], ['Nets not routed', routed.failed.join(', ')], ['Tracks added', routed.stats.tracks], ['Vias added', routed.stats.vias]);
    }
    const d = P.drc(board);
    problems.push(...d.problems);
    tables.push({ title: 'Board', head: ['Measure', 'Value'], rows: sum });
    tables.push({ title: 'Parts', head: ['Ref', 'Footprint', 'x (mm)', 'y (mm)', 'Rotation', 'Side'], rows: board.parts.map((p) => [p.ref, p.footprint, p.x, p.y, p.rot, p.side]) });
    const byRule = new Map();
    for (const p of d.problems) { const k = p.rule || p.id; byRule.set(k, (byRule.get(k) || 0) + 1); }
    tables.push({ title: 'Design rule check', head: ['Rule', 'Findings'], rows: byRule.size ? [...byRule] : [['all rules', 0]] });
    if (board.parts.length) {
      const g = P.writeGerber(board, { date: o.date || '1970-01-01T00:00:00+00:00' }), dr = P.writeDrill(board, { date: o.date || '1970-01-01T00:00:00+00:00' });
      const files = [...Object.entries(g.files), ...Object.entries(dr.files || {})].filter(([n]) => !/^job\./.test(n) || true);
      problems.push(...(g.problems || []));
      const ipc = P.writeIpc2581(board, { date: o.date });
      problems.push(...(ipc.problems || []));
      tables.push({ title: 'Output files', head: ['File', 'Bytes'], rows: [...files.map(([n, t]) => [n, String(t).length]), ['IPC-2581 (xml)', ipc.xml.length]] });
      tables.push({ title: 'IPC-2581 content', head: ['Item', 'Count'], rows: [['Pad stacks', ipc.stats.padStacks], ['Packages', ipc.stats.packages], ['Nets', ipc.stats.nets], ['Components', ipc.stats.components]] });
    }
    notes.push('Example footprints and example fab rules; a shop supplies its own as data. The router has no push-and-shove, differential pairs or length matching; a board is checked against these rules, not against a fab house until it has said so.');
    return { tables, problems, notes };
  },
};
