---
title: Komunalne mreže i OpenStreetMap
summary: Trase vode, kanalizacije, atmosferske odvodnje, gasa, struje i telekomunikacija sa materijalom, prečnikom, nadslojem i vlasnikom; podaci OpenStreetMap iz Overpass JSON datoteke; ukrštanja, preseci rova i zapremine; slojevi servisa u DWG, DXF i PDF; IFC segmenti cevi i kablova.
keywords: komunalna, mreža, komunalne, osm, openstreetmap, overpass, cev, kabl, gas, kanalizacija, atmosferska, telekomunikacije, struja, voda, hidrant, šaht, rov, ukrštanje, slobodan razmak, nadsloj, dubina, dwg, ifc, georeferencirano, slojevi
from: 8a85dace
---

Nacrtajte podzemne instalacije lokacije kao jednu mrežu po servisu, proverite gde se ukrštaju i izvezite ih kao slojeve crteža i kao IFC.

## Pravljenje trasa

Otvorite **Površ, Više, Komunalne mreže...**

- **Napravi trasu od izbora** pretvara izabranu osovinu, liniju elementa ili cev u trasu servisa koji izaberete. Zatim u tabeli popunite materijal, prečnik (mm), nadsloj (dubina do vrha cevi ili kabla) i vlasnika.
- **Učitaj podatke OpenStreetMap** učitava Overpass JSON datoteku koju ste sačuvali (upit sa `out geom;`). Projekat prvo treba da ima koordinatni sistem, jer su pozicije u OpenStreetMap geografska širina i dužina. Čitaju se cevovodi (prema supstanci), podzemni električni i telekomunikacioni kablovi, hidranti, šahtovi i atmosferske odvodnje; sve ostalo se broji kao izostavljeno i to se navodi u poruci. Nadzemni vodovi se izostavljaju.
- **Dodaj kartu OpenStreetMap** dodaje kartu OpenStreetMap ispod osnove. Crta se samo ako su slojevi karata sa interneta uključeni u Podešavanjima.

## Provere i izlazi

- **Ukrštanja**: trase različitih servisa koje se seku u osnovi navode se sa slobodnom visinom između njih ako postoji površ terena; minimum je privremena vrednost koju podešavate, a ne broj iz standarda.
- **Rov**: svaka trasa dobija rov (prečnik cevi plus slobodan razmak sa svake strane, nagib kosine, posteljina) sa zapreminom. Ukupno se prikazuje u prozoru i u CSV datoteci.
- **Crtež**: trase i tačke su na slojevima servisa (na primer U-WATR-RUN, U-POWR-RUN), pa stižu u PDF, DXF i DWG.
- **IFC**: trase ulaze u IFC izvoz kao segmenti cevi i segmenti kablova, sa hidrantima, ventilima i oknima, po jedan sistem za svaki servis, u koordinatnom sistemu projekta.

## Podaci OpenStreetMap

Podaci OpenStreetMap su autorsko pravo OpenStreetMap saradnika i licencirani su pod ODbL. Navođenje izvora se dodaje na crtež, u CSV datoteku i u IFC. Ako delite datoteku koja sadrži podatke OpenStreetMap, zadržite navođenje izvora i pročitajte uslove deljenja pod istim uslovima iz licence.

## Šta nije urađeno

Trase još nisu crtane tačku po tačku na osnovi alatkom, a ukrštanja još nisu prikazana u pogledu profila (proračun je napravljen). Dubine, prečnici i slobodni razmaci počinju kao privremene vrednosti: koristite brojke vašeg standarda.
