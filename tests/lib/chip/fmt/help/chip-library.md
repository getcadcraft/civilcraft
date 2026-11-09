---
title: Chip design: cell libraries and floorplans (Liberty, LEF, DEF)
summary: Read a cell library's timing, power and area, its cell outlines and pins, and see a placed and routed design's floorplan.
section: tasks
order: 50
keywords: liberty, lib, lef, def, standard cell, cell library, timing, nldm, lookup table, power, leakage, area, macro, pin, site, row, floorplan, placement, routing, net, special net
---

## Open library and design files

Open the {{ui:Cell library and floorplan}} panel and choose a file in {{ui:Liberty, LEF or DEF file}}. You can open one of each; they are joined by cell name.

- **Liberty (`.lib`)**: every cell with its area, leakage power, pins (direction, capacitance, function), timing arcs (related pin, sense, type) and their lookup tables (delay and transition by input slew and output load), internal power and flip-flop or latch behaviour.
- **LEF (`.lef`)**: units, routing and cut layers (direction, pitch, width, spacing), vias, sites, and each cell's size, pins with their shapes and obstructions.
- **DEF (`.def`)**: die area, rows, tracks, placed components, pins, nets and power nets with their routed wires.

The table lists each cell with its area, size (from the LEF), leakage, pins and how many timing arcs it has.

## See the floorplan

Open a LEF and then a DEF. The view shows the die outline, rows, every placed cell at its real size (fixed cells in red), pins, signal wires (green) and power wires (yellow) at their widths. Cells the LEF does not describe are drawn as 1 µm squares and counted under the view.

## What is checked

Problems lists: tables whose size does not match their indexes, indexes that do not increase, cells with no area, outputs with no timing arc (Liberty); cells with no size and pins with no shape (LEF); nets that name a component or pin the design does not have, and sections whose count is wrong (DEF).

## Writing

The readers keep everything they read, including statements they do not model, so a file read and written again by the add-on reads back the same. The add-on uses this to hand files to the tools you run yourself.
