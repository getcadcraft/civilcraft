---
title: Parkeerterrein-uitleg
summary: Lê stalplekke, gange, toeganklike en bestelwa-plekke en eilande binne 'n omtrek uit, gelykmaak die terrein met valle na afvoere teen die bestaande grond, en plavei en beplant dit dan. Ook beskikbaar vir 'n assistent.
keywords: parkeer, terrein, stalplek, gang, toeganklik, ada, bestelwa, eiland, drein, val, gelykmaak, afgrawing, opvulling, plaveisel, plavuis, beplanting, bome, grond, puntwolk, mcp, assistent
from: 06c14da9
---

Pas 'n parkeerterrein in 'n perseel, 'n pad of 'n geslote kenmerklyn in, en kry die tellings, die gelykmaking en die plaveisel in een stap.

## Lê dit uit

1. Kies 'n perseel, 'n pad of 'n geslote kenmerklyn op die plan.
2. Maak **Oppervlak, Meer, Parkeerterrein...** oop.
3. Kies die reëls, die stalhoek (90, 75, 60, 45, 30 grade of parallel) en eenrigting- of tweerigting-gange. Die stalplek-, gang- en eilandafmetings begin by die tabel, en elkeen kan oorgetik word.
4. Kies **Lê uit**.

Die rye loop langs die omtrek se rand wat die meeste stalplekke gee (of teen die hoek wat jy tik). 'n Stalplek tel slegs as dit heeltemal binne die omtrek lê. Waar ruimte oorbly vir een ry en 'n gang, word 'n enkelgelaaide band bygevoeg. Die venster lys ruimtes, toeganklike en bestelwa-plekke, eilande, afvoere en die oppervlakte per ruimte, en die plan wys stalplekke, toeganklike ruimtes met hul gearseerde toegangsgange, eilande, gang-middellyne en afvoere op hul eie lae (C-PARK-...), sodat dit na PDF, DXF en DWG gaan.

## Toeganklike ruimtes

Met die Verenigde State se reëls volg die telling tabel 208.2 van die 2010 ADA-standaarde vir die ruimtes wat voorsien word (een in ses, na bo afgerond, is 'n bestelwa-ruimte). Dit word geplaas die naaste aan die eerste hoek van die omtrek (die ingang), elk met 'n toegangsgang; twee deel een. 'n Stalplek smaller as die toeganklike wydte, of 'n val steiler as 1:48 op toeganklike ruimtes, wys as 'n probleem. **Hierdie getalle is uit die standaard getik soos onthou en is nie teen die gedrukte standaard nagegaan nie.** Tipiese stal- en gangafmetings kom uit parkeerontwerpgidse en is ook nie nagegaan nie. Kontroleer albei, en jou plaaslike kode, voordat jy daarop staatmaak. Kies **Pasgemaak** om jou eie toeganklike telling in te voer.

## Valle na afvoere, afgrawing en opvulling

Tensy jy dit afskakel, word die terrein 'n gelykmaakgebied in die Landskap-werkspasie. Afvoere word op die gang-middellyne ongeveer elke 100 voet (30 m) geplaas; die oppervlak styg vanaf elke afvoer teen die val wat jy gee (1,5 persent om mee te begin), sodat elke punt na sy naaste afvoer val. Die vlak word gekies sodat die terrein se afgrawing en opvulling op die bestaande grond balanseer. Die bestaande grond is die projek se bestaande oppervlak, wat kan kom uit opmetingspunte, LandXML, 'n lidar- of skanderingspuntwolk wat in 'n oppervlak omgeskakel is, of kontoere. Die venster wys die skatting van afgrawing en opvulling; die projek se eie volumes wys die presiese syfer daarna. Die gelykmaakgebied hou sy rand op die bestaande grond, so waar die nuwe oppervlak van die grond aan die rand verskil, kry jy 'n trap, en die venster sê hoe groot dit is.

## Plaveisel en beplanting

Die hele omtrek kry 'n plavuis-plaveisel ('n strekkerpatroon wat jy onder Landskap, Hardscape kan verander), en elke eiland kry 'n struikbed en, waar dit breed genoeg is, 'n boom, uit die plantlys geneem. Alles is daarna 'n gewone Landskap-voorwerp: wysig dit, of kies **Lê weer uit** om wat die terrein gemaak het te vervang. Die verwydering van die terrein verwyder wat dit gemaak het.

## Vanaf 'n assistent

Dieselfde terrein kan oor MCP gevra word: `parking_layout` wys 'n voorbeeld, `parking_build` skryf, en `parking_remove` haal 'n terrein weg. Vra volgens perseelnaam of stuur die omtrek.

## Wat nie gedoen is nie

Of die gange 'n straat bereik, word nie nagegaan nie. Plaveisel dek die hele omtrek, so die oppervlakte sluit die eilande in. Plaveiselmateriaalkeuses uit die Biblioteek en 'n Biblioteek-tipe vir stalplekke is nie gebou nie; die plaveiselpatroon is die Hardscape-een. Geen ander land se reëls is gebou nie.
