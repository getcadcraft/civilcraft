<!-- SPDX-License-Identifier: Apache-2.0 -->
# SMLib spike (0.7 D7.45, session part-08)

The write-up and the go/no-go are in `docs/spikes/D7.45.md`. Here: `build.sh` (SMLib + SM_API + `k1.cpp` to WebAssembly with
Emscripten, on the capped slice), `k1.cpp` (the K.1 parts and five more, closed-form volumes, through SMLib's C API) and
`run-k1.mjs` (runs the built `k1.mjs` in Node). Nothing here ships; the usd-brep checkout and the build live outside the repo.
