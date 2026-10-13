---
title: Enter a traverse and adjust it by the compass rule
summary: Type field angles or bearings and distances, check the angular and linear closure and the precision, adjust by the compass rule, and add the stations as survey points or the loop as a parcel.
section: tasks
order: 96
keywords: traverse, closed traverse, loop, angles right, backsight, bearings, distances, closure, misclosure, precision, compass rule, bowditch, adjustment, survey
---

A traverse is a run of measured legs: at each station an angle (or a bearing) and a distance to the next. Click **Enter a traverse** under **Traverse** in the right panel when nothing is selected.

## Where it starts and ends

1. **Start at survey point**: its number. Or type a northing and easting.
2. **Legs as**: **Angles right and distances**, or **Bearings and distances**.
3. With angles, say where they start from: a **Backsight survey point**, or **its azimuth** (from the first station toward the backsight, clockwise from north).
4. **Ends**: **back at the start (a loop)**, or **on survey point** and its number (an open traverse between known points).

## Type the legs

One leg a line, then the distance, then a name for the station it reaches if you like:

- Angles right, turned clockwise at the station the leg leaves, from the station behind to the next: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` and `270.0028` work too.
- Bearings: `N 45°30'15" E 125.50 B`, or an azimuth as one word: `AZ 45-30-15 125.50 B`.
- On a loop with angles, end with `close` and the angle at the start again, turned from the last station to the second: `close 270°00'05"`. That is what checks the angles.

Lines that cannot be read are listed with their line numbers. "feet", commas and `#` comment lines are fine.

## Read the closure

As you type, the dialog shows:

- **Angular misclosure**: how far the angles are from closing, and the share each angle takes. Without a closing angle the angles are not checked, and any error in them shows up in the linear misclosure.
- **Linear misclosure**: how far from where it should end the traverse ends, and in which direction.
- **Precision**: the length of the traverse divided by the linear misclosure: 1 : 10,000 means 1 ft in 10,000 ft.
- The stations after the adjustment, and how far each one moved.

## The adjustment

First the angular misclosure is spread equally over the angles. Then the linear misclosure is spread over the legs by the compass rule (Bowditch): each station moves against the misclosure in proportion to the length travelled to reach it, so the traverse ends exactly where it should.

:::note
The compass rule is a standard adjustment, not a least-squares one, and it does not weigh angles against distances. Whether the precision is good enough is for your own standards and your jurisdiction's to say.
:::

## Use the result

- **Add as survey points**: the adjusted stations become survey points with the names you gave (else the next free numbers), description `TRAV`, no elevation. A loop's last station is its start, so it is not added twice. One step: {{key:Mod+Z}} undoes it.
- **Add as a parcel** (loops): the adjusted stations become a [parcel](topic:parcels), with its labels and legal description.
- **Report (CSV)**: the closure lines, then each station's direction, distance, unadjusted and adjusted coordinates and corrections.
