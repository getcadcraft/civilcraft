---
title: Let an AI assistant work with your site
summary: Turn on assistants in Settings so an assistant on your computer can read the open site (points, surfaces, stations and offsets) and select survey points, through CadCraft Studio. Off until you turn it on.
section: tasks
order: 60
keywords: ai, assistant, mcp, script, automation, studio, points, elevation, station, offset, alignment, permissions, disconnect, activity
---

## What you will learn

How to let an AI assistant (any assistant that speaks MCP) look into the site you have open, what it can and cannot do, and how to stop it.

## What an assistant can do in CivilCraft

| It asks for | What it gets | Needs |
|---|---|---|
| The site | Name, units, coordinate system, point groups, alignments, surfaces, pads, parcels and pipes | Read |
| Survey points | Number, easting, northing, elevation and description, by group, by description or inside a box | Read |
| Surface elevations | The existing ground (or the graded surface) at any points it names | Read |
| Stations and offsets | The station and offset of points along an alignment, or the coordinates and ground elevation of stations | Read |
| A selection | The points it names are selected on the plan, as if you had picked them | Select survey points |

An assistant never changes the site: it cannot move, add, delete or save anything in CivilCraft, and it cannot open files. You open the site; it works with the one that is open.

## Turn it on

Assistants reach CivilCraft through CadCraft Studio on your computer; the plain browser has no way in.

1. Open {{ui:Settings}} and choose the **CivilCraft** tab.
2. Under **Assistants**, tick **Let AI assistants and scripts use CivilCraft**.
3. **Read** is ticked for you. Tick **Select survey points on the plan** too if the assistant may select points for you.
4. Connect the assistant in Studio (Studio shows the address and the settings to paste into it).

## While an assistant is connected

A note at the top of the right panel says which assistant is connected and what it can do. Click {{ui:Disconnect}} to end its session at once; it has to connect again to continue.

**Activity**, under **Assistants** in Settings, lists every call the assistant made, newest first, with whether it worked.

:::tip
Ask in plain words, for example "what is the ground elevation every 50 feet along Main Street?" or "select the tree shots east of the creek". The assistant reads the site and answers, or selects the points for you to copy or delete.
:::

## Turn it off

Untick **Let AI assistants and scripts use CivilCraft**. Every assistant is disconnected straight away, and the setting is kept for next time.

## See also

- [Lay out a horizontal alignment](topic:alignment)
- [Build and refine the surface](topic:build-surface)
- [Select, copy and paste survey points](topic:copy-paste-points)
- [CivilCraft settings](topic:settings)
