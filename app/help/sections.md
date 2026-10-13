---
title: Sample lines and cross sections
summary: Cut sections square to an alignment, see the ground, the design and the cut and fill at each station, and get volumes by average end areas.
section: tasks
order: 55
keywords: mass haul, mass diagram, balance point, shrink, swell, haul distance, borrow, waste, section sheets, cross section sheets, sections pdf, sections, cross sections, sample lines, section view, cut, fill, areas, average end area, end area volumes, earthwork, station, offset, csv
---

A cross section shows the road the way it will be built: across the alignment at one station, the existing ground, the design (the corridor or pad graded in) and the cut and fill between them.

## Add sample lines

1. Select an alignment. In **Properties**, under **Sample lines**, click {{ui:Add sample lines}}.
2. Set **Every** (the spacing: 50 ft or 20 m to start), **Left width** and **Right width** (how far each section reaches from the centerline).
3. To cut a section at a particular station, type it in **Add a station** (for example `2+35`) and press {{key:Enter}}.

Sections are cut at every whole multiple of the spacing, at both ends of the alignment, at the start and end of every curve (PC and PT), and at the stations you add. The sample lines show on the plan as gray lines across the alignment; they also go out in DXF, DWG and PDF on layer C-ROAD-SCTN. Every change is one step: {{key:Mod+Z}} undoes it.

## The section view

Open it with {{ui:Section view}} in the alignment's **Properties**, {{ui:Sections}} under **Surface** › {{ui:More}}, or {{key:X}}. It takes the place of the profile view under the plan.

- Step through the sections with the arrows in its bar, the station list, or {{key:Left}} and {{key:Right}} with the section view focused ({{key:Home}} and {{key:End}} for the first and last).
- The gray line is the existing ground, the red line the design. Cut is shaded orange, fill green. Corridor points are marked: CL (centerline), EOP (edge of pavement), SH (shoulder) and DL (daylight).
- The header gives the station, this section's cut and fill areas and the vertical exaggeration. **Fit** fills the panel; choose 1× to see the section true to scale.
- The thick line on the plan shows which section is on screen.

## Section sheets

{{ui:Section sheets (PDF)}} under **Sample lines** puts every section on PDF pages, in rows from left to right and top to bottom in station order. Choose the **Paper**, the **Plan scale** (the horizontal scale of the sections) and the **Profile exaggeration** (1×, 2×, 5× or 10×); the dialog says how many sections fit on a page and how many pages that makes.

Each section shows a grid with offsets and elevations, the ground (dashed), the design, cut and fill shaded (orange and green), the corridor points, and under it its station and its cut and fill areas. Every section on the sheets is drawn the same size, tall enough for the biggest one; when that does not fit the page at your exaggeration, CivilCraft uses the largest one that does and says so. The title strip names the alignment, the stations on that page, the scales and "Sheet 1 of 3".

## Volumes by average end areas

Between two neighboring sections, the volume is the average of their two areas times the distance between their stations. The bar shows the totals for the alignment, and {{ui:CSV}} downloads every section's areas and volumes with running totals (cubic yards for feet projects, cubic meters for metric ones).

**Properties** shows the same totals next to the grid-method volumes from [Earthwork volumes](topic:volumes). The two are different approximations: closer sections bring them closer, and on a straight road on flat ground they are the same.

:::note
Cut and fill are counted only inside the graded areas (a corridor's or a pad's daylight lines), as the grid method does. Without a corridor or pad the design is the ground, so a section shows no cut or fill.
:::

## Mass haul

**Mass haul** under **Sample lines** draws the mass-haul diagram from the same end-area volumes: along the stations, the running total of cut less fill.

- **Shrink (−) or swell (+) of the cut** says what a cubic yard of cut makes once it is placed as fill: −10 % (the starting value, a placeholder) means it shrinks to 0.9; rock that swells might be +5 %. Use your geotechnical report's figure.
- Where the line rises the road is in cut; where it falls, in fill. Above zero (shaded orange) earth moves up station; below zero (green), down station.
- **Balance points** are where the line crosses zero: between two of them the cut and fill balance. The table lists each balanced stretch, the volume moved (its highest or lowest point) and the average haul distance (the shaded area divided by that volume).
- Where the line ends off zero, what is left over is **waste** (above) or **borrow** (below). In that last stretch only the earth beyond the level it ends on counts as moved.

**CSV** saves the mass ordinate at every section, the stretches and the factor.

