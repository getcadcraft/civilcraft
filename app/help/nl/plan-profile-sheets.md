---
title: Plan- en profielbladen
summary: Plot een tracé als een set plan- en profielbladen in één PDF, met aansluitlijnen ertussen.
keywords: plan en profiel, bladen, plotten, pdf, aansluitlijn, plantekeningen, wegontwerp, profielplot, verticale overdrijving, bladenset
from: 34b4ec78
---

Plan- en profielbladen zijn de gebruikelijke manier waarop wegontwerpen worden getekend: elk blad toont een stuk van de weg twee keer, het plan erboven en het profiel eronder, op dezelfde horizontale schaal, zodat een station in beide op dezelfde plek staat.

## De bladen maken

1. Selecteer het tracé. Klik in **Eigenschappen** op {{ui:Plan and profile sheets}}.
2. Kies het **Papier**, de **Plan-schaal** en de **Verticale overdrijving** (hoeveel keer hoger het profiel wordt getekend dan het lang is; begin met 10×). Het dialoogvenster meldt hoeveel bladen dat oplevert en hoeveel van het tracé elk blad toont.
3. Om een deel van het tracé te plotten, wijzigt u **Vanaf stationering** en **Tot stationering**.
4. Klik op {{ui:Download PDF}}. De PDF heeft één pagina per blad.

## Wat er op een blad staat

| Onderdeel | Wat het toont |
|---|---|
| Plan | Alles op het plan (hoogtelijnen, meetpunten, het tracé en zijn stationering, corridors, plateaus, elementlijnen, leidingen, dwarsprofiellijnen), gedraaid zodat dit stuk over het blad loopt, met een noordpijl die daarop is gedraaid |
| Aansluitlijnen | Een streep-puntlijn loodrecht op het tracé aan elk uiteinde dat op een ander blad doorloopt, met het label "Aansluitlijn sta 5+50.00, zie blad 2" |
| Profiel | Het bestaande maaiveld (gestreept), het ontwerpprofiel (rood), de helling van elk recht stuk en de PVI, hoogte, L en K van elke verticale boog; stationering langs de onderkant, hoogtes aan beide zijden |
| Titelstrook | De projectnaam, het tracé en zijn stationsbereik, "Blad 1 van 3", de horizontale en verticale schaal en de overdrijving |

Het stuk per blad is zo lang als het plan-venster bij die schaal toelaat, naar beneden afgerond op een heel aantal van 50 ft (20 m) bij lange stukken of op een heel aantal van 10 ft (5 m) bij korte stukken.

:::note
Wanneer de hoogtes van het profiel niet passen bij de overdrijving die u koos, tekent CivilCraft elk blad op de grootste van 10×, 5×, 4×, 2× en 1× die past, en de statusbalk meldt dat. Een gebogen tracé wordt gedraaid naar de richting van het begin naar het einde van elk stuk, dus de weg kan op het blad iets omhoog of omlaag lopen.
:::
