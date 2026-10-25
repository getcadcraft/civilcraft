---
title: Power-line tables, quantities, sheets and GIS
summary: Stringing and support tables, material quantities for a spreadsheet or TakeoffCraft, plan and profile sheets with a study report as one PDF, and GIS layers with every asset's data.
section: tasks
order: 166
keywords: stringing table, support table, quantities, bill of materials, takeoffcraft, sheets, report, pdf, profile sheet, gis, geopackage, shapefile, geojson, kml
---

Everything here is under {{ui:More}} in the Power lines group.

| Output | What you get |
|---|---|
| {{ui:Stringing tables…}} | Per section, the horizontal tension and each span's sag at every temperature; save as CSV. {{ui:Save the supports table (CSV)}}: each support's role, item, ground, attachment, largest load, nominal, OK, suggestion, foundation, swing, uplift |
| {{ui:Quantities…}} | Conductor (catenary lengths × conductors × circuits + 2 % for jumpers and dead-ends), supports and equipment by library item, cable, trench, excavation, ducts, joints. CSV, Excel, or a TakeoffCraft quantities file |
| {{ui:Sheets and report…}} | One PDF: the plan; a profile sheet for each line with the conductor at the load cases you pick and a strip of span lengths, sags and lowest clearances; and a study report (rule set, sections, stringing tables, supports, every check) |
| {{ui:Export to GIS…}} | Supports, spans, cable routes, equipment and obstacles as layers with their data (heights, loads, sags, clearances, what fails), as GeoPackage, shapefiles, GeoJSON, KML or KMZ |

GeoJSON and KML need the project's coordinate system ([Coordinate systems](topic:coordinate-systems)); without one, GeoPackage and shapefiles carry the project's own numbers.
