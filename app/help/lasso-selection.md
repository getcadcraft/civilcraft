---
title: Lasso selection of survey points
summary: Shift and drag a freehand outline round survey points to select them, as a window, a crossing or a fence; switch with Space while you drag. A straight drag still draws a box.
section: tasks
order: 16
keywords: lasso, freehand, select points, selection, window, crossing, fence, space, polygon, box select, shift drag
---

## What you will learn

How to select survey points by drawing round them, when a box would take points you do not want.

## Draw a lasso

1. Click {{ui:Select}} (or press {{key:V}}).
2. Hold {{key:Shift}}, press on the plan and drag **round** the points you want, moving **right** first.
3. Let go.

The points inside the outline are added to the selection. A drag that stays close to a straight line draws a box, as before; as soon as it bends away from that line (more than about 12 pixels) it becomes a lasso.

## Window, crossing and fence

| You drag | Lasso | Selects |
|---|---|---|
| Right first | Window (solid outline) | The points inside it |
| Left first | Crossing (dashed, green) | The points inside it, and the points the outline touches |
| Press {{key:Space}} while dragging | Window, then crossing, then fence | Fence (a dashed orange path, not closed): the points the path passes over |

The status line names the lasso while you drag. {{key:Esc}} while you drag cancels it and selects nothing.

:::tip
A fence is the quick way to pick the shots along a curb or a ditch line: drag along them and let go.
:::

## See also

- [Select, copy and paste survey points](topic:copy-paste-points)
- [Keys and mouse](topic:keyboard)
