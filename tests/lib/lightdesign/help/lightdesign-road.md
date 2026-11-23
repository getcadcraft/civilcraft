---
title: Interior lighting design: road and street lighting
summary: How to light a straight road or street, what the illuminance, luminance, uniformity, threshold increment and edge illumination ratio mean here, where each method and class value comes from, and what is left out.
section: reference
order: 5
keywords: road lighting, street lighting, carriageway, footway, luminance, r-table, reflection table, threshold increment, TI, veiling luminance, uniformity, Uo, Ul, edge illumination ratio, surround ratio, lighting class, M classes, C classes, P classes, RP-8, add-on
---

## Start

Tick *Road lighting* at the top of the panel. The room is replaced by a road.

1. **The road.** In CivilCraft pick a road from the project: its corridor assembly becomes the cross-section (lanes next to the centre line make the carriageway, a walk is a footway, shoulders, gutters, curbs and planting strips are verges). Anywhere else, or to change it, type the cross-section, one strip a line from the left edge: `footway, 2`, `carriageway, 7, 2` (width in metres and the number of lanes; add `one-way` for a one-way carriageway), `verge, 1.5`, `median, 2`, `cycleway, 2`.
2. **The luminaire.** A pole to try the add-on, or your own .ies or .ldt file, or one from your catalogues. The file is read with C 90° pointing out over the road and C 0° along it; if your file is the other way round, *Turn the file* by 90° or 180°.
3. **Luminaires.** One side (left or right), both sides opposite, both sides staggered (the second row half a spacing along), or twin arms on the centre (on the middle of the median). Spacing, mounting height, overhang (how far the luminaire reaches over the carriageway from its edge; negative means set back behind it) and tilt (towards the road).
4. **The grid.** Points along the field and across each lane or strip. Type the grid your standard asks for: the defaults (10 along, 3 across a lane) are ours.
5. **The road surface.** To get luminance, paste a reflection table (an r-table, values r × 10 000) from your standard's table or a measured surface: first line the tan γ values, then one line a β angle with its values. Without one you get illuminance only.
6. **Lighting class.** Type the values from your standard's class table, or start from one of the cited tables below and check them. Then *Calculate*.

## What you get

The calculation field is the road between two neighbouring luminaires of a row. For each carriageway:

- **Illuminance** (lux, maintained): average, lowest and highest on the carriageway; Uo = lowest / average; Eavg / Emin.
- **Luminance** (cd/m², maintained, only with a reflection table): an observer stands in the middle of each lane, 60 m before the field, eyes 1.5 m up, looking along the lane. Average L, overall uniformity Uo = lowest / average and longitudinal uniformity Ul = lowest / highest along the line of points in the observer's lane. The lowest value over the observers is shown, as the conventions say.
- **Threshold increment** TI (%) = 65 Lv / L^0.8, from initial values (no maintenance factor). Lv is the veiling luminance, K Σ E / θ² (K = 10, or from the observer's age), at an eye 1.5 m up looking 1° down along each lane, moved in steps along the field; luminaires up to 500 m ahead count, those above a line 20° up (the car's roof) do not. The highest Lv is used. The veiling luminance ratio Lv / L is shown too.
- **Edge illumination ratio** (the surround ratio): the average illuminance on a strip one lane wide just outside each edge of the carriageway over the one just inside.
- **Footways and cycleways**: average, lowest and highest illuminance and Uo on each.

Each criterion you entered is checked; one not met becomes a warning in the app's Problems panel (where the app has it), and one that needs the reflection table you did not give becomes a note. The plan shows the field, the illuminance in colour and the luminaires. *Save as CSV* writes every point.

## Where the methods and values come from

The road lighting standards (EN 13201-2 and -3, ANSI/IES RP-8, the CIE reflection tables) are not read here. The methods and values come from documents published openly, cited in the code and in `docs/refs/road-lighting.md`:

- K. Sørensen, *Road lighting*, textbook for the Nordic road administrations' NMF, 2013: the illuminance and luminance equations (pp. 70-72), the observer, field and reflection-table conventions (pp. 73-79, 88-92), the veiling luminance, its constant and the threshold increment (pp. 94-95), the edge illumination ratio (p. 103), and the EN 13201-2 M, C and P class tables as it reproduces them (Tables 2-4, pp. 16-17).
- S. Fotios, P. Boyce and C. Ellis, *The effect of pavement material on road lighting performance*, for the UK Department for Transport, 2005 (pp. 9-12): the reduced luminance coefficient and the r-table layout.
- FHWA-HRT-14-051, *Design criteria for adaptive roadway lighting*, US FHWA, 2014, Table 20: the ANSI/IES RP-8-00 illuminance criteria as reproduced there.

A class picked from these tables fills the boxes; your standard's edition or your country may differ (EN 13201-2 itself lets a country change Ul, TI and the edge ratio). **Nothing here says a road meets a standard: check against your class table.**

## What it leaves out

- No reflection table is shipped: luminance, Ul, TI and the veiling luminance ratio need the one you paste.
- The grid rule of EN 13201-3 is not built in: the grid is what you type.
- A straight, level road only: no curves, junctions, roundabouts, slopes, conflict areas of other shapes, or wet roads (wet Uo).
- No semi-cylindrical, hemispherical or vertical illuminance, no HS, SC or EV classes, no glare classes for luminaires, no energy indicators (EN 13201-5).
- Direct light only. The eye illuminance for glare is taken on a plane facing along the line of sight (our reading of the source).
- In CivilCraft the road is read from its assembly; the luminaires are not drawn into the project. Nobody has compared a result with another road lighting program yet.
