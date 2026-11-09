#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Own tests for lib/chip/fmt (0.9 Track HD: HD.3, HD.7, HD.9 formats). Answers are worked by hand in the comments, checked by a second,
// independent reader in the tree (lib/pcb/gds.js for GDSII, node's zlib for DEFLATE), or are round trips (read → write → read equal).
//   node lib/chip/fmt/test/test.mjs [--big]     --big also reads the generated 1M-shape layout (testfiles/generated/chip/) when present
import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as F from '../index.js';
import * as PG from '../../../pcb/gds.js';
import { crc32 } from '../oasis.js';
import { inflateRawSized, deflateRaw } from '../zlib.js';
import * as PM from '../panels-model.js';

const { liberty: Lib, lef: Lef, def: Def, sdc: Sdc, layout: L, gds: G, oasis: O, layermap: LM, view: V, spef: Sp, sdf: Sd, stil: St, same, diff } = F;
let pass = 0, fail = 0; const t0 = Date.now();
const ok = (name, c, extra) => { if (c) pass++; else { fail++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra)?.slice(0, 400) : ''); } };
const near = (name, got, want, abs = 1e-9) => ok(name, Math.abs(got - want) <= abs, { got, want });
const fx = (n) => fs.readFileSync(fileURLToPath(new URL('./fixtures/' + n, import.meta.url)), 'utf8');
const errs = (ps) => ps.filter((p) => p.severity === 'error');

// ---- Liberty ---------------------------------------------------------------------------------------------------------------
{
  const r = Lib.readLiberty(fx('demo.lib')); ok('liberty: reads with no problems', r.problems.length === 0, r.problems);
  const m = Lib.libertyModel(r.tree);
  ok('liberty: library name and units', m.name === 'cc_demo' && m.units.time === '1ns' && m.units.cap === '1pf' && m.units.leakage === '1nW');
  ok('liberty: three cells', m.cells.map((c) => c.name).join() === 'INV_X1,NAND2_X1,DFF_X1');
  const inv = m.cells[0], y = inv.pins[1];
  ok('liberty: area, leakage, leakage_power when', inv.area === 1.2 && inv.leakage === 0.5 && inv.leakagePower[0].when === 'A' && inv.leakagePower[0].value === 0.7);
  ok('liberty: pin direction, capacitance, function', inv.pins[0].direction === 'input' && inv.pins[0].capacitance === 0.002 && y.function === '!A' && y.maxCapacitance === 0.2);
  const cr = y.timing[0].tables.cell_rise;
  ok('liberty: timing arc', y.timing[0].relatedPin === 'A' && y.timing[0].sense === 'negative_unate' && y.timing[0].type === 'combinational');
  ok('liberty: NLDM table read with indexes', same(cr.index1, [0.1, 0.5]) && same(cr.index2, [0.01, 0.05]) && same(cr.values, [[0.1, 0.2], [0.3, 0.4]]));
  ok('liberty: table without indexes takes the template\'s', same(y.timing[0].tables.cell_fall.index1, [0.1, 0.5]) && y.timing[0].tables.cell_fall.var1 === 'input_net_transition');
  ok('liberty: backslash-joined values', same(y.timing[0].tables.cell_fall.values, [[0.08, 0.16], [0.24, 0.32]]));
  ok('liberty: scalar table', y.timing[0].tables.fall_transition.template === 'scalar' && same(y.timing[0].tables.fall_transition.values, [[0.07]]));
  ok('liberty: internal power 1-D', same(y.internalPower[0].tables.rise_power.values, [[0.01, 0.012]]));
  // lookup: corners exact; centre = mean of the four (0.1+0.2+0.3+0.4)/4 = 0.25; (0.1, 0.03) = midway of 0.1 and 0.2 = 0.15
  near('lookup: corner', Lib.lookup(cr, 0.5, 0.05), 0.4); near('lookup: centre', Lib.lookup(cr, 0.3, 0.03), 0.25); near('lookup: edge', Lib.lookup(cr, 0.1, 0.03), 0.15);
  // outside: slope along x at y = 0.01 is (0.3 - 0.1) / 0.4 = 0.5 per unit → at x = 0.9 (0.4 past 0.5): 0.3 + 0.2 = 0.5
  near('lookup: extrapolates linearly', Lib.lookup(cr, 0.9, 0.01), 0.5);
  near('lookup: 1-D power table at 0.3', Lib.lookup(y.internalPower[0].tables.rise_power, 0.3), 0.011);
  near('lookup: scalar', Lib.lookup(y.timing[0].tables.fall_transition, 5, 5), 0.07);
  const dff = m.cells[2]; ok('liberty: ff group', dff.ff.clockedOn === 'CK' && dff.ff.nextState === 'D' && same(dff.ff.names, ['IQ', 'IQN']));
  ok('liberty: setup arc', dff.pins[1].timing[0].type === 'setup_rising' && dff.pins[1].timing[0].tables.rise_constraint.values[0][0] === 0.05);
  ok('liberty: clock pin', dff.pins[0].clock === true);
  const w = Lib.writeLiberty(r.tree), r2 = Lib.readLiberty(w);
  ok('liberty: tree round trip (read → write → read)', same(Lib.plainTree(r.tree), Lib.plainTree(r2.tree)), diff(Lib.plainTree(r.tree), Lib.plainTree(r2.tree)));
  const m2 = Lib.libertyModel(Lib.readLiberty(Lib.writeLiberty(Lib.buildLiberty(m))).tree);
  ok('liberty: model round trip (model → write → read → model)', same(m, m2), diff(m, m2));
  ok('liberty: check finds nothing in the sample', Lib.checkLiberty(m).length === 0, Lib.checkLiberty(m));
  const bad = Lib.libertyModel(Lib.readLiberty('library (x) { cell (C) { pin (Y) { direction : output ; timing () { related_pin : "A" ; cell_rise (t) { index_1 ("1, 2") ; index_2 ("1, 2") ; values ("1, 2", "3, 4", "5, 6") ; } } } } }').tree);
  const bc = Lib.checkLiberty(bad).map((p) => p.code); ok('liberty: a 3-row table under 2 indexes is named', bc.includes('chip.fmt.lib.table-size') && bc.includes('chip.fmt.lib.no-area'), bc);
  ok('liberty: unclosed group is named', Lib.readLiberty('library (x) { cell (a) { area : 1 ;').problems.some((p) => p.code === 'chip.fmt.lib.group'));
  ok('liberty: no library group is named', Lib.readLiberty('cell (a) { }').problems.some((p) => p.code === 'chip.fmt.lib.no-library'));
  ok('liberty: missing semicolons at line ends are fine', Lib.libertyModel(Lib.readLiberty('library (x) {\n cell (a) {\n area : 3\n }\n}').tree).cells[0].area === 3);
}

