---
title: Units on import: a file states its units, or you are asked first
summary: When a drawing or mesh you bring into a project states its units, CivilCraft converts it and says so. When it does not, CivilCraft asks before reading it in and remembers your answer for that file.
section: tasks
order: 110
keywords: units, import, DWG, DXF, STL, OBJ, survey, feet, US survey feet, meters, millimeters, scale, wrong size, too big, too small, ask, remembered, INSUNITS, drawing units
---

## What you'll do

Bring a file into a project and be sure it comes in at the right size.

## Steps

1. Open the file as usual: {{ui:Open}}, drop it on the plan, or the CAD drawing command.
2. If the file states its units, nothing is asked: the import dialog shows them as **As the drawing says**.
3. If it does not, a dialog asks **Units of** the file before the import dialog opens. Choose what one unit in the file is and click {{ui:Use these units}}.
4. {{ui:Cancel}} (or {{key:Esc}}) skips the file. Nothing of it is read into the project.

## Which files state their units

- **DWG and DXF**: the drawing's insertion units (`$INSUNITS`). A file without them is asked about. The **Drawing units** list in the import dialog starts on your answer and can still change it.
- **STL and OBJ** (landscape free-form shapes): never state units. You are asked.
- **Lists of points** (CSV, TXT) and progress survey lists: a list that states its unit in its first lines is converted and the status line says so. One that states none is asked about when you press {{ui:Import}}, before the points go in. Latitude and longitude columns go through the coordinate system instead.
- **The Point clouds add-on**: asks when you build a cloud whose file states no unit, and labels the cloud's numbers in the unit it carries.
- **IFC and LandXML**: state theirs; they are converted to the project's units.
- **LAS, LAZ and elevation rasters**: placed by their coordinate system; the terrain dialog asks for the elevation unit when the file does not say.

## Good to know

- The answer is remembered for that file on this computer, in every CadCraft app. The next time it comes in you are not asked.
- To be asked again: the command palette ({{key:Mod+K}}) › **Ask again for the units of imported files**.
- A unit a list states is read from its first eight lines: a line such as `units: ft`, or column headings that all carry the same unit in brackets, such as `Elevation (m)`.
