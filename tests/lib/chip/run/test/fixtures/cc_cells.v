// SPDX-License-Identifier: Apache-2.0
// cc_cells simulation models with specify blocks (made up, for the runner tests). Delays here are the defaults; SDF replaces them.
`timescale 1ns/1ps
module INV (input A, output Y);
  assign Y = ~A;
  specify (A => Y) = (0.01, 0.01); endspecify
endmodule
module BUF (input A, output Y);
  assign Y = A;
  specify (A => Y) = (0.01, 0.01); endspecify
endmodule
module NAND2 (input A, input B, output Y);
  assign Y = ~(A & B);
  specify (A => Y) = (0.01, 0.01); (B => Y) = (0.01, 0.01); endspecify
endmodule
module NOR2 (input A, input B, output Y);
  assign Y = ~(A | B);
  specify (A => Y) = (0.01, 0.01); (B => Y) = (0.01, 0.01); endspecify
endmodule
module AND2 (input A, input B, output Y);
  assign Y = A & B;
  specify (A => Y) = (0.01, 0.01); (B => Y) = (0.01, 0.01); endspecify
endmodule
module OR2 (input A, input B, output Y);
  assign Y = A | B;
  specify (A => Y) = (0.01, 0.01); (B => Y) = (0.01, 0.01); endspecify
endmodule
module XOR2 (input A, input B, output Y);
  assign Y = A ^ B;
  specify (A => Y) = (0.01, 0.01); (B => Y) = (0.01, 0.01); endspecify
endmodule
module XNOR2 (input A, input B, output Y);
  assign Y = ~(A ^ B);
  specify (A => Y) = (0.01, 0.01); (B => Y) = (0.01, 0.01); endspecify
endmodule
module DFF (input C, input D, output reg Q);
  always @(posedge C) Q <= D;
  specify (posedge C => (Q +: D)) = (0.01, 0.01); endspecify
endmodule
