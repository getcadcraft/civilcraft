/* SPDX-License-Identifier: Apache-2.0 */
const { ok, eq, section, fixture, mine } = globalThis.__chipTest;
const H = await mine('hier.js');
const F = (...names) => names.map((n) => ({ name: n, text: fixture(n) }));
const codes = (r) => r.problems.map((p) => p.code + '@' + p.file + ':' + p.line);

section('Hierarchy: languages and files');
{
  eq(['a.v', 'b.SV', 'c.vhd', 'd.vhdl', 'e.txt', 'f.vh'].map(H.langOf), ['verilog', 'verilog', 'vhdl', 'vhdl', null, 'verilog'], 'language by extension');
  const r = H.analyzeProject([...F('two_stage.v', 'alu.v'), { name: 'notes.txt', text: 'not hdl' }]);
  eq(Object.keys(r.byFile).sort(), ['alu.v', 'two_stage.v'], 'only HDL files are read');
  eq([r.hier.top, r.hier.testbenches, r.hier.unused], ['pipe2', ['pipe2_tb'], ['spare_block']], 'top under the test bench, test bench, unused');
  eq(codes(r), ['hier.unused@two_stage.v:34'], 'one warning: spare_block');
  const rows = H.flattenTree(r.hier.trees[0]);
  eq(rows.map((x) => '  '.repeat(x.depth) + (x.inst ? x.inst + ':' : '') + x.module), ['pipe2', '  ra:stage_reg', '  rb:stage_reg', '  u_alu:alu', '  out_reg:stage_reg'], 'top tree');
  eq(r.hier.trees.map((t) => t.role + ':' + t.module), ['top:pipe2', 'testbench:pipe2_tb', 'unused:spare_block'], 'every tree with its role');
  eq(rows[3].line, 17, 'tree rows keep the instance line');
  const pick = H.analyzeProject(F('two_stage.v', 'alu.v'), { top: 'spare_block' });
  eq([pick.hier.top, pick.hier.unused, pick.hier.trees.map((t) => t.role)], ['spare_block', [], ['top', 'testbench']], 'chosen top (pipe2 stays under its test bench)');
}
{
  const r = H.analyzeProject(F('two_stage.v'));
  eq(codes(r), ['hier.missing@two_stage.v:17', 'hier.unused@two_stage.v:34'], 'alu missing without alu.v');
  eq(r.hier.missing.map((m) => m.type + ' in ' + m.parent + '/' + m.inst), ['alu in pipe2/u_alu'], 'missing list');
  ok(H.flattenTree(r.hier.tree).find((x) => x.module === 'alu').flags.includes('missing'), 'tree flags the missing module');
  const k = H.analyzeProject(F('two_stage.v'), { known: ['alu'] });
  eq(k.hier.missing.length, 0, 'a known library cell is not missing');
}

section('Hierarchy: checks');
{
  const cyc = H.analyzeProject([{ name: 'c.v', text: 'module a(input x); b u(.x(x)); endmodule\nmodule b(input x); a v(.x(x)); endmodule\nmodule t(input x); a w(.x(x)); endmodule' }]);
  eq(cyc.hier.cycles, ['a > b > a'], 'recursion found once');
  ok(codes(cyc).includes('hier.cycle@c.v:1') || codes(cyc).includes('hier.cycle@c.v:2'), 'cycle problem row');
  const port = H.analyzeProject([{ name: 'p.v', text: 'module s(input i, output o); assign o = i; endmodule\nmodule t(input a, output b, c); s u1(.i(a), .zz(b)); s u2(a, b, c); s u3(a, c); endmodule' }]);
  eq(codes(port), ['hier.portmissing@p.v:2', 'hier.portcount@p.v:2'], 'unknown port and too many positional ports');
  eq(port.problems[0].text, 's has no port zz (instance u1 in t)', 'port message');
  const dup = H.analyzeProject([{ name: 'a.v', text: 'module m; endmodule' }, { name: 'b.v', text: 'module m; endmodule' }]);
  eq(codes(dup), ['sem.dupmodule@b.v:1'], 'module defined twice');
  eq(dup.problems[0].text, 'm is defined twice (also in a.v:1)', 'duplicate message names the other file');
  const prim = H.analyzeProject([{ name: 'g.v', text: 'module g(input a, output y); $_NOT_ n(.A(a), .Y(y)); and x(y, a, a); endmodule' }]);
  eq(prim.hier.missing.length, 0, 'tool cells and gate primitives are not missing');
  eq(H.analyzeProject([]).hier.top, null, 'empty project');
}

section('Hierarchy: VHDL and mixed');
{
  const r = H.analyzeProject(F('top.vhd', 'counter.vhd'));
  eq([r.hier.top, r.hier.unused], ['top_v', []], 'VHDL top');
  eq(codes(r), ['hier.missing@top.vhd:19'], 'not_here missing');
  eq(H.flattenTree(r.hier.tree).map((x) => x.inst + ':' + x.module), [':top_v', 'ca:counter_v', 'cb:counter_v', 'u_missing:not_here'], 'VHDL tree');
  const bad = H.analyzeProject(F('bad.vhd'));
  ok(codes(bad).includes('sem.archnoentity@bad.vhd:15'), 'architecture of an entity not in the project');
  const split = H.analyzeProject([{ name: 'e.vhd', text: 'entity e is port (a : in bit); end;' }, { name: 'a.vhd', text: 'architecture r of e is begin u : entity work.f port map (a); end;' }, { name: 'f.vhd', text: 'entity f is port (a : in bit); end; architecture r of f is begin end;' }]);
  eq([split.hier.top, split.problems.length], ['e', 0], 'architecture in another file joins its entity');
  const noarch = H.analyzeProject([{ name: 'e.vhd', text: 'entity lone is end;' }]);
  eq(codes(noarch), ['sem.noarch@e.vhd:1'], 'entity with no architecture');
  const mixed = H.analyzeProject([...F('alu.v'), { name: 'm.vhd', text: 'entity Mix is port (a : in bit); end;\narchitecture s of mix is\n component ALU port (a : in bit); end component;\nbegin\n u0 : alu port map (a => a);\nend;' }]);
  eq([mixed.hier.top, mixed.hier.missing.length], ['mix', 0], 'VHDL top uses a Verilog module (case-insensitive match)');
  eq(mixed.problems.filter((p) => p.code === 'hier.portmissing').length, 0, 'VHDL port names matched without case');
}
