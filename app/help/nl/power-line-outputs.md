---
title: Tabellen, hoeveelheden, bladen en GIS voor elektriciteitslijnen
summary: Montage- en mastentabellen, materiaalhoeveelheden voor een spreadsheet of TakeoffCraft, plan- en langsprofielbladen met een studierapport als één PDF, en GIS-lagen met de gegevens van elk object.
keywords: montagetabel, mastentabel, hoeveelheden, materiaalstaat, takeoffcraft, bladen, rapport, pdf, langsprofiel, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Alles hier staat onder {{ui:Meer}} in de groep Elektriciteitslijnen.

| Uitvoer | Wat u krijgt |
|---|---|
| {{ui:Montagetabellen…}} | Per traject de horizontale trekkracht en de doorhang van elke overspanning bij elke temperatuur; opslaan als CSV. {{ui:De mastentabel opslaan (CSV)}}: de rol, het item, de grond, de bevestiging, de grootste belasting, de nominale waarde, OK, het voorstel, de fundering, de zwaai en de optrek van elke mast |
| {{ui:Hoeveelheden…}} | Geleider (kettinglengten × geleiders × circuits + 2 % voor verbindingen en eindmasten), masten en apparatuur per bibliotheekitem, kabel, sleuf, uitgraving, kabelbuizen, verbindingen. CSV, Excel, of een hoeveelhedenbestand voor TakeoffCraft |
| {{ui:Bladen en rapport…}} | Eén PDF: het plan; een langsprofielblad voor elke lijn met de geleider bij de belastinggevallen die u kiest en een strook met overspanningslengten, doorhangen en laagste vrije hoogten; en een studierapport (regelset, trajecten, montagetabellen, masten, elke controle) |
| {{ui:Exporteren naar GIS…}} | Masten, overspanningen, kabelroutes, apparatuur en obstakels als lagen met hun gegevens (hoogten, belastingen, doorhangen, vrije hoogten, wat faalt), als GeoPackage, shapefiles, GeoJSON, KML of KMZ |

GeoJSON en KML hebben het coördinatenstelsel van het project nodig ([Coördinatenstelsels](topic:coordinate-systems)); zonder dat bevatten GeoPackage en shapefiles de eigen getallen van het project.
