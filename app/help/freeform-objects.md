---
title: Freeform objects
summary: Bring a shape made in another app (STL, OBJ or a library item) onto the site; it sits on the ground or is cut into it, and its volume, area and footprint are counted like the rest.
section: tasks
order: 157
keywords: freeform, custom object, sculpture, planter, seat, mesh, stl, obj, library item, terrain aware, follow the ground, cut into the ground, quantities, volume, ifc
---

A one-off feature (a planter, a seat wall, a sculpture, a play mound) can be made in ModelCraft or PartCraft and placed here so it sits in the same model and schedules as everything else.

1. Landscape › More › {{ui:Freeform object…}} and choose an **STL** or **OBJ** file (in the project's units: feet in a feet project, metres in a metres project) or a CadCraft **library item** (`.json`) with a mesh body.
2. Click where it goes.

## Its base

- **Follows the ground**: its lowest point sits on the lowest ground under its footprint, so nothing floats. Properties estimate how much of it is below the ground.
- **Cuts the ground**: its base is set at an elevation and the ground inside its footprint is graded to it with daylight slopes, counted in Earthwork like a platform.

Turn it with **Turned**, drag it on the plan to move it.

## Counted

Properties give its **volume** (for a closed solid), **surface area**, **footprint** and **height**, measured from the mesh. The IFC export writes it with the **IFC class** you choose and those quantities.

:::note
The footprint is the outline's convex hull: a concave shape (an L-shaped planter) is graded as if it were filled in.
:::
