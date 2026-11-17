---
title: Terrengmodifikatorer og levende nivåer
summary: Alt som former ferdig terreng i én ordnet liste (den senere vinner der de overlapper), skjæring og fylling per modifikator, koblingskontroller i Problemer-panelet, og kotehøyder og fallpiler som leser terrenget live.
keywords: terrengmodifikatorer, stabel, rekkefølge, ferdig terreng, eksisterende terreng, overlapp, skjæring og fylling, kobling, støttemur, belegningskant, bunnnivå, trinnrepos, kotehøyde, høydepunkt, fallpil, fallmerkelapp, fall
from: 3998a5b0
---

Ferdig terreng = eksisterende terreng + modifikatorene, i rekkefølge. Det eksisterende terrenget endres aldri.

## Listen

{{ui:Nivåer}} › {{ui:Terrengmodifikatorer…}} viser alle objekter som former terrenget: plattformer, voller, grøfter, terrengformingsområder, belegning og stier, plantede områder med ferdig nivå, og trapper og ramper der boksen **Former terrenget** er avkrysset (med nedre og øvre nivå). Der to overlapper, vinner den **senere**. Dra en rad, eller bruk pilene, for å endre rekkefølgen; terrenget bygges om med én gang. Hver rad viser sin skjæring og fylling (det den former etter radene over), med totalen under listen.

## Koblingskontroller

Problemer-panelet lister, med **gå til**:

- en mur der høy side er over toppen (jord over muren), eller der lav side viser fundamentet sitt;
- et plantet område der ferdig nivå er over belegningskanten det møter, eller mer enn de typiske 150 mm under den;
- trinn der bunn eller topp ikke møter belegningen de lander på;
- to modifikatorer som overlapper (den senere vinner der).

En støttemur kan ha toppen sin fulgt etter høy side av terrenget: høyden regnes ut på nytt hver gang terrenget endres.

## En støttemur som former terrenget

Velg en støttemur og kryss av **Former terrenget**. Stripen under muren (like bred som muren er tykk) blir en modifikator i listen:

- kanten på **høy side** holdes på terrenget der, stasjon for stasjon, slik at murens topp følger høy side (med avdekningen på toppen). Skriv inn et **Topp**-nivå for å holde høy side på det nivået minus avdekningen i stedet;
- kanten på **lav side** holdes på nivået for **Terreng holdt på lav side** som skrives inn, eller, hvis tomt, på terrenget der;
- høy side er den siden der terrenget er høyest over hele muren, så den snur seg aldri langs muren;
- terrenget utenfor stripen endres ikke, og eksisterende terreng endres aldri.

Som enhver modifikator står den i listen, og en modifikator som står etter den vinner der de overlapper. En mur der holdt nivå i en ende er mer enn de typiske 150 mm fra eksisterende terreng der, får en advarsel i Problemer-panelet (med **gå til**). En frittstående mur former ikke terrenget. Boksen er av i filer fra tidligere versjoner, så de åpnes slik de var.

## Kotehøyder og fallpiler

{{ui:Kotehøyde}} (ett klikk) og {{ui:Fallpil}} (to klikk) leser terrenget hver gang de tegnes: flytt eller juster nivå på et objekt, og merkelappene følger. I Egenskaper velges om en merkelapp leser ferdig eller eksisterende terreng; merkelapper for eksisterende terreng vises i parentes. Piler peker nedover og viser for eksempel `1:20 (5.0 %)`.
