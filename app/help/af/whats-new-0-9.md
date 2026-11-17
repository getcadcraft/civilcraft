---
title: Wat is nuut in 0.9
summary: Koridor- en terreinsjablone, vangpunte en Kies-knoppies tydens tekenwerk, GIS-analise met 'n eienskapstabel, skadu-, sonopbrengs-, komfort- en windstudies vir 'n terrein, 'n 3D-weergeeaansig, en die byvoegings Puntwolke en WaterCraft.
keywords: wat is nuut, 0.9, uitgawe-notas, koridorsjablone, terreinsjablone, sjabloonredigeerder, tipiese snit, verskeie koridors, snap, snaps, kies, skuif, kopieer, draai, raaklyn, weergee, 3d-weergee, gis-analise, buffer, oorlegging, ruimtelike koppeling, eienskapstabel, styl volgens eienskap, skadustudie, sonopbrengs, utci, buitekomfort, windstudie, openfoam, puntwolke, las, laz, watercraft, brandvloei, hidrant, waterouderdom, chloor, aanvraag, wenke, uitleg, veranderinge, 0.8, 0.8.1, weergawe, nuwe kenmerke, reën, storm, ponding, oorvloei, grondverskuiwing, balans, sny en vul, vervoer, beste roete, laagste koste, belyning, opvangdam, uitlaat, afsakking, vryboord, vordering, opmeting, drone, stapel, adres na terrein, erf, grond, vloed, hellingstabiliteit, Bishop, versakking, aansluiting, merkings, bordjies, sigafstand, aanpassing, kleinste kwadrate, traverse, oop groef, blokmodel, radioskakel, Fresnel, wissel, kruisspoor, tale, probleme, lewendig, dwg
from: d7ac5b14
---

Dit is wat in CivilCraft 0.9 verander het, vergeleke met 0.8.1. CivilCraft 0.9 is deel van CadCraft Studio 0.9 en sy agt programme. Die groot dele is koridor- en terreinsjablone, vangpunte tydens tekenwerk, GIS-analise, studies van 'n terrein se son, sonopbrengs, komfort en wind, en twee byvoegings: Puntwolke en WaterCraft.

## Nuut

### Koridor- en terreinsjablone

- **Koridorsjablone.** Maak {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} oop (of tik {{cmd:TEMPLATES}}). 'n Sjabloon is 'n klein dwarssnit met komponente, verskuiwings, hellings, materiale en puntkodes. Hou hulle in die projek, in {{ui:My library}} of as 'n `.cctemplates.json`-lêer. Die sjabloonredigeerder wys 'n tekening op ware skaal en lys probleme soos jy tik.
- **Bou vanuit sjablone volgens stasie.** Kies 'n belyning en skakel {{ui:Build from templates by station}} aan in sy Eienskappe. Elke kant van elke streek het sy eie plaveisellys en sy eie eindtoestand. {{ui:Add a corridor}} onder {{ui:Corridors on this alignment}} plaas verskeie koridors op een belyning.
- **Terreinsjablone.** {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (of tik {{cmd:TERRAINTEMPLATES}}) lê gelaagde materiale soos bogrond of plaveisel en fondasie op 'n terrein, met oppervlakte en volume per laag. Sien [Koridorsjablone en terreinsjablone](topic:corridor-templates).

### Tekenwerk

- **Vangpunte.** Die gereedskap Belyning, Platform, Erf, Massa, Kenmerklyn, Meet, Grens en Opvangebied vang aan opmetingspunte, PI's, hoeke, hoekpunte en strukture, met 'n etiket by die merker. Hou {{key:Alt}} vas vir 'n vrye punt.
- **Kies-knoppies, raaklyn en skuif, kopieer, draai.** Platform-, erf- en kenmerklynhoeke het getikte Oosting- en Noordingvakkies en 'n Kies-knoppie met 'n kruisdraad. Eienskappe het ook {{ui:Tangent from two points}} vir belynings en {{ui:Move, copy and rotate}} vir belynings, platforms, erwe en kenmerklyne. Sien [Teken met vangpunte, gekose hoeke en skuif, kopieer, draai](topic:draft-with-snaps).
- **Weergee-aansig in 3D.** Die {{ui:Render}}-knoppie op die 3D-balk teken die grond met natuurlike kleure, lug, waas en sagte skaduwees. Dit verander nie die model nie. Die {{ui:Sun}}-kieslys het nou {{ui:Apply}}- en {{ui:Close}}-knoppies. Sien [Bekyk die terrein in 3D](topic:site-3d).
- **Paneele maak een afdeling op 'n slag oop.** Die linkerpaneel en die Eienskappe-paneel maak een afdeling oop en sluit die ander, en die Landskap-lint se groepe met verskeie gereedskap is verdeelde knoppies.

### GIS-analise

- **Analiseer.** {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} bied buffer, oorlegging, ruimtelike koppeling, kies volgens eienskap of vorm, en meet. Elke gereedskap maak 'n nuwe laag in een ontdoen-stap.
- **Eienskapstabel.** 'n Laag se kieslys met drie kolletjies het {{ui:Attribute table…}} en {{ui:Style by attribute…}}. Sien [Analiseer GIS-lae](topic:gis-analysis) en [Werk met 'n laag se eienskapstabel](topic:gis-table).

