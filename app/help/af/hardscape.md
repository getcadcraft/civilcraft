---
title: Plaveisel, mure en trappe
summary: Plaveisel met valle na 'n put of 'n dwarsval, 'n patroon en sy opbou; paaie wat die grond volg; keer- en vrystaande mure met trapsgewys fondasies; randstene; hellingbane en trappe nagegaan teen hul perke; IFC uit.
keywords: verhardings, plaveisel, plaveisteen, stoep, terras, valle, put, dwarsval, visgraat, stretcher-verband, pad, loopweg, keermuur, tuinmuur, fondasie, afdekstuk, randsteen, rand, kantwerk, hellingbaan, toeganklikheid, trappe, treë, optrede, landing
from: 51475877
---

Verhardings word elke keer weer uit die grond bereken, so dit volg die terrein en word weer gegenereer wanneer die grond of sy lyn verskuif. Sleep sy hoeke op die plan soos enige lyn. Maak dit oop vanaf {{ui:Verhardings}} in die Landskap-groep.

## Plaveisel

Klik die hoeke en druk {{key:Enter}}. In Eienskappe:

- **Peil**: leeg = die grond se gemiddelde onder dit.
- **Valle**: peil, 'n **dwarsval** ('n % na 'n rigting) of **na 'n put**: CivilCraft vra jou om te klik waar die put kom, daarna styg elke hoek vanaf die put teen die val. Pyltjies op die plan wys die valle.
- **Patroon** (rooster, stretcher-verband, visgraat) met die eenheidsgrootte, voeg en hoek; **Kantwerk**-breedte. Op 'n blad word voeë nouer as 'n millimeter weggelaat.
- Die plaveisel is deel van die voorgestelde oppervlak. Sy lae (plaveisteen, bedding, basislaag) gaan in die IFC en die hoeveelhede.

## Paaie

Klik langs die pad en druk {{key:Enter}}. Dit volg die grond, met sy **Dwarsval** na die regterkant daarvan. 'n Pad wat steiler is as **Steilste toelaatbaar** word met `!` op die plan gemerk waar dit is, en Eienskappe sê hoe steil dit word.

## Mure

Klik langs die muur en druk {{key:Enter}}. 'n Muur is **keer** of **vrystaande**. Sonder 'n **Bo** staan dit sy **Hoogte** heeltemal langs die grond; tik 'n bo in om dit gelyk te hou. Sy **fondasie** sit 'n vaste diepte onder die grond en tree af in hele trappe, so dit bly gelyk tussen hulle. Eienskappe gee sy lengte, hoogtes, voorvlakoppervlakte en fondasietrappe; die plan merk die bokant en onderkant van die muur (TW / BW) by elke einde.

:::warning
'n Keermuur hoër as 1.2 m (4 ft) word gemerk: 'n ingenieur ontwerp dit.
:::

## Randstene

Klik langs die randsteen en druk {{key:Enter}}; stel sy breedte en opstaande hoogte.

## Hellingbane

Klik van onder na bo en druk {{key:Enter}}. Die peile kom van die grond aan elke einde, tensy jy dit intik. 'n Hellingbaan kry 'n landing elke styging van 750 mm (2.5 ft) en word nagegaan teen **Steilste toelaatbaar** (1:12 om mee te begin) en 'n minimum breedte; Eienskappe sê hoe lank dit sou moet wees.

## Trappe

Klik die voorrand van die onderste trap, dan waar die trappe die bokant bereik, en druk {{key:Enter}}. Die aantal optrede kom uit die hoogte en die **Grootste optrede**; die trapdiepte uit die gemaksreël 2R + G ≈ 630 mm, nooit onder die **Kleinste trapdiepte** nie; 'n landing elke **Hoogste aantal optrede per vlug**. Eienskappe sê of hulle tussen die twee punte pas, of hoeveel langer hulle nodig het.

:::note
Die perke vir hellingbane en trappe is gemerkte standaardwaardes. Stel die waardes wat jou boukode vereis.
:::

## Uit CivilCraft

- Meer › {{ui:Voer landskap-IFC uit}}: plaveisel en paaie as `IfcPavement`, mure as `IfcWall` (keermure as RETAININGWALL) met hul lae, randstene as `IfcKerb`, hellingbane as `IfcRamp`, trappe as `IfcStair` met hul optrede en trapbord.
- Die plantskedule se **Stuur na TakeoffCraft** dra die plaveiseloppervlaktes en laagvolumes, muur-voorvlakoppervlaktes en lengtes, randsteenlengtes en trap-tellings.
- Die detailblad teken elke muur se snit, elke plaveisel se opbou en elke trapvlug. Sien [Landskapbladsye](topic:landscape-sheets).
