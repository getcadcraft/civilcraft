---
title: Lay out a horizontal alignment
summary: Draw an alignment by its PIs, set curve radii and the start station, move PIs, and read the curve data and station and offset.
section: tasks
order: 40
keywords: alignment, no solution, curve does not fit, largest radius, smallest radius, minimum radius, design speed, overlap, centerline, pi, horizontal curve, radius, stationing, tangent, create alignment, alignment layout, pc, pt, station offset
---

An alignment in CivilCraft is a chain of tangents through points of intersection (PIs), with a circular curve at any interior PI that has a radius. It is stationed from a start station you choose. A project can hold many alignments.

## Draw the alignment

1. Press {{key:A}}, or click {{ui:Alignment}} in the **Design** group.
   The hint says "Alignment: click the PIs in order. Enter or double-click finishes, Backspace drops the last, Esc cancels."
2. Click the first PI (the start of the alignment).
3. Click each following PI in order. A red line follows the pointer and shows the length and bearing of the tangent you are drawing, for example "212.40 ft  N 63°12'05" E".
4. Click the last PI (the end of the alignment).
5. Press {{key:Enter}}.
   The alignment is drawn with stationing and is selected. The status bar says, for example, "Alignment 1: 386.36 ft, curves of 100 ft radius where they fit. Edit radii in Properties; Profile (R) to design its grade."

While drawing: {{key:Backspace}} removes the last PI, {{key:Esc}} cancels, and dragging on empty space pans without adding a PI.

:::warning
Finish with {{key:Enter}}. Double-clicking also finishes, but in this build it drops the PI you double-clicked. Click the last PI once, then press {{key:Enter}}.
:::

Every interior PI gets a curve of 100 ft (30 m in a metre project), or the largest whole radius that fits in half of each tangent if 100 ft does not fit. Very sharp or straight-through PIs get no curve.

## Set radii and coordinates

With the alignment selected, the right panel shows **Alignment**:

1. **Name** and **Start station**. Type a station as `10+00` (feet) or `0+500` (metres), or as a plain number. See [Units, stations and number formats](topic:units-and-stations).
2. **Length** and **End station** are worked out for you.
3. The **PIs** table lists each PI's **Easting** and **Northing**, and a **Radius** for each interior PI. Type a new value and press {{key:Enter}}.
   - A radius of 0 makes an angle point with no curve.
   - The first and last PI never have a radius.
   - The small x at the end of a row removes that PI (an alignment keeps at least two).
4. Read the **Curves** list: for each curve, its PC and PT stations, radius R, deflection Δ and direction (left or right), length L, tangent T, external E and chord.
5. The line under the curves gives the bearing of the first tangent.

## When a curve does not fit

If curves need more tangent than there is between their PIs, the alignment has no solution: it is not drawn correctly until you fix it, and it is left out of LandXML exports. A red box says why, in numbers, and offers what would fit:

- "The curves at PI 2 and PI 3 need 240.00 ft of tangent between them (130.00 + 110.00), but the PIs are 180.00 ft apart." — or, when only one of them has a curve, "The curve at PI 2 needs 240.00 ft of tangent towards PI 1 …".
- A button for each PI sets **the largest radius that fits** there with the other curve kept as it is (it also has to fit the PI's other tangent). Where both PIs have curves, **Both** shrinks the two radii in proportion so they just meet.
- When one curve alone is longer than the tangent, the box says no curve at the other PI can fit while it is that big.
- A PI that turns straight back cannot take a curve; the box offers **No curve at PI n**.

Each button is one step: {{key:Mod+Z}} puts the radii back. Radii offered are rounded down to 0.01 so they always fit.

### A design minimum radius

Type a **Design minimum radius** (for example from your design speed) to have every curve checked against it; leave it empty for none. A curve under it is listed with a button for **the smallest radius that meets the minimum**, when that radius fits. When it does not fit, the box says so and gives the largest radius the tangents allow, so you know to move a PI or lower the minimum.

## Move PIs on the plan

1. With {{ui:Select}} active, click the alignment to select it. Square grips appear at its PIs.
2. Drag a grip. The alignment, its stationing, profile and corridor follow.
3. Release. The move is one undo step.

Adding a PI between two existing ones is not available yet: remove the alignment and draw it again, or type new coordinates for the PIs you have.

## Read station and offset

Move the pointer over the plan. The status bar shows the nearest alignment (or the selected one) with the station and the offset, **L** or **R** looking up-station, for example "Alignment 1: Sta 2+15.30, offset 18.42 R". Beyond either end it adds "(beyond the end)".

## What is drawn

On the plan, in DXF and in PDF: the centerline (tangents as lines, curves as true arcs), a tick every 50 ft (20 m) with a longer tick and a station label every 100 units, and PC and PT ticks labeled with their stations.

## Delete an alignment

Select it and press {{key:Delete}}, or click {{ui:Delete}} in the toolbar or at the bottom of the right panel. Its profile and corridor go with it. {{key:Mod+Z}} brings it back.

:::mac
On a Mac keyboard, the key labeled **delete** is {{key:Backspace}} to the browser and does not delete a selection. Press {{key:Delete}} (Fn and delete), or use the {{ui:Delete}} button.
:::

## Next

- [Design a vertical profile](topic:profile).
- Spirals are not available yet; see [Not built yet](topic:not-built-yet).
