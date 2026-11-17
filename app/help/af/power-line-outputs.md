---
title: Kraglyntabelle, hoeveelhede, velle en GIS
summary: Uitspannings- en steuntabelle, materiaalhoeveelhede vir 'n sigblad of TakeoffCraft, plan- en profielvelle met 'n studieverslag as een PDF, en GIS-lae met elke bate se data.
keywords: uitspanningstabel, steuntabel, hoeveelhede, materiaallys, takeoffcraft, velle, verslag, pdf, profielblad, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Alles hier is onder {{ui:Meer}} in die Kraglyne-groep.

| Uitvoer | Wat jy kry |
|---|---|
| {{ui:Uitspanningstabelle…}} | Per afdeling, die horisontale spanning en elke span se deurhang by elke temperatuur; stoor as CSV. {{ui:Stoor die steuntabel (CSV)}}: elke steun se rol, item, grond, aanhegting, grootste lading, nominaal, OK, voorstel, fondasie, swaai, optrek |
| {{ui:Hoeveelhede…}} | Geleier (kettinglengtes × geleiers × stroombane + 2 % vir springers en doodeindes), steune en toerusting volgens biblioteekitem, kabel, sloot, uitgrawing, pype, verbindings. CSV, Excel, of 'n TakeoffCraft-hoeveelhedelêer |
| {{ui:Velle en verslag…}} | Een PDF: die plan; 'n profielblad vir elke lyn met die geleier by die lasgevalle wat jy kies en 'n strook van spanlengtes, deurhange en laagste afstande; en 'n studieverslag (reëlstel, afdelings, uitspanningstabelle, steune, elke kontrole) |
| {{ui:Uitvoer na GIS…}} | Steune, spanne, kabelroetes, toerusting en hindernisse as lae met hul data (hoogtes, ladings, deurhange, afstande, wat faal), as GeoPackage, shapefiles, GeoJSON, KML of KMZ |

GeoJSON en KML benodig die projek se koördinaatstelsel ([Koördinaatstelsels](topic:coordinate-systems)); sonder een dra GeoPackage en shapefiles die projek se eie getalle.
