---
title: Rediger et oppmålingspunkt
summary: Endre ett punkts nummer, koordinater, høyde eller beskrivelse, eller dra det til et nytt sted i planen.
keywords: rediger punkt, flytt punkt, endre høyde, nummerer på nytt, punktnummer, beskrivelse, dra, nord, øst, fiksér et punkt, feilmåling
from: 375ae2e9
---

En feilmåling, en feil stanghøyde, en beskrivelse skrevet feil: rett det ene punktet, så følger terrengmodellen etter.

## Endre et punkts verdier

1. Med {{ui:Velg}} klikk på punktet i planen. **Egenskaper** viser nummer, øst, nord, høyde og beskrivelse i felt.
2. Skriv den nye verdien og trykk {{key:Enter}} (eller klikk et annet sted). La **Høyde** stå tomt for et punkt uten høyde.
3. Terrengmodellen, høydekurvene og alt som er bygget på dem, oppdateres med én gang.

Hver endring er ett steg: {{key:Mod+Z}} angrer den og {{key:Mod+Y}} gjør den om. En verdi som CivilCraft ikke kan bruke (et nummer et annet punkt allerede har, bokstaver i en koordinat) avvises: feltet får en ramme, og statuslinjen sier hvorfor.

En ny beskrivelseskode lager en ny punktgruppe, slik en import gjør (se [Bygg en terrengmodell](topic:build-surface)).

## Flytt et punkt i planen

1. Velg punktet (det får en ring).
2. Dra ringen. Statuslinjen viser øst og nord der punktet vil havne.
3. Slipp for å flytte det; høyden beholdes. Trykk {{key:Esc}} før slipp for å sette det tilbake.

## Bruddlinjer følger punktet

En bruddlinje tegnet med verktøyet {{ui:Bruddlinje}} kopierer punktene den går gjennom. Når et punkt flyttes eller får ny høyde, flytter bruddlinjehjørnene på det seg med, i samme steg. Bruddlinjegrupper laget fra beskrivelser bygges alltid på nytt fra punktene.

:::note
En terrengmodell lest fra en LandXML-fil beholder sine egne trekanter: punktendringer endrer den først etter {{ui:Bygg terrengmodellen på nytt fra punktene}}.
:::
