---
title: Velg, kopier og lim inn målepunkter
summary: Velg målepunkter med klikk, Shift og en boks, eller alle samtidig; kopier, klipp ut, lim inn, lim inn på samme sted, dupliser og slett dem med nye punktnumre som aldri kolliderer; lim inn punktrader til og fra et regneark.
keywords: kopier, lim inn, klipp ut, dupliser, slett punkter, velg punkter, velg alle, boksvalg, vindu, utklippstavle, regneark, csv, nummerer på nytt, punktnumre, lim inn på samme sted, klon, utsetting
from: 78a6aea7
---

Målepunkter kan kopieres og limes inn i et prosjekt, mellom prosjekter i to nettleserfaner, og til og fra et regneark. Hver endring er én angrehandling, og terrengmodellen bygges om fra de nye punktene med én gang.

## Velg punkter

Med {{ui:Velg}} ({{key:V}}):

- **Klikk** på et punkt for å velge det (og bare det). Numrene vises under **Egenskaper**.
- {{key:Shift}} og **klikk** legger et punkt til utvalget, eller tar det ut.
- {{key:Shift}} og **dra** tegner en boks: punktene inni den legges til utvalget. Drar du rundt punktene i stedet, blir det et lasso; se [Lassovalg av målepunkter](topic:lasso-selection). Dra uten {{key:Shift}} panorerer, som alltid.
- {{key:Mod+A}} (eller {{ui:Mer}} › {{ui:Velg alle punkter}}) velger alle punktene.
- {{key:Esc}} (eller {{ui:Mer}} › {{ui:Fjern utvalg}}) fjerner utvalget.

Valgte punkter har en ring. Når mer enn ett er valgt, viser **Egenskaper** antallet, numrene, høydeområdet og gruppene.

## Kopier, klipp ut og slett

- {{ui:Kopier}} eller {{key:Mod+C}} kopierer de valgte punktene. CivilCraft beholder kopien, og legger den også på systemets utklippstavle som punktrader, slik at du kan lime den rett inn i et regneark eller en tekstfil.
- {{ui:Mer}} › {{ui:Klipp ut}} eller {{key:Mod+X}} kopierer dem og sletter dem, i ett trinn.
- {{ui:Mer}} › {{ui:Slett}} eller {{key:Delete}} sletter dem. {{key:Mod+Z}} henter dem tilbake.

Radene er punkt, nord, øst, høyde, beskrivelse (P,N,E,Z,D), skilt med komma, med tre desimaler. For å få øst før nord, sett **Punktrader** i [innstillinger for CivilCraft](topic:settings). En beskrivelse som et regneark ville tolke som en formel (den begynner med =, +, - eller @), får en apostrof foran, slik at den forblir tekst.

## Lim inn

1. Trykk {{key:Mod+V}} eller klikk {{ui:Lim inn}}. Punktene følger pekeren som små kryss, med en prikket linje tilbake til der de kom fra.
2. Klikk der de skal. Midten av de kopierte punktene havner på klikket.
3. Eller trykk {{key:Enter}} for å sette dem på sine egne koordinater, eller {{key:Esc}} for å avbryte.

{{ui:Mer}} › {{ui:Lim inn på samme sted}} eller {{key:Mod+Shift+V}} limer inn på punktenes egne koordinater med én gang. De innlimte punktene er valgt etterpå, slik at du kan kopiere, flytte eller slette dem igjen.

:::note
Å klikke {{ui:Lim inn}} på verktøylinjen leser systemets utklippstavle. Første gang kan nettleseren spørre om CivilCraft får se utklippstavlen. Sier du nei, limer verktøyknappen bare inn CivilCraft sin egen kopi. {{key:Mod+V}} limer fortsatt inn rader fra et regneark uten å spørre.
:::

## Punktnumrene kolliderer aldri

To punkter deler aldri et nummer. Når du limer inn:

- Et innlimt punkt beholder sitt nummer når ingen punkter i prosjektet har det. Etter **Klipp ut** limes punktene inn igjen med sine egne numre, og punkter kopiert fra et annet prosjekt beholder sine der de er ledige.
- Et innlimt punkt hvis nummer er tatt, får et nytt heltall: ett mer enn det høyeste nummeret i bruk, telt oppover.
- Statuslinjen sier hva som skjedde, for eksempel «1 beholdt sitt nummer; 9 fikk nye numre: 10–18 ble 277–285».

I [innstillinger for CivilCraft](topic:settings) kan du velge **Alltid nye numre**, og et nummer nye numre skal starte på, for eksempel 5000 for prosjekteringspunkter.

:::warning
Punktgrupper som bygger terrengmodellen som en **bruddlinje**, forbinder punktene sine i nummerrekkefølge. Innlimte kopier av bruddlinjepunkter (for eksempel FL-målinger) får nye, høyere numre og kobles til enden av den bruddlinjen, eventuelt med et langt hopp. Sjekk planen etter å ha limt inn slike punkter, eller sett gruppen deres til {{ui:Punkter}}.
:::

## Dupliser

{{ui:Mer}} › {{ui:Dupliser}} eller {{key:Mod+D}} lager en kopi av de valgte punktene som følger pekeren: klikk der den skal. Kopiene får alltid nye numre, og CivilCraft sin utklippstavle blir liggende slik den var.

## Fra et regneark eller en tekstfil

Velg rader med punkter i et regneark (punkt, nord, øst, høyde, beskrivelse) og kopier dem. I CivilCraft trykker du {{key:Mod+V}} og klikker der de skal, eller trykker {{key:Mod+Shift+V}} for å sette dem på sine egne koordinater. Det er vanligvis det du vil ha for ekte målingsdata.

Radene leses nøyaktig som en [punktfil](topic:point-file-formats): komma, tabulatorer eller mellomrom, og en overskriftsrad hvis den finnes. Uten overskrift kommer kolonnerekkefølgen fra **Punktrader** i [innstillinger for CivilCraft](topic:settings).

Når begge finnes, avgjør CivilCraft etter hva som er nyest: rader på systemets utklippstavle som avviker fra CivilCraft sin siste kopi, ble kopiert senere, og de limes inn. Tekst som ikke inneholder punkter, ignoreres, og CivilCraft sin egen kopi limes inn i stedet.

## Mellom prosjekter og faner

Kopien beholdes i denne nettleseren, slik at en annen fane i CivilCraft kan lime den inn, selv etter at den første fanen er lukket. Punkter kopiert i et prosjekt i meter og limt inn i et prosjekt i fot beholder sine numre som de er: ingenting omregnes, og statuslinjen sier det.

## Hva som ikke kopieres

Bare målepunkter kopieres foreløpig. Veglinjer, byggeplater, rørnett, bruddlinjer og grenser kan ikke kopieres eller limes inn ennå. Innliming kan ikke flytte eksisterende punkter: bruk {{ui:Klipp ut}} og lim inn, eller flytt ett punkt om gangen ([Rediger et målepunkt](topic:edit-points)).
