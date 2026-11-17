---
title: WaterCraft: demands, fire flow, outages and water age
summary: With the WaterCraft add-on, turn customers into demands on your water mains, check the flow available at every hydrant, see which main outage hurts most, and follow water age and chlorine through a day.
section: tasks
order: 99
keywords: watercraft, water distribution, demands, customers, peaking factor, demand pattern, fire flow, hydrant, residual pressure, criticality, outage, valved section, water age, chlorine, residual, source trace, dead end, csv, add-on
---

WaterCraft is an add-on that works on the water network you already drew with the Water mains tools. It adds a tab to the right-hand panel with four sections.

:::warning
A calculation aid only. It was checked against hand answers on made-up networks, not on a real utility model. A water engineer must check every result. There are no booster stations, no second-order decay and no scenarios yet.
:::

## What you'll do

- Put customers on the network as demands.
- Find the hydrants that fall short of the flow you need.
- Find the mains whose loss matters most.
- Find old water and low chlorine.

## Steps

1. Open {{ui:Settings}} › {{ui:Add-ons}} and switch on {{ui:WaterCraft (water distribution)}}. A {{ui:WaterCraft}} tab appears in the right-hand panel.
2. Draw a reservoir, junctions and pipes with the Water mains tools first (see [Water mains](topic:water-mains)). Without a network the tab tells you to do that.
3. Under {{ui:Demands}}, paste one customer per line: id, x, y, kind, amount. Choose the {{ui:Peaking factor}} and the {{ui:Hourly pattern}} (residential day, commercial day, flat, or keep the pattern as it is). Press {{ui:Check}} to see where each customer lands (the nearest junction), then {{ui:Put into the network}}. Undo takes the demands back.
4. Under {{ui:Fire flow}}, set the needed flow and the residual pressure, choose whether the residual is held {{ui:At the hydrant only}} or {{ui:Everywhere in the system (stricter)}}, and press {{ui:Run}}. Each hydrant is listed worst first, as meets or short.
5. Under {{ui:Which main matters most}}, choose {{ui:one pipe at a time}} or {{ui:one valved section at a time}} and press {{ui:Run}}. Each outage shows the demand cut off, the junctions cut off, the junctions newly under the minimum pressure and the lowest pressure left.
6. Under {{ui:Water age and chlorine}}, choose what to follow (water age, chlorine or a source trace), set the hours to run and the limits you want, and press {{ui:Run}}. Junctions outside your limits are listed.
7. Press {{ui:Save as CSV}} under any table to keep it.

## Notes

- The needed fire flow and the use per home or per acre are starting values, not standards. Use your utility's own figures.
- A pipe cut partly by a valve is closed whole, so the outage shown is slightly worse than a real one.
- Run the water-quality section long enough for the daily pattern to repeat before you read the last day.
- {{ui:Stop}} ends a long run early; the list then shows only what was done.
- Your network stays in this project and on this computer. Nothing is sent anywhere.
