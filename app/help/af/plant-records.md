---
title: Plantrekords, kultivars en verskafde groottes
summary: Jou projek se eie plantlys as 'n tabel: kultivars, verskafde groottes (houer, wortelbal, omtrek, vrye stam), digtheid, spesifikasienotas, CSV in en uit; elke geplaaste plant noem 'n grootte; plantsimbole volgens skaal en jou eie simbole en 3D-modelle.
keywords: plantlys, plantdatabasis, kultivar, variëteit, verskafde grootte, houer, wortelbal, kaalwortel, omtrek, vrye stam, digtheid, plante per vierkante meter, spesifikasie, spesifikasienotas, plantsimbool, blok, eie simbool, 3D-plant, detailvlak, skaal
from: 12251beb
---

Maak {{ui:Plantlys}} oop uit die {{ui:Meer}}-kieslys van die Landskap-groep, of uit die Plante-afdeling. Elke ry is 'n plantrekord in hierdie projek se eie lys ('n rekord uit die plantlys word ingekopieer wanneer jy dit voeg). Elke wysiging word nagegaan soos 'n ingevoerde lêer, en is een ontdoen-stap.

## Die kolomme

- **Botaniese naam**, **Algemene naam**, **Tipe**, **Hoogte** en **Spreiding** by volwassenheid (meter).
- **Afstand** (middelpunt tot middelpunt) of **Digtheid** (plante per m²). 'n Bed van 'n rekord met 'n digtheid en geen afstand word teen daardie digtheid gevul, volgens sy eie patroon (driehoekig of vierkantig).
- **Verskafde groottes**: een inskrywing per grootte, geskei deur `;`. Elke inskrywing is 'n id, 'n soort (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) en dan enige van: 'n volume `10L`, 'n hoogte `h0.6`, 'n spreiding `s0.4`, 'n omtrek `g14-16` (cm), 'n vrye stam `st1.8`. Voorbeeld: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivars**: name geskei deur `;`. 'n Kultivar behou sy eie groottes en notas as die lêer wat jy ingevoer het dit gehad het.
- **Spesifikasienotas**.

{{ui:Dupliseer}} kopieer 'n ry onder 'n nuwe sleutel; {{ui:Stoor as CSV}} en {{ui:Stoor as 'n plantlêer}} skryf die lys uit (CSV-rye vir kultivars staan onder hul spesie, met `cultivar_of`). Die invoer van 'n CSV- of plantlêer voeg dit saam.

## Jou eie Biblioteek-plantlys

Meld aan by jou CadCraft-rekening (Instellings, Jou byvoegings, Meld aan) en die plantlys kan die lys gebruik wat jy in die Biblioteek hou:

- {{ui:Uit my biblioteeklys}} bring jou eie plant-items in (ook enige wat nog op nasiening wag). 'n Plant wat jy hier al het, word vanaf die Biblioteek opgedateer; die kultivars, verskafde groottes, digtheid en spesifikasie wat jy hier bygevoeg het, word behou.
- {{ui:Stoor as 'n plantlys}} stoor elke ry as jou eie Biblioteek-plant-item, een item per spesie: 'n nuwe plant is 'n nuwe item, 'n gewysigde plant is 'n nuwe weergawe, en 'n ongewysigde een bly onveranderd. Merk eers die blokkie: stoor gee die plante aan die publiek onder CC0. 'n Eerste openbare oplaai van 'n persoon wat nog nie vertrou word nie, word deur 'n persoon nagegaan voordat dit verskyn, soos elke oplaai.

Die Biblioteek hou die basiese plantrekord. Kultivars, verskafde groottes, digtheid en spesifikasienotas bly in die projek en in die plantlêer ({{ui:Stoor as 'n plantlêer}}); die dialoog sê elke keer wanneer jy stoor hoeveel rye dit raak.

## 'n Geplaaste plant noem 'n grootte

Kies 'n plant, 'n heining, of 'n mengry van 'n bed of beplante oppervlakte: wanneer die rekord kultivars of verskafde groottes het, kies {{ui:Kultivar en grootte}} een. Die plantskedule tel dan volgens spesie, kultivar en grootte, en 'n etiket kan hulle wys: `{botanical} '{cultivar}' {size}` of `{full}`.

## Plantsimbole volgens skaal

{{ui:Plantgrafika}} (Landskap › {{ui:Meer}}) stel in hoe plante in plan geteken word: **outomaties** (growwer as 1:500 'n sirkel by die spreiding, tussen 1:200 en 1:500 'n omtrek met sy middelpunt, fyner die gedetailleerde simbool; albei skale kan verander word) of een vlak vir elke skaal. Die Blaaie-dialoog het sy eie **Plantdetail in plan** vir daardie stel.

By 'n rekord in die Plante-afdeling lees {{ui:Eie simbool…}} 'n SVG, of 'n blok van 'n DXF/DWG-tekening, en teken dit by die plant se spreiding op die gedetailleerde vlak. {{ui:Eie 3D-model…}} lees 'n OBJ, STL of GLB; kies in Plantgrafika **Elke rekord se eie model** om dit in 3D te sien. Lêers het perke (512 KB SVG, 2000 vorms, 50 000 driehoeke) en word in die projek bewaar. SVG-transformasies word nie toegepas nie (jy word in kennis gestel as 'n lêer hulle het). Sien [Plantgrafika, jou eie simbole en 3D-plante](topic:plant-graphics) vir die vlakke, die perke en wat 'n GLB mag bevat.
