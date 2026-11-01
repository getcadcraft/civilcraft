---
title: Ground modifiers and live levels
summary: Everything that shapes the proposed ground in one ordered list (later wins where they overlap), cut and fill per modifier, junction checks in the Problems panel, and spot levels and gradient arrows that read the ground live.
section: tasks
order: 162
keywords: ground modifiers, stack, order, proposed ground, existing ground, overlap, cut and fill, junction, retaining wall, paving edge, bed level, step landing, spot level, spot height, gradient arrow, slope label, falls
---

Proposed ground = existing ground + the modifiers, in order. The existing ground is never changed.

## The list

{{ui:Levels}} › {{ui:Ground modifiers…}} lists every object that shapes the ground: platforms, berms, swales, grading areas, paving and paths, planted areas with a finished level, and steps and ramps whose **Shapes the ground** box is ticked (with their bottom and top levels). Where two overlap, the **later** one wins. Drag a row, or use the arrows, to change the order; the ground is rebuilt at once. Each row shows its cut and fill (what it shapes after the ones above it), with the total under the list.

## Junction checks

The Problems panel lists, with **go to**:

- a wall whose high side is above its top (soil over the wall), or whose low side shows its footing;
- a planted area whose finished level is above the paving edge it meets, or more than the typical 150 mm below it;
- steps whose bottom or top does not meet the paving they land on;
- two modifiers that overlap (the later one wins there).

A retaining wall can have its top follow the high side of the ground: its height is worked out again whenever the ground changes.

## A retaining wall that shapes the ground

Select a retaining wall and tick **Shapes the ground**. The strip under the wall (as wide as the wall is thick) joins the list as a modifier:

- the edge on the **high side** is held at the ground there, station by station, so the wall's top follows the high side (with the coping on top). Type a **Top** level and it holds the high side at that level less the coping instead;
- the edge on the **low side** is held at the **Ground held on the low side** level you type, or, left blank, at the ground there;
- the high side is the side whose ground is higher over the whole wall, so it never flips along the wall;
- the ground beyond the strip is not changed, and the existing ground never is.

Like any modifier it sits in the list, and a modifier listed after it wins where they overlap. A wall whose held level at an end is more than the typical 150 mm from the existing ground there gets a warning in the Problems panel (with **go to**). A freestanding wall does not shape the ground. The box is off in files from earlier builds, so they open as they were.

## Spot levels and gradient arrows

{{ui:Spot level}} (one click) and {{ui:Gradient arrow}} (two clicks) read the ground every time they are drawn: move or re-level an object and the labels follow. In Properties choose whether a label reads the proposed or the existing ground; existing-ground labels are shown in brackets. Arrows point downhill and say `1:20 (5.0 %)`.
