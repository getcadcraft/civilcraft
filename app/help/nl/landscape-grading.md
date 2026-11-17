---
title: Grading voor landschap
summary: Plateaus, bermen, wadi's en vrije grading met hoogtepunten en hoogtelijnen die u sleept, live ontgraving en ophoging, hellingsanalyse, stroompijlen en waterplassen, alles in het ontworpen terrein van CivilCraft.
keywords: keermuur, keermuren, verticale zijde, wand in plaats van helling, talud per zijde, ophogingsdijk, grading, landschapsgrading, plateau, terras, plaat, berm, heuvel, wadi, hoogtepunt, hoogtelijnen, hoogtelijnen bewerken, ontgraving en ophoging, grondverzet, hellingsanalyse, toegankelijkheid, steile hellingen, stroompijlen, afwatering, waterplassen, plassen
from: e1559eb9
---

Alles hier wordt in het **ontworpen terrein** gegraded, met dezelfde grading als platen en corridors. Het **bestaande maaiveld** wordt nooit gewijzigd, en Grondverzet telt het allemaal mee. Het menu Grading staat in de groep Landschap.

## Plateaus

{{ui:Grading}} › {{ui:Plateau}}, klik daarna de hoeken en druk op {{key:Enter}}. Het plateau begint op het gemiddelde maaiveldniveau eronder; typ een **Hoogte** om het in te stellen, of maak het leeg om het weer het maaiveld te laten volgen. Een **Verval** in % en **Verval naar** in graden (0 = oost, 90 = noord) kantelen het. De zijden worden gegraded naar het maaiveld bij het **Ontgravingstalud** en het **Ophogingstalud** (horizontaal tot 1).

## Hellingen per zijde en keerwanden

Onder **Zijden en keerwanden** in de Eigenschappen van een plaat, een plateau of een berm kan elke zijde op zijn eigen manier worden gegraded. Zijde 1 loopt van de eerste hoek die u aanklikte naar de tweede, zijde 2 van de tweede naar de derde, enzovoort.

- **Alle zijden**: **Hellend** gebruikt de bovenstaande ontgravings- en ophogingstaluds op elke zijde; **Verticaal: keerwanden** zet een wand op elke zijde.
- Per zijde: **Zoals hierboven**, **Eigen taluds** (typ een ontgravings- en een ophogingstalud voor die zijde) of **Verticaal (keerwand)**.
- Typ een talud als `3` of `3:1` (horizontaal tot 1 verticaal), `33%` of `18.4°`; het wordt getoond als H:1. Het eigen **Ontgravingstalud** en **Ophogingstalud** van de plaat nemen hetzelfde aan.
- Een verticale zijde heeft geen ophogingsdijk: een keerwand loopt langs de rand, van de plaat omlaag naar het bestaande maaiveld (bij ophoging) of van het maaiveld omlaag naar de plaat (bij ontgraving). **Wanddikte** (0.3 m of 1 ft om mee te beginnen) is hoeveel het maaiveld van de plaatrand naar het bestaande maaiveld stapt. Ontgravings- en ophogingsvolumes laten de ophogingsdijk weg die die zijde niet meer heeft.
- Waar een wand op een hellende zijde stuit, wikkelt de helling zich om het uiteinde van de wand; twee wanden komen samen in een verstek.
- Onder de velden: de lengte van de wanden, het blootgestelde vlak (hoogte × lengte), de hoogste en de gemiddelde hoogte.

Het plan tekent de buitenkant van elke wand met korte streepjes erover en de hoogte aan beide uiteinden en op het hoogste punt (op de laag keerwanden, die ook naar DXF en DWG gaat). De 3D-weergave toont de wanden als volumes (Tonen › Keerwanden), en GLB-, OBJ- en USD-exports bevatten ze. Doorsneden over de rand tonen de trede.

**Waarschuwingen** (in Eigenschappen en in het Problemen-paneel): een wand hoger dan **Waarschuwen boven een wandhoogte van** (1.0 m of 3.3 ft om mee te beginnen) "kan een door een constructeur ontworpen wand of een vergunning vereisen; controleer de lokale regels", en, wanneer u de **Steilste helling die de grond houdt** typt, elke zijde waarvan het ontgravings- of ophogingstalud steiler is dan dat. Het zijn waarschuwingen: de grading wordt nog steeds gebouwd. Elke wijziging is één stap voor {{key:Mod+Z}}.

## Bermen

{{ui:Grading}} › {{ui:Berm}}: een heuvel waarvan de top zijn **Hoogte** boven het gemiddelde maaiveld eronder is, met de zijden naar buiten gegraded.

## Wadi's

{{ui:Grading}} › {{ui:Wadi}}, klik daarna langs de wadi **in de richting waarin het water stroomt** en druk op {{key:Enter}}. Stel de **Diepte**, de **Bodembreedte** (0 voor een V) en de **Taludhelling** in. Zonder **Verval** volgt zijn bodem het maaiveld, op zijn diepte eronder, en loopt hij nooit bergop; typ een verval om hem vanaf het begin een gelijkmatig verval te geven.

## Hoogtepunten en hoogtelijnen

1. {{ui:Grading}} › {{ui:Gradinggebied}}: klik op de omtrek van het gebied dat u wilt vormen.
2. {{ui:Grading}} › {{ui:Hoogtepunt}}: klik binnen het gebied. Typ het hoogtepunt in Eigenschappen, of gebruik de knoppen ▲ ▼.
3. {{ui:Grading}} › {{ui:Hoogtelijn bewerken}}: klik op een hoogtelijn binnen het gebied om hem te nemen als lijn die u kunt hervormen.

Selecteer een hoogtepunt of een hoogtelijn en **sleep** hem (of zijn punten) op het plan: het terrein volgt als u loslaat, één ongedaan-maakstap. Binnen het gebied wordt het maaiveld opnieuw opgebouwd vanaf zijn rand (waar het het bestaande maaiveld raakt), de hoogtepunten en de bewerkte hoogtelijnen.

## Ontgraving en ophoging, live

De Eigenschappen van elk grading-object tonen zijn **Ontgraving** en **Ophoging** en die van de hele locatie, met de rastermethode die Grondverzet gebruikt, terwijl u wijzigt. Problemen (buiten het terrein, een omtrek die zichzelf kruist) worden daar vermeld.

## Gradingcontroles

In de sectie **Gradingcontroles** links:

- **Hellingsanalyse** kleurt het terrein naar helling: tot de zachte grens, daartussen, en steiler dan de steile grens (5 % en 33.3 % om mee te beginnen: de gebruikelijke 1:20 voor toegankelijke routes en 1:3 voor maaien). De legenda zegt hoeveel van het gebied in elke categorie valt. De steile gebieden worden ook op bladen afgedrukt.
- **Stroompijlen en waterplassen** tekent welke kant het water op stroomt en markeert elke plek waar het zou plassen, met de diepte; de sectie zegt hoeveel plekken er zijn, welke de diepste is en hoeveel water ze bevatten.

De controles lezen het ontworpen terrein wanneer er iets gegraded is, anders het bestaande maaiveld.
