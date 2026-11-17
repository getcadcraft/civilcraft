---
title: GIS-gegevens importeren
summary: Shapefiles, GeoJSON en GeoPackages in een project importeren als GIS-lagen, ze plaatsen via het juiste coördinatenstelsel, hun attributen bekijken en ze gebruiken voor het oppervlak.
keywords: gis, labels, objecten labelen, attributen op het plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importeren, lagen, attributen, coördinatenstelsel, epsg, breedtegraad, lengtegraad, hoogtelijnen, percelen, breeklijnen, grens
from: f6b235cc
---

Gemeenten en waterschappen leveren locatiecontext als GIS-bestanden: percelen, erfdienstbaarheden, hoogtelijnen, nutsvoorzieningen, meetpunten. CivilCraft opent drie soorten daarvan als **GIS-lagen** die onder uw ontwerp op het plan liggen.

| Bestand | Wat te openen |
|---|---|
| Shapefile | De `.shp` samen met zijn `.shx`, `.dbf`, `.prj` en `.cpg` (selecteer ze allemaal), of de `.zip` waarin ze kwamen. Een zip met meerdere shapefiles geeft meerdere lagen. |
| GeoJSON | Het `.geojson`-bestand (een `.json`-bestand waarvan de eerste regels `FeatureCollection` of `Feature` zeggen, werkt ook). |
| GeoPackage | Het `.gpkg`-bestand. Elke objecttabel erin wordt weergegeven. |
| KML of KMZ | Het `.kml`-bestand (uit Google Earth of een webkaart), of het gezipte `.kmz`. Elke map wordt een laag (opgesplitst in punten, lijnen en vlakken als er meerdere soorten in zitten); de naam, beschrijving en extended data van een placemark worden zijn attributen. Hoogten zijn in meter en breedte- en lengtegraad, zoals bij GeoJSON. |

Punten, multipunten, lijnen, vlakken met gaten en uit meerdere delen bestaande vormen worden gelezen, met hun hoogten (z) als het bestand die heeft. Meetwaarden (M) worden weggelaten. Hoogterasters en LiDAR openen op dezelfde manier: zie [Hoogterasters en LiDAR](topic:elevation-grids-and-lidar).

## De bestanden openen

1. Klik op {{ui:Importeren}} in de groep **GIS** (of op {{ui:Openen}}), kies de bestanden, of zet ze op het plan. De bestanden worden op deze computer gelezen; er wordt niets geüpload.
2. De dialoog **GIS-gegevens importeren** toont elke gevonden laag: haar soort, hoeveel objecten (en hoeveel zonder geometrie), hoeveel attribuutvelden, en het coördinatenstelsel dat het bestand noemt. Vink de lagen uit die u niet wilt.
3. Lees het deel **Coördinatenstelsel** (hieronder) en de regel **Wat er gebeurt**, en klik daarna op {{ui:Importeren}}.
4. De lagen verschijnen op het plan en onder **GIS-lagen** in het linkerpaneel. De import is één stap: {{key:Mod+Z}} neemt hem terug.

Een groot bestand toont een voortgangsregel over het plan met een knop {{ui:Annuleren}}.

## Het coördinatenstelsel

GIS-bestanden geven hun ligging aan via een coördinatenstelsel (de `.prj` van een shapefile, de tabel met ruimtelijke referenties van een GeoPackage; GeoJSON is altijd breedte- en lengtegraad). CivilCraft zet elke laag om van zijn eigen stelsel naar dat van het project. Het raadt nooit:

- **Het project heeft een coördinatenstelsel** (ingesteld via {{ui:Coördinaten}}): elke laag met een eigen stelsel wordt ernaar omgezet, inclusief een terrein- of lokale aanpassing. Een bestand zonder `.prj` krijgt twee keuzes: **Gelijk aan het project** (de getallen worden geladen zoals ze zijn) of **Het systeem van het bestand kiezen**.
- **Het project heeft er geen, en het bestand staat in een geprojecteerd stelsel in de eenheden van uw project** (bijvoorbeeld een RD-zone in US survey feet voor een project in voet): de dialoog biedt **Dat systeem als coördinatenstelsel van het project gebruiken** aan. Het wordt ingesteld in dezelfde stap als de import. Niets in het project verschuift; het stelsel zegt alleen wat de getallen betekenen. U kunt in plaats daarvan een ander stelsel voor het project kiezen, en de lagen worden daarnaar omgezet.
- **Het project heeft er geen, en het bestand staat in breedte- en lengtegraad** (elke GeoJSON) **of in andere eenheden**: {{ui:Importeren}} blijft grijs tot u het coördinatenstelsel van het project kiest. De kiezer begint in de buurt van de gegevens.
- **Noch het project noch de bestanden noemen een stelsel**: de getallen worden geladen zoals ze zijn, en de dialoog zegt dat.

Hoogten worden ook omgezet: GeoJSON-hoogten zijn meter (de GeoJSON-standaard zegt dat); hoogten van andere bestanden worden genomen in de eenheid van hun eigen stelsel.

:::warning
Posities in een GeoJSON-bestand buiten ±180° lengtegraad of ±90° breedtegraad zijn geen breedte- en lengtegraad. Die objecten worden weggelaten en de dialoog zegt hoeveel. Zo'n bestand is meestal een geprojecteerd bestand dat zonder zijn stelsel is opgeslagen; vraag het opnieuw aan, of vraag de shapefile met zijn `.prj`.
:::

