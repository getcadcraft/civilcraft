// SPDX-License-Identifier: CC0-1.0
// Pebble testbench: a 50 MHz clock, reset, and a check of every printed number against the expected list.
`timescale 1ns/1ps
module pebble_tb;
  reg clk = 1'b0, rst = 1'b1;
  wire [7:0] out_data;
  wire out_valid, halted;
  pebble_soc dut (.clk(clk), .rst(rst), .out_data(out_data), .out_valid(out_valid), .halted(halted));
  always #10 clk = ~clk;

  reg [7:0] expected [0:8];
  integer n = 0, errors = 0;
  initial begin
    expected[0] = 8'd55; expected[1] = 8'd1; expected[2] = 8'd1; expected[3] = 8'd2; expected[4] = 8'd3;
    expected[5] = 8'd5;  expected[6] = 8'd8; expected[7] = 8'd13; expected[8] = 8'd55;
    #45 rst = 1'b0;   // between clock edges
  end
  // the output is read in the middle of the clock's low half, away from both edges
  always @(negedge clk) if (!rst && out_valid === 1'b1) begin
    if (n > 8) begin $error("more numbers than expected: %0d", out_data); errors = errors + 1; end
    else if (out_data !== expected[n]) begin $error("number %0d is %0d, expected %0d", n, out_data, expected[n]); errors = errors + 1; end
    else $display("printed %0d", out_data);
    n = n + 1;
  end
  initial begin
    wait (halted === 1'b1);
    #40;
    if (n !== 9) begin $error("%0d numbers printed, expected 9", n); errors = errors + 1; end
    if (errors == 0) $display("PASS: Pebble printed the 9 expected numbers");
    $finish;
  end
  initial begin #20000 $error("timeout: Pebble did not stop"); $finish; end
endmodule
