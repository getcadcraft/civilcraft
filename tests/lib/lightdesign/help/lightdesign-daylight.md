---
title: Interior lighting design: windows, furniture and emergency lighting
summary: How to add windows for a daylight factor, boxes that block light, and an escape route for an emergency lighting check, and what each of them leaves out.
section: reference
order: 3
keywords: daylight, daylight factor, window, glazing, overcast sky, furniture, partition, obstruction, emergency lighting, escape route, en 1838, lux, add-on
---

## Windows and daylight

Under *Windows and daylight* type one window per line: `wall, from, width, sill, head, transmittance` in millimetres. The wall is counted from the outline: 0 is the wall from corner 0 to corner 1, 1 the next, and so on. *From* is the distance along that wall to the window's left edge, *sill* and *head* are the heights of its bottom and top. The transmittance (how much light the glass lets through, 0.7 if you leave it out) is the real figure from the glass maker. In BimCraft, picking a room fills the list from the model's windows; the model does not give a window's height, so **1.2 m is assumed**: correct it.

The result is the **daylight factor** on the workplane: the light inside as a percentage of the light outside, under the standard overcast sky (the CIE sky, brightest at the zenith). It gives the mean, the lowest and highest, the uniformity, the glass area and, for the light outside you choose, the lux. Type a daylight factor and the panel says how much of the room reaches it. No required value is built in: use the one your rules ask for.

What it leaves out: no sun and no clear sky, no light reflected from the ground, no buildings, trees or overhangs outside, the same share of light passing the glass at every angle, no frames, bars or curtains. The wall behind the glass reflects nothing (the opening lets light out as well). Daylight is worked out alone; it is not added to the electric light.

How it was checked: with the sky law worked by hand, a window that sees the whole sky overhead gives the full outside illuminance, an endless vertical window gives exactly half of it on a horizontal plane, and a vertical plane facing the sky gets 0.396 of it; the light that enters a room through a window equals the light the sky puts on that window, to within 0.2 % on the test room. Nobody has compared a room with another program's result.

## Furniture and partitions

List boxes that block the direct light, one per line: `x0, y0, x1, y1, z0, z1` in millimetres (a partition is a thin tall box). A luminaire reaches a point only if the straight line between them crosses no box. Light that has bounced off the walls, floor or ceiling is **not** blocked, so behind a big box the result is a little too bright, never too dark. Points inside a box (a column) are left out of the figures.

## Emergency lighting

Tick *Check emergency lighting*, say which luminaires are on the emergency circuit (every n-th one), what share of their rated light they give in an emergency, and draw the escape route as points. You get the lowest and highest lux on the route's centre line and the lowest lux over the open area, and ticks against three limits.

The limits (1 lx on the route, highest to lowest at most 40 to 1, 0.5 lx over the open area) are **typical values in the style of EN 1838, typed from memory and not checked against the edition you work to; they wait for a lighting engineer to confirm them.** Type your own. Only the direct light on the floor is counted. Signs, how long the batteries last and the switch-over time are not checked.

## Not built yet

- Isolines and a 3D picture of the result.
- Choosing luminaires from a maker's catalogue.
- Exterior and road lighting.
- Daylight from the sun, from clear skies, or with buildings outside; glare from windows.
- Emergency lighting signs, duration and light bounced off the room.

This is a design aid, not a certificate: the person responsible for the lighting design checks the result.
