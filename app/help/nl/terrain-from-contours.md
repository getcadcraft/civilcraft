---
title: Terrein uit hoogtelijnen
summary: Maak het terreinoppervlak uit een hoogtekaart: kies de lijnlagen, geef aan waar de hoogte van elke lijn vandaan komt, controleer op kruisingen en dubbele lijnen, en bouw. Hoogtelijnen worden breeklijnen, met platte driehoeken op ruggen en dalen hersteld. Een kaart die uit een afbeelding of PDF is overgetrokken, kan worden geschaald en geplaatst met twee bekende punten.
keywords: hoogtelijnen, terrein uit hoogtelijnen, oppervlak uit hoogtelijnen, topografische kaart, meetkaart, geen coördinaten, breeklijnen, platte driehoeken, rug, dal, heuveltop, kruisende hoogtelijnen, dubbele hoogtelijnen, hoogte-interval, kaart schalen, twee punten, kaart plaatsen, DXF, DWG, shapefile
from: e6161653
---

Een landmeter stuurt soms een hoogtekaart: lijnen met hoogtes, maar zonder punten. CivilCraft bouwt het bestaande terrein uit die lijnen.

## De hoogtelijnen inlezen

Open de kaart als lijnwerk: een DXF- of DWG-tekening, een shapefile of GeoJSON (**GIS** › {{ui:Importeren}}, of sleep het bestand op het plan). De lijnen komen binnen als **kaartlagen**. Kies onder **Terrein** › {{ui:Meer}} de optie {{ui:Terrein uit hoogtelijnen}}.

## Aangeven waar elke hoogte vandaan komt

Vink de lagen aan die hoogtelijnen bevatten en kies daarna **Hoogte uit**:

- {{ui:De eigen hoogten van de lijnen}}: een lijn waarvan alle hoekpunten dezelfde hoogte hebben (een 3D-polylijn, of een polylijn met een hoogte). Een lijn op 0 is planlijnwerk en heeft geen hoogte.
- Een **getalveld** van de laag (bijvoorbeeld ELEV), wanneer de kaart er een bevat.
- {{ui:Een begin en een interval, in de volgorde waarin de lijnen staan}}: voor lijnen zonder enige hoogte. De eerste vermelde lijn krijgt de **Hoogte van de eerste lijn**, de volgende krijgt die hoogte plus het **Hoogte-interval**, enzovoort. Zet de lijnen van laag naar hoog (of herschik ze in de laag).

## Controleren en daarna bouwen

{{ui:Controleren}} somt op wat er niet klopt, met woorden, voordat er iets verandert:

- een lijn zonder **hoogte** of met minder dan twee punten;
- een **dubbele** lijn (dezelfde vorm twee keer, ook als die andersom is getekend);
- twee lijnen die elkaar **kruisen**, op verschillende of op dezelfde hoogte (ook een lijn die zichzelf kruist), met de plaats;
- een hoogte die **niet op het interval** ligt (een typefout zoals 105.5 op een kaart van 1 m).

Vink {{ui:Lijnen weglaten die een andere kruisen}} aan om de lijn te laten vallen die de meeste andere kruist (daarna de volgende, tot er niets meer kruist): een losse lijn die elke hoogtelijn doorsnijdt, is degene die verdwijnt, niet de hoogtelijnen. **Lijnen vereenvoudigen binnen** dunt hoekpunten uit die dichter bij een rechte lijn liggen dan die afstand.

{{ui:Het maaiveld bouwen}} voegt de lijnen als breeklijnen toe aan het bestaande terrein (één stap ongedaan te maken), zodat het oppervlak precies door elke hoogtelijn gaat. Met {{ui:Vlakke driehoeken op ruggen, dalen en heuveltoppen herstellen}} aangevinkt en een interval opgegeven, voegt CivilCraft ook een punt toe binnen elke vlakke driehoek (een driehoek waarvan alle hoekpunten op één hoogtelijn liggen), op de hoogte waarop de helling ernaast doorloopt, nooit meer dan een half interval van de hoogtelijn af. Zonder dat komen rugtoppen, dalbodems en heuveltoppen als platte platen uit. Op een testheuvel daalde de fout ten opzichte van het ware oppervlak met een kwart; op een rug met 40 %.

## Een kaart zonder coördinaten

Voor een hoogtekaart die uit een afbeelding of PDF is overgetrokken, opent u **De lagen schalen en plaatsen aan de hand van twee bekende punten**. Geef twee punten op de kaart en waar ze werkelijk liggen; de aangevinkte lagen worden geschaald, gedraaid en verplaatst om te passen (één stap ongedaan te maken; hoogtes blijven ongewijzigd). Dezelfde twee punten geven de schaal (zichtbaar in de melding) en de rotatie.

Het oppervlak is zo goed als de kaart: tussen twee hoogtelijnen is het een vlak, dus het werkelijke terrein daartussen is niet bekend. Controleer het resultaat aan de hand van hoogtepunten voordat u erop vertrouwt.
