<!-- SPDX-License-Identifier: Apache-2.0 -->
# Point clouds in BimCraft and CadCraft (0.9 PC.11 / PC.12): what is built and what is not

Canonical files: `lib/pointcloud-hosts/` (main.js, common.js, hosts/bim.js, hosts/cad.js, lang-extra.json). Everything else in this folder is a byte-identical (or import-rewritten) copy made by
`node tools/pointcloud-adapters/sync.mjs` from the engine `lib/pointcloud/` and CivilCraft's add-on; never edit a copy. Test: `node tools/pointcloud-adapters/browser.mjs --app bim|cad`.

## For other add-ons (scan to BIM)
`window.ccPointCloud` (set while the add-on is on) is the add-on's ctx:
- `.cloud`: the open engine cloud or null. `cloud.bounds`, `cloud.origin`, `cloud.select(view, opts)`, `await cloud.readRegion(bb)` (points with the edit log applied: x, y, z, cls), `cloud.forEachNode`, `cloud.ground()`, `cloud.edits`. Coordinates are the file's own, metres.
- `.placement()`: `{ T, how }` with scene = file point - cloud.origin + T (Z-up, metres; BimCraft's viewer is Y-up: (x, y, z) -> (x, z, -y)). `how` is `model` (the cloud overlaps the model, file coordinates are the model's) or `centre`.
- `.on('cloud', fn)`, `.view` (the 3D layer: attach, fit, stats, pickPoint, screenToGround), `.openCloudById(id)`.
Read only: never edit lib/pointcloud; ask the add-on to change the edit log through `cloud.edits`.

## Built
Open a cloud, tile it into the browser's own storage (or a chosen folder), draw it in the app's 3D view with a point budget and levels of detail, colour modes, point size and shrinking points, lasso/box/polygon clean (class, delete, restore, crop, noise) with undo, a section strip. E57, PLY, PCD, PTX, XYZ and PTS go through the app's pointcloud.js reader (at most 3 million points kept, thinned evenly) and then the same tiler. BimCraft also has the Classify fold (ground, geometric classes) using CivilCraft's ground modules copied next to host.js.

## Not built
- CadCraft: no Classify fold (no TIN or ground modules in the app; an add-on may not import across folders).
- Neither app: Build ground into the project, contours, stockpile and flight volumes, orthomosaic drape, plan raster (CivilCraft's), eye-dome lighting on by default (opt-in), cloud colouring from a model.
- Non-LAS files are limited to the app reader's limits and 3 million kept points; the reader's whole-file read means a big E57 takes a while before the tiler starts.
- Units: metres assumed unless the file says feet; no reprojection; the app's own point cloud tools (Attach, Place, Register) are separate and unchanged.
- SuperCad Studio (0.9 PC.12): no adapter file of its own, on purpose. Super has no 3D scene of its own (its demo 3D panel is SVG); every 3D view in it is a mounted app's, and the mounted CadCraft and BimCraft run this add-on through hosts/cad.js and hosts/bim.js unchanged. What Super lacked was a home for the add-on's panel (CadCraft draws it in the shell's right panel): supercadcraft/dev/super-addons.js gives it one under Properties. Settings > Add-ons in Super lists the loader of the app mounted last (window.ccAddons). ModelCraft (in a frame) and PartCraft have no Point clouds add-on. Tests: tools/pointcloud-adapters/browser-super.mjs, browser-super-bim.mjs.
