---
title: Terrein- en lokale coördinaten
summary: Werken in terrein- (oppervlak-)coördinaten die u vanuit het raster schaalt met een gecombineerde schaalfactor die u typt of berekent op een punt, of in een aangenomen sitegrid dat via twee controlepunten aan het stelsel is gekoppeld.
keywords: terreincoördinaten, oppervlakcoördinaten, raster naar terrein, gecombineerde schaalfactor, csf, gecombineerde factor, rasterfactor, hoogtefactor, zeeniveaufactor, convergentie, kaarthoek, schaalfactor, aangenomen coördinaten, lokale coördinaten, sitegrid, 5000 5000, controlepunten, lokalisatie, kalibratie, twee punten, sluitfout
from: 3d7453de
---

State plane- en UTM-coördinaten zijn **raster**coördinaten: een kaartprojectie rekt of krimpt afstanden een beetje (tientallen ppm), en hoe hoger het terrein, hoe meer een gemeten terreinafstand afwijkt van de rasterafstand. Veel metingen leveren daarom **terrein**coördinaten, geschaald zodat plan-afstanden gelijk zijn aan de afstanden die op het terrein gemeten worden, of een **aangenomen** sitegrid (5000, 5000 bij een controlepunt). CivilCraft bewaart uw getallen zoals ze zijn en legt vast hoe ze zich tot het raster verhouden, zodat breedte- en lengtegraad, GIS-bestanden en kaartlagen nog steeds op de juiste plek terechtkomen.

Open {{ui:Coördinaten}} in de groep {{ui:GIS}}, kies (of behoud) het stelsel, en kies daarna onder **Raster-, terrein- of lokale coördinaten**:

| Keuze | Uw coördinaten zijn | Hoe ze zich tot het raster verhouden |
|---|---|---|
| {{ui:Raster}} | Die van het stelsel zelf (het begin) | Dezelfde getallen |
| {{ui:Terrein}} | Geschaald naar terreinafstanden | raster = basis + gecombineerde factor × (terrein − basis) |
| {{ui:Lokaal}} | Een aangenomen sitegrid | Verschoven, gedraaid en geschaald op het raster via twee controlepunten |

Wat u kiest wordt met het project opgeslagen en is één stap ongedaan te maken; niets verschuift.

## Terreincoördinaten

1. Kies {{ui:Terrein}}.
2. Typ de **Gecombineerde schaalfactor** uit de meting (bijvoorbeeld `0.99987`), of bereken hem:
   1. Onder **De factor berekenen op een punt** begint het punt in het midden van het project. Kies {{ui:Kies een punt op het plan}} en klik op de plek (een klik nabij een meetpunt neemt dat punt), of typ E en N.
   2. De hoogte komt uit het oppervlak daar; typ een andere als u die nodig hebt.
   3. Kies {{ui:Berekenen}}. CivilCraft toont:
      - **Rasterschaalfactor k**: hoeveel de kaartprojectie afstanden daar rekt.
      - **Hoogtefactor**: hoeveel korter afstanden op de ellipsoïde zijn dan op die hoogte.
      - **Gecombineerde factor** = k × hoogtefactor: rasterafstand = terreinafstand × deze.
      - **Convergentie**: de hoek tussen rasternoord en het ware noorden daar (geodetisch azimut = rasterazimut + convergentie).
   4. Kies de knop {{ui:Gebruik}} onder de getallen om de gecombineerde factor in het vak te zetten.
3. Stel het **Basispunt** in, waar terrein- en rastercoördinaten gelijk zijn. Het begint op 0, 0: de meeste instanties die terreincoördinaten publiceren schalen rond de oorsprong, zodat terreincoördinaten herkenbaar dicht bij de rastercoördinaten blijven. Sommige metingen schalen in plaats daarvan rond het controlepunt van het project: volg wat de meting zegt.
4. Kies {{ui:Toepassen}}.

:::warning
De hoogte wordt genomen als hoogte boven de ellipsoïde. CivilCraft heeft geen geoïdemodel, dus waar de geoïde 30 m (100 ft) onder of boven de ellipsoïde ligt, is de hoogtefactor ongeveer 5 ppm uit. Wanneer de meting zijn gecombineerde factor opgeeft, typ die dan.
:::

## Lokale (aangenomen) coördinaten

1. Kies {{ui:Lokaal}}.
2. Typ voor **Controlepunt 1** het nummer van het meetpunt (of kies {{ui:Kiezen}} en klik erop op het plan). De lokale coördinaten ervan worden ernaast getoond.
3. Typ de **raster**-E en -N, of de breedte- en lengtegraad in het derde vak (bijvoorbeeld `30.2672, -97.7431`).
4. Doe hetzelfde voor **Controlepunt 2**, zo ver mogelijk van het eerste.
5. CivilCraft toont de gevonden **Schaal** en **Rotatie**, en herinnert u eraan: **Twee punten passen altijd exact — controleer een derde.**
6. Geef een **Checkpunt** op dezelfde manier. CivilCraft toont hoe ver de aanpassing het van de rastercoördinaten die u typte legt (zijn sluitfout, in projecteenheden en ppm). Een grote sluitfout betekent een verkeerd punt, een typfout, of coördinaten in een andere eenheid.
7. Kies {{ui:Toepassen}}.

Een schaal ver van 1 (buiten 0.5 tot 2) wordt geweigerd: controleer de punten en hun eenheden.

## Wat is gecontroleerd

- De schaalfactor en convergentie komen overeen met PROJ (pyproj 3.7.1 met PROJ 9.5.1), de coördinatenbibliotheek die de meeste GIS-programma's gebruiken, tot 1 deel op een miljard bij meer dan 300 stelsels met conforme projecties (state plane, UTM, dwarse Mercator, Lambert-conforme kegelprojectie), en in de browser bij een punt dat op het plan is gekozen.
- Terrein- en lokale stappen rekenen heen en weer tot 1 deel op een miljard; twee controlepunten geven de schaal en rotatie terug waarmee ze zijn gemaakt; een checkpunt 0.05 ft ernaast toont een sluitfout van 0.05 ft.
