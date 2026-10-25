# Turbulence benchmarks (0.4 P2 spike)

Scratch-speed checks of `flow-turb.js` outside the suite. Each takes `--opt k=v,…` (attachSA options) and
`FLOW_DIR=<dir>` (a copy of `flow.js` + `flow-turb.js` to try changes on).

| Script | Case | Time |
|---|---|---|
| `pipe.mjs --D 20 --ReTau 600 [--profile]` | fully developed pipe through voxel cells, periodic, body force; f vs Colebrook; `--profile` prints u⁺(y⁺) against the log law | ~25 s |
| `tilted.mjs --W 28 --ReTau 1000` | the plane channel at 45° (pure staircase walls), periodic box; Cf vs Dean | ~1 min |
| `chan.mjs '<opts>'` | the suite's three plane channels | ~3 min |
| `bfs.mjs --H 6 [--dump]` | backward-facing step, Driver & Seegmiller (Re_h 36,000, ER 1.125, 1/7-power inflow δ 1.5h at −4h, slip top), 2-D; x_r vs 6.26h | 1 min (H 6) … 20 min (H 14) |

Results of the spike are in `docs/apps/partcraft.md` (Flow, "Turbulence") and `docs/0.4-sessions/part.md`.
