---
title: Saker og BCF
summary: Fest et problem til planen, et profilnummer på en veglinje, et terrengpunkt eller et rør, gi det en status og kommentarer, og utveksle sakene som BCF 2.1-filer ved siden av LandXML-filen.
keywords: sak, saker, bcf, kommentar, markering, mangel, feil, byggeplass, nål, status, åpen, løst, lukket, BIM-samarbeidsformat, landxml, problemer
from: e44153b1
---

En sak er en notis festet til et sted i CivilCraft-tegningen din, med en tittel, en status og kommentarer. Bruk den til å fortelle byggeplasspersonell eller et annet program hva de skal se på, og til å lese tilbake svarene deres.

## Legg til en sak

1. Åpne **Overflate, Mer, Saker (BCF)...**
2. Skriv en tittel og hva som er galt.
3. Velg hvor den skal festes: midt i planvisningen, terrengpunktet i midten, et profilnummer på den valgte veglinjen (skriv profilnummeret og en sideforskyvning, høyre er positiv), eller det valgte røret, kummen eller formlinjen.
4. Trykk **Legg til sak**. Nålen vises på planen som et lite rombe med nummeret sitt.

Klikk på tittelen til en sak for å zoome til den, endre statusen i listen (Åpen, Aktiv, Løst, Lukket) og legg til kommentarer. Hver endring er ett angrettrinn, og sakene lagres i prosjektfilen.

## Utveksle dem som BCF

- **Eksporter BCF** skriver en BCF 2.1-fil med ett emne per sak: tittel, status, kommentarer og ett synspunkt med et ortogonalt plankamera og nålen.
- **Importer BCF** leser en BCF-fil (2.0- og 3.0-filer leses i den grad de samsvarer med 2.1). Et emne med en guid du allerede har, oppdaterer den saken (status, nye kommentarer) i stedet for å legge til en ny.
- **Fra Problemer** lager en sak fra hver åpen oppføring i Problemer-panelet som sier hvor den er.

BCF bærer meter i prosjektets egne koordinater, uten forskyvning. Det andre programmet må ligge i samme koordinatsystem som LandXML-filen din, for at nålene skal havne riktig. Elementet nålen peker på (veglinje, profilnummer, sideforskyvning, rør) følger med som etiketter som starter med «cc:», og CivilCraft leser dem tilbake.

## Hva som ikke er kontrollert

Nålene og synspunktene er bare testet ved å skrive en fil og lese den tilbake i CivilCraft. Ingen annet BIM-program har åpnet dem ennå, og om BCF-feltet «view to world scale» betyr hele eller halve høyden på visningen, varierer mellom programmene: CivilCraft skriver full høyde.
