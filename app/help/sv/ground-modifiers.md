---
title: Markmodifierare och levande nivåer
summary: Allt som formar den planerade marken i en ordnad lista (senare vinner där de överlappar), schakt och fyllning per modifierare, anslutningskontroller i Problempanelen samt punkthöjder och lutningspilar som läser marken live.
keywords: markmodifierare, stapel, ordning, planerad mark, befintlig mark, överlapp, schakt och fyllning, anslutning, stödmur, beläggningskant, bäddnivå, vilplan, punkthöjd, höjdkota, lutningspil, lutningsetikett, fall
from: 3998a5b0
---

Planerad mark = befintlig mark + modifierarna, i ordning. Den befintliga marken ändras aldrig.

## Listan

{{ui:Nivåer}} › {{ui:Markmodifierare…}} listar alla objekt som formar marken: plattformar, vallar, svackor, planeringsområden, beläggning och gångvägar, planterade ytor med en färdig nivå samt trappor och ramper där rutan **Formar marken** är ikryssad (med deras under- och övernivå). Där två överlappar vinner den **senare**. Dra en rad, eller använd pilarna, för att ändra ordningen; marken byggs om direkt. Varje rad visar sin schakt och fyllning (vad den formar efter de ovanstående), med totalen under listan.

## Anslutningskontroller

Problempanelen listar, med **gå till**:

- en vägg vars höga sida ligger över dess överkant (jord ovanpå väggen), eller vars låga sida visar dess grund;
- en planterad yta vars färdiga nivå ligger över beläggningskanten den möter, eller mer än de typiska 150 mm under den;
- trappsteg vars under- eller överkant inte möter beläggningen de landar på;
- två modifierare som överlappar (den senare vinner där).

En stödmur kan ha sin överkant följa den höga sidan av marken: dess höjd räknas om varje gång marken ändras.

## En stödmur som formar marken

Markera en stödmur och kryssa i **Formar marken**. Remsan under väggen (lika bred som väggen är tjock) går med i listan som en modifierare:

- kanten på den **höga sidan** hålls vid marken där, station för station, så att väggens överkant följer den höga sidan (med avtäckningen överst). Skriv en **Överkant**-nivå för att i stället hålla den höga sidan på den nivån minus avtäckningen;
- kanten på den **låga sidan** hålls vid nivån **Hållen mark på låg sida** som du skriver in, eller, om fältet lämnas tomt, vid marken där;
- den höga sidan är den sida vars mark ligger högst över hela väggen, så den växlar aldrig längs väggen;
- marken utanför remsan ändras inte, och den befintliga marken ändras aldrig.

Precis som alla modifierare står den i listan, och en modifierare som står efter den vinner där de överlappar. En vägg vars hållna nivå i en ände ligger mer än de typiska 150 mm från befintlig mark där får en varning i Problempanelen (med **gå till**). En frittstående vägg formar inte marken. Rutan är avstängd i filer från tidigare byggen, så de öppnas som de var.

## Punkthöjder och lutningspilar

{{ui:Punkthöjd}} (ett klick) och {{ui:Lutningspil}} (två klick) läser marken varje gång de ritas: flyttar eller nivåjusterar du ett objekt följer etiketterna med. I Egenskaper väljer du om en etikett läser den planerade eller den befintliga marken; etiketter för befintlig mark visas inom hakparenteser. Pilarna pekar nedför lutningen och visar till exempel `1:20 (5.0 %)`.
