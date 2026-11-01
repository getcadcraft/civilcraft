---
title: Planted areas: lawns, beds, meadows, groundcover
summary: Planted areas as objects with a build-up (topsoil, mulch, membrane, edging), a plant mix and an optional finished level; they clip themselves around paving, walls and steps, and give net area, volumes, edging length and plant counts.
section: tasks
order: 161
keywords: planted area, lawn, turf, bed, border, meadow, groundcover, topsoil, mulch, membrane, weed fabric, edging, finished level, quantities, net area, clip
---

{{ui:Areas}} in the Landscape group draws a **lawn**, **planted bed**, **meadow** or **groundcover**: click its corners and press {{key:Enter}}. A bed or groundcover starts filled with the plant picked in the Plants section; a lawn has no plants.

## What it holds

- **Build-up**: topsoil depth, mulch depth, a weed membrane, and an edging (steel, timber, brick, concrete, plastic or none). Typical depths are filled in; set your own.
- **Mix**: species (with cultivar and size) and shares, filled like a bed at the spacing or density.
- **Finished level**: leave it empty and the area follows the ground; give it a level and the area becomes a ground modifier (see [Ground modifiers and levels](topic:ground-modifiers)).
- **Clip around paving, walls and steps** (on by default): where paving, a path, a wall, a kerb, a ramp or steps overlap the area, that part is left out. No plant is placed under them or within half a spacing of their edge.

## Quantities

Properties shows the **net area** (after clipping, measured exactly), the perimeter, the **edging length** (only along the area's own edge, not where hardscape cuts it), topsoil and mulch volumes, membrane area and plant counts per mix row. The plant schedule counts the area's plants; the quantities file for TakeoffCraft gets the area, topsoil, mulch, membrane and edging; the landscape IFC writes an IfcGeographicElement with a quantity set.
