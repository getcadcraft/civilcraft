---
title: CabinetCraft in PartCraft
summary: What CabinetCraft adds in PartCraft: the cabinets as bodies in the 3D viewport and G-code for every nested sheet.
section: reference
order: 5
keywords: cabinetcraft, partcraft, cabinets, add-on
---

## What you get in PartCraft

PartCraft is the app that does the most with a CabinetCraft job.

- **The cabinets in the viewport.** {{ui:Drawings}} › {{ui:Place in viewport}} puts every panel, door, drawer front, filler, end panel and countertop in the 3D view as a body, with the floor and translucent walls if you want them. It is one undo step; {{ui:Remove from viewport}} takes them out as a group. They are for looking at: they have no mass and are not in the STL or STEP of the part.
- **G-code.** After {{ui:Nest on sheets}}, {{ui:Make the G-code}} writes one program per nested sheet through PartCraft's own CAM posts (GRBL, Fanuc, LinuxCNC), and {{ui:Check the programs and holes}} reads them back for you.

## What it does not do here

Nothing has been cut on a machine. See the topic "CabinetCraft: not built yet".
