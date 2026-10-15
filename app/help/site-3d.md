---
title: View the site in 3D
summary: Open the 3D view, orbit, pan and zoom, set the vertical exaggeration and colouring, choose what shows, and click alignments, pads, feature lines, breaklines, pipes, structures and points to select them.
section: tasks
order: 125
keywords: labels, 3d labels, billboard, labels facing the camera, station labels, contour labels, point labels, drape, aerial, map layers on the surface, 3d, three d, 3d view, view cube, compass, orbit, perspective, parallel, isometric, iso, vertical exaggeration, terrain, model, site model, fly around, visualize, render, pipes in 3d, structures, manholes, corridor 3d
---

The 3D view shows the site as one model: the existing ground and the graded surface, contours draped on them, breaklines and the surface edge, each alignment on its design profile with station ticks, the corridor feature lines, pads with their daylight lines, and the pipe network with pipes and structures at their real elevations. It reads the same project as the plan, so every edit shows in both.

## Open the 3D view

1. Open survey points (or a LandXML or project file) so there is a surface.
2. Press {{key:D}}, or click {{ui:3D}} in the {{ui:View}} group of the toolbar.
   The 3D view opens over the plan, looking at the whole site from the southeast. The first time, it takes a moment to load.
3. Press {{key:D}} again, or click {{ui:3D}} again, to go back to the plan. Choosing a drawing tool such as {{ui:Alignment}} or {{ui:Pad}} also goes back to the plan, since drawing happens there.

## Move around

