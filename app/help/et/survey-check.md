---
title: Kontrolli mõõdistusjoonist importimisel
summary: Loe tekstina või ploki atribuutidena kirjutatud kõrgusmärgid mõõdistuspunktidena ning kontrolli DWG- või DXF-faili vigaseid ühikuid, puuduvat koordinaatsüsteemi, nullpunktist kaugel asuvat joonist, lamedaid kontuure, veidraid kõrgusmärke ja topelt punkte enne maapinna ehitamist.
keywords: mõõdistuse kontroll, importimise kontroll, mõõdistuskõrgused, punktkõrgused, tekstkõrgused, kõrgused tekstina, atribuudid, ühikud, koordinaatsüsteem, nullpunktist kaugel, kontuurid nullil, kõrvalekalded, topelt punktid, probleemid, maastikuarhitekt, mõõdistusjoonis
from: d46acd24
---

Mõõdistusjoonis võib välja näha õige, aga olla maapinna jaoks vale: selle ühikud võivad olla oletatud, kontuurid võivad lamedalt asuda kõrgusel 0 või kõrgusmärgid võivad olla kirjutatud tekstina, mis ei ole üldse geomeetria. Dialoogi {{ui:Joonestik}} jaotis **Mõõdistuskõrgused ja kontroll** (vt [Ava DWG või DXF joonestikuna](topic:open-dwg-dxf)) loeb need kõrgusmärgid ja ütleb, mis näib vale, enne kui midagi lisatakse.

## Tekstina või atribuutidena kirjutatud kõrgusmärgid

Paljud mõõdistusjoonised annavad punktkõrguse väikese tekstina risti kõrval, näiteks `104.37` või `EL 104.37`, või punktiploki atribuudina. Need ei ole jooned, seetõttu joonestiku lugeja neid ei võta. Jaotis loetleb, mitu neid leiti, ja laseb need võtta **mõõdistuspunktidena**:

1. Märgi **Võta … kõrgusmärki mõõdistuspunktidena**. Need on algselt märkimata, sest mitte iga number joonisel ei ole kõrgus.
2. Tekst loetakse, kui see on üksi kõrgusmärk: arv koos murdosaga (`104.37`, `+104,37`, `-3.50`) või arv pärast `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` või `LEVEL`, millele võib järgneda `m`, `ft` või `'`. Üksi täisarv (`12`) loetakse kinnistu- või lehenumbriks, mitte kõrgusmärgiks; tekst nagu `GATE 3` või kuupäev ei loeta kunagi. Teksti vormindamiskoode ei arvestata.
3. Ploki atribuutide puhul vali **Ploki atribuut, mis hoiab kõrgust**. CivilCraft leiab ise sildi nimega ELEV, Z, LEVEL, RL või sarnase; kui joonis kasutab oma silti, vali loendist teine. Valik jäetakse selle failinime jaoks sellesse arvutisse meelde, nii et faili uuesti avamisel algab sama sildiga. Valitud silt võtab kõrgusmärgiks ka täisarvud.
4. Klõpsa {{ui:Lisa}}. Punktid nummerdatakse projekti kõrgeima numbri järel, iga punkt kirjeldatakse oma kihi (või ploki) järgi ning kõrgused teisendatakse projekti ühikutesse nagu ülejäänud joonis. Kõik see on üks samm: {{key:Mod+Z}} eemaldab punktid.

Tekst asub oma sisestuspunktis (või joondamispunktis, kui sellel on see). Plokkide sees olevat teksti ei loeta ja joonist ei muudeta kunagi.

## Kontroll

Kontroll käib selle kallal, mida oled importimas, ja loetleb leitu, üks rida iga probleemiliigi kohta:

| Teade | Mida see tähendab |
|---|---|
| **Ühikud määramata** | Joonis ei ütle, mis ühikutes ta on, seega loetakse selle arvud projekti ühikutena. Kontrolli ühte teadaolevat kaugust. |
| **Ühikud teisendatud** | Joonise ühikud erinevad projekti omadest ja neid skaleeritakse (märkus, mitte viga). |
| **Andmed ulatuvad … km** või **… m** | Ulatus on suurem kui 200 km või väiksem kui pool meetrit, mis tavaliselt tähendab valet ühikut (millimeetrid loetud meetriteks või vastupidi). |
| **Koordinaatsüsteem puudub** | Projektil seda pole. See on hoiatus, kui andmed asuvad nullist kaugel, nagu riigi tasandkoordinaadid või rahvuslik ruudustik. Vt [Koordinaatsüsteemid](topic:coordinate-systems). |
| **Kaugel nullpunktist** | Andmed asuvad nullist üle 100 km kaugusel. Nullist kaugel kaotavad 3D-vaated ja eksportid täpsuse ja hakkavad värisema. |
| **Kontuurikiht … ei sisalda kõrgust** | Kiht, mis on nimetatud nagu kontuurid (TOPO, CONT, CNTR, CONTOUR), sisaldab jooni kõrgusel 0, nii et neist ehitatud maapind oleks lame. |
| **Kõrgusmärgid täpselt 0** | Mõned kõrgusmärgid on 0, kuigi tüüpiline kõrgusmärk on sellest kaugel: tõenäoliselt puuduvad kõrgused. |
| **Kõrgusmärgid teistest kaugel** | Mõned kõrgusmärgid asuvad teistest kaugel (leitud kõigi kõrgusmärkide keskmise järgi, seega ei märgita järsku ala suure ulatusega), või on üle 9,000 m või alla -11,000 m. |
| **Punktid teise punkti peal** | Kaks punkti samas kohas samal või erineval kõrgusmärgil. |

Pärast {{ui:Lisa}} klõpsamist lähevad samad read jaotisse **Probleemid**, üks iga liigi kohta koos failinimega, et saaksid nende juurde hiljem tagasi tulla. Kontroll hindab joonist; see ei muuda selles midagi ega takista joonise kasutamist.

:::tip
Kui kontroll ütleb, et kontuurid on lamedad kõrgusel 0 ja on tekstina kirjutatud kõrgusmärke, võta kõrgusmärgid mõõdistuspunktidena: need kannavad sageli tegelikke kõrgusi, mida kontuurjoontel puudub.
:::

## Mida ei kontrollita

Kontroll ei võrdle joonist teise mõõdistusega ja ei suuda öelda, millises koordinaatsüsteemis joonis on: see ütleb ainult, et ühtegi ei ole määratud.