// ---- LEF -------------------------------------------------------------------------------------------------------------------
let lefM;
{
  const r = Lef.readLef(fx('demo.lef')); ok('lef: reads with no problems, END LIBRARY found', r.problems.length === 0 && r.endLibrary, r.problems);
  const m = lefM = Lef.lefModel(r.tree);
  ok('lef: header', m.version === '5.8' && m.busBitChars === '[]' && m.dividerChar === '/' && m.units.database.value === 1000 && m.manufacturingGrid === 0.005);
  ok('lef: four layers with types', m.layers.map((l) => l.name + ':' + l.type).join() === 'poly:MASTERSLICE,metal1:ROUTING,via1:CUT,metal2:ROUTING');
  const m1 = m.layers[1]; ok('lef: routing layer rules', m1.direction === 'HORIZONTAL' && m1.pitch === 0.4 && m1.width === 0.16 && m1.spacing === 0.16 && m1.offset === 0.2 && m1.resistancePerSq === 0.08);
  ok('lef: via with DEFAULT and three layers', m.vias[0].name === 'via12' && m.vias[0].default && m.vias[0].layers.length === 3 && same(m.vias[0].layers[1].rects[0], [-0.07, -0.07, 0.07, 0.07]));
  ok('lef: site', m.sites[0].name === 'core' && m.sites[0].class === 'CORE' && same(m.sites[0].size, [0.4, 3.6]) && same(m.sites[0].symmetry, ['Y']));
  const inv = m.macros[0]; ok('lef: macro header', inv.name === 'INV_X1' && inv.class === 'CORE' && same(inv.size, [0.8, 3.6]) && same(inv.origin, [0, 0]) && inv.site === 'core' && same(inv.symmetry, ['X', 'Y']) && inv.foreign.name === 'INV_X1');
  ok('lef: pins with direction, use, shape', inv.pins.map((p) => p.name + ':' + p.direction + ':' + p.use).join() === 'A:INPUT:SIGNAL,Y:OUTPUT:SIGNAL,VDD:INOUT:POWER,VSS:INOUT:GROUND' && inv.pins[2].shape === 'ABUTMENT');
  ok('lef: port rect and polygon', same(inv.pins[0].ports[0][0].rects[0], [0.1, 1.2, 0.3, 1.8]) && same(inv.pins[1].ports[0][0].polygons[0], [0.5, 0.6, 0.7, 0.6, 0.7, 3, 0.5, 3]));
  ok('lef: obstruction', inv.obs[0].layer === 'metal1' && same(inv.obs[0].rects[0], [0.3, 0.4, 0.5, 3.2]));
  ok('lef: pins written on one line read the same', m.macros[2].pins.map((p) => p.name + ':' + p.direction).join() === 'CK:INPUT,D:INPUT,Q:OUTPUT' && same(m.macros[2].pins[2].ports[0][0].rects[0], [2.9, 0.6, 3.1, 3]));
  const r2 = Lef.readLef(Lef.writeLef(r.tree)); ok('lef: tree round trip', same(Lef.plainLef(r.tree), Lef.plainLef(r2.tree)) && r2.problems.length === 0, diff(Lef.plainLef(r.tree), Lef.plainLef(r2.tree)));
  const m2 = Lef.lefModel(Lef.readLef(Lef.writeLef(Lef.buildLef(m))).tree); ok('lef: model round trip', same(m, m2), diff(m, m2));
  ok('lef: check finds nothing in the sample', Lef.checkLef(m).length === 0, Lef.checkLef(m));
  const u = Lef.readLef('MACRO X\n  CLASS CORE ;\n  PIN A\n    DIRECTION INPUT ;\n  END A\nEND X\nEND LIBRARY\n'); const cu = Lef.checkLef(Lef.lefModel(u.tree)).map((p) => p.code);
  ok('lef: macro without SIZE and pin without PORT named', cu.includes('chip.fmt.lef.no-size') && cu.includes('chip.fmt.lef.no-port'), cu);
  ok('lef: unknown statements are kept and written back', Lef.writeLef(Lef.readLef('LAYER m1\n  TYPE ROUTING ;\n  PROPERTY LEF58_X "a b" ;\nEND m1\n').tree).includes('PROPERTY LEF58_X "a b" ;'));
  ok('lef: a wrong END is named', Lef.readLef('MACRO X\n CLASS CORE ;\nEND Y\n').problems.some((p) => p.code === 'chip.fmt.lef.end'));
}

// ---- DEF -------------------------------------------------------------------------------------------------------------------
let defD;
{
  const r = Def.readDef(fx('demo.def')); ok('def: reads with no problems', r.problems.length === 0, r.problems);
  const d = defD = r.def;
  ok('def: header, units, die', d.version === '5.8' && d.design === 'cc_demo_top' && d.units === 1000 && same(d.dieArea, [[0, 0], [20000, 14400]]));
  ok('def: rows', d.rows.length === 2 && d.rows[1].orient === 'FS' && same(d.rows[0].num, [40, 1]) && same(d.rows[0].step, [400, 0]));
  ok('def: tracks and gcell grid', d.tracks[0].dir === 'Y' && d.tracks[0].num === 36 && same(d.tracks[1].layers, ['metal2']) && d.gcellGrids[0].step === 2000);
  ok('def: components with status and orientation', d.components.map((c) => c.name + ':' + c.model + ':' + c.status + ':' + (c.orient || '')).join() === 'u1:INV_X1:PLACED:N,u2:NAND2_X1:PLACED:N,u3:DFF_X1:FIXED:FS,u4:INV_X1:UNPLACED:' && d.components[3].source === 'NETLIST');
  ok('def: pins', d.pins[0].net === 'clk' && d.pins[0].direction === 'INPUT' && same(d.pins[0].layers[0].rect, [-100, 0, 100, 200]) && same(d.pins[0].at, [1000, 0]) && d.pins[2].orient === 'S');
  const din = d.nets[1];
  ok('def: net connections', same(din.conns, [['PIN', 'din'], ['u1', 'A']]));
  ok('def: routed wire with "*" resolved, via, NEW', din.wires.length === 2 && same(din.wires[0].items.map((i) => i.p || i.via), [[3000, 0], [3000, 3500], 'via12']) && din.wires[1].layer === 'metal1' && same(din.wires[1].items[1].p, [2200, 3500]));
  const vdd = d.specialNets[0]; ok('def: special net width and shape', vdd.use === 'POWER' && vdd.wires.length === 2 && vdd.wires[0].width === 400 && vdd.wires[0].shape === 'STRIPE' && same(vdd.wires[1].items[1].p, [18000, 9200]));
  ok('def: net without routing keeps its USE', d.nets[3].use === 'SIGNAL' && d.nets[3].wires.length === 0);
  const r2 = Def.readDef(Def.writeDef(d)); ok('def: round trip', same(d, r2.def) && r2.problems.length === 0, diff(d, r2.def));
  // orientations: a 2 × 1 cell's point (0.5, 0.25) — hand-worked; the turned box always starts at (0, 0)
  const op = (o) => Def.orientPoint(o, 0.5, 0.25, 2, 1);
  ok('def: orient N S', same(op('N'), [0.5, 0.25]) && same(op('S'), [1.5, 0.75]));
  ok('def: orient W E (box becomes 1 × 2)', same(op('W'), [0.75, 0.5]) && same(op('E'), [0.25, 1.5]));
  ok('def: orient FN FS FW FE', same(op('FN'), [1.5, 0.25]) && same(op('FS'), [0.5, 0.75]) && same(op('FW'), [0.25, 0.5]) && same(op('FE'), [0.75, 1.5]));
  ok('def: every orientation keeps corners inside the turned box', ['N', 'S', 'E', 'W', 'FN', 'FS', 'FE', 'FW'].every((o) => [[0, 0], [2, 0], [2, 1], [0, 1]].every(([x, y]) => { const [a, b] = Def.orientPoint(o, x, y, 2, 1), [W, H] = /E|W/.test(o) ? [1, 2] : [2, 1]; return a >= 0 && a <= W && b >= 0 && b <= H; })));
  const s = Def.defShapes(d, lefM);
  ok('def: floorplan die in µm', same(s.die[2], [20, 14.4]));
  ok('def: cell boxes from LEF sizes (INV 0.8 × 3.6 at 2, 2)', same(s.cells[0].box, [2, 2, 2.8, 5.6]) && s.cells.length === 3 && s.unknownMacros === 0);
  ok('def: row extent = 39 steps of 0.4 + one 0.4 site', near2(s.rows[0].box[2], 18));
  ok('def: wires with LEF widths and special widths', s.wires.find((w) => w.net === 'n1').width === 0.16 && s.wires.find((w) => w.net === 'VDD').width === 0.4 && s.vias.length === 2);
  const bad = Def.readDef('DESIGN x ;\nCOMPONENTS 2 ;\n - a INV + PLACED ( 0 0 ) N ;\nEND COMPONENTS\nNETS 1 ;\n - n ( a A ) ( ghost B ) ;\nEND NETS\nEND DESIGN\n');
  const bp = bad.problems.map((p) => p.code); ok('def: wrong count and unknown component named', bp.includes('chip.fmt.def.count') && bp.includes('chip.fmt.def.net-comp'), bp);
  ok('def: missing END DESIGN named', Def.readDef('DESIGN x ;\n').problems.some((p) => p.code === 'chip.fmt.def.no-end'));
  ok('def: unknown sections kept', Def.writeDef(Def.readDef('DESIGN x ;\nBLOCKAGES 1 ;\n - LAYER metal1 RECT ( 0 0 ) ( 10 10 ) ;\nEND BLOCKAGES\nEND DESIGN\n').def).includes('- LAYER metal1 RECT ( 0 0 ) ( 10 10 )'));
}
function near2(a, b) { return Math.abs(a - b) < 1e-9; }

