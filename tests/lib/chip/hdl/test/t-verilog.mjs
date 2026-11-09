/* SPDX-License-Identifier: Apache-2.0 */
const { ok, eq, section, fixture, mine } = globalThis.__chipTest;
const V = await mine('verilog.js');
const P = (t, o = {}) => V.parseVerilog(t, { file: 'x.v', ...o });
const codes = (r) => r.problems.map((p) => p.code + '@' + p.line + ':' + p.col);

section('Verilog tokenizer');
{
  const t = V.tokenize("4'b1010 8'hF 'hA 3'bx1 12 '1 8'sd5 16'h_ff_ \\next[0]  $display a_b").tokens;
  eq(t[0].bits, '1010', "4'b1010 bits");
  eq(t[1].bits, '00001111', "8'hF zero-extended");
  eq([t[2].width, t[2].unsized, t[2].value], [32, true, 10], "'hA unsized 32-bit");
  eq(t[3].bits, 'xx1', "3'bx1 extends with x");
  eq([t[4].value, t[4].unsized], [12, true], 'decimal 12');
  eq(t[5].fill, '1', "SV '1 fill");
  eq([t[6].value, t[6].signed], [5, true], "8'sd5 signed");
  eq(t[7].value, 255, "underscores in 16'h_ff_");
  eq([t[8].t, t[8].v], ['id', 'next[0]'], 'escaped identifier ends at white space');
  eq([t[9].t, t[10].v], ['sys', 'a_b'], 'system name, then identifier');
  const a = V.tokenize('(* keep = 1 *) wire x; always @(*) y = x;').tokens.map((x) => x.v);
  ok(a[0] === 'wire', 'attribute (* *) skipped');
  ok(a.includes('*') && a.indexOf('*') === a.indexOf('(') + 1, '@(*) is not an attribute');
  const c = V.tokenize('a /* never closed').problems;
  eq(c.map((p) => [p.code, p.line, p.col]), [['lex.comment', 1, 3]], 'open block comment at 1:3');
  const s = V.tokenize('"abc\nx').problems;
  eq(s.map((p) => p.code), ['lex.string'], 'string not closed');
  eq(V.tokenize("8'b102").problems.map((p) => p.code), ['lex.number'], "8'b102 is a bad number");
}

section('Verilog fixtures');
{
  const r = P(fixture('counter.v'), { file: 'counter.v' });
  eq(r.problems.length, 0, 'counter.v clean');
  const m = r.modules[0];
  eq([m.name, m.ports.map((p) => p.name + ':' + p.dir)], ['counter', ['clk:input', 'rst:input', 'en:input', 'count:output', 'wrap:output']], 'counter ports');
  const env = V.paramEnv(m);
  eq(env.WIDTH, 8, 'WIDTH from `define = 8');
  eq(V.rangeBits(m.ports[3].width, env).width, 8, 'count is 8 bits');
  eq(V.paramEnv(m, [{ name: null, expr: { k: 'num', value: 4 } }]).WIDTH, 4, 'positional override #(4)');
  eq(m.blocks.length, 1, 'one always block');
  eq(m.blocks[0].edges, [{ edge: 'posedge', name: 'clk' }], 'posedge clk');
  eq(m.blocks[0].writes, ['count'], 'writes count');
  eq(m.blocks[0].reads, ['clk', 'count', 'en', 'rst'], 'reads');
  eq(m.assigns.length, 1, 'one assign');
}
{
  const r = P(fixture('alu.v'), { file: 'alu.v' });
  eq(r.problems.length, 0, 'alu.v clean (localparam, case, default, @(*))');
  eq(r.modules[0].params.map((p) => p.name + (p.local ? '*' : '')), ['N', 'ADD*', 'SUB*', 'AND_*', 'OR_*'], 'parameters and localparams');
  eq(V.rangeBits(r.modules[0].ports[0].width, V.paramEnv(r.modules[0])).width, 4, 'a is N=4 bits');
  eq(r.modules[0].ports.map((p) => p.name), ['a', 'b', 'op', 'y', 'zero'], 'ANSI ports with shared direction');
}
{
  const r = P(fixture('two_stage.v'), { file: 'two_stage.v' });
  eq(r.problems.length, 0, 'two_stage.v clean');
  eq(r.modules.map((m) => m.name), ['stage_reg', 'pipe2', 'pipe2_tb', 'spare_block'], 'four modules');
  const p = r.modules[1];
  eq(p.instances.map((i) => i.type + ':' + i.name + ':' + (i.named ? 'n' : 'p') + i.conns.length), ['stage_reg:ra:n3', 'stage_reg:rb:p3', 'alu:u_alu:n5', 'stage_reg:out_reg:n3'], 'pipe2 instances');
  eq(p.instances[0].params.map((x) => x.name), ['W'], 'named parameter override');
  eq(p.instances[1].params.map((x) => x.expr.value), [4], 'positional #(4)');
  eq(r.modules[2].ports.length, 0, 'test bench has no ports');
}
{
  const r = P(fixture('bad.v'), { file: 'bad.v' });
  eq(codes(r), ['syn.expect@1:40', 'syn.expect@3:18', 'sem.undeclared@4:18', 'syn.expect@9:14'], 'bad.v: four errors at their places');
  ok(r.problems.every((p) => p.severity === 'error' && p.file === 'bad.v'), 'all errors, file set');
  eq(r.problems[0].text, 'Expected ";" after the module header but found "wire"', 'missing ; message');
  eq(r.problems[2].text, 'c is not declared in bad', 'undeclared message');
  eq(r.modules.map((m) => m.name), ['bad', 'bad2'], 'both modules still read');
}
{
  const r = P(fixture('yosys_netlist.v'), { file: 'n.v' });
  eq(r.problems.length, 0, 'netlist fixture clean (attributes, escaped names)');
  eq(r.modules[0].instances.map((i) => i.type), ['$_XOR_', '$_AND_', '$_XOR_', '$_DFF_P_', '$_DFF_P_'], 'escaped cell types');
  eq(r.modules[0].ports.map((p) => p.dir), ['input', 'input', 'output'], 'non-ANSI port directions');
}

