---
title: Troubleshooting
summary: Symptoms, causes and fixes for the problems people meet in CivilCraft, with the exact messages the app shows.
section: trouble
order: 10
keywords: problems, errors, not working, fix, help, messages, troubleshoot, refused, missing, wrong, swapped, contours missing
---

Messages appear in the status bar at the bottom right, in boxes in the left and right panels, and in the dialogs. They are quoted here as the app shows them.

## Opening files

**"That file is over 200 MB; CivilCraft does not open files that large yet."**
Split the point file, or thin the data before opening it.

**"Could not open site.json: This is not a CivilCraft project file."**
The file ends in `.json` or starts with `{` but is not a CivilCraft project. Point files must not start with `{`.

**"Could not open … This project file is from a newer CivilCraft (version 2)."**
The project was saved by a newer build. Open it there, or export LandXML from it.

**"Could not open … This is XML but not LandXML (its root element is <…>)."**
The file is another kind of XML. Export LandXML from the other program.

**"… has no points, TIN surfaces or alignments CivilCraft can read."**
Everything in the file is something CivilCraft skips (for example only grid surfaces, or only spiral alignments). The rest of the message says what was there. See [LandXML: what is read and written](topic:landxml-reference).

**"The sample could not be loaded: …"**
{{ui:Open the sample site}} reads a file from the CadCraft site. With no connection it works only if CivilCraft was saved for offline use (the app bar button shows {{ui:Offline ready}}). Go online, click {{ui:Save for offline}}, and it works offline from then on. See [Offline](common:offline).

**{{ui:Save for offline}} shows {{ui:Could not save}}.**
Some files did not download. Check the connection and click the button again.

**{{ui:Save for offline}} shows {{ui:Offline not available}}.**
This browser window cannot keep an offline copy, usually because it is a private window or the computer is managed. Open CivilCraft in a normal window.

**Offline, the app does not open at all.**
It was not saved for offline use in this browser, or the browser cleared its site data (Safari does this for sites not visited for several weeks). Go online, open CivilCraft and click {{ui:Save for offline}}.

**The offline copy is an older build.**
Click {{ui:Offline ready}}, then {{ui:Save again (get the newest version)}} while online.

**A file is grayed out in the open box.**
The box lists only point files, LandXML and project files by their endings. Drag the file onto the plan instead, or rename it to `.txt`.

## Importing points

**"No points could be read from this file."**
Pick the column order in **Columns** by hand. If nothing works, open the file in a text editor and check that it is one point per line with numbers in it.

**The site looks mirrored, rotated or stretched into a line.**
Northing and easting are swapped. The summary said "guessed from the column count". Choose PENZD instead of PNEZD (or the other way round) in **Columns**, or import again.

**Points far away from the rest, and the plan zoomed out to a dot.**
A row has a typo in a coordinate, or the file mixes coordinate systems. Find the point (click it to see its number) and fix the file.

