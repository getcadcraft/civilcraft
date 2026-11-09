<!-- SPDX-License-Identifier: CC0-1.0 -->
# Pebble — the Chip design add-on's sample design (CC0)

Made once by `node tools/chip/make-sample.mjs` on 2026-11-03; never regenerate it per shot. Open it in /lab/cadcraft:
Chip design › Project › **Open the sample design**.

- **Design (ours):** Pebble, a small RISC-style teaching core: 16-bit instructions, four 8-bit registers, eight bytes of data memory, a
  20-word program in logic (sum 1..10, seven Fibonacci numbers, read the sum back). `pebble_tb` checks the nine printed numbers.
- **cc_cells:** a made-up teaching cell library (Liberty, Verilog models with specify blocks, LEF). Not a real process; no foundry rules.
- **Real runs on the build computer** (through the add-on's own run script): Icarus Verilog  — out/sim (waves:
  out/sim/wave.vcd); Yosys 0.9 (git sha1 1979e0b) — out/synth (801 cells, area 1928); gate-level simulation with the SDF —
  out/gls (waves: out/gls/gls.vcd); STIL from those waves — out/stil/patterns.stil (87 vectors, chip-formats' writer).
- **Made by the sample script, not by a tool:** out/layout/pebble.def (801 cells placed in 17 rows by a greedy fill; **no
  routing**), out/layout/pebble.gds (the same placement as boxes), out/layout/pebble.sdf (each cell's delay from the Liberty numbers).
  OpenROAD, KLayout and Netgen were **not** run. For learning only — not a signed-off design.
