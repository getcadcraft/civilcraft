---
title: Make a staking report
summary: List stakes along an alignment at stations and offsets, or the survey points near it, with station, offset, northing, easting, design and ground elevations and cut or fill, and save the report as CSV or PDF.
section: tasks
order: 97
keywords: staking, stakeout, stake report, cut sheet, grade sheet, station, offset, cut, fill, layout, construction staking, as-built
---

Select an alignment and click **Staking report** in its **Properties**.

## Stakes at stations and offsets

1. **From** and **to**: the stations to stake (1+50 or 150).
2. **every**: the interval. Stakes go at every multiple of it, at both ends, and (with the box ticked) where the alignment's curves begin and end.
3. **Offsets**: left and right of the alignment, looking up station: `12 L, 0, 12 R`, `L12 CL R12` or `-12, 0, 12` (left is minus). An alignment with a corridor starts with its edges of pavement and shoulders.
4. **Number from** and **with prefix** name the stakes: 1, 2, 3, or S101, S102.

## Survey points near the alignment

Choose **survey points near the alignment** and how near. Each point within that distance gets its station and offset, the design there, and its own elevation as the ground: a check of points staked or shot as built.

## What the report says

| Column | What it is |
|---|---|
| Point | The stake's name, or the survey point's number |
| Station, Offset | Where it is along the alignment: L left, R right |
| Northing, Easting | Its coordinates |
| Design elev. | The graded corridor's surface there (from daylight line to daylight line), else the design profile on the centerline |
| Ground elev. | The existing surface there, or the survey point's own elevation |
| Cut/fill | C when the ground is above the design (cut it down), F when below (fill it up), to the hundredth |

A stake with no design elevation (off the corridor, or on an alignment without one away from the centerline) has no cut or fill; the dialog says how many.

## Save it

- **CSV**: a title line, then the columns above, plus the cut or fill as a signed number (ground minus design) for spreadsheets and data collectors.
- **PDF**: table pages on the paper you pick, a stake a row, cuts in orange and fills in green, with the title strip of the other sheets.

:::note
Stakes are worked out from the design in the project. Check them against the approved plans before anything is built.
:::
