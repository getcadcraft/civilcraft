/* SPDX-License-Identifier: Apache-2.0 */
const { ok, eq, section, fixture, mine } = globalThis.__chipTest;
const H = await mine('vhdl.js');
const P = (t) => H.parseVhdl(t, { file: 'x.vhd' });
const codes = (r) => r.problems.map((p) => p.code + '@' + p.line + ':' + p.col);

section('VHDL tokenizer');
{
  const t = H.tokenize("X\"FF\" 16#FF# 2#1010# 1_000 3.5e2 clk'event '1' \"a\"\"b\" b\"0101\" -- comment\n/* block */ \\Ext Id\\").tokens;
  eq([t[0].t, t[0].base, t[0].digits], ['bits', 'x', 'FF'], 'bit string X"FF"');
  eq([t[1].value, t[2].value, t[3].value, t[4].value], [255, 10, 1000, 350], 'based and decimal literals');
  eq([t[5].v, t[6].v, t[7].v], ['clk', "'", 'event'], "clk'event is an attribute tick");
  eq([t[8].t, t[8].v], ['char', '1'], "'1' is a character literal");
  eq([t[9].t, t[9].v], ['str', 'a"b'], 'doubled quote in a string');
  eq([t[10].t, t[10].base], ['bits', 'b'], 'b"0101"');
  eq([t[11].t, t[11].raw], ['id', '\\Ext Id\\'], 'extended identifier; comments skipped');
  eq(H.tokenize('ENTITY Foo IS').tokens.map((x) => x.v), ['entity', 'foo', 'is', ''], 'lower case, keywords');
  const q = H.tokenize("std_logic'('1')").tokens.map((x) => x.t + ':' + x.v);
  eq(q, ['id:std_logic', "op:'", 'op:(', 'char:1', 'op:)', 'eof:'], "qualified expression type'(…)");
}

section('VHDL fixtures');
{
  const r = H.parseVhdl(fixture('counter.vhd'), { file: 'counter.vhd' });
  eq(codes(r), [], 'counter.vhd clean');
  const e = r.modules[0];
  eq([e.name, e.arch, e.ports.map((p) => p.name + ':' + p.dir)], ['counter_v', 'rtl', ['clk:in', 'rst:in', 'en:in', 'count:out']], 'entity, architecture, ports');
  eq(H.vhdlWidth(e.ports[3].width, { width: 8 }), 8, 'count(WIDTH-1 downto 0) = 8 bits');
  eq(H.vhdlWidth(e.ports[0].width), 1, 'std_logic = 1 bit');
  eq(e.params.map((g) => g.name + '=' + g.expr.value), ['width=8'], 'generic with default');
  eq(e.blocks.length, 1, 'one process');
  eq([e.blocks[0].sens, e.blocks[0].writes], [['clk'], ['c']], 'sensitivity list and writes');
  eq(Object.keys(e.nets), ['c'], 'signal c');
}
{
  const r = H.parseVhdl(fixture('top.vhd'), { file: 'top.vhd' });
  eq(codes(r), [], 'top.vhd clean');
  const a = r.modules[0];
  eq(a.instances.map((i) => [i.name, i.kind, i.type, i.lib, i.arch, i.named, i.conns.length]), [
    ['ca', 'component', 'counter_v', null, null, true, 4], ['cb', 'entity', 'counter_v', 'work', 'rtl', false, 4], ['u_missing', 'component', 'not_here', null, null, true, 1]], 'component, entity and missing instances');
  eq(a.instances[0].params.map((p) => p.port), ['width'], 'generic map');
  eq(a.archs[0].components, ['counter_v'], 'component declaration');
  eq(a.ports.map((p) => p.name), ['clk', 'rst', 'sel', 'q'], 'ports with shared type');
}
{
  const r = H.parseVhdl(fixture('bad.vhd'), { file: 'bad.vhd' });
  eq(codes(r), ['syn.expect@2:33', 'syn.expect@11:8'], 'bad.vhd: missing ; and "end" without "if"');
  eq(r.problems[1].text, 'Expected "end if" but found ";"', 'end if message');
  eq(r.orphanArchs.map((a) => a.name + ' of ' + a.of), ['other of nobody'], 'architecture of an unknown entity kept for the project check');
}

