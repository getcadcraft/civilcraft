---
title: Exportul datelor as-built pentru GIS
summary: Predați punctele de măsurătoare, curbele de nivel, aliniamentele, platformele, conductele și structurile unui departament GIS al orașului sau județului, ca shapefile, GeoPackage, GeoJSON sau KML, în coordonatele grid ale sistemului de coordonate al proiectului.
keywords: gis, export, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, conducte, structuri, utilități, oraș, județ, grid, teren, epsg, prj
from: bba4fea5
---

Multe orașe și județe cer date as-built într-un format GIS la închiderea unui proiect: unde au ajuns conductele și structurile, cotele finale, axul drumului. **GIS › Export** scrie ce păstrează CivilCraft ca straturi GIS, câte unul pentru fiecare tip de obiect.

## Înainte de export

1. Setați sistemul de coordonate al proiectului în {{ui:Coordonate}}. Un departament GIS trebuie să știe unde sunt numerele; fără un sistem, fișierele poartă numerele proiectului și nu numesc niciun sistem.
2. Verificați modelul de teren, aliniamentele, platformele și rețeaua de conducte așa cum vreți să fie predate.
3. Întrebați departamentul ce format și ce sistem de coordonate doresc. Mulți cer încă shapefile în zona locală State Plane; sistemele mai noi acceptă GeoPackage.

## Export

1. Faceți clic pe {{ui:Export}} în grupul **GIS**.
2. La **Ce**, bifați tipurile de trimis. Fiecare arată câte elemente are; tipurile fără nimic încă sunt estompate.
3. La **Ca**, alegeți formatul.
4. Citiți notele despre coordonate și unități, apoi faceți clic pe butonul de descărcare. Linia de stare spune ce a intrat și ce nume de câmpuri au fost scurtate.

Caseta de dialog conține și exportul grilei de cote ({{ui:Model de teren ca grilă de cote GeoTIFF}}); vezi [Grilele de cote și LiDAR](topic:elevation-grids-and-lidar).

## Ce conține fiecare tip

| Tip | Formă | Câmpuri |
|---|---|---|
| Puncte de măsurătoare | Puncte cu cotă | `P` numărul punctului, `N` nord, `E` est, `Z` cota, `D` descrierea |
| Curbe de nivel ale terenului existent, ale suprafeței sistematizate | Linii la cota lor | `ELEV` |
| Linii de rupere | Linii cu cote | `NAME` |
| Limita suprafeței | Poligon (limita desenată, altfel marginea suprafeței) | `NAME` |
| Aliniamente | Axe | `NAME`, `LENGTH`, `STA_START`, `STA_END` (pichetele ca numere simple) |
| Platforme | Poligoane la cota platformei | `NAME`, `ELEV`, `AREA` |
| Linii de intersecție cu terenul | Linii cu cote (platforme și coridoare) | `NAME` |
| Linii caracteristice ale coridorului | Linii cu cote: axul, marginile carosabilului, acostamentele | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Conducte | Linii de la radierul superior la cel inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procente), `LENGTH`, `NETWORK` |
| Structuri | Puncte la cota capacului | `NAME`, `RIM` (cota capacului), `INVERT` (cel mai coborât radier de conductă de acolo), `SUMP`, `DIA`, `DIA_UNIT` |
| Fiecare strat GIS | Ca importat | Propriile câmpuri |

Lungimile, pichetele și cotele sunt în unitățile proiectului (picioare US survey sau metri). Diametrele conductelor și structurilor sunt în inci pentru proiectele în picioare și în milimetri pentru cele în metri; `DIA_UNIT` spune care.

## Formatele

- **Shapefile**: un `.zip` cu un shapefile pentru fiecare tip (`.shp`, `.shx`, `.dbf`), un `.cpg` care spune că textul este UTF-8 și un `.prj` care numește sistemul de coordonate. Formele cu cote sunt scrise ca tipuri Z ale shapefile. Numele de câmpuri mai lungi de 10 caractere sunt scurtate, cum cere formatul, iar linia de stare le listează.
- **GeoPackage**: un fișier `.gpkg` cu un tabel pentru fiecare tip, sistemul de coordonate stocat cu codul său EPSG. Un singur fișier în loc de mai multe, cu numele lungi ale câmpurilor păstrate.
- **KML** sau **KMZ** (KML arhivat): un fișier cu latitudine și longitudine pentru Google Earth și hărțile web, câte un dosar pentru fiecare tip, fiecare element un marcaj numit după câmpul NAME, cu toate câmpurile ca date extinse; înălțimile în metri (mod de altitudine absolut). Ca GeoJSON, are nevoie de sistemul de coordonate al proiectului.
- **GeoJSON**: un fișier cu latitudine și longitudine (standardul GeoJSON nu permite altceva), în care fiecare element are o proprietate `kind` (`pipes`, `structures`, …), ca destinatarul să le poată separa. Înălțimile sunt convertite în metri, cum cere standardul; rămân în datumul vertical al proiectului (CivilCraft nu are model de geoid). Un proiect fără sistem de coordonate nu poate exporta GeoJSON, iar caseta de dialog spune de ce.

## Grid, nu teren

Departamentele GIS își țin datele în coordonate **grid** ale unui sistem de coordonate. Dacă proiectul folosește coordonate de teren sau locale (setate în {{ui:Coordonate}}), fiecare coordonată este convertită înapoi în grid la ieșire: numerele din fișiere diferă de cele din plan cu factorul de scară (și cu rotația, pentru un sistem local). Câmpurile punctelor `N` și `E` conțin și ele valorile grid. Caseta de dialog vă reamintește asta.

:::tip
Trimiteți o notă scurtă împreună cu fișierele: sistemul de coordonate și codul său EPSG, datumul vertical al cotelor, unitățile și ce conține fiecare fișier.
:::

## Ce a fost verificat

- Fiecare fișier scris a fost citit înapoi cu GDAL, biblioteca pe care o folosesc majoritatea programelor GIS pentru a citi aceste fișiere: fiecare formă, cotă și atribut, numărul elementelor și sistemul de coordonate ca cod EPSG (`.prj` și GeoPackage). Propriile noastre citiri le-au citit la fel.
- Fișierele GeoJSON urmează RFC 7946: longitudinea înaintea latitudinii, fără membrul `crs`, inelele exterioare în sens antiorar și găurile în sens orar; pozițiile au corespuns PROJ până la 2 mm.
- Un proiect cu coordonate de teren a fost exportat, iar fiecare punct a fost verificat față de coordonatele sale grid.
- Nimic de aici nu a fost deschis încă în alte programe GIS. Verificați prima livrare cu departamentul înainte de a vă baza pe ea.
