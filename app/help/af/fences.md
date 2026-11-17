---
title: Heinings
summary: 'n Heining langs 'n lyn, perseel of pad: pale, riete, panele of stakkies, hekke, skuins of getrap op die grond, 'n skedule, plan-simbole en IFC-elemente. Ook beskikbaar vir 'n assistent.
keywords: heining, pale, riete, panele, stakkies, hek, skuins, getrap, grond, skedule, ifc, leuning, grens
from: c0e7b84a
---

Maak 'n heining langs 'n kenmerklyn, belyning, perseel of pad, met sy pale en hekke wat vir jou geplaas word.

## Maak 'n heining

1. Kies 'n lyn, 'n perseel of 'n pad.
2. Maak **Oppervlak, Meer, Heinings...** oop.
3. Kies die styl (panele, riete of stakkies), skuins of getrap, die hoogte, die paalafstand en die hekwydte, dan **Heining langs keuse**, of **Met 'n hek** om 'n hek in die middel van die langste reguit stuk te sit.

Pale kom aan die einde, by elke hoek ('n hoekpunt wat met 20 grade of meer draai), aan albei rande van elke hek en by gelyke baaie tussenin, en nie een langer as die afstand nie. **Skuins**-panele volg die grond tussen hul pale. **Getrapte** panele bly plat en trap by die pale; die gaping onder 'n paneel is die wydste by sy afwaartse paal, en die venster waarsku wanneer daardie gaping oor die limiet is, of wanneer die grond deur 'n paneel styg. Hekke van 6 voet (1,8 m) en wyer kry twee vleuels; die plan wys die vleuels oop met hul swaai.

## Skedule en uitvoere

Elke heining wys sy lengte, pale volgens soort, panele, hekke en trappe, met 'n **CSV**-skedule van pale, panele, riete, stakkies en hekke. Die plan het heininglae (C-FENC, C-FENC-POST, C-FENC-GATE) vir PDF, DXF en DWG. Die IFC-uitvoer hou die pale (IfcMember, post), panele (IfcRailing, user defined fence panel), riete (IfcMember) en hekke (IfcDoor, gate), een stelsel per heining.

## Vanaf 'n assistent

`fence_build` maak 'n heining (punte of 'n benoemde lyn, perseel of pad, hekke volgens stasie) en `fence_list` lys die heinings met hul skedule.

## Wat nie gedoen is nie

Die beginafmetings is gewone keuses, nie 'n kode nie. Tipes uit die Biblioteek word slegs as 'n naam gedra. Hekke moet in een reguit stuk lê. BimCraft het nog nie hierdie gereedskap nie.
