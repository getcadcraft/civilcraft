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
| Verilator | fast simulation (VCD or FST waves) | LGPL-3.0 or Artistic-2.0 | run by us on the sample design |
| Yosys | synthesis | ISC | run by us on the sample design |
| OpenSTA | timing after synthesis | GPL-3.0 | run by us on the sample design |
| OpenROAD | place and route, power grid, clock tree, parasitics, SDF | BSD-3-Clause | run by us on the sample design |
| KLayout | GDSII from the routed DEF, design rule check | GPL-2.0-or-later | run by us on the sample design |
| Magic | layout netlist for LVS | Magic VLSI licence (BSD-style) | run by us on the sample design |
| Netgen | layout versus schematic | GPL (see its own licence file) | run by us on the sample design |

"Run by us" means: the sample chip went through that stage with that tool, through this add-on's own run script, on SkyWater 130 (sky130_fd_sc_hd) for place and route and the checks. The tool versions were Icarus Verilog 13, Verilator 5.054, Yosys 0.71, OpenROAD 2.0 (2024 build), KLayout 0.28.16, Magic 8.3 and Netgen 1.5.272. Other versions print their reports a little differently; tell us when something is not read.

Some things the tools need that are not the add-on's:
- **KLayout with Ruby** for most PDK rule decks (SkyWater's deck is a Ruby script). Some KLayout packages are built without Ruby; the check then says "no interpreter".
- **Verilator's FST waves** need the lz4 library and headers where Verilator's C++ build can find them.
- **Gate-level timing with wire delays** needs Icarus Verilog 12 or later (stage option `interconnect`). Choose the `min` or `max` corner for an SDF from OpenROAD, which writes no typical values.

The browser edition reads and shows every file and result but cannot start programs: it saves a run package you run on your computer.

## What it is not

For learning and open-silicon flows, not a signed-off tape-out system. We ship no PDK and make no foundry claims: open PDKs (for example SkyWater 130 or GF180) are your own download. The cell library in the sample design is made up for teaching.
