---
title: Hoogtelijnen, hoogten en hellingen aflezen
summary: Stel het hoogtelijninterval en de hoofdhoogtelijnen in, toon hoogtebanden, helling-pijlen en driehoeken, en lees de terreinhoogten onder de aanwijzer af.
keywords: hoogtelijnen, hoogtelijninterval, hoofdhoogtelijnen, labels, hoogtebanden, helling-pijlen, driehoeken, puntshoogte, oppervlakteanalyse, hoogteanalyse, hellinganalyse
from: 585e500a
---

Het oppervlak wordt met hoogtelijnen getoond zodra het bestaat. Alles in dit onderwerp stelt u in onder **Weergave** in het linkerpaneel. Weergave-instellingen wijzigen alleen wat u ziet (en wat u exporteert); het zijn geen ongedaan-stappen.

## Stel het hoogtelijninterval in

1. Kies onder **Weergave** een waarde bij **Hoogtelijnen elke**.
   - In voet: 0.25, 0.5, 1, 2, 5, 10 of 20 ft.
   - In meter: 0.1, 0.25, 0.5, 1, 2, 5 of 10 m.
2. Kies **Hoofd elke**: de 2e, 4e, 5e of 10e hoogtelijn.
   Hoofdhoogtelijnen worden zwaarder getekend en met hun hoogte benoemd. Ze vallen op hele veelvouden van de hoofdafstand (bij hoogtelijnen van 1 ft en elke 5e als hoofdlijn: 245, 250, 255 …).
3. Zet {{ui:Labels van hoogtelijnen}} uit als de labels een klein plan te vol maken.

Een nieuw project begint op 1 eenheid, met elke 5e hoogtelijn als hoofdlijn. Hoogtelijnen buigen bij breeklijnen; als ze recht over een stroomlijn of rug lopen, is die lijn nog geen breeklijn (zie [Oppervlak opbouwen en verfijnen](topic:build-surface)).

:::note
Hoogtelijnen worden alleen getekend als er niet meer dan 2.000 niveaus liggen tussen het laagste en het hoogste punt. Op een terrein met veel reliëf en een zeer klein interval toont het plan helemaal geen hoogtelijnen: kies dan een groter interval.
:::

## Hoogtelijnen gladmaken

Hoogtelijnen worden getekend als rechte stukken, één over elke driehoek van het oppervlak, zodat ze bij elke driehoekszijde een kleine hoek maken. **Gladstrijken van hoogtelijnen** onder **Weergave** rondt die hoeken af:

- **Geen (rechte stukken)**: de getekende lijnen zoals ze zijn. Dit is wat een nieuwe of oudere tekening toont.
- **Licht**: hoeken een beetje afgerond. Een lijn verschuift nooit meer dan 10% van de weg naar de volgende hoogtelijn, en nooit verder van haar rechte stuk dan een zesde van de lengte van dat stuk.
- **Sterk**: een vloeiende kromme. Een lijn verschuift nooit meer dan 25% van de weg naar de volgende hoogtelijn, en nooit verder van haar rechte stuk dan een derde van de lengte van dat stuk.

Bij beide keuzes snijdt een gladgestreken hoogtelijn elke driehoekszijde nog steeds op hetzelfde punt als de getekende lijn, blijft binnen de driehoek die elk stuk doorkruist, en kan dus nooit een andere hoogtelijn kruisen of raken. Waar een hoogtelijn een breeklijn of de grens kruist, behoudt ze haar scherpe bocht. De gladgestreken lijnen zijn de lijnen die worden geplot en geëxporteerd (DXF, DWG, PDF, GIS en 3D), en die hebben meer hoekpunten dan de getekende lijnen.

Gladmaken wijzigt alleen de getekende lijnen. Hoogten, volumes, langsprofielen en doorsneden worden nog steeds uit het oppervlak zelf gelezen. Een hoogtelijn die precies door opmeetpunten gaat (een punt op 250.00 op de hoogtelijn 250) houdt bij elk zo'n punt een kleine hoek.

## Hoe het oppervlak achter de hoogtelijnen tot stand komt

