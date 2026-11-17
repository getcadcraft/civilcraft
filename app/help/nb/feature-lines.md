---
title: Formlinjer
summary: Tegn 3D-linjer du setter fall på punkt for punkt, lag trinnvise forskyvninger av dem, og bruk dem som bruddlinjer i terrenget eller som skrånende byggeplater i designet.
keywords: bue, kurve, radius, 3D-bue, helix, buet kantstein, høydeoverlegg, falloverlegg, fallpiler, formlinje, fall, skråning, høyde, trinnvis forskyvning, forskyvning, bruddlinje, kantstein, grøft, skulder, skrånende byggeplate, dagslinje, terrengforming, 3D-polylinje
from: d55b25fb
---

En formlinje er en linje med en høyde i hvert hjørnepunkt: en kantstein, en grøftelinje, toppen av en skulder, kanten på en skrånende byggeplate. Høydene settes med tall eller fall, linjen kopieres sidelengs med et trinn opp eller ned, og det velges hva terrengmodellene gjør med den.

## Tegn en

1. Velg **Terrengmodell** › {{ui:Mer}} › {{ui:Formlinje}}, eller trykk {{key:L}}.
2. Klikk hjørnepunktene i planen. Et klikk på et oppmålingspunkt tar punktets plass og høyde; ellers får hjørnet terrengets høyde der.
3. Trykk {{key:Enter}} for å avslutte en åpen linje, eller klikk det første hjørnet igjen for å lukke den.

Den nye linjen er valgt og starter som en bruddlinje for eksisterende terreng, liggende på terrenget.

## Buer

Et segment kan være en bue i planen med ender i ulik høyde: en hjørnekurve i kantstein, en buet grøft, en rampe som svinger. Fallet går jevnt langs buen, og lengden måles langs kurven.

- **Mens du tegner:** trykk {{key:C}} (på en berøringsskjerm: {{ui:Bue}} i linjen over planen) for å slå på buer. Etter et hjørne klikkes et punkt på kurven, og deretter der buen slutter. Trykk {{key:C}} igjen for rette segmenter. {{key:Backspace}} fjerner først punktet på kurven.
- **Etterpå:** i **Egenskaper** skriv et radius og hvilken vei den svinger i hjørnets **Bue**-felt, for eksempel `50 L` eller `50 R` (venstre eller høyre når man går langs linjen), og trykk {{key:Enter}}. Tøm feltet for å gjøre segmentet rett igjen. Et radius mindre enn halvparten av segmentet avvises.

Den valgte linjen viser radiusen til hver bue ved siden av fallet. **Lengde** er langs buene i planen; **3D-lengde** teller også stigning og fall. Trinnvise forskyvninger beholder buene: en bue på utsiden av en kurve vokser, en på innsiden krymper, og en forskyvning forbi buens sentrum avvises.

Terrengmodellene, 3D-visningen og DXF og DWG tar hver bue som korte rette biter som holder seg innenfor 0.01 fra kurven. LandXML beholder dem som buer (se **Buer i andre filer** nedenfor).

## Sett høyder og fall

**Egenskaper** viser hjørnene med deres avstand langs linjen, deres **Høyde** og **Fall til neste** (i prosent). Skriv inn enten og trykk {{key:Enter}}:

- En høyde flytter bare det hjørnet.
- Et fall setter høyden i den fjerne enden av segmentet; hjørnene etter det blir stående, så fallet på neste segment endres.

Også under **Egenskaper**:

| Handling | Hva den gjør |
|---|---|
| **Hev eller senk alle med** | Legger til høyden som skrives inn til hvert hjørne. |
| {{ui:Høyder fra terrenget}} | Legger hvert hjørne tilbake på eksisterende terreng (hjørner utenfor terrengmodellen beholder sine, og listes opp). |
| {{ui:Ett fall, første til siste}} | Beholder første og siste høyde og legger hjørnene mellom på ett jevnt fall. |

Den valgte linjen viser høydene i hjørnene og fallene langs segmentene i planen. Dra et hjørne med {{ui:Velg}} for å flytte det; høyden beholdes.

## Trinnvise forskyvninger

Under **Trinnvis forskyvning** skriv en **Avstand** (positiv til høyre for linjens retning, negativ til venstre), deretter en høyde (opp eller ned med) eller et fall i prosent, og klikk {{ui:Lag forskyvningslinjen}}. Kopien er en ny formlinje: for eksempel baksiden av en kantstein 0.5 ft til siden og 0.5 ft høyere, eller en grøftekant 6 ft ut med 2 %. En avstand som ville få kopien til å brette seg over seg selv i en skarp kurve, avvises.

## Fall og høyder på skjermen

Trykk {{key:E}}, eller kryss av for **Fall og høyder på formlinjer** under **Visning**, for å se hver formlinjes fall langs hvert segment (med en liten pil som peker nedover) og høyden i hjørnene. De vises bare på skjermen: ingenting legges til i tegningen, og PDF, DXF og DWG forblir uendret. Korte segmenter og tett pakkede hjørner er uten merkelapp til man zoomer inn. Den valgte linjen viser alltid sine egne fall og høyder.

## I profilvisningen

En formlinje som krysser en veglinje vises i den veglinjens profilvisning, med navn og høyde i krysningen; linjer som går ved siden av kan også vises. Se [Tegn et lengdeprofil](topic:profile).

## Hva terrengmodellene gjør med den

Velg **Bruk**:

| Bruk | Hva skjer |
|---|---|
| Bruddlinje for eksisterende terreng | Eksisterende terreng går gjennom linjen i dens høyder, som en tegnet bruddlinje. |
| Terrengformet inn i designet | En **lukket** linje blir en skrånende byggeplate: den planlagte terrengmodellen inni den formes ned til kanten. Slå på **Dagslinje til terrenget** for å lage skjærings- og fyllingsskråninger (horisontalt til 1 vertikalt) fra kanten ned til terrenget, slik en byggeplate gjør; hver skråning starter i kantens egen høyde der. |
| Bare tegnet | Den blir liggende i planen og går ut i DXF, DWG og PDF (layer C-GRAD-FEAT, 3D-polylinjer), men terrengmodellene ser bort fra den. |

Volumer, snitt og 3D-visningen tar med formlinjer som er terrengformet inn i designet, slik byggeplater gjør. Hver endring er ett steg: {{key:Mod+Z}} angrer den.

## Del linjer med teamet

I en tegning åpnet fra skyfiler i CadCraft Studio, på en teamplan, har prosjektets **Egenskaper** (uten valg) en **Team**-seksjon med {{ui:Teamlinjer…}}: linjene teamet har delt, hver med sin revisjon, uten å måtte velge en formlinje først. Velg en linje for å dele den, publisere en ny revisjon, hente teamets, eller slutte å dele. Utenfor den innstillingen sier seksjonen hva den trenger.

## Buer i andre filer

| Fil | Hva som skjer med en formlinje med buer |
|---|---|
| CivilCraft-prosjekt | Beholdes nøyaktig. |
| LandXML | Skrives som et planelement med linjer og buer og deres høyder, og leses tilbake med buene. En formlinje fra et annet program kommer inn som **Bare tegnet**: velg dens **Bruk** for å legge den inn i en terrengmodell. |
| DWG og DXF | En 3D-polylinje kan ikke inneholde en bue, så linjen skrives som korte biter innenfor 0.01 av hver bue. CivilCraft noterer også i tegningen hvilke biter som var buer: når tegningen åpnes som linjeverk, henter {{ui:Formlinjer}} linjene tilbake som formlinjer med sine buer. Andre programmer ser en vanlig 3D-polylinje. |
