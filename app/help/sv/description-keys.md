---
title: Beskrivningsnycklar och linjekoder
summary: Gör om fältkoder till punktgrupper med beskrivningar och sammanfoga kodade punkter till linjer (början, slut, stängning) som blir brytlinjer.
keywords: beskrivningsnycklar, fältkoder, linjekoder, figurer, linjearbete, början, slut, stängning, punktgrupper, koder, mätkoder, datainsamlare, brytlinjer, kantsten, beläggningskant
from: b3d1af8d
---

Mätlag kodar varje mätning i fält: `EP` för beläggningskant, `TC` för kantstensöverkant, `BLDG` för ett byggnadshörn. Koden är det första ordet i punktens beskrivning. CivilCraft grupperar punkter efter den, och gör linjer av linjekoderna efter den.

## Linjekoder

En linjekod är ordet direkt efter fältkoden:

| Beskrivning | Betydelse |
|---|---|
| `EP B` | Börja en ny linje för beläggningskant i den här punkten |
| `EP` | Fortsätt den aktuella EP-linjen |
| `EP E` | Avsluta den aktuella EP-linjen i den här punkten |
| `BLDG C` | Stäng byggnaden: förbind den här punkten med linjens första punkt |

Punkter med samma kod förbinds i punktnummerordning. Olika koder ger olika linjer även när de delar en grupp, så att `EP1` och `EP2` ger två kanter samtidigt. En kod som aldrig använder en linjekod förbinds genom alla sina punkter, som i tidigare versioner.

Linjer i en grupp som används som **Brytlinje** blir brytlinjer, en per linje, så att en kantsten med ett avbrott inte sträcks över avbrottet. Linjer i andra grupper ritas på planen (lager V-NODE-LINE) och följer med i DXF, DWG och PDF.

Orden för början, slut och stängning är `B`, `BEG`, `START`; `E`, `END`; och `C`, `CLO`, `CLOSE`. Ändra dem, eller stäng av linjekoder, i dialogrutan nedan.

## Beskrivningsnycklar

En beskrivningsnyckel gör om en kod till en punktgrupp, en användning och en lång beskrivning.

1. Under **Punkter** klickar du på {{ui:Beskrivningsnycklar och linjekoder}}.
2. Klicka på {{ui:Lägg till en nyckel}} och fyll i raden:
   - **Kod**: fältkoden att matcha. `*` står för valfria tecken och `?` för ett, så `EP*` fångar EP, EP1 och EP12.
   - **Grupp**: punktgruppen som de här punkterna ansluter till (tomt = själva koden). `EP*` med gruppen `EP` lägger EP1 och EP2 i en grupp, medan de förblir separata linjer.
   - **Användning**: Punkter, Brytlinje eller Utelämnad, för när gruppen först visas (eller lämna det till tabellen **Punkter**).
   - **Beskrivning**: det långa namnet, som visas i en punkts **Egenskaper**.
3. Kolumnen **Punkter** räknar hur många punkter varje nyckel fångar medan du skriver. Den första nyckeln som matchar en kod vinner.
4. Klicka på {{ui:Verkställ}}. Grupperna, terrängmodellen och planen följer i ett steg: {{key:Mod+Z}} ångrar det.

En grupp behåller den användning du gav den i tabellen **Punkter**; en nyckels användning sätter bara den för en grupp som är ny. Nycklarna och linjekoderna sparas i projektfilen.
