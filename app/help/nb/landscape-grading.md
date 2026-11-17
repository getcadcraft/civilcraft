---
title: Terrengforming for landskap
summary: Plattformer, voller, grøfter og fri terrengforming med kotehøyder og høydekurver du drar, skjæring og fylling live, fallanalyse, avrenningspiler og vannansamling — alt i CivilCraft sin ferdige overflate.
keywords: støttemur, støttemurer, vertikal side, mur i stedet for skråning, skråning per side, fyllingsskråning, terrengforming, landskapsterrengforming, plattform, terrasse, byggeplate, voll, haug, grøft, kotehøyde, høydekurver, rediger høydekurver, skjæring og fylling, jordarbeider, fallanalyse, tilgjengelighet, bratte skråninger, avrenningspiler, drenering, vannansamling, pytter
from: e1559eb9
---

Alt her planeres inn i **ferdig terreng** med samme planering som byggeplater og korridorer. **Eksisterende terreng** endres aldri, og Jordarbeider teller alt. Terrengforming-menyen ligger i gruppen Landskap.

## Plattformer

{{ui:Terrengforming}} › {{ui:Plattform}}, klikk hjørnene og trykk {{key:Enter}}. Plattformen starter på gjennomsnittlig terrenghøyde under den; skriv inn en **Høyde** for å sette den, eller tøm feltet for å følge terrenget igjen. Et **Fall** i % og **Faller mot** i grader (0 = øst, 90 = nord) vipper den. Sidene planeres ut til terrenget i **Skjæringsskråning** og **Fyllingsskråning** (horisontalt til 1).

## Skråninger per side og støttemurer

Under **Sider og støttemurer** i Egenskapene til en byggeplate, en plattform eller en voll kan hver side planeres på sin egen måte. Side 1 går fra det første hjørnet du klikket til det andre, side 2 fra det andre til det tredje, og så videre.

- **Alle sider**: **Skrånende** bruker skjærings- og fyllingsskråningene over på hver side; **Vertikal: støttemurer** setter en mur på hver side.
- Per side: **Skråninger over**, **Egne skråninger** (skriv inn en skjærings- og en fyllingsskråning for den siden) eller **Vertikal (støttemur)**.
- Skriv inn en skråning som `3` eller `3:1` (horisontalt til 1 vertikalt), `33%` eller `18.4°`; den vises som H:1. Byggeplatens egen **Skjæringsskråning** og **Fyllingsskråning** tar det samme.
- En vertikal side har ingen fyllingsskråning: en støttemur går langs kanten, fra byggeplaten ned til eksisterende terreng (i fylling) eller fra terrenget ned til byggeplaten (i skjæring). **Murtykkelse** (0.3 m eller 1 ft til å begynne med) er hvor langt terrenget trinner fra byggeplatekanten til eksisterende terreng. Skjærings- og fyllingsvolumene utelater fyllingen som siden ikke lenger har.
- Der en mur møter en skrånende side, vikler skråningen seg rundt enden av muren; to murer møtes i en gjæring.
- Under feltene: murenes lengde, eksponert front (høyde × lengde), høyeste og gjennomsnittlig høyde.

Planen tegner hver murs ytre front med korte streker over den og høyden i begge ender og på det høyeste punktet (på laget for støttemurer, som også går inn i DXF og DWG). 3D-visningen viser murene som volumer (Vis › Støttemurer), og GLB-, OBJ- og USD-eksporter tar dem med. Snitt over kanten viser trinnet.

**Advarsler** (i Egenskaper, og i Problemer-panelet): en mur høyere enn **Advar over en murhøyde på** (1.0 m eller 3.3 ft til å begynne med) "kan trenge en prosjektert mur eller en tillatelse; sjekk lokale regler", og, når **Brattest skråning jorda tåler** skrives inn, enhver side hvis skjærings- eller fyllingsskråning er brattere enn det. De er advarsler: terrengformingen bygges fortsatt. Hver endring er ett steg for {{key:Mod+Z}}.

## Voller

{{ui:Terrengforming}} › {{ui:Voll}}: en haug der toppen er **Høyde** over gjennomsnittlig terreng under den, med sidene planert ut.

## Grøfter

{{ui:Terrengforming}} › {{ui:Grasgrøft}}, klikk langs grøften **i den veien vannet renner**, og trykk {{key:Enter}}. Sett **Dybde**, **Bunnbredde** (0 for en V) og **Sideskråning**. Uten **Fall** følger bunnen terrenget, med dybden under det, og går aldri oppover; skriv inn et fall for å gi den et jevnt fall fra starten.

## Kotehøyder og høydekurver

1. {{ui:Terrengforming}} › {{ui:Terrengformingsområde}}: klikk omrisset av området du vil forme.
2. {{ui:Terrengforming}} › {{ui:Kotehøyde}}: klikk inne i området. Skriv inn høyden i Egenskaper, eller bruk ▲ ▼-knappene.
3. {{ui:Terrengforming}} › {{ui:Rediger en høydekurve}}: klikk en høydekurve inne i området for å ta den som en linje som kan formes på nytt.

Velg en kotehøyde eller en høydekurve og **dra** den (eller punktene sine) på planen: terrengmodellen følger når du slipper, som ett angrestegg. Inne i området bygges terrenget på nytt fra kanten sin (der det møter eksisterende terreng), kotehøydene og de redigerte høydekurvene.

## Skjæring og fylling, live

Hvert terrengformingsobjekts Egenskaper viser sin **Skjæring** og **Fylling**, og hele tomtens, etter rutenettmetoden Jordarbeider bruker, mens det endres. Problemer (utenfor overflaten, et omriss som krysser seg selv) listes der.

## Terrengkontroller

I delen **Terrengkontroller** til venstre:

- **Fallanalyse** farger overflaten etter helning: opp til grensen for svakt fall, mellom, og brattere enn grensen for bratt (5 % og 33.3 % til å begynne med: vanlig 1:20 for tilgjengelige ruter og 1:3 for slått). Tegnforklaringen sier hvor mye av arealet som faller i hver. De bratte områdene skrives også ut på ark.
- **Avrenningspiler og vannansamling** tegner hvilken vei vannet renner og ringer inn hvert sted det ville samlet seg, med dybden; seksjonen sier hvor mange steder det er, det dypeste, og hvor mye vann de holder.

Kontrollene leser ferdig terreng når noe er planert, ellers eksisterende terreng.
