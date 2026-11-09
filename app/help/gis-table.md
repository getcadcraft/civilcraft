---
title: Work with a layer's attribute table
summary: See every feature of a GIS layer as a table, sort and filter it, select rows and features together, fix values, add fields, calculate new values and save the table as CSV.
section: tasks
order: 143
keywords: attribute table, table, fields, columns, rows, sort, filter, expression, select, edit, field calculator, calculate, add field, rename field, remove field, csv, export, gis, shapefile, geopackage, symbology
---

Open a layer's table from its **three dots** menu in the GIS layers list ({{ui:Attribute table…}}), from Surface › More › {{ui:Attribute table}}, or by typing `ATTRIBUTES`, `ATTTABLE` or `TABLE`. The table opens beside the plan and stays open while you work. Only the rows you can see are drawn, so a layer with thousands of features opens and scrolls quickly.

## Sort, filter and select

- **Sort:** click a column title. A second click reverses it, a third puts the file's order back. Empty values always stay at the bottom. Sorting only changes what you see, never the layer.
- **Filter:** type in the filter box. An expression such as `AREA > 500 and USE = 'Res'` keeps the rows where it is true (the same words as the Select tab of [Analyze GIS layers](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Anything that is not an expression, such as `oak maple`, looks for those words in every column.
- **Select rows:** click a row. Ctrl+click adds or removes one, Shift+click selects a run, and {{ui:Select shown rows}} takes every row that passes the filter. The selected features are drawn on the plan, and a click on a feature on the plan selects its row here.
- With rows selected you can {{ui:Zoom}} to them, make a **layer from the selection**, and read the total area or length in the status line.

## Fix values

Double-click a cell (or move to it with the arrow keys and press Enter), type the new value and press Enter. Escape leaves it as it was. A value must fit the column: numbers as numbers, dates as `YYYY-MM-DD`, yes/no as yes, no, true or false. A value that does not fit is refused with a sentence and nothing changes. An empty box makes the value empty. Every edit is one undo step: {{ui:Undo}} and {{ui:Redo}} are at the bottom of the table, and Ctrl+Z works on the plan.

## Fields

Under **Fields** you can add a field (text, number, date or yes/no), rename one, or remove one. A new field starts empty. A rename follows through: the label field and the [style by attribute](topic:gis-symbology) of the layer move to the new name, and removing a field drops the label and style that used it. Each is one undo step that brings everything back.

## Field calculator

Writes a value into every row (or only the selected rows) from the row's other fields, its geometry and a few functions. Pick an existing field or **A new field…** and give it a name and type. Nothing is run as code: the expression is read by a small parser with a fixed list of functions.

| Group | Words |
|---|---|
| Numbers | `+ - * /`, brackets, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (text goes in 'single quotes'; a field name with spaces goes in "double quotes" or [square brackets]) |
| Choosing | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Dates | `year month day` of a `YYYY-MM-DD` value |
| Geometry | `$area $perimeter $length $x $y $vertices`, in the project's units |

A result that cannot be stored in the field's type (text in a number field) is left empty and counted in the message. Dividing by zero gives an empty value. For example `round($area / 43560, 2)` writes acres from square feet.

## Export

{{ui:Export CSV}} saves the rows you see (after the filter and the sort) as a UTF-8 CSV file with the field names in the first line. A text that starts with `=`, `+`, `-` or `@` gets a leading apostrophe so a spreadsheet does not run it as a formula. To save the layer itself, use [Export as-built data for GIS](topic:gis-export).

## Limits

The table shows the layer in a single sort order and one filter at a time. Rows cannot be added or deleted here (make a new layer from a selection instead), geometry is not edited, and a field's type cannot be changed after it is made.
