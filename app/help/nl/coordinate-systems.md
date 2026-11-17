---
title: Het coördinatenstelsel van het project instellen
summary: Geef aan in welk coördinatenstelsel de opmeting ligt, zodat CivilCraft breedte- en lengtegraad toont, GIS-bestanden en kaartlagen plaatst en .prj-bestanden schrijft. Kies op code, op naam, op de coördinaten zelf of uit een .prj-bestand.
keywords: coördinatenstelsel, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projectie, prj, wkt, datum, breedtegraad, lengtegraad, lat long, geografisch, raster, georeferentie, georefereren, coördinatenstelsel toekennen
from: 964250e2
---

De coördinaten van een project zijn gewone getallen totdat u zegt wat ze betekenen. Het instellen van het coördinatenstelsel **verplaatst nooit iets**: het vertelt CivilCraft bijvoorbeeld dat E 6,150,000 N 2,080,000 state plane-coördinaten zijn van Californië, zone 6, in US survey feet. Zodra het dat weet:

- toont de statusbalk de breedte- en lengtegraad van de aanwijzer,
- worden GIS-bestanden in andere stelsels (shapefiles, GeoJSON, GeoPackage, hoogterasters, LiDAR) bij het openen in het project omgezet,
- kunnen kaartlagen onder het plan worden getekend ([Kaartlagen onder het plan tonen](topic:map-layers)),
- bevatten exports naar GIS-formaten het stelsel (een `.prj` voor shapefiles, de EPSG-code voor GeoPackage en GeoTIFF).

## Kies het stelsel

1. Kies {{ui:Coördinaten}} in de groep {{ui:GIS}} van de werkbalk. Het dialoogvenster **Coördinatenstelsel** opent. Bovenaan staat waarin het project nu ligt, of **Geen — coördinaten zijn gewone getallen**.
2. Zoek het stelsel op een van deze manieren:
   - **Zoeken**: typ de EPSG-code (`2277`, `EPSG:2277`) of woorden uit de naam (`texas central`, `utm 14n`, `lambert-93`). Bij codes verschijnt de lijst vanaf de code die u typte; bij woorden verschijnen de stelsels waarvan de naam elk woord bevat.
   - {{ui:Stelsels waar deze coördinaten in passen}} (als het project punten of een oppervlak heeft): CivilCraft leest het midden van uw project in elk stelsel van de eenhedenfamilie van het project en toont de stelsels waarvan het gebruiksgebied dat midden bevat. State plane-coördinaten passen meestal maar in enkele zones: een project in Texas op E 3,115,000 N 10,070,000 US survey feet past in de vier Texas Central-varianten (NAD83, NAD83(2011), HARN, NSRS2007). Elk item toont waar het midden van uw project zou liggen.
   - **Nabij (breedte, lengte)** en {{ui:Voorstellen}}: typ waar de locatie ligt, bijvoorbeeld `30.27, -97.74` of `30°16′N 97°44′W`, en CivilCraft toont de geprojecteerde stelsels waarvan het gebied die plek bevat, eerst de nationale en staatsroosters.
   - {{ui:Een .prj-bestand lezen…}}: open het `.prj` dat bij een shapefile of tekening hoorde. CivilCraft koppelt het aan zijn lijst via de projectieberekening (een `.prj` dat een datum anders benoemt, vindt dus nog steeds het juiste stelsel) en zegt welk stelsel het is. Past niets exact, dan wordt de eigen beschrijving van het bestand gebruikt. U kunt ook een `.prj` op het dialoogvenster slepen, of er een op het plan alleen openen of slepen.
3. Klik op een stelsel in de lijst. Onder **Gekozen** staan de naam, de EPSG-code, de eenheid, hoe goed de datum op WGS 84 is aangesloten, het gebruiksgebied in breedte- en lengtegraad, en waar het midden van uw project erin valt.
4. Laat **Raster** geselecteerd (voor de meeste projecten; zie [Grond- en lokale coördinaten](topic:ground-and-local-coordinates) voor de andere) en kies {{ui:Toepassen}}.

De statusbalk toont nu de breedte- en lengtegraad van de aanwijzer naast E en N. Het instellen van het stelsel is één stap ongedaan te maken: {{key:Mod+Z}} neemt het terug.

:::note
De eenheden moeten overeenkomen: een project in voet neemt stelsels in US survey feet of internationale voet, een project in meter neemt stelsels in meter. CivilCraft legt een weigering uit ("Het project is in voet maar dit stelsel is in meter…"). Een project in voet met een US survey foot-stelsel gebruikt survey feet: de "ft" van het project betekent de voet van het stelsel. Geografische stelsels (breedte- en lengtegraad, zoals WGS 84 zelf) kunnen geen stelsel van een project zijn: tekeningen hebben Easting en Northing nodig.
:::

## Wijzig of verwijder het stelsel

Open {{ui:Coördinaten}} opnieuw, kies een ander stelsel en kies {{ui:Toepassen}}. Heeft het project punten of een ontwerp, dan vraagt CivilCraft **Staan de coördinaten al in …?**

- {{ui:Ja — er verandert niets}}: de getallen blijven zoals ze zijn en alleen hun betekenis verandert. Gebruik dit als het oude stelsel per vergissing was gekozen.
- {{ui:Nee — omzetten}}: elk opmeetpunt, breeklijn, grens, tracé-PI, plaathoek en kunstwerk wordt van het oude naar het nieuwe stelsel omgezet, in één ongedaan-stap. Een oppervlak dat als driehoeken uit LandXML is gelezen kan niet worden omgezet; bouw het eerst opnieuw op uit de punten.

