---
title: As-built-gegevens voor GIS exporteren
summary: Inmetingspunten, hoogtelijnen, tracés, platen, leidingen en kunstwerken exporteren naar de GIS-afdeling van een gemeente of waterschap als shapefiles, GeoPackage, GeoJSON of KML, in rastercoördinaten van het coördinatenstelsel van het project.
keywords: gis, export, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, leidingen, kunstwerken, nutsvoorzieningen, gemeente, raster, terrein, epsg, prj
from: bba4fea5
---

Veel gemeenten en waterschappen vragen om as-built-gegevens in een GIS-formaat wanneer een project wordt opgeleverd: waar de leidingen en kunstwerken zijn gelegd, de definitieve hoogten, de wegas. **GIS › Exporteren** schrijft wat CivilCraft bewaart als GIS-lagen, één per soort object.

## Voordat u exporteert

1. Stel het coördinatenstelsel van het project in via {{ui:Coördinaten}}. Een GIS-afdeling moet weten waar de getallen staan; zonder stelsel dragen de bestanden de eigen getallen van het project en noemen ze geen stelsel.
2. Controleer het oppervlak, de tracés, platen en het leidingnet zoals u ze wilt opleveren.
3. Vraag de afdeling welk formaat en welk coördinatenstelsel ze willen. Veel vragen nog shapefiles in het lokale coördinatenstelsel; nieuwere systemen nemen GeoPackage.

## Exporteren

1. Klik op {{ui:Exporteren}} in de groep **GIS**.
2. Vink onder **Wat** de soorten aan die u wilt sturen. Elk toont hoeveel objecten het heeft; soorten zonder inhoud zijn grijs.
3. Kies onder **Als** het formaat.
4. Lees de opmerkingen over coördinaten en eenheden en klik op de downloadknop. De statusregel vertelt wat erin is gegaan en welke veldnamen zijn ingekort.

De dialoog bevat ook de export van het hoogteraster ({{ui:Oppervlak als GeoTIFF-hoogteraster}}); zie [Hoogterasters en LiDAR](topic:elevation-grids-and-lidar).

## Wat elke soort bevat

| Soort | Vorm | Velden |
|---|---|---|
| Inmetingspunten | Punten met hoogte | `P` puntnummer, `N` Northing, `E` Easting, `Z` hoogte, `D` beschrijving |
| Hoogtelijnen van bestaand maaiveld, van het afgewerkte oppervlak | Lijnen op hun hoogte | `ELEV` |
| Breeklijnen | Lijnen met hoogten | `NAME` |
| Oppervlakgrens | Vlak (de getekende grens, anders de rand van het oppervlak) | `NAME` |
| Tracés | Hartlijnen | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stationeringen als gewone getallen) |
| Platen | Vlakken op de hoogte van de plaat | `NAME`, `ELEV`, `AREA` |
| Aansnijdlijnen | Lijnen met hoogten (platen en corridors) | `NAME` |
| Corridor-elementlijnen | Lijnen met hoogten: as, verhardingsranden, bermen | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Leidingen | Lijnen van de bovenste naar de onderste invert | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procent), `LENGTH`, `NETWORK` |
| Kunstwerken | Punten op de rand | `NAME`, `RIM`, `INVERT` (de laagste leidinginvert daar), `SUMP`, `DIA`, `DIA_UNIT` |
| Elke GIS-laag | Zoals geïmporteerd | Eigen velden |

Lengten, stationeringen en hoogten zijn in de eenheden van het project (US survey feet of meter). Diameters van leidingen en kunstwerken zijn in inches bij projecten in voet en in millimeter bij projecten in meter; `DIA_UNIT` geeft aan welke.

## De formaten

- **Shapefile**: één `.zip` met per soort een shapefile (`.shp`, `.shx`, `.dbf`), een `.cpg` dat zegt dat de tekst UTF-8 is, en een `.prj` met het coördinatenstelsel. Vormen met hoogten worden geschreven als de Z-typen van de shapefile. Veldnamen langer dan 10 tekens worden ingekort, zoals het formaat vereist, en de statusregel somt ze op.
- **GeoPackage**: één `.gpkg`-bestand met per soort een tabel, het coördinatenstelsel opgeslagen met zijn EPSG-code. Eén bestand in plaats van veel, lange veldnamen blijven behouden.
- **KML** of **KMZ** (KML gezipt): één bestand met breedte- en lengtegraad voor Google Earth en webkaarten, een map per soort, elk object een placemark met als naam zijn NAME-veld en alle velden als extended data; hoogten in meter (altitude mode absolute). Net als GeoJSON heeft het het coördinatenstelsel van het project nodig.
- **GeoJSON**: één bestand met breedte- en lengtegraad (de GeoJSON-standaard staat niets anders toe), met bij elk object een eigenschap `kind` (`pipes`, `structures`, …) zodat de ontvanger ze kan splitsen. Hoogten worden omgerekend naar meter, zoals de standaard vraagt; ze blijven op het verticale datum van uw project (CivilCraft heeft geen geoïdemodel). Een project zonder coördinatenstelsel kan geen GeoJSON exporteren, en de dialoog zegt waarom.

## Raster, niet terrein

GIS-afdelingen houden hun gegevens bij in **raster**coördinaten van een coördinatenstelsel. Als uw project terrein- of lokale coördinaten gebruikt (in te stellen via {{ui:Coördinaten}}), wordt elke coördinaat bij de export teruggerekend naar raster: de getallen in de bestanden verschillen van die op het plan met uw schaalfactor (en rotatie, bij een lokaal stelsel). De puntvelden `N` en `E` bevatten ook de rastergetallen. De dialoog herinnert u eraan.

:::tip
Stuur een korte notitie mee met de bestanden: het coördinatenstelsel en zijn EPSG-code, het verticale datum van uw hoogten, de eenheden, en wat elk bestand is.
:::

## Wat is gecontroleerd

- Elk geschreven bestand is teruggelezen met GDAL, de bibliotheek die de meeste GIS-programma's gebruiken om deze bestanden te lezen: elke vorm, hoogte en elk attribuut, de aantallen objecten, en het coördinatenstelsel als EPSG-code (`.prj` en GeoPackage). Onze eigen lezers lezen ze op dezelfde manier terug.
- GeoJSON-bestanden volgen RFC 7946: lengtegraad vóór breedtegraad, geen `crs`-lid, buitenringen tegen de klok in en gaten met de klok mee; posities kwamen binnen 2 mm overeen met PROJ.
- Een project met terreincoördinaten is geëxporteerd en elk punt is gecontroleerd tegen zijn rastercoördinaten.
- Niets hier is nog geopend in andere GIS-programma's. Controleer de eerste levering met de afdeling voordat u erop vertrouwt.
