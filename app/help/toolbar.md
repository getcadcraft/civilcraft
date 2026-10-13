---
title: Toolbar reference
summary: Every toolbar button in CivilCraft, what it does, its key, and when it is grayed out or refuses.
section: reference
order: 20
keywords: toolbar, buttons, commands, tools, file, export, surface, design, edit, view, menu
---

The toolbar runs across the top of the app in seven groups. Every button shows its tooltip and key when you hover over it.

## File

| Button | Key | What it does |
|---|---|---|
| {{ui:New}} | none | Starts an empty project. Asks first if there are unsaved changes. |
| {{ui:Open}} | {{key:Mod+O}} | Opens a point file (CSV, TXT), LandXML or a CivilCraft project. |
| {{ui:Save}} | {{key:Mod+S}} | Downloads the project as `<name>.civilcraft.json`. |

## Export

| Button | Key | What it does |
|---|---|---|
| {{ui:LandXML}} | none | Downloads `<name>.xml`: points, surfaces, alignments, profiles and the pipe network as LandXML 1.2. "Nothing to export yet." when the project is empty. |
| {{ui:DXF}} | none | Downloads `<name>.dxf`: the plan linework as R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Opens **Plot the plan to PDF**. "Nothing to plot yet." when the project is empty. |

## Surface

| Button | Key | What it does |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Click survey points in order, {{key:Enter}} to finish. The breakline takes the points' elevations. |
| {{ui:Boundary}} | {{key:O}} | Click the corners of the outer boundary, {{key:Enter}} to finish. Replaces any boundary. |

Both say "There is no surface yet: open survey points first." when there is no surface.

## Design

| Button | Key | What it does |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Click the PIs in order, {{key:Enter}} to finish. |
| {{ui:Pad}} | {{key:G}} | Click the pad's corners, {{key:Enter}} to finish. Like the surface tools, it warns when there is no surface; a pad grades only on one. |
| {{ui:Pipes}} | {{key:P}} | Click structures from upstream down (click an existing one to join it), {{key:Enter}} to finish. |
| {{ui:Profile}} | {{key:R}} | Shows or hides the profile view under the plan. |

## Edit

| Button | Key | What it does |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Undoes the last change (up to 200). Grayed out when there is nothing to undo. |
| {{ui:Redo}} | {{key:Mod+Y}} | Redoes what was undone. Grayed out when there is nothing to redo. |
| {{ui:Copy}} | {{key:Mod+C}} | Copies the selected survey points, and puts them on the clipboard as point rows a spreadsheet can take. Grayed out until points are selected. |
| {{ui:Paste}} | {{key:Mod+V}} | Pastes points: they follow the pointer, and a click puts them down with numbers no other point has. Point rows copied in a spreadsheet paste too. |
| {{ui:More}} | none | Opens the menu below. |

The {{ui:More}} menu:

| Item | Key | What it does |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Copies the selected points and deletes them (one undo step). |
| {{ui:Copy}} | {{key:Mod+C}} | As the {{ui:Copy}} button. |
| {{ui:Paste}} | {{key:Mod+V}} | As the {{ui:Paste}} button. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Pastes the points at their own coordinates, with numbers no other point has. |
| {{ui:Duplicate}} | {{key:Mod+D}} | A copy of the selected points follows the pointer; click where it goes. The clipboard is left alone. |
| {{ui:Delete}} | {{key:Delete}} | Deletes the selected survey points, or the selected alignment, pad, structure (with its pipes), pipe or PVI. |
| {{ui:Select all points}} | {{key:Mod+A}} | Selects every survey point. |
| {{ui:Select none}} | {{key:Esc}} | Clears the selection. |

An item that cannot act right now is grayed out, and its tooltip says why. Details: [Select, copy and paste survey points](topic:copy-paste-points).

Undo covers edits to the design, the surface settings and the survey points (paste, cut, duplicate, delete). It does not cover display settings, and opening or importing any file clears it.

## GIS

| Button | Key | What it does |
|---|---|---|
| {{ui:Coordinates}} | none | Opens the **Coordinate system** dialog: say which system the project is in, or use ground or local coordinates. See [Set the project's coordinate system](topic:coordinate-systems) and [Ground and local coordinates](topic:ground-and-local-coordinates). |
| {{ui:Import}} | none | Imports GIS data: shapefiles, GeoJSON, GeoPackage, elevation grids and LiDAR. See [Import GIS data](topic:gis-import). |
| {{ui:Export}} | none | Exports as-built data for a GIS department. See [Export as-built data for GIS](topic:gis-export). |
| {{ui:Map}} | none | Opens the **Map layers** dialog: a georeferenced picture, or map servers you add, drawn under the plan. See [Show map layers under the plan](topic:map-layers). |

The GIS tools load the first time you use one of these buttons, open a GIS file, or open a project that has a coordinate system or GIS layers.

## View

| Button | Key | What it does |
|---|---|---|
| {{ui:Select}} | {{key:V}} or {{key:Esc}} | Click to select alignments, pads, structures, pipes and points ({{key:Shift}} and a click or a drag adds points); drag grips to move PIs, pad corners and structures. |
| {{ui:Fit}} | {{key:F}} | Zooms the plan to show the surface, points, alignments and pads (in the 3D view: shows everything). |
| {{ui:3D}} | {{key:D}} | Shows the site in 3D over the plan, or goes back to the plan. The bar over the 3D view sets the view, exaggeration, colouring and what shows, and exports GLB or OBJ. See [View the site in 3D](topic:site-3d). |

## Buttons in the panels

| Button | Where | What it does |
|---|---|---|
| {{ui:Open the sample site}} | The box on an empty plan | Loads the sample survey (needs a connection, unless CivilCraft is saved for offline use) |
| {{ui:Remove the boundary}} | Left panel, Surface | Takes the outer boundary away |
| {{ui:Remove drawn breaklines}} | Left panel, Surface | Removes every breakline drawn with the tool (not the breakline groups) |
| {{ui:Rebuild the surface from the points}} | Left panel, Surface (LandXML surface only) | Drops the LandXML TIN and builds from the points; cannot be undone |
| {{ui:Start from the ground}} | Right panel, Alignment | Starts a design profile with a PVI on the ground at each end |
| {{ui:Profile view}} | Right panel, Alignment | Opens the profile view for this alignment |
| {{ui:Add PVIs}} | Profile bar | While pressed, a click in the profile adds a PVI |
| {{ui:Set every invert from the rules}} | Right panel, Pipe network | Sets every pipe's inverts from the rules |
| {{ui:Set its inverts from the rules}} | Right panel, Pipe | Sets this pipe's inverts from the rules |
