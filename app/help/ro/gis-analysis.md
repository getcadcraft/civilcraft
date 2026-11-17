---
title: Analiza straturilor GIS
summary: Zonă tampon, suprapunere (intersectare, reuniune, ștergere, dizolvare), îmbinare spațială, selectare după atribut și măsurarea straturilor GIS dintr-un proiect, fiecare ca strat nou pe care îl puteți anula.
keywords: gis, analiză, analysis, zonă tampon, buffer, suprapunere, overlay, intersectare, reuniune, ștergere, decupare, dizolvare, îmbinare spațială, join, selectare după atribut, interogare, where, expresie, statistici, arie, lungime, perimetru, măsurare, parcele, servitute, retragere, shapefile, geopackage, tabel de atribute
from: a6b2d3f9
---

Odată ce un proiect are straturi GIS (vezi [Importul datelor GIS](topic:gis-import)), butonul **Analiză** din grupul GIS (tastat `GISANALYSIS`, `ANALYZE` sau `BUFFER`) deschide un panou cu cinci file. Panoul rămâne deschis lângă plan, astfel încât ce selectați este desenat pe plan în timp ce lucrați.

Fiecare instrument care creează ceva **adaugă un strat nou** și lasă straturile din care citește exact neschimbate. Fiecare este un singur pas de anulare: {{ui:Anulare}} din panou (sau Ctrl+Z) elimină stratul nou. Exportați rezultatul ca orice strat cu [Exportul datelor as-built pentru GIS](topic:gis-export), în format shapefile, GeoJSON sau GeoPackage.

Tabelul complet al unui strat, cu sortare, editare și calculator de câmpuri, este descris în [Lucrul cu tabelul de atribute al unui strat](topic:gis-table). Colorarea după un câmp este descrisă în [Stilizarea unui strat după un atribut](topic:gis-symbology).

Totul se lucrează în plan, în unitățile proiectului (picioare sau metri). Un proiect este întotdeauna într-un sistem proiectat sau local, deci o distanță de 50 înseamnă 50 de picioare sau 50 de metri, niciodată grade. Cotele (z) nu sunt păstrate în rezultate.

## Zonă tampon

Desenează o zonă la o distanță fixată în jurul fiecărui element, ca strat nou de poligoane. Punctele devin cercuri, liniile devin coridoare cu capete rotunjite, poligoanele se extind. O distanță **negativă** micșorează poligoanele (un pătrat de 100 pe 100 micșorat cu 5 devine 90 pe 90; micșorat cu 60 nu mai rămâne nimic, iar panoul o spune). Luați distanța dintr-un câmp numeric pentru a da fiecărui element propria distanță, sau bifați **Îmbinare toate zonele tampon într-o singură formă** pentru a le dizolva.

Părțile rotunjite sunt piese drepte desenate în interiorul curbei adevărate, deci o zonă tampon este puțin mai mică decât cercul exact: cam 0.6 % în arie la setarea normală, 0.16 % la Fin. Folosiți Fin pentru orice veți măsura.

## Suprapunere

| Instrument | Ce obțineți |
|---|---|
| Intersectare | Piesele în care stratul de intrare întâlnește poligoanele de suprapunere, fiecare cu câmpurile ambelor straturi. Liniile și punctele sunt decupate după poligoane. |
| Reuniune | Ambele straturi de poligoane tăiate de-a lungul marginilor fiecăruia: piesele comune au câmpurile ambelor straturi, restul au câmpurile unui singur strat (câmpurile celuilalt sunt goale). |
| Ștergere | Poligoanele de intrare din care au fost scoase poligoanele de suprapunere. Câmpurile rămân ale intrării. Un element șters complet este lăsat afară (panoul le numără). |
| Dizolvare | Îmbină poligoanele care se ating sau se suprapun, toate sau câte o formă pentru fiecare valoare a unui câmp. Adaugă `COUNT` și `AREA`. |

Un nume de câmp pe care îl au ambele straturi este păstrat pentru primul strat, iar cel al celui de-al doilea strat se scrie cu `_2`. Elementele dintr-un strat nu ar trebui să se suprapună între ele: unde se suprapun, o Reuniune le numără în ambele.

## Îmbinare

O îmbinare spațială copiază atribute dintr-un strat **sursă** pe fiecare element **țintă** pe care îl întâlnește și dă un strat nou cu formele țintei. Alegeți când se întâlnesc: se ating sau se suprapun, ținta se află în interiorul unui poligon sursă, ținta conține elementul sursă, cel mai apropiat element sursă (cu o limită opțională) sau orice element sursă aflat la o distanță dată.

Când mai multe elemente sursă se potrivesc, luați atributele primului (cel mai apropiat, la îmbinările după cel mai apropiat și după distanță; se adaugă `DISTANCE`), sau **le numărați și le adunați câmpurile numerice**: `COUNT`, și `SUM_`, `MEAN_`, `MIN_`, `MAX_` pentru fiecare câmp numeric. Debifați **Păstrare elemente țintă care nu au găsit nicio potrivire** pentru a le lăsa afară. Câmpurile îmbinate sunt goale acolo unde nu s-a potrivit nimic, iar panoul numără cele nepotrivite.

## Selectare

Scrieți o întrebare despre atribute sau formă, apăsați **Selectare**, iar elementele sunt desenate pe plan, cu numărul lor, un tabel și totalul ariei, lungimii sau numărului. Apoi faceți din ele un strat propriu, faceți zoom pe ele sau anulați selecția.

| Puteți scrie | Exemplu |
|---|---|
| Un câmp după nume; folosiți "ghilimele" sau [paranteze pătrate] dacă numele are spații | `VALUE`, `"Lot Number"` |
| Numere, 'text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (textul nu ține cont de majuscule; în `like`, `%` înseamnă orice șir și `_` o literă) | `Notes contains 'corner'` |
| `is null`, `is not null` (o valoare goală contează ca null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` și paranteze | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valori de formă `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

O întrebare incompletă sau care numește un câmp pe care stratul nu îl are este refuzată, cu o propoziție care spune unde.

## Măsurare

Afișează totalul ariei și al perimetrului, lungimii sau numărului stratului și **adaugă câmpuri** la el: `AREA` și `PERIMETER` pentru poligoane, `LENGTH` pentru linii (lungimea pe plan), `X` și `Y` pentru puncte. Un câmp care există deja nu este niciodată suprascris: cel nou se numește `AREA_2`. Aceasta este un singur pas de anulare. **Statistici** dă numărul, suma, media, minimul și maximul unui câmp numeric, opțional pentru fiecare valoare a unui alt câmp.

:::note
Calculele din spatele acestor instrumente sunt verificate manual în test (`node bin/test-civilcraft-gisanalysis.mjs`): de exemplu, parcele de 100 pe 100 sub o zonă de 100 pe 80 se intersectează în 3,000 plus 3,000, iar o linie de lungime 100, cu zonă tampon de 10, are 2,000 plus un cerc.
:::
