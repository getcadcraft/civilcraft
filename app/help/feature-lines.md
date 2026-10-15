---
title: Feature lines
summary: Draw 3D lines you grade vertex by vertex, make stepped offsets of them, and use them as breaklines of the ground or as sloped pads in the design.
section: tasks
order: 65
keywords: grade overlay, elevation overlay, grade arrows, feature line, grade, slope, elevation, stepped offset, offset, breakline, curb, ditch, berm, sloped pad, daylight, grading, 3d polyline
---

A feature line is a line with an elevation at every vertex: a curb, a ditch flow line, the top of a berm, the edge of a sloped pad. You set its elevations by number or by grade, copy it sideways with a step up or down, and choose what the surfaces do with it.

## Draw one

1. Choose **Surface** › {{ui:More}} › {{ui:Feature line}}, or press {{key:L}}.
2. Click its vertices on the plan. A click on a survey point takes the point's place and elevation; anywhere else the vertex takes the existing ground's elevation there.
3. Press {{key:Enter}} to finish an open line, or click the first vertex again to close it.

The new line is selected and starts as a breakline of the existing ground, lying on the ground.

## Set elevations and grades

**Properties** lists the vertices with their distance along the line, their **Elevation** and the **Grade to next** (in percent). Type either and press {{key:Enter}}:

- An elevation moves only that vertex.
- A grade sets the elevation at the far end of its segment; the vertices after it stay where they are, so the next segment's grade changes.

Also in **Properties**:

| Action | What it does |
|---|---|
| **Raise or lower all by** | Adds the height you type to every vertex. |
| {{ui:Elevations from the ground}} | Puts every vertex back on the existing ground (vertices off the surface keep theirs, and are listed). |
| {{ui:One grade, first to last}} | Keeps the first and last elevations and puts the vertices between on one even grade. |

The selected line shows its elevations at the vertices and its grades along the segments on the plan. Drag a vertex with {{ui:Select}} to move it; its elevation stays.

## Stepped offsets

Under **Stepped offset**, type a **Distance** (positive to the right of the line's direction, negative to the left), then a height (up or down by) or a slope in percent, and click {{ui:Make the offset line}}. The copy is a new feature line: for example the back of a curb 0.5 ft to the side and 0.5 ft higher, or a ditch edge 6 ft out at 2 %. A distance that would fold the copy over itself at a tight bend is refused.

## Grades and elevations on the screen

Press {{key:E}}, or tick **Grades and elevations on feature lines** under Display, to see every feature line's grade along each segment (with a small arrow pointing downhill) and its elevation at the vertices. They show on the screen only: nothing is added to the drawing, and the PDF, DXF and DWG stay as they are. Short segments and crowded vertices are left unlabelled until you zoom in. The selected line always shows its own grades and elevations.

## In the profile view

A feature line that crosses an alignment shows in that alignment's profile view, with its name and elevation at the crossing; lines running beside it can be shown as well. See [Design a vertical profile](topic:profile).

## What the surfaces do with it

Choose **Use**:

| Use | What happens |
|---|---|
| Breakline of the existing ground | The existing ground runs through the line at its elevations, like a drawn breakline. |
| Graded into the design | A **closed** line becomes a sloped pad: the proposed surface inside it is graded to its edge. Turn on **Daylight to the ground** to run cut and fill slopes (horizontal to 1 vertical) from its edge to the ground, as a pad does; each slope starts at the edge's own elevation there. |
| Only drawn | It stays on the plan and goes out in DXF, DWG and PDF (layer C-GRAD-FEAT, 3D polylines), but the surfaces ignore it. |

Volumes, sections and the 3D view include feature lines graded into the design, like pads. Each change is one step: {{key:Mod+Z}} undoes it.
