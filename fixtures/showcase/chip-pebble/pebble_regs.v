// SPDX-License-Identifier: CC0-1.0
// Pebble register file: four 8-bit registers, two read ports, one write port, cleared by reset.
`timescale 1ns/1ps
module pebble_regs (
  input  wire       clk,
  input  wire       rst,
  input  wire       we,
  input  wire [1:0] wa,
  input  wire [7:0] wd,
  input  wire [1:0] ra,
  input  wire [1:0] rb,
  output wire [7:0] qa,
  output wire [7:0] qb
);
  reg [7:0] r0, r1, r2, r3;
  always @(posedge clk) begin
    if (rst) begin
      r0 <= 8'd0; r1 <= 8'd0; r2 <= 8'd0; r3 <= 8'd0;
    end else if (we) begin
      case (wa)
        2'd0: r0 <= wd;
        2'd1: r1 <= wd;
        2'd2: r2 <= wd;
        2'd3: r3 <= wd;
      endcase
    end
  end
  assign qa = ra == 2'd0 ? r0 : ra == 2'd1 ? r1 : ra == 2'd2 ? r2 : r3;
  assign qb = rb == 2'd0 ? r0 : rb == 2'd1 ? r1 : rb == 2'd2 ? r2 : r3;
endmodule
