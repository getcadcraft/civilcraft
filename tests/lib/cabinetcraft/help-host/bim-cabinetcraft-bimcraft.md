---
title: CabinetCraft in BimCraft
summary: What CabinetCraft does in BimCraft: the room from the model, the cabinets as furniture elements on the level, a schedule read back from the model, and the plan on the level.
section: reference
order: 5
keywords: cabinetcraft, bimcraft, cabinets, add-on
---

## The room comes from the model

On the {{ui:Room}} tab, {{ui:Find rooms}} lists the rooms the walls of the open model enclose. Select walls in BimCraft first and the rooms that touch them come first. {{ui:Use this room}} makes the room the job's room, with the doors and windows near its edge as the job's openings, and remembers which level it is on. Doors and windows further than 600 mm from a wall are left out and counted.

## The cabinets become elements

{{ui:Drawings}} › {{ui:Place in the model}} makes every cabinet, filler and end panel a piece of furniture (an IfcFurniture; in an IFC2X3 model an IfcFurnishingElement) and every countertop piece a building element proxy. They stand on the level the room came from, in the room's place. Each has a solid made of one prism per panel, coloured by the material pick, and a property set called CabinetCraft with its number, template, run, row, size, height above the floor, material and the job. It is one undo step; {{ui:Replace in the model}} replaces this job's elements and nothing else; {{ui:Remove from the model}} takes them out.

## Schedule and check, tied to the model

{{ui:Export}} › {{ui:Schedule from the model (CSV)}} reads the schedule back from the elements that are in the model, so it shows what is really there. {{ui:Check the model against the job}} compares the numbers in the model with the job and tells you what is missing or extra. The cut list is the job's own (the Export view); every element carries its cabinet number so the two can be matched.

## The plan on the level

{{ui:Draw the plan on the level}} draws the job's plan as drafting lines in the level's plan view, so it appears in the plan views and on the sheets BimCraft makes. Elevations and sections of the cabinets are BimCraft's own, cut from the elements; the job's own elevations and sections can be saved as a printable sheet set in {{ui:Drawings}}.

## What it does not do here

There is no G-code in BimCraft (a CAM export is PartCraft's); you get the cut list, the nested DXF, the drilling lists and labels. The elements are made when you press the button: changing the job afterwards does not move them until you place again. Editing a cabinet in BimCraft does not change the job.
