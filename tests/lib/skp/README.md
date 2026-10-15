# cc-skp — a SketchUp (.skp) file reader

Plain JavaScript (ES modules), no dependencies, no DOM, Apache-2.0. Reads `.skp` files into one plain model; it
never writes them. The contract is `docs/SKP-LIB-SPEC.md` in the CadCraft site repo. Format knowledge comes from
[OpenSKP](https://github.com/iamahsanmehmood/openskp) (MIT), used as a map (see `NOTICE`); the code is ours. Nothing
here uses or contacts SketchUp, its SDK or any Trimble service.

```js
import { readSkp } from './read.js';
const skp = await readSkp(bytes /* Uint8Array */, { onProgress, signal });
// skp.defs[skp.root] = the model's own geometry; instances point at other defs with column-major 4×4 matrices.
```

Errors are `SkpError` with `code`: `not_skp`, `too_new`, `unsupported`, `damaged`, `too_big`. Anything skipped is
counted in `skp.notes`. Coordinates are inches, Z up.

| File | What |
|---|---|
| `read.js` | `readSkp`, `sniffSkp`: reads the header records, picks the container, adds counts |
| `vff.js` | SketchUp 2021+ (header + ZIP archive) |
| `legacy.js` | SketchUp 3 … 2020 (header + one MFC object stream) — loaded on first use |
| `zip.js` | minimal ZIP reader (central directory; stored and deflate via `DecompressionStream`) |
| `util.js` | `SkpError`, bounds-checked `Reader`, `LIMITS`, matrix helpers |
| `messages.js` | every error and note a person reads (`MESSAGES`, keys `ccskp.*`, English) and `msg()`: the page's language through `globalThis.ccI18n` when it has the key (docs/LANG.md § Shared libraries); after a change `node tools/lang/lib-keys.mjs cc-skp` |

## The format, as we understand it

**Header.** Every file starts with UTF-16LE string records: `FF FE FF`, a length (u8; `FF` → u16 follows;
`FFFF` → u32 follows), that many UTF-16 code units. Record 1 is `SketchUp Model`, record 2 the version in braces,
`{25.0.575}`. SketchUp 2021+ then writes `VFF` and a ZIP archive; older files a 16-byte id and the object stream.

**2021+ archive.** `model.dat` (the model), `materials/<folder>/material.xml` (+ the texture image beside it; one
`Layer_<name>` material per tag carries the tag's colour), `meta/meta.dat` (display unit), `meta/model_thumbnail.png`,
`styles/*/style.xml`. The archive's offsets are relative to where it starts inside the file.

**model.dat** is nested records: 2-byte tag, u32 length, payload. Ids are little-endian integers as long as their
record (1–6 bytes). The paths vff.js follows:

- materials `F401 > F701 > D430 > D530 > C832` (id in `DC05 > DE05`, name `CC32`)
- tags `F801 > 983A > 993A > 8C3C` (id, name `8D3C`, hidden `8E3C` = 1, `8F3C > C832` its colour material)
- definitions `F901 > 7017 > 7117 > 7C15` (entities `8813`, guid `7D15`, name `7E15`, kind `8315`: 0 component,
  1 group, 2 image — checked: every group instance points at kind 1, every component instance at kind 0)
- the model `F601 > 8813`
- in an entity list: vertices `8913 > C409` (`C509` = 3 doubles), edges `8A13 > B80B` (`B90B`/`BA0B` vertex ids),
  faces `8B13 > AC0D` (`AD0D` normal + plane offset; `AE0D > 9411` loops `> 9511 > A00F` coedges: `A10F` edge id,
  `A20F` 0 = along the edge; `AF0D` back material), component instances `8C13 > 6419`, groups `8D13 > 4C1D > 6419`,
  images `9013 > 401F > 6419`, guides `9113`/`9213`, dimensions and text `9913`, curves `9713`/`9613` (their segments
  are ordinary edges), bookkeeping `8E13 9B13 9E13 9F13 A013` (A013 = the list's bounding box incl. its instances)
- `D007` on an entity: `DC05 > DE05` id (and `DD05` attributes, texture placement), `D107` material, `D207` tag,
  `D307` flags (base `06`, `+01` hidden, `+08` soft, `+10` smooth). No `D207` = Layer0.

Loops: the first loop is the outer one and runs counter-clockwise about the face normal; holes run the other way
(the reader checks and fixes both, and says so in `notes` if it ever has to).

**Placement** (`6619`, 13 doubles): `r00 r01 r02 r10 r11 r12 r20 r21 r22 tx ty tz w` — the rotation/scale ROWS, so
`p' = (R·p + t) / w`. Checked against the files' own stored bounding boxes (A013) of definitions that hold rotated
groups: read as rows, they come out exactly (or off only by the 4.7 in their dimension text reaches past the
geometry); read as axes, every one is off, by up to 85 in. Rotated walls also meet their neighbours only when read as
rows. `w` is homogeneous (0.5 = scale × 2). The reader returns column-major 4×4 (`m[12..14]` = translation).

**Texture coordinates** (front side, textured faces): the face's plane axes are `x = normalize(Z × n)`,
`y = n × x` (vertical normals: X and ±Y); `u = p·x / tileWidth`, `v = p·y / tileHeight`. A positioned texture stores
a 3×3 matrix (texture → plane, row vectors) under `D007 > DC05 > DD05 > B136 > B236 > 1027 > 1127 > 1327 > 1527`;
its inverse maps plane → texture (projective when the texture was distorted).

**Classic files (≤ 2020)**: see the header comment of `legacy.js`.

## Status

- **2021+ (VFF):** definitions (model, components, groups, images), faces with holes, front/back materials, tags,
  UVs, loose edges with their flags, soft/smooth face edges, instances (matrix, name, tag, hidden, material),
  materials with texture bytes, tags with visibility and colour, thumbnail, display unit. The four 2021+ corpus files
  match OpenSKP exactly (counts, total area, world bounding box).
- **Not read** (counted in `notes`): text, dimensions, guides, scenes, styles, section planes, attribute
  dictionaries, back-side UVs, image entities' own crop/size beyond their definition.
- **Not seen yet** (handled, untested on real files): image entities, `w ≠ 1` placements.

## Tests

`node tools/skp-test/test.mjs [--corpus dir] [--verbose] [--no-fuzz]` — units on hand-made bytes, truncation fuzz,
then the corpus against OpenSKP as a black-box oracle. Apps carry byte-identical copies:
`node tools/skp-test/sync.mjs [--check]`.
