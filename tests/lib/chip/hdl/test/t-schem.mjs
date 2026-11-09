/* SPDX-License-Identifier: Apache-2.0 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { ok, eq, section, fixture, mine, ROOT } = globalThis.__chipTest;
const S = await import(pathToFileURL(path.join(ROOT, 'lib/schematic/index.js')).href);
const V = await mine('verilog.js');
const N = await mine('netlist.js');
const SC = await mine('schem.js');
const UN = await mine('ui-netlist.js');
const nlOf = (text, name, opts) => N.buildNetlist(V.parseVerilog(text, { file: 'f.v' }).modules, name, opts);
const lib = { BUF: { pins: { A: 'in', Y: 'out' } } };

section('Schematic model on lib/schematic');
{
  const nl = nlOf(fixture('yosys_netlist.v'), 'cnt2');
  const sch = SC.toSchematic(nl, S);
  ok(sch instanceof S.Schematic, 'a cc-schematic Schematic');
  eq(sch.symbols.length, nl.cells.length + 4, 'one symbol per cell and per port bit');
  const wires = nl.nets.reduce((a, n) => a + Math.max(0, n.pins.length + nl.ports.reduce((k, p) => k + p.bits.filter((b) => b === n.id).length, 0) - 1), 0);
  eq(sch.wires.length, wires, 'pins − 1 wires per net');
  eq(sch.validate(), [], 'the engine finds nothing wrong with the model');
  const built = S.buildNets(sch);
  eq(built.nets.filter((n) => n.pins.length > 1).length, nl.nets.filter((n) => n.pins.length + nl.ports.reduce((k, p) => k + p.bits.filter((b) => b === n.id).length, 0) > 1).length, 'engine nets = our connected nets');
  const json = JSON.parse(JSON.stringify(sch.toJSON()));
  const back = S.read(json);
  eq([back.schematic.symbols.length, back.problems.filter((p) => p.severity === 'error').length], [sch.symbols.length, 0], 'saves and reads back as a cc-schematic file');
  eq(SC.checkWithEngine(nl, S).problems, [], 'engine checks: clean netlist, no rows');
}
{
  const nl = nlOf('module m(input a, output y); BUF b1(.A(a), .Y(y)); BUF b2(.A(a), .Y(y)); endmodule', 'm', { cells: lib });
  const eng = SC.checkWithEngine(nl, S).problems;
  eq(eng.map((p) => p.code + ':' + p.msg.vars.net), ['net.multi:y'], 'engine finds two outputs on y');
  eq(eng[0].line, 1, 'row points at the source line');
  const und = nlOf('module m(output y, z); wire w; BUF b(.A(w), .Y(y)); BUF c(.A(w), .Y(z)); endmodule', 'm', { cells: lib });
  eq(SC.checkWithEngine(und, S).problems.map((p) => p.code + ':' + p.msg.vars.net + ':' + p.msg.vars.inst + '.' + p.msg.vars.pin), ['net.undriven:w:b.A', 'net.undriven:w:c.A'], 'engine finds inputs with no source');
  const v = UN.netlistView(V.parseVerilog('module m(input a, output y); BUF b1(.A(a), .Y(y)); BUF b2(.A(a), .Y(y)); endmodule', { file: 'f.v' }).modules, 'm', { schematic: S, cells: lib });
  eq(v.problems.filter((p) => p.code === 'net.multi').length, 1, 'the panel keeps one row when ours and the engine agree');
}

section('Layout and SVG');
{
  const nl = nlOf(fixture('yosys_netlist.v'), 'cnt2');
  const lay = SC.layoutNetlist(nl, S), lay2 = SC.layoutNetlist(nl);
  const byId = new Map(lay.nodes.map((n) => [n.id, n]));
  eq([byId.get('P:clk').level, byId.get('P:en').level], [0, 0], 'inputs in column 0');
  const maxL = Math.max(...lay.nodes.map((n) => n.level));
  eq([byId.get('P:q[0]').level, byId.get('P:q[1]').level], [maxL, maxL], 'outputs in the last column');
  ok(lay.nodes.every((n) => n.kind === 'port' || (n.level > 0 && n.level < maxL)), 'cells between');
  const xor = nl.cells.find((c) => c.name === '_3_').id, dff = nl.cells.find((c) => c.name === '_6_').id, xor2 = nl.cells.find((c) => c.name === '_5_').id;
  ok(byId.get(xor2).level > byId.get(nl.cells.find((c) => c.name === '_4_').id).level, 'the second XOR comes after the AND that feeds it');
  ok(byId.get(xor).level !== byId.get(dff).level, 'feedback broken: DFF and its XOR in different columns');
  const allPins = new Map(); for (const n of lay.nodes) for (const p of n.pins) allPins.set(n.id + '.' + p.id, p);
  let good = true, count = 0;
  for (const w of lay.wires) for (const s of w.segs) { count++; for (const pt of s) if (!Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) good = false; for (let k = 1; k < s.length; k++) if (s[k][0] !== s[k - 1][0] && s[k][1] !== s[k - 1][1]) good = false; }
  ok(good && count > 0, 'every wire is orthogonal with finite points');
  const ends = lay.wires.flatMap((w) => w.segs.map((s) => s[s.length - 1]));
  ok(ends.every((e) => [...allPins.values()].some((p) => p.x === e[0] && p.y === e[1])), 'every wire ends on a pin');
  ok(lay.nodes.every((a) => lay.nodes.every((b) => a === b || a.level !== b.level || a.y + a.h <= b.y || b.y + b.h <= a.y)), 'boxes in a column do not overlap');
  eq(JSON.stringify(lay2.nodes.map((n) => [n.id, n.level])), JSON.stringify(lay.nodes.map((n) => [n.id, n.level])), 'same placement with and without the engine connectivity');
  const svg = SC.renderSvg(lay, { title: 'cnt2' });
  ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), 'SVG text');
  eq((svg.match(/data-net=/g) || []).length, lay.wires.filter((w) => w.segs.length).length, 'one path per net');
  eq((svg.match(/data-cell=/g) || []).length, lay.nodes.length, 'one group per box');
  eq(SC.renderSvg(SC.layoutNetlist(nl, S)), SC.renderSvg(lay), 'deterministic');
  ok(SC.renderSvg(lay, { highlight: lay.wires[0].net }).includes('class="w hl"'), 'highlighted net');
  const esc = nlOf('module m(input \\a<b , output y); BUF u(.A(\\a<b ), .Y(y)); endmodule', 'm', { cells: lib });
  const s2 = SC.renderSvg(SC.layoutNetlist(esc));
  ok(s2.includes('a&lt;b') && !s2.includes('a<b'), 'names are escaped');
  const big = { module: 'big', ports: [], nets: [], cells: Array.from({ length: SC.LIMITS.cells + 1 }, (_, i) => ({ id: 'C' + i, pins: [] })) };
  const bl = SC.layoutNetlist(big);
  ok(bl.tooBig && SC.renderSvg(bl, { tooBigText: 'too big' }).includes('too big'), 'over the limit: a message, not a drawing');
  const c = SC.layoutNetlist(N.buildNetlist(V.parseVerilog(fixture('counter.v'), { file: 'counter.v' }).modules, 'counter'), S);
  eq(c.selfLoops, 8, 'counter: 8 count bits feed back into their own box and are not drawn round it');
}
