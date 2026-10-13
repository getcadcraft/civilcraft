---
title: Select, copy and paste survey points
summary: Select survey points by click, Shift and a box, or all at once; copy, cut, paste, paste in place, duplicate and delete them with new point numbers that never clash; paste point rows to and from a spreadsheet.
section: tasks
order: 15
keywords: copy, paste, cut, duplicate, delete points, select points, select all, box select, window, clipboard, spreadsheet, csv, renumber, point numbers, paste in place, clone, stakeout
---

Survey points can be copied and pasted within a project, between projects in two browser tabs, and to and from a spreadsheet. Every change is one undo step, and the surface rebuilds from the new points at once.

## Select points

With {{ui:Select}} ({{key:V}}):

- **Click** a point to select it (and only it). Its numbers show under **Properties**.
- {{key:Shift}} and **click** adds a point to the selection, or takes it out.
- {{key:Shift}} and **drag** draws a box: the points inside it are added to the selection. Drag round the points instead and it becomes a lasso; see [Lasso selection of survey points](topic:lasso-selection). A drag without {{key:Shift}} pans, as always.
- {{key:Mod+A}} (or {{ui:More}} › {{ui:Select all points}}) selects every point.
- {{key:Esc}} (or {{ui:More}} › {{ui:Select none}}) clears the selection.

Selected points have a ring. With more than one selected, **Properties** shows how many, their numbers, their elevation range and their groups.

## Copy, cut and delete

- {{ui:Copy}} or {{key:Mod+C}} copies the selected points. CivilCraft keeps the copy, and also puts it on the system clipboard as point rows, so you can paste it straight into a spreadsheet or a text file.
- {{ui:More}} › {{ui:Cut}} or {{key:Mod+X}} copies them and deletes them, in one step.
- {{ui:More}} › {{ui:Delete}} or {{key:Delete}} deletes them. {{key:Mod+Z}} brings them back.

The rows are point, northing, easting, elevation, description (P,N,E,Z,D), separated by commas, with three decimals. To get easting before northing, set **Point rows** in [CivilCraft settings](topic:settings). A description a spreadsheet would treat as a formula (starting with =, +, - or @) gets an apostrophe in front, so it stays text.

## Paste

1. Press {{key:Mod+V}} or click {{ui:Paste}}. The points follow the pointer as small crosses, with a dotted line back to where they came from.
2. Click where they go. The middle of the copied points lands on the click.
3. Or press {{key:Enter}} to put them at their own coordinates, or {{key:Esc}} to cancel.

{{ui:More}} › {{ui:Paste in place}} or {{key:Mod+Shift+V}} pastes at the points' own coordinates straight away. The pasted points are selected afterwards, so you can copy, move or delete them again.

:::note
Clicking {{ui:Paste}} in the toolbar reads the system clipboard. The first time, the browser may ask whether CivilCraft may see the clipboard. If you refuse, the toolbar button pastes CivilCraft's own copy only; {{key:Mod+V}} still pastes rows from a spreadsheet without asking.
:::

## Point numbers never clash

Two points never share a number. When you paste:

- A pasted point keeps its number when no point in the project has it. So after **Cut**, the points paste back with their own numbers, and points copied from another project keep theirs where they are free.
- A pasted point whose number is taken gets a new whole number: one more than the highest number in use, counting up.
- The status bar says what happened, for example "1 kept its number; 9 got new numbers: 10–18 became 277–285".

In [CivilCraft settings](topic:settings) you can choose **Always new numbers**, and a number for new numbers to start at, for example 5000 for design points.

:::warning
Point groups that build the surface as a **breakline** join their points in number order. Pasted copies of breakline points (for example FL shots) get new, higher numbers and join the end of that breakline, possibly with a long jump. Check the plan after pasting such points, or set their group to {{ui:Points}}.
:::

## Duplicate

{{ui:More}} › {{ui:Duplicate}} or {{key:Mod+D}} makes a copy of the selected points that follows the pointer: click where it goes. The copies always get new numbers, and CivilCraft's clipboard is left as it was.

## From a spreadsheet or a text file

Select rows of points in a spreadsheet (point, northing, easting, elevation, description) and copy them. In CivilCraft press {{key:Mod+V}} and click where they go, or press {{key:Mod+Shift+V}} to put them at their own coordinates, which is usually what you want for real survey data.

The rows are read exactly as a [point file](topic:point-file-formats): commas, tabs or spaces, a header row if there is one. Without a header, the column order comes from **Point rows** in [CivilCraft settings](topic:settings).

When both are there, CivilCraft decides by what is newer: rows on the system clipboard that differ from CivilCraft's last copy were copied later, so they are pasted. Text that holds no points is ignored, and CivilCraft's own copy is pasted instead.

## Between projects and tabs

The copy is kept in this browser, so a second tab of CivilCraft can paste it, even after the first tab closes. Points copied in a metre project and pasted into a feet project keep their numbers as they are: nothing is converted, and the status bar says so.

## What is not copied

Only survey points are copied for now. Alignments, pads, pipe networks, breaklines and boundaries cannot be copied or pasted yet. Pasting cannot move existing points: use {{ui:Cut}} and paste, or move one point at a time ([Edit a survey point](topic:edit-points)).
