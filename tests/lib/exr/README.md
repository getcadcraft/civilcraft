# cc-exr — HDR pictures and colour tables

Plain JavaScript (ES modules), no dependencies, no DOM, synchronous, Apache-2.0. Canonical here; byte-identical copies in
`modelcraft/dev/exr/` and `bimcraft/dev/exr/` written only by `node tools/exr/sync.mjs [--check]` (0.7 XF.5, session
`interchange`). Used by the renderer: HDRI environments (RN.3), EXR output with every AOV (RN.9), LUTs (RN.8),
texture sets (MT.3).

```js
import { readExr, writeExr, readHdr, writeHdr, readCube, applyCube, readHdrImage } from './index.js';
const img = readHdrImage(bytes);              // EXR or .hdr → { width, height, data: Float32Array RGBA, … }
const exr = readExr(bytes);                   // every part, every channel (layers = "diffuse.R" name prefixes)
const out = writeExr({ width, height, compression: 'piz', channels: [{ name: 'R', type: 'half', data }, …] });
```

| | Reads | Writes |
|---|---|---|
| OpenEXR | scanline + tiled (full-size level of mipmap/ripmap), single + multi-part, half / float / uint, subsampled channels, NONE RLE ZIPS ZIP PIZ PXR24 B44 B44A; a damaged chunk table is rebuilt; missing blocks are left 0 and counted | one part, scanline or tiled, half / float / uint, NONE RLE ZIPS ZIP PIZ, any attributes |
| Radiance .hdr | RGBE / XYZE, new and old run-length rows, all eight orientation lines, EXPOSURE | RGBE, run-length rows, top-down |
| .cube | 1D, 3D, 1D shaper + 3D, DOMAIN_MIN/MAX, LUT_*_INPUT_RANGE | 1D and/or 3D |

Not read (said with an `unsupported` ExrError): deep data, DWAA/DWAB, HTJ2K, ZSTD; levels other than the full-size one.

Errors are `ExrError` with `code`: `not_exr`, `damaged`, `too_big`, `unsupported`, `bad_image` (writer). Untrusted input:
every offset and count is checked, sizes are capped (`LIMITS`), zlib output is capped at the size each block must have.
Words a person reads are in `messages.js` (`ccexr.*`), copied into the apps' language files by the sync.

| File | What |
|---|---|
| `index.js` | the exports + `readHdrImage` |
| `exr.js` | OpenEXR reader / writer, `layersOf`, `rgbaOf` |
| `piz.js` | PIZ (range table, wavelet, Huffman) |
| `zlib.js` | inflate (capped) and deflate (RFC 1950/1951) |
| `hdr.js` | Radiance RGBE |
| `cube.js` | .cube LUTs, trilinear / tetrahedral |
| `util.js` | `ExrError`, `LIMITS`, half floats, byte reader/writer |
| `messages.js` | `MESSAGES`, `msg()` |

Tests: `node tools/exr/test.mjs` (units; our writer ↔ OpenEXR's Python bindings both ways, bit for bit; the OpenEXR sample
images in `testfiles/exr-corpus/` vs OpenEXR; their damaged files and our truncation / byte-flip fuzz in a worker; .hdr vs
OpenCV; .cube). Format sources and licences: `NOTICE`.
