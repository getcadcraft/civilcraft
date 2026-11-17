---
title: Växtposter, sorter och levererade storlekar
summary: Projektets egna växtlista som en tabell: sorter, levererade storlekar (behållare, rotklump, stamomfång, fri stam), täthet, specifikationsanteckningar, CSV in och ut; varje placerad växt anger en storlek; växtsymboler efter skala och egna symboler och 3D-modeller.
keywords: växttabell, växtdatabas, sort, kultivar, levererad storlek, behållare, rotklump, bar rot, stamomfång, fri stam, täthet, växter per kvadratmeter, specifikation, specifikationsanteckning, växtsymbol, block, egen symbol, 3D-växt, detaljnivå, skala
from: 12251beb
---

Öppna {{ui:Växtlista}} från gruppen Landskap, menyn {{ui:Mer}}, eller från avsnittet Växter. Varje rad är en växtpost i projektets egen lista (en post från växtlistan kopieras in när du lägger till den). Varje redigering kontrolleras som en importerad fil, och är ett steg i Ångra.

## Kolumnerna

- **Botaniskt namn**, **Vanligt namn**, **Typ**, **Höjd** och **Spridning** vid mognad (meter).
- **Avstånd** (centrum till centrum) eller **Täthet** (växter per m²). En bädd med en post som har täthet men inget avstånd fylls med den täthet, i sitt eget mönster (triangulärt eller kvadratiskt).
- **Levererade storlekar**: en post per storlek, åtskilda av `;`. Varje post är ett id, en typ (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) och sedan valfria: en volym `10L`, en höjd `h0.6`, en spridning `s0.4`, ett stamomfång `g14-16` (cm), en fri stam `st1.8`. Exempel: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sorter**: namn åtskilda av `;`. En sort behåller sina egna storlekar och anteckningar när filen du importerade hade dem.
- **Specifikationsanteckningar**.

{{ui:Duplicera}} kopierar en rad under en ny nyckel; {{ui:Spara som CSV}} och {{ui:Spara som växtfil}} sparar listan (CSV-rader för sorter ligger under sin art, med `cultivar_of`). Import av en CSV- eller växtfil slås samman med listan.

## Din egen växtlista i biblioteket

Logga in på ditt CadCraft-konto (Inställningar, Dina tillägg, Logga in) så kan växttabellen använda listan du har i biblioteket:

- {{ui:Från min biblioteckslista}} hämtar in dina egna växtobjekt (även de som ännu väntar på granskning). En växt du redan har här uppdateras från biblioteket; de sorter, levererade storlekar, täthet och specifikation du lagt till här behålls.
- {{ui:Spara som växtlista}} sparar varje rad som ett eget växtobjekt i biblioteket, ett objekt per art: en ny växt blir ett nytt objekt, en ändrad växt blir en ny version, en oförändrad lämnas orörd. Bocka i rutan först: sparandet ger växterna till allmänheten under CC0. En första offentlig uppladdning från en person som ännu inte är betrodd granskas av en person innan den visas, precis som alla uppladdningar.

Biblioteket behåller den grundläggande växtposten. Sorter, levererade storlekar, täthet och specifikationsanteckningar stannar i projektet och i växtfilen ({{ui:Spara som växtfil}}); dialogrutan anger hur många rader det påverkar varje gång du sparar.

## En placerad växt anger en storlek

Markera en växt, en häck, eller en blandningsrad i en bädd eller planterad yta: när posten har sorter eller levererade storlekar väljer {{ui:Sort och storlek}} en av dem. Växtförteckningen räknar då per art, sort och storlek, och en etikett kan visa dem: `{botanical} '{cultivar}' {size}` eller `{full}`.

## Växtsymboler efter skala

{{ui:Växtgrafik}} (Landskap › Mer) styr hur växter ritas i plan: **automatiskt** (grövre än 1:500 en cirkel med spridningen, mellan 1:200 och 1:500 en kontur med dess mitt, finare den detaljerade symbolen; båda skalorna kan ändras) eller en nivå för alla skalor. Dialogrutan Blad har en egen **Växtdetalj i plan** för den uppsättningen.

På en post i avsnittet Växter läser {{ui:Egen symbol…}} en SVG, eller ett block i en DXF/DWG-ritning, och ritar den vid växtens spridning på detaljerad nivå. {{ui:Egen 3D-modell…}} läser en OBJ, STL eller GLB; i Växtgrafik väljer du **Varje posts egna modell** för att se den i 3D. Filerna har gränser (512 KB SVG, 2000 former, 50 000 trianglar) och sparas i projektet. SVG-transformeringar tillämpas inte (du får veta när en fil har dem). Se [Växtgrafik efter skala, egna symboler och 3D-växter](topic:plant-graphics) för nivåerna, gränserna och vad en GLB får innehålla.
