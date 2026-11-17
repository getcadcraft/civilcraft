---
title: Planteliste
summary: Om 420 vanlige tempererte og middelhavsplanter med størrelser, hardførhet, lys og vann, søkbare på alle språk, pluss din egen liste lagret med prosjektet.
keywords: planteliste, plantedatabase, art, botanisk navn, vanlig navn, plantepalett, plantelist, hardførhetssone, csv, importer planter, eksporter planter, mine planter, trélist, buskliste, plantebibliotek
from: 7ed09e7e
---

Delen **Planter** i venstre panel lister alle planter som kan plasseres. Klikk på en for å se størrelsene, og for å gjøre den til planten som **Plante**, **Bed** og **Hekk** bruker.

## Søk og filter

Skriv i **Søk**: et hvilket som helst ord i plantens navn på et hvilket som helst språk (engelsk, spansk, portugisisk), det botaniske navnet, typen eller et ord i notatene. Alle ordene som skrives må stemme, så `quercus evergreen` finner de stedsegrønne eikene. Aksenter spiller ingen rolle.

Snevre inn listen med **Type**, **Lys**, **Vann** og **Hardførhetssone** (USDA-sonen området ligger i: en plante vises når sonen er innenfor dens område).

## Hva en plante har

| Felt | Betydning |
|---|---|
| Type | Tre, busk, hekk, gress (inkludert plen), staude, dekkevekst eller klatreplante |
| Ved modenhet | Høyde og utbredelse for planten når den er vokst opp i en hage eller langs en gate, i meter |
| Ved plantning | Størrelsen den plantes i, og beholderen |
| Avstand | Senter til senter i et bed eller langs en hekk |
| Hardførhetssone | USDA-sonene den vanligvis er hardfør i |
| Lys, vann, jord | Hva den trenger |
| Notater | Bruk og forsiktighetsregler, for eksempel giftige deler eller en plante som sprer seg |

:::note
Den innebygde listen er laget for CadCraft ut fra generell hagebrukskunnskap: typiske størrelser, avrundet. Den er ikke noen planteskoles katalog. Kontroller størrelser og hardførhet hos en lokal planteskole. De best kjente invasive plantene på Den iberiske halvøy og i store deler av det tempererte området er bevisst utelatt, og noen få som er invasive et sted, har en merknad.
:::

## Egne planter

- **Legg til i prosjektets liste** kopierer en plante inn i prosjektets egen liste, der den lagres med prosjektet. En plante i listen erstatter den innebygde med samme nøkkel, slik at størrelsene kan endres for regionen.
- **Importer en planteliste…** leser en CSV (eller en plantefil). CSV-filen trenger en kolonne med det botaniske navnet og helst type, høyde og utbredelse; kolonnenavn med egne ord fungerer (Latin, Common name, Height, Spread, Width, Zone). Komma, semikolon eller tabulatorer, og desimalkomma, leses. Tomme plantestørrelser, avstander og beholdere får fornuftige standardverdier for typen.
- **Eksporter som CSV** lagrer listen (eller, hvis den er tom, plantene søket viser) for åpning i et regneark.

En planteliste leses som enhver fil utenfra: alt den ikke kan bruke, utelates og telles.

## Planter i andre apper

Planlisten er ett bibliotek for alle CadCraft-apper: BimCraft og ModelCraft har samme liste, men deres egen **Plasser fra bibliotek** tilbyr ennå ikke planter. I dag når planter en BIM-modell via CivilCrafts landskaps-IFC (hver plante er et `IfcGeographicElement`). Se [Beplantning](topic:planting#ifc).
