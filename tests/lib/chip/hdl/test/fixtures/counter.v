// 8-bit up counter with synchronous reset and enable
`timescale 1ns/1ps
`define WIDTH 8
module counter #(parameter WIDTH = `WIDTH) (
  input  wire             clk,
  input  wire             rst,
  input  wire             en,
  output reg  [WIDTH-1:0] count,
  output wire             wrap
);
  assign wrap = en & (count == {WIDTH{1'b1}});
  always @(posedge clk) begin
    if (rst)
      count <= {WIDTH{1'b0}};
    else if (en)
      count <= count + 1'b1;
  end
endmodule
