---
title: Chip design: what the add-on is
summary: Design a small digital chip from Verilog to layout in CadCraft, with tools you install yourself, kept as a project you can run again.
section: start
order: 1
keywords: chip design, asic, hdl, verilog, vhdl, rtl, synthesis, place and route, gds, layout, open silicon, pdk, eda, add-on
---

## What it is

**Chip design** is an add-on for CadCraft (Settings › Add-ons › Chip design; off until you switch it on). It keeps a chip design as a **project**: your Verilog or VHDL files, the stages of the flow, the tools and their versions, and for every run the SHA-256 of what went in and what came out, so you can see when a run would be the same and run it again.

## The flow

1. **Source** — write and check Verilog or VHDL; errors at their line; the module **Hierarchy**.
2. **Simulation** — your testbench with Icarus Verilog or Verilator; the waves in the **Waves** tab.
3. **Synthesis** — Yosys maps the design onto a cell library (a Liberty file); cells, area and timing in Problems; the gate-level **Netlist** as a schematic.
4. **Place and route** — OpenROAD with your LEF, Liberty and SDC; the **Floorplan** tab shows the DEF.
5. **Layout** — GDSII and OASIS files, layers and cell hierarchy; **Cell library and floorplan**; **Constraints and timing data** (SDC, SPEF, SDF).
6. **Checks** — design rules with KLayout and layout versus schematic with Netgen; every result is a row in Problems, with its cell and place.
7. **Gate-level simulation** with the delays of an SDF file, and **test patterns** (STIL) for a tester.

## Your tools, run as separate programs

CadCraft ships none of these tools and no process design kit (PDK). You install them; CadCraft Studio runs them from the folder you set, each as a separate program that reads and writes files. That is how GPL tools are used too: they are never part of CadCraft and never linked into it.

| Tool | What for | Licence (as its project publishes it) | Status |
|---|---|---|---|
| Icarus Verilog | simulation, gate-level simulation | GPL-2.0-or-later | run by us on the sample design |
| Yosys | synthesis | ISC | run by us on the sample design |
| Verilator | fast simulation | LGPL-3.0 or Artistic-2.0 | not run by us yet |
| OpenROAD | place and route, timing, SDF | BSD-3-Clause | not run by us yet |
| KLayout | design rule check | GPL-2.0-or-later | not run by us yet |
| Netgen | layout versus schematic | GPL (see its own licence file) | not run by us yet |

The browser edition reads and shows every file and result but cannot start programs: it saves a run package you run on your computer.

## What it is not

For learning and open-silicon flows, not a signed-off tape-out system. We ship no PDK and make no foundry claims: open PDKs (for example SkyWater 130 or GF180) are your own download. The cell library in the sample design is made up for teaching.
