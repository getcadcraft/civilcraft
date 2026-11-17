---
title: Importer oppmålingspunkter
summary: Åpne en CSV- eller tekstpunktfil, kontroller kolonnerekkefølgen i dialogen Importer punkter, rett rader som ikke kan leses, og sorter punktene i grupper.
keywords: importer punkter, csv, txt, pnezd, penzd, punktfil, oppmåling, cogo-punkter, punktgrupper, kolonner, nord øst
from: ad33d88a
---

En punktfil er en tekstfil med ett punkt per linje: punktnummer, nord, øst, høyde og beskrivelse i en eller annen rekkefølge, skilt med komma, tabulatorer, semikolon eller mellomrom. CivilCraft leser den i nettleseren og bygger en overflate av den med én gang.

## Før start

- Kjenn kolonnerekkefølgen hvis mulig (PNEZD og PENZD ser like ut for en datamaskin).
- Kjenn enhetene. CivilCraft konverterer ikke: sett **Enheter** i venstre panel til å stemme med filen (se [Enheter, stasjoner og tallformater](topic:units-and-stations)).
- Koordinatene kan være store (nord og øst i millionområdet er greit).

## Importer filen

1. Klikk {{ui:Åpne}} i verktøylinjen, eller trykk {{key:Mod+O}}, og velg filen. Filen kan også dras inn på planen.
   Dialogen **Importer punkter** åpnes med filnavnet, en liste **Kolonner** satt til {{ui:Gjenkjenn}}, en oppsummeringslinje og de seks første punktene.
2. Les oppsummeringslinjen. Den sier hvor mange punkter som ble lest, i hvilken kolonnerekkefølge, hvordan rekkefølgen ble funnet, og hva som skiller kolonnene. De tre måtene rekkefølgen finnes på:
   - "fra overskriftsraden": første linje navngir kolonnene (Punkt, Nord, Øst, Høyde, Beskrivelse, eller X, Y, Z …). Dette er tryggest.
   - "som valgt": en rekkefølge er valgt i **Kolonner**.
   - "gjettet ut fra antall kolonner og innstillingen for punktrader (PNEZD) – sjekk at nord og øst ikke er byttet om": det fantes ingen brukbar overskrift. Hvis filene vanligvis har øst først, settes **Punktrader** til P, E, N, Z, D i [CivilCraft-innstillingene](topic:settings).
3. Kontroller forhåndsvisningstabellen. Kolonnene er alltid **Punkt**, **Nord**, **Øst**, **Høyde** og **Beskrivelse**, uansett rekkefølge i filen. Nord- og østkoordinater på et ekte sted er vanligvis tydelig forskjellige i størrelse: ser de ut til å være byttet om, var gjettingen feil.
4. Hvis rekkefølgen er feil, velg riktig i **Kolonner** (for eksempel {{ui:PENZD — punkt, øst, nord, høyde, beskrivelse}}). Oppsummering og forhåndsvisning oppdateres med én gang.
5. Se under forhåndsvisningen etter **Rader som ikke er lest**. Hver linje oppgir linjenummeret i filen, årsaken og starten på raden. Se [Rader som ikke er lest](topic:import-points#rader-som-ikke-er-lest).
6. Klikk {{ui:Importer}}.
   Punktene vises på planen, visningen zoomer til dem og overflaten bygges. Statuslinjen sier for eksempel "Importerte 276 punkter fra site.csv; terrengmodell: 546 trekanter."

Hvis prosjektet ikke hadde navn ennå, tar det filens navn.

## Sjekk gruppene

Hvert punkt tilhører en gruppe navngitt etter **første ordet i beskrivelsen**, med store bokstaver: "GRD", "FL 12" og "fl" er grupper GRD, FL og FL. Punkter uten beskrivelse går i "(ingen beskrivelse)".

1. Se tabellen under {{ui:Punkter}} i venstre panel: gruppe, antall punkter og et valg for **Overflate**.
2. Hver gruppe starter som {{ui:Punkter}}. Endre formlinjer, kanter av belegning, topper og tær i skråninger, rygger og lignende kodede linjer til {{ui:Bruddlinje}}. Sett grupper som ikke skal forme terrenget (kontrollpunkter, tretopper, stolper målt i toppen) til {{ui:Utelatt}}.
3. Klikk et punkt på planen (med {{ui:Velg}}) for å se nummer, koordinater, høyde, beskrivelse og gruppe i høyre panel.

:::warning
En bruddlinjegruppe slår **alle** sine punkter sammen til **én** linje, i punktnummerrekkefølge. Det fungerer når hver kodet linje ble målt i rekkefølge med sin egen kode. To separate formlinjer som begge er kodet "FL", blir én linje som sikksakker mellom dem. Hvis kodene er delt, bruk verktøyet {{ui:Bruddlinje}} til å klikke punktene på hver linje i stedet (se [Bygg og finjuster overflaten](topic:build-surface)).
:::

## Rader som ikke er lest

| Vist årsak | Hva det betyr | Hva gjøres |
|---|---|---|
| "nord eller øst er ikke et tall" | En koordinatkolonne har tekst | Sjekk kolonnerekkefølgen, eller en løs tekstrad midt i filen |
| "høyde er ikke et tall" | Høydekolonnen har tekst | Feil kolonnerekkefølge, eller en beskrivelse i høydekolonnen |
| "mangler punktnummer" | Punktkolonnen er tom | Nummerer punktet, eller velg en rekkefølge uten P (NEZD, NEZ …): punktene nummereres da 1, 2, 3 … |
| "punkt 12 finnes to ganger (den første beholdes)" | To rader deler et nummer | Gi ett av dem nytt nummer i filen hvis begge er ekte målinger |
| "3 kolonner, forventet 5 (PNEZD)" | Raden er for kort | En ødelagt linje, eller feil kolonnerekkefølge |

Et punkt med tom høyde beholdes, men brukes ikke i overflaten. Tabellen **Punkter** viser hvor mange punkter som har høyde.

Linjer som starter med `#`, `;` eller `//` er kommentarer og hoppes over. Tomme linjer hoppes over.

## Erstatt eller legg til punkter

Å importere på nytt **erstatter** alle punktene; det legger ikke til. Linjeføringene, byggeplatene, rørene, tegnede bruddlinjer og avgrensningen blir værende. Angrehistorikken tømmes, så lagre prosjektet først hvis de gamle punktene kan bli nødvendige igjen. For å kombinere to filer, slå dem sammen i et tekstredigeringsprogram eller regneark før import (se etter gjentatte punktnumre).

Punkter kan ennå ikke flyttes, redigeres eller slettes inne i CivilCraft. Rett dem i filen og importer på nytt.

## Relatert

- [Punktfilformater](topic:point-file-formats): hver kolonnerekkefølge og hvordan overskrifter gjenkjennes.
- [Bygg og finjuster overflaten](topic:build-surface).
