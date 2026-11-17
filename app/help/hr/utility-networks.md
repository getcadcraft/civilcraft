---
title: Komunalne mreže i OpenStreetMap
summary: Dionice vodovoda, kanalizacije, oborinske odvodnje, plina, električne energije i telekomunikacija s materijalom, promjerom, nadslojem i vlasnikom; podaci OpenStreetMapa iz Overpass JSON datoteke; križanja, presjeci rovova i obujmi; slojevi instalacija u DWG, DXF i PDF; IFC segmenti cijevi i kabela.
keywords: komunalno, komunalne, mreža, osm, openstreetmap, overpass, cijev, kabel, plin, kanalizacija, oborinska, telekomunikacije, struja, voda, hidrant, revizijsko okno, rov, križanje, razmak, nadsloj, dubina, dwg, ifc, georeferencirano, slojevi
from: 8a85dace
---

Nacrtajte podzemne instalacije lokacije kao jednu mrežu po instalaciji, provjerite gdje se križaju i izvezite ih kao slojeve crteža i kao IFC.

## Izrada dionica

Otvorite **Teren, Više, Komunalne mreže...**

- **Izradi dionicu iz odabira** pretvara odabranu os trase, značajnu liniju ili cijev u dionicu odabrane instalacije. Zatim u tablici upišite materijal, promjer (mm), nadsloj (dubinu do vrha cijevi ili kabela) i vlasnika.
- **Učitaj podatke OpenStreetMapa** učitava Overpass JSON datoteku koju ste spremili (upit s `out geom;`). Projekt najprije treba koordinatni sustav, jer su položaji u OpenStreetMapu zemljopisna širina i dužina. Učitavaju se cjevovodi (prema tvari), podzemni elektroenergetski i telekomunikacijski kabeli, hidranti, revizijska okna i oborinski kanali. Sve ostalo se ne uvodi i to se navodi u poruci. Nadzemni vodovi se ne uvode.
- **Dodaj kartu OpenStreetMapa** dodaje kartu OpenStreetMapa ispod tlocrta. Crta se samo dok su slojevi karte s interneta uključeni u postavkama.

## Provjere i izlazi

- **Križanja**: dionice različitih instalacija koje se u tlocrtu križaju navode se sa slobodnom visinom između njih tamo gdje postoji površina terena; najmanja vrijednost je privremena vrijednost koju postavljate vi, a nije broj iz norme.
- **Rov**: svaka dionica dobiva rov (promjer cijevi plus razmak sa svake strane, nagib pokosa, posteljica) s obujmom. Ukupno se prikazuje u prozoru i u CSV datoteci.
- **Crtež**: dionice i točke nalaze se na slojevima instalacija (na primjer U-WATR-RUN, U-POWR-RUN), pa dolaze u PDF, DXF i DWG.
- **IFC**: dionice ulaze u IFC izvoz kao segmenti cijevi i segmenti kabela, s hidrantima, ventilima i oknima, po jedan sustav za svaku instalaciju, u koordinatnom sustavu projekta.

## Podaci OpenStreetMapa

Podaci OpenStreetMapa autorsko su djelo suradnika OpenStreetMapa i licencirani su pod ODbL licencom. Navođenje autora dodaje se u crtež, CSV i IFC. Ako dijelite datoteku koja sadrži podatke OpenStreetMapa, zadržite navođenje autora i pročitajte uvjete licence o dijeljenju pod istim uvjetima.

## Što nije gotovo

Dionice se još ne crtaju točku po točku u tlocrtu alatom, a križanja se još ne crtaju u uzdužnom profilu (izračun je izrađen). Dubine, promjeri i razmaci počinju kao privremene vrijednosti: koristite brojke iz vaše norme.
