---
title: WaterCraft: förbrukning, brandflöde, avbrott och vattnets ålder
summary: Med tillägget WaterCraft gör du kunder till förbrukning på dina vattenledningar, kontrollerar flödet som finns vid varje brandpost, ser vilket ledningsavbrott som gör mest skada och följer vattnets ålder och klor under ett dygn.
keywords: watercraft, vattendistribution, förbrukning, kunder, toppfaktor, förbrukningsmönster, brandflöde, brandpost, restryck, kritikalitet, avbrott, avstängningssektion, vattnets ålder, klor, rest, källspårning, återvändsände, csv, tillägg
from: 76809f01
---

WaterCraft är ett tillägg som arbetar på det vattennät du redan ritat med verktygen för Vattenledningar. Det lägger till en flik i den högra panelen med fyra avsnitt.

:::warning
Endast ett beräkningsstöd. Det har kontrollerats mot handberäknade svar på påhittade nät, inte mot en verklig ledningsmodell hos ett vattenverk. En vatteningenjör måste kontrollera varje resultat. Det finns inga tryckhöjningsstationer, ingen nedbrytning av andra ordningen och inga scenarier än.
:::

## Det här gör du

- Lägg in kunder i nätet som förbrukning.
- Hitta brandposter som har för lite flöde för det du behöver.
- Hitta ledningarna vars förlust betyder mest.
- Hitta gammalt vatten och för låg klorhalt.

## Steg

1. Öppna {{ui:Inställningar}} › {{ui:Tillägg}} och slå på {{ui:WaterCraft (vattendistribution)}}. En flik {{ui:WaterCraft}} visas i den högra panelen.
2. Rita först en reservoar, knutpunkter och ledningar med verktygen för Vattenledningar (se [Vattenledningar](topic:water-mains)). Utan nät säger fliken att du behöver göra det.
3. Under {{ui:Förbrukning}} klistrar du in en kund per rad: id, x, y, typ, mängd. Välj {{ui:Toppfaktor}} och {{ui:Timprofil}} (bostadsdygn, affärsdygn, jämn, eller behåll mönstret som det är). Tryck {{ui:Kontrollera}} för att se var varje kund hamnar (närmaste knutpunkt) och tryck sedan {{ui:Lägg in i nätet}}. {{ui:Ångra}} tar tillbaka förbrukningen.
4. Under {{ui:Brandflöde}} ställer du in det behövda flödet och restrycket, väljer om restrycket hålls {{ui:Endast vid brandpost}} eller {{ui:Överallt i systemet (strängare)}}, och trycker på {{ui:Sträcka}}. Varje brandpost listas med sämst först, som klarar kravet eller ligger under.
5. Under {{ui:Vilken huvudledning som betyder mest}} väljer du {{ui:en ledning i taget}} eller {{ui:en avstängningssektion i taget}} och trycker på {{ui:Sträcka}}. Varje avbrott visar den förbrukning som bryts, knutpunkterna som bryts, knutpunkterna som nyss hamnar under minimitrycket och det lägsta trycket som återstår.
6. Under {{ui:Vattnets ålder och klor}} väljer du vad som ska följas (vattnets ålder, klor eller en källspårning), anger hur många timmar som ska köras och de gränser du vill ha, och trycker på {{ui:Sträcka}}. Knutpunkter utanför dina gränser listas.
7. Tryck på {{ui:Spara som CSV}} under en tabell för att spara den.

## Noteringar

- Det behövda brandflödet och förbrukningen per hem eller per acre är startvärden, inte standarder. Använd ditt vattenverks egna värden.
- En ledning som delvis skärs av en ventil stängs helt, så det visade avbrottet blir något sämre än ett verkligt.
- Kör avsnittet om vattenkvalitet tillräckligt länge för att det dagliga mönstret ska upprepas innan du läser den sista dagen.
- {{ui:Stopp}} avbryter en lång körning i förtid; listan visar då bara det som hann göras.
- Ditt nät stannar i det här projektet och på den här datorn. Ingenting skickas någonstans.
