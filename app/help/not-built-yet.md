---
title: Not built yet
summary: What this build of CivilCraft does not do yet, and what to do instead today.
section: trouble
order: 20
keywords: missing, limitations, roadmap, not available, spirals, widening, dwg, dxf, inlets, detention, cross sections, coming later, limits
---

CivilCraft is early. This page lists what the current build does not do, so you do not look for it. Nothing here is promised for a date.

## Points

| Not built yet | Instead, today |
|---|---|
| Adding a second point file to the first | Join the files in a text editor or spreadsheet first |
| Exporting a point text file | Export LandXML (points go out as CgPoints), use GIS {{ui:Export}} (points with P, N, E, Z and D fields), or {{ui:Copy}} the points into a spreadsheet |
| Point label styles, symbols per description key, curves (arcs) from line codes, a description key file to share between projects | Labels show the number, elevation and description, or less ([CivilCraft settings](topic:settings)); keys are kept in the project file |
| Unit conversion | Convert the file before importing; **Units** only relabels |

## Surfaces

| Not built yet | Instead, today |
|---|---|
| More than one surface built from points | One project per surface |
| Hide (inner) boundaries | Use **Longest outside edge** or an outer boundary |
| Selecting or editing one drawn breakline | {{key:Mod+Z}}, or {{ui:Remove drawn breaklines}} and redraw |
| Editing a surface read from LandXML (breaklines, boundary) | {{ui:Rebuild the surface from the points}} |
| Editing a surface made from an elevation grid | Import the grid again with other choices |
| Converting a surface read from LandXML when the coordinate system changes | {{ui:Rebuild the surface from the points}} first |
| Labeled spot elevations and slope values | Read them in the status bar |

## Alignments and profiles

| Not built yet | Instead, today |
|---|---|
| Spirals (transition curves) | Circular curves only; LandXML alignments with spirals are skipped |
| Inserting a PI between two others | Redraw the alignment, or retype PI coordinates |
| Alignments from objects, offsets, widenings | Draw by PIs |
| Typing K for a vertical curve | Type L (K is shown) |
| Circular and unsymmetrical vertical curves | Symmetric parabolic curves only |
| More than one design profile per alignment | One alignment per variant |
| Zooming the profile view, profile bands under the profile | The profile view fits the whole alignment; plot it on [plan and profile sheets](topic:plan-profile-sheets) |
| Sections in DWG or LandXML | Section sheets as PDF; {{ui:CSV}} of the areas and volumes |
| Sample lines at an angle, or of different widths along the road | One width each side for the whole alignment |

## Corridors

| Not built yet | Instead, today |
|---|---|
| Curb and gutter, sidewalks, ditches, other subassemblies | One lane, one shoulder and a side slope each side |
| Different left and right sides, or changes along the road | Split the work into separate alignments |
| Widening, spiral transitions for superelevation, rotation about an edge, superelevation in LandXML | Superelevation rotates about the centerline on circular curves; widen by hand with a second alignment |
| Regions, targets, corridor surfaces of their own | The corridor is graded into the proposed surface |
| Corridors exported as LandXML roadways | The proposed surface is exported |

## Grading and volumes

| Not built yet | Instead, today |
|---|---|
| Benches, open feature lines graded into the design, grading to a feature line from elsewhere | Close the feature line ([Feature lines](topic:feature-lines)), or use it as a breakline of the existing ground |
| Inserting or removing a feature line vertex, arcs in feature lines | Draw the line again, or make a stepped offset of it |
| Grading to a distance, elevation or another surface | Daylight to existing ground only |
| Adding or removing a pad corner | Delete the pad and draw it again |
| TIN-to-TIN (prism) volumes, choosing the grid cell size | Grid method, cell size chosen for you |
| Swell and shrink, topsoil, pavement depths | Apply factors to the reported numbers yourself |
| Free-haul and overhaul costs, haul across different alignments, borrow pits and waste sites placed on the plan | The mass-haul diagram with balance points, volumes moved and average haul distances |

## Pipe networks

| Not built yet | Instead, today |
|---|---|
| More than one network per project | Separate projects for storm and sanitary |
| Inlet capacity, gutter spread, detention routing, hydrographs, energy losses other than one junction coefficient | Check them in other software; flows, sizes and the grade lines are in [Storm drainage](topic:storm-drainage) |
| Catchments in the PDF plot, DWG, DXF or LandXML; catchments from the surface (watersheds) | Draw catchments by hand; they are saved in the project file |
| Parts catalogs, rectangular structures, non-round pipes | Round structures and pipes with a diameter |
| Pipes in the profile view, curved pipes | Read inverts and cover in the right panel |

