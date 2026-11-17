---
title: GIS-lagen analyseren
summary: Buffer, overlay (doorsnede, unie, uitknippen, samenvoegen), ruimtelijke koppeling, selecteren op attribuut en de GIS-lagen in een project meten, elk als nieuwe laag die u ongedaan kunt maken.
keywords: gis, analyse, buffer, overlay, doorsnede, unie, uitknippen, samenvoegen, clip, ruimtelijke join, join, selecteren op attribuut, query, waar, expressie, statistiek, oppervlakte, lengte, omtrek, meten, percelen, erfdienstbaarheid, setback, shapefile, geopackage, attributentabel
from: a6b2d3f9
---

Zodra een project GIS-lagen heeft (zie [GIS-gegevens importeren](topic:gis-import)), opent de knop **Analyseren** in de groep GIS (getypt `GISANALYSIS`, `ANALYZE` of `BUFFER`) een paneel met vijf tabbladen. Het blijft open naast het plan, zodat wat u selecteert op het plan wordt getekend terwijl u werkt.

Elk hulpmiddel dat iets maakt **voegt een nieuwe laag toe** en laat de lagen waaruit het las precies zoals ze waren. Elke toevoeging is één stap ongedaan te maken: {{ui:Ongedaan maken}} in het paneel (of Ctrl+Z) verwijdert de nieuwe laag. Exporteer het resultaat zoals elke andere laag met [As-built-gegevens voor GIS exporteren](topic:gis-export) als shapefile, GeoJSON of GeoPackage.

De volledige tabel van een laag, met sorteren, bewerken en een veldrekenmachine, staat in [Met de attributentabel van een laag werken](topic:gis-table); kleuren op basis van een veld staat in [Een laag stijlen op basis van een attribuut](topic:gis-symbology).

Alles wordt bewerkt in het plan, in de eenheden van het project (voet of meter). Een project staat altijd in een geprojecteerd of lokaal stelsel, dus een afstand van 50 betekent 50 voet of 50 meter, nooit graden. Hoogten (z) worden niet bewaard in de resultaten.

## Buffer

Tekent een zone op een vaste afstand rond elk object, als nieuwe vlaklaag. Punten worden cirkels, lijnen worden corridors met afgeronde uiteinden, vlakken worden groter. Een **negatieve** afstand verkleint vlakken (een vierkant van 100 bij 100 verkleind met 5 wordt 90 bij 90; verkleind met 60 blijft er niets over, en het paneel meldt dat). Neem de afstand uit een getalveld om elk object een eigen afstand te geven, of vink **Alle buffers samenvoegen tot één vorm** aan om ze samen te voegen.

De afgeronde delen zijn rechte stukken die binnen de echte boog liggen, dus een buffer is een haar kleiner dan de exacte cirkel: ongeveer 0.6 % in oppervlakte bij de normale instelling, 0.16 % bij Fijn. Gebruik Fijn voor alles wat u gaat meten.

## Overlay

| Hulpmiddel | Wat u krijgt |
|---|---|
| Doorsnede | De stukken waar de invoerlaag de overlay-vlakken raakt, elk met de velden van beide lagen. Lijnen en punten worden afgeknipt tot de vlakken. |
| Unie | Beide vlaklagen langs elkaars randen gesneden: gedeelde stukken hebben de velden van beide lagen, de rest die van één laag (de velden van de andere zijn leeg). |
| Uitknippen | De invoervlakken met de overlay-vlakken eruit gehaald. Velden blijven bij de invoer. Een object dat helemaal wegvalt, wordt weggelaten (het paneel telt ze). |
| Samenvoegen | Voegt vlakken samen die elkaar raken of overlappen, allemaal of één vorm per waarde van een veld. Voegt `COUNT` en `AREA` toe. |

Een veldnaam die beide lagen hebben, wordt behouden voor de eerste laag, en die van de tweede laag krijgt `_2`. Objecten binnen één laag mogen elkaar niet overlappen: waar ze dat wel doen, telt een Unie de overlap in beide.

## Koppelen

Een ruimtelijke koppeling kopieert attributen van een **bron**laag naar elk **doel**object dat erbij raakt, en levert een nieuwe laag met de vormen van het doel. Kies wanneer ze elkaar raken: aanrakend of overlappend, het doel ligt binnen een bronvlak, het doel bevat het bronobject, het dichtstbijzijnde bronobject (met een optionele limiet), of elk bronobject binnen een afstand.

Als meerdere bronobjecten passen, neemt u de attributen van het eerste (het dichtstbijzijnde bij de koppelingen op dichtstbijzijnde en op afstand; `DISTANCE` wordt toegevoegd), of **u telt ze en totaliseert hun getalvelden**: `COUNT`, en `SUM_`, `MEAN_`, `MIN_`, `MAX_` voor elk getalveld. Vink **Doelobjecten zonder overeenkomst behouden** uit om die weg te laten. Gekoppelde velden zijn leeg waar niets paste, en het paneel telt de niet-gekoppelde objecten.

## Selecteren

Typ een vraag over de attributen of de vorm, druk op **Selecteren**, en de objecten worden op het plan getekend met hun aantal, een tabel en het totale oppervlak, de lengte of het getal. Maak er daarna een eigen laag van, zoom erop in of hef de selectie op.

| U kunt schrijven | Voorbeeld |
|---|---|
| Een veld op naam; gebruik "aanhalingstekens" of [vierkante haken] als de naam spaties heeft | `VALUE`, `"Lot Number"` |
| Getallen, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst negeert hoofdletters; in `like` is `%` elke reeks en `_` één letter) | `Notes contains 'corner'` |
| `is null`, `is not null` (een lege waarde telt als null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` en haakjes | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vormwaarden `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Een vraag die onvolledig is of een veld noemt dat de laag niet heeft, wordt geweigerd met een zin die aangeeft waar het misgaat.

## Meten

Toont het totale oppervlak en de omtrek, lengte of het aantal van de laag, en **voegt velden toe** eraan: `AREA` en `PERIMETER` voor vlakken, `LENGTH` voor lijnen (de lengte op het plan), `X` en `Y` voor punten. Een veld dat al bestaat, wordt nooit overschreven: het nieuwe heet `AREA_2`. Dit is één stap ongedaan te maken. **Statistiek** geeft het aantal, de som, het gemiddelde, het minimum en het maximum van een getalveld, eventueel per waarde van een ander veld.

:::note
De controles achter deze hulpmiddelen worden met de hand uitgewerkt in de test (`node bin/test-civilcraft-gisanalysis.mjs`): bijvoorbeeld percelen van 100 bij 100 onder een zone van 100 bij 80 snijden elkaar in 3,000 plus 3,000, en een lijn van 100 lang, gebufferd met 10, is 2,000 plus een cirkel.
:::
