---
title: Arbejd med et lags attributtabel
summary: Se hvert objekt i et GIS-lag som en tabel, sortér og filtrér den, vælg rækker og objekter samtidig, ret værdier, tilføj felter, beregn nye værdier og gem tabellen som CSV.
keywords: attributtabel, tabel, felter, kolonner, rækker, sortér, filtrér, udtryk, vælg, redigér, feltberegner, beregn, tilføj felt, omdøb felt, fjern felt, csv, eksport, gis, shapefile, geopackage, symbologi
from: fd9d6c11
---

Åbn et lags tabel fra dets **tre prikker**-menu i listen over GIS-lag ({{ui:Attributtabel…}}), fra Overflade › {{ui:Mere}} › {{ui:Attributtabel}}, eller ved at skrive `ATTRIBUTES`, `ATTTABLE` eller `TABLE`. Tabellen åbnes ved siden af planen og forbliver åben, mens du arbejder. Kun de rækker, du kan se, tegnes, så et lag med tusindvis af objekter åbnes og scroller hurtigt.

## Sortér, filtrér og vælg

- **Sortér:** klik på en kolonneoverskrift. Et andet klik vender den om, et tredje sætter filens rækkefølge tilbage. Tomme værdier bliver altid nederst. Sortering ændrer kun det, du ser, aldrig laget.
- **Filtrér:** skriv i filterfeltet. Et udtryk som `AREA > 500 and USE = 'Res'` beholder de rækker, hvor det er sandt (de samme ord som fanen Vælg i [Analysér GIS-lag](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Alt, der ikke er et udtryk, såsom `oak maple`, leder efter de ord i hver kolonne.
- **Vælg rækker:** klik på en række. Ctrl+klik tilføjer eller fjerner én, Shift+klik vælger et stykke, og {{ui:Vælg viste rækker}} tager hver række, der består filteret. De valgte objekter tegnes på planen, og et klik på et objekt på planen vælger dets række her.
- Med rækker valgt kan du {{ui:Zoom}} til dem, lave et **lag ud fra valget** og læse det samlede areal eller den samlede længde i statuslinjen.

## Ret værdier

Dobbeltklik på en celle (eller flyt til den med piletasterne og tryk Enter), skriv den nye værdi og tryk Enter. Esc lader den stå, som den var. En værdi skal passe til kolonnen: tal som tal, datoer som `YYYY-MM-DD`, ja/nej som yes, no, true eller false. En værdi, der ikke passer, afvises med en sætning, og intet ændres. En tom boks gør værdien tom. Hver redigering er ét fortrydelsestrin: {{ui:Fortryd}} og {{ui:Gentag}} står nederst i tabellen, og Ctrl+Z virker på planen.

## Felter

Under **Felter** kan du tilføje et felt (tekst, tal, dato eller ja/nej), omdøbe et eller fjerne et. Et nyt felt starter tomt. En omdøbning følger med: lagets mærkningsfelt og [stil efter attribut](topic:gis-symbology) flyttes til det nye navn, og fjerner du et felt, fjernes den mærkning og stil, der brugte det. Hver af dem er ét fortrydelsestrin, der gendanner alt.

## Feltberegner

Skriver en værdi i hver række (eller kun i de valgte rækker) ud fra rækkens andre felter, dens geometri og nogle få funktioner. Vælg et eksisterende felt eller **Et nyt felt…**, og giv det et navn og en type. Intet køres som kode: udtrykket læses af en lille parser med en fast liste af funktioner.

| Gruppe | Ord |
|---|---|
| Tal | `+ - * /`, parenteser, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst skrives i 'enkelte anførselstegn'; et feltnavn med mellemrum skrives i "dobbelte anførselstegn" eller [firkantede parenteser]) |
| Valg | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datoer | `year month day` af en `YYYY-MM-DD`-værdi |
| Geometri | `$area $perimeter $length $x $y $vertices`, i projektets enheder |

Et resultat, der ikke kan gemmes i feltets type (tekst i et talfelt), efterlades tomt og tælles i beskeden. Division med nul giver en tom værdi. For eksempel skriver `round($area / 43560, 2)` acres ud fra kvadratfod.

## Eksport

{{ui:Eksportér CSV}} gemmer de rækker, du ser (efter filteret og sorteringen), som en UTF-8 CSV-fil med feltnavnene på første linje. En tekst, der starter med `=`, `+`, `-` eller `@`, får et foranstillet apostrof, så et regneark ikke kører den som en formel. For at gemme selve laget, brug [Eksportér as-built-data til GIS](topic:gis-export).

## Begrænsninger

Tabellen viser laget i én sorteringsrækkefølge og ét filter ad gangen. Rækker kan ikke tilføjes eller slettes her (lav i stedet et nyt lag ud fra et valg), geometri redigeres ikke, og et felts type kan ikke ændres, når det er oprettet.