**Rows listed under "Rows not read".**
See the table in [Import survey points](topic:import-points#rows-that-are-not-read).

**My old points are gone.**
Importing a point file replaces all points, and clears undo. Open your saved project to get them back.

## The surface

**"Surface: Not built" with a red box.**
The box says why: "A surface needs at least three points with elevations.", "The points are all on one line: no triangles.", "No points with elevations.", "The boundary does not overlap the points." or "No triangles are left inside the boundary." Check the column order, the point groups (are they {{ui:Left out}}?), and the boundary.

**Contours cut straight across a ditch or ridge.**
That line is not a breakline. Set its group to {{ui:Breakline}}, or draw it with the {{ui:Breakline}} tool. See [Build and refine the surface](topic:build-surface).

**A breakline group draws a zig-zag.**
The group holds more than one line, or its points are not numbered along the line. Set the group back to {{ui:Points}} and draw each line with the {{ui:Breakline}} tool.

**Long thin triangles along the outside.**
Draw a boundary ({{key:O}}) or set **Longest outside edge**.

**No contours at all, although the surface is built.**
Either {{ui:Contours}} is off under **Display**, or the interval is so small that there would be more than 2,000 contour levels. Choose a larger interval.

**Breaklines or a boundary change nothing.**
The surface came from LandXML ("Surface (from LandXML)"). It is used as it is. Click {{ui:Rebuild the surface from the points}} to build from the points instead.

**"There is no surface yet: open survey points first."**
Breakline, boundary and pad need an existing ground surface. Import points first.

**"Click a survey point with an elevation: a breakline takes the points’ elevations."**
The {{ui:Breakline}} tool only picks survey points. Zoom in and click on a point (an orange square shows the one it will take).

## Drawing

**My last point disappeared when I double-clicked to finish.**
In this build, double-clicking finishes the alignment, pad, breakline or boundary but drops the point you double-clicked. Click the last point once and press {{key:Enter}}. Use {{key:Mod+Z}} if it already happened, then draw again.

**I cannot finish a drawing on a tablet.**
Finishing needs {{key:Enter}}; there is no on-screen button yet. Attach a keyboard. See [Mouse, trackpad and touch](topic:keyboard#mouse-trackpad-and-touch).

**Dragging to place a point pans instead.**
A drag of more than a few pixels pans the plan in every tool. Click without moving.

**"An alignment needs at least two points." / "A pad needs at least three corners." / "A pipe run needs at least two structures."**
You pressed {{key:Enter}} too early. The drawing is discarded; start again.

**Keys like A or G do nothing.**
A text box or a list in a panel still has the focus, so the letters go to it. Click the plan once, then press the key. On a Mac, the delete key is Backspace to the browser: use Fn and delete to delete a selection.

## Alignments and profiles

**"The curves at PI 2 and PI 3 overlap: … Use smaller radii."**
Two curves need more tangent than there is between their PIs. Lower one or both radii in the PI table, or move the PIs apart.

**"PI 3 turns straight back; it cannot take a curve."**
The alignment doubles back on itself at that PI. Move or remove the PI.

**"This alignment has no ground under it to start from."**
The alignment is off the surface. Move it onto the surface, or add PVIs by clicking with {{ui:Add PVIs}} on.

**"The vertical curve at PVI 3 (L = …) starts before the curve or PVI before it ends." / "… runs past the next PVI."**
Shorten the curve length or move the PVIs apart.

**"There is already a PVI at …"**
A PVI exists at that station. Click elsewhere, or drag the existing one.

**The profile view is empty: "Draw an alignment to see its profile."**
There is no alignment, or the selected one has errors.

## Corridors and pads

**"The corridor needs a design profile without errors."**
Start a design profile ({{ui:Start from the ground}}) and fix any curve overlaps.

**"… side slopes run off the surface before meeting the ground." / "… slope lines run off the surface before meeting it …"**
The grading reaches the edge of the surface before meeting the ground. Move the design in from the edge, or bring it closer to the ground. A new pad drawn partly off the surface may start at elevation 0: type a real elevation.

**"The corridor’s daylight lines cross …" / "The daylight line crosses itself …"**
Slopes from different sides run into each other: tight curves, narrow pads, deep cuts or high fills. Use a larger radius, a narrower assembly, a wider pad or steeper slopes.

**"No volumes yet: a pad needs to grade without problems."**
Fix the problems listed in the red box above it.

**{{ui:Proposed (graded)}} is grayed out.**
No pad or corridor grades yet.

## Pipes

**"P2 has no inverts yet."**
Click {{ui:Set its inverts from the rules}} or type the inverts.

**"P1: no ground at S1 to start from."**
The upstream structure is off the surface and has no rim. Type a rim for it.

**Every pipe is flagged after I moved a structure.**
Moving a structure does not change inverts. Click {{ui:Set every invert from the rules}}.

All network messages are explained in [Lay out a gravity pipe network](topic:pipe-network#read-and-fix-problems).

## Saving and exporting

**"Nothing to export yet." / "Nothing to plot yet."**
The project is empty. Import points first.

**I cannot find the saved file.**
It is in the browser's downloads (usually the Downloads folder). See [Files you can open, save and export](topic:files#where-the-files-go).

**The PDF scale is wrong on paper.**
Print at 100% or actual size, not "fit to page".

**Question marks in the PDF text.**
Names or descriptions use characters outside the Western European set. The status message counts them. Rename with plain characters.

**The plot is cut off at the edges.**
The scale is too large for the sheet. Choose the scale marked "(fits)", a larger sheet, or {{ui:What is on screen}}.

**{{key:Mod+P}} opened the browser's print dialog.**
The page did not have the focus. Close the dialog, click the plan, and press {{key:Mod+P}} again, or click {{ui:PDF}}.

## The app itself

**The screen is blank or the toolbar does nothing.**
Use a current version of Chrome, Edge, Firefox or Safari, and reload. See [Browsers](common:browsers).

**The app is slow with a big point file.**
Turn off {{ui:Triangles}}, {{ui:Point labels}} and {{ui:Elevation bands}}, and use a larger contour interval. Very large surfaces take a moment to rebuild after each change.

**The browser asks "Leave site?"**
The project has unsaved changes. Stay, save with {{key:Mod+S}}, then leave.
