---
title: Interior lighting design: getting started
summary: What the Interior lighting design add-on works out, how to switch it on, and how to go from a room outline and a photometry file to lux, uniformity and glare in a few steps.
section: start
order: 1
keywords: lighting, illuminance, lux, 3d, catalogue, catalog, dialux, relux, photometry, ies, ldt, eulumdat, uniformity, ugr, glare, luminaire, workplane, light loss factor, en 12464, add-on
---

## What it is

Interior lighting design lights one room at a time. You give it the room (an outline, a ceiling height and how reflective the surfaces are), the luminaires (a maker's `.ies` or `.ldt` file, or one of the built-in generic types) and where they go. It returns the illuminance on the workplane (the table-top height), how even it is, an estimate of glare (UGR), the light on walls and ceiling, and the watts per square metre.

It works in CadCraft, BimCraft and ModelCraft (and outdoors in CivilCraft). Switch it on in Settings, General, Add-ons. It is off until you do.

For a road or street, tick *Road lighting* at the top of the panel: see *Interior lighting design: road and street lighting*.

## Steps

1. **Room.** In CadCraft, select a closed shape (a rectangle or polyline) and press Read again; choose it from Rooms found. In BimCraft the list holds the rooms the walls enclose. In ModelCraft, select one floor face and press Read again: the room is that face. Or type the outline in millimetres. Set the ceiling height, the workplane height (0.8 m for a desk) and the reflectance of ceiling, walls and floor (a light office is about 0.7, 0.5, 0.2).
2. **Luminaire.** Load the maker's file, or pick a generic type to try it. A generic type is a typical figure, not a maker's. To choose among many, build a catalogue (below).
3. **Layout.** *Plan for a target* finds the fewest luminaires, in an even grid, that reach the mean lux you type. *Even grid* and *Rows* place them as you say.
4. **Requirements.** Pick a kind of room to fill in typical targets, or type your own.
5. **Calculate.** You get the numbers, ticks for the requirements met, and a colour map. *Draw in the drawing* puts the luminaires and the lux values on layers LD-LUMINAIRE and LD-LUX (CadCraft). In BimCraft it places the luminaires in the room's level as light fixtures (one undo step; they appear in the device schedule) and writes the calculated lux as numbers in that level's plan view. In ModelCraft it puts the luminaires and the 3D lux surface in the model as coloured bodies (one undo step), so they show in the 3D view and export with the model; they are pictures of the result, not lights ModelCraft knows. *Report* gives a page you can print to PDF; *CSV* gives every grid point.

## What the numbers are

- Lux are **maintained**: the light loss factor (0.8 by default; set it from the maintenance plan) is applied to everything.
- The light from the luminaires is added to the light that bounces off the floor, walls and ceiling, which are treated as matt surfaces. Two independent calculations agree: a photon-tracing check of a 6 × 4 m room matches the panel to within 1.4 %.
- Walls, ceiling and floor do not block light from each other, so an L-shaped or otherwise non-box room comes out a little too bright in its bays. Furniture, columns and partitions you list do block the direct light, windows give a daylight factor and the escape route gets an emergency check: see *Windows, furniture and emergency lighting*.
- **UGR** is an estimate from the CIE formula, from the luminaires' own candela and luminous opening. Compare it with the maker's UGR table before you rely on it.
- The kinds of room and their targets are **typical values typed from memory of EN 12464-1**, not checked against the edition you work to. Confirm them, or type your own.
- **Lines of equal lux (isolines)** are drawn over the map (tick box under the result; also in the report). They are cut from the same grid as the table, so a line labelled 200 lies where the calculation gives 200 lx, to the grid's spacing. The lines stop at furniture and columns you listed.
- **The 3D lux surface** under the map shows the same grid as a landscape: height and colour are the lux at each point. Drag it to turn it, or type the turn and tilt.

## Your luminaire catalogues

Makers publish a photometry file for each product (EULUMDAT `.ldt` or IES `.ies`), usually on the product's page or in their download area. Save the ones you use in a folder, then under *Your luminaire catalogues* press *Add a folder* (or *Add files*). Each file becomes a row: its name, the maker it names, lumens and watts as the file gives them, lumens per watt, and the beam angle worked out from the candela table (where the light falls to half its peak, the mean of the C0 and C90 planes). Search by name or maker, sort by lumens, watts, beam or efficacy, set a lowest lumens or highest watts, and press *Use* on the one you want. Name a catalogue to start another one (for example one per maker or per project).

The files stay on this device, in the add-on's own storage, as you added them: nothing is uploaded. A catalogue too big for that storage (about 1.5 MB of files in all) is kept until the page closes, and the panel says so. CadCraft makes no catalogue of its own and copies no maker's data.

This is a design aid, not a certificate: the person responsible for the lighting design checks the result.
