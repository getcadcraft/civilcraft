---
title: Point clouds in BimCraft and CadCraft
summary: With the Point clouds add-on, open a LAS, LAZ, E57, PLY, PCD, PTX, XYZ or PTS cloud of millions of points, see all of it in the app's 3D view, clean it with a lasso or box, and cut a section through it.
section: tasks
order: 63
keywords: point cloud, las, laz, e57, ply, pcd, ptx, xyz, pts, scan, lidar, clean, lasso, noise, classify, ground, section, 3d, add-on, tiles
---

Most people never need this, so it is an add-on. Switch on {{ui:Point clouds}} in Settings › Add-ons; a {{ui:Point clouds}} tab (BimCraft) or section (CadCraft) appears in the right-hand panel. The file is read in your browser and the tiles are kept in this browser's own storage, or in a folder you pick; nothing is uploaded.

:::warning
Everything this tab reports is a number from your data, not a certificate. It was tested on a made-up site and on small made-up files in each app, not on a real scan: read the first results with care and tell us what you find.
:::

It is the same add-on as in CivilCraft, with the same engine; only the part that draws in the app's own 3D view differs. The app's older Attach / Place / Register scan tools are separate and unchanged.

## Open a cloud

Open a model first in BimCraft (the 3D view is made with the first model), or the 3D tab in CadCraft. Under {{ui:Open a cloud}} choose a file. LAS and LAZ are tiled as they are. E57, PLY, PCD, PTX, XYZ and PTS are read by the app's own reader first, at most 3 million points kept (thinned evenly, the tab says so), then tiled the same way. Metres are assumed unless the file says feet. Press {{ui:Build the cloud}}; a build can be stopped and resumed (LAS and LAZ).

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
- A very large E57 or PLY is read whole before tiling, so it takes a while and keeps only 3 million points.
- No change of coordinate system: metres assumed.
