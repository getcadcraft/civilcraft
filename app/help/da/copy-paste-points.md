---
title: Vælg, kopiér og sæt målepunkter ind
summary: Vælg målepunkter ved klik, med Shift og et felt, eller alle på én gang; kopiér, klip, sæt ind, sæt ind på samme sted, duplikér og slet dem med nye punktnumre, der aldrig kolliderer; sæt punktrækker ind fra og ud til et regneark.
keywords: kopiér, sæt ind, klip, duplikér, slet punkter, vælg punkter, vælg alle, boksvalg, vindue, udklipsholder, regneark, csv, nummerér om, punktnumre, sæt ind på samme sted, klon, udsætning
from: 78a6aea7
---

Målepunkter kan kopieres og indsættes i et projekt, mellem projekter i to browserfaner og til og fra et regneark. Hver ændring er ét fortrydelsestrin, og overfladen bygges straks om fra de nye punkter.

## Vælg punkter

Med {{ui:Vælg}} ({{key:V}}):

- **Klik** på et punkt for at vælge det (og kun det). Dets numre vises under **Egenskaber**.
- {{key:Shift}} og **klik** tilføjer et punkt til valget eller fjerner det.
- {{key:Shift}} og **træk** tegner et felt: punkterne inde i det føjes til valget. Træk rundt om punkterne i stedet, og det bliver et lasso; se [Lassovalg af målepunkter](topic:lasso-selection). Et træk uden {{key:Shift}} panorerer, som altid.
- {{key:Mod+A}} (eller {{ui:Mere}} › {{ui:Vælg alle punkter}}) vælger alle punkter.
- {{key:Esc}} (eller {{ui:Mere}} › {{ui:Fravælg alle}}) fjerner valget.

Valgte punkter har en ring. Når mere end ét er valgt, viser **Egenskaber** hvor mange, deres numre, deres koteinterval og deres grupper.

## Kopiér, klip og slet

- {{ui:Kopiér}} eller {{key:Mod+C}} kopierer de valgte punkter. CivilCraft gemmer kopien og lægger den også på systemets udklipsholder som punktrækker, så du kan sætte den direkte ind i et regneark eller en tekstfil.
- {{ui:Mere}} › {{ui:Klip}} eller {{key:Mod+X}} kopierer dem og sletter dem i ét trin.
- {{ui:Mere}} › {{ui:Slet}} eller {{key:Delete}} sletter dem. {{key:Mod+Z}} bringer dem tilbage.

Rækkerne er punkt, nord, øst, kote, beskrivelse (P,N,E,Z,D), adskilt af kommaer, med tre decimaler. For at få øst før nord skal du angive **Punktrækker** i [CivilCraft-indstillinger](topic:settings). En beskrivelse, som et regneark ville opfatte som en formel (begyndende med =, +, - eller @), får et apostrof foran, så den forbliver tekst.

## Sæt ind

1. Tryk {{key:Mod+V}} eller klik {{ui:Sæt ind}}. Punkterne følger markøren som små krydser, med en prikket linje tilbage til, hvor de kom fra.
2. Klik, hvor de skal være. Midten af de kopierede punkter lander på klikket.
3. Eller tryk {{key:Enter}} for at sætte dem ind på deres egne koordinater, eller {{key:Esc}} for at annullere.

{{ui:Mere}} › {{ui:Sæt ind på samme sted}} eller {{key:Mod+Shift+V}} sætter punkterne ind på deres egne koordinater med det samme. De indsatte punkter er valgt bagefter, så du kan kopiere, flytte eller slette dem igen.

:::note
Når du klikker {{ui:Sæt ind}} på værktøjslinjen, læses systemets udklipsholder. Første gang kan browseren spørge, om CivilCraft må se udklipsholderen. Hvis du afviser, indsætter værktøjsknappen kun CivilCraft's egen kopi; {{key:Mod+V}} indsætter stadig rækker fra et regneark uden at spørge.
:::

## Punktnumre kolliderer aldrig

To punkter deler aldrig et nummer. Når du indsætter:

- Et indsat punkt beholder sit nummer, når intet punkt i projektet har det. Så efter **Klip** sættes punkterne ind igen med deres egne numre, og punkter, der er kopieret fra et andet projekt, beholder deres, hvor de er ledige.
- Et indsat punkt, hvis nummer er optaget, får et nyt helt tal: et mere end det højeste nummer i brug, tællende opad.
- Statuslinjen siger, hvad der skete, for eksempel »1 beholdt sit nummer; 9 fik nye numre: 10–18 blev til 277–285«.

I [CivilCraft-indstillinger](topic:settings) kan du vælge **Altid nye numre** og et nummer, de nye numre skal starte fra, for eksempel 5000 til designpunkter.

:::warning
Punktgrupper, der bygger overfladen som en **brudlinje**, forbinder deres punkter i nummerrækkefølge. Indsatte kopier af brudlinjepunkter (for eksempel FL-målinger) får nye, højere numre og tilsluttes enden af den brudlinje, muligvis med et langt spring. Tjek planen efter at have indsat sådanne punkter, eller sæt deres gruppe til {{ui:Punkter}}.
:::

## Duplikér

{{ui:Mere}} › {{ui:Duplikér}} eller {{key:Mod+D}} laver en kopi af de valgte punkter, der følger markøren: klik, hvor den skal være. Kopierne får altid nye numre, og CivilCraft's udklipsholder forbliver, som den var.

## Fra et regneark eller en tekstfil

Vælg rækker med punkter i et regneark (punkt, nord, øst, kote, beskrivelse) og kopiér dem. I CivilCraft trykker du på {{key:Mod+V}} og klikker, hvor de skal være, eller trykker på {{key:Mod+Shift+V}} for at sætte dem ind på deres egne koordinater, hvilket normalt er det, du vil have for rigtige måledata.

Rækkerne læses præcis som en [punktfil](topic:point-file-formats): kommaer, tabulatorer eller mellemrum, en overskriftsrække, hvis der er en. Uden overskrift kommer kolonnerækkefølgen fra **Punktrækker** i [CivilCraft-indstillinger](topic:settings).

Når begge er der, afgør CivilCraft ud fra, hvad der er nyest: rækker på systemets udklipsholder, der afviger fra CivilCraft's sidste kopi, blev kopieret senere, og de indsættes derfor. Tekst, der ikke indeholder punkter, ignoreres, og CivilCraft's egen kopi indsættes i stedet.

## Mellem projekter og faner

Kopien gemmes i denne browser, så en anden fane i CivilCraft kan indsætte den, selv efter den første fane er lukket. Punkter kopieret i et meterprojekt og indsat i et fodprojekt beholder deres numre, som de er: intet konverteres, og statuslinjen siger det.

## Hvad der ikke kopieres

Kun målepunkter kopieres indtil videre. Tracéer, byggeplateauer, rørnetværk, brudlinjer og afgrænsninger kan ikke kopieres eller indsættes endnu. Indsættelse kan ikke flytte eksisterende punkter: brug {{ui:Klip}} og sæt ind, eller flyt ét punkt ad gangen ([Redigér et målepunkt](topic:edit-points)).