NAD83 wordt behandeld als hetzelfde als WGS 84 (het stelsel dat GeoJSON gebruikt); de twee verschillen in Noord-Amerika een paar meter, dus GeoJSON-gegevens kunnen zo ver afwijken. Waar de beste verschuiving een rasterbestand nodig heeft (bijvoorbeeld NADCON voor NAD27), gebruikt CivilCraft een ruwere gepubliceerde verschuiving, en toont de dialoog voor het coördinatenstelsel hoe ruw (voor NAD27 ongeveer 20 m), totdat u het rasterbestand toevoegt: zie [Grid shift-bestanden](topic:coordinate-systems).

## GIS-lagen

Elke rij onder **GIS-lagen** heeft:

- een vinkje om de laag te tonen of te verbergen (verborgen lagen worden ook niet geselecteerd);
- haar kleur, gekozen uit de lijst;
- een menu (de drie puntjes) met {{ui:Zoomen naar}}, {{ui:Gebruiken voor het oppervlak…}}, {{ui:Hernoemen…}} en {{ui:Verwijderen}}.

Tonen, verbergen, opnieuw kleuren, hernoemen en verwijderen zijn stappen die u ongedaan kunt maken. GIS-lagen worden opgeslagen in het projectbestand en keren terug wanneer u het opent. Ze gaan ook mee met de pdf-plot van het plan en de DXF- en DWG-exports, elk op een laag die `GIS-` heet, gevolgd door het nummer.

## Objecten labelen op basis van een attribuut

In het menu {{ui:Meer}} van de laag (de drie puntjes in **GIS-lagen**) kiest u een veld onder **Labelen met**: elk object toont zijn waarde op het plan, in de kleur van de laag. Punten worden naast het punt gelabeld, lijnen langs het midden van hun langste deel (gedraaid zodat ze van links naar rechts lezen), vlakken in hun midden. Getallen tonen tot drie decimalen. Labels zijn op papier op elke schaal 1.8 mm hoog, en ze gaan mee naar de pdf-plot, DXF en DWG. Kies **Geen labels** om ze weg te halen; elke wijziging is één stap ({{key:Mod+Z}} maakt haar ongedaan). Een laag labelt maximaal 5,000 objecten.

## Een object bekijken

Met {{ui:Selecteren}} aan klikt u op een object. **Eigenschappen** toont de laag, welk object het is, de vorm (delen, gaten, hoekpunten), de hoogten, het bestand waaruit het komt en het coördinatenstelsel van dat bestand, en daarna elk attribuut in een tabel. Attributen zijn alleen-lezen: CivilCraft toont GIS-gegevens zoals ze kwamen, het bewerkt ze niet.

Punten winnen van lijnen als beide onder de aanwijzer liggen; binnen een vlak wordt het kleinste vlak gekozen.

## Gebruiken voor het oppervlak

Open het menu van een laag en kies {{ui:Gebruiken voor het oppervlak…}} (of de knop in **Eigenschappen**). Wat wordt aangeboden hangt af van de laag:

| Laag | Kan worden |
|---|---|
| Lijnen met hoogten (3D-lijnen) | Breeklijnen op hun eigen hoogten |
| Lijnen zonder hoogten maar met een getalveld (hoogtelijnen) | Breeklijnen op de hoogte uit het veld dat u kiest |
| Vlakken | De oppervlakgrens (het gekozen vlak, anders het grootste), of breeklijnen langs hun randen |
| Punten met hoogten, of met een hoogteveld | Inmetingspunten, beschreven met de naam van de laag zodat ze een puntengroep vormen |

Elk gebruik is één stap ongedaan te maken en kopieert de geometrie naar het project; de laag zelf blijft zoals hij is. Hoogten worden in projecteenheden genomen.

## Puntbestanden met breedte- en lengtegraad

Een puntbestand waarvan de kop de kolommen **latitude** en **longitude** noemt (`lat`, `latitude`, `lon`, `long`, `longitude`) wordt gelezen als graden, niet als Northing en Easting. De importdialoog meldt dat. Bij {{ui:Importeren}} worden de punten omgezet naar het coördinatenstelsel van het project; een project zonder stelsel vraagt u eerst er een te kiezen. Graden worden nooit als voet geladen. Rijen buiten ±90° breedtegraad of ±180° lengtegraad worden geweigerd, met de reden. De hoogtekolom wordt genomen zoals ze is, in projecteenheden.

## LandXML-bestanden met een coördinatenstelsel

Wanneer een LandXML-bestand dat u opent een element `CoordinateSystem` heeft (een EPSG-code, een WKT-beschrijving of een stelselnaam), biedt CivilCraft het aan als coördinatenstelsel van het project. Niets verschuift als u accepteert; het stelsel zegt alleen wat de getallen betekenen.

## Wat is gecontroleerd

- Elke lezer is vergeleken met GDAL, de bibliotheek die de meeste GIS-programma's gebruiken, op bestanden die GDAL zelf schreef: shapefiles van elke soort met en zonder hoogten, lijnen uit meerdere delen, vlakken met gaten, lege geometrieën, tekst-, getal-, datum- en waar/onwaar-attributen, UTF-8- en Windows-1252-tekst met en zonder `.cpg`, een zip met meerdere shapefiles, GeoJSON met elk geometrietype, en een GeoPackage met vier tabellen. Elke geometrie, hoogte en elk attribuut kwam overeen.
- Posities omgezet vanuit breedte- en lengtegraad, en vanuit UTM, kwamen binnen 3 mm overeen met PROJ (de projectiebibliotheek achter GDAL).
- Beschadigde bestanden (afgekapt, met verkeerde groottes, kapotte zips, kapotte GeoPackages) geven één duidelijke melding; niets blijft hangen.
- Niets hier is nog geopend in andere GIS-programma's, en file geodatabases, KML en KMZ worden nog niet gelezen (zie [Nog niet beschikbaar](topic:not-built-yet)).