## Parcels

| Not built yet | Instead, today |
|---|---|
| Laying out lots by area or frontage, parcels from the lines around them, right-of-way | Draw each parcel by its corners, or enter its calls |
| Curve tables and line tables on the plan; labels moved by hand | Every course is labeled along itself |
| Parcels in LandXML | Parcels are saved in the project file and go to the PDF, DWG and DXF |

## Traverses

| Not built yet | Instead, today |
|---|---|
| Least-squares adjustment, the transit rule, weighting angles against distances | The compass rule |
| Deflection angles, zenith angles and slope distances, elevations by trigonometric leveling | Reduce to horizontal distances and angles right, or bearings |
| Side shots, raw data files from data collectors | Import the points as a point file |

## Staking

| Not built yet | Instead, today |
|---|---|
| Offset stakes (reference points set back from the stake), slope stakes at the catch point | Stake at the offsets you need, including past the shoulder |
| Sending stakes straight to a data collector's own format | The CSV opens in the office software of most data collectors |
| Staking pipes, pads and parcels | Use survey points near an alignment, or the parcel's courses |

## Files and output

| Not built yet | Instead, today |
|---|---|
| Text, hatches and dimensions from DWG or DXF; paper space; linked drawings (xrefs); binary DXF | Linework from model space opens ([Open a DWG or DXF as linework](topic:open-dwg-dxf)); open linked drawings on their own |
| Moving several points at once by dragging | Cut and paste them, or edit them one at a time |
| Portrait sheets, title blocks of your own, viewports you arrange, plan and profile sheets in DWG | One landscape plan sheet per PDF, or plan and profile sheets along an alignment (PDF) |
| Plotting elevation bands and profiles | Bands are screen only; take a screenshot if you need them |
| Changing layer names, colors or label styles | Change them in a CAD program after DXF export |
| Cloud saving and version history | Save `.civilcraft.json` files and keep them backed up; to work on one project together, use a live session in CadCraft Studio ([Design one site together, live](topic:work-live)) |
| CadCraft Studio for iPad, Android tablets and phones, and iPhone (planned for 0.6) | Use CivilCraft in the browser on the device |
| Opening several point or project files at once | One file per open (GIS files that belong together, such as a shapefile's parts, open together) |

## GIS and coordinate systems

| Not built yet | Instead, today |
|---|---|
| File Geodatabase; KML styles, icons, ground overlays and network links | Convert to GeoPackage, shapefile or GeoJSON first; KML placemarks are read without their styles |
| Editing GIS features or their attributes | Edit them in a GIS program and import again |
| Label styles (size, placement) and labels that avoid each other | Labels are one size and may overlap where features are dense |
| Vertical datums and geoid models | Elevations are used as the file gives them; check the vertical datum yourself |
| Grid shifts other than to NAD83 from NAD27 suggested by area (OSTN15, NTv2 for other datums work when you add the file), several grids at once, vertical grids | Add the grid file for your datum yourself; one grid a project |
| Map layers in the DXF or in 3D exports | Map layers go into the PDF plot, and beside the DWG as a picture |
| Map servers that need a sign-in, key or token | Use public services, or a georeferenced image file |
| Writing LAS or LAZ files | Export surfaces as a GeoTIFF elevation grid |
| LiDAR intensity, color and returns; elevation grids with several bands; grid or LiDAR files over 200 MB | LiDAR is filtered by class only, grids use their first band; cut large files into tiles first |

## Input

| Not built yet | Instead, today |
|---|---|
| Box selection by touch (it needs {{key:Shift}}) | Long-press each survey point to add it |
| Typed coordinates or distances while drawing | Draw roughly, then type exact PI coordinates in the alignment's PI table |
| Typing coordinates for pad corners and structures | Drag their grips; zoom in for precision and watch E and N in the status bar |
| Snapping to objects (other than survey points for breaklines) | Zoom in and watch the status bar |

## 3D view

| Not built yet | Instead, today |
|---|---|
| Drawing or editing in the 3D view | Draw and edit in the plan; the 3D view follows every edit |
| Selecting corridor feature lines or GIS features by clicking in 3D | Click them in the plan |
| Exporting the exaggerated view or in feet | Exports are true scale in meters; see [Export the site in 3D](topic:export-3d) |
| Labels in GLB or OBJ exports, label sizes and styles in 3D | Labels show in the 3D view only, one size; see [View the site in 3D](topic:site-3d) |
| Textures from photos, recording a drive as video, shadows from beyond the site, sun studies over a day | Map layers draped on the surfaces; drive and the sun's position at one time |
