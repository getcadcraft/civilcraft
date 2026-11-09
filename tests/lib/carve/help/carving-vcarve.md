---
title: V-carving letters and logos
summary: How the V-bit is moved, why the depth follows the width, what the flat floor and clearing options are, and how exact the result is.
section: tasks
order: 2
keywords: v-carve, vcarve, v bit, angle, depth, flat floor, clearing, medial axis, ridge, letters, logo, inlay
---

## How the cut is made

A V-bit cuts a groove as wide as it is deep: at the angle of the bit, a depth of 3 mm with a 60° bit is a groove 3.46 mm wide at the top. So a wide part of a shape needs a deep cut and a narrow part a shallow one. Router carving follows the line that is equally far from the edges (the middle of each stroke), with the tip as deep as the width there needs. The walls of the cut then meet the edge of the outline all the way round, and corners come to a point.

Shapes are read by the even-odd rule: a closed shape inside another is a hole (the middle of an O).

## Deepest cut and the flat floor

You set the **deepest cut**. Where a shape is wider than twice that depth times the tangent of half the bit angle, the V-bit alone would have to go deeper than allowed, so the floor is **flat** at the deepest cut and the walls are cut at full depth. The result panel tells you how wide that is. Choose what happens to the floor:

- **Clear with a flat mill**: a flat end mill (give its diameter and stepover) clears the floor in passes from the walls inward, then the V-bit trims the strip next to the walls. This is the usual way and the fastest.
- **Clear with the V-bit**: the V-bit cuts the floor itself in many passes. It works, but a V-bit leaves a ridge between passes (you choose how high, default 0.15 mm), so it takes many passes and is refused beyond 400.
- **Leave it**: only the walls are cut and the floor is left standing.

The flat mill and the V-bit are two operations with a tool change between: the program asks for the tool, or on GRBL pauses.

## How exact it is

The tests cut the toolpaths into a simulated block and compare it with the ideal V-carve. On letters, rings, rectangles and stars, with a 60° and a 90° bit, nothing is cut deeper than about one simulator cell, and under half a percent of a shape is left more than 0.3 mm shallower than ideal. That is the model of the cutter's shape only: it does not know your machine's accuracy, the bit's tip radius (a real V-bit has a small flat on its tip) or chatter.

Very thin features, narrower than about two grid cells (0.1 mm by default), are not carved.
