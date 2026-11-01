---
title: TrussCraft in CadCraft
summary: What TrussCraft does in CadCraft: truss elevations, the roof layout plan, the force diagram and the cut and joint schedule drawn as CAD objects on layers, saved as DXF or DWG.
section: tasks
order: 5
keywords: truss, trusses, trusscraft, cadcraft, layers, dxf, dwg, dimensions, hatch, polyline
---

## What you get

- Type the roof outline, or select a closed polyline and click {{ui:Take outline from the selected closed polyline}}. {{ui:Draw the roof truss layout plan}} draws the outline, a line per truss with its mark and the bay dimension at the polyline's own place. The command line has TRUSSDESIGN, TRUSSLAYOUT, TRUSSCHECK and TRUSSPLACE.
- {{ui:Draw the truss elevation}} draws the members as closed polylines, the plates as solid hatches, marks, joint numbers, span, rise and heel dimensions and the not-a-design label. {{ui:Draw the member force diagram}} draws tension on layer TRUSS-TENSION and compression on TRUSS-COMPRESSION with the forces in kN. {{ui:Draw the cut list and joint schedule}} draws the tables.
- Each drawing is one undo step, to the right of what is already drawn. They are plain CAD objects on the TRUSS-* layers, so Save as DXF or DWG, plot and edit as for anything drawn by hand. Drawing units are converted to mm by the drawing's units.

## What it cannot do

The objects do not follow the design if you edit them: draw again (Remove the drawings first). Nothing is drawn in 3D. CadCraft has no roof model to read, so hips and valleys come from the straight skeleton of the outline you give, at one pitch.
