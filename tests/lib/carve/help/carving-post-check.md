---
title: The post-processor and the program check
summary: Change the text the G-code has around the cuts to suit your machine, and what the check of the program looks for.
section: tasks
order: 4
keywords: post-processor, post processor, g-code, grbl, linuxcnc, mach3, fanuc, header, footer, tool change, spindle, check, simulation
---

## The post-processor

A post-processor is the text a machine needs around the cuts: the start of the program, what to do for a tool change, how to start and stop the spindle, and the end. Under {{ui:Post-processor}} choose a dialect: GRBL (hobby routers and lasers), LinuxCNC, Mach3 or Fanuc style. These are generic: check them against your machine's manual.

Open {{ui:Edit the post-processor}} to change the lines. {rpm} {tool} {name} {safe} {feed} {unit} are filled in. Your changes are kept for that dialect, and {{ui:Back to the built-in}} drops them. You can also number the blocks (N10, N20 …).

GRBL has no tool change command, so the program stops with a pause that names the tool; resume once you have changed it.

## The check

Every program is read back and checked for what would crash or waste a job: a cut before any feed rate, a cut below the top with the spindle off, a fast move across the work below its top, a move outside the table (give the table size), a cut deeper than the material, no millimetres or inches declared, and no program end. To check a program from somewhere else, choose {{ui:Check a G-code file}} and pick the file (.gcode, .nc, .ngc, .tap, .txt): its problems are listed the same way. An AI assistant can run the same check on any program through the add-on's engine.

## What it does not know

The check does not know your machine's limits, your clamps or your bit's real length. It is a second pair of eyes, not a guarantee.
