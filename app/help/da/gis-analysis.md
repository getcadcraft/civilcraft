---
title: Analysér GIS-lag
summary: Buffer, overlay (skæring, forening, slet, opløs), rumlig join, vælg efter attribut og mål GIS-lagene i et projekt, hvert som et nyt lag du kan fortryde.
keywords: gis, analyse, buffer, overlay, skæring, forening, slet, udklip, opløs, rumlig join, join, vælg efter attribut, forespørgsel, where, udtryk, statistik, areal, længde, omkreds, mål, matrikler, servitut, byggelinje, shapefile, geopackage, attributtabel
from: a6b2d3f9
---

Når et projekt har GIS-lag (se [Importér GIS-data](topic:gis-import)), åbner knappen **Analysér** i GIS-gruppen (skrevet `GISANALYSIS`, `ANALYZE` eller `BUFFER`) et panel med fem faner. Det bliver åbent ved siden af planen, så det du vælger tegnes på planen, mens du arbejder.

Hvert værktøj der laver noget **tilføjer et nyt lag** og lader de lag, det læste, være præcis som de var. Hvert er ét fortrydelsestrin: {{ui:Fortryd}} i panelet (eller Ctrl+Z) fjerner det nye lag. Eksportér resultatet ligesom ethvert lag med [Eksportér as-built-data til GIS](topic:gis-export) som shapefile, GeoJSON eller GeoPackage.

Den fulde tabel for et lag, med sortering, redigering og en feltberegner, findes i [Arbejd med et lags attributtabel](topic:gis-table); farvning efter et felt står i [Stil et lag efter en attribut](topic:gis-symbology).

Alt arbejdes i planen, i projektets enheder (fod eller meter). Et projekt er altid i et projiceret eller lokalt system, så en afstand på 50 betyder 50 fod eller 50 meter, aldrig grader. Højder (z) bevares ikke i resultaterne.

## Buffer

Tegner en zone med en fast afstand omkring hvert objekt, som et nyt polygonlag. Punkter bliver til cirkler, linjer bliver til korridorer med afrundede ender, og polygoner vokser. En **negativ** afstand skrumper polygoner (en 100 gange 100 firkant skrumpet med 5 er 90 gange 90; skrumpet med 60 er der intet tilbage, og panelet siger det). Tag afstanden fra et talfelt for at give hvert objekt sin egen, eller sæt flueben i **Flet alle buffere til én form** for at opløse dem.

De afrundede dele er rette stykker, tegnet inde i den sande kurve, så en buffer er en hårsbredde mindre end den nøjagtige cirkel: ca. 0.6 % i areal ved den normale indstilling, 0.16 % ved Fin. Brug Fin til alt, du vil måle.

## Overlay

| Værktøj | Det du får |
|---|---|
| Skæring | Stykkerne hvor inputlaget møder overlay-polygonerne, hver med felterne fra begge. Linjer og punkter klippes til polygonerne. |
| Forening | Begge polygonlag skåret langs hinandens kanter: fælles stykker har felter fra begge lag, resten har felter fra ét lag (det andet lags felter er tomme). |
| Slet | Inputpolygonerne med overlay-polygonerne fjernet. Felterne bliver hos input. Et objekt slettet helt er udeladt (panelet tæller dem). |
| Opløs | Slår polygoner sammen, der rører eller overlapper, alle sammen eller én form for hver værdi i et felt. Tilføjer `COUNT` og `AREA`. |

Et feltnavn som begge lag har, beholdes for det første lag, og det andet lags navn skrives med `_2`. Objekter inde i ét lag bør ikke overlappe hinanden: hvor de gør, tæller en Forening overlappet i begge.

## Join

En rumlig join kopierer attributter fra et **kilde**-lag over på hvert **mål**-objekt, det møder, og giver et nyt lag med målets former. Vælg hvornår de møder: rører eller overlapper, målet ligger inde i et kildepolygon, målet indeholder kildeobjektet, det nærmeste kildeobjekt (med en valgfri grænse), eller et hvilket som helst kildeobjekt inden for en afstand.

Når flere kildeobjekter matcher, tager du den første attributter (den nærmeste ved nærmeste- og afstandsjoins; `DISTANCE` tilføjes), eller **tæller dem og summerer deres talfelter**: `COUNT` og `SUM_`, `MEAN_`, `MIN_`, `MAX_` for hvert talfelt. Fjern fluebenet i **Behold målobjekter, der ikke fandt noget match** for at udelade dem. Joinede felter er tomme, hvor intet matchede, og panelet tæller de umatchede.

## Vælg

Skriv et spørgsmål om attributterne eller formen, tryk **Vælg**, og objekterne tegnes på planen med deres antal, en tabel og det samlede areal, længde eller tal. Derefter kan du gøre dem til et lag for sig selv, zoome til dem eller rydde valget.

| Du kan skrive | Eksempel |
|---|---|
| Et felt ved navn; brug "anførselstegn" eller [firkantede parenteser], hvis navnet har mellemrum | `VALUE`, `"Lot Number"` |
| Tal, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst ignorerer store og små bogstaver; i `like` er `%` en vilkårlig række og `_` ét bogstav) | `Notes contains 'corner'` |
| `is null`, `is not null` (en tom værdi tæller som null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` og parenteser | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Formværdier `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Et spørgsmål der er ufuldstændigt, eller som nævner et felt laget ikke har, afvises med en sætning, der siger hvor.

## Mål

Viser det samlede areal og den samlede omkreds, længde eller det samlede antal for laget, og **tilføjer felter** til det: `AREA` og `PERIMETER` for polygoner, `LENGTH` for linjer (længden i planen), `X` og `Y` for punkter. Et felt der allerede findes, bliver aldrig overskrevet: det nye hedder `AREA_2`. Dette er ét fortrydelsestrin. **Statistik** giver antal, sum, gennemsnit, minimum og maksimum for et talfelt, eventuelt for hver værdi i et andet felt.

:::note
Kontrollerne bag disse værktøjer udføres i hånden i testen (`node bin/test-civilcraft-gisanalysis.mjs`): for eksempel skærer parceller på 100 gange 100 under en zone på 100 gange 80 hinanden i 3,000 plus 3,000, og en 100 lang linje buffret med 10 er 2,000 plus en cirkel.
:::
