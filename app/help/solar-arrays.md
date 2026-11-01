---
title: Lay solar arrays on the ground
summary: Place ground-mounted solar tables inside a parcel or pad, with the rows spaced for the ground each one really stands on, steep ground left empty, the year's energy worked out and the tables shown on the plan and in 3D.
section: tasks
order: 190
keywords: solar, pv, photovoltaic, array, ground mount, tables, rows, row spacing, shade, terrain, slope, piles, yield, kWp, energy, horizon
---

## What you will learn

How to lay a field of solar tables on a site that is not flat, and what the numbers mean. Open it from Surface › More › Solar arrays.

## Lay out the tables

1. Pick **Where**: a parcel or a pad of the project, or type the corners of an area. Tick any pads or parcels that must stay **empty** (a building, a pond).
2. Type the **latitude and longitude** of the site. The sun depends on them; nothing is guessed. If the project has a coordinate system, **Place from the coordinate system** fills them in.
3. Set the tilt, the facing (blank is toward the equator), how many modules make a table and the module's power and size. The module numbers start as generic values and are labelled so; type your own.
4. Press **Lay out tables**. The window gives the number of tables and modules, the size in kWp and the row-to-row distance.

Each table is a column in the area, placed from the front and walked back. A table is placed only where the ground under it is within the slope limit, inside the area and the setback, and where the piles it needs are not taller than the limit you set. Places that fail are left empty, and the window says how many and why.

## Rows are spaced for the ground

On flat ground the rows stand apart by the usual no-shade rule: a row's shadow at noon on the winter solstice must not reach the lower edge of the row behind it. On a slope CivilCraft applies the same rule to the ground the next row really stands on. Where the ground rises behind a table the rows can stand closer; where it falls away they stand farther apart. The window shows the closest, the farthest and the mean spacing beside the flat-ground spacing, so you can see what the terrain did.

A table's plane is raised on piles until every sample under it clears the ground by the clearance you set. The tallest pile shows in the result.

## The year's energy

**Year's energy** works out the light on the tilted plane for a representative day of each month, the cell temperature, the typed losses, the tables shading one another and the hills on the horizon taking the sun they hide. The sky is a clear sky, so the answer is an upper bound; real weather gives less. It is an early-design estimate, not a yield report.

## Keep it

**Save to the project** keeps the inputs and the numbers in the project file; the tables are worked out again from the ground when the file opens, so a changed surface moves them. They show on the plan and in 3D (Show › Solar arrays). The table list downloads as CSV. One undo step removes or restores an array.

## Not built yet

Weather data in place of the clear sky, tables that follow the ground in the east–west direction, trackers, and the electrical design (strings, wire, inverters) in CivilCraft. BimCraft's Solar PV pane has strings and the one-line for roofs.
