---
title: Studiefiler för ett annat linjeprogram (.DON)
summary: Spara en luftledning som en studiefil i .DON, eller läs in stöden från en sådan i en ny linje. Ej testad med programmet som läser dem.
keywords: don, .don, studiefil, xml, export, import, luftledningsprogram, uppspänning, canton
from: 1abc4d07
---

Vissa luftledningsprogram sparar en studie i en `.DON`-fil (XML-text). CivilCraft kan skriva en linje som en sådan fil och läsa in stöden från en.

:::warning
**Ej testad.** Vi byggde detta utifrån en lista över formatets fältnamn som en användare delat, inte från en verklig fil, och vi har inte öppnat våra filer i programmet som läser dem. Öppna filen där och kontrollera varje värde innan du litar på det. Om du kan dela en `.DON`-fil (med kundens uppgifter borttagna) hjälper det oss att göra detta rätt.
:::

## Spara en studiefil

1. Ge linjen en lina och se till att den har resultat (ingen ”ej beräknad” i dess egenskaper).
2. {{ui:Mer}} › {{ui:Spara en studiefil (.DON)…}}, välj linjen, lägg till en beskrivning och ett projektnummer.
3. {{ui:Spara utredningsfilen}}.

Filen innehåller linjens stöd (koordinater, mark, höjder, roller, tvärarm, det stöd som behålls eller föreslås, laster per lastfall, grund), en sektion per sträcka mellan ändstolpar (lina, spänning, ledspann, spann, spänning och kedjelinjeparameter, största spänning per lastfall) och uppspänningstabellerna. Längder anges i meter och krafter i daN; text skrivs i Latin-1, så ett tecken utanför den blir `?`.

## Läsa en studiefil

{{ui:Mer}} › {{ui:Öppna en studiefil (.DON)…}} läser in stöden i en ny linje. Linan, stöden och tvärarmarna matchas mot ditt bibliotek efter namn; det som inte hittas lämnas för dig att välja i Egenskaper.