// ---- SDC -------------------------------------------------------------------------------------------------------------------
let sdcC;
{
  const tc = Sdc.tclParse('a {b {c d}} "e [f g] h" [i [j k]] $v\\\n z ; # not a comment\nx');
  ok('tcl: braces kept literal, nested', tc[0].words[1].v === 'b {c d}' && tc[0].words[1].braced);
  ok('tcl: quotes with a command inside', tc[0].words[2].t === 'cat' && tc[0].words[2].parts[1].t === 'cmd' && tc[0].words[2].parts[1].words[0].v === 'f');
  ok('tcl: nested brackets', tc[0].words[3].t === 'cmd' && tc[0].words[3].words[1].t === 'cmd');
  ok('tcl: variable and line join', tc[0].words[4].t === 'var' && tc[0].words[5].v === 'z');
  ok('tcl: ";" ends a command; "#" after ";" starts a comment', tc.length === 2 && tc[1].words[0].v === 'x');
  const r = Sdc.readSdc(fx('demo.sdc')); sdcC = r.commands;
  ok('sdc: only the "if" is named as not run', r.problems.length === 1 && r.problems[0].code === 'chip.fmt.sdc.not-run' && r.problems[0].text.startsWith('Line 20'), r.problems);
  ok('sdc: set makes $clk_period = 10.0', r.vars.clk_period === '10.0');
  const s = Sdc.sdcSummary(r.commands);
  ok('sdc: clock', s.clocks.length === 1 && s.clocks[0].name === 'core_clk' && s.clocks[0].period === 10 && same(s.clocks[0].waveform, [0, 5]) && same(s.clocks[0].sources, ['clk']));
  ok('sdc: generated clock', s.generatedClocks[0].name === 'div2' && s.generatedClocks[0].divideBy === 2 && same(s.generatedClocks[0].source, ['clk']) && same(s.generatedClocks[0].targets, ['u3/Q']));
  ok('sdc: input delays (both and -min)', s.inputDelays.length === 2 && s.inputDelays[0].value === 2 && s.inputDelays[0].clock === 'core_clk' && s.inputDelays[1].minmax === 'min' && same(s.inputDelays[1].targets, ['din']));
  ok('sdc: output delay with the clock given as a query', s.outputDelays[0].clock === 'core_clk' && s.outputDelays[0].minmax === 'max' && s.outputDelays[0].value === 1.5);
  ok('sdc: false path over a joined line', s.exceptions[0].kind === 'false_path' && same(s.exceptions[0].from, ['rst_n']));
  ok('sdc: multicycle 2 -setup', s.exceptions[1].kind === 'multicycle_path' && s.exceptions[1].value === 2 && s.exceptions[1].setup);
  ok('sdc: max delay', s.exceptions[2].kind === 'max_delay' && s.exceptions[2].value === 4 && same(s.exceptions[2].to, ['dout']));
  ok('sdc: load, driving cell, units, groups', s.loads[0].value === 0.05 && s.drives[0].cell === 'INV_X1' && s.drives[0].pin === 'Y' && s.units.time === 'ns' && s.groups[0].kind === 'asynchronous' && same(s.groups[0].groups, [['core_clk'], ['div2']]));
  ok('sdc: two commands on one line (";")', s.other.set_max_fanout === 1 && s.other.set_max_transition === 1);
  ok('sdc: list in braces', same(r.commands.find((c) => c.cmd === 'set_input_transition').args[1].patterns, ['din', 'clk']));
  const r2 = Sdc.readSdc(Sdc.writeSdc(r.commands)); ok('sdc: round trip', same(Sdc.plainSdc(r.commands), Sdc.plainSdc(r2.commands)), diff(Sdc.plainSdc(r.commands), Sdc.plainSdc(r2.commands)));
  const ch = Sdc.checkSdc(r.commands, { ports: ['clk', 'din', 'dout'] });
  ok('sdc: check against the design\'s ports: rst_n is not one', ch.length === 1 && ch[0].code === 'chip.fmt.sdc.port' && ch[0].text.includes('rst_n'), ch);
  ok('sdc: ports by pattern (d* matches din)', Sdc.checkSdc(Sdc.readSdc('set_load 1 [get_ports d*]').commands, { ports: ['din'] }).length === 0);
  const cb = Sdc.checkSdc(Sdc.readSdc('create_clock -name c -period 0 [get_ports clk]\nset_input_delay 1 -clock nope [get_ports a]').commands).map((p) => p.code);
  ok('sdc: zero period and unknown clock named', cb.includes('chip.fmt.sdc.period') && cb.includes('chip.fmt.sdc.clock'), cb);
  ok('sdc: unknown command noted, unset variable warned', (() => { const x = Sdc.readSdc('my_cmd -a 1\nset_load $nope [get_ports a]'); return x.problems.some((p) => p.code === 'chip.fmt.sdc.unknown') && x.problems.some((p) => p.code === 'chip.fmt.sdc.var'); })());
  ok('sdc: no eval: [exec rm] is kept as text', (() => { const x = Sdc.readSdc('set_load [exec rm -rf /] [get_ports a]'); return x.commands[0].args[0].raw && x.problems.some((p) => p.code === 'chip.fmt.sdc.not-run'); })());
  const rows = PM.constraintRows(r.commands, (k, v) => k + JSON.stringify(v || {}));
  ok('sdc: constraint rows for the panel', rows.filter((x) => x.group === 'clock').length === 3 && rows.some((x) => x.text.startsWith('chip.fmt.sdc.false_path')));
}

// ---- SPEF ------------------------------------------------------------------------------------------------------------------
{
  const r = Sp.readSpef(fx('demo.spef')); ok('spef: reads with no problems', r.problems.length === 0, r.problems);
  const s = r.spef; ok('spef: header and units', s.header.DESIGN === 'cc_demo_top' && s.header.DIVIDER === '/' && s.units.c.unit === 'PF' && s.units.r.unit === 'KOHM');
  ok('spef: name map and ports', s.nameMap['3'] === 'u1' && s.ports.map((p) => p.name + p.dir).join() === 'dinI,doutO');
  const n = s.nets[0]; ok('spef: net names resolved through the map', n.name === 'din' && n.conns[1].name === 'u1:A' && n.conns[1].load === 0.002 && n.conns[1].driver === 'INV_X1');
  ok('spef: ground and coupling caps', n.caps.length === 4 && n.caps[3].node2 === 'n1:1' && n.res.length === 2);
  const ns = Sp.netSummary(n); near('spef: ground total 0.001+0.0005+0.0005', ns.ground, 0.002); near('spef: coupling', ns.coupling, 0.002); near('spef: resistance 0.1+0.2', ns.resistance, 0.3);
  ok('spef: triple total reads the middle', s.nets[1].total === 0.0031);
  // Elmore: din → din:1 (0.1 kΩ) → u1:A (0.2 kΩ); C(din:1) = 0.0005 + 0.002 coupling, C(u1:A) = 0.0005 → 0.1·0.003 + 0.2·0.0005 = 0.0004
  near('spef: Elmore delay to u1:A', Sp.elmore(n).delays['u1:A'], 0.0004, 1e-12);
  near('spef: Elmore delay on n1 (0.3 · 0.0006)', Sp.elmore(s.nets[1]).delays['u2:A'], 0.00018, 1e-12);
  const bad = Sp.readSpef('*SPEF "x"\n*C_UNIT 1 PF\n*D_NET a 1.0\n*CAP\n1 a 0.5\n*END\n'); ok('spef: total that does not add up is named', bad.problems.some((p) => p.code === 'chip.fmt.spef.total'));
}

