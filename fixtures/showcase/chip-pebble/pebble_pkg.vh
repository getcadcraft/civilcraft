// SPDX-License-Identifier: CC0-1.0
// Pebble: a small teaching RISC-style core made for CadCraft's Chip design add-on (our own design, CC0).
// Opcodes of the 16-bit instruction word: [15:12] op, [11:10] rd, [9:8] rs, [7:0] imm.
`define OP_NOP  4'h0
`define OP_LI   4'h1
`define OP_ADD  4'h2
`define OP_SUB  4'h3
`define OP_AND  4'h4
`define OP_OR   4'h5
`define OP_XOR  4'h6
`define OP_ADDI 4'h7
`define OP_LD   4'h8
`define OP_ST   4'h9
`define OP_JMP  4'hA
`define OP_BZ   4'hB
`define OP_BNZ  4'hC
`define OP_SHL  4'hD
`define OP_OUT  4'hE
`define OP_HALT 4'hF
