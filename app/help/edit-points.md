---
title: Edit a survey point
summary: Change one point's number, coordinates, elevation or description, or drag it to a new place on the plan.
section: tasks
order: 14
keywords: edit point, move point, change elevation, renumber, point number, description, drag, northing, easting, fix a point, bust
---

A busted shot, a wrong rod height, a description typed wrong: fix the one point, and the surface follows.

## Change a point's values

1. With {{ui:Select}}, click the point on the plan. **Properties** shows its number, easting, northing, elevation and description in boxes.
2. Type the new value and press {{key:Enter}} (or click away). Leave **Elevation** empty for a point with no elevation.
3. The surface, contours and everything built on them update at once.

Each change is one step: {{key:Mod+Z}} undoes it and {{key:Mod+Y}} redoes it. A value CivilCraft cannot use (a number another point already has, letters in a coordinate) is refused: the box is outlined and the status bar says why.

A new description code makes a new point group, as an import does (see [Build a surface](topic:build-surface)).

## Move a point on the plan

1. Select the point (it gets a ring).
2. Drag the ring. The status bar shows the easting and northing where it will go.
3. Let go to move it; its elevation stays. Press {{key:Esc}} before letting go to put it back.

## Breaklines follow the point

A breakline drawn with the {{ui:Breakline}} tool copies the points it goes through. When you move a point or change its elevation, the breakline corners on it move with it, in the same step. Breakline groups made from descriptions are always rebuilt from the points.

:::note
A surface read from a LandXML file keeps its own triangles: point edits change it only after {{ui:Rebuild the surface from the points}}.
:::
