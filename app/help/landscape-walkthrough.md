---
title: Design a garden, start to finish
summary: The landscape architect's ten steps, from the survey to the published set, with what the Landscape workspace does for each one today and what it does not do yet.
section: tasks
order: 158
keywords: tutorial, walkthrough, how to, landscape design, garden design, getting started, example, sample, step by step, survey, linework, terrain, planting, schedule, sheets, publish, one project
---

A landscape design goes round: survey, sketch, linework, ground, areas, levels, planting, schedules, sheets, and back again. These are the ten steps, with what exists for each one. Where a step has a gap, it is named in **Not built yet** at the end, and not hidden in the step.

You can follow along on the sample site, or on your own survey drawing. With your own, start at step 1.

## 1. Bring in the survey

{{ui:Surface}} › {{ui:Linework from a drawing…}}, choose the survey drawing (DWG 2000–2018 or DXF). Check the units, take the contours, 3D polylines and boundary for the surface, and the point blocks as survey points. The **Survey levels and check** section reads levels written as text or as an attribute and lists what looks wrong (units, coordinate system, distance from zero, flat contours, odd levels, doubled points) before you add anything. See [Check a survey drawing on import](topic:survey-check) and [Open a DWG or DXF as linework](topic:open-dwg-dxf). Set the coordinate system with {{ui:Coordinate system…}}.

## 2. Hand sketches

A sheet on paper, such as an old survey or a marked-up print, comes in with {{ui:Scan…}} (Start from a scan): it is placed to scale or on known coordinates under the plan, and can be traced into linework. ModelCraft reads a photo of a hand sketch (File › Import a sketch photo…). CivilCraft itself has no tool for a hand sketch: place the sheet under the plan and draw over it.

## 3. Sketch to linework

Draw feature lines and outlines over the survey in CivilCraft, or draw them in the 2D drawing. Landscape › More › {{ui:From a line}} turns a line into paving, a planted area, a wall, steps, a feature line and more, kept linked: move the line and the object follows. See [Objects from linework](topic:objects-from-lines). In SuperCad Studio, open the site, the drawing and the building model in one project: the **Landscape** workspace has the tools of all of them, and a line picked in the 2D drawing can become a landscape object that follows it (Ctrl+K, {{ui:Landscape object from the picked drawing line}}).

## 4. The proposed ground

Open {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Build the proposed ground with {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} and grading areas with spot levels and contours; the paving, paths, walls, ramps and steps you add grade into the same proposed surface. The existing ground never changes. {{ui:Levels}} › {{ui:Ground modifiers…}} lists everything that shapes the ground in one order, with cut and fill for each. See [Grading](topic:landscape-grading) and [Ground modifiers and live levels](topic:ground-modifiers).

## 5. Paving and planted areas

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} and {{ui:Steps}}. {{ui:Areas}} draws a lawn, bed, meadow or groundcover with its build-up; it clips itself around paving, walls and steps. {{ui:Bed}} fills an area at the plants' spacing, from a mix of plants. See [Hardscape](topic:hardscape), [Planted areas](topic:planted-areas) and [Planting](topic:planting).

## 6. Levels, slopes and junctions

Under **Grading checks**, tick **Slope analysis** and **Flow arrows and ponding**. If water ponds against a terrace, add a {{ui:Swale}} round it. Properties tell you how many risers the steps need and whether they fit, and where a path is steeper than its limit. The Problems panel lists where objects meet badly: a wall over-topped, a bed above the paving, steps that miss their landing. {{ui:Spot level}} and {{ui:Gradient arrow}} label the ground and update themselves.

## 7. Planting

In **Plants**, search the plant list (a few hundred species, or your own list), choose one, and {{ui:Plant}}, {{ui:Bed}} or {{ui:Hedge}}. Set the plant's size and labels from More. More › {{ui:Plant table}} edits your own records: cultivars, supplied sizes, density, specification notes. Each record can carry your own symbol and 3D model (OBJ, STL or GLB), and More › {{ui:Plant graphics}} draws plants simpler at coarser scales. See [The plant list](topic:plant-list), [Plant records](topic:plant-records) and [Plant graphics](topic:plant-graphics).

## 8. Quantities and schedules

More › {{ui:Worksheets}}: the plant and hardscape schedules, and your own, stay linked to the objects; save them as CSV or XLSX or put them on the sheets (see [Worksheets](topic:worksheets)). More › {{ui:Plant schedule…}} sends the counts to TakeoffCraft. The hardscape quantities are in the paving, wall and steps Properties. Irrigation has its own bill of materials: {{ui:Irrigation}} › **Check the system…**. See [Irrigation](topic:irrigation).

## 9. Drawings and sheets

More › {{ui:Landscape sheets…}}: planting, grading and irrigation plans, with details. {{ui:Levels}} › {{ui:Section line}} draws sections through the ground, walls, build-ups, steps and plants. See [Landscape sheets](topic:landscape-sheets) and [Sections and the publish set](topic:landscape-sections).

## 10. Publish

{{ui:Publish set (.zip)}} in the sheets dialog makes one PDF with a sheet list and a DWG per sheet. More › {{ui:Export landscape IFC}} gives BimCraft the plants and the hardscape. Save the project: everything is in the one file.

## Change one thing: the staircase

The point of keeping everything in one project is that a change carries through. Try it with a flight of steps between two terraces:

1. Draw the flight's line as a feature line (or a line in the drawing), then Landscape › More › {{ui:From a line}} › {{ui:Steps}}. In the steps' Properties tick **Shapes the ground**, and set the bottom and top levels to the two terraces.
2. Draw a planted bed beside and under the flight with {{ui:Areas}}, and paving on the terraces. The bed clips itself around the steps and the paving, and the plant schedule counts only what is planted.
3. Raise the top level of the flight in Properties. The proposed ground, the spot levels, the gradient arrows and the cut and fill change at once. If the flight no longer meets the upper terrace, the Problems panel says by how much.
4. Move the flight's line. The steps follow their line in the same undo step; the bed clips again and is recounted, and the worksheets and schedules show the new numbers.
5. Press Ctrl+Z once: the line, the steps, the ground and the bed go back together.

See [Ground modifiers and live levels](topic:ground-modifiers), [Planted areas](topic:planted-areas) and [Worksheets](topic:worksheets).

## Not built yet

These are asked for and are not in this build:

- Walls that shape the ground (they report where they meet it and their top can follow it).
- Editing your own Library plant list in the app (edit the project's list and save it as a plants file).
- Textures and colours of your own GLB plant models (the shape is read; the plant's colour is used).

See [The Landscape workspace](topic:landscape) for every tool.
