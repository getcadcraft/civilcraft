---
title: The screen, part by part
summary: A tour of every bar and panel in CivilCraft by its on-screen name, from the toolbar to the status bar.
section: start
order: 20
keywords: interface, screen, toolbar, panels, properties, status bar, profile view, layout, tour, ui
---

CivilCraft has one screen. There are no tabs and no layouts. The side panels can move, float or go to a window of their own: see [Arrange the panels and use a second monitor](common:arrange-panels). From top to bottom and left to right:

- the **app bar** (CadCraft mark, app name, version, About, screen mode, Help, Save for offline, Paper and Model)
- the **toolbar** with seven groups of buttons
- the **left panel**: Site, Points, Surface, Display and, once you import some, GIS layers
- the **plan** in the middle, with the **profile view** under it when it is open
- the **right panel**: Properties of what is selected
- the **status bar** along the bottom

## App bar

The thin bar at the very top belongs to the CadCraft site, not to CivilCraft itself.

- The version menu shows which build you are running.
- {{ui:About CivilCraft}} opens the app's page on the site.
- {{ui:Full screen}} cycles the screen modes: full screen, then full screen with the bars hidden, then back to normal. {{key:Ctrl+Shift+F}} does the same on every platform, including a Mac (it is the Control key there, not Command). With the bars hidden, move the pointer to the top edge to bring them back.
- {{ui:Help}} (or {{key:F1}}) opens this help in a side panel; {{key:F1}} or {{key:Esc}} closes it.
- {{ui:Save for offline}} keeps CivilCraft in this browser so it opens with no connection; it then shows {{ui:Offline ready}}. See [Files you can open, save and export](topic:files#online-and-offline).
- {{ui:Paper}} and {{ui:Model}} switch between a light and a dark theme. The plan and profile follow the theme; PDFs always print on white.

## Toolbar

Each group has a small label above its buttons. Hover over a button to see its tooltip and key.

| Group | Buttons | What they do |
|---|---|---|
| File | {{ui:New}}, {{ui:Open}}, {{ui:Save}} | Start over, open a point file, LandXML or project, save the project as a download |
| Export | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Write LandXML 1.2, an R12 DXF or a DWG of the plan, or plot the plan to PDF |
| Surface | {{ui:Breakline}}, {{ui:Boundary}} | Draw a breakline through survey points; draw the outer boundary |
| Design | {{ui:Alignment}}, {{ui:Pad}}, {{ui:Pipes}}, {{ui:Profile}} | Draw an alignment, a pad, a pipe run; show or hide the profile view |
| Edit | {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}}, {{ui:Paste}}, {{ui:More}} | Undo, redo, copy and paste survey points; {{ui:More}} holds Cut, Paste in place, Duplicate, Delete, Select all points and Select none |
| GIS | {{ui:Coordinates}}, {{ui:Import}}, {{ui:Export}}, {{ui:Map}} | Set the coordinate system, import and export GIS files, show map layers under the plan |
| View | {{ui:Select}}, {{ui:Fit}}, {{ui:3D}} | Pick and move things; zoom to show everything; show the site in 3D ([View the site in 3D](topic:site-3d)) |

A drawing tool stays pressed while it is active. Clicking it again, pressing {{key:Esc}} or pressing {{key:V}} returns to {{ui:Select}}. {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}} and the items in {{ui:More}} are grayed out when they cannot act; the tooltip says why (for example "Select survey points first"). Every button is listed in [Toolbar reference](topic:toolbar).

On a narrow window the toolbar scrolls sideways.

## Left panel

### Site

- **Name**: the project name. It names every file you save or export and is printed in the PDF title strip.
- **Units**: {{ui:US feet}} or {{ui:Metres}}. This says what the numbers mean. Changing it does **not** convert coordinates; see [Units, stations and number formats](topic:units-and-stations).

### Points

Empty, it tells you how to open a point file. With points it shows the file name, the number of points and how many have an elevation, then a table of **point groups**: one row per first word of the description (GRD, FL, TBS …), with a count and a **Surface** choice:

- {{ui:Points}}: the points go into the surface (the default for every group).
- {{ui:Breakline}}: the group's points are joined, in point-number order, into one breakline.
- {{ui:Left out}}: the group does not touch the surface.

### Surface

