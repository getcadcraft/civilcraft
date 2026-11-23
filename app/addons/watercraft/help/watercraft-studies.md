---
title: WaterCraft: parcels, emergencies, calibration and pipe sizes
summary: Turn the parcels you drew into demands, run a main break, a fire or a power cut and see how long the tank lasts, fit the pipes' roughness to field readings, and size or rehabilitate pipes for the money.
section: tasks
order: 101
keywords: watercraft, parcels, land use, demand, emergency, main break, fire, power cut, tank, calibration, field readings, roughness, hazen williams, sizing, pipe diameter, rehabilitation, budget
---

Add the add-on first.

:::warning
A calculation aid only. These were checked against published results of EPA's Example Network 1 and variants of it, against closed forms (the diameter a pipe needs, a tank emptying at a steady demand) and by hand, not against a real utility's model. A water engineer must check every result. Prices are yours: the add-on ships no price list.
:::

## Demands from parcels

1. Draw or import parcels in CivilCraft first.
2. Open {{ui:Demands from parcels}}. Say which parcel is which use, one a line as `id = use` (uses are the kinds in the demand table: residential, apartment, commercial, industrial, school, park), or pick one use for the rest. A parcel with no use, or no shape, is left out and named.
3. For homes, give the area of one home (project area units); with 0, each parcel is one home.
4. Press {{ui:Check}} to see the demand each junction gets (every parcel goes to the nearest junction), then {{ui:Put into the network}}. Undo takes it back.

The demands per home and per acre are starting values: use your utility's own.

## Emergencies

Open {{ui:Emergencies}}, choose the event and press {{ui:Run}}:

- {{ui:Main break}}: name the pipe. It leaves service, with the pipes around it that the valves drawn on the network isolate.
- {{ui:Fire at a hydrant}}: name the junction, the flow and the hours it runs.
- {{ui:Power cut}}: name the pumps (empty = all) and the hours.

The result is the demand cut off, the junctions under the minimum pressure and for how long, the lowest pressure, and for each tank its level at the start and the end and when it runs empty.

## Calibrate to field readings

1. Write the readings, one a line: `pressure, J5, 62.4` or `flow, P3, 410`, and, if the reading was taken at a busier or quieter time, the demand multiplier as a last value.
2. Write the groups of pipes whose roughness should move together, one a line: `mains: P1 P2 P3`. None means all pipes together. Give more readings than groups.
3. Press {{ui:Run}}. The table shows each group's roughness C before and after and every reading before and after. A group the readings hardly feel is named, because its answer means little.
4. {{ui:Apply the new roughness}} writes it into the water mains; Undo puts it back.

## Pipe sizes and rehabilitation

1. Under {{ui:Pipe sizes and rehabilitation}}, list the sizes you may buy and a price per length unit for each.
2. Set the minimum pressure and the highest velocity.
3. {{ui:Size the pipes}} makes the pipes that help most for the money larger until every junction meets the pressure and no pipe is too fast, then takes back any size that was not needed. No pipe is made smaller. If the sizes you listed cannot meet the limits, it says so.
4. For old pipes, name the options (name, new C, price) and a budget, then {{ui:Choose pipes to rehabilitate}}. The budget is a ceiling, never exceeded; what it cannot reach is reported.
