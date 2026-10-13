---
title: Set the project's coordinate system
summary: Say which coordinate system the survey is in, so CivilCraft shows latitude and longitude, places GIS files and map layers, and writes .prj files. Pick by code, by name, by the coordinates themselves or from a .prj file.
section: tasks
order: 130
keywords: coordinate system, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projection, prj, wkt, datum, latitude, longitude, lat long, geographic, grid, georeference, georeferencing, assign coordinate system
---

A project's coordinates are plain numbers until you say what they mean. Setting the coordinate system **never moves anything**: it tells CivilCraft that, for example, E 6,150,000 N 2,080,000 are California zone 6 state plane coordinates in US survey feet. Once it knows:

- the status bar shows the latitude and longitude of the pointer,
- GIS files in other systems (shapefiles, GeoJSON, GeoPackage, elevation grids, LiDAR) are converted into the project as they open,
- map layers can be drawn under the plan ([Show map layers under the plan](topic:map-layers)),
- exports to GIS formats carry the system (a `.prj` for shapefiles, the EPSG code for GeoPackage and GeoTIFF).

## Pick the system

1. Choose {{ui:Coordinates}} in the {{ui:GIS}} group of the toolbar. The **Coordinate system** dialog opens. At the top it says what the project is in now, or **None — coordinates are just numbers**.
2. Find the system one of these ways:
   - **Search**: type the EPSG code (`2277`, `EPSG:2277`) or words from the name (`texas central`, `utm 14n`, `lambert-93`). Codes list from the one you typed; words list systems whose name has every word.
   - {{ui:Systems these coordinates fit}} (when the project has points or a surface): CivilCraft reads the middle of your project in every system of the project's unit family and lists the ones whose area of use holds it. State plane coordinates usually fit only a few zones: a project in Texas at E 3,115,000 N 10,070,000 US survey feet fits the four Texas Central variants (NAD83, NAD83(2011), HARN, NSRS2007). Each entry shows where your project's middle would be.
   - **Near (lat, long)** and {{ui:Suggest}}: type where the site is, for example `30.27, -97.74` or `30°16′N 97°44′W`, and CivilCraft lists the projected systems whose area holds it, national and state grids first.
   - {{ui:Read a .prj file…}}: open the `.prj` that came with a shapefile or a drawing. CivilCraft matches it to its list by the projection maths (so a `.prj` that names a datum differently still finds the right system) and says which one it is; when nothing matches exactly, the file's own description is used. You can also drop a `.prj` on the dialog, or open or drop one on the plan by itself.
3. Click a system in the list. Under **Chosen** it shows the name, EPSG code, unit, how well its datum is tied to WGS 84, its area of use in latitude and longitude, and where your project's middle falls in it.
4. Leave **Grid** selected (most projects; see [Ground and local coordinates](topic:ground-and-local-coordinates) for the others) and choose {{ui:Apply}}.

The status bar now shows the pointer's latitude and longitude next to E and N. Setting the system is one undo step: {{key:Mod+Z}} takes it back.

:::note
The units must match: a project in feet takes systems in US survey feet or international feet, a project in meters takes systems in meters. CivilCraft explains a refusal ("The project is in feet but this system is in meters…"). A feet project with a US survey foot system uses survey feet: the project's "ft" means the system's foot. Geographic systems (latitude and longitude, such as WGS 84 itself) cannot be a project's system: drawings need eastings and northings.
:::

## Change or remove the system

Open {{ui:Coordinates}} again, pick another system and choose {{ui:Apply}}. When the project has points or a design, CivilCraft asks **Are the coordinates in … already?**

- {{ui:Yes — nothing moves}}: the numbers stay as they are and only their meaning changes. Use this when the old system was picked by mistake.
- {{ui:No — convert them}}: every survey point, breakline, boundary, alignment PI, pad corner and structure is converted from the old system into the new one, in one undo step. A surface read from LandXML as triangles cannot be converted; rebuild it from the points first.

{{ui:Remove the system}} takes the system away (nothing moves). GIS layers already in the project stay where they are.

## Latitude and longitude in the status bar

While the project has a system, the status bar shows the pointer's latitude and longitude on WGS 84, for example `30°18′00.00″ N  97°42′00.00″ W`. Choose decimal degrees instead under {{ui:Settings}}, {{ui:CivilCraft}}, **Latitude and longitude** ([CivilCraft settings](topic:settings)). With ground or local coordinates the readout goes through that step first, so it is right for the point under the pointer.

## How good the datum shift is

Latitude, longitude, GeoJSON and map layers are all on WGS 84. Each system's tie to WGS 84 is shown in the dialog:

| What the dialog says | What it means |
|---|---|
| WGS 84 itself | No shift at all. |
| NAD83 is taken as WGS 84 | The two differ by a meter or two in most of North America, a few meters at most. Good for map layers and site context; not for survey control. |
| Known to about *n* m (EPSG's figure) | A published shift; map layers and GeoJSON can be off by about that much. |
| Not known for this datum | There is no published shift without a grid file: map layers and GeoJSON may be off by hundreds of meters. |
| From the grid shift file … | A grid shift file is in use (below): within about 10 cm of NAD83 inside the grid. |

Your project's own coordinates never go through a datum shift: only what is converted to or from latitude and longitude does. Vertical datums and geoid models are not handled (elevations are never converted). Where the best shift needs a grid file, the list carries a rougher published shift and the dialog shows its accuracy (NAD27 systems, for example, about 20 m), until you add the grid.

## Grid shift files

For a NAD27 system, **Grid shift file** in the coordinate system dialog puts latitude and longitude, GIS files and map layers within about 10 cm of NAD83 instead of about 20 m:

- **Download** the grid it suggests for the system's area (NADCON5 for the conterminous United States, NADCON for Alaska, NTv2 for Canada) from cdn.proj.org, PROJ's public grid server. Only the grid's file name is sent.
- Or **Add a grid file…** you already have: NTv2 (`.gsb`) or a PROJ GeoTIFF grid (`.tif`), up to 20 MB.

The grid is saved in the project file, so it travels with the project. The section says whether the project's middle is inside the grid: outside it, no shift is applied at all, so use a grid that covers the site. **Stop using the grid** goes back to the rough shift. Each change is one step: {{key:Mod+Z}} undoes it.

GIS layers already in the project stay where they are when the grid changes; import them again to place them through the grid. The project's own coordinates never move.

## What was checked

- Every conversion was compared with PROJ (pyproj 3.7.1 with PROJ 9.5.1), the coordinate library most GIS programs use, on over 330 systems: state plane in US survey feet and feet, UTM north and south, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator and web Mercator among them. Eastings and northings agree to 1 cm with the same datum shift (most to well under 1 mm), and the projection maths agree with PROJ's own definitions to 1 cm.
- `.prj` files written by PROJ in both common forms (ESRI and OGC) were read back for 105 systems: 208 of the 210 matched their exact EPSG code and the other two a system with the same maths on the same ellipsoid. `.prj` files CivilCraft writes are read by PROJ as the same system. ESRI `.prj` files for polar stereographic systems (UPS, Alaska polar) cannot be read; pick those systems by code.
- The latitude and longitude in the status bar matched PROJ to 0.01″ in the browser.
