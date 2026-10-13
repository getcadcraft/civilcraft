---
title: Earthwork volumes
summary: Read cut, fill and net volumes between the existing ground and the proposed surface, per pad and corridor and in total, and understand the grid method behind them.
section: tasks
order: 80
keywords: volumes, earthwork, cut, fill, net, cut and fill, quantities, grid method, surface comparison, volume surface, cubic yards, cubic meters
---

As soon as a pad or a corridor grades without problems, CivilCraft compares the proposed surface with the existing ground and reports cut and fill. The numbers update with every change.

## Where to read them

- **Earthwork** in the right panel with nothing selected (the **Project** view), when there is at least one pad or one corridor.
- **Earthwork** in the right panel when a pad is selected (the same totals for the whole project).
- The line under a corridor's settings, with that corridor's own cut and fill.

The **Earthwork** block shows:

- **Cut**, **Fill** and **Net** (with "fill" or "cut" after it, whichever is larger)
- a line per item when there is more than one, for example "Pad 1: cut 120.4 cu yd, fill 310.2 cu yd"
- the method line: "Grid method: existing ground and the graded surface sampled every 0.5 ft inside the daylight lines (92,891 cells). No swell or shrink applied."

Volumes are in cubic yards in a feet project and cubic metres in a metre project.

## How they are worked out

CivilCraft uses the **grid method**:

1. A grid of square cells is laid over the area inside every daylight line.
2. At the center of each cell, both surfaces are sampled.
3. Each cell counts as a prism: the difference in elevation times the cell's area. Where the proposed surface is lower, it is cut; higher, it is fill.
4. The cells are added up.

The cell size is chosen for you so that the rectangle around the graded areas holds about 250,000 cells, rounded to a tidy value (1, 2 or 5 times a power of ten). You cannot set it yourself yet. The method line tells you the size and the number of cells. Smaller cells are more accurate along the edges; on whole cells between flat planes the result is exact.

## Things to know

- Only the area inside daylight lines is counted. Ground outside them is unchanged.
- A pad or corridor with a problem is not graded in and adds nothing. If the block says "No volumes yet: a pad needs to grade without problems.", look for a red box above it.
- Where items overlap, the later one has replaced the earlier inside its daylight line, and the overlap is counted once.
- No swell or shrink factor is applied. Multiply the results yourself if you need bank, loose or compacted volumes.
- Topsoil stripping, pavement and subgrade depths, and TIN-to-TIN prism volumes are not available yet.

## Checking a result

- Turn {{ui:Proposed (graded)}} on under **Display** and look at the contours inside the daylight lines.
- Move the pointer over the graded area: the status bar shows **Ground** and **Graded**. The difference is the cut or fill depth at that spot.
- For a corridor, the profile view's readout shows cut or fill on the centerline at every station.