Hoogtelijnen volgen het oppervlak, en het oppervlak volgt de **Hoogtelijnmethode** onder **Oppervlak** in het linkerpaneel. De standaard, **Triangulatie met lineaire interpolatie**, verbindt uw punten tot driehoeken en behoudt elk punt en elke breeklijn exact. De andere methoden passen eerst een regelmatig raster op de punten (kriging, minimale kromming, natural neighbor, inverse afstand en andere). Dat geeft ronder verlopende hoogtelijnen tussen de punten, maar het oppervlak gaat dan niet exact door elk punt; het oppervlakrapport onder **Oppervlak** zegt hoe ver het resultaat bij uw punten ernaast zit.

**ABOS (benadering op basis van gladstrijken)** is een van de rastermethoden. Ze heeft twee eigen instellingen: **Gladheid** (begin met 0.5; lager is gladder) en **Nauwkeurigheid** (begin met 1: het oppervlak wordt binnen 1% van het hoogtebereik van het terrein bij uw punten gebracht; typ een kleiner getal voor een nauwkeuriger aansluiting). Kan ze de nauwkeurigheid op het raster dat ze heeft niet halen, dan zegt het oppervlakrapport dat: typ een kleinere **Rasterafstand**.

## Lees overal een hoogte af

Beweeg de aanwijzer over het plan. De statusbalk toont:

- **E** en **N** onder de aanwijzer
- **Terrein** en de bestaande terreinhoogte daar, geïnterpoleerd op de driehoek onder de aanwijzer
- **Afgewerkt** en de voorgestelde hoogte, waar een plaat of corridor het terrein heeft veranderd
- "Buiten het oppervlak" buiten het oppervlak

Om een opmeetpunt exact af te lezen, kiest u {{ui:Selecteren}} en klikt u op het punt: het rechterpaneel toont zijn nummer, Easting, Northing, hoogte, beschrijving en groep.

## Toon hoogtebanden

1. Vink {{ui:Hoogtebanden}} aan.
   Het oppervlak wordt ingekleurd van laag (blauwgroen) naar hoog (oker-bruin). Onder de vinkvakjes toont een legenda het hoogtebereik van elke band.
2. Kies het aantal banden bij **Banden**: 5, 8, 10 of 12. De banden verdelen het bereik van de laagste tot de hoogste hoogte in gelijke stappen.

Banden zijn alleen om naar te kijken. Ze worden niet naar DXF geëxporteerd en niet naar PDF geplot.

## Toon helling-pijlen

Vink {{ui:Helling-pijlen}} aan. Een korte pijl op elke driehoek die groot genoeg is, wijst bergafwaarts. Vlakke driehoeken krijgen geen pijl. Pijlen zijn een snelle controle van de afwateringsrichting; de hellingwaarde zelf wordt nog niet als label getoond.

## Toon driehoeken, punten en randen

- {{ui:Driehoeken}} tekent de randen van de TIN. Zet het aan om te controleren hoe het oppervlak de punten verbindt, vooral langs breeklijnen en aan de buitenkant.
- {{ui:Punten}} tekent elk opmeetpunt; {{ui:Puntlabels}} voegt het nummer, de hoogte en de beschrijving toe (of minder: zie **Puntlabels** in [CivilCraft-instellingen](topic:settings)).
- {{ui:Breeklijnen}} tekent breeklijnen (en de grens) in oranje.
- {{ui:Rand van het oppervlak}} tekent de omtrek van het oppervlak.

## Bestaand of voorgesteld

Zodra een plaat of corridor zonder problemen afwerkt, biedt **Oppervlak** onder **Weergave** {{ui:Voorgesteld (afgewerkt)}} aan. De hoogtelijnen, banden en pijlen tonen dan het afgewerkte oppervlak, zodat u het nieuwe terrein en de overgang naar het bestaande terrein ziet. Kies weer {{ui:Bestaand terrein}} om de opmeting te zien.

## Wat er wordt geëxporteerd

DXF- en PDF-uitvoer volgt deze instellingen: wat u hebt uitgeschakeld wordt niet geschreven, en de hoogtelijnen zijn die van het getoonde oppervlak. Hoogtebanden worden nooit geëxporteerd.
