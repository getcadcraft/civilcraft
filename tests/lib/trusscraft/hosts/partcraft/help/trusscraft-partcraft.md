---
title: TrussCraft in PartCraft
summary: What TrussCraft does in PartCraft: the set as display bodies in the viewport, the outline from a sketch, cut and stock lists, STL and OBJ, a life-size jig drawing.
section: tasks
order: 5
keywords: truss, trusses, trusscraft, partcraft, bodies, sketch, stl, obj, jig, stock
---

## What you get

- Type the roof outline, or select a sketch with a closed outline in the feature tree and click {{ui:Take outline from the selected sketch}}. Lay out, then {{ui:Place as bodies in the viewport}}: every timber piece is a closed mesh body in the species colour, in one undo step per group of up to 5000 pieces. Placing again replaces the group; {{ui:Remove placed trusses}} takes it away.
- The shop outputs: the cut list and joint schedule, a stock length plan that nests the cut pieces onto the lengths you list (one run per sawn size), a jig layout of one truss drawn 1:1 (print it at 100 %) with member outlines, plate rectangles and cut angles, and the whole set as STL or OBJ.

## What it cannot do

The bodies are display bodies kept in the part file: not part of the part's solid, so no boolean, mass, STEP or picking. PartCraft has no roofs to read, so hips and valleys come from the straight skeleton of the outline you give, at one pitch.
