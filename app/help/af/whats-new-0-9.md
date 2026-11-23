---
title: Wat is nuut in 0.9 (vroeër)
summary: Koridor- en terreinsjablone, vasvang en Kies-knoppies tydens tekening, GIS-ontleding met 'n eienskapstabel, skadu-, sonopbrengs-, gemak- en windstudies vir 'n terrein, 'n 3D-weergee-aansig, en die Puntwolke- en WaterCraft-byvoegings.
keywords: wat is nuut 0.9, vroeëre vrystelling, wat is nuut, 0.9, vrystellingsnotas, koridorsjablone, terreinsjablone, sjabloonredigeerder, tipiese snit, verskeie koridors, vasvang, kies, skuif, kopieer, draai, raaklyn, weergee, 3d-weergee, gis-ontleding, buffer, oorlegging, ruimtelike samevoeging, eienskapstabel, styl volgens eienskap, skaduwestudie, sonopbrengs, utci, buitelugse gemak, windstudie, openfoam, puntwolke, las, laz, watercraft, brandvloei, brandkraan, waterouderdom, chloor, vraag, nutswenke, uitleg, veranderinglys, veranderinge, 0.8, 0.8.1, weergawe, nuwe kenmerke, reën, storm, water opdam, oorloop, grondwerk, balans, afgraving en opvulling, vervoer, beste roete, laagste koste, belyning, opvangdam, uitlaat, afsakking, vryboord, vordering, opmeting, hommeltuig, stapel, adres na terrein, erf, grond, vloed, hellingstabiliteit, bishop, versakking, aansluiting, merkings, seine, sigafstand, aanpassing, kleinste kwadrate, poligoon, oop groef, bloktmodel, radioskakel, fresnel, wissel, kruisoorgang, tale, probleme, lewend, dwg
from: 4664522c
---

Dit is wat in CivilCraft 0.9 verander het, vergeleke met 0.8.1. CivilCraft 0.9 is deel van CadCraft Studio 0.9 en sy agt programme. Die groot dele is koridor- en terreinsjablone, vasvang terwyl jy teken, GIS-ontleding, studies van 'n terrein se son, sonopbrengs, gemak en wind, en twee byvoegings: Puntwolke en WaterCraft.

## Nuut

### Koridor- en terreinsjablone

- **Koridorsjablone.** Maak {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Koridorsjablone…}} oop (of tik {{cmd:TEMPLATES}}). 'n Sjabloon is 'n klein dwarssnit met komponente, afsettings, hellings, materiale en puntkodes. Hou hulle in die projek, in {{ui:My biblioteek}} of as 'n `.cctemplates.json`-lêer. Die sjabloonredigeerder wys 'n tekening op ware skaal en lys probleme terwyl jy tik.
- **Bou uit sjablone volgens stasie.** Kies 'n belyning en skakel {{ui:Bou uit sjablone volgens stasie}} in sy Eienskappe aan. Elke kant van elke streek het sy eie plaveiselbanlys en sy eie eindtoestand. {{ui:Voeg 'n koridor by}} onder {{ui:Koridors op hierdie belyning}} plaas verskeie koridors op een belyning.
- **Terreinsjablone.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Terreinsjablone…}} (of tik {{cmd:TERRAINTEMPLATES}}) lê gelaagde materiale soos bogrond of plaveisel en basis op 'n terrein, met area en volume per laag. Sien [Koridorsjablone en terreinsjablone](topic:corridor-templates).

### Tekening

- **Vasvang.** Die Belyning-, Platform-, Erf-, Massa-, Kenmerklyn-, Meet-, Grens- en Opvangarea-gereedskap vasvang aan opmetingspunte, PI's, hoeke, hoekpunte en strukture, met 'n etiket by die merker. Hou {{key:Alt}} vir 'n vrye punt.
- **Kies-knoppies, raaklyn en skuif, kopieer, draai.** Platform-, erf- en kenmerklynhoeke het getikte Oos- en Noordkassies en 'n kruisdraad-Kies-knoppie. Eienskappe het ook {{ui:Raaklyn uit twee punte}} vir belynings en {{ui:Skuif, kopieer en draai}} vir belynings, platforms, erwe en kenmerklyne. Sien [Teken met vasvang, gekose hoeke en skuif, kopieer, draai](topic:draft-with-snaps).
- **Weergee-aansig in 3D.** Die {{ui:Weergee}}-knoppie op die 3D-balk teken die land met natuurlike kleure, lug, waas en sagte skaduwees. Dit verander nie die model nie. Die {{ui:Son}}-kieslys het nou {{ui:Pas toe}}- en {{ui:Maak toe}}-knoppies. Sien [Kyk na die terrein in 3D](topic:site-3d).
- **Paneels maak een afdeling op 'n slag oop.** Die linkerpaneel en die Eienskappe-paneel maak een afdeling oop en sluit die ander, en die Landskap-lint se teëls wat verskeie gereedskap hou, is verdeelde knoppies.

