---
title: Plaveisel, mure en trappe
summary: Plaveisel met valle na 'n put of 'n dwarsval, 'n patroon en sy opbou; paadjies wat die grond volg; keermure en vrystaande mure met trapvormige fondasies; kerbe; hellingbane en trappe wat teen hul limiete nagegaan word; IFC uit.
keywords: verhardings, plaveisel, plaveiselklinkers, stoep, terras, valle, put, dwarsval, vishgraat, strekverband, paadjie, loopweg, keermuur, tuinmuur, fondasie, afdekrif, kerb, kerb, kantwerk, hellingbaan, toeganklikheid, trappe, trap, optrede, aantrede, portaal
from: d34b4466
---

Verhardings word elke keer weer uit die grond bereken, so dit volg die terrein en word weer gegenereer wanneer die grond of sy lyn beweeg. Sleep sy hoeke op die plan soos enige lyn. Maak dit oop vanaf {{ui:Verhardings}} in die Landskap-groep.

## Plaveisel

Klik die hoeke en druk {{key:Enter}}. In Eienskappe:

- **Peil**: leeg = die grond se gemiddelde onder dit.
- **Valle**: gelyk, 'n **dwarsval** ('n % na 'n rigting) of **na 'n put**: CivilCraft vra jou om te klik waar die put kom, dan styg elke hoek vanaf die put teen die val. Pyltjies op die plan wys die valle.
- **Patroon** (rooster, strekverband, vishgraat) met die eenheidsgrootte, voeg en hoek; **Kantwerk**-breedte. Op 'n blad word voeë nader as 'n millimeter weggelaat.
- Die plaveisel is deel van die voorgestelde oppervlak. Die lae (klinkers, bedding, basis) gaan in die IFC en die hoeveelhede.

## Paadjies

Klik langs die paadjie en druk {{key:Enter}}. Dit volg die grond, met sy **Dwarsval** na sy regterkant. 'n Paadjie wat steiler is as **Steilste toegelaat** word op die plan met `!` gemerk waar dit is, en Eienskappe sê hoe steil dit word.

Waar 'n paadjie 'n pad ontmoet wat deur 'n koridor gebou is, stop dit by die pad se buiterand, gelyk met die sypaadjie of skouer daar, in die voorgestelde oppervlak en in die 3D-aansig. 'n Paadjie wat 'n pad kruis, word gegradeer en as twee stukke gewys, en 'n einde wat tot twee keer die paadjie se breedte kort van die pad getrek is, word tot by sy rand voortgesit. Die plan wys steeds die paadjie soos jy dit geteken het, en sy lengte en oppervlakte tel die hele lyn. Sien [Veeg 'n padkoridor](topic:corridor).

## Mure

Klik langs die muur en druk {{key:Enter}}. 'n Muur is **keer** of **vrystaande**. Sonder 'n **Bo**, staan dit sy **Hoogte** bo die grond oor die hele lengte; tik 'n bo in om dit gelyk te hou. Sy **fondasie** sit 'n vaste diepte onder die grond en tree in hele trappies af, sodat dit tussen hulle gelyk bly. Eienskappe gee sy lengte, hoogtes, gesigoppervlakte en fondasietrappe; die plan merk die muurbo en muuronder (TW / BW) aan elke einde.

:::warning
'n Keermuur hoër as 1.2 m (4 ft) word gemerk: 'n ingenieur ontwerp dit.
:::

## Kerbe

Klik langs die kerb en druk {{key:Enter}}; stel sy breedte en opstaan in.

## Hellingbane

Klik van onder na bo en druk {{key:Enter}}. Die peile kom van die grond aan elke einde, tensy jy hulle intik. 'n Hellingbaan kry 'n portaal elke styging van 750 mm (2.5 ft) en word nagegaan teen **Steilste toegelaat** (1:12 om mee te begin) en 'n minimum breedte; Eienskappe sê hoe lank dit moet wees.

## Trappe

Klik die voorrand van die onderste trap, dan waar die trappe die bo bereik, en druk {{key:Enter}}. Die getal optrede kom uit die hoogte en die **Grootste optrede**; die loopdiepte uit die gemaksreël 2R + G ≈ 630 mm, nooit onder die **Kleinste loopdiepte** nie; 'n portaal elke **Optrede per loop op die meeste**. Eienskappe sê of hulle tussen die twee punte pas of hoeveel langer hulle nodig het.

:::note
Die limiete vir hellingbane en trappe is gemerkte standaardwaardes. Stel die waardes in wat jou boukode vereis.
:::

## Buite CivilCraft

- Meer › {{ui:Voer landskap-IFC uit}}: plaveisel en paadjies as `IfcPavement`, mure as `IfcWall` (keermure as RETAININGWALL) met hul lae, kerbe as `IfcKerb`, hellingbane as `IfcRamp`, trappe as `IfcStair` met hul optrede en aantrede.
- Die plantrooster se **Stuur na TakeoffCraft** dra die plaveiselareas en laagvolumes, muurgesigoppervlaktes en -lengtes, kerblengtes en traptellings oor.
- Die detailblad teken elke muur se snit, elke plaveisel se opbou en elke trapstel. Sien [Landskapblaaie](topic:landscape-sheets).
