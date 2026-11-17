---
title: Rita en kraftledning
summary: Placera stolpar på planen, låt CivilCraft räkna ut varje stolpes roll och sektionerna mellan ändstolparna, och flytta stolpar på planen eller på linjeprofilen.
keywords: kraftledning, stolpe, spännvidd, sektion, ändstolpe, vinkel, upphängning, profil, höjd, tvärarm, stag, avspänning
from: b8e5e272
---

## Rita den

1. Ha en terrängmodell: marken under ledningen kommer från den ([Bygg en terrängmodell](topic:build-surface)). En stolpe utan mark under sig listas under **Kontroller**; skriv in dess **Markhöjd** i Egenskaper i stället.
2. Klicka på {{ui:Ledning}} i gruppen Kraftledningar och klicka på varje stolpe på planen.
3. Dubbelklicka på den sista, eller tryck på Enter.

Ledningen får den ledare, stolpe och utrustning du använde senast på den här datorn (första gången: exempel från biblioteket). Ändra dem i Egenskaper.

## Ledningen i Egenskaper

Markera ledningen (klicka på en spännvidd) för att ställa in dess **Ledare**, **Ledare per krets**, **Kretsar**, **Spänning**, den **Avståndsregel** den måste hålla över marken, samt utrustningen **På varje stolpe** (en tvärarm, isolatorer, beslag). Tabellen listar dess **sektioner** med var och ens dimensionerande spännvidd, vardaglig spänning och det lastfall som styr den.

## Stolpar

Klicka på en stolpe för att markera den. I Egenskaper:

- **Stolpe**: dess biblioteksobjekt. När den är för svag lägger {{ui:Använd …}} in den minsta stolpen av samma material i ditt bibliotek som bär lasten.
- **Roll**: Automatisk, Upphängning, Vinkel eller Ändstolpe. Automatisk innebär: den första och sista stolpen är ändstolpar; en vändning över regelns vinkel gör en vinkelstolpe; en större vändning gör en ändstolpe.
- **Höjd över mark**: tomt tar den från biblioteksobjektet (dess längd minus djupet i marken).
- **Även på den här stolpen**: extra utrustning, till exempel ett **stag** (avspänning). En avspänd stolpe för ledningens drag till sitt stag.
- **Befintlig stolpe**: den kontrolleras som de andra men räknas inte med i mängderna.

{{ui:Stolpe}} lägger till en stolpe på spännvidden närmast ditt klick. Dra en stolpe på planen för att flytta den. Delete tar bort den (en ledning behåller minst två).

Sektioner går mellan ändstolparna: inne i en sektion löper ledaren fritt genom upphängningsklämmorna, så att en spänning gäller för hela sektionen.

## Linjeprofilen

Klicka på {{ui:Profil}} (eller **Profil** i ledningens Egenskaper). Panelen under planen visar marken längs ledningen, varje stolpe från marken till dess topp, ledarens lägsta fas vid det **Lastfall** du väljer, och det avstånd ledningen måste hålla som en streckad linje. En spännvidd som inte klarar kraven är röd; siffran under varje spännvidd är dess lägsta avstånd.

- **Ledning** väljer vilken kraftledning som visas. Om du markerar en annan ledning, eller en av dess stolpar, på planen byter profilen till den.
- För pekaren över profilen: en hjälplinje följer den, och etiketten visar avståndet längs ledningen, marken, ledaren och avståndet där (och anger när avståndet understiger ledningens regel).
- {{ui:Mät}} i profilens verktygsrad: klicka på två punkter för att få avståndet i sidled, höjdskillnaden, det raka avståndet och lutningen mellan dem. Ett klick nära marken, ledaren eller en stolpes topp fäster i den. Klicka på {{ui:Mät}} igen för att sluta.
- Hinder som ledningen korsar reser sig från marken: ritade som staplar, Landskapsväxter som deras krona, murar som staplar (se [Kraftledningskontroller](topic:power-line-checks#clearances)). Kabelsträckor och rör som ledningen korsar markeras under marken vid deras överkant, med namn.

- Dra en stolpe i sidled för att flytta den längs ledningen.
- Dra dess topp uppåt eller nedåt för att ange dess höjd över marken.
