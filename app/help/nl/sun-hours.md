---
title: De zonuren op een locatie berekenen
summary: Kies een dag (of een seizoen) en een tijdzone, en zie de uren directe zon op elke wand van elke bouwmassa en op de grond eromheen, met de grond getekend op het plan en de getallen als CSV.
keywords: zon, zonuren, schaduw, zonlicht, zontoegang, daglichturen, gevel, wand, seizoen, zonnewende, equinox, tijdzone, zomertijd, breedtegraad, lengtegraad, CSV, raster
from: 4e32a314
---

**Zonuren** telt de uren directe zon die elke wand van elke bouwmassa bereiken en de grond eromheen, op een dag die u kiest of gemiddeld over een seizoen. De bouwmassa's en de grond zelf werpen schaduw; niets anders doet dat (geen bomen, geen buren die u niet heeft getekend). Hemellicht dat geen directe zon is, wordt niet meegeteld.

## Voordat u begint

De positie van de zon komt uit de breedtegraad en lengtegraad van de locatie, die uit het **coördinatenstelsel** van het project komen. Een project zonder coördinatenstelsel wordt geweigerd met een melding: stel het eerst in (**Coördinaten** in de groep GIS). Een handmatig ingevoerde breedte- en lengtegraad zou een gok zijn, daarom is er geen vak voor.

## Berekenen

In **Eigenschappen**, onder **Bouwmassa's**, **Zonuren**:

1. Kies de **Dag**. Die begint op de dag dat de zon het laagst staat op uw locatie (21 december, of 21 juni op het zuidelijk halfrond). Voor een seizoen vinkt u **Over een seizoen** aan, kiest u de **Laatste dag** en hoeveel dagen er tussen de steekproeven liggen.
2. Typ de **Tijdzone**: een naam zoals `America/Mexico_City`, of een verschil met UTC zoals `-6`. Een naam volgt de zomertijdregels van die zone voor de dag; een verschil dat u typt wordt precies gebruikt zoals u het typt, dus gebruik het verschil dat op die dag geldt. De regel onder het vak laat zien welk verschil is gevonden.
3. Kies hoe vaak de zon wordt geplaatst (elke 5, 10, 15 of 30 minuten), en klik daarna op **Zonuren berekenen**. Een seizoen loopt op achtergrondwerkers; met **Stoppen** wordt het geannuleerd.

## Wat u krijgt

- Een tabel per bouwmassa: de **slechtste wand**, het **gemiddelde** en de **beste wand**, in uren per dag, en een tabel van elke wand met de gevelrichting en zijn uren per verdieping.
- De grond rond de massa's, op het plan getekend van donker (geen zon) tot geel (het meeste dat een cel krijgt), met een legenda. Cellen onder een massa blijven leeg. Met **De grond op het plan tonen** schakelt u dit uit.
- **Wanden als CSV** en **Grond als CSV** slaan de getallen op.

Voor een seizoen zijn de cijfers het gemiddelde per dag over de steekproefdagen. Er wordt niets in het project opgeslagen: het resultaat is om naar te kijken, en bij opnieuw berekenen wordt het opnieuw gemaakt.

## Goed om te weten

- Een wand telt een moment als zonnig alleen wanneer hij naar de zon is gericht en niets in de weg staat. Een wand die van de zon af is gericht, krijgt niets.
- De grond wordt bemonsterd op een raster dat afhangt van de grootte van de locatie, en de positie van de zon wordt bepaald in het midden van elke tijdstap, zodat de uren kloppen tot op ongeveer de stap die u koos.
- De positie van de zon is een gepubliceerde astronomische formule, nauwkeurig tot ongeveer één boogminuut.
