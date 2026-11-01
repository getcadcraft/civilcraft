---
title: Objects from linework, kept linked
summary: Make paving, a planted area, a bed, a hedge, a path, a wall, a kerb, steps, a ramp, a platform, a swale or a feature line from a line; it follows when the line moves, until you break the link.
section: tasks
order: 163
keywords: from a line, linework, DWG, DXF, link, linked, follow, regenerate, break link, feature line, feature line from linework, imported layer, outline, supercad studio, drawing line
---

{{ui:From a line}} (Landscape › {{ui:More}}): click a feature line, or a line or outline of an imported DWG/DXF layer. A closed line can make paving, a lawn, a planted bed, a meadow, groundcover, a bed or a platform; an open line a path, a wall, a kerb, steps (its first and last point), a ramp, a hedge or a swale. Either kind can make a **feature line**, except a feature line itself.

## A feature line from a line

A feature line made from a line takes its points, closed if the line was closed. Its levels are laid on the existing ground (0 where there is none yet), and its use is **Off**: it shapes no ground until you choose a use and set its levels in its Properties. When the line moves, a feature line with the same number of points keeps each level you set; when the line gains or loses points, the levels are laid on the ground again. See [Feature lines](topic:feature-lines).

The new object keeps a **link** to its line. When the line moves (you drag its points, or the drawing is moved or re-read), the object takes the new shape in the same undo step, and through the ground modifiers the proposed ground follows. Properties says what it is linked to; {{ui:Break link}} makes it free.

Lines are checked first: a line needs at least 2 points (3 for an outline), at most 5000, real numbers, an outline must be closed and must not cross itself. A line that fails is not used: the object stays as it was and the Problems panel says why. If the line is deleted the object stays and the Problems panel notes it.

## In SuperCad Studio

Open the site and the 2D drawing in the same project. Pick one line or polyline in the 2D drawing, press Ctrl+K and run {{ui:Landscape object from the picked drawing line}}: CivilCraft asks what to make, as above, and the object stays linked to that line of the drawing. After you change lines in the drawing, Ctrl+K {{ui:Update the landscape from the drawing}} makes the objects follow, one undo step for each line. The project's link file records which object follows which line. SuperCad Studio's own help has a Landscape topic.
