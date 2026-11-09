// SPDX-License-Identifier: Apache-2.0
// A 4-bit counter with an enable and a synchronous reset: the Chip design runner tests' tiny design.
module counter (
  input  wire       clk,
  input  wire       rst,
  input  wire       en,
  output reg  [3:0] count
);
  always @(posedge clk) begin
    if (rst) count <= 4'd0;
    else if (en) count <= count + 4'd1;
  end
endmodule
