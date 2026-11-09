---
title: Wat is nuut in 0.8 en 0.8.1
summary: CivilCraft 0.8 voeg Laat dit reën ('n stormlopie oor jou gelykmaking), 'n grondbalanseerder, 'n beste-roete-soeker, opvangdamme, vordering uit opmetings, 'n adres-na-terrein-invoerder wat die terrein in die projek hou, en vensters vir gronde en hellings, aansluitings en merkings, opmetingsaanpassing, oop groewe, radioskakels en spoorwissels by. 0.8.1 regstel hoe DWG-lêers gelees word.
keywords: wat is nuut, what's new, vrystellingsnotas, veranderingslog, veranderinge, 0.8, 0.8.1, weergawe, nuwe funksies, reën, storm, plasvorming, oorloop, grondwerk, balans, uitgrawing en opvulling, vervoer, beste roete, laagste koste, belyning, opvangdam, uitlaat, leegloop, vrybord, vordering, opmeting, drone, stapel, adres na terrein, erf, grond, vloed, hellingstabiliteit, bishop, versakking, aansluiting, merkings, borde, sigafstand, aanpassing, kleinstekwadrate, traverse, oop groef, blokmodel, radioskakel, fresnel, spoorwissel, kruising, tale, probleme, live, dwg
from: b0932cf0
---

Dit is wat in CivilCraft 0.8 (2026-11-01) en 0.8.1 (2026-11-02) verander het, in vergelyking met 0.7. Die groot nuwe dele is gereedskap wat jou gelykmaking en jou terrein toets (reën, grondwerk, roetes, damme, vordering) en ses berekeningsvensters vir grond, paaie, opmeting, myne, skakels en spoor.

## Nuut

### Toets jou gelykmaking

- **Laat dit reën.** {{ui:Make it rain…}} (onder {{ui:Surface}}) laat 'n storm op die gelykgemaakte grond val. Jy kyk hoe die water van die platforms afloop, in die lae hoeke bymekaarkom en oor die damme loop wat te klein is. Die lopie is geanimeer en gee die volumes, die piekuitvloei en 'n CSV van elke dam. Die standaardsel is growwe sodat 'n eerste kyk vinnig is; 'n fynner sel is stadiger. Damme wat oorloop, verskyn ook in die Probleme-paneel.
- **Grondbalanseerder.** {{ui:Earthwork balancer…}} hef of verlaag 'n platform totdat uitgrawing gelyk is aan opvulling, en wys die vervoertabel tussen hulle.
- **Beste roete.** {{ui:Best route…}}: kies 'n begin en 'n einde, en CivilCraft vind die goedkoopste pad oor die terrein wat binne jou helling- en krommegrense bly, en maak dan 'n belyning daaruit.
- **Opvangdamme.** {{ui:Detention ponds…}} bereken stadium en berging uit jou grond, neem uitlaattoestelle (opening, oorlaat, V-insnit, oorloopweg), laat 'n storm deur die dam loop en kontroleer die piek wat teruggehou word, die leegloop-tyd en die vrybord.
- **Vordering uit opmetings.** {{ui:Progress from surveys…}} vergelyk drone- of skanderingsoppervlaktes van verskillende datums met die grond soos dit was en met die ontwerp: persentasie voltooi volgens volume, oor-uitgegrawe en oor-opgevulde gebiede, stapels, en wanneer die werk teen hierdie spoed klaar is (gemerk as 'n raming).

### Ken die terrein

- **Adres na terrein.** {{ui:Address to site…}} stel oop erf-, gebou-, soneringsdata, grond-, vloed- en terreindata op een terrein saam. Jy kan die terrein in die projeklêer hou: die getikte adres, elke bron met die dag waarop jy dit afgelaai het en sy lisensie, en wat teruggekom het. Maak die projek weer oop of deel dit, en die terrein is steeds daar, sonder dat iets weer afgelaai word. Jy kan dit ook as 'n terreinlêer stoor of na BimCraft stuur. Sien [Adres na terrein](topic:address-to-site).

### Grond, paaie, opmeting, myne, skakels en spoor

- **Gronde en hellings.** {{ui:Soils and slopes…}} teken die grondprofiel tussen boorgate wat jy intik. Bishop se metode soek dan die kritieke sirkel op jou grond, met 'n grondwatertafel, 'n oorlading en 'n aardbewingskoëffisiënt; versakking van 'n fondament kry konsolidasie, onmiddellike versakking en tyd.
- **Aansluitings en merkings.** {{ui:Junctions and striping…}} voeg takke saam met randafrondings (een radius per tak, of drie-middelpunt-afrondings), die sigafstand vir die ontwerpspoed, 'n toets van die sigdriehoeke, voetgangersoorgange, stopstrepe, merkings en borde met 'n bordskedule. Hulle word op die plan geteken en as 'n .dxf met benoemde lae gestoor.
- **Opmetingsaanpassing.** {{ui:Survey adjustment…}} voer 'n kleinstekwadrate-aanpassing van 'n traverse of netwerk uit: aangepaste koördinate, foutellipse, die chi-kwadraat-toets en 'n vlag op die meting wat nie pas nie. Vrye netwerke, die sluiting van 'n traverse volgens die kompasreël, en RW5-, GSI-, JobXML- of CSV-veldlêers is ingesluit, en die aangepaste punte word as CSV gestoor.
- **Oop groewe.** {{ui:Open pits…}} verander boormonsters in 'n blokmodel en die uiteindelike groef binne jou helling-hoek, met die strookverhouding, 'n tabel per bank en 'n graad- en tonnemaatkromme. Geneste groewe volgens inkomstefaktor en 'n produksieskedule met 'n verdiskonteerde kontantvloei is ook daar.
- **Radioskakels.** {{ui:Radio links…}} toets sigliyn oor jou grond met die aarde se welwing, die eerste Fresnel-sone, skakelbegroting, delingsmarge en meerpadonderbreking, en gee die masthoogte wat die pad vry sal maak. Dit doen ook veselverlies-begrotings, roetehoeveelhede en die wind op 'n toring.
- **Spoorwissels.** {{ui:Rail turnouts…}} maak 'n spoorwissel uit sy kruisstukgetal, kruisings tussen parallelle spore en 'n struktuurwydte wat deur kanting gekantel en op 'n boog verbreed word. 'n Spoorwissel kan by 'n stasie van 'n belyning geplaas word.

Sien [Gronde, aansluitings, opmetingsaanpassing, groewe, radioskakels en spoorwissels](topic:soils-roads-survey-mines-links).

## In elke program

- **Tale.** 54 tale, tien daarvan nuut. Tale behalwe Engels is masjienkonsepte totdat 'n moedertaalspreker dit lees. Hulponderwerpe is steeds meestal in Engels.
- **Werkbalkrye.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Wikkel (soos voorheen), 2 rye of 1 ry. CivilCraft se Lint wys die mees gebruikte gereedskap groot, die volgende ene klein, en die res agter die groepnaam se pyltjie.
- **Invoertoestelle.** Raakplaat, pen, 3D-muis, speletjiebeheerder en MIDI kan die programme beheer.
- **Probleme.** 'n Probleme-paneel wat in elke program waarsku, met kontroles wat reëlspakkette lees.
- **Live.** 'n Aansig van wie waar is in 'n Live-sessie.
- **Byvoegings.** 'n Lys van byvoegings, met beligtingsbyvoegings.
- **Koppel jou KI.** Enige assistent wat jy koppel, kan CivilCraft se gereedskap beheer. Dit kom met 'n nota dat eenklik-koppeling binne CadCraft Studio en die gehoste koppelaar nog nie gereed is nie. Sien [Laat 'n KI-assistent met jou terrein werk](topic:assistants).

## Reggestel in 0.8.1

- **DWG-klasseafdeling.** Dit is as die verkeerde tipe gelees (GitHub cadcraft#5). Reggestel in CivilCraft saam met CadCraft, BimCraft, ModelCraft en TakeoffCraft.
- **Taal wissel terwyl dit loop.** CadCraft Studio en die verpakte uitgawes kan tydens uitvoering van taal wissel. Vroeër was hulle net in Engels. Nog nie op elke platform getoets nie: sê vir ons as die taal nie verander nie.

## Nog nie in hierdie weergawe nie

- **Dit is berekeningshulpmiddels.** Elke resultaat in die nuwe vensters moet deur 'n ingenieur nagegaan word. Grondsterktes begin by tipiese waardes vir die grondgroep, en die venster sê so.
- **Laat dit reën.** 'n Lopie op die monsterterrein kan oor twee minute in die blaaier neem by 'n fyn sel. Dit is nagegaan teen handgevalle en 'n V-vormige opvangarea, nog nie op 'n werklike gelykgemaakte terrein nie.
- **Adres na terrein.** Dit lees oop dataleêrs wat jy bring, en is net op ons eie lêers getoets. Bome is nie 'n bron nie. Om bronne vir jou af te laai, wag op die privaatheidsbewoording.
- **Vordering uit opmetings.** Getoets net op verdigte opmetings. Vordering op blaaie en opmerkings (MarkupCraft) en skandering teen model (BimCraft) is nie gebou nie.
- **Gronde en hellings.** Net sirkelvormige oppervlaktes: geen wig- of bloksoektog en geen trekskeur nie.
- **Aansluitings.** Een radius per tak, geen vragmotor-swaaipaaie nie, en hulle gaan nog nie in die korridor in nie.
- **Veldlêers.** Die lesers is geskryf uit openbare formaatbeskrywings en op lêers wat ons gemaak het, getoets. Werklike instrumentlêers word gesoek.
- **Skakels en spoor.** Radioskakels: net vrye-ruimteverlies en meerpad (geen reëndelving of antennepatrone nie), en geen spoorstandaard nie: elke spoorgrens is 'n plekhouer, met konsepsyfers wat geen spoorwegingenieur nog nagegaan het nie.
- **Windows en macOS.** 0.8 is nie kode-geteken nie. Windows kan waarsku, en macOS vra vir regsklik en dan Maak oop.

Al die ander is in [Nog nie gebou nie](topic:not-built-yet). Vir die vroeëre vrystelling, sien [Wat is nuut in 0.7](topic:whats-new-0-7).
