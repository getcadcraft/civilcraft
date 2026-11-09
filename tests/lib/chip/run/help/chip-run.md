---
title: Chip design: run your own tools
summary: Simulate, synthesize, place and route, check design rules and LVS with the tools you installed, and see the waves, the layout and the reports.
section: tasks
order: 30
keywords: chip, simulation, icarus, verilator, yosys, openroad, klayout, netgen, drc, lvs, waveform, vcd, def, sdf, stil, gate level
---

## Where it is

Switch the add-on on in Settings › Add-ons (Chip design), then open the **Chip design** section of the right panel (or type {{cmd:CHIP}}). **Larger window** opens the same panel in a big dialog. The **Flow** tab lists the stages of your project: simulation, synthesis, place and route, design rule check, layout vs schematic, gate-level simulation and test patterns.

## Your tools, nothing bundled

CadCraft ships no simulator, synthesis or layout tool and no process design kit (PDK). In **CadCraft Studio**, a stage's **Run** starts the tools you installed yourself — Icarus Verilog, Verilator, Yosys, OpenROAD, KLayout, Netgen — as separate programs, from the **Tools folder** you set on the Project tab (empty = the search path). The first run asks you to allow Node to run the add-on's run script. **Find my tools** records each tool's version in the project.

In the **browser edition**, nothing can start a program: **Save run package** gives you a zip with the inputs, the steps and the run script. Unzip it and run `node engine/cc-chip-run.mjs chip-job.json` on your computer, then **Open a result** with the `out/result.zip` it writes.

## What comes back

- Messages, errors, timing and rule violations go to **Problems**, one source per stage. A design rule violation carries its cell and its place on the layout, in micrometres.
- **Waves** shows a VCD from the simulation (FST files are not read: ask for VCD).
- **Floorplan** shows the DEF from place and route: floorplan, placement and routing.
- Every run keeps the SHA-256 of its inputs and outputs and the tool's version in the project, and the Flow tab says when the inputs changed since the last run.

For learning and open-silicon flows, not a signed-off tape-out system.
