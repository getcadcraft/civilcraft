/* SPDX-License-Identifier: Apache-2.0 */
const { ok, eq, section, fixture, mine } = globalThis.__chipTest;
const V = await mine('verilog.js');
const N = await mine('netlist.js');
const mods = (...texts) => texts.flatMap((t, i) => V.parseVerilog(t, { file: 'f' + i + '.v' }).modules);
const net = (nl, name) => nl.nets.find((n) => n.name === name);
const cell = (nl, name) => nl.cells.find((c) => c.name === name);
const pinNet = (nl, c, p) => { const x = cell(nl, c).pins.find((q) => q.name === p); return x && x.net ? nl.nets.find((n) => n.id === x.net).name : null; };
const codes = (nl) => nl.problems.map((p) => p.code);

section('Netlist: tool-style gate netlist');
{
  const nl = N.buildNetlist(V.parseVerilog(fixture('yosys_netlist.v'), { file: 'n.v' }).modules, 'cnt2');
  eq([nl.format, nl.version, nl.module], ['cc-chip-netlist', 1, 'cnt2'], 'format');
  eq(N.netlistStats(nl), { cells: 6, nets: 8, ports: 3, bits: 4, kinds: { cell: 5, tie: 1 } }, 'five cells and one tie, eight nets');
  eq(nl.ports.map((p) => p.name + ':' + p.dir + ':' + p.bits.map((b) => nl.nets.find((n) => n.id === b).name).join(',')), ['clk:in:clk', 'en:in:en', 'q:out:q[1],q[0]'], 'ports bit-blasted MSB first');
  eq(net(nl, 'next[0]').pins, ['C1.Y', 'C4.D'], 'escaped name next[0] joins XOR output and DFF input');
  eq(net(nl, 'q[0]').pins, ['C1.A', 'C2.A', 'C4.Q'], 'q[0] fans out to two gates');
  eq([net(nl, '_1_').names, net(nl, '_1_').const], [['_1_', '_2_'], '0'], 'assign chain _2_ = _1_ = 1\'b0 merges into one tied net');
  eq(cell(nl, '_6_').pins.map((p) => p.name + ':' + p.dir), ['C:in', 'D:in', 'Q:out'], 'tool cell pin directions');
  ok(cell(nl, '_6_').seq && !cell(nl, '_3_').seq, 'flip-flops marked sequential');
  eq(nl.problems.filter((p) => p.severity !== 'note').length, 0, 'no errors or warnings');
}

section('Netlist: modules, buses, wiring');
{
  const ms = V.parseVerilog(fixture('two_stage.v'), { file: 'two_stage.v' }).modules.concat(V.parseVerilog(fixture('alu.v'), { file: 'alu.v' }).modules);
  const nl = N.buildNetlist(ms, 'pipe2');
  eq(N.netlistStats(nl).kinds, { module: 4 }, 'four module cells');
  eq(nl.nets.length, 28, '28 one-bit nets');
  eq(pinNet(nl, 'u_alu', 'y[3]'), 'y[3]', 'alu y[3] on y[3]');
  eq(net(nl, 'y[3]').pins, ['C3.y[3]', 'C4.d[3]'], 'y[3] drives out_reg d[3]');
  eq(cell(nl, 'rb').pins.map((p) => p.name), ['clk', 'd[3]', 'd[2]', 'd[1]', 'd[0]', 'q[3]', 'q[2]', 'q[1]', 'q[0]'], 'positional instance: pins from the module, widths from #(4)');
  eq(cell(nl, 'out_reg').pins.length, 9, 'default W=4 when no override');
  eq(codes(nl).filter((c) => c !== 'net.behavioural'), [], 'clean');
}
{
  const nl = N.buildNetlist(mods(`module w(input [3:0] a, input b, output [1:0] y, output [3:0] z, output [5:0] r, output [3:0] u);
  assign y = {a[0], 1'b1};
  assign z = a[3:0];
  assign r = {2{a[2:1], b}};
  assign u = a[0 +: 4] ;
endmodule`), 'w');
  eq([net(nl, 'y[0]').const, pinNet(nl, "1'b1", 'Y')], ['1', 'y[0]'], "y[0] tied to 1'b1 by a tie cell");
  eq(net(nl, 'a[0]').names, ['a[0]', 'u[0]', 'y[1]', 'z[0]'], 'y[1], z[0] and u[0] (a[0 +: 4]) are a[0]');
  eq(net(nl, 'a[3]').names, ['a[3]', 'u[3]', 'z[3]'], 'part selects keep bit order');
  eq(net(nl, 'b').names, ['b', 'r[0]', 'r[3]'], 'replication repeats b');
  eq(net(nl, 'a[2]').names, ['a[2]', 'r[2]', 'r[5]', 'u[2]', 'z[2]'], 'replication repeats a[2]');
  ok(nl.problems.some((p) => p.code === 'net.unknown') === false, 'no unknown names');
}
{
  const nl = N.buildNetlist(mods(`module w(input [3:0] a, output [3:0] u); assign u = a[3:2]; endmodule`), 'w');
  eq(codes(nl).includes('net.width'), true, 'width mismatch on assign is a warning');
  eq(net(nl, 'a[3]').names, ['a[3]', 'u[1]'], 'narrow value lands on the low bits');
  eq(nl.nets.find((n) => n.names.includes('u[3]')).const, '0', 'high bits zero-filled');
}

