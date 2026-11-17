---
title: Terrein uit kontoerlyne
summary: Maak die grondoppervlak uit 'n kontoerkaart: kies die lynlae, sê waar elke lyn se hoogte vandaan kom, kontroleer vir kruisings en duplikate, en bou. Kontoerlyne word breeklyne, met plat driehoeke op rante en valleie reggemaak. 'n Kaart wat uit 'n prent of PDF getrek is, kan geskaal en geplaas word deur twee bekende punte.
keywords: kontoere, kontoerlyne, terrein uit kontoere, oppervlak uit kontoere, topografiese kaart, opmetingskaart, geen koördinate, breeklyne, plat driehoeke, rant, vallei, heuwelkruin, kruisende kontoere, duplikaat-kontoere, kontoerinterval, skaal van 'n kaart, twee punte, plaas 'n kaart, DXF, DWG, shapefile
from: e6161653
---

'n Landmeter stuur soms 'n kontoerkaart: lyne met hoogtes, maar geen punte nie. CivilCraft bou die bestaande grond uit daardie lyne.

## Bring die kontoere in

Maak die kaart oop as lynwerk: 'n DXF- of DWG-tekening, 'n shapefile of GeoJSON (**GIS** › {{ui:Voer in}}, of laat die lêer op die plan val). Die lyne kom in as **kaartlae**. Onder **Oppervlak** › {{ui:Meer}}, kies {{ui:Terrein uit kontoerlyne}}.

## Sê waar elke hoogte vandaan kom

Merk die lae wat kontoere bevat, kies dan **Hoogte vandaan**:

- {{ui:Die lyne se eie hoogtes}}: 'n lyn waarvan al die hoekpunte dieselfde hoogte het ('n 3D-poliylyn, of 'n poliylyn met 'n hoogte). 'n Lyn op 0 is plan-lynwerk en het geen peil nie.
- 'n **Getalveld** van die laag (byvoorbeeld ELEV), wanneer die kaart met een gekom het.
- {{ui:'n Beginhoogte en 'n interval, in die volgorde waarin die lyne gelys word}}: vir lyne sonder enige hoogte. Die eerste gelyste lyn kry die **Eerste lyn se hoogte**, die volgende een daardie plus die **Kontoerinterval**, en so aan. Lys die lyne van die laagste op (of herrangskik hulle in die laag).

## Kontroleer, dan bou

{{ui:Kontroleer}} lys wat verkeerd is, in woorde, voordat iets verander:

- 'n lyn met **geen hoogte** of minder as twee punte;
- 'n **duplikaat**-lyn (dieselfde vorm twee keer, selfs as dit andersom geteken is);
- twee lyne wat **kruis**, op verskillende hoogtes of op dieselfde een (ook 'n lyn wat homself kruis), met die plek;
- 'n hoogte wat **nie op die interval is nie** ('n tikfout soos 105.5 op 'n 1 m-kaart).

Merk {{ui:Laat lyne uit wat ander kruis}} om die lyn wat die meeste ander kruis te laat val (dan die volgende, totdat niks kruis nie): 'n verdwaalde lyn wat elke kontoer afsny, is die een wat gaan, nie die kontoere nie. **Vereenvoudig lyne binne** dun hoekpunte uit wat nader aan 'n reguit lyn is as daardie afstand.

{{ui:Bou die grond}} voeg die lyne by die bestaande grond as breeklyne (een ontdoen-stap), sodat die oppervlak presies deur elke kontoer gaan. Met {{ui:Maak plat driehoeke op rante, valleie en heuwels reg}} gemerk en 'n interval gegee, voeg CivilCraft ook 'n punt binne elke plat driehoek by (een waarvan al die hoeke op een kontoer lê) op die hoogte waarna die helling langs dit voortgaan, nooit meer as 'n halwe interval van die kontoer af nie. Sonder dit kom rante, valleibodems en heuwelkruine uit as plat plate. Op 'n toetsheuwel het die fout teenoor die ware oppervlak met 'n kwart gedaal; op 'n rant met 40 %.

## 'n Kaart sonder koördinate

Vir 'n kontoerkaart wat uit 'n prent of PDF getrek is, open **Skaal en plaas die lae deur twee bekende punte**. Gee twee punte op die kaart en waar hulle werklik is; die gemerkte lae word geskaal, gedraai en geskuif om te pas (een ontdoen-stap; hoogtes word nie verander nie). Dieselfde twee punte gee die skaal (in die boodskap getoon) en die rotasie.

Die oppervlak is so goed as die kaart: tussen twee kontoere is dit 'n vlak, so die werklike grond tussen hulle is nie bekend nie. Kontroleer die resultaat teen puntehoogtes voordat jy daarop staatmaak.
