---
title: Legg ut solfelt på terrenget
summary: Plasser bakkemonterte solbord innenfor en tomt eller byggeplate, med radene avstandsatt for grunnen hvert bord faktisk står på, bratt terreng holdt tomt, årsenergien beregnet og bordene vist i planen og i 3D.
keywords: sol, pv, fotovoltaisk, solfelt, bakkemontering, bord, rader, radavstand, skygge, terreng, skråning, pæler, ytelse, kWp, energi, horisont
from: 95593fd6
---

## Hva du lærer

Hvordan du legger ut et felt med solbord på et sted som ikke er flatt, og hva tallene betyr. Åpne det fra Terrengmodell › Mer › Solfelt.

## Legg ut bordene

1. Velg **Hvor**: en tomt eller en byggeplate i prosjektet, eller skriv inn hjørnene i et område. Kryss av for eventuelle byggeplater eller tomter som må være **tomme** (en bygning, en dam).
2. Skriv inn **breddegraden og lengdegraden** for stedet. Solen avhenger av dem; ingenting gjettes. Hvis prosjektet har et koordinatsystem, fyller **Plasser fra koordinatsystemet** dem inn.
3. Sett helningen, vendingen (tomt betyr mot ekvator), hvor mange moduler som utgjør et bord, og modulens effekt og størrelse. Modultallene starter som generiske verdier og er merket slik; skriv inn dine egne.
4. Trykk **Legg ut bord**. Vinduet viser antall bord og moduler, størrelsen i kWp og radavstanden.

Hvert bord er en kolonne i området, plassert fra forkanten og trukket bakover. Et bord plasseres bare der grunnen under det er innenfor grensen for helning, innenfor området og tilbaketrekningen, og der pælene det trenger, ikke er høyere enn grensen du satte. Steder som ikke går, blir tomme, og vinduet sier hvor mange og hvorfor.

## Radene er avstandsatt for grunnen

På flatt terreng står radene med den vanlige regelen for skyggefri avstand: skyggen fra en rad ved middag på vintersolverv må ikke nå nedre kant av raden bak. I en skråning bruker CivilCraft samme regel på grunnen neste rad faktisk står på. Der terrenget stiger bak et bord, kan radene stå tettere; der det faller bort, står de lenger fra hverandre. Vinduet viser den minste, største og gjennomsnittlige avstanden ved siden av avstanden på flatt terreng, slik at du ser hva terrenget gjorde.

Planet til et bord løftes på pæler til hvert måle­punkt under det har den klaringen du satte over grunnen. Den høyeste pælen vises i resultatet.

## Årets energi

**Årets energi** beregner lyset på det skråstilte planet for en representativ dag i hver måned, celletemperaturen, de oppgitte tapene, at bordene skygger for hverandre, og at åsene på horisonten tar fra solen de skjuler. Himmelen er klar, så svaret er en øvre grense; ekte vær gir mindre. Dette er et tidlig designestimat, ikke en ytelsesrapport.

## Behold det

**Lagre i prosjektet** tar vare på inndataene og tallene i prosjektfilen. Bordene beregnes på nytt fra terrenget når filen åpnes, så en endret overflate flytter dem. De vises i planen og i 3D (Vis › Solfelt). Bordlisten lastes ned som CSV. Ett angre-steg fjerner eller gjenoppretter et felt.

## Ikke bygget ennå

Værdata i stedet for klar himmel, bord som følger terrenget i øst–vest-retning, sportere, og den elektriske utformingen (strenger, kabel, omformere) i CivilCraft. Solar PV-panelet i BimCraft har strenger og enlinjeskjema for tak.
