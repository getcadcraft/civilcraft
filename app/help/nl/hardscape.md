---
title: Bestrating, muren en trappen
summary: Bestrating met verval naar een afvoer of een dwarshelling, een patroon en de opbouw ervan; paden die het maaiveld volgen; keer- en vrijstaande muren met getrapte funderingen; kantstenen; hellingbanen en trappen gecontroleerd tegen hun grenswaarden; IFC-export.
keywords: verharding, bestrating, tegels, patio, terras, verval, afvoer, dwarshelling, visgraat, strekverband, pad, wandelpad, keermuur, tuinmuur, fundering, afdekking, kantsteen, randafwerking, hellingbaan, toegankelijkheid, trappen, traptreden, optreden, trede, bordes
from: 51475877
---

Verharding wordt elke keer opnieuw uit het maaiveld berekend, dus ze volgt het terrein en wordt opnieuw gegenereerd wanneer het maaiveld of de lijn ervan verschuift. Sleep de hoeken op het plan zoals bij elke lijn. Open het via {{ui:Verharding}} in de groep Landschap.

## Bestrating

Klik op de hoeken en druk op {{key:Enter}}. In Eigenschappen:

- **Niveau**: leeg = het gemiddelde maaiveld eronder.
- **Verval**: niveau, een **dwarshelling** (een % in een richting) of **naar een afvoer**: CivilCraft vraagt u te klikken waar de afvoer komt, waarna elke hoek vanaf de afvoer stijgt met het verval. Pijlen op het plan tonen het verval.
- **Patroon** (raster, strekverband, visgraat) met de eenheidsgrootte, voeg en hoek; **Randafwerking** breedte. Op een blad worden voegen kleiner dan een millimeter weggelaten.
- De bestrating maakt deel uit van het ontworpen oppervlak. De lagen (tegels, bedding, fundering) gaan naar de IFC en de hoeveelheden.

## Paden

Klik langs het pad en druk op {{key:Enter}}. Het volgt het maaiveld, met zijn **Dwarshelling** naar de rechterkant. Een pad dat steiler is dan **Steilste toegestaan** wordt waar het is met `!` op het plan gemarkeerd, en Eigenschappen zegt hoe steil het wordt.

## Muren

Klik langs de muur en druk op {{key:Enter}}. Een muur is **keerwand** of **vrijstaand**. Zonder **Bovenkant** staat hij over de hele lengte zijn **Hoogte** boven het maaiveld; typ een bovenkant om hem horizontaal te houden. Zijn **fundering** zit een vaste diepte onder het maaiveld en trapt af in hele treden, zodat hij er tussen horizontaal blijft. Eigenschappen geven de lengte, hoogten, vlakoppervlak en funderingstreden van de wand; het plan toont de bovenkant en onderkant van de muur (TW / BW) aan elk uiteinde.

:::warning
Een keerwand hoger dan 1.2 m (4 ft) wordt gemarkeerd: een constructeur ontwerpt die.
:::

## Kantstenen

Klik langs de kantsteen en druk op {{key:Enter}}; stel de breedte en de opstand in.

## Hellingbanen

Klik van onder naar boven en druk op {{key:Enter}}. De niveaus komen van het maaiveld aan elk uiteinde, tenzij u ze typt. Een hellingbaan krijgt een bordes bij elke stijging van 750 mm (2.5 ft) en wordt gecontroleerd tegen **Steilste toegestaan** (1:12 om mee te beginnen) en een minimale breedte; Eigenschappen zeggen hoe lang hij zou moeten zijn.

## Trappen

Klik op de voorrand van de onderste trede, daarna waar de trap de bovenkant bereikt, en druk op {{key:Enter}}. Het aantal optreden komt uit de hoogte en de **Grootste optrede**; de aantrede uit de comfortregel 2R + G ≈ 630 mm, nooit onder de **Kleinste aantrede**; een bordes na ten hoogste **Optreden per loop maximaal** optreden. Eigenschappen zeggen of ze tussen de twee punten passen of hoeveel langer ze moeten zijn.

:::note
De grenzen voor hellingbanen en trappen zijn gelabelde standaardwaarden. Stel de waarden in die uw bouwregelgeving vereist.
:::

## Buiten CivilCraft

- Meer › {{ui:Landschaps-IFC exporteren}}: bestrating en paden als `IfcPavement`, muren als `IfcWall` (keerwanden als RETAININGWALL) met hun lagen, kantstenen als `IfcKerb`, hellingbanen als `IfcRamp`, trappen als `IfcStair` met hun optreden en treden.
- De plantenstaat **Naar TakeoffCraft sturen** brengt de bestratingsoppervlakken en laagvolumes, wandvlakoppervlakken en -lengtes, kantsteenlengtes en aantallen treden mee.
- Het detailblad tekent de doorsnede van elke muur, de opbouw van elke bestrating en elke trap. Zie [Landschapsbladen](topic:landscape-sheets).
