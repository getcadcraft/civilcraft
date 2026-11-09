---
title: Router carving: what it does not do yet
summary: The things people ask a CAM program for that Router carving does not do yet, so you know before you start.
section: tasks
order: 5
keywords: not built, limits, 5 axis, lathe, tool library, simulation, nesting, text, fonts
---

## Not built

- **Letters from text.** Router carving carves outlines, and CadCraft has no command to turn text into outlines yet, so text in a drawing is not carved. Bring letters in as outlines (for example a DXF or SVG where the text was converted to curves in the program that made it) or draw them.
- **Picture to outline.** It does not trace a picture into vector shapes; for a picture use a relief.
- **A tool library.** You type the bit each time; the settings are kept.
- **Real machine limits.** The preview and the check model the cutter's shape and the program's text, not your machine's acceleration, spindle power or the tip radius of a real V-bit.
- **Two-sided work, 4 and 5 axis, lathe.** Not built.
- **Tabs and holding down, lead-in and lead-out arcs, ramping.** Cuts plunge at the plunge feed.
- **Arcs in the G-code.** Paths are short straight lines.
- **Other apps.** It is in CadCraft. PartCraft, ModelCraft and SuperCad Studio come later through the same engine.

Tell us what you need first.
