---
title: Point clouds in BimCraft and CadCraft
summary: With the Point clouds add-on, open a LAS, LAZ, E57, PLY, OBJ, USDZ, GLB, PCD, PTX, XYZ or PTS cloud or phone scan of millions of points, see all of it in the app's 3D view, clean it with a lasso or box, and cut a section through it.
section: tasks
order: 63
keywords: point cloud, phone scan, iphone, ipad, lidar scan, obj, usdz, usdc, glb, gltf, compare with model, deviation, tolerance, as-built, field-verified, las, laz, e57, ply, pcd, ptx, xyz, pts, scan, lidar, clean, lasso, noise, classify, ground, section, 3d, add-on, tiles
---

Most people never need this, so it is an add-on. Switch on {{ui:Point clouds}} in Settings › Add-ons; a {{ui:Point clouds}} tab (BimCraft) or section (CadCraft) appears in the right-hand panel. The file is read in your browser and the tiles are kept in this browser's own storage, or in a folder you pick; nothing is uploaded.

:::warning
Everything this tab reports is a number from your data, not a certificate. It was tested on a made-up site and on small made-up files in each app, not on a real scan: read the first results with care and tell us what you find.
:::

It is the same add-on as in CivilCraft, with the same engine; only the part that draws in the app's own 3D view differs. The app's older Attach / Place / Register scan tools are separate and unchanged.

## Open a cloud

Open a model first in BimCraft (the 3D view is made with the first model), or the 3D tab in CadCraft. Under {{ui:Open a cloud}} choose a file. LAS and LAZ are tiled as they are, a piece at a time (a LAZ file is never copied whole into memory, and a big one is decoded on several threads). E57 is read page by page and every point kept. PCD, PTX, XYZ and PTS are read by the app's own reader first, at most 3 million points kept (thinned evenly, the tab says so), then tiled the same way. Metres are assumed unless the file says feet. Press {{ui:Build the cloud}}; a build can be stopped and resumed (LAS and LAZ). A big cloud is tiled by several workers at once.

## Phone scans

Scanning apps on an iPhone or iPad with a LiDAR sensor export a surface (a mesh), not a cloud of points. {{ui:Open a cloud}} reads a PLY with faces, an OBJ, and a USDZ that holds an OBJ, a PLY or readable USDA text, lays points on the surface about every 10 mm (at most 3 million), keeps the colours, and checks the way the scan stands: if its layers say Y is up (the usual phone and game convention) it is turned Z up and its floor is levelled, and the tab says so. If it only seems that another axis is up, it is left alone and the tab tells you. A USDZ that holds a binary USD file (a .usdc, what an iPhone or iPad scan normally holds) is read too, with the transforms of its parents, and so is a GLB (binary glTF) and a bare .usdc: every mesh in the file is joined into one. Not read: skeletons and animation (the stored pose is used), Draco or meshopt compressed GLB (export it uncompressed), colours that live only in a texture picture, and a USD that points to other files for its geometry; the tab says when it met one.

:::warning
The binary USD and GLB readers were checked on real files from other projects (a USDZ from an authoring tool, a glTF-to-USD conversion, an OpenUSD test file, Khronos sample models), not on an export from a phone app: none with a licence that allows tests was found. If your scan fails, tell us which app and version made it.
:::

## Compare with model (BimCraft)

With a model and a cloud open, {{ui:Compare with model}} measures how far every scan point is from the nearest surface of the model's elements, draws the points coloured by that distance, and lists each element as within your tolerance (default 20 mm), outside it, only partly scanned (the points touch too small a part of it to say) or not scanned. {{ui:Check scale and level}} first says whether the scan looks like another unit, has another axis up or has a floor that leans. The elements within tolerance can be marked field-verified in one step (method: scan, the tolerance in the note), and {{ui:Download the report}} saves every element with its numbers as CSV.

It compares the scan with the model as placed in the 3D view. It is not a survey, and a scan that is shifted or at the wrong scale looks wrong everywhere.

## Where it sits

The cloud is drawn in the 3D view with coarse tiles that refine as you move closer, never more than {{ui:Most points drawn}} at once. If the cloud's own coordinates overlap the model (or drawing), it is drawn where its numbers say, so a registered scan lines up with the design; otherwise it is centred on the model or drawing with its lowest point on the ground. Eye-dome lighting starts off in these apps: tick it to try.

## Clean it

{{ui:Clean}} takes a lasso, a box or a polygon drawn over the 3D view (a vertical prism down to the cloud's middle height: use the Top view when it has to be exact), changes the class of the points inside, deletes them, restores them or crops to them. A noise filter finds stray points. Every step is one undo.

## Sort it (BimCraft only)

{{ui:Classify}} finds the ground and then the geometric classes (low, medium and high vegetation, buildings), tile by tile. CadCraft does not have it: it carries no TIN or ground modules, and an add-on may not reach into another folder.

## Section strip

{{ui:Section strip}} draws a line across the cloud and shows the points within a width of it, seen from the side.

## Not built yet

- Building the ground into the model, contours, stockpile and flight-to-flight volumes, the orthomosaic drape and the plan raster are CivilCraft's; they are not in these two apps.
- CadCraft has no Classify.
- A very large PCD, PTX, XYZ or PTS is read whole before tiling and keeps only 3 million points.
- A .gltf with separate files, Draco or meshopt compressed GLB, and skeleton or animation data are not read (the stored pose is used).
- A LAZ with variable chunks or the layered point formats (6 to 10) is read the older way, whole into memory.
- Compare with model is BimCraft's; CadCraft has no model of triangles to compare with.
- No change of coordinate system: metres assumed.
