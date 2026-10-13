---
title: Build and refine the surface
summary: How CivilCraft triangulates the existing ground, and how to shape it with breakline groups, drawn breaklines, an outer boundary and the longest outside edge.
section: tasks
order: 20
keywords: tin, surface, triangulation, breakline, boundary, existing ground, eg, create surface, delaunay, triangles, max edge, outer boundary
---

CivilCraft has one existing ground surface per project. It is a TIN (triangulated irregular network) built from your points, and it rebuilds automatically every time an input changes. There is no "rebuild" command and no out-of-date surface.

## What goes into the surface

- Every point with an elevation in a group set to {{ui:Points}}.
- Every group set to {{ui:Breakline}}, joined in point-number order.
- Every breakline you draw with the {{ui:Breakline}} tool.
- The outer boundary, if you draw one.
- The **Longest outside edge** setting.

Triangles never cross a breakline: the surface is forced to follow it, then made as even as possible around it (Delaunay everywhere else).

## Make coded lines into breaklines

1. In the left panel under **Points**, find the group (for example FL).
2. Set its **Surface** choice to {{ui:Breakline}}.
   The surface rebuilds, the line is drawn in orange (with {{ui:Breaklines}} on under **Display**), and **Breaklines** in the surface facts goes up by one.
3. Check the line on the plan. It must run point to point in the order the line was shot. If it zig-zags, the group holds more than one line, or the points are not numbered in order: set the group back to {{ui:Points}} and draw the lines by hand (next section).

## Draw a breakline through points

1. Press {{key:B}}, or click {{ui:Breakline}} in the **Surface** group.
   The hint says "Breakline: click survey points in order (it takes their elevations). Enter finishes."
2. Move the pointer near a point. A small orange square marks the point it will take.
3. Click the points of the line one after another. Each click names the point and its elevation in the status bar.
4. Press {{key:Enter}} to finish.
   The status bar says "Breakline 1 added; the surface was rebuilt."

Clicks must land on a survey point that has an elevation; a click elsewhere is refused with "Click a survey point with an elevation: a breakline takes the points’ elevations." {{key:Backspace}} drops the last point; {{key:Esc}} cancels the whole line.

:::warning
Finish with {{key:Enter}}. Double-clicking also finishes, but in this build it drops the point you double-clicked. Click the last point once, then press {{key:Enter}}.
:::

To remove every drawn breakline at once, click {{ui:Remove drawn breaklines}} in the **Surface** section. To remove only the last one, use {{key:Mod+Z}}. Drawn breaklines cannot be selected or edited one by one yet.

## Draw the outer boundary

A boundary trims the surface to the area you trust, for example the survey limits, so that long triangles across unsurveyed corners go away.

1. Press {{key:O}}, or click {{ui:Boundary}}.
2. Click the corners in order around the area. A dashed line shows the shape.
3. Press {{key:Enter}}.
   The status bar says "Boundary set; triangles outside it are gone." **Boundary** in the surface facts says "Yes" and the number of corners.

Things to know:

- There is one boundary. Drawing another replaces it. {{ui:Remove the boundary}} takes it away.
- It can only take away: a boundary that reaches past the points is cut back to their outline, with the note "The boundary reaches past the points; it was cut back to their outline."
- Its corners take their elevations from the surface, so the edge follows the ground exactly.
- Hide (inner) boundaries are not available yet.

## Trim long outside triangles

Without a boundary, the surface fills the whole outline of the points, including long thin triangles across concave edges.

1. In **Surface**, type a length in **Longest outside edge** and press {{key:Enter}}. Start with about two or three times your typical shot spacing.
2. Outside triangles whose outer edge is longer than that are removed, working inward until every outer edge is short enough. An edge that is a breakline is never peeled.
3. Type 0 to keep every triangle again.

## Read the surface report

Under the surface facts, a box lists what the builder did. With an ochre bar on its left it is information; with a red bar it holds an error and there is no surface.

| Message | Meaning |
|---|---|
| "3 points were at the same place as another and joined it." | Points closer than 0.0001 in plan became one vertex (the first one kept). |
| "2 places have two different elevations …" | Points on top of each other, or breaklines crossing, disagree in height. The breakline's elevation wins, then the first one. |
| "1 breakline piece could not be forced into the surface." | A very short or nearly overlapping breakline piece did not fit; check that spot. |
| "A surface needs at least three points with elevations." | Too few points: check the column order and the groups. |
| "The points are all on one line: no triangles." | The points have no width, for example a single traverse line. |
| "The boundary does not overlap the points." | The boundary is somewhere else, often a units or coordinate mix-up. |
| "No triangles are left inside the boundary." | The boundary is too small or misplaced. |

## A surface read from LandXML

When you open LandXML, its first TIN surface is used as it is: the **Surface** heading says "Surface (from LandXML)" and **Longest outside edge** is grayed out. While that surface is in use, breakline groups, drawn breaklines and a new boundary do not change it. To build the surface from the file's points instead, click {{ui:Rebuild the surface from the points}}. {{key:Mod+Z}} brings the LandXML surface back.

## Related

- [Read contours, elevations and slopes](topic:contours).
- [Import survey points](topic:import-points).
