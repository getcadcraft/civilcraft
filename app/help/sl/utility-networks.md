---
title: Komunalna omrežja in OpenStreetMap
summary: Odseki vode, kanalizacije, meteornih vod, plina, elektrike in telekomunikacij z materialom, velikostjo, pokritostjo in lastnikom; podatki OpenStreetMap iz datoteke Overpass JSON; križanja, prečni prerezi jarkov in prostornine; sloji storitev v DWG, DXF in PDF; segmenti cevi in kablov v IFC.
keywords: komunalno, komunalne storitve, omrežje, osm, openstreetmap, overpass, cev, kabel, plin, kanalizacija, meteorna, telekomunikacije, elektrika, voda, hidrant, jašek, jarek, križanje, prosta višina, pokritost, globina, dwg, ifc, georeferencirano, sloji
from: 8a85dace
---

Narišite podzemne napeljave mesta kot ločeno omrežje za vsako storitev, preverite, kje se križajo, in jih pošljite ven kot sloje risbe in kot IFC.

## Ustvarjanje odsekov

Odprite **Površje, Več, Komunalna omrežja...**

- **Naredi odsek iz izbora** pretvori izbrano trasa, karakteristično črto ali cev v odsek izbrane storitve. Nato v tabeli izpolnite material, velikost (mm), pokritost (globina do vrha cevi ali kabla) in lastnika.
- **Preberi podatke OpenStreetMap** prebere datoteko Overpass JSON, ki ste jo shranili (poizvedba z `out geom;`). Projekt najprej potrebuje koordinatni sistem, ker so položaji v OpenStreetMap zemljepisna širina in dolžina. Preberejo se cevovodi (glede na snov), podzemni električni in telekomunikacijski kabli, hidranti, jaški in meteorni kanali. Vse drugo se šteje kot izpuščeno, kar je navedeno v sporočilu. Nadzemni vodi so izpuščeni.
- **Dodaj zemljevid OpenStreetMap** doda zemljevid OpenStreetMap pod tloris. Riše se le, če so v nastavitvah vklopljeni zemljevidni sloji iz interneta.

## Preverjanja in izhodi

- **Križanja**: odseki različnih storitev, ki se križajo v tlorisu, so navedeni s prosto višino med njimi, kjer obstaja površina terena; najmanjša vrednost je nadomestna vrednost, ki jo nastavite sami, ne število iz standarda.
- **Jarek**: vsak odsek dobi jarek (velikost cevi plus odmik na vsako stran, nagib brežine, posteljica) s prostornino. Skupna vrednost je prikazana v oknu in v CSV.
- **Risba**: odseki in točke so na slojih storitev (na primer U-WATR-RUN, U-POWR-RUN), zato pridejo v PDF, DXF in DWG.
- **IFC**: odseki gredo v izvoz IFC kot segmenti cevi in segmenti kablov, s hidranti, ventili in jaški, en sistem na storitev, v koordinatnem sistemu projekta.

## Podatki OpenStreetMap

Avtorske pravice do podatkov OpenStreetMap ima skupnost sodelavcev OpenStreetMap, podatki pa so licencirani pod ODbL. Navedba avtorja je dodana v risbo, CSV in IFC. Če delite datoteko, ki vsebuje podatke OpenStreetMap, ohranite navedbo avtorja in preberite pogoje licence o deljenju pod enakimi pogoji.

## Kaj še ni izdelano

Odseki še niso risani točko za točko na tlorisu z orodjem, križanja pa še niso risana v pogledu profila (izračun je pripravljen). Globine, velikosti in prosti odmiki so začetne nadomestne vrednosti: uporabite števila svojega standarda.