Facts about the existing ground: points, triangles, lowest and highest elevation, mean elevation, 2D and 3D area, breaklines and whether there is a boundary. Under the facts, a box lists anything the surface builder had to fix or could not do. Then:

- **Longest outside edge**: 0 keeps every outside triangle; a number trims long thin triangles off the outside.
- Links that appear when they apply: {{ui:Remove the boundary}}, {{ui:Remove drawn breaklines}} and, for a surface read from LandXML, {{ui:Rebuild the surface from the points}}.

### Display

- **Surface**: {{ui:Existing ground}} or {{ui:Proposed (graded)}}. The second is available once a pad or corridor grades without problems.
- **Contours every**, **Major every** and **Bands** (the number of color bands).
- Checkboxes: {{ui:Contours}}, {{ui:Contour labels}}, {{ui:Triangles}}, {{ui:Elevation bands}}, {{ui:Slope arrows}}, {{ui:Points}}, {{ui:Point labels}}, {{ui:Breaklines}}, {{ui:Surface edge}}, {{ui:Pipes}}.
- A legend of band elevations appears when bands are on.

Display settings are saved with the project but are not undo steps: {{key:Mod+Z}} never turns a checkbox back.

## Plan

The plan shows the points, the surface and everything you design, in plan view with north up. Wheel to zoom at the pointer, drag empty space to pan. The full list is in [Keys and mouse](topic:keyboard).

- On an empty project a box titled **Start with survey points** lists the first steps and offers {{ui:Open the sample site}}.
- While a drawing tool is active, a hint at the top of the plan says what to click and how to finish.
- Dragging a file over the plan shows "Drop a point file, LandXML or project".
- Selected things are highlighted. A selected alignment or pad shows square grips at its PIs or corners; a selected structure shows one grip. Drag a grip to move it.
- Selected survey points have a ring. {{key:Shift}} and a click adds or removes a point; {{key:Shift}} and a drag draws a box (or, dragged round them, a lasso) that adds the points inside it. See [Select, copy and paste survey points](topic:copy-paste-points).

## Profile view

Press {{key:R}} or click {{ui:Profile}} to open it under the plan. Its bar has:

- an alignment list (enabled when there are two or more alignments)
- {{ui:Add PVIs}}: while it is pressed, a click in the profile adds a PVI ({{key:I}} toggles it)
- a readout of station, ground, design elevation, grade and cut or fill under the pointer
- a close button

The profile shows the existing ground, the design profile, grades on each tangent, each PVI's station and elevation, each vertical curve's L and K with its BVC and EVC, high and low points, and the vertical exaggeration. It always fits the whole alignment: it does not zoom or pan. Moving the pointer along it puts a dot on the alignment in the plan.

## Right panel: Properties

Its heading says what it shows.

- **Project** (nothing selected): the alignments and pads as links, the **Earthwork** block, and the **Pipe network** block with its rules and problems.
- **Alignment**: name, start station, length, the PI table, the curves, the design profile's PVI table and facts, and the **Corridor** settings.
- **Pad**: name, elevation, cut and fill slopes, area, daylight facts and earthwork.
- **Structure** or **Pipe**: sizes, rims, inverts, slope, cover and any problems.
- **Point** and its number: the point's coordinates, elevation, description and group (read only).

Fields take effect when you press {{key:Enter}} or leave the field. A value that is not accepted is marked as invalid and nothing changes.

## Status bar

- **E** and **N**: easting and northing under the pointer.
- **Ground** elevation there (and **Graded** where a pad or corridor changed it), or "Off the surface".
- The nearest alignment (or the selected one) with the **Sta** and offset (**L** or **R**) under the pointer.
- On the right, messages: what just happened, or why something was refused. A message clears itself after a few seconds.

## Dialogs

- **Import points**: opens with every point file. See [Import survey points](topic:import-points).
- **Plot the plan to PDF**: see [Plot the plan to PDF](topic:plot-pdf).
- **Unsaved changes**: asks before {{ui:New}} or opening a project or LandXML file throws away unsaved work. {{ui:Save a copy}} downloads the project first.

## Small screens

Up to 760 pixels wide, such as on a phone, the plan keeps the screen: the toolbar is one row that scrolls sideways, and the panels open as sheets from a bar at the bottom. {{ui:Tools}} hides the toolbar and {{ui:Move}} puts it at the bottom.
