// SPDX-License-Identifier: CC0-1.0
// Pebble system: the core and its program memory. The top of synthesis, place and route and the layout.
`timescale 1ns/1ps
module pebble_soc (
  input  wire       clk,
  input  wire       rst,
  output wire [7:0] out_data,
  output wire       out_valid,
  output wire       halted
);
  wire [4:0]  pc;
  wire [15:0] instr;
  pebble_rom  rom  (.addr(pc), .data(instr));
  pebble_core core (.clk(clk), .rst(rst), .pc_out(pc), .instr(instr), .out_data(out_data), .out_valid(out_valid), .halted(halted));
endmodule
