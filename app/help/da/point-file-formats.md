---
title: Punktfilformater
summary: Kolonnerækkefølgerne CivilCraft læser, hvordan den finder skilletegnet og overskriftsrækken, hvilke overskriftsnavne den genkender, og hvordan rækker kontrolleres.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, punktfilformat, kolonner, overskrift, skilletegn
from: 84fab42e
---

En punktfil er ren tekst med ét punkt pr. linje. CivilCraft læser den i browseren; intet uploades.

## Kolonnerækkefølger

Bogstaverne navngiver kolonnerne fra venstre mod højre: **P** punktnummer eller -navn, **N** nord, **E** øst, **Z** kote, **D** beskrivelse.

| Rækkefølge | Kolonner | Eksempellinje |
|---|---|---|
| PNEZD | punkt, nord, øst, kote, beskrivelse | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punkt, øst, nord, kote, beskrivelse | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punkt, nord, øst, kote | `101,2080000.00,6150000.00,250.00` |
| PENZ | punkt, øst, nord, kote | `101,6150000.00,2080000.00,250.00` |
| NEZD | nord, øst, kote, beskrivelse | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | øst, nord, kote, beskrivelse | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nord, øst, kote | `2080000.00 6150000.00 250.00` |
| ENZ | øst, nord, kote | `6150000.00 2080000.00 250.00` |

Rækkefølger uden P nummererer punkterne 1, 2, 3 … i filens rækkefølge. X er øst og Y er nord.

## Skilletegn

CivilCraft kigger på de første 20 linjer og vælger det første af disse, der optræder på mindst 60 % af dem: komma, tabulator, semikolon. Ellers deler den op ved mellemrum.

- I komma-, tabulator- og semikolonfiler kan et felt i dobbelte anførselstegn indeholde skilletegnet (`"FL, NORTH"`), og `""` inde i anførselstegn er ét anførselstegn.
- I mellemrumsseparerede filer må en beskrivelse i slutningen af linjen indeholde mellemrum: alt efter den sidste koordinatkolonne er beskrivelsen.
- Linjer, der starter med `#`, `;` eller `//`, og tomme linjer springes over.
- Et byte-order mark i begyndelsen af filen ignoreres.

## Overskriftsrække

Første linje behandles som overskrift, når færre end to af dens felter er tal. Hvis alle felter i overskriften er navne, som CivilCraft genkender, kommer kolonnerækkefølgen fra den («fra overskriftsrækken»). Navne matches uden hensyn til store og små bogstaver, mellemrum, punktummer, understregninger, bindestreger og parenteser:

| Kolonne | Genkendte navne |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Hvis et overskriftsnavn ikke genkendes, eller navnene ikke danner en af de otte rækkefølger, springes overskriften over, og rækkefølgen gættes ud fra antal kolonner.

:::warning
En overskrift, der angiver både en breddegradskolonne (`lat`, `latitude`) og en længdegradskolonne (`lon`, `long`, `longitude`), læses som grader og ikke som nord og øst. Ved {{ui:Importér}} omregnes punkterne gennem projektets koordinatsystem, og et projekt uden et koordinatsystem beder dig vælge det først. Rækker uden for ±90° bredde eller ±180° længde afvises. Se [Importér GIS-data](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Gæt ud fra antal kolonner

Uden en brugbar overskrift og med **Kolonner** stadig på {{ui:Registrér}}:

- 5 eller flere kolonner: PNEZD.
- 4 kolonner: PNEZ, når den første kolonne er et helt tal i alle prøvede linjer, og den fjerde er et tal; ellers NEZD.
- 3 kolonner: NEZ.

PNEZD og PENZD kan ikke skelnes ud fra tallene. Gættet følger **Punkt-rækker** i [CivilCraft-indstillinger](topic:settings): P, N, E, Z, D i starten, eller P, E, N, Z, D (så læses fire kolonner som PENZ og tre som ENZ). Dialogen siger »gættet ud fra antal kolonner — kontrollér, at nord og øst ikke er byttet om«. Vælg den rigtige rækkefølge i **Kolonner**, hvis forhåndsvisningen ser forkert ud.

## Sådan kontrolleres rækker

- En række må udelade beskrivelsen.
- Nord og øst skal være tal. Kote må være tom (punktet beholdes, men bruges ikke i overfladen).
- Punktnummeret kan være hvilken som helst tekst (også bogstaver, fx `CP1`), men må ikke være tomt.
- Hvis et punktnummer gentages, beholdes første række, og de øvrige listes som ikke læst.
- Beskrivelser beholdes op til 200 tegn; kontroltegn bliver til mellemrum.
- Op til 200 ulæste rækker gemmes til dialogen (25 vises), og alle tælles.

## Punktgrupper

En punkts gruppe er det første ord i dets beskrivelse med store bogstaver. »GRD«, »grd shot« og »Grd« er alle gruppe GRD. Et punkt uden beskrivelse er i »(ingen beskrivelse)«. Se [Importér målepunkter](topic:import-points).

## Skrivning af punkter

CivilCraft eksporterer endnu ikke en punkttekstfil. Punkter sendes ud i LandXML (som CgPoints), i projektfilen og via GIS-{{ui:Eksportér}} som en shapefil, GeoPackage eller GeoJSON med felterne P, N, E, Z og D ([Eksportér as-built-data til GIS](topic:gis-export)). Se [Ikke lavet endnu](topic:not-built-yet).