section('Netlist: checks');
{
  const two = N.buildNetlist(mods('module m(input a, input b, output y); assign y = a; assign y = b; endmodule'), 'm');
  eq(two.problems.filter((p) => p.code === 'net.multi').map((p) => p.severity + ': ' + p.text), ['error: Net a is driven by 2 outputs: a, b'], 'two inputs shorted by assigns: more than one driver');
  const lib = { AND2: { pins: { A: 'in', B: 'in', Y: 'out' } } };
  const und = N.buildNetlist(mods('module m(input a, output y); wire w; AND2 g(.A(a), .B(w), .Y(y)); endmodule'), 'm', { cells: lib });
  eq(und.problems.filter((p) => p.code === 'net.undriven').map((p) => p.text), ['Net w feeds g pin B but nothing drives it'], 'undriven input');
  eq(und.problems.filter((p) => p.code === 'net.dir').length, 0, 'cell library gives exact directions');
  const g2 = N.buildNetlist(mods('module m(input a, output y); AND2 g(.A(a), .B(a), .Y(y)); endmodule'), 'm');
  eq(g2.problems.filter((p) => p.code === 'net.dir').map((p) => p.msg.vars.pin + '=' + p.msg.vars.dir), ['A=in', 'B=in', 'Y=out'], 'guessed directions are noted');
  const fl = N.buildNetlist(mods('module s(input i, input j, output o); assign o = i; endmodule\nmodule m(input a, output y); s u(.i(a), .o(y)); endmodule'), 'm');
  eq(fl.problems.filter((p) => p.code === 'net.floating').map((p) => p.text), ['Pin j of u is not connected'], 'open input pin');
  const wid = N.buildNetlist(mods('module s(input [2:0] i, output o); assign o = i[0]; endmodule\nmodule m(input [3:0] a, output y); s u(.i(a[1:0]), .o(y)); endmodule'), 'm');
  eq(wid.problems.filter((p) => p.code === 'net.width').map((p) => p.text), ['Pin i of u is 3 bits wide but is connected to 2 bits'], 'pin width mismatch');
  const un = N.buildNetlist(mods('module m(output y); BUF b(.A(nope), .Y(y)); endmodule'), 'm');
  ok(un.nets.some((n) => n.name === 'nope'), 'implicit net from a port connection');
  eq(N.buildNetlist([], 'zz').problems.map((p) => p.code), ['net.nomodule'], 'unknown module');
  const pos = N.buildNetlist(mods('module m(input a, output y); MYSTERY u (y, a); endmodule'), 'm');
  eq([pos.problems.filter((p) => p.code === 'net.positional').length, cell(pos, 'u').pins.map((p) => p.name)], [1, ['1', '2']], 'positional pins on an unknown cell are numbered');
}

section('Netlist: gates and behavioural code');
{
  const g = N.buildNetlist(mods('module m(input a, b, output y, n); xor x1 (y, a, b); not (n, y); endmodule'), 'm');
  eq(g.cells.map((c) => c.kind + ':' + c.type + ':' + c.pins.map((p) => p.name + p.dir[0]).join(',')), ['gate:xor:Yo,Ai,Bi', 'gate:not:Yo,Ai'], 'gate pins: output first');
  eq(net(g, 'y').pins, ['C1.Y', 'C2.A'], 'gate chain');
  const c = N.buildNetlist(V.parseVerilog(fixture('counter.v'), { file: 'counter.v' }).modules, 'counter');
  eq(N.netlistStats(c).kinds, { expr: 1, always: 1 }, 'counter: one expression box, one always box');
  const al = c.cells.find((x) => x.kind === 'always');
  eq([al.type, al.seq, al.pins.filter((p) => p.dir === 'out').length, al.pins.filter((p) => p.dir === 'in').length], ['$always_ff', true, 8, 11], 'always_ff box: 8 count bits out; clk, rst, en and 8 count bits in');
  eq(c.cells.find((x) => x.kind === 'expr').op, '& ==', 'expression box labelled by its operators');
  ok(c.problems.some((p) => p.code === 'net.behavioural' && p.severity === 'note'), 'behavioural note');
  const gen = N.buildNetlist(mods('module g(input [1:0] a, output [1:0] y); genvar k; generate for (k = 0; k < 2; k = k + 1) begin : b not u (y[k], a[k]); end endgenerate endmodule'), 'g');
  eq([gen.cells.length, gen.problems.filter((p) => p.code === 'net.generate').length], [0, 1], 'generate not unrolled, said so');
  eq(N.pinDir('X', 'QN').dir, 'out', 'QN guessed as output');
  eq(N.pinDir('$_MUX_', 'S'), { dir: 'in', sure: true }, 'tool cell select is an input');
  eq(N.pinDir('LIB', 'S', { LIB: { pins: { S: 'out' } } }), { dir: 'out', sure: true }, 'library wins');
}
