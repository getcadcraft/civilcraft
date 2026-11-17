---
title: Grond- en plaaslike koördinate
summary: Werk in grond- (oppervlak-) koördinate wat uit die rooster geskaal word deur 'n gekombineerde skaalfaktor wat jy tik of by 'n punt bereken, of in 'n aangenome terreinrooster wat aan die stelsel gekoppel is deur twee kontrolepunte.
keywords: grondkoördinate, oppervlakkoördinate, rooster na grond, gekombineerde skaalfaktor, csf, gekombineerde faktor, roosterfaktor, hoogtefaktor, seevlakfaktor, konvergensie, afbeeldingshoek, skaalfaktor, aangenome koördinate, plaaslike koördinate, terreinrooster, 5000 5000, kontrolepunte, lokalisering, kalibrasie, twee punt, sluitfout
from: 3d7453de
---

Staatsvlak- en UTM-koördinate is **rooster**-koördinate: 'n kaartprojeksie rek of krimp afstande 'n bietjie (tiene dele per miljoen), en hoe hoër die terrein, hoe meer verskil 'n gemete grondafstand van die roosterafstand. Baie opmetings lewer dus **grond**-koördinate, geskaal sodat planafstande gelyk is aan afstande op die grond gemeet, of 'n **aangenome** terreinrooster (5000, 5000 by 'n kontrolepunt). CivilCraft hou jou getalle soos hulle is en teken op hoe hulle met die rooster verband hou, so breedte- en lengtegrade, GIS-lêers en kaartlae kom steeds op die regte plek uit.

Maak {{ui:Koördinate}} in die {{ui:GIS}}-groep oop, kies (of hou) die stelsel, en kies dan onder **Rooster-, grond- of plaaslike koördinate**:

| Keuse | Jou koördinate is | Hoe hulle met die rooster verband hou |
|---|---|---|
| {{ui:Rooster}} | Die stelsel se eie (die begin) | Dieselfde getalle |
| {{ui:Grond}} | Geskaal na grondafstande | rooster = basis + gekombineerde faktor × (grond − basis) |
| {{ui:Plaaslik}} | 'n Aangenome terreinrooster | Verskuif, gedraai en geskaal na die rooster deur twee kontrolepunte |

Wat jy ook kies, word met die projek gestoor en is een ontdoen-stap; niks beweeg nie.

## Grondkoördinate

1. Kies {{ui:Grond}}.
2. Tik die **Gekombineerde skaalfaktor** uit die opmeting (byvoorbeeld `0.99987`), of bereken dit:
   1. Onder **Bereken die faktor by 'n punt** begin die punt in die middel van die projek. Kies {{ui:Kies 'n punt op die plan}} en klik die plek ('n klik naby 'n opmetingspunt neem daardie punt), of tik E en N.
   2. Die hoogte kom van die oppervlak daar; tik 'n ander een as jy dit nodig het.
   3. Kies {{ui:Bereken}}. CivilCraft wys:
      - **Roosterskaalfaktor k**: hoeveel die kaartprojeksie afstande daar rek.
      - **Hoogtefaktor**: hoeveel korter afstande by die ellipsoïde is as op daardie hoogte.
      - **Gekombineerde faktor** = k × hoogtefaktor: roosterafstand = grondafstand × hierdie.
      - **Konvergensie**: die hoek van roosternoord na ware noord daar (geodetiese asimut = roosterasimut + konvergensie).
   4. Kies die {{ui:Gebruik}}-knoppie onder die getalle om die gekombineerde faktor in die kassie te sit.
3. Stel die **Basispunt**, waar grond- en roosterkoördinate dieselfde is. Dit begin by 0, 0: die meeste jurisdiksies wat grondkoördinate publiseer, skaal om die oorsprong, sodat grondkoördinate herkenbaar naby roosterkoördinate bly. Sommige opmetings skaal om die projek se kontrolepunt: gebruik wat die opmeting sê.
4. Kies {{ui:Pas toe}}.

:::warning
Die hoogte word geneem as hoogte bo die ellipsoïde. CivilCraft het geen geoïed-model nie, so waar die geoïed 30 m (100 ft) onder of bo die ellipsoïde is, is die hoogtefaktor ongeveer 5 ppm af. Wanneer die opmeting sy gekombineerde faktor noem, tik daardie een.
:::

## Plaaslike (aangenome) koördinate

1. Kies {{ui:Plaaslik}}.
2. Vir **Kontrolepunt 1**, tik die opmetingspunt se nommer (of kies {{ui:Kies}} en klik dit op die plan). Sy plaaslike koördinate wys langs dit.
3. Tik sy **rooster**-E en N, of sy breedte- en lengtegrade in die derde kassie (byvoorbeeld `30.2672, -97.7431`).
4. Doen dieselfde vir **Kontrolepunt 2**, so ver van die eerste as jy kan.
5. CivilCraft wys die **Skaal** en die **Rotasie** wat gevind is, en herinner jou: **Twee punte pas altyd presies — kontroleer 'n derde.**
6. Gee 'n **Kontrolepunt** op dieselfde manier. CivilCraft wys hoe ver die passing dit van die roosterkoördinate wat jy getik het, plaas (sy sluitfout, in projekeenhede en dele per miljoen). 'n Groot sluitfout beteken 'n verkeerde punt, 'n tikfout, of koördinate in 'n ander eenheid.
7. Kies {{ui:Pas toe}}.

'n Skaal ver van 1 (buite 0.5 tot 2) word geweier: kontroleer die punte en hul eenhede.

## Wat is nagegaan

- Die skaalfaktor en konvergensie pas by PROJ (pyproj 3.7.1 met PROJ 9.5.1), die koördinaatbiblioteek wat die meeste GIS-programme gebruik, tot 1 deel in 'n miljard op meer as 300 stelsels met konforme projeksies (staatsvlak, UTM, dwars Mercator, Lambert-konforme koniese), en in die blaaier by 'n punt wat op die plan gekies is.
- Grond- en plaaslike stappe skakel heen en terug tot 1 deel in 'n miljard; twee kontrolepunte gee die skaal en rotasie terug waarmee hulle gemaak is; 'n kontrolepunt 0.05 ft af wys 'n sluitfout van 0.05 ft.
