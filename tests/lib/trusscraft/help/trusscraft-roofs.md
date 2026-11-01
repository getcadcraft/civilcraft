---
title: TrussCraft: hips, valleys, girders and jacks
summary: How the roof's own geometry becomes trusses: step-down trusses or a girder carrying jack and corner trusses at a hip end, valley sets over a main roof, and what is reported when something cannot be made.
section: tasks
order: 3
keywords: hip, valley, girder, jack truss, corner truss, step-down, valley set, flush framing, wing, mouth, minimum height
---

## Where the trusses come from

TrussCraft reads the roof BimCraft drew (or one made from the corners you type or pick in any of the four apps: the same straight-skeleton roof geometry BimCraft uses, at one pitch) and cuts it with the plane each truss stands in. The cut is the truss's top chord, so a common truss is a triangle, a hip end shows a flat top, and a section across a valley has the valley as a joint. Every truss is a pin-jointed frame TrussCraft proves stable before it uses it.

## Hip ends

- **Step-down trusses** (default). Each station in the hip end is a full-span truss with a flat top at the height the hip plane has there (distance from the end wall times the tangent of the pitch), level between the hip lines.
- **Girder carrying jack and corner trusses.** The girder is the flat-topped truss at the setback you give (0 = half the hip). Between it and the end wall, jack trusses run from the wall to the girder across the middle, and corner trusses near the side walls rise to the hip line and then run level. Jacks end flush at the girder's top. Each jack's high-end reaction is applied to the girder as a point load, case by case, so the girder is designed with them.
- Stations lower than **Smallest truss made** (300 mm unless you change it) are **not made**. Problems says how many, and where, so the hip end there is framed by hand on the wall plate.

## Valleys

- **Trusses span across the valley.** A station that crosses a valley is one truss with the valley as a kink in its top chord. Problems notes each one.
- **Valley set over the main roof.** For a wing roof that meets a main roof square to its ridge (a T), the main trusses stop at the wing's mouth, the wing gets its own trusses, and triangular valley trusses stand on the main roof: each spans between the valley lines at its height, with its apex on the wing ridge. You can also type the wing width and both pitches to get the set alone. TrussCraft does **not** make the girder or wall along the wing's mouth and does **not** add the valley trusses' reactions to the main trusses; Problems says both.

## When something cannot be made

A truss that cannot be generated (too low, no usable section, a design that fails) is an error in Problems with its name and reason. It is not in the cut list or the model. The truss designer provides it.
