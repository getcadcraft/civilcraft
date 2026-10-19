---
title: Work out sanitary design flows and check the sewer
summary: Enter the people and area that enter at each manhole of a sanitary network; CivilCraft adds them up down the network, works out the peak flow with a peaking factor and infiltration, and checks each pipe's capacity and velocity.
section: tasks
order: 93
keywords: sanitary, sewer, sanitary sewer, wastewater, design flow, peak flow, peaking factor, harmon, babbitt, infiltration, population, per capita, percent full, self-cleansing, velocity, pipe sizing, design sheet
---

Sanitary design flows work on the [pipe network](topic:pipe-network) when its {{ui:Type}} is {{ui:Sanitary}}. With nothing selected, the right panel then shows **Sanitary design flows** where a storm network shows storm drainage.

## Enter what comes in

1. Select a manhole. Under **Sanitary design flows**, type the {{ui:People entering here}} and the {{ui:Area entering here}} (hectares in a metre project, acres in a feet project).
2. For shops, offices or industry, type equivalent people: the area times the people per hectare (or acre) your agency uses. The area counts for infiltration either way.
3. Repeat for each manhole where a street or a lot connects. A manhole where nothing connects keeps both at 0.

Each pipe carries everything that enters at its upper manhole and above it. Select a manhole to see what passes through it.

## The settings

| Setting | What it means |
|---|---|
| {{ui:Flow per person}} | the average flow of one person a day: litres (metre project) or US gallons (feet project) |
| {{ui:Infiltration}} | groundwater that leaks in: litres per second per hectare, or gallons a day per acre |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), or Babbitt, 5 / P^0.2, with P the population in thousands |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | the factor is held between these two |
| {{ui:Manning n}} | for capacity and velocity |
| {{ui:Least velocity}} / {{ui:Most velocity}} | at the peak flow's own depth in the pipe |
| {{ui:Most of full capacity}} | how full a pipe may run at the peak, as a percent of what it carries flowing full |

The starting values are placeholders, not a standard. Use the values your agency publishes.

## What it works out

For each pipe, in flow order:

- peak flow = people × flow per person × peaking factor + area × infiltration
- capacity flowing full (Manning's equation at the pipe's slope), and how full the peak makes it
- the normal depth of the peak flow and the velocity there

The **Sanitary results** table lists each pipe's people, peaking factor, peak flow (L/s, or gpm and cubic feet per second), percent full and velocity. Problems are listed under it: a pipe fuller than the limit, slower than the least velocity (it may not clean itself), faster than the most, or with no fall. {{ui:Size the pipes for these flows}} picks for each pipe the smallest standard size (200 mm or 8 inches and up) that carries its peak within the limit; one {{key:Mod+Z}} undoes it.

:::note
This is the steady peak flow a design sheet works out, checked against a published design sheet to its printed rounding. It is not a model of the sewer over time: no hydrographs, storage, pumps or overflows. See [Not built yet](topic:not-built-yet).
:::

Velocities use Manning's equation with the same n at every depth. Some agencies' part-full charts let n change with depth, which gives a slightly lower velocity in a pipe running 60 to 70 percent full (about 3 percent less).
