---
title: Bestrating, muren en trappen
summary: Bestrating met val naar een afvoer of een dwarshelling, een patroon en zijn opbouw; paden die het terrein volgen; keer- en vrijstaande muren met getrapte funderingen; kantstenen; hellingbanen en trappen gecontroleerd tegen hun grenzen; IFC-export.
keywords: verharding, bestrating, tegels, patio, terras, val, afvoer, dwarshelling, visgraat, halfsteens verband, pad, wandelpad, keermuur, tuinmuur, fundering, afdekking, kantsteen, rand, hellingbaan, toegankelijkheid, trappen, optreden, betreding, bordes
from: d34b4466
---

Verharding wordt elke keer opnieuw uit het terrein berekend, zodat ze het terrein volgt en opnieuw wordt gegenereerd wanneer het maaiveld of zijn lijn verschuift. Sleep de hoeken op het plan zoals elke lijn. Open haar via {{ui:Verharding}} in de groep Landschap.

## Bestrating

Klik op de hoeken en druk op {{key:Enter}}. In Eigenschappen:

- **Niveau**: leeg = het gemiddelde van het terrein eronder.
- **Val**: vlak, een **dwarshelling** (een % naar een richting) of **naar een afvoer**: CivilCraft vraagt u te klikken waar de afvoer komt, waarna elke hoek vanuit de afvoer stijgt met de val. Pijltjes op het plan tonen de vallen.
- **Patroon** (raster, halfsteens verband, visgraat) met de eenheidsgrootte, voeg en hoek; **Randbreedte**. Op een blad worden voegen kleiner dan een millimeter weggelaten.
- De bestrating maakt deel uit van het voorgestelde oppervlak. Haar lagen (tegels, bedding, fundering) gaan in de IFC en de hoeveelheden.

## Paden

Klik langs het pad en druk op {{key:Enter}}. Het volgt het terrein, met zijn **Dwarshelling** naar zijn rechterkant. Een pad dat steiler is dan **Steilste toegestaan** wordt op het plan met `!` gemarkeerd waar het zich bevindt, en Eigenschappen zegt hoe steil het wordt.

Waar een pad een weg raakt die door een corridor is gebouwd, stopt het aan de buitenrand van de weg, op het niveau van het trottoir of de berm daar, in het voorgestelde oppervlak en in de 3D-weergave. Een pad dat een weg kruist wordt afgewerkt en getoond als twee stukken, en een einde dat tot twee keer de padbreedte te kort van de weg is getekend wordt doorgetrokken tot de rand. Het plan toont het pad nog zoals u het tekende, en de lengte en het oppervlak tellen de hele lijn mee. Zie [Een wegcorridor uitvegen](topic:corridor).

## Muren

Klik langs de muur en druk op {{key:Enter}}. Een muur is **keermuur** of **vrijstaand**. Zonder **Bovenkant** staat hij over de hele lengte zijn **Hoogte** boven het terrein; typ een bovenkant om hem horizontaal te houden. Zijn **fundering** ligt een vaste diepte onder het terrein en stapt in hele treden naar beneden, zodat hij er tussen horizontaal blijft. Eigenschappen geven zijn lengte, hoogtes, zichtoppervlak en funderingstreden; het plan benoemt de bovenkant en onderkant van de muur (TW / BW) aan elk einde.

:::warning
Een keermuur hoger dan 1.2 m (4 ft) wordt gemarkeerd: een ingenieur ontwerpt hem.
:::

## Kantstenen

Klik langs de kantsteen en druk op {{key:Enter}}; stel de breedte en de opstaande hoogte in.

## Hellingbanen

Klik van onder naar boven en druk op {{key:Enter}}. De niveaus komen van het terrein aan elk einde, tenzij u ze typt. Een hellingbaan krijgt een bordes elke stijging van 750 mm (2.5 ft) en wordt gecontroleerd tegen **Steilste toegestaan** (1:12 als start) en een minimale breedte; Eigenschappen zeggen hoe lang hij zou moeten zijn.

## Trappen

Klik op de voorrand van de onderste trede en daarna waar de trappen de bovenkant bereiken, en druk op {{key:Enter}}. Het aantal optreden komt uit de hoogte en de **Grootste optreding**; de betreding uit de comfortregel 2R + G ≈ 630 mm, nooit onder de **Kleinste betreding**; een bordes elke **Hoogste aantal optredens per loop**. Eigenschappen zeggen of ze tussen de twee punten passen, of hoeveel langer ze moeten zijn.

:::note
De grenzen voor hellingbanen en trappen zijn benoemde standaardwaarden. Stel de waarden in die uw bouwvoorschriften vereisen.
:::

## Buiten CivilCraft

- Meer › {{ui:Landschaps-IFC exporteren}}: bestrating en paden als `IfcPavement`, muren als `IfcWall` (keermuren als RETAININGWALL) met hun lagen, kantstenen als `IfcKerb`, hellingbanen als `IfcRamp`, trappen als `IfcStair` met hun optreden en betredingen.
- De plantenlijst **Naar TakeoffCraft sturen** brengt de bestratingoppervlakken en laagvolumes, muurzichtoppervlakken en lengtes, kantsteenlengtes en aantallen treden mee.
- Het detailblad tekent de doorsnede van elke muur, de opbouw van elke bestrating en elke trap. Zie [Landschapsbladen](topic:landscape-sheets).
