---
title: Beregn overvannsstrømmer, rørdimensjoner og trykklinjen
summary: Tegn nedbørfeltene som renner til hver kum, summer strømmene nedover nettet med den rasjonelle metoden, dimensjoner rørene etter Mannings formel, og se hvor trykklinjen går fullt eller når overflaten.
keywords: overvann, overvannsavløp, nedbørfelt, avrenningsfelt, rasjonalmetoden, avrenningskoeffisient, konsentrasjonstid, nedbørintensitet, idf, manning, rørdimensjonering, trykklinje, hgl, energilinje, egl, under trykk, oversvømmelse, utløpsvannstand
from: e44872ec
---

Overvannsavløp arbeider på [rørnettverket](topic:pipe-network): tegn nettverket først, deretter feltene som renner inn i det. Alt vises under **Overvannsavløp** i høyre panel når ingenting er valgt.

## Tegn et nedbørfelt

1. Klikk **Tegn et nedbørfelt** under **Overvannsavløp**.
2. Klikk hjørnene i området som renner til én kum. {{key:Enter}} eller dobbeltklikk avslutter; {{key:Backspace}} tar tilbake siste hjørne, {{key:Esc}} stopper.
3. Feltet renner til en kum innenfor det, ellers til den nærmeste. Egenskapene åpnes: sett navnet, **Avrenningskoeffisient C** (andelen av regnet som renner av, 0 til 1), **Konsentrasjonstid** i minutter, og hvilken kum det **Renner til**.

**Tegn et nytt nedbørfelt** i egenskapene starter neste. Klikk inne i et felt i planen for å velge det; {{key:Delete}} fjerner det. Hver endring er ett steg: {{key:Mod+Z}} angrer den.

## Sett dimensjonerende regn

Nedbørintensiteten er i = a ÷ (tc + b) opphøyd i c, i tommer per time for et prosjekt i fot og millimeter per time for et prosjekt i meter. Tilpass **Intensitet a**, **b** og **c** til din egen intensitets-varighets-frekvenskurve for gjentaksintervallet du dimensjonerer for.

:::warning
Startkurven for intensitet, Manning n (0.013) og knutetap (0.5) er plassholdere, ikke en standard. Sett dem etter dine egne nedbørdata og dimensjoneringskriterier.
:::

- **Kortest konsentrasjonstid**: ingen rør beregnes ved kortere tid (10 minutter til å begynne med).
- **Manning n**: rørenes ruhet.
- **Knutetap**: tapt trykkhøyde i hver kum, som en andel av hastighetshøyden V²/2g i røret som forlater den.
- **Vannstand ved utløpet**: utløpsvannstanden, der det siste røret tømmes. La feltet stå tomt når utløpet renner fritt.

## Hvordan strømmene summeres

Hvert rør bærer alle felt over det. Q = C × i × A, der C × A summeres nedover nettet, og i er intensiteten ved den lengste konsentrasjonstiden for vannet som kommer: et felts egen tid, eller tiden fra et oppstrøms felt pluss reisetiden gjennom rørene (lengde ÷ hastigheten når røret er fullt). Q er i kubikkfot per sekund (A i acres) eller kubikkmeter per sekund (A i hektar).

## Dimensjoner rørene

Tabellen under **Strømmer og trykklinjer** viser for hvert rør strømmen, hva det bærer når det er fullt ved sitt fall, hastigheten, trykklinjen i topp og fot, og hvor dypt det renner.

**Dimensjoner rørene for disse strømmene** gir hvert rør den minste standardstørrelsen som bærer strømmen ved sitt eget fall (12 til 72 in, eller 300 til 1800 mm). Det er ett steg. Bunnkotene blir stående: endres størrelsene, bruk {{ui:Sett alle bunnkoter fra reglene}} for å beholde overdekningen, og kontroller tabellen på nytt.

## Les trykklinjene

Trykklinjen (HGL) beregnes fra utløpet og oppover:

- Et rør som renner delvis fullt, har sin HGL ved vannflaten: bunnkoten pluss normaldybden.
- Når vannet under er høyere enn scheitelen, eller røret bærer mer enn det kan når det er fullt, renner det fullt (under trykk), og HGL stiger med friksjonshellingen over sin lengde.
- I hver kum er HGL lik HGL-toppen til røret som forlater den, pluss knutetapet.
- Energilinjen (EGL) er HGL pluss hastighetshøyden.

Et rør som renner fullt, listes, og det samme gjelder enhver kum der HGL er over randen: vann når overflaten der, og kummen er ringet inn i rødt i planen. Velg et rør eller en kum for å se strøm, dybde, hastighet og begge trykklinjene i egenskapene.

## Kjør en regnskyll

Den rasjonelle metoden gir én topp for hvert rør. {{ui:Beregn regnskyllen}} (under resultatene, i nettverkets egenskaper) beregner hele regnskyllen i stedet: hvert felts avrenning over tid, ført nedover rørene med reisetid og lagring, og lagt sammen der de møtes.

1. La {{ui:Regnet varer}} og {{ui:Regnintensitet}} stå tomme for å bruke den lengste konsentrasjonstiden og regnkurven over, eller skriv inn dine egne.
2. Trykk {{ui:Beregn regnskyllen}}. Tabellen viser for hvert rør den høyeste inn- og utstrømmen, hvor mye lavere den utgående toppen er, hvor stor andel av rørets fulle kapasitet som brukes, og minuttet den topper.
3. Hvert utløp får et lite diagram over strøm over tid og {{ui:Last ned hydrografen (CSV)}}.

Et felt sender ut regnet gjennomsnittet over sin konsentrasjonstid, så en regnskyll som er kortere enn den, topper lavere enn C × i × A. Hvert rør beregnes med Muskingum–Cunge-metoden, med strømdybden den rasjonelle metoden allerede fant. To grener med ulik konsentrasjonstid topper ikke samtidig, så summen deres er lavere enn summen av toppene.

Dette modellerer ikke trykkstrømning, tilbakestuing, lagring i kummer eller flom. Et rør der den beregnede toppen er over sin fulle kapasitet, listes, og vannet føres videre som om det passet. Bruk det til å se timing og dempning, ikke til å dimensjonere røret. Det er et beregningshjelpemiddel: en ingeniør kontrollerer det.

## Lagret i prosjektet

Nedbørfelt og innstillingene for regnskyll lagres i prosjektfilen. De er ikke i PDF-plottet, DWG eller DXF, eller LandXML ennå: se [Ikke bygget ennå](topic:not-built-yet).
