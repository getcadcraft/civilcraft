// SPDX-License-Identifier: CC0-1.0
// Pebble core: one instruction per clock. Fetch from the program memory, decode, read two registers, compute, write back,
// load/store the data memory, branch on the zero flag, print with OUT, stop with HALT. Synchronous reset.
`timescale 1ns/1ps
`include "pebble_pkg.vh"
module pebble_core (
  input  wire        clk,
  input  wire        rst,
  output wire [4:0]  pc_out,
  input  wire [15:0] instr,
  output reg  [7:0]  out_data,
  output reg         out_valid,
  output reg         halted
);
  reg  [4:0] pc;
  reg        zflag, cflag;
  wire [3:0] op  = instr[15:12];
  wire [1:0] rd  = instr[11:10];
  wire [1:0] rs  = instr[9:8];
  wire [7:0] imm = instr[7:0];
  wire [7:0] qa, qb, mem_rd, alu_y;
  wire       alu_c, alu_z;

  // what the ALU's second operand is: a register, or the immediate (LI, ADDI), or memory (LD)
  wire use_imm = (op == `OP_LI) || (op == `OP_ADDI);
  wire is_ld   = (op == `OP_LD);
  wire [7:0] operand_b = is_ld ? mem_rd : use_imm ? imm : qb;
  wire writes  = !halted && ((op == `OP_LI) || (op == `OP_ADD) || (op == `OP_SUB) || (op == `OP_AND) || (op == `OP_OR) ||
                 (op == `OP_XOR) || (op == `OP_ADDI) || is_ld || (op == `OP_SHL));
  wire sets_flags = writes && !is_ld && (op != `OP_LI);

  pebble_regs regs (.clk(clk), .rst(rst), .we(writes), .wa(rd), .wd(alu_y), .ra(rd), .rb(rs), .qa(qa), .qb(qb));
  pebble_alu  alu  (.op(op), .a(qa), .b(operand_b), .y(alu_y), .carry(alu_c), .zero(alu_z));
  pebble_dmem dmem (.clk(clk), .we(!halted && op == `OP_ST), .addr(imm[2:0]), .wd(qa), .rd(mem_rd));

  wire take = (op == `OP_JMP) || (op == `OP_BZ && zflag) || (op == `OP_BNZ && !zflag);

  always @(posedge clk) begin
    if (rst) begin
      pc <= 5'd0; zflag <= 1'b0; cflag <= 1'b0; out_data <= 8'd0; out_valid <= 1'b0; halted <= 1'b0;
    end else begin
      out_valid <= 1'b0;
      if (!halted) begin
        pc <= take ? imm[4:0] : pc + 5'd1;
        if (sets_flags) begin zflag <= alu_z; cflag <= alu_c; end
        if (op == `OP_OUT) begin out_data <= qa; out_valid <= 1'b1; end
        if (op == `OP_HALT) halted <= 1'b1;
      end
    end
  end
  assign pc_out = pc;
endmodule
