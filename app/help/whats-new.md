---
title: What's new in 0.7
summary: CivilCraft 0.7 adds a Power lines workspace (overhead lines and underground cables with your own libraries, sag and tension, clearance and strength checks, stringing tables, quantities, sheets and GIS), a Landscape workspace (a plant list, planting plans and schedules, landscape grading, paving, walls and steps, an irrigation calculation aid, landscape sheets and freeform objects), building masses with zoning limits you type and sun hours, clothoid spirals, corridors built from parts on each side, USD export and more tools for AI assistants.
section: start
order: 5
keywords: whats new, what's new, release notes, changelog, changes, 0.7, version, new features, landscape, landscape workspace, plant list, plants, planting, plant schedule, bed, hedge, grading, platform, berm, swale, spot elevation, slope analysis, ponding, hardscape, paving, path, wall, kerb, ramp, steps, irrigation, sprinkler, drip, landscape sheets, freeform object, building mass, massing, gross floor area, zoning, setback, envelope, sky plane, floor area ratio, coverage, sun hours, shadow, ifc, develop in bimcraft, spiral, clothoid, transition, assembly, curb, gutter, sidewalk, usd, assistants, units, portuguese
---

This is what changed in CivilCraft 0.7, compared with 0.6. The biggest new parts are the Power lines and Landscape workspaces and building masses.

## New

### The Landscape workspace

