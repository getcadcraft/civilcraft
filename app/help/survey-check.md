---
title: Check a survey drawing on import
summary: Read levels written as text or in block attributes as survey points, and check a DWG or DXF for wrong units, no coordinate system, a faraway origin, flat contours, odd levels and doubled points before you build ground from it.
section: tasks
order: 23
keywords: survey check, import check, survey levels, spot levels, text levels, levels as text, attributes, units, coordinate system, far from origin, contours at zero, outliers, duplicate points, problems, landscape architect, survey drawing
---

A survey drawing can look right and still be wrong for a ground: its units may be guessed, its contours may sit flat at height 0, or its levels may be written as text that is not geometry at all. The **Survey levels and check** section of the {{ui:Linework}} dialog (see [Open a DWG or DXF as linework](topic:open-dwg-dxf)) reads those levels and tells you what looks wrong before anything is added.

## Levels written as text or in attributes

Many survey drawings give a spot level as a small text next to a cross, such as `104.37` or `EL 104.37`, or as an attribute of a point block. These are not lines, so the linework reader leaves them out. The section lists how many it found and lets you take them as **survey points**:

1. Tick **Take … levels as survey points**. They start unticked, because not every number in a drawing is a height.
2. Text is read when it is a level on its own: a number with a decimal part (`104.37`, `+104,37`, `-3.50`), or a number after `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` or `LEVEL`, with an optional `m`, `ft` or `'` after it. A whole number alone (`12`) is read as a lot or sheet number, not a level; text such as `GATE 3` or a date is never read. Text formatting codes are ignored.
3. For block attributes, choose **Block attribute that holds the level**. CivilCraft finds a tag called ELEV, Z, LEVEL, RL or similar by itself; pick another from the list if the drawing uses its own. The choice is remembered for that file name on this computer, so opening it again starts on the same tag. A tag you pick takes whole numbers as levels too.
4. Click {{ui:Add}}. The points are numbered after the highest number in the project, each point is described with its layer (or its block), and the heights are converted to the project's units like the rest of the drawing. All of it is one step: {{key:Mod+Z}} takes the points away.

The text sits at its own insertion point (or its alignment point when it has one). Text inside blocks is not read, and the drawing is never changed.

## The check

The check runs on what you are about to bring in and lists what it finds, one line for each kind of problem:

| It says | What it means |
|---|---|
| **Units not stated** | The drawing does not say what its units are, so its numbers are read as the project's units. Check one distance you know. |
| **Units converted** | The drawing's units differ from the project's and are scaled (a note, not a fault). |
| **The data spans … km** or **… m** | The extent is larger than 200 km or smaller than half a metre, which usually means the wrong unit (millimetres read as metres, or the other way round). |
| **No coordinate system** | The project has none. It is a warning when the data lies far from zero, as state plane or national grid coordinates do. See [Coordinate systems](topic:coordinate-systems). |
| **Far from the origin** | The data lies more than 100 km from zero. Far from zero, 3D views and exports lose precision and shake. |
| **Contour layer … has no height** | A layer named like contours (TOPO, CONT, CNTR, CONTOUR) holds lines at height 0, so a ground built from them would be flat. |
| **Levels exactly 0** | Some levels are 0 while the typical level is far from it: probably missing heights. |
| **Levels far from the rest** | A few levels sit far outside the others (found against the middle of all the levels, so a steep site with a wide range is not flagged), or above 9,000 m or below -11,000 m. |
| **Points on top of another point** | Two points at the same place with the same level, or with different levels. |

After you click {{ui:Add}}, the same lines go to **Problems**, one for each kind, with the file name, so you can come back to them. The check judges the drawing; it changes nothing in it, and it does not stop you from using the drawing.

:::tip
When the check says contours are flat at 0 and there are levels written as text, take the levels as survey points: they often carry the real heights the contour lines lack.
:::

## What is not checked

The check does not compare the drawing with a second survey, and it cannot tell which coordinate system the drawing is in: it only tells you that none is set.
