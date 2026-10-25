---
title: Underground cables
summary: Cable routes in trenches between supports and equipment, cover and crossings, joints by drum length, and the trench and cable quantities.
section: tasks
order: 165
keywords: underground cable, cable route, trench, duct, cover, crossing, pipe crossing, joint, drum, cabinet, transformer, source, voltage drop
---

## Draw a cable route

1. Place the equipment first if the cable ends at a cabinet, a transformer or a joint: {{ui:Equipment}}, then click.
2. Click {{ui:Cable}} and click the route; start and end on a support or on equipment to connect to it. Enter finishes.

In Properties, choose the **Cable**, the **Trench type**, how many **cables side by side**, and the **slack** (%). The route shows its length, where it starts and ends, and the current it carries.

## What is checked

- **Cover**: the cable's top below the ground along the route, against the trench type's cover (or the rule set's least cover).
- **Crossings**: where the route crosses a CivilCraft pipe or another cable, the gap between them against a clearance rule: the route's own **Crossing clearance** (in its Properties) when you pick one, else the rule set's **Underground crossings** rule (the example sets use *Underground crossing*, 0.3 m), else the trench type's gap to other services. Two cables crossing keep the larger of their two. An overhead line crossed is listed for information, and the cable shows in that line's profile.
- **Joints**: one every drum length of the cable (with slack), when the cable item gives a drum length.

## Equipment

Equipment has a library item, a **load** (kW) with its **power factor**, and can be **a source**: the network is fed from there. A source's voltage comes from its library item, or else from the line or cable it feeds.

## Quantities

{{ui:More}} › {{ui:Quantities…}} counts the cable (route length × (1 + slack) × cables side by side + the rise at each end), the trench by type, excavation, bedding and backfill volumes, ducts and joints, with the overhead lines' conductor, supports and equipment.
