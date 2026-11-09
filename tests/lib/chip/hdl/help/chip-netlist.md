---
title: Chip design: netlist and schematic
summary: Turn a structural Verilog module into a netlist of cells, pins and nets, and look at it as a schematic.
section: tasks
order: 20
keywords: netlist, schematic, gate level, structural verilog, synthesis output, nets, cells, bus, driver
---

## Draw a module

Open {{ui:Netlist}} and pick a Verilog module in {{ui:Module}} (the top is picked first). The panel reads the module's instances, gates and `assign` lines and draws them: inputs on the left, outputs on the right, and each box in a column after the boxes that drive it. Wires leave each output and run to every input on the same net.

Buses are split into bits: `a[3:0]` becomes four nets `a[3]` … `a[0]`, so a box's pins are one bit each. Plain `assign` wiring (`assign b = a;`, `assign c = {a, 1'b0};`) joins nets instead of drawing a box; constants become tie boxes `1'b0` and `1'b1`.

It is meant for gate-level netlists, such as what a synthesis tool writes. A module with `always` blocks or `assign` lines that compute something is still drawn, with one dashed box per block or line, so you can see what feeds what.

## Look around

Scroll to zoom, drag to move, {{ui:Fit}} to see it all. Click a wire to light its whole net and read its name; click a box to go to its line in {{ui:Source}}. {{ui:Save picture (SVG)}} and {{ui:Save netlist (JSON)}} write files into the project.

## Checks

The list under the drawing (and the Problems panel) shows nets with more than one driver, inputs that nothing drives, inputs left open, and pins connected to the wrong number of bits. Where a cell is not a module of the project and no cell library is loaded, its pin directions are guessed from the pin names (Y, Q, Z and similar are outputs) and a note says so.

## What is not supported

Generate loops are not unrolled (instances inside them are left out, with a note), instance arrays are drawn as one box, and submodules are not flattened: pick a submodule in {{ui:Module}} to see inside it. Very large netlists (over 4,000 cells) are not drawn, but can still be saved as JSON.
