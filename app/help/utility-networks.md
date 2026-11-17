---
title: Utility networks and OpenStreetMap
summary: Runs of water, sewer, storm, gas, power and telecom with material, size, cover and owner; OpenStreetMap data from an Overpass JSON file; crossings, trench sections and volumes; service layers in DWG, DXF and PDF; IFC pipe and cable segments.
section: tasks
order: 64
keywords: utility, utilities, network, osm, openstreetmap, overpass, pipe, cable, gas, sewer, storm, telecom, power, water, hydrant, manhole, trench, crossing, clearance, cover, depth, dwg, ifc, georeferenced, layers
---

Draw the buried services of a site as one network per service, check where they cross, and send them out as drawing layers and as IFC.

## Make runs

Open **Surface, More, Utility networks...**

- **Make a run from the selection** turns the selected alignment, feature line or pipe into a run of the service you chose. Then fill in material, size (mm), cover (the depth to the top of the pipe or cable) and owner in the table.
- **Read OpenStreetMap data** reads an Overpass JSON file you saved (a query with `out geom;`). The project needs a coordinate system first, because OpenStreetMap positions are latitude and longitude. Pipelines (by substance), underground power and telecom cables, hydrants, manholes and storm drains are read; anything else is counted as left out and said in the message. Overhead lines are left out.
- **Add the OpenStreetMap map** adds the OpenStreetMap map under the plan. It draws only while map layers from the internet are on in Settings.

## Checks and outputs

- **Crossings**: runs of different services that cross in plan are listed with the clear height between them where there is a ground surface; the minimum is a placeholder you set, not a standard's number.
- **Trench**: each run gets a trench (pipe size plus clearance each side, side slope, bedding) with a volume. The total shows in the window and in the CSV.
- **Drawing**: runs and points are on service layers (for example U-WATR-RUN, U-POWR-RUN), so they reach PDF, DXF and DWG.
- **IFC**: runs go into the IFC export as pipe segments and cable segments, with hydrants, valves and chambers, one system per service, in the project's coordinate system.

## OpenStreetMap data

OpenStreetMap data is copyright OpenStreetMap contributors and licensed under the ODbL. The attribution is added to the drawing, the CSV and the IFC. If you share a file that holds OpenStreetMap data, keep the attribution and read the licence's share-alike terms.

## What is not done

Runs are not drawn point by point on the plan with a tool yet, and crossings are not drawn in the profile view yet (the calculation is built). Depths, sizes and clearances start as placeholders: use your own standard's numbers.
