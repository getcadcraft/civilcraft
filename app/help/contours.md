---
title: Read contours, elevations and slopes
summary: Set the contour interval and major contours, show elevation bands, slope arrows and triangles, and read ground elevations under the pointer.
section: tasks
order: 30
keywords: contours, contour interval, major contours, labels, elevation bands, slope arrows, triangles, spot elevation, surface analysis, elevation analysis, slope analysis
---

The surface is shown with contours as soon as it exists. Everything in this topic is set under **Display** in the left panel. Display settings change only what you see (and what you export); they are not undo steps.

## Set the contour interval

1. Under **Display**, choose a value in **Contours every**.
   - In feet: 0.25, 0.5, 1, 2, 5, 10 or 20 ft.
   - In metres: 0.1, 0.25, 0.5, 1, 2, 5 or 10 m.
2. Choose **Major every**: the 2nd, 4th, 5th or 10th contour.
   Major contours are drawn heavier and labeled with their elevation. They fall on whole multiples of the major spacing (with 1 ft contours and every 5th major: 245, 250, 255 …).
3. Turn {{ui:Contour labels}} off if the labels crowd a small plot.

A new project starts at 1 unit with every 5th contour major. Contours bend at breaklines; if they cut straight across a flowline or ridge, that line is not a breakline yet (see [Build and refine the surface](topic:build-surface)).

:::note
Contours are drawn only when there are no more than 2,000 levels between the lowest and highest point. On a site with a lot of relief and a very small interval, the plan shows no contours at all: choose a larger interval.
:::

## Read an elevation anywhere

Move the pointer over the plan. The status bar shows:

- **E** and **N** under the pointer
- **Ground** and the existing ground elevation there, interpolated on the triangle under the pointer
- **Graded** and the proposed elevation, where a pad or corridor has changed the ground
- "Off the surface" outside the surface

To read a survey point exactly, choose {{ui:Select}} and click the point: the right panel shows its number, easting, northing, elevation, description and group.

## Show elevation bands

1. Tick {{ui:Elevation bands}}.
   The surface is filled with color from low (blue-green) to high (ochre-brown). A legend under the checkboxes lists each band's elevation range.
2. Choose how many bands in **Bands**: 5, 8, 10 or 12. The bands split the range from the lowest to the highest elevation into equal steps.

Bands are for looking only. They are not exported to DXF or plotted to PDF.

## Show slope arrows

Tick {{ui:Slope arrows}}. A short arrow on each triangle large enough to hold one points downhill. Flat triangles get no arrow. Arrows are a quick check for drainage direction; the slope value itself is not labeled yet.

## Show triangles, points and edges

- {{ui:Triangles}} draws the TIN's edges. Turn it on to check how the surface connects the points, especially along breaklines and at the outside.
- {{ui:Points}} draws each survey point; {{ui:Point labels}} adds its number, elevation and description (or less: see **Point labels** in [CivilCraft settings](topic:settings)).
- {{ui:Breaklines}} draws breaklines (and the boundary) in orange.
- {{ui:Surface edge}} draws the outline of the surface.

## Existing or proposed

Once a pad or corridor grades without problems, **Surface** under **Display** offers {{ui:Proposed (graded)}}. The contours, bands and arrows then show the graded surface, so you can see the new ground and the daylight around it. Switch back to {{ui:Existing ground}} to see the survey.

## What gets exported

DXF and PDF output follow these settings: what you have turned off is not written, and the contours are those of the surface shown. Elevation bands are never exported.
