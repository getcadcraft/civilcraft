---
title: Elektriliinide tabelid, kogused, lehed ja GIS
summary: Paigaldus- ja toetustabelid, materjalikogused tabelarvutuse või TakeoffCrafti jaoks, plaani- ja pikiprofiilide lehed koos uuringuaruandega ühes PDF-is ning GIS-kihid kõigi varade andmetega.
keywords: paigaldustabel, toetustabel, kogused, materjalinimekiri, takeoffcraft, lehed, aruanne, pdf, pikiprofiili leht, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Kõik siin on jaotises {{ui:Veel}} Elektriliinide grupis.

| Väljund | Mida saad |
|---|---|
| {{ui:Paigaldustabelid…}} | Lõigu kaupa horisontaalne pinge ja iga vahemiku ripe iga temperatuuri juures; salvesta CSV-na. {{ui:Salvesta toetiste tabel (CSV)}}: iga toe roll, kirje, maapind, kinnituspunkt, suurim koormus, nimikoormus, OK, soovitus, vundament, kõikumine, üleslükkamine |
| {{ui:Kogused…}} | Juhid (ripplahenduse pikkused × juhid × ahelad + 2 % ühendusjuhtmete ja ankurdusotste jaoks), toed ja seadmed teegi kirje järgi, kaabel, kaevik, kaevetööd, kaablikanalid, muffid. CSV, Excel või TakeoffCrafti koguste fail |
| {{ui:Lehed ja aruanne…}} | Üks PDF: plaan; pikiprofiili leht iga liini kohta koos juhiga koormusjuhtudel, mille valid, ja riba vahemike pikkustest, ripetest ja madalaimatest vabaruumidest; ning uuringuaruanne (reeglistik, lõigud, paigaldustabelid, toed, iga kontroll) |
| {{ui:Ekspordi GIS-i…}} | Toed, vahemikud, kaablimarsruudid, seadmed ja takistused kihtidena koos oma andmetega (kõrgused, koormused, rippe, vabaruumid, mis ebaõnnestub), GeoPackage, shapefile, GeoJSON, KML või KMZ |

GeoJSON ja KML vajavad projekti koordinaatsüsteemi ([Koordinaatsüsteemid](topic:coordinate-systems)); ilma selleta kannavad GeoPackage ja shapefile projekti enda arve.
