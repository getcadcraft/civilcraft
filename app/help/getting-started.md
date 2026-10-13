---
title: Getting started with CivilCraft
summary: What CivilCraft does, how to open it, and a first ten minutes with the sample site from points to contours, a road and a saved project.
section: start
order: 10
keywords: start, first run, sample site, introduction, quick start, tutorial, begin, new project
---

CivilCraft is the civil and site design app of the CadCraft family. It takes survey points and turns them into a surface (a TIN) with contours, then lets you lay out alignments with design profiles, sweep a simple road corridor, grade building pads to daylight, check a gravity pipe network against your rules and see cut and fill volumes. It reads and writes LandXML, exports the plan as DXF and plots it to PDF.

If you have used Civil 3D, the ideas will be familiar: points, point groups, breaklines, alignments by PI, profiles by PVI, corridors, grading, pipe networks. The way you work is different, and much smaller: there is no command line, no styles and no drawing file. Read [Coming from other civil software](topic:coming-from) once before your first real job.

## What you need

- A recent desktop browser: Chrome, Edge, Firefox or Safari. See [Browsers](common:browsers).
- A mouse or trackpad and a keyboard, or a touch screen: drawing has on-screen {{ui:Finish}}, {{ui:Undo point}} and {{ui:Cancel}} buttons there (see [Mouse, trackpad and touch](topic:keyboard#mouse-trackpad-and-touch)).
- The plan draws in 2D with the browser's canvas. The [3D view](topic:site-3d) uses the browser's WebGL graphics; if it cannot start, the status bar says why and the plan still works.
- No account and no upload. Files open on your computer and save as downloads. See [Your files](common:your-files).

:::note
CivilCraft runs today as an early browser build that is still being made. Desktop builds are not available yet, and cloud saving is not available yet. Everything you make stays on your computer until you save or export it.
:::

## Open CivilCraft

1. Open CivilCraft in your browser.
2. Wait for the screen to fill: a toolbar across the top, a panel on the left, the plan in the middle and a **Properties** panel on the right.
3. On an empty plan you see a box titled **Start with survey points**. It lists the first steps and has a link, {{ui:Open the sample site}}.

To use CivilCraft with no connection later, click {{ui:Save for offline}} in the app bar and wait for {{ui:Offline ready}}. It includes this help, the sample site, and the 3D and GIS libraries. See [Offline](common:offline). Press {{key:F1}} or click {{ui:Help}} at any time to open this help beside the app.

## Your first ten minutes: the sample site

The sample site is a small survey in US feet: 276 points on state plane coordinates, a ridge, a swale with a flowline and two tops of bank. It comes with the app, so you can follow along without a file of your own.

1. Click {{ui:Open the sample site}} in the box on the plan.
   The **Import points** dialog opens. It says "276 points read as PNEZD (from the header row), separated by commas." and shows the first rows.
2. Click {{ui:Import}}.
   The plan fills with points, contours and the surface edge. The status bar at the bottom says the points were imported and how many triangles the surface has (546).
3. Look at the left panel under **Points**. The points are grouped by the first word of their description: CP, FL, GRD, RIDGE, TBN, TBS and TREE.
4. In the **Surface** column of that table, set **FL**, **RIDGE**, **TBN** and **TBS** to {{ui:Breakline}}.
   The surface rebuilds at once. The **Surface** facts now say "Breaklines: 4", and the contours bend sharply along the flowline and the ridge instead of cutting across them.
5. Move the pointer over the plan. The status bar shows the easting and northing under the pointer and the ground elevation there.
6. Under **Display**, set {{ui:Contours every}} to 0.5 ft and turn on {{ui:Elevation bands}}. A color ramp appears with a legend under the checkboxes. Turn the bands off again when you are done.

You now have an existing ground surface. Next, a road.

## Lay out a short road

1. Press {{key:A}} (or click {{ui:Alignment}} in the **Design** group).
2. Click three points across the site, one after another. A red line follows the pointer and shows the length and bearing of the next tangent.
3. Press {{key:Enter}} to finish.
   The alignment appears with stationing. The right panel shows **Alignment**: its length, the PI table and the curve at the middle PI (100 ft radius, or smaller if 100 ft does not fit).
4. In the right panel, under **Design profile**, click {{ui:Start from the ground}}.
   The profile view opens under the plan with the existing ground and a straight design grade from end to end.
5. Press {{key:I}} to turn on {{ui:Add PVIs}}, then click once in the profile view near the middle. A PVI appears.
6. In the PVI table on the right, type a curve length (for example 100) in the **Curve L** box of the middle PVI and press {{key:Enter}}. The profile now has a vertical curve, with its K value labeled.
7. Under **Corridor**, tick **Sweep an assembly along the design profile**.
   The road is graded into the ground: lanes, shoulders and side slopes to daylight. The **Earthwork** block shows cut and fill.

Do not worry about exact values. Every number can be changed in the right panel, and {{key:Mod+Z}} undoes the last change.

## Save your work

1. Type a name in **Name** at the top of the left panel.
2. Press {{key:Mod+S}} (or click {{ui:Save}}).
   The browser downloads a file named after the site, ending in `.civilcraft.json`. It holds the points, the surface settings, alignments, profiles, corridors, pads and pipes.
3. To continue later, click {{ui:Open}} (or press {{key:Mod+O}}) and choose that file, or drop it on the plan.

:::warning
There is no automatic saving. If you close the tab with unsaved changes, the browser asks whether to leave; if you leave, the changes are gone. Save often.
:::

## Where to go next

- [Import survey points](topic:import-points) with your own files.
- [Build and refine the surface](topic:build-surface) with breaklines and a boundary.
- [The screen, part by part](topic:workspace).
- [Keys and mouse](topic:keyboard).
