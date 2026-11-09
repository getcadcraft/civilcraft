// 4-function ALU, combinational
module alu #(parameter N = 4) (
  input  [N-1:0] a, b,
  input  [1:0]   op,
  output reg [N-1:0] y,
  output         zero
);
  localparam ADD = 2'd0, SUB = 2'd1, AND_ = 2'd2, OR_ = 2'd3;
  always @(*) begin
    case (op)
      ADD:  y = a + b;
      SUB:  y = a - b;
      AND_: y = a & b;
      default: y = a | b;
    endcase
  end
  assign zero = (y == 0);
endmodule
