---
title: The Landscape workspace
summary: Planting plans, grading, paving, walls, steps, irrigation and landscape sheets on the same site, the same surfaces and the same file as the civil work.
section: tasks
order: 150
keywords: landscape, landscape architecture, garden, planting, plants, trees, grading, hardscape, paving, irrigation, sprinklers, workspace, site design, landscape plan
---

The Landscape workspace puts landscape design tools on the CivilCraft site you already have: the same survey points, the same existing ground, the same proposed surface and the same project file.

## Open it

Choose {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. The toolbar then shows a **Workspace** choice and a **Landscape** group, and the Surface, Design and GIS groups step aside to make room. Choose **Civil** under Workspace to go back. CivilCraft remembers the workspace you used last on this computer.

The left panel gains three sections at the top:

- **Plants**: the plant list, to search and to choose what you place. See [The plant list](topic:plant-list).
- **Grading checks**: slope analysis, flow arrows and ponding. See [Grading](topic:landscape-grading).
- **Irrigation**: the heads and pipes you place next, the water supply's settings. See [Irrigation](topic:irrigation).

## What is in the Landscape group

| Tool | What it does | Topic |
|---|---|---|
| **Plant**, **Bed**, **Hedge** | Single plants, planting beds filled at the plants' spacing, hedges along a line | [Planting](topic:planting) |
| **Grade** | Platforms, berms, swales, grading areas with spot elevations and contours, slope and flow checks | [Grading](topic:landscape-grading) |
| **Hardscape** | Paving, paths, walls, kerbs, ramps and steps that follow the ground | [Hardscape](topic:hardscape) |
| **Irrigation** | Heads, pipes, valves, drip lines, the supply, coverage and a hydraulic check | [Irrigation](topic:irrigation) |
| **More** | The plant schedule, freeform objects, landscape sheets, IFC export, plant size and labels | [Landscape sheets](topic:landscape-sheets), [Freeform objects](topic:freeform-objects) |

Everything you add is one undo step, is saved in the project file, and draws on the plan on layers named `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` and `L-IRRG-…`, so the DXF, DWG and PDF exports carry it too.

## One surface for everything

Platforms, berms, swales, grading areas, paving and paths are graded into the **proposed surface**, the same one corridors and pads use. The **existing ground** never changes. Plants sit on whichever ground is under them, so they move when the grading changes. Earthwork counts the landscape grading with everything else.

:::tip
New to it? [Design a garden, start to finish](topic:landscape-walkthrough) goes through the whole workspace on the sample site.
:::
