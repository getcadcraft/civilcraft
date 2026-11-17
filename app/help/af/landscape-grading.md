---
title: Gelykmaking vir landskap
summary: Plataforms, wale, grasgreppels en vrye gelykmaking met puntelevasies en kontoere wat jy sleep, sny en vul lewendig, hellingsanalise, vloeipyltjies en plasvorming, alles in CivilCraft se voorgestelde oppervlak.
keywords: keermuur, keermure, vertikale kant, muur in plaas van helling, helling per kant, grondwal, gelykmaking, landskapgelykmaking, platform, terras, plataform, wal, heuweltjie, grasgreppel, puntelevasie, puntpeil, kontoere, kontoer wysig, sny en vul, grondwerk, hellingsanalise, toeganklikheid, steil hellings, vloeipyltjies, dreinering, plasvorming, plasse
from: e1559eb9
---

Alles hier word in die **voorgestelde oppervlak** gelykgemaak met dieselfde gelykmaking as plataforms en korridors. Die **bestaande grond** word nooit verander nie, en Grondwerk tel alles. Die {{ui:Grondbewerking}}-kieslys is in die Landskap-groep.

## Plataforms

{{ui:Grondbewerking}} › {{ui:Platform}}, klik dan die hoeke en druk {{key:Enter}}. Die platform begin op die gemiddelde grondhoogte daaronder; tik 'n **Hoogte** in om dit te stel, of maak dit leeg om weer die grond te volg. 'n **Val** in % en **Val na** in grade (0 = oos, 90 = noord) kantel dit. Sy kante word uitgegradeer na die grond by die **Snithelling** en **Vulhelling** (horisontaal tot 1).

## Hellings per kant en keermure

Onder {{ui:Kante en keermure}} in die Eienskappe van 'n plataform, 'n wal of 'n berm, kan elke kant sy eie manier van gelykmaak kry. Kant 1 loop van die eerste hoek wat jy geklik het na die tweede, kant 2 van die tweede na die derde, en so aan.

- **Alle kante**: **Skuins** gebruik die snit- en vulhellings hierbo op elke kant; **Vertikaal: keermure** sit 'n muur op elke kant.
- Per kant: **Hellings bo**, **Eie hellings** (tik 'n snit- en vulhelling vir daardie kant in) of **Vertikaal (keermuur)**.
- Tik 'n helling in as `3` of `3:1` (horisontaal tot 1 vertikaal), `33%` of `18.4°`; dit word as H:1 gewys. Die plataform se eie **Snithelling** en **Vulhelling** neem dieselfde.
- 'n Vertikale kant het geen verhoging nie: 'n keermuur loop langs die rand, van die plataform af na die bestaande grond (in vul) of van die grond af na die plataform (in sny). **Muurdikte** (0.3 m of 1 ft om mee te begin) is hoeveel die grond vanaf die plataformrand na die bestaande grond trap. Sny- en vulvolumes laat die verhoging weg wat daardie kant nie meer het nie.
- Waar 'n muur 'n skuins kant ontmoet, draai die helling om die einde van die muur; twee mure ontmoet in 'n skuinssnit.
- Onder die velde: die mure se lengte, blootgestelde voorvlak (hoogte × lengte), hoogste en gemiddelde hoogte.

Die plan teken elke muur se buitevlak met kort merkers daaroor en sy hoogte aan albei eindes en by sy hoogste (op die keermure-laag, wat ook in DXF en DWG gaan). Die 3D-aansig wys die mure as soliede (Wys › Keermure), en GLB-, OBJ- en USD-uitvoere sluit hulle in. Snitte oor die rand wys die trap.

**Waarskuwings** (in Eienskappe, en in die Probleme-paneel): 'n muur hoër as **Waarsku bo 'n muurhoogte van** (1.0 m of 3.3 ft om mee te begin) "kan 'n ingenieursmuur of 'n permit nodig hê; kontroleer plaaslike reëls", en, wanneer jy die **Steilste helling wat die grond hou** intik, enige kant waarvan die snit- of vulhelling steiler is as dit. Hulle is waarskuwings: die gelykmaking bou steeds. Elke verandering is een stap vir {{key:Mod+Z}}.

## Wale

{{ui:Grondbewerking}} › {{ui:Wal}}: 'n heuwel waarvan die bokant sy **Hoogte** bo die gemiddelde grond daaronder is, met sy kante uitgegradeer.

## Grasgreppels

{{ui:Grondbewerking}} › {{ui:Grasgreppel}}, klik dan langs die grasgreppel **die manier waarop water loop** en druk {{key:Enter}}. Stel sy **Diepte**, **Bodemwydte** (0 vir 'n V) en **Kanthelling**. Sonder 'n **Val** volg sy bodem die grond, sy diepte daaronder, en loop nooit opdraand nie; tik 'n val in om 'n gelyke een vanaf sy begin te gee.

## Puntelevasies en kontoere

1. {{ui:Grondbewerking}} › {{ui:Gelykmakingsgebied}}: klik die omtrek van die area wat jy wil vorm.
2. {{ui:Grondbewerking}} › {{ui:Puntelevasie}}: klik binne die area. Tik sy hoogte in Eienskappe in, of gebruik die ▲ ▼-knoppies.
3. {{ui:Grondbewerking}} › {{ui:Wysig 'n kontoer}}: klik 'n kontoer binne die area om dit te neem as 'n lyn wat jy kan hervorm.

Kies 'n punt of 'n kontoer en **sleep** dit (of sy punte) op die plan: die oppervlak volg wanneer jy los, een ontdoenstap. Binne die area word die grond herbou vanaf sy rand (waar dit by die bestaande grond ontmoet), die puntelevasies en die gewysigde kontoere.

## Sny en vul, lewendig

Elke gelykmakingsvoorwerp se Eienskappe wys sy **Sny** en **Vul** en dié van die hele terrein, deur die rastermetode wat Grondwerk gebruik, soos jy dit verander. Probleme (van die oppervlak af, 'n omtrek wat homself kruis) word daar gelys.

## Gelykmakingskontroles

In die **Gelykmakingskontroles**-afdeling aan die linkerkant:

- **Hellingsanalise** kleur die oppervlak volgens helling: tot die sagte perk, tussenin, en steiler as die steil perk (5 % en 33.3 % om mee te begin: die gewone 1:20 vir toeganklike roetes en 1:3 vir maai). Die legende sê hoeveel van die area in elke een val. Die steil areas word ook op blaaie gedruk.
- **Vloeipyltjies en plasvorming** teken watter rigting water loop en merk elke plek waar dit sal plas, met sy diepte; die afdeling sê hoeveel plekke, die diepste en hoeveel water hulle hou.

Die kontroles lees die voorgestelde oppervlak wanneer iets gelykgemaak is, anders die bestaande grond.
