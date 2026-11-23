---
title: WaterCraft: scenarios, shortage and leakage, rules, valves and pump energy
summary: Compare "what if" versions of the network side by side, see what a network delivers when the pressure falls, and run a day with control rules, flow-control and pressure-sustaining valves and pump energy.
section: tasks
order: 100
keywords: watercraft, scenarios, compare, what if, pressure dependent demand, shortage, leakage, emitter, control rules, valve, flow control valve, pressure sustaining valve, booster, pump energy, kwh, tariff, tank level
---

These sections of the WaterCraft tab work on the Water mains already in the project. Add the add-on first.

:::warning
A calculation aid only. Each result below was checked against published results of EPA's Example Network 1 (and variants of it) and against hand answers, but not against a real utility's model. A water engineer must check every result.
:::

## Scenarios side by side

1. Open {{ui:Scenarios side by side}}.
2. Write one scenario per heading: a line `scenario Peak day`, then its changes, one a line: `close P12`, `open P12`, `demand x1.5`, `demand J5 120`, `diameter P3 16`, `c P4 80`, `pump P1 off`, `tank T1 level 130`, `reservoir R1 head 820`, `fire J9 1000`.
3. Press {{ui:Run}}. The first scenario is the base. Each later one shows its measure and, beside it, the change from the base: the lowest and highest pressure, junctions under the minimum or over the maximum, the fastest pipe, the demand served and cut off, and what is taken from the sources.
4. Tick {{ui:Let the pressure decide what is delivered (shortage run)}} to run every scenario the shortage way (below).
5. Press {{ui:Save as CSV}} for the measures, or {{ui:Pressures as CSV}} for every junction.

A line that is not understood is named by its number; a pipe or junction that is not in the network is listed, never skipped silently. The scenario text lives in the panel while the page is open: copy it out to keep it.

## Shortage and leakage

An ordinary run delivers every demand whatever the pressure. Under {{ui:Shortage and leakage}} a junction delivers only what its pressure allows: nothing at or under the lowest pressure you give, everything at or over the full pressure, and a curve between them with the exponent you set (0.5 is usual).

1. Set the two pressures and the exponent, and a demand multiplier if you want a peak.
2. For leaking joints, write one a line: junction, coefficient. The leak is the coefficient times the pressure to the power 0.5.
3. For a leak along the pipes, give the flow per 1,000 length units at one pressure unit and the exponent (about 0.5 for holes, up to 1.5 for cracks that open as the pressure rises).
4. Press {{ui:Run}}. The line shows what was wanted, delivered and short, and what the leaks take; the table lists the junctions that get less than they ask.

## Valves, rules and pump energy

1. Under {{ui:Valves, rules and pump energy}}, write control rules, one a line, in the usual words: `LINK P1 CLOSED IF NODE T1 ABOVE 140` (a tank level), `LINK P1 OPEN IF NODE J9 BELOW 30` (a junction pressure), `LINK P1 OPEN AT TIME 6` (hours into the run) or `LINK P1 CLOSED AT CLOCKTIME 22`. A tank-level rule is met exactly: the step is cut to the moment the level crosses the value. Pressure rules are checked at step boundaries.
2. Write valves, one a line: id, pipe, `FCV` or `PSV`, setting. A flow-control valve holds the flow at the setting when the open valve would pass more. A pressure-sustaining valve holds the pressure at its upstream junction: open while that pressure is above the setting, throttled when it would fall under, closed when even no flow does not bring it back. A booster is an ordinary pump on a design point, switched by a rule.
3. Set the hours, the step, the pump efficiency, the price per kWh and, if you have one, the price by hour of day. If the demand pattern changes more slowly than the step, give the pattern step too.
4. Press {{ui:Run}}. The tables show each rule that fired and when, each pump's energy, average and peak kW, time on and cost, and the tank levels through the day.

## What it does not do yet

- A throttled valve between two tanks, or into a tank from a junction, is not exact (the tank's inflow is counted, but two throttled valves in series are settled one after the other).
- Rules and valves are not saved in the project file yet: copy the text out.
- Pump efficiency is one number a pump, not a curve.