### GIS-ontleding

- **Ontleed.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Ontleed}} bied buffer, oorlegging, ruimtelike samevoeging, kies volgens eienskap of vorm, en meet. Elke gereedskap maak 'n nuwe laag in een ontdoenstap.
- **Eienskapstabel.** 'n Laag se drie-kolletjie-kieslys het {{ui:Eienskapstabel…}} en {{ui:Styl volgens eienskap…}}. Sien [Ontleed GIS-lae](topic:gis-analysis) en [Werk met 'n laag se eienskapstabel](topic:gis-table).

### Die terrein: son, sonopbrengs, gemak en wind

- **Omgewingsafdeling.** Kies 'n massa: die {{ui:Omgewing}}-afdeling staan onder {{ui:Sonure}} in sy Eienskappe. Dit het 'n skaduwestudie (kaart, tabel, animasie, CSV), sonopbrengs uit 'n tipiese-jaar weerlêer (.epw) en buitelugse gemak (UTCI).
- **Wind, slegs siftings.** {{ui:Loop windstudie}} kleur die grond van sit tot ongemaklik vir elke windrigting in die weerlêer. Dit is nie bekragtig nie en die paneel sê so.
- **Voetgangerwind (OpenFOAM)-byvoeging.** Af totdat jy dit in {{ui:Instellings}} › {{ui:Byvoegings}} aanskakel. OpenFOAM is sagteware wat jy self installeer. Sien [Skadu, sonopbrengs en buitelugse gemak](topic:environment).

### Puntwolke (byvoeging)

