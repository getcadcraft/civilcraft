---
title: Description keys and line codes
summary: Turn field codes into point groups with descriptions, and join coded points into lines (begin, end, close) that become breaklines.
section: tasks
order: 16
keywords: description keys, field codes, line codes, figures, linework, begin, end, close, point groups, codes, survey codes, data collector, breaklines, curb, edge of pavement
---

Survey crews code every shot in the field: `EP` for edge of pavement, `TC` for top of curb, `BLDG` for a building corner. The code is the first word of the point's description. CivilCraft groups points by it, and turns line codes after it into lines.

## Line codes

A line code is the word right after the field code:

| Description | Meaning |
|---|---|
| `EP B` | Begin a new edge-of-pavement line at this point |
| `EP` | Continue the current EP line |
| `EP E` | End the current EP line at this point |
| `BLDG C` | Close the building: join this point back to the line's first point |

Points with the same code are joined in point-number order. Different codes are different lines even when they share a group, so `EP1` and `EP2` give two edges at once. A code that never uses a line code is joined through all its points, as in earlier versions.

Lines in a group used as **Breakline** become breaklines, one per line, so a curb with a gap is not stretched across the gap. Lines in other groups are drawn on the plan (layer V-NODE-LINE) and go out in DXF, DWG and PDF.

The words for begin, end and close are `B`, `BEG`, `START`; `E`, `END`; and `C`, `CLO`, `CLOSE`. Change them, or turn line codes off, in the dialog below.

## Description keys

A description key turns a code into a point group, a use and a long description.

1. Under **Points**, click {{ui:Description keys and line codes}}.
2. Click {{ui:Add a key}} and fill in the row:
   - **Code**: the field code to match. `*` stands for any characters and `?` for one, so `EP*` catches EP, EP1 and EP12.
   - **Group**: the point group these points join (empty = the code itself). `EP*` with group `EP` puts EP1 and EP2 in one group while they stay separate lines.
   - **Use**: Points, Breakline or Left out, for when the group first appears (or leave it to the **Points** table).
   - **Description**: the long name, shown in a point's **Properties**.
3. The **Points** column counts the points each key catches as you type. The first key that matches a code wins.
4. Click {{ui:Apply}}. The groups, the surface and the plan follow in one step: {{key:Mod+Z}} undoes it.

A group keeps the use you gave it in the **Points** table; a key's use only sets it for a group that is new. The keys and line codes are saved in the project file.
