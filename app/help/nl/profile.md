---
title: Een verticaal profiel ontwerpen
summary: Open de profielweergave, begin een ontwerpprofiel vanaf het maaiveld, voeg PVI's toe en versleep ze, stel de lengtes van verticale bogen in, en lees hellingen, K-waarden en hoogste en laagste punten af.
keywords: profiel, verticaal tracé, pvi, verticale boog, helling, k-waarde, kruin, dal, bvc, evc, profielweergave, afgewerkt maaiveld, fg, bestaand maaiveldprofiel, elementlijnen in profiel, kruisingen, geprojecteerd, stoeprand, greppel, labels
from: e9182bfa
---

Elk tracé heeft één ontwerpprofiel: een lijst van PVI's (stationering en hoogte) die met rechte hellingen zijn verbonden, met een symmetrische parabolische verticale boog bij elke tussenliggende PVI die een lengte heeft. Het bestaande maaiveldprofiel wordt voor u uit het oppervlak bemonsterd.

## De profielweergave openen

1. Selecteer het tracé (klik erop met {{ui:Selecteren}}).
2. Druk op {{key:R}}, of klik op {{ui:Profiel}} in de werkbalk, of op {{ui:Profielweergave}} onderaan het rechterpaneel.
   De profielweergave opent onder het plan met het bestaande maaiveld langs het tracé. Bij twee of meer tracés kiest u er een in de lijst links in de profielbalk.

De weergave toont altijd het hele tracé en rekt de hoogten uit om het paneel te vullen; de verticale overdrijving staat linksonder, bijvoorbeeld "Verticale overdrijving 10×". Er kan niet in- of uitgezoomd of verschoven worden.

Beweeg de aanwijzer langs het profiel: de balk toont de stationering, het maaiveld en de ontwerphoogten, de helling en het ontgraven of ophogen daar, en een stip volgt op het tracé in het plan.

## Het ontwerpprofiel starten

1. Klik in het rechterpaneel onder **Ontwerpprofiel** op {{ui:Beginnen vanaf het maaiveld}}.
   Er worden twee PVI's op het maaiveld geplaatst aan de twee uiteinden van het tracé, verbonden door één rechte helling. De statusbalk zegt "Ontwerpprofiel gestart op het maaiveld aan beide uiteinden. Zet PVI's toevoegen aan en klik om hellingknikken toe te voegen; geef ze een booglengte in de tabel."

Als het tracé het oppervlak niet kruist, krijgt u "Dit tracé heeft geen maaiveld onder zich om vanaf te beginnen." Voeg dan PVI's toe door te klikken (volgende sectie).

## PVI's toevoegen

1. Druk op {{key:I}}, of klik op {{ui:PVI's toevoegen}} in de profielbalk. De knop blijft ingedrukt.
2. Klik in het profiel waar u een hellingknik wilt. Er wordt een PVI toegevoegd op die stationering en hoogte, afgerond op 0.01, en geselecteerd.
3. Voeg zoveel toe als nodig, en druk dan opnieuw op {{key:I}} om te stoppen met toevoegen.

Een klik waar al een PVI staat, wordt geweigerd ("Er staat al een PVI bij …"). PVI's blijven altijd in volgorde van stationering.

## PVI's aanpassen

- **Sleep** een PVI in het profiel om hem te verplaatsen. Hij kan niet langs zijn buren. De verplaatsing is één stap ongedaan te maken.
- **Typ** exacte waarden in de PVI-tabel in het rechterpaneel: **Stationering**, **Hoogte** en **Booglengte L** (lengte van de verticale boog). Druk na elke waarde op {{key:Enter}}.
- **Verwijder** een PVI met de x aan het eind van zijn rij, of selecteer hem (klik erop) en druk op {{key:Delete}}. Als de profielweergave de focus heeft, verwijdert {{key:Backspace}} hem ook.

De eerste en laatste PVI krijgen nooit een boog.

## Verticale bogen

1. Typ een lengte in **Booglengte L** voor een tussenliggende PVI, bijvoorbeeld 200.
2. De boog wordt getekend, gecentreerd op de PVI. Het profiel en het rechterpaneel tonen het soort (kruin of dal), L en K, de BVC- en EVC-stationeringen en -hoogten, en het hoogste of laagste punt als dat binnen de boog ligt.

K wordt berekend uit L (K = L gedeeld door het algebraïsche verschil van de hellingen, in procent). U typt L; K direct typen is nog niet beschikbaar.

Als een verticale boog niet past, zegt een rood kader waarom: hij loopt terug in de PVI of boog ervoor, of voorbij de volgende PVI, en hoeveel ruimte er aan die kant is (een boog heeft de helft van zijn lengte nodig aan elke kant van zijn PVI). De knop stelt **de langste boog die past** in, met zijn K, als één stap ({{key:Mod+Z}} maakt het ongedaan). Of verplaats de PVI's uit elkaar.

## De gegevens lezen

Onder de PVI-tabel geeft een lijst elke helling in procent ("Helling 1: +1.25%") en elke boog, bijvoorbeeld "Kruin bij 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", daarna "Hoogste punt 1+62.40, 254.12".

Als de PVI's niet tot beide uiteinden van het tracé reiken, meldt een opmerking dat. Een corridor wordt alleen gebouwd waar het profiel en het tracé overlappen.

## Elementlijnen in het profiel

Elementlijnen worden ook in de profielweergave getoond, zodat u een stoeprand, greppel of muurkop kunt zien tegen het profiel van de weg.

- Waar een elementlijn het tracé **kruist**, toont het profiel een klein ruitje op die stationering en hoogte, met de naam van de lijn en zijn hoogte daar (de eigen hoogte van de lijn, berekend langs het segment dat kruist).
- Typ een afstand in {{ui:Naast het tracé binnen}} om ook de elementlijnen te tekenen die **naast** het tracé lopen binnen die afstand, als gestreepte lijnen op hun eigen hoogte. Leeg of 0 toont alleen de kruisingen.
- De markeringen en labels volgen elke wijziging: verplaats een hoekpunt, typ een helling of verhoog de lijn, en het profiel toont meteen de nieuwe hoogten.
- Klik op het ruitje van een kruising om die elementlijn te selecteren; de geselecteerde lijn wordt in de markeringskleur getekend.
- {{ui:Elementlijnen}} in de profielbalk verbergt of toont ze allemaal. Beide instellingen worden met het project bewaard.

Zie [Elementlijnen](topic:feature-lines).

## Volgende

- [Een wegcorridor maken](topic:corridor) langs het tracé en dit profiel.
- Het profiel wordt met het tracé naar LandXML geschreven; zie [LandXML uitwisselen](topic:landxml).
