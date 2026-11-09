entity broken is
  port (a : in bit; y : out bit)
end broken;

architecture rtl of broken is
begin
  process (a)
  begin
    if a = '1' then
      y <= '0';
    end;
  end process;
end rtl;

architecture other of nobody is
begin
end other;
