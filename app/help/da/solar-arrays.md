---
title: Placér solcelleanlæg på terrænet
summary: Placér jordmonterede solcelleborde inden for en matrikel eller et byggeplateau, med rækkerne afstandet efter det terræn, hvert enkelt bord faktisk står på, stejlt terræn efterladt tomt, årets energi beregnet, og bordene vist på planen og i 3D.
keywords: solceller, pv, fotovoltaisk, array, jordmontering, borde, rækker, rækkeafstand, skygge, terræn, hældning, pæle, udbytte, kWp, energi, horisont
from: 95593fd6
---

## Hvad du lærer

Hvordan du placerer et felt af solcelleborde på en grund, der ikke er flad, og hvad tallene betyder. Åbn det fra Terræn › Mere › Solcelleanlæg.

## Placér bordene

1. Vælg **Hvor**: en matrikel eller et byggeplateau i projektet, eller skriv hjørnerne af et område. Sæt flueben ved de byggeplateauer eller matrikler, der skal forblive **tomme** (en bygning, en sø).
2. Skriv grundens **breddegrad og længdegrad**. Solen afhænger af dem; intet bliver gættet. Hvis projektet har et koordinatsystem, udfylder **Placér ud fra koordinatsystemet** dem.
3. Angiv hældningen, orienteringen (tomt betyder mod ækvator), hvor mange moduler der udgør et bord, og modulets effekt og størrelse. Modultallene starter som generiske værdier og er mærket således; skriv dine egne.
4. Tryk på **Placér borde**. Vinduet viser antallet af borde og moduler, størrelsen i kWp og afstanden fra række til række.

Hvert bord er en kolonne i området, placeret fra forkanten og flyttet bagud. Et bord placeres kun der, hvor terrænet under det er inden for hældningsgrænsen, inden for området og tilbagetrækningen, og hvor de pæle det kræver ikke er højere end den grænse, du har angivet. Steder, der fejler, efterlades tomme, og vinduet siger, hvor mange og hvorfor.

## Rækkerne er afstandet efter terrænet

På fladt terræn står rækkerne med den sædvanlige regel om ingen skygge: en rækkes skygge kl. 12 ved vintersolhverv må ikke nå den nederste kant af rækken bag den. På en skråning anvender CivilCraft den samme regel på det terræn, den næste række faktisk står på. Hvor terrænet stiger bag et bord, kan rækkerne stå tættere; hvor det falder væk, står de længere fra hinanden. Vinduet viser den nærmeste, den fjerneste og den gennemsnitlige afstand ved siden af afstanden på fladt terræn, så du kan se, hvad terrænet gjorde.

Et bords plan hæves på pæle, indtil hvert målepunkt under det ligger over terrænet med den frihøjde, du har angivet. Den højeste pæl vises i resultatet.

## Årets energi

**Årets energi** beregner lyset på det hældende plan for en repræsentativ dag i hver måned, celletemperaturen, de indtastede tab, at borde skygger for hinanden, og at bakker i horisonten tager den sol, de skjuler. Himlen er klar, så svaret er en øvre grænse; det virkelige vejr giver mindre. Det er et skøn i et tidligt designstadie, ikke en udbytterapport.

## Gem det

**Gem i projektet** gemmer input og tallene i projektfilen; bordene beregnes igen ud fra terrænet, når filen åbnes, så en ændret overflade flytter dem. De vises på planen og i 3D (Vis › Solcelleanlæg). Bordlisten hentes som CSV. Ét trin med fortryd fjerner eller gendanner et anlæg.

## Ikke lavet endnu

Vejrdata i stedet for den klare himmel, borde der følger terrænet i øst-vest-retningen, trackere og det elektriske design (strenge, kabler, invertere) i CivilCraft. BimCraft's Solar PV-panel har strenge og enliniediagrammet for tage.
