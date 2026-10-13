---
title: Elevation grids and LiDAR
summary: Build the existing ground from a DEM (GeoTIFF or ASCII grid) or LiDAR points (LAS, LAZ) — pick the area, thin the data, choose classes and check the elevation units — and hand a surface back as a GeoTIFF elevation grid.
section: tasks
order: 14
keywords: dem, dtm, elevation grid, geotiff, tif, ascii grid, asc, lidar, las, laz, point cloud, classes, ground, thinning, nodata, raster, export geotiff, gis
---

Public elevation data comes two ways: **elevation grids** (a DEM: one elevation per square cell, usually a GeoTIFF `.tif` or an ASCII grid `.asc`) and **LiDAR points** (millions of laser returns in a `.las` file, or `.laz` when compressed). CivilCraft turns either into survey points or a surface, inside the browser: nothing is uploaded.

## Open the file

1. Click {{ui:Open}} (or {{ui:Import}} in the GIS group) and choose the file, or drag it onto the plan. For an ASCII grid, choose its `.prj` file too, so CivilCraft knows its coordinate system.
2. The import dialog shows what the file says about itself: its size, cells or points, its coordinate system, where it is in latitude and longitude, and its elevation range. For LiDAR it first reads every point once to count the **classes** (a progress bar shows how far it is; {{ui:Cancel}} stops it).

A GeoTIFF with three or four bands (red, green, blue) is a picture, not elevations: it goes to the map layers instead.

## Choose what to bring in

- **Area**: {{ui:The project’s extents and a margin}} (type the margin), {{ui:What the plan shows now}}, or {{ui:The whole file}}. Only that part of the file is read.
- **Thin to**: the spacing between the points you get, in the project's units. The line under the settings shows how many points that gives as you type. For a grid, CivilCraft keeps every second, third … cell, so the elevations stay exactly the file's; it never averages cells together. For LiDAR, the area is cut into squares of that size and one point is kept per square: {{ui:The point nearest each cell’s center}} (the default), {{ui:The lowest point in each cell}} (good when the file has no ground class: the ground is under the trees) or {{ui:The average of each cell’s points}}.
- **Classes** (LiDAR): ground (class 2) is ticked when the file has it; buildings, trees and noise are left out. When there is no ground class every class is ticked, and the dialog says so.
- **Elevations in the file**: meters, feet or US survey feet. When the file says, its unit is already chosen. When it does not, you must choose: the dialog shows the elevation range both ways so you can tell which makes sense for the site.
- **Import as** (grids only): {{ui:Survey points (description DEM)}}, or {{ui:The surface itself (a grid of triangles)}}.

One import takes at most 500,000 points. When a choice would give more, the dialog says by how much and what spacing would fit, and {{ui:Import}} stays off.

Click {{ui:Import}}. A progress bar shows the reading; {{ui:Cancel}} stops it and nothing changes.

:::warning
Vertical units are a common trap. Many state plane DEMs have eastings and northings in feet but elevations in meters. Check the range the dialog shows against what you know of the site.
:::

## What you get

- **Survey points**: numbered after your highest point number, with the description `DEM` (grids) or `LIDAR`, so they form one point group under **Points** and build the surface like any other points. Importing them is one step: {{key:Mod+Z}} takes them out again.
- **The surface itself**: a grid TIN, two triangles per cell, split on the south-west to north-east diagonal. A triangle with a corner that has no data is left out, so holes in the data stay holes. The surface equals the grid at every grid point and is a flat plane inside each triangle between them. It replaces the project's surface (the dialog asks first); {{key:Mod+Z}} brings the previous surface back. The left panel's heading says **Surface (from an elevation grid)**.

## Coordinate systems

- If the project has a coordinate system and the file names another, every point is converted to the project's system (and to its ground or local coordinates when it has them).
- If the project has none and the file's system is in the project's units (feet or meters), the dialog offers to make it the project's coordinate system, in the same undo step as the points.
- If the file is in latitude and longitude, or in meters for a feet project, the dialog asks you to pick the project's coordinate system first.
- If the file does not say, its numbers are taken as the project's coordinates. You can pick the file's system instead.

## Export a surface as a GeoTIFF

1. Click {{ui:Export}} in the GIS group.
2. In the GeoTIFF part choose the surface (existing ground or the graded surface) and the cell size. The default comes from the surface's average triangle edge. The dialog shows the size of the grid it will write.
3. Click {{ui:Download GeoTIFF}}.

The file is one band of 32-bit floating point elevations in the project's units, over the surface's extent; cells outside the surface are "no data" (−3.4028235e38). Each cell's value is the surface's elevation at the cell's center. Coordinates are **grid** coordinates: a project in ground or local coordinates is converted back to the grid. The file names the project's coordinate system by its EPSG code; a system without an EPSG code is not written, and the dialog warns you to tell the GIS department which system it is.

## What was checked

- The GeoTIFF and ASCII grid readers were checked against GDAL (through rasterio), the library most GIS programs use to read these files: 32-bit float and 16-bit integer grids, tiled and stripped, DEFLATE and LZW, nodata, scale and offset, pixel-is-point, a UTM grid, a state plane grid in US survey feet and a latitude/longitude grid — every value equal.
- The LAS and LAZ readers were checked against laspy: LAS 1.2 and 1.4, point formats 0, 1, 3, 6, 7 and 8, with and without a coordinate system, and LAZ written by its LASzip-compatible backend — every point equal.
- Converted coordinates were checked against PROJ to 1 mm.
- Exported GeoTIFFs were read back by GDAL: coordinate system, cell positions, nodata, units, and values equal to the surface to 0.0001.
- Nothing here has been opened in other GIS or CAD programs.

## Not built yet

- Vertical datum changes (geoid models): elevations are used as the file has them.
- Waveform data, LiDAR returns other than by class, colors and intensities.
- Several bands, overviews, or files over 200 MB.
- Writing LAS or LAZ.
