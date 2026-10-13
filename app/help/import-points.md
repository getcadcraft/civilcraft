---
title: Import survey points
summary: Open a CSV or text point file, check the column order in the Import points dialog, fix rows that cannot be read, and sort the points into groups.
section: tasks
order: 10
keywords: import points, csv, txt, pnezd, penzd, point file, survey, cogo points, point groups, columns, northing easting
---

A point file is a text file with one point per line: point number, northing, easting, elevation and description in some order, separated by commas, tabs, semicolons or spaces. CivilCraft reads it in the browser and builds a surface from it at once.

## Before you start

- Know the file's column order if you can (PNEZD and PENZD look the same to a computer).
- Know its units. CivilCraft does not convert: set **Units** in the left panel to match the file (see [Units, stations and number formats](topic:units-and-stations)).
- Coordinates can be large (state plane northings and eastings in the millions are fine).

## Import the file

1. Click {{ui:Open}} in the toolbar, or press {{key:Mod+O}}, and choose the file. You can also drag it onto the plan.
   The **Import points** dialog opens with the file name, a **Columns** list set to {{ui:Detect}}, a summary line and the first six points.
2. Read the summary line. It says how many points were read, in which column order, how that order was found, and what separates the columns. The three ways the order is found:
   - "from the header row": the first line names its columns (Point, Northing, Easting, Elevation, Description, or X, Y, Z …). This is the safest.
   - "as chosen": you picked an order in **Columns**.
   - "guessed from the column count and your point row setting (PNEZD) — check that northing and easting are not swapped": there was no usable header. If your files are usually easting first, set **Point rows** to P, E, N, Z, D in [CivilCraft settings](topic:settings).
3. Check the preview table. Its columns are always **Point**, **Northing**, **Easting**, **Elevation**, **Description**, whatever order the file uses. Northings and eastings of a real site are usually clearly different sizes: if they look swapped, the guess was wrong.
4. If the order is wrong, choose the right one in **Columns** (for example {{ui:PENZD — point, easting, northing, elevation, description}}). The summary and preview update at once.
5. Look under the preview for **Rows not read**. Each line names the file line number, the reason and the start of the row. See [Rows that are not read](topic:import-points#rows-that-are-not-read).
6. Click {{ui:Import}}.
   The points appear on the plan, the view zooms to them and the surface is built. The status bar says, for example, "Imported 276 points from site.csv; surface: 546 triangles."

If the project had no name yet, it takes the file's name.

## Check the groups

Every point belongs to a group named by the **first word of its description**, in capitals: "GRD", "FL 12" and "fl" are groups GRD, FL and FL. Points with no description go in "(no description)".

1. Look at the table under **Points** in the left panel: group, number of points and a **Surface** choice.
2. Every group starts as {{ui:Points}}. Change flowlines, edges of pavement, tops and toes of slope, ridges and similar coded lines to {{ui:Breakline}}. Set groups that should not shape the ground (control points, tree tops, utility poles shot at the top) to {{ui:Left out}}.
3. Click a point on the plan (with {{ui:Select}}) to see its number, coordinates, elevation, description and group in the right panel.

:::warning
A breakline group joins **all** its points into **one** line, in point-number order. That works when each coded line was shot in order with its own code. Two separate flowlines both coded "FL" become one line zig-zagging between them. If your codes are shared, use the {{ui:Breakline}} tool to click the points of each line instead (see [Build and refine the surface](topic:build-surface)).
:::

## Rows that are not read

| Reason shown | What it means | What to do |
|---|---|---|
| "northing or easting is not a number" | A coordinate column holds text | Check the column order, or a stray text row in the middle of the file |
| "elevation is not a number" | The elevation column holds text | Wrong column order, or a description in the elevation column |
| "no point number" | The point column is empty | Number the point, or choose an order without P (NEZD, NEZ …): points are then numbered 1, 2, 3 … |
| "point 12 appears twice (the first one is kept)" | Two rows share a number | Renumber one of them in the file if both are real shots |
| "3 columns, expected 5 (PNEZD)" | The row is short | A broken line, or the wrong column order |

A point with an empty elevation is kept, but it is not used in the surface. The **Points** facts show how many points have an elevation.

Lines starting with `#`, `;` or `//` are comments and are skipped. Blank lines are skipped.

## Replace or add points

Importing again **replaces** all the points; it does not add to them. Your alignments, pads, pipes, drawn breaklines and boundary stay. The undo history is cleared, so save the project first if you may want the old points back. To combine two files, join them in a text editor or spreadsheet before importing (watch for repeated point numbers).

Points cannot be moved, edited or deleted inside CivilCraft yet. Fix them in the file and import again.

## Related

- [Point file formats](topic:point-file-formats): every column order and how headers are recognized.
- [Build and refine the surface](topic:build-surface).
