---
title: Work out the hours of sun on a site
summary: Pick a day (or a season) and a time zone, and see the hours of direct sun on every wall of every mass and on the ground round them, with the ground drawn on the plan and the numbers as CSV.
section: tasks
order: 98
keywords: sun, sun hours, shadow, shade, solar access, daylight hours, facade, wall, season, solstice, equinox, time zone, daylight saving, latitude, longitude, CSV, raster
---

**Sun hours** counts the hours of direct sun that reach each wall of each building mass and the ground round them, on a day you pick or averaged over a season. The masses and the ground itself cast shade; nothing else does (no trees, no neighbours you have not drawn). Sky light that is not direct sun is not counted.

## Before you start

The sun's place comes from the site's latitude and longitude, which come from the project's **coordinate system**. A project with none is refused with a message: set it first (**Coordinates** in the GIS group). A latitude and longitude typed by hand would be a guess, so there is no box for them.

## Work it out

In **Properties**, under **Building masses**, **Sun hours**:

1. Pick the **Day**. It starts at the day the sun is lowest where you are (21 December, or 21 June in the southern hemisphere). For a season, tick **Over a season**, pick the **Last day** and how many days apart to sample.
2. Type the **Time zone**: a name such as `America/Mexico_City`, or an offset from UTC such as `-6`. A name follows that zone's daylight saving rules for the day; an offset you type is used exactly as typed, so use the one in force on that day. The line under the box tells you which offset it found.
3. Choose how often to place the sun (every 5, 10, 15 or 30 minutes), then **Work out the sun hours**. A season runs in background workers; **Stop** cancels it.

## What you get

- A table by mass: the **worst wall**, the **average** and the **best wall**, in hours a day, and a table of every wall with the way it faces and its hours floor by floor.
- The ground round the masses, drawn on the plan from dark (no sun) to yellow (the most any cell gets), with a key. Cells under a mass are left blank. **Show the ground on the plan** turns it off.
- **Walls as CSV** and **Ground as CSV** save the numbers.

For a season the figures are the average a day over the days sampled. Nothing is saved in the project: the result is for looking at, and running it again makes it again.

## Good to know

- A wall counts a moment as sunny only when it faces the sun and nothing is in the way. A wall facing away gets nothing.
- The ground is sampled on a grid that depends on the size of the site, and the sun's place at the middle of each time step, so hours are right to about the step you chose.
- The sun's place is a published astronomical formula, good to about a minute of arc.
