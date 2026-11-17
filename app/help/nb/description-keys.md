---
title: Beskrivelsesnøkler og linjekoder
summary: Gjør feltkoder om til punktgrupper med beskrivelser, og forbind kodede punkter til linjer (start, slutt, lukk) som blir bruddlinjer.
keywords: beskrivelsesnøkler, feltkoder, linjekoder, figurer, linjeføring, start, slutt, lukk, punktgrupper, koder, målekoder, datainnsamler, bruddlinjer, kantstein, kant av kjørebane
from: b3d1af8d
---

Målemannskaper koder hvert punkt i felten: `EP` for kant av kjørebane, `TC` for topp kantstein, `BLDG` for et bygnings hjørne. Koden er første ord i punktets beskrivelse. CivilCraft grupperer punkter etter den, og gjør linjekodene etter den om til linjer.

## Linjekoder

En linjekode er ordet rett etter feltkoden:

| Beskrivelse | Betydning |
|---|---|
| `EP B` | Start en ny kant-av-kjørebane-linje i dette punktet |
| `EP` | Fortsett den gjeldende EP-linjen |
| `EP E` | Avslutt den gjeldende EP-linjen i dette punktet |
| `BLDG C` | Lukk bygget: koble dette punktet tilbake til linjens første punkt |

Punkter med samme kode forbindes i punktnummerrekkefølge. Ulike koder er ulike linjer, selv når de deler en gruppe, så `EP1` og `EP2` gir to kanter samtidig. En kode som aldri bruker en linjekode, forbindes gjennom alle punktene sine, slik som i tidligere versjoner.

Linjer i en gruppe brukt som **Bruddlinje** blir bruddlinjer, én per linje, så en kantstein med et gap strekkes ikke over gapet. Linjer i andre grupper tegnes på planen (lag V-NODE-LINE) og går ut i DXF, DWG og PDF.

Ordene for start, slutt og lukk er `B`, `BEG`, `START`; `E`, `END`; og `C`, `CLO`, `CLOSE`. Endre dem, eller slå av linjekodene, i dialogen nedenfor.

## Beskrivelsesnøkler

En beskrivelsesnøkkel gjør en kode om til en punktgruppe, en bruk og en lang beskrivelse.

1. Under **Punkter**, klikk {{ui:Beskrivelsesnøkler og linjekoder}}.
2. Klikk {{ui:Legg til en nøkkel}} og fyll inn raden:
   - **Kode**: feltkoden som skal treffes. `*` står for alle tegn og `?` for ett, så `EP*` fanger EP, EP1 og EP12.
   - **Gruppe**: punktgruppen disse punktene blir med i (tom = selve koden). `EP*` med gruppe `EP` setter EP1 og EP2 i én gruppe, mens de fortsatt er egne linjer.
   - **Bruk**: Punkter, Bruddlinje eller Utelat, for når gruppen først dukker opp (eller la tabellen **Punkter** avgjøre det).
   - **Beskrivelse**: det lange navnet, vist i et punkts **Egenskaper**.
3. Kolonnen **Punkter** teller hvor mange punkter hver nøkkel fanger mens du skriver. Den første nøkkelen som passer til en kode, vinner.
4. Klikk {{ui:Bruk}}. Gruppene, terrengmodellen og planen følger i ett trinn: {{key:Mod+Z}} angrer det.

En gruppe beholder bruken du ga den i tabellen **Punkter**. En nøkkels bruk settes bare for en gruppe som er ny. Nøklene og linjekodene lagres i prosjektfilen.