section('Verilog syntax and checks');
{
  const r = P('module a(input x);\n  wire w;\n');
  ok(r.problems.some((p) => p.code === 'syn.eof' && /endmodule is missing/.test(p.text)), 'missing endmodule');
  eq(codes(P('module a; endmodule : b')), ['syn.endname@1:23'], 'end name mismatch');
  eq(codes(P('module a; wire w; wire w; endmodule')), ['sem.dupdecl@1:24'], 'duplicate declaration');
  eq(codes(P('module a(x); endmodule')), ['sem.portdir@1:10'], 'non-ANSI port without direction');
  eq(codes(P('module a(input x); output y; endmodule')), ['sem.dupdecl@1:27'], 'ANSI module: a second port declaration is an error');
  eq(codes(P('module a(x); input x; output y; endmodule')), ['sem.portnotlisted@1:30'], 'port declared but not listed');
  const imp = P('module a(input x); sub s(.i(x), .o(nn)); endmodule');
  eq(codes(imp), ['sem.implicit@1:36'], 'implicit net is a note');
  eq(imp.problems[0].severity, 'note', 'note severity');
  eq(codes(P('module a(input x, output y); assign y = x & ;\nendmodule')), ['syn.expect@1:45'], 'expression error');
  eq(codes(P('module a(input [3:0] x, output y); assign y = x[1] ? x[2] : ^x[3:1];\nendmodule')), [], 'ternary, bit and part select, reduction');
  eq(codes(P('module a(input [7:0] x, output [3:0] y); assign y = x[2 +: 4] | x[7 -: 4] | {2{x[1:0]}} | {x[0], 3\'b0};\nendmodule')), [], 'indexed part select, replication, concat');
  // statements
  const st = P(`module s(input clk, input [3:0] d, output reg [3:0] q, output reg [3:0] r);
  integer i;
  function [3:0] inc(input [3:0] v); begin inc = v + 1; end endfunction
  task nothing; begin end endtask
  always @(posedge clk or negedge d[0]) begin : blk
    for (i = 0; i < 4; i = i + 1) q[i] <= d[3 - i];
    case (d) 4'b0000, 4'b0001: r <= 0; default: r <= inc(d); endcase
    casez (d) 4'b1???: r <= 1; endcase
    if (d == 0) r <= 1; else if (d == 1) r <= 2; else r <= 3;
    repeat (2) @(posedge clk);
    #1 $display("q=%d", q);
    nothing;
  end
  initial begin while (0) begin end forever #5 ; end
endmodule`);
  eq(codes(st), [], 'statements: for, case, casez, if/else, repeat, delays, system and user tasks, functions');
  eq(st.modules[0].blocks[0].edges, [{ edge: 'posedge', name: 'clk' }, { edge: 'negedge', name: 'd' }], 'edges from the leading event control only');
  const sv = P(`module sv(input logic clk, input logic [3:0] d, output logic [3:0] q, output logic z);
  logic [3:0] t;
  always_ff @(posedge clk) q <= d;
  always_comb begin t = '0; unique case (d) 4'd1: t = '1; default: t = d; endcase end
  always_comb for (int k = 0; k < 4; k++) z = t[k];
endmodule`);
  eq(codes(sv), [], 'SystemVerilog-lite: logic, always_ff/comb, fills, unique case, int loop variable, ++');
  eq(sv.modules[0].blocks.map((b) => b.kind), ['always_ff', 'always_comb', 'always_comb'], 'block kinds');
  const gen = P(`module g #(parameter N = 3) (input [N-1:0] a, output [N-1:0] y);
  genvar k;
  generate for (k = 0; k < N; k = k + 1) begin : bits
    not u (y[k], a[k]);
  end endgenerate
  if (N > 2) begin : extra wire e; end
endmodule`);
  eq(codes(gen), [], 'generate for/if');
  ok(gen.modules[0].hasGenerate && gen.modules[0].instances[0].inGenerate, 'instance inside generate marked');
  const gates = P('module q(input a, b, output y, n); and g1 (y, a, b); not (n, a); endmodule');
  eq(gates.modules[0].instances.map((i) => i.type + ':' + i.gate + ':' + i.conns.length), ['and:true:3', 'not:true:2'], 'gate primitives, named and unnamed');
  const star = P('module q(input a, output y); sub s (.*); sub t (.a, .y()); endmodule');
  eq(star.modules[0].instances.map((i) => i.conns.map((c) => c.port)), [['*'], ['a', 'y']], '.* and .name connections');
}

