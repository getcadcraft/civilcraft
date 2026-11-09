// SPDX-License-Identifier: Apache-2.0
`timescale 1ns/1ps
module counter_tb;
  reg clk = 0, rst = 1, en = 0;
  wire [3:0] count;
  counter dut (.clk(clk), .rst(rst), .en(en), .count(count));
  always #5 clk = ~clk;
  initial begin
    #12 rst = 0;
    #5  en = 1;   // between clock edges (an input that changes at an edge is a race)
    #205;
    if (count !== 4'd4) $error("count is %0d, expected 4", count);
    $finish;
  end
endmodule
