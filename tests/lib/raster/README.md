<!-- SPDX-License-Identifier: Apache-2.0 -->
# cc-raster

Scanned drawings for the CadCraft apps (0.7 LC.6, session `trace`): read a scan, clean it, trace it, snap to it. Plain
JavaScript, no DOM, no dependencies — the same files run in the browser apps and in Node. **Classic image processing only:**
no trained model, no network, nothing leaves the machine (the owner's condition for the auto trace).

| File | What it holds |
|---|---|
| `util.js` | limits (`MAX_PIXELS` 100 M, `MAX_BYTES` 128 MB, `MAX_PAGES` 200, `MAX_TRACE_PIXELS` 64 M), `RasterError` (a `key` the apps print as `scan.err.<key>`), `Workspace` (typed arrays made once and reused) |
| `tiff.js`, `ccitt.js` | our own TIFF 6.0 reader: uncompressed, PackBits, LZW (+ predictor), CCITT Group 4; 1–16 bits, grey / palette / RGB; strips; several pages. Tiled, BigTIFF, JPEG-in-TIFF, planar, Group 3 and deflate files are refused with a key |
| `png.js`, `jpeg.js` | PNG read / write (all depths, no interlace), baseline JPEG read (progressive files go to the host's own decoder) |
| `image.js` | grey, `flatten`, `threshold` (auto = flatten + Otsu, adaptive = Sauvola), `despeckle`, `findSkew` (from the sheet's long lines), `rotateGrey`, `crop`, `erasePolygon` / `eraseRect` |
| `trace.js` | the trace: thinning, centre-line graph, lines and arcs to a tolerance, joins, squares, corners, text and hatching set aside |
| `snap.js` | raster snapping: ends, middles, corners, crossings of the traced centre lines of the tile under the pointer |
| `index.js` | `readScan(bytes, page)`, `sniffScan`, `scanPages`, and everything re-exported |

Sources: the TIFF 6.0 specification (Adobe, 1992), ITU-T T.4 / T.6 (the Group 4 code tables), ITU-T T.81 (JPEG), the PNG
specification (W3C), Zhang and Suen, "A fast parallel algorithm for thinning digital patterns" (1984), Kåsa's circle fit,
Sauvola and Pietikäinen (adaptive threshold), Otsu (1979). The code is ours. Pillow (python3) writes some of the test TIFF
files as an independent writer; it is a test oracle only and ships nothing.

The apps' copies are byte-identical (`node tools/raster/sync.mjs [--check]`), in `cadcraft/dev/raster/` and `bimcraft/dev/raster/`.
Tests: `node bin/test-raster.mjs`. Fixtures: `fixtures/raster/` (made once by `tools/raster/make-fixtures.mjs`).
