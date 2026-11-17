---
title: Lucrul cu tabelul de atribute al unui strat
summary: Vedeți fiecare element al unui strat GIS ca tabel, sortați-l și filtrați-l, selectați rânduri și elemente împreună, corectați valori, adăugați câmpuri, calculați valori noi și salvați tabelul ca CSV.
keywords: tabel de atribute, tabel, câmpuri, coloane, rânduri, sortare, filtru, expresie, selectare, editare, calculator de câmpuri, calcul, adăugare câmp, redenumire câmp, eliminare câmp, csv, export, gis, shapefile, geopackage, simbolizare
from: fd9d6c11
---

Deschideți tabelul unui strat din meniul său cu **trei puncte** din lista straturilor GIS ({{ui:Tabel de atribute…}}), din Suprafață › Mai multe › {{ui:Tabel de atribute}}, sau tastând `ATTRIBUTES`, `ATTTABLE` sau `TABLE`. Tabelul se deschide lângă plan și rămâne deschis cât lucrați. Sunt desenate doar rândurile pe care le vedeți, astfel încât un strat cu mii de elemente se deschide și se derulează repede.

## Sortare, filtrare și selectare

- **Sortare:** faceți clic pe titlul unei coloane. Un al doilea clic o inversează, iar un al treilea pune la loc ordinea din fișier. Valorile goale rămân mereu jos. Sortarea schimbă doar ce vedeți, niciodată stratul.
- **Filtrare:** scrieți în caseta de filtru. O expresie precum `AREA > 500 and USE = 'Res'` păstrează rândurile în care este adevărată (aceleași cuvinte ca la fila Selectare din [Analiza straturilor GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Orice nu este o expresie, precum `oak maple`, caută acele cuvinte în fiecare coloană.
- **Selectarea rândurilor:** faceți clic pe un rând. Ctrl+clic adaugă sau scoate unul, Shift+clic selectează o serie, iar {{ui:Selectare rânduri afișate}} ia fiecare rând care trece de filtru. Elementele selectate sunt desenate pe plan, iar un clic pe un element de pe plan selectează rândul său aici.
- Cu rânduri selectate puteți face {{ui:Zoom}} pe ele, puteți crea un **strat din selecție** și puteți citi totalul ariei sau lungimii în linia de stare.

## Corectarea valorilor

Faceți dublu clic pe o celulă (sau mergeți la ea cu tastele săgeți și apăsați Enter), tastați valoarea nouă și apăsați Enter. Escape o lasă cum era. O valoare trebuie să se potrivească coloanei: numerele ca numere, datele ca `YYYY-MM-DD`, da/nu ca yes, no, true sau false. O valoare care nu se potrivește este refuzată cu o propoziție, iar nimic nu se schimbă. O casetă goală face valoarea goală. Fiecare editare este un pas de anulare: {{ui:Anulare}} și {{ui:Refacere}} sunt la baza tabelului, iar Ctrl+Z funcționează pe plan.

## Câmpuri

Sub **Câmpuri** puteți adăuga un câmp (text, număr, dată sau da/nu), îl puteți redenumi sau elimina. Un câmp nou începe gol. Redenumirea se propagă: câmpul etichetei și [stilul după atribut](topic:gis-symbology) al stratului trec la noul nume, iar eliminarea unui câmp șterge eticheta și stilul care îl foloseau. Fiecare este un pas de anulare care readuce totul.

## Calculatorul de câmpuri

Scrie o valoare în fiecare rând (sau doar în rândurile selectate), din celelalte câmpuri ale rândului, din geometria sa și din câteva funcții. Alegeți un câmp existent sau **Un câmp nou…** și dați-i un nume și un tip. Nimic nu este rulat ca cod: expresia este citită de un mic analizor sintactic cu o listă fixă de funcții.

| Grup | Cuvinte |
|---|---|
| Numere | `+ - * /`, paranteze, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (textul merge între 'ghilimele simple'; un nume de câmp cu spații merge între "ghilimele duble" sau [paranteze pătrate]) |
| Alegere | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Date | `year month day` dintr-o valoare `YYYY-MM-DD` |
| Geometrie | `$area $perimeter $length $x $y $vertices`, în unitățile proiectului |

Un rezultat care nu poate fi stocat în tipul câmpului (text într-un câmp numeric) este lăsat gol și numărat în mesaj. Împărțirea la zero dă o valoare goală. De exemplu, `round($area / 43560, 2)` scrie acri din picioare pătrate.

## Export

{{ui:Export CSV}} salvează rândurile pe care le vedeți (după filtru și sortare) ca fișier CSV UTF-8, cu numele câmpurilor pe prima linie. Un text care începe cu `=`, `+`, `-` sau `@` primește un apostrof în față, ca o foaie de calcul să nu îl execute ca formulă. Pentru a salva chiar stratul, folosiți [Exportul datelor as-built pentru GIS](topic:gis-export).

## Limite

Tabelul arată stratul într-o singură ordine de sortare și cu câte un filtru o dată. Rândurile nu pot fi adăugate sau șterse aici (creați în schimb un strat nou dintr-o selecție), geometria nu se editează, iar tipul unui câmp nu poate fi schimbat după ce a fost creat.
