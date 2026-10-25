---
title: Draw an overhead line
summary: Place supports on the plan, let CivilCraft work out each support's role and the sections between dead-ends, and move supports on the plan or on the line profile.
section: tasks
order: 162
keywords: overhead line, support, pole, span, section, dead-end, angle, suspension, profile, height, crossarm, stay, guy
---

## Draw it

1. Have a surface: the ground under the line comes from it ([Build a surface](topic:build-surface)). A support with no ground under it is listed under **Checks**; type its **Ground level** in Properties instead.
2. Click {{ui:Line}} in the Power lines group and click each support on the plan.
3. Double-click the last one, or press Enter.

The line gets the conductor, support and equipment you used last on this computer (the first time: examples from the library). Change them in Properties.

## The line in Properties

Select the line (click a span) to set its **Conductor**, **Conductors per circuit**, **Circuits**, **Voltage**, the **Clearance rule** it must keep over the ground, and the equipment **On every support** (a crossarm, insulators, fittings). The table lists its **sections** with each one's ruling span, everyday tension, and the load case that governs it.

## Supports

Click a support to select it. In Properties:

- **Support**: its library item. When it is too weak, {{ui:Use …}} puts in the smallest support of the same material in your library that carries the load.
- **Role**: Automatic, Suspension, Angle or Dead-end. Automatic means: the first and last supports are dead-ends; a turn over the rule set's angle makes an angle support; a larger turn a dead-end.
- **Height above ground**: empty takes it from the library item (its length less the depth in the ground).
- **On this support too**: extra equipment, such as a **stay** (guy). A stayed support passes the line's pull to its stay.
- **Existing support**: it is checked like the others but left out of the quantities.

{{ui:Support}} adds a support on the span nearest your click. Drag a support on the plan to move it. Delete removes it (a line keeps at least two).

Sections run between dead-ends: inside a section the conductor runs freely through the suspension clamps, so one tension holds for the whole section.

## The line profile

Click {{ui:Profile}} (or **Profile** in the line's Properties). The panel under the plan shows the ground along the line, each support from the ground to its top, the conductor's lowest phase at the **Load case** you pick, and the clearance the line must keep as a dashed line. A span that fails is red; the number under each span is its lowest clearance.

- **Line** picks the overhead line to show. Selecting another line, or one of its supports, on the plan switches the profile to it.
- Move the pointer over the profile: a guide line follows it, and the label reads the distance along the line, the ground, the conductor and the clearance there (and says when the clearance is under the line's rule).
- {{ui:Measure}} in the profile's bar: click two points to get the distance across, the height difference, the straight distance and the slope between them. A click near the ground, the conductor or a support's top snaps to it. Click {{ui:Measure}} again to stop.
- Obstacles the line crosses stand up from the ground: drawn ones as bars, Landscape plants as their crown, walls as bars (see [Power-line checks](topic:power-line-checks#clearances)). Cable routes and pipes the line crosses are marked below the ground at their top, with their name.

- Drag a support sideways to move it along the line.
- Drag its top up or down to set its height above the ground.
