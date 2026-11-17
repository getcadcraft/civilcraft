---
title: Arbeid med et layers attributttabell
summary: Se hvert objekt i et GIS-layer som en tabell, sorter og filtrer den, velg rader og objekter samtidig, rett verdier, legg til felt, beregn nye verdier og lagre tabellen som CSV.
keywords: attributttabell, tabell, felt, kolonner, rader, sorter, filter, uttrykk, velg, rediger, feltkalkulator, beregn, legg til felt, gi nytt navn til felt, fjern felt, csv, eksporter, gis, shapefile, geopackage, symbologi
from: fd9d6c11
---

Åpne et layers tabell fra dets **tre prikker**-meny i GIS-layerlisten ({{ui:Attributttabell…}}), fra Terrengmodell › Mer › {{ui:Attributttabell}}, eller ved å skrive `ATTRIBUTES`, `ATTTABLE` eller `TABLE`. Tabellen åpnes ved siden av planen og blir åpen mens du arbeider. Bare radene du ser, tegnes, så et layer med tusenvis av objekter åpnes og ruller raskt.

## Sorter, filtrer og velg

- **Sorter:** klikk på en kolonnetittel. Et nytt klikk reverserer den, og et tredje setter filens rekkefølge tilbake. Tomme verdier blir alltid nederst. Sortering endrer bare det du ser, aldri layeret.
- **Filtrer:** skriv i filterboksen. Et uttrykk som `AREA > 500 and USE = 'Res'` beholder radene der det er sant (de samme ordene som fanen Velg i [Analyser GIS-layere](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Alt som ikke er et uttrykk, for eksempel `oak maple`, leter etter disse ordene i hver kolonne.
- **Velg rader:** klikk en rad. Ctrl+klikk legger til eller fjerner én, Shift+klikk velger et område, og {{ui:Velg viste rader}} tar alle rader som består filteret. De valgte objektene tegnes på planen, og et klikk på et objekt på planen velger raden her.
- Med rader valgt kan du {{ui:Zoom}} til dem, lage et layer av utvalget, og lese totalt areal eller lengde i statuslinjen.

## Rett verdier

Dobbeltklikk en celle (eller flytt dit med piltastene og trykk Enter), skriv den nye verdien og trykk Enter. Esc lar den være som den var. En verdi må passe kolonnen: tall som tall, datoer som `YYYY-MM-DD`, ja/nei som ja, nei, true eller false. En verdi som ikke passer, avvises med en setning, og ingenting endres. En tom boks gjør verdien tom. Hver redigering er ett steg som kan angres: {{ui:Angre}} og {{ui:Gjør om}} står nederst i tabellen, og Ctrl+Z virker på planen.

## Felt

Under **Felt** kan du legge til et felt (tekst, tall, dato eller ja/nei), gi et nytt navn til et, eller fjerne et. Et nytt felt starter tomt. Ved omdøping følger alt med: etikettfeltet og [stilen etter attributt](topic:gis-symbology) for layeret flyttes til det nye navnet, og fjerner du et felt, forsvinner etiketten og stilen som brukte det. Hver er ett steg som kan angres, og som henter alt tilbake.

## Feltkalkulator

Skriver en verdi inn i hver rad (eller bare de valgte radene) fra radens andre felt, geometrien og noen få funksjoner. Velg et eksisterende felt eller **Et nytt felt…**, og gi det et navn og en type. Ingenting kjøres som kode: uttrykket leses av en liten tolker med en fast liste av funksjoner.

| Gruppe | Ord |
|---|---|
| Tall | `+ - * /`, parenteser, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst står i 'enkle anførselstegn'; et feltnavn med mellomrom står i "doble anførselstegn" eller [firkantede klammer]) |
| Velge | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datoer | `year month day` av en `YYYY-MM-DD`-verdi |
| Geometri | `$area $perimeter $length $x $y $vertices`, i prosjektets enheter |

Et resultat som ikke kan lagres i feltets type (tekst i et tallfelt), blir tomt og telles i meldingen. Deling på null gir en tom verdi. For eksempel skriver `round($area / 43560, 2)` acres fra kvadratfot.

## Eksporter

{{ui:Eksporter CSV}} lagrer radene du ser (etter filter og sortering), som en UTF-8 CSV-fil med feltnavnene på første linje. En tekst som begynner med `=`, `+`, `-` eller `@`, får et ledende apostrof, så et regneark ikke kjører den som formel. Vil du lagre selve layeret, bruk [Eksporter as-built-data for GIS](topic:gis-export).

## Begrensninger

Tabellen viser layeret i én sorteringsrekkefølge og ett filter om gangen. Rader kan ikke legges til eller slettes her (lag heller et nytt layer fra et utvalg), geometrien redigeres ikke, og et felts type kan ikke endres etter at det er laget.
