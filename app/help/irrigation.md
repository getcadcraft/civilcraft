---
title: Irrigation design
summary: A calculation aid, not a stamped design: heads, laterals, mainline, valves and drip lines on the site; zones found from the pipes; pressure loss by Hazen–Williams, the worst-case head, flow and pressure against the supply, precipitation rates, run times, coverage and a bill of materials.
section: tasks
order: 155
keywords: irrigation, sprinkler, sprinklers, spray, rotor, rotary nozzle, bubbler, drip, dripline, emitter, valve, zone, station, controller, mainline, lateral, point of connection, water supply, pressure, psi, kpa, flow, gpm, friction loss, hazen williams, precipitation rate, run time, coverage, head to head, bill of materials
---

:::warning
This is a calculation aid, not a stamped design: an irrigation designer checks every result before anything is built.
:::

## Set out the system

1. In the **Irrigation** section on the left, choose the **Head**, its **Arc** and where the arc starts, and the pipe sizes for laterals and the mainline.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: click where the water supply joins. Set its **pressure**, the **flow available** and the meter and backflow loss in Properties.
3. {{ui:Irrigation}} › {{ui:Valve}}: click where each zone's valve goes. A valve starts a zone.
4. {{ui:Irrigation}} › {{ui:Head}}: click to place heads; each click places one.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: click from a valve through its heads and press {{key:Enter}}. {{ui:Mainline}}: from the point of connection to each valve.

Pipe ends snap to heads, valves, the supply and other pipe ends, so the network joins. A zone is everything reached from its valve along laterals; the mainline carries one zone at a time.

## Drip

{{ui:Irrigation}} › {{ui:Drip line}}: click along the line, starting where it is fed (a lateral end or a valve). Set the **emitter flow** and **spacing** in Properties; its flow is the emitters along it.

## The check

{{ui:Irrigation}} › {{ui:Check the system…}} lists every zone:

| Column | How it is worked out |
|---|---|
| Flow | The heads' flows (and drip lines') added up |
| At the valve | The worst-case head's working pressure plus the pipe losses to it (Hazen–Williams, the pipe's inside diameter, the elevation change) and the loss through the valve |
| At the supply | The same plus the mainline's loss carrying that zone, and the meter and backflow loss |
| Precipitation | The heads' flow over the area they water at head-to-head spacing |
| Minutes a week | To apply the **Water a week** setting |
| Problems | Velocity over the limit, a head over its pressure range, sprays and rotors on one valve, not enough pressure or flow at the supply, heads on no zone, loops |

Select a valve to see its zone's figures and its worst-case head ringed on the plan. The bill of materials counts heads by kind and arc, pipe by size, valves, drip line and emitters, and the controller's stations. **Save as CSV** keeps both.

Settings in the Irrigation section: **Hazen–Williams C** (150 for new plastic pipe), the **fastest flow** in a pipe (1.5 m/s), the **loss through a valve**, and **water a week**. They are labelled defaults.

## Coverage

{{ui:Irrigation}} › {{ui:Show coverage}} says how much of the area the heads leave dry, how much two or more heads water, and which heads do not reach a neighbour (head-to-head spacing).

## Heads

The heads listed are **generic** kinds written by CadCraft from design precipitation rates (fixed sprays, rotary nozzles, gear rotors, bubblers, micro-sprays, emitters), not any maker's products. **Add heads from a file…** reads your own heads (a JSON list with each head's throw, flow or precipitation rate, and pressure range); they are saved with the project. A maker's published data goes in only with that maker's recorded permission.
