---
title: The Power lines workspace
summary: Overhead lines and underground cables on your site, with your own libraries, sag and tension under your load cases, clearance and strength checks, stringing tables, quantities, sheets and GIS export.
section: tasks
order: 160
keywords: power line, overhead line, electrical, distribution, poles, supports, conductor, sag, tension, stringing, clearance, underground cable, trench, workspace, utility
---

The Power lines workspace puts overhead lines and underground cables on the CivilCraft site you already have: the same survey points, the same ground, the same project file.

:::warning
A design aid. The workspace works out sag, tension, clearances and loads from **your** load cases and limits; no country's standard is built in. An engineer checks every result against the standard that applies before anything is built.
:::

## Open it

Choose {{ui:Surface}} › {{ui:More}} › {{ui:Power lines workspace}}, or **Power lines** under Workspace. The toolbar then shows a **Power lines** group; the Design and GIS groups step aside. Choose **Civil** under Workspace to go back. CivilCraft remembers the workspace you used last on this computer.

The left panel gains two sections at the top:

- **Power lines**: your load cases and limits, the lines and cables in the project, and **Checks**, always up to date. Click a check to select what it is about.
- **Library**: your own conductors, cables, supports, equipment and trench types. See [Your power-line library](topic:power-line-library).

## What is in the Power lines group

| Tool | What it does | Topic |
|---|---|---|
| **Line** | An overhead line: click each support | [Draw an overhead line](topic:overhead-line) |
| **Support** | Add a support on a span | [Draw an overhead line](topic:overhead-line) |
| **Cable** | An underground cable route in a trench | [Underground cables](topic:underground-cables) |
| **Equipment** | A cabinet, a transformer, a joint, or the source the network is fed from | [Underground cables](topic:underground-cables) |
| **Obstacle** | Something a line crosses: a road, a building, another line | [Checks](topic:power-line-checks) |
| **Profile** | The line profile: ground, supports and the conductor at each load case | [Draw an overhead line](topic:overhead-line#the-line-profile) |
| **More** | Load cases and limits, stringing tables, quantities, sheets and report, GIS, study files | [Sag and tension](topic:sag-and-tension), [Outputs](topic:power-line-outputs), [Study files](topic:power-line-study-file) |

Everything you add is one undo step, is saved in the project file, and draws on the plan on layers named `C-POWR-…`, so the DXF, DWG and PDF exports carry it too.
