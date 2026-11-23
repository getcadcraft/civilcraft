---
title: Design a vertical profile
summary: Open the profile view, start a design profile from the ground, add and drag PVIs, set vertical curve lengths, and read grades, K values and high and low points.
section: tasks
order: 50
keywords: profile, vertical alignment, pvi, vertical curve, grade, k value, crest, sag, bvc, evc, profile view, finished grade, fg, existing ground profile, feature lines in profile, crossings, projected, curb, ditch, labels
---

Each alignment has one design profile: a list of PVIs (station and elevation) joined by straight grades, with a symmetric parabolic vertical curve at any interior PVI that has a length. The existing ground profile is sampled from the surface for you.

## Open the profile view

1. Select the alignment (click it with {{ui:Select}}).
2. Press {{key:R}}, or click {{ui:Profile}} in the toolbar, or {{ui:Profile view}} at the bottom of the right panel.
   The profile view opens under the plan with the existing ground along the alignment. With two or more alignments, pick one in the list at the left of the profile bar.

The view starts by showing the whole alignment and stretching the elevations to fill the panel; the exaggeration is printed in the lower-left corner, for example "Vertical exaggeration 10×".

## Zoom and pan the profile

- **Zoom:** turn the mouse wheel (or pinch on a trackpad) and the view zooms about the pointer. Hold {{key:Shift}} to zoom the stations only, or {{key:Alt}} to zoom the elevations only (that changes the exaggeration). With the profile view focused, the plus and minus keys zoom about the middle.
- **Pan:** drag with the right or middle mouse button, or swipe with two fingers on a trackpad.
- **Fit:** double-click the profile or press {{key:F}} to show the whole alignment again.

Editing a PVI keeps the zoom you chose; it does not jump back to fit.

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

## Snap while you add or drag

The **Snap** button in the profile bar is on to start with. While it is on, a PVI you add or drag lands on the nearest PVI, ground point, PVI station or the ground line, and a label by the marker says which one. Hold {{key:Alt}} for a free point, anywhere.

## Adjust PVIs

- **Drag** a PVI in the profile to move it. It cannot pass its neighbors. The move is one undo step.
- **Type** exact values in the PVI table in the right panel: **Station**, **Elevation**, **Slope %** and **Curve L** (vertical curve length). Press {{key:Enter}} after each.
- **Pick** a value from the profile: the small button beside a PVI's station or elevation waits for one click in the profile view and fills that value in. The click snaps like Add PVIs; hold {{key:Alt}} for a free point; {{key:Esc}} cancels.
- **Slope %** is the grade of the tangent that starts at that PVI and runs to the next one. Typing it moves the **next** PVI's elevation (its station never moves). If the next PVI is locked, the previous PVI's elevation moves instead.
- **Lock** a PVI with the padlock at the end of its row. A locked PVI is not dragged, and a slope edit does not move it. If both ends of a tangent are locked, its slope cannot change: the status bar says so, and you unlock one end first. The lock is saved in the file.
- **Remove** a PVI with the x at the end of its row, or select it (click it) and press {{key:Delete}}. When the profile view has the focus, {{key:Backspace}} also removes it.

The first and last PVI never take a curve.

## Vertical curves

1. Type a length in **Curve L** for an interior PVI, for example 200.
2. The curve is drawn centered on the PVI. The profile and the right panel show its kind (crest or sag), L and K, the BVC and EVC stations and elevations, and its high or low point when it has one inside the curve.

K is worked out from L (K = L divided by the algebraic difference in grades, in percent). You type L; typing K directly is not available yet.

If a vertical curve does not fit, a red box says why: it runs back into the PVI or curve before it, or past the next PVI, and how much room there is on that side (a curve needs half its length on each side of its PVI). Its button sets **the longest curve that fits**, with its K, as one step ({{key:Mod+Z}} undoes it). Or move the PVIs apart.

## Read the facts

Under the PVI table, a list gives each grade in percent ("Grade 1: +1.25%") and each curve, for example "Crest at 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", then "High point 1+62.40, 254.12".

If the PVIs do not reach both ends of the alignment, a note says so. A corridor is built only where the profile and alignment overlap.

## Feature lines in the profile

Feature lines show in the profile view too, so you can see a curb, a ditch or a wall top against the road's profile.

- Where a feature line **crosses** the alignment, the profile shows a small diamond at that station and elevation, labelled with the line's name and its elevation there (the line's own elevation, worked out along the segment that crosses).
- Type a distance in {{ui:Alongside within}} to also draw the feature lines that **run beside** the alignment within that distance, as dashed lines at their own elevations. Empty or 0 shows only the crossings.
- The marks and labels follow every change: move a vertex, type a grade or raise the line, and the profile shows the new elevations at once.
- Click a crossing's diamond to select that feature line; the selected line is drawn in the highlight color.
- {{ui:Feature lines}} in the profile bar hides or shows them all. Both settings are saved with the project.

See [Feature lines](topic:feature-lines).

## Next

- [Sweep a road corridor](topic:corridor) along the alignment and this profile.
- The profile is written to LandXML with the alignment; see [Exchange LandXML](topic:landxml).
