<!-- SPDX-License-Identifier: CC0-1.0 -->
# Render bench scenes (CC0)

Made by CadCraft (0.7 CU.8, session `compute`) with `node tools/bench/render/make-scenes.mjs` from `lib/compute/bench-make.js`
— every number is ours (the "Cornell-style" box uses our own dimensions and colours, not the published Cornell data). CC0-1.0:
no rights reserved. Made once; `--check` proves the files equal what the library makes (the bench page builds the same scenes in
memory). Format: `lib/compute/bench-scenes.js`. Uses: `docs/RENDER-BENCH.md` (speed) and `lib/compute/parity.js` (kernel parity).

| File | What |
|---|---|
| `cornell.json` | Cornell-style box: 2 m room, red and green walls, two blocks, one ceiling panel |
| `interior.json` | 6 × 4 × 3 m room, window opening with sun and sky, glass sphere, metal box, table, point + spot + area lamps |
| `exterior.json` | 200 × 200 m ground, a house, plants scattered by tier (20 000 / 100 000 / 1 000 000) |
| `product.json` | torus knot on a plinth in a white studio |
| `anim.json` | nine boxes turning and rising over 24 frames |
| `furnace-diffuse.json`, `furnace-glass.json` | white Lambert / smooth glass sphere in a uniform environment of radiance 1 (RENDER-SPEC § 9) |
