---
title: Voer as-gebou-data vir GIS uit
summary: Lewer opnamepunte, kontoere, belynings, terreine, dagligtelyne, pype en strukture aan 'n stad of distrik se GIS-departement as shapefiles, GeoPackage, GeoJSON of KML, in roosterkoördinate van die projek se koördinaatstelsel.
keywords: gis, uitvoer, kml, kmz, google earth, as-gebou, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, pype, strukture, nutsdienste, stad, distrik, rooster, grond, epsg, prj
from: bba4fea5
---

Baie stede en distrikte vra vir as-gebou-data in 'n GIS-formaat wanneer 'n projek afsluit: waar die pype en strukture gaan het, finale gradiënte, die padsentrumlyn. **GIS › Uitvoer** skryf wat CivilCraft hou as GIS-lae, een vir elke soort voorwerp.

## Voor jy uitvoer

1. Stel die projek se koördinaatstelsel in {{ui:Koördinate}}. 'n GIS-departement moet weet waar die getalle is; sonder 'n stelsel dra die lêers die projek se eie getalle en noem geen stelsel nie.
2. Gaan die oppervlak, belynings, terreine en pypnetwerk na soos jy dit gelewer wil hê.
3. Vra die departement watter formaat en watter koördinaatstelsel hulle wil hê. Baie vra steeds vir shapefiles in die plaaslike staatsvlakte-sone; nuwer stelsels neem GeoPackage.

## Uitvoer

1. Klik {{ui:Uitvoer}} in die **GIS**-groep.
2. Onder **Wat** merk die soorte aan om te stuur. Elk wys hoeveel kenmerke dit het; soorte met niks nog is grys.
3. Onder **As** kies die formaat.
4. Lees die notas oor koördinate en eenhede, klik dan die aflaaiknoppie. Die statuslyn sê wat ingegaan het, en watter veldname verkort is.

Die dialoog bevat ook die hoogterasteruitvoer ({{ui:Oppervlak as 'n GeoTIFF-hoogteraster}}); sien [Hoogterasters en LiDAR](topic:elevation-grids-and-lidar).

## Wat elke soort bevat

| Soort | Vorm | Velde |
|---|---|---|
| Opnamepunte | Punte met hoogte | `P` puntnommer, `N` noordelike, `E` oostelike, `Z` hoogte, `D` beskrywing |
| Kontoere van bestaande grond, van die gegradeerde oppervlak | Lyne op hul hoogte | `ELEV` |
| Breeklyne | Lyne met hoogtes | `NAME` |
| Oppervlakgrens | Poligoon (die getekende grens, anders die oppervlak se rand) | `NAME` |
| Belynings | Sentrumlyne | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stasies as gewone getalle) |
| Terreine | Poligone op die terreinhoogte | `NAME`, `ELEV`, `AREA` |
| Dagligtelyne | Lyne met hoogtes (terreine en koridors) | `NAME` |
| Koridor-kenmerklyne | Lyne met hoogtes: senter, rande van plaveisel, skouers | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Pype | Lyne van die boonste na die onderste binnevlak | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (persent), `LENGTH`, `NETWORK` |
| Strukture | Punte by die rand | `NAME`, `RIM`, `INVERT` (die laagste pyp-binnevlak daar), `SUMP`, `DIA`, `DIA_UNIT` |
| Elke GIS-laag | Soos ingevoer | Sy eie velde |

Lengtes, stasies en hoogtes is in die projek se eenhede (VS-opmetingsvoet of meter). Pyp- en struktuurdeursnee is in duim vir voetprojekte en millimeter vir meterprojekte; `DIA_UNIT` sê watter een.

## Die formate

- **Shapefile**: een `.zip` met 'n shapefile per soort (`.shp`, `.shx`, `.dbf`), 'n `.cpg` wat sê die teks is UTF-8, en 'n `.prj` wat die koördinaatstelsel noem. Vorms met hoogtes word as die shapefile se Z-tipes geskryf. Veldnaam langer as 10 karakters word verkort, soos die formaat vereis, en die statuslyn lys hulle.
- **GeoPackage**: een `.gpkg`-lêer met 'n tabel per soort, die koördinaatstelsel gestoor met sy EPSG-kode. Een lêer in plaas van baie, lang veldname behou.
- **KML** of **KMZ** (KML gesipt): een lêer van breedte- en lengtegrade vir Google Earth en webkaarte, 'n vouer per soort, elke kenmerk 'n merker wat met sy NAME-veld benoem word, met elke veld as uitgebreide data; hoogtes in meter (hoogtemodus absoluut). Soos GeoJSON het dit die projek se koördinaatstelsel nodig.
- **GeoJSON**: een lêer van breedte- en lengtegrade (die GeoJSON-standaard laat niks anders toe nie), met elke kenmerk wat 'n `kind`-eienskap dra (`pipes`, `structures`, …) sodat die ontvanger hulle kan skei. Hoogtes word na meter omgeskakel, soos die standaard vra; hulle bly op jou projek se vertikale datum (CivilCraft het geen geoïed-model nie). 'n Projek sonder koördinaatstelsel kan nie na GeoJSON uitvoer nie, en die dialoog sê hoekom.

## Rooster, nie grond nie

GIS-departemente hou hul data in **rooster**-koördinate van 'n koördinaatstelsel. As jou projek grond- of plaaslike koördinate gebruik (ingestel in {{ui:Koördinate}}), word elke koördinaat op pad uit terug na rooster omgeskakel: die getalle in die lêers verskil van die plan se met jou skaalfaktor (en rotasie, vir 'n plaaslike stelsel). Die puntvelde `N` en `E` hou ook die roosterwaardes. Die dialoog herinner jou daaraan.

:::tip
Stuur 'n kort nota saam met die lêers: die koördinaatstelsel en sy EPSG-kode, die vertikale datum van jou hoogtes, die eenhede, en wat elke lêer is.
:::

## Wat is nagegaan

- Elke lêer wat geskryf is, is deur GDAL, die biblioteek wat die meeste GIS-programme gebruik om hierdie lêers te lees, weer gelees: elke vorm, hoogte en eienskap, die kenmerktellings, en die koördinaatstelsel as sy EPSG-kode (`.prj` en GeoPackage). Ons eie lesers lees hulle ook dieselfde terug.
- GeoJSON-lêers volg RFC 7946: lengtegraad voor breedtegraad, geen `crs`-lid nie, buitenringe antikloksgewys en gate kloksgewys; posisies het by 2 mm met PROJ ooreengestem.
- 'n Grondkoördinaatprojek is uitgevoer en elke punt is teen sy roosterkoördinate nagegaan.
- Niks hiervan is nog in ander GIS-programme oopgemaak nie. Gaan die eerste lewering met die departement na voordat jy daarop staatmaak.
