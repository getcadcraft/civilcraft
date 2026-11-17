---
title: Besproeiingsontwerp
summary: 'n Berekeningshulpmiddel, nie 'n gestempelde ontwerp nie: koppe, syleidings, hoofleiding, kleppe en druppellyne op die terrein; sones wat uit die pype gevind word; drukverlies volgens Hazen–Williams, die slegste-geval-kop, vloei en druk teen die toevoer, neerslagkoerse, looptye, dekking en 'n materiaallys.
keywords: besproeiing, sproeier, sproeiers, spuit, rotor, roterende spuitkop, borrelaar, druppel, druppellyn, druppelaar, klep, sone, stasie, beheerder, hoofleiding, syleiding, aansluitpunt, watertoevoer, druk, psi, kpa, vloei, gpm, wrywingsverlies, hazen williams, neerslagkoers, looptyd, dekking, kop-tot-kop, materiaallys
from: 7d6342c1
---

:::warning
Dit is 'n berekeningshulpmiddel, nie 'n gestempelde ontwerp nie: 'n besproeiingsontwerper kontroleer elke resultaat voordat iets gebou word.
:::

## Stel die stelsel uit

1. In die **Besproeiing**-afdeling aan die linkerkant, kies die **Kop**, sy **Boog** en waar die boog begin, en die pypgroottes vir syleidings en die hoofleiding.
2. {{ui:Besproeiing}} › {{ui:Aansluitpunt}}: klik waar die watertoevoer aansluit. Stel sy **druk**, die **beskikbare vloei** en die meter- en terugvloeiverlies in Eienskappe.
3. {{ui:Besproeiing}} › {{ui:Klep}}: klik waar elke sone se klep gaan. 'n Klep begin 'n sone.
4. {{ui:Besproeiing}} › {{ui:Kop}}: klik om koppe te plaas; elke klik plaas een.
5. {{ui:Besproeiing}} › {{ui:Syleiding}}: klik vanaf 'n klep deur sy koppe en druk {{key:Enter}}. {{ui:Hoofleiding}}: vanaf die aansluitpunt na elke klep.

Pypeindes spring vas aan koppe, kleppe, die toevoer en ander pypeindes, sodat die netwerk aansluit. 'n Sone is alles wat vanaf sy klep langs syleidings bereik word; die hoofleiding dra een sone op 'n slag.

## Druppel

{{ui:Besproeiing}} › {{ui:Druppellyn}}: klik langs die lyn, en begin waar dit gevoed word ('n syleiding-einde of 'n klep). Stel die **druppelaarvloei** en **spasiëring** in Eienskappe; sy vloei is die druppelaars langs dit.

## Die toets

{{ui:Besproeiing}} › {{ui:Kontroleer die stelsel…}} lys elke sone:

| Kolom | Hoe dit bereken word |
|---|---|
| Vloei | Die koppe se vloeie (en die druppellyne s') bymekaar getel |
| By die klep | Die slegste-geval-kop se werksdruk plus die pypverlies tot daar (Hazen–Williams, die pyp se binnedeursnee, die hoogteverandering) en die verlies deur die klep |
| By die toevoer | Dieselfde plus die hoofleiding se verlies wat daardie sone dra, en die meter- en terugvloeiverlies |
| Neerslag | Die koppe se vloei oor die area wat hulle natlei by kop-tot-kop-spasiëring |
| Minute per week | Om die instelling **Water per week** toe te pas |
| Probleme | Snelheid bo die perk, 'n kop buite sy drukreeks, spuitkoppe en rotors op een klep, nie genoeg druk of vloei by die toevoer nie, koppe op geen sone nie, lusse |

Kies 'n klep om sy sone se syfers en sy slegste-geval-kop op die plan omlyn te sien. Die materiaallys tel koppe volgens soort en boog, pyp volgens grootte, kleppe, druppellyn en druppelaars, en die beheerder se stasies. {{ui:Stoor as CSV}} hou albei.

Instellings in die Besproeiing-afdeling: **Hazen–Williams C** (150 vir nuwe plastiekpyp), die **vinnigste vloei** in 'n pyp (1.5 m/s), die **verlies deur 'n klep** en **water per week**. Hulle is gemerkte standaardwaardes.

## Dekking

{{ui:Besproeiing}} › {{ui:Wys dekking}} sê hoeveel van die area die koppe droog laat, hoeveel twee of meer koppe natlei, en watter koppe nie 'n buurman bereik nie (kop-tot-kop-spasiëring).

## Koppe

Die koppe wat gelys word, is **generiese** soorte wat CadCraft uit ontwerp-neerslagkoerse geskryf het (vaste spuite, roterende spuitkoppe, rondrotors, borrelaars, mikrospuite, druppelaars), nie van enige vervaardiger se produkte nie. **Voeg koppe by uit 'n lêer…** lees jou eie koppe ('n JSON-lys met elke kop se werpafstand, vloei of neerslagkoers en drukreeks); hulle word saam met die projek gestoor. 'n Vervaardiger se gepubliseerde data word slegs ingesluit met daardie vervaardiger se opgetekende toestemming.

Onder die generiese koppe het die lys **tipiese koppe** (hul name eindig in "tipiese waardes"): spuitkopgroottes van vaste spuite, roterende spuitkoppe en rondrotors, mikrospuite, borrelaars en druppelaars, met 'n radius, 'n vloei en 'n drukreeks. CadCraft bereken hulle uit gepubliseerde wiskunde (die openingsvergelyking vir vloei, die straalwerpskaling vir radius) en nominale vloeiklasse, uit oop bronne alleen; geen vervaardiger se tabel word gekopieer nie. Kies een, en die kieser wys sy basis en lisensie. 'n Projek wat een gebruik, hou die kop en sy bron in die projeklêer. Hulle is vir beplanning: kontroleer die werklike kop se eie data voordat jy bou.