- Skakel {{ui:Puntwolke}} aan in {{ui:Instellings}} › {{ui:Byvoegings}}; 'n Puntwolke-oortjie verskyn in die regterpaneel. Maak 'n LAS- of LAZ-lêer oop, maak dit skoon, sorteer dit in grond, plantegroei en geboue, bou die grond, kontoere en volumes, en voer LAS of LAZ uit. Sien [Puntwolke uit 'n hommeltuig of skandeerder](topic:point-clouds).

### WaterCraft (byvoeging)

- Skakel {{ui:WaterCraft (waterverspreiding)}} aan in {{ui:Instellings}} › {{ui:Byvoegings}}; 'n WaterCraft-oortjie verskyn. Dit het vraag van kliënte, brandvloei by elke brandkraan, watter hoofpyp-uitval die meeste saak maak, en waterouderdom en chloor, elk as CSV gestoor. Sien [WaterCraft: vraag, brandvloei, uitvalle en waterouderdom](topic:watercraft).

### Saam werk

- In 'n lewendige sessie sien julle mekaar se wysers en name in die plan. Biblioteekplante: CivilCraft Landskap begin vanaf sy standaard biblioteekversameling, {{ui:CivilCraft-landskap}}.

## In elke program

- Wenke wys as Bootstrap-nutswenke, en die beginwenk kan gesluit word.
- 'n Paneel se oortjiestrook wat nie pas nie, rol eerder as om afgesny te word.
- Blaaieroortjie-titels lees `<dokument> - CivilCraft | CadCraft`.
- {{ui:Instellings}} het 'n Uitleg-afdeling waar die uitlegte 'n aftreklys van tweelyn-keuses is.
- Gewig- en temperatuureenhede is in {{ui:Instellings}} › {{ui:Globaal}} › {{ui:Eenhede}}.
- Die taallys wys die tale waarvoor die bou lêers het. Tale behalwe Engels is masjienkonsepte.

## Reggestel

- Die adres-opsoek- en EnergyPlus-nagaan-byvoegings kon nie aangeskakel word nie; nou kan hulle.
- Die hulp sê nou dat die Puntwolke-byvoeging 'n skoongemaakte wolk as LAS 1.4 of LAZ skryf.
- Klik op die gekose voorwerp se eie handvatsel begin nie meer 'n handvatsel-sleep wat 'n wagtende Kies gestop het nie.

## Eerlike grense

- Die voorbeeld-koridorsjablone is plekhouers sonder standaard; 'n ingenieur moet hulle nagaan. Terreinsjablone voeg geen oppervlak by nie en word nie in 3D of in die snitaansig geteken nie. Die tweede koridor op 'n belyning is nie in die IFC-uitvoer nie. Daar is geen taps tussen twee sjablone volgens stasie nie.
- Puntwolke is getoets op verdigte lêers, nie 'n werklike hommeltuigopmeting nie. Slegs LAS en LAZ word gelees.
- GIS-ontleding is getoets op verdigte lae.
- Skadu, son en gemak is beplanningskattings; wind is nie-bekragtigde sifting. Niks daarvan is 'n ontwerpwaarde nie.
- WaterCraft is 'n berekeningshulpmiddel wat op verdigte netwerke nagegaan is. 'n Wateringenieur besluit wat die getalle werd is.
- Tale behalwe Engels is masjienkonsepte.
- Windows-installeerders is nie kode-onderteken nie, en die macOS-skyfbeeld is nie genotariseer nie.

## Vroeër: 0.8 en 0.8.1

Dit is wat in CivilCraft 0.8 (2026-11-01) en 0.8.1 (2026-11-02) verander het, vergeleke met 0.7. Die groot nuwe dele is gereedskap wat jou grondwerk en terrein toets (reën, grondwerk, roetes, damme, vordering) en ses berekeningsvensters vir grond, paaie, opmeting, myne, skakels en spoor.

### Nuut

**Toets jou gradering**

- **Laat dit reën.** {{ui:Laat dit reën…}} (onder {{ui:Oppervlak}}) laat 'n storm op die gegradeerde grond val. Jy kyk hoe die water van die platforms afloop, in die lae hoeke opdam en die damme oorloop wat te klein is. Die lopie is geanimeer en gee die volumes, die piekuitvloei en 'n CSV van elke dam. Die standaardsel is growwe sodat 'n eerste kyk vinnig is; 'n fyner sel is stadiger. Damme wat oorloop, verskyn ook in die Probleme-paneel.
- **Grondbalanseerder.** {{ui:Grondbalanseerder…}} hef of verlaag 'n platform totdat afgraving gelyk is aan opvulling, en wys die vervoertabel tussen hulle.
- **Beste roete.** {{ui:Beste roete…}}: kies 'n begin en 'n einde, en CivilCraft vind die goedkoopste pad oor die terrein wat by jou helling- en kromme-limiete hou, en maak dan 'n belyning daaruit.
- **Opvangdamme.** {{ui:Opvangdamme…}} bereken fase en berging uit jou grond, neem uitlaattoestelle (gat, oorlaat, V-keep, oorloopwal), roeteer 'n storm deur die dam en kontroleer die piek wat teruggehou word, die afsakkingstyd en die vryboord.
- **Vordering uit opmetings.** {{ui:Vordering uit opmetings…}} vergelyk hommeltuig- of skandeeroppervlaktes van verskillende datums met die grond soos dit was en met die ontwerp: persentasie voltooi volgens volume, oor-gegrawe en oor-opgevulde areas, stapels, en wanneer die werk teen hierdie tempo klaar is (gemerk as 'n skatting).

**Ken die terrein**

- **Adres na terrein.** {{ui:Adres na terrein…}} lyn oop erf-, gebou-, sonering-, grond-, vloed- en terreindata op een terrein saam. Jy kan die terrein in die projeklêer hou: die getikte adres, elke bron met die dag waarop jy dit gehaal het en sy lisensie, en wat teruggekom het. Heropen of deel die projek en die terrein is nog steeds daar, sonder dat iets weer gehaal word. Jy kan dit ook as 'n terreinlêer stoor of na BimCraft stuur. Sien [Adres na terrein](topic:address-to-site).

**Grond, paaie, opmeting, myne, skakels en spoor**

- **Gronde en hellings.** {{ui:Gronde en hellings…}} teken die grondprofiel tussen boorgate wat jy intik. Bishop se metode soek dan die kritieke sirkel op jou grond, met 'n waterspieël, 'n bylas en 'n aardbewingskoëffisiënt; versakking van 'n fondasie kry konsolidasie, onmiddellike versakking en tyd.
- **Aansluitings en merkings.** {{ui:Aansluitings en merkings…}} sit takke saam met kerbafdraaiings (een radius per tak, of drie-middelpunt-afdraaiings), die sigafstand vir die ontwerpspoed, 'n nagaan van die sigdriehoeke, voetgangeroorgange, stopstrepe, merkings en seine met 'n seinrooster. Hulle word op die plan geteken en as 'n .dxf met benoemde lae gestoor.
- **Opmetingsaanpassing.** {{ui:Opmetingsaanpassing…}} doen 'n kleinstekwadrate-aanpassing van 'n poligoon of netwerk: aangepaste koördinate, foutellipse, die chi-kwadraat-toets en 'n vlag op die meting wat nie pas nie. Vrye netwerke, sluiting van 'n poligoon volgens die kompasreël en RW5-, GSI-, JobXML- of CSV-veldlêers is ingesluit, en die aangepaste punte stoor as CSV.
- **Oop groewe.** {{ui:Oop groewe…}} maak boormonsters om in 'n bloktmodel en die uiteindelike groef binne jou hellingshoek, met die afvalverhouding, 'n tabel per bank en 'n graad- en tonnemaat-kurwe. Geneste groewe volgens inkomstefaktor en 'n produksieskedule met 'n verdiskonteerde kontantvloei is ook daar.
- **Radioskakels.** {{ui:Radioskakels…}} kontroleer gesigslyn oor jou grond met die aarde se buiging, die eerste Fresnel-sone, skakelbegroting, fade-marge en veelpadonderbreking, en gee die masthoogte wat die pad skoon sou maak. Dit doen ook veselverliesbegrotings, roetehoeveelhede en die wind op 'n toring.
- **Spoorwissels.** {{ui:Spoorwissels…}} maak 'n wissel uit sy kruisnommer, kruisoorgange tussen parallelle spore, en 'n strukturele spoorwydte wat deur kant gekantel en op 'n kromme verbreed word. 'n Wissel kan by 'n stasie van 'n belyning sit.

Sien [Grond, aansluitings, opmetingsaanpassing, groewe, radioskakels en wissels](topic:soils-roads-survey-mines-links).

### In elke program

- **Tale.** 54 tale, tien daarvan nuut. Tale behalwe Engels is masjienkonsepte totdat 'n moedertaalspreker dit lees. Hulp-onderwerpe is meestal nog Engels.
- **Werkbalkrye.** {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Werkbalkrye}}: Wikkel (soos voorheen), 2 rye of 1 ry. CivilCraft se Lint wys die mees gebruikte gereedskap groot, die volgende klein, en die res agter die pyltjie van die groepnaam.
- **Invoertoestelle.** Raakpaneel, pen, 3D-muis, beheerder en MIDI kan die programme bestuur.
- **Probleme.** 'n Probleme-paneel wat in elke program waarsku, met nagaan wat reguleringspakkette lees.
- **Lewend.** 'n Aansig van wie waar is in 'n lewendige sessie.
- **Byvoegings.** 'n Byvoegingslys, met beligtingsbyvoegings.
- **Koppel jou KI.** Enige assistent wat jy koppel, kan CivilCraft se gereedskap bestuur. Dit lewer met 'n nota dat koppel met een klik binne CadCraft Studio en die gehoste koppelaar nog nie gereed is nie. Sien [Laat 'n KI-assistent met jou terrein werk](topic:assistants).

