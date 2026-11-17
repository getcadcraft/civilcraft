---
title: Voer GIS-data in
summary: Haal shapefiles, GeoJSON en GeoPackages in 'n projek in as GIS-lae, plaas hulle deur die regte koördinaatstelsel, kyk na hul eienskappe en gebruik hulle vir die oppervlak.
keywords: gis, etikette, kenmerke etiketteer, eienskappe op die plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, invoer, lae, eienskappe, koördinaatstelsel, epsg, breedtegraad, lengtegraad, kontoere, erwe, breeklyne, grens
from: f6b235cc
---

Stads- en distriks-GIS-departemente gee terreinkonteks as GIS-lêers uit: erwe, serwitute, kontoere, nutsdienste, opmetingsbeheer. CivilCraft open drie soorte daarvan as **GIS-lae** wat onder jou ontwerp op die plan lê.

| Lêer | Wat om oop te maak |
|---|---|
| Shapefile | Die `.shp` saam met sy `.shx`, `.dbf`, `.prj` en `.cpg` (kies almal), of die `.zip` waarin hulle gekom het. 'n Zip wat verskeie shapefiles hou, gee verskeie lae. |
| GeoJSON | Die `.geojson`-lêer ('n `.json`-lêer waarvan die eerste reëls `FeatureCollection` of `Feature` sê, werk ook). |
| GeoPackage | Die `.gpkg`-lêer. Elke kenmerktabel daarin word gelys. |
| KML of KMZ | Die `.kml`-lêer (uit Google Earth of 'n webkaart), of die gesipte `.kmz`. Elke vouer word 'n laag (verdeel in punte, lyne en poligone as dit verskeie soorte bevat); 'n merker se naam, beskrywing en uitgebreide data word sy eienskappe. Hoogtes is in meter en breedte- en lengtegrade, soos in GeoJSON. |

Punte, multipunte, lyne, poligone met gate en veelvoudige-deel-vorms word gelees, met hul hoogtes (z) wanneer die lêer hulle het. Maatwaardes (M) word weggelaat. Hoogterasters en LiDAR open op dieselfde manier: sien [Hoogterasters en LiDAR](topic:elevation-grids-and-lidar).

## Maak die lêers oop

1. Klik {{ui:Voer in}} in die **GIS**-groep (of {{ui:Maak oop}}), kies die lêers, of sleep hulle op die plan. Die lêers word op hierdie rekenaar gelees; niks word opgelaai nie.
2. Die dialoog **Voer GIS-data in** lys elke laag wat gevind is: sy soort, hoeveel kenmerke (en hoeveel sonder geometrie), hoeveel eienskapsvelde, en die koördinaatstelsel wat die lêer noem. Ontmerk die lae wat jy nie wil hê nie.
3. Lees die deel **Koördinaatstelsel** (hieronder) en die reël **Wat sal gebeur**, klik dan {{ui:Voer in}}.
4. Die lae verskyn op die plan en onder **GIS-lae** in die linkerpaneel. Die invoer is een stap: {{key:Mod+Z}} neem dit terug.

Groot lêers wys 'n vorderingslyn oor die plan met 'n {{ui:Kanselleer}}-knoppie.

## Die koördinaatstelsel

GIS-lêers sê waar hulle is deur 'n koördinaatstelsel ('n shapefile se `.prj`, 'n GeoPackage se ruimtelike verwysingstabel; GeoJSON is altyd breedte- en lengtegrade). CivilCraft skakel elke laag van sy eie stelsel na die projek s'n om. Dit raai nooit nie:

- **Die projek het 'n koördinaatstelsel** (ingestel in {{ui:Koördinate}}): elke laag met 'n eie stelsel word daarin omgeskakel, insluitend 'n grond- of plaaslike aanpassing. 'n Lêer sonder `.prj` kry twee keuses: **Dieselfde as die projek** (sy getalle word soos hulle is gelaai) of **Kies die lêer se stelsel**.
- **Die projek het geen, en die lêer is in 'n geprojekteerde stelsel in jou projek se eenhede** (byvoorbeeld 'n staatsvlakte-sone in VS-opmetingsvoet vir 'n voetprojek): die dialoog bied **Gebruik daardie stelsel as die projek se koördinaatstelsel** aan. Dit word in dieselfde ontdoen-stap as die invoer ingestel. Niks in die projek beweeg nie; die stelsel sê net wat die getalle beteken. Jy kan eerder 'n ander stelsel vir die projek kies, en die lae word daarin omgeskakel.
- **Die projek het geen, en die lêer is in breedte- en lengtegrade** (elke GeoJSON) **of in ander eenhede**: {{ui:Voer in}} bly grys totdat jy die projek se koördinaatstelsel kies. Die kieser begin naby die data.
- **Nie die projek nie, en ook nie die lêers nie, noem 'n stelsel**: die getalle word soos hulle is gelaai, en die dialoog sê so.

Hoogtes word ook omgeskakel: GeoJSON-hoogtes is meter (die GeoJSON-standaard sê so); ander lêers se hoogtes word in die eenheid van hul eie stelsel geneem.

:::warning
Posisies in 'n GeoJSON-lêer buite ±180° lengtegraad of ±90° breedtegraad is nie breedte- en lengtegrade nie. Daardie kenmerke word weggelaat en die dialoog sê hoeveel. So 'n lêer is gewoonlik 'n geprojekteerde lêer wat sonder sy stelsel gestoor is; vra weer daarvoor, of vir die shapefile met sy `.prj`.
:::

NAD83 word as dieselfde as WGS 84 behandel (die stelsel wat GeoJSON gebruik); die twee verskil met 'n paar meter in Noord-Amerika, so GeoJSON-data kan so ver af wees. Waar die beste verskuiwing 'n roosterlêer nodig het (NADCON vir NAD27, byvoorbeeld), gebruik CivilCraft 'n growwer gepubliseerde verskuiwing, en wys die koördinaatstelsel-dialoog hoe grof (vir NAD27, ongeveer 20 m), totdat jy die rooster byvoeg: sien [Roosterverskuiwingslêers](topic:coordinate-systems).

## GIS-lae

Elke ry onder **GIS-lae** het:

- 'n merkblokkie om die laag te wys of te verberg (verborge lae word ook nie gekies nie);
- sy kleur, gekies uit die lys;
- 'n kieslys (die drie kolletjies) met {{ui:Zoem na}}, {{ui:Gebruik vir die oppervlak…}}, {{ui:Hernoem…}} en {{ui:Verwyder}}.

Wys, verberg, herkleur, hernoem en verwyder is ontdoen-stappe. GIS-lae word in die projeklêer gestoor en kom terug wanneer jy dit oopmaak. Hulle gaan ook saam met die plan se PDF-plot en sy DXF- en DWG-uitvoere, elk op 'n laag wat `GIS-` en sy nommer heet.

## Etiketteer kenmerke uit 'n eienskap

In die laag se {{ui:Meer}}-kieslys (die drie kolletjies in **GIS-lae**), kies 'n veld onder **Etiketteer met**: elke kenmerk wys sy waarde op die plan, in die laag se kleur. Punte word langs die punt geëtiketteer, lyne langs die middel van hul langste deel (gedraai om van links na regs te lees), poligone by hul middelpunt. Getalle wys tot drie desimale. Etikette is op papier 1.8 mm hoog by enige skaal, en hulle gaan in die PDF-plot, DXF en DWG. Kies **Geen etikette** om hulle te verwyder; elke verandering is een stap ({{key:Mod+Z}} keer dit terug). 'n Laag etiketteer hoogstens 5,000 kenmerke.

## Kyk na 'n kenmerk

Met {{ui:Kies}} aan, klik 'n kenmerk. **Eienskappe** wys sy laag, watter kenmerk dit is, sy vorm (dele, gate, hoekpunte), sy hoogtes, die lêer waarvandaan dit kom en daardie lêer se koördinaatstelsel, dan elke eienskap in 'n tabel. Eienskappe is alleen-lees: CivilCraft wys GIS-data soos dit gekom het, dit redigeer dit nie.

Punte wen bo lyne wanneer albei onder die wyser is; binne 'n poligoon word die kleinste poligoon gekies.

## Gebruik vir die oppervlak

Maak 'n laag se kieslys oop en kies {{ui:Gebruik vir die oppervlak…}} (of die knoppie in **Eienskappe**). Wat aangebied word, hang van die laag af:

| Laag | Kan word |
|---|---|
| Lyne met hoogtes (3D-lyne) | Breeklyne op hul eie hoogtes |
| Lyne sonder hoogtes maar met 'n getalveld (kontoere) | Breeklyne op die hoogte in die veld wat jy kies |
| Poligone | Die oppervlakgrens (die gekose poligoon, anders die grootste), of breeklyne langs hul rande |
| Punte met hoogtes, of met 'n hoogteveld | Opmetingspunte, beskryf met die laag se naam sodat hulle 'n puntgroep vorm |

Elke gebruik is een ontdoen-stap wat die geometrie in die projek kopieer; die laag self bly soos dit is. Hoogtes word in projekeenhede geneem.

## Puntlêers met breedte- en lengtegrade

'n Puntlêer waarvan die kop **breedtegraad**- en **lengtegraad**-kolomme noem (`lat`, `latitude`, `lon`, `long`, `longitude`), word as grade gelees, nie as noordelike en oostelike koördinate nie. Die invoerdialoog sê so. Op {{ui:Voer in}} word die punte na die projek se koördinaatstelsel omgeskakel; 'n projek sonder een vra jou eers om dit te kies. Grade word nooit as voet gelaai nie. Rye buite ±90° breedtegraad of ±180° lengtegraad word geweier, met die rede. Die hoogtekolom word soos dit is geneem, in projekeenhede.

## LandXML-lêers wat 'n koördinaatstelsel noem

Wanneer 'n LandXML-lêer wat jy oopmaak 'n `CoordinateSystem`-element het ('n EPSG-kode, 'n WKT-beskrywing of 'n stelselnaam), bied CivilCraft dit as die projek se koördinaatstelsel aan. Niks beweeg as jy aanvaar nie; die stelsel sê net wat die getalle beteken.

## Wat is nagegaan

- Elke leser is met GDAL vergelyk, die biblioteek wat die meeste GIS-programme gebruik om hierdie lêers te lees, op lêers wat GDAL geskryf het: shapefiles van elke soort met en sonder hoogtes, veelvoudige-deel-lyne, poligone met gate, leë geometrieë, teks-, getal-, datum- en waar/onwaar-eienskappe, UTF-8- en Windows-1252-teks met en sonder 'n `.cpg`, 'n zip van verskeie shapefiles, GeoJSON met elke geometrietipe, en 'n GeoPackage met vier tabelle. Elke geometrie, hoogte en eienskap het ooreengestem.
- Posisies wat uit breedte- en lengtegrade en uit UTM omgeskakel is, het by PROJ (die projeksiebiblioteek agter GDAL) ooreengestem tot 3 mm.
- Beskadigde lêers (afgekap, groottes wat lieg, swak zips, swak GeoPackages) gee een gewone boodskap; niks hang nie.
- Niks hiervan is nog in ander GIS-programme oopgemaak nie, en lêerdatabasisse, KML en KMZ word nog nie gelees nie (sien [Nog nie gebou nie](topic:not-built-yet)).
