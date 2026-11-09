---
title: Chip design: Verilog and VHDL source
summary: Write and check Verilog or VHDL, see errors at their line and column, and see which module uses which in the hierarchy.
section: tasks
order: 10
keywords: verilog, systemverilog, vhdl, hdl, rtl, syntax check, module, entity, hierarchy, top module, instance
---

## Open the source

Open {{ui:Source}}. The list shows every `.v`, `.sv`, `.vh`, `.vhd` and `.vhdl` file in the project. {{ui:New file}} starts an empty module (or entity, for a VHDL name). Type in the box; {{ui:Save}} (or Ctrl+S) writes the file back to the project.

## Errors and warnings

The files are checked as you type. Each problem has a line and a column: a dot in the margin marks the line (point at it to read the message), and the list under the box takes you to the place when clicked. The same rows go to the Problems panel.

Errors are things a tool would refuse: a missing `;` or `end`, a name used but never declared, a module or entity defined twice, an instance of something that is not in the project, a port that the module does not have. Warnings may be right on purpose: a module nothing uses, a port connected to the wrong number of bits. Notes say what was assumed, for example a name that becomes a one-bit wire because it was never declared.

## The hierarchy

{{ui:Hierarchy}} shows the top and everything under it, as instance name and module. The top is found by itself: the module that nothing else uses and that has the biggest tree under it (a test bench, a module with no ports, is shown on its own). Choose another in {{ui:Top}}. Tags mark modules that are not in the project, modules nothing uses, and modules that end up using themselves. Click a row to go to its line.

VHDL and Verilog can be mixed: a VHDL architecture can use a Verilog module and the other way round (names are matched without case for VHDL).

## What is read

- Verilog: the synthesizable part of IEEE 1364-2005 (modules, ports in both styles, parameters, wires and regs, assign, always and initial blocks, if, case, for, functions and tasks, generate for and if, gate primitives, instances with named, positional and `.*` connections), `define, `ifdef, `include of a project file, and a few SystemVerilog words (logic, always_ff, always_comb, '0 and '1).
- VHDL: library and use, entity with generics and ports, architecture with signals, constants, components and functions, processes, component and entity instances with generic map and port map, when/else and with/select assignments, for and if generate, blocks.

## What is not supported

No type checking (a VHDL signal of the wrong type is not found), no SystemVerilog classes, interfaces, packages, structs or enums (typedef lines are skipped), no generate case, no user-defined primitives (skipped with a note), no VHDL configurations (skipped with a note). This is a checker to catch mistakes early; your simulator and synthesis tool have the last word.
