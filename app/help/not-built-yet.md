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
| Labeled spot elevations and slope values | Read them in the status bar, or colour the surface by slope with **Slope analysis** in the Landscape workspace ([Grading for landscape](topic:landscape-grading#grading-checks)) |

## Alignments and profiles

| Not built yet | Instead, today |
|---|---|
| Spirals other than clothoid; a spiral between two curves (compound transitions) | Clothoid spirals at the ends of a curve are available; the others are named and skipped on LandXML import |
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
| Ditches, medians, barriers and other parts beyond lanes, shoulder, gutter, curb, planting strip, sidewalk and side slope | Build each side from those parts ([Corridors](topic:corridor#build-each-side-from-parts)) |
| Assemblies that change along the road | Split the work into separate alignments |
| Rotation about an edge, superelevation in LandXML | Superelevation rotates about the centerline on circular curves; widen a lane with a width target to a feature line |
| Regions, targets for the side slopes (daylight to a line or a surface), corridor surfaces of their own | Targets move the edges of pavement and shoulders ([Corridors](topic:corridor)); the corridor is graded into the proposed surface |
| Corridors exported as LandXML roadways | The proposed surface is exported |
| Swept paths with speed, tyre slip, steering time, steering trailers or body clearance; a library of standard design vehicles; a swept path drawn by dragging the vehicle | Low-speed swept paths along a feature line or an alignment, with your own vehicle sizes ([Vehicle swept paths](topic:swept-paths)) |

## Grading and volumes

| Not built yet | Instead, today |
|---|---|
| Benches, open feature lines graded into the design, grading to a feature line from elsewhere | Close the feature line ([Feature lines](topic:feature-lines)), or use it as a breakline of the existing ground |
| Inserting or removing a feature line vertex | Draw the line again, or make a stepped offset of it |
| Arcs in drawn breaklines (through survey points), spirals in feature lines | Draw a feature line with arcs and use it as a breakline of the existing ground |
| Grading to a distance, elevation or another surface | Daylight to existing ground only |
| Adding or removing a pad corner | Delete the pad and draw it again |
| TIN-to-TIN (prism) volumes, choosing the grid cell size | Grid method, cell size chosen for you |
| Swell and shrink, topsoil, pavement depths | Apply factors to the reported numbers yourself |
| Free-haul and overhaul costs, haul across different alignments, borrow pits and waste sites placed on the plan | The mass-haul diagram with balance points, volumes moved and average haul distances |

## Pipe networks

| Not built yet | Instead, today |
|---|---|
| More than one network per project | Separate projects for storm and sanitary |
| Water mains (pressure networks: demands, pressures, fire flow, tanks, pumps, valves) | Check them in water distribution software; sanitary design flows are in [Sanitary design flows](topic:sanitary-design) |
| Sewer flows over time (hydrographs, dynamic routing, storage, pumps, overflows) | [Sanitary design flows](topic:sanitary-design) gives the steady peak flow a design sheet uses |
| Inlet capacity, gutter spread, detention routing, hydrographs, energy losses other than one junction coefficient | Check them in other software; flows, sizes and the grade lines are in [Storm drainage](topic:storm-drainage) |
| Catchments in the PDF plot, DWG, DXF or LandXML; catchments from the surface (watersheds) | Draw catchments by hand; they are saved in the project file |
| Pipe catalogs, non-round pipes, structures that are not upright boxes or cylinders (cones, steps, benching), a drainage category in the library | Structure types from parameters ([Pipe network](topic:pipe-network)); pipes with a diameter |
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
| CadCraft Studio for iPad and iPhone, and from Google Play | Use CivilCraft in the browser on the device; on Android, CadCraft Studio installs from its APK on getcadcraft.com/download |
| Opening several point or project files at once | One file per open (GIS files that belong together, such as a shapefile's parts, open together) |

## Landscape

| Not built yet | Instead, today |
|---|---|
| Manufacturers' heads and nozzles | Generic heads, or add your own heads from a file; makers' data comes in as they give permission |
| Maximum lateral lengths for drip lines, flows over time, pumps, looped pipe networks | Keep drip runs to the maker's published length; the check needs a branching network |
| The exact outline of a concave freeform object; its below-ground volume measured exactly | The convex hull is graded and the below-ground volume is an estimate (said in Properties) |
| Plants in BimCraft's and ModelCraft's own Place from library | Export landscape IFC and open it in BimCraft beside the building |
| Plant models scattered in the 3D view from the planting | The 3D view shows the ground and hardscape; ModelCraft's scatter makes planting pictures |
| Walls that retain a graded level behind them on the surface | Grade the level behind a wall with a platform or a grading area |
| Sections through the terrain along a line you draw | Sections along an alignment ([Sections](topic:sections)); wall sections on the details sheet |
| The landscape tools for assistants without the window (the file server and the command line) | They work with the CivilCraft window open ([Let an AI assistant work with your site](topic:assistants)) |

## Power lines

| Not built yet | Instead, today |
|---|---|
| A country's standard built in (load cases, clearances, factors) | Set your standard's values in {{ui:Load cases and limits…}} and save them, with your library, as a pack to reuse and share ([Packs](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| The sideways distance from a conductor to a tree crown or a wall beside the line | The clearance straight up over plants and walls the line crosses ([Power-line checks](topic:power-line-checks#clearances)) |
| Conductor creep and the stretch of a new conductor | Allow for them through the temperatures in the stringing table |
| Thermal rating of buried cables (current rating from how they are laid) | Enter your supplier's current rating on the cable item |
| Short-circuit, protection and earthing studies | Use a dedicated electrical program; CivilCraft gives the network's lengths and cables |
| Lattice towers designed member by member, and stay anchors in the soil | Supports are checked by their nominal load; stays by their rated load |
| A `.DON` study file checked in the program that reads it | Check the file there; send us a sample so we can test against a real one |
| Power lines in the 3D view and in IFC | The plan, the line profile, the sheets and GIS layers |
| The power-line tools for assistants without the window | They work with the CivilCraft window open ([Let an AI assistant work with your site](topic:assistants)) |

## Building masses

| Not built yet | Instead, today |
|---|---|
| A library of zoning codes or any city's rules | Type the limits from your own ordinance ([Zoning limits](topic:zoning-limits)) |
| Sky light on the walls (facade daylight), wind | [Sun hours](topic:sun-hours) counts direct sun only |
| Shade from trees, plants or anything not drawn as a mass | Draw neighbouring buildings as masses |
| Roof shapes on masses | Flat-topped masses |
| Openings, roofs and wall types when a mass is developed in BimCraft | BimCraft builds plain exterior walls on every level and a floor; add the rest there |

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
| Textures from photos, recording a drive as video, shadows from beyond the site, sun hours shown in the 3D view | Map layers draped on the surfaces; drive and the sun's position at one time; [sun hours](topic:sun-hours) for a day or a season on the plan |