### Die terrein: son, sonenergie, komfort en wind

- **Omgewingsafdeling.** Kies 'n massa: die {{ui:Environment}}-afdeling staan onder {{ui:Sun hours}} in sy Eienskappe. Dit het 'n skadustudie (kaart, tabel, animasie, CSV), sonopbrengs uit 'n tipiese-jaar weerlêer (.epw) en buitekomfort (UTCI).
- **Wind, slegs siftingsdoel.** {{ui:Run wind study}} kleur die grond van sitbaar tot ongemaklik vir elke windrigting in die weerlêer. Dit is nie gevalideer nie en die paneel sê so.
- **Voetgangerwind (OpenFOAM)-byvoeging.** Af totdat jy dit in {{ui:Settings}} › {{ui:Add-ons}} aanskakel. OpenFOAM is sagteware wat jy self installeer. Sien [Skaduwee, sonopbrengs en buitekomfort](topic:environment).

### Puntwolke (byvoeging)

- Skakel {{ui:Point clouds}} aan in {{ui:Settings}} › {{ui:Add-ons}}; 'n Puntwolke-oortjie verskyn in die regterpaneel. Maak 'n LAS- of LAZ-lêer oop, maak dit skoon, sorteer dit in grond, plantegroei en geboue, bou die grond, kontoere en volumes, en voer LAS of LAZ uit. Sien [Puntwolke uit 'n drone of skandeerder](topic:point-clouds).

### WaterCraft (byvoeging)

- Skakel {{ui:WaterCraft (water distribution)}} aan in {{ui:Settings}} › {{ui:Add-ons}}; 'n WaterCraft-oortjie verskyn. Dit het aanvrae van kliënte, brandvloei by elke hidrant, watter hoofpyplyn die grootste uitval veroorsaak, en waterouderdom en chloor, elk gestoor as CSV. Sien [WaterCraft: aanvrae, brandvloei, uitvalle en waterouderdom](topic:watercraft).

### Saamwerk

- In 'n Live-sessie sien jy mekaar se wyserpunte en name in die plan. Biblioteekplante: CivilCraft Landskap begin van sy standaard-Biblioteekversameling, {{ui:CivilCraft landscape}}.

## In elke program

- Wenke verskyn as Bootstrap-gereedskapwenke, en die beginwenk kan toegemaak word.
- 'n Paneel se oortjiesreeks wat nie pas nie, rol in plaas daarvan om afgesny te word.
- Titels van blad-oortjies in die blaaier lees `<document> - CivilCraft | CadCraft`.
- {{ui:Settings}} het 'n Uitleg-afdeling waar die uitlegte 'n aftreklys van tweelynkeuses is.
- Gewigs- en temperatuureenhede is in {{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- Die taallys wys die tale waarvoor die bou lêers het. Tale behalwe Engels is masjienkonsepte.

## Reggestel

- Die adresopsoek- en EnergyPlus-nagaan-byvoegings kon nie aangeskakel word nie; nou kan hulle.
- Die hulp sê nou dat die Puntwolke-byvoeging 'n skoongemaakte wolk as LAS 1.4 of LAZ skryf.
- Klik op die gekose voorwerp se eie handvatsel begin nie meer 'n handvatsel-sleep wat 'n wagtende Kies gestop het nie.

## Eerlike beperkings

- Die voorbeeld-koridorsjablone is plekhouers sonder 'n standaard; 'n ingenieur moet hulle nagaan. Terreinsjablone voeg geen oppervlak by nie en word nie in 3D of in die snitaansig geteken nie. Die tweede koridor op 'n belyning is nie in die IFC-uitvoer nie. Daar is geen verjonging tussen twee sjablone volgens stasie nie.
- Puntwolke is getoets op verdigte lêers, nie op 'n regte drone-opmeting nie. Slegs LAS en LAZ word gelees.
- GIS-analise is getoets op verdigte lae.
- Skaduwee, sonenergie en komfort is beplanningsberamings; wind is ongevalideerde siftingswerk. Niks daarvan is 'n ontwerpwaarde nie.
- WaterCraft is 'n berekeningshulpmiddel wat op verdigte netwerke nagegaan is. 'n Watering-ingenieur besluit wat die getalle werd is.
- Tale behalwe Engels is masjienkonsepte.
- Windows-installeerders is nie kode-onderteken nie, en die macOS-skyfbeeld is nie genotariseer nie.

## Vroeër: 0.8 en 0.8.1

Dit is wat in CivilCraft 0.8 (2026-11-01) en 0.8.1 (2026-11-02) verander het, vergeleke met 0.7. Die groot nuwe dele is gereedskap wat jou grondbewerking en jou terrein toets (reën, grondverskuiwing, roetes, damme, vordering), en ses berekeningsvensters vir grond, paaie, opmeting, myne, skakels en spoor.

### Nuut

**Toets jou grondbewerking**

- **Maak dit reën.** {{ui:Make it rain…}} (onder {{ui:Surface}}) laat 'n storm op die gegradeerde grond neerkom. Jy sien hoe die water van die platforms af loop, in die lae hoeke bymekaarkom en oor die damme wat te klein is, oorloop. Die lopie is geanimeer en gee die volumes, die piekuitvloei en 'n CSV van elke dam. Die standaardsel is growwe sodat 'n eerste kyk vinnig is; 'n fyner sel is stadiger. Damme wat oorloop, verskyn ook in die Probleme-paneel.
- **Grondverskuiwingsbalanseerder.** {{ui:Earthwork balancer…}} verhoog of verlaag 'n platform totdat sny gelyk is aan vul, en wys die vervoertabel tussen hulle.
- **Beste roete.** {{ui:Best route…}}: kies 'n begin en 'n einde, en CivilCraft vind die goedkoopste pad oor die terrein wat by jou helling- en krommingsgrense bly, en maak dan 'n belyning daaruit.
- **Opvangdamme.** {{ui:Detention ponds…}} bereken fase en berging uit jou grond, neem uitlaattoestelle (opening, oorlaat, V-keep, oorloopwal), roeteer 'n storm deur die dam en nagaan die piek wat teengehou word, die afsakkingstyd en die vryboord.
- **Vordering uit opmetings.** {{ui:Progress from surveys…}} vergelyk drone- of skandeeroppervlaktes van verskillende datums met die grond soos dit was en met die ontwerp: persentasie voltooi volgens volume, oorgegrawe en oorgevulde gebiede, stapels, en wanneer die werk teen hierdie tempo klaar is (as 'n beraming gemerk).

**Ken die terrein**

- **Adres na terrein.** {{ui:Address to site…}} rig oop erf-, gebou-, sonering-, grond-, vloed- en terreindata op een terrein uit. Jy kan die terrein in die projeklêer hou: die getikte adres, elke bron met die dag wat jy dit gekry het en sy lisensie, en wat teruggekom het. Maak die projek weer oop of deel dit, en die terrein is steeds daar, sonder dat iets weer gehaal word. Jy kan dit ook as 'n terreinlêer stoor of na BimCraft stuur. Sien [Adres na terrein](topic:address-to-site).

**Grond, paaie, opmeting, myne, skakels en spoor**

- **Grond en hellings.** {{ui:Soils and slopes…}} teken die grondprofiel tussen boorgate wat jy tik. Bishop se metode soek dan die kritieke sirkel op jou grond, met 'n watertafel, 'n bykomende las en 'n aardbewingskoëffisiënt; versakking van 'n voetstuk kry konsolidasie, onmiddellike versakking en tyd.
- **Aansluitings en merkings.** {{ui:Junctions and striping…}} sit arms saam met hoekafrondings (een radius per arm, of drie-middelpunt-afrondings), die sigafstand vir die ontwerpspoed, 'n nagaan van die sigdrieke, voetgangersoorsteke, stopstrepe, merkings en bordjies met 'n borddiagram. Hulle word op die plan geteken en as .dxf met benoemde lae gestoor.
- **Opmetingsaanpassing.** {{ui:Survey adjustment…}} voer 'n kleinste-kwadrate-aanpassing van 'n traverse of netwerk uit: aangepaste koördinate, foutellipse, die chi-kwadraat-toets en 'n vlag op die meting wat nie pas nie. Vrye netwerke, sluiting van 'n traverse volgens die kompasreël en RW5, GSI, JobXML- of CSV-veldlêers is ingesluit, en die aangepaste punte word as CSV gestoor.
- **Oop groewe.** {{ui:Open pits…}} verander boormonsters in 'n blokmodel en die uiteindelike groef binne jou hellingshoek, met die stroookverhouding, 'n tabel per bank, en 'n graad- en tonnemaatkromme. Geneste groewe volgens inkomstefaktor en 'n produksieskedule met 'n verdiskonteerde kontantvloei is ook daar.
- **Radioskakels.** {{ui:Radio links…}} nagaan siglyn oor jou grond met die aardkromming, die eerste Fresnel-sone, skakelbegroting, vervagingsreserwe en multipad-uitval, en gee die masthoogte wat die pad sou skoonmaak. Dit doen ook vesellusbegrotings, roethoeveelhede en die wind op 'n toring.
- **Spoorwissels.** {{ui:Rail turnouts…}} maak 'n wissel uit sy frognommer, kruisspore tussen parallelle spore, en 'n strukturele wydte wat deur kant gekantel en op 'n kromming verbreed word. 'n Wissel kan by 'n stasie van 'n belyning staan.

Sien [Grond, paaie, opmeting, myne, skakels en spoor](topic:soils-roads-survey-mines-links).

### In elke program

- **Tale.** 54 tale, tien daarvan nuut. Tale behalwe Engels is masjienkonsepte totdat 'n moedertaalspreker dit lees. Hulp-onderwerpe is steeds meestal Engels.
- **Gereedskapbalk-rye.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Wrap (soos voorheen), 2 rye of 1 ry. CivilCraft se Lint wys die mees gebruikte gereedskap groot, die volgende kleiner, en die res agter die groepnaam se pyltjie.
- **Invoertoestelle.** Trackpad, pen, 3D-muis, beheerder en MIDI kan die programme bestuur.
- **Probleme.** 'n Probleme-paneel wat in elke program waarsku, met nagaan wat reëlpakkette lees.
- **Live.** 'n Aansig van wie waar is in 'n Live-sessie.
- **Byvoegings.** 'n Byvoegingslys, met beligtingsbyvoegings.
- **Koppel jou KI.** Enige assistent wat jy koppel, kan CivilCraft se gereedskap bestuur. Dit word met 'n nota gelewer dat koppeling met een klik binne CadCraft Studio en die gasheerkoppelaar nog nie gereed is nie. Sien [Laat 'n KI-assistent met jou terrein werk](topic:assistants).

### Reggestel in 0.8.1

- **DWG-klasseafdeling.** Dit is as die verkeerde tipe gelees (GitHub cadcraft#5). Reggestel in CivilCraft saam met CadCraft, BimCraft, ModelCraft en TakeoffCraft.
- **Taal omskakel terwyl dit loop.** CadCraft Studio en die verpakte uitgawes kan tydens bedryf van taal verander. Hulle was vroeër slegs Engels. Nog nie op elke platform getoets nie: sê vir ons as die taal nie verander nie.

### Nog nie in hierdie weergawe nie

- **Dit is berekeningshulpmiddels.** Elke resultaat in die nuwe vensters het 'n ingenieur se nagaan nodig. Grondsterktes begin van tipiese waardes vir die grondgroep, en die venster sê so.
- **Maak dit reën.** 'n Lopie op die voorbeeldterrein kan by 'n fyn sel meer as twee minute in die blaaier neem. Dit is teen handgevalle en 'n V-vormige opvangebied nagegaan, nog nie op 'n regte gegradeerde terrein nie.
- **Adres na terrein.** Dit lees oop dataleêers wat jy bring, en is slegs op ons eie lêers getoets. Bome is nie 'n bron nie. Die haal van bronne vir jou wag op die privaatheidsbewoording.
- **Vordering uit opmetings.** Slegs op verdigte opmetings getoets. Vordering op blaaie en merkings (MarkupCraft) en skandeer teen model (BimCraft) is nie gebou nie.
- **Grond en hellings.** Slegs sirkelvormige oppervlaktes: geen wig- of bloksoektog en geen trekskeur nie.
- **Aansluitings.** Een radius per arm, geen vragmotor se swaaipaaie nie, en hulle gaan nog nie in die koridor in nie.
- **Veldlêers.** Die lesers is geskryf uit openbare formaatbeskrywings en op lêers wat ons gemaak het, getoets. Regte instrumentlêers word gesoek.
- **Skakels en spoor.** Radioskakels: vryeruimte-verlies en multipad net (geen reënvervaging of antennapatrone nie), en geen spoorstandaard nie: elke spoorlimiet is 'n plekhouer, met konsepgetalle wat geen spooringenieur nagegaan het nie.
- **Windows en macOS.** 0.8 is nie kode-onderteken nie. Windows kan waarsku, en macOS vra vir regsklik en dan Oop.

Al die res is in [Nog nie gebou nie](topic:not-built-yet). Vir die vorige uitgawe, sien [Wat is nuut in 0.7](topic:whats-new-0-7).
