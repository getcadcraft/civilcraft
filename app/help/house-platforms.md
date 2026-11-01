---
title: House platforms on sloped sites
summary: Grade a pad on a hillside: retaining walls as pad edges, the cut and fill map shaded by depth with spot levels (plan and 3D), a section drawn anywhere through the ground and the design, and ramps or sloped pads for driveways.
section: tasks
order: 47
keywords: platform, pad, house pad, sloped site, hillside, retaining wall, cut and fill, cut fill map, spot levels, free section, section line, council drawings, driveway, ramp, sloped pad, grade, swell factor, earthwork
---

A house platform is a **pad** (**Design** › {{ui:Pad}}): a flat polygon at one level, graded into the ground. Four things help on a slope.

## Retaining walls as pad edges

Select the pad and set a side to {{ui:Vertical (retaining wall)}} instead of a slope (**Properties** › {{ui:Sides and retaining walls}}, or {{ui:Vertical: retaining walls}} for every side at once). The wall's height is read from the ground along it: top at the ground, bottom at the pad, shown at both ends and at its tallest point on the plan, with a warning when it is taller than the limit you set. Walls and slopes can be mixed side by side.

## The cut and fill map

Tick {{ui:Cut and fill map}} under **Show**. The plan is shaded by how deep the cut or fill is, in equal steps (cut warm, fill blue, nearly level pale) with a legend, and **spot levels** are printed on the pad: the change in level at points on a grid, and the deepest cut and the highest fill marked ▲. The cells are the same ones the earthwork volumes use, so the map and the numbers always agree.

In the 3D view, choose **Cut and fill** from the colour list to drape the same colours over the ground and the design.

A swell or shrink factor is in the mass-haul tool (**Design** › {{ui:Mass haul}}); it is not applied to a pad's volumes.

## A free section

Under **Surface** › {{ui:More}}, choose {{ui:Free section}}, click the points of the section line anywhere (it may bend) and press {{key:Enter}}. A dialog draws the section: the existing ground, the graded design (dashed) and the cut and fill between them, shaded, with their areas (the design counts only inside the pads and roads). {{ui:Vertical exaggeration}} defaults to fit the drawing; {{ui:Save as SVG}} and {{ui:Save as CSV}} give you a drawing for the council and the numbers.

## Ramps and sloped pads

Under **Surface** › {{ui:More}}, choose {{ui:Ramp or sloped pad}}, click the low end and then the high end, press {{key:Enter}}, and give the width, the level at the low end and the grade. The pad is a strip whose corners carry those levels (the edge between two corners runs at a constant grade), and it grades into the ground like any pad. Any pad's corners can also carry their own levels, so a driveway, a ramp or a tilted terrace is a pad with a level on each corner.
