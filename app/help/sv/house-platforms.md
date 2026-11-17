---
title: Husplattformar i sluttande terräng
summary: Planera en byggplatta i en sluttning: stödmurar som byggplattans kanter, schakt- och fyllningskartan skuggad efter djup med punkthöjder (plan och 3D), en sektion ritad var som helst genom marken och utformningen, samt ramper eller sluttande byggplattor för infarter.
keywords: husplattform, byggplatta, husplatta, sluttande tomt, sluttning, stödmur, schakt och fyllning, schakt- och fyllningskarta, punkthöjder, fri sektion, sektionslinje, bygglovsritningar, infart, ramp, sluttande byggplatta, planera, svällfaktor, jordarbete
from: daa08a3f
---

En husplattform är en **byggplatta** (**Utformning** › {{ui:Byggplatta}}): en plan polygon på en nivå, planerad in i marken. Fyra saker hjälper i en sluttning.

## Stödmurar som byggplattans kanter

Markera byggplattan och ställ en sida på {{ui:Lodrät (stödmur)}} i stället för en slänt (**Egenskaper** › {{ui:Sidor och stödmurar}}, eller {{ui:Lodräta: stödmurar}} för alla sidor på en gång). Murens höjd läses av marken längs den: överkant vid marken, underkant vid byggplattan, visas i båda ändarna och vid sin högsta punkt på planen, med en varning när den är högre än den gräns du satt. Murar och slänter kan blandas sida vid sida.

## Schakt- och fyllningskartan

Kryssa i {{ui:Schakt- och fyllningskarta}} under **Visa**. Planen skuggas efter hur djupa schakten eller fyllningarna är, i lika steg (schakt varm, fyllning blå, nästan plan ljus) med en teckenförklaring, och **punkthöjder** skrivs ut på byggplattan: nivåändringen i punkter på ett rutnät, och det djupaste schaktet och den högsta fyllningen markeras ▲. Cellerna är desamma som jordarbetsvolymerna använder, så kartan och siffrorna stämmer alltid överens.

I 3D-vyn väljer du **Schakt och fyllning** från färglistan för att lägga samma färger över marken och utformningen.

En svällfaktor eller krympfaktor finns i massdiagramverktyget (**Utformning** › {{ui:Massdiagram}}); den tillämpas inte på en byggplattas volymer.

## En fri sektion

Under **Yta** › {{ui:Mer}} väljer du {{ui:Fri sektion}}, klickar punkterna på sektionslinjen var som helst (den får gärna böja sig) och trycker på {{key:Enter}}. En dialogruta ritar sektionen: den befintliga marken, den planerade utformningen (streckad) och schakt och fyllning mellan dem, skuggade, med deras areor (utformningen räknas bara inom byggplattor och vägar). {{ui:Överhöjning av höjdskala}} är som standard anpassad till ritningen; {{ui:Spara som SVG}} och {{ui:Spara som CSV}} ger dig en ritning till kommunen och siffrorna.

## Ramper och sluttande byggplattor

Under **Yta** › {{ui:Mer}} väljer du {{ui:Ramp eller lutande byggplatta}}, klickar den låga änden och sedan den höga, trycker på {{key:Enter}} och anger bredden, nivån vid den låga änden och lutningen. Byggplattan är en remsa vars hörn bär de nivåerna (kanten mellan två hörn går i en konstant lutning), och den planeras in i marken precis som vilken byggplatta som helst. Varje byggplattas hörn kan också få egna nivåer, så en infart, en ramp eller en lutande terrass är en byggplatta med en nivå på varje hörn.
