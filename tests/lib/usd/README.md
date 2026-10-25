<!-- SPDX-License-Identifier: Apache-2.0 -->
# cc-usd — OpenUSD read and write (0.7 XF.2, session `usd`)

DOM-free, synchronous, no dependencies, Apache-2.0. Canonical here; copies in each app that opens or exports USD, written only
by `node tools/usd/sync.mjs [--check]` (with the `ccusd.*` words). Conventions for what CadCraft writes:
`docs/USD-CONVENTIONS.md`. Licence notes: `NOTICE` and `docs/0.7-sessions/usd.md` § Licence gates.

| File | What |
|---|---|
| `index.js` | front door: everything below, plus `readLayer(bytes)` (format by the first bytes), `writeLayer`, `sniffUsd` |
| `sdf.js` | the layer model: specs by path, typed values `{t, v}`, value types and roles, paths, list ops |
| `usda-read.js` / `usda-write.js` | text `.usda` |
| `usdc-read.js` / `usdc-write.js` | binary "crate" `.usdc` (reads 0.4.0 – 0.16.0, writes 0.8.0) |
| `intcode.js`, `lz4.js` | the crate's integer coding and LZ4 chunks |
| `usdz.js` | `.usdz` packages (stored zip, 64-byte aligned) |
| `stage.js` | composition: sublayers, LIVRPS arcs, variants, list ops, target mapping → `Stage` |
| `geom.js` | transforms (every xformOp, pivots, `!invert!`, `!resetXformStack!`), values at a time, meshes, shapes, units |
| `scene.js` | a stage as a plain scene: groups, meshes, prototypes, OpenPBR materials, lamps, cameras |
| `build.js` | `UsdBuilder`: writes a scene by the conventions (used by every app's `usd-<slug>.js`) |
| `messages.js`, `util.js` | words (`ccusd.*`), errors, limits, bytes |

**Untrusted input.** Every offset, count and index checked; caps in `util.js` `LIMITS` (tables, arrays, value bytes,
nesting depth, layers per stage, zip entries); a crate value that contains itself is refused; a mesh whose indices point
outside its points is dropped; a referenced file that can't be read is left out with a note. Errors are `UsdError` with
`code` not_usd | damaged | too_big | unsupported | missing | bad_scene. Not read: splines (`.spline` animation curves),
array edits (crate 0.14), relocates' effect on composition, value clips, `.mtlx` documents referenced as layers (left out
with a note; MaterialX graphs are MT.4, wave 2).

**Lamps.** USD lights give radiance (`inputs:intensity` × 2^`inputs:exposure`); ModelCraft lamps give lumens. Written:
intensity = lumens ÷ (683 × area × π) (area of the sphere or rectangle), and the exact lumens in `cadcraft:lumens`; read back
from `cadcraft:lumens` when present, else by the same formula.

**Proof:** `node tools/usd/test.mjs` — units, known answers, refusals, truncation and byte-flip fuzz, and with the oracle
(OpenUSD's own library in `/var/www/CADCRAFT/oracles/usd-venv`, test-only): every layer of the public corpus read by us and
written back as `.usda` and `.usdc` reads the same in the library; every mesh's world points agree with the library's.
