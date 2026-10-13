---
title: Export as-built data for GIS
summary: Hand survey points, contours, alignments, pads, pipes and structures to a city or county GIS department as shapefiles, GeoPackage, GeoJSON or KML, in grid coordinates of the project's coordinate system.
section: tasks
order: 141
keywords: gis, export, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, pipes, structures, utilities, city, county, grid, ground, epsg, prj
---

Many cities and counties ask for as-built data in a GIS format when a project closes: where the pipes and structures went, final grades, the road centerline. **GIS › Export** writes what CivilCraft holds as GIS layers, one per kind of object.

## Before you export

1. Set the project's coordinate system in {{ui:Coordinates}}. A GIS department needs to know where the numbers are; without a system the files carry the project's own numbers and name none.
2. Check the surface, alignments, pads and pipe network the way you want them delivered.
3. Ask the department which format and which coordinate system they want. Many still ask for shapefiles in the local state plane zone; newer systems take GeoPackage.

## Export

1. Click {{ui:Export}} in the **GIS** group.
2. Under **What**, tick the kinds to send. Each shows how many features it has; kinds with nothing yet are grayed out.
3. Under **As**, pick the format.
4. Read the notes about coordinates and units, then click the download button. The status line says what went in, and any field names that were shortened.

The dialog also holds the elevation grid export ({{ui:Surface as a GeoTIFF elevation grid}}); see [Elevation grids and LiDAR](topic:elevation-grids-and-lidar).

## What each kind holds

| Kind | Shape | Fields |
|---|---|---|
| Survey points | Points with elevation | `P` point number, `N` northing, `E` easting, `Z` elevation, `D` description |
| Contours of existing ground, of the graded surface | Lines at their elevation | `ELEV` |
| Breaklines | Lines with elevations | `NAME` |
| Surface boundary | Polygon (the drawn boundary, else the surface's edge) | `NAME` |
| Alignments | Centerlines | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stations as plain numbers) |
| Pads | Polygons at the pad elevation | `NAME`, `ELEV`, `AREA` |
| Daylight lines | Lines with elevations (pads and corridors) | `NAME` |
| Corridor feature lines | Lines with elevations: center, edges of pavement, shoulders | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Pipes | Lines from the upper to the lower invert | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percent), `LENGTH`, `NETWORK` |
| Structures | Points at the rim | `NAME`, `RIM`, `INVERT` (the lowest pipe invert there), `SUMP`, `DIA`, `DIA_UNIT` |
| Each GIS layer | As imported | Its own fields |

Lengths, stations and elevations are in the project's units (US survey feet or metres). Pipe and structure diameters are in inches for feet projects and millimetres for metre projects; `DIA_UNIT` says which.

## The formats

- **Shapefile**: one `.zip` with a shapefile per kind (`.shp`, `.shx`, `.dbf`), a `.cpg` saying the text is UTF-8, and a `.prj` naming the coordinate system. Shapes with elevations are written as the shapefile's Z types. Field names longer than 10 characters are shortened, as the format requires, and the status line lists them.
- **GeoPackage**: one `.gpkg` file with a table per kind, the coordinate system stored with its EPSG code. One file instead of many, long field names kept.
- **KML** or **KMZ** (KML zipped): one file of latitude and longitude for Google Earth and web maps, a folder per kind, each feature a placemark named from its NAME field with every field as extended data; heights in meters (altitude mode absolute). Like GeoJSON, it needs the project's coordinate system.
- **GeoJSON**: one file of latitude and longitude (the GeoJSON standard allows nothing else) with every feature carrying a `kind` property (`pipes`, `structures`, …) so the receiver can split them. Heights are converted to metres, as the standard asks; they stay on your project's vertical datum (CivilCraft has no geoid model). A project without a coordinate system cannot export GeoJSON, and the dialog says why.

## Grid, not ground

GIS departments keep their data in **grid** coordinates of a coordinate system. If your project uses ground or local coordinates (set in {{ui:Coordinates}}), every coordinate is converted back to grid on the way out: the numbers in the files differ from the plan's by your scale factor (and rotation, for a local system). The point fields `N` and `E` hold the grid values too. The dialog reminds you.

:::tip
Send a short note with the files: the coordinate system and its EPSG code, the vertical datum of your elevations, the units, and what each file is.
:::

## What was checked

- Every file written was read back by GDAL, the library most GIS programs use to read these files: each shape, elevation and attribute, the feature counts, and the coordinate system as its EPSG code (`.prj` and GeoPackage). Our own readers read them back the same.
- GeoJSON files follow RFC 7946: longitude before latitude, no `crs` member, outer rings counter-clockwise and holes clockwise; positions matched PROJ to 2 mm.
- A ground-coordinate project was exported and every point checked against its grid coordinates.
- Nothing here has been opened in other GIS programs yet. Check the first delivery with the department before relying on it.
