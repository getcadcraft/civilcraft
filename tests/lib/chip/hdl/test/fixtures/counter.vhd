-- 8-bit counter with synchronous reset (our own sample)
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity counter_v is
  generic (WIDTH : natural := 8);
  port (
    clk   : in  std_logic;
    rst   : in  std_logic;
    en    : in  std_logic;
    count : out std_logic_vector(WIDTH-1 downto 0)
  );
end entity counter_v;

architecture rtl of counter_v is
  signal c : unsigned(WIDTH-1 downto 0) := (others => '0');
begin
  process (clk)
  begin
    if rising_edge(clk) then
      if rst = '1' then
        c <= (others => '0');
      elsif en = '1' then
        c <= c + 1;
      end if;
    end if;
  end process;
  count <= std_logic_vector(c);
end architecture rtl;
