---
title: Chip design: constraints, parasitics, delays and test patterns (SDC, SPEF, SDF, STIL)
summary: List a design's timing constraints in plain words, check them against its pins, read parasitics and delays, and write test patterns for a tester.
section: tasks
order: 60
keywords: sdc, constraints, create_clock, clock, input delay, output delay, false path, multicycle, max delay, spef, parasitics, rc, capacitance, resistance, sdf, delay, back-annotation, stil, ieee 1450, test patterns, vectors, ate, tester
---

## Constraints (SDC)

Open the {{ui:Constraints and timing data}} panel and choose an `.sdc` file. Each constraint is listed in plain words with its line: clocks with period and edges, generated clocks, input and output delays, paths that are not timed or may take more cycles, delay limits, loads, driving cells and clock groups. Commands that are rarer are counted by name.

The file is read, never run. `set name value` is remembered so `$name` reads as the value; everything else that is Tcl (`if`, `foreach`, `expr`, procedures) is kept as written and listed in Problems as "not run", so you know which lines the list does not reflect.

Open the design's DEF as well and every `get_ports` pattern is checked against its pins; a pattern that matches no pin is listed in Problems. Clock periods that are not above zero and delays that name a clock nobody made are listed too.

## Parasitics (SPEF)

Choose a `.spef` file to see each net's total capacitance, how much goes to ground and how much couples to other nets, its resistance and how many nodes it has. Names written as numbers in the file are shown by their real names. A net whose capacitors do not add up to its stated total is listed in Problems.

## Delays (SDF)

Choose an `.sdf` file to list its cell delays (from input to output pin, with edges and conditions), wire delays and added delays, with rise and fall at the typical corner. Timing checks (setup, hold, width) are read too. The simulation that uses these delays is run from the add-on's simulation panel.

## Test patterns (STIL)

Under {{ui:Test patterns (STIL)}}, open the DEF first: its pins become the signals, in the order shown. Clocks from the SDC pulse once in each cycle. Type one vector a line, one character a signal: inputs `0` or `1`, clocks `0` (no pulse) or `P` (pulse), outputs `L`, `H`, `X` (do not care) or `Z` (expect off). Set the period and when outputs are compared, then {{ui:Save STIL file}}. The file has the signals, signal groups, one waveform table, a pattern burst and the pattern. Wrong characters and vectors of the wrong length are listed in Problems and nothing is saved.
