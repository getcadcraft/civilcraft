---
title: Hoogtegriewe en LiDAR
summary: Bou die bestaande grond uit 'n DEM (GeoTIFF of ASCII grid) of LiDAR-punte (LAS, LAZ) — kies die gebied, dun die data uit, kies klasse en kontroleer die hoogte-eenhede — en gee 'n oppervlak terug as 'n GeoTIFF-hoogtegrid.
keywords: dem, dtm, hoogtegrid, geotiff, tif, ascii grid, asc, lidar, las, laz, puntwolk, klasse, grond, uitdunning, nodata, raster, uitvoer geotiff, gis
from: c8b2d18a
---

Openbare hoogtedata kom op twee maniere: **hoogtegriewe** ('n DEM: een hoogte per vierkantige sel, gewoonlik 'n GeoTIFF `.tif` of 'n ASCII grid `.asc`) en **LiDAR-punte** (miljoene laserterugkeeringe in 'n `.las`-lêer, of `.laz` wanneer dit saamgepers is). CivilCraft maak albei in die blaaier om in opmetingspunte of 'n oppervlak: niks word opgelaai nie.

## Maak die lêer oop

1. Klik {{ui:Maak oop}} (of {{ui:Voer in}} in die GIS-groep) en kies die lêer, of sleep dit op die plan. Vir 'n ASCII grid kies sy `.prj`-lêer ook, sodat CivilCraft sy koördinaatstelsel ken.
2. Die invoerdialoog wys wat die lêer oor homself sê: sy grootte, selle of punte, sy koördinaatstelsel, waar dit in breedte- en lengtegraad is, en sy hoogtereeks. Vir LiDAR lees dit eers elke punt een keer om die **klasse** te tel ('n vorderingsbalk wys hoe ver dit is; {{ui:Kanselleer}} stop dit).

'n GeoTIFF met drie of vier bande (rooi, groen, blou) is 'n prent, nie hoogtes nie: dit gaan na die kaartlae toe.

## Kies wat ingebring word

- **Gebied**: {{ui:Die projek se omvang en 'n rand}} (tik die rand), {{ui:Wat die plan nou wys}}, of {{ui:Die hele lêer}}. Slegs daardie deel van die lêer word gelees.
- **Dun uit tot**: die spasiëring tussen die punte wat jy kry, in die projek se eenhede. Die lyn onder die instellings wys hoeveel punte dit gee soos jy tik. Vir 'n raster hou CivilCraft elke tweede, derde … sel, sodat die hoogtes presies die lêer s'n bly; dit tel nooit selle saam nie. Vir LiDAR word die gebied in vierkante van daardie grootte gesny en een punt per vierkant behou: {{ui:Die punt naaste aan elke sel se middelpunt}} (die verstek), {{ui:Die laagste punt in elke sel}} (goed wanneer die lêer geen grondklas het nie: die grond is onder die bome) of {{ui:Die gemiddelde van elke sel se punte}}.
- **Klasse** (LiDAR): grond (klas 2) is afgemerk wanneer die lêer dit het; geboue, bome en geraas word uitgelaat. Wanneer daar geen grondklas is nie, is elke klas afgemerk, en die dialoog sê so.
- **Grond** (LiDAR, 0.8): 'n dronewolk het geen grondklas nie. Wanneer die lêer geen het nie, begin die dialoog op {{ui:Vind self die grond (dronewolke, geen grondklas nie)}}: elke klas behalwe geraas word gelees, die laagste punt in elke sel word behou, en dan haal CivilCraft geboue, bome en los lae punte uit met 'n progressiewe morfologiese filter (Zhang en andere, 2003) wat jy kan stuur: **Grootste voorwerp om uit te haal** (die breedte van die grootste gebou; vensters groei totdat hulle dit bedek; 0 beteken 20 selle) en **Steilste grondhelling**. Die werk word op die raster van laagste punte gedoen, so 'n wolk van tiene miljoene punte kos niks meer as sy seltelling nie (die uitdunning is een stroom-deurgang). Spasiëring is die sel: 'n growwer een is vinniger en mis klein voorwerpe minder as wat jy dink, 'n fyner een behou meer grondbesonderhede. Die verslag sê hoeveel punte as grond behou is, hoeveel selle as voorwerpe uitgehaal is en hoeveel los lae punte laat val is. Op 'n gemaakte 300 m-dronemeting met vyf geboue, 70 bome en 200 lae uitskieters was die behoue punte binne 3 cm van die ware terrein en is geen dak of boomkroon behou nie.
- **Hoogtes in die lêer**: meter, voet of Amerikaanse opmetingsvoet. Wanneer die lêer dit sê, is sy eenheid reeds gekies. Wanneer dit nie sê nie, moet jy kies: die dialoog wys die hoogtereeks albei kante toe sodat jy kan sien watter een by die terrein pas.
- **Invoer as** (slegs rasters): {{ui:Opmetingspunte (beskrywing DEM)}}, of {{ui:Die oppervlak self (’n raster van driehoeke)}}.

'n Enkele invoer neem hoogstens 500,000 punte. Wanneer 'n keuse meer sou gee, sê die dialoog met hoeveel, en watter spasiëring sou pas, en {{ui:Voer in}} bly af.

Klik {{ui:Voer in}}. 'n Vorderingsbalk wys die lees; {{ui:Kanselleer}} stop dit en niks verander nie.

:::warning
Vertikale eenhede is 'n algemene slaggat. Baie staatsvlak-DEM's het ooste en noorde in voet maar hoogtes in meter. Kontroleer die reeks wat die dialoog wys teen wat jy van die terrein weet.
:::

## Wat jy kry

- **Opmetingspunte**: genommer na jou hoogste puntnommer, met die beskrywing `DEM` (rasters) of `LIDAR`, sodat hulle een puntgroep onder **Punte** vorm en 'n oppervlak bou soos enige ander punte. Om hulle in te voer is een stap: {{key:Mod+Z}} haal hulle weer uit.
- **Die oppervlak self**: 'n raster-TIN, twee driehoeke per sel, verdeel op die suidwes-na-noordooste-diagonaal. 'n Driehoek met 'n hoek sonder data word uitgelaat, so gate in die data bly gate. Die oppervlak is gelyk aan die raster op elke rasterpunt en is 'n plat vlak binne elke driehoek daartussen. Dit vervang die projek se oppervlak (die dialoog vra eers); {{key:Mod+Z}} bring die vorige oppervlak terug. Die linkerpaneel se opskrif sê **Oppervlak (uit 'n hoogtegrid)**.

## Koördinaatstelsels

- As die projek 'n koördinaatstelsel het en die lêer 'n ander noem, word elke punt na die projek se stelsel omgeskakel (en na sy grond- of plaaslike koördinate wanneer hy hulle het).
- As die projek geen het nie en die lêer se stelsel in die projek se eenhede is (voet of meter), bied die dialoog aan om dit die projek se koördinaatstelsel te maak, in dieselfde ongedaanmaak-stap as die punte.
- As die lêer in breedte- en lengtegraad is, of in meter vir 'n voet-projek, vra die dialoog jou om eers die projek se koördinaatstelsel te kies.
- As die lêer dit nie sê nie, word sy getalle as die projek se koördinate geneem. Jy kan die lêer se stelsel kies in plaas daarvan.

## Voer 'n oppervlak as 'n GeoTIFF uit

1. Klik {{ui:Uitvoer}} in die GIS-groep.
2. Kies in die GeoTIFF-deel die oppervlak (bestaande grond of die gegradeerde oppervlak) en die selgrootte. Die verstek kom van die oppervlak se gemiddelde driehoekrand. Die dialoog wys die grootte van die raster wat dit gaan skryf.
3. Klik {{ui:Laai GeoTIFF af}}.

Die lêer is een band van 32-bis drywendekommagetal-hoogtes in die projek se eenhede, oor die oppervlak se omvang; selle buite die oppervlak is "geen data" (−3.4028235e38). Elke sel se waarde is die oppervlak se hoogte by die sel se middelpunt. Koördinate is **raster**-koördinate: 'n projek in grond- of plaaslike koördinate word terug na die raster omgeskakel. Die lêer noem die projek se koördinaatstelsel met sy EPSG-kode; 'n stelsel sonder 'n EPSG-kode word nie geskryf nie, en die dialoog waarsku jou om vir die GIS-departement te sê watter stelsel dit is.

## Wat is nagegaan

- Die GeoTIFF- en ASCII grid-lesers is nagegaan teen GDAL (deur rasterio), die biblioteek wat die meeste GIS-programme gebruik om hierdie lêers te lees: 32-bis en 16-bis heelgetal-rasters, betegel en in strepe, DEFLATE en LZW, nodata, skaal en verskuiwing, pixel-is-point, 'n UTM-raster, 'n staatsvlakraster in Amerikaanse opmetingsvoet en 'n breedte- en lengtegraad-raster — elke waarde gelyk.
- Die LAS- en LAZ-lesers is nagegaan teen laspy: LAS 1.2 en 1.4, puntformate 0, 1, 3, 6, 7 en 8, met en sonder 'n koördinaatstelsel, en LAZ geskryf deur sy LASzip-versoenbare agtergrond — elke punt gelyk.
- Omgeskakelde koördinate is teen PROJ nagegaan tot 1 mm.
- Uitgevoerde GeoTIFF's is deur GDAL teruggelees: koördinaatstelsel, selposisies, nodata, eenhede, en waardes gelyk aan die oppervlak tot 0.0001.
- Niks hier is in ander GIS- of CAD-programme oopgemaak nie.

## Nog nie gebou nie

- Veranderinge in vertikale datum (geoïde-modelle): hoogtes word gebruik soos die lêer dit het.
- Golfvormdata, LiDAR-terugkeerwaardes anders as volgens klas, kleure en intensiteite.
- Verskeie bande, oorsigte, of lêers van meer as 200 MB.
- Skryf van LAS of LAZ vanaf 'n oppervlak of vanaf hierdie hulpmiddel (die [Puntwolke](topic:point-clouds)-byvoeging skryf 'n opgeskoonde wolk as LAS 1.4 of LAZ).
