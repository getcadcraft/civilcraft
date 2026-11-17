---
title: Komunalne mreže i OpenStreetMap
summary: Dionice vode, kanalizacije, kišne kanalizacije, plina, struje i telekomunikacija s materijalom, dimenzijom, nadslojem i vlasnikom; OpenStreetMap podaci iz Overpass JSON datoteke; ukrštanja, presjeci rovova i zapremine; slojevi instalacija u DWG, DXF i PDF; IFC segmenti cijevi i kabela.
keywords: komunalno, komunalne, mreža, osm, openstreetmap, overpass, cijev, kabel, plin, kanalizacija, kišna, telekomunikacije, struja, voda, hidrant, šaht, rov, ukrštanje, slobodni razmak, nadsloj, dubina, dwg, ifc, georeferencirano, slojevi
from: 8a85dace
---

Nacrtajte podzemne instalacije lokacije kao jednu mrežu po instalaciji, provjerite gdje se ukrštaju i izvezite ih kao slojeve crteža i kao IFC.

## Pravljenje dionica

Otvori **Površ, Više, Komunalne mreže...**

- **Napravi dionicu iz odabira** pretvara odabranu os trase, liniju elementa ili cijev u dionicu instalacije koju odaberete. Zatim u tabeli upišite materijal, dimenziju (mm), nadsloj (dubina do vrha cijevi ili kabela) i vlasnika.
- **Učitaj OpenStreetMap podatke** učitava Overpass JSON datoteku koju ste spasili (upit s `out geom;`). Projekat prvo treba imati koordinatni sistem, jer su OpenStreetMap pozicije geografska širina i dužina. Cjevovodi (prema supstanci), podzemni električni i telekomunikacijski kablovi, hidranti, šahtovi i kišni kanali se učitavaju; sve ostalo se broji kao izostavljeno i to se navodi u poruci. Nadzemni vodovi se izostavljaju.
- **Dodaj OpenStreetMap kartu** dodaje OpenStreetMap kartu ispod plana. Crta se samo ako su slojevi karte s interneta uključeni u Postavkama.

## Provjere i izlazi

- **Ukrštanja**: dionice različitih instalacija koje se ukrštaju u planu navode se sa slobodnom visinom između njih gdje postoji površina terena; minimum je privremena vrijednost koju postavljate, a ne broj iz standarda.
- **Rov**: svaka dionica dobija rov (dimenzija cijevi plus slobodni razmak sa svake strane, nagib bočne strane, posteljica) sa zapreminom. Ukupno se prikazuje u prozoru i u CSV-u.
- **Crtež**: dionice i tačke su na slojevima instalacija (na primjer U-WATR-RUN, U-POWR-RUN), pa idu u PDF, DXF i DWG.
- **IFC**: dionice ulaze u IFC izvoz kao segmenti cijevi i segmenti kabela, sa hidrantima, ventilima i komorama, po jedan sistem za svaku instalaciju, u koordinatnom sistemu projekta.

## OpenStreetMap podaci

OpenStreetMap podaci su autorsko djelo OpenStreetMap saradnika i licencirani su pod ODbL. Navod o autorstvu dodaje se u crtež, CSV i IFC. Ako dijelite datoteku koja sadrži OpenStreetMap podatke, zadržite navod o autorstvu i pročitajte uslove licence o dijeljenju pod istim uslovima.

## Šta nije urađeno

Dionice se još ne crtaju tačku po tačku na planu alatom, a ukrštanja se još ne crtaju u prikazu profila (proračun je napravljen). Dubine, dimenzije i slobodni razmaci počinju kao privremene vrijednosti: koristite brojeve svog standarda.
