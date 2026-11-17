---
title: Izvezi podatke o izvedenom stanju za GIS
summary: Predajte geodetske točke, izohipse, osi trasa, platoe, cijevi i građevine gradskom ili županijskom GIS odjelu kao shapefile, GeoPackage, GeoJSON ili KML, u mrežnim koordinatama koordinatnog sustava projekta.
keywords: gis, izvoz, kml, kmz, google earth, izvedeno stanje, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, cijevi, građevine, komunalne instalacije, grad, županija, mreža, teren, epsg, prj
from: bba4fea5
---

Mnogi gradovi i županije traže podatke o izvedenom stanju u GIS formatu pri zatvaranju projekta: gdje su cijevi i građevine, konačni nagibi, os ceste. **GIS › Izvoz** zapisuje ono što CivilCraft ima kao GIS slojeve, po jedan za svaku vrstu objekta.

## Prije izvoza

1. Postavite koordinatni sustav projekta u {{ui:Koordinate}}. GIS odjelu treba znati gdje su brojevi; bez sustava datoteke nose vlastite brojeve projekta i ne navode nijedan.
2. Provjerite teren, osi trasa, plato i mrežu cijevi onako kako ih želite predati.
3. Pitajte odjel koji format i koji koordinatni sustav žele. Mnogi još traže shapefile u lokalnoj zoni državne ravnine; noviji sustavi prihvaćaju GeoPackage.

## Izvoz

1. Kliknite {{ui:Izvoz}} u grupi **GIS**.
2. Pod **Što**, označite vrste za slanje. Svaka pokazuje koliko značajki ima; vrste bez ičega su zasivljene.
3. Pod **Kao**, odaberite format.
4. Pročitajte napomene o koordinatama i jedinicama, zatim kliknite gumb za preuzimanje. Statusna linija kaže što je otišlo i koja su imena polja skraćena.

Dijalog sadrži i izvoz mreže visina ({{ui:Teren kao GeoTIFF visinska mreža}}); vidi [Visinske mreže i LiDAR](topic:elevation-grids-and-lidar).

## Što sadrži svaka vrsta

| Vrsta | Oblik | Polja |
|---|---|---|
| Geodetske točke | Točke s visinom | `P` broj točke, `N` sjever, `E` istok, `Z` visina, `D` opis |
| Izohipse postojećeg terena, izohipse projektiranog terena | Linije na svojoj visini | `ELEV` |
| Prijelomnice | Linije s visinama | `NAME` |
| Granica terena | Poligon (nacrtana granica, inače rub terena) | `NAME` |
| Osi trasa | Osi | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stacionaže kao obični brojevi) |
| Plato | Poligoni na visini platoa | `NAME`, `ELEV`, `AREA` |
| Linije nožice pokosa | Linije s visinama (platoi i koridori) | `NAME` |
| Značajne linije koridora | Linije s visinama: os, rubovi kolnika, bankine | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Cijevi | Linije od gornjeg do donjeg dna cijevi | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (postotak), `LENGTH`, `NETWORK` |
| Građevine | Točke na rubu poklopca | `NAME`, `RIM`, `INVERT` (najniže dno cijevi tamo), `SUMP`, `DIA`, `DIA_UNIT` |
| Svaki GIS sloj | Kako je uvezen | Njegova vlastita polja |

Duljine, stacionaže i visine su u jedinicama projekta (američke geodetske stope ili metri). Promjeri cijevi i građevina su u palcima za projekte u stopama, a u milimetrima za projekte u metrima; `DIA_UNIT` kaže koji je.

## Formati

- **Shapefile**: jedan `.zip` sa shapefileom za svaku vrstu (`.shp`, `.shx`, `.dbf`), datoteka `.cpg` koja kaže da je tekst UTF-8, i `.prj` koji navodi koordinatni sustav. Oblici s visinama zapisuju se kao Z tipovi shapefilea. Nazivi polja duži od 10 znakova se skraćuju, kako format traži, a statusna linija ih navodi.
- **GeoPackage**: jedna datoteka `.gpkg` s tablicom za svaku vrstu, a koordinatni sustav pohranjen je s EPSG kodom. Jedna datoteka umjesto mnogih, dugi nazivi polja se čuvaju.
- **KML** ili **KMZ** (KML spakiran u zip): jedna datoteka sa zemljopisnom širinom i dužinom za Google Earth i web karte, mapa za svaku vrstu, a svaka značajka je oznaka (placemark) imenovana iz polja NAME sa svim poljima kao proširenim podacima; visine su u metrima (način visine apsolutni). Kao i GeoJSON, treba koordinatni sustav projekta.
- **GeoJSON**: jedna datoteka sa zemljopisnom širinom i dužinom (GeoJSON standard ne dopušta ništa drugo), a svaka značajka nosi svojstvo `kind` (`pipes`, `structures`, …) da ih primatelj može razdvojiti. Visine se pretvaraju u metre, kako standard traži; ostaju na vertikalnom datumu vašeg projekta (CivilCraft nema model geoida). Projekt bez koordinatnog sustava ne može izvesti GeoJSON, a dijalog kaže zašto.

## Mreža, a ne teren

GIS odjeli čuvaju podatke u **mrežnim** koordinatama koordinatnog sustava. Ako vaš projekt koristi koordinate tla ili lokalne (postavljene u {{ui:Koordinate}}), svaka se koordinata pri izlasku pretvara natrag u mrežnu: brojevi u datotekama razlikuju se od onih na tlocrtu za vaš faktor mjerila (i rotaciju, za lokalni sustav). Točkovna polja `N` i `E` također sadrže mrežne vrijednosti. Dijalog vas na to podsjeća.

:::tip
Uz datoteke pošaljite kratku napomenu: koordinatni sustav i njegov EPSG kod, vertikalni datum vaših visina, jedinice i što je svaka datoteka.
:::

## Što je provjereno

- Svaka napisana datoteka pročitana je natrag GDAL-om, bibliotekom koju koristi većina GIS programa: svaki oblik, visina i atribut, brojevi značajki te koordinatni sustav kao EPSG kod (`.prj` i GeoPackage). Naši vlastiti čitači čitaju ih jednako.
- GeoJSON datoteke slijede RFC 7946: zemljopisna dužina prije širine, bez člana `crs`, vanjski prstenovi suprotno od kazaljke na satu, a rupe u smjeru kazaljke; položaji se podudaraju s PROJ-om do 2 mm.
- Projekt s koordinatama tla izvezen je i svaka točka provjerena je prema njezinim mrežnim koordinatama.
- Ništa ovdje još nije otvoreno u drugim GIS programima. Prvu isporuku provjerite s odjelom prije nego se oslonite na nju.
