# Hand-written demonstration constraints for cc_demo_top (CadCraft Chip design tests).
set_units -time ns -capacitance pF
set clk_period 10.0
create_clock -name core_clk -period $clk_period -waveform {0 5} [get_ports clk]
create_generated_clock -name div2 -source [get_ports clk] -divide_by 2 [get_pins u3/Q]
set_clock_uncertainty -setup 0.25 [get_clocks core_clk]
set_clock_latency -source 0.5 [get_clocks core_clk]
set_input_delay 2.0 -clock core_clk [get_ports {din}]
set_input_delay -min 0.5 -clock core_clk [get_ports din]
set_output_delay 1.5 -clock [get_clocks core_clk] -max [get_ports dout]
set_false_path -from [get_ports rst_n] \
    -to [all_registers]
set_multicycle_path 2 -setup -from [get_pins u1/A] -to [get_pins u3/D]
set_max_delay 4.0 -from [get_ports din] -to [get_ports dout]
set_load 0.05 [all_outputs]
set_driving_cell -lib_cell INV_X1 -pin Y [all_inputs]
set_input_transition 0.1 [get_ports {din clk}]
set_clock_groups -asynchronous -group {core_clk} -group {div2}
set_max_fanout 16 [current_design]; set_max_transition 0.5 [current_design]
if {$clk_period > 5} { set_max_area 100 }
