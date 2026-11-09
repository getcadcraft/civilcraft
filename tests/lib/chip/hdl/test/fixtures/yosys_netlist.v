/* Structural netlist in the shape a synthesis tool writes (our own text). A 2-bit counter with enable. */
(* top = 1 *)
module cnt2(clk, en, q);
  (* src = "cnt2.v:3" *)
  input clk;
  input en;
  output [1:0] q;
  wire [1:0] q;
  wire _0_;
  wire _1_;
  wire _2_;
  wire \next[0] ;
  wire \next[1] ;
  \$_XOR_  _3_ (.A(q[0]), .B(en), .Y(\next[0] ));
  \$_AND_  _4_ (.A(q[0]), .B(en), .Y(_0_));
  \$_XOR_  _5_ (.A(q[1]), .B(_0_), .Y(\next[1] ));
  \$_DFF_P_ _6_ (.C(clk), .D(\next[0] ), .Q(q[0]));
  \$_DFF_P_ _7_ (.C(clk), .D(\next[1] ), .Q(q[1]));
  assign _1_ = 1'b0;
  assign _2_ = _1_;
endmodule
