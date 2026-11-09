---
title: Chip design: limits of the file formats
summary: What the chip file readers and writers do not do yet, and how far they have been tested.
section: trouble
order: 90
keywords: limits, not supported, oasis, gdsii, liberty, lef, def, sdc, spef, sdf, stil, wgl, ccs, ecsm
---

## How these were made and tested

Every reader and writer is our own, written from the published descriptions of the formats. They are tested with small sample files we wrote by hand, with round trips (read, write, read again, compare), against a second reader in CadCraft for GDSII, and against a standard compression library for OASIS. **They have not yet been tried on files from other programs or from a foundry's design kit.** If a file of yours does not read, the Problems panel says where reading stopped.

## Not read or not modelled

- **Liberty**: composite current source and other current-based models are kept but not shown; only table lookups (delay, transition, constraint, power) are modelled. Bus pins are read; bundles are read as buses.
- **LEF / DEF**: properties, non-default rules, blockages, regions, groups, fills and scan chains are kept and written back but not drawn. Wires drawn with `RECT` or `VIRTUAL` in DEF are kept, not drawn.
- **SDC**: no Tcl is run (see the constraints topic). Only `set` with a plain value is used.
- **SPEF**: inductances are read but not used; pin loads are not added to the delay estimate.
- **SDF**: constructs other than cell, wire, port and device delays and the usual timing checks are kept as written.
- **STIL**: only the writer, for one waveform table and one pattern. No other tester formats are written.
- **OASIS**: trapezoids are turned into polygons by our reading of the specification and circles into 64-sided polygons; extension records are skipped. The writer writes rectangles, polygons, paths, placements and texts.
- **GDSII**: electrical nodes, fonts and reference libraries are skipped and counted.
- **Layer maps**: XML layer property files are not read.
