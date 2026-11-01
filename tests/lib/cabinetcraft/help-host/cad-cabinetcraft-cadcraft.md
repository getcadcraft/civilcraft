---
title: CabinetCraft in CadCraft
summary: What CabinetCraft does in CadCraft: the shop drawings drawn as real CAD entities on layers of their own, a block per cabinet type, the room from a closed polyline, and the cabinets on the 3D tab.
section: reference
order: 5
keywords: cabinetcraft, cadcraft, cabinets, add-on
---

## Shop drawings as CAD entities

{{ui:Drawings}} › {{ui:Draw the sheets}} draws, in the open drawing and in its units, on layers whose names start with CC-:

- the **plan**: the room outline, every cabinet and its number, the countertops hatched, the doors and windows, and real linear dimensions;
- an **elevation of every run**, with one block for each cabinet type (CC-CAB-1, CC-CAB-2 …) inserted where the cabinet stands, its number below it and dimensions;
- a **section of every cabinet template**;
- the **cabinet schedule**, the **cut list** and, after {{ui:Nest on sheets}}, the **nested sheets** as tables and rectangles.

Each sheet is in a frame with its title, and the frames are laid out in rows to the right of what is already in the drawing (or from the point you set). The whole drawing is one undo step. Everything is tagged with the add-on's data, so {{ui:Redraw the sheets}} replaces the earlier drawing and {{ui:Erase the sheets}} removes it; DXF and DWG carry it out like any other entities. Drawn lines belong to CadCraft: change them, plot them, put them on a layout.

## The room from the drawing

On the {{ui:Room}} tab, {{ui:Find rooms}} lists the closed polylines of the drawing (the ones you selected first). {{ui:Use this room}} makes the outline the job's room. Arcs are cut into chords of at most 15 degrees. Blocks whose names look like doors or windows and sit near the edge become openings.

## On the 3D tab

{{ui:Show on the 3D tab}} puts every cabinet on the 3D tab as a solid (one group each, tag CabinetCraft), for looking at.

## Command line

CCDRAW draws the sheets, CCROOM takes the selected closed polyline as the room, CCSAMPLE loads the example kitchen, CCNEST nests, CCCHECK counts the problems. They work without the panel too (in the CadCraft mounted in SuperCad Studio there is no right panel for an add-on, so use them there).

## What it does not do here

CadCraft has no CAM export, so there is no G-code: the nested sheets are in the drawing, and the DXF in {{ui:Export}} opens in PartCraft's Manufacture. The drawing is made from the job when you press the button; it does not follow later changes to the job.
