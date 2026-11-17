---
title: Grondwerkvolumes
summary: Lees afgrawing-, ophoging- en netto-volumes tussen die bestaande grond en die voorgestelde oppervlak, per platform en korridor en in totaal, en verstaan die roostermetode daaragter.
keywords: volumes, grondwerk, afgrawing, ophoging, netto, afgrawing en ophoging, hoeveelhede, roostermetode, oppervlakvergelyking, volumeoppervlak, kubieke yard, kubieke meter
from: 299d7bc7
---

Sodra 'n platform of korridor sonder probleme gelykgemaak word, vergelyk CivilCraft die voorgestelde oppervlak met die bestaande grond en rapporteer afgrawing en ophoging. Die getalle werk met elke verandering by.

## Waar om hulle te lees

- **Grondwerk** in die regterpaneel met niks gekies nie (die **Projek**-aansig), wanneer daar ten minste een platform of een korridor is.
- **Grondwerk** in die regterpaneel wanneer 'n platform gekies is (dieselfde totale vir die hele projek).
- Die reël onder 'n korridor se instellings, met daardie korridor se eie afgrawing en ophoging.

Die **Grondwerk**-blok wys:

- **Afgrawing**, **Ophoging** en **Netto** (met "ophoging" of "afgrawing" daarna, wat ook al groter is)
- 'n reël per item wanneer daar meer as een is, byvoorbeeld "Platform 1: afgrawing 120.4 cu yd, ophoging 310.2 cu yd"
- die metodereël: "Roostermetode: bestaande grond en die gegradeerde oppervlak gemonster elke 0.5 ft binne die dagligtelyne (92,891 selle). Geen swel of krimp toegepas nie."

Volumes is in kubieke yard in 'n voetprojek en kubieke meter in 'n meterprojek.

## Stuur hulle na TakeoffCraft

Om die grondwerk te prys, kies {{ui:Stuur na TakeoffCraft}} onderaan die **Grondwerk**-blok. CivilCraft stoor 'n hoeveelhedelêer (`<site>.quantities.json`) met twee hoeveelhede: afgrawing en ophoging, in kubieke yard (voetprojek) of kubieke meter (meterprojek), dieselfde getalle as die blok, tot die honderdste. Maak dit in TakeoffCraft oop met **Maak hoeveelheidsopname oop**, of sleep dit daarheen: hulle word twee items wat jy kan prys ([Afgrawing en ophoging vanaf CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Stuur weer na 'n verandering en maak die nuwe lêer oop: dieselfde items neem die nuwe getalle.

Net die totale word gestuur, sodat niks twee keer getel word nie; die lêer se nota lys elke platform en korridor se eie afgrawing en ophoging.

## Hoe hulle uitgewerk word

CivilCraft gebruik die **roostermetode**:

1. 'n Rooster van vierkantige selle word oor die gebied binne elke dagligtelyn gelê.
2. In die middelpunt van elke sel word albei oppervlaktes gemonster.
3. Elke sel tel as 'n prisma: die verskil in hoogte maal die sel se oppervlakte. Waar die voorgestelde oppervlak laer is, is dit afgrawing; hoër, is dit ophoging.
4. Die selle word bymekaar getel.

Die selgrootte word vir jou gekies sodat die reghoek rondom die gegradeerde gebiede ongeveer 250,000 selle hou, afgerond na 'n netjiese waarde (1, 2 of 5 keer 'n mag van tien). Jy kan dit self nog nie stel nie. Die metodereël sê vir jou die grootte en die aantal selle. Kleiner selle is meer akkuraat langs die rande; op hele selle tussen plat vlakke is die resultaat presies.

## Dinge om te weet

- Net die gebied binne dagligtelyne word getel. Grond buite hulle bly onveranderd.
- 'n Platform of korridor met 'n probleem word nie ingegradeer nie en voeg niks by nie. As die blok sê "Nog geen volumes nie: 'n platform moet sonder probleme gelykgemaak word.", soek na 'n rooi kassie daarbo.
- Waar items oorvleuel, het die latere een die vroeëre binne sy dagligtelyn vervang, en die oorvleueling word een keer getel.
- Geen swel- of krimpfaktor word toegepas nie. Vermenigvuldig self die resultate as jy in-situ-, los of verdigte volumes nodig het.
- Bogrondafskraping, plaveisel- en subgrondtye, en TIN-tot-TIN-prismavolumes is nog nie beskikbaar nie.

## Kontroleer 'n resultaat

- Skakel {{ui:Voorgestelde (gegradeer)}} aan onder **Vertoning** en kyk na die kontoerlyne binne die dagligtelyne.
- Beweeg die wyser oor die gegradeerde gebied: die statusbalk wys **Grond** en **Gegradeer**. Die verskil is die afgrawings- of ophogingsdiepte op daardie plek.
- Vir 'n korridor wys die lengteprofielaansig se aflesing afgrawing of ophoging op die middellyn by elke stasie.
