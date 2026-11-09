---
title: Router carving: getting started
summary: What the Router carving add-on does, how to switch it on, and how to go from a drawing or a picture to G-code for a router in a few steps.
section: start
order: 1
keywords: carving, router, cnc, v-carve, vcarve, engraving, relief, depth map, g-code, gcode, sign, lettering, inlay, grbl, add-on
---

## What it is

Router carving turns drawn shapes or a grey picture into G-code for a CNC router (or any machine that follows G-code). It does three things:

- **V-carve**: closed outlines such as letters and logos are carved with a V-bit that follows the middle of each shape, going deeper where the shape is wider, so the walls of the cut meet the edge of the outline exactly.
- **Engrave**: lines and outlines are followed at a depth.
- **Relief**: a grey picture becomes a 3D relief. White stays at the top and black is cut to the full depth.

It is an add-on, not another app. It is free and off until you switch it on in {{ui:Settings}} › {{ui:General}} › {{ui:Add-ons}} › {{ui:Router carving}}. Its tab, {{ui:Carving}}, is then in the right panel.

## Your first V-carve

1. Draw closed outlines, or open a drawing whose letters are outlines (text is not outlines: see [what it does not do yet](topic:carving-not-built-yet)), or select the ones you want.
2. In the {{ui:Carving}} tab, under {{ui:Shapes}}, choose {{ui:Whole drawing}} or {{ui:Selection}}. The line under it says how many closed shapes and open lines it found.
3. Under {{ui:What to cut}}, choose {{ui:V-carve}}. Set the **bit angle** (60° and 90° are usual) and the **deepest cut**.
4. Under {{ui:Machine}}, set the feeds, the spindle speed and the heights for your machine.
5. Choose {{ui:Make toolpaths}}. The preview shows the block as it would be cut, darker where deeper, and the program is checked.
6. {{ui:Download G-code}}, or {{ui:Draw toolpaths in the drawing}} to see them on the CARVE layers first.

The commands {{cmd:CARVE}}, {{cmd:CARVEDRAW}} and {{cmd:CARVEGCODE}} do steps 5 and 6 with the settings in the panel.

## Always air-cut the first run

The program is a starting point. Different machines read G-code differently, so check the post-processor against your machine's manual, set the zero where your program expects it, and run it above the material first.

## What it is not

It does not drive your machine, simulate chip loads or spindle limits, or know your bit's real geometry. See [what it does not do yet](topic:carving-not-built-yet).
