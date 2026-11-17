---
title: Plantgrafika volgens skaal, jou eie simbole en 3D-plante
summary: Hoe plante in plan by elke tekenskaal en detailvlak geteken word, en hoe 'n plantrekord jou eie simbool (SVG, of 'n DXF/DWG-blok) en jou eie 3D-model (OBJ, STL of GLB) kry.
keywords: plantgrafika, plantsimbool, simbool volgens skaal, detailvlak, eenvoudige sirkel, omtrek, gedetailleerde simbool, eie simbool, blok, svg, dxf, dwg, 3D-plant, eie 3D-model, obj, stl, glb, gltf, boommodel, plante in 3D
from: 875837d9
---

## Plansimbole volgens skaal

Landskap › {{ui:Meer}} › {{ui:Plantgrafika}} stel in hoe plante in plan geteken word. **Outomaties, volgens skaal** kies een van drie vlakke uit die tekenskaal:

- **Eenvoudige sirkel** (growwer as 1:500): 'n sirkel by die plant se spreiding.
- **Omtrek met middelpunt** (van 1:500 tot 1:200): die sirkel en 'n klein middelkruis.
- **Gedetailleerde simbool** (fyner as 1:200): die rekord se eie simbool as hy een het, anders die ingeboude simbool.

Verander die twee skale met **Eenvoudig vanaf 1:** en **Omtrek vanaf 1:**, of kies een vlak vir elke skaal. Elke blaaistel in die Blaaie-dialoog het sy eie **Plantdetail in plan**, so kan 'n 1:500-terreinplan en 'n 1:100-beplantingsplan verskil. Die instellings word saam met die projek gestoor.

## Jou eie simbool

Kies 'n plant in die Plante-afdeling en druk {{ui:Eie simbool…}}. Dit lees 'n SVG, of 'n blok van 'n DXF- of DWG-tekening (as die tekening verskeie blokke het, kies jy een). Die simbool word by die plant se spreiding aangepas en op die gedetailleerde vlak geteken. Dit word in die projek bewaar, so die lêer bly by die projek.

- 'n SVG word gelees vir sy lyne, polilyne, veelhoeke, reghoeke, sirkels, ellipse en paaie. Skrifte, style, skakels en beelde daarin word nooit nagegaan nie. Transformasies word nie toegepas nie: jy word in kennis gestel as die lêer hulle het, so maak hulle eers plat in jou tekenprogram.
- Perke: 512 KB SVG en 2000 vorms. 'n Groter lêer word met die rede geweier.

## Jou eie 3D-plant

{{ui:Eie 3D-model…}} op dieselfde rekord lees 'n **OBJ**-, **STL**- of **GLB**-lêer. Stel dan in Plantgrafika **Plante in 3D** op **Elke rekord se eie model**: elke plant van daardie rekord wys jou model, geskaal na sy hoogte en spreiding. Rekords sonder 'n eie model hou die ingeboude vorms. Kies **Eenvoudige massas** vir vinnige aansigte van groot terreine.

'n GLB word net vir sy vorm gelees:

- Alles wat die model nodig het, moet binne die .glb-lêer wees. 'n Model wat na ander lêers verwys ('n afsonderlike .bin, of beelde volgens adres) word geweier: niks word afgelaai nie.
- Saamgeperste of gepakte geometrie (Draco, meshopt, gekwantiseerde posisies) word nie gelees nie. Voer uit sonder kompressie.
- Teksture en kleure in die lêer word nie gebruik nie: die model word in die plant se eie kleur geteken. Teksture word steeds nagegaan, en 'n tekstuur van meer as 4096 pixels aan 'n kant word geweier.
- Perke: 'n lêer van 32 MB, 50 000 driehoeke (tel elke kopie van 'n deel wat meer as een keer geplaas is), 64 beelde en 16 MB aan beelde.

Elke perk weier die lêer met die rede; niks wat half gelees is, word behou nie. Een {{ui:Ontdoen}}-stap gee die rekord sy simbool of model, en {{ui:Verwyder eie simbool}} of {{ui:Verwyder eie 3D-model}} haal dit weer weg.

Sien [Plantrekords](topic:plant-records) vir die rekord self, en [Bekyk die terrein in 3D](topic:site-3d).