// ---- SDF -------------------------------------------------------------------------------------------------------------------
{
  const r = Sd.readSdf(fx('demo.sdf')); ok('sdf: reads with no problems', r.problems.length === 0, r.problems);
  const s = r.sdf; ok('sdf: header', s.header.SDFVERSION === '3.0' && s.header.TIMESCALE === '1ns' && s.header.VOLTAGE === '1.8::1.8');
  ok('sdf: three cells; empty INSTANCE is the top', s.cells.length === 3 && s.cells[0].instance === '' && s.cells[1].instance === 'u1');
  ok('sdf: interconnect triple', same(s.cells[0].delays[0].values[0], [0.01, 0.012, 0.015]) && s.cells[0].delays[1].values[0].length === 1);
  ok('sdf: IOPATH with an edge', same(s.cells[2].delays[0].from, { edge: 'posedge', port: 'CK' }) && same(s.cells[2].delays[0].values[1], [0.22, null, 0.32]));
  ok('sdf: COND IOPATH', s.cells[2].delays[1].cond === "D==1'b1" && s.cells[2].delays[1].kind === 'IOPATH');
  ok('sdf: INCREMENT PORT', s.cells[2].delays[2].mode === 'INCREMENT' && s.cells[2].delays[2].kind === 'PORT' && s.cells[2].delays[2].to === 'D');
  ok('sdf: timing checks', s.cells[2].checks.map((c) => c.kind).join() === 'SETUP,HOLD,WIDTH' && same(s.cells[2].checks[0].ref, { edge: 'posedge', port: 'CK' }) && s.cells[2].checks[2].ref === undefined);
  const r2 = Sd.readSdf(Sd.writeSdf(s)); ok('sdf: round trip', same(s, r2.sdf) && r2.problems.length === 0, diff(s, r2.sdf));
  const dl = Sd.sdfDelays(s, 'max'); ok('sdf: delays at the max corner (rise 0.15, fall 0.11 for u1)', dl.find((x) => x.instance === 'u1').rise === 0.15 && dl.find((x) => x.instance === 'u1').fall === 0.11);
  ok('sdf: a left-out corner falls back to a given one', Sd.sdfDelays(s, 'typ').find((x) => x.edge === 'posedge').fall === 0.22);
  const made = Sd.sdfFromArcs({ design: 'd', cells: [{ type: 'INV_X1', instance: 'u9', arcs: [{ from: 'A', to: 'Y', rise: 0.25, fall: 0.2 }] }] });
  ok('sdf: made from arcs, written and read back', Sd.readSdf(Sd.writeSdf(made)).sdf.cells[0].delays[0].values[1][1] === 0.2);
  ok('sdf: not a delay file is named', Sd.readSdf('(FOO)').problems[0].code === 'chip.fmt.sdf.no-delayfile');
}

