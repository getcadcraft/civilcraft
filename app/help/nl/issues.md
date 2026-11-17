---
title: Issues en BCF
summary: Zet een probleem vast op het plan, een tracéstationering, een terreinpunt of een leiding, geef het een status en reacties, en wissel de issues uit als BCF 2.1-bestanden naast het LandXML-bestand.
keywords: issue, issues, bcf, reactie, markup, opleverpunt, defect, bouwplaats, pin, status, open, opgelost, gesloten, bim collaboration format, landxml, problemen
from: e44153b1
---

Een issue is een notitie die is vastgezet op een plek in uw CivilCraft-tekening, met een titel, een status en reacties. Gebruik het om bouwplaatsmedewerkers of een ander programma te laten weten waarnaar ze moeten kijken, en om hun antwoorden terug te lezen.

## Een issue toevoegen

1. Open **Terrein, Meer, Issues (BCF)...**
2. Typ een titel en wat er niet klopt.
3. Kies waar u het vastzet: het middelpunt van de plattegrond, het terreinpunt in het midden, een stationering van het geselecteerde tracé (typ de stationering en een offset; rechts is positief), of de geselecteerde leiding, het kunstwerk of de elementlijn.
4. Druk op **Issue toevoegen**. De pin verschijnt op het plan als een klein ruitje met het nummer.

Klik op de titel van een issue om ernaartoe te zoomen, wijzig de status in de lijst (Open, Actief, Opgelost, Gesloten) en voeg reacties toe. Elke wijziging is één stap ongedaan maken, en issues worden opgeslagen in het projectbestand.

## Ze uitwisselen als BCF

- **BCF exporteren** schrijft een BCF 2.1-bestand met één topic per issue: titel, status, reacties en één weergave met een orthogonale plancamera en de pin.
- **BCF importeren** leest een BCF-bestand (bestanden van versie 2.0 en 3.0 worden gelezen voor zover ze overeenkomen met 2.1). Een topic met een guid die u al hebt, werkt dat issue bij (status, nieuwe reacties) in plaats van een tweede issue toe te voegen.
- **Van Problemen** maakt een issue van elk open item in het paneel Problemen dat aangeeft waar het zich bevindt.

BCF bevat meters in de eigen coördinaten van dit project, zonder verschuiving. Het andere programma moet in hetzelfde coördinatenstelsel werken als uw LandXML-bestand, wil de pin op de juiste plek terechtkomen. Het element waarnaar een pin verwijst (tracé, stationering, offset, leiding) wordt meegestuurd als labels die beginnen met "cc:", die CivilCraft weer leest.

## Wat niet is gecontroleerd

De pins en weergaven zijn alleen getest door een bestand te schrijven en het in CivilCraft terug te lezen. Nog geen enkel ander BIM-programma heeft ze geopend. Of een BCF-"weergave naar wereldschaal" de volledige of de halve hoogte van de weergave betekent, verschilt per programma: CivilCraft schrijft de volledige hoogte.
