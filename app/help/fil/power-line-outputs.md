---
title: Mga table, quantity, sheet at GIS ng power line
summary: Stringing at support table, material quantities para sa spreadsheet o TakeoffCraft, plan at profile sheet kasama ang study report bilang isang PDF, at mga GIS layer na may datos ng bawat asset.
keywords: stringing table, support table, quantities, bill of materials, takeoffcraft, sheets, report, pdf, profile sheet, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Ang lahat ng narito ay nasa ilalim ng {{ui:More}} sa grupong Power lines.

| Output | Ano ang makukuha mo |
|---|---|
| {{ui:Stringing tables…}} | Kada seksyon, ang horizontal tension at ang sag ng bawat span sa bawat temperatura; i-save bilang CSV. {{ui:Save the supports table (CSV)}}: ang tungkulin, item, ground, attachment, pinakamalaking load, nominal, OK, mungkahi, foundation, swing at uplift ng bawat support |
| {{ui:Quantities…}} | Conductor (haba ng catenary × conductors × circuits + 2 % para sa jumper at dead-end), support at kagamitan ayon sa item sa library, kable, trench, excavation, ducts, joints. CSV, Excel, o TakeoffCraft quantities file |
| {{ui:Sheets and report…}} | Isang PDF: ang plan; isang profile sheet para sa bawat linya na may conductor sa mga load case na pipiliin mo at isang strip ng haba ng span, sag at pinakamababang clearance; at isang study report (rule set, seksyon, stringing tables, support, bawat check) |
| {{ui:Export to GIS…}} | Support, span, cable route, kagamitan at obstacle bilang mga layer na may datos nila (taas, load, sag, clearance, alin ang bumabagsak), bilang GeoPackage, shapefiles, GeoJSON, KML o KMZ |

Kailangan ng GeoJSON at KML ang coordinate system ng project ([Coordinate systems](topic:coordinate-systems)); kung wala ito, dala ng GeoPackage at shapefiles ang sariling numero ng project.
