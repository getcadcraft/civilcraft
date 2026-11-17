---
title: Beskrivelsesnøgler og linjekoder
summary: Gør feltkoder til punktgrupper med beskrivelser, og forbind kodede punkter til linjer (begyndelse, slut, luk), der bliver brudlinjer.
keywords: beskrivelsesnøgler, feltkoder, linjekoder, figurer, linjeføring, begyndelse, slut, luk, punktgrupper, koder, målekoder, datasamler, brudlinjer, kantsten, kant af belægning
from: b3d1af8d
---

Opmålingshold koder hvert målepunkt i marken: `EP` for kant af belægning, `TC` for kantstenens top, `BLDG` for et hjørne af en bygning. Koden er det første ord i punktets beskrivelse. CivilCraft grupperer punkter efter den og gør linjekoderne efter den til linjer.

## Linjekoder

En linjekode er ordet lige efter feltkoden:

| Beskrivelse | Betydning |
|---|---|
| `EP B` | Begynd en ny linje for kant af belægning i dette punkt |
| `EP` | Fortsæt den aktuelle EP-linje |
| `EP E` | Afslut den aktuelle EP-linje i dette punkt |
| `BLDG C` | Luk bygningen: forbind dette punkt tilbage til linjens første punkt |

Punkter med samme kode forbindes i punktnummer-rækkefølge. Forskellige koder er forskellige linjer, selv når de deler en gruppe, så `EP1` og `EP2` giver to kanter på én gang. En kode, der aldrig bruger en linjekode, forbindes gennem alle sine punkter, som i tidligere versioner.

Linjer i en gruppe, der bruges som **Brudlinje**, bliver brudlinjer, én pr. linje, så en kantsten med et hul ikke trækkes hen over hullet. Linjer i andre grupper tegnes på planen (lag V-NODE-LINE) og følger med i DXF, DWG og PDF.

Ordene for begyndelse, slut og luk er `B`, `BEG`, `START`; `E`, `END`; og `C`, `CLO`, `CLOSE`. Ændr dem, eller slå linjekoder fra, i dialogen nedenfor.

## Beskrivelsesnøgler

En beskrivelsesnøgle gør en kode til en punktgruppe, en anvendelse og en lang beskrivelse.

1. Under **Punkter** klikker du på {{ui:Beskrivelsesnøgler og linjekoder}}.
2. Klik på {{ui:Tilføj en nøgle}} og udfyld rækken:
   - **Kode**: feltkoden, der skal matche. `*` står for et vilkårligt antal tegn og `?` for ét, så `EP*` fanger EP, EP1 og EP12.
   - **Gruppe**: punktgruppen, disse punkter tilføjes til (tom = selve koden). `EP*` med gruppen `EP` lægger EP1 og EP2 i én gruppe, mens de forbliver adskilte linjer.
   - **Anvendelse**: Punkter, Brudlinje eller Udeladt, når gruppen først dukker op (eller lad den være og brug tabellen **Punkter**).
   - **Beskrivelse**: det lange navn, vist i et punkts **Egenskaber**.
3. Kolonnen **Punkter** tæller de punkter, hver nøgle fanger, mens du skriver. Den første nøgle, der matcher en kode, vinder.
4. Klik på {{ui:Anvend}}. Grupperne, overfladen og planen følger i ét trin: {{key:Mod+Z}} fortryder det.

En gruppe beholder den anvendelse, du gav den i tabellen **Punkter**; en nøgles anvendelse sætter kun den for en gruppe, der er ny. Nøglerne og linjekoderne gemmes i projektfilen.
