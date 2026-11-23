---
title: WaterCraft: förbrukning, brandflöde, avbrott och vattenålder
summary: Med tillägget WaterCraft gör du kunder till förbrukning på dina vattenledningar, kontrollerar flödet som finns vid varje brandpost, ser vilket ledningsavbrott som gör mest skada, och följer vattnets ålder och klor under ett dygn.
keywords: watercraft, vattendistribution, förbrukning, kunder, toppfaktor, förbrukningsmönster, brandflöde, brandpost, restryck, kritikalitet, avbrott, avstängningssektion, vattnets ålder, klor, restklor, källspårning, blindände, csv, tillägg
from: 066fb17a
---

WaterCraft är ett tillägg som arbetar med vattennätet du redan ritat med verktygen för vattenledningar. Det lägger till en flik i högerpanelen med fyra avsnitt.

:::warning
Endast ett beräkningsstöd. Det kontrollerades mot handräkning på påhittade nät, inte mot en verklig modell för ett vattenverk. En vatteningenjör måste kontrollera varje resultat. Scenarier, styrregler, ventiler och fältmätningar har egna ämnen, "Scenarier" och "Studier", i WaterCraft-tilläggets hjälp.
:::

## Vad du gör

- Lägg kunder på nätet som förbrukning.
- Hitta brandposterna som inte når upp till det flöde du behöver.
- Hitta de ledningar vars avbrott spelar störst roll.
- Hitta gammalt vatten och låg klorhalt.

## Steg

1. Öppna {{ui:Inställningar}} › {{ui:Tillägg}} och slå på {{ui:WaterCraft (vattendistribution)}}. En flik {{ui:WaterCraft}} visas i högerpanelen.
2. Rita en reservoar, knutpunkter och ledningar med verktygen för vattenledningar först (se [Vattenledningar](topic:water-mains)). Utan nät säger fliken att du ska göra det.
3. Under {{ui:Förbrukning}} klistrar du in en kund per rad: id, x, y, typ, mängd. Välj {{ui:Toppfaktor}} och {{ui:Timmönster}} (bostadsdygn, affärsdygn, jämnt, eller behåll mönstret som det är). Tryck på {{ui:Kontrollera}} för att se var varje kund hamnar (närmaste knutpunkt), och sedan på {{ui:Lägg in i nätet}}. Ångra tar tillbaka förbrukningen.
4. Under {{ui:Brandflöde}} anger du det behövda flödet och restrycket, väljer om restrycket hålls {{ui:Endast vid brandposten}} eller {{ui:Överallt i systemet (striktare)}}, och trycker på {{ui:Sträcka}}. Varje brandpost listas med sämst först, som uppfyller kravet eller understiger det.
5. Under {{ui:Vilken huvudledning som är viktigast}} väljer du {{ui:en ledning i taget}} eller {{ui:en avstängningssektion i taget}} och trycker på {{ui:Sträcka}}. Varje avbrott visar den förbrukning som bryts, knutpunkterna som bryts, knutpunkterna som nyss hamnar under minimitrycket och det lägsta tryck som återstår.
6. Under {{ui:Vattenålder och klor}} väljer du vad du vill följa (vattnets ålder, klor eller en källspårning), anger antal timmar att köra och de gränser du vill ha, och trycker på {{ui:Sträcka}}. Knutpunkter utanför dina gränser listas.
7. Tryck på {{ui:Spara som CSV}} under valfri tabell för att spara den.

## Anteckningar

- Det behövda brandflödet och förbrukningen per hem eller per acre är startvärden, inte standarder. Använd din vattenverksamhets egna siffror.
- En ledning som delvis styrs av en ventil stängs helt, så det avbrott som visas är något värre än ett verkligt.
- Kör vattenkvalitetsavsnittet tillräckligt länge för att det dagliga mönstret ska upprepas innan du läser den sista dagen.
- {{ui:Stopp}} avslutar en lång körning tidigt; listan visar då bara det som hann göras.
- Ditt nät stannar i det här projektet och på den här datorn. Ingenting skickas någonstans.
