---
title: Let an AI assistant work with your site
summary: Turn on assistants in Settings so an assistant on your computer can read the open site (points, surfaces, volumes, profiles, parcels), add survey points, save and export LandXML or DWG, through CadCraft Studio. Off until you turn it on.
section: tasks
order: 60
keywords: ai, assistant, mcp, script, automation, studio, points, elevation, station, offset, alignment, volume, cut, fill, profile, parcel, landxml, dwg, usd, folders, permissions, disconnect, activity
---

## What you will learn

How to let an AI assistant (any assistant that speaks MCP) work with the site you have open, what it can and cannot do, and how to stop it.

## What an assistant can do in CivilCraft

| It asks for | What it gets | Needs |
|---|---|---|
| The site | Name, units, coordinate system, point groups, alignments, surfaces, pads, parcels and pipes | Read |
| Survey points | Number, easting, northing, elevation and description, by group, by description or inside a box | Read |
| Surface elevations | The existing ground (or the graded surface) at any points it names | Read |
| Stations and offsets | The station and offset of points along an alignment, or the coordinates and ground elevation of stations | Read |
| A profile | Ground, design profile and graded surface elevations along an alignment, every so many feet or meters | Read |
| Cut and fill | Volumes between the existing ground and the graded surface (each pad and corridor too), or between the ground and a level | Read |
| Parcels | Corners, area (with acres or hectares), perimeter and the legal description | Read |
| A selection | The points it names are selected on the plan, as if you had picked them | Edit |
| New survey points | Points added with the numbers it gives, or the next free ones. Each call is one step you can undo | Edit |
| Save | CivilCraft's own {{ui:Save}} | Save |
| LandXML or DWG | The same files as the {{ui:LandXML}} and {{ui:DWG}} buttons | Export |
| The site in 3D | OpenUSD (.usdz, .usda or .usdc) of the ground, graded surface, pads and pipes, as the 3D view exports it | Export |
| Plants and the plant schedule | Plants found in the plant list by any name, and the plant schedule's counts | Read |
| Planting and grading | Plants, a bed or a hedge placed, or a platform, berm, swale or grading area added, each one step you can undo, with its cut and fill | Edit |
| An irrigation check | Each zone's flow, the pressure needed at its valve and at the supply, the worst-case head, run times, problems and the bill of materials, as a calculation aid that an irrigation designer checks | Read |

It works with the site that is open. In Studio it can also save and export into folders you choose (below); without a folder its files download as the buttons' do.

## Turn it on

Assistants reach CivilCraft through CadCraft Studio on your computer; the plain browser has no way in.

1. Open {{ui:Settings}} and choose the **CivilCraft** tab.
2. Under **Assistants**, tick **Let AI assistants and scripts use CivilCraft**.
3. **Read** is ticked for you. Tick **Edit**, **Save** or **Export** only when the assistant needs them.
4. To let it save and export into a folder, choose {{ui:Add a folder…}} under **Folders it may use** and pick the folder in Studio's dialog. {{ui:Remove}} takes it back at once; any other path is refused.
5. Connect the assistant in Studio (Studio shows the address and the settings to paste into it).

## While an assistant is connected

A note at the top of the right panel says which assistant is connected and what it can do. Click {{ui:Disconnect}} to end its session at once; it has to connect again to continue.

**Activity**, under **Assistants** in Settings, lists every call the assistant made, newest first, with whether it worked.

:::tip
Ask in plain words, for example "what is the ground elevation every 50 feet along Main Street?", "how much cut and fill do the pads need?" or "add a control point at these coordinates". The assistant reads the site and answers, or makes the change as one step you can undo.
:::

## Without opening CivilCraft

The CadCraft file server for assistants (`npx @getcadcraft/mcp`) and the `cadcraft` command line open saved CivilCraft projects (`.civilcraft.json`) and points files with CivilCraft's own code, no window: the same reading tools, adding points, saving the project, LandXML and the site in 3D as OpenUSD. `cadcraft convert site.civilcraft.json site.xml` writes LandXML from the command line. Opening LandXML, the DWG export and the Landscape workspace's tools still need the CivilCraft window.

## Turn it off

Untick **Let AI assistants and scripts use CivilCraft**. Every assistant is disconnected straight away, and the setting is kept for next time.

## See also

- [Recipes for AI assistants](common:assistants-recipes): worked examples, each with the tools it calls.
- [Lay out a horizontal alignment](topic:alignment)
- [Build and refine the surface](topic:build-surface)
- [Select, copy and paste survey points](topic:copy-paste-points)
- [CivilCraft settings](topic:settings)
