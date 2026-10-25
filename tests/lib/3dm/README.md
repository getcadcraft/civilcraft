<!-- SPDX-License-Identifier: Apache-2.0 -->
# cc-3dm — CadCraft's reader for .3dm files

0.7 SU.810 (sessions `usd`, then `3dm`; log `docs/0.7-sessions/3dm.md`). DOM-free, synchronous, no dependency, Apache-2.0
(`NOTICE`: the format's layout was read from the openNURBS toolkit after a licence check; the code is ours). The apps carry
byte-identical copies written only by `node tools/3dm/sync.mjs [--check]` (ModelCraft `dev/io/3dm/`, PartCraft `dev/3dm/`),
which also writes the `ccdm.*` words (`tools/3dm/lang.mjs`: en, es-MX and id drafts) into their lang files.

```js
import { open3dm, read3dm, toScene, msg } from './3dm/index.js';
const scene = open3dm(bytes, { mode: 'cached-first' });   // = toScene(read3dm(bytes))
scene.items      // [{ kind: 'mesh' | 'curve' | 'instance', name, id, layer, color '#rrggbb', hidden, … }] in file units
scene.blocks     // Map(id → { name, items })      scene.layers  [{ name 'Parent::Child', color, visible }]
scene.units      // { name: 'mm', metres: 0.001 }  scene.report  counts, surfaces { cached, ours {kind}, notRead {kind} }
scene.notes      // [{ key: 'ccdm.note.*', vars }] → msg(key, vars): what was read differently or left out
```

| File | What it does |
|---|---|
| `archive.js` | the start, chunks (4- or 8-byte lengths), numbers, strings, uuids, compressed buffers (zlib) — every count and offset checked |
| `objects.js` | the class records: attributes, layers, materials, block definitions, meshes, NURBS / line / polyline / arc / poly curves, NURBS / plane / revolution / sum surfaces, polysurfaces (with the render meshes saved per face), extrusions (with their mesh cache, and version 5's mesh user data), block placements, points |
| `read.js` | the tables (properties, settings: units and tolerance, layers, materials, block definitions, objects); a record that will not read is counted, not guessed |
| `geom.js` | points on curves and surfaces (de Boor on openNURBS's knot vectors, rational in homogeneous form), curves as polylines within a tolerance |
| `tess.js` | triangles: a face's saved render mesh first, else our tessellation of trimmed faces (edges sampled once on their 3D curves so neighbours meet; loops in (u, v); earcut; grid points + Delaunay flips; edge halving by sag and normal angle); extrusions (walls + capped outer/holes) |
| `cdt.js` | points inserted into a triangulated polygon, kept Delaunay (Lawson flips) |
| `scene.js` | the model as items, blocks, layers, colours (by object / layer / material), visibility, the report and its notes |
| `messages.js`, `util.js` | the words (`ccdm.*`), the error class (codes not_3dm / damaged / too_big / unsupported) and the caps |
| `earcut.js`, `zlib.js` | copies of ModelCraft's earcut (ISC notice inside) and of lib/exr's zlib |

**Read:** file versions 2–8 (tested: 5, 6, 7, 8 written by the toolkit), meshes (vertex colours, texture coordinates, double-precision
points when the file has them), curves, polysurfaces and lone surfaces (planes, NURBS, revolutions, sums), extrusions (holes, caps),
blocks (nested), layers (paths, colours, on/off), materials (base colour), object colour sources, hidden objects, units.
**Not read yet (left out, said in the notes):** SubD, points and point clouds, annotation (text, dimensions, leaders, text dots,
hatches), lights, clipping planes, details, surface proxies and offset surfaces without a saved mesh, curve proxies, linked blocks,
polysurfaces in the old (version 1–2) layout, material textures, groups, user text; mitered extrusion ends come in square.

Tests: `node tools/3dm/test.mjs` (Node, with the rhino3dm oracle in `/var/www/CADCRAFT/oracles/3dm-venv` when it is there);
browser: `node tools/3dm/browser.mjs` (ModelCraft), `node tools/3dm/browser-partcraft.mjs` (PartCraft).
