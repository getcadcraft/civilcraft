---
title: Worksheets: schedules linked to the objects
summary: Saved worksheets with rows from plants, planted areas, paving, walls, steps, ground modifiers or all quantities; your own columns and formulas, groups and totals; CSV, XLSX and a table on the sheets, always up to date.
section: tasks
order: 164
keywords: worksheet, schedule, plant schedule, hardscape schedule, quantities, columns, formula, total, sum, count, group, filter, csv, xlsx, spreadsheet, table on sheet
---

{{ui:Worksheets}} (Landscape › More) opens this project's worksheets. The first time, the **plant schedule** and the **hardscape and areas schedule** are made for you. A worksheet is worked out from the objects every time it is shown, written out or put on a sheet: change a bed and its counts change everywhere.

- **Rows from**: plants (one row per species, cultivar and size), planted areas, paving, walls, steps, ground modifiers (cut and fill) or all quantities.
- **Columns**: a field (`qty`, `area`, `botanical`, or a name in brackets like `[Net area]`) or a formula: `+ - * / ^ %`, `&` to join text, `= <> < <= > >=`, and `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. A formula that cannot be worked out shows `#ERR` (or `#DIV/0`) in its cell. Formulas are read by CadCraft's own parser; nothing in them is run as code.
- **Total** per column (sum, count, average, smallest, largest), **Group by** (subtotals per group) and **Only rows where**.
- {{ui:Save as CSV}}, {{ui:Save as XLSX}}, and **Put this worksheet on the sheets** (Sheets › Worksheets draws it as a table, over as many sheets as it needs).

Labels on plants and areas read the same field names (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