// ---- STIL ------------------------------------------------------------------------------------------------------------------
{
  const sig = PM.stilSignals({ def: defD, sdc: sdcC });
  ok('stil: signals from the DEF pins, clock from the SDC', sig.signals.map((s) => s.name + ':' + s.dir).join() === 'clk:In,din:In,dout:Out' && sig.signals[0].clock && sig.period === 10, sig);
  ok('stil: a clock rising at 0 pulses from a quarter period', sig.signals[0].clock.rise === 2.5 && sig.signals[0].clock.fall === 5);
  const r = St.writeStil({ title: 'demo', signals: sig.signals, period: 10, drive: 0, strobe: 9, vectors: PM.parseVectors('0 0 X\nP 1 X  # load a one\nP 0 H\n') });
  ok('stil: written without problems', r.problems.length === 0, r.problems);
  ok('stil: header, signals, groups, timing', r.text.startsWith('STIL 1.0;') && r.text.includes('clk In;') && r.text.includes('dout Out;') && r.text.includes("all_in = 'din';") && r.text.includes("Period '10ns';") && r.text.includes("clk { 0P { '0ns' D; '2.5ns' D/U; '5ns' D; } }") && r.text.includes("'9ns' L/H/X/T;"));
  ok('stil: burst and exec', /PatternBurst burst \{\s*PatList \{ pat; \}/.test(r.text) && /PatternExec \{\s*PatternBurst burst;/.test(r.text));
  const back = St.readStilVectors(r.text);
  ok('stil: vectors read back in order', back.vectors.length === 3 && back.vectors[1].clk === 'P' && back.vectors[1].all_in === '1' && back.vectors[2].all_out === 'H' && back.period === 10);
  ok('stil: braces balance', [...r.text].filter((c) => c === '{').length === [...r.text].filter((c) => c === '}').length);
  const bad = St.writeStil({ signals: [{ name: 'a', dir: 'In' }, { name: 'y', dir: 'Out' }], period: 10, strobe: 9, vectors: ['1H', 'HX', '1'] });
  const bp = bad.problems.map((p) => p.code); ok('stil: wrong characters and short vectors named', bp.includes('chip.fmt.stil.char') && bp.includes('chip.fmt.stil.width'), bp);
  ok('stil: names that are not identifiers are quoted', St.writeStil({ signals: [{ name: 'data[0]', dir: 'In' }], vectors: ['1'] }).text.includes('"data[0]" In;'));
}

// ---- layout model, GDSII --------------------------------------------------------------------------------------------------
function sample() {
  const lib = L.newLib('demo');
  const a = L.newCell(lib, 'A');
  a.shapes.add(L.POLY, 1, 0, [0, 0, 100, 0, 100, 50, 0, 50]); a.shapes.props.set(0, [[1, 'net=vdd']]);
  a.shapes.add(L.POLY, 2, 0, [0, 0, 30, 0, 30, 10, 10, 10, 10, 40, 0, 40]);
  const p = a.shapes.add(L.PATH, 3, 0, [0, 0, 200, 0, 200, 100], 20); a.shapes.ext.set(p, { pathtype: 4, bgnext: 5, endext: 7 });
  a.shapes.add(L.PATH, 3, 1, [0, 0, 0, 80], 10); a.shapes.ext.set(3, { pathtype: 2 });
  a.shapes.add(L.POLY, 4, 1, [0, 0, 10, 3, 7, 20, -5, 12]);
  a.texts.push({ text: 'IN', layer: 5, texttype: 1, x: 5, y: 5 });
  const top = L.newCell(lib, 'TOP');
  top.refs.push({ cell: 'A', x: 1000, y: 0, flip: false, angle: 90, mag: 1, props: [[7, 'u1']] });
  top.refs.push({ cell: 'A', x: 0, y: 0, flip: true, angle: 0, mag: 1, rep: { kind: 'lattice', nx: 4, ny: 3, ax: [300, 0], ay: [0, 200] } });
  top.refs.push({ cell: 'A', x: -500, y: 0, flip: false, angle: 30, mag: 2 });
  top.texts.push({ text: 'TOP', layer: 63, texttype: 0, x: 0, y: -50, angle: 90, mag: 2, flip: true, pres: 5 });
  return lib;
}
{
  const lib = sample(), bytes = G.writeGds(lib), r = G.readGds(bytes);
  ok('gds: reads its own file with no problems', r.problems.length === 0, r.problems);
  ok('gds: round trip (model → write → read)', same(L.plainLib(lib), L.plainLib(r.lib)), diff(L.plainLib(lib), L.plainLib(r.lib)));
  ok('gds: second round trip is byte-identical', same(G.writeGds(r.lib), bytes));
  ok('gds: units', r.lib.userPerDb === 0.001 && Math.abs(r.lib.metersPerDb - 1e-9) < 1e-24);
  // lib/pcb's reader (0.8 XE.11) reads the same file: same cells, same placed-out shapes
  const pr = PG.readGds(bytes); ok('gds: lib/pcb reads our file', Object.keys(pr.lib.cells).join() === 'A,TOP' && pr.lib.cells.A.elements.length === 6, pr.problems); // 5 shapes + 1 text
  ok('gds: lib/pcb sees the property records only as skipped', pr.problems.every((p) => p.id === 'pcb:gds.read.skipped'));
  const pf = PG.flatten(pr.lib, 'TOP'), mf = L.flattenCell(r.lib, 'TOP'), key = (s) => s.layer + '/' + s.datatype + ':' + s.poly.map((q) => q.map((v) => Math.round(v * 1000)).join(',')).join(';');
  const boxOnly = (sh) => sh.filter((s) => s.layer !== 3).map(key).sort(); // paths are outlined differently at bends; polygons must match exactly
  ok('gds: both flatten to the same polygons (14 placements × 3 non-path shapes)', same(boxOnly(pf.shapes), boxOnly(mf.shapes)) && boxOnly(mf.shapes).length === 42, { a: boxOnly(pf.shapes).length, b: boxOnly(mf.shapes).length });
  // and ours reads lib/pcb's writer
  const pl = { name: 'P', userPerDb: 0.001, metersPerDb: 1e-9, order: ['C'], cells: { C: { name: 'C', elements: [{ type: 'boundary', layer: 7, datatype: 2, pts: [[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]], width: 0, pathtype: 0, strans: 0, mag: 1, angle: 0 }, { type: 'path', layer: 8, datatype: 0, pts: [[0, 0], [9, 0]], width: 2, pathtype: 2, strans: 0, mag: 1, angle: 0 }, { type: 'text', layer: 9, datatype: 0, pts: [[1, 1]], text: 'hi', width: 0, pathtype: 0, strans: 0, mag: 1, angle: 0 }] } } };
  const mine = G.readGds(PG.writeGds(pl)); const c = mine.lib.cells.C;
  ok('gds: we read lib/pcb\'s file', mine.problems.length === 0 && same(c.shapes.get(0).xy, [0, 0, 5, 0, 5, 5, 0, 5]) && c.shapes.get(0).layer === 7 && c.shapes.get(0).datatype === 2 && c.shapes.get(1).width === 2 && c.shapes.get(1).pathtype === 2 && c.texts[0].text === 'hi', mine.problems);
  // hierarchy and boxes, hand-worked: A's box = [-15, -15, 217, 107] (path 0..200 with width 20 and ext ≤ 7 → padded by 10 + 7, BOX: -5 from poly 4…)
  const bb = L.cellBBoxes(r.lib);
  ok('layout: top cell found', same(L.topCells(r.lib), ['TOP']));
  ok('layout: hierarchy: TOP places A 14 times (1 + 4 × 3 + 1)', (() => { const h = L.hierarchyTree(r.lib, 'TOP'); return h.children.length === 1 && h.children[0].placed === 14; })());
  ok('layout: A\'s box includes the path ends padded by half-width and extension', same(bb.get('A'), [-17, -17, 217, 117]), bb.get('A'));
  const st = L.layoutStats(r.lib, 'TOP'); ok('layout: stats: 5 stored shapes, 70 placed', st.stored === 5 && st.flatShapes === 70 && st.refs === 3 && st.layers.find((x) => x.layer === 3 && x.datatype === 0).flat === 14);
  const loop = L.newLib('l'); L.newCell(loop, 'X').refs.push({ cell: 'Y', x: 0, y: 0, flip: false, angle: 0, mag: 1 }); L.newCell(loop, 'Y').refs.push({ cell: 'X', x: 0, y: 0, flip: false, angle: 0, mag: 1 });
  ok('layout: loops found', L.findLoops(loop).length === 1 && same(L.findLoops(loop)[0], ['X', 'Y', 'X']));
  ok('layout: matrix: 90° turns (1, 0) into (0, 1); mirror flips y', same(L.apply(L.refMatrix({ x: 0, y: 0, angle: 90, mag: 1 }), 1, 0), [0, 1]) && same(L.apply(L.refMatrix({ x: 0, y: 0, flip: true, angle: 0, mag: 1 }), 1, 2), [1, -2]));
  ok('layout: mirror then 90° (GDSII order): (1, 2) → (2, 1)', same(L.apply(L.refMatrix({ x: 0, y: 0, flip: true, angle: 90, mag: 1 }), 1, 2), [2, 1]));
  ok('layout: lib/pcb handoff keeps every element (A: 5 shapes + 1 text; TOP: 1 + 12 + 1 placements + 1 text)', (() => { const p = L.toPcbLib(r.lib); return p.cells.A.elements.length === 6 && p.cells.TOP.elements.length === 15; })());
  const big = L.newLib('b'), cc = L.newCell(big, 'C'), xy = []; for (let k = 0; k < 9000; k++) xy.push(k, k % 7);
  cc.shapes.add(L.POLY, 1, 0, xy); const probs = []; G.writeGds(big, { problems: probs });
  ok('gds: a polygon over 8191 points is refused and named', probs.some((p) => p.code === 'chip.fmt.gds.too-many-points'));
  ok('gds: cut-short stream is named', G.readGds(bytes.slice(0, bytes.length - 30)).problems.some((p) => p.code === 'chip.fmt.gds.truncated' || p.code === 'chip.fmt.gds.no-endlib'));
  ok('gds: missing cell is named', (() => { const m = L.newLib('m'); L.newCell(m, 'T').refs.push({ cell: 'GONE', x: 0, y: 0, flip: false, angle: 0, mag: 1 }); return G.readGds(G.writeGds(m)).problems.some((p) => p.code === 'chip.fmt.gds.missing-cell'); })());
  // GDS reals: 1e-9 and 0.001 hand-checked bytes; round trip of awkward values
  ok('gds: real8 of 0.001 = 3E 41 89 37 4B C6 A7 F0', [...G.toReal8(0.001)].map((b) => b.toString(16).padStart(2, '0')).join(' ') === '3e 41 89 37 4b c6 a7 f0');
  ok('gds: real8 round trips', [1, -2.5, 1e-9, 0.001, 123456.789, 90, 1 / 3].every((v) => Math.abs(G.real8(G.toReal8(v), 0) - v) <= Math.abs(v) * 1e-15));
}

// ---- OASIS: our writer + reader ---------------------------------------------------------------------------------------------
{
  const lib = sample();
  for (const compress of [false, true]) {
    const b = O.writeOasis(lib, { compress }), r = O.readOasis(b);
    ok('oasis: reads its own file (' + (compress ? 'compressed' : 'plain') + ') with no problems', r.problems.length === 0, r.problems);
    const a = { ...L.plainLib(lib), name: 0 }, c = { ...L.plainLib(r.lib), name: 0 };
    // OASIS texts have no transform or presentation: drop them from the expectation
    a.cells.TOP = { ...a.cells.TOP, texts: a.cells.TOP.texts.map(({ angle, mag, flip, pres, ...x }) => x) };
    ok('oasis: round trip (' + (compress ? 'compressed' : 'plain') + ')', same(a, c), diff(a, c));
    ok('oasis: CRC32 checked on read', r.lib.validated === 'crc32');
    ok('oasis: END record is 256 bytes', b.length > 256 && b[b.length - 256] === 2);
  }
  // shape repetitions survive OASIS (GDSII writes them out one by one)
  const rl = L.newLib('r'), rc = L.newCell(rl, 'R'); const i = rc.shapes.add(L.POLY, 1, 0, [0, 0, 4, 0, 4, 4, 0, 4]); rc.shapes.rep.set(i, { kind: 'lattice', nx: 3, ny: 2, ax: [10, 0], ay: [0, 10] });
  const j = rc.shapes.add(L.POLY, 1, 0, [0, 0, 4, 0, 4, 4, 0, 4]); rc.shapes.rep.set(j, { kind: 'list', d: [0, 0, 5, 0, 12, 0] });
  const k = rc.shapes.add(L.POLY, 1, 0, [0, 0, 4, 0, 4, 4, 0, 4]); rc.shapes.rep.set(k, { kind: 'list', d: [0, 0, 3, 7, -1, 9] });
  const rr = O.readOasis(O.writeOasis(rl)); ok('oasis: lattice, x-list and free list repetitions round trip', same(L.plainLib(rl).cells, L.plainLib(rr.lib).cells), diff(L.plainLib(rl).cells, L.plainLib(rr.lib).cells));
  const gr = G.readGds(G.writeGds(rl)); ok('gds: shape repetitions are written out (6 + 3 + 3 shapes)', gr.lib.cells.R.shapes.n === 12 && same(L.plainLib(L.expandShapeReps(rl)).cells, L.plainLib(gr.lib).cells));
  // GDSII → OASIS → GDSII keeps the layout (texts lose their transforms; boxes become polygons)
  const g1 = G.readGds(G.writeGds(sample())).lib, o = O.readOasis(O.writeOasis(g1)).lib;
  ok('convert: GDSII → OASIS → model: same flattened polygons', same(L.flattenCell(g1, 'TOP').shapes, L.flattenCell(o, 'TOP').shapes));
  ok('oasis: smaller than GDSII for the same layout', O.writeOasis(g1).length < G.writeGds(g1).length);
  ok('oasis: not OASIS is named', O.readOasis(new Uint8Array([1, 2, 3, 4])).problems[0].code === 'chip.fmt.oas.magic');
  const ob = O.writeOasis(sample(), { compress: false }); const dmg = ob.slice(); dmg[40] ^= 0x01; const dr = O.readOasis(dmg);
  ok('oasis: a damaged byte fails the CRC32 or the read', dr.problems.some((p) => p.code === 'chip.fmt.oas.validation' || p.code === 'chip.fmt.oas.read'), dr.problems);
  ok('oasis: cut short is named', O.readOasis(ob.slice(0, ob.length - 300)).problems.some((p) => p.code === 'chip.fmt.oas.no-end' || p.code === 'chip.fmt.oas.read'));
}

// ---- OASIS: a file built by hand, byte by byte, from the spec (record kinds our writer does not use) -------------------------
{
  const B = []; const u = (v) => { do { let c = v % 128; v = Math.floor(v / 128); if (v) c |= 128; B.push(c); } while (v); }, s = (v) => u(v < 0 ? -2 * v + 1 : 2 * v), str = (x) => { u(x.length); for (const ch of x) B.push(ch.charCodeAt(0)); };
  for (const ch of '%SEMI-OASIS\r\n') B.push(ch.charCodeAt(0));
  u(1); str('1.0'); u(0); u(1000); u(0); for (let k = 0; k < 12; k++) u(0); // START, unit = 1000 per micron, tables in START (all absent)
  // CELL by reference number 1 (its name comes at the end: a forward reference)
  u(13); u(1);
  u(20); u(0x7b); u(1); u(0); u(10); u(20); s(5); s(7);                     // RECTANGLE L D W H X Y: layer 1, dt 0, 10 × 20 at (5, 7)
  u(20); u(0x14); s(100); u(2); u(1); u(50);                               // RECTANGLE X R: modal size and y; repetition type 2: 3 in a row, 50 apart
  u(20); u(0xd8); u(4); s(0); s(0);                                        // RECTANGLE S W X Y: square 4 at (0, 0)
  u(21); u(0x3b); u(2); u(0); u(0); u(2); s(10); s(5); s(0); s(100);       // POLYGON L D P X Y; point list type 0 (1-deltas, x first): 10, 5 + the implied corner
  u(21); u(0x38); u(3); u(2); u(5 * 8 + 4); u(5 * 8 + 0); s(200); s(0);    // POLYGON P X Y; type 3 (3-deltas): NE 5, E 5
  u(21); u(0x38); u(4); u(2); u(3 * 4 + 1); s(7); u(3 * 4 + 2 + 1); s(1); s(300); s(0); // type 4 g-deltas, form 2: (3, 7), (-3, 1)
  u(21); u(0x38); u(5); u(3); u((2 * 8 + 0) * 2); u((2 * 8 + 1) * 2); u((4 * 8 + 2) * 2); s(400); s(0); // type 5 double deltas: E2, then +N2, then +W4
  u(22); u(0xfb); u(3); u(1); u(2); u((2 << 2) | 3); s(5); u(2); u(1); u(20 * 4); s(0); s(200); // PATH: half-width 2, start = half-width, end = 5; type 2: E 20
  u(19); u(0x5b); str('A1'); u(9); u(2); s(1); s(2);                       // TEXT C X Y T L: "A1" on 9/2 at (1, 2)
  u(28); u(0x14); str('note'); u(10); str('hi');                           // PROPERTY: name "note", one a-string value → on the text
  u(29);                                                                   // the same property again
  u(27); u(0x3b); u(1); u(0); u(10); s(500); s(500);                       // CIRCLE r X Y D L: radius 10 at (500, 500)
  // CELL by name, relative coordinates
  u(14); str('TOP'); u(16);
  u(17); u(0xf0); u(1); s(1000); s(500);                                   // PLACEMENT C N X Y: cell #1 at (1000, 500)
  u(17); u(0x23); s(1000);                                                 // X, angle 90 (AA = 1), flip: x = 2000 (relative), y stays 500
  u(18); u(0x26); u(4); u(3); u(2); u(0); u(45); s(-500);                  // PLACEMENT with M A X: mag 3/2, angle 45, x = 1500
  u(17); u(0x28); s(100); u(8); u(0); u(0); u((10 * 8 + 0) * 2); u((20 * 8 + 1) * 2); // X R: x = 1600; repetition 8: 2 × 2, (10, 0) and (0, 20)
  u(17); u(0x08); u(0);                                                    // R only: repetition 0 = the last one again
  u(17); u(0x08); u(4); u(1); u(5); u(7);                                  // repetition 4: 3 places, 5 then 7 apart in x
  u(17); u(0x08); u(11); u(0); u(10); u((1 * 8 + 4) * 2);                  // repetition 11: 2 places, grid 10, NE 1 → (10, 10)
  u(3); str('TOP'); u(3); str('LEAF');                                     // CELLNAME: TOP = 0, LEAF = 1 (after use)
  u(11); str('M1'); u(3); u(1); u(3); u(0);                                // LAYERNAME M1 = 1/0
  const endAt = B.length; u(2); u(248); for (let k = 0; k < 248; k++) B.push(0); u(1); // END, CRC32
  const body = Uint8Array.from(B), sig = crc32(body); const file = new Uint8Array(body.length + 4); file.set(body); file[body.length] = sig & 255; file[body.length + 1] = (sig >>> 8) & 255; file[body.length + 2] = (sig >>> 16) & 255; file[body.length + 3] = sig >>> 24;
  ok('oasis hand file: END is 256 bytes', file.length - endAt === 256);
  const r = O.readOasis(file), leaf = r.lib.cells.LEAF, top = r.lib.cells.TOP;
  ok('oasis hand file: reads (circle and trapezoid notes only)', errs(r.problems).length === 0 && r.lib.validated === 'crc32', r.problems);
  ok('oasis hand file: forward cell name resolved', !!leaf && !!top && same(r.lib.order, ['LEAF', 'TOP']));
  ok('oasis hand file: units', r.lib.userPerDb === 0.001 && r.lib.metersPerDb === 1e-9);
  const g = (i) => leaf.shapes.get(i);
  ok('oasis hand file: rectangle', same(g(0).xy, [5, 7, 15, 7, 15, 27, 5, 27]) && g(0).layer === 1);
  ok('oasis hand file: modal size, y and a 3-in-a-row repetition', same(g(1).xy, [100, 7, 110, 7, 110, 27, 100, 27]) && same(g(1).rep, { kind: 'lattice', nx: 3, ny: 1, ax: [50, 0], ay: [0, 0] }));
  ok('oasis hand file: square', same(g(2).xy, [0, 0, 4, 0, 4, 4, 0, 4]));
  ok('oasis hand file: 1-delta polygon with the implied corner', same(g(3).xy, [0, 100, 10, 100, 10, 105, 0, 105]) && g(3).layer === 2);
  ok('oasis hand file: 3-delta polygon', same(g(4).xy, [200, 0, 205, 5, 210, 5]));
  ok('oasis hand file: g-delta polygon (form 2)', same(g(5).xy, [300, 0, 303, 7, 300, 8]));
  ok('oasis hand file: double-delta polygon', same(g(6).xy, [400, 0, 402, 0, 404, 2, 402, 4]));
  ok('oasis hand file: path, width 4, extensions 2 and 5', same(g(7).xy, [0, 200, 20, 200]) && g(7).width === 4 && g(7).pathtype === 4 && g(7).bgnext === 2 && g(7).endext === 5 && g(7).layer === 3 && g(7).datatype === 1);
  ok('oasis hand file: text and two properties', leaf.texts[0].text === 'A1' && leaf.texts[0].layer === 9 && leaf.texts[0].texttype === 2 && leaf.texts[0].x === 1 && leaf.texts[0].y === 2 && leaf.texts[0].props.length === 2 && same(leaf.texts[0].props[1], { name: 'note', values: ['hi'] }));
  ok('oasis hand file: circle read as a 64-gon of radius 10', leaf.shapes.count(8) === 64 && same(g(8).xy.slice(0, 2), [510, 500]));
  const R = top.refs;
  ok('oasis hand file: placements, relative x', R.length === 7 && R[0].cell === 'LEAF' && R[0].x === 1000 && R[0].y === 500 && R[1].x === 2000 && R[1].angle === 90 && R[1].flip);
  ok('oasis hand file: magnification and angle reals', R[2].mag === 1.5 && R[2].angle === 45 && R[2].x === 1500);
  ok('oasis hand file: repetition 8, then reused', same(R[3].rep, { kind: 'lattice', nx: 2, ny: 2, ax: [10, 0], ay: [0, 20] }) && same(R[4].rep, R[3].rep) && R[4].x === 1600);
  ok('oasis hand file: repetition 4 (x list)', same(R[5].rep, { kind: 'list', d: [0, 0, 5, 0, 12, 0] }));
  ok('oasis hand file: repetition 11 (gridded free list)', same(R[6].rep, { kind: 'list', d: [0, 0, 10, 10] }));
  ok('oasis hand file: layer names kept for the layer map', r.lib.layerNames.length === 1 && LM.mapFromLayerNames(r.lib.layerNames).layers[0].name === 'M1');
  // CBLOCK made by node's own zlib (an independent DEFLATE): the same records, compressed
  const recs = body.subarray(13 + 1 + 4 + 1 + 2 + 1 + 12, endAt); // the records between START and END
  const z = zlib.deflateRawSync(Buffer.from(recs)); const C = [];
  for (const ch of '%SEMI-OASIS\r\n') C.push(ch.charCodeAt(0));
  for (const x of body.subarray(13, 13 + 1 + 4 + 1 + 2 + 1 + 12)) C.push(x);
  const uu = (v) => { do { let c = v % 128; v = Math.floor(v / 128); if (v) c |= 128; C.push(c); } while (v); };
  uu(34); uu(0); uu(recs.length); uu(z.length); for (const x of z) C.push(x); uu(2); uu(252); for (let k = 0; k < 252; k++) C.push(0); uu(0);
  const rz = O.readOasis(Uint8Array.from(C));
  ok('oasis: CBLOCK compressed by node\'s zlib reads to the same layout', errs(rz.problems).length === 0 && same(L.plainLib(rz.lib).cells, L.plainLib(r.lib).cells), rz.problems);
}

// ---- DEFLATE: our zlib copy against node's ----------------------------------------------------------------------------------
{
  const data = new Uint8Array(70000); for (let i = 0; i < data.length; i++) data[i] = (i * 31 + (i >> 7)) & 255 & (i % 300 < 150 ? 255 : 15);
  const ours = deflateRaw(data); ok('deflate: node inflates our raw deflate', Buffer.compare(zlib.inflateRawSync(Buffer.from(ours)), Buffer.from(data)) === 0);
  const theirs = zlib.deflateRawSync(Buffer.from(data), { level: 9 }); ok('deflate: we inflate node\'s raw deflate (dynamic Huffman)', same(inflateRawSized(new Uint8Array(theirs), data.length), data));
  let threw = false; try { inflateRawSized(new Uint8Array(theirs), 100); } catch { threw = true; } ok('deflate: a block larger than it says is refused', threw);
  ok('crc32: the check value of "123456789" is CBF43926', crc32(new TextEncoder().encode('123456789')) === 0xcbf43926);
}

// ---- layer maps ------------------------------------------------------------------------------------------------------------
{
  const txt = '# a map\n1/0 : NWELL\nMETAL1 5/0 #2E6FD1 drawing\nVIA1 6 0\nmetal2 drawing 7 0\n// comment\n5/1 : LABEL #2e6fd1\nnonsense here\n';
  const r = LM.readLayerMap(txt); const by = (n) => r.map.layers.find((l) => l.name === n);
  ok('layer map: four text forms read', r.map.layers.length === 5 && same(by('NWELL').gds, [1, 0]) && by('METAL1').color === '#2e6fd1' && by('METAL1').purpose === 'drawing' && same(by('VIA1').gds, [6, 0]) && by('metal2').purpose === 'drawing' && same(by('metal2').gds, [7, 0]) && by('LABEL').color === '#2e6fd1');
  ok('layer map: a line it cannot read is named', r.problems.length === 1 && r.problems[0].code === 'chip.fmt.map.line');
  const back = LM.readLayerMap(LM.writeLayerMapText(r.map)); ok('layer map: text round trip', same(back.map.layers, r.map.layers), diff(back.map.layers, r.map.layers));
  const j = LM.readLayerMap(LM.writeLayerMapJson(r.map)); ok('layer map: JSON round trip', same(j.map.layers.map((l) => ({ ...l })), r.map.layers.map((l) => ({ ...l }))));
  ok('layer map: lib/pcb\'s example map reads as our JSON', LM.readLayerMap(JSON.stringify(PG.EXAMPLE_LAYER_MAP)).map.layers.length === PG.EXAMPLE_LAYER_MAP.layers.length);
  ok('layer map: lookup and steady colours for unmapped layers', LM.layerInfo(r.map, 5, 0).name === 'METAL1' && !LM.layerInfo(r.map, 40, 3).mapped && LM.layerInfo(r.map, 40, 3).color === LM.autoColour(40, 3) && /^#[0-9a-f]{6}$/.test(LM.autoColour(40, 3)));
  ok('layer map: a doubled layer is noted', LM.readLayerMap('A 1/0\nB 1/0\n').problems.some((p) => p.code === 'chip.fmt.map.dup'));
  ok('layer map: bad JSON named', LM.readLayerMap('{ nope').problems[0].code === 'chip.fmt.map.json');
}

// ---- the fast view plan ----------------------------------------------------------------------------------------------------
{
  // TOP = a 100 × 100 array of C (one 10 × 10 square), pitch 20; plus FLAT with 10,000 squares 1 × 1 on a 100 × 100 grid of pitch 10 at x ≥ 5000
  const lib = L.newLib('v'), c = L.newCell(lib, 'C'); c.shapes.add(L.POLY, 1, 0, [0, 0, 10, 0, 10, 10, 0, 10]);
  const f = L.newCell(lib, 'FLAT'); for (let y = 0; y < 100; y++) for (let x = 0; x < 100; x++) f.shapes.add(L.POLY, 2, 0, [x * 10, y * 10, x * 10 + 1, y * 10, x * 10 + 1, y * 10 + 1, x * 10, y * 10 + 1]);
  const top = L.newCell(lib, 'TOP'); top.refs.push({ cell: 'C', x: 0, y: 0, flip: false, angle: 0, mag: 1, rep: { kind: 'lattice', nx: 100, ny: 100, ax: [20, 0], ay: [0, 20] } }, { cell: 'FLAT', x: 5000, y: 0, flip: false, angle: 0, mag: 1 });
  const ix = V.buildIndex(lib);
  ok('view: FLAT got a grid index', !!ix.cells.get('FLAT').grid && !ix.cells.get('C').grid);
  // window [0,0]–[105,105] at 1 px per unit: columns i with 20i ≤ 105 and 20i + 10 ≥ 0 → i = 0…5, same for rows → 36 placements
  const p1 = V.planView(ix, 'TOP', { x0: 0, y0: 0, x1: 105, y1: 105, scale: 1 });
  ok('view: only the visible part of an array is visited (6 × 6)', p1.stats.instances === 1 + 36 && p1.stats.shapes === 36 && p1.draws.filter((d) => d.cell === 'C' && d.idx === null).length === 25, p1.stats); // 5 × 5 wholly inside are instanced; the 11 on the edge are clipped
  ok('view: the rest of the array and FLAT are culled', p1.stats.culled >= 10000 - 36 && p1.stats.arraysCut === 1);
  // whole layout at 0.01 px per unit: each C placement is 0.1 px → the array is one outline box; FLAT is 10 px wide → drawn, but each square is 0.01 px → tiny
  const p2 = V.planView(ix, 'TOP', { x0: -100, y0: -100, x1: 7000, y1: 2100, scale: 0.01 }, { minPx: 4, tinyPx: 0.5 });
  ok('view: far away, the array becomes one outline box (level of detail)', p2.boxes.length === 1 && same(p2.boxes[0].array, [100, 100]) && p2.stats.lod === 10000 + 10000, p2.stats); // the array's 10,000 placements + FLAT's 10,000 shapes
  ok('view: far away, FLAT\'s 10,000 squares become a density view of its grid bins', p2.density.length === 1 && p2.density[0].cell === 'FLAT' && p2.density[0].bins.reduce((n, b) => n + b[4], 0) === 10000 && !p2.draws.some((d) => d.cell === 'FLAT'), p2.stats);
  const p2b = V.planView(ix, 'TOP', { x0: 4900, y0: -100, x1: 6100, y1: 1100, scale: 4 });
  ok('view: FLAT wholly in view at 4 px per unit is drawn whole (instanced, idx null)', p2b.draws.some((d) => d.cell === 'FLAT' && d.idx === null) && !p2b.density.length, p2b.stats);
  // zoom into FLAT: window x 5000…5095, y 0…95 → squares at 5000 + 10i (i = 0…9) and y 10j (j = 0…9) → 100 shapes, found through the grid
  const p3 = V.planView(ix, 'TOP', { x0: 5000, y0: 0, x1: 5095, y1: 95, scale: 4 });
  const fd = p3.draws.find((d) => d.cell === 'FLAT'); ok('view: grid query picks exactly the 100 visible squares', fd && fd.idx.length === 100, fd && fd.idx.length);
  const p4 = V.planView(ix, 'TOP', { x0: 5000, y0: 0, x1: 5095, y1: 95, scale: 0.2 }, { tinyPx: 0.5, densityPx: 0 });
  ok('view: shapes under half a pixel are counted as tiny', p4.stats.tiny === 100 && (p4.draws.find((d) => d.cell === 'FLAT')?.idx.length ?? 0) === 0, p4.stats);
  const p5 = V.planView(ix, 'TOP', { x0: -100, y0: -100, x1: 7000, y1: 2100, scale: 1 }, { maxShapes: 500 });
  ok('view: the plan stops at maxShapes and says so', p5.stats.truncated);
  const fv = V.fitView(ix, 'TOP', 800, 400); ok('view: fit shows the whole box', fv.x0 < 0 && fv.x1 > 5991 && fv.y1 > 1990 && fv.scale > 0);
  const z = V.zoomView({ x0: 0, y0: 0, x1: 100, y1: 100, scale: 1 }, 2, 50, 50); ok('view: zoom about a point', same(z, { x0: 25, y0: 25, x1: 75, y1: 75, scale: 2 }));
  // a row of 250 single 2 × 2 placements, seen at 0.01 px per unit: one outline box for the whole row, without visiting the 250
  const lw = L.newLib('w'); L.newCell(lw, 'S').shapes.add(L.POLY, 1, 0, [0, 0, 2, 0, 2, 2, 0, 2]); const rowc = L.newCell(lw, 'ROW'); for (let k = 0; k < 250; k++) rowc.refs.push({ cell: 'S', x: k * 4, y: 0, flip: false, angle: 0, mag: 1 });
  L.newCell(lw, 'T').refs.push({ cell: 'ROW', x: 0, y: 0, flip: false, angle: 0, mag: 1 });
  const pw = V.planView(V.buildIndex(lw), 'T', { x0: -10, y0: -10, x1: 1010, y1: 20, scale: 1 });
  ok('view: a row of tiny cells is one outline box', pw.boxes.length === 1 && pw.boxes[0].group === 250 && same(pw.boxes[0].box, [0, 0, 998, 2]) && pw.stats.instances === 2, pw.stats);
  // rotated and mirrored placements are culled by their turned boxes
  const lr = L.newLib('r'); L.newCell(lr, 'C').shapes.add(L.POLY, 1, 0, [0, 0, 100, 0, 100, 10, 0, 10]); L.newCell(lr, 'T').refs.push({ cell: 'C', x: 0, y: 0, flip: false, angle: 90, mag: 1 });
  const ir = V.buildIndex(lr); ok('view: a 90° placement covers x −10…0, y 0…100', V.planView(ir, 'T', { x0: -5, y0: 50, x1: -1, y1: 60, scale: 10 }).stats.shapes === 1 && V.planView(ir, 'T', { x0: 50, y0: 0, x1: 60, y1: 5, scale: 10 }).stats.shapes === 0);
}

// ---- open.js, panels model, panels contract, strings ------------------------------------------------------------------------
{
  ok('open: kinds by content', F.kindOf('x', fx('demo.lib')) === 'liberty' && F.kindOf('x', fx('demo.lef')) === 'lef' && F.kindOf('x', fx('demo.def')) === 'def' && F.kindOf('x', fx('demo.sdc')) === 'sdc' && F.kindOf('x', fx('demo.spef')) === 'spef' && F.kindOf('x', fx('demo.sdf')) === 'sdf');
  ok('open: GDSII and OASIS by their first bytes', F.kindOf('a.bin', G.writeGds(sample())) === 'gds' && F.kindOf('a.bin', O.writeOasis(sample())) === 'oasis');
  const o = F.openFile('demo.lef', fx('demo.lef')); ok('open: reads and tags problems with the file', o.kind === 'lef' && o.model.macros.length === 3);
  const bad = F.openFile('x.lef', 'MACRO X\nEND X\n'); ok('open: problem ids carry the file name', bad.problems.length && bad.problems.every((p) => p.id.endsWith(':x.lef')));
  ok('open: not a chip file', F.openFile('a.txt', 'hello').kind === null);
  const lib = G.readGds(G.writeGds(sample())).lib;
  const lr = PM.layerRows(lib, LM.readLayerMap('METAL 1/0 #112233').map, 'TOP'); ok('panel model: layer rows', lr.length === 5 && lr[0].name === 'METAL' && lr[0].color === '#112233' && lr[0].flat === 14 && !lr[1].mapped);
  const hr = PM.hierarchyRows(lib, 'TOP', new Set(['TOP'])); ok('panel model: hierarchy rows', hr.length === 2 && hr[1].name === 'A' && hr[1].depth === 1 && hr[1].placed === 14 && PM.defaultTop(lib) === 'TOP');
  const libr = PM.libraryRows(Lib.libertyModel(Lib.readLiberty(fx('demo.lib')).tree), lefM); ok('panel model: Liberty and LEF joined per cell', libr.length === 3 && libr.find((r) => r.name === 'INV_X1').area === 1.2 && same(libr.find((r) => r.name === 'INV_X1').size, [0.8, 3.6]) && libr.find((r) => r.name === 'DFF_X1').seq === 'flip-flop');
  ok('panel model: vectors parsed', same(PM.parseVectors('0 1 X\n\n# c\nP1H'), ['01X', 'P1H']));
  const UI = await import('../ui.js');
  const P = UI.panels({ files: { list: () => [], read: () => '', readBytes: () => new Uint8Array(), write: () => {} }, problems: { set() {} }, t: (k) => k });
  ok('panels: three panels with id, title and mount', P.length === 3 && same(P.map((p) => p.id), ['chip-layout', 'chip-library', 'chip-constraints']) && P.every((p) => typeof p.mount === 'function' && typeof p.title === 'string' && p.title && !p.title.startsWith('chip.')), P.map((p) => p.title));
  ok('panels: words() fills variables and falls back to the key', UI.words({ t: (k, v) => (k === 'a' ? 'x {n} y' : k) })('a', { n: 3 }) === 'x 3 y');
  const en = JSON.parse(fx('../../strings.en.json')), es = JSON.parse(fx('../../strings.es-MX.json'));
  ok('strings: en and es-MX have the same keys', same(Object.keys(en).sort(), Object.keys(es).sort()));
  const src = ['ui.js', 'panels-model.js'].map((n) => fs.readFileSync(fileURLToPath(new URL('../' + n, import.meta.url)), 'utf8')).join('\n');
  const used = [...src.matchAll(/'(chip\.(?:fmt|lay)\.[a-z0-9_.]+)'/g)].map((m) => m[1]).filter((k) => !k.endsWith('.') && !/^chip\.fmt\.(layout|layermap|library|constraints|write|stil)$/.test(k));
  const missing = [...new Set(used)].filter((k) => !(k in en)); ok('strings: every key the panels use is in en', missing.length === 0, missing);
  ok('strings: the four exception rows have words', ['false_path', 'multicycle_path', 'max_delay', 'min_delay'].every((k) => en['chip.fmt.sdc.' + k]));
  ok('strings: all keys are chip.fmt.* or chip.lay.*', Object.keys(en).every((k) => /^chip\.(fmt|lay)\./.test(k)));
}

// ---- optional: the generated big layout ------------------------------------------------------------------------------------
if (process.argv.includes('--big')) {
  const dir = '/var/www/CADCRAFT/testfiles/generated/chip/', gf = dir + 'layout-1m-shapes.gds', of = dir + 'layout-1m-shapes.oas';
  if (!fs.existsSync(gf) || !fs.existsSync(of)) console.log('skip --big: run lib/chip/fmt/test/gen-big.mjs once (files are listed in testfiles/LARGE-FILES.md)');
  else {
    let t = Date.now(); const g = G.readGds(new Uint8Array(fs.readFileSync(gf))); const tg = Date.now() - t; t = Date.now(); const o = O.readOasis(new Uint8Array(fs.readFileSync(of))); const to = Date.now() - t;
    const sg = L.layoutStats(g.lib, 'TOP'), so = L.layoutStats(o.lib, 'TOP');
    ok('big: GDSII and OASIS hold the same counts', sg.stored === so.stored && sg.flatShapes === so.flatShapes && sg.stored > 1e6, { sg: sg.stored, so: so.stored });
    t = Date.now(); const ix = V.buildIndex(o.lib); const ti = Date.now() - t; t = Date.now(); const fv = V.fitView(ix, 'TOP', 1600, 1000), pf = V.planView(ix, 'TOP', fv); const tp = Date.now() - t;
    ok('big: whole-layout plan under 2 s with level of detail', tp < 2000 && !pf.stats.truncated, pf.stats);
    console.log('big: read GDSII ' + tg + ' ms, OASIS ' + to + ' ms, index ' + ti + ' ms, fit plan ' + tp + ' ms; stored ' + sg.stored + ', placed out ' + sg.flatShapes);
  }
}

console.log(`lib/chip/fmt: ${pass} passed, ${fail} failed (${Date.now() - t0} ms)`);
process.exit(fail ? 1 : 0);
