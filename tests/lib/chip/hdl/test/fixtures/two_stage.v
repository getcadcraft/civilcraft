// A tiny two-stage design: an ALU feeding a register, and a test bench on top.
module stage_reg #(parameter W = 4) (input clk, input [W-1:0] d, output reg [W-1:0] q);
  always @(posedge clk) q <= d;
endmodule

module pipe2 (
  input        clk,
  input  [3:0] a, b,
  input  [1:0] op,
  output [3:0] result,
  output       zero
);
  wire [3:0] y;
  wire [3:0] a_q, b_q;
  stage_reg #(.W(4)) ra (.clk(clk), .d(a), .q(a_q));
  stage_reg #(4)     rb (clk, b, b_q);
  alu #(.N(4)) u_alu (.a(a_q), .b(b_q), .op(op), .y(y), .zero(zero));
  stage_reg out_reg (.clk(clk), .d(y), .q(result));
endmodule

module pipe2_tb;
  reg clk = 0;
  reg [3:0] a, b; reg [1:0] op;
  wire [3:0] r; wire z;
  pipe2 dut (.clk(clk), .a(a), .b(b), .op(op), .result(r), .zero(z));
  always #5 clk = ~clk;
  initial begin
    a = 4'd3; b = 4'd2; op = 2'd0;
    #40 $display("r=%d", r);
    $finish;
  end
endmodule

module spare_block (input x, output y);
  assign y = ~x;
endmodule