{{ui:Het stelsel verwijderen}} neemt het stelsel weg (er verandert niets). GIS-lagen die al in het project zitten, blijven waar ze staan.

## Breedte- en lengtegraad in de statusbalk

Zolang het project een stelsel heeft, toont de statusbalk de breedte- en lengtegraad van de aanwijzer op WGS 84, bijvoorbeeld `30°18′00.00″ N  97°42′00.00″ W`. Kies in plaats daarvan decimale graden onder {{ui:Instellingen}}, {{ui:CivilCraft}}, **Breedte- en lengtegraad** ([CivilCraft-instellingen](topic:settings)). Met terrein- of lokale coördinaten gaat de aflezing eerst door die stap, zodat ze klopt voor het punt onder de aanwijzer.

## Hoe goed de datumverschuiving is

Breedte- en lengtegraad, GeoJSON en kaartlagen liggen allemaal op WGS 84. De aansluiting van elk stelsel op WGS 84 staat in het dialoogvenster:

| Wat het dialoogvenster zegt | Wat het betekent |
|---|---|
| WGS 84 zelf | Geen enkele verschuiving. |
| NAD83 wordt als WGS 84 genomen | De twee verschillen in het grootste deel van Noord-Amerika één of twee meter, hooguit enkele meters. Goed voor kaartlagen en locatiecontext; niet voor landmeetkundige controle. |
| Bekend tot ongeveer *n* m (cijfer van EPSG) | Een gepubliceerde verschuiving; kaartlagen en GeoJSON kunnen daar ongeveer zo ver naast zitten. |
| Niet bekend voor deze datum | Er is geen gepubliceerde verschuiving zonder rasterbestand: kaartlagen en GeoJSON kunnen honderden meters afwijken. |
| Uit het rasterverschuivingsbestand … | Een rasterverschuivingsbestand is in gebruik (hieronder): binnen ongeveer 10 cm van NAD83 binnen het raster. |

Uw eigen coördinaten van het project ondergaan nooit een datumverschuiving: alleen wat naar of van breedte- en lengtegraad wordt omgezet. Verticale datums en geoïdemodellen worden niet verwerkt (hoogten worden nooit omgezet). Waar de beste verschuiving een rasterbestand nodig heeft, toont de lijst een ruwere gepubliceerde verschuiving en het dialoogvenster de nauwkeurigheid daarvan (NAD27-stelsels bijvoorbeeld ongeveer 20 m), totdat u het raster toevoegt.

## Rasterverschuivingsbestanden

Voor een NAD27-stelsel zet **Rasterverschuivingsbestand** in het dialoogvenster breedte- en lengtegraad, GIS-bestanden en kaartlagen binnen ongeveer 10 cm van NAD83 in plaats van ongeveer 20 m:

- **Downloaden** het raster dat het voorstelt voor het gebied van het stelsel (NADCON5 voor de aaneengesloten Verenigde Staten, NADCON voor Alaska, NTv2 voor Canada) van cdn.proj.org, PROJ's openbare rasterserver. Alleen de bestandsnaam van het raster wordt verstuurd.
- Of **Een rasterbestand toevoegen…** als u er al een hebt: NTv2 (`.gsb`) of een PROJ GeoTIFF-raster (`.tif`), tot 20 MB.

Het raster wordt in het projectbestand opgeslagen, zodat het met het project meereist. Het venster zegt of het midden van het project binnen het raster ligt: daarbuiten wordt helemaal geen verschuiving toegepast, gebruik dus een raster dat het terrein dekt. **Stop met het raster** keert terug naar de ruwe verschuiving. Elke wijziging is één stap: {{key:Mod+Z}} maakt haar ongedaan.

GIS-lagen die al in het project zitten blijven waar ze staan wanneer het raster wijzigt; importeer ze opnieuw om ze via het raster te plaatsen. De eigen coördinaten van het project verplaatsen nooit.

## Wat is gecontroleerd

- Elke omzetting is vergeleken met PROJ (pyproj 3.7.1 met PROJ 9.5.1), de coördinatenbibliotheek die de meeste GIS-programma's gebruiken, op meer dan 330 stelsels: state plane in US survey feet en feet, UTM noord en zuid, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator en web Mercator, onder meer. Easting en Northing komen tot op 1 cm overeen met dezelfde datumverschuiving (meestal ruim onder 1 mm), en de projectieberekeningen komen tot op 1 cm overeen met de eigen definities van PROJ.
- `.prj`-bestanden die PROJ schrijft in beide gangbare vormen (ESRI en OGC) zijn voor 105 stelsels teruggelezen: 208 van de 210 kwamen overeen met hun exacte EPSG-code, en de andere twee met een stelsel met dezelfde berekening op dezelfde ellipsoïde. `.prj`-bestanden die CivilCraft schrijft worden door PROJ als hetzelfde stelsel gelezen. ESRI-`.prj`-bestanden voor poolstereografische stelsels (UPS, Alaska polair) kunnen niet worden gelezen; kies die stelsels op code.
- De breedte- en lengtegraad in de statusbalk kwam in de browser tot op 0.01″ overeen met PROJ.
