-- Two counters under one top, one by component, one by direct entity instantiation; a mux by selected assignment.
library ieee;
use ieee.std_logic_1164.all;

entity top_v is
  port (clk, rst : in std_logic; sel : in std_logic; q : out std_logic_vector(7 downto 0));
end top_v;

architecture struct of top_v is
  component counter_v is
    generic (WIDTH : natural := 8);
    port (clk, rst, en : in std_logic; count : out std_logic_vector(WIDTH-1 downto 0));
  end component;
  signal qa, qb : std_logic_vector(7 downto 0);
begin
  ca : counter_v generic map (WIDTH => 8) port map (clk => clk, rst => rst, en => '1', count => qa);
  cb : entity work.counter_v(rtl) port map (clk, rst, sel, qb);
  with sel select q <= qa when '0', qb when others;
  u_missing : not_here port map (a => clk);
end architecture;
