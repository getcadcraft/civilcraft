---
title: Lägg ut solcellsfält på marken
summary: Placera markmonterade solcellsbord inom en fastighet eller byggplatta, med radavstånden anpassade efter den mark varje bord faktiskt står på, brant mark lämnad tom, årets energi beräknad och borden visade i planen och i 3D.
keywords: solceller, pv, fotovoltaisk, fält, markmontering, bord, rader, radavstånd, skugga, terräng, lutning, pålar, energiutbyte, kWp, energi, horisont
from: 95593fd6
---

## Vad du lär dig

Hur du lägger ut ett fält med solcellsbord på en tomt som inte är plan, och vad siffrorna betyder. Öppna det från Terrängmodell › {{ui:Mer}} › Solcellsfält.

## Lägg ut borden

1. Välj **Var**: en fastighet eller en byggplatta i projektet, eller skriv hörnen på ett område. Bocka i de byggplattor eller fastigheter som måste vara **tomma** (en byggnad, en damm).
2. Skriv platsens **latitud och longitud**. Solen beror på dem; inget gissas. Om projektet har ett koordinatsystem fylls de i av **Placera från koordinatsystemet**.
3. Ange lutningsvinkeln, orienteringen (tomt är mot ekvatorn), hur många moduler som ingår i ett bord samt modulens effekt och storlek. Modulvärdena börjar som generiska värden och är märkta så; skriv in dina egna.
4. Tryck på **Lägg ut borden**. Fönstret visar antalet bord och moduler, storleken i kWp och avståndet mellan raderna.

Varje bord är en kolumn i området, placerad från framkanten och förskjuten bakåt. Ett bord placeras bara där marken under det ligger inom lutningsgränsen, innanför området och marginalen från gränsen, och där de pålar det behöver inte är högre än den gräns du har angett. Platser som inte klarar kraven lämnas tomma, och fönstret visar hur många och varför.

## Raderna anpassas efter marken

På plan mark står raderna med den vanliga regeln för fri från skugga: en rads skugga vid middag på vintersolståndet får inte nå den nedre kanten på raden bakom. På en lutning använder CivilCraft samma regel på den mark nästa rad faktiskt står på. Där marken stiger bakom ett bord kan raderna stå tätare; där den sluttar bort står de längre från varandra. Fönstret visar det närmaste, det längsta och medelavståndet bredvid avståndet på plan mark, så att du ser vad terrängen gjorde.

Ett bords plan lyfts på pålar tills varje provpunkt under det ligger minst så högt över marken som friutrymmet du har angett. Den högsta pålen visas i resultatet.

## Årets energi

**Årets energi** beräknar ljuset på det lutande planet för en representativ dag i varje månad, cellens temperatur, de angivna förlusterna, att borden skuggar varandra och att kullarna på horisonten tar bort den sol de skymmer. Himlen är klar, så svaret är en övre gräns; verkligt väder ger mindre. Det är en uppskattning i ett tidigt projekteringsskede, inte en utbyteskalkyl.

## Spara

**Spara till projektet** sparar indata och siffrorna i projektfilen. Borden räknas om utifrån marken när filen öppnas, så en ändrad terrängmodell flyttar dem. De visas i planen och i 3D (Visa › Solcellsfält). Bordslistan laddas ner som CSV. Ett ångra-steg tar bort eller återställer ett fält.

## Finns inte ännu

Väderdata i stället för den klara himlen, bord som följer marken i öst–väst-riktningen, spårare och den elektriska konstruktionen (strängar, ledningar, växelriktare) i CivilCraft. Solar PV-panelen i BimCraft har strängar och enlinjeschema för tak.
