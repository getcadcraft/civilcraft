---
title: Chip design: get started with the sample
summary: Open Pebble, a small teaching processor, and walk through its source, netlist, layout, waves and problems.
section: start
order: 2
keywords: sample, tutorial, getting started, pebble, processor, cpu, risc, walkthrough, example design
---

## Open the sample

Switch on Settings › Add-ons › **Chip design**, open the **Chip design** section of the right panel (or type {{cmd:CHIP}}) and choose **Larger window** for room. On the **Project** tab choose **Open the sample design**. It opens **Pebble**: a small RISC-style processor written for CadCraft (16-bit instructions, four 8-bit registers, eight bytes of memory, a short program that adds 1 to 10, prints seven Fibonacci numbers and stops), its testbench, the made-up teaching cell library `cc_cells` (Liberty, LEF and simulation models) and the timing constraints `pebble.sdc`.

The sample also holds the results of real runs we made: Icarus Verilog simulated it, Yosys synthesized it onto `cc_cells` (801 cells), and a gate-level simulation ran with an SDF. Its placement (`out/layout/pebble.def`, `pebble.gds`) was made by our own sample script, not by a place-and-route tool, and has no routing.

## Walk through it

1. **Source** — pick `pebble_core.v`. The checker finds no errors. Change a line to see one appear at its place, then undo.
2. **Hierarchy** — `pebble_soc` holds the program memory and the core; the core holds the registers, the ALU and the data memory.
3. **Netlist** — pick `pebble_soc` from `out/synth/netlist.v` to see the synthesized gates as a schematic; click a wire to light its net.
4. **Layout** — open `out/layout/pebble.gds`: the cells in their rows; zoom with the wheel.
5. **Cell library and floorplan** — `cc_cells.lib` and `cc_cells.lef` side by side; open `out/layout/pebble.def` for the floorplan.
6. **Constraints and timing data** — `pebble.sdc` in plain words; `out/layout/pebble.sdf` shows each cell's delay.
7. **Waves** — choose `out/sim/wave.vcd` (or `out/gls/gls.vcd`, the gate-level run, where outputs change a little after each clock edge).
8. **Flow** — every stage with its command lines and the recorded runs. In Studio, with Icarus Verilog and Yosys installed, **Run** does them again; in the browser, **Save run package** and run it on your computer.
9. **Problems** — what the checks found shows in the Problems panel, one source per stage.
