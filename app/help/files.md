---
title: Files you can open, save and export
summary: Point files, LandXML and CivilCraft projects in; projects, LandXML, DXF and PDF out; what each keeps, where the files go, and what changes offline.
section: start
order: 30
keywords: open, save, export, import, file formats, csv, txt, landxml, xml, dxf, pdf, json, download, project file
---

CivilCraft opens files from your computer and saves by downloading files back to it. Nothing is uploaded and nothing is kept on a server. See also [Your files](common:your-files).

## What it opens

Click {{ui:Open}} (or press {{key:Mod+O}}) and choose a file, or drag the file from {{pick:mac=Finder|windows=File Explorer|linux=your file manager}} onto the plan. One file at a time; files over 200 MB are refused.

| Kind | File names | What happens |
|---|---|---|
| Point file | `.csv`, `.txt`, `.pnt`, `.xyz` (any text file) | The **Import points** dialog opens. The points replace the project's points; alignments, pads and pipes stay. |
| LandXML | `.xml`, `.landxml` | A **new project** is made from the file (you are asked first if the current one has unsaved changes). |
| CivilCraft project | `.civilcraft.json` (any `.json`) | The project opens as it was saved (you are asked first if the current one has unsaved changes). |

CivilCraft decides by the file's ending, then by its first characters: text starting with `{` is read as a project, text starting with `<` as LandXML, anything else as a point file. A file the open box grays out can still be dropped on the plan.

:::note
Importing a point file into a project that already has points replaces them without asking, and it clears the undo history (opening any file is a fresh start for undo). If the surface came from LandXML, importing points switches it back to a surface built from the points. Save first if you might want the old points back.
:::

Details: [Point file formats](topic:point-file-formats), [LandXML: what is read and written](topic:landxml-reference).

## What it saves

{{ui:Save}} ({{key:Mod+S}}) downloads the whole project as `<name>.civilcraft.json`, named after **Name** in the left panel. It keeps:

- every point (number, coordinates, elevation, description) and the name of the point file they came from
- the surface settings: group choices, drawn breaklines, the boundary, the longest outside edge, and a TIN read from LandXML
- the display settings
- alignments with their PIs, radii and start station, their design profiles (PVIs and curve lengths) and corridor settings
- pads and the pipe network with its rules

It does not keep the undo history. Surfaces, contours, daylight lines and volumes are not stored; they are rebuilt from the saved inputs when the project opens. A project file from a newer CivilCraft is refused with a message that names its version.

## What it exports

| Button | File | Contents |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: points, the existing ground (and the graded surface when there is one) as TIN surfaces, alignments, ground and design profiles, the pipe network |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF of the plan linework as it is displayed, on named layers |
| {{ui:DWG}} | `<name>.dwg` | The same linework as a DWG drawing, in the format you pick (2000 to 2018) |
| {{ui:PDF}} | `<name>.pdf` | A vector plot of the plan on a sheet, at a scale you pick |
| {{ui:GLB}} or {{ui:OBJ}} (on the 3D view's bar) | `<name>-3d.glb`, `<name>-3d.obj` | What the 3D view shows as a 3D model: meters, Y up, true scale, around a recorded local origin |

What each one leaves out: [Exchange LandXML](topic:landxml), [Export the plan to DXF](topic:dxf-export) (DWG too), [Plot the plan to PDF](topic:plot-pdf), [Export the site in 3D](topic:export-3d).

## Where the files go

Saved and exported files go wherever your browser puts downloads, usually the Downloads folder. To choose a folder each time:

:::chromium
Open the browser's **Settings**, then **Downloads**, and turn on **Ask where to save each file before downloading**.
:::

:::firefox
Open **Settings**, then **General**, and under **Files and Applications** choose **Always ask you where to save files**.
:::

:::safari
Open **Safari > Settings > General** and set **File download location** to **Ask for each download**.
:::

If you save twice with the same name, the browser may add a number to the second file, for example `Site (1).civilcraft.json`. Open the newest one next time.

## Online and offline

CivilCraft works only on your computer either way: opening reads the file in the browser, saving downloads it. To open CivilCraft with no connection at all, save it for offline use first:

1. While online, click {{ui:Save for offline}} in the app bar at the top.
2. The button counts up ("Saving 12 of 30") and then shows {{ui:Offline ready}}. CivilCraft is small (about 0.6 MB), so this takes a moment. The saved copy includes this help and the sample site.
3. With no connection, open the same address (or a bookmark of it). Everything works, including {{ui:Open the sample site}}.

The button's other states:

- {{ui:Could not save}}: some files did not download. Check the connection and click it to try again.
- {{ui:Offline not available}}: this browser window cannot keep an offline copy (private windows and some managed computers block it). Use a normal window.

Click {{ui:Offline ready}} to see when the copy was saved, with two choices: {{ui:Save again (get the newest version)}} and {{ui:Remove the offline copy}}. Save again before a site visit so the copy matches the newest build. More in [Offline](common:offline).

:::offline
You are offline now. If CivilCraft was saved for offline use, everything works, including the sample site. If not, keep working in this tab, but do not reload it until you are online again; without a saved copy, {{ui:Open the sample site}} fails with "The sample could not be loaded".
:::

:::tip
For field use, save CivilCraft for offline use and bring your point files on the laptop itself. Projects and exports save as downloads with no connection, so you can import a day's shots, check the surface and save the project on site.
:::

Cloud saving is not available yet, and desktop builds are not out yet. Today, the files you save are the only copy: keep them somewhere that is backed up.

## Closing with unsaved changes

When the project has unsaved changes and you close the tab, reload, or leave the page, the browser asks whether you want to leave. Its wording and look belong to the browser and cannot be changed by CivilCraft. {{ui:New}}, and opening a project or LandXML file, ask in CivilCraft's own **Unsaved changes** box instead, with {{ui:Cancel}}, {{ui:Don’t save}} and {{ui:Save a copy}}.
