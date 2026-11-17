---
title: Een uitzetrapport maken
summary: Lijst de uitzetpunten langs een tracé op stations en offsets, of de meetpunten in de buurt, met station, offset, Northing, Easting, ontwerp- en terreinhoogten en ontgraving of ophoging, en sla het rapport op als CSV of PDF.
keywords: uitzetten, uitzetrapport, cut sheet, hoogtelijst, station, offset, ontgraving, ophoging, layout, uitzetten bouw, as-built
from: d8a4e9f1
---

Selecteer een tracé en klik in het onderdeel **Eigenschappen** op **Uitzetrapport**.

## Uitzetpunten op stations en offsets

1. **Van** en **tot**: de stations die u uitzet (1+50 of 150).
2. **elke**: het interval. Uitzetpunten komen op elk veelvoud daarvan, aan beide uiteinden, en (met het vakje aangevinkt) waar de bochten van het tracé beginnen en eindigen.
3. **Offsets**: links en rechts van het tracé, gezien in de richting van oplopende stations: `12 L, 0, 12 R`, `L12 CL R12` of `-12, 0, 12` (links is min). Een tracé met een corridor begint met de randen van de verharding en de bermen.
4. **Nummer vanaf** en **met voorvoegsel** geven de uitzetpunten een naam: 1, 2, 3, of S101, S102.

## Meetpunten nabij het tracé

Kies **meetpunten nabij het tracé** en hoe dichtbij. Elk punt binnen die afstand krijgt zijn station en offset, het ontwerp daar en zijn eigen hoogte als terrein: een controle van punten die zijn uitgezet of als as-built ingemeten.

## Wat het rapport toont

| Kolom | Wat het is |
|---|---|
| Punt | De naam van het uitzetpunt, of het nummer van het meetpunt |
| Station, Offset | Waar het langs het tracé ligt: L links, R rechts |
| Northing, Easting | De coördinaten |
| Ontwerphoogte | Het vlak van de afgewerkte corridor daar (van ontgravingslijn tot ontgravingslijn), anders het ontwerpprofiel op de as |
| Terreinhoogte | Het bestaande oppervlak daar, of de eigen hoogte van het meetpunt |
| Ontgraving/ophoging | C wanneer het terrein boven het ontwerp ligt (naar beneden afgraven), F wanneer het eronder ligt (ophogen), op de honderdste |

Een uitzetpunt zonder ontwerphoogte (buiten de corridor, of op een tracé zonder ontwerphoogte buiten de as) heeft geen ontgraving of ophoging; het dialoogvenster meldt hoeveel het er zijn.

## Het rapport opslaan

- **CSV**: een titelregel, dan de kolommen hierboven, plus de ontgraving of ophoging als getekend getal (terrein min ontwerp) voor spreadsheets en dataverzamelaars.
- **PDF**: tabelpagina's op het papierformaat dat u kiest, één uitzetpunt per rij, ontgravingen in oranje en ophogingen in groen, met de titelstrook van de andere bladen.

:::note
Uitzetpunten worden berekend uit het ontwerp in het project. Controleer ze aan de hand van de goedgekeurde tekeningen voordat er iets wordt gebouwd.
:::
