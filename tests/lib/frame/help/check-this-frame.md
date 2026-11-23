---
title: Check this frame
summary: Take the steel members of a weldment (a skid, a stand, a frame of tubes and sections), put the equipment on its feet and the supports on the floor, and see how much of each member and each weld is used under AISC 360-16 or EN 1993. An aid until an engineer has reviewed it.
section: tasks
order: 60
keywords: frame, weldment, skid, pump skid, structural member, weld, welds, check, AISC 360, EN 1993, utilisation, utilization, support, equipment, load, hollow section, HSS, RHS, CHS, engineer
---

{{ui:Check this frame}} takes the straight steel members of a weldment, builds a frame from them, solves it under the weight of the steel and of the equipment you put on it, and tests every member and every weld where members meet. One run, one table.

:::warning
It is an **aid until an engineer has reviewed it**. It is not a stamp, and a pass is not a design. It uses the members' centre lines as drawn, treats every joint as welded all round the section, takes the leg of the fillet from the wall of the section (up to 8 mm) unless you set it, and does not check bolts, plates, base plates, anchors, bearing, block shear, fatigue or lifting.
:::

## Run it

1. Draw the members with {{ui:Structural member}} (the sections come from the section table).
2. Open {{ui:Check this frame}}. Say where the frame stands (a **support** at each foot: pinned, fixed or roller) and what sits on it (**equipment**: mass, centre of gravity, the points where it is bolted down, and an optional horizontal push).
3. Pick the code: **ASCE 7 + AISC 360-16** or **EN 1990 + EN 1993**. Set the steel grade and, for AISC, the weld metal strength (482.6 MPa is E70).
4. Press {{ui:Check}}.

A member end that lands on the middle of another member splits it there, as does a foot or a bolt-down point on a member's line. A weight is shared over the bolt-down points as a rigid body; a centre of gravity outside the feet, or a lifting force at a foot, is said, never hidden.

## What you get

- The most used item and whether anything fails. Items the check cannot judge (a section that is not in the table, a steel with no factor in the code) are counted and named, never counted as passing.
- One row per member and per weld group: how much is used, the governing check and clause, and the load combination that governed.
- The same tables in the report.

## What is checked

Hollow sections (RHS, SHS, CHS, pipe) and I-sections for tension, compression, bending, shear and their interaction; fillet and full-penetration welds by the elastic vector method. Compact walls in bending only for hollow sections; slender walls are said as not checked. Some constants were written from the standards and not yet compared with a printed copy; the report lists each source.

See [Check welds](topic:weld-checks), [Check steel members](topic:design-checks) and [Not built yet](topic:not-built-yet).
