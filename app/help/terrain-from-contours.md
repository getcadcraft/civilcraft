---
title: Terrain from contour lines
summary: Make the ground surface from a contour map: pick the line layers, say where each line's elevation comes from, check for crossings and duplicates, and build. Contour lines become breaklines, with flat triangles on ridges and valleys fixed. A map traced from a picture or a PDF can be scaled and placed by two known points.
section: tasks
order: 31
keywords: contours, contour lines, terrain from contours, surface from contours, topographic map, survey map, no coordinates, breaklines, flat triangles, ridge, valley, hilltop, crossing contours, duplicate contours, contour interval, scale a map, two points, place a map, DXF, DWG, shapefile
---

A surveyor sometimes sends a contour map: lines with elevations, but no points. CivilCraft builds the existing ground from those lines.

## Bring the contours in

Open the map as linework: a DXF or DWG drawing, a shapefile or GeoJSON (**GIS** › {{ui:Import}}, or drop the file on the plan). The lines come in as **map layers**. Under **Surface** › {{ui:More}}, choose {{ui:Terrain from contours}}.

## Say where each elevation comes from

Tick the layers that hold contours, then choose **Elevation from**:

- {{ui:The lines' own elevations}}: a line whose vertices all have the same elevation (a 3D polyline, or a polyline with an elevation). A line at 0 is plan linework and has no level.
- A **number field** of the layer (for example ELEV), when the map came with one.
- {{ui:A start and an interval, in the order the lines are listed}}: for lines with no elevation at all. The first listed line gets the **First line's elevation**, the next one that plus the **Contour interval**, and so on. List the lines from the lowest up (or reorder them in the layer).

## Check, then build

{{ui:Check}} lists what is wrong, in words, before anything changes:

- a line with **no elevation** or fewer than two points;
- a **duplicate** line (the same shape twice, even drawn the other way round);
- two lines that **cross**, at different elevations or at the same one (a line that crosses itself too), with the place;
- an elevation that is **not on the interval** (a typing slip such as 105.5 on a 1 m map).

Tick {{ui:Leave out lines that cross another}} to drop the line that crosses most others (then the next, until none cross): a stray line that cuts every contour is the one that goes, not the contours. **Simplify lines within** thins vertices that are closer to a straight run than that distance.

{{ui:Build the ground}} adds the lines to the existing ground as breaklines (one undo step), so the surface passes through every contour exactly. With {{ui:Fix flat triangles on ridges, valleys and hilltops}} ticked and an interval given, CivilCraft also adds a point inside each flat triangle (a triangle whose corners all lie on one contour) at the height the slope next to it continues to, never more than half an interval from the contour. Without that, ridge tops, valley bottoms and hilltops come out as flat plates. On a test hill the error against the true surface fell by a quarter; on a ridge by 40 %.

## A map with no coordinates

For a contour map traced from a picture or a PDF, open **Scale and place the layers by two known points**. Give two points on the map and where they really are; the ticked layers are scaled, turned and moved to fit (one undo step; heights are not changed). The same two points give the scale (shown in the message) and the rotation.

The surface is as good as the map: between two contours it is a plane, so the real ground between them is not known. Check the result against spot heights before relying on it.
