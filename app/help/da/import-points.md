---
title: Importér opmålingspunkter
summary: Åbn en CSV- eller tekstpunktfil, kontrollér kolonnerækkefølgen i dialogen Importér punkter, ret rækker, der ikke kan læses, og sortér punkterne i grupper.
keywords: importér punkter, csv, txt, pnezd, penzd, punktfil, opmåling, cogo-punkter, punktgrupper, kolonner, nord øst
from: ad33d88a
---

En punktfil er en tekstfil med ét punkt pr. linje: punktnummer, nord, øst, kote og beskrivelse i en eller anden rækkefølge, adskilt af kommaer, tabulatorer, semikolon eller mellemrum. CivilCraft læser den i browseren og bygger straks en overflade ud af den.

## Før du starter

- Kend filens kolonnerækkefølge, hvis du kan (PNEZD og PENZD ser ens ud for en computer).
- Kend dens enheder. CivilCraft konverterer ikke: angiv **Enheder** i venstre panel, så de passer til filen (se [Enheder, stationer og talformater](topic:units-and-stations)).
- Koordinater kan være store (nord og øst i plane koordinatsystemer i millionerne er fint).

## Importér filen

1. Klik på {{ui:Åbn}} i værktøjslinjen, eller tryk {{key:Mod+O}}, og vælg filen. Du kan også trække den hen på planen.
   Dialogen **Importér punkter** åbner med filnavnet, en liste **Kolonner** sat til {{ui:Registrér}}, en oversigtslinje og de første seks punkter.
2. Læs oversigtslinjen. Den siger, hvor mange punkter der blev læst, i hvilken kolonnerækkefølge, hvordan rækkefølgen blev fundet, og hvad der adskiller kolonnerne. De tre måder, rækkefølgen findes på:
   - "fra overskriftsrækken": første linje navngiver sine kolonner (Point, Northing, Easting, Elevation, Description, eller X, Y, Z …). Det er det sikreste.
   - "som valgt": du valgte en rækkefølge i **Kolonner**.
   - "gættet ud fra antal kolonner og din punktrækkeindstilling (PNEZD) — kontrollér at nord og øst ikke er byttet om": der var ingen brugbar overskrift. Hvis dine filer normalt har øst først, så sæt **Punktrækker** til P, E, N, Z, D i [CivilCraft-indstillinger](topic:settings).
3. Kontrollér forhåndsvisningstabellen. Dens kolonner er altid **Punkt**, **Nord**, **Øst**, **Kote**, **Beskrivelse**, uanset hvilken rækkefølge filen bruger. Nord- og østkoordinater på en rigtig grund er som regel tydeligt forskellige i størrelse: ser de byttet om ud, var gætningen forkert.
4. Hvis rækkefølgen er forkert, vælg den rigtige i **Kolonner** (fx {{ui:PENZD — punkt, øst, nord, kote, beskrivelse}}). Oversigten og forhåndsvisningen opdateres med det samme.
5. Under forhåndsvisningen finder du **Rækker, der ikke læses**. Hver linje nævner filens linjenummer, årsagen og begyndelsen af rækken. Se [Rækker, der ikke læses](topic:import-points#rows-that-are-not-read).
6. Klik på {{ui:Importér}}.
   Punkterne vises på planen, visningen zoomer til dem, og overfladen bygges. Statuslinjen siger fx "Importerede 276 punkter fra site.csv; overflade: 546 trekanter."

Hvis projektet ikke havde et navn endnu, tager det filens navn.

## Kontrollér grupperne

Hvert punkt hører til en gruppe, der navngives efter **det første ord i dets beskrivelse**, med store bogstaver: "GRD", "FL 12" og "fl" er grupperne GRD, FL og FL. Punkter uden beskrivelse går i "(ingen beskrivelse)".

1. Se tabellen under **Punkter** i venstre panel: gruppe, antal punkter og et valg af **Overflade**.
2. Hver gruppe starter som {{ui:Punkter}}. Ændr flowlinjer, kanter på belægninger, top og fod af skråninger, rygge og lignende kodede linjer til {{ui:Brudlinje}}. Sæt grupper, der ikke skal forme terrænet (kontrolpunkter, trætoppe, ledningsstolper målt i toppen) til {{ui:Udeladt}}.
3. Klik på et punkt på planen (med {{ui:Vælg}}) for at se dets nummer, koordinater, kote, beskrivelse og gruppe i det højre panel.

:::warning
En bruddlinjegruppe samler **alle** sine punkter til **én** linje, i punktnummerrækkefølge. Det virker, når hver kodet linje blev målt i rækkefølge med sin egen kode. To adskilte flowlinjer, der begge er kodet "FL", bliver til én linje, der slynger sig mellem dem. Hvis dine koder er fælles, så brug værktøjet {{ui:Brudlinje}} til at klikke på punkterne i hver linje i stedet (se [Byg og finjustér overfladen](topic:build-surface)).
:::

## Rækker, der ikke læses

| Årsag vist | Hvad det betyder | Hvad du gør |
|---|---|---|
| "nord eller øst er ikke et tal" | En koordinatkolonne indeholder tekst | Kontrollér kolonnerækkefølgen, eller en løs tekstrække midt i filen |
| "kote er ikke et tal" | Kotekolonnen indeholder tekst | Forkert kolonnerækkefølge, eller en beskrivelse i kotekolonnen |
| "intet punktnummer" | Punktkolonnen er tom | Nummerér punktet, eller vælg en rækkefølge uden P (NEZD, NEZ …): punkterne nummereres så 1, 2, 3 … |
| "punkt 12 optræder to gange (den første beholdes)" | To rækker deler et nummer | Nummerér en af dem om i filen, hvis begge er rigtige målinger |
| "3 kolonner, forventet 5 (PNEZD)" | Rækken er for kort | En brudt linje, eller forkert kolonnerækkefølge |

Et punkt med tom kote beholdes, men bruges ikke i overfladen. Punktfakta viser, hvor mange punkter der har en kote.

Linjer, der begynder med `#`, `;` eller `//`, er kommentarer og springes over. Tomme linjer springes over.

## Erstat eller tilføj punkter

Importerer du igen, **erstatter** det alle punkterne; det tilføjes ikke til dem. Dine tracéer, plateauer, rør, tegnede bruddlinjer og afgrænsning forbliver. Fortryd-historikken ryddes, så gem projektet først, hvis du måske vil have de gamle punkter tilbage. For at kombinere to filer, sammenflet dem i en teksteditor eller et regneark, før du importerer (pas på gentagne punktnumre).

Punkter kan endnu ikke flyttes, redigeres eller slettes inde i CivilCraft. Ret dem i filen og importér igen.

## Relateret

- [Punktfilformater](topic:point-file-formats): alle kolonnerækkefølger, og hvordan overskrifter genkendes.
- [Byg og finjustér overfladen](topic:build-surface).
