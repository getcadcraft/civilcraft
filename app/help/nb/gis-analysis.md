---
title: Analyser GIS-layere
summary: Buffer, overlapp (skjæring, union, slett, oppløs), romlig sammenføyning, velg etter egenskap og mål GIS-layerne i et prosjekt, hver som et nytt layer du kan angre.
keywords: gis, analyse, buffer, overlapp, skjæring, union, slett, klipp, oppløs, romlig sammenføyning, sammenføy, velg etter egenskap, spørring, hvor, uttrykk, statistikk, areal, lengde, omkrets, mål, eiendommer, servitutt, byggegrense, shapefile, geopackage, attributttabell
from: a6b2d3f9
---

Når et prosjekt har GIS-layere (se [Importer GIS-data](topic:gis-import)), åpner knappen **Analyser** i GIS-gruppen (skrevet `GISANALYSIS`, `ANALYZE` eller `BUFFER`) et panel med fem faner. Det blir åpent ved siden av planen, så det du velger tegnes på planen mens du arbeider.

Hvert verktøy som lager noe, legger til et nytt layer og lar layerne det leser være akkurat som før. Hvert verktøy er ett steg som kan angres: {{ui:Angre}} i panelet (eller Ctrl+Z) fjerner det nye layeret. Eksporter resultatet som ethvert annet layer med [Eksporter as-built-data for GIS](topic:gis-export) som shapefil, GeoJSON eller GeoPackage.

Hele tabellen for et layer, med sortering, redigering og feltkalkulator, er i [Arbeid med et layers attributttabell](topic:gis-table). Fargelegging etter et felt er i [Stil et layer etter en egenskap](topic:gis-symbology).

Alt arbeides i planen, i prosjektets enheter (fot eller meter). Et prosjekt er alltid i et projisert eller lokalt system, så en avstand på 50 betyr 50 fot eller 50 meter, aldri grader. Høyder (z) tas ikke med i resultatene.

## Buffer

Tegner en sone med fast avstand rundt hvert objekt, som et nytt polygonlayer. Punkter blir sirkler, linjer blir korridorer med avrundede ender, og polygoner blir større. En **negativ** avstand krymper polygoner (et 100 x 100 kvadrat krympet med 5 blir 90 x 90; krympet med 60 er det ingenting igjen, og panelet sier det). Ta avstanden fra et tallfelt for å gi hvert objekt sin egen, eller kryss av for **Slå sammen alle buffrene til én form** for å oppløse dem.

De avrundede delene er rette stykker tegnet innenfor den sanne kurven, så en buffer er litt mindre enn den eksakte sirkelen: omtrent 0,6 % i areal ved normal innstilling, 0,16 % ved Fin. Bruk Fin for alt du skal måle.

## Overlapp

| Verktøy | Du får |
|---|---|
| Skjæring | Delene der inndatalayeret møter overlappspolygonene, hver med feltene fra begge. Linjer og punkter klippes til polygonene. |
| Union | Begge polygonlayerne kuttet langs hverandres kanter: delte deler har feltene fra begge layerene, de andre har ett layers felt (det andres felt er tomme). |
| Slett | Inndatapolygonene med overlappspolygonene tatt ut. Feltene blir hos inndata. Et objekt som slettes helt, utelates (panelet teller dem). |
| Oppløs | Slår sammen polygoner som berører eller overlapper, alle sammen eller én form for hver verdi i et felt. Legger til `COUNT` og `AREA`. |

Et feltnavn som begge layerene har, beholdes for det første layeret, og det andre layerets felt skrives med `_2`. Objekter i ett layer bør ikke overlappe hverandre: der de gjør det, teller en Union overlappet i begge.

## Romlig sammenføyning

En romlig sammenføyning kopierer attributter fra et **kilde**-layer til hvert **mål**-objekt som møter det, og gir et nytt layer med målets former. Velg når de møtes: berører eller overlapper, målet ligger inne i et kildepolygon, målet holder kildeobjektet, nærmeste kildeobjekt (med en valgfri grense), eller et hvilket som helst kildeobjekt innenfor en avstand.

Når flere kildeobjekter passer, tar du det første objektets attributter (det nærmeste, for nærmeste- og avstandssammenføyninger; `DISTANCE` legges til), eller **teller dem og summerer tallfeltene deres**: `COUNT`, og `SUM_`, `MEAN_`, `MIN_`, `MAX_` for hvert tallfelt. Fjern haken for **Behold målobjekter som ikke fikk treff** for å utelate dem. Sammenføyde felt er tomme der ingenting passet, og panelet teller de uten treff.

## Velg

Skriv et spørsmål om attributtene eller formen, trykk **Velg**, så tegnes objektene på planen med antall, en tabell og totalt areal, lengde eller tall. Deretter kan du gjøre dem til et eget layer, zoome til dem eller fjerne utvalget.

| Du kan skrive | Eksempel |
|---|---|
| Et felt med navn; bruk "anførselstegn" eller [klammer] hvis navnet har mellomrom | `VALUE`, `"Lot Number"` |
| Tall, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst skiller ikke store og små bokstaver; i `like` er `%` en vilkårlig tekst og `_` én bokstav) | `Notes contains 'corner'` |
| `is null`, `is not null` (en tom verdi regnes som null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` og parenteser | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Formverdier `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Et spørsmål som er ufullstendig eller nevner et felt layeret ikke har, avvises med en setning som sier hvor.

## Mål

Viser totalt areal og omkrets, lengde eller antall i layeret, og **legger til felt** i det: `AREA` og `PERIMETER` for polygoner, `LENGTH` for linjer (planlengden), `X` og `Y` for punkter. Et felt som finnes fra før, blir aldri overskrevet: det nye kalles `AREA_2`. Dette er ett steg som kan angres. **Statistikk** gir antall, sum, gjennomsnitt, minimum og maksimum for et tallfelt, eventuelt for hver verdi i et annet felt.

:::note
Kontrollene bak disse verktøyene er regnet ut for hånd i testen (`node bin/test-civilcraft-gisanalysis.mjs`): for eksempel gir eiendommer på 100 x 100 under en sone på 100 x 80 et snitt på 3 000 pluss 3 000, og en 100 lang linje bufret med 10 blir 2 000 pluss en sirkel.
:::