### Reggestel in 0.8.1

- **DWG-klasafdeling.** Dit is as die verkeerde tipe gelees (GitHub cadcraft#5). Reggestel in CivilCraft saam met CadCraft, BimCraft, ModelCraft en TakeoffCraft.
- **Taal wissel terwyl dit loop.** CadCraft Studio en die gepakte uitgawes kan tydens die lopie van taal verander. Hulle was vroeër net in Engels. Nog nie op elke platform getoets nie: sê vir ons as die taal nie verander nie.

### Nog nie in hierdie weergawe nie

- **Dit is berekeningshulpmiddels.** Elke resultaat in die nuwe vensters benodig 'n ingenieur se nagaan. Grondsterktes begin van tipiese waardes vir die grondgroep, en die venster sê so.
- **Laat dit reën.** 'n Lopie op die voorbeeldterrein kan oor twee minute neem in die blaaier by 'n fyn sel. Dit is nagegaan teen handgevalle en 'n V-vormige opvangarea, nog nie op 'n werklike gegradeerde terrein nie.
- **Adres na terrein.** Dit lees oop datalêers wat jy bring, en is net op ons eie lêers getoets. Bome is nie 'n bron nie. Om bronne vir jou te haal, wag op die privaatheidsbewoording.
- **Vordering uit opmetings.** Net op verdigte opmetings getoets. Vordering op blaaie en merkings (MarkupCraft) en skandeer teen model (BimCraft) is nie gebou nie.
- **Gronde en hellings.** Net sirkelvormige oppervlaktes: geen wig- of blokkesoektog en geen spanningsbarsie nie.
- **Aansluitings.** Een radius per tak, geen vragmotor-veegpaaie nie, en hulle gaan nog nie in die koridor in nie.
- **Veldlêers.** Die lesers is geskryf uit openbare formaatbeskrywings en getoets op lêers wat ons gemaak het. Werklike instrumentlêers word gesoek.
- **Skakels en spoor.** Radioskakels: vrye-ruimte-verlies en veelpad net (geen reënvervaling of antennapatrone nie), en geen spoorwegstandaard nie: elke spoorlimiet is 'n plekhouer, met konsepgetalle wat geen spooringenieur nagegaan het nie.
- **Windows en macOS.** 0.8 is nie kode-onderteken nie. Windows kan waarsku, en macOS vra vir regsklik en dan Oop.

Al die ander is in [Nog nie gebou nie](topic:not-built-yet). Vir die vroeëre vrystelling, sien [Wat is nuut in 0.7](topic:whats-new-0-7).
