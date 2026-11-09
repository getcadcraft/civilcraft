---
title: Point clouds from a drone or scanner
summary: With the Point clouds add-on, open a LAS or LAZ file of millions of points, look at all of it, clean it, sort it into ground, vegetation and buildings, and build the ground, contours and volumes from it.
section: tasks
order: 62
keywords: point cloud, las, laz, drone, photogrammetry, recap, lidar, scan, ground, classify, noise, stockpile, volume, cut and fill, contours, breakline, eye-dome, orthomosaic, ortho, drape, map layer, export las, export laz, compress
---

Most people never need this, so it is an add-on. Switch on {{ui:Point clouds}} in Settings › Add-ons; a {{ui:Point clouds}} tab appears in the right-hand panel. The file is read in your browser and cut into tiles that are kept in your browser's own storage (or a folder you choose). **Nothing is uploaded.**

:::warning
Everything this tab reports is a number from your data, not a certificate. It was tested on a made-up site, not yet on a real drone survey: read the first results with care and tell us what you find. The registered professional decides what the ground, contours and volumes are worth.
:::

## Open a cloud

Under {{ui:Open a cloud}} choose a LAS or LAZ file. The tab says how many points it holds, its coordinate system and units, and how much room a build needs; press {{ui:Build the cloud}}. A build can be stopped and carries on with {{ui:Resume}} (choose the same file again). The file is never changed. A 100-million-point file builds in minutes on a workstation and about as much room as the file.

Under {{ui:Clouds on this computer}} you open or remove a cloud. {{ui:Keep clouds in a folder…}} (Chrome, Edge and the Studio app) keeps the tiles in a folder you pick, for example a CadCraft clouds folder in Documents, so a 10 GB cloud does not have to fit the browser's storage; clouds built earlier stay where they were built. The browser asks again for permission after a restart: press {{ui:Use the folder … again}}.

## Look at it

{{ui:Look at it in 3D}} draws the cloud from coarse tiles and refines as you move closer, never more than {{ui:Most points drawn}} at once (2.5 million; 500 thousand on a phone). Colour by the file's own colour, height, class, intensity or residual. {{ui:Eye-dome lighting}} shades edges by depth so the shape reads without normals (off on a phone); {{ui:Points shrink with distance}} makes far points smaller and near ones larger; {{ui:Point size}} sets the size. The plan shows the cloud as a raster under your drawing and **refines when you zoom in** to a part of it.

## Clean it

Under {{ui:Clean}} draw a lasso, a box or a polygon in the plan (or in 3D from the top view: in 3D the outline is taken straight down, so it is exact only from above). The tab shows how many points are inside **before** you apply: {{ui:Delete these points}}, {{ui:Change their class}}, {{ui:Restore deleted points}} or {{ui:Crop to this boundary}}. {{ui:Undo}} and {{ui:Redo}} walk the edit log; the file itself is never changed. {{ui:Noise filter…}} marks stray points as low points (class 7) or high noise (class 18).

## Sort it

{{ui:Find the ground}} works tile by tile and marks ground (class 2) and low points; the tolerance is 0.15 m, or 0.08 m with the survey-grade switch. It reports tile seams that disagree. {{ui:Classify vegetation and buildings}} then marks low, medium and high vegetation and buildings from height above the ground and how flat the surroundings are. There is no machine learning, so a flat-topped shed under trees can be wrong: look.

## Ground, contours, breaklines

{{ui:Build ground}} makes the existing ground from the ground points and adds it to the project the same way a LAS import does (one undo step). It then compares the points with it: the mean, RMS, 95th percentile, the share within tolerance, and the ten places that differ most, each with {{ui:Go there}}. Colour by {{ui:Residual}} shows where the ground and the cloud disagree.

A **breakline** (a kerb, ditch or top of bank) is picked on the cloud: {{ui:Pick a breakline on the cloud}} in the 3D view takes the nearest drawn point at each click, and {{ui:Pick a breakline in the plan}} takes the nearest cloud point (ground first) under each click; double-click or Enter ends the line. The next {{ui:Build ground}} uses it. {{ui:Show contours}} draws the contours over the cloud in a small picture and sets the project's interval.

## Volumes

{{ui:Stockpile volume…}} works out the volume of the surface above a base inside a boundary you draw. Draw the boundary on level ground round the pile and choose the base: the lowest boundary point, a plane, a smooth curved base, a surface through the boundary, or a level you type. On sloping or curved ground use the plane or the curved base; the lowest point reads too high. Boundary points that stand above the rest (a tree on the line) are left out of the base. {{ui:Flight to flight}} gives cut and fill between two clouds. Both can be saved as CSV.

## Orthomosaic

Under {{ui:Orthomosaic (picture from above)}} choose the drone's orthomosaic together with its world file and `.prj` when it has them: a GeoTIFF, or a PNG or JPEG. It becomes a **map layer** of the project, so the plan shows it under your drawing, and the 3D view (colour {{ui:Map}}) paints it on the ground you built, so {{ui:Build ground}} first. The tab says how much of the cloud the picture covers, and warns when it covers none: the usual cause is a different coordinate system, so give the `.prj` file with it. When there is no `.prj`, the program asks where the coordinates are. The picture is kept inside the project file; a GeoTIFF over 200 MB is refused and a very large mosaic is reduced to 16 megapixels, so for a big survey cut the mosaic to the site first.

## Export

{{ui:Export}} writes the cleaned, classified cloud as a new file (all points, the clean classes, or only the ground). Under {{ui:File type}} choose:

- **LAS 1.4 (not compressed)**: point format 6, or 7 with colour.
- **LAZ (compressed)**: the same points compressed without loss, so every point comes back exactly. It is written as point format 0, or 2 with colour, in a LAS 1.4 file. On the made-up 300 m site the LAZ was about a fifth of the size of the LAS 1.4 file. LAZ formats 0 and 2 hold classes 0 to 31 only: a point with a higher class is refused with a message, so export that cloud as LAS 1.4.

The LAZ is written by CadCraft's own compressor, made from the published LAZ specification. We have checked that our own reader and two independent LAZ readers (laz-perf, which the app uses to open LAZ files, and laspy with lazrs) read every point back exactly, and that LAZ files made by laspy come out byte for byte the same when we write their points again. Other programs have not been tried yet, so if one will not open a file, tell us which.

Where the browser can write a file as it goes, you choose the file first and a very large cloud is written to it a tile at a time instead of being gathered in memory; otherwise the file is gathered and downloaded, which is fine up to a few hundred megabytes.

## What it does not do

It reads LAS and LAZ only (E57, PLY and PCD are not wired into this tab yet, and several files of one flight are not joined), does not reproject a cloud (the project's system and metres are assumed), does not read Autodesk's RCP or RCS files, does not make a surface from photographs, and does not find poles, kerbs or pipes by itself.