- **A Landscape workspace on the same site.** {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}} adds planting, grading, hardscape and irrigation tools to the site you already have: the same survey points, surfaces and project file. Choose **Civil** under **Workspace** to go back. See [The Landscape workspace](topic:landscape).
- **A plant list.** About 420 common temperate and Mediterranean trees, shrubs, hedges, grasses, perennials, groundcovers and climbers, with their sizes at planting and at maturity, hardiness zone, light, water and spacing. Search by any name in English, Spanish or Portuguese. Import your own list as CSV; it is saved with the project. The built-in sizes are typical and rounded: check them with a local nursery. See [The plant list](topic:plant-list).
- **Planting plans.** {{ui:Plant}} places single plants that sit on the ground and follow later grading, {{ui:Bed}} fills an outline at the plants' spacing with a mix by percentage, and {{ui:Hedge}} sets one or two rows along a line. Plants are labelled on the plan. See [Planting plans and schedules](topic:planting).
- **A plant schedule.** More › {{ui:Plant schedule…}} counts the plants by species and planting size. Save it as CSV or XLSX, or send it to TakeoffCraft to price. See [The plant schedule](topic:planting#the-plant-schedule).
- **Grading for landscape.** {{ui:Grade}} has platforms (level or falling), berms, swales, and grading areas with spot elevations and contours you drag. Cut and fill show as you go. **Slope analysis** colours the surface by your own two limits, and **Flow arrows and ponding** shows where water runs and where it would pond. All of it goes into the same proposed surface as pads and corridors. See [Grading for landscape](topic:landscape-grading).
- **Paving, paths, walls, kerbs, ramps and steps.** {{ui:Hardscape}} draws paving with a cross-fall or falls to a drain, a pattern and its layers; paths that follow the ground; retaining and freestanding walls with stepped footings; kerbs; and ramps and steps checked against limits you set. A retaining wall over 1.2 m (4 ft) is flagged for an engineer. See [Paving, walls and steps](topic:hardscape).
- **An irrigation calculation aid.** {{ui:Irrigation}} places heads, laterals, the mainline, valves, drip lines and the point of connection. {{ui:Check the system…}} finds the zones from the pipes and works out each zone's flow, the pressure needed at its valve and at the supply (Hazen–Williams), precipitation, run times, coverage and a bill of materials. It is a calculation aid, not a design certification: an irrigation designer checks every result. The heads are generic kinds, or your own from a file. See [Irrigation design](topic:irrigation).
- **Landscape sheets.** More › {{ui:Landscape sheets…}} makes planting, grading and irrigation plans with their legends, and a details sheet of wall sections, paving build-ups and steps, as one PDF. See [Landscape sheets](topic:landscape-sheets).
- **Freeform objects.** More › {{ui:Freeform object…}} places an STL, OBJ or library item mesh made in another app, such as a planter or a sculpture. It sits on the ground or cuts into it, and its volume, area and footprint are counted. See [Freeform objects](topic:freeform-objects).
- **Landscape IFC.** More › {{ui:Export landscape IFC}} saves plants (as vegetation with their properties), hardscape and freeform objects as IFC 4.3 for a BIM model. See [IFC](topic:planting#ifc).
- **Start to finish.** [Design a garden, start to finish](topic:landscape-walkthrough) walks through the whole workspace on the sample site.

### The Power lines workspace

- **Overhead lines and underground cables on your site.** {{ui:Surface}} › {{ui:More}} › {{ui:Power lines workspace}}: draw a line by its supports, cables in trenches, equipment and obstacles, on the same ground and in the same project file. See [The Power lines workspace](topic:power-lines).
- **Your own libraries.** Conductors, cables, supports, equipment (crossarms, insulators, fittings, stays, transformers, cabinets, joints) and trench types, in categories you name, shared as a file or a spreadsheet. No country's or maker's catalogue is built in; the examples say they are examples. See [Your power-line library](topic:power-line-library).
- **Sag and tension under your load cases.** Temperature, wind, ice and ice on one side; tension limits on a share of the breaking strength; the exact catenary on every span, slopes included; stringing tables. See [Sag and tension](topic:sag-and-tension).
- **Checks, always up to date.** Clearance over the ground and obstacles, phase spacing, insulator swing, uplift, support loads with sizing from your library, stays, fittings, foundations, missing data, disconnected cables, overloads and voltage drop, flagged on the plan and on the line profile. A design aid: an engineer checks it. See [Power-line checks](topic:power-line-checks).
- **Tables, sheets and GIS.** Stringing and support tables, quantities (CSV, Excel, TakeoffCraft), plan and profile sheets with a study report in one PDF, GIS layers with every asset's data. See [Power-line tables, quantities, sheets and GIS](topic:power-line-outputs).
- **After the first tries.** The line profile follows the line you select, has a **Line** list, reads the ground, conductor and clearance under the pointer and measures between two points. Landscape plants and walls count as obstacles under lines; cable routes and pipes show in the line profile and cross with a clearance rule you choose; **Rules…** beside every clearance opens your own rules; and rule sets with a library save as packs to share by country. See [Power-line checks](topic:power-line-checks) and [Packs](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Your own file formats.** Power lines are saved in the CivilCraft project file, libraries in `.cclines.json` or CSV, rule sets and packs in their own JSON files: open formats anyone can read or convert. The `.DON` study file is an extra import and export beside them.
- **Study files (.DON), untested.** Save a line as a `.DON` study file for another line program, or read one's supports; built from the format's field names, not yet tested with that program. See [Study files](topic:power-line-study-file).

### Measuring

- **A Measure tool.** {{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (or {{key:M}}) measures on the plan: each side's length and bearing, the running total, the length along the ground and the slope, and the area and perimeter once you close the shape. Nothing is drawn into the project. See [Measure](topic:measure).

### Building masses

- **Draw building masses.** In Properties, under **Building masses**, {{ui:Draw a mass}} (also {{ui:Surface}} › {{ui:More}} › {{ui:Masses}}). Give a mass floors and a floor height and read its gross floor area. Choose how it sits on sloping ground (stepped, podium or cut) and see the fill and cut. Masses show on the plan, in the PDF and in DWG and DXF on their own layers. See [Draw building masses on a site](topic:building-masses).
- **Push and pull in 3D.** In the 3D view, drag a selected mass's roof, or press {{key:PageUp}} and {{key:PageDown}}, to change it a floor at a time, in one undo step. **Sun** casts the masses' shadows. See [In the 3D view](topic:building-masses#in-the-3d-view).
- **Zoning limits you type.** Setbacks line by line from the street line, a height limit, a sky-exposure plane, a floor area ratio and a coverage. The buildable envelope draws on the plan, and each mass gets a tick or a cross for each limit. CivilCraft has no zoning code in it: every number is one you type from your own ordinance. See [Check masses against the zoning limits you type](topic:zoning-limits).
- **Sun hours.** Pick a day, or a season, and a time zone by name or offset, and read the hours of direct sun on every wall of every mass, floor by floor, and on the ground round them, drawn on the plan. Save the walls and the ground as CSV. The project needs a coordinate system. See [Work out the hours of sun on a site](topic:sun-hours).
- **Masses as IFC, and on to BimCraft.** {{ui:Masses as IFC}} saves the masses as IFC4, placed on the map when the project has a coordinate system. {{ui:Develop in BimCraft}} opens BimCraft in a new tab with the masses, where **Develop this mass** builds walls on every level and a floor from the footprint. Nothing is uploaded. See [Send it on](topic:building-masses#send-it-on).

### Alignments

- **Clothoid spirals.** Type a length in **Spiral in** and **Spiral out** in the PI table for a curve: tangent, spiral, curve, spiral, tangent, with equal or different lengths. The plan labels TS, SC, CS and ST, the curve list gives θs and the tangent and external distances, and stations and offsets run through the spirals. See [Spirals](topic:alignment#spirals).
- **Spirals in LandXML.** LandXML writes and reads clothoid spirals. Alignments with spirals, which CivilCraft used to skip on import, now open. See [Exchange LandXML](topic:landxml).

### Corridors

- **Build each side from parts.** Turn on **Build each side from parts** to give each side its own list from the centerline out: lanes, a shoulder, a gutter, a curb, a planting strip, a sidewalk and a side slope with its own cut and fill. Start from {{ui:Rural road}} or {{ui:Urban street}} and copy one side to the other. Cross sections mark the flowline, curb and walk, and the graded surface has the curb. See [Build each side from parts](topic:corridor#build-each-side-from-parts).
- **Superelevation over spirals.** On a curve with spirals, the superelevation runoff runs over the spiral: level crown at the TS, full superelevation at the SC. See [Superelevation](topic:corridor#superelevation).

### 3D files

- **USD export.** In the 3D view, {{ui:USD}} writes the site as `.usda`, `.usdc` or `.usdz` at true scale and at its project coordinates: surfaces, pipes and structures as meshes, lines, each alignment, and survey points with their numbers. See [Export the 3D site as USD](topic:usd).

### AI assistants

- **More for assistants.** With assistants turned on in {{ui:Settings}} › {{ui:CivilCraft}}, an assistant can now also read parcels, cut and fill and profiles, add survey points, save the project, export LandXML, DWG and USD, and work in folders you choose in CadCraft Studio. The Landscape workspace adds tools to find plants, place plants, beds and hedges, grade, and check the irrigation. The file server and the `cadcraft` command line open saved projects without the window. See [Let an AI assistant work with your site](topic:assistants).

## In every app

- **Units.** {{ui:Settings}} › {{ui:General}} › {{ui:Units}} has one list each for length, area, volume, angle and slope, with the exact sizes the units' definitions give (the US survey foot is its own unit). Switch off the units you never use and they leave the unit lists; star one and new work starts in it. A file always keeps its own unit. In CivilCraft the project's **Units** list follows the switches; a metric length star starts new projects in metres (else feet, which are US survey feet), an area or volume star sets the unit areas and volumes are reported in, and a length box takes any unit's mark, such as `3 ch` or `450 mm`. See [Units, typed values and the unit lists](common:unit-lists).
- **A denser layout and panels that tidy away.** {{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} › {{ui:Compact}} fits more on the screen (touch screens and phones keep their large buttons). Each side panel has a slim title bar: drag it to dock or float the panel, drop it on another panel's bar to share one frame as tabs, pin it to slide away to the edge, or hide it and bring it back from the edge. See [Arrange the panels](common:arrange-panels#make-the-layout-denser).
- **Dialogs move.** Drag a dialog by its title bar out of the way of the drawing; it comes back where you left it. Double-click the title bar to centre it again. See [Move a dialog](common:arrange-panels#move-a-dialog).
- **Recipes for AI assistants.** Ten worked requests for your own assistant (tidy a drawing, plot a set, check drawings, ask a model questions, total a takeoff, try a part variant…), each with the tools it calls and the permissions it needs, and each replayed by our tests. The apps contain no AI. See [Recipes for AI assistants](common:assistants-recipes).
- **Languages.** **Português (Portugal)** is new in {{ui:Settings}} › {{ui:General}} › {{ui:Language}}. It, **Português (Brasil)**, **Español (México)** and **Bahasa Indonesia** now have every word of the apps, as drafts not yet reviewed by a native speaker. Help topics are in English, with a few in Spanish.
- **CadCraft Studio** says why an update check failed (no file for your system yet, no network, a bad signature) instead of just "Done", and stops bringing back a What's new card you closed until there is a newer release.

## Not in this version yet

- **0.7 is not code-signed.** Signing, and the Microsoft Store package, moved to 0.8 because the certificate validation has not come through yet. Check the SHA-256 beside each file on getcadcraft.com/download. On Windows, if SmartScreen stops the installer, choose {{ui:More info}}, then {{ui:Run anyway}}. On a Mac, the first time, right-click CadCraft Studio and choose {{ui:Open}}. CadCraft Studio is not in an app store yet, and there is no iPad or iPhone build yet.
- The angle and slope lists in {{ui:Units}} are saved, but no box reads them yet.
- Makers' irrigation heads: only generic heads and your own heads from a file. Makers' data comes in only with their permission, and none has been given yet.
- BimCraft and ModelCraft carry the plant list, but their Place from library does not offer plants yet. Plants reach BimCraft through the landscape IFC.
- The landscape tools for assistants work with the CivilCraft window open; the file server and the command line don't have them yet.
- Building masses: no facade daylight or wind, no shade from trees or anything not drawn as a mass, no roof shapes, and sun hours show on the plan, not in the 3D view. Develop in BimCraft builds plain walls and a floor, with no openings or roof.
- Power lines: no country's standard built in (you set the load cases, limits and clearances); no conductor creep, thermal rating of buried cables, short-circuit, protection or earthing studies; no lines in the 3D view or IFC. The `.DON` study file has not been tested with the program that reads it.
- Spirals other than clothoid, a spiral between two curves, and spirals in feature lines. The spirals have been checked against the formulas and the LandXML schema, not yet against a LandXML file with spirals from another program.
- Corridor assemblies that change along the road, regions, and targets for the side slope.
- Water mains and pressure networks (the next civil work), flows that change over time, and links between water and storm networks.
- Arcs in drawn breaklines. Standard design-vehicle tables: the five vehicles that ship are labeled placeholders. Feature lines shared between projects wait for team projects.

Everything else is in [Not built yet](topic:not-built-yet).
