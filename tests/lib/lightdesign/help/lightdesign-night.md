---
title: Interior lighting design: site lighting and the night view
summary: How to light an outdoor area, draw a night picture lit only by your luminaires, read the false-colour view beside it, and what the picture and numbers leave out.
section: reference
order: 4
keywords: night render, night view, site lighting, exterior lighting, car park, false colour, ies, ldt, colour temperature, lumens, luminaire, renderer, add-on
---

## Site lighting

Tick *Outdoors: site lighting* under *Room*. The outline is now the area to light (a car park, a path, a forecourt), the ceiling height becomes the mounting height of the poles, and the workplane is the ground (0 mm). Pick a pole luminaire or a bollard, or load your own .ies or .ldt file, and place them as a grid or in rows.

The result is the **direct** light of the luminaires on the ground: mean, lowest and highest lux and the uniformity, from the measured light spread of each luminaire. Boxes you list under *Furniture and partitions* (buildings, trees) shade it. There is no light bounced back from the ground or the buildings, and no plan-for-a-target mode outdoors: try a grid and read the numbers. The required lux for a car park or a road come from your rules; none is built in.

## The night view

Under the result, **Draw the night view** draws the area at night, lit only by your luminaires. Each luminaire becomes a lamp with its measured light spread (the .ies or .ldt file is read by CadCraft, and the picture uses the same light spread the calculation uses), its lumens (after the maintenance factor) and its colour temperature (the *Colour temperature* box, 3000 K to start; a warm light is orange, a cold one blue). The exposure is set from the mean lux so the picture is neither black nor white.

Beside it is the **false-colour view**: the same camera, with the workplane or the ground painted in lux, dark blue to red on a log scale, and a legend of round values. The colours come from the same calculation as the table, not from the picture, so a red patch is where the table's highest lux are. Where the picture and the numbers can be compared (a matt floor, one luminaire) they agree to within 5 %; in a room with bounced light, within about 5 % on the floor.

In BimCraft the picture is drawn on this page by the renderer's reference path tracer (slow; Draft is quick). In CadCraft there is no renderer, so you get the false-colour view and a *Lamps for a render* file (the lamps, their light spreads and the night settings as JSON) for a renderer to use. Drawing the luminaires into a BimCraft model also gives each fixture a `CadCraft_Light` property set, so BimCraft's own Render dialog lights the model with them (its Night preset puts the sun down).

## What it leaves out

- The picture is the room or the site from your outline with plain grey surfaces, not your model with its materials, trees and buildings, except the boxes you list.
- The renderer's matt surface also reflects a little specular light, so the picture can be about 10 % brighter than the numbers on a dark floor.
- A light spread is carried at 64 by 32 angles: a beam narrower than about 3 degrees is smoothed. More than 32 different files in one design: the rest are drawn as plain lamps.
- Luminaires are small spheres of light; their body is not drawn, and there is no glare, light pollution or lighting for a road class.
- Nobody has compared a picture with another lighting program.
