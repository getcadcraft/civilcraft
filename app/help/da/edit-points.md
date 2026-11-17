---
title: Redigér et opmålingspunkt
summary: Ændr ét punkts nummer, koordinater, kote eller beskrivelse, eller træk det til et nyt sted på planen.
keywords: redigér punkt, flyt punkt, ændr kote, nummerér om, punktnummer, beskrivelse, træk, nord, øst, fastlås et punkt, fejlmåling
from: 375ae2e9
---

En fejlmåling, en forkert stanghøjde, en forkert indtastet beskrivelse: ret det ene punkt, så følger overfladen med.

## Ændr et punkts værdier

1. Med {{ui:Vælg}} klikker du på punktet på planen. **Egenskaber** viser dets nummer, øst, nord, kote og beskrivelse i felter.
2. Skriv den nye værdi, og tryk på {{key:Enter}} (eller klik et andet sted). Lad **Kote** være tom for et punkt uden kote.
3. Overfladen, højdekurverne og alt, der bygger på dem, opdateres med det samme.

Hver ændring er ét trin: {{key:Mod+Z}} fortryder den, og {{key:Mod+Y}} gentager den. En værdi, CivilCraft ikke kan bruge (et nummer, et andet punkt allerede har, bogstaver i en koordinat), afvises: feltet markeres med en kant, og statuslinjen siger hvorfor.

En ny beskrivelseskode laver en ny punktgruppe, ligesom en import gør (se [Byg en overflade](topic:build-surface)).

## Flyt et punkt på planen

1. Vælg punktet (det får en ring).
2. Træk ringen. Statuslinjen viser øst og nord for det sted, det flyttes hen til.
3. Slip for at flytte det; dets kote bevares. Tryk på {{key:Esc}}, før du slipper, for at sætte det tilbage.

## Brudlinjer følger punktet

En brudlinje tegnet med værktøjet {{ui:Brudlinje}} kopierer de punkter, den går igennem. Når du flytter et punkt eller ændrer dets kote, flytter brudlinjens hjørner på det sig med, i samme trin. Brudlinjegrupper lavet ud fra beskrivelser genopbygges altid fra punkterne.

:::note
En overflade læst fra en LandXML-fil beholder sine egne trekanter: punktredigeringer ændrer den først efter {{ui:Genopbyg overfladen fra punkterne}}.
:::
