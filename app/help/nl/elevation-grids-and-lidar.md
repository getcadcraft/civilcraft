---
title: Hoogterasters en LiDAR
summary: Bouw het bestaande maaiveld uit een DEM (GeoTIFF of ASCII-raster) of LiDAR-punten (LAS, LAZ) — kies het gebied, verdun de data, kies klassen en controleer de hoogte-eenheden — en lever een terrein terug als GeoTIFF-hoogteraster.
keywords: dem, dtm, hoogteraster, geotiff, tif, ascii-raster, asc, lidar, las, laz, puntenwolk, klassen, maaiveld, verdunnen, nodata, raster, geotiff exporteren, gis
from: c8b2d18a
---

Openbare hoogtedata komt op twee manieren: **hoogterasters** (een DEM: één hoogte per vierkante cel, meestal een GeoTIFF `.tif` of een ASCII-raster `.asc`) en **LiDAR-punten** (miljoenen laserreflecties in een `.las`-bestand, of `.laz` wanneer gecomprimeerd). CivilCraft zet beide om in meetpunten of een terrein, in de browser: er wordt niets geüpload.

## Het bestand openen

1. Klik op {{ui:Openen}} (of {{ui:Importeren}} in de groep GIS) en kies het bestand, of sleep het op het plan. Voor een ASCII-raster kiest u ook het `.prj`-bestand, zodat CivilCraft het coördinatenstelsel kent.
2. Het importvenster toont wat het bestand over zichzelf zegt: de grootte, cellen of punten, het coördinatenstelsel, de positie in breedte- en lengtegraad, en het hoogtebereik. Bij LiDAR leest het eerst elk punt één keer om de **klassen** te tellen (een voortgangsbalk laat zien hoe ver het is; met {{ui:Annuleren}} stopt u het).

Een GeoTIFF met drie of vier banden (rood, groen, blauw) is een afbeelding, geen hoogtedata: die gaat in plaats daarvan naar de kaartlagen.

## Kies wat u inleest

- **Gebied**: {{ui:De omvang van het project en een marge}} (typ de marge), {{ui:Wat het plan nu toont}}, of {{ui:Het hele bestand}}. Alleen dat deel van het bestand wordt gelezen.
- **Verdunnen tot**: de afstand tussen de punten die u krijgt, in de eenheden van het project. De regel onder de instellingen toont hoeveel punten dat geeft terwijl u typt. Bij een raster houdt CivilCraft elke tweede, derde … cel, zodat de hoogten precies die van het bestand blijven; cellen worden nooit gemiddeld. Bij LiDAR wordt het gebied in vierkanten van die grootte verdeeld en wordt per vierkant één punt bewaard: {{ui:Het punt dichtst bij het middelpunt van elke cel}} (de standaard), {{ui:Het laagste punt in elke cel}} (goed wanneer het bestand geen maaiveldklasse heeft: het maaiveld ligt onder de bomen) of {{ui:Het gemiddelde van de punten van elke cel}}.
- **Klassen** (LiDAR): maaiveld (klasse 2) is aangevinkt wanneer het bestand die heeft; gebouwen, bomen en ruis worden weggelaten. Als er geen maaiveldklasse is, zijn alle klassen aangevinkt, en het venster zegt dat.
- **Maaiveld** (LiDAR, 0.8): een dronewolk heeft geen maaiveldklasse. Wanneer het bestand er geen heeft, start het venster op {{ui:Het maaiveld zelf zoeken (dronewolken, geen maaiveldklasse)}}: elke klasse behalve ruis wordt gelezen, het laagste punt in elke cel wordt bewaard, en daarna haalt CivilCraft gebouwen, bomen en losse lage punten eruit met een progressief morfologisch filter (Zhang e.a., 2003) dat u kunt bijsturen: **Grootste object om te verwijderen** (de breedte van het grootste gebouw; ramen groeien tot ze het bedekken; 0 betekent 20 cellen) en **Steilste maaiveldhelling**. Het werk gebeurt op het raster van laagste punten, dus een wolk van tientallen miljoenen punten kost niet meer dan het aantal cellen (het verdunnen is één doorlopende lezing). De afstand is de cel: een grovere is sneller en mist kleine objecten minder dan u zou denken, een fijnere houdt meer detail van het maaiveld. De melding zegt hoeveel punten als maaiveld zijn bewaard, hoeveel cellen als objecten zijn verwijderd en hoeveel losse lage punten zijn weggelaten. Bij een gesimuleerde drone-opname van 300 m met vijf gebouwen, 70 bomen en 200 lage uitschieters lagen de bewaarde punten binnen 3 cm van het echte terrein en werd geen dak of kroon bewaard.
- **Hoogten in het bestand**: meter, feet of US survey feet. Wanneer het bestand dit zegt, is de eenheid al gekozen. Wanneer niet, moet u kiezen: het venster toont het hoogtebereik in beide richtingen zodat u kunt zien wat voor de locatie klopt.
- **Importeren als** (alleen rasters): {{ui:Meetpunten (omschrijving DEM)}}, of {{ui:Het oppervlak zelf (een raster van driehoeken)}}.

