---
title: Paving, walls and steps
summary: Paving with falls to a drain or a cross-fall, a pattern and its build-up; paths that follow the ground; retaining and freestanding walls with stepped footings; kerbs; ramps and steps checked against their limits; IFC out.
section: tasks
order: 154
keywords: hardscape, paving, pavers, patio, terrace, falls, drain, crossfall, herringbone, stretcher bond, path, walkway, retaining wall, garden wall, footing, coping, kerb, curb, edging, ramp, accessibility, steps, stairs, risers, treads, landing
---

Hardscape is worked out again from the ground every time, so it follows the terrain and regenerates when the ground or its line moves. Drag its corners on the plan like any line. Open it from {{ui:Hardscape}} in the Landscape group.

## Paving

Click the corners and press {{key:Enter}}. In Properties:

- **Level**: empty = the ground's mean under it.
- **Falls**: level, a **cross-fall** (a % towards a direction) or **to a drain**: CivilCraft asks you to click where the drain goes, then every corner rises from the drain at the fall. Arrows on the plan show the falls.
- **Pattern** (grid, stretcher bond, herringbone) with the unit size, joint and angle; **Edging** width. On a sheet, joints closer than a millimetre are left out.
- The paving is part of the proposed surface. Its layers (pavers, bedding, base) go into the IFC and the quantities.

## Paths

Click along the path and press {{key:Enter}}. It follows the ground, with its **Cross-fall** to its right-hand side. A path steeper than **Steepest allowed** is marked `!` on the plan where it is, and Properties says how steep it gets.

## Walls

Click along the wall and press {{key:Enter}}. A wall is **retaining** or **freestanding**. With no **Top**, it stands its **Height** above the ground all along; type a top to hold it level. Its **footing** sits a set depth below the ground and steps down in whole steps, so it stays level between them. Properties give its length, heights, face area and footing steps; the plan labels the top and bottom of wall (TW / BW) at each end.

:::warning
A retaining wall higher than 1.2 m (4 ft) is flagged: an engineer designs it.
:::

## Kerbs

Click along the kerb and press {{key:Enter}}; set its width and upstand.

## Ramps

Click from the bottom to the top and press {{key:Enter}}. The levels come from the ground at each end unless you type them. A ramp gets a landing every rise of 750 mm (2.5 ft) and is checked against **Steepest allowed** (1:12 to start) and a minimum width; Properties say how long it would need to be.

## Steps

Click the bottom step's front edge, then where the steps reach the top, and press {{key:Enter}}. The number of risers comes from the height and the **Largest riser**; the going from the comfort rule 2R + G ≈ 630 mm, never under the **Smallest going**; a landing every **Risers per flight at most**. Properties say whether they fit between the two points or how much longer they need.

:::note
The limits for ramps and steps are labelled defaults. Set the ones your building code requires.
:::

## Out of CivilCraft

- More › {{ui:Export landscape IFC}}: paving and paths as `IfcPavement`, walls as `IfcWall` (retaining walls as RETAININGWALL) with their layers, kerbs as `IfcKerb`, ramps as `IfcRamp`, steps as `IfcStair` with their risers and treads.
- The plant schedule's **Send to TakeoffCraft** carries the paving areas and layer volumes, wall face areas and lengths, kerb lengths and step counts.
- The details sheet draws each wall's section, each paving's build-up and each flight of steps. See [Landscape sheets](topic:landscape-sheets).
