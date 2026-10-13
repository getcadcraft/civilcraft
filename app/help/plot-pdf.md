---
title: Plot the plan to PDF
summary: Plot everything or the current view to a vector PDF on a standard sheet at an engineering or metric scale, in layer colors or black.
section: tasks
order: 120
keywords: plot, print, pdf, sheet, scale, paper size, plan sheet, publish, title block, north arrow, scale bar
---

{{ui:PDF}} plots the plan to a vector PDF on one sheet, with a title strip, a north arrow and a scale bar. The PDF is made in the browser and downloaded; it does not go through the browser's print dialog.

## Plot

1. Set up the plan under **Display**: the surface shown, the contour interval and which things are on. The plot follows these settings.
2. If you want only part of the site, zoom and pan the plan to it.
3. Click {{ui:PDF}} in the **Export** group, or press {{key:Mod+P}}.
   The **Plot the plan to PDF** dialog opens.
4. Choose the **Area**: {{ui:Everything}} or {{ui:What is on screen}}.
5. Choose the **Paper**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 or A1. A feet project starts on Tabloid, a metre project on A3. Sheets are always landscape.
6. Choose the **Scale**. The list marks the largest scale that fits with "(fits)" and selects it.
   - Feet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metres: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Choose the **Ink**: {{ui:Layer colors}} or {{ui:Black}}.
8. Read the line under the choices. It gives the size of the area on paper and the sheet size, for example "The area is 297 × 222 mm at 1" = 40' on a 432 × 279 mm sheet (landscape)."
9. Click {{ui:Download PDF}}.
   The browser downloads `<name>.pdf`. The status bar says "Plotted <name>.pdf at 1" = 40'."

If the area is larger than the sheet at the scale you chose, the plot is centered and the edges are cut off. Choose the scale marked "(fits)" or a larger sheet.

## What is on the sheet

- The plan, centered in the drawing area, as true vectors: contours, labels, alignments with stationing, corridors, pads and daylight lines, pipes, points.
- Line weights by layer: alignments, pads and pipes heavier; triangles and minor contours fine.
- A title strip along the bottom with the project **Name**, the scale, a note of the contour interval and which surface (existing or graded), and the date and build on the right.
- A north arrow in the upper-right corner (plan north is up) and a scale bar in the title strip.
- The map layers shown under the plan (a picture, map tiles or a map service), when **Map layers under the plan** is ticked: they are drawn as one picture of the whole drawing area at 150 dots per inch, under the linework, and a map's attribution goes in the title strip. CivilCraft waits up to 8 seconds for map pictures still arriving; if some are still missing the status bar says so.

Text uses the PDF's built-in Helvetica. Characters outside the Western European set (Windows-1252) print as "?", and the status message counts them.

## What is not plotted

- Elevation bands.
- The profile view. Plotting profiles is not available yet.
- More than one sheet (for an alignment, use [plan and profile sheets](topic:plan-profile-sheets)), viewports, a custom title block or portrait sheets.

:::note
The dialog says slope arrows are screen-only. In this build, slope arrows that are turned on under **Display** are plotted (and exported to DXF). Turn them off before plotting if you do not want them.
:::

## Printing on paper

Open the downloaded PDF in any PDF viewer and print it at 100% (actual size) so the scale stays true. "Fit to page" changes the scale.
