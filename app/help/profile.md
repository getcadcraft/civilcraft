---
title: Design a vertical profile
summary: Open the profile view, start a design profile from the ground, add and drag PVIs, set vertical curve lengths, and read grades, K values and high and low points.
section: tasks
order: 50
keywords: profile, vertical alignment, pvi, vertical curve, grade, k value, crest, sag, bvc, evc, profile view, finished grade, fg, existing ground profile
---

Each alignment has one design profile: a list of PVIs (station and elevation) joined by straight grades, with a symmetric parabolic vertical curve at any interior PVI that has a length. The existing ground profile is sampled from the surface for you.

## Open the profile view

1. Select the alignment (click it with {{ui:Select}}).
2. Press {{key:R}}, or click {{ui:Profile}} in the toolbar, or {{ui:Profile view}} at the bottom of the right panel.
   The profile view opens under the plan with the existing ground along the alignment. With two or more alignments, pick one in the list at the left of the profile bar.

The view always shows the whole alignment and stretches the elevations to fill the panel; the exaggeration is printed in the lower-left corner, for example "Vertical exaggeration 10×". It does not zoom or pan.

Move the pointer along the profile: the bar shows the station, ground and design elevations, the grade and the cut or fill there, and a dot follows on the alignment in the plan.

## Start the design profile

1. In the right panel under **Design profile**, click {{ui:Start from the ground}}.
   Two PVIs are placed on the ground at the two ends of the alignment, joined by one straight grade. The status bar says "Design profile started at the ground at both ends. Turn on Add PVIs and click to add grade breaks; give them a curve length in the table."

If the alignment does not cross the surface, you get "This alignment has no ground under it to start from." Then add PVIs by clicking instead (next section).

## Add PVIs

1. Press {{key:I}}, or click {{ui:Add PVIs}} in the profile bar. It stays pressed.
2. Click in the profile where you want a grade break. A PVI is added at that station and elevation, rounded to 0.01, and selected.
3. Add as many as you need, then press {{key:I}} again to stop adding.

A click where there is already a PVI is refused ("There is already a PVI at …"). PVIs always stay in station order.

## Adjust PVIs

- **Drag** a PVI in the profile to move it. It cannot pass its neighbors. The move is one undo step.
- **Type** exact values in the PVI table in the right panel: **Station**, **Elevation** and **Curve L** (vertical curve length). Press {{key:Enter}} after each.
- **Remove** a PVI with the x at the end of its row, or select it (click it) and press {{key:Delete}}. When the profile view has the focus, {{key:Backspace}} also removes it.

The first and last PVI never take a curve.

## Vertical curves

1. Type a length in **Curve L** for an interior PVI, for example 200.
2. The curve is drawn centered on the PVI. The profile and the right panel show its kind (crest or sag), L and K, the BVC and EVC stations and elevations, and its high or low point when it has one inside the curve.

K is worked out from L (K = L divided by the algebraic difference in grades, in percent). You type L; typing K directly is not available yet.

If curves overlap, a red box says which: "The vertical curve at PVI 3 (L = 300.00) starts before the curve or PVI before it ends." or "… runs past the next PVI." Shorten the curve or move the PVIs apart.

## Read the facts

Under the PVI table, a list gives each grade in percent ("Grade 1: +1.25%") and each curve, for example "Crest at 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", then "High point 1+62.40, 254.12".

If the PVIs do not reach both ends of the alignment, a note says so. A corridor is built only where the profile and alignment overlap.

## Next

- [Sweep a road corridor](topic:corridor) along the alignment and this profile.
- The profile is written to LandXML with the alignment; see [Exchange LandXML](topic:landxml).
