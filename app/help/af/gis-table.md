---
title: Werk met 'n laag se eienskapstabel
summary: Sien elke kenmerk van 'n GIS-laag as 'n tabel, sorteer en filtreer dit, kies rye en kenmerke saam, herstel waardes, voeg velde by, bereken nuwe waardes en stoor die tabel as CSV.
keywords: eienskapstabel, tabel, velde, kolomme, rye, sorteer, filter, uitdrukking, kies, redigeer, veldberekenaar, bereken, veld byvoeg, veld hernoem, veld verwyder, csv, uitvoer, gis, shapefile, geopackage, simbologie
from: fd9d6c11
---

Maak 'n laag se tabel oop vanuit sy **drie kolletjies**-kieslys in die GIS-lae-lys ({{ui:Eienskapstabel…}}), vanaf Oppervlak › Meer › {{ui:Eienskapstabel}}, of deur `ATTRIBUTES`, `ATTTABLE` of `TABLE` te tik. Die tabel open langs die plan en bly oop terwyl jy werk. Slegs die rye wat jy kan sien, word geteken, so 'n laag met duisende kenmerke open en rol vinnig.

## Sorteer, filtreer en kies

- **Sorteer:** klik 'n kolomtitel. 'n Tweede klik keer dit om, 'n derde sit die lêer se volgorde terug. Leë waardes bly altyd onderaan. Sorteer verander net wat jy sien, nooit die laag nie.
- **Filtreer:** tik in die filterkassie. 'n Uitdrukking soos `AREA > 500 and USE = 'Res'` hou die rye waar dit waar is (dieselfde woorde as die Kies-oortjie van [Analiseer GIS-lae](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Enigiets wat nie 'n uitdrukking is nie, soos `oak maple`, soek daardie woorde in elke kolom.
- **Kies rye:** klik 'n ry. Ctrl+klik voeg een by of verwyder een, Shift+klik kies 'n reeks, en {{ui:Kies gewysde rye}} neem elke ry wat die filter slaag. Die gekose kenmerke word op die plan geteken, en 'n klik op 'n kenmerk op die plan kies sy ry hier.
- Met rye gekies kan jy na hulle {{ui:Zoem}}, 'n **laag uit die keuse** maak, en die totale oppervlakte of lengte in die statuslyn lees.

## Herstel waardes

Dubbelklik 'n sel (of beweeg daarheen met die pyltoetse en druk Enter), tik die nuwe waarde en druk Enter. Esc laat dit soos dit was. 'n Waarde moet by die kolom pas: getalle as getalle, datums as `YYYY-MM-DD`, ja/nee as ja, nee, true of false. 'n Waarde wat nie pas nie, word geweier met 'n sin, en niks verander nie. 'n Leë blokkie maak die waarde leeg. Elke wysiging is een ontdoen-stap: {{ui:Ontdoen}} en {{ui:Herdoen}} is onderaan die tabel, en Ctrl+Z werk op die plan.

## Velde

Onder **Velde** kan jy 'n veld byvoeg (teks, getal, datum of ja/nee), een hernoem, of een verwyder. 'n Nuwe veld begin leeg. 'n Hernoeming volg deur: die etiketveld en die [styl volgens eienskap](topic:gis-symbology) van die laag skuif na die nuwe naam, en om 'n veld te verwyder laat die etiket en styl wat dit gebruik het, val. Elk is een ontdoen-stap wat alles terugbring.

## Veldberekenaar

Skryf 'n waarde in elke ry (of net die gekose rye) uit die ry se ander velde, sy geometrie en 'n paar funksies. Kies 'n bestaande veld of **'n Nuwe veld…** en gee dit 'n naam en tipe. Niks word as kode uitgevoer nie: die uitdrukking word deur 'n klein ontleder met 'n vaste lys funksies gelees.

| Groep | Woorde |
|---|---|
| Getalle | `+ - * /`, hakies, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teks | `upper lower trim len substr(text, from, count) left right replace concat` (teks gaan in 'enkel aanhalingstekens'; 'n veldnaam met spasies gaan in "dubbele aanhalingstekens" of [vierkantige hakies]) |
| Kies | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datums | `year month day` van 'n `YYYY-MM-DD`-waarde |
| Geometrie | `$area $perimeter $length $x $y $vertices`, in die projek se eenhede |

'n Resultaat wat nie in die veld se tipe gestoor kan word nie (teks in 'n getalveld), word leeg gelaat en in die boodskap getel. Deel deur nul gee 'n leë waarde. Byvoorbeeld, `round($area / 43560, 2)` skryf akkers uit vierkante voet.

## Uitvoer

{{ui:Voer CSV uit}} stoor die rye wat jy sien (na die filter en die sortering) as 'n UTF-8 CSV-lêer met die veldnaam in die eerste reël. 'n Teks wat met `=`, `+`, `-` of `@` begin, kry 'n voorste apostrof, sodat 'n sigblad dit nie as 'n formule uitvoer nie. Om die laag self te stoor, gebruik [Voer as-gebou-data vir GIS uit](topic:gis-export).

## Perke

Die tabel wys die laag in 'n enkele sorteervolgorde en een filter op 'n slag. Rye kan hier nie bygevoeg of uitgevee word nie (maak eerder 'n nuwe laag uit 'n keuse), geometrie word nie geredigeer nie, en 'n veld se tipe kan nie verander word nadat dit gemaak is nie.
