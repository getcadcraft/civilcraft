---
title: Ontwerp 'n tuin, van begin tot einde
summary: Die landskapargitek se tien stappe, van die opmeting tot die gepubliseerde stel, met wat die Landskapwerkruimte vir elk vandag doen en wat dit nog nie doen nie.
keywords: tutoriaal, deurloop, hoe om, landskapontwerp, tuinontwerp, begin, voorbeeld, monster, stap-vir-stap, opmeting, lynwerk, terrein, beplanting, skedule, blaaie, publiseer, een projek
from: 87900bf5
---

'n Landskapontwerp gaan rond: opmeting, skets, lynwerk, grond, gebiede, peile, beplanting, skedules, blaaie, en weer terug. Dit is die tien stappe, met wat vir elk bestaan. Waar 'n stap 'n gaping het, word dit onder **Nog nie gebou nie** aan die einde genoem, en nie in die stap versteek nie.

Jy kan saam volg op die monsterterrein, of op jou eie opmetingstekening. Met jou eie begin by stap 1.

## 1. Bring die opmeting in

{{ui:Oppervlak}} › {{ui:Lynwerk uit 'n tekening…}}, kies die opmetingstekening (DWG 2000–2018 of DXF). Kontroleer die eenhede, neem die kontoere, 3D-polilyne en grens vir die oppervlak, en die puntblokke as opmetingspunte. Die afdeling **Opmetingspeile en -kontrole** lees peile wat as teks of as 'n eienskap geskryf is en lys wat verkeerd lyk (eenhede, koördinaatstelsel, afstand van nul, plat kontoere, vreemde peile, dubbele punte) voordat jy iets byvoeg. Sien [Kontroleer 'n opmetingstekening met invoer](topic:survey-check) en [Maak 'n DWG of DXF oop as lynwerk](topic:open-dwg-dxf). Stel die koördinaatstelsel met {{ui:Koördinaatstelsel…}}.

## 2. Handskesse

'n Vel op papier, soos 'n ou opmeting of 'n gemerkte afdruk, kom in met {{ui:Skandeer…}} (Begin vanaf 'n skandeersel): dit word op skaal of op bekende koördinate onder die plan geplaas, en kan oorgetrek word tot lynwerk. ModelCraft lees 'n foto van 'n handskets (Lêer › Voer 'n sketsfoto in…). CivilCraft self het geen hulpmiddel vir 'n handskets nie: plaas die vel onder die plan en teken daaroor.

## 3. Skets na lynwerk

Teken kenlyne en omlyne oor die opmeting in CivilCraft, of teken hulle in die 2D-tekening. Landskap › Meer › {{ui:Van 'n lyn}} verander 'n lyn in verharding, 'n beplante gebied, 'n muur, trappe, 'n kenlyn en meer, en hou dit gekoppel: skuif die lyn en die voorwerp volg. Sien [Voorwerpe uit lynwerk](topic:objects-from-lines). In SuperCad Studio maak jy die terrein, die tekening en die geboumodel in een projek oop: die **Landskap**-werkruimte het die gereedskap van almal, en 'n lyn wat in die 2D-tekening gekies word, kan 'n landskapvoorwerp word wat dit volg (Ctrl+K, {{ui:Landskapvoorwerp uit die gekose tekeninglyn}}).

## 4. Die voorgestelde grond

Maak {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Landskapwerkruimte}} oop. Bou die voorgestelde grond met {{ui:Platform}}, {{ui:Wal}}, {{ui:Grasgreppel}} en graderingsgebiede met puntpeile en kontoere; die plaveisel, voetpaaie, mure, hellingbane en trappe wat jy byvoeg, gradeer in dieselfde voorgestelde oppervlak. Die bestaande grond verander nooit nie. {{ui:Peile}} › {{ui:Grondwysigers…}} lys alles wat die grond vorm in een volgorde, met afgrawing en opvulling vir elk. Sien [Gradering](topic:landscape-grading) en [Grondwysigers en lewendige peile](topic:ground-modifiers).

## 5. Plaveisel en beplante gebiede

{{ui:Verhardings}} › {{ui:Plaveisel}}, {{ui:Voetpad}}, {{ui:Muur}}, {{ui:Kerb}}, {{ui:Hellingbaan}} en {{ui:Trappe}}. {{ui:Gebiede}} teken 'n grasperk, plantbed, weiveld of grondbedekking met sy opbouing; dit knip homself rondom plaveisel, mure en trappe. {{ui:Plantbed}} vul 'n gebied teen die plante se afstand, uit 'n mengsel van plante. Sien [Verhardings](topic:hardscape), [Beplante gebiede](topic:planted-areas) en [Beplanting](topic:planting).

## 6. Peile, hellings en aansluitings

Onder **Graderingskontroles** merk **Hellinganalise** en **Vloeipyltjies en plasvorming**. As water teen 'n terras plas, voeg 'n {{ui:Grasgreppel}} rondom dit by. Eienskappe vertel jou hoeveel stygers die trappe nodig het en of hulle pas, en waar 'n pad steiler is as sy limiet. Die Probleme-paneel lys waar voorwerpe sleg saamkom: 'n muur wat te hoog is, 'n bed bo die plaveisel, trappe wat hul rusplek mis. {{ui:Puntpeil}} en {{ui:Hellingpyltjie}} benoem die grond en werk homself by.

## 7. Beplanting

In **Plante**, soek die plantlys (enkele honderd spesies, of jou eie lys), kies een, en {{ui:Plant}}, {{ui:Plantbed}} of {{ui:Heining}}. Stel die plant se grootte en etikette vanaf Meer. Meer › {{ui:Plantlys}} wysig jou eie rekords: kultivars, verskafde groottes, digtheid, spesifikasie-notas. Elke rekord kan jou eie simbool en 3D-model dra (OBJ, STL of GLB), en Meer › {{ui:Plantgrafika}} teken plante eenvoudiger op growwer skale. Sien [Die plantlys](topic:plant-list), [Plantrekords](topic:plant-records) en [Plantgrafika](topic:plant-graphics).

## 8. Hoeveelhede en skedules

Meer › {{ui:Werkblaaie}}: die plant- en verhardingskedules, en jou eie, bly gekoppel aan die voorwerpe; stoor hulle as CSV of XLSX of sit hulle op die blaaie (sien [Werkblaaie](topic:worksheets)). Meer › {{ui:Plantskedule…}} stuur die tellings na TakeoffCraft. Die verhardingshoeveelhede is in die plaveisel-, muur- en trap-Eienskappe. Besproeiing het sy eie materiaallys: {{ui:Besproeiing}} › **Kontroleer die stelsel…**. Sien [Besproeiing](topic:irrigation).

## 9. Tekeninge en blaaie

Meer › {{ui:Landskapblaaie…}}: beplantings-, graderings- en besproeiingsplanne, met details. {{ui:Peile}} › {{ui:Snitlyn}} teken snitte deur die grond, mure, opbouings, trappe en plante. Sien [Landskapblaaie](topic:landscape-sheets) en [Landskapsnitte en die publikasiestel](topic:landscape-sections).

## 10. Publiseer

{{ui:Publikasiestel (.zip)}} in die blaaie-dialoog maak een PDF met 'n blaaislys en 'n DWG per blad. Meer › {{ui:Voer landskap-IFC uit}} gee BimCraft die plante en die verhardings. Stoor die projek: alles is in die een lêer.

## Verander een ding: die trap

Die punt daarvan om alles in een projek te hou, is dat 'n verandering deurwerk. Probeer dit met 'n trapvlug tussen twee terrasse:

1. Teken die vlug se lyn as 'n kenlyn (of 'n lyn in die tekening), en kies dan Landskap › Meer › {{ui:Van 'n lyn}} › {{ui:Trappe}}. Merk in die trappe se Eienskappe **Vorm die grond**, en stel die onder- en boonpeile op die twee terrasse.
2. Teken 'n beplante bed langs en onder die vlug met {{ui:Gebiede}}, en plaveisel op die terrasse. Die bed knip homself rondom die trappe en die plaveisel, en die plantskedule tel net wat geplant is.
3. Verhoog die boonpeil van die vlug in Eienskappe. Die voorgestelde grond, die puntpeile, die hellingpyltjies en die afgrawing en opvulling verander dadelik. As die vlug nie meer by die boonste terras aansluit nie, sê die Probleme-paneel met hoeveel.
4. Skuif die vlug se lyn. Die trappe volg hul lyn in dieselfde ontdoen-stap; die bed knip weer en word weer getel, en die werkblaaie en skedules wys die nuwe getalle.
5. Druk Ctrl+Z een keer: die lyn, die trappe, die grond en die bed gaan saam terug.

Sien [Grondwysigers en lewendige peile](topic:ground-modifiers), [Beplante gebiede](topic:planted-areas) en [Werkblaaie](topic:worksheets).

## Nog nie gebou nie

Dit word gevra en is nie in hierdie weergawe nie:

- Mure wat die grond vorm (hulle rapporteer waar hulle dit ontmoet, en hul bo kan dit volg).
- Wysiging van jou eie Biblioteek-plantlys in die program (wysig die projek se lys en stoor dit as 'n plantlêer).
- Teksture en kleure van jou eie GLB-plantmodelle (die vorm word gelees; die plant se kleur word gebruik).

Sien [Die Landskapwerkruimte](topic:landscape) vir elke stuk gereedskap.
