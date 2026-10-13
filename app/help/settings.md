---
title: CivilCraft settings
summary: Choose the column order for copied and pasted point rows and for guessing a file's columns, how pasted points are numbered, what point labels show, the corner indicator, the 3D vertical exaggeration, how latitude and longitude show, and whether map layers come from the internet.
section: reference
order: 25
keywords: settings, preferences, pnezd, penzd, column order, point rows, renumber, point numbers, start number, point labels, labels, description, elevation, view cube, axis icon, corner indicator, compass, vertical exaggeration, 3d, latitude, longitude, dms, decimal degrees, map layers, internet, privacy
---

Open {{ui:Settings}} with the gear in the app bar or {{key:Mod+,}}. The first tab, {{ui:CivilCraft}}, holds the settings that belong to this app; {{ui:General}} holds the ones every CadCraft app shares (theme, toolbar, panels). CivilCraft's settings exist only in the app: you change them here, and this browser remembers them. {{ui:Reset CivilCraft settings}} puts every setting back to its start.

## Point rows

**P, N, E, Z, D** (the start) or **P, E, N, Z, D**: point, northing, easting, elevation, description, or easting before northing. It is used in three places:

- **Copy**: the rows CivilCraft puts on the system clipboard for a spreadsheet.
- **Paste**: rows pasted from a spreadsheet or a text file that have no header row.
- **Import**: the guess in the **Import points** dialog when a file has no header row (a file with four columns reads as PENZ, three as ENZ). See [Point file formats](topic:point-file-formats).

A header row that names its columns always wins, and so does a choice in the import dialog's **Columns** list.

## Numbers for pasted points

- **Keep free numbers** (the start): a pasted point keeps its number when no point has it; only clashing points get new numbers.
- **Always new numbers**: every pasted point gets a new number, even if its own is free.

**New numbers start at**: leave it empty to count on from one more than the highest number in use. Type a number, for example 5000, to give new points numbers from 5000 up; numbers already in use are skipped. Two points never share a number either way. See [Select, copy and paste survey points](topic:copy-paste-points#point-numbers-never-clash).

## Point labels

What a point label shows when {{ui:Point labels}} is on under **Display**: **Number**, **Number and elevation**, or **Number, elevation and description** (the start). The DXF, DWG and PDF exports show the same labels as the screen.

## Corner indicator

What sits in the corner of the plan and the 3D view: **View cube** (the start), **Axis icon** or **None**.

- **View cube** (top right). On the plan it shows the top, with the compass ring: N is grid north (up the plan). Click any other side, edge or corner of the cube, or drag it, and the [3D view](topic:site-3d) opens looking from there. {{ui:Home}} on the plan cube fits the plan.
- In the 3D view the cube turns with the view: click a side, edge or corner to look from there, drag the cube to orbit, drag the compass ring to turn about the vertical, click a letter to look from that side, and use {{ui:Home}} for the iso view of the whole site. Looking straight at a side, small arrows step to the next side and curved arrows turn the view a quarter turn.
- **Axis icon** (bottom left): a small X (east) and Y (north) marker on the plan, X, Y and Z (up) in 3D.

## 3D vertical exaggeration

How much the 3D view stretches elevations: **1×**, **2×** (the start), **3×**, **5×** or **10×**. The list on the 3D view's bar is the same setting, so changing either changes both. Volumes, profiles and 3D exports stay at true scale.

## Latitude and longitude

How the status bar shows the pointer's latitude and longitude when the project has a coordinate system: **degrees, minutes and seconds** (the start, for example `30°18′00.00″ N`) or **decimal degrees** (`30.300000° N`). See [Set the project's coordinate system](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Map layers from the internet

**Off** (the start) or **On**. When on, CivilCraft asks the map servers you add for pictures of the area on screen. Your drawing stays on this computer; the server sees the area and your internet address. While it is off, no map server is asked for anything, even when a project you open names one; a georeferenced picture from a file works either way. See [Show map layers under the plan](topic:map-layers).


## Assistants

**Let AI assistants and scripts use CivilCraft** (off at the start) lets an assistant on your computer reach the open site through CadCraft Studio: **Read** describes the site and lists points, surface elevations and stations; the second switch lets it select survey points. **Activity** lists its calls. See [Let an AI assistant work with your site](topic:assistants).
