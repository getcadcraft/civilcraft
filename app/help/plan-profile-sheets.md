---
title: Plan and profile sheets
summary: Plot an alignment as a set of plan and profile sheets in one PDF, with match lines between them.
section: tasks
order: 58
keywords: plan and profile, sheets, plot, pdf, match line, plan production, road plans, profile plot, vertical exaggeration, sheet set
---

Plan and profile sheets are how road plans are usually drawn: each sheet shows one stretch of the road twice, the plan above and the profile below, at the same horizontal scale, so a station sits at the same place in both.

## Make the sheets

1. Select the alignment. In **Properties**, click {{ui:Plan and profile sheets}}.
2. Choose the **Paper**, the **Plan scale** and the **Profile exaggeration** (how many times taller the profile is drawn than it is long; 10× to start). The dialog says how many sheets that makes and how much of the alignment each one shows.
3. To plot part of the alignment, change **From station** and **To station**.
4. Click {{ui:Download PDF}}. The PDF has one page per sheet.

## What is on a sheet

| Part | What it shows |
|---|---|
| Plan | Everything on the plan (contours, survey points, the alignment and its stationing, corridors, pads, feature lines, pipes, sample lines) turned so this stretch runs across the sheet, with a north arrow turned to match |
| Match lines | A dash-dot line square to the alignment at each end that continues on another sheet, labeled "Match line sta 5+50.00, see sheet 2" |
| Profile | The existing ground (dashed), the design profile (red), the grade of each tangent and every vertical curve's PVI, elevation, L and K; stations along the bottom, elevations on both sides |
| Title strip | The project name, the alignment and its station range, "Sheet 1 of 3", the horizontal and vertical scales and the exaggeration |

The stretch per sheet is as long as the plan window allows at the scale, rounded down to a whole 50 ft (20 m) on long stretches or a whole 10 ft (5 m) on short ones.

:::note
When the profile's elevations would not fit at the exaggeration you chose, CivilCraft draws every sheet at the largest of 10×, 5×, 4×, 2× and 1× that fits, and the status bar says so. A curved alignment is turned by the direction from the start to the end of each stretch, so the road may run slightly up or down on the sheet.
:::
