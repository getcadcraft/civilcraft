---
title: Redigera en inmätningspunkt
summary: Ändra en punkts nummer, koordinater, höjd eller beskrivning, eller dra den till en ny plats i planen.
keywords: redigera punkt, flytta punkt, ändra höjd, numrera om, punktnummer, beskrivning, dra, nordvärde, östvärde, fixera en punkt, felmätning
from: 375ae2e9
---

Ett felmätt skott, en fel stånghöjd, en beskrivning som skrivits fel: rätta den enda punkten, så följer terrängmodellen med.

## Ändra en punkts värden

1. Med {{ui:Markera}} klickar du på punkten i planen. **Egenskaper** visar dess nummer, östvärde, nordvärde, höjd och beskrivning i rutor.
2. Skriv det nya värdet och tryck på {{key:Enter}} (eller klicka utanför). Lämna **Höjd** tomt för en punkt utan höjd.
3. Terrängmodellen, höjdkurvorna och allt som byggs på dem uppdateras på en gång.

Varje ändring är ett steg: {{key:Mod+Z}} ångrar den och {{key:Mod+Y}} gör om den. Ett värde som CivilCraft inte kan använda (ett nummer som en annan punkt redan har, bokstäver i en koordinat) avvisas: rutan markeras och statusfältet anger varför.

En ny beskrivningskod skapar en ny punktgrupp, precis som en import gör (se [Bygg en terrängmodell](topic:build-surface)).

## Flytta en punkt i planen

1. Markera punkten (den får en ring).
2. Dra ringen. Statusfältet visar östvärdet och nordvärdet där den kommer att hamna.
3. Släpp för att flytta den; dess höjd behålls. Tryck på {{key:Esc}} innan du släpper för att flytta tillbaka den.

## Brytlinjer följer punkten

En brytlinje som ritas med verktyget {{ui:Brytlinje}} kopierar de punkter den går igenom. När du flyttar en punkt eller ändrar dess höjd flyttas brytlinjehörnen på den med den, i samma steg. Brytlinjegrupper som skapats från beskrivningar byggs alltid om från punkterna.

:::note
En terrängmodell som lästs från en LandXML-fil behåller sina egna trianglar: punktredigeringar ändrar den först efter {{ui:Bygg om terrängmodellen från punkterna}}.
:::
