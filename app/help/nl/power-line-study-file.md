---
title: Studiebestanden voor een ander lijnprogramma (.DON)
summary: Sla één bovenleiding op als .DON-studiebestand, of lees de masten van één in een nieuwe lijn. Niet getest met het programma dat ze leest.
keywords: don, .don, studiebestand, xml, exporteren, importeren, bovenleidingprogramma, montage, canton
from: 1abc4d07
---

Sommige bovenleidingprogramma's bewaren een studie in een `.DON`-bestand (XML-tekst). CivilCraft kan één lijn als zo'n bestand schrijven en de masten van één lezen.

:::warning
**Niet getest.** We hebben dit gebouwd op basis van een lijst met veldnamen van het formaat die een gebruiker deelde, niet op een echt bestand, en we hebben onze bestanden nog niet in het programma geopend dat ze leest. Open het bestand daar en controleer elke waarde voordat u erop vertrouwt. Als u een `.DON`-bestand kunt delen (zonder de gegevens van de opdrachtgever), helpt dat ons dit goed te krijgen.
:::

## Een studiebestand opslaan

1. Geef de lijn een geleider en zorg dat er resultaten zijn (geen "niet berekend" in de eigenschappen).
2. {{ui:Meer}} › {{ui:Studiebestand opslaan (.DON)…}}: kies de lijn en voeg een beschrijving en een opdrachtnummer toe.
3. {{ui:Het studiebestand opslaan}}.

Het bestand bevat de masten van de lijn (coördinaten, grond, hoogten, rollen, dwarsarm, de mast die is behouden of voorgesteld, belastingen per belastinggeval, fundering), één traject per stuk tussen eindmasten (geleider, spanning, ontwerpoverspanning, overspanningen, trekkracht en kettingparameter, de grootste trekkracht per belastinggeval) en de montagetabellen. Lengten zijn in meters en krachten in daN; tekst wordt in Latin-1 geschreven, dus een teken dat daarbuiten valt, wordt `?`.

## Een studiebestand lezen

{{ui:Meer}} › {{ui:Studiebestand openen (.DON)…}} leest de masten in een nieuwe lijn. De geleider, masten en dwarsarmen worden op naam gekoppeld aan uw bibliotheek; wat niet wordt gevonden, kiest u zelf in de eigenschappen.
