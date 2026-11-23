Real tool outputs for lib/chip/run/test/run.test.mjs § "REAL tool outputs" (made 2026-11-21 on workstation11a by tools/chip/real-tools.mjs,
session chip-11-fu; log docs/0.11-sessions/chip-11-fu.md). The Pebble sample (fixtures/showcase/chip-pebble) on SkyWater 130
(sky130_fd_sc_hd, open_pdks 1.0.471, Apache-2.0), through the add-on's own run script. Kept as the tools wrote them; two one-line files
(yosys-0.71-error.log, openroad-tcl-error.log) are the exact lines those tools printed in earlier runs of the same session.
  icarus13-vvp.log       Icarus Verilog 13.0 vvp output (RTL simulation)
  verilator-run.log      Verilator 5.054 binary's output        verilator-wave.vcd / .fst   the same run as VCD and as FST (--trace-fst)
  yosys-0.71-stat.txt    Yosys 0.71 stat onto sky130_fd_sc_hd   sta.log   OpenSTA on the synthesized netlist
  openroad.log           OpenROAD 2.0-12381 (2024 build) place, CTS, route, RCX
  drc.lyrdb              KLayout 0.28.16 + sky130A_mr.drc (FEOL + BEOL) on the routed GDSII: 7 min-area (m3.6) items
  lvs.json, lvs.out      Magic 8.3.465 extraction + Netgen 1.5.272: the routed chip matches its netlist
  gls-vvp.log            Icarus 13 on the routed netlist with OpenROAD's SDF (-ginterconnect, -Tmax)
  klayout-cblock.oas     KLayout 0.28.16 writing the routed GDSII as OASIS (strict mode, CBLOCKs)
  final.gds.gz           that GDSII (KLayout from OpenROAD's DEF + the PDK's cell GDS), gzipped
