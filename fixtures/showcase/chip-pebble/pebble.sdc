# SPDX-License-Identifier: CC0-1.0
# Pebble timing constraints: a 50 MHz clock (20 ns), inputs and outputs given 2 ns outside the chip.
create_clock -name clk -period 20 [get_ports clk]
set_input_delay 2 -clock clk [get_ports rst]
set_output_delay 2 -clock clk [get_ports {out_data[*] out_valid halted}]
set_load 0.01 [all_outputs]
