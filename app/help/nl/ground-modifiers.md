---
title: Maaiveldaanpassingen en live niveaus
summary: Alles wat het ontworpen maaiveld vormt in één geordende lijst (de latere wint waar ze overlappen), ontgraving en ophoging per aanpassing, aansluitcontroles in het Problemen-paneel, en hoogtepunten en hellingpijlen die het maaiveld live uitlezen.
keywords: maaiveldaanpassingen, stapel, volgorde, ontworpen maaiveld, bestaand maaiveld, overlap, ontgraving en ophoging, aansluiting, keerwand, bestratingsrand, bedniveau, bordes, hoogtepunt, hoogte, hellingpijl, hellingaanduiding, verval
from: 3998a5b0
---

Ontworpen maaiveld = bestaand maaiveld + de aanpassingen, in volgorde. Het bestaande maaiveld wordt nooit gewijzigd.

## De lijst

{{ui:Niveaus}} › {{ui:Maaiveldaanpassingen…}} toont elk object dat het maaiveld vormt: plateaus, bermen, wadi's, gradinggebieden, bestrating en paden, beplante vlakken met een afgewerkt niveau, en trappen en hellingbanen waarvan het vakje **Vormt het maaiveld** is aangevinkt (met hun onder- en bovenniveau). Waar twee elkaar overlappen, wint de **latere**. Sleep een rij of gebruik de pijltjes om de volgorde te wijzigen; het maaiveld wordt meteen opnieuw opgebouwd. Elke rij toont zijn ontgraving en ophoging (wat hij vormt na de rijen erboven), met het totaal onder de lijst.

## Aansluitcontroles

Het Problemen-paneel toont, met **ga naar**:

- een keerwand waarvan de hoge zijde boven zijn bovenkant ligt (grond over de wand), of waarvan de lage zijde zijn fundering toont;
- een beplant vlak waarvan het afgewerkte niveau boven de bestratingsrand ligt waar het op aansluit, of meer dan de gebruikelijke 150 mm eronder;
- trappen waarvan de onder- of bovenkant niet aansluit op de verharding waarop ze uitkomen;
- twee aanpassingen die overlappen (de latere wint daar).

Een keerwand kan zijn bovenkant de hoge zijde van het maaiveld laten volgen: zijn hoogte wordt opnieuw berekend telkens als het maaiveld verandert.

## Een keerwand die het maaiveld vormt

Selecteer een keerwand en vink **Vormt het maaiveld** aan. De strook onder de wand (even breed als de wand dik is) komt in de lijst als aanpassing:

- de rand aan de **hoge zijde** wordt op het maaiveld daar gehouden, station voor station, zodat de bovenkant van de wand de hoge zijde volgt (met de afdekking erop). Vul een **Bovenkant**-niveau in en de hoge zijde wordt op dat niveau min de afdekking gehouden;
- de rand aan de **lage zijde** wordt gehouden op het niveau **Maaiveld vastgehouden aan lage zijde** dat u invult, of, als dat leeg blijft, op het maaiveld daar;
- de hoge zijde is de zijde waarvan het maaiveld over de hele wand hoger ligt, dus die wisselt nooit langs de wand;
- het maaiveld buiten de strook wordt niet gewijzigd, en het bestaande maaiveld nooit.

Net als elke aanpassing staat hij in de lijst, en een aanpassing die erna komt, wint waar ze overlappen. Een wand waarvan het vastgehouden niveau aan een uiteinde meer dan de gebruikelijke 150 mm van het bestaande maaiveld daar af ligt, krijgt een waarschuwing in het Problemen-paneel (met **ga naar**). Een vrijstaande wand vormt het maaiveld niet. Het vakje staat uit in bestanden van eerdere versies, zodat die openen zoals ze waren.

## Hoogtepunten en hellingpijlen

{{ui:Hoogtepunt}} (één klik) en {{ui:Hellingpijl}} (twee klikken) lezen het maaiveld uit telkens als ze getekend worden: verplaats of herniveleer een object en de labels volgen. Kies in Eigenschappen of een label het ontworpen of het bestaande maaiveld leest; labels van het bestaande maaiveld staan tussen haakjes. Pijlen wijzen bergafwaarts en tonen `1:20 (5.0 %)`.
