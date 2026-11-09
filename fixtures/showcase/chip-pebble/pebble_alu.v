// SPDX-License-Identifier: CC0-1.0
// Pebble ALU: 8-bit add, subtract, and, or, xor, shift left; a zero flag and a carry (borrow on subtract).
`timescale 1ns/1ps
`include "pebble_pkg.vh"
module pebble_alu (
  input  wire [3:0] op,
  input  wire [7:0] a,
  input  wire [7:0] b,
  output reg  [7:0] y,
  output reg        carry,
  output wire       zero
);
  reg [8:0] wide;
  always @(*) begin
    wide  = 9'd0;
    y     = 8'd0;
    carry = 1'b0;
    case (op)
      `OP_ADD, `OP_ADDI: begin wide = {1'b0, a} + {1'b0, b}; y = wide[7:0]; carry = wide[8]; end
      `OP_SUB:           begin wide = {1'b0, a} - {1'b0, b}; y = wide[7:0]; carry = wide[8]; end
      `OP_AND:           y = a & b;
      `OP_OR:            y = a | b;
      `OP_XOR:           y = a ^ b;
      `OP_SHL:           begin y = {a[6:0], 1'b0}; carry = a[7]; end
      default:           y = b;   // LI and LD pass the second operand through
    endcase
  end
  assign zero = (y == 8'd0);
endmodule
