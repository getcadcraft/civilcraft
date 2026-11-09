<!-- SPDX-License-Identifier: Apache-2.0 -->
# Point clouds add-on: what is built and what is partial (0.9 PC.2 / PC.7-PC.10 / PC.13, updated 2026-11-05, civil-points-09)

Spec: docs/0.9-POINTCLOUD-ADDON.md. Engine: lib/ is a byte-identical copy of REPO/lib/pointcloud (`node tools/pointcloud-engine/sync.mjs`); never edit it here.
Tests: `node bin/test-pointcloud-engine.mjs` (engine), `node tools/pointcloud-engine/browser.mjs` (viewer, EDL, plan refine, folder choice, phone rule) and
`browser-ui.mjs` (the whole flow, incl. stockpile, plan breakline, contour preview, ortho drape, streaming save), as root. Real GPU:
`tools/gpu-remote/run.sh --session pc-gpu --lab -- tools/pointcloud-engine/gpu-fps.mjs`. Listing for the Library: `listing/` (AddonListing, all required sections).
Help topic: civilcraft/dev/help/point-clouds.md. Adapters for BimCraft / CadCraft / Super (PC.11, PC.12): the engine's public surface is lib/index.js; the viewer
(cloud-view.js + edl.js), plan raster (plan-overlay.js) and panels are CivilCraft's own and take `ctx`; an adapter supplies `ctx.api`, a host with `scene`, `cam`, `draw`
(see createCloudView) and the project hooks (`ctx.project()`, `ctx.app()`).

## Done and tested in the browser
Open a LAS, inspect with the storage estimate, build with progress / Cancel / Resume, the cloud list, where the clouds are kept (browser storage, or a folder chosen with
showDirectoryPicker, remembered), 3D view with node selection and a point budget (500 k on a phone), colour modes, point size or size attenuation, eye-dome lighting
(own shader, whole scene through a depth target), lasso / box / polygon with the count shown, class / delete / restore / crop, Undo / Redo, noise filter, ground
classification, geometric classes, Build ground into the project (editPoints), residuals + ten worst places, breaklines picked in 3D or in the plan, contours with a preview
canvas over the plan raster, stockpile (bases: lowest, plane, curved, TIN, typed level; samples above a robust fit are left out of the base) and flight-to-flight volumes with
CSV, orthomosaic drape (the app's own picture opener, then the 3D "Map" colouring), section strip, plan raster that refines when zoomed in, export cleaned LAS 1.4 or LAZ (PC.14: our own lib/pointcloud/laz.js, formats 0/2 in a LAS 1.4 header; streamed to a
chosen file where the browser can; the chunk table position is written last through writeAt).

## Partial or not done
- Selection in 3D is a vertical prism over the outline taken down to a level plane (exact only from the top view or in the plan).
- Decoding in the workers is the fast path only while the edit log is empty; with edits a node is read on the main thread. Colour mode / edit changes drop the drawn nodes and reload them.
- Section strip: one strip, no pan or zoom; the built ground is drawn by the add-on itself, terrain-section.js is not reused.
- "Rebuild only the affected area" (groundSurface region + base) is in the engine, not wired to a UI.
- Input: LAS and LAZ only through the panel. E57 / PLY / PCD / PTX / XYZ and several files of one flight are not wired (pointcloud.js has the readers; PC.11).
- CRS and units: the cloud is assumed to be in the project's coordinate system and metres; no reprojection.
- Orthomosaic: through the app's picture opener, so its limits apply (GeoTIFF under 200 MB, reduced to 16 MP, 25 MB after re-encoding); the cloud is not coloured from it.
- A project file does not remember which cloud it used. Not exposed in the UI: height-above-ground selection, class selection regions, the edit-log import.
- Words: lang/en.json only; other languages come from the language run (lang-final-09).
- Measured on a real GPU once (workstation11a, RTX 5070, made-up site); 50 M points and a real drone survey are not measured; the real file picker is hand-checked only.
