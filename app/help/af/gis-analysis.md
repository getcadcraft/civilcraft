---
title: Analiseer GIS-lae
summary: Buffer, oorlegging (snyl, unie, uitvee, smelt saam), ruimtelike koppeling, kies volgens eienskap en meet die GIS-lae in 'n projek, elk as 'n nuwe laag wat jy ongedaan kan maak.
keywords: gis, analise, buffer, oorlegging, snyl, unie, uitvee, knip, smelt saam, ruimtelike koppeling, koppel, kies volgens eienskap, navraag, waar, uitdrukking, statistiek, oppervlakte, lengte, omtrek, meet, erwe, serwituut, terugsprong, shapefile, geopackage, eienskapstabel
from: a6b2d3f9
---

Sodra 'n projek GIS-lae het (sien [Voer GIS-data in](topic:gis-import)), open die **{{ui:Analiseer}}**-knoppie in die GIS-groep (getik as `GISANALYSIS`, `ANALYZE` of `BUFFER`) 'n paneel met vyf oortjies. Dit bly oop langs die plan, sodat wat jy kies op die plan geteken word terwyl jy werk.

Elke gereedskap wat iets maak, **voeg 'n nuwe laag by** en laat die lae wat dit gelees het presies soos hulle was. Elk is een ontdoen-stap: {{ui:Ontdoen}} in die paneel (of Ctrl+Z) verwyder die nuwe laag. Voer die resultaat uit soos enige laag met [Voer as-gebou-data vir GIS uit](topic:gis-export) as 'n shapefile, GeoJSON of GeoPackage.

Die volledige tabel van 'n laag, met sortering, redigering en 'n veldberekenaar, staan in [Werk met 'n laag se eienskapstabel](topic:gis-table); kleur volgens 'n veld staan in [Styl 'n laag volgens 'n eienskap](topic:gis-symbology).

Alles word in die plan gewerk, in die projek se eenhede (voet of meter). 'n Projek is altyd in 'n geprojekteerde of plaaslike stelsel, so 'n afstand van 50 beteken 50 voet of 50 meter, nooit grade nie. Hoogtes (z) word nie in die resultate behou nie.

## Buffer

Teken 'n sone van 'n vaste afstand rondom elke kenmerk, as 'n nuwe poligoonlaag. Punte word sirkels, lyne word korridors met afgeronde punte, poligone word groter. 'n **Negatiewe** afstand maak poligone kleiner ('n vierkant van 100 by 100 wat met 5 verklein word, is 90 by 90; verklein met 60 bly niks oor nie, en die paneel sê so). Neem die afstand uit 'n getalveld om elke kenmerk sy eie afstand te gee, of merk **Voeg al die buffers in een vorm saam** aan om hulle saam te smelt.

Die afgeronde dele is reguit stukke wat binne die ware kromme getrek word, so 'n buffer is 'n hare kleiner as die presiese sirkel: ongeveer 0.6 % in oppervlakte by die normale instelling, 0.16 % by Fyn. Gebruik Fyn vir alles wat jy gaan meet.

## Oorlegging

| Gereedskap | Wat jy kry |
|---|---|
| Snyl | Die stukke waar die invoerlaag die oorleggingspoligone ontmoet, elk met die velde van albei. Lyne en punte word tot die poligone geknip. |
| Unie | Albei poligoonlae word langs mekaar se rante gesny: gedeelde stukke dra albei lae se velde, die res dra een laag se velde (die ander se velde is leeg). |
| Uitvee | Die invoerpoligone met die oorleggingspoligone weggeneem. Velde bly by die invoer. 'n Kenmerk wat heeltemal uitgevee word, word weggelaat (die paneel tel hulle). |
| Smelt saam | Smelt poligone wat raak of oorvleuel, almal of een vorm vir elke waarde van 'n veld saam. Voeg `COUNT` en `AREA` by. |

'n Veldnaam wat albei lae het, word vir die eerste laag behou, en die tweede laag s'n word met `_2` geskryf. Kenmerke binne een laag hoort nie oor mekaar te oorvleuel nie: waar hulle wel doen, tel 'n Unie die oorvleueling in albei.

## Koppel

'n Ruimtelike koppeling kopieer eienskappe van 'n **bron**laag op elke **teiken**kenmerk wat dit ontmoet, en gee 'n nuwe laag met die teiken se vorms. Kies wanneer hulle ontmoet: raak of oorvleuel, die teiken lê binne 'n bronpoligoon, die teiken hou die bronkenmerk, die naaste bronkenmerk (met 'n opsionele limiet), of enige bronkenmerk binne 'n afstand.

Wanneer verskeie bronkenmerke pas, neem jy die eerste een se eienskappe (die naaste, vir naaste- en afstandkoppelings; `DISTANCE` word bygevoeg), of **tel hulle en tel hul getalvelde op**: `COUNT`, en `SUM_`, `MEAN_`, `MIN_`, `MAX_` vir elke getalveld. Ontmerk **Hou teikenkenmerke wat geen pasmaat gevind het nie** om dié weg te laat. Gekoppelde velde is leeg waar niks gepas het nie, en die paneel tel die ongepaste.

## Kies

Tik 'n vraag oor die eienskappe of die vorm, druk **Kies**, en die kenmerke word op die plan geteken met hul telling, 'n tabel en die totale oppervlakte, lengte of getal. Maak dan daarvan 'n eie laag, zoem daarna of maak die keuse leeg.

| Jy kan skryf | Voorbeeld |
|---|---|
| 'n Veld by naam; gebruik "aanhalingstekens" of [hakies" as die naam spasies het | `VALUE`, `"Lot Number"` |
| Getalle, 'teks', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (teks ignoreer hoofletters; in `like` is `%` enige reeks en `_` een letter) | `Notes contains 'corner'` |
| `is null`, `is not null` ('n leë waarde tel as null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` en hakies | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vormwaardes `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

'n Vraag wat onvolledig is of 'n veld noem wat die laag nie het nie, word geweier met 'n sin wat sê waar.

## Meet

Wys die totale oppervlakte en omtrek, lengte of getal van die laag, en **voeg velde** daarby: `AREA` en `PERIMETER` vir poligone, `LENGTH` vir lyne (die lengte op die plan), `X` en `Y` vir punte. 'n Veld wat reeds bestaan, word nooit oorskryf nie: die nuwe een heet `AREA_2`. Dit is een ontdoen-stap. **Statistiek** gee die telling, som, gemiddelde, minimum en maksimum van 'n getalveld, opsioneel vir elke waarde van 'n ander veld.

:::note
Die toetse agter hierdie gereedskap word met die hand in die toets gewerk (`node bin/test-civilcraft-gisanalysis.mjs`): byvoorbeeld erwe van 100 by 100 onder 'n sone van 100 by 80 snyl in 3,000 plus 3,000, en 'n lyn van 100 lank wat met 10 gebuffer word, is 2,000 plus 'n sirkel.
:::