Een import bevat maximaal 500,000 punten. Als een keuze er meer zou geven, zegt het venster met hoeveel en welke afstand zou passen, en blijft {{ui:Importeren}} uitgeschakeld.

Klik op {{ui:Importeren}}. Een voortgangsbalk toont het inlezen; met {{ui:Annuleren}} stopt u het en verandert er niets.

:::warning
Verticale eenheden zijn een veelvoorkomende valkuil. Veel DEM's in State Plane hebben oostelijke en noordelijke coördinaten in feet, maar hoogten in meter. Vergelijk het bereik dat het venster toont met wat u van de locatie weet.
:::

## Wat u krijgt

- **Meetpunten**: genummerd na uw hoogste puntnummer, met de beschrijving `DEM` (rasters) of `LIDAR`, zodat ze één puntengroep vormen onder **Punten** en het terrein bouwen zoals andere punten. Ze importeren is één stap: {{key:Mod+Z}} haalt ze er weer uit.
- **Het terrein zelf**: een raster-TIN, twee driehoeken per cel, gesplitst op de diagonaal van zuidwest naar noordoost. Een driehoek met een hoek zonder data wordt weggelaten, zodat gaten in de data gaten blijven. Het terrein is gelijk aan het raster op elk rasterpunt en is binnen elke driehoek ertussen een vlak. Het vervangt het terrein van het project (het venster vraagt eerst); {{key:Mod+Z}} haalt het vorige terrein terug. De kop van het linkerpaneel zegt **Terrein (uit een hoogteraster)**.

## Coördinatenstelsels

- Als het project een coördinatenstelsel heeft en het bestand een ander noemt, wordt elk punt omgezet naar het stelsel van het project (en naar zijn maaiveld- of lokale coördinaten wanneer die er zijn).
- Als het project er geen heeft en het stelsel van het bestand is in de eenheden van het project (feet of meter), biedt het venster aan dit het coördinatenstelsel van het project te maken, in dezelfde stap als de punten.
- Als het bestand in breedte- en lengtegraad is, of in meter voor een feet-project, vraagt het venster eerst om het coördinatenstelsel van het project te kiezen.
- Als het bestand het niet zegt, worden de getallen als coördinaten van het project genomen. U kunt in plaats daarvan het stelsel van het bestand kiezen.

## Een terrein exporteren als GeoTIFF

1. Klik op {{ui:Exporteren}} in de groep GIS.
2. Kies in het GeoTIFF-deel het terrein (bestaand maaiveld of het gegradeerde terrein) en de celgrootte. De standaard komt van de gemiddelde driehoeksrand van het terrein. Het venster toont de grootte van het raster dat het gaat schrijven.
3. Klik op {{ui:GeoTIFF downloaden}}.

Het bestand is één band van 32-bit drijvendekommagetallen in de eenheden van het project, over de omvang van het terrein; cellen buiten het terrein zijn "geen data" (−3.4028235e38). De waarde van elke cel is de hoogte van het terrein in het middelpunt van de cel. Coördinaten zijn **rastercoördinaten**: een project in maaiveld- of lokale coördinaten wordt terug omgezet naar het raster. Het bestand noemt het coördinatenstelsel van het project met zijn EPSG-code; een stelsel zonder EPSG-code wordt niet geschreven, en het venster waarschuwt u om de GIS-afdeling te vertellen om welk stelsel het gaat.

## Wat er is gecontroleerd

- De GeoTIFF- en ASCII-rasterlezers zijn gecontroleerd tegen GDAL (via rasterio), de bibliotheek die de meeste GIS-programma's gebruiken om deze bestanden te lezen: 32-bit float- en 16-bit integer-rasters, getegeld en in stroken, DEFLATE en LZW, nodata, schaal en offset, pixel-is-point, een UTM-raster, een State Plane-raster in US survey feet en een raster in breedte- en lengtegraad — elke waarde gelijk.
- De LAS- en LAZ-lezers zijn gecontroleerd tegen laspy: LAS 1.2 en 1.4, puntformaten 0, 1, 3, 6, 7 en 8, met en zonder coördinatenstelsel, en LAZ geschreven door de LASzip-compatibele backend — elk punt gelijk.
- Omgezette coördinaten zijn gecontroleerd tegen PROJ tot 1 mm.
- Geëxporteerde GeoTIFFs zijn door GDAL teruggelezen: coördinatenstelsel, celposities, nodata, eenheden, en waarden gelijk aan het terrein tot 0.0001.
- Niets hier is geopend in andere GIS- of CAD-programma's.

## Nog niet beschikbaar

- Wijzigingen van de verticale datum (geoïde-modellen): hoogten worden gebruikt zoals het bestand ze heeft.
- Golfvormdata, LiDAR-reflecties anders dan op klasse, kleuren en intensiteiten.
- Meerdere banden, overzichten, of bestanden groter dan 200 MB.
- LAS- of LAZ-bestanden schrijven vanuit een terrein of vanuit deze tool (de add-on [Puntenwolken](topic:point-clouds) schrijft een opgeschoonde wolk als LAS 1.4 of LAZ).