section('Verilog preprocessor');
{
  const r = P('`define ADD(a,b) ((a)+(b))\n`define ONE 1\nmodule m(input [3:0] x, output [3:0] y);\n`ifdef NOPE\n  garbage here\n`else\n  assign y = `ADD(x, `ONE);\n`endif\nendmodule');
  eq(codes(r), [], 'macro with arguments, nested macro, ifdef/else/endif');
  eq(r.modules[0].assigns[0].rhs.op, '+', 'expanded to a +');
  eq(codes(P('`ifdef X\nmodule m; endmodule\n')), ['pp.unclosed@1:1'], 'unclosed ifdef');
  eq(codes(P('`endif\nmodule m; endmodule')), ['pp.endif@1:1'], 'stray endif');
  eq(codes(P('module m; wire [`W-1:0] x; endmodule')).slice(0, 1), ['pp.macro@1:17'], 'undefined macro');
  eq(codes(P('`include "defs.vh"\nmodule m; endmodule')), ['pp.include@1:1'], 'include of a file not in the project is a warning');
  const inc = P('`include "defs.vh"\nmodule m(output [`W-1:0] y); assign y = 0; endmodule', { include: (n) => (n === 'defs.vh' ? '`define W 6' : null) });
  eq([codes(inc), V.rangeBits(inc.modules[0].ports[0].width, {}).width], [[], 6], 'include from the project defines W');
  eq(codes(P('module m; wire w; endmodule', { defines: { X: '1' } })), [], 'defines option');
  ok(P('`ifdef X\nmodule m; wire w; endmodule\n`endif', { defines: { X: '' } }).modules.length === 1, 'ifdef sees a define from options');
}

section('Constant evaluation and limits');
{
  const e = (s, env = {}) => { const r = P('module m; localparam Z = ' + s + '; endmodule'); return V.evalConst(r.modules[0].params[0].expr, env); };
  eq(e('$clog2(9)'), 4, '$clog2(9) = 4');
  eq(e('2**3+1'), 9, '2**3+1');
  eq(e('(4 > 3) ? 10 : 20'), 10, 'ternary');
  eq(e('16 >> 2'), 4, 'shift');
  eq(e('7 % 4 - -1'), 4, 'mod and unary minus');
  eq(e('A * 2', { A: 5 }), 10, 'parameter in env');
  eq(e('B + 1'), null, 'unknown name → null');
  const lots = P('module m;\n' + 'wire ! ;\n'.repeat(80) + 'endmodule');
  ok(lots.problems.length <= 52 && lots.problems.some((p) => p.code === 'syn.toomany'), 'error cap at 50 per file');
  const many = P('module m;\n  wire a ! ;\n  wire b;\n  wire c ! ;\n  q <= 1;\n  end\n  assign b = 1 +;\nendmodule');
  eq(codes(many), ['syn.expect@2:10', 'syn.expect@4:10', 'syn.expect@7:17'], 'recovery: each new item reports again, leftovers of a broken block do not');
  const garbage = P('module m;\n' + 'garbage ! ;\n'.repeat(5) + 'endmodule');
  eq(garbage.problems.length, 1, 'lines that are not items after an error are one error, not five');
}
