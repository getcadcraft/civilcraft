---
title: Ground and local coordinates
summary: Work in ground (surface) coordinates scaled from the grid by a combined scale factor you type or compute at a point, or in an assumed site grid tied to the system by two control points.
section: tasks
order: 131
keywords: ground coordinates, surface coordinates, grid to ground, combined scale factor, csf, combined factor, grid factor, elevation factor, sea level factor, convergence, mapping angle, scale factor, assumed coordinates, local coordinates, site grid, 5000 5000, control points, localization, calibration, two point, misclosure
---

State plane and UTM coordinates are **grid** coordinates: a map projection stretches or shrinks distances a little (tens of parts per million), and the higher the site, the more a measured ground distance differs from the grid one. Many surveys therefore hand over **ground** coordinates, scaled so plan distances equal distances measured on the ground, or an **assumed** site grid (5000, 5000 at a control point). CivilCraft keeps your numbers as they are and records how they relate to the grid, so latitude and longitude, GIS files and map layers still land in the right place.

Open {{ui:Coordinates}} in the {{ui:GIS}} group, pick (or keep) the system, then choose under **Grid, ground or local coordinates**:

| Choice | Your coordinates are | How they relate to the grid |
|---|---|---|
| {{ui:Grid}} | The system's own (the start) | The same numbers |
| {{ui:Ground}} | Scaled to ground distances | grid = base + combined factor × (ground − base) |
| {{ui:Local}} | An assumed site grid | Moved, turned and scaled onto the grid by two control points |

Whatever you choose is saved with the project and is one undo step; nothing moves.

## Ground coordinates

1. Choose {{ui:Ground}}.
2. Type the **Combined scale factor** from the survey (for example `0.99987`), or compute it:
   1. Under **Compute the factor at a point**, the point starts at the middle of the project. Choose {{ui:Pick a point on the plan}} and click the spot (a click near a survey point takes that point), or type E and N.
   2. The elevation comes from the surface there; type another one if you need to.
   3. Choose {{ui:Compute}}. CivilCraft shows:
      - **Grid scale factor k**: how much the map projection stretches distances there.
      - **Elevation factor**: how much shorter distances are at the ellipsoid than at that height.
      - **Combined factor** = k × elevation factor: grid distance = ground distance × this.
      - **Convergence**: the angle from grid north to true north there (geodetic azimuth = grid azimuth + convergence).
   4. Choose the {{ui:Use}} button under the numbers to put the combined factor in the box.
3. Set the **Base point**, where ground and grid coordinates are the same. It starts at 0, 0: most jurisdictions that publish ground coordinates scale about the origin, so ground coordinates stay recognizably close to grid ones. Some surveys scale about the project's control point instead: use what the survey says.
4. Choose {{ui:Apply}}.

:::warning
The elevation is taken as height above the ellipsoid. CivilCraft has no geoid model, so where the geoid is 30 m (100 ft) below or above the ellipsoid the elevation factor is off by about 5 ppm. When the survey states its combined factor, type that one.
:::

## Local (assumed) coordinates

1. Choose {{ui:Local}}.
2. For **Control point 1**, type the survey point's number (or choose {{ui:Pick}} and click it on the plan). Its local coordinates show beside it.
3. Type its **grid** E and N, or its latitude and longitude in the third box (for example `30.2672, -97.7431`).
4. Do the same for **Control point 2**, as far from the first as you can.
5. CivilCraft shows the **Scale** and the **Rotation** found, and reminds you: **Two points always fit exactly — check a third.**
6. Give a **Check point** the same way. CivilCraft shows how far the fit puts it from the grid coordinates you typed (its misclosure, in project units and parts per million). A large misclosure means a wrong point, a typing error, or coordinates in another unit.
7. Choose {{ui:Apply}}.

A scale far from 1 (beyond 0.5 to 2) is refused: check the points and their units.

## What was checked

- The scale factor and convergence match PROJ (pyproj 3.7.1 with PROJ 9.5.1), the coordinate library most GIS programs use, to 1 part in a billion on over 300 systems with conformal projections (state plane, UTM, transverse Mercator, Lambert conformal conic), and in the browser at a point picked on the plan.
- Ground and local steps convert back and forth to 1 part in a billion; two control points give back the scale and rotation they were made with; a check point 0.05 ft off shows a misclosure of 0.05 ft.