| To | Do this |
|---|---|
| Orbit | Drag with the left or the middle button |
| Pan | Drag with the right button, or {{key:Shift}} and drag |
| Zoom | Turn the wheel; it zooms toward the pointer |
| Orbit on a trackpad | Swipe with two fingers ({{key:Shift}} and swipe pans) |
| Zoom on a trackpad | Pinch |
| Touch | One finger orbits; two fingers pinch to zoom and move to pan |
| Keys (the view has the focus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbit, with {{key:Shift}} they pan; {{key:Plus}} and {{key:Minus}} zoom |

The bar over the view has the rest:

- The view list: **Iso**, **Top**, **Bottom**, **Front** (looking north), **Back**, **Left**, **Right**.
- {{ui:Perspective}}: pressed is a perspective view; click it for a parallel projection (no foreshortening).
- {{ui:Extents}}: shows everything again. {{key:F}} does the same while the 3D view is open.

## The view cube

The view cube in the top right corner turns with the view. Click a side, an edge or a corner to look at the site from there (the camera turns smoothly unless your system asks for reduced motion). Drag the cube to orbit. The compass ring under it shows north (grid north, +Y): drag the ring to turn the site about the vertical, or click N, E, S or W to look from that side. {{ui:Home}}, the small house at its top left, goes back to the iso view of the whole site. With the keyboard: {{key:Tab}} to the cube, arrows choose a side, edge or corner, {{key:Enter}} looks from there.

On the plan the same cube shows the top. Click any other side, edge or corner (or drag it) to open the 3D view looking from there: this is the quickest way into 3D from a given direction. To swap the cube for a small axis icon, or hide it, see **Corner indicator** in [CivilCraft settings](topic:settings).

## Exaggerate the elevations

Sites are usually much wider than they are high, so the elevations are stretched by **2×** to start with. Choose **1×**, **2×**, **3×**, **5×** or **10×** in the list on the bar, or under **3D vertical exaggeration** in [CivilCraft settings](topic:settings) (the two are one setting). Only the view changes: volumes, profiles and exports stay at true scale.

## Colour the surfaces

- **Elevation bands**: the same bands and colours as the plan's elevation bands (the number of bands is set under **Display** in the left panel). Each band edge is cut exactly at its elevation.
- **One colour**: the existing ground and the graded surface each in a plain colour.
- **Map layers**: the map layers shown under the plan (a georeferenced picture, map tiles or a map service; see [Map layers](topic:map-layers)) laid over the surfaces like a sheet, so an aerial photo shows on the hills. Pictures still arriving fill in as they come. With no map layer showing, the surfaces keep their elevation bands and the view says so. The picture is for the screen: GLB and OBJ exports do not carry it.

When both surfaces are shown, the existing ground is see-through over the graded surface, so you can see the cut (ground above the design) and the fill.

## Choose what shows

Click {{ui:Show}} on the bar and tick or clear:

| Item | What it is |
|---|---|
| Existing ground | The surface built from the survey points (or read from LandXML) |
| Graded surface | The existing ground with the corridors and pads graded in (only when there are some) |
| Triangle edges | Every TIN edge, as lines |
| Contours | Minor and major contours of each surface shown, at the plan's interval |
| Surface edge | The outer edge of each surface shown, at its elevations |
| Breaklines | Every breakline, at its elevations |
| Alignments and stations | Each alignment on its design profile (on the ground where there is no profile), with ticks every 50 ft or 20 m |
| Corridor feature lines | Edge of pavement, shoulder and daylight on both sides |
| Pads and daylight | Each pad outline at its elevation and its daylight line |
| Pipes and structures | Pipes as round pipes between their inverts, structures from rim to sump |
| Survey points | A dot at each point with an elevation (off at first) |
| GIS layers | The GIS layers shown on the plan, in their colors: lines and outlines with their own elevations at those elevations, others laid on the existing ground (they follow it exactly); points as small crosses. Shapes without elevations off the surface are left out, and the view says how many |
| Labels | Names and values that always face you: each alignment's name at its start and its stations every 100 ft (or 100 m), the elevation of each major contour, pads, feature lines and structures by name, and with **Survey points** ticked each point's number and elevation |

Labels stay the same size and upright however you turn or zoom, and a hill in front of a label hides it. Where they would crowd, the most important show and the rest wait until you zoom in: alignments first, then structures, pads, feature lines, stations, contours and points, nearer ones first. They are on the screen only; exports and plots leave them out.

Your choices, the exaggeration and the colouring are remembered in this browser.

## Pipes and structures

- A pipe is drawn with its bottom inside at the inverts you set and its top inside (the crown) one inside diameter higher. Diameters are in inches on a feet project and millimeters on a meter project, as in the right panel.
- A structure runs from its rim (typed, or from the surface) down to its sump (the lowest invert minus the sump depth). Without any invert, it is drawn 5 ft (1.5 m) deep.
- Pipes and structures with a problem (see the network check in the right panel) are drawn in red.
- A pipe without inverts is not drawn; a note at the bottom of the view says how many.

## Select from the 3D view

Click an alignment, a pad, a feature line, a pipe, a structure or a survey point. It is selected just as if you clicked it in the plan: its properties open in the right panel, where you can edit them, and it is drawn in the selection color on top of everything in 3D. Whatever you select on the plan is highlighted in 3D too. A tip next to the pointer names what you clicked with its easting, northing and elevation. Pipes and structures can be clicked even where they are under the ground; a line hidden behind a hill cannot be clicked through it.

Click a breakline to see which one it is: it is highlighted, and the status bar names it (breaklines have no properties of their own).

Click the ground to read the easting, northing and elevation there in the tip.

## Drive along an alignment

Click **Drive** on the 3D bar and pick an alignment. The view moves to a driver's seat: 3.5 ft (1.07 m) above the road, on its design profile (on the existing ground along the centerline when it has none yet), looking ahead along it.

- **Play** or {{key:Space}} drives at the speed you pick (10 to 65 mph, or 15 to 100 km/h); {{key:Space}} again pauses. It stops at the end; **Play** then starts again from the beginning.
- The slider jumps to any station; {{key:Left}} and {{key:Right}} step 10 ft (5 m) back and on.
- Dragging in the view pauses and lets you look round.
- **Stop** or {{key:Esc}} puts the view back where it was.

The vertical exaggeration applies while driving too: set it to 1× to see the road as it will be.

## Light from the sun

Open **Sun** on the 3D bar and tick **Light from the sun**. Give a date, a clock time and its time zone (the offset from UTC: in summer, the daylight saving one), and the site's latitude and longitude. When the project has a coordinate system, they are filled in from it.

The site is then lit from where the sun is, with **Shadows** across the ground, the corridor and the pads; the menu says the sun's azimuth and how high it is, or that it is below the horizon. Positions come from NOAA's solar equations. Shadows fall the right way at any exaggeration, but they stop at the edge of the site: hills and buildings beyond it cast none.

## Export the 3D view

Click {{ui:GLB}} or {{ui:OBJ}} on the bar. What the view shows is saved, in true scale (no exaggeration), in meters, with Y up. Details: [Export the site in 3D](topic:export-3d).
