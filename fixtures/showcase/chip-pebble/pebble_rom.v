// SPDX-License-Identifier: CC0-1.0
// Pebble program memory: the demonstration program as logic (a read-only table).
//   sum 1..10 and print it (55), keep it in memory, print seven Fibonacci numbers (1 1 2 3 5 8 13), read the sum back and print it, stop.
`timescale 1ns/1ps
`include "pebble_pkg.vh"
module pebble_rom (
  input  wire [4:0]  addr,
  output reg  [15:0] data
);
  // each word: {op, rd, rs, imm}
  always @(*) begin
    case (addr)
      5'd0:  data = {`OP_LI, 2'd0, 2'd0, 8'd0};    // r0 = 0          sum
      5'd1:  data = {`OP_LI, 2'd1, 2'd0, 8'd10};   // r1 = 10         counter
      5'd2:  data = {`OP_LI, 2'd2, 2'd0, 8'd1};    // r2 = 1          one
      5'd3:  data = {`OP_ADD, 2'd0, 2'd1, 8'd0};    // loop: r0 += r1
      5'd4:  data = {`OP_SUB, 2'd1, 2'd2, 8'd0};    // r1 -= 1
      5'd5:  data = {`OP_BNZ, 2'd0, 2'd0, 8'd3};    // until r1 is 0
      5'd6:  data = {`OP_OUT, 2'd0, 2'd0, 8'd0};    // print 55
      5'd7:  data = {`OP_ST, 2'd0, 2'd0, 8'd0};    // mem[0] = r0
      5'd8:  data = {`OP_LI, 2'd0, 2'd0, 8'd0};    // a = 0
      5'd9:  data = {`OP_LI, 2'd1, 2'd0, 8'd1};    // b = 1
      5'd10: data = {`OP_LI, 2'd3, 2'd0, 8'd7};    // seven numbers
      5'd11: data = {`OP_OUT, 2'd1, 2'd0, 8'd0};    // loop: print b
      5'd12: data = {`OP_ST, 2'd1, 2'd0, 8'd1};    // mem[1] = b
      5'd13: data = {`OP_ADD, 2'd1, 2'd0, 8'd0};    // b = a + b
      5'd14: data = {`OP_LD, 2'd0, 2'd0, 8'd1};    // a = old b
      5'd15: data = {`OP_SUB, 2'd3, 2'd2, 8'd0};    // count down
      5'd16: data = {`OP_BNZ, 2'd0, 2'd0, 8'd11};
      5'd17: data = {`OP_LD, 2'd0, 2'd0, 8'd0};    // r0 = mem[0]
      5'd18: data = {`OP_OUT, 2'd0, 2'd0, 8'd0};    // print 55 again
      5'd19: data = {`OP_HALT, 2'd0, 2'd0, 8'd0};
      default: data = 16'h0000;
    endcase
  end
endmodule
