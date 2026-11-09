module bad (input a, input b, output y)
  wire t;
  assign t = a & ;
  assign y = t | c;
endmodule

module bad2 (input clk, output reg q);
  always @(posedge clk) begin
    q <= 1'b1
  end
endmodule
