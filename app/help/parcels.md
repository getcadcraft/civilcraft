---
title: Draw parcels and write their legal descriptions
summary: Draw a parcel by its corners or enter the calls from a deed or plat, check how well the calls close, label bearings and distances on the plan, make any course a curve, and copy a draft legal description.
section: tasks
order: 95
keywords: parcels, lots, property lines, boundary, deed, plat, metes and bounds, bearing, distance, closure, misclosure, precision, legal description, point of beginning, curve, radius, area, acres
---

Parcels sit on the plan with their bearings and distances along each course and their name and area in the middle. They go into the PDF plot and the DWG and DXF exports, on the layers `V-PROP` (lines) and `V-PROP-TEXT` (labels). Everything is under **Parcels** in the right panel when nothing is selected.

## Draw a parcel

1. Click **Draw a parcel**.
2. Click the corners, starting at the point of beginning. A click near a survey point takes that point's exact place.
3. Click the first corner again, or press {{key:Enter}}, to finish. {{key:Backspace}} takes back the last corner; {{key:Esc}} stops.

## Enter the calls from a deed

1. Click **Enter deed calls**.
2. Say where the calls start: a survey point's number, or a northing and easting.
3. Type or paste the calls, one a line:
   - a line: a bearing and a distance, such as `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` and azimuths (`AZ 45°30'15"`) work too, and "thence", commas and "feet" are ignored.
   - a curve: `C R 300 L 52.36 right` (radius and arc length), or `C R 300 D 10°00'00" left` (radius and central angle). A curve follows on from the course before it; when it does not, add its chord bearing: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` starts a comment line.
4. As you type, the dialog shows the length of the calls, the **misclosure** (how far from the start they end, and in which direction), the **precision** (the length divided by the misclosure, 1 : 10,000 and so on) and the area. Lines it cannot read are listed with their line numbers.
5. **Add the parcel**. When the calls do not close, the parcel closes with a straight course across the gap: check the calls against the deed. To spread a field traverse's error over its courses, adjust it first.

## Curves

In a parcel's **Properties**, each course has a **Radius**. Type one to make that course a curve through the same two corners, and choose which way it curves: a curve to the right has its center to the right of the direction of travel, as in a deed. Clear the radius to make it straight again. Each change is one step: {{key:Mod+Z}} undoes it.

## The legal description

A parcel's Properties end with its legal description, written from the drawing:

- "Beginning at" the **Point of beginning** you type (for example "the northeast corner of Lot 4"), else the first corner's northing and easting, or the survey point the calls started from.
- "thence" each course: a bearing and a distance, or a curve with its radius, arc length, central angle, and chord bearing and distance.
- "Containing" its area in square feet and acres (square meters and hectares in a meter project).

**Copy** puts it on the clipboard; **Download as text** saves it as a `.txt` file.

:::warning
The legal description is a draft from the drawing, not a survey. A licensed surveyor has to check it against the record and sign it before anyone relies on it.
:::

Click inside a parcel on the plan to select it; {{key:Delete}} removes it. Parcels are saved in the project file.
