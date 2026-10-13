---
title: Grade a building pad
summary: Draw a flat pad, set its elevation and cut and fill slopes, and let CivilCraft daylight it to the existing ground and add it to the proposed surface.
section: tasks
order: 70
keywords: grading, pad, building pad, daylight, feature line, grading group, cut slope, fill slope, finished grade, proposed surface, site grading
---

A pad is a flat area at one elevation. From its edge, CivilCraft grades outward at your cut slope where the ground is higher than the pad and at your fill slope where it is lower, until the slope meets the existing ground. That meeting line is the daylight line. The pad and its slopes replace the existing ground inside the daylight line to make the proposed surface.

## Draw the pad

You need an existing ground surface first.

1. Press {{key:G}}, or click {{ui:Pad}} in the **Design** group.
   The hint says "Pad: click its corners. Enter or double-click finishes, Backspace drops the last, Esc cancels."
2. Click the corners of the pad in order, either way round. A blue outline follows the pointer.
3. Press {{key:Enter}} after the last corner (at least three).
   The pad is drawn and selected. It starts at the ground elevation at its middle, rounded to 0.1, with a 2 : 1 cut slope and a 3 : 1 fill slope. The status bar says, for example, "Pad 1 at elevation 254.3 (the ground at its middle), cut 2:1, fill 3:1. Change them in Properties."

:::warning
Finish with {{key:Enter}}. Double-clicking also finishes, but in this build it drops the corner you double-clicked. Click the last corner once, then press {{key:Enter}}.
:::

The pad outline must not cross itself ("The pad outline crosses itself.").

## Set elevation and slopes

With the pad selected, the right panel shows **Pad**:

1. **Name**.
2. **Elevation**: the pad's flat elevation.
3. **Cut slope** and **Fill slope**, as H:V (2 means 2 : 1). Both must be more than 0.
4. **Pad area** and **Corners** are shown for reference.

Press {{key:Enter}} after each value. The daylight line, the proposed surface and the volumes update at once.

Under the fields, a line reads for example "Daylight line: 48 slope lines (20 in cut, 28 in fill), farthest 31.20 ft out." The plan shows the daylight line and the slope lines in magenta.

## How the daylight is found

- Slope lines leave each edge square to it, about every twentieth of the pad's size.
- At outside corners they fan out every 10°, so the slope wraps round the corner.
- At inside corners one line runs along the bisector, where the slopes from the two edges meet.
- Each line climbs at the cut slope or falls at the fill slope until it reaches the ground.

## Move corners

Select the pad, then drag a square grip at a corner. Each drag is one undo step. Adding or removing a corner is not available yet: delete the pad and draw it again.

## When it does not grade

A red box under **Earthwork** names the pad and the problem:

| Message | What to do |
|---|---|
| "3 slope lines run off the surface before meeting it: the pad is too close to the surface's edge or too high/low." | Move the pad in from the edge of the surface, or bring its elevation nearer the ground. |
| "The daylight line crosses itself (slopes from different sides of the pad run into each other). Reshape the pad or change the slopes." | Typical for narrow or L-shaped pads in deep cut or high fill. Widen the pad, flatten the difference, or steepen the slopes. |
| "The pad outline crosses itself." | Redraw the corners in order around the pad. |

A pad with a problem is left out of the proposed surface and the volumes until it is fixed.

## See the result

1. Under **Display**, set **Surface** to {{ui:Proposed (graded)}}.
   The contours now run flat across the pad and follow the slopes out to the daylight line.
2. Move the pointer over the pad: the status bar shows **Ground** and **Graded** elevations.
3. Read cut and fill under **Earthwork**; see [Earthwork volumes](topic:volumes).

Pads are graded after corridors, in the order they were drawn. A later pad replaces anything earlier inside its own daylight line.

## Delete a pad

Select it and press {{key:Delete}} (on a Mac, Fn and delete), or click {{ui:Delete}}.

## Not built yet

Pads are flat: sloped pads, feature lines with varying grade, benches, and grading to a distance or elevation target are not available yet. See [Not built yet](topic:not-built-yet).
