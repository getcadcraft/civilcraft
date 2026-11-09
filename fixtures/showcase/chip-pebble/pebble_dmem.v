// SPDX-License-Identifier: CC0-1.0
// Pebble data memory: eight bytes, written on the clock edge, read at once. Not cleared: a program writes before it reads.
`timescale 1ns/1ps
module pebble_dmem (
  input  wire       clk,
  input  wire       we,
  input  wire [2:0] addr,
  input  wire [7:0] wd,
  output wire [7:0] rd
);
  reg [7:0] m0, m1, m2, m3, m4, m5, m6, m7;
  always @(posedge clk) begin
    if (we) begin
      case (addr)
        3'd0: m0 <= wd;
        3'd1: m1 <= wd;
        3'd2: m2 <= wd;
        3'd3: m3 <= wd;
        3'd4: m4 <= wd;
        3'd5: m5 <= wd;
        3'd6: m6 <= wd;
        3'd7: m7 <= wd;
      endcase
    end
  end
  assign rd = addr == 3'd0 ? m0 : addr == 3'd1 ? m1 : addr == 3'd2 ? m2 : addr == 3'd3 ? m3 :
              addr == 3'd4 ? m4 : addr == 3'd5 ? m5 : addr == 3'd6 ? m6 : m7;
endmodule
