---
title: Coming from other civil software
summary: How familiar civil design workflows map to CivilCraft, and the differences that trip up experienced users in the first hour.
section: switching
order: 10
keywords: switching, migrate, familiar, differences, workflow, commands, mapping, cogo, corridor, grading, pipe network, styles, command line
---

If you have used Civil 3D, you already know the ideas in CivilCraft: points and point groups, TIN surfaces with breaklines and boundaries, alignments by PI, profiles by PVI, assemblies swept into corridors, grading to daylight, gravity pipe networks, LandXML. What is different is almost everything around them: there is no drawing file, no command line (unless you pick the {{ui:Drafting classic}} menu style), no styles, no Prospector and no settings dialogs. CivilCraft is a small, focused tool in a browser, and in this build it does a fraction of what a full civil package does. This page maps what you know to what is here.

:::tip
If you like the ribbon of Civil 3D, pick the {{ui:Civil ribbon}} menu style in {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}: Home, Surfaces, Modify, Geolocation, View and Output tabs, the middle button pans, and {{key:Shift}} with the middle button orbits the 3D view. If you type commands, {{ui:Drafting classic}} adds a command line (ALIGNMENT, PAD, PROFILE, ZOOM …). See [Menus, keys and mouse](topic:menus-keys-and-mouse).
:::

## Workflow map

| What you want to do | Familiar way | In CivilCraft |
|---|---|---|
| Bring in survey points | Import points with a point file format | {{ui:Open}}, then check the column order in **Import points** ([Import survey points](topic:import-points)) |
| Sort points | Point groups, description keys | Automatic groups by the first word of the description; no description keys |
| Edit a point | Point editor, grips | Not available yet: fix the file and import again |
| Build existing ground | Create a surface, add point groups as data | Automatic: the surface rebuilds whenever its inputs change |
| Add breaklines | Add breaklines from polylines or feature lines | Set a point group to {{ui:Breakline}}, or click points with the {{ui:Breakline}} tool ({{key:B}}) |
| Trim the surface | Outer boundary, hide boundary, maximum triangle length | {{ui:Boundary}} ({{key:O}}, outer only) and **Longest outside edge** |
| Show contours | Surface style | **Display** in the left panel: interval, major every, labels, bands, slope arrows |
| Lay out a centerline | Alignment creation tools, curve and spiral settings | {{ui:Alignment}} ({{key:A}}): click PIs, {{key:Enter}}; radii in the PI table; no spirals |
| Create a profile view | Profile view wizard, bands | {{ui:Profile}} ({{key:R}}): one profile view under the plan, always fitted |
| Design the grade | Profile layout tools | {{ui:Start from the ground}}, {{ui:Add PVIs}} ({{key:I}}), drag PVIs, type **Curve L** |
| Build a road | Assembly, subassemblies, corridor, targets, regions | Tick **Sweep an assembly along the design profile** under the alignment; one symmetric lane, shoulder and side slope |
| Grade a pad | Feature lines, grading groups, grading criteria | {{ui:Pad}} ({{key:G}}): a flat pad with cut and fill slopes to daylight |
| Compute earthwork | Volume surfaces, volumes dashboard | **Earthwork** in the right panel, grid method, updates live |
| Lay out storm or sanitary | Pipe network with a parts list, rules | {{ui:Pipes}} ({{key:P}}): click structures downstream; three rules you set; automatic inverts |
| Exchange with others | LandXML import and export | {{ui:Open}} a LandXML file; {{ui:LandXML}} to export ([Exchange LandXML](topic:landxml)) |
| Send linework to CAD | Export to DWG | {{ui:DWG}} (2000 to 2018 format) or {{ui:DXF}} (R12) |
| Plot | Layouts, viewports, sheet sets | {{ui:PDF}}: one landscape sheet of the plan at a chosen scale |
| Share work between files | Data shortcuts, references | Not available: one project per file |
| Undo | Undo | {{key:Mod+Z}} and {{key:Mod+Y}}, 200 steps; display settings are not undo steps |

## Differences that trip people up

**There is no command line.** Tools are toolbar buttons and single letters: {{key:A}} alignment, {{key:G}} pad, {{key:P}} pipes, {{key:B}} breakline, {{key:O}} boundary, {{key:R}} profile, {{key:I}} add PVIs, {{key:V}} select, {{key:F}} fit. Typing a command name does nothing. See [Keys and mouse](topic:keyboard).

**Enter finishes; double-click is risky.** Click the last point once, then press {{key:Enter}}. In this build a double-click finishes too, but drops the point you double-clicked. Right-click does not finish or repeat; it only pans when you drag with it.

**Everything is dynamic, all the time.** Change a point group, a radius, a PVI or a pad slope, and the surface, contours, corridor, daylight lines and volumes update immediately. There is nothing to rebuild and nothing goes out of date.

**Nothing is a drawing object.** The plan is a view of the design, not a drawing you can edit with CAD commands. You cannot add your own lines or text, change a layer's color, or explode anything. Export to DXF and finish the drawing in a CAD program.

**No styles.** Colors, line weights, label sizes and layer names are fixed (see [Plan layers](topic:plan-layers)). Paper and Model in the app bar switch between a light and a dark screen.

**One of each.** One existing ground surface, one graded result, one pipe network per project. Many alignments and pads are fine.

**Units are labels.** Choosing {{ui:US feet}} or {{ui:Metres}} does not convert anything. There is no drawing scale. A coordinate system is optional: set one under {{ui:Coordinates}} and nothing moves, it only says what the numbers mean (see [Set the project's coordinate system](topic:coordinate-systems)). Feet are treated as US survey feet when written to LandXML.

**Breakline groups join in point-number order.** A group set to {{ui:Breakline}} becomes one line through all its points, in number order. Shared codes (two flowlines both coded "FL") make one zig-zag line; draw those by hand.

**Stations look the same, metres differ.** Feet use 100 ft stations (12+34.56); metres use 1000 m stations (1+234.567).

**Delete on a Mac.** The Mac key labeled delete is Backspace to the browser. Use Fn and delete, or the {{ui:Delete}} button, to delete a selection.

**Files are downloads.** {{ui:Save}} downloads a `.civilcraft.json` file each time; there is no "save over the open file" and no autosave. Opening a point file replaces the points without asking. See [Files you can open, save and export](topic:files).

**Rules are yours.** Pipe network rules and the corridor assembly start with placeholder values that are not a standard. Set your own before trusting any check.

**Volumes are grid-based.** Cut and fill come from a fine grid between the two surfaces, inside the daylight lines, with no swell or shrink. They are close to, but not the same as, a TIN-to-TIN volume.

## What is missing

Spirals, curbs and sidewalks, sloped pads, inlet capacity and detention, parts catalogs, pipes in profile, parcel layouts and lot sizing, least-squares adjustment and survey databases, opening DWG, and more. The full list, with what to do instead today, is in [Not built yet](topic:not-built-yet).