section('VHDL syntax');
{
  eq(codes(P('entity e is end e2;')), ['syn.endname@1:17'], 'end name mismatch');
  eq(codes(P('entity e is end entity;\narchitecture a of e is begin end architecture b;')), ['syn.endname@2:47'], 'architecture end name');
  const big = P(`library ieee; use ieee.std_logic_1164.all, ieee.numeric_std.all;
entity alu_v is
  generic (N : positive := 4);
  port (a, b : in std_logic_vector(N-1 downto 0); op : in std_logic_vector(1 downto 0); y : out std_logic_vector(N-1 downto 0); z : buffer std_logic);
end;
architecture rtl of alu_v is
  type state_t is (idle, run, done);
  type rec_t is record x : integer; end record;
  subtype byte is std_logic_vector(7 downto 0);
  constant ZERO : std_logic_vector(N-1 downto 0) := (others => '0');
  signal s : state_t;
  signal r : std_logic_vector(N-1 downto 0);
  function inv(v : std_logic) return std_logic is begin return not v; end function;
  procedure nop is begin null; end procedure;
  attribute keep : boolean;
  alias top_bit : std_logic is r(N-1);
begin
  y <= r;
  z <= '1' when r = ZERO else '0';
  with op select r <= std_logic_vector(unsigned(a) + unsigned(b)) when "00", a and b when "01", a or b when "10", a xor b when others;
  p : process (all)
    variable k : integer range 0 to 7;
  begin
    case s is
      when idle | run => s <= run;
      when others => s <= idle;
    end case;
    for i in 0 to N-1 loop next when i = 2; k := i; end loop;
    while k > 0 loop k := k - 1; exit; end loop;
    if rising_edge(a(0)) and b(0)'event then report "edge" severity note; end if;
    assert k = 0 report "k" severity warning;
    wait until a(0) = '1';
    wait for 10 ns;
    nop;
  end process p;
  g : for i in 0 to N-1 generate
    signal t : std_logic;
  begin
    t <= a(i);
  end generate g;
  h : if N > 2 generate
    u : entity work.alu_v generic map (N => 2) port map (a => a(1 downto 0), b => b(1 downto 0), op => op, y => open, z => open);
  end generate;
  blk : block begin end block blk;
end architecture rtl;`);
  eq(codes(big), [], 'a wide sample: types, records, subtypes, constants, functions, procedures, attributes, aliases, when/else, with/select, process(all), case, loops, wait, assert, generate, block');
  eq(big.modules[0].instances.map((i) => i.name + ':' + i.type), ['u:alu_v'], 'instance inside generate');
  eq(big.modules[0].ports.find((p) => p.name === 'z').dir, 'buffer', 'buffer mode');
  eq(codes(P('entity e is port (a : in bit); end;\narchitecture r of e is begin\n  x <= a\nend r;')), ['syn.expect@3:9'], 'missing ; after a signal assignment');
  eq(codes(P('entity e is end;\narchitecture r of e is begin\n p : process begin if a then null; end process;\nend r;')).length, 1, 'one error for a broken process, not a cascade');
  eq(codes(P('configuration c of e is for r end for; end c;\nentity e is end;')).map((c) => c.split('@')[0]), ['syn.unexpected'], 'configuration skipped with a note');
  ok(P('configuration c of e is for r end for; end c;').problems[0].severity === 'note', 'configuration note severity');
  eq(codes(P('package p is constant c : integer := 1; component k port (a : in bit); end component; end package;\npackage body p is end package body;')), [], 'package and package body');
}
