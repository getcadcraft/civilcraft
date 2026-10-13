---
title: Plan layers
summary: The fixed layer names, colors and line weights CivilCraft uses on screen, in DXF and in PDF, and which display setting controls each.
section: reference
order: 60
keywords: layers, layer names, ncs, colors, aci, line weights, dxf layers, pdf, display settings, linework
---

Everything on the plan belongs to a layer. The names follow the common civil layer pattern (discipline, major group, minor group). Layers are fixed in this build: you cannot rename them, change their colors or add your own. In DXF, each layer has the color number shown; in PDF with {{ui:Layer colors}}, the same colors are used, and with {{ui:Black}} everything prints black.

| Layer | Holds | Color (DXF number) | Shown when |
|---|---|---|---|
| C-TOPO-MINR | Minor contours | Gray (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Major contours | White or black (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Contour labels | White or black (7) | {{ui:Contours}} and {{ui:Contour labels}} |
| C-TOPO-TINN | Triangle edges | Gray (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Breaklines and the boundary | Orange (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Surface edge | White or black (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Slope arrows | Cyan (4) | {{ui:Slope arrows}} |
| V-NODE | Survey points | Green (3) | {{ui:Points}} |
| V-NODE-TEXT | Point labels: number, elevation, description | Green (3) | {{ui:Points}} and {{ui:Point labels}} |
| V-NODE-LINE | Lines from line codes (groups that are not breaklines) | Green (3) | {{ui:Points}} |
| C-ROAD-CNTR | Alignment centerlines | Red (1) | Always |
| C-ROAD-STAN | Station ticks and labels, PC and PT | Red (1) | Always |
| C-ROAD-CORR | Corridor edges | Yellow (2) | Always |
| C-ROAD-SCTN | Sample lines (where sections are cut) | Gray (8) | When the alignment has sample lines |
| C-GRAD-PADS | Pad outlines | Blue (5) | Always |
| C-GRAD-DAYL | Daylight lines | Magenta (6) | Always |
| C-GRAD-SLOP | Grading slope lines | Magenta (6) | Always |
| C-GRAD-FEAT | Feature lines (3D) | Green (3) | Always |
| C-STRM-PIPE | Pipes | Blue (5) | {{ui:Pipes}} |
| C-STRM-STRC | Structures | Blue (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Pipe and structure labels | Blue (5) | {{ui:Pipes}} |
| C-STRM-PROB | Pipes and structures with problems | Red (1) | {{ui:Pipes}} |

Breaklines are drawn only while **Surface** under **Display** is {{ui:Existing ground}}; the boundary is drawn with either surface.

## Line weights in PDF

| Weight | Layers |
|---|---|
| 0.50 mm | Alignment centerlines, pads, pipes, problem pipes |
| 0.35 mm | Major contours, daylight lines, structures |
| 0.25 mm | Breaklines |
| 0.13 mm | Minor contours |
| 0.09 mm | Triangle edges, grading slope lines |
| 0.18 mm | Everything else |

DXF files carry no line weights; set them by layer in your CAD program.

## Label sizes

Labels are sized on paper: contour labels 2.0 mm, station labels 1.8 mm, PC and PT labels and pipe and structure labels 1.6 mm, point labels 1.5 mm. Pipe labels give the name, diameter and slope; structure labels give the name and rim. On screen they stay the same size as you zoom. In DXF, they are scaled for the scale named in the export message; see [Export the plan to DXF](topic:dxf-export).

## Not shown on any layer

Elevation bands are drawn under the linework on screen only. The profile view is not part of the plan.
