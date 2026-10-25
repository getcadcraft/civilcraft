<!-- SPDX-License-Identifier: Apache-2.0 -->
# cc-acis — other programs' 3D solids, for display

Plain JavaScript (ES modules), no dependencies, no DOM, synchronous, Apache-2.0. Reads the ACIS data (SAT text or SAB
bytes) a 3DSOLID, REGION or BODY carries in a DWG or DXF and turns the faces it understands into triangles. Nothing is
edited or written. Canonical here; byte-identical copies in `cadcraft/dev/acis/` (the 3D tab) and `modelcraft/dev/acis/`
(DWG/DXF import), written only by `node tools/acis/sync.mjs [--check]` (0.7 D7.25, session `acis`). Format, sources and
every spec gap: `docs/ACIS-READER.md`.

```js
import { readAcis, notDrawnText } from './index.js';
const r = readAcis(entity.acis);            // lib/dwg's { format: 'sat' | 'sab', data }, SAT text, or the bytes
for (const b of r.bodies) b.positions, b.triangles, b.faceOf, b.faces, b.closed, b.volume, b.box;
if (r.notDrawn.length) console.log('Not drawn yet: ' + notDrawnText(r.notDrawn));
```

Drawn: planes, cones and cylinders, spheres, tori and exactsur B-spline surfaces, bounded by straight lines, ellipses
and B-spline intcurves. Anything else is counted by name ("Not drawn yet"), never guessed; every face is checked against
its own edges first. Untrusted input: size caps (`LIMITS`), every pointer and count checked, never a throw.

| File | What |
|---|---|
| `index.js` | `readAcis`, `notDrawnText`, `addNotDrawn`, the DXF helpers re-exported |
| `tokens.js` | SAT / SAB → records (subtypes numbered for `{ ref n }`) |
| `model.js` | records → topology and geometry, by ACIS version |
| `geom.js` | the surfaces' (u, v) maps, B-splines (de Boor) |
| `tess.js` | edges once, faces in (u, v), seams and poles, orientation, closed or not |
| `cdt.js` | constrained Delaunay triangulation (ours) |
| `dxf.js` | where a DXF keeps the data (group 1/3 lines, ACDSDATA), base64 |
| `messages.js` | `ccacis.*` words, `msg()` |

Tests: `node tools/acis/test.mjs` (hand-made solids in SAT/SAB and three versions, dice.sat, the corpus, the ODA File
Converter's re-saves, the DXF helpers, a truncation and byte-flip fuzz in a worker) and `node tools/acis/test-apps.mjs`
(CadCraft keeps, draws and saves them; ModelCraft imports them as solids).
