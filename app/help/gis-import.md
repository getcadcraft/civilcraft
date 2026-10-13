---
title: Import GIS data
summary: Bring shapefiles, GeoJSON and GeoPackages into a project as GIS layers, place them through the right coordinate system, look at their attributes, and use them for the surface.
section: tasks
order: 140
keywords: gis, labels, label features, attributes on the plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, layers, attributes, coordinate system, epsg, latitude, longitude, contours, parcels, breaklines, boundary
---

City and county GIS departments hand out site context as GIS files: parcels, easements, contours, utilities, survey control. CivilCraft opens three kinds of them as **GIS layers** that sit under your design on the plan.

| File | What to open |
|---|---|
| Shapefile | The `.shp` together with its `.shx`, `.dbf`, `.prj` and `.cpg` (select them all), or the `.zip` they came in. A zip holding several shapefiles gives several layers. |
| GeoJSON | The `.geojson` file (a `.json` file whose first lines say `FeatureCollection` or `Feature` works too). |
| GeoPackage | The `.gpkg` file. Every feature table in it is listed. |
| KML or KMZ | The `.kml` file (from Google Earth or a web map), or the zipped `.kmz`. Each folder becomes a layer (split into points, lines and polygons when it holds several kinds); a placemark's name, description and extended data become its attributes. Heights are in meters and latitude and longitude, as in GeoJSON. |

Points, multipoints, lines, polygons with holes and multi-part shapes are read, with their elevations (z) when the file has them. Measure (M) values are left out. Elevation grids and LiDAR open the same way: see [Elevation grids and LiDAR](topic:elevation-grids-and-lidar).

## Open the files

1. Click {{ui:Import}} in the **GIS** group (or {{ui:Open}}), choose the files, or drop them on the plan. The files are read on this computer; nothing is uploaded.
2. The **Import GIS data** dialog lists every layer found: its kind, how many features (and how many have no geometry), how many attribute fields, and the coordinate system the file names. Untick the layers you do not want.
3. Read the **Coordinate system** part (below) and the **What will happen** line, then click {{ui:Import}}.
4. The layers appear on the plan and under **GIS layers** in the left panel. The import is one step: {{key:Mod+Z}} takes it back.

A large file shows a progress line over the plan with a {{ui:Cancel}} button.

## The coordinate system

GIS files say where they are through a coordinate system (a shapefile's `.prj`, a GeoPackage's spatial reference table; GeoJSON is always latitude and longitude). CivilCraft converts each layer from its own system into the project's. It never guesses:

- **The project has a coordinate system** (set in {{ui:Coordinates}}): every layer with a system of its own is converted into it, including a ground or local adjustment. A file with no `.prj` gets two choices: **Same as the project** (its numbers are loaded as they are) or **Pick the file's system**.
- **The project has none, and the file is in a projected system in your project's units** (a state plane zone in US survey feet for a feet project, for example): the dialog offers **Use that system as the project's coordinate system**. It is set in the same undo step as the import. Nothing in the project moves; the system only says what the numbers mean. You can pick another system for the project instead, and the layers are converted into it.
- **The project has none, and the file is in latitude and longitude** (every GeoJSON) **or in other units**: {{ui:Import}} stays grayed out until you choose the project's coordinate system. The picker starts near the data.
- **Neither the project nor the files name a system**: the numbers are loaded as they are, and the dialog says so.

Elevations are converted too: GeoJSON heights are metres (the GeoJSON standard says so); other files' heights are taken in the unit of their own system.

:::warning
Positions in a GeoJSON file outside ±180° longitude or ±90° latitude are not latitude and longitude. Those features are left out and the dialog says how many. Such a file is usually a projected file saved without its system; ask for it again, or for the shapefile with its `.prj`.
:::

NAD83 is treated as the same as WGS 84 (the system GeoJSON uses); the two differ by a few metres in North America, so GeoJSON data can be off by that much. Where the best shift needs a grid file (NADCON for NAD27, for example), CivilCraft uses a rougher published shift and the coordinate system dialog shows how rough (for NAD27, about 20 m), until you add the grid: see [Grid shift files](topic:coordinate-systems).

## GIS layers

Each row under **GIS layers** has:

- a checkbox to show or hide the layer (hidden layers are not picked either);
- its colour, chosen from the list;
- a menu (the three dots) with {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} and {{ui:Remove}}.

Showing, hiding, recolouring, renaming and removing are undo steps. GIS layers are saved in the project file and come back when you open it. They also go out with the plan's PDF plot and its DXF and DWG exports, each on a layer named `GIS-` and its number.

## Label features from an attribute

In the layer's {{ui:More}} menu (the three dots in **GIS layers**), choose a field under **Label with**: every feature shows its value on the plan, in the layer's color. Points are labeled beside the point, lines along the middle of their longest part (turned to read from left to right), polygons at their center. Numbers show up to three decimals. Labels are 1.8 mm high on paper at any scale, and they go into the PDF plot, DXF and DWG. Choose **No labels** to take them away; each change is one step ({{key:Mod+Z}} undoes it). A layer labels at most 5,000 features.

## Look at a feature

With {{ui:Select}} on, click a feature. **Properties** shows its layer, which feature it is, its shape (parts, holes, vertices), its elevations, the file it came from and that file's coordinate system, then every attribute in a table. Attributes are read-only: CivilCraft shows GIS data as it came, it does not edit it.

Points win over lines when both are under the pointer; inside a polygon, the smallest polygon is picked.

## Use for the surface

Open a layer's menu and choose {{ui:Use for the surface…}} (or the button in **Properties**). What is offered depends on the layer:

| Layer | Can become |
|---|---|
| Lines with elevations (3D lines) | Breaklines at their own elevations |
| Lines without elevations but with a number field (contours) | Breaklines at the elevation in the field you pick |
| Polygons | The surface boundary (the selected polygon, else the largest), or breaklines along their edges |
| Points with elevations, or with an elevation field | Survey points, described with the layer's name so they form a point group |

Each use is one undo step that copies the geometry into the project; the layer itself stays as it is. Elevations are taken in project units.

## Point files with latitude and longitude

A point file whose header names **latitude** and **longitude** columns (`lat`, `latitude`, `lon`, `long`, `longitude`) is read as degrees, not as northing and easting. The import dialog says so. On {{ui:Import}}, the points are converted to the project's coordinate system; a project without one asks you to choose it first. Degrees are never loaded as feet. Rows outside ±90° latitude or ±180° longitude are refused with the reason. The elevation column is taken as it is, in project units.

## LandXML files that name a coordinate system

When a LandXML file you open has a `CoordinateSystem` element (an EPSG code, a WKT description or a system name), CivilCraft offers it as the project's coordinate system. Nothing moves if you accept; the system only says what the numbers mean.

## What was checked

- Every reader was compared with GDAL, the library most GIS programs use to read these files, on files GDAL wrote: shapefiles of every kind with and without elevations, multi-part lines, polygons with holes, empty geometries, text, number, date and true/false attributes, UTF-8 and Windows-1252 text with and without a `.cpg`, a zip of several shapefiles, GeoJSON with every geometry type, and a GeoPackage with four tables. Every geometry, elevation and attribute matched.
- Positions converted from latitude and longitude, and from UTM, matched PROJ (the projection library behind GDAL) to 3 mm.
- Damaged files (cut short, lying about their sizes, bad zips, bad GeoPackages) give one plain message; nothing hangs.
- Nothing here has been opened in other GIS programs yet, and file geodatabases, KML and KMZ are not read yet (see [Not built yet](topic:not-built-yet)).
