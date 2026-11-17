---
title: Beräkna soltimmarna på en tomt
summary: Välj en dag (eller en säsong) och en tidszon, och se timmarna med direkt sol på varje vägg i varje byggnadsvolym och på marken runt dem, med marken ritad på planen och siffrorna som CSV.
keywords: sol, soltimmar, skugga, solåtkomst, dagsljustimmar, fasad, vägg, säsong, solstånd, dagjämning, tidszon, sommartid, latitud, longitud, CSV, raster
from: 4e32a314
---

**Soltimmar** räknar timmarna med direkt sol som når varje vägg i varje byggnadsvolym och marken runt dem, en dag du väljer eller ett medelvärde över en säsong. Volymerna och själva marken kastar skugga; inget annat gör det (inga träd, inga grannar du inte har ritat). Himmelsljus som inte är direkt sol räknas inte.

## Innan du börjar

Solens position kommer från platsens latitud och longitud, som hämtas från projektets **koordinatsystem**. Ett projekt utan koordinatsystem avvisas med ett meddelande: ange det först (**Koordinater** i GIS-gruppen). En latitud och longitud som skrivs in för hand skulle vara en gissning, så det finns ingen ruta för dem.

## Beräkna

I **Palett**, under **Byggnadsvolymer**, **Soltimmar**:

1. Välj **Dag**. Den börjar på den dag solen står lägst där du är (21 december, eller 21 juni på södra halvklotet). För en säsong, bocka i **Över en säsong**, välj **Sista dag** och hur många dagar isär provtagningen ska ske.
2. Skriv **Tidszon**: ett namn såsom `America/Mexico_City`, eller en förskjutning från UTC såsom `-6`. Ett namn följer den tidszonens sommartidsregler för dagen; en förskjutning du skriver in används exakt som den skrivs, så använd den som gäller den dagen. Raden under rutan visar vilken förskjutning som hittades.
3. Välj hur ofta solen ska placeras, med 5, 10, 15 eller 30 minuters mellanrum, och tryck sedan på **Beräkna soltimmarna**. En säsong körs i bakgrundsarbetare; **Stoppa** avbryter den.

## Vad du får

- En tabell per volym: den **sämsta väggen**, **medelvärdet** och den **bästa väggen**, i timmar per dag, samt en tabell över varje vägg med vilket väderstreck den vetter mot och dess timmar våning för våning.
- Marken runt volymerna, ritad på planen från mörkt (ingen sol) till gult (det mest varje cell får), med en förklaring. Celler under en volym lämnas tomma. **Visa marken på planen** stänger av den.
- **Väggar som CSV** och **Mark som CSV** sparar siffrorna.

För en säsong är siffrorna medelvärdet per dag över de dagar som provtogs. Inget sparas i projektet: resultatet är till för att titta på, och kör man igen görs det på nytt.

## Bra att veta

- En vägg räknar ett ögonblick som soligt endast när den vetter mot solen och inget står i vägen. En vägg som vetter bort får ingenting.
- Marken provtas på ett rutnät som beror på tomtens storlek, och solens position mitt i varje tidssteg, så timmarna är rätta inom det steg du valt.
- Solens position är en publicerad astronomisk formel, noggrann till ungefär en bågminut.
