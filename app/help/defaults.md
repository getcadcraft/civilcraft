---
title: Starting values and placeholders
summary: Every value CivilCraft starts with, for new projects, display, alignments, pads, corridors, pipe networks, volumes and plots, and which ones are placeholders to replace.
section: reference
order: 70
keywords: defaults, settings, starting values, placeholders, design criteria, standards, rules, assumptions
---

CivilCraft has no settings dialog or template. These are the values things start with. Values marked **placeholder** are not taken from any standard: replace them with your project's criteria before you rely on a check or a quantity.

## New project

| Setting | Value |
|---|---|
| Name | Untitled site (the first point file's name replaces it) |
| Units | US feet |
| Surface name | Existing ground |
| Point groups | Every group starts as {{ui:Points}} |
| Longest outside edge | 0 (keep every triangle) |
| Undo steps kept | 200 |

## Display

| Setting | Value |
|---|---|
| Surface | {{ui:Existing ground}} |
| Contours every | 1 (ft or m) |
| Major every | 5th contour |
| Bands | 8 |
| On | Contours, contour labels, points, breaklines, surface edge, pipes |
| Off | Triangles, elevation bands, slope arrows, point labels |

## Alignments and profiles

| Setting | Value |
|---|---|
| Name | Alignment 1, Alignment 2 … |
| Start station | 0+00 |
| Curve radius at each interior PI | 100 ft or 30 m, smaller if that does not fit in half of each tangent |
| Design profile | None until you start one; {{ui:Start from the ground}} puts a PVI on the ground at each end |
| Vertical curve length | 0 (no curve) until you type one |

## Pads

| Setting | Value |
|---|---|
| Name | Pad 1, Pad 2 … |
| Elevation | The ground at the pad's middle, rounded to 0.1 (0 if the middle is off the surface) |
| Cut slope | 2 : 1 (placeholder) |
| Fill slope | 3 : 1 (placeholder) |

## Corridor assembly (placeholders)

| Setting | US feet | Metres |
|---|---|---|
| Lane width | 12 ft | 3.6 m |
| Lane slope | 2% | 2% |
| Shoulder width | 4 ft | 1.2 m |
| Shoulder slope | 4% | 4% |
| Cut slope | 2 : 1 | 2 : 1 |
| Fill slope | 3 : 1 | 3 : 1 |
| Section every | 10 ft | 5 m |

## Pipe network

| Setting | US feet | Metres |
|---|---|---|
| Name and type | Storm, storm | Storm, storm |
| Least slope (placeholder) | 0.50% | 0.50% |
| Least cover (placeholder) | 2 ft | 0.6 m |
| Drop in structures (placeholder) | 0.10 ft | 0.03 m |
| New structure diameter | 48 in | 1200 mm |
| New pipe diameter | 12 in | 300 mm |
| Sump depth | 0 | 0 |
| Rim | From the surface | From the surface |

A pipe network opened from LandXML uses these rules too, because LandXML does not carry them.

## Volumes

| Setting | Value |
|---|---|
| Method | Grid, sampled at cell centers inside the daylight lines |
| Cell size | Chosen so the graded area's bounding rectangle holds about 250,000 cells (1, 2 or 5 times a power of ten) |
| Swell and shrink | None |

## Plot

| Setting | Value |
|---|---|
| Area | {{ui:Everything}} |
| Paper | Tabloid 11 × 17 in (feet projects), ISO A3 (metre projects); always landscape |
| Scale | The largest listed scale that fits |
| Ink | {{ui:Layer colors}} |

DXF labels are sized for the scale at which everything fits on Tabloid (feet) or A3 (metres).
