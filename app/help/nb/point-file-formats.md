---
title: Punktfilformater
summary: Kolonnerekkefølgene CivilCraft leser, hvordan det finner skilletegnet og overskriftsraden, hvilke overskriftsnavn det gjenkjenner, og hvordan radene kontrolleres.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, punktfilformat, kolonner, overskrift, skilletegn
from: 84fab42e
---

En punktfil er ren tekst, ett punkt per linje. CivilCraft leser den i nettleseren; ingenting lastes opp.

## Kolonnerekkefølger

Bokstavene navngir kolonnene fra venstre til høyre: **P** punktnummer eller navn, **N** nord, **E** øst, **Z** kote, **D** beskrivelse.

| Rekkefølge | Kolonner | Eksempellinje |
|---|---|---|
| PNEZD | punkt, nord, øst, kote, beskrivelse | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punkt, øst, nord, kote, beskrivelse | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punkt, nord, øst, kote | `101,2080000.00,6150000.00,250.00` |
| PENZ | punkt, øst, nord, kote | `101,6150000.00,2080000.00,250.00` |
| NEZD | nord, øst, kote, beskrivelse | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | øst, nord, kote, beskrivelse | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nord, øst, kote | `2080000.00 6150000.00 250.00` |
| ENZ | øst, nord, kote | `6150000.00 2080000.00 250.00` |

Rekkefølger uten P nummererer punktene 1, 2, 3 … i filrekkefølge. X er øst og Y er nord.

## Skilletegn

CivilCraft ser på de første 20 linjene og velger den første av disse som finnes på minst 60 % av dem: komma, tabulator, semikolon. Ellers deler den på serier av mellomrom.

- I komma-, tabulator- og semikolonfiler kan et felt i doble anførselstegn inneholde skilletegnet (`"FL, NORTH"`), og `""` inne i anførselstegn er ett anførselstegn.
- I mellomromsfiler kan en beskrivelse helt til slutt på linjen inneholde mellomrom: alt etter siste koordinatkolonne er beskrivelsen.
- Linjer som begynner med `#`, `;` eller `//`, og tomme linjer, hoppes over.
- Et byte-order mark (BOM) i starten av filen ignoreres.

## Overskriftsrad

Den første linjen behandles som overskrift når færre enn to av feltene er tall. Hvis alle feltene i overskriften er navn CivilCraft gjenkjenner, hentes kolonnerekkefølgen fra den («fra overskriftsraden»). Navn matches uavhengig av store og små bokstaver, mellomrom, punktum, understrek, bindestrek og klammer:

| Kolonne | Gjenkjente navn |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Hvis et overskriftsnavn ikke gjenkjennes, eller navnene ikke gir én av de åtte rekkefølgene, hoppes overskriften over, og rekkefølgen gjettes ut fra antall kolonner.

:::warning
En overskrift som navngir både en breddegradskolonne (`lat`, `latitude`) og en lengdegradskolonne (`lon`, `long`, `longitude`) leses som grader, ikke som nord og øst. Ved {{ui:Importer}} omregnes punktene gjennom prosjektets koordinatsystem, og et prosjekt uten et ber deg velge det først. Rader utenfor ±90° breddegrad eller ±180° lengdegrad avvises. Se [Importer GIS-data](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Gjetting fra antall kolonner

Uten en brukbar overskrift og med **Kolonner** stående på {{ui:Gjenkjenn}}:

- 5 eller flere kolonner: PNEZD.
- 4 kolonner: PNEZ når første kolonne er et heltall på hver prøvd linje og den fjerde er et tall; ellers NEZD.
- 3 kolonner: NEZ.

PNEZD og PENZD kan ikke skilles fra tallene. Gjetningen følger **Punktrader** i [CivilCraft-innstillinger](topic:settings): P, N, E, Z, D først på linjen, eller P, E, N, Z, D (da leses fire kolonner som PENZ og tre som ENZ). Dialogen sier «gjettet ut fra antall kolonner – kontroller at nord og øst ikke er byttet». Velg riktig rekkefølge i **Kolonner** hvis forhåndsvisningen ser feil ut.

## Hvordan rader kontrolleres

- En rad kan utelate beskrivelsen.
- Nord og øst må være tall. Kote kan være tom (punktet beholdes, men brukes ikke i flaten).
- Punktnummeret kan være hvilken tekst som helst (også bokstaver, for eksempel `CP1`), men det kan ikke være tomt.
- Hvis et punktnummer gjentas, beholdes den første raden, og de andre listes som ikke lest.
- Beskrivelser beholdes opp til 200 tegn; kontrolltegn blir mellomrom.
- Inntil 200 uleste rader beholdes for dialogen (25 vises), og alle telles.

## Punktgrupper

Et punkts gruppe er første ord i beskrivelsen, skrevet med store bokstaver. «GRD», «grd shot» og «Grd» er alle gruppe GRD. Et punkt uten beskrivelse er i «(ingen beskrivelse)». Se [Importer oppmålingspunkter](topic:import-points).

## Skrive punkter

CivilCraft eksporterer ikke en punkttekstfil ennå. Punkter går ut i LandXML (som CgPoints), i prosjektfilen og gjennom GIS-{{ui:Eksporter}} som en shapefil, GeoPackage eller GeoJSON med felt P, N, E, Z og D ([Eksporter data som bygget for GIS](topic:gis-export)). Se [Ikke bygget ennå](topic:not-built-yet).
